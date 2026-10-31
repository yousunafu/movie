# 旅とお土産の歴史: ブロック5 絵コンテ表 (文#175〜#204)

第10章「『配れるお土産』の完成」+ 結章「千年のからくり」。
本作唯一の「からくり図解」(#183〜#185) を含むブロック。
motif 接頭辞 = `tb5_`、WobbleDefs seed = 800〜829。

| 文# | motif | 絵の説明 | 使った部品 | 動きの演出 |
|---|---|---|---|---|
| 175 | tb5_ch10_door | 章扉。菓子箱と脱酸素剤の小袋に赤い大きな「？」 | ChapterDoor(num=10), KashiBox, DatsusansoPack | 箱→小袋→？の順にpop。？はゆらゆら回転 |
| 176 | tb5_himochi_kadai | 生菓子と時計、赤枠の大きな「日持ち」札 | CakeDome, Clock, 自作札 | 札がpopで登場、時計の針が進む |
| 177 | tb5_namagashi_itamu | ふわふわ菓子→早回し時計→傷んだ菓子 (画中変化) | CakeDome(stale), Clock | 時計が高速回転、右の菓子が灰色+カビ点に変化 |
| 178 | tb5_tooi_shokuba | お店→点線の道→遠くの職場ビル。箱が途中で止まり✗ | Person, KashiBox, CrossMark | 箱が道を進んで途中停止、✗がpop、汗マーク |
| 179 | tb5_kaiketsu_dare | 巨大「？」。旅行業界カードに✗、灰色の？？？カード | CrossMark, 自作カード | ？がpop、旅行業界カードが✗で消される |
| 180 | tb5_1977_hatsubai | ノコギリ屋根の工場から小袋が飛び出してくる | DatsusansoPack, Stamp(1977年) | 小袋が拡大しながらスライド、スピード線 |
| 181 | tb5_ageless_toujou | 画面中央に小袋ドン+放射線。「エージレス」赤枠札 | DatsusansoPack, Burst | カメラズーム(scale 0.92→1.1)、キラッ星 |
| 182 | tb5_kairo_onaji | カイロと脱酸素剤を並べ、窓の中に鉄粉。大きな「≒」 | DatsusansoPack, IronGrain | 左右順にpop、≒がpop、「中身は鉄の粉」札 |
| 183 | tb5_tetsu_sabi | 【からくり図解①】虫めがねの中で鉄粉がO₂をパクッと食べてサビ色に | IronGrain, O2Dot, clipPath虫めがね | コマ送り(8フレームごとに1歩)でO₂が接近→パクッ→サビ色化 |
| 184 | tb5_hako_danmen | 【からくり図解②】密封箱の断面。小袋がO₂を吸い込み酸素メーターが減る | KashiBox断面, DatsusansoPack, O2Meter, CakeDome | O₂の粒が順に吸い込まれ、メーターが100%→減少 |
| 185 | tb5_kabi_sodatanai | 【からくり図解③】緑のシールド円の中の菓子は無事。カビと菌がしおれて✗ | CakeDome, CheckCircle, CrossMark, O2Meter(0%) | カビ・菌が傾いてフェードアウト、✗がpop |
| 186 | tb5_haginotsuki | 「仙台銘菓 萩の月」札+月+箱。小袋が弧を描いて箱へ飛び込む | KashiBox, DatsusansoPack, Stamp(1979年) | 小袋が放物線で飛来→Burst+チェック |
| 187 | tb5_calendar_nobiru | 約1日→約2週間。カレンダーが横にビヨーンと伸びる | 自作カレンダー, TagPlate | scaleXが0.085→1にpopで伸長、「ビヨーン」文字。※といわれる併記 |
| 188 | tb5_fuwafuwa_hakobu | トラックが菓子箱を載せて遠くの町へ走る | KashiBox, 自作トラック | トラックが画面を横断、車輪スポーク回転、道の破線が流れる |
| 189 | tb5_tabemono_chushin | 天秤。左=こけし+ペナント、右=菓子箱×2+まんじゅう。食べ物側へ傾く | KashiBox, Stamp(1970年代) | 天秤の腕がrotate 0→-9°、札は「たべもの」が赤 |
| 190 | tb5_shokuba_kubari | オフィスで1人が開けた箱から個包装が同僚3人へ飛ぶ | Person×4, KashiBox(open), MiniPacket | 個包装が時間差の弧を描いて飛ぶ |
| 191 | tb5_igai_to_saikin | 年表(千年前〜1970年代)。右端に「職場配り」の旗。「古来の伝統？」に✗ | TagPlate, CrossMark, Burst | 線が伸びる→旗がpop→✗。※とされる併記 |
| 192 | tb5_kansei | 箱(個包装入り)＋脱酸素剤＝「配れるお土産」。紙吹雪 | KashiBox, MiniPacket, DatsusansoPack, Stamp(完成) | ＋＝が順に出て、赤枠札がBurstと共にpop、紙吹雪が舞う |
| 193 | tb5_kessho_door | 結章扉「千年のからくり」。口実ルートの地図を添える | ChapterDoor(num=0), KoujitsuRoute | 題字が下からフェードイン、ルート上を旅人が進む |
| 194 | tb5_asobitai | 真ん中の人の本音ふきだし「遊びたい…」。周囲をチラッと見る | Person×3, Bubble | ふきだしpop、汗+「チラッ」 |
| 195 | tb5_koujitsu_loop | ループ図: 遊びたい→口実を発明→お土産＝言い訳 (円環) | LoopDiagram(自作) | 3枚の札が時間差pop、破線矢印が時計回りに行進 |
| 196 | tb5_ima_mo_tsuzuku | 左に小さなループ図→破線矢印→右に現代の旅行者 | LoopDiagram, ModernTraveler | 矢印が伸びて現代へ接続、「現代」札 |
| 197 | tb5_gendai_fuda3 | 3枚カード: ご褒美/リフレッシュ/推し活 (+アイコン) | Heart, 自作アイコン | カードが時間差popでゆらゆら、ペンライトが振れる |
| 198 | tb5_dekakeru_riyu | 現代の街で旅行者の頭上にひらめき電球 | GendaiBg, ModernTraveler, Burst | 電球がpop+黄色の放射線、「出かける理由」札 |
| 199 | tb5_gosenzo_onaji | 画面二分割: むかし(江戸の旅人)/いま(現代人+紙袋)。中央に大きな「＝」 | EdoTraveler, ModernTraveler, PaperBag | ＝がBurstと共にpop |
| 200 | tb5_houkokusho | 菓子箱＝報告書の書類。赤い「旅」の判子がドン | KashiBox, 自作書類 | 判子がscale1.8→1で押される |
| 201 | tb5_oishii_houkoku | 渡す人→受けとる人へ箱がすべって届き、ハート | Person×2, KashiBox, Heart | 箱が弧を描いてスライド、ハートが時間差pop |
| 202 | tb5_uriba_kazoeru | 売り場の棚の前で考え雲に同僚の顔が1人ずつ増える | MiyageShelf, Person, KashiBox | 顔アイコンがコマ送りで増加(〜6人)、「伝統行事」赤札 |
| 203 | tb5_mune_hatte | #202と同じ売り場。今度は胸を張って(lean=-6, smile)速くかぞえ切る | 同上 (SceneUriba proud) | 数え終わりにCheckCircle+Burst+ |
| 204 | tb5_yoi_tabi | 夕空の一本道を紙袋を提げた後ろ姿が歩いていく (文字なし・余韻) | PaperBag, 自作BackTraveler | 歩くたび脚が交互に動き、遠ざかって小さくなる。飛行機雲と鳥 |

## 備考
- #204 は自動付与の締め挨拶 (#205) にもそのまま流用できる余韻絵。
- 断定/ぼかしの線引き (factcheck 14番): エージレス1977年・萩の月1979年発売は断定OK。期限「約1日→約2週間」は絵に「※といわれる」、職場配り定着は「※とされる」を併記。
- 「脱酸素剤が萩の月を生んだ」とは描かず、「いち早く採用」の構図にしている。
