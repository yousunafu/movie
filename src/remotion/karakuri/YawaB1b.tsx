// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#29〜#37 (9文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed はこのファイルでは 2030〜2038。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Squishy/DameSofa/AgeDial/KaradaChizu) は設計書で指定された文でだけ使う

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
  caveDark: "#2B231E",
  caveMid: "#463830",
  caveRock: "#6A5747",
  caveLight: "#8C7660",
  caveWarm: "#A3805C",
  rockSect: "#7A6957",
  rockSectDark: "#5A4B3D",
  stone: "#8E8478",
  stoneDark: "#6C6358",
  fire: "#EE8A30",
  fireMid: "#F6B441",
  fireCore: "#FFE59A",
  ember: "#D9502C",
  snow: "#F5F8FB",
  snowShade: "#D3E0EB",
  skyWinter: "#BCD2E3",
  skyWinterHi: "#DCE8F1",
  pine: "#3E7D4F",
  pineDark: "#2A5B39",
  pineFar: "#7FA88A",
  bark: "#6E4B30",
  leaf: "#2E6A3A",
  leafDark: "#1E4A29",
  leafVein: "#6FA86A",
  leafShine: "#D6EED0",
  leafDry: "#9C7A44",
  leafDryDark: "#7A5C30",
  oil: "#F4E9A2",
  straw: "#D9C485",
  strawDeep: "#A38B52",
  grass: "#C2AC63",
  grassDark: "#957F45",
  grassGreen: "#93A85E",
  hide: "#C9A578",
  hideDark: "#9E7C52",
  cold: "#7DB4E0",
  coldDeep: "#4F8CC4",
  night: "#1C2340",
  nightHi: "#2E3A62",
  star: "#FFF4C8",
  moon: "#F5EABF",
  linen: "#DCCBA6",
  linenDark: "#B9A47C",
  stitch: "#86704F",
  bug: "#5A4A3E",
  centi: "#B5573A",
  centiDark: "#8A3E28",
  wing: "#E8F2F8",
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
// ゆっくり入って・ゆっくり止まる (寄りのカメラ用)
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
// 決まった見た目にするための擬似乱数 (レンダのたびに変わらない。Math.random 禁止)
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;
const cam = (cx: number, cy: number, s: number, tx = 0, ty = 0) =>
  `translate(${cx + tx} ${cy + ty}) scale(${s}) translate(${-cx} ${-cy})`;
// 点 (lx,ly) を Person と同じ変換 (scale→rotate(lean)) で世界座標へ
const rotPt = (x: number, y: number, s: number, lean: number, lx: number, ly: number): [number, number] => {
  const a = (lean * Math.PI) / 180;
  const px = lx * s, py = ly * s;
  return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
};

type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";

// ネアンデルタール人/20万年前の人: Person + 太い眉の骨 + 鼻 + 毛皮の服のふち。rot で寝かせる
const YdNeander: React.FC<{
  x: number; y: number; s: number; f: number; face?: Face; pose?: Pose; lean?: number;
  phase?: number; gaze?: [number, number]; pointDir?: 1 | -1; still?: boolean; rot?: number;
  sleep?: boolean; cloth?: string; clothDark?: string;
}> = ({ x, y, s, f, face = "normal", pose = "stand", lean = 0, phase = 0, gaze, pointDir,
  still = false, rot = 0, sleep = false, cloth = YP.fur, clothDark = YP.furDark }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} phase={phase}
        gaze={gaze} pointDir={pointDir} still={still} cloth={cloth} clothDark={clothDark} hair="cap" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 毛皮の服: 肩から斜めの継ぎ目と、裾のぎざぎざ */}
        <path d="M -46 -158 Q -6 -118 44 -60" fill="none" stroke={clothDark} strokeWidth={6} strokeLinecap="round" />
        <path d="M -56 -64 L -44 -52 L -30 -64 L -16 -52 L -2 -64 L 12 -52 L 26 -64 L 40 -52 L 56 -64"
          fill="none" stroke={clothDark} strokeWidth={5} strokeLinejoin="round" />
        {[-34, 0, 30].map((dx, i) => (
          <path key={i} d={`M ${dx} ${-140 + i * 18} l 6 -8 l 6 8`} fill="none" stroke={clothDark} strokeWidth={4} strokeLinecap="round" />
        ))}
        {sleep && (
          <g>
            <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
            <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
            <g fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round">
              <path d="M -36 -222 Q -24 -211 -12 -222" />
              <path d="M 12 -222 Q 24 -211 36 -222" />
            </g>
          </g>
        )}
        {/* 太い眉 (眉の骨のでっぱり) */}
        <g fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round">
          <path d="M -42 -243 Q -24 -257 -6 -247" />
          <path d="M 6 -247 Q 24 -257 42 -243" />
        </g>
        {/* 鼻 */}
        <path d="M -3 -212 Q -11 -199 1 -197 Q 9 -198 8 -205" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

// 焚き火 (石の輪・薪・3層の炎・火の粉)。y は地面
const YdFire: React.FC<{ x: number; y: number; s?: number; f: number; low?: boolean }> = ({ x, y, s = 1, f, low = false }) => {
  const fl = (k: number) => 1 + Math.sin(f / 2.3 + k * 1.7) * 0.12 + Math.sin(f / 3.7 + k) * 0.08;
  const flame = (h: number, w: number, sw: number) =>
    `M ${-w} 0 C ${-w} ${-h * 0.35} ${-w * 0.3 + sw} ${-h * 0.6} ${sw} ${-h} C ${w * 0.3 + sw} ${-h * 0.6} ${w} ${-h * 0.35} ${w} 0 Z`;
  const H0 = low ? 70 : 200;
  const sw = Math.sin(f / 3) * 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 奥の石 */}
      {[-90, -40, 20, 80].map((dx, i) => (
        <ellipse key={i} cx={dx} cy={-14} rx={34} ry={20} fill={C.stoneDark} stroke={C.ink} strokeWidth={5} />
      ))}
      {/* 薪 */}
      <rect x={-110} y={-30} width={220} height={28} rx={14} fill={YP.wood} stroke={C.ink} strokeWidth={5} transform="rotate(-14)" />
      <rect x={-110} y={-30} width={220} height={28} rx={14} fill={YP.woodDark} stroke={C.ink} strokeWidth={5} transform="rotate(16)" />
      <circle cx={-104} cy={-2} r={10} fill={YP.woodDark} stroke={C.ink} strokeWidth={3} transform="rotate(16)" />
      {/* 炎 */}
      <path d={flame(H0 * 0.62 * fl(2), 40, -46 + sw * 0.6)} fill={C.fire} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={flame(H0 * 0.58 * fl(3), 38, 44 + sw * 0.6)} fill={C.fire} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={flame(H0 * fl(0), 78, sw)} fill={C.fire} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={flame(H0 * 0.7 * fl(1), 54, sw * 0.7)} fill={C.fireMid} />
      <path d={flame(H0 * 0.4 * fl(4), 30, sw * 0.4)} fill={C.fireCore} />
      {/* 火の粉 */}
      {!low && Array.from({ length: 6 }, (_, i) => {
        const p = ((f + i * 9) % 40) / 40;
        return (
          <circle key={i} cx={(rnd(77, i) - 0.5) * 120 + Math.sin(f / 4 + i) * 14} cy={-60 - p * 260}
            r={5 - p * 3} fill={C.fireCore} opacity={1 - p} />
        );
      })}
      {/* 手前の石 */}
      {[-120, -60, 0, 62, 122].map((dx, i) => (
        <ellipse key={i} cx={dx} cy={4} rx={36} ry={22} fill={i % 2 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={5} />
      ))}
    </g>
  );
};

// 焚き火の明かり (半透明のオレンジの輪を重ねる)
const YdGlow: React.FC<{ x: number; y: number; r: number; f: number; op?: number; color?: string }> = ({ x, y, r, f, op = 0.22, color = C.fire }) => {
  const k = 1 + Math.sin(f / 2.7) * 0.04 + Math.sin(f / 4.3) * 0.03;
  return (
    <g>
      {[1, 0.72, 0.45].map((m, i) => (
        <circle key={i} cx={x} cy={y} r={r * m * k} fill={color} opacity={op * (0.5 + i * 0.25)} />
      ))}
    </g>
  );
};

// 草の繊維を何本も (寝床の草)
const YdStraws: React.FC<{ seed: number; n: number; x: number; y: number; w: number; h: number; f: number; len?: number; tilt?: number; sway?: number }> = ({ seed, n, x, y, w, h, f, len = 220, tilt = 0.25, sway = 1 }) => {
  const cols = [C.straw, C.grass, C.grassDark, C.grassGreen];
  return (
    <g strokeLinecap="round" fill="none">
      {Array.from({ length: n }, (_, i) => {
        const sx = x + rnd(seed, i) * w;
        const sy = y + rnd(seed + 1, i) * h;
        const L = len * (0.6 + rnd(seed + 2, i) * 0.6);
        const dir = rnd(seed + 3, i) < 0.5 ? -1 : 1;
        const dy = (rnd(seed + 4, i) - 0.5) * L * tilt;
        const bend = (rnd(seed + 5, i) - 0.5) * 50 + Math.sin(f / 14 + i) * 4 * sway;
        const d = `M ${sx} ${sy} q ${dir * L * 0.5} ${dy * 0.5 + bend} ${dir * L} ${dy}`;
        return (
          <g key={i}>
            <path d={d} stroke={C.ink} strokeWidth={9} opacity={0.55} />
            <path d={d} stroke={cols[i % 4]} strokeWidth={6} />
          </g>
        );
      })}
    </g>
  );
};

// 小さな羽虫 (かわいく)
const YdGnat: React.FC<{ x: number; y: number; s?: number; f: number; dir?: 1 | -1 }> = ({ x, y, s = 1, f, dir = 1 }) => {
  const flap = 9 + Math.sin(f * 1.9 + x) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      <ellipse cx={-6} cy={-16} rx={14} ry={flap} fill={C.wing} stroke={C.ink} strokeWidth={3} opacity={0.85} transform="rotate(-20 -6 -16)" />
      <ellipse cx={8} cy={-16} rx={12} ry={flap * 0.8} fill={C.wing} stroke={C.ink} strokeWidth={3} opacity={0.85} transform="rotate(20 8 -16)" />
      <ellipse cx={0} cy={0} rx={16} ry={10} fill={C.bug} stroke={C.ink} strokeWidth={3.5} />
      <circle cx={16} cy={-2} r={8} fill={C.bug} stroke={C.ink} strokeWidth={3.5} />
      <circle cx={19} cy={-4} r={3} fill={KRP.white} />
      <path d="M 6 9 l -4 9 M -4 9 l -6 8 M 14 7 l 2 9" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

// 蚊 (足と口が長い)
const YdMosquito: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const flap = 10 + Math.sin(f * 2.1 + y) * 7;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-4} cy={-14} rx={20} ry={flap} fill={C.wing} stroke={C.ink} strokeWidth={3} opacity={0.85} transform="rotate(-30 -4 -14)" />
      <path d="M -24 0 Q 0 -8 14 -2" stroke={C.ink} strokeWidth={9} strokeLinecap="round" fill="none" />
      <path d="M -24 0 Q 0 -8 14 -2" stroke={C.bug} strokeWidth={5} strokeLinecap="round" fill="none" />
      <circle cx={20} cy={-4} r={7} fill={C.bug} stroke={C.ink} strokeWidth={3} />
      <line x1={26} y1={-2} x2={46} y2={6} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <path d="M -6 2 l -12 22 M 2 2 l -4 26 M 10 0 l 8 22" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" fill="none" />
    </g>
  );
};

// アリ (歩く)
const YdAnt: React.FC<{ x: number; y: number; s?: number; f: number; k: number }> = ({ x, y, s = 1, f, k }) => {
  const st = Math.sin(f * 1.2 + k) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g stroke={C.ink} strokeWidth={3.5} strokeLinecap="round">
        <line x1={-6} y1={2} x2={-14 + st} y2={16} />
        <line x1={0} y1={2} x2={0 - st} y2={17} />
        <line x1={6} y1={2} x2={14 + st} y2={16} />
        <path d="M -22 -10 q -8 -12 -2 -18" fill="none" />
        <path d="M -18 -12 q 0 -14 8 -18" fill="none" />
      </g>
      <ellipse cx={22} cy={-2} rx={14} ry={10} fill={C.bug} stroke={C.ink} strokeWidth={3.5} />
      <ellipse cx={2} cy={-2} rx={9} ry={7} fill={C.bug} stroke={C.ink} strokeWidth={3.5} />
      <circle cx={-14} cy={-4} r={9} fill={C.bug} stroke={C.ink} strokeWidth={3.5} />
      <circle cx={-17} cy={-6} r={3} fill={KRP.white} />
    </g>
  );
};

// ムカデ (かわいく。節が波打つ)
const YdCentipede: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 9 }, (_, i) => {
      const j = 8 - i;
      const cx = j * 26;
      const cy = Math.sin(f / 2 + j * 0.8) * 4;
      const lg = Math.sin(f * 1.4 + j) * 6;
      return (
        <g key={j}>
          <line x1={cx} y1={cy} x2={cx - 6 + lg} y2={cy + 20} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={cx + 6 - lg} y2={cy - 20} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={15} fill={j % 2 ? C.centiDark : C.centi} stroke={C.ink} strokeWidth={4} />
        </g>
      );
    })}
    <circle cx={-20} cy={-2} r={17} fill={C.centi} stroke={C.ink} strokeWidth={4} />
    <circle cx={-26} cy={-7} r={5} fill={KRP.white} stroke={C.ink} strokeWidth={2} />
    <circle cx={-27} cy={-7} r={2.4} fill={C.ink} />
    <path d="M -30 -14 q -14 -18 -30 -14 M -22 -18 q -6 -20 -20 -26" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
  </g>
);

// 緑の針葉樹 (雪をかぶる)
const YdPine: React.FC<{ x: number; y: number; h: number; far?: boolean }> = ({ x, y, h, far = false }) => {
  const fill = far ? C.pineFar : C.pine;
  return (
    <g>
      <rect x={x - h * 0.04} y={y - h * 0.14} width={h * 0.08} height={h * 0.16} fill={C.bark} stroke={C.ink} strokeWidth={4} />
      {[2, 1, 0].map((i) => {
        const ty = y - h + i * h * 0.26;
        const by = ty + h * 0.44;
        const hw = h * (0.16 + i * 0.1);
        return (
          <g key={i}>
            <path d={`M ${x} ${ty} L ${x - hw} ${by} Q ${x} ${by + 10} ${x + hw} ${by} Z`} fill={fill} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
            {!far && <path d={`M ${x} ${ty} L ${x + hw} ${by} Q ${x + hw * 0.5} ${by + 6} ${x} ${by + 6} Z`} fill={C.pineDark} opacity={0.45} />}
            <path d={`M ${x - hw * 0.34} ${ty + h * 0.15} L ${x} ${ty} L ${x + hw * 0.34} ${ty + h * 0.15} Q ${x + hw * 0.15} ${ty + h * 0.11} ${x} ${ty + h * 0.16} Q ${x - hw * 0.15} ${ty + h * 0.11} ${x - hw * 0.34} ${ty + h * 0.15} Z`}
              fill={C.snow} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
            <path d={`M ${x - hw * 0.9} ${by - 4} q ${hw * 0.3} -10 ${hw * 0.6} 0 q ${hw * 0.3} -8 ${hw * 0.6} 0`} fill="none" stroke={C.snow} strokeWidth={6} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

// 葉の形 (楕円で先がとがる)。原点が葉の中心、横向き
const leafPath = (L: number, Wd: number) => {
  const a = L / 2, b = Wd / 2;
  return `M ${-a} 0 C ${-a * 0.76} ${-b * 0.9} ${-a * 0.24} ${-b * 1.03} ${a * 0.08} ${-b} C ${a * 0.52} ${-b * 0.96} ${a * 0.84} ${-b * 0.54} ${a} 0 C ${a * 0.84} ${b * 0.54} ${a * 0.52} ${b * 0.96} ${a * 0.08} ${b} C ${-a * 0.24} ${b * 1.03} ${-a * 0.76} ${b * 0.9} ${-a} 0 Z`;
};
const YdLeaf: React.FC<{ L: number; Wd: number; fill: string; dark: string; vein: string; sw?: number }> = ({ L, Wd, fill, dark, vein, sw = 7 }) => {
  const a = L / 2, b = Wd / 2;
  const hwAt = (x: number) => b * Math.sqrt(Math.max(0, 1 - (x / a) ** 2));
  return (
    <g>
      <path d={`M ${-a + 10} 2 Q ${-a - 40} 8 ${-a - 90} 22`} stroke={C.ink} strokeWidth={sw * 3.2} strokeLinecap="round" fill="none" />
      <path d={`M ${-a + 10} 2 Q ${-a - 40} 8 ${-a - 90} 22`} stroke={dark} strokeWidth={sw * 2} strokeLinecap="round" fill="none" />
      <path d={leafPath(L, Wd)} fill={fill} />
      <path d={`M ${-a} 0 Q 0 ${-b * 0.06} ${a} 0 C ${a * 0.84} ${b * 0.54} ${a * 0.52} ${b * 0.96} ${a * 0.08} ${b} C ${-a * 0.24} ${b * 1.03} ${-a * 0.76} ${b * 0.9} ${-a} 0 Z`}
        fill={dark} opacity={0.38} />
      <path d={`M ${-a - 10} 4 Q 0 ${-b * 0.06} ${a - 10} 0`} stroke={vein} strokeWidth={sw * 1.3} fill="none" strokeLinecap="round" />
      {Array.from({ length: 7 }, (_, i) => {
        const x0 = -a * 0.8 + i * ((a * 1.5) / 7);
        const x1 = x0 + a * 0.28;
        return [-1, 1].map((sd) => (
          <path key={`${i}${sd}`} d={`M ${x0} ${-b * 0.03} Q ${x0 + a * 0.08} ${sd * hwAt(x0) * 0.45} ${x1} ${sd * hwAt(x1) * 0.82}`}
            stroke={vein} strokeWidth={sw * 0.7} fill="none" strokeLinecap="round" opacity={0.85} />
        ));
      })}
      <path d={leafPath(L, Wd)} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};

// 煙の玉 (ぽん)。t: 0→1
const YdPuff: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 120 }) => {
  if (t <= 0 || t >= 1) return null;
  const e = easeOut(t);
  return (
    <g opacity={1 - t * t}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const d = r * 0.3 + r * 0.9 * e;
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.8} r={r * (0.35 + 0.25 * e)}
          fill={KRP.white} stroke={KRP.gray} strokeWidth={5} />;
      })}
      <circle cx={x} cy={y} r={r * 0.6 * (1 - e * 0.5)} fill={KRP.white} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#29 【並】 その中には、虫よけの成分をふくむ木の葉が、混ぜこまれていました。
// 設計: 楕円で光沢のある葉のアップ。葉脈と油点。葉のまわりに小さな成分の粒が光り、寄ってきた虫が引き返す
// どこ: シブドゥの草の寝床の層の中 (乾いた草と古い葉が重なる上に、新しい1枚)
// 演出: Cryptocarya woodii の葉を画面いっぱいに。油の点がぽつぽつ光り、成分の粒が漂い、羽虫が粒に触れて引き返す
// 動き: カメラがゆっくり寄る / 油点が順に光る / つやの光が葉の上を走る / 羽虫3匹がUターン
const Yw029: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const L = 1000, Wd = 440;
  const glint = -380 + 760 * easeInOut(seg(f, 6, 40));
  // 油の点 (葉の中の座標)
  const dots = Array.from({ length: 18 }, (_, i) => {
    const lx = (rnd(291, i) - 0.5) * L * 0.78;
    let ly = (rnd(292, i) - 0.5) * Wd * 0.66 * Math.sqrt(Math.max(0, 1 - (lx / (L / 2)) ** 2));
    if (Math.abs(ly) < 18) ly += ly < 0 ? -26 : 26;
    return { lx, ly, r: 6 + rnd(293, i) * 4, t: seg(f, 3 + i * 1.6, 7 + i * 1.6) };
  });
  // 成分の粒 (葉のまわりの楕円帯)
  const motes = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + rnd(294, i) * 0.3;
    const rr = 1 + rnd(295, i) * 0.22;
    return {
      x: 960 + Math.cos(a) * 590 * rr + Math.sin(f / 13 + i) * 14,
      y: 430 + Math.sin(a) * 330 * rr + Math.cos(f / 11 + i * 2) * 12,
      r: 7 + rnd(296, i) * 6,
      tw: 0.6 + 0.4 * Math.sin(f / 5 + i),
    };
  });
  // 羽虫: start → touch → back
  const gnats: { s: [number, number]; t: [number, number]; b: [number, number]; d: number }[] = [
    { s: [2000, 560], t: [1590, 470], b: [1800, 690], d: 0 },
    { s: [1720, -60], t: [1400, 150], b: [1640, 70], d: 4 },
    { s: [-80, 420], t: [330, 330], b: [170, 560], d: 2 },
  ];
  return (
    <Frame f={f} seed={2030} bg={C.strawDeep}>
      <g transform={cam(960, 470, zoom)}>
        {/* 寝床の層: 乾いた草が敷きつめられている */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.strawDeep} />
        <YdStraws seed={2901} n={70} x={-120} y={-40} w={2160} h={1160} f={f} len={420} tilt={0.5} sway={0.6} />
        {/* 下に重なった古い葉 (乾いて茶色い葉と、少し古い緑の葉) */}
        <g transform="translate(250 860) rotate(28) scale(0.55)"><YdLeaf L={1000} Wd={440} fill={C.leafDry} dark={C.leafDryDark} vein={C.straw} sw={12} /></g>
        <g transform="translate(1700 230) rotate(-140) scale(0.5)"><YdLeaf L={1000} Wd={440} fill={C.leafDark} dark={C.leafDark} vein={C.leafVein} sw={12} /></g>
        <g transform="translate(1660 900) rotate(165) scale(0.6)"><YdLeaf L={1000} Wd={440} fill={C.leafDry} dark={C.leafDryDark} vein={C.straw} sw={11} /></g>
        <g transform="translate(170 170) rotate(-62) scale(0.45)"><YdLeaf L={1000} Wd={440} fill={C.leafDark} dark={C.leafDark} vein={C.leafVein} sw={13} /></g>
        <YdStraws seed={2902} n={14} x={100} y={720} w={1700} h={260} f={f} len={380} tilt={0.3} />
        {/* 主役の葉の影 */}
        <g transform="translate(984 470) rotate(-15)"><path d={leafPath(L, Wd)} fill={C.ink} opacity={0.28} /></g>
        {/* 主役の葉 */}
        <g transform="translate(960 440) rotate(-15)">
          <YdLeaf L={L} Wd={Wd} fill={C.leaf} dark={C.leafDark} vein={C.leafVein} />
          {/* つや */}
          <path d="M -380 -96 Q -60 -186 300 -122" stroke={C.leafShine} strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.32} />
          <path d="M -300 -120 Q -120 -160 40 -158" stroke={C.leafShine} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.75} />
          <ellipse cx={glint} cy={-150 + (glint / 380) ** 2 * 40} rx={46} ry={13} fill={KRP.white} opacity={0.7} transform={`rotate(${glint / 40} ${glint} -140)`} />
          {/* 葉の上の油の点 (ぽつぽつ光る) */}
          {dots.map((d, i) => d.t > 0 && (
            <g key={i} transform={`translate(${d.lx} ${d.ly}) scale(${pop(d.t)})`}>
              <circle r={d.r * 2.4} fill={C.oil} opacity={0.3 * (0.6 + 0.4 * Math.sin(f / 4 + i))} />
              <circle r={d.r} fill={C.oil} stroke={C.ink} strokeWidth={2.5} />
              <circle cx={-d.r * 0.35} cy={-d.r * 0.35} r={d.r * 0.35} fill={KRP.white} />
              {i % 4 === 0 && (
                <path d={`M 0 ${-d.r * 3} L 0 ${-d.r * 1.6} M 0 ${d.r * 1.6} L 0 ${d.r * 3} M ${-d.r * 3} 0 L ${-d.r * 1.6} 0 M ${d.r * 1.6} 0 L ${d.r * 3} 0`}
                  stroke={KRP.white} strokeWidth={3} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 3 + i)} />
              )}
            </g>
          ))}
        </g>
        {/* 成分の粒が漂う */}
        {motes.map((m, i) => (
          <g key={i} opacity={seg(f, 2, 12)}>
            <circle cx={m.x} cy={m.y} r={m.r * 2} fill={C.oil} opacity={0.22 * m.tw} />
            <circle cx={m.x} cy={m.y} r={m.r} fill={C.oil} stroke={C.ink} strokeWidth={2.5} opacity={0.9} />
          </g>
        ))}
        {/* 羽虫: 粒に触れて引き返す */}
        {gnats.map((g, i) => {
          const u = seg(f, 0, 18 + g.d);
          const v = seg(f, 20 + g.d, 40);
          const x = f < 19 + g.d ? lerp(g.s[0], g.t[0], easeOut(u)) : lerp(g.t[0], g.b[0], easeInOut(v));
          const y = f < 19 + g.d ? lerp(g.s[1], g.t[1], easeOut(u)) : lerp(g.t[1], g.b[1], easeInOut(v));
          const back = f >= 19 + g.d;
          const dir: 1 | -1 = (back ? g.b[0] - g.t[0] : g.t[0] - g.s[0]) > 0 ? 1 : -1;
          const hit = seg(f, 18 + g.d, 30 + g.d);
          return (
            <g key={i}>
              <path d={`M ${g.s[0]} ${g.s[1]} Q ${g.t[0] + (g.t[0] - g.s[0]) * 0.2} ${g.t[1] + 40} ${g.t[0]} ${g.t[1]} Q ${g.t[0] - (g.t[0] - g.s[0]) * 0.1} ${g.t[1] - 60} ${x} ${y}`}
                stroke={C.ink} strokeWidth={4} strokeDasharray="10 12" fill="none" opacity={0.45 * seg(f, 4, 10)} />
              {hit > 0 && hit < 1 && (
                <g opacity={1 - hit}>
                  {[0, 1, 2, 3, 4].map((k) => {
                    const a = (k / 5) * Math.PI * 2;
                    return <line key={k} x1={g.t[0] + Math.cos(a) * 16} y1={g.t[1] + Math.sin(a) * 16}
                      x2={g.t[0] + Math.cos(a) * (28 + hit * 22)} y2={g.t[1] + Math.sin(a) * (28 + hit * 22)}
                      stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />;
                  })}
                </g>
              )}
              <YdGnat x={x} y={y} s={1.5} f={f} dir={dir} />
              {back && (
                <g stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.7}>
                  <line x1={x - dir * 40} y1={y - 10} x2={x - dir * 70} y2={y - 14} />
                  <line x1={x - dir * 40} y1={y + 6} x2={x - dir * 64} y2={y + 8} />
                </g>
              )}
            </g>
          );
        })}
      </g>
      <TagPlate x={640} y={118} text="虫よけの成分" size={44} t={seg(f, 14, 22)} color={C.leafDark} />
    </Frame>
  );
};

// ---- 文#30 【山】 ネアンデルタール人も、洞窟の中で、草の寝床を作っていたことがわかっています。
// 設計: ヨーロッパの寒い洞窟 (入口の外は雪)。ネアンデルタール人の Person が草を敷く。「スペイン」札。息が白い
// どこ: 寒い時代のスペインの洞窟。右の入口の外は雪と緑の針葉樹。入口に氷柱
// 演出: 焚き火を挟んでネアンデルタール人2人。左の人は草の束をほぐして床に敷き、右の人は毛皮の敷物を広げる。息が白い
// 動き: カメラが右(雪)から左へパンしつつ引く / 雪が降る / 草が落ちて床の草が増える / 敷物が床に広がる / 白い息 / 炎 / しずく
const Yw030: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 40));
  const zoom = lerp(1.1, 1.0, k);
  const tx = lerp(-70, 0, k);
  const mouth = "M 1190 800 Q 1170 320 1400 170 Q 1630 60 1880 150 L 1990 150 L 1990 800 Z";
  // 左の人 (草を敷く)
  const A = { x: 640, y: 790, s: 1.25, lean: -16 };
  const B = { x: 1050, y: 790, s: 1.25, lean: 10 };
  const bobA = Math.sin(f / 13) * 3, bobB = Math.sin((f + 17) / 13) * 3;
  const [ahx, ahy] = rotPt(A.x, A.y + bobA, A.s, A.lean, 0, -118);
  const [amx, amy] = rotPt(A.x, A.y + bobA, A.s, A.lean, 0, -186);
  const [blx, bly] = rotPt(B.x, B.y + bobB, B.s, B.lean, -14, -118);
  const [brx, bry] = rotPt(B.x, B.y + bobB, B.s, B.lean, 14, -118);
  const [bmx, bmy] = rotPt(B.x, B.y + bobB, B.s, B.lean, 0, -186);
  const sp = easeOut(seg(f, 4, 38));
  const wave = Math.sin(f / 3) * 8;
  const nGrass = Math.round(8 + 26 * seg(f, 0, 40));
  const breath = (mx: number, my: number, dir: number, ph: number) =>
    [0, 1, 2].map((j) => {
      const p = ((f + j * 10 + ph) % 30) / 30;
      return <circle key={j} cx={mx + dir * (14 + p * 80)} cy={my - p * 60 + Math.sin(f / 4 + j) * 4} r={10 + p * 28}
        fill={C.snow} stroke={C.snowShade} strokeWidth={3} opacity={(1 - p) * 0.9} />;
    });
  return (
    <Frame f={f} seed={2031} bg={C.caveDark}>
      <defs>
        <clipPath id="yd30mouth"><path d={mouth} /></clipPath>
      </defs>
      <g transform={cam(960, 540, zoom, tx)}>
        {/* 外: 冬の空・雪の丘・緑の針葉樹・降る雪 */}
        <g clipPath="url(#yd30mouth)">
          <rect x={1100} y={0} width={900} height={820} fill={C.skyWinter} />
          <rect x={1100} y={0} width={900} height={300} fill={C.skyWinterHi} opacity={0.7} />
          <path d="M 1100 560 Q 1350 470 1560 520 Q 1760 560 2000 480 L 2000 820 L 1100 820 Z" fill={C.snowShade} stroke={C.ink} strokeWidth={4} />
          {[[1330, 560, 150], [1460, 540, 130], [1720, 545, 170], [1870, 520, 140]].map(([x, y, h], i) => <YdPine key={`fp${i}`} x={x} y={y} h={h} far />)}
          <path d="M 1100 680 Q 1400 610 1700 650 Q 1850 670 2000 640 L 2000 820 L 1100 820 Z" fill={C.snow} stroke={C.ink} strokeWidth={5} />
          <YdPine x={1360} y={690} h={330} />
          <YdPine x={1640} y={680} h={400} />
          <YdPine x={1880} y={700} h={300} />
          {Array.from({ length: 46 }, (_, i) => {
            const sx = 1150 + rnd(301, i) * 850 + Math.sin(f / 9 + i) * 16;
            const sy = (rnd(302, i) * 820 + f * (3 + rnd(303, i) * 3)) % 820;
            return <circle key={i} cx={sx} cy={sy} r={4 + rnd(304, i) * 5} fill={C.snow} stroke={C.snowShade} strokeWidth={1.5} />;
          })}
        </g>
        {/* 洞窟の岩 (入口だけくりぬく) */}
        <path d={`M -100 -100 L 2020 -100 L 2020 1180 L -100 1180 Z ${mouth}`} fillRule="evenodd" fill={C.caveMid} />
        <path d={mouth} fill="none" stroke={C.ink} strokeWidth={9} />
        {/* 岩肌の濃淡とひび */}
        {[[200, 220, 260, 150], [620, 120, 300, 110], [960, 300, 200, 160], [300, 520, 220, 120], [1700, 60, 260, 70]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveRock : C.caveDark} opacity={0.55} />
        ))}
        <g stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7}>
          <path d="M 80 300 l 60 40 l 30 -20 l 50 60" />
          <path d="M 760 200 l 40 50 l -20 40 l 30 50" />
          <path d="M 1050 120 l 50 30 l 20 60" />
          <path d="M 420 640 l 50 -30 l 40 20" />
        </g>
        {/* 天井の鍾乳石 */}
        {[120, 330, 560, 820, 1040].map((x, i) => (
          <path key={i} d={`M ${x - 40} -10 Q ${x - 10} ${70 + i * 8} ${x} ${110 + (i % 2) * 40} Q ${x + 10} ${70 + i * 8} ${x + 40} -10 Z`}
            fill={C.caveRock} stroke={C.ink} strokeWidth={5} />
        ))}
        {/* 入口の氷柱 + しずく */}
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const x = lerp(1240, 1860, t);
          const y = t < 0.4 ? lerp(250, 130, t / 0.4) : lerp(130, 160, (t - 0.4) / 0.6);
          const len = 50 + rnd(305, i) * 70;
          const p = ((f + i * 7) % 36) / 36;
          return (
            <g key={i}>
              <path d={`M ${x - 14} ${y - 6} L ${x} ${y + len} L ${x + 14} ${y - 6} Z`} fill={C.snow} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d={`M ${x - 4} ${y} L ${x} ${y + len * 0.7}`} stroke={C.snowShade} strokeWidth={4} />
              {i % 3 === 1 && <ellipse cx={x} cy={y + len + 6 + p * 140} rx={5} ry={8} fill={C.cold} opacity={1 - p} />}
            </g>
          );
        })}
        {/* 入口の雪の吹きだまり */}
        <path d="M 1150 800 Q 1300 740 1500 770 Q 1700 790 1990 750 L 1990 830 L 1150 830 Z" fill={C.snow} stroke={C.ink} strokeWidth={5} />
        {/* 床 */}
        <path d="M -100 780 Q 400 750 900 772 Q 1100 780 1200 800 L 1200 1180 L -100 1180 Z" fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={i} cx={rnd(306, i) * 1250} cy={850 + rnd(307, i) * 200} rx={20 + rnd(308, i) * 30} ry={10 + rnd(309, i) * 10}
            fill={i % 2 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 焚き火の明かり */}
        <YdGlow x={850} y={720} r={440} f={f} op={0.13} />
        {/* 左: 床に敷かれていく草 */}
        <YdStraws seed={3001} n={nGrass} x={250} y={782} w={330} h={34} f={f} len={150} tilt={0.12} sway={0.3} />
        <YdNeander x={A.x} y={A.y} s={A.s} f={f} lean={A.lean} pose="hold" gaze={[-8, 6]} phase={0} />
        {/* 草の束 (手元) と、ほぐれて落ちる草 */}
        <g transform={`translate(${ahx} ${ahy}) rotate(-30)`}>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M ${-60 + i * 4} ${-8 + (i % 3) * 6} q 60 ${-10 + i * 2} 130 ${-6 + (i % 4) * 5}`} stroke={i % 2 ? C.grass : C.grassGreen} strokeWidth={7} strokeLinecap="round" fill="none" />
          ))}
          <rect x={-8} y={-16} width={14} height={30} rx={4} fill={C.grassDark} stroke={C.ink} strokeWidth={3} />
        </g>
        {Array.from({ length: 4 }, (_, i) => {
          const p = ((f + i * 6) % 24) / 24;
          const sx = ahx - 30 - i * 20 - p * 60;
          const sy = ahy + 20 + p * (780 - ahy - 20);
          return <path key={i} d={`M ${sx - 30} ${sy} q 30 ${-14} 60 ${4}`} transform={`rotate(${p * 160 + i * 30} ${sx} ${sy})`}
            stroke={C.grass} strokeWidth={6} strokeLinecap="round" fill="none" opacity={1 - p * 0.3} />;
        })}
        {breath(amx - 20, amy, -1, 0)}
        {/* 焚き火 */}
        <YdFire x={850} y={800} s={0.85} f={f} />
        {/* 右: 毛皮の敷物を広げる人 */}
        <YdNeander x={B.x} y={B.y} s={B.s} f={f} lean={B.lean} pose="hold" gaze={[8, 6]} phase={1} face="normal" />
        <path d={`M ${blx - 26} ${bly - 6} L ${brx + 30} ${bry - 4} Q ${brx + 60 + wave} ${bry + 80} ${1140} 790
          L ${1150 + 300 * sp} ${800 + wave * 0.5 * (1 - sp)} Q ${1180 + 310 * sp} 822 ${1140 + 300 * sp} 834 L 1020 834 Q 990 820 1010 790
          Q ${blx - 30 - wave} ${bly + 90} ${blx - 26} ${bly - 6} Z`}
          fill={C.hide} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={lerp(1040, 1120 + 280 * sp, i / 6)} cy={i < 2 ? lerp(bly + 50, 760, i) : 812}
            rx={16} ry={9} fill={C.hideDark} opacity={0.8} />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const x = lerp(1030, 1140 + 300 * sp, i / 11);
          return <path key={i} d={`M ${x} 834 l 5 12 l 6 -12`} stroke={C.hideDark} strokeWidth={4} fill="none" strokeLinecap="round" />;
        })}
        {/* 手 (敷物をつかむ) */}
        <circle cx={blx} cy={bly} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <circle cx={brx} cy={bry} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        {breath(bmx + 20, bmy, 1, 13)}
      </g>
      {/* ここはどこ */}
      <g transform={`translate(1390 236) scale(${pop(seg(f, 8, 16))})`}>
        <line x1={0} y1={-40} x2={0} y2={60} stroke={C.ink} strokeWidth={6} />
        <rect x={0} y={-40} width={78} height={52} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        <rect x={0} y={-27} width={78} height={26} fill={KRP.yellow} />
        <rect x={0} y={-40} width={78} height={52} fill="none" stroke={C.ink} strokeWidth={4} />
      </g>
      <TagPlate x={1600} y={236} text="スペイン" size={44} t={seg(f, 8, 16)} />
      <TagPlate x={560} y={150} text="ネアンデルタール人" size={40} t={seg(f, 16, 24)} />
    </Frame>
  );
};

// ---- 文#31 【並】 では、なぜわざわざ、寝床を作ったのでしょうか。
// 設計: 洞窟の床に座る Person が、草の束を手に首をかしげる。頭上に `QMark`
// どこ: 洞窟の奥。左に焚き火、その明かりの円が岩壁に。足元はまだ何も敷いていない、ごつごつの岩の床
// 演出: あぐらで座りこんだ人が、草の束を片手に掲げて見つめ、首をかしげる。頭上に？
// 動き: lean がゆっくり傾く / 草の束がゆれる / ？が f10 でぽん+ゆれ / 炎 / カメラが少し寄る
const Yw031: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const s = 1.6, px = 1000, py = 842;
  const lean = -3 - 9 * easeInOut(seg(f, 2, 38));
  const [qx] = rotPt(px, py, s, lean, 0, -292);
  return (
    <Frame f={f} seed={2032} bg={C.caveDark}>
      <g transform={cam(1000, 560, zoom)}>
        {/* 岩壁 */}
        <rect x={-60} y={-60} width={2040} height={900} fill={C.caveMid} />
        <YdGlow x={430} y={600} r={700} f={f} op={0.16} color={C.caveWarm} />
        <YdGlow x={430} y={700} r={420} f={f} op={0.18} />
        {[[180, 200, 300, 160], [760, 120, 340, 130], [1380, 240, 360, 170], [1760, 520, 260, 220], [1100, 520, 220, 110]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveDark : C.caveRock} opacity={0.5} stroke={C.ink} strokeWidth={4} />
        ))}
        <g stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7}>
          <path d="M 640 320 l 40 50 l -10 50 l 40 40" />
          <path d="M 1500 420 l -40 40 l 20 60" />
          <path d="M 1300 120 l 60 20 l 30 50" />
        </g>
        {/* 右奥は暗がり */}
        <rect x={1500} y={-60} width={480} height={900} fill={C.caveDark} opacity={0.5} />
        {/* 岩の床 (まだ何も敷いていない) */}
        <path d="M -60 760 Q 500 720 1000 744 Q 1500 760 1980 730 L 1980 1140 L -60 1140 Z" fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 16 }, (_, i) => {
          const x = 60 + rnd(311, i) * 1800;
          const y = 790 + rnd(312, i) * 240;
          if (Math.abs(x - px) < 220 && y < 880) return null;
          const w = 30 + rnd(313, i) * 40;
          return <path key={i} d={`M ${x - w} ${y} L ${x - w * 0.5} ${y - w * 0.7} L ${x + w * 0.2} ${y - w * 0.9} L ${x + w} ${y - w * 0.3} L ${x + w * 0.8} ${y} Z`}
            fill={i % 2 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />;
        })}
        <g stroke={C.ink} strokeWidth={4} opacity={0.6} fill="none">
          <path d="M 200 820 l 80 20 l 40 -14" /><path d="M 1400 860 l 60 -16 l 50 24" /><path d="M 700 950 l 70 10" />
        </g>
        {/* 焚き火 */}
        <YdFire x={420} y={800} s={0.9} f={f} />
        {/* 集めておいた草の山 (右) */}
        <path d="M 1360 770 Q 1440 650 1560 700 Q 1640 660 1700 770 Z" fill={C.grass} stroke={C.ink} strokeWidth={5} />
        <YdStraws seed={3101} n={16} x={1370} y={690} w={300} h={70} f={f} len={120} tilt={0.6} />
        {/* 座る人 */}
        <YdNeander x={px} y={py} s={s} f={f} lean={lean} pose="point" pointDir={1} gaze={[9, -6]} still face="normal" />
        {/* 片手に持った草の束 (Person と同じ変換の中) */}
        <g transform={`translate(${px} ${py}) scale(${s}) rotate(${lean})`}>
          <g transform={`rotate(${Math.sin(f / 8) * 6} 153 -148)`}>
            {Array.from({ length: 11 }, (_, i) => {
              const dx = (i - 5) * 7;
              return <path key={i} d={`M ${153 + dx * 0.3} -130 Q ${153 + dx} -210 ${150 + dx * 2.2 + Math.sin(f / 6 + i) * 3} ${-290 + Math.abs(dx) * 1.6}`}
                stroke={i % 3 === 0 ? C.grassGreen : i % 3 === 1 ? C.grass : C.straw} strokeWidth={6} strokeLinecap="round" fill="none" />;
            })}
            <rect x={140} y={-176} width={26} height={16} rx={5} fill={C.grassDark} stroke={C.ink} strokeWidth={3} />
            <circle cx={153} cy={-148} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          </g>
        </g>
        {/* あぐらの脚 (Person の脚の前に描く) */}
        <path d={`M ${px - 150} 840 Q ${px - 170} 776 ${px - 80} 774 Q ${px} 790 ${px + 80} 774 Q ${px + 170} 776 ${px + 150} 840 Q ${px} 860 ${px - 150} 840 Z`}
          fill={YP.furDark} stroke={C.ink} strokeWidth={5} />
        <path d={`M ${px - 60} 800 Q ${px} 826 ${px + 60} 800`} fill="none" stroke={C.ink} strokeWidth={4} />
        <ellipse cx={px - 150} cy={826} rx={28} ry={16} fill={C.ink} />
        <ellipse cx={px + 150} cy={826} rx={28} ry={16} fill={C.ink} />
        {/* ？ (ゆれる) */}
        <g transform={`rotate(${Math.sin(f / 7) * 9} ${qx - 30} 260)`}>
          <QMark x={qx - 30} y={300} s={1.3} f={f} t={seg(f, 10, 18)} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#32 【山】 洞窟の床は、硬くて、冷たくて、虫だらけです。
// 設計: 岩の床にじかに寝た Person が3つの事件に襲われる: 背中にごつごつの石 (痛い顔)、床から冷気の青い波、横から虫の行列。3つの札が順に
// どこ: 暗い洞窟の奥の岩の床 (鍾乳石・ひび・小石)。遠くに小さな焚き火
// 演出: 岩にじかに寝た人に3つの災難が順に。①背中の下の尖った石で痛い ②床からの冷気でぶるっ ③右から虫の行列
// 動き: f4 で体がびくっ+痛みの線 / f14 で冷気の波が立ちのぼり体が震える / f24 でアリとムカデが行進 → 驚き顔 / 札が順にぽん / カメラが寄る
const Yw032: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.07 * easeInOut(seg(f, 0, 42));
  const s = 1.45, fx = 1190, fy = 610;
  const floor = fy + 78 * s; // 723
  const face: Face = f >= 24 ? "surprised" : f >= 4 ? "worried" : "normal";
  const jolt = -16 * Math.sin(Math.PI * seg(f, 4, 10));
  const shiver = f >= 15 ? Math.sin(f * 2.7) * 5 * (0.5 + 0.5 * seg(f, 15, 20)) : 0;
  const cold = seg(f, 14, 20);
  const bugX = lerp(1960, 1290, easeOut(seg(f, 24, 40)));
  const pain = seg(f, 4, 9);
  return (
    <Frame f={f} seed={2033} bg={C.caveDark}>
      <g transform={cam(1000, 600, zoom)}>
        {/* 壁と暗がり */}
        <rect x={-60} y={-60} width={2040} height={840} fill={C.caveMid} />
        {[[300, 260, 380, 200], [1000, 160, 420, 150], [1640, 320, 360, 220], [700, 520, 300, 120]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveRock : C.caveDark} opacity={0.5} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 遠くの小さな焚き火 */}
        <YdGlow x={260} y={600} r={200} f={f} op={0.16} />
        <YdFire x={260} y={640} s={0.32} f={f} low />
        <g stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7}>
          <path d="M 520 300 l 40 50 l -10 50" /><path d="M 1400 180 l 50 40 l -20 50 l 40 30" /><path d="M 1760 560 l -40 30" />
        </g>
        {[180, 470, 760, 1150, 1480, 1780].map((x, i) => (
          <path key={i} d={`M ${x - 46} -10 Q ${x - 12} ${80 + (i % 3) * 20} ${x} ${130 + (i % 2) * 60} Q ${x + 12} ${80 + (i % 3) * 20} ${x + 46} -10 Z`}
            fill={C.caveRock} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={-60} y={-60} width={2040} height={260} fill={C.caveDark} opacity={0.45} />
        {/* 岩の床 */}
        <path d={`M -60 ${floor + 6} Q 500 ${floor - 14} 1000 ${floor} Q 1500 ${floor + 10} 1980 ${floor - 10} L 1980 1140 L -60 1140 Z`} fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 18 }, (_, i) => (
          <ellipse key={i} cx={rnd(321, i) * 1900} cy={floor + 50 + rnd(322, i) * 300} rx={18 + rnd(323, i) * 30} ry={9 + rnd(324, i) * 10}
            fill={i % 2 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={4} />
        ))}
        <g stroke={C.ink} strokeWidth={4} opacity={0.6} fill="none"><path d="M 300 800 l 90 20 l 40 -10" /><path d="M 1500 820 l 60 -20 l 70 30" /></g>
        {/* ② 床から立ちのぼる冷気 (体の後ろ) */}
        {[600, 680, 760, 1260, 1340, 1420].map((x, i) => {
          const pts = Array.from({ length: 14 }, (_, j) => {
            const yy = floor - j * 22;
            return `${j ? "L" : "M"} ${x + Math.sin((yy + f * 7 + i * 40) / 26) * 12} ${yy}`;
          }).join(" ");
          return <path key={i} d={pts} stroke={C.cold} strokeWidth={7} fill="none" strokeLinecap="round" opacity={cold * 0.85}
            strokeDasharray={`${40 + 260 * cold} 400`} />;
        })}
        {/* 寝ている人 (頭が左) */}
        <g transform={`translate(${shiver} ${jolt})`}>
          <YdNeander x={fx} y={fy} s={s} f={f} rot={-90} face={face} still />
          {/* 汗 */}
          {f >= 5 && <path d="M 790 520 q -12 20 0 28 q 12 -8 0 -28 Z" fill={C.cold} stroke={C.ink} strokeWidth={3} />}
          {f >= 26 && <path d="M 760 560 q -10 16 0 23 q 10 -7 0 -23 Z" fill={C.cold} stroke={C.ink} strokeWidth={3} />}
          {/* ぶるっ (震えの線) */}
          {cold > 0 && [880, 1060].map((x, i) => (
            <g key={i} stroke={C.coldDeep} strokeWidth={5} fill="none" strokeLinecap="round" opacity={cold}>
              <path d={`M ${x - 20} 470 q 10 -14 0 -28`} transform={`translate(${Math.sin(f * 3 + i) * 4} 0)`} />
              <path d={`M ${x + 6} 466 q 10 -14 0 -28`} transform={`translate(${Math.sin(f * 3 + i + 1) * 4} 0)`} />
            </g>
          ))}
        </g>
        {/* ① 背中の下の尖った石 */}
        {[975, 1040, 1100].map((x, i) => (
          <g key={i}>
            <path d={`M ${x - 32} ${floor + 4} L ${x - 6} ${floor - 30 - i * 4} L ${x + 4} ${floor - 18} L ${x + 30} ${floor + 4} Z`}
              fill={i % 2 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M ${x - 6} ${floor - 30 - i * 4} L ${x - 2} ${floor - 2}`} stroke={C.stone} strokeWidth={3} opacity={0.8} />
          </g>
        ))}
        {/* 痛みの線 */}
        {pain > 0 && (
          <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round" transform={`translate(1040 ${floor - 40}) scale(${pop(pain)})`}>
            {[-150, -120, -60, -30].map((a, i) => {
              const r = (a * Math.PI) / 180;
              return <line key={i} x1={Math.cos(r) * 60} y1={Math.sin(r) * 60 - 120} x2={Math.cos(r) * 100} y2={Math.sin(r) * 100 - 120} />;
            })}
            <path d="M -120 -150 l 14 -16 l 10 14 l 14 -16" fill="none" />
            <path d="M 100 -150 l 14 -16 l 10 14 l 14 -16" fill="none" />
          </g>
        )}
        {/* 体に当たる冷気 (前面・下のふち) */}
        {[880, 1000, 1120].map((x, i) => (
          <path key={i} d={`M ${x - 40} ${floor - 6} q 20 -14 40 0 q 20 14 40 0`} stroke={C.cold} strokeWidth={6} fill="none"
            strokeLinecap="round" opacity={cold * (0.6 + 0.4 * Math.sin(f / 3 + i))} />
        ))}
        {/* ③ 右から虫の行列 */}
        {f >= 24 && (
          <g>
            {[0, 1, 2, 3].map((k) => <YdAnt key={k} x={bugX + k * 62} y={floor + 22} s={1.3} f={f} k={k} />)}
            <YdCentipede x={bugX + 300} y={floor + 26} s={1.3} f={f} />
            <path d={`M ${bugX - 30} ${floor + 50} L ${bugX + 640} ${floor + 50}`} stroke={C.ink} strokeWidth={4} strokeDasharray="6 14" opacity={0.4} />
          </g>
        )}
        {f >= 26 && (
          <text x={700} y={480} fontFamily={FONT} fontWeight={900} fontSize={90} fill={KRP.red} stroke={C.ink} strokeWidth={4}
            paintOrder="stroke" transform={`rotate(-12 700 480)`}>!</text>
        )}
      </g>
      {/* 札と引き出し線 */}
      <g stroke={C.ink} strokeWidth={4} strokeDasharray="10 10" opacity={0.6} fill="none">
        {f >= 8 && <path d="M 1000 240 L 1040 640" />}
        {f >= 18 && <path d="M 620 240 L 660 560" />}
        {f >= 29 && <path d="M 1500 240 L 1450 690" />}
      </g>
      <TagPlate x={1000} y={196} text="硬い" size={56} t={seg(f, 5, 11)} />
      <TagPlate x={620} y={196} text="冷たい" size={56} t={seg(f, 15, 21)} color={KRP.blueDeep} />
      <TagPlate x={1500} y={196} text="虫" size={56} t={seg(f, 26, 32)} color={KRP.red} />
    </Frame>
  );
};

// ---- 文#33 【図】 そこに草を敷けば、体が地面から離れます。
// 設計: 洞窟の床の断面 (世界=岩の断面)。体と岩の間に草の層が挟まり、すき間の矢印。冷気の波が草の層で止まる
// どこ: 洞窟の床を真横に切った断面図。上は洞窟の中の暗い空気、下は地層の筋と小石の入った岩盤
// 演出: 岩の上に草の層 (厚さ80px) が左から敷かれ、寝ている人の体が持ち上がって岩から離れる。下からの冷気は草の層で止まる
// 動き: f4〜20 で草が敷かれて体が上がる / 冷気の波が上へ流れ、f20 以降は草の層の下でぶつかって消える / すき間の両矢印と札
const Yw033: React.FC<{ f: number }> = ({ f }) => {
  const rockTop = 640, grassTop = 560;
  const g = easeOut(seg(f, 4, 20));
  const s = 1.3;
  const lift = lerp(rockTop, grassTop, g);
  const py = lift - 60 * s; // 体の下端が草の上面に少し沈む高さ (検品で修正: 以前は体が草の上に浮いていた)
  const fx = 1160;
  const stopped = f >= 20;
  const arrowT = seg(f, 22, 30);
  return (
    <Frame f={f} seed={2034} bg={C.caveDark}>
      <defs>
        <clipPath id="yd33grass"><rect x={40} y={grassTop - 30} width={1840 * g} height={130} /></clipPath>
      </defs>
      {/* 洞窟の中の空気 */}
      <rect x={-40} y={-40} width={2000} height={rockTop + 40} fill={C.caveMid} />
      <YdGlow x={0} y={420} r={600} f={f} op={0.12} />
      {[200, 560, 980, 1400, 1760].map((x, i) => (
        <path key={i} d={`M ${x - 50} -10 Q ${x - 14} ${70 + (i % 2) * 30} ${x} ${120 + (i % 3) * 30} Q ${x + 14} ${70 + (i % 2) * 30} ${x + 50} -10 Z`}
          fill={C.caveRock} stroke={C.ink} strokeWidth={5} opacity={0.9} />
      ))}
      {/* 岩盤の断面 */}
      <rect x={-40} y={rockTop} width={2000} height={500} fill={C.rockSect} stroke={C.ink} strokeWidth={7} />
      {[700, 780, 870, 960, 1040].map((y, i) => (
        <path key={i} d={`M -40 ${y} Q 300 ${y - 14 + i * 3} 700 ${y + 6} Q 1200 ${y + 18} 1600 ${y - 4} Q 1800 ${y - 12} 1960 ${y + 4}`}
          fill="none" stroke={i % 2 ? C.rockSectDark : C.ink} strokeWidth={i % 2 ? 10 : 4} opacity={i % 2 ? 0.6 : 0.5} />
      ))}
      <rect x={-40} y={880} width={2000} height={260} fill={C.rockSectDark} opacity={0.4} />
      {Array.from({ length: 26 }, (_, i) => (
        <ellipse key={i} cx={rnd(331, i) * 1920} cy={rockTop + 40 + rnd(332, i) * 400} rx={10 + rnd(333, i) * 24} ry={7 + rnd(334, i) * 12}
          fill={i % 3 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={3.5} transform={`rotate(${rnd(335, i) * 60 - 30} ${rnd(331, i) * 1920} ${rockTop + 40 + rnd(332, i) * 400})`} />
      ))}
      {/* 下から上がってくる冷気 */}
      {[180, 420, 660, 900, 1140, 1380, 1620].map((x, i) => {
        const top = stopped ? rockTop + 14 : lerp(1000, 380, seg(f, 0, 18));
        const n = Math.max(2, Math.floor((1060 - top) / 20));
        const pts = Array.from({ length: n }, (_, j) => {
          const yy = 1060 - j * 20;
          return `${j ? "L" : "M"} ${x + Math.sin((yy + f * 8 + i * 30) / 24) * 12} ${yy}`;
        }).join(" ");
        const hit = stopped ? 0.6 + 0.4 * Math.sin(f / 2 + i) : 0;
        return (
          <g key={i}>
            <path d={pts} stroke={C.cold} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
            {stopped && (
              <g stroke={C.coldDeep} strokeWidth={6} strokeLinecap="round" opacity={hit}>
                <line x1={x - 34} y1={rockTop + 8} x2={x - 14} y2={rockTop + 20} />
                <line x1={x + 34} y1={rockTop + 8} x2={x + 14} y2={rockTop + 20} />
                <line x1={x} y1={rockTop + 4} x2={x} y2={rockTop + 14} />
              </g>
            )}
          </g>
        );
      })}
      {/* 草の層 (左から敷かれていく) */}
      <g clipPath="url(#yd33grass)">
        <rect x={40} y={grassTop} width={1840} height={rockTop - grassTop} fill={C.grass} stroke={C.ink} strokeWidth={6} />
        <YdStraws seed={3301} n={90} x={20} y={grassTop + 8} w={1880} h={rockTop - grassTop - 16} f={f} len={150} tilt={0.18} sway={0.4} />
        <path d={Array.from({ length: 47 }, (_, j) => `${j ? "L" : "M"} ${40 + j * 40} ${grassTop - (j % 2 ? 10 : 2)}`).join(" ")}
          stroke={C.grassDark} strokeWidth={6} fill="none" strokeLinejoin="round" />
      </g>
      {/* 寝ている人 (図なので反応はさせない) */}
      <YdNeander x={fx} y={py} s={s} f={f} rot={-90} still />
      {/* すき間の両矢印 */}
      {arrowT > 0 && (
        <g transform={`translate(1290 600) scale(${pop(arrowT)})`}>
          <line x1={0} y1={-26} x2={0} y2={26} stroke={KRP.white} strokeWidth={16} strokeLinecap="round" />
          <line x1={0} y1={-26} x2={0} y2={26} stroke={KRP.red} strokeWidth={8} strokeLinecap="round" />
          <path d="M -18 -22 L 0 -46 L 18 -22 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -18 22 L 0 46 L 18 22 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <line x1={-40} y1={-40} x2={40} y2={-40} stroke={KRP.red} strokeWidth={4} strokeDasharray="8 6" />
          <line x1={-40} y1={40} x2={40} y2={40} stroke={KRP.red} strokeWidth={4} strokeDasharray="8 6" />
        </g>
      )}
      {arrowT > 0 && <path d="M 1330 600 L 1460 470" stroke={C.ink} strokeWidth={4} strokeDasharray="10 8" opacity={0.7} />}
      <TagPlate x={1560} y={440} text="すき間" size={48} t={arrowT} color={KRP.red} />
      <TagPlate x={150} y={480} text="草" size={40} t={seg(f, 14, 20)} />
      <TagPlate x={150} y={720} text="岩" size={40} t={seg(f, 2, 8)} />
      <TagPlate x={1740} y={760} text="冷気" size={38} t={seg(f, 6, 12)} color={KRP.blueDeep} />
    </Frame>
  );
};

// ---- 文#34 【並】 冷えにくく、痛くなく、虫にも食われにくい。
// 設計: 草の寝床ですやすや眠る Person (smile)。3つの札「冷えにくい」「痛くない」「虫が来ない」が順にぽん。蚊が離れていく
// どこ: 焚き火に照らされた洞窟の中の草の寝床 (#32 と同じ岩の床に、今度は草が厚く敷いてある)
// 演出: 草の寝床で、すやすや眠る人 (目は閉じ、口元はゆるむ)。脚には毛皮。蚊は寄りつかずに離れていく
// 動き: 寝息で胸がふくらむ / Z が浮かぶ / 札3枚が f6・f16・f26 で順にぽん / 蚊2匹が右上へ去る / 炎の光がゆらぐ / カメラが寄る
const Yw034: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const s = 1.45, fx = 1180, fy = 612;
  const breathe = 1 + Math.sin(f / 9) * 0.015;
  const bedTop = fy + 78 * s;
  return (
    <Frame f={f} seed={2035} bg={C.caveDark}>
      <g transform={cam(960, 600, zoom)}>
        <rect x={-60} y={-60} width={2040} height={840} fill={C.caveMid} />
        <YdGlow x={360} y={640} r={900} f={f} op={0.13} color={C.caveWarm} />
        {[[260, 260, 380, 200], [980, 160, 420, 150], [1650, 300, 360, 220]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveRock : C.caveDark} opacity={0.45} stroke={C.ink} strokeWidth={4} />
        ))}
        {[520, 830, 1300, 1620].map((x, i) => (
          <path key={i} d={`M ${x - 44} -10 Q ${x - 12} ${70 + (i % 2) * 20} ${x} ${120 + (i % 2) * 50} Q ${x + 12} ${70 + (i % 2) * 20} ${x + 44} -10 Z`}
            fill={C.caveRock} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={1500} y={-60} width={480} height={840} fill={C.caveDark} opacity={0.4} />
        {/* 床 */}
        <path d="M -60 760 Q 600 730 1100 750 Q 1600 770 1980 740 L 1980 1140 L -60 1140 Z" fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={rnd(341, i) * 1900} cy={880 + rnd(342, i) * 180} rx={20 + rnd(343, i) * 26} ry={9 + rnd(344, i) * 9}
            fill={i % 2 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 焚き火 */}
        <YdFire x={300} y={810} s={0.85} f={f} />
        {/* 草の寝床 (厚い) */}
        <path d={`M 560 ${bedTop + 70} Q 520 ${bedTop - 10} 640 ${bedTop - 30} Q 900 ${bedTop - 46} 1200 ${bedTop - 30} Q 1400 ${bedTop - 20} 1420 ${bedTop + 70} Z`}
          fill={C.grass} stroke={C.ink} strokeWidth={6} />
        <YdStraws seed={3401} n={46} x={560} y={bedTop - 30} w={840} h={90} f={f} len={130} tilt={0.3} />
        {/* 枕の草のふくらみ */}
        <path d={`M 700 ${bedTop + 4} Q 720 ${bedTop - 70} 820 ${bedTop - 60} Q 900 ${bedTop - 50} 880 ${bedTop + 4} Z`} fill={C.straw} stroke={C.ink} strokeWidth={5} />
        <YdStraws seed={3402} n={10} x={710} y={bedTop - 56} w={150} h={40} f={f} len={70} tilt={0.5} />
        {/* 眠る人 (寝息で少しふくらむ) */}
        <g transform={`translate(1000 ${fy}) scale(1 ${breathe}) translate(-1000 ${-fy})`}>
          <YdNeander x={fx} y={fy} s={s} f={f} rot={-90} face="smile" sleep still />
        </g>
        {/* 脚にかけた毛皮 */}
        <path d={`M 1080 ${fy - 96} Q 1150 ${fy - 116} 1230 ${fy - 90} Q 1250 ${fy} 1236 ${fy + 110} Q 1150 ${fy + 128} 1066 ${fy + 112} Q 1050 ${fy} 1080 ${fy - 96} Z`}
          fill={C.hide} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={1120 + i * 40} cy={fy - 30 + i * 40} rx={16} ry={9} fill={C.hideDark} />)}
        {/* 焚き火の暖かい光が寝床を照らす */}
        <YdGlow x={640} y={680} r={560} f={f} op={0.08} />
        {/* Z */}
        {[0, 1, 2].map((j) => {
          const p = ((f + j * 15) % 45) / 45;
          return (
            <text key={j} x={800 + p * 120} y={500 - p * 170} fontFamily={FONT} fontWeight={900} fontSize={40 + p * 36}
              fill={KRP.white} stroke={C.ink} strokeWidth={4} paintOrder="stroke" opacity={Math.min(1, (1 - p) * 2)}>Z</text>
          );
        })}
        {/* 蚊は寄りつかずに去っていく */}
        {[0, 1].map((i) => {
          const t = seg(f, 4 + i * 6, 42);
          const x = lerp(1300 + i * 40, 1600 + i * 110, easeOut(t));
          const y = lerp(560 - i * 60, 430 - i * 90, easeOut(t)) + Math.sin(f / 3 + i) * 10;
          return (
            <g key={i}>
              <path d={`M ${1260 + i * 40} ${580 - i * 60} Q ${(1260 + x) / 2} ${y + 80} ${x - 30} ${y}`} stroke={C.ink} strokeWidth={4}
                strokeDasharray="8 12" fill="none" opacity={0.5} />
              <YdMosquito x={x} y={y} s={1.5} f={f} />
            </g>
          );
        })}
      </g>
      <TagPlate x={480} y={150} text="冷えにくい" size={42} t={seg(f, 6, 12)} color={KRP.blueDeep} />
      <TagPlate x={960} y={150} text="痛くない" size={42} t={seg(f, 16, 22)} />
      <TagPlate x={1440} y={150} text="虫が来ない" size={42} t={seg(f, 26, 32)} color={KRP.red} />
    </Frame>
  );
};

// ---- 文#35 【山】 最初の柔らかさの役目は、まず、体を守ることだったと考えられます。
// 設計: ★軸 (2つの役割の1つめ)。洞窟の全景にカメラが引く: 焚き火、草の寝床で眠る家族3人、入口の星空。大きな木札「体を守る」
// どこ: 夜の洞窟の全景。右上の洞窟の口から星空と月。中央に焚き火、その左に草の寝床
// 演出: 草の寝床で、毛皮をかけて眠る家族3人 (大人2人の間に子ども)。焚き火の光が岩壁にゆれる。大きな札「体を守る」
// 動き: f0〜30 でカメラが家族の寝顔から全景へ引く / 星がまたたく / 炎と壁の光がゆれる / 寝息の Z / f24〜36 で札
const Yw035: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1.35, 1.0, easeInOut(seg(f, 0, 30)));
  const mouth = "M 1300 600 Q 1280 260 1480 130 Q 1650 40 1840 120 Q 1960 200 1990 330 L 1990 600 Z";
  const people = [
    { x: 870, y: 560, s: 0.7, ph: 0 },
    { x: 800, y: 660, s: 0.5, ph: 2 },
    { x: 880, y: 770, s: 0.7, ph: 4 },
  ];
  const flick = Math.sin(f / 2.5) * 10;
  return (
    <Frame f={f} seed={2036} bg={C.caveDark} dark>
      <defs><clipPath id="yd35mouth"><path d={mouth} /></clipPath></defs>
      <g transform={cam(760, 660, zoom)}>
        {/* 外: 星空と月 */}
        <g clipPath="url(#yd35mouth)">
          <rect x={1200} y={0} width={800} height={620} fill={C.night} />
          <rect x={1200} y={380} width={800} height={240} fill={C.nightHi} opacity={0.7} />
          <circle cx={1700} cy={230} r={64} fill={C.moon} stroke={C.ink} strokeWidth={5} />
          <circle cx={1724} cy={214} r={56} fill={C.night} />
          {Array.from({ length: 30 }, (_, i) => {
            const x = 1300 + rnd(351, i) * 680, y = 80 + rnd(352, i) * 420;
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i * 1.3));
            const r = 3 + rnd(353, i) * 4;
            return <path key={i} d={`M ${x} ${y - r * 2} L ${x + r * 0.5} ${y - r * 0.5} L ${x + r * 2} ${y} L ${x + r * 0.5} ${y + r * 0.5} L ${x} ${y + r * 2} L ${x - r * 0.5} ${y + r * 0.5} L ${x - r * 2} ${y} L ${x - r * 0.5} ${y - r * 0.5} Z`}
              fill={C.star} opacity={tw} />;
          })}
          <path d="M 1200 560 Q 1450 500 1650 540 Q 1850 570 2000 520 L 2000 620 L 1200 620 Z" fill={C.nightHi} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 洞窟の岩 */}
        <path d={`M -400 -300 L 2300 -300 L 2300 1300 L -400 1300 Z ${mouth}`} fillRule="evenodd" fill={C.caveMid} />
        <path d={mouth} fill="none" stroke={C.ink} strokeWidth={9} />
        {/* 焚き火の光が岩壁にゆれる */}
        <ellipse cx={780 + flick} cy={470} rx={460 + flick * 3} ry={330} fill={C.caveWarm} opacity={0.22 + Math.sin(f / 3.1) * 0.04} />
        <ellipse cx={1000 - flick * 0.6} cy={560} rx={300} ry={200} fill={C.fire} opacity={0.12 + Math.sin(f / 2.2) * 0.03} />
        {[[200, 200, 340, 200], [760, 120, 360, 140], [300, 560, 240, 120], [1160, 260, 160, 110]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveRock : C.caveDark} opacity={0.45} stroke={C.ink} strokeWidth={4} />
        ))}
        {[140, 420, 700, 980, 1220].map((x, i) => (
          <path key={i} d={`M ${x - 46} -10 Q ${x - 12} ${70 + (i % 2) * 24} ${x} ${120 + (i % 3) * 30} Q ${x + 12} ${70 + (i % 2) * 24} ${x + 46} -10 Z`}
            fill={C.caveRock} stroke={C.ink} strokeWidth={5} />
        ))}
        {/* 床 */}
        <path d="M -400 800 Q 300 770 900 790 Q 1400 800 2300 770 L 2300 1300 L -400 1300 Z" fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx={rnd(354, i) * 1900} cy={880 + rnd(355, i) * 180} rx={18 + rnd(356, i) * 26} ry={8 + rnd(357, i) * 9}
            fill={i % 2 ? C.stone : C.stoneDark} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 壁ぎわの道具 (毛皮の束と石器) */}
        <path d="M 140 790 Q 150 700 260 710 Q 320 720 320 790 Z" fill={C.hide} stroke={C.ink} strokeWidth={5} />
        <path d="M 360 792 L 380 752 L 420 746 L 436 792 Z" fill={C.stoneDark} stroke={C.ink} strokeWidth={4} />
        {/* 草の寝床 (上から少し見下ろす) */}
        <ellipse cx={790} cy={680} rx={330} ry={176} fill={C.grass} stroke={C.ink} strokeWidth={6} />
        <YdStraws seed={3501} n={40} x={480} y={530} w={620} h={300} f={f} len={110} tilt={0.4} sway={0.4} />
        {/* 家族3人 (頭は左) */}
        {people.map((p, i) => (
          <YdNeander key={i} x={p.x} y={p.y} s={p.s} f={f} rot={-90} face="smile" sleep still phase={p.ph} />
        ))}
        {/* かけた毛皮 (体を包む) */}
        <path d="M 790 500 Q 900 470 1010 510 Q 1050 650 1020 830 Q 900 850 790 830 Q 770 760 810 700 Q 760 660 800 600 Q 770 550 790 500 Z"
          fill={C.hide} stroke={C.ink} strokeWidth={6} />
        {[[860, 560], [930, 640], [880, 730], [960, 780], [980, 560]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={18} ry={10} fill={C.hideDark} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${1012 + Math.sin(i) * 6} ${540 + i * 36} l 14 6 l -12 8`} stroke={C.hideDark} strokeWidth={4} fill="none" strokeLinecap="round" />
        ))}
        {/* 焚き火 */}
        <YdGlow x={1180} y={740} r={330} f={f} op={0.12} />
        <YdFire x={1180} y={810} s={0.9} f={f} />
        {/* Z */}
        {[0, 1].map((j) => {
          const p = ((f + j * 20) % 40) / 40;
          return <text key={j} x={600 + p * 60} y={520 - p * 120} fontFamily={FONT} fontWeight={900} fontSize={30 + p * 24}
            fill={KRP.white} stroke={C.ink} strokeWidth={3.5} paintOrder="stroke" opacity={Math.min(1, (1 - p) * 2)}>Z</text>;
        })}
      </g>
      <TagPlate x={960} y={140} text="体を守る" size={64} t={seg(f, 24, 34)} />
    </Frame>
  );
};

// ---- 文#36 【山】 柔らかさは、まず、背中の下にやってきました。
// 設計: ★リキャップ①。`KaradaChizu` 初登場。背中の座が温かく光る。首・腕・全身・手のひらは点線の空き枠
// どこ: 焚き火に照らされた洞窟の壁の前。人の足元は草の寝床、背中のうしろにも草の寝床の柔らかなふくらみ
// 演出: からだの地図が初登場。背中の座が、うしろの寝床と重なってじわっと灯る。凡例は平たい石の板の上 (背中だけ灯り、ほかは点線)
// 動き: f6〜26 で背中が灯る / 寝床から温かい光の粒が背中へ吸い寄せられる / 炎と壁の光 / 草がそよぐ / カメラが少し寄る
const Yw036: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  const Lb = easeInOut(seg(f, 6, 26));
  const bx = 760, by = 920 - 104 * 2.3; // 背中の座の中心 (≈681)
  return (
    <Frame f={f} seed={2037} bg={C.caveDark}>
      <g transform={cam(860, 560, zoom)}>
        {/* 洞窟の壁 (大きく・薄く) */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.caveMid} />
        <YdGlow x={240} y={700} r={1000} f={f} op={0.12} color={C.caveWarm} />
        {[[160, 180, 320, 200], [800, 90, 420, 120], [1500, 120, 380, 140], [1800, 600, 220, 300]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveRock : C.caveDark} opacity={0.45} stroke={C.ink} strokeWidth={4} />
        ))}
        <g stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6}>
          <path d="M 300 420 l 40 50 l -10 50" /><path d="M 1080 160 l 50 30 l 20 50" />
        </g>
        {/* 床 */}
        <path d="M -60 880 Q 600 860 1200 880 Q 1600 890 1980 870 L 1980 1140 L -60 1140 Z" fill={C.caveRock} stroke={C.ink} strokeWidth={6} />
        {/* 焚き火 (左) */}
        <YdGlow x={200} y={760} r={360} f={f} op={0.18} />
        <YdFire x={200} y={900} s={0.8} f={f} />
        {/* 背中のうしろの草の寝床 (柔らかい曲線) */}
        <g transform={`rotate(${Math.sin(f / 16) * 1.2} ${bx} ${by})`}>
          <path d={`M ${bx - 250} ${by + 260} Q ${bx - 330} ${by - 80} ${bx - 200} ${by - 260} Q ${bx} ${by - 340} ${bx + 200} ${by - 260} Q ${bx + 330} ${by - 80} ${bx + 250} ${by + 260} Q ${bx} ${by + 300} ${bx - 250} ${by + 260} Z`}
            fill={C.grass} stroke={C.ink} strokeWidth={7} />
          <path d={`M ${bx - 190} ${by + 210} Q ${bx - 250} ${by - 60} ${bx - 150} ${by - 200} Q ${bx} ${by - 260} ${bx + 150} ${by - 200} Q ${bx + 250} ${by - 60} ${bx + 190} ${by + 210}`}
            fill="none" stroke={C.grassDark} strokeWidth={6} strokeDasharray="22 14" opacity={0.8} />
          <YdStraws seed={3601} n={40} x={bx - 260} y={by - 260} w={520} h={500} f={f} len={110} tilt={0.6} />
        </g>
        {/* 足元の草の寝床 */}
        <ellipse cx={bx} cy={912} rx={340} ry={46} fill={C.grass} stroke={C.ink} strokeWidth={6} />
        <YdStraws seed={3602} n={22} x={bx - 320} y={880} w={640} h={40} f={f} len={90} tilt={0.3} />
        {/* 凡例の下敷き: 平たい石の板 */}
        <path d="M 1170 18 L 1620 4 L 1640 748 L 1180 764 Z" fill={C.caveDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 1190 36 L 1600 22" stroke={C.caveRock} strokeWidth={6} opacity={0.7} />
        {/* 寝床から背中へ吸い寄せられる光の粒 */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const p = clamp01(((f - 6 + i * 2) % 24) / 24);
          if (f < 6) return null;
          const r = 300 * (1 - easeOut(p));
          return <circle key={i} cx={bx + Math.cos(a) * r} cy={by + Math.sin(a) * r * 0.9} r={7 + 5 * (1 - p)} fill={YP.glow}
            stroke={C.ink} strokeWidth={2} opacity={(1 - p) * 0.9} />;
        })}
        {/* からだの地図 (共有装置) */}
        <KaradaChizu x={760} y={920} s={2.3} f={f} lit={{ back: Lb }} slots />
      </g>
    </Frame>
  );
};

// ---- 文#37 【並】 次の現場で、柔らかいものは、寝床を飛び出して、形を持ちはじめます。
// 設計: 寝床の草が1本ふわりと浮き、くるくる丸まって小さな人形の形に。煙でぽんと変わり、草は完全に消える (変身の法)。第2章の布人形へ
// どこ: 夜の洞窟の草の寝床に寄った画面。右に焚き火の残り火 (熾火)、奥は暗い岩壁
// 演出: 寝床の草が1本ふわりと浮き、くるくる回って丸まり、煙でぽん。草は消えて、麻布の小さな人形 (顔なし) が宙に浮かぶ
// 動き: f4〜16 で草が浮き上がって回る / f16〜24 で丸まる / f24 で煙 (草は完全に消える) / f26〜34 で人形がぽん、ふわふわ / 光の粒がまわる / 熾火がまたたく
const Yw037: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const rise = easeOut(seg(f, 4, 16));
  const curl = easeInOut(seg(f, 16, 24));
  const cx = 960, cy = lerp(740, 430, rise);
  const spin = f * 14;
  const showGrass = f >= 4 && f < 24;
  const dollT = seg(f, 26, 34);
  const bob = Math.sin(f / 7) * 10;
  // 草1本: 長さ一定のまま曲率を上げると丸まる
  const strand = (() => {
    const N = 26, seglen = 15 * (1 - curl * 0.35);
    const k = lerp(0.02, 0.5, curl);
    let x = 0, y = 0, a = 0;
    const pts: [number, number][] = [[0, 0]];
    for (let i = 0; i < N; i++) { a += k; x += Math.cos(a) * seglen; y += Math.sin(a) * seglen; pts.push([x, y]); }
    const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return pts.map(([px, py], i) => `${i ? "L" : "M"} ${(px - mx).toFixed(1)} ${(py - my).toFixed(1)}`).join(" ");
  })();
  return (
    <Frame f={f} seed={2038} bg={C.caveDark} dark>
      <g transform={cam(960, 540, zoom)}>
        {/* 暗い岩壁 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.caveDark} />
        {[[300, 240, 380, 220], [1000, 140, 460, 160], [1640, 300, 360, 240]].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? C.caveMid : C.caveRock} opacity={0.35} stroke={C.ink} strokeWidth={4} />
        ))}
        <YdGlow x={1560} y={720} r={420} f={f} op={0.07} color={C.ember} />
        {/* 草の寝床 (寄り) */}
        <path d="M -60 760 Q 300 700 700 720 Q 1100 700 1360 740 Q 1500 760 1980 740 L 1980 1140 L -60 1140 Z" fill={C.grass} stroke={C.ink} strokeWidth={7} />
        <YdStraws seed={3701} n={80} x={-80} y={720} w={2080} h={340} f={f} len={190} tilt={0.35} />
        <YdStraws seed={3702} n={26} x={100} y={690} w={1300} h={60} f={f} len={150} tilt={0.5} />
        {/* 熾火 (右) */}
        <g>
          {[[1480, 742], [1560, 730], [1640, 746], [1520, 768], [1610, 772]].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={46} ry={22} fill={YP.woodDark} stroke={C.ink} strokeWidth={5} />
              <ellipse cx={x - 6} cy={y - 4} rx={24} ry={9} fill={C.ember} opacity={0.5 + 0.4 * Math.sin(f / 3 + i * 1.7)} />
            </g>
          ))}
          <path d={`M 1560 720 q ${Math.sin(f / 5) * 20} -60 ${Math.sin(f / 4) * 10} -130`} stroke={KRP.gray} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.35} />
          {[0, 1, 2].map((i) => {
            const p = ((f + i * 12) % 36) / 36;
            return <circle key={i} cx={1540 + i * 40 + Math.sin(f / 4 + i) * 10} cy={710 - p * 180} r={4} fill={C.fireMid} opacity={1 - p} />;
          })}
        </g>
        {/* 草が抜けたあとのくぼみ */}
        {f >= 4 && <ellipse cx={960} cy={744} rx={90 * seg(f, 4, 10)} ry={14 * seg(f, 4, 10)} fill={C.grassDark} stroke={C.ink} strokeWidth={4} />}
        {/* 浮かんで丸まる草 (f24 で完全に消える) */}
        {showGrass && (
          <g transform={`translate(${cx} ${cy}) rotate(${spin})`}>
            <path d={strand} stroke={C.ink} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={strand} stroke={C.grassGreen} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {showGrass && rise > 0 && (
          <path d={`M 960 730 Q ${960 + Math.sin(f / 3) * 40} ${(730 + cy) / 2} ${cx} ${cy + 40}`} stroke={YP.glowCore} strokeWidth={5}
            strokeDasharray="6 14" fill="none" opacity={0.6} />
        )}
        {/* 煙の玉 */}
        <YdPuff x={960} y={430} t={seg(f, 23, 33)} r={130} />
        {f >= 33 && [0, 1, 2].map((i) => (
          <circle key={i} cx={860 + i * 100} cy={300 - seg(f, 33, 42) * 40} r={16} fill={KRP.white} opacity={0.3 * (1 - seg(f, 33, 42))} />
        ))}
        {/* 麻布の小さな人形 (顔なし) */}
        {dollT > 0 && (
          <g transform={`translate(960 ${450 + bob}) scale(${pop(dollT)}) rotate(${Math.sin(f / 9) * 5})`}>
            <circle r={230} fill={YP.glow} opacity={0.16} />
            <circle r={160} fill={YP.glowCore} opacity={0.14} />
            {/* 手足 */}
            {[[-100, -20, -30], [100, -20, 30], [-50, 140, -10], [50, 140, 10]].map(([x, y, r], i) => (
              <g key={i} transform={`rotate(${r + Math.sin(f / 6 + i) * 4} ${x * 0.6} ${y * 0.6})`}>
                <ellipse cx={x} cy={y} rx={i < 2 ? 46 : 36} ry={i < 2 ? 30 : 46} fill={C.linen} stroke={C.ink} strokeWidth={6} />
                <ellipse cx={x} cy={y} rx={i < 2 ? 32 : 24} ry={i < 2 ? 18 : 32} fill="none" stroke={C.stitch} strokeWidth={3.5} strokeDasharray="7 7" />
              </g>
            ))}
            {/* 胴 */}
            <path d="M -76 -60 Q -96 60 -70 120 Q 0 146 70 120 Q 96 60 76 -60 Q 0 -84 -76 -60 Z" fill={C.linen} stroke={C.ink} strokeWidth={6.5} />
            <path d="M 0 -70 L 0 128" stroke={C.stitch} strokeWidth={4} strokeDasharray="9 8" />
            <path d="M -56 -42 Q -74 60 -52 104" fill="none" stroke={C.linenDark} strokeWidth={8} opacity={0.7} />
            {/* 継ぎ当て */}
            <rect x={18} y={20} width={44} height={40} rx={6} fill={C.linenDark} stroke={C.ink} strokeWidth={4} transform="rotate(8 40 40)" />
            <rect x={24} y={26} width={32} height={28} rx={4} fill="none" stroke={C.stitch} strokeWidth={3} strokeDasharray="5 5" transform="rotate(8 40 40)" />
            {/* 首のひも */}
            <path d="M -48 -70 Q 0 -54 48 -70" stroke={C.grassDark} strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d="M 30 -64 l 16 26 M 34 -64 l 26 18" stroke={C.grassDark} strokeWidth={6} strokeLinecap="round" />
            {/* 頭 (顔は描かない) */}
            <circle cx={0} cy={-140} r={74} fill={C.linen} stroke={C.ink} strokeWidth={6.5} />
            <path d="M -74 -140 Q 0 -126 74 -140" fill="none" stroke={C.stitch} strokeWidth={4} strokeDasharray="9 8" />
            <path d="M -44 -186 Q -30 -204 -6 -208" stroke={KRP.white} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.6} />
            {[[-20, -108], [30, -170], [-40, 40], [10, 90]].map(([x, y], i) => (
              <path key={i} d={`M ${x} ${y} l 8 3 M ${x + 2} ${y + 8} l 9 -2`} stroke={C.linenDark} strokeWidth={3} strokeLinecap="round" />
            ))}
          </g>
        )}
        {/* 光の粒がまわる */}
        {f >= 24 && Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + f / 12;
          const r = 260 + Math.sin(f / 5 + i) * 20;
          const x = 960 + Math.cos(a) * r, y = 450 + bob + Math.sin(a) * r * 0.6;
          const sz = 6 + (i % 3) * 3;
          return <path key={i} d={`M ${x} ${y - sz * 2} L ${x + sz * 0.5} ${y - sz * 0.5} L ${x + sz * 2} ${y} L ${x + sz * 0.5} ${y + sz * 0.5} L ${x} ${y + sz * 2} L ${x - sz * 0.5} ${y + sz * 0.5} L ${x - sz * 2} ${y} L ${x - sz * 0.5} ${y - sz * 0.5} Z`}
            fill={YP.glowCore} opacity={(0.5 + 0.5 * Math.sin(f / 3 + i)) * seg(f, 24, 30)} />;
        })}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_029: (f) => <Yw029 f={f} />,
  yw_030: (f) => <Yw030 f={f} />,
  yw_031: (f) => <Yw031 f={f} />,
  yw_032: (f) => <Yw032 f={f} />,
  yw_033: (f) => <Yw033 f={f} />,
  yw_034: (f) => <Yw034 f={f} />,
  yw_035: (f) => <Yw035 f={f} />,
  yw_036: (f) => <Yw036 f={f} />,
  yw_037: (f) => <Yw037 f={f} />,
};

export const YW_B1B_MOTIFS: string[] = [
  "yw_029",
  "yw_030",
  "yw_031",
  "yw_032",
  "yw_033",
  "yw_034",
  "yw_035",
  "yw_036",
  "yw_037",
];

export const yawaB1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
