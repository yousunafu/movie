// 声の緩急 (長尺対策)。文の種類ごとにVOICEVOXの話速・間・抑揚を変えて、
// 20分聴いても単調にならないようにする。字幕は原文のまま (読み上げだけ変わる)。

import { VOICE } from "../channel";

export type VoiceStyle = {
  speedScale: number;
  prePhonemeLength: number; // 文頭の静寂 (秒)
  postPhonemeLength: number; // 文末の静寂 (秒)
  intonationScale: number; // 抑揚 (1.0が標準)
};

const base = () => VOICE.voicevoxSpeed;

export function voiceStyleFor(
  text: string,
  type: string,
  motif: string,
  isEnding = false,
): VoiceStyle {
  // 章扉: ゆっくり宣言し、前後にしっかり間を取る (場面転換の呼吸)
  if (type === "card" && motif === "chapter") {
    return {
      speedScale: base() * 0.95,
      prePhonemeLength: 0.4,
      postPhonemeLength: 0.7,
      intonationScale: 1.0,
    };
  }
  // 結論カード・締めの挨拶: 少しゆっくり + 文末に余韻
  if (type === "card" || isEnding) {
    return {
      speedScale: base() * 0.97,
      prePhonemeLength: 0.15,
      postPhonemeLength: 0.5,
      intonationScale: 1.05,
    };
  }
  // 感嘆・ひらめきの相づち (「おっ、頭いい。」など): 元気よく速め + 抑揚強め
  if (/^(おっ|おお|お見事|なるほど)、/.test(text.trim())) {
    return {
      speedScale: base() * 1.06,
      prePhonemeLength: 0.05,
      postPhonemeLength: 0.3,
      intonationScale: 1.2,
    };
  }
  // 問いかけ: ゆっくり + 抑揚強め + 視聴者が考える間
  if (/か[。？?]?$/.test(text.trim())) {
    return {
      speedScale: base() * 0.95,
      prePhonemeLength: 0.1,
      postPhonemeLength: 0.5,
      intonationScale: 1.1,
    };
  }
  // 通常の文
  return {
    speedScale: base(),
    prePhonemeLength: 0.1,
    postPhonemeLength: 0.15,
    intonationScale: 1.0,
  };
}

// VOICEVOXが読み間違える言葉の読み替え表 (字幕には影響しない。読み上げだけ直す)。
// 上から順に適用するので、長い言葉 (藤原道長) を短い言葉 (道長) より先に書く。
const TTS_READINGS: [RegExp, string][] = [
  [/藤原道長/g, "ふじわらのみちなが"],
  [/道長/g, "みちなが"], // 「みちちょう」と読まれる対策
  [/重なり/g, "かさなり"], // 「じゅうなり」と読まれる対策
  [/後一条天皇/g, "ごいちじょうてんのう"],
  [/後朱雀天皇/g, "ごすざくてんのう"],
  [/后の位/g, "きさきのくらい"],
  [/流行り病/g, "はやりやまい"], // 「りゅうこうびょう」等と読まれる対策
  // 人を指す「方」は「かた」と読む (「ほう」と読まれる対策)。文脈を限定して誤爆を防ぐ
  [/こない方/g, "こないかた"],
  [/苦手な方/g, "苦手なかた"],
  [/決めた方/g, "決めたかた"],
  // --- 回転寿司×結婚 (37%ルール) の回 ---
  [/大真面目/g, "おおまじめ"], // 「だいまじめ」と読まれる対策
  [/家探し/g, "いえさがし"], // 「やさがし」と読まれる対策
  [/大トロ/g, "おおトロ"], // 「だいトロ」と読まれる対策
  [/中トロ/g, "ちゅうトロ"], // 「なかトロ」と読まれる対策
  [/11皿目/g, "じゅういち皿目"], // 「ひとひと皿目」等の誤読対策
  [/(?<![0-9０-９])1皿/g, "ひと皿"], // 「いち皿」と読まれる対策 (11皿などは除く)
  [/一皿/g, "ひと皿"],
  [/をeで/g, "をイーで"], // 数学の e は「イー」と読む
  [/は、e。/g, "は、イー。"],
  // --- キラキラ画面の回 ---
  [/SNS/g, "エスエヌエス"], // アルファベット読みを確実にする
  [/──/g, "、"], // ダッシュは読み上げでは間 (読点) に変換する
  [/割る/g, "わる"], // 「600割る40」が「わりる」と読まれる対策
  [/落ち込む人/g, "落ち込むひと"], // 「じん」と読まれる対策 (実際に発生)
  [/気づける人/g, "気づけるひと"],
  [/気づいた人/g, "気づいたひと"],
  [/当てた人/g, "当てたひと"],
  [/外れた人/g, "外れたひと"],
  [/あの人/g, "あのひと"],
  [/人は、特別な日/g, "ひとは、特別な日"],
  [/15分の1/g, "じゅうごぶんのいち"], // 「じゅうごふんのいち」と読まれる対策
  // --- 運命の人は東京に40人の回 ---
  [/いい人/g, "いいひと"], // 「いいじん」と読まれる対策 (実際に発生)
  [/ピーター・バッカス/g, "ピーターバッカス"], // 「・」で名前が途切れる対策 (読み上げだけ中黒を除去)
  [/口にする/g, "くちにする"], // 「こうにする」と読まれる対策
  [/年に10人/g, "ねんに10人"], // 「としに」と読まれる対策 (行28「1年に」は正しく読めているので限定置換)
  // --- のぞき見くんと絵の具のマジックの回 ---
  [/読む人/g, "読むひと"], // 「じん」誤読は頻発するため先回り (過去作で実際に発生)
  [/知らない人/g, "知らないひと"],
  [/途中の人/g, "途中のひと"],
  [/受け取った人/g, "受け取ったひと"],
  [/合鍵/g, "あいかぎ"], // 「ごうかぎ」と読まれる対策
  [/大仕事/g, "おおしごと"], // 「だいしごと」と読まれる対策
  [/空ぶり/g, "からぶり"], // 「そらぶり」と読まれる対策
  [/はい、/g, "はい。"], // 「はぁい」と伸ばされる対策。句点で短く切る
  [/オレンジ色/g, "オレンジいろ"], // 「おれんじしょく」と読まれる対策 (実際に発生)
  [/黄色/g, "きいろ"], // 「おうしょく」と読まれる対策 (実際に発生)
  [/画面のいちばん上/g, "画面のいちばんうえ"], // 「いちばんじょう」と読まれる対策 (実際に発生)
];

// 読み上げ専用テキスト (字幕には影響しない)。
// 「答えは」「つまり」などの後に読点を足し、大事な言葉の前にタメを作る。
// カギカッコ「」は読み上げでは一律除去する (VOICEVOXが不自然な間を入れるため)。字幕はそのまま。
export function ttsTextFor(text: string): string {
  let t = text.replace(/[「」]/g, "");
  t = t.replace(/(答えは|つまり|実は|ところが|なんと)(?![、。])/g, "$1、");
  for (const [pattern, reading] of TTS_READINGS) t = t.replace(pattern, reading);
  return t;
}

// ログ用の短い説明 (どの話し方になったか一目でわかるように)
export function styleLabel(style: VoiceStyle): string {
  if (style.speedScale > base()) return "元気";
  if (style.prePhonemeLength >= 0.4) return "章扉・間";
  if (style.intonationScale > 1.05) return "問いかけ";
  if (style.postPhonemeLength >= 0.5) return "結論・余韻";
  return "";
}
