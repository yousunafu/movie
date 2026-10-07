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

export async function synthesizeVoicevox(
  text: string,
  outFile: string,
  style?: VoiceStyle,
): Promise<number> {
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
