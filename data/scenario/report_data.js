window.ReportData = [
    {
        id: "synopsis",
        unlockFlag: "epilogue_reached",
        name: "R4038-E 調査概要",
        title: "【R4038-E 旧研究施設調査に関して】",
        text: 
              '<span class="report-section-title">概要</span>' +
              '×年×月×日、違法研究容疑により■■氏を当局が拘束した。<br>' +
              '対象は長期間にわたり非認可人体実験、異常生体研究、および複数の禁制実験を行っていたことを認めている。<br><br>' +
              '現在使用していた研究施設については既に制圧・捜索済み。<br>' +
              '主要設備、保存標本、研究記録類の大半を押収した。<br><br>' +
              'その後の尋問、および押収資料の照合により、過去に使用していた旧研究施設が存在していたことが判明。<br>' +
              '対象証言によれば、当該施設は過去の研究拠点であり、現在は使用されておらず、主要研究データ・資料・設備類は現施設へ移送済みとのこと。<br>' +
              '現時点では、旧施設内に高優先度資料が残存している可能性は低いと判断される。<br>' +
              '    <div class="report-paragraph-no-indent" style="margin-bottom: 10px;">しかし対象証言の信頼性が不完全であること、および以下のリスクを考慮し、完全放棄済みと断定するには至っていない。</div>' +
              '    ・対象証言の信頼性が不完全であること<br>' +
              '    ・未申告保管物の可能性<br>' +
              '    ・実験残物および汚染物質等の残存可能性<br>' +
              '    ' +
              '<span class="report-section-title">対応方針</span>' +
              '第一段階として、少数構成の処理班を現地へ派遣し、施設内部状況の確認を実施する。' +
              '<div class="report-paragraph-no-indent" style="font-weight: bold; color: #00ff41; margin-top: 15px;">■ 確認事項は以下の通り：</div>' +
              '    ・未回収資料の有無<br>' +
              '    ・残存検体の有無<br><br>' +

              '<div class="report-paragraph-no-indent" style="font-weight: bold; color: #00ff41; margin-top: 15px;">■ 調査完了後、結果に応じて以下を判断：</div>' +
              '    継続封鎖<br>' +
              '    情報物回収<br>' +
              '    焼却処理<br>' +
              '    施設解体<br>' +
              '    情報隠滅処理<br>' +
              '<div class="report-paragraph" style="margin-top: 20px;">' +
              '    想定外の事象発生時には現地責任者の判断により対応班の申請を行うこと。' +
              '</div>' +
              '<div class="report-footer">' +
              'R4038-E/DYDOK-4939' +  
              '</div>'
    },
    {
        id: "member_profiles",
        name: "R4038-E 処理班構成員情報",
        title: "【R4038-E 処理班構成員情報】",
        text: function(sf) {
            let html = '';
            
            // ① SA-01 (部屋1クリアで生存アンロック)
            if (sf.alive_r1) {
                html += 
                    '<span class="report-section-title" style="font-size: 18px;">行動番号：SA-01 ／ 管理番号：TE-6387</span>' +
                    '<div class="report-paragraph-no-indent" style="font-weight: bold; color: #00ff41; font-size: 13px;">' +
                    '    男性 ｜ 年齢：23歳 ｜ 身長：174cm ｜ 登録年齢：19歳' +
                    '</div>' +
                    '<div class="report-paragraph-no-indent">' +
                    '    任務遂行能力は高く、特に電子機器分野において優れた技能を有している。一方で、運動能力および射撃能力は平均をやや下回っており、運用上は補助型要員としての適性が高い。<br>' +
                    '    平常時より軽口や皮肉を交えた発言が多く、上官に対しても態度面での明確な改善は認められていない。<br>' +
                    '    ただし、命令違反歴は確認されていない。<br>' +
                    '    総合的に、組織適応性はやや低いと判断されるものの、実務能力の高さから代替性は低く、継続的な運用価値は高い。' +
                    '</div>';
            } else {
                html +=
                    '<span class="report-section-title" style="font-size: 18px; filter: opacity(0.65); border-left-color: #ff4141; background: rgba(255, 65, 65, 0.05); color: #ff4141; display: flex; align-items: center; justify-content: center; gap: 8px;">' +
                    '    <img src="data/fgimage/material/lock.png" style="width: 18px; height: 18px; opacity: 0.9; vertical-align: middle;">' +
                    '</span>';
            }
            html += '<div style="height: 35px;"></div>';

            // ② SA-02 (部屋2クリアで生存アンロック)
            if (sf.alive_r2) {
                html += 
                    '<span class="report-section-title" style="font-size: 18px;">行動番号：SA-02 ／ 管理番号：TE-8462</span>' +
                    '<div class="report-paragraph-no-indent" style="font-weight: bold; color: #00ff41; font-size: 13px;">' +
                    '    男性 ｜ 年齢：22歳 ｜ 身長：178cm ｜ 登録年齢：21歳' +
                    '</div>' +
                    '<div class="report-paragraph-no-indent">' +
                    '    当配属への編入から半年未満であり、経歴情報には一部欠損が認められる。<br>' +
                    '    実務経験はなお不足しているものの、命令理解の速度および記憶能力は高水準にある。<br>' +
                    '    一方で、報告書作成時に不要な詳細を記載する傾向があり、これまでに複数回の修正指導を受けている。<br>' +
                    '    現時点では単独行動に対する不安要素が残っており、引き続き監督下での運用が望ましい。' +
                    '</div>';
            } else {
                html +=
                    '<span class="report-section-title" style="font-size: 18px; filter: opacity(0.65); border-left-color: #ff4141; background: rgba(255, 65, 65, 0.05); color: #ff4141; display: flex; align-items: center; justify-content: center; gap: 8px;">' +
                    '    <img src="data/fgimage/material/lock.png" style="width: 18px; height: 18px; opacity: 0.9; vertical-align: middle;">' +
                    '</span>';
            }
            html += '<div style="height: 35px;"></div>';

            // ③ SA-03 (部屋3クリアで生存アンロック)
            if (sf.alive_r3) {
                html += 
                    '<span class="report-section-title" style="font-size: 18px;">行動番号：SA-03 ／ 管理番号：TE-2408</span>' +
                    '<div class="report-paragraph-no-indent" style="font-weight: bold; color: #00ff41; font-size: 13px;">' +
                    '    男性 ｜ 年齢：24歳 ｜ 身長：175cm ｜ 登録年齢：11歳' +
                    '</div>' +
                    '<div class="report-paragraph-no-indent">' +
                    '    現処理班において中心的な役割を担っており、班員に対する統率力も高い。<br>' +
                    '    重大事案発生時においても判断精度の低下は確認されておらず、安定した指揮能力を維持している。<br>' +
                    '    また、新人班員に対する教育意識および保護意識が強く、状況によっては独断で危険作業を肩代わりする傾向がみられる。<br>' +
                    '    加えて、班内衝突の調停役も兼ねており、内部離脱率の低下に寄与している。<br>' +
                    '    総合評価は高く、現場運用および組織管理の両面で有用性が高い。' +
                    '</div>';
            } else {
                html +=
                    '<span class="report-section-title" style="font-size: 18px; filter: opacity(0.65); border-left-color: #ff4141; background: rgba(255, 65, 65, 0.05); color: #ff4141; display: flex; align-items: center; justify-content: center; gap: 8px;">' +
                    '    <img src="data/fgimage/material/lock.png" style="width: 18px; height: 18px; opacity: 0.9; vertical-align: middle;">' +
                    '</span>';
            }
            html += '<div style="height: 35px;"></div>';

            // ④ SA-04 (部屋4クリアで生存アンロック)
            if (sf.alive_r4) {
                html += 
                    '<span class="report-section-title" style="font-size: 18px;">行動番号：SA-04 ／ 管理番号：TE-5614</span>' +
                    '<div class="report-paragraph-no-indent" style="font-weight: bold; color: #00ff41; font-size: 13px;">' +
                    '    男性 ｜ 年齢：21歳 ｜ 身長：168cm ｜ 登録年齢：16歳' +
                    '</div>' +
                    '<div class="report-paragraph-no-indent">' +
                    '    火薬類および爆発物の取扱いに高い適性を有している。<br>' +
                    '    規律遵守傾向は極めて強く、装備点検、証拠回収、報告作業を高精度で遂行する。<br>' +
                    '    一方で、予定外の事態に対する柔軟な対応能力は相対的に低い。<br>' +
                    '    また、命令系統の乱れや独断行動に対して強い嫌悪傾向を示している。<br>' +
                    '    安定運用要員としては優秀であるが、創発的状況においては補佐要員の配置必要と判断される。' +
                    '</div>';
            } else {
                html +=
                    '<span class="report-section-title" style="font-size: 18px; filter: opacity(0.65); border-left-color: #ff4141; background: rgba(255, 65, 65, 0.05); color: #ff4141; display: flex; align-items: center; justify-content: center; gap: 8px;">' +
                    '    <img src="data/fgimage/material/lock.png" style="width: 18px; height: 18px; opacity: 0.9; vertical-align: middle;">' +
                    '</span>';
            }
            html += '<div style="height: 35px;"></div>';

            // ⑤ SA-05 (部屋5クリアで生存アンロック)
            if (sf.alive_r5) {
                html += 
                    '<span class="report-section-title" style="font-size: 18px;">行動番号：SA-05 ／ 管理番号：TE-3921</span>' +
                    '<div class="report-paragraph-no-indent" style="font-weight: bold; color: #00ff41; font-size: 13px;">' +
                    '    男性 ｜ 年齢：23歳 ｜ 身長：173cm ｜ 登録年齢：14歳' +
                    '</div>' +
                    '<div class="report-paragraph-no-indent">' +
                    '    任務行動において合理性を最優先する傾向が顕著であり、遂行能力は高い。現場対応力にも優れている。<br>' +
                    '    危険分子の排除判断は非常に迅速であり、脅威分析についても現実的かつ精密である。<br>' +
                    '    また、必要以上の行動を避ける傾向があり、私情による判断の乱れは確認されていない。<br>' +
                    '    一方で、他者に歩調を合わせることを好まない傾向がみられる。<br>' +
                    '    単独行動時の安定性は高いが、班行動における協調性については若干の懸念が残る。' +
                    '</div>';
            } else {
                html +=
                    '<span class="report-section-title" style="font-size: 18px; filter: opacity(0.65); border-left-color: #ff4141; background: rgba(255, 65, 65, 0.05); color: #ff4141; display: flex; align-items: center; justify-content: center; gap: 8px;">' +
                    '    <img src="data/fgimage/material/lock.png" style="width: 18px; height: 18px; opacity: 0.9; vertical-align: middle;">' +
                    '</span>';
            }

            html += 
                '<div class="report-footer">' +
                'R4038-E/DYDOK-4959' +  
                '</div>';
                
            return html;
        }
    },
    {
        id: "char1",
        unlockFlag: "report_r1",
        name: "回収資料 NLLA-240",
        title: "回収資料 NLLA-240",
        text: 
            "\n生成直後は器官構造の定まらない肉塊状であったが、観察対象である人間を模倣することで肉体を変質させ、現在ではおおよその人型を維持できるまでに至った。\n" +
            "肉体構造は固定されておらず、自発的に形状を変化させることが可能。\n\n" +

            "哺乳類の肉および血液を強く好む肉食性。\n" +
            "摂食行動中には、対象の反応を確認するような行動が確認されている。\n\n" +

            "周囲環境の変化および人間の行動に対して強い好奇心を示す。\n" +
            "観察・模倣を通じて学習する知能を有しており、他者の反応を引き出すために意図的な行動変化を見せる事例も確認されている。\n\n" +

            "異常な膂力と、接触なしで物体を破壊する念動能力を確認済み。\n" +
            "当初は薬物投与による弱体化処置を施し収容していた。\n" +
            "現在は、給餌を報酬とした行動条件付けにより、限定的な統制に成功している。\n" +
            "ただし行動選択には予測困難な変動が認められ、同一条件下においても反応の一貫性を欠く事例が確認されている。\n" +
            "指定された行動規範についても限定的な自発遵守が確認されている。\n" +
            "ただし、強い関心を誘発する外的刺激が発生した場合、規範外行動へ移行する可能性がある。"+

              '<div class="report-footer">' +
              '' +  
              '</div>'
    },
    {
        id: "char2",
        unlockFlag: "report_r2",
        name: "回収資料 NOL-12",
        title: "回収資料 NOL-12",
        text: 
            "\n初めて長期的安定性を確認した初期生成個体である。\n" +
            "外見・身体構造ともに人間との類似性が高く、後続個体群と比較しても逸脱が少ない。\n\n" +

            "知能水準は一定以上に達しており、研究員の身振り、声調、反復された指示に対して反応を示す。\n" +
            "単語レベルでの発声は確認されているが、言語による会話成立は困難。\n" +
            "簡易命令への理解および反応速度は安定しており、観察期間中を通して高い従属性を維持した。\n\n" +

            "精神傾向としては警戒心が強く、突発音や未知刺激に対して顕著な退避反応を示す。\n" +
            "一方で、危険性が低いと判断した対象に対しては自発的な接近行動を示し、特定研究員への追従傾向も確認されている。\n\n" +

            "身体能力は概ね人間水準に近いが、一部項目において平均値を上回る傾向が確認されている。\n" +
            "ただし現時点において、顕著な攻撃衝動や自発的暴力行為はほとんど確認されていない。\n\n" +

            "また、微弱ながら組織再生能力を有する。\n" +
            "軽度損傷に対する治癒速度は人間平均を上回るものの、後続個体群に見られる異常再生水準には達していない。" +

              '<div class="report-footer">' +
              '' +  
              '</div>'
    },
    {
        id: "char3",
        unlockFlag: "report_r3",
        name: "回収資料 NLL-50",
        title: "回収資料 NLL-50",
        text: 
            "\n人間を素体として改造・再構成した個体である。\n" +
            "筋繊維および神経伝達系に大幅な調整を施した結果、通常人体の範囲を逸脱した身体能力を確認。\n" +
            "加えて、接触対象の構造を劣化させる侵食性の干渉能力の発現を確認している。\n\n" +

            "精神面においては極めて不安定であり、恒常的に高い攻撃性が認められる。\n" +
            "反応速度が異常に速く、特に他者の視線、呼吸、微細な動作などに対し過敏に反応する傾向がある。\n\n" +

            "肉体強度および再生能力は極めて高く、一般的な損傷は短時間で修復される。\n" +

            "初期段階では感覚反応試験を実施し、刺激に対する反応を確認していた。\n" +
            "しかし、その後反応性は急速に低下し、現在では、重度損傷時においても痛覚反応は極めて希薄である。\n\n" +

            "本個体の維持には抑制薬剤の継続投与が必須となる。現在は鎮静剤・筋抑制剤・代謝阻害剤を併用し、意図的な機能抑制状態を維持している。\n\n" +

            "収容違反発生時、通常武装による鎮圧は推奨しない。\n" +
            "逃走または暴走時には、閉鎖区画への誘導後、神経性制圧ガスを用いた鎮圧処置を優先的に実施すること。\n" +

              '<div class="report-footer">' +
              '' +  
              '</div>'
    },
    {
        id: "char4",
        unlockFlag: "report_r4",
        name: "回収資料 NLLRB-066",
        title: "回収資料 NLLRB-066",
        text: 
            "\n既存の人間を基に作製された複製体である。\n" +
            "基礎設計段階より、既存被検体群に確認された特異能力の移植・増幅を目的として調整を施した。\n\n" +

            "特筆すべきは、本個体に付加された知覚干渉能力である。\n" +
            "詳細な発現機序は不明であるが、本個体の周囲では観察者の視覚認識および状況判断に著しい乱れが生じる。\n\n" +

            "初期段階では限定的な視覚錯誤に留まっていたが、成長に伴い干渉精度および出力は著しく増大した。\n" +
            "現在では、本個体を直接視認した観察者が、実在しない人物、物体、あるいは環境変化を認識した事例が複数確認されている。\n\n" +

            "観察結果には著しい個人差が確認されており、ある者は本個体を異形の怪物として認識し、また別の者は幼い子供として認識したと報告している。\n" +
            "これらの差異は、観察者の精神状態や深層認識などに影響されている可能性が高い。\n\n" +

            "本個体の正確な外見を記録する試みは現在も難航している。\n" +
            "映像記録と目視報告の間にも不一致が認められており、本個体の周辺では知覚情報そのものが改変されている可能性がある。" +


              '<div class="report-footer">' +
              '' +  
              '</div>'
    },
    {
        id: "char5",
        unlockFlag: "report_r5",
        name: "回収資料 NLO-283",
        title: "回収資料 NLO-283",
        text: 
            "\n詳細不明の工程を経て作製された人造個体である。\n\n" +
            "外見上は一般成人女性との差異が少ない。\n" +
            "骨格強度および耐損傷性についても一般人体と同程度であり、損傷発生自体を防ぐ能力は確認されていない。\n" +
            "一方、筋力は同体格の人間を大きく上回る数値を示しているが、運動制御には不安定性が見られ、歩行速度は平均値を下回る傾向にある。\n" +
            "著しく高い再生能力を確認しており、損傷部位は重篤度にかかわらず短時間で修復される。\n" +
            "致命傷相当の肉体損傷に対しても生存を継続した事例を確認している。\n\n" +

            "知能水準については、初期観察段階において一定以上の理解力および学習能力を示した。\n" +
            "言語理解および視覚的指示への反応は可能であり、最低限の応答反応は確認されている。\n" +
            "ただし、肉体損傷後の再生過程を経た直後は認知能力の低下が顕著であり、反応遅延や半覚醒状態に類似した挙動が観測された。\n\n" +

            "現在、本個体は□□へ管理権限を移譲済み。\n" +
            "移管後は主として身体感度に関する実験が継続されているとの報告を受けている。"
    }
];
