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
