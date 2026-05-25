; エピローグシナリオ (Javascript集約版)

*start
[eval exp="tf.debug_epilogue_start='full'"]
[jump target="*perform"]

*report
[eval exp="tf.debug_epilogue_start='report'"]
[jump target="*perform"]

*staff
[eval exp="tf.debug_epilogue_start='staff'"]
[jump target="*perform"]

*perform
[cm]
[clearfix]
[eval exp="sf.epilogue_reached=true"]

; HUDコンテナを表示し、メッセージウィンドウの不可視化を維持（システムメッセージを使用するため）
[iscript]
    $('#hud-container').show();
    // ログを一度クリア
    window.clearChatLog();
[endscript]

; エンディングに応じた演出（gameOver時は暗転へ）
[if exp="tf.ending_type == 'gameOver'"]
[endif]

[iscript]
(function() {
    const tf = TYRANO.kag.variable.tf;
    const data = window.epilogueDialogues[tf.ending_type] || window.epilogueDialogues.clear;
    const lines = data.lines;
    let currentIndex = 0;
    let isProcessing = false;
    let hasStartedEnding = false; // 終了演出の多重起動防止フラグ
    let lastAdvanceTime = 0;
    let epilogueHoldInterval = null;

    // デバッグ開始フラグの取得
    const startPart = TYRANO.kag.variable.tf.debug_epilogue_start || 'full';

    // ダイアログ進行関数
    async function showNext() {
        if (hasStartedEnding) return;
        const now = Date.now();
        // タイピング中なら即座に完了させて終了
        if (window.isSystemMessageTyping) {
            // 短時間での連打やインターバルによる意図しない完了を防止 (200ms)
            if (now - lastAdvanceTime < 200) return;

            window.finishSystemMessageTyping();
            return;
        }

        if (isProcessing) return;
        isProcessing = true;
        lastAdvanceTime = now;

        try {
            if (currentIndex < lines.length) {
                const line = lines[currentIndex];
                currentIndex++;
                
                // システムメッセージを表示
                await window.showSystemMessage(line.name, line.text);
            } else {
                if (hasStartedEnding) return;
                hasStartedEnding = true;

                // 通信終了音 (100ms遅延させてデコード競合を回避)
                if (typeof TYRANO !== 'undefined') {
                    setTimeout(() => {
                        TYRANO.kag.ftag.startTag("playse", { storage: "transceiver.ogg", buf: "5" });
                    }, 100);
                }

                // 全セリフ終了：イベントを解除して演出へ
                $('.tyrano_base').off('mousedown.epilogue');
                $(document).off('mouseup.epilogue');
                $(document).off('keydown.epilogue');
                if (epilogueHoldInterval) {
                    clearInterval(epilogueHoldInterval);
                    epilogueHoldInterval = null;
                }
                
                // 演出の開始
                startEndingPerformance();
                return; // 以降の処理を完全に遮断
            }
        } finally {
            isProcessing = false;
        }
    }

    // 背景・レイヤーの基本セットアップ
    function setupBlackScreen() {
        $('[class^="layer_"]').hide();
        $('#root_layer_game').hide();
        $('.base_foreground').hide();
        $('.tyrano_base').css('background-color', 'black');
        $('#hud-container').remove();
        $('.tyrano_base').removeClass('crt-turn-off');
        if (typeof TYRANO !== 'undefined') TYRANO.kag.ftag.startTag("layopt", { layer: "1", visible: "true" });
    }

    // クリック待ちヘルパー
    window.isEpilogueMouseHeld = false;
    $(document).on('mousedown.epilogue_global mouseup.epilogue_global', function(e) {
        if (e.button === 0) window.isEpilogueMouseHeld = (e.type === 'mousedown');
    });

    function waitClick() {
        return new Promise(resolve => {
            let holdTimeout = null;
            
            // 手動クリック待ちの設定
            const setupManualClick = () => {
                const cleanup = () => {
                    $('.tyrano_base').off('mousedown.epilogue_wait', handler);
                    $(document).off('keydown.epilogue_wait', handler);
                    $(document).off('mouseup.epilogue_hold_cancel');
                    if (holdTimeout) clearTimeout(holdTimeout);
                };

                const handler = function(e) {
                    if (e.type === 'keydown' && e.key !== 'Enter') return;
                    cleanup();
                    resolve();
                };
                $('.tyrano_base').on('mousedown.epilogue_wait', handler);
                $(document).on('keydown.epilogue_wait', handler);
            };

            // すでにマウスが押されている場合（前行からの継続クリックなど）
            if (window.isEpilogueMouseHeld) {
                // 一度指を離すまでホールドによる進行を無効化し、新規クリックを待つ
                $(document).one('mouseup.epilogue_hold_init', () => {
                    setupManualClick();
                });
                return;
            }

            setupManualClick();
        });
    }

    // 終了演出の実行
    async function startEndingPerformance(forcedStartPart) {
        const currentStartPart = forcedStartPart || startPart;

        // 各部屋のレポートフラグ(sf.report_r1〜report_r5)はゲーム中の目視で立つように変更されたため、
        // エピローグでの自動クリア判定（生存時の一括有効化）は廃止しました。

        // 通信イベントの解除
        $('.tyrano_base').off('mousedown.epilogue');
        $(document).off('mouseup.epilogue');
        $(document).off('keydown.epilogue');
        if (epilogueHoldInterval) {
            clearInterval(epilogueHoldInterval);
            epilogueHoldInterval = null;
        }
        
        // メッセージ消去
        window.clearChatLog();
        
        // 演出シーケンス
        if (currentStartPart === 'full' || currentStartPart === 'report') {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // モニター電源オフ演出 (CRT Turn Off)
            $('.tyrano_base').addClass('crt-turn-off');
             if (typeof TYRANO !== 'undefined') {
                 setTimeout(() => {
                     TYRANO.kag.ftag.startTag("playse", { storage: "monitaoff.ogg" });
                 }, 100);
             }
            
            await new Promise(resolve => setTimeout(resolve, 600));
            setupBlackScreen();
            
            // ゲームクリア時：画面暗転後に銃撃音とウェイト
            if (!TYRANO.kag.variable.tf.ending_type || TYRANO.kag.variable.tf.ending_type === 'clear') {
                await new Promise(resolve => setTimeout(resolve, 1800));
                if (typeof TYRANO !== 'undefined') TYRANO.kag.ftag.startTag("playse", { storage: "machinegun.ogg" });
                await new Promise(resolve => setTimeout(resolve, 4000));
            } else {
                await new Promise(resolve => setTimeout(resolve, 1200));
            }
        } else {
            setupBlackScreen();
        }

        // 1. 任務結果報告
        if (currentStartPart !== 'staff') {
            const report = data.report || [];
            if (report.length > 0) {
                for (const line of report) {
                    // タイピングPromise
                    const typingPromise = window.showSystemMessage(line.name, line.text);
                    lastAdvanceTime = Date.now();
                    
                    // 「タイピング完了」または「クリック」のいずれか早い方を待つ
                    await Promise.race([typingPromise, waitClick()]);
                    
                    // タイピング中にクリックされた場合の処理
                    if (window.isSystemMessageTyping) {
                        const now = Date.now();
                        // 短時間での連打を防止 (200ms)
                        if (now - lastAdvanceTime >= 200) {
                            window.finishSystemMessageTyping();
                            await waitClick(); // 次のクリックで進む
                        } else {
                            // 非常に短い間隔なら無視して、本来のタイピング終了まで待つ
                            await typingPromise;
                            await waitClick(); // 次のクリックで進む
                        }
                    } else {
                        // 自然にタイピングが終了した場合、クリックを待ってから次へ
                        await waitClick();
                    }
                }
                // 通信終了音 (100ms遅延させてデコード競合を回避)
                if (typeof TYRANO !== 'undefined') {
                    setTimeout(() => {
                        TYRANO.kag.ftag.startTag("playse", { storage: "transceiver.ogg", buf: "5" });
                    }, 100);
                }

                window.clearChatLog();
            }
        }

        // 新規取得した実績を判定して表示
        const sf = typeof TYRANO !== 'undefined' ? TYRANO.kag.variable.sf : {};
        const initFlags = window.initialReportFlags || {};
        const reports = window.ReportData || [];
        
        const unlockedReports = [];
        reports.forEach(report => {
            const flag = report.unlockFlag;
            if (flag && !initFlags[flag] && sf[flag]) {
                unlockedReports.push(report);
            }
        });
        
        if (unlockedReports.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await window.showMultipleAchievements(unlockedReports);
        }

        if (TYRANO.kag.variable.tf.ending_type === 'gameOver' || TYRANO.kag.variable.tf.ending_type === 'failed') {
            window.clearSystemMessage();
            TYRANO.kag.ftag.startTag("jump", { target: "*game_over_menu" });
            return;
        }

        // 2. スタッフロール
        await new Promise(resolve => setTimeout(resolve, 2800));

        // エンド曲をSEとして再生
        if (typeof TYRANO !== 'undefined') TYRANO.kag.ftag.startTag("playse", { storage: "case_file.ogg", buf: "1" });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // クリックによるスキップや進行の乱れを防ぐための遮断レイヤー
        const $blocker = $('<div id="staff-blocker" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:10000; pointer-events:auto; cursor:default;"></div>');
        $('.tyrano_base').append($blocker);

        let isSkipped = false;
        let resolveSkip;
        const skipPromise = new Promise(resolve => { resolveSkip = resolve; });

        // sf.goal が true ならスキップボタンを表示
        if (TYRANO.kag.variable.sf.goal) {
            const $skipBtn = $('<div id="staff-skip-btn">SKIP >></div>');
            $('.tyrano_base').append($skipBtn);
            $skipBtn.on('click', (e) => {
                e.stopPropagation();
                if (typeof TYRANO !== 'undefined') {
                    TYRANO.kag.ftag.startTag("playse", { storage: "hover.ogg" });
                    TYRANO.kag.ftag.startTag("stopse", { buf: "1" });
                }
                isSkipped = true;
                $skipBtn.remove();
                resolveSkip();
            });
        }

        const staff = window.epilogueDialogues.staff || [];
        for (const s of staff) {
            if (isSkipped) break;
            
            // タイピング表示（タイピング中もスキップを監視するため Promise.race）
            await Promise.race([
                window.showSystemMessage(s.role, s.name, "#ffffff", "staff"),
                skipPromise
            ]);
            
            if (isSkipped) break;

            // 表示後の待機
            await Promise.race([
                new Promise(resolve => setTimeout(resolve, 2500)),
                skipPromise
            ]);

            if (isSkipped) break;
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        window.clearSystemMessage();
        $('#staff-skip-btn').remove();
        $blocker.remove(); // 遮断解除

        // 3. ロゴ表示へ
        window.clearSystemMessage();
        $('#hud-container').remove(); // HUDを完全に消去して干渉を防ぐ
        
        TYRANO.kag.ftag.startTag("jump", { target: "*show_logo" });
    }

    // 初回表示
    if (startPart === 'full') {
        showNext();
    } else {
        hasStartedEnding = true;
        startEndingPerformance();
    }

        const advanceHandler = function(e) {
            if (hasStartedEnding) return;
            if (e.type === 'keydown' && e.key !== 'Enter') return;
            showNext();
        };

        const startHold = function(e) {
            if (hasStartedEnding) return;
            if ($(e.target).closest('button').length > 0) return;
            if (e.button !== 0) return; // 左クリックのみ
            showNext();
            if (!epilogueHoldInterval) {
                epilogueHoldInterval = setInterval(() => {
                    showNext();
                }, 50);
            }
        };

        const stopHold = function(e) {
            if (epilogueHoldInterval) {
                clearInterval(epilogueHoldInterval);
                epilogueHoldInterval = null;
            }
        };

        $('.tyrano_base').on('mousedown.epilogue', startHold);
        $(document).on('mouseup.epilogue', stopHold);
        $(document).on('keydown.epilogue', advanceHandler);


})();
[endscript]
[s]

; --- 終了後のロゴ表示 ---
    *show_logo

    ;変数：クリア判定
        [VAR e="sf.goal = true"]
        [VAR e="sf.prologue = true"]

	;画像：ロゴ
		[img ly="1" s="end/logo.png" t="800"]

    ;フェード完了を待つ
        [wait time="1000"]

	;画像：ロゴ
		[button graphic="end/logo.png" x="0" y="0" target="*end" clickse="button02.ogg"]

	;削除
		[R1]

		[s]

	;------------------------------------

	*end

	;削除
        [SE s="start.ogg"]

	;削除
       [cm]

	;●
		[W t="300"]

	;フェードアウト
		[mask time="300"]

	;●
		[W t="300"]

	;再読み込み
		[iscript]
			location.reload();
		[endscript]

;----------------------------------------------------------------
; ゲームオーバー時のメニュー
;----------------------------------------------------------------
    *game_over_menu

	;削除
        [cm]
    ; フリーレイヤーの表示とボタン削除を念のため実行
        [iscript]
        $(".layer_free").show();
        $(".title_btn, .old_btn").remove();
        [endscript]

	;●
		[W t="1300"]

	;●
		[SE s="monitahover.ogg"]

    ; リトライボタン・タイトルに戻るボタン
        [glink name="title_btn,start_btn" face="ShareTechMono" text="Retry" font_color="0x00ff41" target="*retry" x="440" y="340" width="400" size="40" clickse="start.ogg" enterse="hover.ogg"]
        [glink name="title_btn,start_btn" face="ShareTechMono" text="Title" font_color="0x00ff41" target="*return_title" x="490" y="480" width="300" size="34" clickse="button02.ogg" enterse="hover.ogg"]

        [s]

;----------------------------------
    *retry

	;削除
        [cm]
        [clearfix]

    ; 一本化された完全クリーンアップ処理の実行
        [iscript]
            if (window.cleanupSurveillanceGame) {
                window.cleanupSurveillanceGame();
            }
            // tyrano_base を黒背景にする
            $('.tyrano_base').css('background-color', 'black');
        [endscript]

	;ジャンプ前にTyrano側でも全レイヤー・BGを完全解放（layoptは呼ばない：内部フラグが壊れてボタン操作不能になるため）
        [stopbgm time="0"]
        [freeimage layer="base" time="0"]
        [freeimage layer="0" time="0"]
        [freeimage layer="1" time="0"]
        [freeimage layer="2" time="0"]
        [freeimage layer="3" time="0"]
        [freeimage layer="4" time="0"]
        [freeimage layer="5" time="0"]
        [freeimage layer="message0" time="0"]
        [freeimage layer="message1" time="0"]
        [freeimage layer="message2" time="0"]

	;ジャンプ
        [jump storage="prologue.ks"]

;----------------------------------
    *return_title

	;削除
        [cm]

	;●
		[W t="500"]

	;ジャンプ
        [iscript]
            location.reload();
        [endscript]

    [s]
