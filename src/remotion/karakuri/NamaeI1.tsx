// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#194〜#202 (9文)
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
// 第8章は真面目なトーン: 彩度を少し落とした色でそろえる
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // #194 夜明け前の部屋
  night: "#2B3040",
  wallNight: "#3C4458",
  wallLow: "#333A4C",
  dawnWarm: "#E8B48A",
  skyNight: "#34405E",
  skyDawn1: "#7F8FB5",
  skyDawn2: "#E9B98A",
  roofSil: "#232838",
  curtain: "#6E6685",
  curtainDark: "#585170",
  tatami: "#9C9A6E",
  tatamiDark: "#7F7D56",
  heri: "#3E4A3A",
  vanity: "#7A5A3E",
  vanityDark: "#5A3F2B",
  vanityTop: "#8E6A48",
  glass: "#9FB3C2",
  glassDark: "#5F7486",
  // #195〜#197 映写の部屋
  theater: "#24222B",
  theaterWall: "#34303C",
  velvet: "#7A3B3B",
  velvetDark: "#5C2A2C",
  screenOff: "#3A3A44",
  screenOn: "#F6EDD3",
  metal: "#5E6470",
  metalDark: "#434852",
  seat: "#2A2630",
  shadow: "#2A2630",
  // #196 湯屋の柱 (映写の中)
  yuWall: "#6E4632",
  yuWallDark: "#563424",
  pillar: "#B5523C",
  pillarDark: "#8E3C2C",
  lantern: "#F0C070",
  yuFloor: "#7C5A3A",
  // #198 回り舞台
  homeWall: "#F1E3C0",
  apron: "#E3A9A0",
  apronDark: "#C98A80",
  homeCloth: "#C9B48A",
  homeClothDark: "#A8936A",
  suit: "#4A5468",
  suitDark: "#363E50",
  knit: "#9C6B7E",
  knitDark: "#7C5262",
  friend: "#7FA88A",
  friendDark: "#5F8A6C",
  officeWall: "#DCE3E6",
  cafeWall: "#5A4636",
  cafeWallDark: "#463628",
  stageWood: "#B98A55",
  stageDark: "#8C6438",
  valance: "#7A3B3B",
  hairBun: "#2E2723",
  // #199 楽屋
  backWall: "#4E5A5C",
  backWallDark: "#3E4849",
  concrete: "#8C8C86",
  doorFace: "#C2A27A",
  doorFaceDark: "#A3835C",
  doorFrame: "#6B4E33",
  roomWarm: "#F0D9AE",
  bulb: "#FFF0C0",
  // #200 作業台
  workWall: "#C9BFA8",
  peg: "#B3A88E",
  benchTop: "#B88A56",
  benchDark: "#8E6438",
  // #201 役所の窓口
  hallWall: "#E4E0D4",
  counterTop: "#C9B48E",
  counterFace: "#9C8466",
  frost: "#DDE6EA",
  clerk: "#6F7C8E",
  clerkDark: "#566273",
  dress: "#EFE4DF",
  dressDark: "#D6C7C1",
  hairBride: "#3A2E28",
  // #202 机とクリップボード
  desk: "#A57B4E",
  deskDark: "#80592F",
  clipBoard: "#9C7448",
  paper: "#FBF8EF",
  iconOff: "#D4CDBE",
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

// 歯車 (#200 の台座)
const NI1Gear: React.FC<{ x: number; y: number; r: number; teeth: number; rot: number; fill: string }> = ({ x, y, r, teeth, rot, fill }) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r : r * 0.82;
    const a2 = a + Math.PI / (teeth * 2);
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
    pts.push(`${(Math.cos(a2) * rr).toFixed(1)},${(Math.sin(a2) * rr).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle r={r * 0.45} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      <circle r={r * 0.16} fill={KRP.ink} />
    </g>
  );
};

// 胸の名札 (#198)。Person のローカル座標 (足元=0,0) で描く
const NI1ChestTag: React.FC<{ text: string; size?: number; t: number; fill?: string }> = ({ text, size = 28, t, fill = KRP.white }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = Array.from(text).length * size + 24;
  return (
    <g transform={`translate(0 -136) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.75} width={w} height={size * 1.5} rx={7} fill={fill} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-size * 0.75} r={5} fill={NP.brass} stroke={KRP.ink} strokeWidth={2.5} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={KRP.ink}>{text}</text>
    </g>
  );
};

// 映写機 (#195・#197 で同じ形)。x,y は本体の中心。dir=1 で右上へ光を出す
const NI1Projector: React.FC<{ x: number; y: number; s?: number; f: number; lensRot?: number }> = ({ x, y, s = 1, f, lensRot = -20 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 三脚 */}
    <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
      <line x1={0} y1={60} x2={-90} y2={190} />
      <line x1={0} y1={60} x2={90} y2={190} />
      <line x1={0} y1={60} x2={0} y2={200} />
    </g>
    <g stroke={C.metal} strokeWidth={3} strokeLinecap="round">
      <line x1={0} y1={62} x2={-88} y2={186} />
      <line x1={0} y1={62} x2={88} y2={186} />
    </g>
    {/* フィルムの輪 */}
    <path d="M -70 -90 Q -110 -10 -80 40 M 70 -100 Q 110 -20 90 30" stroke={KRP.ink} strokeWidth={5} fill="none" />
    {/* リール 2つ (回る) */}
    {[[-70, -110, 1], [70, -120, -1]].map(([rx, ry, d], i) => (
      <g key={i} transform={`translate(${rx} ${ry}) rotate(${f * 5 * d})`}>
        <circle r={62} fill={C.metalDark} stroke={KRP.ink} strokeWidth={6} />
        <circle r={50} fill={C.metal} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={Math.cos((k * 2 * Math.PI) / 3) * 28} cy={Math.sin((k * 2 * Math.PI) / 3) * 28} r={13} fill={C.theater} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <circle r={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
    {/* 本体 */}
    <rect x={-120} y={-60} width={240} height={120} rx={18} fill={C.metal} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-104} y={-44} width={120} height={40} rx={8} fill={C.metalDark} stroke={KRP.ink} strokeWidth={3} />
    {[0, 1, 2, 3].map((k) => <line key={k} x1={-96 + k * 28} y1={14} x2={-96 + k * 28} y2={46} stroke={C.metalDark} strokeWidth={6} strokeLinecap="round" />)}
    <circle cx={50} cy={20} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
    {/* レンズ */}
    <g transform={`translate(110 -10) rotate(${lensRot})`}>
      <rect x={0} y={-30} width={70} height={60} rx={8} fill={C.metalDark} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={72} cy={0} rx={12} ry={30} fill={NP.glowCore} stroke={KRP.ink} strokeWidth={5} />
    </g>
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #194 第8章、名前を変えると、自分は変わるのか。
// 格: 山 / seed 4194
// どこ: 夜明け前の和室。左に鏡台 (大きな楕円の鏡)、右上に窓、壁に時計。畳の床
// 演出: 鏡台の上の名札ははっきり読める。鏡に映った名札だけ字がかすれていく (鏡の中と外で違う)
// 動き: 窓の外がうっすら明るくなる / 鏡の中の字が f8〜38 でかすれる / 秒針・カーテンのゆれ / カメラが鏡へゆっくり寄る
const Nm194: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const dawn = easeOut(seg(f, 0, 40));
  const blurR = easeInOut(seg(f, 8, 38)) * 0.8;
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const sway = Math.sin(f / 28) * 6;
  return (
    <Frame f={f} seed={4194} bg={C.night} dark over={<>
      <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
        background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
      <ChapterDoor num={8} title="名前を変えると、自分は変わるのか" t={door} left={1000} top={560} width={880} />
    </>}>
      <defs>
        <linearGradient id="ni1-194-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyNight} />
          <stop offset="1" stopColor={C.wallNight} />
        </linearGradient>
        <linearGradient id="ni1-194-dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyDawn1} />
          <stop offset="0.7" stopColor={C.skyDawn2} />
          <stop offset="1" stopColor={NP.glowCore} />
        </linearGradient>
        <radialGradient id="ni1-194-glass" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={C.glass} />
          <stop offset="1" stopColor={C.glassDark} />
        </radialGradient>
        <clipPath id="ni1-194-mirror"><ellipse cx={490} cy={340} rx={206} ry={232} /></clipPath>
        <clipPath id="ni1-194-win"><rect x={1110} y={90} width={600} height={360} /></clipPath>
      </defs>
      <g transform={`translate(490 380) scale(${cam}) translate(-490 -380)`}>
        {/* 壁 */}
        <rect x={-60} y={-60} width={W + 120} height={880} fill={C.wallNight} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 150 - 20} y1={-60} x2={i * 150 - 20} y2={600} stroke={C.wallLow} strokeWidth={4} opacity={0.6} />
        ))}
        <rect x={-60} y={600} width={W + 120} height={170} fill={C.wallLow} />
        <rect x={-60} y={596} width={W + 120} height={14} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 夜明けの色が壁に回る */}
        <rect x={-60} y={-60} width={W + 120} height={830} fill={C.dawnWarm} opacity={0.12 * dawn} />
        {/* 窓 */}
        <rect x={1088} y={68} width={644} height={404} rx={8} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={8} />
        <g clipPath="url(#ni1-194-win)">
          <rect x={1110} y={90} width={600} height={360} fill="url(#ni1-194-sky)" />
          <rect x={1110} y={90} width={600} height={360} fill="url(#ni1-194-dawn)" opacity={0.85 * dawn} />
          {/* 消えていく星 */}
          {[[1180, 130], [1300, 170], [1460, 120], [1620, 160], [1560, 220]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={4 + (i % 2) * 2} fill={NP.glowCore} opacity={(1 - dawn) * (0.6 + 0.4 * Math.sin(f / 5 + i))} />
          ))}
          {/* 地平の光 */}
          <ellipse cx={1420} cy={450} rx={260} ry={90} fill={NP.glow} opacity={0.55 * dawn} />
          {/* 遠くの屋根並み */}
          <path d="M 1110 450 L 1110 380 L 1170 350 L 1230 380 L 1230 360 L 1300 330 L 1370 365 L 1370 395 L 1440 395 L 1440 350 L 1520 320 L 1600 355 L 1600 375 L 1660 345 L 1710 370 L 1710 450 Z"
            fill={C.roofSil} stroke={KRP.ink} strokeWidth={3} />
          {[[1180, 400], [1320, 380], [1540, 370]].map(([wx, wy], i) => (
            <rect key={i} x={wx} y={wy} width={14} height={14} fill={NP.glow} opacity={0.3 + 0.5 * dawn * (i % 2)} />
          ))}
        </g>
        {/* 窓の桟 */}
        <line x1={1410} y1={90} x2={1410} y2={450} stroke={C.vanityDark} strokeWidth={12} />
        <line x1={1110} y1={270} x2={1710} y2={270} stroke={C.vanityDark} strokeWidth={10} />
        <rect x={1076} y={462} width={668} height={22} rx={4} fill={C.vanityTop} stroke={KRP.ink} strokeWidth={5} />
        {/* カーテン (ゆれる) */}
        <path d={`M 1070 50 L 1170 50 Q ${1150 + sway} 260 ${1180 + sway} 480 L 1060 480 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 1100 60 Q ${1110 + sway * 0.6} 260 ${1120 + sway} 470`} stroke={C.curtainDark} strokeWidth={6} fill="none" />
        <path d={`M 1750 50 L 1650 50 Q ${1670 - sway} 260 ${1640 - sway} 480 L 1760 480 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 1720 60 Q ${1710 - sway * 0.6} 260 ${1700 - sway} 470`} stroke={C.curtainDark} strokeWidth={6} fill="none" />
        <rect x={1040} y={40} width={740} height={16} rx={8} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 壁の時計 (夜明け前・秒針が回る) */}
        <g transform="translate(930 190)">
          <circle r={66} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={6} />
          <circle r={54} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} opacity={0.85} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 44} y1={Math.sin(a) * 44} x2={Math.cos(a) * 50} y2={Math.sin(a) * 50} stroke={KRP.ink} strokeWidth={i % 3 ? 2.5 : 5} />;
          })}
          <line x1={0} y1={0} x2={0} y2={-26} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform="rotate(148)" />
          <line x1={0} y1={0} x2={0} y2={-40} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform="rotate(300)" />
          <line x1={0} y1={6} x2={0} y2={-46} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${f * 6})`} />
          <circle r={5} fill={KRP.ink} />
        </g>
        {/* 窓からの光の筋が床へ */}
        <polygon points="1110,470 1710,470 1560,1080 760,1080" fill={NP.glowCore} opacity={0.14 * dawn} />
        {/* 畳 */}
        <rect x={-60} y={766} width={W + 120} height={380} fill={C.tatami} />
        {Array.from({ length: 40 }, (_, i) => (
          <line key={i} x1={-60} y1={780 + i * 8} x2={W + 60} y2={780 + i * 8} stroke={C.tatamiDark} strokeWidth={1.5} opacity={0.5} />
        ))}
        <rect x={-60} y={766} width={W + 120} height={12} fill={C.heri} />
        <rect x={880} y={766} width={14} height={380} fill={C.heri} />
        <polygon points="1110,770 1710,770 1560,1080 760,1080" fill={NP.glow} opacity={0.18 * dawn} />
        {/* 座布団 (鏡台の前) */}
        <ellipse cx={490} cy={960} rx={190} ry={52} fill={C.curtainDark} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={490} cy={952} rx={150} ry={36} fill={C.curtain} opacity={0.8} />
        {/* ===== 鏡台 ===== */}
        <ellipse cx={490} cy={830} rx={300} ry={26} fill={KRP.ink} opacity={0.35} />
        {/* 鏡の支柱 */}
        <rect x={244} y={150} width={28} height={460} rx={6} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={708} y={150} width={28} height={460} rx={6} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={5} />
        {[258, 722].map((px) => <circle key={px} cx={px} cy={340} r={12} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 鏡の枠 */}
        <ellipse cx={490} cy={340} rx={236} ry={262} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={490} cy={340} rx={222} ry={248} fill="none" stroke={C.vanityTop} strokeWidth={6} />
        <ellipse cx={490} cy={340} rx={206} ry={232} fill="url(#ni1-194-glass)" stroke={KRP.ink} strokeWidth={5} />
        {/* 鏡の中 */}
        <g clipPath="url(#ni1-194-mirror)">
          {/* 映りこんだ部屋の奥 (畳の線) */}
          <rect x={280} y={470} width={420} height={120} fill={C.glassDark} opacity={0.6} />
          <line x1={280} y1={470} x2={700} y2={470} stroke={C.heri} strokeWidth={6} opacity={0.5} />
          {/* 夜明けの光の映りこみ */}
          <rect x={300} y={140} width={120} height={150} fill={NP.glowCore} opacity={0.12 + 0.25 * dawn} transform="skewX(-12)" />
          {/* 映った名札 (左右反転・字だけがかすれる) */}
          <g transform="translate(490 440) scale(-1 1)" opacity={0.9}>
            <Nafuda x={0} y={0} s={0.46} text="山田 花子" blur={blurR} hang={false} f={f + 30} />
          </g>
          <ellipse cx={490} cy={440} rx={110 + blurR * 40} ry={60 + blurR * 20} fill="none" stroke={NP.glowCore} strokeWidth={3} opacity={blurR * 0.5 * (0.6 + 0.4 * Math.sin(f / 4))} />
          <rect x={280} y={100} width={420} height={500} fill={C.glass} opacity={0.18} />
          {/* ガラスのつや */}
          <path d="M 350 170 L 430 120" stroke={KRP.white} strokeWidth={10} opacity={0.3} strokeLinecap="round" />
          <path d="M 360 210 L 470 140" stroke={KRP.white} strokeWidth={5} opacity={0.22} strokeLinecap="round" />
        </g>
        <circle cx={490} cy={80} r={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 台の天板と引き出し */}
        <rect x={210} y={590} width={560} height={26} rx={6} fill={C.vanityTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={232} y={614} width={516} height={206} rx={6} fill={C.vanity} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1].map((r) => [0, 1].map((c) => (
          <g key={`${r}${c}`}>
            <rect x={252 + c * 248} y={632 + r * 96} width={228} height={78} rx={6} fill={C.vanityTop} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${330 + c * 248} ${671 + r * 96} q 36 -12 72 0`} stroke={KRP.ink} strokeWidth={5} fill="none" />
            <circle cx={366 + c * 248} cy={671 + r * 96} r={7} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )))}
        {/* 天板の小物: くし・小瓶・刷毛 */}
        <g transform="translate(300 584) rotate(-8)">
          <rect x={-46} y={-14} width={92} height={16} rx={6} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-40 + i * 10} y1={2} x2={-40 + i * 10} y2={14} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        <g transform="translate(690 590)">
          <rect x={-22} y={-56} width={44} height={56} rx={10} fill={C.glass} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
          <rect x={-12} y={-74} width={24} height={20} rx={4} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-40} width={10} height={30} rx={4} fill={KRP.white} opacity={0.4} />
        </g>
        <g transform="translate(630 588) rotate(18)">
          <rect x={-6} y={-60} width={12} height={50} rx={5} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -12 -10 L 12 -10 L 8 4 L -8 4 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 本物の名札 (札立てに立てる・字ははっきり) */}
        <rect x={430} y={586} width={120} height={10} rx={4} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={3} />
        <Nafuda x={490} y={540} s={0.55} text="山田 花子" hang={false} f={f} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #195 映画の、2つ目の怖さを思い出してください。
// 格: 並 / seed 4195
// どこ: 序と同じ映写の部屋。暗い壁に光の窓が2つ、手前に映写機、下に客席の背もたれ
// 演出: 左の窓「帰り道」は暗いまま。右の窓「元の自分」だけに映写機の光が当たって灯る
// 動き: 光の筋が f6〜24 で右の窓へ伸び、窓がちらついて灯る / リールが回る / 光の中のホコリ / カメラがゆっくり右へ
const Nm195: React.FC<{ f: number }> = ({ f }) => {
  const beam = easeOut(seg(f, 6, 22));
  const on = easeOut(seg(f, 12, 30));
  const flick = on > 0 && on < 1 ? 0.7 + 0.3 * Math.abs(Math.sin(f * 2.3)) : 1;
  const pan = -36 * easeInOut(seg(f, 0, 42));
  const lens: [number, number] = [1062, 664];
  return (
    <Frame f={f} seed={4195} bg={C.theater} dark>
      <defs>
        <linearGradient id="ni1-195-beam" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={0.9} />
          <stop offset="1" stopColor={NP.glow} stopOpacity={0.25} />
        </linearGradient>
      </defs>
      <g transform={`translate(${pan} 0)`}>
        {/* 壁と天井 */}
        <rect x={-80} y={-40} width={W + 160} height={H + 80} fill={C.theaterWall} />
        <rect x={-80} y={-40} width={W + 160} height={80} fill={C.theater} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={i * 180 - 60} y={40} width={8} height={760} fill={C.theater} opacity={0.35} />
        ))}
        {/* 両脇のビロードの幕 */}
        {[[-80, 1], [W + 80, -1]].map(([ex, d], i) => (
          <g key={i}>
            <path d={`M ${ex} -40 L ${ex + d * 230} -40 Q ${ex + d * 170} 400 ${ex + d * 210} 860 L ${ex} 860 Z`} fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
            {[60, 120, 170].map((k) => (
              <path key={k} d={`M ${ex + d * k} -30 Q ${ex + d * (k - 20 + Math.sin(f / 20 + k) * 4)} 400 ${ex + d * (k + 10)} 850`} stroke={C.velvetDark} strokeWidth={8} fill="none" />
            ))}
          </g>
        ))}
        {/* 左の窓 (暗い) */}
        <rect x={238} y={108} width={624} height={424} rx={10} fill={C.theater} stroke={KRP.ink} strokeWidth={8} />
        <rect x={258} y={128} width={584} height={384} fill={C.screenOff} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={272 + i * 58} y={136} width={22} height={12} rx={3} fill={C.theater} opacity={0.7} />
        ))}
        <path d="M 300 480 Q 460 400 550 330 Q 640 270 800 250" stroke={C.theaterWall} strokeWidth={14} fill="none" opacity={0.6} strokeDasharray="20 18" />
        {/* 右の窓 (灯る) */}
        <rect x={1046} y={100} width={648} height={440} fill={NP.glow} opacity={0.22 * on} />
        <rect x={1058} y={108} width={624} height={424} rx={10} fill={C.theater} stroke={KRP.ink} strokeWidth={8} />
        <rect x={1078} y={128} width={584} height={384} fill={C.screenOff} />
        <rect x={1078} y={128} width={584} height={384} fill={C.screenOn} opacity={on * flick} />
        {/* 灯った窓の中にうっすら次の絵 (柱と札の影) */}
        <g opacity={0.35 * on}>
          <rect x={1290} y={128} width={110} height={384} fill={C.pillar} />
          <rect x={1250} y={280} width={190} height={90} rx={12} fill={NP.wood} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={1092 + i * 58} y={136} width={22} height={12} rx={3} fill={C.theater} opacity={0.5} />
        ))}
        {/* 光の筋 */}
        {beam > 0 && (
          <g opacity={beam}>
            <polygon points={`${lens[0]},${lens[1]} ${lerp(lens[0], 1078, beam)},${lerp(lens[1], 512, beam)} ${lerp(lens[0], 1078, beam)},${lerp(lens[1], 128, beam)} ${lerp(lens[0], 1662, beam)},${lerp(lens[1], 128, beam)} ${lerp(lens[0], 1662, beam)},${lerp(lens[1], 512, beam)}`}
              fill="url(#ni1-195-beam)" opacity={0.45} />
            {Array.from({ length: 14 }, (_, i) => {
              const u = (rnd(4195, i) + f * 0.004 * (1 + rnd(4196, i))) % 1;
              const v = rnd(4197, i);
              const px = lerp(lens[0], 1100 + v * 540, u);
              const py = lerp(lens[1], 150 + v * 340, u) + Math.sin(f / 7 + i) * 6;
              return <circle key={i} cx={px} cy={py} r={2.5 + rnd(4198, i) * 3} fill={NP.glowCore} opacity={0.7 * Math.sin(u * Math.PI)} />;
            })}
          </g>
        )}
        {/* 窓の下の木の札 */}
        <TagPlate x={550} y={600} text="帰り道がわからなくなる" size={38} fill="#8E8778" color={C.theater} />
        <TagPlate x={1370} y={600} text="元の自分を忘れる" size={42} fill={NP.wood} t={seg(f, 2, 12)} />
        {/* 映写機 */}
        <NI1Projector x={960} y={700} f={f} lensRot={-28} />
        {/* 客席の背もたれ */}
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <path d={`M ${i * 190 - 40} 1090 L ${i * 190 - 40} 900 Q ${i * 190 + 50} 860 ${i * 190 + 140} 900 L ${i * 190 + 140} 1090 Z`} fill={C.seat} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${i * 190 - 20} 920 Q ${i * 190 + 50} 890 ${i * 190 + 120} 920`} stroke={C.velvetDark} strokeWidth={6} fill="none" />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #196 名前をなくすと、元の自分を忘れてしまう。
// 格: 山 / seed 4196
// どこ: 右の光の窓の中 = 映写された湯屋の柱。赤い柱・提灯・板壁・湯気。千の後ろ姿が柱の札を見上げる
// 演出: 柱に吊られた名札の字が、見ているうちにかすれて読めなくなる。フィルムの傷とちらつき
// 動き: カメラが窓の中の名札へ寄る / blur 0→0.8 (f10〜38) / 提灯のゆれ・湯気 / フィルムの傷が流れる
const Nm196: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.2 * easeInOut(seg(f, 0, 40));
  const blur = 0.8 * easeInOut(seg(f, 10, 38));
  const flick = 0.92 + 0.08 * Math.sin(f * 1.9);
  const lanSway = Math.sin(f / 16) * 4;
  return (
    <Frame f={f} seed={4196} bg={C.theater} dark>
      <defs>
        <clipPath id="ni1-196-win"><rect x={300} y={70} width={1320} height={630} /></clipPath>
        <radialGradient id="ni1-196-vig" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0.6" stopColor={C.theater} stopOpacity={0} />
          <stop offset="1" stopColor={C.theater} stopOpacity={0.75} />
        </radialGradient>
      </defs>
      <g transform={`translate(760 400) scale(${cam}) translate(-760 -400)`}>
        {/* 映写室の暗い壁 */}
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.theaterWall} />
        <rect x={286} y={56} width={1348} height={658} fill={NP.glow} opacity={0.2} />
        {/* ===== 窓の中 (映写の絵) ===== */}
        <g clipPath="url(#ni1-196-win)" opacity={flick}>
          <rect x={300} y={70} width={1320} height={630} fill={C.yuWall} />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i}>
              <line x1={300 + i * 115} y1={70} x2={300 + i * 115} y2={600} stroke={C.yuWallDark} strokeWidth={6} />
              <circle cx={300 + i * 115 + 57} cy={120 + (i % 3) * 140} r={3} fill={C.yuWallDark} />
            </g>
          ))}
          {/* 上の梁 */}
          <rect x={300} y={70} width={1320} height={62} fill={C.pillarDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={300} y={132} width={1320} height={14} fill={C.yuWallDark} />
          {/* 床板 */}
          <rect x={300} y={600} width={1320} height={100} fill={C.yuFloor} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={300 + i * 190} y1={600} x2={260 + i * 190} y2={700} stroke={C.yuWallDark} strokeWidth={4} />
          ))}
          {/* 提灯 (ゆれる) */}
          {[[430, 0], [1200, 1]].map(([lx, k]) => (
            <g key={lx} transform={`translate(${lx} 146) rotate(${lanSway * (k ? -1 : 1)})`}>
              <line x1={0} y1={0} x2={0} y2={40} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={0} cy={110} r={92} fill={NP.glow} opacity={0.18} />
              <ellipse cx={0} cy={110} rx={56} ry={70} fill={C.lantern} stroke={KRP.ink} strokeWidth={6} />
              {[-40, -14, 14, 40].map((dy) => (
                <path key={dy} d={`M -54 ${110 + dy} Q 0 ${116 + dy} 54 ${110 + dy}`} stroke={C.pillarDark} strokeWidth={3} fill="none" opacity={0.6} />
              ))}
              <rect x={-30} y={34} width={60} height={14} rx={4} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-30} y={172} width={60} height={14} rx={4} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          {/* 赤い柱 */}
          <rect x={672} y={140} width={176} height={470} fill={C.pillar} stroke={KRP.ink} strokeWidth={7} />
          <rect x={690} y={140} width={26} height={470} fill={KRP.white} opacity={0.14} />
          <rect x={806} y={140} width={30} height={470} fill={C.pillarDark} opacity={0.6} />
          <rect x={656} y={590} width={208} height={32} rx={6} fill={C.metal} stroke={KRP.ink} strokeWidth={5} />
          <rect x={662} y={150} width={196} height={24} rx={4} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 釘と名札 (字がかすれていく) */}
          <circle cx={760} cy={258} r={8} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={760} cy={400} r={230} fill={NP.glowCore} opacity={0.04 + 0.05 * blur} />
          <Nafuda x={760} y={404} s={0.95} text="山田 花子" blur={blur} f={f} />
          {/* 千の後ろ姿 (札を見上げる) */}
          <Ushiro kind="sen" x={1250} y={690} s={0.95} f={f} turn={-0.5} />
          {/* 湯気 */}
          {Array.from({ length: 4 }, (_, i) => {
            const u = ((f * 0.012 + i * 0.25) % 1);
            return (
              <path key={i} d={`M ${980 + i * 140} ${640 - u * 380} q 20 -30 0 -60 q -20 -30 0 -60`}
                stroke={KRP.white} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.28 * Math.sin(u * Math.PI)} />
            );
          })}
          {/* フィルムの傷とつぶつぶ */}
          {[0, 1, 2].map((i) => {
            const sx = 300 + ((f * (23 + i * 17) + i * 400) % 1320);
            return <line key={i} x1={sx} y1={70} x2={sx + 6} y2={700} stroke={KRP.white} strokeWidth={2} opacity={0.25} />;
          })}
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={i} cx={300 + rnd(f % 7 + 1, i) * 1320} cy={70 + rnd(f % 5 + 11, i) * 630} r={2 + rnd(3, i) * 2} fill={KRP.ink} opacity={0.3} />
          ))}
          <rect x={300} y={70} width={1320} height={630} fill="url(#ni1-196-vig)" />
        </g>
        {/* 窓のふち (光の当たる壁) */}
        <rect x={300} y={70} width={1320} height={630} fill="none" stroke={C.theater} strokeWidth={10} />
      </g>
      {/* 客席の背もたれ (#195 と同じ部屋) */}
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <path d={`M ${i * 190 - 40} 1090 L ${i * 190 - 40} 900 Q ${i * 190 + 50} 860 ${i * 190 + 140} 900 L ${i * 190 + 140} 1090 Z`} fill={C.seat} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${i * 190 - 20} 920 Q ${i * 190 + 50} 890 ${i * 190 + 120} 920`} stroke={C.velvetDark} strokeWidth={6} fill="none" />
        </g>
      ))}
      {/* 窓の手前の木の札 (カメラの外に置く) */}
      <TagPlate x={960} y={778} text="元の自分を忘れる" size={44} fill={NP.wood} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #197 これは、本当でしょうか。
// 格: 並 / seed 4197
// どこ: 同じ映写の部屋を横から。左に映写機、右の壁に光のスクリーン
// 演出: ナレーター役が映写機の光の中へ歩み入り、こちらを振り返る。スクリーンに大きな影絵が映り、影にも？
// 動き: 歩み入る (f0〜16) → 振り返る (f16〜26・視線と体の傾き) → ？がぽんと出る (f26〜34) / リール・ホコリ / カメラが少し寄る
const Nm197: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 0, 16));
  const turn = easeInOut(seg(f, 16, 26));
  const qm = seg(f, 26, 34);
  const px = lerp(660, 860, walk);
  const cam = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  const lens: [number, number] = [318, 566];
  const sx = lerp(1330, 1440, walk); // 影の位置
  const shTilt = lerp(6, -4, turn);
  return (
    <Frame f={f} seed={4197} bg={C.theater} dark>
      <defs>
        <linearGradient id="ni1-197-beam" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={0.85} />
          <stop offset="1" stopColor={NP.glow} stopOpacity={0.3} />
        </linearGradient>
        <clipPath id="ni1-197-scr"><rect x={1120} y={110} width={700} height={590} /></clipPath>
      </defs>
      <g transform={`translate(900 540) scale(${cam}) translate(-900 -540)`}>
        <rect x={-80} y={-60} width={W + 160} height={H + 120} fill={C.theaterWall} />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={i * 190 - 40} y={-60} width={8} height={850} fill={C.theater} opacity={0.35} />
        ))}
        {/* 床 */}
        <rect x={-80} y={790} width={W + 160} height={400} fill={C.yuFloor} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-80} y1={800 + i * 34} x2={W + 80} y2={800 + i * 34} stroke={C.yuWallDark} strokeWidth={3} opacity={0.7} />
        ))}
        <rect x={-80} y={784} width={W + 160} height={12} fill={C.theater} />
        {/* スクリーン */}
        <rect x={1100} y={90} width={740} height={630} rx={8} fill={C.theater} stroke={KRP.ink} strokeWidth={8} />
        <rect x={1120} y={110} width={700} height={590} fill={C.screenOn} />
        <g clipPath="url(#ni1-197-scr)">
          {/* 影絵 (人の影が大きく映る) */}
          <g opacity={0.85 * walk} transform={`translate(${sx} 760) scale(1.55) rotate(${shTilt})`}>
            <rect x={-60} y={-160} width={120} height={160} rx={18} fill={C.shadow} />
            <rect x={-80} y={-150} width={24} height={86} rx={12} fill={C.shadow} />
            <rect x={56} y={-150} width={24} height={86} rx={12} fill={C.shadow} />
            <circle cx={0} cy={-228} r={66} fill={C.shadow} />
          </g>
          {/* 影の？ */}
          {qm > 0 && (
            <text x={sx + 170} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190 * pop(qm)} fill={C.shadow} opacity={0.75}>？</text>
          )}
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={1120 + rnd(f % 6 + 2, i) * 700} cy={110 + rnd(f % 4 + 9, i) * 590} r={2.5} fill={KRP.ink} opacity={0.18} />
          ))}
        </g>
        {/* 光の筋 */}
        <polygon points={`${lens[0]},${lens[1]} 1120,110 1820,110 1820,700 1120,700`} fill="url(#ni1-197-beam)" opacity={0.28} />
        {Array.from({ length: 12 }, (_, i) => {
          const u = (rnd(4197, i) + f * 0.005) % 1;
          const v = rnd(4199, i);
          return <circle key={i} cx={lerp(lens[0], 1120, u)} cy={lerp(lens[1], 120 + v * 570, u) + Math.sin(f / 6 + i) * 5} r={3} fill={NP.glowCore} opacity={0.7 * Math.sin(u * Math.PI)} />;
        })}
        {/* 映写機 (横向き・台の上) */}
        <rect x={120} y={690} width={200} height={100} rx={8} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={136} y={706} width={168} height={14} fill={C.vanityTop} />
        <NI1Projector x={200} y={590} s={0.85} f={f} lensRot={-4} />
        {/* ナレーター役 (光の中で振り返る) */}
        <ellipse cx={px} cy={834} rx={90} ry={16} fill={KRP.ink} opacity={0.3} />
        <Person x={px} y={830} s={1.0} f={f} cloth="#6F8FB0" clothDark="#4F6C8C"
          face={turn > 0.5 ? "worried" : "normal"}
          gaze={[lerp(1, -0.3, turn), lerp(-0.2, 0.15, turn)]}
          lean={lerp(4, -5, turn)} pose={turn > 0.5 ? "point" : "stand"} pointDir={1} />
        {/* 光が体に当たる */}
        <polygon points={`${lens[0]},${lens[1]} 1120,110 1120,700`} fill={NP.glowCore} opacity={0.1} />
        {/* 振り返りの線 */}
        {turn > 0 && turn < 1 && (
          <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={Math.sin(turn * Math.PI)}>
            <path d={`M ${px - 110} 520 q -20 30 0 60`} fill="none" />
            <path d={`M ${px - 136} 510 q -24 40 0 80`} fill="none" />
          </g>
        )}
        <QMark x={px - 150} y={470} s={1.15} f={f} t={qm} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #198 まず、人は、名前を使い分けても、平気なことがあります。
// 格: 山 / seed 4198
// どこ: 回り舞台。木の円盤の上に3つの部屋 (朝の台所 / 昼の会社 / 夜のカフェ)。上に幕の飾りと照明
// 演出: 同じ1人の人が3つの部屋に立ち、部屋ごとに胸の札を付けかえる (お母さん / 山田 / はなちゃん)。3人とも同じ笑顔
// 動き: 照明が左から順に灯り、そのたびに札がぽんと付く (f4〜36) / 円盤の目盛りがゆっくり回る / 湯気・秒針・電球 / カメラが少し引く
const Nm198: React.FC<{ f: number }> = ({ f }) => {
  const cam = lerp(1.06, 1, easeInOut(seg(f, 0, 40)));
  const panels = [
    { cx: 340, wall: C.homeWall, cloth: C.homeCloth, dark: C.homeClothDark, tag: "お母さん", when: "朝" },
    { cx: 960, wall: C.officeWall, cloth: C.suit, dark: C.suitDark, tag: "山田", when: "昼" },
    { cx: 1580, wall: C.cafeWall, cloth: C.knit, dark: C.knitDark, tag: "はなちゃん", when: "夜" },
  ];
  const S = 1.05;
  return (
    <Frame f={f} seed={4198} bg={C.theater}>
      <defs>
        {panels.map((p, i) => (
          <clipPath key={i} id={`ni1-198-p${i}`}><rect x={p.cx - 300} y={110} width={600} height={680} /></clipPath>
        ))}
      </defs>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        <rect x={-80} y={-60} width={W + 160} height={H + 120} fill={C.theater} />
        {/* ===== 回り舞台の円盤 ===== */}
        <ellipse cx={960} cy={860} rx={1130} ry={120} fill={C.stageDark} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={960} cy={800} rx={1100} ry={90} fill={C.stageWood} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 36 }, (_, k) => {
          const a = (k / 36) * Math.PI * 2 + f * 0.01;
          if (Math.sin(a) < 0.1) return null;
          const x = 960 + 1110 * Math.cos(a);
          const y = 830 + 100 * Math.sin(a);
          return <line key={k} x1={x} y1={y - 10} x2={x} y2={y + 30} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />;
        })}
        {Array.from({ length: 5 }, (_, k) => (
          <ellipse key={k} cx={960} cy={800} rx={300 + k * 160} ry={24 + k * 13} fill="none" stroke={C.stageDark} strokeWidth={2.5} opacity={0.5} />
        ))}
        {/* ===== 3つの部屋 ===== */}
        {panels.map((p, i) => {
          const on = easeOut(seg(f, 4 + i * 11, 12 + i * 11));
          const tagT = seg(f, 9 + i * 11, 17 + i * 11);
          const cx = p.cx;
          const bob = Math.sin((f + i * 17) / 13) * 3;
          return (
            <g key={i}>
              <g clipPath={`url(#ni1-198-p${i})`}>
                <rect x={cx - 300} y={110} width={600} height={680} fill={p.wall} />
                {i === 0 && (
                  <g>
                    {/* 朝の台所: 窓と朝日・棚・調理台・鍋の湯気 */}
                    <rect x={cx - 280} y={240} width={170} height={190} fill="#BFD9E6" stroke={KRP.ink} strokeWidth={6} />
                    <g transform={`translate(${cx - 195} 380)`}>
                      <circle r={46} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
                      {Array.from({ length: 8 }, (_, k) => (
                        <line key={k} x1={0} y1={-56} x2={0} y2={-72} stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" transform={`rotate(${k * 45 + f * 0.8})`} />
                      ))}
                    </g>
                    <line x1={cx - 195} y1={240} x2={cx - 195} y2={430} stroke={KRP.ink} strokeWidth={5} />
                    <rect x={cx - 290} y={428} width={190} height={14} fill={C.vanityTop} stroke={KRP.ink} strokeWidth={4} />
                    <rect x={cx + 110} y={300} width={180} height={14} fill={C.vanityTop} stroke={KRP.ink} strokeWidth={4} />
                    {[0, 1, 2].map((k) => (
                      <ellipse key={k} cx={cx + 140 + k * 55} cy={292} rx={22} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                    ))}
                    <rect x={cx + 150} y={250} width={34} height={42} rx={6} fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />
                    <rect x={cx - 300} y={600} width={600} height={190} fill={C.vanityTop} stroke={KRP.ink} strokeWidth={6} />
                    <rect x={cx - 300} y={600} width={600} height={22} fill={C.vanity} />
                    <rect x={cx + 150} y={560} width={110} height={44} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
                    <rect x={cx + 260} y={572} width={40} height={10} fill={KRP.ink} />
                    {[0, 1].map((k) => (
                      <path key={k} d={`M ${cx + 185 + k * 40} ${550 - ((f * 1.2 + k * 14) % 40)} q 12 -16 0 -32`} stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.7} strokeLinecap="round" />
                    ))}
                  </g>
                )}
                {i === 1 && (
                  <g>
                    {/* 昼の会社: ホワイトボードのグラフ・時計12時・窓のビル・机 */}
                    <rect x={cx - 285} y={300} width={160} height={210} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
                    {[0, 1, 2].map((k) => (
                      <rect key={k} x={cx - 262 + k * 46} y={470 - (k + 1) * 40} width={30} height={(k + 1) * 40} fill={[KRP.blue, KRP.green, KRP.orange][k]} stroke={KRP.ink} strokeWidth={3} />
                    ))}
                    <g transform={`translate(${cx - 200} 222)`}>
                      <circle r={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                      <line x1={0} y1={0} x2={0} y2={-26} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
                      <line x1={0} y1={0} x2={0} y2={-32} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" transform="rotate(4)" />
                      <line x1={0} y1={4} x2={0} y2={-34} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${f * 6})`} />
                    </g>
                    <rect x={cx + 120} y={220} width={170} height={300} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
                    {[[140, 330, 40], [190, 270, 46], [244, 360, 36]].map(([bx, by, bw], k) => (
                      <g key={k}>
                        <rect x={cx + bx} y={by} width={bw} height={520 - by} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
                        {Array.from({ length: 4 }, (_, r) => <rect key={r} x={cx + bx + 8} y={by + 14 + r * 36} width={bw - 16} height={10} fill={KRP.white} opacity={0.7} />)}
                      </g>
                    ))}
                    <rect x={cx - 300} y={640} width={600} height={150} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
                    <rect x={cx - 300} y={630} width={600} height={20} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
                    <rect x={cx + 150} y={540} width={120} height={84} rx={6} fill={C.metalDark} stroke={KRP.ink} strokeWidth={5} />
                    <rect x={cx + 160} y={550} width={100} height={62} fill={KRP.blueSoft} opacity={0.6 + 0.3 * Math.sin(f / 9)} />
                    <rect x={cx + 196} y={624} width={30} height={10} fill={KRP.ink} />
                    <rect x={cx - 270} y={600} width={90} height={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} transform={`rotate(-4 ${cx - 225} 616)`} />
                  </g>
                )}
                {i === 2 && (
                  <g>
                    {/* 夜のカフェ: 月の窓・電球の飾り・ペンダントランプ・丸テーブルと友だち */}
                    <rect x={cx - 285} y={250} width={150} height={200} fill={C.skyNight} stroke={KRP.ink} strokeWidth={6} />
                    <circle cx={cx - 220} cy={310} r={28} fill={NP.glowCore} stroke={KRP.ink} strokeWidth={3} />
                    <circle cx={cx - 208} cy={302} r={24} fill={C.skyNight} />
                    {[[-260, 400], [-170, 360], [-240, 270]].map(([dx, dy], k) => (
                      <circle key={k} cx={cx + dx} cy={dy} r={3} fill={NP.glowCore} opacity={0.5 + 0.5 * Math.sin(f / 4 + k)} />
                    ))}
                    <path d={`M ${cx - 300} 210 Q ${cx} 270 ${cx + 300} 210`} stroke={KRP.ink} strokeWidth={4} fill="none" />
                    {Array.from({ length: 9 }, (_, k) => {
                      const u = (k + 0.5) / 9;
                      const bx = cx - 300 + 600 * u;
                      const by = 210 + 4 * 60 * u * (1 - u) + 14;
                      return <circle key={k} cx={bx} cy={by} r={10} fill={C.bulb} stroke={KRP.ink} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(f / 5 + k * 1.3)} />;
                    })}
                    <rect x={cx - 300} y={720} width={600} height={70} fill={C.cafeWallDark} />
                    <line x1={cx + 90} y1={110} x2={cx + 90} y2={430} stroke={KRP.ink} strokeWidth={4} />
                    <path d={`M ${cx + 50} 470 L ${cx + 130} 470 L ${cx + 110} 430 L ${cx + 70} 430 Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
                    <ellipse cx={cx + 90} cy={560} rx={170} ry={90} fill={NP.glow} opacity={0.18} />
                    {/* 友だち */}
                    <Person x={cx + 200} y={760} s={0.95} f={f} phase={5} cloth={C.friend} clothDark={C.friendDark} face="joy" gaze={[-1, 0]} lean={-3} />
                  </g>
                )}
              </g>
              {/* 部屋の主 (同じ1人・同じ笑顔) */}
              <circle cx={cx + (i === 2 ? -60 : 0) + 40 * S} cy={760 - 270 * S + bob} r={24 * S} fill={C.hairBun} stroke={KRP.ink} strokeWidth={4} />
              <Person x={cx + (i === 2 ? -60 : 0)} y={760} s={S} f={f} phase={i} cloth={p.cloth} clothDark={p.dark}
                face="smile" pose={i === 0 ? "raise" : i === 1 ? "point" : "hold"} pointDir={-1} gaze={[0, 0.1]} />
              <g transform={`translate(${cx + (i === 2 ? -60 : 0)} ${760 + bob}) scale(${S})`}>
                {i === 0 && (
                  <g>
                    {/* エプロン */}
                    <path d="M -40 -150 L 40 -150 L 50 -24 L -50 -24 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={4.5} />
                    <line x1={-40} y1={-150} x2={-56} y2={-160} stroke={KRP.ink} strokeWidth={4} />
                    <line x1={40} y1={-150} x2={56} y2={-160} stroke={KRP.ink} strokeWidth={4} />
                    <rect x={-22} y={-82} width={44} height={30} rx={5} fill={C.apronDark} stroke={KRP.ink} strokeWidth={3} />
                  </g>
                )}
                {i === 1 && (
                  <g>
                    {/* スーツの襟・シャツ・ネクタイ */}
                    <polygon points="-24,-160 24,-160 0,-112" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                    <polygon points="-6,-156 6,-156 9,-120 0,-108 -9,-120" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
                    <path d="M -24 -160 L -40 -100 M 24 -160 L 40 -100" stroke={KRP.ink} strokeWidth={4} />
                  </g>
                )}
                {i === 2 && (
                  <g>
                    {/* 両手のカップ (湯気) */}
                    <rect x={-20} y={-122} width={40} height={36} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                    <path d={`M -6 ${-130 - ((f * 0.8) % 20)} q 8 -12 0 -24`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.8} />
                  </g>
                )}
                <NI1ChestTag text={p.tag} size={i === 2 ? 24 : 28} t={tagT} fill={i === 1 ? "#F4F0E2" : KRP.white} />
              </g>
              {/* 照明が当たる前は暗い */}
              <rect x={cx - 300} y={110} width={600} height={680} fill={C.theater} opacity={0.5 * (1 - on)} />
              <polygon points={`${cx - 40},110 ${cx + 40},110 ${cx + 240},790 ${cx - 240},790`} fill={NP.glowCore} opacity={0.14 * on} />
              {/* 照明の灯具 */}
              <g transform={`translate(${cx} 112)`}>
                <rect x={-34} y={-12} width={68} height={40} rx={8} fill={C.metalDark} stroke={KRP.ink} strokeWidth={5} />
                <ellipse cx={0} cy={28} rx={26} ry={8} fill={on > 0.1 ? NP.glowCore : C.metal} stroke={KRP.ink} strokeWidth={3} />
              </g>
            </g>
          );
        })}
        {/* 部屋の仕切りの壁 */}
        {[650, 1270].map((x) => (
          <rect key={x} x={x - 12} y={100} width={24} height={700} fill={C.stageDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={20} y={100} width={1880} height={700} fill="none" stroke={KRP.ink} strokeWidth={8} />
        {/* 上の幕飾り */}
        <rect x={-80} y={-60} width={W + 160} height={140} fill={C.valance} />
        <path d={Array.from({ length: 16 }, (_, k) => `${k ? "" : "M -40 80 "}q 60 ${50 + Math.sin(f / 15 + k) * 4} 125 0`).join(" ")} fill={C.valance} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-80} y={70} width={W + 160} height={10} fill={NP.brassDark} />
      </g>
      {/* 時の札 (カメラの外) */}
      <TagPlate x={340} y={170} text="朝" size={40} t={seg(f, 2, 10)} />
      <TagPlate x={960} y={170} text="昼" size={40} t={seg(f, 13, 21)} />
      <TagPlate x={1580} y={170} text="夜" size={40} t={seg(f, 24, 32)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #199 芸名や仕事のための名前で、私生活を守っている人もいます。
// 格: 並 / seed 4199
// どこ: 劇場の楽屋口の廊下。天井の配管・非常口の印・衣装ラック・機材箱。真ん中に楽屋のドア
// 演出: 開いたドアの奥に私室 (電球の鏡・化粧台・マグ・写真立て・鏡の隅の本名の小さな札)。表には芸名の大きな札
// 動き: ドアが f10〜36 で閉まり、私室と本名の札が隠れる。閉じたあとは足元から細い光だけ / 電球のまたたき / 衣装のゆれ / カメラが少し寄る
const Nm199: React.FC<{ f: number }> = ({ f }) => {
  const close = easeInOut(seg(f, 10, 36));
  const th = lerp(68, 0, close) * (Math.PI / 180);
  const c = Math.cos(th);
  const sn = Math.sin(th);
  const cam = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  const leak = seg(f, 32, 40);
  return (
    <Frame f={f} seed={4199} bg={C.backWall}>
      <defs>
        <clipPath id="ni1-199-room"><rect x={650} y={160} width={480} height={660} /></clipPath>
      </defs>
      <g transform={`translate(890 480) scale(${cam}) translate(-890 -480)`}>
        {/* 廊下の壁 */}
        <rect x={-80} y={-60} width={W + 160} height={900} fill={C.backWall} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={-80} y1={90 + i * 80} x2={W + 80} y2={90 + i * 80} stroke={C.backWallDark} strokeWidth={3} opacity={0.5} />
        ))}
        <rect x={-80} y={790} width={W + 160} height={30} fill={C.backWallDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 天井の配管 */}
        <rect x={-80} y={34} width={W + 160} height={26} rx={13} fill={C.metal} stroke={KRP.ink} strokeWidth={5} />
        {[200, 620, 1180, 1600].map((x) => <rect key={x} x={x} y={24} width={22} height={46} rx={4} fill={C.metalDark} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 非常口の印 (緑の走る人の絵) */}
        <g transform="translate(1660 150)">
          <rect x={-80} y={-36} width={160} height={72} rx={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-34} cy={-14} r={9} fill={KRP.white} />
          <path d="M -36 -2 L -26 14 L -40 28 M -28 6 L -10 0 M -30 2 L -52 10" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" fill="none" />
          <rect x={4} y={-24} width={50} height={50} fill={KRP.white} opacity={0.85} />
          <rect x={14} y={-14} width={30} height={40} fill={KRP.green} />
        </g>
        {/* 壁のポスター (字のない図柄) */}
        {[[130, 230, -3, KRP.orange], [380, 260, 2, KRP.blue]].map(([px, py, r, col], i) => (
          <g key={i} transform={`rotate(${r} ${(px as number) + 100} ${(py as number) + 150})`}>
            <rect x={px as number} y={py as number} width={200} height={290} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={(px as number) + 100} cy={(py as number) + 110} r={60} fill={col as string} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${(px as number) + 30} ${(py as number) + 230} L ${(px as number) + 170} ${(py as number) + 230} M ${(px as number) + 50} ${(py as number) + 254} L ${(px as number) + 150} ${(py as number) + 254}`} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={(px as number) + 100} cy={(py as number) + 10} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 衣装ラック */}
        <g>
          <line x1={1340} y1={290} x2={1860} y2={290} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          <line x1={1360} y1={290} x2={1360} y2={800} stroke={KRP.ink} strokeWidth={8} />
          <line x1={1840} y1={290} x2={1840} y2={800} stroke={KRP.ink} strokeWidth={8} />
          {[[1420, KRP.red], [1530, "#7B5EA7"], [1640, KRP.yellow], [1750, KRP.blueDeep]].map(([hx, col], i) => (
            <g key={i} transform={`rotate(${Math.sin(f / 18 + i) * 2} ${hx} 290)`}>
              <path d={`M ${hx} 290 l -6 14 M ${(hx as number) - 46} 322 L ${hx} 300 L ${(hx as number) + 46} 322`} stroke={KRP.ink} strokeWidth={4} fill="none" />
              <path d={`M ${(hx as number) - 46} 322 L ${(hx as number) + 46} 322 L ${(hx as number) + 62} 600 L ${(hx as number) - 62} 600 Z`} fill={col as string} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${(hx as number) - 50} 580 Q ${hx} 560 ${(hx as number) + 50} 580`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.5} />
            </g>
          ))}
        </g>
        {/* 機材箱 */}
        <rect x={1420} y={690} width={260} height={130} rx={8} fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1432} y={702} width={236} height={106} rx={6} fill={C.metalDark} />
        {[1440, 1650].map((x) => <rect key={x} x={x} y={696} width={22} height={118} fill={C.metal} stroke={KRP.ink} strokeWidth={3} />)}
        {/* ===== 私室 (ドアの奥) ===== */}
        <g clipPath="url(#ni1-199-room)">
          <rect x={650} y={160} width={480} height={660} fill={C.roomWarm} />
          <rect x={650} y={720} width={480} height={100} fill={C.doorFaceDark} />
          {/* 電球の鏡 */}
          <rect x={826} y={240} width={290} height={290} rx={8} fill={C.doorFrame} stroke={KRP.ink} strokeWidth={6} />
          <rect x={850} y={264} width={242} height={242} fill={C.glass} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 880 300 L 940 270 M 880 340 L 990 280" stroke={KRP.white} strokeWidth={6} opacity={0.4} />
          {Array.from({ length: 16 }, (_, k) => {
            const side = Math.floor(k / 4);
            const u = (k % 4 + 0.5) / 4;
            const bx = side === 0 ? 826 + 290 * u : side === 1 ? 1116 : side === 2 ? 826 + 290 * u : 826;
            const by = side === 0 ? 240 : side === 1 ? 240 + 290 * u : side === 2 ? 530 : 240 + 290 * u;
            const tw = 0.7 + 0.3 * Math.sin(f / 3 + k * 2.1);
            return (
              <g key={k}>
                <circle cx={bx} cy={by} r={20} fill={NP.glow} opacity={0.3 * tw} />
                <circle cx={bx} cy={by} r={11} fill={C.bulb} stroke={KRP.ink} strokeWidth={3} opacity={tw} />
              </g>
            );
          })}
          {/* 本名の小さな札 (鏡の隅にテープで留める) */}
          <g transform="rotate(-4 1030 486)">
            <rect x={970} y={468} width={120} height={36} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <text x={1030} y={493} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={KRP.ink}>山田 花子</text>
            <rect x={960} y={460} width={26} height={12} fill={KRP.yellow} opacity={0.8} transform="rotate(-30 973 466)" />
          </g>
          {/* 化粧台と小物 */}
          <rect x={660} y={580} width={470} height={26} fill={C.vanityTop} stroke={KRP.ink} strokeWidth={5} />
          <rect x={680} y={606} width={430} height={120} fill={C.vanity} stroke={KRP.ink} strokeWidth={5} />
          <g transform="translate(900 580)">
            <rect x={-20} y={-44} width={40} height={44} rx={6} fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 20 -34 q 18 0 18 14 q 0 14 -18 14" stroke={KRP.ink} strokeWidth={4} fill="none" />
            <path d={`M -4 ${-52 - ((f * 0.7) % 16)} q 8 -10 0 -20`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.8} />
          </g>
          <g transform="translate(1010 580)">
            <rect x={-34} y={-66} width={68} height={66} rx={4} fill={C.doorFrame} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-24} y={-56} width={48} height={46} fill={KRP.cream} />
            <circle cx={0} cy={-30} r={13} fill={KRP.grayDark} />
            <path d="M -10 -40 l 4 -10 l 4 8 M 10 -40 l -4 -10 l -4 8" fill={KRP.grayDark} />
          </g>
          <g transform="translate(1090 580)">
            <rect x={-14} y={-50} width={28} height={50} rx={5} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
            {[-6, 0, 6].map((d) => <line key={d} x1={d} y1={-50} x2={d * 2} y2={-74} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
          <TagPlate x={980} y={660} text="本名" size={32} fill={KRP.cream} />
        </g>
        {/* ドアの枠 */}
        <rect x={634} y={146} width={512} height={680} fill="none" stroke={C.doorFrame} strokeWidth={24} />
        <rect x={622} y={134} width={536} height={700} fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* ドアの扉 (奥へ開いた状態から閉まる) */}
        <g transform={`translate(650 160) matrix(${c} ${0.05 * sn} 0 1 0 0)`}>
          <rect x={0} y={0} width={480} height={660} fill={C.doorFace} stroke={KRP.ink} strokeWidth={7} />
          <rect x={40} y={330} width={400} height={280} rx={6} fill="none" stroke={C.doorFaceDark} strokeWidth={8} />
          <rect x={40} y={40} width={400} height={60} rx={6} fill="none" stroke={C.doorFaceDark} strokeWidth={6} />
          {/* 星の飾り */}
          <path d="M 240 52 l 10 22 l 24 2 l -18 16 l 6 24 l -22 -13 l -22 13 l 6 -24 l -18 -16 l 24 -2 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} transform="translate(0 -6)" />
          {/* 芸名の大きな札 */}
          <rect x={70} y={140} width={340} height={150} rx={14} fill={NP.wood} stroke={KRP.ink} strokeWidth={7} />
          <rect x={70} y={140} width={340} height={26} rx={10} fill={NP.woodMid} opacity={0.6} />
          <text x={240} y={252} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={NP.sumi}>○○</text>
          {[90, 390].map((x) => <circle key={x} cx={x} cy={160} r={7} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />)}
          {/* ドアノブ */}
          <circle cx={430} cy={360} r={18} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={420} y={378} width={20} height={36} rx={4} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 開いているときの扉の厚み */}
        {sn > 0.05 && (
          <rect x={650 + 480 * c} y={160 + 24 * sn} width={16 * sn} height={660} fill={C.doorFaceDark} stroke={KRP.ink} strokeWidth={3} />
        )}
        {/* 閉じたあと足元から漏れる光 */}
        <rect x={660} y={812} width={460} height={8} fill={NP.glowCore} opacity={leak * (0.7 + 0.3 * Math.sin(f / 3))} />
        <polygon points="660,820 1120,820 1200,900 580,900" fill={NP.glow} opacity={0.22 * leak} />
        {/* 床 */}
        <rect x={-80} y={820} width={W + 160} height={360} fill={C.concrete} />
        <polygon points="660,822 1120,822 1220,1080 560,1080" fill={NP.glow} opacity={0.14 * leak} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={i * 380 - 60} y1={822} x2={i * 380 - 260} y2={1080} stroke={KRP.grayDark} strokeWidth={3} opacity={0.5} />
        ))}
      </g>
      {/* 芸名の札のラベル (カメラの外) */}
      <TagPlate x={1260} y={360} text="芸名" size={38} fill={NP.wood} t={seg(f, 4, 12)} />
      <Arrow x={1142} y={370} s={0.5} rot={180} t={seg(f, 8, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #200 いくつ名前があっても、自分は、ひとりのままです。
// 格: 図 / seed 4200
// どこ: 工房の作業台の上 (有孔ボードの壁・道具)。台座に歯車が付いたからくりの軸
// 演出: 1本の太い金の芯に、5枚の名札 (お母さん / 山田さん / はなちゃん / ○○ / 花子) が串のように通っている
// 動き: 札が上から順にくるりと1回転 (f4〜40)。回っても芯は1本のまま、だんだん強く光る / 台座の歯車が回る / カメラがゆっくり寄る
const Nm200: React.FC<{ f: number }> = ({ f }) => {
  const names = ["お母さん", "山田さん", "はなちゃん", "○○", "花子"];
  const glow = 0.35 + 0.65 * easeOut(seg(f, 14, 40));
  const pulse = 0.85 + 0.15 * Math.sin(f / 5);
  const cam = 1 + 0.04 * easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4200} bg={C.workWall}>
      <defs>
        <linearGradient id="ni1-200-rod" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={NP.brassDark} />
          <stop offset="0.45" stopColor={NP.glowCore} />
          <stop offset="1" stopColor={NP.brassDark} />
        </linearGradient>
      </defs>
      <g transform={`translate(960 480) scale(${cam}) translate(-960 -480)`}>
        {/* 有孔ボードの壁と道具 */}
        <rect x={-80} y={-60} width={W + 160} height={900} fill={C.workWall} />
        {Array.from({ length: 22 }, (_, r) => Array.from({ length: 40 }, (_, k) => (
          <circle key={`${r}-${k}`} cx={k * 50 - 10} cy={r * 40 + 10} r={4} fill={C.peg} />
        )))}
        {/* 金づち */}
        <g transform="translate(260 260) rotate(-20)">
          <rect x={-10} y={-20} width={20} height={240} rx={6} fill={C.benchTop} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-60} y={-60} width={120} height={50} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* のこぎり */}
        <g transform="translate(1560 200) rotate(14)">
          <rect x={-30} y={0} width={60} height={70} rx={14} fill={C.benchDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -24 70 L 24 70 L 40 380 L -40 380 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <path d={Array.from({ length: 12 }, (_, k) => `${k ? "L" : "M"} ${-40 + (k % 2) * -8} ${90 + k * 25}`).join(" ")} stroke={KRP.ink} strokeWidth={3} fill="none" />
        </g>
        {/* 物差し */}
        <g transform="translate(1720 260) rotate(-6)">
          <rect x={-16} y={0} width={32} height={420} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 20 }, (_, k) => <line key={k} x1={-16} y1={10 + k * 20} x2={k % 5 ? -6 : 4} y2={10 + k * 20} stroke={KRP.ink} strokeWidth={2.5} />)}
        </g>
        {/* 作業台 */}
        <rect x={-80} y={760} width={W + 160} height={400} fill={C.benchTop} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -80 ${790 + i * 50} q 500 ${rnd(4200, i) * 30 - 15} 1000 0 q 500 ${rnd(4201, i) * 30 - 15} 1080 0`} stroke={C.benchDark} strokeWidth={4} fill="none" opacity={0.6} />
        ))}
        <rect x={-80} y={756} width={W + 160} height={12} fill={C.benchDark} />
        {/* 台の上の木くずと鉛筆 */}
        <g transform="translate(400 840) rotate(-12)">
          <rect x={-90} y={-9} width={180} height={18} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <polygon points="90,-9 118,0 90,9" fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {[[1400, 820], [1460, 850], [520, 790]].map(([x, y], i) => (
          <path key={i} d={`M ${x} ${y} q 14 -12 28 0 q -14 8 -28 0`} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* ===== からくりの軸 ===== */}
        <ellipse cx={960} cy={790} rx={260} ry={24} fill={KRP.ink} opacity={0.3} />
        {/* 台座 */}
        <rect x={740} y={690} width={440} height={100} rx={12} fill={C.vanity} stroke={KRP.ink} strokeWidth={7} />
        <rect x={760} y={706} width={400} height={16} fill={C.vanityTop} />
        <NI1Gear x={810} y={752} r={44} teeth={10} rot={f * 3} fill={NP.brass} />
        <NI1Gear x={1110} y={752} r={44} teeth={10} rot={-f * 3} fill={NP.brass} />
        <NI1Gear x={960} y={756} r={30} teeth={8} rot={-f * 4.4} fill={NP.brassDark} />
        {/* 芯の光 */}
        <rect x={900} y={90} width={120} height={610} rx={60} fill={NP.glow} opacity={0.32 * glow * pulse} />
        <rect x={920} y={100} width={80} height={600} rx={40} fill={NP.glow} opacity={0.3 * glow * pulse} />
        {/* 芯の棒 */}
        <rect x={932} y={110} width={56} height={590} rx={10} fill="url(#ni1-200-rod)" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={960} cy={100} r={36} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={950} cy={90} r={10} fill={NP.glowCore} opacity={0.8} />
        {/* 串に通った5枚の名札 */}
        {names.map((nm, i) => {
          const y = 195 + i * 113;
          const a = Math.PI * 2 * easeInOut(seg(f, 4 + i * 5, 20 + i * 5)) + 0.16 * Math.sin(f / 10 + i * 1.7);
          const sx = Math.cos(a);
          const front = sx >= 0;
          const spinning = f > 4 + i * 5 && f < 20 + i * 5;
          return (
            <g key={i}>
              {/* 札が通る金の輪 */}
              <ellipse cx={960} cy={y - 48} rx={40} ry={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
              <g transform={`translate(960 ${y}) scale(${Math.max(Math.abs(sx), 0.04)} 1)`}>
                <rect x={-196} y={-42} width={392} height={92} rx={16} fill={KRP.ink} opacity={0.2} />
                <rect x={-190} y={-46} width={380} height={92} rx={16} fill={front ? NP.wood : NP.woodMid} stroke={KRP.ink} strokeWidth={6} />
                <path d="M -170 -20 q 80 -10 170 0 q 80 10 150 -4" stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.7} />
                {front && (
                  <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={nm.length > 4 ? 48 : 52} fill={NP.sumi}>{nm}</text>
                )}
              </g>
              <ellipse cx={960} cy={y + 48} rx={40} ry={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
              {/* 回るときの線 */}
              {spinning && (
                <g stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.55}>
                  <path d={`M 740 ${y - 30} q -30 30 0 60`} />
                  <path d={`M 1180 ${y - 30} q 30 30 0 60`} />
                </g>
              )}
            </g>
          );
        })}
      </g>
      <TagPlate x={1170} y={100} text="自分" size={40} fill={NP.glowCore} t={seg(f, 24, 32)} />
      <Arrow x={1050} y={100} s={0.5} rot={180} t={seg(f, 28, 36)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #201 では、名前が変わったとき、気持ちはどうなるのか。
// 格: 並 / seed 4201
// どこ: 役所の戸籍の窓口。すりガラスの仕切りの向こうに職員、カウンターに名字の札・婚姻届・ペン立て。壁にカレンダーとブラインドの窓
// 演出: 仕切りの下から職員の手が筆ペンで札の名字を書きかえる (山田 → 佐藤)。手前で花束を持った人が、後ろ姿でじっと見つめる
// 動き: 古い名字が f12〜20 でけむりと共に消え、新しい名字が f16〜34 で左から書かれる / カメラが札へ寄る / 花束のゆれ
const Nm201: React.FC<{ f: number }> = ({ f }) => {
  const oldGone = easeOut(seg(f, 12, 20));
  const write = seg(f, 16, 34);
  const cam = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const puff = seg(f, 14, 26);
  // 名札: 中心 (1000, 495)・幅 560
  const back = easeOut(seg(f, 35, 42)); // 書き終えて手を引っこめる
  const penX = lerp(lerp(760, 960, write) + Math.sin(f * 1.3) * 6 * (write > 0 && write < 1 ? 1 : 0), 600, back);
  const penY = lerp(470 + Math.sin(f * 0.9) * 10 * (write > 0 && write < 1 ? 1 : 0), 560, back);
  const bob = Math.sin((f + 2 * 17) / 13) * 3;
  const BS = 1.3;
  const bx = 1460, by = 1070;
  return (
    <Frame f={f} seed={4201} bg={C.hallWall}>
      <defs>
        <clipPath id="ni1-201-new"><rect x={720} y={400} width={20 + 260 * write} height={190} /></clipPath>
      </defs>
      <g transform={`translate(1000 500) scale(${cam}) translate(-1000 -500)`}>
        {/* 壁 */}
        <rect x={-80} y={-60} width={W + 160} height={700} fill={C.hallWall} />
        {/* ブラインドの窓 */}
        <rect x={1460} y={110} width={380} height={330} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={1466} y={120 + i * 29} width={368} height={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} opacity={0.9} />
        ))}
        {/* カレンダー (結婚の日に赤い丸) */}
        <g transform="translate(150 140)">
          <rect x={0} y={0} width={230} height={250} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={0} y={0} width={230} height={50} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, k) => (
            <rect key={`${r}${k}`} x={14 + k * 30} y={66 + r * 34} width={20} height={20} fill={KRP.gray} opacity={0.5} />
          )))}
          <circle cx={14 + 4 * 30 + 10} cy={66 + 2 * 34 + 10} r={20} fill="none" stroke={KRP.red} strokeWidth={5} />
          <circle cx={115} cy={-6} r={8} fill={KRP.ink} />
        </g>
        {/* 吊り下げの窓口札 */}
        <line x1={880} y1={-10} x2={880} y2={60} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1120} y1={-10} x2={1120} y2={60} stroke={KRP.ink} strokeWidth={4} />
        {/* すりガラスの仕切り (向こうに職員) */}
        <Person x={600} y={690} s={1.05} f={f} phase={3} cloth={C.clerk} clothDark={C.clerkDark} glasses face="normal" gaze={[0.6, 0.4]} />
        <rect x={360} y={170} width={500} height={360} rx={8} fill={C.frost} opacity={0.82} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 400 220 L 480 180 M 400 270 L 560 190" stroke={KRP.white} strokeWidth={8} opacity={0.5} />
        <rect x={352} y={160} width={516} height={18} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        {/* カウンター */}
        <rect x={-80} y={590} width={W + 160} height={40} fill={C.counterTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-80} y={630} width={W + 160} height={500} fill={C.counterFace} />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={i * 340 - 40} y={660} width={300} height={360} rx={8} fill="none" stroke={C.vanityDark} strokeWidth={5} opacity={0.6} />
        ))}
        {/* 婚姻届とペン立て */}
        <g transform="rotate(-6 300 580)">
          <rect x={200} y={556} width={220} height={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <text x={260} y={586} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>婚姻届</text>
          <circle cx={380} cy={576} r={14} fill="none" stroke={KRP.red} strokeWidth={4} />
        </g>
        <rect x={1320} y={530} width={60} height={64} rx={6} fill={C.metal} stroke={KRP.ink} strokeWidth={5} />
        {[[-14, KRP.blueDeep], [0, KRP.red], [14, KRP.ink]].map(([d, col], i) => (
          <line key={i} x1={1350 + (d as number)} y1={534} x2={1350 + (d as number) * 1.8} y2={480} stroke={col as string} strokeWidth={8} strokeLinecap="round" />
        ))}
        {/* ===== 名字の札 ===== */}
        <rect x={900} y={580} width={200} height={16} rx={4} fill={C.vanityDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={726} y={414} width={560} height={170} rx={18} fill={KRP.ink} opacity={0.18} />
        <rect x={720} y={405} width={560} height={170} rx={18} fill={NP.wood} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 740 440 q 120 -14 260 0 q 130 14 260 -4" stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.7} />
        <line x1={1000} y1={420} x2={1000} y2={560} stroke={NP.grain} strokeWidth={3} strokeDasharray="8 8" />
        {/* 古い名字 (消える) */}
        <text x={860} y={525} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100} fill={NP.sumi}
          opacity={1 - oldGone} transform={`translate(0 ${-oldGone * 30})`}>山田</text>
        {puff > 0 && puff < 1 && (
          <g opacity={1 - puff}>
            {Array.from({ length: 6 }, (_, k) => (
              <circle key={k} cx={790 + k * 28} cy={470 - puff * 50 - (k % 2) * 20} r={14 + puff * 22} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={3} />
            ))}
          </g>
        )}
        {/* 新しい名字 (左から書かれる) */}
        <g clipPath="url(#ni1-201-new)">
          <text x={860} y={525} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100} fill={NP.sumi}>佐藤</text>
        </g>
        <text x={1140} y={525} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100} fill={NP.sumi}>花子</text>
        {/* 仕切りの下から伸びる職員の手と筆ペン */}
        <path d={`M 700 572 Q ${(700 + penX) / 2} ${penY + 70} ${penX + 30} ${penY + 54}`} stroke={KRP.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={`M 700 572 Q ${(700 + penX) / 2} ${penY + 70} ${penX + 30} ${penY + 54}`} stroke={C.clerk} strokeWidth={24} fill="none" strokeLinecap="round" />
        <g transform={`translate(${penX} ${penY}) rotate(-35)`}>
          <rect x={-8} y={-10} width={16} height={110} rx={6} fill={KRP.ink} />
          <polygon points="-8,-10 8,-10 0,-34" fill={NP.sumi} stroke={KRP.ink} strokeWidth={2} />
        </g>
        <circle cx={penX + 30} cy={penY + 54} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 手前: 花束を持った人の後ろ姿 */}
        <g>
          <Person x={bx} y={by} s={BS} f={f} phase={2} cloth={C.dress} clothDark={C.dressDark} face="normal" lean={-4} />
          <g transform={`translate(${bx} ${by + bob}) scale(${BS}) rotate(-4)`}>
            {/* 後頭部 (顔を隠す) */}
            <circle cx={0} cy={-228} r={67} fill={C.hairBride} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={-64} cy={-222} rx={9} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <ellipse cx={64} cy={-222} rx={9} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={0} cy={-268} r={30} fill={C.hairBride} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -40 -270 Q 0 -300 40 -270" stroke={KRP.white} strokeWidth={4} opacity={0.2} fill="none" />
            {[[-26, -254], [-14, -270], [-30, -278]].map(([x, y], k) => (
              <circle key={k} cx={x} cy={y} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
            {/* 胸ポケットの線を隠す背中の布 */}
            <rect x={-56} y={-156} width={112} height={100} rx={14} fill={C.dress} />
            <path d="M -20 -150 L 0 -120 L 20 -150" stroke={C.dressDark} strokeWidth={4} fill="none" />
            {/* 花束 (左手) */}
            <g transform={`translate(-82 -70) rotate(${-10 + Math.sin(f / 12) * 3})`}>
              <path d="M -10 0 L 10 0 L 4 60 L -4 60 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />
              {[[-18, -10, KRP.white], [14, -12, "#E8A3B0"], [0, -28, KRP.white], [-12, -32, "#E8A3B0"], [16, -34, KRP.yellow]].map(([x, y, col], k) => (
                <circle key={k} cx={x as number} cy={y as number} r={15} fill={col as string} stroke={KRP.ink} strokeWidth={3} />
              ))}
            </g>
          </g>
        </g>
      </g>
      <TagPlate x={1000} y={92} text="戸籍係" size={44} fill={KRP.white} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #202 2025年のある調査では、結婚で名字を変えた人の14.8%が、こう答えました。
// 格: 図 / seed 4202
// どこ: 机の上のクリップボード。アンケートの結果の紙。横に鉛筆・眼鏡・湯のみ
// 演出: 100人の人形のマーク (20×5) のうち、左上から約15人分を鉛筆が1人ずつ塗っていく。15人目は8割だけ (14.8%)
// 動き: f8〜36 で鉛筆が数えながら塗る / 塗り終わると「14.8%」の札が出て括弧でつながる / 湯気 / カメラがゆっくり寄る
const Nm202: React.FC<{ f: number }> = ({ f }) => {
  const prog = 14.8 * easeInOut(seg(f, 8, 36));
  const done = seg(f, 34, 42);
  const cam = 1 + 0.035 * easeInOut(seg(f, 0, 42));
  const col0 = 470, dx = 50, row0 = 400, dy = 88;
  const pos = (n: number): [number, number] => [col0 + (n % 20) * dx, row0 + Math.floor(n / 20) * dy];
  const cur = Math.min(Math.floor(prog), 14);
  const [pX, pY] = pos(cur);
  const penOn = f < 38;
  return (
    <Frame f={f} seed={4202} bg={C.desk}>
      <g transform={`translate(960 480) scale(${cam}) translate(-960 -480)`}>
        {/* 机 */}
        <rect x={-80} y={-60} width={W + 160} height={H + 120} fill={C.desk} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -80 ${40 + i * 140} q 500 ${rnd(4202, i) * 40 - 20} 1000 0 q 500 ${rnd(4203, i) * 40 - 20} 1080 0`} stroke={C.deskDark} strokeWidth={5} fill="none" opacity={0.5} />
        ))}
        {/* 湯のみ (左上) */}
        <g transform="translate(160 200)">
          <ellipse cx={8} cy={92} rx={80} ry={20} fill={KRP.ink} opacity={0.25} />
          <path d="M -70 0 L 70 0 L 56 90 L -56 90 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={0} rx={70} ry={18} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -60 40 L 60 40" stroke={KRP.blueDeep} strokeWidth={8} />
          {[0, 1].map((k) => (
            <path key={k} d={`M ${-14 + k * 28} ${-20 - ((f * 1.1 + k * 18) % 40)} q 12 -14 0 -28 q -12 -14 0 -28`} stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
          ))}
        </g>
        {/* 眼鏡 (右下) */}
        <g transform="translate(1720 760) rotate(14)" fill="none" stroke={KRP.ink} strokeWidth={6}>
          <circle cx={-44} cy={0} r={36} fill={KRP.blueSoft} fillOpacity={0.4} />
          <circle cx={44} cy={0} r={36} fill={KRP.blueSoft} fillOpacity={0.4} />
          <path d="M -8 -4 Q 0 -14 8 -4 M -80 -6 L -130 -30 M 80 -6 L 130 -30" />
        </g>
        {/* クリップボード */}
        <rect x={316} y={76} width={1300} height={770} rx={30} fill={KRP.ink} opacity={0.22} />
        <rect x={300} y={60} width={1300} height={770} rx={30} fill={C.clipBoard} stroke={KRP.ink} strokeWidth={8} />
        <rect x={340} y={130} width={1220} height={680} rx={6} fill={C.paper} stroke={KRP.ink} strokeWidth={5} />
        <rect x={352} y={142} width={1196} height={656} rx={4} fill={C.paper} stroke={KRP.gray} strokeWidth={2} />
        {/* 金具 */}
        <rect x={800} y={40} width={300} height={90} rx={18} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
        <rect x={860} y={70} width={180} height={24} rx={12} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={950} cy={60} r={14} fill={C.metal} stroke={KRP.ink} strokeWidth={4} />
        {/* 紙の罫線 */}
        <line x1={400} y1={300} x2={1500} y2={300} stroke={KRP.gray} strokeWidth={3} />
        <line x1={400} y1={760} x2={1500} y2={760} stroke={KRP.gray} strokeWidth={3} />
        {/* 100人のマーク */}
        {Array.from({ length: 100 }, (_, n) => {
          const [x, y] = pos(n);
          const fill = clamp01(prog - n); // 0〜1 (15人目は0.8)
          return (
            <g key={n} transform={`translate(${x} ${y})`}>
              <circle cx={0} cy={-52} r={11} fill={C.iconOff} stroke={KRP.ink} strokeWidth={3} />
              <rect x={-14} y={-38} width={28} height={40} rx={10} fill={C.iconOff} stroke={KRP.ink} strokeWidth={3} />
              {fill > 0 && (
                <g>
                  <clipPath id={`ni1-202-c${n}`}><rect x={-20} y={2 - 66 * fill} width={40} height={66 * fill} /></clipPath>
                  <g clipPath={`url(#ni1-202-c${n})`}>
                    <circle cx={0} cy={-52} r={11} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
                    <rect x={-14} y={-38} width={28} height={40} rx={10} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
                  </g>
                </g>
              )}
            </g>
          );
        })}
        {/* 15人をくくる括弧 */}
        {done > 0 && (
          <g opacity={done}>
            <path d={`M ${col0 - 20} 316 L ${col0 - 20} 300 L ${col0 + 14 * dx + 20} 300 L ${col0 + 14 * dx + 20} 316`} stroke={KRP.blueDeep} strokeWidth={6} fill="none" />
            <line x1={col0 + 7 * dx} y1={300} x2={col0 + 7 * dx} y2={268} stroke={KRP.blueDeep} strokeWidth={6} />
          </g>
        )}
        {/* 数える鉛筆 */}
        {penOn && (
          <g transform={`translate(${pX + 10} ${pY - 30 + Math.sin(f * 1.6) * 6}) rotate(35)`}>
            <polygon points="0,0 -10,-26 10,-26" fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
            <polygon points="0,0 -4,-10 4,-10" fill={KRP.ink} />
            <rect x={-10} y={-200} width={20} height={174} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-10} y={-222} width={20} height={24} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
      </g>
      <TagPlate x={1330} y={215} text="2025年の調査" size={40} fill={KRP.cream} />
      <TagPlate x={820} y={215} text="14.8%" size={52} fill={KRP.white} color={KRP.blueDeep} t={done} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_194: (f) => <Nm194 f={f} />,
  nm_195: (f) => <Nm195 f={f} />,
  nm_196: (f) => <Nm196 f={f} />,
  nm_197: (f) => <Nm197 f={f} />,
  nm_198: (f) => <Nm198 f={f} />,
  nm_199: (f) => <Nm199 f={f} />,
  nm_200: (f) => <Nm200 f={f} />,
  nm_201: (f) => <Nm201 f={f} />,
  nm_202: (f) => <Nm202 f={f} />,
};

export const NM_I1_MOTIFS: string[] = [
  "nm_194", // #194
  "nm_195", // #195
  "nm_196", // #196
  "nm_197", // #197
  "nm_198", // #198
  "nm_199", // #199
  "nm_200", // #200
  "nm_201", // #201
  "nm_202", // #202
];

export const namaeI1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
