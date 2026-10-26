// 全シーン静止画検品: bundleを1回だけ作り、各シーンの85%地点のフレームを書き出す。
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const data = JSON.parse(fs.readFileSync("src/remotion/scenes-data.json", "utf-8"));
const FPS = 30;
const holdFrames = (s: { durationSec: number; isEnding?: boolean }) =>
  Math.max(Math.ceil((s.durationSec + 0.35 + (s.isEnding ? 2.5 : 0)) * FPS), 1);

async function main() {
  const onlyArg = process.argv[2]; // 例: "12,40,77" 部分再出力用
  const only = onlyArg ? new Set(onlyArg.split(",").map((n) => parseInt(n, 10))) : null;
  const outDir = "out/check-nozoki";
  fs.mkdirSync(outDir, { recursive: true });
  console.log("bundle作成中…");
  const serveUrl = await bundle({ entryPoint: path.resolve("src/remotion/index.ts") });
  const composition = await selectComposition({ serveUrl, id: "Main" });
  let start = 0;
  for (let i = 0; i < data.scenes.length; i++) {
    const s = data.scenes[i];
    const hold = holdFrames(s);
    if (!only || only.has(i)) {
      const frame = start + Math.min(hold - 1, Math.floor(hold * 0.85));
      const out = path.join(outDir, `s${String(i).padStart(3, "0")}-${s.motif}.png`);
      await renderStill({ composition, serveUrl, output: out, frame });
      console.log(`${i + 1}/${data.scenes.length} ${s.motif} (frame ${frame})`);
    }
    start += hold;
  }
  console.log("完了: " + outDir);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
