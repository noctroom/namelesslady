window.roomEvents = window.roomEvents || {};

(function() {
    // ==========================================
    // 冒頭共通 
    // ==========================================
    // メインルート（0:50〜1:20）の定義
    const events = [

    //電気----------------------------
    { time: "0:50", image: 'r5_room.jpg', flickerImage: 'r5_room_black.jpg', flickerInterval: 150, noNoise: true, se: "blinking.ogg"},   

    //ドアの前----------------------------
    { time: "0:55", image: 'r5_room_0055.jpg',
        shootArea: [
            { x: 600, y: 200, w: 130, h: 300}, 
        ]
    },   

    //ドアの前----------------------------
    { time: "1:00", image: 'r5_room_0100.jpg',
        shootArea: [
            { x: 620, y: 180, w: 60, h: 30}, 
            { x: 600, y: 210, w: 110, h: 130},
            { x: 620, y: 340, w: 90, h: 150},
            { x: 610, y: 490, w: 100, h: 70},
        ]
    },   
    //近づく右---------------------------
    { time: "1:10", image: 'r5_room_0110.jpg',
        shootArea: [
            { x: 750, y: 130, w: 60, h: 70}, 
            { x: 700, y: 180, w: 110, h: 90},
            { x: 680, y: 250, w: 80, h: 60},
            { x: 660, y: 310, w: 100, h: 280},
            { x: 780, y: 250, w: 30, h: 150},
        ]
    },  
    //近づく左---------------------------
    { time: "1:20", image: 'r5_room_0115.jpg',
        shootArea: [
            { x: 500, y: 100, w: 70, h: 90}, 
            { x: 540, y: 150, w: 110, h: 120},
            { x: 580, y: 200, w: 100, h: 180},
            { x: 560, y: 380, w: 100, h: 190},
            { x: 570, y: 490, w: 110, h: 170},
        ]
    }
];

// ==========================================
// 共通ルート (最接近〜死亡シーケンス)
// ==========================================
// 1:30以降の共通データを定義
const approachingSequence = [
    { image: 'r5_room_0120.jpg',
        shootArea: [
            { x: 780, y: 60, w: 90, h: 100 }, 
            { x: 700, y: 110, w: 130, h: 140 },
            { x: 670, y: 230, w: 110, h: 160 },
            { x: 650, y: 450, w: 110, h: 220 } 
        ],
        hitImage: 'r5_room_A001.jpg'
    },
    { image: 'r5_room_0125.jpg',
        shootArea: [
            { x: 460, y: 40, w: 90, h: 110 },
            { x: 500, y: 100, w: 130, h: 140},
            { x: 540, y: 240, w: 110, h: 80},
            { x: 540, y: 320, w: 120, h: 340},
        ],
        hitImage: 'r5_room_A001.jpg'
    },
    { image: 'r5_room_0130.jpg',
        shootArea: [
            { x: 720, y: 10, w: 140, h: 160 },
            { x: 590, y: 100, w: 260, h: 200 },
            { x: 580, y: 300, w: 180, h: 60 },
            { x: 560, y: 360, w: 200, h: 350 },
        ],
        hitImage: 'r5_room_A001.jpg'
    },
    { image: 'r5_room_0135.jpg',
        shootArea: [
            { x: 630, y: 0, w: 190, h: 200},
            { x: 450, y: 100, w: 390, h: 300},
            { x: 420, y: 400, w: 290, h: 300},
        ],
        hitImage: 'r5_room_A001.jpg'
    },
    { isDead: true, se: "dead.ogg"} // 死亡判定ポイント (砂嵐)
];

const approachingOffsets = [0, 10, 20, 25, 30];
const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
};

// メインルートの後半として共通シーケンスを結合
events.push(...approachingSequence.map((ev, i) => {
    const newEv = JSON.parse(JSON.stringify(ev));
    newEv.time = formatTime(90 + approachingOffsets[i]);
    return newEv;
}));

// ==========================================
// 分岐ルート 
// ==========================================
    const r5_hit_branch = [
    { time: 0, image: "r5_room_A001.jpg", se: "barefoot.ogg", effect: 'strong_noise', noiseTime: 500,
        seDelay: 500, seDelayPlay: "falldown.ogg",
        hitImage: 'r5_room_A001.jpg'
     },

    { time: 20, image: "r5_room_A002.jpg", 
        shootArea: [
            { x: 590, y: 250, w: 110, h: 80 },
            { x: 560, y: 290, w: 100, h: 120 },
            { x: 570, y: 410, w: 100, h: 40 },
            { x: 590, y: 450, w: 110, h: 60 },
            { x: 500, y: 550, w: 170, h: 60 },
            { x: 700, y: 280, w: 90, h: 100 }
        ],
        hitImage: 'r5_room_A001.jpg' }, //復活

    // 共通シーケンスを分岐用に展開
    ...approachingSequence.map((ev, i) => {
        const newEv = JSON.parse(JSON.stringify(ev));
        newEv.time = 25 + approachingOffsets[i];
        return newEv;
    })
];

    // 復活後に被弾した際、足音・強ノイズを無しにした分岐シーケンス
    const r5_hit_branch_revived = [
    { time: 0, image: "r5_room_A001.jpg", se: "falldown.ogg",
        shootArea: [
            { x: 460, y: 540, w: 320, h: 80 },
            { x: 760, y: 560, w: 100, h: 80 },
            { x: 860, y: 580, w: 90, h: 90 },
        ],
        hitImage: 'r5_room_A001.jpg'
     },

    { time: 20, image: "r5_room_A002.jpg", 
        shootArea: [
            { x: 590, y: 250, w: 110, h: 80 },
            { x: 560, y: 290, w: 100, h: 120 },
            { x: 570, y: 410, w: 100, h: 40 },
            { x: 590, y: 450, w: 110, h: 60 },
            { x: 500, y: 550, w: 170, h: 60 },
            { x: 700, y: 280, w: 90, h: 100 }
        ],
        hitImage: 'r5_room_A001.jpg' }, //復活

    // 共通シーケンスを分岐用に展開
    ...approachingSequence.map((ev, i) => {
        const newEv = JSON.parse(JSON.stringify(ev));
        newEv.time = 25 + approachingOffsets[i];
        return newEv;
    })
];

// 初期化完了後に、復活後の被弾時に自身を再適用する設定を行う
[r5_hit_branch, r5_hit_branch_revived].forEach(branch => {
    branch.forEach(ev => {
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
});

// メインルートの全ての当たり判定に分岐ルートへの移行を設定
events.forEach(e => {
    if (e.shootArea) {
        if (e.time === "0:55") {
            e.hitImage = "r5_room.jpg"; 
            e.hitJumpDelay = 0;
            e.delayTimeline = 10;
        } else {
            Object.defineProperty(e, 'hitBranch', {
                get: function() {
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            e.hitImage = "r5_room_A001.jpg"; // 命中した瞬間に倒れる画像を表示
            e.hitJumpDelay = 0;
        }
    }
});

    window.r5_hit_branch = r5_hit_branch;
    window.r5_hit_branch_revived = r5_hit_branch_revived;
    window.roomEvents['r5'] = events;
})();
