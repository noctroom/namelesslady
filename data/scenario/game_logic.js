// 監視カメラゲーム ロジック

(function() {

    /**
     * SurveillanceGame
     * ゲーム全体のロジックを管理するネームスペース
     */
    const SurveillanceGame = {
        // --- 状態管理 ---
        state: {
            currentRoom: 'r1',
            minute: 0,
            second: 0,
            rooms: {
                'r1': { name: 'Laboratory', image: 'r1_room.jpg' },
                'r2': { name: 'Hall', image: 'r2_room.jpg' },
                'r3': { name: 'Basement', image: 'r3_room.jpg' },
                'r4': { name: '2F room', image: 'r4_room.jpg' },
                'r5': { name: 'Underground', image: 'r5_room.jpg' }
            },
            timerInterval: null,
            cameraLockInterval: null, // カメラロック監視インターバルID用
            isGunMode: false,
            zoomLevel: 1, // 1: 1.0x, 2: 1.3x, 3: 1.8x
            drag: {
                isDragging: false,
                startX: 0,
                startY: 0,
                offsetX: 0,
                offsetY: 0
            },
            bullets: {
                'r1': 5, 'r2': 5, 'r3': 5, 'r4': 5, 'r5': 5
            },
            flags: {
                'r5_safe': false,
            },
            processedEvents: new Set(),
            pendingTimeouts: {},
            initialJumpTime: 0,
            cameraLockedUntil: 0,
            isGameOver: false,
            lastMouseCoords: { x: 640, y: 360 } // デフォルトは画面中央
        },

        // --- タイマー管理レジストリ ---
        timer: {
            activeTimeouts: [],
            activeIntervals: [],
            setTimeout(func, delay) {
                const id = setTimeout(() => {
                    this.activeTimeouts = this.activeTimeouts.filter(x => x !== id);
                    func();
                }, delay);
                this.activeTimeouts.push(id);
                return id;
            },
            setInterval(func, delay) {
                const id = setInterval(func, delay);
                this.activeIntervals.push(id);
                return id;
            },
            clearAll() {
                this.activeTimeouts.forEach(id => clearTimeout(id));
                this.activeIntervals.forEach(id => clearInterval(id));
                this.activeTimeouts = [];
                this.activeIntervals = [];
            }
        },

        // --- ユーティリティ ---
        utils: {
            /**
             * 部屋画像パスの解決 (フォルダ名省略対応)
             */
            resolveImagePath(roomID, image) {
                if (!image) return "";
                if (image.includes('/') || image === "sandstorm.jpg") {
                    return image;
                }
                return roomID + '/' + image;
            },

            /**
             * マウス座標をゲーム内座標(1280x720)に変換
             */
            getGameCoords(e) {
                const $base = $('.tyrano_base');
                if ($base.length === 0) return { x: e.clientX, y: e.clientY };
                
                const rect = $base[0].getBoundingClientRect();
                const scaleX = rect.width > 0 ? 1280 / rect.width : 1;
                const scaleY = rect.height > 0 ? 720 / rect.height : 1;
                
                return {
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY
                };
            },

            /**
             * 時間文字列を秒数に変換 (例: "1:30" -> 90)
             */
            parseTimeToSeconds(time) {
                if (typeof time === 'number') return time;
                if (typeof time === 'string' && time.includes(':')) {
                    const parts = time.split(':');
                    const minutes = parseInt(parts[0], 10) || 0;
                    const seconds = parseInt(parts[1], 10) || 0;
                    return minutes * 60 + seconds;
                }
                return parseInt(time, 10) || 0;
            },

            /**
             * 注視判定：現在の中心範囲に対象が入っているかを判定
             */
            isWatchingTarget(roomID, event) {
                const { state } = SurveillanceGame;
                if (!event || !event.shootArea) return false;
                if (state.currentRoom !== roomID || state.zoomLevel === 1) return false;

                let scale = 1.0;
                if (state.zoomLevel === 2) scale = 1.3;
                if (state.zoomLevel === 3) scale = 1.8;
                const tx = state.drag.offsetX;
                const ty = state.drag.offsetY;

                const watchW = 600;
                const watchH = 400;
                const wsX = 640 - watchW / 2;
                const wsY = 360 - watchH / 2;
                const weX = 640 + watchW / 2;
                const weY = 360 + watchH / 2;

                let ixStart = (wsX - 640 - tx) / scale + 640;
                let iyStart = (wsY - 360 - ty) / scale + 360;
                let ixEnd = (weX - 640 - tx) / scale + 640;
                let iyEnd = (weY - 360 - ty) / scale + 360;

                // 反転状態を考慮
                const roomData = state.rooms[roomID];
                if (roomData.isMirror) {
                    const tmp = ixStart;
                    ixStart = 1280 - ixEnd;
                    ixEnd = 1280 - tmp;
                }
                if (roomData.isUpsideDown) {
                    const tmp = iyStart;
                    iyStart = 720 - iyEnd;
                    iyEnd = 720 - tmp;
                }

                const areas = Array.isArray(event.shootArea) ? event.shootArea : [event.shootArea];
                return areas.some(area => {
                    const aX1 = area.x;
                    const aY1 = area.y;
                    const aX2 = area.x + area.w;
                    const aY2 = area.y + area.h;
                    return !(ixEnd < aX1 || ixStart > aX2 || iyEnd < aY1 || iyStart > aY2);
                });
            }
        },

        // --- サウンド管理 ---
        sound: {
            play(storage, buf = "1", options = {}) {
                if (typeof TYRANO === 'undefined' || !TYRANO.kag.ftag) return;

                // erosion.ogg の再生制限：部屋３の2:00の腐食イベント中かつ未撃退時のみ再生を許可する
                if (storage === 'erosion.ogg') {
                    const state = SurveillanceGame.state;
                    const r3 = state.rooms['r3'];
                    let allowPlay = false;
                    if (r3 && !r3.isDead && !r3.hasHitTarget) {
                        const totalSeconds = state.minute * 60 + state.second;
                        const activeEvent = SurveillanceGame.engine.getActiveEvent('r3', totalSeconds);
                        if (activeEvent && activeEvent.loopSe === 'erosion.ogg') {
                            const evSec = activeEvent.defTime !== undefined ? activeEvent.defTime : SurveillanceGame.utils.parseTimeToSeconds(activeEvent.time);
                            if (evSec === 120) {
                                allowPlay = true;
                            }
                        }
                    }
                    if (!allowPlay) {
                        console.log("[SoundGuard] Blocked playing erosion.ogg outside its designated time/state.");
                        return;
                    }
                }

                const tagOptions = { storage, buf, ...options };
                TYRANO.kag.ftag.startTag("playse", tagOptions);
            },
            stop(storage) {
                if (typeof TYRANO === 'undefined' || !TYRANO.kag.ftag) return;

                // 現在再生中のSE情報を走査し、指定されたファイル名（storage）に一致するバッファ番号を特定して停止する
                const currentSe = TYRANO.kag.stat.current_se;
                if (currentSe) {
                    for (const buf in currentSe) {
                        if (currentSe[buf] && currentSe[buf].storage === storage) {
                            TYRANO.kag.ftag.startTag("stopse", { buf: buf });
                        }
                    }
                }

                // 従来のフォールバック処理も残す
                TYRANO.kag.ftag.startTag("stopse", { storage });
            },
            stopBuffer(buf) {
                if (typeof TYRANO === 'undefined' || !TYRANO.kag.ftag) return;
                TYRANO.kag.ftag.startTag("stopse", { buf });
            },
            playHover() {
                this.play("hover.ogg", "2");
            }
        },

        // --- UI管理 ---
        ui: {
            isChatTyping: false,
            isSystemMessageTyping: false,
            chatInterval: null,
            systemTimer: null,
            finishChatFunc: null,
            finishSystemFunc: null,

            updateClock() {
                const { state } = SurveillanceGame;
                $('#hud-clock').text(`${String(state.minute).padStart(2, '0')}:${String(state.second).padStart(2, '0')}`);
            },

            /**
             * HUDの初期化（フェーズ1: レイアウト生成のみ）
             */
            initLayout() {
                const { state, utils, sound, engine } = SurveillanceGame;
                
                // ゲーム開始前の安全かつ完全なクリーンアップを実行
                engine.cleanup();

                // 各部屋のステート（死亡状態、通常画像等）を初期化
                engine.initRooms();

                // タイマーや背景の初期値をTyranoScriptから取得
                if (typeof TYRANO !== 'undefined' && TYRANO.kag.variable.tf) {
                    const tf = TYRANO.kag.variable.tf;

                    // リトライ時にデバッグモードと当たり判定表示が無効化されるのを完全に防止
                    tf.debug_mode = tf.debug_mode !== undefined ? tf.debug_mode : false;
                    tf.show_hit_zone = tf.show_hit_zone !== undefined ? tf.show_hit_zone : false;

                    if (tf.start_room && state.rooms[tf.start_room]) {
                        state.currentRoom = tf.start_room;
                    }

                    if (tf.debug_all_dead) {
                        Object.keys(state.rooms).forEach(id => {
                            state.rooms[id].isDead = true;
                        });
                    }
                    
                    if (tf.debug_all_alive) {
                        Object.keys(state.rooms).forEach(id => {
                            state.rooms[id].isDead = false;
                        });
                    }

                    const roomData = state.rooms[state.currentRoom];
                    const bgPath = utils.resolveImagePath(state.currentRoom, roomData ? roomData.image : "r1_room.jpg");
                    tf.initial_bg_path = "../fgimage/" + (bgPath || "r1/r1_room.jpg");
                    
                    if (tf.start_time && typeof tf.start_time === 'string' && tf.start_time.includes(':')) {
                        const parts = tf.start_time.split(':');
                        state.minute = parseInt(parts[0], 10) || 0;
                        state.second = parseInt(parts[1], 10) || 0;
                    } else {
                        state.minute = parseInt(tf.start_minute) || 0;
                        state.second = parseInt(tf.start_second) || 0;
                    }
                    state.initialJumpTime = state.minute * 60 + state.second;
                }

                if ($('#hud-container').length > 0) {
                    if ($('#hud-chat-log').length > 0) {
                        return;
                    } else {
                        $('#hud-container').remove();
                    }
                }

                const hudHtml = `
                    <div id="hud-container">
                        <div id="hud-noise"></div>
                        <div id="hud-sandstorm"></div>
                        <div id="hud-crt"></div>
                        <div id="hud-frame"></div>
                        <div id="hud-overlay"></div>
                        <div id="hud-chat-log"></div>

                        <div class="hud-time hud-active-ui" style="display:none">
                            <div id="hud-clock">${String(state.minute).padStart(2, '0')}:${String(state.second).padStart(2, '0')}</div>
                        </div>
                        <div class="hud-cam-info hud-active-ui" style="display:none">
                            <span id="hud-cam-id">CAM ${state.currentRoom.replace('r', '')}</span> / <span id="hud-cam-name">${state.rooms[state.currentRoom].name}</span>
                        </div>
                        <div id="hud-nav" class="hud-active-ui" style="display:none">
                            <button class="nav-btn ${state.currentRoom === 'r1' ? 'active' : ''}" onclick="changeRoom('r1')" onmouseenter="window.playHoverSound()">CAM 1</button>
                            <button class="nav-btn ${state.currentRoom === 'r2' ? 'active' : ''}" onclick="changeRoom('r2')" onmouseenter="window.playHoverSound()">CAM 2</button>
                            <button class="nav-btn ${state.currentRoom === 'r3' ? 'active' : ''}" onclick="changeRoom('r3')" onmouseenter="window.playHoverSound()">CAM 3</button>
                            <button class="nav-btn ${state.currentRoom === 'r4' ? 'active' : ''}" onclick="changeRoom('r4')" onmouseenter="window.playHoverSound()">CAM 4</button>
                            <button class="nav-btn ${state.currentRoom === 'r5' ? 'active' : ''}" onclick="changeRoom('r5')" onmouseenter="window.playHoverSound()">CAM 5</button>
                        </div>
                        <div id="hud-gun-btn-container" class="hud-active-ui" style="display:none">
                            <button id="gun-btn" onclick="toggleGunMode()" onmouseenter="window.playHoverSound()">
                                <img src="data/fgimage/material/icon_gun.png" alt="gun icon" class="gun-icon">
                            </button>
                        </div>
                        <div id="hud-bullets-container" class="hud-active-ui" style="display:none"></div>
                        <div id="hud-zoom-btn-container" class="hud-active-ui" style="display:none">
                            <div id="hud-zoom-controls">
                                <button id="zoom-in-btn" class="zoom-btn" onclick="changeZoom(1)" onmouseenter="window.playHoverSound()">
                                    <img src="data/fgimage/material/icon_zoomin.png" alt="zoom in" class="zoom-icon">
                                </button>
                                <button id="zoom-out-btn" class="zoom-btn" onclick="changeZoom(-1)" onmouseenter="window.playHoverSound()">
                                    <img src="data/fgimage/material/icon_zoomout.png" alt="zoom out" class="zoom-icon">
                                </button>
                            </div>
                        </div>
                        <div id="hud-crosshair"></div>
                        <div id="gun-trigger-layer" onclick="fireGun(event)"></div>

                        <div id="debug-branch-indicator" class="debug-branch-indicator" style="display:none">
                            !! BRANCH ROUTE !!
                        </div>
                    </div>
                `;
                $('.tyrano_base').append(hudHtml);
                
                $(document).on('mousemove', (e) => {
                    const coords = utils.getGameCoords(e);
                    state.lastMouseCoords = coords;
                    if (!state.isGunMode) return;
                    const $crosshair = $('#hud-crosshair');
                    const offset = $crosshair.width() / 2 || 75;
                    $crosshair.css({ left: coords.x - offset, top: coords.y - offset });
                });

                this.updateZoomButtons();
                this.updateBulletsUI();
                engine.initDragEvents();
            },

            /**
             * チャットメッセージの追加
             */
            addChatMessage(name, text, color = "#00ff41", isAppend = false) {
                const $log = $('#hud-chat-log');
                if ($log.length === 0) return Promise.resolve();

                let $textContainer;
                if (isAppend) {
                    $textContainer = $log.find('.chat-item:last .chat-text');
                    if ($textContainer.length > 0) {
                        $textContainer.append('<br>');
                    } else {
                        return this.addChatMessage(name, text, color, false);
                    }
                } else {
                    SurveillanceGame.sound.play("transceiver.ogg", "5");
                    $log.find('.chat-item').css('opacity', '0.6');

                    const chatHtml = `
                        <div class="chat-item">
                            <span class="chat-name">${name}:</span>
                            <span class="chat-text"></span>
                        </div>
                    `;
                    const $item = $(chatHtml);
                    $textContainer = $item.find('.chat-text');
                    $log.append($item);
                }
                
                return new Promise((resolve) => {
                    this.isChatTyping = true;
                    let i = 0;
                    const speed = 15;

                    this.chatInterval = setInterval(() => {
                        if (i < text.length) {
                            $textContainer.append(text.charAt(i));
                            i++;
                            $log.scrollTop($log[0].scrollHeight);
                        } else {
                            cleanup();
                        }
                    }, speed);

                    this.finishChatFunc = () => {
                        if (!this.isChatTyping) return;
                        clearInterval(this.chatInterval);
                        $textContainer.append(text.substring(i));
                        $log.scrollTop($log[0].scrollHeight);
                        cleanup();
                    };

                    const cleanup = () => {
                        clearInterval(this.chatInterval);
                        this.isChatTyping = false;
                        this.finishChatFunc = null;
                        resolve();
                    };
                });
            },

            finishChatTyping() {
                if (typeof this.finishChatFunc === 'function') this.finishChatFunc();
            },

            clearSystemMessage() {
                if (this.systemTimer) {
                    clearInterval(this.systemTimer);
                    this.systemTimer = null;
                }
                $('#hud-system-message').remove();
            },

            clearChatLog() {
                $('#hud-chat-log').empty();
                this.clearSystemMessage();
            },

            /**
             * システムメッセージの表示
             */
            showSystemMessage(name, text, color = "#00ff41", type = "report") {
                if (this.systemTimer) {
                    if (this.finishSystemFunc) this.finishSystemFunc();
                }
                
                let $msg = $('#hud-system-message');
                let $textContainer;

                if ($msg.length > 0 && (!name || $msg.find('.sys-name').text() === name) && type === "report") {
                    $textContainer = $msg.find('.sys-text');
                    $textContainer.empty();
                } else {
                    $('#hud-system-message').remove();
                    const html = type === "staff" ? `
                        <div id="hud-system-message" class="sys-staff">
                            <div class="sys-staff-role">${name}</div>
                            <div class="sys-text"></div>
                        </div>
                    ` : `
                        <div id="hud-system-message">
                            <div class="sys-name">${name}</div>
                            <div class="sys-text"></div>
                        </div>
                    `;
                    $msg = $(html);
                    $textContainer = $msg.find('.sys-text');
                    
                    let $container = $('#hud-container');
                    if ($container.length === 0) {
                        $container = $('<div id="hud-container" style="display:block; background:transparent;"></div>');
                        $('.tyrano_base').append($container);
                    }
                    $container.append($msg).show();
                }

                if (typeof TYRANO !== 'undefined' && type !== "staff") {
                    SurveillanceGame.sound.play("transceiver.ogg", "5");
                }

                if (type === "staff") {
                    $textContainer.text(text);
                    return Promise.resolve();
                }

                return new Promise((resolve) => {
                    this.isSystemMessageTyping = true;
                    let i = 0;
                    const speed = (type === "staff") ? 80 : 40;

                    const cleanup = () => {
                        if (this.systemTimer) clearInterval(this.systemTimer);
                        this.systemTimer = null;
                        this.finishSystemFunc = null;
                        this.isSystemMessageTyping = false;
                        resolve();
                    };

                    this.finishSystemFunc = () => {
                        if (!this.isSystemMessageTyping) return;
                        $textContainer.text(text);
                        cleanup();
                    };

                    this.systemTimer = setInterval(() => {
                        if (i < text.length) {
                            $textContainer.append(text.charAt(i));
                            i++;
                        } else {
                            cleanup();
                        }
                    }, speed);
                });
            },

            finishSystemMessageTyping() {
                if (typeof this.finishSystemFunc === 'function') this.finishSystemFunc();
            },

            updateBulletsUI() {
                const { state } = SurveillanceGame;
                const $container = $('#hud-bullets-container');
                if ($container.length === 0) return;

                const count = state.bullets[state.currentRoom];
                let html = '';
                for (let i = 0; i < 5; i++) {
                    const isSpent = i < (5 - count);
                    html += `<img src="data/fgimage/material/icon_bullet.png" class="bullet-icon ${isSpent ? 'spent' : ''}" alt="bullet">`;
                }
                $container.html(html);
            },

            updateZoomButtons() {
                const { state } = SurveillanceGame;
                const $inBtn = $('#zoom-in-btn');
                const $outBtn = $('#zoom-out-btn');
                if ($inBtn.length === 0) return;

                $inBtn.prop('disabled', state.zoomLevel >= 3).toggleClass('disabled', state.zoomLevel >= 3);
                $outBtn.prop('disabled', state.zoomLevel <= 1).toggleClass('disabled', state.zoomLevel <= 1);
            }
        },




        // --- ゲームエンジン ---
        engine: {
            /**
             * ゲーム全体のクリーンアップ（リトライ・初期化時用）
             */
            cleanup() {
                const { state, timer } = SurveillanceGame;

                // 1. ゲームタイマー・全インターバルを安全に停止
                if (state.timerInterval) {
                    clearInterval(state.timerInterval);
                    state.timerInterval = null;
                }
                if (state.cameraLockInterval) {
                    clearInterval(state.cameraLockInterval);
                    state.cameraLockInterval = null;
                }
                if (window.titleBgInterval) {
                    clearInterval(window.titleBgInterval);
                    window.titleBgInterval = null;
                }
                timer.clearAll(); // レジストリに登録されたタイマーを一括削除

                // 2. HUD・ダイアログなどのDOM要素を完全削除
                $('#hud-container').remove();
                $('#hud-container-title').remove();
                $('#hud-system-message').remove();
                $('#staff-blocker').remove();
                $('#staff-skip-btn').remove();

                // 3. 画面演出クラスのクリア
                $('.tyrano_base, #tyrano_base').removeClass('is-upside-down is-mirror is-panning crt-turn-off is-strong-noise');
                $('.layer_camera').removeClass('is-blurred-penalty');

                // 4. レイヤーの再表示と背景画像のクリア
                $('[class^="layer_"]').show();
                $('#root_layer_game').show();
                $('.base_foreground').show();
                $('.layer_base, .base_fore').empty().css('background-image', 'none');

                // 5. ズーム/トランスフォームのリセット
                $('#root_layer_game').css({
                    'transform': 'translate(0px, 0px) scale(1)',
                    'transition': 'none',
                    'transform-origin': 'center center'
                });
                if (typeof TYRANO !== 'undefined' && TYRANO.kag && TYRANO.kag.base) {
                    TYRANO.kag.base.fitBaseSize(TYRANO.kag.config.scWidth, TYRANO.kag.config.scHeight);
                    // iPad Safari can settle its viewport after the retry tap, so refit after that late change too.
                    setTimeout(() => {
                        TYRANO.kag.base.fitBaseSize(TYRANO.kag.config.scWidth, TYRANO.kag.config.scHeight);
                    }, 700);
                    setTimeout(() => {
                        TYRANO.kag.base.fitBaseSize(TYRANO.kag.config.scWidth, TYRANO.kag.config.scHeight);
                    }, 1200);
                }

                // 6. ゲーム中のSEをすべて停止
                if (typeof TYRANO !== 'undefined' && TYRANO.kag.ftag) {
                    for (let bufIdx = 1; bufIdx <= 9; bufIdx++) {
                        TYRANO.kag.ftag.startTag("stopse", { buf: String(bufIdx) });
                    }
                }

                // 7. 部屋３独立監視システムのリセット
                if (window.r3IsolatedSystem) {
                    window.r3IsolatedSystem.timer = 0;
                    window.r3IsolatedSystem.triggered = false;
                }

                // 8. gameState (state) の完全リセット
                state.isGameOver = false;
                state.isGunMode = false;
                state.zoomLevel = 1;
                state.currentRoom = 'r1';
                state.minute = 0;
                state.second = 0;
                state.cameraLockedUntil = 0;
                state.bullets = { r1: 5, r2: 5, r3: 5, r4: 5, r5: 5 };
                state.flags = { r5_safe: false };
                state.processedEvents = new Set();
                state.pendingTimeouts = {};
                state.drag = { isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 };

                // 9. 各部屋のステート（死亡状態、通常画像等）を初期化
                this.initRooms();

                console.log("[SurveillanceGame] Complete cleanup executed successfully.");
            },

            /**
             * 監視開始
             */
            /**
             * 全室の状態を初期化
             */
            initRooms() {
                const { state } = SurveillanceGame;
                Object.keys(state.rooms).forEach(id => {
                    const room = state.rooms[id];
                    Object.assign(room, {
                        isDead: false, isBranchActive: false, awayTimer: 0,
                        pendingAwayJump: null, activeTrap: null, trapTimer: 0,
                        randomRepeat: null, hasHitTarget: false,
                        everHit: false, // 1発でも被弾した履歴を永続保持
                        isUpsideDown: false, isMirror: false,
                        flickerId: 0, hasWatchedThisEvent: false,
                        isJumping: false,
                        damageTimer: 0, // 部屋３専用：被弾ダメージ復帰タイマー
                        image: id + '_room.jpg' // 初期画像にリセット
                    });
                });
            },
            
            async start() {
                const { state, ui, utils, engine } = SurveillanceGame;
                
                this.initRooms();
                if ($('#hud-container').length === 0) ui.initLayout();

                // 部屋３独立監視システムの初期化
                window.r3IsolatedSystem = {
                    timer: 0,
                    triggered: false
                };

                $('.hud-active-ui').fadeIn(300);
                this.startTimer();
                
                // イベント登録
                this.initInputEvents();
                this.initCameraLockWatcher();

                TYRANO.kag.ftag.startTag("camera", { zoom: "1", time: "0", wait: "false" });
                state.processedEvents = new Set();
                
                await this.loadRoomEvents();

                // 全イベントに定義時の秒数 (defTime) を保存
                if (window.roomEvents) {
                    Object.keys(window.roomEvents).forEach(roomID => {
                        window.roomEvents[roomID].forEach(e => {
                            if (e.time != null && e.defTime == null) {
                                e.defTime = utils.parseTimeToSeconds(e.time);
                            }
                        });
                    });
                }

                this.preloadAllImages();
                this.applyDebugBranch();
                this.checkRoomEvents();

                // デバッグ：全滅チェック
                if (typeof TYRANO !== 'undefined' && TYRANO.kag.variable.tf && TYRANO.kag.variable.tf.debug_all_dead) {
                    this.terminateGame("*game_over");
                    return;
                }
                console.log("[Surveillance] System active. Timer started. All states reset.");
            },

            initInputEvents() {
                const { state } = SurveillanceGame;
                $(document).off('contextmenu').on('contextmenu', (e) => {
                    if (state.isGameOver) return;
                    if (state.isGunMode) {
                        e.preventDefault();
                        this.toggleGunMode();
                    }
                });

                $(document).off('keydown.gun').on('keydown.gun', (e) => {
                    if (state.isGameOver) return;
                    const key = e.key.toLowerCase();
                    if (key === 'f' && $('#hud-gun-btn-container').is(':visible')) this.toggleGunMode();
                    if ((key === 'q' || e.key === '-' || e.key === 'Subtract') && $('#hud-zoom-btn-container').is(':visible')) this.changeZoom(-1);
                    if ((key === 'e' || e.key === '+' || e.key === 'Add') && $('#hud-zoom-btn-container').is(':visible')) this.changeZoom(1);
                    if (e.key >= '1' && e.key <= '5' && $('#hud-nav').is(':visible')) {
                        this.changeRoom('r' + e.key);
                        $(`.nav-btn:contains('CAM ${e.key}')`).blur();
                        if (document.activeElement) document.activeElement.blur();
                    }

                    // --- Debug Controls ---
                    const isShift = e.shiftKey;
                    const tf = (typeof TYRANO !== 'undefined') ? TYRANO.kag.variable.tf : {};

                    // Shift + D: Toggle Debug Mode
                    if (isShift && key === 'd') {
                        this.toggleDebugMode();
                    }

                    // Debug mode only shortcuts
                    if (tf.debug_mode) {
                        if (key === 't') this.advanceTime(10);
                        if (key === 'y') this.advanceTime(5);
                    }
                });
            },

            initCameraLockWatcher() {
                const { state } = SurveillanceGame;
                if (state.cameraLockInterval) {
                    clearInterval(state.cameraLockInterval);
                }
                state.cameraLockInterval = SurveillanceGame.timer.setInterval(() => {
                    const totalSeconds = state.minute * 60 + state.second;
                    if (state.cameraLockedUntil > totalSeconds && state.currentRoom === 'r4') {
                        $('.layer_camera').addClass('is-blurred-penalty');
                    } else {
                        $('.layer_camera').removeClass('is-blurred-penalty');
                    }
                }, 100);
            },

            initDragEvents() {
                const { state, ui } = SurveillanceGame;
                const $hud = $('#hud-container');

                $hud.on('mousedown', (e) => {
                    if (state.isGameOver) return;
                    if (state.zoomLevel > 1 && !$(e.target).closest('button, #hud-zoom-btn-container, #hud-gun-btn-container, #hud-nav').length) {
                        state.drag.isDragging = true;
                        state.drag.startX = e.clientX;
                        state.drag.startY = e.clientY;
                        $hud.addClass('is-panning');
                        SurveillanceGame.sound.play("move.ogg", "1", { loop: "true", clear: "true" });
                        e.preventDefault();
                    }
                });

                $(document).on('mousemove', (e) => {
                    if (!state.drag.isDragging) return;
                    const dx = e.clientX - state.drag.startX;
                    const dy = e.clientY - state.drag.startY;
                    state.drag.startX = e.clientX;
                    state.drag.startY = e.clientY;
                    this.updateOffset(dx, dy);
                });

                $(document).on('mouseup', () => {
                    if (state.drag.isDragging) {
                        state.drag.isDragging = false;
                        $hud.removeClass('is-panning');
                        SurveillanceGame.sound.stop("move.ogg");
                    }
                });
            },

            /**
             * ルーム変更
             */
            changeRoom(roomID) {
                const { state, ui, utils, sound } = SurveillanceGame;
                const oldRoomID = state.currentRoom;
                if (oldRoomID === roomID) return;
                
                ui.clearSystemMessage();
                sound.stopBuffer("6"); // 各部屋で設定されたSEを中断
                if (state.isGunMode) this.toggleGunMode(null, true);
                
                state.currentRoom = roomID;
                const roomData = state.rooms[roomID];

                // UI更新
                $('#hud-cam-id').text('CAM ' + roomID.replace('r', ''));
                $('#hud-cam-name').text(roomData.name);
                $('.nav-btn').removeClass('active');
                $(`.nav-btn:contains('CAM ${roomID.replace('r', '')}')`).addClass('active').blur();

                $('#hud-noise').css('background-image', '').show();
                SurveillanceGame.timer.setTimeout(() => $('#hud-noise').fadeOut(100), 30);

                const bgStorage = `../fgimage/${utils.resolveImagePath(roomID, roomData.image)}`;
                TYRANO.kag.variable.tf.next_bg = bgStorage;
                TYRANO.kag.ftag.startTag("bg", { storage: bgStorage, time: 100, wait: "false" });

                state.zoomLevel = 1;
                state.drag.offsetX = 0;
                state.drag.offsetY = 0;
                this.applyZoom(true);
                ui.updateZoomButtons();
                ui.updateBulletsUI();

                this.checkAwayDeath(oldRoomID);
                this.resetAwayJump(roomID);



                this.updateRoomEffects(roomID);
                this.updateDebugBranchIndicator();

                // ループSEの再開
                const totalSeconds = state.minute * 60 + state.second;
                const activeEvent = this.getActiveEvent(roomID, totalSeconds);
                if (activeEvent && activeEvent.loopSe) {
                    // 部屋３でターゲットに命中している場合は erosion.ogg を再生しない
                    const isR3ErosionHit = (roomID === 'r3' && activeEvent.loopSe === 'erosion.ogg' && state.rooms['r3'].hasHitTarget);
                    if (!isR3ErosionHit) {
                        sound.play(activeEvent.loopSe, "6", { loop: "true" });
                    }
                }

                const se = (roomData.isDead && !roomData.isEscaped) ? "noise.ogg" : "monitanoizu01.ogg";
                sound.play(se, "5");
                this.updateDebugHitZoneDisplay();
                this.checkClearFlag(roomID);
            },

            checkAwayDeath(oldRoomID) {
                const { state } = SurveillanceGame;
                const activeTrapEvent = state.rooms[oldRoomID].activeTrapEvent;
                if (activeTrapEvent && activeTrapEvent.awayDeath && !state.rooms[oldRoomID].isDead) {
                    const events = window.roomEvents[oldRoomID];
                    const deathEvent = events ? events.find(e => e.id === activeTrapEvent.awayDeath) : null;
                    if (deathEvent) {
                        this.triggerEvent(oldRoomID, deathEvent, state.minute * 60 + state.second);
                    } else if (!(typeof TYRANO !== 'undefined' && TYRANO.kag.variable.tf.debug_all_alive)) {
                        state.rooms[oldRoomID].isDead = true;
                    }
                }
            },

            resetAwayJump(roomID) {
                const { state } = SurveillanceGame;
                if (state.rooms[roomID].pendingAwayJump) {
                    if (state.rooms[roomID].awayTimer > 0) {
                        // 離脱ジャンプの設定自体は維持し、注視による猶予時間延長フラグのみをリセットする
                        state.rooms[roomID].hasWatchedThisEvent = false;
                    }
                    state.rooms[roomID].awayTimer = 0;
                }
            },

            updateRoomEffects(roomID) {
                const { state } = SurveillanceGame;
                const roomData = state.rooms[roomID];
                const $hud = $('#hud-container');
                
                const shouldBeSandstorm = roomData.isDead && !roomData.isEscaped;
                $('#hud-sandstorm').toggleClass('active', shouldBeSandstorm);
                $('#hud-noise').toggleClass('sandstorm-active', shouldBeSandstorm);
                
                if (roomData.isDead && !roomData.isEscaped) {
                    $('#hud-gun-btn-container, #hud-bullets-container, #hud-zoom-btn-container').hide();
                } else {
                    $('#hud-gun-btn-container, #hud-bullets-container, #hud-zoom-btn-container, .hud-time, .hud-cam-info').show();
                }
                
                $hud.toggleClass('is-upside-down', roomData.isUpsideDown);
                $hud.toggleClass('is-mirror', roomData.isMirror);

                // 反転エフェクトをインラインスタイル（ズームと共存）として適用するため、applyZoomを呼ぶ
                if (state.currentRoom === roomID) {
                    this.applyZoom(true);
                }
            },

            /**
             * タイマー開始
             */
            startTimer() {
                const { state, ui } = SurveillanceGame;
                if (state.timerInterval) clearInterval(state.timerInterval);
                
                state.timerInterval = setInterval(() => {
                    state.second++;
                    if (state.second >= 60) {
                        state.minute++;
                        state.second = 0;
                    }
                    ui.updateClock();

                    Object.keys(state.rooms).forEach(roomID => {
                        this.updateRoomTimerLogic(roomID);
                    });

                    // 部屋３独立監視システムを実行
                    this.updateR3IsolatedSystem();

                    if (state.minute >= 5) this.handleGameOver();
                    this.checkRoomEvents();
                }, 1000); 
            },

            updateR3IsolatedSystem() {
                const { state, utils } = SurveillanceGame;
                if (!window.r3IsolatedSystem) {
                    window.r3IsolatedSystem = { timer: 0, triggered: false };
                }

                // 既に遷移済み、または部屋３が死亡状態なら何もしない
                if (window.r3IsolatedSystem.triggered || state.rooms['r3']?.isDead) {
                    return;
                }

                const totalSeconds = state.minute * 60 + state.second;
                const activeEvent = this.getActiveEvent('r3', totalSeconds);

                // 現在のアクティブイベントが「立つ」イベント（3:20）であるかチェック
                if (activeEvent && (activeEvent.id === "r3_standing" || activeEvent.time === "3:20")) {
                    if (state.currentRoom !== 'r3') {
                        // 別のカメラを見ている間のみ、独立したタイマーをカウントアップ
                        window.r3IsolatedSystem.timer++;

                        let baseDuration = 10;
                        if (state.rooms['r3'].everHit) {
                            baseDuration = 5; // 撃たれてダメージを負っている場合は5秒に短縮
                        }
                        
                        // 注視による猶予時間（hasWatchedThisEvent）を考慮
                        const duration = baseDuration + (state.rooms['r3'].hasWatchedThisEvent ? 10 : 0);

                        if (window.r3IsolatedSystem.timer >= duration) {
                            const events = window.roomEvents['r3'];
                            const targetEvent = events ? events.find(e => e.id === "man_front") : null;
                            if (targetEvent) {
                                // 競合する可能性のある他のイベント処理フラグを完全にクリア
                                state.rooms['r3'].isJumpPending = false;
                                state.rooms['r3'].pendingAwayJump = null;
                                state.rooms['r3'].awayTimer = 0;
                                state.rooms['r3'].hasWatchedThisEvent = false;

                                // 「目の前（man_front）」イベントを直ちに適応・有効化
                                targetEvent.time = totalSeconds; // 後続のイベント検索のために時間を割り当て
                                state.rooms['r3'].activeTrapEvent = targetEvent;
                                state.rooms['r3'].activeTrap = null;
                                state.rooms['r3'].trapTimer = 0;
                                state.rooms['r3'].image = 'r3_room_Dfront.jpg';
                                state.rooms['r3'].hasHitTarget = false;
                                state.rooms['r3'].isUpsideDown = false;
                                state.rooms['r3'].isMirror = false;
                                state.flags['r3_safe'] = false;

                                console.log("[r3IsolatedSystem] Successfully and independently transitioned Room 3 to man_front.");
                                window.r3IsolatedSystem.triggered = true;
                            }
                        }
                    } else {
                        // プレイヤーが部屋３（CAM 3）に戻った場合は、カウントダウンを即時リセット
                        window.r3IsolatedSystem.timer = 0;
                    }
                }
            },

            updateRoomTimerLogic(roomID, elapsedSeconds = 1) {
                const { state, utils } = SurveillanceGame;
                const roomData = state.rooms[roomID];
                if (roomData.isDead) return;

                // 部屋３専用：被弾ダメージカウントダウンと自動復帰（同期型）
                if (roomID === 'r3' && roomData.damageTimer > 0) {
                    roomData.damageTimer -= elapsedSeconds;
                    if (roomData.damageTimer <= 0) {
                        roomData.damageTimer = 0;
                        roomData.isJumpPending = false;
                        roomData.hasHitTarget = false;

                        const currentTotalSeconds = state.minute * 60 + state.second;

                        // 被弾元のイベントに jumpTime が指定されていた場合はタイムラインジャンプを行う
                        if (roomData.jumpTimeOnRecovery) {
                            const jumpTime = roomData.jumpTimeOnRecovery;
                            const hitEvent = roomData.hitActiveEvent;
                            roomData.jumpTimeOnRecovery = null;
                            roomData.hitActiveEvent = null;

                            this.performTimelineShift(roomID, jumpTime, hitEvent);
                        } else {
                            const currentActiveEvent = this.getActiveEvent(roomID, currentTotalSeconds);

                            if (currentActiveEvent) {
                                if (currentActiveEvent.shootArea) {
                                    const areas = Array.isArray(currentActiveEvent.shootArea) ? currentActiveEvent.shootArea : [currentActiveEvent.shootArea];
                                    areas.forEach(a => delete a.isHit);
                                }

                                roomData.image = currentActiveEvent.image;

                                // 被弾ダメージからの自動復帰時に、元のイベントの離脱ジャンプ設定を再適用しタイマーをリセットする
                                if (currentActiveEvent.awayJump) {
                                    roomData.pendingAwayJump = currentActiveEvent.awayJump;
                                    roomData.awayTimer = 0;
                                }

                                if (state.currentRoom === roomID) {
                                    const resolved = utils.resolveImagePath(roomID, currentActiveEvent.image);
                                    TYRANO.kag.ftag.startTag("bg", { storage: `../fgimage/${resolved}`, time: 200, wait: "false" });
                                    this.updateDebugHitZoneDisplay();
                                }
                            }
                        }
                        console.log("[r3IsolatedSystem] Synchronized damage recovery completed. Returned to normal state.");
                    }
                }

                if (state.currentRoom === roomID) {
                    const events = window.roomEvents[roomID];
                    if (events) {
                        const totalSeconds = state.minute * 60 + state.second;
                        const activeEvent = this.getActiveEvent(roomID, totalSeconds);


                        // 注視による遅延
                        if (activeEvent && activeEvent.watchPause && !roomData.hasHitTarget && !roomData.isJumpPending && utils.isWatchingTarget(roomID, activeEvent)) {
                            roomData.hasWatchedThisEvent = true;
                            events.forEach(e => {
                                if (e.time != null) {
                                    const eSec = utils.parseTimeToSeconds(e.time);
                                    if (eSec > totalSeconds) e.time = eSec + elapsedSeconds;
                                }
                            });
                        }
                    }
                }

                // 離脱ジャンプ
                if (roomData.pendingAwayJump) {
                    if (state.currentRoom !== roomID) {
                        roomData.awayTimer += elapsedSeconds;
                        
                        // 被弾ダメージを与えている場合はベースの時間を5秒に短縮（攻撃的になるため）
                        let baseDuration = roomData.pendingAwayJump.duration;
                        if (roomData.everHit) {
                            baseDuration = 5;
                        }
                        
                        const duration = baseDuration + (roomData.hasWatchedThisEvent ? 10 : 0);
                        if (roomData.awayTimer >= duration) {
                            const jumpInfo = roomData.pendingAwayJump;
                            // performAwayJump 実行前に必ず isJumpPending をクリアする
                            // （hitJumpDelay 中に awayTimer が満了した場合でも遷移を確実に実行するため）
                            roomData.isJumpPending = false;
                            roomData.pendingAwayJump = null;
                            roomData.hasWatchedThisEvent = false;
                            roomData.awayTimer = 0;
                            this.performAwayJump(roomID, jumpInfo);
                        }
                    } else {
                        roomData.awayTimer = 0;
                    }
                }

                // トラップ
                if (roomData.activeTrapEvent && roomData.activeTrapEvent.watchWait && !roomData.isDead) {
                    this.updateTrapLogic(roomID, roomData.activeTrapEvent, elapsedSeconds);
                }
            },

            updateTrapLogic(roomID, trapEvent, elapsedSeconds = 1) {
                const { state, utils } = SurveillanceGame;
                const roomData = state.rooms[roomID];
                if (utils.isWatchingTarget(roomID, trapEvent)) {
                    roomData.trapTimer += elapsedSeconds;
                    if (roomData.trapTimer >= (trapEvent.watchWait || 5)) {
                        if (trapEvent.noSuccessIfHit && roomData.everHit) {
                            roomData.trapTimer = 0;
                            return;
                        }
                        if (trapEvent.shootArea) {
                            const areas = Array.isArray(trapEvent.shootArea) ? trapEvent.shootArea : [trapEvent.shootArea];
                            areas.forEach(a => a.isHit = true);
                        }
                        roomData.activeTrap = null;
                        roomData.activeTrapEvent = null;
                        roomData.trapTimer = 0;
                        state.flags[`${roomID}_safe`] = true;
                        const successEvent = (window.roomEvents[roomID] || []).find(e => e.id === (trapEvent.watchSuccess || 'man_escaped'));
                        if (successEvent) this.triggerEvent(roomID, successEvent, state.minute * 60 + state.second);
                        if (roomID === state.currentRoom) this.updateDebugHitZoneDisplay();
                    }
                } else {
                    roomData.trapTimer = 0;
                }
            },

            handleGameOver() {
                const { state } = SurveillanceGame;
                clearInterval(state.timerInterval);
                state.isGameOver = true;
                if (state.isGunMode) this.toggleGunMode(null, true);
                $('#hud-nav, #hud-zoom-btn-container, #hud-gun-btn-container, #gun-trigger-layer').css('pointer-events', 'none');
                
                // 新しい生存フラグ (sf.alive_r1 〜 sf.alive_r5) を設定
                if (typeof TYRANO !== 'undefined') {
                    const sf = TYRANO.kag.variable.sf;
                    const isAllAliveDebug = TYRANO.kag.variable.tf.debug_all_alive;
                    Object.keys(state.rooms).forEach(roomID => {
                        const roomData = state.rooms[roomID];
                        const isAlive = isAllAliveDebug || !roomData.isDead;
                        if (isAlive) {
                            sf['alive_' + roomID] = true;
                        }
                    });
                    TYRANO.kag.saveSystemVariable();
                }
                
                let deadCount = Object.values(state.rooms).filter(r => r.isDead).length;
                if (typeof TYRANO !== 'undefined' && TYRANO.kag.variable.tf.debug_all_alive) deadCount = 0;
                
                const target = deadCount === 0 ? "*game_clear" : (deadCount === 5 ? "*game_over" : "*mission_failed");
                this.terminateGame(target);
            },

            terminateGame(target) {
                TYRANO.kag.ftag.startTag("jump", { storage: "main.ks", target });
            },

            /**
             * 離脱ジャンプの実行
             * 
             * 注意: この関数を呼び出す前に pendingAwayJump = null と isJumpPending = false を
             * 設定しておくこと（updateRoomTimerLogic 内で実施済み）。
             * これにより triggerEvent 内の isJumpPending ガード条件による早期リターンを防ぐ。
             */
            performAwayJump(roomID, jumpInfo) {
                const { state, utils } = SurveillanceGame;
                const events = window.roomEvents[roomID];
                if (!events) return;

                let targetEvent = jumpInfo.targetId ? events.find(e => e.id === jumpInfo.targetId) : 
                                  (jumpInfo.targetTime ? events.find(e => utils.parseTimeToSeconds(e.time) === utils.parseTimeToSeconds(jumpInfo.targetTime)) : null);

                if (!targetEvent) {
                    console.warn(`[performAwayJump] targetEvent not found for roomID=${roomID}, jumpInfo=`, jumpInfo);
                    return;
                }

                const currentSeconds = state.minute * 60 + state.second;

                if (targetEvent.time == null) {
                    // time を持たない id ベースのイベント（man_front 等）は
                    // 現在時刻を設定し、processedEvents のキー重複を避けるため
                    // checkRoomEvents 経由ではなく直接 triggerEvent を呼ぶ。
                    targetEvent.time = currentSeconds;
                    // 同じ秒数で登録済みのキーを削除して再トリガーを保証
                    const targetIndex = events.indexOf(targetEvent);
                    const key = `${roomID}_${targetIndex}_${currentSeconds}`;
                    state.processedEvents.delete(key);
                    if (state.rooms[roomID]) state.rooms[roomID].isJumping = true;
                    this.triggerEvent(roomID, targetEvent, currentSeconds);
                    if (state.rooms[roomID]) state.rooms[roomID].isJumping = false;
                } else {
                    // time を持つイベントへのジャンプ：タイムライン全体をシフト
                    const jumpSeconds = utils.parseTimeToSeconds(targetEvent.time);
                    const offset = currentSeconds - jumpSeconds;
                    events.forEach(e => {
                        if (e.time == null) return;
                        const eSec = utils.parseTimeToSeconds(e.time);
                        if (eSec >= jumpSeconds) {
                            e.time = eSec + offset;
                            if (e.shootArea) (Array.isArray(e.shootArea) ? e.shootArea : [e.shootArea]).forEach(a => delete a.isHit);
                        }
                    });
                    if (state.rooms[roomID]) state.rooms[roomID].isJumping = true;
                    this.checkRoomEvents();
                    if (state.rooms[roomID]) state.rooms[roomID].isJumping = false;
                }

                console.log(`[performAwayJump] ${roomID} -> ${targetEvent.id || targetEvent.time} triggered at ${currentSeconds}s`);
            },

            /**
             * ゲッター記述子を維持する堅牢なディープコピー関数
             */
            cloneDeep(obj) {
                if (obj === null || typeof obj !== 'object') {
                    return obj;
                }
                if (Array.isArray(obj)) {
                    return obj.map(item => this.cloneDeep(item));
                }
                const clone = Object.create(Object.getPrototypeOf(obj));
                const keys = Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
                keys.forEach(key => {
                    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
                    if (descriptor) {
                        if ('value' in descriptor) {
                            descriptor.value = this.cloneDeep(descriptor.value);
                        }
                        Object.defineProperty(clone, key, descriptor);
                    }
                });
                return clone;
            },

            /**
             * 部屋イベントのロード・メモリ復元
             */
            loadRoomEvents() {
                // 初回のみメモリ上の初期イベント配列のバックアップを作成
                if (!window.originalRoomEvents) {
                    window.originalRoomEvents = this.cloneDeep(window.roomEvents || {});
                    if (window.r5_hit_branch) {
                        window.originalR5Branch = this.cloneDeep(window.r5_hit_branch);
                    }
                    if (window.r5_hit_branch_revived) {
                        window.originalR5BranchRevived = this.cloneDeep(window.r5_hit_branch_revived);
                    }
                    console.log("[Surveillance] Created original room events backup from memory.");
                }

                // バックアップから完璧にディープコピーして復元 (ゲッター関数も完全維持)
                window.roomEvents = this.cloneDeep(window.originalRoomEvents);
                if (window.originalR5Branch) {
                    window.r5_hit_branch = this.cloneDeep(window.originalR5Branch);
                }
                if (window.originalR5BranchRevived) {
                    window.r5_hit_branch_revived = this.cloneDeep(window.originalR5BranchRevived);
                }
                console.log("[Surveillance] Restored room events from memory cache. (Web & DL compatible)");
                return Promise.resolve();
            },

            preloadAllImages() {
                const { state, utils } = SurveillanceGame;
                const imagesToPreload = new Set();

                // 共通画像の登録
                imagesToPreload.add('./data/fgimage/sandstorm.jpg');
                imagesToPreload.add('./data/fgimage/noise01.png');
                imagesToPreload.add('./data/fgimage/noise02.png');
                imagesToPreload.add('./data/fgimage/noise03.png');
                imagesToPreload.add('./data/fgimage/material/icon_gun.png');
                imagesToPreload.add('./data/fgimage/material/icon_bullet.png');
                imagesToPreload.add('./data/fgimage/material/icon_zoomin.png');
                imagesToPreload.add('./data/fgimage/material/icon_zoomout.png');

                // 各部屋のイベントから画像を収集
                if (window.roomEvents) {
                    Object.keys(window.roomEvents).forEach(roomID => {
                        const events = window.roomEvents[roomID] || [];
                        events.forEach(ev => {
                            this.collectImagesFromEvent(roomID, ev, imagesToPreload);
                        });
                    });
                }

                // 部屋5の分岐ルートからも収集
                if (window.r5_hit_branch) {
                    window.r5_hit_branch.forEach(ev => {
                        this.collectImagesFromEvent('r5', ev, imagesToPreload);
                    });
                }

                // 実際のプリロード処理
                imagesToPreload.forEach(src => {
                    const img = new Image();
                    img.src = src;
                });
                console.log(`[Preload] Started preloading ${imagesToPreload.size} images.`);
            },

            collectImagesFromEvent(roomID, ev, set) {
                const { utils } = SurveillanceGame;
                if (!ev) return;

                const addImg = (imgName) => {
                    if (imgName) {
                        const resolved = utils.resolveImagePath(roomID, imgName);
                        set.add(`./data/fgimage/${resolved}`);
                    }
                };

                addImg(ev.image);
                addImg(ev.hitImage);
                addImg(ev.flickerImage);
                addImg(ev.timeoutImage);

                // 再帰的に hitBranch や timeoutBranch, randomRepeat からも収集
                if (ev.hitBranch && Array.isArray(ev.hitBranch)) {
                    ev.hitBranch.forEach(subEv => this.collectImagesFromEvent(roomID, subEv, set));
                }
                if (ev.timeoutBranch && Array.isArray(ev.timeoutBranch)) {
                    ev.timeoutBranch.forEach(subEv => this.collectImagesFromEvent(roomID, subEv, set));
                }
                if (ev.randomRepeat && ev.randomRepeat.pool) {
                    ev.randomRepeat.pool.forEach(subEv => this.collectImagesFromEvent(roomID, subEv, set));
                }
            },

            /**
             * イベントの毎秒チェック
             */
            checkRoomEvents() {
                const { state, utils } = SurveillanceGame;
                if (!window.roomEvents) return;
                const totalSeconds = state.minute * 60 + state.second;

                // タイムアウト
                Object.keys(state.pendingTimeouts).forEach(roomID => {
                    if (state.rooms[roomID]?.isDead) {
                        delete state.pendingTimeouts[roomID];
                        return;
                    }
                    const info = state.pendingTimeouts[roomID];
                    if (!info) return;
                    if (totalSeconds >= info.startTime + info.timeout) this.applyTimeoutBranch(roomID, info.event, totalSeconds);
                });

                // ランダムリピート
                Object.keys(state.rooms).forEach(roomID => this.updateRandomRepeat(roomID, totalSeconds));

                // 定時イベント
                Object.keys(window.roomEvents).forEach(roomID => {
                    if (state.rooms[roomID]?.isDead) return;
                    window.roomEvents[roomID].forEach((event, index) => {
                        if (event.time == null) return;
                        const eventSeconds = utils.parseTimeToSeconds(event.time);
                        const key = `${roomID}_${index}_${eventSeconds}`;
                        if (totalSeconds >= eventSeconds && !state.processedEvents.has(key)) {
                            const triggered = this.triggerEvent(roomID, event, eventSeconds);
                            if (triggered) {
                                state.processedEvents.add(key);
                            }
                        }
                    });
                });
            },

            updateRandomRepeat(roomID, totalSeconds) {
                const { state, utils } = SurveillanceGame;
                const roomData = state.rooms[roomID];
                if (!roomData.randomRepeat || roomData.isDead) return;
                
                const rr = roomData.randomRepeat;
                if (totalSeconds >= rr.endTime) {
                    roomData.randomRepeat = null;
                    return;
                }
                if (utils.isWatchingTarget(roomID, rr.activeEvent) || rr.waitTimer-- > 0) return;

                if (totalSeconds >= rr.nextTime) {
                    const pool = rr.pool;
                    let idx;
                    if (pool.length > 1) {
                        do { idx = Math.floor(Math.random() * pool.length); } while (idx === rr.lastIndex);
                    } else { idx = 0; }
                    
                    rr.lastIndex = idx;
                    const clonedPoolItem = JSON.parse(JSON.stringify(rr.pool[idx]));
                    const event = { ...clonedPoolItem, hitImage: rr.hitImage, noNoise: rr.noNoise, time: totalSeconds };
                    rr.activeEvent = event;
                    this.triggerEvent(roomID, event, totalSeconds);

                    let interval = 4;
                    if (rr.intervals) {
                        for (const rule of rr.intervals) {
                            if (totalSeconds < utils.parseTimeToSeconds(rule.until)) {
                                interval = rule.duration;
                                break;
                            }
                        }
                    }
                    rr.nextTime = totalSeconds + interval;
                }
            },

            /**
             * イベントの実行
             */
            triggerEvent(roomID, event, seconds) {
                const { state, ui, utils, sound } = SurveillanceGame;
                if (event.flag && !state.flags[event.flag]) return false;
                if (state.rooms[roomID].isJumpPending) return false;
                if (event.notFlag && state.flags[event.notFlag]) return false;

                const totalSeconds = state.minute * 60 + state.second;
                const isRealtime = (seconds === totalSeconds);
                const elapsedSinceEvent = isRealtime ? 0 : (totalSeconds - seconds);
                state.rooms[roomID].hasWatchedThisEvent = false;
                console.log(`[Event] ${roomID} at ${seconds}s ${isRealtime ? '(Realtime)' : '(Catch-up: ' + elapsedSinceEvent + 's elapsed)'}`);

                if (event.randomRepeat) {
                    this.initRandomRepeat(roomID, event, seconds);
                    return true;
                }

                if (event.shootArea || event.timeout) state.flags[`${roomID}_safe`] = false;

                const isAutoShoot = (typeof TYRANO !== 'undefined' && TYRANO.kag.variable.tf.debug_shoot_done && seconds < state.initialJumpTime);
                let wasAutoHit = false;
                if (isAutoShoot && (event.timeout || event.shootArea)) {
                    state.flags[`${roomID}_safe`] = true;
                    wasAutoHit = true;
                }

                if (event.timeout && !wasAutoHit) {
                    state.pendingTimeouts[roomID] = { startTime: seconds, timeout: event.timeout, event };
                }

                if (event.awayJump) {
                    state.rooms[roomID].pendingAwayJump = event.awayJump;
                    state.rooms[roomID].awayTimer = elapsedSinceEvent;
                }

                if (event.trap || event.watchWait || event.awayDeath) {
                    state.rooms[roomID].activeTrap = event.trap || null;
                    state.rooms[roomID].activeTrapEvent = event;
                    state.rooms[roomID].trapTimer = (!isRealtime && utils.isWatchingTarget(roomID, event)) ? elapsedSinceEvent : 0;
                }

                // isEscaped（逃走）イベントは watchSuccess で r3_safe=true になっていても死亡処理を実行する
                // event.isDead の場合は確定死亡イベントなので無条件で死亡処理を実行する
                const isDeathEvent = (event.effect === 'sandstorm' || event.isDead) && (event.isDead || event.isEscaped || !state.flags[roomID + '_safe']);
                if (event.image && !isDeathEvent) {
                    state.rooms[roomID].hasHitTarget = false;
                    this.updateRoomImage(roomID, event, seconds, wasAutoHit);
                }

                // 特殊エフェクト
                if (isDeathEvent) this.handleDeath(roomID, event, isRealtime);

                // 画像が読み込まれるか、明示的にクリアされる場合は反転をリセット
                if (event.image || event.effect === 'clear_flips') {
                    state.rooms[roomID].isUpsideDown = false;
                    state.rooms[roomID].isMirror = false;
                }


                if (event.effect === 'upside_down') state.rooms[roomID].isUpsideDown = true;
                if (event.effect === 'mirror') state.rooms[roomID].isMirror = true;

                if (state.currentRoom === roomID) {
                    this.updateRoomEffects(roomID);
                    this.updateDebugHitZoneDisplay();

                    if (event.loopSe) {
                        sound.play(event.loopSe, "6", { loop: "true" });
                    } else if (event.se && isRealtime) {
                        const roomData = state.rooms[roomID];
                        if (!(event.noSeOnJump && roomData && roomData.isJumping)) {
                            sound.play(event.se, "6");
                            if (event.seDelay && event.seDelayPlay) {
                                SurveillanceGame.timer.setTimeout(() => {
                                    sound.play(event.seDelayPlay, "6");
                                }, event.seDelay);
                            }
                        }
                    } else if (isRealtime || (seconds < totalSeconds && !event.se && !event.loopSe)) {
                        // 新しいイベントが始まった際に、ループSEを停止（リアルタイムまたはスキップ時）
                        sound.stopBuffer("6");
                    }

                    if (event.message !== undefined && isRealtime) {
                        if (event.message === "") ui.clearSystemMessage();
                        else ui.showSystemMessage(event.name || "???", event.message);
                    }
                }
                return true;
            },

            initRandomRepeat(roomID, event, seconds) {
                const { state, utils } = SurveillanceGame;
                state.rooms[roomID].randomRepeat = {
                    pool: event.randomRepeat.pool,
                    endTime: utils.parseTimeToSeconds(event.randomRepeat.endTime),
                    intervals: event.randomRepeat.intervals,
                    nextTime: seconds,
                    waitTimer: 0,
                    lastIndex: -1,
                    hitImage: event.randomRepeat.hitImage,
                    noNoise: event.randomRepeat.noNoise,
                    hitWait: event.randomRepeat.hitWait || 10,
                    activeEvent: null
                };
            },

            updateRoomImage(roomID, event, seconds, wasAutoHit) {
                const { state, utils, sound } = SurveillanceGame;
                if (state.rooms[roomID].isDead) return;

                state.rooms[roomID].flickerId++;
                if (event.effect === 'sandstorm' && state.flags[`${roomID}_safe`]) return;

                let targetImage = event.image;
                if ((wasAutoHit || state.rooms[roomID].hasHitTarget) && event.hitImage) {
                    targetImage = event.hitImage;
                }
                state.rooms[roomID].image = targetImage;
                
                if (state.currentRoom === roomID) {
                    const isRealtime = (seconds === (state.minute * 60 + state.second));
                    if (isRealtime) {
                        if (event.effect === 'strong_noise') {
                            $('#hud-container').addClass('is-strong-noise');
                            SurveillanceGame.timer.setTimeout(() => {
                                $('#hud-container').removeClass('is-strong-noise');
                                $('#hud-noise').fadeOut(150, function() { $(this).css('background-image', ''); });
                            }, event.noiseTime || 300);
                        } else if (!event.noNoise) {
                            $('#hud-noise').css({ 'background-image': 'url("./data/fgimage/noise03.png")', 'opacity': '1' }).show();
                            SurveillanceGame.timer.setTimeout(() => $('#hud-noise').fadeOut(150, function() { $(this).css('background-image', ''); }), 50);
                        }
                    }

                    const resolved = utils.resolveImagePath(roomID, targetImage);
                    if (isRealtime && event.effect === 'strong_noise') {
                        // 強いノイズ演出：砂嵐を挟んでから切り替え
                        TYRANO.kag.ftag.startTag("bg", { storage: "../fgimage/sandstorm.jpg", time: 0, wait: "false" });
                        SurveillanceGame.timer.setTimeout(() => {
                            TYRANO.kag.ftag.startTag("bg", { storage: `../fgimage/${resolved}`, time: 0, wait: "false" });
                        }, event.noiseTime || 300);
                    } else if (isRealtime && event.flickerImage) {
                        this.performFlicker(roomID, event.flickerImage, targetImage, event.flickerCount || 3, event.flickerInterval || 60);
                    } else {
                        TYRANO.kag.ftag.startTag("bg", { storage: `../fgimage/${resolved}`, time: isRealtime ? 200 : 0, wait: "false" });
                    }

                    if (isRealtime && !event.noNoise && !(event.effect === 'sandstorm' && state.flags[`${roomID}_safe`] !== true)) {
                        const se = (event.effect === 'strong_noise') ? "noise.ogg" : "monitanoizu01.ogg";
                        sound.play(se, "1");
                    }
                    this.checkClearFlag(roomID);
                }
            },

            performFlicker(roomID, flickerImg, targetImg, count, interval) {
                const { state, utils } = SurveillanceGame;
                let current = 0;
                const flickerId = state.rooms[roomID].flickerId;

                const tick = () => {
                    if (state.rooms[roomID].flickerId !== flickerId) return;
                    if (current >= count * 2) {
                        const res = utils.resolveImagePath(roomID, targetImg);
                        TYRANO.kag.ftag.startTag("bg", { storage: `../fgimage/${res}`, time: 0, wait: "false" });
                        return;
                    }
                    const img = (current % 2 === 0) ? flickerImg : targetImg;
                    const res = utils.resolveImagePath(roomID, img);
                    TYRANO.kag.ftag.startTag("bg", { storage: `../fgimage/${res}`, time: 0, wait: "false" });
                    current++;
                    SurveillanceGame.timer.setTimeout(tick, interval);
                };
                tick();
            },

            handleDeath(roomID, event, isRealtime) {
                const { state, ui, utils, sound } = SurveillanceGame;
                if (typeof TYRANO !== 'undefined' && TYRANO.kag.variable.tf.debug_all_alive) return;

                state.rooms[roomID].isDead = true;
                if (event.isEscaped) state.rooms[roomID].isEscaped = true;
                if (event.image) state.rooms[roomID].image = event.image;
                state.rooms[roomID].flickerId++;

                state.rooms[roomID].isGlitchActive = false;
                delete state.pendingTimeouts[roomID];
                state.rooms[roomID].randomRepeat = null;
                state.rooms[roomID].pendingAwayJump = null;
                state.rooms[roomID].activeTrapEvent = null;
                
                if (state.currentRoom === roomID) {
                    this.updateRoomEffects(roomID);
                    if (state.isGunMode) this.toggleGunMode(null, true);
                    
                    if (event.image) {
                        const deadImage = `../fgimage/${utils.resolveImagePath(roomID, event.image)}`;
                        TYRANO.kag.ftag.startTag("bg", { storage: deadImage, time: isRealtime ? 200 : 0, wait: "false" });
                    }

                    if (isRealtime) {
                        const se = event.isEscaped ? "monitanoizu01.ogg" : "noise.ogg";
                        sound.play(se, "5");
                    }
                    this.checkClearFlag(roomID);
                }

                if (Object.values(state.rooms).every(r => r.isDead)) {
                    clearInterval(state.timerInterval);
                    ui.clearChatLog();
                    ui.clearSystemMessage();
                    SurveillanceGame.timer.setTimeout(() => this.terminateGame("*game_over"), 1500);
                }
            },

            /**
             * 銃モードの切り替え
             */
            toggleGunMode(e, silent = false) {
                const { state, sound } = SurveillanceGame;

                // 銃モード切り替え時にドラッグ状態を強制解除して効果音を停止
                state.drag.isDragging = false;
                $('#hud-container').removeClass('is-panning');
                sound.stop("move.ogg");

                if (e) {
                    e.stopPropagation();
                    if (e.type === 'contextmenu') e.preventDefault();
                }
                state.isGunMode = !state.isGunMode;
                
                if (state.isGunMode) {
                    const coords = state.lastMouseCoords || { x: 640, y: 360 };
                    const $crosshair = $('#hud-crosshair');
                    const offset = $crosshair.width() / 2 || 75;
                    $crosshair.css({ left: coords.x - offset, top: coords.y - offset });

                    // 銃ボタンを押した瞬間に死亡するイベントの判定
                    // activeTrapEvent に deathOnGunDraw フラグがある場合は即座に死亡演出へ移行
                    const roomID = state.currentRoom;
                    const trapEvent = state.rooms[roomID]?.activeTrapEvent;
                    if (trapEvent && trapEvent.deathOnGunDraw && !state.rooms[roomID].isDead) {
                        if (!silent) sound.play("gunhand.ogg", "2");
                        this.handleDeathOnShoot(trapEvent);
                        // 銃モードは即解除して演出のみ実行
                        state.isGunMode = false;
                        const $hud = $('#hud-container');
                        $hud.toggleClass('is-gun-mode', false);
                        $('#gun-btn').toggleClass('active', false);
                        $('#hud-crosshair, #gun-trigger-layer').toggle(false);
                        return;
                    }
                }
                
                const $hud = $('#hud-container');
                $hud.toggleClass('is-gun-mode', state.isGunMode);
                $('#gun-btn').toggleClass('active', state.isGunMode);
                $('#hud-crosshair, #gun-trigger-layer').toggle(state.isGunMode);

                if (!silent) sound.play("gunhand.ogg", "2");
            },

            /**
             * 発砲
             */
            fireGun(e) {
                const { state, ui, engine, sound } = SurveillanceGame;
                const totalSeconds = state.minute * 60 + state.second;
                if (!state.isGunMode) {
                    return;
                }

                // 発砲時にドラッグ状態を強制解除して効果音を停止
                state.drag.isDragging = false;
                $('#hud-container').removeClass('is-panning');
                sound.stop("move.ogg");

                const activeEvent = this.getActiveEvent(state.currentRoom, totalSeconds);

                if (activeEvent?.isJammed) {
                    sound.play("bullet.ogg", "3");
                    return;
                }

                if (state.bullets[state.currentRoom] <= 0) {
                    sound.play("bullet.ogg", "3");
                    return;
                }

                state.bullets[state.currentRoom]--;
                ui.updateBulletsUI();
                ui.clearSystemMessage();

                // 演出
                const $base = $('.tyrano_base');
                const $crosshair = $('#hud-crosshair');
                $base.removeClass('animate-shoot-shake');
                $crosshair.removeClass('animate-crosshair-recoil');
                void $base[0].offsetWidth; 
                $base.addClass('animate-shoot-shake');
                $crosshair.addClass('animate-crosshair-recoil');

                sound.play("gun.ogg", "3");

                // 特殊ペナルティ (CAM 4)
                // - shootArea が設定されているアクティブイベント（有害なもの）中のみ誤射判定対象
                // - shootArea がない箇所（通常状態・初期化イベントなど）は誤射にも何にもならない
                if (state.currentRoom === 'r4') {
                    const activeEvent = this.getActiveEvent('r4', totalSeconds);

                    // アクティブイベントが shootArea を持ち、かつ無害でないかチェック
                    let isShootTarget = false;
                    if (activeEvent && activeEvent.shootArea && activeEvent.duration !== undefined) {
                        const eStart = SurveillanceGame.utils.parseTimeToSeconds(activeEvent.time);
                        const eEnd = eStart + activeEvent.duration;
                        if (totalSeconds >= eStart && totalSeconds < eEnd) {
                            // 無害イベント (r4_room_A002.jpg) は撃っても誤射扱いにしない
                            if (activeEvent.image !== 'r4_room_A002.jpg') {
                                isShootTarget = true;
                            }
                        }
                    }

                    if (!isShootTarget) {
                        // 有害なshootAreaイベント中でない場合：
                        // - shootArea 内を撃ったなら誤射ペナルティ
                        // - shootArea 外（またはイベントなし）なら何も起きない
                        if (activeEvent && activeEvent.shootArea) {
                            const coords = SurveillanceGame.utils.getGameCoords(e);
                            const scale = this.getCurrentScale();
                            let ix = (coords.x - 640 - state.drag.offsetX) / scale + 640;
                            let iy = (coords.y - 360 - state.drag.offsetY) / scale + 360;
                            if (state.rooms['r4'].isMirror) ix = 1280 - ix;
                            if (state.rooms['r4'].isUpsideDown) iy = 720 - iy;

                            const areas = Array.isArray(activeEvent.shootArea) ? activeEvent.shootArea : [activeEvent.shootArea];
                            const hitArea = areas.find(area =>
                                ix >= area.x && ix <= area.x + area.w &&
                                iy >= area.y && iy <= area.y + area.h
                            );

                            if (hitArea) {
                                state.cameraLockedUntil = totalSeconds + 20;
                                $('.layer_camera').addClass('is-blurred-penalty');
                                $('#hud-noise').css('background-image', 'url("./data/fgimage/noise03.png")').show();
                                SurveillanceGame.timer.setTimeout(() => $('#hud-noise').fadeOut(150, function() { $(this).css('background-image', ''); }), 50);
                                sound.play("monitanoizu01.ogg", "1");
                            }
                        }
                        return;
                    }
                }

                // 命中判定

                if (activeEvent && activeEvent.deathOnShoot) {
                    this.handleDeathOnShoot(activeEvent);
                    return;
                }
                
                if (activeEvent && activeEvent.shootArea) {
                    const isHit = this.checkHit(e, activeEvent, totalSeconds);
                    if (!isHit) {
                        const roomEvents = window.roomEvents[state.currentRoom];
                        if (roomEvents && roomEvents.missBranch) {
                            // r2部屋で画像が 'r2_room.jpg' (誰もいない) の場合はミスによるイベント移行を行わない
                            if (state.currentRoom === 'r2' && state.rooms['r2']?.image === 'r2_room.jpg') {
                                // 何もしない (引き続きイベントは順次発生し続ける)
                            } else {
                                // 銃撃した瞬間にノイズを即時表示（遅延なし）
                                $('#hud-noise').css({ 'background-image': 'url("./data/fgimage/noise03.png")', 'opacity': '1' }).show();
                                SurveillanceGame.timer.setTimeout(() => {
                                    this.applyHitBranch(state.currentRoom, { hitBranch: roomEvents.missBranch }, totalSeconds);
                                    this.updateDebugHitZoneDisplay();
                                    $('#hud-noise').fadeOut(250, function() { $(this).css('background-image', ''); });
                                }, 30);
                            }
                        }
                    }
                } else {
                    // ショットエリアがない場合でも、部屋全体でミスの挙動が定義されていれば実行
                    const roomEvents = window.roomEvents[state.currentRoom];
                    if (roomEvents && roomEvents.missBranch) {
                        // r2部屋で画像が 'r2_room.jpg' (誰もいない) の場合はミスによるイベント移行を行わない
                        if (state.currentRoom === 'r2' && state.rooms['r2']?.image === 'r2_room.jpg') {
                            // 何もしない (引き続きイベントは順次発生し続ける)
                        } else {
                            // 銃撃した瞬間にノイズを即時表示（遅延なし）
                            $('#hud-noise').css({ 'background-image': 'url("./data/fgimage/noise03.png")', 'opacity': '1' }).show();
                            SurveillanceGame.timer.setTimeout(() => {
                                this.applyHitBranch(state.currentRoom, { hitBranch: roomEvents.missBranch }, totalSeconds);
                                this.updateDebugHitZoneDisplay();
                                $('#hud-noise').fadeOut(250, function() { $(this).css('background-image', ''); });
                            }, 30);
                        }
                    }
                }
            },

            handleDeathOnShoot(activeEvent) {
                const { state } = SurveillanceGame;
                if (activeEvent.shootArea) (Array.isArray(activeEvent.shootArea) ? activeEvent.shootArea : [activeEvent.shootArea]).forEach(a => a.isHit = true);
                const deathEvent = (window.roomEvents[state.currentRoom] || []).find(e => e.id === activeEvent.deathOnShoot);
                if (deathEvent) this.triggerEvent(state.currentRoom, deathEvent, state.minute * 60 + state.second);
                this.updateDebugHitZoneDisplay();
            },

            checkHit(e, activeEvent, totalSeconds) {
                const { state, ui, utils, sound } = SurveillanceGame;
                const coords = utils.getGameCoords(e);
                const scale = this.getCurrentScale();
                let ix = (coords.x - 640 - state.drag.offsetX) / scale + 640;
                let iy = (coords.y - 360 - state.drag.offsetY) / scale + 360;

                // 反転状態を考慮
                if (state.rooms[state.currentRoom].isMirror) ix = 1280 - ix;
                if (state.rooms[state.currentRoom].isUpsideDown) iy = 720 - iy;

                const areas = Array.isArray(activeEvent.shootArea) ? activeEvent.shootArea : [activeEvent.shootArea];
                const hitArea = areas.find(area => !area.isHit && ix >= area.x && ix <= area.x + area.w && iy >= area.y && iy <= area.y + area.h);

                if (hitArea) {
                    const roomID = state.currentRoom;
                    areas.forEach(a => a.isHit = true);
                    
                    if (hitArea.triggerBranch) {
                        const branchTime = hitArea.branchTime || 0;
                        const branchEvents = hitArea.branch || activeEvent.timeoutBranch;
                        this.applyTimeoutBranch(roomID, activeEvent, totalSeconds, branchTime, branchEvents);
                        this.updateDebugHitZoneDisplay();
                        $('#hud-noise').css('background-image', 'url("./data/fgimage/noise03.png")').fadeIn(50).fadeOut(250, function() { $(this).css('background-image', ''); });
                        
                        if (hitArea.se) sound.play(hitArea.se, "6");
                        sound.play("button01.ogg", "7");
                        return true; 
                    }

                    if (roomID !== 'r1') {
                        state.flags[`${roomID}_safe`] = true;
                    }
                    state.rooms[roomID].hasHitTarget = true;


                    if (activeEvent.hitBranch) {
                        // 銃撃した瞬間にノイズを即時表示（遅延なし）
                        $('#hud-noise').css({ 'background-image': 'url("./data/fgimage/noise03.png")', 'opacity': '1' }).show();
                        SurveillanceGame.timer.setTimeout(() => {
                            this.clearRoomDistortions(roomID);
                            this.applyHitBranch(roomID, activeEvent, totalSeconds);
                            this.updateDebugHitZoneDisplay();
                            sound.play("button01.ogg", "7");
                            
                            // 分岐先の最初のイベントが強ノイズ演出を持っている場合は、通常のフェードアウトをスキップ
                            const firstBranchEv = activeEvent.hitBranch && activeEvent.hitBranch[0];
                            const isStrongNoise = firstBranchEv && firstBranchEv.effect === 'strong_noise';
                            if (!isStrongNoise) {
                                $('#hud-noise').fadeOut(250, function() { $(this).css('background-image', ''); });
                            }
                        }, 30);
                    } else {
                        // 銃撃した瞬間にノイズを即時表示（遅延なし）
                        $('#hud-noise').css({ 'background-image': 'url("./data/fgimage/noise03.png")', 'opacity': '1' }).show();
                        this.handleNormalHit(roomID, activeEvent, totalSeconds);
                    }
                    return true;
                }
                return false;
            },

            /**
             * 部屋３専用：被弾ダメージ（同期型）
             */
            handleR3NormalHit(activeEvent, totalSeconds) {
                const { state, ui, sound, utils } = SurveillanceGame;
                const roomID = 'r3';
                const roomData = state.rooms[roomID];

                if (state.pendingTimeouts[roomID]) delete state.pendingTimeouts[roomID];
                this.updateDebugHitZoneDisplay();

                this.clearRoomDistortions(roomID);
                // ループSE（erosion.oggなど）を停止
                sound.stopBuffer("6");
                $('#hud-noise').css({ 'background-image': 'url("./data/fgimage/noise03.png")', 'opacity': '1' }).show();
                SurveillanceGame.timer.setTimeout(() => $('#hud-noise').fadeOut(250, function() { $(this).css('background-image', ''); }), 30);

                // 被弾ステートとタイマーのセット（hitJumpDelayが定義されている場合のみ自動復帰タイマーを作動させる）
                if (activeEvent.hitJumpDelay !== undefined) {
                    roomData.damageTimer = activeEvent.hitJumpDelay;
                    roomData.isJumpPending = true;
                } else {
                    roomData.damageTimer = 0;
                    roomData.isJumpPending = false;
                }
                roomData.hasHitTarget = true;
                roomData.everHit = true;

                // jumpTime の保存（5秒後の自動復帰時にタイムラインジャンプを実行するため）
                if (activeEvent.jumpTime != null) {
                    roomData.jumpTimeOnRecovery = activeEvent.jumpTime;
                    roomData.hitActiveEvent = activeEvent;
                } else {
                    roomData.jumpTimeOnRecovery = null;
                    roomData.hitActiveEvent = null;
                }

                if (activeEvent.hitImage) {
                    roomData.image = activeEvent.hitImage; // 'r3_room_Cdamage.jpg'
                    if (state.currentRoom === roomID) {
                        const fullPath = `../fgimage/${utils.resolveImagePath(roomID, activeEvent.hitImage)}`;
                        TYRANO.kag.ftag.startTag("bg", { storage: fullPath, time: 100, wait: "false" });
                    }
                }

                if (activeEvent.se) sound.play(activeEvent.se, "6");
                sound.play("button01.ogg", "7");
                
                console.log(`[r3IsolatedSystem] Target hit! Damage timer set to ${roomData.damageTimer}s.`);
            },

            handleNormalHit(roomID, activeEvent, totalSeconds) {
                const { state, ui, sound } = SurveillanceGame;

                // ディフェンシブ・プログラミング：defTime が初期化されていない場合に備え、その場で補完する
                if (window.roomEvents[roomID]) {
                    window.roomEvents[roomID].forEach(e => {
                        if (e.time != null && e.defTime == null) {
                            e.defTime = typeof e.time === 'number' ? e.time : SurveillanceGame.utils.parseTimeToSeconds(e.time);
                        }
                    });
                }

                if (roomID === 'r3') {
                    this.handleR3NormalHit(activeEvent, totalSeconds);
                    return;
                }

                const hasJump = activeEvent.jumpTime != null;
                if (state.pendingTimeouts[roomID]) delete state.pendingTimeouts[roomID];
                this.updateDebugHitZoneDisplay();

                const roomData = state.rooms[roomID];
                if (roomData.randomRepeat && activeEvent === roomData.randomRepeat.activeEvent) {
                    roomData.randomRepeat.waitTimer = roomData.randomRepeat.hitWait;
                    roomData.randomRepeat.activeEvent = null;
                    roomData.randomRepeat.nextTime = totalSeconds + roomData.randomRepeat.hitWait;
                }

                if (activeEvent.delayTimeline) {
                    const delaySec = activeEvent.delayTimeline;
                    const eventSec = SurveillanceGame.utils.parseTimeToSeconds(activeEvent.time);
                    if (window.roomEvents[roomID]) {
                        window.roomEvents[roomID].forEach(e => {
                            if (e.time == null) return;
                            const eSec = SurveillanceGame.utils.parseTimeToSeconds(e.time);
                            if (eSec >= eventSec) {
                                e.time = eSec + delaySec;
                                if (e.shootArea) (Array.isArray(e.shootArea) ? e.shootArea : [e.shootArea]).forEach(a => delete a.isHit);
                            }
                        });
                    }
                    this.checkRoomEvents();
                }

                SurveillanceGame.timer.setTimeout(() => {
                    this.clearRoomDistortions(roomID);
                    // 即時表示したノイズをフェードアウト
                    $('#hud-noise').fadeOut(250, function() { $(this).css('background-image', ''); });
                    if (hasJump) {
                        if (activeEvent.hitJumpDelay) {
                            const delay = activeEvent.hitJumpDelay;
                            const jumpTime = activeEvent.jumpTime;
                            const defJumpSeconds = SurveillanceGame.utils.parseTimeToSeconds(jumpTime);
                            
                            // 隔離ルート用のイベント配列を動的に作成
                            const branchEvents = [];
                            
                            // 1. 隔離イベント（被弾した瞬間から指定秒数）
                            branchEvents.push({
                                time: 0,
                                image: activeEvent.hitImage || "r1_room_0220.jpg",
                                isTemp: true // 一時的な隔離イベントであることを明示
                            });
                            
                            // 2. ジャンプ先以降のイベント群（被弾から delay 秒後以降に再配置）
                            if (window.roomEvents[roomID]) {
                                window.roomEvents[roomID].forEach(e => {
                                    if (e.isTemp) return; // 一時的な隔離イベントはスキップ
                                    const eDefTime = e.defTime != null ? e.defTime : (e.time != null ? SurveillanceGame.utils.parseTimeToSeconds(e.time) : null);
                                    if (e.defTime == null) return; // defTimeがない動的追加イベントもスキップ
                                    if (eDefTime != null && eDefTime >= defJumpSeconds) {
                                        const newEvent = JSON.parse(JSON.stringify(e));
                                        if (newEvent.shootArea) {
                                            (Array.isArray(newEvent.shootArea) ? newEvent.shootArea : [newEvent.shootArea]).forEach(a => delete a.isHit);
                                        }
                                        const relativeOffset = eDefTime - defJumpSeconds;
                                        newEvent.time = delay + relativeOffset;
                                        newEvent.defTime = eDefTime; // defTimeを明示的に引き継ぐ
                                        branchEvents.push(newEvent);
                                    }
                                });
                            }
                            
                            // 分岐ルートとして適用
                            this.applyHitBranch(roomID, { hitBranch: branchEvents }, totalSeconds);
                            
                        } else {
                            this.performTimelineShift(roomID, activeEvent.jumpTime, activeEvent);
                            if (activeEvent.hitImage) {
                                state.rooms[roomID].image = activeEvent.hitImage;
                                const fullPath = `../fgimage/${SurveillanceGame.utils.resolveImagePath(roomID, activeEvent.hitImage)}`;
                                TYRANO.kag.ftag.startTag("bg", { storage: fullPath, time: 100, wait: "false" });
                            }
                        }
                    } else if (activeEvent.hitImage) {
                        state.rooms[roomID].image = activeEvent.hitImage;
                        const fullPath = `../fgimage/${SurveillanceGame.utils.resolveImagePath(roomID, activeEvent.hitImage)}`;
                        TYRANO.kag.ftag.startTag("bg", { storage: fullPath, time: 100, wait: "false" });
                    }
                    if (activeEvent.hitMessage) {
                        SurveillanceGame.timer.setTimeout(() => {
                            ui.showSystemMessage(activeEvent.name || "???", activeEvent.hitMessage);
                            SurveillanceGame.timer.setTimeout(() => ui.clearSystemMessage(), 3000);
                        }, 300);
                    }

                    if (activeEvent.se) sound.play(activeEvent.se, "6");
                    sound.play("button01.ogg", "7");
                }, 30);
            },

            performTimelineShift(roomID, jumpTime, activeEvent = null) {
                const { state, utils } = SurveillanceGame;
                const currentSeconds = state.minute * 60 + state.second;
                state.rooms[roomID].isJumpPending = false;

                // ディフェンシブ・プログラミング：defTime が初期化されていない場合に備え、その場で補完する
                if (window.roomEvents[roomID]) {
                    window.roomEvents[roomID].forEach(e => {
                        if (e.time != null && e.defTime == null) {
                            e.defTime = typeof e.time === 'number' ? e.time : utils.parseTimeToSeconds(e.time);
                        }
                    });
                }

                let targetEvent = activeEvent;
                if (window.roomEvents[roomID]) {
                    const defJumpSeconds = utils.parseTimeToSeconds(jumpTime);
                    // defTime が定義時の元の秒数と一致するイベントオブジェクトを特定する
                    const foundEvent = window.roomEvents[roomID].find(e => e.defTime === defJumpSeconds);
                    if (foundEvent) {
                        targetEvent = foundEvent;
                    }
                }

                // 真の現在のジャンプ先秒数を取得
                let jumpSeconds;
                if (targetEvent && targetEvent.time != null) {
                    jumpSeconds = typeof targetEvent.time === 'number' ? targetEvent.time : utils.parseTimeToSeconds(targetEvent.time);
                } else {
                    jumpSeconds = utils.parseTimeToSeconds(jumpTime);
                }

                const offset = currentSeconds - jumpSeconds;

                if (window.roomEvents[roomID]) {
                    window.roomEvents[roomID].forEach((e, index) => {
                        if (e.time == null) return;
                        const eSec = typeof e.time === 'number' ? e.time : utils.parseTimeToSeconds(e.time);
                        
                        // 安全なフォールバックを適用した比較用 defTime の取得
                        const targetDefTime = (targetEvent && targetEvent.defTime != null) ? targetEvent.defTime : utils.parseTimeToSeconds(jumpTime);
                        const eDefTime = e.defTime != null ? e.defTime : eSec;

                        if (eDefTime >= targetDefTime) {
                            e.time = eSec + offset;
                            if (e.shootArea) (Array.isArray(e.shootArea) ? e.shootArea : [e.shootArea]).forEach(a => delete a.isHit);

                            // 古いキーを processedEvents から削除して再トリガーを保証
                            state.processedEvents.forEach(key => {
                                if (key.startsWith(`${roomID}_${index}_`)) {
                                    state.processedEvents.delete(key);
                                }
                            });
                        } else {
                            e.time = null;
                        }
                    });
                }

                // ディレイ満了・タイムラインシフト完了時に、強制的にダメージ状態から復帰させる
                if (targetEvent && targetEvent.image) {
                    state.rooms[roomID].hasHitTarget = false;
                    state.rooms[roomID].image = targetEvent.image;
                }

                if (state.rooms[roomID]) state.rooms[roomID].isJumping = true;
                this.checkRoomEvents();
                if (state.rooms[roomID]) state.rooms[roomID].isJumping = false;
            },

            clearRoomDistortions(roomID) {
                const { state } = SurveillanceGame;

                state.rooms[roomID].isUpsideDown = false;
                state.rooms[roomID].isMirror = false;
                if (state.currentRoom === roomID) {
                    this.updateRoomEffects(roomID);
                }
            },

            /**
             * ズーム変更
             */
            changeZoom(delta) {
                const { state, ui, sound } = SurveillanceGame;

                const nextZoom = state.zoomLevel + delta;
                if (nextZoom < 1 || nextZoom > 3) return;

                // ズーム切り替え時にドラッグ状態を強制解除して効果音を停止
                state.drag.isDragging = false;
                $('#hud-container').removeClass('is-panning');
                sound.stop("move.ogg");

                state.zoomLevel = nextZoom;
                state.drag.offsetX = 0;
                state.drag.offsetY = 0;

                this.applyZoom();
                ui.updateZoomButtons();
                sound.play("zoom.ogg", "4");
            },



            applyZoom(immediate = false) {
                const { state } = SurveillanceGame;
                const roomData = state.rooms[state.currentRoom];
                const scale = this.getCurrentScale();
                const { offsetX: tx, offsetY: ty } = state.drag;
                const $layers = $('#root_layer_game');
                const $hud = $('#hud-container');
                
                let transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
                if (roomData && roomData.isMirror) transform += " scaleX(-1)";
                if (roomData && roomData.isUpsideDown) transform += " scaleY(-1)";

                $layers.css({
                    'transition': immediate ? 'none' : 'transform 0.3s ease-out',
                    'transform': transform,
                    'transform-origin': 'center center'
                });

                $hud.toggleClass('zoom-panning', scale > 1.0);
                if (scale <= 1.0) $hud.removeClass('is-panning');
                this.updateDebugHitZoneDisplay();
            },

            updateOffset(dx, dy) {
                const { state } = SurveillanceGame;
                const scale = this.getCurrentScale();
                const maxX = (1280 * (scale - 1)) / 2;
                const maxY = (720 * (scale - 1)) / 2;

                state.drag.offsetX = Math.max(-maxX, Math.min(maxX, state.drag.offsetX + dx));
                state.drag.offsetY = Math.max(-maxY, Math.min(maxY, state.drag.offsetY + dy));

                const roomData = state.rooms[state.currentRoom];
                let transform = `translate(${state.drag.offsetX}px, ${state.drag.offsetY}px) scale(${scale})`;
                if (roomData && roomData.isMirror) transform += " scaleX(-1)";
                if (roomData && roomData.isUpsideDown) transform += " scaleY(-1)";

                $('#root_layer_game').css({
                    'transition': 'none',
                    'transform': transform
                });
                this.updateDebugHitZoneDisplay();
            },

            /**
             * 分岐処理
             */
            applyTimeoutBranch(roomID, event, seconds, branchTime = 0, branchEvents = null) {
                const { state } = SurveillanceGame;
                if (state.rooms[roomID]) {
                    state.rooms[roomID].isBranchActive = true;
                    if (roomID === state.currentRoom) this.updateDebugBranchIndicator();
                }
                delete state.pendingTimeouts[roomID];
                this.rebuildRoomEvents(roomID, branchEvents || event.timeoutBranch, seconds, branchTime);
                if (event.timeoutImage) this.triggerEvent(roomID, { image: event.timeoutImage }, seconds);
                this.checkRoomEvents();
            },

            applyHitBranch(roomID, event, seconds) {
                const { state } = SurveillanceGame;
                if (state.rooms[roomID]) {
                    state.rooms[roomID].isBranchActive = true;
                    if (roomID === state.currentRoom) this.updateDebugBranchIndicator();
                }
                delete state.pendingTimeouts[roomID];
                if (roomID !== 'r1') {
                    state.flags[`${roomID}_safe`] = true;
                }
                state.rooms[roomID].hasHitTarget = true;
                this.rebuildRoomEvents(roomID, event.hitBranch, seconds);
                this.checkRoomEvents();
            },

            rebuildRoomEvents(roomID, branchEvents, seconds, branchTime = 0) {
                const { state, utils } = SurveillanceGame;

                // 部屋5かつ被弾による再構築の際、適した分岐用イベント配列に差し替える
                if (roomID === 'r5' && (branchEvents === true || branchEvents === 'revived' || state.rooms['r5']?.hasHitTarget)) {
                    if (branchEvents === 'revived') {
                        branchEvents = window.r5_hit_branch_revived || window.r5_hit_branch || branchEvents;
                    } else {
                        branchEvents = window.r5_hit_branch || branchEvents;
                    }
                }

                window.roomEvents[roomID] = [];
                state.processedEvents = new Set([...state.processedEvents].filter(k => !k.startsWith(roomID + '_')));

                if (branchEvents && Array.isArray(branchEvents)) {
                    const baseSeconds = seconds - branchTime;
                    branchEvents.forEach(bEvent => {
                        const newEvent = JSON.parse(JSON.stringify(bEvent));
                        newEvent.time = baseSeconds + utils.parseTimeToSeconds(bEvent.time);
                        if (typeof bEvent.jumpTime === 'number') newEvent.jumpTime = baseSeconds + bEvent.jumpTime;
                        if (bEvent.defTime !== undefined) newEvent.defTime = bEvent.defTime; // defTimeを明示的に維持する
                        window.roomEvents[roomID].push(newEvent);
                    });
                }

                // 部屋5の場合、再構築されたイベントリストに対して再度ゲッターを設定する！
                if (roomID === 'r5' && window.roomEvents['r5']) {
                    window.roomEvents['r5'].forEach(ev => {
                        const isApproachingEvent = ev.image && (
                            ev.image.includes('r5_room_0120') ||
                            ev.image.includes('r5_room_0125') ||
                            ev.image.includes('r5_room_0130') ||
                            ev.image.includes('r5_room_0135')
                        );
                        const isBranchHitEvent = ev.image && (
                            ev.image.includes('r5_room_A001') ||
                            ev.image.includes('r5_room_A002') ||
                            isApproachingEvent
                        );
                        if (isBranchHitEvent && ev.shootArea) {
                            const isRevived = ev.image.includes('r5_room_A002');
                            Object.defineProperty(ev, 'hitBranch', {
                                get: function() {
                                    // 復活(A002)の場合は'revived'を返し、それ以外はtrueを返す
                                    return isRevived ? 'revived' : true;
                                },
                                enumerable: true,
                                configurable: true
                            });
                            ev.hitImage = 'r5_room_A001.jpg';
                        }
                    });
                }
            },

            applyDebugBranch() {
                if (typeof TYRANO === 'undefined' || !TYRANO.kag.variable.tf) return;
                const tf = TYRANO.kag.variable.tf;
                const { state } = SurveillanceGame;

                const processBranch = (roomID, timeVal) => {
                    if (timeVal === undefined || timeVal === null) return;
                    const branchTime = parseInt(timeVal, 10);
                    const events = window.roomEvents[roomID] || [];
                    const eventWithBranch = events.find(e => e.timeoutBranch);
                    
                    if (eventWithBranch) {
                        const startAt = (state.minute * 60 + state.second) - branchTime;
                        this.rebuildRoomEvents(roomID, eventWithBranch.timeoutBranch, startAt);
                        console.log(`[Debug] Forced branch applied to ${roomID} (Offset: ${branchTime}s)`);
                    }
                };

                // 分かりやすい名前での個別指定
                processBranch('r1', tf.debug_r1_invasion);
                processBranch('r2', tf.debug_r2_death);
                
                // 他の部屋も汎用的に対応可能にしておく
                ['r3', 'r4', 'r5'].forEach(id => {
                    processBranch(id, tf[`debug_${id}_branch`]);
                });

                // 旧フラグとの互換性維持
                if (tf.start_branch_time != null) {
                    processBranch(tf.start_branch_room || state.currentRoom, tf.start_branch_time);
                }
            },

            /**
             * ユーティリティ & デバッグ
             */
            getCurrentScale() {
                const { state } = SurveillanceGame;
                if (state.zoomLevel === 2) return 1.3;
                if (state.zoomLevel === 3) return 1.8;
                return 1.0;
            },

            getActiveEvent(roomID, totalSeconds) {
                const { state, utils } = SurveillanceGame;
                const roomData = state.rooms[roomID];
                
                // ジャンプ待機中（hitJumpDelayの遅延中）は、ショットエリア等の判定を無効化するためアクティブイベントを返さない
                if (roomData && roomData.isJumpPending) {
                    return null;
                }
                
                // ランダムリピートのイベントもフラグチェックを行う
                if (roomData.randomRepeat?.activeEvent) {
                    const ev = roomData.randomRepeat.activeEvent;
                    if (!(ev.flag && !state.flags[ev.flag]) && !(ev.notFlag && state.flags[ev.notFlag])) {
                        return ev;
                    }
                }
                
                const events = window.roomEvents[roomID] || [];
                for (let i = events.length - 1; i >= 0; i--) {
                    const ev = events[i];
                    if (ev.time != null && utils.parseTimeToSeconds(ev.time) <= totalSeconds) {
                        // フラグ条件を満たさない（＝実行されなかった）イベントはスキップして前のイベントを探す
                        if (ev.flag && !state.flags[ev.flag]) continue;
                        if (ev.notFlag && state.flags[ev.notFlag]) continue;
                        return ev;
                    }
                }
                return null;
            },

            /**
             * タイトル変化用クリアフラグの条件チェック
             */
            checkClearFlag(roomID) {
                const { state } = SurveillanceGame;
                if (state.currentRoom !== roomID) return;
                
                const roomData = state.rooms[roomID];
                if (!roomData) return;
                
                let flagShouldSet = false;
                
                // 現在表示されているアクティブイベントを取得
                const totalSeconds = state.minute * 60 + state.second;
                const activeEvent = this.getActiveEvent(roomID, totalSeconds);
                
                if (roomID === 'r1') {
                    // r1.js: { time: "4:27", image: 'r1_room_0427.jpg', isJammed: true }
                    if (roomData.image === 'r1_room_0427.jpg' && activeEvent && activeEvent.isJammed) {
                        flagShouldSet = true;
                    }
                } else if (roomID === 'r2') {
                    // r2.js: { time: "4:50", image: 'r2_room_0450.jpg' }
                    if (roomData.image === 'r2_room_0450.jpg') {
                        flagShouldSet = true;
                    }
                } else if (roomID === 'r3') {
                    // r3.js: { id: "man_escaped", image: 'r3_room.jpg', effect: "strong_noise", isDead: true, isEscaped: true }
                    if (roomData.isEscaped && roomData.image === 'r3_room.jpg') {
                        flagShouldSet = true;
                    }
                } else if (roomID === 'r4') {
                    // r4.js: { image: 'r4_room_A001.jpg' }
                    if (roomData.image === 'r4_room_A001.jpg') {
                        flagShouldSet = true;
                    }
                } else if (roomID === 'r5') {
                    // r5.js: { image: 'r5_room_0135.jpg' }
                    if (roomData.image === 'r5_room_0135.jpg') {
                        flagShouldSet = true;
                    }
                }
                
                if (flagShouldSet && typeof TYRANO !== 'undefined') {
                    const sf = TYRANO.kag.variable.sf;
                    if (!sf['report_' + roomID]) {
                        sf['report_' + roomID] = true;
                        TYRANO.kag.saveSystemVariable();
                        console.log(`[Flag] sf.report_${roomID} set to true (Visual confirmation)`);
                    }
                }
            },

            updateDebugBranchIndicator() {
                const { state } = SurveillanceGame;
                const $indicator = $('#debug-branch-indicator');
                if ($indicator.length === 0) return;
                // デバッグモードが有効であっても、分岐ルートでの BRANCH ROUTE 表示は行わないように変更
                $indicator.toggle(false);
            },

            updateDebugHitZoneDisplay() {
                $('.hud-debug-azone, .hud-debug-focus-zone').remove();
                if (typeof TYRANO === 'undefined' || !TYRANO.kag.variable.tf.show_hit_zone) return;
                
                const { state, utils } = SurveillanceGame;
                if (state.rooms[state.currentRoom].isDead) return;

                const totalSeconds = state.minute * 60 + state.second;
                const activeEvent = this.getActiveEvent(state.currentRoom, totalSeconds);
                const $container = $('#hud-container');

                if (activeEvent?.shootArea) {
                    const areas = Array.isArray(activeEvent.shootArea) ? activeEvent.shootArea : [activeEvent.shootArea];
                    const scale = this.getCurrentScale();
                    const { offsetX: tx, offsetY: ty } = state.drag;
                    const isMirror = state.rooms[state.currentRoom].isMirror;
                    const isUpsideDown = state.rooms[state.currentRoom].isUpsideDown;

                    areas.forEach(area => {
                        if (area.isHit) return;
                        let ax = area.x;
                        let ay = area.y;
                        if (isMirror) ax = 1280 - (area.x + area.w);
                        if (isUpsideDown) ay = 720 - (area.y + area.h);

                        $('<div class="hud-debug-azone"></div>').css({
                            position: 'absolute',
                            left: ((ax - 640) * scale + 640 + tx) + 'px',
                            top: ((ay - 360) * scale + 360 + ty) + 'px',
                            width: (area.w * scale) + 'px',
                            height: (area.h * scale) + 'px',
                            backgroundColor: 'rgba(0, 255, 255, 0.2)',
                            border: '1px solid cyan',
                            zIndex: 10001,
                            pointerEvents: 'none',
                            boxSizing: 'border-box'
                        }).appendTo($container);
                    });
                }

                if (state.zoomLevel > 1) {
                    const isWatching = activeEvent ? utils.isWatchingTarget(state.currentRoom, activeEvent) : false;
                    const [w, h] = [600, 400];
                    const $focus = $('<div class="hud-debug-focus-zone"></div>').css({
                        position: 'absolute',
                        left: (640 - w / 2) + 'px',
                        top: (360 - h / 2) + 'px',
                        width: w + 'px',
                        height: h + 'px',
                        border: isWatching ? '2px solid rgba(255, 0, 0, 0.8)' : '2px dashed rgba(0, 255, 255, 0.5)',
                        borderRadius: '10px',
                        pointerEvents: 'none',
                        zIndex: 10002,
                        boxSizing: 'border-box'
                    }).appendTo($container);
                    if (isWatching) $focus.append('<div style="position:absolute; top:-25px; left:0; color:red; font-family:sans-serif; font-size:14px; font-weight:bold; text-shadow: 1px 1px 2px black;">WATCHING</div>');
                }
            },

            advanceTime(seconds = 10) {
                const { state } = SurveillanceGame;
                const oldTotal = state.minute * 60 + state.second;
                const nextTotal = (Math.floor(oldTotal / seconds) + 1) * seconds;
                const elapsed = nextTotal - oldTotal;

                // 1. まず既存のタイマーをスキップ秒数分進める（現在の時刻で行う）
                Object.keys(state.rooms).forEach(roomID => {
                    state.rooms[roomID].flickerId++;
                    this.updateRoomTimerLogic(roomID, elapsed);
                });

                // 2. 時刻を更新する
                state.minute = Math.floor(nextTotal / 60);
                state.second = nextTotal % 60;
                SurveillanceGame.ui.updateClock();

                // 3. スキップ中に発生したイベントをトリガーする
                // triggerEvent内では、時刻が更新されているため、スキップ分が考慮される
                this.checkRoomEvents();

                // 4. 新しくセットされたイベントのタイマーも含め、即座に条件判定を行う
                Object.keys(state.rooms).forEach(roomID => {
                    this.updateRoomTimerLogic(roomID, 0);
                });

                this.updateDebugHitZoneDisplay();
                if (state.minute >= 5) this.handleGameOver();
            },

            reviveAll() {
                const { state } = SurveillanceGame;
                Object.keys(state.rooms).forEach(id => {
                    state.rooms[id].isDead = false;
                });
                this.changeRoom(state.currentRoom);
                SurveillanceGame.ui.addChatMessage("SYSTEM", "DEBUG: ALL ROOMS REVIVED", "#00ff41");
            },

            toggleDebugMode() {
                if (typeof TYRANO === 'undefined') return;
                const tf = TYRANO.kag.variable.tf;
                tf.debug_mode = !tf.debug_mode;
                
                // Toggle hit zones as well
                tf.show_hit_zone = tf.debug_mode;
                
                this.updateDebugHitZoneDisplay();
                this.updateDebugBranchIndicator();
                
                const status = tf.debug_mode ? "ENABLED" : "DISABLED";
                SurveillanceGame.ui.addChatMessage("SYSTEM", `DEBUG MODE: ${status}`, "#00ff41");
                SurveillanceGame.sound.play("hover.ogg", "2");
            }
        }
    };

    // --- グローバルラッパー (TyranoScript・既存互換用) ---
    window.initHUDLayout = () => SurveillanceGame.ui.initLayout();
    window.addChatMessage = (n, t, c, a) => SurveillanceGame.ui.addChatMessage(n, t, c, a);
    window.finishChatTyping = () => SurveillanceGame.ui.finishChatTyping();
    window.clearSystemMessage = () => SurveillanceGame.ui.clearSystemMessage();
    window.clearChatLog = () => SurveillanceGame.ui.clearChatLog();
    window.showSystemMessage = (n, t, c, y) => SurveillanceGame.ui.showSystemMessage(n, t, c, y);
    window.finishSystemMessageTyping = () => SurveillanceGame.ui.finishSystemMessageTyping();
    window.startSurveillance = () => SurveillanceGame.engine.start();
    window.initSurveillanceHUD = async () => { SurveillanceGame.ui.initLayout(); await SurveillanceGame.engine.start(); };
    window.changeRoom = (id) => SurveillanceGame.engine.changeRoom(id);
    window.toggleGunMode = (e, s) => SurveillanceGame.engine.toggleGunMode(e, s);
    window.fireGun = (e) => SurveillanceGame.engine.fireGun(e);
    window.updateBulletsUI = () => SurveillanceGame.ui.updateBulletsUI();
    window.changeZoom = (d) => SurveillanceGame.engine.changeZoom(d);
    window.advanceGameTime = () => SurveillanceGame.engine.advanceTime(10);
    window.advanceGameTime5 = () => SurveillanceGame.engine.advanceTime(5);
    window.reviveAll = () => SurveillanceGame.engine.reviveAll();
    window.triggerRoomEvent = (r, e, s) => SurveillanceGame.engine.triggerEvent(r, e, s);
    window.applyTimeoutBranch = (r, e, s) => SurveillanceGame.engine.applyTimeoutBranch(r, e, s);
    window.applyHitBranch = (r, e, s) => SurveillanceGame.engine.applyHitBranch(r, e, s);
    window.checkRoomEvents = () => SurveillanceGame.engine.checkRoomEvents();
    window.gameState = SurveillanceGame.state;
    window.playHoverSound = () => SurveillanceGame.sound.playHover();
    window.cleanupSurveillanceGame = () => SurveillanceGame.engine.cleanup();

})();
