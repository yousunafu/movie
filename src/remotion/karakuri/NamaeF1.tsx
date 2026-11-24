// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#114〜#123 (10文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  sky: "#D4E3E4", skyWarm: "#EFE2C8", cloud: "#FBF8F0",
  brick: "#B4573D", brickDark: "#8C3F2C", brickFar: "#C47A5E", mortar: "#E6D6C0",
  stone: "#E4DCCB", stoneDark: "#BFB29A",
  road: "#CDB88E", roadDark: "#AE976C", rail: "#6E6A66",
  ironGreen: "#3E5148", tramGreen: "#4F7360", tramCream: "#EFE4C4",
  horse: "#8B5A38", horseDark: "#5E3B22", lacquer: "#2A2328",
  officer: "#2F3B5C", officerDark: "#1F2840",
  plaster: "#EFE5CF", plasterShade: "#E0D3B6",
  woodWall: "#7A5332", woodWallDark: "#5A3B22", woodLight: "#B88A57", woodPale: "#D2AE7C",
  baize: "#4E6B4A", baizeDark: "#3A5238",
  lampGlass: "#F6EFC9", flame: "#F2A93B",
  tatami: "#CFC08A", tatamiDark: "#A99A62", tatamiEdge: "#3D4A3A",
  shoji: "#F6F1E2", washi: "#F3EAD3", washiShade: "#E2D4B2",
  kakishibu: "#A8703E", aiCover: "#5C6F92",
  gold: "#D9B451", goldDark: "#A88630", goldLeaf: "#E6C565",
  robe: "#3A3540", robeDark: "#2A2630", kesa: "#C9842E", kesaDark: "#9A6220",
  indigo: "#5B6E8C", indigoDark: "#44546E", beni: "#B5577A", beniDark: "#8E3F5E",
  ochre: "#8C7A4A", ochreDark: "#6B5C35", suit: "#3B3B44", suitDark: "#2A2A32",
  shadow: "#2A2530",
  plant: "#6E9A5A", plantDark: "#4E7340",
  dirt: "#B9A47C", dirtDark: "#9A8560", mountain: "#9FB3A0", paddy: "#B8C78A",
  shirt: "#E8E4DA", hinoRed: "#C8372D",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend; void Ushiro; void MeijiLock;
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
const easeIn = (t: number) => t * t;
// カメラ: 点 (px,py) を中心に z 倍 (はみ出しが出ないよう z>=1 で使う)
const cam = (px: number, py: number, z: number, dx = 0, dy = 0) =>
  `translate(${px + dx} ${py + dy}) scale(${z}) translate(${-px} ${-py})`;
// Person と同じ体の上下ゆれ (帽子・髪を重ねるため)
const pbob = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;
// 波線 (字の代わり。縦)
const wavyV = (x: number, y1: number, y2: number, a = 5, step = 14) => {
  let d = `M ${x} ${y1}`;
  for (let y = y1, k = 0; y < y2; y += step, k++) d += ` q ${k % 2 ? -a : a} ${step / 2} 0 ${step}`;
  return d;
};

// 明治の役人の制帽 + 口ひげ (Person に重ねる。x,y,s,f,phase,lean は Person と同じ値)
const NF1Kepi: React.FC<{ x: number; y: number; s?: number; f?: number; phase?: number; lean?: number; mustache?: boolean }> = ({
  x, y, s = 1, f = 0, phase = 0, lean = 0, mustache = true,
}) => (
  <g transform={`translate(${x} ${y + pbob(f, phase)}) scale(${s}) rotate(${lean})`}>
    <path d="M -54 -262 L -47 -324 Q 0 -334 47 -324 L 54 -262 Z" fill={C.officerDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-56} y={-282} width={112} height={20} fill={C.officer} stroke={KRP.ink} strokeWidth={4} />
    <line x1={-54} y1={-272} x2={54} y2={-272} stroke={NP.brass} strokeWidth={3} />
    <circle cx={0} cy={-302} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
    <path d="M -54 -262 Q 4 -250 70 -258 Q 40 -238 -54 -254 Z" fill={KRP.ink} />
    {mustache && (
      <path d="M -32 -196 Q -15 -209 0 -199 Q 15 -209 32 -196 Q 17 -192 0 -195 Q -17 -192 -32 -196 Z" fill={KRP.ink} />
    )}
  </g>
);

// 明治の女の結い上げ髪 (Person hair="cap" に重ねる)
const NF1Bun: React.FC<{ x: number; y: number; s?: number; f?: number; phase?: number; lean?: number }> = ({
  x, y, s = 1, f = 0, phase = 0, lean = 0,
}) => (
  <g transform={`translate(${x} ${y + pbob(f, phase)}) scale(${s}) rotate(${lean})`}>
    <ellipse cx={0} cy={-306} rx={48} ry={27} fill={KRP.ink} />
    <ellipse cx={-8} cy={-316} rx={24} ry={9} fill="#6A5D52" opacity={0.6} />
    <path d="M -66 -252 Q -78 -226 -62 -206 L -56 -246 Z" fill={KRP.ink} />
    <path d="M 66 -252 Q 78 -226 62 -206 L 56 -246 Z" fill={KRP.ink} />
    <line x1={-66} y1={-298} x2={62} y2={-322} stroke={NP.brass} strokeWidth={6} strokeLinecap="round" />
    <circle cx={62} cy={-322} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-30} y={-290} width={60} height={10} rx={5} fill={C.kakishibu} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 山高帽 (洋装の紳士)
const NF1Bowler: React.FC<{ x: number; y: number; s?: number; f?: number; phase?: number }> = ({ x, y, s = 1, f = 0, phase = 0 }) => (
  <g transform={`translate(${x} ${y + pbob(f, phase)}) scale(${s})`}>
    <path d="M -50 -268 Q -52 -330 0 -332 Q 52 -330 50 -268 Z" fill={C.suitDark} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={0} cy={-266} rx={80} ry={13} fill={C.suitDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-50} y={-286} width={100} height={10} fill={KRP.ink} />
  </g>
);

// 菅笠 (車夫・村人)
const NF1Kasa: React.FC<{ x: number; y: number; s?: number; f?: number; phase?: number; lean?: number }> = ({ x, y, s = 1, f = 0, phase = 0, lean = 0 }) => (
  <g transform={`translate(${x} ${y + pbob(f, phase)}) scale(${s}) rotate(${lean})`}>
    <path d="M -100 -262 L 0 -330 L 100 -262 Q 0 -248 -100 -262 Z" fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -60 -288 L 60 -288 M -30 -310 L 30 -310" stroke={C.kakishibu} strokeWidth={3} />
  </g>
);

// ガス灯 (x,y=根元)
const NF1GasLamp: React.FC<{ x: number; y: number; s?: number; on: number; f: number }> = ({ x, y, s = 1, on, f }) => {
  const fl = 0.85 + Math.sin(f / 3.1) * 0.08 + Math.sin(f / 1.7) * 0.05;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {on > 0 && <circle cx={0} cy={-372} r={110} fill={NP.glow} opacity={0.32 * on * fl} />}
      {on > 0 && <circle cx={0} cy={-372} r={60} fill={NP.glowCore} opacity={0.5 * on * fl} />}
      <path d="M -26 0 L 26 0 L 16 -50 L -16 -50 Z" fill={C.ironGreen} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-9} y={-336} width={18} height={290} fill={C.ironGreen} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-16} y={-200} width={32} height={14} rx={5} fill={C.ironGreen} stroke={KRP.ink} strokeWidth={3} />
      <line x1={-44} y1={-306} x2={44} y2={-306} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      <path d="M -30 -340 L 30 -340 L 42 -404 L -42 -404 Z" fill="#B9C2BC" stroke={KRP.ink} strokeWidth={4} />
      <path d="M -30 -340 L 30 -340 L 42 -404 L -42 -404 Z" fill={C.lampGlass} opacity={on} />
      <path d="M 0 -340 L 0 -404" stroke={KRP.ink} strokeWidth={3} />
      {on > 0 && <ellipse cx={0} cy={-364} rx={9 * on} ry={16 * on * fl} fill={C.flame} />}
      <path d="M -52 -404 L 52 -404 L 0 -442 Z" fill={C.ironGreen} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-448} r={7} fill={C.ironGreen} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

// 人力車 (x=車輪の中心のx, y=地面。左向きに走る)
const NF1Rickshaw: React.FC<{ x: number; y: number; s?: number; f: number; spin?: number; passenger?: boolean }> = ({
  x, y, s = 1, f, spin = 0, passenger = true,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 車夫 */}
    <Person x={-262} y={0} s={0.55} f={f} phase={3} pose="run" cloth={C.indigo} clothDark={C.indigoDark} face="normal" lean={-6} />
    <NF1Kasa x={-262} y={0} s={0.55} f={f} phase={3} lean={-6} />
    {/* 梶棒 */}
    <path d="M -50 -120 L -262 -70" stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
    <path d="M -50 -120 L -262 -70" stroke={C.lacquer} strokeWidth={7} strokeLinecap="round" />
    {/* 幌 (たたんだ蛇腹) */}
    <path d="M 30 -150 Q 60 -280 140 -250 L 120 -150 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${48 + i * 22} -160 Q ${70 + i * 22} -250 ${110 + i * 10} -246`} stroke="#5A5058" strokeWidth={4} fill="none" />
    ))}
    {/* 乗客 */}
    {passenger && (
      <g>
        <Person x={20} y={-80} s={0.5} f={f} phase={5} cloth={C.suit} clothDark={C.suitDark} face="smile" />
        <NF1Bowler x={20} y={-80} s={0.5} f={f} phase={5} />
      </g>
    )}
    {/* 座席の箱 */}
    <path d="M -70 -150 L 90 -150 L 90 -96 L -60 -96 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -60 -126 L 84 -126" stroke={NP.brass} strokeWidth={4} />
    {/* 足置き */}
    <path d="M -60 -100 L -130 -84 L -126 -72 L -56 -88 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
    {/* 車輪 */}
    <circle cx={0} cy={-74} r={74} fill="none" stroke={KRP.ink} strokeWidth={12} />
    <circle cx={0} cy={-74} r={74} fill="none" stroke={C.woodLight} strokeWidth={6} />
    <g transform={`rotate(${spin} 0 -74)`}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={0} y1={-74} x2={Math.cos(a) * 70} y2={-74 + Math.sin(a) * 70} stroke={KRP.ink} strokeWidth={3} />;
      })}
    </g>
    <circle cx={0} cy={-74} r={12} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #114 第5章、明治、名前に錠前がかかる。
// 格: 山 / seed 4114
// 絵: 章扉。明治の東京の大通り (レンガの洋館・ガス灯・電信柱・人力車・鉄道馬車・着物と洋装が混ざる人々)。手前の柱に `MeijiLock` の装置が小さく掛かっている (stage=0)。`ChapterDoor` (num=5, title「明治、名前に錠前がかかる」)。題字の後ろにクリームの帯
// どこ: 明治の銀座れんが街の大通り。左手前の煉瓦の壁に、まだ錠前のない MeijiLock が掛かっている
// 演出: 鉄道馬車が奥を走り、人力車が手前を横切る。夕方のガス灯にぽっと火が入る。錠前の装置がきらりと光る
// 動き: カメラは装置に寄った所から引いて大通りを見せる。馬車・人力車が走る。ガス灯が点る。柳がゆれる
const Nm114: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const z = lerp(1.12, 1.0, easeInOut(seg(f, 0, 36)));
  const lampOn = seg(f, 10, 18);
  const lampOn2 = seg(f, 18, 26);
  const tramX = lerp(1020, 1480, seg(f, 0, 42) * 0.7);
  const rickX = lerp(1080, 860, easeOut(seg(f, 0, 40)));
  const glint = seg(f, 26, 40);
  const walkers: [number, number, string, string, "w" | "m" | "s"][] = [
    [1060, 0.6, C.beni, C.beniDark, "w"], [1180, -0.5, C.suit, C.suitDark, "s"], [1330, 0.4, C.indigo, C.indigoDark, "m"],
    [1700, 0.5, C.beni, C.beniDark, "w"], [1850, -0.4, C.suit, C.suitDark, "s"],
  ];
  const farB: [number, number, number, string][] = [
    [600, 300, 250, C.brickFar], [900, 340, 280, C.brick], [1240, 330, 240, C.brickFar], [1570, 390, 270, C.brick],
  ];
  return (
    <Frame f={f} seed={4114}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={5} title="明治、名前に錠前がかかる" t={door} left={1000} top={560} />
      </>}>
      <defs>
        <pattern id="nf1BrickL" width={96} height={44} patternUnits="userSpaceOnUse">
          <rect width={96} height={44} fill={C.brick} />
          <path d="M 0 22 H 96 M 0 44 H 96 M 48 0 V 22 M 0 22 V 44 M 96 22 V 44" stroke={C.mortar} strokeWidth={4} />
        </pattern>
        <pattern id="nf1BrickS" width={36} height={16} patternUnits="userSpaceOnUse">
          <path d="M 0 8 H 36 M 0 16 H 36 M 18 0 V 8 M 0 8 V 16" stroke={C.mortar} strokeWidth={2} opacity={0.7} />
        </pattern>
      </defs>
      <g transform={cam(300, 420, z)}>
        {/* 空 (夕方) */}
        <rect x={-40} y={-40} width={W + 80} height={540} fill={C.sky} />
        <rect x={-40} y={300} width={W + 80} height={200} fill={C.skyWarm} opacity={0.7} />
        {[[800, 90, 120], [1300, 60, 160], [1750, 120, 110]].map(([cx, cy, r], i) => (
          <g key={i} transform={`translate(${Math.sin(f / 40 + i) * 6 + f * 0.3} 0)`} fill={C.cloud} opacity={0.9}>
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.32} />
            <ellipse cx={cx + r * 0.4} cy={cy - r * 0.15} rx={r * 0.5} ry={r * 0.3} />
          </g>
        ))}
        {/* 奥のれんが街 (2階建て・アーケードの柱) */}
        {farB.map(([bx, bw, bh, col], i) => {
          const top = 480 - bh;
          return (
            <g key={i}>
              <rect x={bx} y={top} width={bw} height={bh} fill={col} stroke={KRP.ink} strokeWidth={5} />
              <rect x={bx} y={top} width={bw} height={bh} fill="url(#nf1BrickS)" />
              <rect x={bx - 8} y={top - 18} width={bw + 16} height={22} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${bx - 4} ${top - 18} L ${bx + 30} ${top - 46} L ${bx + bw - 30} ${top - 46} L ${bx + bw + 4} ${top - 18} Z`} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
              {/* 2階の窓 (アーチ) */}
              {Array.from({ length: Math.floor(bw / 70) }, (_, k) => {
                const wx = bx + 24 + k * 70;
                return (
                  <g key={k}>
                    <path d={`M ${wx} ${top + 90} L ${wx} ${top + 46} Q ${wx + 20} ${top + 22} ${wx + 40} ${top + 46} L ${wx + 40} ${top + 90} Z`}
                      fill={(k + i) % 3 === 0 ? NP.glowCore : "#5E6A70"} stroke={C.stone} strokeWidth={5} />
                    <line x1={wx + 20} y1={top + 36} x2={wx + 20} y2={top + 90} stroke={C.stone} strokeWidth={3} />
                  </g>
                );
              })}
              {/* バルコニーの手すり */}
              <rect x={bx} y={top + 100} width={bw} height={14} fill={C.stone} stroke={KRP.ink} strokeWidth={3} />
              {Array.from({ length: Math.floor(bw / 18) }, (_, k) => (
                <line key={k} x1={bx + 9 + k * 18} y1={top + 114} x2={bx + 9 + k * 18} y2={top + 132} stroke={C.stone} strokeWidth={4} />
              ))}
              {/* 1階の列柱とのれん */}
              <rect x={bx} y={top + 134} width={bw} height={bh - 134} fill="#4A3A30" />
              {Array.from({ length: Math.floor(bw / 60) + 1 }, (_, k) => (
                <rect key={k} x={bx + k * 60 - 7} y={top + 134} width={14} height={bh - 134} fill={C.stone} stroke={KRP.ink} strokeWidth={3} />
              ))}
              {Array.from({ length: Math.floor(bw / 60) }, (_, k) => (
                <rect key={`n${k}`} x={bx + k * 60 + 12} y={top + 140} width={36} height={34} fill={[C.indigo, C.tramCream, C.beni][(k + i) % 3]} stroke={KRP.ink} strokeWidth={2} />
              ))}
            </g>
          );
        })}
        {/* 歩道 */}
        <rect x={560} y={478} width={1400} height={30} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        {/* 道 */}
        <rect x={-40} y={506} width={W + 80} height={620} fill={C.road} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${620 + i * 160} ${640 + (i % 3) * 90} q 40 -6 80 0`} stroke={C.roadDark} strokeWidth={4} fill="none" />
        ))}
        {/* 轍と小石・水たまり */}
        <path d="M 570 900 Q 1200 860 1960 900" stroke={C.roadDark} strokeWidth={6} fill="none" opacity={0.6} />
        <path d="M 570 960 Q 1200 920 1960 960" stroke={C.roadDark} strokeWidth={6} fill="none" opacity={0.6} />
        <ellipse cx={760} cy={990} rx={120} ry={22} fill={C.sky} stroke={C.roadDark} strokeWidth={4} opacity={0.8} />
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={i} cx={600 + rnd(114, i) * 1300} cy={600 + rnd(115, i) * 440} rx={8} ry={5} fill={C.roadDark} />
        ))}
        {/* 柳 */}
        {[1110, 1520].map((tx, i) => (
          <g key={i}>
            <path d={`M ${tx} 500 Q ${tx - 6} 400 ${tx + 4} 300`} stroke={C.woodWallDark} strokeWidth={14} fill="none" strokeLinecap="round" />
            {Array.from({ length: 9 }, (_, k) => {
              const sx = tx - 70 + k * 18;
              const sw = Math.sin(f / 12 + k * 0.7) * 10;
              return <path key={k} d={`M ${tx + 4} 296 Q ${sx} 300 ${sx + sw} ${380 + (k % 3) * 30}`} stroke={k % 2 ? C.plant : C.plantDark} strokeWidth={6} fill="none" strokeLinecap="round" />;
            })}
          </g>
        ))}
        {/* 歩道の人びと (着物と洋装が混ざる) */}
        {walkers.map(([wx, sp, col, colD, kind], i) => {
          const px = wx + f * sp * 2;
          return (
            <g key={i}>
              <Person x={px} y={500} s={0.3} f={f} phase={i} cloth={col} clothDark={colD} hair="cap" face={i % 2 ? "smile" : "normal"} />
              {kind === "w" && <NF1Bun x={px} y={500} s={0.3} f={f} phase={i} />}
              {kind === "s" && <NF1Bowler x={px} y={500} s={0.3} f={f} phase={i} />}
              {kind === "w" && (
                <g>
                  <line x1={px + 20} y1={460} x2={px + 20} y2={400} stroke={KRP.ink} strokeWidth={3} />
                  <path d={`M ${px - 22} 404 Q ${px + 20} 366 ${px + 62} 404 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                </g>
              )}
            </g>
          );
        })}
        {/* 鉄道馬車のレール */}
        <line x1={560} y1={540} x2={W + 40} y2={540} stroke={C.rail} strokeWidth={5} />
        <line x1={560} y1={552} x2={W + 40} y2={552} stroke={C.rail} strokeWidth={5} />
        {/* 鉄道馬車 (右へ) */}
        <g transform={`translate(${tramX} 540) scale(0.62)`}>
          <rect x={-150} y={-160} width={300} height={22} rx={6} fill={C.tramGreen} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-136} y={-140} width={272} height={60} fill={C.tramGreen} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, k) => (
            <g key={k}>
              <rect x={-124 + k * 52} y={-132} width={40} height={42} fill={C.lampGlass} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={-104 + k * 52} cy={-102} r={12} fill={k % 2 ? KRP.white : C.shirt} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${-116 + k * 52} -110 Q ${-104 + k * 52} -122 ${-92 + k * 52} -110`} fill={KRP.ink} />
            </g>
          ))}
          <rect x={-136} y={-80} width={272} height={60} fill={C.tramCream} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-136} y1={-50} x2={136} y2={-50} stroke={C.tramGreen} strokeWidth={6} />
          {[-80, 80].map((wx) => (
            <g key={wx} transform={`rotate(${f * 8} ${wx} -12)`}>
              <circle cx={wx} cy={-12} r={20} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
              <line x1={wx - 16} y1={-12} x2={wx + 16} y2={-12} stroke={C.stone} strokeWidth={3} />
            </g>
          ))}
          {/* 馬 */}
          <line x1={136} y1={-60} x2={200} y2={-70} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={250} cy={-80} rx={62} ry={30} fill={C.horse} stroke={KRP.ink} strokeWidth={5} />
          {[200, 222, 280, 300].map((lx, k) => (
            <line key={lx} x1={lx} y1={-60} x2={lx + Math.sin(f / 3 + k * 1.6) * 12} y2={-4} stroke={C.horseDark} strokeWidth={9} strokeLinecap="round" />
          ))}
          <path d="M 296 -100 L 330 -150 L 360 -140 L 338 -94 Z" fill={C.horse} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 300 -110 L 326 -150" stroke={C.horseDark} strokeWidth={8} />
          <path d="M 190 -86 q -20 10 -14 40" stroke={C.horseDark} strokeWidth={6} fill="none" />
        </g>
        {/* 電信柱と電線 */}
        <path d={`M 560 150 Q 905 ${190 + Math.sin(f / 15) * 3} 1250 110 Q 1500 ${150 + Math.sin(f / 15) * 3} 1750 110 Q 1860 130 ${W + 40} 104`} stroke={KRP.ink} strokeWidth={3} fill="none" />
        <path d="M 560 170 Q 905 212 1250 130 Q 1500 172 1750 130 Q 1860 150 1960 124" stroke={KRP.ink} strokeWidth={3} fill="none" />
        {[1250, 1750].map((px) => (
          <g key={px}>
            <rect x={px - 9} y={90} width={18} height={440} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
            <rect x={px - 50} y={104} width={100} height={12} fill={C.woodWall} stroke={KRP.ink} strokeWidth={3} />
            <rect x={px - 40} y={124} width={80} height={10} fill={C.woodWall} stroke={KRP.ink} strokeWidth={3} />
            {[-40, -14, 14, 40].map((ix) => <circle key={ix} cx={px + ix} cy={102} r={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />)}
          </g>
        ))}
        {/* ガス灯 */}
        <NF1GasLamp x={1640} y={510} s={0.55} on={lampOn2} f={f} />
        <NF1GasLamp x={940} y={560} s={0.8} on={lampOn} f={f} />
        {/* 手前を横切る人力車 */}
        <NF1Rickshaw x={rickX} y={830} s={0.72} f={f} spin={-f * 7} />
        {/* 左手前の煉瓦の壁 */}
        <rect x={-40} y={-40} width={606} height={1160} fill="url(#nf1BrickL)" stroke={KRP.ink} strokeWidth={8} />
        <rect x={520} y={-40} width={46} height={1160} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={520} y1={i * 92} x2={566} y2={i * 92} stroke={C.stoneDark} strokeWidth={4} />
        ))}
        <rect x={-40} y={70} width={606} height={36} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={106} width={606} height={10} fill={C.stoneDark} />
        {/* 壁の窓 (下) と雨どい */}
        <path d="M 120 1080 L 120 690 Q 210 610 300 690 L 300 1080 Z" fill="#4E5A60" stroke={C.stone} strokeWidth={14} />
        <path d="M 120 1080 L 120 690 Q 210 610 300 690 L 300 1080 Z" fill="none" stroke={KRP.ink} strokeWidth={4} />
        <line x1={210} y1={640} x2={210} y2={1080} stroke={C.stone} strokeWidth={8} />
        <rect x={60} y={700} width={52} height={380} fill={C.tramGreen} stroke={KRP.ink} strokeWidth={4} />
        <rect x={308} y={700} width={52} height={380} fill={C.tramGreen} stroke={KRP.ink} strokeWidth={4} />
        <rect x={470} y={116} width={18} height={1000} fill="#6A6E70" stroke={KRP.ink} strokeWidth={3} />
        {/* 装置を吊る鉄の金具 */}
        {[150, 450].map((hx) => (
          <g key={hx}>
            <path d={`M ${hx} 130 L ${hx} 250 Q ${hx} 286 ${hx + 18} 290`} stroke={KRP.ink} strokeWidth={8} fill="none" />
            <rect x={hx - 16} y={122} width={32} height={18} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 主役: まだ錠前のかかっていない「明治の名前の錠前」 */}
        <MeijiLock x={300} y={430} s={0.4} stage={0} t={0} f={f} />
        {/* きらり */}
        {glint > 0 && glint < 1 && (
          <g transform={`translate(${lerp(90, 520, glint)} ${lerp(320, 540, glint)}) scale(${Math.sin(glint * Math.PI)})`}>
            <path d="M 0 -34 L 8 -8 L 34 0 L 8 8 L 0 34 L -8 8 L -34 0 L -8 -8 Z" fill={NP.glowCore} stroke={NP.glow} strokeWidth={3} />
          </g>
        )}
        {/* 壁付けのガス灯 */}
        <path d="M 520 210 L 590 210 L 590 236" stroke={KRP.ink} strokeWidth={6} fill="none" />
        <g transform="translate(590 380) scale(0.45)">
          <NF1GasLamp x={0} y={0} s={1} on={lampOn} f={f} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #115 明治3年。政府は、平民も名字を名乗ってよい、と許可します。
// 格: 山 / seed 4115
// 絵: 明治の役所の部屋 (洋風の机・ランプ・格子窓の外に人力車)。壁の `MeijiLock` (stage=1)。1段目の札「明治3年 許可」が光り、名札に許可の判がポンと押される。窓の外の掲示板に布告の紙が貼られ、庶民が集まって見上げる
// どこ: 明治の役所の洋間。漆喰の壁と腰板、緑の羅紗の机、石油ランプ。右に格子窓、外は掲示板のある往来
// 演出: 上から役人の手が大きな判をおろし、名札の名字にポン。装置の1段目「許可」が光る。窓の外では布告の紙が貼られ、庶民が寄ってきて見上げる
// 動き: 判がおりて上がる (f8〜32)。判の跡がぽんと出る。庶民が掲示板へ集まる。人力車が通る。ランプの炎がゆれる。カメラは装置へ少し寄る
const Nm115: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 40)));
  const down = easeIn(seg(f, 8, 14));
  const up = easeOut(seg(f, 20, 32));
  const hy = 214 - (1 - down) * 420 - up * 420;
  const mark = seg(f, 14, 20);
  const burst = seg(f, 14, 24);
  const paper = easeOut(seg(f, 2, 12));
  const fl = Math.sin(f / 2.3) * 0.08 + Math.sin(f / 3.7) * 0.06;
  const crowd: [number, number, string, string, boolean][] = [
    [1430, -180, C.indigo, C.indigoDark, false], [1520, -120, C.beni, C.beniDark, true], [1610, 160, C.ochre, C.ochreDark, false],
    [1690, 200, C.indigo, C.indigoDark, false], [1770, 240, C.beni, C.beniDark, true],
  ];
  return (
    <Frame f={f} seed={4115}>
      <defs>
        <clipPath id="nf1Win115"><rect x={1340} y={150} width={500} height={450} /></clipPath>
        <pattern id="nf1BrickS" width={36} height={16} patternUnits="userSpaceOnUse">
          <path d="M 0 8 H 36 M 0 16 H 36 M 18 0 V 8 M 0 8 V 16" stroke={C.mortar} strokeWidth={2} opacity={0.7} />
        </pattern>
      </defs>
      <g transform={cam(740, 400, z)}>
        {/* 漆喰の壁と天井の廻り縁 */}
        <rect x={-40} y={-40} width={W + 80} height={720} fill={C.plaster} />
        <rect x={-40} y={-40} width={W + 80} height={96} fill={C.woodWallDark} />
        <rect x={-40} y={56} width={W + 80} height={14} fill={C.woodLight} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${i * 340} 120 q 60 40 20 120`} stroke={C.plasterShade} strokeWidth={10} fill="none" opacity={0.6} />
        ))}
        {/* 腰板 */}
        <rect x={-40} y={640} width={W + 80} height={480} fill={C.woodWall} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={630} width={W + 80} height={18} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={20 + i * 250} y={672} width={210} height={160} rx={6} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={3} opacity={0.7} />
        ))}
        {/* 天井から下がる洋灯 */}
        <line x1={1160} y1={56} x2={1160} y2={130} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1110 160 Q 1160 110 1210 160 Z" fill={C.ironGreen} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={1160} cy={172} rx={16} ry={14} fill={C.lampGlass} stroke={KRP.ink} strokeWidth={3} />
        {/* 格子窓の外 */}
        <g clipPath="url(#nf1Win115)">
          <rect x={1340} y={150} width={500} height={450} fill={C.sky} />
          <rect x={1340} y={190} width={500} height={60} fill={C.brickFar} />
          <rect x={1340} y={190} width={500} height={60} fill="url(#nf1BrickS)" />
          <rect x={1340} y={480} width={500} height={120} fill={C.road} />
          {/* 掲示板 */}
          <rect x={1532} y={330} width={12} height={180} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={1716} y={330} width={12} height={180} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 1500 318 L 1630 280 L 1760 318 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1516} y={318} width={228} height={110} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(1630 326) scale(1 ${paper})`}>
            <rect x={-80} y={0} width={160} height={92} fill={C.washi} stroke={KRP.ink} strokeWidth={3} />
            {[50, 26, 2, -22, -46].map((lx) => <path key={lx} d={wavyV(lx, 10, 82, 3, 10)} stroke={KRP.ink} strokeWidth={3} fill="none" />)}
            <rect x={-74} y={8} width={14} height={14} fill={KRP.red} />
          </g>
          {/* 集まってくる庶民 */}
          {crowd.map(([cx, from, col, colD, woman], i) => {
            const k = easeOut(seg(f, 4 + i * 3, 30 + i * 2));
            const px = cx + from * (1 - k);
            return (
              <g key={i}>
                <Person x={px} y={560} s={0.32} f={f} phase={i + 2} cloth={col} clothDark={colD} hair="cap"
                  face={k > 0.9 ? (i % 2 ? "surprised" : "joy") : "normal"} gaze={[0, -6]} pose={k > 0.95 && i === 2 ? "point" : "stand"} />
                {woman && <NF1Bun x={px} y={560} s={0.32} f={f} phase={i + 2} />}
              </g>
            );
          })}
          <NF1Rickshaw x={lerp(1920, 1520, seg(f, 0, 42))} y={598} s={0.34} f={f} spin={-f * 8} />
        </g>
        {/* 窓の枠と格子 */}
        <rect x={1340} y={150} width={500} height={450} fill="none" stroke={C.woodWallDark} strokeWidth={22} />
        {[1465, 1590, 1715].map((gx) => <line key={gx} x1={gx} y1={150} x2={gx} y2={600} stroke={C.woodWallDark} strokeWidth={9} />)}
        {[262, 375, 488].map((gy) => <line key={gy} x1={1340} y1={gy} x2={1840} y2={gy} stroke={C.woodWallDark} strokeWidth={9} />)}
        <rect x={1320} y={600} width={540} height={24} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        {/* 装置を掛ける紐 */}
        <path d="M 520 70 L 470 180 M 960 70 L 1010 180" stroke={KRP.ink} strokeWidth={5} />
        {/* 1段目の光の筋 */}
        {burst > 0 && (
          <g opacity={Math.sin(burst * Math.PI) * 0.8 + 0.2 * burst}>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <line key={i} x1={404 + Math.cos(a) * 70} y1={498 + Math.sin(a) * 70} x2={404 + Math.cos(a) * 150} y2={498 + Math.sin(a) * 150}
                stroke={NP.glow} strokeWidth={10} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 主役: 明治の名前の錠前 stage=1 */}
        <MeijiLock x={740} y={400} s={0.7} stage={1} t={seg(f, 13, 24)} f={f} />
        {/* 名札の名字に押された「許」の判 */}
        {mark > 0 && (
          <g transform={`translate(622 214) rotate(-12) scale(${0.72 * pop(mark)})`}>
            <rect x={-30} y={-30} width={60} height={60} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} opacity={0.92} />
            <rect x={-22} y={-22} width={44} height={44} rx={4} fill="none" stroke={KRP.white} strokeWidth={3} />
            <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.white}>許</text>
          </g>
        )}
        {/* 判をおろす役人の手 (上から) */}
        <g transform={`translate(622 ${hy})`}>
          <rect x={-40} y={-560} width={80} height={440} rx={20} fill={C.officer} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-42} y={-150} width={84} height={20} fill={C.officerDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-24} y={-112} width={48} height={100} rx={10} fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-118} rx={30} ry={14} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-28} y={-14} width={56} height={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={-30} cy={-90} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={30} cy={-90} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          {down > 0.95 && up < 0.3 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              <line x1={-60} y1={-10} x2={-96} y2={-30} /><line x1={60} y1={-10} x2={96} y2={-30} /><line x1={0} y1={30} x2={0} y2={60} />
            </g>
          )}
        </g>
        {/* 装置を指して説明する役人 */}
        <Person x={210} y={900} s={1.0} f={f} phase={1} pose="point" pointDir={1} cloth={C.officer} clothDark={C.officerDark}
          face={f > 16 ? "smile" : "normal"} gaze={[6, -4]} />
        <NF1Kepi x={210} y={900} s={1.0} f={f} phase={1} />
        {/* 机 (緑の羅紗) */}
        <path d="M 330 770 L 1250 770 L 1300 810 L 280 810 Z" fill={C.baize} stroke={KRP.ink} strokeWidth={5} />
        <rect x={270} y={808} width={1040} height={30} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={290} y={838} width={1000} height={260} fill={C.woodWall} stroke={KRP.ink} strokeWidth={5} />
        {[440, 790, 1140].map((dx) => (
          <g key={dx}>
            <rect x={dx - 130} y={860} width={260} height={90} rx={6} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={dx} cy={905} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 机の上: 書類の束・インク壺・ペン */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={480 + i * 3} y={772 - i * 8} width={170} height={24} rx={3} fill={i % 2 ? C.washi : KRP.white} stroke={KRP.ink} strokeWidth={3}
            transform={`rotate(${(i - 1.5) * 2} 560 770)`} />
        ))}
        <rect x={380} y={756} width={44} height={36} rx={8} fill={KRP.ink} />
        <line x1={410} y1={756} x2={460} y2={700} stroke={KRP.ink} strokeWidth={5} />
        {/* 石油ランプ */}
        <g transform="translate(1180 790)">
          <circle cx={0} cy={-130} r={90} fill={NP.glow} opacity={0.22 + fl} />
          <path d="M -40 0 L 40 0 L 26 -24 L -26 -24 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-58} rx={44} ry={36} fill={C.tramGreen} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-96} width={32} height={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -18 -96 Q -26 -150 -12 -190 L 12 -190 Q 26 -150 18 -96 Z" fill={C.lampGlass} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          <ellipse cx={0} cy={-128} rx={7} ry={15 * (1 + fl)} fill={C.flame} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #116 ところが、届け出は、なかなか進みませんでした。
// 格: 並 / seed 4116
// 絵: 役所の届出の窓口。机の上の受付箱は**空っぽ** (クモの巣がかかりかける)。役人が頬杖をついて時計を見る (振り子が f で揺れる)。外の庶民は窓の前を素通り
// どこ: 役所の届出の窓口。カウンターの上に大きな受付箱。後ろの壁に柱時計、左に往来の見える窓
// 演出: 受付箱は空っぽで、隅にクモの巣が張られていき、クモが糸で降りてくる。役人は頬杖で時計を見上げる。窓の外の庶民は素通り
// 動き: 振り子がゆっくり揺れる。クモの巣の輪が1本ずつ増える。クモが降りる。庶民が窓の前を横切る。カメラは受付箱へゆっくり寄る
const Nm116: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.08, easeInOut(seg(f, 0, 42)));
  const swing = Math.sin(f / 10) * 13;
  const web = seg(f, 4, 38);
  const rings = 5 * web;
  const spiderY = lerp(150, 520, easeOut(seg(f, 10, 40)));
  const WX = 1012, WY = 614; // 巣の角 (受付箱の左奥)
  const spokes = [0, 18, 36, 54, 72, 90].map((d) => (d * Math.PI) / 180);
  const passers: [number, number, string, string, boolean][] = [
    [-60, 4.2, C.indigo, C.indigoDark, false], [200, 3.0, C.beni, C.beniDark, true], [420, 3.6, C.ochre, C.ochreDark, false],
  ];
  return (
    <Frame f={f} seed={4116}>
      <defs><clipPath id="nf1Win116"><rect x={90} y={140} width={470} height={420} /></clipPath></defs>
      <g transform={cam(1150, 640, z)}>
        {/* 壁 */}
        <rect x={-40} y={-40} width={W + 80} height={800} fill={C.plaster} />
        <rect x={-40} y={-40} width={W + 80} height={90} fill={C.woodWallDark} />
        <rect x={-40} y={50} width={W + 80} height={12} fill={C.woodLight} stroke={KRP.ink} strokeWidth={3} />
        <rect x={640} y={50} width={30} height={710} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓と往来 (素通りする庶民) */}
        <g clipPath="url(#nf1Win116)">
          <rect x={90} y={140} width={470} height={420} fill={C.sky} />
          <rect x={90} y={250} width={470} height={150} fill={C.woodWall} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={110 + i * 120} y={280} width={80} height={120} fill={C.shoji} stroke={KRP.ink} strokeWidth={3} />)}
          <rect x={90} y={400} width={470} height={160} fill={C.road} />
          {passers.map(([x0, sp, col, colD, woman], i) => {
            const px = x0 + f * sp;
            return (
              <g key={i}>
                <Person x={px} y={560} s={0.4} f={f} phase={i + 4} cloth={col} clothDark={colD} hair="cap" face="normal" gaze={[5, 0]} lean={-4} />
                {woman && <NF1Bun x={px} y={560} s={0.4} f={f} phase={i + 4} lean={-4} />}
              </g>
            );
          })}
        </g>
        <rect x={90} y={140} width={470} height={420} fill="none" stroke={C.woodWallDark} strokeWidth={20} />
        <line x1={325} y1={140} x2={325} y2={560} stroke={C.woodWallDark} strokeWidth={10} />
        <line x1={90} y1={350} x2={560} y2={350} stroke={C.woodWallDark} strokeWidth={10} />
        {/* 柱時計 */}
        <g transform="translate(1520 0)">
          <rect x={-86} y={92} width={172} height={200} rx={20} fill={C.woodWall} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -96 96 Q 0 40 96 96 Z" fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={190} r={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 54} y1={190 + Math.sin(a) * 54} x2={Math.cos(a) * 62} y2={190 + Math.sin(a) * 62} stroke={KRP.ink} strokeWidth={i % 3 ? 3 : 6} />;
          })}
          <line x1={0} y1={190} x2={0} y2={146} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={0} y1={190} x2={Math.cos(f / 30) * 36} y2={190 + Math.sin(f / 30) * 36} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          <circle cx={0} cy={190} r={7} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-70} y={292} width={140} height={260} rx={10} fill={C.woodWall} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-50} y={310} width={100} height={220} rx={6} fill="#E8EDE6" stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${swing} 0 312)`}>
            <line x1={0} y1={312} x2={0} y2={480} stroke={NP.brassDark} strokeWidth={5} />
            <circle cx={0} cy={490} r={24} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          </g>
          <path d="M -60 552 L 60 552 L 40 580 L -40 580 Z" fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 壁の札 */}
        <TagPlate x={1150} y={330} text="届出" size={44} fill={C.washi} />
        {/* クモの糸とクモ */}
        <line x1={1270} y1={62} x2={1270} y2={spiderY} stroke={KRP.grayDark} strokeWidth={2} />
        <g transform={`translate(1270 ${spiderY}) rotate(${Math.sin(f / 7) * 8})`}>
          {[-1, 1].map((sd) => [0, 1, 2, 3].map((k) => (
            <path key={`${sd}${k}`} d={`M 0 0 q ${sd * 14} ${-8 + k * 6} ${sd * 22} ${2 + k * 7}`} stroke={KRP.ink} strokeWidth={3} fill="none" />
          )))}
          <ellipse cx={0} cy={2} rx={11} ry={13} fill={KRP.ink} />
          <circle cx={0} cy={-10} r={7} fill={KRP.ink} />
        </g>
        {/* 役人 (カウンターの奥・頬杖) */}
        <g>
          <Person x={700} y={820} s={1.05} f={f} phase={2} cloth={C.officer} clothDark={C.officerDark} face="normal" gaze={[9, -7]} lean={5} still />
          <NF1Kepi x={700} y={820} s={1.05} f={0} phase={2} lean={5} />
        </g>
        {/* カウンター (役人の体の手前) */}
        <rect x={-40} y={744} width={W + 80} height={36} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={780} width={W + 80} height={340} fill={C.woodWall} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 170} y1={780} x2={i * 170} y2={1080} stroke={C.woodWallDark} strokeWidth={5} />)}
        {/* 頬杖の腕 */}
        <path d="M 850 744 L 780 640" stroke={KRP.ink} strokeWidth={34} strokeLinecap="round" />
        <path d="M 850 744 L 780 640" stroke={C.officer} strokeWidth={24} strokeLinecap="round" />
        <circle cx={777} cy={632} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* ため息 */}
        <path d={`M 690 ${600 - seg(f, 10, 40) * 40} q -30 -10 -40 -34 q 20 6 30 -6`} fill="none" stroke={KRP.grayDark} strokeWidth={4} opacity={0.4 + 0.5 * Math.sin(seg(f, 10, 40) * Math.PI)} />
        {/* もう片方の手は指でカウンターをとんとん */}
        <circle cx={600} cy={738 - Math.abs(Math.sin(f / 5)) * 8} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 540 760 L 596 742" stroke={C.officer} strokeWidth={22} strokeLinecap="round" />
        {/* 誰も座らない待合の長椅子と、昼寝の猫 */}
        <rect x={1080} y={900} width={640} height={30} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1100} y={930} width={22} height={120} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1680} y={930} width={22} height={120} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`translate(1560 900) scale(1 ${1 + Math.sin(f / 9) * 0.04})`}>
          <path d="M -70 0 Q -74 -56 -10 -60 Q 50 -62 64 -20 Q 70 0 60 0 Z" fill={C.ochre} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={50} cy={-34} r={26} fill={C.ochre} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 34 -54 L 40 -76 L 54 -58 M 58 -56 L 70 -74 L 74 -50" fill={C.ochre} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 40 -34 q 6 4 12 0 M 58 -34 q 6 4 12 0" stroke={KRP.ink} strokeWidth={3} fill="none" />
          <path d="M -70 -6 Q -110 -10 -100 -40" stroke={KRP.ink} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M -70 -6 Q -110 -10 -100 -40" stroke={C.ochre} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
        <text x={1640} y={820 - (f % 30)} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.grayDark} opacity={0.6}>z</text>
        {/* 呼び鈴と硯 */}
        <g transform="translate(470 744)">
          <path d="M -26 0 Q -26 -40 0 -40 Q 26 -40 26 0 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-44} r={7} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <rect x={300} y={728} width={110} height={18} rx={4} fill={KRP.ink} />
        <line x1={320} y1={724} x2={400} y2={712} stroke={C.kakishibu} strokeWidth={6} strokeLinecap="round" />
        {/* 主役: 空っぽの受付箱 */}
        <g>
          <rect x={990} y={592} width={380} height={152} fill={KRP.ink} opacity={0.15} transform="translate(10 6)" />
          <path d="M 1000 600 L 1360 600 L 1340 628 L 1020 628 Z" fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1020 628 L 1340 628 L 1340 640 L 1020 640 Z" fill={C.woodWall} />
          <rect x={990} y={628} width={380} height={116} rx={4} fill={C.woodPale} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 990 600 L 1000 600 L 1020 628 L 990 628 Z M 1370 600 L 1360 600 L 1340 628 L 1370 628 Z" fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => <path key={i} d={`M 1010 ${650 + i * 30} q 170 ${i % 2 ? 6 : -6} 340 0`} stroke={C.woodLight} strokeWidth={3} fill="none" />)}
          <rect x={1130} y={652} width={100} height={64} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
          <text x={1180} y={698} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>届</text>
          {/* 箱の中のホコリ */}
          {[1100, 1180, 1260].map((dx, i) => (
            <circle key={i} cx={dx + Math.sin(f / 9 + i) * 6} cy={612 - ((f * 0.6 + i * 9) % 30)} r={3} fill={KRP.grayDark} opacity={0.5} />
          ))}
        </g>
        {/* クモの巣 (箱の左奥の角から張っていく) */}
        <g stroke={KRP.grayDark} strokeWidth={2.5} fill="none" opacity={0.85}>
          {spokes.map((a, i) => {
            const L = 120 * clamp01(web * 3 - i * 0.25);
            return <line key={i} x1={WX} y1={WY} x2={WX + Math.cos(a) * L} y2={WY - Math.sin(a) * L} />;
          })}
          {Array.from({ length: Math.floor(rings) }, (_, r) => {
            const R = 28 + r * 20;
            const d = spokes.map((a, i) => `${i ? "L" : "M"} ${WX + Math.cos(a) * R} ${WY - Math.sin(a) * R}`).join(" ");
            return <path key={r} d={d} />;
          })}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #117 税金を取られるのでは、と警戒したから、という説もあります。
// 格: 山 / seed 4117
// 絵: 長屋の路地。庶民たちが額を寄せてひそひそ話 (吹き出しに銭の袋と×の絵)。名字の札を背中に隠す人。物陰から役人の影。札「〜という説」(小さく)
// どこ: 長屋の路地 (奥へすぼまる一本道)。両側に障子戸の長屋、真ん中にどぶ板、頭上に物干し、手前左に井戸
// 演出: 庶民3人が額を寄せてひそひそ。頭の上の吹き出しに銭の袋が出て、赤い×がつく。右の男は名字の札を背中に隠して震える。右の角から役人の影がぬっと伸びてくる
// 動き: 吹き出しがぽんと出る (f6〜14)、×がつく (f18〜26)。影がすべり込む (f14〜34)。右の男が影に気づいて目を向ける。物干しの着物がゆれる。カメラはゆっくり右へ
const Nm117: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.04;
  const dx = lerp(24, -10, easeInOut(seg(f, 0, 42)));
  const bub = seg(f, 6, 14);
  const xm = seg(f, 18, 26);
  const sh = easeOut(seg(f, 14, 34));
  const notice = f > 30;
  const PL = (u: number, v: number): [number, number] => {
    const top = lerp(120, 360, u), bot = lerp(1000, 560, u);
    return [760 * u, lerp(top, bot, v)];
  };
  const PR = (u: number, v: number): [number, number] => {
    const [x, y] = PL(u, v);
    return [1920 - x, y];
  };
  const quad = (P: typeof PL, u0: number, u1: number, v0: number, v1: number) => {
    const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1);
    return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]} L ${d[0]} ${d[1]} Z`;
  };
  const doors: [number, number][] = [[0.06, 0.3], [0.42, 0.58], [0.68, 0.79], [0.86, 0.93]];
  const side = (P: typeof PL, key: string) => (
    <g key={key}>
      <path d={quad(P, 0, 1, 0, 1)} fill={C.woodWall} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 22 }, (_, i) => {
        const u = i / 22;
        const a = P(u, 0.08), b = P(u, 1);
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.woodWallDark} strokeWidth={3} opacity={0.7} />;
      })}
      {doors.map(([u0, u1], i) => (
        <g key={i}>
          <path d={quad(P, u0, u1, 0.2, 0.72)} fill={C.shoji} stroke={KRP.ink} strokeWidth={4} />
          {[0.33, 0.66].map((k) => {
            const a = P(lerp(u0, u1, k), 0.2), b = P(lerp(u0, u1, k), 0.72);
            return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.woodLight} strokeWidth={3} />;
          })}
          {[0.37, 0.54].map((k) => {
            const a = P(u0, k), b = P(u1, k);
            return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.woodLight} strokeWidth={3} />;
          })}
          <path d={quad(P, u0, u1, 0.72, 1)} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* ひさし */}
      <path d={`M ${P(0, 0)[0]} ${P(0, 0)[1] - 30} L ${P(1, 0)[0]} ${P(1, 0)[1] - 10} L ${P(1, 0.06)[0]} ${P(1, 0.06)[1]} L ${P(0, 0.08)[0]} ${P(0, 0.08)[1]} Z`}
        fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
  const coinBag = (
    <g>
      <path d="M -60 40 Q -78 -20 -30 -40 L 30 -40 Q 78 -20 60 40 Q 0 70 -60 40 Z" fill={C.ochre} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -34 -40 Q 0 -60 34 -40" stroke={KRP.red} strokeWidth={8} fill="none" />
      <path d="M -10 -50 l -18 -26 M 10 -50 l 18 -26" stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
      {[[100, 20], [130, -10], [118, 48]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={24} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
          <rect x={cx - 7} y={cy - 7} width={14} height={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
  return (
    <Frame f={f} seed={4117}>
      <g transform={cam(960, 540, z, dx)}>
        {/* 奥の空と板塀 */}
        <rect x={-60} y={-40} width={W + 120} height={1160} fill={C.sky} />
        <rect x={700} y={300} width={520} height={280} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={720 + i * 42} y1={300} x2={720 + i * 42} y2={580} stroke={C.woodWall} strokeWidth={4} />)}
        <circle cx={960} cy={240} r={40} fill={NP.glowCore} opacity={0.8} />
        {/* 地面 */}
        <path d="M -60 1000 L 760 560 L 1160 560 L 1980 1000 L 1980 1120 L -60 1120 Z" fill={C.dirt} />
        <path d="M 930 560 L 990 560 L 1110 1120 L 810 1120 Z" fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => {
          const t = i / 10;
          const y = lerp(570, 1100, t * t);
          const hw = lerp(30, 150, t * t);
          return <line key={i} x1={960 - hw} y1={y} x2={960 + hw} y2={y} stroke={C.woodLight} strokeWidth={4} />;
        })}
        {side(PL, "L")}
        {side(PR, "R")}
        {/* 物干し竿と着物 */}
        <line x1={150} y1={190} x2={1770} y2={190} stroke={C.woodLight} strokeWidth={10} />
        <line x1={150} y1={190} x2={1770} y2={190} stroke={KRP.ink} strokeWidth={2} />
        {[[520, C.indigo], [1400, C.beni]].map(([kx, col], i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 14 + i) * 3} ${kx} 190)`}>
            <path d={`M ${Number(kx) - 110} 190 L ${Number(kx) + 110} 190 L ${Number(kx) + 104} 250 L ${Number(kx) + 54} 250 L ${Number(kx) + 60} 380 L ${Number(kx) - 60} 380 L ${Number(kx) - 54} 250 L ${Number(kx) - 104} 250 Z`}
              fill={col as string} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${Number(kx) - 20} 190 L ${Number(kx)} 260 L ${Number(kx) + 20} 190`} stroke={KRP.ink} strokeWidth={4} fill="none" />
          </g>
        ))}
        <path d={`M 860 190 l 0 ${70 + Math.sin(f / 10) * 4} l 46 0 l 0 -70`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 朝顔の鉢 */}
        {[[300, 860], [1640, 860]].map(([px, py], i) => (
          <g key={i}>
            <path d={`M ${px - 34} ${py - 50} L ${px + 34} ${py - 50} L ${px + 24} ${py} L ${px - 24} ${py} Z`} fill={C.kakishibu} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${px} ${py - 50} q -20 -60 6 -130`} stroke={C.plantDark} strokeWidth={4} fill="none" />
            <circle cx={px + 6} cy={py - 180} r={16} fill={C.aiCover} stroke={KRP.ink} strokeWidth={3} />
            <ellipse cx={px - 16} cy={py - 110} rx={14} ry={9} fill={C.plant} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 井戸 */}
        <g transform="translate(250 940)">
          <rect x={-90} y={-130} width={180} height={130} rx={10} fill={C.woodPale} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-130} rx={90} ry={20} fill={C.shadow} stroke={KRP.ink} strokeWidth={5} />
          {[-40, 0, 40].map((bx) => <line key={bx} x1={bx} y1={-110} x2={bx} y2={0} stroke={C.woodLight} strokeWidth={4} />)}
          <rect x={-80} y={-330} width={14} height={200} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
          <rect x={66} y={-330} width={14} height={200} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-96} y={-340} width={192} height={16} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-312} r={18} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-300} x2={0} y2={-200 + Math.sin(f / 12) * 6} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M -24 ${-200 + Math.sin(f / 12) * 6} L 24 ${-200 + Math.sin(f / 12) * 6} L 18 ${-160 + Math.sin(f / 12) * 6} L -18 ${-160 + Math.sin(f / 12) * 6} Z`} fill={C.woodPale} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 役人の影 (右の角から伸びる) */}
        <g transform={`translate(${lerp(2160, 1660, sh)} 860) skewX(-8) scale(1.1)`} opacity={0.6 * sh}>
          <ellipse cx={0} cy={0} rx={90} ry={16} fill={C.shadow} />
          <rect x={-62} y={-200} width={124} height={170} rx={20} fill={C.shadow} />
          <rect x={-40} y={-40} width={30} height={40} fill={C.shadow} />
          <rect x={10} y={-40} width={30} height={40} fill={C.shadow} />
          <circle cx={0} cy={-268} r={68} fill={C.shadow} />
          <path d="M -58 -300 L -50 -370 Q 0 -380 50 -370 L 58 -300 Z" fill={C.shadow} />
          <path d="M -60 -300 Q 10 -290 86 -300 L 80 -286 Q 0 -280 -60 -290 Z" fill={C.shadow} />
        </g>
        {/* 手前右の柱 (影はこの陰から出てくる) */}
        <rect x={1830} y={-40} width={150} height={1160} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1846} y={-40} width={18} height={1160} fill={C.woodWall} />
        {/* 隠された名字の札 (右の男の背中) */}
        <g transform={`translate(1250 ${712 + Math.sin(f * 1.3) * 2.5}) rotate(${14 + Math.sin(f * 1.1) * 3})`}>
          <rect x={-30} y={-80} width={60} height={160} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={NP.sumi}>山</text>
          <text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={NP.sumi}>田</text>
          <circle cx={-24} cy={84} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {f > 20 && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.7}>
            <path d="M 1300 620 q 10 -6 0 -14" fill="none" /><path d="M 1310 650 q 12 -6 0 -16" fill="none" />
          </g>
        )}
        {/* ひそひそ話の3人 */}
        <Person x={790} y={830} s={0.95} f={f} phase={1} cloth={C.indigo} clothDark={C.indigoDark} hair="cap" face="worried" gaze={[5, 2]} lean={9} />
        <Person x={1150} y={830} s={0.95} f={f} phase={3} cloth={C.ochre} clothDark={C.ochreDark} hair="cap"
          face={notice ? "surprised" : "worried"} gaze={notice ? [9, 0] : [-6, 2]} lean={-9} />
        <Person x={970} y={830} s={0.9} f={f} phase={2} cloth={C.beni} clothDark={C.beniDark} hair="cap" face="worried" gaze={[0, 3]} lean={2} />
        <NF1Bun x={970} y={830} s={0.9} f={f} phase={2} lean={2} />
        {/* 口もとを隠す手 */}
        <circle cx={1000} cy={660 + pbob(f, 2)} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 吹き出し (銭の袋に ×) */}
        {bub > 0 && (
          <g transform={`translate(960 250) scale(${pop(bub)})`}>
            <circle cx={-40} cy={190} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-20} cy={150} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -200 0 Q -220 -90 -110 -110 Q -40 -170 40 -120 Q 160 -150 200 -50 Q 260 40 170 90 Q 80 140 -20 110 Q -150 130 -190 60 Q -230 40 -200 0 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <g transform="translate(-50 0)">{coinBag}</g>
            <XMark x={0} y={0} s={1.3} t={xm} />
          </g>
        )}
        {bub > 0.5 && (
          <g fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.grayDark} opacity={0.8}>
            <text x={640} y={560}>ひそ</text>
            <text x={1250} y={540}>ひそ</text>
          </g>
        )}
      </g>
      <TagPlate x={1640} y={66} text="〜という説" size={30} fill={C.washi} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #118 明治4年、全国の人を記録する、戸籍の法律ができます。
// 格: 山 / seed 4118
// 絵: `MeijiLock` (stage=2)。2段目の札「明治4年 戸籍」が光り、錠前がガチャン。装置の横で、**和紙の帳面 (戸籍) が何冊も積み上がっていく** (f)。役所の書記たちが筆で記録している
// どこ: 役所の記録の間。漆喰の壁と長押、障子窓から光。左の壁に MeijiLock、右の畳の上で書記2人が文机に向かう
// 演出: 2段目「明治4年 戸籍」の錠前がガチャンと閉まり、部屋がゆれる。装置の横に和紙の帳面 (戸籍) が上から1冊ずつ落ちて積み上がる
// 動き: カメラは2段目の錠前に寄った所から引く (f0〜30)。錠前 f10〜20、ゆれ f20〜28。帳面9冊が f4〜36 に順に着地 (ほこりが立つ)。書記の筆が動く
const Nm118: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.3, 1.0, easeInOut(seg(f, 0, 30)));
  const shake = Math.sin(f * 3.1) * 7 * (f > 20 ? 1 - seg(f, 20, 28) : 0);
  const covers = [C.washi, C.kakishibu, C.aiCover, C.washi, C.kakishibu, C.washiShade, C.aiCover, C.washi, C.kakishibu];
  const N = covers.length;
  const landed = covers.map((_, i) => seg(f, i * 4 - 1, i * 4 + 4));
  const topIdx = landed.reduce((a, v, i) => (v >= 1 ? i : a), -1);
  return (
    <Frame f={f} seed={4118}>
      <g transform={cam(437, 492, z, shake)}>
        {/* 壁と長押 */}
        <rect x={-60} y={-60} width={W + 120} height={820} fill={C.plaster} />
        <rect x={-60} y={-60} width={W + 120} height={130} fill={C.woodWallDark} />
        <rect x={-60} y={112} width={W + 120} height={26} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        <rect x={60} y={70} width={40} height={720} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1390} y={70} width={40} height={720} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
        {/* 障子窓と光 */}
        <rect x={1460} y={160} width={420} height={300} fill={C.shoji} stroke={C.woodWall} strokeWidth={12} />
        {[1530, 1600, 1670, 1740, 1810].map((x) => <line key={x} x1={x} y1={160} x2={x} y2={460} stroke={C.woodLight} strokeWidth={4} />)}
        {[235, 310, 385].map((y) => <line key={y} x1={1460} y1={y} x2={1880} y2={y} stroke={C.woodLight} strokeWidth={4} />)}
        <path d="M 1460 460 L 1880 460 L 1960 900 L 1380 900 Z" fill={NP.glowCore} opacity={0.3} />
        {/* 床 (板の間) と 畳の段 */}
        <rect x={-60} y={760} width={W + 120} height={380} fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-60} y1={790 + i * 40} x2={W + 60} y2={790 + i * 40} stroke={C.woodLight} strokeWidth={3} />)}
        <rect x={1410} y={740} width={560} height={400} fill={C.tatami} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1410} y={740} width={560} height={18} fill={C.tatamiEdge} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={1410} y1={770 + i * 22} x2={1970} y2={770 + i * 22} stroke={C.tatamiDark} strokeWidth={2} opacity={0.6} />)}
        {/* 装置を吊る紐 */}
        <path d="M 260 125 L 300 200 M 940 125 L 900 200" stroke={KRP.ink} strokeWidth={5} />
        {[260, 940].map((x) => <circle key={x} cx={x} cy={125} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 主役: 明治の名前の錠前 stage=2 */}
        <MeijiLock x={600} y={410} s={0.68} stage={2} t={seg(f, 10, 20)} f={f} />
        {f > 19 && f < 30 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 22, 30)}>
            <line x1={360} y1={430} x2={330} y2={400} /><line x1={515} y1={430} x2={545} y2={400} /><line x1={437} y1={410} x2={437} y2={370} />
          </g>
        )}
        {/* 積み上がる戸籍の帳面 */}
        <rect x={1090} y={790} width={290} height={24} rx={4} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
        {covers.map((col, i) => {
          const k = landed[i];
          if (k <= 0) return null;
          const ty = 790 - (i + 1) * 40;
          const y = ty - (1 - easeIn(k)) * 520;
          const ox = (rnd(4118, i) - 0.5) * 22;
          const rot = (rnd(4119, i) - 0.5) * 4 * (k >= 1 ? 1 : 2);
          return (
            <g key={i} transform={`translate(${1235 + ox} ${y}) rotate(${rot})`}>
              <rect x={-128} y={0} width={256} height={40} rx={4} fill={col} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-120} y={9} width={232} height={22} fill={C.washi} />
              {[0, 1, 2, 3].map((l) => <line key={l} x1={-118} y1={13 + l * 5} x2={110} y2={13 + l * 5} stroke={C.washiShade} strokeWidth={2} />)}
              <rect x={100} y={0} width={28} height={40} fill={col} stroke={KRP.ink} strokeWidth={3} />
              {[8, 18, 28].map((sy) => <line key={sy} x1={104} y1={sy} x2={124} y2={sy} stroke={KRP.ink} strokeWidth={3} />)}
            </g>
          );
        })}
        {/* いちばん上の帳面の表紙 (題箋) */}
        {topIdx >= 0 && (() => {
          const ty = 790 - (topIdx + 1) * 40;
          const ox = (rnd(4118, topIdx) - 0.5) * 22;
          return (
            <g transform={`translate(${1235 + ox} ${ty})`}>
              <path d="M -128 0 L -100 -46 L 150 -46 L 128 0 Z" fill={covers[topIdx]} stroke={KRP.ink} strokeWidth={5} />
              <path d="M 10 -6 L 22 -40 L 92 -40 L 80 -6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <text x={52} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>戸籍</text>
            </g>
          );
        })()}
        {/* 着地のほこり */}
        {covers.map((_, i) => {
          const p = seg(f, i * 4 + 4, i * 4 + 10);
          if (p <= 0 || p >= 1) return null;
          const by = 790 - i * 40;
          return (
            <g key={i} opacity={(1 - p) * 0.8} fill="none" stroke={KRP.grayDark} strokeWidth={4}>
              <circle cx={1100 - p * 40} cy={by - 6} r={8 + p * 14} />
              <circle cx={1370 + p * 40} cy={by - 6} r={8 + p * 14} />
            </g>
          );
        })}
        {/* 書記2人 (文机で筆。座っているので机の板で足を隠す) */}
        {[1580, 1800].map((sx, i) => {
          const sc = 0.78;
          const hx = sx + 10, hy = 900 - sc * 118;
          const wig = Math.sin(f / 2.4 + i * 2) * 8;
          return (
            <g key={i}>
              <Person x={sx} y={900} s={sc} f={f} phase={i + 6} pose="hold" cloth={i ? C.ochre : C.indigo} clothDark={i ? C.ochreDark : C.indigoDark}
                hair="cap" face={i ? "worried" : "normal"} gaze={[0, 7]} lean={4} />
              <path d={`M ${hx} ${hy} L ${hx + 24 + wig * 0.5} ${hy + 34}`} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
              <path d={`M ${sx - 80} 836 L ${sx - 56} 812 L ${sx + 78} 812 L ${sx + 66} 836 Z`} fill={C.washi} stroke={KRP.ink} strokeWidth={3} />
              {[0, 1, 2, 3].map((l) => (
                <line key={l} x1={sx + 46 - l * 24} y1={818} x2={sx + 42 - l * 24} y2={830} stroke={KRP.ink} strokeWidth={3}
                  opacity={clamp01(seg(f, 6 + l * 8 + i * 4, 12 + l * 8 + i * 4))} />
              ))}
              <rect x={sx - 110} y={836} width={220} height={18} rx={3} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
              <rect x={sx - 100} y={854} width={200} height={70} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={sx - 104} y={820} width={30} height={16} rx={3} fill={KRP.ink} />
            </g>
          );
        })}
        {/* 帳面を抱えて運んでくる下役 */}
        {(() => {
          const cx = lerp(760, 930, easeOut(seg(f, 0, 40)));
          const cy = 945;
          return (
            <g>
              <Person x={cx} y={cy} s={0.95} f={f} phase={9} pose="hold" cloth={C.officer} clothDark={C.officerDark} face="worried" gaze={[6, 0]} lean={-3} />
              {[0, 1].map((b) => (
                <rect key={b} x={cx - 74 + b * 4} y={cy - 0.95 * 118 - 8 - b * 22} width={148} height={22} rx={3}
                  fill={[C.kakishibu, C.aiCover][b]} stroke={KRP.ink} strokeWidth={4} />
              ))}
              <path d={`M ${cx + 66} ${cy - 262} q 8 12 0 22 q -8 -10 0 -22 Z`} stroke={KRP.ink} strokeWidth={3} fill={KRP.blue} />
            </g>
          );
        })()}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #119 人が、ひとりずつ、名簿に結ばれたのです。
// 格: 図 / seed 4119
// 絵: 帳面の見開き (様式の模式図・**壬申戸籍の実物は描かない**)。家の枠の中に人の名前の欄 (字は波線) が並び、欄の1つ1つから細い紐が伸びて、窓の外の小さな人形たちの手首に結ばれていく (f)。帳面の紙の上=世界
// どこ: 窓辺の机の上に開いた帳面の見開き (様式の模式図)。右の窓の外は村の道で、小さな人形たちが立つ
// 演出: 家の枠の中の名前の欄 (字は波線) から、1本ずつ細い紐が伸びて窓の外へ。人形の手首に結ばれると、人形がぴくっと引かれる
// 動き: 紐8本が f4〜37 に順に伸びて結ばれる。結ばれた人形が跳ねる。紙が少しめくれ上がる。カメラは左から右へゆっくりパン
const Nm119: React.FC<{ f: number }> = ({ f }) => {
  const dx = lerp(20, -24, easeInOut(seg(f, 0, 42)));
  const cols = [270, 380, 470, 560, 860, 980, 1070, 1160];
  const dolls: [number, number, number, string][] = [
    [1420, 520, 0.55, C.indigo], [1530, 520, 0.55, C.beni], [1640, 520, 0.55, C.ochre], [1750, 520, 0.55, C.indigo],
    [1450, 740, 0.7, C.beni], [1580, 740, 0.7, C.indigo], [1710, 740, 0.7, C.ochre], [1830, 740, 0.7, C.beni],
  ];
  const curl = Math.sin(f / 16) * 4;
  return (
    <Frame f={f} seed={4119}>
      <defs><clipPath id="nf1Win119"><rect x={1330} y={90} width={560} height={680} /></clipPath></defs>
      <g transform={cam(960, 540, 1.03, dx)}>
        {/* 机 (木目) */}
        <rect x={-60} y={-60} width={W + 120} height={1200} fill={C.woodLight} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -60 ${40 + i * 130} q 500 ${rnd(41, i) * 30 - 15} 1000 0 q 500 ${rnd(42, i) * 30 - 15} 1040 0`} stroke={C.woodWall} strokeWidth={5} fill="none" opacity={0.45} />
        ))}
        {/* 窓と外の村 */}
        <g clipPath="url(#nf1Win119)">
          <rect x={1330} y={90} width={560} height={680} fill={C.sky} />
          <path d="M 1330 330 Q 1450 220 1560 300 Q 1680 200 1890 310 L 1890 420 L 1330 420 Z" fill={C.mountain} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1330} y={400} width={560} height={130} fill={C.paddy} />
          {[0, 1, 2].map((i) => <line key={i} x1={1330} y1={430 + i * 30} x2={1890} y2={430 + i * 30} stroke={C.plant} strokeWidth={3} />)}
          {[1400, 1780].map((hx, i) => (
            <g key={i}>
              <path d={`M ${hx - 60} 410 L ${hx} 360 L ${hx + 60} 410 Z`} fill={C.ochreDark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={hx - 46} y={410} width={92} height={50} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          <rect x={1330} y={530} width={560} height={240} fill={C.dirt} />
          {dolls.map(([x, y, s, col], i) => {
            const tie = seg(f, 4 + i * 3.2, 14 + i * 3.2);
            const jerk = tie >= 1 ? Math.max(0, 1 - (f - (14 + i * 3.2)) / 6) : 0;
            return <PersonMini key={i} x={x - jerk * 6} y={y - jerk * 10} s={s} color={col} f={f} phase={i} face={tie >= 1 ? "dot" : "smile"} />;
          })}
        </g>
        <rect x={1330} y={90} width={560} height={680} fill="none" stroke={C.woodWallDark} strokeWidth={22} />
        <line x1={1610} y1={90} x2={1610} y2={770} stroke={C.woodWallDark} strokeWidth={10} />
        {/* 帳面の見開き */}
        <path d="M 60 140 Q 360 110 670 150 L 670 820 Q 360 790 60 820 Z" fill={KRP.ink} opacity={0.18} transform="translate(14 14)" />
        <path d={`M 70 ${130 - curl} Q 370 100 675 140 L 675 810 Q 370 780 70 810 Z`} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 675 140 Q 980 100 1280 ${130 + curl} L 1280 810 Q 980 780 675 810 Z`} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 675 140 L 675 810" stroke={C.washiShade} strokeWidth={16} />
        <path d="M 675 140 L 675 810" stroke={KRP.ink} strokeWidth={3} />
        {/* 家の枠 (左ページ / 右ページ) */}
        {[[120, 630], [720, 1240]].map(([x0, x1], h) => (
          <g key={h}>
            <rect x={x0} y={190} width={x1 - x0} height={560} fill="none" stroke={KRP.red} strokeWidth={5} />
            <rect x={x0} y={190} width={x1 - x0} height={60} fill={KRP.red} opacity={0.12} />
            <path d={`M ${x1 - 70} 240 L ${x1 - 40} 206 L ${x1 - 10} 240 Z`} fill={C.kakishibu} stroke={KRP.ink} strokeWidth={3} />
            <rect x={x1 - 62} y={240} width={44} height={6} fill={KRP.ink} />
            {[0, 1, 2].map((k) => <path key={k} d={`M ${x0 + 30} ${220} q 20 -6 40 0 q 20 6 40 0`} stroke={KRP.ink} strokeWidth={3} fill="none" transform={`translate(${k * 110} 0)`} />)}
          </g>
        ))}
        {/* 名前の欄 (縦) */}
        {cols.map((cx, i) => (
          <g key={i}>
            <rect x={cx - 38} y={270} width={76} height={460} fill="none" stroke={KRP.red} strokeWidth={3} opacity={0.7} />
            <rect x={cx - 30} y={280} width={60} height={50} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <path d={wavyV(cx, 350, 560, 6, 16)} stroke={NP.sumi} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d={wavyV(cx + 18, 580, 700, 3, 10)} stroke={NP.sumi} strokeWidth={3} fill="none" opacity={0.7} />
            <path d={wavyV(cx - 18, 580, 680, 3, 10)} stroke={NP.sumi} strokeWidth={3} fill="none" opacity={0.7} />
          </g>
        ))}
        <rect x={500} y={680} width={44} height={44} fill={KRP.red} opacity={0.8} transform="rotate(-6 522 702)" />
        {/* 文鎮・硯・筆 */}
        <rect x={90} y={784} width={240} height={30} rx={8} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1020} y={784} width={240} height={30} rx={8} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
        <rect x={140} y={880} width={200} height={130} rx={18} fill="#4A4448" stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={240} cy={920} rx={70} ry={22} fill={KRP.ink} />
        <line x1={420} y1={980} x2={760} y2={900} stroke={C.woodPale} strokeWidth={14} strokeLinecap="round" />
        <path d="M 760 900 L 820 884 L 770 914 Z" fill={KRP.ink} />
        {/* 欄から人形の手首へ伸びる紐 */}
        {cols.map((cx, i) => {
          const [x, y, s] = dolls[i];
          const tie = seg(f, 4 + i * 3.2, 14 + i * 3.2);
          if (tie <= 0) return null;
          const wx = x + 45 * s, wy = y - 62 * s;
          const mx = (cx + wx) / 2, my = Math.min(270, wy) - 140 - i * 6;
          const d = `M ${cx} 280 Q ${mx} ${my} ${wx} ${wy}`;
          return (
            <g key={i}>
              <path d={d} stroke={KRP.ink} strokeWidth={8} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tie} strokeLinecap="round" />
              <path d={d} stroke={NP.chobo} strokeWidth={4.5} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tie} strokeLinecap="round" />
              <circle cx={cx} cy={280} r={7} fill={NP.chobo} stroke={KRP.ink} strokeWidth={3} />
              {tie >= 1 && <circle cx={wx} cy={wy} r={9} fill={NP.chobo} stroke={KRP.ink} strokeWidth={3} />}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #120 明治5年5月、名前は、ひとり1つと決められます。
// 格: 山 / seed 4120
// 絵: `MeijiLock` (stage=3)。3段目の札「明治5年5月 ひとり1つ」。装置の上で、1人の人形が持っていた名札の束 (子どもの名・大人の名・通り名 など3〜4枚) のうち、**1枚だけ残して残りがはさみで切り落とされる** (f)。床に落ちた名札
// どこ: 役所の広間。金屏風の前の板の間。左に画架に立てた MeijiLock、右に名札の束を掲げた男
// 演出: 男が持つ4枚の名札 (幼名・通り名・実名・号) の紐を、大きなはさみが1本ずつ切る。3枚が床に落ち、「通り名」1枚だけが残って光る。最後に3段目の錠前が閉まる
// 動き: はさみが f12/19/26 に切る。切れた札が回りながら落ちて床に転がる。男の顔が驚き→しょんぼり。3段目の錠前 f30〜40。カメラは右に寄った所から引く
const Nm120: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.06, 1.0, easeInOut(seg(f, 26, 42)));
  const PXc = 1400, PYc = 860, PS = 1.25;
  const HX = PXc + 67 * PS, HY = PYc - 230 * PS; // 掲げた手
  const tags: { label: string; x: number; y: number; cut: number }[] = [
    { label: "幼名", x: HX + 70, y: HY + 110, cut: 12 },
    { label: "通り名", x: HX + 190, y: HY + 70, cut: 999 },
    { label: "実名", x: HX + 300, y: HY + 140, cut: 19 },
    { label: "号", x: HX + 160, y: HY + 190, cut: 26 },
  ];
  const cutPts = tags.filter((t) => t.cut < 999).map((t) => ({ x: lerp(HX, t.x, 0.42), y: lerp(HY, t.y - 32, 0.42), c: t.cut }));
  // はさみの位置: 次に切る点へ移る
  let sx = cutPts[0].x + 40, sy = cutPts[0].y - 60;
  cutPts.forEach((p, i) => {
    const prev = i ? cutPts[i - 1] : { x: cutPts[0].x + 40, y: cutPts[0].y - 60 };
    const k = easeInOut(seg(f, p.c - 6, p.c - 1));
    if (f >= p.c - 6) { sx = lerp(prev.x, p.x, k); sy = lerp(prev.y, p.y, k); }
  });
  if (f > 28) { sx = lerp(sx, 1860, easeIn(seg(f, 28, 40))); sy = lerp(sy, 420, easeIn(seg(f, 28, 40))); }
  const open = cutPts.reduce((o, p) => (Math.abs(f - p.c) < 3 ? Math.abs(f - p.c) / 3 : o), 1);
  const face = f < 12 ? "normal" : f < 30 ? "surprised" : "sad";
  return (
    <Frame f={f} seed={4120}>
      <g transform={cam(1300, 620, z)}>
        {/* 上の壁と長押 */}
        <rect x={-60} y={-60} width={W + 120} height={240} fill={C.woodWallDark} />
        <rect x={-60} y={100} width={W + 120} height={22} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        {/* 金屏風 (6曲) */}
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={120 + i * 280} y={140} width={280} height={640} fill={i % 2 ? C.goldLeaf : C.gold} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 4 }, (_, k) => (
              <rect key={k} x={120 + i * 280} y={140 + k * 160} width={280} height={160} fill="none" stroke={C.goldDark} strokeWidth={2} opacity={0.5} />
            ))}
          </g>
        ))}
        <rect x={112} y={132} width={1696} height={656} fill="none" stroke={C.lacquer} strokeWidth={16} />
        {/* 屏風の絵: 金の雲と松 */}
        <path d="M 160 250 q 80 -40 160 0 q 60 -30 140 6 q -60 30 -150 20 q -80 20 -150 -26 Z" fill={KRP.white} opacity={0.5} />
        <path d="M 1300 220 q 90 -40 180 0 q 70 -30 150 10 q -70 30 -160 18 q -90 18 -170 -28 Z" fill={KRP.white} opacity={0.5} />
        <path d="M 1150 780 Q 1170 600 1110 470 Q 1180 430 1230 470" stroke={C.woodWallDark} strokeWidth={22} fill="none" strokeLinecap="round" />
        {[[1060, 460], [1220, 450], [1150, 380]].map(([px, py], i) => (
          <ellipse key={i} cx={px} cy={py} rx={90} ry={30} fill={C.plantDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 板の間 */}
        <rect x={-60} y={780} width={W + 120} height={360} fill={C.woodPale} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-60} y1={810 + i * 46} x2={W + 60} y2={810 + i * 46} stroke={C.woodLight} strokeWidth={3} />)}
        {/* 画架 */}
        <path d="M 420 600 L 330 900 M 860 600 L 950 900 M 640 300 L 640 880" stroke={C.woodWall} strokeWidth={22} strokeLinecap="round" />
        <path d="M 420 600 L 330 900 M 860 600 L 950 900 M 640 300 L 640 880" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5} />
        <rect x={210} y={672} width={860} height={22} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
        {/* 主役の装置 stage=3 */}
        <MeijiLock x={640} y={460} s={0.64} stage={3} t={seg(f, 30, 40)} f={f} />
        {/* 名札の束を掲げる男 */}
        <Person x={PXc} y={PYc} s={PS} f={f} phase={2} pose="raise" cloth={C.indigo} clothDark={C.indigoDark} hair="cap"
          face={face} gaze={[7, -2]} />
        <circle cx={HX} cy={HY} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 札と紐 */}
        {tags.map((t, i) => {
          const isCut = f >= t.cut;
          const dt = Math.max(0, f - t.cut);
          const fall = Math.min(1, (dt * dt) / 110);
          const restY = 905 + (i % 2) * 20;
          const ty = isCut ? lerp(t.y, restY, fall) : t.y + Math.sin(f / 9 + i) * 3;
          const tx = isCut ? t.x + (i % 2 ? 30 : -50) * fall : t.x;
          const rot = isCut ? (i % 2 ? 70 : -84) * fall : Math.sin(f / 9 + i) * 4;
          const kept = t.cut >= 999;
          const cp = { x: lerp(HX, t.x, 0.42), y: lerp(HY, t.y - 32, 0.42) };
          return (
            <g key={i}>
              {!isCut ? (
                <path d={`M ${HX} ${HY} L ${tx} ${ty - 32}`} stroke={KRP.ink} strokeWidth={4} />
              ) : (
                <g>
                  <path d={`M ${HX} ${HY} L ${cp.x} ${cp.y + 14}`} stroke={KRP.ink} strokeWidth={4} />
                  {fall < 1 && <path d={`M ${tx} ${ty - 32} l ${(cp.x - t.x) * 0.3} ${-30 * (1 - fall)}`} stroke={KRP.ink} strokeWidth={4} />}
                </g>
              )}
              <g transform={`translate(${tx} ${ty}) rotate(${rot})`}>
                {kept && f > 28 && <rect x={-90} y={-50} width={180} height={100} rx={20} fill={NP.glow} opacity={0.5} />}
                <rect x={-66} y={-32} width={132} height={64} rx={10} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
                <circle cx={0} cy={-22} r={5} fill={NP.brassDark} />
                <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={t.label.length > 2 ? 30 : 34} fill={NP.sumi}>{t.label}</text>
              </g>
            </g>
          );
        })}
        {/* 切った瞬間のはじけ */}
        {cutPts.map((p, i) => {
          const k = seg(f, p.c, p.c + 6);
          if (k <= 0 || k >= 1) return null;
          return (
            <g key={i} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - k}>
              {[0, 1, 2, 3, 4].map((j) => {
                const a = (j / 5) * Math.PI * 2;
                return <line key={j} x1={p.x + Math.cos(a) * 20} y1={p.y + Math.sin(a) * 20} x2={p.x + Math.cos(a) * (36 + k * 20)} y2={p.y + Math.sin(a) * (36 + k * 20)} />;
              })}
            </g>
          );
        })}
        {/* 大きなはさみ */}
        <g transform={`translate(${sx} ${sy}) rotate(-130)`}>
          <g transform={`rotate(${-14 * open})`}>
            <path d="M 0 -6 L 150 -4 L 0 10 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={-46} cy={-20} rx={30} ry={20} fill="none" stroke={KRP.red} strokeWidth={12} />
            <ellipse cx={-46} cy={-20} rx={30} ry={20} fill="none" stroke={KRP.ink} strokeWidth={3} />
            <line x1={0} y1={0} x2={-22} y2={-12} stroke={KRP.ink} strokeWidth={10} />
          </g>
          <g transform={`rotate(${14 * open})`}>
            <path d="M 0 6 L 150 4 L 0 -10 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={-46} cy={20} rx={30} ry={20} fill="none" stroke={KRP.red} strokeWidth={12} />
            <ellipse cx={-46} cy={20} rx={30} ry={20} fill="none" stroke={KRP.ink} strokeWidth={3} />
            <line x1={0} y1={0} x2={-22} y2={12} stroke={KRP.ink} strokeWidth={10} />
          </g>
          <circle cx={0} cy={0} r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #121 同じ年の8月、名前を変えることが、禁止されます。
// 格: 山 / seed 4121
// 絵: `MeijiLock` (stage=4)。4段目の札「明治5年8月 改名禁止」。名札に太い錠前がガチャン。名札の横の「着替え用の衣桁」(第4章 #110 の名札を掛けた衣桁) に、×の板が打ちつけられる
// どこ: 着替えの間 (畳・山水の襖・欄間)。欄間から MeijiLock が吊られ、右に名札を掛けた黒漆の衣桁
// 演出: 名札に太い真鍮の錠前が落ちてきてガチャン (4段目「改名禁止」も閉まる)。衣桁には×の板が2枚、上から伸びた金槌で打ちつけられる。衣桁へ手をのばした女が驚いて止まる
// 動き: カメラは名札に寄った所から引く (f2〜22)。大錠前 f8〜20。板1 f14〜20 に入り f20 に釘、板2 f26〜32 に入り f32 に釘。着物と札がゆれる
const Nm121: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.25, 1.0, easeInOut(seg(f, 2, 22)));
  const drop = easeIn(seg(f, 8, 16));
  const close = seg(f, 16, 20);
  const shock = seg(f, 20, 28);
  const p1 = easeOut(seg(f, 14, 20));
  const p2 = easeOut(seg(f, 26, 32));
  const hit = (h: number) => (f < h - 5 ? -50 : f < h ? lerp(-50, 6, easeIn(seg(f, h - 5, h))) : lerp(6, -50, easeOut(seg(f, h, h + 6))));
  const hamA = f < 26 ? hit(20) : hit(32);
  const nail1 = f >= 20, nail2 = f >= 32;
  const LX = 764, LY = 262; // 大錠前の位置 (名札の右端に食いこむ)
  const plank = (k: number, rot: number, key: string) => (
    <g key={key} transform={`translate(${1500 + (1 - k) * 380} ${530 - (1 - k) * 380}) rotate(${rot})`} opacity={k > 0 ? 1 : 0}>
      <rect x={-340} y={-26} width={680} height={52} rx={6} fill={C.woodPale} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -320 -8 q 160 10 320 0 q 160 -10 300 4" stroke={C.woodLight} strokeWidth={4} fill="none" />
      <rect x={-340} y={-26} width={680} height={52} rx={6} fill={KRP.red} opacity={0.25} />
    </g>
  );
  return (
    <Frame f={f} seed={4121}>
      <g transform={cam(700, 320, z)}>
        {/* 欄間と長押 */}
        <rect x={-60} y={-60} width={W + 120} height={190} fill={C.woodWallDark} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={i * 66} y1={10} x2={i * 66} y2={110} stroke={C.woodLight} strokeWidth={5} />)}
        <rect x={-60} y={110} width={W + 120} height={26} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        {/* 襖 (山水) */}
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <rect x={-20 + i * 390} y={136} width={390} height={640} fill={C.washi} stroke={C.lacquer} strokeWidth={10} />
            <circle cx={-20 + i * 390 + (i % 2 ? 40 : 350)} cy={480} r={16} fill={C.goldDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <path d="M -20 620 Q 200 440 380 560 Q 560 400 800 540 Q 1050 380 1300 520 Q 1600 420 1960 560 L 1960 776 L -20 776 Z" fill={C.mountain} opacity={0.5} />
        <path d="M -20 700 Q 400 640 900 700 Q 1400 760 1960 690" stroke={C.aiCover} strokeWidth={6} fill="none" opacity={0.4} />
        {/* 畳 */}
        <rect x={-60} y={776} width={W + 120} height={360} fill={C.tatami} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-60} y1={790} x2={W + 60} y2={790} stroke={C.tatamiEdge} strokeWidth={14} />
        <line x1={960} y1={790} x2={960} y2={1120} stroke={C.tatamiEdge} strokeWidth={14} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60} y1={820 + i * 26} x2={W + 60} y2={820 + i * 26} stroke={C.tatamiDark} strokeWidth={2} opacity={0.5} />)}
        {/* 吊り紐 */}
        <path d="M 300 136 L 330 210 M 980 136 L 950 210" stroke={KRP.ink} strokeWidth={5} />
        {/* 主役の装置 stage=4 */}
        <MeijiLock x={640} y={430} s={0.66} stage={4} t={seg(f, 10, 20)} f={f} />
        {/* 名札にかかる太い錠前 */}
        <g transform={`translate(${LX} ${LY - (1 - drop) * 420}) scale(0.78)`}>
          <path d={`M -44 ${-10 - (1 - close) * 40} L -44 ${-70 - (1 - close) * 40} Q -44 ${-128 - (1 - close) * 40} 0 ${-128 - (1 - close) * 40} Q 44 ${-128 - (1 - close) * 40} 44 ${-70 - (1 - close) * 40} L 44 -10`}
            fill="none" stroke={KRP.ink} strokeWidth={26} strokeLinecap="round" />
          <path d={`M -44 ${-10 - (1 - close) * 40} L -44 ${-70 - (1 - close) * 40} Q -44 ${-128 - (1 - close) * 40} 0 ${-128 - (1 - close) * 40} Q 44 ${-128 - (1 - close) * 40} 44 ${-70 - (1 - close) * 40} L 44 -10`}
            fill="none" stroke={NP.brassDark} strokeWidth={16} strokeLinecap="round" />
          <rect x={-78} y={-20} width={156} height={124} rx={20} fill={NP.brass} stroke={KRP.ink} strokeWidth={8} />
          <rect x={-62} y={-6} width={124} height={14} rx={6} fill={NP.glowCore} opacity={0.6} />
          <circle cx={0} cy={36} r={15} fill={KRP.ink} />
          <rect x={-6} y={40} width={12} height={34} fill={KRP.ink} />
        </g>
        {shock > 0 && shock < 1 && (
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={1 - shock}>
            <line x1={LX - 110} y1={LY - 40} x2={LX - 150} y2={LY - 80} /><line x1={LX + 110} y1={LY - 40} x2={LX + 150} y2={LY - 80} />
            <line x1={LX - 120} y1={LY + 50} x2={LX - 166} y2={LY + 60} /><line x1={LX + 120} y1={LY + 50} x2={LX + 166} y2={LY + 60} />
          </g>
        )}
        {/* 衣桁 (黒漆) */}
        <g>
          {[1290, 1710].map((ux) => (
            <g key={ux}>
              <rect x={ux - 16} y={250} width={32} height={570} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
              <rect x={ux - 70} y={810} width={140} height={28} rx={8} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
          <path d="M 1200 236 Q 1220 260 1250 258 L 1750 258 Q 1780 260 1800 236 L 1800 270 L 1200 270 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1274} y={420} width={452} height={22} fill={C.lacquer} stroke={KRP.ink} strokeWidth={4} />
          {[1290, 1710].map((ux) => <rect key={`g${ux}`} x={ux - 20} y={256} width={40} height={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />)}
          {/* 掛けた着物 */}
          <g transform={`rotate(${Math.sin(f / 16) * 1.2} 1500 264)`}>
            <path d="M 1240 270 L 1760 270 L 1740 380 L 1660 380 L 1650 700 L 1350 700 L 1340 380 L 1260 380 Z" fill={C.beni} stroke={KRP.ink} strokeWidth={5} />
            {[[1400, 500], [1560, 560], [1480, 640], [1620, 460]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={18} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
            ))}
            <path d="M 1450 270 L 1500 360 L 1550 270" fill="none" stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 衣桁に掛けた名札 (字は波線) */}
          {[1380, 1500, 1620].map((tx, i) => {
            const sw = Math.sin(f / 11 + i) * 4;
            return (
              <g key={i} transform={`rotate(${sw} ${tx} 270)`}>
                <line x1={tx} y1={270} x2={tx} y2={300} stroke={KRP.ink} strokeWidth={4} />
                <rect x={tx - 42} y={300} width={84} height={150} rx={10} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
                <path d={wavyV(tx, 320, 430, 6, 14)} stroke={NP.sumi} strokeWidth={6} fill="none" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
        {/* ×の板 */}
        {plank(p1, 42, "a")}
        {plank(p2, -42, "b")}
        {nail1 && [[1500, 530], [1268, 318], [1732, 742]].map(([nx, ny], i) => (
          <circle key={`n${i}`} cx={nx - 8} cy={ny} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {nail2 && [[1520, 540], [1732, 318], [1268, 742]].map(([nx, ny], i) => (
          <circle key={`m${i}`} cx={nx} cy={ny} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 金槌 (右上から伸びる役人の腕) */}
        {f >= 14 && f < 40 && (
          <g transform={`translate(1700 330) rotate(${hamA} 0 0)`}>
            <rect x={-30} y={-380} width={60} height={300} rx={18} fill={C.officer} stroke={KRP.ink} strokeWidth={5} transform="rotate(-40)" />
            <circle cx={60} cy={-80} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={50} y={-80} width={18} height={200} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} transform="rotate(-50 60 -80)" />
          </g>
        )}
        {/* 衣桁に手をのばして止まる女 */}
        <Person x={1110} y={860} s={0.85} f={f} phase={4} pose="point" pointDir={1} cloth={C.beni} clothDark={C.beniDark} hair="cap"
          face={f > 20 ? "surprised" : "normal"} gaze={[8, -2]} lean={f > 20 ? -6 : 4} />
        <NF1Bun x={1110} y={860} s={0.85} f={f} phase={4} lean={f > 20 ? -6 : 4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #122 そして明治8年。名字は、名乗ってもいいものから、名乗らなければならないものになります。
// 格: 山 / seed 4122
// 絵: ★`MeijiLock` (stage=5)。5段目の札「明治8年 義務」。1段目の「許可」の札が f でくるりと裏返り、「義務」の赤い札に変わる (許可→義務の入れ替わりを見せる)。最後の錠前がガチャン。役人が布告を読み上げる
// どこ: 役所の前庭。奥に煉瓦と白石の洋風庁舎、日の丸の旗竿。屋根つきの掲示台に MeijiLock、右の台の上で役人が布告を読み上げ、手前に庶民の後ろ頭
// 演出: 1段目の「許可」の札がくるりと裏返り、赤い「義務」に変わる。続いて最後の5段目「明治8年 義務」の錠前がガチャン。庶民がびくっと顔を上げる
// 動き: カメラは1段目の札に寄った所から (f0〜20) 全体へ引く (f20〜38)。裏返し f8〜22。最後の錠前 f24〜34。旗がはためく。役人の声の波が出る
const Nm122: React.FC<{ f: number }> = ({ f }) => {
  const e = easeInOut(seg(f, 20, 38));
  const z = lerp(1.35, 1.0, e);
  const flip = seg(f, 8, 22);
  const lockT = seg(f, 24, 34);
  const redFlash = seg(f, 15, 28);
  const startle = seg(f, 34, 40);
  const heads: [number, string, boolean][] = [
    [140, C.indigo, false], [300, C.beni, true], [470, C.ochre, false], [640, C.indigo, false], [810, C.beni, true],
    [980, C.ochre, false], [1150, C.indigo, false], [1320, C.beni, true],
  ];
  return (
    <Frame f={f} seed={4122}>
      <g transform={cam(405, 640, z)}>
        {/* 空 */}
        <rect x={-60} y={-60} width={W + 120} height={500} fill={C.sky} />
        {/* 奥の庁舎 */}
        <rect x={-60} y={190} width={W + 120} height={440} fill={C.brick} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-60} y={180} width={W + 120} height={26} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 760 180 L 960 90 L 1160 180 Z" fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={960} cy={146} r={22} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-60} y={400} width={W + 120} height={16} fill={C.stone} />
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i}>
            <path d={`M ${i * 160 - 20} 380 L ${i * 160 - 20} 270 Q ${i * 160 + 20} 230 ${i * 160 + 60} 270 L ${i * 160 + 60} 380 Z`} fill="#4E5A60" stroke={C.stone} strokeWidth={8} />
            <path d={`M ${i * 160 - 20} 600 L ${i * 160 - 20} 480 Q ${i * 160 + 20} 440 ${i * 160 + 60} 480 L ${i * 160 + 60} 600 Z`} fill="#4E5A60" stroke={C.stone} strokeWidth={8} />
          </g>
        ))}
        {/* 旗竿と日の丸 */}
        <rect x={1776} y={-20} width={12} height={640} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3} />
        <path d={`M 1788 10 Q 1850 ${-4 + Math.sin(f / 5) * 8} 1910 ${14 + Math.sin(f / 5 + 1) * 8} L 1910 ${120 + Math.sin(f / 5 + 1) * 8} Q 1850 ${100 + Math.sin(f / 5) * 8} 1788 116 Z`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1850} cy={64 + Math.sin(f / 5) * 6} r={28} fill={C.hinoRed} />
        {/* 前庭 (砂利) */}
        <rect x={-60} y={620} width={W + 120} height={520} fill={C.stone} />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={rnd(4122, i) * 1920} cy={640 + rnd(4123, i) * 420} r={4} fill={C.stoneDark} />
        ))}
        {/* 屋根つきの掲示台 */}
        <rect x={240} y={150} width={30} height={620} fill={C.woodWall} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1250} y={150} width={30} height={620} fill={C.woodWall} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 180 170 L 300 90 L 1220 90 L 1340 170 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={240 + i * 66} y1={98} x2={220 + i * 70} y2={166} stroke="#4A4048" strokeWidth={4} />)}
        <rect x={200} y={166} width={1120} height={14} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 1段目の赤い光 */}
        {redFlash > 0 && <circle cx={405} cy={640} r={150} fill={KRP.red} opacity={0.3 * Math.sin(redFlash * Math.PI)} />}
        {/* 主役の装置 stage=5・flip */}
        <MeijiLock x={760} y={440} s={0.74} stage={5} t={lockT} flip={flip} f={f} />
        {/* 裏返る勢いの線 */}
        {flip > 0.1 && flip < 0.9 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d="M 300 590 q -30 50 0 100" /><path d="M 510 590 q 30 50 0 100" />
          </g>
        )}
        {/* 柵 */}
        <rect x={200} y={760} width={1120} height={14} fill={C.woodWall} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 15 }, (_, i) => <rect key={i} x={210 + i * 76} y={730} width={10} height={60} fill={C.woodWall} stroke={KRP.ink} strokeWidth={2} />)}
        {/* 読み上げの台と役人 */}
        <rect x={1410} y={766} width={380} height={24} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1424} y={790} width={352} height={120} fill={C.woodWall} stroke={KRP.ink} strokeWidth={5} />
        <Person x={1600} y={770} s={1.0} f={f} phase={3} pose="hold" cloth={C.officer} clothDark={C.officerDark} face={f > 24 ? "angry" : "normal"} gaze={[-4, 4]} />
        <NF1Kepi x={1600} y={770} s={1.0} f={f} phase={3} />
        {/* 布告の巻物 (手から下がる) */}
        <g transform={`translate(1600 ${652 + pbob(f, 3)})`}>
          <rect x={-120} y={-12} width={240} height={22} rx={10} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-104} y={10} width={208} height={150 + Math.sin(f / 12) * 4} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
          {[70, 40, 10, -20, -50, -80].map((lx) => <path key={lx} d={wavyV(lx, 26, 140, 3, 10)} stroke={NP.sumi} strokeWidth={3} fill="none" />)}
          <rect x={-114} y={156 + Math.sin(f / 12) * 4} width={228} height={20} rx={9} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-14} cy={0} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={14} cy={0} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 声の波 */}
        {[0, 1, 2].map((i) => {
          const k = ((f + i * 8) % 24) / 24;
          return <path key={i} d={`M ${1530 - k * 90} ${560 - 30 - k * 20} q ${-20 - k * 10} ${30 + k * 20} 0 ${60 + k * 40}`} stroke={KRP.ink} strokeWidth={5} fill="none" opacity={(1 - k) * 0.8} strokeLinecap="round" />;
        })}
        {/* 手前の庶民の後ろ頭 */}
        {heads.map(([hx, col, woman], i) => {
          const lift = startle * (i % 2 ? 22 : 14);
          return (
            <g key={i} transform={`translate(${hx} ${1000 - lift + Math.sin(f / 13 + i) * 2}) scale(0.82)`}>
              <path d="M -110 160 Q -110 40 0 40 Q 110 40 110 160 Z" fill={col} stroke={KRP.ink} strokeWidth={5} />
              <path d="M -30 46 L 0 100 L 30 46" fill="none" stroke={KRP.white} strokeWidth={6} />
              <circle cx={0} cy={-20} r={62} fill={KRP.ink} />
              <ellipse cx={-62} cy={-12} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <ellipse cx={62} cy={-12} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              {woman ? <ellipse cx={0} cy={-84} rx={44} ry={24} fill={KRP.ink} /> : <rect x={-8} y={-96} width={16} height={30} rx={6} fill={KRP.ink} />}
              {woman && <line x1={-56} y1={-80} x2={56} y2={-96} stroke={NP.brass} strokeWidth={5} />}
            </g>
          );
        })}
        {startle > 0 && [300, 810, 1150].map((ex, i) => (
          <text key={i} x={ex + 60} y={830 - startle * 20} fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} paintOrder="stroke" opacity={startle}>!</text>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #123 先祖の名字がわからない人は、新しくつくれ、とまで命じられました。
// 格: 山 / seed 4123
// 絵: 村の寺の本堂 (または庄屋の家)。名字のない村人たちが列をつくり、住職 (または庄屋) が筆で新しい名字の札を書いて渡していく (f)。札には地名や木の名前を思わせる一般的な字 (「森」「川」「田」など1字だけ・**実在の家の名字の一覧にはしない**)。札「明治8年」
// どこ: 村の寺の本堂。奥に金の天蓋と閉じた厨子・ろうそく、太い柱と梁、畳。住職が文机で名字の札を書く
// 演出: 名字のない村人が列をつくる。住職が書いた「田」の札が先頭の男の手へ渡り、男が大喜びで掲げる。住職は次の札に「川」を一画ずつ書く。先に「森」をもらった女は左へ帰っていく
// 動き: 札が机から男の手へ弧を描いて飛ぶ (f6〜16)。男の顔が喜びに。筆が「川」を3画で書く (f20〜39)。列の人がのぞきこむ。ろうそくがゆらぐ。カメラは右から左へ
const Nm123: React.FC<{ f: number }> = ({ f }) => {
  const dx = lerp(-36, 10, easeInOut(seg(f, 0, 42)));
  const give = easeInOut(seg(f, 6, 16));
  const got = f >= 16;
  const st = [seg(f, 20, 26), seg(f, 27, 32), seg(f, 33, 39)];
  const fl = Math.sin(f / 2.2) * 0.1;
  const PX = 560, PY = 850; // 住職の足元 (机に隠れる)
  // 筆先: いま書いている画
  const strokes: [number, number, number, number][] = [[-20, -50, -28, 36], [0, -56, 0, 30], [22, -56, 24, 54]];
  const curS = st.findIndex((v) => v < 1);
  const ci = curS < 0 ? 2 : curS;
  const [sx1, sy1, sx2, sy2] = strokes[ci];
  const TX = 730, TY = 700; // 書いている札の中心
  const tipX = TX + lerp(sx1, sx2, st[ci]), tipY = TY + lerp(sy1, sy2, st[ci]);
  const handFrom: [number, number] = [700, 690], handTo: [number, number] = [1050, 590];
  const fx = lerp(handFrom[0], handTo[0], give), fy = lerp(handFrom[1], handTo[1], give) - Math.sin(give * Math.PI) * 120;
  const leftX = lerp(250, 190, seg(f, 0, 42));
  return (
    <Frame f={f} seed={4123}>
      <g transform={cam(960, 540, 1.04, dx)}>
        {/* 本堂の奥 */}
        <rect x={-60} y={-60} width={W + 120} height={820} fill={C.woodWallDark} />
        <rect x={-60} y={-60} width={W + 120} height={140} fill={C.lacquer} />
        <rect x={-60} y={70} width={W + 120} height={30} fill={C.woodWall} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200 + 60} y={70} width={30} height={30} fill={C.gold} stroke={KRP.ink} strokeWidth={2} />)}
        {/* 須弥壇・厨子・天蓋 */}
        <rect x={700} y={460} width={520} height={110} fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
        <rect x={700} y={460} width={520} height={18} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
        <path d="M 820 460 L 820 250 L 960 190 L 1100 250 L 1100 460 Z" fill={C.lacquer} stroke={KRP.ink} strokeWidth={5} />
        <rect x={836} y={262} width={124} height={190} fill={C.beniDark} stroke={C.gold} strokeWidth={5} />
        <rect x={960} y={262} width={124} height={190} fill={C.kakishibu} stroke={C.gold} strokeWidth={5} />
        <circle cx={950} cy={360} r={8} fill={C.gold} /><circle cx={970} cy={360} r={8} fill={C.gold} />
        <path d="M 760 120 L 1160 120 L 1120 170 L 800 170 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={810 + i * 38} y1={170} x2={810 + i * 38 + Math.sin(f / 15 + i) * 3} y2={210 + (i % 2) * 20} stroke={C.gold} strokeWidth={5} />
        ))}
        {/* ろうそく */}
        {[760, 1160].map((cx, i) => (
          <g key={cx}>
            <circle cx={cx} cy={370} r={60} fill={NP.glow} opacity={0.25 + fl} />
            <rect x={cx - 26} y={440} width={52} height={20} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
            <rect x={cx - 10} y={384} width={20} height={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${cx} ${384} q ${-9 + Math.sin(f / 3 + i) * 3} -18 0 ${-34 - fl * 20} q 9 16 0 34`} fill={C.flame} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ))}
        {/* 香炉の煙 */}
        <path d={`M 960 455 q ${Math.sin(f / 10) * 20} -40 0 -80 q ${-Math.sin(f / 10) * 20} -40 10 -80`} stroke={KRP.gray} strokeWidth={5} fill="none" opacity={0.6} />
        <path d="M 930 460 L 990 460 L 980 440 L 940 440 Z" fill={C.goldDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 吊り灯籠 */}
        {[420, 1500].map((lx, i) => (
          <g key={lx} transform={`rotate(${Math.sin(f / 18 + i) * 2} ${lx} 100)`}>
            <line x1={lx} y1={100} x2={lx} y2={200} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 40} 200 L ${lx + 40} 200 L ${lx + 30} 300 L ${lx - 30} 300 Z`} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
            <rect x={lx - 22} y={220} width={44} height={60} fill={NP.glowCore} opacity={0.8} />
          </g>
        ))}
        {/* 柱 */}
        <rect x={40} y={-60} width={90} height={1200} fill={C.woodWall} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1790} y={-60} width={90} height={1200} fill={C.woodWall} stroke={KRP.ink} strokeWidth={6} />
        {/* 畳 */}
        <rect x={-60} y={740} width={W + 120} height={400} fill={C.tatami} stroke={KRP.ink} strokeWidth={5} />
        {[-60, 500, 1060, 1620].map((x) => <rect key={x} x={x} y={740} width={560} height={400} fill="none" stroke={C.tatamiEdge} strokeWidth={10} />)}
        {/* 先に「森」をもらって帰る女 */}
        <Person x={leftX} y={880} s={0.88} f={f} phase={6} pose="raise" cloth={C.beni} clothDark={C.beniDark} hair="cap" face="joy" />
        <NF1Bun x={leftX} y={880} s={0.88} f={f} phase={6} />
        <g transform={`translate(${leftX + 59} ${880 - 202 + pbob(f, 6) - 100})`}>
          <rect x={-34} y={-60} width={68} height={120} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={NP.sumi}>森</text>
        </g>
        {/* 住職 */}
        <Person x={PX} y={PY} s={1.0} f={f} phase={1} pose="hold" cloth={C.robe} clothDark={C.robeDark} hair="none" face="smile" gaze={[5, 3]} />
        <g transform={`translate(${PX} ${PY + pbob(f, 1)})`}>
          <polygon points="-58,-160 -30,-160 58,-72 58,-52 44,-52" fill={C.kesa} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={30} cy={-100} r={8} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 文机 */}
        <rect x={360} y={790} width={480} height={22} rx={4} fill={C.woodWall} stroke={KRP.ink} strokeWidth={5} />
        <rect x={380} y={812} width={440} height={90} fill={C.woodWallDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={400} y={774} width={90} height={16} rx={3} fill={KRP.ink} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={430 + i * 2} y={760 - i * 6} width={70} height={12} fill={NP.wood} stroke={KRP.ink} strokeWidth={2} />)}
        {/* 書いている札 (札立て) */}
        <rect x={TX - 50} y={782} width={100} height={10} fill={C.woodWall} stroke={KRP.ink} strokeWidth={3} />
        <rect x={TX - 40} y={TY - 80} width={80} height={160} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
        {strokes.map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M ${TX + x1} ${TY + y1} L ${TX + x2} ${TY + y2}`} stroke={NP.sumi} strokeWidth={i === 2 ? 11 : 9} strokeLinecap="round"
            pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - st[i]} />
        ))}
        {/* 住職の筆の腕 */}
        <path d={`M ${PX + 50} ${PY - 140} Q ${PX + 110} ${PY - 120} ${tipX - 6} ${tipY + 40}`} stroke={KRP.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d={`M ${PX + 50} ${PY - 140} Q ${PX + 110} ${PY - 120} ${tipX - 6} ${tipY + 40}`} stroke={C.robe} strokeWidth={21} fill="none" strokeLinecap="round" />
        <line x1={tipX - 4} y1={tipY + 40} x2={tipX} y2={tipY} stroke={C.woodLight} strokeWidth={8} strokeLinecap="round" />
        <circle cx={tipX - 4} cy={tipY + 42} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 列の村人 */}
        <Person x={980} y={880} s={0.95} f={f} phase={2} pose={got ? "raise" : "stand"} cloth={C.indigo} clothDark={C.indigoDark} hair="cap"
          face={got ? "joy" : "surprised"} gaze={[-6, -3]} />
        <Person x={1220} y={880} s={0.92} f={f} phase={3} cloth={C.beni} clothDark={C.beniDark} hair="cap" face="worried" gaze={[-7, 0]} lean={-4} />
        <NF1Bun x={1220} y={880} s={0.92} f={f} phase={3} lean={-4} />
        <Person x={1440} y={880} s={0.9} f={f} phase={4} cloth={C.ochre} clothDark={C.ochreDark} hair="cap" face="normal" gaze={[-8, 0]} lean={-8} />
        <Person x={1650} y={880} s={0.88} f={f} phase={5} cloth={C.indigo} clothDark={C.indigoDark} hair="none" face="smile" gaze={[-6, 0]} lean={-3} />
        <path d="M 1730 880 L 1716 700" stroke={C.woodWall} strokeWidth={10} strokeLinecap="round" />
        <circle cx={1712} cy={780} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 飛んでいく「田」の札 */}
        <g transform={`translate(${fx} ${fy}) rotate(${got ? 6 : give * 360})`}>
          <rect x={-34} y={-60} width={68} height={120} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={NP.sumi}>田</text>
        </g>
        {got && f < 30 && (
          <g stroke={NP.glow} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 16, 30)}>
            {[0, 1, 2, 3, 4, 5].map((j) => {
              const a = (j / 6) * Math.PI * 2;
              return <line key={j} x1={handTo[0] + Math.cos(a) * 80} y1={handTo[1] + Math.sin(a) * 80} x2={handTo[0] + Math.cos(a) * 110} y2={handTo[1] + Math.sin(a) * 110} />;
            })}
          </g>
        )}
      </g>
      <TagPlate x={1640} y={150} text="明治8年" size={40} fill={C.washi} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_114: (f) => <Nm114 f={f} />,
  nm_115: (f) => <Nm115 f={f} />,
  nm_116: (f) => <Nm116 f={f} />,
  nm_117: (f) => <Nm117 f={f} />,
  nm_118: (f) => <Nm118 f={f} />,
  nm_119: (f) => <Nm119 f={f} />,
  nm_120: (f) => <Nm120 f={f} />,
  nm_121: (f) => <Nm121 f={f} />,
  nm_122: (f) => <Nm122 f={f} />,
  nm_123: (f) => <Nm123 f={f} />,
};

export const NM_F1_MOTIFS: string[] = [
  "nm_114", // #114
  "nm_115", // #115
  "nm_116", // #116
  "nm_117", // #117
  "nm_118", // #118
  "nm_119", // #119
  "nm_120", // #120
  "nm_121", // #121
  "nm_122", // #122
  "nm_123", // #123
];

export const namaeF1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
