
; プロローグシーン (完全JavaScript制御)

[cancelskip]
[autostop]
[iscript]
    TYRANO.kag.stat.is_skip = false;
    TYRANO.kag.stat.is_auto = false;

    // ─── 残留HUDを削除して黒画面にする ───
    // ※ background-image はTyranoScriptに任せる（inlineスタイルで上書きすると[bg]が効かなくなる）

    // tyrano_base を黒背景にする
    $('.tyrano_base').css('background-color', 'black');

    // 以前の背景画像を完全に消去する（baseレイヤーおよびbase_foreレイヤーをクリア）
    $('.layer_base, .base_fore').empty().css('background-image', 'none');

    // HUD・ゲームUI を完全削除（frame.png / crt.png 等を含む）
    $('#hud-container').remove();
    $('#hud-container-title').remove();
    $('#hud-system-message').remove();
    $('#staff-blocker').remove();
    $('#staff-skip-btn').remove();

    // エフェクトクラスをすべて解除
    $('.tyrano_base, #tyrano_base').removeClass(
        'is-upside-down is-mirror is-panning crt-turn-off is-strong-noise'
    );
    $('.layer_camera').removeClass('is-blurred-penalty');
[endscript]

; フェードイン（tyrano_baseが黒なので黒画面から始まる）
[Fi]
[wait time="300"]

; HUDを初期化してチャットログ(#hud-chat-log)を生成する（テキスト表示に必須）
[iscript]
    window.initHUDLayout();
[endscript]

; JavaScriptによる会話制御
[iscript]
(function() {

    const dialogues = [

        { name: "SA-01", text: "こちらSA-01。[l]エリアA13……研究室だ。[l]大型の檻を確認。内部は視認不可だが、何かいる。[l]……事前説明にはなかったな。" },

        { name: "SA-03", text: "SA-03、地下区画C5。室内中央に拘束衣の人物を確認。[l]椅子に固定状態。生体反応あり。"},

        { name: "SA-04", text: "SA-04、2階エリアD3。[l]洋室中央に女性……着座状態。人間か？" },

        { name: "SA-05", text: "SA-05、地下通路E7。視界外だが、奥から断続的な気配。" },

        { name: "SA-02", text: "SA-02、エントランス。奥の部屋から物音。暗闇で視認不可。" },

        { name: "Superior", text: "各員、報告は受領した。[l]現時点では対象は未確認存在として扱え。" },
        { name: "Superior", text: "直ちに排除班を要請する。[l]到着まで当該地点にて監視を継続せよ。[l]待機時間は約5分を見込む。" },
        { name: "Superior", text: "各員、銃の使用は許可する。[l]必要に応じて各自判断で対処せよ。" },

        { name: "SA-01～05", text: "了解。"}

    ];

    let currentIndex = 0;
    let currentSegments = [];
    let segmentIndex = 0;
    let isProcessing = false;

    async function showNext() {
        // タイピング中なら即座に完了させる
        if (window.isChatTyping) {
            window.finishChatTyping();
            return;
        }

        if (isProcessing) return;
        isProcessing = true;

        try {
            // 分割されたセリフの残りがある場合
            if (currentSegments.length > 0 && segmentIndex < currentSegments.length) {
                const d = dialogues[currentIndex - 1];
                await window.addChatMessage(d.name, currentSegments[segmentIndex], undefined, true);
                segmentIndex++;
                return;
            }

            if (currentIndex < dialogues.length) {
                const d = dialogues[currentIndex];
                currentIndex++;
                
                // [l] でセリフを分割
                currentSegments = d.text.split('[l]');
                
                if (currentSegments.length > 1) {
                    segmentIndex = 1;
                    await window.addChatMessage(d.name, currentSegments[0]);
                } else {
                    currentSegments = [];
                    segmentIndex = 0;
                    await window.addChatMessage(d.name, d.text);
                }
            } else {
                // 全セリフ終了時の演出
                // セリフ表示時と同じSEを再生
                // 通信終了音 (100ms遅延させてデコード競合を回避)
                if (typeof TYRANO !== 'undefined') {
                    setTimeout(() => {
                        TYRANO.kag.ftag.startTag("playse", { storage: "transceiver.ogg", buf: "5" });
                    }, 100);
                }

                // プロローグ読了フラグを設定
                if (typeof TYRANO !== 'undefined' && TYRANO.kag.variable.sf) {
                    TYRANO.kag.variable.sf.prologue = true;
                    TYRANO.kag.saveSystemVariable();
                }

                // ログ消去
                window.clearChatLog();

                // イベントリスナーの解除
                $('.tyrano_base').off('mousedown.prologue');
                $(document).off('mouseup.prologue');
                $(document).off('keydown.prologue');
                if (typeof prologueHoldInterval !== 'undefined' && prologueHoldInterval) {
                    clearInterval(prologueHoldInterval);
                }

                // スキップボタンを削除
                $('#staff-skip-btn').remove();

                // 1200ms 待機してからメイン画面へ
                setTimeout(function() {
                    TYRANO.kag.ftag.startTag("jump", { storage: "main.ks", target: "*start_surveillance" });
                }, 1200);
            }
        } finally {
            isProcessing = false;
        }
    }

    let prologueHoldInterval = null;
    
    // sf.prologue が true ならスキップボタンを表示
    if (TYRANO.kag.variable.sf.prologue) {
        const $skipBtn = $('<div id="staff-skip-btn">SKIP >></div>');
        $('.tyrano_base').append($skipBtn);
        $skipBtn.on('click', (e) => {
            e.stopPropagation();
            if (typeof TYRANO !== 'undefined') {
                TYRANO.kag.ftag.startTag("playse", { storage: "hover.ogg" });
                if (TYRANO.kag.variable.sf) {
                    TYRANO.kag.variable.sf.prologue = true;
                    TYRANO.kag.saveSystemVariable();
                }
            }
            $skipBtn.remove();
            
            // イベントリスナーの解除
            $('.tyrano_base').off('mousedown.prologue');
            $(document).off('mouseup.prologue');
            $(document).off('keydown.prologue');
            if (prologueHoldInterval) {
                clearInterval(prologueHoldInterval);
            }
            
            // ログ消去
            window.clearChatLog();
            
            // 即座にメイン画面へ
            TYRANO.kag.ftag.startTag("jump", { storage: "main.ks", target: "*start_surveillance" });
        });
    }

    // 初回表示
    if (TYRANO.kag.variable.sf.prologue) {
        isProcessing = true;
        setTimeout(function() {
            isProcessing = false;
            showNext();
        }, 300);
    } else {
        showNext();
    }

    const advanceHandler = function(e) {
        if (e.type === 'keydown' && e.key !== 'Enter') return;
        showNext();
    };

    const startHold = function(e) {
        if ($(e.target).closest('button').length > 0) return;
        if (e.button !== 0) return; // 左クリックのみ
        showNext();
        if (!prologueHoldInterval) {
            prologueHoldInterval = setInterval(() => {
                showNext();
            }, 50);
        }
    };

    const stopHold = function(e) {
        if (prologueHoldInterval) {
            clearInterval(prologueHoldInterval);
            prologueHoldInterval = null;
        }
    };

    // マウス長押しおよびEnterキーイベント登録
    $('.tyrano_base').on('mousedown.prologue', startHold);
    $(document).on('mouseup.prologue', stopHold);
    $(document).on('keydown.prologue', advanceHandler);
})();
[endscript]

; ここでエンジンの進行を停止
[s]
