
;システム-----------------------
		
	;セーブロード禁止
		[macro name="stop_salo"]
			[iscript]
			 var hoge = __tyrano_key_config;
			[endscript]
		[endmacro]
			
	;セーブロード開始
		[macro name="start_salo"]
			[iscript]
			 var hoge = __tyrano_key_config;
			[endscript]	
		[endmacro]
		
;UI-----------------------

	;変数
		[macro name="VAR"]
			[eval exp="%e"]
		[endmacro]
		

	;ボタン
		[macro name="BTN"]
			[button name="%n" graphic="%s" folder="%fol|data/image/" storage="%sn" target="%g"  x="%x"  y="%y" enterse="%ense" clickse="%se" enterimg="%enimg"]
		[endmacro]
	
	;カメラ
		[macro name="ca"]
			[camera layer="%ly|0" x="%x" y="%y" zoom="%z" time="%t|1" wait="%w|true" ease_type="%e"]
		[endmacro]
		
	;カメラリセット
		[macro name="caR"]
	　　	[reset_camera  layer="%ly|0" time="%t|1" wait="%w|true"]
		[endmacro]
		

;短縮

	;ウエイト時間
		[macro name="W"]
			[wait time="%t"]
		[endmacro]

		[macro name="W-100"]
			[wait time="100" ]
		[endmacro]
		
		[macro name="W-200"]
			[wait time="200" ]
		[endmacro]
		
		[macro name="W-300"]
			[wait time="300" ]
		[endmacro]
		
		[macro name="W-400"]
			[wait time="400" ]
		[endmacro]
		
		[macro name="W-500"]
			[wait time="500" ]
		[endmacro]
		
		[macro name="W-700"]
			[wait time="700" ]
		[endmacro]
		
		[macro name="W-800"]
			[wait time="800" ]
		[endmacro]
		
		[macro name="W-1000"]
			[wait time="1000" ]
		[endmacro]
		
		[macro name="W-1200"]
			[wait time="1200" ]
		[endmacro]
		
		[macro name="W-1400"]
			[wait time="1400" ]
		[endmacro]
		
		[macro name="W-1600"]
			[wait time="1600" ]
		[endmacro]
		
		[macro name="W-1800"]
			[wait time="1800" ]
		[endmacro]

		[macro name="W-2000"]
			[wait time="2000" ]
		[endmacro]
		
	
	;フェードアウト
		[macro name="Fo"]
			[mask time="%t|1" wait="%w|true"]
		[endmacro]

		[macro name="Fo-100"]
			[mask time="100"]
		[endmacro]
		
		[macro name="Fo-300"]
			[mask time="300"]
		[endmacro]
		
		[macro name="Fo-500"]
			[mask time="500"]
		[endmacro]
		
		[macro name="Fo-800"]
			[mask time="800"]
		[endmacro]
		
		[macro name="Fo-1000"]
			[mask time="1000"]
		[endmacro]
		
		[macro name="Fo-1200"]
			[mask time="1200"]
		[endmacro]
		
		[macro name="Fo-2000"]
			[mask time="2000"]
		[endmacro]
		
		[macro name="Fo-3000"]
			[mask time="3000"]
		[endmacro]
	
	
	;フェードイン
		[macro name="Fi"]
			[mask_off time="%t|1" wait="%w|true"]
		[endmacro]
		
		[macro name="Fi-100"]
			[mask_off time="100"]
		[endmacro]
		
		[macro name="Fi-300"]
			[mask_off time="300"]
		[endmacro]
		
		[macro name="Fi-500"]
			[mask_off time="500"]
		[endmacro]
			
		[macro name="Fi-800"]
			[mask_off time="800"]
		[endmacro]
		
		[macro name="Fi-1000"]
			[mask_off time="1000"]
		[endmacro]


	;レイヤー削除
		[macro name="R0"]
			[freeimage layer="0" time="%t|0" wait="%w|true"]
		[endmacro]
		
		[macro name="R1"]
			[freeimage layer="1" time="%t|0" wait="%w|true"]
		[endmacro]

		[macro name="R2"]
			[freeimage layer="2" time="%t|0" wait="%w|true"]
		[endmacro]
		
		[macro name="R4"]
			[freeimage layer="4" time="%t|0" wait="%w|true"]
		[endmacro]
		
		[macro name="R5"]
			[freeimage layer="5" time="%t|0" wait="%w|true"]
		[endmacro]

		
	;レイヤー削除（name付き）
		[macro name="RN0"]
			[free layer="0" name="%n" time="%t|0" wait="%w|true"]
		[endmacro]

		[macro name="RN1"]
			[free layer="1" name="%n" time="%t|0" wait="%w|true"]
		[endmacro]
		
		[macro name="RN2"]
			[free layer="2" name="%n" time="%t|0" wait="%w|true"]
		[endmacro]
		
	;SE
		[macro name="SE"]
			[playse storage="%s" buf="%b|1" volume="%v" loop="%lo|false"]
		[endmacro]
		
	;SE
		[macro name="SE_off"]
			[stopse buf="%b|1"]
		[endmacro]
		
	;BGM
		[macro name="BGM"]
			[fadeinbgm storage="%s" time="%t|1" volume="%v"]
		[endmacro]
		
	;BGMオフ
		[macro name="BGM_off"]
			[fadeoutbgm time="%t|1"]
		[endmacro]
		
	;BGM
		[macro name="BGMre"]
			[playbgm storage="%s" restart="false" volume="%v"]
		[endmacro]
		
		
	;画像
		[macro name="img"]
			[image layer="%ly|0" name="%n" folder="image" storage="%s" x="%x" y="%y" width="%wi" height="%he" time="%t" wait="%w|true" reflect="%r" zindex="%z" pos="%p"]
		[endmacro]
		
	;アニメ
		[macro name="anm"]
			[anim layer="%ly" name="%n" left="%x" top="%y" width="%wi" height="%he" opacity="%o|255" effect="%e" time="%t|1"][wait time="%t|1"]
		[endmacro]

	;アニメ(ウエイト無し)
		[macro name="anmW"]
			[anim layer="%ly" name="%n" left="%x" top="%y" width="%wi" height="%he" opacity="%o|255" effect="%e" time="%t|1"]
		[endmacro]

	;会話用テンプレート
	[macro name="talk"]
		[playse storage="transceiver.ogg" buf="5"]
		[iscript]
		(function(){
			let text = mp.text || "";
			const kag = TYRANO.kag;
			
			if (text.startsWith('&')) {
				const exp = text.substring(1).trim();
				if (exp.startsWith('tf.')) text = kag.variable.tf[exp.substring(3)] || text;
				else if (exp.startsWith('f.')) text = kag.variable.f[exp.substring(2)] || text;
				else if (exp.startsWith('sf.')) text = kag.variable.sf[exp.substring(3)] || text;
			} else if (text.startsWith('tf.')) {
				text = kag.variable.tf[text.substring(3)] || text;
			} else if (text.startsWith('f.')) {
				text = kag.variable.f[text.substring(2)] || text;
			} else if (text.startsWith('sf.')) {
				text = kag.variable.sf[text.substring(3)] || text;
			}

			kag.stat.is_stop = true;
			if (window.__stampGameUI && typeof window.__stampGameUI.showTalkDialogue === 'function') {
				window.__stampGameUI.showTalkDialogue(text).then(() => {
					setTimeout(() => {
						kag.stat.is_stop = false;
					}, 50);
				});
			} else {
				alert(text);
				kag.stat.is_stop = false;
			}
		})();
		[endscript]
		[p]
		[iscript]
		if (window.__stampGameUI && typeof window.__stampGameUI.hideTalkDialogue === 'function') {
			window.__stampGameUI.hideTalkDialogue();
		}
		[endscript]
	[endmacro]



