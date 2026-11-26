// クリスマス回 A「サンタクロースは、だれが作ったのか」/ B「日本のクリスマスは、なぜこうなったのか」の共有部品。
// 正本: docs/santa-design-common.md「共有部品」の節 (名前と props はそこが正本。勝手に変えない)。
//
// ★ここにある物は、別々の絵師が別々の章で描く「同じ物」。毎回この部品を使い、描き直さない (絵のブレ禁止)。
// ★背景つきの部品 (XmasRoom / SnowTown) は 1920×1080 の舞台を <g> で返す。人は入れない (シーン側で重ねる)。
// ★小物・人物は x, y, s で置く <g>。x,y は「足元/底の中央」(Stocking だけは吊り下げ点)。
// ★明かりは「明るさがふわっと変わる」で表す。黒い図形を重ねた点滅で明かりを表さない。
// ★ロゴ・看板・商品名の文字は描かない。

import React from "react";
import { useCurrentFrame } from "remotion";
import { KRP, clamp01, easeOut, Person } from "./KarakuriScenes";
import { Frame } from "./HimaShared";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const INK = KRP.ink;

type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "hang" | "sit";
type PersonProps = React.ComponentProps<typeof Person>;

// ===== 色 (A・B 共通。シーン側でも使ってよい) =====
export const XP = {
  red: "#C8372D", // クリスマスの赤
  redDark: "#93251E",
  redLight: "#E0644F",
  green: "#3F7F4E", // もみの緑
  greenDark: "#2B5B38",
  greenDeep: "#1F4429",
  greenLight: "#5F9E62",
  gold: "#E2B83F", // 金
  goldDark: "#AE8A24",
  goldLight: "#F7DB82",
  snow: "#F7F9FC", // 雪の白
  snowShade: "#D7E1EE",
  night: "#24325E", // 夜の紺
  nightDeep: "#151E3E",
  nightLight: "#3D4F86",
  you: "#4E9A5C", // あなたの緑のセーター
  youDark: "#357243",
  // 炎・明かり
  fire: "#F2973A",
  fireCore: "#FFE28A",
  fireDeep: "#D9532B",
  warm: "#FFD98A",
  // 暖炉のれんが
  brick: "#B4553E",
  brickDark: "#8C3F2D",
  brickLight: "#C9705A",
  mortar: "#DCC7AC",
  // 木
  wood: "#A8743F",
  woodDark: "#7A5028",
  woodLight: "#C8955C",
  // 毛皮・毛 (トナカイ・1823年のサンタ)
  fur: "#8E5D36",
  furDark: "#663F21",
  furLight: "#BC8D5E",
  furPale: "#E6CFAE",
  antler: "#E3CFA4",
  antlerDark: "#B89C66",
  // 肌・ひげ
  cheek: "#F2A493",
  beard: "#FFFFFF",
  // 女の子の髪
  hairBrown: "#7A4A2A",
  hairBrownDark: "#5A341C",
} as const;

// ===== 小さな道具 =====
// 決まった乱数 (同じ i なら同じ値)
const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
// ふわっと明るさが変わる (0.55〜1)
const twinkle = (f: number, i: number, speed = 9) => 0.775 + 0.225 * Math.sin(f / speed + i * 1.93);

// 降る雪 (領域 x0..x1, y0..y1 に n 粒)。big: 粒の大きさ, speed: 落ちる速さ
export const SnowFall: React.FC<{
  f: number; n?: number; x0?: number; y0?: number; x1?: number; y1?: number;
  big?: number; speed?: number; seed?: number; opacity?: number;
}> = ({ f, n = 70, x0 = -40, y0 = -40, x1 = 1960, y1 = 1120, big = 1, speed = 1, seed = 1, opacity = 0.95 }) => {
  const w = x1 - x0, h = y1 - y0;
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const k = i + seed * 1000;
        const r = (3 + rnd(k) * 5) * big;
        const sp = (0.9 + rnd(k + 3) * 1.2) * speed * (r / (5 * big)) * 1.6;
        const y = y0 + (((rnd(k + 7) * h) + f * sp) % h);
        const x = x0 + ((rnd(k + 11) * w + Math.sin(f / (30 + rnd(k) * 20) + i) * 18 * big) % w + w) % w;
        return <circle key={i} cx={x} cy={y} r={r} fill={XP.snow} opacity={0.65 + rnd(k + 5) * 0.35} />;
      })}
    </g>
  );
};

// やわらかい光 (重ねた円。黒は使わない)
// 色ごとに同じ中身のグラデーションを使う (同じ id が何度出ても中身は同じなので安全)
const Glow: React.FC<{ x: number; y: number; r: number; color: string; o: number }> = ({ x, y, r, color, o }) => {
  const id = `xpGlow${color.replace(/[^0-9a-zA-Z]/g, "")}`;
  if (o <= 0.001) return null;
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={0.62} />
          <stop offset="0.35" stopColor={color} stopOpacity={0.36} />
          <stop offset="0.7" stopColor={color} stopOpacity={0.12} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={Math.min(o, 1.4)} />
    </g>
  );
};

// 5つの角の星の path (中心 0,0)
const starPath = (R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 - 90) * Math.PI / 180;
    const rr = i % 2 ? r : R;
    return `${i ? "L" : "M"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ") + " Z";

// 雪の結晶 (中心 0,0・半径 r)
const SnowCrystal: React.FC<{ x: number; y: number; r: number; color?: string; w?: number }> = ({ x, y, r, color = KRP.white, w = 4 }) => (
  <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth={w} strokeLinecap="round">
    {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-r} x2={0} y2={r} transform={`rotate(${a})`} />)}
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <g key={`b${a}`} transform={`rotate(${a})`}>
        <line x1={0} y1={-r * 0.55} x2={-r * 0.28} y2={-r * 0.8} />
        <line x1={0} y1={-r * 0.55} x2={r * 0.28} y2={-r * 0.8} />
      </g>
    ))}
  </g>
);

/* ===================================================================
 * XmasTree — もみの木 (A・B の背骨のツリー)
 *   x,y: 鉢の底の中央。s=1 で高さ約 640px (星のてっぺんまで)
 *   mode: "lights" 電飾 (lit に合わせて下から順に灯る・またたく) / "candle" ろうそく (炎がゆれる) / "none" 飾り玉だけ
 *   lit: 0〜1。lights は灯った電球の割合、candle は火のついたろうそくの割合。1 でてっぺんの星も光る
 * =================================================================== */
const TIERS = [
  { top: -330, b: -110, w: 232 },
  { top: -432, b: -228, w: 190 },
  { top: -524, b: -338, w: 146 },
  { top: -606, b: -440, w: 100 },
];
const tierPath = (top: number, b: number, w: number, dip = 22) => {
  const n = Math.max(3, Math.round(w / 46));
  const st = (2 * w) / n;
  let d = `M 0 ${top} C ${w * 0.28} ${top + (b - top) * 0.42} ${w * 0.72} ${b - 34} ${w} ${b}`;
  for (let j = 0; j < n; j++) d += ` Q ${w - st * (j + 0.5)} ${b + dip} ${w - st * (j + 1)} ${b}`;
  d += ` C ${-w * 0.72} ${b - 34} ${-w * 0.28} ${top + (b - top) * 0.42} 0 ${top} Z`;
  return d;
};
const BULB_COLORS = ["#FF6B5A", "#FFD45A", "#6FC3FF", "#8EE07A", "#FF9AD5"];
const ORN_COLORS: [string, string][] = [[XP.red, XP.redDark], [XP.gold, XP.goldDark], ["#4E7FC4", "#34578F"], [KRP.silver, KRP.grayDark]];

export const XmasTree: React.FC<{
  x: number; y: number; s?: number; f: number;
  mode?: "lights" | "candle" | "none"; lit?: number;
  star?: boolean; // てっぺんの星 (既定 true)
}> = ({ x, y, s = 1, f, mode = "lights", lit = 1, star = true }) => {
  const sway = Math.sin(f / 40) * 0.6;
  // 電飾のコード: 段ごとに左上→右下へたるむ曲線。電球はその上に並ぶ
  const wires = TIERS.map((t, k) => {
    const h = t.b - t.top;
    const p0: [number, number] = [-t.w * 0.74, t.b - h * 0.14];
    const p2: [number, number] = [t.w * 0.42, t.b - h * 0.5];
    const p1: [number, number] = [t.w * 0.0, t.b + 4];
    return { k, p0, p1, p2 };
  });
  const bulbs: { x: number; y: number; c: string; i: number }[] = [];
  let bi = 0;
  wires.forEach(({ k, p0, p1, p2 }) => {
    const m = 7 - k;
    for (let j = 0; j < m; j++) {
      const t = (j + 0.5) / m;
      const bx = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
      const by = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
      bulbs.push({ x: bx, y: by + 10, c: BULB_COLORS[bi % BULB_COLORS.length], i: bi });
      bi++;
    }
  });
  const NB = bulbs.length;
  const ornaments: { x: number; y: number; r: number; c: number }[] = [
    { x: -150, y: -150, r: 19, c: 0 }, { x: 40, y: -138, r: 21, c: 1 }, { x: 175, y: -128, r: 17, c: 2 },
    { x: -96, y: -262, r: 17, c: 1 }, { x: 110, y: -276, r: 18, c: 0 }, { x: -8, y: -300, r: 15, c: 3 },
    { x: -70, y: -372, r: 16, c: 2 }, { x: 72, y: -390, r: 15, c: 3 }, { x: -20, y: -466, r: 14, c: 0 },
    { x: 46, y: -498, r: 12, c: 1 },
  ];
  const candles = TIERS.flatMap((t, k) => [
    { x: -t.w * 0.86, y: t.b - 6, i: k * 3 }, { x: t.w * 0.86, y: t.b - 6, i: k * 3 + 1 },
    ...(k < 3 ? [{ x: t.w * 0.05, y: t.b + 8, i: k * 3 + 2 }] : []),
  ]);
  const NC = candles.length;
  const starOn = mode === "none" ? 0 : clamp01((lit - 0.85) / 0.15);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 鉢 (木の桶に金のたが) */}
      <path d="M -82 -96 L 82 -96 L 66 0 L -66 0 Z" fill={XP.wood} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -50 -92 L -42 -4 M 0 -94 L 0 -2 M 50 -92 L 42 -4" stroke={XP.woodDark} strokeWidth={3} opacity={0.6} />
      <rect x={-86} y={-104} width={172} height={16} rx={6} fill={XP.woodLight} stroke={INK} strokeWidth={5} />
      <path d="M -79 -66 L 79 -66" stroke={XP.goldDark} strokeWidth={9} />
      <path d="M -79 -66 L 79 -66" stroke={XP.gold} strokeWidth={4} />
      <path d="M -71 -22 L 71 -22" stroke={XP.goldDark} strokeWidth={9} />
      <path d="M -71 -22 L 71 -22" stroke={XP.gold} strokeWidth={4} />
      <ellipse cx={-48} cy={-70} rx={8} ry={4} fill={KRP.white} opacity={0.5} />
      {/* 幹 */}
      <rect x={-22} y={-150} width={44} height={56} fill={XP.woodDark} stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${sway} 0 -110)`}>
        {/* 枝の段 (下から。上の段が下の段に重なる) */}
        {TIERS.map((t, k) => (
          <g key={k}>
            {/* 重なりの影 (下の段に落ちる濃い緑) */}
            <path d={tierPath(t.top + 14, t.b + 14, t.w * 0.97)} fill={XP.greenDeep} opacity={0.75} />
            <path d={tierPath(t.top, t.b, t.w)} fill={XP.green} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            {/* 奥の枝の段差 (塗りの濃淡で) */}
            <path d={tierPath(t.top + (t.b - t.top) * 0.45, t.b - 4, t.w * 0.78, 16)} fill={XP.greenDark} opacity={0.55} />
            <path d={tierPath(t.top + (t.b - t.top) * 0.7, t.b - 2, t.w * 0.9, 18)} fill={XP.greenDark} opacity={0.45} />
            {/* 左の光の当たる面 */}
            <path d={`M -4 ${t.top + 18} C ${-t.w * 0.25} ${t.top + (t.b - t.top) * 0.45} ${-t.w * 0.55} ${t.b - 40} ${-t.w * 0.78} ${t.b - 14}
              Q ${-t.w * 0.55} ${t.b - 30} ${-t.w * 0.3} ${t.b - 22} C ${-t.w * 0.2} ${t.top + (t.b - t.top) * 0.6} ${-t.w * 0.08} ${t.top + (t.b - t.top) * 0.35} -4 ${t.top + 18} Z`}
              fill={XP.greenLight} opacity={0.75} />
            {/* 枝先のふさ (段の下の縁) */}
            {Array.from({ length: Math.round(t.w / 46) }, (_, j) => {
              const n = Math.round(t.w / 46);
              const cx = t.w - (2 * t.w / n) * (j + 0.5);
              return <ellipse key={j} cx={cx} cy={t.b + 4} rx={(t.w / n) * 0.55} ry={7} fill={XP.greenLight} opacity={0.35} />;
            })}
          </g>
        ))}
        {/* 飾り玉 (つやつき。ほんの少しゆれる) */}
        {ornaments.map((o, i) => {
          const [c, cd] = ORN_COLORS[o.c];
          const rot = Math.sin(f / 18 + i) * 6;
          return (
            <g key={i} transform={`rotate(${rot} ${o.x} ${o.y - o.r - 10})`}>
              <line x1={o.x} y1={o.y - o.r - 14} x2={o.x} y2={o.y - o.r} stroke={XP.goldDark} strokeWidth={2.5} />
              <circle cx={o.x} cy={o.y} r={o.r} fill={c} stroke={INK} strokeWidth={4} />
              <path d={`M ${o.x - o.r * 0.9} ${o.y + o.r * 0.25} A ${o.r} ${o.r} 0 0 0 ${o.x + o.r * 0.9} ${o.y + o.r * 0.25}
                Q ${o.x} ${o.y + o.r * 0.6} ${o.x - o.r * 0.9} ${o.y + o.r * 0.25} Z`} fill={cd} opacity={0.7} />
              <ellipse cx={o.x - o.r * 0.36} cy={o.y - o.r * 0.38} rx={o.r * 0.32} ry={o.r * 0.2} fill={KRP.white} opacity={0.85}
                transform={`rotate(-35 ${o.x - o.r * 0.36} ${o.y - o.r * 0.38})`} />
              <circle cx={o.x + o.r * 0.18} cy={o.y - o.r * 0.55} r={o.r * 0.08} fill={KRP.white} opacity={0.9} />
              <rect x={o.x - o.r * 0.36} y={o.y - o.r - 6} width={o.r * 0.72} height={8} rx={2} fill={XP.gold} stroke={INK} strokeWidth={2.5} />
            </g>
          );
        })}
        {/* 電飾 */}
        {mode === "lights" && (
          <g>
            {wires.map(({ k, p0, p1, p2 }) => (
              <g key={k}>
                <path d={`M ${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} stroke={XP.greenDeep} strokeWidth={5} fill="none" />
                <path d={`M ${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} stroke="#5E7A52" strokeWidth={2} fill="none" />
              </g>
            ))}
            {bulbs.map((b) => {
              const on = clamp01(lit * NB - b.i);
              const br = on * twinkle(f, b.i, 7);
              return (
                <g key={b.i}>
                  <Glow x={b.x} y={b.y + 4} r={30} color={b.c} o={br} />
                  <rect x={b.x - 5} y={b.y - 12} width={10} height={8} rx={2} fill={XP.greenDeep} stroke={INK} strokeWidth={2} />
                  <ellipse cx={b.x} cy={b.y + 3} rx={7.5} ry={10} fill="#D9D3C4" stroke={INK} strokeWidth={2.5} />
                  <ellipse cx={b.x} cy={b.y + 3} rx={7.5} ry={10} fill={b.c} opacity={0.25 + 0.75 * br} />
                  <ellipse cx={b.x - 2.5} cy={b.y - 1} rx={2.2} ry={3.5} fill={KRP.white} opacity={0.4 + 0.5 * br} />
                </g>
              );
            })}
          </g>
        )}
        {/* ろうそく */}
        {mode === "candle" && candles.map((c, n) => {
          const on = clamp01(lit * NC - n);
          const fl = 1 + 0.16 * Math.sin(f / 2.6 + c.i * 2.1) + 0.06 * Math.sin(f / 1.3 + c.i);
          const sk = Math.sin(f / 4 + c.i) * 7;
          return (
            <g key={n}>
              <path d={`M ${c.x - 12} ${c.y + 4} Q ${c.x} ${c.y + 14} ${c.x + 12} ${c.y + 4} L ${c.x + 9} ${c.y - 2} L ${c.x - 9} ${c.y - 2} Z`}
                fill={XP.gold} stroke={INK} strokeWidth={3} />
              <rect x={c.x - 6} y={c.y - 40} width={12} height={40} rx={3} fill={KRP.white} stroke={INK} strokeWidth={3} />
              <path d={`M ${c.x + 1} ${c.y - 40} q 4 8 2 14 q -3 3 -4 -2 Z`} fill={KRP.cream} stroke={INK} strokeWidth={1.5} />
              <line x1={c.x} y1={c.y - 40} x2={c.x} y2={c.y - 47} stroke={INK} strokeWidth={2.5} />
              {on > 0 && (
                <g opacity={on}>
                  <Glow x={c.x} y={c.y - 58} r={40} color={XP.warm} o={0.9 * fl} />
                  <g transform={`translate(${c.x} ${c.y - 46}) scale(1 ${fl}) skewX(${sk})`}>
                    <path d="M 0 -30 Q 9 -12 7 -4 Q 4 3 0 3 Q -4 3 -7 -4 Q -9 -12 0 -30 Z" fill={XP.fire} />
                    <path d="M 0 -18 Q 4 -8 3 -3 Q 1 1 0 1 Q -1 1 -3 -3 Q -4 -8 0 -18 Z" fill={XP.fireCore} />
                  </g>
                </g>
              )}
            </g>
          );
        })}
        {/* てっぺんの星 */}
        {star && (
          <g transform={`translate(0 -626) rotate(${Math.sin(f / 30) * 3})`}>
            <Glow x={0} y={0} r={110} color={XP.goldLight} o={starOn * twinkle(f, 3, 11)} />
            {starOn > 0 && Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={0} y1={-52} x2={0} y2={-76 - 8 * Math.sin(f / 8 + i)} stroke={XP.goldLight}
                strokeWidth={5} strokeLinecap="round" opacity={starOn * 0.8} transform={`rotate(${i * 45 + 22})`} />
            ))}
            <path d={starPath(46, 20)} fill={XP.gold} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d={starPath(30, 12)} fill={XP.goldLight} opacity={0.4 + 0.6 * starOn} />
            <ellipse cx={-10} cy={-14} rx={6} ry={3.5} fill={KRP.white} opacity={0.8} transform="rotate(-30 -10 -14)" />
          </g>
        )}
      </g>
    </g>
  );
};

/* ===================================================================
 * Present — プレゼントの箱
 *   x,y: 箱の底の中央。s=1 で 幅160・高さ150 (ふたまで)
 *   color: 包装紙の色 / ribbon: リボンの色
 *   wrap: "neat" きっちり (水玉と星の柄・まっすぐなリボン) / "messy" へたな包み (しわ・はみ出した紙・テープ・ゆがんだリボン)
 *   open: 0〜1。0〜0.6 で前の紙がやぶれて中の段ボールが見え、0.5〜1 でふたが外れて中から光
 * =================================================================== */
export const Present: React.FC<{
  x: number; y: number; s?: number; f: number;
  color?: string; ribbon?: string; open?: number; wrap?: "neat" | "messy";
  pattern?: string; // 柄の色 (省略時は白)
}> = ({ x, y, s = 1, f, color = XP.red, ribbon = XP.gold, open = 0, wrap = "neat", pattern = KRP.white }) => {
  const messy = wrap === "messy";
  const tear = clamp01(open / 0.6);
  const lift = easeOut(clamp01((open - 0.5) / 0.5));
  const rb = messy ? 26 : 0; // リボンの位置 (messy はずれる)
  const tilt = messy ? -4 : 0;
  // やぶれ穴 (ぎざぎざ)
  const hole = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const rr = (0.75 + 0.35 * rnd(i + 40)) * tear;
    return `${i ? "L" : "M"} ${(-28 + Math.cos(a) * 52 * rr).toFixed(1)} ${(-62 + Math.sin(a) * 40 * rr).toFixed(1)}`;
  }).join(" ") + " Z";
  const shade = "rgba(40,20,10,0.22)";
  const bow = (bx: number, by: number) => (
    <g>
      {/* 結び目から垂れるリボンの端 */}
      <path d={`M ${bx - 4} ${by + 4} Q ${bx - 22} ${by + 26} ${bx - 34} ${by + 42} L ${bx - 22} ${by + 46} L ${bx - 20} ${by + 34} Q ${bx - 10} ${by + 20} ${bx + 2} ${by + 6} Z`}
        fill={ribbon} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${bx + 4} ${by + 4} Q ${bx + 20} ${by + 24} ${bx + (messy ? 44 : 30)} ${by + (messy ? 30 : 44)} L ${bx + (messy ? 50 : 40)} ${by + (messy ? 22 : 38)} Q ${bx + 22} ${by + 14} ${bx + 6} ${by - 2} Z`}
        fill={ribbon} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {/* 左右の輪 */}
      <path d={`M ${bx} ${by} C ${bx - 30} ${by - (messy ? 22 : 40)} ${bx - 66} ${by - (messy ? 18 : 30)} ${bx - 52} ${by - 4} C ${bx - 44} ${by + 10} ${bx - 18} ${by + 6} ${bx} ${by} Z`}
        fill={ribbon} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${bx} ${by} C ${bx + 30} ${by - (messy ? 52 : 40)} ${bx + (messy ? 52 : 66)} ${by - (messy ? 44 : 30)} ${bx + 52} ${by - 4} C ${bx + 44} ${by + 10} ${bx + 18} ${by + 6} ${bx} ${by} Z`}
        fill={ribbon} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      {/* 輪の内側の影と、つや */}
      <path d={`M ${bx - 8} ${by - 2} C ${bx - 26} ${by - 18} ${bx - 42} ${by - 14} ${bx - 40} ${by - 6}`} stroke={shade} strokeWidth={6} fill="none" />
      <path d={`M ${bx + 8} ${by - 2} C ${bx + 26} ${by - 18} ${bx + 42} ${by - 14} ${bx + 40} ${by - 6}`} stroke={shade} strokeWidth={6} fill="none" />
      <path d={`M ${bx - 46} ${by - 14} q 6 -10 18 -12`} stroke={KRP.white} strokeWidth={3.5} fill="none" opacity={0.6} strokeLinecap="round" />
      {/* 結び目 */}
      <rect x={bx - 11} y={by - 11} width={22} height={20} rx={7} fill={ribbon} stroke={INK} strokeWidth={4.5} />
      <path d={`M ${bx - 6} ${by - 6} L ${bx - 6} ${by + 5}`} stroke={shade} strokeWidth={3} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
      {/* 箱の影 */}
      <ellipse cx={10} cy={2} rx={110} ry={12} fill={INK} opacity={0.15} />
      {/* 中からの光 (ふたが外れたとき) */}
      {lift > 0 && (
        <g opacity={lift}>
          <Glow x={10} y={-130} r={170} color={XP.goldLight} o={twinkle(f, 2, 8)} />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M ${-50 + i * 20} -124 L ${-110 + i * 40 + Math.sin(f / 10 + i) * 6} ${-260 - (i % 2) * 40} L ${-96 + i * 40} ${-262 - (i % 2) * 40} Z`}
              fill={XP.goldLight} opacity={0.35} />
          ))}
        </g>
      )}
      {/* 側面 */}
      <path d="M 80 -120 L 112 -138 L 112 -18 L 80 0 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 80 -120 L 112 -138 L 112 -18 L 80 0 Z" fill={shade} />
      <path d={`M ${96 + rb * 0.2} -129 L ${96 + rb * 0.2} -9`} stroke={ribbon} strokeWidth={14} />
      {/* 箱の中 (ふたが外れたら見える) */}
      {lift > 0 && (
        <g>
          <path d="M -80 -120 L -48 -138 L 112 -138 L 80 -120 Z" fill={XP.woodDark} stroke={INK} strokeWidth={4} />
          <path d="M -70 -122 L -44 -134 L 96 -134 L 74 -122 Z" fill={XP.goldLight} opacity={0.6 * lift} />
        </g>
      )}
      {/* 前の面 */}
      <rect x={-80} y={-120} width={160} height={120} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* 柄: 水玉と小さな星 (ふちの外に出さない) */}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => {
        const px = -62 + c * 31 + (r % 2) * 15;
        const py = -104 + r * 29;
        if (px > 70 || Math.abs(px - rb) < 18) return null;
        return (r + c) % 3 === 0
          ? <path key={`${r}${c}`} d={starPath(8, 3.5)} transform={`translate(${px} ${py})`} fill={pattern} opacity={0.75} />
          : <circle key={`${r}${c}`} cx={px} cy={py} r={4.5} fill={pattern} opacity={0.6} />;
      }))}
      {/* messy: しわ・はみ出した紙・テープ */}
      {messy && (
        <g>
          <path d="M -70 -20 L -40 -48 L -20 -30 M 30 -100 L 52 -76 L 40 -56 M -60 -100 L -36 -86" stroke={shade} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M -40 -48 L -20 -30" stroke={KRP.white} strokeWidth={2.5} opacity={0.45} transform="translate(2 -3)" />
          <path d="M -80 -14 L -104 6 L -90 12 L -84 0 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -80 -14 L -104 6 L -90 12 L -84 0 Z" fill={shade} />
          <path d="M 70 -122 L 84 -146 L 92 -128 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <rect x={-92} y={-74} width={30} height={14} fill="#F3EEDC" opacity={0.7} stroke={INK} strokeWidth={2} transform="rotate(-24 -77 -67)" />
          <rect x={52} y={-30} width={34} height={13} fill="#F3EEDC" opacity={0.7} stroke={INK} strokeWidth={2} transform="rotate(18 69 -24)" />
          <rect x={-8} y={-132} width={28} height={12} fill="#F3EEDC" opacity={0.7} stroke={INK} strokeWidth={2} transform="rotate(-8 6 -126)" />
        </g>
      )}
      {/* 縦のリボン */}
      <rect x={rb - 9} y={-120} width={18} height={120} fill={ribbon} stroke={INK} strokeWidth={4} />
      <rect x={rb - 5} y={-118} width={4} height={116} fill={KRP.white} opacity={0.35} />
      {/* やぶれ: 段ボールが見える穴と、めくれた紙の端 */}
      {tear > 0.02 && (
        <g>
          <path d={hole} fill="#C9A26A" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d={`M ${-70 * tear} ${-62 + 6} L ${30 * tear - 28} ${-62 + 6}`} stroke="#A9834E" strokeWidth={3} opacity={0.7} />
          {/* めくれた紙のきれはし (裏の白が見える) */}
          {[20, 95, 160, 230, 300].map((deg, i) => {
            const a = deg * Math.PI / 180;
            const ex = -28 + Math.cos(a) * 50 * tear, ey = -62 + Math.sin(a) * 38 * tear;
            const L = (16 + 8 * rnd(i + 60)) * tear;
            const nx = Math.cos(a), ny = Math.sin(a);
            return (
              <path key={i} d={`M ${ex - ny * 10 * tear} ${ey + nx * 10 * tear} L ${ex + nx * L - ny * 3} ${ey + ny * L + nx * 3}
                Q ${ex + nx * L * 0.4} ${ey + ny * L * 0.4} ${ex + ny * 10 * tear} ${ey - nx * 10 * tear} Z`}
                fill={i % 2 ? KRP.white : color} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            );
          })}
        </g>
      )}
      {/* ふた (lift で外れて右へ傾く) */}
      <g transform={`translate(${lift * 110} ${-lift * 150}) rotate(${lift * 28} 0 -135)`}>
        <path d="M -88 -150 L -56 -170 L 120 -170 L 88 -150 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -88 -150 L -56 -170 L 120 -170 L 88 -150 Z" fill={KRP.white} opacity={0.15} />
        <path d="M 88 -150 L 120 -170 L 120 -142 L 88 -122 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 88 -150 L 120 -170 L 120 -142 L 88 -122 Z" fill={shade} />
        <rect x={-88} y={-150} width={176} height={28} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-84} y={-147} width={168} height={5} fill={KRP.white} opacity={0.25} />
        <rect x={rb - 9} y={-150} width={18} height={28} fill={ribbon} stroke={INK} strokeWidth={4} />
        <path d={`M ${rb - 2} -150 L ${rb + 14} -170`} stroke={ribbon} strokeWidth={16} />
        <path d="M -72 -160 L 104 -160" stroke={ribbon} strokeWidth={12} transform={`translate(${rb * 0.3} 0)`} />
        {bow(rb + 14, -168)}
      </g>
    </g>
  );
};

/* ===================================================================
 * Stocking — 暖炉に吊るす靴下
 *   x,y: 吊り下げ点 (ひもの輪の上)。s=1 で 長さ約 250px。つま先は右向き
 *   content: "candy" 杖のあめと包んだあめ / "twig" 枝だけ (#47) / "present" 小さな箱 / "none" からっぽ (ぺたんこ)
 * =================================================================== */
export const Stocking: React.FC<{
  x: number; y: number; s?: number; f: number;
  content?: "candy" | "twig" | "present" | "none";
  color?: string; // 本体の色 (既定 赤)
  flip?: boolean; // つま先を左向きに
}> = ({ x, y, s = 1, f, content = "none", color = XP.red, flip = false }) => {
  const sway = Math.sin(f / 26) * 3;
  const full = content !== "none";
  const bulge = full ? 1.08 : 0.94;
  const leg = `M -44 52 L -46 170 Q -50 236 6 246 Q 70 256 104 228 Q 128 204 104 180 Q 82 164 44 166 L 44 52 Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${sway})`}>
      {/* ひもの輪 */}
      <path d="M -6 0 Q -18 18 -4 34 M 6 0 Q 18 18 4 34" stroke={XP.goldDark} strokeWidth={4} fill="none" />
      {/* 中身 (口から出ている物。靴下の後ろの層) */}
      {content === "candy" && (
        <g>
          <g transform="rotate(-14 -14 40)">
            <path d="M -14 60 L -14 -20 Q -14 -46 10 -46 Q 32 -46 32 -24" stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
            <path d="M -14 60 L -14 -20 Q -14 -46 10 -46 Q 32 -46 32 -24" stroke={KRP.white} strokeWidth={11} fill="none" strokeLinecap="round" />
            <path d="M -14 60 L -14 -20 Q -14 -46 10 -46 Q 32 -46 32 -24" stroke={XP.red} strokeWidth={11} fill="none" strokeDasharray="9 9" />
          </g>
          <g transform={`translate(24 -10) rotate(${20 + sway})`}>
            <path d="M -30 -10 L -16 0 L -30 10 Z M 30 -10 L 16 0 L 30 10 Z" fill={XP.gold} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <ellipse cx={0} cy={0} rx={18} ry={13} fill={XP.gold} stroke={INK} strokeWidth={3.5} />
            <path d="M -8 -9 L 8 9 M 0 -12 L 12 4" stroke={XP.goldLight} strokeWidth={3} />
          </g>
        </g>
      )}
      {content === "twig" && (
        <g stroke={INK} strokeLinecap="round" fill="none">
          {[[-20, -60, -30], [6, -76, 4], [26, -50, 26]].map(([bx, ty, a], i) => (
            <g key={i} transform={`rotate(${a as number * 0.4 + Math.sin(f / 20 + i) * 2} ${bx} 40)`}>
              <path d={`M ${bx} 50 L ${bx} ${ty}`} strokeWidth={9} />
              <path d={`M ${bx} 50 L ${bx} ${ty}`} stroke="#8A6A4A" strokeWidth={5} />
              <path d={`M ${bx} ${(ty as number) + 40} l -18 -22 M ${bx} ${(ty as number) + 20} l 16 -18`} strokeWidth={7} />
              <path d={`M ${bx} ${(ty as number) + 40} l -18 -22 M ${bx} ${(ty as number) + 20} l 16 -18`} stroke="#8A6A4A" strokeWidth={3.5} />
            </g>
          ))}
        </g>
      )}
      {content === "present" && (
        <g transform="rotate(-8 0 30)">
          <rect x={-30} y={-28} width={60} height={66} rx={3} fill="#4E7FC4" stroke={INK} strokeWidth={4} />
          <rect x={-5} y={-28} width={10} height={66} fill={XP.gold} stroke={INK} strokeWidth={2.5} />
          <path d="M 0 -28 C -14 -48 -30 -42 -22 -30 Z M 0 -28 C 14 -48 30 -42 22 -30 Z" fill={XP.gold} stroke={INK} strokeWidth={3} />
          <circle cx={-16} cy={-6} r={3.5} fill={KRP.white} opacity={0.7} />
          <circle cx={16} cy={14} r={3.5} fill={KRP.white} opacity={0.7} />
        </g>
      )}
      {/* 本体 */}
      <g transform={`scale(${bulge} 1)`}>
        <path d={leg} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* 編み目のしま (緑と白)・かかととつま先の色 */}
        <path d="M -45 112 L 44 112 L 44 128 L -45 128 Z" fill={XP.green} opacity={0.9} />
        <path d="M -45 136 L 44 136 L 44 144 L -45 144 Z" fill={KRP.white} opacity={0.85} />
        <path d="M -48 206 Q -50 236 6 246 Q 0 226 -10 212 Q -30 200 -48 206 Z" fill={KRP.white} opacity={0.9} />
        <path d="M 86 168 Q 128 186 110 220 Q 96 238 84 240 Q 98 210 86 168 Z" fill={KRP.white} opacity={0.9} />
        {/* 編みの小さな山形 (塗りの点で) */}
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
          <path key={`${r}${c}`} d={`M ${-30 + c * 22} ${70 + r * 14} l 6 6 l 6 -6`} stroke={XP.redDark} strokeWidth={3} fill="none" opacity={0.6} />
        )))}
        <path d={`M -36 160 Q -40 200 -20 220`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.3} strokeLinecap="round" />
        {!full && <path d="M -20 70 Q 0 80 20 70" stroke={XP.redDark} strokeWidth={4} fill="none" opacity={0.6} />}
        {/* 白いふわふわの口 */}
        <path d="M -56 22 Q -50 12 -36 16 Q -24 8 -10 15 Q 4 8 18 15 Q 32 8 44 16 Q 58 14 58 28 Q 62 44 54 56 Q 42 64 30 58 Q 16 66 2 58 Q -12 66 -26 58 Q -42 66 -54 54 Q -62 40 -56 22 Z"
          fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -44 50 Q -30 54 -20 48 M 6 50 Q 20 56 34 48" stroke={XP.snowShade} strokeWidth={4} fill="none" />
      </g>
    </g>
  );
};

/* ===================================================================
 * XmasRoom — 夜の居間の舞台 (1920×1080)。人は入れない (シーン側で重ねる)
 *   style: "west" 暖炉と煙突 (中央左 x≈760)・窓の外に雪 (右 x 1220〜1660) / "japan" こたつ (中央 x=960, 天板 y≈700)・ふすま・テレビ (右)
 *   era: "1800s" | "showa" | "now" (壁紙・窓・小物・テレビの形が変わる)
 *   lit: 部屋の明かり 0〜1 (0 は暗い夜。暖炉の火・テレビ・窓の外の明るさは残る)
 *   目安の置き場所: west の床は y≥780 (人の足元 y≈900〜980)、ツリーは窓の前 x≈1440, y≈900
 *                  japan はこたつのまわりに座らせる (天板の高さ y≈700)
 * =================================================================== */
const Flames: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const tongues = [
    { dx: -70, h: 120, w: 46, sp: 3.1 }, { dx: -26, h: 170, w: 58, sp: 2.6 }, { dx: 22, h: 150, w: 54, sp: 2.9 },
    { dx: 64, h: 110, w: 44, sp: 3.4 }, { dx: 0, h: 200, w: 66, sp: 2.3 },
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {tongues.map((t, i) => {
        const hh = t.h * (0.82 + 0.18 * Math.sin(f / t.sp + i * 1.7) + 0.06 * Math.sin(f / 1.4 + i));
        const lean = Math.sin(f / (t.sp * 2.2) + i) * 16;
        const d = (h: number, w: number) => `M ${t.dx - w / 2} 0 C ${t.dx - w / 2} ${-h * 0.4} ${t.dx - w * 0.15 + lean * 0.5} ${-h * 0.6} ${t.dx + lean} ${-h}
          C ${t.dx + w * 0.2 + lean * 0.4} ${-h * 0.62} ${t.dx + w / 2} ${-h * 0.4} ${t.dx + w / 2} 0 Z`;
        return (
          <g key={i}>
            <path d={d(hh, t.w)} fill={XP.fireDeep} opacity={0.95} />
            <path d={d(hh * 0.74, t.w * 0.72)} fill={XP.fire} />
            <path d={d(hh * 0.42, t.w * 0.42)} fill={XP.fireCore} />
          </g>
        );
      })}
      {/* 火の粉 */}
      {Array.from({ length: 6 }, (_, i) => {
        const p = ((f * 1.3 + i * 23) % 60) / 60;
        return <circle key={`s${i}`} cx={-50 + i * 20 + Math.sin(f / 7 + i) * 12} cy={-60 - p * 180} r={4 * (1 - p)} fill={XP.fireCore} opacity={1 - p} />;
      })}
    </g>
  );
};

const Bricks: React.FC<{ x0: number; y0: number; x1: number; y1: number; bw?: number; bh?: number; dark?: boolean }> = ({ x0, y0, x1, y1, bw = 72, bh = 30, dark }) => {
  const rows = Math.ceil((y1 - y0) / bh);
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? bw / 2 : 0;
    for (let c = -1; c * bw < x1 - x0; c++) {
      const bx = x0 + c * bw + off;
      const lx = Math.max(bx + 3, x0), rx = Math.min(bx + bw - 3, x1);
      const ty = y0 + r * bh + 3, by = Math.min(y0 + (r + 1) * bh - 3, y1);
      if (rx - lx < 4 || by - ty < 4) continue;
      const k = r * 31 + c;
      const col = dark ? (rnd(k) > 0.5 ? "#5A3226" : "#4C2A20") : (rnd(k) > 0.66 ? XP.brickLight : rnd(k) > 0.33 ? XP.brick : XP.brickDark);
      out.push(<rect key={`${r}_${c}`} x={lx} y={ty} width={rx - lx} height={by - ty} rx={3} fill={col} />);
    }
  }
  return (
    <g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={dark ? "#3A2219" : XP.mortar} />
      {out}
    </g>
  );
};

const XmasRoomWest: React.FC<{ f: number; era: "1800s" | "showa" | "now"; lit: number }> = ({ f, era, lit }) => {
  const old = era === "1800s";
  const wall = old ? "#5F7358" : era === "showa" ? "#E0CFA8" : "#EEE3CC";
  const wallPat = old ? XP.goldDark : era === "showa" ? "#C9B488" : "#E2D3B5";
  const flick = 0.85 + 0.15 * Math.sin(f / 3.3) + 0.05 * Math.sin(f / 1.7);
  return (
    <g>
      <defs>
        <linearGradient id="xrwSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={XP.nightDeep} /><stop offset="1" stopColor={XP.nightLight} />
        </linearGradient>
        <clipPath id="xrwWin"><rect x={1250} y={190} width={380} height={390} /></clipPath>
      </defs>
      {/* 壁 */}
      <rect x={-40} y={-40} width={2000} height={820} fill={wall} />
      {/* 壁紙の柄 */}
      {old ? (
        <g fill={wallPat} opacity={0.45}>
          {Array.from({ length: 9 }, (_, r) => Array.from({ length: 17 }, (_, c) => (
            <path key={`${r}${c}`} d={`M ${c * 120 + (r % 2) * 60} ${r * 90 - 20} l 18 26 l -18 26 l -18 -26 Z`} />
          )))}
        </g>
      ) : (
        <g fill={wallPat} opacity={0.6}>
          {Array.from({ length: 33 }, (_, i) => <rect key={i} x={i * 60 - 20} y={-40} width={era === "showa" ? 10 : 22} height={820} />)}
        </g>
      )}
      {/* 腰板 (1800s・showa) と幅木 */}
      {era !== "now" && (
        <g>
          <rect x={-40} y={580} width={2000} height={200} fill={old ? "#7B5532" : "#B58A5A"} />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={i * 170 + 10} y={606} width={140} height={150} rx={4} fill="none" stroke={old ? "#5C3E22" : "#94703F"} strokeWidth={5} />
          ))}
          <rect x={-40} y={572} width={2000} height={16} fill={old ? "#5C3E22" : "#94703F"} stroke={INK} strokeWidth={4} />
        </g>
      )}
      <rect x={-40} y={760} width={2000} height={24} fill={era === "now" ? KRP.white : "#5C3E22"} stroke={INK} strokeWidth={5} />
      {/* 床 (板張り) */}
      <rect x={-40} y={784} width={2000} height={340} fill={old ? "#8A6038" : XP.woodLight} />
      {Array.from({ length: 7 }, (_, r) => (
        <g key={r}>
          <line x1={-40} y1={784 + r * 50} x2={1960} y2={784 + r * 50} stroke={old ? "#6B4826" : XP.wood} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, c) => (
            <line key={c} x1={(c * 360 + r * 140) % 2000} y1={784 + r * 50} x2={(c * 360 + r * 140) % 2000} y2={834 + r * 50}
              stroke={old ? "#6B4826" : XP.wood} strokeWidth={4} />
          ))}
        </g>
      ))}
      {/* じゅうたん */}
      <ellipse cx={760} cy={960} rx={430} ry={90} fill={XP.redDark} stroke={INK} strokeWidth={5} />
      <ellipse cx={760} cy={960} rx={392} ry={72} fill={XP.red} />
      <ellipse cx={760} cy={960} rx={350} ry={58} fill="none" stroke={XP.gold} strokeWidth={6} strokeDasharray="22 12" />
      {/* 煙突 (れんがの胸壁) */}
      <Bricks x0={540} y0={-40} x1={980} y1={452} />
      <rect x={540} y={-40} width={440} height={492} fill="none" stroke={INK} strokeWidth={6} />
      <rect x={540} y={-40} width={60} height={492} fill={INK} opacity={0.12} />
      {/* マントルピース (棚) */}
      <rect x={470} y={442} width={580} height={40} rx={6} fill={old ? "#6B4826" : XP.wood} stroke={INK} strokeWidth={6} />
      <rect x={478} y={446} width={564} height={8} fill={KRP.white} opacity={0.2} />
      <path d="M 500 482 L 1020 482 L 1004 500 L 516 500 Z" fill={old ? "#5C3E22" : XP.woodDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {[530, 990].map((cx) => <path key={cx} d={`M ${cx - 20} 500 L ${cx + 20} 500 L ${cx + 10} 540 L ${cx - 10} 540 Z`} fill={old ? "#5C3E22" : XP.woodDark} stroke={INK} strokeWidth={4} />)}
      {/* 靴下を吊るす金具 */}
      {[630, 760, 890].map((hx) => <path key={hx} d={`M ${hx} 494 l 0 14 q 0 8 8 6`} stroke={XP.goldDark} strokeWidth={5} fill="none" strokeLinecap="round" />)}
      {/* 暖炉のまわり (れんが) */}
      <Bricks x0={540} y0={500} x1={980} y1={822} />
      <rect x={540} y={500} width={440} height={322} fill="none" stroke={INK} strokeWidth={6} />
      {/* 火床 (アーチの口) */}
      <path d="M 630 822 L 630 650 Q 630 600 680 600 L 840 600 Q 890 600 890 650 L 890 822 Z" fill="#2E1C15" stroke={INK} strokeWidth={7} />
      <clipPath id="xrwBox"><path d="M 636 822 L 636 652 Q 636 606 682 606 L 838 606 Q 884 606 884 652 L 884 822 Z" /></clipPath>
      <g clipPath="url(#xrwBox)">
        <Bricks x0={636} y0={606} x1={884} y1={822} bw={56} bh={24} dark />
        <Glow x={760} y={790} r={220} color={XP.fire} o={flick} />
        <Flames x={760} y={790} s={0.82} f={f} />
      </g>
      {/* 薪と台 */}
      <g>
        <rect x={672} y={778} width={176} height={26} rx={13} fill="#6E4526" stroke={INK} strokeWidth={4} transform="rotate(-6 760 791)" />
        <rect x={680} y={786} width={166} height={24} rx={12} fill="#8A5A34" stroke={INK} strokeWidth={4} transform="rotate(7 760 798)" />
        <ellipse cx={842} cy={802} rx={10} ry={12} fill="#C9A26A" stroke={INK} strokeWidth={3} />
        <ellipse cx={842} cy={802} rx={4} ry={5} fill="#A9834E" />
        <path d="M 660 816 L 860 816" stroke="#3A3A3A" strokeWidth={8} strokeLinecap="round" />
        <circle cx={672} cy={798} r={10} fill={XP.gold} stroke={INK} strokeWidth={3} />
        <circle cx={848} cy={798} r={10} fill={XP.gold} stroke={INK} strokeWidth={3} />
        {/* おき火 */}
        {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={690 + i * 22} cy={812} r={5} fill={XP.fire} opacity={0.6 + 0.4 * Math.sin(f / 5 + i * 2)} />)}
      </g>
      {/* 炉床の石 */}
      <rect x={500} y={822} width={520} height={40} rx={4} fill="#B9B1A4" stroke={INK} strokeWidth={6} />
      <path d="M 630 822 L 620 862 M 760 822 L 760 862 M 890 822 L 900 862" stroke="#958C7E" strokeWidth={4} />
      {/* マントルピースの上の小物 */}
      <g>
        {/* 置き時計 */}
        <rect x={730} y={366} width={64} height={76} rx={10} fill={old ? "#5C3E22" : XP.woodDark} stroke={INK} strokeWidth={5} />
        <circle cx={762} cy={398} r={22} fill={KRP.cream} stroke={INK} strokeWidth={4} />
        <line x1={762} y1={398} x2={762} y2={382} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <line x1={762} y1={398} x2={774} y2={402} stroke={INK} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${(f * 0.2) % 360} 762 398)`} />
        {old ? (
          // 燭台2本 (ろうそくの炎がゆれる)
          [600, 920].map((cx, i) => (
            <g key={cx}>
              <path d={`M ${cx - 20} 442 Q ${cx} 430 ${cx + 20} 442 Z M ${cx - 5} 432 L ${cx - 5} 396 L ${cx + 5} 396 L ${cx + 5} 432 Z`} fill={XP.gold} stroke={INK} strokeWidth={3.5} />
              <rect x={cx - 7} y={340} width={14} height={58} rx={3} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
              <Glow x={cx} y={322} r={70} color={XP.warm} o={0.8 * flick} />
              <g transform={`translate(${cx} 338) scale(1 ${0.9 + 0.15 * Math.sin(f / 2.4 + i * 3)}) skewX(${Math.sin(f / 4 + i) * 6})`}>
                <path d="M 0 -26 Q 8 -10 6 -3 Q 3 3 0 3 Q -3 3 -6 -3 Q -8 -10 0 -26 Z" fill={XP.fire} />
                <path d="M 0 -15 Q 3 -7 2 -2 Q 0 1 -2 -2 Q -3 -7 0 -15 Z" fill={XP.fireCore} />
              </g>
            </g>
          ))
        ) : (
          <g>
            {/* 写真立て (中は山の絵) と小さな鉢植え */}
            <rect x={586} y={368} width={74} height={74} rx={4} fill={XP.gold} stroke={INK} strokeWidth={4.5} />
            <rect x={596} y={378} width={54} height={54} fill="#BFD7E8" />
            <path d="M 596 432 L 616 404 L 630 420 L 640 410 L 650 432 Z" fill={XP.greenLight} />
            <path d="M 890 442 L 896 412 L 944 412 L 950 442 Z" fill={XP.brickLight} stroke={INK} strokeWidth={4} />
            <path d="M 920 412 Q 900 380 908 360 Q 920 384 920 412 Q 930 376 950 368 Q 942 396 920 412" fill={XP.green} stroke={INK} strokeWidth={3.5} />
          </g>
        )}
      </g>
      {/* 窓 (外は雪の夜) */}
      <g>
        <rect x={1250} y={190} width={380} height={390} fill="url(#xrwSky)" />
        <g clipPath="url(#xrwWin)">
          <circle cx={1560} cy={250} r={26} fill="#FFF4C8" opacity={0.9} />
          <path d="M 1250 520 L 1310 470 L 1370 520 Z M 1380 540 L 1460 476 L 1540 540 Z M 1530 520 L 1590 482 L 1650 520 Z" fill="#2E3A60" />
          <path d="M 1250 520 L 1310 470 L 1370 520 L 1360 512 L 1310 476 L 1260 512 Z M 1380 540 L 1460 476 L 1540 540 L 1528 530 L 1460 484 L 1392 530 Z" fill={XP.snow} opacity={0.9} />
          {[1300, 1460, 1588].map((wx) => <rect key={wx} x={wx} y={510} width={18} height={18} fill={XP.warm} opacity={twinkle(f, wx, 13)} />)}
          <rect x={1250} y={540} width={380} height={40} fill={XP.snow} />
          <SnowFall f={f} n={40} x0={1250} y0={170} x1={1630} y1={590} big={0.8} seed={3} />
        </g>
        {/* 窓枠と桟 */}
        <rect x={1250} y={190} width={380} height={390} fill="none" stroke={KRP.white} strokeWidth={22} />
        <rect x={1236} y={176} width={408} height={418} fill="none" stroke={INK} strokeWidth={6} />
        <rect x={1262} y={202} width={356} height={366} fill="none" stroke={INK} strokeWidth={4} />
        <g stroke={KRP.white} strokeWidth={12}>
          <line x1={1440} y1={196} x2={1440} y2={574} />
          <line x1={1256} y1={386} x2={1624} y2={386} />
          {old && <><line x1={1345} y1={196} x2={1345} y2={574} /><line x1={1535} y1={196} x2={1535} y2={574} /><line x1={1256} y1={290} x2={1624} y2={290} /><line x1={1256} y1={480} x2={1624} y2={480} /></>}
        </g>
        {/* 窓の下の角に積もった雪 */}
        <path d="M 1262 568 Q 1300 548 1340 560 Q 1440 540 1520 558 Q 1580 548 1618 568 Z" fill={XP.snow} opacity={0.95} />
        {/* 窓台 */}
        <rect x={1216} y={594} width={448} height={26} rx={4} fill={KRP.white} stroke={INK} strokeWidth={5} />
        {/* カーテン */}
        {[-1, 1].map((sd) => {
          const cx = sd < 0 ? 1236 : 1644;
          const sw = Math.sin(f / 40 + sd) * 4;
          const col = old ? XP.redDark : era === "showa" ? "#C98F4A" : XP.green;
          return (
            <g key={sd}>
              <path d={`M ${cx - sd * 40} 150 L ${cx + sd * 90} 150 Q ${cx + sd * (60 + sw)} 400 ${cx + sd * 30} 470 Q ${cx + sd * 60} 560 ${cx + sd * 70} 690 L ${cx - sd * 60} 690 Q ${cx - sd * 50} 400 ${cx - sd * 40} 150 Z`}
                fill={col} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <path d={`M ${cx + sd * 10} 160 Q ${cx + sd * 20} 400 ${cx} 680 M ${cx + sd * 50} 160 Q ${cx + sd * 40} 380 ${cx + sd * 26} 470`} stroke={INK} strokeWidth={3} opacity={0.25} fill="none" />
              <path d={`M ${cx - sd * 20} 170 Q ${cx - sd * 14} 400 ${cx - sd * 30} 680`} stroke={KRP.white} strokeWidth={8} opacity={0.18} fill="none" />
              <rect x={cx + sd * 10 - 30} y={456} width={60} height={20} rx={8} fill={XP.gold} stroke={INK} strokeWidth={3.5} transform={`rotate(${sd * 12} ${cx + sd * 10} 466)`} />
            </g>
          );
        })}
        <rect x={1150} y={138} width={580} height={16} rx={8} fill={old ? "#5C3E22" : XP.woodDark} stroke={INK} strokeWidth={4} />
      </g>
      {/* 今の部屋: 右端のスタンドの明かり */}
      {era === "now" && (
        <g>
          <line x1={1820} y1={360} x2={1820} y2={900} stroke={INK} strokeWidth={8} />
          <ellipse cx={1820} cy={904} rx={50} ry={12} fill={INK} />
          <path d="M 1760 360 L 1880 360 L 1850 280 L 1790 280 Z" fill={KRP.cream} stroke={INK} strokeWidth={5} />
          <Glow x={1820} y={340} r={200} color={XP.warm} o={lit} />
        </g>
      )}
      {/* 明かりを落とした夜の暗さ (暖炉の火は下で上から足す) */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={XP.nightDeep} opacity={(1 - lit) * 0.58} />
      {/* 暖炉の火の明かり (床・壁に) */}
      <Glow x={760} y={760} r={620} color={XP.fire} o={(0.35 + 0.45 * (1 - lit)) * flick} />
      <g opacity={(1 - lit) * 0.7}>
        <g clipPath="url(#xrwBox)"><Flames x={760} y={790} s={0.82} f={f} /></g>
      </g>
    </g>
  );
};

const Mikan: React.FC<{ x: number; y: number; r?: number; leaf?: boolean }> = ({ x, y, r = 22, leaf }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#F0922E" stroke={INK} strokeWidth={4} />
    <path d={`M ${x - r * 0.8} ${y + r * 0.3} A ${r} ${r} 0 0 0 ${x + r * 0.8} ${y + r * 0.3} Q ${x} ${y + r * 0.6} ${x - r * 0.8} ${y + r * 0.3} Z`} fill="#C96E1C" opacity={0.6} />
    <ellipse cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.3} ry={r * 0.18} fill={KRP.white} opacity={0.6} transform={`rotate(-30 ${x - r * 0.35} ${y - r * 0.4})`} />
    {[[-0.2, 0.1], [0.3, 0.2], [0.1, 0.5], [0.45, -0.2]].map(([a, b], i) => <circle key={i} cx={x + a * r} cy={y + b * r} r={1.6} fill="#C96E1C" />)}
    <circle cx={x} cy={y - r + 3} r={3.5} fill="#6E8A3A" />
    {leaf && <path d={`M ${x} ${y - r + 3} Q ${x + 14} ${y - r - 14} ${x + 26} ${y - r - 6} Q ${x + 14} ${y - r + 4} ${x} ${y - r + 3} Z`} fill={XP.greenLight} stroke={INK} strokeWidth={2.5} />}
  </g>
);

const XmasRoomJapan: React.FC<{ f: number; era: "1800s" | "showa" | "now"; lit: number }> = ({ f, era, lit }) => {
  const showa = era === "showa";
  const old = era === "1800s";
  const tvOn = !old;
  // テレビの光 (画面の明るさがふわっと変わる)
  const tvHue = ["#9FC8F0", "#BFE3C8", "#F0D7A0", "#C8B8F0"][Math.floor(f / 45) % 4];
  const tvB = 0.75 + 0.25 * Math.sin(f / 5) * Math.sin(f / 13);
  const lampSw = Math.sin(f / 35) * 2;
  return (
    <g>
      <defs>
        <linearGradient id="xrjSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={XP.nightDeep} /><stop offset="1" stopColor={XP.nightLight} />
        </linearGradient>
        <clipPath id="xrjGlass"><rect x={990} y={400} width={300} height={170} /></clipPath>
      </defs>
      {/* 土壁 */}
      <rect x={-40} y={-40} width={2000} height={760} fill="#E3D3AF" />
      {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={rnd(i) * 1960} cy={rnd(i + 9) * 700} r={2 + rnd(i + 2) * 2} fill="#CDBB92" opacity={0.6} />)}
      {/* 天井と長押 */}
      <rect x={-40} y={-40} width={2000} height={60} fill="#9A7448" stroke={INK} strokeWidth={5} />
      <rect x={-40} y={140} width={2000} height={26} fill={XP.woodLight} stroke={INK} strokeWidth={5} />
      {/* 柱 */}
      {[100, 900, 1820].map((px) => <rect key={px} x={px} y={20} width={44} height={700} fill={XP.woodLight} stroke={INK} strokeWidth={5} />)}
      {[100, 900, 1820].map((px) => <rect key={`h${px}`} x={px + 6} y={20} width={8} height={700} fill={KRP.white} opacity={0.25} />)}
      {/* 欄間 (格子) */}
      <rect x={144} y={30} width={756} height={110} fill="#D9C49A" stroke={INK} strokeWidth={4} />
      <g stroke={XP.woodDark} strokeWidth={5}>
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={160 + i * 38} y1={34} x2={160 + i * 38} y2={136} />)}
        <line x1={144} y1={85} x2={900} y2={85} />
      </g>
      {/* ふすま 4枚 */}
      {Array.from({ length: 4 }, (_, i) => {
        const fx = 144 + i * 189;
        const base = showa ? "#E9E2CC" : old ? "#E8DDBE" : "#F1ECDF";
        return (
          <g key={i}>
            <rect x={fx} y={166} width={189} height={554} fill={base} stroke={INK} strokeWidth={5} />
            <rect x={fx + 6} y={172} width={177} height={542} fill="none" stroke="#3E3A36" strokeWidth={5} />
            {/* 柄: 波と雲 (昭和) / 竹 (明治) / 薄い格子 (今) */}
            {showa ? (
              <g fill="none" stroke="#9DB3A2" strokeWidth={5} opacity={0.8}>
                {Array.from({ length: 3 }, (_, r) => <path key={r} d={`M ${fx + 10} ${560 + r * 40} q 22 -26 44 0 t 44 0 t 44 0 t 44 0`} />)}
                <path d={`M ${fx + 40} ${280 + (i % 2) * 60} q 20 -30 50 -10 q 30 -20 50 10 q 20 10 0 26 l -100 0 q -20 -10 0 -26`} fill="#C9D5C7" />
              </g>
            ) : old ? (
              <g stroke="#7E9A5E" strokeWidth={8} opacity={0.6}>
                <line x1={fx + 60 + i * 8} y1={200} x2={fx + 60 + i * 8} y2={700} />
                <path d={`M ${fx + 60 + i * 8} 320 q 40 -20 70 -6 M ${fx + 60 + i * 8} 480 q -40 -20 -50 0`} fill="none" />
              </g>
            ) : (
              <g stroke="#E0D8C6" strokeWidth={3}>
                {Array.from({ length: 6 }, (_, r) => <line key={r} x1={fx + 12} y1={250 + r * 80} x2={fx + 177} y2={250 + r * 80} />)}
              </g>
            )}
            {/* 引き手 */}
            <circle cx={i % 2 ? fx + 30 : fx + 159} cy={450} r={14} fill="#3E3A36" />
            <circle cx={i % 2 ? fx + 30 : fx + 159} cy={450} r={8} fill={XP.goldDark} />
          </g>
        );
      })}
      {/* 雪見障子 (下のガラスから雪の夜が見える) */}
      <g>
        <rect x={980} y={180} width={320} height={400} fill="#F6F1E4" stroke={INK} strokeWidth={6} />
        <rect x={990} y={400} width={300} height={170} fill="url(#xrjSky)" />
        <g clipPath="url(#xrjGlass)">
          <path d="M 990 530 Q 1080 500 1160 520 Q 1240 500 1290 520 L 1290 570 L 990 570 Z" fill={XP.snow} />
          <path d="M 1040 520 l 0 -60 l 30 -30 l 30 30 l 0 60 Z" fill="#2E3A60" />
          <path d="M 1034 462 l 36 -36 l 36 36 l -10 0 l -26 -24 l -26 24 Z" fill={XP.snow} />
          <rect x={1062} y={480} width={16} height={16} fill={XP.warm} opacity={twinkle(f, 5, 12)} />
          <SnowFall f={f} n={26} x0={990} y0={380} x1={1290} y1={580} big={0.7} seed={8} />
        </g>
        <g stroke={XP.woodLight} strokeWidth={6}>
          {[1060, 1140, 1220].map((lx) => <line key={lx} x1={lx} y1={184} x2={lx} y2={400} />)}
          {[250, 320].map((ly) => <line key={ly} x1={984} y1={ly} x2={1296} y2={ly} />)}
          <line x1={984} y1={400} x2={1296} y2={400} strokeWidth={10} />
        </g>
        <rect x={980} y={180} width={320} height={400} fill="none" stroke={INK} strokeWidth={6} />
        <rect x={966} y={580} width={348} height={18} fill={XP.woodLight} stroke={INK} strokeWidth={4} />
      </g>
      {/* テレビ (昭和: 足つきの木の箱 / 今: 薄い画面) か、明治は行灯 */}
      {showa && (
        <g>
          <rect x={1420} y={380} width={330} height={260} rx={18} fill="#8A5A34" stroke={INK} strokeWidth={6} />
          <rect x={1426} y={386} width={318} height={10} rx={5} fill={KRP.white} opacity={0.2} />
          <rect x={1444} y={410} width={220} height={190} rx={34} fill="#55605E" stroke={INK} strokeWidth={5} />
          <rect x={1452} y={418} width={204} height={174} rx={30} fill={tvHue} opacity={tvB} />
          <path d="M 1466 432 q 30 -8 60 -4" stroke={KRP.white} strokeWidth={6} opacity={0.5} fill="none" strokeLinecap="round" />
          {[450, 510].map((dy) => <g key={dy}><circle cx={1706} cy={dy} r={18} fill="#D9C9A6" stroke={INK} strokeWidth={4} /><line x1={1706} y1={dy} x2={1706} y2={dy - 13} stroke={INK} strokeWidth={4} /></g>)}
          {Array.from({ length: 4 }, (_, i) => <line key={i} x1={1690} y1={556 + i * 12} x2={1724} y2={556 + i * 12} stroke={INK} strokeWidth={3} />)}
          {[1450, 1720].map((lx) => <line key={lx} x1={lx} y1={640} x2={lx + (lx < 1600 ? -8 : 8)} y2={720} stroke={INK} strokeWidth={9} strokeLinecap="round" />)}
          {/* 室内アンテナ */}
          <line x1={1585} y1={380} x2={1540} y2={290} stroke={INK} strokeWidth={4} />
          <line x1={1585} y1={380} x2={1640} y2={286} stroke={INK} strokeWidth={4} />
          <ellipse cx={1585} cy={378} rx={22} ry={8} fill={INK} />
        </g>
      )}
      {era === "now" && (
        <g>
          <rect x={1380} y={606} width={400} height={110} rx={6} fill={XP.woodLight} stroke={INK} strokeWidth={5} />
          <line x1={1580} y1={612} x2={1580} y2={710} stroke={XP.wood} strokeWidth={4} />
          <rect x={1390} y={340} width={380} height={236} rx={6} fill="#2F3338" stroke={INK} strokeWidth={6} />
          <rect x={1400} y={350} width={360} height={216} fill={tvHue} opacity={tvB} />
          <path d="M 1414 364 l 80 0" stroke={KRP.white} strokeWidth={5} opacity={0.4} strokeLinecap="round" />
          <rect x={1560} y={576} width={40} height={30} fill="#2F3338" stroke={INK} strokeWidth={4} />
        </g>
      )}
      {old && (
        <g>
          <rect x={1560} y={460} width={140} height={200} rx={6} fill="#F6EBC8" stroke={INK} strokeWidth={6} />
          <g stroke={XP.woodDark} strokeWidth={5}><line x1={1630} y1={460} x2={1630} y2={660} /><line x1={1560} y1={560} x2={1700} y2={560} /></g>
          {[1570, 1690].map((lx) => <line key={lx} x1={lx} y1={660} x2={lx} y2={720} stroke={XP.woodDark} strokeWidth={8} />)}
          <Glow x={1630} y={560} r={220} color={XP.warm} o={0.9 * twinkle(f, 1, 6)} />
        </g>
      )}
      {/* 畳 */}
      <rect x={-40} y={720} width={2000} height={400} fill="#CBBE85" />
      {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-40} y1={726 + i * 10} x2={1960} y2={726 + i * 10} stroke="#B9AB70" strokeWidth={2} />)}
      <g stroke="#3F5A3A" strokeWidth={12}>
        <line x1={-40} y1={724} x2={1960} y2={724} />
        <line x1={-40} y1={900} x2={1960} y2={900} />
        <line x1={480} y1={724} x2={300} y2={1120} />
        <line x1={1440} y1={724} x2={1620} y2={1120} />
        <line x1={960} y1={900} x2={960} y2={1120} />
      </g>
      {/* こたつ (布団・天板・みかん) */}
      <g>
        <ellipse cx={960} cy={980} rx={420} ry={40} fill={INK} opacity={0.15} />
        <path d="M 660 716 Q 610 840 600 960 Q 700 990 820 972 Q 960 1000 1100 972 Q 1220 990 1320 960 Q 1310 840 1260 716 Z"
          fill={showa ? "#B5463A" : old ? "#5A6A8E" : "#5B6B8C"} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* 布団の柄 */}
        {showa ? (
          <g>
            {Array.from({ length: 10 }, (_, i) => {
              const cx = 670 + (i % 5) * 140 + (Math.floor(i / 5) ? 70 : 0), cy = 790 + Math.floor(i / 5) * 100;
              return (
                <g key={i}>
                  {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={cx} cy={cy - 12} rx={8} ry={13} fill="#F2C2B4" transform={`rotate(${a} ${cx} ${cy})`} />)}
                  <circle cx={cx} cy={cy} r={6} fill={XP.gold} />
                </g>
              );
            })}
          </g>
        ) : (
          <g stroke="#7C8BAA" strokeWidth={8} opacity={0.8}>
            {[760, 860, 960, 1060, 1160].map((lx) => <line key={lx} x1={lx} y1={730} x2={lx + (lx - 960) * 0.18} y2={978} />)}
            {[800, 880].map((ly) => <line key={ly} x1={620} y1={ly} x2={1300} y2={ly} />)}
          </g>
        )}
        <path d="M 640 940 Q 700 960 820 950 M 1100 950 Q 1220 960 1290 940" stroke={INK} strokeWidth={3} opacity={0.3} fill="none" />
        {/* 天板 */}
        <path d="M 640 690 L 1280 690 L 1300 724 L 620 724 Z" fill={XP.wood} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 640 690 L 1280 690 L 1270 676 L 650 676 Z" fill={XP.woodLight} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 700 682 L 900 682" stroke={KRP.white} strokeWidth={4} opacity={0.4} strokeLinecap="round" />
        <path d="M 760 712 Q 860 706 960 712 Q 1060 718 1160 710" stroke={XP.woodDark} strokeWidth={3} fill="none" opacity={0.6} />
        {/* みかんのかご */}
        <ellipse cx={960} cy={676} rx={92} ry={18} fill={INK} opacity={0.18} />
        <Mikan x={918} y={640} />
        <Mikan x={962} y={632} leaf />
        <Mikan x={1004} y={642} />
        <Mikan x={940} y={606} r={20} />
        <Mikan x={984} y={604} r={20} />
        <path d="M 868 640 Q 872 680 960 680 Q 1048 680 1052 640 Z" fill="#C9A26A" stroke={INK} strokeWidth={5} />
        <g stroke="#A9834E" strokeWidth={3}>{Array.from({ length: 7 }, (_, i) => <line key={i} x1={884 + i * 26} y1={644} x2={888 + i * 25} y2={676} />)}</g>
        <path d="M 868 652 Q 960 664 1052 652" stroke="#A9834E" strokeWidth={3} fill="none" />
        {/* むいた皮 */}
        <path d="M 1120 690 q 10 -16 26 -10 q 14 -10 22 6 q 10 6 -4 8 q -22 6 -44 -4 Z" fill="#F0922E" stroke={INK} strokeWidth={3} />
      </g>
      {/* 天井の明かり */}
      {(showa || old) ? (
        <g transform={`rotate(${lampSw} 960 20)`}>
          <line x1={960} y1={20} x2={960} y2={60} stroke={INK} strokeWidth={4} />
          <path d="M 880 104 Q 960 50 1040 104 Z" fill={showa ? "#EAF2E4" : "#F6EBC8"} stroke={INK} strokeWidth={5} />
          <ellipse cx={960} cy={106} rx={80} ry={10} fill={showa ? "#BFD8C0" : XP.warm} stroke={INK} strokeWidth={4} />
          <line x1={986} y1={110} x2={986} y2={200} stroke={INK} strokeWidth={2.5} />
          <circle cx={986} cy={204} r={6} fill={XP.red} stroke={INK} strokeWidth={2} />
          <Glow x={960} y={130} r={260} color={XP.warm} o={lit} />
        </g>
      ) : (
        <g>
          <ellipse cx={960} cy={24} rx={160} ry={22} fill={KRP.white} stroke={INK} strokeWidth={5} />
          <Glow x={960} y={40} r={320} color="#FFF4D8" o={lit} />
        </g>
      )}
      {/* 夜の暗さ */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={XP.nightDeep} opacity={(1 - lit) * 0.58} />
      {/* テレビの光 (暗くても届く) */}
      {tvOn && <Glow x={1580} y={500} r={480} color={tvHue} o={tvB * (0.25 + 0.6 * (1 - lit))} />}
      {tvOn && (1 - lit) > 0.05 && (
        <rect x={showa ? 1452 : 1400} y={showa ? 418 : 350} width={showa ? 204 : 360} height={showa ? 174 : 216} rx={showa ? 30 : 0}
          fill={tvHue} opacity={tvB * (1 - lit) * 0.6} />
      )}
    </g>
  );
};

export const XmasRoom: React.FC<{
  f: number; style?: "west" | "japan"; era?: "1800s" | "showa" | "now"; lit?: number;
}> = ({ f, style = "west", era = "now", lit = 1 }) =>
  style === "japan" ? <XmasRoomJapan f={f} era={era} lit={clamp01(lit)} /> : <XmasRoomWest f={f} era={era} lit={clamp01(lit)} />;

/* ===================================================================
 * SnowTown — 雪の夜の町 (1920×1080)。人は入れない
 *   era: "1800s" | "showa" | "now" / place: "ny" (れんがの家並み→摩天楼) | "tokyo" (町家→電柱の商店街→ビルと電飾)
 *   道 (雪の地面) は y≥840。人の足元は y≈900〜1000 に置く。空は上半分 (サンタのソリを飛ばせる)
 * =================================================================== */
type BKind = "brick" | "brown" | "tower" | "machiya" | "shop" | "modern";
const winLight = (f: number, k: number) => (rnd(k) < 0.22 ? 0 : twinkle(f, k, 14 + rnd(k + 1) * 10));
const Building: React.FC<{ x: number; base: number; w: number; h: number; kind: BKind; f: number; k: number; far?: boolean }> = ({ x, base, w, h, kind, f, k, far }) => {
  const top = base - h;
  const sw = far ? 3 : 5;
  const body = kind === "brick" ? (rnd(k) > 0.5 ? "#9C4A38" : "#8A4234") : kind === "brown" ? "#7A5A48"
    : kind === "tower" ? (rnd(k) > 0.5 ? "#5C6A86" : "#6B6E80") : kind === "machiya" ? "#6E5236"
    : kind === "shop" ? (rnd(k) > 0.5 ? "#B9A88A" : "#9FA6A0") : (rnd(k) > 0.5 ? "#7D8BA6" : "#93A0B5");
  const win = (wx: number, wy: number, ww: number, wh: number, kk: number) => {
    const L = winLight(f, kk);
    return (
      <g key={kk}>
        <rect x={wx} y={wy} width={ww} height={wh} fill="#45507A" stroke={INK} strokeWidth={far ? 2 : 3} />
        <rect x={wx} y={wy} width={ww} height={wh} fill={XP.warm} opacity={L} />
      </g>
    );
  };
  const cols = Math.max(1, Math.floor((w - 20) / (kind === "tower" || kind === "modern" ? 34 : 56)));
  const rows = Math.max(1, Math.floor((h - (kind === "machiya" ? 90 : 50)) / (kind === "tower" || kind === "modern" ? 40 : 76)));
  const cw = (w - 20) / cols;
  const rh = kind === "tower" || kind === "modern" ? 40 : 76;
  return (
    <g>
      {kind === "machiya" ? (
        <g>
          {/* 町家: 格子の1階・瓦屋根2段 */}
          <rect x={x} y={top + 40} width={w} height={h - 40} fill={body} stroke={INK} strokeWidth={sw} />
          <path d={`M ${x - 18} ${top + 50} L ${x + 16} ${top} L ${x + w - 16} ${top} L ${x + w + 18} ${top + 50} Z`} fill="#6F7780" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
          <path d={`M ${x - 14} ${top + 46} L ${x + 18} ${top + 4} L ${x + w - 18} ${top + 4} L ${x + w + 14} ${top + 46} Q ${x + w / 2} ${top + 30} ${x - 14} ${top + 46} Z`} fill={XP.snow} />
          <rect x={x - 14} y={base - h * 0.46} width={w + 28} height={18} fill="#6F7780" stroke={INK} strokeWidth={sw} />
          <path d={`M ${x - 14} ${base - h * 0.46} Q ${x + w / 2} ${base - h * 0.46 - 14} ${x + w + 14} ${base - h * 0.46} Z`} fill={XP.snow} />
          <rect x={x + 14} y={base - h * 0.4} width={w - 28} height={h * 0.4 - 6} fill="#4A3826" stroke={INK} strokeWidth={sw - 1} />
          <rect x={x + 14} y={base - h * 0.4} width={w - 28} height={h * 0.4 - 6} fill={XP.warm} opacity={0.55 * twinkle(f, k, 11)} />
          <g stroke="#3A2A1A" strokeWidth={far ? 2 : 4}>
            {Array.from({ length: Math.floor((w - 28) / 14) }, (_, i) => <line key={i} x1={x + 20 + i * 14} y1={base - h * 0.4} x2={x + 20 + i * 14} y2={base - 6} />)}
          </g>
          {win(x + w * 0.25, top + 60, w * 0.5, h * 0.2, k * 10)}
          {/* 提灯 */}
          {!far && (
            <g transform={`rotate(${Math.sin(f / 22 + k) * 4} ${x + w - 30} ${base - h * 0.46 + 18})`}>
              <line x1={x + w - 30} y1={base - h * 0.46 + 18} x2={x + w - 30} y2={base - h * 0.46 + 30} stroke={INK} strokeWidth={3} />
              <Glow x={x + w - 30} y={base - h * 0.46 + 56} r={60} color="#FF9A6A" o={twinkle(f, k, 9)} />
              <ellipse cx={x + w - 30} cy={base - h * 0.46 + 56} rx={17} ry={26} fill="#E2553E" stroke={INK} strokeWidth={3.5} />
              <ellipse cx={x + w - 30} cy={base - h * 0.46 + 56} rx={10} ry={20} fill="#FFB38A" opacity={0.5 * twinkle(f, k, 9)} />
              <rect x={x + w - 40} y={base - h * 0.46 + 28} width={20} height={5} fill={INK} />
              <rect x={x + w - 40} y={base - h * 0.46 + 80} width={20} height={5} fill={INK} />
            </g>
          )}
        </g>
      ) : (
        <g>
          <rect x={x} y={top} width={w} height={h} fill={body} stroke={INK} strokeWidth={sw} />
          {/* れんがの目地 (横の線だけ・塗りの濃淡) */}
          {(kind === "brick" || kind === "brown") && Array.from({ length: Math.floor(h / 26) }, (_, i) => (
            <line key={i} x1={x + 2} y1={top + 13 + i * 26} x2={x + w - 2} y2={top + 13 + i * 26} stroke={INK} strokeWidth={1.5} opacity={0.18} />
          ))}
          <rect x={x} y={top} width={w * 0.14} height={h} fill={INK} opacity={0.12} />
          {/* 屋根の雪と軒 */}
          <rect x={x - 8} y={top - 12} width={w + 16} height={16} fill={kind === "tower" || kind === "modern" ? "#6B7288" : "#5A3A2A"} stroke={INK} strokeWidth={sw} />
          <path d={`M ${x - 10} ${top - 10} Q ${x + w * 0.2} ${top - 30} ${x + w * 0.45} ${top - 22} Q ${x + w * 0.7} ${top - 34} ${x + w + 10} ${top - 10} Q ${x + w + 14} ${top} ${x + w} ${top - 2} L ${x} ${top - 2} Q ${x - 14} ${top} ${x - 10} ${top - 10} Z`}
            fill={XP.snow} stroke={INK} strokeWidth={far ? 2 : 3} />
          {/* 煙突と煙 (19世紀・昭和のれんが) */}
          {(kind === "brick" || kind === "brown") && !far && (
            <g>
              <rect x={x + w * 0.7} y={top - 60} width={30} height={50} fill={XP.brickDark} stroke={INK} strokeWidth={4} />
              <rect x={x + w * 0.7 - 4} y={top - 66} width={38} height={14} fill={XP.snow} stroke={INK} strokeWidth={3} />
              {[0, 1, 2].map((j) => {
                const p = ((f * 0.6 + j * 30 + k * 13) % 90) / 90;
                return <circle key={j} cx={x + w * 0.7 + 15 + Math.sin(p * 6 + k) * 14 + p * 30} cy={top - 76 - p * 120} r={10 + p * 22} fill="#C9CDD8" opacity={0.5 * (1 - p)} />;
              })}
            </g>
          )}
          {/* 窓 */}
          {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
            const ww = kind === "tower" || kind === "modern" ? cw * 0.6 : cw * 0.5;
            const wh = kind === "tower" || kind === "modern" ? 22 : 44;
            return win(x + 10 + c * cw + (cw - ww) / 2, top + 24 + r * rh, ww, wh, k * 100 + r * 10 + c);
          }))}
          {/* 1階の店の窓 (shop/modern: 大きなガラス。文字は描かない) */}
          {(kind === "shop" || kind === "modern") && !far && (
            <g>
              <rect x={x + 10} y={base - 90} width={w - 20} height={80} fill="#45507A" stroke={INK} strokeWidth={4} />
              <rect x={x + 10} y={base - 90} width={w - 20} height={80} fill={XP.warm} opacity={0.85 * twinkle(f, k + 50, 10)} />
              {/* ショーウィンドウの中の品物 (箱・小さなツリー。文字なし) */}
              {Array.from({ length: Math.floor((w - 60) / 52) }, (_, j) => {
                const gx = x + 26 + j * 52;
                return j % 3 === 1 ? (
                  <path key={j} d={`M ${gx + 16} ${base - 74} L ${gx + 32} ${base - 22} L ${gx} ${base - 22} Z`} fill={XP.green} stroke={INK} strokeWidth={3} />
                ) : (
                  <g key={j}>
                    <rect x={gx} y={base - 50} width={32} height={30} fill={[XP.red, "#4E7FC4", XP.gold][j % 3]} stroke={INK} strokeWidth={3} />
                    <rect x={gx + 13} y={base - 50} width={6} height={30} fill={KRP.white} opacity={0.8} />
                  </g>
                );
              })}
              <rect x={x + w - 70} y={base - 90} width={48} height={84} fill="#6E5A44" stroke={INK} strokeWidth={4} />
              <rect x={x + w - 64} y={base - 82} width={36} height={40} fill={XP.warm} opacity={0.6} />
              {[0.33, 0.66].map((t) => <line key={t} x1={x + 10 + (w - 90) * t} y1={base - 90} x2={x + 10 + (w - 90) * t} y2={base - 10} stroke={INK} strokeWidth={4} />)}
              <path d={`M ${x + 4} ${base - 96} L ${x + w - 4} ${base - 96} L ${x + w + 10} ${base - 120} L ${x - 10} ${base - 120} Z`}
                fill={rnd(k + 2) > 0.5 ? XP.red : XP.green} stroke={INK} strokeWidth={4} />
              <path d={`M ${x - 10} ${base - 120} L ${x + w + 10} ${base - 120}`} stroke={XP.snow} strokeWidth={8} strokeLinecap="round" />
            </g>
          )}
          {/* 玄関の階段 (ニューヨークのれんがの家) */}
          {(kind === "brick" || kind === "brown") && !far && (
            <g>
              <rect x={x + w * 0.38} y={base - 92} width={w * 0.24} height={84} fill="#4A3020" stroke={INK} strokeWidth={4} />
              <Glow x={x + w * 0.5} y={base - 100} r={46} color={XP.warm} o={0.8} />
              <path d={`M ${x + w * 0.3} ${base} L ${x + w * 0.3} ${base - 10} L ${x + w * 0.7} ${base - 10} L ${x + w * 0.7} ${base} Z`} fill="#9A9488" stroke={INK} strokeWidth={3} />
              <path d={`M ${x + w * 0.3} ${base - 10} Q ${x + w * 0.5} ${base - 18} ${x + w * 0.7} ${base - 10}`} fill={XP.snow} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

const StreetLamp: React.FC<{ x: number; base: number; f: number; kind: "gas" | "pole" | "led"; k: number }> = ({ x, base, f, kind, k }) => {
  const top = base - (kind === "gas" ? 260 : 330);
  const b = twinkle(f, k, 12);
  return (
    <g>
      <Glow x={x} y={top + 20} r={kind === "led" ? 170 : 200} color={kind === "led" ? "#E8F2FF" : XP.warm} o={b} />
      <line x1={x} y1={base} x2={x} y2={top + 30} stroke={INK} strokeWidth={kind === "pole" ? 16 : 10} />
      {kind === "pole" && <line x1={x} y1={base} x2={x} y2={top + 30} stroke="#8E8A80" strokeWidth={9} />}
      {kind === "gas" ? (
        <g>
          <path d={`M ${x - 20} ${top + 30} L ${x - 26} ${top - 10} L ${x + 26} ${top - 10} L ${x + 20} ${top + 30} Z`} fill={XP.warm} stroke={INK} strokeWidth={4} />
          <path d={`M ${x - 32} ${top - 10} L ${x} ${top - 34} L ${x + 32} ${top - 10} Z`} fill="#3E4A3E" stroke={INK} strokeWidth={4} />
          <path d={`M ${x - 30} ${top - 12} L ${x} ${top - 32} L ${x + 30} ${top - 12} Z`} fill={XP.snow} opacity={0.9} />
        </g>
      ) : kind === "pole" ? (
        <g>
          <line x1={x - 60} y1={top + 50} x2={x + 60} y2={top + 50} stroke={INK} strokeWidth={6} />
          <path d={`M ${x} ${top + 40} q 40 0 50 24`} stroke={INK} strokeWidth={5} fill="none" />
          <ellipse cx={x + 52} cy={top + 70} rx={20} ry={10} fill={XP.warm} stroke={INK} strokeWidth={3} />
        </g>
      ) : (
        <g>
          <path d={`M ${x} ${top + 30} q 0 -30 40 -30`} stroke={INK} strokeWidth={8} fill="none" />
          <rect x={x + 30} y={top - 8} width={50} height={14} rx={6} fill="#E8F2FF" stroke={INK} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

export const SnowTown: React.FC<{
  f: number; era?: "1800s" | "showa" | "now"; place?: "ny" | "tokyo";
}> = ({ f, era = "1800s", place = "ny" }) => {
  const ny = place === "ny";
  const farKind: BKind = era === "now" ? (ny ? "tower" : "modern") : ny ? "brick" : era === "showa" ? "shop" : "machiya";
  const nearKinds: BKind[] = ny
    ? (era === "1800s" ? ["brick", "brown", "brick", "brown", "brick"] : era === "showa" ? ["brown", "shop", "brick", "shop", "brown"] : ["modern", "shop", "modern", "shop", "modern"])
    : (era === "1800s" ? ["machiya", "machiya", "machiya", "machiya", "machiya"] : era === "showa" ? ["shop", "machiya", "shop", "shop", "machiya"] : ["modern", "shop", "modern", "modern", "shop"]);
  const far = Array.from({ length: 11 }, (_, i) => ({
    x: i * 190 - 60 + rnd(i + 70) * 30, w: 150 + rnd(i + 71) * 40,
    h: era === "now" ? 320 + rnd(i + 72) * 300 : farKind === "machiya" ? 150 + rnd(i) * 30 : 220 + rnd(i + 72) * 120,
  }));
  const nearW = [340, 300, 380, 320, 360];
  let cx = -40;
  const near = nearKinds.map((kd, i) => {
    const w = nearW[i];
    const b = { x: cx, w, kind: kd, h: (kd === "machiya" ? 300 : kd === "modern" ? 520 : kd === "shop" ? 380 : 440) + Math.round((rnd(i + 31) - 0.5) * (kd === "machiya" ? 30 : 110)) };
    cx += w + 40;
    return b;
  });
  const lamp: "gas" | "pole" | "led" = era === "1800s" ? "gas" : era === "showa" ? "pole" : "led";
  return (
    <g>
      <defs>
        <linearGradient id="stSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={XP.nightDeep} /><stop offset="0.7" stopColor={XP.night} /><stop offset="1" stopColor={XP.nightLight} />
        </linearGradient>
      </defs>
      <rect x={-40} y={-40} width={2000} height={1160} fill="url(#stSky)" />
      {/* 星 (ふわっとまたたく) */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={rnd(i + 200) * 1920} cy={rnd(i + 300) * 420} r={1.5 + rnd(i + 400) * 2.5} fill={KRP.white} opacity={0.3 + 0.6 * twinkle(f, i, 10) * rnd(i + 500)} />
      ))}
      {/* 月 */}
      <Glow x={1640} y={170} r={160} color="#FFF4C8" o={0.7} />
      <circle cx={1640} cy={170} r={62} fill="#FFF4C8" stroke={INK} strokeWidth={4} />
      <circle cx={1620} cy={155} r={11} fill="#EADFAE" />
      <circle cx={1660} cy={192} r={7} fill="#EADFAE" />
      {/* 遠くの雪 */}
      <SnowFall f={f} n={60} big={0.5} speed={0.6} seed={21} opacity={0.7} />
      {/* 遠くの家並み (少し青く霞む) */}
      <g opacity={0.62}>
        {far.map((b, i) => <Building key={i} x={b.x} base={780} w={b.w} h={b.h} kind={farKind} f={f} k={i + 900} far />)}
      </g>
      {/* 教会の尖塔 (19世紀のニューヨーク) */}
      {ny && era === "1800s" && (
        <g opacity={0.8}>
          <rect x={1300} y={300} width={70} height={480} fill="#8A8478" stroke={INK} strokeWidth={4} />
          <path d="M 1290 300 L 1335 120 L 1380 300 Z" fill="#6F6A60" stroke={INK} strokeWidth={4} />
          <path d="M 1300 296 L 1335 150 L 1340 296 Z" fill={XP.snow} opacity={0.7} />
          <rect x={1320} y={380} width={30} height={50} rx={15} fill={XP.warm} opacity={twinkle(f, 7, 15)} stroke={INK} strokeWidth={3} />
        </g>
      )}
      {/* 地面の雪 */}
      <path d="M -40 830 Q 300 812 700 826 Q 1100 840 1500 820 Q 1760 812 1960 830 L 1960 1120 L -40 1120 Z" fill={XP.snow} />
      <path d="M -40 900 Q 500 880 960 900 Q 1400 920 1960 896 L 1960 960 Q 1400 980 960 962 Q 500 944 -40 962 Z" fill={XP.snowShade} opacity={0.7} />
      {/* わだちと足あと */}
      <path d="M -40 940 Q 900 920 1960 950 M -40 972 Q 900 952 1960 982" stroke="#C4CFDE" strokeWidth={6} fill="none" />
      {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={200 + i * 150} cy={1020 + (i % 2) * 18} rx={14} ry={6} fill="#C4CFDE" />)}
      {/* 手前の家並み */}
      {near.map((b, i) => <Building key={i} x={b.x} base={840} w={b.w} h={b.h} kind={b.kind} f={f} k={i + 10} />)}
      {/* 家の前に積もった雪 */}
      <path d="M -40 846 Q 200 826 480 842 Q 760 826 1000 844 Q 1300 828 1600 844 Q 1800 830 1960 846 L 1960 870 L -40 870 Z" fill={XP.snow} />
      {/* 電柱と電線 (昭和の東京) */}
      {!ny && era === "showa" && (
        <g>
          <path d="M -40 420 Q 500 470 1000 430 Q 1500 470 1960 420" stroke={INK} strokeWidth={3} fill="none" />
          <path d="M -40 450 Q 500 500 1000 460 Q 1500 500 1960 450" stroke={INK} strokeWidth={3} fill="none" />
        </g>
      )}
      {/* 今の東京: 街路樹の電飾 (青白くまたたく) */}
      {!ny && era === "now" && [300, 1000, 1700].map((tx, j) => (
        <g key={tx}>
          <rect x={tx - 10} y={760} width={20} height={110} fill={XP.woodDark} stroke={INK} strokeWidth={4} />
          <ellipse cx={tx} cy={700} rx={110} ry={110} fill="#2E4A3A" stroke={INK} strokeWidth={4} />
          <ellipse cx={tx - 20} cy={680} rx={70} ry={60} fill={XP.snow} opacity={0.25} />
          {Array.from({ length: 30 }, (_, i) => {
            const a = rnd(i + j * 50) * Math.PI * 2, rr = Math.sqrt(rnd(i + j * 50 + 1)) * 100;
            const b = twinkle(f, i + j * 30, 5);
            return (
              <g key={i}>
                <circle cx={tx + Math.cos(a) * rr} cy={700 + Math.sin(a) * rr} r={10} fill="#BFE0FF" opacity={0.25 * b} />
                <circle cx={tx + Math.cos(a) * rr} cy={700 + Math.sin(a) * rr} r={4} fill="#E8F4FF" opacity={0.5 + 0.5 * b} />
              </g>
            );
          })}
        </g>
      ))}
      {/* 街灯 */}
      {[640, 1380].map((lx, i) => <StreetLamp key={lx} x={lx} base={900} f={f} kind={lamp} k={i} />)}
      {/* 手前の大きな雪 */}
      <SnowFall f={f} n={50} big={1.3} speed={1.2} seed={22} />
    </g>
  );
};

/* ===================================================================
 * Sori — サンタのソリ (右向き)
 *   x,y: すべり木の底の中央。s=1 で 長さ約 460px・高さ約 260px
 *   fly: 0〜1。0 は雪の上に置いたまま、1 で前を上げて飛ぶ (ゆれ+後ろに金の粉の尾)
 *   bag: true でおもちゃの袋を積む
 *   サンタを乗せるとき: <Sori/> → <Santa pose="sit" x,y,lean は soriSeat(x,y,s,f,fly) の値/> → <Sori front/> (同じ x,y,s,f,fly) の順に描く。
 *   front=true は手前の板・鈴・すべり木だけを描くので、サンタの下半身が箱に隠れる
 * =================================================================== */
// ソリの座面の位置と傾き (Santa を乗せるとき用): <Santa x={p[0]} y={p[1]} lean={p[2]} pose="sit" s={同じ s} />
export const soriSeat = (x: number, y: number, s: number, f: number, fly = 0): [number, number, number] => {
  const fl = clamp01(fly);
  const bob = Math.sin(f / 9) * 10 * fl;
  const tilt = -10 * fl + Math.sin(f / 14) * 2 * fl;
  const a = tilt * Math.PI / 180;
  const lx = -40, ly = -150 + 100; // 回転の中心 (0,-100) からの座面の位置
  const rx = lx * Math.cos(a) - ly * Math.sin(a), ry = lx * Math.sin(a) + ly * Math.cos(a);
  return [x + rx * s, y - bob + (ry - 100) * s, tilt];
};
const soriBody = "M -200 -54 L -200 -238 Q -200 -258 -178 -258 L -142 -258 Q -120 -258 -120 -236 L -120 -154 L 118 -154 Q 176 -154 196 -110 Q 214 -62 160 -54 Z";
export const Sori: React.FC<{
  x: number; y: number; s?: number; f: number; fly?: number; bag?: boolean; front?: boolean;
}> = ({ x, y, s = 1, f, fly = 0, bag = false, front = false }) => {
  const fl = clamp01(fly);
  const bob = Math.sin(f / 9) * 10 * fl;
  const tilt = -10 * fl + Math.sin(f / 14) * 2 * fl;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${s})`}>
      {/* 金の粉の尾 (飛ぶとき) */}
      {fl > 0 && !front && Array.from({ length: 16 }, (_, i) => {
        const p = ((f * 0.04 + i / 16) % 1);
        const tx = -230 - p * 520, ty = -40 + p * 90 + Math.sin(p * 12 + i) * 24;
        return (
          <g key={i} opacity={fl * (1 - p)} transform={`translate(${tx} ${ty}) rotate(${f * 3 + i * 30}) scale(${1 - p * 0.6})`}>
            <path d={starPath(12, 5)} fill={XP.goldLight} />
          </g>
        );
      })}
      <g transform={`rotate(${tilt} 0 -100)`}>
        {/* 奥のすべり木 */}
        {!front && <g><path d="M -186 -12 L 186 -12 Q 262 -12 262 -82 Q 262 -120 228 -120 Q 200 -120 204 -96 Q 208 -78 228 -82" stroke={INK} strokeWidth={15} fill="none" strokeLinecap="round" />
        <path d="M -186 -12 L 186 -12 Q 262 -12 262 -82 Q 262 -120 228 -120 Q 200 -120 204 -96 Q 208 -78 228 -82" stroke={KRP.grayDark} strokeWidth={8} fill="none" strokeLinecap="round" /></g>}
        {/* おもちゃの袋 */}
        {bag && !front && (
          <g transform={`rotate(${Math.sin(f / 16) * 2} -60 -160)`}>
            {/* 袋の口から出ているおもちゃ */}
            <g transform="translate(-92 -330) rotate(-14)">
              <rect x={-24} y={-20} width={48} height={40} rx={6} fill={XP.red} stroke={INK} strokeWidth={4} />
              <ellipse cx={0} cy={-20} rx={24} ry={8} fill={KRP.white} stroke={INK} strokeWidth={4} />
              <path d="M -24 -6 L 24 10 M -24 10 L 24 -6" stroke={XP.gold} strokeWidth={3.5} />
            </g>
            <g transform="translate(-20 -344) rotate(12)">
              <path d="M -8 30 L -8 -8 Q -8 -30 14 -30 Q 32 -26 30 -8 L 22 -2 L 8 -6 L 8 30 Z" fill={XP.woodLight} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -6 -18 Q -2 -40 6 -30" fill={XP.woodDark} stroke={INK} strokeWidth={3} />
              <circle cx={12} cy={-18} r={3.5} fill={INK} />
            </g>
            <g transform="translate(30 -320) rotate(20)">
              <circle cx={0} cy={0} r={22} fill="#C9935A" stroke={INK} strokeWidth={4} />
              <circle cx={-16} cy={-18} r={9} fill="#C9935A" stroke={INK} strokeWidth={3.5} />
              <circle cx={16} cy={-18} r={9} fill="#C9935A" stroke={INK} strokeWidth={3.5} />
              <circle cx={-7} cy={-3} r={3} fill={INK} /><circle cx={7} cy={-3} r={3} fill={INK} />
              <ellipse cx={0} cy={7} rx={7} ry={5} fill={XP.furPale} />
            </g>
            <path d="M -160 -150 Q -190 -230 -130 -290 Q -60 -310 20 -296 Q 80 -270 70 -200 Q 64 -160 40 -150 Z" fill="#B0703A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <path d="M -140 -200 Q -100 -190 -60 -210 M -10 -180 Q 20 -220 40 -200" stroke={INK} strokeWidth={3.5} opacity={0.35} fill="none" />
            <path d="M -150 -160 Q -170 -230 -130 -278" stroke={KRP.white} strokeWidth={7} opacity={0.2} fill="none" />
            <path d="M -130 -290 Q -60 -312 20 -296 Q -40 -284 -130 -290 Z" fill="#8A5428" />
          </g>
        )}
        {/* 本体 (木の箱・木目・金の縁) */}
        <path d={soriBody} fill={XP.red} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -190 -64 L -190 -230 Q -190 -248 -176 -248 L -150 -248" stroke={KRP.white} strokeWidth={6} opacity={0.22} fill="none" />
        {/* 木目 (板の継ぎ目と節) */}
        <g stroke={XP.redDark} strokeWidth={3.5} fill="none" opacity={0.8}>
          <path d="M -196 -120 Q -100 -126 0 -118 Q 100 -112 186 -118" />
          <path d="M -196 -90 Q -80 -84 40 -92 Q 120 -96 200 -84" />
          <path d="M -160 -200 Q -150 -170 -160 -140" />
          <ellipse cx={60} cy={-104} rx={12} ry={6} />
          <ellipse cx={-140} cy={-72} rx={9} ry={4.5} />
        </g>
        {/* 金の縁取りと渦の飾り */}
        <path d="M -200 -54 L 160 -54 Q 214 -62 196 -110" stroke={XP.goldDark} strokeWidth={11} fill="none" strokeLinecap="round" />
        <path d="M -200 -54 L 160 -54 Q 214 -62 196 -110" stroke={XP.gold} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M -120 -154 L 118 -154 Q 176 -154 196 -110" stroke={XP.goldDark} strokeWidth={10} fill="none" />
        <path d="M -120 -154 L 118 -154 Q 176 -154 196 -110" stroke={XP.gold} strokeWidth={5} fill="none" />
        <path d="M -40 -110 q 0 -26 26 -26 q 22 0 22 20 q 0 16 -16 16 q -12 0 -12 -10 M 30 -110 q 0 -26 -26 -26" stroke={XP.gold} strokeWidth={6} fill="none" strokeLinecap="round" />
        <circle cx={-14} cy={-118} r={6} fill={XP.goldLight} stroke={INK} strokeWidth={2.5} />
        {/* 背もたれの赤い座ぶとん */}
        {!front && <rect x={-120} y={-170} width={170} height={22} rx={11} fill={XP.redDark} stroke={INK} strokeWidth={5} />}
        {/* 金具 (すべり木との支え) */}
        {[-150, -30, 110].map((sx) => (
          <g key={sx}>
            <rect x={sx - 7} y={-56} width={14} height={50} fill={KRP.grayDark} stroke={INK} strokeWidth={4} />
            <circle cx={sx} cy={-44} r={4} fill={KRP.silver} stroke={INK} strokeWidth={2} />
          </g>
        ))}
        {/* 鈴の帯 */}
        <path d="M -190 -78 Q 0 -66 186 -78" stroke="#6E4526" strokeWidth={10} fill="none" />
        {[-150, -80, -10, 60, 130].map((bx, i) => {
          const r = Math.sin(f / 4 + i * 1.3) * (8 + 14 * fl);
          return (
            <g key={bx} transform={`rotate(${r} ${bx} -74)`}>
              <circle cx={bx} cy={-58} r={13} fill={XP.gold} stroke={INK} strokeWidth={3.5} />
              <path d={`M ${bx - 8} -54 L ${bx + 8} -54`} stroke={INK} strokeWidth={3} />
              <circle cx={bx} cy={-50} r={3} fill={INK} />
              <ellipse cx={bx - 4} cy={-63} rx={4} ry={2.5} fill={KRP.white} opacity={0.8} />
            </g>
          );
        })}
        {/* 手前のすべり木 (金属の渦巻き) */}
        <path d="M -210 0 L 172 0 Q 250 0 250 -70 Q 250 -110 214 -110 Q 186 -110 190 -84 Q 194 -66 214 -70" stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
        <path d="M -210 0 L 172 0 Q 250 0 250 -70 Q 250 -110 214 -110 Q 186 -110 190 -84 Q 194 -66 214 -70" stroke={KRP.silver} strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M -200 -3 L 160 -3" stroke={KRP.white} strokeWidth={3} opacity={0.7} />
        {/* 雪の上なら、すべり木のまわりに雪 */}
        {fl < 0.5 && <path d="M -230 6 Q -200 -10 -160 4 Q -60 -6 40 4 Q 140 -8 200 6 Z" fill={XP.snow} opacity={1 - fl * 2} />}
      </g>
    </g>
  );
};

/* ===================================================================
 * Tonakai — トナカイ (右向き)
 *   x,y: 足元の中央。s=1 で 体長約 400px・角のてっぺんまで高さ約 480px
 *   nose: "normal" 茶色の鼻 / "red" ルドルフの赤い鼻 (ふわっと光る)
 *   run: 0〜1 で走る (0 は立ち姿で頭と耳が少し動く・1 で全力のギャロップ)
 *   antler: 0〜1 角の大きさ (0 で小さなこぶ)
 *   kind: 0〜7 角の形のちがい (8頭を描き分ける) / harness: 首輪と鈴 / face: 顔
 * =================================================================== */
export const Tonakai: React.FC<{
  x: number; y: number; s?: number; f: number;
  nose?: "normal" | "red"; run?: number; antler?: number;
  kind?: number; harness?: boolean; face?: "normal" | "smile" | "surprised" | "worried" | "joy";
  phase?: number; flip?: boolean;
}> = ({ x, y, s = 1, f, nose = "normal", run = 0, antler = 1, kind = 0, harness = false, face = "normal", phase = 0, flip = false }) => {
  const rn = clamp01(run);
  const p = (f + phase * 7) / 4.2;
  const bob = -rn * Math.abs(Math.sin(p)) * 16;
  const pitch = rn * Math.sin(p) * 3;
  const idleNod = (1 - rn) * Math.sin((f + phase * 11) / 30) * 3;
  const blink = ((f + phase * 41) % 101) < 5 && f > 2;
  const a = 0.25 + 0.75 * clamp01(antler);
  const tail = Math.sin(f / 6 + phase) * (10 + 20 * rn);
  const earFlick = ((f + phase * 23) % 120) < 8 ? -18 : 0;
  // 足 1本: (hx,hy) が付け根。front=前足
  const leg = (hx: number, hy: number, ang: number, bend: number, back: boolean, key: string) => (
    <g key={key} transform={`translate(${hx} ${hy}) rotate(${ang})`}>
      <rect x={-15} y={-6} width={30} height={90} rx={15} fill={back ? XP.furDark : XP.fur} stroke={INK} strokeWidth={5} />
      <g transform={`translate(0 80) rotate(${bend})`}>
        <rect x={-10} y={-4} width={20} height={72} rx={10} fill={back ? "#553519" : XP.furDark} stroke={INK} strokeWidth={4.5} />
        <rect x={-8} y={40} width={16} height={22} fill={XP.furPale} opacity={back ? 0.4 : 0.7} />
        {/* ひづめ (2つに割れている) */}
        <path d="M -14 64 L 14 64 L 16 78 L 1 78 L 0 70 L -1 78 L -16 78 Z" fill="#3F2C20" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      </g>
    </g>
  );
  const sw = (off: number) => Math.sin(p + off);
  const fa = rn * 38 * sw(0), ba = rn * 38 * sw(Math.PI);
  const fb = rn * Math.max(0, sw(1.2)) * 70, bb = -rn * Math.max(0, sw(Math.PI + 1.2)) * 60;
  const fa2 = rn * 38 * sw(0.7), ba2 = rn * 38 * sw(Math.PI + 0.7);
  const fb2 = rn * Math.max(0, sw(1.9)) * 70, bb2 = -rn * Math.max(0, sw(Math.PI + 1.9)) * 60;
  // 角 (主の枝 + 枝分かれ)。kind で枝の数と開きが変わる
  const tines = 2 + (kind % 4);
  const spread = [0, 22, -14, 32, 8, -24, 38, -6][kind % 8];
  const bl = [1, 0.9, 1.12, 0.94, 1.06, 0.86, 1.16, 1.0][kind % 8];
  const antlerD = () => {
    let d = `M 0 0 C ${-10 * a} ${-50 * a} ${-50 * a} ${-90 * a} ${(-70 + spread) * a} ${-150 * a}`;
    for (let i = 0; i < tines; i++) {
      const t = (i + 1) / (tines + 1);
      const bx = (-10 - 60 * t + spread * t) * a, by = (-30 - 110 * t) * a;
      const len = (44 - i * 6 + (kind % 2) * 8) * a;
      d += ` M ${bx} ${by} q ${len * 0.5} ${-len * 0.4} ${len * 0.8} ${-len}`;
    }
    d += ` M ${-8 * a} ${-26 * a} q ${24 * a} ${-4 * a} ${34 * a} ${-24 * a}`; // 前に出る眉の枝
    return d;
  };
  const noseCol = nose === "red" ? "#E8382B" : "#4A2E1E";
  const glowO = 0.75 + 0.25 * Math.sin(f / 7);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={2} rx={160} ry={14} fill={INK} opacity={0.12 * (1 - rn * 0.6)} />
      <g transform={`translate(0 ${bob}) rotate(${pitch} 0 -190)`}>
        {/* 奥の足 */}
        {leg(-92, -170, ba2, bb2, true, "bl2")}
        {leg(100, -170, fa2, fb2, true, "fl2")}
        {/* しっぽ */}
        <path d={`M -138 -222 q -26 -10 -30 ${-20 + tail * 0.3} q 18 -4 34 14 Z`} fill={XP.furPale} stroke={INK} strokeWidth={4} transform={`rotate(${tail * 0.4} -138 -222)`} />
        {/* 胴 */}
        <ellipse cx={0} cy={-200} rx={150} ry={66} fill={XP.fur} stroke={INK} strokeWidth={6} />
        <path d="M -140 -216 Q -60 -268 60 -262 Q 120 -254 144 -220 Q 90 -244 0 -244 Q -80 -244 -140 -216 Z" fill={XP.furDark} opacity={0.6} />
        <path d="M -120 -170 Q 0 -126 120 -170 Q 100 -140 0 -136 Q -100 -140 -120 -170 Z" fill={XP.furPale} opacity={0.8} />
        <ellipse cx={-96} cy={-196} rx={40} ry={30} fill={XP.furLight} opacity={0.35} />
        {/* 首 */}
        <g transform={`rotate(${idleNod + rn * Math.sin(p) * 4} 110 -220)`}>
          <path d="M 80 -240 Q 110 -300 150 -340 L 200 -312 Q 176 -260 150 -186 Z" fill={XP.fur} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {/* 胸のふさふさ (塗りで) */}
          <path d="M 140 -296 Q 176 -270 172 -232 Q 182 -216 168 -200 Q 172 -184 150 -176 Q 130 -186 128 -210 Q 116 -240 140 -296 Z" fill={XP.furPale} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <path d="M 146 -262 Q 158 -240 150 -214" stroke={XP.furLight} strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
          {harness && (
            <g>
              <path d="M 120 -268 Q 160 -250 188 -282" stroke={XP.red} strokeWidth={16} fill="none" />
              <path d="M 120 -268 Q 160 -250 188 -282" stroke={XP.redDark} strokeWidth={4} fill="none" transform="translate(0 6)" />
              <g transform={`rotate(${Math.sin(f / 4) * 14} 160 -258)`}>
                <circle cx={160} cy={-240} r={13} fill={XP.gold} stroke={INK} strokeWidth={3.5} />
                <circle cx={160} cy={-232} r={3} fill={INK} />
                <ellipse cx={156} cy={-245} rx={4} ry={2.5} fill={KRP.white} opacity={0.8} />
              </g>
            </g>
          )}
          {/* 頭 */}
          <g transform="translate(186 -344)">
            {/* 奥の角 */}
            <g transform={`translate(-34 -26) rotate(-30) scale(${0.9 * bl})`}>
              <path d={antlerD()} stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={antlerD()} stroke={XP.antlerDark} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {/* 奥の耳 */}
            <path d="M -40 -22 Q -74 -46 -82 -30 Q -70 -12 -40 -10 Z" fill={XP.furDark} stroke={INK} strokeWidth={4} />
            <ellipse cx={0} cy={0} rx={52} ry={40} fill={XP.fur} stroke={INK} strokeWidth={6} transform="rotate(18)" />
            {/* 鼻づら */}
            <ellipse cx={48} cy={22} rx={38} ry={28} fill={XP.furLight} stroke={INK} strokeWidth={5.5} transform="rotate(14 48 22)" />
            <ellipse cx={-14} cy={-12} rx={20} ry={14} fill={XP.furLight} opacity={0.4} />
            {/* 手前の角 */}
            <g transform={`translate(-14 -30) rotate(14) scale(${bl})`}>
              <path d={antlerD()} stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={antlerD()} stroke={XP.antler} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M ${-4 * a} ${-20 * a} C ${-12 * a} ${-56 * a} ${-40 * a} ${-90 * a} ${(-58 + spread) * a} ${-136 * a}`} stroke={KRP.white} strokeWidth={3} opacity={0.45} fill="none" />
            </g>
            {/* 手前の耳 */}
            <g transform={`rotate(${earFlick + idleNod * 2} -26 -24)`}>
              <path d="M -26 -24 Q -66 -60 -80 -44 Q -66 -18 -24 -12 Z" fill={XP.fur} stroke={INK} strokeWidth={4.5} />
              <path d="M -32 -24 Q -60 -44 -68 -38 Q -58 -24 -32 -18 Z" fill={XP.furPale} opacity={0.8} />
            </g>
            {/* 目 */}
            {blink || face === "joy" ? (
              <path d={face === "joy" ? "M 0 -14 Q 10 -26 20 -14" : "M 0 -12 L 20 -12"} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <ellipse cx={10} cy={-12} rx={12} ry={face === "surprised" ? 17 : 15} fill={KRP.white} stroke={INK} strokeWidth={4} />
                <circle cx={13} cy={-11} r={face === "surprised" ? 4.5 : 7} fill={INK} />
                <circle cx={15} cy={-15} r={2.2} fill={KRP.white} />
              </g>
            )}
            {face === "worried" && <line x1={-2} y1={-36} x2={20} y2={-30} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
            {face === "surprised" && <line x1={0} y1={-38} x2={22} y2={-38} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
            {/* 口 */}
            {face === "surprised" ? <ellipse cx={58} cy={42} rx={7} ry={9} fill={INK} />
              : face === "smile" || face === "joy" ? <path d="M 46 40 Q 60 52 72 38" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
              : face === "worried" ? <path d="M 48 46 Q 60 38 70 44" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
              : <path d="M 50 42 Q 60 46 70 40" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
            {/* 鼻 */}
            {nose === "red" && <Glow x={80} y={16} r={70} color="#FF6A5A" o={glowO} />}
            <circle cx={80} cy={16} r={nose === "red" ? 17 : 13} fill={noseCol} stroke={INK} strokeWidth={4} />
            <ellipse cx={75} cy={10} rx={5} ry={3.5} fill={KRP.white} opacity={nose === "red" ? 0.75 : 0.4} />
          </g>
        </g>
        {/* 手前の足 */}
        {leg(-100, -164, ba, bb, false, "bl")}
        {leg(92, -164, fa, fb, false, "fl")}
        <ellipse cx={-100} cy={-176} rx={44} ry={36} fill={XP.fur} />
      </g>
    </g>
  );
};

/* ===================================================================
 * Santa — サンタ (★この回の主役)。era で姿を変える。どの era でも「白いひげ+丸い目」は同じ
 *   x,y: 足元の中央 (pose="sit" のときは座面の高さ。ブーツは y+50*s あたりまで下がる)
 *   s=1 での高さ (帽子まで): classic 約 500 / red 約 440 / dutch 約 460 / 1821 約 340 /
 *     1823 約 190 (小人の妖精・人の半分以下) / nast 約 140 (とても小さい) / sinterklaas 約 640 (やせて背が高い) / nicholas 約 560
 *     → 人 (Person s=1 で約 300) と同じ s で並べると、大きさのちがいがそのまま出る
 *   era: "nicholas" (4世紀の司教・顔を描かない後ろ姿) | "sinterklaas" | "dutch" | "1821" | "1823" | "nast" | "red" | "classic"
 *   pose: "stand" | "wave" (右手をふる) | "banzai" | "hold" (両手を前に) | "point" (右を指す) | "sit"
 *   face: Person と同じ7種 (nicholas は無視)。f: まばたき・体のゆれ・帽子のゆれ・パイプの煙
 *   mono: nast の白黒の挿絵版 (灰色の濃淡だけ) / buckle: "flip" でベルトのバックルを逆向き (#97)
 *   bag: classic・red・1823 で背中におもちゃの袋 (1823 は既定で背負う) / whip: 1821 の樺のムチ (既定 true)
 *   pipe: dutch・1823 のパイプ (既定 true) / horse: sinterklaas の白い馬を後ろに (既定 false)
 * =================================================================== */
type SantaEra = "nicholas" | "sinterklaas" | "dutch" | "1821" | "1823" | "nast" | "red" | "classic";
type SantaPose = "stand" | "wave" | "banzai" | "hold" | "point" | "sit";

// サンタの顔 = からくりのメインキャラクター (Person) の顔そのもの。頭の中心 (0,0)・半径64 で Person と同じ目・まゆ・口・まばたき。
// ピンクの鼻・ほお紅は付けない。白いあごひげは顔の下半分だけで、口元はひげを開けて表情が見えるようにする
const SantaFace: React.FC<{ face: Face; blink: boolean; gaze: [number, number]; beardL: number; beardW?: number; gray?: (c: string, g: string) => string }> = ({
  face, blink, gaze, beardL, beardW = 64, gray = (c) => c,
}) => {
  const [gx, gy] = gaze;
  const W = beardW, B = 52 + beardL * 0.75; // B: ひげの下の端
  // あごひげ (外形) + 口元の穴 (evenodd でくり抜く)
  const beardD = `M ${-W + 2} 14 C ${-W - 12} ${B * 0.55} ${-W * 0.7} ${B * 0.95} ${-W * 0.25} ${B - 6} Q 0 ${B + 10} ${W * 0.25} ${B - 6}
    C ${W * 0.7} ${B * 0.95} ${W + 12} ${B * 0.55} ${W - 2} 14 Q ${W * 0.62} 34 ${W * 0.4} 32 L ${-W * 0.4} 32 Q ${-W * 0.62} 34 ${-W + 2} 14 Z
    M -22 46 A 22 15 0 1 0 22 46 A 22 15 0 1 0 -22 46 Z`;
  return (
    <g>
      {/* 目 (Person と同じ大きい丸目) */}
      {face === "joy" ? (
        <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round">
          <path d="M -34 12 Q -24 -3 -14 12" /><path d="M 14 12 Q 24 -3 34 12" />
        </g>
      ) : blink ? (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-34} y1={8} x2={-14} y2={8} /><line x1={14} y1={8} x2={34} y2={8} /></g>
      ) : (
        <g>
          <ellipse cx={-24} cy={6} rx={13} ry={18} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <ellipse cx={24} cy={6} rx={13} ry={18} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <circle cx={-24 + gx} cy={6 + gy + (face === "sad" ? 5 : 0)} r={face === "surprised" ? 4.5 : 6} fill={INK} />
          <circle cx={24 + gx} cy={6 + gy + (face === "sad" ? 5 : 0)} r={face === "surprised" ? 4.5 : 6} fill={INK} />
        </g>
      )}
      {/* まゆ (Person と同じ線) */}
      {face === "worried" ? (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-34} y1={-24} x2={-14} y2={-18} /><line x1={14} y1={-18} x2={34} y2={-24} /></g>
      ) : face === "surprised" ? (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-34} y1={-26} x2={-14} y2={-26} /><line x1={14} y1={-26} x2={34} y2={-26} /></g>
      ) : face === "angry" ? (
        <g stroke={INK} strokeWidth={5} strokeLinecap="round"><line x1={-35} y1={-30} x2={-13} y2={-16} /><line x1={13} y1={-16} x2={35} y2={-30} /></g>
      ) : face === "sad" ? (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-34} y1={-15} x2={-14} y2={-24} /><line x1={14} y1={-24} x2={34} y2={-15} /></g>
      ) : (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-34} y1={-20} x2={-14} y2={-22} /><line x1={14} y1={-22} x2={34} y2={-20} /></g>
      )}
      {/* 白いあごひげ (顔の下半分) */}
      <path d={beardD} fill={XP.beard} fillRule="evenodd" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${-W * 0.62} ${B * 0.5} Q ${-W * 0.42} ${B * 0.82} ${-W * 0.12} ${B * 0.9} Q ${-W * 0.5} ${B * 0.66} ${-W * 0.62} ${B * 0.5} Z
        M ${W * 0.52} ${B * 0.55} Q ${W * 0.42} ${B * 0.82} ${W * 0.14} ${B * 0.92} Q ${W * 0.46} ${B * 0.68} ${W * 0.52} ${B * 0.55} Z`} fill={gray(XP.snowShade, "#D6D6D6")} />
      {/* 口ひげ (口の上に小さく。口はふさがない) */}
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M ${sd * 2} 30 Q ${sd * 16} 22 ${sd * 32} 28 Q ${sd * 40} 33 ${sd * 34} 38 Q ${sd * 18} 38 ${sd * 2} 34 Z`}
          fill={XP.beard} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      ))}
      {face === "sad" && <path d="M -30 26 Q -37 38 -30 43 Q -23 38 -30 26 Z" fill="#7FA8C9" opacity={0.9} />}
      {/* 口 (Person と同じ形。ひげの穴の中) */}
      {face === "surprised" ? <ellipse cx={0} cy={47} rx={10} ry={12} fill={INK} />
        : face === "smile" ? <path d="M -14 42 Q 0 56 14 42" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        : face === "worried" ? <path d="M -12 50 Q 0 42 12 50" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        : face === "joy" ? <g><path d="M -18 40 Q 0 64 18 40 Z" fill={INK} /><ellipse cx={0} cy={51} rx={7} ry={3.5} fill="#E06A5A" /></g>
        : face === "angry" ? <path d="M -15 52 Q 0 40 15 52" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        : face === "sad" ? <path d="M -10 51 Q 0 43 10 51" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        : <line x1={-10} y1={46} x2={10} y2={46} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />}
    </g>
  );
};

// 元のサンタの顔 (look="own")。ピンクの鼻・ほお紅・白いふさふさのまゆ・サンタ用の目。頭の中心 (0,0)・半径60
const SantaFaceOwn: React.FC<{ face: Face; blink: boolean; gaze: [number, number]; beardL: number; beardW?: number; brow?: string; cheek?: string; gray?: (c: string, g: string) => string }> = ({
  face, blink, gaze, beardL, beardW = 62, brow = XP.beard, cheek = XP.cheek, gray = (c) => c,
}) => {
  const [gx, gy] = gaze;
  const W = beardW, L = beardL;
  const beardD = `M ${-W} -6 C ${-W - 14} ${L * 0.45} ${-W * 0.7} ${L * 0.95} ${-W * 0.25} ${L + 10} Q 0 ${L + 24} ${W * 0.25} ${L + 10}
    C ${W * 0.7} ${L * 0.95} ${W + 14} ${L * 0.45} ${W} -6 Q ${W * 0.7} 22 0 26 Q ${-W * 0.7} 22 ${-W} -6 Z`;
  const browY = face === "surprised" ? -40 : face === "angry" ? -30 : -34;
  const browRot = face === "worried" || face === "sad" ? 14 : face === "angry" ? -16 : 0;
  return (
    <g>
      <path d={beardD} fill={XP.beard} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${-W * 0.6} ${L * 0.4} Q ${-W * 0.4} ${L * 0.8} ${-W * 0.1} ${L * 0.9} Q ${-W * 0.5} ${L * 0.6} ${-W * 0.6} ${L * 0.4} Z
        M ${W * 0.5} ${L * 0.5} Q ${W * 0.4} ${L * 0.8} ${W * 0.12} ${L * 0.92} Q ${W * 0.45} ${L * 0.65} ${W * 0.5} ${L * 0.5} Z`} fill={gray(XP.snowShade, "#D6D6D6")} />
      <circle cx={-38} cy={6} r={11} fill={gray(cheek, "#C8C8C8")} opacity={0.75} />
      <circle cx={38} cy={6} r={11} fill={gray(cheek, "#C8C8C8")} opacity={0.75} />
      {face === "joy" ? (
        <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round">
          <path d="M -32 -8 Q -22 -22 -12 -8" /><path d="M 12 -8 Q 22 -22 32 -8" />
        </g>
      ) : blink ? (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-32} y1={-10} x2={-12} y2={-10} /><line x1={12} y1={-10} x2={32} y2={-10} /></g>
      ) : (
        <g>
          <ellipse cx={-22} cy={-12} rx={12} ry={16} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <ellipse cx={22} cy={-12} rx={12} ry={16} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <circle cx={-22 + gx} cy={-12 + gy + (face === "sad" ? 4 : 0)} r={face === "surprised" ? 4.5 : 6} fill={INK} />
          <circle cx={22 + gx} cy={-12 + gy + (face === "sad" ? 4 : 0)} r={face === "surprised" ? 4.5 : 6} fill={INK} />
          <circle cx={-19 + gx} cy={-16 + gy} r={1.8} fill={KRP.white} />
          <circle cx={25 + gx} cy={-16 + gy} r={1.8} fill={KRP.white} />
        </g>
      )}
      {face === "sad" && <path d="M -28 6 Q -34 16 -28 21 Q -22 16 -28 6 Z" fill="#7FA8C9" />}
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M ${sd * 8} ${browY + 4} Q ${sd * 22} ${browY - 8} ${sd * 40} ${browY + 2} Q ${sd * 24} ${browY + 6} ${sd * 8} ${browY + 4} Z`}
          fill={brow} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" transform={`rotate(${sd * browRot} ${sd * 24} ${browY})`} />
      ))}
      <circle cx={0} cy={8} r={11} fill={gray("#F2A88E", "#BDBDBD")} stroke={INK} strokeWidth={4} />
      <circle cx={-3} cy={5} r={3} fill={KRP.white} opacity={0.7} />
      {[-1, 1].map((sd) => (
        <path key={`m${sd}`} d={`M 0 18 Q ${sd * 20} 10 ${sd * 42} 22 Q ${sd * 56} 30 ${sd * 46} 40 Q ${sd * 26} 38 0 30 Z`}
          fill={XP.beard} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      ))}
      {face === "joy" ? (
        <g><path d="M -16 38 Q 0 66 16 38 Z" fill={INK} /><ellipse cx={0} cy={52} rx={7} ry={4} fill="#E06A5A" /></g>
      ) : face === "surprised" ? <ellipse cx={0} cy={48} rx={8} ry={11} fill={INK} />
        : face === "smile" ? <path d="M -13 42 Q 0 56 13 42" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        : face === "worried" || face === "sad" ? <path d="M -10 50 Q 0 42 10 50" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        : face === "angry" ? <path d="M -13 50 Q 0 40 13 50" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        : <line x1={-8} y1={46} x2={8} y2={46} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />}
    </g>
  );
};

// 腕のふり (左右それぞれの肩まわりの回転。左腕は + で外へ、右腕は − で外へ)
const santaArms = (pose: SantaPose, f: number): [number, number] => {
  switch (pose) {
    case "wave": return [14, -150 + Math.sin(f / 4) * 16];
    case "banzai": return [150 + Math.sin(f / 9) * 4, -150 - Math.sin(f / 9) * 4];
    case "hold": return [-38, 38];
    case "point": return [14, -90];
    case "sit": return [-24, 24];
    default: return [14 + Math.sin(f / 20) * 2, -14 - Math.sin(f / 20) * 2];
  }
};

const SANTA_K: Record<SantaEra, number> = {
  classic: 1.0, red: 0.95, dutch: 0.96, "1821": 0.74, "1823": 0.4, nast: 0.3, sinterklaas: 1.08, nicholas: 1.06,
};
// 腰 (上半身の下端) の高さ。sit のときはここを座面 (y=0) に合わせる
const SANTA_HIP: Record<SantaEra, number> = {
  classic: -110, red: -84, dutch: -110, "1821": -96, "1823": -70, nast: -100, sinterklaas: -120, nicholas: -120,
};

export const Santa: React.FC<{
  x: number; y: number; s?: number; f: number; era?: SantaEra; pose?: SantaPose; face?: Face;
  gaze?: [number, number]; phase?: number; mono?: boolean; buckle?: "normal" | "flip";
  bag?: boolean; whip?: boolean; pipe?: boolean; horse?: boolean; flip?: boolean; lean?: number;
  look?: "main" | "own"; // "main" = からくりのメインキャラクターの顔 (既定) / "own" = 元のサンタの顔 (ピンクの鼻・ほお紅)
}> = ({ x, y, s = 1, f, era = "classic", pose = "stand", face = "smile", gaze = [0, 0], phase = 0, mono = false,
  buckle = "normal", bag, whip = true, pipe = true, horse = false, flip = false, lean = 0, look = "main" }) => {
  const k = SANTA_K[era] * s;
  const gr = (c: string, g: string) => (mono && era === "nast" ? g : c);
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2 && face !== "joy";
  const hatSw = Math.sin((f + phase * 9) / 15) * 4;
  const sit = pose === "sit";
  const hip = SANTA_HIP[era];
  const [ra, rb] = santaArms(pose, f);
  const hasBag = bag ?? era === "1823";
  const back = era === "nicholas";
  // 腕1本 (肩 sx,sy・長さ len・太さ w)。cuff: 手首の毛皮の色
  const arm = (key: string, sx: number, sy: number, rot: number, len: number, w: number, color: string, hand: string, cuff?: string) => (
    <g key={key} transform={`rotate(${rot} ${sx} ${sy})`}>
      <rect x={sx - w / 2} y={sy - w / 2} width={w} height={len + w / 2} rx={w / 2} fill={color} stroke={INK} strokeWidth={5} />
      {cuff && <rect x={sx - w / 2 - 3} y={sy + len - w * 0.55} width={w + 6} height={w * 0.5} rx={w * 0.25} fill={cuff} stroke={INK} strokeWidth={4} />}
      <circle cx={sx} cy={sy + len + w * 0.2} r={w * 0.58} fill={hand} stroke={INK} strokeWidth={4.5} />
    </g>
  );
  // 足 (立ち: 腰 hip から 0 まで / すわり: 座面から前へ短く)
  const legs = (legW: number, gap: number, color: string, boot: string, bootH: number, cuff?: string, buckleCol?: string) => sit ? (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd * gap - legW / 2} y={hip - 14} width={legW} height={54} rx={legW / 2.5} fill={color} stroke={INK} strokeWidth={5} />
          <ellipse cx={sd * (gap + 8)} cy={hip + 40} rx={legW * 0.78} ry={18} fill={boot} stroke={INK} strokeWidth={4.5} />
        </g>
      ))}
    </g>
  ) : (
    <g>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd * gap - legW / 2} y={hip - 6} width={legW} height={-hip - bootH + 12} fill={color} stroke={INK} strokeWidth={5} />
          <path d={`M ${sd * gap - legW / 2 - 4} ${-bootH} L ${sd * gap + legW / 2 + 4} ${-bootH} L ${sd * gap + legW / 2 + 4} -14
            Q ${sd * gap + sd * 30 + legW / 2} -14 ${sd * gap + sd * 32 + legW / 2} 0 L ${sd * gap - sd * (legW / 2 + 4)} 0 Z`}
            fill={boot} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          {cuff && <rect x={sd * gap - legW / 2 - 7} y={-bootH - 8} width={legW + 14} height={16} rx={8} fill={cuff} stroke={INK} strokeWidth={4} />}
          {buckleCol && <rect x={sd * gap - 8 + sd * 8} y={-14} width={16} height={10} fill="none" stroke={buckleCol} strokeWidth={4} />}
        </g>
      ))}
    </g>
  );
  const head = (hy: number, beardL: number, beardW?: number) => (
    <g transform={`translate(0 ${hy})`}>
      {/* 横の白い髪 */}
      {look === "own" ? (
        <g>
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 52} -30 Q ${sd * 80} -10 ${sd * 70} 20 Q ${sd * 60} 34 ${sd * 48} 14 Z`} fill={XP.beard} stroke={INK} strokeWidth={4} />)}
          <circle cx={0} cy={0} r={60} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
          <SantaFaceOwn face={face} blink={blink} gaze={gaze} beardL={beardL} beardW={beardW} gray={gr} />
        </g>
      ) : (
        <g>
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 54} -34 Q ${sd * 86} -14 ${sd * 76} 20 Q ${sd * 66} 34 ${sd * 52} 16 Z`} fill={XP.beard} stroke={INK} strokeWidth={4} />)}
          <circle cx={0} cy={0} r={64} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
          <SantaFace face={face} blink={blink} gaze={gaze} beardL={beardL} beardW={beardW} gray={gr} />
        </g>
      )}
    </g>
  );
  // 背中のおもちゃの袋
  const sack = (sx: number, sy: number, sc: number) => (
    <g transform={`translate(${sx} ${sy}) scale(${sc}) rotate(${-16 + Math.sin(f / 18) * 2})`}>
      <rect x={-20} y={-142} width={40} height={36} rx={5} fill={XP.red} stroke={INK} strokeWidth={4} transform="rotate(-18 0 -124)" />
      <ellipse cx={-6} cy={-148} rx={20} ry={6} fill={KRP.white} stroke={INK} strokeWidth={3.5} transform="rotate(-18 0 -124)" />
      <path d="M 26 -120 L 26 -158 Q 26 -176 44 -176 Q 58 -172 56 -158 L 50 -152 L 40 -156 L 40 -120 Z" fill={XP.woodLight} stroke={INK} strokeWidth={4} />
      <circle cx={44} cy={-164} r={3} fill={INK} />
      <path d="M -70 0 Q -96 -60 -60 -112 Q 0 -138 56 -116 Q 92 -70 70 0 Q 0 22 -70 0 Z" fill="#B0703A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -50 -30 Q -20 -14 10 -34 M 20 -70 Q 40 -50 56 -64" stroke={INK} strokeWidth={4} opacity={0.3} fill="none" />
      <path d="M -60 -100 Q -84 -60 -66 -10" stroke={KRP.white} strokeWidth={8} opacity={0.2} fill="none" />
      <path d="M -62 -112 Q 0 -134 56 -116 Q 0 -100 -62 -112 Z" fill="#8A5428" />
    </g>
  );
  // 司教の杖 (左手)
  const crozier = (cx: number, top: number) => (
    <g>
      <line x1={cx} y1={8} x2={cx} y2={top + 40} stroke={INK} strokeWidth={15} strokeLinecap="round" />
      <line x1={cx} y1={8} x2={cx} y2={top + 40} stroke={XP.gold} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${cx} ${top + 44} Q ${cx - 4} ${top} ${cx + 30} ${top - 4} Q ${cx + 62} ${top} ${cx + 58} ${top + 30} Q ${cx + 52} ${top + 50} ${cx + 32} ${top + 40}`}
        stroke={INK} strokeWidth={15} fill="none" strokeLinecap="round" />
      <path d={`M ${cx} ${top + 44} Q ${cx - 4} ${top} ${cx + 30} ${top - 4} Q ${cx + 62} ${top} ${cx + 58} ${top + 30} Q ${cx + 52} ${top + 50} ${cx + 32} ${top + 40}`}
        stroke={XP.gold} strokeWidth={8} fill="none" strokeLinecap="round" />
      <circle cx={cx} cy={top + 70} r={10} fill={XP.goldLight} stroke={INK} strokeWidth={3.5} />
    </g>
  );
  // ミトラ (司教の帽子)。back=true は後ろから (垂れ布つき)
  const mitre = (hy: number, isBack: boolean) => (
    <g transform={`translate(0 ${hy})`}>
      <path d="M -50 -40 L -50 -100 Q -42 -170 0 -196 Q 42 -170 50 -100 L 50 -40 Z" fill={XP.red} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      <path d="M -50 -40 L -50 -100 Q -42 -170 0 -196 L 0 -40 Z" fill={KRP.white} opacity={0.12} />
      <rect x={-52} y={-56} width={104} height={18} fill={XP.gold} stroke={INK} strokeWidth={4} />
      <path d="M -9 -56 L -9 -186 L 9 -186 L 9 -56 Z" fill={XP.gold} stroke={INK} strokeWidth={3.5} />
      {!isBack && <path d="M -16 -128 L 16 -128 M 0 -146 L 0 -106" stroke={XP.goldLight} strokeWidth={8} strokeLinecap="round" />}
      {!isBack && <path d="M -16 -128 L 16 -128 M 0 -146 L 0 -106" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.4} />}
    </g>
  );

  let body: React.ReactNode = null;
  if (era === "classic" || era === "red") {
    const classic = era === "classic";
    const jig = classic ? 1 + 0.015 * Math.sin(f / 6) : 1;
    body = (
      <g>
        {legs(classic ? 44 : 36, classic ? 38 : 30, XP.red, "#2E2620", classic ? 50 : 84, KRP.white)}
        {(hasBag) && sack(-90, -170, 1.15)}
        <g transform={`translate(0 ${hip}) scale(1 ${jig}) translate(0 ${-hip})`}>
          {classic ? (
            <path d="M -66 -274 Q -124 -252 -126 -170 Q -128 -118 -104 -104 L 104 -104 Q 128 -118 126 -170 Q 124 -252 66 -274 Z" fill={XP.red} stroke={INK} strokeWidth={6} />
          ) : (
            <path d="M -54 -272 Q -84 -244 -86 -160 L -96 -70 L 96 -70 L 86 -160 Q 84 -244 54 -272 Z" fill={XP.red} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          )}
          {/* 右側の影・左のつや */}
          <path d={classic ? "M 40 -268 Q 118 -240 118 -170 Q 118 -126 100 -110 L 60 -110 Q 96 -170 40 -268 Z" : "M 34 -266 Q 80 -230 80 -160 L 88 -76 L 52 -76 Q 60 -170 34 -266 Z"} fill={XP.redDark} opacity={0.6} />
          <path d={classic ? "M -90 -230 Q -112 -190 -106 -150" : "M -66 -230 Q -76 -190 -76 -150"} stroke={KRP.white} strokeWidth={9} opacity={0.22} fill="none" strokeLinecap="round" />
          {/* 前の白い毛皮・すその毛皮 */}
          <rect x={-14} y={-268} width={28} height={classic ? 168 : 200} rx={10} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
          {classic
            ? <path d="M -110 -116 Q 0 -90 110 -116 L 108 -88 Q 0 -62 -108 -88 Z" fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            : <path d="M -98 -84 Q 0 -70 98 -84 L 100 -56 Q 0 -42 -100 -56 Z" fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
          {/* ベルト */}
          {classic ? (
            <g>
              <path d="M -124 -182 Q 0 -168 124 -182 L 124 -150 Q 0 -136 -124 -150 Z" fill="#2E2620" stroke={INK} strokeWidth={4} />
              <rect x={-26} y={-188} width={52} height={44} rx={5} fill="none" stroke={XP.gold} strokeWidth={9} />
              <rect x={-26} y={-188} width={52} height={44} rx={5} fill="none" stroke={INK} strokeWidth={2.5} />
              <line x1={0} y1={-166} x2={buckle === "flip" ? 22 : -22} y2={-166} stroke={XP.goldLight} strokeWidth={6} strokeLinecap="round" />
              <path d={buckle === "flip" ? "M -26 -158 L -48 -150 L -48 -142 L -26 -148 Z" : "M 26 -158 L 48 -150 L 48 -142 L 26 -148 Z"} fill="#2E2620" stroke={INK} strokeWidth={3} />
            </g>
          ) : (
            <g>
              <path d="M -86 -172 L 86 -172 L 86 -150 L -86 -150 Z" fill="#5A3A22" stroke={INK} strokeWidth={4} />
              <rect x={-16} y={-176} width={32} height={30} rx={4} fill="none" stroke={XP.gold} strokeWidth={6} />
            </g>
          )}
        </g>
        {arm("l", classic ? -84 : -62, -250, ra, classic ? 104 : 108, 36, XP.red, KRP.white, KRP.white)}
        {arm("r", classic ? 84 : 62, -250, rb, classic ? 104 : 108, 36, XP.red, KRP.white, KRP.white)}
        {head(-322, classic ? 80 : 118, classic ? 66 : 58)}
        {/* 帽子 */}
        <g transform={`translate(0 -330) rotate(${hatSw * 0.4})`}>
          {classic ? (
            <g>
              <path d="M -58 -44 Q -46 -130 28 -142 Q 96 -146 110 -96 L 98 -88 Q 82 -112 52 -106 Q 20 -96 58 -46 Z" fill={XP.red} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
              <path d="M 20 -100 Q 60 -122 96 -100" stroke={XP.redDark} strokeWidth={8} fill="none" opacity={0.6} />
              <g transform={`rotate(${hatSw} 100 -94)`}><circle cx={108} cy={-86} r={20} fill={KRP.white} stroke={INK} strokeWidth={4.5} /></g>
            </g>
          ) : (
            <g>
              <path d="M -58 -44 Q -60 -118 0 -124 Q 60 -118 58 -44 Z" fill={XP.red} stroke={INK} strokeWidth={5.5} />
              <path d="M 20 -116 Q 52 -100 54 -50" stroke={XP.redDark} strokeWidth={8} fill="none" opacity={0.5} />
              {/* ひいらぎ */}
              <g transform="translate(30 -76)">
                <path d="M 0 0 Q 16 -20 36 -12 Q 24 4 0 0 Z M 0 0 Q -4 -26 12 -36 Q 16 -14 0 0 Z" fill={XP.green} stroke={INK} strokeWidth={3} />
                {[[-4, 4], [6, 6], [1, -4]].map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r={5.5} fill={XP.red} stroke={INK} strokeWidth={2.5} />)}
              </g>
            </g>
          )}
          <path d="M -70 -50 Q -70 -70 -50 -66 Q -30 -76 -10 -68 Q 10 -76 30 -68 Q 50 -76 66 -64 Q 76 -50 64 -34 Q 40 -26 0 -28 Q -40 -26 -64 -34 Q -76 -40 -70 -50 Z"
            fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
      </g>
    );
  } else if (era === "dutch") {
    const teal = "#2F5E5A";
    const puff = Math.sin(f / 10);
    body = (
      <g>
        {legs(30, 30, KRP.white, "#2E2620", 22, undefined, XP.gold)}
        {/* 上着の後ろの裾 */}
        <path d="M -70 -268 Q -118 -230 -112 -150 L -104 -96 L 104 -96 L 112 -150 Q 118 -230 70 -268 Z" fill={teal} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* チョッキ (太ったお腹) */}
        <ellipse cx={0} cy={-190} rx={92} ry={84} fill="#C9963E" stroke={INK} strokeWidth={5.5} />
        <path d="M 40 -260 Q 96 -210 80 -140 Q 60 -112 30 -110 Q 70 -180 40 -260 Z" fill="#A87A2C" opacity={0.6} />
        {[-236, -206, -176, -146].map((by) => <circle key={by} cx={0} cy={by} r={6} fill={XP.goldLight} stroke={INK} strokeWidth={3} />)}
        {/* 上着の前身ごろ (開いている) */}
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 30} -270 Q ${sd * 80} -230 ${sd * 96} -170 Q ${sd * 104} -120 ${sd * 100} -96 L ${sd * 76} -96 Q ${sd * 90} -170 ${sd * 30} -270 Z`}
            fill={teal} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        ))}
        {/* ニッカーボッカー (ひざ下でふくらむ半ズボン。上着のすそから出る) */}
        {!sit && [-1, 1].map((sd) => <ellipse key={`k${sd}`} cx={sd * 32} cy={-82} rx={34} ry={28} fill="#8A6038" stroke={INK} strokeWidth={5} />)}
        {!sit && [-1, 1].map((sd) => <path key={`kh${sd}`} d={`M ${sd * 32 - 18} -96 Q ${sd * 32 - 10} -76 ${sd * 32 - 20} -64`} stroke="#6B4826" strokeWidth={5} fill="none" opacity={0.7} />)}
        {!sit && [-1, 1].map((sd) => <rect key={`b${sd}`} x={sd * 32 - 22} y={-60} width={44} height={10} rx={5} fill={XP.gold} stroke={INK} strokeWidth={3} />)}
        {/* 首の白い布 */}
        <path d="M -30 -270 Q 0 -250 30 -270 L 20 -230 Q 0 -222 -20 -230 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
        {arm("l", -78, -248, ra, 100, 34, teal, KRP.white, KRP.white)}
        {arm("r", 78, -248, rb, 100, 34, teal, KRP.white, KRP.white)}
        {head(-322, 46, 58)}
        {/* パイプ (長い土のパイプ) と煙 */}
        {pipe && (
          <g>
            <path d="M 14 -276 Q 70 -270 116 -252" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d="M 14 -276 Q 70 -270 116 -252" stroke={KRP.white} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d="M 106 -256 L 110 -282 L 132 -282 L 128 -252 Z" fill={KRP.white} stroke={INK} strokeWidth={4} />
            {[0, 1, 2].map((j) => {
              const p = ((f * 0.7 + j * 33) % 100) / 100;
              return <circle key={j} cx={120 + p * 40 + puff * 6} cy={-292 - p * 110} r={8 + p * 20} fill="#D6D8DE" opacity={0.75 * (1 - p)} stroke={INK} strokeWidth={2} strokeOpacity={0.3 * (1 - p)} />;
            })}
          </g>
        )}
        {/* つば広の帽子 */}
        <g transform={`translate(0 -374) rotate(${hatSw * 0.3})`}>
          <path d="M -50 -6 L -44 -64 Q 0 -76 44 -64 L 50 -6 Z" fill="#3A2E26" stroke={INK} strokeWidth={5} />
          <rect x={-48} y={-22} width={96} height={14} fill="#6E4526" />
          <rect x={-12} y={-24} width={24} height={18} fill="none" stroke={XP.gold} strokeWidth={4} />
          <ellipse cx={0} cy={0} rx={108} ry={20} fill="#3A2E26" stroke={INK} strokeWidth={5} />
          <path d="M -90 -4 Q 0 -16 90 -4" stroke={KRP.white} strokeWidth={4} opacity={0.18} fill="none" />
        </g>
      </g>
    );
  } else if (era === "1821") {
    const coat = "#8C3C2E";
    body = (
      <g>
        {legs(32, 28, "#5A3A22", "#3F2C20", 46, XP.furPale)}
        <path d="M -56 -268 Q -90 -236 -92 -160 L -98 -96 L 98 -96 L 92 -160 Q 90 -236 56 -268 Z" fill={coat} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 30 -262 Q 84 -220 84 -150 L 90 -100 L 52 -100 Q 60 -180 30 -262 Z" fill="#6A2A20" opacity={0.6} />
        <rect x={-13} y={-262} width={26} height={160} rx={10} fill={XP.furPale} stroke={INK} strokeWidth={4.5} />
        <path d="M -100 -110 Q 0 -94 100 -110 L 102 -84 Q 0 -68 -102 -84 Z" fill={XP.furPale} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -92 -176 L 92 -176 L 92 -154 L -92 -154 Z" fill="#3F2C20" stroke={INK} strokeWidth={4} />
        {arm("l", -66, -248, ra, 100, 34, coat, "#5A3A22", XP.furPale)}
        {/* 樺のムチ (右手。細い枝の束を赤いひもで結ぶ) */}
        {whip && (
          <g transform={`rotate(${rb} 66 -248)`}>
            <g transform={`translate(66 ${-248 + 108}) rotate(${-rb + 30 + Math.sin(f / 7) * 6})`}>
              {[-10, -5, 0, 5, 10].map((dx, i) => (
                <path key={i} d={`M ${dx * 0.4} 10 Q ${dx} -60 ${dx * 2.2 + 8} -130`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
              ))}
              {[-10, -5, 0, 5, 10].map((dx, i) => (
                <path key={`c${i}`} d={`M ${dx * 0.4} 10 Q ${dx} -60 ${dx * 2.2 + 8} -130`} stroke="#E8E0CE" strokeWidth={2.5} fill="none" strokeLinecap="round" />
              ))}
              <path d="M -4 -100 l -14 -10 M 8 -80 l 14 -8 M 2 -116 l 10 -12" stroke={INK} strokeWidth={4} strokeLinecap="round" />
              <rect x={-9} y={-14} width={18} height={10} rx={3} fill={XP.red} stroke={INK} strokeWidth={2.5} />
            </g>
          </g>
        )}
        {arm("r", 66, -248, rb, 100, 34, coat, "#5A3A22", XP.furPale)}
        {head(-320, 70, 58)}
        {/* 毛皮の帽子 */}
        <g transform={`translate(0 -328) rotate(${hatSw * 0.3})`}>
          <path d="M -56 -40 Q -58 -112 0 -116 Q 58 -112 56 -40 Z" fill={XP.fur} stroke={INK} strokeWidth={5.5} />
          <path d="M 16 -108 Q 50 -96 52 -50" stroke={XP.furDark} strokeWidth={10} fill="none" opacity={0.6} />
          <path d="M -68 -46 Q -68 -66 -46 -62 Q 0 -74 46 -62 Q 68 -66 68 -46 Q 70 -28 46 -30 Q 0 -22 -46 -30 Q -70 -28 -68 -46 Z" fill={XP.furLight} stroke={INK} strokeWidth={5} />
          <path d="M -40 -40 Q 0 -48 40 -40" stroke={XP.furPale} strokeWidth={5} fill="none" opacity={0.7} />
        </g>
      </g>
    );
  } else if (era === "1823") {
    body = (
      <g>
        {legs(34, 26, XP.fur, XP.furDark, 30)}
        {hasBag && sack(-74, -118, 1.25)}
        {/* 全身の毛皮 (丸い体) */}
        <ellipse cx={0} cy={-150} rx={94} ry={92} fill={XP.fur} stroke={INK} strokeWidth={6} />
        <path d="M 40 -226 Q 100 -180 86 -110 Q 70 -76 40 -66 Q 80 -150 40 -226 Z" fill={XP.furDark} opacity={0.55} />
        <ellipse cx={-34} cy={-180} rx={30} ry={22} fill={XP.furLight} opacity={0.45} />
        <path d="M -84 -100 Q 0 -60 84 -100 Q 76 -72 40 -62 Q 0 -54 -40 -62 Q -76 -72 -84 -100 Z" fill={XP.furDark} stroke={INK} strokeWidth={4.5} />
        <rect x={-12} y={-232} width={24} height={150} rx={10} fill={XP.furDark} stroke={INK} strokeWidth={4} />
        {[-206, -170, -134].map((by) => <circle key={by} cx={0} cy={by} r={5} fill={XP.furPale} stroke={INK} strokeWidth={2.5} />)}
        {arm("l", -76, -200, ra, 74, 34, XP.fur, XP.furDark, XP.furDark)}
        {arm("r", 76, -200, rb, 74, 34, XP.fur, XP.furDark, XP.furDark)}
        {/* 毛皮のフード (頭の後ろ) */}
        <path d="M -78 -270 Q -86 -370 0 -378 Q 86 -370 78 -270 Q 70 -226 40 -224 L -40 -224 Q -70 -226 -78 -270 Z" fill={XP.fur} stroke={INK} strokeWidth={5.5} />
        {head(-286, 62, 58)}
        <path d="M -70 -318 Q -66 -364 0 -368 Q 66 -364 70 -318 Q 40 -344 0 -344 Q -40 -344 -70 -318 Z" fill={XP.furLight} stroke={INK} strokeWidth={4.5} />
        {/* 短いパイプと、頭のまわりの煙の輪 */}
        {pipe && (
          <g>
            <path d="M 10 -238 L 46 -228" stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <path d="M 10 -238 L 46 -228" stroke={XP.woodLight} strokeWidth={4} strokeLinecap="round" />
            <path d="M 40 -232 L 42 -252 L 58 -252 L 56 -228 Z" fill={XP.woodDark} stroke={INK} strokeWidth={3.5} />
            {[0, 1, 2].map((j) => {
              const q = ((f * 0.7 + j * 33) % 100) / 100;
              return <circle key={j} cx={52 + q * 30 + Math.sin(q * 6) * 8} cy={-262 - q * 90} r={7 + q * 16} fill="#D6D8DE" opacity={0.75 * (1 - q)} />;
            })}
          </g>
        )}
      </g>
    );
  } else if (era === "nast") {
    const navy = gr("#2F4A8A", "#5E5E5E");
    const navyD = gr("#22376A", "#474747");
    const rd = gr(XP.red, "#8E8E8E");
    const boot = gr("#2E2620", "#2F2F2F");
    const furC = gr(XP.fur, "#7A7A7A");
    const furL = gr(XP.furLight, "#B4B4B4");
    body = (
      <g>
        {/* しまのズボン */}
        {sit ? legs(34, 28, rd, boot, 40) : (
          <g>
            {[-1, 1].map((sd) => (
              <g key={sd}>
                <rect x={sd * 28 - 17} y={hip - 6} width={34} height={-hip - 30} fill={KRP.white} stroke={INK} strokeWidth={5} />
                {[-10, 0, 10].map((dx) => <rect key={dx} x={sd * 28 + dx - 3} y={hip - 4} width={6} height={-hip - 34} fill={rd} />)}
                <path d={`M ${sd * 28 - 20} -36 L ${sd * 28 + 20} -36 L ${sd * 28 + 20} -12 Q ${sd * 28 + sd * 46} -12 ${sd * 28 + sd * 48} 0 L ${sd * 28 - sd * 20} 0 Z`} fill={boot} stroke={INK} strokeWidth={4.5} />
              </g>
            ))}
          </g>
        )}
        {/* 星の上着 */}
        <path d="M -58 -268 Q -92 -236 -92 -160 L -96 -96 L 96 -96 L 92 -160 Q 92 -236 58 -268 Z" fill={navy} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 30 -262 Q 84 -220 84 -150 L 90 -100 L 54 -100 Q 62 -180 30 -262 Z" fill={navyD} opacity={0.7} />
        {[[-50, -230], [30, -236], [-66, -180], [-20, -196], [44, -180], [-48, -130], [10, -146], [62, -126], [-10, -240]].map(([sx, sy], i) => (
          <path key={i} d={starPath(17, 7)} transform={`translate(${sx} ${sy}) rotate(${i * 13})`} fill={KRP.white} stroke={INK} strokeWidth={2} />
        ))}
        <path d="M -94 -112 Q 0 -96 94 -112 L 96 -90 Q 0 -74 -96 -90 Z" fill={furL} stroke={INK} strokeWidth={4.5} />
        <path d="M -92 -170 L 92 -170 L 92 -150 L -92 -150 Z" fill={boot} stroke={INK} strokeWidth={4} />
        <rect x={-14} y={-174} width={28} height={28} fill="none" stroke={gr(XP.gold, "#C8C8C8")} strokeWidth={5} />
        {arm("l", -66, -248, ra, 100, 34, navy, KRP.white, furL)}
        {arm("r", 66, -248, rb, 100, 34, navy, KRP.white, furL)}
        {head(-320, 84, 60)}
        {/* 毛皮の帽子 */}
        <g transform={`translate(0 -328) rotate(${hatSw * 0.4})`}>
          <path d="M -54 -42 Q -50 -116 6 -118 Q 60 -110 54 -42 Z" fill={furC} stroke={INK} strokeWidth={5.5} />
          <path d="M -64 -48 Q -64 -66 -44 -62 Q 0 -72 44 -62 Q 64 -66 64 -48 Q 66 -30 44 -32 Q 0 -24 -44 -32 Q -66 -30 -64 -48 Z" fill={furL} stroke={INK} strokeWidth={5} />
          <rect x={-6} y={-118} width={12} height={20} fill={rd} stroke={INK} strokeWidth={3} />
        </g>
      </g>
    );
  } else if (era === "sinterklaas") {
    body = (
      <g>
        {horse && <g transform="scale(-1 1)"><WhiteHorse x={170} y={0} f={f} /></g>}
        {sit ? legs(30, 24, KRP.white, XP.red, 30) : (
          [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 26} cy={-6} rx={26} ry={12} fill={XP.redDark} stroke={INK} strokeWidth={4} />)
        )}
        {/* 白い長衣 (足もとまで) */}
        <path d="M -48 -268 L -70 -12 Q 0 2 70 -12 L 48 -268 Z" fill={KRP.white} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
        <path d="M 20 -260 L 40 -16 L 66 -14 L 46 -262 Z" fill={XP.snowShade} />
        <path d="M -66 -40 Q 0 -26 66 -40" stroke={XP.gold} strokeWidth={6} fill="none" />
        {/* 赤いマント (前が開いて白い長衣が見える) */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${sd * 8} -276 Q ${sd * 74} -270 ${sd * 82} -200 L ${sd * 102} -84 Q ${sd * 70} -70 ${sd * 30} -78 L ${sd * 22} -230 Z`}
              fill={XP.red} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
            <path d={`M ${sd * 22} -232 L ${sd * 30} -80 L ${sd * 46} -78 L ${sd * 38} -236 Z`} fill={XP.gold} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        <path d="M 56 -250 Q 86 -200 96 -96 L 76 -88 Q 74 -180 56 -250 Z" fill={XP.redDark} opacity={0.55} />
        <circle cx={0} cy={-256} r={12} fill={XP.gold} stroke={INK} strokeWidth={4} />
        {crozier(-118, -560)}
        {arm("l", -60, -248, pose === "stand" || pose === "sit" ? 30 : ra, 112, 32, XP.red, KRP.white, XP.gold)}
        {arm("r", 60, -248, rb, 112, 32, XP.red, KRP.white, XP.gold)}
        {head(-322, 150, 54)}
        {mitre(-344, false)}
      </g>
    );
  } else {
    // nicholas: 後ろ姿 (顔を描かない)。赤い祭服・白い長衣・後頭部の白髪・後ろから見たミトラ・杖
    body = (
      <g>
        {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 28} cy={-6} rx={26} ry={12} fill="#5A3A22" stroke={INK} strokeWidth={4} />)}
        <path d="M -52 -268 L -72 -12 Q 0 0 72 -12 L 52 -268 Z" fill={KRP.white} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
        <path d="M 24 -260 L 44 -14 L 70 -12 L 50 -262 Z" fill={XP.snowShade} />
        {/* 祭服 (釣り鐘形) と背中の金の帯 */}
        <path d="M -62 -280 Q -112 -250 -118 -130 L -112 -96 Q 0 -76 112 -96 L 118 -130 Q 112 -250 62 -280 Q 0 -296 -62 -280 Z" fill={XP.red} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 50 -276 Q 104 -240 110 -130 L 106 -98 L 70 -92 Q 90 -200 50 -276 Z" fill={XP.redDark} opacity={0.55} />
        <path d="M -12 -282 L 12 -282 L 12 -84 L -12 -84 Z" fill={XP.gold} stroke={INK} strokeWidth={3.5} />
        <path d="M -56 -276 L -12 -226 L -12 -204 L -62 -256 Z M 56 -276 L 12 -226 L 12 -204 L 62 -256 Z" fill={XP.gold} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M -110 -104 Q 0 -84 110 -104" stroke={XP.gold} strokeWidth={7} fill="none" />
        {/* ミトラの垂れ布 (頭の後ろから背中へ。頭より先に描く) */}
        {[-1, 1].map((sd) => (
          <g key={`lp${sd}`} transform={`rotate(${sd * 3 + Math.sin(f / 16 + sd) * 1.5} ${sd * 22} -380)`}>
            <path d={`M ${sd * 10} -382 L ${sd * 36} -382 L ${sd * 40} -196 L ${sd * 8} -196 Z`} fill={XP.red} stroke={INK} strokeWidth={4.5} />
            <path d={`M ${sd * 12} -230 L ${sd * 38} -230`} stroke={XP.gold} strokeWidth={6} />
            {[0, 1, 2, 3].map((j) => <line key={j} x1={sd * (12 + j * 8)} y1={-196} x2={sd * (12 + j * 8)} y2={-184} stroke={XP.goldDark} strokeWidth={4} strokeLinecap="round" />)}
          </g>
        ))}
        {crozier(-124, -580)}
        {arm("l", -70, -250, pose === "stand" || pose === "sit" ? 30 : ra, 112, 34, KRP.white, KRP.white, XP.gold)}
        {arm("r", 70, -250, rb, 112, 34, KRP.white, KRP.white, XP.gold)}
        {/* 耳と、横からはみ出す白いひげ (前を向いた顔は描かない) */}
        <g transform="translate(0 -324)">
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <path d={`M ${sd * 40} 30 Q ${sd * 76} 40 ${sd * 66} 86 Q ${sd * 48} 70 ${sd * 30} 50 Z`} fill={XP.beard} stroke={INK} strokeWidth={4} />
              <ellipse cx={sd * 60} cy={4} rx={11} ry={16} fill={KRP.white} stroke={INK} strokeWidth={4} />
            </g>
          ))}
          {/* うなじ (肌) と、後頭部をおおう白髪 (肌より灰色がかった色で、髪の房のかたまりを塗りで描く) */}
          <rect x={-26} y={36} width={52} height={34} rx={10} fill={KRP.white} stroke={INK} strokeWidth={4.5} />
          <path d="M -60 4 Q -62 -60 0 -62 Q 62 -60 60 4 Q 62 40 44 52 Q 34 44 24 56 Q 12 46 0 58 Q -12 46 -24 56 Q -34 44 -44 52 Q -62 40 -60 4 Z"
            fill="#D9D5CB" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
          <path d="M -40 -40 Q -20 -10 -30 30 Q -42 0 -40 -40 Z M 6 -48 Q 24 -10 14 36 Q 0 0 6 -48 Z M 40 -30 Q 52 0 40 34 Q 32 4 40 -30 Z" fill="#EEEBE4" />
          <path d="M -50 20 Q -40 40 -26 46 M 50 20 Q 42 40 28 46" stroke="#BDB8AC" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        {mitre(-338, true)}
      </g>
    );
  }
  const scl = flip ? -k : k;
  return (
    <g transform={`translate(${x} ${y + (sit ? 0 : bob)}) rotate(${lean}) scale(${scl} ${k})`}>
      {back && <ellipse cx={0} cy={0} rx={110} ry={14} fill={INK} opacity={0.12} />}
      {!back && !sit && <ellipse cx={0} cy={0} rx={era === "classic" || era === "dutch" ? 130 : 100} ry={14} fill={INK} opacity={0.12} />}
      <g transform={sit ? `translate(0 ${-hip + bob})` : undefined}>{body}</g>
    </g>
  );
};

// シンタクラースの白い馬 (右向き・足元 y)。Santa era="sinterklaas" horse で後ろに出る
const WhiteHorse: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const nod = Math.sin(f / 24) * 3;
  const blink = (f % 89) < 5 && f > 2;
  const wh = "#F4F2EC", sh = "#D9D5CA";
  const leg = (lx: number, back: boolean, key: string) => (
    <g key={key}>
      <rect x={lx - 13} y={-170} width={26} height={160} rx={12} fill={back ? sh : wh} stroke={INK} strokeWidth={5} />
      <path d={`M ${lx - 15} -16 L ${lx + 15} -16 L ${lx + 17} 0 L ${lx - 17} 0 Z`} fill="#6E6A62" stroke={INK} strokeWidth={4} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {leg(-80, true, "a")}{leg(110, true, "b")}
      <path d={`M -150 -230 Q -196 -190 -184 -110 Q -170 -150 -150 -200 Z`} fill={sh} stroke={INK} strokeWidth={4.5} transform={`rotate(${Math.sin(f / 8) * 5} -150 -230)`} />
      <ellipse cx={0} cy={-220} rx={160} ry={72} fill={wh} stroke={INK} strokeWidth={6} />
      <path d="M -140 -190 Q 0 -140 140 -190 Q 120 -160 0 -152 Q -120 -160 -140 -190 Z" fill={sh} />
      {/* 赤い鞍の布 (金の縁) */}
      <path d="M -70 -286 L 50 -286 L 60 -176 L -80 -176 Z" fill={XP.red} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -78 -186 L 58 -186" stroke={XP.gold} strokeWidth={8} />
      <g transform={`rotate(${nod} 120 -250)`}>
        <path d="M 100 -270 Q 140 -340 190 -380 L 236 -350 Q 200 -300 176 -200 Z" fill={wh} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* たてがみ */}
        <path d="M 104 -276 Q 120 -330 176 -384 Q 160 -340 150 -300 Q 134 -280 104 -276 Z" fill={sh} stroke={INK} strokeWidth={4} />
        <g transform="translate(214 -372) rotate(-38)">
          <path d="M -8 -52 L -2 -96 L 14 -56 Z" fill={wh} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={0} cy={0} rx={32} ry={66} fill={wh} stroke={INK} strokeWidth={6} />
          <ellipse cx={2} cy={44} rx={26} ry={22} fill="#E6E1D6" />
          <ellipse cx={10} cy={54} rx={4} ry={6} fill={INK} />
          {/* 頭絡 (赤い革ひも) */}
          <ellipse cx={0} cy={26} rx={32} ry={9} fill="none" stroke={XP.red} strokeWidth={6} />
          <path d="M -30 -30 Q 0 -40 30 -30" stroke={XP.red} strokeWidth={6} fill="none" />
          {blink ? <line x1={-10} y1={-18} x2={8} y2={-18} stroke={INK} strokeWidth={4} strokeLinecap="round" />
            : <g><circle cx={0} cy={-18} r={8} fill={INK} /><circle cx={3} cy={-21} r={2.5} fill={KRP.white} /></g>}
        </g>
      </g>
      {leg(-100, false, "c")}{leg(90, false, "d")}
    </g>
  );
};

/* ===================================================================
 * Kodomo — 子ども (8章・B の昭和の家族など)
 *   x,y: 足元の中央。s=1 で 高さ約 270px (既定 s=0.75 で約 200px。大人の Person s=1 は約 300px)
 *   girl: true で女の子 (肩まで届く茶色の髪+赤いリボン・ピンクの服・スカート) / false で男の子 (短い黒髪・青い服・ズボン)
 *   belief: 1 = 信じている顔 (目がきらきら・ほおが赤い・大きな笑顔) → 0 = 気づいた顔 (半目で横目・にやり)
 *   face を渡すと口とまゆは face が決める (目のきらきら/半目は belief のまま)
 *   pose: Person と同じ名前 (stand / banzai / raise / point / hold / run / sit。armsFolded・hang は hold あつかい)
 * =================================================================== */
export const Kodomo: React.FC<{
  x: number; y: number; s?: number; f: number; girl?: boolean; belief?: number;
  pose?: Pose; face?: Face; gaze?: [number, number]; phase?: number; lean?: number;
  cloth?: string; clothDark?: string; pointDir?: 1 | -1;
}> = ({ x, y, s = 0.75, f, girl = false, belief = 1, pose = "stand", face, gaze = [0, 0], phase = 0, lean = 0, cloth, clothDark, pointDir = 1 }) => {
  const b = clamp01(belief);
  const bob = Math.sin((f + phase * 17) / 12) * 3 + (b > 0.6 && !face ? -Math.abs(Math.sin(f / 7 + phase)) * 4 * b : 0);
  const blink = ((f + phase * 41) % 97) < 5 && f > 2 && face !== "joy";
  const top = cloth ?? (girl ? "#E58AA8" : "#4A78B8");
  const topD = clothDark ?? (girl ? "#C2607F" : "#34548F");
  const pants = girl ? XP.red : "#2E3850";
  const sway = Math.sin((f + phase * 17) / 9) * 3;
  const swing = Math.sin((f + phase * 13) / 5) * 10;
  const p: Pose = pose === "armsFolded" || pose === "hang" ? "hold" : pose;
  const [la, rA] = p === "banzai" ? [135 + sway, -135 - sway] : p === "raise" ? [0, 180] : p === "point" ? (pointDir === 1 ? [0, -90] : [90, 0])
    : p === "run" ? [38 - swing, -118 + swing] : p === "sit" ? [22, -22] : [4, -4];
  const arm = (sd: -1 | 1, rot: number) => (
    <g transform={`rotate(${rot} ${sd * 46} -140)`}>
      <rect x={sd * 46 - 10} y={-148} width={20} height={64} rx={10} fill={top} stroke={INK} strokeWidth={4.5} />
      <circle cx={sd * 46} cy={-80} r={10} fill={KRP.white} stroke={INK} strokeWidth={4} />
    </g>
  );
  const [gx0, gy] = gaze;
  const gx = gx0 + (1 - b) * 6;
  const lid = (1 - b) * 15; // まぶたの下がり
  const mouthByBelief = () => b > 0.66 ? (
    <g><path d="M -20 26 Q 0 56 20 26 Z" fill={INK} /><ellipse cx={0} cy={40} rx={8} ry={4} fill="#E06A5A" /></g>
  ) : b > 0.33 ? (
    <path d="M -14 30 Q 0 44 14 30" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
  ) : (
    <path d="M -14 36 Q 4 38 16 28" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
  );
  const mouthByFace = (fc: Face) => fc === "surprised" ? <ellipse cx={0} cy={36} rx={9} ry={12} fill={INK} />
    : fc === "smile" ? <path d="M -14 28 Q 0 42 14 28" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    : fc === "joy" ? <g><path d="M -20 26 Q 0 56 20 26 Z" fill={INK} /><ellipse cx={0} cy={40} rx={8} ry={4} fill="#E06A5A" /></g>
    : fc === "worried" || fc === "sad" ? <path d="M -12 38 Q 0 30 12 38" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    : fc === "angry" ? <path d="M -14 40 Q 0 28 14 40" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    : <line x1={-9} y1={34} x2={9} y2={34} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />;
  const browTilt = face === "worried" || face === "sad" ? 10 : face === "angry" ? -12 : 0;
  const browY = face === "surprised" ? -40 : -32;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 足 */}
      {p === "run" ? (
        <g>
          <g transform="rotate(-30 -14 -60)"><rect x={-24} y={-60} width={20} height={54} fill={girl ? KRP.white : pants} stroke={INK} strokeWidth={4.5} /><ellipse cx={-14} cy={-6} rx={17} ry={8} fill={girl ? XP.redDark : INK} /></g>
          <g transform="rotate(32 14 -60)"><rect x={4} y={-60} width={20} height={54} fill={girl ? KRP.white : pants} stroke={INK} strokeWidth={4.5} /><ellipse cx={14} cy={-6} rx={17} ry={8} fill={girl ? XP.redDark : INK} /></g>
        </g>
      ) : p === "sit" ? (
        <g>
          <g transform="rotate(14 -14 -60)"><rect x={-24} y={-60} width={20} height={44} fill={girl ? KRP.white : pants} stroke={INK} strokeWidth={4.5} /><ellipse cx={-16} cy={-14} rx={16} ry={8} fill={girl ? XP.redDark : INK} /></g>
          <g transform="rotate(-44 14 -60)"><rect x={4} y={-60} width={20} height={40} fill={girl ? KRP.white : pants} stroke={INK} strokeWidth={4.5} /><ellipse cx={18} cy={-18} rx={16} ry={8} fill={girl ? XP.redDark : INK} /></g>
        </g>
      ) : (
        <g>
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <rect x={sd * 14 - 10} y={girl ? -66 : -96} width={20} height={girl ? 60 : 90} fill={girl ? KRP.white : pants} stroke={INK} strokeWidth={4.5} />
              <ellipse cx={sd * 16} cy={-6} rx={17} ry={8} fill={girl ? XP.redDark : INK} />
            </g>
          ))}
        </g>
      )}
      {/* 女の子の後ろ髪 (肩まで) */}
      {girl && (
        <g transform="translate(0 -206)">
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 30} -40 Q ${sd * 78} -20 ${sd * 72} 50 Q ${sd * 70} 84 ${sd * 50} 92 Q ${sd * 40} 70 ${sd * 42} 40 Q ${sd * 40} 0 ${sd * 30} -10 Z`}
              fill={XP.hairBrown} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          ))}
        </g>
      )}
      {/* 腕 (後ろの層) */}
      {p !== "hold" && <g>{arm(-1, la)}{arm(1, rA)}</g>}
      {/* 胴と、男の子のズボンの上・女の子のスカート */}
      <rect x={-40} y={-152} width={80} height={girl ? 46 : 64} rx={14} fill={top} stroke={INK} strokeWidth={5} />
      <path d="M -40 -140 Q 0 -128 40 -140" stroke={topD} strokeWidth={4} fill="none" opacity={0.7} />
      {girl ? (
        <g>
          <path d="M -38 -112 L 38 -112 L 62 -54 Q 0 -44 -62 -54 Z" fill={pants} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -60 -60 Q 0 -50 60 -60" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.8} />
          <path d="M -14 -108 L -24 -58 M 14 -108 L 24 -58" stroke={XP.redDark} strokeWidth={3.5} opacity={0.6} />
        </g>
      ) : (
        <rect x={-40} y={-98} width={80} height={14} rx={4} fill={pants} stroke={INK} strokeWidth={4} />
      )}
      {/* 体の前で持つ両腕 */}
      {p === "hold" && (
        <g>
          <rect x={-56} y={-148} width={20} height={50} rx={10} fill={top} stroke={INK} strokeWidth={4.5} transform="rotate(-58 -46 -140)" />
          <rect x={36} y={-148} width={20} height={50} rx={10} fill={top} stroke={INK} strokeWidth={4.5} transform="rotate(58 46 -140)" />
          <circle cx={-12} cy={-116} r={9} fill={KRP.white} stroke={INK} strokeWidth={4} />
          <circle cx={12} cy={-116} r={9} fill={KRP.white} stroke={INK} strokeWidth={4} />
        </g>
      )}
      {p === "point" && <circle cx={pointDir * 112} cy={-140} r={10} fill={KRP.white} stroke={INK} strokeWidth={4} />}
      {/* 頭 */}
      <g transform="translate(0 -206)">
        <circle cx={0} cy={0} r={60} fill={KRP.white} stroke={INK} strokeWidth={5.5} />
        {girl ? (
          <g>
            <path d="M -60 -4 Q -64 -64 0 -66 Q 64 -64 60 -4 Q 50 -30 34 -30 Q 26 -18 14 -30 Q 4 -20 -8 -30 Q -18 -18 -30 -30 Q -48 -30 -60 -4 Z" fill={XP.hairBrown} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M -36 -52 Q -10 -60 14 -56" stroke="#9A6A44" strokeWidth={6} fill="none" opacity={0.7} strokeLinecap="round" />
            {/* 赤いリボン */}
            <g transform={`translate(44 -50) rotate(${20 + Math.sin(f / 15) * 4})`}>
              <path d="M 0 0 L -22 -14 L -22 14 Z M 0 0 L 22 -14 L 22 14 Z" fill={XP.red} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
              <circle cx={0} cy={0} r={6} fill={XP.red} stroke={INK} strokeWidth={3} />
            </g>
          </g>
        ) : (
          <path d="M -58 -12 Q -60 -62 0 -64 Q 60 -62 58 -12 Q 28 -34 0 -34 Q -28 -34 -58 -12 Z" fill={INK} />
        )}
        {/* ほお (信じているほど赤い) */}
        <circle cx={-36} cy={16} r={10} fill={XP.cheek} opacity={0.2 + 0.6 * b} />
        <circle cx={36} cy={16} r={10} fill={XP.cheek} opacity={0.2 + 0.6 * b} />
        {/* 目 */}
        {face === "joy" ? (
          <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round"><path d="M -32 2 Q -22 -12 -12 2" /><path d="M 12 2 Q 22 -12 32 2" /></g>
        ) : blink ? (
          <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><line x1={-32} y1={0} x2={-12} y2={0} /><line x1={12} y1={0} x2={32} y2={0} /></g>
        ) : (
          <g>
            {[-1, 1].map((sd) => (
              <g key={sd}>
                <ellipse cx={sd * 22} cy={-2} rx={13} ry={17} fill={KRP.white} stroke={INK} strokeWidth={4} />
                <circle cx={sd * 22 + gx} cy={-2 + gy} r={face === "surprised" ? 5 : 7.5} fill={INK} />
                {/* きらきら (信じている目) */}
                <circle cx={sd * 22 + gx + 3} cy={-6 + gy} r={2.8 * b + 0.6} fill={KRP.white} />
                <circle cx={sd * 22 + gx - 3} cy={1 + gy} r={1.6 * b} fill={KRP.white} />
                {/* まぶた (気づいた半目) */}
                {lid > 0.5 && (
                  <g>
                    <path d={`M ${sd * 22 - 14} ${-19} L ${sd * 22 + 14} ${-19} L ${sd * 22 + 14} ${-19 + lid} L ${sd * 22 - 14} ${-19 + lid} Z`} fill={KRP.white} />
                    <line x1={sd * 22 - 14} y1={-19 + lid} x2={sd * 22 + 14} y2={-19 + lid} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
                  </g>
                )}
              </g>
            ))}
          </g>
        )}
        {/* まゆ */}
        {[-1, 1].map((sd) => (
          <line key={sd} x1={sd * 12} y1={browY - (face ? 0 : (sd > 0 ? (1 - b) * 4 : 0))} x2={sd * 32} y2={browY - 2 - (face ? 0 : (sd > 0 ? (1 - b) * 6 : 0))}
            stroke={girl ? XP.hairBrownDark : INK} strokeWidth={4.5} strokeLinecap="round" transform={`rotate(${sd * browTilt} ${sd * 22} ${browY})`} />
        ))}
        {/* 口 */}
        {face ? mouthByFace(face) : mouthByBelief()}
      </g>
    </g>
  );
};

/* ===================================================================
 * Anata — あなた (A・B 共通のメインキャラクター)。Person のラッパー
 *   props は Person と同じ (x, y, s, f, face, pose, gaze, lean, phase, still, pointDir …)。cloth は既定で緑のセーター
 *   胸に白い雪の結晶の柄1つ・セーターのすそと首のゴム編み。性別の記号は付けない (hair="cap" 固定でもよい)
 * =================================================================== */
export const Anata: React.FC<PersonProps> = (props) => {
  const { x, y, s = 1, f = 0, phase = 0, still = false, lean = 0, cloth = XP.you, clothDark = XP.youDark } = props;
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person hair="cap" {...props} cloth={cloth} clothDark={clothDark} />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* すそと首のゴム編み */}
        <rect x={-58} y={-66} width={116} height={14} rx={6} fill={clothDark} stroke={INK} strokeWidth={4} />
        <g stroke={cloth} strokeWidth={3}>{Array.from({ length: 9 }, (_, i) => <line key={i} x1={-48 + i * 12} y1={-64} x2={-48 + i * 12} y2={-54} />)}</g>
        <path d="M -30 -160 Q 0 -146 30 -160" stroke={clothDark} strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* 白い雪の結晶 */}
        <SnowCrystal x={-22} y={-96} r={17} w={4} />
        <circle cx={-22} cy={-96} r={3.5} fill={KRP.white} />
      </g>
    </g>
  );
};

/* ===================================================================
 * プレビュー (1コマ = 1部品の見本)。Root.tsx の Composition "XmasParts"
 *   npx remotion still XmasParts tmp/xmas/parts-NN.png --frame=NN
 * =================================================================== */
const SANTA_ERAS: SantaEra[] = ["nicholas", "sinterklaas", "dutch", "1821", "1823", "nast", "red", "classic"];
export const XMAS_PARTS_PREVIEW_FRAMES = 33; // 31・32 は 25・26 の look="own" 版
export const XmasPartsPreview: React.FC = () => {
  const fr = useCurrentFrame();
  const f = 30 + fr * 7;
  const paper = <rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />;
  const night = <rect x={0} y={0} width={1920} height={1080} fill={XP.night} />;
  if (fr === 0) return (
    <Frame f={f} seed={90}>
      <XmasRoom f={f} style="west" era="now" lit={1} />
      <XmasTree x={1440} y={940} s={0.95} f={f} mode="lights" lit={1} />
      <Stocking x={630} y={504} s={0.5} f={f} content="candy" />
      <Stocking x={760} y={504} s={0.5} f={f} content="present" />
      <Stocking x={890} y={504} s={0.5} f={f} content="none" />
      <Present x={1300} y={980} s={0.7} f={f} />
      <Present x={1560} y={990} s={0.6} f={f} color="#4E7FC4" ribbon={XP.red} />
      <Anata x={420} y={980} s={1} f={f} face="smile" pose="point" pointDir={1} />
    </Frame>
  );
  if (fr === 1) return <Frame f={f} seed={91} dark><XmasRoom f={f} style="west" era="1800s" lit={0.2} /><XmasTree x={1440} y={940} s={0.9} f={f} mode="candle" lit={1} /></Frame>;
  if (fr === 2) return <Frame f={f} seed={92}><XmasRoom f={f} style="west" era="showa" lit={0.7} /></Frame>;
  if (fr === 3) return (
    <Frame f={f} seed={93}>
      <XmasRoom f={f} style="japan" era="showa" lit={1} />
      <Kodomo x={700} y={900} s={0.75} f={f} girl pose="sit" belief={1} />
    </Frame>
  );
  if (fr === 4) return <Frame f={f} seed={94} dark><XmasRoom f={f} style="japan" era="now" lit={0.25} /></Frame>;
  if (fr === 5) return <Frame f={f} seed={95}><XmasRoom f={f} style="japan" era="1800s" lit={0.6} /></Frame>;
  if (fr === 6) return (
    <Frame f={f} seed={96}>
      {paper}
      <XmasTree x={260} y={1000} s={0.75} f={f} mode="lights" lit={0.35} />
      <XmasTree x={740} y={1000} s={0.75} f={f} mode="lights" lit={1} />
      <XmasTree x={1220} y={1000} s={0.75} f={f} mode="candle" lit={1} />
      <XmasTree x={1680} y={1000} s={0.75} f={f} mode="none" />
    </Frame>
  );
  if (fr === 7) return (
    <Frame f={f} seed={97}>
      {paper}
      <Present x={220} y={700} s={1.2} f={f} />
      <Present x={580} y={700} s={1.2} f={f} wrap="messy" color={XP.green} ribbon={XP.red} />
      <Present x={960} y={700} s={1.2} f={f} open={0.35} color="#4E7FC4" ribbon={XP.gold} />
      <Present x={1340} y={700} s={1.2} f={f} open={0.7} />
      <Present x={1700} y={700} s={1.2} f={f} open={1} wrap="messy" color={XP.gold} ribbon={XP.red} />
    </Frame>
  );
  if (fr === 8) return (
    <Frame f={f} seed={98}>
      {paper}
      <rect x={100} y={300} width={1720} height={20} fill={XP.wood} stroke={INK} strokeWidth={5} />
      <Stocking x={340} y={316} s={1.3} f={f} content="candy" />
      <Stocking x={760} y={316} s={1.3} f={f} content="twig" />
      <Stocking x={1180} y={316} s={1.3} f={f} content="present" color={XP.green} />
      <Stocking x={1600} y={316} s={1.3} f={f} content="none" />
    </Frame>
  );
  if (fr >= 9 && fr <= 14) {
    const eras = ["1800s", "showa", "now"] as const;
    const i = fr - 9;
    return <Frame f={f} seed={99 + i} dark><SnowTown f={f} era={eras[i % 3]} place={i < 3 ? "ny" : "tokyo"} /></Frame>;
  }
  if (fr === 15) return (
    <Frame f={f} seed={110} dark>
      {night}
      <SnowFall f={f} n={60} />
      <Sori x={500} y={800} s={1} f={f} fly={0} bag />
      <Sori x={1400} y={600} s={1} f={f} fly={1} bag />
    </Frame>
  );
  if (fr === 16) return (
    <Frame f={f} seed={111}>
      {paper}
      <Tonakai x={380} y={900} s={1} f={f} />
      <Tonakai x={1020} y={900} s={1} f={f} run={1} nose="red" harness face="smile" />
      <Tonakai x={1600} y={900} s={0.8} f={f} antler={0.15} face="surprised" />
    </Frame>
  );
  if (fr === 17) return (
    <Frame f={f} seed={112}>
      {paper}
      {Array.from({ length: 8 }, (_, i) => (
        <Tonakai key={i} x={210 + (i % 4) * 470} y={i < 4 ? 480 : 1010} s={0.6} f={f} kind={i} harness phase={i} run={i % 2 ? 0.6 : 0} />
      ))}
    </Frame>
  );
  if ((fr >= 18 && fr <= 25) || fr === 31) {
    const era = fr === 31 ? "classic" : SANTA_ERAS[fr - 18];
    const look = fr === 31 ? "own" : "main";
    return (
      <Frame f={f} seed={113 + fr}>
        {paper}
        <rect x={0} y={960} width={1920} height={120} fill={KRP.floor} />
        <Person x={240} y={960} s={1} f={f} face="normal" cloth="#3E4B66" />
        <Santa x={720} y={960} s={1.25} f={f} era={era} face="smile" horse={era === "sinterklaas"} look={look} />
        <Santa x={1300} y={960} s={1.25} f={f} era={era} pose="wave" face="joy" mono={era === "nast"} buckle="flip" bag phase={3} look={look} />
        <Santa x={1720} y={960} s={1.25} f={f} era={era} pose="hold" face="surprised" phase={5} look={look} />
      </Frame>
    );
  }
  if (fr === 26 || fr === 32) return (
    <Frame f={f} seed={140}>
      {paper}
      <rect x={0} y={960} width={1920} height={120} fill={KRP.floor} />
      <Person x={110} y={960} s={1} f={f} />
      {SANTA_ERAS.map((era, i) => <Santa key={era} x={330 + i * 215} y={960} s={0.82} f={f} era={era} phase={i} look={fr === 32 ? "own" : "main"} />)}
    </Frame>
  );
  if (fr === 27) return (
    <Frame f={f} seed={141}>
      {paper}
      {[1, 0.5, 0].map((b, i) => (
        <g key={i}>
          <Kodomo x={300 + i * 620} y={980} s={1.1} f={f} belief={b} />
          <Kodomo x={560 + i * 620} y={980} s={1.1} f={f} girl belief={b} phase={2} />
        </g>
      ))}
    </Frame>
  );
  if (fr === 28) return (
    <Frame f={f} seed={142}>
      {paper}
      {(["stand", "banzai", "raise", "point", "hold", "run", "sit"] as Pose[]).map((p, i) => (
        <Kodomo key={p} x={170 + i * 265} y={i % 2 ? 980 : 940} s={0.95} f={f} girl={i % 2 === 0} pose={p} face={i === 4 ? "surprised" : undefined} phase={i} />
      ))}
    </Frame>
  );
  if (fr === 29) return (
    <Frame f={f} seed={143}>
      {paper}
      {(["stand", "banzai", "point", "hold", "armsFolded", "run"] as Pose[]).map((p, i) => (
        <Anata key={p} x={200 + i * 300} y={960} s={1} f={f} pose={p} face={(["smile", "joy", "normal", "surprised", "worried", "smile"] as Face[])[i]} phase={i} />
      ))}
    </Frame>
  );
  return (
    <Frame f={f} seed={144} dark>
      <SnowTown f={f} era="1800s" place="ny" />
      {[0, 1, 2, 3].map((i) => <Tonakai key={i} x={1400 + Math.floor(i / 2) * 220 + (i % 2) * 40} y={330 + (i % 2) * 90 - Math.floor(i / 2) * 30} s={0.42} f={f} run={1} kind={i} harness phase={i * 2} nose={i === 3 ? "red" : "normal"} />)}
      <Sori x={1040} y={560} s={0.7} f={f} fly={1} bag />
      {(() => { const [sx, sy, sl] = soriSeat(1040, 560, 0.7, f, 1); return <Santa x={sx} y={sy} lean={sl} s={0.7} f={f} era="classic" pose="sit" face="joy" />; })()}
      <Sori x={1040} y={560} s={0.7} f={f} fly={1} front />
    </Frame>
  );
};
void lerp;
