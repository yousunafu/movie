# 旅とお土産の歴史 ブロック4 絵コンテ (#139–#174)

第8章「鉄道が名物を作る」(#139–#158) と第9章「戦後日本の旅」(#159–#174)。
実装: `src/remotion/karakuri/TabiB4.tsx` (WobbleDefs seed 700–735)。
プレビュー: `npx remotion render TabiB4P tmp/tabib4 --sequence --image-format=jpeg` (element-NN = 文#(139+NN) の f=60 スナップ)。

| 文# | motif | 絵の説明 | 使った部品 | 動きの演出 |
|---|---|---|---|---|
| 139 | tb4_ch8_door | 第8章扉。左に線路+汽車、上に回る駅時計 | ChapterDoor, SteamLoco, StationClock | 線路が線描→汽車が左から滑り込み、時計の針は回り続ける |
| 140 | tb4_timetable_1839 | 英国駅で紳士が世界初の時刻表を掲げる | BritStationBg, VictorianGent, TimetableSheet, Stamp(1839) | 時刻表がpopで登場、紳士はbob+まばたき |
| 141 | tb4_machi_barabara | 3つの時計塔がてんでバラバラの時刻 | ClockFace(局所), LabelPill | 塔が順にpop、間で「？」が揺れる。字幕補足「時計は町まかせ」 |
| 142 | tb4_taiyo_jikoku | 太陽の弧と2軒の家、時計がずれる | Sun(局所), ClockFace | 太陽が弧を描いて動き、ずれ矢印がseg表示 |
| 143 | tb4_jikokuhyo_dame | 時刻表に大きな✗、紳士が冷や汗 | TimetableSheet, VictorianGent, ClockFace, ≠ | ✗が2画で描かれ、汗がループで落ちる |
| 144 | tb4_soroeru | 3つの時計の針が正午にそろう大仕掛け | ClockFace, MiniTrain(局所), LabelPill | 針がseg25–55で一斉に回転整列→Burst、下をミニ列車が走る。字幕「基準は鉄道の時間」 |
| 145 | tb4_usa_1883 | 星条旗と大時計、小時計もそろう | USFlag(局所), ClockFace, SteamLoco, Stamp(1883) | 小時計が順にそろってpop。字幕「鉄道会社の取り決め」でヘッジ |
| 146 | tb4_futatsu_shogo | 1つの時計に「1回目/2回目の正午」札、鐘の波紋 | ClockFace, TagPlate, 鐘弧 | 分針が0→−110→0へ戻る時間巻き戻し演出+鐘の波紋 |
| 147 | tb4_japan_chokurei | 日の丸と「標準時」の巻物、勅印 | HinomaruFlag(局所), 巻物, Stamp(1886) | 巻物が上から広がり、勅印がpop |
| 148 | tb4_mou_hitotsu | 宇都宮駅に汽車、布をかぶった謎の箱と？ | MeijiStationBg, SteamLoco, 布箱 | 汽車が走り込み、箱がpop、？が揺れる |
| 149 | tb4_ekiben_tanjo | 駅弁売り子と竹皮包みがドンと登場 | MeijiStationBg, EkiUriko, Ekiben, Burst | 包みがpop×1.35で登場→Burst。v2で巨大すぎを修正 |
| 150 | tb4_utsunomiya_setsu | 駅舎へカメラが寄る。「1885 宇都宮駅 説」 | MeijiStationBg, EkiUriko, Stamp | 全体がsc1→1.13へズームイン。説ヘッジはStamp文言 |
| 151 | tb4_nigirimeshi | 開いた駅弁 (握り飯2個+たくあん) のズーム | Ekiben(open), TagPlate(5銭), Burst | 弁当がsc2.3→2.8へ拡大、湯気ループ |
| 152 | tb4_meibutsu_narabu | 駅前の台に名物が並ぶ。のぼり「めいぶつ」 | MeijiStationBg, Ekiben, KashiBox, 壺, のぼり | 台→品が順にpop、のぼりが立つ |
| 153 | tb4_meibutsu_maker | 汽車が貨車2両 (菓子箱・駅弁) を引いて走る | SteamLoco, KashiBox, Ekiben, TagPlate(名物) | 編成が走り、スピード線が流れる |
| 154 | tb4_henka_yokoku | お札が揺れ、回転矢印と「！」 | OfudaTag, 回転矢印, Burst片 | 札がガタガタ振動、矢印が回る |
| 155 | tb4_ofuda_to_kashi | お札→太矢印→輝く菓子箱 | OfudaTag, KashiBox(open), 太矢印 | 矢印がぐんと伸び、箱が光芒つきでpop |
| 156 | tb4_akafuku | 鳥居と皿の上のあかふく餅3つ | ShinmeiTorii, 餅(局所), TagPlate, Stamp(社伝では1707) | 餅が順にpop。v2で餅の透け修正。社伝ヘッジはStamp文言 |
| 157 | tb4_onsen_manju | 湯けむりの山里と温泉まんじゅう3つ | OnsenBg, Manju(局所), Stamp(1910 伊香保とされる) | まんじゅうが順にpop、湯気ループ。ヘッジはStamp文言 |
| 158 | tb4_oishii_houkoku | 菓子箱を手渡し、手紙とハートが浮かぶ | Person×2, KashiBox, 手紙, HeartS | 箱が弧を描いて渡り、ハートが舞う |
| 159 | tb4_ch9_door | 第9章扉。日めくり「明治/大正」が飛んで「戦後」 | ChapterDoor, カレンダー(局所), SparkleS | 日めくりが2枚飛び去る時間ジャンプ演出 |
| 160 | tb4_kuchijitsu_nakama | 路線図: お参り—湯治—新婚旅行 | 路線図(局所), MiniTrain, HeartS, Burst片 | 線が伸び駅が順にpop、新婚旅行駅が光る。字幕「旅の口実の路線図」 |
| 161 | tb4_shinkon | 新郎 (黒) と花嫁 (白・ベール+ティアラ+ブーケ) | Person×2+花嫁オーバーレイ | 紙吹雪とハートが舞い続ける |
| 162 | tb4_1960_miyazaki | 日本地図で東京→宮崎の点線弧 | JMapCard, DashArc, MapPin, MapName, Stamp(1960) | ピンpop→弧が伸び→宮崎ピン+ハートpop (f60以降) |
| 163 | tb4_gyokai_chance | バス・旅館のたすき2人が「チャンス！」 | Person(tasuki), Bubble, Burst, SparkleS | 2人がleanで身を乗り出し、吹き出しpop |
| 164 | tb4_seichi_shitate | 海辺に歓迎アーチ「ようこそ みやざき」、バス到着 | 海+砂浜, PalmTree(局所), Bus(局所), Sun, HeartS | 柱が立ち→看板が落ちてはまり→バスが走り込む |
| 165 | tb4_37man_kumi | 地図の弧の上をハート5つが行進。1974/年間37万組 | JMapCard, DashArc, MapPin, HeartS, Stamp, LabelPill | ハートがベジェ上を順に流れる |
| 166 | tb4_3kumi_1kumi | 3組のカップル、1組だけスポットライト+みやざき旗 | Person×6, スポット光, HeartS, ペナント | 光の柱がすっと落ち、旗が立つ。「3組に1組」は絵のみで断定回避 |
| 167 | tb4_1964_jiyuka | 空港でゲートバーが開き「海外へ」 | GendaiBg, ModernTraveler, ゲート(局所), Stamp(1964) | バーが−74°回転して開く、光片が散る |
| 168 | tb4_500_doru | $500の札束に上限バー、年1回カレンダー | 札束(局所), クランプバー, TagPlate(上限), カレンダー | バーが上下から挟み込み、カレンダーpop |
| 169 | tb4_jalpak_hatsubai | 滑走路からジェット機が離陸、パンフ「パック旅行」 | JetPlane, 滑走路(局所), パンフ, Stamp(1965) | 機体が(340,840)→(1460,330)へ離陸、飛行機雲 |
| 170 | tb4_nedan_don | エッフェル塔と巨大値札「67万5000円」 | Eiffel(局所), 値札, LabelPill(ヨーロッパ16日間) | 値札がsc2.6→1でドンと着地、画面シェイク |
| 171 | tb4_yume_no_yume | 見上げる人と夢の雲 (塔+ジェット機) | Person, 思考泡, Eiffel, JetPlane, SparkleS | 泡が順にpop、雲の中身がふわふわ |
| 172 | tb4_kikoku_miyage | 空港で紙袋2つの旅行者を家族が「おかえり！」 | GendaiBg, ModernTraveler, PaperBag×2, Person×2, Bubble | 紙袋が歩きに合わせて揺れ、吹き出しpop |
| 173 | tb4_bag_pops | 紙袋から洋酒・チョコ・スカーフが飛び出す | PaperBag, WhiskyBottle/ChocoBox/Scarf(局所), Burst | 3品がseg12/28/44で弧を描いて順に飛び出す |
| 174 | tb4_houkokusho | チョコを手渡し、土産話の吹き出し (塔) | Person×3, ChocoBox, 吹き出し, HeartS | 箱が弧で渡り、吹き出しに塔が線描される |

## 検品メモ
- 検品2巡 (全36枚→修正2件→再レンダ確認)。修正: #149 駅弁が巨大で駅舎に被る→縮小・右下へ移動 / #156 餅の塗りが透けて皿が透過→不透明化。
- ヘッジ表現: #145 字幕「鉄道会社の取り決め」、#150「説」、#156「社伝では」、#157「とされる」、#166 は絵のみ。
- 年号・金額は Stamp/TagPlate のみ (字幕との重複なし)。キャプション補足は #141/#144/#145/#160 の4枚。
