// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#82〜#91 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L2b。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./YawaShared";
import { YP, Squishy, DameSofa, AgeDial, KaradaChizu } from "./YawaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/YP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 講堂 (YawaD1 #80 とそろえる)
  stone: "#D2C8B6", stoneDark: "#A89D8A", stoneDeep: "#857A68",
  glass1: "#D35A4A", glass2: "#4F7FC0", glass3: "#E8C24E", glass4: "#6FA86A",
  student: "#5A6478", studentDark: "#434B5C",
  woodMid: "#7E5532", woodDeep: "#5B3B24", shelf: "#8A5A34",
  mantle: "#2F2A28", habitWhite: "#F2EFE6", togaShade: "#CFC4AC",
  leather: "#7A3B2A", parchment: "#EBDBB0", parchDark: "#CDB98A", brownInk: "#4A2E1C",
  flame: "#F4B942", flameCore: "#FFF0B8",
  // 序のリビング (YawaA #7・#8 とそろえる)
  livingWall: "#F4E5C8", livingFloor: "#D3AE7C", rug: "#D98C6E", rugDark: "#B96D52",
  curtain: "#E7B85C", curtainDark: "#C99A3E", plant: "#6FA15A", plantDark: "#4F7E3E",
  pot: "#C77A4E", tvBlack: "#2E2E36", tvStand: "#9C7449", lounge: "#9DB7A0", loungeDark: "#7A9680",
  boxTop: "#E8D2A8", sky: "#CFE3EC", skyLow: "#F3E6CC",
  // #83 クッションと木箱
  velvet: "#A83A3A", velvetDark: "#7E2A2E", velvetLight: "#C9605A", iron: "#4A4A52",
  // #84 中世の町
  plaster: "#EFE3C8", timber: "#5B3B24", roofMed: "#7A4E3A", cobble: "#BDB3A2", cobbleDark: "#9A8F7E",
  merchant: "#B0563C", merchantDark: "#8A3F2A", awning: "#C9503F",
  townA: "#5E7F8C", townADark: "#46636E", townB: "#8C6F9E", townBDark: "#6E5580",
  townC: "#6F8F5A", townCDark: "#56723F", townD: "#C08A3E", townDDark: "#9A6C2C",
  apple: "#D2463A", basket: "#B08848",
  // フランチェスコと修道院
  habit: "#8A6A48", habitDark: "#6B5036", rope: "#F4EFE2", friarHair: "#4A3626",
  feather: "#FBF7EE", featherShade: "#DDD3BE",
  // #88 和紙と墨
  desk: "#8C6540", deskDark: "#6C4A2C", felt: "#2F3A34", washi: "#F6F0E0", washiFiber: "#E3D8BF",
  sumi: "#1E1A18", suzuri: "#3A3836", seal: "#C0392B", bronze: "#8E7444",
  // #90 夜
  night: "#1C2238", nightStone: "#3B4058", nightStoneDark: "#2B2F44", moon: "#F3EAC8",
  moonBeam: "#DCE6F2", straw: "#C9AE6A", strawDark: "#A88E4E", devil: "#141726",
  // #91 アッシジ
  hillFar: "#B8C4B0", hillMid: "#9FB08A", hillNear: "#B7B47A", assisi: "#EAD3C0", assisiDark: "#CDB29C",
  roof: "#C8714A", roofDark: "#9E5434", olive: "#8C9A62", oliveDark: "#66733F", oliveLight: "#B7C08E",
  cypress: "#3F5A3A", cypressDark: "#2C4029", path: "#D9C7A2", pathDark: "#BFA97E", bird: "#6B5A4A",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void YP; void Squishy; void DameSofa; void AgeDial; void KaradaChizu;
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
const camT = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;
const MINCHO = "'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP',serif";

type PersonP = React.ComponentProps<typeof Person>;

// Person を包む。back = 体の後ろ / children = 体の前 (どちらも Person の s=1・足元原点の座標)
// 体のゆれ (bob) と傾き (lean) を上乗せの絵にも同じようにかける
const L2bFig: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; lean?: number;
  p?: Partial<PersonP>; back?: React.ReactNode; children?: React.ReactNode;
}> = ({ x, y, s, f, phase = 0, lean = 0, p = {}, back, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {back}
      <Person x={0} y={0} s={1} f={f} phase={phase} still {...p} />
      {children}
    </g>
  );
};

// 頭頂を剃った形 (髪の輪 + 剃った頭頂)
const L2bTonsure: React.FC<{ hair?: string }> = ({ hair = KRP.ink }) => (
  <g>
    <path d="M -62 -238 Q -66 -292 0 -295 Q 66 -292 62 -238 Q 50 -258 30 -262 L -30 -262 Q -50 -258 -62 -238 Z" fill={hair} />
    <ellipse cx={0} cy={-276} rx={40} ry={17} fill={KRP.white} />
    <path d="M -42 -284 Q 0 -298 42 -284" fill="none" stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// トマス・アクィナス (白い修道服+黒いマント+剃髪。#80 と同じ姿)
const L2bAquinas: React.FC<{
  x: number; y: number; s: number; f: number; face?: PersonP["face"]; pose?: PersonP["pose"];
  gaze?: [number, number]; lean?: number; phase?: number; book?: boolean;
}> = ({ x, y, s, f, face = "smile", pose = "stand", gaze = [0, 0], lean = 0, phase = 2, book = false }) => (
  <L2bFig x={x} y={y} s={s} f={f} phase={phase} lean={lean}
    back={<path d="M -70 -164 Q -96 -90 -96 -10 L 96 -10 Q 96 -90 70 -164 Z" fill={C.mantle} stroke={KRP.ink} strokeWidth={5} />}
    p={{ face, cloth: C.habitWhite, clothDark: C.togaShade, hair: "none", pose, gaze }}>
    <L2bTonsure />
    <path d="M -60 -110 L -34 -110 L -40 -10 L -70 -10 Z" fill={C.mantle} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M 60 -110 L 34 -110 L 40 -10 L 70 -10 Z" fill={C.mantle} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -72 -168 Q 0 -130 72 -168 L 66 -142 Q 0 -110 -66 -142 Z" fill={C.mantle} stroke={KRP.ink} strokeWidth={4.5} />
    {pose === "raise" && (
      <g>
        <rect x={60} y={-282} width={14} height={44} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={67} cy={-236} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 58 -232 Q 67 -226 76 -232" fill="none" stroke={KRP.ink} strokeWidth={3} />
      </g>
    )}
    {book && (
      <g transform="translate(0 -122)">
        <rect x={-96} y={-10} width={192} height={30} rx={6} fill={C.leather} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 0 -6 Q -50 -26 -92 -14 L -92 14 Q -50 2 0 18 Q 50 2 92 14 L 92 -14 Q 50 -26 0 -6 Z" fill={C.parchment} stroke={KRP.ink} strokeWidth={5} />
        <line x1={0} y1={-6} x2={0} y2={18} stroke={KRP.ink} strokeWidth={4} />
        {[-70, -45, 30, 55].map((lx) => <line key={lx} x1={lx} y1={-8} x2={lx + 20} y2={-8} stroke={C.brownInk} strokeWidth={3} />)}
      </g>
    )}
  </L2bFig>
);

// フランチェスコ (茶色の粗い修道服・白い縄の帯 (結び目3つ)・裸足・剃髪)
const L2bFrancis: React.FC<{
  x: number; y: number; s: number; f: number; face?: PersonP["face"]; pose?: PersonP["pose"];
  pointDir?: 1 | -1; gaze?: [number, number]; lean?: number; phase?: number;
}> = ({ x, y, s, f, face = "smile", pose = "stand", pointDir = 1, gaze = [0, 0], lean = 0, phase = 3 }) => {
  const sway = Math.sin(f / 5) * 4;
  return (
    <L2bFig x={x} y={y} s={s} f={f} phase={phase} lean={lean}
      back={<ellipse cx={0} cy={-158} rx={76} ry={30} fill={C.habitDark} stroke={KRP.ink} strokeWidth={4.5} />}
      p={{ face, cloth: C.habit, clothDark: C.habitDark, hair: "none", pose, pointDir, gaze }}>
      <L2bTonsure hair={C.friarHair} />
      {/* 長いすそ (足首まで) */}
      <path d={`M -58 -70 L ${-68 + sway} -14 L ${68 + sway} -14 L 58 -70 Z`} fill={C.habit} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M -20 -60 L ${-24 + sway} -16 M 22 -60 L ${26 + sway} -16`} stroke={C.habitDark} strokeWidth={3.5} />
      {/* つぎあて */}
      <rect x={-44} y={-140} width={26} height={22} rx={3} fill={C.habitDark} stroke={KRP.ink} strokeWidth={3} />
      <path d="M -40 -136 L -22 -122 M -22 -136 L -40 -122" stroke={C.habit} strokeWidth={2} />
      {/* 縄の帯と結び目3つ */}
      <rect x={-60} y={-102} width={120} height={11} rx={5} fill={C.rope} stroke={KRP.ink} strokeWidth={3.5} />
      <path d={`M 26 -92 Q ${30 + sway * 0.6} -60 ${24 + sway} -30`} fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <path d={`M 26 -92 Q ${30 + sway * 0.6} -60 ${24 + sway} -30`} fill="none" stroke={C.rope} strokeWidth={5} strokeLinecap="round" />
      {[0.25, 0.55, 0.85].map((k) => (
        <circle key={k} cx={26 + (sway * 0.9) * k + 3 * Math.sin(k * 3)} cy={-92 + 62 * k} r={6} fill={C.rope} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {/* 裸足 (靴の黒を肌で上書き) */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * 18} cy={-4} rx={20} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((t) => <line key={t} x1={d * 18 + d * (6 + t * 5)} y1={-10} x2={d * 18 + d * (6 + t * 5)} y2={-4} stroke={KRP.ink} strokeWidth={2} />)}
        </g>
      ))}
    </L2bFig>
  );
};

// 尖頭窓の形 (h = 直線部の上端からとがり先までの高さ)
const L2bLancet = (x: number, w: number, ya: number, yb: number, h = 230) =>
  `M ${x - w} ${yb} L ${x - w} ${ya} Q ${x - w} ${ya - h * 0.7} ${x} ${ya - h} Q ${x + w} ${ya - h * 0.7} ${x + w} ${ya} L ${x + w} ${yb} Z`;

// 石積みの壁 (目地)
const L2bBricks: React.FC<{ x0: number; y0: number; cols: number; rows: number; bw: number; bh: number; stroke: string; sw?: number }> = ({
  x0, y0, cols, rows, bw, bh, stroke, sw = 5,
}) => (
  <g fill="none" stroke={stroke} strokeWidth={sw}>
    {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (
      <rect key={`${r}-${c}`} x={x0 + c * bw + (r % 2) * (bw / 2)} y={y0 + r * bh} width={bw - 6} height={bh - 6} rx={6} />
    )))}
  </g>
);

// ろうそく (燭台つき)
const L2bCandle: React.FC<{ x: number; y: number; s?: number; f: number; h?: number }> = ({ x, y, s = 1, f, h = 90 }) => {
  const fl = 1 + Math.sin(f / 2.3) * 0.12;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-h - 26} r={60} fill={C.flame} opacity={0.18 + Math.sin(f / 3) * 0.04} />
      <ellipse cx={0} cy={0} rx={40} ry={10} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-14} y={-h} width={28} height={h} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M -14 ${-h + 6} q 6 14 0 24`} fill="none" stroke={C.togaShade} strokeWidth={4} />
      <path d={`M 0 ${-h - 4} Q ${-12 * fl} ${-h - 24} 0 ${-h - 50 * fl} Q ${12 * fl} ${-h - 24} 0 ${-h - 4} Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={0} cy={-h - 18} rx={4} ry={9} fill={C.flameCore} />
    </g>
  );
};

// 序のリビング (#7・#8 と同じ部屋: 生成りの壁・木の床・カーテンの窓・観葉植物・テレビ)
const L2bLiving: React.FC<{ f: number; floorY?: number }> = ({ f, floorY = 820 }) => {
  const cw = Math.sin(f / 14) * 6;
  return (
    <g>
      <rect x={-60} y={-60} width={W + 120} height={floorY + 60} fill={C.livingWall} />
      {Array.from({ length: 20 }, (_, i) => (
        <line key={i} x1={i * 100} y1={0} x2={i * 100} y2={floorY - 30} stroke={C.curtainDark} strokeWidth={3} opacity={0.12} />
      ))}
      <rect x={-60} y={floorY - 30} width={W + 120} height={30} fill={C.boxTop} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-60} y={floorY} width={W + 120} height={H - floorY + 60} fill={C.livingFloor} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={-60} y1={floorY + 34 + i * 40} x2={W + 60} y2={floorY + 34 + i * 40} stroke={YP.woodDark} strokeWidth={3} opacity={0.3} />
      ))}
      {/* 窓とカーテン */}
      <rect x={1320} y={170} width={400} height={430} fill={C.sky} stroke={KRP.ink} strokeWidth={7} />
      <ellipse cx={1440} cy={280} rx={70} ry={26} fill={KRP.white} opacity={0.85} />
      <ellipse cx={1610} cy={360} rx={54} ry={20} fill={KRP.white} opacity={0.7} />
      <line x1={1520} y1={170} x2={1520} y2={600} stroke={C.tvStand} strokeWidth={12} />
      <line x1={1320} y1={385} x2={1720} y2={385} stroke={C.tvStand} strokeWidth={12} />
      <rect x={1320} y={170} width={400} height={430} fill="none" stroke={KRP.ink} strokeWidth={7} />
      <rect x={1290} y={600} width={460} height={22} rx={5} fill={C.tvStand} stroke={KRP.ink} strokeWidth={5} />
      {([[1250, 1], [1790, -1]] as const).map(([cx, d]) => (
        <path key={cx} d={`M ${cx - 50} 140 L ${cx + 50} 140 Q ${cx + 40 + cw * d} 400 ${cx + 60 + cw * d} 660 L ${cx - 60 + cw * d} 660 Q ${cx - 40 + cw * d} 400 ${cx - 50} 140 Z`}
          fill={C.curtain} stroke={KRP.ink} strokeWidth={6} />
      ))}
      {[1230, 1270, 1770, 1810].map((x) => <path key={x} d={`M ${x} 160 Q ${x + cw} 400 ${x + cw * 1.4} 640`} fill="none" stroke={C.curtainDark} strokeWidth={5} />)}
      <rect x={1180} y={124} width={680} height={20} rx={10} fill={C.tvStand} stroke={KRP.ink} strokeWidth={5} />
      {/* テレビ */}
      <rect x={110} y={650} width={420} height={floorY - 650} rx={8} fill={C.tvStand} stroke={KRP.ink} strokeWidth={6} />
      <line x1={320} y1={660} x2={320} y2={floorY - 8} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={290} cy={730} r={7} fill={KRP.ink} /><circle cx={350} cy={730} r={7} fill={KRP.ink} />
      <rect x={130} y={400} width={380} height={236} rx={10} fill={C.tvBlack} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 160 430 L 230 430 L 170 520 Z" fill={KRP.white} opacity={0.12} />
      <rect x={300} y={636} width={40} height={16} fill={C.tvBlack} />
      {/* 観葉植物 */}
      <path d={`M 1830 ${floorY - 4} L 1800 ${floorY - 130} L 1900 ${floorY - 130} L 1870 ${floorY - 4} Z`} fill={C.pot} stroke={KRP.ink} strokeWidth={5} />
      {[-50, -20, 10, 40, 70].map((a, i) => (
        <ellipse key={i} cx={1850 + Math.sin((a * Math.PI) / 180) * 80} cy={floorY - 210 - Math.cos((a * Math.PI) / 180) * 60}
          rx={26} ry={70} fill={i % 2 ? C.plant : C.plantDark} stroke={KRP.ink} strokeWidth={4.5}
          transform={`rotate(${a + Math.sin(f / 16 + i) * 3} ${1850 + Math.sin((a * Math.PI) / 180) * 80} ${floorY - 210 - Math.cos((a * Math.PI) / 180) * 60})`} />
      ))}
    </g>
  );
};

// 羽毛の枕 (ふっくら。x,y は底の中心 / w は幅)
const L2bPillow: React.FC<{ x: number; y: number; w: number; h: number; f: number; dent?: number; rot?: number; fill?: string; shade?: string }> = ({
  x, y, w, h, f, dent = 0, rot = 0, fill = C.feather, shade = C.featherShade,
}) => {
  const b = Math.sin(f / 9) * 3;
  const D = dent * h * 0.35;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={4} rx={w * 0.52} ry={14} fill={KRP.ink} opacity={0.16} />
      <path d={`M ${-w / 2 + 4} -4 L ${-w / 2 - 14} 4 L ${-w / 2 + 2} -16 Q ${-w / 2 - 46} ${-h / 2} ${-w / 2 + 8} ${-h + 16} L ${-w / 2 - 10} ${-h + 4} L ${-w / 2 + 18} ${-h + 10}
        Q ${-w / 4} ${-h - 46 - b} ${-w * 0.08} ${-h - 22 + D * 0.5}
        Q 0 ${-h - 10 + D} ${w * 0.08} ${-h - 22 + D * 0.5} Q ${w / 4} ${-h - 46 - b} ${w / 2 - 18} ${-h + 10} L ${w / 2 + 10} ${-h + 4} L ${w / 2 - 8} ${-h + 16}
        Q ${w / 2 + 46} ${-h / 2} ${w / 2 - 2} -16 L ${w / 2 + 14} 4 L ${w / 2 - 4} -4 Q 0 14 ${-w / 2 + 4} -4 Z`}
        fill={fill} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={w * 0.06} cy={-h * 0.36} rx={w * 0.34} ry={h * 0.22} fill={shade} opacity={0.45} />
      <path d={`M ${-w * 0.36} ${-h * 0.22} Q 0 ${-h * 0.08} ${w * 0.36} ${-h * 0.22}`} fill="none" stroke={shade} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${-w * 0.3} ${-h * 0.74} Q ${-w * 0.15} ${-h * 0.84} 0 ${-h * 0.78}`} fill="none" stroke={KRP.white} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${-w * 0.42} ${-h * 0.5} Q ${-w * 0.36} ${-h * 0.4} ${-w * 0.4} ${-h * 0.3}`} fill="none" stroke={shade} strokeWidth={5} strokeLinecap="round" />
      {/* はみ出した羽 */}
      {[[-w * 0.38, -h * 0.9, -30], [w * 0.3, -h * 0.98, 24]].map(([fx, fy, r], i) => (
        <g key={i} transform={`translate(${fx} ${fy}) rotate(${r + Math.sin(f / 7 + i) * 6})`}>
          <path d="M 0 0 Q -10 -22 0 -40 Q 10 -22 0 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <line x1={0} y1={0} x2={0} y2={-36} stroke={KRP.ink} strokeWidth={2} />
        </g>
      ))}
    </g>
  );
};

// ふわふわ舞う羽 (1枚)
const L2bFeather: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M 0 22 Q -14 0 0 -26 Q 14 0 0 22 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    <line x1={0} y1={26} x2={0} y2={-22} stroke={KRP.ink} strokeWidth={2} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#82 【並】 そのたとえが、なかなか見事です。
// 設計: アクィナスが指を1本立てて「ここからが大事」の顔。学生たちが身を乗り出す
// どこ: #80 と同じ石の講堂。教壇に寄った中景 (後ろに大きなステンドグラス・両脇に柱と壁の燭台)
// 演出: アクィナスが「ぴっ」と人差し指を1本立てる (きらりと光る)。前列・後列の学生がいっせいに身を乗り出し、1人は蝋板に書く手が止まる
// 動き: カメラが教壇へ寄る / f8〜12 指が上がる+振りの線 / f12〜28 指先のきらめき / f16〜32 学生が前のめり / ろうそくの炎・ガラスの光がゆれる
const Yw082: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const up = f >= 10;
  const swoosh = seg(f, 9, 17);
  const ping = seg(f, 12, 28);
  const lean = easeOut(seg(f, 16, 32));
  const AS = 1.65, AX = 960, AY = 760;
  const fx = AX + 67 * AS, fy = AY - 282 * AS;
  const student = (x: number, y: number, s: number, ph: number, cloth: string, pose: PersonP["pose"] = "stand") => {
    const dir = x < 960 ? 1 : -1;
    return (
      <L2bFig key={`${x}-${y}`} x={x} y={y} s={s} f={f} phase={ph} lean={dir * (2 + 12 * lean)}
        p={{ face: lean > 0.4 ? (ph % 2 ? "surprised" : "normal") : "normal", cloth, clothDark: C.studentDark, hair: "cap", gaze: [dir * 9, -7], pose }}>
        {pose === "hold" && (
          <g transform="translate(0 -122)">
            <rect x={-46} y={-30} width={92} height={60} rx={5} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={-38} y={-22} width={76} height={44} rx={3} fill={C.strawDark} stroke={KRP.ink} strokeWidth={3} />
            {[-10, 2, 14].map((ly) => <line key={ly} x1={-30} y1={ly} x2={22} y2={ly} stroke={C.brownInk} strokeWidth={3} />)}
            <line x1={30} y1={-40} x2={10} y2={6} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
      </L2bFig>
    );
  };
  return (
    <Frame f={f} seed={3082} bg={C.stone}>
      <g transform={camT(960, 420, z)}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.stone} />
        <L2bBricks x0={-100} y0={-30} cols={11} rows={8} bw={200} bh={100} stroke={C.stoneDark} />
        {/* 天井のリブ */}
        {[-200, 640, 1280, 2120].map((x, i, a) => i < a.length - 1 && (
          <path key={x} d={`M ${x} -10 Q ${(x + a[i + 1]) / 2} 110 ${a[i + 1]} -10`} fill="none" stroke={C.stoneDark} strokeWidth={12} />
        ))}
        {/* 大きなステンドグラス (アクィナスの頭の後ろ) */}
        <defs><clipPath id="l2b82w"><path d={L2bLancet(960, 150, 330, 640, 220)} /></clipPath></defs>
        <polygon points="810,640 1110,640 1300,760 620,760" fill={C.glass3} opacity={0.16 + Math.sin(f / 9) * 0.03} />
        <path d={L2bLancet(960, 172, 330, 660, 240)} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#l2b82w)">
          {Array.from({ length: 8 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
            <rect key={`${r}-${c}`} x={810 + c * 50} y={100 + r * 70} width={50} height={70}
              fill={[C.glass1, C.glass2, C.glass3, C.glass4][(r + c) % 4]} stroke={KRP.ink} strokeWidth={4}
              opacity={0.82 + Math.sin(f / 8 + r * 1.3 + c) * 0.12} />
          )))}
        </g>
        <path d={L2bLancet(960, 150, 330, 640, 220)} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={960} cy={220} r={54} fill={C.glass3} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={960} y1={220} x2={960 + Math.cos((i * Math.PI) / 4) * 54} y2={220 + Math.sin((i * Math.PI) / 4) * 54} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 柱 */}
        {[640, 1280].map((x) => (
          <g key={x}>
            <rect x={x - 40} y={150} width={80} height={600} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
            <line x1={x - 14} y1={170} x2={x - 14} y2={740} stroke={C.stoneDark} strokeWidth={5} />
            <line x1={x + 14} y1={170} x2={x + 14} y2={740} stroke={C.stoneDark} strokeWidth={5} />
            <path d={`M ${x - 70} 150 L ${x + 70} 150 L ${x + 44} 196 L ${x - 44} 196 Z`} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
            <rect x={x - 60} y={730} width={120} height={30} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
        {/* 壁の燭台 */}
        {[260, 1660].map((x, i) => (
          <g key={x}>
            <path d={`M ${x - 30} 420 L ${x + 30} 420 L ${x + 10} 470 L ${x - 10} 470 Z`} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
            <L2bCandle x={x} y={420} s={0.9} f={f + i * 7} h={70} />
          </g>
        ))}
        {/* 床 */}
        <rect x={-60} y={720} width={W + 120} height={420} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 180 - 100} y1={720} x2={i * 230 - 330} y2={1100} stroke={C.stone} strokeWidth={5} />
        ))}
        {/* 後列の学生 */}
        {[240, 470, 1450, 1680].map((x, i) => student(x, 760, 0.55, i + 1, i % 2 ? C.student : C.woodMid))}
        {[[120, 580], [1340, 1800]].map(([a, b]) => (
          <rect key={a} x={a} y={700} width={b - a} height={56} rx={8} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* アクィナス */}
        <L2bAquinas x={AX} y={AY} s={AS} f={f} pose={up ? "raise" : "stand"} face={up ? "smile" : "normal"} gaze={up ? [-6, -2] : [0, 3]} />
        {/* 指を振り上げた線 */}
        {swoosh > 0 && swoosh < 1 && (
          <g fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - swoosh}>
            <path d={`M ${fx + 40} ${fy + 170} Q ${fx + 70} ${fy + 80} ${fx + 30} ${fy + 10}`} />
            <path d={`M ${fx + 70} ${fy + 190} Q ${fx + 104} ${fy + 100} ${fx + 64} ${fy + 24}`} />
          </g>
        )}
        {/* 指先のきらめき */}
        {ping > 0 && (
          <g opacity={ping < 0.8 ? 1 : (1 - ping) * 5 * 0.6 + 0.4}>
            <circle cx={fx} cy={fy - 6} r={30 + 16 * ping} fill={YP.glow} opacity={0.35} />
            {Array.from({ length: 8 }, (_, i) => {
              const an = (i / 8) * Math.PI * 2 + 0.2;
              const r1 = 40 + 20 * ping, r2 = 70 + 40 * ping;
              return <line key={i} x1={fx + Math.cos(an) * r1} y1={fy - 6 + Math.sin(an) * r1} x2={fx + Math.cos(an) * r2} y2={fy - 6 + Math.sin(an) * r2}
                stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />;
            })}
            <path d={`M ${fx + 96} ${fy - 70} l 8 22 l 22 8 l -22 8 l -8 22 l -8 -22 l -22 -8 l 22 -8 Z`} fill={YP.glow} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* 教壇 (手前) */}
        <rect x={775} y={600} width={370} height={200} fill={C.woodMid} stroke={KRP.ink} strokeWidth={7} />
        <rect x={752} y={584} width={416} height={30} rx={6} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
        {[845, 960, 1075].map((ax) => (
          <path key={ax} d={`M ${ax - 38} 770 L ${ax - 38} 680 Q ${ax} 636 ${ax + 38} 680 L ${ax + 38} 770 Z`} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {/* 教壇の上の開いた本とろうそく */}
        <g transform="translate(900 586)">
          <path d="M 0 -6 Q -60 -30 -110 -14 L -104 6 Q -56 -8 0 10 Q 56 -8 104 6 L 110 -14 Q 60 -30 0 -6 Z" fill={C.parchment} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-6} x2={0} y2={10} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <L2bCandle x={1110} y={586} s={0.8} f={f} h={60} />
        {/* 前列の学生と長椅子 */}
        {[180, 430, 1490, 1740].map((x, i) => student(x, 1000, 1.0, i + 7, i % 3 === 1 ? C.woodMid : C.student, i === 1 ? "hold" : "stand"))}
        {[[20, 640], [1280, 1900]].map(([a, b]) => (
          <rect key={a} x={a} y={900} width={b - a} height={70} rx={8} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#83 【山】 柔弱とは、触れると、すぐに凹んでしまうもののことだ、と。
// 設計: ★アクィナスのたとえを絵で。大きな指が、柔らかいクッションをつんと押す → 深く凹む (f で)。隣の硬い木の箱は、押しても凹まない。札「すぐ凹む」
// どこ: 講堂の大きな木の机の上 (寄り)。奥は石の壁と窓からの光、机の上にインク壺と羽根ペン・本の山・ろうそく
// 演出: たとえを実演する。上から大きな指 (白い袖と黒いマント=アクィナスの手) が、まず右の硬い木箱をコツンと押す → 凹まない。
//       次に左の赤いビロードのクッションをつんと押すと、ずぶっと深く凹む (しわが走り、両脇がふくらみ、空気が抜ける線)
// 動き: f4〜14 箱をコツン (衝撃線・札「凹まない」) / f14〜22 指が左へ移動 / f22〜36 クッションに沈む (凹み最大で止まる) / f30〜40 札「すぐ凹む」/ カメラはクッションへ寄る
const L2bFinger: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 袖 (黒いマントと白い修道服の袖口) */}
    <rect x={-120} y={-1300} width={240} height={980} fill={C.mantle} stroke={KRP.ink} strokeWidth={7} />
    <line x1={-60} y1={-1280} x2={-50} y2={-340} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
    <rect x={-104} y={-372} width={208} height={70} rx={14} fill={C.habitWhite} stroke={KRP.ink} strokeWidth={6} />
    <line x1={-90} y1={-350} x2={90} y2={-350} stroke={C.togaShade} strokeWidth={5} />
    {/* 人差し指 */}
    <rect x={-30} y={-240} width={60} height={244} rx={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
    <path d="M -18 -40 Q -20 -10 0 -6 Q 20 -10 18 -40 Q 0 -48 -18 -40 Z" fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
    {[-150, -96].map((ly) => <path key={ly} d={`M -16 ${ly} Q 0 ${ly + 8} 16 ${ly}`} fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />)}
    {/* にぎった手 */}
    <path d="M -96 -300 Q -112 -220 -60 -176 Q -10 -150 60 -170 Q 112 -196 104 -270 Q 96 -320 -96 -300 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
    {[-182, -206, -232].map((ly, i) => (
      <path key={ly} d={`M ${36 + i * 6} ${ly} Q ${80 + i * 4} ${ly - 4} ${96 - i * 2} ${ly - 22}`} fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    ))}
    <path d="M -84 -262 Q -60 -230 -34 -236" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
  </g>
);
const Yw083: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.07 * easeInOut(seg(f, 14, 42));
  // 指の動き
  const tapT = seg(f, 4, 14);
  const move = easeInOut(seg(f, 14, 22));
  const press = easeOut(seg(f, 22, 36));
  const CX = 700, CB = 800, CH = 236; // クッション中心x・底・高さ
  const BX = 1390, BT = 500; // 箱の中心x・上面
  let tx: number, ty: number;
  if (f < 14) { tx = BX; ty = 300 + (BT - 300) * Math.sin(Math.PI * tapT); }
  else if (f < 22) { tx = lerp(BX, CX, move); ty = 300 - 60 * Math.sin(Math.PI * move); }
  else { tx = CX; ty = lerp(300, CB - CH + 130, press); }
  const D = Math.max(0, ty - (CB - CH)); // 凹みの深さ
  const dk = D / 130;
  const knock = seg(f, 9, 18);
  const puff = seg(f, 28, 40);
  const sx = 1 + 0.07 * dk;
  return (
    <Frame f={f} seed={3083} bg={C.stone}>
      <g transform={camT(CX, 600, z)}>
        {/* 奥の石の壁と窓の光 */}
        <rect x={-60} y={-60} width={W + 120} height={560} fill={C.stone} />
        <L2bBricks x0={-80} y0={-40} cols={11} rows={5} bw={200} bh={108} stroke={C.stoneDark} />
        <path d={L2bLancet(1640, 90, 220, 470, 170)} fill={C.glass3} stroke={KRP.ink} strokeWidth={7} opacity={0.9} />
        <line x1={1640} y1={60} x2={1640} y2={470} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="1550,470 1730,470 1200,900 820,900" fill={C.flameCore} opacity={0.22} />
        {/* 机 */}
        <rect x={-60} y={500} width={W + 120} height={620} fill={C.woodMid} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M -60 ${560 + i * 80} q 480 ${rnd(83, i) * 30 - 15} 1000 0 q 500 ${rnd(84, i) * 30 - 15} 1000 0`} fill="none" stroke={C.woodDeep} strokeWidth={4} opacity={0.5} />
        ))}
        <rect x={-60} y={500} width={W + 120} height={24} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
        {/* 机の小物: インク壺と羽根ペン・本の山・ろうそく */}
        <g transform="translate(110 780)">
          <ellipse cx={0} cy={0} rx={60} ry={16} fill={KRP.ink} opacity={0.2} />
          <path d="M -50 0 Q -60 -70 -30 -90 L 30 -90 Q 60 -70 50 0 Z" fill={C.suzuri} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-90} rx={32} ry={9} fill={C.sumi} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${-14 + Math.sin(f / 12) * 2} 0 -90)`}>
            <line x1={0} y1={-90} x2={30} y2={-330} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 8 -150 Q 70 -250 34 -340 Q 0 -250 8 -150 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            {[0, 1, 2, 3].map((i) => <line key={i} x1={20 + i * 3} y1={-180 - i * 36} x2={48 - i * 2} y2={-200 - i * 36} stroke={KRP.ink} strokeWidth={2.5} />)}
          </g>
        </g>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${1080} ${800 - i * 46}) rotate(${(i - 1) * 3})`}>
            <rect x={-90 + i * 6} y={-44} width={180 - i * 12} height={44} rx={6} fill={[C.leather, C.woodDeep, C.townADark][i]} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-80 + i * 6} y={-34} width={160 - i * 12} height={8} fill={C.parchment} />
          </g>
        ))}
        <L2bCandle x={1760} y={790} s={1.1} f={f} h={110} />
        {/* 硬い木の箱 (鉄の帯・真鍮の角・錠前) */}
        <g transform={`translate(${BX} 800)`}>
          <ellipse cx={0} cy={6} rx={210} ry={20} fill={KRP.ink} opacity={0.18} />
          <rect x={-190} y={-300} width={380} height={300} rx={8} fill={YP.wood} stroke={KRP.ink} strokeWidth={7} />
          {[-230, -160, -90].map((gy, i) => (
            <path key={gy} d={`M -180 ${gy} q 90 ${8 - i * 4} 180 0 q 90 ${-6 + i * 3} 180 0`} fill="none" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
          ))}
          {[-120, 120].map((bx) => <rect key={bx} x={bx - 18} y={-300} width={36} height={300} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />)}
          {[-120, 120].map((bx) => [-270, -150, -30].map((ry) => <circle key={`${bx}${ry}`} cx={bx} cy={ry} r={6} fill={C.stoneDark} />))}
          <rect x={-190} y={-300} width={380} height={34} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-34} y={-200} width={68} height={80} rx={8} fill={YP.brass} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-170} r={9} fill={KRP.ink} />
          <rect x={-4} y={-170} width={8} height={26} fill={KRP.ink} />
          {[[-190, -300], [190, -300], [-190, 0], [190, 0]].map(([qx, qy], i) => (
            <rect key={i} x={qx - 20} y={qy - 20} width={40} height={40} rx={6} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        {/* コツンの衝撃線 (箱は凹まない) */}
        {knock > 0 && knock < 1 && (
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={1 - knock}>
            {[-1, 1].map((d) => (
              <g key={d}>
                <line x1={BX + d * 60} y1={BT - 10} x2={BX + d * (100 + 30 * knock)} y2={BT - 40 - 20 * knock} />
                <line x1={BX + d * 70} y1={BT + 14} x2={BX + d * (120 + 30 * knock)} y2={BT + 8} />
              </g>
            ))}
          </g>
        )}
        {/* ビロードのクッション */}
        <g transform={`translate(${CX} ${CB}) scale(${sx} 1)`}>
          <ellipse cx={0} cy={8} rx={330} ry={24} fill={KRP.ink} opacity={0.2} />
          <path d={`M -300 -14 Q -330 -120 -290 ${-CH + 10} Q -170 ${-CH - 18} -80 ${-CH - 2 + D * 0.3}
            Q -34 ${-CH + D} 0 ${-CH + D} Q 34 ${-CH + D} 80 ${-CH - 2 + D * 0.3} Q 170 ${-CH - 18} 290 ${-CH + 10} Q 330 -120 300 -14 Q 0 10 -300 -14 Z`}
            fill={C.velvet} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          {/* 金の縁取り刺繍 */}
          <path d={`M -262 -40 Q -286 -120 -252 ${-CH + 36} Q -150 ${-CH + 14} -70 ${-CH + 26 + D * 0.32} Q 0 ${-CH + 30 + D * 0.9} 70 ${-CH + 26 + D * 0.32}
            Q 150 ${-CH + 14} 252 ${-CH + 36} Q 286 -120 262 -40 Q 0 -20 -262 -40 Z`}
            fill="none" stroke={YP.brass} strokeWidth={6} strokeDasharray="16 10" />
          <path d="M -230 -70 Q 0 -50 230 -70" fill="none" stroke={C.velvetLight} strokeWidth={10} strokeLinecap="round" opacity={0.6} />
          {/* 凹みの陰としわ */}
          {dk > 0.02 && (
            <g>
              <ellipse cx={0} cy={-CH + D * 0.75} rx={50 + 50 * dk} ry={20 + 34 * dk} fill={C.velvetDark} opacity={0.85} />
              {[-1, 1].map((d) => [0, 1].map((k) => (
                <path key={`${d}${k}`} d={`M ${d * (56 + k * 10)} ${-CH + D * (0.7 - k * 0.2)} Q ${d * (110 + k * 50)} ${-CH + D * 0.3 + k * 40} ${d * (150 + k * 70)} ${-CH + 30 + k * 70}`}
                  fill="none" stroke={C.velvetDark} strokeWidth={6} strokeLinecap="round" opacity={dk} />
              )))}
            </g>
          )}
          {/* 四隅のふさ */}
          {[[-300, -14], [300, -14], [-290, -CH + 10], [290, -CH + 10]].map(([qx, qy], i) => (
            <g key={i} transform={`translate(${qx} ${qy}) rotate(${(qx < 0 ? 20 : -20) + Math.sin(f / 6 + i) * 6})`}>
              <circle r={12} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -12 6 L -18 54 L 18 54 L 12 6 Z" fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
              {[-10, 0, 10].map((lx) => <line key={lx} x1={lx} y1={20} x2={lx * 1.4} y2={52} stroke={YP.brassDark} strokeWidth={3} />)}
            </g>
          ))}
        </g>
        {/* 空気が抜ける線 (ふしゅっ) */}
        {puff > 0 && puff < 1 && (
          <g fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - puff}>
            {[-1, 1].map((d) => (
              <g key={d}>
                <path d={`M ${CX + d * (340 + 40 * puff)} ${640} q ${d * 30} -10 ${d * 50} 10`} />
                <path d={`M ${CX + d * (350 + 50 * puff)} ${700} q ${d * 34} 0 ${d * 56} 20`} />
              </g>
            ))}
          </g>
        )}
        {/* 大きな指 */}
        <L2bFinger x={tx} y={ty} />
        {/* 札 */}
        <TagPlate x={BX} y={700} text="凹まない" size={40} t={seg(f, 12, 20)} />
        <TagPlate x={330} y={420} text="すぐ凹む" size={54} t={seg(f, 30, 38)} rot={-4} />
        <Arrow x={CX - 70} y={CB - CH + 70} s={0.9} rot={30} t={seg(f, 32, 40)} />
      </g>
    </Frame>
  );
};

// ---- 文#84 【山】 少し押されただけで、すぐに引き下がってしまう人のことです。
// 設計: 中世の町の広場。押し売りの商人に軽く押されただけで、ふにゃっと後ずさりする人 (Person、体がクッションのように描かれた比喩ではなく、表情と lean で)。後ろの人も将棋倒しに
// どこ: 中世の町の広場 (木組みの家並み・奥に教会の尖塔・石畳・右に縞の日よけの露店と壺)
// 演出: 羽根つき帽子の押し売り商人が、壺を片手に指1本で「ちょん」とつつく。つつかれた男は困り顔でへなっと後ろへ傾き、
//       その後ろの3人も順に将棋倒し。最後の女性はかごのリンゴをばらまく。ニワトリが跳ねて逃げる
// 動き: f6〜12 商人が踏み込んでつつく (ちょんの線) / f11〜39 4人が順に傾く / f30〜42 リンゴが転がる / f20〜30 ニワトリ跳ねる / カメラは倒れる方向 (左) へパン
const Yw084: React.FC<{ f: number }> = ({ f }) => {
  const poke = easeOut(seg(f, 6, 12));
  const back = easeOut(seg(f, 14, 22));
  const xm = lerp(1500, 1395, poke) + 16 * back;
  const touch = seg(f, 11, 20);
  const pan = 70 * easeInOut(seg(f, 10, 42));
  const z = 1.03;
  const fallers = [
    { x: 1150, cloth: C.townA, dark: C.townADark, hat: "none" as const },
    { x: 935, cloth: C.townB, dark: C.townBDark, hat: "cap" as const },
    { x: 725, cloth: C.townC, dark: C.townCDark, hat: "none" as const },
    { x: 515, cloth: C.townD, dark: C.townDDark, hat: "coif" as const },
  ];
  const appleT = seg(f, 30, 42);
  const hen = seg(f, 20, 30);
  const houses = [
    { x: -40, w: 300, top: 150 }, { x: 250, w: 260, top: 210 }, { x: 500, w: 300, top: 130 },
    { x: 1160, w: 290, top: 170 }, { x: 1440, w: 260, top: 220 }, { x: 1690, w: 300, top: 140 },
  ];
  return (
    <Frame f={f} seed={3084} bg={C.sky}>
      <g transform={camT(960, 560, z, pan)}>
        <rect x={-200} y={-60} width={W + 400} height={700} fill={C.sky} />
        <ellipse cx={420} cy={110} rx={120} ry={34} fill={KRP.white} opacity={0.8} />
        {/* 教会の尖塔 */}
        <g>
          <rect x={890} y={160} width={140} height={480} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 880 164 L 960 -10 L 1040 164 Z" fill={C.roofMed} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          <line x1={960} y1={-10} x2={960} y2={-60} stroke={KRP.ink} strokeWidth={6} />
          <line x1={940} y1={-40} x2={980} y2={-40} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 935 300 L 935 240 Q 960 210 985 240 L 985 300 Z" fill={C.timber} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 948 290 Q 960 ${270 + Math.sin(f / 4) * 6} 972 290 Z`} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
          <L2bBricks x0={896} y0={330} cols={2} rows={3} bw={70} bh={60} stroke={C.stoneDark} sw={4} />
        </g>
        {/* 木組みの家並み */}
        {houses.map((h, i) => (
          <g key={i}>
            <rect x={h.x} y={h.top} width={h.w} height={640 - h.top} fill={i % 2 ? C.plaster : C.boxTop} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M ${h.x - 20} ${h.top + 4} L ${h.x + h.w / 2} ${h.top - 150} L ${h.x + h.w + 20} ${h.top + 4} Z`} fill={i % 2 ? C.roofMed : C.timber} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            <g stroke={C.timber} strokeWidth={12}>
              <line x1={h.x + 8} y1={h.top} x2={h.x + 8} y2={640} />
              <line x1={h.x + h.w - 8} y1={h.top} x2={h.x + h.w - 8} y2={640} />
              <line x1={h.x} y1={h.top + (640 - h.top) * 0.48} x2={h.x + h.w} y2={h.top + (640 - h.top) * 0.48} />
              <line x1={h.x + h.w / 2} y1={h.top} x2={h.x + h.w / 2} y2={h.top + (640 - h.top) * 0.48} />
              <line x1={h.x + 8} y1={h.top + (640 - h.top) * 0.48} x2={h.x + h.w / 2} y2={640} />
              <line x1={h.x + h.w - 8} y1={h.top + (640 - h.top) * 0.48} x2={h.x + h.w / 2} y2={640} />
            </g>
            {[0.25, 0.75].map((k) => (
              <g key={k}>
                <rect x={h.x + h.w * k - 30} y={h.top + 40} width={60} height={70} fill={C.townADark} stroke={KRP.ink} strokeWidth={5} />
                <line x1={h.x + h.w * k} y1={h.top + 40} x2={h.x + h.w * k} y2={h.top + 110} stroke={KRP.ink} strokeWidth={4} />
                <rect x={h.x + h.w * k - 46} y={h.top + 40} width={14} height={70} fill={C.shelf} stroke={KRP.ink} strokeWidth={3} />
              </g>
            ))}
          </g>
        ))}
        {/* 井戸 (左奥) */}
        <g transform="translate(110 660)">
          <rect x={-90} y={-90} width={180} height={90} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
          <L2bBricks x0={-86} y0={-86} cols={3} rows={2} bw={60} bh={44} stroke={C.stoneDark} sw={4} />
          <line x1={-76} y1={-90} x2={-76} y2={-220} stroke={C.timber} strokeWidth={12} />
          <line x1={76} y1={-90} x2={76} y2={-220} stroke={C.timber} strokeWidth={12} />
          <path d="M -110 -210 L 0 -270 L 110 -210 Z" fill={C.roofMed} stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={-216} x2={0} y2={-140} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-18} y={-140} width={36} height={30} fill={C.basket} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 石畳 */}
        <rect x={-200} y={640} width={W + 400} height={500} fill={C.cobble} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, r) => Array.from({ length: 22 }, (_, c) => (
          <ellipse key={`${r}-${c}`} cx={-180 + c * (100 + r * 6) + (r % 2) * 50} cy={666 + r * (34 + r * 4)} rx={40 + r * 3} ry={12 + r * 2}
            fill="none" stroke={C.cobbleDark} strokeWidth={4} />
        )))}
        {/* 露店 (縞の日よけ・壺・布の反物) */}
        <g>
          {[1340, 1900].map((px) => <rect key={px} x={px - 10} y={330} width={20} height={330} fill={C.timber} stroke={KRP.ink} strokeWidth={5} />)}
          <path d={`M 1300 330 L 1940 330 L 1940 400 ${Array.from({ length: 8 }, (_, i) => `Q ${1900 - i * 80} ${440 + Math.sin(f / 6 + i) * 4} ${1860 - i * 80} 400`).join(" ")} L 1300 400 Z`}
            fill={C.awning} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 4 }, (_, i) => <rect key={i} x={1340 + i * 160} y={330} width={80} height={70} fill={C.plaster} opacity={0.9} />)}
          <rect x={1300} y={330} width={640} height={70} fill="none" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1320} y={600} width={600} height={40} rx={6} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1340} y={640} width={560} height={80} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
          {[1600, 1690, 1780, 1860].map((jx, i) => (
            <g key={jx} transform={`translate(${jx} 600)`}>
              <path d={`M -26 0 Q -40 -50 -16 ${-80 - i * 6} L -12 ${-100 - i * 6} L 12 ${-100 - i * 6} L 16 ${-80 - i * 6} Q 40 -50 26 0 Z`} fill={i % 2 ? C.pot : C.roof} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M -28 -44 Q 0 -36 28 -44`} fill="none" stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {[[1700, 560, C.townB], [1800, 530, C.townC]].map(([bx, by, col], i) => (
            <rect key={i} x={Number(bx) - 40} y={Number(by) - 60} width={80} height={60} rx={10} fill={String(col)} stroke={KRP.ink} strokeWidth={5} />
          ))}
        </g>
        {/* 将棋倒しの4人 (つつかれた男が先頭) */}
        {fallers.map((p, i) => {
          const t = easeInOut(seg(f, 11 + i * 5, 23 + i * 5));
          const lean = -t * (14 + i * 7);
          const sh = i > 0 ? Math.sin(seg(f, 11 + i * 5, 17 + i * 5) * Math.PI) * 6 : 0;
          return (
            <L2bFig key={i} x={p.x - sh} y={820} s={1.15} f={f} phase={i * 3 + 1} lean={lean}
              p={{ face: i === 0 ? "worried" : t > 0.2 ? "surprised" : "normal", cloth: p.cloth, clothDark: p.dark,
                hair: p.hat === "coif" ? "none" : "cap", gaze: [i === 0 ? 10 : 8, i === 0 ? -2 : -6], pose: i === 3 ? "hold" : "stand" }}>
              {p.hat === "coif" && (
                <path d="M -68 -226 Q -72 -302 0 -304 Q 72 -302 68 -226 L 58 -170 Q 44 -150 30 -166 Q 52 -250 0 -256 Q -52 -250 -30 -166 Q -44 -150 -58 -170 Z"
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              )}
              {i === 0 && (
                <g>
                  <path d="M 70 -270 Q 62 -250 70 -240 Q 78 -250 70 -270 Z" fill={C.sky} stroke={KRP.ink} strokeWidth={3} />
                  <path d="M -70 -24 Q -90 -10 -110 -20 M -66 -8 Q -90 6 -114 -2" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={seg(f, 14, 20)} />
                </g>
              )}
              {i === 3 && f < 30 && (
                <g transform="translate(0 -110)">
                  <path d="M -48 -20 L 48 -20 L 38 26 L -38 26 Z" fill={C.basket} stroke={KRP.ink} strokeWidth={4.5} />
                  {[-26, 0, 26].map((ax) => <circle key={ax} cx={ax} cy={-26} r={15} fill={C.apple} stroke={KRP.ink} strokeWidth={3.5} />)}
                  <path d="M -40 -20 Q 0 -80 40 -20" fill="none" stroke={KRP.ink} strokeWidth={4} />
                </g>
              )}
            </L2bFig>
          );
        })}
        {/* 転がるリンゴと落ちたかご */}
        {f >= 30 && (
          <g>
            <g transform={`translate(${430 - 40 * appleT} ${lerp(700, 800, Math.min(1, appleT * 2.2))}) rotate(${-70 * appleT})`}>
              <path d="M -48 -20 L 48 -20 L 38 26 L -38 26 Z" fill={C.basket} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
            {[0, 1, 2, 3, 4].map((k) => {
              const ax = 430 - (60 + k * 70) * appleT;
              const ay = 640 + 170 * Math.min(1, appleT * (1.6 + k * 0.2)) - Math.abs(Math.sin(appleT * (6 + k))) * 26 * appleT;
              return <circle key={k} cx={ax} cy={Math.min(ay, 812)} r={15} fill={C.apple} stroke={KRP.ink} strokeWidth={3.5} />;
            })}
          </g>
        )}
        {/* 押し売りの商人 (羽根つき帽子・壺を抱える・指1本でちょん) */}
        <L2bFig x={xm} y={820} s={1.2} f={f} phase={5} lean={-6 * poke + 3 * back}
          p={{ face: "smile", cloth: C.merchant, clothDark: C.merchantDark, hair: "cap", pose: "point", pointDir: -1, gaze: [-10, 2] }}>
          <ellipse cx={0} cy={-270} rx={94} ry={18} fill={C.timber} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -54 -274 Q -50 -334 0 -338 Q 50 -334 54 -274 Z" fill={C.timber} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-54} y={-292} width={108} height={14} fill={C.awning} />
          <path d={`M 40 -290 Q 110 ${-360 + Math.sin(f / 5) * 6} 130 -330 Q 100 -320 40 -290 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 18 -198 Q 30 -204 40 -196" fill="none" stroke={KRP.ink} strokeWidth={4} />
          {/* 右手の壺 */}
          <g transform="translate(76 -60)">
            <path d="M -26 0 Q -44 -50 -16 -84 L -12 -100 L 12 -100 L 16 -84 Q 44 -50 26 0 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -30 -46 Q 0 -38 30 -46" fill="none" stroke={KRP.ink} strokeWidth={3} />
          </g>
          <circle cx={67} cy={-66} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-180} y={-152} width={34} height={9} rx={4.5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </L2bFig>
        {/* ちょんの線 */}
        {touch > 0 && touch < 1 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - touch}>
            {[-40, 0, 40].map((a) => {
              const an = ((180 + a) * Math.PI) / 180;
              const hx = 1217, hy = 642;
              return <line key={a} x1={hx + Math.cos(an) * 30} y1={hy + Math.sin(an) * 30} x2={hx + Math.cos(an) * (54 + 20 * touch)} y2={hy + Math.sin(an) * (54 + 20 * touch)} />;
            })}
          </g>
        )}
        {/* 逃げるニワトリ */}
        <g transform={`translate(${1760 + 60 * hen} ${780 - Math.sin(hen * Math.PI) * 70})`}>
          <ellipse cx={0} cy={-34} rx={40} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={30} cy={-70} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 26 -88 q 6 -14 14 0 q 6 -10 10 4" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 46 -70 l 16 4 l -16 6 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={34} cy={-74} r={3.5} fill={KRP.ink} />
          <path d={`M -10 -40 q -20 ${-20 - 20 * Math.sin(hen * Math.PI)} -40 -4`} fill="none" stroke={KRP.ink} strokeWidth={5} />
          <line x1={-6} y1={-6} x2={-10} y2={10} stroke={KRP.orange} strokeWidth={5} />
          <line x1={8} y1={-6} x2={12} y2={10} stroke={KRP.orange} strokeWidth={5} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#85 【並】 どこかで、聞いたことがある話です。
// 設計: アクィナスの講堂から、カメラが窓の外へ抜けていく途中。窓の外に、遠い未来の (現代の) リビングがぼんやり光る。`QMark`
// どこ: アクィナスの講堂の奥、大きな尖頭窓 (薄暗い石の壁)。左の手前にアクィナスがふり返っている
// 演出: ステンドグラスの2枚の窓がぱかっと外へ開くと、外は中世の空ではなく、ぼんやり光る現代のリビング (同じソファに沈む人)。
//       アクィナスはきょとん、窓の上に「？」
// 動き: f4〜18 窓が開く / カメラが窓へ寄り続ける (抜けていく途中) / 光が脈打つ・光の中をホコリが舞う / f24〜32 ？がぽん
const Yw085: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.16 * easeInOut(seg(f, 0, 42));
  const open = easeInOut(seg(f, 4, 18));
  const glow = 0.3 + Math.sin(f / 6) * 0.06;
  const WX = 960, WW = 320, WA = 380, WB = 860, WH = 300;
  return (
    <Frame f={f} seed={3085} bg={C.stoneDeep}>
      <g transform={camT(WX, 480, z)}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.stoneDark} />
        <L2bBricks x0={-100} y0={-40} cols={11} rows={11} bw={200} bh={100} stroke={C.stoneDeep} />
        {/* 窓の外 = 現代のリビング */}
        <defs>
          <clipPath id="l2b85w"><path d={L2bLancet(WX, WW, WA, WB, WH)} /></clipPath>
          <radialGradient id="l2b85g" cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor={C.flameCore} stopOpacity={0.9} />
            <stop offset="100%" stopColor={C.flameCore} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g clipPath="url(#l2b85w)">
          <rect x={WX - WW} y={0} width={WW * 2} height={WB} fill={C.livingWall} />
          <g transform={`translate(${WX - 960 * 0.6} ${WB - 1080 * 0.6}) scale(0.6)`} opacity={0.9}>
            <L2bLiving f={f} floorY={760} />
            <DameSofa x={960} y={1000} s={1.0} sink={1} f={f}>
              <Person x={0} y={-30} s={0.9} f={f} cloth={C.lounge} clothDark={C.loungeDark} face="joy" still />
            </DameSofa>
          </g>
          <rect x={WX - WW} y={0} width={WW * 2} height={WB} fill="url(#l2b85g)" opacity={glow + 0.2} />
          {/* かすみ (遠い未来なのでぼんやり) */}
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={WX + Math.sin(f / 20 + i * 2) * 120} cy={300 + i * 180} rx={300} ry={60} fill={KRP.white} opacity={0.1} />
          ))}
        </g>
        {/* 開いていく窓ガラス (左右2枚・外へ開く) */}
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${WX + d * WW} 0) scale(${1 - open * 0.86} 1) translate(${-(WX + d * WW)} 0)`}>
            <defs><clipPath id={`l2b85p${d}`}><rect x={d < 0 ? WX - WW : WX} y={0} width={WW} height={WB} /></clipPath></defs>
            <g clipPath={`url(#l2b85p${d})`}>
              <path d={L2bLancet(WX, WW, WA, WB, WH)} fill={C.stoneDark} />
              <g clipPath="url(#l2b85w)">
                {Array.from({ length: 11 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
                  <rect key={`${r}-${c}`} x={WX - WW + c * 80} y={60 + r * 75} width={80} height={75}
                    fill={[C.glass1, C.glass2, C.glass3, C.glass4][(r + c) % 4]} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
                )))}
              </g>
            </g>
            <line x1={WX} y1={WA - WH} x2={WX} y2={WB} stroke={KRP.ink} strokeWidth={open > 0.05 ? 0 : 8} />
          </g>
        ))}
        {/* 窓枠 */}
        <path d={L2bLancet(WX, WW + 30, WA, WB + 20, WH + 30)} fill="none" stroke={C.stone} strokeWidth={34} />
        <path d={L2bLancet(WX, WW + 46, WA, WB + 20, WH + 46)} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <path d={L2bLancet(WX, WW, WA, WB, WH)} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <rect x={WX - WW - 60} y={WB} width={WW * 2 + 120} height={40} rx={6} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        {/* 講堂へこぼれる光とホコリ */}
        <polygon points={`${WX - WW},${WB + 40} ${WX + WW},${WB + 40} ${WX + WW + 300},1140 ${WX - WW - 300},1140`} fill={C.flameCore} opacity={glow} />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={WX - 260 + rnd(85, i) * 520 + Math.sin(f / 9 + i) * 20} cy={WB + 60 + ((rnd(86, i) * 200 + f * 2) % 200)} r={3 + rnd(87, i) * 3}
            fill={KRP.white} opacity={0.6} />
        ))}
        {/* 窓台の上のろうそく (消えかけて、なびく) */}
        <L2bCandle x={WX + WW + 10} y={WB} s={0.8} f={f} h={60} />
        {/* ふり返るアクィナス */}
        <L2bAquinas x={330} y={880} s={1.25} f={f} face={f > 16 ? "surprised" : "normal"} gaze={[12, -6]} lean={4 * easeOut(seg(f, 10, 22))} book pose="hold" />
      </g>
      <QMark x={1580} y={320} s={1.3} f={f} t={seg(f, 24, 32)} />
    </Frame>
  );
};

// ---- 文#86 【山】 そう。冒頭の「人をダメにするソファ」です。
// 設計: ★伏線回収。序の #7・#8 と同じリビング・同じ `DameSofa`・同じ大人が沈んでいる。上から吊られた木札「人をダメにするソファ」(序と同じ見た目)。その隣に中世の羊皮紙の「柔弱」の札が並ぶ
// どこ: 序 #7・#8 と同じリビング (窓とカーテン・テレビ・観葉植物・ラグ)。同じソファに同じ大人が沈んで寝ている
// 演出: 天井から #8 と同じ木の板「人をダメにするソファ」が吊られて揺れている。その隣へ、中世の羊皮紙の札「柔弱」(封蝋つき) が
//       するする降りてきて並ぶ。2枚のあいだに赤い「＝」がぽん。寝ている人は気づかず Zzz
// 動き: 木の板がぶらんぶらん / f8〜22 羊皮紙が降りてきて揺れる / f28〜36 ＝がぽん / Zzz・寝息でソファがふくらむ / カメラはゆっくり寄る
const L2bHangBoard: React.FC<{ cx: number; label: string; fs: number; dropY: number; sw: number }> = ({ cx, label, fs, dropY, sw }) => {
  const bw = label.length * fs + 90;
  const h = fs * 2.3;
  return (
    <g transform={`translate(0 ${dropY}) rotate(${sw} ${cx} 0)`}>
      <line x1={cx - bw / 2 + 50} y1={-600} x2={cx - bw / 2 + 50} y2={120} stroke={KRP.ink} strokeWidth={5} />
      <line x1={cx + bw / 2 - 50} y1={-600} x2={cx + bw / 2 - 50} y2={120} stroke={KRP.ink} strokeWidth={5} />
      <rect x={cx - bw / 2} y={110} width={bw} height={h} rx={14} fill={YP.wood} stroke={KRP.ink} strokeWidth={8} />
      <rect x={cx - bw / 2 + 14} y={124} width={bw - 28} height={h - 28} rx={8} fill={C.boxTop} stroke={KRP.ink} strokeWidth={4} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${cx - bw / 2 + 30} ${150 + i * h * 0.22} q ${bw / 4} ${-10 + i * 6} ${bw / 2} 0 q ${bw / 4} ${8 - i * 5} ${bw / 2 - 60} 0`}
          fill="none" stroke={YP.woodDark} strokeWidth={3} opacity={0.35} />
      ))}
      {[-1, 1].map((d) => <circle key={d} cx={cx + d * (bw / 2 - 50)} cy={124} r={10} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />)}
      <text x={cx} y={110 + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={KRP.ink}>{label}</text>
    </g>
  );
};
// 中世の羊皮紙の札 (上下が巻いている・封蝋つき)。cx = 中心、上端 y0
const L2bParchTag: React.FC<{ cx: number; y0: number; w: number; h: number; text: string; fs: number; sub?: string; f: number }> = ({
  cx, y0, w, h, text, fs, sub, f,
}) => (
  <g>
    <path d={`M ${cx - w / 2} ${y0 + 20} L ${cx + w / 2} ${y0 + 20} Q ${cx + w / 2 + 10} ${y0 + h / 2} ${cx + w / 2} ${y0 + h - 20} L ${cx - w / 2} ${y0 + h - 20} Q ${cx - w / 2 - 10} ${y0 + h / 2} ${cx - w / 2} ${y0 + 20} Z`}
      fill={C.parchment} stroke={KRP.ink} strokeWidth={6} />
    {[0.3, 0.6].map((k) => <path key={k} d={`M ${cx - w / 2 + 16} ${y0 + h * k} q ${w / 3} 10 ${w - 40} 0`} fill="none" stroke={C.parchDark} strokeWidth={4} opacity={0.7} />)}
    {[y0 + 20, y0 + h - 20].map((ry, i) => (
      <g key={i}>
        <rect x={cx - w / 2 - 20} y={ry - 18} width={w + 40} height={36} rx={18} fill={C.parchDark} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={cx - w / 2 - 20} cy={ry} rx={9} ry={18} fill={C.parchment} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={cx + w / 2 + 20} cy={ry} rx={9} ry={18} fill={C.parchment} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    <text x={cx} y={y0 + h * 0.56 + fs * 0.3} textAnchor="middle" fontFamily={MINCHO} fontWeight={800} fontSize={fs} fill={C.brownInk}>{text}</text>
    {sub && <text x={cx - w / 2 + 24} y={y0 + h - 48} fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.brownInk}>{sub}</text>}
    <g transform={`translate(${cx + w / 2 - 30} ${y0 + h - 30}) rotate(${Math.sin(f / 7) * 4})`}>
      <path d="M 0 0 L -14 54 L 0 44 L 14 54 Z" fill={C.velvetDark} stroke={KRP.ink} strokeWidth={3} />
      <circle r={26} fill={C.velvet} stroke={KRP.ink} strokeWidth={4} />
      <circle r={15} fill="none" stroke={C.velvetDark} strokeWidth={4} />
    </g>
  </g>
);
const Yw086: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.05, easeInOut(seg(f, 0, 42)));
  const sw1 = Math.sin(f / 5.2) * 2.5;
  const drop = seg(f, 8, 22);
  const dropY = lerp(-520, 0, 1 - (1 - drop) ** 3);
  const sw2 = f < 22 ? 0 : Math.sin((f - 22) / 3) * 6 * Math.exp(-(f - 22) / 14);
  const eq = seg(f, 28, 36);
  const S = 1.45, SY = 1080, SX = 980;
  const handX = SX + 150 * S, handY = SY + S * (-250);
  return (
    <Frame f={f} seed={3086} bg={C.livingWall}>
      <g transform={camT(960, 520, z)}>
        <L2bLiving f={f} floorY={830} />
        {/* ラグ */}
        <ellipse cx={SX} cy={1040} rx={700} ry={80} fill={C.rug} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={SX} cy={1040} rx={610} ry={60} fill="none" stroke={C.rugDark} strokeWidth={5} strokeDasharray="20 12" />
        {/* ソファと沈んだ人 (#8 と同じ) */}
        <DameSofa x={SX} y={SY} s={S} sink={1} f={f}>
          <Person x={0} y={-30} s={0.9} f={f} cloth={C.lounge} clothDark={C.loungeDark} face="joy" still />
        </DameSofa>
        <rect x={handX - 18} y={handY - 96} width={40} height={120} rx={20} fill={C.lounge} stroke={KRP.ink} strokeWidth={6}
          transform={`rotate(${56 + Math.sin(f / 18) * 3} ${handX} ${handY})`} />
        <circle cx={handX + 98} cy={handY - 60} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 床に落ちたリモコン (#7 の続き) */}
        <g transform="translate(1560 990) rotate(200)">
          <rect x={-16} y={-46} width={32} height={92} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-28} r={6} fill={KRP.red} />
        </g>
        {/* Zzz */}
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 14) % 42) / 42;
          return (
            <text key={i} x={1090 + t * 80 + i * 10} y={640 - t * 140} fontFamily={FONT} fontWeight={900}
              fontSize={40 + i * 10} fill={KRP.blueDeep} opacity={Math.sin(t * Math.PI)} stroke={KRP.ink} strokeWidth={2} paintOrder="stroke">Z</text>
          );
        })}
        {/* 天井の梁 */}
        <rect x={-60} y={-60} width={W + 120} height={116} fill={C.tvStand} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 210} y1={10} x2={i * 210 + 120} y2={10} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />)}
        {/* 吊るした木の板 (序と同じ) */}
        <L2bHangBoard cx={780} label="人をダメにするソファ" fs={62} dropY={30} sw={sw1} />
        {/* 降りてくる中世の羊皮紙「柔弱」 */}
        <g transform={`translate(0 ${dropY}) rotate(${sw2} 1450 0)`}>
          <line x1={1360} y1={-600} x2={1360} y2={116} stroke={KRP.ink} strokeWidth={5} />
          <line x1={1540} y1={-600} x2={1540} y2={116} stroke={KRP.ink} strokeWidth={5} />
          <L2bParchTag cx={1450} y0={100} w={300} h={250} text="柔弱" fs={104} sub="13世紀" f={f} />
        </g>
        {/* ＝ */}
        {eq > 0 && (
          <g transform={`translate(1182 230) scale(${pop(eq)})`}>
            <circle r={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-30} y={-20} width={60} height={13} rx={5} fill={KRP.red} />
            <rect x={-30} y={7} width={60} height={13} rx={5} fill={KRP.red} />
          </g>
        )}
        {/* 着いたときの揺れ線 */}
        {f >= 21 && f < 32 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" fill="none" opacity={1 - seg(f, 21, 32)}>
            <path d="M 1270 160 q -20 30 0 60" />
            <path d="M 1630 160 q 20 30 0 60" />
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- 文#87 【山】 柔らかいものは、人をダメにする。この発想は、700年以上前から、あったのです。
// 設計: 左に中世の講堂のアクィナス、右に現代のソファに沈む人。間に年表の矢印「13世紀 → 今」。アクィナスがソファの人を見てうなずく (時空を超えた共演の笑い)
// どこ: 画面を縦に破いた紙で2つに割る。左 = 13世紀の石の講堂 (尖頭窓・書見台・ろうそく)、右 = 今のリビング (同じソファ・窓・植物)
// 演出: 上に羊皮紙の帯の年表「13世紀 → 今」、真ん中に「700年以上」。アクィナスは本を抱えて右を見下ろし、うんうんとうなずく。
//       ソファに沈んだ人は、だらりと片手を上げて返事をする (時空を超えた共演)
// 動き: f6〜22 年表の矢印が左から右へ伸びる / f20〜28 札「700年以上」/ f24〜42 アクィナスがうなずく (うんうんの線) / f28〜40 片手が上がる / カメラは少し寄る
const Yw087: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  const grow = easeInOut(seg(f, 6, 22));
  const nodOn = f >= 24;
  const nod = nodOn ? Math.max(0, Math.sin((f - 24) / 2)) * 6 : 0;
  const wave = easeOut(seg(f, 28, 36));
  const S = 1.05, SX = 1450, SY = 1010;
  const handX = SX + 150 * S, handY = SY + S * (-250);
  const tear = Array.from({ length: 23 }, (_, i) => `${960 + (i % 2 ? 18 : -18) + rnd(87, i) * 10} ${-60 + i * 55}`).join(" L ");
  return (
    <Frame f={f} seed={3087} bg={C.stone}>
      <g transform={camT(960, 560, z)}>
        {/* ===== 左: 13世紀の講堂 ===== */}
        <defs>
          <clipPath id="l2b87L"><path d={`M -100 -100 L ${tear} L 960 1200 L -100 1200 Z`} /></clipPath>
          <clipPath id="l2b87R"><path d={`M 2100 -100 L ${tear} L 960 1200 L 2100 1200 Z`} /></clipPath>
        </defs>
        <g clipPath="url(#l2b87L)">
          <rect x={-100} y={-100} width={1100} height={1300} fill={C.stone} />
          <L2bBricks x0={-100} y0={-40} cols={6} rows={8} bw={200} bh={100} stroke={C.stoneDark} />
          <path d={L2bLancet(300, 100, 440, 640, 200)} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} />
          <defs><clipPath id="l2b87w"><path d={L2bLancet(300, 86, 440, 628, 186)} /></clipPath></defs>
          <g clipPath="url(#l2b87w)">
            {Array.from({ length: 6 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
              <rect key={`${r}-${c}`} x={214 + c * 44} y={250 + r * 66} width={44} height={66}
                fill={[C.glass1, C.glass2, C.glass3, C.glass4][(r + c) % 4]} stroke={KRP.ink} strokeWidth={4} opacity={0.85 + Math.sin(f / 9 + r + c) * 0.1} />
            )))}
          </g>
          <polygon points="214,640 386,640 560,800 140,800" fill={C.glass3} opacity={0.15} />
          <rect x={-100} y={780} width={1100} height={400} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={i * 180 - 100} y1={780} x2={i * 220 - 300} y2={1100} stroke={C.stone} strokeWidth={5} />)}
          {/* 書見台とろうそく */}
          <g transform="translate(150 800)">
            <rect x={-12} y={-200} width={24} height={200} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -90 -190 L 90 -230 L 96 -206 L -84 -166 Z" fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -70 -200 Q -10 -232 80 -232 L 82 -218 Q -6 -216 -68 -188 Z" fill={C.parchment} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-60} y={-12} width={120} height={14} rx={5} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <L2bCandle x={830} y={800} s={1} f={f} h={100} />
          {/* アクィナス (右を見下ろしてうなずく) */}
          <L2bAquinas x={560} y={810} s={1.4} f={f} pose="hold" book face="smile" gaze={[12, 6]} lean={nod} />
          {nodOn && (
            <g fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.abs(Math.sin((f - 24) / 2))}>
              <path d="M 720 360 q 26 20 20 52" />
              <path d="M 752 344 q 34 26 26 70" />
            </g>
          )}
        </g>
        {/* ===== 右: 今のリビング ===== */}
        <g clipPath="url(#l2b87R)">
          <g transform="translate(-160 0)">
            <L2bLiving f={f} floorY={800} />
          </g>
          <ellipse cx={SX} cy={1000} rx={480} ry={60} fill={C.rug} stroke={KRP.ink} strokeWidth={6} />
          <DameSofa x={SX} y={SY} s={S} sink={1} f={f}>
            <Person x={0} y={-30} s={0.9} f={f} cloth={C.lounge} clothDark={C.loungeDark} face="joy" still gaze={[-8, -4]} />
          </DameSofa>
          {/* だらりと上がる片手 (返事) */}
          <g transform={`rotate(${lerp(56, -10, wave) + Math.sin(f / 3) * 6 * wave} ${handX} ${handY})`}>
            <rect x={handX - 15} y={handY - 96} width={34} height={104} rx={17} fill={C.lounge} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={handX + 2} cy={handY - 104} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          </g>
        </g>
        {/* 破れ目 (白い紙の縁と影) */}
        <path d={`M ${tear}`} fill="none" stroke={KRP.ink} strokeWidth={14} opacity={0.18} transform="translate(8 0)" />
        <path d={`M ${tear}`} fill="none" stroke={KRP.white} strokeWidth={12} />
        <path d={`M ${tear}`} fill="none" stroke={KRP.ink} strokeWidth={4} />
        {/* 羊皮紙の帯の年表 */}
        <rect x={140} y={140} width={1640} height={110} rx={12} fill={C.parchment} stroke={KRP.ink} strokeWidth={6} />
        {[[140, -1], [1780, 1]].map(([ex, d]) => (
          <path key={ex} d={`M ${ex} 150 L ${ex + d * 60} 160 L ${ex + d * 36} 195 L ${ex + d * 60} 240 L ${ex} 240 Z`} fill={C.parchDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <line x1={460} y1={195} x2={lerp(460, 1390, grow)} y2={195} stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
        {grow > 0.02 && <Arrow x={lerp(460, 1420, grow)} y={195} s={0.7} rot={0} />}
        {[0.2, 0.4, 0.6, 0.8].map((k) => (
          <line key={k} x1={460 + 930 * k} y1={178} x2={460 + 930 * k} y2={212} stroke={KRP.ink} strokeWidth={4} opacity={grow > k ? 1 : 0} />
        ))}
        <TagPlate x={330} y={195} text="13世紀" size={42} t={seg(f, 2, 10)} />
        <TagPlate x={1560} y={195} text="今" size={50} t={seg(f, 20, 28)} />
        <TagPlate x={925} y={195} text="700年以上" size={36} t={seg(f, 22, 30)} fill={C.boxTop} />
      </g>
    </Frame>
  );
};

// ---- 文#88 【図】 日本語の「軟弱」も、柔らかくて弱い、と書きます。
// 設計: 和紙の上に筆で「軟弱」の2文字 (大きく)。f で「軟」の字から「やわらかい」、「弱」の字から「よわい」の札が出る。硯と筆
// どこ: 書道の机 (木の机の上に黒い下敷き・和紙・文鎮。右に硯と墨、筆)
// 演出: 筆が和紙の上を走り、大きな「軟」「弱」の2文字が上から書かれていく。書き終えた筆は硯へ戻る。
//       「軟」の下から札「やわらかい」、「弱」の下から札「よわい」がぽん。最後に赤い落款
// 動き: f2〜16「軟」/ f14〜28「弱」(筆先が字を追う) / f28〜38 筆が硯へ / f26〜34・f32〜40 札 / f38〜42 落款 / 硯の水面がゆらぐ / カメラはゆっくりパン
const Yw088: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.02 + 0.03 * easeInOut(seg(f, 0, 42));
  const pan = -30 * easeInOut(seg(f, 0, 42));
  const k1 = easeInOut(seg(f, 2, 16));
  const k2 = easeInOut(seg(f, 14, 28));
  const home = easeInOut(seg(f, 28, 38));
  const chars = [{ x: 720, k: k1, ch: "軟" }, { x: 1200, k: k2, ch: "弱" }];
  const TOP = 260, BOT = 690;
  // 筆の位置
  let bx: number, by: number;
  if (f < 15) { bx = 720 + Math.sin(f * 1.3) * 120; by = lerp(TOP, BOT, k1); }
  else if (f < 28) { bx = 1200 + Math.sin(f * 1.3) * 120; by = lerp(TOP, BOT, k2); }
  else { bx = lerp(1200, 1730, home); by = lerp(BOT, 420, home); }
  const brot = lerp(-20, 60, home);
  return (
    <Frame f={f} seed={3088} bg={C.desk}>
      <g transform={camT(960, 520, z, pan)}>
        {/* 机 */}
        <rect x={-100} y={-60} width={W + 200} height={H + 120} fill={C.desk} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -100 ${40 + i * 140} q 500 ${rnd(88, i) * 34 - 17} 1050 0 q 500 ${rnd(89, i) * 34 - 17} 1100 0`} fill="none" stroke={C.deskDark} strokeWidth={5} opacity={0.5} />
        ))}
        {/* 下敷き */}
        <rect x={300} y={90} width={1340} height={920} rx={10} fill={C.felt} stroke={KRP.ink} strokeWidth={7} />
        {/* 和紙 (繊維の筋) */}
        <g transform="rotate(-0.8 960 520)">
          <rect x={380} y={130} width={1180} height={760} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 26 }, (_, i) => (
            <path key={i} d={`M ${400 + rnd(90, i) * 1100} ${150 + rnd(91, i) * 720} q ${20 + rnd(92, i) * 30} ${-6 + rnd(93, i) * 12} ${50 + rnd(94, i) * 40} 0`}
              fill="none" stroke={C.washiFiber} strokeWidth={3} />
          ))}
          {/* 字 (上から書かれていく) */}
          {chars.map((c, i) => (
            <g key={i}>
              <defs><clipPath id={`l2b88c${i}`}><rect x={c.x - 240} y={TOP - 60} width={480} height={(BOT - TOP + 100) * c.k} /></clipPath></defs>
              <text x={c.x} y={640} textAnchor="middle" fontFamily={MINCHO} fontWeight={900} fontSize={400} fill={C.sumi}
                clipPath={`url(#l2b88c${i})`}>{c.ch}</text>
              {c.k > 0.98 && [0, 1, 2].map((d) => (
                <circle key={d} cx={c.x + 150 - d * 40 + rnd(95 + i, d) * 30} cy={700 + rnd(96 + i, d) * 30} r={3 + d * 2} fill={C.sumi} />
              ))}
            </g>
          ))}
          {/* 引き出し線と札 */}
          {[{ x: 720, t: seg(f, 26, 34), text: "やわらかい" }, { x: 1200, t: seg(f, 32, 40), text: "よわい" }].map((p) => (
            <g key={p.text}>
              <line x1={p.x} y1={706} x2={p.x} y2={706 + 36 * p.t} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
              <TagPlate x={p.x} y={782} text={p.text} size={40} t={p.t} />
            </g>
          ))}
          {/* 落款 */}
          {f >= 38 && (
            <g transform={`translate(1480 230) scale(${pop(seg(f, 38, 42))})`}>
              <rect x={-30} y={-30} width={60} height={60} rx={4} fill={C.seal} stroke={KRP.ink} strokeWidth={3} />
              <path d="M -16 -16 L 16 -16 M 0 -16 L 0 18 M -16 4 L 16 4" stroke={C.washi} strokeWidth={5} />
            </g>
          )}
        </g>
        {/* 文鎮 */}
        <rect x={520} y={104} width={880} height={42} rx={10} fill={C.bronze} stroke={KRP.ink} strokeWidth={6} />
        <rect x={540} y={112} width={840} height={10} rx={5} fill={YP.brass} opacity={0.6} />
        {/* 硯 (墨池の水面がゆらぐ) と墨 */}
        <g transform="translate(1790 640)">
          <rect x={-110} y={-210} width={220} height={400} rx={30} fill={C.suzuri} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-86} y={-120} width={172} height={280} rx={20} fill={C.sumi} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-162} rx={80} ry={30} fill={C.sumi} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={Math.sin(f / 5) * 20} cy={-164} rx={30 + Math.sin(f / 4) * 6} ry={8} fill="none" stroke={KRP.gray} strokeWidth={3} opacity={0.6} />
          <g transform="translate(-40 260) rotate(-12)">
            <rect x={-30} y={-80} width={60} height={160} rx={6} fill={C.sumi} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-24} y={-40} width={48} height={60} fill={YP.brass} opacity={0.8} />
          </g>
        </g>
        {/* 筆 */}
        <g transform={`translate(${bx} ${by}) rotate(${brot})`}>
          <path d="M 0 0 Q -20 -40 -16 -80 L 16 -80 Q 20 -40 0 0 Z" fill={C.sumi} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-100} width={32} height={22} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-13} y={-420} width={26} height={322} rx={10} fill={C.straw} stroke={KRP.ink} strokeWidth={5} />
          {[-360, -260, -160].map((ly) => <line key={ly} x1={-13} y1={ly} x2={13} y2={ly} stroke={C.strawDark} strokeWidth={4} />)}
          <rect x={-8} y={-436} width={16} height={18} rx={4} fill={C.velvet} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#89 【並】 では、柔らかさを本気で拒んだ人は、何をしたのでしょうか。
// 設計: 石の修道院の門。門の前に羽毛の枕が置かれ、門の内側から茶色の修道服の袖が伸びてくる (人物はまだ見せない)。`QMark`
// どこ: 石造りの修道院の門 (半円アーチの迫り石・鉄鋲の木の扉・左に鐘楼・右にオリーブの木)。夕方の光
// 演出: 門の前の石段に、ふっくらした羽毛の枕がぽつんと置かれている。扉が細く開き、すき間から茶色の粗い修道服の袖と手がにゅっと伸びて、
//       枕を「いりません」と押しのける (人物の顔はまだ見せない)。羽が舞う。右上に「？」
// 動き: f4〜12 扉が細く開く / f10〜26 袖が伸びる / f28〜40 枕が押されて右へずれる・羽が舞う / f30〜38 ？/ 鐘がゆれる / カメラは門へ寄る
const Yw089: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const gap = 46 * easeOut(seg(f, 4, 12));
  const reach = easeOut(seg(f, 10, 26));
  const push = easeInOut(seg(f, 28, 38));
  const L = 40 + 110 * reach + 50 * push;
  const ang = 12;
  const sx0 = 984, sy0 = 650;
  const hx = sx0 + Math.cos((ang * Math.PI) / 180) * L, hy = sy0 + Math.sin((ang * Math.PI) / 180) * L;
  const DX = 960, R = 230, ST = 460, GB = 770; // 門の中心・アーチ半径・直線部上端・扉の下
  return (
    <Frame f={f} seed={3089} bg={C.skyLow}>
      <g transform={camT(1080, 600, z)}>
        <rect x={-60} y={-60} width={W + 120} height={500} fill={C.skyLow} />
        <rect x={-60} y={-60} width={W + 120} height={180} fill={C.sky} opacity={0.6} />
        {/* 修道院の壁 */}
        <rect x={-60} y={150} width={W + 120} height={GB - 150} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        <L2bBricks x0={-80} y0={156} cols={12} rows={6} bw={170} bh={104} stroke={C.stoneDark} />
        <rect x={-60} y={130} width={W + 120} height={34} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 鐘楼 (右奥) */}
        <g transform="translate(1250 0)">
          <rect x={150} y={-20} width={240} height={180} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 220 160 L 220 60 Q 270 10 320 60 L 320 160 Z" fill={C.stoneDeep} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`rotate(${Math.sin(f / 5) * 14} 270 50)`}>
            <path d="M 240 130 Q 236 70 270 60 Q 304 70 300 130 Z" fill={YP.brass} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={270} cy={138} r={8} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
          <path d="M 130 -10 L 270 -80 L 410 -10 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={7} />
        </g>
        {/* 小窓 */}
        {[520, 1460].map((x) => (
          <g key={x}>
            <path d={`M ${x - 34} 380 L ${x - 34} 300 Q ${x} 260 ${x + 34} 300 L ${x + 34} 380 Z`} fill={C.stoneDeep} stroke={KRP.ink} strokeWidth={6} />
            <line x1={x} y1={280} x2={x} y2={380} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 門の暗い内側と扉 */}
        <path d={`M ${DX - R} ${GB} L ${DX - R} ${ST} A ${R} ${R} 0 0 1 ${DX + R} ${ST} L ${DX + R} ${GB} Z`} fill={C.devil} />
        <defs><clipPath id="l2b89d"><path d={`M ${DX - R} ${GB} L ${DX - R} ${ST} A ${R} ${R} 0 0 1 ${DX + R} ${ST} L ${DX + R} ${GB} Z`} /></clipPath></defs>
        <g clipPath="url(#l2b89d)">
          {[{ x0: DX - R, x1: DX }, { x0: DX + gap, x1: DX + R }].map((d, i) => (
            <g key={i}>
              <rect x={d.x0} y={ST - R} width={d.x1 - d.x0} height={GB - ST + R} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
              {Array.from({ length: 4 }, (_, k) => (
                <line key={k} x1={d.x0 + ((d.x1 - d.x0) * (k + 1)) / 5} y1={ST - R} x2={d.x0 + ((d.x1 - d.x0) * (k + 1)) / 5} y2={GB} stroke={C.woodDeep} strokeWidth={5} />
              ))}
              {[ST - 80, ST + 140].map((by) => (
                <g key={by}>
                  <rect x={d.x0} y={by} width={d.x1 - d.x0} height={26} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
                  {Array.from({ length: 4 }, (_, k) => <circle key={k} cx={d.x0 + 24 + k * ((d.x1 - d.x0 - 48) / 3)} cy={by + 13} r={5} fill={C.stoneDark} />)}
                </g>
              ))}
            </g>
          ))}
          <g transform={`translate(${DX - 50} ${ST + 70})`}>
            <circle r={26} fill="none" stroke={C.iron} strokeWidth={8} />
            <circle cx={0} cy={-26} r={10} fill={C.iron} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {gap > 2 && <rect x={DX} y={ST - R} width={gap} height={GB - ST + R} fill={C.devil} />}
        </g>
        {/* 迫り石のアーチ */}
        {Array.from({ length: 11 }, (_, i) => {
          const a0 = Math.PI + (i / 11) * Math.PI, a1 = Math.PI + ((i + 1) / 11) * Math.PI;
          const r0 = R, r1 = R + 64;
          const p = (a: number, r: number) => `${DX + Math.cos(a) * r} ${ST + Math.sin(a) * r}`;
          return <path key={i} d={`M ${p(a0, r0)} L ${p(a0, r1)} A ${r1} ${r1} 0 0 1 ${p(a1, r1)} L ${p(a1, r0)} A ${r0} ${r0} 0 0 0 ${p(a0, r0)} Z`}
            fill={i === 5 ? C.stoneDark : C.stone} stroke={KRP.ink} strokeWidth={5} />;
        })}
        {[-1, 1].map((d) => (
          <rect key={d} x={d < 0 ? DX - R - 64 : DX + R} y={ST} width={64} height={GB - ST} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        ))}
        {/* 石段と地面 */}
        <rect x={-60} y={GB} width={W + 120} height={400} fill={C.path} stroke={KRP.ink} strokeWidth={6} />
        <rect x={DX - R - 120} y={GB} width={2 * R + 240} height={40} rx={6} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={DX - R - 180} y={GB + 40} width={2 * R + 360} height={40} rx={6} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        {[180, 400, 1500, 1760].map((x, i) => (
          <path key={x} d={`M ${x} ${GB + 20} l 10 -30 l 8 26 l 10 -36 l 8 40`} fill="none" stroke={C.oliveDark} strokeWidth={5} strokeLinecap="round"
            transform={`rotate(${Math.sin(f / 8 + i) * 4} ${x} ${GB + 20})`} />
        ))}
        {/* オリーブの木 (右) */}
        <g>
          <path d="M 1700 770 Q 1690 640 1720 520 Q 1700 460 1660 430 M 1720 520 Q 1760 470 1800 450" fill="none" stroke={C.woodDeep} strokeWidth={22} strokeLinecap="round" />
          {[[1640, 400, 90], [1760, 380, 100], [1700, 320, 90], [1830, 440, 70], [1590, 470, 60]].map(([cx, cy, r], i) => (
            <ellipse key={i} cx={cx + Math.sin(f / 12 + i) * 4} cy={cy} rx={r} ry={r * 0.7} fill={i % 2 ? C.olive : C.oliveDark} stroke={KRP.ink} strokeWidth={5} />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse key={i} cx={1590 + rnd(89, i) * 260} cy={320 + rnd(90, i) * 160} rx={12} ry={5} fill={C.oliveLight} transform={`rotate(${rnd(91, i) * 60 - 30} ${1590 + rnd(89, i) * 260} ${320 + rnd(90, i) * 160})`} />
          ))}
        </g>
        {/* 羽毛の枕 (押されて右へずれる) */}
        <L2bPillow x={1260 + 60 * push} y={GB + 6} w={360} h={190} f={f} rot={4 * push} />
        {/* 伸びてくる袖と手 */}
        {reach > 0.01 && (
          <g transform={`translate(${sx0} ${sy0}) rotate(${ang})`}>
            <rect x={-40} y={-34} width={L + 40} height={68} rx={20} fill={C.habit} stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: Math.floor(L / 24) }, (_, i) => (
              <line key={i} x1={-20 + i * 24} y1={-30} x2={-8 + i * 24} y2={30} stroke={C.habitDark} strokeWidth={3} opacity={0.7} />
            ))}
            <rect x={L - 30} y={-40} width={36} height={80} rx={12} fill={C.habitDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        )}
        {reach > 0.01 && (
          <g transform={`translate(${hx} ${hy}) rotate(${ang - 90})`}>
            <path d="M -26 -6 Q -30 40 -16 56 L 16 56 Q 30 40 26 -6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            {[-12, 0, 12].map((fx) => <line key={fx} x1={fx} y1={30} x2={fx} y2={54} stroke={KRP.ink} strokeWidth={3} />)}
            <path d="M -26 10 Q -44 20 -40 36" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {/* 押しのけた勢いで舞う羽 */}
        {push > 0 && [0, 1, 2, 3, 4].map((i) => (
          <L2bFeather key={i} x={1120 + i * 70 + 60 * push} y={GB - 160 - push * (60 + i * 40) + Math.sin(f / 4 + i) * 8} s={0.9 + rnd(92, i) * 0.4}
            r={Math.sin(f / 5 + i) * 40} />
        ))}
        {push > 0 && push < 1 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - push}>
            <line x1={1450 + 60 * push} y1={GB - 120} x2={1510 + 60 * push} y2={GB - 130} />
            <line x1={1450 + 60 * push} y1={GB - 60} x2={1520 + 60 * push} y2={GB - 60} />
          </g>
        )}
      </g>
      <QMark x={1360} y={300} s={1.3} f={f} t={seg(f, 30, 38)} />
    </Frame>
  );
};

// ---- 文#90 【山】 第5章、羽毛枕には、悪魔が住んでいる。
// 設計: 章扉。夜の修道院の小部屋。月光の窓、粗末な寝床の上に、ふっくらした羽毛の枕。枕の影がほんの少し角の形に見える (怖すぎず、くすっと)。`ChapterDoor` (num=5)
// どこ: 夜の修道院の小部屋 (暗い石の壁・鉄格子の小さな月光の窓・木の十字架・釘にかけた縄の帯・粗末な板の寝床と藁の敷物)
// 演出: 寝床の上に、場違いにふっくらした白い羽毛の枕。月の光を浴びて壁に落ちた枕の影に、ちょこんと2本の角と、くるんとした尻尾が生える
//       (怖くなく、くすっと)。右に章の題字
// 動き: f4〜20 題字 / f12〜26 影の角がにょきっ / f22〜34 尻尾がくるん / 月の光がゆらぐ・ろうそくの消えた煙が立つ / カメラは枕へ少し寄る
const Yw090: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const z = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const horn = easeOut(seg(f, 12, 26));
  const tail = easeOut(seg(f, 22, 34));
  const wig = Math.sin(f / 4) * 4 * tail;
  const PX = 500, PY = 640;
  return (
    <Frame f={f} seed={3090} bg={C.night} dark
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={5} title="羽毛枕には、悪魔が住んでいる" t={door} left={1000} top={560} />
      </>}>
      <g transform={camT(PX, 560, z)}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.nightStone} />
        <L2bBricks x0={-100} y0={-40} cols={12} rows={9} bw={180} bh={96} stroke={C.nightStoneDark} />
        {/* 月光の窓 */}
        <defs><clipPath id="l2b90w"><path d="M 220 380 L 220 220 Q 300 140 380 220 L 380 380 Z" /></clipPath></defs>
        <path d="M 200 396 L 200 214 Q 300 116 400 214 L 400 396 Z" fill={C.nightStoneDark} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#l2b90w)">
          <rect x={220} y={140} width={160} height={240} fill={C.night} />
          <circle cx={320} cy={250} r={46} fill={C.moon} />
          <circle cx={340} cy={238} r={40} fill={C.night} />
          {[[250, 320], [360, 340], [240, 200]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill={C.moon} opacity={0.6 + Math.sin(f / 5 + i) * 0.3} />)}
        </g>
        {[260, 300, 340].map((x) => <line key={x} x1={x} y1={160} x2={x} y2={380} stroke={KRP.ink} strokeWidth={8} />)}
        <line x1={220} y1={290} x2={380} y2={290} stroke={KRP.ink} strokeWidth={8} />
        {/* 月の光の帯 (寝床へ) */}
        <polygon points="220,390 380,390 880,760 330,760" fill={C.moonBeam} opacity={0.2 + Math.sin(f / 10) * 0.03} />
        {/* 壁の十字架と、釘にかけた縄の帯 */}
        <g transform="translate(830 230)">
          <rect x={-10} y={-70} width={20} height={150} rx={3} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-46} y={-40} width={92} height={20} rx={3} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g transform="translate(110 470)">
          <circle r={8} fill={C.iron} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 0 0 Q -40 90 0 160 Q 40 90 0 0" fill="none" stroke={C.rope} strokeWidth={8} />
          {[60, 100, 140].map((ky) => <circle key={ky} cx={(ky - 100) * 0.1} cy={ky + 30} r={7} fill={C.rope} stroke={KRP.ink} strokeWidth={3} />)}
          <line x1={0} y1={160} x2={4} y2={210} stroke={C.rope} strokeWidth={7} />
        </g>
        {/* 壁に落ちた枕の影 (角と尻尾が生える) */}
        <g transform="translate(700 520)" opacity={0.9}>
          {horn > 0 && [-1, 1].map((d) => (
            <path key={d} d={`M ${d * 70} -84 Q ${d * 84} ${-84 - 50 * horn} ${d * (104 + 6 * horn)} ${-84 - 72 * horn} Q ${d * 98} ${-84 - 30 * horn} ${d * 110} -78 Z`} fill={C.devil} />
          ))}
          <path d="M -160 0 Q -186 -50 -150 -88 Q -40 -104 0 -92 Q 40 -104 150 -88 Q 186 -50 160 0 Q 0 16 -160 0 Z" fill={C.devil} />
          {tail > 0 && (
            <g>
              <path d={`M 150 -20 Q ${200 + 30 * tail} ${-10 + wig} ${210 + 20 * tail} ${-60 * tail + wig}`} fill="none" stroke={C.devil} strokeWidth={12} strokeLinecap="round" />
              <path d={`M ${210 + 20 * tail} ${-60 * tail + wig} l -18 -10 l 28 -26 l 8 34 Z`} fill={C.devil} />
            </g>
          )}
        </g>
        <rect x={-60} y={810} width={W + 120} height={330} fill={C.nightStoneDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 粗末な寝床 (石の台に板・藁の敷物・すり切れた毛布) */}
        <rect x={110} y={660} width={760} height={150} fill={C.nightStoneDark} stroke={KRP.ink} strokeWidth={6} />
        <L2bBricks x0={114} y0={664} cols={4} rows={2} bw={190} bh={72} stroke={C.nightStone} sw={4} />
        <rect x={90} y={630} width={800} height={36} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 110 632 Q 480 600 870 632 L 870 640 L 110 640 Z" fill={C.straw} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={130 + i * 46} y1={630} x2={150 + i * 46 + rnd(90, i) * 20} y2={616 + rnd(91, i) * 8} stroke={C.strawDark} strokeWidth={4} strokeLinecap="round" />
        ))}
        <path d="M 680 640 Q 690 590 760 586 Q 860 590 870 632 Z" fill={C.habitDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 720 604 L 740 630 M 790 596 L 800 626" stroke={C.habit} strokeWidth={4} />
        {/* ふっくらした羽毛の枕 (月光でほんのり光る) */}
        <ellipse cx={PX} cy={PY - 80} rx={230} ry={120} fill={C.moonBeam} opacity={0.12 + Math.sin(f / 7) * 0.04} />
        <L2bPillow x={PX} y={PY - 4} w={340} h={150} f={f} />
        {/* 消えたろうそくの煙 (小さな腰掛けの上) */}
        <g transform="translate(1000 800)">
          <rect x={-60} y={-12} width={120} height={22} rx={5} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-46} y={10} width={14} height={60} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
          <rect x={32} y={10} width={14} height={60} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-12} y={-62} width={24} height={50} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 0 -64 q ${10 * Math.sin(f / 5)} -24 0 -44 q ${-10 * Math.sin(f / 6)} -20 0 -40`} fill="none" stroke={KRP.gray} strokeWidth={4} opacity={0.6} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#91 【山】 13世紀のイタリア。アッシジの町に、フランチェスコという修道士がいました。
// 設計: イタリアの丘の上の町アッシジ (石造りの家・教会の塔・オリーブ畑・糸杉)。坂道を裸足で歩くフランチェスコ (茶色の修道服・縄の帯)。小鳥が寄ってくる。イタリアの国旗は現代のものなので置かず、札「アッシジ」、隅に `AgeDial` (s≈0.5、label「13世紀」)
// どこ: イタリアの丘の上の町アッシジ (奥に大きな山・丘に積み重なる石の家とテラコッタの屋根・教会の鐘楼・城壁と門・斜面のオリーブ畑・糸杉)
// 演出: 町へ上るつづら折りの坂道を、裸足のフランチェスコ (茶色の修道服・縄の帯) が穏やかに歩いてくる。
//       小鳥たちがまわりを飛び、1羽が差し出した手にちょんと止まる。札「アッシジ」、隅に年代ダイヤル「13世紀」
// 動き: カメラが右から左へパンしつつ少し引く / f0〜20 ダイヤルが回って止まる / f6〜14 札 / 小鳥が円を描いて飛ぶ / f18〜32 1羽が手に止まる / 歩く足元の土ぼこり
const L2bBird: React.FC<{ x: number; y: number; s?: number; flap: number; dir?: 1 | -1 }> = ({ x, y, s = 1, flap, dir = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
    <ellipse cx={0} cy={0} rx={22} ry={14} fill={C.bird} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={18} cy={-10} r={10} fill={C.bird} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={21} cy={-12} r={2.5} fill={KRP.white} />
    <path d="M 27 -10 l 10 3 l -10 3 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={2} />
    <ellipse cx={4} cy={4} rx={10} ry={6} fill={C.rope} />
    <path d={`M -4 -6 Q -14 ${-30 * flap} -28 ${-34 * flap + 4}`} fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    <path d="M -20 2 L -36 -4 L -34 8 Z" fill={C.bird} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
const Yw091: React.FC<{ f: number }> = ({ f }) => {
  const pan = 90 * (1 - easeInOut(seg(f, 0, 42)));
  const z = 1.08 - 0.06 * easeInOut(seg(f, 0, 42));
  const land = easeInOut(seg(f, 18, 32));
  const FX = 1060, FY = 820, FS = 1.22;
  const handX = FX + 153 * FS, handY = FY - 148 * FS;
  const lbx = lerp(1640, handX + 4, land), lby = lerp(300, handY - 22, land) - Math.sin(land * Math.PI) * 60;
  // 町の家 (丘の斜面に段々に積む)
  const houses = Array.from({ length: 26 }, (_, i) => {
    const row = Math.floor(i / 7), col = i % 7;
    const x = 260 + col * 150 + row * 60 + rnd(910, i) * 30;
    const y = 470 - row * 70 - Math.max(0, 3 - Math.abs(col - 3)) * 22 + rnd(911, i) * 14;
    return { x, y, w: 110 + rnd(912, i) * 40, h: 70 + rnd(913, i) * 40, i };
  }).sort((a, b) => a.y - b.y);
  return (
    <Frame f={f} seed={3091} bg={C.sky}>
      <defs>
        <linearGradient id="l2b91sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sky} />
          <stop offset="100%" stopColor={C.skyLow} />
        </linearGradient>
      </defs>
      <g transform={camT(960, 540, z, pan)}>
        <rect x={-200} y={-100} width={W + 400} height={800} fill="url(#l2b91sky)" />
        {[[300, 120, 90], [1500, 90, 110]].map(([cx, cy, r], i) => (
          <ellipse key={i} cx={cx + Math.sin(f / 30 + i) * 20} cy={cy} rx={r} ry={r * 0.32} fill={KRP.white} opacity={0.85} />
        ))}
        {/* 奥の山 (スバシオ山) */}
        <path d="M -200 520 Q 300 250 700 230 Q 1100 200 1500 300 Q 1900 380 2120 470 L 2120 700 L -200 700 Z" fill={C.hillFar} stroke={KRP.ink} strokeWidth={5} />
        {/* 町の丘 */}
        <path d="M -200 640 Q 200 560 400 470 Q 700 380 1000 380 Q 1300 400 1500 520 Q 1700 600 2120 640 L 2120 1200 L -200 1200 Z" fill={C.hillMid} stroke={KRP.ink} strokeWidth={6} />
        {/* 鐘楼 */}
        <g>
          <rect x={990} y={150} width={90} height={260} fill={C.assisi} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1010 230 L 1010 190 Q 1035 168 1060 190 L 1060 230 Z" fill={C.timber} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 1024 222 Q 1035 ${204 + Math.sin(f / 4) * 4} 1046 222 Z`} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 980 152 L 1035 104 L 1090 152 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={6} />
          {[270, 320, 370].map((ly) => <line key={ly} x1={990} y1={ly} x2={1080} y2={ly} stroke={C.assisiDark} strokeWidth={4} />)}
        </g>
        {/* 教会の正面 (ばら窓) */}
        <g>
          <rect x={600} y={300} width={220} height={150} fill={C.assisi} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 590 304 L 710 240 L 830 304 Z" fill={C.assisi} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={710} cy={350} r={30} fill={C.assisiDark} stroke={KRP.ink} strokeWidth={5} />
          {[0, 45, 90, 135].map((a) => <line key={a} x1={710 + Math.cos((a * Math.PI) / 180) * 30} y1={350 + Math.sin((a * Math.PI) / 180) * 30} x2={710 - Math.cos((a * Math.PI) / 180) * 30} y2={350 - Math.sin((a * Math.PI) / 180) * 30} stroke={KRP.ink} strokeWidth={3} />)}
          <path d="M 690 450 L 690 410 Q 710 392 730 410 L 730 450 Z" fill={C.timber} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 石の家々 */}
        {houses.map((h) => (
          <g key={h.i}>
            <rect x={h.x} y={h.y} width={h.w} height={h.h} fill={h.i % 3 ? C.assisi : C.assisiDark} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${h.x - 10} ${h.y + 2} L ${h.x + h.w / 2} ${h.y - 26} L ${h.x + h.w + 10} ${h.y + 2} Z`} fill={h.i % 2 ? C.roof : C.roofDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <rect x={h.x + h.w * 0.25} y={h.y + 18} width={18} height={24} fill={C.timber} stroke={KRP.ink} strokeWidth={3} />
            {h.w > 130 && <rect x={h.x + h.w * 0.62} y={h.y + 18} width={18} height={24} fill={C.timber} stroke={KRP.ink} strokeWidth={3} />}
          </g>
        ))}
        {/* 城壁と門 */}
        <path d="M 200 560 Q 700 500 1500 560 L 1500 600 Q 700 540 200 600 Z" fill={C.assisiDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={210 + i * 80} y={548 - Math.sin((i / 15) * Math.PI) * 50 + (i > 7 ? (i - 7) * 0 : 0)} width={40} height={24} fill={C.assisiDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <path d="M 830 590 L 830 540 Q 860 512 890 540 L 890 590 Z" fill={C.devil} stroke={KRP.ink} strokeWidth={5} />
        {/* つづら折りの坂道 */}
        <path d="M 860 590 Q 1300 640 1100 720 Q 700 800 1000 880 Q 1300 960 1500 1200" fill="none" stroke={C.pathDark} strokeWidth={140} strokeLinecap="round" />
        <path d="M 860 590 Q 1300 640 1100 720 Q 700 800 1000 880 Q 1300 960 1500 1200" fill="none" stroke={C.path} strokeWidth={120} strokeLinecap="round" />
        {/* オリーブ畑 */}
        {Array.from({ length: 18 }, (_, i) => {
          const ox = (i < 9 ? 80 + i * 70 : 1300 + (i - 9) * 80) + rnd(914, i) * 20;
          const oy = 680 + (i % 3) * 70 + rnd(915, i) * 20;
          if (ox > 560 && ox < 1500) return null;
          return (
            <g key={i}>
              <line x1={ox} y1={oy} x2={ox} y2={oy + 30} stroke={C.woodDeep} strokeWidth={8} />
              <ellipse cx={ox + Math.sin(f / 14 + i) * 2} cy={oy - 6} rx={36} ry={26} fill={i % 2 ? C.olive : C.oliveDark} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={ox - 10} cy={oy - 14} rx={10} ry={4} fill={C.oliveLight} />
            </g>
          );
        })}
        {/* 糸杉 */}
        {[[140, 640, 1.1], [520, 560, 0.9], [1560, 580, 1.0], [1760, 660, 1.25], [380, 760, 1.2]].map(([cx, by, s], i) => (
          <g key={i} transform={`translate(${cx} ${by}) scale(${s}) rotate(${Math.sin(f / 10 + i) * 1.5})`}>
            <path d="M 0 -260 Q 40 -150 34 -40 Q 30 0 0 4 Q -30 0 -34 -40 Q -40 -150 0 -260 Z" fill={C.cypress} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 0 -220 Q 14 -140 10 -40" fill="none" stroke={C.cypressDark} strokeWidth={5} />
          </g>
        ))}
        {/* 道ばたの石と草 */}
        {[[1260, 930], [820, 760], [1380, 820]].map(([sx, sy], i) => (
          <ellipse key={i} cx={sx} cy={sy} rx={26} ry={14} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* フランチェスコ */}
        <L2bFrancis x={FX} y={FY} s={FS} f={f} pose="point" pointDir={1} face="smile" gaze={[8, -4]} lean={-2 + Math.sin(f / 4) * 1.5} />
        <circle cx={handX} cy={handY} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 足元の土ぼこり */}
        {[0, 1].map((i) => {
          const t = ((f + i * 10) % 20) / 20;
          return <circle key={i} cx={FX - 40 + i * 80 - t * 30} cy={FY - 6 - t * 12} r={8 + t * 10} fill="none" stroke={C.pathDark} strokeWidth={4} opacity={1 - t} />;
        })}
        {/* まわりを飛ぶ小鳥 */}
        {[0, 1, 2].map((i) => {
          const a = f / 9 + (i * Math.PI * 2) / 3;
          return <L2bBird key={i} x={FX + Math.cos(a) * 280} y={FY - 420 + Math.sin(a) * 70} s={1.25} flap={Math.sin(f / 1.6 + i)} dir={Math.sin(a) > 0 ? -1 : 1} />;
        })}
        {/* 手に止まる1羽 */}
        <L2bBird x={lbx} y={lby} s={0.95} flap={land < 1 ? Math.sin(f / 1.4) : 0.15} dir={-1} />
        {land >= 1 && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={1 - seg(f, 32, 42) * 0.6}>
            <line x1={handX - 40} y1={handY - 60} x2={handX - 52} y2={handY - 76} />
            <line x1={handX + 40} y1={handY - 60} x2={handX + 52} y2={handY - 76} />
          </g>
        )}
      </g>
      <TagPlate x={700} y={150} text="アッシジ" size={50} t={seg(f, 6, 14)} />
      <AgeDial x={1745} y={225} s={0.5} spin={420 * (1 - easeOut(seg(f, 0, 20)))} handle={f * 8} label="13世紀" />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_082: (f) => <Yw082 f={f} />,
  yw_083: (f) => <Yw083 f={f} />,
  yw_084: (f) => <Yw084 f={f} />,
  yw_085: (f) => <Yw085 f={f} />,
  yw_086: (f) => <Yw086 f={f} />,
  yw_087: (f) => <Yw087 f={f} />,
  yw_088: (f) => <Yw088 f={f} />,
  yw_089: (f) => <Yw089 f={f} />,
  yw_090: (f) => <Yw090 f={f} />,
  yw_091: (f) => <Yw091 f={f} />,
};

export const YW_D2_MOTIFS: string[] = [
  "yw_082",
  "yw_083",
  "yw_084",
  "yw_085",
  "yw_086",
  "yw_087",
  "yw_088",
  "yw_089",
  "yw_090",
  "yw_091",
];

export const yawaD2Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
