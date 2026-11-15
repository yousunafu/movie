// 効果音の「倉庫 → 書き出し用フォルダ」自動コピー。
//
// 効果音ライブラリ (効果音ラボ 1,145個・268MB) は assets/se/ (倉庫) に置いてある。
// public/ に全部置くと、Remotion が書き出しのたびに全部を複製して遅くなるので、
// 実際にコードで使っている音だけを public/se/ へコピーする。
//
// 使い方:
//   npm run se        ← 手で走らせる
//   npm run check     ← check の最初でも自動で走る
//
// しくみ: src/ の中の "se/<カテゴリ>/<ファイル名>" という書き方を全部拾い、
//   public/se/ に無ければ assets/se/ からコピーする。
//   public/se/ にあってコードで使っていない音は「使っていない」と表示するだけ (消さない)。
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIB = join(ROOT, "assets", "se");
const PUB = join(ROOT, "public", "se");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// 1. コードの中で使っている効果音を集める
const used = new Set<string>();
const RE = /["'`]se\/([a-z0-9_-]+\/[^"'`\s]+\.(?:mp3|wav|ogg|m4a))["'`]/gi;
for (const file of walk(join(ROOT, "src"))) {
  if (!/\.(tsx?|jsx?|json)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(RE)) used.add(m[1]);
}

// 2. 足りない音を倉庫からコピーする
let copied = 0;
const missing: string[] = [];
for (const rel of [...used].sort()) {
  const dst = join(PUB, rel);
  if (existsSync(dst)) continue;
  const src = join(LIB, rel);
  if (!existsSync(src)) {
    missing.push(rel);
    continue;
  }
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  console.log(`  + コピー: se/${rel}`);
  copied++;
}

// 3. 使っていない音を知らせる (消さない)
const unused = existsSync(PUB)
  ? walk(PUB).map((p) => relative(PUB, p)).filter((r) => !used.has(r) && !r.startsWith("."))
  : [];

console.log(`効果音: コードで使っている ${used.size} 個 / 今回コピー ${copied} 個`);
if (unused.length) {
  console.log(`  (public/se/ にあるが使っていない音 ${unused.length} 個: ${unused.slice(0, 5).join(", ")}${unused.length > 5 ? " ほか" : ""})`);
}
if (missing.length) {
  console.error(`!!! 倉庫 (assets/se/) にも無い効果音があります。ファイル名を確かめてください:`);
  for (const r of missing) console.error(`    se/${r}`);
  process.exit(1);
}
