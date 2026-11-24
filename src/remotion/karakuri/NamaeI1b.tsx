// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#203〜#211 (9文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  // 第8章は真面目なトーン: 少し落ち着いた色
  wall: "#D8D1C1",
  wallDark: "#BDB39D",
  wallBlue: "#C3CCCF",
  wallBlueDark: "#9FAAAE",
  wood: "#A87A4E",
  woodDark: "#7E5835",
  woodLight: "#C49A6A",
  glass: "#C9D8DE",
  glassDark: "#9DB3BC",
  pink: "#EBAAB8",
  pinkDark: "#C47A8C",
  narr: "#6F8FB0",
  narrDark: "#4F6C8C",
  sweater: "#8C6A3F",
  sweaterDark: "#6B4F2C",
  coat: "#F3F1E8",
  coatDark: "#D6D1C0",
  hair: "#3B332C",
  metal: "#8E959B",
  metalDark: "#5E656B",
  screen: "#24302C",
  screenLine: "#8FE0A8",
  mat: "#EBD3C2",
  matDark: "#D2B59E",
  mom: "#9A7C9E",
  momDark: "#76597A",
  baby: "#F4E3A8",
  bookRed: "#9A4A3C",
  bookGreen: "#5D7A55",
  bookBlue: "#4C6283",
  paperOld: "#EFE6CF",
  mirrorCloth: "#A58C9C",
  mirrorClothDark: "#7E6676",
  curtain: "#2E3A55",
  curtainDark: "#232C42",
  crowd: "#9A9A90",
  crowdDark: "#77776E",
  labWall: "#B9C4B4",
  labWallDark: "#9EAA98",
  board: "#3E5546",
  cork: "#C9A06E",
  eegWall: "#A9B4BE",
  eegPanel: "#97A3AE",
  eegFloor: "#7F8A92",
  capCloth: "#D9DDE2",
  momHair: "#7A5236",
  babyWall: "#F1E4D6",
  babyWallDark: "#E3D0BE",
  matA: "#BFD9C8",
  matB: "#F0C9B8",
  matC: "#F3E1A6",
  matD: "#C6D3EA",
  babyDark: "#D9C37E",
  night: "#2A2E3A",
  nightLine: "#232733",
  nightFloor: "#1E2029",
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

// 脳の模型 (横から見た半透明のピンク。台座つき)。中心 (x,y)、s=1 で幅 540px。
// 前 (おでこ側) が左。台座の底は y + 300*s
const NI1bBrain: React.FC<{ x: number; y: number; s?: number; f?: number; stand?: boolean; alpha?: number }> = ({
  x, y, s = 1, f = 0, stand = true, alpha = 0.82,
}) => {
  const outline =
    "M -250 10 Q -270 -90 -200 -150 Q -150 -200 -70 -205 Q 0 -225 80 -200 Q 170 -185 220 -120 Q 270 -60 262 10 " +
    "Q 258 60 220 85 Q 170 100 120 90 Q 60 110 0 100 Q -70 120 -140 100 Q -210 90 -240 50 Z";
  const gyri = [
    "M -200 -110 Q -150 -150 -100 -120 Q -60 -95 -20 -130",
    "M -220 -30 Q -170 -70 -120 -40 Q -80 -15 -40 -55 Q 0 -90 40 -60",
    "M -40 -180 Q 0 -140 -10 -90 Q -20 -40 20 -10",
    "M 60 -190 Q 90 -150 70 -110 Q 50 -70 90 -40",
    "M 120 -160 Q 170 -150 190 -110 Q 210 -70 180 -40",
    "M -200 40 Q -150 10 -100 40 Q -50 65 0 30 Q 50 0 100 30",
    "M 130 20 Q 170 -10 220 10",
    "M -120 -170 Q -90 -190 -60 -175",
    "M 20 -40 Q 60 -20 100 -50 Q 140 -80 160 -40",
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {stand && (
        <g>
          {/* 台座: 木の円盤 + 真鍮の支柱 */}
          <ellipse cx={20} cy={300} rx={190} ry={36} fill={KRP.ink} opacity={0.2} />
          <path d="M -160 262 L 200 262 L 190 296 L -150 296 Z" fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={20} cy={262} rx={180} ry={30} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={20} cy={258} rx={120} ry={16} fill="none" stroke={C.wood} strokeWidth={4} />
          <rect x={8} y={140} width={24} height={122} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-6} y={244} width={52} height={16} rx={6} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* 脳幹 */}
      <path d="M 40 90 Q 60 140 50 170 L 100 170 Q 100 130 110 90 Z" fill={C.pink} stroke={KRP.ink} strokeWidth={6} opacity={alpha} />
      {/* 小脳 */}
      <path d="M 110 85 Q 150 145 210 125 Q 250 105 235 70 Q 190 95 110 85 Z" fill={C.pinkDark} stroke={KRP.ink} strokeWidth={6} opacity={alpha} />
      <g stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.5}>
        <path d="M 135 100 Q 180 115 228 90" /><path d="M 150 116 Q 185 124 215 112" />
      </g>
      {/* 大脳 (半透明) */}
      <path d={outline} fill={C.pink} opacity={alpha} />
      <path d={outline} fill="none" stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.pinkDark} strokeWidth={7} fill="none" strokeLinecap="round">
        {gyri.map((d, i) => <path key={i} d={d} />)}
      </g>
      <g stroke={KRP.ink} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.45}>
        {gyri.map((d, i) => <path key={i} d={d} />)}
      </g>
      {/* 外側溝 (横の大きな溝) */}
      <path d="M -150 20 Q -60 -10 40 10 Q 90 20 130 0" stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* ガラスの照り */}
      <path d="M -190 -120 Q -130 -185 -40 -190" stroke={KRP.white} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.55 + Math.sin(f / 16) * 0.1} />
      <path d="M -215 -40 Q -218 -70 -205 -92" stroke={KRP.white} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.45} />
    </g>
  );
};

// 大きなヘッドホン (1950年代の重い型)。頭の中心 (x,y) に Person の頭 (r=64*s) を想定
const NI1bHeadphones: React.FC<{ x: number; y: number; s?: number; tilt?: number }> = ({ x, y, s = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
    <path d="M -70 -10 Q -74 -96 0 -98 Q 74 -96 70 -10" fill="none" stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
    <path d="M -70 -10 Q -74 -96 0 -98 Q 74 -96 70 -10" fill="none" stroke={C.metalDark} strokeWidth={11} strokeLinecap="round" />
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <rect x={sd === -1 ? -98 : 62} y={-40} width={36} height={80} rx={16} fill={C.metalDark} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={sd * 82} cy={0} rx={12} ry={30} fill={C.metal} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={sd * 84} cy={0} r={5} fill={KRP.ink} />
      </g>
    ))}
  </g>
);

// 古い学術書の並ぶ棚板 (x,y は棚板の左上、幅 w)
const NI1bShelf: React.FC<{ x: number; y: number; w: number; seed: number; n?: number }> = ({ x, y, w, seed, n = 12 }) => {
  const cols = [C.bookRed, C.bookGreen, C.bookBlue, C.woodDark, "#7A6A4E", C.bookRed];
  let cx = x + 10;
  const books: React.ReactElement[] = [];
  for (let i = 0; i < n && cx < x + w - 40; i++) {
    const bw = 30 + rnd(seed, i) * 26;
    const bh = 110 + rnd(seed + 1, i) * 50;
    const lean = rnd(seed + 2, i) > 0.85 ? 8 : 0;
    books.push(
      <g key={i} transform={lean ? `rotate(${lean} ${cx + bw} ${y})` : undefined}>
        <rect x={cx} y={y - bh} width={bw} height={bh} rx={3} fill={cols[i % cols.length]} stroke={KRP.ink} strokeWidth={4} />
        <rect x={cx + 4} y={y - bh + 16} width={bw - 8} height={8} fill={NP.brass} opacity={0.8} />
        <rect x={cx + 4} y={y - 30} width={bw - 8} height={6} fill={NP.brass} opacity={0.6} />
      </g>,
    );
    cx += bw + 3;
  }
  return (
    <g>
      {books}
      <rect x={x} y={y} width={w} height={22} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #203 自分が、違う人になったように感じた。
// 格: 山 / seed 4203
// 絵: 鏡の前に立つ人の後ろ姿。鏡の中の自分が、ほんの少しだけ**別の色の服**で映っていて、名札の字も違う (f でゆらぐ)。手前の本人は首をかしげる。真面目に、静かに
// どこ: 夜の洗面所の壁掛けの大きな鏡 (ランプ1つ・タイルの壁・棚に名前の卓上札)
// 演出: 手前は本人の後ろ姿 (青い服)。鏡の中の本人だけ、服がくすんだ藤色に変わり、棚の札の映り込みの字が「旧姓」にゆらぐ
// 動き: カメラはゆっくり鏡へ寄る / f8〜30 鏡の中の服の色が変わる / f14〜34 映り込みの札の字が入れかわる (ゆらぎ) / f20〜40 本人が首をかしげる
const NI1bBackHead: React.FC<{ x: number; y: number; s: number; hair?: string; collar?: string }> = ({ x, y, s, hair = C.hair, collar = C.narrDark }) => (
  // Person の頭 (中心 y-228s, r=64s) を、後頭部 (髪) で覆う
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((sd) => (
      <ellipse key={sd} cx={sd * 64} cy={-222} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    ))}
    <circle cx={0} cy={-228} r={67} fill={hair} stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M -40 -262 Q 0 -286 40 -262" stroke={KRP.white} strokeWidth={6} opacity={0.22} fill="none" strokeLinecap="round" />
    <path d="M -30 -168 Q 0 -160 30 -168" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.6} />
    {/* 胸ポケットを背中から隠す */}
    <rect x={14} y={-142} width={34} height={28} fill={collar === C.narrDark ? C.narr : C.mom} />
    {/* 背中の襟とシャツのしわ */}
    <path d="M -30 -158 Q 0 -146 30 -158" stroke={KRP.ink} strokeWidth={4.5} fill="none" />
    <path d="M 0 -150 L 0 -64" stroke={collar} strokeWidth={4} opacity={0.6} />
  </g>
);
const Nm203: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const shift = seg(f, 8, 30);
  const nameT = seg(f, 14, 34);
  const flick = nameT > 0 && nameT < 1 ? (Math.sin(f * 1.9) > 0 ? 0.25 : -0.15) : 0;
  const oldName = clamp01(easeInOut(nameT) + flick);
  const tilt = -6 * easeInOut(seg(f, 20, 40)) + Math.sin(f / 18) * 0.6;
  const shimmer = Math.sin(f / 5) * 2.2 * (shift > 0 && shift < 1 ? 1 : 0.35);
  const MX = 1010, MY = 470; // 鏡の中心
  return (
    <Frame f={f} seed={4203} bg={C.wall}>
      <g transform={`translate(${MX} ${MY}) scale(${cam}) translate(${-MX} ${-MY})`}>
        {/* 壁: 上は漆喰、下はタイル */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.wall} />
        <rect x={-60} y={560} width={W + 120} height={600} fill={C.wallBlue} />
        <g stroke={C.wallBlueDark} strokeWidth={3}>
          {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-60 + i * 70} y1={560} x2={-60 + i * 70} y2={1140} />)}
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-60} y1={560 + i * 70} x2={W + 60} y2={560 + i * 70} />)}
        </g>
        <rect x={-60} y={548} width={W + 120} height={18} fill={C.wallDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 左の壁ランプ (暖かい光の輪) */}
        <circle cx={480} cy={300} r={210} fill={NP.glow} opacity={0.16 + Math.sin(f / 20) * 0.02} />
        <rect x={470} y={330} width={20} height={70} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 430 330 L 530 330 L 505 250 L 455 250 Z" fill={NP.glowCore} stroke={KRP.ink} strokeWidth={5} />
        <rect x={455} y={392} width={50} height={14} rx={4} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 右のタオル掛けとタオル */}
        <rect x={1440} y={330} width={260} height={14} rx={7} fill={C.metal} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 1480 336 L 1660 336 L ${1650 + Math.sin(f / 15) * 3} 560 L ${1490 + Math.sin(f / 15) * 3} 560 Z`} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.blue} strokeWidth={6}><line x1={1490} y1={520} x2={1652} y2={520} /><line x1={1490} y1={534} x2={1652} y2={534} /></g>
        {/* 鏡の木枠 */}
        <rect x={MX - 360} y={MY - 380} width={720} height={740} rx={40} fill={KRP.ink} opacity={0.18} transform="translate(12 14)" />
        <rect x={MX - 360} y={MY - 380} width={720} height={740} rx={40} fill={C.woodDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={MX - 336} y={MY - 356} width={672} height={692} rx={28} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        {/* 鏡の中 (少し暗く青みがかった、映り込みの部屋) */}
        <defs>
          <clipPath id="ni1b-mirror"><rect x={MX - 310} y={MY - 330} width={620} height={640} rx={18} /></clipPath>
        </defs>
        <g clipPath="url(#ni1b-mirror)">
          <rect x={MX - 310} y={MY - 330} width={620} height={640} fill={C.glass} />
          <rect x={MX - 310} y={MY + 90} width={620} height={300} fill={C.glassDark} />
          <g stroke={C.wallBlueDark} strokeWidth={3} opacity={0.6}>
            {Array.from({ length: 10 }, (_, i) => <line key={i} x1={MX - 310 + i * 66} y1={MY + 90} x2={MX - 310 + i * 66} y2={MY + 330} />)}
          </g>
          {/* 映り込みのランプ (左右反転なので右奥) */}
          <circle cx={MX + 250} cy={MY - 190} r={110} fill={NP.glow} opacity={0.18} />
          {/* 鏡の中の本人 (こちらを向く)。服の色がゆっくり変わる */}
          <g transform={`translate(${shimmer} 0) rotate(${-tilt * 0.9} ${MX + 30} ${MY + 330})`}>
            <Person x={MX + 30} y={MY + 330} s={1.18} f={f} cloth={C.narr} clothDark={C.narrDark} face="normal" gaze={[1, -2]} still />
            <g opacity={shift}>
              <Person x={MX + 30} y={MY + 330} s={1.18} f={f} cloth={C.mirrorCloth} clothDark={C.mirrorClothDark} face="normal" gaze={[1, -2]} still />
            </g>
          </g>
          {/* ゆらぎの縞 (水面のように) */}
          <g stroke={KRP.white} strokeWidth={4} opacity={0.35 * Math.sin(shift * Math.PI) + 0.08} fill="none">
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M ${MX - 300} ${MY - 200 + i * 120 + Math.sin(f / 4 + i) * 6} q 150 ${-14} 300 0 q 150 14 300 0`} />
            ))}
          </g>
          {/* 映り込みの卓上札 (字が旧姓にゆらぐ) */}
          <g transform={`translate(${MX + 200} ${MY + 268})`}>
            <path d="M -96 0 L 96 0 L 86 -64 L -86 -64 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
            <text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={NP.sumi} opacity={1 - oldName}>山田</text>
            <text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.red} opacity={oldName}
              style={{ filter: `blur(${(1 - oldName) * 3}px)` }}>佐藤</text>
          </g>
          {/* ガラスの照り */}
          <path d={`M ${MX - 260} ${MY - 240} L ${MX - 150} ${MY - 330}`} stroke={KRP.white} strokeWidth={26} opacity={0.35} />
          <path d={`M ${MX - 270} ${MY - 150} L ${MX - 90} ${MY - 330}`} stroke={KRP.white} strokeWidth={10} opacity={0.3} />
        </g>
        {/* 鏡の下の棚 (ガラス板) と本物の卓上札 */}
        <rect x={MX - 380} y={MY + 340} width={760} height={24} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        <rect x={MX - 360} y={MY + 364} width={20} height={40} fill={C.metal} stroke={KRP.ink} strokeWidth={4} />
        <rect x={MX + 340} y={MY + 364} width={20} height={40} fill={C.metal} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`translate(${MX + 210} ${MY + 340})`}>
          <path d="M -110 0 L 110 0 L 98 -76 L -98 -76 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={NP.sumi}>山田</text>
        </g>
        {/* 棚の上: 歯ブラシのコップと石けん */}
        <rect x={MX - 300} y={MY + 262} width={60} height={78} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <line x1={MX - 280} y1={MY + 266} x2={MX - 292} y2={MY + 200} stroke={KRP.red} strokeWidth={8} strokeLinecap="round" />
        <line x1={MX - 258} y1={MY + 266} x2={MX - 246} y2={MY + 206} stroke={KRP.green} strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={MX - 160} cy={MY + 326} rx={48} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <rect x={MX - 196} y={MY + 300} width={72} height={26} rx={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        {/* 手前: 本人の後ろ姿 (首をかしげる) */}
        <g transform={`rotate(${tilt} 800 1040)`}>
          <Person x={800} y={1040} s={1.6} f={f} cloth={C.narr} clothDark={C.narrDark} still />
          <NI1bBackHead x={800} y={1040} s={1.6} />
        </g>
        {/* 小さな「？」(静かに、本人の頭の横に) */}
        <QMark x={600} y={520} s={0.55} f={f} t={seg(f, 26, 38)} color={KRP.grayDark} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #204 およそ7人に1人。多くはありませんが、ゼロでもありません。
// 格: 図 / seed 4204
// 絵: 7人の人形が横一列。そのうち1人だけ、胸の名札が少し揺れている (f)。左に「7人に1人」の札。「ゼロではない」ことを、1人に小さな光を当てて示す
// どこ: 小さな木の舞台 (紺の幕・床板)。7人が横一列に並ぶ
// 演出: 全員の胸に小さな名札。5人目の名札だけがゆれていて、上から小さなスポットライトが1つだけ当たる (=ゼロではない)
// 動き: f6〜20 スポットが灯る / 5人目の名札がゆらゆら / 5人目がそっと胸元を見下ろす / カメラは5人目へわずかに寄る
const Nm204: React.FC<{ f: number }> = ({ f }) => {
  const spot = easeOut(seg(f, 6, 20));
  const cam = 1 + 0.05 * easeInOut(seg(f, 4, 40));
  const SX = 1320; // 光の当たる人
  const FY = 770; // 足元
  const S = 1.0;
  return (
    <Frame f={f} seed={4204} bg={C.curtain}>
      <g transform={`translate(${SX} 560) scale(${cam}) translate(${-SX} -560)`}>
        {/* 幕 (ひだ) */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.curtain} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${-60 + i * 130} -80 Q ${-20 + i * 130 + Math.sin(f / 30 + i) * 4} 400 ${-60 + i * 130} ${FY}`}
            stroke={C.curtainDark} strokeWidth={26} fill="none" opacity={0.8} />
        ))}
        {/* 上の飾り幕 */}
        <path d={`M -80 -80 L ${W + 80} -80 L ${W + 80} 70 ${Array.from({ length: 12 }, (_, i) => `Q ${W + 80 - (i + 0.5) * 172} 140 ${W + 80 - (i + 1) * 172} 70`).join(" ")} Z`}
          fill={C.bookRed} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M -80 54 L ${W + 80} 54`} stroke={NP.brass} strokeWidth={6} />
        {/* 床板 */}
        <rect x={-80} y={FY - 20} width={W + 160} height={400} fill={C.woodDark} />
        <rect x={-80} y={FY - 20} width={W + 160} height={24} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.45}>
          {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-80} y1={FY + 40 + i * 60} x2={W + 80} y2={FY + 40 + i * 60} />)}
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={80 + i * 170 + (i % 2) * 60} y1={FY + 40} x2={80 + i * 170 + (i % 2) * 60} y2={FY + 100} />)}
        </g>
        {/* スポットライトの光の円錐と床の光の輪 */}
        <g opacity={spot}>
          <path d={`M ${SX - 40} -80 L ${SX + 40} -80 L ${SX + 170} ${FY + 10} L ${SX - 170} ${FY + 10} Z`} fill={NP.glow} opacity={0.28} />
          <path d={`M ${SX - 20} -80 L ${SX + 20} -80 L ${SX + 100} ${FY} L ${SX - 100} ${FY} Z`} fill={NP.glowCore} opacity={0.22} />
          <ellipse cx={SX} cy={FY + 6} rx={180} ry={34} fill={NP.glowCore} opacity={0.65} />
        </g>
        {/* 7人 */}
        {Array.from({ length: 7 }, (_, i) => {
          const px = 520 + i * 200;
          const me = px === SX;
          const sw = me ? Math.sin(f / 6) * 14 : 0;
          return (
            <g key={i} opacity={me ? 1 : 0.78 + spot * -0.12}>
              <ellipse cx={px} cy={FY + 4} rx={62} ry={12} fill={KRP.ink} opacity={0.3} />
              <Person x={px} y={FY} s={S} f={f} phase={i} cloth={me ? C.narr : C.crowd} clothDark={me ? C.narrDark : C.crowdDark}
                face="normal" gaze={me ? [2, 7] : [0, 0]} />
              {/* 胸の名札 (安全ピンでとめた白い小札) */}
              <g transform={`rotate(${sw} ${px - 26} ${FY - 140})`}>
                <circle cx={px - 26} cy={FY - 140} r={5} fill={C.metal} stroke={KRP.ink} strokeWidth={2.5} />
                <rect x={px - 50} y={FY - 136} width={48} height={32} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                <line x1={px - 42} y1={FY - 124} x2={px - 10} y2={FY - 124} stroke={NP.sumi} strokeWidth={4} opacity={me ? 0.4 + 0.4 * Math.abs(Math.sin(f / 6)) : 0.8} />
                <line x1={px - 42} y1={FY - 114} x2={px - 22} y2={FY - 114} stroke={NP.sumi} strokeWidth={4} opacity={0.6} />
              </g>
              {/* ゆれの線 */}
              {me && spot > 0.5 && (
                <g stroke={KRP.white} strokeWidth={4} strokeLinecap="round" opacity={0.7}>
                  <path d={`M ${px - 72} ${FY - 140} q -8 12 0 24`} fill="none" />
                  <path d={`M ${px + 18} ${FY - 140} q 8 12 0 24`} fill="none" />
                </g>
              )}
            </g>
          );
        })}
        {/* 天井の小さなライト本体 */}
        <g transform={`translate(${SX} 90)`}>
          <rect x={-8} y={-30} width={16} height={30} fill={C.metalDark} />
          <path d="M -36 0 L 36 0 L 24 40 L -24 40 Z" fill={C.metal} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={40} rx={24} ry={8} fill={spot > 0.3 ? NP.glowCore : C.metalDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 左の札 (カメラの外に置いて端で切れないように) */}
      <TagPlate x={240} y={300} text="7人に1人" size={52} t={seg(f, 2, 14)} rot={-3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #205 次に、脳を見てみましょう。
// 格: 並 / seed 4205
// 絵: 研究室の机の上に、脳の模型 (半透明・ピンク)。ナレーター役の Person が虫眼鏡でのぞく。棚に古い学術書
// どこ: 古い研究室 (壁に脳の解剖図・本棚に古い学術書・机の上にランプとノート)
// 演出: 机の真ん中に大きな脳の模型。左のナレーターが虫眼鏡を近づけ、レンズの中だけ脳のしわが大きく見える
// 動き: f6〜32 虫眼鏡が模型のおでこ側へ寄っていく / ナレーターが前へ乗り出す / カメラが模型へ寄る / ランプの光がわずかにゆれる
const Nm205: React.FC<{ f: number }> = ({ f }) => {
  const go = easeInOut(seg(f, 6, 32));
  const cam = 1 + 0.07 * easeInOut(seg(f, 0, 42));
  const BX = 1100, BY = 420, BS = 1.15;
  const lx = lerp(720, 960, go), ly = lerp(540, 330, go); // レンズの中心
  const LR = 92;
  const PX = 470, PY = 930, PS = 1.5;
  const la = (6 * go * Math.PI) / 180; // 乗り出しの角度
  const hdx = 153 * PS, hdy = -148 * PS;
  const hand: [number, number] = [PX + hdx * Math.cos(la) - hdy * Math.sin(la), PY + hdx * Math.sin(la) + hdy * Math.cos(la)];
  return (
    <Frame f={f} seed={4205} bg={C.wall}>
      <g transform={`translate(${BX} 520) scale(${cam}) translate(${-BX} -520)`}>
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.wall} />
        {/* 腰板 */}
        <rect x={-80} y={600} width={W + 160} height={200} fill={C.woodDark} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-40 + i * 130} y1={600} x2={-40 + i * 130} y2={800} />)}
        </g>
        <rect x={-80} y={592} width={W + 160} height={16} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        {/* 壁の解剖図 (額入り・字なし) */}
        <g transform="translate(60 90) rotate(-2 290 260)">
          <rect x={140} y={110} width={300} height={320} rx={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={160} y={130} width={260} height={280} fill={C.paperOld} stroke={KRP.ink} strokeWidth={3} />
          <NI1bBrain x={292} y={270} s={0.4} f={f} stand={false} alpha={0.7} />
          <g stroke={KRP.ink} strokeWidth={3}>
            <line x1={200} y1={170} x2={240} y2={215} /><line x1={390} y1={180} x2={350} y2={230} /><line x1={380} y1={380} x2={350} y2={320} />
          </g>
          {[[195, 165], [395, 175], [385, 385]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />)}
        </g>
        {/* 本棚 (古い学術書) */}
        <rect x={1500} y={40} width={440} height={570} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1520} y={60} width={400} height={530} fill="#5A3F28" />
        <NI1bShelf x={1520} y={250} w={400} seed={4205} />
        <NI1bShelf x={1520} y={440} w={400} seed={4305} />
        <NI1bShelf x={1520} y={590} w={400} seed={4405} n={8} />
        {/* 机 (天板の奥行き) */}
        <path d={`M -80 760 L ${W + 80} 760 L ${W + 80} 820 L -80 820 Z`} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
        {/* ナレーター (机の向こう、身を乗り出す) */}
        <g transform={`rotate(${6 * go} ${PX} ${PY})`}>
          <Person x={PX} y={PY} s={PS} f={f} cloth={C.narr} clothDark={C.narrDark} pose="point" face="normal" gaze={[5, 2]} />
        </g>
        {/* 机の前板 */}
        <rect x={-80} y={812} width={W + 160} height={360} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.woodDark} strokeWidth={4} opacity={0.6} fill="none">
          <path d="M -60 870 q 500 -10 1000 0 q 500 10 1000 0" /><path d="M -60 950 q 400 12 900 0 q 500 -12 1100 0" />
        </g>
        {/* 机の上: ランプ */}
        <circle cx={1440} cy={600} r={200} fill={NP.glow} opacity={0.14 + Math.sin(f / 13) * 0.02} />
        <ellipse cx={1440} cy={780} rx={80} ry={16} fill={C.metalDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1440 776 L 1420 600 L 1470 560" stroke={KRP.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d="M 1440 776 L 1420 600 L 1470 560" stroke={C.bookGreen} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M 1430 540 L 1540 520 L 1530 600 Z" fill={C.bookGreen} stroke={KRP.ink} strokeWidth={6} />
        {/* 机の上: 開いたノートと鉛筆 */}
        <g transform="rotate(-6 760 790)">
          <path d="M 640 800 L 760 790 L 880 800 L 880 828 L 640 828 Z" fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
          <line x1={760} y1={790} x2={760} y2={828} stroke={KRP.ink} strokeWidth={3} />
          <rect x={790} y={782} width={110} height={10} rx={4} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} transform="rotate(-8 790 782)" />
        </g>
        {/* 脳の模型 */}
        <NI1bBrain x={BX} y={BY} s={BS} f={f} />
        {/* 虫眼鏡: 柄 → 手 */}
        <line x1={hand[0]} y1={hand[1]} x2={lx - LR * 0.7} y2={ly + LR * 0.7} stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
        <line x1={hand[0]} y1={hand[1]} x2={lx - LR * 0.7} y2={ly + LR * 0.7} stroke={C.woodDark} strokeWidth={18} strokeLinecap="round" />
        <circle cx={hand[0]} cy={hand[1]} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* レンズの中 (2倍に拡大した脳) */}
        <defs><clipPath id="ni1b-lens205"><circle cx={lx} cy={ly} r={LR} /></clipPath></defs>
        <g clipPath="url(#ni1b-lens205)">
          <circle cx={lx} cy={ly} r={LR} fill={C.wall} />
          <g transform={`translate(${lx} ${ly}) scale(1.9) translate(${-lx} ${-ly})`}>
            <NI1bBrain x={BX} y={BY} s={BS} f={f} stand={false} />
          </g>
          <circle cx={lx} cy={ly} r={LR} fill={KRP.blueSoft} opacity={0.15} />
        </g>
        <circle cx={lx} cy={ly} r={LR} fill="none" stroke={KRP.ink} strokeWidth={20} />
        <circle cx={lx} cy={ly} r={LR} fill="none" stroke={NP.brass} strokeWidth={11} />
        <path d={`M ${lx - 54} ${ly - 40} Q ${lx - 30} ${ly - 70} ${lx + 4} ${ly - 74}`} stroke={KRP.white} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #206 1959年、左右の耳に別々の話を流し、片方だけに集中してもらう実験が行われました。
// 格: 山 / seed 4206
// 絵: ★1950年代の心理学の実験室 (オープンリールのテープレコーダー2台・木の机・白衣の研究者)。参加者が大きなヘッドホンをつけて座り、**左右の耳に違う色の音の波** (左=青・右=橙) が流れ込む。参加者は右の話だけを紙に書き取っている。札「1959年」
// どこ: 1950年代の心理学の実験室 (緑灰色の壁・木の長机・左右にオープンリールのテープレコーダー・壁の丸時計・黒板)
// 演出: 真ん中に大きなヘッドホンの参加者。左のレコーダーから青い音の波が左耳へ、右のレコーダーから橙の波が右耳へ。参加者は右の話だけを紙に書き取る (紙の字の線は橙)。左奥で白衣の研究者がクリップボードに記録
// 動き: リールが回る / 波が耳へ流れ込む (f2〜16 で伸びきる) / 鉛筆が動き紙の線が増える / カメラはゆっくり参加者へ寄る
// ★#206 と #207 は同じ部屋・同じ時間の続き (指示書の指定)。部屋はこの NI1bListenLab を2文で使う
const NI1bReel: React.FC<{ x: number; y: number; s?: number; f: number; col: string; colDark: string }> = ({ x, y, s = 1, f, col, colDark }) => {
  const reel = (cx: number, rot: number) => (
    <g transform={`translate(${cx} -170) rotate(${rot})`}>
      <circle r={62} fill={C.screen} stroke={KRP.ink} strokeWidth={5} />
      <circle r={44} fill={C.woodDark} opacity={0.9} />
      <circle r={58} fill="none" stroke={C.metal} strokeWidth={6} />
      {[0, 120, 240].map((a) => (
        <path key={a} d="M 0 -10 L 14 -48 L -14 -48 Z" fill={C.metal} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${a})`} />
      ))}
      <circle r={12} fill={C.metal} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  // x,y = 足元 (机の上の底の中央)
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-156} y={-250} width={312} height={250} rx={14} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-140} y={-238} width={280} height={140} rx={8} fill={C.metalDark} stroke={KRP.ink} strokeWidth={4} />
      {reel(-70, f * 7)}
      {reel(70, f * 7 + 40)}
      {/* テープ */}
      <path d="M -70 -108 L -30 -104 L 30 -104 L 70 -108" stroke={C.sweaterDark} strokeWidth={5} fill="none" />
      <rect x={-34} y={-112} width={68} height={16} rx={4} fill={C.metal} stroke={KRP.ink} strokeWidth={3} />
      {/* スピーカーの網 (色で左右を区別) */}
      <rect x={-140} y={-88} width={150} height={74} rx={8} fill={col} stroke={KRP.ink} strokeWidth={4} />
      <g stroke={colDark} strokeWidth={4}>
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-130} y1={-76 + i * 16} x2={0} y2={-76 + i * 16} />)}
      </g>
      {/* つまみ */}
      {[40, 80, 120].map((kx, i) => (
        <g key={i} transform={`translate(${kx} -50) rotate(${i * 40 + Math.sin(f / 20) * 4})`}>
          <circle r={14} fill={C.coat} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={0} x2={0} y2={-11} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 光る通電ランプ */}
      <circle cx={126} cy={-226} r={7} fill={KRP.red} opacity={0.6 + Math.sin(f / 3) * 0.3} />
    </g>
  );
};
// 2点を結ぶ音の波 (正弦の線)。t で伸び、phase で流れる
const ni1bWave = (x1: number, y1: number, x2: number, y2: number, amp: number, len: number, phase: number, t = 1) => {
  const dx = x2 - x1, dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L;
  const N = 60;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * clamp01(t);
    const a = amp * Math.sin((u * L) / len * Math.PI * 2 - phase) * Math.min(1, u * 6, (1 - u) * 10 + 0.3);
    pts.push(`${i ? "L" : "M"} ${(x1 + dx * u + nx * a).toFixed(1)} ${(y1 + dy * u + ny * a).toFixed(1)}`);
  }
  return pts.join(" ");
};
const NI1B_LAB = {
  PX: 960, PY: 900, PS: 1.45, // 参加者
  LS: [450, 640] as [number, number], RS: [1340, 640] as [number, number], // スピーカーの口
};
const NI1bListenLab: React.FC<{ f: number; mode: 206 | 207 }> = ({ f, mode }) => {
  const { PX, PY, PS, LS, RS } = NI1B_LAB;
  const headY = PY - 228 * PS;
  const earL: [number, number] = [PX - 82 * PS - 18, headY];
  const earR: [number, number] = [PX + 82 * PS + 18, headY];
  const grow = easeOut(seg(f, 2, 16));
  const notice = mode === 207 ? easeOut(seg(f, 28, 34)) : 0;
  const writing = mode === 206 ? 1 : 1 - notice;
  const lift = -18 * notice; // はっと顔を上げる
  const pen = Math.sin(f / 2.2) * 10 * writing;
  const lines = mode === 206 ? 1 + Math.floor(seg(f, 0, 42) * 4) : 4;
  return (
    <g>
      {/* 壁 (緑灰) と腰壁 */}
      <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.labWall} />
      <rect x={-80} y={520} width={W + 160} height={300} fill={C.labWallDark} />
      <rect x={-80} y={512} width={W + 160} height={14} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 黒板 (図だけ: 耳と2本の矢印) */}
      <rect x={640} y={90} width={640} height={250} rx={8} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={656} y={106} width={608} height={218} fill={C.board} />
      <g stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.75} strokeLinecap="round">
        <circle cx={960} cy={215} r={50} />
        <path d="M 760 215 L 890 215 M 870 200 L 890 215 L 870 230" />
        <path d="M 1160 215 L 1030 215 M 1050 200 L 1030 215 L 1050 230" />
        <path d="M 945 200 q 15 -14 25 0 q 10 16 -10 30" />
      </g>
      <text x={720} y={170} fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.blue} opacity={0.9}>L</text>
      <text x={1180} y={170} fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.orange} opacity={0.9}>R</text>
      {/* 丸時計 */}
      <g transform="translate(1580 200)">
        <circle r={74} fill={C.coat} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-60} x2={0} y2={-50} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-36} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform="rotate(300)" />
        <line x1={0} y1={0} x2={0} y2={-54} stroke={KRP.red} strokeWidth={3} strokeLinecap="round" transform={`rotate(${f * 6})`} />
        <circle r={6} fill={KRP.ink} />
      </g>
      {/* 研究者 (左奥・白衣・眼鏡・クリップボード) */}
      <Person x={170} y={880} s={1.32} f={f} phase={3} cloth={C.coat} clothDark={C.coatDark} glasses pose="hold"
        face={notice > 0.5 ? "surprised" : "normal"} gaze={[4, 3]} />
      {/* 参加者 (茶のセーター) */}
      <g transform={`translate(0 ${lift})`}>
        <Person x={PX} y={PY} s={PS} f={f} cloth={C.sweater} clothDark={C.sweaterDark} pose="hold"
          face={notice > 0.5 ? "surprised" : "normal"} gaze={notice > 0.5 ? [-6, -3] : [0, 7]} still />
        <NI1bHeadphones x={PX} y={headY} s={PS} />
        {/* 耳当ての色 (左=青・右=橙) */}
        <circle cx={earL[0] + 18} cy={headY} r={14} fill={KRP.blueDeep} opacity={0.5 + 0.4 * grow} />
        <circle cx={earR[0] - 18} cy={headY} r={14} fill={KRP.orange} opacity={0.5 + 0.4 * grow} />
      </g>
      {/* 机 (長机の天板) */}
      <path d={`M -80 720 L ${W + 80} 720 L ${W + 80} 770 L -80 770 Z`} fill={C.woodLight} stroke={KRP.ink} strokeWidth={6} />
      {/* レコーダー 2台 */}
      <NI1bReel x={LS[0] - 30} y={724} f={f} col={KRP.blue} colDark={KRP.blueDeep} />
      <NI1bReel x={RS[0] + 30} y={724} f={f} col={KRP.orange} colDark={C.sweaterDark} />
      {/* ヘッドホンのコード */}
      <path d={`M ${earL[0]} ${headY + 40 + lift} Q ${PX - 200} 760 ${LS[0] + 120} 720`} stroke={KRP.ink} strokeWidth={6} fill="none" />
      <path d={`M ${earR[0]} ${headY + 40 + lift} Q ${PX + 200} 760 ${RS[0] - 120} 720`} stroke={KRP.ink} strokeWidth={6} fill="none" />
      {/* 書き取りの紙 (右の話だけ。線は橙) */}
      <g transform="rotate(-4 960 740)">
        <path d="M 850 726 L 1070 726 L 1090 762 L 830 762 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: lines }, (_, i) => (
          <line key={i} x1={858 + i * 4} y1={734 + i * 7} x2={1000 + (i === lines - 1 ? pen * 2 : 50) - i * 6} y2={734 + i * 7}
            stroke={KRP.orange} strokeWidth={3.5} strokeLinecap="round" />
        ))}
      </g>
      {/* 鉛筆 (右手) */}
      <g transform={`translate(${PX + 20 + pen} ${PY - 118 * PS + lift * 0.3}) rotate(${-30 + notice * -40})`}>
        <rect x={-6} y={-70} width={12} height={74} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        <path d="M -6 4 L 6 4 L 0 18 Z" fill={C.woodLight} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 研究者のクリップボード */}
      <g transform={`translate(170 ${880 - 118 * 1.32 - 6}) rotate(-8)`}>
        <rect x={-46} y={-64} width={92} height={110} rx={6} fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-36} y={-50} width={72} height={88} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        <rect x={-18} y={-72} width={36} height={16} rx={4} fill={C.metal} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-28} y1={-34 + i * 18} x2={22} y2={-34 + i * 18} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />)}
      </g>
      {/* 音の波: 左=青 → 左耳 / 右=橙 → 右耳 */}
      {[0, 1].map((k) => (
        <path key={`b${k}`} d={ni1bWave(LS[0], LS[1], earL[0], earL[1] + lift, 18 - k * 8, 90, f * 0.5 + k * 1.4, grow)}
          stroke={k ? KRP.blue : KRP.blueDeep} strokeWidth={k ? 5 : 11} fill="none" strokeLinecap="round" opacity={k ? 0.9 : 0.85} />
      ))}
      {[0, 1].map((k) => (
        <path key={`o${k}`} d={ni1bWave(RS[0], RS[1], earR[0], earR[1] + lift, 18 - k * 8, 90, f * 0.5 + k * 1.4, grow)}
          stroke={k ? KRP.yellow : KRP.orange} strokeWidth={k ? 5 : 11} fill="none" strokeLinecap="round" />
      ))}
      {/* 机の前板 */}
      <rect x={-80} y={768} width={W + 160} height={400} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.woodDark} strokeWidth={4} opacity={0.6} fill="none">
        <path d="M -60 830 q 500 -10 1000 0 q 500 10 1000 0" /><path d="M -60 920 q 400 12 900 0 q 500 -12 1100 0" />
      </g>
    </g>
  );
};
const Nm206: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  // 右の耳 (集中している側) にだけ、小さな「聞いてる」光
  const focus = seg(f, 14, 26);
  const { PX, PY, PS } = NI1B_LAB;
  return (
    <Frame f={f} seed={4206} bg={C.labWall}>
      <g transform={`translate(960 560) scale(${cam}) translate(-960 -560)`}>
        <NI1bListenLab f={f} mode={206} />
        <circle cx={PX + 82 * PS + 18} cy={PY - 228 * PS} r={40 + Math.sin(f / 4) * 4} fill="none" stroke={KRP.orange} strokeWidth={5} opacity={focus * 0.8} />
      </g>
      <TagPlate x={330} y={240} text="1959年" size={50} t={seg(f, 2, 12)} rot={-2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #207 すると、聞いていないはずの耳で自分の名前が流れたとき、およそ3人に1人が気づいたのです。
// 格: 山 / seed 4207
// 絵: ★#206 の続き。左の青い音の波の中に、**名札の形の光**がまぎれて流れ込む (f)。参加者がはっと顔を上げる (surprised)。横に3人の参加者の小さな絵が並び、そのうち1人だけが振り向いている。札「約3人に1人」
// どこ: #206 と同じ実験室・同じ時間の続き (カメラは参加者の左側へ寄る)
// 演出: 左の青い波の中に、名札の形の光がまぎれて流れ、左耳へ入る。その瞬間に参加者が鉛筆を止めて、はっと顔を上げる。壁の掲示板に「3人のうち1人だけ振り向く」図
// 動き: f6〜28 名札の光が波に乗って左耳へ / f28 耳に入って光がはじける / f28〜34 参加者が顔を上げる (surprised) / f30〜40 掲示板の図と札が出る
const Nm207: React.FC<{ f: number }> = ({ f }) => {
  const { PX, PY, PS, LS } = NI1B_LAB;
  const cam = 1.12 + 0.05 * easeInOut(seg(f, 0, 42));
  const headY = PY - 228 * PS;
  const ear: [number, number] = [PX - 82 * PS - 18, headY];
  const u = easeInOut(seg(f, 6, 28));
  const lift = -18 * easeOut(seg(f, 28, 34));
  // 光の位置 (波の上)
  const bx = lerp(LS[0], ear[0], u);
  const by = lerp(LS[1], ear[1] + lift, u) + Math.sin(u * 9 - f * 0.5) * 14;
  const inEar = seg(f, 27, 36);
  const board = seg(f, 30, 40);
  return (
    <Frame f={f} seed={4207} bg={C.labWall}>
      <g transform={`translate(760 600) scale(${cam}) translate(-760 -600)`}>
        <NI1bListenLab f={f} mode={207} />
        {/* 名札の形の光 (波の中を流れる) */}
        {u < 0.995 && (
          <g transform={`translate(${bx} ${by}) rotate(${Math.sin(f / 3) * 8}) scale(${0.7 + 0.3 * seg(f, 6, 12)})`}>
            <rect x={-62} y={-34} width={124} height={68} rx={12} fill={NP.glow} opacity={0.45} transform="scale(1.4)" />
            <rect x={-50} y={-26} width={100} height={52} rx={10} fill={NP.glowCore} stroke={NP.brassDark} strokeWidth={5} />
            {[[-50, 3], [50, 3], [0, 26]].map(([kx, ky], i) => (
              <circle key={i} cx={kx} cy={ky} r={7} fill={NP.brass} stroke={NP.brassDark} strokeWidth={3} />
            ))}
            <rect x={-30} y={-6} width={60} height={10} rx={5} fill={NP.brass} opacity={0.7} />
          </g>
        )}
        {/* 光が耳に入った瞬間のはじけ */}
        {inEar > 0 && inEar < 1 && (
          <g opacity={1 - inEar}>
            <circle cx={ear[0]} cy={ear[1] + lift} r={30 + inEar * 90} fill="none" stroke={NP.glow} strokeWidth={10} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={ear[0] + Math.cos(a) * 50} y1={ear[1] + lift + Math.sin(a) * 50}
                x2={ear[0] + Math.cos(a) * (80 + inEar * 50)} y2={ear[1] + lift + Math.sin(a) * (80 + inEar * 50)}
                stroke={NP.brass} strokeWidth={6} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 耳に残る名札の光 */}
        {inEar >= 1 && <circle cx={ear[0]} cy={ear[1] + lift} r={44 + Math.sin(f / 4) * 5} fill={NP.glow} opacity={0.5} />}
        {/* 気づきの線 (頭の上) */}
        {inEar > 0.3 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
            {[-1, 0, 1].map((k) => (
              <line key={k} x1={PX + k * 60} y1={headY - 120 * PS + lift} x2={PX + k * 80} y2={headY - 150 * PS + lift} />
            ))}
          </g>
        )}
      </g>
      {/* 壁の掲示板: 3人のうち1人だけ振り向く (カメラの外) */}
      <g transform={`translate(1560 330) scale(${0.6 + 0.4 * pop(board)})`} opacity={board > 0 ? 1 : 0}>
        <rect x={-260} y={-190} width={520} height={330} rx={10} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-240} y={-170} width={480} height={290} fill={C.cork} />
        <g transform="rotate(2)">
          <rect x={-200} y={-150} width={400} height={250} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {[-1, 0, 1].map((k) => {
            const turned = k === 1;
            return (
              <g key={k}>
                <PersonMini x={k * 120} y={70} s={1.05} f={f} phase={k} color={turned ? C.sweater : C.crowd} face={turned ? "dot" : "none"} />
                {!turned && <circle cx={k * 120} cy={70 - 160 * 1.05} r={34 * 1.05} fill={C.hair} stroke={KRP.ink} strokeWidth={5} />}
                {turned && <text x={k * 120 + 50} y={-80} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.red}>!</text>}
              </g>
            );
          })}
        </g>
        <circle cx={0} cy={-158} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <TagPlate x={1560} y={560} text="約3人に1人" size={50} t={seg(f, 32, 42)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #208 この結果は、その後の実験でも、何度も確かめられています。
// 格: 図 / seed 4208
// 絵: 3冊の研究ノート (年代の札「1959年」「1995年」「2021年」) が並び、どれにも同じ「3人に1人」のグラフ (人形3つのうち1つが振り向く図)。f で3冊が順に開く。研究室の机の上
// どこ: 研究室の机の上 (真上から見た木の天板・コーヒーカップ・鉛筆・眼鏡・クリップ)
// 演出: 3冊の研究ノートが年代順に並び、1冊ずつ表紙が開く。開いた右ページには、どれも同じ「3人のうち1人だけ振り向く」図。左ページは丸い円グラフ (3分の1)
// 動き: f4〜14 / 14〜24 / 24〜34 で3冊が順に開く (表紙がめくれる) / 開いた瞬間に振り向く1人に小さな光 / カメラはゆっくり右へパン
const NI1bNote: React.FC<{ x: number; y: number; f: number; t: number; cover: string; seed: number }> = ({ x, y, f, t, cover, seed }) => {
  const PW = 250, PH = 350;
  const sx = Math.cos(Math.PI * easeInOut(t));
  const open = t > 0.5;
  const turn = seg(t, 0.75, 1);
  const glow = t >= 1 ? 0.5 + Math.sin(f / 5 + seed) * 0.2 : turn * 0.6;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 影 */}
      <rect x={-PW + 14} y={-PH / 2 + 16} width={PW * 2} height={PH} rx={8} fill={KRP.ink} opacity={0.22 * clamp01(t * 2)} />
      <rect x={14} y={-PH / 2 + 16} width={PW} height={PH} rx={8} fill={KRP.ink} opacity={0.22} />
      {/* 右ページ (図) */}
      <rect x={0} y={-PH / 2} width={PW} height={PH} rx={6} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={C.glassDark} strokeWidth={2} opacity={0.6}>
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={14} y1={-PH / 2 + 30 + i * 30} x2={PW - 14} y2={-PH / 2 + 30 + i * 30} />)}
      </g>
      {open && (
        <g>
          {[0, 1, 2].map((k) => {
            const me = k === 2;
            const px = 50 + k * 75;
            return (
              <g key={k}>
                {me && <circle cx={px} cy={-10} r={48} fill={NP.glow} opacity={glow} />}
                <PersonMini x={px} y={60} s={0.5} f={f} phase={k + seed} color={me ? C.sweater : C.crowd} face={me ? "dot" : "none"} />
                {!me && <circle cx={px} cy={60 - 80} r={17} fill={C.hair} stroke={KRP.ink} strokeWidth={4} />}
              </g>
            );
          })}
          <line x1={20} y1={64} x2={PW - 20} y2={64} stroke={KRP.ink} strokeWidth={4} />
          <text x={PW / 2} y={130} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.red}>1/3</text>
        </g>
      )}
      {/* 表紙 (めくれて左ページになる) */}
      <g transform={`scale(${sx} 1)`}>
        {!open ? (
          <g>
            <rect x={0} y={-PH / 2} width={PW} height={PH} rx={8} fill={cover} stroke={KRP.ink} strokeWidth={6} />
            <rect x={40} y={-PH / 2 + 60} width={PW - 80} height={70} rx={6} fill={C.paperOld} stroke={KRP.ink} strokeWidth={4} />
            <rect x={0} y={-PH / 2} width={22} height={PH} fill={KRP.ink} opacity={0.25} />
          </g>
        ) : (
          <g>
            <rect x={0} y={-PH / 2} width={PW} height={PH} rx={6} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
            {/* 左ページ (裏返しで描かれるので、中身は反転を戻す) */}
            <g transform={`translate(${PW / 2} 0) scale(-1 1)`}>
              <g stroke={KRP.ink} strokeWidth={3} opacity={0.45}>
                {[0, 1, 2, 3].map((i) => <line key={i} x1={-90} y1={-130 + i * 26} x2={60 - (i % 2) * 40} y2={-130 + i * 26} />)}
              </g>
              <circle cx={0} cy={60} r={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M 0 60 L 0 -10 A 70 70 0 0 1 ${70 * Math.sin((2 * Math.PI) / 3)} ${60 - 70 * Math.cos((2 * Math.PI) / 3)} Z`}
                fill={KRP.red} stroke={KRP.ink} strokeWidth={4} opacity={turn} />
            </g>
          </g>
        )}
      </g>
      {/* 背のとじ糸 */}
      <line x1={0} y1={-PH / 2} x2={0} y2={PH / 2} stroke={KRP.ink} strokeWidth={6} />
    </g>
  );
};
const Nm208: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  const notes: [number, string, string, number, number][] = [
    [360, "1959年", C.bookRed, 4, 14],
    [960, "1995年", C.bookGreen, 14, 24],
    [1560, "2021年", C.bookBlue, 24, 34],
  ];
  return (
    <Frame f={f} seed={4208} bg={C.wood}>
      <g transform={`translate(${pan} 0)`}>
        {/* 机の天板 (真上から・木目) */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.wood} />
        <g stroke={C.woodDark} strokeWidth={5} opacity={0.5} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -80 ${40 + i * 150} q 500 ${rnd(4208, i) * 40 - 20} 1000 0 q 500 ${rnd(4209, i) * 40 - 20} 1100 0`} />
          ))}
        </g>
        {/* 机の上の小物: コーヒーカップ (湯気)・眼鏡・鉛筆・クリップ */}
        <g transform="translate(140 900)">
          <circle r={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle r={52} fill={C.woodDark} />
          <path d="M 66 -14 q 40 0 40 20 q 0 20 -40 20" fill="none" stroke={KRP.ink} strokeWidth={8} />
          <path d={`M -14 -80 q ${-14 + Math.sin(f / 7) * 6} -30 0 -60`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.6} />
        </g>
        <g transform="translate(1720 900) rotate(-12)" fill="none" stroke={KRP.ink} strokeWidth={6}>
          <circle cx={-46} cy={0} r={36} /><circle cx={46} cy={0} r={36} /><path d="M -10 -4 q 10 -10 20 0" />
          <path d="M -82 -6 L -150 -30" /><path d="M 82 -6 L 150 -30" />
        </g>
        <g transform="translate(860 930) rotate(8)">
          <rect x={-180} y={-10} width={340} height={20} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 160 -10 L 200 0 L 160 10 Z" fill={C.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-200} y={-10} width={24} height={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {[[1260, 880], [1310, 905]].map(([cx, cy], i) => (
          <path key={i} d={`M ${cx} ${cy} l 50 0 q 10 0 10 10 q 0 10 -10 10 l -46 0 q -6 0 -6 -6 q 0 -6 6 -6 l 36 0`}
            fill="none" stroke={C.metalDark} strokeWidth={4} />
        ))}
        {/* 3冊のノートと年代の札 */}
        {notes.map(([x, year, col, a, b], i) => (
          <g key={i}>
            <NI1bNote x={x} y={540} f={f} t={seg(f, a, b)} cover={col} seed={i} />
            <TagPlate x={x} y={290} text={year} size={46} t={seg(f, a - 3, a + 5)} rot={i % 2 ? 2 : -2} />
          </g>
        ))}
        {/* ノートをつなぐ「同じ」の矢印 */}
        {[0, 1].map((i) => (
          <Arrow key={i} x={700 + i * 600} y={540} s={0.6} rot={0} t={seg(f, 16 + i * 10, 24 + i * 10)} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #209 脳波を測ると、自分の名前を聞いたときは、他人の名前より大きな反応が出ます。
// 格: 山 / seed 4209
// 絵: 脳波の計測 (頭に電極のキャップをかぶった人・横のモニターに波形)。他人の名前の札が流れると小さな波、自分の名前の札が流れると**大きな山の波** (f)。研究者が指さす
// どこ: 脳波の計測室 (青灰色の防音壁・天井のスピーカー・大きな波形モニター・増幅器の機械)
// 演出: 電極キャップをかぶった人 (胸に「山田」の名札)。スピーカーから名前の札が1枚ずつ耳へ届く。他人の名前 (鈴木・佐藤) では小さな波、自分の名前 (山田) で大きな山の波。白衣の研究者が指し棒で山を指す
// 動き: 札が f2〜10 / 12〜20 / 24〜32 に順に耳へ飛ぶ / モニターの掃引線が左から右へ進み、届いた瞬間に波が立つ / f32〜 研究者が指し棒を向ける / カメラはモニターへ寄る
const Nm209: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const PX = 540, PY = 900, PS = 1.4;
  const headY = PY - 228 * PS;
  const ear: [number, number] = [PX + 64 * PS, headY + 6];
  const SPK: [number, number] = [880, 120];
  const cards: [string, number, number, boolean][] = [["鈴木", 2, 10, false], ["佐藤", 12, 20, false], ["山田", 24, 32, true]];
  // モニター
  const MX0 = 900, MX1 = 1600, MY0 = 170, MY1 = 600;
  const sweep = seg(f, 0, 38);
  const bumps: [number, number][] = [[10 / 38, 26], [20 / 38, 32], [32 / 38, 200]];
  const base = (MY0 + MY1) / 2 + 90;
  const yAt = (xn: number) => {
    let y = Math.sin(xn * 90) * 6 + Math.sin(xn * 37 + 1) * 5;
    for (const [c, a] of bumps) {
      const d = (xn - c) / 0.035;
      y -= a * Math.exp(-d * d) - a * 0.35 * Math.exp(-((d - 1.6) * (d - 1.6)));
    }
    return base + y;
  };
  const N = 140;
  const wave = Array.from({ length: N + 1 }, (_, i) => {
    const xn = (i / N) * sweep;
    return `${i ? "L" : "M"} ${(MX0 + 30 + xn * (MX1 - MX0 - 60)).toFixed(1)} ${yAt(xn).toFixed(1)}`;
  }).join(" ");
  const peakX = MX0 + 30 + (32 / 38) * (MX1 - MX0 - 60);
  const point = easeOut(seg(f, 32, 40));
  const own = seg(f, 30, 36);
  // 研究者
  const RX = 1760, RY = 900, RS = 1.3;
  const rh: [number, number] = [RX - 153 * RS, RY - 148 * RS];
  const tip: [number, number] = [lerp(rh[0] - 40, peakX + 30, point), lerp(rh[1] + 40, base - 200 + 10, point)];
  return (
    <Frame f={f} seed={4209} bg={C.eegWall}>
      <g transform={`translate(1250 420) scale(${cam}) translate(-1250 -420)`}>
        {/* 防音壁 (四角い吸音パネル) */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.eegWall} />
        {Array.from({ length: 7 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-40 + c * 170} y={-40 + r * 150} width={156} height={136} rx={10} fill={C.eegPanel} opacity={0.7} />
        )))}
        {/* 床 */}
        <rect x={-80} y={860} width={W + 160} height={300} fill={C.eegFloor} />
        {/* 天井のスピーカー */}
        <g transform={`translate(${SPK[0]} ${SPK[1]})`}>
          <rect x={-70} y={-110} width={140} height={100} rx={10} fill={C.metalDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-60} r={34} fill={C.screen} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-60} r={12 + Math.sin(f / 2) * 2} fill={C.metal} />
        </g>
        {/* モニター (台の上) */}
        <rect x={MX0 - 20} y={MY0 - 20} width={MX1 - MX0 + 40} height={MY1 - MY0 + 40} rx={22} fill={C.metalDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={MX0} y={MY0} width={MX1 - MX0} height={MY1 - MY0} rx={10} fill={C.screen} />
        <g stroke={C.screenLine} strokeWidth={2} opacity={0.15}>
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={MX0 + 30 + i * 58} y1={MY0 + 10} x2={MX0 + 30 + i * 58} y2={MY1 - 10} />)}
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={MX0 + 10} y1={MY0 + 30 + i * 60} x2={MX1 - 10} y2={MY0 + 30 + i * 60} />)}
        </g>
        {own > 0 && <ellipse cx={peakX} cy={base - 110} rx={70} ry={150} fill={NP.glow} opacity={0.22 * own} />}
        <path d={wave} stroke={C.screenLine} strokeWidth={6} fill="none" strokeLinejoin="round" />
        <line x1={MX0 + 30 + sweep * (MX1 - MX0 - 60)} y1={MY0 + 10} x2={MX0 + 30 + sweep * (MX1 - MX0 - 60)} y2={MY1 - 10}
          stroke={C.screenLine} strokeWidth={3} opacity={0.5} />
        <rect x={MX0 + 300} y={MY1 + 20} width={100} height={200} fill={C.metal} stroke={KRP.ink} strokeWidth={5} />
        <rect x={MX0 + 180} y={MY1 + 210} width={340} height={40} rx={8} fill={C.metalDark} stroke={KRP.ink} strokeWidth={5} />
        {/* モニター下の目印 (どの名前のときの波か) */}
        {cards.map(([name, , b, me], i) => {
          const bx = MX0 + 30 + bumps[i][0] * (MX1 - MX0 - 60);
          return (
            <g key={i} opacity={seg(f, b, b + 4)}>
              <rect x={bx - 52} y={MY1 - 64} width={104} height={44} rx={8} fill={me ? NP.glowCore : KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <text x={bx} y={MY1 - 30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={NP.sumi}>{name}</text>
            </g>
          );
        })}
        {/* 研究者 (白衣・眼鏡) と指し棒 */}
        <Person x={RX} y={RY} s={RS} f={f} phase={2} cloth={C.coat} clothDark={C.coatDark} glasses pose="point" pointDir={-1}
          face={point > 0.5 ? "surprised" : "normal"} gaze={[-6, -2]} />
        <line x1={rh[0]} y1={rh[1]} x2={tip[0]} y2={tip[1]} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={rh[0]} y1={rh[1]} x2={tip[0]} y2={tip[1]} stroke={C.woodLight} strokeWidth={5} strokeLinecap="round" />
        <circle cx={tip[0]} cy={tip[1]} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        {/* 被験者の椅子の背 */}
        <rect x={PX - 120} y={headY + 60} width={240} height={360} rx={30} fill={C.bookBlue} stroke={KRP.ink} strokeWidth={6} />
        {/* 被験者 */}
        <Person x={PX} y={PY} s={PS} f={f} cloth={C.narr} clothDark={C.narrDark}
          face={own > 0.5 ? "surprised" : "normal"} gaze={[4, -3]} />
        {/* 胸の名札 */}
        <rect x={PX + 14} y={PY - 150 * PS} width={78} height={42} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <text x={PX + 53} y={PY - 150 * PS + 31} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={NP.sumi}>山田</text>
        {/* 電極キャップ */}
        <path d={`M ${PX - 68 * PS} ${headY - 10} Q ${PX - 70 * PS} ${headY - 98 * PS} ${PX} ${headY - 100 * PS} Q ${PX + 70 * PS} ${headY - 98 * PS} ${PX + 68 * PS} ${headY - 10} Q ${PX} ${headY - 40 * PS} ${PX - 68 * PS} ${headY - 10} Z`}
          fill={C.capCloth} stroke={KRP.ink} strokeWidth={5} />
        {[[-50, -40], [-25, -72], [0, -82], [25, -72], [50, -40], [-12, -52], [12, -52], [-58, -14], [58, -14]].map(([ex, ey], i) => (
          <g key={i}>
            <circle cx={PX + ex * PS} cy={headY + ey * PS} r={9} fill={i % 3 ? KRP.white : KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
            <path d={`M ${PX + ex * PS} ${headY + ey * PS} Q ${PX - 130 - i * 6} ${headY - 40 + i * 8} ${PX - 210 + i * 4} 780`}
              stroke={i % 2 ? C.bookRed : C.bookBlue} strokeWidth={3} fill="none" opacity={0.85} />
          </g>
        ))}
        {/* 光る耳 (自分の名前で) */}
        {own > 0 && <circle cx={ear[0]} cy={ear[1]} r={30 + own * 30} fill={NP.glow} opacity={0.45 * (1 - own * 0.4)} />}
        {/* 飛んでくる名前の札 */}
        {cards.map(([name, a, b, me], i) => {
          const u = seg(f, a, b);
          if (u <= 0 || u >= 1) return null;
          const e = easeInOut(u);
          const cx = lerp(SPK[0], ear[0] + 40, e);
          const cy = lerp(SPK[1] + 20, ear[1] - 20, e) - Math.sin(e * Math.PI) * 60;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) rotate(${(1 - e) * 10 - 5}) scale(${1 - e * 0.45})`}>
              {me && <rect x={-100} y={-50} width={200} height={100} rx={18} fill={NP.glow} opacity={0.5} />}
              <rect x={-80} y={-36} width={160} height={72} rx={12} fill={me ? NP.glowCore : KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={NP.sumi}>{name}</text>
            </g>
          );
        })}
        {/* 増幅器 (手前の機械) */}
        <rect x={160} y={780} width={700} height={360} rx={14} fill={C.metal} stroke={KRP.ink} strokeWidth={7} />
        <rect x={190} y={806} width={640} height={60} rx={8} fill={C.screen} />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={225 + i * 70} cy={836} r={10} fill={(f + i * 3) % 12 < 6 ? C.screenLine : C.metalDark} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${260 + i * 160} 940) rotate(${i * 50 + Math.sin(f / 15 + i) * 5})`}>
            <circle r={30} fill={C.coat} stroke={KRP.ink} strokeWidth={5} />
            <line x1={0} y1={0} x2={0} y2={-24} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #210 生まれて4か月半の赤ちゃんも、自分の名前の音を、ほかの名前より長く聞きたがります。
// 格: 山 / seed 4210
// 絵: 赤ちゃん用の実験室 (やわらかいマット・左右のスピーカー・明るいライト)。母親のひざの上の赤ちゃん (母は後ろ姿)。左右のスピーカーから名前の音符が流れ、自分の名前のほうのスピーカーを赤ちゃんがじーっと見つめる (f でそちらへ顔が向く)。札「4か月半」
// どこ: 赤ちゃん用の実験室 (やわらかい色の壁・パズルのような床マット・天井の明るいライト・左右のスピーカー台)
// 演出: 真ん中に丸椅子に座る母親の後ろ姿。そのひざの上 (母の左側から顔を出す) の赤ちゃんが、左右のスピーカーのうち「自分の名前」が流れる左のほうへ顔を向け、じーっと見つめる。スピーカーの上の「聞いている長さ」の棒は左だけ長くのびる
// 動き: 左右から名前の音符が流れる / f10〜26 赤ちゃんの顔が左へ向く / f24〜 見つめる点線 / 聞いている長さの棒が左だけ伸び続ける / カメラは赤ちゃんへ寄る
const Nm210: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const MX = 880, MY = 900, MS = 1.45; // 母
  const BX = 690, BY = 818, BS = 0.74; // 赤ちゃん
  const look = easeInOut(seg(f, 10, 26));
  const bHead: [number, number] = [BX - 6 * look, BY - 228 * BS];
  const LSP: [number, number] = [300, 430];
  const RSP: [number, number] = [1620, 430];
  const stare = seg(f, 24, 32);
  const barL = 60 + 260 * seg(f, 8, 42);
  const barR = 60 + 50 * seg(f, 8, 20);
  const note = (sx: number, sy: number, dir: number, i: number, gold: boolean) => {
    const u = ((f + i * 9) % 36) / 36;
    const nx = sx + dir * (80 + u * 340);
    const ny = sy - 30 + Math.sin(u * Math.PI * 2 + i) * 24 - u * 40;
    return (
      <g key={`${dir}-${i}`} transform={`translate(${nx} ${ny}) scale(${0.9 + 0.2 * Math.sin(u * Math.PI)})`} opacity={Math.sin(u * Math.PI)}>
        <ellipse cx={0} cy={0} rx={18} ry={13} fill={gold ? NP.brass : KRP.grayDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(-20)" />
        <line x1={15} y1={-4} x2={15} y2={-56} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 15 -56 q 22 8 20 30" stroke={KRP.ink} strokeWidth={5} fill="none" />
      </g>
    );
  };
  const speaker = (x: number, y: number, own: boolean, bar: number, label: string) => (
    <g>
      {/* スタンド */}
      <rect x={x - 12} y={y + 100} width={24} height={330} fill={C.metal} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={x} cy={y + 432} rx={80} ry={16} fill={C.metalDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 箱 */}
      <rect x={x - 100} y={y - 110} width={200} height={220} rx={20} fill={own ? C.woodLight : C.wood} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={x} cy={y - 40} r={30} fill={C.screen} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={x} cy={y + 40} r={44 + (own ? Math.sin(f / 2) * 3 : Math.sin(f / 2.5) * 2)} fill={C.screen} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={x} cy={y + 40} r={14} fill={C.metal} />
      {/* 上のランプ (左だけ灯る) */}
      <circle cx={x} cy={y - 150} r={60} fill={NP.glow} opacity={own ? 0.35 + 0.1 * Math.sin(f / 6) : 0} />
      <circle cx={x} cy={y - 150} r={28} fill={own ? NP.glowCore : C.coatDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 名前の札 */}
      <rect x={x - 70} y={y - 270} width={140} height={60} rx={10} fill={own ? NP.glowCore : KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <text x={x} y={y - 228} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={NP.sumi}>{label}</text>
      {/* 聞いている長さの棒 (ストップウォッチ付き) */}
      <g transform={`translate(${x - 160} ${y + 170})`}>
        <circle cx={0} cy={0} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={-15} stroke={KRP.red} strokeWidth={4} transform={`rotate(${f * (own ? 12 : 3)})`} />
        <rect x={-6} y={-32} width={12} height={10} fill={KRP.ink} />
        <rect x={34} y={-14} width={340} height={28} rx={14} fill={C.babyWallDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={34} y={-14} width={bar} height={28} rx={14} fill={own ? KRP.orange : KRP.gray} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={4210} bg={C.babyWall}>
      <g transform={`translate(${BX} 600) scale(${cam}) translate(${-BX} -600)`}>
        {/* 壁 (やわらかい色・腰の高さまでクッション) */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.babyWall} />
        <rect x={-80} y={560} width={W + 160} height={240} fill={C.babyWallDark} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.25}>
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={-40 + i * 160} y1={560} x2={-40 + i * 160} y2={800} />)}
        </g>
        {/* 天井の明るいライト */}
        <circle cx={960} cy={-20} r={260} fill={NP.glowCore} opacity={0.45} />
        <rect x={800} y={-40} width={320} height={60} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 床のパズルマット */}
        <rect x={-80} y={790} width={W + 160} height={400} fill={C.matA} />
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 11 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-80 + c * 190} y={790 + r * 110} width={190} height={110}
            fill={[C.matA, C.matB, C.matC, C.matD][(r + c) % 4]} stroke={KRP.ink} strokeWidth={3} opacity={0.95} />
        )))}
        {/* 床のぬいぐるみ (くま) */}
        <g transform="translate(1340 900)">
          <circle cx={0} cy={-50} r={50} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-36} cy={-90} r={18} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={36} cy={-90} r={18} fill={C.woodLight} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-16} cy={-56} r={5} fill={KRP.ink} /><circle cx={16} cy={-56} r={5} fill={KRP.ink} />
          <ellipse cx={0} cy={-38} rx={12} ry={8} fill={C.wood} />
        </g>
        {/* スピーカー (左=自分の名前 / 右=ほかの名前) */}
        {speaker(LSP[0], LSP[1], true, barL, "はな")}
        {speaker(RSP[0], RSP[1], false, barR, "ゆき")}
        {[0, 1, 2, 3].map((i) => note(LSP[0], LSP[1], 1, i, true))}
        {[0, 1, 2, 3].map((i) => note(RSP[0], RSP[1], -1, i, false))}
        {/* 赤ちゃん (母のひざの上・左へ顔を向ける) */}
        <g transform={`rotate(${-8 * look} ${BX} ${BY})`}>
          <Person x={BX} y={BY} s={BS} f={f} cloth={C.baby} clothDark={C.babyDark} hair="none"
            face={look > 0.6 ? "surprised" : "normal"} gaze={[-8 * look, -2 * look]} still />
          <path d={`M ${BX - 8} ${BY - 292 * BS + 2} q 8 -18 18 -4`} stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          <circle cx={BX - 30} cy={BY - 205 * BS} r={8} fill={KRP.red} opacity={0.3} />
          <circle cx={BX + 30} cy={BY - 205 * BS} r={8} fill={KRP.red} opacity={0.3} />
        </g>
        {/* じーっと見つめる点線 */}
        {stare > 0 && (
          <path d={`M ${bHead[0] - 40} ${bHead[1] + 4} L ${lerp(bHead[0] - 40, LSP[0] + 110, stare)} ${lerp(bHead[1] + 4, LSP[1], stare)}`}
            stroke={KRP.orange} strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" fill="none" strokeDashoffset={-f * 2} />
        )}
        {/* 母 (後ろ姿・丸椅子) */}
        <Person x={MX} y={MY} s={MS} f={f} cloth={C.mom} clothDark={C.momDark} still />
        <NI1bBackHead x={MX} y={MY} s={MS} hair={C.momHair} collar={C.momDark} />
        {/* 母の後ろ髪 (まとめ髪) */}
        <circle cx={MX} cy={MY - 200 * MS} r={30} fill={C.momHair} stroke={KRP.ink} strokeWidth={5} />
        {/* 赤ちゃんを支える母の左腕 (後ろから見て左) */}
        <rect x={MX - 78 * MS} y={MY - 148 * MS} width={22 * MS} height={78 * MS} rx={11 * MS} fill={C.mom} stroke={KRP.ink} strokeWidth={5}
          transform={`rotate(38 ${MX - 67 * MS} ${MY - 148 * MS})`} />
        {/* 丸椅子 */}
        <ellipse cx={MX} cy={MY - 70} rx={150} ry={36} fill={C.bookRed} stroke={KRP.ink} strokeWidth={6} />
        <rect x={MX - 150} y={MY - 70} width={300} height={40} fill={C.bookRed} stroke={KRP.ink} strokeWidth={6} />
        {[-110, 110].map((lx) => <rect key={lx} x={MX + lx - 10} y={MY - 30} width={20} height={130} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />)}
      </g>
      <TagPlate x={960} y={200} text="4か月半" size={52} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #211 名前は、たしかに、脳の中で特別あつかいされているのです。
// 格: 並 / seed 4211
// 絵: 脳の模型の中に、名札の形の光の席が1つあり、そこだけ明るく灯る (f)。※「名前専用の場所がある」に見えすぎないよう、光は脳の広い範囲にぼんやり広がる
// どこ: 夜の博物館の展示室 (暗い壁・ガラスの丸い覆い・ビロードの台座・真鍮の説明板)
// 演出: 大きな脳の模型の中に、名札の形の小さな光の席。そこが灯ると、光は波紋になって脳の広い範囲へぼんやり広がる (名前専用の部屋ではなく、あちこちが一緒に明るくなる)
// 動き: f6〜18 名札の形の席が灯る / f14〜40 波紋が3重に広がり脳全体がほんのり明るく / 光の粒が漂う / カメラはゆっくり寄る
const NI1B_OUTLINE =
  "M -250 10 Q -270 -90 -200 -150 Q -150 -200 -70 -205 Q 0 -225 80 -200 Q 170 -185 220 -120 Q 270 -60 262 10 " +
  "Q 258 60 220 85 Q 170 100 120 90 Q 60 110 0 100 Q -70 120 -140 100 Q -210 90 -240 50 Z";
const Nm211: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const BX = 960, BY = 430, BS = 1.5;
  const seat = easeOut(seg(f, 6, 18));
  const spread = easeOut(seg(f, 14, 40));
  const SX = -30, SY = -40; // 席の位置 (脳の模型の座標)
  return (
    <Frame f={f} seed={4211} bg={C.night} dark>
      <g transform={`translate(960 480) scale(${cam}) translate(-960 -480)`}>
        {/* 暗い展示室の壁 (縦の板) と床 */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.night} />
        <g stroke={C.nightLine} strokeWidth={4}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-40 + i * 150} y1={-80} x2={-40 + i * 150} y2={860} />)}
        </g>
        <rect x={-80} y={860} width={W + 160} height={300} fill={C.nightFloor} />
        {/* 天井からの光の筋 */}
        <path d="M 860 -80 L 1060 -80 L 1400 900 L 520 900 Z" fill={NP.glowCore} opacity={0.08} />
        {/* 台座 (木の柱 + ビロード) */}
        <rect x={640} y={760} width={640} height={400} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={610} y={740} width={700} height={40} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 640 740 Q 640 690 720 680 L 1200 680 Q 1280 690 1280 740 Z" fill={C.bookRed} stroke={KRP.ink} strokeWidth={6} />
        {/* 真鍮の説明板 (字は描かない) */}
        <g transform="translate(960 850)">
          <rect x={-130} y={-34} width={260} height={68} rx={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1].map((i) => <line key={i} x1={-100} y1={-10 + i * 20} x2={100 - i * 40} y2={-10 + i * 20} stroke={NP.brassDark} strokeWidth={5} />)}
        </g>
        {/* 脳の模型 */}
        <NI1bBrain x={BX} y={BY} s={BS} f={f} stand={false} alpha={0.9} />
        {/* 光: 脳の形の中だけで広がる */}
        <defs>
          <clipPath id="ni1b-brain211"><path d={NI1B_OUTLINE} transform={`translate(${BX} ${BY}) scale(${BS})`} /></clipPath>
          <radialGradient id="ni1b-glow211">
            <stop offset="0%" stopColor={NP.glowCore} stopOpacity={1} />
            <stop offset="55%" stopColor={NP.glow} stopOpacity={0.55} />
            <stop offset="100%" stopColor={NP.glow} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g clipPath="url(#ni1b-brain211)">
          {/* 広い範囲のぼんやりした明るさ (おでこ側・頭頂・後ろ・横へ) */}
          {([[-150, -90, 230], [60, -150, 220], [170, -40, 200], [-60, 40, 210], [20, -60, 300]] as const).map(([gx, gy, r], i) => (
            <circle key={i} cx={BX + gx * BS} cy={BY + gy * BS} r={r * BS * (0.5 + 0.5 * spread)}
              fill="url(#ni1b-glow211)" opacity={spread * (0.45 + 0.1 * Math.sin(f / 7 + i))} />
          ))}
          {/* 席から広がる波紋 */}
          {[0, 1, 2].map((k) => {
            const u = clamp01(spread * 1.4 - k * 0.25);
            return u > 0 ? (
              <circle key={k} cx={BX + SX * BS} cy={BY + SY * BS} r={40 + u * 420} fill="none" stroke={NP.glow} strokeWidth={10}
                opacity={(1 - u) * 0.8} />
            ) : null;
          })}
          {/* 光の粒 */}
          {Array.from({ length: 16 }, (_, i) => {
            const a = rnd(4211, i) * Math.PI * 2;
            const d = (60 + rnd(4212, i) * 330) * spread;
            return <circle key={i} cx={BX + SX * BS + Math.cos(a) * d + Math.sin(f / 9 + i) * 6} cy={BY + SY * BS + Math.sin(a) * d * 0.6}
              r={5 + rnd(4213, i) * 5} fill={NP.glowCore} opacity={spread * 0.85} />;
          })}
        </g>
        {/* 名札の形の光の席 */}
        <g transform={`translate(${BX + SX * BS} ${BY + SY * BS}) scale(${0.7 + 0.3 * pop(seat)})`} opacity={0.35 + 0.65 * seat}>
          <rect x={-90} y={-50} width={180} height={100} rx={20} fill={NP.glow} opacity={0.5 * seat} transform="scale(1.35)" />
          <rect x={-80} y={-42} width={160} height={84} rx={16} fill={seat > 0.3 ? NP.glowCore : C.pinkDark}
            stroke={NP.brassDark} strokeWidth={6} />
          {[[-80, 4], [80, 4], [0, 42]].map(([kx, ky], i) => (
            <circle key={i} cx={kx} cy={ky} r={11} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={-46} y={-8} width={92} height={14} rx={7} fill={NP.brass} opacity={0.6 * seat} />
        </g>
        {/* ガラスの丸い覆い */}
        <path d="M 520 740 L 520 260 Q 520 0 960 0 Q 1400 0 1400 260 L 1400 740" fill={KRP.blueSoft} opacity={0.08} />
        <path d="M 520 740 L 520 260 Q 520 0 960 0 Q 1400 0 1400 260 L 1400 740" fill="none" stroke={C.glass} strokeWidth={7} opacity={0.75} />
        <path d="M 580 640 L 580 280 Q 590 90 760 50" fill="none" stroke={KRP.white} strokeWidth={14} opacity={0.3} strokeLinecap="round" />
        <rect x={500} y={728} width={920} height={20} rx={8} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_203: (f) => <Nm203 f={f} />,
  nm_204: (f) => <Nm204 f={f} />,
  nm_205: (f) => <Nm205 f={f} />,
  nm_206: (f) => <Nm206 f={f} />,
  nm_207: (f) => <Nm207 f={f} />,
  nm_208: (f) => <Nm208 f={f} />,
  nm_209: (f) => <Nm209 f={f} />,
  nm_210: (f) => <Nm210 f={f} />,
  nm_211: (f) => <Nm211 f={f} />,
};

export const NM_I1B_MOTIFS: string[] = [
  "nm_203", // #203
  "nm_204", // #204
  "nm_205", // #205
  "nm_206", // #206
  "nm_207", // #207
  "nm_208", // #208
  "nm_209", // #209
  "nm_210", // #210
  "nm_211", // #211
];

export const namaeI1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
