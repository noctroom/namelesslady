;------------------------------------------------
; リリース形態の設定 (ブラウザ版: "web", DL版: "dl")
[eval exp="sf.release_type = 'web'"]
;------------------------------------------------

; デバッグモード------------------------------------------------

	;デバッグモード
		;[eval exp="tf.debug_mode = false"]
	; デバッグ用ボタン設定
		[eval exp="tf.debug_mode = true"]
			;T キー：ゲーム内時間を10秒進める。
			;Y キー：ゲーム内時間を5秒進める。
	;開始時間
		;[eval exp="tf.start_time = '0:00'"]
	;開始部屋
		;[eval exp="tf.start_room = 'r5'"]
	;ヒットエリア表示
		;[eval exp="tf.show_hit_zone = true"]
	; 全員生存フラグ 
		;[eval exp="tf.debug_all_alive = true"]
	; 全滅時状態にする 
		;[eval exp="tf.debug_all_dead = true"]
	;銃を撃ったことにする（デバッグ用・メインルート進行）
		;[eval exp="tf.debug_shoot_done = true"]
	;[部屋1]ルート分岐進行（死亡ルート強制）
		;[eval exp="tf.debug_r1_invasion = 0"]
	;[部屋2]ルート分岐進行（殺害ルート強制）
		;[eval exp="tf.debug_r2_death = 0"]
	;[部屋4]特定のイベントを確定させる
		;[eval exp="tf.force_event_index = 0"]

;------------------------------------------------

; jsファイル読み込み
	[loadjs storage="../scenario/game_logic.js"]
	[loadjs storage="../scenario/epilogue.js"]
	[loadjs storage="../scenario/report_data.js"]
	[loadjs storage="../scenario/rooms/r1.js"]
	[loadjs storage="../scenario/rooms/r2.js"]
	[loadjs storage="../scenario/rooms/r3.js"]
	[loadjs storage="../scenario/rooms/r4.js"]
	[loadjs storage="../scenario/rooms/r5.js"]
	[loadcss file="./data/scenario/game_style.css"]
	[loadcss file="./data/scenario/CSS.css"]

[iscript]
    // リリース形態による設定の切り替え
    if (typeof TYRANO !== 'undefined' && TYRANO.kag.config) {
        if (sf.release_type === 'dl') {
            TYRANO.kag.config.configSave = 'file';
        } else {
            TYRANO.kag.config.configSave = 'webstorage';
        }
    }

    // 初期のレポートアンロックフラグを保存
    if (typeof TYRANO !== 'undefined' && TYRANO.kag.variable.sf) {
        const sf = TYRANO.kag.variable.sf;
        window.initialReportFlags = {
            epilogue_reached: !!sf.epilogue_reached,
            report_r1: !!sf.report_r1,
            report_r2: !!sf.report_r2,
            report_r3: !!sf.report_r3,
            report_r4: !!sf.report_r4,
            report_r5: !!sf.report_r5,
            alive_r1: !!sf.alive_r1,
            alive_r2: !!sf.alive_r2,
            alive_r3: !!sf.alive_r3,
            alive_r4: !!sf.alive_r4,
            alive_r5: !!sf.alive_r5
        };
    }
[endscript]

;マクロ
	[call storage="macro.ks"]

;レイヤーの表示
	[layopt layer="0" visible="true"]
	[layopt layer="1" visible="true"]
	[layopt layer="2" visible="true"]
	[layopt layer="3" visible="true"]
	[layopt layer="4" visible="true"]
	[layopt layer="5" visible="true"]
	[layopt layer="message0" visible="true"]
	[layopt layer="message1" visible="true"]
	[layopt layer="message2" visible="true"]

;メッセージウィンドウの位置
	[position layer="message0" left="0" top="0" width="1280" height="720" margint="0" marginl="0" marginr="0" marginb="0" opacity="0"]
	[position layer="message1" left="400" top="0" width="1100" height="720" margint="0" marginl="0" marginr="0" marginb="0" opacity="0"]
	[position layer="message2" left="300" top="300" width="1100" height="720" margint="0" marginl="0" marginr="0" marginb="0" opacity="0"]

;ローディング削除
	[iscript]
		$('.loadingWrap').css({'display':'none'});
	[endscript]

;----------------------


	;[jump storage="main.ks"]

	[jump storage="title.ks"]

	;[jump storage="epilogue.ks" target="*staff"]



		;[VAR e="sf.alive_r1 = true"][VAR e="sf.alive_r2 = true"][VAR e="sf.alive_r3 = true"][VAR e="sf.alive_r4 = true"][VAR e="sf.alive_r5 = true"]
		;[VAR e="sf.report_r1 = true"]
		;[VAR e="sf.report_r2 = true"]
		;[VAR e="sf.epilogue_reached = true"]

