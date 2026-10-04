// 工程4: AI画像の生成 (Google Gemini)。
// - 全画像に共通の作風指定を前置して、チャンネル全体の統一感を保つ
// - 失敗したシーンはフラットSVGの絵に自動で戻る (動画生成全体は止めない)
// - キー不正/課金未設定は1回目で検知し、以降のシーンは試さない

import fs from "node:fs";
import path from "node:path";

const API = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

// 作風の土台 (docs/style-guide.md の実測値に合わせる: 明るい・暖色・ごちゃつかない)
const STYLE_PREFIX = `やわらかく温かみのあるフラットイラスト。日本の高齢者向け健康チャンネルの挿絵。
明るいクリーム色〜白の背景、暖色中心のパステルカラー、優しいタッチ、すっきりした構図。
横長16:9。文字・数字・ロゴは絵の中に入れない。
場面: `;

let disabled = false;
let disabledReason = "";

export function imagesAvailable(): boolean {
  if (!process.env.GEMINI_API_KEY) {
    disabled = true;
    disabledReason = "GEMINI_API_KEY が未設定";
  }
  return !disabled;
}

export async function generateImage(
  prompt: string,
  outFile: string,
): Promise<boolean> {
  if (disabled) return false;
  const key = process.env.GEMINI_API_KEY!;

  const maxRetries = 4;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${API}/models/${MODEL}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: STYLE_PREFIX + prompt }] }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio: "16:9" },
          },
        }),
      });
    } catch (e) {
      console.warn(`画像生成の通信失敗 (試行${attempt}): ${(e as Error).message}`);
      await sleep(2 ** attempt * 1000);
      continue;
    }

    if (res.ok) {
      const json = (await res.json()) as {
        candidates?: {
          content?: { parts?: { inlineData?: { data?: string } }[] };
        }[];
      };
      const b64 = json.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData?.data,
      )?.inlineData?.data;
      if (!b64) {
        console.warn(`画像が返ってきませんでした (試行${attempt})`);
        if (attempt < maxRetries) continue;
        return false;
      }
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, Buffer.from(b64, "base64"));
      return true;
    }

    const body = await res.text().catch(() => "");
    if (res.status === 400 || res.status === 403) {
      disabled = true;
      disabledReason = `HTTP ${res.status}: GEMINI_API_KEYが不正か権限不足です。キーを確認してください`;
      console.warn(`${disabledReason} ${body.slice(0, 200)}`);
      return false;
    }
    if (res.status === 429) {
      if (/RESOURCE_EXHAUSTED|quota/i.test(body) && attempt >= 2) {
        disabled = true;
        disabledReason =
          "429: Geminiの無料枠を使い切りました。Google AI Studioで課金設定をすると続きから生成できます";
        console.warn(disabledReason);
        return false;
      }
      const wait = Math.min(2 ** attempt * 2000, 30000);
      console.warn(`429 (試行${attempt}/${maxRetries})。${wait / 1000}秒待って再試行`);
      await sleep(wait);
      continue;
    }
    if (res.status >= 500) {
      await sleep(Math.min(2 ** attempt * 1000, 20000));
      continue;
    }
    console.warn(`画像生成失敗 HTTP ${res.status}: ${body.slice(0, 200)}`);
    return false;
  }
  return false;
}

export function imagesDisabledReason(): string {
  return disabledReason;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
