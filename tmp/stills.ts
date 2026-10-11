// 検品用: 全シーンの静止画を一括生成 (バンドルは1回だけ)
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "tmp/stills");
fs.mkdirSync(OUT, { recursive: true });

const data = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/remotion/scenes-data.json"), "utf-8"),
);
const FPS = 30;
const PER = Math.ceil((3 + 0.35) * FPS); // 101フレーム/シーン

async function main() {
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "src/remotion/index.ts"),
  });
  const composition = await selectComposition({
    serveUrl,
    id: "Main",
    inputProps: {},
  });
  const only = process.env.ONLY
    ? new Set(process.env.ONLY.split(",").map(Number))
    : null;
  for (let i = 0; i < data.scenes.length; i++) {
    if (only && !only.has(i)) continue;
    const frame = PER * i + 60;
    const s = data.scenes[i];
    const name = `${String(i).padStart(3, "0")}-${s.type}-${s.motif}.png`;
    await renderStill({
      composition,
      serveUrl,
      output: path.join(OUT, name),
      frame,
    });
    console.log(name);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
