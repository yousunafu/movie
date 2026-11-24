// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#223〜#233 (11文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  // 夕暮れの丘 (#223)
  skyTop: "#3E3A66",
  skyMid: "#B9668A",
  skyLow: "#F2A65A",
  sun: "#FFD9A0",
  hillFar: "#6E5C86",
  plain: "#5E5272",
  hillMid: "#4E5F5A",
  grass: "#5E7A4E",
  grassDark: "#465E3A",
  road: "#D9B98A",
  roadEdge: "#B8966A",
  houseDark: "#3A3348",
  roofDark: "#2B2638",
  pole: "#3A2E2A",
  // 映写機の部屋 (#224〜#226)
  roomDark: "#2A2430",
  roomWall: "#3A3240",
  roomPanel: "#453B4C",
  roomFloor: "#2E2622",
  seat: "#5A2E34",
  seatDark: "#3E1F24",
  beam: "#FFF1C8",
  screenOn: "#FFF6DD",
  boardDim: "#B9A783",
  projector: "#5E5A66",
  // 霧の道 (窓の中)
  mistTop: "#A9B3C4",
  mistLow: "#D9DCE2",
  duskTop: "#7C6E9C",
  duskLow: "#F2B27A",
  fog: "#E8E6EE",
  mistGround: "#9AA58C",
  mistTree: "#5D6B5E",
  // からくりの作業場 (#227・#231)
  wallWork: "#5A4A3E",
  wallWorkDark: "#46382F",
  wallNight: "#2E2630",
  bench: "#B07F4E",
  benchDark: "#8A5E36",
  benchEdge: "#7A5030",
  steel: "#AEB6BE",
  // 町・役所・店 (#228〜#230・#232)
  eveTop: "#8FA6C9",
  eveLow: "#F4C9A0",
  houseWall: "#E9DCC2",
  houseRoof: "#6E5A52",
  fence: "#C7B08A",
  plaster: "#E9DFCB",
  plasterDark: "#D6C9AE",
  shelfWood: "#9A6B40",
  shelfDark: "#6E4A2A",
  spine1: "#5B6E8C",
  spine2: "#7A5A48",
  spine3: "#6E7A5A",
  paperOld: "#EFE4C8",
  counter: "#A0703F",
  noren: "#2F4A6E",
  lantern: "#E9634E",
  night: "#1E1A2A",
  hairBack: "#4A3B30",
  momCloth: "#D98C9A",
  momClothDark: "#B56A78",
  friendCloth: "#7FB07A",
  friendClothDark: "#5E8F5A",
  kidCloth: "#F2CE4C",
  kidClothDark: "#C9A630",
} as const;
void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend; void Ushiro; void MeijiLock;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const easeIn = (t: number) => t * t;
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;

type P2 = [number, number];
const cub = (a: P2, b: P2, c: P2, d: P2, t: number): P2 => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};
// Ito と同じ2次ベジェ上の点 (光の粒を糸の上で走らせる)
const itoPt = (from: P2, to: P2, sag: number, u: number): P2 => {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2 + sag;
  return [
    (1 - u) * (1 - u) * from[0] + 2 * (1 - u) * u * mx + u * u * to[0],
    (1 - u) * (1 - u) * from[1] + 2 * (1 - u) * u * my + u * u * to[1],
  ];
};
const cam = (cx: number, cy: number, s: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${s}) translate(${-cx} ${-cy})`;

// -------------------------------------------------------------------
// NJ1FearBoard — 導入の「2つの怖さ」の木の札 (吊り下げの板)
// -------------------------------------------------------------------
const NJ1FearBoard: React.FC<{
  x: number; y: number; text: string; size?: number; lit?: number; cordTop?: number; f?: number;
}> = ({ x, y, text, size = 40, lit = 1, cordTop, f = 0 }) => {
  const w = text.length * (size + 4) + 80;
  const h = size * 2.3;
  const L = clamp01(lit);
  const top = y - h / 2;
  const sw = Math.sin(f / 20) * 0.8;
  return (
    <g transform={`rotate(${sw} ${x} ${cordTop ?? top})`}>
      {cordTop !== undefined && [-1, 1].map((sd) => (
        <g key={sd}>
          <line x1={x + sd * w * 0.32} y1={cordTop} x2={x + sd * w * 0.32} y2={top + 14} stroke={C.ink} strokeWidth={5} />
          <circle cx={x + sd * w * 0.32} cy={cordTop} r={8} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
        </g>
      ))}
      {L > 0.01 && <rect x={x - w / 2 - 26} y={top - 22} width={w + 52} height={h + 44} rx={34} fill={NP.glow} opacity={0.32 * L} />}
      <rect x={x - w / 2 + 8} y={top + 10} width={w} height={h} rx={14} fill={C.ink} opacity={0.3} />
      <rect x={x - w / 2} y={top} width={w} height={h} rx={14} fill={L > 0.5 ? NP.wood : C.boardDim} stroke={C.ink} strokeWidth={7} />
      <rect x={x - w / 2} y={top} width={w} height={h * 0.22} rx={10} fill={NP.woodMid} opacity={0.6} />
      <g stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.7}>
        <path d={`M ${x - w / 2 + 20} ${top + h * 0.35} q ${w * 0.25} -10 ${w * 0.5} 0 q ${w * 0.25} 10 ${w * 0.45} -3`} />
        <path d={`M ${x - w / 2 + 30} ${top + h * 0.8} q ${w * 0.3} 8 ${w * 0.6} 0`} />
      </g>
      {[-1, 1].map((sd) => (
        <circle key={sd} cx={x + sd * (w / 2 - 18)} cy={top + 18} r={6} fill={NP.brassDark} stroke={C.ink} strokeWidth={2.5} />
      ))}
      <text x={x} y={y + size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size}
        fill={NP.sumi} opacity={0.45 + 0.55 * L}>{text}</text>
    </g>
  );
};

// -------------------------------------------------------------------
// NJ1FogRoad — 序 #12 の「霧の道」(窓の中の景色)。ローカル座標 1440x640
//   clear: 0→1 で霧が晴れ、夕暮れの空と町の灯りが出る / thick: 霧が濃くなる
// -------------------------------------------------------------------
const NJ1FogRoad: React.FC<{
  f: number; id: string; clear?: number; thick?: number; children?: React.ReactNode;
}> = ({ f, id, clear = 0, thick = 0, children }) => {
  const Wd = 1440, Hd = 640, vx = 720, vy = 300;
  const cl = clamp01(clear);
  const fog = (1 - cl) * (0.55 + 0.45 * clamp01(thick));
  const tree = (side: number, k: number) => {
    const tt = (k + 1) / 6;
    const yb = vy + (Hd + 60 - vy) * tt * tt;
    const xb = vx + side * (60 + 820 * tt * tt);
    const sc = 0.18 + 1.3 * tt * tt;
    const op = 1 - fog * (1 - tt * 0.8);
    const sway = Math.sin(f / 16 + k) * 2 * sc;
    return (
      <g key={`${side}-${k}`} transform={`translate(${xb} ${yb}) scale(${sc})`} opacity={op}>
        <rect x={-10} y={-60} width={20} height={60} fill={C.pole} />
        {[0, 1, 2].map((j) => (
          <path key={j} d={`M ${-90 + j * 18 + sway} ${-50 - j * 70} L ${sway * 2} ${-170 - j * 70} L ${90 - j * 18 + sway} ${-50 - j * 70} Z`}
            fill={cl > 0.5 ? C.grassDark : C.mistTree} stroke={C.ink} strokeWidth={4} />
        ))}
      </g>
    );
  };
  return (
    <g>
      <defs>
        <clipPath id={id}><rect x={0} y={0} width={Wd} height={Hd} /></clipPath>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.mistTop} /><stop offset="1" stopColor={C.mistLow} />
        </linearGradient>
        <linearGradient id={`${id}-dusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} /><stop offset="0.75" stopColor={C.duskLow} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={0} y={0} width={Wd} height={Hd} fill={`url(#${id}-sky)`} />
        <rect x={0} y={0} width={Wd} height={Hd} fill={`url(#${id}-dusk)`} opacity={cl} />
        {/* 遠くの山 */}
        <path d={`M 0 ${vy + 10} L 160 ${vy - 60} L 330 ${vy - 20} L 520 ${vy - 90} L 720 ${vy - 30} L 930 ${vy - 80} L 1140 ${vy - 25} L 1300 ${vy - 70} L 1440 ${vy - 30} L 1440 ${vy + 20} L 0 ${vy + 20} Z`}
          fill={cl > 0.5 ? C.hillFar : "#8E93A6"} opacity={0.35 + 0.65 * cl} />
        {/* 町の灯り (晴れると見える) */}
        <g opacity={cl}>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x={640 + i * 24} y={vy - 14 - (i % 3) * 6} width={20} height={16 + (i % 3) * 6} fill={C.houseDark} stroke={C.ink} strokeWidth={2} />
              <rect x={646 + i * 24} y={vy - 8 - (i % 3) * 4} width={7} height={6} fill={NP.glow} />
            </g>
          ))}
          <circle cx={vx} cy={vy - 4} r={70} fill={NP.glow} opacity={0.3} />
        </g>
        {/* 地面 */}
        <rect x={0} y={vy} width={Wd} height={Hd - vy} fill={cl > 0.5 ? C.grass : C.mistGround} />
        {/* 道 */}
        <path d={`M ${vx - 10} ${vy} L ${vx + 10} ${vy} L ${vx + 440} ${Hd} L ${vx - 440} ${Hd} Z`} fill={C.road} stroke={C.roadEdge} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, k) => {
          const a = (k + 0.3) / 7, b = (k + 0.7) / 7;
          return <line key={k} x1={vx} y1={vy + (Hd - vy) * a * a} x2={vx} y2={vy + (Hd - vy) * b * b}
            stroke={KRP.white} strokeWidth={2 + 10 * b} opacity={0.7} />;
        })}
        {[0, 1, 2, 3, 4, 5].map((k) => tree(-1, k))}
        {[0, 1, 2, 3, 4, 5].map((k) => tree(1, k))}
        {/* 霧の帯 (道の先を飲み込む) */}
        <rect x={0} y={vy - 140} width={Wd} height={300} fill={C.fog} opacity={fog * 0.85} />
        {Array.from({ length: 6 }, (_, i) => {
          const cx = ((i * 310 + f * (1.4 + i * 0.35)) % (Wd + 700)) - 350;
          return <ellipse key={i} cx={cx} cy={vy - 30 + i * 52} rx={440} ry={60 + i * 6} fill={C.fog} opacity={fog * (0.62 - i * 0.06)} />;
        })}
        {children}
        {/* 手前のうすい霧 */}
        <ellipse cx={(f * 2.2) % 1800 - 200} cy={Hd - 40} rx={520} ry={50} fill={C.fog} opacity={fog * 0.35} />
      </g>
    </g>
  );
};

// -------------------------------------------------------------------
// NJ1BackHead — Person の顔を髪で塗りつぶして「後ろ姿」にする (Person のゆれに合わせる)
// -------------------------------------------------------------------
const NJ1BackHead: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; hair?: string; bun?: boolean }> = ({
  x, y, s, f, phase = 0, hair = C.hairBack, bun,
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <circle cx={0} cy={-228} r={65} fill={hair} stroke={C.ink} strokeWidth={5.5} />
      <path d="M -40 -262 Q 0 -290 40 -262" stroke={KRP.white} strokeWidth={5} opacity={0.25} fill="none" />
      {[-1, 1].map((sd) => (
        <ellipse key={sd} cx={sd * 63} cy={-220} rx={9} ry={14} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      ))}
      {bun && <circle cx={0} cy={-300} r={26} fill={hair} stroke={C.ink} strokeWidth={5} />}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #223 結び、名前は、帰り道。
// 格: 山 / seed 4223
// どこ: 夕暮れの丘の上。足元から一本道がうねって、地平線の町の灯りへ続く
// 演出: 序 #12 で霧に消えた道。残りの霧が流れて消え、道の上に灯りの線が奥へ走る。道標に名札の札。千尋が後ろ姿で町へ歩く
// 動き: 霧が晴れる (f0-30)・道の灯りが手前から奥へ (f4-34)・町の窓が1つずつ灯る (f4-35)・星・鳥・草ゆれ・カメラが町へゆっくり寄る
const Nm223: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const fogOut = seg(f, 0, 30);
  const roadLit = easeOut(seg(f, 4, 34));
  const roadC: [P2, P2, P2, P2] = [[780, 1100], [880, 910], [1200, 760], [1377, 588]];
  const rightE: [P2, P2, P2, P2] = [[1220, 1100], [1050, 920], [1250, 760], [1388, 588]];
  const u = 0.55 + 0.05 * seg(f, 0, 42);
  const [gx, gy] = cub(...roadC, u);
  const gs = 0.62 * (1 - 0.62 * u);
  return (
    <Frame f={f} seed={4223} over={
      <ChapterDoor num={0} title="結び、名前は、帰り道" t={seg(f, 4, 14)} left={1060} top={122} width={800} />
    }>
      <defs>
        <linearGradient id="nj1-sky-223" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyTop} />
          <stop offset="0.55" stopColor={C.skyMid} />
          <stop offset="0.9" stopColor={C.skyLow} />
        </linearGradient>
      </defs>
      <g transform={cam(1300, 560, 1 + 0.06 * k)}>
        <rect x={-40} y={-40} width={2000} height={1160} fill="url(#nj1-sky-223)" />
        {/* 星 */}
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={60 + rnd(4223, i) * 1800} cy={30 + rnd(4224, i) * 260} r={2.5 + rnd(4225, i) * 3}
            fill={KRP.white} opacity={seg(f, 8 + i, 20 + i * 1.2) * (0.6 + 0.4 * Math.sin(f / 5 + i))} />
        ))}
        {/* 沈む太陽 */}
        <circle cx={1640} cy={600} r={170} fill={C.sun} opacity={0.22} />
        <circle cx={1640} cy={600} r={110} fill={C.sun} opacity={0.35} />
        <circle cx={1640} cy={600} r={68} fill={C.sun} stroke={C.ink} strokeWidth={4} />
        {/* 鳥 */}
        {[0, 1, 2].map((i) => {
          const bx = 1500 - f * (3 + i) - i * 90;
          const by = 300 + i * 34 + Math.sin(f / 6 + i) * 6;
          const fl = Math.sin(f / 3 + i) * 8;
          return <path key={i} d={`M ${bx - 18} ${by - fl} Q ${bx - 8} ${by - 6} ${bx} ${by} Q ${bx + 8} ${by - 6} ${bx + 18} ${by - fl}`}
            stroke={C.roofDark} strokeWidth={4} fill="none" strokeLinecap="round" />;
        })}
        {/* 遠い山並み */}
        <path d="M -40 600 L 120 540 L 260 570 L 420 500 L 600 560 L 780 520 L 980 575 L 1160 530 L 1340 562 L 1500 522 L 1700 566 L 1960 528 L 1960 640 L -40 640 Z"
          fill={C.hillFar} stroke={C.ink} strokeWidth={4} />
        <rect x={-40} y={590} width={2000} height={60} fill={C.plain} />
        {/* 地平線の町 (窓が1つずつ灯る) */}
        <circle cx={1400} cy={585} r={170 * roadLit} fill={NP.glow} opacity={0.22} />
        {Array.from({ length: 10 }, (_, i) => {
          const hx = 1240 + i * 36 + (i % 3) * 5;
          const hh = 22 + ((i * 7) % 18);
          const on = seg(f, 4 + i * 3, 8 + i * 3);
          return (
            <g key={i}>
              <rect x={hx} y={592 - hh} width={30} height={hh} fill={C.houseDark} stroke={C.ink} strokeWidth={2.5} />
              <path d={`M ${hx - 4} ${592 - hh} L ${hx + 15} ${580 - hh} L ${hx + 34} ${592 - hh} Z`} fill={C.roofDark} stroke={C.ink} strokeWidth={2.5} />
              <rect x={hx + 8} y={598 - hh} width={13} height={9} fill={on > 0.5 ? NP.glow : "#5A5068"} />
              {on > 0.5 && <circle cx={hx + 14} cy={602 - hh} r={14} fill={NP.glow} opacity={0.35 * on} />}
            </g>
          );
        })}
        {/* 中ほどの丘 */}
        <path d="M -40 690 Q 320 600 700 650 Q 1000 690 1290 612 Q 1600 580 1960 640 L 1960 1120 L -40 1120 Z" fill={C.hillMid} stroke={C.ink} strokeWidth={5} />
        {/* 手前の丘 (道標の立つ草地) */}
        <path d="M -40 800 Q 220 740 520 780 Q 660 800 720 1120 L -40 1120 Z" fill={C.grass} stroke={C.ink} strokeWidth={5} />
        {/* 一本道 */}
        <path d="M 380 1100 C 700 900, 1150 760, 1366 588 L 1388 588 C 1250 760, 1050 920, 1220 1100 Z"
          fill={C.road} stroke={C.ink} strokeWidth={5} />
        <path d="M 520 1100 C 760 920, 1160 770, 1370 592" stroke={C.roadEdge} strokeWidth={5} fill="none" opacity={0.6} />
        <path d="M 1080 1100 C 1000 930, 1230 770, 1383 592" stroke={C.roadEdge} strokeWidth={5} fill="none" opacity={0.6} />
        {/* 道の灯り (手前から奥へ走る) */}
        <path d="M 780 1100 C 880 910, 1200 760, 1377 588" stroke={NP.glow} strokeWidth={26} fill="none" opacity={0.3}
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - roadLit} strokeLinecap="round" />
        <path d="M 780 1100 C 880 910, 1200 760, 1377 588" stroke={NP.glowCore} strokeWidth={7} fill="none" opacity={0.9}
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - roadLit} strokeLinecap="round" />
        {/* 電柱 (道の右手に、奥へ小さく) */}
        {(() => {
          const tops: P2[] = [];
          const poles = [0.2, 0.45, 0.68, 0.86].map((t, i) => {
            const [px, py] = cub(...rightE, t);
            const x0 = px + 80 * (1 - t);
            const hgt = 380 * (1 - 0.86 * t);
            tops.push([x0, py - hgt]);
            return (
              <g key={i}>
                <rect x={x0 - 7 * (1 - 0.8 * t)} y={py - hgt} width={14 * (1 - 0.8 * t)} height={hgt} fill={C.pole} stroke={C.ink} strokeWidth={3} />
                <rect x={x0 - 34 * (1 - 0.8 * t)} y={py - hgt + 18 * (1 - t)} width={68 * (1 - 0.8 * t)} height={7 * (1 - 0.7 * t)} fill={C.pole} />
              </g>
            );
          });
          return (
            <g>
              {tops.slice(1).map((tp, i) => (
                <path key={i} d={`M ${tops[i][0]} ${tops[i][1] + 10} Q ${(tops[i][0] + tp[0]) / 2} ${(tops[i][1] + tp[1]) / 2 + 30} ${tp[0]} ${tp[1] + 4}`}
                  stroke={C.pole} strokeWidth={3} fill="none" />
              ))}
              {poles}
            </g>
          );
        })()}
        {/* 町へ歩く千尋の後ろ姿 */}
        <Ushiro kind="chihiro" x={gx} y={gy} s={gs} walk f={f} />
        {/* 残りの霧 (流れて消える) */}
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={300 + i * 290 - f * (2 + i * 0.5)} cy={620 + (i % 3) * 70} rx={320} ry={46}
            fill={C.fog} opacity={(1 - fogOut) * 0.7} />
        ))}
        {/* 道標 */}
        <g>
          <ellipse cx={425} cy={858} rx={70} ry={14} fill={C.ink} opacity={0.3} />
          <rect x={408} y={330} width={34} height={530} fill={NP.woodDark} stroke={C.ink} strokeWidth={6} />
          <path d="M 404 330 L 425 300 L 446 330 Z" fill={NP.woodMid} stroke={C.ink} strokeWidth={5} />
          <g stroke={C.benchEdge} strokeWidth={3} opacity={0.6}>
            <line x1={418} y1={480} x2={418} y2={620} /><line x1={432} y1={640} x2={432} y2={800} />
          </g>
          {/* 腕木 (町の方を指す) */}
          <path d="M 300 380 L 640 380 L 692 412 L 640 444 L 300 444 Z" fill={NP.wood} stroke={C.ink} strokeWidth={6} />
          <path d="M 320 398 q 140 -8 300 0" stroke={NP.grain} strokeWidth={3} fill="none" />
          {[330, 600].map((nx) => <circle key={nx} cx={nx} cy={412} r={6} fill={NP.brassDark} stroke={C.ink} strokeWidth={2.5} />)}
          {/* 吊り紐と名札 */}
          <line x1={560} y1={444} x2={560} y2={536} stroke={C.ink} strokeWidth={4} />
          <circle cx={560} cy={605} r={110} fill={NP.glow} opacity={0.18 + 0.1 * Math.sin(f / 7)} />
          <Nafuda x={560} y={600} s={0.42} text="山田 花子" f={f} rot={Math.sin(f / 9) * 3} />
          {/* 小さなランタン (灯る) */}
          <line x1={330} y1={444} x2={330} y2={500} stroke={C.ink} strokeWidth={4} />
          <circle cx={330} cy={526} r={42} fill={NP.glow} opacity={0.4 * seg(f, 6, 14)} />
          <rect x={312} y={500} width={36} height={52} rx={8} fill={seg(f, 6, 14) > 0.5 ? NP.glow : C.boardDim} stroke={C.ink} strokeWidth={4} />
          <rect x={308} y={496} width={44} height={8} fill={C.pole} />
        </g>
        {/* 手前の草 */}
        {Array.from({ length: 14 }, (_, i) => {
          const tx = 30 + i * 52 + rnd(4223, i + 40) * 20;
          const ty = 820 + rnd(4223, i + 60) * 60;
          const sw = Math.sin(f / 10 + i) * 6;
          return <path key={i} d={`M ${tx - 12} ${ty} Q ${tx - 8 + sw} ${ty - 30} ${tx - 14 + sw} ${ty - 48} M ${tx} ${ty} Q ${tx + sw} ${ty - 40} ${tx + 4 + sw} ${ty - 62} M ${tx + 12} ${ty} Q ${tx + 14 + sw} ${ty - 26} ${tx + 22 + sw} ${ty - 40}`}
            stroke={C.grassDark} strokeWidth={5} fill="none" strokeLinecap="round" />;
        })}
      </g>
      {/* 題字の後ろのクリームの帯 */}
      <g opacity={seg(f, 2, 10)}>
        <rect x={1000} y={104} width={960 * easeOut(seg(f, 2, 12))} height={124} fill={KRP.cream} opacity={0.88} />
        <line x1={1000} y1={104} x2={1000 + 960 * easeOut(seg(f, 2, 12))} y2={104} stroke={C.ink} strokeWidth={4} />
        <line x1={1000} y1={228} x2={1000 + 960 * easeOut(seg(f, 2, 12))} y2={228} stroke={C.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #224 最後に、映画の、2つの怖さに戻りましょう。
// 格: 並 / seed 4224
// どこ: 序 #15〜#17 の映写機の部屋。暗い壁に2つの光の窓、手前に客席の背もたれ、真ん中に映写機
// 演出: 映写機のリールが回りだし、光が2つの窓に届く。左=霧の道 / 右=自分の影が薄れる千。窓の下の2枚の札が順に灯る。ナレーターが指さす
// 動き: リール回転・光のちらつき (f4-14 で点灯)・札が左→右に灯る (f16-30)・光の中のホコリ
const Nm224: React.FC<{ f: number }> = ({ f }) => {
  const on = easeOut(seg(f, 4, 14));
  const flick = 0.85 + 0.15 * Math.sin(f * 1.3);
  const wins: [number, number][] = [[230, 170], [1050, 170]];
  const lens: P2 = [960, 777];
  return (
    <Frame f={f} seed={4224} dark bg={C.roomDark}>
      <g transform={cam(960, 420, 1 + 0.03 * seg(f, 0, 42))}>
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.roomWall} />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={i * 160 - 20} y={-40} width={150} height={900} fill={C.roomPanel} opacity={0.5} stroke={C.ink} strokeWidth={3} />
        ))}
        <rect x={-40} y={860} width={2000} height={260} fill={C.roomFloor} />
        {/* 光の筋 */}
        {wins.map(([wx, wy], i) => (
          <polygon key={i} points={`${lens[0]},${lens[1]} ${wx},${wy + 284} ${wx},${wy} ${wx + 640},${wy} ${wx + 640},${wy + 284}`}
            fill={C.beam} opacity={0.13 * on * flick} />
        ))}
        {/* 2つの窓 */}
        {wins.map(([wx, wy], i) => (
          <g key={i}>
            <rect x={wx - 26} y={wy - 26} width={692} height={336} rx={10} fill={NP.woodDark} stroke={C.ink} strokeWidth={7} />
            <rect x={wx} y={wy} width={640} height={284} fill={C.screenOn} stroke={C.ink} strokeWidth={5} />
            {i === 0 ? (
              <g transform={`translate(${wx} ${wy}) scale(0.4444)`}>
                <NJ1FogRoad f={f} id="nj1fog224" thick={0.3}>
                  <Ushiro kind="chihiro" x={720} y={600} s={0.85} f={f} turn={Math.sin(f / 9) * 0.5} />
                </NJ1FogRoad>
              </g>
            ) : (
              <g>
                <rect x={wx} y={wy} width={640} height={284} fill="#D9D2E6" />
                <rect x={wx} y={wy + 200} width={640} height={84} fill="#BFB4CE" />
                <g opacity={0.3 + 0.1 * Math.sin(f / 6)}>
                  <Ushiro kind="sen" x={wx + 420} y={wy + 270} s={0.7} f={f} silhouette />
                </g>
                <Ushiro kind="sen" x={wx + 240} y={wy + 270} s={0.7} f={f} />
              </g>
            )}
            <rect x={wx} y={wy} width={640} height={284} fill={C.roomDark} opacity={(1 - on) * 0.85} />
            {/* 窓の留め金 */}
            {[[wx - 12, wy - 12], [wx + 652, wy - 12], [wx - 12, wy + 296], [wx + 652, wy + 296]].map(([bx, by], j) => (
              <circle key={j} cx={bx} cy={by} r={9} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 窓の下の2枚の札 */}
        <NJ1FearBoard x={550} y={650} text="帰り道がわからなくなる" size={38} lit={seg(f, 16, 24)} cordTop={480} f={f} />
        <NJ1FearBoard x={1370} y={650} text="元の自分を忘れる" size={38} lit={seg(f, 22, 30)} cordTop={480} f={f + 7} />
        {/* 光の中のホコリ */}
        {Array.from({ length: 14 }, (_, i) => {
          const t = ((f * 0.012 + rnd(4224, i)) % 1);
          const side = i % 2;
          const tx = lerp(lens[0], side ? 1370 : 550, t) + Math.sin(f / 8 + i) * 14;
          const ty = lerp(lens[1], 300, t);
          return <circle key={i} cx={tx} cy={ty} r={3} fill={C.beam} opacity={on * 0.7} />;
        })}
        {/* 映写機 */}
        <g transform="translate(960 890) scale(0.75)">
          <rect x={-130} y={-30} width={260} height={30} fill={C.pole} stroke={C.ink} strokeWidth={5} />
          <rect x={-160} y={-150} width={320} height={120} rx={14} fill={C.projector} stroke={C.ink} strokeWidth={6} />
          <rect x={-140} y={-130} width={180} height={18} rx={6} fill={C.roomPanel} />
          {[-80, 80].map((rx, j) => (
            <g key={j} transform={`translate(${rx} -230) rotate(${f * 6 * (j ? 1 : -1)})`}>
              <circle r={72} fill={C.roomPanel} stroke={C.ink} strokeWidth={6} />
              <circle r={20} fill={NP.brass} stroke={C.ink} strokeWidth={4} />
              {[0, 1, 2].map((s2) => (
                <path key={s2} d="M 26 -14 L 60 -26 L 60 26 L 26 14 Z" fill={C.roomDark} transform={`rotate(${s2 * 120})`} />
              ))}
            </g>
          ))}
          <path d="M -80 -158 L -40 -150 M 80 -158 L 40 -150" stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={-150} r={36} fill={C.beam} stroke={C.ink} strokeWidth={6} opacity={0.4 + 0.6 * on} />
          <circle cx={0} cy={-150} r={70} fill={C.beam} opacity={0.25 * on * flick} />
        </g>
        {/* 客席の背もたれ */}
        {Array.from({ length: 8 }, (_, i) => {
          if (i === 3 || i === 4) return null;
          const sx = 120 + i * 240;
          return (
            <g key={i}>
              <rect x={sx - 95} y={900} width={190} height={200} rx={40} fill={C.seat} stroke={C.ink} strokeWidth={6} />
              <rect x={sx - 75} y={920} width={150} height={60} rx={24} fill={C.seatDark} />
            </g>
          );
        })}
        {/* ナレーター (指さす) */}
        <Person x={1760} y={930} s={0.85} f={f} cloth="#6F8FB0" clothDark="#4F6C8C" face="normal" pose="point" pointDir={-1} gaze={[-6, -4]} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #225 1つ目の怖さ。名前を奪われると、帰り道がわからなくなる。
// 格: 並 / seed 4225
// どこ: 同じ映写機の部屋 (#224 の続き)。左の窓に寄って、窓いっぱいに序 #12 の霧の道
// 演出: 道の先が霧に飲まれていく。道の入口で千尋 (後ろ姿) が左右を見回す。下に札「帰り道がわからなくなる」
// 動き: 霧がだんだん濃くなる (f8-40)・霧が流れる・千尋が首を振る・？が出る (f20-28)・カメラがさらに寄る
const Nm225: React.FC<{ f: number }> = ({ f }) => {
  const thick = easeInOut(seg(f, 8, 40));
  return (
    <Frame f={f} seed={4225} dark bg={C.roomDark}>
      <g transform={cam(960, 400, 1 + 0.05 * seg(f, 0, 42))}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.roomWall} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={i * 260 - 40} y={-60} width={250} height={1200} fill={C.roomPanel} opacity={0.5} stroke={C.ink} strokeWidth={3} />
        ))}
        {/* 右の窓 (まだ暗い) の端 */}
        <rect x={1760} y={44} width={300} height={692} rx={10} fill={NP.woodDark} stroke={C.ink} strokeWidth={7} />
        <rect x={1786} y={70} width={260} height={640} fill={C.roomDark} />
        {/* 映写の光 (下から) */}
        <polygon points="960,1100 240,710 240,70 1680,70 1680,710" fill={C.beam} opacity={0.07 + 0.02 * Math.sin(f * 1.3)} />
        {/* 大きな窓 */}
        <rect x={210} y={40} width={1500} height={700} rx={12} fill={NP.woodDark} stroke={C.ink} strokeWidth={8} />
        <g transform="translate(240 70)">
          <NJ1FogRoad f={f} id="nj1fog225" thick={thick}>
            <Ushiro kind="chihiro" x={720} y={600} s={0.9} f={f} turn={Math.sin(f / 7) * 0.8} />
            <QMark x={850} y={300} s={0.8} f={f} t={seg(f, 20, 28)} />
          </NJ1FogRoad>
        </g>
        <rect x={240} y={70} width={1440} height={640} fill="none" stroke={C.ink} strokeWidth={6} />
        {[[224, 54], [1696, 54], [224, 726], [1696, 726]].map(([bx, by], j) => (
          <circle key={j} cx={bx} cy={by} r={11} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
        ))}
        {/* 窓の下の札 */}
        <NJ1FearBoard x={960} y={752} text="帰り道がわからなくなる" size={38} lit={1} cordTop={712} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #226 これは、本当でした。
// 格: 山 / seed 4226
// どこ: 映写機の部屋。左に霧の道の窓と札「帰り道がわからなくなる」、右に暗いもう1つの窓とナレーター
// 演出: 上から朱の判子が降りて札に「○」をドン (f12)。札の横に「本当でした」の小札。窓の霧が晴れ、道の上に名札と3本の糸の絵が浮かぶ
// 動き: 判子が降りる (f4-12)・ドンの衝撃線と朱の飛沫 (f12-20)・判子が上がる (f16-26)・霧が晴れる (f18-34)・名札が浮かぶ (f26-36)・ナレーターが驚き→喜ぶ
const Nm226: React.FC<{ f: number }> = ({ f }) => {
  const down = easeIn(seg(f, 4, 12));
  const up = easeOut(seg(f, 16, 26));
  const hit = f >= 12;
  const ring = hit ? pop(seg(f, 12, 18)) : 0;
  const shock = seg(f, 12, 20);
  const clear = easeOut(seg(f, 18, 34));
  const vision = easeOut(seg(f, 26, 36));
  const bx = 740, by = 660;
  const stampY = hit ? lerp(0, -900, up) : lerp(-900, 0, down);
  const shake = hit && f < 20 ? Math.sin(f * 3) * (20 - f) * 0.6 : 0;
  return (
    <Frame f={f} seed={4226} dark bg={C.roomDark}>
      <g transform={cam(740, 420, 1.02 - 0.02 * seg(f, 0, 42), 0, shake)}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.roomWall} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={i * 200 - 40} y={-60} width={190} height={1200} fill={C.roomPanel} opacity={0.5} stroke={C.ink} strokeWidth={3} />
        ))}
        <rect x={-60} y={880} width={2040} height={260} fill={C.roomFloor} />
        <polygon points="740,1100 180,568 180,70 1300,70 1300,568" fill={C.beam} opacity={0.08 + 0.08 * clear} />
        {/* 左の窓: 霧が晴れていく */}
        <rect x={156} y={46} width={1168} height={546} rx={12} fill={NP.woodDark} stroke={C.ink} strokeWidth={8} />
        <g transform="translate(180 70) scale(0.7778)">
          <NJ1FogRoad f={f} id="nj1fog226" clear={clear}>
            {/* 道の上に浮かぶ名札と3本の糸 */}
            <g opacity={vision} transform={`translate(0 ${(1 - vision) * 40 + Math.sin(f / 10) * 6})`}>
              <circle cx={720} cy={200} r={200} fill={NP.glow} opacity={0.3} />
              <Ito from={nafudaKnot("mimi", 720, 190, 0.6)} to={[440, 300]} kind="mimi" sag={40} f={f} />
              <Ito from={nafudaKnot("chobo", 720, 190, 0.6)} to={[720, 390]} kind="chobo" sag={10} f={f} />
              <Ito from={nafudaKnot("shinyo", 720, 190, 0.6)} to={[1000, 300]} kind="shinyo" sag={40} thick={1.5} f={f} />
              {([[440, 300, NP.mimi], [720, 390, NP.chobo], [1000, 300, NP.shinyo]] as const).map(([ex, ey, col], j) => (
                <circle key={j} cx={ex} cy={ey} r={14} fill={col} stroke={C.ink} strokeWidth={4} />
              ))}
              <Nafuda x={720} y={190} s={0.6} text="山田 花子" knots={{ mimi: 1, chobo: 1, shinyo: 1 }} hang={false} f={f} />
            </g>
            <Ushiro kind="chihiro" x={720} y={610} s={0.85} walk={clear > 0.6} f={f} />
          </NJ1FogRoad>
        </g>
        <rect x={180} y={70} width={1120} height={498} fill="none" stroke={C.ink} strokeWidth={6} />
        {/* 右の窓 (2つ目の怖さ。まだ暗い) */}
        <rect x={1396} y={46} width={600} height={546} rx={12} fill={NP.woodDark} stroke={C.ink} strokeWidth={8} />
        <rect x={1420} y={70} width={560} height={498} fill="#4A4452" />
        <g opacity={0.35}><Ushiro kind="sen" x={1640} y={520} s={0.9} f={f} silhouette /></g>
        {/* 札と朱の○ */}
        <NJ1FearBoard x={bx} y={by} text="帰り道がわからなくなる" size={38} lit={1} cordTop={568} f={f} />
        {hit && (
          <g transform={`translate(${bx} ${by}) scale(${0.6 + 0.4 * ring}) rotate(-8)`} opacity={0.92}>
            <circle r={112} fill="none" stroke={KRP.red} strokeWidth={24} />
            <circle r={112} fill="none" stroke={KRP.white} strokeWidth={3} strokeDasharray="6 22" opacity={0.6} />
          </g>
        )}
        {/* 衝撃線と朱の飛沫 */}
        {shock > 0 && shock < 1 && (
          <g opacity={1 - shock}>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2 + 0.2;
              const r0 = 150 + shock * 40, r1 = 200 + shock * 90;
              return <line key={i} x1={bx + Math.cos(a) * r0} y1={by + Math.sin(a) * r0 * 0.6} x2={bx + Math.cos(a) * r1} y2={by + Math.sin(a) * r1 * 0.6}
                stroke={KRP.white} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        )}
        {hit && Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={bx + (rnd(4226, i) - 0.5) * 340} cy={by + (rnd(4227, i) - 0.5) * 150} r={4 + rnd(4228, i) * 6}
            fill={KRP.red} opacity={0.8} />
        ))}
        {/* 判子 (上から降りて、また上がる) */}
        <g transform={`translate(${bx} ${by + stampY})`}>
          <rect x={-130} y={-30} width={260} height={30} rx={6} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
          <rect x={-120} y={-60} width={240} height={32} rx={6} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
          <path d="M -60 -60 L -44 -230 Q 0 -260 44 -230 L 60 -60 Z" fill={NP.woodDark} stroke={C.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-238} rx={52} ry={30} fill={NP.woodMid} stroke={C.ink} strokeWidth={6} />
          <path d="M -30 -200 L -26 -90" stroke={NP.wood} strokeWidth={8} opacity={0.6} strokeLinecap="round" />
        </g>
        <TagPlate x={1190} y={660} text="本当でした" size={40} t={seg(f, 18, 26)} color={KRP.red} rot={-3} />
        {/* ナレーター */}
        <Person x={1640} y={940} s={1.0} f={f} cloth="#6F8FB0" clothDark="#4F6C8C"
          face={f < 16 ? "surprised" : "joy"} pose={f < 16 ? "stand" : "raise"} gaze={[-8, 0]} lean={f < 16 ? -4 : 2} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// NJ1Workshop — からくりの作業場の壁と作業台 (#227 は明るく、#231 は夜)
// -------------------------------------------------------------------
const NJ1Workshop: React.FC<{ f: number; night?: boolean }> = ({ f, night }) => {
  const wall = night ? C.wallNight : C.wallWork;
  return (
    <g>
      <rect x={-80} y={-80} width={2080} height={1240} fill={wall} />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={i * 190 - 40} y1={-80} x2={i * 190 - 40} y2={700} stroke={C.wallWorkDark} strokeWidth={5} />
      ))}
      {/* 上の梁 */}
      <rect x={-80} y={40} width={2080} height={64} fill={C.benchDark} stroke={C.ink} strokeWidth={6} />
      <path d="M -60 70 q 500 -10 1000 0 q 500 10 1000 0" stroke={C.benchEdge} strokeWidth={3} fill="none" />
      {/* 有孔ボードと道具 (左) */}
      <rect x={60} y={170} width={420} height={380} rx={8} fill={night ? "#4A3E3A" : "#C9A77A"} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 7 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
        <circle key={`${r}-${c}`} cx={90 + c * 52} cy={200 + r * 52} r={4} fill={C.ink} opacity={0.4} />
      )))}
      {/* 糸巻き3つ (3本の糸の色) */}
      {([NP.mimi, NP.chobo, NP.shinyo] as const).map((col, i) => (
        <g key={i} transform={`translate(${130 + i * 120} 260) rotate(${Math.sin(f / 18 + i) * 2})`}>
          <rect x={-34} y={-44} width={68} height={12} rx={4} fill={NP.woodMid} stroke={C.ink} strokeWidth={4} />
          <rect x={-26} y={-32} width={52} height={64} fill={col} stroke={C.ink} strokeWidth={4} />
          <g stroke={C.ink} strokeWidth={2} opacity={0.4}>
            {[0, 1, 2, 3].map((j) => <line key={j} x1={-26} y1={-22 + j * 16} x2={26} y2={-18 + j * 16} />)}
          </g>
          <rect x={-34} y={32} width={68} height={12} rx={4} fill={NP.woodMid} stroke={C.ink} strokeWidth={4} />
        </g>
      ))}
      {/* ペンチと歯車 */}
      <g transform="translate(160 430) rotate(-20)">
        <path d="M -8 0 L -26 110 M 8 0 L 26 110" stroke={KRP.red} strokeWidth={16} strokeLinecap="round" />
        <path d="M -8 0 L -14 -60 L 0 -70 L 14 -60 L 8 0 Z" fill={C.steel} stroke={C.ink} strokeWidth={4} />
        <circle r={8} fill={C.ink} />
      </g>
      <g transform={`translate(360 450) rotate(${f * 1.5})`}>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={-9} y={-64} width={18} height={20} fill={NP.brass} stroke={C.ink} strokeWidth={3} transform={`rotate(${i * 36})`} />
        ))}
        <circle r={48} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
        <circle r={14} fill={wall} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 右の棚と瓶 */}
      <rect x={1480} y={420} width={400} height={18} fill={C.benchDark} stroke={C.ink} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={1500 + i * 95} y={340} width={66} height={80} rx={10} fill={night ? "#5A6A7A" : "#A9C6D6"} opacity={0.85} stroke={C.ink} strokeWidth={4} />
          <rect x={1508 + i * 95} y={328} width={50} height={16} fill={NP.woodMid} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2].map((j) => <circle key={j} cx={1518 + i * 95 + j * 14} cy={400 - j * 8} r={5} fill={i % 2 ? NP.brass : C.steel} />)}
        </g>
      ))}
      {/* 作業台 */}
      <path d="M -80 640 L 2000 640 L 2000 1160 L -80 1160 Z" fill={C.bench} stroke={C.ink} strokeWidth={7} />
      <rect x={-80} y={640} width={2080} height={22} fill={C.benchEdge} />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M -60 ${700 + i * 70} q 480 ${rnd(4227, i) * 24 - 12} 1000 0 q 480 ${rnd(4228, i) * 24 - 12} 1000 0`}
          stroke={C.benchDark} strokeWidth={4} fill="none" opacity={0.55} />
      ))}
      {night && <rect x={-80} y={-80} width={2080} height={1240} fill={C.night} opacity={0.35} />}
    </g>
  );
};

// -------------------------------------------------------------------
// #227 名前は、あなたを世界につなぐ、糸の結び目です。
// 格: 山 / seed 4227
// どこ: からくりの作業場。梁から名札が下がり、作業台の上の3つの終点 (木の耳・錠前つきの帳簿・看板と銭) へ3本の糸
// 演出: 3つの結び目が左→下→右の順にぽっと灯り、光の粒が糸を行き来する。ナレーターが台の奥でうなずく。凡例は3本とも点灯
// 動き: 結び目が順に灯る (f4-22)・光の粒が流れる・名札のゆれ・歯車回転・カメラがゆっくり名札に寄る
const Nm227: React.FC<{ f: number }> = ({ f }) => {
  const X = 960, Y = 420, S = 1.2;
  const ends: Record<"mimi" | "chobo" | "shinyo", P2> = { mimi: [330, 700], chobo: [960, 760], shinyo: [1590, 636] };
  const sags = { mimi: 80, chobo: 20, shinyo: 16 };
  const kn = { mimi: seg(f, 4, 10), chobo: seg(f, 10, 16), shinyo: seg(f, 16, 22) };
  const z = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4227}>
      <g transform={cam(960, 440, z)}>
        <NJ1Workshop f={f} />
        {/* ランプの光 */}
        <path d="M 960 104 L 700 640 L 1220 640 Z" fill={NP.glow} opacity={0.12 + 0.03 * Math.sin(f / 5)} />
        {/* 梁から名札へ */}
        <line x1={960} y1={104} x2={960} y2={Y - 152 * S} stroke={C.ink} strokeWidth={6} />
        <circle cx={960} cy={108} r={12} fill={NP.brass} stroke={C.ink} strokeWidth={4} />
        {/* 終点1: 木彫りの耳 (呼ぶ人) */}
        <g transform="translate(330 700)">
          <ellipse cx={0} cy={58} rx={70} ry={14} fill={C.ink} opacity={0.25} />
          <rect x={-40} y={30} width={80} height={26} rx={6} fill={NP.woodDark} stroke={C.ink} strokeWidth={5} />
          <path d="M -6 30 C -60 20, -56 -90, 4 -96 C 56 -100, 70 -40, 30 -10 C 14 4, 20 26, -6 30 Z" fill={NP.wood} stroke={C.ink} strokeWidth={6} />
          <path d="M 2 -70 C 36 -70, 40 -36, 16 -24 C 4 -18, 8 -2, -6 4" stroke={NP.woodDark} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        {/* 終点2: 錠前つきの帳簿 (国の名簿) */}
        <g transform="translate(960 790)">
          <ellipse cx={0} cy={46} rx={150} ry={14} fill={C.ink} opacity={0.25} />
          <rect x={-130} y={-30} width={260} height={70} rx={8} fill={C.paperOld} stroke={C.ink} strokeWidth={5} />
          <rect x={-136} y={-42} width={272} height={24} rx={6} fill={NP.chobo} stroke={C.ink} strokeWidth={5} />
          <g stroke={C.ink} strokeWidth={2} opacity={0.4}>{[0, 1, 2].map((j) => <line key={j} x1={-120} y1={-6 + j * 14} x2={120} y2={-6 + j * 14} />)}</g>
          <rect x={-18} y={-50} width={36} height={40} rx={6} fill={NP.brass} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 終点3: 小さな看板と積んだ銭 (信用) */}
        <g transform="translate(1590 700)">
          <ellipse cx={0} cy={58} rx={110} ry={14} fill={C.ink} opacity={0.25} />
          <rect x={-8} y={-10} width={16} height={66} fill={NP.woodDark} stroke={C.ink} strokeWidth={4} />
          <rect x={-80} y={-60} width={160} height={60} rx={8} fill={NP.wood} stroke={C.ink} strokeWidth={5} />
          <text x={0} y={-18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={NP.sumi}>山田屋</text>
          <circle cx={0} cy={-66} r={10} fill="none" stroke={NP.brassDark} strokeWidth={6} />
          {[0, 1, 2, 3].map((j) => (
            <ellipse key={j} cx={70} cy={48 - j * 12} rx={26} ry={9} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 3本の糸 */}
        <Ito from={nafudaKnot("mimi", X, Y, S)} to={ends.mimi} kind="mimi" f={f} />
        <Ito from={nafudaKnot("chobo", X, Y, S)} to={ends.chobo} kind="chobo" lock={1} sag={20} f={f} />
        <Ito from={nafudaKnot("shinyo", X, Y, S)} to={ends.shinyo} kind="shinyo" thick={1.8} tension={0.8} f={f} />
        {/* 糸を行き来する光の粒 */}
        {(["mimi", "chobo", "shinyo"] as const).map((k, i) => {
          if (kn[k] < 1) return null;
          return [0, 0.5].map((o, j) => {
            const uu = ((f * 0.025 + o + i * 0.2) % 1);
            const [px, py] = itoPt(nafudaKnot(k, X, Y, S), ends[k], sags[k], uu);
            return (
              <g key={`${k}${j}`}>
                <circle cx={px} cy={py} r={20} fill={NP.glow} opacity={0.45} />
                <circle cx={px} cy={py} r={8} fill={NP.glowCore} />
              </g>
            );
          });
        })}
        <Nafuda x={X} y={Y} s={S} text="山田 花子" knots={kn} f={f} />
        {/* ナレーター (台の奥でうなずく) */}
        <Person x={1790} y={700} s={0.95} f={f} cloth="#6F8FB0" clothDark="#4F6C8C" face="smile" pose="armsFolded"
          gaze={[-8, 2]} lean={-3 + Math.sin(f / 8) * 2} />
        <rect x={1700} y={640} width={260} height={22} fill={C.benchEdge} />
        <rect x={1700} y={662} width={260} height={100} fill={C.bench} />
      </g>
      <ItoLegend x={1640} y={120} s={0.9} lit={{ mimi: 1, chobo: 1, shinyo: 1 }} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #228 呼んでくれる人につながる、耳の糸。
// 格: 並 / seed 4228
// どこ: 夕方の住宅街の道。右上に名札、そこから朱の糸がナレーターの耳へ
// 演出: 左から家族 (母と子)、右から友だちが呼ぶ。声の輪が耳に届くたび、朱の糸が光って名札の結び目まで走る。ナレーターが振り向いて笑う。ほかの2本は薄く
// 動き: 声の輪が届く (くり返し)・光の粒が耳→名札へ・ナレーターが振り向く (f14)・家の窓が灯る・カメラが寄る
const Nm228: React.FC<{ f: number }> = ({ f }) => {
  const NX = 1660, NY = 230, NS = 0.62;
  const ear: P2 = [1012, 590];
  const turn = f >= 14;
  const pulse = (f % 16) / 16;
  return (
    <Frame f={f} seed={4228}>
      <defs>
        <linearGradient id="nj1-eve-228" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.eveTop} /><stop offset="1" stopColor={C.eveLow} />
        </linearGradient>
      </defs>
      <g transform={cam(1000, 520, 1 + 0.05 * easeInOut(seg(f, 0, 42)))}>
        <rect x={-60} y={-60} width={2040} height={1200} fill="url(#nj1-eve-228)" />
        {/* 家並み */}
        {Array.from({ length: 6 }, (_, i) => {
          const hx = -40 + i * 340;
          const hy = 330 + (i % 2) * 30;
          const lit = seg(f, 6 + i * 4, 10 + i * 4);
          return (
            <g key={i}>
              <rect x={hx} y={hy} width={300} height={420} fill={C.houseWall} stroke={C.ink} strokeWidth={5} />
              <path d={`M ${hx - 24} ${hy} L ${hx + 150} ${hy - 110} L ${hx + 324} ${hy} Z`} fill={C.houseRoof} stroke={C.ink} strokeWidth={5} />
              {[0, 1].map((j) => (
                <g key={j}>
                  <rect x={hx + 40 + j * 130} y={hy + 70} width={90} height={80} fill={lit > 0.5 ? NP.glow : "#9FB0C4"} stroke={C.ink} strokeWidth={4} />
                  <line x1={hx + 85 + j * 130} y1={hy + 70} x2={hx + 85 + j * 130} y2={hy + 150} stroke={C.ink} strokeWidth={3} />
                </g>
              ))}
            </g>
          );
        })}
        {/* 塀と道 */}
        <rect x={-60} y={700} width={2040} height={110} fill={C.fence} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 130} y1={700} x2={i * 130} y2={810} stroke={C.ink} strokeWidth={3} opacity={0.5} />)}
        <rect x={-60} y={810} width={2040} height={320} fill={KRP.floor} />
        {/* 電柱 */}
        <rect x={1240} y={120} width={30} height={700} fill={C.pole} stroke={C.ink} strokeWidth={4} />
        <rect x={1190} y={170} width={130} height={14} fill={C.pole} />
        {/* ほかの2本 (薄く) */}
        <g opacity={0.3}>
          <Ito from={nafudaKnot("chobo", NX, NY, NS)} to={[1960, 640]} kind="chobo" sag={30} f={f} />
          <Ito from={nafudaKnot("shinyo", NX, NY, NS)} to={[1990, 420]} kind="shinyo" sag={20} f={f} />
        </g>
        {/* 朱の糸 (光る) */}
        <path d={`M ${nafudaKnot("mimi", NX, NY, NS).join(" ")} Q ${(1530 + ear[0]) / 2} ${(236 + ear[1]) / 2 + 60} ${ear.join(" ")}`}
          stroke={NP.glow} strokeWidth={30} fill="none" opacity={0.3 + 0.15 * Math.sin(f / 4)} strokeLinecap="round" />
        <Ito from={nafudaKnot("mimi", NX, NY, NS)} to={ear} kind="mimi" sag={60} f={f} />
        {[0, 0.5].map((o, j) => {
          const [px, py] = itoPt(ear, nafudaKnot("mimi", NX, NY, NS), 60, (f * 0.03 + o) % 1);
          return <g key={j}><circle cx={px} cy={py} r={20} fill={NP.glow} opacity={0.5} /><circle cx={px} cy={py} r={8} fill={NP.glowCore} /></g>;
        })}
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" knots={{ mimi: 1 }} f={f} />
        {/* 呼ぶ人たち */}
        <Person x={330} y={980} s={1.35} f={f} cloth={C.momCloth} clothDark={C.momClothDark} face="smile" pose="raise" gaze={[8, 0]} />
        <Person x={600} y={1000} s={0.9} f={f} phase={2} cloth={C.kidCloth} clothDark={C.kidClothDark} face="joy" pose="banzai" />
        <Person x={1540} y={990} s={1.3} f={f} phase={1} cloth={C.friendCloth} clothDark={C.friendClothDark} face="smile" pose="raise" gaze={[-8, 0]} />
        {/* 声の輪 (呼ぶ声が耳へ届く) */}
        {[0, 1, 2].map((i) => {
          const p = ((f + i * 5) % 15) / 15;
          return (
            <g key={i} opacity={1 - p}>
              <path d={`M ${470 + p * 380} ${640 - 50} Q ${500 + p * 380} ${640} ${470 + p * 380} ${640 + 50}`} stroke={NP.mimi} strokeWidth={8} fill="none" strokeLinecap="round" />
              <path d={`M ${1460 - p * 340} ${660 - 50} Q ${1430 - p * 340} ${660} ${1460 - p * 340} ${660 + 50}`} stroke={NP.mimi} strokeWidth={8} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
        {/* ナレーター (振り向いて笑う) */}
        <Person x={900} y={1010} s={1.9} f={f} cloth="#6F8FB0" clothDark="#4F6C8C"
          face={turn ? "joy" : "normal"} gaze={turn ? [-8, 0] : [4, 0]} lean={turn ? -3 : 1} />
        {/* 耳 */}
        <circle cx={ear[0]} cy={ear[1]} r={40 + pulse * 30} fill="none" stroke={NP.glow} strokeWidth={6} opacity={1 - pulse} />
        <ellipse cx={ear[0]} cy={ear[1]} rx={15} ry={26} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <path d={`M ${ear[0] - 2} ${ear[1] - 14} q 8 6 0 16`} stroke={C.ink} strokeWidth={3} fill="none" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #229 国の名簿につながる、帳簿の糸。
// 格: 並 / seed 4229
// どこ: 役所の窓口。奥に名簿の背表紙がならぶ棚と柱時計。手前の机に大きく開いた名簿
// 演出: 上の名札から藍の糸がまっすぐ下り、途中に錠前、先は名簿の真鍮の輪へ。光が糸を下り、名簿の1行 (山田 花子) が藍に光る。係の手が判を押す
// 動き: カメラが名札から名簿へ下りる・光の粒が下りる (f4-12)・行が光る (f10-18)・判が押される (f20-26)・時計の振り子
const Nm229: React.FC<{ f: number }> = ({ f }) => {
  const NX = 960, NY = 150, NS = 0.55;
  const end: P2 = [960, 540];
  const row = easeOut(seg(f, 10, 18));
  const press = seg(f, 20, 24) - seg(f, 28, 36);
  const stamped = f >= 23;
  const ty = lerp(60, -10, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={4229}>
      <g transform={`translate(0 ${ty}) ${cam(960, 540, 1.04)}`}>
        <rect x={-60} y={-120} width={2040} height={1300} fill={C.plaster} />
        <rect x={-60} y={-120} width={2040} height={70} fill={C.plasterDark} />
        {/* 名簿の棚 (左右) */}
        {[[60, 0], [1420, 1]].map(([sx, side]) => (
          <g key={sx}>
            <rect x={sx} y={130} width={440} height={520} fill={C.shelfDark} stroke={C.ink} strokeWidth={6} />
            {[0, 1, 2].map((r) => (
              <g key={r}>
                {Array.from({ length: 9 }, (_, c) => {
                  const col = [C.spine1, C.spine2, C.spine3][(c + r + side) % 3];
                  const hh = 130 - ((c * 13 + r * 7) % 24);
                  return (
                    <g key={c}>
                      <rect x={sx + 16 + c * 46} y={150 + r * 170 + (150 - hh)} width={42} height={hh} fill={col} stroke={C.ink} strokeWidth={3} />
                      <rect x={sx + 22 + c * 46} y={150 + r * 170 + (150 - hh) + 20} width={30} height={22} fill={C.paperOld} />
                    </g>
                  );
                })}
                <rect x={sx} y={300 + r * 170} width={440} height={14} fill={C.shelfWood} stroke={C.ink} strokeWidth={3} />
              </g>
            ))}
          </g>
        ))}
        {/* 柱時計 */}
        <g transform="translate(1250 160)">
          <rect x={-60} y={0} width={120} height={300} rx={10} fill={C.shelfWood} stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={60} r={44} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <line x1={0} y1={60} x2={0} y2={30} stroke={C.ink} strokeWidth={4} />
          <line x1={0} y1={60} x2={22} y2={70} stroke={C.ink} strokeWidth={4} />
          <g transform={`rotate(${Math.sin(f / 6) * 14} 0 130)`}>
            <line x1={0} y1={130} x2={0} y2={240} stroke={NP.brassDark} strokeWidth={4} />
            <circle cx={0} cy={250} r={18} fill={NP.brass} stroke={C.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 窓口の机 */}
        <rect x={-60} y={700} width={2040} height={500} fill={C.counter} stroke={C.ink} strokeWidth={7} />
        <rect x={-60} y={700} width={2040} height={24} fill={C.shelfDark} />
        {/* 呼び鈴 */}
        <g transform="translate(300 700)">
          <path d="M -40 0 Q -40 -50 0 -54 Q 40 -50 40 0 Z" fill={NP.brass} stroke={C.ink} strokeWidth={5} />
          <rect x={-50} y={-4} width={100} height={12} rx={4} fill={C.ink} />
          <circle cx={0} cy={-60} r={7} fill={NP.brassDark} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 開いた名簿 */}
        <g>
          <ellipse cx={960} cy={808} rx={440} ry={26} fill={C.ink} opacity={0.25} />
          <path d="M 540 560 L 960 580 L 1380 560 L 1400 800 L 960 816 L 520 800 Z" fill={C.paperOld} stroke={C.ink} strokeWidth={7} />
          <line x1={960} y1={580} x2={960} y2={816} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, r) => (
            <g key={r}>
              <line x1={570} y1={610 + r * 34} x2={930} y2={614 + r * 34} stroke={C.ink} strokeWidth={2} opacity={0.35} />
              <line x1={990} y1={614 + r * 34} x2={1360} y2={610 + r * 34} stroke={C.ink} strokeWidth={2} opacity={0.35} />
              {r !== 2 && <rect x={590} y={592 + r * 34} width={80 + ((r * 37) % 90)} height={10} fill={C.ink} opacity={0.4} />}
              <rect x={1010} y={594 + r * 34} width={70 + ((r * 53) % 110)} height={10} fill={C.ink} opacity={0.4} />
            </g>
          ))}
          {/* 光る行 */}
          <rect x={572} y={672} width={360} height={34} rx={6} fill={NP.chobo} opacity={0.35 * row} />
          <text x={600} y={700} fontFamily={FONT} fontWeight={900} fontSize={28} fill={NP.sumi}>山田 花子</text>
          {stamped && (
            <g transform={`translate(860 690) scale(${pop(seg(f, 23, 29))}) rotate(-10)`}>
              <circle r={22} fill="none" stroke={KRP.red} strokeWidth={6} />
              <circle r={7} fill={KRP.red} />
            </g>
          )}
          {/* 真鍮の角金具と輪 */}
          {[[540, 560], [1380, 560], [520, 800], [1400, 800]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={12} fill={NP.brass} stroke={C.ink} strokeWidth={4} />
          ))}
          <circle cx={960} cy={556} r={16} fill="none" stroke={NP.brassDark} strokeWidth={8} />
        </g>
        {/* 藍の糸 (光る) と名札 */}
        <line x1={960} y1={-120} x2={960} y2={NY - 152 * NS} stroke={C.ink} strokeWidth={5} />
        <rect x={938} y={NY + 40} width={44} height={end[1] - NY - 40} fill={NP.glow} opacity={0.25 + 0.1 * Math.sin(f / 4)} />
        <Ito from={nafudaKnot("chobo", NX, NY, NS)} to={end} kind="chobo" sag={8} lock={1} f={f} />
        {[0, 0.5].map((o, j) => {
          const uu = (seg(f, 4, 12) + f * 0.02 + o) % 1;
          const [px, py] = itoPt(nafudaKnot("chobo", NX, NY, NS), end, 8, uu);
          return <g key={j}><circle cx={px} cy={py} r={20} fill={NP.glow} opacity={0.5} /><circle cx={px} cy={py} r={8} fill={NP.glowCore} /></g>;
        })}
        <g opacity={0.3}>
          <Ito from={nafudaKnot("mimi", NX, NY, NS)} to={[540, -40]} kind="mimi" sag={30} f={f} />
          <Ito from={nafudaKnot("shinyo", NX, NY, NS)} to={[1380, -40]} kind="shinyo" sag={30} f={f} />
        </g>
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" knots={{ chobo: 1 }} f={f} />
        {/* 係の手と判 */}
        <g transform={`translate(${f < 30 ? lerp(1500, 900, easeOut(seg(f, 14, 20))) : lerp(900, 1240, easeInOut(seg(f, 30, 40)))} ${662 - 70 * (1 - press)})`}>
          <rect x={20} y={-70} width={1000} height={70} rx={30} fill="#2F3B5C" stroke={C.ink} strokeWidth={5} />
          <rect x={40} y={-70} width={30} height={70} fill="#24304C" />
          <rect x={-10} y={-62} width={50} height={56} rx={14} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <rect x={-40} y={-54} width={42} height={70} rx={8} fill={NP.woodDark} stroke={C.ink} strokeWidth={4} />
          <rect x={-46} y={14} width={54} height={14} rx={4} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #230 積み上げた仕事につながる、信用の糸。
// 格: 並 / seed 4230
// どこ: 夕方の町の工房の店先。左の柱に名札、太い金茶の糸が店の看板の金具へ
// 演出: 光が糸を走り、看板と提灯がぱっと明るくなる。店先には積み上げた本・道具・器。新しい1冊が山の上に乗る。お客の人形たちが集まってよろこぶ
// 動き: 光の粒が流れる・看板が光る (f8-16)・提灯のゆれ・本が落ちて乗る (f20-26)・お客が跳ねる・カメラが右へパン
const Nm230: React.FC<{ f: number }> = ({ f }) => {
  const NX = 240, NY = 270, NS = 0.6;
  const hook: P2 = [1160, 260];
  const lit = easeOut(seg(f, 8, 16));
  const drop = easeIn(seg(f, 20, 26));
  const px0 = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={4230}>
      <defs>
        <linearGradient id="nj1-eve-230" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.eveTop} /><stop offset="1" stopColor={C.eveLow} />
        </linearGradient>
      </defs>
      <g transform={`translate(${px0} 0)`}>
        <rect x={-80} y={-60} width={2100} height={1200} fill="url(#nj1-eve-230)" />
        {/* 左: 漆喰の壁と柱 (名札を掛ける) */}
        <rect x={-80} y={-60} width={560} height={900} fill={C.plaster} stroke={C.ink} strokeWidth={6} />
        <rect x={420} y={-60} width={60} height={900} fill={C.shelfWood} stroke={C.ink} strokeWidth={6} />
        <rect x={-80} y={600} width={560} height={240} fill={C.plasterDark} />
        <circle cx={NX} cy={NY - 152 * NS - 20} r={9} fill={NP.brassDark} stroke={C.ink} strokeWidth={3} />
        <line x1={NX} y1={NY - 152 * NS - 20} x2={NX} y2={NY - 152 * NS} stroke={C.ink} strokeWidth={4} />
        {/* 店 */}
        <rect x={560} y={260} width={1440} height={580} fill={C.houseWall} stroke={C.ink} strokeWidth={6} />
        <path d="M 520 270 L 700 150 L 2040 150 L 2040 270 Z" fill={C.houseRoof} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={640 + i * 120} y1={170} x2={600 + i * 120} y2={268} stroke={C.ink} strokeWidth={3} opacity={0.5} />)}
        {/* のれん */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={1300 + i * 120} y={280} width={110} height={170} fill={C.noren} stroke={C.ink} strokeWidth={4}
            transform={`skewX(${Math.sin(f / 10 + i) * 3})`} />
        ))}
        {/* 店の中: 道具の壁と棚 */}
        <rect x={600} y={330} width={640} height={420} fill="#8A6A48" stroke={C.ink} strokeWidth={5} />
        <g>
          <path d="M 650 380 L 650 520 M 630 380 L 670 380" stroke={C.steel} strokeWidth={10} strokeLinecap="round" />
          <rect x={700} y={370} width={150} height={40} rx={6} fill={NP.woodMid} stroke={C.ink} strokeWidth={4} />
          <path d="M 700 470 L 860 470 L 850 520 L 710 520 Z" fill={C.steel} stroke={C.ink} strokeWidth={4} />
          <rect x={890} y={380} width={20} height={120} fill={NP.woodDark} stroke={C.ink} strokeWidth={3} />
          <rect x={870} y={370} width={60} height={30} rx={4} fill={C.steel} stroke={C.ink} strokeWidth={3} />
        </g>
        <rect x={600} y={560} width={640} height={14} fill={C.shelfDark} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${640 + i * 120} 560 Q ${650 + i * 120} 510 ${690 + i * 120} 506 Q ${730 + i * 120} 510 ${740 + i * 120} 560 Z`}
            fill={[KRP.blue, KRP.orange, C.spine3, KRP.red, C.spine1][i]} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 積み上げた本 */}
        <g>
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={1000 + (i % 2) * 8} y={724 - i * 28} width={200} height={28} rx={4}
              fill={[C.spine1, C.spine2, C.spine3][i % 3]} stroke={C.ink} strokeWidth={4} />
          ))}
          <rect x={1004} y={lerp(300, 528, drop)} width={200} height={28} rx={4} fill={KRP.red} stroke={C.ink} strokeWidth={4}
            transform={`rotate(${(1 - drop) * 20} 1104 ${lerp(314, 542, drop)})`} />
          {f >= 26 && f < 36 && [-1, 1].map((sd) => (
            <line key={sd} x1={1104 + sd * 120} y1={540} x2={1104 + sd * 160} y2={520} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
        {/* 看板 */}
        <g transform={`rotate(${Math.sin(f / 14) * 1.5} 1160 220)`}>
          <circle cx={1160} cy={hook[1] - 30} r={150} fill={NP.glow} opacity={0.4 * lit} />
          <rect x={960} y={180} width={400} height={110} rx={10} fill={lit > 0.5 ? NP.wood : NP.woodMid} stroke={C.ink} strokeWidth={7} />
          <text x={1160} y={255} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={NP.sumi}>山田屋</text>
          <circle cx={1160} cy={hook[1] + 34} r={14} fill="none" stroke={NP.brassDark} strokeWidth={7} />
        </g>
        {/* 提灯 */}
        {[640, 1880].map((lx, i) => (
          <g key={lx} transform={`rotate(${Math.sin(f / 9 + i) * 4} ${lx} 280)`}>
            <line x1={lx} y1={270} x2={lx} y2={300} stroke={C.ink} strokeWidth={4} />
            <circle cx={lx} cy={360} r={80} fill={NP.glow} opacity={0.35 * lit} />
            <ellipse cx={lx} cy={360} rx={44} ry={60} fill={C.lantern} stroke={C.ink} strokeWidth={5} />
            {[-30, 0, 30].map((dy) => <path key={dy} d={`M ${lx - 42} ${360 + dy} Q ${lx} ${364 + dy} ${lx + 42} ${360 + dy}`} stroke={C.ink} strokeWidth={2} fill="none" opacity={0.5} />)}
            <rect x={lx - 26} y={296} width={52} height={10} fill={C.ink} />
            <rect x={lx - 26} y={414} width={52} height={10} fill={C.ink} />
          </g>
        ))}
        {/* 地面 */}
        <rect x={-80} y={840} width={2100} height={300} fill={KRP.floor} stroke={C.ink} strokeWidth={5} />
        {/* お客の人形たち */}
        {[[1380, KRP.blue], [1540, KRP.green], [1700, KRP.orange], [1300 + 560, C.momCloth]].map(([cx, col], i) => (
          <PersonMini key={i} x={(cx as number) - 40} y={880 - Math.abs(Math.sin((f + i * 6) / 5)) * 18 * lit} s={1.0} f={f} phase={i}
            color={col as string} face="smile" arms={i % 2 ? "up" : "down"} />
        ))}
        {/* 太い金茶の糸 */}
        <path d={`M ${nafudaKnot("shinyo", NX, NY, NS).join(" ")} L ${hook[0]} ${hook[1] + 34}`} stroke={NP.glow} strokeWidth={36} opacity={0.25 + 0.1 * Math.sin(f / 4)} strokeLinecap="round" />
        <Ito from={nafudaKnot("shinyo", NX, NY, NS)} to={[hook[0], hook[1] + 34]} kind="shinyo" thick={1.8} tension={0.7} sag={20} f={f} />
        {[0, 0.33, 0.66].map((o, j) => {
          const [qx, qy] = itoPt(nafudaKnot("shinyo", NX, NY, NS), [hook[0], hook[1] + 34], 6, (f * 0.03 + o) % 1);
          return <g key={j}><circle cx={qx} cy={qy} r={22} fill={NP.glow} opacity={0.5} /><circle cx={qx} cy={qy} r={9} fill={NP.glowCore} /></g>;
        })}
        <g opacity={0.3}>
          <Ito from={nafudaKnot("mimi", NX, NY, NS)} to={[-80, 420]} kind="mimi" sag={30} f={f} />
          <Ito from={nafudaKnot("chobo", NX, NY, NS)} to={[260, 840]} kind="chobo" sag={10} f={f} />
        </g>
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" knots={{ shinyo: 1 }} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// NJ1Scissors — 真鍮の大バサミ (横向き。支点が右、刃が左へのびる)
//   open: 0〜1 (1 で刃が開く)
// -------------------------------------------------------------------
const NJ1Scissors: React.FC<{ x: number; y: number; open: number }> = ({ x, y, open }) => {
  const a = clamp01(open) * 8;
  const blade = (up: boolean) => (
    <g transform={`rotate(${up ? a : -a})`}>
      <path d={up ? "M 20 0 L -1400 -4 Q -1380 -30 -1200 -40 L 0 -46 Z" : "M 20 0 L -1400 4 Q -1380 30 -1200 40 L 0 46 Z"}
        fill={NP.brass} stroke={C.ink} strokeWidth={7} />
      <path d={up ? "M -1300 -10 L -40 -30" : "M -1300 10 L -40 30"} stroke={NP.glowCore} strokeWidth={5} opacity={0.6} />
      {/* 持ち手の輪 */}
      <g transform={`translate(${up ? 150 : 170} ${up ? -70 : 70})`}>
        <path d={up ? "M -130 46 L -40 10" : "M -130 -46 L -40 -10"} stroke={NP.brassDark} strokeWidth={30} strokeLinecap="round" />
        <ellipse cx={0} cy={0} rx={70} ry={50} fill="none" stroke={NP.brassDark} strokeWidth={26} />
        <ellipse cx={0} cy={0} rx={70} ry={50} fill="none" stroke={C.ink} strokeWidth={4} />
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {blade(false)}
      {blade(true)}
      <circle r={30} fill={NP.brassDark} stroke={C.ink} strokeWidth={6} />
      <circle r={10} fill={C.ink} />
    </g>
  );
};

// -------------------------------------------------------------------
// #231 名前を奪われると、この3本が、まとめて切れてしまいます。
// 格: 山 / seed 4231
// どこ: 夜のからくり作業場 (#227 と同じ場所の、灯りを落とした別の構図)。名札が高く吊られ、3本の糸が左下・下・右下へ
// 演出: 上から真鍮の大バサミが降り、3本の糸をひと噛みで同時に切る (f12-24)。はじけ・火花。名札がぐらりと揺れて結び目の光が消える。手前のナレーターが息をのむ
// 動き: ハサミが降りる (f0-10)・閉じる (f12-17)・糸が切れて垂れる (f12-24)・名札の揺れが減衰・ランプの揺れ
const Nm231: React.FC<{ f: number }> = ({ f }) => {
  const X = 960, Y = 260, S = 0.9;
  const ends: Record<"mimi" | "chobo" | "shinyo", P2> = { mimi: [200, 931], chobo: [960, 883], shinyo: [1720, 931] };
  const sags = { mimi: 40, chobo: 0, shinyo: 40 };
  const dropY = lerp(-760, 0, easeOut(seg(f, 0, 10)));
  const open = 1 - easeIn(seg(f, 12, 17));
  const cut = easeOut(seg(f, 12, 24));
  const lift = -40 * easeInOut(seg(f, 28, 40));
  const dt = f - 14;
  const rock = dt > 0 ? 10 * Math.sin(dt / 2.6) * Math.exp(-dt / 14) : 0;
  const knotsOff = 1 - seg(f, 14, 26);
  const burst = seg(f, 13, 22);
  const after = f >= 14;
  return (
    <Frame f={f} seed={4231} dark bg={C.wallNight}>
      <g transform={cam(960, 540, 1.04 - 0.04 * seg(f, 0, 42))}>
        <NJ1Workshop f={f} night />
        {/* 揺れるランプ */}
        <g transform={`rotate(${Math.sin(f / 12) * 4 + (after ? rock * 0.4 : 0)} 1400 104)`}>
          <line x1={1400} y1={104} x2={1400} y2={200} stroke={C.ink} strokeWidth={4} />
          <path d="M 1360 200 L 1440 200 L 1470 250 L 1330 250 Z" fill={C.pole} stroke={C.ink} strokeWidth={4} />
          <path d="M 1340 250 L 1100 820 L 1700 820 L 1460 250 Z" fill={NP.glow} opacity={0.1} />
          <circle cx={1400} cy={256} r={14} fill={NP.glow} />
        </g>
        {/* 吊り紐 */}
        <line x1={960} y1={104} x2={960} y2={Y - 152 * S} stroke={C.ink} strokeWidth={6} />
        {/* 終点の真鍮の杭 */}
        {(["mimi", "chobo", "shinyo"] as const).map((k) => (
          <rect key={k} x={ends[k][0] - 12} y={ends[k][1] - 10} width={24} height={60} rx={6} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 3本の糸 (同時に切れる) */}
        {(["mimi", "chobo", "shinyo"] as const).map((k) => (
          <Ito key={k} from={nafudaKnot(k, X, Y, S)} to={ends[k]} kind={k} sag={sags[k]} cut={cut}
            thick={k === "shinyo" ? 1.6 : 1} lock={k === "chobo" ? 1 - cut : 0} f={f} />
        ))}
        {/* 切れた所のはじけ (糸の色の火花) */}
        {burst > 0 && burst < 1 && (["mimi", "chobo", "shinyo"] as const).map((k) => {
          const [cx, cy] = itoPt(nafudaKnot(k, X, Y, S), ends[k], sags[k], 0.5);
          const col = k === "mimi" ? NP.mimi : k === "chobo" ? NP.chobo : NP.shinyo;
          return (
            <g key={k} opacity={1 - burst}>
              <circle cx={cx} cy={cy} r={30 + burst * 60} fill={NP.glow} opacity={0.4} />
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i / 8) * Math.PI * 2 + 0.3;
                const r = 30 + burst * 110;
                return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={8 * (1 - burst) + 3} fill={col} stroke={C.ink} strokeWidth={2} />;
              })}
            </g>
          );
        })}
        <Nafuda x={X} y={Y} s={S} text="山田 花子" knots={{ mimi: knotsOff, chobo: knotsOff, shinyo: knotsOff }} rot={rock} f={f} />
        {/* 真鍮の大バサミ */}
        <NJ1Scissors x={1660} y={620 + dropY + lift} open={open} />
        {/* 閉じた瞬間の衝撃線 */}
        {f >= 16 && f < 26 && (
          <g opacity={1 - seg(f, 16, 26)} stroke={KRP.white} strokeWidth={6} strokeLinecap="round">
            {[300, 700, 1100, 1500].map((lx) => (
              <g key={lx}><line x1={lx} y1={560} x2={lx - 20} y2={520} /><line x1={lx} y1={680} x2={lx - 20} y2={720} /></g>
            ))}
          </g>
        )}
        {/* ナレーター (息をのむ) */}
        <Person x={150} y={980} s={1.15} f={f} cloth="#6F8FB0" clothDark="#4F6C8C"
          face={after ? "surprised" : "worried"} pose={after ? "hold" : "stand"} gaze={[8, -6]} lean={after ? -6 : 0} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #232 呼ばれなくなり、記録から消え、積み上げたものも失う。
// 格: 山 / seed 4232
// どこ: 3つ並んだ額の中。上から切れた糸の端 (朱/藍/金茶) が垂れ下がる。①夕方の路地 ②役所の机の名簿 ③夜の店先
// 演出: 左から順に暗くなる。①母が振り向かずに奥へ去り、手前のナレーターがしょんぼり ②名簿の表紙がパタンと閉じ、机のランプが消える ③提灯が消え、看板が傾き、お客が左右へ散る
// 動き: ①f2-18 去る・暗転 ②f14-22 閉じる・f22-30 暗転 ③f26-32 灯りが消える・f28-40 お客が散る・カメラが少し引く
const Nm232: React.FC<{ f: number }> = ({ f }) => {
  const panels = [40, 660, 1280];
  const PW = 600, PT = 120, PB = 820;
  const go = easeInOut(seg(f, 2, 18));
  const dark1 = seg(f, 4, 18);
  const close = easeIn(seg(f, 14, 22));
  const sx = Math.cos(Math.PI * close);
  const dark2 = seg(f, 20, 30);
  const lampOff = seg(f, 22, 26);
  const out = seg(f, 26, 32);
  const scatter = easeOut(seg(f, 28, 40));
  const dark3 = seg(f, 28, 40);
  const ends = [NP.mimi, NP.chobo, NP.shinyo];
  return (
    <Frame f={f} seed={4232} bg={C.wallWorkDark}>
      <g transform={cam(960, 470, 1.03 - 0.03 * seg(f, 0, 42))}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.wallWork} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 170} y1={-60} x2={i * 170} y2={1140} stroke={C.wallWorkDark} strokeWidth={5} />)}
        <defs>
          {panels.map((px, i) => (
            <clipPath key={i} id={`nj1p232-${i}`}><rect x={px} y={PT} width={PW} height={PB - PT} /></clipPath>
          ))}
        </defs>
        {/* ① 呼ばれなくなる */}
        <g clipPath="url(#nj1p232-0)">
          <rect x={40} y={PT} width={PW} height={PB - PT} fill={C.eveLow} />
          <rect x={40} y={PT} width={PW} height={260} fill={C.eveTop} />
          <rect x={40} y={330} width={PW} height={260} fill={C.houseWall} stroke={C.ink} strokeWidth={4} />
          <path d="M 20 330 L 340 250 L 660 330 Z" fill={C.houseRoof} stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2].map((j) => <rect key={j} x={90 + j * 180} y={380} width={90} height={70} fill={dark1 > 0.5 ? "#6A6E80" : NP.glow} stroke={C.ink} strokeWidth={3} />)}
          <rect x={40} y={590} width={PW} height={230} fill={KRP.floor} />
          <path d="M 260 590 L 420 590 L 640 820 L 40 820 Z" fill={C.road} opacity={0.6} />
          <Person x={lerp(360, 250, go)} y={lerp(720, 640, go)} s={lerp(0.95, 0.6, go)} f={f} cloth={C.momCloth} clothDark={C.momClothDark} />
          <NJ1BackHead x={lerp(360, 250, go)} y={lerp(720, 640, go)} s={lerp(0.95, 0.6, go)} f={f} bun />
          <Person x={560} y={900} s={1.0} f={f} phase={2} cloth="#6F8FB0" clothDark="#4F6C8C" face="sad" pose="raise" gaze={[-8, -2]} />
          <rect x={40} y={PT} width={PW} height={PB - PT} fill={C.night} opacity={0.55 * dark1} />
        </g>
        {/* ② 記録から消える */}
        <g clipPath="url(#nj1p232-1)">
          <rect x={660} y={PT} width={PW} height={PB - PT} fill={C.plaster} />
          <rect x={680} y={150} width={560} height={300} fill={C.shelfDark} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 11 }, (_, c) => (
            <rect key={c} x={696 + c * 49} y={170 + (c % 3) * 10} width={44} height={260 - (c % 3) * 10} fill={[C.spine1, C.spine2, C.spine3][c % 3]} stroke={C.ink} strokeWidth={3} />
          ))}
          <rect x={660} y={560} width={PW} height={260} fill={C.counter} stroke={C.ink} strokeWidth={5} />
          {/* 机のランプ */}
          <g>
            <path d="M 1150 560 L 1150 470 L 1100 440" stroke={C.ink} strokeWidth={8} fill="none" />
            <path d="M 1060 420 L 1140 420 L 1120 460 L 1080 460 Z" fill={KRP.green} stroke={C.ink} strokeWidth={4} />
            <path d="M 1080 460 L 860 600 L 1180 600 L 1120 460 Z" fill={NP.glow} opacity={0.3 * (1 - lampOff)} />
          </g>
          {/* 名簿 (右半分がパタンと閉じる) */}
          <ellipse cx={960} cy={660} rx={240} ry={18} fill={C.ink} opacity={0.25} />
          {close < 1 && <rect x={760} y={500} width={200} height={150} fill={C.paperOld} stroke={C.ink} strokeWidth={5} />}
          {close < 1 && [0, 1, 2, 3].map((r) => <line key={r} x1={780} y1={530 + r * 28} x2={940} y2={530 + r * 28} stroke={C.ink} strokeWidth={2} opacity={0.4} />)}
          <g transform={`translate(960 0) scale(${sx} 1) translate(-960 0)`}>
            {sx >= 0 ? (
              <g>
                <rect x={960} y={500} width={200} height={150} fill={C.paperOld} stroke={C.ink} strokeWidth={5} />
                {[0, 1, 2, 3].map((r) => <line key={r} x1={980} y1={530 + r * 28} x2={1140} y2={530 + r * 28} stroke={C.ink} strokeWidth={2} opacity={0.4} />)}
              </g>
            ) : (
              <g>
                <rect x={954} y={494} width={212} height={162} rx={6} fill={NP.chobo} stroke={C.ink} strokeWidth={6} />
                <rect x={1030} y={540} width={60} height={70} fill={C.paperOld} stroke={C.ink} strokeWidth={3} />
                {[[966, 506], [1154, 506], [966, 644], [1154, 644]].map(([cx, cy], j) => <circle key={j} cx={cx} cy={cy} r={8} fill={NP.brass} stroke={C.ink} strokeWidth={3} />)}
              </g>
            )}
          </g>
          {f >= 22 && f < 32 && (
            <g opacity={1 - seg(f, 22, 32)}>
              {[-1, 1].map((sd) => (
                <ellipse key={sd} cx={960 + sd * (140 + seg(f, 22, 32) * 60)} cy={650} rx={50} ry={22} fill={C.plasterDark} stroke={C.ink} strokeWidth={3} />
              ))}
              {[-1, 1].map((sd) => <line key={`l${sd}`} x1={960 + sd * 240} y1={500} x2={960 + sd * 280} y2={470} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />)}
            </g>
          )}
          <rect x={660} y={PT} width={PW} height={PB - PT} fill={C.night} opacity={0.55 * dark2} />
        </g>
        {/* ③ 積み上げたものを失う */}
        <g clipPath="url(#nj1p232-2)">
          <rect x={1280} y={PT} width={PW} height={PB - PT} fill={C.duskTop} />
          <rect x={1300} y={300} width={560} height={420} fill={C.houseWall} stroke={C.ink} strokeWidth={5} />
          <path d="M 1270 310 L 1360 230 L 1900 230 L 1900 310 Z" fill={C.houseRoof} stroke={C.ink} strokeWidth={5} />
          {[0, 1, 2].map((i) => <rect key={i} x={1480 + i * 120} y={320} width={110} height={150} fill={C.noren} stroke={C.ink} strokeWidth={4} />)}
          <g transform={`rotate(${8 * out} 1360 330)`}>
            <rect x={1340} y={330} width={120} height={70} rx={6} fill={out > 0.5 ? NP.woodMid : NP.wood} stroke={C.ink} strokeWidth={5} />
            <text x={1400} y={378} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={NP.sumi}>山田屋</text>
          </g>
          <g transform={`rotate(${Math.sin(f / 9) * 4} 1820 300)`}>
            <circle cx={1820} cy={370} r={70} fill={NP.glow} opacity={0.4 * (1 - out)} />
            <ellipse cx={1820} cy={370} rx={36} ry={50} fill={out > 0.5 ? "#8A5A50" : C.lantern} stroke={C.ink} strokeWidth={4} />
            <rect x={1800} y={316} width={40} height={8} fill={C.ink} /><rect x={1800} y={416} width={40} height={8} fill={C.ink} />
          </g>
          {/* 崩れた本の山 */}
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={1340 + i * 6 + (i > 2 ? scatter * 30 * i : 0)} y={690 - i * 26 + (i > 2 ? scatter * 26 * (i - 2) : 0)} width={130} height={26} rx={4}
              fill={[C.spine1, C.spine2, C.spine3][i % 3]} stroke={C.ink} strokeWidth={3}
              transform={`rotate(${i > 2 ? scatter * 25 * (i - 2) : 0} ${1405 + i * 6} ${703 - i * 26})`} />
          ))}
          <rect x={1280} y={720} width={PW} height={100} fill={KRP.floor} />
          {[[1600, -1], [1700, 1], [1790, 1]].map(([cx, dir], i) => (
            <g key={i} opacity={1 - scatter * 0.45}>
              <PersonMini x={cx + dir * scatter * 150} y={790} s={0.8} f={f} phase={i} color={[KRP.blue, KRP.green, KRP.orange][i]} face="dot" />
            </g>
          ))}
          <rect x={1280} y={PT} width={PW} height={PB - PT} fill={C.night} opacity={0.55 * dark3} />
        </g>
        {/* 額縁・切れた糸の端・札 */}
        {panels.map((px, i) => {
          const cx = px + PW / 2;
          const sw = Math.sin(f / 10 + i) * 10;
          return (
            <g key={i}>
              <rect x={px} y={PT} width={PW} height={PB - PT} fill="none" stroke={NP.woodDark} strokeWidth={22} />
              <rect x={px - 11} y={PT - 11} width={PW + 22} height={PB - PT + 22} fill="none" stroke={C.ink} strokeWidth={5} />
              <path d={`M ${cx} ${PT - 30} Q ${cx + sw * 0.5} ${PT + 40} ${cx + sw} ${PT + 110}`} stroke={C.ink} strokeWidth={15} fill="none" strokeLinecap="round" />
              <path d={`M ${cx} ${PT - 30} Q ${cx + sw * 0.5} ${PT + 40} ${cx + sw} ${PT + 110}`} stroke={ends[i]} strokeWidth={9} fill="none" strokeLinecap="round" />
              {[-1, 0, 1].map((k) => (
                <line key={k} x1={cx + sw} y1={PT + 110} x2={cx + sw + k * 12} y2={PT + 132 + Math.abs(k) * -4} stroke={ends[i]} strokeWidth={4} strokeLinecap="round" />
              ))}
            </g>
          );
        })}
        <TagPlate x={340} y={770} text="耳の糸" size={32} t={1} />
        <TagPlate x={960} y={770} text="帳簿の糸" size={32} t={1} />
        <TagPlate x={1580} y={770} text="信用の糸" size={32} t={1} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #233 だから昔の人は、名前を隠し、名前で罰し、国は名前に鍵をかけたのです。
// 格: 図 / seed 4233
// どこ: 漆喰の壁に据えた3つ仕切りの飾り棚 (これまでの章の小物を並べた棚)
// 演出: 左=名札をしまった木の小箱 (第1〜2章)・中=「穢」の字の名札 (第3章)・右=明治の名前の錠前 (第5章)。上の小さな灯りが左から1つずつ点いて照らす
// 動き: 灯りが順に点く (f6-12 / f18-24 / f30-36)・点いた物の後光がゆっくり脈打つ・名札のゆれ・カメラがわずかに横へ
const Nm233: React.FC<{ f: number }> = ({ f }) => {
  const lit = [0, 1, 2].map((i) => easeOut(seg(f, 6 + i * 12, 12 + i * 12)));
  const cells = [393, 960, 1527];
  const px0 = lerp(14, -14, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={4233}>
      <g transform={`translate(${px0} 0)`}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.plaster} />
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={rnd(4233, i) * 1920} cy={rnd(4234, i) * 1000} r={3 + rnd(4235, i) * 6} fill={C.plasterDark} />
        ))}
        <rect x={-60} y={860} width={2040} height={280} fill={C.shelfWood} stroke={C.ink} strokeWidth={5} />
        {/* 棚 */}
        <rect x={120} y={180} width={1700} height={600} fill={C.ink} opacity={0.2} />
        <rect x={100} y={160} width={1720} height={610} rx={10} fill={C.shelfWood} stroke={C.ink} strokeWidth={8} />
        {cells.map((cx, i) => (
          <g key={i}>
            <rect x={cx - 270} y={200} width={540} height={500} fill={C.shelfDark} stroke={C.ink} strokeWidth={5} />
            {/* 灯りに照らされる */}
            <path d={`M ${cx - 40} 210 L ${cx - 240} 700 L ${cx + 240} 700 L ${cx + 40} 210 Z`} fill={NP.glow} opacity={0.22 * lit[i]} />
            <circle cx={cx} cy={470} r={190 + Math.sin(f / 6 + i) * 10} fill={NP.glow} opacity={0.22 * lit[i]} />
            <rect x={cx - 50} y={200} width={100} height={20} rx={6} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />
            <circle cx={cx} cy={226} r={12} fill={lit[i] > 0.5 ? NP.glowCore : "#6E5A44"} stroke={C.ink} strokeWidth={3} />
            <rect x={cx - 270} y={690} width={540} height={14} fill={C.benchEdge} />
          </g>
        ))}
        {/* 左: 名札をしまった木の小箱 */}
        <g>
          <path d="M 220 520 L 230 440 L 560 420 L 570 500 Z" fill={NP.woodMid} stroke={C.ink} strokeWidth={6}
            transform={`rotate(${-6 + Math.sin(f / 12) * 1} 220 520)`} />
          <Nafuda x={393} y={540} s={0.6} text="山田 花子" hang={false} rot={-6} f={f} />
          <rect x={213} y={560} width={360} height={130} rx={8} fill={NP.woodDark} stroke={C.ink} strokeWidth={6} />
          <rect x={233} y={576} width={320} height={98} rx={4} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
          <circle cx={393} cy={625} r={12} fill={NP.brass} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 中: 「穢」の字の名札 */}
        <g>
          <circle cx={960} cy={300} r={9} fill={NP.brass} stroke={C.ink} strokeWidth={3} />
          <line x1={960} y1={300} x2={960} y2={350} stroke={C.ink} strokeWidth={4} />
          <Nafuda x={960} y={472} s={0.8} text="穢" f={f} />
          <rect x={880} y={650} width={90} height={40} rx={6} fill={C.ink} />
          <path d="M 1000 690 L 1060 600" stroke={NP.woodMid} strokeWidth={10} strokeLinecap="round" />
          <path d="M 1060 600 L 1072 584" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
        </g>
        {/* 右: 明治の名前の錠前 (小さな台に立てる) */}
        <g>
          <path d="M 1360 690 L 1420 620 M 1694 690 L 1634 620" stroke={NP.woodDark} strokeWidth={14} strokeLinecap="round" />
          <MeijiLock x={1527} y={470} s={0.38} stage={5} t={1} f={f} />
        </g>
        <TagPlate x={393} y={786} text="第1〜2章" size={30} t={1} />
        <TagPlate x={960} y={786} text="第3章" size={30} t={1} />
        <TagPlate x={1527} y={786} text="第5章" size={30} t={1} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_223: (f) => <Nm223 f={f} />,
  nm_224: (f) => <Nm224 f={f} />,
  nm_225: (f) => <Nm225 f={f} />,
  nm_226: (f) => <Nm226 f={f} />,
  nm_227: (f) => <Nm227 f={f} />,
  nm_228: (f) => <Nm228 f={f} />,
  nm_229: (f) => <Nm229 f={f} />,
  nm_230: (f) => <Nm230 f={f} />,
  nm_231: (f) => <Nm231 f={f} />,
  nm_232: (f) => <Nm232 f={f} />,
  nm_233: (f) => <Nm233 f={f} />,
};

export const NM_J1_MOTIFS: string[] = [
  "nm_223", // #223
  "nm_224", // #224
  "nm_225", // #225
  "nm_226", // #226
  "nm_227", // #227
  "nm_228", // #228
  "nm_229", // #229
  "nm_230", // #230
  "nm_231", // #231
  "nm_232", // #232
  "nm_233", // #233
];

export const namaeJ1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
