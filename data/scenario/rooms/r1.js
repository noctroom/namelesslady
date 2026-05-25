// 部屋１


window.roomEvents = window.roomEvents || {};

window.roomEvents['r1'] = (function() {


    // ==========================================
    // メインルート（タイムライン）
    // ==========================================
    const events = [
    //鍵あけ----------------------------
    { time: "0:00", image: "r1_room.jpg"}, 

    //鍵あけ----------------------------
    { time: "0:30", image: "r1_room_0030.jpg", 
        shootArea: [
            { x: 520, y: 130, w: 220, h: 390 }, // 本体
            { x: 480, y: 250, w: 100, h: 150 }, // 手
        ],
        hitImage: "r1_room.jpg", timeout: 10,
        timeoutBranch: getTimeoutBranchSequence(), // 分岐ルート
    }, 
    //鍵あけ----------------------------                                             
    { time: "0:50", image: "r1_room_0030.jpg", 
        shootArea: [
            { x: 520, y: 130, w: 220, h: 390 }, // 本体
            { x: 480, y: 250, w: 100, h: 150 }, // 手
        ],
        hitImage: "r1_room.jpg", timeout: 10, 
        timeoutBranch: getTimeoutBranchSequence(), // 分岐ルート
    }, 

    //複数手----------------------------
    { time: "1:00", image: 'r1_room_0100.jpg',
        shootArea: [
            { x: 520, y: 130, w: 220, h: 390 }, 
        ],
        hitImage: "r1_room.jpg", 
        timeoutImage: "r1_room_A_001.jpg", 
        timeoutBranch: getTimeoutBranchSequence(), 
    }, 
    //----------------------------

    //複数手----------------------------
    { time: "1:20", image: 'r1_room_0120.jpg',
        shootArea: [
            { x: 520, y: 130, w: 220, h: 390 }, 
        ],
        hitImage: "r1_room.jpg", 
        timeoutImage: "r1_room_A_001.jpg", 
        timeoutBranch: getTimeoutBranchSequence(), 
    }, 
    //----------------------------

    { time: "1:40", image: 'r1_room.jpg' },     //いない
    { time: "1:50", image: 'r1_room_0150.jpg', se: "doorbreack.ogg"}, //念力
    { time: "2:00", image: 'r1_room_0200.jpg', se: "doorbreack.ogg"}, //念力
    { time: "2:10", image: 'r1_room_0210.jpg' }, //開く
    { time: "2:20", image: 'r1_room_0220.jpg', se: "light.ogg", noSeOnJump: true}, //照明消え

    //手１----------------------------
    { time: "2:30", image: 'r1_room_0230.jpg',
        shootArea: [
            { x: 510, y: 360, w: 230, h: 240 }, 
            { x: 460, y: 520, w: 130, h: 170 } 
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "2:20"
    }, 
    //手２----------------------------
    { time: "2:40", image: 'r1_room_0240.jpg',
        shootArea: [
                { x: 520, y: 120, w: 220, h: 420 },
                { x: 480, y: 230, w: 70, h: 100 },
                { x: 720, y: 100, w: 70, h: 100 },
                { x: 460, y: 520, w: 120, h: 140 },
                { x: 600, y: 530, w: 160, h: 70 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "2:20"
    }, 
    //手３----------------------------
    { time: "2:50", image: 'r1_room_0250.jpg',
        shootArea: [
            { x: 460, y: 310, w: 290, h: 230 }, 
            { x: 420, y: 540, w: 250, h: 180 }, 
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "2:20"
    }, 
    //布----------------------------
    { time: "3:00", image: 'r1_room_0300.jpg',
        shootArea: [
            { x: 340, y: 350, w: 250, h: 70 }, 
            { x: 430, y: 420, w: 250, h: 210 }, 
            { x: 300, y: 420, w: 130, h: 240 },
            { x: 330, y: 630, w: 210, h: 80 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "3:20",
        hitJumpDelay: 10
    }, 
    //布----------------------------
    { time: "3:10", image: 'r1_room_0310.jpg',
        shootArea: [
            { x: 330, y: 440, w: 240, h: 50 },
            { x: 300, y: 490, w: 320, h: 90 },
            { x: 270, y: 580, w: 390, h: 90 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "3:20",
        hitJumpDelay: 10
    }, 
    //立つ----------------------------
    { time: "3:20", image: 'r1_room_0320.jpg',
        shootArea: [
            { x: 370, y: 180, w: 230, h: 500 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "3:50",
        hitJumpDelay: 10
    }, 
    //立つ----------------------------
    { time: "3:30", image: 'r1_room_0330.jpg',
        shootArea: [
            { x: 360, y: 110, w: 230, h: 490 },
            { x: 430, y: 600, w: 130, h: 100 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "3:50",
        hitJumpDelay: 10
    }, 
    //本体----------------------------
    { time: "3:40", image: 'r1_room_0340.jpg',
        shootArea: [
            { x: 430, y: 50, w: 90, h: 110 },
            { x: 390, y: 160, w: 190, h: 360 },
            { x: 440, y: 520, w: 120, h: 170 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "3:50",
        hitJumpDelay: 5
    }, 
    //本体----------------------------
    { time: "3:50", image: 'r1_room_0350.jpg',
        shootArea: [
            { x: 570, y: 80, w: 100, h: 100 },
            { x: 430, y: 130, w: 210, h: 470 },
            { x: 440, y: 600, w: 130, h: 100 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "3:50",
        hitJumpDelay: 10
    }, 
    //近づく----------------------------
    { time: "4:00", image: 'r1_room_0400.jpg',
        shootArea: [
            { x: 440, y: 20, w: 110, h: 130 },
            { x: 420, y: 130, w: 210, h: 360 },
            { x: 470, y: 490, w: 140, h: 210 },
            { x: 230, y: 170, w: 190, h: 80 },
            { x: 630, y: 120, w: 150, h: 80 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "3:50",
        hitJumpDelay: 10
    }, 
    //近づく----------------------------
    { time: "4:10", image: 'r1_room_0410.jpg',
        shootArea: [
            { x: 510, y: 10, w: 170, h: 80 },
            { x: 430, y: 90, w: 300, h: 610 },
            { x: 120, y: 100, w: 100, h: 100 },
            { x: 220, y: 130, w: 210, h: 100 },
            { x: 730, y: 120, w: 220, h: 100 },
            { x: 950, y: 90, w: 110, h: 110 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "4:20",
        hitJumpDelay: 5
    }, 
    //近づく----------------------------
    { time: "4:20", image: 'r1_room_0420.jpg',
        shootArea: [
            { x: 420, y: 10, w: 450, h: 680 },
            { x: 50, y: 60, w: 370, h: 630 },
            { x: 870, y: 100, w: 180, h: 600 },
            { x: 1050, y: 200, w: 200, h: 500 },
        ],
        hitImage: "r1_room_0220.jpg",
        jumpTime: "4:20",
        hitJumpDelay: 5
    }, 

    //----------------------------

    { time: "4:27", image: 'r1_room_0427.jpg', isJammed: true }, //近づく
    { time: "4:28", isDead: true} // 死亡判定ポイント (砂嵐)
];


// ==========================================
// 分岐ルート定義（タイムアウト時に実行）
// ==========================================

/**
 * 銃撃失敗時の共通分岐ルートを取得 (r1_room_A_001〜A_007 を10秒おきに表示)
 */
function getTimeoutBranchSequence() {
    const sequence = [

        //鍵が開く---------------
        { time: 0, image: "r1_room_A_001.jpg", se: "keybreack.ogg",}, 

        //ドアが開く---------------
        { time: 10, image: "r1_room_A_002.jpg", se: "dooropen.ogg",}, 

        //暗闇〜死亡は共通シーケンスへ合流（暗闇エントリに se/noSeOnJump を追記）
        ...getDarknessSequence(20, { se: "light.ogg", noSeOnJump: true }),
    ];

    return sequence;
}

/**
 * 暗闇〜死亡までの共通シーケンスを取得（各分岐ルートで合流する共通部分）
 * @param {number} startTime - シーケンスの開始時刻オフセット（デフォルト: 20）
 * @param {object} darkEntryExtra - 暗闇エントリに追加するプロパティ（例: { se, noSeOnJump }）
 */
function getDarknessSequence(startTime = 20, darkEntryExtra = {}) {
    const t = startTime;
    return [
        //暗闇（TimeoutBranchと合流）---------------
        { time: t, image: "r1_room_A_003.jpg", ...darkEntryExtra },

        //手---------------
        { time: t + 10, image: "r1_room_A_004.jpg",
            shootArea: [
                { x: 460, y: 540, w: 120, h: 150 },
                { x: 520, y: 380, w: 90,  h: 160 },
                { x: 600, y: 480, w: 150, h: 130 },
            ],
            hitImage: "r1_room_A_003.jpg",
            jumpTime: t,
        },
        //手（近付く）---------------
        { time: t + 22, image: "r1_room_A_005.jpg",
            shootArea: [
                { x: 520, y: 120, w: 220, h: 420 },
                { x: 480, y: 230, w: 70,  h: 100 },
                { x: 720, y: 100, w: 70,  h: 100 },
                { x: 470, y: 230, w: 70,  h: 280 },
                { x: 500, y: 510, w: 170, h: 70  },
                { x: 420, y: 580, w: 250, h: 80  },
            ],
            hitImage: "r1_room_A_003.jpg",
            jumpTime: t,
        },
        { time: t + 23, image: "r1_room_A_006.jpg", isJammed: true}, //手近付く
        { time: t + 24, image: "r1_room_A_007.jpg", isJammed: true}, //手アップ
        { time: t + 25, isDead: true }                // 死亡判定ポイント (砂嵐)
    ];
}

    return events;
})();


/*
【銃撃ルート分岐の記述サンプル】
 ・shootArea: 撃てるエリア (x, y, w, h) ※画像座標 1280x720 基準
 ・hitImage: 命中時に切り替わる画像 (省略可)
 ・hitMessage: 命中時に表示されるシステムメッセージ (省略可)

  記述例：
  { 
    time: "1:00", 
    image: "r1_room_0100.jpg", 
    shootArea: { x: 630, y: 350, w: 80, h: 80 }, 
    hitImage: "r1_room_0100_hit.jpg", 
    hitMessage: "ターゲットを排除" 
  },

  ※チェックポイント（死亡判定）：
  { time: "4:30", image: "sandstorm.jpg", effect: "sandstorm" }
  この時間までに shootArea を撃っていないと砂嵐になり、その部屋は「死亡」扱いとなります。
*/
