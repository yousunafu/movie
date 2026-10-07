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

// 読み上げ専用テキスト (字幕には影響しない)。
// 「答えは」「つまり」などの後に読点を足し、大事な言葉の前にタメを作る。
export function ttsTextFor(text: string): string {
  return text.replace(/(答えは|つまり|実は|ところが|なんと)(?![、。])/g, "$1、");
}

// ログ用の短い説明 (どの話し方になったか一目でわかるように)
export function styleLabel(style: VoiceStyle): string {
  if (style.prePhonemeLength >= 0.4) return "章扉・間";
  if (style.intonationScale > 1.05) return "問いかけ";
  if (style.postPhonemeLength >= 0.5) return "結論・余韻";
  return "";
}
