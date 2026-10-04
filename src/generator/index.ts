// 工場の本体。GistのURLから台本を取り、シーン分割→絵づけ→機械的補正→音声合成を行い、
// Remotionが読む scenes-data.json を書き出す。
// 使い方: npm run generate -- <台本のRaw URL>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { splitScript } from "./split";
import { assignScenes } from "./assign";
import { enforceRatios } from "./enforce";
import { generateImage, imagesAvailable, imagesDisabledReason } from "./images";
import { checkCredits, synthesize } from "./tts";
import { CHANNEL } from "../channel";
import type { Scene, ScenesData } from "../types";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC = path.join(ROOT, "public");
const DATA_FILE = path.join(ROOT, "src/remotion/scenes-data.json");

async function fetchScript(url: string): Promise<string> {
  const headers: Record<string, string> = {};
  if (process.env.GIST_TOKEN) {
    headers.Authorization = `token ${process.env.GIST_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(
      `台本の取得に失敗: HTTP ${res.status}。GistのRawボタンを押した後のURLを渡してください`,
    );
  }
  return res.text();
}

async function main() {
  const url = process.argv[2] || process.env.SCRIPT_URL;
  if (!url) {
    console.error("台本のURLを指定してください: npm run generate -- <URL>");
    process.exit(1);
  }

  console.log("=== 工程1: 台本の読込 ===");
  const raw = await fetchScript(url);
  const sentences = splitScript(raw);
  const totalChars = sentences.reduce((a, s) => a + s.length, 0);
  console.log(`${sentences.length}シーン / ${totalChars}文字`);
  if (sentences.length === 0) throw new Error("台本が空です");
  const estMinutes = Math.round((sentences.length * 5) / 60);
  console.log(`想定尺: 約${estMinutes}分`);
  for (const [i, s] of sentences.entries()) {
    if (s.length > 100) console.warn(`注意: シーン${i}が${s.length}字 (画面が長く止まります)`);
  }

  console.log("=== 工程2: AIによる絵づけ ===");
  const assigned = await assignScenes(sentences);

  console.log("=== 工程3: 機械的な補正 ===");
  const enforced = enforceRatios(sentences, assigned);

  console.log("=== 工程4: AI画像の生成 ===");
  const images: (string | undefined)[] = [];
  if (!imagesAvailable()) {
    console.warn(`画像生成をスキップ (${imagesDisabledReason()})。SVGの絵で代用します`);
    for (let i = 0; i < sentences.length; i++) images.push(undefined);
  } else {
    fs.mkdirSync(path.join(PUBLIC, "images"), { recursive: true });
    for (let i = 0; i < sentences.length; i++) {
      const rel = `images/scene-${String(i).padStart(3, "0")}.png`;
      const prompt = assigned[i].imagePrompt ?? sentences[i];
      const ok = await generateImage(prompt, path.join(PUBLIC, rel));
      images.push(ok ? rel : undefined);
      console.log(
        `  ${i + 1}/${sentences.length} ${ok ? "生成" : "SVGで代用"} ${prompt.slice(0, 30)}…`,
      );
    }
    const made = images.filter(Boolean).length;
    console.log(`画像: ${made}/${sentences.length}枚を生成`);
    if (made < sentences.length && imagesDisabledReason()) {
      console.warn(`途中で停止した理由: ${imagesDisabledReason()}`);
    }
  }

  console.log("=== 工程5: 音声合成 ===");
  const closing = CHANNEL.closingLine;
  const ttsChars = totalChars + closing.length;
  await checkCredits(ttsChars);

  fs.mkdirSync(path.join(PUBLIC, "audio"), { recursive: true });
  const scenes: Scene[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const audio = `audio/scene-${String(i).padStart(3, "0")}.mp3`;
    const dur = await synthesize(sentences[i], path.join(PUBLIC, audio));
    scenes.push({
      index: i,
      text: sentences[i],
      ...enforced[i],
      image: images[i],
      audio,
      durationSec: dur,
    });
    console.log(`  ${i + 1}/${sentences.length} [${enforced[i].type}/${enforced[i].motif}] ${dur.toFixed(1)}秒 ${sentences[i].slice(0, 24)}…`);
  }

  // 締めの決まり文句 (channel.ts で一元管理)
  const endAudio = `audio/scene-end.mp3`;
  const endDur = await synthesize(closing, path.join(PUBLIC, endAudio));
  scenes.push({
    index: scenes.length,
    text: closing,
    type: "card",
    motif: "ending",
    isEnding: true,
    audio: endAudio,
    durationSec: endDur,
  });

  const hasBgm = fs.existsSync(path.join(PUBLIC, "bgm.mp3"));
  if (!hasBgm) {
    console.log("BGMなし (public/bgm.mp3 を置くと自動でナレーションの下に敷かれます)");
  }

  const data: ScenesData = {
    scenes,
    hasBgm,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  const totalSec = scenes.reduce((a, s) => a + s.durationSec + 0.35, 0);
  console.log("=== 生成器 完了 ===");
  console.log(`合計 ${scenes.length}シーン / 尺 約${Math.floor(totalSec / 60)}分${Math.round(totalSec % 60)}秒`);
  console.log(`音声使用: ${ttsChars}文字`);
}

main().catch((e) => {
  console.error("生成器エラー:", e.message);
  process.exit(1);
});
