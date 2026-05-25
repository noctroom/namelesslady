// 部屋３

window.roomEvents = window.roomEvents || {};
window.roomEvents['r3'] = [

    // スタート時の画像設定
    { 
        time: "0:00", 
        image: 'r3_room_Bdown.jpg', 
        shootArea: [
            { x: 610, y: 310, w: 60, h: 40 }, 
            { x: 600, y: 350, w: 90, h: 210 }
        ],
        hitImage: "r3_room_Bdown.jpg" 
    },

    // 0:20 - 2:00 ランダムリピート設定
    { 
        time: "0:20", 
        randomRepeat: {
            endTime: "2:00",
            hitImage: "r3_room_Bdown.jpg",
            pool: [
                // 正常
                { image: 'r3_room_Anormal.jpg', 
                    shootArea: [
                        { x: 610, y: 290, w: 60, h: 50 }, 
                        { x: 600, y: 340, w: 90, h: 230 }
                    ] },
                // 左に俯き
                { image: 'r3_room_Bleft.jpg', 
                    shootArea: [
                        { x: 560, y: 310, w: 50, h: 60 }, 
                        { x: 590, y: 330, w: 80, h: 230 }
                    ] },
                // 右に動き
                { image: 'r3_room_Bright.jpg', 
                    shootArea: [
                        { x: 660, y: 310, w: 50, h: 60 }, 
                        { x: 600, y: 330, w: 90, h: 230 }
                    ] },
                // 上を見る
                { image: 'r3_room_Bup.jpg', 
                    shootArea: [
                        { x: 610, y: 280, w: 60, h: 60 }, 
                        { x: 600, y: 340, w: 90, h: 200 }
                    ],},
                // 下を見る
                { image: 'r3_room_Bdown.jpg', 
                    shootArea: [
                        { x: 610, y: 320, w: 60, h: 30 }, 
                        { x: 600, y: 350, w: 90, h: 220 }
                    ],}
            ],
            intervals: [
                { until: "1:00", duration: 6 },
                { until: "2:00", duration: 4 }
            ],
            hitWait: 10
        }
    },

    //腐食----------------------------
    { time: "2:00", image: 'r3_room_0200.jpg', 
        shootArea: [
                { x: 610, y: 310, w: 60, h: 40 }, 
                { x: 600, y: 350, w: 90, h: 210 }
        ],
        hitImage: "r3_room_Bdown.jpg",
        hitJumpDelay: 10,
        jumpTime: "2:00",
        watchPause: true,
        loopSe: "erosion.ogg"
    }, 

    //立ち上がる----------------------------
    { time: "2:20", image: 'r3_room_0220.jpg', 
        shootArea: [
                    { x: 610, y: 230, w: 60, h: 40 }, 
                    { x: 590, y: 270, w: 100, h: 300 }
        ],
        hitImage: "r3_room_Cdamage.jpg",
        hitJumpDelay: 5,
        jumpTime: "3:00",
        watchPause: true
    }, 

    //上を見る----------------------------
    { time: "2:40", image: 'r3_room_0240.jpg', 
        shootArea: [
                    { x: 610, y: 230, w: 60, h: 50 }, 
                    { x: 590, y: 270, w: 100, h: 300 }
        ],
        hitImage: "r3_room_Cdamage.jpg",
        hitJumpDelay: 5,
        jumpTime: "3:00",
        watchPause: true
    }, 

    //ほどける----------------------------
    { time: "3:00", image: 'r3_room_0300.jpg', 
        shootArea: [
                    { x: 560, y: 240, w: 80, h: 60 }, 
                    { x: 580, y: 280, w: 100, h: 290 },
                    { x: 560, y: 480, w: 140, h: 90 }
        ],
        hitImage: "r3_room_Cdamage.jpg",
        hitJumpDelay: 5,
        jumpTime: "3:00",
        watchPause: true
    }, 

    //立つ----------------------------
    { id: "r3_standing", time: "3:20", image: 'r3_room_0320.jpg', 
        shootArea: [
                    { x: 610, y: 220, w: 50, h: 60 }, 
                    { x: 570, y: 280, w: 130, h: 300 }
        ],
        hitImage: "r3_room_Cdamage.jpg",
        hitJumpDelay: 5,
        jumpTime: "3:20",
        watchPause: true,
        awayJump: { targetId: "man_front", duration: 10 }
    }, 

    //目の前----------------------------
    { id: "man_front", image: 'r3_room_Dfront.jpg',
        shootArea: [
                    { x: 510, y: 90, w: 260, h: 310 }, 
                    { x: 400, y: 400, w: 450, h: 420 }
        ],
        hitImage: "r3_room_Edead.jpg",
        deathOnShoot: "r3_pre_dead",
        deathOnGunDraw: true,
        watchWait: 7, 
        watchSuccess: "man_escaped",
        awayDeath: "r3_pre_dead",
        noSuccessIfHit: true
    }, 
    //死亡----------------------------
    { 
        id: "r3_pre_dead", 
        image: "r3_room_Edead.jpg",
        se: "dead.ogg",
        timeout: 2, 
        timeoutBranch: [
            { time: 0, id: "r3dead", isDead: true }
        ] 
    },
    
    { id: "man_escaped", image: 'r3_room.jpg', effect: "strong_noise", isDead: true, isEscaped: true }, //:逃走
    { id: "r3dead", isDead: true} // 死亡判定ポイント (砂嵐)
];


/*
【銃撃ルート分岐の記述サンプル】
 ・shootArea: 撃てるエリア (x, y, w, h) ※画像座標 1280x720 基準
 ・hitImage: 命中時に切り替わる画像 (省略可)
 ・hitMessage: 命中時に表示されるシステムメッセージ (省略可)

  記述例：
  { 
    time: "1:00", 
    image: "r3_room_0100.jpg", 
    shootArea: { x: 630, y: 350, w: 80, h: 80 }, 
    hitImage: "r3_room_0100_hit.jpg", 
    hitMessage: "ターゲットを排除" 
  },

  ※チェックポイント（死亡判定）：
  { time: "9:30", image: "sandstorm.jpg", effect: "sandstorm" }
  この時間までに shootArea を撃っていないと砂嵐になり、その部屋は「死亡」扱いとなります。
*/
