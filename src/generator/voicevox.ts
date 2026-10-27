// 工程5: 音声合成 (VOICEVOX)。無料・文字数制限なし・日本語専用で読み間違いが少ない。
// GitHub Actionsではワークフローがエンジンを自動起動する (VOICEVOX_URL)。
// 利用条件: 動画の説明欄に「VOICEVOX:キャラ名」のクレジット表記が必要。

import fs from "node:fs";
import path from "node:path";
import { parseBuffer } from "music-metadata";
import { VOICE } from "../channel";
import type { VoiceStyle } from "./pacing";

const BASE = () => process.env.VOICEVOX_URL || "http://127.0.0.1:50021";

let cachedStyleId: number | null = null;

async function resolveStyleId(): Promise<number> {
  let res: Response;
  try {
    res = await fetch(`${BASE()}/speakers`);
  } catch {
    throw new Error(
      `VOICEVOXエンジンに接続できません (${BASE()})。GitHub Actions上では自動起動されます。ローカルで使うにはVOICEVOXアプリを起動してください`,
    );
  }
  if (!res.ok) throw new Error(`VOICEVOX /speakers 失敗: HTTP ${res.status}`);
  const speakers = (await res.json()) as {
    name: string;
    styles: { name: string; id: number }[];
  }[];
  const sp = speakers.find((s) => s.name === VOICE.voicevoxSpeaker);
  if (!sp) {
    throw new Error(
      `VOICEVOXに「${VOICE.voicevoxSpeaker}」という声がありません。使える声: ${speakers.map((s) => s.name).join("、")}`,
    );
  }
  const style = sp.styles.find((s) => s.name === VOICE.voicevoxStyle) ?? sp.styles[0];
  console.log(`VOICEVOXの声: ${sp.name} (${style.name}) 話速${VOICE.voicevoxSpeed}`);
  return style.id;
}

// アクセント修正表: 先頭モーラ列が一致したアクセント句の accent (山の位置) を指定値に直す。
// 例:「スクショ」が語尾上がり (平板) に読まれる → 頭高 (accent=1) に固定する。
// accent: 0 は「平板」の意味 (句の最後まで高いまま = 山をモーラ数に合わせる)。
const ACCENT_FIXES: { moras: string[]; accent: number }[] = [
  { moras: ["ス", "ク", "ショ"], accent: 1 },
  // 「湯切り(ゆぎり)」が頭高 (ユ\ギリ) に訛る → 平板 (ユギリ→) に (自販機2000年史 #193)
  { moras: ["ユ", "ギ", "リ"], accent: 0 },
  // 「つまみ」が頭高 (ツ\マミ) に訛る → 平板 (ツマミ→) に (自販機2000年史 #76)
  { moras: ["ツ", "マ", "ミ"], accent: 0 },
];

// 無声化解除表: 先頭モーラ列が一致したアクセント句の、指定位置のモーラの無声化を解除する。
// VOICEVOXは「し」「き」等を文脈によって無声 (ささやき声) にすることがあり、ほぼ聞こえなくなる。
// 例:「師匠」の先頭「シ」が無声化して「しょう」に聞こえる → 有声化+少し長めに (自販機2000年史 #26)
// lengthScale: 母音の長さの倍率 (1.3 = 3割長く)。有声化だけだと短すぎて埋もれるため。
const VOICING_FIXES: { moras: string[]; moraIndex: number; lengthScale: number }[] = [
  { moras: ["シ", "ショ", "オ"], moraIndex: 0, lengthScale: 1.3 },
];

// 無声モーラ (vowel が大文字 "I" "U" など) を有声 (小文字) に直す。
// 1つでも直したら true を返す → 呼び出し側で /mora_pitch により音程だけ再計算させる
// (/mora_data だと長さも再計算されて lengthScale が消えるので使わない)。
function fixVoicing(query: Record<string, unknown>): boolean {
  const phrases = query.accent_phrases as
    | { moras: { text: string; vowel: string; vowel_length: number }[] }[]
    | undefined;
  if (!Array.isArray(phrases)) return false;
  let changed = false;
  for (const ph of phrases) {
    for (const fix of VOICING_FIXES) {
      if (
        ph.moras.length >= fix.moras.length &&
        fix.moras.every((m, i) => ph.moras[i]?.text === m)
      ) {
        const mora = ph.moras[fix.moraIndex];
        if (mora && /^[AIUEO]$/.test(mora.vowel)) {
          mora.vowel = mora.vowel.toLowerCase();
          mora.vowel_length *= fix.lengthScale;
          changed = true;
        }
      }
    }
  }
  return changed;
}

// audio_query の accent_phrases を後処理してアクセントを直す (読み・字幕には影響しない)。
// 1つでも直したら true を返す → 呼び出し側で /mora_data により音程を再計算させる。
// (accent を書き換えるだけでは音程データが古いままで、合成結果が変わらない。2026-10 自販機回で発覚)
function fixAccents(query: Record<string, unknown>): boolean {
  const phrases = query.accent_phrases as
    | { moras: { text: string }[]; accent: number }[]
    | undefined;
  if (!Array.isArray(phrases)) return false;
  let changed = false;
  for (const ph of phrases) {
    for (const fix of ACCENT_FIXES) {
      if (
        ph.moras.length >= fix.moras.length &&
        fix.moras.every((m, i) => ph.moras[i]?.text === m)
      ) {
        const next = fix.accent === 0 ? ph.moras.length : fix.accent;
        if (ph.accent !== next) {
          ph.accent = next;
          changed = true;
        }
      }
    }
  }
  return changed;
}

export async function synthesizeVoicevox(
  text: string,
  outFile: string,
  style?: VoiceStyle,
): Promise<number> {
  // 途中で止まった合成の再開用: RESUME_AUDIO=1 のとき、既にある音声ファイルをそのまま使う。
  // 注意: 台本や声の設定を変えた直後は使わないこと (古い音声が残ったままになる)
  if (process.env.RESUME_AUDIO === "1" && fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
    const meta = await parseBuffer(fs.readFileSync(outFile), { mimeType: "audio/wav" });
    const dur = meta.format.duration ?? 0;
    if (dur > 0) return dur;
  }

  if (cachedStyleId === null) cachedStyleId = await resolveStyleId();
  const speaker = cachedStyleId;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const qRes = await fetch(
        `${BASE()}/audio_query?speaker=${speaker}&text=${encodeURIComponent(text)}`,
        { method: "POST" },
      );
      if (!qRes.ok) throw new Error(`audio_query HTTP ${qRes.status}`);
      const query = (await qRes.json()) as Record<string, unknown>;
      // 声の緩急 (pacing.ts): 文の種類で話速・間・抑揚を変える。指定が無ければ従来通り
      query.speedScale = style?.speedScale ?? VOICE.voicevoxSpeed;
      query.prePhonemeLength = style?.prePhonemeLength ?? 0.1;
      // 文末の余白 (シーン間の間はRemotion側でも付くため基本は短めに)
      query.postPhonemeLength = style?.postPhonemeLength ?? 0.15;
      query.intonationScale = style?.intonationScale ?? 1.0;
      if (fixAccents(query)) {
        // 山の位置を変えたので、モーラごとの音程を VOICEVOX に再計算させる
        const mRes = await fetch(`${BASE()}/mora_data?speaker=${speaker}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query.accent_phrases),
        });
        if (!mRes.ok) throw new Error(`mora_data HTTP ${mRes.status}`);
        query.accent_phrases = await mRes.json();
      }
      if (fixVoicing(query)) {
        // 無声→有声に変えたので音程のみ再計算 (長さは手調整済みなので /mora_pitch を使う)
        const pRes = await fetch(`${BASE()}/mora_pitch?speaker=${speaker}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query.accent_phrases),
        });
        if (!pRes.ok) throw new Error(`mora_pitch HTTP ${pRes.status}`);
        query.accent_phrases = await pRes.json();
      }

      const sRes = await fetch(`${BASE()}/synthesis?speaker=${speaker}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      if (!sRes.ok) throw new Error(`synthesis HTTP ${sRes.status}`);
      const buf = Buffer.from(await sRes.arrayBuffer());
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, buf);
      const meta = await parseBuffer(buf, { mimeType: "audio/wav" });
      const dur = meta.format.duration ?? 0;
      if (dur <= 0) throw new Error(`音声の長さが取得できません: ${outFile}`);
      return dur;
    } catch (e) {
      if (attempt === maxRetries) throw e;
      console.warn(
        `VOICEVOX合成失敗 (試行${attempt}/${maxRetries}): ${(e as Error).message}。再試行します`,
      );
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error("VOICEVOX合成が繰り返し失敗しました");
}
