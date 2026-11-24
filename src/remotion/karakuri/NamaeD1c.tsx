// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#94〜#100 (7文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで7枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  hairBlack: "#1F1B18",
  crown: "#24201D",
  // 奈良の都
  skyNara: "#EFE3C6",
  skyHaze: "#F6EDD6",
  hillFar: "#BCC6A8",
  hill: "#9DAF8A",
  hillDark: "#7E9470",
  plaster: "#EFE6D2",
  tile: "#5A5F66",
  tileDark: "#41454B",
  shu: "#C8553D",
  shuDark: "#9E3E2C",
  earth: "#D8C49A",
  earthDark: "#B9A274",
  river: "#86B0BE",
  riverDark: "#5F8C9C",
  riverLight: "#BFD9DF",
  plank: "#B98E5C",
  plankDark: "#8C6A3F",
  boat: "#9C7448",
  boatDark: "#6E4F30",
  kasa: "#D9B870",
  kasaDark: "#A8884A",
  kiyo: "#5E7D4E",
  kiyoDark: "#46603A",
  yakunin: "#8C3B2E",
  yakuninDark: "#6A2B21",
  shaku: "#E3CFA0",
  folk1: "#9C8A6A",
  folk1Dark: "#7A6A4E",
  folk2: "#6F7F5A",
  folk2Dark: "#56643F",
  folk3: "#A8735A",
  folk3Dark: "#865843",
  willow: "#8FAE6A",
  willowDark: "#6C8C4C",
  reed: "#A7B06E",
  // 春
  skySpring: "#DDE9EC",
  sakura: "#F2B8C6",
  sakuraDark: "#D98AA0",
  sakuraLight: "#FBE1E7",
  bark: "#6B4E3A",
  grass: "#A9C07C",
  // 地図
  parch: "#E8D6AE",
  parchDark: "#C9AE7C",
  land: "#D7BE88",
  landDark: "#A98B55",
  sea: "#C9D2B4",
  seaLine: "#9FAE8E",
  nile: "#5F8FB0",
  desk: "#8A5E3A",
  deskDark: "#6A452A",
  pin: "#D3402E",
  // エジプト
  sand: "#E3C48A",
  sandDark: "#C9A465",
  sandLight: "#F2DDAE",
  stone: "#DDBB7E",
  stoneDark: "#B89458",
  stoneJoint: "#A8844E",
  relief: "#E8CB90",
  reliefShadow: "#9E7B45",
  chiseled: "#CDAA70",
  chiseledDark: "#AE8A52",
  sun: "#FFE6A0",
  egBlue: "#5C86A8",
  egRed: "#B8553E",
  linen: "#F5F0E2",
  linenDark: "#D8CFB8",
  palmShadow: "#6B5032",
  // 研究者
  coatDark: "#D6D3CB",
  hatKhaki: "#C8B88A",
  hatKhakiDark: "#9C8C5E",
  metal: "#5E646B",
  // からくりの作業場
  wallWork: "#6B5A48",
  wallWorkLight: "#7E6B56",
  wallWorkDark: "#4F4234",
  benchTop: "#C9A06A",
  benchTopLight: "#DDB984",
  benchFront: "#9C7446",
  benchFrontDark: "#7A5734",
  lamp: "#FFE3A0",
  peg: "#B79A72",
  narrator: "#4A78B8",
  narratorDark: "#355C92",
  shadowHand: "#1E1A22",
  steel: "#C9CFD4",
} as const;
type PersonProps = React.ComponentProps<typeof Person>;
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

// 人 (Person を1つの <g> に包み、上下に自分の小物を足す)。under/over は Person と同じ座標 (s=1・足元が原点)
const ND1cGuy: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; lean?: number;
  cloth?: string; clothDark?: string; face?: PersonProps["face"]; pose?: PersonProps["pose"];
  gaze?: [number, number]; hair?: "cap" | "none"; glasses?: boolean; pointDir?: 1 | -1;
  back?: boolean; backHair?: string; under?: React.ReactNode; over?: React.ReactNode;
}> = ({ x, y, s = 1, f, phase = 0, lean = 0, cloth = "#3E4B66", clothDark, face = "normal", pose = "stand",
  gaze = [0, 0], hair = "cap", glasses = false, pointDir = 1, back = false, backHair = C.hairBlack, under, over }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {under}
      <Person x={0} y={0} s={1} f={f} phase={phase} still cloth={cloth} clothDark={clothDark ?? cloth}
        face={face} pose={pose} gaze={gaze} hair={hair} glasses={glasses} pointDir={pointDir} />
      {back && (
        <g>
          {/* 後頭部 (顔を描かない) */}
          <rect x={14} y={-142} width={34} height={28} fill={cloth} />
          <circle cx={0} cy={-228} r={67} fill={backHair} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -44 -268 Q 0 -292 44 -268" stroke="#FFFFFF" strokeWidth={5} opacity={0.18} fill="none" />
          <path d="M -40 -160 Q 0 -146 40 -160" stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.6} />
        </g>
      )}
      {over}
    </g>
  );
};

// 奈良の冠 (Person の座標)。back=true なら後ろに垂れる纓 (えい) を描く
const ND1cKanmuri: React.FC<{ back?: boolean; f: number }> = ({ back = false, f }) => {
  const sw = Math.sin(f / 10) * 4;
  return (
    <g>
      <rect x={-20} y={-340} width={40} height={50} rx={14} fill={C.crown} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -60 -246 Q -62 -302 0 -304 Q 62 -302 60 -246 Q 0 -262 -60 -246 Z" fill={C.crown} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -52 -258 Q 0 -270 52 -258" stroke="#4A4440" strokeWidth={4} fill="none" />
      {back && (
        <path d={`M -13 -300 L 13 -300 Q ${15 + sw} -210 ${13 + sw * 1.6} -128 L ${-13 + sw * 1.6} -128 Q ${-15 + sw} -210 -13 -300 Z`}
          fill={C.crown} stroke={KRP.ink} strokeWidth={3.5} />
      )}
    </g>
  );
};

// 笠 (船頭・旅人)
const ND1cKasa: React.FC = () => (
  <g>
    <path d="M -118 -258 Q 0 -360 118 -258 Q 0 -274 -118 -258 Z" fill={C.kasa} stroke={KRP.ink} strokeWidth={4.5} />
    {[-70, -35, 0, 35, 70].map((dx) => (
      <line key={dx} x1={0} y1={-330} x2={dx * 1.5} y2={-266} stroke={C.kasaDark} strokeWidth={3} />
    ))}
    <circle cx={0} cy={-330} r={7} fill={C.kasaDark} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 吹き出し (tx,ty はしっぽの先 = 口のあたり)
const ND1cBubble: React.FC<{ x: number; y: number; w: number; h: number; tx: number; ty: number; t: number; children?: React.ReactNode }> = ({ x, y, w, h, tx, ty, t, children }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <path d={`M ${-w * 0.16} ${h / 2 - 6} L ${tx - x} ${ty - y} L ${w * 0.08} ${h / 2 - 6} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-w * 0.16 + 4} y={h / 2 - 14} width={w * 0.24 - 8} height={12} fill={KRP.white} />
      {children}
    </g>
  );
};

// 女王の浮き彫り (エジプト美術の様式。横顔の輪郭だけで顔の細部は描かない)。原点 = 足元の中心、高さ約600
const ND1cQueen: React.FC<{ f: number }> = ({ f }) => {
  const sh = (d: string, fill: string, key?: string) => (
    <g key={key}>
      <path d={d} fill={C.reliefShadow} transform="translate(7 7)" />
      <path d={d} fill={fill} stroke={C.reliefShadow} strokeWidth={4} />
    </g>
  );
  void f;
  return (
    <g>
      {/* 脚 (歩み出す横向き) */}
      {sh("M -40 -200 L -22 -200 L -30 -12 L -70 -12 L -66 -24 L -48 -26 Z", C.relief, "l1")}
      {sh("M 10 -200 L 30 -200 L 62 -14 L 96 -12 L 98 0 L 44 0 Z", C.relief, "l2")}
      {/* 腰布 (シェンティ) */}
      {sh("M -58 -290 L 52 -290 L 70 -190 L -60 -196 Z", C.linen, "kilt")}
      <path d="M -6 -290 L 30 -196" stroke={C.reliefShadow} strokeWidth={3} />
      <rect x={-58} y={-300} width={110} height={16} fill={C.egRed} stroke={C.reliefShadow} strokeWidth={3} />
      {/* 胴 (肩は正面・逆三角) */}
      {sh("M -78 -470 L 74 -470 L 44 -300 L -50 -300 Z", C.relief, "body")}
      {/* 首飾り (幅広の襟) */}
      <path d="M -70 -468 Q 0 -404 70 -468 L 56 -470 Q 0 -428 -56 -470 Z" fill={C.egBlue} stroke={C.reliefShadow} strokeWidth={3} />
      <path d="M -60 -462 Q 0 -418 60 -462" stroke={C.egRed} strokeWidth={5} fill="none" />
      {/* 後ろの腕 (下げて アンク を持つ) */}
      {sh("M -78 -468 L -96 -320 L -78 -316 L -62 -460 Z", C.relief, "a1")}
      <g transform="translate(-88 -300)">
        <path d="M 0 -18 Q -16 -36 0 -50 Q 16 -36 0 -18 Z M -16 -16 L 16 -16 M 0 -16 L 0 30" fill="none" stroke={C.reliefShadow} strokeWidth={7} strokeLinecap="round" />
      </g>
      {/* 前の腕 (右=名前の枠のほうへ差し出す。手に供物の壺) */}
      {sh("M 60 -466 L 190 -410 L 184 -392 L 52 -436 Z", C.relief, "a2")}
      <g transform="translate(206 -420)">
        <path d="M -16 -6 Q -20 30 0 34 Q 20 30 16 -6 Z" fill={C.egRed} stroke={C.reliefShadow} strokeWidth={4} />
        <rect x={-12} y={-14} width={24} height={10} fill={C.relief} stroke={C.reliefShadow} strokeWidth={3} />
      </g>
      {/* 首と横顔 (輪郭だけ) */}
      {sh("M -6 -468 L 24 -468 L 26 -506 L -4 -506 Z", C.relief, "neck")}
      {sh("M -30 -500 Q -44 -560 0 -588 Q 40 -600 54 -566 L 60 -548 L 72 -536 L 60 -528 L 62 -512 Q 56 -496 30 -498 L 26 -490 L -8 -490 Z", C.relief, "head")}
      {/* 付けひげ (王のしるし) */}
      <rect x={36} y={-500} width={12} height={34} rx={4} fill={C.reliefShadow} />
      {/* 頭巾 (ネメス・縞) */}
      {sh("M -48 -560 Q -40 -610 10 -612 Q 44 -608 46 -574 L 30 -566 Q 0 -580 -20 -560 L -26 -470 L -66 -456 Z", C.egBlue, "nemes")}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${-40 + i * 3} ${-540 + i * 16} L ${-60 + i * 2} ${-470 + i * 2}`} stroke={C.sun} strokeWidth={5} opacity={0.75} />
      ))}
      {/* 額の蛇の飾り (ウラエウス) */}
      <path d="M 40 -584 Q 58 -600 52 -614" stroke={C.egRed} strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #94 その人を呼ぶ言葉そのものが、取り上げられたのです。
// 格: 山 / seed 4094
// 絵: 都の通り。人々が清麻呂の後ろ姿に呼びかけようとするが、口から出る吹き出しが**空白** (呼ぶ名前がない)。清麻呂は流罪の舟に乗せられていく (川の船着き場・船頭)。名札は役人の手の中
// どこ: 奈良の都のはずれ。左に築地塀と朱の門・土の通り、右は川の船着き場。769年の秋の夕方
// 演出: 通りの人々が舟の清麻呂 (後ろ姿) に呼びかけるが、吹き出しの中は名前の欄が空っぽ。
//       桟橋の役人が取り上げた名札を胸に抱えている
// 動き: 舟が岸を離れて右へ進む / 吹き出しが1つずつぽんと出る (中身は空) / カメラは左から右へゆっくり引く
const Nm094: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.08, 1.0, cam);
  const tx = lerp(70, 0, cam);
  const boatX = lerp(1330, 1480, easeOut(seg(f, 2, 42)));
  const bub = [seg(f, 10, 18), seg(f, 17, 25), seg(f, 24, 32)];
  const folks: { x: number; cloth: string; dark: string; face: PersonProps["face"]; pose: PersonProps["pose"]; lean: number }[] = [
    { x: 230, cloth: C.folk1, dark: C.folk1Dark, face: "worried", pose: "stand", lean: 4 },
    { x: 420, cloth: C.folk3, dark: C.folk3Dark, face: "surprised", pose: "raise", lean: 7 },
    { x: 610, cloth: C.folk2, dark: C.folk2Dark, face: "worried", pose: "point", lean: 8 },
  ];
  return (
    <Frame f={f} seed={4094} bg={C.skyNara}>
      <g transform={`translate(960 540) scale(${sc}) translate(${-960 + tx} -540)`}>
        {/* 空と夕日のかすみ */}
        <rect x={-200} y={-100} width={2320} height={760} fill={C.skyNara} />
        <circle cx={1500} cy={260} r={230} fill={C.skyHaze} opacity={0.8} />
        <circle cx={1500} cy={260} r={70} fill={KRP.orange} opacity={0.35} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${200 + i * 520 + Math.sin(f / 30 + i) * 20} ${150 + i * 40} q 90 -30 180 0 q 60 -20 120 0`} stroke={KRP.white} strokeWidth={8} fill="none" opacity={0.7} strokeLinecap="round" />
        ))}
        {/* 雁の列 (秋) */}
        {[0, 1, 2, 3].map((i) => {
          const gx = 1100 + i * 46 - f * 1.2, gy = 170 + Math.abs(i - 1.5) * 18;
          return <path key={i} d={`M ${gx - 14} ${gy} q 7 -8 14 0 q 7 -8 14 0`} stroke={KRP.ink} strokeWidth={3.5} fill="none" />;
        })}
        {/* 遠い山 (若草山のまるい山) */}
        <path d="M -200 470 Q 150 330 480 420 Q 760 290 1120 410 Q 1420 330 1720 400 Q 1950 350 2120 410 L 2120 620 L -200 620 Z" fill={C.hillFar} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -200 520 Q 300 420 700 500 Q 1100 440 1500 510 Q 1800 460 2120 500 L 2120 620 L -200 620 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={4} />
        {/* 川 */}
        <rect x={-200} y={585} width={2320} height={600} fill={C.river} />
        <path d="M 980 585 L 2120 585 L 2120 598 L 980 598 Z" fill={C.riverDark} opacity={0.5} />
        {/* 向こう岸の葦 */}
        {Array.from({ length: 26 }, (_, i) => {
          const rx = 1000 + i * 44 + rnd(41, i) * 20;
          const sw = Math.sin(f / 12 + i) * 4;
          return <path key={i} d={`M ${rx} 596 q ${sw} -24 ${sw * 2 + 4} -${40 + rnd(42, i) * 26}`} stroke={C.reed} strokeWidth={5} fill="none" strokeLinecap="round" />;
        })}
        {/* さざ波 */}
        {Array.from({ length: 16 }, (_, i) => {
          const wx = 900 + ((i * 167 + f * 2.2) % 1300);
          const wy = 640 + (i % 5) * 70 + rnd(43, i) * 20;
          return <path key={i} d={`M ${wx} ${wy} q 22 -10 44 0 q 22 10 44 0`} stroke={C.riverLight} strokeWidth={5} fill="none" strokeLinecap="round" />;
        })}
        {/* 築地塀 (瓦屋根の土塀) */}
        <rect x={-200} y={470} width={1150} height={80} fill={C.plaster} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-180 + i * 96} y={470} width={14} height={80} fill={C.earthDark} opacity={0.6} />
        ))}
        <path d="M -220 476 L 960 476 L 940 448 L -200 448 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={-190 + i * 38} y1={450} x2={-196 + i * 38} y2={474} stroke={C.tileDark} strokeWidth={3} />
        ))}
        {/* 朱の門 (二重の屋根) */}
        <g transform="translate(400 0)">
          <rect x={-150} y={380} width={300} height={172} fill={C.plaster} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-64} y={428} width={128} height={124} fill={C.wallWorkDark} stroke={KRP.ink} strokeWidth={4} />
          {[-140, -80, 64, 124].map((px) => (
            <rect key={px} x={px} y={380} width={18} height={172} fill={C.shu} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={-160} y={372} width={320} height={16} fill={C.shuDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -210 380 Q -150 356 -120 340 L 120 340 Q 150 356 210 380 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-110} y={286} width={220} height={56} fill={C.plaster} stroke={KRP.ink} strokeWidth={4} />
          {[-100, -36, 20, 84].map((px) => (
            <rect key={px} x={px} y={286} width={16} height={56} fill={C.shu} stroke={KRP.ink} strokeWidth={3} />
          ))}
          <path d="M -180 292 Q -120 262 -90 236 L 90 236 Q 120 262 180 292 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-96} y={226} width={192} height={12} fill={C.tileDark} stroke={KRP.ink} strokeWidth={3} />
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 90} 230 q ${sd * 14} -20 ${sd * 6} -30`} stroke={KRP.brass} strokeWidth={7} fill="none" strokeLinecap="round" />
          ))}
        </g>
        {/* 通り (土の道)。岸は斜めに川へ落ちる */}
        <path d="M -200 548 L 975 548 L 1000 590 Q 900 780 820 1180 L -200 1180 Z" fill={C.earth} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 990 592 Q 892 780 812 1180 L 840 1180 Q 920 790 1006 596 Z" fill={C.earthDark} opacity={0.7} />
        {/* 轍と小石 */}
        <path d="M -200 700 Q 300 660 860 640" stroke={C.earthDark} strokeWidth={6} fill="none" opacity={0.6} />
        <path d="M -200 760 Q 300 720 840 700" stroke={C.earthDark} strokeWidth={6} fill="none" opacity={0.6} />
        {Array.from({ length: 18 }, (_, i) => (
          <ellipse key={i} cx={-100 + rnd(44, i) * 900} cy={600 + rnd(45, i) * 300} rx={8 + rnd(46, i) * 8} ry={5} fill={C.earthDark} opacity={0.7} />
        ))}
        {/* 柳 (岸辺) */}
        <g>
          <path d="M 905 610 Q 890 500 920 380 L 946 382 Q 924 500 934 610 Z" fill={C.bark} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={930} cy={370} rx={120} ry={50} fill={C.willowDark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 11 }, (_, i) => {
            const bx = 830 + i * 20, sw = Math.sin(f / 11 + i * 0.7) * 10;
            return <path key={i} d={`M ${bx} 372 Q ${bx + sw * 0.5} 460 ${bx + sw} ${520 + (i % 3) * 30}`} stroke={i % 2 ? C.willow : C.willowDark} strokeWidth={6} fill="none" strokeLinecap="round" />;
          })}
        </g>
        {/* 桟橋 (板張り) */}
        <g>
          {[880, 980, 1080, 1180].map((px) => (
            <rect key={px} x={px} y={740} width={18} height={80} fill={C.plankDark} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <path d="M 850 700 L 1230 700 L 1250 742 L 830 742 Z" fill={C.plank} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line key={i} x1={880 + i * 42} y1={702} x2={868 + i * 44} y2={740} stroke={C.plankDark} strokeWidth={3} />
          ))}
          <rect x={830} y={742} width={420} height={16} fill={C.plankDark} stroke={KRP.ink} strokeWidth={4} />
          {/* もやい杭と縄 (ほどけた) */}
          <rect x={1214} y={672} width={22} height={48} rx={5} fill={C.plankDark} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 1225 690 Q 1250 ${720 + Math.sin(f / 9) * 4} 1272 760`} stroke={C.kasaDark} strokeWidth={6} fill="none" />
        </g>
        {/* 役人 (名札を胸に抱える) */}
        <ND1cGuy x={1010} y={742} s={0.84} f={f} phase={2} cloth={C.yakunin} clothDark={C.yakuninDark}
          face="normal" pose="hold" gaze={[5, 0]} over={<ND1cKanmuri f={f} />} />
        <Nafuda x={1010} y={640} s={0.36} text="和気 清麻呂" hang={false} f={f} />
        {/* 舟 (流罪の舟) */}
        <g transform={`translate(${boatX} ${818 + Math.sin(f / 8) * 3}) rotate(${Math.sin(f / 10) * 1.2})`}>
          <path d="M -280 -64 L 280 -64 L 300 -80 L 296 -60 Z" fill={C.boatDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 船頭 (竿で川底を突く) */}
          <line x1={-170} y1={-150} x2={-330} y2={60} stroke={C.plankDark} strokeWidth={11} strokeLinecap="round" />
          <line x1={-170} y1={-150} x2={-330} y2={60} stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
          <ND1cGuy x={-170} y={-50} s={0.78} f={f} phase={5} cloth={C.folk1} clothDark={C.folk1Dark} face="normal" pose="hold"
            gaze={[-4, 2]} over={<ND1cKasa />} lean={-6} />
          {/* 清麻呂 (後ろ姿・冠をはずされず、ただ遠ざかる) */}
          <ND1cGuy x={40} y={-48} s={0.82} f={f} phase={1} cloth={C.kiyo} clothDark={C.kiyoDark} back
            over={<ND1cKanmuri back f={f} />} />
          {/* 舟の胴 (手前) */}
          <path d="M -300 -70 L 270 -70 Q 320 -78 340 -128 L 322 -40 Q 300 4 230 6 L -240 6 Q -290 4 -308 -36 Z" fill={C.boat} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -296 -50 L 300 -50" stroke={C.boatDark} strokeWidth={5} />
          <path d="M -280 -22 L 296 -22" stroke={C.boatDark} strokeWidth={3} opacity={0.6} />
          {/* 引き波 */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-320 - i * 50 - (f % 20) * 2} ${12 + i * 10} q 30 -10 60 0`} stroke={C.riverLight} strokeWidth={5} fill="none" opacity={1 - i * 0.3} />
          ))}
        </g>
        {/* 通りの人々 (呼びかける) */}
        {folks.map((p, i) => (
          <ND1cGuy key={i} x={p.x} y={800} s={0.88} f={f} phase={i * 3 + 7} cloth={p.cloth} clothDark={p.dark}
            face={p.face} pose={p.pose} gaze={[6, -1]} lean={p.lean} pointDir={1} />
        ))}
        {/* 吹き出し: 呼ぶ名前の欄が空っぽ */}
        {folks.map((p, i) => (
          <ND1cBubble key={i} x={p.x + 80} y={420 - (i % 2) * 30} w={200} h={110} tx={p.x + 30} ty={538} t={bub[i]}>
            <rect x={-62} y={-24} width={124} height={48} rx={8} fill="none" stroke={KRP.gray} strokeWidth={4} strokeDasharray="10 8" />
          </ND1cBubble>
        ))}
      </g>
      <TagPlate x={640} y={110} text="奈良の都" size={38} t={seg(f, 0, 8)} />
      <TagPlate x={1730} y={108} text="769年" size={38} t={seg(f, 4, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #95 清麻呂は、のちに名誉を回復し、もとの名前に戻ります。
// 格: 山 / seed 4095
// 絵: 時が流れて、船着き場に舟が戻ってくる。清麻呂の後ろ姿が岸に上がると、役人が `Nafuda "和気 清麻呂"` を両手で返す (f で札が光る)。桜の花びら。札「のちに」。人々の吹き出しに名前の札が戻る
// どこ: 数年後の春の船着き場 (#94とは逆向き・手前が桟橋)。右に満開の桜、川の向こうに青い山
// 演出: 戻ってきた舟から清麻呂 (後ろ姿) が岸に上がり、役人が名札「和気 清麻呂」を両手で返す。札が光る。
//       後ろの人々の吹き出しに、今度は名前の札が入る
// 動き: 舟がすべりこんで止まる / 清麻呂が一段上がる / 札が光ってきらめく / 吹き出しが順に出る / 花びらが舞う / カメラは札へ寄る
const Nm095: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1.0, 1.07, easeInOut(seg(f, 0, 42)));
  const boatX = lerp(250, 420, easeOut(seg(f, 0, 16)));
  const stepUp = easeOut(seg(f, 10, 20));
  const glow = seg(f, 20, 32);
  const sweep = seg(f, 26, 38);
  const bub = [seg(f, 28, 34), seg(f, 32, 38), seg(f, 35, 41)];
  const crowd = [
    { x: 1360, cloth: C.folk3, dark: C.folk3Dark, face: "joy" as const, pose: "banzai" as const },
    { x: 1520, cloth: C.folk1, dark: C.folk1Dark, face: "smile" as const, pose: "raise" as const },
    { x: 1670, cloth: C.folk2, dark: C.folk2Dark, face: "joy" as const, pose: "stand" as const },
  ];
  return (
    <Frame f={f} seed={4095} bg={C.skySpring}>
      <g transform={`translate(1010 600) scale(${sc}) translate(-1010 -600)`}>
        {/* 春の空と山 */}
        <rect x={-200} y={-100} width={2320} height={700} fill={C.skySpring} />
        {[0, 1].map((i) => (
          <ellipse key={i} cx={360 + i * 700 + Math.sin(f / 40 + i) * 15} cy={150 + i * 40} rx={150} ry={36} fill={KRP.white} opacity={0.85} />
        ))}
        <path d="M -200 450 Q 200 320 560 400 Q 900 300 1260 390 Q 1600 320 2120 400 L 2120 560 L -200 560 Z" fill={C.hillFar} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -200 500 Q 400 430 900 480 Q 1400 430 2120 480 L 2120 560 L -200 560 Z" fill={C.grass} stroke={KRP.ink} strokeWidth={4} />
        {/* 川 (奥) */}
        <rect x={-200} y={540} width={2320} height={260} fill={C.river} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 14 }, (_, i) => {
          const wx = -150 + ((i * 173 + f * 1.6) % 2200);
          return <path key={i} d={`M ${wx} ${580 + (i % 4) * 45} q 22 -9 44 0 q 22 9 44 0`} stroke={C.riverLight} strokeWidth={5} fill="none" />;
        })}
        {/* 舟 (すべりこむ) */}
        <g transform={`translate(${boatX} 760) rotate(${Math.sin(f / 9) * 1})`}>
          <line x1={-150} y1={-200} x2={-60} y2={40} stroke={C.plankDark} strokeWidth={10} strokeLinecap="round" />
          <ND1cGuy x={-160} y={-50} s={0.78} f={f} phase={4} cloth={C.folk1} clothDark={C.folk1Dark} face="smile" pose="hold" gaze={[5, 0]} over={<ND1cKasa />} />
          <path d="M -300 -70 L 270 -70 Q 320 -78 340 -128 L 322 -40 Q 300 4 230 6 L -240 6 Q -290 4 -308 -36 Z" fill={C.boat} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -296 -50 L 300 -50" stroke={C.boatDark} strokeWidth={5} />
          {f < 20 && [0, 1].map((i) => (
            <path key={i} d={`M ${-330 - i * 40} ${10 + i * 8} q 30 -10 60 0`} stroke={C.riverLight} strokeWidth={5} fill="none" opacity={(1 - f / 20) * (1 - i * 0.4)} />
          ))}
        </g>
        {/* 桟橋 (手前いっぱい) */}
        <path d="M -200 770 L 2120 770 L 2120 1180 L -200 1180 Z" fill={C.plank} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-200} y1={800 + i * 42} x2={2120} y2={800 + i * 42} stroke={C.plankDark} strokeWidth={3.5} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={-100 + i * 170} cy={812 + (i % 3) * 84} r={5} fill={C.plankDark} />
        ))}
        <rect x={-200} y={764} width={2320} height={14} fill={C.plankDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 桜の木 (右) */}
        <g>
          <path d="M 1790 840 Q 1770 640 1810 470 Q 1760 380 1640 320 L 1660 300 Q 1780 350 1830 420 Q 1860 330 1960 280 L 1974 300 Q 1880 360 1852 480 Q 1830 650 1852 840 Z" fill={C.bark} stroke={KRP.ink} strokeWidth={5} />
          {([[1640, 260, 120], [1800, 210, 150], [1960, 250, 130], [1530, 330, 90], [1900, 380, 100], [1720, 380, 80]] as const).map(([bx, by, r], i) => (
            <g key={i}>
              <circle cx={bx} cy={by} r={r} fill={C.sakura} stroke={KRP.ink} strokeWidth={4} />
              {Array.from({ length: 6 }, (_, j) => (
                <circle key={j} cx={bx + Math.cos(j * 1.1 + i) * r * 0.55} cy={by + Math.sin(j * 1.1 + i) * r * 0.5} r={r * 0.18} fill={j % 2 ? C.sakuraLight : C.sakuraDark} opacity={0.8} />
              ))}
            </g>
          ))}
        </g>
        {/* 花びらが舞う */}
        {Array.from({ length: 26 }, (_, i) => {
          const life = (f * (0.9 + rnd(51, i) * 0.6) + rnd(52, i) * 300) % 300;
          const px = 1900 - life * (3 + rnd(53, i) * 2) + Math.sin(life / 12 + i) * 30;
          const py = 180 + life * (1.6 + rnd(54, i)) * 0.9;
          if (py > 820) return null;
          return <ellipse key={i} cx={px} cy={py} rx={11} ry={7} fill={i % 3 ? C.sakura : C.sakuraLight} stroke={C.sakuraDark} strokeWidth={2}
            transform={`rotate(${life * 3 + i * 40} ${px} ${py})`} />;
        })}
        {/* 人々 (喜ぶ) */}
        {crowd.map((p, i) => (
          <ND1cGuy key={i} x={p.x} y={790} s={0.8} f={f} phase={i * 3 + 2} cloth={p.cloth} clothDark={p.dark} face={p.face} pose={p.pose} gaze={[-6, 0]} lean={-4} />
        ))}
        {crowd.map((p, i) => (
          <ND1cBubble key={i} x={p.x - 30} y={380 + (i % 2) * 34} w={170} h={96} tx={p.x - 10} ty={548} t={bub[i]}>
            <rect x={-62} y={-26} width={124} height={52} rx={8} fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
            <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={NP.sumi}>清麻呂</text>
          </ND1cBubble>
        ))}
        {/* 札の光 */}
        {glow > 0 && (
          <g opacity={glow}>
            <circle cx={1075} cy={676} r={170 + Math.sin(f / 4) * 8} fill={NP.glow} opacity={0.35} />
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2 + f / 40;
              return <line key={i} x1={1075 + Math.cos(a) * 140} y1={676 + Math.sin(a) * 100} x2={1075 + Math.cos(a) * (190 + glow * 30)} y2={676 + Math.sin(a) * (140 + glow * 20)} stroke={NP.glow} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* 役人 (名札を返す) */}
        <ND1cGuy x={1090} y={792} s={0.92} f={f} phase={6} cloth={C.yakunin} clothDark={C.yakuninDark} face="smile" pose="hold" gaze={[-6, 1]} lean={-5}
          over={<ND1cKanmuri f={f} />} />
        <Nafuda x={1075} y={676} s={0.55} text="和気 清麻呂" hang={false} f={f} rot={-4} />
        {sweep > 0 && sweep < 1 && (
          <rect x={1075 - 120 + sweep * 220} y={626} width={26} height={100} fill={NP.glowCore} opacity={0.7 * Math.sin(sweep * Math.PI)} transform={`rotate(18 1075 676)`} />
        )}
        {/* 清麻呂 (後ろ姿・笏を手に岸へ上がる) */}
        <ND1cGuy x={800} y={lerp(830, 800, stepUp)} s={0.96} f={f} phase={1} cloth={C.kiyo} clothDark={C.kiyoDark} back lean={lerp(4, 2, stepUp)}
          over={<g><ND1cKanmuri back f={f} />
            <rect x={60} y={-150} width={16} height={128} rx={6} fill={C.shaku} stroke={KRP.ink} strokeWidth={4} transform="rotate(12 68 -70)" /></g>} />
      </g>
      <TagPlate x={560} y={112} text="のちに" size={44} t={seg(f, 0, 8)} rot={-3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #96 名前を消す罰は、日本だけのものではありません。
// 格: 並 / seed 4096
// 絵: 地図の上で、日本の奈良から点線が西へ伸び、中国・インドを越えて**エジプト**にピンが刺さる (f)。古い羊皮紙の地図。ピラミッドとナイル川の小さな絵
// どこ: 書斎の机の上に広げた古い羊皮紙の世界地図 (奈良〜エジプト)。机の端に墨壺・筆・ルーペ・文鎮
// 演出: 奈良から点線が西へ伸び、中国・インドを越えてエジプトに赤いピンが突き刺さる
// 動き: カメラは日本に寄った所から全体へ引く / 点線の先の朱の玉が進む / ピンが落ちて刺さり波紋 / 舟の絵がゆれる
const ND1cProj = (lon: number, lat: number): [number, number] => [160 + lon * 11.2, 200 + (55 - lat) * 11.5];
const ND1cPoly = (pts: number[][]) => pts.map(([lo, la], i) => { const [x, y] = ND1cProj(lo, la); return `${i ? "L" : "M"} ${x.toFixed(0)} ${y.toFixed(0)}`; }).join(" ") + " Z";
const ND1C_EURASIA = [[-10, 62], [-8, 44], [3, 43], [13, 45], [16, 41], [18, 40], [23, 38], [26, 40], [28, 37], [36, 36.5], [35, 33], [34.5, 31.2],
  [35, 28], [39, 21], [43, 13], [45, 13], [52, 16], [56, 22], [56, 26], [51, 24], [50, 26], [48, 30], [51, 28], [56, 27], [58, 25], [62, 25], [67, 24],
  [70, 21], [73, 16], [77, 8], [80, 10], [80, 15], [87, 21], [91, 22], [94, 17], [98, 16], [98, 8], [103, 1.5], [104, 10], [106, 9], [109, 12], [108, 19],
  [110, 21], [117, 23], [121, 30], [122, 31], [120, 35], [119, 37], [122, 37], [121, 40], [125, 40], [127, 35], [129, 35], [130, 43], [138, 47], [142, 55], [150, 62]];
const ND1C_AFRICA = [[-20, 37], [10, 37], [20, 32], [31, 31.5], [33, 31], [34, 29.5], [33, 28], [36, 22], [39, 16], [43, 12], [51, 12], [48, 5], [42, -6], [-20, -6]];
const ND1C_JAPAN = [
  [[130.9, 33.9], [132, 34.4], [135, 35.6], [137, 37], [139.5, 38.5], [140, 40.5], [141.4, 41.2], [142, 39.5], [141, 37.5], [140.8, 35.5], [139.5, 34.9], [137, 34.5], [135.4, 33.6], [133, 33.9]],
  [[129.8, 33.4], [131, 33.9], [132, 33], [131.3, 31.3], [130.2, 31.3]],
  [[132.6, 33.8], [134.6, 34.2], [134.5, 33.4], [133, 32.8]],
  [[140, 41.8], [141.5, 45.4], [145.5, 43.4], [143.2, 42], [141, 41.5]],
];
const ND1C_ROUTE = [[135.8, 34.7], [129, 34.2], [121, 32.5], [110, 31], [98, 28], [87, 25], [77, 23.5], [66, 25.5], [56, 27.5], [45, 29.5], [37, 30.2], [31.3, 30]];
const Nm096: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const sc = lerp(1.3, 1.0, cam);
  const cx = lerp(1500, 960, cam);
  const cy = lerp(450, 540, cam);
  const prog = easeInOut(seg(f, 4, 32));
  const pinT = seg(f, 30, 37);
  const ring = seg(f, 36, 42);
  // 点線の点を等間隔に並べる
  const pts = ND1C_ROUTE.map(([lo, la]) => ND1cProj(lo, la));
  const dots: [number, number][] = [];
  let carry = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    let d = carry;
    for (; d < len; d += 24) dots.push([x1 + ((x2 - x1) * d) / len, y1 + ((y2 - y1) * d) / len]);
    carry = d - len;
  }
  const shown = Math.floor(dots.length * prog);
  const tip = dots[Math.max(0, Math.min(dots.length - 1, shown - 1))];
  const [ex, ey] = ND1cProj(31.3, 30);
  const [nx, ny] = ND1cProj(135.8, 34.7);
  const pinDrop = (1 - easeOut(pinT)) * -260;
  return (
    <Frame f={f} seed={4096} bg={C.desk}>
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* 机 (木目) */}
        <rect x={-400} y={-300} width={2720} height={1700} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.5}>
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M -400 ${-200 + i * 140} q 700 ${rnd(61, i) * 40 - 20} 1400 0 q 700 ${rnd(62, i) * 40 - 20} 1400 0`} fill="none" />
          ))}
        </g>
        {/* 羊皮紙の地図 (端がめくれる) */}
        <rect x={98} y={162} width={1740} height={730} rx={12} fill={KRP.ink} opacity={0.25} />
        <path d="M 80 150 Q 500 132 960 146 Q 1400 134 1840 150 L 1832 880 Q 1400 896 960 884 Q 500 898 88 880 Z" fill={C.parch} stroke={KRP.ink} strokeWidth={6} />
        <clipPath id="nd1c96clip"><rect x={110} y={175} width={1700} height={690} /></clipPath>
        <g clipPath="url(#nd1c96clip)">
          <rect x={110} y={175} width={1700} height={690} fill={C.sea} />
          {/* 海の波線 */}
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M ${200 + rnd(63, i) * 1500} ${300 + rnd(64, i) * 520} q 14 -8 28 0 q 14 8 28 0`} stroke={C.seaLine} strokeWidth={3} fill="none" />
          ))}
          {/* 経緯線 */}
          {[0, 30, 60, 90, 120, 150].map((lo) => { const [x] = ND1cProj(lo, 0); return <line key={lo} x1={x} y1={175} x2={x} y2={865} stroke={C.parchDark} strokeWidth={2.5} strokeDasharray="6 8" />; })}
          {[0, 20, 40].map((la) => { const [, y] = ND1cProj(0, la); return <line key={la} x1={110} y1={y} x2={1810} y2={y} stroke={C.parchDark} strokeWidth={2.5} strokeDasharray="6 8" />; })}
          <path d={ND1cPoly(ND1C_AFRICA)} fill={C.land} stroke={C.landDark} strokeWidth={5} />
          <path d={ND1cPoly(ND1C_EURASIA)} fill={C.land} stroke={C.landDark} strokeWidth={5} />
          {ND1C_JAPAN.map((isl, i) => <path key={i} d={ND1cPoly(isl)} fill={C.land} stroke={C.landDark} strokeWidth={4} />)}
          {/* 山脈の記号 (ヒマラヤ) */}
          {[0, 1, 2, 3, 4].map((i) => { const [mx, my] = ND1cProj(78 + i * 4, 33 - i * 0.8); return <path key={i} d={`M ${mx - 18} ${my + 10} L ${mx} ${my - 14} L ${mx + 18} ${my + 10}`} fill="none" stroke={C.landDark} strokeWidth={4} />; })}
          {/* ナイル川とピラミッド */}
          <path d={(() => { const a = ND1cProj(31, 31.2), b = ND1cProj(31.5, 27), c = ND1cProj(32.7, 22), d = ND1cProj(33, 15), e = ND1cProj(32.5, 8); return `M ${a[0]} ${a[1]} Q ${b[0] - 6} ${b[1]} ${c[0]} ${c[1]} T ${d[0]} ${d[1]} T ${e[0]} ${e[1]}`; })()}
            stroke={C.nile} strokeWidth={6} fill="none" strokeLinecap="round" />
          {[[-34, 18, 26], [-6, 22, 20], [-58, 24, 16]].map(([dx, dy, r], i) => (
            <g key={i}>
              <path d={`M ${ex + dx - r} ${ey + dy + 30} L ${ex + dx} ${ey + dy + 30 - r * 1.3} L ${ex + dx + r} ${ey + dy + 30} Z`} fill={C.sandLight} stroke={KRP.ink} strokeWidth={3.5} />
              <path d={`M ${ex + dx} ${ey + dy + 30 - r * 1.3} L ${ex + dx + r} ${ey + dy + 30} L ${ex + dx + 3} ${ey + dy + 30} Z`} fill={C.sandDark} />
            </g>
          ))}
          {/* 地名 (ラベル) */}
          <text x={ND1cProj(108, 36)[0]} y={ND1cProj(108, 36)[1]} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.landDark}>中国</text>
          <text x={ND1cProj(78, 18)[0]} y={ND1cProj(78, 18)[1]} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.landDark}>インド</text>
          {/* 帆かけ舟の絵 (インド洋) */}
          <g transform={`translate(${ND1cProj(68, 10)[0]} ${ND1cProj(68, 10)[1] + Math.sin(f / 8) * 4}) rotate(${Math.sin(f / 10) * 4})`}>
            <path d="M -40 0 L 40 0 L 28 16 L -28 16 Z" fill={C.boat} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M 0 -4 L 0 -60 L 30 -10 Z" fill={C.linen} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
          {/* 方位の飾り */}
          <g transform={`translate(1650 735) rotate(${Math.sin(f / 30) * 3})`}>
            <circle r={62} fill="none" stroke={C.landDark} strokeWidth={4} />
            <path d="M 0 -78 L 14 0 L 0 78 L -14 0 Z" fill={C.landDark} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -78 0 L 0 -12 L 78 0 L 0 12 Z" fill={C.parchDark} stroke={KRP.ink} strokeWidth={3} />
            <path d="M 0 -78 L 14 0 L -14 0 Z" fill={KRP.red} />
          </g>
          {/* 点線の旅路 */}
          {dots.slice(0, shown).map(([dx, dy], i) => (
            <circle key={i} cx={dx} cy={dy} r={6.5} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
          ))}
          {prog > 0 && prog < 1 && tip && <circle cx={tip[0]} cy={tip[1]} r={14 + Math.sin(f / 2) * 2} fill={NP.mimi} stroke={KRP.ink} strokeWidth={4} />}
          {/* エジプトの光 */}
          {pinT > 0.6 && <circle cx={ex} cy={ey} r={70} fill={NP.glow} opacity={0.4 * seg(f, 34, 40)} />}
          {ring > 0 && ring < 1 && <circle cx={ex} cy={ey} r={20 + ring * 80} fill="none" stroke={KRP.red} strokeWidth={6} opacity={1 - ring} />}
        </g>
        {/* 地図の縁取り (二重線) */}
        <rect x={110} y={175} width={1700} height={690} fill="none" stroke={C.landDark} strokeWidth={5} />
        <rect x={124} y={189} width={1672} height={662} fill="none" stroke={C.landDark} strokeWidth={2.5} />
        {/* 奈良の印 */}
        <circle cx={nx} cy={ny} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={nx} cy={ny} r={6} fill={KRP.red} />
        {/* ピン (エジプトに刺さる) */}
        {pinT > 0 && (
          <g transform={`translate(${ex} ${ey + pinDrop})`}>
            <ellipse cx={8} cy={-pinDrop * 0.2 + 4} rx={18} ry={6} fill={KRP.ink} opacity={0.25} />
            <line x1={0} y1={0} x2={0} y2={-70} stroke={C.metal} strokeWidth={6} strokeLinecap="round" />
            <circle cx={0} cy={-84} r={26} fill={C.pin} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-8} cy={-92} r={8} fill={KRP.white} opacity={0.6} />
          </g>
        )}
        <TagPlate x={nx} y={ny - 60} text="奈良" size={32} t={seg(f, 0, 6)} />
        <TagPlate x={ex + 10} y={ey - 160} text="エジプト" size={34} t={seg(f, 34, 40)} />
        {/* 机の上の道具 */}
        <g transform="translate(1780 960)">
          <ellipse cx={0} cy={20} rx={70} ry={20} fill={KRP.ink} opacity={0.25} />
          <path d="M -54 -40 L 54 -40 L 60 16 Q 0 34 -60 16 Z" fill={C.shadowHand} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-40} rx={54} ry={14} fill={C.wallWorkDark} stroke={KRP.ink} strokeWidth={4} />
          <line x1={10} y1={-50} x2={110} y2={-190} stroke={C.plank} strokeWidth={14} strokeLinecap="round" />
        </g>
        <g transform={`translate(250 975) rotate(${-20 + Math.sin(f / 20) * 2})`}>
          <circle r={62} fill={KRP.blueSoft} opacity={0.6} stroke={KRP.brass} strokeWidth={12} />
          <circle r={62} fill="none" stroke={KRP.ink} strokeWidth={4} />
          <rect x={58} y={-12} width={130} height={24} rx={10} fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <rect x={60} y={120} width={120} height={56} rx={8} fill={C.metal} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1760} y={830} width={120} height={56} rx={8} fill={C.metal} stroke={KRP.ink} strokeWidth={5} transform="rotate(4 1820 858)" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #97 古代エジプトでは、女王ハトシェプストの名前が、記念碑から削り取られています。
// 格: 山 / seed 4097
// 絵: ★エジプトの神殿の壁 (砂岩・浮き彫りの帯・強い日差し)。壁の浮き彫りの楕円の枠 (王の名前の枠 = カルトゥーシュ) の中の模様が、**石工のノミで削り取られていく** (f で石の粉が飛ぶ)。枠の外の浮き彫りはそのまま。女王の浮き彫りの人物は**横顔の線画程度** (エジプト美術の様式で・顔の細部は描かない)。札「古代エジプト」
// どこ: 古代エジプトの神殿の砂岩の壁。上に装飾の帯、左に女王の浮き彫り、真ん中に名前の楕円枠。左上から強い日差し
// 演出: 足場に乗った石工が、楕円枠の中の模様だけをノミで削り取っていく。枠の外の女王の姿と縦の模様はそのまま
// 動き: 削られた範囲が上から下へ広がる / 12コマに1回ノミを打ち、石の粉が飛ぶ / 足もとに石くずが積もる / ヤシの葉の影がゆれる / カメラは枠へ寄る
const Nm097: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1.0, 1.07, easeInOut(seg(f, 0, 42)));
  const pe = lerp(0.3, 0.72, easeInOut(seg(f, 0, 40)));
  const CX = 1060, CT = 190, CH = 460, CW = 230;
  const front = CT + pe * CH;
  const k = ((f + 7) % 12) / 12;
  const push = k < 0.15 ? k / 0.15 : Math.max(0, 1 - (k - 0.15) / 0.3);
  const age = (f + 7) % 12;
  const tipX = CX + 40 + Math.sin(f / 9) * 50 - push * 6;
  const tipY = front - 6;
  const mx = 1380, my = 641;
  const bobM = Math.sin((f + 3 * 17) / 13) * 3 * 0.95;
  const handX = mx - 153 * 0.95, handY = my - 148 * 0.95 + bobM;
  // 削られた縁 (ギザギザ)
  const edge = Array.from({ length: 13 }, (_, i) => `L ${CX + CW / 2 - (i * CW) / 12} ${front + (rnd(71, i + Math.floor(f / 12)) - 0.5) * 18}`).join(" ");
  const glyph = (key: string, el: React.ReactNode) => (
    <g key={key}>
      <g transform="translate(5 5)" opacity={0.9} style={{ filter: "none" }}><g fill={C.reliefShadow} stroke={C.reliefShadow}>{el}</g></g>
      <g fill={C.relief} stroke={C.reliefShadow} strokeWidth={4}>{el}</g>
    </g>
  );
  return (
    <Frame f={f} seed={4097} bg={C.stone}>
      <g transform={`translate(${CX} 480) scale(${sc}) translate(${-CX} -480)`}>
        {/* 砂岩の壁 (石積み) */}
        <rect x={-200} y={-100} width={2320} height={1000} fill={C.stone} />
        {Array.from({ length: 7 }, (_, r) => (
          <g key={r}>
            <line x1={-200} y1={-40 + r * 150} x2={2120} y2={-40 + r * 150} stroke={C.stoneJoint} strokeWidth={4} />
            {Array.from({ length: 9 }, (_, i) => {
              const jx = -100 + i * 280 + (r % 2) * 140;
              return <line key={i} x1={jx} y1={-40 + r * 150} x2={jx + 2} y2={110 + r * 150} stroke={C.stoneJoint} strokeWidth={4} />;
            })}
          </g>
        ))}
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={rnd(72, i) * 2000 - 40} cy={rnd(73, i) * 800} r={2 + rnd(74, i) * 4} fill={C.stoneDark} opacity={0.5} />
        ))}
        {/* 上の装飾の帯 (星と縦の飾り) */}
        <rect x={-200} y={20} width={2320} height={110} fill={C.egBlue} opacity={0.55} stroke={C.reliefShadow} strokeWidth={4} />
        {Array.from({ length: 30 }, (_, i) => (
          <g key={i} transform={`translate(${-160 + i * 78} 75)`}>
            <path d="M -22 40 L -22 -20 Q 0 -44 22 -20 L 22 40" fill={C.relief} stroke={C.reliefShadow} strokeWidth={4} />
            <circle cx={0} cy={-6} r={8} fill={C.egRed} stroke={C.reliefShadow} strokeWidth={3} />
          </g>
        ))}
        <rect x={-200} y={130} width={2320} height={14} fill={C.egRed} opacity={0.7} />
        {/* 縦の模様の列 (枠の外・そのまま残る) */}
        {[820, 890].map((colX, ci) => (
          <g key={colX}>
            <line x1={colX - 32} y1={170} x2={colX - 32} y2={740} stroke={C.reliefShadow} strokeWidth={3} />
            {Array.from({ length: 6 }, (_, i) => {
              const gy = 210 + i * 92, t = (i + ci) % 4;
              return glyph(`c${ci}${i}`, t === 0 ? <circle cx={colX} cy={gy} r={18} /> :
                t === 1 ? <path d={`M ${colX - 22} ${gy} q 11 -14 22 0 q 11 14 22 0`} fill="none" strokeWidth={7} /> :
                t === 2 ? <path d={`M ${colX - 6} ${gy + 26} Q ${colX - 22} ${gy - 10} ${colX + 4} ${gy - 30} Q ${colX + 10} ${gy} ${colX + 6} ${gy + 26} Z`} /> :
                <rect x={colX - 20} y={gy - 14} width={40} height={28} rx={6} />);
            })}
          </g>
        ))}
        {/* 女王の浮き彫り (横顔・そのまま残る) */}
        <g transform="translate(470 790) scale(1.02)">
          <ND1cQueen f={f} />
        </g>
        {/* 名前の楕円枠 (カルトゥーシュ) */}
        <rect x={CX - CW / 2 + 6} y={CT + 6} width={CW} height={CH} rx={CW / 2} fill={C.reliefShadow} />
        <rect x={CX - CW / 2} y={CT} width={CW} height={CH} rx={CW / 2} fill={C.relief} stroke={C.reliefShadow} strokeWidth={6} />
        <rect x={CX - CW / 2 - 20} y={CT + CH + 4} width={CW + 40} height={30} rx={8} fill={C.relief} stroke={C.reliefShadow} strokeWidth={6} />
        <clipPath id="nd1c97cart"><rect x={CX - CW / 2 + 12} y={CT + 12} width={CW - 24} height={CH - 24} rx={CW / 2 - 12} /></clipPath>
        <g clipPath="url(#nd1c97cart)">
          {/* 中の模様 (王の名前を表す絵の字) */}
          {glyph("g1", <circle cx={CX} cy={262} r={34} />)}
          {glyph("g2", <path d={`M ${CX - 50} 300 L ${CX - 40} 360 L ${CX + 40} 360 L ${CX + 50} 300 L ${CX + 34} 300 L ${CX + 28} 344 L ${CX - 28} 344 L ${CX - 34} 300 Z`} />)}
          {glyph("g3", <path d={`M ${CX - 46} 470 Q ${CX - 60} 410 ${CX - 34} 384 Q ${CX - 22} 420 ${CX - 30} 470 Z`} />)}
          {glyph("g4", <ellipse cx={CX + 30} cy={430} rx={34} ry={26} />)}
          {glyph("g5", <path d={`M ${CX - 50} 500 Q ${CX} 560 ${CX + 50} 500 Z`} />)}
          {glyph("g6", <path d={`M ${CX - 60} 580 l 15 -14 l 15 14 l 15 -14 l 15 14 l 15 -14 l 15 14 l 15 -14 l 15 14`} fill="none" strokeWidth={8} />)}
          {glyph("g7", <rect x={CX - 8} y={598} width={16} height={36} rx={4} />)}
          {/* 削られた所 (ざらざらのへこみ) */}
          <path d={`M ${CX - CW / 2} ${CT} L ${CX + CW / 2} ${CT} L ${CX + CW / 2} ${front} ${edge} Z`} fill={C.chiseled} />
          {Array.from({ length: 44 }, (_, i) => {
            const py = CT + rnd(75, i) * CH;
            if (py > front - 10) return null;
            const px = CX - 90 + rnd(76, i) * 180;
            return <path key={i} d={`M ${px} ${py} q 8 -6 16 0`} stroke={C.chiseledDark} strokeWidth={4} fill="none" />;
          })}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1={CX - 110} y1={CT + 30 + i * 40} x2={CX + 110} y2={CT + 50 + i * 40} stroke={C.chiseledDark} strokeWidth={3} opacity={CT + 50 + i * 40 < front ? 0.5 : 0} />
          ))}
        </g>
        {/* 日差しの帯と、ヤシの葉の影 */}
        <polygon points="-200,-100 600,-100 1900,1000 900,1000" fill={C.sun} opacity={0.2} />
        <g transform={`translate(1750 -40) rotate(${Math.sin(f / 16) * 4})`} opacity={0.22}>
          {[-60, -25, 10, 45, 80].map((a, i) => (
            <path key={i} d="M 0 0 Q 120 60 300 40 Q 140 30 0 0 Z" fill={C.palmShadow} transform={`rotate(${a + 60})`} />
          ))}
        </g>
        {/* 足もとの砂と石くず */}
        <rect x={-200} y={790} width={2320} height={400} fill={C.sand} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 20 }, (_, i) => (
          <path key={i} d={`M ${-150 + i * 110} ${850 + (i % 3) * 50} q 26 -10 52 0`} stroke={C.sandDark} strokeWidth={4} fill="none" />
        ))}
        <path d={`M ${CX - 160} 800 Q ${CX - 40} ${800 - 30 - pe * 40} ${CX + 120} 800 Z`} fill={C.chiseled} stroke={KRP.ink} strokeWidth={3.5} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${CX - 120 + i * 32} ${804 + (i % 2) * 8} l 10 -12 l 10 12 Z`} fill={C.chiseledDark} stroke={KRP.ink} strokeWidth={2.5} />
        ))}
        {/* 足場 (木と縄) */}
        <g>
          {[1250, 1520].map((lx) => (
            <rect key={lx} x={lx} y={650} width={22} height={200} fill={C.plankDark} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <line x1={1260} y1={700} x2={1530} y2={820} stroke={C.plankDark} strokeWidth={10} />
          <rect x={1230} y={636} width={330} height={22} fill={C.plank} stroke={KRP.ink} strokeWidth={4.5} />
          {[1262, 1530].map((lx) => (
            <path key={lx} d={`M ${lx - 14} 652 l 28 10 M ${lx - 14} 664 l 28 10`} stroke={C.kasa} strokeWidth={5} />
          ))}
          {/* 道具かご */}
          <path d="M 1470 600 L 1544 600 L 1534 638 L 1480 638 Z" fill={C.kasa} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1490} y1={600} x2={1480} y2={570} stroke={C.metal} strokeWidth={6} />
        </g>
        {/* 石工 (白い腰布・ノミを枠に当てる) */}
        <ND1cGuy x={mx} y={my} s={0.95} f={f} phase={3} cloth={C.linen} clothDark={C.linenDark} hair="none" face="normal" pose="point" pointDir={-1}
          gaze={[-6, -2]} lean={-2 * push}
          over={<g>
            {/* 腰布の帯 */}
            <rect x={-60} y={-70} width={120} height={14} fill={C.egRed} stroke={KRP.ink} strokeWidth={3} />
            {/* 下げた手の木槌 */}
            <rect x={60} y={-74} width={12} height={70} rx={4} fill={C.plank} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-14 66 -70)" />
            <rect x={70} y={-26} width={48} height={34} rx={8} fill={C.plankDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(-14 66 -70)" />
          </g>} />
        {/* ノミ (手から枠の中へ) */}
        <line x1={handX} y1={handY} x2={tipX + (handX - tipX) * 0.35} y2={tipY + (handY - tipY) * 0.35} stroke={C.plank} strokeWidth={14} strokeLinecap="round" />
        <line x1={tipX + (handX - tipX) * 0.35} y1={tipY + (handY - tipY) * 0.35} x2={tipX} y2={tipY} stroke={C.metal} strokeWidth={9} strokeLinecap="round" />
        <circle cx={handX} cy={handY} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 石の粉 */}
        {age < 11 && Array.from({ length: 18 }, (_, i) => {
          const a = Math.PI * (0.6 + rnd(77, i) * 0.9);
          const v = 5 + rnd(78, i) * 8;
          const px = tipX + Math.cos(a) * v * age * -1 + 4;
          const py = tipY + Math.sin(a) * -v * age * 0.6 + 0.9 * age * age;
          return <circle key={i} cx={px} cy={py} r={6 + rnd(79, i) * 7} fill={i % 3 ? C.chiseled : C.sandLight} stroke={C.reliefShadow} strokeWidth={2} opacity={1 - age / 12} />;
        })}
        {push > 0.6 && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
            {[0, 1, 2].map((i) => {
              const a = -0.6 + i * 0.6;
              return <line key={i} x1={tipX - Math.cos(a) * 20} y1={tipY + Math.sin(a) * 20} x2={tipX - Math.cos(a) * 40} y2={tipY + Math.sin(a) * 40} />;
            })}
          </g>
        )}
      </g>
      <TagPlate x={1700} y={200} text="古代エジプト" size={40} t={seg(f, 0, 8)} rot={2} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #98 誰が、なぜ削ったのかは、いまも議論が続いています。
// 格: 並 / seed 4098
// 絵: 削られた壁の前で、現代の研究者たち (Person 2〜3人・白衣・帽子) が額を寄せて議論する。頭上に「?」が3つ、それぞれ違う向き。メモ帳・ルーペ・写真。結論の札は出さない
// どこ: いまの発掘現場。#97 と同じ壁だが3000年以上たって色あせ、削られた楕円枠に照明が当てられている。目盛りの棒・ケーブル・折りたたみ机
// 演出: 白衣と帽子の研究者3人が額を寄せて議論。ルーペで覗く人・写真を見比べる人・メモを取る人。頭上に向きの違う「？」が3つ。結論の札は出さない
// 動き: 「？」が順に出てゆれる / ルーペが左右に動く / 写真がひらひら / 照明の光がちらつく / カメラはゆっくり右へパンしつつ寄る
const ND1cHat: React.FC = () => (
  <g>
    <ellipse cx={0} cy={-268} rx={98} ry={20} fill={C.hatKhaki} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -58 -270 Q -60 -326 0 -330 Q 60 -326 58 -270 Z" fill={C.hatKhaki} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={-58} y={-284} width={116} height={12} fill={C.hatKhakiDark} />
  </g>
);
const ND1cCoat: React.FC = () => (
  <g stroke={C.coatDark} strokeWidth={4} fill="none">
    <path d="M -24 -160 L 0 -118 L 24 -160" stroke={KRP.ink} />
    <line x1={0} y1={-118} x2={0} y2={-54} />
    <circle cx={0} cy={-100} r={3} fill={C.coatDark} />
    <circle cx={0} cy={-76} r={3} fill={C.coatDark} />
  </g>
);
const Nm098: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1.0, 1.06, cam);
  const panX = lerp(-30, 20, cam);
  const lensX = Math.sin(f / 14) * 26;
  const flick = 0.85 + Math.sin(f * 1.3) * 0.05;
  const CX = 960, CT = 110, CW = 210, CH = 400;
  const qs = [
    { x: 700, y: 470, r: -24, t: seg(f, 10, 18) },
    { x: 960, y: 410, r: 10, t: seg(f, 17, 25) },
    { x: 1215, y: 470, r: 28, t: seg(f, 24, 32) },
  ];
  return (
    <Frame f={f} seed={4098} bg={C.stone}>
      <g transform={`translate(960 560) scale(${sc}) translate(${-960 + panX} -560)`}>
        {/* 色あせた壁 */}
        <rect x={-200} y={-100} width={2320} height={900} fill={C.stone} />
        {Array.from({ length: 6 }, (_, r) => (
          <g key={r}>
            <line x1={-200} y1={30 + r * 140} x2={2120} y2={30 + r * 140} stroke={C.stoneJoint} strokeWidth={4} />
            {Array.from({ length: 9 }, (_, i) => {
              const jx = -60 + i * 260 + (r % 2) * 130;
              return <line key={i} x1={jx} y1={30 + r * 140} x2={jx + 3} y2={170 + r * 140} stroke={C.stoneJoint} strokeWidth={4} />;
            })}
          </g>
        ))}
        {/* ひび */}
        <path d="M 1500 30 L 1530 120 L 1510 200 L 1560 300" stroke={C.stoneJoint} strokeWidth={4} fill="none" />
        {/* 女王の浮き彫り (左に一部だけ見える) */}
        <g transform="translate(250 800) scale(0.9)" opacity={0.85}>
          <ND1cQueen f={f} />
        </g>
        {/* 照明の光 */}
        <polygon points={`210,430 ${CX - 160},${CT - 20} ${CX + 180},${CT + 40} 250,470`} fill={NP.glowCore} opacity={0.35 * flick} />
        <ellipse cx={CX} cy={CT + CH / 2} rx={200} ry={260} fill={NP.glowCore} opacity={0.35 * flick} />
        {/* 削られた楕円枠 (中は空っぽのざらざら) */}
        <rect x={CX - CW / 2 + 6} y={CT + 6} width={CW} height={CH} rx={CW / 2} fill={C.reliefShadow} />
        <rect x={CX - CW / 2} y={CT} width={CW} height={CH} rx={CW / 2} fill={C.relief} stroke={C.reliefShadow} strokeWidth={6} />
        <rect x={CX - CW / 2 + 14} y={CT + 14} width={CW - 28} height={CH - 28} rx={CW / 2 - 14} fill={C.chiseled} />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M ${CX - 70 + rnd(81, i) * 130} ${CT + 40 + rnd(82, i) * (CH - 80)} q 8 -6 16 0`} stroke={C.chiseledDark} strokeWidth={4} fill="none" />
        ))}
        <rect x={CX - CW / 2 - 18} y={CT + CH + 4} width={CW + 36} height={28} rx={8} fill={C.relief} stroke={C.reliefShadow} strokeWidth={6} />
        {/* 目盛りの棒 (テープで貼る) */}
        <g transform={`translate(${CX + 150} ${CT + 60})`}>
          <rect x={0} y={0} width={26} height={300} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={0} y={i * 50} width={26} height={25} fill={KRP.red} />)}
          <rect x={-10} y={-14} width={46} height={20} fill={KRP.yellow} opacity={0.8} />
        </g>
        {/* 照明 (三脚) */}
        <g transform="translate(230 800)">
          <line x1={0} y1={-360} x2={-70} y2={30} stroke={C.metal} strokeWidth={8} />
          <line x1={0} y1={-360} x2={70} y2={30} stroke={C.metal} strokeWidth={8} />
          <line x1={0} y1={-360} x2={0} y2={30} stroke={C.metal} strokeWidth={8} />
          <g transform="translate(0 -380) rotate(-28)">
            <rect x={-50} y={-34} width={100} height={68} rx={10} fill={C.metal} stroke={KRP.ink} strokeWidth={5} />
            <rect x={44} y={-30} width={16} height={60} fill={NP.glowCore} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <path d="M 0 0 Q 200 60 420 40 T 900 80" stroke={KRP.ink} strokeWidth={5} fill="none" />
        </g>
        {/* 砂の地面 */}
        <rect x={-200} y={780} width={2320} height={400} fill={C.sand} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${-100 + i * 140} ${840 + (i % 3) * 60} q 26 -10 52 0`} stroke={C.sandDark} strokeWidth={4} fill="none" />
        ))}
        {/* 折りたたみ机 (写真・カメラ・水筒) */}
        <g transform="translate(1600 760)">
          <line x1={-150} y1={0} x2={130} y2={110} stroke={C.metal} strokeWidth={7} />
          <line x1={150} y1={0} x2={-130} y2={110} stroke={C.metal} strokeWidth={7} />
          <rect x={-180} y={-16} width={360} height={20} rx={4} fill={C.plank} stroke={KRP.ink} strokeWidth={4.5} />
          {[[-130, -8], [-60, -4]].map(([px, rz], i) => (
            <g key={i} transform={`translate(${px} -40) rotate(${rz})`}>
              <rect x={-36} y={-24} width={72} height={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={-28} y={-18} width={56} height={36} fill={C.stoneDark} />
              <rect x={-10} y={-14} width={20} height={30} rx={10} fill={C.chiseled} stroke={KRP.ink} strokeWidth={2} />
            </g>
          ))}
          <rect x={20} y={-70} width={80} height={54} rx={8} fill={KRP.ink} />
          <circle cx={60} cy={-43} r={18} fill={C.metal} stroke={KRP.white} strokeWidth={3} />
          <rect x={120} y={-90} width={34} height={74} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 研究者3人 */}
        <ND1cGuy x={700} y={870} s={1.0} f={f} phase={1} cloth={KRP.white} clothDark={C.coatDark} face="surprised" pose="raise" gaze={[6, -4]} lean={8}
          over={<g><ND1cCoat /><ND1cHat /></g>} />
        <g transform={`translate(${798 + lensX * 0.3} 555) rotate(${lensX * 0.3})`}>
          <line x1={0} y1={38} x2={0} y2={96} stroke={C.deskDark} strokeWidth={14} strokeLinecap="round" />
          <circle cx={0} cy={0} r={40} fill={KRP.blueSoft} opacity={0.7} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -18 -14 Q -6 -24 8 -20" stroke={KRP.white} strokeWidth={5} fill="none" />
        </g>
        <ND1cGuy x={960} y={880} s={1.0} f={f} phase={4} cloth={KRP.white} clothDark={C.coatDark} face="worried" pose="hold" gaze={[0, -5]} glasses
          over={<g><ND1cCoat /><ND1cHat /></g>} />
        <g transform={`translate(960 ${760 - 6}) rotate(${Math.sin(f / 7) * 5})`}>
          <rect x={-64} y={-50} width={128} height={92} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-54} y={-40} width={108} height={64} fill={C.stoneDark} />
          <rect x={-16} y={-36} width={32} height={56} rx={16} fill={C.relief} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={0} cy={-18} r={8} fill={C.reliefShadow} />
        </g>
        <ND1cGuy x={1220} y={870} s={1.0} f={f} phase={7} cloth={KRP.white} clothDark={C.coatDark} face="normal" pose="hold" gaze={[-6, -2]} lean={-8}
          over={<g><ND1cCoat /><ND1cHat />
            <rect x={-40} y={-150} width={74} height={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} transform="rotate(-10 0 -120)" />
            {[0, 1, 2].map((i) => <line key={i} x1={-30} y1={-136 + i * 14} x2={20} y2={-140 + i * 14} stroke={KRP.ink} strokeWidth={2.5} transform="rotate(-10 0 -120)" />)}
            <line x1={30} y1={-108} x2={56} y2={-160 + Math.sin(f / 3) * 4} stroke={KRP.orange} strokeWidth={8} strokeLinecap="round" />
          </g>} />
        {/* 向きのちがう ? が3つ */}
        {qs.map((q, i) => (
          <g key={i} transform={`rotate(${q.r + Math.sin(f / 10 + i) * 4} ${q.x} ${q.y - 30})`}>
            <QMark x={q.x} y={q.y} s={0.9} f={f + i * 20} t={q.t} color={i === 1 ? KRP.orange : KRP.red} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #99 名前の糸は、人の手で切ることも、書きかえることもできたのです。
// 格: 山 / seed 4099
// 絵: ★**リキャップ② (装置)**。からくりの作業台の上の `Nafuda text="山田 花子"`。左から朱の耳の糸 (`Ito kind="mimi"`) がナレーター役 Person の耳へ結ばれている。上から**大きな真鍮のハサミ**が降りてきて、f10〜24 で糸を**切る** (`cut` 0→1)。続いて名札の字が一瞬かすれ (`blur` 0→0.7→0)、元に戻る。右上に `ItoLegend` (lit={{ mimi: 1 }})
// どこ: からくりの作業場。板壁に道具掛け・回る真鍮の歯車・吊りランプ。作業台の上の木の札掛けに名札「山田 花子」
// 演出: 名札の左の結び目から朱の耳の糸が、台の向こうのナレーター役の耳へ。上から大きな真鍮のハサミが降りて糸をチョキン。
//       続いて筆が現れ、名札の字が一瞬かすれて別の名前に変わりかけ、元に戻る。筆は台に置かれる
// 動き: ハサミが降りる(f0-10)→閉じる(f12-15)→糸が切れる(f14-24)→ハサミが上がる / 字がかすれる(f26-40) / 人が驚いて手を上げる / 歯車が回る / カメラは切れる所へ寄って戻る
const ND1C_NX = 980, ND1C_NY = 430, ND1C_NS = 1.15;
const ND1C_EAR: [number, number] = [404, 489];
// 作業場 (#99 と #100 は同じ場所・同じ時間の続き。#100 はこれを引きで見る)
const ND1cWorkshop: React.FC<{ f: number }> = ({ f }) => {
  const gear = (cx: number, cy: number, r: number, n: number, rot: number, key: string) => (
    <g key={key} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={-r * 0.12} y={-r - 22} width={r * 0.24} height={34} rx={4} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${(i * 360) / n})`} />
      ))}
      <circle r={r} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
      <circle r={r * 0.72} fill={NP.brassDark} opacity={0.5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={Math.cos((i * 2 * Math.PI) / 5) * r * 0.48} cy={Math.sin((i * 2 * Math.PI) / 5) * r * 0.48} r={r * 0.14} fill={C.wallWorkDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <circle r={r * 0.18} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
  const swing = Math.sin(f / 18) * 2;
  return (
    <g>
      {/* 板壁 */}
      <rect x={-460} y={-340} width={2840} height={1000} fill={C.wallWork} />
      {Array.from({ length: 25 }, (_, i) => (
        <g key={i}>
          <line x1={-440 + i * 120} y1={-340} x2={-440 + i * 120} y2={660} stroke={C.wallWorkDark} strokeWidth={5} />
          <circle cx={-410 + i * 120} cy={100 + (i % 3) * 140} r={6} fill={C.wallWorkDark} />
        </g>
      ))}
      <rect x={-460} y={-200} width={2840} height={60} fill={C.wallWorkDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-460} y={10} width={2840} height={56} fill={C.wallWorkLight} stroke={KRP.ink} strokeWidth={5} />
      {/* 左の棚 (引きで見える) */}
      {[160, 360].map((sy) => (
        <g key={sy}>
          <rect x={-430} y={sy} width={360} height={18} fill={C.peg} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((j) => (
            <rect key={j} x={-410 + j * 110} y={sy - 80 + (j % 2) * 16} width={70} height={80 - (j % 2) * 16} rx={10} fill={[NP.mimi, NP.chobo, NP.shinyo][j]} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
          ))}
        </g>
      ))}
      {/* 道具掛けの板 */}
      <rect x={40} y={110} width={480} height={400} rx={10} fill={C.peg} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={70 + (i % 8) * 60} cy={140 + Math.floor(i / 8) * 80} r={5} fill={C.wallWorkDark} />
      ))}
      <g transform={`rotate(${swing} 120 150)`}>
        <rect x={110} y={150} width={18} height={150} rx={5} fill={C.plank} stroke={KRP.ink} strokeWidth={4} />
        <rect x={82} y={290} width={74} height={40} rx={6} fill={C.metal} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <g transform={`rotate(${-swing} 260 150)`}>
        <path d="M 230 160 L 290 160 L 300 420 L 220 420 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 222 400 l 10 14 l 10 -14 l 10 14 l 10 -14 l 10 14 l 10 -14 l 10 14" stroke={KRP.ink} strokeWidth={3} fill="none" />
        <rect x={226} y={150} width={68} height={40} rx={10} fill={C.plankDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <g transform="translate(420 170)">
        <path d="M -16 0 L -26 160 M 16 0 L 26 160" stroke={C.metal} strokeWidth={12} strokeLinecap="round" />
        <circle cx={0} cy={6} r={12} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-40} y={120} width={20} height={60} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} transform="rotate(-6 -30 150)" />
        <rect x={20} y={120} width={20} height={60} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} transform="rotate(6 30 150)" />
      </g>
      {/* 歯車 (ゆっくり回る) */}
      {gear(1650, 470, 130, 12, f * 0.8, "g1")}
      {gear(1880, 330, 82, 9, -f * 1.27 + 10, "g2")}
      {gear(2140, 520, 110, 11, f * 0.95, "g3")}
      {/* 右の棚 (引きで見える) */}
      <rect x={1990} y={140} width={380} height={18} fill={C.peg} stroke={KRP.ink} strokeWidth={4} />
      {[0, 1, 2].map((j) => (
        <rect key={j} x={2010 + j * 110} y={60} width={90} height={80} rx={6} fill={C.benchFront} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 吊りランプ */}
      <g transform={`rotate(${swing * 0.6} 980 -340)`}>
        <line x1={980} y1={-340} x2={980} y2={80} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 900 140 L 1060 140 L 1020 80 L 940 80 Z" fill={C.benchFrontDark} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={980} cy={144} rx={40} ry={16} fill={C.lamp} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="910,146 1050,146 1300,640 660,640" fill={C.lamp} opacity={0.16} />
      </g>
      {/* 札掛け (木の台) */}
      <g>
        {[690, 1242].map((px) => (
          <rect key={px} x={px} y={246} width={28} height={378} rx={6} fill={C.benchTop} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={666} y={232} width={600} height={30} rx={8} fill={C.benchTopLight} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={ND1C_NX} cy={258} r={8} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={640} y={612} width={650} height={32} rx={6} fill={C.benchFront} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </g>
  );
};
// 作業台の天板と前板 (人の手前に描く)
const ND1cBench: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-460} y={640} width={2840} height={64} fill={C.benchTop} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-460} y={640} width={2840} height={14} fill={C.benchTopLight} />
    <rect x={-460} y={704} width={2840} height={700} fill={C.benchFront} stroke={KRP.ink} strokeWidth={6} />
    {[-300, 160, 620, 1080, 1540, 2000].map((dx) => (
      <g key={dx}>
        <rect x={dx} y={740} width={380} height={150} rx={8} fill={C.benchFrontDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={dx + 160} y={800} width={60} height={20} rx={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    {/* 台の上の小物: 糸巻き3つ・定規・油さし */}
    {[[1580, NP.mimi], [1690, NP.chobo], [1800, NP.shinyo]].map(([sx, col], i) => (
      <g key={i} transform={`translate(${sx} 646)`}>
        <rect x={-34} y={-84} width={68} height={14} rx={4} fill={C.plank} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-26} y={-72} width={52} height={60} fill={col as string} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-34} y={-14} width={68} height={14} rx={4} fill={C.plank} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    <rect x={-200} y={652} width={300} height={20} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-3 -50 662)" />
    <g transform={`translate(560 640) rotate(${Math.sin(f / 20) * 1})`}>
      <path d="M -30 0 L 30 0 L 22 -50 L -22 -50 Z" fill={C.metal} stroke={KRP.ink} strokeWidth={4} />
      <line x1={10} y1={-50} x2={60} y2={-110} stroke={C.metal} strokeWidth={7} />
    </g>
  </g>
);
// 大きな真鍮のハサミ (支点が原点。刃は下向き。open は開き角度)
const ND1cScissors: React.FC<{ open: number }> = ({ open }) => {
  const piece = (dir: 1 | -1) => (
    <g transform={`rotate(${(dir * open) / 2})`}>
      <path d="M -12 -6 L 14 -6 Q 10 120 -2 236 Q -10 120 -12 -6 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
      <path d={`M ${dir * 4} 10 L ${dir * 2} 220`} stroke={KRP.white} strokeWidth={4} opacity={0.7} />
      <path d="M -14 0 L 14 0 L 14 -120 L -14 -120 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={dir * -14} cy={-176} r={52} fill="none" stroke={KRP.ink} strokeWidth={30} />
      <circle cx={dir * -14} cy={-176} r={52} fill="none" stroke={NP.brass} strokeWidth={20} />
    </g>
  );
  return (
    <g>
      {piece(1)}
      {piece(-1)}
      <circle r={20} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
      <line x1={-10} y1={0} x2={10} y2={0} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};
const Nm099: React.FC<{ f: number }> = ({ f }) => {
  const zin = easeOut(seg(f, 6, 14));
  const zout = easeInOut(seg(f, 26, 40));
  const sc = 1 + 0.07 * (zin - zout);
  const sag = 70;
  const [kx, ky] = nafudaKnot("mimi", ND1C_NX, ND1C_NY, ND1C_NS);
  const cutX = (kx + ND1C_EAR[0]) / 2;
  const cutY = (ky + ND1C_EAR[1]) / 2 + sag / 2;
  const desc = easeOut(seg(f, 0, 10));
  const rise = easeInOut(seg(f, 26, 38));
  const sY = cutY - 74 + lerp(-620, 0, desc) - rise * 110;
  const open = f < 12 ? 30 + Math.sin(f / 2) * 3 : f < 28 ? lerp(30, 2, seg(f, 12, 15)) : lerp(2, 18, seg(f, 28, 34));
  const cut = seg(f, 14, 24);
  const snip = seg(f, 14, 21);
  const blur = f < 26 ? 0 : f < 33 ? 0.7 * seg(f, 26, 33) : 0.7 * (1 - seg(f, 34, 41));
  const brushIn = seg(f, 22, 28);
  const brushRest = easeInOut(seg(f, 34, 41));
  const bx = lerp(1300, 1440, brushRest), by = lerp(330, 630, brushRest), br = lerp(-35, -88, brushRest);
  const shocked = f >= 16;
  const fs = Math.floor(330 / 5) * ND1C_NS;
  return (
    <Frame f={f} seed={4099} bg={C.wallWork}>
      <g transform={`translate(0 110) translate(${cutX} ${cutY}) scale(${sc}) translate(${-cutX} ${-cutY})`}>
        <ND1cWorkshop f={f} />
        {/* ナレーター役 (台の向こうに立つ) */}
        <ND1cGuy x={330} y={740} s={1.15} f={f} phase={2} cloth={C.narrator} clothDark={C.narratorDark}
          face={shocked ? "surprised" : "smile"} pose={shocked ? "banzai" : "stand"} gaze={[6, 0]} lean={shocked ? -5 : 0}
          over={<ellipse cx={64} cy={-218} rx={12} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />} />
        <ND1cBench f={f} />
        {/* 名札と耳の糸 */}
        <Ito from={[kx, ky]} to={ND1C_EAR} kind="mimi" t={1} sag={sag} cut={cut} f={f} />
        <Nafuda x={ND1C_NX} y={ND1C_NY} s={ND1C_NS} text="山田 花子" blur={blur} knots={{ mimi: 1 - cut * 0.7 }} f={f} />
        {/* 書きかわりかける別の名前 (ゆらぐ影) */}
        {blur > 0.05 && (
          <text x={ND1C_NX + Math.sin(f * 1.7) * 4} y={ND1C_NY + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs}
            fill={NP.sumi} opacity={blur * 0.75}>佐藤 春子</text>
        )}
        {/* 筆 (書きかえの手) */}
        {brushIn > 0 && (
          <g transform={`translate(${bx} ${by}) rotate(${br}) scale(${pop(brushIn)})`}>
            <rect x={-12} y={-230} width={24} height={210} rx={8} fill={C.kasa} stroke={KRP.ink} strokeWidth={4.5} />
            {[-190, -120].map((ny) => <line key={ny} x1={-12} y1={ny} x2={12} y2={ny} stroke={C.kasaDark} strokeWidth={4} />)}
            <path d="M -14 -22 L 14 -22 Q 14 20 0 50 Q -14 20 -14 -22 Z" fill={C.hairBlack} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {/* ハサミ */}
        <g transform={`translate(${cutX} ${sY})`}>
          <ND1cScissors open={open} />
        </g>
        {snip > 0 && snip < 1 && (
          <g opacity={1 - snip}>
            <circle cx={cutX} cy={cutY} r={30 + snip * 60} fill={NP.glowCore} opacity={0.6} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={cutX + Math.cos(a) * (40 + snip * 30)} y1={cutY + Math.sin(a) * (40 + snip * 30)} x2={cutX + Math.cos(a) * (70 + snip * 50)} y2={cutY + Math.sin(a) * (70 + snip * 50)} stroke={NP.glow} strokeWidth={7} strokeLinecap="round" />;
            })}
          </g>
        )}
      </g>
      <ItoLegend x={1620} y={90} s={0.9} lit={{ mimi: 1 }} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #100 では、もっと大きな仕組みが、名前を握ったら、どうなるのでしょうか。
// 格: 並 / seed 4100
// 絵: #99 の作業台を引きで。名札の上に、**巨大な手の影** (国の大きな仕組みの象徴・形は役所の印鑑を持った手) がゆっくりかぶさる。名札の下の結び目 (chobo) の金具がカチリと光る。`QMark`
// どこ: #99 と同じ作業場を引きで (棚・天井の梁・3つの歯車まで見える)。耳の糸は切れたまま垂れている
// 演出: 右上から、役所の大きな印鑑を握った巨大な手の「影」がゆっくり名札にかぶさる。名札の下の結び目 (帳簿の金具) がカチリと光る。「？」
// 動き: カメラがさらに引く / 手の影が近づき大きくなり、部屋が少し暗くなる / 結び目が光ってはじける (f30-38) / ナレーター役が見上げる / ？が出る
const ND1cHandShadow: React.FC = () => (
  <g fill={C.shadowHand}>
    {/* 腕と袖 (右上の外へ) */}
    <path d="M 40 -300 L 160 -360 L 900 -1300 L 520 -1400 L -60 -380 Z" />
    <path d="M 120 -400 L 260 -470 L 300 -430 L 170 -350 Z" />
    {/* 握りこぶし */}
    <rect x={-120} y={-420} width={250} height={170} rx={60} />
    {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={-90 + i * 62} cy={-250} rx={36} ry={34} />)}
    <ellipse cx={-130} cy={-340} rx={46} ry={70} transform="rotate(-20 -130 -340)" />
    {/* 印鑑の柄と印面 */}
    <rect x={-50} y={-470} width={100} height={60} rx={30} />
    <rect x={-70} y={-250} width={140} height={230} rx={10} />
    <rect x={-84} y={-40} width={168} height={40} rx={6} />
  </g>
);
const Nm100: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(0.86, 0.74, easeInOut(seg(f, 0, 42)));
  const hand = easeInOut(seg(f, 0, 40));
  const hx = lerp(1540, 990, hand), hy = lerp(120, 560, hand), hs = lerp(0.95, 1.1, hand);
  const dim = 0.16 * hand;
  const click = seg(f, 30, 34);
  const burst = seg(f, 30, 38);
  const [kx, ky] = nafudaKnot("mimi", ND1C_NX, ND1C_NY, ND1C_NS);
  const [cx2, cy2] = nafudaKnot("chobo", ND1C_NX, ND1C_NY, ND1C_NS);
  return (
    <Frame f={f} seed={4100} bg={C.wallWork}>
      <g transform={`translate(0 90) translate(960 520) scale(${sc}) translate(-960 -520)`}>
        <ND1cWorkshop f={f} />
        <ND1cGuy x={330} y={740} s={1.15} f={f} phase={2} cloth={C.narrator} clothDark={C.narratorDark}
          face={f < 20 ? "worried" : "surprised"} pose="stand" gaze={[5, -6]} lean={-3}
          over={<ellipse cx={64} cy={-218} rx={12} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />} />
        <ND1cBench f={f} />
        {/* 台の上に置かれたハサミと筆 (#99 の続き) */}
        <g transform="translate(-60 596) rotate(-92)">
          <ND1cScissors open={14} />
        </g>
        <g transform="translate(1440 630) rotate(-88)">
          <rect x={-12} y={-230} width={24} height={210} rx={8} fill={C.kasa} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -14 -22 L 14 -22 Q 14 20 0 50 Q -14 20 -14 -22 Z" fill={C.hairBlack} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <Ito from={[kx, ky]} to={ND1C_EAR} kind="mimi" t={1} sag={70} cut={1} f={f} />
        <Nafuda x={ND1C_NX} y={ND1C_NY} s={ND1C_NS} text="山田 花子" knots={{ mimi: 0.3, chobo: click }} f={f} />
        {/* 帳簿の金具がカチリ */}
        {burst > 0 && burst < 1 && (
          <g opacity={1 - burst}>
            <circle cx={cx2} cy={cy2} r={20 + burst * 70} fill="none" stroke={NP.glow} strokeWidth={8} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2 + 0.3;
              return <line key={i} x1={cx2 + Math.cos(a) * (36 + burst * 30)} y1={cy2 + Math.sin(a) * (36 + burst * 30)} x2={cx2 + Math.cos(a) * (66 + burst * 50)} y2={cy2 + Math.sin(a) * (66 + burst * 50)} stroke={NP.glow} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        {click > 0 && <circle cx={cx2} cy={cy2} r={30} fill={NP.glowCore} opacity={0.5 + Math.sin(f / 2) * 0.15} />}
      </g>
      {/* 部屋が暗くなる */}
      <rect x={0} y={0} width={W} height={H} fill={C.shadowHand} opacity={dim} />
      {/* 巨大な手の影 */}
      <g transform={`translate(${hx} ${hy}) scale(${hs}) rotate(${lerp(12, 4, hand)})`} opacity={0.55}>
        <ND1cHandShadow />
      </g>
      {/* 名札に落ちる印面の影 */}
      <ellipse cx={hx + 10} cy={570} rx={lerp(60, 170, hand)} ry={lerp(20, 60, hand)} fill={C.shadowHand} opacity={0.3 * hand} />
      <QMark x={1330} y={340} s={1.1} f={f} t={seg(f, 34, 41)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_094: (f) => <Nm094 f={f} />,
  nm_095: (f) => <Nm095 f={f} />,
  nm_096: (f) => <Nm096 f={f} />,
  nm_097: (f) => <Nm097 f={f} />,
  nm_098: (f) => <Nm098 f={f} />,
  nm_099: (f) => <Nm099 f={f} />,
  nm_100: (f) => <Nm100 f={f} />,
};

export const NM_D1C_MOTIFS: string[] = [
  "nm_094", // #94
  "nm_095", // #95
  "nm_096", // #96
  "nm_097", // #97
  "nm_098", // #98
  "nm_099", // #99
  "nm_100", // #100
];

export const namaeD1cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
