// つながる世界史: 台本の各文を VOICEVOX に「どう読むつもりか」カナで吐かせる。
// 読み間違いは耳で聞く前にここで潰す (readings-v0.5.md の表と突き合わせる)。
//
//   使い方: npx tsx scripts/sekai-yomi-check.ts ../台本_つながる世界史_冒頭3分.md
//
// 直し方: src/generator/pacing.ts の TTS_READINGS に [/語/g, "よみ"] を1行足す (台本は原文のまま)。
import fs from "node:fs";
import { ttsTextFor } from "../src/generator/pacing";

const HOST = "http://127.0.0.1:50021";
const SPEAKER_NAME = process.env.YOMI_SPEAKER ?? "青山龍星";
const STYLE_NAME = process.env.YOMI_STYLE ?? "ノーマル";

const file = process.argv[2] ?? "../台本_つながる世界史_冒頭3分.md";

type Query = { accent_phrases: { moras: { text: string }[]; pause_mora?: unknown }[] };

async function speakerId(): Promise<number> {
  const list = (await (await fetch(`${HOST}/speakers`)).json()) as {
    name: string;
    styles: { id: number; name: string }[];
  }[];
  const sp = list.find((s) => s.name === SPEAKER_NAME);
  if (!sp) throw new Error(`VOICEVOX に ${SPEAKER_NAME} が見つかりません`);
  return (sp.styles.find((s) => s.name === STYLE_NAME) ?? sp.styles[0]).id;
}

async function kanaOf(text: string, id: number): Promise<string> {
  const res = await fetch(
    `${HOST}/audio_query?text=${encodeURIComponent(text)}&speaker=${id}`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error(`audio_query 失敗 (${res.status})`);
  const q = (await res.json()) as Query;
  return q.accent_phrases
    .map((p) => p.moras.map((m) => m.text).join("") + (p.pause_mora ? "、" : ""))
    .join("");
}

const main = async () => {
  const lines = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !/^作風:/.test(l));

  const id = await speakerId();
  console.log(`■ ${SPEAKER_NAME} (${STYLE_NAME}) id=${id} / ${lines.length}文\n`);

  for (let i = 0; i < lines.length; i++) {
    const tts = ttsTextFor(lines[i]);
    const kana = await kanaOf(tts, id);
    console.log(`#${String(i + 1).padStart(2, "0")} ${lines[i]}`);
    console.log(`    ${kana}\n`);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
