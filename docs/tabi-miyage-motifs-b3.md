# 旅とお土産の歴史 ブロック3 絵コンテ設計メモ (文#97〜#138)

実装: `src/remotion/karakuri/TabiB3.tsx` / motif接頭辞 `tb3_` / WobbleDefsシード600〜641。
検品用レンダー: `npx remotion render tmp/tabib3/entry.tsx TabiB3P tmp/tabib3/seq --image-format=jpeg --sequence`
(element-NN.jpeg = 文#(97+NN)、f=60の静止画)

## 第5章 グランドツアー (#97〜#110)

| 文# | motif | 絵の説明 | 使った部品 | 動きの演出 |
|---|---|---|---|---|
| 97 | tb3_ch5_door | 地球儀上を日本→ロンドンへ航路が伸び、章扉「口実その2 教育」 | GlobeTravel(japan→london), ChapterDoor(num=5), TBadge | 航路が走り終わってから題字がすっと浮上 |
| 98 | tb3_not_faith | ホタテ貝バッジに赤バツ、右に大きな「?」 | EuroBg18c, ScallopShell, TagPlate「巡礼のしるし」, Xmark | 貝がpop→バツが2画で入り→「?」が揺れながら登場 |
| 99 | tb3_grandtour_intro | 馬車が走り込み、貴族の息子と「Grand Tour」題字板 | EuroBg18c, Carriage, NobleSon, Stamp「17世紀」 | 馬車が左から走り込み、題字板がpop |
| 100 | tb3_gt_map | 欧州地図の上をロンドン→パリ→ジュネーブ→ヴェネツィア→フィレンツェ→ローマと馬車が進む | GrandTourMap, Carriage, gtCarriagePos | 馬車が路線をeaseOutで巡回 (f12〜120) |
| 101 | tb3_gt_map_meimoku | 完走済みの同じ地図に「教育」の紋章 (開いた本+月桂冠) がぽん | GrandTourMap(f+130), Carriage, 自作紋章 | 地図は完走状態、紋章が中央にpop |
| 102 | tb3_gt_jittai | 紋章がめくれて中身は買い物袋と観光 (実態) | EuroBg18c, 買い物袋+小物, Xmark風のめくれ | 名目カードが倒れて実態がpop |
| 103 | tb3_gt_tutor | 貴族の息子の後ろに家庭教師がぴったり同行 | EuroBg18c, NobleSon, Tutor(眼鏡+本) | 2人が並んで歩き、教師が本を掲げる |
| 104 | tb3_kanko_word | 「観光」の文字が生まれる (光の中からぽん) | 大文字プレート, Spark, Burst | 文字がpopし光がはじける |
| 105 | tb3_tourist_1772 | 辞書風ページに tourist の初出 | 辞書ページ, Stamp「1772年」 | ページがめくれて語が現れ、年号スタンプ |
| 106 | tb3_souvenir | souvenir=仏語「思い出す」の吹き出し | 辞書ページ, 思い出す人物+回想バブル | 回想バブルがふわっと膨らむ |
| 107 | tb3_gt_market | 土産市場の屋台に絵や小物が並ぶ | EuroBg18c, 屋台, 額縁小物 | 商品が順にpopして並ぶ |
| 108 | tb3_canaletto_piranesi | 左に大きな風景画 (高級)、右に版画 (お手頃) の対比 | 額縁2種, GoldCoin, TagPlate | 2枚が交互にpop、金貨の枚数で対比 |
| 109 | tb3_miyage_pair | 高級土産と絵はがきが「=」で今とつながる | 額縁+絵はがき, 矢印 | 2つが近づいてつながる |
| 110 | tb3_koujitsu2 | 口実ルート図 (鳥居→本=信仰・教育の2駅) | KoujitsuRoute(count=2), MiniKoujitsu | 2駅目「教育」が点灯する |

## 第6章 湯治 (#111〜#122)

| 文# | motif | 絵の説明 | 使った部品 | 動きの演出 |
|---|---|---|---|---|
| 111 | tb3_ch6_door | 章扉「口実その3 療養」+湯けむり | ChapterDoor(num=6), OnsenBg系湯けむり | 湯けむりが立ちのぼり題字が浮上 |
| 112 | tb3_ryoyo_plate | 「療養」の大札がどんと立つ | TagPlate大, 湯の背景 | 札がpopで立ち、ゆらゆら |
| 113 | tb3_touji_intro | 江戸の庶民が湯治場ののれんへ向かう | KaidoBg系, 旅人, のれん「湯」 | 旅人が歩み寄り、のれんが揺れる |
| 114 | tb3_rotenburo_heal | 露天風呂に浸かる人 (浴衣の人物を湯船の奥に描いて入浴表現) | Rotenburo, YukataPerson, 湯けむり | 湯けむりが上がり、顔がほこほこ揺れる |
| 115 | tb3_hitomeguri | 7マスのこよみに印が入っていく | 自作7マスカレンダー, Stamp「7日」 | マスが1つずつ埋まり「一廻り」表示 |
| 116 | tb3_mimeguri | ミニこよみ3枚が並び「三廻り 21日」 | MiniCal×3, Stamp「21日」 | 3枚が順にpop |
| 117 | tb3_banzuke | 温泉番付表 (相撲番付風の縦書き表) | 番付表 (自作), 湯マーク | 番付がするすると掛かる |
| 118 | tb3_banzuke_zoom | 番付の上段へカメラが寄り、東西の大関に札 | Cam(scale1→1.22), LabelPill「東の大関 草津」「西の大関 有馬」+赤線 | ズームイン→札が左右からpop |
| 119 | tb3_kaban_book | 旅人のカバンから本が顔を出す | 行李カバン, 本, 旅人 | カバンが開き本がぴょこん |
| 120 | tb3_youjinshu_1810 | 『旅行用心集』の表紙どーん | 和本表紙, Stamp「1810年」 | 表紙がpop、年号スタンプが押される |
| 121 | tb3_youjinshu_nakami | 見開きに道のり・料金・効能の図説 | 和本見開き, Stamp「61か条」 | ページが開き項目が順に現れる |
| 122 | tb3_koujitsu3 | 口実ルート図3駅 (信仰・教育・療養) 出そろう | KoujitsuRoute(count=3), MiniKoujitsu(鳥居/本/湯) | 3駅目「療養」が点灯、機関車の予感 |

## 第7章 旅が商品になる (#123〜#138)

| 文# | motif | 絵の説明 | 使った部品 | 動きの演出 |
|---|---|---|---|---|
| 123 | tb3_ch7_door | 章扉「旅が商品になる」+蒸気機関車が走り込む | ChapterDoor(num=7), SteamLoco | 機関車が煙を吐いて走り込み、題字浮上 |
| 124 | tb3_loco_debut | 蒸気機関車の勇姿どーん (車輪が回る) | SteamLoco大, 煙, 線路 | 車輪回転+煙がもくもく |
| 125 | tb3_1841_jiken | 日めくり「1841年 7/5」+英国旗風の背景 | 日めくりカレンダー (自作), Stamp | 日めくりがめくれて日付がどん |
| 126 | tb3_cook_500 | クック氏が列車に人々を乗せる | SteamLoco, VictorianGent(クック), 乗客列, Stamp「約500人」 | 乗客がぞろぞろ乗車、人数スタンプ |
| 127 | tb3_kinshu_taikai | 「禁酒のつどい」の横断幕+ビールにバツ | 横断幕, BeerMug, Xmark, 聴衆 | 幕が掛かり、ジョッキにバツ |
| 128 | tb3_one_shilling | 大きな1シリング硬貨と切符 | GoldCoin大, Ticket, TagPlate「団体割引」 | 硬貨がくるんと回ってpop |
| 129 | tb3_ryokogyo_genten | 禁酒バッジ→旅行カバンへ矢印 (原点の図) | BeerMug+Xmark, 旅行カバン, 矢印 | 左から右へ変化の矢印が伸びる |
| 130 | tb3_cook_sodateru | クックがじょうろで水やり→切符の木が育つ | VictorianGent, じょうろ, Ticket×3の木, GoldCoin | 茎が伸び切符の葉がぽんぽん開く |
| 131 | tb3_banpaku_1851 | 水晶宮 (ガラスの大宮殿) と人波 | 水晶宮 (自作), 人波, Stamp「1851年」, LabelPill「約15万人といわれる」 | 建物がせり上がり人波が流れる |
| 132 | tb3_euro_shuyu_1855 | 蒸気船が海を渡る | SteamShip, 波, Stamp「1855年」 | 船が波に揺られて進む |
| 133 | tb3_world_tour | 地球儀を一周する赤い航路 | WorldTourGlobe, Stamp「1872年」 | 航路が地球をぐるりと一周 |
| 134 | tb3_world_tour_222 | 完走済み地球儀+赤い本『八十日間世界一周』 | WorldTourGlobe(f+130), 赤本, Stamp「222日」 | 本がpopし地球儀と並ぶ |
| 135 | tb3_ticket_kaeru | 切符売り場に硬貨が吸い込まれ切符が出て、口実アイコンが飛んでいく | 切符ブース, GoldCoin, Ticket, MiniKoujitsu(鳥居/本/湯) | 硬貨が弧を描いて入り、口実3つが上へ退場 |
| 136 | tb3_mibun_funyou | 「身分」(冠)・「信仰」(鳥居) のカードにバツ | 冠カード+鳥居カード, Xmark×2 | カードが並び、順にバツ |
| 137 | tb3_daredemo_tabi | いろんな人が切符を掲げて笑顔 | 人物複数, Ticket, Spark | 人々が順にpopし切符を掲げる |
| 138 | tb3_kanko_tanjo | 口実ルート図4駅完成+機関車に乗って走る+紙吹雪 | KoujitsuRoute(count=4, ride=true), 紙吹雪 | 4駅目「商品」点灯→機関車が走り抜けフィナーレ |

## 検品メモ (2巡)

- 1巡目指摘→修正: #100/#101 馬車がヴェネツィアのラベルに重なる (#100はy−52へ持ち上げ、#101は到着済みなのでローマのピン右脇に駐車)、#130 切符の葉が茎から離れすぎ (±130→±80台に寄せ)、#98 「巡礼のしるし」札を家から左下へ退避。2巡目+追い検品で全件解消を確認。
- 仕様として問題なし: 静止画f=60で「?」等のf≥62演出が写らないのは設計どおり (動画では出る)。
- 事実表現: #131 の15万人は「といわれる」表記で断定回避。番付の草津/有馬は史実の番付どおり。
