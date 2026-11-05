/**
 * 高層ビル回の「絵の中の札」検査 — 目で見る前に、機械で見つかる不具合を全部つぶす。
 *
 *   使い方:  npx tsx scripts/koso-plate-check.ts            (Koso*.tsx 全部)
 *            npx tsx scripts/koso-plate-check.ts KosoB2     (ファイル名で絞る)
 *
 * なぜこれを作ったか:
 *   第1章38枚と序27枚を人の目で検品したとき、見つかった不具合の大半が
 *   「札が字幕の黒帯に沈む」「札が画面の外に出る」の2つだった。
 *   どちらも座標の計算だけで分かる。人が1枚ずつ画像を開いて探すのは無駄なので、ここでやる。
 *   (検品用プレビューには字幕が出ないので、目で見ても絶対に気づけない種類の不具合)
 *
 * scenes-data.json とは無関係に動く。描いている途中でも何度でも回せる。
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const KDIR = path.join(ROOT, "src/remotion/karakuri");

// ===== 画面と字幕帯の実寸 (src/remotion/Video.tsx の karakuri 字幕ブロックと合わせる) =====
const SCREEN_W = 1920;
const SUB_FONT = 48;
const SUB_LINE_H = SUB_FONT * 1.6;
const SUB_BOTTOM = 56;
const SUB_PAD = 16;
/** 字幕が n 行のときの黒帯の上端。1行:931 / 2行:854 */
const bandTopY = (lines: number) => 1080 - SUB_BOTTOM - lines * SUB_LINE_H - SUB_PAD;
/** どの文が2行になるか描く時点では決まらないので、いちばん厳しい2行で見る */
const BAND_TOP = bandTopY(2); // = 854
const SAFE_BOTTOM = 830; // 制作ガイドの運用値 (帯まで24pxの余裕を残す)

const EDGE_L = 20;
const EDGE_R = SCREEN_W - 20;

type Issue = { level: "NG" | "注意"; where: string; what: string };
const issues: Issue[] = [];
const ng = (where: string, what: string) => issues.push({ level: "NG", where, what });
const warn = (where: string, what: string) => issues.push({ level: "注意", where, what });

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

// ===== どのファイルを見るか =====
const filter = process.argv[2] ?? "";
const files = fs
  .readdirSync(KDIR)
  .filter((n) => /^Koso.*\.tsx$/.test(n))
  .filter((n) => (filter ? n.includes(filter) : true));

if (!files.length) {
  console.log("見るファイルがありません。");
  process.exit(0);
}

type Plate = { kind: string; x: number; y: number; size: number; text: string; line: number };

/** 札1個ぶんを取り出す。属性が複数行に渡っていてもよい */
function parsePlates(seg: string, baseLine: number, consts: Map<string, number>): Plate[] {
  const out: Plate[] = [];
  for (const m of seg.matchAll(/<(TagPlate|LabelPill|Stamp|YearPost)\b([\s\S]*?)\/>/g)) {
    const [kind, attrs] = [m[1], m[2]];
    const num = (name: string): number | null => {
      const a = attrs.match(new RegExp(`\\b${name}=\\{(-?[\\d.]+)\\}`));
      if (a) return Number(a[1]);
      const b = attrs.match(new RegExp(`\\b${name}=\\{([A-Z_][A-Z0-9_]*)\\}`));
      if (b && consts.has(b[1])) return consts.get(b[1])!;
      return null; // 計算式 (y={BASE + i * 40}) は静かにとばす
    };
    const x = num("x");
    const y = num("y");
    if (x === null || y === null) continue;
    const t = attrs.match(/\btext="([^"]*)"/);
    out.push({
      kind,
      x,
      y,
      size: num("size") ?? (kind === "Stamp" ? 60 : kind === "YearPost" ? 44 : 34),
      text: t ? t[1] : "",
      line: baseLine + seg.slice(0, m.index!).split("\n").length - 1,
    });
  }
  return out;
}

/** 札の下端 (ここが黒帯の上端より下だと沈む) */
function bottomOf(p: Plate): number {
  if (p.kind === "TagPlate") return p.y + p.size * 0.95 + 5; // y は中心。枠線ぶん +5
  if (p.kind === "YearPost") return p.y + 12 + 5; // 札の下端。下に伸びる杭は飾りなので数えない
  if (p.kind === "LabelPill") return p.y + p.size * 1.4 + 18;
  return p.y + p.size * 1.4 + 30; // Stamp は7度回転するぶんを足す
}

/** 札の左右の端 */
function spanOf(p: Plate): [number, number] {
  if (p.kind === "TagPlate") {
    const w = p.text.length * p.size + 40;
    return [p.x - w / 2, p.x + w / 2];
  }
  if (p.kind === "YearPost") {
    const w = p.text.length * 44 + 48;
    return [p.x - w / 2, p.x + w / 2];
  }
  const w = p.text.length * p.size + 60;
  return [p.x - w / 2, p.x + w / 2]; // LabelPill は centerX 前提で見る
}

let platesChecked = 0;
let tightest = Infinity;
let tightestWhat = "";
let scenesChecked = 0;

for (const file of files) {
  const raw = fs.readFileSync(path.join(KDIR, file), "utf8");

  const consts = new Map<string, number>();
  for (const m of raw.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*=\s*(-?[\d.]+)\s*;/g)) {
    consts.set(m[1], Number(m[2]));
  }

  // ----- 振り分け表に載っている部品 = シーン本体。下請けの部品は対象外にする -----
  // 振り分け表の1行は <Frame> で包んである場合がある
  //   kb0_x: (f) => <Frame f={f} seed={413}><S14 f={f} /></Frame>,
  // なので「=> のあとに出てくる大文字で始まる部品名ぜんぶ」を数える。
  const sceneComps = new Set<string>();
  for (const m of stripComments(raw).matchAll(/^\s*[a-z0-9_]+\s*:\s*\([^)]*\)\s*=>\s*(.*)$/gm)) {
    for (const c of m[1].matchAll(/<([A-Z][A-Za-z0-9_]*)/g)) sceneComps.add(c[1]);
  }

  // ----- シーン部品ごとに切る -----
  const marks = [...raw.matchAll(/^const\s+([A-Za-z0-9_]+)\s*:\s*React\.FC/gm)];
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index!;
    const end = i + 1 < marks.length ? marks[i + 1].index! : raw.length;
    const comp = marks[i][1];
    const body = raw.slice(start, end);
    const baseLine = raw.slice(0, start).split("\n").length;
    const isScene = sceneComps.size === 0 || sceneComps.has(comp);
    if (!isScene) continue; // 下請けの部品 (Cloud, Hat など) は見ない
    scenesChecked++;

    // --- 検査1 札が字幕の黒帯に沈まないか ---
    for (const p of parsePlates(body, baseLine, consts)) {
      platesChecked++;
      const b = bottomOf(p);
      const gap = BAND_TOP - b;
      if (gap < tightest) {
        tightest = gap;
        tightestWhat = `${file}:${p.line} ${comp} 「${p.text}」(下端 ${Math.round(b)})`;
      }
      // 「帯OK」と書いてあれば承知のうえ。札の行そのものか、その直前3行のコメントを見る
      // (JSX のタグの中にはコメントを書けないので、すぐ上に書く形を許す)
      const srcLines = raw.split("\n");
      const allowed = srcLines.slice(Math.max(0, p.line - 4), p.line + 2).some((ln) => /帯OK/.test(ln));
      if (b > BAND_TOP && allowed) {
        warn(
          `${file}:${p.line} ${comp}`,
          `札「${p.text}」は帯の高さ (下端 ${Math.round(b)}) ですが「帯OK」と書いてあるので承知のうえと見ます`,
        );
      } else if (b > BAND_TOP) {
        ng(
          `${file}:${p.line} ${comp}`,
          `札「${p.text}」の下端が ${Math.round(b)} で、字幕の黒帯 (上端 ${BAND_TOP}) に沈みます。` +
            `y を ${Math.round(p.y - (b - SAFE_BOTTOM))} 以下にしてください`,
        );
      } else if (b > SAFE_BOTTOM) {
        warn(
          `${file}:${p.line} ${comp}`,
          `札「${p.text}」の下端が ${Math.round(b)}。帯まであと ${Math.round(gap)}px しかありません`,
        );
      }

      // --- 検査2 札が画面の外に出ていないか ---
      const [l, r] = spanOf(p);
      if (l < EDGE_L || r > EDGE_R) {
        ng(
          `${file}:${p.line} ${comp}`,
          `札「${p.text}」が画面の外に出ます (左端 ${Math.round(l)} / 右端 ${Math.round(r)})。` +
            `x を ${Math.round(Math.min(Math.max(p.x, EDGE_L + (r - l) / 2), EDGE_R - (r - l) / 2))} にしてください`,
        );
      }

      // --- 検査3 文字が小さすぎないか ---
      if (p.size < 23) {
        ng(`${file}:${p.line} ${comp}`, `札「${p.text}」の文字が ${p.size}px。23px 以上にしてください`);
      }
    }

    const code = stripComments(body);

    // --- 検査4 f=45 までに出そろうか (検品プレビューは全シーン f=45 で描かれる) ---
    for (const m of code.matchAll(/\bseg\(\s*f\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/g)) {
      const b = Number(m[2]);
      if (b > 42) {
        warn(
          `${file} ${comp}`,
          `seg(f, ${m[1]}, ${b}) — 検品プレビューは f=45 の瞬間を描くので、` +
            `b は 42 以下にしないと「出かけ」の絵で検品することになります`,
        );
      }
    }

    // --- 検査5 動いているか (図でも必ず f で何かが変わること) ---
    if (!/\bf\b/.test(code.replace(/React\.FC<\{\s*f:\s*number\s*\}>/g, "").replace(/\(\{\s*f\s*\}\)/g, ""))) {
      warn(`${file} ${comp}`, `このシーンは f をどこにも使っていません。静止した絵は禁止です (憲法第13条)`);
    }

    // --- 検査6 中身が空のまま残っていないか ---
    if (/\{\/\*\s*TODO\s*\*\/\}/.test(body)) {
      ng(`${file} ${comp}`, `まだ中身が TODO のままです`);
    }
  }

  // ----- 検査7 こわれた色の指定 (#9A9party のような打ち間違い) -----
  const lines = raw.split("\n");
  lines.forEach((ln, i) => {
    for (const m of ln.matchAll(/"#([0-9A-Za-z]+)"/g)) {
      const hex = m[1];
      if (![3, 4, 6, 8].includes(hex.length) || !/^[0-9A-Fa-f]+$/.test(hex)) {
        ng(`${file}:${i + 1}`, `色の指定 "#${hex}" が壊れています`);
      }
    }
  });
}

// ===== 結果 =====
const ngs = issues.filter((x) => x.level === "NG");
const warns = issues.filter((x) => x.level === "注意");

console.log(`\n高層ビル回・札の検査 — ${files.length}ファイル / ${scenesChecked}シーン / ${platesChecked}枚の札\n`);
if (ngs.length) {
  console.log(`■ NG ${ngs.length}件 (直してから静止画を見ること)`);
  for (const x of ngs) console.log(`  ${x.where}\n      ${x.what}`);
  console.log("");
}
if (warns.length) {
  console.log(`■ 注意 ${warns.length}件`);
  for (const x of warns) console.log(`  ${x.where}\n      ${x.what}`);
  console.log("");
}
if (platesChecked) {
  console.log(
    `いちばん余裕のなかった札: ${tightestWhat}\n` +
      `  黒帯 (上端 ${BAND_TOP}) まで ${Math.round(tightest)}px\n`,
  );
}
if (!ngs.length) console.log("NG はありません。\n");
process.exit(ngs.length ? 1 : 0);
