// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#19〜#26 (8文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで8枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  // #19 夜の部屋
  nightWall: "#4B5677", nightWallDark: "#3A4462", nightWains: "#5E4A3A", nightFloor: "#7A5D42", nightFloorDark: "#5E4632",
  // #20 映画館と書庫
  cineWall: "#5A2E36", cineWallDark: "#43222A", seat: "#B8423A", seatDark: "#8A2E28", screenGlow: "#DCE6F0",
  steel: "#8C97A3", steelDark: "#66717D", exitGreen: "#2F9E5C",
  libBack: "#3A2C22", libShelf: "#6B4A30", libShelfDark: "#4E3522", libFloor: "#5A4434", libCeil: "#2A201A",
  book1: "#A8483C", book2: "#3F6E8C", book3: "#6E8A4A", book4: "#C99A3E", book5: "#7A4E7A", book6: "#D8C8A0",
  caution: "#F2C230",
  // #21 絵本
  tableWood: "#8A6040", tableWoodDark: "#6E4A30", cover: "#7E2E2A", coverDark: "#5E201C", page: "#F4EAD2", pageShade: "#E2D3B2",
  nightSky: "#2E3E66", nightSky2: "#44558A", forest: "#2F4A3A", forestDark: "#22362B", gnome: "#2A2436", fire: "#F08A2E", fireCore: "#FFE07A",
  // #22 木簡
  deskDark: "#4A3424", deskDarkLine: "#3A281B", mokkan: "#E0C79A", mokkanDark: "#C2A472", shu: "#D9402E", shuDark: "#A82E20",
  kanmuri: "#24201E", sleeve: "#4A4E86", sleeveDark: "#363A6A", inkstone: "#3A3A40",
  // #23 明治の役所
  plaster: "#EFE4CC", plasterShade: "#E0D2B4", wains: "#7A5232", meijiDesk: "#8A5A34", meijiDeskDark: "#6A4226",
  ledger: "#C9A46A", ledgerDark: "#A9844C", ledgerPage: "#F3EAD2", dusk: "#5A6E9A", duskLow: "#C9897A", brick: "#8E5040",
  // #24 現代の玄関
  siding: "#E4E6E2", sidingLine: "#C9CCC6", doorWood: "#9A6A44", doorWoodDark: "#7A5034", postBox: "#5E6670", postBoxDark: "#454C55",
  envelope: "#C9A26A", envelopeDark: "#A8844E", tile: "#B9AFA2", tileLine: "#9A9084", leaf: "#4E8E4A", leafDark: "#3A6E38", pot: "#C9764A",
  rubyPink: "#FBE3E3",
  // #25 からくり工房
  pegboard: "#C9A97E", pegHole: "#9A7A52", bench: "#A0703E", benchDark: "#7A5230", boxWood: "#B5824A", boxWoodDark: "#8A5E32",
  // #26 古地図
  parch: "#EAD9B0", parchDark: "#D2BC8A", sea: "#BFD0C0", land: "#E8D49A", landDe: "#F2C98A", mapInk: "#7A5A3A",
  stone: "#B8AEA0", roof: "#B8523A", timber: "#5A3A24", pine: "#4E7A48", pineDark: "#36583A",
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

// カメラ: (cx,cy) を中心に z 倍
const cam = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;

// 歯車の輪郭
const gearPath = (n: number, ro: number, ri: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / n * 0.25;
    const a2 = a0 + (Math.PI * 2) / n * 0.5;
    const a3 = a0 + (Math.PI * 2) / n * 0.75;
    pts.push(`${(Math.cos(a0) * ri).toFixed(1)},${(Math.sin(a0) * ri).toFixed(1)}`);
    pts.push(`${(Math.cos(a1) * ro).toFixed(1)},${(Math.sin(a1) * ro).toFixed(1)}`);
    pts.push(`${(Math.cos(a2) * ro).toFixed(1)},${(Math.sin(a2) * ro).toFixed(1)}`);
    pts.push(`${(Math.cos(a3) * ri).toFixed(1)},${(Math.sin(a3) * ri).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};
const NAcGear: React.FC<{ x: number; y: number; r: number; n: number; rot: number; fill?: string }> = ({ x, y, r, n, rot, fill = NP.brass }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={gearPath(n, r, r * 0.82)} fill={fill} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle r={r * 0.55} fill="none" stroke={NP.brassDark} strokeWidth={5} />
    {[0, 1, 2, 3].map((k) => (
      <line key={k} x1={0} y1={0} x2={Math.cos((k * Math.PI) / 2) * r * 0.55} y2={Math.sin((k * Math.PI) / 2) * r * 0.55} stroke={NP.brassDark} strokeWidth={6} />
    ))}
    <circle r={r * 0.16} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// 黄色い「注意」の三角札
const NAcCaution: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({ x, y, s = 1, t = 1, rot = 0 }) => {
  const p = pop(clamp01(t));
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * p})`}>
      <rect x={-5} y={-8} width={10} height={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
      <path d="M 0 -96 L 52 -8 L -52 -8 Z" fill={C.caution} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 0 -80 L 40 -16 L -40 -16 Z" fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
      <rect x={-5} y={-66} width={10} height={30} rx={4} fill={KRP.ink} />
      <circle cx={0} cy={-26} r={6} fill={KRP.ink} />
    </g>
  );
};

// 鎖 (p1→p2、t で伸びる)
const NAcChain: React.FC<{ p1: [number, number]; p2: [number, number]; t?: number; link?: number }> = ({ p1, p2, t = 1, link = 30 }) => {
  const [x1, y1] = p1; const [x2, y2] = p2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.floor((len / link) * clamp01(t));
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / (len / link);
        const cx = lerp(x1, x2, u); const cy = lerp(y1, y2, u);
        const flat = i % 2 === 0;
        return (
          <ellipse key={i} cx={cx} cy={cy} rx={link * 0.62} ry={flat ? link * 0.34 : link * 0.12}
            transform={`rotate(${ang} ${cx} ${cy})`} fill="none" stroke={KRP.ink} strokeWidth={flat ? 11 : 9} />
        );
      })}
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / (len / link);
        const cx = lerp(x1, x2, u); const cy = lerp(y1, y2, u);
        const flat = i % 2 === 0;
        return (
          <ellipse key={"b" + i} cx={cx} cy={cy} rx={link * 0.62} ry={flat ? link * 0.34 : link * 0.12}
            transform={`rotate(${ang} ${cx} ${cy})`} fill="none" stroke={flat ? NP.brass : NP.brassDark} strokeWidth={flat ? 5 : 4} />
        );
      })}
    </g>
  );
};

// 真鍮の錠前 (close 0→1 でU字がはまる)
const NAcPadlock: React.FC<{ x: number; y: number; s?: number; close?: number }> = ({ x, y, s = 1, close = 1 }) => {
  const up = (1 - clamp01(close)) * 34;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -38 ${-20 - up} L -38 ${-62 - up} Q -38 ${-108 - up} 0 ${-108 - up} Q 38 ${-108 - up} 38 ${-62 - up} L 38 -20`}
        fill="none" stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
      <path d={`M -38 ${-20 - up} L -38 ${-62 - up} Q -38 ${-108 - up} 0 ${-108 - up} Q 38 ${-108 - up} 38 ${-62 - up} L 38 -20`}
        fill="none" stroke="#C9CFD4" strokeWidth={12} strokeLinecap="round" />
      <rect x={-64} y={-34} width={128} height={104} rx={16} fill={NP.brass} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-56} y={-26} width={112} height={18} rx={8} fill={NP.glowCore} opacity={0.45} />
      <path d="M -64 50 L 64 50" stroke={NP.brassDark} strokeWidth={6} />
      <circle cx={0} cy={12} r={13} fill={KRP.ink} />
      <path d="M -6 16 L 6 16 L 9 44 L -9 44 Z" fill={KRP.ink} />
      {[-48, 48].map((rx) => <circle key={rx} cx={rx} cy={-18} r={5} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={2} />)}
    </g>
  );
};

// 飛び出す絵本の木 / 家
const NAcPine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-9} y={-30} width={18} height={30} fill={C.timber} stroke={KRP.ink} strokeWidth={4} />
    {[0, 1, 2].map((k) => (
      <path key={k} d={`M 0 ${-150 + k * 36} L ${44 + k * 10} ${-74 + k * 26} L ${-44 - k * 10} ${-74 + k * 26} Z`}
        fill={k % 2 ? C.pineDark : C.pine} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    ))}
  </g>
);
const NAcHouse: React.FC<{ x: number; y: number; s?: number; w?: number; h?: number; tower?: boolean }> = ({ x, y, s = 1, w = 90, h = 90, tower = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {tower && (
      <g>
        <rect x={-22} y={-h - 120} width={44} height={120} fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={`M -28 ${-h - 120} L 0 ${-h - 200} L 28 ${-h - 120} Z`} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-8} y={-h - 96} width={16} height={26} rx={8} fill={KRP.ink} />
      </g>
    )}
    <rect x={-w / 2} y={-h} width={w} height={h} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 木組み */}
    <g stroke={C.timber} strokeWidth={6}>
      <line x1={-w / 2} y1={-h / 2} x2={w / 2} y2={-h / 2} />
      <line x1={0} y1={-h} x2={0} y2={0} />
      <line x1={-w / 2} y1={-h} x2={0} y2={-h / 2} />
      <line x1={w / 2} y1={-h} x2={0} y2={-h / 2} />
    </g>
    <rect x={-w / 4 - 9} y={-h / 2 + 12} width={18} height={22} fill={NP.glow} stroke={KRP.ink} strokeWidth={3} />
    <rect x={w / 4 - 9} y={-h / 2 + 12} width={18} height={22} fill={NP.glow} stroke={KRP.ink} strokeWidth={3} />
    <path d={`M ${-w / 2 - 10} ${-h} L 0 ${-h - w * 0.62} L ${w / 2 + 10} ${-h} Z`} fill={C.roof} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #19 本当に、名前を奪われると、そうなるのでしょうか。
// 格: 並 / seed 4019
// 絵: #18 の Person が名札を見つめる。名札の後ろに #15 の2つの光の窓が小さく浮かぶ。QMark がぽん
// どこ: 夜の部屋 (縦板の壁・腰板・床板)。天井から吊りランプ、天井から紐で名札が下がる
// 演出: 腕組みの人が首をかしげて名札をのぞきこむ。名札の後ろで2つの光の窓が順に灯り、人の頭上に？
// 動き: カメラがゆっくり名札へ寄る / 窓が f6・f12 で灯ってふわふわ浮く / 人が前に傾く / ランプの光がゆらぐ / f24〜 ？がぽん
const Nm019: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.06, easeInOut(seg(f, 0, 42)));
  const w1 = seg(f, 6, 14);
  const w2 = seg(f, 12, 20);
  const q = seg(f, 24, 32);
  const lean = lerp(0, 6, easeOut(seg(f, 4, 30)));
  const flick = 0.8 + Math.sin(f / 3.3) * 0.06 + Math.sin(f / 1.7) * 0.03;
  const win = (cx: number, cy: number, t: number, warm: boolean, ph: number) => {
    if (t <= 0) return null;
    const bob = Math.sin((f + ph) / 10) * 8;
    return (
      <g transform={`translate(${cx} ${cy + bob}) scale(${0.6 + 0.4 * easeOut(t)})`} opacity={t}>
        <circle r={130} fill={warm ? NP.glow : KRP.blueSoft} opacity={0.22} />
        <circle r={95} fill={warm ? NP.glow : KRP.blueSoft} opacity={0.22} />
        <rect x={-70} y={-88} width={140} height={176} rx={8} fill={warm ? NP.glowCore : KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={-78} width={120} height={156} rx={4} fill={warm ? NP.glow : KRP.blueSoft} opacity={0.75} />
        <line x1={0} y1={-88} x2={0} y2={88} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-70} y1={0} x2={70} y2={0} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-82} y={86} width={164} height={14} rx={4} fill={C.nightWains} stroke={KRP.ink} strokeWidth={4} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={4019} bg={C.nightWall} dark>
      <g transform={cam(1000, 480, z)}>
        {/* 縦板の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.nightWall} />
        {Array.from({ length: 15 }, (_, i) => (
          <line key={i} x1={i * 140 - 20} y1={-60} x2={i * 140 - 20} y2={660} stroke={C.nightWallDark} strokeWidth={4} opacity={0.7} />
        ))}
        {/* 天井の梁 */}
        <rect x={-60} y={-60} width={W + 120} height={92} fill={C.nightWains} stroke={KRP.ink} strokeWidth={6} />
        {/* 腰板 */}
        <rect x={-60} y={640} width={W + 120} height={150} fill={C.nightWains} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={i * 230 - 10} y={664} width={190} height={100} rx={6} fill="none" stroke={C.nightFloorDark} strokeWidth={4} />
        ))}
        {/* 床板 */}
        <rect x={-60} y={790} width={W + 120} height={360} fill={C.nightFloor} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 4 }, (_, i) => (
          <line key={i} x1={-60} y1={830 + i * 70} x2={W + 60} y2={830 + i * 70} stroke={C.nightFloorDark} strokeWidth={4} />
        ))}
        {/* 吊りランプと光の円錐 */}
        <path d={`M 560 150 L 300 ${H + 40} L 900 ${H + 40} L 660 150 Z`} fill={NP.glow} opacity={0.13 * flick} />
        <ellipse cx={600} cy={905} rx={300} ry={50} fill={NP.glow} opacity={0.22 * flick} />
        <line x1={610} y1={32} x2={610} y2={110} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 540 160 L 570 108 L 650 108 L 680 160 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={610} cy={162} r={18} fill={NP.glowCore} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={610} cy={162} r={44} fill={NP.glow} opacity={0.35 * flick} />
        {/* ホコリ (光の中) */}
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={460 + rnd(4019, i) * 300 + Math.sin((f + i * 9) / 12) * 14}
            cy={260 + rnd(4019, i + 20) * 420 - ((f * 0.8 + i * 30) % 60)} r={3 + rnd(4019, i + 40) * 3}
            fill={NP.glowCore} opacity={0.6} />
        ))}
        {/* 2つの光の窓 (#15)。名札の後ろに小さく浮かぶ */}
        {win(1085, 250, w1, true, 0)}
        {win(1400, 250, w2, false, 17)}
        {/* 名札を吊る紐 */}
        <line x1={1240} y1={32} x2={1240} y2={303} stroke={KRP.ink} strokeWidth={5} />
        <Nafuda x={1240} y={470} s={1.1} text="山田 花子" f={f} />
        {/* 名札の影 (壁に) */}
        {/* 人の影と人 */}
        <ellipse cx={610} cy={908} rx={150} ry={24} fill={KRP.ink} opacity={0.25} />
        <Person x={600} y={905} s={1.55} f={f} face="worried" gaze={[1, -0.6]} pose="armsFolded" lean={lean} />
        {/* ？ */}
        <QMark x={900} y={360} s={1.25} f={f} t={q} />
        {/* 小さな考え中の点々 */}
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={790 + k * 34} cy={420 - k * 22} r={8 + k * 3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
            opacity={seg(f, 16 + k * 3, 20 + k * 3)} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #20 映画の外で調べてみると、名前の歴史は、なかなか物騒でした。
// 格: 山 / seed 4020
// 絵: 映画館の非常口がひらき、外の古い図書館の書庫へ。懐中電灯で照らすと本棚の上に「注意」の三角札
// どこ: 暗い映画館の横壁 (スクリーンの照り返し・赤い座席の背) → 鉄の非常口の向こうに本棚の迷路
// 演出: 人が懐中電灯を書庫へ向ける。光の中に黄色い注意札が次々と立つ (物騒だけどユーモラス)
// 動き: 扉がひらく f2〜16 / カメラが扉へ前進 / 光が f10 で灯る / 注意札が f18・23・28・33 でぽん、ゆらゆら
const NAcShelfSide: React.FC<{ xn: number; xf: number; tn: number; tf: number; bn: number; bf: number; sd: number }> = ({ xn, xf, tn, tf, bn, bf, sd }) => {
  const N = 9;
  const us = Array.from({ length: N + 1 }, (_, k) => (1 - Math.pow(0.78, k)) / (1 - Math.pow(0.78, N)));
  const books = [C.book1, C.book2, C.book3, C.book4, C.book5, C.book6];
  const L = 4;
  return (
    <g>
      <path d={`M ${xn} ${tn} L ${xf} ${tf} L ${xf} ${bf} L ${xn} ${bn} Z`} fill={C.libShelfDark} stroke={KRP.ink} strokeWidth={5} />
      {us.slice(0, N).map((ua, k) => {
        const ub = us[k + 1];
        const xa = lerp(xn, xf, ua), xb = lerp(xn, xf, ub);
        const ta = lerp(tn, tf, ua), tb = lerp(tn, tf, ub);
        const ba = lerp(bn, bf, ua), bb = lerp(bn, bf, ub);
        return (
          <g key={k}>
            {Array.from({ length: L }, (_, j) => {
              const ya1 = lerp(ta, ba, j / L), yb1 = lerp(tb, bb, j / L);
              const ya2 = lerp(ta, ba, (j + 1) / L), yb2 = lerp(tb, bb, (j + 1) / L);
              const gap = 0.12 + rnd(sd + k, j) * 0.25;
              const col = books[Math.floor(rnd(sd + j, k) * books.length)];
              const missing = rnd(sd * 3 + k, j) < 0.12;
              return (
                <g key={j}>
                  {!missing && (
                    <path d={`M ${xa} ${lerp(ya1, ya2, gap)} L ${xb} ${lerp(yb1, yb2, gap)} L ${xb} ${yb2} L ${xa} ${ya2} Z`}
                      fill={col} stroke={KRP.ink} strokeWidth={3} />
                  )}
                  <line x1={xa} y1={ya2} x2={xb} y2={yb2} stroke={C.libShelf} strokeWidth={6} />
                </g>
              );
            })}
          </g>
        );
      })}
      <line x1={xn} y1={tn} x2={xf} y2={tf} stroke={C.libShelf} strokeWidth={9} />
    </g>
  );
};
const Nm020: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 2, 16));
  const z = lerp(1, 1.1, easeInOut(seg(f, 0, 42)));
  const light = seg(f, 10, 13);
  const flick = 0.9 + Math.sin(f / 2.1) * 0.05;
  const fx = lerp(700, 1480, open);
  const fTop = 170 - 70 * open, fBot = 880 + 50 * open;
  return (
    <Frame f={f} seed={4020} bg={C.cineWall} dark>
      <defs>
        <clipPath id="nac020door"><rect x={700} y={170} width={600} height={710} /></clipPath>
      </defs>
      <g transform={cam(1000, 520, z)}>
        {/* 映画館の横壁 (吸音パネル) */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.cineWall} />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={i * 130 - 60} y={-80} width={110} height={830} rx={10} fill={C.cineWallDark} opacity={0.5} />
        ))}
        {/* 左: スクリーンの照り返し */}
        <path d="M -80 60 L 190 110 L 190 560 L -80 620 Z" fill={C.screenGlow} opacity={0.85} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 190 110 L 640 320 L 640 900 L 190 560 Z" fill={C.screenGlow} opacity={0.1} />
        {/* 床 */}
        <rect x={-80} y={880} width={W + 160} height={300} fill={C.cineWallDark} />
        {/* 書庫 (扉の向こう) */}
        <g clipPath="url(#nac020door)">
          <rect x={700} y={170} width={600} height={710} fill={C.libBack} />
          <path d="M 700 170 L 1300 170 L 1100 360 L 900 360 Z" fill={C.libCeil} />
          <path d="M 700 880 L 1300 880 L 1100 600 L 900 600 Z" fill={C.libFloor} />
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={lerp(700, 900, i / 4) + 0} y1={lerp(880, 600, i / 4)} x2={lerp(1300, 1100, i / 4)} y2={lerp(880, 600, i / 4)} stroke={C.libShelfDark} strokeWidth={3} />
          ))}
          {/* 奥の棚 (迷路の突き当たり。左へ曲がる通路) */}
          <rect x={940} y={380} width={190} height={220} fill={C.libShelfDark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 4 }, (_, j) => (
            <g key={j}>
              {Array.from({ length: 11 }, (_, k) => (
                <rect key={k} x={946 + k * 16.5} y={386 + j * 54 + rnd(4020, j * 11 + k) * 14} width={14}
                  height={46 - rnd(4020, j * 11 + k) * 14} fill={[C.book1, C.book2, C.book3, C.book4, C.book6][(j + k * 3) % 5]} stroke={KRP.ink} strokeWidth={2} />
              ))}
              <line x1={940} y1={434 + j * 54} x2={1130} y2={434 + j * 54} stroke={C.libShelf} strokeWidth={5} />
            </g>
          ))}
          <rect x={900} y={360} width={40} height={240} fill={KRP.ink} opacity={0.75} />
          <TagPlate x={985} y={330} text="書庫" size={28} t={seg(f, 12, 18)} />
          <NAcShelfSide xn={700} xf={900} tn={250} tf={370} bn={880} bf={600} sd={11} />
          <NAcShelfSide xn={1300} xf={1100} tn={250} tf={370} bn={880} bf={600} sd={23} />
          {/* 光の届かない所を暗く */}
          <rect x={700} y={170} width={600} height={710} fill={KRP.ink} opacity={0.42 * (1 - light * 0.55)} />
          {/* 注意札 (棚の上) */}
          <NAcCaution x={765} y={290} s={0.95} t={seg(f, 18, 25)} rot={Math.sin(f / 11) * 4} />
          <NAcCaution x={1240} y={286} s={0.9} t={seg(f, 23, 30)} rot={-8 + Math.sin(f / 9) * 5} />
          <NAcCaution x={1105} y={380} s={0.55} t={seg(f, 28, 35)} rot={Math.sin(f / 7) * 3} />
          <NAcCaution x={855} y={344} s={0.62} t={seg(f, 33, 40)} rot={14 + Math.sin(f / 8) * 6} />
          {/* クモの巣 */}
          <g stroke={KRP.white} strokeWidth={2} opacity={0.5} fill="none">
            <path d="M 1300 170 L 1220 250 M 1300 210 Q 1260 220 1250 170 M 1300 240 Q 1240 250 1225 170" />
          </g>
        </g>
        {/* 鉄の扉枠 */}
        <rect x={684} y={154} width={632} height={734} fill="none" stroke={C.steelDark} strokeWidth={26} />
        <rect x={672} y={142} width={656} height={758} fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* 非常口の標識 */}
        <rect x={880} y={50} width={240} height={78} rx={8} fill={C.exitGreen} stroke={KRP.ink} strokeWidth={5} />
        <rect x={870} y={40} width={260} height={98} rx={12} fill={C.exitGreen} opacity={0.3} />
        <rect x={1040} y={62} width={56} height={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1052} y={70} width={34} height={48} fill={C.exitGreen} />
        <g stroke={KRP.white} strokeWidth={8} strokeLinecap="round" fill="none">
          <circle cx={952} cy={66} r={8} fill={KRP.white} stroke="none" />
          <path d="M 945 78 L 935 100 M 945 78 L 965 90 L 980 84 M 935 100 L 955 106 L 958 120 M 935 100 L 918 116" />
        </g>
        {/* 開いた扉の板 */}
        <path d={`M 1300 170 L ${fx} ${fTop} L ${fx} ${fBot} L 1300 880 Z`} fill={fx > 1300 ? C.steelDark : C.steel} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {fx > 1320 && (
          <g>
            <rect x={lerp(1300, fx, 0.25)} y={lerp(470, 440, 0.6)} width={(fx - 1300) * 0.5} height={30} rx={6} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lerp(1300, fx, 0.1)} ${lerp(300, fTop + 120, 0.5)} L ${lerp(1300, fx, 0.9)} ${fTop + 130}`} stroke={C.steel} strokeWidth={5} />
          </g>
        )}
        {/* 座席の背 (手前) */}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={-40 + k * 150} y={840} width={136} height={200} rx={40} fill={k % 2 ? C.seatDark : C.seat} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={1520 + k * 150} y={840} width={136} height={200} rx={40} fill={k % 2 ? C.seat : C.seatDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 懐中電灯の光 */}
        {light > 0 && (
          <g opacity={light * flick}>
            <path d="M 846 690 L 1300 160 L 1300 470 Z" fill={NP.glow} opacity={0.22} />
            <path d="M 846 690 L 1250 230 L 1250 410 Z" fill={NP.glowCore} opacity={0.22} />
            <ellipse cx={1150} cy={320} rx={150} ry={110} fill={NP.glow} opacity={0.18} />
          </g>
        )}
        {/* 人 (映画館の側から書庫を照らす) */}
        <ellipse cx={560} cy={905} rx={130} ry={22} fill={KRP.ink} opacity={0.3} />
        <Person x={560} y={900} s={1.35} f={f} face={f > 24 ? "surprised" : "worried"} gaze={[1, -0.7]} pose="point" pointDir={1} lean={lerp(0, 4, seg(f, 10, 30))} />
        {/* 懐中電灯 */}
        <g transform={`translate(${560 + 153 * 1.35 + 6} ${900 - 148 * 1.35}) rotate(-40)`}>
          <rect x={-16} y={-16} width={70} height={32} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={50} y={-22} width={26} height={44} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
          <rect x={72} y={-17} width={8} height={34} fill={light > 0 ? NP.glowCore : KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={6} y={-22} width={14} height={8} rx={3} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #21 名前を当てられて、負けてしまう小人がいて。
// 格: 並 / seed 4021
// 絵: 本棚の古い絵本が開き、とんがり帽子・白ひげの小男のシルエットが片足で跳ねる。ページの端に「?」の小札
// どこ: 書庫の閲覧机 (#20 の続き)。机の上に #20 の懐中電灯が置かれ、絵本を照らす
// 演出: 赤い革表紙がめくれて見開きの夜の森。焚き火のまわりで小男が片足跳び。正体は「?」
// 動き: 表紙がひらく f2〜16 (ほこりが舞う) / 小男が跳ねる (ゆっくり) / 火がゆらぐ・火の粉 / f28〜 ？札 / カメラが少し寄る
const NAcFairyPage: React.FC<{ f: number }> = ({ f }) => {
  const hop = Math.abs(Math.sin(f / 5)) * 34;
  const tilt = Math.sin(f / 5) * 6;
  const fl = Math.sin(f / 2.3);
  return (
    <g>
      <rect x={300} y={220} width={1320} height={540} fill={C.nightSky} />
      <rect x={300} y={220} width={1320} height={200} fill={C.nightSky2} opacity={0.5} />
      <circle cx={1440} cy={310} r={46} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={340 + rnd(4021, i) * 1240} cy={240 + rnd(4021, i + 30) * 150} r={3} fill={KRP.white} opacity={0.5 + 0.4 * Math.sin((f + i * 7) / 6)} />
      ))}
      {/* 森 */}
      {Array.from({ length: 10 }, (_, i) => {
        const x = 320 + i * 140 + rnd(4021, i + 60) * 50;
        const h = 210 + rnd(4021, i + 70) * 120;
        return <path key={i} d={`M ${x} ${640 - h} L ${x + 80} 650 L ${x - 80} 650 Z`} fill={i % 2 ? C.forest : C.forestDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />;
      })}
      <path d="M 300 640 Q 960 600 1620 650 L 1620 760 L 300 760 Z" fill={C.forestDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 焚き火の明かり */}
      <ellipse cx={1180} cy={690} rx={200} ry={60} fill={C.fire} opacity={0.14 + fl * 0.02} />
      {/* 焚き火 */}
      <g transform="translate(1180 690)">
        <path d="M -60 10 L 60 -10 M -60 -10 L 60 10" stroke={C.timber} strokeWidth={16} strokeLinecap="round" />
        <path d={`M -48 0 Q -40 ${-80 - fl * 10} 0 ${-130 - fl * 12} Q 40 ${-80 + fl * 8} 48 0 Z`} fill={C.fire} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M -24 0 Q -18 ${-50 + fl * 6} 0 ${-80 + fl * 8} Q 20 -50 24 0 Z`} fill={C.fireCore} />
        {Array.from({ length: 5 }, (_, i) => {
          const u = ((f * 1.6 + i * 22) % 110) / 110;
          return <circle key={i} cx={Math.sin(i * 2 + u * 6) * 30} cy={-120 - u * 160} r={5 * (1 - u) + 1} fill={C.fireCore} opacity={1 - u} />;
        })}
      </g>
      {/* 小男 (片足で跳ねるシルエット)。顔は描かず、帽子とひげだけ */}
      <ellipse cx={820} cy={705} rx={70 - hop * 0.6} ry={12} fill={KRP.ink} opacity={0.35} />
      <g transform={`translate(820 ${700 - hop}) rotate(${tilt})`}>
        {/* 軸足 */}
        <path d="M -6 -96 L -10 -6" stroke={C.gnome} strokeWidth={20} strokeLinecap="round" />
        <ellipse cx={-2} cy={-4} rx={22} ry={10} fill={C.gnome} stroke={KRP.ink} strokeWidth={3} />
        {/* 上げた足 */}
        <path d="M 14 -96 L 52 -66 L 30 -34" stroke={C.gnome} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* 胴 (上着) */}
        <path d="M -42 -96 Q -46 -170 0 -186 Q 46 -170 42 -96 Z" fill={C.gnome} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -42 -100 Q 0 -90 42 -100" stroke={C.fire} strokeWidth={4} fill="none" opacity={0.7} />
        {/* 両腕を上げる */}
        <path d={`M -34 -160 L -78 ${-210 + Math.sin(f / 5) * 10} M 34 -160 L 82 ${-214 - Math.sin(f / 5) * 10}`} stroke={C.gnome} strokeWidth={16} strokeLinecap="round" />
        {/* 頭 (横顔の影) と白いひげ */}
        <circle cx={0} cy={-214} r={36} fill={C.gnome} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -30 -206 Q -28 -140 6 -128 Q 34 -150 34 -206 Q 0 -192 -30 -206 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* とんがり帽子 */}
        <path d="M -42 -228 Q -6 -250 42 -228 L 18 -330 Q 30 -350 50 -346 Z" fill={C.book1} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        {/* 火に照らされた縁 */}
        <path d="M 36 -214 Q 44 -180 40 -150" stroke={C.fire} strokeWidth={5} fill="none" />
      </g>
    </g>
  );
};
const Nm021: React.FC<{ f: number }> = ({ f }) => {
  const t = easeInOut(seg(f, 2, 16));
  const z = lerp(1, 1.07, easeInOut(seg(f, 10, 42)));
  const puff = seg(f, 12, 26);
  const pageClipL = "nac021L", pageClipR = "nac021R";
  return (
    <Frame f={f} seed={4021} bg={C.tableWood}>
      <defs>
        <clipPath id={pageClipL}><rect x={300} y={220} width={660} height={540} /></clipPath>
        <clipPath id={pageClipR}><rect x={960} y={220} width={660} height={540} /></clipPath>
      </defs>
      <g transform={cam(940, 500, z)}>
        {/* 閲覧机の天板 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.tableWood} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -60 ${40 + i * 150} q 500 ${rnd(4021, i) * 40 - 20} 1000 0 q 500 ${rnd(4022, i) * 40 - 20} 1040 0`} stroke={C.tableWoodDark} strokeWidth={5} fill="none" opacity={0.6} />
        ))}
        {/* 右端: 積んだ古書 */}
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={1730 + (k % 2) * 14} y={660 - k * 64} width={220} height={60} rx={6} fill={[C.book2, C.book4, C.book5, C.book3][k]} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 左上: 机のランプの光 */}
        <circle cx={60} cy={60} r={260} fill={NP.glow} opacity={0.18} />
        {/* 絵本: 右半分 (中のページ) */}
        <rect x={960} y={180} width={740} height={630} rx={14} fill={C.coverDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={960} y={200} width={690} height={590} fill={C.page} stroke={KRP.ink} strokeWidth={5} />
        <g clipPath={`url(#${pageClipR})`}><NAcFairyPage f={f} /></g>
        <rect x={960} y={220} width={660} height={540} fill="none" stroke={KRP.ink} strokeWidth={4} />
        {/* 右の表紙 (開く前半) */}
        {t < 0.5 && (
          <g transform={`translate(960 0) scale(${Math.cos(Math.PI * t)} 1) translate(-960 0)`}>
            <rect x={960} y={180} width={740} height={630} rx={14} fill={C.cover} stroke={KRP.ink} strokeWidth={7} />
            <rect x={1040} y={250} width={580} height={490} rx={10} fill="none" stroke={NP.brass} strokeWidth={6} />
            <circle cx={1330} cy={495} r={90} fill="none" stroke={NP.brass} strokeWidth={6} />
          </g>
        )}
        {/* 左半分 (表紙が着地してから) */}
        {t >= 0.5 && (
          <g transform={`translate(960 0) scale(${-Math.cos(Math.PI * t)} 1) translate(-960 0)`}>
            <rect x={220} y={180} width={740} height={630} rx={14} fill={C.coverDark} stroke={KRP.ink} strokeWidth={7} />
            <rect x={270} y={200} width={690} height={590} fill={C.page} stroke={KRP.ink} strokeWidth={5} />
            <g clipPath={`url(#${pageClipL})`}><NAcFairyPage f={f} /></g>
            <rect x={300} y={220} width={660} height={540} fill="none" stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* のど (真ん中の影) */}
        <rect x={945} y={200} width={30} height={590} fill={KRP.ink} opacity={0.1} />
        <line x1={960} y1={196} x2={960} y2={794} stroke={KRP.ink} strokeWidth={5} />
        {/* ページの端の「?」札 */}
        <TagPlate x={1560} y={724} text="？" size={44} t={seg(f, 28, 36)} rot={-6} />
        {/* ほこり */}
        {puff > 0 && puff < 1 && (
          <g opacity={(1 - puff) * 0.8}>
            {Array.from({ length: 8 }, (_, i) => (
              <circle key={i} cx={960 + (i < 4 ? -1 : 1) * (760 + puff * 60)} cy={240 + (i % 4) * 170 - puff * 30} r={14 + puff * 22}
                fill="none" stroke={KRP.cream} strokeWidth={5} />
            ))}
          </g>
        )}
        {/* 手前: #20 の懐中電灯 (机に置いて絵本を照らす) */}
        <path d="M 330 880 L 640 700 L 820 760 L 440 920 Z" fill={NP.glow} opacity={0.16} />
        <g transform="translate(250 905) rotate(-24)">
          <rect x={0} y={-20} width={120} height={40} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={112} y={-28} width={36} height={56} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
          <rect x={144} y={-22} width={10} height={44} fill={NP.glowCore} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #22 罰として、汚い名前に書きかえられた貴族がいて。
// 格: 山 / seed 4022
// 絵: 奈良時代の木簡が机に並び、1本の字が朱の筆で塗りつぶされて書きかえられる。黒い冠と笏が横に
// どこ: 役所の黒っぽい文机を真上から。左に冠と笏、右に硯と朱の皿、木簡の束
// 演出: 袖の手 (顔なし) が上から朱筆を下ろし、まん中の木簡の名前の部分を朱で塗りつぶし、上から新しい字を書く
// 動き: 筆が f8〜28 で塗り下ろす → f28〜31 で上へ戻る → f31〜41 で新しい字を書く / カメラがまん中の木簡へ寄る
const NAcInkMarks: React.FC<{ x: number; y0: number; n: number; sd: number; color?: string; reveal?: number; w?: number }> = ({ x, y0, n, sd, color = NP.sumi, reveal = 1, w = 1 }) => (
  <g stroke={color} strokeLinecap="round" fill="none">
    {Array.from({ length: n }, (_, k) => {
      if (k + 1 > reveal * n + 0.01) return null;
      const y = y0 + k * 58;
      const a = rnd(sd, k), b = rnd(sd + 5, k);
      return (
        <g key={k} strokeWidth={9 * w}>
          <path d={`M ${x - 22} ${y + a * 8} L ${x + 20} ${y - 4 + b * 8}`} />
          <path d={`M ${x - 4 + a * 8} ${y - 16} L ${x - 2} ${y + 26}`} />
          {b > 0.4 && <path d={`M ${x + 6} ${y + 10} Q ${x + 18} ${y + 18} ${x + 22} ${y + 28}`} strokeWidth={7 * w} />}
          {a > 0.55 && <path d={`M ${x - 20} ${y + 16} L ${x - 10} ${y + 26}`} strokeWidth={7 * w} />}
        </g>
      );
    })}
  </g>
);
const Nm022: React.FC<{ f: number }> = ({ f }) => {
  const paint = easeInOut(seg(f, 8, 28));
  const back = seg(f, 28, 31);
  const write = seg(f, 31, 41);
  const z = lerp(1, 1.09, easeInOut(seg(f, 0, 40)));
  const top = 290, len = 330;
  let by: number;
  if (f < 28) by = top + paint * len;
  else if (f < 31) by = lerp(top + len, top + 10, back);
  else by = top + 10 + write * (len - 30);
  const lift = f < 8 ? (1 - seg(f, 0, 8)) * 160 : f >= 28 && f < 31 ? 30 : 0;
  const bx = 960 + Math.sin(f * 1.4) * (f < 28 ? 14 : 4);
  const xs = [500, 650, 800, 960, 1120, 1270, 1420];
  return (
    <Frame f={f} seed={4022} bg={C.deskDark}>
      <g transform={cam(960, 470, z)}>
        {/* 文机 (真上から) */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.deskDark} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -60 ${20 + i * 130} q 480 ${rnd(4022, i) * 30 - 15} 1000 0 q 500 ${rnd(4023, i) * 30 - 15} 1040 0`} stroke={C.deskDarkLine} strokeWidth={6} fill="none" />
        ))}
        {/* 下に敷いた布 */}
        <rect x={400} y={130} width={1120} height={700} rx={8} fill={KRP.paper} opacity={0.16} />
        {/* 木簡 7本 */}
        {xs.map((x, i) => {
          const r = (rnd(4022, i + 40) - 0.5) * 3;
          const h = i === 3 ? 660 : 560 + rnd(4022, i + 50) * 90;
          const y = 150 + (i === 3 ? 0 : rnd(4022, i + 60) * 50);
          const w = i === 3 ? 128 : 104;
          return (
            <g key={i} transform={`rotate(${i === 3 ? 0 : r} ${x} ${y + h / 2})`}>
              <rect x={x - w / 2 + 6} y={y + 8} width={w} height={h} fill={KRP.ink} opacity={0.35} />
              <path d={`M ${x - w / 2} ${y + 6} L ${x - w / 2 + 6} ${y} L ${x + w / 2 - 8} ${y} L ${x + w / 2} ${y + 10} L ${x + w / 2} ${y + h - 6} L ${x + w / 2 - 10} ${y + h} L ${x - w / 2 + 4} ${y + h} L ${x - w / 2} ${y + h - 12} Z`}
                fill={C.mokkan} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
              {[0.22, 0.5, 0.78].map((u) => (
                <path key={u} d={`M ${x - w / 2 + 10 + u * 20} ${y + 20} Q ${x - w / 2 + 14 + u * w * 0.8} ${y + h / 2} ${x - w / 2 + 8 + u * w * 0.85} ${y + h - 20}`} stroke={C.mokkanDark} strokeWidth={3} fill="none" />
              ))}
              {/* 紐を通す切り込み */}
              <path d={`M ${x - w / 2} ${y + 34} l 12 8 l -12 8 M ${x + w / 2} ${y + 34} l -12 8 l 12 8`} fill={C.deskDark} stroke={KRP.ink} strokeWidth={3} />
              {i !== 3 && <NAcInkMarks x={x} y0={y + 90} n={Math.floor(h / 70)} sd={4022 + i * 13} />}
            </g>
          );
        })}
        {/* まん中の木簡: 上の役職の字 (残る) */}
        <NAcInkMarks x={960} y0={200} n={1} sd={4100} />
        {/* 下の字 (残る) */}
        <NAcInkMarks x={960} y0={680} n={2} sd={4110} />
        {/* 名前の部分: 元の字 → 朱で塗りつぶされる */}
        <NAcInkMarks x={960} y0={top + 20} n={6} sd={4120} />
        {paint > 0 && (
          <path d={`M 916 ${top - 8} Q 960 ${top - 16} 1004 ${top - 6} L ${1006 + Math.sin(f) * 2} ${top + paint * len + 6} Q 960 ${top + paint * len + 18} 914 ${top + paint * len + 4} Z`}
            fill={C.shu} stroke={C.shuDark} strokeWidth={3} />
        )}
        {/* 塗りの上に新しい字 (墨) */}
        <NAcInkMarks x={960} y0={top + 30} n={5} sd={4130} reveal={write} w={1.1} />
        {/* 筆と手 (上から。顔は出さない) */}
        <g transform={`translate(${bx} ${by - lift})`}>
          <path d="M 0 0 Q -10 -24 -4 -46 L 14 -40 Q 14 -18 0 0 Z" fill={f < 31 ? C.shu : NP.sumi} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-4} y={-58} width={22} height={16} rx={3} fill={C.timber} stroke={KRP.ink} strokeWidth={3} transform="rotate(20 7 -50)" />
          <line x1={8} y1={-52} x2={250} y2={-360} stroke={C.mokkanDark} strokeWidth={16} strokeLinecap="round" />
          <line x1={8} y1={-52} x2={250} y2={-360} stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
          {/* 指 */}
          <ellipse cx={150} cy={-236} rx={34} ry={24} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} transform="rotate(-50 150 -236)" />
          <ellipse cx={176} cy={-262} rx={40} ry={30} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} transform="rotate(-50 176 -262)" />
          {/* 袖 */}
          <path d="M 170 -300 Q 220 -250 330 -250 L 520 -420 L 330 -560 Q 220 -420 170 -300 Z" fill={C.sleeve} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 200 -300 Q 240 -268 320 -268" stroke={C.sleeveDark} strokeWidth={6} fill="none" />
        </g>
        {/* 左: 黒い冠 (横から。低い帽子の後ろに高い巾子、後ろへ長い纓) */}
        <g transform="translate(230 470)">
          <ellipse cx={0} cy={8} rx={150} ry={22} fill={KRP.ink} opacity={0.3} />
          {/* 纓 (後ろに垂れる長い薄い帯) */}
          <path d="M 40 -150 Q 150 -190 170 -80 Q 180 -20 150 10" stroke={KRP.ink} strokeWidth={40} fill="none" strokeLinecap="round" />
          <path d="M 40 -150 Q 150 -190 170 -80 Q 180 -20 150 10" stroke={C.kanmuri} strokeWidth={32} fill="none" strokeLinecap="round" />
          <path d="M 70 -160 Q 140 -170 156 -90" stroke={KRP.grayDark} strokeWidth={4} fill="none" />
          {/* 巾子 (後ろの高いふくらみ) */}
          <path d="M 0 -96 L 0 -170 Q 0 -200 30 -200 Q 62 -200 62 -170 L 62 -96 Z" fill={C.kanmuri} stroke={KRP.ink} strokeWidth={5} />
          {/* 帽子の本体 (額から後ろへ低いドーム) */}
          <path d="M -120 0 Q -126 -110 -20 -116 Q 90 -118 96 0 Z" fill={C.kanmuri} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -120 0 L 96 0" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -110 -20 Q -10 -10 90 -20" stroke={KRP.grayDark} strokeWidth={4} fill="none" />
          <path d="M -86 -80 Q -50 -104 -10 -104" stroke={KRP.white} strokeWidth={6} opacity={0.35} fill="none" />
          {/* 漆の網目 */}
          {[0, 1, 2, 3].map((k) => <line key={k} x1={-90 + k * 50} y1={-90} x2={-80 + k * 50} y2={-24} stroke={KRP.grayDark} strokeWidth={2} opacity={0.6} />)}
        </g>
        <TagPlate x={230} y={540} text="冠" size={34} t={seg(f, 6, 14)} />
        {/* 左下: 笏 (平たい板) */}
        <g transform="rotate(-14 250 700)">
          <ellipse cx={258} cy={716} rx={170} ry={14} fill={KRP.ink} opacity={0.3} />
          <path d="M 90 676 L 420 664 L 420 722 L 90 708 Z" fill={C.mokkan} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 110 686 L 400 678" stroke={C.mokkanDark} strokeWidth={3} />
          <path d="M 110 698 L 400 700" stroke={C.mokkanDark} strokeWidth={3} />
        </g>
        {/* 右: 硯と墨、朱の皿 */}
        <g>
          <rect x={1580} y={170} width={180} height={260} rx={16} fill={C.inkstone} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1600} y={190} width={140} height={70} rx={10} fill={NP.sumi} />
          <rect x={1612} y={290} width={116} height={120} rx={10} fill={KRP.grayDark} opacity={0.5} />
          <rect x={1790} y={210} width={44} height={150} rx={8} fill={NP.sumi} stroke={KRP.ink} strokeWidth={4} transform="rotate(12 1812 285)" />
          <circle cx={1670} cy={560} r={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1670} cy={560} r={52} fill={C.shu} />
          <path d={`M 1636 548 Q 1670 ${536 + Math.sin(f / 6) * 4} 1704 550`} stroke={KRP.white} strokeWidth={4} opacity={0.5} fill="none" />
        </g>
        {/* 束ねた木簡 (紐) */}
        <g transform="rotate(8 1640 740)">
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={1520} y={700 + k * 26} width={260} height={24} rx={4} fill={C.mokkan} stroke={KRP.ink} strokeWidth={3} />
          ))}
          <rect x={1600} y={692} width={16} height={120} fill={C.shuDark} stroke={KRP.ink} strokeWidth={2} />
        </g>
      </g>
      <TagPlate x={260} y={190} text="奈良時代" size={44} />
      <TagPlate x={330} y={786} text="笏" size={34} t={seg(f, 8, 16)} />
      <TagPlate x={1650} y={110} text="木簡" size={40} t={seg(f, 4, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #23 明治には、名前に鍵がかけられて。
// 格: 山 / seed 4023
// 絵: 明治の役所の机 (洋風の机・ランプ・和紙の帳簿の山)。帳簿の上の名札に真鍮の錠前がガチャン。窓の外にガス灯と人力車
// どこ: 夕暮れの明治の役所。しっくい壁と腰板、柱時計、右に窓 (れんがの建物・ガス灯・人力車)
// 演出: 帳簿の山に立てかけた名札に鎖が巻きつき、上から錠前が落ちてきてガチャンとかかる
// 動き: 鎖が f4〜16 でのびる / 錠前が f14〜22 で落ちる / f22〜26 でU字がはまる・衝撃線・画面がゆれる / 振り子・人力車が進む / カメラが錠前へ寄る
const Nm023: React.FC<{ f: number }> = ({ f }) => {
  const chain = seg(f, 4, 16);
  const drop = easeOut(seg(f, 14, 22));
  const close = seg(f, 22, 26);
  const hit = seg(f, 24, 34);
  const shake = f >= 24 && f < 30 ? Math.sin(f * 3.1) * (30 - f) * 1.2 : 0;
  const z = lerp(1, 1.08, easeInOut(seg(f, 0, 42)));
  const rx = lerp(1830, 1600, f / 60);
  const pend = Math.sin(f / 9) * 14;
  const lockY = 345;
  const flame = 1 + Math.sin(f / 2.4) * 0.06;
  return (
    <Frame f={f} seed={4023} bg={C.plaster}>
      <defs>
        <clipPath id="nac023win"><rect x={1420} y={110} width={400} height={400} /></clipPath>
      </defs>
      <g transform={cam(960, 380, z, shake, 0)}>
        {/* しっくい壁と腰板 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.plaster} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${i * 340} 0 q 60 200 -20 500`} stroke={C.plasterShade} strokeWidth={8} fill="none" opacity={0.6} />
        ))}
        <rect x={-60} y={470} width={W + 120} height={150} fill={C.wains} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={462} width={W + 120} height={16} fill={C.meijiDeskDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 柱時計 */}
        <g transform="translate(620 150)">
          <rect x={-70} y={-90} width={140} height={330} rx={20} fill={C.meijiDesk} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-20} r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={Math.cos((i * Math.PI) / 6) * 44} y1={-20 + Math.sin((i * Math.PI) / 6) * 44} x2={Math.cos((i * Math.PI) / 6) * 50} y2={-20 + Math.sin((i * Math.PI) / 6) * 50} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <line x1={0} y1={-20} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={-20} x2={26} y2={-8} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-44} y={60} width={88} height={160} rx={8} fill={C.meijiDeskDark} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${pend} 0 64)`}>
            <line x1={0} y1={64} x2={0} y2={180} stroke={NP.brassDark} strokeWidth={5} />
            <circle cx={0} cy={186} r={18} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 窓 (外は夕暮れ) */}
        <rect x={1400} y={90} width={440} height={440} fill={C.meijiDeskDark} stroke={KRP.ink} strokeWidth={6} />
        <g clipPath="url(#nac023win)">
          <rect x={1420} y={110} width={400} height={400} fill={C.dusk} />
          <rect x={1420} y={330} width={400} height={180} fill={C.duskLow} opacity={0.6} />
          <rect x={1440} y={200} width={160} height={260} fill={C.brick} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1].map((r) => [0, 1].map((c) => (
            <rect key={`${r}${c}`} x={1462 + c * 66} y={230 + r * 100} width={44} height={64} rx={20} fill={NP.glow} stroke={KRP.ink} strokeWidth={3} />
          )))}
          <rect x={1420} y={470} width={400} height={40} fill={C.stone} />
          {/* ガス灯 */}
          <line x1={1690} y1={250} x2={1690} y2={480} stroke={KRP.ink} strokeWidth={8} />
          <path d="M 1668 214 L 1712 214 L 1720 252 L 1660 252 Z" fill={NP.glowCore} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1690} cy={234} r={46 * flame} fill={NP.glow} opacity={0.35} />
          {/* 人力車 */}
          <g transform={`translate(${rx} 472)`}>
            <circle cx={0} cy={-44} r={44} fill="none" stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={0} y1={-44} x2={Math.cos(k * 0.8 - f / 8) * 44} y2={-44 + Math.sin(k * 0.8 - f / 8) * 44} stroke={KRP.ink} strokeWidth={3} />
            ))}
            <path d="M -30 -80 Q -30 -150 30 -150 L 40 -90 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-34} y={-92} width={74} height={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <line x1={-30} y1={-80} x2={-130} y2={-60} stroke={KRP.ink} strokeWidth={6} />
            <PersonMini x={-150} y={0} s={0.42} color={KRP.ink} face="none" f={f} />
          </g>
        </g>
        <line x1={1620} y1={90} x2={1620} y2={530} stroke={C.meijiDeskDark} strokeWidth={14} />
        <line x1={1400} y1={310} x2={1840} y2={310} stroke={C.meijiDeskDark} strokeWidth={14} />
        {/* 洋風の机 */}
        <path d="M 140 600 L 1780 600 L 1840 660 L 80 660 Z" fill={C.meijiDesk} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={80} y={660} width={1760} height={460} fill={C.meijiDeskDark} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <rect x={160 + k * 560} y={700} width={480} height={110} rx={8} fill={C.meijiDesk} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={400 + k * 560} cy={755} r={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* ランプ (左) */}
        <g transform="translate(330 610)">
          <circle cx={0} cy={-170} r={150 * flame} fill={NP.glow} opacity={0.22} />
          <ellipse cx={0} cy={-8} rx={70} ry={16} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -50 -10 Q -60 -80 0 -96 Q 60 -80 50 -10 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -24 -96 Q -40 -170 -16 -240 L 16 -240 Q 40 -170 24 -96 Z" fill={KRP.white} opacity={0.7} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 0 ${-130 - 30 * flame} Q 14 -140 0 -112 Q -14 -140 0 ${-130 - 30 * flame} Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* そろばん */}
        <g transform="translate(1420 590) rotate(-6)">
          <rect x={0} y={-30} width={300} height={60} rx={6} fill={C.meijiDeskDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 11 }, (_, k) => (
            <g key={k}>
              <ellipse cx={18 + k * 26} cy={-14} rx={10} ry={7} fill={C.timber} />
              <ellipse cx={18 + k * 26} cy={10} rx={10} ry={7} fill={C.timber} />
            </g>
          ))}
          <line x1={0} y1={-4} x2={300} y2={-4} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* インク壺とペン */}
        <g transform="translate(1290 600)">
          <path d="M -36 0 L -30 -50 L 30 -50 L 36 0 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-16} y={-66} width={32} height={18} fill={NP.sumi} />
          <line x1={0} y1={-60} x2={50} y2={-170} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* 帳簿の山 (和紙・糸綴じ) */}
        {[0, 1, 2, 3, 4].map((k) => {
          const y = 600 - (k + 1) * 58;
          const x = 690 + (rnd(4023, k) - 0.5) * 40;
          return (
            <g key={k}>
              <rect x={x} y={y} width={540} height={58} rx={4} fill={C.ledgerPage} stroke={KRP.ink} strokeWidth={5} />
              <rect x={x} y={y} width={540} height={10} fill={C.ledger} stroke={KRP.ink} strokeWidth={3} />
              <rect x={x} y={y + 48} width={540} height={10} fill={C.ledgerDark} stroke={KRP.ink} strokeWidth={3} />
              {[0, 1, 2].map((j) => <line key={j} x1={x + 14} y1={y + 20 + j * 10} x2={x + 526} y2={y + 20 + j * 10} stroke={C.pageShade} strokeWidth={2} />)}
              {[0, 1, 2, 3].map((j) => <line key={j} x1={x + 12 + j * 6} y1={y + 4} x2={x + 12 + j * 6} y2={y + 54} stroke={NP.chobo} strokeWidth={3} />)}
            </g>
          );
        })}
        {/* 帳簿の題簽 */}
        <rect x={1100} y={432} width={90} height={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <text x={1145} y={463} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink}>戸籍</text>
        {/* 名札 (帳簿に立てかける) */}
        <Nafuda x={960} y={210} s={0.95} text="山田 花子" hang={false} f={f} />
        {/* 鎖: 縦 (名札の字のすき間を通る) と横 (帳簿を巻く) */}
        <NAcChain p1={[960, 100]} p2={[960, 596]} t={chain} link={28} />
        <NAcChain p1={[676, 420]} p2={[1244, 420]} t={chain} link={28} />
        <NAcChain p1={[768, 120]} p2={[1152, 120]} t={chain} link={28} />
        {/* 錠前 */}
        {drop > 0 && <NAcPadlock x={960} y={lockY - (1 - drop) * 420} s={1.05} close={close} />}
        {hit > 0 && hit < 1 && (
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={1 - hit}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2 + 0.2;
              const r1 = 110 + hit * 40, r2 = 150 + hit * 70;
              return <line key={i} x1={960 + Math.cos(a) * r1} y1={lockY + Math.sin(a) * r1 * 0.8} x2={960 + Math.cos(a) * r2} y2={lockY + Math.sin(a) * r2 * 0.8} />;
            })}
          </g>
        )}
      </g>
      <TagPlate x={220} y={200} text="明治" size={48} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #24 2025年には、太郎を「ジョージ」と読ませるのが、難しくなりました。
// 格: 山 / seed 4024
// 絵: 現代の家の玄関の郵便受けに役所の封筒がストン。紙が飛び出し「太郎」の上の「ジョージ」のふりがなが赤い×ではじかれる
// どこ: 現代の家の玄関先 (サイディングの壁・表札・郵便受け・観葉植物・木の玄関ドア・タイルの床)
// 演出: 封筒が郵便受けに半分ささり、中の紙が飛び出して画面の真ん中で広がる。ふりがなに赤い×がバンと押され、ジョージがはじき出される
// 動き: 封筒が f4〜12 で落ちる / 紙が f14〜24 で飛び出して開く / ×が f28〜32 でぽん / ジョージが f30〜40 ではじかれる / 植物がゆれる / カメラが紙へ寄る
const Nm024: React.FC<{ f: number }> = ({ f }) => {
  const env = easeOut(seg(f, 4, 12));
  const fly = easeInOut(seg(f, 14, 24));
  const xT = seg(f, 28, 32);
  const knock = easeOut(seg(f, 30, 40));
  const z = lerp(1, 1.06, easeInOut(seg(f, 14, 42)));
  const px = lerp(330, 920, fly), py = lerp(330, 450, fly);
  const ps = lerp(0.12, 1, fly);
  const pr = lerp(-30, -2, fly);
  const sway = Math.sin(f / 10) * 3;
  return (
    <Frame f={f} seed={4024} bg={C.siding}>
      <g transform={cam(920, 450, z)}>
        {/* サイディングの壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.siding} />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={-60} y1={i * 56} x2={W + 60} y2={i * 56} stroke={C.sidingLine} strokeWidth={4} />
        ))}
        {/* タイルの床とポーチ */}
        <rect x={-60} y={850} width={W + 120} height={300} fill={C.tile} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 180} y1={850} x2={i * 180 - 60} y2={1100} stroke={C.tileLine} strokeWidth={4} />
        ))}
        {/* 玄関ドア */}
        <rect x={1460} y={100} width={420} height={760} fill={C.doorWoodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1490} y={130} width={360} height={730} fill={C.doorWood} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={1490 + i * 60 + 30} y1={140} x2={1490 + i * 60 + 30} y2={850} stroke={C.doorWoodDark} strokeWidth={3} opacity={0.6} />
        ))}
        <rect x={1520} y={170} width={50} height={560} rx={6} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1780} y={470} width={22} height={120} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1730} y={490} width={70} height={18} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        {/* 玄関灯 */}
        {/* 観葉植物 */}
        <g transform={`rotate(${sway} 1360 860)`}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = -150 + i * 20;
            const L = 220 + rnd(4024, i) * 120;
            const ex = 1360 + Math.cos((a * Math.PI) / 180) * L, ey = 760 + Math.sin((a * Math.PI) / 180) * L;
            return (
              <g key={i}>
                <path d={`M 1360 760 Q ${(1360 + ex) / 2} ${ey + 40} ${ex} ${ey}`} stroke={C.leafDark} strokeWidth={6} fill="none" />
                <ellipse cx={ex} cy={ey} rx={56} ry={26} fill={i % 2 ? C.leaf : C.leafDark} stroke={KRP.ink} strokeWidth={4}
                  transform={`rotate(${a + 90 + 60} ${ex} ${ey})`} />
              </g>
            );
          })}
        </g>
        <path d="M 1290 760 L 1430 760 L 1410 870 L 1310 870 Z" fill={C.pot} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={1284} y={750} width={152} height={22} rx={6} fill={C.pot} stroke={KRP.ink} strokeWidth={5} />
        {/* 表札 */}
        <rect x={1345} y={130} width={92} height={210} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1357} y={142} width={68} height={186} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <text x={1391} y={222} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.ink}>山</text>
        <text x={1391} y={298} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.ink}>田</text>
        {/* 封筒 (郵便受けの投入口に半分ささる) */}
        {env > 0 && (
          <g transform={`translate(320 ${lerp(-260, 420, env)}) rotate(${(1 - env) * 10})`}>
            <rect x={-80} y={-150} width={160} height={150} fill={C.envelope} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-60} y={-130} width={120} height={20} fill={C.envelopeDark} />
            <path d="M -80 -150 L 0 -110 L 80 -150" fill="none" stroke={C.envelopeDark} strokeWidth={4} opacity={fly > 0 ? 1 : 0} />
          </g>
        )}
        {/* 郵便受け */}
        <path d="M 160 400 L 480 400 L 500 430 L 140 430 Z" fill={C.postBoxDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={140} y={430} width={360} height={240} rx={10} fill={C.postBox} stroke={KRP.ink} strokeWidth={6} />
        <rect x={170} y={450} width={300} height={30} rx={6} fill={C.postBoxDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={290} y={560} width={60} height={30} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <rect x={140} y={670} width={360} height={14} fill={C.postBoxDark} />
        {/* 落ちた衝撃 */}
        {f >= 12 && f < 20 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 12, 20)}>
            <path d="M 210 380 L 180 350 M 430 380 L 460 350 M 320 360 L 320 320" />
          </g>
        )}
        {/* 飛び出した紙 */}
        {fly > 0 && (
          <g transform={`translate(${px} ${py}) rotate(${pr}) scale(${ps})`}>
            <rect x={-322} y={-296} width={660} height={600} rx={8} fill={KRP.ink} opacity={0.18} />
            <rect x={-330} y={-310} width={660} height={600} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <rect x={-330} y={-310} width={660} height={60} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((k) => <rect key={k} x={-290 + k * 120} y={-290} width={90} height={20} rx={6} fill={KRP.blueDeep} opacity={0.5} />)}
            {/* ふりがなの欄 */}
            <rect x={-200} y={-210} width={400} height={96} rx={10} fill={C.rubyPink} stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 8" />
            <g transform={`translate(${knock * 110} ${-knock * 46}) rotate(${knock * 16})`} opacity={1 - knock * 0.25}>
              <text x={0} y={-142} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.ink}>ジョージ</text>
            </g>
            {/* 名前の欄 */}
            <rect x={-240} y={-90} width={480} height={240} rx={10} fill="none" stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190} fill={NP.sumi}>太郎</text>
            {[0, 1].map((k) => <rect key={k} x={-280} y={190 + k * 34} width={k ? 360 : 460} height={14} rx={6} fill={KRP.gray} />)}
            {/* 役所の印 */}
            <rect x={210} y={180} width={80} height={80} rx={4} fill="none" stroke={KRP.red} strokeWidth={7} />
            <rect x={228} y={198} width={44} height={44} fill={KRP.red} opacity={0.5} />
          </g>
        )}
        {/* 赤い× (ふりがなをはじく) */}
        <XMark x={915} y={450 - 168} s={1.25} t={xT} />
        {knock > 0 && knock < 1 && (
          <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round" opacity={1 - knock}>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = -0.9 + i * 0.45;
              return <line key={i} x1={1060 + Math.cos(a) * 70} y1={290 + Math.sin(a) * 70} x2={1060 + Math.cos(a) * (110 + knock * 40)} y2={290 + Math.sin(a) * (110 + knock * 40)} />;
            })}
          </g>
        )}
      </g>
      <TagPlate x={1660} y={60} text="2025年" size={42} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #25 今日は、名前のからくりを、のぞいてみます。
// 格: 山 / seed 4025
// 絵: からくりの作業台に、名札が組みこまれた木と真鍮の大きなからくり箱。Person が虫眼鏡で小窓をのぞく
// どこ: からくり職人の工房 (有孔ボードの壁に道具・作業台に歯車やねじ回し・油さし・木くず)
// 演出: 箱の小窓の奥で歯車が回り、3つの結び目の金具がちらりと光る (糸はまだ)。ふたが少し開いて光がもれる
// 動き: 歯車が回る / ふたが f10〜30 で少し開く・光がもれる / 金具が f20〜 で順に光る / 人が前のめりに / 右のハンドルが回る / カメラが小窓へ寄る
const Nm025: React.FC<{ f: number }> = ({ f }) => {
  const lid = easeOut(seg(f, 10, 30));
  const lift = lid * 70;
  const z = lerp(1, 1.08, easeInOut(seg(f, 0, 42)));
  const lean = lerp(0, -7, easeOut(seg(f, 4, 26)));
  const rot = f * 3;
  const PX = 1150, PY = 545, PR = 100;
  const knotsL = [seg(f, 20, 26), seg(f, 25, 31), seg(f, 30, 36)];
  const kc = [NP.mimi, NP.chobo, NP.shinyo];
  const inner = (mag: number) => (
    <g>
      <rect x={PX - 140} y={PY - 140} width={280} height={280} fill={C.libBack} />
      <g transform={`translate(${PX} ${PY}) scale(${mag}) translate(${-PX} ${-PY})`}>
        <NAcGear x={PX - 40} y={PY - 30} r={58} n={12} rot={rot} />
        <NAcGear x={PX + 54} y={PY - 50} r={40} n={9} rot={-rot * 1.4 + 10} fill={NP.brassDark} />
        <NAcGear x={PX + 40} y={PY + 40} r={30} n={8} rot={rot * 1.9} />
        {/* 3つの結び目の金具 (糸はまだ) */}
        <rect x={PX - 80} y={PY + 52} width={160} height={14} rx={6} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <circle cx={PX - 55 + k * 55} cy={PY + 59} r={20} fill={NP.glow} opacity={0.5 * knotsL[k]} />
            <circle cx={PX - 55 + k * 55} cy={PY + 59} r={13} fill={knotsL[k] > 0.5 ? kc[k] : NP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={PX - 55 + k * 55} cy={PY + 59} r={4} fill={KRP.ink} />
          </g>
        ))}
      </g>
    </g>
  );
  const crank = (f / 30) * Math.PI * 2;
  return (
    <Frame f={f} seed={4025} bg={C.pegboard}>
      <defs>
        <clipPath id="nac025port"><circle cx={PX} cy={PY} r={PR} /></clipPath>
        <clipPath id="nac025lens"><circle cx={1262} cy={600} r={56} /></clipPath>
      </defs>
      <g transform={cam(1150, 540, z)}>
        {/* 有孔ボードの壁 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.pegboard} />
        {Array.from({ length: 22 }, (_, i) => Array.from({ length: 10 }, (_, j) => (
          <circle key={`${i}-${j}`} cx={20 + i * 90} cy={30 + j * 80} r={6} fill={C.pegHole} />
        )))}
        {/* 壁の道具 */}
        <g transform="translate(10 110)">
          <path d="M 120 120 L 360 120 L 360 190 Q 240 210 120 190 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, k) => <path key={k} d={`M ${124 + k * 20} 190 l 10 12 l 10 -12`} fill="none" stroke={KRP.ink} strokeWidth={3} />)}
          <rect x={360} y={120} width={70} height={60} rx={14} fill={C.bench} stroke={KRP.ink} strokeWidth={5} />
          <rect x={150} y={260} width={20} height={200} rx={8} fill={C.bench} stroke={KRP.ink} strokeWidth={4} />
          <rect x={120} y={240} width={80} height={44} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={250} y={280} width={18} height={170} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <rect x={254} y={440} width={10} height={60} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
          <rect x={320} y={280} width={18} height={170} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
          <rect x={324} y={440} width={10} height={60} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
          <NAcGear x={1640} y={170} r={70} n={12} rot={0} fill={C.boxWood} />
          <NAcGear x={1780} y={300} r={46} n={9} rot={20} fill={C.boxWood} />
          <rect x={1560} y={360} width={260} height={30} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 作業台 */}
        <rect x={-60} y={760} width={W + 120} height={60} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={820} width={W + 120} height={300} fill={C.benchDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-60} y1={776 + i * 9} x2={W + 60} y2={776 + i * 9 + (i % 2) * 4} stroke={C.benchDark} strokeWidth={2} opacity={0.6} />)}
        {/* 台の上の小物: 歯車・ねじ回し・油さし・木くず */}
        <NAcGear x={230} y={740} r={34} n={9} rot={0} />
        <NAcGear x={300} y={752} r={20} n={7} rot={12} fill={NP.brassDark} />
        <g transform="rotate(-8 400 750)">
          <rect x={360} y={738} width={110} height={24} rx={10} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
          <rect x={468} y={746} width={70} height={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
        </g>
        <path d="M 1440 760 L 1450 690 L 1500 690 L 1510 760 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1475 690 L 1478 650 L 1430 610" stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${60 + i * 26} ${756 - (i % 2) * 6} q 14 -18 28 0`} stroke={C.boxWood} strokeWidth={6} fill="none" />
        ))}
        {/* からくり箱: 影 */}
        <ellipse cx={940} cy={768} rx={470} ry={20} fill={KRP.ink} opacity={0.3} />
        {/* 右の側面 */}
        <path d="M 1300 300 L 1350 250 L 1350 712 L 1300 762 Z" fill={C.boxWoodDark} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* ハンドル */}
        <g transform="translate(1326 470)">
          <circle r={16} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={0} x2={Math.cos(crank) * 20} y2={Math.sin(crank) * 54} stroke={NP.brassDark} strokeWidth={9} strokeLinecap="round" />
          <circle cx={Math.cos(crank) * 20} cy={Math.sin(crank) * 54} r={10} fill={C.timber} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 前面 */}
        <rect x={520} y={300} width={780} height={462} rx={6} fill={C.boxWood} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M 530 ${360 + i * 110} q 380 ${rnd(4025, i) * 24 - 12} 760 0`} stroke={C.boxWoodDark} strokeWidth={4} fill="none" opacity={0.6} />
        ))}
        {/* 真鍮の角金具・鋲 */}
        {[[520, 300], [1300, 300], [520, 762], [1300, 762]].map(([cx, cy], i) => (
          <g key={i}>
            <path d={`M ${cx} ${cy + (cy < 500 ? 60 : -60)} L ${cx} ${cy} L ${cx + (cx < 900 ? 60 : -60)} ${cy}`} stroke={NP.brass} strokeWidth={18} fill="none" />
            <path d={`M ${cx} ${cy + (cy < 500 ? 60 : -60)} L ${cx} ${cy} L ${cx + (cx < 900 ? 60 : -60)} ${cy}`} stroke={KRP.ink} strokeWidth={3} fill="none" />
          </g>
        ))}
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={560 + i * 78} cy={740} r={7} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 組みこまれた名札 (真鍮の枠) */}
        <rect x={622} y={358} width={336} height={176} rx={20} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        <Nafuda x={790} y={446} s={0.75} text="山田 花子" hang={false} />
        {/* 引き出しのつまみ */}
        {[0, 1].map((k) => (
          <g key={k}>
            <rect x={620 + k * 180} y={600} width={160} height={110} rx={8} fill={C.boxWoodDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={700 + k * 180} cy={655} r={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 小窓 */}
        <g clipPath="url(#nac025port)">{inner(1)}</g>
        <circle cx={PX} cy={PY} r={PR} fill={KRP.blueSoft} opacity={0.12} />
        <circle cx={PX} cy={PY} r={PR + 10} fill="none" stroke={NP.brass} strokeWidth={20} />
        <circle cx={PX} cy={PY} r={PR + 10} fill="none" stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={PX + Math.cos((i * Math.PI) / 4) * (PR + 10)} cy={PY + Math.sin((i * Math.PI) / 4) * (PR + 10)} r={5} fill={NP.brassDark} />
        ))}
        {/* 天面 */}
        <path d="M 520 300 L 570 250 L 1350 250 L 1300 300 Z" fill={C.boxWoodDark} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* ふたのすき間からもれる光 */}
        {lid > 0 && (
          <g opacity={lid}>
            <path d={`M 600 262 L 1300 262 L 1360 ${150 - lift} L 540 ${150 - lift} Z`} fill={NP.glow} opacity={0.3} />
            <path d="M 540 290 L 1310 290 L 1345 255 L 575 255 Z" fill={NP.glowCore} opacity={0.8} />
          </g>
        )}
        {/* ふた (後ろの辺を軸に少し開く) */}
        <path d={`M 570 250 L 1350 250 L ${1300 + lid * 14} ${300 - lift} L ${520 + lid * 14} ${300 - lift} Z`}
          fill={C.boxWood} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${520 + lid * 14} ${300 - lift} L ${1300 + lid * 14} ${300 - lift} L ${1300 + lid * 14} ${318 - lift} L ${520 + lid * 14} ${318 - lift} Z`}
          fill={C.boxWoodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={900 + lid * 10} y={292 - lift} width={60} height={30} rx={6} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 人 (虫眼鏡でのぞく) */}
        <ellipse cx={1570} cy={908} rx={130} ry={20} fill={KRP.ink} opacity={0.3} />
        <Person x={1560} y={905} s={1.35} f={f} face="surprised" gaze={[-1, 0.3]} pose="point" pointDir={-1} lean={lean} cloth={KRP.green} clothDark={C.pineDark} />
        {/* 虫眼鏡: 柄は手元から */}
        <line x1={1346} y1={738} x2={1296} y2={644} stroke={C.timber} strokeWidth={20} strokeLinecap="round" />
        <line x1={1346} y1={738} x2={1296} y2={644} stroke={KRP.ink} strokeWidth={3} />
        <g clipPath="url(#nac025lens)"><g transform={`translate(${1262 - PX} ${600 - PY})`}>{inner(1.8)}</g></g>
        <circle cx={1262} cy={600} r={56} fill={KRP.white} opacity={0.12} />
        <circle cx={1262} cy={600} r={60} fill="none" stroke={NP.brassDark} strokeWidth={12} />
        <circle cx={1262} cy={600} r={60} fill="none" stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1232 572 Q 1244 560 1260 558" stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.7} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #26 最初の現場は、200年前のドイツ。グリム兄弟の昔話です。
// 格: 山 / seed 4026
// 絵: 古いヨーロッパ地図 (ブーツのイタリア・イギリスの島・スカンジナビア半島) の上で、濃く塗ったドイツに赤いピンが刺さる。横の小さな飛び出し札に森と木組みの町が立ち上がる
// どこ: 机に広げた古いヨーロッパの地図 (羊皮紙・海の帆船・方位盤・重しの石・本と羽ペン)
// 演出: 赤いピンがドイツにトンと刺さり波紋。ドイツが濃く塗られ、点線で結ばれた小さな札の上に森と町が絵本のように起き上がる
// 動き: ピンが f4〜12 で落ちて刺さる・揺れる / 波紋 f12〜24 / ドイツが f8〜18 で濃くなる / 森 f14〜26・町 f20〜32 / 船がゆれる / カメラが少し寄る
// 地図の投影 (デフォルメ): 経度1度=21px・緯度1度=24px。ドイツ中央 (10E, 51N) が (960, 400)
const NM026 = { de: "#C8743E", deDark: "#9A5228", landLine: "#5A4128", book: "#A8382E", quill: "#F4F0E6" } as const;
const nm026P = (lon: number, lat: number): [number, number] => [960 + (lon - 10) * 21, 400 - (lat - 51) * 24];
const nm026Path = (pts: number[]) => {
  const out: string[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    const [x, y] = nm026P(pts[i], pts[i + 1]);
    out.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return out.join(" ") + " Z";
};
// 大陸 (イベリア→地中海→イタリアの長靴→バルカン→黒海→東の端→北へ回ってスカンジナビア→バルト海→北海→フランス西岸)
const NM026_MAIN = [
  -9.3, 43, -8.8, 41, -9.5, 38.7, -8.8, 37, -7.4, 37.2, -6, 36.7, -5.6, 36, -4.4, 36.7, -2, 36.8, -0.5, 38.3, 0.2, 38.8, -0.3, 39.5, 0.9, 41, 3.2, 41.9,
  3, 42.5, 3, 43.3, 4.8, 43.4, 7.5, 43.8, 8.8, 44.4, 10, 44, 10.5, 43, 11, 42.4, 12.5, 41.5, 14, 40.8, 15.6, 40, 15.8, 39, 15.6, 38, 16, 37.9, 16.6, 38.4,
  17.1, 39, 16.5, 39.7, 17, 40.4, 18.5, 40.1, 18.4, 40.6, 16, 41.4, 15.9, 41.9, 14, 42.6, 13.6, 43.5, 12.3, 44.5, 12.3, 45.3, 13.7, 45.7,
  14.5, 45.2, 15.5, 44, 17, 43.2, 18.5, 42.4, 19.5, 41.8, 19.4, 40.3, 21, 38.5, 21.8, 36.8, 23, 36.5, 23.2, 38, 24, 38.2, 22.8, 39, 23.5, 40.2, 26, 40.8, 26.5, 41.3, 29, 41.2,
  28, 42.5, 28.6, 43.7, 29.7, 45.2, 30.7, 46.5, 31.8, 46.5, 33.5, 46, 33.5, 44.5, 35, 45, 36.5, 45.3, 38, 47, 39.5, 47, 48, 47, 48, 76,
  31, 76, 30, 71, 25, 71.2, 18, 70, 14, 68, 12, 66, 10, 64, 7, 62.5, 5, 61, 5, 59, 6, 58, 8, 58, 10, 59, 11, 59, 11.5, 58, 12.5, 56.5, 13, 55.4, 14.3, 55.5,
  16, 56.2, 16.5, 57, 16.6, 58.3, 18.5, 59.5, 17.5, 61, 17.5, 62.5, 21, 64.5, 22, 65.8, 25, 65.5, 25, 64.8, 21.5, 63, 21.5, 61, 22.5, 60, 26, 60.4, 30, 60,
  28, 59.5, 24, 59.4, 23.5, 58.5, 24.3, 57.2, 21.5, 57.5, 21, 56, 21, 55.3, 20, 54.5, 19, 54.4, 18.5, 54.8, 16.5, 54.5, 14.2, 53.9, 12.5, 54.4, 11, 54, 10.8, 54.4, 10, 54.8,
  10.5, 56.5, 10.5, 57.6, 9.5, 57.1, 8.1, 56.6, 8.6, 55.4, 8.8, 54, 8, 53.5, 7, 53.5, 5, 53.3, 4.5, 52.4, 3.5, 51.5, 2.5, 51.1, 1.6, 50.9, 1.6, 50.2, 0, 49.7,
  -1.2, 49.4, -1.6, 48.6, -3, 48.8, -4.7, 48.4, -4.3, 47.8, -2.3, 47.2, -1.2, 46, -1.3, 44.5, -1.8, 43.4, -3, 43.5, -8, 43.7,
];
const NM026_ISLANDS = [
  // イギリス (グレートブリテン島)
  [-5.7, 50.1, -3, 50.6, -1, 50.7, 1.4, 51.2, 1.7, 52.6, 0.3, 53.4, -0.5, 54.5, -1.6, 55.6, -2, 57.6, -3.3, 58.6, -5, 58.6, -6, 57.5, -5.6, 56.3, -4.9, 55.1, -3.2, 54.9, -3.4, 54.2, -3, 53.3, -4.5, 53.3, -4.2, 52.3, -5.2, 51.8, -3.5, 51.4, -4.6, 51.1],
  // アイルランド
  [-6, 52.2, -6.2, 53.9, -5.5, 54.6, -6.2, 55.2, -7.3, 55.3, -8.5, 54.5, -10, 54.2, -9.8, 53.4, -10.3, 52.2, -9.5, 51.5, -8, 51.8],
  // シチリア・サルデーニャ・コルシカ・シェラン島・クレタ
  [12.4, 37.9, 13.3, 38.2, 15.6, 38.3, 15.1, 36.7, 14.3, 37, 12.5, 37.6],
  [8.4, 39, 9.6, 39.1, 9.8, 41, 9.2, 41.3, 8.2, 40.9, 8.5, 40],
  [8.6, 41.4, 9.4, 41.5, 9.5, 43, 8.6, 42.3],
  [11, 55.3, 12.6, 55.6, 12.3, 56.1, 11, 55.8],
  [23.5, 35.3, 26.2, 35.1, 25.8, 35.4, 23.6, 35.6],
];
const NM026_DE = [
  6, 51.8, 6.1, 50.8, 6.4, 50.3, 6.1, 49.5, 8.2, 48.9, 7.6, 47.6, 9.5, 47.6, 10.5, 47.5, 12.9, 47.6, 13, 48.3, 13.8, 48.8, 12.1, 50.3, 14.3, 51, 15, 51.1,
  14.7, 52.1, 14.2, 53.9, 12.5, 54.4, 11, 54, 10.8, 54.4, 10, 54.8, 8.6, 54.9, 8.8, 54, 8, 53.5, 7, 53.5, 7.2, 52.6,
];
// 薄い国境 (フランス・ポーランドなど。点線)
const NM026_BORDERS = [
  [1.8, 42.5, -1.8, 43.3], // ピレネー
  [2.5, 51.1, 4.5, 49.9, 6.1, 49.5], // フランス北
  [7.6, 47.6, 6.9, 46.3, 7, 45, 7.5, 43.8], // フランス=スイス・イタリア
  [6.9, 46.3, 9.5, 47.6], // スイス
  [7, 45, 10.5, 46.6, 13.7, 46.5, 13.7, 45.7], // アルプス (イタリア北)
  [14.2, 53.9, 15, 51.1], // ポーランド西
  [13.8, 48.8, 17, 48, 18.5, 49.5, 22.5, 49], // チェコ・スロバキア
  [10.5, 47.5, 13.7, 46.5, 16.5, 46.5, 19.5, 46.2, 22, 48, 26.5, 48.2], // オーストリア・ハンガリー
  [23.5, 54, 24, 52, 23.5, 50.5, 22.5, 49], // ポーランド東
  [12, 59, 12.5, 61.5, 12, 63.5, 14.5, 65.5, 18, 68.5], // ノルウェー=スウェーデン
  [24, 65.8, 28.5, 68, 30, 63.5, 28, 61, 28, 59.5], // フィンランド東
];
const nm026Line = (pts: number[]) =>
  pts.reduce<string[]>((a, _v, i) => {
    if (i % 2) return a;
    const [x, y] = nm026P(pts[i], pts[i + 1]);
    a.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    return a;
  }, []).join(" ");
const Nm026: React.FC<{ f: number }> = ({ f }) => {
  const pin = easeOut(seg(f, 4, 12));
  const wob = f > 12 ? Math.sin((f - 12) * 1.3) * 10 * Math.max(0, 1 - (f - 12) / 16) : 0;
  const rip = seg(f, 12, 24);
  const paint = easeOut(seg(f, 8, 18));
  const card = easeOut(seg(f, 12, 20));
  const forest = easeOut(seg(f, 14, 26));
  const town = easeOut(seg(f, 20, 32));
  const z = lerp(1, 1.08, easeInOut(seg(f, 0, 40)));
  const [PXc, PYc] = nm026P(10.2, 51.4); // ドイツの真ん中 (少し北) にピン
  const stand = (t: number, baseY: number, children: React.ReactNode) => (
    <g transform={`translate(0 ${baseY}) scale(1 ${Math.max(0.001, t)}) translate(0 ${-baseY})`}>{children}</g>
  );
  // 飛び出し札 (ベラルーシ〜ロシアの空き地の上。地図の主要な形をふさがない)
  const CX = 1480, CY = 330, CS = 0.42;
  return (
    <Frame f={f} seed={4026} bg={C.tableWood}>
      <g transform={cam(960, 400, z)}>
        {/* 机 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.tableWood} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -60 ${50 + i * 140} q 500 ${rnd(4026, i) * 40 - 20} 1000 0 q 500 ${rnd(4027, i) * 40 - 20} 1040 0`} stroke={C.tableWoodDark} strokeWidth={5} fill="none" />
        ))}
        {/* 地図 (羊皮紙) */}
        <g transform="rotate(-1.5 960 450)">
          <path d="M 120 60 L 1800 50 L 1810 840 Q 1760 870 1700 852 L 130 860 Z" fill={C.parch} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M 1810 840 Q 1760 870 1700 852 Q 1740 830 1810 840 Z" fill={C.parchDark} stroke={KRP.ink} strokeWidth={4} />
          <defs>
            <clipPath id="nm026sea"><rect x={150} y={80} width={1630} height={750} /></clipPath>
          </defs>
          {/* 海 */}
          <rect x={150} y={80} width={1630} height={750} fill={C.sea} opacity={0.75} stroke={C.mapInk} strokeWidth={4} />
          <g clipPath="url(#nm026sea)">
            {Array.from({ length: 12 }, (_, i) => {
              const [wx, wy] = [[260, 200], [330, 420], [420, 640], [250, 760], [560, 150], [640, 730], [1050, 700], [1200, 760], [1500, 700], [700, 260], [1650, 760], [380, 540]][i];
              return <path key={i} d={`M ${wx} ${wy + Math.sin(f / 9 + i) * 3} q 15 -10 30 0 q 15 10 30 0`} stroke={C.mapInk} strokeWidth={3} fill="none" opacity={0.55} />;
            })}
            {/* 陸 */}
            <path d={nm026Path(NM026_MAIN)} fill={C.land} stroke={NM026.landLine} strokeWidth={5} strokeLinejoin="round" />
            {NM026_ISLANDS.map((p, i) => (
              <path key={i} d={nm026Path(p)} fill={C.land} stroke={NM026.landLine} strokeWidth={5} strokeLinejoin="round" />
            ))}
            {/* 国境 (点線) */}
            <g stroke={C.mapInk} strokeWidth={3} strokeDasharray="9 8" fill="none" opacity={0.75}>
              {NM026_BORDERS.map((p, i) => <path key={i} d={nm026Line(p)} />)}
            </g>
            {/* ドイツ (濃く塗る) */}
            <path d={nm026Path(NM026_DE)} fill={NM026.de} fillOpacity={0.25 + 0.75 * paint} stroke={KRP.red} strokeWidth={6} strokeLinejoin="round" />
            {/* 斜線の塗り (古地図の手彩色の風合い) */}
            <clipPath id="nm026de"><path d={nm026Path(NM026_DE)} /></clipPath>
            <g clipPath="url(#nm026de)" stroke={NM026.deDark} strokeWidth={3} opacity={0.45 * paint}>
              {Array.from({ length: 16 }, (_, i) => <line key={i} x1={840 + i * 22} y1={290} x2={740 + i * 22} y2={560} />)}
            </g>
            {/* ライン川・エルベ川 */}
            <path d={nm026Line([7.6, 47.6, 8.4, 49, 7.6, 50.4, 6.8, 51.3, 6.1, 51.9, 4.5, 51.9])} stroke={KRP.blue} strokeWidth={5} fill="none" />
            <path d={nm026Line([14.3, 51, 12.4, 51.8, 11, 53, 9.8, 53.6, 8.8, 54])} stroke={KRP.blue} strokeWidth={4} fill="none" />
          </g>
          {/* 帆船 (大西洋) */}
          <g transform={`translate(330 ${520 + Math.sin(f / 8) * 6}) rotate(${Math.sin(f / 10) * 4}) scale(0.8)`}>
            <path d="M -60 0 L 60 0 L 40 30 L -40 30 Z" fill={C.timber} stroke={KRP.ink} strokeWidth={4} />
            <line x1={0} y1={0} x2={0} y2={-110} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 4 -100 Q 60 -60 4 -14 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -4 -90 Q -44 -56 -4 -20 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 方位盤 */}
          <g transform="translate(300 290)">
            <circle r={62} fill={C.parch} stroke={C.mapInk} strokeWidth={4} />
            <path d="M 0 -70 L 14 0 L 0 70 L -14 0 Z" fill={C.mapInk} />
            <path d="M -70 0 L 0 14 L 70 0 L 0 -14 Z" fill={C.mapInk} opacity={0.6} />
            <text x={0} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.mapInk}>N</text>
          </g>
          {/* 波紋 */}
          {rip > 0 && rip < 1 && [0, 1].map((k) => (
            <ellipse key={k} cx={PXc} cy={PYc} rx={(30 + k * 30) + rip * 90} ry={(10 + k * 10) + rip * 30} fill="none" stroke={KRP.red} strokeWidth={5} opacity={(1 - rip) * 0.8} />
          ))}
          {/* ピン → 飛び出し札の点線 */}
          {card > 0 && (
            <path d={`M ${PXc + 30} ${PYc - 20} Q ${(PXc + CX) / 2} ${PYc - 140} ${CX - 170} ${CY + 40}`} stroke={KRP.red} strokeWidth={5} strokeDasharray="12 10" fill="none" opacity={card} />
          )}
          {/* 飛び出し札: 森と木組みの町 (小さく) */}
          {card > 0.01 && (
            <g transform={`translate(${CX} ${CY}) scale(${card})`}>
              <rect x={-190} y={-130} width={380} height={190} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <rect x={-176} y={-116} width={352} height={162} rx={8} fill={C.sea} opacity={0.35} />
              <rect x={-190} y={20} width={380} height={40} fill={C.pine} opacity={0.5} />
              <g transform={`scale(${CS}) translate(-980 -560)`}>
                {forest > 0.01 && stand(forest, 560, (
                  <g>
                    <NAcPine x={680} y={560} s={0.9} />
                    <NAcPine x={740} y={560} s={1.15} />
                    <NAcPine x={810} y={560} s={0.95} />
                    <NAcPine x={865} y={560} s={1.05} />
                  </g>
                ))}
                {town > 0.01 && stand(town, 575, (
                  <g>
                    <rect x={990} y={525} width={320} height={50} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
                    {Array.from({ length: 8 }, (_, k) => <rect key={k} x={994 + k * 40} y={510} width={24} height={18} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />)}
                    <NAcHouse x={1040} y={525} s={0.9} w={80} h={90} />
                    <NAcHouse x={1150} y={525} s={1} w={90} h={70} tower />
                    <NAcHouse x={1260} y={525} s={0.85} w={84} h={100} />
                    <rect x={1130} y={545} width={40} height={30} rx={18} fill={KRP.ink} />
                  </g>
                ))}
              </g>
            </g>
          )}
        </g>
        {/* 重しの石 */}
        <ellipse cx={1790} cy={90} rx={80} ry={56} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1750 70 Q 1790 52 1830 72" stroke={KRP.white} strokeWidth={5} opacity={0.4} fill="none" />
        {/* 本と羽ペン (地図の左下の角を押さえる) */}
        <g transform="translate(150 900) rotate(-8)">
          <rect x={-120} y={-70} width={260} height={150} rx={8} fill={NM026.book} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-120} y={-70} width={28} height={150} fill={C.coverDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-60} y={-40} width={150} height={60} rx={6} fill="none" stroke={C.caution} strokeWidth={4} />
        </g>
        <g transform={`translate(1720 900) rotate(${-38 + Math.sin(f / 11) * 2})`}>
          <path d="M 0 0 Q 40 -120 10 -260 Q -40 -130 0 0 Z" fill={NM026.quill} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={10} x2={8} y2={-240} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* ピン */}
        {pin > 0 && (
          <g transform={`translate(${PXc} ${PYc - (1 - pin) * 500}) rotate(${wob + 12})`}>
            <ellipse cx={0} cy={2} rx={18} ry={6} fill={KRP.ink} opacity={0.3 * pin} />
            <line x1={0} y1={0} x2={0} y2={-110} stroke={KRP.silver} strokeWidth={8} strokeLinecap="round" />
            <line x1={0} y1={0} x2={0} y2={-110} stroke={KRP.ink} strokeWidth={2} />
            <circle cx={0} cy={-128} r={30} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={-9} cy={-138} r={8} fill={KRP.white} opacity={0.7} />
          </g>
        )}
      </g>
      <TagPlate x={960} y={500} text="ドイツ" size={40} t={seg(f, 12, 20)} />
      <TagPlate x={1520} y={160} text="約200年前" size={44} t={seg(f, 24, 32)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_019: (f) => <Nm019 f={f} />,
  nm_020: (f) => <Nm020 f={f} />,
  nm_021: (f) => <Nm021 f={f} />,
  nm_022: (f) => <Nm022 f={f} />,
  nm_023: (f) => <Nm023 f={f} />,
  nm_024: (f) => <Nm024 f={f} />,
  nm_025: (f) => <Nm025 f={f} />,
  nm_026: (f) => <Nm026 f={f} />,
};

export const NM_AC_MOTIFS: string[] = [
  "nm_019", // #19
  "nm_020", // #20
  "nm_021", // #21
  "nm_022", // #22
  "nm_023", // #23
  "nm_024", // #24
  "nm_025", // #25
  "nm_026", // #26
];

export const namaeAcScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
