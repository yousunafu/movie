// 検品用: 台本から機械割り当てだけで仮の scenes-data.json を作る (音声合成なし)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { splitScript } from "../src/generator/split";
import { suuriHeuristicAssign } from "../src/generator/assign";
import { enforceRatios } from "../src/generator/enforce";
import type { Scene, ScenesData } from "../src/types";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = fs.readFileSync(path.join(ROOT, "docs/sushi37-script.txt"), "utf-8");
const sentences = splitScript(raw);
const assignments = sentences.map((s) => suuriHeuristicAssign(s));
const fixed = enforceRatios(sentences, assignments, "suuri");

const scenes: Scene[] = fixed.map((a, i) => ({
  index: i,
  text: sentences[i],
  type: a.type,
  motif: a.motif,
  emphasis: a.emphasis,
  title: a.title,
  items: a.items,
  isEnding: i === sentences.length - 1,
  audio: "audio/silent.wav",
  durationSec: 3,
}));

const data: ScenesData = {
  scenes,
  generatedAt: new Date().toISOString(),
  preset: "suuri",
};
fs.writeFileSync(
  path.join(ROOT, "src/remotion/scenes-data.json"),
  JSON.stringify(data, null, 2),
);
console.log(`シーン数: ${scenes.length}`);
for (const s of scenes) {
  console.log(`${s.index}\t${s.type}\t${s.motif}\t${s.text.slice(0, 28)}`);
}
