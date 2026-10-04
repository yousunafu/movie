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
