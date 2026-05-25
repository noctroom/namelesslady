window.TitleManager = {
    initRandomBackground: function() {
        const sf = typeof TYRANO !== 'undefined' ? TYRANO.kag.variable.sf : {};
        const images = [
            sf.report_r1 ? "title/title1.jpg" : "../fgimage/r1/r1_room.jpg",
            sf.report_r2 ? "title/title2.jpg" : "../fgimage/r2/r2_room.jpg",
            sf.report_r3 ? "title/title3.jpg" : "../fgimage/r3/r3_room.jpg",
            sf.report_r4 ? "title/title4.jpg" : "../fgimage/r4/r4_room.jpg",
            sf.report_r5 ? "title/title5.jpg" : "../fgimage/r5/r5_room.jpg"
        ];
        const initIdx = Math.floor(Math.random() * images.length);
        if(typeof TYRANO !== 'undefined') {
            TYRANO.kag.variable.tf.init_bg = images[initIdx];
            TYRANO.kag.variable.tf.init_idx = initIdx;
        }
    },

    setupEffects: function() {
        // 1. ノイズ演出の追加 (本編 HUD 互換)
        if ($('#hud-container-title').length === 0) {
            const hudHtml = `
                <div id="hud-container-title" style="position:fixed; top:0; left:0; width:1280px; height:720px; pointer-events:none; z-index:1000;">
                    <div id="hud-noise" style="display:block; opacity: 0.08;"></div>
                    <div id="hud-crt"></div>
                    <div id="hud-overlay"></div>
                    <div id="hud-frame"></div>
                </div>
            `;
            $('.tyrano_base').append(hudHtml);
        }

        // 3. 背景画像ランダム切り替え (9秒周期)
        const sf = typeof TYRANO !== 'undefined' ? TYRANO.kag.variable.sf : {};
        const titleImages = [
            sf.report_r1 ? "data/image/title/title1.jpg" : "data/fgimage/r1/r1_room.jpg",
            sf.report_r2 ? "data/image/title/title2.jpg" : "data/fgimage/r2/r2_room.jpg",
            sf.report_r3 ? "data/image/title/title3.jpg" : "data/fgimage/r3/r3_room.jpg",
            sf.report_r4 ? "data/image/title/title4.jpg" : "data/fgimage/r4/r4_room.jpg",
            sf.report_r5 ? "data/image/title/title5.jpg" : "data/fgimage/r5/r5_room.jpg"
        ];
        
        // 初期画像のインデックス
        let lastTitleIdx = typeof TYRANO !== 'undefined' ? TYRANO.kag.variable.tf.init_idx : 0;
        
        if (window.titleBgInterval) clearInterval(window.titleBgInterval);
        window.titleBgInterval = setInterval(() => {
            // 切り替えノイズ
            const $noise = $('#hud-container-title #hud-noise');
            $noise.css({ 'opacity': '0.7', 'background-image': 'url("./data/fgimage/noise01.png")' }).show();
            
            setTimeout(() => {
                let nextIdx = Math.floor(Math.random() * titleImages.length);
                // 前回と同じ画像が選ばれた場合は選び直す
                while (nextIdx === lastTitleIdx) {
                    nextIdx = Math.floor(Math.random() * titleImages.length);
                }
                lastTitleIdx = nextIdx;
                
                const $bg = $('.title_bg');
                $bg.attr('src', titleImages[nextIdx]);
                
                // ノイズを戻す
                $noise.animate({ 'opacity': '0.08' }, 200);
            }, 50);
        }, 9000);
    },

    clearEffects: function() {
        // インターバルは即座に停止
        if (window.titleBgInterval) {
            clearInterval(window.titleBgInterval);
            window.titleBgInterval = null;
        }
        
        // 現在の変形状態（行列）を取得して固定することで、スナップバックを防ぐ
        const $bg = $('.title_bg');
        if ($bg.length > 0) {
            const currentTransform = $bg.css('transform');
            $bg.css({
                'transform': currentTransform,
                'animation': 'none'
            });
        }

        // HUDコンテナの削除を遅延させる（フェードアウト中の演出維持）
        const $hud = $('#hud-container-title');
        
        // IDを消して重複処理を防ぐ
        $hud.removeAttr('id');

        setTimeout(() => {
            $hud.remove();
        }, 1000);
    },

    showButtons: function() {
        $(".layer_free").show();
        $(".title_btn, .old_btn").remove();
    },

    showDeleteDialog: function() {
        // ダイアログ表示中はアニメーションを維持するため clearTitleEffects は呼ばない
        $(".title_btn, .old_btn").hide();
        
        if ($("#delete_overlay").length === 0) {
            const $overlay = $("<div>", { id: "delete_overlay" });
            const $blocker = $("<div>").addClass("config_blocker");
            const $configBox = $("<div>").addClass("config_box");

            const $title = $("<div>").html("DELETE SAVE DATA?<br><span class='delete_subtitle'>セーブデータを削除しますか？</span>").addClass("delete_title");

            const $btnArea = $("<div>").addClass("delete_btn_area");

            const hoverOn = function() {
                if (window.playHoverSound) {
                    window.playHoverSound();
                } else if (typeof TYRANO !== 'undefined') {
                    TYRANO.kag.ftag.startTag("playse", { storage: "hover.ogg", stop: "true" });
                }
            };

            const $btnOk = $("<button>").text("Delete").addClass("delete_btn").on("mouseenter", hoverOn).on("click", function() {
                $("#delete_overlay").fadeOut(10, function() {
                    TYRANO.kag.ftag.startTag("jump", { target: "*tok" });
                });
            });

            const $btnCancel = $("<button>").text("Cancel").addClass("delete_btn").on("mouseenter", hoverOn).on("click", function() {
                $("#delete_overlay").fadeOut(10, function() {
                    TYRANO.kag.ftag.startTag("jump", { target: "*tcan_js" });
                });
            });

            $blocker.on("click", function() {
                $("#delete_overlay").fadeOut(10, function() {
                    TYRANO.kag.ftag.startTag("jump", { target: "*tcan_js" });
                });
            });

            $btnArea.append($btnOk, $btnCancel);
            $configBox.append($title, $btnArea);
            $overlay.append($blocker, $configBox);
            $("#tyrano_base").append($overlay);
        }

        $("#delete_overlay").fadeIn(10);
    },

    clearSaveData: function() {
        localStorage.clear();
        if(typeof tyrano !== 'undefined' && tyrano.plugin && tyrano.plugin.kag) {
            tyrano.plugin.kag.variable.sf = {};
        }
        if (window.initialReportFlags) {
            window.initialReportFlags = {
                epilogue_reached: false,
                report_r1: false,
                report_r2: false,
                report_r3: false,
                report_r4: false,
                report_r5: false,
                alive_r1: false,
                alive_r2: false,
                alive_r3: false,
                alive_r4: false,
                alive_r5: false
            };
        }
    },

    reloadGame: function() {
        location.reload();
    },

    showReportDialog: function() {
        // ダイアログ表示中はタイトル画面のボタンを隠す
        $(".title_btn, .old_btn").hide();
        
        if ($("#report_overlay").length === 0) {
            const $overlay = $("<div>", { id: "report_overlay" });
            const $blocker = $("<div>").addClass("config_blocker");
            const $reportBox = $("<div>").addClass("report_box");
            
            const $sidebar = $("<div>").addClass("report_sidebar");
            const $contentArea = $("<div>").addClass("report_content_area");
            const $contentTitle = $("<div>").addClass("report_content_title");
            const $contentBody = $("<div>").addClass("report_content_body");
            
            $contentArea.append($contentTitle, $contentBody);

            const hoverOn = function() {
                if (window.playHoverSound) {
                    window.playHoverSound();
                } else if (typeof TYRANO !== 'undefined') {
                    TYRANO.kag.ftag.startTag("playse", { storage: "hover.ogg", stop: "true" });
                }
            };

            const playClickSound = function() {
                if (typeof TYRANO !== 'undefined') {
                    TYRANO.kag.ftag.startTag("playse", { storage: "button02.ogg", stop: "true" });
                }
            };

            const playCancelSound = function() {
                if (typeof TYRANO !== 'undefined') {
                    TYRANO.kag.ftag.startTag("playse", { storage: "cancel.ogg", stop: "true" });
                }
            };

            // レポートデータ定義 (別ファイル report_data.js から読み込み)
            const reports = window.ReportData || [];
            const sf = typeof TYRANO !== 'undefined' ? TYRANO.kag.variable.sf : {};
            let reportTouchY = 0;

            $contentBody
                .on("touchstart", function(e) {
                    const touch = e.originalEvent.touches && e.originalEvent.touches[0];
                    if (!touch) return;
                    reportTouchY = touch.clientY;
                    e.stopPropagation();
                })
                .on("touchmove", function(e) {
                    const originalEvent = e.originalEvent;
                    const touch = originalEvent.touches && originalEvent.touches[0];
                    if (!touch) return;

                    const currentY = touch.clientY;
                    const deltaY = reportTouchY - currentY;
                    const element = this;
                    const maxScrollTop = element.scrollHeight - element.clientHeight;

                    if (maxScrollTop > 0) {
                        element.scrollTop = Math.max(0, Math.min(maxScrollTop, element.scrollTop + deltaY));
                    }

                    reportTouchY = currentY;
                    e.stopPropagation();
                    originalEvent.preventDefault();
                });

            // タブの切り替え関数
            function selectTab(report) {
                const isUnlocked = !report.unlockFlag || sf[report.unlockFlag];
                if (isUnlocked) {
                    $contentTitle.css("border-bottom", ""); // 緑の区切り線を復活
                    $contentBody.css("overflow-y", ""); // スクロールバーを復活
                    $contentTitle.text(report.title);
                    let bodyText = typeof report.text === 'function' ? report.text(sf) : report.text;
                    $contentBody.html(bodyText.replace(/\n/g, "<br>"));
                } else {
                    $contentTitle.css("border-bottom", "none"); // 緑の区切り線を消去
                    $contentBody.css("overflow-y", "hidden"); // スクロールバーを消去
                    $contentTitle.html("&nbsp;");
                    $contentBody.html(
                        '<div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 100%; min-height: 380px; padding-top: 120px;">' +
                        '  <img src="data/fgimage/material/lock.png" style="width: 55px; height: 55px; opacity: 0.55;">' + // 75px から 55px に縮小
                        '</div>'
                    );
                }
                $contentBody.scrollTop(0);
            }

            // タブボタンの生成
            reports.forEach((report, index) => {
                const isUnlocked = !report.unlockFlag || sf[report.unlockFlag];

                const $btn = $("<button>")
                    .addClass("report_tab_btn")
                    .on("mouseenter", hoverOn)
                    .on("click", function() {
                        playClickSound();
                        $(".report_tab_btn").removeClass("active");
                        $(this).addClass("active");
                        selectTab(report);
                    });

                if (!isUnlocked) {
                    $btn.addClass("locked");
                    const $icon = $("<img>")
                        .attr("src", "data/fgimage/material/lock.png")
                        .addClass("report_lock_icon")
                        .css({
                            "width": "18px",  // 14px から 18px に大きく
                            "height": "18px", // 14px から 18px に大きく
                            "vertical-align": "middle",
                            "opacity": "0.9",
                            "display": "inline-block"
                        });
                    $btn.append($icon);
                } else {
                    const $textSpan = $("<span>")
                        .text(report.name)
                        .css({
                            "vertical-align": "middle",
                            "display": "inline-block"
                        });
                    $btn.append($textSpan);
                }

                if (index === 0) {
                    $btn.addClass("active");
                    selectTab(report);
                }

                $sidebar.append($btn);
            });

            // 閉じるボタン
            const $btnClose = $("<button>")
                .addClass("report_close_btn")
                .text("CLOSE")
                .on("mouseenter", hoverOn)
                .on("click", function() {
                    playCancelSound();
                    $("#report_overlay").fadeOut(100, function() {
                        $(this).remove();
                        TYRANO.kag.ftag.startTag("jump", { target: "*report_close" });
                    });
                });

            $sidebar.append($btnClose);


            $reportBox.append($sidebar, $contentArea);
            $overlay.append($blocker, $reportBox);
            $("#tyrano_base").append($overlay);
        }

        $("#report_overlay").fadeIn(100);
    }
};

// 後方互換性のため
window.clearTitleEffects = window.TitleManager.clearEffects;
