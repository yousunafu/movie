# 旅とお土産の歴史 ブロック1 絵コンテ (文#1〜#53)

実装: `src/remotion/karakuri/TabiB1.tsx` / seed 400〜451 / 全シーン TBadge + wobble + Atmosphere つき。

| 文# | motif | 絵の説明 | 使った部品 | 動きの演出 |
|---|---|---|---|---|
| 1 | tb1_uriba_katamaru | お土産売り場で箱を手に固まる人 | GendaiBg, MiyageShelf×2, ModernTraveler, KashiBox | 旅人が横からスッと入場、箱が手元でbob同期 |
| 2 | tb1_watashi_desu | 同じ売り場にカメラがグッと寄る | 同上 (UribaStage共用) | zoomAtで1→1.55倍、赤矢印がポン |
| 3 | tb1_okashi_janai | 吹き出しの中のお菓子に赤バツ | UribaStage, Bubble, Tsutsumi, CrossMark | 吹き出しpop→お菓子→バツの順で出現 |
| 4 | tb1_shokuba_ninzu | 頭上に職場の12人が並んでいく | UribaStage, MiniHead×12 | 1人ずつpop+「N人」カウンタが連動 |
| 5 | tb1_12vs18 | 12人の列と18個の包みの比較 | MiniHead, Tsutsumi | 包みが順に出て余り6個が赤くなる+「6個 あまる…」 |
| 6 | tb1_tanomarete_nai | 点線の幽霊上司と「たのむね」に赤バツ | UribaStage, Bubble, CrossMark | 幽霊がふわっと出て即バツ |
| 7 | tb1_mou_hitotsu | カード①お菓子箱 / ②はてな | KashiBox, QMark | ①→②が間をおいてpop |
| 8 | tb1_tsukareta_kara | 会社から逃げ出す旅人と言い訳の吹き出し | 会社ビル(自作), ModernTraveler, Bubble | 旅人が会社から右へ駆ける |
| 9 | tb1_koujitsu_iiwake | 道しるべ「ゆき: 口実 / かえり: 言い訳」 | 道標(自作), PaperBag | 2枚の板が順にpop、荷物bob |
| 10 | tb1_sennen_shikumi | 年表1000年前→いま+かみ合う歯車 | Gear×2, 年表(自作) | 歯車が逆回転でかみ合う |
| 11 | tb1_naze_yasumu | ベンチと「理由書」の書類+? | ベンチ(自作), 書類, QMark | 書類がすべり込み、?がゆらゆら |
| 12 | tb1_naze_kimazui | 手ぶらの自分と同僚、点線の紙袋 | ModernTraveler, Person, PaperBag(点線) | 気まずさの線がもやもや伸びる |
| 13 | tb1_ippon_tsunagaru | 時計20分+4つの題材が赤い糸で結ばれる | 時計(自作), アイコン4種 | 赤糸がdraw-onで結び目へ |
| 14 | tb1_kazoeru_suki | 数える自分にハートが浮かぶ | UribaStage, ハート | ハートがぽんぽん浮上 |
| 15 | tb1_sennen_michi | いまから千年前へ続く一本道 | ScallopShell, ShinmeiTorii, RomanTemple | 道がdraw-on、道標が奥から順にpop |
| 16 | tb1_ch1_door | 章扉: 古代ローマ (神殿+月桂冠の貴族) | RomaBg, RomanTemple, TogaPerson, ChapterDoor | 神殿が沈み込み入場、扉札→「2000年前」スタンプ |
| 17 | tb1_baiae | 道しるべ「バイアエ」へ歩く貴族2人 | RomaBg, TogaPerson×2, 道標 | 貴族がlerpで右へ歩く |
| 18 | tb1_onsen_utage | 大理石の湯+杯+海辺の別荘の3点 | RomaBg, WineCup, Burst | 3要素が時間差pop、湯気ゆらゆら |
| 19 | tb1_kanraku_machi | 夜の歓楽街、灯りと♪ | RomaBg+夜幕, TogaPerson×2 | 灯り明滅、♪が昇る |
| 20 | tb1_mukashi_kara | 年表: トガ+杯 ⇔ 現代旅行者 | TogaPerson, ModernTraveler, CheckMark | 緑の弧がdraw-on→チェック |
| 21 | tb1_mibun_dake | 台座の貴族○ / 縄の外の庶民✗ | TogaPerson, Shomin, ロープ | ○✗が順にpop |
| 22 | tb1_shomin_idou | 荷を負う庶民+仕事/逃亡/戦争カード | Shomin, カード3枚 | カードが順に落ちてくる |
| 23 | tb1_travel_travail | travel=travailの語源カード | カード2枚+「=」 | 「※とされる」の札で断定回避 |
| 24 | tb1_goumon_setsu | さかのぼると黒い拷問具カード | カード, 杭3本 | 矢印が左へ伸びて黒カードpop、「という説まで」 |
| 25 | tb1_michi_kiken | 暗い道、まばらな宿、飛び出す山賊 | 道, 宿, 覆面山賊, Burst | 山賊が岩陰からバッ |
| 26 | tb1_inochigake | 果てなき上り坂を杖で登る庶民 | Shomin, 太陽, 足あと | 太陽の光条回転、汗ぽたぽた |
| 27 | tb1_dou_suru | 崖の上から遠い神殿を見る庶民+? | Shomin, RomanTemple(遠景), QMark | 神殿がほんのり光る |
| 28 | tb1_tatta_hitotsu | スポットライトに降りてくる「口実」札 | スポット光, TagPlate, Burst | 札が上から降下、庶民が驚く |
| 29 | tb1_kamisama_aini | 光差す空に祈る庶民+神様の図記号 | 光条, Shomin, Bubble | 吹き出しに太陽記号 (台詞重複を回避) |
| 30 | tb1_junrei_tabi | 巡礼路を歩く欧州巡礼者+「巡礼」札 | CaminoBg, EuroPilgrim, ScallopShell | 巡礼者が歩き、札がドンとpop |
| 31 | tb1_tomerarenai | 関所の棒が上がり巡礼者が通る | 関所(自作), EuroPilgrim, CheckMark | 棒が-64°回転、巡礼者lerp通過 |
| 32 | tb1_aite_kamisama | 巨大な光輪を見上げる巡礼者と門番 | 光輪(自作), EuroPilgrim, Person | 光条が回転、ふたり見上げ |
| 33 | tb1_koujitsu_route1 | 口実路線図 第1駅「しんこう」 | KoujitsuRoute(count=1), Burst | 路線図起動+開業のBurst |
| 34 | tb1_ch2_door | 章扉: 熊野の山+王子社+浄衣の参詣者 | KumanoBg, OjiShrine, HeianPilgrim, ChapterDoor | 社が沈み込み入場、扉札スライド |
| 35 | tb1_kumano_boom | 山道をぞろぞろ歩く参詣者3人 | KumanoBg, HeianPilgrim×3, Stamp | 3人がlerpで行進、「平安末」スタンプ |
| 36 | tb1_goshirakawa_34 | 後白河法皇と「34回」カウンタ | HeianPilgrim, カード, 数え棒 | 0→34へカウントアップ+数え棒34本、「とされる」併記 |
| 37 | tb1_oufuku_1kagetsu | 京都→熊野のジグザグ行程+30マスの暦 | KumanoBg, TagPlate, 暦(自作) | 行程線draw-on+現在地の点が進む+暦が埋まる |
| 38 | tb1_tatemae_shugyou | 滝と社の前で祈る参詣者 | KumanoBg, OjiShrine, 滝(自作) | 滝の水流が流れ落ちる、汗 |
| 39 | tb1_yado_utakai | 夜の宿で短冊を掲げる歌会 | KumanoBg+夜幕, 宿(自作), HeianPilgrim×2 | 窓明かり明滅、短冊ゆれ、♪上昇 |
| 40 | tb1_teika_nikki | 文机で巻物に筆を走らせる定家 | KumanoBg, 文机+巻物(自作), HeianPilgrim | 巻物がするする開く、筆が揺れる |
| 41 | tb1_guchi_nijimu | 開いた巻物に愚痴の文字と墨のにじみ | 巻物(自作), HeianPilgrim | 文字2つが順に浮かび、墨染みがじわっと育つ |
| 42 | tb1_ningen_rashii | 建前とホンネの天びん | 天びん(自作), HeianPilgrim | ホンネ側へゆっくり傾く |
| 43 | tb1_globe_hantai | 地球儀: 日本→サンティアゴ | GlobeTravel (TabiTravel) | 地球回転+弧の移動 (部品任せ) |
| 44 | tb1_santiago | 大聖堂へカメラが寄る | CaminoBg, zoomAt | 1→1.5倍ズーム+鐘の音の弧 |
| 45 | tb1_junreisha_atsumaru | 左右から巡礼者4人が収束 | CaminoBg, EuroPilgrim×4 | 全員lerpで中央へ、収束矢印draw-on |
| 46 | tb1_aru_mono | 露店の布をかぶせた謎の山+? | 露店(自作), Person, EuroPilgrim, QMark | 布がもぞもぞ揺れる |
| 47 | tb1_hotate_reveal | 布が飛んでホタテバッジがドン | ScallopShell(metal), Burst | 布が回転しながら飛び、バッジpop+きらり |
| 48 | tb1_igata_ryousan | 鋳型からバッジが飛び出して山になる | BadgeMold, ScallopShell×6, EuroPilgrim×2 | 鋳型が開き、弧を描いて6個飛ぶ、コインpop |
| 49 | tb1_mune_no_shouko | 胸のバッジが光る帰路の巡礼者 | EuroPilgrim, ScallopShell, 家(遠景) | バッジ光が脈動、故郷への点線draw-on |
| 50 | tb1_ryousan_miyage | 台座の上のバッジ+認定スタンプ | 台座(自作), ScallopShell, Stamp | 光輪回転→「観光みやげ 第1号」スタンプ |
| 51 | tb1_koujitsu_shouko | 口実(行き)/証拠(帰り)の対カード | カード2枚, ScallopShell, QMark | 左→右の順でpop、矢印は互い違い |
| 52 | tb1_tabi_miyage_set | 「旅」「お土産」カードが寄ってリボン | カード2枚, ScallopShell, リボン(自作) | 2枚がlerpで接近→リボンpop+Burst |
| 53 | tb1_tsugi_no_kuni | 海を渡る帆船と鳥居の島+? | SailShip, ShinmeiTorii, QMark | 船が右へ進み、島がpop、波ゆらゆら |

## 注意メモ
- 断定回避: #23「とされる」/#24「という説まで」/#36「とされる」を絵の中にも明記。
- 地図は描かない (#43 は GlobeTravel 部品、#37 は地図でなく抽象ジグザグ線)。
- 章題は ChapterDoor のみ (#16, #34)。
- 1つの舞台の使い回し: #1〜#6 UribaStage、庶民は Shomin ヘルパーで統一。
