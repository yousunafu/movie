// 静止画検品用: 音声なし (silent.wav) で scenes-data.json を組み立てる。
// 本番と同じ splitScript → 機械割り当て → enforceRatios を通す。
import { readFileSync, writeFileSync } from "fs";
import { splitScript } from "./src/generator/split";
import { suuriHeuristicAssign } from "./src/generator/assign";
import { enforceRatios } from "./src/generator/enforce";

const raw = readFileSync("docs/nozokimi-script.txt", "utf-8");
const sentences = splitScript(raw);
const assigned = sentences.map((s) => suuriHeuristicAssign(s));
const enforced = enforceRatios(sentences, assigned, "suuri");

const scenes = sentences.map((text, i) => ({
  index: i,
  text,
  ...enforced[i],
  audio: "audio/silent.wav",
  durationSec: Math.max(3, Math.round(text.length * 0.18 * 10) / 10),
}));
scenes.push({
  index: scenes.length,
  text: "ご視聴ありがとうございました。",
  type: "card",
  motif: "ending",
  isEnding: true,
  audio: "audio/silent.wav",
  durationSec: 4,
} as never);

writeFileSync(
  "src/remotion/scenes-data.json",
  JSON.stringify({ preset: "suuri", scenes, generatedAt: new Date().toISOString() }, null, 2),
);
console.log(`書き出し完了: ${scenes.length}シーン`);
enforced.forEach((a, i) => {
  if (a.motif !== assigned[i].motif || a.type !== assigned[i].type) {
    console.log(`enforce変更 ${i + 1}: ${assigned[i].type}/${assigned[i].motif} → ${a.type}/${a.motif}`);
  }
});
