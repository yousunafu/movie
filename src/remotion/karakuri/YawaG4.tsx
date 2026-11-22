// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#221〜#233 (13文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-6.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで13枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L5d。
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
// 序・第1章と同じ物に見えるよう、YawaA / YawaAb / YawaB1b の色をそのまま写してある
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 机と巻物 (#221 = 序 #12 と同じ)
  desk: "#9C6B3F", deskDark: "#7A5230", washi: "#F3E7C9", washiDark: "#E3D2A8", washiEdge: "#C79A55",
  brocade: "#8E3B4A", brocadeGold: "#D9B85C", fog: "#B9B4AC", sumi: "#4A4038",
  bamboo: "#D8BE74", bambooDark: "#A88C42", chair: "#B07A48", chairDark: "#835733", curtain: "#9DC3A8",
  // 洞窟と火・草 (第1章と同じ)
  caveDark: "#2B231E", caveMid: "#463830", caveRock: "#6A5747", caveLight: "#8C7660", caveWarm: "#A3805C",
  fire: "#EE8A30", fireMid: "#F6B441", fireCore: "#FFE59A",
  stone: "#8E8478", stoneDark: "#6C6358",
  grass: "#C2AC63", grassDark: "#957F45", grassGreen: "#93A85E", straw: "#D9C485",
  // ローマ
  romeWall: "#B5523B", romeWallDark: "#8F3E2C", marble: "#EDE8DF", marbleDark: "#CFC6B8",
  purple: "#7A4E8C", gold: "#E2BD4A", toga: "#F6F1E6", togaDark: "#D8CFBE", laurel: "#7E9A4E",
  // 宋
  songNight: "#2F3A5C", songNightDark: "#232C47", lattice: "#6B4A2E", latticeLight: "#8A6440", moon: "#F6E7B0",
  indigo: "#3F4E7E", indigoDark: "#2C3860", hat: "#24201C", songWall: "#C9A574",
  // 子ザルと布の母 (序と同じ)
  towel: "#F2E9DA", towelDark: "#D9CBB2", monkey: "#9A6A44", monkeyDark: "#74502F", monkeyFace: "#F2C7A8",
  labWall: "#D7E6D2", labTile: "#BCD0B6",
  // 序の子ども・手 (YawaA と同じ)
  kidA: "#E49A6B", kidADark: "#B8714A", kidB: "#7BAFC9", kidBDark: "#56899F",
  skin: "#F2C9A8", skinDark: "#D9A47F", nail: "#F8E3D6",
  // 部屋
  room: "#EFE3C8", roomStripe: "#E4D3B0", rug: "#C98F6B", rugDark: "#A8714F", floorWood: "#B98B5E", floorWoodDark: "#94683F",
  nightRoom: "#3A4170", nightRoomDark: "#2A3058", nightSky: "#1F2547",
  lamp: "#FFC977", lampCore: "#FFE9B8", deskWood: "#B88A5A", deskWoodDark: "#8E643C", mug: "#E9E2D2",
  dusk: "#F3A867", duskDeep: "#D9774E", duskSky: "#F7C88A", sun: "#FFE08A", duskWall: "#E9B98C",
  bear: "#C8925E", bearDark: "#9C6C40", bearLight: "#E9C9A0",
  tvGlow: "#DCEBFA", tvBlue: "#9FC2E6", sofaBlue: "#6E7FA8", sofaBlueDark: "#56658A",
  shirt: "#F4F6F8", shirtDark: "#C9D0D8", tie: "#3D5A8A",
  blanket: "#D97A6C", blanketDark: "#B85E52",
  quilt: "#F2D9A6", quiltDark: "#D9B878", quiltDot: "#E7A65A",
  parent: "#8FAF8A", parentDark: "#6D8D68",
  heart: "#E8738A", remote: "#3B3A40", remoteBtn: "#C9473A",
  cushion: "#E6B85C", cushionDark: "#C4963E", lace: "#FBF6EC", sky: "#CFE6F4", plant: "#7FA35E",
} as const;
void W; void H; void FONT;
void PersonMini; void Stamp; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu; void AgeDial;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
const cam = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;
// 点 (lx,ly) を Person と同じ変換 (scale→rotate(lean)) で世界座標へ
const rotPt = (x: number, y: number, s: number, lean: number, lx: number, ly: number): [number, number] => {
  const a = (lean * Math.PI) / 180;
  return [x + (lx * Math.cos(a) - ly * Math.sin(a)) * s, y + (lx * Math.sin(a) + ly * Math.cos(a)) * s];
};
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";

// ===================================================================
// 序・第1章から写した部品 (同じ物に見えること)
// ===================================================================
// 20万年前の人 (第1章 YdNeander と同じ: 毛皮の服・太い眉・鼻)
const L5dNeander: React.FC<{
  x: number; y: number; s: number; f: number; face?: Face; pose?: Pose; lean?: number;
  phase?: number; gaze?: [number, number]; still?: boolean;
}> = ({ x, y, s, f, face = "normal", pose = "stand", lean = 0, phase = 0, gaze, still = false }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} phase={phase}
        gaze={gaze} still={still} cloth={YP.fur} clothDark={YP.furDark} hair="cap" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        <path d="M -46 -158 Q -6 -118 44 -60" fill="none" stroke={YP.furDark} strokeWidth={6} strokeLinecap="round" />
        <path d="M -56 -64 L -44 -52 L -30 -64 L -16 -52 L -2 -64 L 12 -52 L 26 -64 L 40 -52 L 56 -64"
          fill="none" stroke={YP.furDark} strokeWidth={5} strokeLinejoin="round" />
        <g fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round">
          <path d="M -42 -243 Q -24 -257 -6 -247" />
          <path d="M 6 -247 Q 24 -257 42 -243" />
        </g>
        <path d="M -3 -212 Q -11 -199 1 -197 Q 9 -198 8 -205" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

// 焚き火 (第1章 YdFire と同じ)。y は地面
const L5dFire: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const fl = (k: number) => 1 + Math.sin(f / 2.3 + k * 1.7) * 0.12 + Math.sin(f / 3.7 + k) * 0.08;
  const flame = (h: number, w: number, sw: number) =>
    `M ${-w} 0 C ${-w} ${-h * 0.35} ${-w * 0.3 + sw} ${-h * 0.6} ${sw} ${-h} C ${w * 0.3 + sw} ${-h * 0.6} ${w} ${-h * 0.35} ${w} 0 Z`;
  const H0 = 200;
  const sw = Math.sin(f / 3) * 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-90, -40, 20, 80].map((dx, i) => (
        <ellipse key={i} cx={dx} cy={-14} rx={34} ry={20} fill={C.stoneDark} stroke={C.ink} strokeWidth={5} />
      ))}
      <rect x={-110} y={-30} width={220} height={28} rx={14} fill={YP.wood} stroke={C.ink} strokeWidth={5} transform="rotate(-14)" />
      <rect x={-110} y={-30} width={220} height={28} rx={14} fill={YP.woodDark} stroke={C.ink} strokeWidth={5} transform="rotate(16)" />
      <path d={flame(H0 * 0.62 * fl(2), 40, -46 + sw * 0.6)} fill={C.fire} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={flame(H0 * 0.58 * fl(3), 38, 44 + sw * 0.6)} fill={C.fire} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={flame(H0 * fl(0), 78, sw)} fill={C.fire} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={flame(H0 * 0.7 * fl(1), 54, sw * 0.7)} fill={C.fireMid} />
      <path d={flame(H0 * 0.4 * fl(4), 30, sw * 0.4)} fill={C.fireCore} />
      {Array.from({ length: 6 }, (_, i) => {
        const p = ((f + i * 9) % 40) / 40;
        return (
          <circle key={i} cx={(rnd(77, i) - 0.5) * 120 + Math.sin(f / 4 + i) * 14} cy={-60 - p * 260}
            r={5 - p * 3} fill={C.fireCore} opacity={1 - p} />
        );
      })}
      {[-120, -60, 0, 62, 122].map((dx, i) => (
        <ellipse key={i} cx={dx} cy={4} rx={36} ry={22} fill={i % 2 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={5} />
      ))}
    </g>
  );
};

// 明かり (半透明の輪を重ねる)
const L5dGlow: React.FC<{ x: number; y: number; r: number; f: number; op?: number; color?: string }> = ({ x, y, r, f, op = 0.22, color = C.fire }) => {
  const k = 1 + Math.sin(f / 2.7) * 0.04 + Math.sin(f / 4.3) * 0.03;
  return (
    <g>
      {[1, 0.72, 0.45].map((m, i) => (
        <circle key={i} cx={x} cy={y} r={r * m * k} fill={color} opacity={op * (0.5 + i * 0.25)} />
      ))}
    </g>
  );
};

// 草の繊維 (第1章 YdStraws と同じ)
const L5dStraws: React.FC<{ seed: number; n: number; x: number; y: number; w: number; h: number; f: number; len?: number; tilt?: number; sw?: number }> = ({ seed, n, x, y, w, h, f, len = 220, tilt = 0.25, sw = 1 }) => {
  const cols = [C.straw, C.grass, C.grassDark, C.grassGreen];
  return (
    <g strokeLinecap="round" fill="none">
      {Array.from({ length: n }, (_, i) => {
        const sx = x + rnd(seed, i) * w;
        const sy = y + rnd(seed + 1, i) * h;
        const L = len * (0.6 + rnd(seed + 2, i) * 0.6);
        const dir = rnd(seed + 3, i) < 0.5 ? -1 : 1;
        const dy = (rnd(seed + 4, i) - 0.5) * L * tilt;
        const bend = (rnd(seed + 5, i) - 0.5) * 50 + Math.sin(f / 14 + i) * 4;
        const d = `M ${sx} ${sy} q ${dir * L * 0.5} ${dy * 0.5 + bend} ${dir * L} ${dy}`;
        return (
          <g key={i}>
            <path d={d} stroke={C.ink} strokeWidth={9 * sw} opacity={0.55} />
            <path d={d} stroke={cols[i % 4]} strokeWidth={6 * sw} />
          </g>
        );
      })}
    </g>
  );
};

// ===================================================================
// 時代ごとの「抱っこの代わり」(#221 の小さな絵・#222〜#226 の幻影・#227 の行列で同じ物を使う)
// ===================================================================
// 草の束 (中央でひもで結んだ一握り)。原点 = 束の中心。squeeze で握られて細くなる
const L5dGrassBundle: React.FC<{ x: number; y: number; s?: number; f: number; squeeze?: number; rot?: number }> = ({ x, y, s = 1, f, squeeze = 0, rot = 0 }) => {
  const k = 1 - clamp01(squeeze) * 0.3;
  const cols = [C.straw, C.grass, C.grassDark, C.grassGreen];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinecap="round" fill="none">
      {Array.from({ length: 15 }, (_, i) => {
        const dx = (i - 7) * 5;
        const sway = Math.sin(f / 11 + i) * 3;
        const top = `M ${dx * k} 0 Q ${dx * 1.4} -60 ${dx * 2.4 + sway + (rnd(91, i) - 0.5) * 20} ${-110 - rnd(92, i) * 30}`;
        const bot = `M ${dx * k} 0 Q ${dx * 1.3} 50 ${dx * 1.9 + (rnd(93, i) - 0.5) * 14} ${90 + rnd(94, i) * 20}`;
        return (
          <g key={i}>
            <path d={top} stroke={C.ink} strokeWidth={9} opacity={0.6} />
            <path d={top} stroke={cols[i % 4]} strokeWidth={6} />
            <path d={bot} stroke={C.ink} strokeWidth={9} opacity={0.6} />
            <path d={bot} stroke={cols[(i + 2) % 4]} strokeWidth={6} />
          </g>
        );
      })}
      {/* 結びひも */}
      <rect x={-30 * k} y={-10} width={60 * k} height={20} rx={8} fill={YP.furDark} stroke={C.ink} strokeWidth={4} />
      <path d={`M ${28 * k} 4 q 18 10 10 30`} stroke={YP.furDark} strokeWidth={5} />
    </g>
  );
};

// 羽根1枚
const L5dFeather: React.FC<{ x: number; y: number; s?: number; rot?: number; op?: number }> = ({ x, y, s = 1, rot = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <path d="M 0 30 Q -18 0 -4 -34 Q 12 -6 0 30 Z" fill={KRP.white} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M 0 36 Q -2 0 -4 -30" stroke={C.marbleDark} strokeWidth={2.5} fill="none" />
    <path d="M -8 -4 l -6 -6 M -6 10 l -7 -5" stroke={C.marbleDark} strokeWidth={2} fill="none" />
  </g>
);

// ローマの羽毛の枕 (白い麻・紫の帯・金の房)。原点 = 中心、幅 約240
const L5dPillowRome: React.FC<{ x: number; y: number; s?: number; rot?: number; squash?: number }> = ({ x, y, s = 1, rot = 0, squash = 0 }) => {
  const q = clamp01(squash);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1 + q * 0.08)} ${s * (1 - q * 0.12)})`}>
      <L5dFeather x={-50} y={-70} s={0.8} rot={-20} />
      <L5dFeather x={60} y={-72} s={0.7} rot={24} />
      <path d="M -112 -52 Q -128 -74 -92 -68 Q 0 -86 92 -68 Q 128 -74 112 -52 Q 126 0 112 52 Q 128 74 92 68 Q 0 86 -92 68 Q -128 74 -112 52 Q -126 0 -112 -52 Z"
        fill={C.marble} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -116 -14 Q 0 -24 116 -14 L 116 14 Q 0 4 -116 14 Z" fill={C.purple} opacity={0.85} />
      <path d="M -116 -14 Q 0 -24 116 -14 M -116 14 Q 0 4 116 14" stroke={C.gold} strokeWidth={4} fill="none" />
      <path d="M -60 -50 q 30 14 60 0 M 10 44 q 30 12 60 0" stroke={C.marbleDark} strokeWidth={3.5} fill="none" />
      {[[-114, -60], [114, -60], [-114, 60], [114, 60]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={9} fill={C.gold} stroke={C.ink} strokeWidth={3} />
          <path d={`M ${cx} ${cy + 6} l ${cx > 0 ? 8 : -8} 20 M ${cx} ${cy + 6} l 0 22`} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

// 竹夫人 (竹を編んだ筒の抱き枕)。原点 = 中心、長さ 約260
const L5dChikuFujin: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-130} y={-40} width={260} height={80} rx={40} fill={C.bamboo} stroke={C.ink} strokeWidth={5} />
    {/* 編み目 (ななめのひご) */}
    <g stroke={C.bambooDark} strokeWidth={3.5} opacity={0.8}>
      {Array.from({ length: 9 }, (_, i) => (
        <React.Fragment key={i}>
          <line x1={-100 + i * 24} y1={-36} x2={-76 + i * 24} y2={36} />
          <line x1={-76 + i * 24} y1={-36} x2={-100 + i * 24} y2={36} />
        </React.Fragment>
      ))}
    </g>
    {/* 編み目のすき間 */}
    {Array.from({ length: 8 }, (_, i) => (
      [-18, 18].map((cy, j) => (
        <ellipse key={`${i}-${j}`} cx={-76 + i * 24 + (j ? 12 : 0) - 6} cy={cy} rx={6} ry={5} fill={C.lattice} opacity={0.75} />
      ))
    ))}
    {/* 両端の口と帯 */}
    <rect x={-124} y={-36} width={22} height={72} rx={11} fill={C.bambooDark} stroke={C.ink} strokeWidth={4} />
    <rect x={102} y={-36} width={22} height={72} rx={11} fill={C.bambooDark} stroke={C.ink} strokeWidth={4} />
    <path d="M -80 -28 Q 0 -38 80 -28" stroke={KRP.white} strokeWidth={6} opacity={0.45} fill="none" strokeLinecap="round" />
  </g>
);

// 子ザルと布の母 (タオル地の筒・丸い顔の母と、大きな丸い目の子ザル)。原点 = 台の底
const L5dClothMother: React.FC<{ x: number; y: number; s?: number; f: number; gaze?: number }> = ({ x, y, s = 1, f, gaze = 0 }) => {
  const br = 1 + Math.sin(f / 9) * 0.02;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 台 */}
      <rect x={-100} y={-18} width={200} height={18} rx={6} fill={YP.wood} stroke={C.ink} strokeWidth={5} />
      <g transform="rotate(-6 0 -18)">
        {/* 布の母の胴 (タオル地) */}
        <rect x={-60} y={-270} width={120} height={256} rx={46} fill={C.towel} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={-44 + (i % 5) * 22 + (Math.floor(i / 5) % 2) * 11} cy={-246 + Math.floor(i / 5) * 40}
            r={4} fill="none" stroke={C.towelDark} strokeWidth={2.5} />
        ))}
        {/* 丸い顔 */}
        <circle cx={0} cy={-312} r={52} fill={C.washi} stroke={C.ink} strokeWidth={6} />
        <circle cx={-20} cy={-318} r={11} fill={C.ink} />
        <circle cx={20} cy={-318} r={11} fill={C.ink} />
        <circle cx={-17} cy={-321} r={3.5} fill={KRP.white} />
        <circle cx={23} cy={-321} r={3.5} fill={KRP.white} />
        <path d="M -14 -290 Q 0 -280 14 -290" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={-40} cy={-354} rx={14} ry={10} fill={C.washiDark} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={40} cy={-354} rx={14} ry={10} fill={C.washiDark} stroke={C.ink} strokeWidth={4} />
        {/* 子ザル (胴にしがみつく) */}
        <g transform={`translate(4 -150) scale(${br})`}>
          <path d="M 30 50 q 50 10 40 -30 q -8 -20 -20 -6" stroke={C.monkeyDark} strokeWidth={8} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={10} rx={42} ry={54} fill={C.monkey} stroke={C.ink} strokeWidth={5} />
          {/* 腕 (母に回す) */}
          <path d="M -36 -10 Q -76 10 -58 50" stroke={C.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M -36 -10 Q -76 10 -58 50" stroke={C.monkey} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M 36 -10 Q 70 14 52 52" stroke={C.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M 36 -10 Q 70 14 52 52" stroke={C.monkey} strokeWidth={14} fill="none" strokeLinecap="round" />
          {/* 頭 */}
          <circle cx={-28} cy={-66} r={14} fill={C.monkeyFace} stroke={C.ink} strokeWidth={4} />
          <circle cx={28} cy={-66} r={14} fill={C.monkeyFace} stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={-62} r={36} fill={C.monkey} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-56} rx={27} ry={24} fill={C.monkeyFace} />
          {/* 大きな丸い目 */}
          <circle cx={-12} cy={-64} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          <circle cx={12} cy={-64} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          <circle cx={-12 + gaze} cy={-63} r={6.5} fill={C.ink} />
          <circle cx={12 + gaze} cy={-63} r={6.5} fill={C.ink} />
          <circle cx={-10 + gaze} cy={-66} r={2.2} fill={KRP.white} />
          <circle cx={14 + gaze} cy={-66} r={2.2} fill={KRP.white} />
          <path d="M -6 -44 Q 0 -40 6 -44" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

// ぬいぐるみのくま。原点 = 中心 (高さ 約220)
const L5dBear: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle cx={-36} cy={-80} r={18} fill={C.bear} stroke={C.ink} strokeWidth={5} />
    <circle cx={36} cy={-80} r={18} fill={C.bear} stroke={C.ink} strokeWidth={5} />
    <circle cx={-36} cy={-80} r={8} fill={C.bearLight} />
    <circle cx={36} cy={-80} r={8} fill={C.bearLight} />
    <ellipse cx={0} cy={42} rx={56} ry={58} fill={C.bear} stroke={C.ink} strokeWidth={5} />
    <ellipse cx={0} cy={50} rx={30} ry={34} fill={C.bearLight} />
    <ellipse cx={-34} cy={96} rx={22} ry={16} fill={C.bear} stroke={C.ink} strokeWidth={5} />
    <ellipse cx={34} cy={96} rx={22} ry={16} fill={C.bear} stroke={C.ink} strokeWidth={5} />
    <circle cx={0} cy={-40} r={50} fill={C.bear} stroke={C.ink} strokeWidth={5} />
    <ellipse cx={0} cy={-26} rx={22} ry={16} fill={C.bearLight} stroke={C.ink} strokeWidth={3} />
    <ellipse cx={0} cy={-32} rx={8} ry={6} fill={C.ink} />
    <circle cx={-18} cy={-50} r={6} fill={C.ink} />
    <circle cx={18} cy={-50} r={6} fill={C.ink} />
    <path d="M 0 -26 l 0 8 M -8 -16 q 8 6 16 0" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M -46 30 q 14 6 22 -4 M 46 30 q -14 6 -22 -4" stroke={C.bearDark} strokeWidth={4} fill="none" />
    <path d="M 0 -4 l 0 90" stroke={C.bearDark} strokeWidth={3} strokeDasharray="6 6" />
  </g>
);

// 大きな手 (序の YaHand と同じ。指先が -x 方向、袖は +x 側)。open: 0=にぎり 1=開く
const L5dHand: React.FC<{ x: number; y: number; s?: number; rot?: number; sleeve?: string; open?: number }> = ({
  x, y, s = 1, rot = 0, sleeve = C.kidA, open = 1,
}) => {
  const spread = lerp(2, 9, open);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={70} y={-70} width={420} height={140} rx={30} fill={sleeve} stroke={C.ink} strokeWidth={6} />
      <rect x={62} y={-76} width={46} height={152} rx={16} fill={sleeve} stroke={C.ink} strokeWidth={6} />
      <path d="M 180 -60 Q 200 0 180 60" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.35} />
      {[-42, -14, 14, 40].map((dy, i) => {
        const len = [92, 108, 104, 84][i];
        return (
          <g key={i} transform={`rotate(${(i - 1.5) * spread} 0 ${dy})`}>
            <rect x={-len - 20} y={dy - 13} width={len + 40} height={26} rx={13} fill={C.skin} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={-len - 4} cy={dy} rx={11} ry={8} fill={C.nail} stroke={C.ink} strokeWidth={2.5} />
            <path d={`M ${-len * 0.45} ${dy - 9} q 4 9 0 18`} fill="none" stroke={C.skinDark} strokeWidth={3} />
          </g>
        );
      })}
      <path d="M -40 -58 Q 40 -70 76 -44 L 76 50 Q 30 70 -40 56 Q -56 0 -40 -58 Z" fill={C.skin} stroke={C.ink} strokeWidth={6} />
      <g transform={`rotate(${lerp(10, -22, open)} 40 -50)`}>
        <rect x={-24} y={-104} width={30} height={78} rx={15} fill={C.skin} stroke={C.ink} strokeWidth={5}
          transform="rotate(-38 -9 -65)" />
      </g>
      <path d="M 0 -20 Q 24 -6 46 -16" fill="none" stroke={C.skinDark} strokeWidth={3} />
    </g>
  );
};

// ハート (小)
const L5dHeart: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string }> = ({ x, y, s = 1, t = 1, color = C.heart }) => {
  const k = pop(clamp01(t));
  if (k <= 0) return null;
  return (
    <path transform={`translate(${x} ${y}) scale(${s * k})`}
      d="M 0 18 C -30 -4 -26 -28 -12 -28 C -4 -28 0 -20 0 -16 C 0 -20 4 -28 12 -28 C 26 -28 30 -4 0 18 Z"
      fill={color} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
  );
};

// きらめき (4方向の星)
const L5dSpark: React.FC<{ x: number; y: number; r: number; op?: number; rot?: number; color?: string }> = ({ x, y, r, op = 1, rot = 0, color = YP.glowCore }) => (
  <path transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}
    d={`M 0 ${-r} Q ${r * 0.16} ${-r * 0.16} ${r} 0 Q ${r * 0.16} ${r * 0.16} 0 ${r} Q ${-r * 0.16} ${r * 0.16} ${-r} 0 Q ${-r * 0.16} ${-r * 0.16} 0 ${-r} Z`}
    fill={color} stroke={C.ink} strokeWidth={3} />
);

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#221 【山】 でも、20万年の歴史を並べてみると、ひとつの線が見えてきます。
// 設計: 序 #12 と同じ机の上の絵巻物が、今度は左端までぜんぶ開いている。20万年前の草の寝床 → 白鳥・布人形 → ローマの羽毛 → 修道院の枕 → 竹夫人 → 子ザルと布の母 → 毛布 → ヨギボー → スクイーズ、の小さな絵が並び、それを1本の金色の線が f で左から右へつないでいく
// どこ: 序 #12 と同じ机 (木目・硯と筆・湯のみ・文鎮・錦の表紙と紐)。巻物は左端の芯まで全部ひらいている。虫めがねが置いてある
// 演出: 和紙の上に9つの小さな絵。金色の線が左の草の寝床から走り出し、1つ通るたびにその絵がぽっと金色に灯る。最後にスクイーズに届いてきらめく
// 動き: f4〜38 金の線が左→右へ伸びる (先頭に光の玉) / 灯るたびに絵が弾む / f36〜 スクイーズにきらめき / 湯気・紐・霧がゆれる / カメラは左寄り(z1.12)→全体(z1)へ引きながらパン
const L5D_221_X = [235, 410, 585, 760, 935, 1110, 1285, 1460, 1630];
const L5d221Mini: React.FC<{ k: number; f: number }> = ({ k, f }) => {
  switch (k) {
    case 0: // 20万年前の草の寝床
      return (
        <g>
          <ellipse cx={0} cy={-26} rx={74} ry={28} fill={C.grass} stroke={C.ink} strokeWidth={5} />
          <L5dStraws seed={2211} n={12} x={-64} y={-46} w={128} h={30} f={f} len={50} tilt={0.3} sw={0.7} />
          <g transform="translate(-60 -60) scale(0.3)"><L5dFire x={0} y={0} f={f} /></g>
        </g>
      );
    case 1: // 白鳥と布人形
      return (
        <g>
          <ellipse cx={-20} cy={-34} rx={46} ry={26} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d="M 14 -46 Q 34 -80 18 -104 Q 6 -118 -6 -104" fill="none" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
          <path d="M 14 -46 Q 34 -80 18 -104 Q 6 -118 -6 -104" fill="none" stroke={KRP.white} strokeWidth={8} strokeLinecap="round" />
          <path d="M -8 -106 l -14 4 l 12 6 Z" fill={KRP.orange} stroke={C.ink} strokeWidth={3} />
          <path d="M -50 -40 q 20 -14 40 0" stroke={C.marbleDark} strokeWidth={3} fill="none" />
          <g transform="translate(52 -8)">
            <path d="M -22 0 L -12 -46 L 12 -46 L 22 0 Z" fill={C.washiDark} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
            <circle cx={0} cy={-60} r={16} fill={C.washiDark} stroke={C.ink} strokeWidth={4} />
            <path d="M -12 -30 l -14 10 M 12 -30 l 14 10" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
      );
    case 2: // ローマの羽毛の枕
      return <L5dPillowRome x={0} y={-46} s={0.56} />;
    case 3: // 修道院の枕 (石のアーチ窓と木の寝台)
      return (
        <g>
          <path d="M -46 -60 L -46 -128 Q 0 -170 46 -128 L 46 -60 Z" fill={C.stone} stroke={C.ink} strokeWidth={5} />
          <path d="M -26 -66 L -26 -122 Q 0 -146 26 -122 L 26 -66 Z" fill={C.sky} stroke={C.ink} strokeWidth={4} />
          <rect x={-74} y={-30} width={148} height={20} rx={4} fill={YP.wood} stroke={C.ink} strokeWidth={4} />
          <rect x={-66} y={-12} width={12} height={12} fill={YP.woodDark} stroke={C.ink} strokeWidth={3} />
          <rect x={54} y={-12} width={12} height={12} fill={YP.woodDark} stroke={C.ink} strokeWidth={3} />
          <rect x={-66} y={-56} width={64} height={28} rx={12} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <path d="M -40 -50 q 10 6 20 0" stroke={C.marbleDark} strokeWidth={3} fill="none" />
        </g>
      );
    case 4: // 竹夫人
      return <L5dChikuFujin x={0} y={-36} s={0.55} rot={-8} />;
    case 5: // 子ザルと布の母
      return <L5dClothMother x={0} y={0} s={0.42} f={f} />;
    case 6: // 毛布 (たたんで重ねた)
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={-66 + i * 4} y={-28 - i * 30} width={132 - i * 8} height={30} rx={12}
                fill={i === 1 ? C.kidB : C.blanket} stroke={C.ink} strokeWidth={4.5} />
              {[-40, -10, 20, 50].map((dx) => (
                <line key={dx} x1={dx - i * 2} y1={-26 - i * 30} x2={dx - i * 2} y2={-2 - i * 30} stroke={i === 1 ? C.kidBDark : C.blanketDark} strokeWidth={3} />
              ))}
            </g>
          ))}
          <path d="M 60 -60 q 14 20 0 34" stroke={C.ink} strokeWidth={4} fill="none" />
        </g>
      );
    case 7: // ヨギボー型の大きな袋 (ロゴなし)
      return (
        <g>
          <path d="M -70 -4 Q -84 -96 -20 -122 Q 50 -136 70 -70 Q 82 -20 66 -4 Q 0 8 -70 -4 Z" fill={YP.sofa} stroke={C.ink} strokeWidth={5} />
          <path d="M -50 -40 Q 0 -10 50 -44" stroke={YP.sofaSeam} strokeWidth={4} fill="none" strokeDasharray="10 8" />
          <ellipse cx={0} cy={-46} rx={40} ry={18} fill={YP.sofaDark} opacity={0.6} />
        </g>
      );
    default: // スクイーズ (2026年のシリコン製)
      return <Squishy x={0} y={-6} s={0.46} f={f} />;
  }
};
const Yw221: React.FC<{ f: number }> = ({ f }) => {
  const PT = 270, PB = 770, Lx = 110, rr = 44;
  const cm = easeInOut(seg(f, 0, 40));
  const prog = easeInOut(seg(f, 4, 38));
  const n = L5D_221_X.length;
  const pts = L5D_221_X.map((x, i) => [x, 430 + (i % 2 ? 22 : -14)] as [number, number]);
  let d = `M ${pts[0][0] - 60} ${pts[0][1] + 20}`;
  pts.forEach(([x, y], i) => {
    const px = i === 0 ? pts[0][0] - 60 : pts[i - 1][0];
    d += ` Q ${(px + x) / 2} ${y + (i % 2 ? 44 : -44)} ${x} ${y}`;
  });
  const pos = prog * (n - 1);
  const ti = Math.min(n - 2, Math.floor(pos));
  const tip: [number, number] = [lerp(pts[ti][0], pts[ti + 1][0], pos - ti), lerp(pts[ti][1], pts[ti + 1][1], pos - ti)];
  const litOf = (i: number) => clamp01((pos - i + 0.35) / 0.35);
  const last = seg(f, 36, 42);
  return (
    <Frame f={f} seed={3221} bg={C.desk}>
      <g transform={`translate(960 540) scale(${lerp(1.12, 1, cm)}) translate(${-lerp(640, 960, cm)} ${-540})`}>
        {/* 机 (木目) */}
        <rect x={-300} y={-200} width={2500} height={1500} fill={C.desk} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -300 ${-60 + i * 150} q 600 ${rnd(12, i) * 40 - 20} 1250 0 q 600 ${rnd(13, i) * 40 - 20} 1250 0`}
            stroke={C.deskDark} strokeWidth={5} opacity={0.5} fill="none" />
        ))}
        {/* 硯と筆 */}
        <g transform="translate(260 900)">
          <rect x={-120} y={-60} width={240} height={120} rx={20} fill={C.sumi} stroke={C.ink} strokeWidth={6} />
          <ellipse cx={-40} cy={0} rx={60} ry={38} fill={C.ink} />
          <ellipse cx={-52} cy={-10} rx={16} ry={6} fill={KRP.gray} opacity={0.4} />
        </g>
        <g transform="rotate(-8 700 900)">
          <rect x={520} y={880} width={300} height={18} rx={8} fill={C.bamboo} stroke={C.ink} strokeWidth={5} />
          <path d="M 820 874 Q 880 889 820 904 Z" fill={C.ink} />
        </g>
        {/* 虫めがね */}
        <g transform="translate(1180 905) rotate(-18)">
          <rect x={60} y={-14} width={200} height={28} rx={12} fill={C.chairDark} stroke={C.ink} strokeWidth={5} />
          <circle r={70} fill={C.sky} opacity={0.5} stroke={C.ink} strokeWidth={8} />
          <path d="M -40 -30 q 20 -24 50 -24" stroke={KRP.white} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
        </g>
        {/* 湯のみ */}
        <g transform="translate(1830 180)">
          <path d="M -60 -50 L 60 -50 L 48 50 Q 0 64 -48 50 Z" fill={C.washiEdge} stroke={C.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-50} rx={60} ry={14} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-20 + i * 20} -76 q ${-10 + Math.sin(f / 6 + i) * 6} -20 0 -40`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />
          ))}
        </g>
        {/* 紙の影と紙 */}
        <rect x={Lx} y={PT + 14} width={1760 - Lx} height={PB - PT} fill={C.ink} opacity={0.18} />
        <rect x={Lx} y={PT} width={1740 - Lx} height={PB - PT} fill={C.washi} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 80 }, (_, i) => (
          <path key={i} d={`M ${160 + rnd(1, i) * 1540} ${PT + 50 + rnd(2, i) * 400} q 10 ${rnd(3, i) * 8 - 4} 24 0`}
            stroke={C.washiDark} strokeWidth={3} fill="none" />
        ))}
        {[PT, PB - 34].map((by) => (
          <g key={by}>
            <rect x={Lx + 4} y={by + 3} width={1740 - Lx - 8} height={31} fill={C.washiEdge} opacity={0.55} />
            {Array.from({ length: 40 }, (_, i) => (
              <path key={i} d={`M ${150 + i * 40} ${by + 18} l 12 -10 l 12 10 l -12 10 Z`} fill={C.brocade} opacity={0.55} />
            ))}
          </g>
        ))}
        {/* 年代の目盛り */}
        <line x1={150} y1={690} x2={1700} y2={690} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 28 }, (_, i) => {
          const tx = 1690 - i * 56;
          const long = i % 5 === 0;
          return <line key={i} x1={tx} y1={690} x2={tx} y2={long ? 650 : 668} stroke={C.ink} strokeWidth={long ? 6 : 4} />;
        })}
        {/* 9つの小さな絵 (灯ると金の光が後ろに出て、ぽんと弾む) */}
        {L5D_221_X.map((x, i) => {
          const L = litOf(i);
          const b = L > 0 && L < 1 ? Math.sin(L * Math.PI) * 0.12 : 0;
          return (
            <g key={i}>
              {L > 0 && <ellipse cx={x} cy={580} rx={84} ry={84} fill={YP.glow} opacity={0.35 * L} />}
              <g transform={`translate(${x} 640) scale(${1 + b})`}><L5d221Mini k={i} f={f} /></g>
            </g>
          );
        })}
        {/* 金色の1本の線 (左から右へ伸びる) */}
        <path d={d} fill="none" stroke={YP.glow} strokeWidth={30} opacity={0.35} strokeLinecap="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} />
        <path d={d} fill="none" stroke={C.ink} strokeWidth={13} strokeLinecap="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} />
        <path d={d} fill="none" stroke={C.gold} strokeWidth={8} strokeLinecap="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} />
        {/* 線の結び目 (各絵の上) */}
        {pts.map(([x, y], i) => litOf(i) > 0.5 && (
          <circle key={i} cx={x} cy={y} r={11} fill={YP.glowCore} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 先頭の光の玉 */}
        {prog > 0 && prog < 1 && (
          <g>
            <circle cx={tip[0]} cy={tip[1]} r={34} fill={YP.glow} opacity={0.45} />
            <circle cx={tip[0]} cy={tip[1]} r={14} fill={YP.glowCore} stroke={C.ink} strokeWidth={4} />
          </g>
        )}
        {/* 最後: スクイーズに届いてきらめく */}
        {last > 0 && [0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 + 0.4;
          return <L5dSpark key={i} x={1630 + Math.cos(a) * (70 + 40 * last)} y={560 + Math.sin(a) * (60 + 30 * last)}
            r={12 + 10 * Math.sin(last * Math.PI)} op={1 - last * 0.3} rot={f * 3} />;
        })}
        {/* 右の軸と錦の表紙と紐 */}
        <rect x={1740} y={PT - 6} width={70} height={PB - PT + 12} fill={C.brocade} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={1775} cy={PT + 30 + i * 62} r={12} fill="none" stroke={C.brocadeGold} strokeWidth={4} />
        ))}
        <rect x={1806} y={PT - 30} width={34} height={PB - PT + 60} rx={10} fill={C.chairDark} stroke={C.ink} strokeWidth={6} />
        <path d={`M 1840 540 q 40 ${30 + Math.sin(f / 8) * 8} 20 120 q -14 50 20 90`} stroke={C.brocadeGold} strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* 文鎮 (両端) */}
        <rect x={1460} y={PT - 18} width={200} height={34} rx={8} fill={C.sumi} stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={PT - 18} width={200} height={34} rx={8} fill={C.sumi} stroke={C.ink} strokeWidth={5} />
        {/* 左端の芯 (ほどききった) */}
        <rect x={Lx - rr} y={PT - 10} width={rr * 2} height={PB - PT + 20} rx={rr * 0.3} fill={C.washiDark} stroke={C.ink} strokeWidth={6} />
        <line x1={Lx - 10} y1={PT - 6} x2={Lx - 10} y2={PB + 6} stroke={C.washiEdge} strokeWidth={4} />
        <rect x={Lx - 18} y={PT - 44} width={36} height={40} rx={10} fill={C.chairDark} stroke={C.ink} strokeWidth={5} />
        <rect x={Lx - 18} y={PB + 4} width={36} height={40} rx={10} fill={C.chairDark} stroke={C.ink} strokeWidth={5} />
        {/* 年代の札 (端から離して置く) */}
        <TagPlate x={330} y={345} text="20万年前" size={34} t={seg(f, 2, 8)} />
        <TagPlate x={1580} y={345} text="今" size={40} t={litOf(n - 1)} />
      </g>
    </Frame>
  );
};

// ===================================================================
// #222〜#226 からだの地図の全回収 (5枚とも同じ配置: KaradaChizu x=760 y=920 s=2.3、凡例の下に木の板)
//   idx = 新しく灯る座の番号。前の座は最初から 1、新しい座だけ f6〜26 で 0→1
//   背景はその時代の部屋、人の後ろにその時代の物の幻影 (半透明)
// ===================================================================
type L5dZone = "back" | "neck" | "arms" | "body" | "palm";
const L5D_ZONES: L5dZone[] = ["back", "neck", "arms", "body", "palm"];
// 各座の中心 (世界座標。KaradaChizu の zones × 2.3 + 足元 (760,920))
const L5D_ZC: Record<L5dZone, [number, number]> = {
  back: [760, 681], neck: [760, 547], arms: [760, 649], body: [760, 575], palm: [916, 777],
};
const L5D_ERA = ["20万年前", "古代ローマ", "中国・宋", "現代", "2026年"];

// 時代の部屋 (背景)
const L5dKaradaBg: React.FC<{ idx: number; f: number }> = ({ idx, f }) => {
  if (idx === 0) {
    // 洞窟 (第1章 #36 と同じ)
    return (
      <g>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.caveMid} />
        <L5dGlow x={240} y={700} r={1000} f={f} op={0.12} color={C.caveWarm} />
        {[[160, 180, 320, 200], [800, 90, 420, 120], [1500, 120, 380, 140], [1800, 600, 220, 300]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveRock : C.caveDark} opacity={0.45} stroke={C.ink} strokeWidth={4} />
        ))}
        <g stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6}>
          <path d="M 300 420 l 40 50 l -10 50" /><path d="M 1080 160 l 50 30 l 20 50" />
        </g>
        <path d="M -60 880 Q 600 860 1200 880 Q 1600 890 1980 870 L 1980 1140 L -60 1140 Z" fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
        <L5dGlow x={210} y={760} r={360} f={f} op={0.18} />
        <L5dFire x={210} y={900} s={0.8} f={f} />
      </g>
    );
  }
  if (idx === 1) {
    // ローマの寝室: 赤い漆喰の壁・大理石の柱・油のランプ・モザイクの床
    return (
      <g>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.romeWall} />
        <rect x={-60} y={560} width={2040} height={40} fill={C.romeWallDark} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-20 + i * 520} y={150} width={400} height={330} fill="none" stroke={C.gold} strokeWidth={5} opacity={0.5} />
        ))}
        {[110, 520].map((cx) => (
          <g key={cx}>
            <rect x={cx - 50} y={60} width={100} height={830} fill={C.marble} stroke={C.ink} strokeWidth={6} />
            {[-28, -8, 12, 32].map((dx) => <line key={dx} x1={cx + dx} y1={90} x2={cx + dx} y2={860} stroke={C.marbleDark} strokeWidth={5} />)}
            <rect x={cx - 74} y={28} width={148} height={40} rx={6} fill={C.marble} stroke={C.ink} strokeWidth={6} />
            <rect x={cx - 70} y={870} width={140} height={34} rx={6} fill={C.marble} stroke={C.ink} strokeWidth={6} />
          </g>
        ))}
        {/* 油のランプ (台の上) */}
        <rect x={290} y={700} width={36} height={180} fill={YP.brassDark} stroke={C.ink} strokeWidth={5} />
        <path d="M 250 700 Q 308 740 380 696 L 360 680 Q 300 690 262 682 Z" fill={YP.brass} stroke={C.ink} strokeWidth={5} />
        <L5dGlow x={372} y={650} r={150} f={f} op={0.25} color={C.lamp} />
        <path d={`M 372 682 q ${-10 + Math.sin(f / 3) * 6} -30 0 -56 q 12 26 0 56`} fill={C.fireMid} stroke={C.ink} strokeWidth={3} />
        <rect x={-60} y={890} width={2040} height={250} fill={C.marble} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={-40 + i * 92} y={920} width={46} height={46} fill={i % 2 ? C.romeWallDark : C.marbleDark} opacity={0.6} transform={`rotate(45 ${-17 + i * 92} 943)`} />
        ))}
      </g>
    );
  }
  if (idx === 2) {
    // 宋の夏の夜: 丸い月窓 (格子)・竹の影・藍の壁・板の床
    return (
      <g>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.songNight} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={-60 + i * 180} y1={-60} x2={-60 + i * 180} y2={880} stroke={C.songNightDark} strokeWidth={10} />
        ))}
        {/* 月窓 */}
        <circle cx={300} cy={400} r={230} fill={C.lattice} stroke={C.ink} strokeWidth={7} />
        <circle cx={300} cy={400} r={200} fill={C.songNightDark} />
        <circle cx={350} cy={330} r={70} fill={C.moon} opacity={0.95} />
        <L5dGlow x={350} y={330} r={160} f={f} op={0.12} color={C.moon} />
        {/* 竹の影 */}
        {[180, 240, 430].map((bx, i) => (
          <g key={i} opacity={0.85}>
            <rect x={bx} y={200} width={18} height={420} fill={C.ink} opacity={0.6} />
            {[260, 360, 460].map((yy) => <rect key={yy} x={bx - 3} y={yy} width={24} height={6} fill={C.ink} opacity={0.7} />)}
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M ${bx + 9} ${250 + k * 110} q ${40 + Math.sin(f / 10 + k + i) * 6} -10 70 6 q -40 4 -70 -6`} fill={C.ink} opacity={0.6} />
            ))}
          </g>
        ))}
        <g stroke={C.lattice} strokeWidth={9}>
          {[-120, -40, 40, 120].map((d) => <line key={d} x1={300 + d} y1={400 - Math.sqrt(200 * 200 - d * d)} x2={300 + d} y2={400 + Math.sqrt(200 * 200 - d * d)} />)}
          {[-120, 0, 120].map((d) => <line key={d} x1={300 - Math.sqrt(200 * 200 - d * d)} y1={400 + d} x2={300 + Math.sqrt(200 * 200 - d * d)} y2={400 + d} />)}
        </g>
        <circle cx={300} cy={400} r={200} fill="none" stroke={C.ink} strokeWidth={6} />
        <rect x={-60} y={880} width={2040} height={260} fill={C.latticeLight} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 180} y1={880} x2={-120 + i * 180} y2={1140} stroke={C.lattice} strokeWidth={5} />)}
      </g>
    );
  }
  if (idx === 3) {
    // 今の居間の夜: 縦じまの壁・夜景の窓・フロアランプ・ラグ
    return (
      <g>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.room} />
        {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-60 + i * 80} y={-60} width={34} height={960} fill={C.roomStripe} />)}
        <rect x={110} y={140} width={400} height={440} rx={8} fill={C.nightSky} stroke={C.ink} strokeWidth={8} />
        {[[150, 420, 70, 160], [240, 360, 60, 220], [320, 450, 90, 130], [420, 380, 70, 200]].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={C.nightRoomDark} />
            {[0, 1, 2].map((k) => <rect key={k} x={x + 12 + (k % 2) * 26} y={y + 16 + k * 34} width={14} height={12} fill={C.lamp} opacity={0.5 + 0.5 * ((Math.floor(f / 8) + i + k) % 3 === 0 ? 0 : 1)} />)}
          </g>
        ))}
        <line x1={310} y1={140} x2={310} y2={580} stroke={C.ink} strokeWidth={8} />
        <rect x={90} y={120} width={440} height={30} rx={6} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        {/* フロアランプ */}
        <rect x={1088} y={260} width={14} height={640} fill={C.ink} />
        <path d="M 1030 180 L 1160 180 L 1190 290 L 1000 290 Z" fill={C.lampCore} stroke={C.ink} strokeWidth={6} />
        <L5dGlow x={1095} y={300} r={260} f={f} op={0.16} color={C.lamp} />
        <rect x={-60} y={880} width={2040} height={260} fill={C.floorWood} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={760} cy={930} rx={560} ry={60} fill={C.rug} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={760} cy={930} rx={480} ry={42} fill="none" stroke={C.rugDark} strokeWidth={5} strokeDasharray="20 12" />
      </g>
    );
  }
  // 2026年の夕暮れの部屋: 夕焼けの窓・机のランプ
  return (
    <g>
      <rect x={-60} y={-60} width={2040} height={1200} fill={C.duskWall} />
      <rect x={20} y={260} width={320} height={420} rx={8} fill={C.duskSky} stroke={C.ink} strokeWidth={8} />
      <rect x={24} y={480} width={312} height={196} fill={C.dusk} />
      <circle cx={180} cy={490} r={60} fill={C.sun} />
      <L5dGlow x={180} y={490} r={240} f={f} op={0.14} color={C.sun} />
      {[[26, 560, 80], [110, 590, 60], [240, 540, 96]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={676 - y} fill={C.duskDeep} />)}
      <line x1={180} y1={260} x2={180} y2={680} stroke={C.ink} strokeWidth={8} />
      <path d="M 520 600 L 1400 1100 L 1980 1100 L 1980 1000 L 900 600 Z" fill={C.sun} opacity={0.14} />
      <rect x={-60} y={880} width={2040} height={260} fill={C.floorWood} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-60} y1={900 + i * 26} x2={1980} y2={900 + i * 26} stroke={C.floorWoodDark} strokeWidth={3} opacity={0.5} />)}
    </g>
  );
};

// その時代の物の幻影 (人の後ろ・半透明)
const L5dKaradaGhost: React.FC<{ idx: number; f: number }> = ({ idx, f }) => {
  const sway = Math.sin(f / 16) * 1.2;
  if (idx === 0) {
    const bx = 760, by = 681;
    return (
      <g opacity={0.55} transform={`rotate(${sway} ${bx} ${by})`}>
        <path d={`M ${bx - 250} ${by + 260} Q ${bx - 330} ${by - 80} ${bx - 200} ${by - 260} Q ${bx} ${by - 340} ${bx + 200} ${by - 260} Q ${bx + 330} ${by - 80} ${bx + 250} ${by + 260} Q ${bx} ${by + 300} ${bx - 250} ${by + 260} Z`}
          fill={C.grass} stroke={C.ink} strokeWidth={7} />
        <L5dStraws seed={3601} n={40} x={bx - 260} y={by - 260} w={520} h={500} f={f} len={110} tilt={0.6} />
      </g>
    );
  }
  if (idx === 1) {
    return (
      <g opacity={0.5}>
        <L5dPillowRome x={760} y={560} s={2.3} rot={sway} />
        {Array.from({ length: 7 }, (_, i) => {
          const p = ((f * 0.8 + i * 14) % 60) / 60;
          return <L5dFeather key={i} x={480 + rnd(41, i) * 560 + Math.sin(f / 8 + i) * 20} y={250 + p * 420} s={1.1} rot={Math.sin(f / 7 + i) * 30} op={1 - Math.abs(p - 0.5) * 1.6} />;
        })}
      </g>
    );
  }
  if (idx === 2) {
    return (
      <g opacity={0.5}>
        <L5dChikuFujin x={760} y={640} s={2.4} rot={-24 + sway} />
      </g>
    );
  }
  if (idx === 3) {
    return (
      <g opacity={0.45}>
        <DameSofa x={760} y={960} s={1.55} sink={0.6} f={f} />
      </g>
    );
  }
  // 2026年: 大きなスクイーズの幻影 + これまでの4つが左に並び、金の糸でそれぞれの座へつながる
  const icons = [
    <L5dGrassBundle key="g" x={0} y={0} s={0.55} f={f} rot={70} />,
    <L5dPillowRome key="p" x={0} y={0} s={0.42} />,
    <L5dChikuFujin key="c" x={0} y={0} s={0.42} rot={-10} />,
    <DameSofa key="d" x={0} y={60} s={0.2} f={f} />,
  ];
  const zs: L5dZone[] = ["back", "neck", "arms", "body"];
  return (
    <g>
      <g opacity={0.22}><Squishy x={760} y={930} s={2.9} f={f} /></g>
      {icons.map((ic, i) => {
        const ix = 500, iy = 250 + i * 160;
        const [zx, zy] = L5D_ZC[zs[i]];
        const t = seg(f, 4 + i * 3, 16 + i * 3);
        return (
          <g key={i}>
            <path d={`M ${ix + 70} ${iy} Q ${(ix + zx) / 2} ${iy - 40} ${zx - 60} ${zy}`} fill="none" stroke={C.gold} strokeWidth={5}
              strokeDasharray="12 10" opacity={0.95 * t} />
            <circle cx={ix} cy={iy} r={68} fill={YP.glowCore} opacity={0.75 * t} stroke={C.ink} strokeWidth={4} />
            <g transform={`translate(${ix} ${iy}) scale(${0.6 + 0.4 * pop(t)})`} opacity={t}>{ic}</g>
          </g>
        );
      })}
    </g>
  );
};

const L5dKarada: React.FC<{ f: number; seed: number; idx: number }> = ({ f, seed, idx }) => {
  const key = L5D_ZONES[idx];
  let Lnew = easeInOut(seg(f, 6, 26));
  // 首は中世でいったん消えた座。最初はかすかに残り、ちらついてから、もう一度灯る
  if (key === "neck") {
    const flick = f >= 10 && f < 13 ? 0.15 : f >= 15 && f < 17 ? 0.3 : 1;
    Lnew = Math.max(0.12, Lnew * flick);
  }
  const lit: Partial<Record<L5dZone, number>> = {};
  L5D_ZONES.forEach((k, i) => { if (i < idx) lit[k] = 1; });
  lit[key] = Lnew;
  const [zx, zy] = L5D_ZC[key];
  const zoom = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const ccx = lerp(900, zx, 0.35), ccy = lerp(540, zy, 0.3);
  const burst = seg(f, 24, 40);
  const isPalm = key === "palm";
  return (
    <Frame f={f} seed={seed} bg={C.caveMid}>
      <g transform={cam(ccx, ccy, zoom)}>
        <L5dKaradaBg idx={idx} f={f} />
        <L5dKaradaGhost idx={idx} f={f} />
        {/* 凡例の下の木の板 */}
        <g>
          <rect x={1186} y={26} width={430} height={734} rx={14} fill={C.ink} opacity={0.25} />
          <rect x={1176} y={16} width={430} height={734} rx={14} fill={YP.wood} stroke={C.ink} strokeWidth={7} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M 1190 ${80 + i * 118} q 100 ${rnd(seed, i) * 20 - 10} 200 0 q 100 ${rnd(seed + 1, i) * 20 - 10} 200 0`}
              stroke={YP.woodDark} strokeWidth={4} fill="none" opacity={0.6} />
          ))}
          {[[1206, 46], [1576, 46], [1206, 720], [1576, 720]].map(([nx, ny], i) => (
            <circle key={i} cx={nx} cy={ny} r={9} fill={YP.brassDark} stroke={C.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 幻影から新しい座へ吸い寄せられる光の粒 */}
        {f >= 6 && Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const p = clamp01(((f - 6 + i * 2) % 24) / 24);
          const r = (isPalm ? 220 : 300) * (1 - easeOut(p));
          return <circle key={i} cx={zx + Math.cos(a) * r} cy={zy + Math.sin(a) * r * 0.9} r={7 + 5 * (1 - p)} fill={YP.glow}
            stroke={C.ink} strokeWidth={2} opacity={(1 - p) * 0.9} />;
        })}
        {/* からだの地図 (共有装置) */}
        <KaradaChizu x={760} y={920} s={2.3} f={f} lit={lit} slots />
        {/* 灯りきった瞬間の光の輪 */}
        {burst > 0 && burst < 1 && [0, 1].map((k) => {
          const b = clamp01(burst * 1.4 - k * 0.3);
          return b > 0 && b < 1 && (
            <ellipse key={k} cx={zx} cy={zy} rx={(isPalm ? 40 : 90) + b * 220} ry={(isPalm ? 40 : 70) + b * 170} fill="none"
              stroke={YP.glow} strokeWidth={10 * (1 - b)} opacity={1 - b} />
          );
        })}
        {/* 手のひら: 強い光と、手の中の小さなスクイーズ */}
        {isPalm && (
          <g>
            <g opacity={Lnew}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2 + f / 30;
                const r1 = 50, r2 = 110 + Math.sin(f / 5 + i) * 14;
                return <line key={i} x1={zx + Math.cos(a) * r1} y1={zy + Math.sin(a) * r1} x2={zx + Math.cos(a) * r2} y2={zy + Math.sin(a) * r2}
                  stroke={YP.glow} strokeWidth={8} strokeLinecap="round" opacity={0.8} />;
              })}
              <circle cx={zx} cy={zy} r={80} fill={YP.glow} opacity={0.4} />
              <circle cx={zx} cy={zy} r={46} fill={YP.glowCore} opacity={0.7} />
            </g>
            <g transform={cam(zx, zy + 18, 0.7 + 0.3 * pop(seg(f, 10, 24)))}>
              <Squishy x={zx + 4} y={zy + 22} s={0.27} f={f} squeeze={0.15 + 0.1 * Math.sin(f / 6)} />
            </g>
            {/* 凡例の5段を上から下へ光がなでる */}
            {(() => {
              const sw = seg(f, 28, 42);
              return sw > 0 && sw < 1 && <rect x={1210} y={60 + sw * 620} width={370} height={40} rx={20} fill={YP.glowCore} opacity={0.7 * Math.sin(sw * Math.PI)} />;
            })()}
          </g>
        )}
        {/* 時代の札 */}
        <TagPlate x={300} y={200} text={L5D_ERA[idx]} size={40} t={seg(f, 0, 8)} fill={KRP.white} />
      </g>
    </Frame>
  );
};

// ---- 文#222 【山】 草のベッドは、背中の下に。
// 設計: ★全回収①。`KaradaChizu` (lit={{ back: L }})。背中が灯る。人の背後に、第1章の草の寝床の幻影 (半透明)
// どこ: 第1章と同じ洞窟。左に焚き火、右に凡例の木の板
// 演出: 人の後ろに草の寝床の幻影。寝床から光の粒が背中へ吸い寄せられ、背中の座が灯る。凡例の「背中」が点灯
// 動き: f6〜26 背中が 0→1 / 光の粒が集まる / f24〜 光の輪が広がる / 焚き火がゆれる / カメラが背中へ少し寄る
const Yw222: React.FC<{ f: number }> = ({ f }) => <L5dKarada f={f} seed={3222} idx={0} />;

// ---- 文#223 【山】 羽毛は、首の下に。
// 設計: ★全回収②。`KaradaChizu` (lit={{ back: 1, neck: L }})。首がもう一度灯る。背後にローマの羽毛の首枕の幻影
// どこ: ローマの寝室 (赤い漆喰の壁・大理石の柱・油のランプ・モザイクの床)。右に凡例の木の板
// 演出: 頭の後ろに羽毛の枕の幻影。羽根が舞い落ちる。首の座はかすかに残っていて、ちらついてから、もう一度灯る
// 動き: 背中は最初から1 / 首は 0.12 → f10・f15 にちらつき → f26 で 1 / 羽根が舞う / ランプの炎 / カメラが首へ寄る
const Yw223: React.FC<{ f: number }> = ({ f }) => <L5dKarada f={f} seed={3223} idx={1} />;

// ---- 文#224 【山】 竹の夫人は、腕の中に。
// 設計: ★全回収③。`KaradaChizu` (lit={{ back: 1, neck: 1, arms: L }})。腕と胸が灯る。背後に竹夫人の幻影
// どこ: 宋の夏の夜の部屋 (月の丸窓・格子・竹の影・板の床)
// 演出: 胸の前を斜めに竹夫人の幻影が横切る。光の粒が腕と胸に集まって灯る
// 動き: f6〜26 腕と胸が灯る / 竹の葉がそよぐ / 光の輪 / カメラが胸へ寄る
const Yw224: React.FC<{ f: number }> = ({ f }) => <L5dKarada f={f} seed={3224} idx={2} />;

// ---- 文#225 【山】 ヨギボーは、全身を包みこみました。
// 設計: ★全回収④。`KaradaChizu` (lit={{ back: 1, neck: 1, arms: 1, body: L }})。全身が灯る。背後に大きな袋のソファの幻影 (ロゴなし)
// どこ: 今の居間の夜 (縦じまの壁・夜景の窓・フロアランプ・ラグ)
// 演出: 人の後ろに DameSofa の大きな幻影。全身の輪郭が金色に灯る
// 動き: f6〜26 全身の輪が灯る / ソファがふくらんで息をする / 夜景の窓の明かりがまたたく / 光の輪
const Yw225: React.FC<{ f: number }> = ({ f }) => <L5dKarada f={f} seed={3225} idx={3} />;

// ---- 文#226 【山】 そして、スクイーズは、手のひらの中に。
// 設計: ★全回収⑤。`KaradaChizu` (lit={{ back: 1, neck: 1, arms: 1, body: 1, palm: L }})。最後に手のひらの座が強く灯り、手の中に小さな `Squishy` (s≈0.25) が光る。凡例の5段がすべて点灯
// どこ: 2026年の夕暮れの部屋。後ろに大きなスクイーズの幻影
// 演出: 左にこれまでの4つ (草の束・羽毛の枕・竹夫人・袋のソファ) が並び、金の糸でそれぞれの座へつながる = 全回収。最後に手のひらが強く灯り、小さなスクイーズがぽんと現れる
// 動き: f4〜25 4つの絵が順に灯る / f6〜26 手のひら 0→1 (光の放射) / f10〜24 スクイーズがぽん / f28〜42 凡例を光がなでる
const Yw226: React.FC<{ f: number }> = ({ f }) => <L5dKarada f={f} seed={3226} idx={4} />;

// ---- 文#227 【山】 人類はずっと、抱っこの代わりを、作り続けてきたのかもしれません。
// 設計: 時代を超えた人々が1つの画面に並ぶ: 20万年前の人 (草の束)、ローマ人 (羽毛の枕)、宋の人 (竹夫人)、子ザルと布の母、現代の子 (ぬいぐるみ)、序の子ども (スクイーズ)。それぞれ大切そうに抱えている。左から右へ時代の矢印。温かい光
// どこ: 時代の部屋が仕切り柱で区切られて横に並ぶ (洞窟 → ローマの赤い壁 → 宋の格子窓 → 研究室のタイル → 今の部屋)。床も時代ごとに違う
// 演出: 6組が並び、それぞれ抱えた物を大切そうに抱く。上の金の矢印が左→右へ伸び、通るたびにその人の後ろに温かい光がともる。上から温かい光
// 動き: f4〜36 矢印が伸びる / 光がともるたびに札がぽん・人が少し弾む / 子ザルが目を動かす / 焚き火・ランプがゆれる / カメラが左からゆっくり引く
const L5D_227_X = [190, 500, 815, 1120, 1420, 1720];
const L5D_227_TAG = ["20万年前", "古代ローマ", "宋", "20世紀", "現代", "2026年"];
const L5dLineup: React.FC<{ f: number; arrowT: number; dimLeft?: number }> = ({ f, arrowT, dimLeft = 0 }) => {
  const G = 800;
  const litOf = (i: number) => clamp01((arrowT * 1740 + 90 - L5D_227_X[i] + 60) / 120);
  const b = (i: number) => { const L = litOf(i); return L > 0 && L < 1 ? -Math.sin(L * Math.PI) * 14 : 0; };
  const hold = (_x: number, s: number) => G - 118 * s;
  return (
    <g>
      <defs>
        <radialGradient id="l5d227warm" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor={C.lampCore} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.lamp} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 時代の部屋 (仕切り柱で区切る) */}
      <rect x={-200} y={-100} width={545} height={1300} fill={C.caveMid} />
      {[[60, 160, 140, 90], [250, 520, 110, 70]].map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={C.caveRock} opacity={0.5} stroke={C.ink} strokeWidth={4} />
      ))}
      <L5dGlow x={60} y={760} r={200} f={f} op={0.2} />
      <g transform="translate(40 800) scale(0.45)"><L5dFire x={0} y={0} f={f} /></g>
      <rect x={345} y={-100} width={315} height={1300} fill={C.romeWall} />
      <rect x={380} y={200} width={245} height={240} fill="none" stroke={C.gold} strokeWidth={5} opacity={0.55} />
      <rect x={345} y={560} width={315} height={30} fill={C.romeWallDark} />
      <rect x={660} y={-100} width={310} height={1300} fill={C.songWall} />
      <rect x={700} y={170} width={230} height={250} fill={C.sky} stroke={C.ink} strokeWidth={6} />
      <g stroke={C.lattice} strokeWidth={7}>
        {[746, 792, 838, 884].map((x) => <line key={x} x1={x} y1={170} x2={x} y2={420} />)}
        {[220, 270, 320, 370].map((y) => <line key={y} x1={700} y1={y} x2={930} y2={y} />)}
      </g>
      <rect x={970} y={-100} width={300} height={1300} fill={C.labWall} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={970} y1={140 + i * 110} x2={1270} y2={140 + i * 110} stroke={C.labTile} strokeWidth={4} />)}
      {Array.from({ length: 3 }, (_, i) => <line key={i} x1={1045 + i * 75} y1={-100} x2={1045 + i * 75} y2={G} stroke={C.labTile} strokeWidth={4} />)}
      <rect x={1270} y={-100} width={1100} height={1300} fill={C.room} />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={1290 + i * 80} y={-100} width={34} height={900} fill={C.roomStripe} />)}
      <rect x={1540} y={150} width={300} height={260} rx={8} fill={C.sky} stroke={C.ink} strokeWidth={7} />
      <line x1={1690} y1={150} x2={1690} y2={410} stroke={C.ink} strokeWidth={6} />
      <path d="M 1560 360 q 40 -40 80 0 q 40 -30 80 0 l 0 40 l -160 0 Z" fill={C.plant} opacity={0.7} />
      {/* 床 */}
      <rect x={-200} y={G - 10} width={545} height={400} fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
      <rect x={345} y={G - 10} width={315} height={400} fill={C.marble} stroke={C.ink} strokeWidth={6} />
      <rect x={660} y={G - 10} width={310} height={400} fill={C.latticeLight} stroke={C.ink} strokeWidth={6} />
      <rect x={970} y={G - 10} width={300} height={400} fill={C.labTile} stroke={C.ink} strokeWidth={6} />
      <rect x={1270} y={G - 10} width={1100} height={400} fill={C.floorWood} stroke={C.ink} strokeWidth={6} />
      <ellipse cx={1570} cy={G + 30} rx={300} ry={36} fill={C.rug} stroke={C.ink} strokeWidth={5} />
      {/* 仕切り柱 */}
      {[345, 660, 970, 1270].map((x) => (
        <g key={x}>
          <rect x={x - 14} y={-100} width={28} height={G + 300} fill={YP.wood} stroke={C.ink} strokeWidth={5} />
          <rect x={x - 14} y={-100} width={8} height={G + 300} fill={YP.woodDark} opacity={0.6} />
        </g>
      ))}
      {/* 温かい光 (上から) */}
      <rect x={-200} y={-100} width={2570} height={1000} fill="url(#l5d227warm)" />
      {/* 後ろの光 (矢印が通るとともる) */}
      {L5D_227_X.map((x, i) => (
        <g key={i} opacity={litOf(i)}>
          <ellipse cx={x} cy={620} rx={170} ry={210} fill={YP.glow} opacity={0.22} />
          <ellipse cx={x} cy={640} rx={110} ry={140} fill={YP.glowCore} opacity={0.3} />
        </g>
      ))}
      {/* 1. 20万年前の人と草の束 */}
      <g transform={`translate(0 ${b(0)})`}>
        <L5dNeander x={190} y={G} s={1.2} f={f} pose="hold" face="smile" gaze={[2, 5]} phase={0.1} />
        <L5dGrassBundle x={190} y={hold(190, 1.2) + 14} s={0.72} f={f} rot={-62} />
        <circle cx={172} cy={hold(190, 1.2) + 4} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={208} cy={hold(190, 1.2) + 4} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
      </g>
      {/* 2. ローマ人 (白いトーガ・月桂冠) と羽毛の枕 */}
      <g transform={`translate(0 ${b(1)})`}>
        <Person x={500} y={G} s={1.2} f={f} pose="hold" face="smile" cloth={C.toga} clothDark={C.togaDark} gaze={[2, 5]} phase={0.3} />
        <g transform={`translate(500 ${G + Math.sin((f + 0.3 * 17) / 13) * 3}) scale(1.2)`}>
          <polygon points="-58,-160 -24,-160 58,-84 58,-52 34,-52" fill={C.togaDark} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -40 -150 Q 0 -110 50 -66 M -50 -130 Q -10 -90 40 -54" stroke={C.marbleDark} strokeWidth={3} fill="none" />
          {[-50, -34, -18, 18, 34, 50].map((dx, i) => (
            <ellipse key={i} cx={dx} cy={-282 + Math.abs(dx) * 0.5} rx={10} ry={6} fill={C.laurel} stroke={C.ink} strokeWidth={2.5}
              transform={`rotate(${dx < 0 ? -30 : 30} ${dx} ${-282 + Math.abs(dx) * 0.5})`} />
          ))}
        </g>
        <L5dPillowRome x={500} y={hold(500, 1.2) + 6} s={0.55} squash={0.25} />
        <circle cx={448} cy={hold(500, 1.2) + 10} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={552} cy={hold(500, 1.2) + 10} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
      </g>
      {/* 3. 宋の人 (藍の上着・黒い帽子) と竹夫人 */}
      <g transform={`translate(0 ${b(2)})`}>
        <Person x={815} y={G} s={1.2} f={f} pose="hold" face="smile" cloth={C.indigo} clothDark={C.indigoDark} hair="none" gaze={[2, 5]} phase={0.5} />
        <g transform={`translate(815 ${G + Math.sin((f + 0.5 * 17) / 13) * 3}) scale(1.2)`}>
          <path d="M -60 -246 Q -62 -300 0 -302 Q 62 -300 60 -246 Z" fill={C.hat} stroke={C.ink} strokeWidth={4} />
          <path d="M -30 -296 Q 0 -336 30 -296 Z" fill={C.hat} stroke={C.ink} strokeWidth={4} />
          <rect x={-150} y={-262} width={300} height={10} rx={5} fill={C.hat} transform={`rotate(${Math.sin(f / 12) * 1.5} 0 -257)`} />
        </g>
        <L5dChikuFujin x={815} y={hold(815, 1.2) - 10} s={0.9} rot={-78} />
        <circle cx={796} cy={hold(815, 1.2)} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={834} cy={hold(815, 1.2) - 4} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
      </g>
      {/* 4. 子ザルと布の母 */}
      <g transform={`translate(0 ${b(3)})`}>
        <L5dClothMother x={1120} y={G} s={0.95} f={f} gaze={Math.sin(f / 14) * 3} />
      </g>
      {/* 5. 現代の子 (水色の服) とぬいぐるみ */}
      <g transform={`translate(0 ${b(4)})`}>
        <Person x={1420} y={G} s={1.0} f={f} pose="hold" face="smile" cloth={C.kidB} clothDark={C.kidBDark} gaze={[2, 5]} phase={0.7} />
        <L5dBear x={1420} y={hold(1420, 1) - 4} s={0.56} rot={Math.sin(f / 10) * 3} />
        <circle cx={1390} cy={hold(1420, 1) + 6} r={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <circle cx={1450} cy={hold(1420, 1) + 6} r={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 6. 序の子ども (オレンジの服) とスクイーズ (両手の上) */}
      <g transform={`translate(0 ${b(5)})`}>
        <Person x={1720} y={G} s={1.0} f={f} pose="hold" face="smile" cloth={C.kidA} clothDark={C.kidADark} gaze={[0, 6]} phase={0.9} />
        <Squishy x={1720} y={hold(1720, 1) + 24} s={0.36} f={f} />
        <ellipse cx={1696} cy={hold(1720, 1) + 26} rx={16} ry={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={1744} cy={hold(1720, 1) + 26} rx={16} ry={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 左の人たちを少し暗く (#228 で右へ寄るとき) */}
      {dimLeft > 0 && <rect x={-200} y={-100} width={1470} height={1300} fill={C.ink} opacity={0.25 * dimLeft} />}
      {/* 時代の矢印 (左→右) */}
      {arrowT > 0 && (
        <g>
          <line x1={90} y1={300} x2={90 + 1740 * arrowT} y2={300} stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
          <line x1={90} y1={300} x2={90 + 1740 * arrowT} y2={300} stroke={C.gold} strokeWidth={13} strokeLinecap="round" />
          <path d={`M ${100 + 1740 * arrowT} 300 l -44 -30 l 0 60 Z`} fill={C.gold} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
      {L5D_227_X.map((x, i) => (
        <g key={i}>
          {litOf(i) > 0.3 && <circle cx={x} cy={300} r={12} fill={YP.glowCore} stroke={C.ink} strokeWidth={4} />}
          <TagPlate x={x} y={380} text={L5D_227_TAG[i]} size={30} t={litOf(i)} />
        </g>
      ))}
    </g>
  );
};
const Yw227: React.FC<{ f: number }> = ({ f }) => {
  const cm = easeInOut(seg(f, 0, 40));
  return (
    <Frame f={f} seed={3227} bg={C.room}>
      <g transform={cam(lerp(700, 960, cm), 540, lerp(1.08, 1, cm))}>
        <L5dLineup f={f} arrowT={easeInOut(seg(f, 4, 36))} />
      </g>
    </Frame>
  );
};

// ---- 文#228 【並】 スクイーズは、その最新の、いちばん小さな形なのです。
// 設計: #227 の行列の右端、`Squishy` が手のひらの上で光る。カメラがそこへ寄る
// どこ: #227 と同じ行列 (同じ場所・同じ時間の続き)。右端の序の子どもの両手の上
// 演出: カメラが行列全体から右端の子の手元へ寄る。左の人たちは少し暗くなり、手のひらのスクイーズだけが光ってきらめく。となりのくまより、ずっと小さい
// 動き: f2〜32 カメラが z1→2.5 で寄る / f14〜 スクイーズの光の放射ときらめき / 子の顔が smile→joy / スクイーズがぷるぷる
const Yw228: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut(seg(f, 2, 32));
  const sx = 1720, sy = 800 - 118 + 24 - 36;
  const gl = seg(f, 14, 30);
  return (
    <Frame f={f} seed={3228} bg={C.room}>
      <g transform={`translate(960 540) scale(${lerp(1, 2.5, e)}) translate(${-lerp(960, 1700, e)} ${-lerp(540, 650, e)})`}>
        <L5dLineup f={f} arrowT={1} dimLeft={e} />
        {/* 子を重ねて描き直す (顔を smile→joy に) */}
        <Person x={1720} y={800} s={1.0} f={f} pose="hold" face={f > 26 ? "joy" : "smile"} cloth={C.kidA} clothDark={C.kidADark} gaze={[0, 6]} phase={0.9} />
        {/* 手のひらの上の光 (スクイーズの後ろ) */}
        <g opacity={gl}>
          <circle cx={sx} cy={sy} r={72 + Math.sin(f / 4) * 4} fill={YP.glow} opacity={0.4} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 + f / 40;
            const r2 = 96 + 26 * gl + Math.sin(f / 4 + i * 2) * 8;
            return <line key={i} x1={sx + Math.cos(a) * 66} y1={sy + Math.sin(a) * 60} x2={sx + Math.cos(a) * r2} y2={sy + Math.sin(a) * r2 * 0.9}
              stroke={YP.glow} strokeWidth={4} strokeLinecap="round" />;
          })}
        </g>
        <Squishy x={1720} y={800 - 118 + 24} s={0.36} f={f} />
        <ellipse cx={1696} cy={800 - 118 + 26} rx={16} ry={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={1744} cy={800 - 118 + 26} rx={16} ry={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <g opacity={gl}>
          {[[-78, -50], [80, -56], [84, 24], [-84, 20]].map(([dx, dy], i) => (
            <L5dSpark key={i} x={sx + dx} y={sy + dy} r={8 + 4 * Math.sin(f / 3 + i)} rot={f * 4 + i * 20} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#229 【山】 握るとつぶれて、手を離すと、ゆっくり元に戻ってくる。
// 設計: 序 #5 と同じ構図・同じ大きな手 (★呼び返し)。`Squishy` を握る → 離す → ゆっくり戻る。今度は夕暮れの温かい光。f=45 で握りきった瞬間
// どこ: 序 #5 と同じ机の上 (ぼかした背景)。ただし窓の外は夕焼け。机に西日の帯と長い影
// 演出: 同じ大きな手 (水色の袖) がスクイーズを握りしめる。指の間からぷくっとはみ出す。西日がスクイーズの縁をオレンジに照らす
// 動き: 序 #5 と同じ段取り (握る0-30 / 握ったまま30-56 / 離して戻る56-) で f=45 は握りきった瞬間 / カメラがゆっくり寄る / 西日の光の粒がただよう
const Yw229: React.FC<{ f: number }> = ({ f }) => {
  const tf = f < 30 ? (f / 30) * 11.5 : f < 56 ? 11.5 + ((f - 30) / 26) * 0.5 : 12 + Math.min((f - 56) / 44, 1) * 30;
  const z = tf < 20 ? lerp(1, 1.12, easeInOut(seg(tf, 0, 20))) : lerp(1.12, 1.04, easeInOut(seg(tf, 20, 42)));
  const g = tf < 12 ? easeOut(seg(tf, 0, 12)) : 1 - easeOut(seg(tf, 12, 20));
  const q = tf < 12 ? 0.9 * easeOut(seg(tf, 0, 12)) : tf < 20 ? 0.9 : 0.9 * (1 - easeInOut(seg(tf, 20, 42)));
  const dent = tf < 12 ? seg(tf, 4, 12) : tf < 20 ? 1 : lerp(1, 0.3, seg(tf, 20, 42));
  const away = easeInOut(seg(tf, 18, 34));
  const topY = 850 - lerp(418, 305, q / 0.9);
  const fingers = [0, 1, 2, 3].map((i) => {
    const p0: [number, number] = [560 + i * 14, 430 + i * 40];
    const p1: [number, number] = [lerp(820 + i * 20, 880 + i * 50, g), lerp(topY - 150 + i * 40, topY - 80 + i * 26, g)];
    const p2: [number, number] = [lerp(1000 + i * 30, 1250 + i * 26, g) - (i === 3 ? 40 : 0), lerp(topY - 300 + i * 80, topY + 30 + i * 46, g)];
    const m: [number, number] = [0.25 * p0[0] + 0.5 * p1[0] + 0.25 * p2[0], 0.25 * p0[1] + 0.5 * p1[1] + 0.25 * p2[1]];
    return { p0, p1, p2, m };
  });
  const bulge = clamp01((q - 0.3) / 0.6) * clamp01(g * 1.5);
  return (
    <Frame f={f} seed={3229} bg={C.deskWood}>
      <defs>
        <filter id="l5d229blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22" /></filter>
        <linearGradient id="l5d229sun" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sun} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={C.dusk} stopOpacity={0.18} />
          <stop offset="1" stopColor={C.duskDeep} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      {/* ぼかした机の上 (序 #5 と同じ配置。窓の外は夕焼け) */}
      <g filter="url(#l5d229blur)">
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.deskWood} />
        <rect x={-60} y={-60} width={W + 120} height={360} fill={C.duskSky} opacity={0.9} />
        <rect x={-60} y={180} width={W + 120} height={120} fill={C.dusk} opacity={0.8} />
        <circle cx={1500} cy={210} r={110} fill={C.sun} />
        {[[260, 140, 120], [520, 90, 70], [1780, 300, 60]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={C.lamp} opacity={0.55} />
        ))}
        <rect x={1480} y={420} width={260} height={300} rx={40} fill={C.mug} />
        <rect x={60} y={620} width={420} height={300} rx={20} fill={KRP.blueSoft} opacity={0.8} />
        <rect x={1460} y={760} width={420} height={120} rx={20} fill={KRP.yellow} opacity={0.7} />
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-60} y={360 + i * 150} width={W + 120} height={18} fill={C.deskWoodDark} opacity={0.4} />
        ))}
        {/* 西日の帯 */}
        <path d="M 1300 300 L 1980 300 L 900 1140 L 200 1140 Z" fill={C.sun} opacity={0.35} />
      </g>
      <g transform={cam(960, 640, z)}>
        {/* 長い影 (西日が右上から) */}
        <ellipse cx={760} cy={860} rx={360} ry={40} fill={C.duskDeep} opacity={0.35} transform="rotate(-6 760 860)" />
        <Squishy x={1010} y={850} s={2.2} squeeze={q} dent={dent} f={f} />
        {/* 西日に照らされた縁 */}
        <path d={`M ${1010 + 150 * (1 + q * 0.38)} ${850 - 60} Q ${1010 + 170 * (1 + q * 0.38)} ${850 - 260 * (1 - q * 0.3)} ${1010 + 60} ${850 - 380 * (1 - q * 0.3)}`}
          fill="none" stroke={C.sun} strokeWidth={14} strokeLinecap="round" opacity={0.75} />
        {bulge > 0.01 && fingers.slice(0, 3).map((fg, i) => {
          const n = fingers[i + 1];
          return (
            <ellipse key={i} cx={(fg.m[0] + n.m[0]) / 2 + 30} cy={(fg.m[1] + n.m[1]) / 2 - 6} rx={46 * bulge} ry={24 * bulge}
              fill={YP.sqBody} stroke={C.ink} strokeWidth={4} />
          );
        })}
        {g > 0.6 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none" opacity={g}>
            <path d="M 560 760 q -30 -30 -20 -70" />
            <path d="M 1460 760 q 30 -30 20 -70" />
            <path d="M 1500 830 q 40 -10 50 -40" />
          </g>
        )}
        {f > 22 && (
          <g stroke={YP.sqDeep} strokeWidth={6} strokeLinecap="round" fill="none" opacity={seg(tf, 22, 30)}>
            {[0, 1, 2].map((i) => {
              const yy = 520 - ((f * 1.5 + i * 30) % 90);
              return <path key={i} d={`M ${1380 + i * 40} ${yy + 40} q 10 -20 0 -40`} />;
            })}
          </g>
        )}
        {/* 大きな手 (序 #5 と同じ。水色の袖) */}
        <g transform={`translate(${-260 * away} ${60 * away}) rotate(${-8 * away} 300 700)`}>
          <g transform="rotate(-38 330 640)">
            <rect x={130} y={560} width={520} height={190} rx={40} fill={C.skin} stroke={C.ink} strokeWidth={7} transform="translate(-140 0)" />
            <rect x={-320} y={540} width={520} height={230} rx={40} fill={C.kidB} stroke={C.ink} strokeWidth={7} />
            <rect x={150} y={530} width={60} height={250} rx={20} fill={C.kidBDark} stroke={C.ink} strokeWidth={7} />
          </g>
          <path d={`M 560 600 Q 560 ${lerp(700, 740, g)} ${lerp(640, 720, g)} ${lerp(720, 770, g)}`} fill="none" stroke={C.ink} strokeWidth={72} strokeLinecap="round" />
          <path d={`M 560 600 Q 560 ${lerp(700, 740, g)} ${lerp(640, 720, g)} ${lerp(720, 770, g)}`} fill="none" stroke={C.skin} strokeWidth={58} strokeLinecap="round" />
          <ellipse cx={lerp(640, 720, g) + 4} cy={lerp(720, 770, g) + 6} rx={18} ry={14} fill={C.nail} stroke={C.ink} strokeWidth={3} />
          <ellipse cx={520} cy={520} rx={170} ry={130} fill={C.skin} stroke={C.ink} strokeWidth={7} transform="rotate(-24 520 520)" />
          <path d="M 440 560 Q 520 600 600 560" fill="none" stroke={C.skinDark} strokeWidth={4} />
          {fingers.map((fg, i) => (
            <g key={i}>
              <path d={`M ${fg.p0[0]} ${fg.p0[1]} Q ${fg.p1[0]} ${fg.p1[1]} ${fg.p2[0]} ${fg.p2[1]}`} fill="none" stroke={C.ink} strokeWidth={i === 3 ? 60 : 70} strokeLinecap="round" />
              <path d={`M ${fg.p0[0]} ${fg.p0[1]} Q ${fg.p1[0]} ${fg.p1[1]} ${fg.p2[0]} ${fg.p2[1]}`} fill="none" stroke={C.skin} strokeWidth={i === 3 ? 47 : 57} strokeLinecap="round" />
              <path d={`M ${fg.m[0] - 6} ${fg.m[1] - 22} q 12 22 0 44`} fill="none" stroke={C.skinDark} strokeWidth={4} />
              <path d={`M ${fg.m[0] + 10} ${fg.m[1] - 20} q 12 20 0 40`} fill="none" stroke={C.skinDark} strokeWidth={3} />
              <ellipse cx={fg.p2[0]} cy={fg.p2[1]} rx={16} ry={13} fill={C.nail} stroke={C.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
        <TagPlate x={440} y={240} text="むにゅ" size={72} t={seg(tf, 6, 12)} rot={-6} fill={YP.sqShine} color={YP.sqDent} />
        <TagPlate x={1560} y={240} text="じわ〜" size={64} t={seg(tf, 24, 32)} rot={4} />
      </g>
      {/* 夕暮れの光を全体に (温かく) */}
      <rect x={0} y={0} width={W} height={H} fill="url(#l5d229sun)" />
      {Array.from({ length: 10 }, (_, i) => {
        const p = ((f * 0.6 + i * 23) % 100) / 100;
        return <circle key={i} cx={300 + rnd(229, i) * 1400 + Math.sin(f / 10 + i) * 20} cy={900 - p * 700} r={4 + rnd(230, i) * 4} fill={C.sun} opacity={Math.sin(p * Math.PI) * 0.8} />;
      })}
    </Frame>
  );
};

// ---- 文#230 【並】 いつでも、何度でも、受け止めてくれる。
// 設計: `Squishy` が何度も握られては戻る (f でリズムよく3回)。毎回やさしい顔で戻る。背景は柔らかい光
// どこ: 朝の窓辺。レースのカーテン越しの柔らかい光、木の窓台にたたんだタオル。その上にスクイーズ。窓の外は空と植木鉢
// 演出: 上から大きな手 (オレンジの袖) が降りてきて、ぎゅっ → ぱっと離す、を3回。スクイーズは毎回やさしい顔で戻り、戻るたびに小さなハートが1つ増える
// 動き: f0〜14 / 14〜28 / 28〜42 の3回 (押す0.35 → ゆっくり戻る0.65) / ハートが3つ並ぶ / カーテンがそよぐ / 光の筋がゆれる / f=45 はやさしい顔に戻った瞬間
const Yw230: React.FC<{ f: number }> = ({ f }) => {
  const k = Math.min(2, Math.floor(f / 14));
  const t = f >= 42 ? 1 : clamp01((f - k * 14) / 14);
  const press = t < 0.35 ? easeOut(t / 0.35) : 1 - easeInOut(clamp01((t - 0.35) / 0.65));
  const q = 0.8 * press;
  const lift = t < 0.35 ? 1 - easeOut(t / 0.35) : easeOut(clamp01((t - 0.35) / 0.45));
  const dent = t < 0.35 ? press : 1 - clamp01((t - 0.35) / 0.65);
  const SX = 960, SY = 734, S = 2.0;
  const top = SY - 200 * S * (1 - q * 0.3);
  const hy = top - 24 - lift * 150;
  return (
    <Frame f={f} seed={3230} bg={C.room}>
      <g transform={cam(960, 600, 1 + 0.03 * Math.sin(f / 20))}>
        {/* 壁と窓 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.room} />
        <rect x={300} y={40} width={1320} height={620} fill={C.sky} stroke={C.ink} strokeWidth={8} />
        <line x1={630} y1={40} x2={630} y2={660} stroke={C.ink} strokeWidth={8} />
        <line x1={1290} y1={40} x2={1290} y2={660} stroke={C.ink} strokeWidth={8} />
        <path d="M 304 520 Q 500 470 700 520 Q 900 560 1100 510 Q 1350 460 1616 520 L 1616 656 L 304 656 Z" fill={C.plant} opacity={0.55} />
        <circle cx={1400} cy={180} r={80} fill={C.sun} opacity={0.8} />
        {/* レースのカーテン (左右) */}
        {[0, 1].map((side) => (
          <g key={side}>
            {Array.from({ length: 6 }, (_, i) => {
              const x0 = side ? 1620 - i * 40 : 300 + i * 40;
              const sw = Math.sin(f / 12 + i) * 10;
              return <path key={i} d={`M ${x0} 30 Q ${x0 + sw} 360 ${x0 + (side ? -30 : 30) + sw} 680`} stroke={C.lace} strokeWidth={36} fill="none" opacity={0.75} />;
            })}
          </g>
        ))}
        <rect x={260} y={14} width={1400} height={30} rx={8} fill={YP.wood} stroke={C.ink} strokeWidth={6} />
        {/* 柔らかい光の筋 */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${900 + i * 220} 40 L ${1060 + i * 220} 40 L ${760 + i * 260 + Math.sin(f / 15 + i) * 20} 1100 L ${560 + i * 260} 1100 Z`}
            fill={KRP.white} opacity={0.18} />
        ))}
        {/* 窓台 (木) と植木鉢 */}
        <rect x={160} y={800} width={1600} height={60} rx={8} fill={YP.wood} stroke={C.ink} strokeWidth={7} />
        <rect x={160} y={860} width={1600} height={260} fill={C.roomStripe} stroke={C.ink} strokeWidth={6} />
        <g transform="translate(1520 800)">
          <path d="M -60 0 L -48 -110 L 48 -110 L 60 0 Z" fill={C.rug} stroke={C.ink} strokeWidth={6} />
          {[-40, -10, 20, 44].map((dx, i) => (
            <ellipse key={i} cx={dx} cy={-170 - (i % 2) * 40} rx={26} ry={50} fill={C.plant} stroke={C.ink} strokeWidth={5}
              transform={`rotate(${dx * 0.8 + Math.sin(f / 14 + i) * 4} ${dx} -120)`} />
          ))}
        </g>
        <g transform="translate(380 800)">
          <rect x={-70} y={-150} width={140} height={150} rx={14} fill={C.mug} stroke={C.ink} strokeWidth={6} />
          <path d="M 70 -110 q 50 0 50 40 q 0 40 -50 40" stroke={C.ink} strokeWidth={14} fill="none" />
          <path d="M 70 -110 q 50 0 50 40 q 0 40 -50 40" stroke={C.mug} strokeWidth={6} fill="none" />
        </g>
        {/* たたんだタオル */}
        <rect x={650} y={760} width={620} height={46} rx={20} fill={C.towel} stroke={C.ink} strokeWidth={6} />
        <rect x={670} y={730} width={580} height={40} rx={18} fill={C.towel} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={700 + i * 46} cy={784} r={4} fill="none" stroke={C.towelDark} strokeWidth={2.5} />)}
        {/* スクイーズ (主役) */}
        <Squishy x={SX} y={SY} s={S} squeeze={q} dent={dent} f={f} />
        {/* 受け止めた波紋 */}
        {press > 0.5 && (
          <g stroke={YP.sqDeep} strokeWidth={6} fill="none" strokeLinecap="round" opacity={press}>
            <path d={`M ${SX - 330} ${SY - 100} q -30 -40 -10 -80`} />
            <path d={`M ${SX + 330} ${SY - 100} q 30 -40 10 -80`} />
          </g>
        )}
        {/* 上から押す大きな手 (指先が下) */}
        <L5dHand x={SX + 10} y={hy - 66} s={1.2} rot={-90} sleeve={C.kidA} open={lerp(0.5, 1, lift)} />
        {/* 戻るたびに増えるハート */}
        {[0, 1, 2].map((i) => (
          <L5dHeart key={i} x={1300 + i * 90} y={330 - i * 20 + Math.sin(f / 8 + i) * 6} s={1.4} t={seg(f, i * 14 + 7, i * 14 + 12)} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#231 【山】 それはたぶん、抱っこに、少しだけ似ています。
// 設計: ★余韻。夜の子ども部屋。序の子ども1人が布団の中でスクイーズを胸に抱いて眠り、隣で親がそっと布団をかけ直す (本物の抱っこと、その代わりが同じ画面に)。常夜灯の温かい光
// どこ: 夜の子ども部屋。窓に月と星、カーテン、おもちゃの棚、床にきのこ形の常夜灯。布団と枕
// 演出: 序のオレンジの服の子が、スクイーズを胸に抱いて眠る。向こう側にひざをついた親が、身をかがめて掛け布団を胸まで引き上げる。常夜灯の明かりが2人を包む
// 動き: f6〜34 掛け布団のふちが腰→胸へ上がり、親の手もいっしょに動く / 布団が寝息でふくらむ / z が浮かぶ / 常夜灯がゆらぐ / 星がまたたく / カメラがゆっくり寄る
const Yw231: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeInOut(seg(f, 6, 34));
  const edgeX = lerp(1010, 905, pull);
  const br = Math.sin(f / 14) * 5;
  const px = 1060, py = 640, ks = 1.25;
  const ps = 1.35, plx = 1180, ply = 700, lean = -24;
  const shL = rotPt(plx, ply, ps, lean, -67, -148);
  const shR = rotPt(plx, ply, ps, lean, 67, -148);
  const hL: [number, number] = [edgeX + 6, 566 - br * 0.5];
  const hR: [number, number] = [edgeX + 90, 560 - br * 0.5];
  const arm = (a: [number, number], b: [number, number], k: number) => {
    const mx = (a[0] + b[0]) / 2 + 10, my = Math.max(a[1], b[1]) + 30;
    const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
    return (
      <g key={k}>
        <path d={d} stroke={C.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={d} stroke={C.parent} strokeWidth={25} fill="none" strokeLinecap="round" />
        <circle cx={b[0]} cy={b[1]} r={15} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={3231} bg={C.nightRoom} dark>
      <g transform={`translate(960 540) scale(${1.18 + 0.1 * easeInOut(seg(f, 0, 42))}) translate(-900 -575)`}>
        {/* 部屋 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.nightRoom} />
        {Array.from({ length: 13 }, (_, i) => <rect key={i} x={-60 + i * 160} y={-60} width={60} height={860} fill={C.nightRoomDark} opacity={0.5} />)}
        {/* 窓・月・星 */}
        <rect x={1440} y={90} width={360} height={330} rx={10} fill={C.nightSky} stroke={C.ink} strokeWidth={8} />
        <circle cx={1700} cy={180} r={46} fill={C.moon} />
        <circle cx={1720} cy={168} r={40} fill={C.nightSky} />
        {[[1500, 150], [1580, 260], [1660, 330], [1760, 300], [1530, 360]].map(([sx, sy], i) => (
          <L5dSpark key={i} x={sx} y={sy} r={8 + 4 * Math.sin(f / 5 + i * 1.7)} color={C.moon} op={0.9} />
        ))}
        <line x1={1620} y1={90} x2={1620} y2={420} stroke={C.ink} strokeWidth={7} />
        <path d={`M 1400 70 Q ${1430 + Math.sin(f / 15) * 6} 260 1410 470 L 1470 470 Q 1460 260 1470 70 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        <path d={`M 1840 70 Q ${1810 + Math.sin(f / 15) * 6} 260 1830 470 L 1770 470 Q 1780 260 1770 70 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        {/* おもちゃの棚 */}
        <rect x={120} y={250} width={380} height={24} fill={YP.wood} stroke={C.ink} strokeWidth={5} />
        <L5dBear x={200} y={196} s={0.42} />
        {[[300, C.kidA], [350, C.kidB], [400, KRP.yellow]].map(([bx, col], i) => (
          <rect key={i} x={bx as number} y={200 - (i % 2) * 20} width={44} height={50 + (i % 2) * 20} rx={6} fill={col as string} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 床 */}
        <rect x={-60} y={760} width={2040} height={380} fill={C.floorWoodDark} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-60} y1={790 + i * 40} x2={1980} y2={790 + i * 40} stroke={C.ink} strokeWidth={3} opacity={0.3} />)}
        {/* 常夜灯の明かり */}
        <L5dGlow x={430} y={700} r={760} f={f} op={0.14} color={C.lamp} />
        {/* 親 (布団の向こうにひざをつき、身をかがめる) */}
        <Person x={plx} y={ply} s={ps} f={f} pose="hold" face="smile" cloth={C.parent} clothDark={C.parentDark} lean={lean} gaze={[-8, 8]} still />
        {/* 敷き布団と枕 */}
        <rect x={540} y={686} width={760} height={100} rx={26} fill={C.lace} stroke={C.ink} strokeWidth={6} />
        <line x1={560} y1={720} x2={1280} y2={720} stroke={C.towelDark} strokeWidth={4} />
        <ellipse cx={760} cy={652} rx={120} ry={56} fill={C.kidB} stroke={C.ink} strokeWidth={6} />
        <path d="M 670 640 q 90 -24 180 0" stroke={C.kidBDark} strokeWidth={4} fill="none" />
        {/* 眠る子 (寝かせた Person) */}
        <g transform={`translate(${px} ${py}) rotate(-90)`}>
          <Person x={0} y={0} s={ks} f={f} face="smile" cloth={C.kidA} clothDark={C.kidADark} still />
          <g transform={`scale(${ks})`}>
            <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
            <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
            <g fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round">
              <path d="M -36 -222 Q -24 -211 -12 -222" />
              <path d="M 12 -222 Q 24 -211 36 -222" />
            </g>
            <ellipse cx={-44} cy={-200} rx={10} ry={6} fill={KRP.red} opacity={0.3} />
            <ellipse cx={44} cy={-200} rx={10} ry={6} fill={KRP.red} opacity={0.3} />
          </g>
        </g>
        {/* 掛け布団 (親が胸まで引き上げる) */}
        <path d={`M ${edgeX} ${720} Q ${edgeX - 18} ${600} ${edgeX + 10} ${556 - br} Q ${(edgeX + 1250) / 2} ${520 - br * 1.5} 1250 ${560 - br} Q 1290 640 1270 730 Q 1080 760 ${edgeX} ${720} Z`}
          fill={C.quilt} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        {Array.from({ length: 14 }, (_, i) => {
          const qx = edgeX + 40 + (i % 7) * ((1220 - edgeX - 40) / 7);
          const qy = 600 + Math.floor(i / 7) * 70 - br * 0.6;
          return <circle key={i} cx={qx} cy={qy} r={10} fill={C.quiltDot} opacity={0.8} />;
        })}
        <path d={`M ${edgeX + 4} ${560 - br} Q ${edgeX - 14} ${640} ${edgeX} ${716}`} stroke={C.quiltDark} strokeWidth={14} fill="none" strokeLinecap="round" />
        {/* 胸に抱いたスクイーズ と 子の手 */}
        <Squishy x={edgeX + 22} y={640} s={0.42} f={f} rot={-90} />
        <circle cx={edgeX - 26} cy={600} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={edgeX - 14} cy={684} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        {/* 親の腕 (布団のふちをつまむ) */}
        {arm(shL, hL, 0)}
        {arm(shR, hR, 1)}
        {/* 常夜灯 (きのこ形) */}
        <g transform="translate(430 800)">
          <rect x={-18} y={-70} width={36} height={70} rx={10} fill={C.lace} stroke={C.ink} strokeWidth={5} />
          <path d="M -80 -66 Q -84 -150 0 -154 Q 84 -150 80 -66 Z" fill={C.lamp} stroke={C.ink} strokeWidth={6} />
          {[[-36, -110], [20, -128], [44, -92]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={10} fill={C.lampCore} />)}
          <circle cx={0} cy={-100} r={120 + Math.sin(f / 6) * 6} fill={C.lampCore} opacity={0.18} />
        </g>
        {/* 寝息の z */}
        {[0, 1, 2].map((i) => {
          const p = ((f + i * 14) % 42) / 42;
          return (
            <text key={i} x={720 - p * 60 + i * 10} y={540 - p * 160} fontFamily={FONT} fontWeight={900} fontSize={34 + p * 20}
              fill={C.lampCore} stroke={C.ink} strokeWidth={2} opacity={Math.sin(p * Math.PI)}>z</text>
          );
        })}
      </g>
    </Frame>
  );
};

// ---- 文#232 【並】 なお、いまこの動画を観ながら、何かを握っていたあなた。
// 設計: 画面のこちら側 (視聴者) を指さすように、テレビの前のソファの人の手元に寄る: クッションの端・リモコン・スクイーズ・マグカップ…を何かしら握っている手が4つ並ぶ (4人の手)。くすっと笑える
// どこ: 夜の居間。テレビ側 (= 視聴者の側) から見たソファの座面。テレビの青白い光が手前から当たる
// 演出: 上から4人の手が下りていて、それぞれクッションの角・リモコン・スクイーズ・マグカップの取っ手を握っている。テレビの光の帯が左から右へなめると、照らされた手が「ぎくっ」と震えて、汗としるしが出る。スクイーズは思わずぎゅっと潰れる
// 動き: f4〜30 光の帯が通る / 通った手から順に震える・汗・びっくりマーク / スクイーズが潰れる / マグの湯気 / カメラが少し寄る (こっちを指すように)
const L5dGrip: React.FC<{ x: number; y: number; s?: number; sleeve: string; sleeveDark: string; rot?: number }> = ({ x, y, s = 1, sleeve, sleeveDark, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {/* 袖 (上から) */}
    <rect x={-66} y={-760} width={132} height={600} rx={30} fill={sleeve} stroke={C.ink} strokeWidth={7} />
    <path d="M -30 -700 Q -40 -440 -24 -200" stroke={sleeveDark} strokeWidth={5} fill="none" />
    <rect x={-74} y={-200} width={148} height={46} rx={16} fill={sleeveDark} stroke={C.ink} strokeWidth={6} />
    <rect x={-50} y={-160} width={100} height={40} fill={C.skin} stroke={C.ink} strokeWidth={6} />
    {/* 手の甲 */}
    <rect x={-80} y={-134} width={160} height={150} rx={56} fill={C.skin} stroke={C.ink} strokeWidth={7} />
    {/* 曲げた指4本 */}
    {[-58, -24, 10, 44].map((dy, i) => (
      <g key={i}>
        <rect x={-86 + (i === 3 ? 10 : 0)} y={dy} width={152 - (i === 3 ? 18 : 0)} height={34} rx={17} fill={C.skin} stroke={C.ink} strokeWidth={5.5} />
        <path d={`M ${-30 + i * 4} ${dy + 6} q 6 11 0 22`} stroke={C.skinDark} strokeWidth={3.5} fill="none" />
        <ellipse cx={-70 + (i === 3 ? 10 : 0)} cy={dy + 17} rx={9} ry={8} fill={C.nail} stroke={C.ink} strokeWidth={2.5} />
      </g>
    ))}
    {/* 親指 */}
    <rect x={20} y={-104} width={36} height={100} rx={18} fill={C.skin} stroke={C.ink} strokeWidth={5.5} transform="rotate(38 38 -54)" />
  </g>
);
const L5dBang: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const k = pop(clamp01(t));
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(12)`}>
      <path d="M -10 -60 L 10 -60 L 6 4 L -6 4 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={0} cy={22} r={9} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
const L5dSweat: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  t <= 0 ? null : (
    <path transform={`translate(${x} ${y + 14 * t}) scale(${0.6 + 0.4 * clamp01(t * 2)})`} opacity={clamp01(t * 3)}
      d="M 0 -26 Q 16 0 12 10 Q 0 22 -12 10 Q -16 0 0 -26 Z" fill={C.tvBlue} stroke={C.ink} strokeWidth={4} />
  )
);
const Yw232: React.FC<{ f: number }> = ({ f }) => {
  const XS = [300, 760, 1200, 1640];
  const GY = 470;
  const barX = lerp(-200, 2120, seg(f, 4, 30));
  const hit = (i: number) => 4 + (26 * (XS[i] + 200)) / 2320;
  const got = (i: number) => seg(f, hit(i), hit(i) + 5);
  const shake = (i: number) => { const g = got(i); return g > 0 && g < 1 ? Math.sin(f * 3.1) * 10 * (1 - g) : 0; };
  const sleeves: [string, string][] = [[C.parent, C.parentDark], [C.shirt, C.shirtDark], [C.kidA, C.kidADark], [C.sofaBlue, C.sofaBlueDark]];
  return (
    <Frame f={f} seed={3232} bg={C.sofaBlueDark}>
      <defs>
        <linearGradient id="l5d232tv" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={C.tvGlow} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.tvGlow} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={cam(960, 520, 1 + 0.06 * easeInOut(seg(f, 0, 42)))}>
        {/* ソファの背もたれと座面 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.sofaBlueDark} />
        <rect x={-60} y={-60} width={2040} height={300} fill={C.nightRoomDark} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-40 + i * 680} y={120} width={660} height={360} rx={60} fill={C.sofaBlue} stroke={C.ink} strokeWidth={7} />
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={-40 + i * 680} y={500} width={660} height={460} rx={50} fill={C.sofaBlue} stroke={C.ink} strokeWidth={7} />
            <path d={`M ${0 + i * 680} 560 Q ${290 + i * 680} 540 ${580 + i * 680} 560`} stroke={C.sofaBlueDark} strokeWidth={5} fill="none" strokeDasharray="16 12" />
          </g>
        ))}
        {/* 1. クッションの角 */}
        <g transform={`translate(${shake(0)} 0)`}>
          <g transform={`rotate(${8 + Math.sin(f / 10) * 2} ${XS[0]} ${GY})`}>
            <path d={`M ${XS[0]} ${GY - 40} L ${XS[0] + 230} ${GY + 200} L ${XS[0]} ${GY + 440} L ${XS[0] - 230} ${GY + 200} Z`} fill={C.cushion} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
            <path d={`M ${XS[0]} ${GY + 20} L ${XS[0] + 170} ${GY + 200} L ${XS[0]} ${GY + 380} L ${XS[0] - 170} ${GY + 200} Z`} fill="none" stroke={C.cushionDark} strokeWidth={5} strokeDasharray="14 10" />
            <path d={`M ${XS[0] - 40} ${GY + 70} q 40 30 80 0 M ${XS[0] - 30} ${GY + 110} q 30 20 60 0`} stroke={C.cushionDark} strokeWidth={5} fill="none" />
          </g>
          <L5dGrip x={XS[0]} y={GY} s={0.9 + 0.04 * got(0)} sleeve={sleeves[0][0]} sleeveDark={sleeves[0][1]} rot={-4} />
        </g>
        {/* 2. リモコン */}
        <g transform={`translate(${shake(1)} 0)`}>
          <rect x={XS[1] - 40} y={GY - 160} width={80} height={420} rx={22} fill={C.remote} stroke={C.ink} strokeWidth={7} />
          <circle cx={XS[1]} cy={GY + 110} r={16} fill={C.remoteBtn} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={XS[1] - 24 + (i % 2) * 30} y={GY + 140 + Math.floor(i / 2) * 32} width={18} height={18} rx={5} fill={C.shirtDark} />
          ))}
          <L5dGrip x={XS[1]} y={GY} s={0.9 + 0.04 * got(1)} sleeve={sleeves[1][0]} sleeveDark={sleeves[1][1]} />
        </g>
        {/* 3. スクイーズ (思わずぎゅっ) */}
        <g transform={`translate(${shake(2)} 0)`}>
          <Squishy x={XS[2]} y={GY + 175} s={0.95} squeeze={0.25 + 0.6 * got(2)} dent={got(2)} f={f} />
          <L5dGrip x={XS[2]} y={GY + 10} s={0.9 + 0.04 * got(2)} sleeve={sleeves[2][0]} sleeveDark={sleeves[2][1]} />
          {got(2) > 0.3 && [-1, 1].map((d) => (
            <ellipse key={d} cx={XS[2] + d * 96} cy={GY + 70} rx={34 * got(2)} ry={22 * got(2)} fill={YP.sqBody} stroke={C.ink} strokeWidth={4} />
          ))}
        </g>
        {/* 4. マグカップの取っ手 */}
        <g transform={`translate(${shake(3)} 0)`}>
          <path d={`M ${XS[3] - 330} ${GY - 40} L ${XS[3] - 70} ${GY - 40} L ${XS[3] - 84} ${GY + 230} Q ${XS[3] - 200} ${GY + 260} ${XS[3] - 316} ${GY + 230} Z`} fill={C.mug} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <ellipse cx={XS[3] - 200} cy={GY - 40} rx={130} ry={26} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={6} />
          <path d={`M ${XS[3] - 300} ${GY + 60} q 100 30 200 0`} stroke={C.heart} strokeWidth={10} fill="none" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${XS[3] - 250 + i * 50} ${GY - 70} q ${-12 + Math.sin(f / 6 + i) * 8} -30 0 -60`} stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
          ))}
          <path d={`M ${XS[3] - 76} ${GY - 10} Q ${XS[3] + 40} ${GY - 10} ${XS[3] + 30} ${GY + 80} Q ${XS[3] + 20} ${GY + 170} ${XS[3] - 80} ${GY + 170}`} stroke={C.ink} strokeWidth={40} fill="none" />
          <path d={`M ${XS[3] - 76} ${GY - 10} Q ${XS[3] + 40} ${GY - 10} ${XS[3] + 30} ${GY + 80} Q ${XS[3] + 20} ${GY + 170} ${XS[3] - 80} ${GY + 170}`} stroke={C.mug} strokeWidth={26} fill="none" />
          <L5dGrip x={XS[3] + 10} y={GY + 40} s={0.9 + 0.04 * got(3)} sleeve={sleeves[3][0]} sleeveDark={sleeves[3][1]} rot={6} />
        </g>
        {/* テレビの光 (手前から) と、なめていく光の帯 */}
        <rect x={-60} y={300} width={2040} height={840} fill="url(#l5d232tv)" />
        {f < 32 && <rect x={barX - 120} y={-60} width={240} height={1200} fill={C.tvGlow} opacity={0.32} />}
        {/* ぎくっ: 汗とびっくり */}
        {XS.map((x, i) => (
          <g key={i}>
            <L5dBang x={x + 120} y={GY - 230} t={got(i)} />
            <L5dSweat x={x - 110} y={GY - 190} t={got(i)} />
            {got(i) > 0 && (
              <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={got(i)}>
                <line x1={x - 150} y1={GY - 90} x2={x - 190} y2={GY - 110} />
                <line x1={x + 150} y1={GY - 90} x2={x + 190} y2={GY - 110} />
              </g>
            )}
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#233 【山】 それはたぶん、20万年ぶんの、癖です。
// 設計: ★最後の一笑い (最終シーンは結論カードに自動で置き換わるが、絵も作る)。洞窟の焚き火のそばで草の束を握る20万年前の人と、ソファでスクイーズを握る現代の人が、時空を超えて目を合わせて、同時ににっこり
// どこ: 画面の左半分は20万年前の洞窟 (焚き火)、右半分は2026年の夜の居間 (DameSofa・フロアランプ・窓)。真ん中で時空がゆらぐ金色の境目
// 演出: 草の束を握る20万年前の人と、ソファでスクイーズを握る序の会社員 (眼鏡・ワイシャツ)。境目ごしに気づいて目を合わせ、同時ににっこり。そして同時に、きゅっと握る
// 動き: f0〜10 それぞれ握っている / f10〜22 気づいて目を合わせる (驚き) / f22 同時ににっこり・ぴょんと弾む / f28〜36 同時にきゅっと握る / 境目がゆらぎ、光の粒が行き来する / カメラがゆっくり寄る
const Yw233: React.FC<{ f: number }> = ({ f }) => {
  const face: Face = f < 10 ? "normal" : f < 22 ? "surprised" : "smile";
  const look = easeInOut(seg(f, 8, 16));
  const hop = f >= 22 && f < 30 ? -Math.sin(((f - 22) / 8) * Math.PI) * 16 : 0;
  const sq = seg(f, 28, 36);
  const heart = seg(f, 24, 34);
  const seam = (yy: number) => 960 + Math.sin(yy / 70 + f / 5) * 16;
  let seamD = `M ${seam(-60)} -60`;
  for (let yy = -20; yy <= 1140; yy += 40) seamD += ` L ${seam(yy)} ${yy}`;
  const nx = 600, ny = 860, ns = 1.45;
  return (
    <Frame f={f} seed={3233} bg={C.caveMid}>
      <g transform={cam(960, 520, lerp(1.14, 1.22, easeInOut(seg(f, 0, 42))))}>
        {/* 左: 20万年前の洞窟 */}
        <rect x={-60} y={-60} width={1100} height={1200} fill={C.caveMid} />
        {[[120, 140, 260, 160], [700, 90, 300, 110], [380, 520, 160, 90]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveRock : C.caveDark} opacity={0.5} stroke={C.ink} strokeWidth={4} />
        ))}
        <path d="M -60 880 Q 400 860 1040 884 L 1040 1140 L -60 1140 Z" fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
        <L5dGlow x={250} y={760} r={520} f={f} op={0.2} />
        <L5dFire x={250} y={890} s={0.8} f={f} />
        <ellipse cx={nx} cy={ny + 20} rx={220} ry={34} fill={C.grass} stroke={C.ink} strokeWidth={5} />
        <L5dStraws seed={2331} n={16} x={nx - 200} y={ny} w={400} h={30} f={f} len={70} tilt={0.3} />
        {/* 右: 2026年の夜の居間 */}
        <path d={`${seamD} L 1980 1140 L 1980 -60 Z`} fill={C.room} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={1000 + i * 80} y={-60} width={34} height={940} fill={C.roomStripe} />)}
        <rect x={1560} y={120} width={300} height={300} rx={8} fill={C.nightSky} stroke={C.ink} strokeWidth={7} />
        <line x1={1710} y1={120} x2={1710} y2={420} stroke={C.ink} strokeWidth={6} />
        <circle cx={1790} cy={190} r={32} fill={C.moon} />
        <rect x={1088} y={240} width={12} height={640} fill={C.ink} />
        <path d="M 1034 170 L 1154 170 L 1180 270 L 1008 270 Z" fill={C.lampCore} stroke={C.ink} strokeWidth={6} />
        <L5dGlow x={1094} y={290} r={220} f={f} op={0.16} color={C.lamp} />
        <rect x={980} y={880} width={1000} height={260} fill={C.floorWood} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={1400} cy={920} rx={420} ry={44} fill={C.rug} stroke={C.ink} strokeWidth={5} />
        {/* 20万年前の人 (草の束を握る) */}
        <g transform={`translate(0 ${hop})`}>
          <L5dNeander x={nx} y={ny} s={ns} f={f} pose="hold" face={face} gaze={[lerp(0, 9, look), 0]} lean={lerp(0, 5, look)} phase={0.2} />
          <L5dGrassBundle x={nx + 4} y={ny - 118 * ns + 22} s={0.85} f={f} squeeze={sq} rot={-62} />
          <circle cx={nx - 16} cy={ny - 118 * ns + 6} r={13} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <circle cx={nx + 24} cy={ny - 118 * ns + 6} r={13} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* 2026年の会社員 (ソファでスクイーズを握る) */}
        <DameSofa x={1400} y={900} s={1.1} sink={0.7} f={f}>
          <g transform={`translate(0 ${hop / 1.1})`}>
            <Person x={0} y={-90} s={1.3} f={f} pose="hold" face={face} glasses cloth={C.shirt} clothDark={C.tie}
              gaze={[lerp(0, -9, look), 0]} lean={lerp(0, -5, look)} phase={0.6} />
            <g transform={`translate(0 ${-90 + Math.sin((f + 0.6 * 17) / 13) * 3}) scale(1.3) rotate(${lerp(0, -5, look)})`}>
              <path d="M -24 -160 L 0 -140 L 24 -160 Z" fill={KRP.white} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
              <path d="M -7 -150 L 7 -150 L 5 -138 L -5 -138 Z" fill={C.tie} stroke={C.ink} strokeWidth={3} />
            </g>
            <Squishy x={0} y={-90 - 118 * 1.3 + 30} s={0.34} f={f} squeeze={sq * 0.7} dent={sq} />
            <circle cx={-20} cy={-90 - 118 * 1.3 + 22} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
            <circle cx={20} cy={-90 - 118 * 1.3 + 22} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          </g>
        </DameSofa>
        {/* 時空の境目 (金色にゆらぐ) */}
        <path d={seamD} stroke={YP.glow} strokeWidth={60} fill="none" opacity={0.35} />
        <path d={seamD} stroke={C.ink} strokeWidth={14} fill="none" />
        <path d={seamD} stroke={C.gold} strokeWidth={8} fill="none" />
        {Array.from({ length: 8 }, (_, i) => {
          const p = ((f * 1.2 + i * 17) % 60) / 60;
          const yy = 120 + i * 90;
          const dir = i % 2 ? 1 : -1;
          return <circle key={i} cx={seam(yy) + dir * (p * 160 - 80)} cy={yy} r={6 + 4 * Math.sin(p * Math.PI)} fill={YP.glowCore} stroke={C.ink} strokeWidth={2} opacity={Math.sin(p * Math.PI)} />;
        })}
        {/* 目が合った線と、にっこりのハート */}
        {look > 0 && f < 24 && (
          <line x1={nx + 110} y1={ny - 228 * ns} x2={1400 - 130} y2={460} stroke={C.ink} strokeWidth={4} strokeDasharray="14 12" opacity={look * 0.6} />
        )}
        <L5dHeart x={seam(420) - 40} y={420 - heart * 40} s={1.6} t={heart} />
        <L5dHeart x={seam(380) + 40} y={380 - heart * 30} s={1.2} t={seg(f, 27, 36)} />
        {/* 時代の札 */}
        <TagPlate x={420} y={235} text="20万年前" size={40} t={seg(f, 0, 8)} />
        <TagPlate x={1500} y={235} text="2026年" size={40} t={seg(f, 2, 10)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_221: (f) => <Yw221 f={f} />,
  yw_222: (f) => <Yw222 f={f} />,
  yw_223: (f) => <Yw223 f={f} />,
  yw_224: (f) => <Yw224 f={f} />,
  yw_225: (f) => <Yw225 f={f} />,
  yw_226: (f) => <Yw226 f={f} />,
  yw_227: (f) => <Yw227 f={f} />,
  yw_228: (f) => <Yw228 f={f} />,
  yw_229: (f) => <Yw229 f={f} />,
  yw_230: (f) => <Yw230 f={f} />,
  yw_231: (f) => <Yw231 f={f} />,
  yw_232: (f) => <Yw232 f={f} />,
  yw_233: (f) => <Yw233 f={f} />,
};

export const YW_G4_MOTIFS: string[] = [
  "yw_221",
  "yw_222",
  "yw_223",
  "yw_224",
  "yw_225",
  "yw_226",
  "yw_227",
  "yw_228",
  "yw_229",
  "yw_230",
  "yw_231",
  "yw_232",
  "yw_233",
];

export const yawaG4Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
