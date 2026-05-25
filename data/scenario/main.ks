
; 監視カメラゲーム：メイン
*start_surveillance
[fadeinbgm storage="air.ogg" time="2000"]
[cm]
[iscript]
    window.clearChatLog();
[endscript]
[freeimage layer="message0"]
[layopt layer="message0" visible="false"]

; 映像の開始とHUDの本起動
[iscript]
    window.initHUDLayout();

    const tfVars = TYRANO.kag.variable.tf || (TYRANO.kag.variable.tf = {});
    if (!tfVars.initial_bg_path) {
        const startRoom = /^r[1-5]$/.test(tfVars.start_room || "") ? tfVars.start_room : "r1";
        tfVars.initial_bg_path = "../fgimage/" + startRoom + "/" + startRoom + "_room.jpg";
    }

    TYRANO.kag.ftag.startTag("bg", { storage: tfVars.initial_bg_path, time: "500" });
[endscript]

[iscript]
    window.startSurveillance();
[endscript]

; 音声のプリロードとBGM開始
[preload storage="data/sound/button01.ogg"]
[preload storage="data/sound/monitanoizu01.ogg"]
[preload storage="data/sound/noise.ogg"]
[preload storage="data/sound/gunhand.ogg"]
[preload storage="data/sound/gun.ogg"]


; ゲームループ
*main_loop
[s]

; ゲームクリア：午前5時
*game_clear
[stopbgm]
[cm]
[iscript]
    tf.ending_type = 'clear';
[endscript]
[jump storage="epilogue.ks"]

; 任務失敗：1〜4室死亡
*mission_failed
[stopbgm]
[cm]
[iscript]
    tf.ending_type = 'failed';
[endscript]
[jump storage="epilogue.ks"]

; ゲームオーバー：全室死亡（即時終了）
*game_over
[stopbgm]
[cm]
[iscript]
    tf.ending_type = 'gameOver';
[endscript]
[jump storage="epilogue.ks"]
