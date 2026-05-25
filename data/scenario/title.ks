

	;フェードアウト
		[Fo]

	;削除
		[clearstack]

	*start

	;キー操作無効
		[stop_keyconfig]

	;タイトル画像 (ランダム背景の初期表示)
		[loadjs storage="../scenario/title.js"]
		[iscript]
			window.TitleManager.initRandomBackground();
		[endscript]
		[img s="&tf.init_bg" n="title_bg"]

	;タイトルロゴ
		[img ly="1" s="title/titlelogo.png" y="240" n="title_logo"]

	;演出用スクリプトの実行
		[iscript]
			window.TitleManager.setupEffects();
		[endscript]

	;●
		[W-100]
	
	;フェードイン
		[Fi-300]

	;待機
		[if exp="sf.release_type != 'dl'"]
			[p]
		[endif]

	;SE
		[playse storage="button02.ogg"]


	;BGM
		[BGM s="Drone51_metal_low.ogg" t="500"]
		
	;バージョン
		[ptext layer="0" x="1050" y="50" size="30" width="80" face="ShareTechMono" text="ver1.0.0" color="0x00ff41"]
		

	*show_buttons
	;ボタン表示
		[iscript]
			window.TitleManager.showButtons();
		[endscript]

		[glink name="title_btn,start_btn" face="ShareTechMono" text="Start" font_color="0x00ff41" target="*gamestart" y="490" size="40" clickse="start.ogg" enterse="hover.ogg"]
		[glink name="title_btn,report_btn" face="ShareTechMono" text="Report" font_color="0x00ff41" target="*open_report" y="590" size="30" clickse="button02.ogg" enterse="hover.ogg"]
		[glink name="title_btn" face="ShareTechMono" text="Delete" font_color="0x00ff41" target="*trash" x="1010" y="554" size="38" clickse="button02.ogg" enterse="hover.ogg"]
		[glink name="title_btn" face="ShareTechMono" text="Sound" font_color="0x00ff41" target="*open_sound" x="1010" y="610" size="38" clickse="button02.ogg" enterse="hover.ogg"]



	[s]

	*open_report
	[BGM_off t="300"]
	[iscript]
		window.TitleManager.showReportDialog();
	[endscript]
	[s]

	*report_close
	[BGM s="Drone51_metal_low.ogg" t="300"]
	[jump target="*show_buttons"]

	*open_sound
	[call storage="sound.ks"]
	[jump target="*show_buttons"]
	
;----------------------------------------------------------------
;スタート

	*gamestart
	
	[iscript]
	window.clearTitleEffects();
	[endscript]

	[clearfix name="title_btn"]

	;BGMストップ
		[BGM_off t="500"]
		
	;フェードアウト
		[mask time="200" wait="true"]

	;ボタン削除
		[clearfix][cm][clearstack]

	;削除
		[R0][R1]
				
	;●
		[W-100]

	;ジャンプ
		[jump storage="prologue.ks"]	

	[s]
	

;----------------------------------------------------------------
;削除

	*trash
	
	[iscript]
		window.TitleManager.showDeleteDialog();
	[endscript]

	[s]


	;フェードアウト
		[Fo-100]

	;●
		[W-100]

	*tok
		[iscript]
		window.clearTitleEffects();
		[endscript]
		
	;SE
		[playse storage="button02.ogg"]

	;●
		[W-300]

	;SE
		[playse storage="delete.ogg"]

	;フェードアウト
		[mask time="100" wait="true" color="0x000000"]

		[W-300]

		[iscript]
			window.TitleManager.clearSaveData();
			window.TitleManager.reloadGame();
		[endscript]

[s]

	*tcan_js
	[playse storage="cancel.ogg"]
	[jump target="*show_buttons"]

	*tcan_wait
	[s]
