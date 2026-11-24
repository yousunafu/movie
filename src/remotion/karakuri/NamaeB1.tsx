// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#27〜#35 (9文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  // 登場人物
  maid: "#7FA6C9", maidDark: "#5A7FA3",
  queen: "#B8434E", queenDark: "#8E2F3A",
  kobito: "#5E7D3E", kobitoDark: "#3F5A27", hat: "#9A4A2A", hatDark: "#6E3018",
  king: "#6B3F8C", kingDark: "#4B2A66",
  envoy: "#8C6A3F", envoyDark: "#664A28",
  grimm: "#2F3B5C", grimmDark: "#1F2840",
  hairBrown: "#6B4A32", hairDark: "#4A3626",
  nose: "#E8A08A", pale: "#7FA0C8",
  // 木と紙
  wood: "#A9773F", woodDark: "#7A5228", woodLight: "#C9955A",
  desk: "#6E4A2A", deskDark: "#4E321A",
  page: "#EFE3C2", pageDark: "#DCCB9E", pageEdge: "#C9B57F",
  parch: "#E9D9AE", parchDark: "#C7AE74",
  leather: "#7A3B22", leatherDark: "#55260F",
  // わらと金
  straw: "#D8BE6E", strawDark: "#B39B4E", strawLight: "#EED98E",
  gold: "#E8B828", goldLight: "#FFE27A", goldDeep: "#B8860B",
  // 石の部屋
  stone: "#A8A196", stoneDark: "#857E73", stoneLight: "#C4BDB1",
  stoneNight: "#4E5468", stoneNightDark: "#3A3F52",
  // 夜と森
  night: "#1E2A44", nightDeep: "#141C30", nightMid: "#2E3D5E",
  tree: "#1A2232", treeMid: "#26344A", leaf: "#2C4A3A", leafDark: "#1D3328",
  moon: "#F6EBC0", fire: "#F28C28", fireCore: "#FFD966",
  silhouette: "#101522",
  // 寝室
  wall: "#C9A58A", wallDark: "#A9856A", curtain: "#7A2E3E", curtainDark: "#5A1E2C",
  bedSheet: "#F3EAD8", rug: "#8C3A3A", rugDark: "#6A2828",
  wallNight: "#5A4A5E", wallNightDark: "#433648",
  candle: "#F5EFD8",
  owl: "#8A6A48", owlDark: "#5E4630",
  calPaper: "#FBF6EA",
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

type PFace = React.ComponentProps<typeof Person>["face"];
type PPose = React.ComponentProps<typeof Person>["pose"];

// 小男 (ルンペルシュティルツキン): Person を小さく + とんがり帽子 + 白い長いひげ。
// hop>0 で片足ぴょんぴょん (体が少し傾いて跳ねる)。x,y は着地点。
const NB1Kobito: React.FC<{
  x: number; y: number; s?: number; f: number; face?: PFace; pose?: PPose;
  hop?: number; lean?: number; phase?: number; gaze?: [number, number];
  sing?: boolean; pointDir?: 1 | -1; dark?: boolean;
}> = ({ x, y, s = 0.62, f, face = "smile", pose = "stand", hop = 0, lean = 0,
  phase = 0, gaze = [0, 0], sing = false, pointDir = 1, dark = false }) => {
  const ph = Math.abs(Math.sin((f + phase * 7) / 5));
  const h = hop * ph * 46 * s;
  const tilt = hop ? Math.sin((f + phase * 7) / 5) * 5 : 0;
  return (
    <g>
      {/* 床の影 (跳ぶと小さく薄く) */}
      <ellipse cx={x} cy={y - 2} rx={(70 - ph * hop * 20) * s} ry={14 * s}
        fill={dark ? "#000" : KRP.ink} opacity={0.22 - ph * hop * 0.08} />
      <g transform={`translate(${x} ${y - h}) rotate(${lean + tilt})`}>
        <Person x={0} y={0} s={s} f={f} face={face} pose={pose} cloth={C.kobito}
          clothDark={C.kobitoDark} hair="none" still gaze={gaze} phase={phase} pointDir={pointDir} />
        <g transform={`scale(${s})`}>
          {/* 片足を上げた印: 浮いた足の下に小さな跳ね線 */}
          {hop > 0 && ph > 0.5 && (
            <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.6}>
              <line x1={-44} y1={14} x2={-60} y2={30} />
              <line x1={0} y1={20} x2={0} y2={40} />
              <line x1={44} y1={14} x2={60} y2={30} />
            </g>
          )}
          {/* 白いひげ */}
          <path d="M -50 -208 Q -58 -150 -26 -92 Q -6 -58 4 -60 Q 16 -64 26 -96 Q 56 -150 50 -208 Q 26 -190 0 -192 Q -26 -190 -50 -208 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.grayDark} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7}>
            <path d="M -24 -176 Q -30 -140 -14 -104" />
            <path d="M 0 -180 Q 4 -130 2 -84" />
            <path d="M 24 -176 Q 30 -140 14 -104" />
          </g>
          {/* 口ひげ */}
          <path d="M -34 -196 Q -16 -210 0 -198 Q 16 -210 34 -196 Q 16 -186 0 -192 Q -16 -186 -34 -196 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {sing && (
            <ellipse cx={0} cy={-178} rx={11} ry={9 + Math.abs(Math.sin(f / 3)) * 6}
              fill={KRP.ink} />
          )}
          {/* 赤い鼻 */}
          <circle cx={0} cy={-204} r={10} fill={C.nose} stroke={KRP.ink} strokeWidth={4} />
          {/* とんがり帽子 (先が少し折れる) */}
          <path d="M -60 -258 Q -30 -330 18 -400 Q 34 -430 66 -428 Q 44 -414 40 -392 Q 54 -320 62 -258 Z"
            fill={C.hat} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
          <path d="M -50 -286 Q 0 -300 56 -284 L 58 -268 Q 0 -284 -54 -270 Z" fill={C.hatDark} />
          <ellipse cx={0} cy={-260} rx={78} ry={15} fill={C.hat} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={66} cy={-428} r={9} fill={C.goldLight} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    </g>
  );
};

// 冠 (Person の座標系。<g transform="translate(x y) scale(s)"> の中に置く)
const NB1Crown: React.FC<{ big?: boolean }> = ({ big }) => {
  const k = big ? 1.25 : 0.8;
  return (
    <g transform={`translate(0 -282) scale(${k})`}>
      <path d="M -46 0 L -50 -44 L -26 -20 L 0 -54 L 26 -20 L 50 -44 L 46 0 Z"
        fill={C.gold} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-48} y={-10} width={96} height={14} rx={4} fill={C.goldDeep} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-26} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={-50} cy={-46} r={5} fill={C.goldLight} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={50} cy={-46} r={5} fill={C.goldLight} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

// 白い三角巾 (Person の座標系)
const NB1Kerchief: React.FC = () => (
  <g>
    <path d="M -68 -232 Q -74 -302 0 -304 Q 74 -302 68 -232 Q 34 -262 0 -262 Q -34 -262 -68 -232 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 58 -250 L 92 -236 L 70 -222 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 58 -250 L 86 -266 L 78 -240 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <g stroke={C.maidDark} strokeWidth={3} opacity={0.5}>
      <line x1={-40} y1={-284} x2={-30} y2={-268} />
      <line x1={10} y1={-292} x2={14} y2={-272} />
    </g>
  </g>
);

// 後頭部 (顔を隠す。Person の座標系)
const NB1BackHead: React.FC<{ hair: string; long?: boolean }> = ({ hair, long }) => (
  <g>
    <ellipse cx={-64} cy={-222} rx={9} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={64} cy={-222} rx={9} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={0} cy={-228} r={66} fill={hair} stroke={KRP.ink} strokeWidth={5.5} />
    {long && <path d="M -60 -220 Q -66 -150 -40 -120 L 40 -120 Q 66 -150 60 -220 Z" fill={hair} stroke={KRP.ink} strokeWidth={5} />}
    <g stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.45} strokeLinecap="round">
      <path d="M -30 -280 Q -40 -240 -36 -196" />
      <path d="M 0 -290 Q 4 -240 0 -178" />
      <path d="M 30 -280 Q 42 -240 34 -196" />
    </g>
  </g>
);

// 糸車 (x,y は床の接地点の中央)。rot=車輪の回転角, bobbin=0〜1 で糸巻きが太る
const NB1Wheel: React.FC<{
  x: number; y: number; s?: number; rot: number; bobbin?: number; gold?: boolean; blur?: number; night?: boolean;
}> = ({ x, y, s = 1, rot, bobbin = 0.2, gold = false, blur = 0, night = false }) => {
  const wd = night ? "#6A4A2E" : C.wood;
  const wdk = night ? "#4A321E" : C.woodDark;
  const R = 165;
  const cx = 70, cy = -340;
  const br = 12 + bobbin * 44;
  const thread = gold ? C.gold : C.straw;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={250} ry={22} fill={KRP.ink} opacity={0.2} />
      {/* 3本脚 */}
      {([[-200, -150, -220, 0], [-80, -160, -70, 0], [180, -190, 210, 0]] as const).map(([x1, y1, x2, y2], i) => (
        <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={KRP.ink} strokeWidth={26} strokeLinecap="round" />
      ))}
      {([[-200, -150, -220, 0], [-80, -160, -70, 0], [180, -190, 210, 0]] as const).map(([x1, y1, x2, y2], i) => (
        <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={wd} strokeWidth={17} strokeLinecap="round" />
      ))}
      {/* 踏み板と連接棒 */}
      <rect x={-40} y={-30} width={170} height={20} rx={6} fill={wdk} stroke={KRP.ink} strokeWidth={4.5}
        transform={`rotate(${Math.sin(rot * Math.PI / 180) * 4} -40 -20)`} />
      <line x1={110} y1={-24} x2={cx + Math.cos(rot * Math.PI / 180) * 40} y2={cy + Math.sin(rot * Math.PI / 180) * 40}
        stroke={KRP.ink} strokeWidth={7} />
      {/* 台 (斜めの板) */}
      <path d="M -250 -150 L 230 -200 L 236 -170 L -246 -118 Z" fill={wd} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -236 -140 L 220 -188" stroke={wdk} strokeWidth={3} opacity={0.6} />
      {/* 車輪の支柱 */}
      <path d={`M 20 -175 L ${cx - 10} ${cy}`} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
      <path d={`M 20 -175 L ${cx - 10} ${cy}`} stroke={wd} strokeWidth={13} strokeLinecap="round" />
      <path d={`M 130 -186 L ${cx + 10} ${cy}`} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
      <path d={`M 130 -186 L ${cx + 10} ${cy}`} stroke={wd} strokeWidth={13} strokeLinecap="round" />
      {/* 車輪 */}
      <g transform={`translate(${cx} ${cy})`}>
        {blur > 0 && <circle r={R - 20} fill={wd} opacity={0.25 * blur} />}
        <g transform={`rotate(${rot})`}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={0} x2={Math.cos(i * Math.PI / 6) * (R - 10)} y2={Math.sin(i * Math.PI / 6) * (R - 10)}
              stroke={wdk} strokeWidth={9} opacity={1 - blur * 0.6} />
          ))}
          {/* 回っているのが分かる印 (1本だけ色の違うスポーク) */}
          <line x1={0} y1={0} x2={R - 10} y2={0} stroke={KRP.red} strokeWidth={9} opacity={1 - blur * 0.5} />
        </g>
        {blur > 0 && Array.from({ length: 3 }, (_, i) => (
          <path key={i} d={`M ${(R - 40 - i * 30)} 0 A ${R - 40 - i * 30} ${R - 40 - i * 30} 0 0 1 0 ${R - 40 - i * 30}`}
            transform={`rotate(${rot * 0.5 + i * 120})`} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.6 * blur} strokeLinecap="round" />
        ))}
        <circle r={R} fill="none" stroke={KRP.ink} strokeWidth={30} />
        <circle r={R} fill="none" stroke={wd} strokeWidth={20} />
        <circle r={R - 6} fill="none" stroke={wdk} strokeWidth={3} />
        <circle r={22} fill={wdk} stroke={KRP.ink} strokeWidth={5} />
        <circle r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 糸巻き (フライヤー) の柱 */}
      <rect x={-232} y={-290} width={22} height={146} rx={6} fill={wd} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-120} y={-290} width={22} height={160} rx={6} fill={wd} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={-221} cy={-296} r={14} fill={wdk} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={-109} cy={-296} r={14} fill={wdk} stroke={KRP.ink} strokeWidth={4} />
      {/* 駆動の糸 (車輪→糸巻き) */}
      <path d={`M ${cx} ${cy - R} L -165 ${-262 - br * 0.3} M ${cx} ${cy + R} L -165 ${-238 + br * 0.3}`}
        stroke={KRP.ink} strokeWidth={2.5} opacity={0.6} fill="none" />
      {/* 糸巻き */}
      <rect x={-210} y={-250 - br} width={90} height={br * 2} rx={br * 0.6}
        fill={thread} stroke={KRP.ink} strokeWidth={4.5} />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={-202 + i * 18} y1={-250 - br + 4} x2={-196 + i * 18} y2={-250 + br - 4}
          stroke={gold ? C.goldDeep : C.strawDark} strokeWidth={3} />
      ))}
      {gold && <rect x={-200} y={-250 - br + 4} width={30} height={6} rx={3} fill={C.goldLight} opacity={0.9} />}
      <rect x={-226} y={-256} width={122} height={12} rx={6} fill={wdk} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

// わらの山 (x,y は床の接地点の中央)
const NB1Straw: React.FC<{ x: number; y: number; w: number; h: number; seed: number; night?: boolean; f?: number }> = ({ x, y, w, h, seed, night, f = 0 }) => {
  const base = night ? "#8C7A48" : C.straw;
  const dk = night ? "#6A5A32" : C.strawDark;
  const lt = night ? "#A89458" : C.strawLight;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-w / 2} 0 Q ${-w * 0.42} ${-h * 0.9} ${-w * 0.1} ${-h} Q ${w * 0.2} ${-h * 1.05} ${w * 0.4} ${-h * 0.7} Q ${w * 0.52} ${-h * 0.3} ${w / 2} 0 Z`}
        fill={base} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {Array.from({ length: Math.round(w / 9) }, (_, i) => {
        const px = (rnd(seed, i) - 0.5) * w * 0.85;
        const top = -h * (1 - Math.pow(Math.abs(px) / (w / 2), 2)) * (0.3 + rnd(seed + 1, i) * 0.7);
        const ang = (rnd(seed + 2, i) - 0.5) * 70;
        const len = 30 + rnd(seed + 3, i) * 50;
        const sway = Math.sin(f / 14 + i) * 1.5;
        return (
          <line key={i} x1={px} y1={top} x2={px + Math.sin((ang + sway) * Math.PI / 180) * len}
            y2={top - Math.cos((ang + sway) * Math.PI / 180) * len * 0.5}
            stroke={i % 3 === 0 ? lt : dk} strokeWidth={i % 3 === 0 ? 5 : 3.5} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

// 金の糸のかせ (束ねた金の糸)
const NB1Skein: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number }> = ({ x, y, s = 1, rot = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow > 0 && <ellipse rx={90} ry={50} fill={C.goldLight} opacity={0.35 * glow} />}
    <ellipse rx={64} ry={30} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
    <ellipse rx={34} ry={13} fill={C.goldDeep} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -54 -10 Q 0 -28 54 -10" fill="none" stroke={C.goldLight} strokeWidth={5} strokeLinecap="round" />
    <rect x={-8} y={-32} width={16} height={64} rx={5} fill={C.goldDeep} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// きらめき (4方向の星)
const NB1Spark: React.FC<{ x: number; y: number; r: number; o?: number; color?: string }> = ({ x, y, r, o = 1, color = C.goldLight }) => (
  <path d={`M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`}
    fill={color} stroke={KRP.ink} strokeWidth={3} opacity={o} />
);

// 音符
const NB1Note: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number; two?: boolean }> = ({ x, y, s = 1, o = 1, rot = 0, two }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={16} ry={12} transform="rotate(-20)" fill={C.goldLight} stroke={KRP.ink} strokeWidth={4} />
    <line x1={13} y1={-4} x2={13} y2={-56} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    {two ? (
      <g>
        <ellipse cx={46} cy={-8} rx={16} ry={12} transform="rotate(-20 46 -8)" fill={C.goldLight} stroke={KRP.ink} strokeWidth={4} />
        <line x1={59} y1={-12} x2={59} y2={-64} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M 13 -56 L 59 -64 L 59 -52 L 13 -44 Z" fill={KRP.ink} />
      </g>
    ) : (
      <path d="M 13 -56 Q 34 -46 30 -24" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    )}
  </g>
);

// 炎 (たき火・ろうそく共用)。x,y は根元
const NB1Flame: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number }> = ({ x, y, s = 1, f, phase = 0 }) => {
  const w1 = Math.sin((f + phase) / 3) * 6;
  const w2 = Math.sin((f + phase) / 4.3 + 1) * 5;
  const hh = 1 + Math.sin((f + phase) / 5) * 0.08;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * hh})`}>
      <path d={`M -40 0 Q -52 -50 ${-14 + w1} -90 Q -6 -60 4 -70 Q ${10 + w2} -110 ${2 + w1} -140 Q 40 -90 46 -40 Q 50 -10 40 0 Z`}
        fill={C.fire} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M -20 0 Q -26 -34 ${-4 + w2} -62 Q 6 -40 12 -54 Q 26 -30 22 0 Z`} fill={C.fireCore} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #27 第1章、名前を当てたら、あなたの勝ち。
// 格: 山 / seed 4027
// 絵: 章扉。夜の森の奥に、たき火の光。木の幹のあいだに、とんがり帽子の小さな影が片足で跳ねている (まだ姿ははっきりさせない)。古いドイツの絵本の見開きの上=世界 (本のノド・紙の黄ばみ・ページの端)。`ChapterDoor` (num=1)。題字の後ろに薄いクリームの帯
// どこ: 机の上に開いた古いドイツの絵本の見開き。挿絵は夜の森 (左ページ〜ノドをまたぐ)
// 演出: 森の奥のたき火と、木の幹のあいだで片足で跳ねるとんがり帽子の小さな黒い影。右ページに章題
// 動き: カメラがたき火へゆっくり寄る / 火がゆらぎ火の粉が昇る / 影がぴょんぴょん跳ねる / ページの角がめくれかける
const NB1Silhouette: React.FC<{ x: number; y: number; s: number; f: number; rim?: string }> = ({ x, y, s, f, rim }) => {
  const ph = Math.abs(Math.sin(f / 5));
  const h = ph * 26;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={46 * s * (1 - ph * 0.3)} ry={8 * s} fill="#000" opacity={0.35} />
      <g transform={`translate(${x} ${y - h * s}) scale(${s}) rotate(${Math.sin(f / 5) * 6})`} fill={C.silhouette}>
        {/* 立ち足と、曲げて上げた足 */}
        <rect x={-14} y={-64} width={16} height={64} rx={6} />
        <path d="M 6 -62 L 30 -40 L 18 -22 L 34 -18" stroke={C.silhouette} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x={-34} y={-140} width={68} height={84} rx={18} />
        {/* 振り上げた腕 */}
        <path d="M -28 -128 L -62 -170" stroke={C.silhouette} strokeWidth={14} strokeLinecap="round" />
        <path d="M 28 -126 L 58 -96" stroke={C.silhouette} strokeWidth={14} strokeLinecap="round" />
        <circle cx={0} cy={-168} r={34} />
        {/* ひげ */}
        <path d="M -24 -156 Q -10 -96 0 -98 Q 12 -100 24 -156 Z" />
        {/* とんがり帽子 */}
        <path d="M -40 -184 Q -10 -236 14 -276 Q 26 -296 46 -292 Q 30 -282 28 -268 Q 36 -224 40 -184 Z" />
        <ellipse cx={0} cy={-186} rx={48} ry={9} />
        {rim && <path d="M 34 -136 Q 40 -96 30 -58 M 36 -184 Q 30 -224 28 -262" stroke={rim} strokeWidth={4} fill="none" opacity={0.7} />}
      </g>
    </g>
  );
};

const Nm027: React.FC<{ f: number }> = ({ f }) => {
  const door = easeOut(seg(f, 4, 20));
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + cam * 0.05;
  const curl = 0.5 + Math.sin(f / 10) * 0.5;
  const flick = 1 + Math.sin(f / 2.7) * 0.05 + Math.sin(f / 4.1) * 0.04;
  return (
    <Frame f={f} seed={4027} bg={C.deskDark}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={1} title="名前を当てたら、あなたの勝ち" t={door} left={1000} top={560} />
      </>}>
      <defs>
        <clipPath id="nb1-27clip"><rect x={130} y={128} width={1660} height={824} rx={8} /></clipPath>
        <radialGradient id="nb1-27fire" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.fireCore} stopOpacity={0.85} />
          <stop offset="0.35" stopColor={C.fire} stopOpacity={0.45} />
          <stop offset="1" stopColor={C.fire} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="nb1-27gutter" x1="0" x2="1">
          <stop offset="0" stopColor={KRP.ink} stopOpacity={0} />
          <stop offset="0.5" stopColor={KRP.ink} stopOpacity={0.45} />
          <stop offset="1" stopColor={KRP.ink} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="nb1-27sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.nightDeep} />
          <stop offset="1" stopColor={C.nightMid} />
        </linearGradient>
      </defs>
      <g transform={`translate(${560 * (1 - sc)} ${700 * (1 - sc)}) scale(${sc})`}>
        {/* 机の木目 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.55} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -40 ${i * 150 + 10} q 500 ${rnd(4027, i) * 40 - 20} 1000 0 q 500 ${rnd(4127, i) * 40 - 20} 1000 0`} />
          ))}
        </g>
        {/* 本の影と、ページの束 (小口) */}
        <rect x={60} y={80} width={1810} height={960} rx={20} fill="#000" opacity={0.3} />
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={70 - i * 4} y={66 + i * 4} width={892 + i * 4} height={950} rx={6} fill={i % 2 ? C.pageDark : C.pageEdge} stroke={KRP.ink} strokeWidth={2} />
            <rect x={958} y={66 + i * 4} width={896 + i * 4} height={950} rx={6} fill={i % 2 ? C.pageDark : C.pageEdge} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ))}
        {/* 見開きの2ページ */}
        <path d="M 90 60 Q 520 46 960 70 L 960 1010 Q 520 990 90 1004 Z" fill={C.page} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 960 70 Q 1400 46 1830 60 L 1830 1004 Q 1400 990 960 1010 Z" fill={C.page} stroke={KRP.ink} strokeWidth={6} />
        {/* 紙の黄ばみ・しみ */}
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={140 + rnd(27, i) * 1640} cy={90 + rnd(28, i) * 900} rx={30 + rnd(29, i) * 60} ry={20 + rnd(30, i) * 40}
            fill={C.pageEdge} opacity={0.22} />
        ))}
        {/* 挿絵 (夜の森) */}
        <g clipPath="url(#nb1-27clip)">
          <rect x={120} y={120} width={1680} height={840} fill="url(#nb1-27sky)" />
          {/* 星 */}
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={150 + rnd(7, i) * 1620} cy={140 + rnd(8, i) * 300} r={2 + rnd(9, i) * 3}
              fill={C.moon} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />
          ))}
          {/* 月 */}
          <circle cx={300} cy={250} r={64} fill={C.moon} opacity={0.18} />
          <circle cx={300} cy={250} r={46} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={320} cy={238} r={40} fill={C.nightDeep} opacity={0.9} />
          {/* 遠くの森のギザギザ (2層) */}
          <path d={`M 120 600 ${Array.from({ length: 22 }, (_, i) => `L ${150 + i * 80} ${470 + rnd(11, i) * 60} L ${190 + i * 80} 600`).join(" ")} L 1800 960 L 120 960 Z`} fill={C.treeMid} />
          <path d={`M 120 680 ${Array.from({ length: 18 }, (_, i) => `L ${160 + i * 100} ${540 + rnd(12, i) * 70} L ${210 + i * 100} 680`).join(" ")} L 1800 960 L 120 960 Z`} fill={C.leafDark} />
          {/* 地面 */}
          <path d="M 120 780 Q 600 740 1100 790 Q 1500 820 1800 790 L 1800 960 L 120 960 Z" fill={C.leafDark} />
          {/* たき火の光の輪 */}
          <circle cx={600} cy={800} r={420 * flick} fill="url(#nb1-27fire)" />
          {/* 手前の太い幹 (火に照らされた側に朱の縁) */}
          {([[160, 70], [470, 46], [800, 58], [880, 40], [1180, 64], [1400, 50], [1640, 76]] as const).map(([tx, tw], i) => (
            <g key={i}>
              <path d={`M ${tx - tw / 2} 960 Q ${tx - tw / 2 + 6} 600 ${tx - tw / 3} 120 L ${tx + tw / 3} 120 Q ${tx + tw / 2 - 4} 600 ${tx + tw / 2} 960 Z`}
                fill={C.tree} stroke={KRP.ink} strokeWidth={4} />
              {tx < 1000 && (
                <path d={`M ${tx + (tx < 600 ? tw / 2 - 6 : -tw / 2 + 6)} 940 Q ${tx + (tx < 600 ? tw / 2 - 2 : -tw / 2 + 2)} 700 ${tx + (tx < 600 ? tw / 3 : -tw / 3)} 420`}
                  stroke={C.fire} strokeWidth={8} fill="none" opacity={0.7 * flick} />
              )}
              {/* 根 */}
              <path d={`M ${tx - tw / 2} 960 Q ${tx - tw} 950 ${tx - tw * 1.2} 962 M ${tx + tw / 2} 960 Q ${tx + tw} 948 ${tx + tw * 1.2} 962`} stroke={C.tree} strokeWidth={14} fill="none" />
            </g>
          ))}
          {/* 枝のアーチ */}
          <path d="M 120 200 Q 400 280 700 160 Q 900 90 1100 180" stroke={C.tree} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M 1800 240 Q 1500 300 1300 200" stroke={C.tree} strokeWidth={18} fill="none" strokeLinecap="round" />
          {/* たき火 (薪と石) */}
          <g transform="translate(600 860) scale(1.4) translate(-560 -790)">
            {Array.from({ length: 7 }, (_, i) => (
              <ellipse key={i} cx={560 + (i - 3) * 26} cy={792 + Math.abs(i - 3) * -3} rx={16} ry={11} fill={C.stoneNight} stroke={KRP.ink} strokeWidth={3} />
            ))}
            <rect x={500} y={768} width={120} height={18} rx={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-14 560 777)" />
            <rect x={500} y={768} width={120} height={18} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(16 560 777)" />
            <NB1Flame x={560} y={780} s={0.85} f={f} />
            {/* 火の粉 */}
            {Array.from({ length: 8 }, (_, i) => {
              const tt = ((f * 1.3 + i * 13) % 40) / 40;
              return <circle key={i} cx={560 + Math.sin(i * 2.1 + tt * 5) * 40} cy={720 - tt * 260} r={4 - tt * 2.5} fill={C.fireCore} opacity={1 - tt} />;
            })}
          </g>
          {/* 幹のあいだで跳ねる小さな影 (まだ姿ははっきりさせない) */}
          <NB1Silhouette x={315} y={872} s={1.6} f={f} rim={C.fire} />
          {/* 草のふち */}
          {Array.from({ length: 40 }, (_, i) => (
            <path key={i} d={`M ${130 + i * 42} 955 q 6 -34 ${(rnd(14, i) - 0.5) * 30} -${40 + rnd(15, i) * 40}`} stroke={C.leaf} strokeWidth={6} fill="none" strokeLinecap="round" />
          ))}
        </g>
        {/* 挿絵の飾り枠 (二重線と四隅の飾り) */}
        <rect x={130} y={128} width={1660} height={824} rx={8} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={112} y={110} width={1696} height={860} rx={12} fill="none" stroke={C.leather} strokeWidth={3} />
        {([[112, 110], [1808, 110], [112, 970], [1808, 970]] as const).map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <circle r={16} fill={C.leather} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -9 0 L 0 -9 L 9 0 L 0 9 Z" fill={C.gold} />
          </g>
        ))}
        {/* 本のノド (真ん中のくぼみの影) */}
        <rect x={900} y={64} width={120} height={950} fill="url(#nb1-27gutter)" />
        <line x1={960} y1={70} x2={960} y2={1010} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        {/* 右下の角がめくれかける */}
        <path d={`M 1830 ${1004 - 70 - curl * 40} L 1830 1004 L ${1830 - 70 - curl * 40} 1004 Z`} fill={C.desk} />
        <path d={`M 1830 ${1004 - 70 - curl * 40} Q ${1800 - curl * 30} ${990 - curl * 30} ${1830 - 70 - curl * 40} 1004 Z`}
          fill={C.pageDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #28 1812年、グリム兄弟は、ある不思議な話を本に収めました。
// 格: 山 / seed 4028
// 絵: 19世紀はじめの書斎。窓の外は石造りの町並み (ドイツ)。机に向かう**2人の後ろ姿** (グリム兄弟・顔は見せない)。羽ペン・インク壺・原稿の山・ろうそく。f で原稿が1枚ずつ重なり、最後に革の表紙の本がぱたんと閉じる。札「1812年」「ドイツ」
// どこ: 19世紀はじめドイツの書斎。左奥の窓に石造りの町と教会の塔、右に本棚
// 演出: 机に向かうグリム兄弟の背中 (後頭部のみ・顔なし)。右の兄は羽ペンで書き、原稿が机に1枚ずつ重なる
// 動き: 原稿が6枚ひらひら落ちて山になる (f4〜28) → 革表紙の本がぱたんと閉じる (f30〜40) / ろうそくがゆらぐ / カメラが本へ寄る
const Nm028: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + cam * 0.06;
  const close = easeInOut(seg(f, 30, 40));
  const sx = Math.cos(Math.PI * (1 - close));
  const thud = seg(f, 38, 42);
  const pen = Math.sin(f / 3) * 4;
  const flick = 1 + Math.sin(f / 2.5) * 0.06;
  const bx = 960, by = 600; // 本の背 (綴じ目) の位置
  const brother = (x: number, hair: string, writing: boolean, ph: number) => (
    <g>
      <Person x={x} y={960} s={1.4} f={f} cloth={C.grimm} clothDark={C.grimmDark} pose={writing ? "raise" : "stand"} still phase={ph} />
      <g transform={`translate(${x} 960) scale(1.4)`}>
        <NB1BackHead hair={hair} />
        {/* 上着の背中の縫い目と襟 */}
        <line x1={0} y1={-158} x2={0} y2={-56} stroke={C.grimmDark} strokeWidth={4} />
        <path d="M -40 -160 Q 0 -140 40 -160" stroke={KRP.white} strokeWidth={8} fill="none" />
        {writing && (
          <g>
            {/* 前へのばした前腕 + 羽ペン */}
            <rect x={56} y={-330} width={22} height={100} rx={11} fill={C.grimm} stroke={KRP.ink} strokeWidth={4.5}
              transform={`rotate(${-14 + pen * 0.5} 67 -230)`} />
            <g transform={`translate(${74 + pen} -330) rotate(${30 + pen})`}>
              <path d="M 0 0 Q 18 -60 6 -130 Q -14 -70 0 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <line x1={0} y1={0} x2={6} y2={-120} stroke={KRP.grayDark} strokeWidth={3} />
            </g>
          </g>
        )}
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={4028} bg={C.wallDark}>
      <defs>
        <radialGradient id="nb1-28glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.fireCore} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.fireCore} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${bx * (1 - sc)} ${by * (1 - sc)}) scale(${sc})`}>
        {/* 板張りの壁 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wall} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 150} y1={-40} x2={i * 150} y2={560} stroke={C.wallDark} strokeWidth={5} />
        ))}
        <rect x={-40} y={500} width={W + 80} height={30} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓: 石造りの町並み */}
        <g>
          <rect x={110} y={70} width={520} height={380} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={8} />
          <ellipse cx={240} cy={150} rx={70} ry={22} fill={KRP.white} opacity={0.9} />
          <ellipse cx={500} cy={120} rx={50} ry={16} fill={KRP.white} opacity={0.9} />
          {/* 教会の塔 */}
          <rect x={430} y={190} width={60} height={260} fill={C.stoneLight} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 424 192 L 460 90 L 496 192 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
          <line x1={460} y1={90} x2={460} y2={62} stroke={KRP.ink} strokeWidth={4} />
          <line x1={450} y1={72} x2={470} y2={72} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={460} cy={240} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {/* 切妻の家 (木組み) */}
          {([[130, 300, 110, C.stoneLight], [240, 270, 100, C.page], [340, 320, 90, C.stone], [520, 300, 110, C.page]] as const).map(([hx, hy, hw, col], i) => (
            <g key={i}>
              <rect x={hx} y={hy} width={hw} height={460 - hy} fill={col} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${hx - 6} ${hy} L ${hx + hw / 2} ${hy - 70} L ${hx + hw + 6} ${hy} Z`} fill={C.hat} stroke={KRP.ink} strokeWidth={4} />
              <g stroke={C.woodDark} strokeWidth={4}>
                <line x1={hx} y1={hy + 40} x2={hx + hw} y2={hy + 40} />
                <line x1={hx + hw / 2} y1={hy} x2={hx + hw / 2} y2={460} />
                <line x1={hx} y1={hy} x2={hx + hw / 2} y2={hy + 40} />
              </g>
              <rect x={hx + 14} y={hy + 56} width={22} height={28} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
              <rect x={hx + hw - 36} y={hy + 56} width={22} height={28} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {/* 窓枠の十字と、カーテン */}
          <rect x={362} y={70} width={16} height={380} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={110} y={250} width={520} height={14} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M 80 50 L 170 50 Q ${150 + Math.sin(f / 12) * 6} 260 180 470 L 80 470 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 660 50 L 570 50 Q ${590 + Math.sin(f / 12 + 1) * 6} 260 560 470 L 660 470 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
          <rect x={70} y={36} width={600} height={20} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 本棚 */}
        <g>
          <rect x={1360} y={40} width={480} height={470} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              {Array.from({ length: 12 }, (_, i) => {
                const bw = 26 + rnd(r + 40, i) * 14;
                const bh = 100 + rnd(r + 50, i) * 34;
                const cols = [C.leather, KRP.blueDeep, C.kobitoDark, C.curtain, C.envoy, C.grimm];
                return (
                  <rect key={i} x={1380 + i * 37} y={60 + r * 150 + (136 - bh)} width={Math.min(bw, 34)} height={bh}
                    fill={cols[(i + r) % cols.length]} stroke={KRP.ink} strokeWidth={3} />
                );
              })}
              <rect x={1360} y={196 + r * 150} width={480} height={14} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
        </g>
        {/* 年代の札 (壁の上) */}
        <TagPlate x={960} y={130} text="1812年" size={52} t={pop(seg(f, 2, 12))} />
        <TagPlate x={370} y={404} text="ドイツ" size={40} t={pop(seg(f, 6, 16))} rot={-3} />
        {/* 机 (天板) */}
        <path d="M 60 540 L 1860 540 L 1900 700 L 20 700 Z" fill={C.desk} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.deskDark} strokeWidth={4} opacity={0.6}>
          <path d="M 120 580 Q 900 570 1800 590" fill="none" />
          <path d="M 80 640 Q 900 630 1850 650" fill="none" />
        </g>
        <rect x={20} y={700} width={1880} height={400} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />
        {/* ろうそくの光 */}
        <circle cx={1560} cy={520} r={260 * flick} fill="url(#nb1-28glow)" />
        {/* インク壺 */}
        <g>
          <ellipse cx={300} cy={662} rx={56} ry={14} fill={KRP.ink} opacity={0.3} />
          <path d="M 258 662 Q 250 610 276 600 L 324 600 Q 350 610 342 662 Z" fill={C.nightMid} stroke={KRP.ink} strokeWidth={5} />
          <rect x={282} y={584} width={36} height={20} rx={4} fill={KRP.ink} />
          <path d="M 278 612 Q 290 606 296 640" stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.6} />
        </g>
        {/* 原稿の山 (下から積もる) */}
        <g>
          <rect x={650} y={640} width={190} height={26} fill={C.page} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 4 }, (_, i) => (
            <rect key={i} x={652 + (i % 2) * 6} y={634 - i * 8} width={186} height={10} fill={i % 2 ? C.pageDark : C.page} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {Array.from({ length: 6 }, (_, i) => {
            const t = easeOut(seg(f, 4 + i * 4, 9 + i * 4));
            if (t <= 0) return null;
            const yy = lerp(260, 600 - i * 8, t);
            const xx = lerp(820 + (i % 2 ? 60 : -40), 745 + (rnd(28, i) - 0.5) * 14, t);
            const rr = lerp(i % 2 ? 40 : -35, (rnd(29, i) - 0.5) * 6, t);
            return (
              <g key={i} transform={`translate(${xx} ${yy}) rotate(${rr}) scale(1 ${lerp(0.6, 0.22, t)})`}>
                <rect x={-95} y={-60} width={190} height={120} fill={C.page} stroke={KRP.ink} strokeWidth={7} />
                {Array.from({ length: 5 }, (_, k) => (
                  <path key={k} d={`M -70 ${-36 + k * 18} q 20 -6 40 0 t 40 0 t 40 0`} stroke={KRP.grayDark} strokeWidth={6} fill="none" />
                ))}
              </g>
            );
          })}
        </g>
        {/* 革表紙の本 (綴じ目 bx を軸にぱたんと閉じる) */}
        <g>
          <ellipse cx={bx + 100} cy={by + 70} rx={130} ry={14} fill={KRP.ink} opacity={0.3} />
          {/* 本体 (右ページ側) */}
          <path d={`M ${bx} ${by} L ${bx + 200} ${by - 6} L ${bx + 206} ${by + 60} L ${bx} ${by + 64} Z`} fill={C.page} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={bx + 20} y1={by + 20} x2={bx + 180} y2={by + 16} stroke={KRP.grayDark} strokeWidth={4} />
          <line x1={bx + 20} y1={by + 38} x2={bx + 170} y2={by + 34} stroke={KRP.grayDark} strokeWidth={4} />
          <rect x={bx} y={by + 58} width={206} height={14} fill={C.leatherDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 表紙 (開いているときは左に・閉じると右のページを覆う) */}
          <g transform={`translate(${bx} ${by}) scale(${sx} 1) translate(${-bx} ${-by})`}>
            <path d={`M ${bx} ${by - 4} L ${bx + 206} ${by - 10} L ${bx + 212} ${by + 58} L ${bx} ${by + 62} Z`}
              fill={sx < 0 ? C.page : C.leather} stroke={KRP.ink} strokeWidth={5} />
            {sx < 0 ? (
              <g stroke={KRP.grayDark} strokeWidth={4}>
                <line x1={bx + 24} y1={by + 18} x2={bx + 180} y2={by + 14} />
                <line x1={bx + 24} y1={by + 36} x2={bx + 160} y2={by + 32} />
              </g>
            ) : (
              <g>
                <rect x={bx + 30} y={by + 6} width={150} height={44} rx={4} fill="none" stroke={C.gold} strokeWidth={4} />
                <circle cx={bx + 105} cy={by + 28} r={12} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
              </g>
            )}
          </g>
          <rect x={bx - 8} y={by - 6} width={14} height={72} rx={5} fill={C.leatherDark} stroke={KRP.ink} strokeWidth={4} />
          {/* ぱたん (閉じた瞬間の線とホコリ) */}
          {thud > 0 && thud < 1 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - thud}>
              <line x1={bx - 30 - thud * 30} y1={by - 10} x2={bx - 60 - thud * 30} y2={by - 40} />
              <line x1={bx + 100} y1={by - 24 - thud * 20} x2={bx + 100} y2={by - 60 - thud * 20} />
              <line x1={bx + 240 + thud * 30} y1={by - 10} x2={bx + 270 + thud * 30} y2={by - 40} />
            </g>
          )}
          {close >= 1 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
              <line x1={bx - 40} y1={by + 10} x2={bx - 70} y2={by - 16} />
              <line x1={bx + 250} y1={by + 10} x2={bx + 280} y2={by - 16} />
            </g>
          )}
        </g>
        {/* ろうそく */}
        <g>
          <ellipse cx={1560} cy={664} rx={70} ry={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={1546} y={600} width={28} height={64} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1540} y={470} width={40} height={134} rx={6} fill={C.candle} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 1548 480 Q 1544 510 1550 520" stroke={C.pageDark} strokeWidth={5} fill="none" />
          <line x1={1560} y1={470} x2={1560} y2={458} stroke={KRP.ink} strokeWidth={3} />
          <NB1Flame x={1560} y={462} s={0.36} f={f} />
        </g>
        {/* グリム兄弟 (後ろ姿) */}
        {brother(520, C.hairBrown, false, 0)}
        {brother(1300, C.hairDark, true, 2)}
        {/* 椅子の背もたれ (手前) */}
        {[520, 1300].map((x, i) => (
          <g key={i}>
            {/* 背もたれ (脚を隠す板と彫り) */}
            <rect x={x - 130} y={878} width={260} height={240} rx={14} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M ${x - 90} 1080 L ${x - 90} 950 Q ${x} 900 ${x + 90} 950 L ${x + 90} 1080`} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={x} cy={990} r={20} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
            <rect x={x - 150} y={840} width={34} height={260} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={x + 116} y={840} width={34} height={260} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={x - 133} cy={836} r={20} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={x + 133} cy={836} r={20} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #29 わらを金に紡がないと命がない、と王さまに命じられた娘がいました。
// 格: 山 / seed 4029
// 絵: お城の小部屋。床いっぱいの わらの山・糸車 (木の車輪まで作り込む)。腕組みの王さまが扉の前に立ち、娘 (水色のエプロン) が糸車の前でうろたえる (face worried)。扉に大きな錠前。f で王さまが指を立てて「金に」と命じる (金の糸の夢の吹き出しの絵)
// どこ: お城の塔の石の小部屋 (昼)。高い鉄格子の窓から光の筋。左に鉄の帯の扉と大きな錠前
// 演出: 床いっぱいのわら・中央に糸車。扉の前の王さまが腕組みから指を立てて命じる→「わら→金の糸」の吹き出し。娘は糸車の前でうろたえる
// 動き: f14 で王さまが指を立てる / f18〜28 吹き出しがぽん / 錠前がゆれる / 光の筋のホコリ / カメラが右へゆっくりパン
const NB1Chamber: React.FC<{ f: number; night?: boolean }> = ({ f, night }) => {
  const st = night ? C.stoneNight : C.stone;
  const stD = night ? C.stoneNightDark : C.stoneDark;
  const stL = night ? "#5E6478" : C.stoneLight;
  return (
    <g>
      {/* 石積みの壁 */}
      <rect x={-60} y={-60} width={W + 120} height={860} fill={st} />
      {Array.from({ length: 9 }, (_, r) => (
        <g key={r}>
          {Array.from({ length: 12 }, (_, i) => {
            const bx = i * 180 - (r % 2) * 90 - 60;
            return (
              <rect key={i} x={bx + 4} y={r * 90 - 56} width={172} height={82} rx={10}
                fill={rnd(r * 13, i) > 0.7 ? stL : st} stroke={stD} strokeWidth={5} />
            );
          })}
        </g>
      ))}
      {/* 高い窓 (鉄格子) */}
      <path d="M 1440 300 L 1440 140 Q 1520 60 1600 140 L 1600 300 Z" fill={night ? C.nightDeep : KRP.blueSoft} stroke={KRP.ink} strokeWidth={8} />
      {night && <circle cx={1550} cy={170} r={26} fill={C.moon} stroke={KRP.ink} strokeWidth={3} />}
      {[1480, 1520, 1560].map((x) => <line key={x} x1={x} y1={96} x2={x} y2={300} stroke={KRP.ink} strokeWidth={8} />)}
      <line x1={1440} y1={210} x2={1600} y2={210} stroke={KRP.ink} strokeWidth={8} />
      <rect x={1424} y={296} width={192} height={22} fill={stL} stroke={KRP.ink} strokeWidth={5} />
      {/* 扉 (鉄の帯・鋲) */}
      <path d="M 110 800 L 110 330 Q 260 180 410 330 L 410 800 Z" fill={night ? "#4A3420" : C.woodDark} stroke={KRP.ink} strokeWidth={8} />
      {[180, 260, 340].map((x) => <line key={x} x1={x} y1={262} x2={x} y2={800} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />)}
      {[400, 640].map((y) => (
        <g key={y}>
          <rect x={110} y={y} width={300} height={26} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          {[130, 200, 270, 340, 390].map((x) => <circle key={x} cx={x} cy={y + 13} r={6} fill={KRP.ink} />)}
        </g>
      ))}
      {/* 床板 */}
      <rect x={-60} y={790} width={W + 120} height={360} fill={night ? "#5A4630" : C.woodLight} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={-60} y1={850 + i * 70} x2={W + 60} y2={850 + i * 70} stroke={night ? "#45351F" : C.wood} strokeWidth={5} />
      ))}
      {/* 壁ぎわのわらの山 */}
      <NB1Straw x={1720} y={812} w={420} h={230} seed={21} night={night} f={f} />
      <NB1Straw x={560} y={812} w={360} h={150} seed={22} night={night} f={f} />
      <NB1Straw x={1240} y={806} w={300} h={110} seed={23} night={night} f={f} />
    </g>
  );
};

// 大きな錠前 (扉の掛け金にぶら下がる)
const NB1Padlock: React.FC<{ x: number; y: number; s?: number; swing: number }> = ({ x, y, s = 1, swing }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${swing})`}>
    <rect x={-60} y={-40} width={120} height={18} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -30 -20 L -30 -60 Q 0 -100 30 -60 L 30 -20" fill="none" stroke={KRP.ink} strokeWidth={20} />
    <path d="M -30 -20 L -30 -60 Q 0 -100 30 -60 L 30 -20" fill="none" stroke={KRP.silver} strokeWidth={11} />
    <rect x={-54} y={-24} width={108} height={96} rx={18} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-40} y={-12} width={80} height={10} rx={5} fill={C.goldLight} opacity={0.7} />
    <circle cx={0} cy={22} r={13} fill={KRP.ink} />
    <path d="M -6 26 L -10 54 L 10 54 L 6 26 Z" fill={KRP.ink} />
  </g>
);

const Nm029: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const cx = -cam * 40;
  const sc = 1.02 + cam * 0.03;
  const order = f >= 14;
  const bub = pop(seg(f, 18, 28));
  const swing = Math.sin(f / 11) * 4;
  const kx = 560, ky = 900, ks = 1.12;
  const mx = 1440, my = 900;
  return (
    <Frame f={f} seed={4029} bg={C.stone}>
      <g transform={`translate(${cx + 960 * (1 - sc)} ${540 * (1 - sc)}) scale(${sc})`}>
        <NB1Chamber f={f} />
        {/* 窓からの光の筋とホコリ */}
        <path d="M 1440 300 L 1600 300 L 1180 900 L 820 900 Z" fill={KRP.white} opacity={0.16} />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={1000 + rnd(29, i) * 420 + Math.sin(f / 15 + i) * 12} cy={380 + rnd(30, i) * 460 - (f * 0.6 + i * 20) % 60}
            r={3} fill={KRP.white} opacity={0.6} />
        ))}
        <NB1Padlock x={370} y={560} s={0.9} swing={swing} />
        {/* 糸車 */}
        <NB1Wheel x={1060} y={902} s={0.95} rot={10 + Math.sin(f / 20) * 3} bobbin={0.15} />
        {/* 王さま: マント・毛皮の襟・冠・ひげ */}
        <g>
          <path d={`M ${kx - 76} ${ky - 172} L ${kx - 130} ${ky - 6} L ${kx + 130} ${ky - 6} L ${kx + 76} ${ky - 172} Z`} fill={C.kingDark} stroke={KRP.ink} strokeWidth={5} />
          <Person x={kx} y={ky} s={ks} f={f} face="angry" pose={order ? "raise" : "armsFolded"} cloth={C.king} clothDark={C.kingDark} still gaze={[6, 0]} />
          <g transform={`translate(${kx} ${ky}) scale(${ks})`}>
            <path d="M -66 -168 Q 0 -140 66 -168 L 60 -150 Q 0 -124 -60 -150 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {[-40, -14, 14, 40].map((x) => <circle key={x} cx={x} cy={-150} r={3.5} fill={KRP.ink} />)}
            <path d="M -40 -196 Q 0 -150 40 -196 Q 30 -166 0 -164 Q -30 -166 -40 -196 Z" fill={C.hairBrown} stroke={KRP.ink} strokeWidth={4} />
            <NB1Crown big />
            {order && (
              <g transform={`translate(67 -232) scale(${pop(seg(f, 14, 20))})`}>
                <rect x={-6} y={-46} width={13} height={42} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={0} cy={0} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              </g>
            )}
          </g>
          {order && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 22, 40) * 0.5}>
              <line x1={kx + 50} y1={ky - 330} x2={kx + 30} y2={ky - 360} />
              <line x1={kx + 75} y1={ky - 340} x2={kx + 75} y2={ky - 375} />
              <line x1={kx + 100} y1={ky - 330} x2={kx + 120} y2={ky - 360} />
            </g>
          )}
        </g>
        {/* 吹き出し: わら → 金の糸 */}
        {bub > 0 && (
          <g transform={`translate(940 250) scale(${bub})`}>
            <circle cx={-260} cy={180} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-220} cy={140} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -230 0 Q -250 -100 -130 -110 Q -60 -170 40 -120 Q 150 -160 210 -80 Q 280 -10 200 70 Q 140 140 20 110 Q -80 150 -160 100 Q -250 90 -230 0 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            {/* わらの束 */}
            <g transform="translate(-120 0)">
              {Array.from({ length: 9 }, (_, i) => (
                <line key={i} x1={-40 + i * 10} y1={50} x2={-30 + i * 7} y2={-50} stroke={i % 2 ? C.strawDark : C.straw} strokeWidth={7} strokeLinecap="round" />
              ))}
              <rect x={-36} y={-6} width={76} height={14} rx={5} fill={C.strawDark} stroke={KRP.ink} strokeWidth={3} />
            </g>
            <Arrow x={40} y={0} s={0.8} rot={0} color={C.gold} />
            {/* 金の糸のかせの山 */}
            <NB1Skein x={130} y={30} s={0.8} rot={-8} glow={1} />
            <NB1Skein x={110} y={-14} s={0.7} rot={10} />
            <NB1Spark x={180} y={-50} r={18 + Math.sin(f / 3) * 4} />
            <NB1Spark x={70} y={-60} r={12} />
          </g>
        )}
        {/* 娘: 水色のエプロンドレス・三角巾・うろたえ */}
        <g>
          <Person x={mx} y={my} s={1} f={f} face="worried" pose="hold" still cloth={C.maid} clothDark={C.maidDark} lean={-4 + Math.sin(f / 7) * 2} gaze={[-7, -2]} />
          <g transform={`translate(${mx} ${my}) rotate(${-4 + Math.sin(f / 7) * 2})`}>
            <path d="M -42 -132 L 42 -132 L 50 -54 L -50 -54 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -66 -54 Q 0 -30 66 -54 L 74 -8 Q 0 10 -74 -8 Z" fill={C.maid} stroke={KRP.ink} strokeWidth={4.5} />
            <NB1Kerchief />
            {/* あせの粒 */}
            <path d={`M 78 ${-266 + Math.sin(f / 4) * 4} q -8 14 0 20 q 8 -6 0 -20 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -80 -250 q -6 12 0 18 q 6 -6 0 -18 Z" fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* 手前のわら (床いっぱい) */}
        <NB1Straw x={180} y={1100} w={520} h={220} seed={24} f={f} />
        <NB1Straw x={1000} y={1110} w={420} h={170} seed={25} f={f} />
        <NB1Straw x={1800} y={1100} w={500} h={240} seed={26} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #30 そこへ小さな男があらわれて、代わりに紡いでくれます。
// 格: 山 / seed 4030
// 絵: 同じ部屋の夜。煙がぽんと立ち、小男が登場 (とんがり帽子・白いひげ)。糸車がものすごい速さで回り、わらが**金の糸**になって巻き取られていく (f で糸巻きが金色に太る・火花のような光)。娘は目を丸くする
// どこ: #29と同じ塔の小部屋の夜 (窓に月・壁は青い闇)。カメラは糸車に寄った低い位置
// 演出: 煙がぽんと立って小男が登場。わらの山からわらをつかんで糸車へ→手を通ると金色に変わって糸巻きに巻き取られる。娘は目を丸くしてのけぞる
// 動き: f0〜14 煙→f6 小男がぽん / f10〜 車輪が猛回転 (残像) / 糸巻きが f10〜40 で金色に太る / 火花 / 金のかせが床に1つずつ増える / 画面が小刻みにゆれる
const Nm030: React.FC<{ f: number }> = ({ f }) => {
  const smoke = seg(f, 0, 16);
  const appear = pop(seg(f, 5, 13));
  const spin = seg(f, 8, 14);
  const rot = f * 6 + Math.max(0, f - 10) * 34;
  const bob = 0.12 + 0.88 * easeOut(seg(f, 10, 40));
  const shake = spin * Math.sin(f * 2.3) * 2.5;
  const sc = 1.1 + easeInOut(seg(f, 0, 42)) * 0.04;
  const wx = 980, wy = 900, ws = 1.1;
  const bobX = wx - 165 * ws, bobY = wy - 250 * ws;
  const nSkein = Math.floor(seg(f, 16, 40) * 5 + 0.0001);
  const kx = 590, ky = 905;
  // わらの流れの道すじ (わらの山 → 小男の手 → 糸巻き)
  const path = (t: number): [number, number] => {
    if (t < 0.5) {
      const u = t / 0.5;
      return [lerp(400, kx + 30, u), lerp(760, ky - 130, u) - Math.sin(u * Math.PI) * 60];
    }
    const u = (t - 0.5) / 0.5;
    return [lerp(kx + 30, bobX, u), lerp(ky - 130, bobY, u) - Math.sin(u * Math.PI) * 40];
  };
  return (
    <Frame f={f} seed={4030} bg={C.stoneNight} dark>
      <defs>
        <radialGradient id="nb1-30glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.goldLight} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${960 * (1 - sc) + shake} ${560 * (1 - sc)}) scale(${sc})`}>
        <NB1Chamber f={f} night />
        {/* 月の光の筋 */}
        <path d="M 1440 300 L 1600 300 L 1300 900 L 1000 900 Z" fill={C.moon} opacity={0.08} />
        {/* 糸巻きのまわりの金の光 */}
        <circle cx={bobX} cy={bobY} r={(120 + bob * 200) * (1 + Math.sin(f / 2) * 0.04)} fill="url(#nb1-30glow)" opacity={spin} />
        {/* 床の金のかせ (増えていく) */}
        {Array.from({ length: 5 }, (_, i) => {
          const t = pop(seg(f, 16 + i * 5, 21 + i * 5));
          if (i >= nSkein + 1 || t <= 0) return null;
          const pos = [[1240, 900], [1330, 905], [1285, 862], [1200, 866], [1370, 866]][i];
          return <NB1Skein key={i} x={pos[0]} y={pos[1]} s={0.75 * t} rot={(i % 2 ? 8 : -6)} glow={0.6} />;
        })}
        {/* 糸車 (猛回転) */}
        <NB1Wheel x={wx} y={wy} s={ws} rot={rot} bobbin={bob} gold blur={spin} night />
        {/* 糸巻きから飛ぶ火花 */}
        {spin > 0 && Array.from({ length: 10 }, (_, i) => {
          const tt = ((f * 1.7 + i * 9) % 18) / 18;
          const ang = rnd(30, i) * Math.PI * 2;
          return <NB1Spark key={i} x={bobX + Math.cos(ang) * (50 + tt * 150)} y={bobY + Math.sin(ang) * (40 + tt * 110)} r={14 * (1 - tt) + 4} o={1 - tt} />;
        })}
        {/* わら → 金 に変わりながら流れる */}
        {appear > 0.5 && Array.from({ length: 14 }, (_, i) => {
          const tt = ((f * 0.9 + i * 6) % 84) / 84;
          const [px, py] = path(tt);
          const goldNow = tt > 0.5;
          return (
            <line key={i} x1={px - 14} y1={py + 6} x2={px + 14} y2={py - 6}
              stroke={goldNow ? C.goldLight : C.straw} strokeWidth={goldNow ? 6 : 7} strokeLinecap="round"
              transform={`rotate(${f * 20 + i * 40} ${px} ${py})`} />
          );
        })}
        {/* 小男の手から糸巻きへの金の糸 */}
        {appear > 0.5 && (
          <path d={`M ${kx + 30} ${ky - 130} Q ${(kx + bobX) / 2 + 20} ${ky - 230} ${bobX} ${bobY}`}
            stroke={C.gold} strokeWidth={5} fill="none" strokeDasharray="14 8" strokeDashoffset={-f * 6} />
        )}
        {/* わらの山 (小男が手をつっこむ) */}
        <NB1Straw x={330} y={912} w={420} h={220} seed={31} night f={f} />
        {/* 小男 (ぽんと登場) */}
        {appear > 0 && (
          <g transform={`translate(${kx} ${ky}) scale(${appear}) translate(${-kx} ${-ky})`}>
            <NB1Kobito x={kx} y={ky} s={0.78} f={f} face="joy" pose="hold" hop={0.5} lean={6} />
          </g>
        )}
        {/* 登場の煙 */}
        {smoke > 0 && smoke < 1 && (
          <g opacity={1 - smoke}>
            {Array.from({ length: 7 }, (_, i) => {
              const a = (i / 7) * Math.PI * 2;
              return (
                <circle key={i} cx={kx + Math.cos(a) * (40 + smoke * 160)} cy={ky - 180 + Math.sin(a) * (30 + smoke * 110)}
                  r={50 + smoke * 50} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
              );
            })}
            <circle cx={kx} cy={ky - 180} r={70 + smoke * 40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* 娘: 目を丸くしてのけぞる */}
        <g>
          <Person x={1560} y={905} s={1.0} f={f} face="surprised" pose="hold" still cloth={C.maid} clothDark={C.maidDark}
            lean={9 + Math.sin(f / 6) * 1.5} gaze={[-8, 0]} />
          <g transform={`translate(1560 905) rotate(${9 + Math.sin(f / 6) * 1.5})`}>
            <path d="M -42 -132 L 42 -132 L 50 -54 L -50 -54 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -66 -54 Q 0 -30 66 -54 L 72 -12 Q 0 6 -72 -12 Z" fill={C.maid} stroke={KRP.ink} strokeWidth={4.5} />
            <NB1Kerchief />
            {/* びっくりの線 */}
            <g stroke={C.goldLight} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 4))}>
              <line x1={-90} y1={-300} x2={-120} y2={-340} />
              <line x1={-60} y1={-322} x2={-68} y2={-366} />
              <line x1={-110} y1={-260} x2={-154} y2={-272} />
            </g>
          </g>
        </g>
        {/* 手前のわら */}
        <NB1Straw x={1000} y={1150} w={520} h={180} seed={32} night f={f} />
        <NB1Straw x={1880} y={1130} w={460} h={230} seed={33} night f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #31 ただし、お礼は、娘が将来生む、最初の子どもです。
// 格: 並 / seed 4031
// 絵: 小男のアップ。片手の指を1本立て、もう片方の手で羊皮紙の契約書を広げる (文字は読めない波線+小男の印)。吹き出しの中に「ゆりかご」の絵。娘の顔は青ざめる (背景の糸車と金の糸の山)
// どこ: 同じ塔の小部屋の夜。奥に糸車と金のかせの山 (#30の続き)。小男に寄ったアップ
// 演出: 小男が指を1本立て、もう片手で羊皮紙の契約書を下からくるくる広げる (波線+小男の赤い印)。吹き出しにゆりかご。奥の娘は青ざめる
// 動き: f4〜18 契約書が広がる / f16〜26 吹き出しがぽん・ゆりかごが揺れる / f22〜30 赤い印がどん / 指がふりふり / 娘の青い縦線がじわっと出る
const Nm031: React.FC<{ f: number }> = ({ f }) => {
  const sc = 1.0 + easeInOut(seg(f, 0, 42)) * 0.05;
  const unroll = easeOut(seg(f, 4, 18));
  const bub = pop(seg(f, 16, 26));
  const seal = pop(seg(f, 22, 30));
  const pale = seg(f, 20, 36);
  const rock = Math.sin(f / 6) * 7;
  const kx = 800, ky = 930, ks = 1.75;
  const cTop = lerp(790, 380, unroll);
  const wag = Math.sin(f / 4) * 8;
  return (
    <Frame f={f} seed={4031} bg={C.stoneNight} dark>
      <g transform={`translate(${800 * (1 - sc)} ${520 * (1 - sc)}) scale(${sc})`}>
        <NB1Chamber f={f} night />
        {/* 奥: 糸車と金のかせの山 */}
        <NB1Wheel x={1290} y={880} s={0.78} rot={20} bobbin={1} gold night />
        {Array.from({ length: 6 }, (_, i) => (
          <NB1Skein key={i} x={1060 + (i % 3) * 70} y={872 - Math.floor(i / 3) * 40} s={0.62} rot={i % 2 ? 8 : -6} glow={0.5} />
        ))}
        {/* 奥の娘 (青ざめる) */}
        <g>
          <Person x={1640} y={890} s={0.92} f={f} face="worried" pose="hold" still cloth={C.maid} clothDark={C.maidDark} gaze={[-8, 2]} />
          <g transform="translate(1640 890) scale(0.92)">
            <path d="M -42 -132 L 42 -132 L 50 -54 L -50 -54 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -66 -54 Q 0 -30 66 -54 L 72 -12 Q 0 6 -72 -12 Z" fill={C.maid} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={0} cy={-228} r={60} fill={C.pale} opacity={0.32 * pale} />
            <NB1Kerchief />
            <g stroke={C.pale} strokeWidth={5} strokeLinecap="round" opacity={pale}>
              {[-30, -14, 2, 18, 34].map((x) => <line key={x} x1={x} y1={-262} x2={x} y2={-262 + 30 * pale} />)}
            </g>
          </g>
        </g>
        {/* 小男にスポットを当てる暗がり */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.nightDeep} opacity={0.28} />
        <ellipse cx={kx - 120} cy={600} rx={640} ry={480} fill={C.moon} opacity={0.08} />
        {/* 小男 (アップ) */}
        <NB1Kobito x={kx} y={ky} s={ks} f={f} face="smile" pose="raise" lean={-2} gaze={[-6, 0]} />
        {/* 立てた人さし指 */}
        <g transform={`translate(${kx + 67 * ks} ${ky - 232 * ks}) rotate(${wag})`}>
          <rect x={-11} y={-80} width={22} height={70} rx={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={0} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -14 4 Q 0 14 14 4" stroke={KRP.ink} strokeWidth={4} fill="none" />
        </g>
        {/* 羊皮紙の契約書 (下の巻き軸を持って上へ広げる) */}
        <g transform="translate(40 0)">
          <path d={`M 250 ${cTop} Q 430 ${cTop - 18} 610 ${cTop} L 610 790 L 250 790 Z`} fill={C.parch} stroke={KRP.ink} strokeWidth={6} />
          {/* 上のくるん */}
          <ellipse cx={430} cy={cTop} rx={186} ry={18} fill={C.parchDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 読めない波線 */}
          {Array.from({ length: 9 }, (_, i) => {
            const yy = 440 + i * 30;
            if (yy < cTop + 30 || yy > 700) return null;
            return <path key={i} d={`M 290 ${yy} q 20 -10 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} stroke={KRP.grayDark} strokeWidth={5} fill="none" />;
          })}
          {/* 小男の印 (赤い丸にとんがり帽子) */}
          {seal > 0 && (
            <g transform={`translate(520 734) scale(${seal}) rotate(-8)`}>
              <circle r={38} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
              <path d="M -18 16 L 4 -24 Q 12 -30 18 -24 L 12 -16 L 20 16 Z" fill={KRP.white} />
              <rect x={-24} y={12} width={48} height={8} rx={4} fill={KRP.white} />
            </g>
          )}
          {/* 下の巻き軸と、それを持つ手 */}
          <rect x={232} y={782} width={396} height={30} rx={15} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={228} cy={797} r={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={632} cy={797} r={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={kx - 67 * ks - 40} cy={ky - 66 * ks} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 吹き出し: ゆりかご */}
        {bub > 0 && (
          <g transform={`translate(1220 230) scale(${bub})`}>
            <circle cx={-250} cy={170} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-210} cy={128} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -200 0 Q -220 -90 -110 -110 Q -40 -160 50 -116 Q 160 -140 200 -60 Q 250 10 180 70 Q 110 130 0 104 Q -100 130 -160 84 Q -230 60 -200 0 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <g transform={`translate(0 10) rotate(${rock} 0 60)`}>
              {/* 揺り子 (弓形の脚) */}
              <path d="M -120 60 Q 0 100 120 60" stroke={C.woodDark} strokeWidth={14} fill="none" strokeLinecap="round" />
              <path d="M -120 60 Q 0 100 120 60" stroke={KRP.ink} strokeWidth={4} fill="none" />
              <rect x={-80} y={36} width={14} height={34} fill={C.wood} stroke={KRP.ink} strokeWidth={3} />
              <rect x={66} y={36} width={14} height={34} fill={C.wood} stroke={KRP.ink} strokeWidth={3} />
              {/* かご */}
              <path d="M -100 -20 L 100 -20 Q 96 40 60 44 L -60 44 Q -96 40 -100 -20 Z" fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
              {[-60, -30, 0, 30, 60].map((x) => <line key={x} x1={x} y1={-18} x2={x * 0.8} y2={42} stroke={C.wood} strokeWidth={4} />)}
              {/* 赤ちゃんの布団と頭 */}
              <path d="M -84 -20 Q 0 -44 84 -20 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={-46} cy={-34} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -54 -36 Q -50 -32 -46 -36 M -42 -36 Q -38 -32 -34 -36" stroke={KRP.ink} strokeWidth={3} fill="none" />
              {/* 幌 */}
              <path d="M -100 -20 Q -110 -90 -30 -96 L -40 -20 Z" fill={C.queen} stroke={KRP.ink} strokeWidth={5} />
            </g>
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #32 やがて赤ちゃんが生まれ、小男が取りに来ました。
// 格: 山 / seed 4032
// 絵: お妃の寝室 (天蓋つきのベッド・窓の外は月)。ゆりかごの赤ちゃん。お妃になった娘 (えんじのドレス・小さな冠) がゆりかごを抱えるように守る。窓の外から小男の影が月明かりで長く伸びて部屋に入ってくる (f で影が伸びる)
// どこ: お城のお妃の寝室 (夜)。左に天蓋つきのベッド、右に開いた窓と大きな月
// 演出: えんじのドレスと小さな冠のお妃が、ゆりかごの赤ちゃんに覆いかぶさって守る。窓辺に小男の黒い影が立ち、月明かりの床にその影が長く伸びてくる
// 動き: f4〜38 影がゆりかごへ向かって伸びる / 窓のカーテンが風でふくらむ / 雲が月を流れる / ゆりかごが小さく揺れる / カメラがゆりかごへ寄る
const Nm032: React.FC<{ f: number }> = ({ f }) => {
  const sc = 1.0 + easeInOut(seg(f, 0, 42)) * 0.06;
  const grow = 0.15 + 0.85 * easeInOut(seg(f, 4, 38));
  const gust = Math.sin(f / 8) * 0.5 + 0.5;
  const rock = Math.sin(f / 9) * 3;
  const qx = 720, qy = 880, qs = 1.1, ql = 10;
  const g = grow;
  return (
    <Frame f={f} seed={4032} bg={C.wallNight} dark>
      <g transform={`translate(${960 * (1 - sc)} ${700 * (1 - sc)}) scale(${sc})`}>
        {/* 壁 (菱形の壁紙) と腰板 */}
        <rect x={-60} y={-60} width={W + 120} height={800} fill={C.wallNight} />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i}>
            {Array.from({ length: 6 }, (_, j) => (
              <path key={j} d={`M ${i * 170 + (j % 2) * 85} ${j * 110 - 10} l 26 40 l -26 40 l -26 -40 Z`} fill={C.wallNightDark} opacity={0.7} />
            ))}
          </g>
        ))}
        <rect x={-60} y={560} width={W + 120} height={160} fill={C.wallNightDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={i * 170 + 20} y={582} width={130} height={116} rx={6} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        ))}
        {/* 床と敷物 */}
        <rect x={-60} y={716} width={W + 120} height={420} fill="#4A3828" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={770 + i * 64} x2={W + 60} y2={770 + i * 64} stroke="#3A2A1C" strokeWidth={5} />)}
        <ellipse cx={820} cy={900} rx={560} ry={110} fill={C.rugDark} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={820} cy={900} rx={480} ry={84} fill="none" stroke={C.gold} strokeWidth={5} strokeDasharray="20 14" opacity={0.6} />
        {/* 窓: 月と流れる雲 */}
        <g>
          <path d="M 1420 560 L 1420 220 Q 1600 60 1780 220 L 1780 560 Z" fill={C.nightDeep} stroke={KRP.ink} strokeWidth={9} />
          <circle cx={1620} cy={270} r={110} fill={C.moon} opacity={0.2} />
          <circle cx={1620} cy={270} r={80} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1596} cy={250} r={12} fill={C.pageDark} opacity={0.6} />
          <circle cx={1650} cy={300} r={9} fill={C.pageDark} opacity={0.6} />
          <ellipse cx={1500 + (f * 3) % 400} cy={320} rx={90} ry={22} fill={C.nightMid} opacity={0.9} />
          {/* 窓辺に立つ小男の影 */}
          <NB1Silhouette x={1600} y={556} s={0.9} f={f} />
          <rect x={1404} y={556} width={392} height={26} fill={C.wallNightDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 風でふくらむカーテン */}
          <path d={`M 1380 140 L 1460 140 Q ${1480 - gust * 60} 360 ${1440 - gust * 90} 600 L 1370 600 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 1820 140 L 1740 140 Q ${1730 + gust * 40} 360 ${1760 + gust * 70} 600 L 1830 600 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1360} y={126} width={480} height={22} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 月明かりの床 + 伸びる影 */}
        <path d="M 1400 720 L 1790 720 L 1400 1080 L 880 1080 Z" fill={C.moon} opacity={0.16} />
        <g transform={`translate(1580 740) matrix(0.3 0.7 ${2.2 * g} ${-0.5 * g} 0 0)`} opacity={0.75}>
          <NB1Silhouette x={0} y={0} s={1} f={0} />
        </g>
        {/* 天蓋つきのベッド */}
        <g>
          <rect x={60} y={120} width={24} height={680} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={560} y={120} width={24} height={680} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={30} y={90} width={580} height={60} rx={8} fill={C.curtain} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 30 150 Q 90 190 150 150 Q 210 190 270 150 Q 330 190 390 150 Q 450 190 510 150 Q 570 190 610 150" fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 40 150 Q 120 400 70 720 L 40 720 Z" fill={C.curtainDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 600 150 Q 520 400 580 720 L 600 720 Z" fill={C.curtainDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={80} y={560} width={490} height={180} rx={20} fill={C.bedSheet} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 80 640 Q 320 600 570 640 L 570 740 L 80 740 Z" fill={C.queen} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={180} cy={570} rx={80} ry={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ナイトテーブルのろうそく (消えそう) */}
        <g>
          <rect x={640} y={560} width={130} height={150} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={690} y={500} width={26} height={62} fill={C.candle} stroke={KRP.ink} strokeWidth={4} />
          <NB1Flame x={703} y={500} s={0.22 + Math.sin(f / 3) * 0.04} f={f} />
        </g>
        {/* お妃: えんじのドレス・小さな冠。ゆりかごへ身を乗り出して守る */}
        <g>
          <path d={`M ${qx - 70} ${qy - 60} L ${qx - 100} ${qy} L ${qx + 100} ${qy} L ${qx + 70} ${qy - 60} Z`}
            fill={C.queenDark} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${ql} ${qx} ${qy})`} />
          <Person x={qx} y={qy} s={qs} f={f} face="worried" pose="hold" still cloth={C.queen} clothDark={C.queenDark} lean={ql} gaze={[9, 0]} />
          <g transform={`translate(${qx} ${qy}) rotate(${ql}) scale(${qs})`}>
            <path d="M -66 -60 Q 0 -40 66 -60 L 92 0 Q 0 14 -92 0 Z" fill={C.queen} stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -40 -160 Q 0 -140 40 -160" stroke={C.gold} strokeWidth={6} fill="none" />
            <NB1Crown />
            {/* 守るように伸ばした腕 */}
            <rect x={56} y={-150} width={24} height={150} rx={12} fill={C.queen} stroke={KRP.ink} strokeWidth={4.5} transform="rotate(-72 67 -148)" />
            <circle cx={210} cy={-102} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* ゆりかごと赤ちゃん */}
        <g transform={`rotate(${rock} 960 880)`}>
          <path d="M 800 870 Q 960 920 1120 870" stroke={C.woodDark} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M 800 870 Q 960 920 1120 870" stroke={KRP.ink} strokeWidth={4} fill="none" />
          <rect x={850} y={820} width={16} height={60} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1054} y={820} width={16} height={60} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 820 740 L 1100 740 Q 1094 830 1040 836 L 880 836 Q 826 830 820 740 Z" fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          {[860, 910, 960, 1010, 1060].map((x) => <line key={x} x1={x} y1={744} x2={x + (960 - x) * 0.1} y2={832} stroke={C.wood} strokeWidth={5} />)}
          <path d="M 840 740 Q 960 708 1080 740 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={900} cy={716} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 886 714 Q 891 720 896 714 M 904 714 Q 909 720 914 714" stroke={KRP.ink} strokeWidth={3.5} fill="none" />
          <circle cx={900} cy={730} r={4} fill={C.nose} />
          {/* 幌 */}
          <path d="M 1100 740 Q 1120 640 1020 626 L 1010 740 Z" fill={C.queen} stroke={KRP.ink} strokeWidth={5} />
          {/* 寝息 */}
          <text x={850 - (f % 30)} y={680 - (f % 30)} fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.white} opacity={0.7 - (f % 30) / 50}>z</text>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #33 泣いて頼む母親に、小男は、ひとつだけ逃げ道を出します。
// 格: 並 / seed 4033
// 絵: 泣くお妃 (涙の粒が f で落ちる) と、腕を組んで考える小男。小男の頭上に「指を3本立てた手」の札がぽん。寝室のろうそくの火がゆらぐ
// どこ: #32と同じ寝室・同じ夜。壁のタペストリーの前、ろうそくの小机をはさんで2人が向かい合う
// 演出: 泣いて手を合わせて頼むお妃と、腕を組んで天井をにらんで考える小男。小男の頭上に「指3本の手」の札がぽん
// 動き: 涙の粒が次々こぼれる / ろうそくの火が大きくゆらぎ壁の光もゆれる / f8〜 小男の「…」/ f20〜28 札がぽんと出て小さく揺れる / カメラが左から右へパン
const NB1ThreeHand: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f / 7) * 3})`}>
    {/* 吊りひもと木の札 */}
    <path d="M -80 -150 L 0 -200 L 80 -150" stroke={KRP.ink} strokeWidth={5} fill="none" />
    <circle cx={0} cy={-200} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-140} y={-150} width={280} height={290} rx={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-126} y={-136} width={252} height={262} rx={16} fill="none" stroke={C.wood} strokeWidth={4} />
    {/* 指を3本立てた手 */}
    <g transform="translate(0 30)">
      {[-36, 0, 36].map((dx, i) => (
        <rect key={i} x={dx - 15} y={-150 + (i === 1 ? -14 : 0)} width={30} height={110} rx={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      ))}
      <rect x={-62} y={-60} width={118} height={120} rx={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* 折った小指と、押さえる親指 */}
      <path d="M 52 -40 Q 76 -30 62 -6" stroke={KRP.ink} strokeWidth={5} fill={KRP.white} />
      <rect x={-74} y={-28} width={96} height={28} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(-12 -74 -14)" />
      <rect x={-40} y={58} width={78} height={34} rx={8} fill={C.kobito} stroke={KRP.ink} strokeWidth={5} />
    </g>
  </g>
);

const Nm033: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const sc = 1.06;
  const tx = 960 * (1 - sc) + 20 - pan * 60;
  const sign = pop(seg(f, 20, 28));
  const flick = 1 + Math.sin(f / 2.2) * 0.08 + Math.sin(f / 3.7) * 0.06;
  const lean = Math.sin(f / 5) * 8;
  const qx = 600, qy = 930, qs = 1.15;
  const kx = 1330, ky = 930, ks = 0.98;
  return (
    <Frame f={f} seed={4033} bg={C.wallNight} dark>
      <defs>
        <radialGradient id="nb1-33glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.fireCore} stopOpacity={0.6} />
          <stop offset="0.5" stopColor={C.fire} stopOpacity={0.18} />
          <stop offset="1" stopColor={C.fire} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${tx} ${540 * (1 - sc)}) scale(${sc})`}>
        {/* 壁と腰板 */}
        <rect x={-80} y={-60} width={W + 160} height={820} fill={C.wallNight} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 150 - 40} y1={-60} x2={i * 150 - 40} y2={600} stroke={C.wallNightDark} strokeWidth={6} opacity={0.6} />
        ))}
        <rect x={-80} y={600} width={W + 160} height={150} fill={C.wallNightDark} stroke={KRP.ink} strokeWidth={5} />
        {/* タペストリー (城と森の織物) */}
        <g>
          <rect x={720} y={60} width={480} height={430} fill={C.curtainDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={744} y={84} width={432} height={382} fill={C.curtain} stroke={C.gold} strokeWidth={5} />
          <path d="M 744 400 L 840 300 L 900 360 L 980 240 L 1060 340 L 1110 290 L 1176 380 L 1176 466 L 744 466 Z" fill={C.leafDark} />
          <rect x={920} y={180} width={60} height={110} fill={C.stoneNight} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 912 182 L 950 130 L 988 182 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={1110} cy={150} r={26} fill={C.moon} stroke={KRP.ink} strokeWidth={3} />
          <rect x={700} y={44} width={520} height={22} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={736 + i * 40} y1={490} x2={736 + i * 40 + Math.sin(f / 10 + i) * 3} y2={520} stroke={C.gold} strokeWidth={5} />
          ))}
        </g>
        {/* ベッドの天蓋カーテンの端 (左)・窓の月明かり (右) */}
        <path d="M -80 -60 L 160 -60 Q 120 300 180 760 L -80 760 Z" fill={C.curtainDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 40 -60 Q 0 300 60 760" stroke={C.curtain} strokeWidth={14} fill="none" />
        <path d="M 1900 0 L 2040 0 L 2040 760 L 1700 760 Z" fill={C.moon} opacity={0.1} />
        {/* 床と敷物 */}
        <rect x={-80} y={746} width={W + 160} height={400} fill="#4A3828" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={960} cy={940} rx={760} ry={120} fill={C.rugDark} stroke={KRP.ink} strokeWidth={6} />
        {/* ろうそくの光 (壁に大きくゆれる) */}
        <circle cx={960} cy={560} r={520 * flick} fill="url(#nb1-33glow)" />
        {/* 小机とろうそく */}
        <g>
          <ellipse cx={960} cy={720} rx={150} ry={26} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <rect x={944} y={740} width={32} height={150} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={960} cy={896} rx={80} ry={16} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={960} cy={712} rx={56} ry={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={942} y={590} width={36} height={122} rx={5} fill={C.candle} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 948 600 Q 944 630 952 640" stroke={C.pageDark} strokeWidth={6} fill="none" />
          <line x1={960} y1={590} x2={960} y2={578} stroke={KRP.ink} strokeWidth={3} />
          <g transform={`rotate(${lean} 960 584)`}>
            <NB1Flame x={960} y={584} s={0.42} f={f} />
          </g>
        </g>
        {/* お妃: 泣いて手を合わせて頼む */}
        <g>
          <path d={`M ${qx - 70} ${qy - 60} L ${qx - 100} ${qy} L ${qx + 100} ${qy} L ${qx + 70} ${qy - 60} Z`} fill={C.queenDark} stroke={KRP.ink} strokeWidth={5} transform={`rotate(7 ${qx} ${qy})`} />
          <Person x={qx} y={qy} s={qs} f={f} face="sad" pose="hold" still cloth={C.queen} clothDark={C.queenDark} lean={7} gaze={[6, -2]} />
          <g transform={`translate(${qx} ${qy}) rotate(7) scale(${qs})`}>
            <path d="M -66 -60 Q 0 -40 66 -60 L 92 0 Q 0 14 -92 0 Z" fill={C.queen} stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -40 -160 Q 0 -140 40 -160" stroke={C.gold} strokeWidth={6} fill="none" />
            <NB1Crown />
            {/* 合わせた両手 */}
            <path d="M -16 -150 Q 0 -176 16 -150 L 14 -112 L -14 -112 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            {/* こぼれる涙 */}
            {Array.from({ length: 6 }, (_, i) => {
              const side = i % 2 ? 1 : -1;
              const tt = ((f + i * 7) % 21) / 21;
              const yy = -200 + tt * 150;
              const xx = side * (24 + tt * 26);
              return (
                <path key={i} d={`M ${xx} ${yy - 12} Q ${xx - 8} ${yy} ${xx} ${yy + 5} Q ${xx + 8} ${yy} ${xx} ${yy - 12} Z`}
                  fill={KRP.blue} stroke={KRP.ink} strokeWidth={2.5} opacity={1 - tt * 0.8} />
              );
            })}
            {/* 床に落ちた涙のしみ */}
            <ellipse cx={30} cy={-4} rx={30} ry={6} fill={KRP.blue} opacity={0.35} />
          </g>
        </g>
        {/* 小男: 腕を組んで考える */}
        <NB1Kobito x={kx} y={ky} s={ks} f={f} face="normal" pose="armsFolded" lean={-4 + Math.sin(f / 12) * 2} gaze={[5, -7]} />
        {/* 考え中の「…」 */}
        {Array.from({ length: 3 }, (_, i) => (
          <circle key={i} cx={kx - 150 + i * 34} cy={ky - 330} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5}
            opacity={seg(f, 6 + i * 4, 9 + i * 4) * (1 - seg(f, 20, 26))} />
        ))}
        {/* 指3本の札 */}
        {sign > 0 && (
          <g>
            <NB1ThreeHand x={kx + 70} y={ky - 640} s={0.82 * sign} f={f} />
            <g stroke={C.goldLight} strokeWidth={6} strokeLinecap="round" opacity={sign}>
              <line x1={kx - 110} y1={ky - 760} x2={kx - 150} y2={ky - 790} />
              <line x1={kx + 250} y1={ky - 760} x2={kx + 290} y2={ky - 790} />
              <line x1={kx - 120} y1={ky - 640} x2={kx - 170} y2={ky - 640} />
              <line x1={kx + 260} y1={ky - 640} x2={kx + 310} y2={ky - 640} />
            </g>
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #34 3日のうちに、わたしの名前を当ててみろ。
// 格: 山 / seed 4034
// 絵: ★小男の決めポーズ。片足で跳ねながら自分の胸を指す。背後の壁に3枚の日めくり (1日目・2日目・3日目) が f で順にめくれる。床には、お妃が書いた**名前の候補のメモ**がたくさん散らばる (字は波線・いくつかに赤い×)。`QMark` を小男の頭上に
// どこ: 寝室の一角 (ろうそくに照らされた板壁)。床にはお妃が書きなぐった名前の候補のメモが散らばる
// 演出: 小男が片足で跳ねながら、自分の胸を親指でさす決めポーズ。背後の壁に3枚の日めくり。頭上に「？」
// 動き: 日めくりが f8/f18/f28 に1枚ずつめくれて「1日目→2日目→3日目」/ 小男はぴょんぴょん跳ねる / メモがはらりと増える / カメラが小男へ寄る
const NB1DayCal: React.FC<{ x: number; y: number; label: string; t: number; hot?: boolean }> = ({ x, y, label, t, hot }) => {
  const k = Math.cos(Math.PI * clamp01(t));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-118} y={-12} width={236} height={196} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      {/* めくれたあとに見えるページ */}
      <rect x={-104} y={6} width={208} height={166} rx={6} fill={C.calPaper} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-104} y={6} width={208} height={36} fill={hot ? KRP.red : KRP.blueDeep} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={128} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={hot ? KRP.red : KRP.ink}>{label}</text>
      {/* 上の白紙 (上辺を軸にめくれ上がる) */}
      {t < 1 && (
        <g transform={`translate(0 6) scale(1 ${k}) translate(0 -6)`}>
          <rect x={-104} y={6} width={208} height={166} rx={6} fill={k > 0 ? C.calPaper : C.pageDark} stroke={KRP.ink} strokeWidth={4.5} />
          {k > 0 && <rect x={-104} y={6} width={208} height={36} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />}
        </g>
      )}
      {/* とじ金具 */}
      {[-60, 0, 60].map((dx) => <circle key={dx} cx={dx} cy={2} r={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />)}
      <line x1={0} y1={-12} x2={0} y2={-40} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-44} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

const Nm034: React.FC<{ f: number }> = ({ f }) => {
  const sc = 1.0 + easeInOut(seg(f, 0, 42)) * 0.06;
  const kx = 960, ky = 905, ks = 1.36;
  const flick = 1 + Math.sin(f / 2.6) * 0.05;
  const notes: [number, number, number, boolean][] = Array.from({ length: 22 }, (_, i) => {
    const xx = 90 + rnd(34, i) * 1740;
    const yy = 790 + rnd(35, i) * 250;
    return [xx, yy, (rnd(36, i) - 0.5) * 60, rnd(37, i) > 0.55];
  });
  return (
    <Frame f={f} seed={4034} bg={C.wallDark}>
      <defs>
        <radialGradient id="nb1-34spot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.fireCore} stopOpacity={0.45} />
          <stop offset="1" stopColor={C.fireCore} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${960 * (1 - sc)} ${620 * (1 - sc)}) scale(${sc})`}>
        {/* 板壁 (ろうそく色) */}
        <rect x={-60} y={-60} width={W + 120} height={820} fill={C.wall} />
        {Array.from({ length: 16 }, (_, i) => (
          <g key={i}>
            <line x1={i * 130 - 20} y1={-60} x2={i * 130 - 20} y2={760} stroke={C.wallDark} strokeWidth={6} />
            <circle cx={i * 130 + 40} cy={120 + rnd(38, i) * 500} r={6} fill={C.wallDark} />
          </g>
        ))}
        <rect x={-60} y={690} width={W + 120} height={40} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 左右の燭台 (壁付け) */}
        {[180, 1740].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={300} r={170 * flick} fill="url(#nb1-34spot)" />
            <path d={`M ${x - 30} 420 Q ${x} 460 ${x + 30} 420 L ${x + 8} 380 L ${x - 8} 380 Z`} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            <rect x={x - 14} y={300} width={28} height={84} rx={4} fill={C.candle} stroke={KRP.ink} strokeWidth={4} />
            <NB1Flame x={x} y={298} s={0.3} f={f} phase={i * 9} />
          </g>
        ))}
        {/* 3枚の日めくり */}
        <NB1DayCal x={520} y={76} label="1日目" t={easeInOut(seg(f, 6, 12))} />
        <NB1DayCal x={960} y={76} label="2日目" t={easeInOut(seg(f, 16, 22))} />
        <NB1DayCal x={1400} y={76} label="3日目" t={easeInOut(seg(f, 26, 32))} hot />
        {/* 床 */}
        <rect x={-60} y={726} width={W + 120} height={420} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={790 + i * 66} x2={W + 60} y2={790 + i * 66} stroke={C.wood} strokeWidth={5} />)}
        {/* 小男の足元の光 */}
        <ellipse cx={kx} cy={ky} rx={360} ry={70} fill={C.fireCore} opacity={0.3} />
        {/* 名前の候補のメモ (波線・いくつかに赤い×) */}
        {notes.map(([nx, ny, nr, bad], i) => {
          const t = pop(seg(f, (i % 8) * 3, (i % 8) * 3 + 8));
          if (Math.abs(nx - kx) < 130 && ny < 900) return null;
          return (
            <g key={i} transform={`translate(${nx} ${ny}) rotate(${nr}) scale(${t})`}>
              <rect x={-62} y={-42} width={124} height={84} rx={4} fill={i % 3 ? C.page : C.calPaper} stroke={KRP.ink} strokeWidth={4} />
              {[-20, 0, 20].map((yy) => <path key={yy} d={`M -44 ${yy} q 11 -7 22 0 t 22 0 t 22 0 t 22 0`} stroke={KRP.grayDark} strokeWidth={4} fill="none" />)}
              {bad && (
                <g stroke={KRP.red} strokeWidth={9} strokeLinecap="round">
                  <line x1={-34} y1={-30} x2={34} y2={30} />
                  <line x1={34} y1={-30} x2={-34} y2={30} />
                </g>
              )}
            </g>
          );
        })}
        {/* 羽ペンとインク壺・丸めた紙 */}
        <g>
          <path d="M 1560 800 Q 1540 770 1566 760 L 1606 760 Q 1630 770 1612 800 Z" fill={C.nightMid} stroke={KRP.ink} strokeWidth={4.5} />
          <g transform="translate(1596 760) rotate(28)">
            <path d="M 0 0 Q 16 -60 6 -130 Q -14 -70 0 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {[[300, 770], [1420, 790], [700, 800]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={26} fill={C.page} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${x - 16} ${y - 6} l 10 8 l 8 -12 l 10 10`} stroke={KRP.grayDark} strokeWidth={3} fill="none" />
            </g>
          ))}
        </g>
        {/* 小男: 片足で跳ねて自分の胸をさす */}
        <NB1Kobito x={kx} y={ky} s={ks} f={f} face="joy" pose="hold" hop={1} lean={-5} />
        <g transform={`translate(${kx} ${ky - Math.abs(Math.sin(f / 5)) * 46 * ks}) rotate(${-5 + Math.sin(f / 5) * 5}) scale(${ks})`}>
          {/* 胸をさす手 (ひげの上に出す): こぶしと、自分を指す人さし指 */}
          <rect x={4} y={-140} width={52} height={18} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={58} cy={-128} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 48 -116 Q 58 -110 68 -116" stroke={KRP.ink} strokeWidth={3.5} fill="none" />
          <g stroke={C.gold} strokeWidth={5} strokeLinecap="round">
            <line x1={-30} y1={-150} x2={-56} y2={-170} />
            <line x1={-36} y1={-120} x2={-66} y2={-120} />
          </g>
        </g>
        {/* 頭上の？ */}
        <QMark x={kx + 270} y={ky - 470} s={1.3} f={f} t={seg(f, 2, 12)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #35 最後の日、森の中で、小男が自分の名前を歌っているのが聞かれてしまいます。
// 格: 山 / seed 4035
// 絵: 夜の森。たき火のまわりを片足で跳ねて歌う小男 (音符が f で飛ぶ)。手前の茂みのかげに、使いの者がしゃがんで耳に手を当てて聞いている (後ろ姿・耳に向かって音符が吸いこまれる)。小さな小屋・月・フクロウ
// どこ: 夜の森の奥の空き地。月・小さな小屋 (窓に灯り・煙突の煙)・枝のフクロウ
// 演出: たき火のまわりを片足で跳ねて歌う小男。手前の茂みのかげで、使いの者 (後ろ姿・旅の帽子) が耳に手を当てて聞く。歌の音符がその耳へ吸いこまれていく
// 動き: 小男がたき火のまわりを回りながら跳ねる / 音符が次々に飛んで耳で小さくなって消える / フクロウがまばたきして首をかしげる / 火がゆらぎ火の粉 / カメラが茂みの方へゆっくり寄る
const Nm035: React.FC<{ f: number }> = ({ f }) => {
  const sc = 1.0 + easeInOut(seg(f, 0, 42)) * 0.07;
  const fx = 1120, fy = 730;
  const ang = f / 9 + 0.6;
  const kx = fx + Math.cos(ang) * 260;
  const ky = fy + 40 + Math.sin(ang) * 46;
  const behind = Math.sin(ang) < 0;
  const ks = 0.95;
  const ex = 380, ey = 1010, es = 1.15;
  const earX = ex + 72 * es, earY = ey - 226 * es;
  const mouthX = kx, mouthY = ky - 190 * ks;
  const flick = 1 + Math.sin(f / 2.5) * 0.06;
  const owlBlink = (f % 40) < 4;
  const owlTilt = Math.sin(f / 10) * 12;
  const kobito = (
    <NB1Kobito x={kx} y={ky} s={ks} f={f} face="joy" pose="banzai" hop={1} sing lean={Math.cos(ang) * 4} />
  );
  return (
    <Frame f={f} seed={4035} bg={C.nightDeep} dark>
      <defs>
        <linearGradient id="nb1-35sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.nightDeep} />
          <stop offset="1" stopColor={C.nightMid} />
        </linearGradient>
        <radialGradient id="nb1-35fire" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.fireCore} stopOpacity={0.7} />
          <stop offset="0.4" stopColor={C.fire} stopOpacity={0.3} />
          <stop offset="1" stopColor={C.fire} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${700 * (1 - sc)} ${760 * (1 - sc)}) scale(${sc})`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#nb1-35sky)" />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={rnd(41, i) * W} cy={rnd(42, i) * 380} r={2 + rnd(43, i) * 3} fill={C.moon} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 8 + i))} />
        ))}
        {/* 月 */}
        <circle cx={300} cy={180} r={120} fill={C.moon} opacity={0.15} />
        <circle cx={300} cy={180} r={82} fill={C.moon} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={276} cy={160} r={14} fill={C.pageDark} opacity={0.6} />
        <circle cx={330} cy={210} r={10} fill={C.pageDark} opacity={0.6} />
        {/* 遠くの森 */}
        <path d={`M -60 620 ${Array.from({ length: 24 }, (_, i) => `L ${i * 90 - 20} ${430 + rnd(44, i) * 90} L ${i * 90 + 25} 620`).join(" ")} L 2000 1100 L -60 1100 Z`} fill={C.treeMid} />
        <path d={`M -60 680 ${Array.from({ length: 18 }, (_, i) => `L ${i * 120} ${520 + rnd(45, i) * 90} L ${i * 120 + 60} 680`).join(" ")} L 2000 1100 L -60 1100 Z`} fill={C.leafDark} />
        {/* 小屋 (窓の灯り・煙突の煙) */}
        <g>
          <rect x={1480} y={520} width={240} height={170} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 4 }, (_, i) => <line key={i} x1={1480} y1={555 + i * 36} x2={1720} y2={555 + i * 36} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />)}
          <path d="M 1456 528 L 1600 420 L 1744 528 Z" fill={C.hatDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1660} y={430} width={34} height={70} fill={C.stoneNight} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 4 }, (_, i) => {
            const tt = ((f + i * 10) % 40) / 40;
            return <circle key={i} cx={1677 + tt * 50 + Math.sin(tt * 6) * 10} cy={420 - tt * 160} r={12 + tt * 22} fill={KRP.gray} opacity={0.5 * (1 - tt)} />;
          })}
          <rect x={1520} y={580} width={60} height={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1550} y1={580} x2={1550} y2={636} stroke={KRP.ink} strokeWidth={3} />
          <rect x={1630} y={590} width={52} height={100} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 地面 */}
        <path d="M -60 700 Q 600 670 1200 700 Q 1600 720 2000 690 L 2000 1140 L -60 1140 Z" fill={C.leafDark} />
        {/* フクロウの木 (右) */}
        <path d="M 1840 1100 Q 1830 600 1860 -60 L 1990 -60 L 1990 1100 Z" fill={C.tree} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1860 290 Q 1760 280 1620 300" stroke={C.tree} strokeWidth={22} strokeLinecap="round" fill="none" />
        <g transform={`translate(1700 230) rotate(${owlTilt})`}>
          <ellipse cx={0} cy={20} rx={44} ry={56} fill={C.owl} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={36} rx={26} ry={34} fill={C.page} opacity={0.8} />
          <path d="M -36 -22 L -42 -54 L -16 -32 Z M 36 -22 L 42 -54 L 16 -32 Z" fill={C.owlDark} stroke={KRP.ink} strokeWidth={4} />
          {owlBlink ? (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round"><line x1={-28} y1={-8} x2={-8} y2={-8} /><line x1={8} y1={-8} x2={28} y2={-8} /></g>
          ) : (
            <g>
              <circle cx={-18} cy={-8} r={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={18} cy={-8} r={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={-16} cy={-8} r={6} fill={KRP.ink} />
              <circle cx={16} cy={-8} r={6} fill={KRP.ink} />
            </g>
          )}
          <path d="M -6 6 L 6 6 L 0 18 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -14 74 l 0 10 M 0 76 l 0 10 M 14 74 l 0 10" stroke={KRP.orange} strokeWidth={5} />
        </g>
        {/* 左の太い幹 */}
        <path d="M 60 1100 Q 80 600 40 -60 L -60 -60 L -60 1100 Z" fill={C.tree} stroke={KRP.ink} strokeWidth={5} />
        {/* たき火の光 */}
        <circle cx={fx} cy={fy - 40} r={480 * flick} fill="url(#nb1-35fire)" />
        {/* 奥側にいるときの小男 */}
        {behind && kobito}
        {/* たき火 */}
        <g>
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} cx={fx + (i - 4) * 30} cy={fy + 20 - Math.abs(i - 4) * 4} rx={18} ry={12} fill={C.stoneNight} stroke={KRP.ink} strokeWidth={3.5} />
          ))}
          <rect x={fx - 80} y={fy - 14} width={160} height={24} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} transform={`rotate(-14 ${fx} ${fy})`} />
          <rect x={fx - 80} y={fy - 14} width={160} height={24} rx={10} fill={C.wood} stroke={KRP.ink} strokeWidth={4} transform={`rotate(16 ${fx} ${fy})`} />
          <NB1Flame x={fx} y={fy} s={1.15} f={f} />
          {Array.from({ length: 8 }, (_, i) => {
            const tt = ((f * 1.2 + i * 11) % 36) / 36;
            return <circle key={i} cx={fx + Math.sin(i * 2.3 + tt * 5) * 50} cy={fy - 100 - tt * 260} r={5 - tt * 3} fill={C.fireCore} opacity={1 - tt} />;
          })}
        </g>
        {/* 手前側にいるときの小男 */}
        {!behind && kobito}
        {/* 歌の音符 → 使いの者の耳へ吸いこまれる */}
        {Array.from({ length: 7 }, (_, i) => {
          const tt = ((f + i * 6) % 42) / 42;
          const px = lerp(mouthX, earX, tt);
          const py = lerp(mouthY, earY, tt) - Math.sin(tt * Math.PI) * 170;
          const ss = tt < 0.75 ? 0.9 + Math.sin(f / 4 + i) * 0.1 : 0.9 * (1 - (tt - 0.75) / 0.25);
          return <NB1Note key={i} x={px} y={py} s={Math.max(0.05, ss)} rot={Math.sin(f / 5 + i) * 15} two={i % 3 === 0} o={tt < 0.05 ? tt * 20 : 1} />;
        })}
        {/* 耳もとの吸いこみの渦 */}
        <g transform={`translate(${earX + 30} ${earY - 10}) rotate(${-f * 8})`} opacity={0.8}>
          <path d="M 0 -34 A 34 34 0 0 1 34 0" stroke={C.goldLight} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M 0 24 A 24 24 0 0 1 -24 0" stroke={C.goldLight} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        {/* 使いの者 (後ろ姿・茂みのかげで耳に手を当てる) */}
        <g>
          <Person x={ex} y={ey} s={es} f={f} cloth={C.envoy} clothDark={C.envoyDark} pose="raise" still lean={6} />
          <g transform={`translate(${ex} ${ey}) rotate(6) scale(${es})`}>
            {/* 背中のマント */}
            <path d="M -60 -168 Q 0 -150 60 -168 L 80 -40 L -80 -40 Z" fill={C.envoyDark} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
            <NB1BackHead hair={C.hairDark} />
            {/* 旅の帽子 */}
            <ellipse cx={0} cy={-262} rx={86} ry={16} fill={C.envoyDark} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -50 -266 Q -48 -320 0 -322 Q 48 -320 50 -266 Z" fill={C.envoy} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-50} y={-282} width={100} height={12} fill={C.envoyDark} />
            {/* 耳に当てた手 */}
            <ellipse cx={80} cy={-228} rx={18} ry={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        </g>
        {/* 手前の茂み */}
        <g>
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={40 + i * 90} cy={880 + Math.abs(i - 4) * 18 + Math.sin(f / 9 + i) * 3} r={90 - Math.abs(i - 4) * 6}
              fill={i % 2 ? C.leaf : C.leafDark} stroke={KRP.ink} strokeWidth={5} />
          ))}
          <rect x={-60} y={930} width={900} height={200} fill={C.leafDark} />
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M ${20 + i * 60} ${860 + rnd(46, i) * 40} q 14 -10 26 4`} stroke={KRP.green} strokeWidth={5} fill="none" opacity={0.5} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_027: (f) => <Nm027 f={f} />,
  nm_028: (f) => <Nm028 f={f} />,
  nm_029: (f) => <Nm029 f={f} />,
  nm_030: (f) => <Nm030 f={f} />,
  nm_031: (f) => <Nm031 f={f} />,
  nm_032: (f) => <Nm032 f={f} />,
  nm_033: (f) => <Nm033 f={f} />,
  nm_034: (f) => <Nm034 f={f} />,
  nm_035: (f) => <Nm035 f={f} />,
};

export const NM_B1_MOTIFS: string[] = [
  "nm_027", // #27
  "nm_028", // #28
  "nm_029", // #29
  "nm_030", // #30
  "nm_031", // #31
  "nm_032", // #32
  "nm_033", // #33
  "nm_034", // #34
  "nm_035", // #35
];

export const namaeB1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
