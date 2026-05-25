
window.roomEvents = window.roomEvents || {};
window.roomEvents['r4'] = (function() {
    const events = [];
    const commonShootArea = [
        { x: 430, y: 280, w: 60, h: 60 },
        { x: 440, y: 330, w: 90, h: 110 },
        { x: 410, y: 440, w: 170, h: 40 },
        { x: 360, y: 480, w: 270, h: 100 }
    ];

    const duration = 20; // 各イベントの継続時間 (20秒)
    
    // --- イベントのプール（ここにある内容からランダムに選ばれます） ---
    // image: 使用する画像
    // shootArea: その画像での当たり判定（数値は適宜書き換えてください）
    const eventPool = [
    //0)こちらを見る 
        { 
            image: 'r4_room_A002.jpg', 
            shootArea: [
                { x: 440, y: 270, w: 60, h: 60 },
                { x: 440, y: 330, w: 90, h: 110 },
                { x: 410, y: 440, w: 170, h: 40 },
                { x: 360, y: 480, w: 270, h: 100 }
            ],
        },
    //1)こちらを見る不気味 
        { 
            image: 'r4_room_A003.jpg', 
            shootArea: [
                { x: 490, y: 270, w: 70, h: 60 },
                { x: 440, y: 330, w: 90, h: 110 },
                { x: 410, y: 440, w: 170, h: 40 },
                { x: 360, y: 480, w: 270, h: 100 }
            ],
        },
    //2)ドア
        { 
            image: 'r4_room_A004.jpg', 
            shootArea: commonShootArea
        },
    //3)血
        { 
            image: 'r4_room_A005.jpg', 
            shootArea: commonShootArea
        },
    //4)ぼろぼろ
        { 
            image: 'r4_room_A006.jpg', 
            shootArea: commonShootArea
        },
    //5)廊下
        { 
            image: 'r4_room_A007.jpg', 
            shootArea: commonShootArea
        },
    //6)上下反転
        { 
            image: 'r4_room_normal.jpg', 
            effect: 'upside_down',
            shootArea: commonShootArea
        },
    //7)左右反転
        { 
            image: 'r4_room_normal.jpg', 
            effect: 'mirror',
            shootArea: commonShootArea
        },
    //8)目の前
        { 
            image: 'r4_room_A001.jpg', 
            shootArea: [
                { x: 580, y: 10, w: 140, h: 130 },
                { x: 500, y: 140, w: 320, h: 600 }
            ],
        }
    ];



    // 0〜1分、1〜2分、2〜3分、3〜4分、4〜5分の各ブロックでイベントを生成
    for (let m = 0; m < 5; m++) {
        // 毎分00秒に初期状態（ターゲットあり）に戻す
        events.push({ 
            time: m * 60, 
            image: 'r4_room_normal.jpg',
            shootArea: JSON.parse(JSON.stringify(commonShootArea)),
            hitImage: 'r4_room.jpg'
        });

        // 各ブロック(1分間)の中で 0〜40秒の間にランダムに開始（m=0のときは最初の10秒は何も起きないように設定）
        const startSec = m * 60 + (m === 0 ? 10 + Math.floor(Math.random() * 31) : Math.floor(Math.random() * 41));
        
        // プールからランダムにイベント内容を選択
        // r4_room_A001.jpg (目の前) は 4分台 (m=4) の時に50%の確率で発生する
        let templateIndex;
        if (m === 4 && Math.random() < 0.5) {
            templateIndex = eventPool.findIndex(e => e.image === 'r4_room_A001.jpg');
        } else {
            const validIndices = [];
            for (let i = 0; i < eventPool.length; i++) {
                if (eventPool[i].image !== 'r4_room_A001.jpg') {
                    validIndices.push(i);
                }
            }
            templateIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
        }

        // デバッグ用：特定イベントの確定発生
        if (typeof TYRANO !== 'undefined' && TYRANO.kag.variable.tf.force_event_index !== undefined) {
            const forcedIndex = parseInt(TYRANO.kag.variable.tf.force_event_index);
            if (forcedIndex >= 0 && forcedIndex < eventPool.length) {
                templateIndex = forcedIndex;
            }
        }

        const template = eventPool[templateIndex];
        const isHarmless = (template.image === 'r4_room_A002.jpg');
        
        if (!isHarmless) {
            
            // 1. ターゲット出現イベント（タイムアウトと死亡ブランチを設定）
            events.push({
                ...JSON.parse(JSON.stringify(template)), // image, shootArea, effect 等をすべてコピー
                time: startSec,
                duration: duration,
                hitImage: 'r4_room.jpg',
                timeout: duration,
                timeoutBranch: [
                    { time: 0, isDead: true }
                ]
            });

        } else {
            
            // 1. ターゲット出現イベント
            events.push({
                ...JSON.parse(JSON.stringify(template)), // image, shootArea, effect 等をすべてコピー
                time: startSec,
                duration: duration,
                hitImage: 'r4_room.jpg'
            });
            // 3. 無害イベントの場合の背景復帰 (時間経過で自動復帰)
            // 排除されていない場合はターゲットありの初期状態に戻し、排除済みの場合はそのままにする
            events.push({
                time: startSec + duration,
                image: 'r4_room_normal.jpg',
                shootArea: commonShootArea,
                hitImage: 'r4_room.jpg',
                notFlag: 'r4_safe',
                noNoise: true
            });
        }
    }

    return events;
})();