// 人は、なぜ暇をつぶすのか: 文#83〜#94 (12文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 名前の出る実在の人物は顔を見せない (後ろ姿・手元)。ロゴは描かない

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru, MaruBatsu,
} from "./HimaShared";
import {
  HP, Monosashi, monoSlot, Sousa, Sagyozukue, YoruNoHeya, YoruNoHeyaFront, EkiHome, EkiBenchFront,
  KyukeiBoard, ShockRoom, Sumaho, YasumiCalendar,
} from "./HimaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/HP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void HP; void Monosashi; void monoSlot; void Sousa; void Sagyozukue; void YoruNoHeya; void YoruNoHeyaFront;
void EkiHome; void EkiBenchFront; void KyukeiBoard; void ShockRoom; void Sumaho; void YasumiCalendar;
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

const C2 = {
  wallGreen: "#5E7A5A",
  wallGreenDark: "#465E43",
  wood: "#8E5E36",
  woodDark: "#6A4226",
  woodLight: "#B98A58",
  stone: "#C9BFAE",
  stoneDark: "#A89C88",
  brick: "#B5654A",
  brickDark: "#8E4A35",
  benchGreen: "#4F8A5A",
  benchGreenDark: "#386B43",
  purple: "#7A5A9A",
  skin: "#FDFBF7",
  skirt: "#6A5A7A",
  apron: "#F3EEE4",
  scarf: "#C9A27A",
  capBrown: "#7A5638",
  smoke: "#9A938A",
  night: "#3E3A55",
  lampGlow: "#FFE3A0",
  pie: "#E0A85A",
  pieDark: "#B47A36",
  pieIn: "#C9563E",
  washi: "#F4EAD2",
  sky: "#9FD3F0",
  skyDeep: "#6FB4E0",
  green8: "#3FA35A",
  gold: "#D9B23C",
  stripe: "#8A6AA0",
} as const;

// 24時間の文字盤。start時 から hours 時間ぶんの帯を color で塗る (t で帯が伸びる)。
// x,y 中心 / r 半径。frame=true で帯を太い枠線で囲む
const HmEDial: React.FC<{
  x: number; y: number; r: number; f: number; start?: number; hours?: number; t?: number;
  color?: string; fill?: string; hand?: number; nums?: boolean;
}> = ({ x, y, r, f, start = 0, hours = 0, t = 1, color = KRP.red, fill, hand, nums = true }) => {
  const a0 = (start / 24) * Math.PI * 2;
  const a1 = ((start + hours * clamp01(t)) / 24) * Math.PI * 2;
  const pt = (a: number, rr: number) => [Math.sin(a) * rr, -Math.cos(a) * rr];
  const ro = r * 0.92, ri = r * 0.42;
  const [ox0, oy0] = pt(a0, ro), [ox1, oy1] = pt(a1, ro), [ix0, iy0] = pt(a0, ri), [ix1, iy1] = pt(a1, ri);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const band = `M ${ix0} ${iy0} L ${ox0} ${oy0} A ${ro} ${ro} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${ri} ${ri} 0 ${large} 0 ${ix0} ${iy0} Z`;
  const ha = hand ?? (f * 2) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 14} fill={KRP.ink} opacity={0.2} transform="translate(10 12)" />
      <circle r={r + 14} fill={HP.brass} stroke={KRP.ink} strokeWidth={8} />
      <circle r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {hours > 0 && t > 0 && (
        <path d={band} fill={fill ?? color} fillOpacity={0.35} stroke={color} strokeWidth={10} strokeLinejoin="round" />
      )}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const big = i % 6 === 0;
        const [x1, y1] = pt(a, r * 0.96), [x2, y2] = pt(a, r * (big ? 0.82 : 0.88));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={big ? 7 : 4} strokeLinecap="round" />;
      })}
      {nums && [0, 6, 12, 18].map((n) => {
        const [nx, ny] = pt((n / 24) * Math.PI * 2, r * 0.68);
        return <text key={n} x={nx} y={ny + r * 0.06} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={r * 0.16} fill={KRP.ink}>{n === 0 ? 24 : n}</text>;
      })}
      <line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={KRP.ink} strokeWidth={r * 0.05} strokeLinecap="round" transform={`rotate(${ha})`} />
      <circle r={r * 0.07} fill={KRP.ink} />
      <circle r={r * 0.03} fill={HP.brass} />
    </g>
  );
};

// 19世紀の女性の長いスカート・エプロン・頭巾 (Person の上に重ねる)。x,y,s は Person と同じ
const HmEDress: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; skirt?: string; scarf?: string; stripe?: boolean; lean?: number }> = ({
  x, y, s, f, phase = 0, skirt = C2.skirt, scarf = C2.scarf, stripe = false, lean = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <path d="M -60 -100 L -78 -6 Q 0 6 78 -6 L 60 -100 Z" fill={skirt} stroke={KRP.ink} strokeWidth={5} />
      {stripe && [-40, -14, 14, 40].map((k) => <line key={k} x1={k * 0.9} y1={-96} x2={k * 1.2} y2={-8} stroke={KRP.white} strokeWidth={4} opacity={0.6} />)}
      <path d="M -36 -150 L 36 -150 L 44 -20 L -44 -20 Z" fill={C2.apron} stroke={KRP.ink} strokeWidth={4} />
      <line x1={-50} y1={-110} x2={50} y2={-110} stroke={KRP.ink} strokeWidth={4} />
      {/* 頭巾 */}
      <path d="M -68 -236 Q -70 -300 0 -302 Q 70 -300 68 -236 Q 40 -262 0 -264 Q -40 -262 -68 -236 Z" fill={scarf} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -66 -240 Q -80 -200 -70 -180" stroke={scarf} strokeWidth={14} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ハンチング帽 (若者) / シルクハット (工場主)
const HmECap: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; color?: string; lean?: number }> = ({ x, y, s, f, phase = 0, color = C2.capBrown, lean = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean}) translate(0 -12)`}>
      <path d="M -66 -262 Q -60 -316 0 -320 Q 62 -316 68 -262 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -70 -262 Q 0 -252 94 -258 Q 102 -246 90 -242 Q 0 -238 -70 -250 Z" fill={KRP.ink} opacity={0.75} />
    </g>
  );
};
const HmETopHat: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; lean?: number }> = ({ x, y, s, f, phase = 0, lean = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <rect x={-48} y={-392} width={96} height={112} rx={8} fill={KRP.ink} />
      <rect x={-50} y={-310} width={100} height={20} fill={KRP.red} opacity={0.8} />
      <ellipse cx={0} cy={-282} rx={86} ry={16} fill={KRP.ink} />
    </g>
  );
};

// 小旗 (国名は書かない。色の組み合わせだけの架空の旗。jp=true で日の丸)
const HmEFlag: React.FC<{ x: number; y: number; s?: number; f: number; cols?: string[]; jp?: boolean; k?: number }> = ({ x, y, s = 1, f, cols = [KRP.blueDeep, KRP.white, KRP.red], jp = false, k = 0 }) => {
  const wv = Math.sin(f / 5 + k) * 6;
  const d = `M 0 -110 q 30 ${-8 + wv} 60 0 q 30 ${8 - wv} 60 0 l 0 70 q -30 ${-8 + wv} -60 0 q -30 ${8 - wv} -60 0 Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-4} y={-120} width={8} height={120} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={0} cy={-122} r={7} fill={C2.gold} stroke={KRP.ink} strokeWidth={3} />
      {jp ? (
        <g>
          <path d={d} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={60} cy={-75} r={20} fill={KRP.red} />
        </g>
      ) : (
        <g>
          <path d={d} fill={cols[0]} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 40 -112 l 0 72`} stroke={cols[1]} strokeWidth={26} opacity={0.95} />
          <path d={`M 84 -112 l 0 72`} stroke={cols[2]} strokeWidth={26} opacity={0.95} />
          <path d={d} fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #83 時計は、長く働かせるのにも、とても便利だったのです。
// 格: 山 / seed 5083
// 絵: どこ: 19世紀の工場主の事務室 (重い机・金庫・窓から工場)。演出: 太った工場主 (シルクハット・後ろ姿でなくてよい・一般人) が、懐中時計を見ながらにんまり (face="smile")。窓の外の工場の時計の針が、工場主の手のつまみでくるっと進められる (比喩。誇張しすぎない)。動き: 懐中時計のふた / 針が進む / にんまり
// どこ: 19世紀の工場主の事務室。深緑の壁紙・重い机・左に金庫・右の窓から煙突と時計塔の工場
// 演出: 太った工場主 (シルクハット・口ひげ) が懐中時計のふたを開け、竜頭をくるっと回すと、窓の外の工場の時計の針も同じだけ進む。にんまり
// 動き: ふたが開く (f4-14) / 竜頭を回す→2つの時計の針が進む (f14-38) / カメラが懐中時計へ少し寄る
const Hm083: React.FC<{ f: number }> = ({ f }) => {
  const lid = easeOut(seg(f, 4, 14));
  const turn = easeInOut(seg(f, 14, 38));
  const minA = 30 + turn * 300; // 長針
  const hourA = 240 + turn * 25;
  const cam = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const ox = 760, oy = 830, os = 1.45;
  const wx = ox + 30, wy = oy - 118 * os - 10; // 懐中時計
  const spin = turn > 0 && turn < 1;
  return (
    <Frame f={f} seed={5083} bg={C2.wallGreen}>
      <g transform={`translate(${wx} ${wy}) scale(${cam}) translate(${-wx} ${-wy})`}>
        {/* 壁紙 (縦じま+小さな菱形) */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C2.wallGreen} />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={i * 80 - 40} y={-60} width={30} height={1200} fill={C2.wallGreenDark} opacity={0.35} />
        ))}
        {Array.from({ length: 26 }, (_, i) => Array.from({ length: 9 }, (_, j) => (
          <path key={`${i}-${j}`} d={`M ${i * 80 + 15} ${j * 120 + 40} l 10 14 l -10 14 l -10 -14 Z`} fill={C2.gold} opacity={0.35} />
        )))}
        {/* 腰板 */}
        <rect x={-60} y={640} width={2040} height={500} fill={C2.woodDark} />
        <rect x={-60} y={630} width={2040} height={22} fill={C2.wood} stroke={KRP.ink} strokeWidth={5} />
        {/* 窓 (右): 外は煙った空・煙突・時計塔 */}
        <g>
          <rect x={1160} y={90} width={620} height={480} fill="#CFC7B8" stroke={KRP.ink} strokeWidth={9} />
          <rect x={1160} y={400} width={620} height={170} fill="#B7AC9C" />
          {/* 工場の建物 */}
          <rect x={1180} y={330} width={580} height={240} fill={C2.brick} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M ${1180 + i * 97} 330 l 48 -46 l 49 46`} fill={C2.brickDark} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {Array.from({ length: 2 }, (_, r) => Array.from({ length: 7 }, (_, c) => (
            <rect key={`${r}${c}`} x={1200 + c * 80} y={380 + r * 80} width={44} height={50} fill="#F2D88A" stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
          )))}
          {/* 煙突と煙 */}
          {[1250, 1700].map((cx, i) => (
            <g key={cx}>
              <rect x={cx - 22} y={150} width={44} height={150} fill={C2.brickDark} stroke={KRP.ink} strokeWidth={5} />
              {[0, 1, 2].map((k) => {
                const p = ((f * 0.8 + k * 14 + i * 7) % 42) / 42;
                return <circle key={k} cx={cx + p * 60} cy={140 - p * 70} r={16 + p * 22} fill={C2.smoke} opacity={0.7 * (1 - p)} />;
              })}
            </g>
          ))}
          {/* 時計塔 */}
          <rect x={1390} y={130} width={140} height={200} fill={C2.stoneDark} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1380 130 L 1460 70 L 1540 130 Z" fill={C2.brickDark} stroke={KRP.ink} strokeWidth={6} />
          <g transform="translate(1460 210)">
            <circle r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-46} x2={0} y2={-52} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
            <line x1={0} y1={0} x2={0} y2={-28} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${hourA})`} />
            <line x1={0} y1={0} x2={0} y2={-44} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" transform={`rotate(${minA})`} />
            <circle r={6} fill={KRP.ink} />
            {spin && <path d="M 64 -30 A 70 70 0 0 1 64 30" stroke={KRP.red} strokeWidth={6} fill="none" strokeDasharray="10 8" />}
          </g>
          {/* 窓枠の十字・カーテン */}
          <line x1={1470} y1={90} x2={1470} y2={570} stroke={KRP.ink} strokeWidth={4} opacity={0.0} />
          <line x1={1160} y1={350} x2={1780} y2={350} stroke={C2.woodDark} strokeWidth={10} opacity={0.0} />
          <path d={`M 1130 70 L 1130 600 Q ${1200 + Math.sin(f / 18) * 5} 520 1220 70 Z`} fill="#8E3A3A" stroke={KRP.ink} strokeWidth={6} />
          <path d={`M 1810 70 L 1810 600 Q ${1740 + Math.sin(f / 18) * 5} 520 1720 70 Z`} fill="#8E3A3A" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1110} y={60} width={720} height={26} rx={10} fill={C2.gold} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 金庫 (左) */}
        <g>
          <rect x={90} y={420} width={330} height={420} rx={14} fill="#4E5A52" stroke={KRP.ink} strokeWidth={8} />
          <rect x={120} y={450} width={270} height={360} rx={8} fill="#5E6B62" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={255} cy={600} r={62} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`rotate(${f * 1.5} 255 600)`}>
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={255} y1={548} x2={255} y2={560} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${i * 30} 255 600)`} />)}
          </g>
          <rect x={340} y={560} width={26} height={90} rx={8} fill={C2.gold} stroke={KRP.ink} strokeWidth={4} />
          <rect x={150} y={470} width={90} height={26} rx={4} fill={C2.gold} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 壁の額 (帳簿の棒グラフ。右肩上がり) */}
        <g>
          <rect x={520} y={110} width={360} height={260} fill={C2.gold} stroke={KRP.ink} strokeWidth={7} />
          <rect x={545} y={135} width={310} height={210} fill={C2.washi} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={575 + i * 56} y={320 - 30 - i * 34} width={36} height={30 + i * 34} fill={i === 4 ? KRP.red : C2.wood} stroke={KRP.ink} strokeWidth={3} />
          ))}
          <path d="M 570 300 L 840 170" stroke={KRP.ink} strokeWidth={4} strokeDasharray="8 6" fill="none" />
        </g>
        {/* 工場主 */}
        <Person x={ox} y={oy} s={os} f={f} face="smile" pose="hold" cloth="#3B3A48" clothDark="#2A2933" hair="none" phase={2} />
        <g transform={`translate(${ox} ${oy + Math.sin((f + 34) / 13) * 3}) scale(${os})`}>
          {/* 大きなおなかとチョッキ */}
          <ellipse cx={0} cy={-82} rx={78} ry={44} fill="#8E3A3A" stroke={KRP.ink} strokeWidth={5} />
          {[-96, -80, -64].map((by) => <circle key={by} cx={0} cy={by + 4} r={4.5} fill={C2.gold} stroke={KRP.ink} strokeWidth={2} />)}
          {/* 懐中時計の鎖 */}
          <path d="M -50 -90 Q -20 -60 18 -112" stroke={C2.gold} strokeWidth={5} fill="none" />
          {/* 口ひげ・ほお */}
          <path d="M -34 -204 Q -18 -216 0 -204 Q 18 -216 34 -204 Q 40 -194 46 -200" stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M -34 -204 Q -40 -194 -46 -200" stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          <ellipse cx={-44} cy={-200} rx={11} ry={7} fill="#E8A3A0" opacity={0.7} />
          <ellipse cx={44} cy={-200} rx={11} ry={7} fill="#E8A3A0" opacity={0.7} />
          {/* 横の髪 */}
          <path d="M -64 -250 Q -72 -226 -62 -206" stroke={KRP.grayDark} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M 64 -250 Q 72 -226 62 -206" stroke={KRP.grayDark} strokeWidth={12} fill="none" strokeLinecap="round" />
        </g>
        <HmETopHat x={ox} y={oy} s={os} f={f} phase={2} />
        {/* 懐中時計 (手の中) */}
        <g transform={`translate(${wx} ${wy})`}>
          <circle r={64} fill={C2.gold} stroke={KRP.ink} strokeWidth={6} />
          <circle r={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-42} x2={0} y2={-48} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${i * 30})`} />)}
          <line x1={0} y1={0} x2={0} y2={-24} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${hourA})`} />
          <line x1={0} y1={0} x2={0} y2={-40} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" transform={`rotate(${minA})`} />
          <circle r={5} fill={KRP.ink} />
          {/* 竜頭 */}
          <rect x={-10} y={-84} width={20} height={20} rx={4} fill={C2.gold} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-92} r={9} fill="none" stroke={C2.gold} strokeWidth={5} />
          {/* ふた (左のちょうつがいで開く) */}
          <g transform={`translate(-64 0) scale(${1 - lid * 1.9} 1) translate(64 0)`}>
            <circle r={64} fill={C2.gold} stroke={KRP.ink} strokeWidth={6} />
            <circle r={40} fill="none" stroke={HP.brassDark} strokeWidth={4} />
            <path d="M -20 -10 l 20 -14 l 20 14" stroke={HP.brassDark} strokeWidth={4} fill="none" />
          </g>
          {/* 竜頭を回す指と回転の矢印 */}
          <circle cx={22} cy={-90} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {spin && (
            <g transform={`rotate(${f * 20} 0 -92)`}>
              <path d="M -26 -92 A 26 26 0 0 1 0 -118" stroke={KRP.red} strokeWidth={5} fill="none" />
              <path d="M 0 -118 l -10 -4 l 4 10 Z" fill={KRP.red} />
            </g>
          )}
        </g>
        {/* 懐中時計 と 窓の時計 をつなぐ点線 (同じ針) */}
        <path d={`M ${wx + 70} ${wy - 40} Q 1200 420 1400 260`} stroke={KRP.red} strokeWidth={5} fill="none"
          strokeDasharray="14 12" strokeDashoffset={-f * 3} opacity={0.75 * seg(f, 12, 18)} />
        {/* 机 (手前) */}
        <g>
          <rect x={260} y={760} width={1100} height={40} rx={6} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={7} />
          <rect x={290} y={800} width={1040} height={320} fill={C2.wood} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1].map((k) => <rect key={k} x={330 + k * 640} y={830} width={320} height={110} rx={8} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={5} />)}
          {[0, 1].map((k) => <circle key={k} cx={490 + k * 640} cy={885} r={12} fill={C2.gold} stroke={KRP.ink} strokeWidth={3} />)}
          {/* 帳簿・インク壺・羽ペン・金貨の山 */}
          <rect x={360} y={724} width={230} height={40} rx={4} fill="#7A2E2E" stroke={KRP.ink} strokeWidth={5} />
          <rect x={372} y={716} width={206} height={12} fill={C2.washi} stroke={KRP.ink} strokeWidth={3} />
          <rect x={1060} y={710} width={60} height={52} rx={8} fill={KRP.ink} />
          <path d="M 1090 712 Q 1130 640 1180 610" stroke={KRP.white} strokeWidth={8} fill="none" />
          <path d="M 1150 630 Q 1190 600 1186 596" stroke={KRP.ink} strokeWidth={3} fill="none" />
          {[0, 1, 2, 3, 4].map((k) => <ellipse key={k} cx={1220} cy={754 - k * 12} rx={40} ry={11} fill={C2.gold} stroke={KRP.ink} strokeWidth={3} />)}
          {[0, 1, 2].map((k) => <ellipse key={k} cx={1290} cy={754 - k * 12} rx={40} ry={11} fill={C2.gold} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #84 そこで人々は、時計で区切られた時間を、法律で短くしようとします。
// 格: 山 / seed 5084
// 絵: どこ: 19世紀のイギリスの議会の前の広場 (石造りの建物・旗)。演出: 働く人たち (帽子・エプロン) がのぼり (字なし。時計に×のマーク) を掲げて集まる。巨大な時計の針を、ロープで引っ張って**戻そうとする**綱引き。動き: 綱引き / のぼりのはためき / 針が少し戻る
// どこ: 19世紀イギリスの議会の前の石畳の広場。石造りの建物 (尖った窓)・屋根の旗・真ん中に大時計の塔
// 演出: 大時計の長針にロープを結び、滑車を通して、帽子とエプロンの働く人たちが綱引きで針を「戻そう」とする。右では仲間が、時計に×ののぼりを振って応援
// 動き: 綱引き (体が後ろへ倒れる・ゆれる) / 長針が少しずつ戻る (f6-36) / のぼりと旗がはためく / カメラがゆっくり左へパン
const Hm084: React.FC<{ f: number }> = ({ f }) => {
  const tug = easeOut(seg(f, 6, 36));
  const wob = Math.sin(f / 4) * 1.5;
  const handA = 252 - 16 * tug + wob * 0.6;
  const cx = 1060, cy = 330, R = 190;
  const tipx = cx + Math.sin((handA * Math.PI) / 180) * 168, tipy = cy - Math.cos((handA * Math.PI) / 180) * 168;
  const px = 900, py = 690; // 滑車
  const ropeY = 690;
  const pan = -30 * easeOut(seg(f, 0, 42));
  const pullers: { x: number; kind: "man" | "woman" | "boy"; ph: number }[] = [
    { x: 760, kind: "man", ph: 1 }, { x: 600, kind: "woman", ph: 2 }, { x: 440, kind: "boy", ph: 3 }, { x: 280, kind: "man", ph: 4 },
  ];
  return (
    <Frame f={f} seed={5084} bg={KRP.paperCool}>
      <g transform={`translate(${pan} 0)`}>
        {/* 空 */}
        <rect x={-80} y={-60} width={2100} height={700} fill="#C9D6DE" />
        {[[300, 120], [1500, 90], [1800, 180]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x + Math.sin(f / 30 + i) * 8} ${y})`} fill={KRP.white} opacity={0.8}>
            <ellipse rx={90} ry={30} /><ellipse cx={60} cy={-16} rx={60} ry={30} /><ellipse cx={-50} cy={-10} rx={50} ry={24} />
          </g>
        ))}
        {/* 議会の建物 (石・尖った窓) */}
        <rect x={-80} y={250} width={2100} height={420} fill={C2.stone} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i}>
            <path d={`M ${i * 150 - 20} 250 l 0 -40 l 20 -30 l 20 30 l 0 40`} fill={C2.stoneDark} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${i * 150 + 30} 560 l 0 -170 q 30 -60 60 0 l 0 170 Z`} fill="#5E6A78" stroke={KRP.ink} strokeWidth={5} />
            <line x1={i * 150 + 60} y1={360} x2={i * 150 + 60} y2={560} stroke={C2.stone} strokeWidth={4} />
            <line x1={i * 150 + 30} y1={460} x2={i * 150 + 90} y2={460} stroke={C2.stone} strokeWidth={4} />
          </g>
        ))}
        <rect x={-80} y={600} width={2100} height={30} fill={C2.stoneDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 屋根の旗 */}
        {[180, 1700].map((x, i) => <HmEFlag key={x} x={x} y={220} s={1} f={f} k={i} cols={[KRP.red, KRP.white, KRP.blueDeep]} />)}
        {/* 時計塔 */}
        <rect x={cx - 240} y={80} width={480} height={560} fill={C2.stoneDark} stroke={KRP.ink} strokeWidth={8} />
        <path d={`M ${cx - 260} 90 L ${cx} -60 L ${cx + 260} 90 Z`} fill="#6A7A6A" stroke={KRP.ink} strokeWidth={8} />
        {[-180, 180].map((d) => <rect key={d} x={cx + d - 20} y={120} width={40} height={500} fill={C2.stone} stroke={KRP.ink} strokeWidth={4} />)}
        <circle cx={cx} cy={cy} r={R + 24} fill={C2.gold} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={cx} cy={cy} r={R} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={cx} y1={cy - R + 14} x2={cx} y2={cy - R + (i % 3 ? 34 : 50)} stroke={KRP.ink} strokeWidth={i % 3 ? 6 : 10}
            strokeLinecap="round" transform={`rotate(${i * 30} ${cx} ${cy})`} />
        ))}
        <line x1={cx} y1={cy} x2={cx} y2={cy - 100} stroke={KRP.ink} strokeWidth={18} strokeLinecap="round" transform={`rotate(${150 - 2 * tug} ${cx} ${cy})`} />
        <line x1={tipx} y1={tipy} x2={cx} y2={cy} stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={16} fill={KRP.ink} />
        {/* 戻る向きの矢印 */}
        <g opacity={seg(f, 10, 18)}>
          <path d={`M ${cx - 60} ${cy + 230} A 240 240 0 0 1 ${cx - 236} ${cy + 40}`} stroke={KRP.red} strokeWidth={10} fill="none" strokeDasharray="22 14"
            strokeDashoffset={f * 2} transform={`rotate(-40 ${cx} ${cy})`} opacity={0} />
          <Arrow x={tipx - 70} y={tipy - 60} s={0.7} rot={-110} t={seg(f, 10, 20)} />
        </g>
        {/* 石畳 */}
        <rect x={-80} y={630} width={2100} height={520} fill="#B9AE9C" />
        {Array.from({ length: 7 }, (_, r) => Array.from({ length: 22 }, (_, c) => (
          <rect key={`${r}-${c}`} x={c * 100 - 80 + (r % 2) * 50} y={650 + r * 64} width={90} height={54} rx={14}
            fill={(r + c) % 3 ? "#C9BFAE" : "#B0A592"} stroke={KRP.ink} strokeWidth={2.5} opacity={0.9} />
        )))}
        {/* ロープ: 針の先 → 滑車 → 綱を引く人たち */}
        <g>
          <rect x={px - 16} y={py - 10} width={32} height={150} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={px} cy={py} r={30} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={px} cy={py} r={8} fill={KRP.ink} />
          <line x1={px} y1={py} x2={px + 18} y2={py - 18} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${-f * 12} ${px} ${py})`} />
          <path d={`M ${tipx} ${tipy} Q ${(tipx + px + 30) / 2 + wob * 4} ${(tipy + py) / 2} ${px + 26} ${py - 10}`} stroke="#B48A4E" strokeWidth={10} fill="none" />
          <path d={`M ${px} ${py - 30} L 160 ${ropeY - 30 + wob}`} stroke="#B48A4E" strokeWidth={10} fill="none" />
          <path d={`M ${px} ${py - 30} L 160 ${ropeY - 30 + wob}`} stroke={KRP.ink} strokeWidth={2} strokeDasharray="6 10" fill="none" />
          <circle cx={tipx} cy={tipy} r={12} fill="#B48A4E" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {pullers.map((p, i) => {
          const s = 0.92;
          const ln = -10 - 6 * tug + Math.sin(f / 4 + i) * 2;
          const y = ropeY - 30 + 104;
          return (
            <g key={i}>
              <Person x={p.x} y={y} s={s} f={f} phase={p.ph} pose="hold" lean={ln}
                face={i % 2 ? "angry" : "worried"} cloth={p.kind === "woman" ? "#7A5A7A" : "#5E6A78"} clothDark="#3E4656"
                hair={p.kind === "woman" ? "none" : "cap"} />
              {p.kind === "woman" && <HmEDress x={p.x} y={y} s={s} f={f} phase={p.ph} lean={ln} />}
              {p.kind !== "woman" && <HmECap x={p.x} y={y} s={s} f={f} phase={p.ph} lean={ln} color={p.kind === "boy" ? "#8A6A44" : "#5A4A3A"} />}
              {/* 汗 */}
              <path d={`M ${p.x - 70} ${y - 210} q -8 14 0 20 q 8 -6 0 -20`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2}
                opacity={0.5 + 0.5 * Math.sin(f / 3 + i)} />
            </g>
          );
        })}
        {/* 応援の人たち (右)。のぼりは字なし・時計に× */}
        {[1340, 1560, 1780].map((x, i) => {
          const bx = x + 40, by = 300;
          const wv = Math.sin(f / 5 + i * 1.3) * 10;
          return (
            <g key={x}>
              <rect x={bx - 5} y={by} width={10} height={420} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${bx} ${by} q 70 ${wv} 150 0 l 0 170 q -80 ${-wv} -150 0 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={bx + 75} cy={by + 85} r={46} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
              <line x1={bx + 75} y1={by + 85} x2={bx + 75} y2={by + 55} stroke={KRP.ink} strokeWidth={5} />
              <line x1={bx + 75} y1={by + 85} x2={bx + 98} y2={by + 85} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${bx + 30} ${by + 40} L ${bx + 120} ${by + 130} M ${bx + 120} ${by + 40} L ${bx + 30} ${by + 130}`} stroke={KRP.red} strokeWidth={11} strokeLinecap="round" />
              <Person x={x} y={840} s={0.82} f={f} phase={i + 5} pose="raise" face={i === 1 ? "joy" : "angry"}
                cloth={i === 1 ? "#7A5A7A" : "#5E6A78"} clothDark="#3E4656" hair={i === 1 ? "none" : "cap"} />
              {i === 1 ? <HmEDress x={x} y={840} s={0.82} f={f} phase={i + 5} /> : <HmECap x={x} y={840} s={0.82} f={f} phase={i + 5} />}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #85 1847年、イギリスで、1日10時間まで、という法律ができます。
// 格: 山 / seed 5085
// 絵: どこ: イギリスの議会の中 (緑の長椅子・木の机)。年代札「1847年」地名札「イギリス」。演出: 法律の巻物が広げられ、大きな時計の文字盤に「10時間」の範囲が赤い枠で囲まれる。議員たち (一般人) が拍手。木槌 (ゆっくり1回)。動き: 巻物が広がる / 赤い枠が描かれる / 拍手
// どこ: 1847年イギリスの議会の中。木の羽目板の壁・緑の長椅子が左右に段々・真ん中に木の机と議長の椅子
// 演出: 机の上で法律の巻物が左右にころころ広がり、議長席の上の大きな1日の文字盤に「10時間」の範囲が赤い枠で描かれる。左右の議員が拍手。議長の木槌がゆっくり1回
// 動き: 巻物が広がる (f2-16) / 赤い枠が伸びる (f14-34) / 拍手 / 木槌 (f34-40で1回) / カメラが文字盤へ少し寄る
const Hm085: React.FC<{ f: number }> = ({ f }) => {
  const roll = easeOut(seg(f, 2, 16));
  const band = easeInOut(seg(f, 14, 34));
  const gav = seg(f, 32, 38);
  const gavA = gav < 0.6 ? -40 * (gav / 0.6) : -40 * (1 - (gav - 0.6) / 0.4);
  const hit = seg(f, 37, 42);
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const clap = (i: number) => Math.abs(Math.sin(f / 2.2 + i)) ;
  const members = (side: -1 | 1) => [0, 1, 2].map((row) => [0, 1, 2].map((k) => {
    const x = side < 0 ? 90 + k * 140 + row * 40 : 1830 - k * 140 - row * 40;
    const y = 840 - row * 120;
    const s = 0.62 - row * 0.06;
    return { x, y, s, row, k };
  })).flat();
  return (
    <Frame f={f} seed={5085} bg={C2.woodDark}>
      <g transform={`translate(960 330) scale(${cam}) translate(-960 -330)`}>
        {/* 羽目板の壁 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C2.woodDark} />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i}>
            <path d={`M ${i * 150 - 40} 560 l 0 -360 q 55 -70 110 0 l 0 360 Z`} fill={C2.wood} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${i * 150 - 10} 540 l 0 -300 q 25 -36 50 0 l 0 300 Z`} fill="none" stroke={C2.woodLight} strokeWidth={3} opacity={0.6} />
          </g>
        ))}
        {/* 高窓の光 */}
        {[200, 1720].map((x) => <path key={x} d={`M ${x - 50} -60 L ${x + 50} -60 L ${x + 160} 700 L ${x - 160} 700 Z`} fill={C2.lampGlow} opacity={0.08 + 0.02 * Math.sin(f / 9)} />)}
        {/* 床の緑のじゅうたんと赤い線 */}
        <rect x={-60} y={860} width={2040} height={300} fill={C2.benchGreenDark} />
        {[900, 1010].map((ry) => <line key={ry} x1={-60} y1={ry} x2={1980} y2={ry} stroke={KRP.red} strokeWidth={8} opacity={0.8} />)}
        {/* 議長の椅子 (高い背もたれ) */}
        <path d="M 760 640 L 760 520 L 1160 520 L 1160 640 Z" fill={C2.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 大きな1日の文字盤 (議長席の上) */}
        <HmEDial x={960} y={330} r={210} f={f} start={6} hours={10} t={band} color={KRP.red} hand={(6 + 10 * band) * 15} />
        <path d="M 760 120 Q 960 40 1160 120" stroke={C2.gold} strokeWidth={10} fill="none" />
        {/* 緑の長椅子 (左右の段) */}
        {[-1, 1].map((side) => (
          <g key={side}>
            {[0, 1, 2].map((row) => {
              const y = 860 - row * 120;
              const x0 = side < 0 ? -60 : 1360 + row * 40;
              const x1 = side < 0 ? 560 - row * 40 : 1980;
              return (
                <g key={row}>
                  <rect x={x0} y={y - 150} width={x1 - x0} height={70} rx={10} fill={C2.benchGreenDark} stroke={KRP.ink} strokeWidth={5} />
                  <rect x={x0} y={y - 84} width={x1 - x0} height={40} rx={10} fill={C2.benchGreen} stroke={KRP.ink} strokeWidth={5} />
                  <rect x={x0} y={y - 44} width={x1 - x0} height={44} fill={C2.wood} stroke={KRP.ink} strokeWidth={5} />
                  {Array.from({ length: 6 }, (_, b) => <circle key={b} cx={x0 + 40 + b * 90} cy={y - 115} r={4} fill={C2.benchGreen} />)}
                </g>
              );
            })}
          </g>
        ))}
        {/* 議員たち (後ろの段から描く) */}
        {[-1, 1].map((side) => members(side as -1 | 1).sort((a, b) => b.row - a.row).map((m, i) => (
          <g key={`${side}-${i}`}>
            <Person x={m.x} y={m.y - 44} s={m.s} f={f} phase={i + (side > 0 ? 9 : 0)} pose="hold"
              face={(i + m.row) % 3 === 0 ? "joy" : "smile"} cloth={["#2E3A4A", "#3B3A48", "#4A3E36"][i % 3]} clothDark="#22262E"
              gaze={[side < 0 ? 4 : -4, -2]} />
            {/* 拍手の手と小さな光 */}
            <g opacity={clap(i)}>
              {[-1, 1].map((d) => <line key={d} x1={m.x + d * 30 * m.s} y1={m.y - 44 - 160 * m.s} x2={m.x + d * 50 * m.s} y2={m.y - 44 - 190 * m.s}
                stroke={C2.lampGlow} strokeWidth={5} strokeLinecap="round" />)}
            </g>
          </g>
        )))}
        {/* 中央の机と巻物 */}
        <g>
          <rect x={560} y={680} width={800} height={36} rx={6} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={7} />
          <rect x={620} y={716} width={680} height={250} fill={C2.wood} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2].map((k) => <rect key={k} x={620 + k * 240} y={746} width={200} height={70} rx={6} fill="none" stroke={C2.woodLight} strokeWidth={4} />)}
          {[650, 1270].map((lx) => <rect key={lx} x={lx - 14} y={960} width={28} height={140} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 金の職杖 (机の手前) */}
          <rect x={640} y={692} width={420} height={18} rx={8} fill={C2.gold} stroke={KRP.ink} strokeWidth={4} transform="translate(-40 40)" />
          <circle cx={600} cy={741} r={26} fill={C2.gold} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 584 716 l 8 -16 l 8 12 l 8 -12 l 8 16 Z" fill={C2.gold} stroke={KRP.ink} strokeWidth={3} />
          {/* 巻物 (真ん中から左右に広がる) */}
          <rect x={960 - 330 * roll} y={650} width={660 * roll} height={44} fill={C2.washi} stroke={KRP.ink} strokeWidth={5} />
          {roll > 0.3 && Array.from({ length: 5 }, (_, k) => (
            <line key={k} x1={960 - 300 * roll + k * 120 * roll} y1={664} x2={960 - 300 * roll + k * 120 * roll + 80 * roll} y2={664}
              stroke={KRP.grayDark} strokeWidth={4} />
          ))}
          {[-1, 1].map((d) => (
            <g key={d} transform={`translate(${960 + d * 330 * roll} 672) rotate(${d * roll * 360})`}>
              <rect x={-18} y={-30} width={36} height={60} rx={10} fill={C2.washi} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-24} y={-36} width={48} height={10} rx={4} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={3} />
              <rect x={-24} y={26} width={48} height={10} rx={4} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {/* 赤いろうの封印 */}
          {roll > 0.8 && <circle cx={960} cy={672} r={16 * pop(seg(f, 13, 20))} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />}
          {/* 木槌と台 */}
          <ellipse cx={1250} cy={680} rx={46} ry={12} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${gavA} 1330 660)`}>
            <rect x={1170} y={650} width={160} height={14} rx={6} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={4} />
            <rect x={1210} y={612} width={44} height={66} rx={10} fill={C2.wood} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {hit > 0 && hit < 1 && [0, 1, 2, 3].map((k) => (
            <line key={k} x1={1250 + Math.cos(k * 1.05 + 3.5) * 40} y1={660 + Math.sin(k * 1.05 + 3.5) * 30}
              x2={1250 + Math.cos(k * 1.05 + 3.5) * (60 + 30 * hit)} y2={660 + Math.sin(k * 1.05 + 3.5) * (40 + 20 * hit)}
              stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" opacity={1 - hit} />
          ))}
        </g>
        <TagPlate x={960} y={600} text="10時間" size={46} t={seg(f, 30, 38)} color={KRP.red} />
      </g>
      <TagPlate x={210} y={190} text="1847年" size={42} t={seg(f, 0, 8)} />
      <TagPlate x={1720} y={110} text="イギリス" size={42} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #86 対象は、繊維工場で働く、女性と若者だけ。大人の男性は、まだ対象外です。
// 格: 山 / seed 5086
// 絵: どこ: イギリスの繊維工場の入口。演出: 入口に「10時間」の札のついた柵。女性 (長いスカート・頭巾) と若者 (ハンチング帽) は柵の内側に入って、6時の鐘で帰っていく。大人の男性たちは柵の外で、まだ機械の前に立ったまま (face="worried")。札「女性」「若者」「対象外」。動き: 鐘が鳴る / 女性と若者が帰る / 男性が見送る
// どこ: 夕方のイギリスの繊維工場の入口。レンガの壁・屋根の鐘・入口の上の時計 (6時)・開いた扉の奥に紡績機
// 演出: 真ん中の柵に「10時間」の札。柵の左 (内側) の女性と若者は、6時の鐘で手を振って帰っていく。柵の右、扉の奥の大人の男性たちは機械の前に立ったまま、困り顔で見送る
// 動き: 鐘がゆれて音の輪 (f0-30) / 女性と若者が左へ歩いて帰る (f8-40) / 男性が首を向けて見送る / 糸巻きが回る
const Hm086: React.FC<{ f: number }> = ({ f }) => {
  const bell = Math.sin(f / 3.2) * 22 * (1 - seg(f, 24, 40) * 0.7);
  const walk = easeInOut(seg(f, 8, 40));
  const goers = [
    { x0: 760, kind: "boy" as const, ph: 1 }, { x0: 600, kind: "boy" as const, ph: 2 },
    { x0: 450, kind: "woman" as const, ph: 3 }, { x0: 290, kind: "woman" as const, ph: 4 },
  ];
  const men = [1180, 1370, 1560];
  return (
    <Frame f={f} seed={5086} bg="#E9B98A">
      {/* 夕方の空 */}
      <rect x={-40} y={-40} width={2000} height={400} fill="#EFB98A" />
      <rect x={-40} y={-40} width={2000} height={140} fill="#C98A7A" opacity={0.6} />
      {/* 工場のレンガの壁 */}
      <rect x={-40} y={170} width={2000} height={640} fill={C2.brick} />
      {Array.from({ length: 22 }, (_, r) => Array.from({ length: 34 }, (_, c) => (
        <rect key={`${r}-${c}`} x={c * 60 - 40 + (r % 2) * 30} y={170 + r * 30} width={56} height={26} fill="none" stroke={C2.brickDark} strokeWidth={2} opacity={0.5} />
      )))}
      <path d="M -40 170 L 1960 170" stroke={KRP.ink} strokeWidth={8} />
      <rect x={-40} y={150} width={2000} height={26} fill={C2.stoneDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 左の窓 (中は暖かい光) */}
      {[120, 420].map((x) => (
        <g key={x}>
          <rect x={x} y={250} width={180} height={220} fill="#F2D88A" stroke={KRP.ink} strokeWidth={6} />
          <line x1={x + 90} y1={250} x2={x + 90} y2={470} stroke={KRP.ink} strokeWidth={4} />
          <line x1={x} y1={360} x2={x + 180} y2={360} stroke={KRP.ink} strokeWidth={4} />
          <rect x={x - 10} y={470} width={200} height={16} fill={C2.stoneDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 屋根の鐘楼と鐘 */}
      <rect x={900} y={20} width={180} height={150} fill={C2.stoneDark} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 880 30 L 990 -40 L 1100 30 Z" fill={C2.brickDark} stroke={KRP.ink} strokeWidth={6} />
      <g transform={`rotate(${bell} 990 50)`}>
        <path d="M 950 130 Q 950 64 990 60 Q 1030 64 1030 130 L 1040 140 L 940 140 Z" fill={C2.gold} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={990} cy={146} r={10} fill={HP.brassDark} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {[0, 1, 2].map((k) => {
        const p = ((f + k * 8) % 24) / 24;
        return f < 46 ? <g key={k} opacity={(1 - p) * 0.9}>
          <path d={`M ${850 - p * 70} ${60 - p * 20} q -30 50 0 100`} stroke={KRP.ink} strokeWidth={5} fill="none" />
          <path d={`M ${1130 + p * 70} ${60 - p * 20} q 30 50 0 100`} stroke={KRP.ink} strokeWidth={5} fill="none" />
        </g> : null;
      })}
      {/* 開いた扉と奥の紡績機 */}
      <rect x={1000} y={300} width={720} height={510} fill="#5A4A3E" stroke={KRP.ink} strokeWidth={8} />
      <path d="M 1000 300 q 360 -80 720 0" fill={C2.stoneDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 時計 (6時) */}
      <g transform="translate(1360 250)">
        <circle r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={0} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={24} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <circle r={5} fill={KRP.ink} />
      </g>
      {[0, 1].map((row) => (
        <g key={row}>
          <rect x={1030} y={420 + row * 150} width={660} height={90} fill="#7A6A5A" stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 14 }, (_, k) => {
            const sx = 1060 + k * 46;
            return (
              <g key={k}>
                <line x1={sx} y1={400 + row * 150} x2={sx} y2={440 + row * 150} stroke={KRP.white} strokeWidth={2} opacity={0.8} />
                <ellipse cx={sx} cy={450 + row * 150} rx={12} ry={18} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
                <line x1={sx - 10} y1={450 + row * 150} x2={sx + 10} y2={450 + row * 150} stroke={KRP.ink} strokeWidth={2}
                  transform={`rotate(${f * 30 + k * 20} ${sx} ${450 + row * 150})`} />
              </g>
            );
          })}
          <circle cx={1680} cy={465 + row * 150} r={30} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <line x1={1680} y1={440 + row * 150} x2={1680} y2={490 + row * 150} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${f * 12} 1680 ${465 + row * 150})`} />
        </g>
      ))}
      {/* 石畳の道 */}
      <rect x={-40} y={800} width={2000} height={340} fill="#A59A8A" />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 22 }, (_, c) => (
        <rect key={`${r}-${c}`} x={c * 100 - 60 + (r % 2) * 50} y={812 + r * 70} width={88} height={58} rx={14} fill="#B5AA98" stroke={KRP.ink} strokeWidth={2.5} />
      )))}
      {/* ガス灯 */}
      <g>
        <rect x={60} y={420} width={16} height={400} fill={KRP.ink} />
        <path d="M 38 420 L 98 420 L 88 360 L 48 360 Z" fill={C2.lampGlow} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={68} cy={390} r={60} fill={C2.lampGlow} opacity={0.25 + 0.06 * Math.sin(f / 4)} />
      </g>
      {/* 大人の男性 (扉の奥・機械の前のまま) */}
      {men.map((x, i) => (
        <g key={x}>
          <Person x={x} y={800} s={0.92} f={f} phase={i + 6} face="worried" pose={i === 1 ? "armsFolded" : "stand"}
            cloth="#4E5A6A" clothDark="#363E4A" gaze={[-6 * seg(f, 10, 20), 0]} lean={i === 0 ? -4 : 0} />
          <HmECap x={x} y={800} s={0.92} f={f} phase={i + 6} color="#4A3E32" />
        </g>
      ))}
      {/* 柵 (真ん中) */}
      <g>
        {[880, 960].map((x) => <rect key={x} x={x - 10} y={520} width={20} height={300} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
        {Array.from({ length: 5 }, (_, k) => (
          <g key={k}>
            <rect x={866 + k * 26} y={560} width={14} height={250} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${866 + k * 26} 560 l 7 -18 l 7 18 Z`} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <rect x={850} y={620} width={140} height={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={850} y={740} width={140} height={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <TagPlate x={920} y={480} text="10時間" size={44} rot={-3} />
      {/* 帰っていく女性と若者 */}
      {goers.map((g, i) => {
        const x = g.x0 - 100 * walk;
        const s = g.kind === "boy" ? 0.86 : 0.95;
        const step = Math.sin(f / 2.5 + i) * 6 * seg(f, 8, 14);
        return (
          <g key={i} transform={`translate(0 ${-Math.abs(step) * 0.6})`}>
            <Person x={x} y={800} s={s} f={f} phase={g.ph} face={i % 2 ? "smile" : "joy"} pose={i === 0 ? "raise" : "stand"}
              cloth={g.kind === "woman" ? "#7A5A7A" : "#6A7A5A"} clothDark="#4A3E4A" hair={g.kind === "woman" ? "none" : "cap"}
              gaze={[-5, 0]} lean={-3} />
            {g.kind === "woman" ? <HmEDress x={x} y={800} s={s} f={f} phase={g.ph} lean={-3} /> : <HmECap x={x} y={800} s={s} f={f} phase={g.ph} lean={-3} />}
          </g>
        );
      })}
      <TagPlate x={270} y={450} text="女性" size={40} t={seg(f, 16, 24)} color={KRP.red} />
      <TagPlate x={580} y={470} text="若者" size={40} t={seg(f, 20, 28)} color={KRP.red} />
      <TagPlate x={1370} y={372} text="対象外" size={42} t={seg(f, 26, 34)} fill={KRP.cream} color={KRP.grayDark} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #87 1870年代のアメリカでは、こんな歌が歌われていたとされます。
// 格: 山 / seed 5087
// 絵: どこ: 1870年代のアメリカの工場街の酒場 (木の床・ランプ・ピアノ)。年代札「1870年代」地名札「アメリカ」。演出: 労働者たちが肩を組んで歌っている (口を開けた face="joy")。ピアノの上で楽譜がゆれ、音符が飛び出す。札「〜とされる」(小さく)。動き: 肩を組んで左右に揺れる / 音符が浮かぶ / ランプ
// どこ: 1870年代アメリカの工場街の酒場。板張りの壁と床・吊りランプ3つ・左にカウンターと酒びん・右にアップライトピアノ・赤白の旗飾り
// 演出: 仕事帰りの労働者5人が肩を組み、口を大きく開けて歌う。ピアノの上の楽譜がぱたぱたゆれ、音符がぽんぽん飛び出して天井へ昇っていく
// 動き: 5人がそろって左右にゆれる / 音符が順に浮かぶ / ランプがゆれて光がまたたく / カメラが少しずつ寄る
const Hm087: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 7) * 7;
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const singers = [500, 700, 900, 1100, 1300];
  const s = 1.12, fy = 850;
  const lean = sway;
  const shoulder = (x: number, side: number) => {
    const a = (lean * Math.PI) / 180;
    const lx = side * 60, ly = -146;
    return [x + (lx * Math.cos(a) - ly * Math.sin(a)) * s, fy + (lx * Math.sin(a) + ly * Math.cos(a)) * s];
  };
  return (
    <Frame f={f} seed={5087} bg={C2.wood}>
      <g transform={`translate(900 500) scale(${cam}) translate(-900 -500)`}>
        {/* 板張りの壁 */}
        <rect x={-60} y={-60} width={2040} height={900} fill={C2.wood} />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={i * 70 - 40} y1={-60} x2={i * 70 - 40} y2={760} stroke={C2.woodDark} strokeWidth={4} />
        ))}
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={i * 70 - 5} cy={40 + (i % 3) * 230} r={4} fill={C2.woodDark} />)}
        <rect x={-60} y={560} width={2040} height={30} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 赤白の旗飾り */}
        <path d="M -40 60 Q 480 150 960 60 Q 1440 150 1960 60" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {Array.from({ length: 18 }, (_, i) => {
          const x = -10 + i * 112;
          const y = 60 + Math.sin((i % 9) / 9 * Math.PI) * 80 + 6;
          return <path key={i} d={`M ${x - 30} ${y} L ${x + 30} ${y} L ${x} ${y + 56 + Math.sin(f / 6 + i) * 4} Z`}
            fill={[KRP.red, KRP.white, KRP.blueDeep][i % 3]} stroke={KRP.ink} strokeWidth={3} />;
        })}
        {/* 左: カウンターと酒びんの棚 */}
        <g>
          <rect x={20} y={200} width={320} height={300} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1].map((r) => (
            <g key={r}>
              <rect x={30} y={330 + r * 150} width={300} height={12} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={3} />
              {Array.from({ length: 6 }, (_, k) => (
                <g key={k}>
                  <rect x={46 + k * 46} y={260 + r * 150} width={28} height={70} rx={6} fill={["#5E8A4E", "#8E5A3A", "#C9A24A"][(k + r) % 3]} stroke={KRP.ink} strokeWidth={3} />
                  <rect x={54 + k * 46} y={242 + r * 150} width={12} height={22} fill={KRP.ink} />
                </g>
              ))}
            </g>
          ))}
          <rect x={-40} y={600} width={420} height={230} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-50} y={590} width={440} height={26} rx={6} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={6} />
          {[120, 260].map((x) => (
            <g key={x}>
              <rect x={x - 26} y={540} width={52} height={52} rx={6} fill="#F2D88A" stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${x + 26} 552 q 20 0 20 16 q 0 16 -20 16`} stroke={KRP.ink} strokeWidth={4} fill="none" />
              <ellipse cx={x} cy={542} rx={26} ry={8} fill={KRP.white} />
            </g>
          ))}
        </g>
        {/* 右: アップライトピアノと楽譜 */}
        <g>
          <rect x={1440} y={400} width={420} height={420} rx={10} fill="#4A2E22" stroke={KRP.ink} strokeWidth={7} />
          <rect x={1470} y={430} width={360} height={150} rx={6} fill="#5E3A2A" stroke={KRP.ink} strokeWidth={4} />
          <rect x={1420} y={600} width={460} height={40} fill="#3A241A" stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 18 }, (_, k) => {
            const down = Math.floor(f / 3 + k * 5) % 7 === 0;
            return <rect key={k} x={1428 + k * 25} y={down ? 606 : 600} width={23} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />;
          })}
          {Array.from({ length: 12 }, (_, k) => k % 7 === 2 || k % 7 === 6 ? null : (
            <rect key={k} x={1444 + k * 37} y={600} width={14} height={18} fill={KRP.ink} />
          ))}
          {[1480, 1820].map((x) => <rect key={x} x={x - 14} y={640} width={28} height={180} fill="#3A241A" stroke={KRP.ink} strokeWidth={4} />)}
          {/* 楽譜 (ぱたぱた) */}
          <g transform={`rotate(${Math.sin(f / 3) * 5} 1650 400)`}>
            <path d={`M 1560 400 L 1560 300 Q 1600 ${290 + Math.sin(f / 2) * 8} 1650 300 Q 1700 ${290 - Math.sin(f / 2) * 8} 1740 300 L 1740 400 Z`}
              fill={C2.washi} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((r) => <line key={r} x1={1574} y1={325 + r * 24} x2={1726} y2={325 + r * 24} stroke={KRP.grayDark} strokeWidth={3} />)}
            {[1590, 1630, 1680, 1710].map((nx, i) => <circle key={nx} cx={nx} cy={330 + (i % 3) * 20} r={6} fill={KRP.ink} />)}
          </g>
          {/* ピアノの上のランプ */}
          <rect x={1790} y={340} width={30} height={60} rx={6} fill={C2.lampGlow} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 飛び出す音符 */}
        {Array.from({ length: 7 }, (_, k) => {
          const p = ((f + k * 9) % 54) / 54;
          const nx = 1600 - p * 900 + Math.sin(p * 9 + k) * 40;
          const ny = 300 - p * 220 + Math.sin(p * 6 + k) * 20;
          const sc = pop(clamp01(p * 6));
          return (
            <g key={k} transform={`translate(${nx} ${ny}) scale(${sc * (k % 2 ? 1.9 : 1.5)}) rotate(${Math.sin(f / 5 + k) * 15})`} opacity={1 - p * 0.6}>
              <ellipse cx={0} cy={0} rx={18} ry={13} fill={[KRP.yellow, KRP.orange, KRP.red][k % 3]} stroke={KRP.ink} strokeWidth={4} transform="rotate(-20)" />
              <line x1={16} y1={-4} x2={16} y2={-62} stroke={KRP.ink} strokeWidth={5} />
              {k % 2 === 0 && <path d="M 16 -62 q 22 8 18 30" stroke={KRP.ink} strokeWidth={5} fill="none" />}
            </g>
          );
        })}
        {/* 吊りランプ */}
        {[560, 960, 1360].map((x, i) => {
          const sw = Math.sin(f / 10 + i) * 4;
          return (
            <g key={x} transform={`rotate(${sw} ${x} -40)`}>
              <line x1={x} y1={-40} x2={x} y2={150} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={x} cy={200} r={110} fill={C2.lampGlow} opacity={0.18 + 0.05 * Math.sin(f / 3 + i * 2)} />
              <path d={`M ${x - 30} 150 L ${x + 30} 150 L ${x + 24} 230 L ${x - 24} 230 Z`} fill={C2.lampGlow} stroke={KRP.ink} strokeWidth={5} />
              <rect x={x - 36} y={224} width={72} height={16} rx={4} fill={C2.gold} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${x} 210 q -8 -14 0 -26 q 8 12 0 26`} fill={KRP.orange} />
            </g>
          );
        })}
        {/* 床 */}
        <rect x={-60} y={760} width={2040} height={400} fill={C2.woodLight} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={790 + i * 50} x2={1980} y2={790 + i * 50} stroke={C2.wood} strokeWidth={4} />)}
        {/* 肩を組んで歌う労働者たち */}
        {/* 腕は1人2本: となりの肩へ回す右腕は下の「組んだ腕」で描くので、元の右腕 (胴の外側) を clip で消す。いちばん右の人だけ両腕そのまま */}
        <defs>
          {singers.slice(0, -1).map((x, i) => (
            <clipPath key={i} id={`hme87arm${i}`}>
              {([[-400, -600, 461, 900], [-400, -600, 800, 447], [-400, -54, 800, 400]] as const).map(([rx, ry, rw, rh], k) => (
                <rect key={k} x={rx} y={ry} width={rw} height={rh} transform={`translate(${x} ${fy}) scale(${s}) rotate(${lean})`} />
              ))}
            </clipPath>
          ))}
        </defs>
        {singers.map((x, i) => (
          <g key={x}>
            <g clipPath={i < singers.length - 1 ? `url(#hme87arm${i})` : undefined}>
              <Person x={x} y={fy} s={s} f={f} phase={i * 3} still face="joy" pose="stand" lean={lean}
                cloth={["#5E6A78", "#7A5A44", "#4E6A5A", "#6A5A7A", "#5E6A78"][i]} clothDark="#3E4656" hair={i === 2 ? "none" : "cap"} />
            </g>
            {i === 2 ? <HmETopHat x={x} y={fy} s={s} f={0} lean={lean} /> : <HmECap x={x} y={fy} s={s} f={0} color={["#5A4A3A", "#8A6A44", "", "#4A3E32", "#7A5638"][i]} lean={lean} />}
          </g>
        ))}
        {/* 組んだ腕 (となりの肩へ回す) */}
        {singers.slice(0, -1).map((x, i) => {
          const [ax, ay] = shoulder(x, 1);
          const [bx, by] = shoulder(singers[i + 1], 1);
          return (
            <g key={i}>
              <path d={`M ${ax} ${ay} Q ${(ax + bx) / 2} ${ay - 34} ${bx - 10} ${by - 4}`} stroke={KRP.ink} strokeWidth={26} fill="none" strokeLinecap="round" />
              <path d={`M ${ax} ${ay} Q ${(ax + bx) / 2} ${ay - 34} ${bx - 10} ${by - 4}`} stroke={["#5E6A78", "#7A5A44", "#4E6A5A", "#6A5A7A"][i]} strokeWidth={18} fill="none" strokeLinecap="round" />
              <circle cx={bx - 6} cy={by - 4} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 歌の波線 */}
        {singers.map((x, i) => (
          <path key={i} d={`M ${x - 20 + sway * 3} ${fy - 425} q 12 -16 24 0 q 12 16 24 0`} stroke={KRP.ink} strokeWidth={5} fill="none"
            opacity={0.6 * Math.abs(Math.sin(f / 4 + i))} />
        ))}
      </g>
      <TagPlate x={230} y={190} text="1870年代" size={40} t={seg(f, 0, 8)} />
      <TagPlate x={1710} y={110} text="アメリカ" size={40} t={seg(f, 2, 10)} />
      <TagPlate x={1700} y={190} text="〜とされる" size={26} t={seg(f, 14, 22)} fill={KRP.cream} color={KRP.grayDark} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #88 8時間は、仕事に。8時間は、休みに。そして8時間は、好きなことに。
// 格: 図 / seed 5088
// 絵: どこ: 酒場の壁に貼られた大きな手描きのポスター (#87 の続き)。演出: 1日の円グラフ (時計の文字盤) が3つに等分され、f で順番に色がつく: ①灰色「仕事」(ハンマーのマーク) ②藍「休み」(ベッド) ③橙「好きなこと」(釣り竿・本・音符)。札は「8時間」×3。動き: 扇形が順に塗られる (f0-12/12-24/24-36) / マークがぽん
// どこ: #87 の酒場の板壁。鋲で留めた大きな手描きのポスター (端がめくれ、角が破れている)。上からランプの暖かい光
// 演出: ポスターの1日の文字盤が3等分され、刷毛で順に塗られていく: 灰「仕事」(ハンマー) → 藍「休み」(ベッド) → 橙「好きなこと」(釣り竿・本・音符)。塗るたびにマークがぽん、「8時間」の札がぽん
// 動き: 扇形が順に塗られる (f0-12 / 12-24 / 24-36)・刷毛が塗り口を走る / マークがぽん / ランプの光のゆらぎ / カメラが少し寄る
const Hm088: React.FC<{ f: number }> = ({ f }) => {
  const cx = 960, cy = 450, R = 290;
  const parts = [
    { a: 0, t: seg(f, 0, 12), col: KRP.grayDark, name: "仕事" },
    { a: 120, t: seg(f, 12, 24), col: "#3E4E7A", name: "休み" },
    { a: 240, t: seg(f, 24, 36), col: KRP.orange, name: "好きなこと" },
  ];
  const sector = (a0: number, a1: number, r: number) => {
    const p = (a: number) => [cx + Math.sin((a * Math.PI) / 180) * r, cy - Math.cos((a * Math.PI) / 180) * r];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };
  const mid = (a: number, r: number) => [cx + Math.sin((a * Math.PI) / 180) * r, cy - Math.cos((a * Math.PI) / 180) * r];
  const cam = 1 + 0.04 * easeOut(seg(f, 0, 42));
  const active = parts.find((p) => p.t > 0 && p.t < 1);
  const plates: [number, number][] = [[1330, 360], [960, 786], [590, 360]];
  return (
    <Frame f={f} seed={5088} bg={C2.wood}>
      <g transform={`translate(${cx} ${cy}) scale(${cam}) translate(${-cx} ${-cy})`}>
        {/* 板壁 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C2.wood} />
        {Array.from({ length: 16 }, (_, i) => (
          <g key={i}>
            <rect x={i * 130 - 50} y={-60} width={126} height={1200} fill={i % 2 ? C2.wood : "#956438"} />
            <line x1={i * 130 - 50} y1={-60} x2={i * 130 - 50} y2={1140} stroke={C2.woodDark} strokeWidth={5} />
            <path d={`M ${i * 130 - 10} ${200 + (i % 4) * 160} q 20 -10 40 0 q -20 14 -40 0`} stroke={C2.woodDark} strokeWidth={3} fill="none" />
          </g>
        ))}
        {/* 古い貼り紙のはがれ跡 */}
        <rect x={170} y={180} width={170} height={230} fill={C2.washi} opacity={0.4} transform="rotate(-6 255 295)" />
        <rect x={1580} y={560} width={200} height={150} fill={C2.washi} opacity={0.35} transform="rotate(5 1680 635)" />
        {/* ランプの光 */}
        <ellipse cx={960} cy={300} rx={820} ry={520} fill={C2.lampGlow} opacity={0.12 + 0.03 * Math.sin(f / 3)} />
        {/* ポスター */}
        <g transform="rotate(-1.2 960 470)">
          <rect x={470} y={84} width={1000} height={790} fill={KRP.ink} opacity={0.25} transform="translate(14 16)" />
          <path d="M 460 80 L 1460 80 L 1460 850 L 1400 880 L 460 880 Z" fill={C2.washi} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 1460 850 L 1400 880 L 1410 836 Z" fill="#D9CBAA" stroke={KRP.ink} strokeWidth={4} />
          {[[490, 110], [1430, 110], [490, 850]].map(([x, y], i) => (
            <g key={i}><circle cx={x} cy={y} r={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} /><circle cx={x - 4} cy={y - 4} r={4} fill={KRP.white} /></g>
          ))}
          {/* 紙のしみ */}
          <circle cx={560} cy={760} r={40} fill="#E2D2AE" opacity={0.6} />
          <circle cx={1360} cy={170} r={30} fill="#E2D2AE" opacity={0.6} />
          {/* 文字盤の外枠 */}
          <circle cx={cx} cy={cy} r={R + 18} fill="none" stroke={KRP.ink} strokeWidth={9} />
          <circle cx={cx} cy={cy} r={R} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {parts.map((p, i) => p.t > 0 && (
            <path key={i} d={sector(p.a, p.a + 120 * p.t, R)} fill={p.col} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          ))}
          {/* 3本の区切り線 */}
          {[0, 120, 240].map((a) => {
            const [x, y] = mid(a, R + 18);
            return <line key={a} x1={cx} y1={cy} x2={x} y2={y} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />;
          })}
          {Array.from({ length: 24 }, (_, i) => {
            const [x1, y1] = mid(i * 15, R + 2), [x2, y2] = mid(i * 15, R + (i % 6 ? 14 : 18));
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={i % 6 ? 3 : 6} />;
          })}
          {/* マーク */}
          {parts.map((p, i) => {
            const sc = pop(seg(f, 6 + i * 12, 14 + i * 12));
            if (sc <= 0) return null;
            const [mx, my] = mid(p.a + 60, R * 0.56);
            return (
              <g key={i} transform={`translate(${mx} ${my}) scale(${sc})`}>
                {i === 0 && (
                  <g transform={`rotate(${-30 + Math.sin(f / 4) * 6})`}>
                    <rect x={-8} y={-20} width={16} height={100} rx={5} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={4} />
                    <rect x={-48} y={-50} width={96} height={38} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
                  </g>
                )}
                {i === 1 && (
                  <g>
                    <rect x={-70} y={-10} width={140} height={34} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                    <rect x={-80} y={-44} width={16} height={86} rx={4} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={4} />
                    <rect x={64} y={-20} width={16} height={62} rx={4} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={4} />
                    <ellipse cx={-40} cy={-20} rx={26} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                    {[0, 1, 2].map((z) => <text key={z} x={20 + z * 22} y={-34 - z * 22 - (f % 20)} fontFamily={FONT} fontWeight={900}
                      fontSize={22 + z * 4} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} paintOrder="stroke">z</text>)}
                  </g>
                )}
                {i === 2 && (
                  <g>
                    <path d="M -70 50 L 40 -60" stroke={C2.woodDark} strokeWidth={8} strokeLinecap="round" />
                    <path d={`M 40 -60 Q 70 -20 ${64 + Math.sin(f / 4) * 4} 40`} stroke={KRP.ink} strokeWidth={3} fill="none" />
                    <circle cx={64 + Math.sin(f / 4) * 4} cy={44} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
                    <rect x={-60} y={-40} width={60} height={44} rx={4} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} transform="rotate(-8)" />
                    <line x1={-30} y1={-40} x2={-30} y2={4} stroke={KRP.white} strokeWidth={3} transform="rotate(-8)" />
                    <ellipse cx={-6} cy={-80} rx={12} ry={9} fill={KRP.ink} />
                    <line x1={5} y1={-82} x2={5} y2={-120} stroke={KRP.ink} strokeWidth={4} />
                  </g>
                )}
                <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.white}
                  stroke={KRP.ink} strokeWidth={6} paintOrder="stroke">{p.name}</text>
              </g>
            );
          })}
          {/* 刷毛 (塗り口を走る) */}
          {active && (() => {
            const a = active.a + 120 * active.t;
            const [bx, by] = mid(a, R * 0.72);
            return (
              <g transform={`translate(${bx} ${by}) rotate(${a - 30})`}>
                <rect x={-14} y={-150} width={28} height={110} rx={8} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={4} />
                <rect x={-22} y={-50} width={44} height={20} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
                <path d="M -22 -30 L 22 -30 L 18 6 L -18 6 Z" fill={active.col} stroke={KRP.ink} strokeWidth={4} />
              </g>
            );
          })()}
          <circle cx={cx} cy={cy} r={16} fill={KRP.ink} />
        </g>
      </g>
      {plates.map(([x, y], i) => (
        <TagPlate key={i} x={x} y={y} text="8時間" size={42} t={seg(f, 8 + i * 12, 14 + i * 12)} rot={i === 1 ? 0 : (i ? -4 : 4)} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #89 1日を、3つに切り分ける作戦です。
// 格: 山 / seed 5089
// 絵: どこ: 酒場のテーブルの上。演出: 大きな丸いパイ (1日) を、労働者がナイフで3等分にきれいに切り分ける。3切れにそれぞれ小旗 (ハンマー・ベッド・釣り竿のマーク)。まわりの仲間が「おお」と身を乗り出す。動き: ナイフが3回入る / 湯気 / 身を乗り出す
// どこ: #87 の酒場のテーブルの上。焼きたての大きな丸いパイ (1日)。奥の板壁とランプ、手前にジョッキ
// 演出: 右の労働者がナイフでパイを真ん中から3回、きれいに切り分ける。3切れが少し離れ、それぞれに小旗 (ハンマー・ベッド・釣り竿) がぷすっと立つ。左右の仲間が「おお」と身を乗り出す
// 動き: ナイフが3回入る (f4-12 / 14-22 / 24-32) / 3切れが離れる (f32-38) / 小旗がぽん (f34-42) / 湯気 / 仲間が身を乗り出す
const Hm089: React.FC<{ f: number }> = ({ f }) => {
  const cx = 960, cy = 700, rx = 400, ry = 160, dep = 54;
  const P = (a: number, k = 1) => [cx + Math.sin((a * Math.PI) / 180) * rx * k, cy - Math.cos((a * Math.PI) / 180) * ry * k];
  const cuts = [{ a: 0, t: seg(f, 4, 12) }, { a: 120, t: seg(f, 14, 22) }, { a: 240, t: seg(f, 24, 32) }];
  const spread = easeOut(seg(f, 32, 38));
  const lean = easeOut(seg(f, 6, 30));
  const cur = cuts.find((c) => c.t > 0 && c.t < 1) ?? (f < 4 ? { a: 0, t: 0 } : null);
  const pieces = [
    { a0: 0, a1: 120, flag: 0 }, { a0: 120, a1: 240, flag: 1 }, { a0: 240, a1: 360, flag: 2 },
  ];
  const piecePath = (a0: number, a1: number, dy: number) => {
    const [x0, y0] = P(a0), [x1, y1] = P(a1);
    return `M ${cx} ${cy + dy} L ${x0} ${y0 + dy} A ${rx} ${ry} 0 0 1 ${x1} ${y1 + dy} Z`;
  };
  // 手前のものから描く順 (奥のピースを先に)
  const order = [2, 0, 1];
  return (
    <Frame f={f} seed={5089} bg={C2.wood}>
      {/* 奥の板壁 */}
      <rect x={-40} y={-40} width={2000} height={700} fill={C2.wood} />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={i * 70 - 40} y1={-40} x2={i * 70 - 40} y2={660} stroke={C2.woodDark} strokeWidth={4} />)}
      <circle cx={960} cy={60} r={260} fill={C2.lampGlow} opacity={0.18 + 0.04 * Math.sin(f / 3)} />
      <path d="M 930 -40 L 930 40 M 900 40 L 1020 40 L 1000 110 L 920 110 Z" fill={C2.lampGlow} stroke={KRP.ink} strokeWidth={5} />
      {/* 仲間たち (身を乗り出す) */}
      <Person x={430} y={700} s={1.2} f={f} phase={1} face="surprised" pose="hold" lean={10 * lean} cloth="#7A5A44" clothDark="#4A3E36" gaze={[6, 4]} />
      <HmECap x={430} y={700} s={1.2} f={f} phase={1} lean={10 * lean} color="#8A6A44" />
      <Person x={680} y={680} s={1.05} f={f} phase={2} face="joy" pose="raise" lean={8 * lean} cloth="#4E6A5A" clothDark="#364A3E" />
      <HmEDress x={680} y={680} s={1.05} f={f} phase={2} lean={8 * lean} skirt="#6A5A7A" />
      <Person x={1640} y={700} s={1.2} f={f} phase={4} face="surprised" pose="hold" lean={-10 * lean} cloth="#6A5A7A" clothDark="#4A3E4A" gaze={[-6, 4]} />
      <HmECap x={1640} y={700} s={1.2} f={f} phase={4} lean={-10 * lean} color="#4A3E32" />
      {/* 切る人 (右奥) */}
      <Person x={1330} y={690} s={1.1} f={f} phase={3} face="smile" pose="point" pointDir={-1} cloth="#5E6A78" clothDark="#3E4656" gaze={[-6, 6]} />
      <HmECap x={1330} y={690} s={1.1} f={f} phase={3} color="#5A4A3A" />
      {/* テーブル */}
      <ellipse cx={960} cy={820} rx={900} ry={250} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={8} />
      <ellipse cx={960} cy={800} rx={900} ry={240} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={8} />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${200 + i * 60} ${640 + i * 60} Q 960 ${610 + i * 66} ${1720 - i * 60} ${640 + i * 60}`}
        stroke={C2.wood} strokeWidth={4} fill="none" opacity={0.6} />)}
      {/* 皿 */}
      <ellipse cx={cx} cy={cy + 40} rx={rx + 60} ry={ry + 40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={cx} cy={cy + 40} rx={rx + 30} ry={ry + 22} fill="none" stroke={KRP.blue} strokeWidth={5} />
      {/* パイ (3切れ) */}
      {order.map((k) => {
        const pc = pieces[k];
        const m = (pc.a0 + pc.a1) / 2;
        const dx = Math.sin((m * Math.PI) / 180) * 34 * spread, dy = -Math.cos((m * Math.PI) / 180) * 18 * spread;
        return (
          <g key={k} transform={`translate(${dx} ${dy})`}>
            <path d={piecePath(pc.a0, pc.a1, dep)} fill={C2.pieDark} stroke={KRP.ink} strokeWidth={6} />
            {spread > 0 && <path d={`M ${cx} ${cy} L ${cx} ${cy + dep} L ${P(pc.a0)[0]} ${P(pc.a0)[1] + dep} L ${P(pc.a0)[0]} ${P(pc.a0)[1]} Z`} fill={C2.pieIn} stroke={KRP.ink} strokeWidth={4} />}
            <path d={piecePath(pc.a0, pc.a1, 0)} fill={C2.pie} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            {/* 格子の飾り */}
            {[0.35, 0.6, 0.85].map((r) => (
              <path key={r} d={`M ${P(pc.a0 + 12, r)[0]} ${P(pc.a0 + 12, r)[1]} Q ${P(m, r * 1.05)[0]} ${P(m, r * 1.05)[1]} ${P(pc.a1 - 12, r)[0]} ${P(pc.a1 - 12, r)[1]}`}
                stroke={C2.pieDark} strokeWidth={8} fill="none" strokeLinecap="round" />
            ))}
            {/* ふちの波 */}
            {Array.from({ length: 8 }, (_, j) => {
              const [qx, qy] = P(pc.a0 + 7 + j * 15, 0.96);
              return <circle key={j} cx={qx} cy={qy} r={12} fill={C2.pie} stroke={C2.pieDark} strokeWidth={3} />;
            })}
            {/* 小旗 */}
            {(() => {
              const sc = pop(seg(f, 34 + k * 2, 40 + k * 2));
              if (sc <= 0) return null;
              const [fx, fy] = P(m, 0.55);
              return (
                <g transform={`translate(${fx} ${fy}) scale(${sc * 1.5})`}>
                  <line x1={0} y1={0} x2={0} y2={-120} stroke={C2.woodDark} strokeWidth={5} />
                  <path d={`M 0 -120 L 90 ${-104 + Math.sin(f / 4 + k) * 4} L 0 -84 Z`} fill={[KRP.grayDark, "#3E4E7A", KRP.orange][k]} stroke={KRP.ink} strokeWidth={4} />
                  {k === 0 && <g transform="translate(36 -104) rotate(-30)"><rect x={-3} y={-4} width={6} height={22} fill={KRP.white} /><rect x={-11} y={-12} width={22} height={9} fill={KRP.white} /></g>}
                  {k === 1 && <g transform="translate(34 -104)"><rect x={-14} y={-2} width={28} height={8} fill={KRP.white} /><circle cx={-8} cy={-6} r={5} fill={KRP.white} /></g>}
                  {k === 2 && <g transform="translate(34 -104)"><line x1={-12} y1={8} x2={10} y2={-10} stroke={KRP.white} strokeWidth={4} /><circle cx={12} cy={6} r={3} fill={KRP.white} /></g>}
                </g>
              );
            })()}
          </g>
        );
      })}
      {/* 切り口の線 */}
      {cuts.map((c, i) => c.t > 0 && spread === 0 && (
        <line key={i} x1={P(c.a)[0]} y1={P(c.a)[1]} x2={lerp(P(c.a)[0], cx, c.t)} y2={lerp(P(c.a)[1], cy, c.t)} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      ))}
      {/* ナイフ */}
      {cur && (() => {
        const [ex, ey] = P(cur.a);
        const tx = lerp(ex, cx, cur.t), ty = lerp(ey, cy, cur.t) - 10;
        const hx = 1330 - 153 * 1.1, hy = 690 - 148 * 1.1;
        return (
          <g>
            <line x1={hx} y1={hy} x2={tx + (hx - tx) * 0.45} y2={ty + (hy - ty) * 0.45} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
            <line x1={hx} y1={hy} x2={tx + (hx - tx) * 0.45} y2={ty + (hy - ty) * 0.45} stroke={C2.woodDark} strokeWidth={14} strokeLinecap="round" />
            <path d={`M ${tx + (hx - tx) * 0.45} ${ty + (hy - ty) * 0.45} L ${tx} ${ty}`} stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
            <path d={`M ${tx + (hx - tx) * 0.45} ${ty + (hy - ty) * 0.45} L ${tx} ${ty}`} stroke={KRP.silver} strokeWidth={10} strokeLinecap="round" />
          </g>
        );
      })()}
      {/* 湯気 */}
      {[0, 1, 2, 3].map((i) => {
        const p = ((f * 1.2 + i * 12) % 48) / 48;
        return <path key={i} d={`M ${820 + i * 90} ${640 - p * 160} q 16 -24 0 -48 q -16 -24 0 -48`} stroke={KRP.white} strokeWidth={7}
          fill="none" strokeLinecap="round" opacity={0.7 * (1 - p)} />;
      })}
      {/* 手前のジョッキ */}
      {[300, 1620].map((x, i) => (
        <g key={x}>
          <rect x={x - 50} y={860} width={100} height={110} rx={10} fill="#F2D88A" stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${x + 50} 880 q 34 0 34 30 q 0 30 -34 30`} stroke={KRP.ink} strokeWidth={6} fill="none" />
          <ellipse cx={x} cy={862} rx={52} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={x - 20 + i * 30} cy={900 + Math.sin(f / 5 + i) * 10} r={5} fill={KRP.white} opacity={0.7} />
        </g>
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #90 1919年、世界の国々は、「1日8時間、週48時間」を約束します。
// 格: 山 / seed 5090
// 絵: どこ: 1919年の国際会議の大きな会議場 (円卓・各国の小旗・シャンデリア)。年代札「1919年」。演出: 円卓の中央に大きな時計の文字盤 (8時間の範囲が緑の枠)。各国の代表 (一般人・顔はよい) が順に羽ペンで署名していく。札「1日8時間」「週48時間」。動き: 署名のペン / 小旗がはためく / シャンデリアのきらめき
// どこ: 1919年の国際会議の大広間。クリーム色の壁・金の飾り縁・赤いカーテンの高窓・シャンデリア2つ・大きな円卓 (緑の布)
// 演出: 円卓の真ん中に立てた大きな1日の文字盤に、8時間の範囲が緑の枠で描かれる。円卓を囲む6人の代表 (一般人) の前に条約の紙と小旗。左から順に羽ペンでさらさら署名していく
// 動き: 緑の枠が伸びる (f0-14) / 署名が左から順に (f6-40) / 小旗がはためく / シャンデリアのきらめき / カメラがゆっくり引く
const HmE_SEATS = [300, 520, 740, 1180, 1400, 1620];
const HmE_SUITS = ["#3B3A48", "#4A3E36", "#2E3A4A", "#4E4A3E", "#3E4A44", "#2A2E3A"];
const HmE_FLAGCOLS: string[][] = [
  [KRP.blueDeep, KRP.yellow, KRP.red], [KRP.green, KRP.white, KRP.red], [KRP.ink, KRP.yellow, KRP.red],
  [KRP.blueDeep, KRP.white, KRP.red], [KRP.green, KRP.yellow, KRP.red], [KRP.white, KRP.white, KRP.white],
];
const hmeTableY = (x: number) => 760 - 170 * Math.sqrt(Math.max(0, 1 - ((x - 960) / 820) ** 2));
const HmEHall: React.FC<{ f: number; band: number }> = ({ f, band }) => (
  <g>
    {/* 壁と柱 */}
    <rect x={-60} y={-60} width={2040} height={900} fill="#EFE3C8" />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = 60 + i * 360;
      return (
        <g key={i}>
          <rect x={x} y={60} width={170} height={420} fill="#7FA0BE" stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${x} 60 q 85 -70 170 0`} fill="#7FA0BE" stroke={KRP.ink} strokeWidth={6} />
          <line x1={x + 85} y1={20} x2={x + 85} y2={480} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${x - 30} 0 L ${x - 30} 520 Q ${x + 10 + Math.sin(f / 20 + i) * 4} 420 ${x + 30} 0 Z`} fill="#A83A3A" stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${x + 200} 0 L ${x + 200} 520 Q ${x + 160 + Math.sin(f / 20 + i) * 4} 420 ${x + 140} 0 Z`} fill="#A83A3A" stroke={KRP.ink} strokeWidth={5} />
          <rect x={x + 250} y={-60} width={50} height={700} fill="#E2D2AE" stroke={KRP.ink} strokeWidth={4} />
        </g>
      );
    })}
    <rect x={-60} y={-60} width={2040} height={40} fill={C2.gold} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-60} y={540} width={2040} height={20} fill={C2.gold} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-60} y={560} width={2040} height={600} fill="#B98A58" />
    {/* シャンデリア */}
    {[420, 1500].map((cx, i) => (
      <g key={cx}>
        <line x1={cx} y1={-40} x2={cx} y2={60} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${cx - 120} 110 Q ${cx} 170 ${cx + 120} 110`} stroke={C2.gold} strokeWidth={10} fill="none" />
        <path d={`M ${cx - 80} 90 Q ${cx} 130 ${cx + 80} 90`} stroke={C2.gold} strokeWidth={8} fill="none" />
        <circle cx={cx} cy={70} r={18} fill={C2.gold} stroke={KRP.ink} strokeWidth={4} />
        {[-120, -80, -40, 0, 40, 80, 120].map((d, k) => (
          <g key={k}>
            <rect x={cx + d - 6} y={80 - Math.abs(d) * 0.1} width={12} height={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${cx + d} ${80 - Math.abs(d) * 0.1} q -6 -10 0 -20 q 6 10 0 20`} fill={KRP.orange} />
            <path d={`M ${cx + d} ${132 + (k % 2) * 16} l 6 12 l -6 12 l -6 -12 Z`} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ))}
        {[0, 1, 2, 3].map((k) => {
          const tw = Math.max(0, Math.sin(f / 3 + k * 1.7 + i));
          return <path key={k} d={`M ${cx - 90 + k * 60} ${150 + (k % 2) * 20} l 4 -12 l 4 12 l 12 4 l -12 4 l -4 12 l -4 -12 l -12 -4 Z`}
            fill={KRP.white} opacity={tw} />;
        })}
        <circle cx={cx} cy={110} r={170} fill={C2.lampGlow} opacity={0.14} />
      </g>
    ))}
    {/* 真ん中に立てた大きな1日の文字盤 */}
    <rect x={946} y={560} width={28} height={120} fill={C2.gold} stroke={KRP.ink} strokeWidth={5} />
    <HmEDial x={960} y={380} r={180} f={f} start={8} hours={8} t={band} color={C2.green8} hand={(8 + 8 * band) * 15} />
  </g>
);
const HmETable: React.FC = () => (
  <g>
    <ellipse cx={960} cy={790} rx={830} ry={180} fill="#2E5A3E" stroke={KRP.ink} strokeWidth={8} />
    <rect x={130} y={760} width={1660} height={240} fill="#2E5A3E" />
    <path d="M 130 760 L 130 1000 L 1790 1000 L 1790 760" fill="none" stroke={KRP.ink} strokeWidth={8} />
    <ellipse cx={960} cy={760} rx={820} ry={170} fill="#3F7A52" stroke={KRP.ink} strokeWidth={8} />
    <ellipse cx={960} cy={760} rx={760} ry={140} fill="none" stroke={C2.gold} strokeWidth={4} opacity={0.7} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${180 + i * 140} 990 q 30 -40 60 0`} stroke={C2.gold} strokeWidth={4} fill="none" opacity={0.7} />)}
  </g>
);
const Hm090: React.FC<{ f: number }> = ({ f }) => {
  const band = easeInOut(seg(f, 0, 14));
  const cam = 1.06 - 0.06 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5090} bg="#EFE3C8">
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        <HmEHall f={f} band={band} />
        {HmE_SEATS.map((x, i) => (
          <g key={x}>
            <Person x={x} y={hmeTableY(x) + 60} s={0.9} f={f} phase={i * 2} pose="hold" face={i % 3 === 1 ? "smile" : "normal"}
              cloth={HmE_SUITS[i]} clothDark="#22262E" hair={i === 2 ? "none" : "cap"} gaze={[0, 5]} glasses={i === 3} />
            {/* 白い襟とネクタイ */}
            <g transform={`translate(${x} ${hmeTableY(x) + 60 + Math.sin((f + i * 34) / 13) * 3}) scale(0.9)`}>
              <path d="M -22 -160 L 0 -132 L 22 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <path d="M -6 -140 L 6 -140 L 8 -100 L 0 -92 L -8 -100 Z" fill={[KRP.red, KRP.blueDeep, KRP.green][i % 3]} stroke={KRP.ink} strokeWidth={3} />
              {i === 0 && <path d="M -28 -198 Q 0 -212 28 -198" stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round" />}
              {i === 2 && <path d="M -64 -250 Q 0 -300 64 -250 Q 40 -268 0 -270 Q -40 -268 -64 -250 Z" fill={KRP.gray} />}
            </g>
          </g>
        ))}
        <HmETable />
        {HmE_SEATS.map((x, i) => {
          const ty = hmeTableY(x);
          const t = seg(f, 6 + i * 5, 12 + i * 5);
          const k = i - 2.5;
          return (
            <g key={x}>
              {/* 条約の紙 */}
              <g transform={`translate(${x} ${ty + 40}) rotate(${k * 3})`}>
                <rect x={-60} y={-24} width={120} height={64} rx={4} fill={C2.washi} stroke={KRP.ink} strokeWidth={4} />
                {[0, 1].map((r) => <line key={r} x1={-46} y1={-10 + r * 12} x2={46} y2={-10 + r * 12} stroke={KRP.gray} strokeWidth={3} />)}
                {t > 0 && <path d="M -44 26 q 10 -18 18 0 q 8 14 16 -6 q 8 -16 16 2 q 8 12 18 -4" stroke={KRP.blueDeep} strokeWidth={4} fill="none"
                  strokeDasharray={120} strokeDashoffset={120 * (1 - t)} />}
                {/* 羽ペン */}
                {t > 0 && t < 1 && (
                  <g transform={`translate(${-44 + 96 * t} ${22 + Math.sin(f * 1.5) * 4}) rotate(30)`}>
                    <path d="M 0 0 L 6 -80 Q 30 -60 14 -10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                    <line x1={0} y1={0} x2={10} y2={-70} stroke={KRP.ink} strokeWidth={2} />
                  </g>
                )}
                {t >= 1 && <circle cx={44} cy={26} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />}
              </g>
              <HmEFlag x={x + 80} y={ty + 30} s={0.5} f={f} k={i} cols={HmE_FLAGCOLS[i]} jp={i === 5} />
            </g>
          );
        })}
        <TagPlate x={590} y={330} text="1日8時間" size={42} t={seg(f, 10, 18)} color={C2.green8} />
        <TagPlate x={1330} y={330} text="週48時間" size={42} t={seg(f, 16, 24)} color={C2.green8} />
      </g>
      <TagPlate x={230} y={190} text="1919年" size={42} t={seg(f, 0, 8)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #91 ところが日本にだけ、「週57時間まで」という特別ルールがつきました。
// 格: 山 / seed 5091
// 絵: どこ: #90 の会議場 (続き)。演出: 円卓の日本の席 (日の丸の小旗) の前にだけ、別の小さな札「週57時間」がぽんと置かれる。ほかの国の代表がいっせいに日本の席を振り向く (face="surprised")。日本の代表は少し気まずそうに頭をかく。スポットライトが日本の席だけに。動き: 札がぽん / 振り向く / スポットライト
// どこ: #90 の大広間 (続き)。同じ円卓・同じ文字盤 (8時間の緑の枠)・同じ6人の代表
// 演出: 広間が少し暗くなり、スポットライトが右端の日本の席 (日の丸の小旗) にだけ当たる。その前にだけ別の小さな札「週57時間」がぽん。ほかの5人がいっせいに日本の席へ振り向いて目をまるくし、日本の代表は気まずそうに頭をかく
// 動き: 暗くなる+スポットライト (f2-12) / 札がぽん (f12-20) / 5人が振り向く (f16で一気に) / 頭をかく手が小さく上下 / カメラが日本の席へ寄る
const Hm091: React.FC<{ f: number }> = ({ f }) => {
  const dim = easeOut(seg(f, 2, 12));
  const turn = f >= 16;
  const jx = HmE_SEATS[5], jty = hmeTableY(jx), jy = jty + 60;
  const scratch = Math.sin(f / 2) * 5;
  // スポットライトが当たった瞬間 (f8) から日本の席へぐっとズーム。f26 で寄りきり、そのあとはごく小さく寄り続ける
  const zin = easeInOut(seg(f, 8, 26));
  const cam = lerp(1, 1.8, zin) + 0.03 * seg(f, 26, 42);
  const px = lerp(960, jx, zin), py = lerp(540, 640, zin);   // 寄る先 (日本の席) の世界座標
  const sx = lerp(960, 1060, zin), sy = lerp(540, 520, zin); // それを画面のどこに置くか
  const jBob = Math.sin((f + 170) / 13) * 3;
  return (
    <Frame f={f} seed={5091} bg="#EFE3C8">
      <g transform={`translate(${sx} ${sy}) scale(${cam}) translate(${-px} ${-py})`}>
        {/* 右端の外側 (寄ったときに見える分) の壁と床の地 */}
        <rect x={1900} y={-60} width={400} height={620} fill="#EFE3C8" />
        <rect x={1900} y={540} width={400} height={20} fill={C2.gold} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1900} y={560} width={400} height={600} fill="#B98A58" />
        <HmEHall f={f} band={1} />
        {HmE_SEATS.map((x, i) => i < 5 && (
          <g key={x}>
            <Person x={x} y={hmeTableY(x) + 60} s={0.9} f={f} phase={i * 2} pose={turn && i % 2 ? "point" : "hold"} pointDir={1}
              face={turn ? "surprised" : "normal"} cloth={HmE_SUITS[i]} clothDark="#22262E" hair={i === 2 ? "none" : "cap"}
              gaze={turn ? [9, 0] : [0, 5]} glasses={i === 3} lean={turn ? 5 : 0} />
            <g transform={`translate(${x} ${hmeTableY(x) + 60 + Math.sin((f + i * 34) / 13) * 3}) scale(0.9) rotate(${turn ? 5 : 0})`}>
              <path d="M -22 -160 L 0 -132 L 22 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <path d="M -6 -140 L 6 -140 L 8 -100 L 0 -92 L -8 -100 Z" fill={[KRP.red, KRP.blueDeep, KRP.green][i % 3]} stroke={KRP.ink} strokeWidth={3} />
              {i === 0 && <path d="M -28 -198 Q 0 -212 28 -198" stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round" />}
              {i === 2 && <path d="M -64 -250 Q 0 -300 64 -250 Q 40 -268 0 -270 Q -40 -268 -64 -250 Z" fill={KRP.gray} />}
              {/* びっくりの線 */}
              {turn && [-1, 0, 1].map((d) => <line key={d} x1={d * 40} y1={-306} x2={d * 56} y2={-340} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />)}
            </g>
          </g>
        ))}
        {/* 日本の代表 (気まずそうに頭をかく) */}
        {/* 腕は2本: 頭をかく右腕は下で描くので、元の右腕 (胴の外側) を clip で消す */}
        <defs>
          <clipPath id="hme091arm">
            {([[-400, -600, 461, 900], [-400, -600, 800, 447], [-400, -54, 800, 400]] as const).map(([rx, ry, rw, rh], k) => (
              <rect key={k} x={rx} y={ry} width={rw} height={rh} transform={`translate(${jx} ${jy + jBob}) scale(0.9)`} />
            ))}
          </clipPath>
        </defs>
        <g clipPath="url(#hme091arm)">
          <Person x={jx} y={jy} s={0.9} f={f} phase={10} pose="stand" face="worried" cloth={HmE_SUITS[5]} clothDark="#22262E" gaze={[-6, 2]} />
        </g>
        <g transform={`translate(${jx} ${jy + jBob}) scale(0.9)`}>
          <path d="M -22 -160 L 0 -132 L 22 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -6 -140 L 6 -140 L 8 -100 L 0 -92 L -8 -100 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -24 -200 Q -12 -208 0 -200 Q 12 -208 24 -200" stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* 頭をかく右腕 */}
          <rect x={56} y={-160} width={22} height={100} rx={11} fill={HmE_SUITS[5]} stroke={KRP.ink} strokeWidth={4.5}
            transform={`rotate(${-160 + scratch} 67 -148)`} />
          <circle cx={58 + scratch * 0.4} cy={-270} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1].map((k) => <path key={k} d={`M ${78 + k * 10} ${-290 + k * 14} l 14 -6`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round"
            opacity={Math.abs(Math.sin(f / 2 + k))} />)}
          {/* 汗 */}
          <path d={`M -74 -250 q -10 18 0 26 q 10 -8 0 -26`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
        <HmETable />
        {HmE_SEATS.map((x, i) => {
          const ty = hmeTableY(x);
          const k = i - 2.5;
          return (
            <g key={x}>
              <g transform={`translate(${x} ${ty + 40}) rotate(${k * 3})`}>
                <rect x={-60} y={-24} width={120} height={64} rx={4} fill={C2.washi} stroke={KRP.ink} strokeWidth={4} />
                {[0, 1].map((r) => <line key={r} x1={-46} y1={-10 + r * 12} x2={46} y2={-10 + r * 12} stroke={KRP.gray} strokeWidth={3} />)}
                <path d="M -44 26 q 10 -18 18 0 q 8 14 16 -6 q 8 -16 16 2 q 8 12 18 -4" stroke={KRP.blueDeep} strokeWidth={4} fill="none" />
                <circle cx={44} cy={26} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
              </g>
              <HmEFlag x={x + 80} y={ty + 30} s={0.5} f={f} k={i} cols={HmE_FLAGCOLS[i]} jp={i === 5} />
            </g>
          );
        })}
        {/* 暗がりとスポットライト */}
        <defs>
          <mask id="hme091spot">
            <rect x={-200} y={-200} width={2400} height={1500} fill="white" />
            <path d={`M ${jx - 60} -60 L ${jx + 60} -60 L ${jx + 260} 820 L ${jx - 300} 820 Z`} fill="black" />
          </mask>
        </defs>
        <rect x={-200} y={-200} width={2400} height={1500} fill={KRP.ink} opacity={0.45 * dim} mask="url(#hme091spot)" />
        <path d={`M ${jx - 60} -60 L ${jx + 60} -60 L ${jx + 260} 820 L ${jx - 300} 820 Z`} fill={C2.lampGlow} opacity={0.22 * dim} />
        <ellipse cx={jx - 20} cy={800} rx={280} ry={40} fill={C2.lampGlow} opacity={0.3 * dim} />
        {/* 「週57時間」の札 (日本の席の前にだけ) */}
        <TagPlate x={jx - 60} y={jty + 92} text="週57時間" size={40} t={seg(f, 12, 20)} color={KRP.red} rot={-4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #92 日本で、働く時間に初めて上限ができたのは、1916年。
// 格: 図 / seed 5092
// 絵: どこ: 大正の役所の法令の掲示板 (木の枠・和紙)。年代札「1916年」。演出: 時計の文字盤に、初めて「ここまで」の赤い柵 (上限) が立つ。柵がずしんと立った衝撃で掲示板のほこりが舞う。札「上限」。動き: 柵が落ちて立つ / ほこり / 掲示板のゆれ
// どこ: 大正の町の役所の前、瓦屋根つきの法令の掲示板 (木の枠・和紙の貼り紙)。後ろは白壁と木の柱、足元は土の道
// 演出: 掲示板のまん中の和紙に1日の文字盤。上から赤い柵がどすんと落ちてきて「ここまで」の位置に刺さる。ほこりが舞い、掲示板がぐらり。そのあと時計の針が回ってきて、柵にこつんと当たって止まる
// 動き: 柵が落ちて刺さる (f4-12) / ほこり・掲示板のゆれ (f12-24) / 針が回って柵で止まる (f18-36) / カメラが少し寄る
const Hm092: React.FC<{ f: number }> = ({ f }) => {
  const cx = 960, cy = 480, R = 270;
  const drop = easeInOut(seg(f, 4, 12));
  const impact = seg(f, 12, 26);
  const shake = f > 12 && f < 26 ? Math.sin(f * 2.2) * 1.4 * (1 - impact) : 0;
  const fenceA = 270; // 18時
  const sweep = easeOut(seg(f, 18, 34));
  const bump = f > 34 && f < 42 ? Math.sin((f - 34) * 1.6) * 4 * (1 - seg(f, 34, 42)) : 0;
  const handA = 90 + (fenceA - 12 - 90) * sweep + bump;
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5092} bg="#EDE6D6">
      <g transform={`translate(${cx} ${cy}) scale(${cam}) translate(${-cx} ${-cy})`}>
        {/* 白壁と柱・土の道 */}
        <rect x={-60} y={-60} width={2040} height={900} fill="#EDE6D6" />
        {[60, 600, 1320, 1860].map((x) => <rect key={x} x={x - 22} y={-60} width={44} height={880} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={-60} y={300} width={2040} height={24} fill={C2.woodDark} opacity={0.8} />
        <rect x={-60} y={780} width={2040} height={400} fill="#C9B48E" />
        {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx={80 + i * 170} cy={900 + (i % 3) * 50} rx={22} ry={7} fill="#A9946E" />)}
        {/* 掲示板 (屋根・柱つき) */}
        <g transform={`rotate(${shake} 960 900)`}>
          {[300, 1620].map((x) => <rect key={x} x={x - 20} y={120} width={40} height={800} fill={C2.wood} stroke={KRP.ink} strokeWidth={6} />)}
          <path d="M 200 130 L 1720 130 L 1660 60 L 260 60 Z" fill="#5E5A66" stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={300 + i * 88} y1={64} x2={286 + i * 90} y2={128} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />)}
          <rect x={250} y={130} width={1420} height={700} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={8} />
          <rect x={280} y={160} width={1360} height={640} fill={C2.wood} stroke={KRP.ink} strokeWidth={4} />
          {/* 左右の小さな貼り紙 */}
          {[[300, 200, -3], [300, 500, 2], [1450, 210, 3], [1450, 520, -2]].map(([x, y, r], i) => (
            <g key={i} transform={`rotate(${r} ${x + 85} ${y + 120})`}>
              <rect x={x} y={y} width={170} height={250} fill={C2.washi} stroke={KRP.ink} strokeWidth={4} />
              {Array.from({ length: 5 }, (_, k) => <line key={k} x1={x + 140 - k * 28} y1={y + 24} x2={x + 140 - k * 28} y2={y + 200 - (k % 2) * 40} stroke={KRP.grayDark} strokeWidth={4} />)}
              <circle cx={x + 85} cy={y + 12} r={7} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2} />
            </g>
          ))}
          {/* まん中の和紙と文字盤 */}
          <rect x={560} y={170} width={800} height={620} fill={C2.washi} stroke={KRP.ink} strokeWidth={5} />
          {[[580, 186], [1340, 186], [580, 774], [1340, 774]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2} />)}
          <HmEDial x={cx} y={cy} r={R - 20} f={f} hand={handA} />
          {/* 赤い柵 (18時の位置に、上から落ちて刺さる) */}
          <g transform={`translate(0 ${-620 * (1 - drop)})`}>
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const x = cx - 50 - k * 40;
              return (
                <g key={k}>
                  <rect x={x - 11} y={cy - 130} width={22} height={128} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
                  <path d={`M ${x - 11} ${cy - 130} L ${x} ${cy - 152} L ${x + 11} ${cy - 130} Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
                </g>
              );
            })}
            {[-104, -44].map((dy) => <rect key={dy} x={cx - 270} y={cy + dy} width={240} height={16} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />)}
          </g>
          {/* 針が当たった「こつん」 */}
          {f > 34 && f < 44 && [0, 1, 2].map((k) => (
            <line key={k} x1={cx - 250 + k * 30} y1={cy + 50 + k * 4} x2={cx - 270 + k * 30} y2={cy + 84 + k * 6} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
        {/* ほこり */}
        {impact > 0 && impact < 1 && Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return <circle key={k} cx={cx - 160 + Math.cos(a) * (60 + 160 * impact)} cy={cy + Math.sin(a) * (30 + 90 * impact)}
            r={14 + 26 * impact} fill={C2.smoke} opacity={0.55 * (1 - impact)} />;
        })}
        {impact > 0 && impact < 1 && Array.from({ length: 6 }, (_, k) => (
          <circle key={`d${k}`} cx={400 + k * 230} cy={140 + impact * 120 + (k % 2) * 30} r={6} fill={C2.smoke} opacity={0.7 * (1 - impact)} />
        ))}
        <TagPlate x={cx - 160} y={cy - 210} text="上限" size={46} t={seg(f, 14, 22)} color={KRP.red} />
      </g>
      <TagPlate x={230} y={190} text="1916年" size={42} t={seg(f, 0, 8)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #93 対象は、子どもと女性だけ。それで、1日12時間まで。
// 格: 山 / seed 5093
// 絵: どこ: 大正の紡績工場の入口。演出: 入口の柵に「12時間」の札。子どもと女工は柵の内側。大人の男性は柵の外。文字盤の赤い柵は「12時間」の位置で、**まだ長い** (24時間のうち半分)。子どもがあくびをかみ殺す。動き: 文字盤の針が12時間を回る / あくび / 機械の音の波線
// どこ: 大正の紡績工場の入口。のこぎり屋根の木造の工場・格子窓の奥で紡績機がうなる・入口の上に大きな1日の文字盤・土の構内
// 演出: 文字盤の赤い枠は6時から12時間ぶん、針がぐるっと半周しても、まだ終わらない (長い)。入口の柵に「12時間」の札。柵の内側に女工と子ども、柵の外に大人の男性。子どもが前の子にかくれて、あくびをかみ殺す
// 動き: 針が12時間ぶん回り、赤い枠が伸びる (f0-36) / 子どものあくび (f14-34) / 機械の音の波線 / 糸車が回る
const Hm093: React.FC<{ f: number }> = ({ f }) => {
  const t = easeInOut(seg(f, 0, 36));
  const yawn = easeOut(seg(f, 14, 32)) * (0.85 + 0.15 * Math.sin(f / 3));
  const kids = [{ x: 430, ph: 1 }, { x: 760, ph: 3 }];
  const women = [{ x: 280, ph: 2 }, { x: 600, ph: 4 }, { x: 920, ph: 6 }];
  const men = [{ x: 1380, ph: 5, pose: "armsFolded" as const }, { x: 1590, ph: 7, pose: "stand" as const }, { x: 1800, ph: 8, pose: "stand" as const }];
  return (
    <Frame f={f} seed={5093} bg="#DCE6EA">
      {/* 空 */}
      <rect x={-40} y={-40} width={2000} height={300} fill="#DCE6EA" />
      {/* のこぎり屋根 */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <path d={`M ${i * 230 - 60} 170 L ${i * 230 - 60} 70 L ${i * 230 + 170} 170 Z`} fill="#6A6A72" stroke={KRP.ink} strokeWidth={5} />
          <rect x={i * 230 - 56} y={84} width={20} height={80} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      {/* 板壁 */}
      <rect x={-40} y={170} width={2000} height={620} fill="#8E6A48" />
      {Array.from({ length: 40 }, (_, i) => <line key={i} x1={i * 50 - 30} y1={170} x2={i * 50 - 30} y2={790} stroke="#6E5038" strokeWidth={3} />)}
      <rect x={-40} y={164} width={2000} height={20} fill={C2.woodDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 格子窓と奥の糸車・機械の音 */}
      {[80, 1360].map((wx, w) => (
        <g key={wx}>
          <rect x={wx} y={220} width={480} height={170} fill="#4A3E36" stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, k) => (
            <g key={k}>
              <circle cx={wx + 40 + k * 58} cy={300} r={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
              <line x1={wx + 40 + k * 58 - 20} y1={300} x2={wx + 40 + k * 58 + 20} y2={300} stroke={KRP.ink} strokeWidth={3}
                transform={`rotate(${f * 24 + k * 30} ${wx + 40 + k * 58} 300)`} />
            </g>
          ))}
          {Array.from({ length: 9 }, (_, k) => <line key={k} x1={wx + k * 60} y1={220} x2={wx + k * 60} y2={390} stroke={C2.woodLight} strokeWidth={6} />)}
          {[0, 1, 2].map((k) => {
            const p = ((f * 1.4 + k * 10) % 30) / 30;
            return <path key={k} d={`M ${wx + 60 + k * 150} ${210 - p * 50} q 15 -12 30 0 q 15 12 30 0 q 15 -12 30 0`} stroke={KRP.ink} strokeWidth={5}
              fill="none" opacity={0.8 * (1 - p)} />;
          })}
        </g>
      ))}
      {/* 入口の上の大きな文字盤 (赤い枠 = 12時間) */}
      <rect x={720} y={100} width={480} height={20} fill={C2.woodDark} />
      <HmEDial x={960} y={330} r={190} f={f} start={6} hours={12} t={t} color={KRP.red} hand={(6 + 12 * t) * 15} />
      {/* 土の構内 */}
      <rect x={-40} y={790} width={2000} height={400} fill="#C9B48E" />
      {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx={60 + i * 170} cy={880 + (i % 3) * 60} rx={24} ry={7} fill="#A9946E" />)}
      {/* 柵 (内側=左 / 外=右) */}
      <g>
        {Array.from({ length: 6 }, (_, k) => (
          <g key={k}>
            <rect x={1120 + k * 22} y={560} width={14} height={260} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${1120 + k * 22} 560 l 7 -16 l 7 16 Z`} fill={C2.woodLight} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {[610, 760].map((y) => <rect key={y} x={1100} y={y} width={160} height={16} fill={C2.wood} stroke={KRP.ink} strokeWidth={3} />)}
      </g>
      <TagPlate x={1180} y={600} text="12時間" size={42} rot={2} />
      {/* 大人の男性 (柵の外) */}
      {men.map((m, i) => (
        <g key={i}>
          <Person x={m.x} y={800} s={0.92} f={f} phase={m.ph} pose={m.pose} face={i === 1 ? "sad" : "worried"} cloth="#4E5A6A" clothDark="#363E4A" gaze={[-6, 0]} />
          <HmECap x={m.x} y={800} s={0.92} f={f} phase={m.ph} color="#3E3E46" />
        </g>
      ))}
      {/* 女工 (縞の着物・たすき・前かけ) */}
      {women.map((w, i) => (
        <g key={i}>
          <Person x={w.x} y={800} s={0.92} f={f} phase={w.ph} pose={i === 1 ? "hold" : "stand"} face={i === 2 ? "worried" : "normal"}
            cloth="#5A6A8A" clothDark="#3E4A66" tasuki=" " />
          <HmEDress x={w.x} y={800} s={0.92} f={f} phase={w.ph} skirt="#5A6A8A" scarf={KRP.white} stripe />
        </g>
      ))}
      {/* 子ども (前に立つ) */}
      {kids.map((k, i) => (
        <g key={i}>
          <Person x={k.x} y={820} s={0.66} f={f} phase={k.ph} face={i === 0 ? "normal" : "smile"} cloth={i ? "#C98A4A" : "#D9A24A"} clothDark="#8E5A2E"
            pose={i === 0 ? "stand" : "hold"} />
          {i === 0 && (
            <g transform={`translate(${k.x} ${820 + Math.sin((f + k.ph * 17) / 13) * 3}) scale(0.66)`}>
              {/* あくび: 大きく開いた口・ぎゅっとつぶった目・口に当てた手・涙 */}
              {yawn > 0.15 && (
                <g>
                  <rect x={-40} y={-240} width={80} height={36} fill={KRP.white} />
                  <path d="M -36 -222 Q -24 -214 -12 -222" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
                  <path d="M 12 -222 Q 24 -214 36 -222" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
                  <path d={`M 40 ${-212} q 6 10 0 16 q -6 -6 0 -16`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2} />
                </g>
              )}
              <rect x={-16} y={-200} width={32} height={22} fill={KRP.white} />
              <ellipse cx={0} cy={-186} rx={10 + 6 * yawn} ry={6 + 16 * yawn} fill={KRP.ink} />
              <circle cx={28} cy={-180 + 6 * (1 - yawn)} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={yawn > 0.2 ? 1 : 0} />
              <rect x={56} y={-148} width={22} height={70} rx={11} fill="#D9A24A" stroke={KRP.ink} strokeWidth={4.5}
                transform="rotate(-150 67 -148)" opacity={yawn > 0.2 ? 1 : 0} />
            </g>
          )}
        </g>
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #94 1947年、ようやく日本でも、1日8時間が法律になります。
// 格: 山 / seed 5094
// 絵: どこ: 戦後の焼け跡から立ち上がる町並み (バラック・新しい工場・青空)。年代札「1947年」。演出: 工場の壁の大時計に、ついに「8時間」の緑の枠。工場の人たちがヘルメットや帽子を空に投げて喜ぶ (face="joy")。動き: 帽子が飛ぶ / 緑の枠が描かれる / 青空に紙ふぶき
// どこ: 1947年、焼け跡から立ち上がる町。抜けるような青空・遠くに焼け残った壁と新しい芽・左右にトタン屋根のバラック・まん中に建ったばかりの工場 (煙突・足場)
// 演出: 工場の壁の大時計に、ついに8時間の緑の枠が描かれる。前に並んだ工場の人たちが、ヘルメットや帽子をいっせいに空へ放り投げて大喜び。青空に紙ふぶき
// 動き: 緑の枠が伸びる (f0-14) / 帽子とヘルメットが飛ぶ (f16-42) / 紙ふぶき (f20〜) / 煙突の白い煙 / カメラが少し上へ
const Hm094: React.FC<{ f: number }> = ({ f }) => {
  const band = easeInOut(seg(f, 0, 14));
  const tilt = -20 * easeOut(seg(f, 10, 42));
  const workers = [
    { x: 400, ph: 1, hat: "helmet", cloth: "#5E7A8E" }, { x: 680, ph: 2, hat: "cap", cloth: "#7A6A4E" },
    { x: 960, ph: 3, hat: "helmet", cloth: "#5E7A8E" }, { x: 1240, ph: 4, hat: "scarf", cloth: "#8E6A7A" },
    { x: 1520, ph: 5, hat: "cap", cloth: "#6A7A5A" },
  ];
  return (
    <Frame f={f} seed={5094} bg={C2.sky}>
      <g transform={`translate(0 ${-tilt})`}>
        {/* 青空と雲 */}
        <rect x={-40} y={-80} width={2000} height={900} fill={C2.sky} />
        <rect x={-40} y={-80} width={2000} height={200} fill={C2.skyDeep} opacity={0.6} />
        {[[260, 140], [1650, 110], [1180, 70]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x + Math.sin(f / 25 + i) * 10} ${y})`} fill={KRP.white}>
            <ellipse rx={100} ry={34} /><ellipse cx={70} cy={-20} rx={70} ry={36} /><ellipse cx={-60} cy={-12} rx={56} ry={28} />
          </g>
        ))}
        {/* 遠くの焼け残った壁と新しい芽 */}
        <g fill="#9A938A" stroke={KRP.ink} strokeWidth={4}>
          <path d="M 40 600 L 40 430 L 90 410 L 110 460 L 160 440 L 170 600 Z" />
          <path d="M 1760 600 L 1760 450 L 1800 420 L 1830 470 L 1880 450 L 1890 600 Z" />
        </g>
        {[[200, 600], [1700, 600], [1900, 600]].map(([x, y], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={y - 40} stroke={KRP.green} strokeWidth={5} />
            <ellipse cx={x - 12} cy={y - 40} rx={14} ry={7} fill={KRP.green} stroke={KRP.ink} strokeWidth={2} transform={`rotate(-30 ${x - 12} ${y - 40})`} />
            <ellipse cx={x + 12} cy={y - 46} rx={14} ry={7} fill={KRP.green} stroke={KRP.ink} strokeWidth={2} transform={`rotate(30 ${x + 12} ${y - 46})`} />
          </g>
        ))}
        {/* バラック (左右) */}
        {[[150, 440], [1580, 460]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width={300} height={220} fill="#A08A6A" stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${x - 20} ${y + 10} L ${x + 150} ${y - 50} L ${x + 320} ${y + 10} Z`} fill="#8A9AA6" stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 7 }, (_, k) => <line key={k} x1={x + k * 48} y1={y - 10 + Math.abs(3 - k) * -8} x2={x + k * 48} y2={y + 10} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />)}
            <rect x={x + 30} y={y + 60} width={80} height={70} fill="#F2D88A" stroke={KRP.ink} strokeWidth={4} />
            <line x1={x + 70} y1={y + 60} x2={x + 70} y2={y + 130} stroke={KRP.ink} strokeWidth={3} />
            {/* 洗濯物 */}
            <line x1={x + 140} y1={y + 70} x2={x + 290} y2={y + 60} stroke={KRP.ink} strokeWidth={3} />
            {[0, 1, 2].map((k) => <rect key={k} x={x + 160 + k * 42} y={y + 68 - k * 3} width={30} height={40} fill={[KRP.white, KRP.blueSoft, KRP.yellow][k]}
              stroke={KRP.ink} strokeWidth={3} transform={`rotate(${Math.sin(f / 6 + k) * 6} ${x + 175 + k * 42} ${y + 68})`} />)}
          </g>
        ))}
        {/* 新しい工場 */}
        <g>
          <rect x={1250} y={60} width={70} height={240} fill={C2.brickDark} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((k) => {
            const p = ((f + k * 12) % 36) / 36;
            return <circle key={k} cx={1285 + p * 120} cy={50 - p * 90} r={20 + p * 30} fill={KRP.white} opacity={0.85 * (1 - p)} />;
          })}
          <rect x={560} y={180} width={800} height={600} fill="#D9D2C2" stroke={KRP.ink} strokeWidth={8} />
          <rect x={540} y={160} width={840} height={30} fill="#A9A294" stroke={KRP.ink} strokeWidth={6} />
          {[0, 1].map((r) => Array.from({ length: 2 }, (_, c) => (
            <rect key={`${r}${c}`} x={[600, 1220][c]} y={250 + r * 180} width={100} height={120} fill="#BFD7E8" stroke={KRP.ink} strokeWidth={5} />
          )))}
          <rect x={860} y={620} width={200} height={160} fill="#6A5A4A" stroke={KRP.ink} strokeWidth={6} />
          {/* 足場 (右) */}
          <g stroke={C2.woodDark} strokeWidth={8}>
            {[1390, 1470].map((x) => <line key={x} x1={x} y1={200} x2={x} y2={780} />)}
            {[300, 450, 600].map((y) => <line key={y} x1={1370} y1={y} x2={1490} y2={y} />)}
            <line x1={1390} y1={300} x2={1470} y2={450} />
          </g>
          {/* 大時計 */}
          <HmEDial x={960} y={390} r={170} f={f} start={8} hours={8} t={band} color={C2.green8} hand={(8 + 8 * band) * 15} />
          {/* きらり */}
          {band >= 1 && [0, 1, 2].map((k) => {
            const tw = Math.max(0, Math.sin(f / 3 + k * 2));
            return <path key={k} d={`M ${760 + k * 200} ${210 + (k % 2) * 40} l 6 -18 l 6 18 l 18 6 l -18 6 l -6 18 l -6 -18 l -18 -6 Z`} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2} opacity={tw} />;
          })}
        </g>
        {/* 地面 (片付いた焼け跡の土) */}
        <rect x={-40} y={780} width={2000} height={400} fill="#B9A88A" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={60 + i * 200} y={860 + (i % 3) * 50} width={30} height={14} rx={4} fill="#9A8A6E" />)}
      </g>
      {/* 喜ぶ工場の人たち (カメラの外側で描く) */}
      {workers.map((w, i) => {
        const y = 840;
        const s = 1.0;
        const throwT = seg(f, 16 + i * 2, 42);
        const jump = Math.abs(Math.sin(f / 4 + i)) * 14 * seg(f, 16, 22);
        const hx = w.x + (i - 2) * 50 * throwT, hy = y - jump - 292 * s - 250 * easeOut(throwT);
        return (
          <g key={i}>
            <Person x={w.x} y={y - jump} s={s} f={f} phase={w.ph} pose={throwT > 0 ? "banzai" : "stand"} face={throwT > 0 ? "joy" : "smile"}
              cloth={w.cloth} clothDark="#3E4656" hair={w.hat === "scarf" ? "none" : "cap"} />
            {w.hat === "scarf" && <HmEDress x={w.x} y={y - jump} s={s} f={f} phase={w.ph} skirt="#6A5A7A" scarf={KRP.white} />}
            {/* 投げた帽子・ヘルメット */}
            {w.hat !== "scarf" && (
              <g transform={`translate(${hx} ${hy + 20}) rotate(${throwT * 400 * (i % 2 ? 1 : -1)}) scale(${s})`}>
                {w.hat === "helmet" ? (
                  <g>
                    <path d="M -60 10 Q -60 -54 0 -56 Q 60 -54 60 10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                    <rect x={-70} y={4} width={140} height={14} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                    <rect x={-8} y={-50} width={16} height={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
                  </g>
                ) : (
                  <g>
                    <path d="M -56 10 Q -50 -44 0 -48 Q 52 -44 58 10 Z" fill={C2.capBrown} stroke={KRP.ink} strokeWidth={5} />
                    <path d="M -60 10 Q 0 20 84 14 Q 92 26 80 30 Q 0 34 -60 22 Z" fill={KRP.ink} opacity={0.8} />
                  </g>
                )}
              </g>
            )}
          </g>
        );
      })}
      {/* 紙ふぶき */}
      {Array.from({ length: 34 }, (_, k) => {
        const start = 20 + (k % 8);
        if (f < start) return null;
        const p = (f - start) / 40;
        const x = rnd(5094, k) * 1920 + Math.sin(f / 5 + k) * 20;
        const y = -20 + p * 700 + rnd(94, k) * 200;
        return <rect key={k} x={x} y={y} width={18} height={10} fill={[KRP.red, KRP.yellow, KRP.green, KRP.blue, KRP.orange, KRP.white][k % 6]}
          stroke={KRP.ink} strokeWidth={1.5} transform={`rotate(${f * 12 + k * 40} ${x + 9} ${y + 5})`} />;
      })}
      <TagPlate x={230} y={190} text="1947年" size={42} t={seg(f, 0, 8)} />
      <TagPlate x={960} y={130} text="8時間" size={44} t={seg(f, 10, 18)} color={C2.green8} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_083: (f) => <Hm083 f={f} />,
  hm_084: (f) => <Hm084 f={f} />,
  hm_085: (f) => <Hm085 f={f} />,
  hm_086: (f) => <Hm086 f={f} />,
  hm_087: (f) => <Hm087 f={f} />,
  hm_088: (f) => <Hm088 f={f} />,
  hm_089: (f) => <Hm089 f={f} />,
  hm_090: (f) => <Hm090 f={f} />,
  hm_091: (f) => <Hm091 f={f} />,
  hm_092: (f) => <Hm092 f={f} />,
  hm_093: (f) => <Hm093 f={f} />,
  hm_094: (f) => <Hm094 f={f} />,
};

export const HM_E_MOTIFS: string[] = [
  "hm_083", // #83
  "hm_084", // #84
  "hm_085", // #85
  "hm_086", // #86
  "hm_087", // #87
  "hm_088", // #88
  "hm_089", // #89
  "hm_090", // #90
  "hm_091", // #91
  "hm_092", // #92
  "hm_093", // #93
  "hm_094", // #94
];

export const himaEScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
