
; ==============================
; オーバーレイ用コンテナ
; ==============================
[iscript]
if ($("#config_overlay").length === 0) {
    const $overlay = $("<div>", { id: "config_overlay" });
    $("#tyrano_base").append($overlay);
}
[endscript]

; ==============================
; config 本体
; ==============================
[iscript]
(function () {

    const $overlay = $("#config_overlay");
    if ($overlay.length === 0) return;



    // ==========================
    // 初回生成
    // ==========================
    if (!$overlay.data("initialized")) {

        const $blocker = $("<div>").addClass("config_blocker");
        const $configBox = $("<div>").addClass("config_box");
        const $title = $("<div>").text("SOUND").addClass("config_title");

        const bgmVol = TYRANO.kag.config.defaultBgmVolume;
        const seVol  = TYRANO.kag.config.defaultSeVolume;

        const $volumeArea = $("<div>").addClass("config_volume_area");

        const $bgmContainer = $("<div>").addClass("config_container");
        const $bgmLabel = $("<div>").text("BGM VOLUME").addClass("config_label");
        const $bgmSlider = $("<input>", { type: "range", min: 0, max: 100, value: bgmVol })
            .on("input", function () {
                TYRANO.kag.ftag.startTag("bgmopt", { volume: Number(this.value) });
            });
        $bgmContainer.append($bgmLabel, $bgmSlider);

        const $seContainer = $("<div>").addClass("config_container");
        const $seLabel = $("<div>").text("SE VOLUME").addClass("config_label");
        const $seSlider = $("<input>", { type: "range", min: 0, max: 100, value: seVol })
            .on("input", function () {
                TYRANO.kag.ftag.startTag("seopt", { volume: Number(this.value) });
            });
        $seContainer.append($seLabel, $seSlider);



        // ==========================
        // 閉じる処理
        // ==========================
        function closeConfig() {
            console.log("closeConfig triggered");

            TYRANO.kag.ftag.startTag("playse", {
                storage: "cancel.ogg",
                stop: "true"
            });

            $overlay.fadeOut(10);
        }

        $blocker.on("click", closeConfig);

        $volumeArea.append($bgmContainer, $seContainer);
        $configBox.append($title, $volumeArea);

        $overlay
            .append($blocker)
            .append($configBox);

        $overlay.data("initialized", true);
    }

    // ==========================
    // config 表示時の処理
    // ==========================
    (function lockScrollBeforeOpen() {
        const logBox = document.getElementById("sc_log");
        if (logBox) {
            f.lock_scroll_during_config = true;
            f.config_scroll_top = logBox.scrollTop;
        }
    })();

    $overlay.fadeIn(10);

})();
[endscript]

[return]
