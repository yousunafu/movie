// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#11〜#18 (8文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで8枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed はこのファイルでは 2010〜2017。
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
  // #11 食卓
  wall: "#EFE3C8", wallStripe: "#E4D3B0", cloth: "#FBF6EC", check: "#D97A6C",
  sky: "#BFDDF0", curtain: "#9DC3A8", curtainDark: "#77A386", sweater: "#E7A65A", sweaterDark: "#C4843C",
  chair: "#B07A48", chairDark: "#835733", mat: "#C9D9B4", toolRed: "#C9473A", toolRedDark: "#99342B",
  steel: "#B8C2CA", steelDark: "#7F8B95",
  // #12 #14 巻物
  desk: "#9C6B3F", deskDark: "#7A5230", washi: "#F3E7C9", washiDark: "#E3D2A8", washiEdge: "#C79A55",
  brocade: "#8E3B4A", brocadeGold: "#D9B85C", fog: "#B9B4AC", kasumi: "#EBD9A0", sumi: "#4A4038",
  // #13 地層
  skyDay: "#CFE6F4", bldg: "#B9C6D3", bldgDark: "#93A3B3", asphalt: "#5E5A57", gravel: "#9A8F80",
  soil: "#8A6544", soilDark: "#6E4F35", worm: "#E39A9A", root: "#5C4128", shard: "#C47A48",
  fossilLayer: "#B7A68A", fossilDark: "#998769", bone: "#F1E6CC", rockDeep: "#6A5E54", rockDeeper: "#544a42",
  cave: "#3B2E28", caveWall: "#5A463B", caveFloor: "#4E3D31", fireRed: "#D8502E", fireOrange: "#F09A3A",
  fireYellow: "#FBE07A", grass: "#B9A55A", grassDry: "#D6C27A", pipe: "#6E9CC2",
  // #14 窓の中
  frameWood: "#8A5A33", romeWall: "#B5523B", marble: "#EDE8DF", purple: "#7A4E8C", gold: "#E2BD4A",
  stone: "#A9A39A", stoneDark: "#857E74", monk: "#7C5534", monkDark: "#5D3E25", tatami: "#C9C27E",
  tatamiDark: "#A69E5C", bamboo: "#D8BE74", bambooDark: "#A88C42", labWall: "#D7E6D2", towel: "#F2E9DA",
  towelDark: "#D9CBB2", monkey: "#9A6A44", monkeyFace: "#F2C7A8",
  // #15 夕暮れ
  dusk1: "#5D4B7C", dusk2: "#8E5A80", dusk3: "#D47658", dusk4: "#EFA35A", dusk5: "#F8D27E",
  hill: "#6B5A6E", field: "#7D7A45", fieldDark: "#646235", road: "#C9A877", roadDark: "#A88A5C",
  doorWood: "#9B6236", doorDark: "#6E4224", warm: "#FFE3A0", sun: "#FBE3A6",
  // #16 博物館
  museumWall: "#2F5552", museumDark: "#244240", marbleFloor: "#E6E0D4", marbleVein: "#C9C0AF",
  velvet: "#7E2F3A", velvetDark: "#5E222B", caseWood: "#5B3A24", glass: "#DCEFF2", spot: "#FFF4CF",
  bear: "#C08A55", bearDark: "#946638", cushion: "#7FA6C9", cushionDark: "#5D86AB", blanket: "#D98C7A",
  blanketDark: "#B56D5C", pillow: "#F6F2EA", signWood: "#C99A5E", signBack: "#B58A50", rope: "#A8323A",
  // #17 工房
  plank: "#B98A5A", plankDark: "#9A6F45", peg: "#D8BC8E", apron: "#4F6A84", apronDark: "#3A5068",
  shirt: "#7FA9CF", lampGlow: "#FFE9A8",
  // #18 書斎
  studyWall: "#5E4A3A", shelf: "#4A3628", ocean: "#7FB2D6", oceanDark: "#5E93BC", land: "#9CC07A",
  landDark: "#7DA05C", desert: "#D9C07E", lampGreen: "#4E8A5E", book1: "#8E3B3B", book2: "#3E5F8A",
  book3: "#5F7A3E", book4: "#B8863A",
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

// カメラ: (cx,cy) を画面中央に、z 倍で見る
const YbCam: React.FC<{ cx: number; cy: number; z: number; children?: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

// 2関節の腕 (肩 → 肘 → 手)。腕まくりなら前腕は素肌色
const YbArm: React.FC<{
  sx: number; sy: number; gx: number; gy: number; L1: number; L2: number; bend: 1 | -1;
  w: number; cloth: string; rolled?: boolean;
}> = ({ sx, sy, gx, gy, L1, L2, bend, w, cloth, rolled }) => {
  const d = Math.min(Math.hypot(gx - sx, gy - sy), L1 + L2 - 2);
  const th = Math.atan2(gy - sy, gx - sx);
  const cosA = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)));
  const a = Math.acos(cosA) * bend;
  const ex = sx + L1 * Math.cos(th + a), ey = sy + L1 * Math.sin(th + a);
  const th2 = Math.atan2(gy - ey, gx - ex);
  const hx = ex + L2 * Math.cos(th2), hy = ey + L2 * Math.sin(th2);
  const fore = rolled ? KRP.white : cloth;
  return (
    <g strokeLinecap="round">
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={KRP.ink} strokeWidth={w + 9} />
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={cloth} strokeWidth={w} />
      <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={KRP.ink} strokeWidth={w * 0.85 + 9} />
      <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={fore} strokeWidth={w * 0.85} />
      {rolled && <circle cx={ex} cy={ey} r={w * 0.62} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />}
      <circle cx={hx} cy={hy} r={w * 0.6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#11 【並】 食べられもしないし、何かの役に立つわけでもない。なのに、触ると落ち着く。
// 設計: 食卓。皿の上の `Squishy` にナイフとフォーク→「×」。工具箱のトンカチの横に置いても「×」。最後に Person が両手で包んで頬に寄せ、目を閉じてほっと (◯)
// どこ: 昼の台所の食卓 (ギンガムのテーブルクロス・窓・壁掛け時計・吊りランプ)。手前から奥へ テーブル面
// 演出: 1つのスクイーズが 皿 → 工具箱の横 → 人の手の中 と卓上を移動。皿と工具箱には × が残り、手の中で ◯
// 動き: f0〜10 皿に寄った画 (ナイフとフォークが迫る→×) / f10〜16 横へパン、スクイーズがぽんと跳ぶ / f17〜23 トンカチの横に着地→×
//       f24〜31 人の手へ放物線で飛ぶ / f24〜38 カメラが引いて食卓全体 / f30〜 目を閉じてほっと・波線・◯
const Yw011: React.FC<{ f: number }> = ({ f }) => {
  const t1 = easeInOut(seg(f, 10, 16));
  const t2 = easeInOut(seg(f, 24, 38));
  const cx = lerp(lerp(430, 800, t1), 960, t2);
  const cy = lerp(640, 540, t2);
  const z = lerp(1.3, 1, t2);
  // スクイーズの位置
  const A = [280, 800], B = [800, 800], HN = [1392, 704];
  const hop = seg(f, 11, 17);
  const fly = seg(f, 24, 31);
  let sx: number, sy: number, ss: number, sr: number, sq = 0;
  if (f < 24) {
    sx = lerp(A[0], B[0], easeInOut(hop));
    sy = lerp(A[1], B[1], hop) - Math.sin(Math.PI * hop) * 130;
    ss = 0.85; sr = Math.sin(Math.PI * hop) * -14;
    sq = hop >= 1 ? Math.max(0, 0.45 - (f - 17) * 0.12) : 0;
  } else {
    const e = easeInOut(fly);
    sx = lerp(B[0], HN[0], e);
    sy = lerp(B[1], HN[1], e) - Math.sin(Math.PI * fly) * 240;
    ss = lerp(0.85, 0.6, e); sr = lerp(0, -12, e);
    sq = fly >= 1 ? Math.max(0, 0.3 - (f - 31) * 0.06) : 0;
  }
  const held = f >= 31;
  // ナイフとフォーク
  const k = easeOut(seg(f, 1, 7));
  const back = easeOut(seg(f, 9, 13));
  const forkX = lerp(lerp(60, 150, k), 130, back), forkY = lerp(lerp(600, 640, k), 805, back);
  const forkR = lerp(lerp(50, 62, k), 0, back);
  const knifeX = lerp(lerp(510, 420, k), 440, back), knifeY = lerp(lerp(600, 640, k), 805, back);
  const knifeR = lerp(lerp(-50, -62, k), 0, back);
  const lieS = lerp(1, 0.62, back);
  // ギンガム (遠近法)
  const VY = 150, EY = 706;
  const kk = (1080 - VY) / (EY - VY);
  const colX = (i: number, y: number) => 960 + i * 110 * ((y - VY) / (EY - VY));
  const rows = [706, 742, 790, 852, 934, 1040, 1100];
  const person = { x: 1360, y: 850, s: 1.8 };
  const calm = seg(f, 31, 40);
  return (
    <Frame f={f} seed={2010} bg={C.wall}>
      <YbCam cx={cx} cy={cy} z={z}>
        {/* 壁 (縦じまの壁紙) */}
        <rect x={-400} y={-300} width={2800} height={1100} fill={C.wall} />
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={-400 + i * 96} y={-300} width={40} height={1010} fill={C.wallStripe} opacity={0.6} />
        ))}
        {/* 窓 (空・雲・カーテン) */}
        <rect x={110} y={110} width={420} height={360} fill={C.sky} stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={260 + Math.sin(f / 30) * 10} cy={220} rx={80} ry={26} fill={KRP.white} opacity={0.9} />
        <ellipse cx={420 + Math.sin(f / 26) * 8} cy={300} rx={56} ry={18} fill={KRP.white} opacity={0.8} />
        <line x1={320} y1={110} x2={320} y2={470} stroke={KRP.ink} strokeWidth={8} />
        <line x1={110} y1={290} x2={530} y2={290} stroke={KRP.ink} strokeWidth={8} />
        <rect x={90} y={470} width={460} height={22} rx={4} fill={C.chair} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 80 96 L 170 96 Q 150 300 ${190 + Math.sin(f / 12) * 6} 480 L 80 480 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 560 96 L 470 96 Q 490 300 ${450 + Math.sin(f / 12 + 1) * 6} 480 L 560 480 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 110 150 Q 130 300 120 470" stroke={C.curtainDark} strokeWidth={5} fill="none" />
        <path d="M 530 150 Q 510 300 520 470" stroke={C.curtainDark} strokeWidth={5} fill="none" />
        <rect x={70} y={84} width={500} height={16} rx={8} fill={C.chairDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 壁掛け時計 (秒針が動く) */}
        <g transform="translate(1720 200)">
          <circle r={86} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          <circle r={74} fill="none" stroke={C.chair} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-62} x2={0} y2={-50} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-46} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform="rotate(300)" />
          <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" transform="rotate(60)" />
          <line x1={0} y1={0} x2={0} y2={-58} stroke={KRP.red} strokeWidth={3} transform={`rotate(${f * 6})`} />
          <circle r={7} fill={KRP.ink} />
        </g>
        {/* 吊りランプ */}
        <line x1={800} y1={-300} x2={800} y2={130} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 720 200 Q 730 128 800 126 Q 870 128 880 200 Z" fill={C.sweater} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={800} cy={204} rx={34} ry={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        {/* 棚と小びん */}
        <rect x={1000} y={250} width={420} height={18} rx={4} fill={C.chair} stroke={KRP.ink} strokeWidth={5} />
        {[1040, 1110, 1180].map((bx, i) => (
          <g key={bx}>
            <rect x={bx} y={180 - i * 6} width={50} height={70 + i * 6} rx={10} fill={[C.mat, C.check, KRP.yellow][i]} stroke={KRP.ink} strokeWidth={5} />
            <rect x={bx + 6} y={170 - i * 6} width={38} height={16} rx={4} fill={C.chairDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 1300 250 Q 1290 190 1320 180 Q 1350 190 1340 250 Z" fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1320 182 Q 1300 140 1280 150 M 1320 182 Q 1340 130 1370 140 M 1320 182 Q 1322 130 1318 120" stroke={C.curtainDark} strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* 椅子の背もたれ (人の後ろ) */}
        <rect x={person.x - 150} y={500} width={24} height={240} rx={8} fill={C.chair} stroke={KRP.ink} strokeWidth={6} />
        <rect x={person.x + 126} y={500} width={24} height={240} rx={8} fill={C.chair} stroke={KRP.ink} strokeWidth={6} />
        <rect x={person.x - 160} y={486} width={320} height={40} rx={14} fill={C.chair} stroke={KRP.ink} strokeWidth={6} />
        <rect x={person.x - 150} y={570} width={300} height={22} rx={8} fill={C.chairDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 人 (座っている。下半身はテーブルの向こう) */}
        <Person x={person.x} y={person.y} s={person.s} f={f} cloth={C.sweater} clothDark={C.sweaterDark}
          face={held ? "joy" : f > 19 ? "worried" : "normal"} gaze={[-1, 0.3]}
          pose={held ? "hold" : "stand"} lean={held ? 5 * calm + 1 : 0} />
        {/* テーブル面 (ギンガムのクロス) */}
        <rect x={-400} y={EY} width={2800} height={800} fill={C.cloth} />
        {Array.from({ length: 24 }, (_, j) => {
          const i = j - 12;
          if (i % 2 !== 0) return null;
          return (
            <polygon key={j} fill={C.check} opacity={0.28}
              points={`${colX(i, EY)},${EY} ${colX(i + 1, EY)},${EY} ${colX(i + 1, 1100) + 0},1100 ${colX(i, 1100)},1100`} />
          );
        })}
        {rows.slice(0, -1).map((ry, i) => (i % 2 === 0 ? (
          <rect key={ry} x={-400} y={ry} width={2800} height={rows[i + 1] - ry} fill={C.check} opacity={0.28} />
        ) : null))}
        <line x1={-400} y1={EY} x2={2400} y2={EY} stroke={KRP.ink} strokeWidth={7} />
        <path d={`M -400 ${EY + 6} L 2400 ${EY + 6}`} stroke={C.check} strokeWidth={4} opacity={0.4} />
        {void kk}
        {/* ランチョンマット・皿・コップ */}
        <polygon points="110,752 470,752 510,860 70,860" fill={C.mat} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="128,764 452,764 486,848 92,848" fill="none" stroke={C.curtainDark} strokeWidth={3} strokeDasharray="10 8" />
        <ellipse cx={280} cy={808} rx={160} ry={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={280} cy={806} rx={112} ry={22} fill="none" stroke={KRP.blueSoft} strokeWidth={6} />
        <g transform="translate(560 790)">
          <path d="M -36 -110 L 36 -110 L 28 0 L -28 0 Z" fill={KRP.blueSoft} opacity={0.6} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -32 -60 L 32 -60 L 28 0 L -28 0 Z" fill={KRP.blue} opacity={0.5} />
          <ellipse cx={0} cy={-110} rx={36} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-20} y1={-96} x2={-16} y2={-14} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* 工具箱 (ふたが開いている) とトンカチ・くぎ */}
        <g transform="translate(990 812)">
          <polygon points="-130,-90 130,-90 150,-170 -110,-170" fill={C.toolRedDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-60} y={-140} width={14} height={70} rx={4} fill={C.steel} stroke={KRP.ink} strokeWidth={4} transform="rotate(-18)" />
          <path d="M -20 -150 l 18 -30 l 18 30" fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          <rect x={40} y={-150} width={60} height={14} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-130} y={-92} width={260} height={92} rx={8} fill={C.toolRed} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-130} y={-92} width={260} height={18} fill={C.toolRedDark} opacity={0.6} />
          <rect x={-26} y={-60} width={52} height={22} rx={4} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          {[-100, 100].map((bx) => <circle key={bx} cx={bx} cy={-46} r={6} fill={C.steelDark} />)}
        </g>
        <g transform={`translate(${f >= 17 && f < 22 ? Math.sin(f * 3) * 3 : 0} 0)`}>
          <rect x={520} y={812} width={150} height={20} rx={9} fill={C.chair} stroke={KRP.ink} strokeWidth={5} />
          <rect x={656} y={784} width={36} height={74} rx={6} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {[1150, 1180].map((nx, i) => (
          <g key={nx} transform={`rotate(${i ? 24 : -10} ${nx} 820)`}>
            <rect x={nx - 3} y={790} width={6} height={36} fill={C.steelDark} stroke={KRP.ink} strokeWidth={2} />
            <rect x={nx - 8} y={786} width={16} height={6} rx={2} fill={C.steelDark} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ))}
        {/* フォーク (歯は上) */}
        <g transform={`translate(${forkX} ${forkY}) rotate(${forkR}) scale(1 ${lieS})`}>
          <rect x={-8} y={-30} width={16} height={100} rx={7} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -22 -30 L -22 -90 M -7 -30 L -7 -92 M 7 -30 L 7 -92 M 22 -30 L 22 -90" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          <path d="M -22 -30 L -22 -90 M -7 -30 L -7 -92 M 7 -30 L 7 -92 M 22 -30 L 22 -90" stroke={C.steel} strokeWidth={4} strokeLinecap="round" />
          <path d="M -24 -40 Q 0 -20 24 -40" stroke={KRP.ink} strokeWidth={4} fill={C.steel} />
        </g>
        {/* ナイフ */}
        <g transform={`translate(${knifeX} ${knifeY}) rotate(${knifeR}) scale(1 ${lieS})`}>
          <rect x={-9} y={-10} width={18} height={80} rx={7} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -10 -10 L -10 -100 Q 14 -90 12 -10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* スクイーズ (1つだけ。皿 → 工具箱の横 → 手の中) */}
        <Squishy x={sx} y={sy} s={ss} squeeze={sq} f={f} rot={sr} face={held ? "smile" : undefined} />
        {/* 両手で包む (自分で足した手) */}
        {held && (
          <g>
            <circle cx={HN[0] - 76} cy={HN[1] - 40} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={HN[0] + 70} cy={HN[1] - 58} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          </g>
        )}
        {/* × が皿と工具箱に残る */}
        <XMark x={280} y={600} s={1.15} t={seg(f, 6, 10)} />
        <XMark x={810} y={600} s={1.15} t={seg(f, 19, 23)} />
        {/* ほっとした安心の波線 */}
        {calm > 0 && [0, 1, 2].map((i) => {
          const rise = ((f - 31) * 2 + i * 22) % 60;
          return (
            <path key={i} d={`M ${1210 - i * 30} ${520 - rise} q 20 -16 40 0 q 20 16 40 0`} fill="none"
              stroke={C.sweaterDark} strokeWidth={6} strokeLinecap="round" opacity={calm * (1 - rise / 70)} />
          );
        })}
        <Maru x={1620} y={360} s={0.9} t={seg(f, 33, 40)} />
      </YbCam>
    </Frame>
  );
};

// ---- 文#12 【図】 では人類は、いつから柔らかいものが好きなのでしょうか。
// 設計: 広げた絵巻 (世界=巻物の紙)。右端に今のスクイーズとソファの小さな絵、そこから左へ巻物がするする伸びて、左端は「?」の霧
// どこ: 木の机の上。硯・筆・文鎮・湯のみ。机いっぱいに絵巻を広げる
// 演出: 右端の「今」の小さな絵から、巻物が左 (=過去) へ伸びる。伸びた紙の左は灰色の霧で何も描かれておらず「?」が浮かぶ
// 動き: f4〜36 で巻いた芯が左へ転がり (芯の縞が回る)、紙と年代の目盛りが現れる。霧はゆらぎ、「?」は芯が通過するとぽんと出る。カメラは芯を追って左へ引く
const Yw012: React.FC<{ f: number }> = ({ f }) => {
  const u = easeInOut(seg(f, 4, 36));
  const Lx = lerp(1250, 180, u);
  const r = lerp(64, 44, u);
  const ang = ((1250 - Lx) / r);
  const PT = 300, PB = 760;
  const cam = easeInOut(seg(f, 0, 38));
  const qs: [number, number, number][] = [[1020, 470, 0.9], [760, 560, 1.1], [480, 450, 1.3]];
  return (
    <Frame f={f} seed={2011} bg={C.desk}>
      <YbCam cx={lerp(1160, 960, cam)} cy={540} z={lerp(1.14, 1, cam)}>
        {/* 机 (木目) */}
        <rect x={-300} y={-200} width={2500} height={1500} fill={C.desk} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -300 ${-60 + i * 150} q 600 ${rnd(12, i) * 40 - 20} 1250 0 q 600 ${rnd(13, i) * 40 - 20} 1250 0`}
            stroke={C.deskDark} strokeWidth={5} opacity={0.5} fill="none" />
        ))}
        {/* 硯と筆・湯のみ */}
        <g transform="translate(260 910)">
          <rect x={-120} y={-60} width={240} height={120} rx={20} fill={C.sumi} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={-40} cy={0} rx={60} ry={38} fill={KRP.ink} />
          <ellipse cx={-52} cy={-10} rx={16} ry={6} fill={KRP.gray} opacity={0.4} />
          <rect x={30} y={-30} width={70} height={30} rx={6} fill={KRP.ink} transform="rotate(-12 65 -15)" />
        </g>
        <g transform="rotate(-8 700 900)">
          <rect x={520} y={890} width={300} height={18} rx={8} fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 820 884 Q 880 899 820 914 Z" fill={KRP.ink} />
        </g>
        <g transform="translate(1830 180)">
          <path d="M -60 -50 L 60 -50 L 48 50 Q 0 64 -48 50 Z" fill={C.washiEdge} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-50} rx={60} ry={14} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-20 + i * 20} -76 q ${-10 + Math.sin(f / 6 + i) * 6} -20 0 -40`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />
          ))}
        </g>
        {/* 紙の影 */}
        <rect x={Lx} y={PT + 14} width={1760 - Lx} height={PB - PT} fill={KRP.ink} opacity={0.18} />
        {/* 紙 (芯から右へ) */}
        <rect x={Lx} y={PT} width={1740 - Lx} height={PB - PT} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <clipPath id="yb12clip"><rect x={Lx} y={PT} width={1740 - Lx} height={PB - PT} /></clipPath>
        <g clipPath="url(#yb12clip)">
          {/* 紙の繊維 */}
          {Array.from({ length: 70 }, (_, i) => (
            <path key={i} d={`M ${200 + rnd(1, i) * 1520} ${PT + 40 + rnd(2, i) * 380} q 10 ${rnd(3, i) * 8 - 4} 24 0`}
              stroke={C.washiDark} strokeWidth={3} fill="none" />
          ))}
          {/* 上下の縁の模様 (菱) */}
          {[PT, PB - 34].map((by) => (
            <g key={by}>
              <rect x={100} y={by} width={1700} height={34} fill={C.washiEdge} opacity={0.55} />
              {Array.from({ length: 44 }, (_, i) => (
                <path key={i} d={`M ${120 + i * 40} ${by + 17} l 12 -10 l 12 10 l -12 10 Z`} fill={C.brocade} opacity={0.55} />
              ))}
            </g>
          ))}
          {/* 霧 (左ほど濃い) */}
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse key={i} cx={180 + i * 100 + Math.sin(f / 14 + i) * 14} cy={530 + Math.sin(i * 1.7) * 60}
              rx={190} ry={150} fill={C.fog} opacity={0.11 * (10 - i) / 3} />
          ))}
          {/* 年代の目盛り (数字なし) */}
          <line x1={100} y1={680} x2={1720} y2={680} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 28 }, (_, i) => {
            const tx = 1700 - i * 56;
            const long = i % 5 === 0;
            return <line key={i} x1={tx} y1={680} x2={tx} y2={long ? 636 : 656} stroke={KRP.ink} strokeWidth={long ? 6 : 4} />;
          })}
          {/* 今の小さな絵: ソファの線画とスクイーズ */}
          <g transform="translate(1340 640)">
            <rect x={-120} y={-150} width={240} height={90} rx={22} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-104} y={-70} width={208} height={50} rx={14} fill={C.washiDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-140} y={-110} width={44} height={96} rx={18} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
            <rect x={96} y={-110} width={44} height={96} rx={18} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-132} y={-20} width={264} height={14} rx={6} fill={C.washiEdge} stroke={KRP.ink} strokeWidth={4} />
            <line x1={-110} y1={-6} x2={-114} y2={10} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <line x1={110} y1={-6} x2={114} y2={10} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <line x1={0} y1={-140} x2={0} y2={-72} stroke={C.washiEdge} strokeWidth={4} strokeDasharray="8 6" />
          </g>
          <Squishy x={1560} y={640} s={0.45} f={f} />
          {/* 左へ進む矢 (過去へ) */}
          <path d={`M ${Math.max(Lx + 120, 1200)} 720 L 1180 720`} stroke={KRP.red} strokeWidth={0} />
        </g>
        {/* ？ (芯が通り過ぎたら出る) */}
        {qs.map(([qx, qy, qsz], i) => (
          <QMark key={i} x={qx} y={qy} s={qsz} f={f + i * 13} t={clamp01((qx - 60 - Lx) / 160)} color={KRP.grayDark} />
        ))}
        {/* 右の軸と表紙 (錦) と紐 */}
        <rect x={1740} y={PT - 6} width={70} height={PB - PT + 12} fill={C.brocade} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={1775} cy={PT + 30 + i * 58} r={12} fill="none" stroke={C.brocadeGold} strokeWidth={4} />
        ))}
        <rect x={1806} y={PT - 30} width={34} height={PB - PT + 60} rx={10} fill={C.chairDark} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 1840 ${540} q 40 ${30 + Math.sin(f / 8) * 8} 20 120 q -14 50 20 90`} stroke={C.brocadeGold} strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* 文鎮 */}
        <rect x={1460} y={PT - 18} width={200} height={34} rx={8} fill={C.sumi} stroke={KRP.ink} strokeWidth={5} />
        {/* 左の巻いた芯 (転がる) */}
        <g>
          <rect x={Lx - r} y={PT - 10} width={r * 2} height={PB - PT + 20} rx={r * 0.3} fill={C.washiDark} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = ang + (i * Math.PI) / 4;
            if (Math.cos(a) < 0.1) return null;
            return <line key={i} x1={Lx + r * Math.sin(a)} y1={PT - 6} x2={Lx + r * Math.sin(a)} y2={PB + 6} stroke={C.washiEdge} strokeWidth={4} opacity={Math.cos(a)} />;
          })}
          <rect x={Lx - 18} y={PT - 44} width={36} height={40} rx={10} fill={C.chairDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={Lx - 18} y={PB + 4} width={36} height={40} rx={10} fill={C.chairDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <TagPlate x={1450} y={420} text="今" size={44} t={seg(f, 0, 6)} />
      </YbCam>
    </Frame>
  );
};

// ---- 文#13 【山】 調べてみると、話は20万年前の洞窟までさかのぼりました。
// 設計: カメラが縦にスクロール: 現代の街の地面 → アスファルト → 土 → 化石の層 → 洞窟の天井が抜けて焚き火が見える。左端の年代メーター 2026年→1万年前→20万年前
// どこ: 高さ3000pxの縦長の地層の断面。上は今の街 (道路・マンホール・電柱・街路樹・歩く人)、下は20万年前の洞窟
// 演出: 地面の下へ潜っていく。土器のかけら・貝や骨の化石を通り過ぎ、天井のつららの間から焚き火の洞窟がひらける。洞窟の中には毛皮の人と、焚き火のそばの草の寝床 (この後の伏線)
// 動き: f0〜40 で縦スクロール (ゆっくり出て・ゆっくり止まる)。左の年代メーターの針が一緒に下がり、通過した札が黄色く光る。焚き火がゆれ、火の粉が上がる。ミミズがうねる
const YbFire: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const flame = (w: number, h: number, ph: number) => {
    const hh = h * (1 + 0.1 * Math.sin(f / 2 + ph));
    const tip = Math.sin(f / 3 + ph) * w * 0.4;
    return `M ${-w} 0 C ${-w} ${-hh * 0.5} ${-w * 0.2} ${-hh * 0.6} ${tip} ${-hh} C ${w * 0.2} ${-hh * 0.6} ${w} ${-hh * 0.5} ${w} 0 Z`;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[260, 190, 130].map((rr, i) => (
        <circle key={rr} cx={0} cy={-60} r={rr * (1 + Math.sin(f / 4 + i) * 0.03)} fill={C.fireOrange} opacity={0.08 + i * 0.05} />
      ))}
      {/* 石の輪 */}
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={-96 + i * 32} cy={8 + Math.abs(i - 3) * -2} rx={24} ry={15} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 薪 */}
      <rect x={-80} y={-20} width={160} height={22} rx={10} fill={C.chairDark} stroke={KRP.ink} strokeWidth={5} transform="rotate(14)" />
      <rect x={-80} y={-20} width={160} height={22} rx={10} fill={C.chair} stroke={KRP.ink} strokeWidth={5} transform="rotate(-14)" />
      <path d={flame(66, 170, 0)} fill={C.fireRed} stroke={KRP.ink} strokeWidth={5} />
      <path d={flame(46, 124, 1.3)} fill={C.fireOrange} />
      <path d={flame(26, 76, 2.1)} fill={C.fireYellow} />
      {/* 火の粉 */}
      {Array.from({ length: 7 }, (_, i) => {
        const p = ((f * 2.4 + i * 37) % 120) / 120;
        return <circle key={i} cx={Math.sin(i * 2 + p * 6) * 50} cy={-120 - p * 220} r={5 * (1 - p) + 1} fill={C.fireYellow} opacity={1 - p} />;
      })}
    </g>
  );
};
const Yw013: React.FC<{ f: number }> = ({ f }) => {
  const p = easeInOut(seg(f, 0, 40));
  const scroll = p * 1920;
  const GY = 560;
  const walkX = 1080 + f * 4;
  const needle = lerp(170, 760, p);
  const marks: [string, number, number, number][] = [["今", 180, 40, 0.0], ["1万年前", 470, 32, 0.45], ["20万年前", 760, 32, 0.95]];
  // 洞窟の空洞の形 (世界座標)
  const cave = "M 300 2760 Q 290 2400 420 2200 Q 560 2060 800 2080 Q 960 2030 1140 2070 Q 1420 2040 1600 2160 Q 1800 2300 1820 2560 Q 1830 2700 1810 2760 Z";
  return (
    <Frame f={f} seed={2012} bg={C.cave}>
      <g transform={`translate(0 ${-scroll})`}>
        {/* ===== 今の街 ===== */}
        <rect x={-20} y={-20} width={1960} height={GY + 20} fill={C.skyDay} />
        <ellipse cx={1500} cy={120} rx={120} ry={34} fill={KRP.white} opacity={0.85} />
        {[[420, 260, 160], [600, 180, 140], [760, 300, 120], [1240, 220, 170], [1460, 280, 130], [1640, 200, 150], [1820, 260, 140]].map(([bx, by, bw], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={GY - 30 - by} fill={i % 2 ? C.bldg : C.bldgDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.floor((GY - 60 - by) / 50) }, (_, r) => Array.from({ length: Math.floor(bw / 44) }, (_, c) => (
              <rect key={`${r}-${c}`} x={bx + 14 + c * 44} y={by + 18 + r * 50} width={22} height={26} fill={KRP.blueSoft} opacity={0.8} />
            )))}
          </g>
        ))}
        {/* 歩道と車道 */}
        <rect x={-20} y={GY - 34} width={1960} height={34} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={i * 100} y1={GY - 34} x2={i * 100 - 14} y2={GY} stroke={KRP.grayDark} strokeWidth={3} />)}
        {/* 街路樹 */}
        <rect x={680} y={360} width={34} height={170} fill={C.root} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={697} cy={320} r={110} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={640} cy={290} r={40} fill={C.curtainDark} opacity={0.5} />
        {/* 電柱 */}
        <rect x={1520} y={20} width={30} height={GY + 140} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1470} y={70} width={130} height={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -20 60 Q 700 120 1535 76 Q 1800 60 1940 90" stroke={KRP.ink} strokeWidth={3} fill="none" />
        {/* 歩く人 */}
        <Person x={walkX} y={GY - 30} s={0.95} f={f * 2} cloth={KRP.blueDeep} clothDark={C.apronDark} gaze={[1, 0]} pose="run" />
        {/* カラーコーン */}
        <path d="M 300 526 L 330 440 L 360 526 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <rect x={318} y={474} width={24} height={12} fill={KRP.white} />
        {/* ===== 地下 ===== */}
        <rect x={-20} y={GY} width={1960} height={50} fill={C.asphalt} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={rnd(31, i) * 1920} cy={GY + 10 + rnd(32, i) * 32} r={3} fill={KRP.gray} opacity={0.6} />)}
        <rect x={-20} y={GY + 50} width={1960} height={120} fill={C.gravel} />
        {Array.from({ length: 70 }, (_, i) => <ellipse key={i} cx={rnd(33, i) * 1920} cy={GY + 60 + rnd(34, i) * 100} rx={10 + rnd(35, i) * 10} ry={7} fill={KRP.gray} stroke={KRP.ink} strokeWidth={2.5} />)}
        {/* マンホールの縦穴とはしご */}
        <rect x={1060} y={GY - 6} width={140} height={14} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1070} y={GY + 8} width={120} height={230} fill={C.rockDeeper} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={1098} y1={GY + 40 + i * 42} x2={1162} y2={GY + 40 + i * 42} stroke={C.steel} strokeWidth={7} />)}
        {/* 水道管 */}
        <rect x={-20} y={GY + 120} width={1080} height={40} fill={C.pipe} stroke={KRP.ink} strokeWidth={5} />
        <rect x={500} y={GY + 112} width={30} height={56} fill={C.pipe} stroke={KRP.ink} strokeWidth={5} />
        {/* 土の層 */}
        <rect x={-20} y={720} width={1960} height={530} fill={C.soil} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={rnd(36, i) * 1920} cy={760 + rnd(37, i) * 470} r={4 + rnd(38, i) * 5} fill={C.soilDark} />)}
        {/* 電柱の根元と木の根 */}
        <rect x={1520} y={GY} width={30} height={260} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.root} strokeWidth={10} fill="none" strokeLinecap="round">
          <path d="M 697 600 Q 640 760 560 900 Q 520 960 540 1040" />
          <path d="M 697 600 Q 760 780 880 860 Q 940 900 960 980" />
          <path d="M 640 760 Q 600 780 540 780" strokeWidth={6} />
          <path d="M 800 800 Q 840 760 900 770" strokeWidth={6} />
        </g>
        {/* ミミズ */}
        {[[300, 880], [1300, 1000], [900, 1150]].map(([wx, wy], i) => (
          <path key={i} d={`M ${wx} ${wy} q 20 ${Math.sin(f / 3 + i) * 14} 40 0 q 20 ${-Math.sin(f / 3 + i) * 14} 40 0 q 20 ${Math.sin(f / 3 + i) * 14} 40 0`}
            stroke={C.worm} strokeWidth={13} fill="none" strokeLinecap="round" />
        ))}
        {/* 土器のかけら (縄目) */}
        {[[420, 1150, -12], [1650, 1120, 18], [1180, 1200, 4]].map(([dx, dy, dr], i) => (
          <g key={i} transform={`translate(${dx} ${dy}) rotate(${dr})`}>
            <path d="M -60 -20 L 50 -34 L 62 20 L -40 30 Z" fill={C.shard} stroke={KRP.ink} strokeWidth={5} />
            {[-30, -6, 18, 40].map((lx) => <path key={lx} d={`M ${lx} -24 l 8 46`} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />)}
          </g>
        ))}
        {/* 化石の層 (しま模様の地層) */}
        <rect x={-20} y={1250} width={1960} height={500} fill={C.fossilLayer} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -20 ${1300 + i * 80} q 480 ${rnd(40, i) * 30 - 15} 980 0 q 480 ${rnd(41, i) * 30 - 15} 980 0`} stroke={C.fossilDark} strokeWidth={5} fill="none" />
        ))}
        {/* アンモナイト風の巻き貝 */}
        <g transform="translate(560 1400)">
          <circle r={70} fill={C.bone} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 0 0 m -8 0 a 8 8 0 1 1 16 0 a 18 18 0 1 1 -36 0 a 30 30 0 1 1 60 0 a 44 44 0 1 1 -88 0" fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 二枚貝 */}
        {[[1100, 1340], [1260, 1380], [300, 1600]].map(([bx, by], i) => (
          <g key={i} transform={`translate(${bx} ${by}) rotate(${i * 30 - 20})`}>
            <path d="M -40 10 Q 0 -60 40 10 Z" fill={C.bone} stroke={KRP.ink} strokeWidth={5} />
            {[-20, 0, 20].map((lx) => <line key={lx} x1={0} y1={8} x2={lx} y2={-30} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
        ))}
        {/* 骨 */}
        <g transform="translate(1450 1600) rotate(-8)">
          <rect x={-150} y={-16} width={300} height={32} rx={14} fill={C.bone} stroke={KRP.ink} strokeWidth={6} />
          {[-150, 150].map((ex) => [-16, 16].map((ey) => <circle key={`${ex}${ey}`} cx={ex} cy={ey} r={24} fill={C.bone} stroke={KRP.ink} strokeWidth={6} />))}
          <rect x={-150} y={-14} width={300} height={28} fill={C.bone} />
        </g>
        {/* 魚の化石 */}
        <g transform="translate(860 1640)">
          <path d="M -110 0 Q -40 -50 60 0 Q -40 50 -110 0 Z M 60 0 L 110 -36 L 110 36 Z" fill="none" stroke={KRP.ink} strokeWidth={5} />
          {[-70, -40, -10, 20].map((lx) => <line key={lx} x1={lx} y1={-26} x2={lx} y2={26} stroke={KRP.ink} strokeWidth={3} />)}
          <line x1={-100} y1={0} x2={60} y2={0} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 深い岩 */}
        <rect x={-20} y={1750} width={1960} height={1300} fill={C.rockDeep} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${rnd(42, i) * 1900} ${1780 + rnd(43, i) * 250} l 40 30 l -20 40 l 50 30`} stroke={C.rockDeeper} strokeWidth={6} fill="none" />
        ))}
        {/* ===== 洞窟 ===== */}
        <path d={cave} fill={C.cave} stroke={KRP.ink} strokeWidth={8} />
        <clipPath id="yb13cave"><path d={cave} /></clipPath>
        <g clipPath="url(#yb13cave)">
          {/* 奥の壁のでこぼこ */}
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx={380 + i * 280} cy={2300 + (i % 2) * 90} rx={200} ry={150} fill={C.caveWall} opacity={0.55} />
          ))}
          <YbFire x={1000} y={2640} s={1.1} f={f} />
          {/* 床 */}
          <path d="M 280 2680 Q 900 2640 1830 2690 L 1830 2800 L 280 2800 Z" fill={C.caveFloor} stroke={KRP.ink} strokeWidth={6} />
          {/* 草の寝床 */}
          <g transform="translate(1440 2706)">
            <ellipse cx={0} cy={0} rx={210} ry={40} fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 26 }, (_, i) => {
              const gx = -190 + i * 15;
              return <path key={i} d={`M ${gx} 10 q ${10 + rnd(44, i) * 20} -40 ${30 + rnd(45, i) * 30} ${-30 - rnd(46, i) * 20}`}
                stroke={i % 2 ? C.grassDry : C.grass} strokeWidth={6} fill="none" strokeLinecap="round" />;
            })}
          </g>
          {/* 毛皮の人 (火にあたる) */}
          <Person x={660} y={2700} s={1.2} f={f} cloth={YP.fur} clothDark={YP.furDark} face="smile" pose="hold" gaze={[1, 0]} />
          {/* 火の照り返し */}
          <ellipse cx={1000} cy={2660} rx={600} ry={120} fill={C.fireOrange} opacity={0.12} />
        </g>
        {/* つらら (天井) */}
        {[[620, 2080], [760, 2075], [1000, 2050], [1240, 2062], [1450, 2100], [1580, 2150]].map(([tx, ty], i) => (
          <path key={i} d={`M ${tx - 26} ${ty - 10} L ${tx} ${ty + 70 + (i % 3) * 30} L ${tx + 26} ${ty - 10} Z`} fill={C.rockDeep} stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
      {/* ===== 年代メーター (画面に固定) ===== */}
      <rect x={30} y={120} width={300} height={700} rx={20} fill={C.desk} stroke={KRP.ink} strokeWidth={7} />
      <rect x={70} y={160} width={30} height={620} rx={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={74} y={164} width={22} height={Math.max(0, needle - 164)} rx={11} fill={KRP.red} opacity={0.75} />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={100} y1={170 + i * 39} x2={i % 5 === 0 ? 128 : 116} y2={170 + i * 39} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <path d={`M 52 ${needle} L 30 ${needle - 16} L 30 ${needle + 16} Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      {marks.map(([txt, my, sz, th]) => (
        <TagPlate key={txt} x={215} y={my} text={txt} size={sz} t={1} fill={p >= th ? KRP.yellow : KRP.white} />
      ))}
    </Frame>
  );
};

// ---- 文#14 【山】 その途中で柔らかさは、高級品になり、聖人に捨てられ、竹で作られ、サルの実験に使われます。
// 設計: 巻物の上に4つの小窓が順にぱっと開く: ①羽毛と金貨 ②修道服の人が枕を放る ③竹で編んだ筒 ④布でくるんだ人形 (布の母) にしがみつく子ザル。各窓に小さな札
// どこ: #12 と同じ紙の色の絵巻。金色のすやり霞がたなびき、4つの丸窓 (木の額) を点線の道がつなぐ
// 演出: 窓は「予告編のチラ見せ」。①ローマ: 朱の壁・大理石の柱・紫の絹の上に白い羽根の山と金貨 ②中世: 石の修道院、剃髪の修道士が羽毛枕をぽいっ ③夏の畳に竹夫人・風鈴・うちわ ④やさしい緑の部屋、タオル地の布の母に子ザルがすやすや
// 動き: f4/12/20/28 で窓が順にぽんと開く (中身は円が広がって見える)。羽根が舞い・金貨が光る・枕が放物線で飛ぶ・風鈴がゆれる・子ザルが寝息で上下。カメラは左から右へゆっくりパンしながら引く
const YbWin: React.FC<{ x: number; y: number; r: number; t: number; f: number; children?: React.ReactNode; id: string }> = ({ x, y, r, t, f, children, id }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const open = easeOut(clamp01(t * 1.3));
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <circle r={r + 30} fill={KRP.ink} opacity={0.18} cy={12} />
      <clipPath id={id}><circle r={r * open} /></clipPath>
      <circle r={r} fill={C.washiDark} />
      <g clipPath={`url(#${id})`}>{children}</g>
      {/* 木の額 */}
      <circle r={r + 14} fill="none" stroke={KRP.ink} strokeWidth={34} />
      <circle r={r + 14} fill="none" stroke={C.frameWood} strokeWidth={24} />
      <circle r={r + 8} fill="none" stroke={C.deskDark} strokeWidth={4} opacity={0.6} />
      {[45, 135, 225, 315].map((a) => (
        <circle key={a} cx={(r + 14) * Math.cos((a * Math.PI) / 180)} cy={(r + 14) * Math.sin((a * Math.PI) / 180)} r={7} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {/* 開いた瞬間の光の輪 */}
      {t < 1 && <circle r={r + 30 + t * 60} fill="none" stroke={KRP.white} strokeWidth={10 * (1 - t)} opacity={1 - t} />}
      {void f}
    </g>
  );
};
const YbFeather: React.FC<{ x: number; y: number; s: number; rot: number }> = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -50 Q 22 -20 10 30 Q 0 46 -4 30 Q -22 -10 0 -50 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 0 -44 Q 4 0 2 44" stroke={KRP.grayDark} strokeWidth={3} fill="none" />
  </g>
);
const Yw014: React.FC<{ f: number }> = ({ f }) => {
  const R = 180;
  const wins: [number, number, number, string][] = [[330, 420, 4, "高級品"], [750, 480, 12, "捨てる"], [1170, 420, 20, "竹"], [1590, 480, 28, "実験"]];
  const cam = easeInOut(seg(f, 0, 38));
  const throwT = easeOut(seg(f, 16, 30));
  return (
    <Frame f={f} seed={2013} bg={C.desk}>
      <YbCam cx={lerp(640, 960, cam)} cy={lerp(500, 520, cam)} z={lerp(1.12, 1, cam)}>
        <rect x={-300} y={-200} width={2500} height={1500} fill={C.desk} />
        {/* 絵巻の紙 */}
        <rect x={20} y={140} width={1880} height={720} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 80 }, (_, i) => (
          <path key={i} d={`M ${40 + rnd(5, i) * 1840} ${180 + rnd(6, i) * 640} q 10 ${rnd(7, i) * 8 - 4} 24 0`} stroke={C.washiDark} strokeWidth={3} fill="none" />
        ))}
        {[140, 826].map((by) => (
          <g key={by}>
            <rect x={20} y={by} width={1880} height={34} fill={C.washiEdge} opacity={0.55} />
            {Array.from({ length: 46 }, (_, i) => <path key={i} d={`M ${40 + i * 40} ${by + 17} l 12 -10 l 12 10 l -12 10 Z`} fill={C.brocade} opacity={0.55} />)}
          </g>
        ))}
        {/* すやり霞 */}
        {[[200, 250, 360], [900, 300, 420], [1500, 240, 380], [500, 740, 400], [1250, 770, 460]].map(([kx, ky, kw], i) => (
          <rect key={i} x={kx + Math.sin(f / 20 + i) * 12} y={ky} width={kw} height={46} rx={23} fill={C.kasumi} stroke={C.washiEdge} strokeWidth={3} opacity={0.8} />
        ))}
        {/* 点線の道 */}
        <path d="M 330 420 C 480 330 600 560 750 480 S 1020 340 1170 420 S 1440 560 1590 480"
          stroke={C.washiEdge} strokeWidth={9} fill="none" strokeDasharray="4 22" strokeLinecap="round"
          strokeDashoffset={-f * 2} />
        {/* ① ローマ: 羽毛と金貨 */}
        <YbWin id="yb14w1" x={330} y={420} r={R} t={seg(f, 4, 10)} f={f}>
          <rect x={-R} y={-R} width={2 * R} height={2 * R} fill={C.romeWall} />
          <rect x={-R} y={60} width={2 * R} height={R} fill={C.marble} />
          {[-120, -40, 40, 120].map((lx) => <line key={lx} x1={lx} y1={60} x2={lx * 1.4} y2={R} stroke={C.marbleVein} strokeWidth={3} />)}
          <rect x={-160} y={-R} width={50} height={240} fill={C.marble} stroke={KRP.ink} strokeWidth={5} />
          {[-150, -135, -120].map((lx) => <line key={lx} x1={lx} y1={-R} x2={lx} y2={60} stroke={C.marbleVein} strokeWidth={4} />)}
          <rect x={-170} y={-90} width={70} height={18} fill={C.marble} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -90 110 Q -80 40 0 34 Q 90 36 110 110 Z" fill={C.purple} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => (
            <YbFeather key={i} x={-60 + (i % 5) * 30} y={60 - Math.floor(i / 5) * 28 + (i % 2) * 6} s={0.75} rot={-60 + i * 14} />
          ))}
          {[0, 1, 2].map((i) => {
            const fy = ((f * 1.6 + i * 40) % 140);
            return <YbFeather key={i} x={-40 + i * 50 + Math.sin(f / 7 + i) * 20} y={-30 - fy} s={0.55} rot={Math.sin(f / 6 + i) * 40} />;
          })}
          {[[90, 120], [126, 104]].map(([gx, gy], i) => (
            <g key={i}>
              <ellipse cx={gx} cy={gy} rx={30} ry={14} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={gx} cy={gy - 2} rx={18} ry={7} fill="none" stroke={YP.brassDark} strokeWidth={3} />
            </g>
          ))}
          <path d={`M 140 70 l 6 16 l 16 6 l -16 6 l -6 16 l -6 -16 l -16 -6 l 16 -6 Z`} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 3)} />
        </YbWin>
        {/* ② 中世: 修道士が羽毛枕を放る */}
        <YbWin id="yb14w2" x={750} y={480} r={R} t={seg(f, 12, 18)} f={f}>
          <rect x={-R} y={-R} width={2 * R} height={2 * R} fill={C.stone} />
          {Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => (
            <rect key={`${r}${c}`} x={-R + c * 80 - (r % 2) * 40} y={-R + r * 50} width={80} height={50} fill="none" stroke={C.stoneDark} strokeWidth={3} />
          )))}
          <path d="M 50 -150 L 50 -40 L 110 -40 L 110 -150 Q 80 -200 50 -150 Z" fill={C.sky} stroke={KRP.ink} strokeWidth={5} />
          <line x1={80} y1={-170} x2={80} y2={-40} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-R} y={120} width={2 * R} height={80} fill={C.stoneDark} />
          <Person x={-70} y={150} s={0.78} f={f} cloth={C.monk} clothDark={C.monkDark} hair="none" face="normal"
            pose={throwT > 0 ? "point" : "hold"} gaze={[1, -0.2]} />
          {/* 剃髪の髪の輪と縄の帯 */}
          <path d="M -116 -50 Q -70 -68 -24 -50" stroke={C.monkDark} strokeWidth={11} fill="none" strokeLinecap="round" />
          <line x1={-114} y1={110} x2={-26} y2={110} stroke={C.towel} strokeWidth={6} />
          {/* 飛ぶ枕と抜ける羽 */}
          {throwT > 0 ? (
            <g transform={`translate(${lerp(50, 116, throwT)} ${lerp(30, 70, throwT) - Math.sin(Math.PI * throwT) * 90}) rotate(${throwT * 200})`}>
              <rect x={-44} y={-24} width={88} height={48} rx={22} fill={C.pillow} stroke={KRP.ink} strokeWidth={5} />
              <path d="M -30 0 Q 0 -10 30 0" stroke={KRP.gray} strokeWidth={3} fill="none" />
            </g>
          ) : (
            <rect x={-114} y={18} width={88} height={48} rx={22} fill={C.pillow} stroke={KRP.ink} strokeWidth={5} />
          )}
          {throwT > 0 && [0, 1, 2, 3].map((i) => (
            <YbFeather key={i} x={lerp(50, 110, throwT) + i * 18 - 20} y={lerp(30, -20, throwT) + i * 20 + Math.sin(f / 5 + i) * 6} s={0.4} rot={f * 6 + i * 70} />
          ))}
        </YbWin>
        {/* ③ 竹夫人 */}
        <YbWin id="yb14w3" x={1170} y={420} r={R} t={seg(f, 20, 26)} f={f}>
          <rect x={-R} y={-R} width={2 * R} height={2 * R} fill={C.tatami} />
          {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-R} y1={-R + i * 13} x2={R} y2={-R + i * 13} stroke={C.tatamiDark} strokeWidth={2} />)}
          <line x1={-R} y1={-70} x2={R} y2={-70} stroke={C.curtainDark} strokeWidth={14} />
          <rect x={-R} y={80} width={2 * R} height={R} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
          <g transform="rotate(-14)">
            <clipPath id="yb14bam"><rect x={-150} y={-56} width={300} height={112} rx={56} /></clipPath>
            <rect x={-150} y={-56} width={300} height={112} rx={56} fill={C.bamboo} stroke={KRP.ink} strokeWidth={6} />
            <g clipPath="url(#yb14bam)">
              {Array.from({ length: 22 }, (_, i) => (
                <g key={i}>
                  <line x1={-200 + i * 22} y1={-60} x2={-140 + i * 22} y2={60} stroke={C.bambooDark} strokeWidth={6} />
                  <line x1={-140 + i * 22} y1={-60} x2={-200 + i * 22} y2={60} stroke={C.bambooDark} strokeWidth={6} />
                </g>
              ))}
              <rect x={-150} y={20} width={300} height={36} fill={KRP.ink} opacity={0.12} />
            </g>
            <rect x={-150} y={-56} width={300} height={112} rx={56} fill="none" stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={-118} cy={0} rx={22} ry={50} fill="none" stroke={C.bambooDark} strokeWidth={5} />
          </g>
          {/* 風鈴 */}
          <g transform={`translate(-90 -180) rotate(${Math.sin(f / 5) * 10})`}>
            <line x1={0} y1={0} x2={0} y2={60} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -22 86 Q -22 58 0 58 Q 22 58 22 86 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            <line x1={0} y1={86} x2={0} y2={110} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-8} y={110} width={16} height={34} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* うちわ */}
          <g transform="translate(110 120) rotate(30)">
            <rect x={-5} y={0} width={10} height={60} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={0} cy={-20} r={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={0} cy={-20} r={18} fill={KRP.red} />
          </g>
        </YbWin>
        {/* ④ 布の母と子ザル */}
        <YbWin id="yb14w4" x={1590} y={480} r={R} t={seg(f, 28, 34)} f={f}>
          <rect x={-R} y={-R} width={2 * R} height={2 * R} fill={C.labWall} />
          <rect x={-R} y={110} width={2 * R} height={R} fill={C.wallStripe} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-R + i * 70} y1={110} x2={-R + i * 70 - 20} y2={R} stroke={C.washiDark} strokeWidth={3} />)}
          {/* 布の母 (土台の脚・タオル地の胴・丸い頭) */}
          <line x1={-40} y1={110} x2={-60} y2={150} stroke={C.steelDark} strokeWidth={8} />
          <line x1={40} y1={110} x2={60} y2={150} stroke={C.steelDark} strokeWidth={8} />
          <rect x={-80} y={150} width={160} height={14} rx={6} fill={C.chair} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-60} y={-60} width={120} height={180} rx={50} fill={C.towel} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 24 }, (_, i) => (
            <circle key={i} cx={-44 + (i % 5) * 22} cy={-40 + Math.floor(i / 5) * 32} r={5} fill="none" stroke={C.towelDark} strokeWidth={3} />
          ))}
          <circle cx={0} cy={-110} r={50} fill={C.bamboo} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={-16} cy={-116} r={6} fill={KRP.ink} />
          <circle cx={16} cy={-116} r={6} fill={KRP.ink} />
          <path d="M -14 -94 Q 0 -84 14 -94" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* 子ザル (寝息で上下) */}
          <g transform={`translate(4 ${36 + Math.sin(f / 7) * 3})`}>
            <path d="M 46 40 Q 90 60 80 100" stroke={C.monkey} strokeWidth={9} fill="none" strokeLinecap="round" />
            <ellipse cx={0} cy={30} rx={44} ry={52} fill={C.monkey} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-6} cy={-34} r={36} fill={C.monkey} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-40} cy={-38} r={12} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={28} cy={-38} r={12} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={-6} cy={-28} rx={26} ry={22} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -18 -32 q 5 4 10 0 M 2 -32 q 5 4 10 0" stroke={KRP.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            <path d="M -10 -18 q 4 3 8 0" stroke={KRP.ink} strokeWidth={3} fill="none" />
            <ellipse cx={-22} cy={-22} rx={6} ry={4} fill={KRP.red} opacity={0.35} />
            <ellipse cx={10} cy={-22} rx={6} ry={4} fill={KRP.red} opacity={0.35} />
            {/* 腕と足で布につかまる */}
            <path d="M -40 10 Q -70 -10 -56 -40" stroke={C.monkey} strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d="M 36 10 Q 66 -10 56 -40" stroke={C.monkey} strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d="M -30 70 Q -60 80 -60 50" stroke={C.monkey} strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d="M 30 70 Q 60 80 60 50" stroke={C.monkey} strokeWidth={14} fill="none" strokeLinecap="round" />
          </g>
          {/* 寝息の Z */}
          <text x={90} y={-100 - (f % 30)} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.curtainDark} opacity={0.8 - (f % 30) / 40}>z</text>
        </YbWin>
        {/* 小札 */}
        <TagPlate x={330} y={700} text="高級品" size={34} t={seg(f, 8, 12)} />
        <TagPlate x={750} y={700} text="捨てる" size={34} t={seg(f, 16, 20)} />
        <TagPlate x={1170} y={700} text="竹" size={34} t={seg(f, 24, 28)} />
        <TagPlate x={1590} y={700} text="実験" size={34} t={seg(f, 32, 36)} />
        {void wins}
      </YbCam>
    </Frame>
  );
};

// ---- 文#15 【並】 そして最後に、ひとつの答えにたどり着きます。
// 設計: 夕暮れの一本道。巻物の終わりに扉が1つ、隙間から暖かい光。Person が歩み寄り、扉に手をかける
// どこ: 夕焼けの野原の一本道 (遠近法で地平線へ細くなる)。道の先に枠ごと立つ木の扉が1枚だけ
// 演出: 扉は少しだけ開いていて、隙間から暖かい光の筋が手前の道へ伸びる。人は扉を見つめて歩み寄り、取っ手に手をかける。答え (扉の向こう) は見せない
// 動き: f0〜30 で人が左手前から扉へ歩く (近づくほど小さく)。f28〜 腕を伸ばして取っ手へ。光の筋は f で太くなる。カラスが空を横切る。カメラはゆっくり扉へ寄る
const Yw015: React.FC<{ f: number }> = ({ f }) => {
  const HY = 470;
  const walk = easeInOut(seg(f, 0, 30));
  const px = lerp(400, 809, walk);
  const py = lerp(870, 790, walk);
  const ps = lerp(1.45, 1.25, walk);
  const step = walk < 1 ? Math.abs(Math.sin(f / 3)) * -10 : 0;
  const reach = f >= 29;
  const gap = lerp(8, 30, seg(f, 0, 40));
  const cam = easeInOut(seg(f, 0, 40));
  const bands = [C.dusk1, C.dusk2, C.dusk3, C.dusk4, C.dusk5];
  const tufts = Array.from({ length: 22 }, (_, i) => {
    const d = (i % 11) / 10;
    const side = i < 11 ? -1 : 1;
    const y = HY + 8 + d * d * 600;
    const half = 30 + (520 - 30) * ((y - HY) / 610);
    return { x: 960 + side * (half + 40 + d * 160 + rnd(50, i) * 60), y, s: 0.3 + d * 1.1 };
  });
  return (
    <Frame f={f} seed={2014} bg={C.dusk3}>
      <YbCam cx={lerp(960, 920, cam)} cy={lerp(540, 560, cam)} z={lerp(1, 1.1, cam)}>
        {/* 空 (帯のグラデーション) */}
        {bands.map((b, i) => <rect key={b} x={-200} y={-200 + i * 136} width={2400} height={140} fill={b} />)}
        <circle cx={420} cy={HY + 10} r={90} fill={C.sun} opacity={0.95} />
        <circle cx={420} cy={HY + 10} r={130} fill={C.sun} opacity={0.25} />
        {[[300, 150, 360], [1200, 220, 500], [800, 330, 300], [1600, 120, 280]].map(([cx2, cy2, cw], i) => (
          <rect key={i} x={cx2 + Math.sin(f / 30 + i) * 14} y={cy2} width={cw} height={16} rx={8} fill={C.dusk4} opacity={0.7} />
        ))}
        {/* カラス */}
        {[0, 1, 2].map((i) => {
          const bx = 1500 - f * 6 + i * 60, by = 190 + i * 24;
          const wing = Math.sin(f / 2 + i) * 10;
          return <path key={i} d={`M ${bx - 22} ${by - wing} Q ${bx - 10} ${by - 8} ${bx} ${by} Q ${bx + 10} ${by - 8} ${bx + 22} ${by - wing}`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />;
        })}
        {/* 遠い丘 */}
        <path d={`M -200 ${HY} Q 200 ${HY - 70} 600 ${HY - 20} Q 1000 ${HY - 80} 1400 ${HY - 30} Q 1800 ${HY - 70} 2200 ${HY} Z`} fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
        {/* 野原 */}
        <rect x={-200} y={HY} width={2400} height={800} fill={C.field} stroke={KRP.ink} strokeWidth={5} />
        {[540, 640, 780, 960].map((by) => <rect key={by} x={-200} y={by} width={2400} height={26} fill={C.fieldDark} opacity={0.35} />)}
        {/* 道 */}
        <polygon points={`935,${HY} 985,${HY} 1480,1100 440,1100`} fill={C.road} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 955 ${HY + 20} L 820 1100 M 965 ${HY + 20} L 1100 1100`} stroke={C.roadDark} strokeWidth={6} fill="none" strokeDasharray="30 26" opacity={0.6} />
        {/* 草むら */}
        {tufts.map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
            {[-24, -8, 8, 24].map((gx, j) => (
              <path key={j} d={`M ${gx} 0 q ${4 + Math.sin(f / 9 + i + j) * 4} -40 ${gx * 0.4 + 10} -70`} stroke={j % 2 ? C.fieldDark : C.grass} strokeWidth={8} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ))}
        {/* 扉から漏れる光 (手前の道へ) */}
        <polygon points={`${975},350 ${975 + gap},350 ${900 + gap * 6},1100 ${560 - gap * 4},1100`} fill={C.warm} opacity={0.32} />
        <polygon points={`${975},420 ${975 + gap * 0.6},420 ${760 + gap * 3},1100 ${640 - gap * 2},1100`} fill={C.warm} opacity={0.35} />
        <ellipse cx={940} cy={790} rx={160 + gap * 3} ry={30} fill={C.warm} opacity={0.4} />
        {/* 人の長い影 */}
        <path d={`M ${px - 30} ${py} L ${px - 260} ${py + 60} L ${px - 220} ${py + 80} L ${px + 20} ${py + 4} Z`} fill={KRP.ink} opacity={0.25} />
        {/* 扉 (枠と板) */}
        <rect x={930} y={770} width={300} height={24} rx={6} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        <rect x={950} y={326} width={26} height={448} fill={C.doorDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1184} y={326} width={26} height={448} fill={C.doorDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={940} y={310} width={280} height={30} rx={4} fill={C.doorDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={976} y={340} width={208} height={430} fill={C.warm} />
        <rect x={976 + gap} y={340} width={208 - gap} height={430} fill={C.doorWood} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={976 + gap + 10} y1={360 + i * 108} x2={1174} y2={360 + i * 108} stroke={C.doorDark} strokeWidth={4} opacity={0.6} />)}
        <rect x={996 + gap} y={372} width={166 - gap} height={160} rx={6} fill="none" stroke={C.doorDark} strokeWidth={5} />
        <rect x={996 + gap} y={560} width={166 - gap} height={180} rx={6} fill="none" stroke={C.doorDark} strokeWidth={5} />
        <circle cx={1004 + gap} cy={600} r={13} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 光の粒 */}
        {Array.from({ length: 6 }, (_, i) => {
          const q = ((f * 1.5 + i * 23) % 80) / 80;
          return <circle key={i} cx={980 + gap / 2 - q * 220 + i * 6} cy={420 + i * 50 + q * 90} r={5} fill={C.warm} opacity={1 - q} />;
        })}
        {/* 人 (扉を見つめて歩み寄る → 取っ手へ手をのばす) */}
        <Person x={px} y={py + step} s={ps} f={f} cloth={KRP.blueDeep} clothDark={C.apronDark}
          face="normal" gaze={[1, -0.3]} pose={reach ? "point" : "stand"} pointDir={1} lean={reach ? 3 : 2} />
      </YbCam>
    </Frame>
  );
};

// ---- 文#16 【山】 人類が本当に欲しかったのは、柔らかさではなかったのかもしれません。
// 設計: 棚にクッション・ぬいぐるみ・`Squishy`・羽毛枕。真ん中の大きな木札「柔らかさ」がくるりと裏返ると「?」。棚の前で Person が驚く (surprised)
// どこ: 夜の博物館の展示室。深緑の壁・大理石の床・天井のスポットライト。赤いビロード張りのガラスケースと、手前のロープ柵
// 演出: ケースに柔らかいもの5点 (クッション・くま・スクイーズ・羽毛枕・毛布) と番号札。真ん中に吊られた木札が裏返って「?」。腕組みで眺めていた人が驚いてのけぞる
// 動き: f0〜14 カメラが札へ寄る / f14〜26 札がくるりと裏返る (幅が 1→0→1、裏面に切り替わる) / f26〜 札がゆれ、画面が小さく揺れ、カメラが引く。人の顔が変わってのけぞる。ガラスの映り込みが流れる
const Yw016: React.FC<{ f: number }> = ({ f }) => {
  const flip = seg(f, 14, 26);
  const c = Math.cos(Math.PI * flip);
  const swing = f >= 26 ? Math.sin((f - 26) / 2.2) * 7 * (1 - seg(f, 26, 42)) : 0;
  const zin = easeInOut(seg(f, 0, 14)), zout = easeOut(seg(f, 27, 40));
  const z = 1 + 0.1 * zin - 0.1 * zout;
  const shake = f >= 26 && f < 31 ? Math.sin(f * 4) * 6 : 0;
  const cx = lerp(lerp(960, 900, zin), 960, zout) + shake;
  const cy = lerp(lerp(540, 420, zin), 540, zout);
  const surprised = f >= 26;
  const SX = 900;
  return (
    <Frame f={f} seed={2015} bg={C.museumWall}>
      <YbCam cx={cx} cy={cy} z={z}>
        {/* 壁と腰壁 */}
        <rect x={-300} y={-200} width={2500} height={980} fill={C.museumWall} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-300 + i * 220} y={-200} width={8} height={980} fill={C.museumDark} />)}
        <rect x={-300} y={650} width={2500} height={130} fill={C.museumDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 天井の照明と光の円錐 */}
        <rect x={-300} y={-200} width={2500} height={250} fill={C.museumDark} />
        {[600, 900, 1200].map((lx, i) => (
          <g key={lx}>
            <polygon points={`${lx - 22},60 ${lx + 22},60 ${lx + 180 - i * 60 + 60},700 ${lx - 180 - i * 60 + 60},700`} fill={C.spot} opacity={0.13 + 0.03 * Math.sin(f / 8 + i)} />
            <rect x={lx - 30} y={30} width={60} height={36} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 大理石の床 */}
        <rect x={-300} y={780} width={2500} height={500} fill={C.marbleFloor} stroke={KRP.ink} strokeWidth={5} />
        {[830, 900, 1000].map((ly) => <line key={ly} x1={-300} y1={ly} x2={2200} y2={ly} stroke={C.marbleVein} strokeWidth={4} />)}
        {Array.from({ length: 15 }, (_, i) => <line key={i} x1={960 + (i - 7) * 160} y1={780} x2={960 + (i - 7) * 420} y2={1280} stroke={C.marbleVein} strokeWidth={4} />)}
        {/* ケースの台 */}
        <rect x={260} y={690} width={1280} height={150} rx={6} fill={C.caseWood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={290} y={720} width={1220} height={90} rx={4} fill="none" stroke={C.chairDark} strokeWidth={5} />
        {/* ケースの中 (ビロード) */}
        <rect x={280} y={150} width={1240} height={540} fill={C.velvet} stroke={KRP.ink} strokeWidth={7} />
        <rect x={280} y={590} width={1240} height={100} fill={C.velvetDark} />
        {/* 展示物 */}
        {/* クッション */}
        <g transform="translate(420 680)">
          <path d="M -100 0 Q -112 -90 -96 -180 Q 0 -196 96 -180 Q 112 -90 100 0 Q 0 12 -100 0 Z" fill={C.cushion} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-92} r={9} fill={C.cushionDark} stroke={KRP.ink} strokeWidth={3} />
          {[[-40, -130], [40, -130], [-40, -50], [40, -50]].map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r={6} fill={C.cushionDark} />)}
          <path d="M -60 -150 Q 0 -100 60 -150 M -60 -30 Q 0 -80 60 -30" stroke={C.cushionDark} strokeWidth={4} fill="none" />
        </g>
        {/* くまのぬいぐるみ */}
        <g transform={`translate(640 680) rotate(${Math.sin(f / 15) * 1.5})`}>
          <ellipse cx={0} cy={-70} rx={70} ry={74} fill={C.bear} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-62} rx={40} ry={44} fill={C.peg} />
          <ellipse cx={-62} cy={-20} rx={30} ry={22} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={62} cy={-20} rx={30} ry={22} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-70} cy={-250} r={26} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={70} cy={-250} r={26} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-200} r={74} fill={C.bear} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-178} rx={32} ry={24} fill={C.peg} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-26} cy={-214} r={8} fill={KRP.ink} />
          <circle cx={26} cy={-214} r={8} fill={KRP.ink} />
          <ellipse cx={0} cy={-186} rx={10} ry={7} fill={KRP.ink} />
          <path d="M -60 -110 Q -94 -100 -80 -70 M 60 -110 Q 94 -100 80 -70" stroke={KRP.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M -60 -110 Q -94 -100 -80 -70 M 60 -110 Q 94 -100 80 -70" stroke={C.bear} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M -30 -136 L 0 -124 L 30 -136 L 30 -112 L 0 -124 L -30 -112 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* スクイーズ (真ん中) */}
        <Squishy x={SX} y={680} s={0.62} f={f} />
        {/* 羽毛枕 */}
        <g transform="translate(1150 680)">
          <path d="M -120 0 Q -134 -60 -112 -110 Q 0 -128 112 -110 Q 134 -60 120 0 Q 0 14 -120 0 Z" fill={C.pillow} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -112 -110 l -16 -10 M 112 -110 l 16 -10 M -120 0 l -16 8 M 120 0 l 16 8" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -80 -60 Q 0 -40 80 -60" stroke={KRP.gray} strokeWidth={4} fill="none" />
          <YbFeather x={60} y={-150 - Math.sin(f / 9) * 8} s={0.5} rot={30 + Math.sin(f / 7) * 20} />
        </g>
        {/* たたんだ毛布 */}
        <g transform="translate(1380 680)">
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-110 + i * 4} y={-50 - i * 50} width={220 - i * 8} height={50} rx={20} fill={i % 2 ? C.blanketDark : C.blanket} stroke={KRP.ink} strokeWidth={6} />
          ))}
          {[-80, -40, 0, 40, 80].map((lx) => <line key={lx} x1={lx} y1={-150} x2={lx} y2={-160} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        {/* 番号札 */}
        {[420, 640, 900, 1150, 1380].map((nx, i) => (
          <g key={nx} transform={`translate(${nx} 712)`}>
            <polygon points="-40,-18 40,-18 46,18 -46,18" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>{`0${i + 1}`}</text>
          </g>
        ))}
        {/* 吊られた木札「柔らかさ」→ 裏返って「?」 */}
        <g transform={`rotate(${swing} ${SX} 150)`}>
          <line x1={SX - 130} y1={150} x2={SX - 130} y2={300} stroke={KRP.ink} strokeWidth={4} />
          <line x1={SX + 130} y1={150} x2={SX + 130} y2={300} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(${SX} 360) scale(${Math.max(0.03, Math.abs(c))} 1)`}>
            <rect x={-190} y={-62} width={380} height={124} rx={12} fill={c >= 0 ? C.signWood : C.signBack} stroke={KRP.ink} strokeWidth={7} />
            <path d="M -170 -30 q 170 14 340 0 M -170 30 q 170 -12 340 0" stroke={C.chairDark} strokeWidth={4} fill="none" opacity={0.5} />
            {[-160, 160].map((hx) => <circle key={hx} cx={hx} cy={-40} r={8} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />)}
            {c >= 0 ? (
              <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.ink}>柔らかさ</text>
            ) : (
              <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} paintOrder="stroke">？</text>
            )}
          </g>
        </g>
        {/* ガラスの映り込み (流れる) */}
        <clipPath id="yb16glass"><rect x={280} y={150} width={1240} height={540} /></clipPath>
        <g clipPath="url(#yb16glass)">
          {[0, 1].map((i) => {
            const gx = 200 + ((f * 9 + i * 700) % 1600);
            return <polygon key={i} points={`${gx},150 ${gx + 70},150 ${gx - 160},690 ${gx - 230},690`} fill={C.glass} opacity={0.18} />;
          })}
        </g>
        <rect x={280} y={150} width={1240} height={540} fill="none" stroke={C.glass} strokeWidth={10} opacity={0.6} />
        <rect x={280} y={150} width={1240} height={540} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <rect x={270} y={136} width={1260} height={20} rx={4} fill={C.caseWood} stroke={KRP.ink} strokeWidth={5} />
        {/* ロープ柵 */}
        {[200, 900, 1600].map((sx2) => (
          <g key={sx2}>
            <rect x={sx2 - 10} y={800} width={20} height={150} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={sx2} cy={796} r={16} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={sx2} cy={952} rx={40} ry={12} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 210 810 Q 550 880 890 810 M 910 810 Q 1250 880 1590 810" stroke={C.rope} strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* 見る人 (腕組み → 驚いてのけぞる) */}
        <Person x={1650} y={980} s={1.6} f={f} cloth={C.cushionDark} clothDark={C.apronDark} glasses
          face={surprised ? "surprised" : "normal"} gaze={[-1, -0.6]}
          pose={surprised ? "banzai" : "armsFolded"} lean={surprised ? 6 * pop(seg(f, 26, 32)) : 0} />
        {surprised && [0, 1, 2].map((i) => (
          <line key={i} x1={1560 + i * 70} y1={560 - i * 40 + (i === 1 ? 0 : 0)} x2={1520 + i * 60} y2={520 - i * 60}
            stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={seg(f, 26, 30)} />
        ))}
      </YbCam>
    </Frame>
  );
};

// ---- 文#17 【山】 今日は、柔らかいものの歴史を、20万年ぶんさかのぼります。
// 設計: からくり仕掛けの年代ダイヤル (歯車・真鍮・目盛り)。ハンドルを回す Person。ダイヤルの数字が逆回転し、窓の年号がぱらぱら 2026→…→20万年前
// どこ: 夜の工房。板張りの壁・有孔ボードの工具掛け (スパナ・ペンチ・のこぎり・金づち)・吊りランプ・ねじの小びんの棚・木の作業台
// 演出: 作業台の上の AgeDial を、前掛けの職人が腕まくりで力いっぱい回す。回すたびに体がゆれる。ダイヤルからはホコリが舞う
// 動き: f0〜40 で spin を逆回転 (速く→ゆっくり止まる)、handle も一緒に回り、職人の手がハンドルを追う。窓の年号は 2026年→1000年前→1万年前→20万年前。回り始めは画面が小さく揺れる
const Yw017: React.FC<{ f: number }> = ({ f }) => {
  const p = easeOut(seg(f, 0, 40));
  const lt = seg(f, 0, 40);
  const label = lt < 0.15 ? "2026年" : lt < 0.4 ? "1000年前" : lt < 0.7 ? "1万年前" : "20万年前";
  const spin = -1440 * p;
  const handle = 1080 * p;
  const DX = 820, DY = 470, DS = 1.2;
  const ax = DX + 290 * DS, ay = DY;
  const ha = (handle * Math.PI) / 180;
  const gx = ax + 111 * DS * Math.cos(ha), gy = ay + 111 * DS * Math.sin(ha);
  const ps = 1.75;
  const px = 1450 + 0.45 * (gx - ax), py = 930 + 0.18 * (gy - ay);
  const shake = Math.sin(f * 2.3) * 4 * (1 - p);
  const BENCH = 818;
  return (
    <Frame f={f} seed={2016} bg={C.plank}>
      <YbCam cx={960 + shake} cy={540} z={lerp(1.05, 1, seg(f, 0, 40))}>
        {/* 板張りの壁 */}
        <rect x={-200} y={-200} width={2400} height={1100} fill={C.plank} />
        {Array.from({ length: 20 }, (_, i) => (
          <g key={i}>
            <line x1={-200 + i * 130} y1={-200} x2={-200 + i * 130} y2={900} stroke={C.plankDark} strokeWidth={6} />
            <circle cx={-170 + i * 130} cy={60 + (i % 3) * 230} r={5} fill={C.plankDark} />
          </g>
        ))}
        {/* 有孔ボードと工具 */}
        <rect x={40} y={110} width={360} height={560} rx={6} fill={C.peg} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 11 }, (_, r) => Array.from({ length: 7 }, (_, c2) => (
          <circle key={`${r}${c2}`} cx={70 + c2 * 50} cy={140 + r * 50} r={4} fill={C.plankDark} />
        )))}
        {/* スパナ */}
        <g transform={`translate(130 280) rotate(${Math.sin(f / 9) * 3})`}>
          <rect x={-12} y={-20} width={24} height={200} rx={10} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -34 -20 Q -40 -70 -10 -76 L -10 -44 L 10 -44 L 10 -76 Q 40 -70 34 -20 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ペンチ */}
        <g transform="translate(250 230)">
          <path d="M -8 0 L -30 170 M 8 0 L 30 170" stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
          <path d="M -8 0 L -30 170 M 8 0 L 30 170" stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
          <path d="M -14 0 L -6 -70 L 6 -70 L 14 0 Z" fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={0} r={10} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* のこぎり */}
        <g transform="translate(90 520)">
          <path d="M 0 0 L 240 -10 L 240 50 Q 120 60 0 40 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 0 40 ${Array.from({ length: 12 }, (_, i) => `l 10 10 l 10 -10`).join(" ")}`} stroke={KRP.ink} strokeWidth={3} fill="none" />
          <rect x={232} y={-20} width={70} height={60} rx={14} fill={C.chair} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 棚とねじの小びん */}
        <rect x={1520} y={290} width={400} height={18} fill={C.plankDark} stroke={KRP.ink} strokeWidth={5} />
        {[1560, 1640, 1720, 1800].map((jx, i) => (
          <g key={jx}>
            <rect x={jx} y={200} width={60} height={90} rx={10} fill={KRP.blueSoft} opacity={0.75} stroke={KRP.ink} strokeWidth={5} />
            <rect x={jx + 4} y={186} width={52} height={18} rx={4} fill={[KRP.red, YP.brass, KRP.green, KRP.orange][i]} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((k) => <circle key={k} cx={jx + 16 + k * 14} cy={270 - (k % 2) * 12} r={6} fill={C.steelDark} />)}
          </g>
        ))}
        {/* 吊りランプと光 */}
        <line x1={560} y1={-200} x2={560} y2={70} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${Math.sin(f / 10) * 3} 560 -200)`}>
          <polygon points="470,140 650,140 900,820 220,820" fill={C.lampGlow} opacity={0.14} />
          <path d="M 480 140 Q 490 70 560 66 Q 630 70 640 140 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={560} cy={144} rx={40} ry={12} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 職人 (作業台の向こう) */}
        <Person x={px} y={py} s={ps} f={f} cloth={C.shirt} clothDark={C.apronDark} face="joy" pose="hold" lean={-4} />
        {/* 前掛け */}
        <g transform={`translate(${px} ${py}) scale(${ps}) rotate(-4)`}>
          <path d="M -46 -150 L 46 -150 L 54 -40 L -54 -40 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-22} y={-122} width={44} height={26} rx={4} fill={C.apronDark} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -46 -150 L -60 -164 M 46 -150 L 60 -164" stroke={C.apronDark} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* 作業台 */}
        <rect x={-200} y={BENCH} width={2400} height={40} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-200} y={BENCH + 40} width={2400} height={300} fill={C.deskDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-200} y1={BENCH + 80 + i * 40} x2={2200} y2={BENCH + 80 + i * 40} stroke={C.desk} strokeWidth={3} opacity={0.5} />)}
        {/* 台の上の小物: 歯車・油さし */}
        {[[220, 760, 50, 1], [320, 784, 32, -1]].map(([gx2, gy2, gr, dir], i) => (
          <g key={i} transform={`translate(${gx2} ${gy2}) rotate(${(dir as number) * f * 4})`}>
            {Array.from({ length: 10 }, (_, k) => <rect key={k} x={-8} y={-(gr as number) - 12} width={16} height={18} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${k * 36})`} />)}
            <circle r={gr as number} fill={YP.brass} stroke={KRP.ink} strokeWidth={5} />
            <circle r={(gr as number) * 0.35} fill={C.plank} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <g transform="translate(1800 818)">
          <path d="M -50 0 L -40 -80 L 40 -80 L 50 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 30 -76 L 110 -150" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          <ellipse cx={0} cy={-84} rx={30} ry={10} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 年代ダイヤル (共有部品) */}
        <AgeDial x={DX} y={DY} s={DS} spin={spin} label={label} handle={handle} />
        {/* 歯車のホコリ */}
        {Array.from({ length: 10 }, (_, i) => {
          const q = ((f * 1.8 + i * 17) % 60) / 60;
          const a = (i / 10) * Math.PI * 2;
          const rr = 340 + q * 120;
          return <circle key={i} cx={DX + Math.cos(a) * rr} cy={DY + Math.sin(a) * rr * 0.9 - q * 40} r={6 - q * 3} fill={KRP.gray} opacity={(1 - q) * 0.7} />;
        })}
        {/* 腕 (腕まくり。左手はハンドル・右手は台に) */}
        <YbArm sx={px + 67 * ps} sy={py - 148 * ps} gx={px + 150} gy={BENCH - 6} L1={140} L2={140} bend={-1} w={36} cloth={C.shirt} rolled />
        <YbArm sx={px - 67 * ps} sy={py - 148 * ps} gx={gx} gy={gy} L1={165} L2={165} bend={-1} w={36} cloth={C.shirt} rolled />
        {/* 力の入った汗 */}
        <path d={`M ${px + 120} ${py - 470} q -10 20 0 30 q 10 -10 0 -30 Z`} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} opacity={1 - p * 0.5} />
      </YbCam>
    </Frame>
  );
};

// ---- 文#18 【山】 最初の現場は、南アフリカの洞窟です。
// 設計: 机の上の地球儀がぐるっと回り、アフリカの南端に寄る。赤いピンがぶすっ。「南アフリカ」札 (舞台の法)。地球儀の台座・子午線の真鍮輪まで描く
// どこ: 夜の書斎。本棚の壁・机の上に大きな地球儀 (直径660px・軸23.4度・真鍮の子午線の輪・木の台座)。緑の笠のランプ・古い本の山・虫めがね・インク壺と羽ペン
// 演出: 日本が正面の地球儀が回ってアフリカ (とマダガスカル) が正面に来る。上から赤いピンが落ちて南アフリカにぶすっ。衝撃線と札
// 動き: f0〜24 地球儀が回る (経度 135→24、少し南へ傾く) / f26〜34 ピンが落ちる / f34〜38 衝撃線 / f22〜40 カメラがピンへ寄る
const D2R = Math.PI / 180;
const ybProj = (lon: number, lat: number, l0: number, p0: number, R: number): [number, number, boolean] => {
  const la = lat * D2R, lo = (lon - l0) * D2R, p = p0 * D2R;
  const x = R * Math.cos(la) * Math.sin(lo);
  const y = -R * (Math.cos(p) * Math.sin(la) - Math.sin(p) * Math.cos(la) * Math.cos(lo));
  const vis = Math.sin(p) * Math.sin(la) + Math.cos(p) * Math.cos(la) * Math.cos(lo);
  if (vis < 0) { const n = Math.hypot(x, y) || 1; return [(x / n) * R, (y / n) * R, false]; }
  return [x, y, true];
};
const YB_LANDS: { pts: number[][]; fill: "land" | "desert" }[] = [
  { fill: "desert", pts: [[-17, 21], [-16, 28], [-10, 35], [-5, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [34, 28], [38, 18], [43, 12], [51, 12], [45, 2], [40, -5], [40, -15], [35, -24], [33, -29], [27, -34], [20, -35], [18, -32], [15, -27], [12, -17], [14, -10], [12, -5], [9, 1], [9, 4], [5, 5], [-4, 5], [-8, 4], [-13, 8], [-17, 14]] },
  { fill: "land", pts: [[44, -25], [47, -25], [50, -15], [49, -12], [46, -16], [44, -20]] },
  { fill: "land", pts: [[-9, 37], [-9, 43], [-2, 44], [-5, 48], [0, 50], [5, 53], [8, 57], [12, 56], [10, 59], [5, 61], [10, 64], [15, 68], [25, 71], [30, 70], [40, 66], [45, 60], [42, 45], [30, 45], [28, 41], [23, 38], [20, 40], [16, 38], [12, 44], [8, 44], [3, 42], [0, 39], [-5, 36]] },
  { fill: "desert", pts: [[34, 28], [35, 32], [48, 30], [56, 26], [59, 22], [52, 16], [44, 12], [38, 18]] },
  { fill: "land", pts: [[42, 45], [45, 60], [60, 70], [80, 73], [110, 74], [140, 72], [170, 68], [160, 60], [140, 52], [130, 42], [122, 32], [110, 20], [106, 10], [100, 12], [98, 16], [90, 22], [80, 15], [76, 8], [72, 20], [66, 25], [57, 25], [48, 30], [36, 36]] },
  { fill: "land", pts: [[130, 31], [132, 34], [135, 34], [140, 36], [141, 41], [139, 38], [136, 36], [133, 35]] },
  { fill: "land", pts: [[140, 42], [145, 43], [144, 45], [141, 45]] },
  { fill: "land", pts: [[-80, 10], [-75, 11], [-62, 10], [-50, 0], [-35, -6], [-39, -15], [-48, -26], [-58, -38], [-65, -55], [-72, -50], [-72, -30], [-70, -18], [-80, -6], [-80, 0]] },
  { fill: "land", pts: [[-168, 66], [-160, 70], [-140, 70], [-120, 72], [-95, 72], [-80, 65], [-65, 60], [-55, 50], [-70, 42], [-76, 35], [-80, 26], [-82, 30], [-90, 30], [-97, 26], [-97, 20], [-87, 21], [-80, 9], [-105, 22], [-117, 32], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 60]] },
  { fill: "desert", pts: [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [135, -35], [130, -32], [115, -34]] },
  { fill: "land", pts: [[-50, 60], [-42, 60], [-20, 70], [-20, 80], [-40, 83], [-60, 80], [-55, 70]] },
];
const Yw018: React.FC<{ f: number }> = ({ f }) => {
  const rotT = easeInOut(seg(f, 0, 24));
  const l0 = lerp(135, 24, rotT);
  const p0 = lerp(22, -8, rotT);
  const GX = 960, GY = 445, R = 320, TILT = 23.4;
  const tilt = (x: number, y: number): [number, number] => {
    const a = TILT * D2R;
    return [GX + x * Math.cos(a) - y * Math.sin(a), GY + x * Math.sin(a) + y * Math.cos(a)];
  };
  const [pinLx, pinLy] = ybProj(25, -30, l0, p0, R);
  const [PX, PY] = tilt(pinLx, pinLy);
  const drop = seg(f, 26, 34);
  const pinY = PY - (1 - drop) * (1 - drop) * 620;
  const hit = seg(f, 34, 38);
  const cam = easeInOut(seg(f, 22, 40));
  const pathOf = (pts: number[][]) => {
    const pr = pts.map(([lo, la]) => ybProj(lo, la, l0, p0, R));
    if (!pr.some((q) => q[2])) return null;
    return `M ${pr.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L ")} Z`;
  };
  const lineOf = (pts: number[][]) => {
    let d = "", pen = false;
    pts.forEach(([lo, la]) => {
      const [x, y, v] = ybProj(lo, la, l0, p0, R);
      if (v) { d += `${pen ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)} `; pen = true; } else pen = false;
    });
    return d;
  };
  return (
    <Frame f={f} seed={2017} bg={C.studyWall}>
      <YbCam cx={lerp(960, 940, cam)} cy={lerp(540, 560, cam)} z={lerp(1, 1.06, cam)}>
        {/* 壁と本棚 */}
        <rect x={-200} y={-200} width={2400} height={1100} fill={C.studyWall} />
        {[[-100, 420], [1500, 620]].map(([bx, bw], k) => (
          <g key={k}>
            <rect x={bx} y={-100} width={bw} height={1000} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
            {[60, 300, 540].map((sy) => (
              <g key={sy}>
                {Array.from({ length: Math.floor(bw / 44) }, (_, i) => {
                  const h = 150 + rnd(60 + k, i + sy) * 60;
                  return <rect key={i} x={bx + 14 + i * 42} y={sy + 210 - h} width={36} height={h} fill={[C.book1, C.book2, C.book3, C.book4][(i + k) % 4]} stroke={KRP.ink} strokeWidth={3} />;
                })}
                <rect x={bx} y={sy + 210} width={bw} height={20} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
              </g>
            ))}
          </g>
        ))}
        {/* 机 */}
        <rect x={-200} y={860} width={2400} height={400} fill={C.desk} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-200} y={860} width={2400} height={20} fill={C.deskDark} opacity={0.6} />
        {/* ランプ */}
        <g>
          <polygon points="140,540 360,540 470,860 30,860" fill={C.lampGlow} opacity={0.18} />
          <ellipse cx={250} cy={860} rx={90} ry={18} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={240} y={560} width={20} height={300} fill={YP.brass} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 120 560 Q 130 470 250 466 Q 370 470 380 560 Z" fill={C.lampGreen} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={250} cy={562} rx={80} ry={12} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 古い本の山・虫めがね・インク壺 */}
        {[[1660, 860, 260, C.book1], [1670, 810, 230, C.book3], [1650, 764, 250, C.book4]].map(([bx, by, bw, bc], i) => (
          <g key={i}>
            <rect x={bx as number} y={(by as number) - 46} width={bw as number} height={46} rx={6} fill={bc as string} stroke={KRP.ink} strokeWidth={5} />
            <rect x={(bx as number) + 8} y={(by as number) - 38} width={(bw as number) - 16} height={8} fill={KRP.white} opacity={0.6} />
          </g>
        ))}
        <g transform="translate(1500 920) rotate(-20)">
          <rect x={60} y={-10} width={140} height={22} rx={10} fill={C.chairDark} stroke={KRP.ink} strokeWidth={5} />
          <circle r={64} fill={C.glass} opacity={0.6} stroke={KRP.ink} strokeWidth={6} />
          <circle r={64} fill="none" stroke={YP.brass} strokeWidth={8} />
          <path d="M -30 -30 Q -10 -46 14 -40" stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(560 860)">
          <path d="M -40 0 L -30 -60 L 30 -60 L 40 0 Z" fill={C.sumi} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 10 -60 Q 60 -180 ${90 + Math.sin(f / 10) * 4} -260 Q 40 -170 18 -60 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 地球儀の台座 */}
        <ellipse cx={GX} cy={892} rx={170} ry={26} fill={KRP.ink} opacity={0.25} />
        <path d={`M ${GX - 160} 890 Q ${GX - 150} 850 ${GX - 40} 846 L ${GX + 40} 846 Q ${GX + 150} 850 ${GX + 160} 890 Z`} fill={C.chair} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${GX - 26} 846 Q ${GX - 50} 820 ${GX - 20} 800 L ${GX + 20} 800 Q ${GX + 50} 820 ${GX + 26} 846 Z`} fill={C.chairDark} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${GX - 120} ${GY + 330} Q ${GX} ${GY + 400} ${GX + 120} ${GY + 330}`} stroke={KRP.ink} strokeWidth={22} fill="none" />
        <path d={`M ${GX - 120} ${GY + 330} Q ${GX} ${GY + 400} ${GX + 120} ${GY + 330}`} stroke={YP.brass} strokeWidth={14} fill="none" />
        {/* 球 (軸の傾き) */}
        <g transform={`translate(${GX} ${GY}) rotate(${TILT})`}>
          <clipPath id="yb18globe"><circle r={R} /></clipPath>
          <circle r={R} fill={C.ocean} stroke={KRP.ink} strokeWidth={7} />
          <g clipPath="url(#yb18globe)">
            {[-60, -30, 0, 30, 60].map((la) => (
              <path key={`la${la}`} d={lineOf(Array.from({ length: 73 }, (_, i) => [-180 + i * 5, la]))} stroke={C.oceanDark} strokeWidth={la === 0 ? 4 : 2.5} fill="none" opacity={0.7} />
            ))}
            {Array.from({ length: 12 }, (_, i) => -180 + i * 30).map((lo) => (
              <path key={`lo${lo}`} d={lineOf(Array.from({ length: 37 }, (_, i) => [lo, -90 + i * 5]))} stroke={C.oceanDark} strokeWidth={2.5} fill="none" opacity={0.7} />
            ))}
            {YB_LANDS.map((l, i) => {
              const d = pathOf(l.pts);
              return d ? <path key={i} d={d} fill={l.fill === "land" ? C.land : C.desert} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" /> : null;
            })}
            {/* 陰とつや */}
            <path d={`M 60 ${-R} A ${R} ${R} 0 0 1 60 ${R} A ${R * 0.8} ${R} 0 0 0 60 ${-R} Z`} fill={KRP.ink} opacity={0.0} />
            <circle cx={90} cy={60} r={R} fill="none" stroke={KRP.ink} strokeWidth={120} opacity={0.12} />
            <ellipse cx={-130} cy={-150} rx={90} ry={50} fill={KRP.white} opacity={0.25} transform="rotate(-35 -130 -150)" />
          </g>
          {/* 子午線の真鍮の輪 */}
          <circle r={R + 26} fill="none" stroke={KRP.ink} strokeWidth={28} />
          <circle r={R + 26} fill="none" stroke={YP.brass} strokeWidth={18} />
          {Array.from({ length: 36 }, (_, i) => (
            <line key={i} x1={0} y1={-(R + 18)} x2={0} y2={-(R + 34)} stroke={YP.brassDark} strokeWidth={3} transform={`rotate(${i * 10})`} />
          ))}
          <circle cx={0} cy={-(R + 26)} r={16} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={R + 26} r={16} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ピンと衝撃線 */}
        {hit > 0 && Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r1 = 18 + hit * 14, r2 = 30 + hit * 34;
          return <line key={i} x1={PX + Math.cos(a) * r1} y1={PY + Math.sin(a) * r1} x2={PX + Math.cos(a) * r2} y2={PY + Math.sin(a) * r2}
            stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />;
        })}
        {drop > 0 && (
          <g transform={`translate(${PX} ${pinY}) rotate(-14)`}>
            <line x1={0} y1={0} x2={0} y2={-70} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
            <line x1={0} y1={0} x2={0} y2={-70} stroke={C.steel} strokeWidth={4} strokeLinecap="round" />
            <circle cx={0} cy={-84} r={24} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-8} cy={-92} r={7} fill={KRP.white} opacity={0.7} />
          </g>
        )}
        {hit > 0 && <path d={`M ${PX + 30} ${PY + 20} Q ${PX + 160} ${PY + 140} 1180 700`} stroke={KRP.white} strokeWidth={5} fill="none" strokeDasharray="10 10" opacity={hit} />}
        <TagPlate x={1290} y={720} text="南アフリカ" size={40} t={seg(f, 35, 40)} />
      </YbCam>
    </Frame>
  );
};

// ---- 文#14の次 (yw_234) 【山】 その間に柔らかさは、背中の下から首、腕の中、全身へと、少しずつ体をのぼって、ついに手のひらにやってきます。
// ★2026-11-23 作者案で追加 (「柔らかさがどう体に入って指先までたどり着いたか」を導入で予告)。からだの地図の予告編
// どこ: 夜の展示室。上に「20万年前 → 今」の年表の帯。中央にからだの地図の人。足元にスポットライト
// 演出: 年表の目印が右へ進むのに合わせて、背中 → 首 → 腕 → 全身 → 手のひら と順に灯る。光の粒が体をのぼる。最後に手のひらにスクイーズがぽん
// 動き: 目印が左から右へ (約8秒) / ナレーションに合わせて各部が灯る / 「手のひら」でスクイーズ / 最後にカメラが少し寄る
const Yw234: React.FC<{ f: number }> = ({ f }) => {
  // ★この文は約9.9秒。ナレーションが部位を言う瞬間に灯す (VOICEVOX の音素の長さから計算したコマ番号)。
  //   背中 58 / 首 88 / 腕 110 / 全身 143 / 手のひら 251。検品プレビュー (f=45) では まだ灯っていない状態が写る
  const ramp = (a: number, b: number) => clamp01((f - a) / (b - a));
  const zt = easeInOut(ramp(252, 290)) * 0.2; // 最後だけ手のひらへ少し寄る
  const z = lerp(1, 1.04, easeInOut(ramp(252, 290)));
  const PX = 760, PY = 920, PS = 2.3;
  const lit = {
    back: easeOut(ramp(56, 64)), neck: easeOut(ramp(86, 94)), arms: easeOut(ramp(108, 116)),
    body: easeOut(ramp(141, 150)), palm: easeOut(ramp(249, 258)),
  };
  const mark = easeInOut(ramp(20, 252));
  const TL0 = 150, TL1 = 1110, TY = 175; // 右の凡例の列 (x≥1220) と重ならないよう左半分だけ
  const sq = ramp(250, 262);
  // 体をのぼる光の粒 (背中 → 首 → 腕 → 手のひら の道すじ)
  const route: [number, number][] = [[0, -104], [0, -162], [-60, -118], [60, -118], [68, -62]];
  const at = (u: number): [number, number] => {
    const k = Math.min(route.length - 2, Math.floor(u * (route.length - 1)));
    const r = u * (route.length - 1) - k;
    return [lerp(route[k][0], route[k + 1][0], r), lerp(route[k][1], route[k + 1][1], r)];
  };
  return (
    <Frame f={f} seed={2234} bg={C.museumWall}>
      <YbCam cx={lerp(960, PX + 68 * PS, zt)} cy={lerp(540, PY - 120 * PS, zt)} z={z}>
        {/* 夜の展示室: 壁・腰板・床・天井のスポット */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill="#2F3550" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 170} y1={-80} x2={i * 170} y2={780} stroke="#3B4263" strokeWidth={6} />)}
        <rect x={-80} y={780} width={W + 160} height={400} fill="#5A4A3E" />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-80} y1={820 + i * 50} x2={W + 80} y2={820 + i * 50} stroke="#4A3C32" strokeWidth={4} />)}
        <rect x={-80} y={770} width={W + 160} height={20} fill="#8A6E58" stroke={C.ink} strokeWidth={4} />
        <polygon points={`${PX - 60},-80 ${PX + 60},-80 ${PX + 380},940 ${PX - 380},940`} fill="#FFF1C9" opacity={0.13} />
        <ellipse cx={PX} cy={930} rx={330} ry={44} fill="#FFF1C9" opacity={0.22} />
        {/* 年表の帯 (20万年前 → 今) */}
        <rect x={TL0 - 20} y={TY - 34} width={TL1 - TL0 + 40} height={68} rx={34} fill="#3E4668" stroke={C.ink} strokeWidth={5} />
        <line x1={TL0 + 20} y1={TY} x2={TL1 - 20} y2={TY} stroke="#8D96BF" strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
        <line x1={TL0 + 20} y1={TY} x2={lerp(TL0 + 20, TL1 - 20, mark)} y2={TY} stroke={YP.glow} strokeWidth={8} strokeLinecap="round" />
        <g transform={`translate(${lerp(TL0 + 20, TL1 - 20, mark)} ${TY})`}>
          <circle r={22} fill={YP.glowCore} stroke={C.ink} strokeWidth={5} />
          <circle r={34} fill="none" stroke={YP.glow} strokeWidth={4} opacity={0.4 + 0.4 * Math.sin(f / 3)} />
        </g>
        <TagPlate x={TL0 + 60} y={TY + 86} text="20万年前" size={34} />
        <TagPlate x={TL1 - 40} y={TY + 86} text="今" size={34} />
        {/* 体をのぼる光の粒 */}
        {f >= 56 && f < 262 && Array.from({ length: 9 }, (_, i) => {
          const u = clamp01((f - 56 - i * 4) / 195);
          if (u <= 0 || u >= 1) return null;
          const [ux, uy] = at(u);
          return <circle key={i} cx={PX + ux * PS} cy={PY + uy * PS} r={9 - i * 0.5} fill={YP.glowCore}
            stroke={C.ink} strokeWidth={2} opacity={0.9 - i * 0.07} />;
        })}
        {/* からだの地図 (共有装置): 順に灯る */}
        <KaradaChizu x={PX} y={PY} s={PS} f={f} lit={lit} slots />
        {/* 最後に手のひらへスクイーズ */}
        {sq > 0 && (
          <g>
            <Squishy x={PX + 68 * PS} y={PY - 44 * PS} s={0.36 * pop(sq)} squeeze={0.3 + 0.3 * Math.sin(f / 3)} f={f} />
            {[0, 1, 2, 3].map((i) => {
              const a = -Math.PI / 2 + (i - 1.5) * 0.5;
              return <line key={i} x1={PX + 68 * PS + Math.cos(a) * 70} y1={PY - 70 * PS + Math.sin(a) * 70}
                x2={PX + 68 * PS + Math.cos(a) * 100} y2={PY - 70 * PS + Math.sin(a) * 100}
                stroke={YP.glow} strokeWidth={7} strokeLinecap="round" opacity={sq} />;
            })}
          </g>
        )}
      </YbCam>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_011: (f) => <Yw011 f={f} />,
  yw_012: (f) => <Yw012 f={f} />,
  yw_013: (f) => <Yw013 f={f} />,
  yw_014: (f) => <Yw014 f={f} />,
  yw_234: (f) => <Yw234 f={f} />, // ★2026-11-23 追加: #14 の次に入る1文
  yw_015: (f) => <Yw015 f={f} />,
  yw_016: (f) => <Yw016 f={f} />,
  yw_017: (f) => <Yw017 f={f} />,
  yw_018: (f) => <Yw018 f={f} />,
};

export const YW_AB_MOTIFS: string[] = [
  "yw_011",
  "yw_012",
  "yw_013",
  "yw_014",
  "yw_234", // ★2026-11-23 追加 (#14 の次。以降の文番号は1つずつ後ろへ)
  "yw_015",
  "yw_016",
  "yw_017",
  "yw_018",
];

export const yawaAbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
