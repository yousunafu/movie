// J2Preview のシーン検品を高速化: bundle を1回だけ作り、指定シーンの静止画をまとめて書き出す。
// 使い方: npx tsx scripts-tmp-j2stills.ts <出力dir> <シーン番号:オフセット> ...
//   例:   npx tsx scripts-tmp-j2stills.ts tmp/j2-ch3 48:140 49:80 50:120
// シーン番号は J2Preview の通し番号 (0始まり)。frame = 番号*150 + オフセット。
// どの作風のコンポジションでも使えるよう、--comp=Main --fpsScene=150 も指定可。
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

async function main() {
  const args = process.argv.slice(2);
  const compId = (args.find((a) => a.startsWith("--comp=")) ?? "--comp=J2Preview").split("=")[1];
  const perScene = parseInt((args.find((a) => a.startsWith("--fpsScene=")) ?? "--fpsScene=150").split("=")[1], 10);
  const rest = args.filter((a) => !a.startsWith("--"));
  const outDir = rest[0];
  const specs = rest.slice(1).map((s) => {
    const [idx, off] = s.split(":").map((n) => parseInt(n, 10));
    return { idx, off: isNaN(off) ? Math.floor(perScene * 0.6) : off };
  });
  if (!outDir || specs.length === 0) {
    console.error("使い方: npx tsx scripts-tmp-j2stills.ts <出力dir> <番号:オフセット> ...");
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  console.log("bundle作成中… (1回だけ)");
  const serveUrl = await bundle({ entryPoint: path.resolve("src/remotion/index.ts") });
  const composition = await selectComposition({ serveUrl, id: compId });
  for (let i = 0; i < specs.length; i++) {
    const { idx, off } = specs[i];
    const frame = idx * perScene + off;
    const out = path.join(outDir, `s${String(idx).padStart(3, "0")}_f${frame}.png`);
    await renderStill({ composition, serveUrl, output: out, frame });
    console.log(`${i + 1}/${specs.length} シーン${idx} (frame ${frame}) → ${out}`);
  }
  console.log("完了: " + outDir);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
