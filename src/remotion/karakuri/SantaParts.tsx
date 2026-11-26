// クリスマス回A「サンタクロースは、だれが作ったのか」だけで何度も出てくる装置と舞台。
// 名前と props の正本: docs/santa-design-common.md「A だけの部品 (SantaParts.tsx)」
//
// ★ここにある物は、別々の絵師が別々の章で描く「同じ物」。毎回この部品を使い、描き直さない (絵のブレ禁止)。
// ★props の形 (シグネチャ) を勝手に変えない。並走中の全員がこの形で呼ぶ。
// ★舞台 (KumitateDai / YougishaBoard / NoradRoom / YubinTana) は 1920×1080 いっぱいの <g>。人は入れない (シーン側で置く)。
// ★ロゴ・看板の文字は描かない。明かりは「明るい色の重ね」で出す (黒い図形の点滅にしない)。
//
// サンタの部品 (組み立て台の皿の番号 = 台本の順):
//   1 金の袋 / 2 名札 / 3 太った体 (クッション) とパイプ / 4 靴下2本 / 5 ソリと樺のムチ /
//   6 白いひげ / 7 帳簿 (良い子・悪い子) / 8 赤い服 / 9 人間の大きさ (大きな長ぐつ) /
//   10 赤い鼻 / 11 宛先 (切手と消印の封筒) / 12 証拠 (追跡のレーダー) / 13 あなた (緑の飾り玉と雪の結晶)

import React from "react";
import { KRP, KARAKURI_FONT, seg, easeOut, clamp01, pop } from "./KarakuriScenes";

const FONT = KARAKURI_FONT;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const INK = KRP.ink;

// 装置専用の色 (シーン側でも使ってよい)
export const SP = {
  red: "#C9352B",
  redDark: "#8E2219",
  redLight: "#E8695A",
  gold: "#E3B53C",
  goldDark: "#A9812A",
  goldLight: "#F7DC86",
  snow: "#FBF8F2",
  you: "#4E9A5C", // あなたの緑 (XmasParts の XP.you ができたら合わせる)
  youDark: "#346E40",
  // 木
  wood: "#C9965E",
  woodMid: "#A9763F",
  woodDark: "#7A5230",
  woodLight: "#E2B984",
  grain: "#B88450",
  // 工房の壁
  wall: "#E4D3B3",
  wallShade: "#CDB892",
  peg: "#D8B98A",
  // 容疑者ボード
  cork: "#C99A63",
  corkDark: "#A87A45",
  corkDot: "#8E6434",
  string: "#D3402E",
  card: "#FBF6EA",
  cardPic: "#E9E1CF",
  roomWall: "#4F5A4A",
  roomWallDark: "#3E4839",
  lampGlow: "#FFE7A8",
  // 作戦室
  opsWall: "#55646F",
  opsWallDark: "#44515B",
  opsFloor: "#3E4A52",
  mapBoard: "#22384E",
  mapGrid: "#4A6C8C",
  land: "#9CC59A",
  landDark: "#6E9A6C",
  console: "#8A9A8C",
  consoleDark: "#66766A",
  scope: "#123826",
  scopeLine: "#3FAE6A",
  scopeGlow: "#B8FFC9",
  phoneGray: "#5E6670",
  // 郵便局
  postWall: "#DCD2B4",
  postWallShade: "#C6BA98",
  cubby: "#5A3F29",
  envelope: "#F6F0DE",
  envelopeBlue: "#DCE7F0",
  envelopePink: "#F4DCD6",
  stampInk: "#5B6E9A",
  brass: "#D9B23C",
  brassDark: "#A8862A",
} as const;

// 4つ角のきらめき (明かりは明るい色で)
const Kira: React.FC<{ x: number; y: number; r: number; o?: number; c?: string }> = ({ x, y, r, o = 1, c = "#FFF6C8" }) => (
  <path d={`M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}
    Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`}
    fill={c} opacity={o} />
);

// 歯車の形
const gearPath = (r: number, teeth: number, depth = 12) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const w = (Math.PI * 2) / teeth;
    const as = [a0, a0 + w * 0.18, a0 + w * 0.5, a0 + w * 0.68];
    const rs = [r, r + depth, r + depth, r];
    as.forEach((a, k) => pts.push(`${(Math.cos(a) * rs[k]).toFixed(1)},${(Math.sin(a) * rs[k]).toFixed(1)}`));
  }
  return `M ${pts.join(" L ")} Z`;
};

// 雪の結晶 (6本の腕に小枝)
const Snowflake: React.FC<{ x: number; y: number; r: number; c?: string; w?: number }> = ({ x, y, r, c = SP.snow, w = 4 }) => (
  <g transform={`translate(${x} ${y})`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none">
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <line x1={0} y1={0} x2={0} y2={-r} />
        <path d={`M ${-r * 0.28} ${-r * 0.72} L 0 ${-r * 0.5} L ${r * 0.28} ${-r * 0.72}`} />
      </g>
    ))}
  </g>
);

/* ===================================================================
 * SantaBuhin — サンタの部品 1つ (組み立て台の皿・容疑者ボードの札・シーン側の小物で同じ絵)
 *   x,y: 部品の底の中心 (皿に乗る点)。s=1 で 幅約130・高さ約120
 *   n: 部品の番号 1〜13 (ファイル冒頭の一覧)
 *   f: きらめき・煙・レーダーの針などの動き
 * =================================================================== */
export const SantaBuhin: React.FC<{ x: number; y: number; s?: number; f?: number; n: number; rot?: number }> = ({
  x, y, s = 1, f = 0, n, rot = 0,
}) => {
  const tw = 0.5 + 0.5 * Math.sin(f / 6 + n);
  const shadow = <ellipse cx={0} cy={-1} rx={54} ry={8} fill={INK} opacity={0.16} />;
  let body: React.ReactNode = null;
  if (n === 1) {
    // 金の袋 (窓から投げ入れた金貨の袋)
    body = (
      <g>
        {shadow}
        <path d="M -46 -4 Q -64 -52 -24 -80 L 24 -80 Q 64 -52 46 -4 Q 0 6 -46 -4 Z" fill={SP.gold} stroke={INK} strokeWidth={5} />
        <path d="M -30 -18 Q -42 -48 -16 -70" stroke={SP.goldLight} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d="M 30 -14 Q 38 -36 28 -58" stroke={SP.goldDark} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
        <path d="M -24 -80 Q -36 -100 -18 -110 Q 0 -98 18 -110 Q 36 -100 24 -80 Z" fill={SP.goldDark} stroke={INK} strokeWidth={4.5} />
        <path d="M -27 -82 Q 0 -74 27 -82" stroke={SP.red} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M 6 -78 q 8 14 2 26 M 10 -78 q 16 8 18 22" stroke={SP.red} strokeWidth={5} fill="none" strokeLinecap="round" />
        {[[50, -10], [32, -4], [62, -2]].map(([cx, cy], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={14} ry={i === 2 ? 6 : 13} fill={SP.gold} stroke={INK} strokeWidth={4} />
            {i !== 2 && <circle cx={cx} cy={cy} r={7} fill="none" stroke={SP.goldDark} strokeWidth={3} />}
          </g>
        ))}
        <Kira x={-14} y={-52} r={12 + tw * 6} o={0.5 + tw * 0.5} />
        <Kira x={50} y={-26} r={6 + (1 - tw) * 5} o={0.7} />
      </g>
    );
  } else if (n === 2) {
    // 名札 (字は描かない。手書きの線)
    body = (
      <g>
        {shadow}
        <path d="M -30 -92 Q -10 -126 18 -112" stroke={SP.red} strokeWidth={5} fill="none" strokeLinecap="round" />
        <g transform="rotate(-8 0 -50)">
          <rect x={-56} y={-92} width={112} height={84} rx={12} fill={SP.card} stroke={INK} strokeWidth={5} />
          <rect x={-46} y={-82} width={92} height={64} rx={8} fill="none" stroke={SP.red} strokeWidth={3.5} />
          <circle cx={-40} cy={-76} r={6} fill={SP.cardPic} stroke={INK} strokeWidth={3} />
          <path d="M -28 -58 q 8 -10 14 0 t 14 0 t 14 0 t 14 0" stroke={KRP.blueDeep} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M -30 -36 q 10 -8 18 0 t 18 0 t 18 0" stroke={KRP.blueDeep} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
        <Kira x={40} y={-96} r={8 + tw * 5} o={0.4 + tw * 0.5} />
      </g>
    );
  } else if (n === 3) {
    // 太った体 (まんまるのクッション) とパイプ。煙がゆらゆら上る
    const puff = (k: number) => {
      const p = ((f / 50) + k / 3) % 1;
      return <circle key={k} cx={30 + Math.sin(p * 6 + k) * 8} cy={-92 - p * 60} r={6 + p * 10}
        fill={KRP.white} stroke={KRP.gray} strokeWidth={3} opacity={(1 - p) * 0.85} />;
    };
    body = (
      <g>
        {shadow}
        <ellipse cx={0} cy={-34} rx={60} ry={34} fill="#B5643C" stroke={INK} strokeWidth={5} />
        <path d="M -40 -50 Q -20 -64 10 -64" stroke="#D88A5C" strokeWidth={8} fill="none" strokeLinecap="round" />
        <circle cx={0} cy={-34} r={6} fill="#8A4626" stroke={INK} strokeWidth={3} />
        <path d="M -56 -30 q -10 4 -8 12 M 56 -30 q 10 4 8 12" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* パイプ */}
        <path d="M -48 -70 Q -10 -60 14 -72" stroke="#6E4526" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M -48 -70 Q -10 -60 14 -72" stroke={INK} strokeWidth={2.5} fill="none" opacity={0.5} />
        <path d="M 12 -96 L 46 -96 L 42 -66 Q 30 -56 18 -66 Z" fill="#8A5A34" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={29} cy={-96} rx={17} ry={5} fill="#3E2A1C" stroke={INK} strokeWidth={3} />
        <ellipse cx={29} cy={-97} rx={9} ry={2.5} fill={KRP.orange} opacity={0.6 + tw * 0.4} />
        {[0, 1, 2].map(puff)}
      </g>
    );
  } else if (n === 4) {
    // 靴下2本 (赤白のしま と 緑の)
    const sock = (tx: number, r: number, c: string, stripe: string, key: number) => (
      <g key={key} transform={`translate(${tx} 0) rotate(${r} 0 -10)`}>
        <path d="M -18 -98 L 18 -98 L 18 -42 Q 18 -22 40 -20 Q 58 -18 56 -2 Q 54 10 30 8 L -4 6 Q -20 4 -18 -14 Z"
          fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {[-78, -58].map((yy) => <rect key={yy} x={-17} y={yy} width={34} height={9} fill={stripe} opacity={0.9} />)}
        <path d="M 26 -12 Q 44 -14 50 -4" stroke={stripe} strokeWidth={7} fill="none" strokeLinecap="round" />
        <rect x={-23} y={-114} width={46} height={20} rx={8} fill={SP.snow} stroke={INK} strokeWidth={4.5} />
      </g>
    );
    body = (
      <g>
        {shadow}
        {sock(-28, -8, SP.red, SP.snow, 0)}
        {sock(20, 9, SP.you, SP.snow, 1)}
      </g>
    );
  } else if (n === 5) {
    // ソリ と 樺のムチ (小枝の束)
    body = (
      <g>
        {shadow}
        <g stroke="#6E4526" strokeWidth={4} strokeLinecap="round">
          {[-14, -6, 2, 10, 18].map((dx, i) => (
            <path key={i} d={`M ${-6 + dx * 0.3} -50 Q ${dx * 1.2} -88 ${dx * 2.2 + 6} -122`} fill="none" />
          ))}
          <path d="M 18 -110 l 10 -6 M -10 -100 l -10 -4 M 30 -96 l 8 2" fill="none" />
        </g>
        <rect x={-16} y={-64} width={20} height={12} rx={4} fill={SP.red} stroke={INK} strokeWidth={3} transform="rotate(-10 -6 -58)" />
        <path d="M -62 -4 L 44 -4 Q 70 -4 66 -28" stroke={KRP.grayDark} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M -62 -4 L 44 -4 Q 70 -4 66 -28" stroke={INK} strokeWidth={2} fill="none" />
        {[-40, 0, 30].map((lx) => <line key={lx} x1={lx} y1={-4} x2={lx} y2={-18} stroke={INK} strokeWidth={4} />)}
        <path d="M -54 -18 L 44 -18 L 50 -46 L -26 -46 Q -54 -46 -58 -70 L -66 -70 Q -66 -30 -54 -18 Z"
          fill={SP.red} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -40 -26 L 40 -26" stroke={SP.gold} strokeWidth={5} />
        <circle cx={-62} cy={-72} r={6} fill={SP.gold} stroke={INK} strokeWidth={3} />
      </g>
    );
  } else if (n === 6) {
    // 白いひげ (ふわふわ)
    const sway = Math.sin(f / 14) * 2;
    body = (
      <g transform={`rotate(${sway} 0 -90)`}>
        {shadow}
        <path d="M -52 -92 Q -64 -40 -32 -12 Q -16 4 0 -4 Q 16 4 32 -12 Q 64 -40 52 -92 Q 30 -62 0 -64 Q -30 -62 -52 -92 Z"
          fill={SP.snow} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -30 -46 q 6 10 0 18 M 0 -40 q 6 12 0 22 M 28 -46 q -6 10 0 18 M -16 -60 q 4 8 0 14 M 16 -60 q -4 8 0 14"
          stroke={KRP.gray} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d="M 0 -72 Q -22 -88 -46 -76 Q -40 -62 -20 -64 Q -8 -64 0 -70 Q 8 -64 20 -64 Q 40 -62 46 -76 Q 22 -88 0 -72 Z"
          fill={SP.snow} stroke={INK} strokeWidth={4.5} />
        <Kira x={-36} y={-60} r={6 + tw * 4} o={0.6} c={KRP.white} />
      </g>
    );
  } else if (n === 7) {
    // 帳簿 (見開き。左に「まる」右に「ばつ」)
    body = (
      <g>
        {shadow}
        <path d="M -64 -14 L -60 -84 Q -30 -94 0 -82 Q 30 -94 60 -84 L 64 -14 Q 30 -24 0 -12 Q -30 -24 -64 -14 Z"
          fill="#3E6A7A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -56 -20 L -54 -80 Q -26 -88 0 -76 L 0 -16 Q -26 -28 -56 -20 Z" fill={SP.card} stroke={INK} strokeWidth={4} />
        <path d="M 56 -20 L 54 -80 Q 26 -88 0 -76 L 0 -16 Q 26 -28 56 -20 Z" fill={SP.card} stroke={INK} strokeWidth={4} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <line x1={-46} y1={-64 + r * 14} x2={-20} y2={-62 + r * 14} stroke={KRP.gray} strokeWidth={3} />
            <path d={`M -14 ${-64 + r * 14} l 4 5 l 7 -9`} stroke={KRP.green} strokeWidth={4} fill="none" strokeLinecap="round" />
            <line x1={10} y1={-62 + r * 14} x2={34} y2={-64 + r * 14} stroke={KRP.gray} strokeWidth={3} />
            {r === 1 ? <path d={`M 38 ${-68 + r * 14} l 8 8 m 0 -8 l -8 8`} stroke={SP.red} strokeWidth={4} strokeLinecap="round" />
              : <path d={`M 38 ${-64 + r * 14} l 4 5 l 7 -9`} stroke={KRP.green} strokeWidth={4} fill="none" strokeLinecap="round" />}
          </g>
        ))}
        <path d="M 2 -78 L 6 -10 L 10 -2 L 14 -12" stroke={SP.red} strokeWidth={5} fill="none" strokeLinejoin="round" />
        {/* 羽ペン */}
        <path d="M 40 -6 L 72 -110" stroke={INK} strokeWidth={3} />
        <path d="M 72 -110 Q 92 -80 60 -48 Q 58 -84 72 -110 Z" fill={SP.snow} stroke={INK} strokeWidth={3.5}
          transform={`rotate(${Math.sin(f / 10) * 3} 40 -6)`} />
      </g>
    );
  } else if (n === 8) {
    // 赤い服 (白い毛皮の縁)
    body = (
      <g>
        {shadow}
        <path d="M -40 -104 L -76 -74 L -66 -46 L -46 -58 L -54 -10 L 54 -10 L 46 -58 L 66 -46 L 76 -74 L 40 -104 Z"
          fill={SP.red} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -30 -90 Q -40 -60 -36 -24" stroke={SP.redLight} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
        <path d="M 30 -86 Q 34 -50 32 -22" stroke={SP.redDark} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
        <rect x={-58} y={-22} width={116} height={18} rx={9} fill={SP.snow} stroke={INK} strokeWidth={4.5} />
        <rect x={-8} y={-102} width={16} height={84} rx={8} fill={SP.snow} stroke={INK} strokeWidth={4} />
        <path d="M -40 -104 Q 0 -86 40 -104 Q 26 -112 0 -110 Q -26 -112 -40 -104 Z" fill={SP.snow} stroke={INK} strokeWidth={4.5} />
        {[-82, -77].map((_, i) => <ellipse key={i} cx={i ? 72 : -72} cy={-60} rx={12} ry={14} fill={SP.snow} stroke={INK} strokeWidth={4}
          transform={`rotate(${i ? -30 : 30} ${i ? 72 : -72} -60)`} />)}
        <rect x={-54} y={-48} width={108} height={12} fill="#4A3B34" stroke={INK} strokeWidth={3} />
        <rect x={-10} y={-51} width={20} height={18} rx={3} fill="none" stroke={SP.gold} strokeWidth={4} />
      </g>
    );
  } else if (n === 9) {
    // 人間の大きさ (大きな長ぐつ1足)
    const boot = (tx: number, key: number) => (
      <g key={key} transform={`translate(${tx} 0)`}>
        <path d="M -20 -92 L 18 -92 L 18 -34 Q 50 -32 54 -12 L 54 -4 L -22 -4 Z" fill="#4A3B34" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -10 -80 L -10 -24" stroke="#7A6A60" strokeWidth={6} strokeLinecap="round" />
        <path d="M 26 -26 Q 40 -24 46 -16" stroke="#7A6A60" strokeWidth={5} fill="none" strokeLinecap="round" />
        <rect x={-24} y={-110} width={46} height={24} rx={10} fill={SP.snow} stroke={INK} strokeWidth={4.5} />
        <rect x={-24} y={-8} width={80} height={8} rx={3} fill="#2E2622" />
      </g>
    );
    body = <g>{shadow}{boot(-34, 0)}{boot(10, 1)}<Kira x={40} y={-60} r={5 + tw * 5} o={0.7} c={KRP.white} /></g>;
  } else if (n === 10) {
    // 赤い鼻 (ふわっと光る。明るい色の輪を重ねる)
    const g = 0.6 + 0.4 * Math.sin(f / 8);
    body = (
      <g>
        {shadow}
        <ellipse cx={0} cy={-10} rx={40} ry={12} fill={SP.goldDark} stroke={INK} strokeWidth={4} />
        <ellipse cx={0} cy={-14} rx={34} ry={8} fill={SP.gold} />
        <circle cx={0} cy={-52} r={58 + g * 10} fill="#FFB0A0" opacity={0.18 * g} />
        <circle cx={0} cy={-52} r={44 + g * 6} fill="#FF9A86" opacity={0.25 * g} />
        <circle cx={0} cy={-52} r={32} fill={SP.red} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-52} r={24} fill={SP.redLight} opacity={0.4 + 0.4 * g} />
        <ellipse cx={-10} cy={-64} rx={10} ry={6} fill={KRP.white} opacity={0.85} transform="rotate(-30 -10 -64)" />
      </g>
    );
  } else if (n === 11) {
    // 宛先 (切手と消印の封筒。字は描かない)
    body = (
      <g>
        {shadow}
        <g transform="rotate(-6 0 -40)">
          <rect x={-60} y={-84} width={120} height={76} rx={6} fill={SP.envelope} stroke={INK} strokeWidth={5} />
          <path d="M -60 -84 L 0 -44 L 60 -84" stroke={INK} strokeWidth={3.5} fill="none" opacity={0.45} />
          <rect x={28} y={-78} width={24} height={28} fill={SP.red} stroke={INK} strokeWidth={3}
            strokeDasharray="3 2" />
          <rect x={32} y={-74} width={16} height={20} fill={SP.redLight} />
          <circle cx={22} cy={-60} r={16} fill="none" stroke={SP.stampInk} strokeWidth={3} opacity={0.8} />
          <path d="M 0 -66 q 6 -4 12 0 t 12 0 t 12 0 M 0 -56 q 6 -4 12 0 t 12 0 t 12 0" stroke={SP.stampInk} strokeWidth={2.5} fill="none" opacity={0.8} />
          <path d="M -40 -34 q 8 -6 16 0 t 16 0 t 16 0 M -40 -20 q 8 -6 16 0 t 16 0" stroke={KRP.blueDeep} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      </g>
    );
  } else if (n === 12) {
    // 証拠 (追跡)。小さなレーダー。針が回る
    const a = (f * 5) % 360;
    body = (
      <g>
        {shadow}
        <rect x={-50} y={-106} width={100} height={102} rx={12} fill={SP.console} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-62} r={38} fill={SP.scope} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-62} r={24} fill="none" stroke={SP.scopeLine} strokeWidth={2} opacity={0.7} />
        <circle cx={0} cy={-62} r={12} fill="none" stroke={SP.scopeLine} strokeWidth={2} opacity={0.7} />
        <path d={`M 0 -62 L 0 -96 A 34 34 0 0 1 ${Math.sin(0.6) * 34} ${-62 - Math.cos(0.6) * 34} Z`} fill={SP.scopeLine} opacity={0.35}
          transform={`rotate(${a - 34} 0 -62)`} />
        <line x1={0} y1={-62} x2={0} y2={-96} stroke={SP.scopeGlow} strokeWidth={3} transform={`rotate(${a} 0 -62)`} />
        <circle cx={14} cy={-80} r={4 + tw * 2} fill={SP.scopeGlow} />
        {[-30, 30].map((kx) => <circle key={kx} cx={kx} cy={-14} r={6} fill={SP.consoleDark} stroke={INK} strokeWidth={3} />)}
      </g>
    );
  } else {
    // 13 あなた (緑の飾り玉に白い雪の結晶)
    const sw = Math.sin(f / 16) * 4;
    body = (
      <g>
        {shadow}
        <g transform={`rotate(${sw} 0 -100)`}>
          <circle cx={0} cy={-48} r={44} fill={SP.you} stroke={INK} strokeWidth={5} />
          <path d="M -30 -66 Q -20 -84 0 -88" stroke="#7CC48A" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
          <Snowflake x={0} y={-46} r={22} w={4.5} />
          <rect x={-14} y={-102} width={28} height={14} rx={3} fill={SP.gold} stroke={INK} strokeWidth={4} />
          <path d="M -6 -102 Q 0 -118 6 -102" stroke={INK} strokeWidth={4} fill="none" />
        </g>
        <Kira x={34} y={-82} r={8 + tw * 6} o={0.5 + tw * 0.5} />
      </g>
    );
  }
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>{body}</g>;
};

/* ===================================================================
 * KumitateDai — サンタの組み立て台 (章の頭と終わりで同じ台。1920×1080 の舞台)
 *   奥の壁 (有孔ボードに工具・歯車・雪の窓)・つり下げランプ・作業台・13枚の皿。
 *   皿の位置: 1〜7 奥の列 (y=640, x=330〜1590)、8〜13 手前の列 (y=745, x=435〜1485)。
 *     → kumitateSlot(n) で皿の中心が取れる (シーン側で人や矢印を置くとき用)
 *   parts: 置かれた部品の数 0〜13 (1番から順に置かれる)
 *   add:   今まさに置かれる部品 (parts+1 番) のクレーンの動き 0〜1。0.8 で皿に着き、そのあと鉤が上がる
 *   f:     ランプのゆらぎ・雪・歯車・ホコリ・きらめき
 * =================================================================== */
export const kumitateSlot = (n: number): [number, number] =>
  n <= 7 ? [330 + (n - 1) * 210, 640] : [435 + (n - 8) * 210, 745];

const Dish: React.FC<{ x: number; y: number; n: number; on: boolean }> = ({ x, y, n, on }) => (
  <g>
    <ellipse cx={x} cy={y + 6} rx={84} ry={22} fill={INK} opacity={0.18} />
    <ellipse cx={x} cy={y} rx={80} ry={20} fill={KRP.silver} stroke={INK} strokeWidth={5} />
    <ellipse cx={x} cy={y - 2} rx={58} ry={12} fill="#DDE2E6" stroke={KRP.grayDark} strokeWidth={2.5} />
    <path d={`M ${x - 56} ${y - 6} Q ${x - 30} ${y - 14} ${x - 6} ${y - 13}`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.8} />
    {!on && <ellipse cx={x} cy={y - 2} rx={30} ry={6} fill="none" stroke={KRP.grayDark} strokeWidth={2.5} strokeDasharray="6 6" opacity={0.6} />}
    {/* 番号の真鍮札 */}
    <rect x={x - 20} y={y + 22} width={40} height={24} rx={5} fill={SP.brass} stroke={INK} strokeWidth={3.5} />
    <text x={x} y={y + 41} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={19} fill={INK}>{n}</text>
  </g>
);

export const KumitateDai: React.FC<{ f: number; parts?: number; add?: number }> = ({ f, parts = 0, add = 0 }) => {
  const placed = Math.max(0, Math.min(13, Math.floor(parts)));
  const nextN = placed + 1;
  const adding = add > 0 && placed < 13;
  const [tx, ty] = kumitateSlot(Math.min(nextN, 13));
  const drop = easeOut(seg(add, 0, 0.8));
  const land = seg(add, 0.8, 1);
  const partY = lerp(ty - 470, ty, drop);
  const swing = adding ? Math.sin(f / 7) * 6 * (1 - drop) : 0;
  const hookX = adding ? tx + swing : 890 + Math.sin(f / 20) * 4;
  const hookY = adding ? (add < 0.8 ? partY - 130 : lerp(ty - 130, ty - 560, easeOut(land))) : 60 + Math.sin(f / 15) * 3;
  const squash = adding && add >= 0.8 ? 1 + (1 - pop(land)) * 0.12 : 1;
  const flick = 0.92 + 0.08 * Math.sin(f / 5) * Math.sin(f / 11);
  return (
    <g>
      <defs>
        <radialGradient id="kdLamp" cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#FFF1C4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFF1C4" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 壁 (縦の板張り) */}
      <rect x={-40} y={-40} width={2000} height={700} fill={SP.wall} />
      <g stroke={SP.wallShade} strokeWidth={4}>
        {Array.from({ length: 17 }, (_, i) => <line key={i} x1={i * 120} y1={-40} x2={i * 120} y2={660} />)}
      </g>
      {Array.from({ length: 17 }, (_, i) => (
        <circle key={i} cx={i * 120 + 60} cy={40 + (i % 3) * 200} r={3} fill={SP.woodDark} opacity={0.5} />
      ))}
      {/* 雪の窓 (左) */}
      <g>
        <rect x={50} y={120} width={210} height={300} rx={8} fill="#2C3E66" stroke={INK} strokeWidth={8} />
        <rect x={62} y={132} width={186} height={276} fill="#3A5286" />
        <circle cx={200} cy={180} r={22} fill="#F4F0D8" opacity={0.9} />
        <path d="M 62 360 Q 120 330 180 350 Q 220 340 248 352 L 248 408 L 62 408 Z" fill={SP.snow} />
        {Array.from({ length: 16 }, (_, i) => {
          const yy = (rnd(i) * 276 + f * (0.9 + rnd(i + 9) * 0.8)) % 276;
          return <circle key={i} cx={70 + rnd(i + 3) * 170 + Math.sin((f + i * 20) / 18) * 6} cy={132 + yy} r={2.5 + rnd(i + 5) * 2.5} fill={KRP.white} opacity={0.9} />;
        })}
        <line x1={155} y1={132} x2={155} y2={408} stroke={SP.woodDark} strokeWidth={8} />
        <line x1={62} y1={270} x2={248} y2={270} stroke={SP.woodDark} strokeWidth={8} />
        <rect x={40} y={414} width={230} height={22} rx={5} fill={SP.wood} stroke={INK} strokeWidth={6} />
        <rect x={50} y={120} width={210} height={300} rx={8} fill="none" stroke={SP.woodDark} strokeWidth={10} />
      </g>
      {/* 有孔ボードと工具 */}
      <g>
        <rect x={330} y={70} width={1260} height={420} rx={10} fill={SP.peg} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 10 }, (_, r) => Array.from({ length: 31 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={350 + c * 40.6} cy={92 + r * 41} r={4} fill={SP.woodDark} opacity={0.45} />
        )))}
        {/* 金づち */}
        <g transform="translate(430 120) rotate(8)">
          <rect x={-8} y={20} width={16} height={190} rx={6} fill={SP.woodLight} stroke={INK} strokeWidth={5} />
          <rect x={-48} y={0} width={96} height={36} rx={6} fill={KRP.grayDark} stroke={INK} strokeWidth={5} />
          <path d="M 48 4 Q 70 10 64 34 L 48 32 Z" fill={KRP.grayDark} stroke={INK} strokeWidth={4} />
        </g>
        {/* のこぎり */}
        <g transform="translate(600 110) rotate(-4)">
          <rect x={-28} y={0} width={56} height={60} rx={14} fill={SP.red} stroke={INK} strokeWidth={5} />
          <rect x={-12} y={16} width={24} height={26} rx={8} fill={SP.peg} stroke={INK} strokeWidth={4} />
          <path d="M -24 60 L 24 60 L 44 300 L -24 300 Z" fill={KRP.silver} stroke={INK} strokeWidth={5} />
          <path d={`M -24 300 ${Array.from({ length: 12 }, (_, i) => `L -24 ${290 - i * 20} L -32 ${280 - i * 20}`).join(" ")}`}
            stroke={INK} strokeWidth={3} fill="none" />
        </g>
        {/* スパナ */}
        <g transform="translate(800 130) rotate(12)">
          <rect x={-10} y={20} width={20} height={200} rx={8} fill={KRP.silver} stroke={INK} strokeWidth={5} />
          <path d="M -26 30 Q -30 -10 0 -12 Q 30 -10 26 30 L 10 22 L 10 4 L -10 4 L -10 22 Z" fill={KRP.silver} stroke={INK} strokeWidth={5} />
          <circle cx={0} cy={228} r={18} fill={KRP.silver} stroke={INK} strokeWidth={5} />
          <circle cx={0} cy={228} r={7} fill={SP.peg} stroke={INK} strokeWidth={3} />
        </g>
        {/* ペンチ */}
        <g transform="translate(980 120)">
          <path d="M -8 0 L -14 80 L -40 230 L -22 232 L 0 90 L 22 232 L 40 230 L 14 80 L 8 0 Z" fill={KRP.grayDark} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -40 150 L -22 152 L -40 230 Z M 40 150 L 22 152 L 40 230 Z" fill={SP.red} stroke={INK} strokeWidth={4} />
          <circle cx={0} cy={82} r={10} fill={KRP.silver} stroke={INK} strokeWidth={4} />
        </g>
        {/* ドライバー2本 */}
        {[[1150, SP.you], [1220, KRP.blueDeep]].map(([dx, c], i) => (
          <g key={i} transform={`translate(${dx} 110) rotate(${i ? 6 : -6})`}>
            <rect x={-16} y={0} width={32} height={90} rx={12} fill={c as string} stroke={INK} strokeWidth={5} />
            <line x1={-6} y1={14} x2={-6} y2={76} stroke={KRP.white} strokeWidth={4} opacity={0.5} />
            <rect x={-5} y={90} width={10} height={130} fill={KRP.silver} stroke={INK} strokeWidth={4} />
          </g>
        ))}
        {/* 定規と糸巻き */}
        <g transform="translate(1390 100) rotate(3)">
          <rect x={-20} y={0} width={40} height={320} rx={4} fill={SP.goldLight} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 15 }, (_, i) => <line key={i} x1={-20} y1={16 + i * 20} x2={i % 5 ? -8 : 2} y2={16 + i * 20} stroke={INK} strokeWidth={3} />)}
        </g>
        <g transform="translate(1510 170)">
          <rect x={-40} y={-50} width={80} height={16} rx={4} fill={SP.woodMid} stroke={INK} strokeWidth={4} />
          <rect x={-30} y={-36} width={60} height={72} fill={SP.red} stroke={INK} strokeWidth={4} />
          {[-20, -6, 8, 22].map((yy) => <line key={yy} x1={-30} y1={yy} x2={30} y2={yy + 4} stroke={SP.redDark} strokeWidth={3} />)}
          <rect x={-40} y={34} width={80} height={16} rx={4} fill={SP.woodMid} stroke={INK} strokeWidth={4} />
          <path d={`M 30 10 Q 60 ${60 + Math.sin(f / 12) * 6} 40 140`} stroke={SP.red} strokeWidth={4} fill="none" />
        </g>
      </g>
      {/* 歯車 (右の壁。ゆっくり回る) */}
      <g>
        <g transform={`translate(1760 200) rotate(${f * 0.8})`}>
          <path d={gearPath(70, 12, 18)} fill={SP.brass} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <circle r={34} fill={SP.brassDark} stroke={INK} strokeWidth={5} />
          <circle r={10} fill={SP.wall} stroke={INK} strokeWidth={4} />
        </g>
        <g transform={`translate(1700 360) rotate(${-f * 1.2 + 10})`}>
          <path d={gearPath(44, 8, 16)} fill={KRP.copper} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <circle r={14} fill={SP.wall} stroke={INK} strokeWidth={4} />
        </g>
        <g transform={`translate(1830 450) rotate(${f * 1.6})`}>
          <path d={gearPath(30, 7, 12)} fill={KRP.silver} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <circle r={9} fill={SP.wall} stroke={INK} strokeWidth={3} />
        </g>
      </g>
      {/* クレーンのレール */}
      <rect x={-40} y={6} width={2000} height={26} fill={KRP.grayDark} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={i * 100 + 20} cy={19} r={5} fill={KRP.silver} stroke={INK} strokeWidth={2} />)}
      {/* つり下げランプと光 */}
      {[640, 1280].map((lx, i) => (
        <g key={lx}>
          <polygon points={`${lx - 60},150 ${lx + 60},150 ${lx + 360},820 ${lx - 360},820`} fill="url(#kdLamp)" opacity={flick * (i ? 0.95 : 1)} />
          <line x1={lx} y1={32} x2={lx} y2={100} stroke={INK} strokeWidth={5} />
          <path d={`M ${lx - 70} 152 Q ${lx - 64} 100 ${lx} 98 Q ${lx + 64} 100 ${lx + 70} 152 Z`} fill={SP.you} stroke={INK} strokeWidth={6} />
          <ellipse cx={lx} cy={152} rx={70} ry={12} fill="#FFF1C4" stroke={INK} strokeWidth={5} />
          <ellipse cx={lx} cy={156} rx={30} ry={8} fill={KRP.white} opacity={flick} />
        </g>
      ))}
      {/* 光の中のホコリ */}
      {Array.from({ length: 14 }, (_, i) => {
        const lx = i % 2 ? 1280 : 640;
        const p = ((f / 400) + rnd(i)) % 1;
        return <circle key={i} cx={lx - 200 + rnd(i + 2) * 400 + Math.sin((f + i * 30) / 25) * 20} cy={560 - p * 380} r={2 + rnd(i + 7) * 2}
          fill={KRP.white} opacity={0.6 * Math.sin(p * Math.PI)} />;
      })}
      {/* 作業台 */}
      <polygon points="150,590 1770,590 1880,800 40,800" fill={SP.wood} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <g stroke={SP.grain} strokeWidth={4} fill="none" opacity={0.8}>
        <path d="M 200 620 Q 600 612 900 624 T 1700 618" />
        <path d="M 140 680 Q 500 670 980 686 T 1760 676" />
        <path d="M 100 750 Q 600 740 1000 756 T 1820 748" />
        <ellipse cx={1180} cy={700} rx={40} ry={8} />
      </g>
      <rect x={40} y={800} width={1840} height={80} fill={SP.woodMid} stroke={INK} strokeWidth={7} />
      {[340, 960, 1580].map((dx) => (
        <g key={dx}>
          <rect x={dx - 160} y={812} width={320} height={56} rx={6} fill={SP.wood} stroke={INK} strokeWidth={5} />
          <rect x={dx - 30} y={832} width={60} height={14} rx={7} fill={SP.brass} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <rect x={-40} y={880} width={2000} height={240} fill="#5E4632" />
      <g stroke="#4E3A28" strokeWidth={4}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220 - 40} y1={880} x2={i * 260 - 200} y2={1120} />)}</g>
      {[[70, 130], [1790, 1850]].map(([a, b]) => (
        <rect key={a} x={a} y={880} width={b - a} height={200} fill={SP.woodDark} stroke={INK} strokeWidth={7} />
      ))}
      <rect x={130} y={980} width={1660} height={30} fill={SP.woodDark} stroke={INK} strokeWidth={6} />
      {/* 台の上の小物: のりのつぼ・ねじ・ドライバー・巻いた設計図 */}
      <g>
        <ellipse cx={190} cy={770} rx={46} ry={12} fill={INK} opacity={0.18} />
        <path d="M 150 700 L 230 700 L 222 768 Q 190 778 158 768 Z" fill={KRP.white} stroke={INK} strokeWidth={5} />
        <ellipse cx={190} cy={700} rx={40} ry={10} fill="#EFE6C8" stroke={INK} strokeWidth={4} />
        <path d="M 196 700 L 236 630" stroke={SP.woodDark} strokeWidth={9} strokeLinecap="round" />
        <path d="M 226 640 L 248 610" stroke={SP.woodLight} strokeWidth={14} strokeLinecap="round" />
        <rect x={160} y={720} width={60} height={26} fill={SP.goldLight} stroke={INK} strokeWidth={3} />
      </g>
      {[[262, 784], [292, 776], [1630, 782], [1660, 772], [1700, 786]].map(([sx, sy], i) => (
        <g key={i} transform={`translate(${sx} ${sy}) rotate(${i * 50})`}>
          <rect x={-3} y={-10} width={6} height={16} fill={KRP.grayDark} />
          <ellipse cx={0} cy={-10} rx={7} ry={4} fill={KRP.silver} stroke={INK} strokeWidth={2} />
        </g>
      ))}
      <g transform="translate(1700 740) rotate(-14)">
        <rect x={-70} y={-12} width={60} height={24} rx={10} fill={SP.red} stroke={INK} strokeWidth={4} />
        <rect x={-10} y={-4} width={80} height={8} fill={KRP.silver} stroke={INK} strokeWidth={3} />
      </g>
      <g transform="translate(1760 690) rotate(-24) scale(0.7)">
        <rect x={-90} y={-18} width={180} height={36} rx={18} fill="#BFD7E8" stroke={INK} strokeWidth={5} />
        <ellipse cx={90} cy={0} rx={10} ry={18} fill="#9FC0DA" stroke={INK} strokeWidth={4} />
        <rect x={-10} y={-18} width={14} height={36} fill={SP.red} opacity={0.8} />
      </g>
      {/* 皿と部品 */}
      {Array.from({ length: 13 }, (_, i) => {
        const n = i + 1;
        const [dx, dy] = kumitateSlot(n);
        const on = n <= placed;
        return (
          <g key={n}>
            <Dish x={dx} y={dy} n={n} on={on || (adding && n === nextN && add >= 0.8)} />
            {on && <SantaBuhin x={dx} y={dy - 6} s={0.95} f={f} n={n} />}
            {on && n === placed && !adding && (
              <g>
                <Kira x={dx + 52} y={dy - 100} r={10 + 6 * Math.sin(f / 5)} o={0.85} />
                <Kira x={dx - 58} y={dy - 60} r={6 + 4 * Math.cos(f / 6)} o={0.7} />
              </g>
            )}
          </g>
        );
      })}
      {/* クレーンの鉤 (と、運ばれる部品) */}
      <g>
        <rect x={hookX - 40} y={0} width={80} height={40} rx={8} fill={SP.brass} stroke={INK} strokeWidth={5} />
        {[-22, 22].map((wx) => <circle key={wx} cx={hookX + wx} cy={6} r={9} fill={KRP.grayDark} stroke={INK} strokeWidth={3} />)}
        <line x1={hookX} y1={40} x2={hookX} y2={hookY} stroke={INK} strokeWidth={5} />
        <rect x={hookX - 16} y={hookY - 4} width={32} height={26} rx={5} fill={KRP.grayDark} stroke={INK} strokeWidth={4} />
        <path d={`M ${hookX} ${hookY + 22} L ${hookX} ${hookY + 44} Q ${hookX} ${hookY + 74} ${hookX + 22} ${hookY + 70}
          Q ${hookX + 34} ${hookY + 62} ${hookX + 26} ${hookY + 50}`}
          stroke={KRP.silver} strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d={`M ${hookX} ${hookY + 22} L ${hookX} ${hookY + 44} Q ${hookX} ${hookY + 74} ${hookX + 22} ${hookY + 70}`}
          stroke={INK} strokeWidth={2.5} fill="none" />
        {adding && add < 0.8 && (
          <g>
            <path d={`M ${hookX + 6} ${hookY + 64} L ${hookX - 40} ${partY - 70} M ${hookX + 6} ${hookY + 64} L ${hookX + 46} ${partY - 70}`}
              stroke={INK} strokeWidth={3} />
            <SantaBuhin x={hookX} y={partY} s={0.95} f={f} n={nextN} rot={swing * 0.6} />
          </g>
        )}
      </g>
      {adding && add >= 0.8 && (
        <g>
          <g transform={`translate(${tx} ${ty - 6}) scale(${squash} ${1 / squash})`}>
            <SantaBuhin x={0} y={0} s={0.95} f={f} n={nextN} />
          </g>
          {/* 着いた瞬間の光とホコリ */}
          <g opacity={1 - land}>
            <ellipse cx={tx} cy={ty} rx={90 + land * 80} ry={22 + land * 18} fill="none" stroke="#FFF1C4" strokeWidth={8} />
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const a = (k / 6) * Math.PI * 2 + 0.4;
              return <Kira key={k} x={tx + Math.cos(a) * (80 + land * 70)} y={ty - 50 + Math.sin(a) * (50 + land * 50)} r={12} />;
            })}
          </g>
        </g>
      )}
    </g>
  );
};

/* ===================================================================
 * YougishaBoard — 容疑者ボード (探偵の部屋の壁のコルク板。1920×1080 の舞台)
 *   真ん中に「?」の手配書 (サンタの顔: 赤い帽子・白いひげ・丸い目)。まわりに札が時計回りに貼られ、赤い糸で手配書とつながる。
 *   札の位置: 1 左上 → 2〜5 上の列 → 6〜8 右の列 → 9〜11 下の列 (右から左) → 12・13 左の列 (下から上)
 *     → yougishaSlot(n) で札の中心が取れる
 *   cards: 貼られた札の数 0〜13
 *   focus: 強調する札の番号 (1〜13)。その札が大きく前に出て光り、ほかは少し暗くなる。0 で強調なし
 *   add:   いちばん新しい札 (cards 番) がパシッと貼られる動き 0〜1 (省略可。1 で貼り終わり)
 *   items: 札の中身 (年・名前・絵)。省略すると下の SANTA_SUSPECTS (台本どおりの仮の並び。シーン側で差し替えてよい)
 *   f:     糸のゆれ・札のゆれ・ランプ・強調の光
 * =================================================================== */
export type SuspectIcon = "bag" | "mitre" | "pipe" | "sled" | "quill" | "star" | "coat" | "easel" | "nose" | "guitar" | "letter" | "radar" | "you";
export type Suspect = { year: string; name: string; icon: SuspectIcon };
export const SANTA_SUSPECTS: Suspect[] = [
  { year: "4世紀", name: "ニコラウス", icon: "bag" },
  { year: "オランダ", name: "シンタクラース", icon: "mitre" },
  { year: "1809", name: "アーヴィング", icon: "pipe" },
  { year: "1821", name: "小冊子", icon: "sled" },
  { year: "1823", name: "詩の作者?", icon: "quill" },
  { year: "1863", name: "ナスト", icon: "star" },
  { year: "1902〜", name: "雑誌・広告", icon: "coat" },
  { year: "1931", name: "サンドブロム", icon: "easel" },
  { year: "1939", name: "ロバート・メイ", icon: "nose" },
  { year: "1949", name: "歌", icon: "guitar" },
  { year: "20世紀", name: "郵便局", icon: "letter" },
  { year: "1955", name: "防空司令部", icon: "radar" },
  { year: "今", name: "あなた", icon: "you" },
];
const ICON_TO_BUHIN: Partial<Record<SuspectIcon, number>> = { bag: 1, pipe: 3, sled: 5, coat: 8, nose: 10, letter: 11, radar: 12, you: 13 };

// 札の絵 (底の中心が 0,0。幅±60・高さ約110)
export const SuspectIconArt: React.FC<{ icon: SuspectIcon; f: number }> = ({ icon, f }) => {
  const b = ICON_TO_BUHIN[icon];
  if (b) return <SantaBuhin x={0} y={0} s={0.85} f={f} n={b} />;
  if (icon === "mitre") return (
    <g>
      <path d="M -36 -6 L -40 -60 Q -30 -100 0 -116 Q 30 -100 40 -60 L 36 -6 Z" fill={SP.red} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -36 -6 L -40 -60 Q -30 -100 0 -116" stroke={SP.redLight} strokeWidth={4} fill="none" opacity={0.6} />
      <rect x={-38} y={-24} width={76} height={18} fill={SP.gold} stroke={INK} strokeWidth={4} />
      <path d="M 0 -104 L 0 -30" stroke={SP.gold} strokeWidth={8} />
      <path d="M -4 -16 L -14 10 M 4 -16 L 14 10" stroke={SP.gold} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
  if (icon === "quill") return (
    <g>
      <path d="M -40 -4 L -34 -40 L 0 -40 L 6 -4 Z" fill="#3E4B66" stroke={INK} strokeWidth={5} />
      <ellipse cx={-17} cy={-40} rx={17} ry={5} fill="#22283A" stroke={INK} strokeWidth={3} />
      <path d="M -18 -40 L 36 -112" stroke={INK} strokeWidth={3.5} />
      <path d="M 36 -112 Q 62 -76 14 -54 Q 12 -94 36 -112 Z" fill={SP.snow} stroke={INK} strokeWidth={4}
        transform={`rotate(${Math.sin(f / 9) * 4} -18 -40)`} />
      <rect x={18} y={-30} width={46} height={26} rx={3} fill={SP.card} stroke={INK} strokeWidth={3.5} transform="rotate(-6 40 -16)" />
      <text x={40} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={SP.red}>?</text>
    </g>
  );
  if (icon === "star") return (
    <g>
      <path d="M -46 -100 L 46 -100 L 54 -6 L -54 -6 Z" fill="#3E5A9E" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {[[-26, -78], [0, -64], [26, -80], [-18, -36], [20, -40]].map(([sx, sy], i) => (
        <path key={i} transform={`translate(${sx} ${sy}) scale(0.9)`}
          d="M 0 -11 L 3 -3 L 11 -3 L 5 2 L 7 10 L 0 5 L -7 10 L -5 2 L -11 -3 L -3 -3 Z" fill={SP.snow} />
      ))}
      <path d="M -54 -6 L 54 -6" stroke={INK} strokeWidth={4} />
      {[-36, -12, 12, 36].map((sx, i) => <rect key={i} x={sx - 6} y={-6} width={12} height={8} fill={i % 2 ? SP.snow : SP.red} />)}
    </g>
  );
  if (icon === "easel") return (
    <g>
      <path d="M -40 0 L -10 -110 M 40 0 L 10 -110 M 0 -110 L 0 -10" stroke={SP.woodDark} strokeWidth={7} strokeLinecap="round" />
      <rect x={-44} y={-104} width={88} height={70} fill={SP.snow} stroke={INK} strokeWidth={5} />
      <path d="M -20 -44 Q -22 -80 0 -92 Q 22 -80 20 -44 Z" fill={SP.red} />
      <path d="M -16 -60 Q 0 -40 16 -60 L 12 -46 Q 0 -38 -12 -46 Z" fill={KRP.white} />
      <rect x={-48} y={-36} width={96} height={10} rx={3} fill={SP.wood} stroke={INK} strokeWidth={4} />
    </g>
  );
  // guitar
  return (
    <g transform={`translate(0 -8) rotate(${-14 + Math.sin(f / 12) * 2} 0 -40) scale(0.8)`}>
      <circle cx={0} cy={-26} r={30} fill={SP.wood} stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-62} r={22} fill={SP.wood} stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-40} r={9} fill="#5E3E22" stroke={INK} strokeWidth={3} />
      <rect x={-6} y={-130} width={12} height={78} fill={SP.woodDark} stroke={INK} strokeWidth={4} />
      <rect x={-10} y={-140} width={20} height={16} rx={3} fill={SP.woodDark} stroke={INK} strokeWidth={4} />
      <line x1={0} y1={-130} x2={0} y2={-16} stroke={KRP.white} strokeWidth={1.5} />
    </g>
  );
};

export const yougishaSlot = (n: number): [number, number] => {
  const P: [number, number][] = [
    [330, 300], [600, 230], [840, 230], [1080, 230], [1320, 230],
    [1590, 300], [1590, 540], [1590, 780],
    [1200, 850], [960, 850], [720, 850],
    [330, 780], [330, 540],
  ];
  return P[Math.max(0, Math.min(12, n - 1))];
};

export const YougishaBoard: React.FC<{ f: number; cards?: number; focus?: number; add?: number; items?: Suspect[] }> = ({
  f, cards = 0, focus = 0, add = 1, items = SANTA_SUSPECTS,
}) => {
  const count = Math.max(0, Math.min(13, Math.floor(cards)));
  const lampF = 0.9 + 0.1 * Math.sin(f / 7) * Math.sin(f / 13);
  const glow = 0.6 + 0.4 * Math.sin(f / 6);
  const cx0 = 960, cy0 = 372; // 手配書のピン
  const card = (n: number) => {
    const it = items[n - 1] ?? SANTA_SUSPECTS[n - 1];
    const [cx, cy] = yougishaSlot(n);
    const isNew = n === count && add < 1;
    const t = isNew ? clamp01(add) : 1;
    const isFocus = focus === n;
    const baseRot = (rnd(n + 40) - 0.5) * 10 + Math.sin((f + n * 23) / 19) * 0.8;
    const sc = (isFocus ? 1.28 : 1) * (isNew ? lerp(1.5, 1, pop(t)) : 1);
    const rot = isNew ? lerp(baseRot - 25, baseRot, easeOut(t)) : baseRot;
    const dim = focus > 0 && !isFocus;
    return (
      <g key={n} opacity={isNew ? Math.min(1, t * 3) : 1}>
        {isFocus && <circle cx={cx} cy={cy} r={170 + glow * 14} fill={SP.lampGlow} opacity={0.35} />}
        <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${sc})`}>
          <rect x={-94} y={-86} width={200} height={190} rx={4} fill={INK} opacity={0.22} />
          <rect x={-100} y={-95} width={200} height={190} rx={4} fill={SP.card} stroke={INK} strokeWidth={5} />
          <rect x={-86} y={-80} width={172} height={110} fill={SP.cardPic} stroke={INK} strokeWidth={3} />
          <g transform="translate(0 24)"><SuspectIconArt icon={it.icon} f={f} /></g>
          <text x={0} y={62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={SP.redDark}>{it.year}</text>
          <text x={0} y={88} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={INK}>{it.name}</text>
          {/* 画びょう */}
          <circle cx={0} cy={-92} r={13} fill={SP.red} stroke={INK} strokeWidth={4} />
          <circle cx={-4} cy={-96} r={4} fill={KRP.white} opacity={0.8} />
          {dim && <rect x={-100} y={-95} width={200} height={190} rx={4} fill={SP.roomWallDark} opacity={0.35} />}
        </g>
      </g>
    );
  };
  return (
    <g>
      <defs>
        <radialGradient id="ygLamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={SP.lampGlow} stopOpacity="0.55" />
          <stop offset="1" stopColor={SP.lampGlow} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 探偵の部屋の壁 (縦じまの壁紙) */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={SP.roomWall} />
      {Array.from({ length: 25 }, (_, i) => <rect key={i} x={i * 84 - 40} y={-40} width={30} height={1160} fill={SP.roomWallDark} opacity={0.5} />)}
      <ellipse cx={960} cy={480} rx={1100} ry={700} fill="url(#ygLamp)" opacity={lampF} />
      {/* 板の枠とコルク */}
      <rect x={128} y={68} width={1664} height={944} rx={14} fill={SP.woodMid} stroke={INK} strokeWidth={8} />
      <rect x={138} y={78} width={1644} height={18} fill={SP.woodLight} opacity={0.5} />
      <rect x={160} y={100} width={1600} height={880} fill={SP.cork} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 420 }, (_, i) => (
        <circle key={i} cx={170 + rnd(i) * 1580} cy={110 + rnd(i + 500) * 860} r={1.5 + rnd(i + 900) * 3}
          fill={rnd(i + 77) > 0.5 ? SP.corkDot : SP.corkDark} opacity={0.55} />
      ))}
      {/* 古い画びょうの穴と、はがし跡のメモ */}
      <g transform="translate(470 520) rotate(-8)">
        <rect x={-60} y={-40} width={120} height={80} fill="#F4E9A6" stroke={INK} strokeWidth={4} opacity={0.85} />
        <path d="M -44 -14 q 10 -6 20 0 t 20 0 t 20 0 M -44 8 q 10 -6 20 0 t 20 0" stroke={KRP.blueDeep} strokeWidth={3.5} fill="none" opacity={0.7} />
        <circle cx={0} cy={-36} r={9} fill={KRP.blueDeep} stroke={INK} strokeWidth={3} />
      </g>
      <g transform="translate(1450 520) rotate(6)">
        <rect x={-50} y={-60} width={100} height={120} fill={SP.snow} stroke={INK} strokeWidth={4} opacity={0.9} />
        {/* 地図の切れはし (北極の矢印) */}
        <circle cx={0} cy={0} r={34} fill="#CFE1EC" stroke={INK} strokeWidth={3} />
        <path d="M 0 -26 L 10 4 L 0 -2 L -10 4 Z" fill={SP.red} stroke={INK} strokeWidth={2.5} />
        <circle cx={0} cy={-56} r={9} fill={SP.gold} stroke={INK} strokeWidth={3} />
      </g>
      {/* 赤い糸 (手配書 → 札)。いちばん新しい札の糸は add で伸びる */}
      {Array.from({ length: count }, (_, i) => {
        const n = i + 1;
        const [px, py] = yougishaSlot(n);
        const ey = py - 92;
        const sag = 40 + Math.sin((f + n * 31) / 17) * 6;
        const mx = (cx0 + px) / 2, my = (cy0 + ey) / 2 + sag;
        const tt = n === count && add < 1 ? easeOut(seg(add, 0.2, 1)) : 1;
        const d = `M ${cx0} ${cy0} Q ${mx} ${my} ${px} ${ey}`;
        return (
          <g key={n}>
            <path d={d} stroke={INK} strokeWidth={7} fill="none" opacity={0.25} pathLength={1} strokeDasharray={`${tt} 1`} transform="translate(4 6)" />
            <path d={d} stroke={SP.string} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={`${tt} 1`}
              opacity={focus > 0 && focus !== n ? 0.55 : 1} />
          </g>
        );
      })}
      {/* 手配書 (真ん中) */}
      <g transform={`translate(960 548) rotate(${Math.sin(f / 23) * 0.8})`}>
        <rect x={-144} y={-174} width={300} height={360} fill={INK} opacity={0.22} />
        <rect x={-150} y={-180} width={300} height={360} fill="#EAD9B0" stroke={INK} strokeWidth={6} />
        <rect x={-136} y={-166} width={272} height={332} fill="none" stroke={SP.woodMid} strokeWidth={4} />
        <path d="M 150 120 L 112 180 L 150 180 Z" fill="#D2BE8E" stroke={INK} strokeWidth={4} />
        {/* サンタの顔 */}
        <g transform="translate(0 -8)">
          <path d="M -86 -38 Q -70 -132 20 -128 Q 82 -120 104 -72 L 70 -58 Q 40 -80 -10 -76 Q -60 -70 -86 -38 Z" fill={SP.red} stroke={INK} strokeWidth={5} />
          <circle cx={112} cy={-70} r={18} fill={SP.snow} stroke={INK} strokeWidth={4.5} />
          <rect x={-96} y={-52} width={192} height={30} rx={15} fill={SP.snow} stroke={INK} strokeWidth={5} />
          <circle cx={0} cy={4} r={58} fill="#F3CDB0" stroke={INK} strokeWidth={5} />
          <path d="M -70 0 Q -84 80 -30 110 Q 0 124 30 110 Q 84 80 70 0 Q 40 46 0 44 Q -40 46 -70 0 Z" fill={SP.snow} stroke={INK} strokeWidth={5} />
          <path d="M 0 22 Q -26 8 -50 22 Q -30 38 0 30 Q 30 38 50 22 Q 26 8 0 22 Z" fill={SP.snow} stroke={INK} strokeWidth={4} />
          <circle cx={-22} cy={-6} r={8} fill={INK} />
          <circle cx={22} cy={-6} r={8} fill={INK} />
          <circle cx={-19} cy={-9} r={2.5} fill={KRP.white} />
          <circle cx={25} cy={-9} r={2.5} fill={KRP.white} />
          <circle cx={0} cy={12} r={10} fill="#E8987E" stroke={INK} strokeWidth={3} />
        </g>
        <text x={112} y={166} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={SP.red} opacity={0.92}
          transform={`rotate(10 112 140)`}>?</text>
        <text x={-112} y={-112} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={SP.red} opacity={0.85}
          transform={`rotate(-12 -112 -130)`}>?</text>
        <circle cx={0} cy={-176} r={15} fill={SP.gold} stroke={INK} strokeWidth={4} />
        <circle cx={-4} cy={-180} r={4} fill={KRP.white} opacity={0.8} />
      </g>
      {/* 札 (強調の札は最後に描いて前に出す) */}
      {Array.from({ length: count }, (_, i) => i + 1).filter((n) => n !== focus).map(card)}
      {focus > 0 && focus <= count && card(focus)}
      {/* 手前の机のふち: 虫めがねとコーヒー */}
      <rect x={-40} y={1010} width={2000} height={110} fill={SP.woodDark} stroke={INK} strokeWidth={7} />
      <rect x={-40} y={1010} width={2000} height={14} fill={SP.woodMid} />
      <g transform="translate(1600 1034) rotate(-18)">
        <rect x={-130} y={-12} width={110} height={24} rx={12} fill="#6E4526" stroke={INK} strokeWidth={5} />
        <circle cx={20} cy={0} r={44} fill="#CFE6F0" opacity={0.5} stroke={SP.brass} strokeWidth={12} />
        <circle cx={20} cy={0} r={44} fill="none" stroke={INK} strokeWidth={3} />
        <path d="M 0 -18 q 10 -14 26 -14" stroke={KRP.white} strokeWidth={5} fill="none" />
      </g>
      <g transform="translate(300 1040)">
        <rect x={-36} y={-40} width={72} height={64} rx={8} fill={SP.snow} stroke={INK} strokeWidth={5} />
        <path d="M 36 -26 Q 62 -24 58 -4 Q 54 10 36 6" stroke={INK} strokeWidth={6} fill="none" />
        {[0, 1].map((k) => {
          const p = ((f / 60) + k / 2) % 1;
          return <path key={k} d={`M ${-10 + k * 18} ${-48 - p * 50} q 10 -12 0 -24 t 0 -24`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={(1 - p) * 0.7} />;
        })}
      </g>
    </g>
  );
};

/* ===================================================================
 * NoradRoom — 1950年代の作戦室 (7章。1920×1080 の舞台)
 *   奥の壁: 大きな北アメリカの地図 (透明板に書き込む形)・左に状態ランプの板・右に時計2つ。
 *   手前: 左にレーダーの台 (丸い画面の中心 330,720)・真ん中の机に電話3台 (赤い電話は x=860)・右にテレタイプ。
 *   blip: レーダーの点 0〜1。0 で何も無し。上がるほど点が画面の外側から中心へ近づき、地図の上の印も北極から南へ進む
 *   f:    レーダーの針 (1周 3秒)・点の残光・時計の秒針・テレタイプの紙・コーヒーの湯気・ランプ
 *   人の机の高さは y=800 (天板)。椅子に座る人は y≈960 に足元を置く
 * =================================================================== */
const NA_LAND = "M 60 190 L 90 160 L 140 140 L 200 130 L 250 140 L 300 120 L 360 110 L 420 100 L 470 110 L 500 120 L 520 160 L 510 210 L 540 250 L 580 250 L 600 215 L 595 170 L 620 140 L 660 150 L 700 175 L 730 215 L 720 250 L 750 265 L 720 290 L 690 300 L 670 330 L 650 350 L 640 380 L 630 400 L 640 420 L 650 455 L 638 462 L 620 430 L 600 410 L 570 405 L 540 410 L 510 420 L 500 440 L 505 470 L 490 480 L 470 475 L 440 465 L 410 440 L 380 410 L 360 380 L 340 350 L 320 320 L 300 280 L 290 240 L 285 210 L 260 195 L 230 185 L 200 190 L 170 180 L 130 190 L 90 205 L 60 215 Z";
const GREEN_LAND = "M 700 40 L 800 30 L 850 50 L 820 110 L 770 140 L 740 120 L 710 80 Z";
const ARCTIC_ISLES = ["M 380 70 L 440 60 L 452 86 L 392 92 Z", "M 480 60 L 560 48 L 582 84 L 502 96 Z", "M 600 70 L 650 62 L 664 100 L 616 104 Z"];

const Phone: React.FC<{ x: number; y: number; s?: number; c: string; ring?: number }> = ({ x, y, s = 1, c, ring = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(ring * 40) * 2 * (ring > 0 ? 1 : 0)}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={66} ry={10} fill={INK} opacity={0.2} />
    <path d="M -56 0 L -44 -56 L 44 -56 L 56 0 Z" fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={0} cy={-30} r={20} fill={KRP.white} stroke={INK} strokeWidth={4} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 1.6 + Math.PI * 0.7;
      return <circle key={i} cx={Math.cos(a) * 13} cy={-30 + Math.sin(a) * 13} r={3} fill={c} />;
    })}
    <path d="M -64 -60 Q -66 -84 -44 -84 L 44 -84 Q 66 -84 64 -60 L 50 -60 Q 46 -70 34 -70 L -34 -70 Q -46 -70 -50 -60 Z"
      fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 56 -10 q 24 4 18 20 q -6 14 10 22 q 14 8 6 22" stroke={INK} strokeWidth={4} fill="none" />
  </g>
);

export const NoradRoom: React.FC<{ f: number; blip?: number }> = ({ f, blip = 0 }) => {
  const b = clamp01(blip);
  // レーダー
  const RX = 330, RY = 720, RR = 120;
  const sweep = (f * 4) % 360; // 度 (12時から時計回り)
  const blipAng = 38; // 北東から近づく
  const blipR = lerp(RR * 0.92, RR * 0.22, b);
  const bx = RX + Math.sin((blipAng * Math.PI) / 180) * blipR;
  const by = RY - Math.cos((blipAng * Math.PI) / 180) * blipR;
  const diff = (sweep - blipAng + 360) % 360;
  const after = b > 0 ? Math.exp(-diff / 110) : 0;
  const wedge = (a0: number, a1: number) => {
    const r0 = (a0 * Math.PI) / 180, r1 = (a1 * Math.PI) / 180;
    return `M ${RX} ${RY} L ${RX + Math.sin(r0) * RR} ${RY - Math.cos(r0) * RR} A ${RR} ${RR} 0 0 1 ${RX + Math.sin(r1) * RR} ${RY - Math.cos(r1) * RR} Z`;
  };
  // 地図の上の印 (地図の座標)
  const mt = b;
  const mpx = lerp(560, 500, mt) + Math.sin(mt * Math.PI) * 40;
  const mpy = lerp(10, 330, mt);
  // 時計
  const sec = (Math.floor(f / 30) * 6) % 360;
  const tickerLen = 60 + ((f * 0.6) % 120);
  return (
    <g>
      <defs>
        <radialGradient id="nrScope" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1E5A3A" />
          <stop offset="1" stopColor={SP.scope} />
        </radialGradient>
        <linearGradient id="nrLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8F2FF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#E8F2FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* 壁 */}
      <rect x={-40} y={-40} width={2000} height={840} fill={SP.opsWall} />
      <g stroke={SP.opsWallDark} strokeWidth={4}>
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180} y1={-40} x2={i * 180} y2={800} />)}
      </g>
      <rect x={-40} y={600} width={2000} height={200} fill={SP.opsWallDark} opacity={0.6} />
      {/* 天井の蛍光灯 */}
      {[480, 960, 1440].map((lx) => (
        <g key={lx}>
          <rect x={lx - 150} y={-40} width={300} height={34} rx={6} fill="#F4F8FF" stroke={INK} strokeWidth={5} />
          <polygon points={`${lx - 150},-6 ${lx + 150},-6 ${lx + 260},600 ${lx - 260},600`} fill="url(#nrLight)" />
        </g>
      ))}
      {/* 大きな地図 */}
      <g>
        <rect x={290} y={50} width={1340} height={530} rx={10} fill={SP.woodDark} stroke={INK} strokeWidth={8} />
        <rect x={310} y={68} width={1300} height={494} fill={SP.mapBoard} stroke={INK} strokeWidth={4} />
        <g stroke={SP.mapGrid} strokeWidth={2} opacity={0.7}>
          {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={310 + i * 108} y1={68} x2={310 + i * 108} y2={562} />)}
          {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1={310} y1={68 + (i + 1) * 98} x2={1610} y2={68 + (i + 1) * 98} />)}
        </g>
        <g transform="translate(420 64) scale(1.25 1)">
          <path d={NA_LAND} fill={SP.land} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" opacity={0.92} />
          <path d={GREEN_LAND} fill={SP.land} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" opacity={0.92} />
          {ARCTIC_ISLES.map((d, i) => <path key={i} d={d} fill={SP.land} stroke={INK} strokeWidth={3} strokeLinejoin="round" opacity={0.92} />)}
          <path d="M 290 228 L 500 236 Q 560 250 610 290" stroke={SP.landDark} strokeWidth={3} fill="none" strokeDasharray="8 6" />
          {/* 北の見張りの線 (レーダーの列) */}
          <path d="M 140 196 Q 420 168 720 196" stroke={KRP.yellow} strokeWidth={3} fill="none" strokeDasharray="4 8" opacity={0.8} />
          {[180, 290, 400, 510, 620, 700].map((px, i) => (
            <circle key={px} cx={px} cy={186 - Math.sin(i) * 4} r={6} fill={KRP.yellow} opacity={0.5 + 0.5 * Math.sin(f / 9 + i)} />
          ))}
          {/* 北極 */}
          <circle cx={560} cy={10} r={10} fill={SP.snow} stroke={INK} strokeWidth={3} />
          {/* 進んでくる印 */}
          {b > 0 && (
            <g>
              <path d={`M 560 10 Q ${560 + 50 * mt} ${170 * mt} ${mpx} ${mpy}`} stroke={KRP.orange} strokeWidth={4} fill="none" strokeDasharray="10 7" />
              <circle cx={mpx} cy={mpy} r={16 + Math.sin(f / 5) * 4} fill={KRP.orange} opacity={0.3} />
              <path d={`M ${mpx - 10} ${mpy - 10} l 20 20 m 0 -20 l -20 20`} stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" />
            </g>
          )}
        </g>
        <rect x={310} y={68} width={1300} height={40} fill={KRP.white} opacity={0.08} />
        <path d="M 330 80 L 520 80 L 400 560 L 340 560 Z" fill={KRP.white} opacity={0.05} />
      </g>
      {/* 状態ランプの板 (左) */}
      <g>
        <rect x={60} y={120} width={200} height={400} rx={8} fill="#2E3A42" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, r) => Array.from({ length: 3 }, (_, c) => {
          const on = Math.sin(f / (9 + c * 3) + r * 1.7 + c) > -0.2;
          const col = [KRP.green, KRP.yellow, KRP.red][(r + c) % 3];
          return (
            <g key={`${r}${c}`}>
              <circle cx={100 + c * 60} cy={160 + r * 46} r={13} fill={col} opacity={on ? 1 : 0.35} stroke={INK} strokeWidth={3} />
              {on && <circle cx={100 + c * 60} cy={160 + r * 46} r={20} fill={col} opacity={0.22} />}
            </g>
          );
        }))}
      </g>
      {/* 時計2つ (右) */}
      {[[1760, 170, 0], [1760, 410, 150]].map(([cx, cy, off], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <circle r={90} fill={KRP.white} stroke={INK} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k * 30 * Math.PI) / 180;
            return <line key={k} x1={Math.sin(a) * 70} y1={-Math.cos(a) * 70} x2={Math.sin(a) * 80} y2={-Math.cos(a) * 80} stroke={INK} strokeWidth={k % 3 ? 3 : 6} />;
          })}
          <line x1={0} y1={0} x2={0} y2={-62} stroke={INK} strokeWidth={7} strokeLinecap="round" transform={`rotate(${60 + off})`} />
          <line x1={0} y1={0} x2={0} y2={-42} stroke={INK} strokeWidth={9} strokeLinecap="round" transform={`rotate(${300 + off / 6})`} />
          <line x1={0} y1={12} x2={0} y2={-74} stroke={KRP.red} strokeWidth={3} transform={`rotate(${sec})`} />
          <circle r={7} fill={INK} />
          <rect x={-46} y={98} width={92} height={22} rx={4} fill={SP.brass} stroke={INK} strokeWidth={3} />
        </g>
      ))}
      {/* 床 */}
      <rect x={-40} y={800} width={2000} height={320} fill={SP.opsFloor} />
      <g stroke="#34404A" strokeWidth={3}>
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 160 - 40} y1={800} x2={i * 220 - 400} y2={1120} />)}
        <line x1={-40} y1={940} x2={1960} y2={940} />
      </g>
      {/* レーダーの台 (左) */}
      <g>
        <rect x={120} y={560} width={420} height={540} rx={16} fill={SP.console} stroke={INK} strokeWidth={7} />
        <rect x={134} y={574} width={392} height={20} rx={8} fill={KRP.white} opacity={0.2} />
        <circle cx={RX} cy={RY} r={RR + 22} fill={SP.consoleDark} stroke={INK} strokeWidth={6} />
        <circle cx={RX} cy={RY} r={RR} fill="url(#nrScope)" stroke={INK} strokeWidth={4} />
        {[0.33, 0.66].map((k) => <circle key={k} cx={RX} cy={RY} r={RR * k} fill="none" stroke={SP.scopeLine} strokeWidth={2} opacity={0.6} />)}
        <line x1={RX - RR} y1={RY} x2={RX + RR} y2={RY} stroke={SP.scopeLine} strokeWidth={1.5} opacity={0.5} />
        <line x1={RX} y1={RY - RR} x2={RX} y2={RY + RR} stroke={SP.scopeLine} strokeWidth={1.5} opacity={0.5} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <path key={k} d={wedge(sweep - 8 * (k + 1), sweep - 8 * k)} fill={SP.scopeLine} opacity={0.32 - k * 0.05} />
        ))}
        <line x1={RX} y1={RY} x2={RX + Math.sin((sweep * Math.PI) / 180) * RR} y2={RY - Math.cos((sweep * Math.PI) / 180) * RR}
          stroke={SP.scopeGlow} strokeWidth={4} />
        {/* 地上のかすかな点 (ゴミ) */}
        {[[-50, 40], [60, 70], [-80, -30], [30, -90]].map(([dx, dy], k) => (
          <circle key={k} cx={RX + dx} cy={RY + dy} r={3} fill={SP.scopeLine} opacity={0.4} />
        ))}
        {b > 0 && (
          <g>
            <circle cx={bx} cy={by} r={18} fill={SP.scopeGlow} opacity={0.18 + after * 0.4} />
            <circle cx={bx} cy={by} r={8} fill={SP.scopeGlow} opacity={0.35 + after * 0.65} />
          </g>
        )}
        <ellipse cx={RX - 50} cy={RY - 60} rx={34} ry={16} fill={KRP.white} opacity={0.12} transform={`rotate(-35 ${RX - 50} ${RY - 60})`} />
        {[190, 260, 400, 470].map((kx, k) => (
          <g key={kx}>
            <circle cx={kx} cy={900} r={20} fill={SP.consoleDark} stroke={INK} strokeWidth={4} />
            <line x1={kx} y1={900} x2={kx + Math.cos(k + f / 40) * 14} y2={900 + Math.sin(k + f / 40) * 14} stroke={KRP.white} strokeWidth={4} />
          </g>
        ))}
        {[180, 230, 280, 330, 380, 430, 480].map((sx, k) => (
          <rect key={sx} x={sx - 8} y={960} width={16} height={30} rx={4} fill={k % 3 ? KRP.silver : KRP.yellow} stroke={INK} strokeWidth={3}
            transform={`rotate(${k % 2 ? 12 : -12} ${sx} 990)`} />
        ))}
      </g>
      {/* 真ん中の机 */}
      <g>
        <rect x={600} y={800} width={760} height={30} rx={6} fill="#7B8A7E" stroke={INK} strokeWidth={7} />
        <rect x={620} y={830} width={720} height={250} fill="#66766A" stroke={INK} strokeWidth={6} />
        {[700, 1260].map((dx) => (
          <g key={dx}>
            <rect x={dx - 70} y={850} width={140} height={60} rx={4} fill="#738377" stroke={INK} strokeWidth={4} />
            <rect x={dx - 24} y={874} width={48} height={10} rx={5} fill={KRP.silver} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* 机の上: 書類・クリップボード・電話・コーヒー・卓上ランプ */}
        <g transform="translate(700 790) rotate(-6)">
          <rect x={-60} y={-24} width={120} height={30} fill={SP.snow} stroke={INK} strokeWidth={4} />
          <rect x={-54} y={-30} width={120} height={30} fill={SP.snow} stroke={INK} strokeWidth={4} />
          <path d="M -40 -20 L 40 -20 M -40 -10 L 20 -10" stroke={KRP.gray} strokeWidth={3} />
        </g>
        <Phone x={860} y={800} s={1} c={SP.red} ring={b > 0.5 ? f : 0} />
        <Phone x={1070} y={800} s={0.85} c={SP.phoneGray} />
        <Phone x={1230} y={800} s={0.85} c={SP.phoneGray} />
        {b > 0.5 && (
          <g stroke={SP.red} strokeWidth={5} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 2)}>
            <path d="M 790 690 l -20 -18 M 800 668 l -8 -26 M 930 690 l 20 -18 M 920 668 l 8 -26" />
          </g>
        )}
        <g transform="translate(980 796)">
          <path d="M -20 -40 L 20 -40 L 16 0 L -16 0 Z" fill={SP.snow} stroke={INK} strokeWidth={4} />
          <path d="M 20 -32 q 14 2 12 14 q -2 8 -14 8" stroke={INK} strokeWidth={4} fill="none" />
          {[0, 1].map((k) => {
            const p = ((f / 50) + k / 2) % 1;
            return <path key={k} d={`M ${-6 + k * 10} ${-46 - p * 40} q 8 -10 0 -20`} stroke={KRP.white} strokeWidth={3.5} fill="none" opacity={(1 - p) * 0.8} />;
          })}
        </g>
        <g>
          <path d="M 640 800 L 650 780 L 680 690" stroke={KRP.grayDark} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d="M 650 680 L 730 660 L 720 700 Z" fill={SP.you} stroke={INK} strokeWidth={5} />
          <polygon points="700,700 730,690 790,800 650,800" fill="#FFF1C4" opacity={0.3} />
          <ellipse cx={650} cy={800} rx={30} ry={8} fill={KRP.grayDark} stroke={INK} strokeWidth={4} />
        </g>
      </g>
      {/* テレタイプ (右)。紙がじわじわ出てくる */}
      <g>
        <rect x={1420} y={700} width={360} height={200} rx={14} fill={SP.console} stroke={INK} strokeWidth={7} />
        <rect x={1440} y={720} width={320} height={50} rx={8} fill={SP.consoleDark} stroke={INK} strokeWidth={4} />
        <path d={`M 1530 720 L 1530 ${720 - tickerLen} Q 1530 ${700 - tickerLen} 1560 ${700 - tickerLen} L 1650 ${700 - tickerLen} L 1650 720 Z`}
          fill={SP.snow} stroke={INK} strokeWidth={4} />
        {Array.from({ length: Math.floor(tickerLen / 20) }, (_, i) => (
          <line key={i} x1={1546} y1={706 - i * 20} x2={1546 + 50 + (i * 23) % 40} y2={706 - i * 20} stroke={KRP.gray} strokeWidth={3} />
        ))}
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 9 }, (_, c) => (
          <rect key={`${r}${c}`} x={1452 + c * 34 + r * 8} y={790 + r * 30} width={26} height={22} rx={5}
            fill={KRP.white} stroke={INK} strokeWidth={2.5} transform={(c + r + Math.floor(f / 4)) % 11 === 0 ? "translate(0 3)" : undefined} />
        )))}
        <rect x={1440} y={900} width={320} height={180} fill={SP.consoleDark} stroke={INK} strokeWidth={6} />
      </g>
    </g>
  );
};

/* ===================================================================
 * YubinTana — 20世紀初めの郵便局の仕分け棚 (6章。1920×1080 の舞台)
 *   奥: 木の仕分け棚 (10列×5段、x=260〜1660, y=90〜640)・左に時計と壁のランプ・右に雪の窓。
 *   手前: 仕分け台 (天板 y=690)。左に手紙のあふれた郵便袋、台の上に手紙の山・消印のハンコ・はかり。
 *   flow: 手紙が流れる 0〜1。0 は止まった棚。上がるほど袋から棚へ飛ぶ手紙が増え、山と棚の中身も増える
 *   f:    飛ぶ手紙・ハンコの上下 (押すたびに消印が増える)・ランプ・雪
 *   人は台の向こう (足元 y≈900、台で下半身が隠れる) か手前に置く
 * =================================================================== */
const CB = { x0: 280, y0: 110, w: 136, h: 102 };
const cubbyCenter = (i: number): [number, number] => {
  const c = i % 10, r = Math.floor(i / 10);
  return [CB.x0 + c * CB.w + CB.w / 2, CB.y0 + r * CB.h + CB.h / 2];
};
const ENV_COLORS = [SP.envelope, SP.envelopeBlue, SP.envelopePink, SP.envelope];

const Letter: React.FC<{ x: number; y: number; r?: number; s?: number; c?: string; mark?: boolean }> = ({ x, y, r = 0, s = 1, c = SP.envelope, mark = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-34} y={-22} width={68} height={44} rx={3} fill={c} stroke={INK} strokeWidth={3.5} />
    <path d="M -34 -22 L 0 2 L 34 -22" stroke={INK} strokeWidth={2.5} fill="none" opacity={0.45} />
    <rect x={16} y={-18} width={13} height={15} fill={SP.red} stroke={INK} strokeWidth={2} />
    <path d="M -24 8 q 6 -4 12 0 t 12 0 M -24 15 q 6 -4 12 0" stroke={KRP.blueDeep} strokeWidth={2.5} fill="none" />
    {mark && (
      <g opacity={0.85}>
        <circle cx={10} cy={-8} r={11} fill="none" stroke={SP.stampInk} strokeWidth={2.5} />
        <path d="M -4 -14 q 5 -3 10 0 t 10 0 M -4 -6 q 5 -3 10 0 t 10 0" stroke={SP.stampInk} strokeWidth={2} fill="none" />
      </g>
    )}
  </g>
);

export const YubinTana: React.FC<{ f: number; flow?: number }> = ({ f, flow = 0 }) => {
  const fl = clamp01(flow);
  const flick = 0.9 + 0.1 * Math.sin(f / 6) * Math.sin(f / 15);
  // ハンコ (45コマに1回押す)
  const cyc = (f % 45) / 45;
  const press = cyc < 0.2 ? Math.sin((cyc / 0.2) * Math.PI) : 0;
  const stamped = Math.min(6, 1 + Math.floor(f / 45) % 6);
  const nFly = Math.round(fl * 16);
  return (
    <g>
      <defs>
        <radialGradient id="ytLamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={SP.lampGlow} stopOpacity="0.6" />
          <stop offset="1" stopColor={SP.lampGlow} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 壁 */}
      <rect x={-40} y={-40} width={2000} height={760} fill={SP.postWall} />
      <rect x={-40} y={480} width={2000} height={240} fill={SP.woodMid} />
      <rect x={-40} y={470} width={2000} height={18} fill={SP.woodLight} stroke={INK} strokeWidth={5} />
      <g stroke={SP.woodDark} strokeWidth={4}>{Array.from({ length: 17 }, (_, i) => <line key={i} x1={i * 120} y1={488} x2={i * 120} y2={720} />)}</g>
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200 - 20} y={-40} width={6} height={510} fill={SP.postWallShade} />)}
      {/* 時計 (左上) */}
      <g transform="translate(140 170)">
        <circle r={86} fill={SP.woodDark} stroke={INK} strokeWidth={7} />
        <circle r={68} fill={SP.snow} stroke={INK} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, k) => {
          const a = (k * 30 * Math.PI) / 180;
          return <circle key={k} cx={Math.sin(a) * 56} cy={-Math.cos(a) * 56} r={k % 3 ? 3 : 5} fill={INK} />;
        })}
        <line x1={0} y1={0} x2={0} y2={-48} stroke={INK} strokeWidth={6} strokeLinecap="round" transform="rotate(20)" />
        <line x1={0} y1={0} x2={0} y2={-32} stroke={INK} strokeWidth={8} strokeLinecap="round" transform="rotate(250)" />
        <line x1={0} y1={8} x2={0} y2={-58} stroke={SP.red} strokeWidth={2.5} transform={`rotate(${(Math.floor(f / 30) * 6) % 360})`} />
        <circle r={6} fill={INK} />
        {/* ふり子 */}
        <g transform={`translate(0 86) rotate(${Math.sin(f / 15) * 14})`}>
          <line x1={0} y1={0} x2={0} y2={62} stroke={SP.brassDark} strokeWidth={5} />
          <circle cx={0} cy={70} r={16} fill={SP.brass} stroke={INK} strokeWidth={4} />
        </g>
      </g>
      {/* 壁のランプ (左) */}
      <g>
        <circle cx={140} cy={430} r={190} fill="url(#ytLamp)" opacity={flick} />
        <rect x={120} y={430} width={40} height={30} rx={5} fill={SP.brass} stroke={INK} strokeWidth={4} />
        <path d="M 110 430 Q 112 380 140 370 Q 168 380 170 430 Z" fill="#FFF3CC" stroke={INK} strokeWidth={5} />
        <ellipse cx={140} cy={404} rx={12} ry={18} fill={KRP.white} opacity={0.9 * flick} />
      </g>
      {/* 雪の窓 (右) */}
      <g>
        <rect x={1700} y={110} width={190} height={330} rx={6} fill="#2C3E66" stroke={INK} strokeWidth={8} />
        <rect x={1712} y={122} width={166} height={306} fill="#3A5286" />
        <path d="M 1712 380 Q 1760 350 1810 368 Q 1850 360 1878 372 L 1878 428 L 1712 428 Z" fill={SP.snow} />
        <path d="M 1730 380 L 1730 300 L 1770 270 L 1810 300 L 1810 380 Z" fill="#6A5A7A" opacity={0.7} />
        <rect x={1760} y={320} width={20} height={20} fill={KRP.yellow} opacity={0.8} />
        {Array.from({ length: 14 }, (_, i) => {
          const yy = (rnd(i + 20) * 306 + f * (0.8 + rnd(i + 30) * 0.9)) % 306;
          return <circle key={i} cx={1718 + rnd(i + 40) * 152 + Math.sin((f + i * 17) / 16) * 5} cy={122 + yy} r={2.5 + rnd(i + 50) * 2} fill={KRP.white} />;
        })}
        <line x1={1795} y1={122} x2={1795} y2={428} stroke={SP.woodDark} strokeWidth={7} />
        <line x1={1712} y1={275} x2={1878} y2={275} stroke={SP.woodDark} strokeWidth={7} />
        <rect x={1690} y={436} width={210} height={20} rx={4} fill={SP.wood} stroke={INK} strokeWidth={5} />
      </g>
      {/* 仕分け棚 */}
      <g>
        <rect x={250} y={70} width={1420} height={40} fill={SP.woodDark} stroke={INK} strokeWidth={7} />
        <rect x={236} y={56} width={1448} height={22} rx={4} fill={SP.wood} stroke={INK} strokeWidth={6} />
        <rect x={260} y={100} width={1400} height={540} fill={SP.wood} stroke={INK} strokeWidth={7} />
        {Array.from({ length: 50 }, (_, i) => {
          const c = i % 10, r = Math.floor(i / 10);
          const x = CB.x0 + c * CB.w, y = CB.y0 + r * CB.h;
          const base = Math.floor(rnd(i + 3) * 4);
          const n = Math.min(6, base + Math.floor(fl * (2 + rnd(i + 8) * 3)));
          return (
            <g key={i}>
              <rect x={x + 6} y={y + 6} width={CB.w - 12} height={CB.h - 26} fill={SP.cubby} stroke={INK} strokeWidth={4} />
              <rect x={x + 6} y={y + 6} width={CB.w - 12} height={10} fill={INK} opacity={0.25} />
              {Array.from({ length: n }, (_, k) => (
                <rect key={k} x={x + 16 + k * 16} y={y + 30 - (k % 2) * 4} width={18} height={CB.h - 52}
                  fill={ENV_COLORS[(i + k) % 4]} stroke={INK} strokeWidth={2.5}
                  transform={`rotate(${(k - n / 2) * 4} ${x + 25 + k * 16} ${y + CB.h - 22})`} />
              ))}
              <rect x={x + CB.w / 2 - 18} y={y + CB.h - 18} width={36} height={14} rx={3} fill={SP.brass} stroke={INK} strokeWidth={2.5} />
              <text x={x + CB.w / 2} y={y + CB.h - 7} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={12} fill={INK}>{i + 1}</text>
            </g>
          );
        })}
        <rect x={260} y={100} width={1400} height={540} fill="none" stroke={SP.woodDark} strokeWidth={12} />
      </g>
      {/* 床と台 */}
      <rect x={-40} y={720} width={2000} height={400} fill="#8A6B4A" />
      <g stroke="#76593C" strokeWidth={4}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={-40} y1={740 + i * 34} x2={1960} y2={740 + i * 34} />)}</g>
      <polygon points="60,690 1860,690 1940,770 -20,770" fill={SP.woodLight} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <g stroke={SP.grain} strokeWidth={3.5} fill="none" opacity={0.8}>
        <path d="M 100 712 Q 600 704 1000 716 T 1820 708" />
        <path d="M 40 748 Q 700 738 1100 752 T 1880 744" />
      </g>
      <rect x={-20} y={770} width={1960} height={90} fill={SP.wood} stroke={INK} strokeWidth={7} />
      {[240, 720, 1200, 1680].map((dx) => <rect key={dx} x={dx - 150} y={784} width={300} height={62} rx={5} fill={SP.woodLight} stroke={INK} strokeWidth={4} />)}
      {[20, 1860].map((lx) => <rect key={lx} x={lx} y={860} width={60} height={240} fill={SP.woodDark} stroke={INK} strokeWidth={6} />)}
      {/* 郵便袋 (左。口から手紙があふれる) */}
      <g>
        <ellipse cx={240} cy={696} rx={150} ry={20} fill={INK} opacity={0.22} />
        <path d="M 100 690 Q 70 560 150 500 L 330 500 Q 410 560 380 690 Q 240 712 100 690 Z" fill="#B9A27A" stroke={INK} strokeWidth={6} />
        <path d="M 130 640 Q 120 580 160 530" stroke="#D4C09A" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M 150 500 Q 240 470 330 500 Q 300 520 240 518 Q 180 520 150 500 Z" fill="#8F7A55" stroke={INK} strokeWidth={5} />
        {/* 布のしわと、口をしばった縄 */}
        <path d="M 120 680 Q 150 620 140 560 M 360 676 Q 340 610 352 556 M 200 690 Q 210 640 196 600 M 290 690 Q 280 640 296 596"
          stroke="#8F7A55" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M 160 512 Q 240 530 320 512" stroke="#7A5E36" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M 318 514 q 22 16 14 40 M 318 514 q 32 6 40 28" stroke="#7A5E36" strokeWidth={6} fill="none" strokeLinecap="round" />
        <circle cx={240} cy={620} r={24} fill="none" stroke={SP.stampInk} strokeWidth={4} opacity={0.6} />
        {[[200, 494, -20], [250, 486, 8], [290, 496, 24], [226, 478, -4]].map(([lx, ly, lr], i) => (
          <Letter key={i} x={lx} y={ly} r={lr} s={0.8} c={ENV_COLORS[i % 4]} />
        ))}
      </g>
      {/* 台の上の手紙の山 */}
      {[[560, 4], [800, 6], [1260, 5]].map(([px, base], j) => {
        const h = base + Math.floor(fl * 6);
        return (
          <g key={j}>
            {Array.from({ length: h }, (_, k) => (
              <Letter key={k} x={px + (rnd(j * 20 + k) - 0.5) * 18} y={712 - k * 10} r={(rnd(j * 30 + k) - 0.5) * 16} s={1}
                c={ENV_COLORS[(j + k) % 4]} mark={k % 2 === 0} />
            ))}
          </g>
        );
      })}
      {/* 消印のハンコと、押された手紙 */}
      <g>
        <rect x={930} y={712} width={90} height={20} rx={4} fill={SP.stampInk} stroke={INK} strokeWidth={4} transform="rotate(-3 975 722)" />
        {Array.from({ length: stamped }, (_, k) => (
          <Letter key={k} x={1080 + k * 6} y={716 - k * 8} r={-4 + k * 2} mark c={ENV_COLORS[k % 4]} />
        ))}
        <g transform={`translate(1090 ${716 - (stamped - 1) * 8 - 38 - 34 * (1 - press)})`}>
          <rect x={-22} y={-90} width={44} height={70} rx={20} fill={SP.woodDark} stroke={INK} strokeWidth={5} />
          <circle cx={0} cy={-94} r={16} fill={SP.wood} stroke={INK} strokeWidth={4} />
          <rect x={-8} y={-22} width={16} height={22} fill={KRP.grayDark} stroke={INK} strokeWidth={3} />
          <rect x={-28} y={0} width={56} height={16} rx={3} fill={KRP.grayDark} stroke={INK} strokeWidth={4} />
        </g>
        {press > 0.6 && (
          <g stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={press}>
            <path d={`M 1040 ${700 - stamped * 8} l -20 -6 M 1140 ${700 - stamped * 8} l 20 -6 M 1050 ${686 - stamped * 8} l -14 -14 M 1130 ${686 - stamped * 8} l 14 -14`} />
          </g>
        )}
      </g>
      {/* はかり (右) */}
      <g transform="translate(1530 710)">
        <rect x={-70} y={-16} width={140} height={20} rx={5} fill={SP.brassDark} stroke={INK} strokeWidth={5} />
        <rect x={-10} y={-120} width={20} height={106} fill={SP.brass} stroke={INK} strokeWidth={4} />
        <g transform={`rotate(${Math.sin(f / 20) * 4 + fl * 6} 0 -120)`}>
          <line x1={-90} y1={-120} x2={90} y2={-120} stroke={SP.brassDark} strokeWidth={8} strokeLinecap="round" />
          <path d="M -90 -120 L -120 -60 M -90 -120 L -60 -60 M 90 -120 L 60 -60 M 90 -120 L 120 -60" stroke={INK} strokeWidth={2.5} />
          <path d="M -130 -60 Q -90 -40 -50 -60 Z" fill={SP.brass} stroke={INK} strokeWidth={4} />
          <path d="M 50 -60 Q 90 -40 130 -60 Z" fill={SP.brass} stroke={INK} strokeWidth={4} />
          <Letter x={-90} y={-72} r={-4} s={0.6} c={SP.envelopeBlue} />
          <rect x={80} y={-74} width={20} height={14} rx={3} fill={KRP.grayDark} stroke={INK} strokeWidth={3} />
        </g>
        <circle cx={0} cy={-124} r={8} fill={SP.brass} stroke={INK} strokeWidth={3} />
      </g>
      {/* ひもの束 */}
      <g transform="translate(1720 730)">
        <ellipse cx={0} cy={0} rx={40} ry={16} fill="#D9C08A" stroke={INK} strokeWidth={4} />
        <ellipse cx={0} cy={-2} rx={14} ry={6} fill="#B89C62" />
        <path d="M 38 2 Q 80 10 70 34" stroke="#B89C62" strokeWidth={4} fill="none" />
      </g>
      {/* 飛ぶ手紙 (袋 → 棚) */}
      {Array.from({ length: nFly }, (_, k) => {
        const p = ((f / 70) + k / Math.max(nFly, 1)) % 1;
        const [tx, ty] = cubbyCenter((k * 7 + 3) % 50);
        const sx = 240, sy = 480;
        const cx = (sx + tx) / 2, cy = Math.min(sy, ty) - 160;
        const q = easeOut(p);
        const x = (1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cx + q * q * tx;
        const y = (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cy + q * q * ty;
        const o = Math.min(1, p * 6) * Math.min(1, (1 - p) * 5);
        return (
          <g key={k} opacity={o}>
            <Letter x={x} y={y} r={p * 360 * (k % 2 ? 1 : -1) * 0.6} s={0.75} c={ENV_COLORS[k % 4]} />
            <path d={`M ${x - 40} ${y + 10} l -24 4 M ${x - 36} ${y + 22} l -18 4`} stroke={KRP.white} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

/* ===================================================================
 * プレビュー (Composition "SantaParts")。1コマ = 1つの見本
 *   0〜3 KumitateDai / 4 動きの比べ (add) / 5〜7 YougishaBoard / 8〜9 NoradRoom / 10 動きの比べ (blip)
 *   11〜12 YubinTana / 13 動きの比べ (flow) / 14 部品13種と札の絵
 * =================================================================== */
import { useCurrentFrame } from "remotion";
import { Frame } from "./HimaShared";

const Half: React.FC<{ x: number; children: React.ReactNode; label: string }> = ({ x, children, label }) => (
  <g>
    <g transform={`translate(${x} 270) scale(0.48)`}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      <svg x={0} y={0} width={1920} height={1080} viewBox="0 0 1920 1080" overflow="hidden">{children}</svg>
      <rect x={0} y={0} width={1920} height={1080} fill="none" stroke={INK} strokeWidth={8} />
    </g>
    <text x={x + 460} y={830} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>{label}</text>
  </g>
);

export const SANTA_PARTS_PREVIEW_FRAMES = 15;
export const SantaPartsPreview: React.FC = () => {
  const fr = useCurrentFrame();
  const f = 30 + fr * 7;
  if (fr === 0) return <Frame f={f} seed={91}><KumitateDai f={f} parts={0} /></Frame>;
  if (fr === 1) return <Frame f={f} seed={92}><KumitateDai f={f} parts={5} add={0.45} /></Frame>;
  if (fr === 2) return <Frame f={f} seed={93}><KumitateDai f={f} parts={9} add={0.86} /></Frame>;
  if (fr === 3) return <Frame f={f} seed={94}><KumitateDai f={f} parts={13} /></Frame>;
  if (fr === 4) return (
    <Frame f={f} seed={95}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paperCool} />
      <Half x={20} label="add=0.3"><KumitateDai f={f} parts={3} add={0.3} /></Half>
      <Half x={980} label="add=0.9"><KumitateDai f={f} parts={3} add={0.9} /></Half>
    </Frame>
  );
  if (fr === 5) return <Frame f={f} seed={96}><YougishaBoard f={f} cards={4} /></Frame>;
  if (fr === 6) return <Frame f={f} seed={97}><YougishaBoard f={f} cards={7} add={0.55} /></Frame>;
  if (fr === 7) return <Frame f={f} seed={98}><YougishaBoard f={f} cards={13} focus={9} /></Frame>;
  if (fr === 8) return <Frame f={f} seed={99} dark><NoradRoom f={f} blip={0} /></Frame>;
  if (fr === 9) return <Frame f={f} seed={100} dark><NoradRoom f={f} blip={0.7} /></Frame>;
  if (fr === 10) return (
    <Frame f={f} seed={101}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paperCool} />
      <Half x={20} label="blip=0.2"><NoradRoom f={f} blip={0.2} /></Half>
      <Half x={980} label="blip=0.9"><NoradRoom f={f} blip={0.9} /></Half>
    </Frame>
  );
  if (fr === 11) return <Frame f={f} seed={102}><YubinTana f={f} flow={0} /></Frame>;
  if (fr === 12) return <Frame f={f} seed={103}><YubinTana f={f} flow={1} /></Frame>;
  if (fr === 13) return (
    <Frame f={f} seed={104}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paperCool} />
      <Half x={20} label="flow=0.2"><YubinTana f={f} flow={0.2} /></Half>
      <Half x={980} label="flow=1"><YubinTana f={f} flow={1} /></Half>
    </Frame>
  );
  const extra: SuspectIcon[] = ["mitre", "quill", "star", "easel", "guitar"];
  return (
    <Frame f={f} seed={105}>
      <rect x={0} y={0} width={1920} height={1080} fill={KRP.paper} />
      {Array.from({ length: 13 }, (_, i) => {
        const x = 180 + (i % 7) * 260, y = i < 7 ? 360 : 640;
        return (
          <g key={i}>
            <SantaBuhin x={x} y={y} s={1.4} f={f} n={i + 1} />
            <text x={x} y={y + 50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK}>{i + 1}</text>
          </g>
        );
      })}
      {extra.map((ic, i) => (
        <g key={ic} transform={`translate(${440 + i * 260} 960) scale(1.1)`}>
          <SuspectIconArt icon={ic} f={f} />
          <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={INK}>{ic}</text>
        </g>
      ))}
    </Frame>
  );
};
