# 旅とお土産の歴史 ブロック2 絵コンテ (文#54〜#96・43文)

- 担当ファイル: `src/remotion/karakuri/TabiB2.tsx` (motif は `tb2_*`、WobbleDefs seed 500〜599)
- 第3章「江戸の大発明」= #54〜#75 / 第4章「お土産の誕生」= #76〜#96
- #78〜#87 の伊勢講の流れは、同じ寄り合いの舞台 (YoriaiStage: 障子+畳+行灯) の上で続き物として見せる (絵のブレ防止)
- 事実の扱い: 宮笥説は「有力とされる説」+「語源には諸説あり」表示 / 年収は「数か月分“とも”」/ 427万人は「文政13年」「当時の記録」「宮川の渡し」付きで提示 (当て字は断定可なのでそのまま)

| 文# | motif | 絵の説明 | 使った部品 | 動きの演出 |
|---|---|---|---|---|
| 54 | tb2_ch3_door | 東海道絵巻の上に第3章扉「江戸の大発明」 | KaidoScroll, ChapterDoor(num=3) | 絵巻が流れ続ける上に題字がふわっと浮上 (f12-42) |
| 55 | tb2_kaido_seibi | 整備された街道を行く旅人たちの絵巻 | KaidoScroll(speed=8), 見出し「街道の整備」 | 速めの横スクロールで「整った道」の勢い |
| 56 | tb2_sekisho_batsu | 関所の門前で旅人が止められ大きな✕ | KaidoBg, SekishoGate, EdoTraveler, Murabito, Batsu | 旅人が歩み寄り (f0-40) →門前で✕がポン (f42-62) |
| 57 | tb2_kousatsu_tatemae | 高札場を見上げる村人ふたり+「建前」印 | KaidoBg, Kousatsu, Murabito×2, Stamp | 高札へじわっとカメラ寄り (zoom1.08)、建前スタンプ |
| 58 | tb2_reigai_futatsu | 「例外①？」「例外②？」の大札が2枚 | KaidoBg, ？札×2, Murabito | 札が時間差でポンポン出現+上下ゆれ (bob) |
| 59 | tb2_omairi_touji | ？札がめくれて「お参り(鳥居)」「湯治(湯けむり)」に | ShinmeiTorii, 湯舟+湯けむり, Murabito | 2枚が時間差でpop、湯けむりはsinでゆらゆら |
| 60 | tb2_asobi_batsu | 「遊びに行きます！」と言う旅人に✕ | SekishoGate, EdoTraveler, Bubble, Batsu | 吹き出し (f8-28) →✕ (f48-66) で問答の間をつくる |
| 61 | tb2_ise_maru | 「お伊勢参りに行きます」+手形を見せて○ | SekishoGate, EdoTraveler, Bubble, TegataCard, Maru | 吹き出し→手形がすっと上がる→○、門番が笑顔に変化 |
| 62 | tb2_kotae | にやりと笑う旅人、思考の吹き出しに鳥居 | KaidoBg, EdoTraveler, ShinmeiTorii入り楕円 | カメラが旅人へ寄る (zoom1.1)、泡→吹き出しの順にpop |
| 63 | tb2_minna_ise | 鳥居へぞろぞろ向かう旅人4人の列 | KaidoBg, ShinmeiTorii, EdoTraveler×4, Burst | 列全体が右へ進む (f0-90で+60px)、鳥居にきらめき |
| 64 | tb2_senryu_intro | 無地の川柳木札が空からすとんと下りる | KaidoBg, 木札, Murabito×2 | 札が回転しながら落下 (f10-42)、村人が見上げて驚く |
| 65 | tb2_senryu | 【見せ場】縦書き3行の川柳大木札 | 660×700木札, 縦書き文字, Murabito, Burst | 1文字ずつ右の行から順にフェードイン、zoom1.07で寄る |
| 66 | tb2_tsuide | 大きな芝居幟+茶屋 vs 小さな鳥居の対比 | Shukuba(茶屋), 芝居幟, ShinmeiTorii, TagPlate | 「本命？」→「ついで」の順に札、点線矢印でつなぐ |
| 67 | tb2_hakujou | 川柳の短冊を前に笑う江戸の人たち | Murabito×2, 川柳短冊, Stamp「自分で白状」 | 「ハハッ」が時間差で3つ浮かぶ+ゆれ |
| 68 | tb2_mudan | 夜、奉公先からこっそり抜け出す人 | 夜の帯+月, Shukuba(奉公先), EdoTraveler | 旅人が右へすーっと移動 (f10-80)、「そーっ」が点々と |
| 69 | tb2_nukemairi | もぬけの布団と置き手紙「伊勢へ行ってきます」 | YoriaiStage, 布団, 置き手紙, TagPlate | 手紙がぽんと落ちて着地 (pop+落下)、「抜け参り」札 |
| 70 | tb2_otogame_nashi | 手紙を読む主人「なら仕方ない」+○ | YoriaiStage, Murabito, 手紙, Bubble, Maru | 吹き出し (f30-50) →○ (f56-74) →「おとがめなし」札 |
| 71 | tb2_segyou | 沿道の人がおにぎりのお盆を差し出す | KaidoBg, Shukuba(宿), EdoTraveler, Murabito, お盆 | お盆がbobでゆれ、「タダ飯」「タダ宿」札が時間差pop |
| 72 | tb2_kami_bachi | 抽象的な神様の光と稲妻、恐縮する人 | 光輪 (回転放射), 稲妻, Murabito, EdoTraveler | 光がpulse (sin) +放射線が回転、稲妻がチカチカ明滅 |
| 73 | tb2_427man | 【見せ場】宮川の渡し+回転カウンタ「427万人/3か月」 | 川+渡し舟, EdoTraveler×7行列, カウンタ, Stamp文政13年 | 数字が0→427万へ回る (f14-84)、舟がゆらゆら漂う |
| 74 | tb2_kiroku | 帳面に「正」の字を刻む役人の手元 | 大帳面「宮川の渡し」, 筆, Murabito | 「正」が1つずつ増える (12個)、筆が書くたび動く、zoom寄り |
| 75 | tb2_nana_hitori | 人型7体、4体目だけ色づき笠をかぶる | 人型ピクトグラム×7, Burst, TagPlate | 7体が順にpop→f50で1体だけオレンジに点灯+拡大 |
| 76 | tb2_ch4_door | 第4章扉「お土産の誕生」+逆さ財布から銭が飛ぶ | ChapterDoor(num=4), EdoTraveler, 財布, Zeni×5 | 銭が放物線でこぼれ続ける、「大出費…」札 |
| 77 | tb2_nenshu | 銭の山 vs ふだんの小さな財布の対比 | YoriaiStage, Zeni×18, 財布, Murabito | 銭の山が下から段々せり上がる (f14-70) |
| 78 | tb2_sugoi_shikumi | 寄り合いの3人の真ん中に大きな「！」 | YoriaiStage, Murabito×3, Burst, ！ | ひらめきの放射+「！」がf30-50でパッと出る |
| 79 | tb2_isekou_fuda | 同じ寄り合いに黄色い大札「伊勢講」がどん | YoriaiStage, Murabito×2, 大札, Burst | 大札がpopでどん→きらめき。#78と同じ舞台で続き物 |
| 80 | tb2_tsumitate | 3人の銭が弧を描いて講の帳場箱へ飛び込む | YoriaiStage, Murabito×3, KouChoubou, Zeni | 銭が3方向から放物線でループ投入 (80f周期) |
| 81 | tb2_kuji | くじ筒から1本だけ赤く光って抜ける | YoriaiStage, くじ筒+棒5本, Burst, TagPlate | 真ん中の1本が赤く変わり上へ抜ける (f40-66)、「当」の字 |
| 82 | tb2_senbetsu | 村人4人ののし包みが代表に集まる | YoriaiStage, EdoTraveler, Murabito×4, SenbetsuPack×4 | 包みが4方向から時間差の放物線で代表の手元へ |
| 83 | tb2_warikan | 図解「餞別 = 銭+銭+銭」 | YoriaiStage, SenbetsuPack, Zeni×3+顔 | 左から順に「=」「+」で式が組み上がる、「正体は割り勘」札 |
| 84 | tb2_tebura | 空っぽの両手に✕、頭に村のみんなが浮かぶ | KaidoBg, ShinmeiTorii, EdoTraveler, Batsu, 思い浮かべ楕円 | 手→✕→村人の顔ぶれの順、カメラが旅人へ寄る |
| 85 | tb2_ofuda_mochikaeri | 鳥居を背にお札の扇をかかえて帰る代表 | KaidoBg, ShinmeiTorii, EdoTraveler, OfudaTag×5 | お札が1枚ずつ扇形にpopで開く (f14-64) |
| 86 | tb2_haitou | 代表からお札が村人4人へ放射状に配られる+「配当」印 | YoriaiStage, EdoTraveler, Murabito×4, OfudaTag, Stamp | お札4枚が時間差の放物線で四方へ飛ぶ |
| 87 | tb2_anmoku | 全員がお札を掲げてうなずく | YoriaiStage, Murabito×4, OfudaTag×4 | お札が順にpopで掲がる+bobで同期ゆれ、「暗黙の決まり」札 |
| 88 | tb2_miyake | 鳥居の下の神様の器 (宮笥) にお札 | ShinmeiTorii, 木の器, OfudaTag, TagPlate×3 | 器がpop→お札がふわっと→「宮笥」「＝神様の器」「有力とされる説」の順。見出し「語源には諸説あり」 |
| 89 | tb2_ateji | 「みやげ」の横に「土産」が赤いはんこで押される | 白板, 赤枠はんこ, Burst, TagPlate | はんこが大→小に押し込まれる (scale1.7→1)、どんと着印 |
| 90 | tb2_shoukohin | まんじゅう✕ / 神様のお札○ の対比 | まんじゅう盆, OfudaTag, Batsu, Maru | 左→右の順にpop、✕→○で判定が入る |
| 91 | tb2_kage_shuyaku | 暗がりのスポットライトに黒い人影+「？」 | 夜幕, スポットライト, 黒シルエット | 光の筋が開いていく (f14-40)、「？」が後から点灯 |
| 92 | tb2_onshi | 光が晴れて御師が登場「御師（おんし）」 | KaidoBg, ShinmeiTorii, Shukuba(御師), OnshiPerson, Burst | 御師がscale0.8→1でせり出し+きらめき+名前札 |
| 93 | tb2_onshi_four | 御師のまわりに4役 (宿・道案内・祈祷・お土産) の丸カード | OnshiPerson, 丸カード×4 (家・道しるべ・御幣・お札) | 4枚が時間差でポンポンpop+bob、「ぜんぶやる」札 |
| 94 | tb2_hitori_sanyaku | 「旅行代理店」「ホテル」「営業マン」3札が御師に集まる | OnshiPerson, TagPlate×3, Stamp「ひとりで兼任」 | 3札が上から御師へ吸い寄せられ点線でつながる |
| 95 | tb2_koujitsu_iiwake | 「出かける口実 (鳥居)」「帰りの言い訳 (お札)」2枚のカード | 大カード×2, ShinmeiTorii, OfudaTag | 左→右の順にpop+bob (このブロックの主題の図解) |
| 96 | tb2_set_kansei | 2枚のカードが寄って水引の結び目「講×御師」で結ばれる | 大カード×2, 水引メダル, Stamp「セットで完成」 | カードが互いに寄る (f10-44) →結び目がpop (f44-64) |
