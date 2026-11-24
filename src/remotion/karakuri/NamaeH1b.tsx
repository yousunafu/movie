// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#169〜#176 (8文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで8枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 実在の人物と映画の人物は顔を見せない (後ろ姿・シルエット)

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./NamaeShared";
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend, Ushiro, MeijiLock } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 畳の部屋
  wall: "#EADFC4",
  wallDark: "#D9CCAA",
  shoji: "#F6F0DE",
  shojiFrame: "#9C7A4E",
  tatami: "#CDBF85",
  tatamiDark: "#A8995C",
  heri: "#4F5B3B",
  // 木・漆
  lacquer: "#2B2422",
  woodDeep: "#5E3B20",
  wood: "#8A5A33",
  woodLight: "#B07D4F",
  plank: "#C79A68",
  // 札束 (字のない帯)
  bill: "#D9CFAA",
  billDark: "#B8AC84",
  billBand: "#F4EFDF",
  kinshi: "#C8372D",
  // 協会の幕
  maku: "#5A3E7A",
  makuDark: "#40295A",
  // 鉄の金庫
  iron: "#3A3B42",
  ironLight: "#5A5C66",
  // ドル札
  dollar: "#8DB07A",
  dollarDark: "#5E8450",
  dollarLight: "#C4D9AE",
  // リンゴ
  apple: "#C9302C",
  appleDark: "#8E1E1E",
  appleHi: "#F07D6B",
  leaf: "#6FA24A",
  stem: "#6B4426",
  // 夜・展示室
  night: "#2E3247",
  nightDeep: "#1F2233",
  velvet: "#7A2B3A",
  velvetDark: "#5A1E2A",
  // 人の服
  gold: "#D9A520",
  goldDark: "#A87D12",
  goldLight: "#F4D77A",
  suit: "#2F3B5C",
  suitDark: "#212A44",
  narrator: "#6F8FB0",
  narratorDark: "#557394",
  oyakata: "#3B3F52",
  oyakataDark: "#2A2D3B",
  // 工房・事務所・法廷
  peg: "#C9A97A",
  pegHole: "#8E7048",
  blueprint: "#5C7FA6",
  office: "#D5DCE3",
  officeDark: "#AEB8C3",
  carpetGray: "#9AA1A8",
  curtainG: "#2F5B4A",
  curtainGDark: "#1F4035",
  robe: "#1E1E24",
  chair: "#6B2E2E",
  carpet: "#8A3A36",
  carpetDark: "#6A2A28",
  lilac: "#A98BC4",
  hairBlack: "#2B2622",
  skin: "#F2D6B8",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend; void Ushiro; void MeijiLock;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;
const easeIn = (t: number) => t * t;
const cam = (s: number, dx = 0, dy = 0, cx = 960, cy = 540) =>
  `translate(${cx + dx} ${cy + dy}) scale(${s}) translate(${-cx} ${-cy})`;

// ぼかし (背景の畳の部屋など)
const NH1bBlur: React.FC<{ id: string; sd: number }> = ({ id, sd }) => (
  <defs>
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation={sd} />
    </filter>
  </defs>
);

// きらり (4つ角の星)
const NH1bStar: React.FC<{ x: number; y: number; r: number; o?: number; color?: string }> = ({ x, y, r, o = 1, color = NP.glowCore }) =>
  r <= 0.5 ? null : (
    <path
      d={`M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`}
      fill={color} stroke={KRP.ink} strokeWidth={3} opacity={o}
    />
  );

// 年寄名跡の木札 (縦長・上がとがった白木の札。字は読めない墨の筆あと)。x,y は札の中心。s=1 で幅112・高さ310
const NH1bMeiseki: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number }> = ({ x, y, s = 1, rot = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow > 0.01 && <ellipse cx={0} cy={0} rx={120} ry={200} fill={NP.glow} opacity={0.4 * glow} />}
    <path d="M -50 -124 L 6 -152 L 62 -124 L 62 158 L -50 158 Z" fill={KRP.ink} opacity={0.18} />
    <path d="M -56 -130 L 0 -160 L 56 -130 L 56 150 L -56 150 Z" fill={NP.wood} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 40 -126 L 40 146" stroke={NP.woodMid} strokeWidth={10} opacity={0.6} />
    <g stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.7}>
      <path d="M -36 -110 q 6 80 -2 160 q -6 60 4 96" />
      <path d="M 26 -118 q -6 90 2 170 q 4 50 -2 84" />
    </g>
    {/* 紐の穴と赤い紐 */}
    <circle cx={0} cy={-126} r={8} fill={NP.woodDark} stroke={KRP.ink} strokeWidth={3} />
    <path d="M -4 -126 q -22 -40 4 -62 q 24 20 0 62" fill="none" stroke={KRP.red} strokeWidth={5} />
    {/* 墨の筆あと (字としては読めない) */}
    <g stroke={NP.sumi} strokeWidth={9} strokeLinecap="round" fill="none">
      <path d="M -22 -100 q 22 -14 42 -2 q -12 10 -30 14" />
      <path d="M 4 -112 q -10 34 2 60 q 8 12 -16 24" />
      <path d="M -26 -16 q 26 -18 52 -4" />
      <path d="M -4 -34 q -12 46 -22 70" />
      <path d="M 10 -22 q 14 28 20 48" />
      <path d="M -24 64 q 20 -14 46 -2 q -8 12 -26 10" />
      <path d="M 4 50 q -10 36 4 72" />
    </g>
  </g>
);

// 札束1つ (字のない帯)。x,y は底の中央。s=1 で幅120
const NH1bBundle: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) =>
  o <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <polygon points="-60,-50 60,-50 74,-64 -46,-64" fill={C.billBand} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <polygon points="60,-50 74,-64 74,-14 60,0" fill={C.billDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-60} y={-50} width={120} height={50} fill={C.bill} stroke={KRP.ink} strokeWidth={4} />
      <g stroke={C.billDark} strokeWidth={2}>
        {[-40, -30, -20, -10].map((ly) => <line key={ly} x1={-56} y1={ly} x2={56} y2={ly} />)}
      </g>
      <rect x={-14} y={-50} width={28} height={50} fill={C.billBand} stroke={KRP.ink} strokeWidth={3} />
      <polygon points="-14,-50 14,-50 28,-64 0,-64" fill={C.billBand} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );

// 札束の山 (下3・中2・上1)。x,y は底の中央。drop(i) で i 番目が上から落ちてくる量 (0=空, 1=着地)
const NH1bPile: React.FC<{ x: number; y: number; s?: number; drop?: (i: number) => number; o?: number }> = ({ x, y, s = 1, drop = () => 1, o = 1 }) => {
  const spots: [number, number][] = [[-120, 0], [0, 0], [120, 0], [-60, -50], [60, -50], [0, -100]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {spots.map(([bx, by], i) => {
        const d = clamp01(drop(i));
        return d > 0 ? <NH1bBundle key={i} x={bx} y={by - (1 - easeIn(d)) * 300} o={Math.min(1, d * 3)} /> : null;
      })}
    </g>
  );
};

// 天秤。x,y は支点。ang は傾き (度、正=右が下がる)。left/right は皿の上 (原点=皿の上面中央)、center は支点の下に吊る物
const NH1bBalance: React.FC<{
  x: number; y: number; baseY: number; ang: number; arm?: number; hang?: number; panW?: number;
  left?: React.ReactNode; right?: React.ReactNode; center?: React.ReactNode;
}> = ({ x, y, baseY, ang, arm = 430, hang = 300, panW = 340, left, right, center }) => {
  const r = (ang * Math.PI) / 180;
  const lx = x - arm * Math.cos(r), ly = y - arm * Math.sin(r);
  const rx = x + arm * Math.cos(r), ry = y + arm * Math.sin(r);
  const pan = (px: number, py: number, content: React.ReactNode, k: string) => {
    const top = py + hang;
    return (
      <g key={k}>
        <path d={`M ${px} ${py} L ${px - panW / 2 + 8} ${top} M ${px} ${py} L ${px + panW / 2 - 8} ${top}`}
          stroke={KRP.ink} strokeWidth={4} fill="none" />
        <circle cx={px} cy={py + 6} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={px} cy={top} rx={panW / 2} ry={18} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(${px} ${top + 4})`}>{content}</g>
        <path d={`M ${px - panW / 2} ${top} Q ${px} ${top + 70} ${px + panW / 2} ${top} Q ${px} ${top + 22} ${px - panW / 2} ${top} Z`}
          fill={NP.brass} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${px - panW / 2 + 40} ${top + 18} Q ${px - 40} ${top + 44} ${px} ${top + 46}`} stroke={NP.glowCore} strokeWidth={5} fill="none" opacity={0.7} />
      </g>
    );
  };
  return (
    <g>
      {/* 台 */}
      <ellipse cx={x} cy={baseY + 36} rx={230} ry={20} fill={KRP.ink} opacity={0.2} />
      <rect x={x - 190} y={baseY - 22} width={380} height={56} rx={12} fill={C.lacquer} stroke={KRP.ink} strokeWidth={6} />
      <rect x={x - 176} y={baseY - 16} width={352} height={10} rx={5} fill={C.woodLight} opacity={0.4} />
      <rect x={x - 120} y={baseY - 56} width={240} height={36} rx={10} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 柱 */}
      <rect x={x - 18} y={y + 6} width={36} height={baseY - 56 - y - 6} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
      <rect x={x - 8} y={y + 16} width={8} height={baseY - 80 - y} fill={NP.glowCore} opacity={0.5} />
      {[0.35, 0.7].map((q) => (
        <rect key={q} x={x - 28} y={y + (baseY - y) * q} width={56} height={18} rx={6} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
      ))}
      {center}
      {/* さお */}
      <g transform={`rotate(${ang} ${x} ${y})`}>
        <rect x={x - arm - 12} y={y - 12} width={2 * arm + 24} height={24} rx={12} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={x - arm} y={y - 6} width={2 * arm} height={5} fill={NP.glowCore} opacity={0.55} />
        <polygon points={`${x - 12},${y - 10} ${x + 12},${y - 10} ${x},${y - 74}`} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {[-1, 1].map((sd) => (
          <circle key={sd} cx={x + sd * (arm + 6)} cy={y} r={16} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
      <circle cx={x} cy={y} r={22} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={x} cy={y} r={7} fill={KRP.ink} />
      {pan(lx, ly, left, "l")}
      {pan(rx, ry, right, "r")}
    </g>
  );
};

// 歯車
const NH1bGear: React.FC<{ cx: number; cy: number; r: number; n: number; ang: number; fill: string }> = ({ cx, cy, r, n, ang, fill }) => {
  const pts: string[] = [];
  const step = Math.PI / n;
  for (let i = 0; i < n * 2; i++) {
    const a = i * step;
    const rr = i % 2 ? r * 0.8 : r;
    pts.push(`${cx + rr * Math.cos(a - step * 0.42)},${cy + rr * Math.sin(a - step * 0.42)}`);
    pts.push(`${cx + rr * Math.cos(a + step * 0.42)},${cy + rr * Math.sin(a + step * 0.42)}`);
  }
  return (
    <g transform={`rotate(${ang} ${cx} ${cy})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={r * 0.5} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      {[0, 60, 120].map((a) => (
        <line key={a} x1={cx - r * 0.5 * Math.cos((a * Math.PI) / 180)} y1={cy - r * 0.5 * Math.sin((a * Math.PI) / 180)}
          x2={cx + r * 0.5 * Math.cos((a * Math.PI) / 180)} y2={cy + r * 0.5 * Math.sin((a * Math.PI) / 180)}
          stroke={KRP.ink} strokeWidth={4} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.14} fill={KRP.ink} />
    </g>
  );
};

// 数字のドラム1つ。v は小数 (回転中の値)
const NH1bDrum: React.FC<{ cx: number; cy: number; w: number; h: number; v: number; id: string; blur?: number }> = ({ cx, cy, w, h, v, id, blur = 0 }) => {
  const base = Math.floor(v);
  const fr = v - base;
  const d0 = ((base % 10) + 10) % 10;
  const d1 = (d0 + 1) % 10;
  const fs = h * 0.72;
  return (
    <g>
      <defs>
        <clipPath id={id}><rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={10} /></clipPath>
      </defs>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={10} fill={KRP.white} />
      <g clipPath={`url(#${id})`}>
        <g opacity={1 - blur * 0.45}>
          <text x={cx} y={cy + fs * 0.36 - fr * h} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={KRP.ink}>{d0}</text>
          <text x={cx} y={cy + fs * 0.36 + h - fr * h} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={KRP.ink}>{d1}</text>
        </g>
        {blur > 0.05 && (
          <g stroke={KRP.grayDark} strokeWidth={4} opacity={blur * 0.6}>
            {[-0.3, 0, 0.3].map((q) => <line key={q} x1={cx + q * w} y1={cy - h / 2} x2={cx + q * w} y2={cy + h / 2} />)}
          </g>
        )}
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h * 0.22} fill={KRP.ink} opacity={0.22} />
        <rect x={cx - w / 2} y={cy + h / 2 - h * 0.22} width={w} height={h * 0.22} fill={KRP.ink} opacity={0.22} />
      </g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={10} fill="none" stroke={KRP.ink} strokeWidth={6} />
    </g>
  );
};

// からくりの「名前の値打ち計量器」。x=中心、py=台の上面。drums=各ドラムの値。children は台に乗る物 (原点=台の上面中央)
const NH1bScale: React.FC<{
  x: number; py: number; f: number; sink: number; drums: number[]; blur?: number[];
  spin: number; id: string; running?: boolean; children?: React.ReactNode;
}> = ({ x, py, f, sink, drums, blur = [], spin, id, running = false, children }) => {
  const n = drums.length;
  const dw = 104, dh = 136, gap = 16;
  const tw = n * dw + (n - 1) * gap;
  const hw = Math.max(tw + 140, 600);
  const hy = 70, hh = 230;
  const lamp = running && Math.floor(f / 5) % 2 === 0;
  const pTop = py + sink;
  return (
    <g>
      {/* 横の歯車 */}
      <NH1bGear cx={x - hw / 2 - 26} cy={hy + 130} r={70} n={10} ang={spin} fill={NP.brassDark} />
      <NH1bGear cx={x + hw / 2 + 22} cy={hy + 76} r={52} n={8} ang={-spin * 1.35} fill={NP.brass} />
      {/* 柱 */}
      <rect x={x - 46} y={hy + hh - 12} width={92} height={py + 40 - (hy + hh) + 12} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={x - 30} y={hy + hh} width={12} height={py - hy - hh} fill={NP.glowCore} opacity={0.35} />
      {/* 数字の箱 */}
      <rect x={x - hw / 2 + 8} y={hy + 10} width={hw} height={hh} rx={28} fill={KRP.ink} opacity={0.2} />
      <rect x={x - hw / 2} y={hy} width={hw} height={hh} rx={28} fill={NP.brass} stroke={KRP.ink} strokeWidth={8} />
      <rect x={x - hw / 2 + 20} y={hy + 16} width={hw - 40} height={14} rx={7} fill={NP.glowCore} opacity={0.5} />
      {Array.from({ length: Math.floor(hw / 70) }, (_, i) => (
        <g key={i}>
          <circle cx={x - hw / 2 + 40 + i * 70} cy={hy + 44} r={6} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={x - hw / 2 + 40 + i * 70} cy={hy + hh - 22} r={6} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      ))}
      {/* 上のランプ */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={x + sd * (hw / 2 - 70) - 22} y={hy - 14} width={44} height={16} rx={4} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${x + sd * (hw / 2 - 70) - 18} ${hy - 14} A 18 18 0 0 1 ${x + sd * (hw / 2 - 70) + 18} ${hy - 14} Z`}
            fill={lamp === (sd === 1) && running ? KRP.red : C.velvetDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* ドラムの窓 */}
      <rect x={x - tw / 2 - 18} y={hy + hh / 2 - dh / 2 - 16} width={tw + 36} height={dh + 32} rx={16} fill={KRP.ink} />
      {drums.map((v, i) => (
        <NH1bDrum key={i} id={`${id}-d${i}`} cx={x - tw / 2 + dw / 2 + i * (dw + gap)} cy={hy + hh / 2} w={dw} h={dh} v={v} blur={blur[i] ?? 0} />
      ))}
      {/* 本体 (バネの窓つき) */}
      <rect x={x - 300} y={py + 40} width={600} height={168} rx={16} fill={C.iron} stroke={KRP.ink} strokeWidth={7} />
      <rect x={x - 286} y={py + 50} width={572} height={10} rx={5} fill={C.ironLight} />
      <rect x={x - 250} y={py + 70} width={150} height={100} rx={10} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${x - 175} ${py + 72} ${Array.from({ length: 6 }, (_, i) => `L ${x - 175 + (i % 2 ? -40 : 40)} ${py + 74 + (i + 1) * (14 + (1 - sink / 18) * 1.5)}`).join(" ")}`}
        fill="none" stroke={NP.brass} strokeWidth={6} strokeLinejoin="round" />
      {[-210, 210].map((fx) => (
        <rect key={fx} x={x + fx - 40} y={py + 206} width={80} height={22} rx={6} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
      ))}
      {/* 台 */}
      <rect x={x - 26} y={pTop + 20} width={52} height={py + 40 - pTop - 20} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={x - 380} y={pTop} width={760} height={28} rx={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={7} />
      <rect x={x - 360} y={pTop + 6} width={720} height={6} rx={3} fill={NP.glowCore} opacity={0.6} />
      <g transform={`translate(${x} ${pTop})`}>{children}</g>
    </g>
  );
};

// 金色に光る名前の札 (芸能人の名前。一般の名前)。x,y は中心。s=1 で幅600
const NH1bKinFuda: React.FC<{
  x: number; y: number; s?: number; glow?: number; eyes?: boolean; gaze?: number; f: number; rot?: number;
}> = ({ x, y, s = 1, glow = 0, eyes = false, gaze = 0, f, rot = 0 }) => {
  const w = 600, h = eyes ? 280 : 220;
  const blink = eyes && f % 53 < 3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {glow > 0.01 && (
        <g opacity={glow}>
          <g transform={`rotate(${f * 0.6})`}>
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const a2 = a + 0.09;
              const R = 520;
              return (
                <polygon key={i} points={`0,0 ${R * Math.cos(a)},${R * Math.sin(a)} ${R * Math.cos(a2)},${R * Math.sin(a2)}`}
                  fill={NP.glow} opacity={0.22} />
              );
            })}
          </g>
          <ellipse cx={0} cy={0} rx={w * 0.66} ry={h * 0.95} fill={NP.glow} opacity={0.32} />
        </g>
      )}
      <rect x={-w / 2 + 10} y={-h / 2 + 12} width={w} height={h} rx={30} fill={KRP.ink} opacity={0.22} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={C.gold} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-w / 2 + 20} y={-h / 2 + 20} width={w - 40} height={h - 40} rx={18} fill="none" stroke={C.goldLight} strokeWidth={5} />
      <rect x={-w / 2 + 24} y={-h / 2 + 10} width={w - 48} height={12} rx={6} fill={NP.glowCore} opacity={0.7} />
      <path d={`M ${-w / 2 + 60} ${h / 2 - 8} L ${-w / 2 + 130} ${-h / 2 + 8}`} stroke={NP.glowCore} strokeWidth={16} opacity={0.35} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <circle key={i} cx={sx * (w / 2 - 34)} cy={sy * (h / 2 - 34)} r={9} fill={C.goldDark} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {eyes && (
        <g>
          {[-120, 120].map((ex) => (
            <g key={ex}>
              {blink ? (
                <line x1={ex - 30} y1={-64} x2={ex + 30} y2={-64} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
              ) : (
                <g>
                  <ellipse cx={ex} cy={-64} rx={36} ry={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
                  <circle cx={ex + gaze * 16} cy={-60} r={15} fill={KRP.ink} />
                  <circle cx={ex + gaze * 16 + 5} cy={-66} r={5} fill={KRP.white} />
                </g>
              )}
            </g>
          ))}
        </g>
      )}
      <text x={0} y={eyes ? 82 : 32} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={NP.sumi}>
        星野 ひかり
      </text>
    </g>
  );
};

// 画面の端からのびてくる手。side=1 は左から右へ、-1 は右から左へ。tipX は指先
const NH1bHand: React.FC<{ side: 1 | -1; tipX: number; y: number; sleeve: string; sleeveDark: string; curl: number; sparkle?: boolean }> = ({
  side, tipX, y, sleeve, sleeveDark, curl, sparkle,
}) => {
  const len = side === 1 ? tipX + 160 : W - tipX + 160;
  return (
    <g transform={side === 1 ? `translate(${tipX} ${y})` : `translate(${tipX} ${y}) scale(-1 1)`}>
      <rect x={-len} y={-40} width={len - 130} height={80} rx={20} fill={sleeve} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-len} y={-40} width={len - 130} height={18} rx={9} fill={sleeveDark} opacity={0.5} />
      <g stroke={sleeveDark} strokeWidth={4} fill="none">
        <path d="M -300 -36 q 20 36 0 72" />
        <path d="M -420 -36 q 22 36 0 72" />
      </g>
      {sparkle && Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={-180 - i * 52} cy={-18 + (i % 3) * 18} r={6} fill={C.goldLight} stroke={KRP.ink} strokeWidth={2} />
      ))}
      <rect x={-146} y={-46} width={36} height={92} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((j) => {
        const fy = -27 + j * 18;
        return (
          <g key={j} transform={`rotate(${curl * (j % 2 ? 1 : 0.8)} -50 ${fy})`}>
            <rect x={-56} y={fy - 8} width={56 - (j === 3 ? 10 : 0)} height={17} rx={8.5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
      <rect x={-112} y={-38} width={76} height={76} rx={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <g transform="rotate(-38 -70 -34)">
        <rect x={-80} y={-74} width={20} height={44} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

// 礼をする親方 (横から。顔は髪で隠した後頭部)。Person の上半身を腰で折る。bow は度
const NH1bBowOyakata: React.FC<{ x: number; y: number; s: number; bow: number; f: number; phase: number; id: string }> = ({ x, y, s, bow, f, phase, id }) => {
  const hipY = y - 58 * s;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-lo`}><rect x={x - 200 * s} y={hipY - 4} width={400 * s} height={120 * s} /></clipPath>
        <clipPath id={`${id}-up`}><rect x={x - 300 * s} y={y - 400 * s} width={600 * s} height={400 * s - 58 * s + 2} /></clipPath>
      </defs>
      <ellipse cx={x} cy={y + 4} rx={70 * s} ry={12 * s} fill={KRP.ink} opacity={0.2} />
      <g clipPath={`url(#${id}-lo)`}>
        <Person x={x} y={y} s={s} f={f} phase={phase} still cloth={C.oyakata} clothDark={C.oyakataDark} hair="none" />
      </g>
      <g transform={`rotate(${bow} ${x} ${hipY})`}>
        <g clipPath={`url(#${id}-up)`}>
          <Person x={x} y={y} s={s} f={f} phase={phase} still cloth={C.oyakata} clothDark={C.oyakataDark} hair="none" />
        </g>
        {/* 後頭部 (顔を見せない) */}
        <circle cx={x} cy={y - 228 * s} r={67 * s} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={5 * s} />
        <path d={`M ${x - 40 * s} ${y - 270 * s} q 30 ${-14 * s} ${70 * s} ${4 * s}`} stroke={KRP.grayDark} strokeWidth={4 * s} fill="none" opacity={0.6} />
        <ellipse cx={x + 54 * s} cy={y - 222 * s} rx={11 * s} ry={17 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={4 * s} />
        {/* 着物の襟 */}
        <path d={`M ${x - 30 * s} ${y - 160 * s} L ${x} ${y - 118 * s} L ${x + 30 * s} ${y - 160 * s}`} stroke={KRP.white} strokeWidth={7 * s} fill="none" />
      </g>
      {/* 腰の帯 (つなぎ目を隠す) */}
      <rect x={x - 60 * s} y={hipY - 14 * s} width={120 * s} height={22 * s} rx={6 * s} fill={C.oyakataDark} stroke={KRP.ink} strokeWidth={4 * s} />
    </g>
  );
};

// ドル札の積み上げ。n は小数 (れんがの数)。x,y は底の中央
const NH1bDollars: React.FC<{ x: number; y: number; n: number; s?: number }> = ({ x, y, n, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: Math.ceil(n) }, (_, i) => {
      const t = clamp01(n - i);
      if (t <= 0) return null;
      const by = -i * 36 - (1 - easeOut(t)) * 140;
      const jx = (rnd(77, i) - 0.5) * 16;
      return (
        <g key={i} transform={`translate(${jx} ${by})`} opacity={Math.min(1, t * 2.5)}>
          <polygon points="-86,-36 86,-36 100,-48 -72,-48" fill={C.dollarLight} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <polygon points="86,-36 100,-48 100,-12 86,0" fill={C.dollarDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <rect x={-86} y={-36} width={172} height={36} fill={C.dollar} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-18} rx={22} ry={13} fill={C.dollarLight} stroke={C.dollarDark} strokeWidth={3} />
          <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.dollarDark}>$</text>
          <rect x={-60} y={-36} width={16} height={36} fill={KRP.white} opacity={0.75} />
          <line x1={-82} y1={-24} x2={-66} y2={-24} stroke={C.dollarDark} strokeWidth={2} />
          <line x1={40} y1={-12} x2={80} y2={-12} stroke={C.dollarDark} strokeWidth={2} />
        </g>
      );
    })}
  </g>
);

// 本物のリンゴ (果物。ロゴではない)。x,y は底の中央。s=1 で幅260
const NH1bApple: React.FC<{ x: number; y: number; s?: number; squash?: number }> = ({ x, y, s = 1, squash = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + squash * 0.08)} ${s * (1 - squash * 0.1)})`}>
    <ellipse cx={0} cy={-2} rx={120} ry={14} fill={KRP.ink} opacity={0.25} />
    <path d="M 0 -196 C -40 -228 -132 -224 -132 -128 C -132 -40 -72 0 -32 -4 C -16 -6 -10 0 0 0 C 10 0 16 -6 32 -4 C 72 0 132 -40 132 -128 C 132 -224 40 -228 0 -196 Z"
      fill={C.apple} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 40 -200 C 110 -200 124 -140 120 -110 C 112 -50 76 -14 36 -10 C 80 -40 100 -100 40 -200 Z" fill={C.appleDark} opacity={0.45} />
    <ellipse cx={-62} cy={-140} rx={20} ry={40} fill={C.appleHi} opacity={0.85} transform="rotate(-22 -62 -140)" />
    <ellipse cx={-80} cy={-82} rx={7} ry={12} fill={C.appleHi} opacity={0.6} />
    {Array.from({ length: 12 }, (_, i) => (
      <circle key={i} cx={-90 + rnd(5, i) * 180} cy={-170 + rnd(6, i) * 150} r={2.6} fill={KRP.yellow} opacity={0.7} />
    ))}
    <path d="M -10 -196 Q 0 -186 10 -196" stroke={C.appleDark} strokeWidth={5} fill="none" />
    <path d="M 0 -194 Q 2 -230 14 -250" stroke={C.stem} strokeWidth={11} fill="none" strokeLinecap="round" />
    <path d="M 12 -232 Q 50 -276 96 -244 Q 56 -206 12 -232 Z" fill={C.leaf} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 18 -232 Q 54 -246 88 -244" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.6} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================
// -------------------------------------------------------------------
// #169 かつては、億単位のお金で受け継がれたとも言われました。
// 格: 並 / seed 4169
// どこ: ぼかした畳の座敷 (障子・床の間・掛け軸) の手前に、真鍮の天秤
// 演出: 左の皿に年寄名跡の木札1枚。右の皿は空 → 札束が1つずつ落ちてきて、6つ積もったところで天秤がつり合う
// 動き: 札束が f4〜29 で落ちる・天秤が左下がりから水平へ・木札のまわりにきらり・カメラがゆっくり寄る
const Nm169: React.FC<{ f: number }> = ({ f }) => {
  const settle = easeOut(seg(f, 4, 32));
  const ang = -11 * (1 - settle) + Math.sin(f / 9) * 1.4 * settle;
  const drop = (i: number) => seg(f, 4 + i * 4, 9 + i * 4);
  const z = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4169}>
      <NH1bBlur id="nh1b169blur" sd={6} />
      <g transform={cam(z, 0, 10)}>
        {/* ぼかした座敷 */}
        <g filter="url(#nh1b169blur)">
          <rect x={-40} y={-40} width={W + 80} height={660} fill={C.wall} />
          <rect x={-40} y={-40} width={W + 80} height={130} fill={C.woodLight} opacity={0.55} />
          <rect x={-40} y={90} width={W + 80} height={30} fill={C.wood} />
          {/* 障子 */}
          {[0, 1, 2, 3].map((p) => (
            <g key={p}>
              <rect x={40 + p * 180} y={120} width={180} height={480} fill={C.shoji} stroke={C.shojiFrame} strokeWidth={10} />
              {[1, 2].map((c) => <line key={c} x1={40 + p * 180 + c * 60} y1={120} x2={40 + p * 180 + c * 60} y2={600} stroke={C.shojiFrame} strokeWidth={4} />)}
              {[1, 2, 3, 4, 5].map((r) => <line key={r} x1={40 + p * 180} y1={120 + r * 80} x2={220 + p * 180} y2={120 + r * 80} stroke={C.shojiFrame} strokeWidth={4} />)}
            </g>
          ))}
          {/* 床の間 */}
          <rect x={1240} y={120} width={660} height={480} fill={C.wallDark} />
          <rect x={1226} y={120} width={30} height={480} fill={C.woodDeep} />
          <rect x={1480} y={160} width={160} height={330} fill={KRP.white} stroke={C.woodDeep} strokeWidth={6} />
          <path d="M 1500 400 L 1540 320 L 1570 360 L 1600 300 L 1625 400 Z" fill={KRP.grayDark} opacity={0.6} />
          <rect x={1470} y={150} width={180} height={14} fill={C.woodDeep} />
          <rect x={1470} y={486} width={180} height={14} fill={C.woodDeep} />
          <rect x={1240} y={560} width={660} height={40} fill={C.woodDeep} />
          <path d="M 1780 560 q -10 -40 0 -70 q 14 30 0 70 Z" fill={C.velvet} />
          <path d="M 1780 490 q -60 -90 -120 -110 M 1780 500 q 40 -80 90 -100" stroke={C.woodDeep} strokeWidth={6} fill="none" />
          {/* 畳 */}
          <rect x={-40} y={600} width={W + 80} height={520} fill={C.tatami} />
          <rect x={-40} y={600} width={W + 80} height={14} fill={C.woodDeep} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={960 + (i - 4) * 320} y1={614} x2={960 + (i - 4) * 620} y2={1100} stroke={C.tatamiDark} strokeWidth={6} />
          ))}
          <rect x={-40} y={780} width={W + 80} height={16} fill={C.heri} />
          {Array.from({ length: 30 }, (_, i) => (
            <line key={i} x1={-40} y1={630 + i * 16} x2={W + 40} y2={630 + i * 16} stroke={C.tatamiDark} strokeWidth={2} opacity={0.35} />
          ))}
        </g>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wall} opacity={0.18} />
        {/* 天秤 */}
        <NH1bBalance x={960} y={230} baseY={880} ang={ang} arm={430} hang={300} panW={360}
          left={
            <g>
              <rect x={-74} y={-22} width={148} height={20} rx={6} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
              <NH1bMeiseki x={0} y={-22 - 150 * 0.82} s={0.82} glow={0.55 + Math.sin(f / 6) * 0.25} />
            </g>
          }
          right={<NH1bPile x={0} y={-2} s={0.9} drop={drop} />}
        />
        {/* 木札のきらり */}
        {[[420, 300, 0], [600, 380, 9], [470, 460, 17]].map(([sx, sy, ph], i) => (
          <NH1bStar key={i} x={sx} y={sy + (530 - 230 - 300) + 11 * (1 - settle) * 4} r={14 + 10 * Math.sin((f + ph) / 5)} o={0.9} />
        ))}
      </g>
      <TagPlate x={1390} y={770} text="億単位" size={40} t={seg(f, 28, 36)} rot={2} />
      <TagPlate x={1640} y={120} text="〜とも言われた" size={30} t={seg(f, 32, 40)} rot={-3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #170 2014年からは、相撲協会が管理し、お金のやり取りは禁止されています。
// 格: 山 / seed 4170
// どこ: 協会の金庫室。紫の幕・板の壁。右に105枚が入る大きな棚 (15列×7段) の扉が開いている
// 演出: 左の机の札束の山に「禁止」の大札がドンと落ち、札束は煙になって消える。机の端に並んだ木札が1枚ずつ飛んで棚の空きに納まる。親方が棚を指して見守る
// 動き: f5〜11 大札が落下・f11〜20 揺れと砂ぼこり・f13〜24 札束が消える・f14〜42 木札8枚が順に飛ぶ・カメラが右へパン
const Nm170: React.FC<{ f: number }> = ({ f }) => {
  const drop = seg(f, 5, 11);
  const hit = seg(f, 11, 20);
  const shake = Math.sin(hit * Math.PI * 5) * (1 - hit) * 12;
  const vanish = seg(f, 13, 24);
  const camX = lerp(30, -36, easeInOut(seg(f, 0, 42)));
  // 棚
  const sx0 = 1000, sy0 = 170, sw = 820, sh = 610, cols = 15, rows = 7;
  const cw = (sw - 48) / cols, ch = (sh - 40) / rows;
  const cell = (k: number): [number, number] => [sx0 + 24 + cw * ((k % cols) + 0.5), sy0 + 20 + ch * (Math.floor(k / cols) + 0.5)];
  const empties = [9, 23, 31, 47, 52, 66, 78, 94];
  const flyT = (k: number) => seg(f, 14 + k * 3, 21 + k * 3);
  return (
    <Frame f={f} seed={4170}>
      <g transform={cam(1.03, camX, 0)}>
        {/* 板の壁 */}
        <rect x={-80} y={-40} width={W + 160} height={880} fill={C.wood} />
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1={-60 + i * 96} y1={0} x2={-60 + i * 96} y2={840} stroke={C.woodDeep} strokeWidth={5} opacity={0.6} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${-30 + i * 150} ${200 + rnd(170, i) * 400} q 20 30 0 60`} stroke={C.woodLight} strokeWidth={3} fill="none" opacity={0.5} />
        ))}
        {/* 床 */}
        <rect x={-80} y={800} width={W + 160} height={320} fill={C.plank} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={-80} y1={830 + i * 50} x2={W + 80} y2={830 + i * 50} stroke={C.woodLight} strokeWidth={4} />
        ))}
        <rect x={-80} y={796} width={W + 160} height={12} fill={C.woodDeep} />
        {/* 紫の幕 */}
        <path d={`M -80 -40 L ${W + 80} -40 L ${W + 80} 70 ${Array.from({ length: 14 }, (_, i) => `Q ${W + 80 - (i + 0.5) * 150} 130 ${W + 80 - (i + 1) * 150} 70`).join(" ")} Z`}
          fill={C.maku} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-80} y={-40} width={W + 160} height={40} fill={C.makuDark} />
        {[150, 960, 1770].map((tx) => (
          <g key={tx}>
            <line x1={tx} y1={70} x2={tx} y2={150} stroke={KRP.white} strokeWidth={6} />
            <path d={`M ${tx - 16} 150 L ${tx + 16} 150 L ${tx + 10} 196 L ${tx - 10} 196 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 大きな棚 (金庫) */}
        <rect x={sx0 + 14} y={sy0 + 14} width={sw} height={sh} rx={10} fill={KRP.ink} opacity={0.25} />
        <rect x={sx0 - 20} y={sy0 - 50} width={sw + 40} height={56} rx={8} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        <TagPlate x={sx0 + sw / 2} y={sy0 - 22} text="相撲協会" size={36} t={seg(f, 4, 12)} />
        <rect x={sx0} y={sy0} width={sw} height={sh} rx={10} fill={C.lacquer} stroke={KRP.ink} strokeWidth={8} />
        <rect x={sx0 + 16} y={sy0 + 14} width={sw - 32} height={sh - 28} fill={C.woodDeep} />
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line key={`c${i}`} x1={sx0 + 24 + cw * i} y1={sy0 + 20} x2={sx0 + 24 + cw * i} y2={sy0 + sh - 20} stroke={C.lacquer} strokeWidth={5} />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line key={`r${i}`} x1={sx0 + 24} y1={sy0 + 20 + ch * i} x2={sx0 + sw - 24} y2={sy0 + 20 + ch * i} stroke={C.woodLight} strokeWidth={6} />
        ))}
        {Array.from({ length: 105 }, (_, k) => {
          if (empties.includes(k)) return null;
          const [cx, cy] = cell(k);
          return <NH1bMeiseki key={k} x={cx} y={cy + 4} s={0.21} />;
        })}
        {/* 開いた扉 (左) */}
        <polygon points={`${sx0 - 4},${sy0 - 4} ${sx0 - 90},${sy0 + 40} ${sx0 - 90},${sy0 + sh - 40} ${sx0 - 4},${sy0 + sh + 4}`}
          fill={C.iron} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <circle cx={sx0 - 48} cy={sy0 + sh / 2} r={26} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
        {[0.15, 0.85].map((q) => <rect key={q} x={sx0 - 12} y={sy0 + sh * q - 20} width={24} height={40} rx={4} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 空きの棚の光 (納まる場所) */}
        {empties.map((k, i) => {
          const [cx, cy] = cell(k);
          const done = flyT(i) >= 1;
          return <rect key={k} x={cx - cw / 2 + 4} y={cy - ch / 2 + 4} width={cw - 8} height={ch - 8} fill={NP.glow} opacity={done ? 0.15 : 0.3 + 0.2 * Math.sin(f / 4 + i)} />;
        })}
        {/* 左の机 */}
        <rect x={140} y={600} width={740} height={34} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        {[180, 820].map((lx) => <rect key={lx} x={lx} y={630} width={32} height={176} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 札束の山 (消える) */}
        <NH1bPile x={340} y={602} s={0.9} o={1 - vanish} />
        {vanish > 0 && vanish < 1 && (
          <g opacity={(1 - vanish) * 0.9}>
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={340 + (i - 3) * 60 * (0.6 + vanish)} cy={520 - vanish * 80 - (i % 2) * 40} r={30 + vanish * 40}
                fill={KRP.gray} stroke={KRP.grayDark} strokeWidth={4} />
            ))}
          </g>
        )}
        {/* 木札の待ち台 */}
        <rect x={570} y={578} width={280} height={24} rx={6} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
        {empties.map((k, i) => {
          const t = easeInOut(flyT(i));
          const ox = 596 + i * 33, oy = 578 - 52;
          const [tx, ty] = cell(k);
          const qx = (ox + tx) / 2, qy = Math.min(oy, ty) - 220;
          const px = (1 - t) * (1 - t) * ox + 2 * (1 - t) * t * qx + t * t * tx;
          const py = (1 - t) * (1 - t) * oy + 2 * (1 - t) * t * qy + t * t * ty;
          return (
            <g key={k}>
              {t > 0 && t < 1 && <circle cx={px} cy={py} r={34} fill={NP.glow} opacity={0.45} />}
              <NH1bMeiseki x={px} y={py + 4 * t} s={lerp(0.34, 0.21, t)} rot={Math.sin(t * Math.PI) * -24} glow={t > 0 && t < 1 ? 0.8 : 0} />
            </g>
          );
        })}
        {/* 禁止の大札 */}
        <g transform={`translate(${340} ${lerp(-560, 0, easeIn(drop)) + shake * 0.4}) rotate(${shake * 0.3} 340 600)`}>
          <rect x={150} y={330} width={380} height={250} rx={16} fill={KRP.ink} opacity={0.2} transform="translate(10 10)" />
          <rect x={150} y={330} width={380} height={250} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          <rect x={166} y={346} width={348} height={218} rx={10} fill="none" stroke={C.kinshi} strokeWidth={10} />
          <text x={340} y={500} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={136} fill={C.kinshi}>禁止</text>
          <rect x={220} y={580} width={24} height={22} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
          <rect x={436} y={580} width={24} height={22} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ドンの砂ぼこりと衝撃線 */}
        {hit > 0 && hit < 1 && (
          <g opacity={1 - hit} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
            {[-1, 1].map((sd) => (
              <g key={sd}>
                <line x1={340 + sd * 210} y1={560} x2={340 + sd * (250 + hit * 60)} y2={540 - hit * 20} />
                <line x1={340 + sd * 210} y1={590} x2={340 + sd * (260 + hit * 70)} y2={596} />
                <line x1={340 + sd * 200} y1={380} x2={340 + sd * (240 + hit * 50)} y2={350 - hit * 20} />
              </g>
            ))}
          </g>
        )}
        {/* 親方 (棚を指して見守る) */}
        <Person x={905} y={852} s={0.95} f={f} phase={2} cloth={C.oyakata} clothDark={C.oyakataDark}
          pose="point" pointDir={1} face={f < 26 ? "surprised" : "smile"} gaze={f < 20 ? [-8, 0] : [8, -6]} lean={f < 20 ? -4 : 4} />
      </g>
      <TagPlate x={240} y={226} text="2014年" size={54} t={seg(f, 2, 10)} rot={-3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #171 名前が、個人の財産から、みんなの預かりものに変わったのです。
// 格: 並 / seed 4171
// どこ: 左半分は個人の家 (障子・畳)、柱をはさんで右半分は協会の広間 (板壁・紫の幕)
// 演出: 個人の小さな鉄の金庫から木札が浮き、点線の弧を描いて協会の大きな棚の光る空きへ。納まると親方3人がそろって礼をする (横から・後頭部)
// 動き: f6〜30 木札が飛ぶ (点線が伸びる)・f30〜38 棚が光る・f28〜40 親方が礼・カメラが右へパン
const Nm171: React.FC<{ f: number }> = ({ f }) => {
  const t = easeInOut(seg(f, 6, 30));
  const P0: [number, number] = [380, 600], P1: [number, number] = [900, 40];
  const sx0 = 1300, sy0 = 150, sw = 520, sh = 620, cols = 9, rows = 6;
  const cw = (sw - 40) / cols, ch = (sh - 40) / rows;
  const tk = 13;
  const cell = (k: number): [number, number] => [sx0 + 20 + cw * ((k % cols) + 0.5), sy0 + 20 + ch * (Math.floor(k / cols) + 0.5)];
  const P2 = cell(tk);
  const bez = (q: number): [number, number] => [
    (1 - q) * (1 - q) * P0[0] + 2 * (1 - q) * q * P1[0] + q * q * P2[0],
    (1 - q) * (1 - q) * P0[1] + 2 * (1 - q) * q * P1[1] + q * q * P2[1],
  ];
  const [fx, fy] = bez(t);
  const arrive = seg(f, 30, 38);
  const bow = 30 * easeInOut(seg(f, 28, 38)) + (f > 38 ? Math.sin((f - 38) / 6) * 1.5 : 0);
  const camX = lerp(40, -40, easeInOut(seg(f, 2, 40)));
  return (
    <Frame f={f} seed={4171}>
      <g transform={cam(1.02, camX, 0)}>
        {/* 左: 個人の家 */}
        <rect x={-80} y={-40} width={1000} height={820} fill={C.wall} />
        {[0, 1, 2].map((p) => (
          <g key={p}>
            <rect x={-20 + p * 200} y={80} width={200} height={520} fill={C.shoji} stroke={C.shojiFrame} strokeWidth={9} />
            {[1, 2].map((c) => <line key={c} x1={-20 + p * 200 + c * 66} y1={80} x2={-20 + p * 200 + c * 66} y2={600} stroke={C.shojiFrame} strokeWidth={4} />)}
            {[1, 2, 3, 4, 5, 6].map((r) => <line key={r} x1={-20 + p * 200} y1={80 + r * 74} x2={180 + p * 200} y2={80 + r * 74} stroke={C.shojiFrame} strokeWidth={4} />)}
          </g>
        ))}
        <rect x={-80} y={50} width={1000} height={30} fill={C.wood} />
        <rect x={-80} y={600} width={1000} height={520} fill={C.tatami} />
        <rect x={-80} y={600} width={1000} height={12} fill={C.woodDeep} />
        <rect x={-80} y={790} width={1000} height={14} fill={C.heri} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-80} y1={620 + i * 16} x2={920} y2={620 + i * 16} stroke={C.tatamiDark} strokeWidth={2} opacity={0.4} />)}
        {/* 右: 協会の広間 */}
        <rect x={920} y={-40} width={1100} height={840} fill={C.wood} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={940 + i * 96} y1={0} x2={940 + i * 96} y2={800} stroke={C.woodDeep} strokeWidth={5} opacity={0.6} />)}
        <path d={`M 920 -40 L 2020 -40 L 2020 60 ${Array.from({ length: 7 }, (_, i) => `Q ${2020 - (i + 0.5) * 157} 112 ${2020 - (i + 1) * 157} 60`).join(" ")} Z`}
          fill={C.maku} stroke={KRP.ink} strokeWidth={6} />
        <rect x={920} y={800} width={1100} height={320} fill={C.plank} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={920} y1={830 + i * 50} x2={2020} y2={830 + i * 50} stroke={C.woodLight} strokeWidth={4} />)}
        {/* 境の柱 */}
        <rect x={896} y={-40} width={48} height={1160} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        {/* 個人の小さな金庫 (扉が開いている) */}
        <ellipse cx={385} cy={774} rx={170} ry={16} fill={KRP.ink} opacity={0.22} />
        <rect x={240} y={470} width={290} height={300} rx={18} fill={C.iron} stroke={KRP.ink} strokeWidth={8} />
        <rect x={264} y={494} width={242} height={252} rx={10} fill={C.lacquer} />
        <rect x={264} y={640} width={242} height={12} fill={C.ironLight} />
        <rect x={290} y={660} width={80} height={70} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="240,474 160,510 160,740 240,768" fill={C.ironLight} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <circle cx={198} cy={620} r={24} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
        <line x1={198} y1={620} x2={198} y2={600} stroke={KRP.ink} strokeWidth={4} />
        {[260, 510].map((lx) => <rect key={lx} x={lx - 14} y={766} width={28} height={14} fill={KRP.ink} />)}
        {/* 協会の大きな棚 */}
        <rect x={sx0 - 16} y={sy0 - 46} width={sw + 32} height={50} rx={8} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        <rect x={sx0} y={sy0} width={sw} height={sh} rx={10} fill={C.lacquer} stroke={KRP.ink} strokeWidth={8} />
        <rect x={sx0 + 14} y={sy0 + 14} width={sw - 28} height={sh - 28} fill={C.woodDeep} />
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line key={i} x1={sx0 + 20} y1={sy0 + 20 + ch * i} x2={sx0 + sw - 20} y2={sy0 + 20 + ch * i} stroke={C.woodLight} strokeWidth={6} />
        ))}
        {Array.from({ length: cols * rows }, (_, k) => {
          if (k === tk) return null;
          const [cx, cy] = cell(k);
          return <NH1bMeiseki key={k} x={cx} y={cy + 4} s={0.24} />;
        })}
        <rect x={P2[0] - cw / 2 + 3} y={P2[1] - ch / 2 + 3} width={cw - 6} height={ch - 6}
          fill={NP.glow} opacity={0.3 + 0.25 * Math.sin(f / 4) + arrive * 0.3} />
        {arrive > 0 && arrive < 1 && (
          <circle cx={P2[0]} cy={P2[1]} r={40 + arrive * 120} fill="none" stroke={NP.glow} strokeWidth={10} opacity={1 - arrive} />
        )}
        {/* 点線の弧 */}
        {Array.from({ length: 34 }, (_, i) => {
          const q = i / 33;
          if (q > t) return null;
          const [dx, dy] = bez(q);
          return <circle key={i} cx={dx} cy={dy} r={6} fill={NP.shinyoDark} opacity={0.75} />;
        })}
        {/* 飛ぶ木札 */}
        {t > 0 && t < 1 && <circle cx={fx} cy={fy} r={70 * lerp(1, 0.5, t)} fill={NP.glow} opacity={0.45} />}
        <NH1bMeiseki x={fx} y={fy + 4 * t} s={lerp(0.5, 0.24, t)} rot={Math.sin(t * Math.PI) * -28} glow={t > 0 && t < 1 ? 0.8 : 0} />
        {/* 親方3人の礼 */}
        {[0, 1, 2].map((i) => (
          <NH1bBowOyakata key={i} id={`nh1b171o${i}`} x={1000 + i * 120} y={862 - i * 6} s={0.8} bow={bow} f={f} phase={i} />
        ))}
      </g>
      <TagPlate x={420} y={410} text="個人" size={44} t={seg(f, 1, 9)} rot={-3} />
      <TagPlate x={1520} y={80} text="協会" size={44} t={seg(f, 4, 12)} rot={2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #172 名前の値打ちは、お金で数えることもできます。
// 格: 図 / seed 4172
// どこ: からくり工房の作業台。穴あき板の壁に工具・設計図・電気スタンド
// 演出: 真鍮の「名前の値打ち計量器」に、字のない会社の看板がドスンと乗る。台が沈み、数字のドラム6つが回り出す
// 動き: f2〜12 看板が落ちる・f11〜20 衝撃の輪・f14〜 ドラムと歯車が回り続ける・ランプが点滅
const Nm172: React.FC<{ f: number }> = ({ f }) => {
  const d = seg(f, 2, 12);
  const land = seg(f, 11, 16);
  const ring = seg(f, 11, 21);
  const sink = 16 * easeOut(land);
  const run = Math.max(0, f - 14);
  const speeds = [0.03, 0.09, 0.22, 0.45, 0.85, 1.4];
  const drums = speeds.map((sp) => run * sp);
  const blur = speeds.map((sp) => (run > 0 ? clamp01(sp - 0.3) : 0));
  const squash = land > 0 && land < 1 ? Math.sin(land * Math.PI) : 0;
  return (
    <Frame f={f} seed={4172}>
      {/* 穴あき板の壁 */}
      <rect x={-20} y={-20} width={W + 40} height={860} fill={C.peg} />
      {Array.from({ length: 13 }, (_, r) =>
        Array.from({ length: 30 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={30 + c * 64} cy={30 + r * 64} r={5} fill={C.pegHole} opacity={0.55} />
        )),
      )}
      {/* 設計図 */}
      <g transform="rotate(-3 250 210)">
        <rect x={70} y={70} width={340} height={260} fill={C.blueprint} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.white} strokeWidth={3} fill="none" opacity={0.85}>
          <rect x={150} y={110} width={180} height={50} />
          <line x1={240} y1={160} x2={240} y2={250} />
          <rect x={130} y={250} width={220} height={20} />
          <circle cx={120} cy={140} r={24} />
          <path d="M 110 300 L 370 300 M 110 292 L 110 308 M 370 292 L 370 308" />
        </g>
        <circle cx={90} cy={88} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={392} cy={88} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 壁の工具 */}
      <g transform={`rotate(${Math.sin(f / 14) * 2} 1660 120)`}>
        <line x1={1660} y1={110} x2={1660} y2={130} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1646} y={130} width={28} height={190} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1630 320 a 30 30 0 1 0 60 0 l -14 0 l 0 22 l -32 0 l 0 -22 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <rect x={1760} y={130} width={30} height={160} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1730} y={110} width={90} height={44} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <NH1bGear cx={1560} cy={420} r={44} n={8} ang={f * 0.5} fill={KRP.gray} />
      <NH1bGear cx={330} cy={470} r={36} n={7} ang={-f * 0.6} fill={KRP.gray} />
      {/* 電気スタンドの光 */}
      <polygon points="1560,60 1180,830 1880,830" fill={NP.glowCore} opacity={0.18} />
      <path d="M 1880 -20 L 1700 40 L 1600 40" stroke={KRP.ink} strokeWidth={10} fill="none" />
      <path d="M 1520 70 L 1600 20 L 1640 90 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 作業台 */}
      <rect x={-20} y={828} width={W + 40} height={280} fill={C.wood} />
      <rect x={-20} y={820} width={W + 40} height={26} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 4 }, (_, i) => (
        <path key={i} d={`M -20 ${880 + i * 50} q 480 ${rnd(172, i) * 30 - 15} 980 0 q 480 ${rnd(173, i) * 30 - 15} 980 0`} stroke={C.woodDeep} strokeWidth={4} fill="none" opacity={0.5} />
      ))}
      {/* 計量器 */}
      <NH1bScale x={960} py={600} f={f} sink={sink} drums={drums} blur={blur} spin={run * 9} id="nh1b172" running={run > 0}>
        <g transform={`translate(0 ${-(1 - easeIn(d)) * 620}) scale(${1 + squash * 0.06} ${1 - squash * 0.06})`}>
          {/* 字のない会社の看板 */}
          <rect x={-170} y={-40} width={24} height={40} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
          <rect x={146} y={-40} width={24} height={40} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-226} y={-232} width={452} height={196} rx={14} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-206} y={-214} width={412} height={160} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
          <polygon points="-246,-232 246,-232 220,-262 -220,-262" fill={C.velvet} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={-110} cy={-134} r={52} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="-140,-110 -110,-170 -80,-110" fill={KRP.white} />
          <rect x={-30} y={-160} width={190} height={22} rx={11} fill={KRP.gray} />
          <rect x={-30} y={-120} width={140} height={22} rx={11} fill={KRP.gray} />
        </g>
      </NH1bScale>
      {/* 着地の衝撃 */}
      {ring > 0 && ring < 1 && (
        <g opacity={1 - ring} fill="none" stroke={KRP.ink} strokeWidth={6}>
          <ellipse cx={960} cy={612} rx={400 + ring * 160} ry={30 + ring * 20} />
          {[-1, 1].map((sd) => (
            <g key={sd} strokeLinecap="round">
              <line x1={960 + sd * 420} y1={560} x2={960 + sd * (470 + ring * 50)} y2={520 - ring * 20} />
              <line x1={960 + sd * 430} y1={600} x2={960 + sd * (500 + ring * 50)} y2={596} />
            </g>
          ))}
        </g>
      )}
      <TagPlate x={1110} y={720} text="名前の値打ち" size={34} t={seg(f, 4, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #173 ある会社の推計では、アップルという名前の値打ちは、およそ4700億ドルです。
// 格: 山 / seed 4173
// どこ: 発表の舞台 (深緑の幕・スポットライト・つやのある床) に、#172 と同じ計量器
// 演出: 本物の赤いリンゴ (果物) が台にぽとんと乗る。ドラムが回って 4・7・0・0 で止まり、両わきにドル札の山がぐんぐん積み上がる。手前の人がのけぞって驚く
// 動き: f2〜10 リンゴが落ちて弾む・f8〜40 ドラムが左から順に止まる・f6〜40 札の山が伸びる・f34〜42 金額の札・カメラが寄りから引く
const Nm173: React.FC<{ f: number }> = ({ f }) => {
  const d = seg(f, 2, 10);
  const land = seg(f, 9, 15);
  const squash = land > 0 && land < 1 ? Math.sin(land * Math.PI) : 0;
  const finals = [4, 7, 0, 0];
  const tt = finals.map((_, i) => seg(f, 8, 28 + i * 4));
  const drums = finals.map((v, i) => v + 10 * (3 + i) * (1 - easeOut(tt[i])));
  const blur = tt.map((q) => (q > 0 && q < 0.85 ? 0.9 : 0));
  const stopped = tt[3] >= 1;
  const z = lerp(1.16, 1.0, easeInOut(seg(f, 4, 36)));
  const grow = (k: number, mx: number) => mx * easeOut(seg(f, 6 + k * 3, 32 + k * 2));
  const wow = f >= 30;
  return (
    <Frame f={f} seed={4173}>
      <g transform={cam(z, 0, 0, 960, 380)}>
        {/* 深緑の幕 */}
        <rect x={-80} y={-60} width={W + 160} height={900} fill={C.curtainG} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${-60 + i * 130} -60 q ${20 + Math.sin(f / 18 + i) * 6} 450 0 900`} stroke={C.curtainGDark} strokeWidth={22} fill="none" opacity={0.7} />
        ))}
        <path d={`M -80 -60 L ${W + 80} -60 L ${W + 80} 40 ${Array.from({ length: 10 }, (_, i) => `Q ${W + 80 - (i + 0.5) * 208} 110 ${W + 80 - (i + 1) * 208} 40`).join(" ")} Z`}
          fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
        {/* スポットライト */}
        <polygon points="760,-40 1160,-40 1480,840 440,840" fill={NP.glowCore} opacity={0.16} />
        {/* つやのある床 */}
        <rect x={-80} y={830} width={W + 160} height={300} fill={C.woodDeep} />
        <rect x={-80} y={826} width={W + 160} height={14} fill={C.lacquer} />
        <ellipse cx={960} cy={900} rx={520} ry={40} fill={NP.glowCore} opacity={0.15} />
        {/* ドル札の山 (うしろ) */}
        <NH1bDollars x={150} y={836} n={grow(0, 11)} />
        <NH1bDollars x={350} y={836} n={grow(1, 9)} />
        <NH1bDollars x={1570} y={836} n={grow(2, 10)} />
        <NH1bDollars x={1770} y={836} n={grow(3, 11)} />
        {/* 計量器とリンゴ */}
        <NH1bScale x={960} py={610} f={f} sink={16 * easeOut(land)} drums={drums} blur={blur}
          spin={stopped ? 0 : f * 9} id="nh1b173" running={!stopped && f > 8}>
          <NH1bApple x={0} y={-(1 - easeIn(d)) * 640 - (land > 0 && land < 1 ? Math.sin(land * Math.PI) * 30 : 0)} s={1.0} squash={squash} />
        </NH1bScale>
        {/* 止まったときの光 */}
        {stopped && (
          <g>
            <NH1bStar x={640} y={110} r={18 + 8 * Math.sin(f / 3)} />
            <NH1bStar x={1280} y={120} r={18 + 8 * Math.cos(f / 3)} />
          </g>
        )}
      </g>
      {/* 手前の人 (驚く) */}
      <Person x={260} y={918} s={1.05} f={f} phase={3} cloth={C.narrator} clothDark={C.narratorDark}
        face={wow ? "surprised" : "normal"} gaze={[9, -9]} lean={wow ? -7 : 0} pose={wow ? "raise" : "stand"} />
      {wow && (
        <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
          <line x1={360} y1={600} x2={400} y2={570} />
          <line x1={372} y1={640} x2={420} y2={632} />
          <line x1={340} y1={566} x2={360} y2={526} />
        </g>
      )}
      <TagPlate x={960} y={336} text="約4700億ドル" size={50} t={seg(f, 34, 42)} />
      <TagPlate x={1720} y={110} text="推計" size={36} t={seg(f, 2, 10)} rot={3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #174 すると、新しい問題が起きます。
// 格: 並 / seed 4174
// どこ: 夜の展示室。スポットライトの下、ビロードの台座に金色の名前の札
// 演出: 光る札に、左からスーツの手、右から金の舞台衣装の手がにゅっとのびてくる。札は目をきょろきょろさせ、冷や汗。上に小さな雷
// 動き: f6〜30 手がのびる・指がにぎにぎ・目が左右に動く・f26〜 雷が点滅・札が小さく震える
const Nm174: React.FC<{ f: number }> = ({ f }) => {
  const reach = easeOut(seg(f, 6, 30));
  const lx = lerp(-120, 600, reach);
  const rx = lerp(W + 120, 1320, reach);
  const look = Math.floor(f / 7) % 2 === 0 ? -1 : 1;
  const gaze = f < 8 ? 0 : look * clamp01(((f % 7) + 1) / 3);
  const jitter = f > 26 ? Math.sin(f * 2.1) * 3 : 0;
  const bolt = f > 26 && f % 8 < 5;
  return (
    <Frame f={f} seed={4174} bg={C.nightDeep} dark>
      <rect x={-20} y={-20} width={W + 40} height={880} fill={C.night} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 200 + 40} y={-20} width={120} height={860} fill={C.nightDeep} opacity={0.35} />
      ))}
      <rect x={-20} y={840} width={W + 40} height={260} fill={C.nightDeep} />
      <polygon points="800,-30 1120,-30 1400,860 520,860" fill={NP.glowCore} opacity={0.13} />
      <ellipse cx={960} cy={860} rx={460} ry={34} fill={NP.glowCore} opacity={0.18} />
      {/* 展示のロープ */}
      {[260, 1660].map((px) => (
        <g key={px}>
          <rect x={px - 10} y={640} width={20} height={200} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={px} cy={634} r={18} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={px} cy={842} rx={46} ry={12} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      <path d={`M 260 650 Q 610 ${740 + Math.sin(f / 12) * 6} 760 690`} stroke={C.velvet} strokeWidth={14} fill="none" />
      <path d={`M 1660 650 Q 1310 ${740 + Math.cos(f / 12) * 6} 1160 690`} stroke={C.velvet} strokeWidth={14} fill="none" />
      {/* 台座 */}
      <rect x={760} y={660} width={400} height={190} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
      <rect x={740} y={640} width={440} height={30} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 720 650 Q 960 560 1200 650 Q 960 690 720 650 Z" fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
      {[740, 1180].map((tx) => <path key={tx} d={`M ${tx} 650 l -10 40 l 20 0 Z`} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />)}
      {/* 金の札 */}
      <NH1bKinFuda x={960 + jitter} y={452} s={0.95} glow={0.8 + Math.sin(f / 5) * 0.2} eyes gaze={gaze} f={f} rot={jitter * 0.5} />
      {f > 22 && (
        <path d={`M 1238 ${330 + ((f - 22) % 20) * 2} q -14 22 0 30 q 14 -8 0 -30 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
      )}
      {/* 左右の手 */}
      <NH1bHand side={1} tipX={lx} y={490} sleeve={C.suit} sleeveDark={C.suitDark} curl={Math.sin(f / 4) * 14} />
      <NH1bHand side={-1} tipX={rx} y={420} sleeve={C.gold} sleeveDark={C.goldDark} curl={Math.cos(f / 4) * 14} sparkle />
      {/* 雷の記号 */}
      {bolt && [[700, 190, -12], [1220, 170, 10]].map(([bx, by, r], i) => (
        <path key={i} transform={`rotate(${r} ${bx} ${by})`}
          d={`M ${bx} ${by - 60} L ${bx - 28} ${by + 4} L ${bx - 4} ${by + 4} L ${bx - 18} ${by + 62} L ${bx + 30} ${by - 12} L ${bx + 6} ${by - 12} L ${bx + 18} ${by - 60} Z`}
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #175 その名前は、いったい誰のものなのか。
// 格: 山 / seed 4175
// どこ: 左は舞台 (赤い幕・スポットライト)、右は事務所 (ブラインドの窓・書類棚・観葉植物)。真ん中に大きな天秤
// 演出: 支点の下に金の名前の札が吊るされ、左の皿に本人 (金の衣装・マイク)、右の皿に事務所の人 (スーツ・書類)。2人とも札を指す。天秤はつり合ったまま揺れ、上に？
// 動き: 天秤が左右にゆっくり揺れ続ける・札が振り子・？が上下・カメラが少し寄る
const Nm175: React.FC<{ f: number }> = ({ f }) => {
  const ang = Math.sin(f / 9) * 3.5;
  const z = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4175}>
      <g transform={cam(z, 0, 0, 960, 420)}>
        {/* 左: 舞台 */}
        <rect x={-80} y={-40} width={1040} height={900} fill={C.velvetDark} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${-40 + i * 120} -40 q ${18 + Math.sin(f / 16 + i) * 5} 440 0 880`} stroke={C.velvet} strokeWidth={46} fill="none" />
        ))}
        <polygon points="420,-40 560,-40 760,860 220,860" fill={NP.glowCore} opacity={0.16} />
        {[180, 470, 760].map((lx) => (
          <g key={lx}>
            <rect x={lx - 34} y={-10} width={68} height={46} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={lx} cy={44} r={18} fill={NP.glowCore} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <rect x={-80} y={860} width={1040} height={260} fill={C.plank} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-80 + i * 190} y1={860} x2={-80 + i * 190} y2={1100} stroke={C.woodLight} strokeWidth={4} />)}
        {/* 右: 事務所 */}
        <rect x={960} y={-40} width={1040} height={900} fill={C.office} />
        <rect x={1260} y={110} width={520} height={400} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={1266} y={118 + i * 32} width={508} height={20} fill={KRP.white} stroke={C.officeDark} strokeWidth={2} />
        ))}
        <line x1={1752} y1={110} x2={1752} y2={460} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1700} y={580} width={190} height={280} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line x1={1700} y1={580 + (i + 1) * 93} x2={1890} y2={580 + (i + 1) * 93} stroke={KRP.ink} strokeWidth={4} />
            <rect x={1770} y={612 + i * 93} width={50} height={14} rx={6} fill={KRP.grayDark} />
          </g>
        ))}
        <path d="M 1200 760 L 1180 860 L 1300 860 L 1280 760 Z" fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${Math.sin(f / 15) * 2} 1240 760)`}>
          {[-50, -20, 10, 40].map((a, i) => (
            <path key={i} d={`M 1240 760 Q ${1240 + a * 2} ${640 - i * 10} ${1240 + a * 3} 600`} stroke={C.leaf} strokeWidth={22} fill="none" strokeLinecap="round" />
          ))}
        </g>
        <rect x={960} y={860} width={1040} height={260} fill={C.carpetGray} />
        <rect x={944} y={-40} width={32} height={1160} fill={KRP.ink} opacity={0.5} />
        {/* 天秤 */}
        <NH1bBalance x={960} y={230} baseY={884} ang={ang} arm={470} hang={290} panW={300}
          center={
            <g transform={`rotate(${-ang * 1.6} 960 236)`}>
              <line x1={960} y1={236} x2={960} y2={350} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={960} cy={350} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
              <NH1bKinFuda x={960} y={414} s={0.52} glow={0.7} f={f} />
            </g>
          }
          left={
            <g>
              <Person x={0} y={0} s={0.78} f={f} phase={1} cloth={C.gold} clothDark={C.goldDark} pose="point" pointDir={1} face="normal" gaze={[7, -6]} />
              {/* マイク */}
              <g transform="translate(-52 -52) rotate(-18)">
                <rect x={-7} y={-6} width={14} height={50} rx={6} fill={KRP.ink} />
                <circle cx={0} cy={-16} r={15} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
                <path d="M -10 -20 L 10 -20 M -10 -12 L 10 -12" stroke={KRP.grayDark} strokeWidth={2.5} />
              </g>
            </g>
          }
          right={
            <g>
              <Person x={0} y={0} s={0.78} f={f} phase={4} cloth={C.suit} clothDark={C.suitDark} pose="point" pointDir={-1} face="normal" gaze={[-7, -6]} glasses />
              {/* 書類ばさみ */}
              <g transform="translate(52 -58) rotate(10)">
                <rect x={-18} y={-30} width={40} height={54} rx={4} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
                <rect x={-12} y={-24} width={28} height={6} fill={KRP.white} />
              </g>
            </g>
          }
        />
        <QMark x={960} y={150} s={0.95} f={f} t={seg(f, 8, 18)} />
      </g>
      <TagPlate x={486} y={690} text="本人" size={40} t={seg(f, 4, 12)} rot={-2} />
      <TagPlate x={1434} y={690} text="事務所" size={40} t={seg(f, 6, 14)} rot={2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #176 2012年、最高裁は、有名人の名前や顔には、お客さんを呼ぶ力があると認めました。
// 格: 山 / seed 4176
// どこ: 最高裁の大法廷。高い天井の明かり取りから光、重厚な木の壁、正面の高い裁判官席に黒い法服の遠い人影 (顔なし) が15人
// 演出: 手前の台に金の名前の札。札から磁石のような光の輪と力の線が出て、左右のお客の人形たちがずるずる引き寄せられる
// 動き: f6〜40 お客が札へ寄る (前のめり)・光の輪が広がり続ける・カメラがゆっくり寄る
const Nm176: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeOut(seg(f, 6, 40));
  const z = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const guests: { sx: number; ex: number; c: string; ph: number; s: number }[] = [
    { sx: 60, ex: 420, c: KRP.orange, ph: 0, s: 0.86 },
    { sx: 200, ex: 560, c: KRP.blue, ph: 1, s: 0.8 },
    { sx: 330, ex: 690, c: KRP.green, ph: 2, s: 0.9 },
    { sx: 1860, ex: 1500, c: C.lilac, ph: 3, s: 0.86 },
    { sx: 1720, ex: 1360, c: KRP.red, ph: 4, s: 0.8 },
    { sx: 1590, ex: 1230, c: KRP.yellow, ph: 5, s: 0.9 },
  ];
  return (
    <Frame f={f} seed={4176}>
      <g transform={cam(z, 0, 0, 960, 500)}>
        {/* 木の壁 */}
        <rect x={-80} y={-60} width={W + 160} height={720} fill={C.wood} />
        {Array.from({ length: 20 }, (_, i) => (
          <g key={i}>
            <rect x={-60 + i * 110} y={120} width={84} height={520} rx={4} fill={C.woodDeep} opacity={0.35} />
            <line x1={-60 + i * 110 + 42} y1={130} x2={-60 + i * 110 + 42} y2={630} stroke={C.woodLight} strokeWidth={3} opacity={0.5} />
          </g>
        ))}
        {/* 高い天井と明かり取り */}
        <rect x={-80} y={-60} width={W + 160} height={150} fill={KRP.gray} />
        <path d="M 560 -60 L 1360 -60 L 1240 90 L 680 90 Z" fill={NP.glowCore} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={760 + i * 130} y1={-60} x2={730 + i * 155} y2={90} stroke={KRP.grayDark} strokeWidth={4} />)}
        <rect x={-80} y={86} width={W + 160} height={22} fill={C.woodDeep} />
        <polygon points="680,90 1240,90 1560,640 360,640" fill={NP.glowCore} opacity={0.18} />
        {/* 裁判官席: 椅子の背と、法服の人影 (顔は描かない) */}
        {Array.from({ length: 15 }, (_, i) => {
          const cx = 300 + i * 94.3;
          return (
            <g key={i}>
              <rect x={cx - 34} y={236} width={68} height={150} rx={30} fill={C.chair} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${cx - 36} 392 Q ${cx - 34} 330 ${cx} 326 Q ${cx + 34} 330 ${cx + 36} 392 Z`} fill={C.robe} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={cx} cy={306} r={21} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        <rect x={180} y={380} width={1560} height={110} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        <rect x={180} y={380} width={1560} height={18} fill={C.woodLight} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={210 + i * 127} y={410} width={100} height={62} rx={4} fill="none" stroke={C.lacquer} strokeWidth={4} />
        ))}
        <rect x={120} y={490} width={1680} height={70} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 床 (じゅうたん) と柵 */}
        <rect x={-80} y={560} width={W + 160} height={600} fill={C.carpet} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-80} y1={600 + i * 60} x2={W + 80} y2={600 + i * 60} stroke={C.carpetDark} strokeWidth={4} />)}
        <rect x={-80} y={620} width={W + 160} height={16} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={-60 + i * 88} y={636} width={14} height={58} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <rect x={-80} y={690} width={W + 160} height={14} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
        {/* 磁石の光の輪 */}
        {[0, 1, 2, 3].map((k) => {
          const q = ((f * 1.4 + k * 25) % 100) / 100;
          return (
            <ellipse key={k} cx={960} cy={560} rx={210 + q * 700} ry={110 + q * 260} fill="none" stroke={NP.glow} strokeWidth={10 * (1 - q) + 2} opacity={(1 - q) * 0.75} />
          );
        })}
        {/* 力の線 (お客へ) */}
        {guests.map((g, i) => {
          const gx = lerp(g.sx, g.ex, pull);
          const side = g.ex < 960 ? -1 : 1;
          return (
            <path key={i} d={`M ${960 + side * 190} 560 Q ${(960 + gx) / 2} ${470 - (i % 3) * 30} ${gx} ${700 - 90 * g.s}`}
              stroke={NP.shinyo} strokeWidth={6} fill="none" strokeDasharray="14 12" strokeDashoffset={-f * 3} opacity={0.85} />
          );
        })}
        {/* 札の台と金の札 */}
        <rect x={930} y={640} width={60} height={200} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <rect x={860} y={828} width={200} height={26} rx={6} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
        <NH1bKinFuda x={960} y={560} s={0.62} glow={0.85 + Math.sin(f / 4) * 0.15} f={f} />
        {/* お客の人形たち (札へ引き寄せられる) */}
        {guests.map((g, i) => {
          const gx = lerp(g.sx, g.ex, pull);
          const side = g.ex < 960 ? 1 : -1;
          const lean = side * (6 + 8 * pull) + Math.sin(f / 5 + i) * 2;
          return (
            <g key={i} transform={`rotate(${lean} ${gx} 830)`}>
              <ellipse cx={gx} cy={832} rx={50 * g.s} ry={10} fill={KRP.ink} opacity={0.2} />
              <PersonMini x={gx} y={830} s={g.s} color={g.c} f={f} phase={g.ph} face="smile" arms="up" />
              {pull > 0.1 && pull < 0.98 && (
                <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.6}>
                  <line x1={gx - side * 60} y1={760} x2={gx - side * 100} y2={760} />
                  <line x1={gx - side * 56} y1={790} x2={gx - side * 90} y2={790} />
                </g>
              )}
            </g>
          );
        })}
      </g>
      <TagPlate x={250} y={226} text="2012年" size={54} t={seg(f, 2, 10)} rot={-3} />
      <TagPlate x={1680} y={150} text="最高裁" size={50} t={seg(f, 4, 12)} rot={2} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_169: (f) => <Nm169 f={f} />,
  nm_170: (f) => <Nm170 f={f} />,
  nm_171: (f) => <Nm171 f={f} />,
  nm_172: (f) => <Nm172 f={f} />,
  nm_173: (f) => <Nm173 f={f} />,
  nm_174: (f) => <Nm174 f={f} />,
  nm_175: (f) => <Nm175 f={f} />,
  nm_176: (f) => <Nm176 f={f} />,
};

export const NM_H1B_MOTIFS: string[] = [
  "nm_169", // #169
  "nm_170", // #170
  "nm_171", // #171
  "nm_172", // #172
  "nm_173", // #173
  "nm_174", // #174
  "nm_175", // #175
  "nm_176", // #176
];

export const namaeH1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
