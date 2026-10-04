// 工程4: 音声合成 (ElevenLabs)。
// - 合成前に残りクレジットを確認し、足りなければ始める前に止める (途中で尽きると使った分は戻らない)
// - 同時リクエストはしない (プラン上限超えで429になるため直列+リトライ)
// - 原稿は漢字かな交じりのまま渡す (ひらがなに開くと片言になる)

import fs from "node:fs";
import path from "node:path";
import { parseBuffer } from "music-metadata";
import { VOICE } from "../channel";

const API = "https://api.elevenlabs.io/v1";

export async function checkCredits(requiredChars: number): Promise<void> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY が未設定です");
  const res = await fetch(`${API}/user/subscription`, {
    headers: { "xi-api-key": key },
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs残量確認に失敗: HTTP ${res.status} (キーを確認してください)`);
  }
  const sub = (await res.json()) as {
    character_count: number;
    character_limit: number;
  };
  const remaining = sub.character_limit - sub.character_count;
  console.log(
    `ElevenLabs残量: ${remaining.toLocaleString()}文字 (使用済 ${sub.character_count.toLocaleString()} / 上限 ${sub.character_limit.toLocaleString()})`,
  );
  console.log(`今回の必要文字数: ${requiredChars.toLocaleString()}文字`);
  if (remaining < requiredChars) {
    throw new Error(
      `残りクレジット不足: 必要${requiredChars}文字 > 残り${remaining}文字。合成を開始せずに中止します`,
    );
  }
}

export async function synthesize(
  text: string,
  outFile: string,
): Promise<number> {
  const key = process.env.ELEVENLABS_API_KEY!;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID が未設定です");

  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(
      `${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: VOICE.modelId,
          voice_settings: {
            stability: VOICE.stability,
            similarity_boost: VOICE.similarityBoost,
          },
        }),
      },
    );
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, buf);
      const meta = await parseBuffer(buf, { mimeType: "audio/mpeg" });
      const dur = meta.format.duration ?? 0;
      if (dur <= 0) throw new Error(`音声の長さが取得できません: ${outFile}`);
      return dur;
    }
    const body = await res.text().catch(() => "");
    if (res.status === 404) {
      throw new Error(
        `404 voice_not_found: その声が使えません。ElevenLabsで「Add to My Voices」を押したか確認してください。${body.slice(0, 200)}`,
      );
    }
    if (res.status === 402) {
      throw new Error(
        `402: 無料プランではライブラリの声をAPIで使えません。標準の声(Default)のIDに変えるか、有料プラン(Starter $5/月)に上げてください`,
      );
    }
    if (res.status === 401) {
      throw new Error(`401: APIキーが違います。キーを取り直してください`);
    }
    if (res.status === 429 || res.status >= 500) {
      const wait = Math.min(2 ** attempt * 1000, 30000);
      console.warn(
        `HTTP ${res.status} (試行${attempt}/${maxRetries})。${wait / 1000}秒待って再試行します`,
      );
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`音声合成失敗 HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  throw new Error(`音声合成が${maxRetries}回失敗しました`);
}
