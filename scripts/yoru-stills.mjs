// 「夜の深掘り」試作 (YoruTest) の静止画を、1回のバンドルでまとめて書き出す。
// 使い方: node scripts/yoru-stills.mjs 125 275 425   (フレーム番号を並べる)
// 出力: tmp/yoru/f<フレーム>.png
// ※public/ を丸ごと複製しないよう publicDir を空のフォルダにしている (この試作は public を使わない)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const compId = args[0] && isNaN(Number(args[0])) ? args.shift() : "YoruTest";
const frames = args.map(Number);
const out = join(ROOT, "tmp", "yoru");
const emptyPublic = join(ROOT, "tmp", "yoru", "_public");
mkdirSync(out, { recursive: true });
mkdirSync(emptyPublic, { recursive: true });

const serveUrl = await bundle({ entryPoint: join(ROOT, "src/remotion/index.ts"), publicDir: emptyPublic });
const composition = await selectComposition({ serveUrl, id: compId });
for (const frame of frames) {
  const output = join(out, `${compId === "YoruTest" ? "" : compId + "_"}f${frame}.png`);
  await renderStill({ composition, serveUrl, output, frame });
  console.log("書き出し:", output);
}
