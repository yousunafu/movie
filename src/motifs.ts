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
] as const;

export const MANABI_OBJECT_MOTIFS = [
  "doorknob", // 金属のドアノブ
  "wood", // 木の板・木目
  "thermometer", // 温度計2本の比較 (同じ温度を示す)
  "hand", // 手のクローズアップ (体温・感覚)
  "question", // 丸の中の大きな「?」 (問いかけ)
  "future_fossil", // ペットボトルと鶏の骨 (未来の化石候補)
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
  "concept", // その他の図解
] as const;

export const MANABI_LOCATION_MOTIFS = [
  "bathroom", // 風呂場 (タイルと木の椅子)
  "room", // 部屋の全景
  "city", // 都市のスカイライン。人のピクトグラムがふっと消える
  "ruin", // ビルが緑のツタと雨に飲み込まれる (廃墟)
  "moon_footprint", // 月面に残る足跡と星空 (静かな演出)
] as const;

export const ALL_MANABI_MOTIFS = [
  ...MANABI_PERSON_MOTIFS,
  ...MANABI_OBJECT_MOTIFS,
  ...MANABI_DIAGRAM_MOTIFS,
  ...MANABI_LOCATION_MOTIFS,
  "chapter", // 章扉カード (「第1章」+ 章タイトル。type は card で使う)
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
