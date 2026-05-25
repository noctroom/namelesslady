// 部屋２

window.roomEvents = window.roomEvents || {};

window.roomEvents['r2'] = (function() {
    // 射撃成功時のクリアシーケンス（イベント停止）
    const clearBranch = [{ time: "0:00", image: 'r2_room.jpg', effect: 'strong_noise' }];
    const clearBranch01 = [{ time: "0:00", image: 'r2_room_dead01.jpg', effect: 'strong_noise', se: "falldown.ogg"}];
    const clearBranch02 = [{ time: "0:00", image: 'r2_room_dead02.jpg', effect: 'strong_noise', se: "falldown.ogg"}];
    const clearBranch03 = [{ time: "0:00", image: 'r2_room_dead03.jpg', effect: 'strong_noise', se: "falldown.ogg"}];
    const clearBranch04 = [{ time: "0:00", image: 'r2_room_dead04.jpg', effect: 'strong_noise', se: "falldown.ogg"}];
    const clearBranch05 = [{ time: "0:00", image: 'r2_room.jpg', effect: 'strong_noise', se: "falldown.ogg"}];
    const fullScreenShootArea = () => [{ x: 0, y: 0, w: 1280, h: 720 }];

    const events = [

    //ドア後ろ
      { time: "0:20", image: 'r2_room_0020.jpg', shootArea: fullScreenShootArea(), hitBranch: clearBranch},
    //ドア後ろ
      { time: "0:40", image: 'r2_room_0040.jpg', shootArea: fullScreenShootArea(), hitBranch: clearBranch},
     //いない
      { time: "1:00", image: 'r2_room.jpg'}, 
    //椅子
      { time: "1:20", image: 'r2_room_0120.jpg', shootArea: fullScreenShootArea(), hitBranch: clearBranch}, 
    //上
      { time: "1:40", image: 'r2_room_0140.jpg', shootArea: fullScreenShootArea(), hitBranch: clearBranch}, 
    //左
      { time: "2:00", image: 'r2_room_0200.jpg', shootArea: fullScreenShootArea(), hitBranch: clearBranch}, 
    //左
      { time: "2:20", image: 'r2_room_0220.jpg', shootArea: fullScreenShootArea(), hitBranch: clearBranch}, 
    
    //階段
      { 
          time: "2:40", image: 'r2_room_0240.jpg', 
          shootArea: [
              { x: 320, y: 330, w: 30, h: 300 }
          ], 
          hitBranch: clearBranch01 
      }, 
    
     //階段下
      { 
          time: "3:00", image: 'r2_room_0300.jpg', 
          shootArea: [
              { x: 420, y: 370, w: 80, h: 70 },
              { x: 390, y: 440, w: 120, h: 190 }
          ], 
          hitBranch: clearBranch01 
      }, 

    //ドア横
      { time: "3:20", image: 'r2_room_0320.jpg'}, 

    //前
      { 
          time: "3:40", image: 'r2_room_0340.jpg', 
          shootArea: [
              { x: 600, y: 360, w: 90, h: 60 },
              { x: 580, y: 420, w: 140, h: 200 }
          ], 
          hitBranch: clearBranch02 
      }, 
    //横
    { 
        time: "4:00", image: 'r2_room_0400.jpg', 
        shootArea: [
            { x: 30, y: 140, w: 150, h: 560 },
            { x: 180, y: 180, w: 120, h: 530 }
        ], 
        hitBranch: clearBranch03
    }, 
    //アップ
        { 
            time: "4:20", image: 'r2_room_0420.jpg', 
            shootArea: [
                { x: 290, y: 10, w: 730, h: 680 }
            ], 
            hitBranch: clearBranch04
        }, 
    //目の前
        { 
            time: "4:40", image: 'r2_room_0440.jpg', 
            shootArea: [
                { x: 540, y: 100, w: 110, h: 70 },
                { x: 550, y: 170, w: 200, h: 600 }
            ], 
            hitBranch: clearBranch03
        }, 
    //目の前
        { 
            time: "4:50", image: 'r2_room_0450.jpg', 
            shootArea: [
                { x: 540, y: 100, w: 110, h: 70 },
                { x: 550, y: 170, w: 200, h: 600 }
            ], 
            hitBranch: clearBranch03
        }, 

];

    events.missBranch = clearBranch;
    return events;
})();
