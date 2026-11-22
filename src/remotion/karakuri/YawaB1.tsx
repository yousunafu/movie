// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#19〜#28 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed はこのファイルでは 2020〜2029。
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
  // 発掘の研究者 (#20 #21 #25 で揃える)
  khaki: "#B8A47A",
  khakiDark: "#8E7B55",
  glove: "#9FC3DE",
  // 夕暮れ (#19)
  duskTop: "#3E4677",
  duskMid: "#B9718A",
  duskLow: "#F2A65A",
  ridgeFar: "#9C8FB0",
  ridgeMid: "#6E5F86",
  ridgeNear: "#41364F",
  rim: "#F0A060",
  caveBlack: "#1E1720",
  grassDusk: "#56603F",
  grassDuskRib: "#7E8A5A",
  smoke: "#C9BFD3",
  // 昼の崖 (#20)
  skyDay: "#BFDDF0",
  skyDayLow: "#EAF3F2",
  hillBlue: "#9DB3C4",
  sandstone: "#C49A6C",
  sandstoneDark: "#A67C52",
  sandstoneLite: "#DDB98A",
  scaffold: "#B68752",
  rope: "#D8C49A",
  bush: "#7A9A5A",
  // 洞窟の中 (#21 #23 #25 #26)
  caveDark: "#3A2D25",
  caveRock: "#5A4636",
  caveRockLite: "#76604B",
  dirt: "#9C7A55",
  dirtDark: "#7A5C3E",
  dirtDeep: "#6B4F36",
  plant: "#9C8F4E",
  plantDark: "#7D7238",
  plantLite: "#BDB06C",
  lampLight: "#FFE9A8",
  // ルーペと作業台 (#22)
  table: "#C9A878",
  tableDark: "#A9875A",
  char: "#3A2A20",
  charVein: "#5E4835",
  leafGreen: "#6E9E4A",
  leafVein: "#A8CC7E",
  lensGlass: "#E8F2F4",
  bag: "#EEF2F0",
  // 20万年前の夕方 (#23)
  fire1: "#F2C14E",
  fire2: "#E8743A",
  fire3: "#FFF1B8",
  grassFresh: "#8FA857",
  grassFreshDark: "#6B8440",
  // 断面 (#24 ボーダー)
  topsoil: "#8B6A4A",
  cover: "#94744F",
  ash: "#C9C6C0",
  ashLite: "#E6E3DD",
  bedrock: "#6F6A64",
  bedrockDark: "#55504B",
  // アリ (#25)
  ant: "#3A2A22",
  // 低木 (#26)
  shrubLeaf: "#8FA38A",
  shrubUnder: "#D5DCCF",
  shrubWood: "#7A5E44",
  scent: "#B79BD6",
  // シブドゥ (#27 #28)
  river: "#7FB2C9",
  riverDeep: "#5E93AE",
  riverLite: "#CFE6EE",
  hillGreen: "#8FB27A",
  treeGreen: "#5E8C4E",
  sibuRock: "#B08A66",
  sibuRockDark: "#8C6A4C",
  sibuSand: "#B07850",
  sibuSandDark: "#8E5E3C",
  sibuUpper: "#A56E48",
  layerGrass: "#C2A25E",
  layerLeaf: "#7E8A4E",
  layerLeafDark: "#5F6B3A",
  // 南アフリカの国旗
  flagRed: "#DE3831",
  flagBlue: "#002395",
  flagGreen: "#007A4D",
  flagYellow: "#FFB612",
  flagBlack: "#1A1A1A",
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

type PersonProps = React.ComponentProps<typeof Person>;

// 幅広のイネ科の葉 1枚。(x,y)=根元 / h=長さ / w=根元の幅 / bend=先のずれ
const YcBlade: React.FC<{
  x: number; y: number; h: number; w: number; bend: number; fill: string; rib?: string; sw?: number;
}> = ({ x, y, h, w, bend, fill, rib, sw = 4 }) => (
  <g>
    <path
      d={`M ${x - w / 2} ${y} C ${x - w / 2} ${y - h * 0.4}, ${x + bend * 0.6 - w * 0.3} ${y - h * 0.8}, ${x + bend} ${y - h} C ${x + bend * 0.6 + w * 0.3} ${y - h * 0.75}, ${x + w / 2} ${y - h * 0.4}, ${x + w / 2} ${y} Z`}
      fill={fill} stroke={KRP.ink} strokeWidth={sw} strokeLinejoin="round" />
    {rib && (
      <path d={`M ${x} ${y} Q ${x + bend * 0.3} ${y - h * 0.6} ${x + bend * 0.93} ${y - h * 0.95}`}
        fill="none" stroke={rib} strokeWidth={sw * 0.7} strokeLinecap="round" />
    )}
  </g>
);

// 南アフリカの国旗 (横に寝たY字)。(x,y)=旗の左上 / w=旗の幅。竿つき、f でなびく
const YcFlag: React.FC<{ x: number; y: number; w: number; id: string; f: number }> = ({ x, y, w, id, f }) => {
  const sc = w / 300;
  const sk = Math.sin(f / 7) * 3;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-12} y={-14} width={10} height={200 * sc + 150} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={-7} cy={-18} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <g transform={`scale(${sc}) skewY(${sk})`}>
        <clipPath id={id}><rect x={0} y={0} width={300} height={200} /></clipPath>
        <g clipPath={`url(#${id})`}>
          <rect x={0} y={0} width={300} height={100} fill={C.flagRed} />
          <rect x={0} y={100} width={300} height={100} fill={C.flagBlue} />
          <path d="M -12 -10 L 125 100 L 312 100 M -12 210 L 125 100" fill="none" stroke={KRP.white} strokeWidth={66} strokeLinejoin="miter" />
          <path d="M -12 -10 L 125 100 L 312 100 M -12 210 L 125 100" fill="none" stroke={C.flagGreen} strokeWidth={40} strokeLinejoin="miter" />
          <polygon points="0,25.6 93,100 0,174.4" fill={C.flagYellow} />
          <polygon points="0,42.3 72,100 0,157.7" fill={C.flagBlack} />
        </g>
        <rect x={0} y={0} width={300} height={200} fill="none" stroke={KRP.ink} strokeWidth={6 / sc} />
      </g>
    </g>
  );
};

// ひざをついた人。Person の脚を隠して、腰から上を lean 度かたむけ、ひざ (ラップ) を前に描く。
// hand: 傾いた上半身の座標系 (= ワールド座標) で描く物。右手は handAt(+1)、左手は handAt(-1) で位置が出る
const kneelHand = (x: number, floorY: number, s: number, lean: number, side: 1 | -1) => {
  const hipY = floorY - 75 * s;
  const a = (lean * Math.PI) / 180;
  const lx = side * 67, ly = -14;
  return [x + s * (lx * Math.cos(a) - ly * Math.sin(a)), hipY + s * (lx * Math.sin(a) + ly * Math.cos(a))] as const;
};
const YcKneel: React.FC<{
  id: string; x: number; floorY: number; s: number; f: number; lean: number;
  cloth: string; clothDark: string; face?: PersonProps["face"]; helmet?: boolean;
  hair?: "cap" | "none"; glasses?: boolean; gaze?: [number, number]; phase?: number;
  children?: React.ReactNode;
}> = ({ id, x, floorY, s, f, lean, cloth, clothDark, face = "normal", helmet, hair = "cap", glasses, gaze, phase = 0, children }) => {
  const hipY = floorY - 75 * s;
  const y0 = hipY + 52 * s;
  return (
    <g>
      <clipPath id={id}><rect x={x - 600} y={hipY - 700} width={1200} height={706} /></clipPath>
      {/* ひざ (正座の前から見た形) */}
      <ellipse cx={x} cy={floorY + 2} rx={92 * s} ry={14 * s} fill={KRP.ink} opacity={0.22} />
      <g clipPath={`url(#${id})`}>
        <g transform={`rotate(${lean} ${x} ${hipY})`}>
          <Person x={x} y={y0} s={s} f={f} face={face} helmet={helmet} hair={hair} glasses={glasses}
            gaze={gaze} phase={phase} cloth={cloth} clothDark={clothDark} still />
        </g>
      </g>
      <path d={`M ${x - 66 * s} ${hipY - 6 * s} Q ${x - 78 * s} ${floorY - 10 * s} ${x - 60 * s} ${floorY} L ${x + 60 * s} ${floorY} Q ${x + 78 * s} ${floorY - 10 * s} ${x + 66 * s} ${hipY - 6 * s} Q ${x} ${hipY + 6 * s} ${x - 66 * s} ${hipY - 6 * s} Z`}
        fill={clothDark} stroke={KRP.ink} strokeWidth={4.5 * s} strokeLinejoin="round" />
      <path d={`M ${x} ${hipY + 4 * s} L ${x} ${floorY - 4 * s}`} stroke={KRP.ink} strokeWidth={3.5 * s} opacity={0.6} />
      {children}
    </g>
  );
};

// 焚き火 (石の輪・薪・3層の炎・火の粉)。(x,y)=炉の中心の地面
const YcFire: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const fl = (k: number) => Math.sin(f / 2.3 + k) * 0.08 + Math.sin(f / 3.7 + k * 2) * 0.06;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={150} ry={34} fill={KRP.ink} opacity={0.35} />
      {/* 薪 */}
      <rect x={-110} y={-26} width={220} height={26} rx={12} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={5} transform="rotate(-12)" />
      <rect x={-110} y={-26} width={220} height={26} rx={12} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} transform="rotate(14)" />
      {/* 炎 */}
      <path d={`M -80 -10 Q -96 ${-90 - 30 * fl(1)} -30 ${-150 - 40 * fl(2)} Q -20 -90 0 ${-210 - 50 * fl(3)} Q 30 -110 40 ${-160 - 30 * fl(4)} Q 100 -80 80 -10 Z`}
        fill={C.fire2} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M -50 -12 Q -56 -70 -14 ${-110 - 26 * fl(5)} Q 0 -70 16 ${-140 - 30 * fl(6)} Q 60 -70 50 -12 Z`} fill={C.fire1} />
      <path d={`M -22 -12 Q -24 -46 0 ${-80 - 16 * fl(7)} Q 24 -46 22 -12 Z`} fill={C.fire3} />
      {/* 石の輪 */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI * (0.05 + (i / 8) * 0.9);
        return <ellipse key={i} cx={Math.cos(a) * -140} cy={Math.sin(a) * 22 + 4} rx={30} ry={20}
          fill={i % 2 ? KRP.grayDark : KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />;
      })}
      {/* 火の粉 */}
      {Array.from({ length: 9 }, (_, i) => {
        const ph = ((f * 4 + i * 37) % 200) / 200;
        return <circle key={`p${i}`} cx={Math.sin(ph * 6 + i) * 40 + (rnd(5, i) - 0.5) * 80} cy={-120 - ph * 260}
          r={5 * (1 - ph) + 2} fill={C.fire1} opacity={1 - ph} />;
      })}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#19 【山】 第1章、20万年前の、草のベッド。
// 設計: 章扉。夕暮れの山並み、崖の中腹に洞窟の口。手前に背の高い草がそよぎ、洞窟から焚き火の煙がひとすじ。`ChapterDoor`
// どこ: 夕暮れの山地。3層の稜線、中景の崖の中腹に洞窟の口
// 演出: 洞窟の口だけ火の色に光り、煙がひとすじ。手前の幅広の草がそよぐ。一番星。題字は右下
// 動き: カメラが洞窟へゆっくり寄る / 煙がゆれる / 草がそよぐ / 星がまたたく / 鳥が渡る / 題字が f8〜24 で出る
const Yw019: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const door = seg(f, 8, 24);
  const tw = 0.65 + 0.35 * Math.sin(f / 4);
  const glow = 0.55 + 0.2 * Math.sin(f / 3) + 0.1 * Math.sin(f / 1.7);
  const smoke = (k: number, x0: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 15; i++) {
      const yy = 410 - i * 21;
      const amp = 5 + i * 2.4;
      const xx = x0 + Math.sin(i * 0.65 - f / 7 + k) * amp + i * i * 0.4;
      pts.push(`${xx.toFixed(1)} ${yy}`);
    }
    return "M " + pts.join(" L ");
  };
  // 手前の草 (左は背が高く、右=題字の下は低め)
  const blades = Array.from({ length: 22 }, (_, i) => {
    const left = i < 12;
    const x = left ? (i < 7 ? 30 + i * 52 : 690 + (i - 7) * 58) : 980 + (i - 12) * 96;
    const h = left ? 380 + rnd(19, i) * 200 : 200 + rnd(19, i) * 120;
    const w = 34 + rnd(23, i) * 20;
    const bend = (rnd(29, i) - 0.4) * 120 + Math.sin(f / 9 + i * 0.8) * 22;
    return { x, h, w, bend, i };
  });
  return (
    <Frame f={f} seed={2020} bg={C.duskTop}
      over={<>
        {/* 夕暮れの暗い山に「第1章」の灰色の字が沈むので、題字の後ろに薄いクリームの帯を敷く (検品で修正) */}
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={1} title="20万年前の、草のベッド" t={door} left={1000} top={560} />
      </>}>
      <defs>
        <linearGradient id="yc19sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} />
          <stop offset="0.5" stopColor={C.duskMid} />
          <stop offset="0.85" stopColor={C.duskLow} />
        </linearGradient>
        <radialGradient id="yc19cave" cx="0.5" cy="0.8" r="0.6">
          <stop offset="0" stopColor={C.fire1} stopOpacity={0.9} />
          <stop offset="0.5" stopColor={C.fire2} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.caveBlack} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(540 470) scale(${zoom}) translate(-540 -470)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#yc19sky)" />
        {/* 夕日と光の輪 */}
        <circle cx={1480} cy={560} r={190} fill={C.duskLow} opacity={0.35} />
        <circle cx={1480} cy={560} r={92} fill={C.fire1} stroke={KRP.ink} strokeWidth={5} />
        {/* 夕焼けの細い雲 */}
        {[[1150, 300, 420], [1500, 360, 300], [700, 240, 360], [1700, 210, 260]].map(([cx, cy, w], i) => (
          <g key={i} transform={`translate(${Math.sin(f / 40 + i) * 10} 0)`}>
            <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy - 26} ${cx + w / 2} ${cy} Z`} fill={C.duskMid} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            <path d={`M ${cx - w / 2 + 20} ${cy - 2} L ${cx + w / 2 - 20} ${cy - 2}`} stroke={C.rim} strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
        {/* 一番星と小さな星 */}
        <g transform={`translate(1300 120) scale(${tw})`}>
          <path d="M 0 -34 L 8 -8 L 34 0 L 8 8 L 0 34 L -8 8 L -34 0 L -8 -8 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {[[520, 90], [860, 130], [140, 300], [1040, 70]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={4 + (Math.sin(f / 5 + i * 2) + 1) * 1.6} fill={KRP.white} opacity={0.8} />
        ))}
        {/* 遠い稜線 */}
        <path d="M -60 620 L 120 520 L 260 560 L 420 470 L 600 540 L 780 450 L 980 530 L 1160 440 L 1380 520 L 1560 460 L 1760 540 L 1980 480 L 1980 1140 L -60 1140 Z"
          fill={C.ridgeFar} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 中の稜線 */}
        <path d="M -60 700 Q 200 600 400 640 Q 640 560 860 650 Q 1100 610 1300 680 Q 1560 620 1980 690 L 1980 1140 L -60 1140 Z"
          fill={C.ridgeMid} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 1000 640 Q 1200 610 1300 680" fill="none" stroke={C.rim} strokeWidth={5} opacity={0.7} />
        {/* 手前の崖 (洞窟のある山) */}
        <path d="M -60 360 L 140 330 L 300 300 L 420 320 L 560 286 L 700 330 L 820 400 L 900 520 L 980 640 L 1100 760 L 1400 800 L 1980 820 L 1980 1140 L -60 1140 Z"
          fill={C.ridgeNear} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 夕日のリムライト */}
        <path d="M 560 286 L 700 330 L 820 400 L 900 520 L 980 640 L 1100 760" fill="none" stroke={C.rim} strokeWidth={6} strokeLinecap="round" />
        {/* 崖の地層のすじ */}
        <g stroke={C.ridgeMid} strokeWidth={4} fill="none" opacity={0.8}>
          <path d="M 40 420 Q 200 400 360 430" /><path d="M 650 400 Q 760 420 820 460" />
          <path d="M 80 620 Q 300 600 420 640" /><path d="M 640 620 Q 800 640 900 700" />
          <path d="M 200 520 Q 280 510 380 530" />
        </g>
        {/* 洞窟の口 */}
        <path d="M 405 545 Q 400 420 520 396 Q 640 404 650 545 Q 528 566 405 545 Z" fill={C.caveBlack} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 405 545 Q 400 420 520 396 Q 640 404 650 545 Q 528 566 405 545 Z" fill="url(#yc19cave)" opacity={glow} />
        {/* 口の下の岩棚 */}
        <path d="M 370 552 Q 528 584 690 548 L 700 572 Q 528 610 360 576 Z" fill={C.ridgeMid} stroke={KRP.ink} strokeWidth={5} />
        {/* 煙ひとすじ */}
        <path d={smoke(0, 528)} fill="none" stroke={C.smoke} strokeWidth={16} strokeLinecap="round" opacity={0.55} />
        <path d={smoke(1.4, 534)} fill="none" stroke={C.smoke} strokeWidth={7} strokeLinecap="round" opacity={0.7} />
        {/* 渡り鳥 */}
        {[0, 1, 2].map((i) => {
          const bx = 820 + f * 3 + i * 70, by = 200 + i * 26 + Math.sin(f / 5 + i) * 5;
          const wv = Math.sin(f / 2.5 + i) * 8;
          return <path key={i} d={`M ${bx - 20} ${by - wv} Q ${bx - 8} ${by - 6} ${bx} ${by + 2} Q ${bx + 8} ${by - 6} ${bx + 20} ${by - wv}`}
            fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />;
        })}
        {/* 手前の幅広の草 (そよぐ) */}
        {blades.map((b) => (
          <YcBlade key={b.i} x={b.x} y={1110} h={b.h} w={b.w} bend={b.bend}
            fill={b.i % 3 ? C.grassDusk : C.ridgeNear} rib={C.grassDuskRib} sw={4.5} />
        ))}
        {/* 草の先のリムライト */}
        {blades.filter((b) => b.i % 2 === 0).map((b) => (
          <circle key={`r${b.i}`} cx={b.x + b.bend} cy={1110 - b.h + 6} r={4} fill={C.rim} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#20 【山】 やってきたのは、南アフリカの、ボーダー洞窟です。
// 設計: 崖の上のほうに大きく開いた洞窟の入口を見上げる。発掘の足場と縄ばしご、ヘルメットの研究者 Person が手を振る。「ボーダー洞窟」札・南アフリカの国旗
// どこ: 昼の国境の山地。砂岩の崖を下から見上げる。崖の上のほうに幅720pxの洞窟の口
// 演出: 崖に組んだ木の足場と縄ばしご。上の足場でヘルメットの研究者が手を振る。下の足場の研究者は見上げる
// 動き: カメラが下から上へパン (f0〜40) / 手を振る線 / 縄ばしごがゆれる / 国旗がなびく / 鳥が舞う
const Yw020: React.FC<{ f: number }> = ({ f }) => {
  const p = easeInOut(seg(f, 0, 40));
  const ty = -440 * (1 - p);
  const ladderRot = Math.sin(f / 14) * 2.2;
  const wave = Math.sin(f / 3);
  const poles = [800, 980, 1160];
  return (
    <Frame f={f} seed={2021} bg={C.skyDay}>
      <defs>
        <linearGradient id="yc20sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyDay} />
          <stop offset="1" stopColor={C.skyDayLow} />
        </linearGradient>
      </defs>
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill="url(#yc20sky)" />
      <g transform={`translate(0 ${ty})`}>
        {/* 遠い国境の山並み (左の空) */}
        <path d="M -40 700 L 80 560 L 180 620 L 300 480 L 420 600 L 420 1600 L -40 1600 Z" fill={C.hillBlue} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -40 1000 L 120 860 L 260 940 L 420 820 L 420 1600 L -40 1600 Z" fill={C.bush} stroke={KRP.ink} strokeWidth={5} />
        {/* 雲 */}
        <g transform={`translate(${Math.sin(f / 30) * 12} 0)`}>
          <path d="M 60 420 Q 70 370 130 380 Q 160 330 220 360 Q 280 350 290 410 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 砂岩の崖 */}
        <path d="M 380 1600 L 360 1200 L 300 900 L 340 600 L 300 380 L 360 180 L 420 60 L 600 20 L 900 40 L 1200 10 L 1500 30 L 1980 0 L 1980 1600 Z"
          fill={C.sandstone} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        {/* 地層の縞 */}
        <g fill="none" stroke={C.sandstoneDark} strokeWidth={6} strokeLinecap="round">
          {Array.from({ length: 12 }, (_, i) => {
            const yy = 90 + i * 120;
            return <path key={i} d={`M ${360 + (i % 3) * 20} ${yy} Q ${800} ${yy + (rnd(3, i) - 0.5) * 40} ${1200} ${yy + 10} T ${1980} ${yy - 6}`} opacity={0.55} />;
          })}
        </g>
        {/* 割れ目と明るい面 */}
        <g stroke={KRP.ink} strokeWidth={4.5} fill="none" strokeLinecap="round">
          <path d="M 560 560 L 590 640 L 570 720 L 610 820" /><path d="M 1560 520 L 1530 610 L 1580 700" />
          <path d="M 1700 900 L 1660 980 L 1690 1080 L 1650 1160" /><path d="M 500 1000 L 540 1080 L 520 1160" />
        </g>
        <path d="M 1500 120 Q 1650 160 1760 120 L 1800 260 Q 1640 300 1520 250 Z" fill={C.sandstoneLite} opacity={0.6} />
        <path d="M 440 700 Q 520 680 600 720 L 580 860 Q 500 880 450 840 Z" fill={C.sandstoneLite} opacity={0.5} />
        {/* 崖のやぶ */}
        {[[480, 380], [1620, 380], [1760, 760], [460, 1180], [1520, 1240]].map(([bx, by], i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 12 + i) * 3} ${bx} ${by})`}>
            <ellipse cx={bx} cy={by} rx={70} ry={34} fill={C.bush} stroke={KRP.ink} strokeWidth={4.5} />
            <ellipse cx={bx + 40} cy={by - 18} rx={40} ry={24} fill={C.bush} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ))}
        {/* 洞窟の口 (幅720) */}
        <path d="M 690 480 Q 680 230 860 160 Q 1060 100 1260 160 Q 1440 240 1430 480 Q 1060 512 690 480 Z" fill={C.caveDark} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 760 470 Q 770 290 900 230 Q 1060 180 1220 230 Q 1350 300 1360 470 Z" fill={C.caveBlack} opacity={0.8} />
        {/* 口の上のひさしの影 */}
        <path d="M 760 210 Q 1060 120 1360 210 Q 1060 160 760 210 Z" fill={C.sandstoneDark} />
        {/* 洞窟の中の作業灯 */}
        <g>
          <line x1={1260} y1={470} x2={1280} y2={380} stroke={KRP.grayDark} strokeWidth={6} />
          <line x1={1300} y1={470} x2={1280} y2={380} stroke={KRP.grayDark} strokeWidth={6} />
          <circle cx={1280} cy={374} r={18} fill={C.lampLight} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={1200} cy={440} rx={160} ry={60} fill={C.lampLight} opacity={0.22 + Math.sin(f / 6) * 0.04} />
        </g>
        {/* 口の下のふち */}
        <path d="M 670 478 Q 1060 520 1450 476 L 1460 512 Q 1060 560 660 514 Z" fill={C.sandstoneLite} stroke={KRP.ink} strokeWidth={6} />
        {/* 木の足場 */}
        {poles.map((px) => (
          <rect key={px} x={px - 11} y={520} width={22} height={1100} rx={6} fill={C.scaffold} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {[760, 1120, 1460].map((py) => (
          <g key={py}>
            <rect x={740} y={py} width={490} height={26} rx={5} fill={C.scaffold} stroke={KRP.ink} strokeWidth={5} />
            <rect x={760} y={py - 70} width={450} height={12} rx={5} fill={C.scaffold} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={760 + k * 70} y1={py} x2={760 + k * 70} y2={py + 26} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
        ))}
        <g stroke={KRP.ink} strokeWidth={4}>
          <line x1={800} y1={786} x2={980} y2={1120} /><line x1={1160} y1={786} x2={980} y2={1120} />
          <line x1={800} y1={1146} x2={980} y2={1460} /><line x1={1160} y1={1146} x2={980} y2={1460} />
        </g>
        {/* 縄の結び目 */}
        {poles.flatMap((px) => [760, 1120].map((py) => (
          <circle key={`${px}-${py}`} cx={px} cy={py + 12} r={9} fill={C.rope} stroke={KRP.ink} strokeWidth={3} />
        )))}
        {/* 縄ばしご (口のふちから垂れて、ゆれる) */}
        <g transform={`rotate(${ladderRot} 1330 500)`}>
          <line x1={1300} y1={500} x2={1300} y2={1500} stroke={C.rope} strokeWidth={8} />
          <line x1={1360} y1={500} x2={1360} y2={1500} stroke={C.rope} strokeWidth={8} />
          <line x1={1300} y1={500} x2={1300} y2={1500} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
          {Array.from({ length: 16 }, (_, k) => (
            <rect key={k} x={1294} y={540 + k * 60} width={72} height={12} rx={5} fill={C.scaffold} stroke={KRP.ink} strokeWidth={3.5} />
          ))}
          <circle cx={1300} cy={500} r={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={1360} cy={500} r={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 道具: バケツと土のう (上の足場) */}
        <g>
          <path d="M 1100 760 L 1090 700 L 1150 700 L 1140 760 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 1092 702 Q 1120 670 1148 702" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
          <ellipse cx={850} cy={744} rx={40} ry={18} fill={C.rope} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 上の研究者 (手を振る) */}
        <Person x={980} y={760} s={0.8} f={f} pose="raise" face="joy" helmet cloth={C.khaki} clothDark={C.khakiDark} phase={1} />
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6 + 0.4 * wave}>
          <path d={`M ${1050 + wave * 6} 540 q 14 -12 0 -28`} />
          <path d={`M ${1074 + wave * 6} 548 q 20 -18 0 -42`} />
        </g>
        {/* 下の研究者 (見上げる) */}
        {/* 下の段の研究者は顔が字幕の帯 (y>854) に入るので外した (検品で修正) */}
        {/* 鳥 */}
        {[0, 1].map((i) => {
          const bx = 1580 + Math.cos(f / 12 + i * 3) * 120, by = 300 + Math.sin(f / 12 + i * 3) * 50 + i * 60;
          const wv = Math.sin(f / 2 + i) * 9;
          return <path key={i} d={`M ${bx - 22} ${by - wv} Q ${bx - 8} ${by - 6} ${bx} ${by + 3} Q ${bx + 8} ${by - 6} ${bx + 22} ${by - wv}`}
            fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />;
        })}
      </g>
      {/* ここはどこ: 国旗と地名札 (画面に固定) */}
      <YcFlag x={110} y={170} w={170} id="yc20flag" f={f} />
      <TagPlate x={300} y={400} text="ボーダー洞窟" size={44} t={seg(f, 4, 16)} />
    </Frame>
  );
};

// ---- 文#21 【山】 この洞窟の床から、少なくとも20万年前の、寝床の跡が見つかりました。
// 設計: 洞窟の中の発掘区画。方眼の糸、番号札、刷毛で床を掘る研究者。土の断面に薄い植物の層が現れる。「少なくとも20万年前」札
// どこ: ボーダー洞窟の中。岩の天井と奥の暗がり。床に杭と白い糸の1m方眼、区画の番号札
// 演出: 手前の研究者が膝をついて刷毛で断面を掃く。奥の研究者はヘッドランプでメモ。刷毛の下から薄い植物の層が現れる
// 動き: カメラが断面へ寄る / 刷毛が左右に動き、植物の層が f6〜36 で左右へ広がる / 砂ぼこり / ヘッドランプの光がゆれる / 鉛筆が動く
const Yw021: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const rev = easeOut(seg(f, 6, 36));
  const rw = 40 + 470 * rev;
  const rcx = 900;
  const kx = 820, kFloor = 610, ks = 0.95, kLean = 28;
  const [hx, hy] = kneelHand(kx, kFloor, ks, kLean, 1);
  const wig = Math.sin(f / 2.2) * 26;
  // 方眼: 奥 y=450 (x 560〜1360) → 手前 y=640 (x 260〜1660)
  const rowT = [0, 0.3, 0.62, 1];
  const gy = (t: number) => lerp(450, 640, t);
  const gx = (c: number, t: number) => lerp(lerp(560, 1360, c / 5), lerp(260, 1660, c / 5), t);
  const tags: [number, number, string][] = [[0, 0, "A1"], [2, 0, "C1"], [4, 0, "E1"], [1, 1, "B2"], [3, 1, "D2"], [0, 2, "A3"], [4, 2, "E3"]];
  return (
    <Frame f={f} seed={2022} bg={C.caveDark}>
      <defs>
        <radialGradient id="yc21lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.lampLight} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.lampLight} stopOpacity={0} />
        </radialGradient>
        <clipPath id="yc21rev"><rect x={rcx - rw} y={600} width={rw * 2} height={200} /></clipPath>
      </defs>
      <g transform={`translate(900 690) scale(${zoom}) translate(-900 -690)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.caveDark} />
        {/* 奥の岩壁のでこぼこ */}
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={100 + i * 220} cy={330 + rnd(4, i) * 80} rx={150} ry={110 + rnd(5, i) * 40}
            fill={i % 2 ? C.caveRock : C.caveRockLite} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        ))}
        {/* 奥の暗がり */}
        <ellipse cx={980} cy={380} rx={260} ry={90} fill={C.caveBlack} />
        {/* 天井と垂れた岩 */}
        <path d="M -60 -60 L 1980 -60 L 1980 200 Q 1800 240 1700 190 L 1660 290 L 1620 200 Q 1400 250 1200 180 L 1170 260 L 1130 180 Q 900 230 700 170 L 660 300 L 620 180 Q 400 230 260 170 L 230 250 L 190 170 Q 80 200 -60 170 Z"
          fill={C.caveRock} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <g stroke={C.caveDark} strokeWidth={5} fill="none" opacity={0.7}>
          <path d="M 120 60 Q 300 100 460 50" /><path d="M 760 90 Q 960 50 1120 100" /><path d="M 1400 60 Q 1600 110 1800 70" />
        </g>
        {/* 照明 (三脚のライトとコード) */}
        <ellipse cx={1500} cy={560} rx={520} ry={180} fill="url(#yc21lamp)" />
        <g stroke={KRP.ink} strokeWidth={6}>
          <line x1={1700} y1={300} x2={1650} y2={520} /><line x1={1700} y1={300} x2={1760} y2={520} /><line x1={1700} y1={300} x2={1710} y2={530} />
        </g>
        <rect x={1640} y={250} width={110} height={70} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} transform="rotate(-18 1695 285)" />
        <rect x={1646} y={262} width={30} height={46} rx={6} fill={C.lampLight} transform="rotate(-18 1695 285)" />
        <path d="M 1710 530 Q 1760 600 1880 580 Q 1940 570 1990 620" fill="none" stroke={KRP.orange} strokeWidth={7} strokeLinecap="round" />
        {/* 床 (発掘面) */}
        <path d="M -60 430 L 1980 430 L 1980 650 L -60 650 Z" fill={C.dirt} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1250} cy={540} rx={600} ry={110} fill={C.lampLight} opacity={0.18} />
        {/* 方眼の糸と杭 */}
        <g stroke={KRP.white} strokeWidth={3.5}>
          {[0, 1, 2, 3, 4, 5].map((c) => <line key={c} x1={gx(c, 0)} y1={gy(0)} x2={gx(c, 1)} y2={gy(1)} />)}
          {rowT.map((t, j) => <line key={j} x1={gx(0, t)} y1={gy(t)} x2={gx(5, t)} y2={gy(t)} />)}
        </g>
        {rowT.flatMap((t, j) => [0, 1, 2, 3, 4, 5].map((c) => (
          <rect key={`${c}-${j}`} x={gx(c, t) - 5} y={gy(t) - 16} width={10} height={20} fill={YP.wood} stroke={KRP.ink} strokeWidth={2.5} />
        )))}
        {tags.map(([c, j, tx]) => {
          const t = (rowT[j] + rowT[j + 1]) / 2;
          const cx = (gx(c, t) + gx(c + 1, t)) / 2, cy = gy(t);
          return (
            <g key={tx}>
              <rect x={cx - 30} y={cy - 18} width={60} height={34} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <text x={cx} y={cy + 9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>{tx}</text>
            </g>
          );
        })}
        {/* 道具: ふるいとバケツとこて */}
        <ellipse cx={330} cy={560} rx={110} ry={34} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={330} cy={556} rx={90} ry={24} fill="none" stroke={KRP.grayDark} strokeWidth={3} strokeDasharray="6 5" />
        <path d="M 470 600 L 460 520 L 540 520 L 530 600 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1520 620 L 1600 600 L 1610 614 L 1530 634 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        {/* 手前の土の断面 */}
        <rect x={-60} y={640} width={W + 120} height={500} fill={C.dirtDeep} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -60 640 L 1980 640 L 1980 682 Q 960 676 -60 684 Z" fill={C.dirt} />
        <path d="M -60 708 Q 960 702 1980 710 L 1980 780 Q 960 790 -60 776 Z" fill={C.dirtDark} />
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse key={i} cx={rnd(8, i) * 1920} cy={800 + rnd(9, i) * 240} rx={10 + rnd(10, i) * 14} ry={7 + rnd(11, i) * 8}
            fill={i % 3 ? KRP.grayDark : KRP.gray} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 植物の層 (刷毛の下から現れる) */}
        <g clipPath="url(#yc21rev)">
          <path d="M -60 676 Q 960 670 1980 676 L 1980 716 Q 960 708 -60 714 Z" fill={C.plant} />
          {Array.from({ length: 60 }, (_, i) => {
            const x0 = 380 + i * 18;
            return <path key={i} d={`M ${x0} ${688 + (i % 3) * 5} q 12 ${-3 + (i % 2) * 6} 26 0`} fill="none"
              stroke={i % 2 ? C.plantDark : C.plantLite} strokeWidth={3} strokeLinecap="round" />;
          })}
        </g>
        <path d={`M ${rcx - rw} 676 Q ${rcx} 670 ${rcx + rw} 676`} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={rev} />
        <path d={`M ${rcx - rw} 715 Q ${rcx} 708 ${rcx + rw} 715`} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={rev} />
        {/* 砂ぼこり */}
        {Array.from({ length: 6 }, (_, i) => {
          const ph = ((f * 3 + i * 23) % 60) / 60;
          return <circle key={i} cx={hx + 60 + wig + (i - 2.5) * 22 * (1 + ph)} cy={696 - ph * 60} r={6 + ph * 14}
            fill="none" stroke={C.plantLite} strokeWidth={3} opacity={(1 - ph) * 0.8} />;
        })}
        {/* 奥の研究者 (ヘッドランプでメモ) */}
        <path d={`M 1318 ${300} L ${1220 + Math.sin(f / 8) * 10} 470 L ${1330 + Math.sin(f / 8) * 10} 490 Z`} fill={C.lampLight} opacity={0.35} />
        <Person x={1300} y={560} s={0.85} f={f} pose="hold" face="normal" gaze={[-3, 4]} helmet cloth={C.khaki} clothDark={C.khakiDark} phase={2} />
        <circle cx={1300} cy={344} r={12} fill={C.lampLight} stroke={KRP.ink} strokeWidth={3.5} />
        <g transform="rotate(-14 1290 462)">
          <rect x={1244} y={420} width={92} height={112} rx={6} fill={YP.wood} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={1254} y={432} width={72} height={92} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={1262} y1={450 + k * 18} x2={1262 + (k === 3 ? 30 * seg(f, 10, 40) : 54)} y2={450 + k * 18} stroke={KRP.grayDark} strokeWidth={3} />)}
          <line x1={1300 + Math.sin(f / 1.5) * 8} y1={500} x2={1340 + Math.sin(f / 1.5) * 8} y2={470} stroke={KRP.orange} strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* 手前の研究者 (膝をついて刷毛で掃く) */}
        <YcKneel id="yc21kneel" x={kx} floorY={kFloor} s={ks} f={f} lean={kLean} helmet face="normal" gaze={[4, 5]}
          cloth={C.khaki} clothDark={C.khakiDark} phase={0}>
          <g transform={`rotate(${wig * 0.4} ${hx} ${hy})`}>
            <line x1={hx} y1={hy} x2={hx + 50 + wig} y2={hy + 120} stroke={YP.wood} strokeWidth={14} strokeLinecap="round" />
            <line x1={hx} y1={hy} x2={hx + 50 + wig} y2={hy + 120} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
            <path d={`M ${hx + 30 + wig} ${hy + 112} L ${hx + 76 + wig} ${hy + 112} L ${hx + 86 + wig} ${hy + 148} L ${hx + 22 + wig} ${hy + 148} Z`}
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <circle cx={hx} cy={hy} r={10} fill={C.glove} stroke={KRP.ink} strokeWidth={4} />
        </YcKneel>
        {/* 札と矢印 */}
        <Arrow x={1180} y={694} s={0.7} rot={180} t={seg(f, 26, 34)} />
        <TagPlate x={1460} y={770} text="少なくとも20万年前" size={38} t={seg(f, 28, 38)} />
      </g>
    </Frame>
  );
};

// ---- 文#22 【並】 材料は、幅の広い、イネのなかまの草です。
// 設計: ルーペに寄る。ルーペの丸の中に、炭になった幅広の葉の断片と葉脈。脇に今の草 (幅広の葉) を並べて比べる研究者の手
// どこ: 発掘現場の作業台 (板の机)。ふるい・試料の小袋・ラベル・ピンセット・方眼の物差し
// 演出: 直径660pxのルーペが主役。丸の中に炭になった幅広の葉の断片と平行な葉脈。右から研究者の手袋の手が今の生きた草を並べて見比べる
// 動き: 今の草が右から差し出される (f4〜22) / 葉脈に沿って光が走る / ルーペの中の倍率がじわっと上がる / 手がわずかにゆれる
const Yw022: React.FC<{ f: number }> = ({ f }) => {
  const LX = 800, LY = 470, LR = 330;
  const mag = 1 + 0.1 * easeInOut(seg(f, 0, 40));
  const slide = 420 * (1 - easeOut(seg(f, 4, 22)));
  const shake = Math.sin(f / 6) * 3;
  // 葉の断片 (横向きに描いて、斜めに回す)
  const charOutline = "M -300 -60 L -270 -82 L -230 -70 L -190 -88 L -120 -80 L 0 -86 L 120 -80 L 200 -84 L 240 -66 L 280 -74 L 310 -40 L 290 -10 L 316 20 L 280 52 L 300 76 L 220 80 L 100 84 L 0 78 L -120 84 L -210 76 L -250 86 L -290 60 L -310 30 L -284 0 L -312 -30 Z";
  return (
    <Frame f={f} seed={2023} bg={C.table}>
      <defs>
        <clipPath id="yc22lens"><circle cx={LX} cy={LY} r={LR} /></clipPath>
      </defs>
      {/* 作業台の板 */}
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.table} />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <line x1={-40} y1={i * 200 + 80} x2={W + 40} y2={i * 200 + 80} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          <path d={`M -40 ${i * 200 + 150} q 480 ${rnd(6, i) * 30 - 15} 980 0 q 480 ${rnd(7, i) * 30 - 15} 980 0`} fill="none" stroke={C.tableDark} strokeWidth={4} />
        </g>
      ))}
      {/* ふるい (左上) */}
      <g transform={`rotate(${Math.sin(f / 10) * 1.5} 170 170)`}>
        <circle cx={170} cy={170} r={170} fill={YP.wood} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={170} cy={170} r={140} fill={C.tableDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.grayDark} strokeWidth={2.5} opacity={0.9}>
          {Array.from({ length: 13 }, (_, i) => <line key={`a${i}`} x1={50 + i * 20} y1={40} x2={50 + i * 20} y2={300} />)}
          {Array.from({ length: 13 }, (_, i) => <line key={`b${i}`} x1={40} y1={50 + i * 20} x2={300} y2={50 + i * 20} />)}
        </g>
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={110 + rnd(12, i) * 130} cy={110 + rnd(13, i) * 130} r={6 + rnd(14, i) * 6} fill={C.char} />)}
      </g>
      {/* 試料の小袋とラベル */}
      {[[1500, 840, -8, "BC-21"], [1760, 760, 10, "BC-22"], [140, 760, 6, "BC-19"]].map(([bx, by, r, lb], i) => (
        <g key={i} transform={`rotate(${r} ${bx} ${by})`}>
          <rect x={(bx as number) - 110} y={(by as number) - 80} width={220} height={170} rx={8} fill={C.bag} stroke={KRP.ink} strokeWidth={5} opacity={0.95} />
          <rect x={(bx as number) - 110} y={(by as number) - 80} width={220} height={22} fill={KRP.red} opacity={0.7} />
          <rect x={(bx as number) - 80} y={(by as number) - 40} width={160} height={50} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <text x={bx as number} y={(by as number) - 5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>{lb}</text>
          <ellipse cx={bx as number} cy={(by as number) + 45} rx={40} ry={16} fill={C.char} opacity={0.8} />
        </g>
      ))}
      {/* 方眼の物差し */}
      <g transform="rotate(-4 1500 980)">
        <rect x={1040} y={960} width={900} height={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 45 }, (_, i) => <line key={i} x1={1060 + i * 20} y1={960} x2={1060 + i * 20} y2={i % 5 ? 978 : 992} stroke={KRP.ink} strokeWidth={3} />)}
      </g>
      {/* ピンセット */}
      <g transform="rotate(30 1260 120)">
        <path d="M 1100 110 L 1420 118 L 1420 126 L 1100 140 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* ルーペの影 */}
      <circle cx={LX + 26} cy={LY + 30} r={LR + 20} fill={KRP.ink} opacity={0.18} />
      {/* ルーペの取っ手 */}
      <line x1={LX - 0.72 * (LR + 30)} y1={LY + 0.72 * (LR + 30)} x2={300} y2={1000} stroke={KRP.ink} strokeWidth={84} strokeLinecap="round" />
      <line x1={LX - 0.72 * (LR + 30)} y1={LY + 0.72 * (LR + 30)} x2={300} y2={1000} stroke={YP.woodDark} strokeWidth={70} strokeLinecap="round" />
      <line x1={LX - 0.72 * (LR + 30)} y1={LY + 0.72 * (LR + 30)} x2={460} y2={810} stroke={YP.brass} strokeWidth={76} />
      {/* ルーペの中 (拡大) */}
      <circle cx={LX} cy={LY} r={LR} fill={C.lensGlass} />
      <g clipPath="url(#yc22lens)">
        <g transform={`translate(${LX} ${LY}) scale(${mag}) translate(${-LX} ${-LY})`}>
          <rect x={LX - LR} y={LY - LR} width={LR * 2} height={LR * 2} fill={C.table} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${LX - LR} ${LY - 200 + i * 180} q 220 40 660 -10`} fill="none" stroke={C.tableDark} strokeWidth={14} opacity={0.7} />
          ))}
          {/* 白い試料皿 */}
          <circle cx={LX} cy={LY} r={290} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} opacity={0.92} />
          <g transform={`translate(${LX} ${LY}) rotate(-28) scale(0.95)`}>
            <path d={charOutline} fill={C.char} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            {/* 平行な葉脈 */}
            {Array.from({ length: 11 }, (_, k) => {
              const yy = -66 + k * 14;
              return <path key={k} d={`M -280 ${yy} Q 0 ${yy + (k % 2 ? 3 : -3)} 290 ${yy}`} fill="none" stroke={C.charVein} strokeWidth={k === 5 ? 7 : 3.5} />;
            })}
            {/* 葉脈に沿って走る光 */}
            {[1, 4, 5, 8].map((k, j) => {
              const yy = -66 + k * 14;
              return <path key={`l${k}`} d={`M -280 ${yy} Q 0 ${yy} 290 ${yy}`} fill="none" stroke={YP.glow} strokeWidth={5}
                strokeLinecap="round" strokeDasharray="90 900" strokeDashoffset={-((f * 22 + j * 140) % 990) + 90} opacity={0.9} />;
            })}
            {/* ひび・焦げのかけ */}
            <path d="M -60 -86 L -40 -30 L -70 20" fill="none" stroke={KRP.ink} strokeWidth={3} />
            <path d="M 150 84 L 160 30 L 130 -10" fill="none" stroke={KRP.ink} strokeWidth={3} />
            {[[-200, 100], [240, -110], [60, 120]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={8} fill={C.char} />)}
          </g>
        </g>
        {/* ガラスのつや */}
        <path d={`M ${LX - 240} ${LY - 120} Q ${LX - 180} ${LY - 250} ${LX - 40} ${LY - 280}`} fill="none" stroke={KRP.white} strokeWidth={22} strokeLinecap="round" opacity={0.6} />
      </g>
      {/* レンズの枠 */}
      <circle cx={LX} cy={LY} r={LR} fill="none" stroke={KRP.ink} strokeWidth={40} />
      <circle cx={LX} cy={LY} r={LR} fill="none" stroke={YP.brass} strokeWidth={28} />
      <circle cx={LX} cy={LY} r={LR - 14} fill="none" stroke={KRP.ink} strokeWidth={4} />
      {/* 今の草を持つ手 (右から差し出す) */}
      <g transform={`translate(${slide} ${shake})`}>
        <g transform="rotate(36 1560 600)">
          <path d="M 1560 600 C 1440 560, 1220 540, 1040 600 C 1220 640, 1440 650, 1560 630 Z" fill={C.leafGreen} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
          {[-14, -6, 2, 10, 18].map((d, k) => (
            <path key={k} d={`M 1550 ${615 + d * 0.6} Q 1300 ${598 + d} 1070 ${603 + d * 0.3}`} fill="none" stroke={C.leafVein} strokeWidth={k === 2 ? 5 : 3} />
          ))}
        </g>
        <path d="M 1990 700 L 1720 600 L 1690 680 L 1960 790 Z" fill={C.khaki} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={1676} y={590} width={40} height={96} rx={10} fill={C.khakiDark} stroke={KRP.ink} strokeWidth={5} transform="rotate(22 1696 638)" />
        <ellipse cx={1630} cy={620} rx={70} ry={56} fill={C.glove} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M 1580 590 Q 1550 600 1560 625" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={1570} cy={600} rx={26} ry={18} fill={C.glove} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1580} cy={648} rx={28} ry={18} fill={C.glove} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 札 */}
      <TagPlate x={660} y={105} text="20万年前" size={40} t={seg(f, 2, 14)} rot={-3} />
      <TagPlate x={1500} y={105} text="今の草" size={40} t={seg(f, 20, 30)} rot={3} />
    </Frame>
  );
};

// ---- 文#23 【山】 草を床に敷きつめて、寝る場所を作っていたのです。
// 設計: 20万年前の洞窟の中。毛皮色の服の Person 2人が両腕いっぱいの草を運び、床に広げる。焚き火・岩壁・入口の夕日。草が1束ずつ床に広がっていく
// どこ: 20万年前の洞窟の中、夕方。左の入口から夕日が差し込む。岩壁の凹凸、天井から下がる岩
// 演出: 1人が両腕いっぱいの草の束を抱えて入口から運び込む。1人は壁ぎわで膝をついて草を広げる。焚き火のそばに草の寝床ができていく
// 動き: 運ぶ人が歩いてくる / 寝床が f4〜36 で1束ずつ5束広がる / 炎がゆれ火の粉が上る / 夕日の光の帯がゆらぐ / カメラが右へ少しパン
const Yw023: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  const walk = easeOut(seg(f, 0, 32));
  const ax = lerp(220, 560, walk);
  const as = 0.95;
  const bx = 1690, bFloor = 700, bs = 0.92, bLean = -26;
  const [lhx, lhy] = kneelHand(bx, bFloor, bs, bLean, -1);
  const [rhx, rhy] = kneelHand(bx, bFloor, bs, bLean, 1);
  // 1束 = 横に寝た幅広の葉7枚
  const bundle = (cx: number, cy: number, k: number, t: number) => {
    const sc = pop(t);
    if (sc <= 0) return null;
    return (
      <g key={k} transform={`translate(${cx} ${cy - (1 - easeOut(t)) * 40}) scale(${sc})`}>
        <ellipse cx={0} cy={18} rx={110} ry={20} fill={KRP.ink} opacity={0.25} />
        {Array.from({ length: 7 }, (_, j) => (
          <g key={j} transform={`rotate(${-90 + (j - 3) * 6 + (rnd(k, j) - 0.5) * 8}) translate(${(j - 3) * 4} ${0})`}>
            <YcBlade x={(j - 3) * 6} y={110} h={230} w={28} bend={(rnd(k + 9, j) - 0.5) * 30}
              fill={j % 2 ? C.grassFresh : C.grassFreshDark} rib={C.plantLite} sw={3.5} />
          </g>
        ))}
      </g>
    );
  };
  return (
    <Frame f={f} seed={2024} bg={C.caveDark} dark>
      <defs>
        <linearGradient id="yc23sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskMid} />
          <stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
        <radialGradient id="yc23fire" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.fire1} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.fire2} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${pan} 0) translate(960 540) scale(1.04) translate(-960 -540)`}>
        <rect x={-80} y={-60} width={W + 160} height={H + 120} fill={C.caveDark} />
        {/* 入口の外: 夕焼けと遠い丘と夕日 */}
        <path d="M -80 120 Q 120 100 250 200 Q 330 360 310 560 Q 300 680 260 720 L -80 720 Z" fill="url(#yc23sun)" />
        <circle cx={120} cy={520} r={70} fill={C.fire1} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -80 560 Q 60 520 160 570 Q 240 540 300 580 L 300 720 L -80 720 Z" fill={C.ridgeMid} stroke={KRP.ink} strokeWidth={4} />
        {/* 夕日の光の帯 */}
        <path d={`M 240 260 L 300 700 L ${1300 + Math.sin(f / 9) * 20} 820 L ${1100 + Math.sin(f / 9) * 20} 620 Z`} fill={C.duskLow} opacity={0.16} />
        {/* 奥の岩壁 */}
        <path d="M 280 160 Q 600 90 1000 140 Q 1500 100 1980 150 L 1980 720 L 300 720 Q 330 400 280 160 Z" fill={C.caveRock} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={420 + i * 160} cy={300 + rnd(41, i) * 260} rx={70 + rnd(42, i) * 50} ry={40 + rnd(43, i) * 40}
            fill={i % 2 ? C.caveRockLite : C.caveRock} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        ))}
        {/* 焚き火に照らされる壁 */}
        <ellipse cx={760} cy={600} rx={560} ry={360} fill="url(#yc23fire)" opacity={0.85 + Math.sin(f / 2.5) * 0.15} />
        {/* 天井と垂れた岩 */}
        <path d="M -80 -60 L 1980 -60 L 1980 170 Q 1820 200 1720 160 L 1690 260 L 1650 160 Q 1400 210 1240 150 L 1210 230 L 1170 150 Q 960 190 820 130 L 790 220 L 750 130 Q 520 160 380 110 Q 240 80 -80 100 Z"
          fill={C.caveBlack} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 入口の縁の岩 */}
        <path d="M 230 120 Q 330 300 320 560 Q 310 700 260 740 L 360 760 Q 420 500 360 140 Z" fill={C.caveBlack} stroke={KRP.ink} strokeWidth={5} />
        {/* 床 */}
        <path d="M -80 700 Q 900 680 1980 710 L 1980 1140 L -80 1140 Z" fill={C.dirtDeep} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={760} cy={820} rx={520} ry={120} fill={C.fire2} opacity={0.18} />
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={i} cx={rnd(44, i) * 1920} cy={760 + rnd(45, i) * 300} rx={14} ry={8} fill={C.caveRock} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 草の寝床 (壁ぎわに1束ずつ) */}
        {[0, 1, 2, 3, 4].map((k) => bundle(940 + k * 150, 690, k, seg(f, 4 + k * 6, 12 + k * 6)))}
        {/* 焚き火 */}
        <YcFire x={700} y={800} s={0.85} f={f} />
        {/* 膝をついて草を広げる人 */}
        <YcKneel id="yc23kneel" x={bx} floorY={bFloor} s={bs} f={f} lean={bLean} hair="cap" face="smile" gaze={[-5, 4]}
          cloth={YP.fur} clothDark={YP.furDark} phase={2}>
          {[0, 1, 2].map((j) => (
            <g key={j} transform={`rotate(${-80 + j * 14 + Math.sin(f / 4 + j) * 6} ${lhx} ${lhy})`}>
              <YcBlade x={lhx} y={lhy} h={170} w={24} bend={10} fill={C.grassFresh} rib={C.plantLite} sw={3.5} />
            </g>
          ))}
          <circle cx={lhx} cy={lhy} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={rhx} cy={rhy} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </YcKneel>
        {/* 草の束を抱えて運ぶ人 */}
        <Person x={ax} y={720} s={as} f={f} pose="hold" face="joy" hair="cap" cloth={YP.fur} clothDark={YP.furDark} phase={0} />
        <g transform={`translate(${ax} ${720 - 112 * as})`}>
          {Array.from({ length: 9 }, (_, j) => (
            <g key={j} transform={`rotate(${-90 + (j - 4) * 5 + Math.sin(f / 5 + j) * 3})`}>
              <YcBlade x={(j - 4) * 4} y={150} h={300} w={26} bend={(j - 4) * 6 + Math.sin(f / 6 + j) * 10}
                fill={j % 2 ? C.grassFresh : C.grassFreshDark} rib={C.plantLite} sw={3.5} />
            </g>
          ))}
          <rect x={-30} y={-14} width={60} height={22} rx={8} fill={YP.furDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 歩いた砂ぼこり */}
        {walk < 1 && [0, 1].map((i) => (
          <circle key={i} cx={ax - 60 - i * 40} cy={712} r={12 + i * 8} fill="none" stroke={C.caveRockLite} strokeWidth={3} opacity={0.6 * (1 - walk)} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#24 【図】 しかも、草の下からは、灰の層が見つかっています。
// 設計: 発掘の壁面 (世界=土の断面)。上から草の層・灰の層・岩。刷毛が動いて灰の灰色の帯が現れる。層の名前の札
// どこ: ボーダー洞窟の発掘の壁面 (断面) を正面から画面いっぱいに。土のでこぼこ・小石・根
// 演出: 上から 草の層 / 灰の層 / 岩盤。灰の層はまだ土をかぶっていて、右から大きな刷毛が掃くと明るい灰色が現れる
// 動き: 刷毛が f6〜30 で右から左へ (毛先がしなる) / 掃いたあとに砂ぼこり / 層の札が f30〜40 で出る / カメラがわずかに寄る
const Yw024: React.FC<{ f: number }> = ({ f }) => {
  const bp = easeInOut(seg(f, 6, 30));
  const brushX = lerp(1760, 230, bp);
  const lift = easeOut(seg(f, 30, 40));
  const bend = Math.sin(f / 1.6) * 8;
  const zoom = 1 + 0.03 * seg(f, 0, 42);
  const top = (x: number, base: number, k: number) => base + Math.sin(x / 140 + k) * 10 + Math.sin(x / 47 + k * 3) * 4;
  const band = (y1: number, y2: number, k: number) => {
    const pts1: string[] = [], pts2: string[] = [];
    for (let x = -60; x <= 1980; x += 60) { pts1.push(`${x} ${top(x, y1, k).toFixed(1)}`); pts2.unshift(`${x} ${top(x, y2, k + 1).toFixed(1)}`); }
    return `M ${pts1.join(" L ")} L ${pts2.join(" L ")} Z`;
  };
  return (
    <Frame f={f} seed={2025} bg={C.topsoil}>
      <defs>
        <clipPath id="yc24cover"><rect x={-60} y={380} width={brushX + 60} height={260} /></clipPath>
      </defs>
      <g transform={`translate(960 540) scale(${zoom}) translate(-960 -540)`}>
        {/* 表土 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.topsoil} />
        {Array.from({ length: 22 }, (_, i) => (
          <ellipse key={i} cx={rnd(51, i) * 1920} cy={30 + rnd(52, i) * 200} rx={12 + rnd(53, i) * 16} ry={9 + rnd(54, i) * 9}
            fill={i % 2 ? KRP.gray : KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {/* 根 */}
        <g fill="none" stroke={YP.woodDark} strokeWidth={4} strokeLinecap="round">
          <path d="M 300 -20 Q 320 80 280 160 Q 270 200 300 230" /><path d="M 300 100 Q 360 140 380 200" />
          <path d="M 1300 -20 Q 1280 60 1330 140 Q 1350 180 1320 240" /><path d="M 1320 90 Q 1260 130 1240 190" />
        </g>
        {/* 草の層 */}
        <path d={band(250, 400, 0)} fill={C.plant} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 70 }, (_, i) => {
          const x0 = (i % 14) * 140 + (Math.floor(i / 14) % 2) * 60, y0 = 280 + Math.floor(i / 14) * 24;
          return <path key={i} d={`M ${x0} ${y0} q 30 ${-6 + (i % 3) * 5} 70 ${(i % 2) * 4 - 2}`} fill="none"
            stroke={i % 2 ? C.plantDark : C.plantLite} strokeWidth={4} strokeLinecap="round" />;
        })}
        {/* 灰の層 (ふわっとした明るい灰色) */}
        <path d={band(400, 600, 2)} fill={C.ash} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 48 }, (_, i) => (
          <circle key={i} cx={(i % 16) * 124 + rnd(55, i) * 60} cy={430 + Math.floor(i / 16) * 52 + rnd(56, i) * 20}
            r={14 + rnd(57, i) * 16} fill={C.ashLite} opacity={0.8} />
        ))}
        {Array.from({ length: 12 }, (_, i) => <circle key={`c${i}`} cx={rnd(58, i) * 1900} cy={440 + rnd(59, i) * 130} r={5} fill={KRP.grayDark} />)}
        {/* まだ土をかぶっている部分 (刷毛の左) */}
        <g clipPath="url(#yc24cover)">
          <path d={band(398, 602, 2)} fill={C.cover} />
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={rnd(60, i) * 1900} cy={430 + rnd(61, i) * 140} r={6 + rnd(62, i) * 8} fill={C.topsoil} />
          ))}
        </g>
        {/* 掃いたすじ (刷毛の右) */}
        <g fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.7}>
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} d={`M ${brushX + 60} ${440 + k * 34} q ${120} ${-10} ${Math.max(0, 1700 - brushX) * 0.5} 0`} />
          ))}
        </g>
        {/* 岩盤 */}
        <path d={band(600, 1140, 4)} fill={C.bedrock} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.bedrockDark} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d="M 200 660 L 260 760 L 230 880" /><path d="M 700 640 L 680 740 L 740 820" /><path d="M 1200 650 L 1260 760" />
          <path d="M 1600 640 L 1560 740 L 1620 860" /><path d="M 0 800 Q 500 780 900 820 T 1980 800" />
        </g>
        {/* 物差し (左端) */}
        <g>
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={70} y={120 + i * 90} width={40} height={90} fill={i % 2 ? KRP.white : KRP.red} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <circle cx={90} cy={110} r={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 砂ぼこり (刷毛のすぐ後ろ) */}
        {bp > 0 && bp < 1 && Array.from({ length: 7 }, (_, i) => {
          const ph = ((f * 2 + i * 9) % 20) / 20;
          return <circle key={i} cx={brushX + 70 + ph * 120 + i * 10} cy={500 - ph * 90 + (i - 3) * 16} r={8 + ph * 18}
            fill="none" stroke={C.ashLite} strokeWidth={4} opacity={1 - ph} />;
        })}
        {/* 大きな刷毛 */}
        <g transform={`translate(${brushX} ${500 - lift * 120}) rotate(${-20 - lift * 20})`}>
          <rect x={30} y={-30} width={300} height={44} rx={20} fill={YP.wood} stroke={KRP.ink} strokeWidth={6} transform="rotate(-30 30 -8)" />
          <rect x={-10} y={-44} width={70} height={74} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M -10 -44 L -90 ${-60 + bend} L -96 ${44 + bend} L -10 30 Z`} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          {[-30, -10, 10].map((dy, k) => <path key={k} d={`M -14 ${dy} L -88 ${dy + bend * 0.6}`} stroke={YP.brassDark} strokeWidth={3} />)}
        </g>
        {/* 層の札 */}
        <Arrow x={1580} y={326} s={0.62} rot={180} t={seg(f, 30, 36)} />
        <TagPlate x={1760} y={326} text="草" size={46} t={seg(f, 30, 36)} />
        <Arrow x={1580} y={500} s={0.62} rot={180} t={seg(f, 32, 38)} />
        <TagPlate x={1760} y={500} text="灰" size={46} t={seg(f, 32, 38)} color={KRP.red} />
        <Arrow x={1580} y={720} s={0.62} rot={180} t={seg(f, 34, 40)} />
        <TagPlate x={1760} y={720} text="岩" size={46} t={seg(f, 34, 40)} />
      </g>
    </Frame>
  );
};

// ---- 文#25 【並】 研究者は、灰を敷くことで、虫を寄せつけないようにしたのではないかと考えています。
// 設計: 灰の上を歩いてきたアリの列がUターン。手前で研究者がノートに書き込み、「推測」の札。★「推測」を必ず見せる
// どこ: 洞窟の床の高さ (アリの目線)。奥に暗い岩壁、床を縦に横切る灰の帯
// 演出: 左から歩いてきたアリの行列が、灰の帯の手前で次々Uターン。右上で研究者がノートに書き、首をかしげる。赤い枠の「推測」札
// 動き: アリが歩き (脚が交互に動く)、f14〜30 に先頭から順に反転 / 反転のときに小さな驚きの線 / 鉛筆が動く / カメラがアリを追って少しパン
const YcAnt: React.FC<{ x: number; y: number; rot: number; f: number; ph: number }> = ({ x, y, rot, f, ph }) => {
  const sw = Math.sin(f * 1.3 + ph) * 12;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={14} rx={44} ry={6} fill={KRP.ink} opacity={0.2} />
      {/* 脚 (3対。交互に振る) */}
      <g stroke={C.ant} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[-1, 0, 1].map((k) => {
          const s1 = (k % 2 === 0 ? sw : -sw);
          return (
            <g key={k}>
              <path d={`M ${k * 7} 0 L ${k * 12 + s1 * 0.6} -16 L ${k * 20 + s1} -24`} />
              <path d={`M ${k * 7} 0 L ${k * 12 - s1 * 0.6} 16 L ${k * 20 - s1} 24`} />
            </g>
          );
        })}
      </g>
      {/* 腹・胸・頭 */}
      <ellipse cx={-26} cy={0} rx={19} ry={13} fill={C.ant} stroke={KRP.ink} strokeWidth={3} />
      <path d="M -36 -5 Q -26 -9 -16 -5" fill="none" stroke={KRP.grayDark} strokeWidth={2.5} />
      <ellipse cx={0} cy={0} rx={11} ry={7} fill={C.ant} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={19} cy={0} r={9.5} fill={C.ant} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={-30} cy={-4} r={3.5} fill={KRP.white} opacity={0.6} />
      {/* 触角 */}
      <g stroke={C.ant} strokeWidth={3} fill="none" strokeLinecap="round">
        <path d={`M 24 -5 L 32 -16 L ${44 + sw * 0.2} -14`} />
        <path d={`M 24 5 L 32 16 L ${44 - sw * 0.2} 14`} />
      </g>
    </g>
  );
};
const Yw025: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  const edgeAt = (y: number) => 1060 + (1010 - 1060) * (y - 470) / 610;
  const lane = 670, R = 36, sp = 30;
  const edge = edgeAt(lane) - 44;
  const turnLen = Math.PI * R;
  const arrivals = [14, 17, 20, 23, 26, 29, 32, 36, 41, 47];
  const ants = arrivals.map((arr, i) => {
    const ph = sp * (f - arr);
    if (ph < 0) return { x: edge + ph, y: lane, rot: 0, i, turn: 0 };
    if (ph < turnLen) {
      const a = (ph / turnLen) * Math.PI;
      return { x: edge + R * Math.sin(a), y: lane + R - R * Math.cos(a), rot: (a * 180) / Math.PI, i, turn: 1 - ph / 160 };
    }
    return { x: edge - (ph - turnLen), y: lane + 2 * R, rot: 180, i, turn: Math.max(0, 1 - ph / 160) };
  });
  return (
    <Frame f={f} seed={2026} bg={C.caveDark}>
      <g transform={`translate(${pan} 0)`}>
        <rect x={-80} y={-60} width={W + 160} height={H + 120} fill={C.caveDark} />
        {/* 奥の岩壁 */}
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx={-40 + i * 290} cy={260 + rnd(71, i) * 100} rx={190} ry={170}
            fill={i % 2 ? C.caveRock : C.caveRockLite} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
        ))}
        {/* 床 (目の高さの地面) */}
        <path d="M -80 470 Q 960 456 2000 470 L 2000 1140 L -80 1140 Z" fill={C.dirt} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 30 }, (_, i) => {
          const yy = 490 + rnd(72, i) ** 1.6 * 560;
          const sc = 0.4 + (yy - 470) / 600;
          return <ellipse key={i} cx={rnd(73, i) * 2000 - 40} cy={yy} rx={14 * sc} ry={7 * sc} fill={i % 3 ? C.dirtDark : KRP.gray} stroke={KRP.ink} strokeWidth={2.5} />;
        })}
        {/* 寝床のこぼれた草 (左手前) */}
        {[0, 1, 2, 3].map((k) => (
          <g key={k} transform={`rotate(${-96 + k * 9} ${120 + k * 70} 900)`}>
            <YcBlade x={120 + k * 70} y={900} h={340} w={34} bend={20} fill={k % 2 ? C.plant : C.plantDark} rib={C.plantLite} sw={4} />
          </g>
        ))}
        {/* 灰の帯 */}
        <path d="M 1060 470 L 1180 470 L 1460 1140 L 1000 1140 Z" fill={C.ash} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 26 }, (_, i) => {
          const yy = 490 + rnd(74, i) * 560;
          const t = (yy - 470) / 670;
          const xl = lerp(1060, 1000, t), xr = lerp(1180, 1460, t);
          return <circle key={i} cx={lerp(xl + 10, xr - 10, rnd(75, i))} cy={yy} r={(6 + rnd(76, i) * 10) * (0.5 + t)} fill={C.ashLite} />;
        })}
        <TagPlate x={1270} y={560} text="灰" size={36} t={seg(f, 2, 12)} />
        {/* 研究者 (右上、首をかしげてノートに書く) */}
        <g transform="rotate(-6 1600 520)">
          <Person x={1600} y={520} s={0.9} f={f} pose="hold" face="worried" glasses helmet gaze={[-3, 3]}
            cloth={C.khaki} clothDark={C.khakiDark} phase={4} />
          <g transform="rotate(-10 1600 414)">
            <rect x={1550} y={380} width={100} height={72} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={1600} y1={380} x2={1600} y2={452} stroke={KRP.ink} strokeWidth={3} />
            {[0, 1, 2].map((k) => <line key={k} x1={1608} y1={398 + k * 16} x2={1608 + (k === 2 ? 34 * seg(f, 14, 40) : 34)} y2={398 + k * 16} stroke={KRP.grayDark} strokeWidth={3} />)}
            <line x1={1630 + Math.sin(f / 1.4) * 6} y1={440} x2={1666 + Math.sin(f / 1.4) * 6} y2={404} stroke={KRP.orange} strokeWidth={7} strokeLinecap="round" />
          </g>
        </g>
        <QMark x={1730} y={270} s={0.5} f={f} t={seg(f, 18, 28)} />
        {/* ★推測 (赤い枠) */}
        <g opacity={seg(f, 20, 28)}>
          <rect x={1600 - 92} y={150 - 54} width={184} height={108} rx={16} fill="none" stroke={KRP.red} strokeWidth={8} />
        </g>
        <TagPlate x={1600} y={150} text="推測" size={48} t={seg(f, 20, 28)} color={KRP.red} />
        {/* アリの行列 */}
        {ants.map((a) => (
          <g key={a.i}>
            <YcAnt x={a.x} y={a.y} rot={a.rot} f={f} ph={a.i * 1.7} />
            {a.turn > 0 && (
              <g stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" opacity={a.turn}>
                <line x1={a.x + 30} y1={a.y - 40} x2={a.x + 38} y2={a.y - 58} />
                <line x1={a.x + 46} y1={a.y - 30} x2={a.x + 62} y2={a.y - 40} />
                <line x1={a.x + 14} y1={a.y - 44} x2={a.x + 12} y2={a.y - 62} />
              </g>
            )}
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#26 【並】 寝床のそばには、虫よけに使われる、香りの強い低木の跡も残っていました。
// 設計: 灰緑の細い葉の低木の枝。香りの波線がゆらゆら立ち、蚊がふらふらと遠ざかる。「香りの強い低木」札
// どこ: 洞窟の土の床、寝床のすぐそば。奥は焚き火に照らされた岩壁
// 演出: 香りの強い低木の枝が主役 (灰緑の細い葉36枚、ところどころ白っぽい葉裏)。香りの波線が立ちのぼり、蚊3匹が触れるとふらふら逃げる
// 動き: 香りの波線が上へ流れる / 蚊が近づき (〜f20) 波線に触れて目を回し遠ざかる / 枝がゆれる / カメラがゆっくり寄る
const YcMosquito: React.FC<{ x: number; y: number; rot: number; f: number; dizzy: number; flip: boolean }> = ({ x, y, rot, f, dizzy, flip }) => {
  const wing = 0.6 + Math.abs(Math.sin(f * 2.1)) * 0.4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1.45 : 1.45} 1.45)`}>
      {/* 脚 */}
      <g stroke={KRP.ink} strokeWidth={2.5} fill="none" strokeLinecap="round">
        <path d="M -4 4 L -18 30 L -26 52" /><path d="M 2 4 L 0 34 L -4 58" /><path d="M 8 4 L 22 30 L 34 50" />
      </g>
      {/* 羽 */}
      <g transform={`scale(1 ${wing})`}>
        <ellipse cx={8} cy={-24} rx={30} ry={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} opacity={0.75} transform="rotate(-20 8 -24)" />
        <ellipse cx={14} cy={-18} rx={26} ry={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} opacity={0.6} transform="rotate(-40 14 -18)" />
      </g>
      {/* 体と針 */}
      <ellipse cx={22} cy={2} rx={24} ry={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2.5} />
      {[10, 18, 26, 34].map((sx) => <line key={sx} x1={sx} y1={-4} x2={sx} y2={8} stroke={KRP.ink} strokeWidth={1.5} />)}
      <ellipse cx={-6} cy={0} rx={9} ry={7} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2.5} />
      <circle cx={-16} cy={-1} r={6} fill={KRP.ink} />
      <line x1={-20} y1={0} x2={-46} y2={6} stroke={KRP.ink} strokeWidth={2.5} strokeLinecap="round" />
      {/* 目を回す */}
      {dizzy > 0.05 && (
        <path d={`M -16 -30 m -10 0 a 10 10 0 1 1 10 10 a 6 6 0 1 1 -4 -6`} fill="none" stroke={C.scent} strokeWidth={3}
          opacity={dizzy} transform={`rotate(${f * 20} -16 -30)`} />
      )}
    </g>
  );
};
const Yw026: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const sway = Math.sin(f / 11) * 1.6;
  // 枝 (2次ベジェ): [始点, 制御点, 終点]
  const branches: [number, number, number, number, number, number][] = [
    [880, 760, 760, 560, 520, 380],
    [900, 700, 1000, 480, 1180, 270],
    [920, 650, 1150, 600, 1420, 470],
    [870, 820, 700, 760, 560, 640],
  ];
  const at = (b: typeof branches[number], t: number) => {
    const [x0, y0, cx, cy, x1, y1] = b;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    return [x, y, (Math.atan2(dy, dx) * 180) / Math.PI] as const;
  };
  const leaves = branches.flatMap((b, bi) => Array.from({ length: 9 }, (_, j) => {
    const t = 0.25 + j * 0.085;
    const [x, y, ang] = at(b, t);
    const side = j % 2 ? 1 : -1;
    return { x, y, a: ang + side * (48 + rnd(81 + bi, j) * 14) + Math.sin(f / 7 + j + bi) * 4, under: (j + bi) % 3 === 0, k: `${bi}-${j}` };
  }));
  // 香りの波線
  const scents = [[560, 360], [760, 470], [1180, 250], [1000, 440], [1420, 450], [620, 620]];
  const scentPath = (x0: number, y0: number, k: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 12; i++) {
      const yy = y0 - i * 22;
      pts.push(`${(x0 + Math.sin(i * 0.8 - f / 5 + k) * (10 + i * 2)).toFixed(1)} ${yy}`);
    }
    return "M " + pts.join(" L ");
  };
  // 蚊: [来る位置, 触れる位置, 逃げる先, 触れる時刻]
  const mq: [number, number, number, number, number, number, number][] = [
    [1800, 380, 1500, 330, 1680, 170, 16],
    [150, 420, 520, 250, 300, 400, 20],
    [1800, 700, 1460, 600, 1700, 660, 24],
  ];
  return (
    <Frame f={f} seed={2027} bg={C.caveDark}>
      <g transform={`translate(960 560) scale(${zoom}) translate(-960 -560)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.caveDark} />
        {/* 奥の岩壁と焚き火の照り返し */}
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={i * 320} cy={300 + rnd(82, i) * 120} rx={220} ry={200}
            fill={i % 2 ? C.caveRock : C.caveRockLite} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
        ))}
        <ellipse cx={1600} cy={700} rx={500} ry={300} fill={C.fire2} opacity={0.12 + Math.sin(f / 3) * 0.03} />
        {/* 土の床 */}
        <path d="M -60 760 Q 960 730 1980 770 L 1980 1140 L -60 1140 Z" fill={C.dirt} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse key={i} cx={rnd(83, i) * 1920} cy={800 + rnd(84, i) * 260} rx={16} ry={8} fill={C.dirtDark} stroke={KRP.ink} strokeWidth={2.5} />
        ))}
        {/* 寝床の草のはし (右下) */}
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k} transform={`rotate(${-84 + k * 5} ${1500 + k * 60} 880)`}>
            <YcBlade x={1500 + k * 60} y={880} h={420} w={36} bend={-16} fill={k % 2 ? C.plant : C.grassFreshDark} rib={C.plantLite} sw={4} />
          </g>
        ))}
        {/* 低木 */}
        <g transform={`rotate(${sway} 880 860)`}>
          <path d="M 860 900 Q 870 820 880 760 Q 890 700 900 650" fill="none" stroke={KRP.ink} strokeWidth={36} strokeLinecap="round" />
          <path d="M 860 900 Q 870 820 880 760 Q 890 700 900 650" fill="none" stroke={C.shrubWood} strokeWidth={26} strokeLinecap="round" />
          {branches.map((b, i) => (
            <g key={i}>
              <path d={`M ${b[0]} ${b[1]} Q ${b[2]} ${b[3]} ${b[4]} ${b[5]}`} fill="none" stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
              <path d={`M ${b[0]} ${b[1]} Q ${b[2]} ${b[3]} ${b[4]} ${b[5]}`} fill="none" stroke={C.shrubWood} strokeWidth={12} strokeLinecap="round" />
            </g>
          ))}
          {leaves.map((l) => (
            <g key={l.k} transform={`translate(${l.x} ${l.y}) rotate(${l.a})`}>
              <path d="M 0 0 Q 40 -16 92 0 Q 40 16 0 0 Z" fill={l.under ? C.shrubUnder : C.shrubLeaf} stroke={KRP.ink} strokeWidth={3.5} />
              <line x1={4} y1={0} x2={86} y2={0} stroke={l.under ? C.shrubLeaf : C.shrubUnder} strokeWidth={2.5} />
            </g>
          ))}
          {/* 枝先の葉のかたまり */}
          {branches.map((b, i) => [-30, 0, 30].map((d) => (
            <g key={`${i}${d}`} transform={`translate(${b[4]} ${b[5]}) rotate(${at(b, 1)[2] + d})`}>
              <path d="M 0 0 Q 36 -13 80 0 Q 36 13 0 0 Z" fill={d === 0 ? C.shrubUnder : C.shrubLeaf} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          )))}
        </g>
        {/* 香りの波線 (上へ流れる) */}
        {scents.map(([sx, sy], k) => {
          const rise = ((f * 4 + k * 40) % 120);
          return (
            <g key={k} transform={`translate(0 ${-rise})`} opacity={1 - rise / 140}>
              <path d={scentPath(sx, sy, k)} fill="none" stroke={C.scent} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
            </g>
          );
        })}
        {/* 蚊 */}
        {mq.map(([x0, y0, x1, y1, x2, y2, hit], i) => {
          const a = easeOut(seg(f, 0, hit));
          const r = easeInOut(clamp01((f - hit) / 22));
          const x = f < hit ? lerp(x0, x1, a) : lerp(x1, x2, r) + Math.sin(f * 0.9 + i) * 24 * r;
          const y = f < hit ? lerp(y0, y1, a) + Math.sin(f / 2 + i) * 6 : lerp(y1, y2, r) + Math.cos(f * 0.7 + i) * 20 * r;
          const goingRight = f < hit ? x1 > x0 : x2 > x1;
          return <YcMosquito key={i} x={x} y={y} rot={f < hit ? 0 : Math.sin(f * 0.8 + i) * 25} f={f} dizzy={f < hit ? 0 : 1} flip={goingRight} />;
        })}
        {/* 触れた瞬間のはじける線 */}
        {mq.map(([, , x1, y1, , , hit], i) => {
          const t = seg(f, hit, hit + 8);
          return t > 0 && t < 1 ? (
            <g key={`h${i}`} stroke={C.scent} strokeWidth={5} strokeLinecap="round" opacity={1 - t}>
              {[0, 1, 2, 3, 4].map((k) => {
                const a = (k / 5) * Math.PI * 2;
                return <line key={k} x1={x1 + Math.cos(a) * 30} y1={y1 + Math.sin(a) * 30} x2={x1 + Math.cos(a) * (30 + 40 * t)} y2={y1 + Math.sin(a) * (30 + 40 * t)} />;
              })}
            </g>
          ) : null;
        })}
        <TagPlate x={380} y={770} text="香りの強い低木" size={40} t={seg(f, 4, 16)} />
      </g>
    </Frame>
  );
};

// ---- 文#27 【山】 時代はくだって、約7万7千年前。同じ南アフリカの、シブドゥ洞窟です。
// 設計: 年代ダイヤル (#17と同じ装置) が7万7千年前で止まる → 川沿いの崖の下の大きな岩陰。川・木・崖。「シブドゥ洞窟」札
// どこ: 南アフリカ東部、川沿いの崖の下の大きな岩陰 (シブドゥ)。左寄りの川岸に年代ダイヤル
// 演出: ダイヤルが「20万年前」から回って「7万7千年前」で止まり、光る。張り出した岩の屋根の下、浅い岩陰に焚き火の跡。手前を川が流れる
// 動き: ダイヤルが f0〜16 で回り止まる (止まった瞬間に光の輪) / カメラがダイヤルの寄りから引いて岩陰へパン (f12〜40) / 川の線が流れる / 木がゆれる / 煙が細く立つ
const Yw027: React.FC<{ f: number }> = ({ f }) => {
  const sp = easeOut(seg(f, 0, 16));
  const spin = 720 * sp;
  const label = f < 16 ? "20万年前" : "7万7千年前";
  const ring = seg(f, 16, 28);
  const k = easeInOut(seg(f, 12, 40));
  const sc = lerp(1.45, 1, k);
  const tx = lerp(960 - 400 * 1.45, 0, k);
  const ty = lerp(540 - 470 * 1.45, 0, k);
  return (
    <Frame f={f} seed={2028} bg={C.skyDay}>
      <defs>
        <linearGradient id="yc27sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyDay} />
          <stop offset="1" stopColor={C.skyDayLow} />
        </linearGradient>
      </defs>
      <g transform={`translate(${tx} ${ty}) scale(${sc})`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#yc27sky)" />
        {/* 遠い緑の丘 */}
        <path d="M -60 560 Q 200 440 420 520 Q 640 430 900 520 L 900 760 L -60 760 Z" fill={C.hillGreen} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`translate(${Math.sin(f / 30) * 10} 0)`}>
          <path d="M 120 200 Q 130 150 190 160 Q 220 110 290 140 Q 350 130 360 190 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 560 130 Q 570 90 620 100 Q 650 70 700 96 Q 740 90 750 130 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 崖と張り出した岩の屋根 */}
        <path d="M 820 -60 L 1980 -60 L 1980 700 L 1880 700 Q 1850 560 1760 500 Q 1560 430 1300 420 Q 1080 410 960 370 Q 870 330 860 260 Q 850 120 820 -60 Z"
          fill={C.sibuRock} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g fill="none" stroke={C.sibuRockDark} strokeWidth={6} strokeLinecap="round" opacity={0.8}>
          <path d="M 900 60 Q 1300 90 1980 50" /><path d="M 880 170 Q 1300 210 1980 160" /><path d="M 920 290 Q 1300 330 1980 280" />
        </g>
        {/* 岩の屋根の裏 (影) と浅い奥壁 */}
        <path d="M 960 370 Q 1080 410 1300 420 Q 1560 430 1760 500 Q 1850 560 1880 700 L 1040 680 Q 1000 520 960 370 Z" fill={C.sibuRockDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1020 420 Q 1400 480 1780 530 L 1800 600 Q 1400 560 1040 500 Z" fill={C.caveRock} opacity={0.5} />
        {/* 岩陰の床と焚き火の跡 */}
        <path d="M 1000 650 Q 1400 620 1900 660 L 1900 700 L 1000 700 Z" fill={C.sibuSand} stroke={KRP.ink} strokeWidth={5} />
        <g>
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2;
            return <ellipse key={i} cx={1420 + Math.cos(a) * 50} cy={660 + Math.sin(a) * 14} rx={16} ry={10} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3.5} />;
          })}
          <ellipse cx={1420} cy={660} rx={34} ry={9} fill={C.char} />
          <path d={`M 1420 650 Q ${1410 + Math.sin(f / 5) * 10} 600 1424 560 Q ${1440 + Math.sin(f / 6) * 10} 520 1430 480`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
          {/* 草の寝床の跡 */}
          <ellipse cx={1680} cy={668} rx={110} ry={16} fill={C.plant} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 地名札と国旗 (崖の上) */}
        <YcFlag x={1000} y={70} w={160} id="yc27flag" f={f} />
        <TagPlate x={1380} y={150} text="シブドゥ洞窟" size={42} t={seg(f, 24, 34)} />
        {/* 川岸と川 */}
        <path d="M -60 690 Q 600 670 1200 700 Q 1600 710 1980 690 L 1980 720 L -60 720 Z" fill={C.hillGreen} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-60} y={716} width={W + 120} height={440} fill={C.river} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-60} y={840} width={W + 120} height={300} fill={C.riverDeep} opacity={0.5} />
        {Array.from({ length: 12 }, (_, i) => {
          const yy = 740 + (i % 6) * 50;
          const xx = ((i * 330 + f * 9) % 2300) - 200;
          return <path key={i} d={`M ${xx} ${yy} q 40 -12 80 0 q 40 12 80 0`} fill="none" stroke={C.riverLite} strokeWidth={5} strokeLinecap="round" />;
        })}
        {/* 葦 */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={640 + i * 22} y1={720} x2={640 + i * 22 + Math.sin(f / 8 + i) * 10} y2={600 - (i % 3) * 30}
            stroke={C.treeGreen} strokeWidth={6} strokeLinecap="round" />
        ))}
        {/* 川辺の木 */}
        <g transform={`rotate(${Math.sin(f / 14) * 1.5} 760 700)`}>
          <path d="M 750 700 L 744 520 Q 740 460 760 420 L 776 420 Q 780 480 776 700 Z" fill={YP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {[[700, 400, 90], [800, 360, 100], [760, 300, 90], [850, 430, 70]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? C.treeGreen : C.hillGreen} stroke={KRP.ink} strokeWidth={5} />
          ))}
        </g>
        {/* ダイヤルの立つ岩 */}
        <path d="M 120 720 Q 140 660 220 650 L 600 650 Q 680 660 690 720 Z" fill={C.sibuRockDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 年代ダイヤル */}
        {ring > 0 && ring < 1 && (
          <circle cx={400} cy={470} r={190 + ring * 120} fill="none" stroke={YP.glow} strokeWidth={14 * (1 - ring)} opacity={1 - ring} />
        )}
        <AgeDial x={400} y={470} s={0.7} spin={spin} label={label} handle={spin * 3} />
      </g>
    </Frame>
  );
};

// ---- 文#28 【図】 ここでは、草や葉を何層にも重ねた寝床が見つかりました。
// 設計: 発掘の壁面。縞模様の層が下から1枚ずつ積み上がり、何層にもなる。層の数を数える目盛り
// どこ: シブドゥの岩陰の発掘の壁面 (#24 とは別の壁)。赤みの砂の土、角ばった黒い石片、細い層
// 演出: 草の層と葉の層が交互に、下から1枚ずつ積み上がって7層。右に層を数える縦の目盛りと番号。左上に「草/葉」の見本カード
// 動き: 層が f4〜38 で1枚ずつ上から落ちて重なる (着地で砂が散る) / 番号が順に点く / カメラがゆっくり上へパン
const Yw028: React.FC<{ f: number }> = ({ f }) => {
  const pan = 30 * (1 - easeInOut(seg(f, 0, 42)));
  const base = 780, th = 56, L0 = 170, L1 = 1540;
  const layer = (i: number) => {
    const t = seg(f, 4 + i * 5, 9 + i * 5);
    if (t <= 0) return null;
    const grass = i % 2 === 0;
    const y2 = base - th * i, y1 = y2 - th;
    const dy = -(1 - easeOut(t)) * 70;
    const wav = (x: number, y: number, k: number) => y + Math.sin(x / 110 + i * 1.7 + k) * 5;
    const pts1: string[] = [], pts2: string[] = [];
    for (let x = L0; x <= L1; x += 70) { pts1.push(`${x} ${wav(x, y1, 0).toFixed(1)}`); pts2.unshift(`${x} ${wav(x, y2, 1).toFixed(1)}`); }
    const fill = grass ? (i % 4 === 0 ? C.layerGrass : C.plantLite) : (i % 4 === 1 ? C.layerLeaf : C.plant);
    return (
      <g key={i} transform={`translate(0 ${dy})`} opacity={clamp01(t * 1.5)}>
        <path d={`M ${pts1.join(" L ")} L ${pts2.join(" L ")} Z`} fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
        {grass
          ? Array.from({ length: 30 }, (_, j) => (
            <path key={j} d={`M ${L0 + 20 + j * 45} ${y1 + 16 + (j % 3) * 11} q 26 ${(j % 2) * 6 - 3} 60 0`} fill="none"
              stroke={j % 2 ? C.plantDark : KRP.white} strokeWidth={3.5} strokeLinecap="round" opacity={0.85} />
          ))
          : Array.from({ length: 22 }, (_, j) => (
            <ellipse key={j} cx={L0 + 40 + j * 62 + (rnd(91 + i, j) - 0.5) * 20} cy={y1 + th / 2 + (rnd(92 + i, j) - 0.5) * 20}
              rx={22} ry={8} fill={C.layerLeafDark} stroke={KRP.ink} strokeWidth={2.5}
              transform={`rotate(${(rnd(93 + i, j) - 0.5) * 50} ${L0 + 40 + j * 62} ${y1 + th / 2})`} />
          ))}
        {/* 着地の砂 */}
        {t > 0.6 && t < 1 && [0, 1, 2, 3].map((k) => (
          <circle key={`s${k}`} cx={L0 + 200 + k * 360} cy={y1 - (t - 0.6) * 60} r={6} fill={C.sibuSand} opacity={(1 - t) * 2.5} />
        ))}
      </g>
    );
  };
  return (
    <Frame f={f} seed={2029} bg={C.sibuUpper}>
      <g transform={`translate(0 ${pan})`}>
        {/* 上の堆積 (赤みの砂) */}
        <rect x={-60} y={-60} width={W + 120} height={H + 160} fill={C.sibuUpper} />
        {Array.from({ length: 36 }, (_, i) => {
          const cx = rnd(94, i) * 1920, cy = rnd(95, i) * 1000;
          const r = 8 + rnd(96, i) * 14;
          return <polygon key={i} points={`${cx - r},${cy} ${cx - r * 0.2},${cy - r * 0.8} ${cx + r},${cy - r * 0.2} ${cx + r * 0.3},${cy + r * 0.7}`}
            fill={i % 3 ? C.sibuSandDark : C.bedrockDark} stroke={KRP.ink} strokeWidth={3} />;
        })}
        {/* 発掘で切り出した壁の枠 (層の掘り込み) */}
        <rect x={L0 - 20} y={330} width={L1 - L0 + 40} height={480} fill={C.sibuSand} stroke={KRP.ink} strokeWidth={6} />
        {/* いちばん下の砂層 */}
        <rect x={-60} y={base} width={W + 120} height={400} fill={C.sibuSandDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <polygon key={i} points={`${80 + i * 140},${850 + (i % 3) * 40} ${110 + i * 140},${830 + (i % 3) * 40} ${130 + i * 140},${860 + (i % 3) * 40}`}
            fill={C.bedrockDark} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 積み上がる層 */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => layer(i))}
        {/* 縦の目盛り */}
        <rect x={1600} y={base - th * 7 - 20} width={50} height={th * 7 + 40} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={1600} y1={base - th * i} x2={1650} y2={base - th * i} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`m${i}`} x1={1600} y1={base - th * i - th / 2} x2={1624} y2={base - th * i - th / 2} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const t = seg(f, 6 + i * 5, 10 + i * 5);
          if (t <= 0) return null;
          const cy = base - th * i - th / 2;
          return (
            <g key={`n${i}`} transform={`translate(1710 ${cy}) scale(${pop(t)})`}>
              <circle r={24} fill={i % 2 ? C.layerLeaf : C.layerGrass} stroke={KRP.ink} strokeWidth={4} />
              <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.ink}>{i + 1}</text>
            </g>
          );
        })}
        {/* 見本カード (釘で留めた札) */}
        <g transform="translate(40 80) rotate(-3 300 190)">
          <rect x={170} y={110} width={260} height={170} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={300} cy={124} r={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
          <rect x={196} y={150} width={70} height={40} fill={C.layerGrass} stroke={KRP.ink} strokeWidth={3.5} />
          <text x={290} y={182} fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.ink}>草</text>
          <rect x={196} y={212} width={70} height={40} fill={C.layerLeaf} stroke={KRP.ink} strokeWidth={3.5} />
          <ellipse cx={231} cy={232} rx={20} ry={7} fill={C.layerLeafDark} />
          <text x={290} y={244} fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.ink}>葉</text>
        </g>
        {/* 移植ごて (壁に刺さっている) */}
        <g transform="rotate(25 1780 200)">
          <polygon points="1740,200 1820,200 1780,290" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={1768} y={110} width={24} height={90} rx={8} fill={YP.wood} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        <TagPlate x={960} y={240} text="何層にも" size={48} t={seg(f, 34, 42)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_019: (f) => <Yw019 f={f} />,
  yw_020: (f) => <Yw020 f={f} />,
  yw_021: (f) => <Yw021 f={f} />,
  yw_022: (f) => <Yw022 f={f} />,
  yw_023: (f) => <Yw023 f={f} />,
  yw_024: (f) => <Yw024 f={f} />,
  yw_025: (f) => <Yw025 f={f} />,
  yw_026: (f) => <Yw026 f={f} />,
  yw_027: (f) => <Yw027 f={f} />,
  yw_028: (f) => <Yw028 f={f} />,
};

export const YW_B1_MOTIFS: string[] = [
  "yw_019",
  "yw_020",
  "yw_021",
  "yw_022",
  "yw_023",
  "yw_024",
  "yw_025",
  "yw_026",
  "yw_027",
  "yw_028",
];

export const yawaB1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
