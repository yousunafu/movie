// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#108〜#113 (6文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで6枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  // 白洲・奉行所
  gravel: "#ECE7DA", gravelDot: "#C4BBA6", gravelLine: "#D6CEBB",
  engawa: "#B98A57", engawaDark: "#8E6538", engawaTop: "#CFA06A",
  shoji: "#F6F0DE", shojiFrame: "#9A7448", tile: "#5E6470", tileDark: "#454A55",
  plaster: "#EDE6D3", plasterShade: "#D9D0BA",
  pine: "#4E7A4A", pineDark: "#3A5E38", bark: "#6E5236",
  mushiro: "#CDB47E", mushiroLine: "#A88E58",
  scroll: "#F8F1DD", scrollRod: "#7A3B2A", gold: "#D9A43C", goldDark: "#A87A22",
  // 人の服
  yakunin: "#4E5E3B", yakuninDark: "#3B4A2C",
  chonin: "#8C6A3F", choninDark: "#6E5230", choninStripe: "#6A4E2C", ai: "#2F4A6B", aiDark: "#22374F",
  bushi: "#3B3F52", bushiDark: "#2A2D3B", murabito: "#3F5E7A", murabitoDark: "#2E465C",
  kodomo: "#D98C4E", kodomoDark: "#B06C34", inkyo: "#7A6E5E", inkyoDark: "#5E5446",
  sakayaki: "#E8DCCB", tenugui: "#E4ECF0", zukin: "#6A5A48",
  // 着物屋
  noren: "#2F4A6B", norenDark: "#22374F", lacquer: "#8E2F24", lacquerDark: "#6A221A",
  tanA: "#C95B4E", tanB: "#5E8C6A", tanC: "#D9B44E", tanD: "#6C78B0", tanE: "#E1A6B4", tanF: "#8E6FA0",
  tatami: "#D8CC98", tatamiLine: "#B9AC74", tatamiEdge: "#4A5A3A",
  mirror: "#DCE6EC", mirrorShine: "#FFFFFF",
  // 掲示板
  board: "#C79A63", boardDark: "#9C7442", boardLine: "#B0864F", silverDark: "#9AA2A8",
  // 明治
  brick: "#B5563F", brickDark: "#8E3E2C", brickLine: "#E2B8A6", stone: "#D9D2C2",
  meijiSky: "#DCE7EE", edoSky: "#F4E6C8", road: "#CDBB95", roadDark: "#AE9C74",
  lamp: "#FFE7A0", wire: "#4A443D", rickshaw: "#2D2A2A",
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

// 2次ベジェ上の点
const NE1bQ = (a: [number, number], c: [number, number], b: [number, number], u: number): [number, number] => [
  (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
  (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
];
const NE1bQPath = (a: [number, number], c: [number, number], b: [number, number], u1: number, n = 24) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const [px, py] = NE1bQ(a, c, b, (u1 * i) / n);
    return `${i ? "L" : "M"} ${px.toFixed(1)} ${py.toFixed(1)}`;
  }).join(" ");

// (cx,cy) を中心にカメラを寄せる
const NE1bZoom = (cx: number, cy: number, k: number, dx = 0, dy = 0) =>
  `translate(${cx * (1 - k) + dx} ${cy * (1 - k) + dy}) scale(${k})`;

// Person と同じ座標系 (足元原点・s倍・lean回転) で、服の上に飾りを重ねる箱。
// ★重ねる Person には still を付ける (ゆれで飾りがずれないように)
const NE1bWear: React.FC<{ x: number; y: number; s: number; lean?: number; children?: React.ReactNode }> = ({ x, y, s, lean = 0, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>{children}</g>
);
// 縦縞 (町人の縞の着物)
const NE1bStripes: React.FC<{ color: string }> = ({ color }) => (
  <g stroke={color} strokeWidth={5} opacity={0.75}>
    {Array.from({ length: 8 }, (_, i) => (
      <line key={i} x1={-48 + i * 13.5} y1={-154} x2={-48 + i * 13.5} y2={-58} />
    ))}
  </g>
);
// 藍の前掛け
const NE1bApron: React.FC = () => (
  <g>
    <rect x={-46} y={-112} width={92} height={62} rx={6} fill={C.ai} stroke={KRP.ink} strokeWidth={4} />
    <line x1={-58} y1={-112} x2={58} y2={-112} stroke={C.aiDark} strokeWidth={6} />
    <circle cx={0} cy={-84} r={11} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.8} />
  </g>
);
// ちょんまげ (月代 + まげ)
const NE1bMage: React.FC = () => (
  <g>
    <ellipse cx={0} cy={-276} rx={38} ry={14} fill={C.sakayaki} />
    <path d="M -9 -282 L -9 -318 Q 0 -330 9 -318 L 9 -282 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-11} y={-296} width={22} height={6} rx={2} fill={KRP.white} />
  </g>
);
// 裃の肩衣 (肩の張った上衣)
const NE1bKami: React.FC<{ color: string; dark: string }> = ({ color, dark }) => (
  <g stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round">
    <path d="M -50 -160 L -104 -170 L -96 -128 L -54 -126 Z" fill={color} />
    <path d="M 50 -160 L 104 -170 L 96 -128 L 54 -126 Z" fill={color} />
    <path d="M -30 -160 L 0 -96 L 30 -160" fill="none" stroke={dark} strokeWidth={6} />
    <path d="M -30 -160 L 0 -96 L 30 -160" fill="none" stroke={KRP.white} strokeWidth={2.5} />
  </g>
);
// 腰の大小 (刀2本)
const NE1bSwords: React.FC = () => (
  <g stroke={KRP.ink} strokeWidth={4}>
    {[0, 1].map((i) => (
      <g key={i} transform={`rotate(${-16 + i * 6} -30 ${-78 + i * 10})`}>
        <rect x={-150 + i * 26} y={-86 + i * 10} width={150 - i * 30} height={13} rx={6} fill={KRP.ink} />
        <rect x={-190 + i * 26} y={-88 + i * 10} width={44} height={17} rx={5} fill="#E9D3A6" />
        <ellipse cx={-146 + i * 26} cy={-79.5 + i * 10} rx={6} ry={14} fill={KRP.brass} />
      </g>
    ))}
  </g>
);
// ほっかむり (手ぬぐい)
const NE1bHokkamuri: React.FC = () => (
  <g stroke={KRP.ink} strokeWidth={4.5}>
    <path d="M -68 -226 Q -72 -304 0 -306 Q 72 -304 68 -226 Q 50 -262 0 -262 Q -50 -262 -68 -226 Z" fill={C.tenugui} />
    {[-40, -12, 18, 44].map((dx, i) => <circle key={i} cx={dx} cy={-284 + (i % 2) * 6} r={5} fill={KRP.blueDeep} stroke="none" />)}
    <path d="M 58 -232 Q 74 -210 70 -192 L 84 -184 L 72 -176" fill={C.tenugui} strokeLinejoin="round" />
  </g>
);
// 頭巾 (隠居)
const NE1bZukin: React.FC = () => (
  <path d="M -72 -196 L -72 -240 Q -74 -310 0 -312 Q 74 -310 72 -240 L 72 -196 Q 64 -186 56 -196 L 56 -242 Q 30 -266 0 -266 Q -30 -266 -56 -242 L -56 -196 Q -64 -186 -72 -196 Z"
    fill={C.zukin} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
);
// 羽織 (前身頃の2枚 + 白い紐)
const NE1bHaori: React.FC<{ color: string }> = ({ color }) => (
  <g stroke={KRP.ink} strokeWidth={4}>
    <path d="M -58 -150 Q -58 -160 -46 -160 L -14 -160 L -20 -52 L -58 -52 Z" fill={color} />
    <path d="M 58 -150 Q 58 -160 46 -160 L 14 -160 L 20 -52 L 58 -52 Z" fill={color} />
    <circle cx={-10} cy={-118} r={6} fill={KRP.white} />
    <circle cx={10} cy={-118} r={6} fill={KRP.white} />
    <line x1={-10} y1={-118} x2={10} y2={-118} stroke={KRP.white} strokeWidth={4} />
  </g>
);
// きらきら (4本線の星)
const NE1bSpark: React.FC<{ x: number; y: number; r: number; o?: number; color?: string }> = ({ x, y, r, o = 1, color = NP.glow }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <path d={`M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`}
      fill={color} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
// 正座 (Person を沈めて、膝を前にかぶせる)。floorY = 膝の床面
const NE1bSeiza: React.FC<{
  x: number; floorY: number; s: number; f: number; cloth: string; clothDark: string; face?: "normal" | "smile" | "joy" | "surprised" | "worried";
  lean?: number; pose?: "stand" | "hold" | "armsFolded" | "raise"; gaze?: [number, number]; hair?: "cap" | "none"; phase?: number;
  deco?: React.ReactNode;
}> = ({ x, floorY, s, f, cloth, clothDark, face = "normal", lean = 0, pose = "stand", gaze, hair = "cap", phase = 0, deco }) => {
  const y = floorY + 50 * s;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} cloth={cloth} clothDark={clothDark} face={face} lean={lean} pose={pose} gaze={gaze} hair={hair} phase={phase} still />
      {deco && <NE1bWear x={x} y={y} s={s} lean={lean}>{deco}</NE1bWear>}
      {/* 折った膝 */}
      <path d={`M ${x - 84 * s} ${floorY + 62 * s} Q ${x - 90 * s} ${floorY - 46 * s} ${x - 40 * s} ${floorY - 52 * s} L ${x + 40 * s} ${floorY - 52 * s} Q ${x + 90 * s} ${floorY - 46 * s} ${x + 84 * s} ${floorY + 62 * s} Z`}
        fill={clothDark} stroke={KRP.ink} strokeWidth={4.5 * s} strokeLinejoin="round" />
      <path d={`M ${x} ${floorY - 40 * s} L ${x} ${floorY + 56 * s}`} stroke={KRP.ink} strokeWidth={3 * s} opacity={0.35} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #108 手がらのあった町人には、ごほうびとして、名字を名乗る許可が出ることもありました。
// 格: 山 / seed 4108
// 絵: 奉行所の白洲 (玉砂利・板の縁側)。町人が平伏する前に、役人が**巻物の許可状**を広げて差し出す (f)。許可状の端から、名字の札が金の紐で結ばれて町人の手に渡る。町人の顔がぱっと明るくなる (joy)
// どこ: 江戸の奉行所の白洲。右に板の縁側と障子、左に瓦屋根の白壁と松。地面は掃き目のついた玉砂利
// 演出: 縁側の役人が巻物の許可状を広げる → 巻物の端から金の紐が伸び、名字の札が紐を伝って
//       平伏していた町人の手へすべり降りる → 町人が顔を上げ、ぱっと笑顔 (joy)・きらきら
// 動き: カメラがゆっくり町人に寄る / 巻物が左へ広がり字が並ぶ (f4-18) / 紐 (f16-26) / 札がすべる (f22-36)
//       / 町人が顔を上げる (f30-38) / きらきら (f34-42) / 松の枝と同心の棒がゆれる
const Nm108: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const unroll = easeOut(seg(f, 4, 18));
  const cordT = seg(f, 16, 26);
  const ride = easeInOut(seg(f, 22, 36));
  const rise = easeOut(seg(f, 30, 38));
  const spark = seg(f, 34, 42);
  // 町人 (正座)
  const tx = 700, floorY = 770, ts = 1.3;
  const lean = 24 * (1 - rise);
  const footY = floorY + 50 * ts;
  const th = (lean * Math.PI) / 180;
  const hands: [number, number] = [tx + 128 * ts * Math.sin(th), footY - 128 * ts * Math.cos(th)];
  // 役人と巻物
  const ox = 1310, oy = 552;
  const rollR = 1300;
  const rollL = rollR - 420 * unroll;
  const A: [number, number] = [rollL, 556];
  const ctrl: [number, number] = [(A[0] + hands[0]) / 2, Math.max(A[1], hands[1]) + 90];
  const [px, py] = NE1bQ(A, ctrl, hands, ride);
  return (
    <Frame f={f} seed={4108}>
      <g transform={NE1bZoom(900, 560, 1 + 0.06 * cam)}>
        {/* 空 (曇りの白) */}
        <rect x={-40} y={-40} width={W + 80} height={420} fill={C.edoSky} />
        {/* 左: 白壁の塀 + 瓦 */}
        <rect x={-40} y={250} width={1060} height={320} fill={C.plaster} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={480} width={1060} height={90} fill={C.plasterShade} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={-40 + i * 90} y1={480} x2={-40 + i * 90} y2={570} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        ))}
        <path d="M -60 260 L 1040 260 L 1000 214 L -40 214 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M ${-30 + i * 48} 218 q 14 20 0 40`} fill="none" stroke={C.tileDark} strokeWidth={5} />
        ))}
        {/* 松 (塀の向こう) */}
        <g transform={`rotate(${Math.sin(f / 20) * 1.2} 160 260)`}>
          <path d="M 150 270 Q 130 160 210 90 Q 260 50 330 70" fill="none" stroke={C.bark} strokeWidth={26} strokeLinecap="round" />
          <path d="M 150 270 Q 130 160 210 90 Q 260 50 330 70" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
          {([[90, 150, 110], [250, 70, 130], [400, 120, 100], [180, 30, 90]] as const).map(([cx, cy, r], i) => (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.42} fill={C.pine} stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={cx - r * 0.2} cy={cy - r * 0.1} rx={r * 0.6} ry={r * 0.18} fill={C.pineDark} opacity={0.6} />
            </g>
          ))}
        </g>
        {/* 右: 奉行所の建物 (軒・障子・柱) */}
        <rect x={960} y={-40} width={1000} height={560} fill={C.shoji} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <rect x={1000 + i * 190} y={150} width={170} height={350} fill={C.shoji} stroke={C.shojiFrame} strokeWidth={6} />
            {[1, 2, 3].map((k) => <line key={k} x1={1000 + i * 190 + k * 42.5} y1={150} x2={1000 + i * 190 + k * 42.5} y2={500} stroke={C.shojiFrame} strokeWidth={3} />)}
            {[1, 2, 3, 4, 5, 6].map((k) => <line key={`h${k}`} x1={1000 + i * 190} y1={150 + k * 50} x2={1170 + i * 190} y2={150 + k * 50} stroke={C.shojiFrame} strokeWidth={3} />)}
            <rect x={1000 + i * 190} y={430} width={170} height={70} fill={C.engawa} stroke={C.shojiFrame} strokeWidth={5} />
          </g>
        ))}
        {[975, 1925].map((x) => <rect key={x} x={x - 18} y={100} width={36} height={420} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={5} />)}
        <rect x={940} y={70} width={1020} height={40} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 920 80 L 1960 80 L 1960 -40 L 980 -40 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M ${990 + i * 50} -30 q 14 40 0 104`} fill="none" stroke={C.tileDark} strokeWidth={5} />)}
        {/* 玉砂利 */}
        <rect x={-40} y={560} width={W + 80} height={560} fill={C.gravel} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -40 ${610 + i * 72} q 240 ${-14 + (i % 2) * 28} 480 0 t 480 0 t 480 0 t 520 0`} fill="none" stroke={C.gravelLine} strokeWidth={5} />
        ))}
        {Array.from({ length: 170 }, (_, i) => (
          <ellipse key={i} cx={rnd(4108, i) * 1960 - 20} cy={570 + rnd(4109, i) * 500} rx={4 + rnd(41, i) * 5} ry={3 + rnd(42, i) * 3} fill={C.gravelDot} />
        ))}
        {/* 縁側 (板張り) */}
        <rect x={960} y={520} width={1000} height={40} fill={C.engawaTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={960} y={560} width={1000} height={100} fill={C.engawa} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={960 + i * 115} y1={560} x2={960 + i * 115} y2={660} stroke={C.engawaDark} strokeWidth={4} />)}
        {[1000, 1460, 1900].map((x) => <rect key={x} x={x - 16} y={660} width={32} height={40} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={960} y={694} width={1000} height={14} fill={KRP.ink} opacity={0.12} />
        {/* 左の同心 (棒を持って立つ) */}
        <g>
          <line x1={262} y1={360 + Math.sin(f / 18) * 3} x2={250} y2={790} stroke={C.bark} strokeWidth={14} strokeLinecap="round" />
          <Person x={210} y={790} s={0.9} f={f} cloth={C.bushi} clothDark={C.bushiDark} face="normal" gaze={[5, 0]} phase={2} still />
          <NE1bWear x={210} y={790} s={0.9}><NE1bMage /><NE1bHaori color={C.bushiDark} /></NE1bWear>
          <ellipse cx={210} cy={792} rx={70} ry={12} fill={KRP.ink} opacity={0.15} />
        </g>
        {/* 役人 (縁側に立つ) */}
        <Person x={ox} y={oy} s={1.05} f={f} cloth={C.yakunin} clothDark={C.yakuninDark} face="smile" pose="hold" gaze={[-6, 3]} phase={1} still />
        <NE1bWear x={ox} y={oy} s={1.05}><NE1bKami color={C.yakunin} dark={C.yakuninDark} /><NE1bMage /></NE1bWear>
        {/* 巻物の許可状 */}
        <g>
          <rect x={rollL} y={400} width={rollR - rollL} height={150} fill={C.scroll} stroke={KRP.ink} strokeWidth={5} />
          <rect x={rollL} y={400} width={rollR - rollL} height={14} fill={C.gold} opacity={0.6} />
          <rect x={rollL} y={536} width={rollR - rollL} height={14} fill={C.gold} opacity={0.6} />
          {Array.from({ length: 13 }, (_, i) => {
            const cx = rollR - 34 - i * 28;
            if (cx < rollL + 30) return null;
            return (
              <g key={i} stroke={NP.sumi} strokeWidth={5} strokeLinecap="round">
                <line x1={cx} y1={428} x2={cx} y2={428 + 40 + rnd(7, i) * 50} />
                <line x1={cx - 5} y1={480 + rnd(8, i) * 20} x2={cx + 5} y2={486 + rnd(8, i) * 20} />
              </g>
            );
          })}
          {unroll > 0.85 && <rect x={rollL + 26} y={480} width={38} height={38} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} opacity={0.9} transform={`rotate(-6 ${rollL + 45} 499)`} />}
          {[rollL, rollR].map((x, i) => (
            <g key={i}>
              <rect x={x - 12} y={388} width={24} height={174} rx={10} fill={C.scrollRod} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={x} cy={388} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={x} cy={562} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 金の紐 */}
        {cordT > 0 && (
          <g>
            <path d={NE1bQPath(A, ctrl, hands, cordT)} fill="none" stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
            <path d={NE1bQPath(A, ctrl, hands, cordT)} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
            <path d={NE1bQPath(A, ctrl, hands, cordT)} fill="none" stroke={C.goldDark} strokeWidth={3} strokeDasharray="5 9" />
          </g>
        )}
        {/* 筵 */}
        <rect x={510} y={768} width={380} height={110} rx={6} fill={C.mushiro} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={530 + i * 37} y1={772} x2={530 + i * 37} y2={874} stroke={C.mushiroLine} strokeWidth={4} />)}
        {/* 町人 (正座 → 顔を上げる) */}
        <NE1bSeiza x={tx} floorY={floorY} s={ts} f={f} cloth={C.chonin} clothDark={C.choninDark}
          face={rise > 0.45 ? "joy" : "normal"} lean={lean} pose="hold" gaze={[6, 6]} phase={3}
          deco={<><NE1bStripes color={C.choninStripe} /><NE1bApron /><NE1bMage /></>} />
        {/* 名字の札 (紐を伝って手へ) */}
        {unroll > 0.95 && (
          <g transform={`translate(${px} ${py - 30}) rotate(${Math.sin(f / 5) * 4 * (1 - ride)})`}>
            <path d="M 0 -48 L 0 -30" stroke={C.gold} strokeWidth={5} />
            <rect x={-52} y={-34} width={104} height={64} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-52} y={-34} width={104} height={12} rx={6} fill={NP.woodMid} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={NP.sumi}>山田</text>
          </g>
        )}
        {/* きらきら + 喜びの線 */}
        {spark > 0 && (
          <g>
            {([[-120, -330, 26], [120, -350, 22], [-170, -220, 18], [170, -240, 24], [60, -470, 20]] as const).map(([dx, dy, r], i) => (
              <NE1bSpark key={i} x={tx + dx} y={footY + dy} r={r * pop(clamp01(spark * 1.6 - i * 0.12))} o={0.95} />
            ))}
            {[-1, 1].map((sd) => (
              <g key={sd} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={spark}>
                <line x1={tx + sd * 92} y1={footY - 330} x2={tx + sd * 118} y2={footY - 352} />
                <line x1={tx + sd * 100} y1={footY - 300} x2={tx + sd * 132} y2={footY - 306} />
              </g>
            ))}
          </g>
        )}
      </g>
      <TagPlate x={1630} y={118} text="江戸・奉行所" size={36} t={seg(f, 0, 8)} />
      <TagPlate x={760} y={222} text="名字の許可" size={38} t={seg(f, 28, 36)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #109 名字は、身分の札だったのです。
// 格: 図 / seed 4109
// 絵: 江戸の身分と名前の札の早見表 (木の掲示板=世界)。武士: 名字と刀の札 (金) / 名字を許された町人: 名字の札 (銀) / 村人・町人: 名前だけの札 (木)。3段の札が f で順に掛かる
// どこ: 江戸の町かどの土壁の前に立つ、屋根つきの木の掲示板 (高札場ふう)
// 演出: 掲示板の3段に、身分の印 (刀・そろばん・鍬) が描かれ、その横の釘に札が上から順に落ちて掛かる
//       金 (名字・帯刀) → 銀 (名字) → 木 (名前だけ)。札の材質の差で「名字=身分の札」を見せる
// 動き: カメラが上から下へゆっくりパン / 札が落ちて揺れて止まる (f4-16 / f14-26 / f24-36) / 金の札がきらり (f36-42)
const NE1bPlate: React.FC<{ x: number; y: number; w: number; t: number; f: number; fill: string; edge: string; text: string; icon?: "sword" }> = ({ x, y, w, t, f, fill, edge, text, icon }) => {
  if (t <= 0) return null;
  const drop = easeOut(t);
  const swing = Math.sin(f / 3.2) * 10 * (1 - t) * (t < 1 ? 1 : 0) + Math.sin(f / 18) * 1.2;
  const yy = y - 160 * (1 - drop);
  return (
    <g opacity={clamp01(t * 3)}>
      {/* 釘と紐 */}
      <circle cx={x} cy={y - 78} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      <g transform={`translate(${x} ${yy}) rotate(${swing} 0 -78)`}>
        <path d={`M 0 -78 L ${-w * 0.3} -44 M 0 -78 L ${w * 0.3} -44`} stroke={KRP.ink} strokeWidth={4.5} fill="none" />
        <rect x={-w / 2 + 6} y={-38} width={w} height={96} rx={14} fill={KRP.ink} opacity={0.2} />
        <rect x={-w / 2} y={-46} width={w} height={96} rx={14} fill={fill} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-w / 2 + 12} y={-36} width={w - 24} height={14} rx={7} fill={KRP.white} opacity={0.35} />
        <rect x={-w / 2 + 8} y={-38} width={w - 16} height={80} rx={10} fill="none" stroke={edge} strokeWidth={4} />
        {icon === "sword" && (
          <g transform={`translate(${w / 2 - 70} 2) rotate(-30)`}>
            <rect x={-44} y={-5} width={74} height={10} rx={5} fill={KRP.ink} />
            <rect x={30} y={-7} width={24} height={14} rx={4} fill={C.lacquer} stroke={KRP.ink} strokeWidth={2} />
            <ellipse cx={30} cy={0} rx={4} ry={11} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2} />
          </g>
        )}
        <text x={icon ? -30 : 0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={NP.sumi}>{text}</text>
      </g>
    </g>
  );
};
const Nm109: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const t1 = seg(f, 4, 16), t2 = seg(f, 14, 26), t3 = seg(f, 24, 36);
  const shine = seg(f, 36, 42);
  const rows = [300, 470, 640];
  return (
    <Frame f={f} seed={4109}>
      <g transform={NE1bZoom(960, 480, 1.04, 0, lerp(16, -10, pan))}>
        {/* 土壁 */}
        <rect x={-40} y={-40} width={W + 80} height={900} fill="#D9C39A" />
        {Array.from({ length: 140 }, (_, i) => (
          <circle key={i} cx={rnd(4109, i) * W} cy={rnd(4110, i) * 860} r={2 + rnd(9, i) * 4} fill={i % 3 ? "#C3AA7E" : "#E8D6B0"} />
        ))}
        <rect x={-40} y={40} width={W + 80} height={34} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={5} />
        {[90, 1830].map((x) => <rect key={x} x={x - 26} y={-40} width={52} height={920} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 地面 */}
        <rect x={-40} y={850} width={W + 80} height={300} fill={KRP.floor} />
        <line x1={-40} y1={850} x2={W + 40} y2={850} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${60 + i * 120} 872 l 8 -22 l 6 20 l 8 -16 l 4 18`} fill="none" stroke={C.pineDark} strokeWidth={4} />
        ))}
        {/* 掲示板の脚 */}
        {[380, 1540].map((x) => <rect key={x} x={x - 22} y={700} width={44} height={170} fill={C.boardDark} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 掲示板の屋根 */}
        <path d="M 210 196 L 1710 196 L 1640 132 L 280 132 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 28 }, (_, i) => <path key={i} d={`M ${296 + i * 49} 138 q 12 26 0 54`} fill="none" stroke={C.tileDark} strokeWidth={5} />)}
        {/* 板 */}
        <rect x={250} y={196} width={1420} height={560} fill={C.board} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={250} y1={196 + (i + 1) * 80} x2={1670} y2={196 + (i + 1) * 80} stroke={C.boardLine} strokeWidth={3} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${280 + rnd(3, i) * 1300} ${210 + i * 60} q 60 ${-8 + rnd(4, i) * 16} 120 0`} fill="none" stroke={C.boardDark} strokeWidth={3} opacity={0.6} />
        ))}
        {/* 段の仕切り */}
        {[385, 555].map((y) => <line key={y} x1={280} y1={y} x2={1640} y2={y} stroke={C.boardDark} strokeWidth={5} strokeDasharray="18 10" />)}
        {/* 段の印 (板に描いた絵) */}
        {/* 武士: 交差した刀 */}
        <g transform={`translate(360 ${rows[0]})`}>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`rotate(${sd * 35})`}>
              <rect x={-60} y={-6} width={96} height={12} rx={6} fill={KRP.ink} />
              <rect x={36} y={-8} width={34} height={16} rx={4} fill={C.lacquer} stroke={KRP.ink} strokeWidth={2.5} />
              <ellipse cx={36} cy={0} rx={5} ry={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          ))}
        </g>
        {/* 町人: そろばん */}
        <g transform={`translate(360 ${rows[1]})`}>
          <rect x={-62} y={-34} width={124} height={68} rx={6} fill={C.lacquerDark} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-56} y1={-12} x2={56} y2={-12} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <line x1={-46 + i * 18.5} y1={-30} x2={-46 + i * 18.5} y2={30} stroke="#C9B48A" strokeWidth={2.5} />
              <ellipse cx={-46 + i * 18.5} cy={-22} rx={8} ry={5} fill="#E9D3A6" stroke={KRP.ink} strokeWidth={2} />
              <ellipse cx={-46 + i * 18.5} cy={6 + (i % 2) * 6} rx={8} ry={5} fill="#E9D3A6" stroke={KRP.ink} strokeWidth={2} />
            </g>
          ))}
        </g>
        {/* 村人: 鍬 */}
        <g transform={`translate(360 ${rows[2]}) rotate(-25)`}>
          <rect x={-8} y={-60} width={16} height={120} rx={7} fill={C.bark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -8 -60 L -58 -56 L -54 -28 L -8 -40 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        </g>
        {/* 札 */}
        <NE1bPlate x={1180} y={rows[0]} w={460} t={t1} f={f} fill={KRP.brass} edge={NP.brassDark} text="名字・帯刀" icon="sword" />
        <NE1bPlate x={1180} y={rows[1]} w={400} t={t2} f={f} fill={KRP.silver} edge={C.silverDark} text="名字" />
        <NE1bPlate x={1180} y={rows[2]} w={360} t={t3} f={f} fill={NP.wood} edge={NP.woodDark} text="名前だけ" />
        {/* 金の札のきらり */}
        {shine > 0 && (
          <g>
            <NE1bSpark x={1420} y={rows[0] - 44} r={26 * pop(shine)} />
            <NE1bSpark x={958} y={rows[0] + 36} r={18 * pop(clamp01(shine * 1.4 - 0.2))} />
          </g>
        )}
      </g>
      <TagPlate x={640} y={300} text="武士" size={40} t={seg(f, 2, 10)} />
      <TagPlate x={640} y={470} text="許された町人" size={36} t={seg(f, 12, 20)} />
      <TagPlate x={640} y={640} text="村人・町人" size={36} t={seg(f, 22, 30)} />
      <TagPlate x={1640} y={100} text="江戸の名字" size={36} t={seg(f, 0, 6)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #110 しかも江戸の人にとって、名前は、一生に何度も着替えるものでした。
// 格: 山 / seed 4110
// 絵: 江戸の着物屋の店先 (のれん・反物の棚・衣桁)。衣桁に**名前の札が着物のように何枚も掛かっている**。Person (町人) が札を1枚取って胸に当てて鏡を見る (f)。からくりらしい比喩の絵
// どこ: 江戸の呉服屋の店先。上に藍ののれん、右の棚に反物、左に朱塗りの衣桁、手前は畳の上がり框
// 演出: 衣桁に「名前の札をつけた着物」が4枚掛かっている (名前=着替える服の比喩)。
//       町人が1枚を取ると、着物は札ごと胸もとへ飛んでくる → 胸に当てて鏡を見る → 鏡がきらり、にっこり
// 動き: カメラが衣桁から町人と鏡へパン / 着物が弧を描いて胸へ (f6-24) / 空いた衣桁の掛け紐がゆれる
//       / 鏡に姿が映り光る (f26-40) / のれんがゆれる
const NE1bKimono: React.FC<{ x: number; y: number; s?: number; color: string; name: string; rot?: number }> = ({ x, y, s = 1, color, name, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -38 0 L -80 12 L -80 92 L -38 92 L -38 240 L 38 240 L 38 92 L 80 92 L 80 12 L 38 0 Z"
      fill={color} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -24 0 L 6 70 L 6 240" fill="none" stroke={KRP.ink} strokeWidth={4} />
    <path d="M -24 0 L 0 0 L 24 0 L 6 70" fill="none" stroke={KRP.white} strokeWidth={6} />
    {Array.from({ length: 6 }, (_, i) => (
      <circle key={i} cx={-60 + (i % 3) * 56 + (i > 2 ? 26 : 0)} cy={40 + Math.floor(i / 3) * 140 + (i % 2) * 20} r={7} fill={KRP.white} opacity={0.55} />
    ))}
    <rect x={-46} y={104} width={92} height={56} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={4.5} />
    <text x={0} y={144} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={name.length > 2 ? 28 : 36} fill={NP.sumi}>{name}</text>
  </g>
);
const Nm110: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const fly = easeInOut(seg(f, 6, 24));
  const look = seg(f, 24, 32);
  const glint = seg(f, 28, 40);
  const px = 1200, py = 846, ps = 1.25;
  // 飛ぶ着物の位置 (衣桁 → 胸)
  const from: [number, number] = [895, 290], to: [number, number] = [px, py - 172 * ps];
  const [kx, ky] = NE1bQ(from, [990, 150], to, fly);
  const ksc = lerp(1.3, 0.62, fly);
  const kimonos = [
    { x: 250, c: C.tanA, n: "松吉" }, { x: 465, c: C.tanB, n: "松太郎" }, { x: 680, c: C.tanD, n: "松兵衛" },
  ];
  return (
    <Frame f={f} seed={4110}>
      <g transform={NE1bZoom(960, 560, 1.05, lerp(50, -50, pan), 0)}>
        {/* 店の奥の壁 */}
        <rect x={-80} y={-40} width={W + 160} height={860} fill="#E8D8B4" />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-80 + i * 230} y1={0} x2={-80 + i * 230} y2={820} stroke={C.boardLine} strokeWidth={4} opacity={0.5} />)}
        {/* 右: 反物の棚 */}
        <rect x={1330} y={230} width={640} height={560} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={1330} y={360 + r * 140} width={640} height={16} fill={C.engawa} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 7 }, (_, i) => {
              const cols = [C.tanA, C.tanB, C.tanC, C.tanD, C.tanE, C.tanF];
              const c = cols[(i + r * 2) % 6];
              return (
                <g key={i}>
                  <rect x={1346 + i * 86} y={252 + r * 140} width={78} height={108} rx={8} fill={c} stroke={KRP.ink} strokeWidth={4} />
                  <ellipse cx={1385 + i * 86} cy={306 + r * 140} rx={24} ry={42} fill={KRP.white} opacity={0.25} />
                  <line x1={1346 + i * 86} y1={290 + r * 140} x2={1424 + i * 86} y2={290 + r * 140} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
                </g>
              );
            })}
          </g>
        ))}
        {/* 鏡台 */}
        <g>
          <rect x={1470} y={640} width={20} height={190} fill={C.lacquerDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1380} y={790} width={200} height={50} rx={8} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={1480} cy={520} rx={118} ry={152} fill={C.lacquer} stroke={KRP.ink} strokeWidth={6} />
          <clipPath id="ne1b110mir"><ellipse cx={1480} cy={520} rx={96} ry={130} /></clipPath>
          <ellipse cx={1480} cy={520} rx={96} ry={130} fill={C.mirror} stroke={KRP.ink} strokeWidth={4} />
          <g clipPath="url(#ne1b110mir)" opacity={0.35 + 0.55 * look}>
            {/* 鏡に映る町人 (小さく・左右反転) */}
            <g transform="translate(2960 0) scale(-1 1)">
              <Person x={1490} y={760} s={0.7} f={f} cloth={C.chonin} clothDark={C.choninDark} face="smile" pose="hold" gaze={[4, 0]} still />
              <NE1bWear x={1490} y={760} s={0.7}><NE1bStripes color={C.choninStripe} /><NE1bMage /></NE1bWear>
              {look > 0 && <NE1bKimono x={1490} y={760 - 172 * 0.7} s={0.44} color={C.tanE} name="" />}
            </g>
            <path d={`M ${1400 + glint * 160} 380 l 50 0 l -110 300 l -50 0 Z`} fill={C.mirrorShine} opacity={0.55} />
          </g>
        </g>
        {/* 左: 衣桁 (朱塗り) */}
        <g>
          {[110, 1010].map((x) => (
            <g key={x}>
              <rect x={x - 16} y={250} width={32} height={570} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
              <rect x={x - 60} y={800} width={120} height={32} rx={8} fill={C.lacquerDark} stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
          <path d="M 40 268 Q 560 246 1080 268 L 1090 240 Q 560 214 30 240 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={90} y={640} width={940} height={22} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
          {kimonos.map((k, i) => (
            <NE1bKimono key={i} x={k.x} y={272} s={1.3} color={k.c} name={k.n} rot={Math.sin(f / 24 + i) * 0.8} />
          ))}
          {/* 空いた掛け紐 (取ったあとゆれる) */}
          <path d={`M 895 262 q ${Math.sin(f / 4) * 14 * fly} 30 ${Math.sin(f / 4) * 10 * fly} 50`} fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 上がり框 (畳) */}
        <rect x={-80} y={820} width={W + 160} height={40} fill={C.engawa} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-80} y={860} width={W + 160} height={260} fill={C.tatami} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-80} y1={870 + i * 8} x2={W + 80} y2={870 + i * 8} stroke={C.tatamiLine} strokeWidth={2} />)}
        {/* 町人 */}
        <ellipse cx={px} cy={py - 4} rx={90} ry={14} fill={KRP.ink} opacity={0.16} />
        <Person x={px} y={py} s={ps} f={f} cloth={C.chonin} clothDark={C.choninDark}
          face={look > 0.5 ? "joy" : "smile"} pose="hold" gaze={look > 0.3 ? [10, -2] : [-8, -4]} lean={look * 3} phase={1} still />
        <NE1bWear x={px} y={py} s={ps} lean={look * 3}><NE1bStripes color={C.choninStripe} /><NE1bApron /><NE1bMage /></NE1bWear>
        {/* 飛んでくる着物 (4枚目) */}
        <NE1bKimono x={kx} y={ky} s={ksc} color={C.tanE} name="松翁" rot={Math.sin(fly * Math.PI) * -14} />
        {/* 手が着物を押さえる */}
        {fly >= 1 && [-1, 1].map((sd) => (
          <circle key={sd} cx={px + sd * 40} cy={py - 128 * ps} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 鏡のきらり */}
        {glint > 0 && (
          <g>
            <NE1bSpark x={1580} y={400} r={30 * pop(glint)} />
            <NE1bSpark x={1380} y={650} r={18 * pop(clamp01(glint * 1.4 - 0.3))} />
          </g>
        )}
        {/* のれん (藍・白い丸の紋。字は入れない) */}
        <rect x={-80} y={-40} width={W + 160} height={60} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => {
          const sw = Math.sin(f / 16 + i * 0.8) * 6;
          const x0 = -40 + i * 340;
          return (
            <g key={i}>
              <path d={`M ${x0} 20 L ${x0 + 320} 20 L ${x0 + 320 + sw} 190 L ${x0 + sw} 190 Z`} fill={C.noren} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${x0 + 10} 172 L ${x0 + 310} 172`} stroke={C.norenDark} strokeWidth={6} />
              <circle cx={x0 + 160 + sw * 0.6} cy={104} r={40} fill="none" stroke={KRP.white} strokeWidth={8} />
              <circle cx={x0 + 160 + sw * 0.6} cy={104} r={16} fill={KRP.white} opacity={0.9} />
            </g>
          );
        })}
      </g>
      <TagPlate x={1640} y={262} text="江戸・呉服屋" size={34} t={seg(f, 0, 8)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #111 子どもの名前、大人の名前、家を継いだときの名前、隠居したときの名前。
// 格: 図 / seed 4111
// 絵: ★一生の名前の4コマ (からくりの回り舞台)。回り舞台が f で回り、①子ども (前髪・凧) ②元服した大人 (ちょんまげ) ③家を継いだ当主 (羽織・帳場) ④隠居 (頭巾・杖・縁側) の順に、同じ1人の人物が現れる。各コマの上に名札 (字は「○○丸」「○○」「○○衛門」「○○庵」など一般的な形・**実在の人の名ではない**)
// どこ: 江戸の芝居小屋の舞台。両袖に三色の引幕、天井に提灯、床に大きな回り舞台 (4つに仕切ってある)
// 演出: 回り舞台の4区画に、同じ1人 (右ほおのほくろが目印) の一生の4つの姿が立つ。
//       子ども (前髪・凧) → 元服した大人 (ちょんまげ・肩衣) → 当主 (羽織・帳場) → 隠居 (頭巾・杖・縁側)。
//       舞台が90度ずつ3回まわり、正面に来た区画の名札が光る。f=45 で隠居が正面・ほかの3つも見える
// 動き: 回り舞台 90度×3 (f6-12 / f16-22 / f26-32) / 正面のスポットライト / 凧がはためく / 提灯がゆれる / カメラが少し寄る
type NE1bStage = 0 | 1 | 2 | 3;
const NE1bLife: React.FC<{ k: NE1bStage; f: number; lit: number }> = ({ k, f, lit }) => {
  const mole = (s: number, x: number, y: number) => <circle cx={x + 34 * s} cy={y - 200 * s} r={4.5 * s} fill={KRP.ink} />;
  const plate = (name: string, role: string) => {
    const w = name.length * 46 + 50;
    return (
      <g transform="translate(0 -400)">
        <line x1={0} y1={40} x2={0} y2={110} stroke={C.engawaDark} strokeWidth={8} />
        {lit > 0 && <rect x={-w / 2 - 14} y={-58} width={w + 28} height={116} rx={20} fill={NP.glow} opacity={0.5 * lit} />}
        <rect x={-w / 2} y={-44} width={w} height={88} rx={12} fill={lit > 0.5 ? NP.glowCore : NP.wood} stroke={KRP.ink} strokeWidth={5} />
        <text x={0} y={-16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={KRP.grayDark}>{role}</text>
        <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={NP.sumi}>{name}</text>
      </g>
    );
  };
  if (k === 0) {
    const s = 0.64;
    const kx = 150 + Math.sin(f / 7) * 8, ky = -330 + Math.cos(f / 9) * 8;
    return (
      <g>
        {plate("松丸", "子ども")}
        {/* 凧 */}
        <path d={`M ${67 * s + 4} ${-148 * s - 84 * s} Q 120 -200 ${kx} ${ky + 40}`} fill="none" stroke={KRP.ink} strokeWidth={3} />
        <g transform={`translate(${kx} ${ky}) rotate(${12 + Math.sin(f / 6) * 6})`}>
          <rect x={-40} y={-50} width={80} height={96} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-2} r={26} fill={KRP.red} />
          <line x1={-40} y1={-50} x2={40} y2={46} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
          <line x1={40} y1={-50} x2={-40} y2={46} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
          <path d={`M 0 46 q ${Math.sin(f / 4) * 12} 30 0 60 q ${-Math.sin(f / 4) * 12} 20 0 40`} fill="none" stroke={KRP.red} strokeWidth={5} />
        </g>
        <Person x={0} y={0} s={s} f={f} cloth={C.kodomo} clothDark={C.kodomoDark} face="joy" pose="raise" still />
        <NE1bWear x={0} y={0} s={s}>
          {/* 前髪 (おでこに垂れる房) */}
          <path d="M -40 -262 Q -6 -236 30 -258 Q 10 -268 -40 -262 Z" fill={KRP.ink} />
          <ellipse cx={0} cy={-292} rx={22} ry={10} fill={KRP.ink} />
        </NE1bWear>
        {mole(s, 0, 0)}
      </g>
    );
  }
  if (k === 1) {
    const s = 0.92;
    return (
      <g>
        {plate("松吉", "大人")}
        {/* 元服の祝いの松 (鉢植え) */}
        <rect x={-190} y={-60} width={64} height={60} rx={6} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -158 -60 Q -164 -110 -150 -140" fill="none" stroke={C.bark} strokeWidth={10} />
        <ellipse cx={-150} cy={-148} rx={46} ry={20} fill={C.pine} stroke={KRP.ink} strokeWidth={4} />
        <Person x={0} y={0} s={s} f={f} cloth={C.chonin} clothDark={C.choninDark} face="smile" phase={2} still />
        <NE1bWear x={0} y={0} s={s}><NE1bStripes color={C.choninStripe} /><NE1bKami color={C.ai} dark={C.aiDark} /><NE1bMage /></NE1bWear>
        {mole(s, 0, 0)}
      </g>
    );
  }
  if (k === 2) {
    const s = 0.92;
    return (
      <g>
        {plate("松右衛門", "当主")}
        <Person x={0} y={0} s={s} f={f} cloth={C.chonin} clothDark={C.choninDark} face="smile" pose="hold" phase={3} still />
        <NE1bWear x={0} y={0} s={s}><NE1bStripes color={C.choninStripe} /><NE1bHaori color={C.bushi} /><NE1bMage /></NE1bWear>
        {mole(s, 0, 0)}
        {/* 帳場格子 + 机 + そろばん */}
        <rect x={-150} y={-96} width={300} height={22} rx={4} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-150} y={-74} width={300} height={74} fill={C.engawa} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-130 + i * 32.5} y1={-74} x2={-130 + i * 32.5} y2={0} stroke={C.engawaDark} strokeWidth={4} />)}
        <rect x={20} y={-118} width={90} height={24} rx={4} fill={C.lacquerDark} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={30 + i * 14} cy={-106} r={4.5} fill="#E9D3A6" />)}
        <rect x={-110} y={-124} width={80} height={30} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
  }
  const s = 0.88;
  return (
    <g>
      {plate("松庵", "隠居")}
      {/* 縁側の床几と盆栽・湯のみ */}
      <rect x={70} y={-70} width={150} height={20} rx={4} fill={C.engawaTop} stroke={KRP.ink} strokeWidth={4} />
      {[84, 204].map((x) => <rect key={x} x={x - 6} y={-50} width={12} height={50} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={3} />)}
      <rect x={160} y={-102} width={40} height={32} rx={6} fill={C.tanD} stroke={KRP.ink} strokeWidth={3} />
      <path d={`M 170 -108 q 4 -14 0 -26 M 184 -108 q 4 -14 0 -26`} fill="none" stroke={KRP.grayDark} strokeWidth={3} opacity={0.4 + 0.3 * Math.sin(f / 6)} />
      <rect x={90} y={-112} width={52} height={42} rx={5} fill={C.lacquer} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={116} cy={-124} rx={34} ry={14} fill={C.pine} stroke={KRP.ink} strokeWidth={3} />
      {/* 杖 */}
      <line x1={-74} y1={-90} x2={-92} y2={0} stroke={C.bark} strokeWidth={10} strokeLinecap="round" />
      <Person x={0} y={0} s={s} f={f} cloth={C.inkyo} clothDark={C.inkyoDark} face="smile" hair="none" lean={-4} phase={4} still />
      <NE1bWear x={0} y={0} s={s} lean={-4}><NE1bZukin /></NE1bWear>
      {mole(s, -14, -2)}
    </g>
  );
};
const Nm111: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const turn = easeInOut(seg(f, 6, 12)) + easeInOut(seg(f, 16, 22)) + easeInOut(seg(f, 26, 32));
  const th = (-90 * turn * Math.PI) / 180;
  const CX = 960, CY = 600, RX = 660, RY = 250;
  const booths = ([0, 1, 2, 3] as NE1bStage[]).map((k) => {
    const a = (k * Math.PI) / 2 + th;
    const ca = Math.cos(a);
    return { k, ca, x: CX + 540 * Math.sin(a), y: CY + 220 * ca, sc: 0.62 + 0.38 * (ca + 1) / 2 };
  }).sort((p, q) => p.ca - q.ca);
  const spin = (Math.sin(f / 2) * 0.5 + 0.5) * (turn % 1 > 0.02 && turn % 1 < 0.98 ? 1 : 0);
  return (
    <Frame f={f} seed={4111} bg="#2E2622">
      <g transform={NE1bZoom(960, 560, 1 + 0.04 * cam)}>
        {/* 舞台の奥 (黒い板壁) */}
        <rect x={-40} y={-40} width={W + 80} height={620} fill="#4A3B30" />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-40 + i * 150} y1={-40} x2={-40 + i * 150} y2={580} stroke="#3A2E25" strokeWidth={6} />)}
        {/* 提灯 */}
        {[380, 760, 1160, 1540].map((x, i) => {
          const r = Math.sin(f / 15 + i) * 3;
          return (
            <g key={x} transform={`rotate(${r} ${x} 0)`}>
              <line x1={x} y1={-10} x2={x} y2={60} stroke={KRP.ink} strokeWidth={4} />
              <rect x={x - 30} y={56} width={60} height={14} fill={KRP.ink} />
              <ellipse cx={x} cy={118} rx={50} ry={54} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={x} cy={118} rx={30} ry={46} fill={KRP.orange} opacity={0.55} />
              {[-1, 0, 1].map((j) => <line key={j} x1={x - 48} y1={118 + j * 24} x2={x + 48} y2={118 + j * 24} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />)}
              <rect x={x - 30} y={166} width={60} height={14} fill={KRP.ink} />
            </g>
          );
        })}
        {/* 舞台の床 */}
        <rect x={-40} y={560} width={W + 80} height={560} fill={C.engawaTop} />
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-40 + i * 92} y1={560} x2={-200 + i * 110} y2={1100} stroke={C.engawa} strokeWidth={4} />)}
        {/* 回り舞台 (厚み + 天板) */}
        <ellipse cx={CX} cy={CY + 34} rx={RX} ry={RY} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="#D9B07A" stroke={KRP.ink} strokeWidth={6} />
        {/* 縁の目盛り (回っているのが分かる) */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI) / 8 + th;
          if (Math.cos(a) < 0.05) return null;
          const x = CX + RX * Math.sin(a), y = CY + RY * Math.cos(a);
          return <line key={i} x1={x} y1={y + 4} x2={x} y2={y + 30} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />;
        })}
        {/* 仕切り線 (4区画) */}
        {[0, 1, 2, 3].map((i) => {
          const a = Math.PI / 4 + (i * Math.PI) / 2 + th;
          return <line key={i} x1={CX} y1={CY} x2={CX + RX * Math.sin(a)} y2={CY + RY * Math.cos(a)} stroke={C.engawaDark} strokeWidth={6} strokeDasharray="20 10" />;
        })}
        <circle cx={CX} cy={CY} r={18} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 回転中の風切り線 */}
        {spin > 0 && [-1, 1].map((sd) => (
          <path key={sd} d={`M ${CX + sd * 680} ${CY - 40} q ${sd * 40} 60 0 120`} fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.7} />
        ))}
        {/* 正面のスポットライト */}
        <path d={`M 860 -40 L 1060 -40 L 1230 800 L 690 800 Z`} fill={NP.glow} opacity={0.12 + 0.03 * Math.sin(f / 5)} />
        <ellipse cx={CX} cy={CY + 220} rx={230} ry={50} fill={NP.glow} opacity={0.22} />
        {/* 4つの姿 (奥から順に描く) */}
        {booths.map((b) => (
          <g key={b.k} transform={`translate(${b.x} ${b.y}) scale(${b.sc})`} opacity={0.55 + 0.45 * (b.ca + 1) / 2}>
            <ellipse cx={0} cy={0} rx={130} ry={18} fill={KRP.ink} opacity={0.2} />
            <NE1bLife k={b.k} f={f} lit={clamp01((b.ca - 0.85) * 7)} />
          </g>
        ))}
        {/* 両袖の三色の引幕 */}
        {[0, 1].map((side) => (
          <g key={side} transform={side ? `translate(${W} 0) scale(-1 1)` : undefined}>
            {["#2B2622", "#C8662E", "#3E6B4A", "#2B2622", "#C8662E"].map((c, i) => (
              <path key={i} d={`M ${-40 + i * 36} -40 L ${-4 + i * 36} -40 Q ${10 + i * 36 + Math.sin(f / 20) * 4} 500 ${-4 + i * 32} 1120 L ${-40 + i * 32} 1120 Z`} fill={c} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #112 名前は、立場や仕事に合わせて、変わっていくものでした。
// 格: 並 / seed 4112
// 絵: 江戸の商家の帳場。番頭・手代・丁稚 (Person 3人) の胸の名札が、それぞれの立場で違う形 (大・中・小)。f で丁稚が出世して手代の席へ移ると、名札も入れ替わる
// どこ: 江戸の商家の帳場。奥に障子と柱 (大福帳が下がる)・右奥に店ののれん口、手前は畳。左に番頭の帳場格子
// 演出: 番頭 (大きな札)・手代 (中の札)・丁稚 (小さな札)。丁稚が膝でぴょこぴょこ進んで空いた手代の座布団へ →
//       ぽんと煙が出て、小さな札が消え、中の札 (名前も「○吉」→「○助」) に変わる。体も少し大きくなる。番頭と手代がにっこり
// 動き: カメラが右へパン / 丁稚の膝行 (f6-26) / 煙と札の入れかえ (f27-36) / 行灯の灯がゆれる
const NE1bMuneFuda: React.FC<{ x: number; y: number; w: number; h: number; text: string; fs: number; o?: number }> = ({ x, y, w, h, text, fs, o = 1 }) => (
  <g opacity={o}>
    <path d={`M ${x - w * 0.3} ${y - h / 2} L ${x - w * 0.2} ${y - h / 2 - 26} M ${x + w * 0.3} ${y - h / 2} L ${x + w * 0.2} ${y - h / 2 - 26}`} stroke={KRP.ink} strokeWidth={3.5} />
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={7} fill={NP.wood} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h * 0.2} rx={5} fill={NP.woodMid} />
    <text x={x} y={y + fs * 0.4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={NP.sumi}>{text}</text>
  </g>
);
const Nm112: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const walk = seg(f, 6, 26);
  const poof = seg(f, 27, 36);
  const done = poof > 0.45;
  const floorY = 780;
  const dx = lerp(1000, 1340, easeInOut(walk));
  const hop = walk > 0 && walk < 1 ? Math.abs(Math.sin(walk * Math.PI * 5)) * 26 : 0;
  const ds = done ? 0.9 : 0.74;
  const dFloor = floorY - hop;
  const chest = (x: number, s: number, fy: number) => [x, fy + 50 * s - 104 * s] as const;
  const [bcx, bcy] = chest(600, 1.05, floorY);
  const [tcx, tcy] = chest(1660, 0.92, floorY);
  const [dcx, dcy] = chest(dx, ds, dFloor);
  return (
    <Frame f={f} seed={4112}>
      <g transform={NE1bZoom(960, 560, 1.05, lerp(40, -50, pan), 0)}>
        {/* 奥の壁: 障子と柱 */}
        <rect x={-80} y={-40} width={W + 160} height={620} fill={C.shoji} />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={-60 + i * 300} y={60} width={280} height={500} fill={C.shoji} stroke={C.shojiFrame} strokeWidth={6} />
            {[1, 2, 3].map((k) => <line key={k} x1={-60 + i * 300 + k * 70} y1={60} x2={-60 + i * 300 + k * 70} y2={560} stroke={C.shojiFrame} strokeWidth={3} />)}
            {[1, 2, 3, 4, 5, 6, 7].map((k) => <line key={`h${k}`} x1={-60 + i * 300} y1={60 + k * 62} x2={220 + i * 300} y2={60 + k * 62} stroke={C.shojiFrame} strokeWidth={3} />)}
          </g>
        ))}
        <rect x={-80} y={20} width={W + 160} height={40} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 右奥: 店へ出るのれん口 */}
        <rect x={1440} y={60} width={420} height={500} fill="#6E5A44" stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${1440 + i * 140} 60 L ${1580 + i * 140} 60 L ${1580 + i * 140 + Math.sin(f / 15 + i) * 5} 260 L ${1440 + i * 140 + Math.sin(f / 15 + i) * 5} 260 Z`} fill={C.noren} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 柱と大福帳 */}
        <rect x={1180} y={20} width={44} height={560} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1].map((i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 18 + i) * 1.5} ${1202} ${160 + i * 10})`}>
            <line x1={1202} y1={150} x2={1170 - i * 40} y2={200} stroke={KRP.ink} strokeWidth={3} />
            <rect x={1120 - i * 40} y={200} width={90} height={150} rx={4} fill="#EDE3C8" stroke={KRP.ink} strokeWidth={4} />
            <rect x={1120 - i * 40} y={200} width={90} height={18} fill={C.lacquer} />
            <rect x={1150 - i * 40} y={230} width={30} height={90} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ))}
        {/* 畳 */}
        <rect x={-80} y={560} width={W + 160} height={560} fill={C.tatami} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-80 + i * 440} y={560} width={440} height={560} fill="none" stroke={C.tatamiEdge} strokeWidth={8} />)}
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-80} y1={572 + i * 13} x2={W + 80} y2={572 + i * 13} stroke={C.tatamiLine} strokeWidth={2} />)}
        {/* 行灯 */}
        <g>
          <rect x={160} y={560} width={90} height={150} fill="#F8EBC4" stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={205} cy={640} rx={26 + Math.sin(f / 3) * 3} ry={40} fill={NP.glow} opacity={0.5} />
          <rect x={150} y={548} width={110} height={16} fill={C.lacquerDark} stroke={KRP.ink} strokeWidth={4} />
          {[160, 240].map((x) => <rect key={x} x={x} y={710} width={10} height={30} fill={C.lacquerDark} />)}
        </g>
        {/* 座布団 */}
        {[600, 1340, 1660].map((x) => (
          <rect key={x} x={x - 105} y={floorY + 26} width={210} height={44} rx={14} fill={C.tanF} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 丁稚が置いていった ほうき と、膝で進んだ跡 */}
        <g transform={`rotate(${-62 + Math.sin(f / 10) * 1.5} 1000 ${floorY + 40})`}>
          <rect x={994} y={floorY - 150} width={12} height={190} rx={5} fill={C.bark} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M 986 ${floorY + 30} L 1014 ${floorY + 30} L 1036 ${floorY + 96} L 964 ${floorY + 96} Z`} fill={C.mushiro} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {walk > 0.2 && (
          <path d={`M 1020 ${floorY + 90} Q 1150 ${floorY + 110} ${lerp(1020, 1250, clamp01(walk * 1.2))} ${floorY + 90}`} fill="none" stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 14" opacity={0.45} />
        )}
        {/* 番頭 (帳場格子の奥) */}
        <NE1bSeiza x={600} floorY={floorY} s={1.05} f={f} cloth={C.chonin} clothDark={C.choninDark}
          face={done ? "smile" : "normal"} pose="armsFolded" gaze={[8, 0]} phase={1}
          deco={<><NE1bStripes color={C.choninStripe} /><NE1bHaori color={C.bushi} /><NE1bMage /></>} />
        <NE1bMuneFuda x={bcx} y={bcy} w={150} h={82} text="松兵衛" fs={36} />
        {/* 帳場格子 */}
        <g>
          <rect x={250} y={660} width={230} height={170} fill={C.engawa} stroke={KRP.ink} strokeWidth={5} />
          <rect x={250} y={660} width={230} height={170} fill="none" stroke={C.engawaDark} strokeWidth={10} />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={250 + i * 38} y1={660} x2={250 + i * 38} y2={830} stroke={C.engawaDark} strokeWidth={6} />)}
          <rect x={236} y={646} width={258} height={20} rx={4} fill={C.engawaDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={256} y={616} width={120} height={30} rx={4} fill={C.lacquerDark} stroke={KRP.ink} strokeWidth={3} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={268 + i * 14} cy={631} r={4.5} fill="#E9D3A6" />)}
          <rect x={390} y={606} width={84} height={40} rx={3} fill="#EDE3C8" stroke={KRP.ink} strokeWidth={3} />
          <line x1={432} y1={606} x2={432} y2={646} stroke={KRP.ink} strokeWidth={2} />
          {/* 筆 (すこし動く) */}
          <line x1={410 + Math.sin(f / 7) * 4} y1={600} x2={460 + Math.sin(f / 7) * 4} y2={580} stroke={NP.sumi} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* 手代 */}
        <NE1bSeiza x={1660} floorY={floorY} s={0.92} f={f} cloth={C.ai} clothDark={C.aiDark}
          face={done ? "joy" : "smile"} pose="hold" gaze={[-8, 0]} phase={2}
          deco={<><NE1bApron /><NE1bMage /></>} />
        <NE1bMuneFuda x={tcx} y={tcy} w={118} h={64} text="松七" fs={36} />
        {/* 丁稚 → 手代 */}
        <NE1bSeiza x={dx} floorY={dFloor} s={ds} f={f} cloth={done ? C.ai : C.kodomo} clothDark={done ? C.aiDark : C.kodomoDark}
          face={done ? "joy" : walk > 0 ? "surprised" : "worried"} pose="stand" gaze={[8, -2]} phase={3} lean={walk > 0 && walk < 1 ? 6 : 0}
          deco={done ? <><NE1bApron /><NE1bMage /></> : <path d="M -40 -262 Q -6 -236 30 -258 Q 10 -268 -40 -262 Z" fill={KRP.ink} />} />
        {done
          ? <NE1bMuneFuda x={dcx} y={dcy} w={118} h={64} text="吉助" fs={36} o={clamp01((poof - 0.45) * 4)} />
          : <NE1bMuneFuda x={dcx} y={dcy} w={84} h={46} text="松吉" fs={26} />}
        {/* 煙 */}
        {poof > 0 && poof < 1 && (
          <g opacity={(1 - poof) * 0.95}>
            {Array.from({ length: 7 }, (_, i) => {
              const a = (i / 7) * Math.PI * 2;
              return <circle key={i} cx={1340 + Math.cos(a) * 90 * poof} cy={640 + Math.sin(a) * 70 * poof} r={40 + 30 * poof} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />;
            })}
          </g>
        )}
        {done && [0, 1, 2].map((i) => (
          <NE1bSpark key={i} x={1340 + (i - 1) * 110} y={520 - (i % 2) * 40} r={20 * pop(clamp01((poof - 0.5) * 3 - i * 0.2))} />
        ))}
        <TagPlate x={600} y={440} text="番頭" size={36} t={seg(f, 0, 6)} />
        <TagPlate x={1500} y={440} text="手代" size={36} t={seg(f, 0, 6)} />
        <TagPlate x={1000} y={540} text="丁稚" size={30} t={seg(f, 0, 6)} fill={KRP.cream} />
      </g>
      <TagPlate x={1640} y={110} text="江戸・商家" size={36} t={seg(f, 0, 8)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #113 その自由な名前に、鍵をかけたのが、明治の政府です。
// 格: 山 / seed 4113
// 絵: 江戸の町並みが f で左から右へ**明治の町並み** (ガス灯・洋館・人力車・電信柱) に変わっていく (一枚の絵の中で時代が流れる)。手前の名札 `Nafuda text="山田 花子"` の下の結び目に、**真鍮の錠前の影**が近づく (錠前はまだかからない)
// どこ: 江戸の通り (町家・格子・のれん・火の見櫓・天秤棒の物売り) が、左から明治の通り
//       (レンガの洋館・石の銀行・ガス灯・電信柱と電線・人力車) に塗りかわっていく。手前に名札が吊られている
// 演出: 時代の境目が光の帯になって左から右へ進む (f2-40)。f=45 で画面の8割が明治・右端に江戸が残る。
//       名札「山田 花子」の下の結び目へ、真鍮の錠前の黒い影がじわじわ近づく (まだかからない)。名札が小さくふるえる
// 動き: 時代のワイプ / 錠前の影が右下から寄る (f10-40) / カメラが名札へ少し寄る / 人力車の車輪が回る / ガス灯がまたたく
const NE1bEdoTown: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-80} y={-40} width={W + 160} height={760} fill={C.edoSky} />
    {/* 火の見櫓 (遠景) */}
    <g stroke={C.bark} strokeWidth={8}>
      <line x1={1220} y1={300} x2={1260} y2={60} /><line x1={1340} y1={300} x2={1300} y2={60} />
      {[120, 180, 240].map((y) => <line key={y} x1={1226 + (300 - y) * 0.0} y1={y} x2={1334} y2={y} />)}
    </g>
    <path d="M 1240 60 L 1320 60 L 1280 20 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={4} />
    {Array.from({ length: 7 }, (_, i) => {
      const x0 = -60 + i * 290;
      const wall = i % 2 ? "#7A5A3A" : "#6A4E34";
      return (
        <g key={i}>
          <rect x={x0} y={330} width={284} height={400} fill={wall} stroke={KRP.ink} strokeWidth={5} />
          {/* 2階の虫籠窓 */}
          <rect x={x0 + 40} y={360} width={204} height={64} fill={C.plaster} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, k) => <line key={k} x1={x0 + 56 + k * 21} y1={366} x2={x0 + 56 + k * 21} y2={418} stroke={wall} strokeWidth={6} />)}
          {/* 庇と瓦 */}
          <path d={`M ${x0 - 16} 470 L ${x0 + 300} 470 L ${x0 + 284} 440 L ${x0} 440 Z`} fill={C.tile} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${x0 - 20} 332 L ${x0 + 304} 332 L ${x0 + 270} 278 L ${x0 + 14} 278 Z`} fill={C.tile} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M ${x0 + 20 + k * 40} 284 q 10 20 0 44`} fill="none" stroke={C.tileDark} strokeWidth={4} />)}
          {/* 1階の格子と、のれん */}
          <rect x={x0 + 14} y={490} width={150} height={230} fill="#4A3624" stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 10 }, (_, k) => <line key={k} x1={x0 + 22 + k * 15} y1={490} x2={x0 + 22 + k * 15} y2={720} stroke={C.engawa} strokeWidth={5} />)}
          <rect x={x0 + 176} y={490} width={96} height={230} fill="#2E241A" stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${x0 + 172} 490 L ${x0 + 276} 490 L ${x0 + 276 + Math.sin(f / 14 + i) * 4} 590 L ${x0 + 172 + Math.sin(f / 14 + i) * 4} 590 Z`}
            fill={[C.noren, C.tanA, C.tanB][i % 3]} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={x0 + 224} cy={536} r={18} fill="none" stroke={KRP.white} strokeWidth={5} />
        </g>
      );
    })}
    <rect x={-80} y={720} width={W + 160} height={400} fill={C.road} />
    {Array.from({ length: 30 }, (_, i) => <ellipse key={i} cx={rnd(4113, i) * W} cy={760 + rnd(4114, i) * 300} rx={10} ry={3} fill={C.roadDark} />)}
    {/* 天秤棒の物売り */}
    <g>
      <line x1={1590} y1={636} x2={1830} y2={630} stroke={C.bark} strokeWidth={10} strokeLinecap="round" />
      {[1600, 1820].map((x) => (
        <g key={x}>
          <line x1={x} y1={636} x2={x - 26} y2={720} stroke={KRP.ink} strokeWidth={3} /><line x1={x} y1={636} x2={x + 26} y2={720} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M ${x - 42} 720 L ${x + 42} 720 L ${x + 34} 776 L ${x - 34} 776 Z`} fill={C.mushiro} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      <Person x={1710} y={846} s={0.74} f={f} cloth={C.murabito} clothDark={C.murabitoDark} face="normal" gaze={[-6, 0]} phase={5} still />
      <NE1bWear x={1710} y={846} s={0.74}><NE1bHokkamuri /></NE1bWear>
    </g>
  </g>
);
const NE1bMeijiTown: React.FC<{ f: number }> = ({ f }) => {
  const poles = [420, 1160, 1840];
  return (
    <g>
      <rect x={-80} y={-40} width={W + 160} height={760} fill={C.meijiSky} />
      {/* レンガの洋館 (2階・アーチ窓) */}
      <rect x={-60} y={200} width={680} height={530} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 14 }, (_, k) => <line key={k} x1={-60} y1={230 + k * 36} x2={620} y2={230 + k * 36} stroke={C.brickLine} strokeWidth={2} opacity={0.5} />)}
      <rect x={-70} y={180} width={700} height={30} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-70} y={450} width={700} height={22} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
      {[0, 1].map((r) => [0, 1, 2, 3].map((c) => {
        const wx = -10 + c * 160, wy = 260 + r * 250;
        return (
          <g key={`${r}${c}`}>
            <path d={`M ${wx} ${wy + 150} L ${wx} ${wy + 40} Q ${wx + 45} ${wy - 10} ${wx + 90} ${wy + 40} L ${wx + 90} ${wy + 150} Z`} fill="#3E4E5E" stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${wx} ${wy + 150} L ${wx} ${wy + 40} Q ${wx + 45} ${wy - 10} ${wx + 90} ${wy + 40} L ${wx + 90} ${wy + 150} Z`} fill="none" stroke={C.stone} strokeWidth={6} />
            <line x1={wx + 45} y1={wy + 20} x2={wx + 45} y2={wy + 150} stroke={C.stone} strokeWidth={4} />
            <line x1={wx} y1={wy + 90} x2={wx + 90} y2={wy + 90} stroke={C.stone} strokeWidth={4} />
          </g>
        );
      }))}
      {/* 石の銀行 (柱と三角屋根) */}
      <rect x={640} y={260} width={600} height={470} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 620 262 L 940 150 L 1260 262 Z" fill={C.stone} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={940} cy={222} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <line x1={940} y1={222} x2={940} y2={202} stroke={KRP.ink} strokeWidth={4} /><line x1={940} y1={222} x2={954} y2={226} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, k) => (
        <g key={k}>
          <rect x={680 + k * 96} y={300} width={34} height={410} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((j) => <line key={j} x1={688 + k * 96 + j * 9} y1={306} x2={688 + k * 96 + j * 9} y2={704} stroke={C.stone} strokeWidth={2} />)}
        </g>
      ))}
      <rect x={630} y={704} width={620} height={26} fill="#C4BBA8" stroke={KRP.ink} strokeWidth={4} />
      {/* 右: 2つ目の洋館 (ベランダ) */}
      <rect x={1240} y={230} width={720} height={500} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1240} y={440} width={720} height={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 14 }, (_, k) => <line key={k} x1={1250 + k * 52} y1={466} x2={1250 + k * 52} y2={520} stroke={KRP.white} strokeWidth={5} />)}
      {[0, 1, 2, 3].map((c) => <rect key={c} x={1290 + c * 170} y={290} width={80} height={130} fill="#3E4E5E" stroke={C.stone} strokeWidth={6} />)}
      {/* 石畳の道 */}
      <rect x={-80} y={720} width={W + 160} height={400} fill="#BDB4A2" />
      <rect x={-80} y={720} width={W + 160} height={22} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 22 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-80 + c * 96 + (r % 2) * 48} y={752 + r * 60} width={90} height={54} rx={6} fill="none" stroke="#A39A88" strokeWidth={3} />
      )))}
      {/* 電信柱と電線 */}
      {poles.map((x) => (
        <g key={x}>
          <rect x={x - 10} y={130} width={20} height={610} fill={C.bark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={x - 70} y={160} width={140} height={14} fill={C.bark} stroke={KRP.ink} strokeWidth={3} />
          {[-56, -20, 20, 56].map((dx) => <circle key={dx} cx={x + dx} cy={154} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
      ))}
      {[-56, -20, 20, 56].map((dx) => (
        <path key={dx} d={`M -80 ${170 + dx * 0.2} Q ${(poles[0] - 80) / 2} 200 ${poles[0] + dx} 154 Q ${(poles[0] + poles[1]) / 2} ${200 + Math.sin(f / 20) * 4} ${poles[1] + dx} 154 Q ${(poles[1] + poles[2]) / 2} ${200 + Math.sin(f / 20 + 1) * 4} ${poles[2] + dx} 154`}
          fill="none" stroke={C.wire} strokeWidth={3} />
      ))}
      {/* ガス灯 */}
      {[200, 1290].map((x, i) => {
        const tw = 0.6 + 0.4 * Math.abs(Math.sin(f / 4 + i * 2));
        return (
          <g key={x}>
            <rect x={x - 8} y={500} width={16} height={240} fill="#3B4048" stroke={KRP.ink} strokeWidth={4} />
            <rect x={x - 30} y={734} width={60} height={14} fill="#3B4048" />
            <circle cx={x} cy={470} r={60} fill={C.lamp} opacity={0.35 * tw} />
            <path d={`M ${x - 28} 500 L ${x + 28} 500 L ${x + 36} 440 L ${x - 36} 440 Z`} fill={C.lamp} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${x - 42} 442 L ${x + 42} 442 L ${x} 410 Z`} fill="#3B4048" stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
      {/* 人力車 */}
      <g>
        <line x1={540} y1={700} x2={760} y2={720} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        <path d="M 720 560 L 860 560 L 880 720 L 740 720 Z" fill={C.rickshaw} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 700 540 Q 790 470 880 540 L 870 580 L 720 580 Z" fill={C.rickshaw} stroke={KRP.ink} strokeWidth={5} />
        <rect x={740} y={640} width={130} height={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <g transform={`rotate(${f * 6} 820 760)`}>
          <circle cx={820} cy={760} r={78} fill="none" stroke={KRP.ink} strokeWidth={10} />
          {Array.from({ length: 8 }, (_, k) => <line key={k} x1={820} y1={760} x2={820 + 76 * Math.cos((k * Math.PI) / 4)} y2={760 + 76 * Math.sin((k * Math.PI) / 4)} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        <circle cx={820} cy={760} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        <Person x={520} y={840} s={0.78} f={f} cloth={C.murabito} clothDark={C.murabitoDark} face="normal" pose="run" lean={8} phase={6} />
        <ellipse cx={540} cy={840 - 250 * 0.78} rx={84} ry={20} fill={C.mushiro} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 480 ${840 - 250 * 0.78} L 540 ${840 - 296 * 0.78} L 600 ${840 - 250 * 0.78} Z`} fill={C.mushiro} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
};
const Nm113: React.FC<{ f: number }> = ({ f }) => {
  const wipeT = easeInOut(seg(f, 2, 40));
  const wipe = lerp(-60, 1560, wipeT);
  const cam = easeInOut(seg(f, 0, 42));
  const near = easeInOut(seg(f, 10, 40));
  const nx = 960, ny = 470, ns = 0.95;
  const [kx, ky] = nafudaKnot("chobo", nx, ny, ns);
  const lx = lerp(1460, kx + 40, near), ly = lerp(900, ky + 92, near);
  const lsc = lerp(0.8, 1.15, near);
  const shiver = near > 0.6 ? Math.sin(f * 1.9) * 1.2 * near : 0;
  return (
    <Frame f={f} seed={4113}>
      <clipPath id="ne1b113edo"><rect x={wipe} y={-100} width={W + 200} height={H + 200} /></clipPath>
      <clipPath id="ne1b113mei"><rect x={-200} y={-100} width={wipe + 200} height={H + 200} /></clipPath>
      <g transform={NE1bZoom(960, 560, 1 + 0.05 * cam)}>
        <g clipPath="url(#ne1b113edo)"><NE1bEdoTown f={f} /></g>
        <g clipPath="url(#ne1b113mei)"><NE1bMeijiTown f={f} /></g>
        {/* 時代の境目 (光の帯) */}
        <rect x={wipe - 40} y={-60} width={80} height={H + 120} fill={NP.glow} opacity={0.35} />
        <rect x={wipe - 10} y={-60} width={20} height={H + 120} fill={NP.glowCore} opacity={0.8} />
        {[0, 1, 2, 3, 4].map((i) => {
          const yy = 120 + i * 170 + Math.sin(f / 5 + i) * 10;
          return <path key={i} d={`M ${wipe - 30} ${yy - 22} L ${wipe + 6} ${yy} L ${wipe - 30} ${yy + 22}`} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />;
        })}
        {/* 名札の吊り紐 */}
        <path d={`M ${nx - 260} -40 L ${nx} ${ny - 152 * ns} L ${nx + 260} -40`} fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* 名札の後ろの白い台 (町の絵から浮かせる) */}
        <ellipse cx={nx} cy={ny + 10} rx={260} ry={150} fill={KRP.white} opacity={0.45} />
        <Nafuda x={nx} y={ny} s={ns} text="山田 花子" f={f} rot={shiver} />
        {/* 真鍮の錠前の影 (まだかからない) */}
        <g transform={`translate(${lx} ${ly}) scale(${lsc}) rotate(${-8 + Math.sin(f / 9) * 3})`} opacity={0.28 + 0.22 * near}>
          <path d="M -30 -20 L -30 -54 Q -30 -90 0 -90 Q 30 -90 30 -54 L 30 -20" fill="none" stroke="#1E1A16" strokeWidth={14} />
          <rect x={-48} y={-24} width={96} height={80} rx={12} fill="#1E1A16" />
        </g>
        {near > 0.5 && <circle cx={kx} cy={ky} r={30 + Math.sin(f / 3) * 4} fill="none" stroke="#1E1A16" strokeWidth={3} strokeDasharray="6 8" opacity={(near - 0.5) * 1.2} />}
      </g>
      <TagPlate x={260} y={210} text="明治" size={44} t={seg(f, 14, 22)} fill={KRP.blueSoft} />
      <TagPlate x={1740} y={210} text="江戸" size={44} t={seg(f, 0, 6)} fill={KRP.cream} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_108: (f) => <Nm108 f={f} />,
  nm_109: (f) => <Nm109 f={f} />,
  nm_110: (f) => <Nm110 f={f} />,
  nm_111: (f) => <Nm111 f={f} />,
  nm_112: (f) => <Nm112 f={f} />,
  nm_113: (f) => <Nm113 f={f} />,
};

export const NM_E1B_MOTIFS: string[] = [
  "nm_108", // #108
  "nm_109", // #109
  "nm_110", // #110
  "nm_111", // #111
  "nm_112", // #112
  "nm_113", // #113
];

export const namaeE1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
