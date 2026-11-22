// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#102〜#110 (9文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L2d。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//
// 人物の見た目は YawaD3 (#98 フランチェスコ / #101 1395年の貴族の女性) から写してそろえている。

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
  // フランチェスコ (YawaD3 とそろえる)
  habit: "#8A6A48", habitDark: "#6B5036", rope: "#F4EFE2", friarHair: "#4A3626",
  feather: "#FBF7EE", featherShade: "#DDD3BE",
  straw: "#C9AE6A", strawDark: "#A88E4E",
  woodMid: "#7E5532", woodDeep: "#5B3B24", woodLight: "#A07048", iron: "#4A4A52",
  flame: "#F4B942", flameCore: "#FFF0B8", togaShade: "#CFC4AC",
  // 石の壁 (館・修道院)
  cell: "#C9BBA2", cellDark: "#A8987E", cellLight: "#E3D6BC",
  // 町
  assisi: "#EAD3C0", assisiDark: "#CDB29C", roof: "#C8714A", roofDark: "#9E5434",
  path: "#D9C7A2", pathDark: "#BFA97E", sky: "#CFE3EC", skyLow: "#F3E6CC",
  cypress: "#3F5A3A", cypressDark: "#2C4029",
  // 羊皮紙と写本の色
  parchment: "#EBDBB0", parchDark: "#CDB98A", brownInk: "#4A2E1C", illumRed: "#B8382C",
  illumBlue: "#2F5C9A", illumGold: "#D4A93A", linen: "#C8B48A", linenDark: "#A8946A",
  halo: "#F2C94C", haloCore: "#FFF3C4",
  // 町の寝室
  plaster: "#EFE3C8", plasterDark: "#D8C8A6", timber: "#5B3B24", quilt: "#E8D7B4", quiltDark: "#CDB78E",
  quiltRed: "#C0574A", quiltBlue: "#5E7F9C", duskHigh: "#9AA9C8", nightSky: "#2E3656",
  kid: "#C9605A", kidDark: "#A3463F", mom: "#6F8F5A", momDark: "#56723F", dad: "#5E7F8C", dadDark: "#46636E",
  // 1395年の貴族の女性 (YawaD3 #101 と同じ)
  dress: "#3F6B4A", dressDark: "#2C4F36", wimple: "#FAF7F0", tapestry: "#8E3B3B", tapestryDark: "#6A2A2C",
  hearth: "#8C8478", hearthDark: "#615A50", ember: "#E8743A", wax: "#C0392B", waxDark: "#8E2A20",
  // 羽毛ベッドの布 (麻の生地と縞)
  tick: "#EFE6D2", tickShade: "#D6C9AC", tickStripe: "#8FA3B8",
  // 宝物
  gold: "#E6B93C", goldDark: "#B48A22", goldLight: "#FBE7A0", silverDark: "#9AA3AA", velvet: "#6A2D4E",
  // 路地裏 (夜)
  alley: "#2A2530", alleyWall: "#463E4C", alleyWallDark: "#352F3B", alleyFloor: "#3A3238",
  moonBeam: "#DCE6F2", rag: "#8C8274", ragDark: "#6B6256", hoodDark: "#3E3A44", hoodDarkDeep: "#2C2932",
  catEye: "#E8E070",
  // ギルドホール
  alderman: "#9E2B2B", aldermanDark: "#7A1F20", ermine: "#F6F2EA", banner: "#F8F4EC",
  tunicOchre: "#B58A3E", tunicOchreDark: "#8E6A2C", tunicGrey: "#7C8790", tunicGreyDark: "#5E6870",
  // 広場の人々
  tA: "#7A9A6A", tADark: "#5E7C50", tB: "#B5664A", tBDark: "#8E4C36", tC: "#6A78A0", tCDark: "#4F5C80",
  awning1: "#C0574A", awning2: "#F4EFE2",
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

type PersonP = React.ComponentProps<typeof Person>;

// Person を包む (YawaD3 の L2cFig と同じ)。back = 体の後ろ / children = 体の前
const L2dFig: React.FC<{
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

// 頭頂を剃った形 (髪の輪 + 剃った頭頂)。YawaD3 L2cTonsure と同じ
const L2dTonsure: React.FC<{ hair?: string }> = ({ hair = KRP.ink }) => (
  <g>
    <path d="M -62 -238 Q -66 -292 0 -295 Q 66 -292 62 -238 Q 50 -258 30 -262 L -30 -262 Q -50 -258 -62 -238 Z" fill={hair} />
    <ellipse cx={0} cy={-276} rx={40} ry={17} fill={KRP.white} />
    <path d="M -42 -284 Q 0 -298 42 -284" fill="none" stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// 修道服の上乗せ (すそ・つぎあて・縄の帯の結び目3つ・裸足)。YawaD3 L2cHabitBits と同じ
const L2dHabitBits: React.FC<{ f: number; patch?: boolean; bare?: boolean; step?: number }> = ({ f, patch = true, bare = true, step = 0 }) => {
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
      {bare && [-1, 1].map((d) => {
        // step: 歩くときに足先を交互に少し上げる
        const lift = step ? Math.max(0, Math.sin(step + (d > 0 ? Math.PI : 0))) * 8 : 0;
        return (
          <g key={d} transform={`translate(0 ${-lift})`}>
            <ellipse cx={d * 18} cy={-4} rx={20} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((t) => <line key={t} x1={d * 18 + d * (6 + t * 5)} y1={-10} x2={d * 18 + d * (6 + t * 5)} y2={-4} stroke={KRP.ink} strokeWidth={2} />)}
          </g>
        );
      })}
    </g>
  );
};

// フランチェスコ (YawaD3 #98 と同じ姿: 茶の修道服・つぎはぎ・縄の帯・フード・裸足・剃髪)
const L2dFrancis: React.FC<{
  x: number; y: number; s: number; f: number; face?: PersonP["face"]; pose?: PersonP["pose"];
  pointDir?: 1 | -1; gaze?: [number, number]; lean?: number; phase?: number; step?: number; extra?: React.ReactNode;
}> = ({ x, y, s, f, face = "smile", pose = "stand", pointDir = 1, gaze = [0, 0], lean = 0, phase = 3, step = 0, extra }) => (
  <L2dFig x={x} y={y} s={s} f={f} phase={phase} lean={lean}
    back={<ellipse cx={0} cy={-158} rx={76} ry={30} fill={C.habitDark} stroke={KRP.ink} strokeWidth={4.5} />}
    p={{ face, cloth: C.habit, clothDark: C.habitDark, hair: "none", pose, pointDir, gaze }}>
    <L2dTonsure hair={C.friarHair} />
    <L2dHabitBits f={f} step={step} />
    {extra}
  </L2dFig>
);

// 1395年の貴族の女性 (YawaD3 #101 と同じ: 白い頭巾・深緑のドレス・垂れた中世の袖)
const L2dLady: React.FC<{
  x: number; y: number; s: number; f: number; face?: PersonP["face"]; pose?: PersonP["pose"];
  pointDir?: 1 | -1; gaze?: [number, number]; lean?: number; phase?: number;
}> = ({ x, y, s, f, face = "smile", pose = "stand", pointDir = 1, gaze = [0, 0], lean = 0, phase = 2 }) => {
  const sw = Math.sin(f / 9) * 3;
  // 垂れ袖: 指さす側は横にのびた腕から垂れる / 反対側は肩から垂れる
  const sleeve = (d: 1 | -1) => {
    const onArm = pose === "point" && d === pointDir;
    return onArm ? (
      <path key={d} d={`M ${d * 96} -160 Q ${d * 120} -150 ${d * (128 + sw)} -96 L ${d * (124 + sw)} -40 L ${d * (98 + sw)} -46 Q ${d * 92} -110 ${d * 90} -138 Z`}
        fill={C.dress} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    ) : (
      <path key={d} d={`M ${d * 58} -150 Q ${d * 94} -146 ${d * (98 + sw)} -96 L ${d * (96 + sw)} -24 L ${d * (72 + sw)} -30 Q ${d * 70} -100 ${d * 64} -132 Z`}
        fill={C.dress} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    );
  };
  return (
    <L2dFig x={x} y={y} s={s} f={f} phase={phase} lean={lean}
      back={<path d="M -76 -250 Q -100 -120 -96 -40 L 96 -40 Q 100 -120 76 -250 Z" fill={C.wimple} stroke={KRP.ink} strokeWidth={4.5} />}
      p={{ face, cloth: C.dress, clothDark: C.dressDark, hair: "none", gaze, pose, pointDir }}>
      {/* 長いドレスのすそ (足元まで) */}
      <path d="M -60 -70 Q -78 -30 -84 -2 L 84 -2 Q 78 -30 60 -70 Z" fill={C.dress} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M -30 -60 L -40 -6 M 30 -60 L 40 -6" stroke={C.dressDark} strokeWidth={3.5} />
      <path d="M -84 -10 L 84 -10" stroke={C.illumGold} strokeWidth={5} />
      {/* 頭巾 (顔のまわりだけ開く) */}
      <path fillRule="evenodd" d="M -78 -230 Q -80 -306 0 -308 Q 80 -306 78 -230 Q 76 -160 40 -146 L -40 -146 Q -76 -160 -78 -230 Z M -50 -222 Q -50 -272 0 -274 Q 50 -272 50 -222 Q 50 -176 0 -170 Q -50 -176 -50 -222 Z"
        fill={C.wimple} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -60 -150 Q 0 -128 60 -150" fill="none" stroke={C.featherShade} strokeWidth={4} />
      {/* 胸元の金の縁と首飾り */}
      <path d="M -50 -158 Q 0 -120 50 -158" fill="none" stroke={C.illumGold} strokeWidth={6} />
      <circle cx={0} cy={-132} r={8} fill={C.illumRed} stroke={KRP.ink} strokeWidth={3} />
      {sleeve(-1)}{sleeve(1)}
      <path d={pose === "point" ? `M ${pointDir * 98} -48 L ${pointDir * (124 + sw)} -42` : `M -72 -30 L ${-96 - sw} -26 M 72 -30 L ${96 + sw} -26`} stroke={C.illumGold} strokeWidth={5} />
    </L2dFig>
  );
};

// 町の人のフード (シャペロン)。Person s=1 足元原点の上に重ねる
const L2dHood: React.FC<{ col: string; dark: string; tail?: 1 | -1 }> = ({ col, dark, tail = -1 }) => (
  <g>
    <path d={`M ${tail * 40} -298 Q ${tail * 92} -296 ${tail * 96} -250 L ${tail * 100} -150`} fill="none" stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
    <path d={`M ${tail * 40} -298 Q ${tail * 92} -296 ${tail * 96} -250 L ${tail * 100} -150`} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" />
    <path fillRule="evenodd" d="M -76 -214 Q -84 -306 0 -308 Q 84 -306 76 -214 L 92 -150 Q 0 -126 -92 -150 Z M -50 -222 Q -50 -276 0 -278 Q 50 -276 50 -222 Q 50 -172 0 -166 Q -50 -172 -50 -222 Z"
      fill={col} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M -86 -158 Q 0 -138 86 -158" fill="none" stroke={dark} strokeWidth={5} />
  </g>
);

// 女の人の白い布の帽子 (コイフ)
const L2dCoif: React.FC = () => (
  <g>
    <path d="M -68 -232 Q -72 -302 0 -304 Q 72 -302 68 -232 Q 44 -262 0 -264 Q -44 -262 -68 -232 Z" fill={C.wimple} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -66 -236 Q -70 -200 -62 -184 M 66 -236 Q 70 -200 62 -184" stroke={KRP.ink} strokeWidth={3} fill="none" />
  </g>
);

// 石積みの壁 (目地)
const L2dBricks: React.FC<{ x0: number; y0: number; cols: number; rows: number; bw: number; bh: number; stroke: string; sw?: number }> = ({
  x0, y0, cols, rows, bw, bh, stroke, sw = 5,
}) => (
  <g fill="none" stroke={stroke} strokeWidth={sw}>
    {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (
      <rect key={`${r}-${c}`} x={x0 + c * bw + (r % 2) * (bw / 2)} y={y0 + r * bh} width={bw - 6} height={bh - 6} rx={6} />
    )))}
  </g>
);

// ろうそく (燭台つき)。out = 0〜1 で炎が消える (煙が立つ)
const L2dCandle: React.FC<{ x: number; y: number; s?: number; f: number; h?: number; out?: number }> = ({ x, y, s = 1, f, h = 90, out = 0 }) => {
  const fl = 1 + Math.sin(f / 2.3) * 0.12;
  const lv = 1 - clamp01(out);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-h - 26} r={70} fill={C.flame} opacity={(0.18 + Math.sin(f / 3) * 0.04) * lv} />
      <ellipse cx={0} cy={0} rx={40} ry={10} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-14} y={-h} width={28} height={h} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M -14 ${-h + 6} q 6 14 0 24`} fill="none" stroke={C.togaShade} strokeWidth={4} />
      <line x1={0} y1={-h} x2={0} y2={-h - 10} stroke={KRP.ink} strokeWidth={3} />
      {lv > 0.02 && (
        <g transform={`translate(0 ${-h - 4}) scale(${lv}) translate(0 ${h + 4})`}>
          <path d={`M 0 ${-h - 4} Q ${-12 * fl} ${-h - 24} 0 ${-h - 50 * fl} Q ${12 * fl} ${-h - 24} 0 ${-h - 4} Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={0} cy={-h - 18} rx={4} ry={9} fill={C.flameCore} />
        </g>
      )}
      {out > 0.05 && (
        <path d={`M 0 ${-h - 10} q -14 -20 0 -40 q 14 -20 0 -40 q -12 -18 ${Math.sin(f / 4) * 6} -36`} fill="none"
          stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.6 * clamp01(out * 2) * (1 - clamp01((out - 0.6) * 1.5)) + 0.15} />
      )}
    </g>
  );
};

// ふわふわ舞う羽 (1枚)
const L2dFeather: React.FC<{ x: number; y: number; s?: number; r?: number; o?: number }> = ({ x, y, s = 1, r = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <path d="M 0 22 Q -14 0 0 -26 Q 14 0 0 22 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    <line x1={0} y1={26} x2={0} y2={-22} stroke={KRP.ink} strokeWidth={2} />
  </g>
);

// きらり (4方向の光)
const L2dSpark: React.FC<{ x: number; y: number; k: number; col?: string }> = ({ x, y, k, col = C.goldLight }) => (
  k <= 0.02 ? null : (
    <path d={`M ${x} ${y - k} L ${x + k * 0.22} ${y - k * 0.22} L ${x + k} ${y} L ${x + k * 0.22} ${y + k * 0.22} L ${x} ${y + k} L ${x - k * 0.22} ${y + k * 0.22} L ${x - k} ${y} L ${x - k * 0.22} ${y - k * 0.22} Z`}
      fill={col} stroke={KRP.ink} strokeWidth={2.5} strokeLinejoin="round" />
  )
);

// 中世の羽毛ベッド (麻の生地に縞・ふっくら・房どめ)。x,y = 底の中心 / w,h = 大きさ
const L2dFeatherBed: React.FC<{ x: number; y: number; w: number; h: number; f: number; phase?: number; fill?: string; tufts?: boolean }> = ({
  x, y, w, h, f, phase = 0, fill = C.tick, tufts = true,
}) => {
  const b = Math.sin((f + phase * 13) / 10) * 3;
  const L = -w / 2, R = w / 2, T = -h;
  const d = `M ${L + 18} 0 Q ${L - 10} 0 ${L - 8} ${-h * 0.5} Q ${L - 6} ${T - 4 - b} ${L + 30} ${T + 2}
    Q ${-w * 0.25} ${T - 18 - b} 0 ${T - 8} Q ${w * 0.25} ${T - 18 - b} ${R - 30} ${T + 2}
    Q ${R + 6} ${T - 4 - b} ${R + 8} ${-h * 0.5} Q ${R + 10} 0 ${R - 18} 0 Q 0 8 ${L + 18} 0 Z`;
  const n = Math.max(3, Math.floor(w / 36));
  const nt = Math.max(2, Math.floor(w / 120));
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={4} rx={w * 0.54} ry={12} fill={KRP.ink} opacity={0.16} />
      <path d={d} fill={fill} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 縞 */}
      {Array.from({ length: n }, (_, i) => {
        const sx = L + 28 + (i * (w - 56)) / (n - 1);
        const top = T + 14 + (Math.abs(Math.abs(sx) - w * 0.25) / w) * 14;
        return <line key={i} x1={sx} y1={top} x2={sx} y2={-10} stroke={C.tickStripe} strokeWidth={i % 3 === 0 ? 6 : 3} opacity={0.5} />;
      })}
      {/* 横の縫い目 (パイピング) */}
      <path d={`M ${L + 2} ${-h * 0.42} Q 0 ${-h * 0.42 + 8} ${R - 2} ${-h * 0.42}`} fill="none" stroke={C.tickShade} strokeWidth={5} strokeDasharray="12 9" />
      {/* 房どめ */}
      {tufts && Array.from({ length: nt }, (_, i) => {
        const tx = L + (w * (i + 1)) / (nt + 1);
        const ty = -h * 0.66;
        return (
          <g key={i}>
            <ellipse cx={tx} cy={ty + 4} rx={16} ry={7} fill={C.tickShade} opacity={0.8} />
            <circle cx={tx} cy={ty} r={6} fill={C.illumRed} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        );
      })}
      {/* つやと、すみの耳 */}
      <path d={`M ${L + 30} ${T + 16} Q ${-w * 0.25} ${T - 2 - b} ${-w * 0.06} ${T + 8}`} fill="none" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
      <path d={`M ${L + 4} ${T + 12} l -18 -10 l 8 18 Z M ${R - 4} ${T + 12} l 18 -10 l -8 18 Z`} fill={fill} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

// 丸めた羽毛ベッド (筒形・端がうず巻き・ひもで2か所しばる)。x,y = 中心
const L2dRolledBed: React.FC<{ x: number; y: number; w: number; r: number; f: number }> = ({ x, y, w, r, f }) => {
  const e = r * 0.34;
  const b = Math.sin(f / 11) * 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={r + 6} rx={w * 0.55} ry={14} fill={KRP.ink} opacity={0.2} />
      <path d={`M ${-w / 2} ${-r - b} L ${w / 2} ${-r - b} L ${w / 2} ${r} L ${-w / 2} ${r} A ${e} ${r + b / 2} 0 0 1 ${-w / 2} ${-r - b} Z`}
        fill={C.tick} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 縞 (長い方向) */}
      {Array.from({ length: 7 }, (_, i) => {
        const yy = -r + ((i + 1) * 2 * r) / 8;
        return <line key={i} x1={-w / 2 + 6} y1={yy} x2={w / 2 - 6} y2={yy} stroke={C.tickStripe} strokeWidth={i % 3 === 1 ? 6 : 3} opacity={0.5} />;
      })}
      {/* 下側の影 */}
      <path d={`M ${-w / 2 + 4} ${r * 0.55} L ${w / 2} ${r * 0.55} L ${w / 2} ${r - 4} L ${-w / 2 + 4} ${r - 4} Z`} fill={C.tickShade} opacity={0.6} />
      {/* つや */}
      <path d={`M ${-w / 2 + 30} ${-r * 0.7} L ${w / 2 - 60} ${-r * 0.7}`} stroke={KRP.white} strokeWidth={9} strokeLinecap="round" opacity={0.8} />
      {/* 右端 (うず巻き) */}
      <ellipse cx={w / 2} cy={-b / 2} rx={e} ry={r + b / 2} fill={C.tickShade} stroke={KRP.ink} strokeWidth={6} />
      {[0.78, 0.56, 0.34, 0.14].map((k, i) => (
        <ellipse key={k} cx={w / 2 + (i % 2 ? -3 : 3) * k * 4} cy={-b / 2 + (i % 2 ? 4 : -4) * k} rx={e * k} ry={r * k}
          fill="none" stroke={i % 2 ? KRP.ink : C.featherShade} strokeWidth={i % 2 ? 3.5 : 7} />
      ))}
      {/* ひも */}
      {[-0.28, 0.28].map((k) => (
        <g key={k}>
          <path d={`M ${w * k} ${-r - 6 - b} Q ${w * k + 10} 0 ${w * k} ${r + 6}`} fill="none" stroke={KRP.ink} strokeWidth={14} />
          <path d={`M ${w * k} ${-r - 6 - b} Q ${w * k + 10} 0 ${w * k} ${r + 6}`} fill="none" stroke={C.illumRed} strokeWidth={8} />
        </g>
      ))}
    </g>
  );
};

// 羽毛のふっくら枕 (首の下に当てる物)。x,y = 底の中心
const L2dPillow: React.FC<{ x: number; y: number; w: number; h: number; f: number; fill?: string }> = ({ x, y, w, h, f, fill = C.feather }) => {
  const b = Math.sin(f / 9) * 3;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-w / 2 + 10} 0 Q ${-w / 2 - 30} ${-h / 2} ${-w / 2 + 10} ${-h} Q 0 ${-h - 30 - b} ${w / 2 - 10} ${-h} Q ${w / 2 + 30} ${-h / 2} ${w / 2 - 10} 0 Q 0 16 ${-w / 2 + 10} 0 Z`}
        fill={fill} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${-w * 0.34} ${-h * 0.25} Q 0 ${-h * 0.1} ${w * 0.34} ${-h * 0.25}`} fill="none" stroke={C.featherShade} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${-w * 0.3} ${-h * 0.8} Q ${-w * 0.12} ${-h * 0.92 - b} ${w * 0.05} ${-h * 0.86}`} fill="none" stroke={KRP.white} strokeWidth={8} strokeLinecap="round" />
      {[-1, 1].map((d) => <path key={d} d={`M ${d * (w / 2 - 10)} ${-h} l ${d * 22} -12 l ${-d * 6} 22 Z M ${d * (w / 2 - 10)} 0 l ${d * 22} 12 l ${-d * 6} -22 Z`} fill={fill} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />)}
    </g>
  );
};

// 汗のしずく
const L2dSweat: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  t <= 0.01 ? null : (
    <g transform={`translate(${x} ${y + t * 16}) scale(${s * pop(clamp01(t * 2))})`} opacity={1 - clamp01((t - 0.8) * 5) * 0.5}>
      <path d="M 0 -26 Q 16 0 12 10 Q 0 22 -12 10 Q -16 0 0 -26 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
      <path d="M -4 0 Q -6 8 -2 10" fill="none" stroke={KRP.white} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
);

// 怒りのマーク
const L2dAnger: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  t <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * pop(clamp01(t))})`} stroke={KRP.red} strokeWidth={7} strokeLinecap="round" fill="none">
      <path d="M -24 -8 Q -8 -8 -8 -24 M 8 -24 Q 8 -8 24 -8 M 24 8 Q 8 8 8 24 M -8 24 Q -8 8 -24 8" />
    </g>
  )
);

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#102 【山】 いちばん良い羽毛のベッドは、この子に。二番目は、あの子に。三番目は、その子に。
// 設計: ★笑い。館の寝室に、羽毛の敷きぶとんが3つ並ぶ (大・中・小。それぞれに札「1」「2」「3」)。子ども3人 (大人の兄弟姉妹) がそれぞれの前に立ち、1番の子は大喜び (joy)、3番の子は少し不満そう (worried)。母が指さして割り振る
// どこ: #101 と同じ館の、石壁の寝室。天井の梁・タペストリー・細長い窓・家紋の盾・床のイグサ
// 演出: 左端に #101 の母 (白い頭巾・深緑のドレス) が立って右を指さす。手前に羽毛ベッドが大・中・小と3つ並び、
//       それぞれの後ろに大人の子ども3人。札「1」「2」「3」が順にぽん・ぽん・ぽんと乗る。
//       1番の長男はばんざいで跳び、ベッドから羽根が舞う。2番の娘はにっこり。3番の末っ子はぺらぺらの薄いベッドの前で、長男のベッドを横目に汗
// 動き: カメラがゆっくり右へパンしつつ寄る / 札 f6〜12・f16〜22・f26〜32 / 長男が f8〜 跳ぶ / 羽根 f10〜 舞う / 末っ子の汗 f30〜 / 母の視線が順に右へ
const Yw102: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const z = 1.0 + 0.05 * cam;
  const dx = lerp(30, -30, cam);
  const t1 = seg(f, 6, 12), t2 = seg(f, 16, 22), t3 = seg(f, 26, 32);
  const hop = f > 8 ? Math.abs(Math.sin((f - 8) / 4.2)) * 26 : 0;
  const fly = seg(f, 10, 42);
  const sweat = seg(f, 30, 42);
  const momGaze: [number, number] = [lerp(4, 10, seg(f, 6, 30)), 3];
  const ring = (t: number) => t > 0 && t < 1 ? t : 0;
  return (
    <Frame f={f} seed={3102} bg={C.cell}>
      <g transform={camT(960, 760, z, dx, 0)}>
        {/* 石の壁 */}
        <rect x={-80} y={-60} width={W + 160} height={H + 120} fill={C.cell} />
        <L2dBricks x0={-120} y0={60} cols={13} rows={6} bw={180} bh={96} stroke={C.cellDark} />
        {/* 天井の梁 */}
        <rect x={-80} y={-40} width={W + 160} height={100} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={-40 + i * 290} y={40} width={60} height={46} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${-40 + i * 290} 86 L ${-10 + i * 290} 120 L ${20 + i * 290} 86`} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 腰板 (木) */}
        <rect x={-80} y={600} width={W + 160} height={200} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={-60 + i * 150} y={618} width={124} height={160} rx={8} fill="none" stroke={C.woodDeep} strokeWidth={5} />
        ))}
        {/* タペストリー (森と鹿) */}
        <g transform={`rotate(${Math.sin(f / 16) * 0.6} 790 130)`}>
          <rect x={770} y={118} width={40} height={20} fill={C.woodDeep} />
          <rect x={560} y={136} width={460} height={340} fill={C.tapestry} stroke={KRP.ink} strokeWidth={7} />
          <rect x={582} y={158} width={416} height={296} fill="none" stroke={C.illumGold} strokeWidth={6} />
          {[[660, 300], [900, 290], [780, 270]].map(([tx, ty], i) => (
            <g key={i}>
              <rect x={tx - 10} y={ty} width={20} height={130} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={tx} cy={ty - 20} r={58} fill={i === 2 ? C.cypress : C.mom} stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
          <path d="M 820 420 q 10 -40 50 -40 q 30 0 40 -20 l 10 -30 m -10 30 l 20 -10 M 840 420 l 0 -20 M 890 420 l 0 -24" fill="none" stroke={C.illumGold} strokeWidth={6} strokeLinecap="round" />
          {Array.from({ length: 15 }, (_, i) => (
            <line key={i} x1={576 + i * 30} y1={476} x2={576 + i * 30 + Math.sin(f / 8 + i) * 3} y2={502} stroke={C.illumGold} strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
        {/* 細長い窓 */}
        <path d="M 1290 460 L 1290 190 Q 1340 120 1390 190 L 1390 460 Z" fill={C.sky} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 1300 400 Q 1330 360 1360 390 Q 1380 370 1386 400 L 1386 456 L 1300 456 Z" fill={C.cypress} opacity={0.8} />
        <line x1={1340} y1={160} x2={1340} y2={460} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1290} y1={320} x2={1390} y2={320} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1272} y={456} width={136} height={24} rx={4} fill={C.cellLight} stroke={KRP.ink} strokeWidth={5} />
        <L2dCandle x={1376} y={456} s={0.55} f={f} h={80} />
        {/* 家紋の盾 */}
        <g transform="translate(1660 240)">
          <path d="M -80 -90 L 80 -90 L 80 0 Q 80 80 0 120 Q -80 80 -80 0 Z" fill={C.dress} stroke={KRP.ink} strokeWidth={7} />
          <path d="M -80 -10 L 80 -10 L 80 30 L -80 30 Z" fill={C.illumGold} stroke={KRP.ink} strokeWidth={4} />
          {[-40, 0, 40].map((sx) => <circle key={sx} cx={sx} cy={-50} r={14} fill={C.illumGold} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        {/* 床 (板とイグサ) */}
        <rect x={-80} y={790} width={W + 160} height={340} fill={C.straw} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 34 }, (_, i) => (
          <line key={i} x1={-60 + i * 62 + rnd(102, i) * 20} y1={820 + rnd(103, i) * 60} x2={-20 + i * 62 + rnd(104, i) * 20} y2={814 + rnd(105, i) * 70}
            stroke={C.strawDark} strokeWidth={4} strokeLinecap="round" />
        ))}

        {/* 子ども3人 (大人の兄弟姉妹)。ベッドの後ろに立つ */}
        {/* 1番: 長男 (赤い上着) ばんざいで跳ぶ */}
        <L2dFig x={700} y={790 - hop} s={1.3} f={f} phase={1}
          p={{ face: t1 > 0.5 ? "joy" : "normal", cloth: C.kid, clothDark: C.kidDark, hair: "cap", pose: t1 > 0.5 ? "banzai" : "stand" }} />
        {/* 2番: 娘 (青いドレス・白い帽子) にっこり */}
        <L2dFig x={1180} y={800} s={1.25} f={f} phase={4} lean={-2}
          back={<path d="M 40 -240 Q 92 -200 84 -150 Q 80 -124 92 -100" fill="none" stroke={C.friarHair} strokeWidth={14} strokeLinecap="round" />}
          p={{ face: t2 > 0.5 ? "smile" : "normal", cloth: C.quiltBlue, clothDark: C.duskHigh, hair: "none", pose: "hold", gaze: [-3, 3] }}>
          <L2dCoif />
        </L2dFig>
        {/* 3番: 末っ子 (青緑の上着) 不満げに横目 */}
        <L2dFig x={1600} y={810} s={1.2} f={f} phase={6} lean={t3 > 0.5 ? -4 : 0}
          p={{ face: t3 > 0.5 ? "worried" : "normal", cloth: C.dad, clothDark: C.dadDark, hair: "cap", gaze: t3 > 0.5 ? [-10, 2] : [-4, 0], pose: t3 > 0.5 ? "armsFolded" : "stand" }} />
        <L2dSweat x={1690} y={500} s={1.1} t={sweat} />

        {/* ベッド3つ (低い木の台の上) */}
        {([[700, 520, 160, 0], [1180, 390, 112, 2], [1600, 270, 60, 4]] as const).map(([bx, bw, bh, ph], i) => (
          <g key={i}>
            <rect x={bx - bw / 2 - 16} y={806} width={bw + 32} height={40} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
            {[-1, 1].map((d) => <rect key={d} x={bx + d * (bw / 2) - 14} y={840} width={28} height={30} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />)}
            <L2dFeatherBed x={bx} y={810} w={bw} h={bh} f={f} phase={ph} tufts={i < 2} />
          </g>
        ))}
        {/* 3番のベッドは、ぺらぺら (中身がすくない) */}
        <path d="M 1500 790 q 20 -6 40 0 M 1640 788 q 20 -8 40 2" fill="none" stroke={C.tickShade} strokeWidth={5} strokeLinecap="round" />
        {/* 1番のベッドから羽根が舞う (事件) */}
        {fly > 0 && Array.from({ length: 7 }, (_, i) => {
          const k = clamp01(fly * 1.4 - i * 0.07);
          const fx = 520 + i * 60 + Math.sin(f / 6 + i) * 24;
          const fy = 640 - k * (160 + rnd(110, i) * 120);
          return <L2dFeather key={i} x={fx} y={fy} s={0.9 + rnd(111, i) * 0.5} r={Math.sin(f / 5 + i) * 40} o={k > 0 ? 1 - k * 0.3 : 0} />;
        })}

        {/* 母 (左端で右を指さす) */}
        <L2dLady x={250} y={860} s={1.4} f={f} face="smile" pose="point" pointDir={1} gaze={momGaze} lean={-2} />
        {/* 指さしの「ぴっ」 (札が乗るたび) */}
        {[t1, t2, t3].map((t, i) => {
          const r = ring(t);
          if (!r) return null;
          return (
            <g key={i} opacity={1 - r} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              {[-24, 0, 24].map((a) => (
                <line key={a} x1={480 + Math.cos((a * Math.PI) / 180) * (20 + r * 30)} y1={650 + Math.sin((a * Math.PI) / 180) * (20 + r * 30)}
                  x2={480 + Math.cos((a * Math.PI) / 180) * (44 + r * 40)} y2={650 + Math.sin((a * Math.PI) / 180) * (44 + r * 40)} />
              ))}
            </g>
          );
        })}

        {/* 順位の札 */}
        <TagPlate x={700} y={752} text="1" size={64} t={t1} fill={C.goldLight} />
        <TagPlate x={1180} y={770} text="2" size={52} t={t2} fill={KRP.silver} />
        <TagPlate x={1600} y={780} text="3" size={44} t={t3} fill={KRP.copper} />
      </g>
    </Frame>
  );
};

// ---- 文#103 【図】 ここでいう羽毛のベッドとは、羽毛を詰めた、大きな敷きぶとんのことです。
// 設計: 中世の羽毛ベッドの断面図 (世界=羊皮紙)。麻の袋に羽毛がぎっしり、木の寝台の上に置かれる。札「羽毛」「麻の袋」「寝台は別」
// どこ: 書斎の机の上に広げた羊皮紙の図面 (四隅を釘で留める)。机の端に羽ペンとインク壺・定規
// 演出: 羊皮紙いっぱいに、木の寝台 (柱・横木・縄の網) と、その上の麻袋の断面。
//       切り口が左から右へ進んで、中の羽毛がぎっしり詰まっているのが見えてくる (事件)。右上に羽毛1本の拡大の丸。
//       最後に袋がふわっと持ち上がり、寝台と袋の間にすき間 → 「寝台は別」
// 動き: カメラがゆっくり寄る / 切り口 f4〜26 / 羽毛がふるふる / 札 f10・f20・f32 / 袋が f28〜38 で浮く
const Yw103: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.05 * easeInOut(seg(f, 0, 42));
  const cut = easeInOut(seg(f, 4, 26));
  const lift = 26 * easeOut(seg(f, 28, 38));
  const SL = 400, SR = 1520, SB = 642 - lift, ST = 400 - lift;
  const cutX = SL + (SR - SL) * cut;
  const sackD = `M ${SL + 30} ${SB} Q ${SL - 20} ${SB} ${SL - 16} ${(SB + ST) / 2} Q ${SL - 10} ${ST - 6} ${SL + 60} ${ST}
    Q ${(SL + 960) / 2} ${ST - 30} 960 ${ST - 10} Q ${(960 + SR) / 2} ${ST - 30} ${SR - 60} ${ST}
    Q ${SR + 10} ${ST - 6} ${SR + 16} ${(SB + ST) / 2} Q ${SR + 20} ${SB} ${SR - 30} ${SB} Q 960 ${SB + 10} ${SL + 30} ${SB} Z`;
  // 中の羽毛 (ぎっしり)
  const downs = Array.from({ length: 120 }, (_, i) => ({
    x: SL + 30 + rnd(1031, i) * (SR - SL - 60),
    y: ST + 26 + rnd(1032, i) * (SB - ST - 44),
    r: rnd(1033, i) * 180,
    s: 0.7 + rnd(1034, i) * 0.6,
  }));
  return (
    <Frame f={f} seed={3103} bg={C.woodMid}>
      <defs>
        <clipPath id="l2d103in"><path d={sackD} /></clipPath>
        <clipPath id="l2d103cut"><rect x={SL - 40} y={ST - 60} width={cutX - SL + 40} height={SB - ST + 120} /></clipPath>
      </defs>
      <g transform={camT(960, 520, z)}>
        {/* 机 (木目) */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.woodMid} />
        <g stroke={C.woodDeep} strokeWidth={5} opacity={0.55}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -40 ${40 + i * 140} q 480 ${rnd(1035, i) * 40 - 20} 1000 0 q 480 ${rnd(1036, i) * 40 - 20} 1000 0`} fill="none" />
          ))}
        </g>
        {/* 羊皮紙 */}
        <path d="M 130 76 Q 520 58 960 70 Q 1400 58 1790 80 Q 1806 460 1790 860 Q 1400 878 960 866 Q 520 880 130 862 Q 116 460 130 76 Z"
          fill={C.parchment} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 160 104 Q 960 90 1760 108 L 1760 832 Q 960 846 160 834 Z" fill="none" stroke={C.parchDark} strokeWidth={4} strokeDasharray="22 10" />
        {[[150, 96], [1770, 100], [150, 842], [1770, 842]].map(([nx, ny], i) => (
          <g key={i}><circle cx={nx} cy={ny} r={13} fill={C.iron} stroke={KRP.ink} strokeWidth={4} /><circle cx={nx - 3} cy={ny - 3} r={4} fill={KRP.gray} /></g>
        ))}
        {/* しみ */}
        <ellipse cx={1640} cy={760} rx={70} ry={30} fill={C.parchDark} opacity={0.35} />
        <ellipse cx={260} cy={180} rx={50} ry={22} fill={C.parchDark} opacity={0.3} />

        {/* 木の寝台 (横から) */}
        <g>
          <rect x={330} y={330} width={46} height={480} rx={8} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={353} cy={322} r={26} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1546} y={520} width={46} height={290} rx={8} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1569} cy={512} r={22} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <rect x={360} y={648} width={1210} height={52} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          {/* 縄の網 (横木の穴に通した縄) */}
          {Array.from({ length: 14 }, (_, i) => (
            <g key={i}>
              <circle cx={420 + i * 82} cy={674} r={9} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${420 + i * 82} 666 q 41 -14 82 0`} fill="none" stroke={C.linenDark} strokeWidth={5} opacity={i < 13 ? 1 : 0} />
            </g>
          ))}
          {/* 脚 */}
          {[400, 1500].map((lx) => <rect key={lx} x={lx} y={700} width={40} height={110} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />)}
          <line x1={330} y1={812} x2={1600} y2={812} stroke={C.brownInk} strokeWidth={4} opacity={0.5} />
        </g>

        {/* 麻の袋 (外側) */}
        <path d={sackD} fill={C.linen} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g clipPath="url(#l2d103in)" opacity={0.5}>
          {Array.from({ length: 30 }, (_, i) => (
            <line key={i} x1={SL + i * 40} y1={ST - 30} x2={SL + i * 40 - 30} y2={SB + 20} stroke={C.linenDark} strokeWidth={3} />
          ))}
        </g>
        {/* 断面 (切り口が進む) */}
        <g clipPath="url(#l2d103cut)">
          <g clipPath="url(#l2d103in)">
            <rect x={SL - 40} y={ST - 60} width={SR - SL + 80} height={SB - ST + 120} fill={C.feather} />
            {downs.map((d, i) => (
              <g key={i} transform={`translate(${d.x + Math.sin(f / 5 + i) * 1.5} ${d.y + Math.cos(f / 6 + i) * 1.5}) rotate(${d.r}) scale(${d.s})`}>
                <path d="M 0 0 q -10 -8 -16 -2 M 0 0 q -6 -14 0 -18 M 0 0 q 6 -14 12 -10 M 0 0 q 12 -2 14 6 M 0 0 q 4 10 -6 14"
                  fill="none" stroke={i % 3 ? C.featherShade : C.parchDark} strokeWidth={3.5} strokeLinecap="round" />
                <circle r={3} fill={C.parchDark} />
              </g>
            ))}
          </g>
          {/* 袋の生地の厚み (断面の縁) */}
          <path d={sackD} fill="none" stroke={C.linenDark} strokeWidth={22} strokeLinejoin="round" />
          <path d={sackD} fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        </g>
        {/* 切り口の線 (点線) と小刀 */}
        {cut > 0 && cut < 1 && (
          <g>
            <line x1={cutX} y1={ST - 40} x2={cutX} y2={SB + 20} stroke={KRP.red} strokeWidth={5} strokeDasharray="14 10" />
            <g transform={`translate(${cutX} ${ST - 50}) rotate(10)`}>
              <path d="M -6 0 L -6 -70 Q 0 -90 6 -70 L 6 0 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-12} y={-118} width={24} height={50} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        )}
        {/* 浮いたすき間の矢印 (寝台は別) */}
        {lift > 2 && (
          <g stroke={KRP.red} strokeWidth={5} strokeLinecap="round" fill="none" opacity={clamp01(lift / 20)}>
            {[620, 1300].map((ax) => (
              <g key={ax}>
                <line x1={ax} y1={SB + 6} x2={ax} y2={644} />
                <path d={`M ${ax - 8} ${SB + 14} L ${ax} ${SB + 4} L ${ax + 8} ${SB + 14} M ${ax - 8} 636 L ${ax} 646 L ${ax + 8} 636`} />
              </g>
            ))}
          </g>
        )}

        {/* 拡大の丸 (羽毛1本) */}
        <g opacity={seg(f, 14, 22)}>
          <line x1={1300} y1={470} x2={1520} y2={300} stroke={C.brownInk} strokeWidth={4} strokeDasharray="10 8" />
          <circle cx={1300} cy={470} r={26} fill="none" stroke={C.brownInk} strokeWidth={4} />
          <circle cx={1590} cy={240} r={124} fill={C.feather} stroke={KRP.ink} strokeWidth={7} />
          <g transform={`translate(1590 260) rotate(${Math.sin(f / 7) * 6})`}>
            <circle r={10} fill={C.parchDark} stroke={KRP.ink} strokeWidth={3} />
            {Array.from({ length: 11 }, (_, i) => {
              const a = (i / 11) * Math.PI * 2;
              return <path key={i} d={`M 0 0 Q ${Math.cos(a + 0.4) * 50} ${Math.sin(a + 0.4) * 50} ${Math.cos(a) * 88} ${Math.sin(a) * 80}`} fill="none" stroke={C.featherShade} strokeWidth={6} strokeLinecap="round" />;
            })}
            {Array.from({ length: 11 }, (_, i) => {
              const a = (i / 11) * Math.PI * 2;
              return <path key={i} d={`M ${Math.cos(a) * 40} ${Math.sin(a) * 36} l ${Math.cos(a + 0.8) * 16} ${Math.sin(a + 0.8) * 16}`} fill="none" stroke={C.featherShade} strokeWidth={3} strokeLinecap="round" />;
            })}
          </g>
        </g>

        {/* 引き出し線 */}
        <g stroke={C.brownInk} strokeWidth={4} fill="none">
          <path d={`M 560 300 L 520 ${ST + 4}`} opacity={seg(f, 8, 12)} />
          <path d={`M 1000 300 L 900 ${ST + 90}`} opacity={seg(f, 18, 22)} />
          <circle cx={900} cy={ST + 90} r={7} fill={C.brownInk} opacity={seg(f, 18, 22)} />
          <circle cx={520} cy={ST + 4} r={7} fill={C.brownInk} opacity={seg(f, 8, 12)} />
        </g>
      </g>
      <TagPlate x={560} y={262} text="麻の袋" size={50} t={seg(f, 8, 14)} />
      <TagPlate x={1020} y={262} text="羽毛" size={56} t={seg(f, 18, 24)} fill={C.feather} />
      <TagPlate x={960} y={764} text="寝台は別" size={46} t={seg(f, 32, 38)} fill={C.goldLight} />
      {/* 机の上の道具 (羽ペンとインク壺・定規) */}
      <g transform="translate(70 960)">
        <path d="M 0 0 Q -10 -40 20 -44 Q 50 -40 40 0 Z" fill={C.brownInk} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${30 + Math.sin(f / 8) * 2})`}>
          <path d="M 20 -40 Q 0 -120 30 -210 Q 46 -120 20 -40 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      <rect x={1560} y={900} width={340} height={40} rx={4} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} transform="rotate(-4 1730 920)" />
    </Frame>
  );
};

// ---- 文#104 【並】 遺言で分けるほどの、財産だったのです。
// 設計: 館の宝物の棚に、金の杯・銀の皿と並んで、丸めた羽毛ベッドが置かれている。金貨の山と同じくらい輝く
// どこ: 館の石壁にはめこんだ、両開きの頑丈な宝物の戸棚 (鉄の蝶番・錠前)。上の段に金の杯と銀の皿、中の段に羽毛ベッド、下の段に金貨の箱
// 演出: 中の段の真ん中に、丸めてひもでしばった羽毛ベッドが紫のビロードの台に鎮座。封蝋つきの目録の札がぶら下がる。
//       窓からの光の帯が棚を横切ると、金貨・杯・羽毛ベッドが同じようにきらりと光る (事件)。金貨が1枚ころがり落ちる
// 動き: カメラが羽毛ベッドへ寄る / 光の帯 f4〜30 で左から右へ / きらめき f10〜 / 金貨 f16〜36 ころがる / 目録の札がゆれる
const Yw104: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.08 * easeInOut(seg(f, 0, 42));
  const beam = easeInOut(seg(f, 4, 30));
  const bx = lerp(200, 1500, beam);
  const shine = seg(f, 10, 30);
  const tw = (i: number) => (0.6 + 0.4 * Math.sin(f / 3 + i * 1.7)) * shine;
  const roll = easeOut(seg(f, 16, 36));
  const coinX = lerp(1210, 1300, roll);
  const coinY = roll < 0.5 ? lerp(744, 836, (roll * 2) ** 2) : 836 - Math.abs(Math.sin((roll - 0.5) * Math.PI * 2)) * 24 * (1 - roll);
  return (
    <Frame f={f} seed={3104} bg={C.cell}>
      <g transform={camT(960, 505, z)}>
        {/* 石の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.cellDark} />
        <L2dBricks x0={-100} y0={-40} cols={12} rows={12} bw={180} bh={96} stroke={C.cell} />
        {/* 戸棚の外枠 */}
        <rect x={360} y={40} width={1200} height={840} rx={14} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={8} />
        <rect x={400} y={80} width={1120} height={780} fill={C.tapestryDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={400} y={80} width={1120} height={780} fill={KRP.ink} opacity={0.25} />
        {/* 開いた扉 (左右・遠近の台形) */}
        {[-1, 1].map((d) => {
          const x0 = d < 0 ? 360 : 1560;
          const x1 = x0 + d * 190;
          return (
            <g key={d}>
              <path d={`M ${x0} 40 L ${x1} 90 L ${x1} 830 L ${x0} 880 Z`} fill={C.woodMid} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
              <path d={`M ${x0 + d * 30} 110 L ${x1 - d * 30} 140 L ${x1 - d * 30} 780 L ${x0 + d * 30} 810 Z`} fill="none" stroke={C.woodDeep} strokeWidth={6} />
              {[200, 720].map((hy) => (
                <g key={hy}>
                  <rect x={Math.min(x0, x0 + d * 110)} y={hy - 14} width={110} height={28} rx={4} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
                  {[0.25, 0.75].map((k) => <circle key={k} cx={x0 + d * 110 * k} cy={hy} r={5} fill={KRP.gray} />)}
                </g>
              ))}
            </g>
          );
        })}
        {/* 錠前と鍵 (右の扉に掛かる) */}
        <g transform={`translate(1700 470) rotate(${Math.sin(f / 7) * 8})`}>
          <circle cx={0} cy={0} r={10} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-6} y={0} width={12} height={80} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={100} r={22} fill="none" stroke={C.iron} strokeWidth={10} />
          <path d="M 6 40 h 18 M 6 56 h 12" stroke={C.iron} strokeWidth={8} />
        </g>
        {/* 棚板 */}
        {[330, 640].map((sy) => (
          <g key={sy}>
            <rect x={400} y={sy} width={1120} height={30} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
            <rect x={400} y={sy + 30} width={1120} height={12} fill={KRP.ink} opacity={0.25} />
          </g>
        ))}
        {/* 上の段: 金の杯・銀の皿・金の水差し */}
        <g>
          {[[560, 1], [1360, -1]].map(([cx, d], i) => (
            <g key={i} transform={`translate(${cx} 330)`}>
              <path d="M -60 -200 Q -60 -120 0 -110 Q 60 -120 60 -200 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={6} />
              <rect x={-10} y={-112} width={20} height={70} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={0} cy={-36} rx={50} ry={14} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={0} cy={-200} rx={60} ry={14} fill={C.goldDark} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${-40 * d} -184 Q ${-30 * d} -140 ${-10 * d} -126`} fill="none" stroke={C.goldLight} strokeWidth={8} strokeLinecap="round" />
              {[-30, 0, 30].map((gx) => <circle key={gx} cx={gx} cy={-160} r={7} fill={C.illumRed} stroke={KRP.ink} strokeWidth={2.5} />)}
            </g>
          ))}
          {[[780, 0], [1140, 1]].map(([px, i]) => (
            <g key={px} transform={`translate(${px} 230) rotate(${i ? 6 : -6})`}>
              <ellipse cx={0} cy={0} rx={96} ry={96} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
              <ellipse cx={0} cy={0} rx={64} ry={64} fill="none" stroke={C.silverDark} strokeWidth={6} />
              <path d="M -60 -40 Q -40 -70 -6 -78" fill="none" stroke={KRP.white} strokeWidth={9} strokeLinecap="round" />
            </g>
          ))}
          <g transform="translate(960 330)">
            <path d="M -40 -40 Q -60 -120 -30 -170 L -36 -200 L 36 -200 L 30 -170 Q 60 -120 40 -40 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={6} />
            <path d="M 36 -190 Q 90 -180 70 -110 Q 60 -80 42 -70" fill="none" stroke={KRP.ink} strokeWidth={14} />
            <path d="M 36 -190 Q 90 -180 70 -110 Q 60 -80 42 -70" fill="none" stroke={C.gold} strokeWidth={8} />
            <path d="M -36 -196 L -80 -214 L -34 -180" fill={C.gold} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <ellipse cx={0} cy={-36} rx={50} ry={10} fill={C.goldDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        </g>
        {/* 中の段: 丸めた羽毛ベッド (主役) */}
        <ellipse cx={960} cy={500} rx={440} ry={180} fill={YP.glow} opacity={0.22 + 0.3 * shine * (0.85 + Math.sin(f / 5) * 0.15)} />
        <ellipse cx={960} cy={490} rx={340} ry={130} fill={YP.glowCore} opacity={0.12 + 0.3 * shine} />
        <ellipse cx={960} cy={760} rx={300} ry={90} fill={YP.glow} opacity={0.15 + 0.25 * shine} />
        <rect x={620} y={590} width={680} height={50} rx={14} fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
        {[640, 1280].map((tx) => <path key={tx} d={`M ${tx} 640 l -10 26 m 10 -26 l 0 28 m 0 -28 l 10 26`} stroke={C.illumGold} strokeWidth={4} />)}
        <L2dRolledBed x={940} y={480} w={620} r={112} f={f} />
        {/* 目録の札 (封蝋つき) */}
        <g transform={`translate(1360 520) rotate(${Math.sin(f / 6) * 7})`}>
          <path d="M -100 -14 Q -40 -10 0 40" fill="none" stroke={C.illumRed} strokeWidth={5} />
          <rect x={-46} y={40} width={92} height={60} rx={6} fill={C.parchment} stroke={KRP.ink} strokeWidth={4.5} />
          {[56, 70, 84].map((ly) => <line key={ly} x1={-34} y1={ly} x2={34} y2={ly} stroke={C.brownInk} strokeWidth={3} opacity={0.5} strokeDasharray="12 5" />)}
          <circle cx={30} cy={94} r={14} fill={C.wax} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* 下の段: 金貨の箱 */}
        <g transform="translate(0 30)">
          <rect x={700} y={720} width={520} height={130} rx={8} fill={C.woodMid} stroke={KRP.ink} strokeWidth={7} />
          {[760, 1160].map((ix) => <rect key={ix} x={ix - 16} y={720} width={32} height={130} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />)}
          <path d="M 700 720 L 690 676 L 1230 676 L 1220 720 Z" fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
          {/* 金貨の山 */}
          <path d="M 716 726 Q 760 690 860 680 Q 960 664 1060 680 Q 1160 690 1204 726 Z" fill={C.goldDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 30 }, (_, i) => {
            const row = Math.floor(i / 8);
            const cx = 760 + (i % 8) * 56 + (row % 2) * 28 - row * 10;
            const cy = 714 - row * 14 - Math.sin(((i % 8) / 7) * Math.PI) * 20;
            if (row > 2 || cx > 1180) return null;
            return <ellipse key={i} cx={cx} cy={cy} rx={26} ry={11} fill={C.gold} stroke={KRP.ink} strokeWidth={3.5} />;
          })}
        </g>
        <g>
          {/* 左右の段の小物: 銀の燭台と宝石の小箱 */}
          <L2dCandle x={520} y={856} s={0.9} f={f} h={110} />
          <g transform="translate(1420 856)">
            <rect x={-70} y={-80} width={140} height={80} rx={8} fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -70 -80 Q 0 -120 70 -80" fill={C.velvet} stroke={KRP.ink} strokeWidth={5} />
            {[-34, 0, 34].map((gx, i) => <circle key={gx} cx={gx} cy={-44} r={10} fill={[C.illumRed, C.illumBlue, C.mom][i]} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
        </g>
        {/* ころがる金貨 (事件) */}
        <g transform={`translate(${coinX} ${coinY}) rotate(${roll * 540})`}>
          <ellipse rx={20} ry={20} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -8 -8 L 8 8 M 8 -8 L -8 8" stroke={C.goldDark} strokeWidth={4} />
        </g>
        {/* 光の帯 (窓から) */}
        <path d={`M ${bx - 120} 40 L ${bx + 20} 40 L ${bx + 220} 880 L ${bx + 80} 880 Z`} fill={C.haloCore} opacity={0.22 * Math.sin(beam * Math.PI) + 0.04} />
        {/* きらめき: 金貨と同じように、羽毛ベッドも光る */}
        {([[600, 160], [1340, 170], [780, 200], [960, 160], [820, 722], [980, 704], [1120, 716], [720, 420], [1180, 400], [860, 560], [1260, 470]] as const).map(([sx, sy], i) => (
          <L2dSpark key={i} x={sx} y={sy} k={26 * tw(i)} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#105 【並】 人気が出れば、偽物も出ます。
// 設計: 薄暗い路地裏の職人の作業場。怪しい職人がこっそり麻袋に、羽毛ではなく藁やくずを詰めている。上に羽根を少しだけ乗せてごまかす
// どこ: 夜の路地裏の作業小屋。低い梁・すすけたれんが壁・格子の小窓 (月の光と、のぞく猫)・吊りランタン・壁の棚・干し草用のフォーク
// 演出: 左に藁とぼろ切れの山 (札「藁」「くず」)。真ん中に口を開けた麻袋。中身は藁でぱんぱん、わき腹の穴から藁とぼろがはみ出す。
//       右から黒いフードの職人が手をのばし、つまんだ羽根を数枚だけ、袋の口の上にそっと置く (事件)。
//       羽根のかごは小さくて、ほとんど空。職人は目を左右にきょろきょろ、汗。窓の猫だけが見ている
// 動き: カメラが袋へ寄る / 羽根が f12〜36 で1枚ずつ落ちて口の上に乗る / 職人の目がきょろきょろ / 汗 f22〜 / 猫のまばたき / ランタンのゆれ
const Yw105: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.07 * easeInOut(seg(f, 0, 42));
  const look = Math.sin(f / 3.2) > 0 ? 9 : -6;
  const sweat = seg(f, 22, 42);
  const lantern = Math.sin(f / 10) * 4;
  const HX = 865, HY = 712; // 職人の指先
  const lands: [number, number, number][] = [[712, 784, -30], [760, 776, 20], [808, 782, -10], [850, 778, 40]];
  const catBlink = (f % 40) > 36;
  return (
    <Frame f={f} seed={3105} bg={C.alley} dark>
      <g transform={camT(780, 720, z)}>
        {/* すすけたれんが壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.alleyWall} />
        <L2dBricks x0={-100} y0={60} cols={14} rows={8} bw={150} bh={80} stroke={C.alleyWallDark} sw={6} />
        {/* 低い梁 */}
        <rect x={-60} y={-40} width={W + 120} height={110} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-60} y={62} width={W + 120} height={16} fill={KRP.ink} opacity={0.4} />
        {/* 格子の小窓 (月) と、のぞく猫 */}
        <rect x={280} y={130} width={260} height={210} fill={C.nightSky} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={480} cy={180} r={34} fill={C.moonBeam} />
        <g transform="translate(360 340)">
          <path d="M -46 0 Q -50 -60 -30 -76 L -36 -104 L -12 -84 Q 0 -88 12 -84 L 36 -104 L 30 -76 Q 50 -60 46 0 Z" fill={KRP.ink} />
          {catBlink ? (
            <g stroke={C.catEye} strokeWidth={4}><line x1={-22} y1={-56} x2={-8} y2={-56} /><line x1={8} y1={-56} x2={22} y2={-56} /></g>
          ) : (
            <g><ellipse cx={-15} cy={-56} rx={9} ry={11} fill={C.catEye} /><ellipse cx={15} cy={-56} rx={9} ry={11} fill={C.catEye} />
              <rect x={-17} y={-64} width={4} height={16} fill={KRP.ink} /><rect x={13} y={-64} width={4} height={16} fill={KRP.ink} /></g>
          )}
        </g>
        {[340, 410, 480].map((gx) => <line key={gx} x1={gx} y1={130} x2={gx} y2={340} stroke={C.woodDeep} strokeWidth={9} />)}
        <line x1={280} y1={236} x2={540} y2={236} stroke={C.woodDeep} strokeWidth={9} />
        <rect x={262} y={336} width={296} height={24} rx={4} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
        {/* 月の光の帯 (袋の口を照らす) */}
        <path d="M 300 360 L 540 360 L 950 900 L 600 900 Z" fill={C.moonBeam} opacity={0.12 + Math.sin(f / 12) * 0.02} />
        {/* 壁の棚 (つぼ・糸巻き) */}
        <rect x={1300} y={250} width={480} height={22} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
        {[[1350, 0], [1440, 1], [1700, 2]].map(([jx, i]) => (
          <path key={jx} d={`M ${jx - 30} 250 Q ${jx - 40} 190 ${jx - 16} 170 L ${jx + 16} 170 Q ${jx + 40} 190 ${jx + 30} 250 Z`}
            fill={[C.roofDark, C.ragDark, C.tunicGreyDark][i]} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <g transform="translate(1570 220)"><rect x={-40} y={-20} width={80} height={50} rx={6} fill={C.linen} stroke={KRP.ink} strokeWidth={4} /><line x1={-40} y1={-6} x2={40} y2={-6} stroke={C.linenDark} strokeWidth={3} /><line x1={-40} y1={10} x2={40} y2={10} stroke={C.linenDark} strokeWidth={3} /></g>
        {/* 吊りランタン */}
        <g transform={`rotate(${lantern} 1080 70)`}>
          <circle cx={1080} cy={290} r={150} fill={C.flame} opacity={0.12} />
          <line x1={1080} y1={70} x2={1080} y2={210} stroke={C.iron} strokeWidth={6} />
          <path d="M 1046 220 L 1114 220 L 1104 330 L 1056 330 Z" fill={C.flame} opacity={0.5} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1040 210 L 1120 210 L 1080 180 Z" fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1046} y={326} width={68} height={14} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 1080 312 Q ${1068 + Math.sin(f / 2) * 3} 290 1080 266 Q ${1092 + Math.sin(f / 2) * 3} 290 1080 312 Z`} fill={C.flameCore} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 立てかけたフォーク */}
        <g transform="rotate(8 1800 880)">
          <rect x={1792} y={360} width={16} height={520} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1760 380 L 1760 300 M 1800 380 L 1800 290 M 1840 380 L 1840 300 M 1756 380 L 1844 380" stroke={C.iron} strokeWidth={8} strokeLinecap="round" fill="none" />
        </g>
        {/* 床 (板) */}
        <rect x={-60} y={800} width={W + 120} height={330} fill={C.alleyFloor} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-60} y1={850 + i * 60} x2={W + 60} y2={850 + i * 60} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />)}

        {/* 藁とぼろ切れの山 (左) */}
        <path d="M 60 900 Q 80 720 250 690 Q 420 680 520 900 Z" fill={C.strawDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 26 }, (_, i) => {
          const sx = 90 + rnd(1051, i) * 400, sy = 720 + rnd(1052, i) * 170;
          return <line key={i} x1={sx} y1={sy} x2={sx + (rnd(1053, i) - 0.5) * 80} y2={sy - 20 - rnd(1054, i) * 30} stroke={C.straw} strokeWidth={5} strokeLinecap="round" />;
        })}
        {[[330, 760, 20, C.rag], [420, 800, -14, C.ragDark], [200, 820, 8, C.tunicGrey]].map(([rx, ry, rr, col], i) => (
          <g key={i} transform={`translate(${rx} ${ry}) rotate(${rr})`}>
            <path d="M -60 0 L -40 -36 L 10 -30 L 50 -44 L 60 0 L 20 24 L -30 18 Z" fill={col as string} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M -30 -14 L 20 -8" stroke={KRP.ink} strokeWidth={3} strokeDasharray="6 5" />
          </g>
        ))}
        {/* ネズミが藁をかぐ */}
        <g transform={`translate(${120 + Math.sin(f / 6) * 6} 930)`}>
          <ellipse cx={0} cy={-18} rx={34} ry={20} fill={C.ragDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={30} cy={-24} r={14} fill={C.ragDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={26} cy={-38} r={8} fill={C.rag} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={36} cy={-26} r={3} fill={KRP.ink} />
          <path d="M -34 -14 Q -70 -10 -76 -30" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        </g>

        {/* 麻袋 (中身は藁とくず) */}
        <path d="M 610 940 Q 580 880 600 820 Q 610 790 620 780 L 900 780 Q 914 792 924 820 Q 946 880 910 940 Q 760 960 610 940 Z" fill={C.linen} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={630 + i * 36} y1={800} x2={620 + i * 38} y2={936} stroke={C.linenDark} strokeWidth={3} opacity={0.6} />)}
        {/* わき腹の穴から藁とぼろがはみ出す */}
        <ellipse cx={680} cy={880} rx={26} ry={18} fill={C.strawDark} stroke={KRP.ink} strokeWidth={4} />
        {[[-30, -14], [-36, 6], [-20, 20], [-40, -2]].map(([lx, ly], i) => <line key={i} x1={680} y1={880} x2={680 + lx * 1.6} y2={880 + ly * 1.4} stroke={C.straw} strokeWidth={5} strokeLinecap="round" />)}
        <path d="M 900 860 L 940 850 L 948 880 L 912 890 Z" fill={C.rag} stroke={KRP.ink} strokeWidth={4} />
        {/* 袋の口: 藁がぎっしり */}
        <ellipse cx={760} cy={782} rx={146} ry={30} fill={C.strawDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 16 }, (_, i) => {
          const sx = 640 + i * 16;
          return <line key={i} x1={sx} y1={790} x2={sx + (rnd(1055, i) - 0.5) * 50} y2={760 - rnd(1056, i) * 40} stroke={C.straw} strokeWidth={5} strokeLinecap="round" />;
        })}
        <path d="M 610 790 Q 600 770 630 770 M 910 790 Q 920 770 890 770" fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* 落ちて口の上に乗った羽根 (ほんの少し) */}
        {lands.map(([lx, ly, lr], i) => {
          const t = seg(f, 12 + i * 6, 22 + i * 6);
          if (t <= 0) return null;
          const k = easeInOut(t);
          const x = lerp(HX - 10, lx, k) + Math.sin(f / 3 + i) * 8 * (1 - k);
          const y = lerp(HY + 10, ly, k);
          return <L2dFeather key={i} x={x} y={y} s={1.15} r={lerp(80, lr, k)} />;
        })}
        {/* ほとんど空の羽根のかご */}
        <g transform="translate(1010 930)">
          <path d="M -70 -70 L 70 -70 L 56 0 L -56 0 Z" fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          {[-46, -16, 14, 44].map((bx) => <line key={bx} x1={bx} y1={-70} x2={bx * 0.8} y2={0} stroke={C.woodMid} strokeWidth={4} />)}
          <L2dFeather x={-10} y={-82} s={0.9} r={-60} />
          <ellipse cx={0} cy={-70} rx={70} ry={12} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />
        </g>

        {/* 職人 (黒いフード・無精ひげ) が手をのばす */}
        <L2dFig x={1160} y={940} s={1.7} f={f} phase={5} lean={-6}
          p={{ face: "normal", cloth: C.ragDark, clothDark: C.hoodDarkDeep, hair: "none", pose: "point", pointDir: -1, gaze: [look, 2] }}>
          <L2dHood col={C.hoodDark} dark={C.hoodDarkDeep} tail={1} />
          <g fill={KRP.ink} opacity={0.5}>
            {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-30 + (i % 6) * 12} cy={-184 + Math.floor(i / 6) * 9 + Math.abs((i % 6) - 2.5) * -2} r={2.2} />)}
          </g>
          <path d="M -60 -100 L 60 -100" stroke={KRP.ink} strokeWidth={8} />
        </L2dFig>
        {/* つまんだ羽根 (指先) */}
        {seg(f, 12, 36) < 1 && <L2dFeather x={HX + 6} y={HY - 22} s={1.0} r={-20 + Math.sin(f / 2) * 10} />}
        <L2dSweat x={1290} y={480} s={1.2} t={sweat} />
      </g>
      <TagPlate x={200} y={630} text="藁" size={52} t={seg(f, 4, 10)} fill={C.goldLight} />
      <TagPlate x={420} y={610} text="くず" size={46} t={seg(f, 8, 14)} />
    </Frame>
  );
};

// ---- 文#106 【山】 1474年のロンドンでは、偽物の羽毛ベッドが、訴えられています。
// 設計: 中世ロンドンの裁判の場 (ギルドホール)。裂けた偽物の羽毛ベッドから藁とくずがはみ出し、怒った客と役人。職人は縮こまる。札「1474年」「偽物」
// どこ: ロンドンのギルドホール。とがったアーチの高窓・木の小屋組の天井・ロンドン市の旗 (白地に赤い十字と剣)・石の床
// 演出: 奥の高い机に赤い服の市長 (毛皮の襟・黒い帽子) が手を上げて裁き、横で書記が羽ペンで記録。
//       手前の床に裂けた偽物の羽毛ベッド。裂け目から藁とぼろがどばっと噴き出し、ほこりが立つ (事件)。
//       左の客 (黄土色のフード) が怒って指さす。右の職人 (#105 と同じ黒いフード) は小さく縮こまって汗
// 動き: カメラがベッドへ寄る / f8〜22 藁が噴き出す・ほこり / 職人が f16〜34 で縮む / 怒りマーク f10〜 / 旗のゆれ / 書記の羽ペン
const Yw106: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.06 * easeInOut(seg(f, 0, 42));
  const burst = easeOut(seg(f, 8, 22));
  const dust = seg(f, 8, 30);
  const shrink = easeInOut(seg(f, 16, 34));
  const crS = 1.35 * lerp(1, 0.84, shrink);
  const flap = Math.sin(f / 9) * 2;
  return (
    <Frame f={f} seed={3106} bg={C.cell}>
      <g transform={camT(960, 640, z)}>
        {/* 石の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.cellLight} />
        <L2dBricks x0={-100} y0={100} cols={12} rows={7} bw={180} bh={90} stroke={C.cell} />
        {/* 木の小屋組の天井 */}
        <rect x={-60} y={-40} width={W + 120} height={120} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={7} />
        {[160, 640, 1280, 1760].map((bx) => (
          <g key={bx}>
            <path d={`M ${bx - 140} 80 Q ${bx} 140 ${bx + 140} 80`} fill="none" stroke={C.woodDeep} strokeWidth={22} />
            <path d={`M ${bx - 140} 80 Q ${bx} 140 ${bx + 140} 80`} fill="none" stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* とがったアーチの高窓 */}
        {[300, 1620].map((ax) => (
          <g key={ax}>
            <path d={`M ${ax - 120} 560 L ${ax - 120} 260 Q ${ax - 120} 160 ${ax} 120 Q ${ax + 120} 160 ${ax + 120} 260 L ${ax + 120} 560 Z`} fill={C.cellDark} stroke={KRP.ink} strokeWidth={8} />
            <path d={`M ${ax - 96} 540 L ${ax - 96} 266 Q ${ax - 96} 180 ${ax} 146 Q ${ax + 96} 180 ${ax + 96} 266 L ${ax + 96} 540 Z`} fill={C.sky} stroke={KRP.ink} strokeWidth={5} />
            <line x1={ax} y1={146} x2={ax} y2={540} stroke={KRP.ink} strokeWidth={6} />
            {[300, 420].map((ly) => <line key={ly} x1={ax - 96} y1={ly} x2={ax + 96} y2={ly} stroke={KRP.ink} strokeWidth={5} />)}
            <circle cx={ax} cy={230} r={30} fill={C.illumBlue} opacity={0.5} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* ロンドン市の旗 (白地に赤い十字、左上に赤い剣) */}
        <g transform={`translate(960 100) rotate(${flap * 0.4})`}>
          <rect x={-8} y={-30} width={16} height={40} fill={C.iron} />
          <rect x={-150} y={0} width={300} height={4} fill={C.iron} />
          <path d={`M -140 4 L 140 4 L 140 230 L 0 ${262 + flap} L -140 230 Z`} fill={C.banner} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={-22} y={4} width={44} height={244} fill={KRP.red} />
          <rect x={-140} y={92} width={280} height={44} fill={KRP.red} />
          <g transform="translate(-80 48) rotate(-90)" fill={KRP.red}>
            <path d="M -30 -5 L 24 -5 L 32 0 L 24 5 L -30 5 Z" />
            <rect x={-38} y={-14} width={8} height={28} />
            <rect x={-54} y={-4} width={16} height={8} />
          </g>
          <path d={`M -140 4 L 140 4 L 140 230 L 0 ${262 + flap} L -140 230 Z`} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        </g>
        {/* 段の床 */}
        <rect x={420} y={700} width={1080} height={60} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />

        {/* 市長 (赤い服・毛皮の襟・黒い帽子)。手を上げて裁く */}
        <L2dFig x={960} y={740} s={1.2} f={f} phase={2}
          p={{ face: "angry", cloth: C.alderman, clothDark: C.aldermanDark, hair: "cap", pose: "raise", gaze: [0, 6] }}>
          {/* 上げた手に木づち */}
          <g transform={`translate(70 -236) rotate(${-24 + Math.sin(f / 3) * 10})`}>
            <rect x={-7} y={-80} width={14} height={86} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-38} y={-118} width={76} height={42} rx={10} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={5} />
          </g>
          <circle cx={67} cy={-232} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -64 -160 Q 0 -120 64 -160 L 58 -138 Q 0 -104 -58 -138 Z" fill={C.ermine} stroke={KRP.ink} strokeWidth={4} />
          {[-36, -12, 12, 36].map((ex) => <rect key={ex} x={ex - 3} y={-140 + Math.abs(ex) * 0.3} width={6} height={10} fill={KRP.ink} />)}
          <path d="M -60 -268 Q -64 -320 0 -322 Q 64 -320 60 -268 Q 0 -286 -60 -268 Z" fill={KRP.ink} />
          <circle cx={0} cy={-128} r={9} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
        </L2dFig>
        {/* 書記 (記録をとる) */}
        <L2dFig x={1260} y={740} s={1.0} f={f} phase={8}
          p={{ face: "surprised", cloth: C.tunicGrey, clothDark: C.tunicGreyDark, hair: "cap", gaze: [-8, 6] }}>
          <path d="M -60 -268 Q -64 -310 0 -312 Q 64 -310 60 -268 Q 0 -282 -60 -268 Z" fill={C.tunicGreyDark} />
        </L2dFig>
        {/* 高い机 (赤い布) */}
        <rect x={560} y={560} width={860} height={34} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 580 594 L 1400 594 L 1400 700 L 580 700 Z" fill={C.alderman} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${620 + i * 92} 600 q 10 50 0 96`} fill="none" stroke={C.aldermanDark} strokeWidth={5} />)}
        <path d="M 580 600 L 1400 600" stroke={C.illumGold} strokeWidth={8} />
        {/* 机の上: 巻物・インク壺・羽ペン (書記の手もと) */}
        <rect x={1180} y={536} width={150} height={30} rx={4} fill={C.parchment} stroke={KRP.ink} strokeWidth={4} transform="rotate(-4 1255 551)" />
        <g transform={`translate(1310 540) rotate(${20 + Math.sin(f / 1.6) * 8})`}>
          <path d="M 0 0 Q -10 -50 10 -100 Q 20 -50 0 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        <path d="M 1120 560 Q 1116 530 1136 526 Q 1156 530 1152 560 Z" fill={C.brownInk} stroke={KRP.ink} strokeWidth={4} />
        <rect x={640} y={530} width={100} height={30} rx={4} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        <rect x={672} y={500} width={36} height={34} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />

        {/* 石の床 (市松) */}
        <rect x={-60} y={760} width={W + 120} height={360} fill={C.cell} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={-60 + (i % 11) * 190 + (Math.floor(i / 11) % 2) * 95} y={790 + Math.floor(i / 11) * 110} width={95} height={60} fill={C.cellDark} opacity={0.6} />
        ))}

        {/* 裂けた偽物の羽毛ベッド */}
        <L2dFeatherBed x={960} y={850} w={780} h={140} f={f} phase={1} />
        {/* 裂け目 (中の藁が見える) */}
        <path d={`M 860 ${716} L 890 ${700 - burst * 14} L 920 ${722} L 960 ${698 - burst * 18} L 1000 ${724} L 1040 ${700 - burst * 12} L 1070 ${716}
          L 1040 ${750 + burst * 6} L 1000 ${736} L 960 ${756 + burst * 8} L 920 ${738} L 890 ${752 + burst * 6} Z`}
          fill={C.strawDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 噴き出す藁とぼろ (事件) */}
        {Array.from({ length: 22 }, (_, i) => {
          const a = Math.PI * (1.08 + (i / 21) * 0.84);
          const len = (60 + rnd(1061, i) * 130) * burst;
          const sx = 900 + rnd(1062, i) * 140, sy = 726;
          return <line key={i} x1={sx} y1={sy} x2={sx + Math.cos(a) * len} y2={sy + Math.sin(a) * len * 0.8} stroke={i % 4 ? C.straw : C.strawDark} strokeWidth={6} strokeLinecap="round" />;
        })}
        {burst > 0 && ([[820, 650, -20, C.rag], [1110, 640, 26, C.ragDark], [980, 600, 6, C.tunicGrey]] as const).map(([rx, ry, rr, col], i) => (
          <g key={i} transform={`translate(${lerp(960, rx, burst)} ${lerp(720, ry, burst)}) rotate(${rr + f * (i - 1) * 2}) scale(${0.7 * burst})`}>
            <path d="M -40 0 L -24 -26 L 10 -20 L 36 -30 L 40 0 L 12 18 L -20 12 Z" fill={col} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          </g>
        ))}
        {/* 床に散った藁 */}
        {Array.from({ length: 12 }, (_, i) => {
          const sx = 560 + rnd(1063, i) * 800, sy = 860 + rnd(1064, i) * 40;
          return <line key={i} x1={sx} y1={sy} x2={sx + 30 + rnd(1065, i) * 20} y2={sy - 8 + rnd(1066, i) * 16} stroke={C.strawDark} strokeWidth={5} strokeLinecap="round" opacity={burst} />;
        })}
        {/* ほこり */}
        {dust > 0 && dust < 1 && Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={960 + (i - 2.5) * 70 * (0.6 + dust)} cy={690 - dust * 80 - (i % 2) * 30} r={20 + dust * 30}
            fill={C.cellLight} stroke={KRP.grayDark} strokeWidth={4} opacity={(1 - dust) * 0.8} />
        ))}

        {/* 怒った客 (黄土色のフード) が指さす */}
        <L2dFig x={340} y={890} s={1.45} f={f} phase={1} lean={4}
          p={{ face: "angry", cloth: C.tunicOchre, clothDark: C.tunicOchreDark, hair: "none", pose: "point", pointDir: 1, gaze: [8, 6] }}>
          <L2dHood col={C.tunicOchre} dark={C.tunicOchreDark} tail={-1} />
        </L2dFig>
        <L2dAnger x={470} y={420} s={1.2} t={seg(f, 10, 16)} />
        {/* 縮こまる職人 (#105 と同じ黒いフード) */}
        <L2dFig x={1620} y={890} s={crS} f={f} phase={5} lean={lerp(0, 8, shrink)}
          p={{ face: shrink > 0.3 ? "sad" : "worried", cloth: C.ragDark, clothDark: C.hoodDarkDeep, hair: "none", pose: "hold", gaze: [-6, 6] }}>
          <L2dHood col={C.hoodDark} dark={C.hoodDarkDeep} tail={1} />
          <g fill={KRP.ink} opacity={0.5}>
            {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-30 + (i % 6) * 12} cy={-184 + Math.floor(i / 6) * 9} r={2.2} />)}
          </g>
        </L2dFig>
        {/* ぶるぶるの線 */}
        {shrink > 0.2 && [0, 1].map((i) => (
          <path key={i} d={`M ${1500 - i * 20} ${560 + i * 50} q -12 -12 0 -24 q 12 -12 0 -24`} fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        ))}
        <L2dSweat x={1720} y={520 + shrink * 50} s={1.1} t={seg(f, 20, 42)} />
      </g>
      <TagPlate x={1640} y={130} text="1474年" size={56} t={seg(f, 2, 10)} />
      <TagPlate x={660} y={760} text="偽物" size={52} t={seg(f, 18, 26)} color={KRP.red} rot={-6} />
    </Frame>
  );
};

// ---- 文#107 【並】 そして1552年には、詰め物を取り締まる法律まで、作られました。
// 設計: 羊皮紙の法令にどーんと押される赤い封蝋。法令の上に羽毛と藁の絵、藁の方に✕。札「1552年」
// どこ: 役所の重い樫の机。上下が巻物になった大きな羊皮紙の法令。机の上にろうそく・赤い封蝋の棒・書類の束・インク壺と羽ペン
// 演出: 法令の上半分に飾り枠と2つの絵の枠: 左は羽毛 (ふわふわの羽根)、右は藁の束。
//       上から真鍮の印章 (王冠の紋) がどーんと降りて封蝋を押す (事件)。机がゆれ、ペンが跳ねる。印章が上がると王冠の赤い封蝋。
//       続けて藁の絵に赤い✕がつく
// 動き: f6〜14 印章が降りる / f14 どーん (衝撃の輪・ゆれ) / f20〜30 印章が上がって消える / f26〜32 藁に✕ / 封蝋のリボンがゆれる / カメラが少し寄る
const Yw107: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.0 + 0.05 * easeInOut(seg(f, 0, 42));
  const down = easeInOut(seg(f, 6, 14));
  const up = easeInOut(seg(f, 20, 30));
  const stampY = lerp(-260, 690, down) - up * 1000;
  const hit = seg(f, 14, 24);
  const shake = f >= 14 && f < 24 ? Math.sin(f * 2.6) * 10 * (1 - hit) : 0;
  const sealOn = f >= 14;
  const SX = 960, SY = 726;
  return (
    <Frame f={f} seed={3107} bg={C.woodDeep}>
      <g transform={camT(960, 500, z, 0, shake)}>
        {/* 樫の机 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.woodDeep} />
        <g stroke={KRP.ink} strokeWidth={5} opacity={0.35}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -40 ${60 + i * 140} q 480 ${rnd(1071, i) * 40 - 20} 1000 0 q 480 ${rnd(1072, i) * 40 - 20} 1000 0`} fill="none" />
          ))}
        </g>
        {/* 書類の束 (左下) */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={60 + i * 8} y={620 - i * 16} width={260} height={180} rx={4} fill={i === 2 ? C.parchment : C.parchDark} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${-8 + i * 4} 190 700)`} />
        ))}
        <L2dCandle x={190} y={420} s={1.1} f={f} h={130} />
        {/* 封蝋の棒 */}
        <g transform="rotate(-20 1660 640)">
          <rect x={1580} y={626} width={170} height={30} rx={8} fill={C.wax} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1580 630 q -16 10 0 22" fill={C.waxDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* インク壺と羽ペン (どーんで跳ねる) */}
        <g transform={`translate(1700 ${430 - Math.sin(hit * Math.PI) * 40})`}>
          <path d="M -40 0 Q -46 -60 -16 -66 L 16 -66 Q 46 -60 40 0 Z" fill={C.brownInk} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-18} y={-80} width={36} height={16} rx={4} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${24 + Math.sin(hit * Math.PI * 2) * 14})`}>
            <path d="M 0 -60 Q -18 -150 16 -250 Q 34 -150 0 -60 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <line x1={0} y1={-60} x2={14} y2={-240} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        </g>

        {/* 法令の羊皮紙 (上下が巻物) */}
        <rect x={420} y={90} width={1080} height={740} fill={C.parchment} stroke={KRP.ink} strokeWidth={7} />
        <rect x={452} y={150} width={1016} height={640} fill="none" stroke={C.illumRed} strokeWidth={5} />
        <rect x={464} y={162} width={992} height={616} fill="none" stroke={C.illumGold} strokeWidth={3} />
        {[[436, 160], [1484, 160], [436, 780], [1484, 780]].map(([cx, cy], i) => <circle key={i} cx={cx + (i % 2 ? -32 : 32)} cy={cy} r={10} fill={C.illumBlue} stroke={KRP.ink} strokeWidth={3} />)}
        {[80, 840].map((ry) => (
          <g key={ry}>
            <rect x={396} y={ry - 26} width={1128} height={52} rx={26} fill={C.parchDark} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M 420 ${ry - 8} L 1500 ${ry - 8}`} stroke={C.parchment} strokeWidth={6} strokeLinecap="round" />
            {[384, 1536].map((kx) => <circle key={kx} cx={kx} cy={ry} r={22} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />)}
          </g>
        ))}
        {/* 文字の行 (読めない飾り書き) */}
        <g stroke={C.brownInk} strokeWidth={5} strokeLinecap="round" opacity={0.55}>
          {[268, 296].map((ly, i) => <line key={ly} x1={560 + i * 20} y1={ly} x2={1360 - i * 40} y2={ly} strokeDasharray="34 8 18 8 46 8" />)}
          {[640, 668, 696].map((ly, i) => <line key={ly} x1={520} y1={ly} x2={i === 2 ? 820 : 1400} y2={ly} strokeDasharray="28 8 40 8 16 8" />)}
          {[640, 668, 696].map((ly) => <line key={`r${ly}`} x1={1100} y1={ly} x2={1400} y2={ly} strokeDasharray="20 8 30 8" opacity={0} />)}
        </g>
        {/* 飾り頭文字 */}
        <rect x={488} y={236} width={58} height={74} fill={C.illumBlue} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 500 296 L 517 250 L 534 296 M 506 280 L 528 280" stroke={C.illumGold} strokeWidth={6} fill="none" />

        {/* 絵の枠: 羽毛 (左) */}
        <rect x={540} y={330} width={380} height={280} rx={8} fill={C.feather} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`translate(730 470) rotate(${-24 + Math.sin(f / 8) * 4})`}>
          <path d="M 0 110 Q -70 20 -30 -80 Q 0 -130 30 -90 Q 70 10 0 110 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={130} x2={2} y2={-100} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i} stroke={C.featherShade} strokeWidth={3.5} strokeLinecap="round">
              <line x1={1} y1={80 - i * 30} x2={-34 + i * 2} y2={56 - i * 30} />
              <line x1={1} y1={80 - i * 30} x2={34 - i * 3} y2={58 - i * 30} />
            </g>
          ))}
        </g>
        {[[600, 380], [870, 560], [610, 560]].map(([dx, dy], i) => (
          <g key={i} transform={`translate(${dx} ${dy})`} stroke={C.featherShade} strokeWidth={3.5} strokeLinecap="round">
            {[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={0} y1={0} x2={Math.cos(k * 1.05) * 18} y2={Math.sin(k * 1.05) * 18} />)}
          </g>
        ))}
        {/* 絵の枠: 藁の束 (右) */}
        <rect x={1000} y={330} width={380} height={280} rx={8} fill={C.parchDark} stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(1190 470)">
          {Array.from({ length: 15 }, (_, i) => {
            const a = ((i - 7) / 7) * 0.5;
            return <line key={i} x1={Math.sin(a) * 30} y1={0} x2={Math.sin(a) * 150} y2={-Math.cos(a) * 110} stroke={i % 3 ? C.straw : C.strawDark} strokeWidth={7} strokeLinecap="round" />;
          })}
          {Array.from({ length: 15 }, (_, i) => {
            const a = ((i - 7) / 7) * 0.5;
            return <line key={i} x1={Math.sin(a) * 30} y1={0} x2={Math.sin(a) * 140} y2={Math.cos(a) * 110} stroke={i % 3 ? C.straw : C.strawDark} strokeWidth={7} strokeLinecap="round" />;
          })}
          <rect x={-46} y={-14} width={92} height={28} rx={8} fill={C.strawDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 120 60 L 150 40 L 166 70 L 136 86 Z" fill={C.rag} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <XMark x={1190} y={470} s={1.9} t={seg(f, 26, 32)} />

        {/* 封蝋 (王冠の紋) とリボン */}
        {sealOn && (
          <g transform={`translate(${SX} ${SY}) scale(${pop(seg(f, 14, 20)) * 0.25 + 0.75})`}>
            <path d={`M -16 20 L -52 ${96 + Math.sin(f / 6) * 5} L -26 88 M 16 20 L 48 ${100 + Math.sin(f / 6 + 1) * 5} L 22 90`} stroke={C.illumBlue} strokeWidth={16} strokeLinecap="round" fill="none" />
            <path d="M -66 4 Q -74 -40 -40 -60 Q 0 -78 40 -60 Q 78 -38 66 8 Q 50 50 0 52 Q -52 50 -66 4 Z" fill={C.wax} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={-4} r={40} fill="none" stroke={C.waxDark} strokeWidth={6} />
            <path d="M -24 12 L -28 -22 L -12 -6 L 0 -28 L 12 -6 L 28 -22 L 24 12 Z" fill={C.waxDark} />
            <path d="M -50 -36 Q -36 -52 -16 -54" fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          </g>
        )}
        {/* どーんの衝撃 */}
        {hit > 0 && hit < 1 && (
          <g opacity={1 - hit}>
            <ellipse cx={SX} cy={SY} rx={100 + hit * 200} ry={40 + hit * 80} fill="none" stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={SX + Math.cos(a) * (110 + hit * 60)} y1={SY + Math.sin(a) * (60 + hit * 30)} x2={SX + Math.cos(a) * (170 + hit * 110)} y2={SY + Math.sin(a) * (90 + hit * 60)} stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 真鍮の印章 (上から降りて押す) */}
        {stampY > -300 && (
          <g transform={`translate(${SX} ${stampY})`}>
            <ellipse cx={0} cy={0} rx={84} ry={22} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-84} y={-60} width={168} height={60} fill={YP.brass} stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={0} cy={-60} rx={84} ry={22} fill={YP.brass} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -40 -70 Q -46 -150 -24 -190 L 24 -190 Q 46 -150 40 -70 Z" fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={-214} r={40} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -60 -40 L 60 -40" stroke={YP.brassDark} strokeWidth={5} />
          </g>
        )}
      </g>
      <TagPlate x={960} y={210} text="1552年" size={58} t={seg(f, 2, 10)} fill={C.goldLight} />
    </Frame>
  );
};

// ---- 文#108 【山】 みんなが欲しがったからこそ、聖人は、それを拒んでみせたのです。
// 設計: 画面を左右に分けず、1つの中世の町の広場で: 羽毛ベッドを奪い合う人々の行列 (にぎやか) と、その横を静かに素通りする裸足のフランチェスコ (穏やかな顔)。対比
// どこ: 中世イタリアの町の広場 (しっくいの家並み・赤い瓦・バラ窓の教会と鐘楼・糸杉・石だたみ)。昼
// 演出: 奥の左に縞のひさしの羽毛ベッド屋 (丸めたベッドが山積み)。店の前に押し合う行列 (お金を振り上げる人・割りこむ人)。
//       奥の右では2人が1枚の羽毛ベッドを引っぱり合い、まん中が裂けて羽根がぶわっと舞う (事件)。
//       その手前の真ん中を、フランチェスコが手を合わせて裸足で静かに歩いて通りすぎる。舞ってきた羽根が目の前を落ちても見向きもしない。
//       行列の1人だけが、ふり返って不思議そうに見る。足もとにスズメ、うしろに裸足の足あと
// 動き: カメラがフランチェスコについて右へパン / フランチェスコ f0〜42 で歩く (足が交互に上がる) / f18〜30 ベッドが裂けて羽根が舞う / 羽根1枚が f20〜42 で彼の前へ落ちる / ？ f26〜 / 行列の人がゆれる
const Yw108: React.FC<{ f: number }> = ({ f }) => {
  const walk = seg(f, 0, 42);
  const FX = lerp(860, 990, walk), FY = 905, FS = 1.55;
  const dx = lerp(40, -50, easeInOut(walk));
  const z = 1.03;
  const tear = seg(f, 18, 30);
  const tug = Math.sin(f / 2.2) * 6;
  const drift = easeInOut(seg(f, 20, 42));
  const qm = seg(f, 26, 32);
  return (
    <Frame f={f} seed={3108} bg={C.sky}>
      <g transform={camT(960, 640, z, dx, 0)}>
        {/* 空 */}
        <rect x={-120} y={-60} width={W + 240} height={700} fill={C.sky} />
        <rect x={-120} y={300} width={W + 240} height={300} fill={C.skyLow} opacity={0.7} />
        {[[300, 120], [1500, 90]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx + Math.sin(f / 30 + i) * 10} ${cy})`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4}>
            <path d="M -90 20 Q -100 -20 -50 -20 Q -30 -56 10 -40 Q 50 -60 70 -20 Q 110 -16 96 20 Z" />
          </g>
        ))}
        {/* 家並み (しっくいと赤い瓦) */}
        {([[-100, 260, 300], [180, 320, 240], [400, 220, 280], [1140, 300, 260], [1380, 240, 260], [1620, 300, 300], [1900, 260, 200]] as const).map(([hx, hy, hw], i) => (
          <g key={i}>
            <rect x={hx} y={hy} width={hw} height={620 - hy} fill={i % 2 ? C.assisi : C.assisiDark} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M ${hx - 20} ${hy} L ${hx + hw / 2} ${hy - 60} L ${hx + hw + 20} ${hy} Z`} fill={C.roof} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            {[0, 1].map((r) => [0, 1].map((c) => (
              <path key={`${r}${c}`} d={`M ${hx + 50 + c * (hw - 130)} ${hy + 110 + r * 120} l 0 -40 q 15 -20 30 0 l 0 40 Z`} fill={C.roofDark} stroke={KRP.ink} strokeWidth={4} />
            )))}
          </g>
        ))}
        {/* 教会 (バラ窓と鐘楼) */}
        <g>
          <rect x={1060} y={60} width={110} height={560} fill={C.assisiDark} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1050 60 L 1115 -10 L 1180 60 Z" fill={C.roof} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1095 140 l 0 -40 q 20 -26 40 0 l 0 40 Z" fill={KRP.ink} opacity={0.7} />
          <path d={`M 1115 104 l 0 ${10 + Math.sin(f / 4) * 3}`} stroke={YP.brass} strokeWidth={10} strokeLinecap="round" />
          <rect x={700} y={200} width={380} height={420} fill={C.cellLight} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 690 200 L 890 90 L 1090 200 Z" fill={C.cellLight} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          <circle cx={890} cy={320} r={70} fill={C.cell} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={890} y1={320} x2={890 + Math.cos((i / 8) * Math.PI * 2) * 70} y2={320 + Math.sin((i / 8) * Math.PI * 2) * 70} stroke={KRP.ink} strokeWidth={4} />)}
          <circle cx={890} cy={320} r={20} fill={C.illumBlue} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 830 620 L 830 500 Q 890 430 950 500 L 950 620 Z" fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 糸杉 */}
        {[640, 1290].map((cx) => (
          <path key={cx} d={`M ${cx} 620 Q ${cx - 40} 480 ${cx + Math.sin(f / 14) * 4} 280 Q ${cx + 40} 480 ${cx} 620 Z`} fill={C.cypress} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 石だたみの広場 */}
        <rect x={-120} y={600} width={W + 240} height={520} fill={C.path} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 60 }, (_, i) => {
          const r = Math.floor(i / 12);
          return <ellipse key={i} cx={-80 + (i % 12) * 180 + (r % 2) * 90} cy={640 + r * 90} rx={60 + r * 6} ry={18 + r * 4} fill="none" stroke={C.pathDark} strokeWidth={4} />;
        })}

        {/* 羽毛ベッド屋 (縞のひさし) */}
        <g>
          {[120, 520].map((px) => <rect key={px} x={px - 8} y={400} width={16} height={240} fill={C.woodMid} stroke={KRP.ink} strokeWidth={4} />)}
          <path d={`M 90 400 L 550 400 L 560 ${460 + Math.sin(f / 8) * 3} L 80 ${460 + Math.sin(f / 8) * 3} Z`} fill={C.awning2} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${90 + i * 80} 400 L ${130 + i * 80} 400 L ${132 + i * 80} 460 L ${86 + i * 80} 460 Z`} fill={C.awning1} />)}
          <path d="M 80 460 Q 100 480 120 460 Q 140 480 160 460 Q 180 480 200 460 Q 220 480 240 460 Q 260 480 280 460 Q 300 480 320 460 Q 340 480 360 460 Q 380 480 400 460 Q 420 480 440 460 Q 460 480 480 460 Q 500 480 520 460 Q 540 480 560 460" fill="none" stroke={KRP.ink} strokeWidth={4} />
          {/* 店主 */}
          <L2dFig x={320} y={630} s={0.78} f={f} phase={2} p={{ face: "joy", cloth: C.tB, clothDark: C.tBDark, hair: "cap", pose: "hold" }} />
          <rect x={130} y={560} width={380} height={80} fill={C.woodMid} stroke={KRP.ink} strokeWidth={5} />
          {/* 山積みの丸めたベッド */}
          <L2dRolledBed x={185} y={532} w={96} r={28} f={f} />
          <L2dRolledBed x={455} y={532} w={96} r={28} f={f + 5} />
          <L2dRolledBed x={185} y={476} w={96} r={28} f={f + 9} />
        </g>
        {/* 行列 (押し合う) */}
        <L2dFig x={570} y={650} s={0.8} f={f} phase={4} lean={-8 + Math.sin(f / 3) * 2}
          p={{ face: "angry", cloth: C.tA, clothDark: C.tADark, hair: "cap", pose: "raise" }} />
        <L2dFig x={650} y={656} s={0.8} f={f} phase={7} lean={-6 + Math.sin(f / 2.6) * 3}
          p={{ face: "surprised", cloth: C.tC, clothDark: C.tCDark, hair: "none", pose: "point", pointDir: -1 }}>
          <L2dCoif />
        </L2dFig>
        <L2dFig x={730} y={660} s={0.8} f={f} phase={9} lean={qm > 0.5 ? 4 : -4}
          p={{ face: "normal", cloth: C.tunicOchre, clothDark: C.tunicOchreDark, hair: "none", gaze: qm > 0.5 ? [10, 4] : [-6, 0] }}>
          <L2dHood col={C.tunicOchre} dark={C.tunicOchreDark} />
        </L2dFig>
        <QMark x={790} y={400} s={0.6} f={f} t={qm} />

        {/* 引っぱり合い (右奥) */}
        <L2dFig x={1300 - tug * 0.3} y={662} s={0.86} f={f} phase={3} lean={-12}
          p={{ face: "angry", cloth: C.kid, clothDark: C.kidDark, hair: "cap", pose: "point", pointDir: 1 }} />
        <L2dFig x={1790 + tug * 0.3} y={662} s={0.86} f={f} phase={6} lean={12}
          p={{ face: "angry", cloth: C.mom, clothDark: C.momDark, hair: "none", pose: "point", pointDir: -1 }}>
          <L2dCoif />
        </L2dFig>
        {/* 引っぱられて伸びるベッド (まん中が裂ける) */}
        <g transform={`translate(${1545} ${528})`}>
          <path d={`M -130 -40 Q -60 ${-50 + tear * 10} 0 ${-30 + tear * 20} Q 60 ${-50 + tear * 10} 130 -40 Q 150 0 130 40 Q 60 ${50 - tear * 10} 0 ${30 - tear * 20} Q -60 ${50 - tear * 10} -130 40 Q -150 0 -130 -40 Z`}
            fill={C.tick} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          {[-100, -70, -40, 40, 70, 100].map((sx) => <line key={sx} x1={sx} y1={-34} x2={sx} y2={34} stroke={C.tickStripe} strokeWidth={4} opacity={0.5} />)}
          {tear > 0 && <path d={`M -8 ${-24 + tear * 14} L 6 -6 L -6 6 L 8 ${24 - tear * 14}`} fill="none" stroke={KRP.ink} strokeWidth={5} />}
        </g>
        {/* ぶわっと舞う羽根 */}
        {tear > 0 && Array.from({ length: 10 }, (_, i) => {
          const a = -Math.PI / 2 + (i - 4.5) * 0.32;
          const r = tear * (90 + rnd(1081, i) * 110);
          return <L2dFeather key={i} x={1545 + Math.cos(a) * r + Math.sin(f / 4 + i) * 6} y={528 + Math.sin(a) * r * 0.9 + tear * 20} s={0.8} r={f * 6 + i * 40} o={1 - tear * 0.2} />;
        })}

        {/* 足あと (裸足) */}
        {Array.from({ length: 5 }, (_, i) => {
          const px = FX - 90 - i * 70;
          return (
            <g key={i} opacity={0.5 - i * 0.08}>
              <ellipse cx={px} cy={918 + (i % 2) * 18} rx={22} ry={10} fill={C.pathDark} />
              {[0, 1, 2].map((t) => <circle key={t} cx={px + 18 + t * 5} cy={910 + (i % 2) * 18 + t * 2} r={3} fill={C.pathDark} />)}
            </g>
          );
        })}
        {/* フランチェスコ (手を合わせ、裸足で静かに素通り) */}
        <L2dFrancis x={FX} y={FY} s={FS} f={f} face="smile" pose="hold" gaze={[5, 1]} step={f / 3} />
        <path d={`M ${FX - 14} ${FY - 118 * FS - 4} L ${FX} ${FY - 150 * FS} L ${FX + 14} ${FY - 118 * FS - 4} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 目の前に落ちてくる羽根 (見向きもしない) */}
        <L2dFeather x={lerp(1500, FX + 190, drift) + Math.sin(f / 4) * 20} y={lerp(470, 760, drift)} s={1.3} r={Math.sin(f / 5) * 50} o={drift > 0 ? 1 : 0} />
        {/* スズメ */}
        <g transform={`translate(${FX + 220} ${905 - Math.abs(Math.sin(f / 3)) * 14})`}>
          <ellipse cx={0} cy={-22} rx={28} ry={20} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={22} cy={-40} r={14} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 34 -42 l 12 3 l -12 4 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={26} cy={-43} r={3} fill={KRP.ink} />
          <path d="M -26 -26 l -22 -6 l 6 14 Z" fill={C.woodMid} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -6 -2 l -4 10 M 6 -2 l 4 10" stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
    </Frame>
  );
};

// 凡例の下に敷く「羊皮紙を貼った板」(#109・#110 共通。中世)。凡例は x≈1220〜1565・y≈40〜710
const L2dLegendBoard: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={1178} y={14} width={430} height={736} rx={12} fill={C.woodMid} stroke={KRP.ink} strokeWidth={7} />
    <rect x={1178} y={14} width={430} height={20} rx={8} fill={C.woodLight} opacity={0.5} />
    <path d="M 1200 40 Q 1392 30 1586 42 L 1584 726 Q 1392 736 1202 724 Z" fill={C.parchment} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 1214 52 L 1572 54 L 1570 712 L 1216 710 Z" fill="none" stroke={C.parchDark} strokeWidth={3} strokeDasharray="16 8" />
    {[[1206, 34], [1580, 34], [1206, 730], [1580, 730]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={9} fill={C.iron} stroke={KRP.ink} strokeWidth={3} />)}
    <path d={`M 1586 600 q 14 ${10 + Math.sin(f / 10) * 3} 4 40`} fill="none" stroke={C.parchDark} strokeWidth={4} />
  </g>
);

// ---- 文#109 【山】 聖人の首の下からは、柔らかさが、取り上げられました。
// 設計: ★リキャップ③前半。`KaradaChizu` (lit={{ back: 1, neck: N }}、N は f6〜26 で 1→0)。首の光がふっと消える。背景は修道院の石の壁
// どこ: 修道院の石の壁の小部屋。細いアーチ窓 (青白い光)・窓辺のろうそく・壁の木釘に掛けた縄の帯 (結び目3つ = フランチェスコの印)・石の床
// 演出: からだの地図 (x=760, y=920, s=2.3)。凡例の下に羊皮紙を貼った板。首のうしろに羽毛の枕があり、首の光と重なっている。
//       首の光が消えていくのと一緒に、枕がすうっと右上へ抜き取られて消え、代わりに硬い石の枕が残る (事件)。
//       窓辺のろうそくも同時にふっと消えて煙。背中の光は灯ったまま
// 動き: N = f6〜26 で 1→0 / 枕が抜けて薄れる / 石の枕が出る / 首から細い煙 f22〜36 / ろうそく f18〜28 で消える / カメラが首へ少し寄る / 羽根が数枚落ちる
const Yw109: React.FC<{ f: number }> = ({ f }) => {
  const N = 1 - easeInOut(seg(f, 6, 26));
  const z = 1.0 + 0.04 * easeInOut(seg(f, 0, 42));
  const slide = 1 - N;
  const NX = 760, NY = 547;
  const smoke = seg(f, 22, 40);
  return (
    <Frame f={f} seed={3109} bg={C.cell}>
      <g transform={camT(NX, NY, z)}>
        {/* 石の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.cell} />
        <L2dBricks x0={-100} y0={-40} cols={12} rows={10} bw={180} bh={96} stroke={C.cellDark} />
        {/* 細いアーチ窓 */}
        <path d="M 130 540 L 130 240 Q 130 150 210 120 Q 290 150 290 240 L 290 540 Z" fill={C.cellDark} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 156 520 L 156 248 Q 156 176 210 150 Q 264 176 264 248 L 264 520 Z" fill={C.sky} stroke={KRP.ink} strokeWidth={5} />
        {[184, 236].map((bx) => <line key={bx} x1={bx} y1={160} x2={bx} y2={520} stroke={C.iron} strokeWidth={7} />)}
        <path d="M 156 520 L 264 520 L 520 900 L 60 900 Z" fill={C.sky} opacity={0.18} />
        <rect x={110} y={536} width={200} height={26} rx={4} fill={C.cellLight} stroke={KRP.ink} strokeWidth={5} />
        <L2dCandle x={250} y={536} s={0.8} f={f} h={90} out={seg(f, 18, 28)} />
        {/* 木釘に掛けた縄の帯 (結び目3つ) */}
        <g transform="translate(620 0)"><rect x={432} y={150} width={36} height={22} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 450 170 Q ${440 + Math.sin(f / 12) * 4} 300 ${452 + Math.sin(f / 12) * 6} 440`} fill="none" stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
        <path d={`M 450 170 Q ${440 + Math.sin(f / 12) * 4} 300 ${452 + Math.sin(f / 12) * 6} 440`} fill="none" stroke={C.rope} strokeWidth={7} strokeLinecap="round" />
        {[260, 330, 400].map((ky) => <circle key={ky} cx={446 + Math.sin(f / 12) * 5 * ((ky - 170) / 270)} cy={ky} r={10} fill={C.rope} stroke={KRP.ink} strokeWidth={3.5} />)}</g>
        {/* 石の床 */}
        <rect x={-60} y={880} width={W + 120} height={260} fill={C.cellDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 260} y1={880} x2={i * 260 - 60} y2={1080} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />)}

        <L2dLegendBoard f={f} />

        {/* 硬い石の枕 (残る) */}
        <g opacity={clamp01(slide * 1.4)}>
          <path d="M 520 650 L 540 560 L 980 556 L 1004 652 Z" fill={C.cellDark} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 560 600 l 30 -14 M 900 610 l 40 -10 M 700 630 l 20 -6" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        </g>
        {/* 羽毛の枕 (首の光と重なる。抜き取られて消える) */}
        {(
          <g opacity={0.45 + 0.55 * N} transform={`translate(${-slide * 400} ${-slide * 330}) rotate(${-slide * 16} 760 600) scale(1)`}>
            <L2dPillow x={760} y={660} w={540} h={150} f={f} />
          </g>
        )}
        {/* 抜き取られた跡 (点線) と、飛んでいく軌跡 */}
        {slide > 0.3 && (
          <g opacity={clamp01((slide - 0.3) * 2)}>
            <path d="M 500 640 Q 470 580 500 520 Q 760 480 1020 520 Q 1050 580 1020 640 Q 760 670 500 640 Z" fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="16 12" />
            {[0, 1, 2].map((i) => <path key={i} d={`M ${600 + i * 30} ${470 - i * 20} Q ${520 + i * 20} ${380 - i * 20} ${470 + i * 10} ${330 - i * 10}`} fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />)}
          </g>
        )}
        {/* 抜けた枕からこぼれる羽根 */}
        {slide > 0.05 && [0, 1, 2].map((i) => {
          const k = clamp01(slide * 1.3 - i * 0.15);
          return <L2dFeather key={i} x={300 + i * 90 + Math.sin(f / 5 + i) * 14} y={460 + k * 260} s={1.0} r={Math.sin(f / 4 + i) * 50} o={k > 0 ? 1 - k * 0.5 : 0} />;
        })}

        <KaradaChizu x={760} y={920} s={2.3} f={f} lit={{ back: 1, neck: N }} />
        {/* 首の光が消えたあとの細い煙 */}
        {smoke > 0 && smoke < 1 && [0, 1].map((i) => (
          <path key={i} d={`M ${NX - 20 + i * 40} ${NY - 10 - smoke * 30} q -14 -20 0 -40 q 14 -20 0 -40`} fill="none"
            stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={(1 - smoke) * 0.7} transform={`translate(${i * 30 - 15} ${-smoke * 40})`} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#110 【山】 それでも、人々の背中の下には、羽毛がありました。
// 設計: ★リキャップ③後半。同じ `KaradaChizu` (lit={{ back: 1 }}) で、背中の光がまだ温かく灯っている。背景を中世の町の寝室に変える (羽毛ベッドの柔らかい曲線を背中の光と重ねる)
// どこ: 中世の町家の寝室 (しっくいの壁に木組み・天井の梁・夜の町が見える窓・月)。干したハーブ・壁の釘のナイトキャップ・長持ちとろうそく
// 演出: からだの地図 (同じ x=760, y=920, s=2.3)、凡例の下は #109 と同じ羊皮紙の板。
//       人のうしろに、ぱんぱんの羽毛ベッドを載せた木の寝台。ベッドのふくらみの曲線がちょうど背中の光の座に重なり、
//       光が布団にしみこんで温かく灯り続ける。羽根がふわっと舞い上がる (事件)。首の座は点線の空き札のまま
// 動き: カメラがゆっくり引く / 布団が寝息のようにふくらむ / 背中の暖かい光がふくらむ f6〜24 / 羽根 f8〜 舞い上がる / ろうそく・月の星がまたたく
const Yw110: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.06 - 0.06 * easeInOut(seg(f, 0, 42));
  const warm = easeOut(seg(f, 6, 24));
  return (
    <Frame f={f} seed={3110} bg={C.plaster}>
      <g transform={camT(760, 640, z)}>
        {/* しっくいの壁と木組み */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.plaster} />
        <rect x={-60} y={-40} width={W + 120} height={90} fill={C.timber} stroke={KRP.ink} strokeWidth={7} />
        {[60, 1110, 1660].map((px) => <rect key={px} x={px} y={50} width={40} height={840} fill={C.timber} stroke={KRP.ink} strokeWidth={6} />)}
        <path d="M 100 420 L 400 60" stroke={C.timber} strokeWidth={34} />
        <path d="M 100 420 L 400 60" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        <rect x={-60} y={440} width={W + 120} height={32} fill={C.timber} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${180 + i * 150} ${100 + (i % 3) * 90} q 20 6 40 0`} stroke={C.plasterDark} strokeWidth={4} fill="none" />)}
        {/* 窓 (夜の町と月) */}
        <rect x={1660} y={140} width={240} height={280} fill={C.nightSky} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1840} cy={200} r={30} fill={C.moonBeam} />
        <path d="M 1660 420 L 1660 330 L 1700 300 L 1740 330 L 1740 360 L 1790 310 L 1840 360 L 1840 300 L 1860 280 L 1880 300 L 1900 300 L 1900 420 Z" fill={KRP.ink} opacity={0.7} />
        {[[1700, 340], [1800, 370]].map(([wx, wy], i) => <rect key={i} x={wx} y={wy} width={12} height={16} fill={C.flame} opacity={0.6 + Math.sin(f / 5 + i) * 0.3} />)}
        {[[1720, 190], [1780, 240]].map(([sx, sy], i) => <L2dSpark key={i} x={sx} y={sy} k={10 + Math.sin(f / 4 + i * 2) * 4} col={C.moonBeam} />)}
        <line x1={1780} y1={140} x2={1780} y2={420} stroke={C.timber} strokeWidth={8} />
        {/* 干したハーブと釘のナイトキャップ */}
        {[300, 360].map((hx, i) => (
          <g key={hx} transform={`rotate(${Math.sin(f / 14 + i) * 3} ${hx} 50)`}>
            <line x1={hx} y1={50} x2={hx} y2={110} stroke={C.woodDeep} strokeWidth={4} />
            <path d={`M ${hx} 110 l -20 70 M ${hx} 110 l 0 80 M ${hx} 110 l 20 70`} stroke={C.mom} strokeWidth={8} strokeLinecap="round" />
          </g>
        ))}
        <circle cx={940} cy={150} r={8} fill={C.timber} />
        <path d={`M 930 154 Q 900 220 920 270 Q 960 280 980 250 Q 1010 280 ${1020 + Math.sin(f / 9) * 4} 300`} fill={C.wimple} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 床 */}
        <rect x={-60} y={880} width={W + 120} height={260} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 4 }, (_, i) => <line key={i} x1={-60} y1={920 + i * 50} x2={W + 60} y2={920 + i * 50} stroke={C.woodDeep} strokeWidth={4} />)}
        {/* 長持ちとろうそく (左) */}
        <rect x={-20} y={760} width={180} height={130} rx={6} fill={C.woodDeep} stroke={KRP.ink} strokeWidth={6} />
        <rect x={50} y={800} width={40} height={30} rx={4} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
        <L2dCandle x={110} y={760} s={0.85} f={f} h={100} />

        <L2dLegendBoard f={f} />

        {/* 木の寝台と、ぱんぱんの羽毛ベッド (ふくらみが背中の光に重なる) */}
        <rect x={210} y={420} width={50} height={470} rx={8} fill={C.timber} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={235} cy={412} r={28} fill={C.timber} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1080} y={600} width={46} height={290} rx={8} fill={C.timber} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1103} cy={592} r={24} fill={C.timber} stroke={KRP.ink} strokeWidth={6} />
        <rect x={240} y={790} width={860} height={56} rx={6} fill={C.woodMid} stroke={KRP.ink} strokeWidth={6} />
        <L2dFeatherBed x={668} y={796} w={820} h={150} f={f} phase={2} />
        <L2dPillow x={360} y={652} w={210} h={92} f={f} />
        {/* 足もとにかけた継ぎはぎの布団 */}
        <path d={`M 900 ${648 - Math.sin(f / 10) * 3} Q 1010 630 1090 660 L 1090 800 Q 1000 812 900 800 Z`} fill={C.quiltRed} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 940 650 L 940 804 M 990 642 L 990 806 M 1040 646 L 1040 804 M 900 720 L 1090 724" stroke={C.quilt} strokeWidth={4} />
        {/* 温かい光が布団にしみる */}
        <ellipse cx={760} cy={690} rx={380 * (0.8 + 0.2 * warm)} ry={150 * (0.8 + 0.2 * warm)} fill={YP.glow} opacity={(0.16 + 0.06 * Math.sin(f / 8)) * (0.4 + 0.6 * warm)} />
        <path d={`M 360 ${650} Q 560 ${626 - Math.sin(f / 10) * 3} 760 ${640} Q 960 ${626 - Math.sin(f / 10) * 3} 1060 ${650}`} fill="none" stroke={YP.glowCore} strokeWidth={10} strokeLinecap="round" opacity={0.5 + 0.4 * warm} />
        {/* 舞い上がる羽根 */}
        {Array.from({ length: 6 }, (_, i) => {
          const k = seg(f, 8 + i * 4, 38 + Math.min(i, 1) * 4);
          if (k <= 0) return null;
          const bx = 380 + i * 130;
          return <L2dFeather key={i} x={bx + Math.sin(f / 6 + i) * 22} y={640 - k * (220 + rnd(1101, i) * 140)} s={0.9 + rnd(1102, i) * 0.4} r={Math.sin(f / 5 + i) * 45} o={1 - k * 0.4} />;
        })}

        <KaradaChizu x={760} y={920} s={2.3} f={f} lit={{ back: 1 }} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_102: (f) => <Yw102 f={f} />,
  yw_103: (f) => <Yw103 f={f} />,
  yw_104: (f) => <Yw104 f={f} />,
  yw_105: (f) => <Yw105 f={f} />,
  yw_106: (f) => <Yw106 f={f} />,
  yw_107: (f) => <Yw107 f={f} />,
  yw_108: (f) => <Yw108 f={f} />,
  yw_109: (f) => <Yw109 f={f} />,
  yw_110: (f) => <Yw110 f={f} />,
};

export const YW_D4_MOTIFS: string[] = [
  "yw_102",
  "yw_103",
  "yw_104",
  "yw_105",
  "yw_106",
  "yw_107",
  "yw_108",
  "yw_109",
  "yw_110",
];

export const yawaD4Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
