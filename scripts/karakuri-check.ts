/**
 * からくり検査 (第1層) — 「からくり憲法」のうち機械で測れる条文を自動で見る。
 *
 *   使い方:  npm run check:karakuri
 *
 * これは karakuri 作風の回だけに効く検査。数理室などほかの作風には何もしない。
 * 自販機2000年史と「私は何者?」の2本で出た修正リスト約136項目を分類したところ、
 * およそ半分が「毎回おなじ検査をすれば人が見る前に消えるもの」だった。それをここに集めた。
 *
 * レンダリングは一切しないので数秒で終わる。絵を直したら必ずこれを通してから静止画を見る。
 *
 * --- 検査する条文 ---
 *  検査1  絵の割り当て (憲法外・2026-10-30追加)
 *         MOTIFS配列を直しても scenes-data.json を直さないと、新しい絵は画面に出ない。
 *         「私は何者?」で4シーンぶん作った絵が本番に出ていなかった事故の再発防止。
 *  検査2  字幕法 (第1条)  1行36字・最大2行・3行は禁止
 *  検査3  テロップ安全ライン (第2条)  字幕の黒帯にテロップ・札・スタンプを沈ませない
 *  検査4  札の高さずれ (第2条の運用)  左右に並べた札の高さ・左端がそろっているか
 *  検査5  同じ絵の連続 (第2条の運用)  隣り合う文が同じ絵だと「使い回し」に見える
 *
 * --- 検査できないもの (第3層＝人の目で見る) ---
 *   「もっと精巧に」「その時代らしく」「スケール感」「史実」「伏線の絵の一致」
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { loadDefaultJapaneseParser } from "budoux";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const KDIR = path.join(ROOT, "src/remotion/karakuri");

// ===== 画面の実寸 (Video.tsx の karakuri 字幕ブロックと合わせること) =====
const SCREEN_W = 1920;
const SCREEN_H = 1080;
const SUB_WIDTH_RATIO = 0.92; // width: "92%"
const SUB_FONT = 48;
const SUB_LINE_H = SUB_FONT * 1.6; // lineHeight: 1.6
const SUB_BOTTOM = 56; // bottom: 56
const SUB_PAD = 16; // boxShadow の 16px ぶんが帯の余白になる
const MAX_CHARS_PER_LINE = Math.floor((SCREEN_W * SUB_WIDTH_RATIO) / SUB_FONT); // = 36

/** 字幕が n 行のときの、黒帯の上端 y。ここより下にテロップがあると沈む。 */
const bandTopY = (lines: number) =>
  SCREEN_H - SUB_BOTTOM - lines * SUB_LINE_H - SUB_PAD; // 1行:931 / 2行:854

type Issue = { level: "NG" | "注意"; where: string; what: string };
const issues: Issue[] = [];
const ng = (where: string, what: string) => issues.push({ level: "NG", where, what });
const warn = (where: string, what: string) => issues.push({ level: "注意", where, what });

// ===== 台本データ =====
const dataPath = path.join(ROOT, "src/remotion/scenes-data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8")) as {
  preset?: string;
  scenes: { motif?: string; text?: string; isEnding?: boolean }[];
};

if (data.preset !== "karakuri") {
  console.log(`いまの scenes-data.json は作風「${data.preset}」なので、からくり検査はしません。`);
  process.exit(0);
}
const scenes = data.scenes;

// 作品を motif の接頭辞で判別する (w1_=私は何者 / j2_=自販機2000年史)
const prefix = (scenes.find((s) => /^[a-z]\d_/.test(s.motif ?? ""))?.motif ?? "").slice(0, 3);
const WORK =
  prefix === "w1_" || prefix === "w2_" || prefix === "w3_" || prefix === "w4_"
    ? { name: "「私は何者?」の4000年史", indexFile: "WatashiIndex.tsx", arrayName: "W_ALL_MOTIFS" }
    : { name: "自販機2000年史", indexFile: "Jihanki2000Index.tsx", arrayName: "J2_ALL_MOTIFS" };

console.log(`からくり検査: ${WORK.name}  (全 ${scenes.length} シーン)\n`);

// ============================================================
// 検査1  絵の割り当て — MOTIFS配列 と scenes-data.json のつき合わせ
// ============================================================
// 配列は「設計図」、scenes-data.json は「実際に使われる台帳」。
// 配列だけ直して台帳を直さないと、新しい絵を作っても本番に出ない。
/** コメントを消す (コメント内に書かれた motif 名を拾ってしまうのを防ぐ) */
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

/**
 * karakuri フォルダ全体から `const NAME: string[] = [ ... ]` の中身を探す。
 * ※「const 宣言の行」に限定すること。名前だけで探すと import 行に引っかかり、
 *   まったく別の配列の中身を読んでしまう。
 */
function findArrayBody(name: string): string | null {
  const re = new RegExp(
    `(?:export\\s+)?const\\s+${name}\\s*(?::[^=]*)?=\\s*\\[([\\s\\S]*?)\\n\\]`,
  );
  for (const f of fs.readdirSync(KDIR).filter((n) => n.endsWith(".tsx"))) {
    const m = fs.readFileSync(path.join(KDIR, f), "utf8").match(re);
    if (m) return m[1];
  }
  return null;
}

/**
 * MOTIFS 配列を読む。`...W_B1_MOTIFS` のような展開があれば、その先も読みにいく。
 * (WatashiIndex の W_ALL_MOTIFS は4ブロックの連結になっている)
 */
function readMotifArray(name: string, depth = 0): string[] | null {
  if (depth > 4) return null;
  const raw = findArrayBody(name);
  if (raw === null) return null;
  const body = stripComments(raw);
  const out: string[] = [];
  // 「...OTHER」と「"motif"」を、書いてある順番どおりに拾う
  for (const m of body.matchAll(/\.\.\.\s*([A-Za-z_][A-Za-z0-9_]*)|"([a-z0-9_]+)"/g)) {
    if (m[1]) {
      const sub = readMotifArray(m[1], depth + 1);
      if (!sub) return null;
      out.push(...sub);
    } else {
      out.push(m[2]);
    }
  }
  return out;
}

const readAllMotifs = () => readMotifArray(WORK.arrayName);

const allMotifs = readAllMotifs();
if (!allMotifs) {
  warn("検査1", `${WORK.indexFile} の ${WORK.arrayName} が読めませんでした (検査をとばしました)`);
} else {
  // scenes-data.json の最後はエンディング。配列はそこを持たないので除いて比べる
  const body = scenes.filter((s) => s.motif !== "ending");
  if (allMotifs.length !== body.length) {
    ng("検査1", `配列は ${allMotifs.length} 枚ぶん、台帳は ${body.length} 文ぶん。数が合っていません`);
  }
  for (let i = 0; i < Math.min(allMotifs.length, body.length); i++) {
    if (allMotifs[i] !== body[i].motif) {
      ng(
        `文#${i + 1}`,
        `設計図では「${allMotifs[i]}」なのに、台帳は「${body[i].motif}」のまま。` +
          `このままだと新しい絵は画面に出ません`,
      );
    }
  }
}

// 台帳にあるのに、どのファイルも知らない motif (= 絵が出ずに真っ白になる)
// 振り分けの書き方は2通りある:
//   switch 式     case "w2_kyoushitsu": return <SceneKyoushitsu f={f} />;
//   オブジェクト表  w1_unun: (f) => <SceneUnun f={f} />,
// 両方ひろう。
const DISPATCH_RE =
  /case\s+"([a-z0-9_]+)"\s*:\s*return\s*<([A-Za-z0-9_]+)|^\s*([a-z0-9_]+)\s*:\s*\([^)]*\)\s*=>\s*<([A-Za-z0-9_]+)/gm;

const known = new Set<string>();
for (const f of fs.readdirSync(KDIR).filter((n) => n.endsWith(".tsx"))) {
  const src = stripComments(fs.readFileSync(path.join(KDIR, f), "utf8"));
  for (const m of src.matchAll(DISPATCH_RE)) known.add(m[1] ?? m[3]);
}
scenes.forEach((s, i) => {
  if (s.motif && s.motif !== "ending" && !known.has(s.motif)) {
    ng(`文#${i + 1}`, `「${s.motif}」という絵は、どのファイルにも描かれていません`);
  }
});

// ============================================================
// 検査2  字幕法 — 1行36字・最大2行・3行は禁止
// ============================================================
const parser = loadDefaultJapaneseParser();

/** 全角=1 / 半角=0.5 で数える (実際の見た目の幅に近い) */
const widthOf = (s: string) =>
  [...s].reduce((a, c) => a + (/[\x20-\x7E｡-ﾟ]/.test(c) ? 0.5 : 1), 0);

/** budoux で文節に割ってから、1行36字で詰めたときの行数を数える */
function countLines(text: string): number {
  if (!text) return 0;
  let lines = 1;
  let cur = 0;
  for (const chunk of parser.parse(text)) {
    const w = widthOf(chunk);
    if (cur > 0 && cur + w > MAX_CHARS_PER_LINE) {
      lines++;
      cur = w;
    } else {
      cur += w;
    }
  }
  return lines;
}

/** 文#(1はじまり) → その文の字幕の行数 */
const linesOf = new Map<number, number>();
scenes.forEach((s, i) => {
  const n = countLines(s.text ?? "");
  linesOf.set(i + 1, n);
  if (n >= 3) {
    ng(
      `文#${i + 1}`,
      `字幕が${n}行になります (${widthOf(s.text ?? "")}字)。台本を短く割ってください\n` +
        `        「${s.text}」`,
    );
  }
});

/** motif → その絵を使う文の、字幕行数の最大値 (いちばん字幕が高くなるときで判定する) */
const worstLinesOfMotif = new Map<string, number>();
scenes.forEach((s, i) => {
  if (!s.motif) return;
  const n = linesOf.get(i + 1) ?? 1;
  worstLinesOfMotif.set(s.motif, Math.max(worstLinesOfMotif.get(s.motif) ?? 0, n));
});

// ============================================================
// 絵のファイルを読んで、札 (TagPlate / LabelPill / Stamp) の位置を取り出す
// ============================================================
type Plate = { kind: string; x: number; y: number; size: number; text: string; line: number };
type SceneBlock = { comp: string; file: string; plates: Plate[] };

/** <TagPlate ... /> を1個ぶん取り出す (属性が複数行に渡っていてもよい) */
function parsePlates(src: string, from: number, to: number, consts: Map<string, number>): Plate[] {
  const seg = src.slice(from, to);
  const out: Plate[] = [];
  for (const m of seg.matchAll(/<(TagPlate|LabelPill|Stamp)\b([\s\S]*?)\/>/g)) {
    const [kind, attrs] = [m[1], m[2]];
    const num = (name: string): number | null => {
      const a = attrs.match(new RegExp(`\\b${name}=\\{(-?[\\d.]+)\\}`));
      if (a) return Number(a[1]);
      const b = attrs.match(new RegExp(`\\b${name}=\\{([A-Z_][A-Z0-9_]*)\\}`));
      if (b && consts.has(b[1])) return consts.get(b[1])!;
      return null; // 計算式 (y={BASE + i * 40} など) は静かにとばす
    };
    const x = num("x");
    const y = num("y");
    if (x === null || y === null) continue;
    const t = attrs.match(/\btext="([^"]*)"/);
    out.push({
      kind,
      x,
      y,
      size: num("size") ?? (kind === "Stamp" ? 60 : 34),
      text: t ? t[1] : "",
      line: src.slice(0, from + m.index!).split("\n").length,
    });
  }
  return out;
}

/** 札の下端 y (ここが黒帯の上端より下だと沈む) */
function bottomOf(p: Plate): number {
  if (p.kind === "TagPlate") return p.y + p.size * 0.95 + 5; // y は中心。枠線ぶん +5
  if (p.kind === "LabelPill") return p.y + p.size * 1.4 + 18; // y は上端。padding+枠線
  return p.y + p.size * 1.4 + 30; // Stamp: 上端 + 文字 + 枠 + 7度回転のはみ出し
}

const blocks: SceneBlock[] = [];
const compToMotifs = new Map<string, Set<string>>();

for (const file of fs.readdirSync(KDIR).filter((n) => n.endsWith(".tsx"))) {
  const src = fs.readFileSync(path.join(KDIR, file), "utf8");

  // ファイル内の定数 (const FURUI_LABEL_Y = 790;) を拾っておく
  const consts = new Map<string, number>();
  for (const m of src.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*=\s*(-?[\d.]+)\s*;/g)) {
    consts.set(m[1], Number(m[2]));
  }

  // 振り分けの行から、部品名と motif のひもづけを作る (switch 式 / オブジェクト表 の両方)
  for (const m of stripComments(src).matchAll(DISPATCH_RE)) {
    const motif = m[1] ?? m[3];
    const comp = m[2] ?? m[4];
    if (!compToMotifs.has(comp)) compToMotifs.set(comp, new Set());
    compToMotifs.get(comp)!.add(motif);
  }

  // シーン部品の切れ目を見つける
  const marks = [...src.matchAll(/^const\s+([A-Za-z0-9_]+)\s*:\s*React\.FC/gm)];
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index!;
    const end = i + 1 < marks.length ? marks[i + 1].index! : src.length;
    const plates = parsePlates(src, start, end, consts);
    if (plates.length) blocks.push({ comp: marks[i][1], file, plates });
  }
}

// ============================================================
// 検査3  テロップ安全ライン — 字幕の黒帯に沈んでいないか
// ============================================================
// 「NG 0件」が本当に合格なのか、それとも検査が空ぶりしているのか分からないと困るので、
// いちばん余裕のなかった札の情報を覚えておいて、最後に必ず表示する。
let tightest = Infinity; // 黒帯の上端までの最小すきま (px)
let tightestWhat = "";
let platesChecked = 0;

for (const b of blocks) {
  const motifs = [...(compToMotifs.get(b.comp) ?? [])].filter((m) => worstLinesOfMotif.has(m));
  if (!motifs.length) continue; // この回では使われていない部品
  const lines = Math.max(...motifs.map((m) => worstLinesOfMotif.get(m)!));
  const limit = bandTopY(lines);
  // その絵を使っている文番号
  const nums = scenes
    .map((s, i) => (motifs.includes(s.motif ?? "") ? i + 1 : 0))
    .filter(Boolean);
  for (const p of b.plates) {
    const bottom = bottomOf(p);
    const margin = limit - bottom;
    if (margin < 0) {
      ng(
        `文#${nums.join("・#")} (${b.file}:${p.line})`,
        `${p.kind}「${p.text}」の下端が y=${Math.round(bottom)}。` +
          `この文の字幕は${lines}行で黒帯の上端が y=${Math.round(limit)} なので、${Math.round(-margin)}px 沈みます`,
      );
    } else if (margin < 40) {
      warn(
        `文#${nums.join("・#")} (${b.file}:${p.line})`,
        `${p.kind}「${p.text}」と字幕の黒帯のすきまが ${Math.round(margin)}px しかありません (${lines}行字幕)。` +
          `台本が少し伸びて2行になると沈みます`,
      );
    }
    platesChecked++;
    if (margin < tightest) {
      tightest = margin;
      tightestWhat = `文#${nums[0]} ${b.file}:${p.line} の ${p.kind}「${p.text}」`;
    }
  }
}

// ============================================================
// 検査4  札の高さずれ — 左右に並べた札がそろっているか
// ============================================================
// 「左右で見くらべる1対の札」だけを拾いたい。判定は画面センター(960)を軸にした対称性で行う:
//   ・2枚の中点がセンター付近にある
//   ・どちらもセンターから十分離れている (250px以上)
// こうしないと「上の真ん中の見出し (x=960)」と「左の札」が1対と誤判定される。
//
// ★さらに「おたがいが一番の相手」であることを要求する (2026-10-30 に追加)。
//   実例: 文#96 には「やさしい(x=420)/むずかしい(x=1510)」という本当の1対と、
//   「ここでつまずく(x=610)」という別用途の札がある。中点だけで見ると
//   「ここでつまずく」と「むずかしい」も1対に見えてしまい、誤検出になった。
//   「むずかしい」から見て一番つり合う相手は「やさしい」なので、
//   両思いの組だけを1対とみなせば、この誤検出は消える。
const CENTER_X = SCREEN_W / 2;
const SYM_TOL = 120; // 中点がセンターからこれ以上ずれたら、1対とは見なさない
const SIDE_MIN = 250; // センターからこれ以上離れていないと、左右の札とは見なさない

/** つり合いの悪さ (小さいほど、きれいな左右1対) */
const symScore = (a: Plate, c: Plate) => Math.abs((a.x + c.x) / 2 - CENTER_X);

/** a から見て、いちばんつり合う相手の添字 */
function bestPartner(ps: Plate[], i: number): number {
  let best = -1;
  let bestScore = Infinity;
  for (let j = 0; j < ps.length; j++) {
    if (j === i || ps[j].kind !== ps[i].kind) continue;
    if (Math.abs(ps[i].x - CENTER_X) < SIDE_MIN) continue;
    if (Math.abs(ps[j].x - CENTER_X) < SIDE_MIN) continue;
    if ((ps[i].x - CENTER_X) * (ps[j].x - CENTER_X) > 0) continue; // 同じ側どうしは1対ではない
    const s = symScore(ps[i], ps[j]);
    if (s < bestScore) {
      bestScore = s;
      best = j;
    }
  }
  return bestScore <= SYM_TOL ? best : -1;
}

/** TagPlate の左端 (x は中心。幅 = 文字数*size + 44) */
const leftEdgeOf = (p: Plate) =>
  p.kind === "TagPlate" ? p.x - ([...p.text].length * p.size + 44) / 2 : p.x;

for (const b of blocks) {
  const motifs = compToMotifs.get(b.comp) ?? new Set<string>();
  const nums = scenes.map((s, i) => (motifs.has(s.motif ?? "") ? i + 1 : 0)).filter(Boolean);
  if (!nums.length) continue; // この回では使われていない絵 (別作品のファイル) は見ない
  const where = `文#${nums.join("・#")} (${b.file})`;
  const ps = b.plates;
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i];
      const c = ps[j];
      if (a.kind !== c.kind) continue;
      const dy = Math.abs(a.y - c.y);
      // 両思い (おたがいが一番つり合う相手) のときだけ「左右1対」とみなす
      const pair = bestPartner(ps, i) === j && bestPartner(ps, j) === i;

      // 左右で見くらべる1対の札 → 高さは1pxもずらさない
      if (pair && dy > 0 && dy <= 60) {
        ng(
          where,
          `左右に見くらべる札「${a.text}」(y=${a.y}) と「${c.text}」(y=${c.y}) の高さが ${dy}px ちがいます。` +
            `同じ高さの定数にまとめてください`,
        );
      }

      // 上下に積んだ札 → 左端をそろえる (中心ぞろえだと字数のちがいで左端がガタつく)
      if (dy >= 60 && Math.abs(a.x - c.x) <= 120) {
        const d = Math.round(Math.abs(leftEdgeOf(a) - leftEdgeOf(c)));
        if (d > 20) {
          warn(
            where,
            `上下に積んだ札「${a.text}」と「${c.text}」の左端が ${d}px ずれています。` +
              `縦に並べるときは中心ではなく左端をそろえてください`,
          );
        }
      }
    }
  }
}

// ============================================================
// 検査5  同じ絵の連続
// ============================================================
for (let i = 1; i < scenes.length; i++) {
  const a = scenes[i - 1];
  const b = scenes[i];
  if (a.motif && a.motif === b.motif && b.motif !== "ending") {
    warn(
      `文#${i}→#${i + 1}`,
      `同じ絵「${b.motif}」が続きます。別のことを言っているなら絵を分けてください\n` +
        `        #${i}「${a.text}」\n        #${i + 1}「${b.text}」`,
    );
  }
}

// ============================================================
// まとめて表示
// ============================================================
const ngs = issues.filter((i) => i.level === "NG");
const warns = issues.filter((i) => i.level === "注意");

const show = (list: Issue[], title: string) => {
  if (!list.length) return;
  console.log(`\n${title} (${list.length}件)`);
  console.log("─".repeat(72));
  for (const i of list) console.log(`  ${i.where}\n        ${i.what}`);
};

show(ngs, "■ 直してください");
show(warns, "□ 念のため確認 (意図してやっているなら、そのままでよい)");

// 検査が空ぶりしていないことの証拠。「0件でした」だけだと、検査が壊れていても同じ顔をするので。
console.log("\n" + "─".repeat(72));
console.log("検査が実際に見たもの (0件だったとき、壊れていないことの確認用)");
const maxLines = Math.max(...linesOf.values());
const lines2 = [...linesOf.values()].filter((n) => n === 2).length;
console.log(
  `  検査2 字幕: ${scenes.length}文を測りました。` +
    `いちばん長い字幕は ${maxLines}行 (2行の文が ${lines2}件)。上限は2行`,
);
if (platesChecked) {
  console.log(
    `  検査3 テロップ: ${platesChecked}枚の札の高さを測りました。` +
      `黒帯にいちばん近かったのは すきま ${Math.round(tightest)}px\n` +
      `        → ${tightestWhat}`,
  );
} else {
  console.log("  検査3 テロップ: 測れた札が0枚でした。検査が壊れている可能性があります");
}

console.log("\n" + "═".repeat(72));
if (!ngs.length && !warns.length) {
  console.log("機械で測れる範囲では、問題なしです。");
} else {
  console.log(`直すべきもの ${ngs.length}件 / 確認したいもの ${warns.length}件`);
}
console.log(
  "※この検査で見られないもの (人の目で見ること):\n" +
    "   絵の精巧さ・その時代らしさ・ものの大小関係・史実・伏線の絵の一致・人物の画風のブレ",
);
process.exit(ngs.length ? 1 : 0);
