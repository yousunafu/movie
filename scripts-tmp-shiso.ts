// 機械割り当ての試走 (のぞき見くん回)。文ごとの割り当てを一覧表示するだけ。
import { readFileSync } from "fs";
import { splitScript } from "./src/generator/split";
import { suuriHeuristicAssign } from "./src/generator/assign";

const raw = readFileSync("docs/nozokimi-script.txt", "utf-8");
const sentences = splitScript(raw);
console.log(`文の数: ${sentences.length}`);
const counts: Record<string, number> = {};
sentences.forEach((s, i) => {
  const a = suuriHeuristicAssign(s);
  const key = `${a.type}/${a.motif}`;
  counts[key] = (counts[key] ?? 0) + 1;
  const short = s.length > 42 ? s.slice(0, 42) + "…" : s;
  console.log(`${String(i + 1).padStart(3)}  ${key.padEnd(32)} ${short}`);
});
console.log("\n--- モチーフ別の登場回数 ---");
Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, n]) => console.log(`${String(n).padStart(3)}  ${k}`));
