// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#92〜#101 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L2c。
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
  // フランチェスコと修道院 (YawaD2 #90・#91 とそろえる)
  habit: "#8A6A48", habitDark: "#6B5036", rope: "#F4EFE2", friarHair: "#4A3626", brotherHair: "#2E2620",
  feather: "#FBF7EE", featherShade: "#DDD3BE",
  night: "#1C2238", nightStone: "#3B4058", nightStoneDark: "#2B2F44", moon: "#F3EAC8",
  moonBeam: "#DCE6F2", straw: "#C9AE6A", strawDark: "#A88E4E", devil: "#141726",
  woodMid: "#7E5532", woodDeep: "#5B3B24", iron: "#4A4A52",
  flame: "#F4B942", flameCore: "#FFF0B8", togaShade: "#CFC4AC",
  // 昼・朝の修道院の石
  cell: "#C9BBA2", cellDark: "#A8987E", cellLight: "#E3D6BC", dawn: "#FBE3B0", dawnLight: "#FFF4D6",
  // アッシジの町 (#91 とそろえる)
  assisi: "#EAD3C0", assisiDark: "#CDB29C", roof: "#C8714A", roofDark: "#9E5434",
  path: "#D9C7A2", pathDark: "#BFA97E", sky: "#CFE3EC", skyLow: "#F3E6CC",
  cypress: "#3F5A3A", cypressDark: "#2C4029", olive: "#8C9A62", oliveDark: "#66733F",
  // #92 手放した物
  silk: "#3E6EA8", silkDark: "#2C5285", silkTrim: "#D9B23C", purse: "#9A4A32", purseDark: "#713423",
  shoe: "#6E4A2E", poor: "#9A9080", poorDark: "#78705F", poorB: "#B39A78", poorBDark: "#8E7859",
  // #96 中庭
  grass: "#9FB57A", grassDark: "#7E9660", hen: "#F6F1E6", comb: "#D3402E", well: "#B0A48E",
  // #97 写本
  parchment: "#EBDBB0", parchDark: "#CDB98A", brownInk: "#4A2E1C", illumRed: "#B8382C",
  illumBlue: "#2F5C9A", illumGold: "#D4A93A", linen: "#C8B48A", linenDark: "#A8946A",
  // #98 ステンドグラス
  glass1: "#D35A4A", glass2: "#4F7FC0", glass3: "#E8C24E", glass4: "#6FA86A", glass5: "#8C5FA8",
  lead: "#2A2622", halo: "#F2C94C", haloCore: "#FFF3C4",
  // #99 町の寝室
  plaster: "#EFE3C8", plasterDark: "#D8C8A6", timber: "#5B3B24", quilt: "#E8D7B4", quiltDark: "#CDB78E",
  quiltRed: "#C0574A", quiltBlue: "#5E7F9C", nightCap: "#F4EFE2", dusk: "#E9B98A", duskHigh: "#9AA9C8",
  kid: "#C9605A", kidDark: "#A3463F", mom: "#6F8F5A", momDark: "#56723F", dad: "#5E7F8C", dadDark: "#46636E",
  // #100 地図
  sea: "#B9CFCF", seaDark: "#93ADAD", land: "#E4CF9E", landDark: "#C7AF78", thames: "#6E9AB8",
  // #101 館の書斎
  dress: "#3F6B4A", dressDark: "#2C4F36", wimple: "#FAF7F0", tapestry: "#8E3B3B", tapestryDark: "#6A2A2C",
  hearth: "#8C8478", hearthDark: "#615A50", ember: "#E8743A", wax: "#C0392B", waxDark: "#8E2A20",
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

// Person を包む (YawaD2 の L2bFig と同じ)。back = 体の後ろ / children = 体の前
const L2cFig: React.FC<{
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
const L2cTonsure: React.FC<{ hair?: string }> = ({ hair = KRP.ink }) => (
  <g>
    <path d="M -62 -238 Q -66 -292 0 -295 Q 66 -292 62 -238 Q 50 -258 30 -262 L -30 -262 Q -50 -258 -62 -238 Z" fill={hair} />
    <ellipse cx={0} cy={-276} rx={40} ry={17} fill={KRP.white} />
    <path d="M -42 -284 Q 0 -298 42 -284" fill="none" stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// 修道服の上乗せ (すそ・つぎあて・縄の帯の結び目3つ・裸足)。Person s=1 足元原点
const L2cHabitBits: React.FC<{ f: number; patch?: boolean; bare?: boolean }> = ({ f, patch = true, bare = true }) => {
  const sway = Math.sin(f / 5) * 4;
  return (
    <g>
      <path d={`M -58 -70 L ${-68 + sway} -14 L ${68 + sway} -14 L 58 -70 Z`} fill={C.habit} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M -20 -60 L ${-24 + sway} -16 M 22 -60 L ${26 + sway} -16`} stroke={C.habitDark} strokeWidth={3.5} />
      {patch && (
        <g>
          <rect x={-44} y={-140} width={26} height={22} rx={3} fill={C.habitDark} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -40 -136 L -22 -122 M -22 -136 L -40 -122" stroke={C.habit} strokeWidth={2} />
        </g>
      )}
      <rect x={-60} y={-102} width={120} height={11} rx={5} fill={C.rope} stroke={KRP.ink} strokeWidth={3.5} />
      <path d={`M 26 -92 Q ${30 + sway * 0.6} -60 ${24 + sway} -30`} fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <path d={`M 26 -92 Q ${30 + sway * 0.6} -60 ${24 + sway} -30`} fill="none" stroke={C.rope} strokeWidth={5} strokeLinecap="round" />
      {[0.25, 0.55, 0.85].map((k) => (
        <circle key={k} cx={26 + (sway * 0.9) * k + 3 * Math.sin(k * 3)} cy={-92 + 62 * k} r={6} fill={C.rope} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {bare && [-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * 18} cy={-4} rx={20} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((t) => <line key={t} x1={d * 18 + d * (6 + t * 5)} y1={-10} x2={d * 18 + d * (6 + t * 5)} y2={-4} stroke={KRP.ink} strokeWidth={2} />)}
        </g>
      ))}
    </g>
  );
};

// フランチェスコ (#90・#91 と同じ姿: 茶の修道服・つぎはぎ・縄の帯・フード・裸足・剃髪)
const L2cFrancis: React.FC<{
  x: number; y: number; s: number; f: number; face?: PersonP["face"]; pose?: PersonP["pose"];
  pointDir?: 1 | -1; gaze?: [number, number]; lean?: number; phase?: number; extra?: React.ReactNode;
}> = ({ x, y, s, f, face = "smile", pose = "stand", pointDir = 1, gaze = [0, 0], lean = 0, phase = 3, extra }) => (
  <L2cFig x={x} y={y} s={s} f={f} phase={phase} lean={lean}
    back={<ellipse cx={0} cy={-158} rx={76} ry={30} fill={C.habitDark} stroke={KRP.ink} strokeWidth={4.5} />}
    p={{ face, cloth: C.habit, clothDark: C.habitDark, hair: "none", pose, pointDir, gaze }}>
    <L2cTonsure hair={C.friarHair} />
    <L2cHabitBits f={f} />
    {extra}
  </L2cFig>
);

// 仲間の修道士 (同じ茶の修道服・別の顔: 黒い髪の輪・丸いあごひげ・頬が赤い)
const L2cBrother: React.FC<{
  x: number; y: number; s: number; f: number; face?: PersonP["face"]; pose?: PersonP["pose"];
  pointDir?: 1 | -1; gaze?: [number, number]; lean?: number; phase?: number; extra?: React.ReactNode;
}> = ({ x, y, s, f, face = "normal", pose = "stand", pointDir = 1, gaze = [0, 0], lean = 0, phase = 7, extra }) => (
  <L2cFig x={x} y={y} s={s} f={f} phase={phase} lean={lean}
    back={<path d="M -80 -150 Q -90 -200 -50 -178 L 50 -178 Q 90 -200 80 -150 Q 0 -128 -80 -150 Z" fill={C.habitDark} stroke={KRP.ink} strokeWidth={4.5} />}
    p={{ face, cloth: C.habit, clothDark: C.habitDark, hair: "none", pose, pointDir, gaze }}>
    <L2cTonsure hair={C.brotherHair} />
    {/* あごひげ (口の下) */}
    <path d="M -40 -180 Q -36 -150 0 -146 Q 36 -150 40 -180 Q 20 -168 0 -170 Q -20 -168 -40 -180 Z" fill={C.brotherHair} opacity={0.9} />
    <ellipse cx={-42} cy={-200} rx={11} ry={6} fill={KRP.red} opacity={0.25} />
    <ellipse cx={42} cy={-200} rx={11} ry={6} fill={KRP.red} opacity={0.25} />
    <L2cHabitBits f={f + 11} patch={false} />
    {extra}
  </L2cFig>
);

// 横たわる人 (Person を -90° 回して寝かせる)。x,y = 頭の中心 / 体は右へのびる
// 下面は y + 64*s。寝床の上面に合わせて置く
const L2cLying: React.FC<{ x: number; y: number; s: number; children: React.ReactNode }> = ({ x, y, s, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(228 0) rotate(-90)`}>{children}</g>
);

// 石積みの壁 (目地)
const L2cBricks: React.FC<{ x0: number; y0: number; cols: number; rows: number; bw: number; bh: number; stroke: string; sw?: number }> = ({
  x0, y0, cols, rows, bw, bh, stroke, sw = 5,
}) => (
  <g fill="none" stroke={stroke} strokeWidth={sw}>
    {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (
      <rect key={`${r}-${c}`} x={x0 + c * bw + (r % 2) * (bw / 2)} y={y0 + r * bh} width={bw - 6} height={bh - 6} rx={6} />
    )))}
  </g>
);

// ろうそく (燭台つき)。h = ろうの高さ (短くなる演出に使う)
const L2cCandle: React.FC<{ x: number; y: number; s?: number; f: number; h?: number; glow?: number }> = ({ x, y, s = 1, f, h = 90, glow = 1 }) => {
  const fl = 1 + Math.sin(f / 2.3) * 0.12;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-h - 26} r={60 * glow + 10} fill={C.flame} opacity={0.18 + Math.sin(f / 3) * 0.04} />
      <ellipse cx={0} cy={0} rx={40} ry={10} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-14} y={-h} width={28} height={h} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M -14 ${-h + 6} q 6 14 0 24`} fill="none" stroke={C.togaShade} strokeWidth={4} />
      <path d={`M 0 ${-h - 4} Q ${-12 * fl} ${-h - 24} 0 ${-h - 50 * fl} Q ${12 * fl} ${-h - 24} 0 ${-h - 4} Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={0} cy={-h - 18} rx={4} ry={9} fill={C.flameCore} />
    </g>
  );
};

// ふっくらした羽毛の枕 (#90 と同じ形)。x,y = 底の中心
const L2cPillow: React.FC<{ x: number; y: number; w: number; h: number; f: number; dent?: number; rot?: number; fill?: string; shade?: string }> = ({
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
const L2cFeather: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M 0 22 Q -14 0 0 -26 Q 14 0 0 22 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    <line x1={0} y1={26} x2={0} y2={-22} stroke={KRP.ink} strokeWidth={2} />
  </g>
);

// 藁の寝床 (石の台 + 板 + 藁)。x0..x0+w、上面 top
const L2cStrawBed: React.FC<{ x0: number; top: number; w: number; stone: string; stoneDark: string }> = ({ x0, top, w, stone, stoneDark }) => (
  <g>
    <rect x={x0 + 20} y={top + 40} width={w - 40} height={150} fill={stoneDark} stroke={KRP.ink} strokeWidth={6} />
    <L2cBricks x0={x0 + 24} y0={top + 44} cols={Math.ceil((w - 40) / 190)} rows={2} bw={190} bh={72} stroke={stone} sw={4} />
    <rect x={x0} y={top + 6} width={w} height={36} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
    <path d={`M ${x0 + 20} ${top + 8} Q ${x0 + w / 2} ${top - 24} ${x0 + w - 20} ${top + 8} L ${x0 + w - 20} ${top + 16} L ${x0 + 20} ${top + 16} Z`} fill={C.straw} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: Math.floor(w / 46) }, (_, i) => (
      <line key={i} x1={x0 + 30 + i * 46} y1={top + 6} x2={x0 + 50 + i * 46 + rnd(93, i) * 20} y2={top - 8 + rnd(94, i) * 8} stroke={C.strawDark} strokeWidth={4} strokeLinecap="round" />
    ))}
  </g>
);

// すり切れた毛布 (横たわる体にかける)。x0..x1、上面 y
const L2cBlanket: React.FC<{ x0: number; x1: number; y: number; f: number; lift?: number; yb?: number }> = ({ x0, x1, y, f, lift = 0, yb }) => {
  const B = yb ?? y + 70;
  const br = Math.sin(f / 10) * 4 + lift;
  return (
    <g>
      <path d={`M ${x0} ${B} Q ${x0 - 30} ${y - 10 - br} ${x0 + 80} ${y - 30 - br} Q ${(x0 + x1) / 2} ${y - 46 - br} ${x1 - 40} ${y - 20} Q ${x1 + 20} ${y} ${x1} ${B} Z`}
        fill={C.habitDark} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      {[0.3, 0.55, 0.8].map((k) => (
        <path key={k} d={`M ${lerp(x0, x1, k)} ${y - 30 - br} q 10 ${(B - y) * 0.5} 0 ${B - y + 20}`} fill="none" stroke={C.habit} strokeWidth={4} />
      ))}
      <rect x={lerp(x0, x1, 0.62)} y={y - 18 - br} width={40} height={30} rx={3} fill={C.habit} stroke={KRP.ink} strokeWidth={3} transform={`rotate(-8 ${lerp(x0, x1, 0.62)} ${y})`} />
    </g>
  );
};

// めんどり (中庭)。x,y = 足元。jump = 0〜1 驚いて跳ぶ
const L2cHen: React.FC<{ x: number; y: number; s?: number; f: number; jump?: number; dir?: 1 | -1 }> = ({ x, y, s = 1, f, jump = 0, dir = 1 }) => {
  const up = Math.sin(clamp01(jump) * Math.PI) * 70;
  const peck = jump > 0 ? 0 : Math.max(0, Math.sin(f / 4)) * 10;
  const wing = jump > 0 ? -40 * Math.sin(f / 1.5) : 0;
  return (
    <g transform={`translate(${x} ${y - up}) scale(${s * dir} ${s})`}>
      <ellipse cx={0} cy={up / s + 4} rx={44} ry={8} fill={KRP.ink} opacity={0.15} />
      <path d="M -10 -8 L -14 0 M 10 -8 L 14 0" stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" />
      <path d="M -54 -50 Q -70 -96 -40 -88 Q -46 -70 -30 -62 Z" fill={C.hen} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={0} cy={-38} rx={46} ry={32} fill={C.hen} stroke={KRP.ink} strokeWidth={4.5} />
      <g transform={`rotate(${wing} -6 -44)`}>
        <path d="M -24 -44 Q 0 -60 20 -40 Q 0 -24 -24 -44 Z" fill={C.featherShade} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      <g transform={`translate(0 ${peck}) rotate(${peck})`}>
        <circle cx={38} cy={-74} r={18} fill={C.hen} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 28 -90 q 4 -12 10 -2 q 4 -12 10 0 q 6 -8 6 4 Z" fill={C.comb} stroke={KRP.ink} strokeWidth={3} />
        <path d="M 54 -76 l 14 4 l -14 4 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={2.5} />
        <ellipse cx={46} cy={-62} rx={4} ry={7} fill={C.comb} />
        {jump > 0 ? (
          <circle cx={42} cy={-78} r={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        ) : null}
        <circle cx={42} cy={-78} r={2.5} fill={KRP.ink} />
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#92 【山】 持ち物をすべて手放し、貧しく生きることを、つらぬいた人です。
// 設計: フランチェスコが、きれいな服・財布・靴を道に置いて、粗末な修道服で立ち去る。置かれた物は f で人々に配られていく (貧しい人が受け取る)。温かい光
// どこ: 夕方のアッシジの町はずれの石畳の道 (#91 と同じ町: 石の家・テラコッタ屋根・鐘楼・糸杉)。低い夕日の温かい光
// 演出: 粗末な修道服・裸足のフランチェスコが右へ歩き去りながら、穏やかにふり返る。道に置いた絹の上着・財布・革靴が、
//       貧しい人々 (杖のおじいさん・母と子) の手へ1つずつ渡っていく。受け取った人は喜ぶ。置いた跡には何も残らない
// 動き: カメラがゆっくり右へパンして寄る / f8〜24 靴→おじいさん / f14〜30 上着→母 / f20〜36 財布→子 (硬貨きらり) / 夕日の光の筋がゆれる
const L2cRobe: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -90 0 Q -96 -40 -70 -50 L 70 -50 Q 96 -40 90 0 Q 0 12 -90 0 Z" fill={C.silk} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -70 -50 L 0 -18 L 70 -50" fill="none" stroke={C.silkDark} strokeWidth={6} />
    <path d="M -86 -10 Q 0 2 86 -10" fill="none" stroke={C.silkTrim} strokeWidth={6} />
    <path d="M -72 -46 Q 0 -40 72 -46" fill="none" stroke={C.silkTrim} strokeWidth={5} />
    {[-40, 0, 40].map((dx) => <circle key={dx} cx={dx} cy={-26} r={4} fill={C.silkTrim} />)}
    <path d="M -50 -36 Q -30 -30 -20 -40" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
  </g>
);
const L2cPurse: React.FC<{ x: number; y: number; s?: number; f: number; open?: number }> = ({ x, y, s = 1, f, open = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -36 -4 Q -46 -50 -14 -60 L 14 -60 Q 46 -50 36 -4 Q 0 8 -36 -4 Z" fill={C.purse} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -16 -60 Q 0 -70 16 -60" fill="none" stroke={C.purseDark} strokeWidth={6} />
    <path d="M -18 -62 q -10 -14 -2 -20 M 18 -62 q 10 -14 2 -20" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
    {open > 0 && [[-10, -74], [8, -80], [0, -66]].map(([cx, cy], i) => (
      <g key={i} opacity={open}>
        <circle cx={cx} cy={cy} r={9} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
        <path d={`M ${cx + 14} ${cy - 10} l 6 -6 M ${cx + 18} ${cy} l 8 0`} stroke={YP.brass} strokeWidth={3 + Math.sin(f / 2 + i) * 1.5} strokeLinecap="round" />
      </g>
    ))}
  </g>
);
const L2cShoes: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[-26, 26].map((dx) => (
      <g key={dx}>
        <path d={`M ${dx - 24} 0 Q ${dx - 28} -30 ${dx - 8} -34 L ${dx + 4} -34 Q ${dx + 30} -16 ${dx + 26} 0 Z`} fill={C.shoe} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d={`M ${dx - 12} -30 L ${dx + 8} -22 M ${dx - 14} -20 L ${dx + 6} -14`} stroke={C.silkTrim} strokeWidth={3} />
      </g>
    ))}
  </g>
);
const Yw092: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const z = 1.0 + 0.05 * cam;
  const pan = -30 * cam;
  const GY = 800;
  const FX = 1330;
  // 渡る物: 出発点 (道に置いた場所) → 受け取る人の手
  const tShoe = easeInOut(seg(f, 8, 24));
  const tRobe = easeInOut(seg(f, 14, 30));
  const tPurse = easeInOut(seg(f, 20, 36));
  const OLD = { x: 420, s: 1.12 }, KID = { x: 640, s: 0.74 }, MOM = { x: 840, s: 1.12 };
  const hand = (p: { x: number; s: number }) => [p.x, GY - 120 * p.s] as const;
  const arc = (a: readonly [number, number], b: readonly [number, number], t: number, hgt: number) =>
    [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - Math.sin(t * Math.PI) * hgt] as const;
  const shoeP = arc([1000, GY - 6], hand(OLD), tShoe, 140);
  const robeP = arc([1110, GY - 4], [MOM.x, GY - 128 * MOM.s], tRobe, 120);
  const purseP = arc([1180, GY - 4], [KID.x + 56, GY - 70 * KID.s], tPurse, 110);
  return (
    <Frame f={f} seed={3092} bg={C.dawn}>
      <defs>
        <linearGradient id="l2c92sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.duskHigh} />
          <stop offset="55%" stopColor={C.dusk} />
          <stop offset="100%" stopColor={C.dawn} />
        </linearGradient>
        <radialGradient id="l2c92sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={C.dawnLight} stopOpacity={0.95} />
          <stop offset="100%" stopColor={C.dawn} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={camT(960, 560, z, pan)}>
        <rect x={-200} y={-100} width={W + 400} height={800} fill="url(#l2c92sky)" />
        {/* 低い夕日と光の筋 */}
        <circle cx={1760} cy={420} r={300} fill="url(#l2c92sun)" />
        <circle cx={1760} cy={430} r={70} fill={C.dawnLight} stroke={C.flame} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = Math.PI + 0.25 + i * 0.16;
          return <polygon key={i} points={`1760,430 ${1760 + Math.cos(a) * 1900},${430 + Math.sin(a + 0.03) * 1900 - 300 + i * 120} ${1760 + Math.cos(a + 0.05) * 1900},${430 + Math.sin(a + 0.08) * 1900 - 300 + i * 120}`}
            fill={C.dawnLight} opacity={0.12 + Math.sin(f / 9 + i) * 0.04} />;
        })}
        {/* 奥の丘と町並み (アッシジ) */}
        <path d="M -200 560 Q 300 420 800 440 Q 1300 460 2120 520 L 2120 700 L -200 700 Z" fill={C.olive} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
        {Array.from({ length: 11 }, (_, i) => {
          const hx = -60 + i * 175 + rnd(920, i) * 30, hw = 120 + rnd(921, i) * 50, hh = 110 + rnd(922, i) * 90;
          const hy = 640 - hh;
          return (
            <g key={i}>
              <rect x={hx} y={hy} width={hw} height={hh + 80} fill={i % 3 ? C.assisi : C.assisiDark} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${hx - 12} ${hy + 2} L ${hx + hw / 2} ${hy - 34} L ${hx + hw + 12} ${hy + 2} Z`} fill={i % 2 ? C.roof : C.roofDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
              <path d={`M ${hx + hw * 0.3} ${hy + 70} L ${hx + hw * 0.3} ${hy + 40} Q ${hx + hw * 0.3 + 14} ${hy + 26} ${hx + hw * 0.3 + 28} ${hy + 40} L ${hx + hw * 0.3 + 28} ${hy + 70} Z`} fill={C.timber} stroke={KRP.ink} strokeWidth={3.5} />
              {hw > 140 && <rect x={hx + hw * 0.66} y={hy + 36} width={22} height={30} fill={C.flame} opacity={0.8} stroke={KRP.ink} strokeWidth={3.5} />}
            </g>
          );
        })}
        {/* 鐘楼 */}
        <g>
          <rect x={560} y={230} width={96} height={340} fill={C.assisi} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 582 320 L 582 280 Q 608 256 634 280 L 634 320 Z" fill={C.timber} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 596 312 Q 608 ${294 + Math.sin(f / 4) * 4} 620 312 Z`} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 550 232 L 608 180 L 666 232 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 糸杉 */}
        {[[1540, 660, 1.0], [140, 680, 1.1]].map(([cx, by, s], i) => (
          <g key={i} transform={`translate(${cx} ${by}) scale(${s}) rotate(${Math.sin(f / 10 + i) * 1.5})`}>
            <path d="M 0 -300 Q 44 -170 38 -40 Q 32 0 0 4 Q -32 0 -38 -40 Q -44 -170 0 -300 Z" fill={C.cypress} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 0 -250 Q 14 -160 10 -40" fill="none" stroke={C.cypressDark} strokeWidth={5} />
          </g>
        ))}
        {/* 石畳の道 */}
        <rect x={-200} y={660} width={W + 400} height={560} fill={C.path} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 16 }, (_, c) => (
          <ellipse key={`${r}-${c}`} cx={-120 + c * 140 + (r % 2) * 70} cy={700 + r * 70} rx={56 + r * 4} ry={20 + r * 3}
            fill="none" stroke={C.pathDark} strokeWidth={4} />
        )))}
        {/* 夕日が道に落とす長い影 */}
        <ellipse cx={FX - 150} cy={GY + 8} rx={200} ry={16} fill={KRP.ink} opacity={0.15} />
        {/* 置いた場所 (渡り終わると、跡だけ) */}
        {[1000, 1110, 1180].map((sx, i) => (
          <ellipse key={i} cx={sx} cy={GY + 2} rx={50} ry={9} fill={C.pathDark} opacity={0.5} />
        ))}
        {/* 貧しい人々 */}
        <L2cFig x={OLD.x} y={GY} s={OLD.s} f={f} phase={2} lean={6 - 6 * tShoe}
          p={{ face: tShoe > 0.8 ? "joy" : "surprised", cloth: C.poor, clothDark: C.poorDark, hair: "none", pose: "hold", gaze: [6, -2] }}
          back={<line x1={-90} y1={-150} x2={-110} y2={0} stroke={C.woodDeep} strokeWidth={12} strokeLinecap="round" />}>
          {/* 白髪と白ひげ・つぎはぎ */}
          <path d="M -62 -244 Q -70 -290 -30 -288 M 62 -244 Q 70 -290 30 -288" fill="none" stroke={KRP.gray} strokeWidth={10} strokeLinecap="round" />
          <path d="M -34 -176 Q 0 -138 34 -176" fill={KRP.gray} opacity={0.9} />
          <rect x={10} y={-90} width={30} height={26} rx={3} fill={C.poorDark} stroke={KRP.ink} strokeWidth={3} />
          {/* 裸足 */}
          {[-18, 18].map((dx) => <ellipse key={dx} cx={dx} cy={-4} rx={20} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
        </L2cFig>
        <L2cFig x={KID.x} y={GY} s={KID.s} f={f} phase={5}
          p={{ face: tPurse > 0.8 ? "joy" : "normal", cloth: C.poorB, clothDark: C.poorBDark, hair: "cap", pose: "hold", gaze: [8, -4] }}>
          {[-18, 18].map((dx) => <ellipse key={dx} cx={dx} cy={-4} rx={20} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
        </L2cFig>
        <L2cFig x={MOM.x} y={GY} s={MOM.s} f={f} phase={9}
          p={{ face: tRobe > 0.8 ? "smile" : "surprised", cloth: C.poorB, clothDark: C.poorBDark, hair: "none", pose: "hold", gaze: [8, -2] }}>
          {/* 頭巾 */}
          <path d="M -70 -220 Q -74 -300 0 -302 Q 74 -300 70 -220 L 62 -150 L 48 -150 Q 56 -260 0 -262 Q -56 -260 -48 -150 L -62 -150 Z" fill={C.poor} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -58 -70 L -66 -14 L 66 -14 L 58 -70 Z" fill={C.poorB} stroke={KRP.ink} strokeWidth={4.5} />
          {[-18, 18].map((dx) => <ellipse key={dx} cx={dx} cy={-4} rx={20} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
        </L2cFig>
        {/* 渡っていく物 */}
        <L2cShoes x={shoeP[0]} y={shoeP[1] + 10 * tShoe} s={1.15} rot={-20 * Math.sin(tShoe * Math.PI)} />
        <L2cRobe x={robeP[0]} y={robeP[1] + 14 * tRobe} s={1.05} rot={14 * Math.sin(tRobe * Math.PI)} />
        <L2cPurse x={purseP[0]} y={purseP[1] + 10 * tPurse} s={1.1} f={f} open={seg(f, 34, 40)} />
        {/* 受け取った喜びの小さな線 */}
        {[[OLD.x, GY - 300 * OLD.s, tShoe], [MOM.x, GY - 310 * MOM.s, tRobe], [KID.x, GY - 300 * KID.s, tPurse]].map(([hx, hy, t], i) => t >= 1 && (
          <g key={i} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.8}>
            <line x1={hx - 46} y1={hy + 10} x2={hx - 60} y2={hy - 8} />
            <line x1={hx} y1={hy} x2={hx} y2={hy - 22} />
            <line x1={hx + 46} y1={hy + 10} x2={hx + 60} y2={hy - 8} />
          </g>
        ))}
        {/* フランチェスコ: 右へ立ち去りながら、ふり返る */}
        <L2cFrancis x={FX + 40 * cam} y={GY} s={1.26} f={f} face="smile" gaze={[-9, 0]} lean={3 + Math.sin(f / 4) * 1.5} />
        {[0, 1].map((i) => {
          const t = ((f + i * 10) % 20) / 20;
          return <circle key={i} cx={FX + 40 * cam - 40 + i * 80 - t * 30} cy={GY - 6 - t * 12} r={8 + t * 10} fill="none" stroke={C.pathDark} strokeWidth={4} opacity={1 - t} />;
        })}
      </g>
    </Frame>
  );
};

// ---- 文#93 【山】 あるとき、病気になったフランチェスコに、仲間が羽毛の枕を用意しました。
// 設計: 修道院の小部屋。藁の寝床に横たわる病気のフランチェスコ (face="sad"、汗)。仲間の修道士が、心配そうに、ふかふかの羽毛の枕を両手で差し出す (pose="hold")。ろうそく
// どこ: 夕暮れの修道院の小部屋 (#90 と同じ: 石積みの壁・石の台に板と藁の寝床・壁の十字架・釘の縄の帯)。壁のくぼみにろうそく
// 演出: 藁の寝床に横たわる病気のフランチェスコ (顔が赤く汗。頭の下は木切れの枕)。仲間の修道士が心配顔で、
//       ふかふかの羽毛の枕を両手で差し出しながら近づく。枕のまわりだけふわっと明るい (場違いな柔らかさ)
// 動き: カメラが寝床へゆっくり寄る / f4〜26 修道士が近づき枕を差し出す / 汗のしずくが落ちる / 熱のゆらゆら線 / ろうそくのゆれ
const Yw093: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.07 * easeInOut(seg(f, 0, 42));
  const come = easeInOut(seg(f, 4, 26));
  const BX = lerp(1430, 1200, come);
  const TOP = 640;
  const HX = 330, HY = TOP - 64 * 1.2 + 6;
  return (
    <Frame f={f} seed={3093} bg={C.cell}>
      <g transform={camT(760, 560, z)}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.cell} />
        <L2cBricks x0={-100} y0={-40} cols={12} rows={9} bw={180} bh={96} stroke={C.cellDark} />
        {/* 夕暮れの小さな窓 */}
        <defs><clipPath id="l2c93w"><path d="M 520 360 L 520 220 Q 590 150 660 220 L 660 360 Z" /></clipPath></defs>
        <path d="M 500 376 L 500 214 Q 590 120 680 214 L 680 376 Z" fill={C.cellDark} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#l2c93w)">
          <rect x={520} y={140} width={140} height={230} fill={C.dusk} />
          <rect x={520} y={300} width={140} height={70} fill={C.olive} />
          <circle cx={620} cy={300} r={26} fill={C.dawnLight} />
        </g>
        {[566, 614].map((x) => <line key={x} x1={x} y1={170} x2={x} y2={360} stroke={KRP.ink} strokeWidth={7} />)}
        <line x1={520} y1={270} x2={660} y2={270} stroke={KRP.ink} strokeWidth={7} />
        <polygon points="520,370 660,370 900,640 420,640" fill={C.dawnLight} opacity={0.16} />
        {/* 壁の十字架 */}
        <g transform="translate(980 230)">
          <rect x={-10} y={-70} width={20} height={150} rx={3} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-46} y={-40} width={92} height={20} rx={3} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 壁のくぼみのろうそく */}
        <path d="M 160 470 L 160 360 Q 220 300 280 360 L 280 470 Z" fill={C.cellDark} stroke={KRP.ink} strokeWidth={6} />
        <L2cCandle x={220} y={466} s={0.9} f={f} h={80} />
        {/* 床 */}
        <rect x={-60} y={830} width={W + 120} height={330} fill={C.cellDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 寝床 */}
        <L2cStrawBed x0={160} top={TOP} w={900} stone={C.cell} stoneDark={C.cellDark} />
        {/* 木切れの枕 (いつもの枕) */}
        <rect x={HX - 80} y={TOP - 28} width={120} height={34} rx={8} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={HX - 80} cy={TOP - 11} rx={8} ry={15} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={3} />
        {/* 横たわるフランチェスコ */}
        <L2cLying x={HX} y={HY} s={1.2}>
          <L2cFig x={0} y={0} s={1} f={f} phase={3}
            back={<ellipse cx={0} cy={-158} rx={76} ry={30} fill={C.habitDark} stroke={KRP.ink} strokeWidth={4.5} />}
            p={{ face: "sad", cloth: C.habit, clothDark: C.habitDark, hair: "none", gaze: [-6, 4] }}>
            <L2cTonsure hair={C.friarHair} />
            {/* 熱で赤い頬 */}
            <ellipse cx={-42} cy={-198} rx={13} ry={8} fill={KRP.red} opacity={0.45} />
            <ellipse cx={42} cy={-198} rx={13} ry={8} fill={KRP.red} opacity={0.45} />
          </L2cFig>
        </L2cLying>
        <L2cBlanket x0={HX + 70} x1={HX + 330} y={TOP - 116} yb={TOP + 6} f={f} />
        {/* 裸足の先 */}
        <ellipse cx={HX + 326} cy={TOP - 40} rx={10} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 汗のしずく と 熱のゆらゆら */}
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 9) % 26) / 26;
          return <path key={i} d={`M ${HX - 20 + i * 26} ${HY - 90 + t * 40} q -8 12 0 18 q 8 -6 0 -18 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2.5} opacity={1 - t} />;
        })}
        {[0, 1].map((i) => (
          <path key={i} d={`M ${HX - 30 + i * 50} ${HY - 120} q 10 -14 0 -28 q -10 -14 0 -28`} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.4 + Math.sin(f / 4 + i) * 0.2} transform={`translate(${Math.sin(f / 5 + i) * 4} 0)`} />
        ))}
        {/* 仲間の修道士が羽毛の枕を差し出す */}
        <ellipse cx={BX} cy={830} rx={110} ry={16} fill={KRP.ink} opacity={0.15} />
        <L2cBrother x={BX} y={830} s={1.32} f={f} face="worried" pose="point" pointDir={-1} lean={-5 * come} gaze={[-9, 4]} />
        <ellipse cx={BX - 350} cy={830 - 250} rx={200} ry={110} fill={C.dawnLight} opacity={0.35 + Math.sin(f / 6) * 0.08} />
        <L2cPillow x={BX - 350} y={830 - 148 * 1.32 - 6} w={260} h={120} f={f} rot={-4 * come} />
        {/* 差し出す動きの線 */}
        {come > 0.2 && come < 1 && [0, 1, 2].map((i) => (
          <line key={i} x1={BX + 150} y1={620 + i * 40} x2={BX + 220} y2={620 + i * 40} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#94 【山】 ところがその夜、彼は眠れませんでした。
// 設計: 夜。羽毛の枕に頭をのせたフランチェスコが、目を見開いて (face="worried") 天井を見ている。窓の月が f で動き (時間が過ぎる)、ろうそくが短くなる。寝返りの線
// どこ: #93 と同じ小部屋の、真夜中 (#90 と同じ夜の色: 青い石壁・月光の窓・十字架・縄の帯)
// 演出: 羽毛の枕に頭が沈んだフランチェスコが、目を見開いて天井を見つめる。体は落ち着かず、毛布の上に寝返りの線。
//       窓の月が横切り (時間が過ぎる)、壁のくぼみのろうそくがみるみる短くなって、ろうが垂れる
// 動き: カメラがゆっくり顔へ寄る / f0〜42 月が窓を左→右へ / ろうそく 90→26 に縮む / f10〜40 寝返りで毛布が揺れる / 寝返りの弧線
const Yw094: React.FC<{ f: number }> = ({ f }) => {
  const prog = seg(f, 0, 42);
  const z = 1.02 + 0.1 * easeInOut(prog);
  const TOP = 650;
  const HX = 420, HY = TOP - 92;
  const moonX = lerp(536, 650, prog), moonY = 250 - Math.sin(prog * Math.PI) * 50;
  const candleH = lerp(90, 26, prog);
  const toss = seg(f, 10, 40);
  const rock = Math.sin(toss * Math.PI * 3) * 6 * (toss > 0 && toss < 1 ? 1 : 0);
  return (
    <Frame f={f} seed={3094} bg={C.night} dark>
      <g transform={camT(HX + 120, 560, z)}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.nightStone} />
        <L2cBricks x0={-100} y0={-40} cols={12} rows={9} bw={180} bh={96} stroke={C.nightStoneDark} />
        {/* 月光の窓 (月が横切る) */}
        <defs><clipPath id="l2c94w"><path d="M 520 380 L 520 220 Q 600 140 680 220 L 680 380 Z" /></clipPath></defs>
        <path d="M 500 396 L 500 214 Q 600 116 700 214 L 700 396 Z" fill={C.nightStoneDark} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#l2c94w)">
          <rect x={520} y={140} width={160} height={240} fill={C.night} />
          <circle cx={moonX} cy={moonY} r={34} fill={C.moon} />
          <circle cx={moonX + 12} cy={moonY - 6} r={7} fill={C.moonBeam} opacity={0.6} />
          {[[550, 330], [660, 340], [540, 190], [640, 180]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill={C.moon} opacity={0.5 + Math.sin(f / 4 + i) * 0.4} />)}
        </g>
        {[560, 600, 640].map((x) => <line key={x} x1={x} y1={160} x2={x} y2={380} stroke={KRP.ink} strokeWidth={8} />)}
        <line x1={520} y1={290} x2={680} y2={290} stroke={KRP.ink} strokeWidth={8} />
        {/* 月の軌跡 (点線) */}
        <path d="M 540 260 Q 600 180 660 260" fill="none" stroke={C.moon} strokeWidth={3} strokeDasharray="6 10" opacity={0.35} />
        <polygon points={`520,390 680,390 ${980 + prog * 120},780 ${430 + prog * 120},780`} fill={C.moonBeam} opacity={0.18} />
        {/* 十字架・縄の帯 */}
        <g transform="translate(1080 230)">
          <rect x={-10} y={-70} width={20} height={150} rx={3} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-46} y={-40} width={92} height={20} rx={3} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g transform="translate(1300 420)">
          <circle r={8} fill={C.iron} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 0 0 Q -40 90 0 160 Q 40 90 0 0" fill="none" stroke={C.rope} strokeWidth={8} />
          {[60, 100, 140].map((ky) => <circle key={ky} cx={(ky - 100) * 0.1} cy={ky + 30} r={7} fill={C.rope} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        {/* 壁のくぼみ: ろうそくが短くなる */}
        <path d="M 160 480 L 160 330 Q 230 260 300 330 L 300 480 Z" fill={C.nightStoneDark} stroke={KRP.ink} strokeWidth={6} />
        <L2cCandle x={230} y={476} s={0.95} f={f} h={candleH} glow={0.6 + candleH / 150} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${216 + i * 12} ${476 - candleH + 6} q 3 ${10 + i * 8 + prog * 20} 0 ${18 + i * 10 + prog * 26}`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
        ))}
        <ellipse cx={232} cy={472} rx={24 + prog * 16} ry={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        {/* 床 */}
        <rect x={-60} y={830} width={W + 120} height={330} fill={C.nightStoneDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 寝床 */}
        <L2cStrawBed x0={160} top={TOP} w={980} stone={C.nightStone} stoneDark={C.nightStoneDark} />
        {/* 羽毛の枕に頭が沈む */}
        <L2cPillow x={HX - 30} y={TOP + 4} w={300} h={120} f={f} dent={1} />
        <g transform={`rotate(${rock * 0.4} ${HX + 150} ${TOP})`}>
          <L2cLying x={HX} y={HY} s={1.22}>
            <L2cFig x={0} y={0} s={1} f={f} phase={3}
              back={<ellipse cx={0} cy={-158} rx={76} ry={30} fill={C.habitDark} stroke={KRP.ink} strokeWidth={4.5} />}
              p={{ face: "worried", cloth: C.habit, clothDark: C.habitDark, hair: "none", gaze: [8, 0] }}>
              <L2cTonsure hair={C.friarHair} />
            </L2cFig>
          </L2cLying>
          {/* 枕のふち (頭が沈んで見える) */}
          <path d={`M ${HX - 180} ${TOP - 4} Q ${HX - 30} ${TOP - 30} ${HX + 110} ${TOP - 4}`} fill="none" stroke={C.featherShade} strokeWidth={10} strokeLinecap="round" />
          <L2cBlanket x0={HX + 74} x1={HX + 350} y={TOP - 142} yb={TOP + 6} f={f} lift={rock} />
          <ellipse cx={HX + 348} cy={TOP - 40} rx={10} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 見開いた目のまわりのきらり (眠れない) */}
        {[0, 1, 2].map((i) => {
          const a = -Math.PI / 2 + (i - 1) * 0.5;
          const r0 = 110, r1 = 140 + Math.sin(f / 3 + i) * 6;
          return <line key={i} x1={HX + Math.cos(a) * r0} y1={HY + Math.sin(a) * r0} x2={HX + Math.cos(a) * r1} y2={HY + Math.sin(a) * r1} stroke={C.moon} strokeWidth={5} strokeLinecap="round" />;
        })}
        {/* 寝返りの弧線 */}
        {toss > 0 && [0, 1].map((i) => (
          <path key={i} d={`M ${HX + 120 + i * 120} ${TOP - 170 - i * 10} q 50 -40 100 0`} fill="none" stroke={C.moon} strokeWidth={5} strokeLinecap="round"
            opacity={0.5 + 0.4 * Math.sin(f / 3 + i)} />
        ))}
        {[0, 1].map((i) => (
          <path key={`r${i}`} d={`M ${HX + 380} ${TOP - 120 + i * 40} l 30 ${-8 + i * 16}`} stroke={C.moon} strokeWidth={4} strokeLinecap="round" opacity={toss > 0 ? 0.6 : 0} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#95 【山】 翌朝、フランチェスコは言います。「あの枕には、悪魔がいた」。
// 設計: 朝の光。寝床から起き上がったフランチェスコが、枕を指さす (pose="point")。仲間の修道士がぎょっとする (face="surprised")。枕の上に、小さくてかわいい悪魔の影 (角と尻尾のシルエットではなく、半透明の小悪魔の線画) がちらっと見えてすぐ消える
// どこ: 同じ小部屋の翌朝。窓から金色の朝日が斜めに差し込み、窓辺に小鳥 (夜の青い色から一転)
// 演出: 寝床で身を起こしたフランチェスコが、真顔で寝床の端の羽毛の枕を指さす。朝のスープを運んできた仲間の修道士がぎょっとのけぞる。
//       枕の上に、半透明の線だけの小悪魔 (丸い体・小さな角・こうもりの羽・とがった尻尾・にやり顔) がちらっと浮かび、すうっと薄れていく
// 動き: カメラが枕へ寄りながら少し右へ / f6〜14 指さす / f14〜22 小悪魔がちらっ (はっきり) → f22〜42 薄れて残像に / f12〜20 修道士がのけぞり、椀が傾く / 朝日の粒
// ★2026-11-22 作者「悪魔の線に色つけしてほしい」→ 線画に色を塗った (紫の体・濃い紫の羽・金の角・赤い尻尾の先)。ちらっと出て薄れる動きはそのまま
const IMP = { body: "#9B6BC4", belly: "#C9A6E2", wing: "#5E3D87", wingIn: "#7C58A8", horn: "#F2C14E", tail: "#D9534F", line: "#2E1F45" };
const L2cImp: React.FC<{ x: number; y: number; s?: number; f: number; o: number }> = ({ x, y, s = 1, f, o }) => {
  if (o <= 0.01) return null;
  const wf = Math.sin(f / 1.8) * 10;
  const st = { fill: "none", stroke: IMP.line, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const fl = { stroke: IMP.line, strokeWidth: 5, strokeLinejoin: "round" as const };
  return (
    <g transform={`translate(${x} ${y + Math.sin(f / 5) * 8}) scale(${s})`} opacity={o}>
      {/* 羽 */}
      <path d={`M -40 -10 Q -90 ${-60 - wf} -110 ${-20 - wf} Q -90 -10 -96 14 Q -70 0 -60 18 Q -50 0 -40 10 Z`} fill={IMP.wing} {...fl} />
      <path d={`M 40 -10 Q 90 ${-60 - wf} 110 ${-20 - wf} Q 90 -10 96 14 Q 70 0 60 18 Q 50 0 40 10 Z`} fill={IMP.wing} {...fl} />
      <path d={`M -48 -4 Q -80 ${-40 - wf * 0.7} -96 ${-18 - wf}`} stroke={IMP.wingIn} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={`M 48 -4 Q 80 ${-40 - wf * 0.7} 96 ${-18 - wf}`} stroke={IMP.wingIn} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* 尻尾 (体の後ろ) */}
      <path d={`M 40 30 Q 90 ${50 + wf * 0.5} 96 ${10 + wf * 0.5}`} {...st} stroke={IMP.line} strokeWidth={9} />
      <path d={`M 40 30 Q 90 ${50 + wf * 0.5} 96 ${10 + wf * 0.5}`} fill="none" stroke={IMP.body} strokeWidth={4} strokeLinecap="round" />
      <path d={`M 96 ${10 + wf * 0.5} l -14 -4 l 18 -16 l 2 22 Z`} fill={IMP.tail} {...fl} strokeWidth={3.5} />
      {/* 角 */}
      <path d="M -30 -42 Q -40 -72 -22 -84 Q -22 -62 -14 -52 Z" fill={IMP.horn} {...fl} />
      <path d="M 30 -42 Q 40 -72 22 -84 Q 22 -62 14 -52 Z" fill={IMP.horn} {...fl} />
      {/* 手足 */}
      <path d="M -30 46 l -6 18 M 30 46 l 6 18" {...st} strokeWidth={8} />
      {/* 体 */}
      <ellipse cx={0} cy={0} rx={52} ry={56} fill={IMP.body} {...fl} />
      <ellipse cx={0} cy={16} rx={30} ry={28} fill={IMP.belly} opacity={0.7} />
      <ellipse cx={-26} cy={-30} rx={12} ry={8} fill={KRP.white} opacity={0.45} />
      {/* にやり顔 */}
      <path d="M -26 -14 Q -18 -22 -10 -14" {...st} />
      <path d="M 10 -14 Q 18 -22 26 -14" {...st} />
      <path d="M -22 10 Q 0 30 22 10 Z" fill={IMP.line} {...fl} strokeWidth={4} />
      <path d="M 12 13 l 3 9 l 4 -8 Z" fill={KRP.white} stroke={IMP.line} strokeWidth={2} />
    </g>
  );
};
const Yw095: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const z = 1.0 + 0.08 * cam;
  const TOP = 660;
  const PIL = { x: 940, y: TOP + 4 };
  const point = seg(f, 6, 14);
  const flash = seg(f, 14, 22);
  const fade = seg(f, 22, 42);
  const impO = flash < 1 ? easeOut(flash) * 0.95 : 0.95 - fade * 0.68;
  const flick = flash >= 1 && fade < 1 ? 0.85 + Math.sin(f * 1.7) * 0.15 : 1;
  const jolt = easeOut(seg(f, 12, 20));
  return (
    <Frame f={f} seed={3095} bg={C.cellLight}>
      <defs>
        <linearGradient id="l2c95beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.dawnLight} stopOpacity={0.7} />
          <stop offset="100%" stopColor={C.dawn} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={camT(PIL.x, 560, z, -20 * cam)}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.cellLight} />
        <L2cBricks x0={-100} y0={-40} cols={12} rows={9} bw={180} bh={96} stroke={C.cell} />
        {/* 朝の窓 */}
        <defs><clipPath id="l2c95w"><path d="M 240 380 L 240 220 Q 320 140 400 220 L 400 380 Z" /></clipPath></defs>
        <path d="M 220 396 L 220 214 Q 320 116 420 214 L 420 396 Z" fill={C.cell} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#l2c95w)">
          <rect x={240} y={140} width={160} height={240} fill={C.sky} />
          <circle cx={350} cy={330} r={40} fill={C.dawnLight} stroke={C.flame} strokeWidth={4} />
          <path d="M 240 360 Q 320 330 400 350 L 400 380 L 240 380 Z" fill={C.olive} />
        </g>
        {[280, 320, 360].map((x) => <line key={x} x1={x} y1={160} x2={x} y2={380} stroke={KRP.ink} strokeWidth={8} />)}
        <line x1={240} y1={290} x2={400} y2={290} stroke={KRP.ink} strokeWidth={8} />
        {/* 窓辺の小鳥 */}
        <g transform={`translate(420 384) rotate(${Math.sin(f / 3) * 6})`}>
          <ellipse cx={0} cy={-14} rx={20} ry={13} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={16} cy={-26} r={9} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 24 -26 l 10 3 l -10 3 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={2} />
        </g>
        {/* 朝日の光の帯と粒 */}
        <polygon points="240,390 400,390 1260,840 560,840" fill="url(#l2c95beam)" />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={420 + i * 80 + Math.sin(f / 9 + i) * 14} cy={480 + rnd(950, i) * 280 + Math.cos(f / 11 + i) * 10} r={3.5} fill={C.dawnLight} opacity={0.8} />
        ))}
        {/* 十字架 */}
        <g transform="translate(700 220)">
          <rect x={-10} y={-70} width={20} height={150} rx={3} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-46} y={-40} width={92} height={20} rx={3} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 床 */}
        <rect x={-60} y={840} width={W + 120} height={330} fill={C.cell} stroke={KRP.ink} strokeWidth={6} />
        {/* 寝床 */}
        <L2cStrawBed x0={180} top={TOP} w={960} stone={C.cellLight} stoneDark={C.cell} />
        {/* 身を起こして指さすフランチェスコ (腰から下は毛布の中) */}
        <L2cFrancis x={520} y={TOP + 8} s={1.2} f={f} face="worried" pose={point > 0 ? "point" : "stand"} pointDir={1} gaze={[9, 2]} lean={-4 * point} />
        <path d={`M 340 ${TOP + 10} Q 330 ${TOP - 76} 420 ${TOP - 84} Q 560 ${TOP - 100} 700 ${TOP - 60} Q 780 ${TOP - 40} 790 ${TOP + 10} Z`}
          fill={C.habitDark} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        <path d="M 470 580 q 8 40 0 84 M 620 585 q 10 40 0 80" fill="none" stroke={C.habit} strokeWidth={4} />
        {/* 指先からの強調線 */}
        {point >= 1 && [0, 1, 2].map((i) => (
          <line key={i} x1={720 + i * 4} y1={TOP - 170 + (i - 1) * 22} x2={760 + i * 8} y2={TOP - 174 + (i - 1) * 34} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* 寝床の端の羽毛の枕 (いつもの木切れは手前に転がる) */}
        <L2cPillow x={PIL.x} y={PIL.y} w={300} h={130} f={f} />
        <rect x={810} y={TOP - 22} width={110} height={30} rx={8} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} transform={`rotate(-6 860 ${TOP})`} />
        {/* 小悪魔がちらっ → 薄れる */}
        <L2cImp x={PIL.x} y={PIL.y - 240} s={1.15} f={f} o={impO * flick} />
        {flash > 0 && flash < 1 && [0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return <line key={i} x1={PIL.x + Math.cos(a) * 90} y1={PIL.y - 240 + Math.sin(a) * 90} x2={PIL.x + Math.cos(a) * (120 + 40 * flash)} y2={PIL.y - 240 + Math.sin(a) * (120 + 40 * flash)} stroke={C.devil} strokeWidth={4} strokeLinecap="round" opacity={0.5} />;
        })}
        {fade > 0 && [0, 1, 2].map((i) => (
          <circle key={i} cx={PIL.x - 60 + i * 60} cy={PIL.y - 300 - fade * 60 - i * 10} r={10 + fade * 18} fill="none" stroke={C.devil} strokeWidth={3} opacity={0.35 * (1 - fade)} />
        ))}
        {/* ぎょっとする仲間の修道士 (朝のスープの椀) */}
        <L2cBrother x={1420} y={850} s={1.3} f={f} face={jolt > 0.3 ? "surprised" : "normal"} pose="hold" lean={10 * jolt} gaze={[-9, 2]}
          extra={
            <g transform={`translate(0 -126) rotate(${-24 * jolt})`}>
              <path d="M -46 -10 Q -40 30 0 34 Q 40 30 46 -10 Z" fill={C.woodMid} stroke={KRP.ink} strokeWidth={4.5} />
              <ellipse cx={0} cy={-10} rx={46} ry={10} fill={C.straw} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1].map((i) => <path key={i} d={`M ${-10 + i * 20} -24 q ${6 * Math.sin(f / 3 + i)} -14 0 -28`} fill="none" stroke={KRP.gray} strokeWidth={3.5} opacity={0.7} />)}
            </g>
          } />
        {jolt > 0.3 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
            <line x1={1300} y1={430} x2={1270} y2={400} />
            <line x1={1360} y1={410} x2={1356} y2={370} />
            <line x1={1240} y1={480} x2={1200} y2={470} />
          </g>
        )}
        {jolt > 0.5 && <path d={`M 1300 ${560 + seg(f, 20, 40) * 200} q -8 12 0 18 q 8 -6 0 -18 Z`} fill={C.straw} stroke={KRP.ink} strokeWidth={2.5} />}
      </g>
    </Frame>
  );
};

// ---- 文#96 【山】 そして、枕を遠くへ、放り出させたそうです。
// 設計: ★笑いの山②。修道院の窓から、仲間の修道士が羽毛の枕を放り投げる。枕は放物線を描いて飛び、羽根が舞う。窓辺のフランチェスコはほっとした顔。下の中庭の鶏がびっくり
// どこ: 朝の修道院を外から見た図。左に石の僧院の壁 (2階に尖頭の窓2つ・屋根・鐘)、下は井戸のある中庭、奥に丘と糸杉と青空
// 演出: 右の窓から仲間の修道士が羽毛の枕を「えいっ」と放り投げ (投げ終わりの万歳)、枕は大きな放物線で青空へ。
//       通ったあとに羽根がふわふわ舞い散る。左の窓のフランチェスコは胸に手を当てたように、ほっとした顔。中庭の鶏たちが跳び上がる
// 動き: カメラが枕を追って右へパン / f0〜8 投げる / f6〜 枕が回りながら放物線 (f45 で空の高み) / 羽根が軌跡から舞い落ちる / f22〜40 鶏が順に跳ぶ
const Yw096: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 4, 42));
  const pan = -150 * cam;
  const throwT = easeOut(seg(f, 0, 8));
  const pt = (ff: number) => clamp01((ff - 6) / 56);
  const path = (t: number) => [lerp(620, 1900, t), 330 - 4 * 330 * t * (1 - t) + t * 260] as const;
  const t = pt(f);
  const [px, py] = f < 6 ? [lerp(600, 620, f / 6), 380 - 50 * throwT] : path(t);
  return (
    <Frame f={f} seed={3096} bg={C.sky}>
      <defs>
        <linearGradient id="l2c96sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sky} />
          <stop offset="100%" stopColor={C.skyLow} />
        </linearGradient>
      </defs>
      <g transform={camT(960, 540, 1, pan)}>
        <rect x={-200} y={-100} width={W + 500} height={900} fill="url(#l2c96sky)" />
        {[[1100, 140, 110], [1700, 220, 90], [400, 90, 80]].map(([cx, cy, r], i) => (
          <ellipse key={i} cx={cx + Math.sin(f / 30 + i) * 20} cy={cy} rx={r} ry={r * 0.32} fill={KRP.white} opacity={0.85} />
        ))}
        {/* 奥の丘と糸杉 */}
        <path d="M 600 640 Q 1000 470 1400 500 Q 1800 530 2300 470 L 2300 800 L 600 800 Z" fill={C.olive} stroke={KRP.ink} strokeWidth={5} />
        {[[1500, 600, 0.9], [1640, 620, 1.1], [2000, 580, 1.0]].map(([cx, by, s], i) => (
          <g key={i} transform={`translate(${cx} ${by}) scale(${s}) rotate(${Math.sin(f / 10 + i) * 1.5})`}>
            <path d="M 0 -220 Q 36 -130 30 -36 Q 26 0 0 4 Q -26 0 -30 -36 Q -36 -130 0 -220 Z" fill={C.cypress} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 中庭 (草と石の小道・井戸) */}
        <rect x={-200} y={760} width={W + 500} height={400} fill={C.grass} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 18 }, (_, i) => (
          <path key={i} d={`M ${760 + i * 80 + rnd(960, i) * 30} ${800 + rnd(961, i) * 60} l -6 -16 M ${768 + i * 80 + rnd(960, i) * 30} ${800 + rnd(961, i) * 60} l 6 -18`} stroke={C.grassDark} strokeWidth={4} strokeLinecap="round" />
        ))}
        <g transform="translate(1180 770)">
          <rect x={-80} y={-80} width={160} height={80} rx={8} fill={C.well} stroke={KRP.ink} strokeWidth={6} />
          <L2cBricks x0={-80} y0={-80} cols={3} rows={2} bw={60} bh={40} stroke={C.cellDark} sw={3.5} />
          <rect x={-74} y={-210} width={14} height={134} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />
          <rect x={60} y={-210} width={14} height={134} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -96 -200 L 0 -250 L 96 -200 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-200} x2={0} y2={-120} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-16} y={-124} width={32} height={30} rx={3} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* 僧院の壁 */}
        <rect x={-200} y={180} width={960} height={620} fill={C.cell} stroke={KRP.ink} strokeWidth={7} />
        <defs><clipPath id="l2c96wall"><rect x={-200} y={180} width={960} height={620} /></clipPath></defs>
        <g clipPath="url(#l2c96wall)"><L2cBricks x0={-200} y0={184} cols={6} rows={7} bw={170} bh={88} stroke={C.cellDark} /></g>
        <path d="M -220 190 L 780 190 L 720 120 L -160 120 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <g transform="translate(560 120)">
          <rect x={-36} y={-110} width={72} height={110} fill={C.cell} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M -20 -26 Q 0 ${-60 + Math.sin(f / 4) * 4} 20 -26 Z`} fill={YP.brass} stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M -46 -108 L 0 -150 L 46 -108 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 窓 2つ (奥は暗い部屋) */}
        {[[300, "A"], [600, "B"]].map(([wx]) => (
          <path key={wx as number} d={`M ${(wx as number) - 105} 520 L ${(wx as number) - 105} 330 Q ${wx} 220 ${(wx as number) + 105} 330 L ${(wx as number) + 105} 520 Z`}
            fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        ))}
        {/* 左の窓: ほっとしたフランチェスコ */}
        <L2cFrancis x={300} y={640} s={1.0} f={f} face="smile" gaze={[9, -6]} lean={3} />
        {/* 右の窓: 投げ終わって万歳の修道士 */}
        <L2cBrother x={600} y={640} s={1.0} f={f} face={f < 8 ? "angry" : "joy"} pose={f < 6 ? "hold" : "banzai"} lean={6 * throwT} gaze={[8, -6]} />
        {/* 窓の下の壁と窓台 (体の下半分を隠す) */}
        {[300, 600].map((wx) => (
          <g key={wx}>
            <rect x={wx - 108} y={520} width={216} height={160} fill={C.cell} />
            <L2cBricks x0={wx - 108} y0={530} cols={2} rows={2} bw={108} bh={70} stroke={C.cellDark} sw={4} />
            <rect x={wx - 125} y={508} width={250} height={28} rx={4} fill={C.cellLight} stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
        {/* ほっ (フランチェスコの安堵の息) */}
        <path d={`M 360 ${410 - seg(f, 20, 40) * 20} q 30 -10 50 6 q 20 16 44 0`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={seg(f, 18, 26) * (1 - seg(f, 36, 42) * 0.5)} />
        {/* 枕の放物線 (点線の軌跡) */}
        {f > 6 && (
          <path d={Array.from({ length: 20 }, (_, i) => { const [x, y] = path((t * i) / 19); return `${i ? "L" : "M"} ${x} ${y}`; }).join(" ")}
            fill="none" stroke={KRP.white} strokeWidth={5} strokeDasharray="4 16" strokeLinecap="round" opacity={0.9} />
        )}
        {/* 舞い散る羽根 (軌跡の途中で生まれて落ちる) */}
        {Array.from({ length: 16 }, (_, i) => {
          const born = 8 + i * 2.2;
          if (f < born) return null;
          const age = f - born;
          const [bx, by] = path(pt(born));
          const fx = bx + Math.sin(age / 5 + i) * 30 + (rnd(962, i) - 0.5) * 60;
          const fy = by + age * (2.4 + rnd(963, i) * 1.6);
          return <L2cFeather key={i} x={fx} y={fy} s={0.9 + rnd(964, i) * 0.6} r={Math.sin(age / 6 + i) * 50} />;
        })}
        {/* 飛ぶ枕 */}
        <g transform={`translate(${px} ${py}) rotate(${f > 6 ? (f - 6) * 13 : -10}) translate(0 65)`}>
          <L2cPillow x={0} y={0} w={240} h={110} f={f} />
        </g>
        {f > 6 && [0, 1, 2].map((i) => (
          <line key={i} x1={px - 150 - i * 10} y1={py + 30 + (i - 1) * 40} x2={px - 210 - i * 10} y2={py + 40 + (i - 1) * 40} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" opacity={0.6} />
        ))}
        {/* 中庭の鶏 (びっくりして跳ぶ) */}
        {([[930, 22, 1], [1420, 28, -1], [1620, 34, 1]] as const).map(([hx, st, d], i) => {
          const j = f > st ? ((f - st) % 14) / 14 + 0.001 : 0;
          return (
            <g key={i}>
              <L2cHen x={hx} y={790} s={1.25} f={f + i * 5} jump={j > 0 && j < 1 ? j : 0} dir={d as 1 | -1} />
              {j > 0 && (
                <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" opacity={1 - j * 0.3}>
                  <line x1={hx - 30} y1={650} x2={hx - 46} y2={620} />
                  <line x1={hx + 10} y1={640} x2={hx + 14} y2={606} />
                  <line x1={hx + 50} y1={652} x2={hx + 72} y2={626} />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// ---- 文#97 【図】 柔らかい枕は、清い暮らしの、敵だったのです。
// 設計: 中世の写本の挿絵風 (世界=羊皮紙の写本のページ。飾り枠つき)。左に「清い暮らし」(粗い麻布・木の枕)、右に「敵」(羽毛の枕)、その間に✕。札「清い暮らし」「敵」
// どこ: 修道院の写字机の上に開いた、中世の写本の見開き (羊皮紙・赤青金の飾り枠・飾り頭文字)。机には羽ペンとインク壺
// 演出: 左ページ「清い暮らし」= 粗い麻布の上に木切れの枕 (金の光が差す)。右ページ「敵」= ふくらんだ羽毛の枕 (欄外に #95 の小悪魔の落書き)。
//       ノドの真ん中に、朱のインクで大きな✕がシュッ、シュッと書き込まれる
// 動き: カメラが写本へゆっくり寄る / f4〜16 左右の絵が順に描き上がる (不透明に) / f18〜30 ✕の2画が引かれる / 札 f26〜34 / 羽ペンがゆれる
const Yw097: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.05 * easeInOut(seg(f, 0, 42));
  const leftT = easeOut(seg(f, 4, 12));
  const rightT = easeOut(seg(f, 8, 16));
  const x1 = easeOut(seg(f, 18, 24)), x2 = easeOut(seg(f, 24, 30));
  const pageY0 = 110, pageY1 = 810;
  const border = (x0: number, w: number, col: string) => (
    <g>
      <rect x={x0 + 36} y={pageY0 + 36} width={w - 72} height={pageY1 - pageY0 - 72} fill="none" stroke={col} strokeWidth={10} />
      <rect x={x0 + 54} y={pageY0 + 54} width={w - 108} height={pageY1 - pageY0 - 108} fill="none" stroke={C.illumGold} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <circle cx={x0 + 36} cy={pageY0 + 80 + i * 75} r={9} fill={i % 2 ? C.illumGold : col} stroke={C.brownInk} strokeWidth={2.5} />
          <circle cx={x0 + w - 36} cy={pageY0 + 80 + i * 75} r={9} fill={i % 2 ? col : C.illumGold} stroke={C.brownInk} strokeWidth={2.5} />
        </g>
      ))}
      {[[x0 + 36, pageY0 + 36], [x0 + w - 36, pageY0 + 36], [x0 + 36, pageY1 - 36], [x0 + w - 36, pageY1 - 36]].map(([cx, cy], i) => (
        <g key={`c${i}`}>
          <circle cx={cx} cy={cy} r={22} fill={C.illumGold} stroke={C.brownInk} strokeWidth={4} />
          <path d={`M ${cx - 12} ${cy} L ${cx} ${cy - 12} L ${cx + 12} ${cy} L ${cx} ${cy + 12} Z`} fill={col} />
        </g>
      ))}
    </g>
  );
  // 本文の行 (読めない飾り線。台本の文は書かない)
  const lines = (x0: number, y0: number, n: number, w: number) => (
    <g stroke={C.brownInk} strokeWidth={5} strokeLinecap="round" opacity={0.35}>
      {Array.from({ length: n }, (_, i) => <line key={i} x1={x0} y1={y0 + i * 22} x2={x0 + w * (0.75 + rnd(970 + x0, i) * 0.25)} y2={y0 + i * 22} strokeDasharray="22 8 34 8 14 8" />)}
    </g>
  );
  return (
    <Frame f={f} seed={3097} bg={C.woodDeep}>
      <g transform={camT(960, 470, z)}>
        {/* 写字机 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.woodMid} />
        <g stroke={C.woodDeep} strokeWidth={5} opacity={0.5}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -20 ${40 + i * 140} q 480 ${rnd(971, i) * 36 - 18} 980 0 q 480 ${rnd(972, i) * 36 - 18} 980 0`} fill="none" />
          ))}
        </g>
        {/* 写本 (革の表紙 + 見開きの羊皮紙) */}
        <rect x={150} y={pageY0 - 30} width={1620} height={pageY1 - pageY0 + 64} rx={18} fill={C.purse} stroke={KRP.ink} strokeWidth={7} />
        <path d={`M 190 ${pageY0} Q 580 ${pageY0 - 26} 960 ${pageY0 + 10} L 960 ${pageY1 + 10} Q 580 ${pageY1 - 16} 190 ${pageY1} Z`} fill={C.parchment} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 1730 ${pageY0} Q 1340 ${pageY0 - 26} 960 ${pageY0 + 10} L 960 ${pageY1 + 10} Q 1340 ${pageY1 - 16} 1730 ${pageY1} Z`} fill={C.parchment} stroke={KRP.ink} strokeWidth={6} />
        <rect x={930} y={pageY0 + 10} width={60} height={pageY1 - pageY0} fill={C.parchDark} opacity={0.55} />
        {border(190, 770, C.illumBlue)}
        {border(960, 770, C.illumRed)}
        {/* 左ページ: 飾り頭文字と本文 */}
        <rect x={270} y={190} width={90} height={90} fill={C.illumBlue} stroke={C.brownInk} strokeWidth={4} />
        <text x={315} y={262} textAnchor="middle" fontFamily={MINCHO} fontWeight={900} fontSize={76} fill={C.illumGold}>P</text>
        {lines(380, 204, 4, 480)}
        {/* 清い暮らし: 麻布と木の枕 (金の光) */}
        <g opacity={leftT}>
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI + (i / 8) * Math.PI;
            return <line key={i} x1={575} y1={560} x2={575 + Math.cos(a) * 260} y2={560 + Math.sin(a) * 200} stroke={C.illumGold} strokeWidth={6} opacity={0.6 + Math.sin(f / 6 + i) * 0.2} />;
          })}
          <path d="M 330 640 L 360 540 L 800 540 L 830 640 Z" fill={C.linen} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <g stroke={C.linenDark} strokeWidth={3}>
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={366 + i * 38} y1={546} x2={346 + i * 40} y2={634} />)}
            {[566, 594, 620].map((y) => <line key={y} x1={350} y1={y} x2={812} y2={y} />)}
          </g>
          <rect x={470} y={490} width={210} height={58} rx={10} fill={YP.wood} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={470} cy={519} rx={12} ry={27} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {[504, 520, 536].map((y) => <path key={y} d={`M 490 ${y} q 80 -6 170 0`} fill="none" stroke={YP.woodDark} strokeWidth={3} />)}
        </g>
        {/* 右ページ: 飾り頭文字と本文 */}
        <rect x={1040} y={190} width={90} height={90} fill={C.illumRed} stroke={C.brownInk} strokeWidth={4} />
        <text x={1085} y={262} textAnchor="middle" fontFamily={MINCHO} fontWeight={900} fontSize={76} fill={C.illumGold}>D</text>
        {lines(1150, 204, 4, 480)}
        {/* 敵: 羽毛の枕と小悪魔の落書き */}
        <g opacity={rightT}>
          <L2cPillow x={1345} y={650} w={380} h={170} f={f} />
          {Array.from({ length: 5 }, (_, i) => (
            <L2cFeather key={i} x={1180 + i * 80} y={420 + Math.sin(f / 7 + i) * 12 + (i % 2) * 30} s={0.9} r={Math.sin(f / 8 + i) * 40} />
          ))}
          <L2cImp x={1610} y={330} s={0.55} f={f} o={0.85} />
        </g>
        {/* ノドの✕ (朱のインク) */}
        <g stroke={C.illumRed} strokeWidth={34} strokeLinecap="round">
          {x1 > 0 && <line x1={860} y1={350} x2={lerp(860, 1060, x1)} y2={lerp(350, 590, x1)} />}
          {x2 > 0 && <line x1={1060} y1={350} x2={lerp(1060, 860, x2)} y2={lerp(350, 590, x2)} />}
        </g>
        {x2 >= 1 && [0, 1, 2].map((i) => (
          <circle key={i} cx={880 + i * 90} cy={620 + (i % 2) * 14} r={6 + i * 2} fill={C.illumRed} opacity={0.8} />
        ))}
        {/* 羽ペンとインク壺 (机の上) */}
        <g transform="translate(1810 760)">
          <path d="M -30 0 Q -34 -50 0 -54 Q 34 -50 30 0 Z" fill={C.brownInk} stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${-18 + Math.sin(f / 8) * 4} 0 -50)`}>
            <path d="M 0 -50 Q -30 -200 20 -300 Q 40 -200 0 -50 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <line x1={0} y1={-50} x2={18} y2={-290} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
      </g>
      <TagPlate x={575} y={760} text="清い暮らし" size={44} t={seg(f, 26, 32)} fill={C.parchment} />
      <TagPlate x={1345} y={760} text="敵" size={50} t={seg(f, 28, 34)} fill={C.parchment} color={C.illumRed} />
    </Frame>
  );
};

// ---- 文#98 【並】 ただし、これは、聖人の話です。
// 設計: フランチェスコの頭の上に聖人の光の輪 (金の輪) がふわっと現れる。後ろに教会のステンドグラス。札「聖人」
// どこ: 石造りの教会の内陣。背後いっぱいに尖頭のステンドグラス (赤青黄緑紫・鉛の枠・上にばら窓)。両脇に柱と燭台。床に色の光が落ちる
// 演出: 胸の前で手を合わせたフランチェスコ (正面・穏やか)。頭の上に、金の光の輪がふわっと降りてきて止まり、きらめく。札「聖人」
// 動き: カメラがゆっくり寄る / f8〜24 光の輪が上から降りてきて頭上で止まる / f20〜32 光のきらめき / 札 f24〜32 / ステンドグラスの光がゆらぐ
const Yw098: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.08 * easeInOut(seg(f, 0, 42));
  const d = easeOut(seg(f, 8, 24));
  const FX = 960, FY = 880, FS = 1.6;
  const haloY = lerp(160, FY - 300 * FS, d);
  const tw = seg(f, 20, 32);
  const glassCols = [C.glass1, C.glass2, C.glass3, C.glass4, C.glass5];
  return (
    <Frame f={f} seed={3098} bg={C.cell}>
      <defs>
        <clipPath id="l2c98g"><path d="M 700 760 L 700 300 Q 700 120 960 40 Q 1220 120 1220 300 L 1220 760 Z" /></clipPath>
      </defs>
      <g transform={camT(FX, 460, z)}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.cell} />
        <L2cBricks x0={-100} y0={-40} cols={12} rows={10} bw={180} bh={96} stroke={C.cellDark} />
        {/* ステンドグラス */}
        <path d="M 670 780 L 670 300 Q 670 100 960 10 Q 1250 100 1250 300 L 1250 780 Z" fill={C.cellDark} stroke={KRP.ink} strokeWidth={8} />
        <g clipPath="url(#l2c98g)">
          {Array.from({ length: 8 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
            <rect key={`${r}-${c}`} x={700 + c * 87} y={300 + r * 58} width={87} height={58}
              fill={glassCols[(r * 3 + c * 2) % 5]} opacity={0.78 + Math.sin(f / 8 + r + c) * 0.08} />
          )))}
          <rect x={700} y={40} width={520} height={260} fill={C.glass2} opacity={0.85} />
          <circle cx={960} cy={210} r={110} fill={C.glass3} stroke={C.lead} strokeWidth={8} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <g key={i}>
                <line x1={960} y1={210} x2={960 + Math.cos(a) * 110} y2={210 + Math.sin(a) * 110} stroke={C.lead} strokeWidth={6} />
                <circle cx={960 + Math.cos(a + 0.4) * 70} cy={210 + Math.sin(a + 0.4) * 70} r={18} fill={glassCols[i % 5]} stroke={C.lead} strokeWidth={4} />
              </g>
            );
          })}
          <circle cx={960} cy={210} r={34} fill={C.glass1} stroke={C.lead} strokeWidth={6} />
          <g stroke={C.lead} strokeWidth={7}>
            {Array.from({ length: 7 }, (_, c) => <line key={c} x1={700 + c * 87} y1={300} x2={700 + c * 87} y2={780} />)}
            {Array.from({ length: 9 }, (_, r) => <line key={r} x1={700} y1={300 + r * 58} x2={1220} y2={300 + r * 58} />)}
          </g>
        </g>
        <line x1={960} y1={40} x2={960} y2={780} stroke={C.cellDark} strokeWidth={16} />
        {/* 柱 */}
        {[440, 1480].map((cx) => (
          <g key={cx}>
            <rect x={cx - 60} y={60} width={120} height={800} fill={C.cellLight} stroke={KRP.ink} strokeWidth={7} />
            {[cx - 30, cx, cx + 30].map((lx) => <line key={lx} x1={lx} y1={80} x2={lx} y2={840} stroke={C.cell} strokeWidth={5} />)}
            <rect x={cx - 80} y={40} width={160} height={40} rx={6} fill={C.cellLight} stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
        {/* 燭台 */}
        <L2cCandle x={600} y={790} s={1.1} f={f} h={120} />
        <L2cCandle x={1320} y={790} s={1.1} f={f + 13} h={120} />
        {/* 床と色の光 */}
        <rect x={-60} y={800} width={W + 120} height={330} fill={C.cellDark} stroke={KRP.ink} strokeWidth={6} />
        {glassCols.map((col, i) => (
          <polygon key={i} points={`${700 + i * 104},780 ${804 + i * 104},780 ${840 + i * 130},1080 ${700 + i * 130},1080`} fill={col} opacity={0.18 + Math.sin(f / 9 + i) * 0.04} />
        ))}
        {/* 後光 (輪が止まると広がる) */}
        <circle cx={FX} cy={FY - 228 * FS} r={140 + 60 * tw} fill={C.halo} opacity={0.22 * tw} />
        {/* フランチェスコ (手を合わせる) */}
        <L2cFrancis x={FX} y={FY} s={FS} f={f} face="smile" pose="hold" gaze={[0, -3 * d]} />
        {/* 合わせた手 */}
        <path d={`M ${FX - 14} ${FY - 118 * FS - 4} L ${FX} ${FY - 150 * FS} L ${FX + 14} ${FY - 118 * FS - 4} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 光の輪 */}
        <g transform={`translate(${FX} ${haloY})`}>
          <ellipse cx={0} cy={0} rx={112} ry={30} fill="none" stroke={C.halo} strokeWidth={22} opacity={0.5} />
          <ellipse cx={0} cy={0} rx={112} ry={30} fill="none" stroke={C.halo} strokeWidth={12} />
          <ellipse cx={0} cy={0} rx={112} ry={30} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          <path d="M -80 -14 Q -40 -26 0 -28" fill="none" stroke={C.haloCore} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* きらめき */}
        {tw > 0 && Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + f / 20;
          const r = 170 + Math.sin(f / 4 + i) * 16;
          const sx = FX + Math.cos(a) * r, sy = haloY + 60 + Math.sin(a) * r * 0.6;
          const k = 14 * tw * (0.7 + Math.sin(f / 2 + i) * 0.3);
          return <path key={i} d={`M ${sx} ${sy - k} L ${sx + k * 0.3} ${sy} L ${sx} ${sy + k} L ${sx - k * 0.3} ${sy} Z M ${sx - k} ${sy} L ${sx} ${sy - k * 0.3} L ${sx + k} ${sy} L ${sx} ${sy + k * 0.3} Z`} fill={C.haloCore} stroke={C.halo} strokeWidth={2} />;
        })}
      </g>
      <TagPlate x={1560} y={600} text="聖人" size={60} t={seg(f, 24, 32)} fill={C.haloCore} />
    </Frame>
  );
};

// ---- 文#99 【山】 同じ時代のふつうの人々は、羽毛の寝具が、大好きでした。
// 設計: 中世の町の家の寝室。ふかふかの羽毛布団にくるまって幸せそうに眠る家族。窓の外の町並み。布団から羽根が1枚ふわり
// どこ: 13世紀の町家の寝室 (しっくいの壁に木組み・天井の梁・干したハーブ・木の長持ちとろうそく)。窓の外に夜の町並み (木組みの家・教会の尖塔・月)
// 演出: 大きな木の寝台で、父・子・母が並んで、ぱんぱんにふくらんだ羽毛布団にあごまでくるまり、幸せそうに眠る (#94 の眠れない聖人と正反対)。
//       布団が寝息で上下し、継ぎ目から羽根が1枚ふわりと舞い上がる
// 動き: カメラがゆっくり寄りつつ少し下がる / 布団が寝息でふくらむ / f6〜42 羽根が1枚ゆらゆら舞い上がる / 寝息の泡 / ろうそくと月の星がまたたく
const Yw099: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.06 * easeInOut(seg(f, 0, 42));
  const br = Math.sin(f / 9) * 6;
  const ft = easeOut(seg(f, 6, 42));
  const fx = 960 + Math.sin(f / 6) * 50 * ft, fy = lerp(610, 340, ft);
  const fam = [
    { x: 660, s: 1.15, cloth: C.dad, dark: C.dadDark, cap: C.quiltBlue, ph: 1 },
    { x: 960, s: 0.85, cloth: C.kid, dark: C.kidDark, cap: C.nightCap, ph: 4 },
    { x: 1260, s: 1.1, cloth: C.mom, dark: C.momDark, cap: C.nightCap, ph: 8 },
  ];
  return (
    <Frame f={f} seed={3099} bg={C.plaster}>
      <g transform={camT(960, 520, z)}>
        {/* しっくいと木組みの壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.plaster} />
        <g fill={C.timber} stroke={KRP.ink} strokeWidth={5}>
          <rect x={-60} y={60} width={W + 120} height={40} />
          {[120, 400, 1520, 1800].map((x) => <rect key={x} x={x} y={100} width={36} height={740} />)}
          <path d="M 156 120 L 400 380 L 400 420 L 156 160 Z" />
          <path d="M 1556 380 L 1800 120 L 1800 160 L 1556 420 Z" />
        </g>
        {/* 天井の梁と干したハーブ */}
        {[300, 960, 1620].map((x, i) => (
          <g key={x} transform={`translate(${x} 100) rotate(${Math.sin(f / 12 + i) * 3})`}>
            <line x1={0} y1={0} x2={0} y2={50} stroke={C.strawDark} strokeWidth={4} />
            {[-14, 0, 14].map((dx) => <path key={dx} d={`M 0 50 Q ${dx} 80 ${dx * 1.6} 120`} fill="none" stroke={C.oliveDark} strokeWidth={7} strokeLinecap="round" />)}
          </g>
        ))}
        {/* 窓と夜の町並み */}
        <defs><clipPath id="l2c99w"><rect x={1600} y={190} width={180} height={230} rx={6} /></clipPath></defs>
        <rect x={1586} y={176} width={208} height={258} rx={8} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
        <g clipPath="url(#l2c99w)">
          <rect x={1600} y={190} width={180} height={230} fill={C.night} />
          <circle cx={1730} cy={240} r={22} fill={C.moon} />
          {[[1620, 220], [1680, 260], [1760, 300]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill={C.moon} opacity={0.5 + Math.sin(f / 4 + i) * 0.4} />)}
          <path d="M 1660 420 L 1660 300 L 1676 250 L 1692 300 L 1692 420 Z" fill={C.nightStone} stroke={KRP.ink} strokeWidth={3} />
          {[[1600, 340, 60], [1700, 360, 50], [1740, 330, 50]].map(([hx, hy, hw], i) => (
            <g key={i}>
              <rect x={hx} y={hy} width={hw} height={420 - hy} fill={C.nightStoneDark} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${hx - 4} ${hy} L ${hx + hw / 2} ${hy - 26} L ${hx + hw + 4} ${hy} Z`} fill={C.nightStone} stroke={KRP.ink} strokeWidth={3} />
              <rect x={hx + 14} y={hy + 16} width={12} height={14} fill={C.flame} opacity={0.6 + Math.sin(f / 5 + i) * 0.3} />
            </g>
          ))}
        </g>
        <line x1={1690} y1={190} x2={1690} y2={420} stroke={C.woodMid} strokeWidth={8} />
        <line x1={1600} y1={300} x2={1780} y2={300} stroke={C.woodMid} strokeWidth={8} />
        {/* 長持ちとろうそく (左) */}
        <rect x={120} y={640} width={220} height={150} rx={8} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
        <rect x={120} y={640} width={220} height={30} rx={8} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
        <rect x={212} y={690} width={36} height={30} rx={4} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
        <L2cCandle x={230} y={640} s={0.9} f={f} h={70} />
        {/* 床 */}
        <rect x={-60} y={840} width={W + 120} height={300} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
        {/* 寝台の頭板 (彫りもの) */}
        <path d="M 400 640 L 400 330 Q 960 250 1520 330 L 1520 640 Z" fill={C.woodMid} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 450 620 L 450 360 Q 960 296 1470 360 L 1470 620 Z" fill="none" stroke={C.woodDeep} strokeWidth={6} />
        {[600, 960, 1320].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={360} r={26} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${cx - 14} 360 Q ${cx} 340 ${cx + 14} 360 Q ${cx} 380 ${cx - 14} 360`} fill={YP.brass} />
          </g>
        ))}
        {/* 枕 */}
        {fam.map((p) => (
          <L2cPillow key={p.x} x={p.x} y={590} w={260 * Math.min(1, p.s + 0.1)} h={110} f={f + p.ph * 5} dent={0.6} />
        ))}
        {/* 眠る家族 (下は布団の中) */}
        {fam.map((p) => (
          <L2cFig key={p.x} x={p.x} y={510 + 228 * p.s} s={p.s} f={f} phase={p.ph}
            p={{ face: "joy", cloth: p.cloth, clothDark: p.dark, hair: p.ph === 8 ? "none" : "cap" }}>
            {/* ナイトキャップ */}
            <path d="M -66 -248 Q -60 -310 10 -312 Q 80 -300 96 -250 Q 120 -230 110 -206" fill={p.cap} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={110} cy={-200} r={14} fill={p.cap} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -66 -248 Q 0 -262 70 -250" fill="none" stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={-42} cy={-196} rx={12} ry={7} fill={KRP.red} opacity={0.3} />
            <ellipse cx={42} cy={-196} rx={12} ry={7} fill={KRP.red} opacity={0.3} />
          </L2cFig>
        ))}
        {/* ぱんぱんの羽毛布団 (キルトのふくらみ) */}
        <path d={`M 360 870 L 360 ${640 - br} Q 420 ${560 - br} 520 ${600 - br} Q 660 ${560 - br * 1.2} 800 ${600 - br} Q 960 ${580 - br * 1.4} 1120 ${600 - br} Q 1260 ${560 - br * 1.2} 1400 ${600 - br} Q 1500 ${560 - br} 1560 ${640 - br} L 1560 870 Z`}
          fill={C.quilt} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
          <rect key={`${r}-${c}`} x={400 + c * 194} y={660 + r * 70 - br * (1 - r * 0.3)} width={180} height={62} rx={26}
            fill={(r + c) % 3 === 0 ? C.quiltRed : (r + c) % 3 === 1 ? C.quilt : C.quiltBlue} opacity={(r + c) % 3 === 1 ? 1 : 0.55}
            stroke={C.quiltDark} strokeWidth={4} />
        )))}
        <path d={`M 380 ${648 - br} Q 960 ${620 - br} 1540 ${648 - br}`} fill="none" stroke={KRP.white} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
        {/* 寝台の脚 */}
        <rect x={340} y={860} width={50} height={60} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1530} y={860} width={50} height={60} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
        {/* 寝息の泡 */}
        {fam.map((p, i) => {
          const t = ((f + i * 12) % 30) / 30;
          return <circle key={i} cx={p.x + 90 * p.s + t * 30} cy={510 - 220 * p.s - t * 40} r={6 + t * 10} fill="none" stroke={C.quiltBlue} strokeWidth={3.5} opacity={1 - t} />;
        })}
        {/* 舞い上がる羽根1枚 */}
        <g opacity={seg(f, 4, 10)}>
          <L2cFeather x={fx} y={fy} s={2.2} r={Math.sin(f / 5) * 40} />
          <path d={`M ${fx - 30} ${fy + 50} q 20 30 0 60`} fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" opacity={0.7 * ft} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#100 【並】 舞台は、イギリスへ移ります。
// 設計: 羊皮紙の地図。イタリアからイギリスへ赤い点線の矢印。ロンドンに赤いピン。イギリスの国旗は現代のものなので置かず、札「イギリス」とテムズ川の小さな絵
// どこ: 机に広げた古い羊皮紙の地図 (海は淡い青緑・陸は黄土。方位磁針の飾り・帆船の絵・波線)。国旗は置かない
// 演出: イタリアのアッシジから、赤い点線の矢印がフランスを越えてイギリスへのびる。ロンドンに赤いピンがぽんと刺さる。
//       左の丸い拡大図に、テムズ川と帆船と橋の小さな絵。札「イギリス」
// 動き: カメラがイタリアからイギリスへパン / f6〜30 点線が1つずつ打たれていく / f28〜36 ピン / f30〜38 拡大図と札 / 帆船がゆれ、波線が動く
const Yw100: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.1;
  const cam = easeInOut(seg(f, 0, 40));
  const P = { x: lerp(1150, 860, cam), y: lerp(640, 500, cam) };
  const dx = -z * (P.x - 960), dy = -z * (P.y - 540);
  const draw = seg(f, 6, 30);
  const pin = pop(seg(f, 28, 36));
  const inset = easeOut(seg(f, 30, 38));
  const A = { x: 1240, y: 730 }, B = { x: 742, y: 446 }, Q = { x: 1060, y: 380 };
  const qp = (t: number) => ({
    x: (1 - t) * (1 - t) * A.x + 2 * (1 - t) * t * Q.x + t * t * B.x,
    y: (1 - t) * (1 - t) * A.y + 2 * (1 - t) * t * Q.y + t * t * B.y,
  });
  const N = 22;
  const end = qp(Math.max(0.001, draw * 0.96));
  const pre = qp(Math.max(0, draw * 0.96 - 0.04));
  const ang = (Math.atan2(end.y - pre.y, end.x - pre.x) * 180) / Math.PI;
  const land = "M 760 600 Q 740 560 820 550 Q 880 520 940 480 Q 1020 420 1100 360 Q 1300 280 1500 260 L 1980 240 L 1980 1120 L 1600 1120 L 1540 800 L 1440 700 L 1330 650 L 1390 780 L 1450 860 L 1440 900 L 1400 880 L 1380 940 L 1350 966 L 1300 860 L 1220 760 L 1150 640 L 1060 690 L 980 720 L 880 750 L 800 800 L 760 860 L 700 900 L 560 920 L 500 1000 L 480 1120 L 300 1120 L 340 900 L 460 860 L 600 820 L 700 720 L 690 640 Z";
  const gb = "M 600 160 L 660 140 L 700 200 L 690 260 L 740 320 L 780 400 L 800 450 L 760 482 L 640 490 L 560 504 L 620 450 L 600 400 L 640 340 L 600 300 L 620 240 L 580 200 Z";
  const ie = "M 430 280 L 500 260 L 530 320 L 510 400 L 440 420 L 410 360 Z";
  return (
    <Frame f={f} seed={3100} bg={C.woodDeep}>
      <g transform={camT(960, 540, z, dx, dy)}>
        {/* 机 */}
        <rect x={-400} y={-300} width={W + 800} height={H + 600} fill={C.woodMid} />
        {/* 羊皮紙 (ふちが波打つ) */}
        <path d="M 120 60 Q 500 30 960 56 Q 1400 30 1820 64 Q 1850 500 1830 1040 Q 1400 1066 960 1046 Q 500 1070 110 1040 Q 90 560 120 60 Z" fill={C.parchment} stroke={KRP.ink} strokeWidth={7} />
        <defs><clipPath id="l2c100p"><path d="M 140 80 Q 500 54 960 76 Q 1400 54 1800 84 Q 1826 500 1810 1020 Q 1400 1044 960 1026 Q 500 1048 130 1020 Q 112 560 140 80 Z" /></clipPath></defs>
        <g clipPath="url(#l2c100p)">
          <rect x={100} y={40} width={1760} height={1040} fill={C.sea} />
          {/* 波線 */}
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M ${200 + (i % 4) * 90 + Math.sin(f / 8 + i) * 8} ${140 + i * 62} q 15 -10 30 0 q 15 10 30 0`} fill="none" stroke={C.seaDark} strokeWidth={4} strokeLinecap="round" />
          ))}
          <path d={land} fill={C.land} stroke={C.brownInk} strokeWidth={6} strokeLinejoin="round" />
          <path d={gb} fill={C.land} stroke={C.brownInk} strokeWidth={6} strokeLinejoin="round" />
          <path d={ie} fill={C.land} stroke={C.brownInk} strokeWidth={6} strokeLinejoin="round" />
          {/* 山の記号 (アルプス) */}
          {[1040, 1100, 1160, 1220, 1280].map((mx, i) => (
            <path key={mx} d={`M ${mx - 30} ${600 - i % 2 * 10} L ${mx} ${550 - i % 2 * 10} L ${mx + 30} ${600 - i % 2 * 10}`} fill={C.landDark} stroke={C.brownInk} strokeWidth={4} strokeLinejoin="round" />
          ))}
          {/* 森の記号 */}
          {[[950, 500], [1350, 420], [880, 600], [640, 260]].map(([tx, ty], i) => (
            <g key={i}><circle cx={tx} cy={ty} r={14} fill={C.olive} stroke={C.brownInk} strokeWidth={3} /><line x1={tx} y1={ty + 14} x2={tx} y2={ty + 26} stroke={C.brownInk} strokeWidth={3} /></g>
          ))}
          {/* テムズ川 (地図上) */}
          <path d="M 650 440 Q 690 420 720 446 Q 760 460 800 446" fill="none" stroke={C.thames} strokeWidth={6} strokeLinecap="round" />
          {/* 帆船 */}
          <g transform={`translate(${520 + Math.sin(f / 14) * 10} ${640}) rotate(${Math.sin(f / 6) * 5})`}>
            <path d="M -50 0 Q 0 26 50 0 Z" fill={C.woodMid} stroke={C.brownInk} strokeWidth={4} />
            <line x1={0} y1={0} x2={0} y2={-80} stroke={C.brownInk} strokeWidth={4} />
            <path d="M 4 -76 Q 46 -46 4 -12 Z" fill={KRP.white} stroke={C.brownInk} strokeWidth={4} />
            <path d="M 0 -80 l 18 6 l -18 6" fill={C.illumRed} />
          </g>
          {/* 方位磁針 */}
          <g transform={`translate(1600 220) rotate(${Math.sin(f / 10) * 4})`}>
            <circle r={70} fill="none" stroke={C.brownInk} strokeWidth={4} />
            <path d="M 0 -90 L 14 0 L 0 90 L -14 0 Z" fill={C.illumRed} stroke={C.brownInk} strokeWidth={3} />
            <path d="M -90 0 L 0 14 L 90 0 L 0 -14 Z" fill={C.illumGold} stroke={C.brownInk} strokeWidth={3} />
            <text x={0} y={-100} textAnchor="middle" fontFamily={MINCHO} fontWeight={900} fontSize={30} fill={C.brownInk}>N</text>
          </g>
          {/* アッシジの点 */}
          <circle cx={A.x} cy={A.y} r={14} fill={C.illumRed} stroke={C.brownInk} strokeWidth={4} />
          <text x={A.x + 22} y={A.y + 44} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.brownInk}>アッシジ</text>
          {/* 赤い点線の矢印 */}
          {Array.from({ length: N }, (_, i) => {
            const t = (i + 0.5) / N;
            if (t > draw * 0.96) return null;
            const p = qp(t);
            return <circle key={i} cx={p.x} cy={p.y} r={9} fill={KRP.red} stroke={C.brownInk} strokeWidth={2} />;
          })}
          {draw > 0.05 && (
            <path d="M 0 0 L -34 -20 L -26 0 L -34 20 Z" fill={KRP.red} stroke={C.brownInk} strokeWidth={3.5} transform={`translate(${end.x} ${end.y}) rotate(${ang})`} />
          )}
          {/* ロンドンの赤いピン */}
          {pin > 0 && (
            <g transform={`translate(${B.x} ${B.y}) scale(${pin})`}>
              <ellipse cx={0} cy={0} rx={16} ry={6} fill={KRP.ink} opacity={0.3} />
              <line x1={0} y1={0} x2={0} y2={-60} stroke={KRP.grayDark} strokeWidth={6} />
              <circle cx={0} cy={-70} r={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={-7} cy={-77} r={6} fill={KRP.white} opacity={0.8} />
            </g>
          )}
          {/* 拡大図: テムズ川と橋と帆船 */}
          {inset > 0 && (
            <g opacity={inset}>
              <line x1={B.x - 20} y1={B.y + 4} x2={430} y2={570} stroke={C.brownInk} strokeWidth={4} strokeDasharray="10 8" />
              <g transform={`translate(320 620) scale(${0.85 * inset})`}>
                <circle r={150} fill={C.land} stroke={C.brownInk} strokeWidth={7} />
                <defs><clipPath id="l2c100i"><circle r={146} /></clipPath></defs>
                <g clipPath="url(#l2c100i)">
                  <path d="M -160 -10 Q -60 -60 0 0 Q 60 60 160 10 L 160 70 Q 60 120 0 60 Q -60 0 -160 50 Z" fill={C.thames} stroke={C.brownInk} strokeWidth={4} />
                  {/* 石の橋と橋の上の家 */}
                  <rect x={-14} y={-60} width={28} height={150} fill={C.cellDark} stroke={C.brownInk} strokeWidth={4} transform="rotate(-30)" />
                  {[-1, 0, 1].map((k) => (
                    <g key={k} transform={`rotate(-30) translate(0 ${k * 40})`}>
                      <rect x={-20} y={-14} width={40} height={24} fill={C.plaster} stroke={C.brownInk} strokeWidth={3} />
                      <path d="M -24 -14 L 0 -32 L 24 -14 Z" fill={C.roof} stroke={C.brownInk} strokeWidth={3} />
                    </g>
                  ))}
                  <g transform={`translate(${-80 + Math.sin(f / 8) * 8} 20)`}>
                    <path d="M -26 0 Q 0 14 26 0 Z" fill={C.woodMid} stroke={C.brownInk} strokeWidth={3} />
                    <line x1={0} y1={0} x2={0} y2={-40} stroke={C.brownInk} strokeWidth={3} />
                    <path d="M 2 -38 Q 24 -22 2 -6 Z" fill={KRP.white} stroke={C.brownInk} strokeWidth={3} />
                  </g>
                  {[[70, -80], [-90, -90], [100, 100]].map(([hx, hy], i) => (
                    <rect key={i} x={hx} y={hy} width={34} height={28} fill={C.plaster} stroke={C.brownInk} strokeWidth={3} />
                  ))}
                </g>
                <text x={0} y={-112} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.brownInk}>テムズ川</text>
              </g>
            </g>
          )}
        </g>
      </g>
      <TagPlate x={1130} y={250} text="イギリス" size={56} t={seg(f, 30, 38)} fill={C.parchment} />
    </Frame>
  );
};

// ---- 文#101 【山】 1395年、ある貴族の女性が、遺言書を残しました。
// 設計: 中世の貴族の館の書斎。白い頭巾・深緑のドレスの女性が、羽ペンで羊皮紙の遺言書に署名する。封蝋 (赤) が f でぽん。暖炉・タペストリー。札「1395年」
// どこ: 1395年イギリス、貴族の館の書斎 (石の壁・左に木と鳥のタペストリー・右に燃える暖炉と飾り棚・細長い窓・床に敷いたイグサ)
// 演出: 白い頭巾・深緑のドレスの貴族の女性が、高い背もたれの椅子に座り、傾斜した書見台の羊皮紙の遺言書に羽ペンで署名する。
//       署名が書き上がると、赤い封蝋がぽんと押され、リボンが下がる。札「1395年」
// 動き: カメラが書見台へゆっくり寄る / f6〜26 署名の線がのびる (羽ペンが動く) / f28〜34 封蝋がぽん (印の跡) / 暖炉の炎とろうそくがゆれる / 札 f4〜12
const Yw101: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.07 * easeInOut(seg(f, 0, 42));
  const sign = seg(f, 6, 26);
  const seal = pop(seg(f, 28, 34));
  const LX = 840, LY = 770, LS = 1.3;
  const sig = (t: number) => ({ x: 1010 + t * 160, y: 640 + Math.sin(t * 22) * 12 - t * 10 });
  const pen = sig(sign);
  const sh = { x: LX + 67 * LS, y: LY - 148 * LS };
  const armLen = Math.hypot(pen.x - sh.x, pen.y - sh.y);
  const armAng = (Math.atan2(pen.y - sh.y, pen.x - sh.x) * 180) / Math.PI;
  const fl = Math.sin(f / 2.5);
  return (
    <Frame f={f} seed={3101} bg={C.cell}>
      <g transform={camT(980, 560, z)}>
        {/* 石の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.cell} />
        <L2cBricks x0={-100} y0={-40} cols={12} rows={10} bw={180} bh={96} stroke={C.cellDark} />
        {/* タペストリー (木と鳥) */}
        <g transform={`rotate(${Math.sin(f / 16) * 0.6} 320 90)`}>
          <rect x={300} y={80} width={40} height={24} fill={C.woodDeep} />
          <rect x={110} y={96} width={420} height={560} fill={C.tapestry} stroke={KRP.ink} strokeWidth={7} />
          <rect x={136} y={122} width={368} height={508} fill="none" stroke={C.illumGold} strokeWidth={6} />
          <rect x={150} y={136} width={340} height={480} fill={C.tapestryDark} opacity={0.5} />
          <rect x={300} y={360} width={40} height={220} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={320} cy={320} r={120} fill={C.glass4} stroke={KRP.ink} strokeWidth={6} />
          {[[270, 280], [370, 300], [320, 360], [260, 360], [380, 250]].map(([ax, ay], i) => (
            <circle key={i} cx={ax} cy={ay} r={12} fill={C.illumGold} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {[[200, 520, 1], [440, 520, -1]].map(([bx, by, d], i) => (
            <g key={i} transform={`translate(${bx} ${by}) scale(${d} 1)`}>
              <ellipse cx={0} cy={0} rx={34} ry={22} fill={C.wimple} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={26} cy={-18} r={14} fill={C.wimple} stroke={KRP.ink} strokeWidth={4} />
              <path d="M 38 -18 l 12 4 l -12 4 Z" fill={C.illumGold} stroke={KRP.ink} strokeWidth={2} />
            </g>
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={124 + i * 30} y1={656} x2={124 + i * 30 + Math.sin(f / 8 + i) * 3} y2={684} stroke={C.illumGold} strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
        {/* 細長い窓 */}
        <path d="M 1180 420 L 1180 180 Q 1220 120 1260 180 L 1260 420 Z" fill={C.sky} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1220} y1={150} x2={1220} y2={420} stroke={KRP.ink} strokeWidth={6} />
        {/* 暖炉 */}
        <g>
          <rect x={1420} y={300} width={420} height={60} fill={C.hearth} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1460} y={360} width={340} height={480} fill={C.hearth} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 1510 840 L 1510 500 Q 1630 420 1750 500 L 1750 840 Z" fill={C.hearthDark} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={1630} cy={720} rx={140 + fl * 10} ry={110} fill={C.flame} opacity={0.22} />
          {[[1580, 1], [1630, 1.3], [1690, 0.9]].map(([fx, k], i) => (
            <path key={i} d={`M ${fx - 40 * k} 800 Q ${fx - 50 * k} ${720 - 30 * k} ${fx + Math.sin(f / 2 + i) * 12} ${650 - 60 * k} Q ${fx + 50 * k} ${720 - 30 * k} ${fx + 40 * k} 800 Z`}
              fill={i === 1 ? C.flame : C.ember} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <ellipse cx={1630} cy={770} rx={30} ry={40} fill={C.flameCore} opacity={0.8} />
          <rect x={1540} y={790} width={180} height={30} rx={14} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} transform="rotate(-6 1630 805)" />
          {/* 飾り棚の上の銀の杯と燭台 */}
          <path d="M 1500 300 L 1510 250 L 1540 250 L 1550 300 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <L2cCandle x={1760} y={300} s={0.7} f={f} h={80} />
        </g>
        {/* 床 (イグサ) */}
        <rect x={-60} y={830} width={W + 120} height={300} fill={C.straw} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={i * 66 + rnd(980, i) * 20} y1={850 + rnd(981, i) * 40} x2={i * 66 + 40 + rnd(982, i) * 20} y2={846 + rnd(983, i) * 50} stroke={C.strawDark} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* 高い背もたれの椅子 */}
        <rect x={LX - 120} y={330} width={240} height={420} rx={14} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        <rect x={LX - 90} y={360} width={180} height={300} rx={10} fill={C.tapestry} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${LX - 130} 340 Q ${LX} 270 ${LX + 130} 340`} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        {/* 貴族の女性 (頭巾とドレス) */}
        <L2cFig x={LX} y={LY} s={LS} f={f} phase={2} lean={3}
          back={<path d="M -76 -250 Q -100 -120 -96 -40 L 96 -40 Q 100 -120 76 -250 Z" fill={C.wimple} stroke={KRP.ink} strokeWidth={4.5} />}
          p={{ face: "smile", cloth: C.dress, clothDark: C.dressDark, hair: "none", gaze: [9, 6] }}>
          {/* 頭巾 (顔のまわりだけ開く) */}
          <path fillRule="evenodd" d="M -78 -230 Q -80 -306 0 -308 Q 80 -306 78 -230 Q 76 -160 40 -146 L -40 -146 Q -76 -160 -78 -230 Z M -50 -222 Q -50 -272 0 -274 Q 50 -272 50 -222 Q 50 -176 0 -170 Q -50 -176 -50 -222 Z"
            fill={C.wimple} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -60 -150 Q 0 -128 60 -150" fill="none" stroke={C.featherShade} strokeWidth={4} />
          {/* 胸元の金の縁と首飾り */}
          <path d="M -50 -158 Q 0 -120 50 -158" fill="none" stroke={C.illumGold} strokeWidth={6} />
          <circle cx={0} cy={-132} r={8} fill={C.illumRed} stroke={KRP.ink} strokeWidth={3} />
        </L2cFig>
        {/* 机と傾斜した書見台 */}
        <rect x={560} y={660} width={820} height={180} fill={C.woodMid} stroke={KRP.ink} strokeWidth={7} />
        <rect x={540} y={640} width={860} height={30} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        {[640, 1300].map((x) => <rect key={x} x={x - 20} y={700} width={40} height={130} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />)}
        <path d="M 880 560 L 1260 560 L 1320 650 L 840 650 Z" fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 遺言書 (羊皮紙) */}
        <path d="M 900 568 L 1240 568 L 1290 646 L 864 646 Z" fill={C.parchment} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <g stroke={C.brownInk} strokeWidth={3.5} strokeLinecap="round" opacity={0.45}>
          {[582, 596, 610, 624].map((y, i) => <line key={y} x1={912 - i * 6} y1={y} x2={1220 + i * 8} y2={y} strokeDasharray="20 6 30 6 12 6" />)}
        </g>
        {/* 署名の線 (のびる) */}
        <path d={Array.from({ length: 24 }, (_, i) => { const p = sig((sign * i) / 23); return `${i ? "L" : "M"} ${p.x} ${p.y}`; }).join(" ")}
          fill="none" stroke={C.brownInk} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* 垂れ下がる長い袖 (この時代のドレスの袖) */}
        <path d={`M ${sh.x - 20} ${sh.y - 4} Q ${sh.x + 30} ${sh.y} ${sh.x + 40} ${sh.y + 70} L ${sh.x + 30} 642 L ${sh.x - 34} 642 Q ${sh.x - 30} ${sh.y + 40} ${sh.x - 20} ${sh.y - 4} Z`}
          fill={C.dress} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M ${sh.x + 30} 636 L ${sh.x - 34} 636`} stroke={C.illumGold} strokeWidth={6} />
        {/* 右腕と羽ペン */}
        <g transform={`translate(${sh.x} ${sh.y}) rotate(${armAng})`}>
          <rect x={-12} y={-15} width={armLen + 12} height={30} rx={15} fill={C.dress} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={armLen - 40} y={-17} width={18} height={34} rx={6} fill={C.illumGold} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <circle cx={pen.x - 6} cy={pen.y - 10} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(${pen.x} ${pen.y}) rotate(${-30 + Math.sin(f / 1.5) * 4 * (sign < 1 ? 1 : 0)})`}>
          <path d="M 0 0 Q -14 -70 10 -150 Q 26 -70 0 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={0} x2={9} y2={-140} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        {/* インク壺とろうそく (机の上) */}
        <path d="M 1340 640 Q 1336 604 1360 600 Q 1384 604 1380 640 Z" fill={C.brownInk} stroke={KRP.ink} strokeWidth={4} />
        <L2cCandle x={620} y={640} s={0.8} f={f} h={100} />
        {/* 封蝋 (ぽん) とリボン */}
        {seal > 0 && (
          <g transform={`translate(1236 628) scale(${seal})`}>
            <path d={`M -10 10 L -26 ${70 + Math.sin(f / 6) * 4} L -8 62 M 10 10 L 22 ${74 + Math.sin(f / 6 + 1) * 4} L 6 64`} stroke={C.wax} strokeWidth={10} strokeLinecap="round" fill="none" />
            <path d="M -30 0 Q -34 -22 -18 -30 Q 0 -40 18 -30 Q 36 -20 30 2 Q 20 22 0 22 Q -24 22 -30 0 Z" fill={C.wax} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={0} cy={-4} r={16} fill="none" stroke={C.waxDark} strokeWidth={4} />
            <path d="M -8 -4 L 0 -14 L 8 -4 L 0 6 Z" fill={C.waxDark} />
          </g>
        )}
        {seal > 0 && seg(f, 28, 34) < 1 && [0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + 0.6;
          return <line key={i} x1={1236 + Math.cos(a) * 40} y1={624 + Math.sin(a) * 30} x2={1236 + Math.cos(a) * 64} y2={624 + Math.sin(a) * 48} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />;
        })}
      </g>
      <TagPlate x={960} y={140} text="1395年" size={58} t={seg(f, 4, 12)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_092: (f) => <Yw092 f={f} />,
  yw_093: (f) => <Yw093 f={f} />,
  yw_094: (f) => <Yw094 f={f} />,
  yw_095: (f) => <Yw095 f={f} />,
  yw_096: (f) => <Yw096 f={f} />,
  yw_097: (f) => <Yw097 f={f} />,
  yw_098: (f) => <Yw098 f={f} />,
  yw_099: (f) => <Yw099 f={f} />,
  yw_100: (f) => <Yw100 f={f} />,
  yw_101: (f) => <Yw101 f={f} />,
};

export const YW_D3_MOTIFS: string[] = [
  "yw_092",
  "yw_093",
  "yw_094",
  "yw_095",
  "yw_096",
  "yw_097",
  "yw_098",
  "yw_099",
  "yw_100",
  "yw_101",
];

export const yawaD3Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
