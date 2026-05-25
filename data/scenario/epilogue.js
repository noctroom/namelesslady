// ゲーム終了時のセリフデータ

// 連続する同じキャラ名を省略するヘルパー関数
// (UI側で名前を消さずにセリフだけ切り替えるための処理)
function processConsecutiveNames(dialogues) {
    let lastName = null;
    return dialogues.map(d => {
        let currentName = d.name;
        let displayName = (currentName === lastName) ? "" : currentName;
        lastName = currentName;
        return { name: displayName, text: d.text };
    });
}

window.epilogueDialogues = {
    // ゲームクリア：午前5時到達（全員生存）
    clear: {
        get lines() {
            return processConsecutiveNames([
                { name: "Superior", text: "各員に通達。排除班、施設前に到着を確認。" },
                { name: "Superior", text: "各自区画にて引き継ぎ後、速やかに離脱せよ。" },
                { name: "SA-01～05", text: "了解。" }
            ]);
        },
        get report() {
            return processConsecutiveNames([
                { name: "Superior", text: "任務完了を確認。各員の生存を確認した。" },
                { name: "Superior", text: "初動対応および監視任務、問題なく遂行されたと判断する。" },
                { name: "Superior", text: "各員、ご苦労。これで本任務は終了だ。" }
            ]);
        }
    },

    // 任務失敗：1〜4室死亡
    failed: {
        get lines() {
            return processConsecutiveNames([
                { name: "Superior", text: "各員に通達。排除班、施設前に到着を確認。" },
                { name: "Superior", text: "各自区画にて引き継ぎ後、速やかに離脱せよ。" }
            ]);
        },
        get report() {
            const rooms = window.gameState ? window.gameState.rooms : {};
            const deadRooms = Object.keys(rooms).filter(id => rooms[id].isDead);
            
            // ルームIDと名前の対応
            const roomNames = {
                'r1': 'SA-01',
                'r2': 'SA-02',
                'r3': 'SA-03',
                'r4': 'SA-04',
                'r5': 'SA-05'
            };
            
            // ルームIDと原因サンプルの対応（ユーザーが後で書き換えるためのサンプル）
            const roomCauses = {
                'r1': '交戦判断に問題あり。射撃タイミングの選定が不適切であった。',
                'r2': '行動方針に問題あり。本状況では監視を優先すべきだった。',
                'r3': '対応誤り。継続的な注視による監視が必要であった。',
                'r4': '事象対応に遅延あり。対象の変化を捉え、適切な対処を行う必要があった。',
                'r5': '状況把握が不十分。定期的な確認と即応が求められる環境であった。'
            };

            const deadNames = deadRooms.map(id => roomNames[id] || id);
            const nameText = deadNames.length > 1 
                ? deadNames.join('・') + 'の任務失敗を確認'
                : (deadNames[0] || '不明') + 'の任務失敗を確認';

            // 各原因を個別のセリフオブジェクトとして生成
            const causeLines = deadRooms.map(id => {
                let cause = roomCauses[id] || '不明';
                // 部屋3で逃亡フラグがある場合、専用セリフに差し替え
                if (id === 'r3' && rooms[id].isEscaped) {
                    cause = '対象の逃亡を許した。重大な任務失策である。';
                }
                return {
                    name: "Superior", 
                    text: `${roomNames[id] || id}は${cause}`
                };
            });

            return processConsecutiveNames([
                { name: "Superior", text: "以降の対応は排除班に引継いだ。" },
                { name: "Superior", text: nameText + "。" },
                ...causeLines,
                { name: "Superior", text: "残り各員は、ご苦労。" },
                { name: "Superior", text: "これをもって本任務は終了とする。" }
            ]);
        }
    },

    // ゲームオーバー：全室死亡
    gameOver: {
        get lines() {
            return processConsecutiveNames([
                { name: "Superior", text: "……各員との通信途絶を確認。" },
                { name: "Superior", text: "生存反応なし、全滅と判断する。" }
            ]);
        },
        get report() {
            return processConsecutiveNames([
                { name: "Superior", text: "本任務は失敗。" },
                { name: "Superior", text: "現地状況は想定を上回る危険性を有すると認定する。" },
                { name: "Superior", text: "排除班に処理を一任する。" },
            ]);
        }
    },

    // スタッフクレジット
    staff: [
        { role: "制作", name: "NoctRoom-ノクトルーム-" },
        { role: "企画", name: "禾壱" },
        { role: "プログラム", name: "禾壱" },
        { role: "グラフィックデザイン", name: "禾壱" },
        { role: "イラスト", name: "禾壱" },
        { role: "シナリオ", name: "禾壱" },
        { role: "効果音（アセット）", name: "On-Jin\nSpringin’\n音屋\n Pixabay" },
        { role: "BGM（アセット）", name: "「DarkAmbient」かとう\n「case file」ゆうり" },
        { role: "制作エンジン", name: "TyranoScript" }
    ]
};

// 実績解除トーストの表示（単一）
window.showAchievementToast = function(reportName) {
    return new Promise((resolve) => {
        const toastId = 'ach-toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="achievement-toast">
                <div class="achievement-toast-header">REPORT UNLOCKED</div>
                <div class="achievement-toast-body">「${reportName}」を取得</div>
            </div>
        `;
        
        $('.tyrano_base').append(toastHtml);
        const $toast = $('#' + toastId);
        
        // 実績解除音（ティラノスクリプトのSE）を鳴らす
        if (typeof TYRANO !== 'undefined') {
            TYRANO.kag.ftag.startTag("playse", { storage: "announce.ogg" });
        }
        
        // スライドイン表示
        setTimeout(() => {
            $toast.addClass('show');
        }, 60);
        
        // 1.6秒後にスライドアウト、さらに0.35秒後に削除
        setTimeout(() => {
            $toast.removeClass('show').addClass('hide');
            setTimeout(() => {
                $toast.remove();
                resolve();
            }, 350);
        }, 1600);
    });
};

// 複数の実績を時間差で順次表示する
window.showMultipleAchievements = async function(unlockedReports) {
    for (const report of unlockedReports) {
        await window.showAchievementToast(report.name);
        // トースト表示完了後に少しウェイトを入れる
        await new Promise(resolve => setTimeout(resolve, 100));
    }
};
