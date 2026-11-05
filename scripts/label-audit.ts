// 札の棚卸し (読み取り専用・何も直さない)
//   motif → シーン関数 → その中の TagPlate/LabelPill/Stamp の文字 を集め、
//   同じ motif の「文」と突き合わせる。
import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("src/remotion/scenes-data.json", "utf-8"));
const textOf = new Map<string, string>();
for (const s of data.scenes) if (s.motif) textOf.set(s.motif, s.text as string);

const dir = "src/remotion/karakuri";
const files = fs.readdirSync(dir).filter((f) => /^Koso.*\.tsx$/.test(f));

type Row = { motif: string; sent: string; labels: string[]; dup: string[] };
const rows: Row[] = [];

for (const file of files) {
  const src = fs.readFileSync(path.join(dir, file), "utf-8");
  // SCENES 表: motif: (f) => <Comp ... />
  // ★型に "=>" が入るので /const SCENES[^=]*=/ では切れない。位置で切る。
  const i = src.indexOf("const SCENES");
  if (i < 0) continue;
  const j = src.indexOf("{", src.indexOf("=", i));
  const k = src.indexOf("\n};", j);
  const tbl = src.slice(j, k);
  const pairs: [string, string][] = [];
  for (const m of tbl.matchAll(/^\s*([a-z0-9_]+):\s*\(f\)\s*=>\s*<([A-Za-z0-9_]+)/gm)) {
    pairs.push([m[1], m[2]]);
  }
  for (const [motif, comp] of pairs) {
    const start = src.search(new RegExp(`const ${comp}\\b`));
    if (start < 0) continue;
    // 次のトップレベル const まで
    const rest = src.slice(start + 10);
    const nx = rest.search(/\nconst [A-Za-z0-9_]+/);
    const body = nx < 0 ? rest : rest.slice(0, nx);
    const labels: string[] = [];
    for (const m of body.matchAll(/<(?:TagPlate|LabelPill|Stamp)[^>]*?\btext="([^"]+)"/g)) labels.push(m[1]);
    const sent = textOf.get(motif) ?? "";
    const norm = (s: string) => s.replace(/[。、「」『』？?!！\s]/g, "");
    const ns = norm(sent);
    const dup = labels.filter((l) => l.length >= 2 && ns.includes(norm(l)));
    rows.push({ motif, sent, labels, dup });
  }
}

const withL = rows.filter((r) => r.labels.length > 0);
const tot = rows.reduce((a, r) => a + r.labels.length, 0);
const td = rows.reduce((a, r) => a + r.dup.length, 0);
console.log(`対応づけできたシーン: ${rows.length}`);
console.log(`札がある絵: ${withL.length} / 札の総数: ${tot} (札のある絵の平均 ${(tot / withL.length).toFixed(1)}枚)`);
console.log(`うち字幕の言葉そのまま: ${td}枚 (${((td / tot) * 100).toFixed(0)}%)`);
console.log(`\n--- 札が4枚以上の絵 ---`);
for (const r of rows.filter((r) => r.labels.length >= 4).sort((a, b) => b.labels.length - a.labels.length)) {
  console.log(`[${r.labels.length}枚/重複${r.dup.length}] ${r.sent}`);
  console.log(`      ${r.labels.map((l) => (r.dup.includes(l) ? `×${l}` : `○${l}`)).join(" / ")}`);
}
const hist: Record<number, number> = {};
for (const r of rows) hist[r.labels.length] = (hist[r.labels.length] ?? 0) + 1;
console.log(`\n--- 枚数の分布 ---`);
for (const k of Object.keys(hist).map(Number).sort((a, b) => a - b)) console.log(`${k}枚: ${hist[k]}シーン`);
