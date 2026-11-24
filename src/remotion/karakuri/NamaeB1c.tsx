// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#45〜#52 (8文)
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
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 工房の壁と作業台
  wall: "#C79A68", wallDark: "#9C7248", peg: "#D8B98C", pegHole: "#8E6A44",
  bench: "#C89A62", benchEdge: "#9C6F40", benchDark: "#7A5530", grain: "#B0824E",
  craft: "#DCC59C", craftDark: "#BFA676",
  // 置きかえの図
  giant: "#6C7A5A", giantDark: "#4E5A40", giantHair: "#7A5A3A", fur: "#B0946A",
  oni: "#B5452E", oniDark: "#8A3220", tiger: "#E8B33A", horn: "#F2E3B5",
  stone: "#B9B2A4", stoneDark: "#8E8778", roof: "#5E6670",
  bridge: "#B5763E", rail: "#C2452F", water: "#8FB8D8",
  nord: "#DCE6EC", japan: "#F3E3D2", pine: "#4F7A55", sakura: "#F0B8C4",
  // 地図
  map: "#EAD9B0", land: "#CDBB8A", landDark: "#A9935F", sea: "#BFD5DE", seaDark: "#93B4C2",
  book: "#B8434E", bookDark: "#8A2F38", bag: "#8C6A3F", bagDark: "#5E4527",
  // 砂時計
  sand: "#E3C27A", sandDark: "#C9A35A", glass: "#DCEBF0", scroll: "#E8D7A8", clay: "#C98A5A", clayDark: "#9E6238",
  grimm: "#6B4A7A",
  // エジプト
  sky: "#A9D2E8", sun: "#FFE7A0", sst: "#E0BE86", sstDark: "#BF9A62", sstLight: "#F0D7A6",
  glyph: "#8A6A3A", lapis: "#2F5FA0", priest: "#F4EFE2", priestDark: "#DED3BA",
  skin: "#F2D2B6", desert: "#EBCB8E", shadow: "#4A4038", rope: "#A07A48", cat: "#3F3A36",
  // 網・手・箱
  net: "#6E6A62", hoop: "#7A5530", sleeve: "#6F8FB0", sleeveDark: "#4F6C8C",
  box: "#B07A44", boxDark: "#7E5228", furo: "#7A4E7E", furoDark: "#56355A",
  brushTip: "#2E2620", fan: "#E8C46A", fanDark: "#B8923A", bulb: "#FFE58A",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend;
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

const SK = 4.5; // ふつうの線の太さ

// Person の体ゆれ (Person 内部と同じ式。上に描き足す飾りをずらさないため)
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// --- 北欧の巨人 (Person + もじゃもじゃ髪・ひげ・毛皮の襟) ---
const NB1cGiant: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const b = bobOf(f, 1);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={1} cloth={C.giant} clothDark={C.giantDark} hair="none" face="smile" pose="armsFolded" />
      <g transform={`translate(${x} ${y + b}) scale(${s})`}>
        {/* 毛皮の襟 */}
        <path d="M -62 -164 Q -30 -142 0 -150 Q 30 -142 62 -164 Q 40 -176 0 -172 Q -40 -176 -62 -164 Z" fill={C.fur} stroke={C.ink} strokeWidth={SK} />
        {/* 腰のベルト */}
        <rect x={-58} y={-74} width={116} height={14} fill={C.giantHair} stroke={C.ink} strokeWidth={4} />
        <rect x={-10} y={-77} width={20} height={20} rx={3} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
        {/* もじゃもじゃの髪 */}
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI * (1.05 + i * 0.112);
          return <circle key={i} cx={Math.cos(a) * 62} cy={-244 + Math.sin(a) * 58} r={24} fill={C.giantHair} stroke={C.ink} strokeWidth={4} />;
        })}
        {/* ひげ (口をおおう) */}
        <path d="M -52 -206 Q -60 -150 -26 -128 Q 0 -112 26 -128 Q 60 -150 52 -206 Q 30 -186 0 -190 Q -30 -186 -52 -206 Z" fill={C.giantHair} stroke={C.ink} strokeWidth={SK} />
        <path d="M -22 -168 q 6 14 0 26 M 0 -172 q 6 16 0 32 M 22 -168 q 6 14 0 26" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.5} />
      </g>
    </g>
  );
};

// --- 赤鬼 (Person + 角2本・虎柄の腰巻)。巨人と同じポーズ ---
const NB1cOni: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const b = bobOf(f, 2);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={2} cloth={C.oni} clothDark={C.oniDark} hair="cap" face="smile" pose="armsFolded" />
      <g transform={`translate(${x} ${y + b}) scale(${s})`}>
        {/* 角 */}
        {[-1, 1].map((d) => (
          <g key={d}>
            <path d={`M ${d * 10} -284 Q ${d * 8} -312 ${d * 30} -330 Q ${d * 32} -306 ${d * 40} -282 Z`} fill={C.horn} stroke={C.ink} strokeWidth={SK} strokeLinejoin="round" />
            <path d={`M ${d * 11} -296 Q ${d * 26} -300 ${d * 37} -294`} stroke={C.ink} strokeWidth={3} fill="none" />
          </g>
        ))}
        {/* ちぢれ髪 */}
        {[-44, -22, 0, 22, 44].map((cx, i) => (
          <circle key={i} cx={cx} cy={-280 + Math.abs(cx) * 0.25} r={12} fill={C.ink} stroke={C.ink} strokeWidth={2} />
        ))}
        {/* ほっぺ (愛嬌) */}
        {[-1, 1].map((d) => <ellipse key={d} cx={d * 40} cy={-196} rx={11} ry={7} fill={KRP.red} opacity={0.35} />)}
        {/* 虎柄の腰巻 */}
        <path d="M -60 -78 L 60 -78 L 64 -40 L 30 -46 L 0 -38 L -30 -46 L -64 -40 Z" fill={C.tiger} stroke={C.ink} strokeWidth={SK} strokeLinejoin="round" />
        {[-40, -14, 14, 40].map((sx) => (
          <path key={sx} d={`M ${sx - 6} -78 q 10 10 2 22`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
      </g>
    </g>
  );
};

// --- 石の教会 (x=中心, y=接地) ---
const NB1cChurch: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 本堂 */}
    <rect x={-120} y={-190} width={240} height={190} fill={C.stone} stroke={C.ink} strokeWidth={6} />
    <path d="M -136 -190 L 0 -280 L 136 -190 Z" fill={C.roof} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    {/* 石積み */}
    <g stroke={C.stoneDark} strokeWidth={3}>
      {[-150, -110, -70, -30].map((yy, i) => (
        <g key={yy}>
          <line x1={-120} y1={yy} x2={120} y2={yy} />
          {[-80, -20, 40, 100].map((xx) => <line key={xx} x1={xx + (i % 2) * 30} y1={yy} x2={xx + (i % 2) * 30} y2={yy + 40} />)}
        </g>
      ))}
    </g>
    {/* 鐘楼と尖塔 */}
    <rect x={-40} y={-330} width={80} height={140} fill={C.stone} stroke={C.ink} strokeWidth={6} />
    <path d="M -50 -330 L 0 -440 L 50 -330 Z" fill={C.roof} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -16 -300 L -16 -270 Q 0 -290 16 -270 L 16 -300 Q 0 -318 -16 -300 Z" fill={C.ink} opacity={0.75} />
    <line x1={0} y1={-440} x2={0} y2={-480} stroke={C.ink} strokeWidth={6} />
    <line x1={-14} y1={-466} x2={14} y2={-466} stroke={C.ink} strokeWidth={6} />
    {/* アーチの扉と窓 */}
    <path d="M -34 0 L -34 -70 Q 0 -110 34 -70 L 34 0 Z" fill={C.bagDark} stroke={C.ink} strokeWidth={5} />
    <line x1={0} y1={-90} x2={0} y2={0} stroke={C.ink} strokeWidth={3} />
    {[-84, 84].map((wx) => (
      <path key={wx} d={`M ${wx - 16} -110 L ${wx - 16} -150 Q ${wx} -170 ${wx + 16} -150 L ${wx + 16} -110 Z`} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} />
    ))}
  </g>
);

// --- 木の太鼓橋 (x=中心, y=水面) ---
const NB1cBridge: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-190} y={-6} width={380} height={30} rx={14} fill={C.water} stroke={C.ink} strokeWidth={4} />
    <path d="M -150 6 q 20 -6 40 0 M 60 12 q 20 -6 40 0" stroke={KRP.white} strokeWidth={4} fill="none" />
    {/* 橋脚 */}
    {[-110, -40, 40, 110].map((px) => (
      <rect key={px} x={px - 9} y={-80 + Math.abs(px) * 0.5} width={18} height={90 - Math.abs(px) * 0.5} fill={C.bridge} stroke={C.ink} strokeWidth={4} />
    ))}
    {/* 橋板 (弓なり) */}
    <path d="M -180 -10 Q 0 -150 180 -10 L 180 8 Q 0 -128 -180 8 Z" fill={C.bridge} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    {/* 朱の欄干 */}
    <path d="M -170 -50 Q 0 -190 170 -50" stroke={C.rail} strokeWidth={10} fill="none" />
    <path d="M -170 -50 Q 0 -190 170 -50" stroke={C.ink} strokeWidth={3} fill="none" />
    {[-140, -95, -48, 0, 48, 95, 140].map((px) => {
      const tr = (px + 170) / 340, td = (px + 180) / 360;
      const top = -50 - 280 * tr * (1 - tr);
      const deck = -10 - 280 * td * (1 - td);
      return <line key={px} x1={px} y1={deck} x2={px} y2={top} stroke={C.rail} strokeWidth={8} />;
    })}
    {/* 擬宝珠 */}
    {[-170, 170].map((px) => <circle key={px} cx={px} cy={-58} r={11} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />)}
  </g>
);

// --- 素焼きの人形 (ひもで縛られ、胸に読めない文字の帯)。x,y=底の中心 / 高さ約200*s ---
const NB1cFigurine: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {/* ひざまずいた体 */}
    <path d="M -48 0 Q -58 -60 -40 -120 Q -30 -150 0 -150 Q 30 -150 40 -120 Q 58 -60 48 0 Z" fill={C.clay} stroke={C.ink} strokeWidth={6} />
    {/* 後ろ手に縛られた腕 */}
    <path d="M -40 -118 Q -60 -90 -30 -70 M 40 -118 Q 60 -90 30 -70" stroke={C.clayDark} strokeWidth={10} fill="none" strokeLinecap="round" />
    {/* 頭 */}
    <ellipse cx={0} cy={-176} rx={32} ry={34} fill={C.clay} stroke={C.ink} strokeWidth={6} />
    <circle cx={-11} cy={-180} r={4} fill={C.ink} /><circle cx={11} cy={-180} r={4} fill={C.ink} />
    <path d="M -8 -162 L 8 -162" stroke={C.ink} strokeWidth={3} />
    {/* 胸の文字の帯 (読めない飾り) */}
    <rect x={-40} y={-110} width={80} height={34} rx={4} fill={C.scroll} stroke={C.ink} strokeWidth={4} />
    <g stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round">
      <path d="M -34 -93 q 4 -8 8 0 q 4 8 8 0" /><circle cx={-6} cy={-93} r={6} /><path d="M 6 -93 q 8 -10 16 0 q -8 10 -16 0" /><path d="M 30 -102 q -6 9 0 18" />
    </g>
    {/* ひも */}
    <g stroke={C.rope} strokeWidth={7} fill="none" strokeLinecap="round">
      <path d="M -50 -60 Q 0 -44 50 -60" /><path d="M -46 -30 Q 0 -14 46 -30" />
      <path d="M 30 -60 q 26 16 14 44" />
    </g>
    <g stroke={C.ink} strokeWidth={2.5} fill="none">
      <path d="M -50 -60 Q 0 -44 50 -60" /><path d="M -46 -30 Q 0 -14 46 -30" />
    </g>
  </g>
);

// 割れた人形のかけら (i で形を変える)。x,y=中心
const SHARDS: [number, number][][] = [
  [[-50, -30], [10, -44], [30, 10], [-20, 34], [-48, 10]],
  [[-30, -36], [36, -24], [40, 26], [-10, 30]],
  [[-40, -20], [20, -36], [34, 6], [4, 34], [-36, 18]],
  [[-26, -26], [30, -18], [20, 26], [-24, 20]],
  [[-20, -18], [22, -14], [14, 18], [-18, 12]],
];
const NB1cShard: React.FC<{ x: number; y: number; s: number; i: number; rot?: number; band?: boolean; head?: boolean }> = ({ x, y, s, i, rot = 0, band, head }) => {
  const pts = SHARDS[i % SHARDS.length];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={C.clay} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <polygon points={pts.map((p) => `${p[0] * 0.6},${p[1] * 0.6 + 6}`).join(" ")} fill={C.clayDark} opacity={0.35} />
      {band && (
        <g>
          <rect x={-30} y={-12} width={52} height={22} fill={C.scroll} stroke={C.ink} strokeWidth={3} />
          <path d="M -26 0 q 5 -9 10 0 q 5 9 10 0 M 6 0 q 6 -8 12 0 q -6 8 -12 0" stroke={C.ink} strokeWidth={2.5} fill="none" /><circle cx={12} cy={0} r={2.5} fill={C.ink} />
          <path d="M 22 -14 L 12 0 L 24 12" stroke={C.ink} strokeWidth={3} fill="none" />
        </g>
      )}
      {head && (
        <g><circle cx={-8} cy={-6} r={3.5} fill={C.ink} /><circle cx={8} cy={-6} r={3.5} fill={C.ink} /></g>
      )}
    </g>
  );
};

// --- からくり工房の作業台 (#50〜#52 は同じ台の続き)。壁の有孔ボード+天板 ---
const NB1cBench: React.FC<{ top?: number }> = ({ top = 640 }) => (
  <g>
    {/* 壁の板 */}
    <rect x={-40} y={-40} width={W + 80} height={top + 60} fill={C.wall} />
    {Array.from({ length: 9 }, (_, i) => (
      <line key={i} x1={-40 + i * 250} y1={-40} x2={-40 + i * 250} y2={top} stroke={C.wallDark} strokeWidth={5} opacity={0.6} />
    ))}
    {/* 有孔ボード */}
    <rect x={150} y={50} width={1620} height={top - 150} rx={8} fill={C.peg} stroke={C.ink} strokeWidth={6} />
    {Array.from({ length: 16 }, (_, i) => Array.from({ length: Math.floor((top - 190) / 50) }, (_, j) => (
      <circle key={`${i}-${j}`} cx={200 + i * 102} cy={90 + j * 50} r={5} fill={C.pegHole} opacity={0.55} />
    )))}
    {/* 掛けてある道具: 金づち・のこぎり・ペンチ・物差し・歯車 */}
    <g stroke={C.ink} strokeWidth={SK} strokeLinejoin="round">
      <rect x={236} y={110} width={20} height={150} rx={6} fill={C.benchEdge} />
      <rect x={206} y={96} width={80} height={36} rx={6} fill={KRP.grayDark} />
      <path d="M 1560 100 L 1720 100 L 1720 150 L 1580 190 Z" fill={KRP.silver} />
      <rect x={1520} y={92} width={50} height={70} rx={14} fill={C.benchEdge} />
      <path d="M 340 110 L 360 240 M 380 110 L 360 240" strokeWidth={14} stroke={KRP.red} strokeLinecap="round" />
      <rect x={1400} y={100} width={30} height={240} fill={KRP.yellow} />
    </g>
    <g stroke={C.ink} strokeWidth={3}>
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={1400} y1={120 + i * 22} x2={1414} y2={120 + i * 22} />)}
    </g>
    {/* 天板 */}
    <rect x={-40} y={top} width={W + 80} height={H - top + 40} fill={C.bench} />
    <rect x={-40} y={top - 12} width={W + 80} height={24} fill={C.benchEdge} stroke={C.ink} strokeWidth={6} />
    <g stroke={C.grain} strokeWidth={4} fill="none" opacity={0.7}>
      {[60, 150, 260, 380].map((dy, i) => (
        <path key={dy} d={`M -40 ${top + dy} q 480 ${i % 2 ? 14 : -12} 980 0 q 480 ${i % 2 ? -10 : 12} 1000 0`} />
      ))}
    </g>
  </g>
);

// 真鍮の歯車 (r=半径・ang=回転角)
const NB1cGear: React.FC<{ x: number; y: number; r: number; ang: number; teeth?: number; fill?: string }> = ({ x, y, r, ang, teeth = 10, fill = KRP.brass }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    {Array.from({ length: teeth }, (_, i) => (
      <rect key={i} x={-r * 0.16} y={-r - r * 0.22} width={r * 0.32} height={r * 0.4} fill={fill} stroke={C.ink} strokeWidth={4}
        transform={`rotate(${(i * 360) / teeth})`} />
    ))}
    <circle r={r} fill={fill} stroke={C.ink} strokeWidth={5} />
    <circle r={r * 0.55} fill="none" stroke={NP.brassDark} strokeWidth={4} />
    <circle r={r * 0.18} fill={C.ink} />
  </g>
);

// --- 人々の人形 (台座つき)。kind: ancient 古代エジプト / medieval 中世ヨーロッパ / edo 昔の日本 ---
type DollKind = "ancient" | "medieval" | "edo";
const DOLL: Record<DollKind, { cloth: string; dark: string; hair: "cap" | "none" }> = {
  ancient: { cloth: "#F4EFE2", dark: "#DED3BA", hair: "none" },
  medieval: { cloth: "#8C6A3F", dark: "#5E4527", hair: "cap" },
  edo: { cloth: "#3F6E8C", dark: "#2C5068", hair: "cap" },
};
const NB1cDoll: React.FC<{
  kind: DollKind; x: number; y: number; s: number; f: number; phase: number;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy"; lean?: number; gaze?: [number, number]; shh?: number;
}> = ({ kind, x, y, s, f, phase, face = "normal", lean = 0, gaze = [0, 0], shh = 0 }) => {
  const d = DOLL[kind];
  const b = bobOf(f, phase);
  const pose = shh > 0 ? "hold" : "stand";
  return (
    <g>
      {/* 台座 */}
      <ellipse cx={x} cy={y + 6} rx={92 * s} ry={22 * s} fill={C.benchDark} opacity={0.35} />
      <ellipse cx={x} cy={y} rx={86 * s} ry={20 * s} fill={C.benchEdge} stroke={C.ink} strokeWidth={4} />
      <Person x={x} y={y - 8 * s} s={s} f={f} phase={phase} cloth={d.cloth} clothDark={d.dark} hair={d.hair}
        face={face} lean={lean} gaze={gaze} pose={pose} />
      <g transform={`translate(${x} ${y - 8 * s + b}) scale(${s}) rotate(${lean})`}>
        {kind === "ancient" && (
          <g>
            {/* 胸飾り (ウセク) */}
            <path d="M -50 -160 Q 0 -110 50 -160" stroke={C.lapis} strokeWidth={12} fill="none" />
            <path d="M -40 -160 Q 0 -128 40 -160" stroke={KRP.brass} strokeWidth={8} fill="none" />
            <path d="M -58 -74 L 58 -74" stroke={KRP.brass} strokeWidth={8} />
          </g>
        )}
        {kind === "medieval" && (
          <g>
            {/* つば広のフェルト帽 */}
            <ellipse cx={0} cy={-276} rx={88} ry={16} fill={C.bagDark} stroke={C.ink} strokeWidth={SK} />
            <path d="M -50 -278 Q -46 -330 0 -332 Q 46 -330 50 -278 Z" fill={C.bagDark} stroke={C.ink} strokeWidth={SK} />
            <path d="M 30 -300 q 40 -30 60 -10" stroke={KRP.red} strokeWidth={7} fill="none" strokeLinecap="round" />
            <rect x={-58} y={-80} width={116} height={12} fill={C.bagDark} stroke={C.ink} strokeWidth={3} />
          </g>
        )}
        {kind === "edo" && (
          <g>
            {/* ちょんまげ */}
            <rect x={-10} y={-312} width={20} height={34} rx={6} fill={C.ink} transform="rotate(-8 0 -292)" />
            {/* 着物のえり */}
            <path d="M -30 -160 L 0 -110 L 30 -160" stroke={KRP.white} strokeWidth={9} fill="none" />
            <path d="M -30 -160 L 0 -110 L 30 -160" stroke={C.ink} strokeWidth={3} fill="none" />
            <rect x={-58} y={-86} width={116} height={16} fill={C.tiger} stroke={C.ink} strokeWidth={3} />
          </g>
        )}
        {/* しーっ: 胸の右手から人さし指を口へ */}
        {shh > 0 && (
          <g opacity={clamp01(shh * 3)}>
            <path d={`M 14 -118 L ${lerp(14, 6, shh)} ${lerp(-130, -176, shh)}`} stroke={d.cloth} strokeWidth={20} strokeLinecap="round" />
            <path d={`M 14 -118 L ${lerp(14, 6, shh)} ${lerp(-130, -176, shh)}`} stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
            <circle cx={lerp(14, 6, shh)} cy={lerp(-130, -176, shh)} r={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            <line x1={lerp(14, 4, shh)} y1={lerp(-136, -182, shh)} x2={lerp(14, 2, shh)} y2={lerp(-148, -204, shh)} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
            <line x1={lerp(14, 4, shh)} y1={lerp(-136, -182, shh)} x2={lerp(14, 2, shh)} y2={lerp(-148, -204, shh)} stroke={KRP.white} strokeWidth={3} strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
};

// 小男のとんがり帽子 (赤茶)。x,y=つばの中心
const NB1cHat: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={80} ry={18} fill={KRP.ink} opacity={0.2} />
    <path d="M -60 0 Q -30 -60 10 -150 Q 30 -170 50 -150 Q 30 -140 26 -120 Q 40 -50 60 0 Z" fill="#9A4A2A" stroke={C.ink} strokeWidth={SK} strokeLinejoin="round" />
    <ellipse cx={0} cy={0} rx={70} ry={14} fill="#7A3820" stroke={C.ink} strokeWidth={SK} />
    <path d="M -50 -24 Q 0 -10 52 -24" stroke={KRP.yellow} strokeWidth={8} fill="none" />
  </g>
);

// 糸車の模型。x,y=接地 / ang=車輪の回転
const NB1cWheel: React.FC<{ x: number; y: number; s: number; ang: number }> = ({ x, y, s, ang }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={150} ry={16} fill={KRP.ink} opacity={0.18} />
    <path d="M -130 0 L -60 -110 M 110 0 L 40 -110 M -140 0 L 130 0" stroke={C.benchDark} strokeWidth={14} strokeLinecap="round" />
    <path d="M -130 0 L -60 -110 M 110 0 L 40 -110 M -140 0 L 130 0" stroke={C.ink} strokeWidth={3} fill="none" />
    <g transform={`translate(-10 -150) rotate(${ang})`}>
      <circle r={92} fill="none" stroke={C.benchEdge} strokeWidth={16} />
      <circle r={92} fill="none" stroke={C.ink} strokeWidth={4} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 4) * 86} y2={Math.sin((i * Math.PI) / 4) * 86} stroke={C.ink} strokeWidth={5} />
      ))}
      <circle r={14} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
    </g>
    {/* 糸巻き (金の糸) */}
    <rect x={92} y={-140} width={46} height={30} rx={8} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
    <path d="M 102 -126 L -10 -242" stroke={KRP.yellow} strokeWidth={3} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #45 巨人は鬼に、教会は橋に、置きかえられました。
// 格: 図 / seed 4045
// 絵: ★置きかえの図。左に北欧の巨人と石の教会、右に赤鬼と木の橋。**同じ構図・同じポーズ**で並べ、真ん中に真鍮の歯車つきの「置きかえ機」(からくりの箱) を置く。f で巨人→鬼、教会→橋 が箱を通って入れ替わる。札「巨人→鬼」「教会→橋」
// どこ: 工房の板壁に貼った大きなクラフト紙の図。左半分=北欧 (雪と針葉樹)、右半分=日本 (桜)。
// 演出: 左右に「人物+建物」を同じ並び・同じポーズで置き、真ん中の置きかえ機を小さな写しがベルトで通る。
// 動き: 巨人の写し→箱→鬼 (f4〜32)、教会の写し→箱→橋 (f12〜40)。歯車が回り煙突が煙を吐き、出口で煙ぽん。カメラ少し寄る。
const Nm045: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.03 * easeOut(seg(f, 0, 42));
  const gin = seg(f, 4, 14); // 巨人の写しが入る
  const cin = seg(f, 12, 22); // 教会の写しが入る
  const oout = seg(f, 20, 28); // 鬼の写しが出る
  const bout = seg(f, 28, 36); // 橋の写しが出る
  const oniPop = seg(f, 26, 32);
  const brPop = seg(f, 34, 40);
  const busy = (f > 10 && f < 24) || (f > 20 && f < 36);
  const ang = f * 3 + (busy ? f * 4 : 0) + seg(f, 10, 36) * 200;
  const ground = 770;
  const ghost = (x: number, w: number, h: number, t: number) => t < 1 && (
    <g opacity={1 - t}>
      <rect x={x - w / 2} y={ground - h} width={w} height={h} rx={20} fill="none" stroke={C.craftDark} strokeWidth={5} strokeDasharray="14 12" />
      <QMark x={x} y={ground - h / 2 + 30} s={0.6} f={f} color={C.craftDark} />
    </g>
  );
  const puff = (cx: number, cy: number, t: number) => t > 0 && t < 1 && (
    <g opacity={1 - t}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={cx + Math.cos(a) * 50 * t} cy={cy + Math.sin(a) * 34 * t} r={18 + 22 * t} fill={KRP.white} stroke={C.ink} strokeWidth={3} />;
      })}
    </g>
  );
  return (
    <Frame f={f} seed={4045}>
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wall} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240} y1={-40} x2={i * 240} y2={H + 40} stroke={C.wallDark} strokeWidth={5} opacity={0.5} />)}
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        <g transform="rotate(-0.6 960 480)">
          {/* 大きなクラフト紙 */}
          <rect x={60} y={90} width={1800} height={790} rx={8} fill={C.craft} stroke={C.ink} strokeWidth={7} />
          {([[90, 104, 30], [1830, 104, -32], [92, 866, -28], [1828, 866, 30]] as const).map(([tx, ty, r], i) => (
            <rect key={i} x={tx - 50} y={ty - 18} width={100} height={36} rx={4} fill={i % 2 ? "#E8A3A0" : "#9FC8C0"} opacity={0.85}
              stroke={C.ink} strokeWidth={3} transform={`rotate(${r} ${tx} ${ty})`} />
          ))}
          {/* 左: 北欧の世界 */}
          <rect x={110} y={140} width={640} height={660} rx={24} fill={C.nord} stroke={C.ink} strokeWidth={5} />
          <path d={`M 110 ${ground} Q 300 ${ground - 30} 500 ${ground - 6} T 750 ${ground - 10} L 750 800 L 110 800 Z`} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          {[[170, 520, 0.8], [700, 480, 1], [460, 560, 0.6]].map(([px, py, ps], i) => (
            <g key={i} transform={`translate(${px} ${py}) scale(${ps})`}>
              <rect x={-8} y={0} width={16} height={60} fill={C.benchDark} />
              <path d="M 0 -150 L 50 -60 L 30 -60 L 66 0 L -66 0 L -30 -60 L -50 -60 Z" fill={C.pine} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              <path d="M 0 -150 L 22 -110 L -22 -110 Z" fill={KRP.white} />
            </g>
          ))}
          {/* 雪 */}
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={130 + rnd(4045, i) * 600} cy={160 + ((rnd(4045, i + 20) * 600 + f * 2.5) % 560)} r={5} fill={KRP.white} stroke={C.ink} strokeWidth={1.5} />
          ))}
          {/* 北欧の旗 */}
          <g transform="translate(150 170)">
            <line x1={0} y1={0} x2={0} y2={110} stroke={C.ink} strokeWidth={5} />
            <g transform={`skewY(${Math.sin(f / 8) * 3})`}>
              <rect x={0} y={0} width={96} height={64} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
              <rect x={24} y={0} width={18} height={64} fill={KRP.white} /><rect x={0} y={23} width={96} height={18} fill={KRP.white} />
              <rect x={29} y={0} width={8} height={64} fill={C.lapis} /><rect x={0} y={28} width={96} height={8} fill={C.lapis} />
            </g>
          </g>
          <NB1cChurch x={585} y={ground} s={0.95} />
          <NB1cGiant x={320} y={ground} s={1.25} f={f} />

          {/* 右: 日本の世界 */}
          <rect x={1170} y={140} width={640} height={660} rx={24} fill={C.japan} stroke={C.ink} strokeWidth={5} />
          <path d={`M 1170 ${ground} Q 1400 ${ground - 20} 1600 ${ground - 4} T 1810 ${ground - 8} L 1810 800 L 1170 800 Z`} fill={KRP.green} stroke={C.ink} strokeWidth={4} />
          {/* 桜の枝と花びら */}
          <path d="M 1810 200 Q 1700 210 1620 260 Q 1580 280 1540 270" stroke={C.benchDark} strokeWidth={10} fill="none" strokeLinecap="round" />
          {[[1610, 236], [1556, 290], [1690, 250], [1760, 190], [1650, 290], [1730, 232]].map(([bx, by], i) => (
            <g key={i} transform={`translate(${bx} ${by}) rotate(${i * 23 + Math.sin(f / 9 + i) * 6})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx={0} cy={-13} rx={9} ry={13} fill={C.sakura} stroke={C.ink} strokeWidth={2.5} transform={`rotate(${a})`} />
              ))}
              <circle r={6} fill={KRP.yellow} stroke={C.ink} strokeWidth={2} />
            </g>
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse key={i} cx={1200 + rnd(4046, i) * 580 - ((f * 1.5) % 80)} cy={300 + ((rnd(4046, i + 9) * 400 + f * 2) % 420)} rx={7} ry={4}
              fill={C.sakura} stroke={C.ink} strokeWidth={1.5} transform={`rotate(${i * 40 + f * 4} ${1200 + rnd(4046, i) * 580} 400)`} />
          ))}
          {/* 日本の旗 */}
          <g transform="translate(1210 170)">
            <line x1={0} y1={0} x2={0} y2={110} stroke={C.ink} strokeWidth={5} />
            <g transform={`skewY(${Math.sin(f / 8 + 1) * 3})`}>
              <rect x={0} y={0} width={96} height={64} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
              <circle cx={48} cy={32} r={18} fill={KRP.red} />
            </g>
          </g>
          {/* 右の「まだない」場所 (点線の空き枠) → 出来上がるとぽんと出る */}
          {ghost(1380, 230, 400, oniPop)}
          {ghost(1640, 330, 150, brPop)}
          {brPop > 0 && (
            <g transform={`translate(1640 ${ground}) scale(${pop(brPop)}) translate(-1640 ${-ground})`}>
              <NB1cBridge x={1640} y={ground} s={0.85} />
            </g>
          )}
          {oniPop > 0 && (
            <g transform={`translate(1380 ${ground}) scale(${pop(oniPop)}) translate(-1380 ${-ground})`}>
              <NB1cOni x={1380} y={ground} s={1.25} f={f} />
            </g>
          )}

          {/* ベルトコンベア */}
          <rect x={720} y={690} width={480} height={34} rx={17} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => {
            const bx = 730 + ((i * 40 + f * 4) % 470);
            return <line key={i} x1={bx} y1={694} x2={bx - 8} y2={720} stroke={C.ink} strokeWidth={3} opacity={0.6} />;
          })}
          {[740, 1180].map((rx) => <circle key={rx} cx={rx} cy={707} r={14} fill={KRP.silver} stroke={C.ink} strokeWidth={4} />)}
          {/* 入っていく写し (小さく) */}
          {gin > 0 && gin < 1 && <g transform={`translate(${lerp(700, 900, gin)} 690) scale(${0.42 - gin * 0.1}) translate(${-320} ${-ground})`}><NB1cGiant x={320} y={ground} s={1.25} f={f} /></g>}
          {cin > 0 && cin < 1 && <g transform={`translate(${lerp(700, 900, cin)} 690) scale(${0.4 - cin * 0.1}) translate(-585 ${-ground})`}><NB1cChurch x={585} y={ground} s={0.95} /></g>}
          {/* 出てくる写し */}
          {oout > 0 && oniPop < 1 && <g opacity={1 - oniPop} transform={`translate(${lerp(1040, 1200, oout)} 690) scale(${0.32 + oout * 0.1}) translate(-1380 ${-ground})`}><NB1cOni x={1380} y={ground} s={1.25} f={f} /></g>}
          {bout > 0 && brPop < 1 && <g opacity={1 - brPop} transform={`translate(${lerp(1040, 1200, bout)} 690) scale(${0.3 + bout * 0.1}) translate(-1640 ${-ground})`}><NB1cBridge x={1640} y={ground} s={0.85} /></g>}

          {/* 置きかえ機 (からくりの箱) */}
          <g transform={`translate(0 ${busy ? Math.sin(f * 2.2) * 3 : 0})`}>
            <rect x={918} y={300} width={40} height={90} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
            {[0, 1, 2].map((i) => {
              const t = ((f + i * 9) % 27) / 27;
              return <circle key={i} cx={938 + Math.sin(t * 6 + i) * 14} cy={290 - t * 110} r={14 + t * 20} fill={KRP.white} stroke={C.ink} strokeWidth={3} opacity={(1 - t) * 0.9} />;
            })}
            <rect x={810} y={380} width={300} height={350} rx={18} fill={C.box} stroke={C.ink} strokeWidth={7} />
            <rect x={810} y={380} width={300} height={40} rx={14} fill={NP.brass} stroke={C.ink} strokeWidth={6} />
            {[[826, 436], [1094, 436], [826, 714], [1094, 714]].map(([rx, ry], i) => <circle key={i} cx={rx} cy={ry} r={7} fill={NP.brassDark} stroke={C.ink} strokeWidth={3} />)}
            {/* 入口と出口 */}
            <rect x={796} y={630} width={34} height={90} rx={6} fill={C.ink} opacity={0.85} />
            <rect x={1090} y={630} width={34} height={90} rx={6} fill={C.ink} opacity={0.85} />
            {/* のぞき窓 (中で渦が回る) */}
            <circle cx={960} cy={560} r={70} fill={C.glass} stroke={C.ink} strokeWidth={6} />
            <g transform={`rotate(${ang * 2} 960 560)`} opacity={busy ? 1 : 0.4}>
              <path d="M 960 560 m -40 0 a 40 40 0 0 1 80 0 a 28 28 0 0 1 -56 0 a 16 16 0 0 1 32 0" stroke={NP.mimi} strokeWidth={6} fill="none" />
            </g>
            <circle cx={960} cy={560} r={70} fill="none" stroke={NP.brass} strokeWidth={10} />
            <circle cx={960} cy={560} r={70} fill="none" stroke={C.ink} strokeWidth={3} />
            <NB1cGear x={862} y={470} r={34} ang={ang} />
            <NB1cGear x={1050} y={480} r={46} ang={-ang * 0.75} teeth={12} />
            <NB1cGear x={1046} y={664} r={26} ang={ang * 1.3} teeth={8} />
            {/* ランプ */}
            <circle cx={1066} cy={400} r={12} fill={busy && Math.floor(f / 3) % 2 ? KRP.red : KRP.grayDark} stroke={C.ink} strokeWidth={3} />
            {/* 小さな表示: 左=入る / 右=出る */}
            <Arrow x={870} y={760} s={0.4} t={1} color={KRP.yellow} />
            <Arrow x={1080} y={760} s={0.4} t={1} color={KRP.yellow} />
          </g>
          {puff(1150, 660, seg(f, 20, 30))}
          {puff(1150, 660, seg(f, 28, 38))}
        </g>
      </g>
      <TagPlate x={960} y={200} text="巨人→鬼" size={40} t={seg(f, 26, 32)} />
      <TagPlate x={960} y={786} text="教会→橋" size={36} t={seg(f, 34, 40)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #46 昔話も、旅をするのです。
// 格: 並 / seed 4046
// 絵: ユーラシア大陸の横長の古地図 (左端に北欧のスカンジナビア半島、右端に日本列島の弓形)。旅行かばんを持った赤い絵本が汽車→船と乗り継いで、足あとの点線を残して北欧→日本へ旅する
// どこ: 作業机に広げた古い羊皮紙の地図 (北欧からユーラシアを越えて日本まで)。方位磁針。
// 演出: 旅行かばんを提げた小さな絵本 (表紙に糸車) が、足あとを残してトコトコ歩く。途中に汽車 (シベリア) と船 (日本海)。
// 動き: 絵本が f0〜42 で北欧→日本へ。足が交互・体が上下。汽車の煙・船のゆれ。カメラが東へ少しパン。
// 地図の投影 (デフォルメ): 経度1度=10px・緯度1度=14px。日本だけ 1.35倍に拡大して形をはっきりさせる
const nb1cP = (lon: number, lat: number): [number, number] => [130 + (lon + 12) * 10, 110 + (76 - lat) * 14];
const nb1cPath = (pts: number[], jp = false) => {
  const out: string[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    let lon = pts[i], lat = pts[i + 1];
    if (jp) { lon = 137 + (lon - 137) * 1.35 + 2.5; lat = 38 + (lat - 38) * 1.35; }
    const [x, y] = nb1cP(lon, lat);
    out.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return out.join(" ") + " Z";
};
const NB1C_EURASIA = [
  -9.3, 43, -9.5, 38.7, -6, 36.7, -5.6, 36, -2, 36.8, 0.9, 41, 3.2, 41.9, 3, 43.3, 7.5, 43.8, 8.8, 44.4, 10.5, 43, 12.5, 41.5, 15.6, 40, 15.6, 38, 16.6, 38.4,
  17.1, 39, 16.5, 39.7, 18.5, 40.1, 16, 41.4, 14, 42.6, 12.3, 44.5, 13.7, 45.7, 15.5, 44, 18.5, 42.4, 19.5, 41.8, 21, 38.5, 23, 36.5, 23.5, 40.2, 26, 40.8,
  26.5, 40.3, 26.2, 39.5, 27, 37.5, 28, 36.6, 30.5, 36.5, 32.5, 36.1, 36, 36.5, 35.8, 34.8, 35, 33, 34.5, 31.5, 32.3, 31.2, 32, 18,
  60, 18, 75, 18, 80, 15, 88, 22, 92, 22, 94, 18, 98, 16, 100, 13, 105, 10, 108, 16, 106.5, 20.5, 110, 21, 111, 21.6, 113.5, 22.5, 117, 23.5, 119.5, 26,
  121.5, 28.5, 122, 30.5, 121, 32, 120.5, 33.5, 119.5, 35, 120.5, 36.6, 122.5, 37.2, 121, 37.8, 118.8, 37.5, 117.8, 38.6, 118.5, 39.2, 121, 40.8, 121.5, 39.2,
  122.5, 40, 124.3, 39.9, 125, 38.6, 126.5, 37.7, 126.4, 34.6, 127.5, 34.6, 129.4, 35.3, 129.5, 36.8, 128.5, 38.6, 127.5, 39.8, 129.7, 40.9, 130.7, 42.4,
  133, 42.8, 135.5, 43.9, 138.5, 47, 140.5, 48.5, 140.5, 51, 141.5, 53, 137, 54, 135.3, 54.7, 137.5, 56.3, 141, 59, 145, 59.4, 150, 59.6, 160, 61, 165, 80,
  105, 80, 95, 76, 80, 73, 72, 72.5, 68, 69, 60, 69.5, 54, 68.2, 44, 68.5, 41, 67, 40.5, 64.6, 37, 63.8, 35, 64.5, 33, 66.5, 36, 66.9, 41, 66.2, 39.5, 68,
  33, 69.4, 30, 70, 25, 71.2, 18, 70, 14, 68, 12, 66, 10, 64, 7, 62.5, 5, 61, 5, 59, 6, 58, 8, 58, 10, 59, 11, 59, 11.5, 58, 12.5, 56.5, 13, 55.4, 14.3, 55.5,
  16, 56.2, 16.6, 58.3, 18.5, 59.5, 17.5, 61, 17.5, 62.5, 21, 64.5, 22, 65.8, 25, 65.5, 21.5, 63, 21.5, 61, 22.5, 60, 30, 60, 24, 59.4, 23.5, 58.5, 24.3, 57.2,
  21.5, 57.5, 21, 55.3, 19, 54.4, 14.2, 53.9, 11, 54, 10, 54.8, 10.5, 57.6, 8.1, 56.6, 8.8, 54, 5, 53.3, 3.5, 51.5, 1.6, 50.9, 0, 49.7, -1.6, 48.6, -4.7, 48.4,
  -2.3, 47.2, -1.2, 46, -1.8, 43.4, -8, 43.7,
];
const NB1C_AFRICA = [-20, 18, -17, 21, -17, 28, -10, 29, -9.5, 31.5, -6.8, 34, -5.9, 35.8, -2, 35.1, 3, 36.8, 10, 37.3, 11, 36.9, 10.3, 34, 11, 33.2, 15.2, 32.3, 19, 30.3, 20, 31, 20, 32.5, 23, 32.6, 25, 31.6, 29, 30.8, 32.3, 31.2, 32.5, 29.9, 32.5, 18];
const NB1C_WATER = [
  [28, 41.2, 28, 42.5, 28.6, 43.7, 29.7, 45.2, 30.7, 46.5, 33.5, 46, 33.5, 44.5, 36.5, 45.3, 38, 47, 39.5, 47, 38, 45, 41.5, 41.5, 36, 41.7, 31, 41.1], // 黒海
  [47, 45, 49, 46.5, 53, 47, 52.5, 45, 51, 44, 52.8, 41.5, 54, 40, 53.5, 37.5, 50.5, 37, 49, 38.5, 49.5, 40.5, 47.5, 42.5], // カスピ海
  [32.5, 29.9, 34.5, 28, 36, 25, 37, 22, 35, 22, 33.5, 27], // 紅海
  [48, 30, 50, 29.5, 51.5, 27.5, 54, 24.5, 56.3, 25.5, 56.5, 27, 54, 26.8, 51, 28.8, 49.5, 30], // ペルシャ湾
];
const NB1C_ISLES = [
  [-5.7, 50.1, -3, 50.6, 1.4, 51.2, 1.7, 52.6, 0.3, 53.4, -1.6, 55.6, -2, 57.6, -3.3, 58.6, -5, 58.6, -6, 57.5, -4.9, 55.1, -3, 53.3, -4.5, 53.3, -5.2, 51.8, -3.5, 51.4], // イギリス
  [-6, 52.2, -6.2, 53.9, -5.5, 54.6, -7.3, 55.3, -10, 54.2, -10.3, 52.2, -8, 51.8], // アイルランド
  [12.4, 37.9, 15.6, 38.3, 15.1, 36.7, 12.5, 37.6], // シチリア
  [120, 22, 121, 25, 122, 25, 121, 22], // 台湾
];
const NB1C_JAPAN = [
  [140, 41.5, 141.2, 41.8, 141.5, 42.6, 143.3, 42, 145.5, 43.3, 145.3, 44.2, 144, 44, 141.8, 45.4, 141.6, 44.3, 141.4, 43.2, 140.4, 43.3, 140, 42.4], // 北海道
  [141.4, 41.4, 141.5, 40.5, 142, 39.5, 141.5, 38.3, 141, 37.2, 140.8, 36, 140.5, 35.2, 139.8, 35.1, 139.7, 35.6, 139.1, 35.2, 138.5, 34.6, 137, 34.6, 136.8, 35,
    136.2, 34.4, 135.8, 33.5, 135.1, 34.3, 135.3, 34.7, 134, 34.6, 133, 34.3, 132.2, 33.8, 130.9, 34, 131, 34.4, 132.5, 35.4, 133.5, 35.5, 135.5, 35.6, 136, 36,
    136.7, 37.2, 137.3, 36.8, 138.5, 37.4, 139.5, 38.4, 140, 39.5, 139.9, 40.6, 140.3, 41.2, 140.9, 41], // 本州
  [132.4, 33.2, 133, 32.7, 133.5, 33.4, 134.3, 33.3, 134.7, 33.8, 134, 34.3, 133, 34.1, 132.3, 33.8], // 四国
  [129.8, 33.4, 130.4, 33.9, 131, 33.9, 131.8, 33.2, 131.5, 32, 131, 31.3, 130.6, 31, 130.2, 31.4, 130.4, 32.3, 129.8, 32.7], // 九州
];
const Nm046: React.FC<{ f: number }> = ({ f }) => {
  const P0 = [430, 300], P1 = [800, 250], P2 = [1500, 300], P3 = [1592, 596]; // 北欧 → シベリア → 日本海の船に乗り継ぐ (日本列島の形はふさがない)
  const bz = (u: number): [number, number] => {
    const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
    return [a * P0[0] + b * P1[0] + c * P2[0] + d * P3[0], a * P0[1] + b * P1[1] + c * P2[1] + d * P3[1]];
  };
  const u = seg(f, 0, 40);
  const drift = 18 * easeInOut(seg(f, 40, 70)); // 船に乗ったあと日本へ進む
  const [bx0, by] = bz(u);
  const bx = bx0 + drift;
  const [nx, ny] = bz(Math.min(1, u + 0.01));
  const tilt = u >= 1 ? 0 : (Math.atan2(ny - by, nx - bx0) * 180) / Math.PI * 0.15;
  const step = Math.sin(f * 0.9);
  const hop = Math.abs(Math.sin(f * 0.9)) * -10;
  const pan = lerp(50, -50, easeInOut(seg(f, 0, 42)));
  const [tx, ty] = bz(0.4);
  const [sx, sy] = [1592 + drift, 600]; // 日本海の船 (絵本が最後に乗る)
  return (
    <Frame f={f} seed={4046}>
      {/* 作業机 */}
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.bench} />
      <g stroke={C.grain} strokeWidth={5} opacity={0.6} fill="none">
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M -40 ${40 + i * 160} q 480 ${rnd(46, i) * 30 - 15} 1000 0 q 480 ${rnd(47, i) * 30 - 15} 1000 0`} />)}
      </g>
      <g transform={`translate(${960 + pan} 540) scale(1.06) translate(-960 -540)`}>
        {/* 地図の紙 */}
        <path d="M 100 80 L 1820 70 L 1830 860 L 1700 872 L 110 866 Z" fill={C.map} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 1700 872 L 1830 860 L 1760 820 Z" fill={C.craftDark} stroke={C.ink} strokeWidth={4} />
        <defs><clipPath id="nb1c046sea"><rect x={140} y={110} width={1650} height={720} rx={10} /></clipPath></defs>
        {/* 海 */}
        <rect x={140} y={110} width={1650} height={720} rx={10} fill={C.sea} stroke={C.ink} strokeWidth={4} />
        <g clipPath="url(#nb1c046sea)">
          {/* 経線・緯線 */}
          <g stroke={C.seaDark} strokeWidth={2.5} strokeDasharray="6 10" opacity={0.8}>
            {[300, 560, 820, 1080, 1340, 1600].map((gx) => <line key={gx} x1={gx} y1={110} x2={gx} y2={830} />)}
            {[260, 460, 660].map((gy) => <line key={gy} x1={140} y1={gy} x2={1790} y2={gy} />)}
          </g>
          {/* ユーラシア大陸・アフリカ北部・島 */}
          <g fill={C.land} stroke={C.ink} strokeWidth={5} strokeLinejoin="round">
            <path d={nb1cPath(NB1C_EURASIA)} />
            <path d={nb1cPath(NB1C_AFRICA)} />
            {NB1C_ISLES.map((p, i) => <path key={i} d={nb1cPath(p)} />)}
          </g>
          {NB1C_WATER.map((p, i) => <path key={i} d={nb1cPath(p)} fill={C.sea} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />)}
          {/* 日本列島 (北海道・本州・四国・九州) */}
          <g fill={C.land} stroke={C.ink} strokeWidth={5} strokeLinejoin="round">
            {NB1C_JAPAN.map((p, i) => <path key={i} d={nb1cPath(p, true)} />)}
          </g>
        </g>
        {/* 山脈 (アルプス・ウラル・天山) */}
        {[[355, 530], [850, 330], [862, 392], [1040, 590], [1100, 600]].map(([mx, my], i) => (
          <path key={i} d={`M ${mx - 26} ${my + 18} L ${mx} ${my - 22} L ${mx + 26} ${my + 18}`} fill={C.landDark} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        ))}
        {/* 足あとの点線 */}
        {Array.from({ length: 60 }, (_, i) => {
          const uu = (i / 60) * u;
          const [px, py] = bz(uu);
          const side = i % 2 ? 7 : -7;
          return <ellipse key={i} cx={px} cy={py + side} rx={7} ry={4.5} fill={C.bookDark} opacity={0.75} />;
        })}
        {/* 汽車 (シベリアの上) */}
        <g transform={`translate(${tx} ${ty + 80}) scale(0.85)`}>
          <path d="M -150 30 L 150 30" stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-140 + i * 35} y1={26} x2={-140 + i * 35} y2={36} stroke={C.ink} strokeWidth={4} />)}
          <rect x={-130} y={-20} width={90} height={40} rx={6} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={4} />
          <rect x={-30} y={-30} width={110} height={50} rx={8} fill={KRP.ink} stroke={C.ink} strokeWidth={4} />
          <rect x={40} y={-56} width={22} height={28} fill={KRP.ink} />
          <rect x={-10} y={-24} width={30} height={20} fill={KRP.yellow} />
          {[-110, -60, -10, 40].map((wx) => <circle key={wx} cx={wx} cy={22} r={10} fill={KRP.grayDark} stroke={C.ink} strokeWidth={3} />)}
          {[0, 1, 2].map((i) => {
            const t = ((f + i * 8) % 24) / 24;
            return <circle key={i} cx={52 - t * 70} cy={-66 - t * 40} r={10 + t * 14} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} opacity={1 - t} />;
          })}
        </g>
        {/* 船 (日本海) */}
        <g transform={`translate(${sx} ${sy}) rotate(${Math.sin(f / 6) * 4}) scale(0.6)`}>
          <path d="M -70 0 L 70 0 L 50 30 L -50 30 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <rect x={-30} y={-30} width={60} height={30} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <rect x={-6} y={-60} width={16} height={30} fill={KRP.ink} />
          <path d="M -90 40 q 20 -10 40 0 q 20 10 40 0 q 20 -10 40 0 q 20 10 40 0" stroke={KRP.white} strokeWidth={4} fill="none" />
        </g>
        {/* 方位磁針 (大西洋の南) */}
        <g transform={`translate(230 740) rotate(${Math.sin(f / 10) * 4})`}>
          <circle r={56} fill={C.map} stroke={C.ink} strokeWidth={5} />
          <path d="M 0 -48 L 12 0 L 0 48 L -12 0 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <path d="M 0 0 L 12 0 L 0 48 L -12 0 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <path d="M -48 0 L 0 -10 L 48 0 L 0 10 Z" fill={C.landDark} stroke={C.ink} strokeWidth={3} opacity={0.8} />
        </g>
        {/* 歩く絵本 */}
        <g transform={`translate(${bx} ${by + hop}) rotate(${tilt + step * 3}) scale(0.55)`}>
          <ellipse cx={0} cy={4 - hop} rx={60} ry={12} fill={KRP.ink} opacity={0.2} />
          {/* 足 */}
          {[-1, 1].map((d) => (
            <g key={d} transform={`rotate(${step * 20 * d} ${d * 26} -40)`}>
              <line x1={d * 26} y1={-40} x2={d * 26} y2={-6} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
              <ellipse cx={d * 26 + 8} cy={-4} rx={16} ry={8} fill={C.ink} />
            </g>
          ))}
          {/* 本の背と表紙 */}
          <rect x={-74} y={-230} width={148} height={192} rx={10} fill={C.bookDark} stroke={C.ink} strokeWidth={6} />
          <rect x={-64} y={-236} width={142} height={190} rx={10} fill={C.book} stroke={C.ink} strokeWidth={6} />
          <rect x={-60} y={-232} width={12} height={182} fill={C.bookDark} opacity={0.6} />
          <rect x={-40} y={-214} width={104} height={150} rx={8} fill="none" stroke={KRP.yellow} strokeWidth={4} />
          {/* 表紙の糸車 */}
          <g transform={`translate(12 -110) rotate(${f * 5})`}>
            <circle r={34} fill="none" stroke={KRP.yellow} strokeWidth={6} />
            {[0, 60, 120].map((a) => <line key={a} x1={-34} y1={0} x2={34} y2={0} stroke={KRP.yellow} strokeWidth={4} transform={`rotate(${a})`} />)}
          </g>
          <path d="M -12 -70 L 4 -94 M 36 -70 L 20 -94 M -18 -70 L 44 -70" stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" />
          {/* 顔 */}
          <circle cx={-6} cy={-182} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          <circle cx={30} cy={-182} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          <circle cx={-3} cy={-181} r={5} fill={C.ink} /><circle cx={33} cy={-181} r={5} fill={C.ink} />
          <path d="M 2 -162 Q 12 -152 22 -162" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          {/* 腕と旅行かばん */}
          <path d={`M -64 -120 Q -90 ${-100 + step * 6} -96 -80`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d={`M 78 -120 Q 104 -110 104 -92`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          <g transform={`rotate(${-step * 6} 104 -92)`}>
            <path d="M 88 -92 Q 104 -110 120 -92" stroke={C.ink} strokeWidth={5} fill="none" />
            <rect x={70} y={-92} width={70} height={54} rx={8} fill={C.bag} stroke={C.ink} strokeWidth={5} />
            <rect x={70} y={-72} width={70} height={8} fill={C.bagDark} />
            <circle cx={88} cy={-52} r={8} fill={KRP.yellow} stroke={C.ink} strokeWidth={2} />
            <rect x={110} y={-58} width={22} height={14} rx={3} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={2} />
          </g>
        </g>
        <TagPlate x={225} y={300} text="北欧" size={38} />
        <TagPlate x={1715} y={440} text="日本" size={38} t={seg(f, 28, 36)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #47 もっと古い時代にも、名前の力は信じられていました。
// 格: 並 / seed 4047
// 絵: 年代ダイヤルのかわりに、**砂時計が逆さに回る**画面 (からくり作業台の上)。砂の中に、グリムの本 → 古い巻物 → 粘土板・土器のかけら、と時代が遡る絵が浮かんで沈む。札「もっと昔」
// どこ: からくり工房の作業台。壁には古い掛け時計と歯車。台の上に真鍮の枠の大きな砂時計。
// 演出: 砂時計が逆向きにぐるりと回り、落ちる砂の表面に「グリムの本→古い巻物→粘土板とかけら」が順に浮かんで沈む。右の目盛りの針が下 (昔) へ進む。
// 動き: f4〜18 で反時計回りに半回転、f18〜 砂が落ちる。時代の絵が f18/26/32 で浮かぶ。掛け時計の針が逆回り。カメラ寄る。
const NB1cBulbPath = "M 945 490 C 940 560 780 600 780 690 Q 780 790 960 790 Q 1140 790 1140 690 C 1140 600 980 560 975 490 Z";
const NB1cTopPath = "M 945 450 C 940 380 780 340 780 250 Q 780 150 960 150 Q 1140 150 1140 250 C 1140 340 980 380 975 450 Z";
const Nm047: React.FC<{ f: number }> = ({ f }) => {
  const flip = easeInOut(seg(f, 4, 18));
  const a = -180 * flip;
  const after = f >= 18;
  const h = 30 + 120 * seg(f, 18, 42);
  const surf = 790 - h;
  const topLv = lerp(230, 300, seg(f, 18, 42));
  const cam = 1 + 0.05 * easeOut(seg(f, 10, 42));
  // 浮かんで沈む絵: [出る, 沈む]
  const item = (t0: number, t1: number | null) => {
    const inn = seg(f, t0, t0 + 5);
    const sink = t1 === null ? 0 : seg(f, t1, t1 + 6);
    return { op: inn * (1 - sink), y: surf + 20 - 30 * pop(inn) + sink * 90 };
  };
  const bk = item(18, 25), sc = item(25, 31), tb = item(32, null);
  const needle = f < 25 ? 300 : f < 32 ? lerp(300, 500, seg(f, 25, 30)) : lerp(500, 690, seg(f, 32, 37));
  return (
    <Frame f={f} seed={4047}>
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wallDark} />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={-40} x2={i * 220} y2={780} stroke={C.benchDark} strokeWidth={5} opacity={0.5} />)}
      <g transform={`translate(960 560) scale(${cam}) translate(-960 -560)`}>
        {/* 壁の掛け時計 (針が逆回り) */}
        {([[330, 300, 120], [1600, 260, 90]] as const).map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r + 16} fill={C.benchEdge} stroke={C.ink} strokeWidth={6} />
            <circle cx={cx} cy={cy} r={r} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
            {Array.from({ length: 12 }, (_, k) => (
              <line key={k} x1={cx} y1={cy - r + 8} x2={cx} y2={cy - r + 24} stroke={C.ink} strokeWidth={k % 3 ? 3 : 6} transform={`rotate(${k * 30} ${cx} ${cy})`} />
            ))}
            <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.75} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${-f * 14 + i * 90} ${cx} ${cy})`} />
            <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.5} stroke={KRP.red} strokeWidth={8} strokeLinecap="round" transform={`rotate(${-f * 3 + i * 40} ${cx} ${cy})`} />
            <circle cx={cx} cy={cy} r={9} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        <NB1cGear x={250} y={560} r={60} ang={-f * 2} teeth={12} />
        <NB1cGear x={350} y={640} r={38} ang={f * 3.2} />
        <NB1cGear x={1700} y={520} r={50} ang={f * 2} />
        {/* 逆回りの大きな矢印 */}
        <g opacity={0.55 + 0.25 * Math.sin(f / 5)}>
          <path d="M 1230 150 A 420 420 0 0 0 690 150" stroke={C.ink} strokeWidth={24} fill="none" strokeLinecap="round" />
          <path d="M 1230 150 A 420 420 0 0 0 690 150" stroke={KRP.yellow} strokeWidth={14} fill="none" strokeLinecap="round" />
          <polygon points="660,190 650,120 720,140" fill={KRP.yellow} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
        {/* 作業台 */}
        <rect x={-40} y={780} width={W + 80} height={340} fill={C.bench} />
        <rect x={-40} y={768} width={W + 80} height={24} fill={C.benchEdge} stroke={C.ink} strokeWidth={6} />
        <rect x={560} y={800} width={800} height={60} rx={6} fill={C.pine} stroke={C.ink} strokeWidth={5} opacity={0.85} />
        {/* 台の上の小物: ピンセット・ルーペ・ねじ */}
        <path d="M 300 830 L 500 812 M 300 834 L 500 826" stroke={KRP.silver} strokeWidth={8} strokeLinecap="round" />
        <g transform="translate(1520 830)">
          <circle r={40} fill={C.glass} stroke={C.ink} strokeWidth={6} />
          <rect x={34} y={-8} width={90} height={18} rx={8} fill={C.benchDark} stroke={C.ink} strokeWidth={4} transform="rotate(20)" />
        </g>

        <ellipse cx={960} cy={832} rx={240} ry={16} fill={KRP.ink} opacity={0.22} />
        {/* 砂時計 (回る) */}
        <g transform={`rotate(${a} 960 470)`}>
          <path d={NB1cTopPath} fill={C.glass} opacity={0.75} />
          <path d={NB1cBulbPath} fill={C.glass} opacity={0.75} />
          {!after && (
            <g>
              <clipPath id="nb1c-bulb-pre"><path d={NB1cBulbPath} /></clipPath>
              <g clipPath="url(#nb1c-bulb-pre)">
                <path d="M 760 560 Q 960 520 1160 560 L 1160 800 L 760 800 Z" fill={C.sand} />
                <path d="M 760 600 Q 960 580 1160 600" stroke={C.sandDark} strokeWidth={4} fill="none" />
              </g>
            </g>
          )}
          <path d={NB1cTopPath} fill="none" stroke={C.ink} strokeWidth={7} />
          <path d={NB1cBulbPath} fill="none" stroke={C.ink} strokeWidth={7} />
          <path d="M 830 220 Q 820 280 870 330" stroke={KRP.white} strokeWidth={10} fill="none" opacity={0.7} strokeLinecap="round" />
          <path d="M 830 640 Q 820 700 870 750" stroke={KRP.white} strokeWidth={10} fill="none" opacity={0.7} strokeLinecap="round" />
          {/* 木の枠と真鍮の柱 */}
          <rect x={740} y={112} width={440} height={40} rx={10} fill={C.benchEdge} stroke={C.ink} strokeWidth={6} />
          <rect x={740} y={788} width={440} height={40} rx={10} fill={C.benchEdge} stroke={C.ink} strokeWidth={6} />
          {[760, 1160].map((px) => (
            <g key={px}>
              <rect x={px - 10} y={150} width={20} height={640} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
              {[300, 470, 640].map((ry) => <rect key={ry} x={px - 15} y={ry - 8} width={30} height={16} rx={4} fill={NP.brassDark} stroke={C.ink} strokeWidth={3} />)}
            </g>
          ))}
        </g>

        {/* 回転後: 上の砂・落ちる砂・下の砂と時代の絵 */}
        {after && (
          <g>
            <clipPath id="nb1c-top"><path d={NB1cTopPath} /></clipPath>
            <clipPath id="nb1c-bot"><path d={NB1cBulbPath} /></clipPath>
            <g clipPath="url(#nb1c-top)">
              <path d={`M 760 ${topLv} Q 960 ${topLv + 40} 1160 ${topLv} L 1160 470 L 760 470 Z`} fill={C.sand} />
            </g>
            <line x1={960} y1={440} x2={960} y2={surf} stroke={C.sand} strokeWidth={8} />
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={960 + Math.sin(f + i) * 3} cy={460 + ((f * 18 + i * 40) % Math.max(20, surf - 460))} r={4} fill={C.sandDark} />
            ))}
            <g clipPath="url(#nb1c-bot)">
              <path d={`M 760 ${surf + 20} Q 960 ${surf - 24} 1160 ${surf + 20} L 1160 800 L 760 800 Z`} fill={C.sand} />
              {[40, 90, 150].map((dy) => <path key={dy} d={`M 760 ${surf + 20 + dy} Q 960 ${surf + dy} 1160 ${surf + 20 + dy}`} stroke={C.sandDark} strokeWidth={4} fill="none" opacity={0.7} />)}
              {/* グリムの本 */}
              <g opacity={bk.op} transform={`translate(960 ${bk.y}) rotate(-8) scale(1.3)`}>
                <rect x={-70} y={-50} width={140} height={96} rx={6} fill={C.grimm} stroke={C.ink} strokeWidth={5} />
                <rect x={-70} y={-50} width={18} height={96} fill={C.ink} opacity={0.4} />
                <rect x={-36} y={-30} width={84} height={56} rx={4} fill="none" stroke={KRP.yellow} strokeWidth={4} />
                <circle cx={6} cy={-2} r={16} fill="none" stroke={KRP.yellow} strokeWidth={4} />
              </g>
              {/* 古い巻物 */}
              <g opacity={sc.op} transform={`translate(960 ${sc.y}) rotate(6) scale(1.2)`}>
                <rect x={-90} y={-36} width={180} height={72} fill={C.scroll} stroke={C.ink} strokeWidth={5} />
                {[-90, 90].map((rx) => <rect key={rx} x={rx - 12} y={-50} width={24} height={100} rx={10} fill={C.benchEdge} stroke={C.ink} strokeWidth={5} />)}
                {[-18, 0, 18].map((ly) => <line key={ly} x1={-64} y1={ly} x2={64} y2={ly} stroke={C.glyph} strokeWidth={4} strokeDasharray="12 6" />)}
              </g>
              {/* 粘土板と土器のかけら */}
              <g opacity={tb.op} transform={`translate(950 ${tb.y + 20}) scale(1.3)`}>
                <rect x={-80} y={-56} width={130} height={104} rx={14} fill={C.clay} stroke={C.ink} strokeWidth={5} transform="rotate(-6)" />
                {Array.from({ length: 12 }, (_, i) => (
                  <path key={i} d={`M ${-60 + (i % 4) * 28} ${-34 + Math.floor(i / 4) * 28} l 12 4 l -12 4 Z`} fill={C.clayDark} transform="rotate(-6)" />
                ))}
                <NB1cShard x={92} y={10} s={0.8} i={1} rot={20} />
                <NB1cShard x={60} y={56} s={0.6} i={3} rot={-30} />
              </g>
            </g>
            <path d={NB1cTopPath} fill="none" stroke={C.ink} strokeWidth={7} />
            <path d={NB1cBulbPath} fill="none" stroke={C.ink} strokeWidth={7} />
          </g>
        )}
        {/* 右: 時代の目盛り (針が下=昔へ) */}
        <g>
          <rect x={1300} y={260} width={34} height={470} rx={16} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
          {[300, 500, 690].map((my) => <line key={my} x1={1290} y1={my} x2={1344} y2={my} stroke={C.ink} strokeWidth={5} />)}
          <rect x={1370} y={282} width={60} height={40} rx={4} fill={C.grimm} stroke={C.ink} strokeWidth={4} />
          <rect x={1366} y={484} width={70} height={30} fill={C.scroll} stroke={C.ink} strokeWidth={4} />
          <rect x={1372} y={668} width={56} height={44} rx={8} fill={C.clay} stroke={C.ink} strokeWidth={4} />
          <polygon points={`1290,${needle} 1250,${needle - 20} 1250,${needle + 20}`} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
      <TagPlate x={1440} y={790} text="もっと昔" size={36} t={seg(f, 30, 36)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #48 古代エジプトでは、敵の名前を書いた人形を、わざと割って埋める儀式がありました。
// 格: 山 / seed 4048
// 絵: 古代エジプトの神殿の中庭 (砂岩の柱・象形文字の帯 (読めない飾り)・強い日差し)。白い衣の神官 (Person、hair none) が、**ひもで縛られた素焼きの小さな人形** (胸に読めない文字の帯) を両手で掲げ、f で地面に打ちつけて割る (破片が飛ぶ)。足元に穴。札「古代エジプト」。※怖くしすぎない
// どこ: 古代エジプトの神殿の中庭。強い日差し・砂岩の柱 (パピルスの柱頭)・象形文字の帯 (読めない飾り)・奥に暗い門口。
// 演出: 白い衣の神官が、ひもで縛った素焼きの人形を胸の前に捧げ持ち、足元の穴へ投げ下ろして割る。かけらが穴のまわりに散る。
// 動き: f0〜12 人形を少し持ち上げる → f12〜18 放物線で穴へ → f18 割れて破片が飛び砂ぼこり。書記がのけぞり、猫が跳ねる。カメラ寄り+小さな揺れ。
const Nm048: React.FC<{ f: number }> = ({ f }) => {
  const PX = 880, PY = 800, PS = 1.3;
  const HX = 1270, HY = 792; // 穴
  const lift = easeOut(seg(f, 0, 12)) * 10 + Math.sin(f / 5) * 3 * (1 - seg(f, 20, 24));
  const thr = seg(f, 24, 30);
  const broke = f >= 30;
  const burst = seg(f, 30, 40);
  const dust = seg(f, 30, 50);
  const shake = f >= 30 && f < 35 ? Math.sin(f * 7) * 6 * (1 - seg(f, 30, 35)) : 0;
  const cam = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const figX = lerp(PX, HX, thr);
  const figY = lerp(PY - 118 * PS + 80 - lift, HY - 10, thr) - Math.sin(thr * Math.PI) * 130;
  const shards = [
    { dx: -120, dy: -2, i: 0, r: -20, band: false, head: true },
    { dx: -46, dy: 14, i: 2, r: 30, band: true, head: false },
    { dx: 36, dy: -6, i: 1, r: -40, band: false, head: false },
    { dx: 112, dy: 12, i: 3, r: 60, band: true, head: false },
    { dx: 176, dy: -18, i: 4, r: 10, band: false, head: false },
  ];
  return (
    <Frame f={f} seed={4048}>
      <g transform={`translate(${shake} 0) translate(1080 700) scale(${cam}) translate(-1080 -700)`}>
        {/* 空と太陽 */}
        <rect x={-60} y={-60} width={W + 120} height={360} fill={C.sky} />
        <g transform={`rotate(${f * 0.6} 1560 120)`}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={1560} y1={30} x2={1560} y2={-30} stroke={C.sun} strokeWidth={12} strokeLinecap="round" transform={`rotate(${i * 30} 1560 120) translate(0 -20)`} />
          ))}
        </g>
        <circle cx={1560} cy={120} r={70} fill={C.sun} stroke={C.ink} strokeWidth={5} />
        {/* 奥の壁 (砂岩) */}
        <rect x={-60} y={230} width={W + 120} height={420} fill={C.sst} stroke={C.ink} strokeWidth={6} />
        <g stroke={C.sstDark} strokeWidth={3}>
          {[420, 480, 540, 600].map((yy, k) => (
            <g key={yy}>
              <line x1={-60} y1={yy} x2={W + 60} y2={yy} />
              {Array.from({ length: 12 }, (_, j) => <line key={j} x1={j * 180 + (k % 2) * 90} y1={yy} x2={j * 180 + (k % 2) * 90} y2={yy + 60} />)}
            </g>
          ))}
        </g>
        {/* 象形文字の帯 (読めない飾り) */}
        <rect x={-60} y={288} width={W + 120} height={96} fill={C.sstLight} stroke={C.ink} strokeWidth={5} />
        <g stroke={C.glyph} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {Array.from({ length: 22 }, (_, i) => {
            const gx = 20 + i * 90, k = i % 5;
            return (
              <g key={i}>
                {k === 0 && <path d={`M ${gx} 336 q 22 -20 44 0 q -22 20 -44 0 M ${gx + 22} 336 l 0 0`} />}
                {k === 0 && <circle cx={gx + 22} cy={336} r={6} fill={C.glyph} />}
                {k === 1 && <path d={`M ${gx} 360 q 10 -40 30 -40 q 14 0 14 12 l -10 4 q 0 20 -20 24 Z`} />}
                {k === 2 && <path d={`M ${gx} 330 l 10 -8 l 10 8 l 10 -8 l 10 8 l 10 -8 M ${gx} 350 l 10 -8 l 10 8 l 10 -8 l 10 8 l 10 -8`} />}
                {k === 3 && <path d={`M ${gx + 4} 340 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0 M ${gx + 22} 322 l 0 -10 M ${gx + 12} 312 l 20 0`} />}
                {k === 4 && <path d={`M ${gx + 20} 362 q -22 -26 0 -50 q 22 24 0 50 Z M ${gx + 20} 362 l 0 -40 M ${gx + 44} 360 q 6 -10 0 -20 q -6 -10 0 -20`} />}
              </g>
            );
          })}
        </g>
        <rect x={-60} y={560} width={W + 120} height={20} fill={C.lapis} />
        <rect x={-60} y={580} width={W + 120} height={14} fill={KRP.red} opacity={0.8} />
        {/* 奥の門口 (暗い) */}
        <path d="M 760 650 L 760 420 L 1000 420 L 1000 650 Z" fill={C.shadow} stroke={C.ink} strokeWidth={6} />
        <rect x={740} y={398} width={280} height={30} fill={C.sstDark} stroke={C.ink} strokeWidth={5} />
        {/* 床 (砂岩の敷石) */}
        <rect x={-60} y={640} width={W + 120} height={500} fill={C.desert} stroke={C.ink} strokeWidth={6} />
        <g stroke={C.sstDark} strokeWidth={3} opacity={0.8}>
          {[700, 780, 880, 1000].map((yy) => <line key={yy} x1={-60} y1={yy} x2={W + 60} y2={yy} />)}
          {Array.from({ length: 11 }, (_, i) => <line key={i} x1={960 + (i - 5) * 140} y1={640} x2={960 + (i - 5) * 330} y2={1080} />)}
        </g>
        {/* 柱の影 (強い日差し) */}
        {[160, 1760].map((cx) => (
          <path key={cx} d={`M ${cx - 80} 760 L ${cx + 80} 760 L ${cx - 140} 1080 L ${cx - 380} 1080 Z`} fill={C.shadow} opacity={0.22} />
        ))}
        {/* 砂岩の柱 (パピルスの柱頭) */}
        {[160, 1760].map((cx) => (
          <g key={cx}>
            <rect x={cx - 80} y={220} width={160} height={540} fill={C.sst} stroke={C.ink} strokeWidth={7} />
            <rect x={cx - 80} y={220} width={36} height={540} fill={C.sstLight} opacity={0.7} />
            {[300, 560, 700].map((by) => (
              <g key={by}>
                <rect x={cx - 80} y={by} width={160} height={22} fill={C.lapis} stroke={C.ink} strokeWidth={4} />
                <rect x={cx - 80} y={by + 22} width={160} height={10} fill={KRP.red} />
              </g>
            ))}
            <path d={`M ${cx - 80} 220 Q ${cx - 150} 160 ${cx - 140} 100 L ${cx + 140} 100 Q ${cx + 150} 160 ${cx + 80} 220 Z`} fill={C.sstLight} stroke={C.ink} strokeWidth={7} />
            {[-90, -40, 10, 60].map((lx) => <path key={lx} d={`M ${cx + lx + 10} 210 Q ${cx + lx * 1.4} 150 ${cx + lx * 1.5 + 10} 104`} stroke={C.pine} strokeWidth={6} fill="none" />)}
            <rect x={cx - 150} y={70} width={300} height={34} fill={C.sstDark} stroke={C.ink} strokeWidth={6} />
            <rect x={cx - 100} y={760} width={200} height={26} fill={C.sstDark} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 足元の穴と掘った土 */}
        <ellipse cx={HX} cy={HY + 6} rx={150} ry={40} fill={C.sstDark} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={HX} cy={HY + 10} rx={124} ry={28} fill={C.shadow} />
        <path d={`M ${HX + 160} ${HY + 20} Q ${HX + 230} ${HY - 70} ${HX + 320} ${HY + 20} Z`} fill={C.sstDark} stroke={C.ink} strokeWidth={5} />
        <g transform={`translate(${HX + 250} ${HY - 30}) rotate(18)`}>
          <rect x={-8} y={-150} width={16} height={130} fill={C.benchEdge} stroke={C.ink} strokeWidth={4} />
          <path d="M -26 -24 L 26 -24 L 18 30 L -18 30 Z" fill={C.benchDark} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 書記 (巻物を抱えて見守る) */}
        <Person x={470} y={790} s={1.0} f={f} phase={3} cloth={C.priest} clothDark={C.priestDark} hair="none"
          face={broke ? "surprised" : "normal"} gaze={[6, 2]} lean={broke ? -6 * (1 - seg(f, 38, 48)) : 0} pose="hold" />
        <g transform={`translate(470 ${790 + bobOf(f, 3)})`}>
          <rect x={-40} y={-134} width={80} height={30} rx={8} fill={C.scroll} stroke={C.ink} strokeWidth={4} />
          <circle cx={-40} cy={-119} r={15} fill={C.scroll} stroke={C.ink} strokeWidth={4} />
          <circle cx={40} cy={-119} r={15} fill={C.scroll} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 神官 */}
        <Person x={PX} y={PY} s={PS} f={f} phase={0} cloth={C.priest} clothDark={C.priestDark} hair="none"
          face="normal" gaze={broke ? [8, 6] : [2, 6]} lean={thr > 0 && !broke ? 6 * thr : broke ? 6 * (1 - seg(f, 34, 44)) + 2 : 0} pose="hold" />
        <g transform={`translate(${PX} ${PY + bobOf(f, 0)}) scale(${PS})`}>
          {/* 胸飾り・腰帯 */}
          <path d="M -54 -160 Q 0 -100 54 -160" stroke={C.lapis} strokeWidth={14} fill="none" />
          <path d="M -44 -160 Q 0 -120 44 -160" stroke={KRP.brass} strokeWidth={8} fill="none" />
          <path d="M -48 -160 Q 0 -112 48 -160" stroke={KRP.red} strokeWidth={4} fill="none" />
          <rect x={-58} y={-82} width={116} height={14} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
          <path d="M -10 -68 L 10 -68 L 14 -20 L -14 -20 Z" fill={C.priestDark} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 人形 (割れる前) */}
        {!broke && <NB1cFigurine x={figX} y={figY} s={0.72} rot={thr * 160} />}
        {/* 割れた瞬間の光とはじけ線 */}
        {broke && burst < 0.5 && (
          <g opacity={1 - burst * 2} stroke={C.ink} strokeWidth={6} strokeLinecap="round">
            {Array.from({ length: 8 }, (_, i) => {
              const an = (i / 8) * Math.PI * 2;
              return <line key={i} x1={HX + Math.cos(an) * 60} y1={HY - 40 + Math.sin(an) * 40} x2={HX + Math.cos(an) * 120} y2={HY - 40 + Math.sin(an) * 80} />;
            })}
          </g>
        )}
        {broke && dust < 1 && (
          <g opacity={(1 - dust) * 0.85}>
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={HX + (i - 3) * 50 * (0.4 + dust)} cy={HY - 20 - dust * 50 - (i % 2) * 20} r={22 + dust * 30} fill={C.sstLight} stroke={C.sstDark} strokeWidth={3} />
            ))}
          </g>
        )}
        {/* 破片 */}
        {broke && shards.map((p, k) => {
          const t = easeOut(burst);
          const sx = HX + p.dx * t;
          const sy = HY - 30 + p.dy * t + 30 * t - Math.sin(t * Math.PI) * (90 + k * 14);
          return <NB1cShard key={k} x={sx} y={sy} s={1.2} i={p.i} rot={p.r * t * 2} band={p.band} head={p.head} />;
        })}
        {/* 猫 (割れた音で跳ねる) */}
        <g transform={`translate(660 ${800 - Math.sin(seg(f, 30, 40) * Math.PI) * 60}) scale(0.85)`}>
          <ellipse cx={0} cy={4 + Math.sin(seg(f, 30, 40) * Math.PI) * 60 / 0.85} rx={60} ry={10} fill={KRP.ink} opacity={0.2} />
          <path d="M -40 0 Q -50 -70 -10 -90 Q 20 -96 34 -70 Q 46 -30 40 0 Z" fill={C.cat} stroke={C.ink} strokeWidth={5} />
          <circle cx={6} cy={-118} r={30} fill={C.cat} stroke={C.ink} strokeWidth={5} />
          <path d="M -18 -136 L -14 -170 L 4 -146 Z M 14 -146 L 28 -170 L 32 -134 Z" fill={C.cat} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={-4} cy={-120} rx={5} ry={broke ? 9 : 6} fill={KRP.yellow} />
          <ellipse cx={18} cy={-120} rx={5} ry={broke ? 9 : 6} fill={KRP.yellow} />
          <path d={`M 36 -10 Q ${80 + Math.sin(f / 5) * 10} -40 ${70 + Math.sin(f / 5) * 10} -100`} stroke={C.cat} strokeWidth={12} fill="none" strokeLinecap="round" />
          <circle cx={6} cy={-82} r={7} fill={KRP.brass} stroke={C.ink} strokeWidth={2} />
        </g>
      </g>
      <TagPlate x={380} y={180} text="古代エジプト" size={40} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #49 名前を壊せば、相手も弱る。そう考えたのです。
// 格: 図 / seed 4049
// 絵: 割れた人形の破片 (文字の帯が割れている) と、遠くの敵の影が同時にふらつく図。破片から細い点線が遠くの影に伸び、影が f でしぼむ。神殿の石の床の上=世界。札「名前を壊す → 相手も弱る」(2枚の札と矢印)
// どこ: 同じ神殿の石の床 (前の文の続きの場所)。右に大きな門があり、その向こうは砂漠。
// 演出: 手前の床に、文字の帯ごと割れた人形のかけら。砂漠の遠くに立つ敵の黒い影。かけら→影へ点線が伸び、両方が同時にふらつき、影がしぼむ。
// 動き: f4〜16 点線が伸びる → f16〜 点線を波が伝わる。かけらがかたかた揺れ、影が左右によろめきながら f14〜40 で小さく薄く。札2枚と矢印が順に出る。
const Nm049: React.FC<{ f: number }> = ({ f }) => {
  const line = easeOut(seg(f, 4, 16));
  const weak = easeInOut(seg(f, 14, 40));
  const wob = Math.sin(f / 3) * (f > 12 ? 4 : 1);
  const es = 1.3 * (1 - 0.4 * weak);
  const EX = 1470, EY = 530;
  const A: [number, number] = [660, 560];
  const B: [number, number] = [EX, EY - 194 * es * 0.55];
  const cam = 1 + 0.03 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4049}>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        {/* 奥の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={600} fill={C.sst} />
        <g stroke={C.sstDark} strokeWidth={3}>
          {[80, 160, 240, 320, 400, 480].map((yy, k) => (
            <g key={yy}>
              <line x1={-60} y1={yy} x2={W + 60} y2={yy} />
              {Array.from({ length: 12 }, (_, j) => <line key={j} x1={j * 180 + (k % 2) * 90} y1={yy} x2={j * 180 + (k % 2) * 90} y2={yy + 80} />)}
            </g>
          ))}
        </g>
        <rect x={-60} y={150} width={W + 120} height={70} fill={C.sstLight} stroke={C.ink} strokeWidth={5} />
        <g stroke={C.glyph} strokeWidth={5} fill="none" opacity={0.55} strokeLinecap="round">
          {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${20 + i * 90} 200 q 14 -36 30 0 M ${36 + i * 90} 170 l 0 0`} />)}
        </g>
        {/* 門 (向こうは砂漠) */}
        <path d="M 1120 540 L 1150 120 L 1770 120 L 1800 540 Z" fill={C.sstDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={1220} y={200} width={480} height={360} fill={C.sky} stroke={C.ink} strokeWidth={6} />
        <clipPath id="nb1c-gate"><rect x={1220} y={200} width={480} height={360} /></clipPath>
        <g clipPath="url(#nb1c-gate)">
          <path d="M 1200 470 Q 1320 420 1460 460 Q 1600 500 1720 440 L 1720 580 L 1200 580 Z" fill={C.desert} stroke={C.ink} strokeWidth={4} />
          <path d="M 1200 520 Q 1400 480 1720 520 L 1720 580 L 1200 580 Z" fill={C.sstLight} stroke={C.ink} strokeWidth={3} />
          <path d="M 1580 460 L 1630 380 L 1680 460 Z" fill={C.sst} stroke={C.ink} strokeWidth={4} />
          {/* かげろう */}
          {[0, 1, 2].map((i) => <path key={i} d={`M 1240 ${430 + i * 30} q 40 ${Math.sin(f / 4 + i) * 6} 80 0 q 40 ${-Math.sin(f / 4 + i) * 6} 80 0`} stroke={KRP.white} strokeWidth={3} fill="none" opacity={0.5} />)}
        </g>
        <rect x={1130} y={92} width={660} height={40} fill={C.sst} stroke={C.ink} strokeWidth={6} />
        {/* 石の床 */}
        <rect x={-60} y={540} width={W + 120} height={600} fill={C.desert} stroke={C.ink} strokeWidth={6} />
        <g stroke={C.sstDark} strokeWidth={3} opacity={0.8}>
          {[600, 680, 790, 930].map((yy) => <line key={yy} x1={-60} y1={yy} x2={W + 60} y2={yy} />)}
          {Array.from({ length: 11 }, (_, i) => <line key={i} x1={960 + (i - 5) * 160} y1={540} x2={960 + (i - 5) * 360} y2={1080} />)}
        </g>
        {/* 門の向こうからの日差し */}
        <path d="M 1220 560 L 1700 560 L 1880 900 L 1100 900 Z" fill={C.sun} opacity={0.25} />
        {/* 敵の影 (遠く) */}
        <ellipse cx={EX} cy={EY + 4} rx={70 * es} ry={10} fill={KRP.ink} opacity={0.25 * (1 - weak * 0.5)} />
        {/* 元の大きさ (点線) */}
        <g opacity={0.6 * weak}>
          <PersonMini x={EX} y={EY} s={1.3} color="none" face="none" />
        </g>
        <g opacity={1 - weak * 0.2} transform={`rotate(${wob * 1.4 + weak * 8} ${EX} ${EY})`}>
          <PersonMini x={EX} y={EY} s={es} color={C.shadow} face="none" f={f} phase={2} />
        </g>
        {/* 弱っていく印 (汗の粒) */}
        {weak > 0.2 && [0, 1, 2].map((i) => {
          const t = ((f + i * 7) % 20) / 20;
          return <circle key={i} cx={EX + (i - 1) * 50 * es} cy={EY - 210 * es + t * 60} r={8} fill={KRP.blue} stroke={C.ink} strokeWidth={2} opacity={(1 - t) * weak} />;
        })}
        {/* かけら→影へ伸びる点線 */}
        {line > 0 && (
          <g>
            <path d={`M ${A[0]} ${A[1]} Q ${(A[0] + B[0]) / 2} ${Math.min(A[1], B[1]) - 160} ${lerp(A[0], B[0], 1)} ${B[1]}`}
              stroke={KRP.red} strokeWidth={7} fill="none" strokeDasharray="4 18" strokeLinecap="round"
              opacity={0.9}
              style={{ clipPath: `inset(0 ${100 - line * 100}% 0 0)` }} />
            {f > 16 && [0, 1].map((i) => {
              const u = ((f - 16 + i * 10) % 20) / 20;
              const qx = (1 - u) ** 2 * A[0] + 2 * (1 - u) * u * ((A[0] + B[0]) / 2) + u * u * B[0];
              const qy = (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * (Math.min(A[1], B[1]) - 160) + u * u * B[1];
              return <circle key={i} cx={qx} cy={qy} r={13} fill={KRP.red} stroke={C.ink} strokeWidth={3} />;
            })}
          </g>
        )}
        {/* 割れた人形のかけら (主役・大きく) */}
        <g transform={`rotate(${wob * 0.6} 560 640)`}>
          <ellipse cx={560} cy={700} rx={300} ry={40} fill={KRP.ink} opacity={0.15} />
          <NB1cShard x={430} y={640} s={2.2} i={0} rot={-14 + wob * 0.5} head />
          <NB1cShard x={590} y={610} s={2.4} i={2} rot={8 - wob * 0.4} band />
          <NB1cShard x={740} y={660} s={2.0} i={1} rot={30 + wob * 0.6} band />
          <NB1cShard x={540} y={712} s={1.4} i={3} rot={70} />
          <NB1cShard x={340} y={720} s={1.1} i={4} rot={-30} />
          {/* ひもの切れ端 */}
          <path d="M 640 700 q 40 -10 60 20 q 10 20 50 14" stroke={C.rope} strokeWidth={8} fill="none" strokeLinecap="round" />
          {/* ひび (割れた帯をまたぐ) */}
          <path d="M 620 560 l -14 26 l 16 16 l -12 30" stroke={C.ink} strokeWidth={5} fill="none" />
        </g>
      </g>
      <TagPlate x={540} y={790} text="名前を壊す" size={36} t={seg(f, 6, 12)} />
      <Arrow x={1120} y={785} s={0.9} t={seg(f, 14, 20)} />
      <TagPlate x={1450} y={790} text="相手も弱る" size={36} t={seg(f, 24, 30)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #50 名前を知る者は、相手をつかまえることができる。
// 格: 山 / seed 4050
// 絵: ★**名札の初登場**。からくりの作業台 (木の天板・工具・真鍮の部品) の上に、**`Nafuda` (text「山田 花子」) が吊るされている**。結び目は3つとも空 (まだ糸はない)。札の手前で、大きな**手** (人の手) が虫取り網を構え、名札を捕まえようとする (f で網がそっと近づく)。周りに第1章の小物 (糸車・小男の帽子・割れた人形のかけら) が並ぶ
// どこ: からくり工房の作業台 (#50〜#52 は同じ台の続き)。有孔ボードの壁、真鍮の吊り台、ランプの明かり。
// 演出: 吊り台に名札 (結び目3つは空)。左下から大きな手が虫取り網を構え、そっと名札に近づける。台の上に第1章の小物 (糸車・小男の帽子・人形のかけら)。
// 動き: 網が f0〜42 でゆっくり寄る (最後は名札の左端にかかる寸前)。名札は気づいたように小さく震え、ハッとした線が出る。糸車が回る。カメラ寄る。
const Nm050: React.FC<{ f: number }> = ({ f }) => {
  const NX = 960, NY = 410, NS = 1.15;
  const app = easeInOut(seg(f, 0, 42));
  const hx = lerp(280, 615, app), hy = lerp(300, 400, app) + Math.sin(f / 7) * 4;
  const nervous = seg(f, 26, 40);
  const cam = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const gx = hx - 330, gy = hy + 360; // 手の位置
  return (
    <Frame f={f} seed={4050}>
      <g transform={`translate(900 460) scale(${cam}) translate(-900 -460)`}>
        <NB1cBench top={640} />
        {/* ランプの明かり */}
        <ellipse cx={NX} cy={NY} rx={420} ry={300} fill={NP.glow} opacity={0.18} />
        {/* 真鍮の吊り台 */}
        <rect x={1180} y={626} width={200} height={26} rx={8} fill={NP.brassDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1268} y={170} width={24} height={460} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
        <rect x={NX - 10} y={166} width={330} height={22} rx={8} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
        <circle cx={1280} cy={177} r={14} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />
        <path d={`M ${NX} 188 L ${NX} ${NY - 152 * NS - 10} q 0 -2 0 0`} stroke={C.ink} strokeWidth={5} />
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" f={f} rot={Math.sin(f * 1.4) * 2.2 * nervous} />
        {/* ハッとした線 */}
        {nervous > 0 && [0, 1, 2].map((i) => (
          <line key={i} x1={NX + 250} y1={NY - 140 + i * 40} x2={NX + 250 + 50 * nervous} y2={NY - 160 + i * 40 - 10 * i} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={nervous} />
        ))}
        {/* 台の上の小物 */}
        <NB1cWheel x={1610} y={720} s={0.72} ang={f * 4} />
        <NB1cHat x={1290} y={770} s={0.85} rot={-6} />
        <NB1cShard x={720} y={760} s={1.1} i={1} rot={-20} band />
        <NB1cShard x={820} y={784} s={0.9} i={0} rot={30} head />
        <NB1cShard x={630} y={792} s={0.7} i={3} rot={50} />
        <NB1cGear x={470} y={790} r={34} ang={10} />
        <NB1cGear x={540} y={760} r={22} ang={30} teeth={8} />
        <g transform="translate(1000 800) rotate(-12)">
          <rect x={-90} y={-12} width={110} height={24} rx={10} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <rect x={20} y={-5} width={90} height={10} fill={KRP.silver} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 虫取り網 */}
        <g>
          {/* 柄 */}
          <line x1={hx - 110} y1={hy + 130} x2={gx - 60} y2={gy + 70} stroke={C.hoop} strokeWidth={22} strokeLinecap="round" />
          <line x1={hx - 110} y1={hy + 130} x2={gx - 60} y2={gy + 70} stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
          {/* 網の袋 (後ろにたれる) */}
          <path d={`M ${hx - 40} ${hy - 170} Q ${hx - 300} ${hy - 60 + Math.sin(f / 6) * 10} ${hx - 220} ${hy + 120} Q ${hx - 120} ${hy + 190} ${hx + 40} ${hy + 170}`}
            fill={KRP.white} opacity={0.55} stroke={C.net} strokeWidth={4} />
          <g stroke={C.net} strokeWidth={2.5} opacity={0.7}>
            {Array.from({ length: 6 }, (_, i) => (
              <path key={i} d={`M ${hx - 40 - i * 4} ${hy - 160 + i * 56} Q ${hx - 200 - i * 6} ${hy - 80 + i * 40} ${hx - 230 + i * 10} ${hy + 60 + i * 10}`} fill="none" />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <path key={i} d={`M ${hx - 120 - i * 30} ${hy - 120 + i * 20} L ${hx - 60 + i * 20} ${hy + 160 - i * 10}`} fill="none" />
            ))}
          </g>
          {/* 輪 */}
          <ellipse cx={hx} cy={hy} rx={120} ry={180} fill="none" stroke={C.hoop} strokeWidth={14} transform={`rotate(-18 ${hx} ${hy})`} />
          <ellipse cx={hx} cy={hy} rx={120} ry={180} fill="none" stroke={C.ink} strokeWidth={4} transform={`rotate(-18 ${hx} ${hy})`} />
        </g>
        {/* 大きな手 (袖から) */}
        <g transform={`translate(${gx} ${gy}) rotate(10)`}>
          <path d="M -60 40 L -240 260 L -60 360 L 70 110 Z" fill={C.sleeve} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -40 60 L -10 74 L 60 100" stroke={C.sleeveDark} strokeWidth={14} fill="none" />
          <rect x={-70} y={-60} width={140} height={120} rx={46} fill={C.skin} stroke={C.ink} strokeWidth={6} />
          {[-46, -16, 14, 44].map((fx, i) => (
            <rect key={i} x={fx - 15} y={-82 + Math.abs(i - 1.5) * 4} width={30} height={60} rx={15} fill={C.skin} stroke={C.ink} strokeWidth={5} />
          ))}
          <path d="M -70 0 Q -100 -20 -80 -60 Q -60 -70 -50 -40" fill={C.skin} stroke={C.ink} strokeWidth={5} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #51 だから人々は、こう考えるようになります。
// 格: 並 / seed 4051
// 絵: 作業台の上で、名札の前に人々の小さな人形 (古代の人・中世の人・昔の日本の人) が並んで、顔を見合わせて相談している。頭の上に電球がぽん (ひらめき)
// どこ: #50 と同じ作業台を、もっと低く寄って見る。奥に吊り台の名札。
// 演出: 名札の前に、台座つきの小さな人形が3体 (古代エジプトの人・中世ヨーロッパの人・昔の日本の人)。顔を見合わせて相談し、頭の上に電球がぽんぽんぽん。
// 動き: f2〜24 たがいに体を傾けて相談 (もやもやの吹き出し)。f26/30/34 に電球が順に点き、顔がぱっと明るくなる。カメラ少し下からせり上がる。
const NB1cBulb: React.FC<{ x: number; y: number; t: number; f: number }> = ({ x, y, t, f }) => {
  if (t <= 0) return null;
  const sc = pop(clamp01(t));
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <g opacity={0.6 + 0.4 * Math.sin(f / 3)}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={0} y1={-62} x2={0} y2={-84} stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 45} 0 0)`} />
        ))}
      </g>
      <circle cx={0} cy={0} r={46} fill={C.bulb} stroke={C.ink} strokeWidth={5} />
      <path d="M -12 10 Q -12 -14 0 -14 Q 12 -14 12 10" stroke={KRP.orange} strokeWidth={4} fill="none" />
      <path d="M -22 -18 Q -26 -30 -14 -34" stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" />
      <rect x={-20} y={40} width={40} height={26} rx={4} fill={KRP.silver} stroke={C.ink} strokeWidth={4} />
      <line x1={-20} y1={52} x2={20} y2={52} stroke={C.ink} strokeWidth={3} />
    </g>
  );
};
const Nm051: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 0, 30));
  const talk = seg(f, 2, 10) * (1 - seg(f, 24, 30));
  const b1 = seg(f, 26, 32), b2 = seg(f, 30, 36), b3 = seg(f, 34, 40);
  const lit = f >= 34;
  const DY = 800, DS = 0.9;
  const faceOf = (b: number) => (b > 0.4 ? "joy" : b > 0 ? "surprised" : "worried") as "joy" | "surprised" | "worried";
  const mumble = (x: number, y: number, ph: number) => talk > 0.05 && (
    <g opacity={talk}>
      <ellipse cx={x} cy={y} rx={54} ry={34} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      <path d={`M ${x - 28} ${y} q 10 ${-12 + Math.sin(f / 3 + ph) * 6} 20 0 q 10 12 20 0 q 10 -12 20 0`} stroke={C.ink} strokeWidth={4} fill="none" />
      <circle cx={x - 30} cy={y + 46} r={8} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
    </g>
  );
  return (
    <Frame f={f} seed={4051}>
      <g transform={`translate(0 ${lerp(40, 0, rise)}) translate(960 560) scale(1.08) translate(-960 -560)`}>
        <NB1cBench top={560} />
        <ellipse cx={960} cy={300} rx={380} ry={220} fill={NP.glow} opacity={0.16} />
        {/* 吊り台と名札 (奥) */}
        <rect x={1300} y={120} width={22} height={440} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
        <rect x={950} y={116} width={372} height={20} rx={8} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
        <line x1={960} y1={136} x2={960} y2={230 - 152 * 0.9} stroke={C.ink} strokeWidth={5} />
        <Nafuda x={960} y={230} s={0.9} text="山田 花子" f={f} />
        {/* 台の上の小物 (端) */}
        <NB1cWheel x={1760} y={700} s={0.6} ang={f * 3} />
        <NB1cHat x={240} y={760} s={0.7} rot={8} />
        <g transform="translate(1560 800) rotate(8)">
          <rect x={-110} y={-10} width={220} height={20} rx={4} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          <polygon points="110,-10 140,0 110,10" fill={C.wallDark} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 3体の人形 (相談 → ひらめき) */}
        <NB1cDoll kind="ancient" x={590} y={DY} s={DS} f={f} phase={1} face={faceOf(b1)} lean={8 * talk + (lit ? Math.sin(f / 4) * 3 : 0)} gaze={[6, 0]} />
        <NB1cDoll kind="medieval" x={960} y={DY} s={DS} f={f} phase={2} face={faceOf(b2)} lean={Math.sin(f / 5) * 5 * talk} gaze={[Math.sin(f / 6) > 0 ? 6 : -6, 0]} />
        <NB1cDoll kind="edo" x={1330} y={DY} s={DS} f={f} phase={3} face={faceOf(b3)} lean={-8 * talk + (lit ? Math.sin(f / 4 + 1) * 3 : 0)} gaze={[-6, 0]} />
        {mumble(775, 470, 0)}
        {mumble(1145, 450, 2)}
        <NB1cBulb x={590} y={440} t={b1} f={f} />
        <NB1cBulb x={960} y={418} t={b2} f={f} />
        <NB1cBulb x={1330} y={440} t={b3} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #52 本当の名前は、隠しておこう。
// 格: 山 / seed 4052
// 絵: 名札が f で**木の小箱**にそっとしまわれ、ふたが閉まり、上から布がかけられる。人形たちが「しーっ」と口に指を当てる。箱には鍵穴。作業台の上に、次章の伏線の小物 (中国の筆・平安の扇) が置いてある
// どこ: #50・#51 と同じ作業台。ランプを少し落とした静かな明かり。台の上に次章の伏線 (中国の筆と筆置き・平安の檜扇)。
// 演出: 指先につままれた名札が木の小箱にそっと下ろされ、ふたが閉まり、上から紫の布がふわりとかかる。箱の正面に真鍮の鍵穴。人形たちが口に指を当てて「しーっ」。
// 動き: f2〜18 名札が下りる → f18〜26 ふたが閉まる → f26〜36 布が落ちてかぶさる。f28〜40 人形が順に指を口へ。ランプの明かりがゆっくり落ちる。カメラ寄る。
const Nm052: React.FC<{ f: number }> = ({ f }) => {
  const down = easeInOut(seg(f, 2, 18));
  const close = easeInOut(seg(f, 18, 26));
  const drop = easeOut(seg(f, 26, 36));
  const settle = Math.sin(seg(f, 34, 42) * Math.PI) * 8;
  const dim = seg(f, 20, 42);
  const cam = 1.1 + 0.07 * easeOut(seg(f, 0, 42));
  const ny = lerp(300, 640, down);
  const handUp = easeInOut(seg(f, 18, 28));
  const lidY = lerp(320, 560, close); // ふたの手前の辺
  const lidX = lerp(60, 0, close);
  const lid = (
    <polygon points={`760,500 1280,500 ${1220 + lidX},${lidY} ${700 + lidX},${lidY}`} fill={C.box} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  );
  return (
    <Frame f={f} seed={4052}>
      <g transform={`translate(960 640) scale(${cam}) translate(-960 -640)`}>
        <NB1cBench top={640} />
        {/* ランプの明かり (ゆっくり落ちる) */}
        <ellipse cx={980} cy={520} rx={520} ry={330} fill={NP.glow} opacity={0.22 - dim * 0.1} />
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.shadow} opacity={dim * 0.16} />
        {/* 箱の影と中 (ふたが開いている間) */}
        <ellipse cx={990} cy={792} rx={330} ry={26} fill={KRP.ink} opacity={0.25} />
        <polygon points="700,560 760,500 1280,500 1220,560" fill={C.boxDark} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <polygon points="716,556 766,510 1266,510 1214,556" fill={C.shadow} />
        {/* ふた (開いている間は名札の奥) */}
        {close < 0.5 && lid}
        {/* 名札 (つまんで下ろす) */}
        <g>
          <line x1={980} y1={ny - 152 * 0.72} x2={980} y2={lerp(-40, ny - 210, 1) - handUp * 300} stroke={C.ink} strokeWidth={4} opacity={1 - handUp} />
          <Nafuda x={980} y={ny} s={0.72} text="山田 花子" f={f} />
        </g>
        {/* 指先 (上から) */}
        <g opacity={1 - handUp} transform={`translate(980 ${ny - 190 - handUp * 700})`}>
          <path d="M -60 -500 L -40 -40 L 50 -40 L 80 -500 Z" fill={C.sleeve} stroke={C.ink} strokeWidth={6} />
          <rect x={-46} y={-60} width={96} height={70} rx={30} fill={C.skin} stroke={C.ink} strokeWidth={5} />
          <rect x={-22} y={-4} width={22} height={44} rx={11} fill={C.skin} stroke={C.ink} strokeWidth={4} />
          <rect x={2} y={-4} width={22} height={40} rx={11} fill={C.skin} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 箱の正面 */}
        <rect x={700} y={560} width={520} height={226} fill={C.box} stroke={C.ink} strokeWidth={7} />
        <polygon points="1220,560 1280,500 1280,726 1220,786" fill={C.boxDark} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <g stroke={C.boxDark} strokeWidth={4} opacity={0.7} fill="none">
          <path d="M 720 610 q 120 -10 240 0 q 120 10 240 0" /><path d="M 720 690 q 120 8 240 0 q 120 -8 240 0" />
        </g>
        {[[716, 576], [1204, 576], [716, 770], [1204, 770]].map(([cx, cy], i) => (
          <path key={i} d={`M ${cx - 14} ${cy - 14} l 28 0 l 0 28 l -28 0 Z`} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
        ))}
        {/* 真鍮の鍵穴 */}
        <g transform="translate(960 704)">
          <path d="M 0 -50 Q 40 -50 40 0 Q 40 50 0 56 Q -40 50 -40 0 Q -40 -50 0 -50 Z" fill={NP.brass} stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={-8} r={12} fill={C.ink} />
          <path d="M -6 -2 L -10 28 L 10 28 L 6 -2 Z" fill={C.ink} />
          <circle cx={-22} cy={-30} r={4} fill={C.ink} /><circle cx={22} cy={-30} r={4} fill={C.ink} />
        </g>
        {/* ふた (閉じかけてから手前に描く) */}
        {close >= 0.5 && lid}
        {close > 0.95 && <rect x={700} y={552} width={520} height={16} fill={C.boxDark} stroke={C.ink} strokeWidth={4} />}
        <rect x={980} y={492} width={60} height={16} rx={4} fill={NP.brassDark} stroke={C.ink} strokeWidth={3} />
        {close > 0.98 && drop < 0.02 && [0, 1, 2].map((i) => (
          <line key={i} x1={700 - 20 - i * 10} y1={540 - i * 24} x2={660 - i * 20} y2={520 - i * 36} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        ))}
        {/* 紫の布 (上から落ちてかぶさる) */}
        {drop > 0 && (
          <g transform={`translate(0 ${lerp(-520, 0, drop) + settle * (1 - drop * 0.5)})`}>
            <path d={`M 676 ${600 + Math.sin(f / 5) * 4} Q 690 520 740 492 L 1290 486 Q 1316 520 1300 620
              Q 1270 ${640 + Math.sin(f / 6) * 6} 1240 630 Q 1180 ${650 + Math.sin(f / 5) * 4} 1120 636 Q 1040 ${656} 960 640 Q 880 ${660} 800 640 Q 740 ${652} 676 ${600 + Math.sin(f / 5) * 4} Z`}
              fill={C.furo} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 760 500 Q 820 560 800 636 M 1120 492 Q 1160 560 1120 632" stroke={C.furoDark} strokeWidth={6} fill="none" />
            {/* 布の模様 (唐草風の丸) */}
            {[[880, 540], [1010, 570], [1150, 530], [960, 610], [1230, 590]].map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r={14} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
            ))}
          </g>
        )}
        {/* 次章の伏線: 中国の筆と筆置き・平安の檜扇 */}
        <g transform="translate(860 812) rotate(-6)">
          <path d="M -110 -16 q 20 -20 40 0 q 20 -20 40 0" fill={C.stoneDark} stroke={C.ink} strokeWidth={4} />
          <rect x={-150} y={-30} width={200} height={16} rx={8} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <rect x={46} y={-30} width={20} height={16} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
          <path d="M 66 -30 Q 120 -22 66 -14 Z" fill={C.brushTip} stroke={C.ink} strokeWidth={3} />
        </g>
        <g transform="translate(1290 784) scale(0.7) rotate(25)">
          {Array.from({ length: 9 }, (_, i) => {
            const an = -150 + i * 15;
            return <path key={i} d={`M 0 0 L ${Math.cos((an * Math.PI) / 180) * 150} ${Math.sin((an * Math.PI) / 180) * 150} L ${Math.cos(((an + 15) * Math.PI) / 180) * 150} ${Math.sin(((an + 15) * Math.PI) / 180) * 150} Z`}
              fill={i % 2 ? C.fan : KRP.white} stroke={C.ink} strokeWidth={3} />;
          })}
          <path d="M -130 -75 A 150 150 0 0 1 75 -130" stroke={C.fanDark} strokeWidth={6} fill="none" />
          <circle r={10} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
          <path d={`M 0 0 q -20 40 ${-10 + Math.sin(f / 6) * 6} 70`} stroke={KRP.red} strokeWidth={5} fill="none" />
        </g>
        {/* 人形たち「しーっ」 */}
        {([["ancient", 360, 1], ["edo", 560, 2], ["medieval", 1500, 3]] as [DollKind, number, number][]).map(([k, x, ph], i) => {
          const sh = easeOut(seg(f, 28 + i * 3, 34 + i * 3));
          return (
            <g key={k}>
              <NB1cDoll kind={k} x={x} y={800} s={0.8} f={f} phase={ph} face={sh > 0.5 ? "smile" : "normal"} gaze={[x < 960 ? 6 : -6, 2]} shh={sh} lean={x < 960 ? 4 * sh : -4 * sh} />
              {sh > 0.8 && [0, 1].map((j) => (
                <path key={j} d={`M ${x + (x < 960 ? 50 : -50) + (x < 960 ? j * 18 : -j * 18)} ${800 - 150} q ${x < 960 ? 10 : -10} 14 0 28`}
                  stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 3 + j)} />
              ))}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_045: (f) => <Nm045 f={f} />,
  nm_046: (f) => <Nm046 f={f} />,
  nm_047: (f) => <Nm047 f={f} />,
  nm_048: (f) => <Nm048 f={f} />,
  nm_049: (f) => <Nm049 f={f} />,
  nm_050: (f) => <Nm050 f={f} />,
  nm_051: (f) => <Nm051 f={f} />,
  nm_052: (f) => <Nm052 f={f} />,
};

export const NM_B1C_MOTIFS: string[] = [
  "nm_045", // #45
  "nm_046", // #46
  "nm_047", // #47
  "nm_048", // #48
  "nm_049", // #49
  "nm_050", // #50
  "nm_051", // #51
  "nm_052", // #52
];

export const namaeB1cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
