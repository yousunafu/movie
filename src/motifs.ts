// 絵づけAIが選べる題材の一覧。Remotion側はこの名前で絵を描き分ける。
export const PERSON_MOTIFS = [
  "cooking", // 台所で料理
  "eating", // 食卓で食事
  "shopping", // 買い物
  "thinking", // 考え込む・悩む
  "happy", // 明るい表情・元気
  "worried", // 不安・体調の心配
  "walking", // 散歩・運動
  "doctor", // 医師・診察
  "talking", // 語りかけ・説明
  "frail", // 衰えた姿 (杖・前かがみ)
  "compare", // 元気な姿と衰えた姿の対比 (筋肉が減る・老化が進む等)
] as const;

export const OBJECT_MOTIFS = [
  "vegetables",
  "fish",
  "meat",
  "rice",
  "bread",
  "milk",
  "egg",
  "fruit",
  "tea",
  "water",
  "natto",
  "tofu",
  "snack",
  "salt",
  "oil",
  "supplement",
  "hiyayakko", // 冷奴
  "meal", // 一汁三菜の食事トレー (献立・食事例)
  "protein", // 肉・魚・卵・豆腐の盛り合わせ (たんぱく質全般の文に)
] as const;

export const LOCATION_MOTIFS = [
  "supermarket",
  "kitchen",
  "home",
  "park",
] as const;

export const ALL_MOTIFS = [
  ...PERSON_MOTIFS,
  ...OBJECT_MOTIFS,
  ...LOCATION_MOTIFS,
  "body", // 図解用: 体のシルエット
  "ending",
] as const;

// ===== ashi (夜の教養エッセイ) 用の題材 =====
export const ASHI_PERSON_MOTIFS = [
  "thinking", // 机で考え込むシルエット
  "window", // 窓辺で月を眺める
  "walking", // 夜道をひとり歩く
  "queue", // 行列に並ぶ人々
  "crowd", // 群衆・通行人
  "reading", // 本を読む
  "phone", // スマホの光に照らされる
  "talking", // ランプの下で語る (既定)
] as const;

export const ASHI_OBJECT_MOTIFS = [
  "book", // 本 (知識・思想)
  "clock", // 時計 (時間)
  "moon", // 月 (夜・孤独)
  "scale", // 天秤 (判断・比較)
  "lightbulb", // 電球 (気づき)
  "hourglass", // 砂時計 (有限さ)
  "mask", // 仮面 (本音と建前)
  "coffee", // コーヒー (夜の時間)
] as const;

export const ASHI_LOCATION_MOTIFS = [
  "room", // 間接照明の部屋・本棚
  "city", // 夜の街並み
  "street", // 夜の通り・街灯
] as const;

export const ALL_ASHI_MOTIFS = [
  ...ASHI_PERSON_MOTIFS,
  ...ASHI_OBJECT_MOTIFS,
  ...ASHI_LOCATION_MOTIFS,
  "concept", // 図解用: 抽象概念
  "ending",
] as const;

// ===== manabi (身近な科学の図解解説) 用 =====
export const MANABI_PERSON_MOTIFS = [
  "touch_metal", // 金属のドアノブに手が触れてヒヤッとする
  "touch_wood", // 木の棚・板に手が触れる (冷たくない)
  "thinking", // 疑問に思う人 (?マーク)
  "surprised", // ハッと気づく人 (!マーク)。意外な事実・なんと・実は の文に
  "nodding", // 納得してうなずく人 (チェックマーク)。まとめ・だから・つまり の文に
  "sleeping", // 夜、ベッドで眠る人。月と星の静かな絵
] as const;

export const MANABI_OBJECT_MOTIFS = [
  "doorknob", // 金属のドアノブ
  "wood", // 木の板・木目
  "thermometer", // 温度計2本の比較 (同じ温度を示す)
  "hand", // 手のクローズアップ (体温・感覚)
  "question", // 丸の中の大きな「?」 (問いかけ)
  "future_fossil", // ペットボトルと鶏の骨 (未来の化石候補)
  "rem_eye", // 閉じたまぶたの下で目玉が左右に動く (レム睡眠)
  "alarm_clock", // 目覚まし時計 (朝・目覚め・時刻)
  "lightbulb", // 電球が灯る (発見・新しい研究・ひらめき)
  "house_loan", // 家と値札 (ローン・家計・たとえ話)
] as const;

export const MANABI_DIAGRAM_MOTIFS = [
  "heatflow", // 断面図: 熱が矢印で移動していく
  "molecules", // 粒 (分子) が熱を順に伝えていく
  "graph", // 折れ線グラフ (変化・上がる下がる)
  "decay", // 鉄が錆び、コンクリートが砂に崩れる (風化)
  "dinosaur", // 恐竜の骨格が左から順に描かれる
  "fossilize", // 左=地表で朽ちる骨 / 右=泥に埋まって残る骨 の対比図
  "strata", // 地層の断面。人類の時代は細いオレンジ1本の線
  "flood", // 都市の断面図。地下鉄のトンネルに水位が上がっていく (水没)
  "trash_layer", // ゴミ処分場の断面 = 未来の遺跡。埋まった人工物をオレンジでハイライト
  "timeline", // 数十年→数百年→数千年→1万年の年表。左から目盛りが伸びる
  "sleep_wave", // 一晩の眠りの深さの波 (レム/ノンレムの90分周期グラフ)
  "dream_brain", // 脳の側面図。視覚野・扁桃体がオレンジに灯り、前頭前野だけ消灯
  "body_lock", // 眠る体の図。脳からの指令線が脳幹でせき止められる (安全装置)
  "memory_transfer", // 海馬 (一時保管庫)→大脳皮質 (長期保管庫) へ記憶が移る図
  "pruning", // 神経のつながりの剪定。大事な線は太く、不要な線は消える
  "brain_wash", // 脳の洗浄。脳脊髄液が細胞のすき間を流れ老廃物を洗い流す
  "life_pie", // 人生の円グラフ。3分の1がオレンジに塗られる (眠りの時間)
  "roadmap", // 目次の図。章の箱が横に並び順に点灯 (今日の流れ)
  "energy_meter", // バー2本の比較メーター (ほぼ同じ高さ。活動量・消費量の比較)
  "info_flood", // 頭のシルエットに情報の矢印が次々と降り注ぐ (情報の洪水)
  "bar_compare", // 2グループの棒グラフ対比 (実験結果・成績比較。勝者がオレンジ)
  "messy_desk", // 机に書類が積み上がっていく (散らかる・たまる)
  "brain_repair", // 脳とレンチ (修理・メンテナンス)
  "concept", // その他の図解
] as const;

export const MANABI_LOCATION_MOTIFS = [
  "bathroom", // 風呂場 (タイルと木の椅子)
  "room", // 部屋の全景
  "city", // 都市のスカイライン。人のピクトグラムがふっと消える
  "ruin", // ビルが緑のツタと雨に飲み込まれる (廃墟)
  "moon_footprint", // 月面に残る足跡と星空 (静かな演出)
  "night_office", // 夜のビル群に窓明かりがぽつぽつ灯る (夜勤・夜の仕事)
  "sunrise", // 朝日が昇る地平線 (朝・目覚め・明日)
] as const;

export const ALL_MANABI_MOTIFS = [
  ...MANABI_PERSON_MOTIFS,
  ...MANABI_OBJECT_MOTIFS,
  ...MANABI_DIAGRAM_MOTIFS,
  ...MANABI_LOCATION_MOTIFS,
  "chapter", // 章扉カード (「第1章」+ 章タイトル。type は card で使う)
  "quiz", // クイズ出題カード (小さなQ+出題文。控えめな演出。type は card で使う)
  "ending",
] as const;

// ===== rekishi (歴史・深い時間の資料図版) 用 =====
export const REKISHI_MOTIFS = [
  "city", // 廃墟になっていく都市の遠景
  "ruin", // ツタに覆われるビル
  "decay", // 錆と砂に埋もれる物 (歯車・鉄骨)
  "dinosaur", // 恐竜骨格の博物図版
  "fossilize", // 埋没→地層→化石化の図解
  "strata", // 地層の断面と薄い一枚の錆朱の線
  "future_fossil", // ペットボトルと鶏の骨の標本図版
  "moon_footprint", // 月面に残る足跡
  "question", // 大きな「?」の図版 (問いかけ)
  "concept", // その他の図版 (砂時計 = 時の流れ)
] as const;

export const ALL_REKISHI_MOTIFS = [...REKISHI_MOTIFS, "ending"] as const;

// ===== kouzou (仕事・組織の構造の図解) 用 =====
export const KOUZOU_MOTIFS = [
  "meeting", // 会議室: テーブルと人のピクトグラム。吹き出しが増えていく
  "structure", // 箱3つの分岐図。該当の箱が青緑で順に点灯
  "mix", // 性質の違う仕事 (報告・議論・決定) が1つの枠に押し込まれる図
  "no_end", // 「終わりの条件」のチェックボックスに×。時間の線が右へ伸び続ける
  "silence", // 沈黙→不安→発言の連鎖。人型から吹き出しが連鎖する矢印図
  "anchor", // 時間の錨: 60分のバー。30分で結論が出ても60分まで埋まる
  "law", // パーキンソンの法則: 枠=与えられた時間、中身が枠いっぱいに膨らむ
  "concept", // その他の構造図 (つながりのネットワーク図)
] as const;

export const ALL_KOUZOU_MOTIFS = [...KOUZOU_MOTIFS, "ending"] as const;

// ===== suuri (数理・統計で身近な疑問を解く図解) 用の題材 =====
// 真っ黒背景・白ピクトグラム・赤1色の強調。系図・ネットワーク図が主役。
export const SUURI_PERSON_MOTIFS = [
  "thinking", // 疑問に思う人 (?マーク)
  "surprised", // ハッと気づく人 (!マーク)。意外な事実・なんと・実は の文に
  "nodding", // 納得してうなずく人 (チェックマーク)。まとめ・だから・つまり の文に
  "unknown_farmer", // 名もなき農民・漁師のピクトグラム (名前が残らない人々)
  "multiply_imagine", // 吹き出しに赤い×記号。掛け算と想像力で考える人
  "thanks", // 先祖に向かって深くおじぎする人 (感謝の文に)
  "wait_stop", // 手のひらを突き出して制止する人 (お待ちください、の文に)
] as const;

export const SUURI_OBJECT_MOTIFS = [
  "question", // 丸の中の大きな「?」 (問いかけ)
  "lottery", // 当たりくじ (絶滅の心配がない別格の家系)
  "scroll", // 家系図の巻物 (系図・家系図ビジネス・創作系図)
  "nengajo", // 年賀状のはがき (締めの乾いた一言)
  "tally", // 「正」の字で数を数える (数字で確かめる文に)
  "ordinary_house", // 普通の家と家族 (代々普通の家系、の文に)
  "kakeizu_business", // 「家系図お作りします」の看板と巻物 (家系図の商売の文に)
] as const;

export const SUURI_DIAGRAM_MOTIFS = [
  "doubling_tree", // あなたから上へ倍々に枝分かれする先祖の系図 (2人→4人→8人)
  "exp_curve", // 指数関数の急上昇カーブ (席の数が爆発的に増える)
  "school", // 校舎と生徒の点グリッド (1,024人=全校生徒のたとえ)
  "city_pop", // 都市のスカイラインと人の点 (105万人=仙台市のたとえ)
  "globe_pop", // 地球と人口の比較 (先祖の席10億 vs 当時の総人口3億)
  "seat_share", // 1人のピクトが複数の席に線でつながる (平均140席の掛け持ち)
  "net_merge", // きれいな木が途中から枝がくっつき網になる (家系の収束)
  "hatoko", // はとこ夫婦の系図。共通の曽祖父母が2か所で赤く灯る
  "japan_net", // 日本列島が家系の網で覆われる (日本人全体がひとつの親戚)
  "michinaga", // 藤原道長の人物図 (束帯・烏帽子・扇)
  "three_points", // ポイント3つの箱が順に点灯 (なぜ道長か)
  "descend_tree", // 道長から下へ倍々に広がる子孫の系図
  "extinct_line", // 家系の線が途中で×印とともに途切れる (断絶)
  "crown", // 3つの后の冠と天皇 (一家三后・孫から天皇)
  "path_count", // あなた→道長へ無数の赤い経路が同時に走る網
  "dna_half", // DNAのバーが半分→4分の1→…とほぼ0%まで薄まる
  "chain_lights", // 千年の命のリレー。光の鎖が途切れず現代まで届く
  "roadmap", // 章の箱が横に並び順に点灯 (今日の流れ)
  "math_talk", // 黒板風の枠に×÷√=%の記号 (数学の話・計算の文に)
  "parents", // あなた+父と母の3人の系図 (親2人の文に)
  "number_ladder", // 倍々に伸びる棒グラフ (4人→8人→16人と数字が増える文に)
  "timeline", // 現代→江戸→戦国→平安の時間の矢印 (時代をさかのぼる文に)
  "japan_pop", // 日本列島と人口の点 (当時の日本の人口の文に)
  "hierarchy_top", // 人のピラミッドの頂点が赤く灯る (最高権力者の文に)
  "neighbor_merge", // あなたの家と隣の家の系図が上でひとつに合流する図
  "child_grandchild", // 子3人→孫9人と文中の人数どおりに増える図
  "swallow_japan", // 日本列島を子孫の赤い円が飲み込む図
  "twelve_children", // 道長の下に12人の子が並ぶ図
  "emperor_grandsons", // 道長→娘→孫の2人の天皇 (後一条・後朱雀) の系図
  "spread_samurai", // 貴族から武家へ血筋が流れ込む図
  "you_here", // 光の鎖のいちばん先に立つあなた (奇跡の積み重ねの文に)
  "concept", // その他の図解
] as const;

export const SUURI_LOCATION_MOTIFS = [
  "village", // 昔の村の全景 (藁ぶき屋根と田畑)
] as const;

// 37%ルール (回転寿司×結婚) 回の題材。寿司の絵は和紙背景モードで描かれる
export const SUURI_SUSHI_MOTIFS = [
  "sushi_lane", // 回転寿司のレーンと流れる皿 (お店の紹介・レーンの前に座る)
  "one_plate", // 取れるのは一生に1皿だけ、のルール図 (1皿だけ赤く灯る)
  "no_return", // 見送った皿は戻らない (戻る矢印に赤い×)。お断りした人・気まずい にも
  "otoro", // 輝く大トロの皿 (目標・まだ見ぬ大トロ・70皿目の大トロ)
  "maguro", // 1皿目のマグロ (取りますか?と手が伸びる)
  "pass_all", // 全部見送る (×付きの皿の列・最後の1皿のサスペンス)
  "gari", // ガリの皿 (ガリでした・ガリと添い遂げる)
  "regret_balance", // 天秤: 早く取る後悔 vs 待ちすぎる後悔
  "marriage_math", // 寿司の皿と人が対応する図 (結婚相手選びとそっくり・一人ずつ)
  "lookonly", // 見るだけタイム (皿を見つめる目・絶対に取らない)
  "monosashi", // ものさしが育つ図 (店のレベルのものさし。甘い→完璧→もう伸びない)
  "grab_best", // 過去最高ラインを超えた皿に即、手を伸ばす図
  "cutoff_line", // 0〜100皿の帯と区切り線 (短すぎ×・長すぎ×・ちょうどいいは?)
  "chutoro_trap", // ニセモノの中トロに飛びつく罠 (かみしめながら大トロを見送る)
  "otoro_lost", // 大トロが最初の70皿に混ざる確率70% (空のレーン)
  "plus_one", // 見るだけを1皿延ばすと? (+1の皿)
  "gain_fade", // ものさしの効き目がだんだん減る図 (最初はぐんぐん→ほぼ横ばい)
  "cost_vs_gain", // 払うもの1%一定 vs もらえるもの減少の交差 (分かれ目=37%)
  "success_mountain", // 成功率の山のグラフ (10皿23%→37皿37.1%が頂上→下り)
  "euler_e", // 数学の有名人 e=2.718 (1÷e=0.368・レーンの裏の大スター)
  "yamakan", // ヤマ勘1% vs 作戦あり37% (37倍)
  "age_timeline", // 20歳〜40歳の年齢軸と27歳の赤い印
  "human_not_sushi", // 人は寿司ではない (皿と人の間に≠)
  "many_sides", // 人の魅力は多面的 (優しいが朝弱い・頼れるが歌いすぎ)
  "person_flees", // 寿司は逃げないが人は逃げる (走り去る人)
  "apply_anywhere", // 家探し・就職・中古車・レストランにも使える図
] as const;

// 「絵が育つ」題材: 連続しても variant で絵が変わるので、連続散らしの対象外にする
export const SUURI_GROW_MOTIFS: readonly string[] = [
  "sushi_lane",
  "no_return",
  "otoro",
  "maguro",
  "pass_all",
  "gari",
  "marriage_math",
  "lookonly",
  "monosashi",
  "grab_best",
  "cutoff_line",
  "chutoro_trap",
  "otoro_lost",
  "plus_one",
  "gain_fade",
  "cost_vs_gain",
  "success_mountain",
  "euler_e",
  "yamakan",
  "age_timeline",
  "human_not_sushi",
  "many_sides",
  "apply_anywhere",
  "one_plate",
];

export const ALL_SUURI_MOTIFS = [
  ...SUURI_PERSON_MOTIFS,
  ...SUURI_OBJECT_MOTIFS,
  ...SUURI_DIAGRAM_MOTIFS,
  ...SUURI_LOCATION_MOTIFS,
  ...SUURI_SUSHI_MOTIFS,
  "chapter", // 章扉カード (「第1章」+ 章タイトル。type は card で使う)
  "quiz", // クイズ出題カード (小さなQ+出題文。type は card で使う)
  "ending",
] as const;

// ===== keizai (経済ニュース解説・フリップボード) 用の題材 =====
export const KEIZAI_MOTIFS = [
  "news", // ニュース速報風の見出しテロップ (導入)
  "exchange", // 両替の図: 1ドル=100円→150円 (円とドル、数字カウントアップ)
  "import_japan", // 日本地図の簡略形+外から入る矢印+「食料 約6割」などの赤バーフリップ
  "cost_chain", // 仕入れ値→企業→価格転嫁の矢印チェーン (フリップが順に点灯)
  "ripple", // 小麦→パン、原油→電気代・輸送費の分岐図
  "transport", // トラックのピクト+あらゆる値札に輸送費が含まれる図
  "price_up", // 値札の数字が上がるアニメ
  "balance", // 天秤: 左に痛み・右に恩恵 (輸出企業は追い風)
  "concept", // その他 (白フリップ+キーワードの汎用)
] as const;

export const ALL_KEIZAI_MOTIFS = [...KEIZAI_MOTIFS, "ending"] as const;
