// 「なぜ高層ビルは生まれたのか」: 第6章「高いほど、安い部屋だった。」1 (章扉〜亜鉛の屋根)
// 担当範囲: 台本 docs/koso-script-v7.txt の 218〜228行目 (文#217〜#227・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb6_ で始める。WobbleDefs の seed はこのファイルでは 850〜860 を使う。
// 設計書: docs/koso-ch6-design.md (1文ごとの「格」と絵の中身が決まっている)
//
// ★絵の「格」(制作ガイド §7 第3層-7)
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = クリーム地に図と札だけ。人も背景も置かない (25〜50行)
//   ★「図」「並」も品質は落とさない。短いのは賑やかさを削ったからで、雑に描いたからではない。
//     線・色・札・フォントは山と完全に同じ。必ず f で動く。図そのものを作り込む。
//     大きく置いて画面を使い切る (「小さい物を真ん中にポツンと」が最悪の失敗)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。

import React from "react";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, TowerOnPillars } from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。金物の色は BP を使う)
// ===================================================================
const C = {
  stone: "#E0D6C2",
  stoneDark: "#B6A88E",
  zinc: "#A9B0B4",
  zincDark: "#7B8488",
  amber: "#C9A06A",
  candle: "#F0C971",
  night: "#2B3A4A",
  nightPale: "#4C6076",
  gold: "#D9A93E",
  goldDark: "#9E7820",
  rain: "#8FA3B2",
  mudWater: "#6E7257",
  emerGreen: "#4FA06A",
  dark: "#39414B",
};

// ===================================================================
// このファイルだけのローカル部品
// ===================================================================

// ---- パリのアパートの断面 (#217/#219/#220/#224 で座標ごと共用) ----
const GND = 820;            // 地面
const FH = 116;             // 1階ぶんの高さ
const BX0 = 330, BX1 = 1150; // 躯体の左右
const IX0 = BX0 + 46, IX1 = BX1 - 44; // 室内の左右
const MTOP = 120;           // マンサード屋根の頂
const flBot = (n: number) => GND - (n - 1) * FH;
const flTop = (n: number) => GND - n * FH;
const flMid = (n: number) => GND - (n - 0.5) * FH;
const WIN_H: Record<number, number> = { 1: 96, 2: 88, 3: 78, 4: 62, 5: 50 };

/** 石の目地 (積み方の線) */
const Courses: React.FC<{ x: number; y: number; w: number; h: number; pitch?: number }> = ({
  x, y, w, h, pitch = 26,
}) => (
  <g stroke={C.stoneDark} strokeWidth={2.5} opacity={0.8}>
    {Array.from({ length: Math.floor(h / pitch) }, (_, i) => (
      <line key={i} x1={x} y1={y + (i + 1) * pitch} x2={x + w} y2={y + (i + 1) * pitch} />
    ))}
  </g>
);

/** 鉄のバルコニー (手摺)。x は壁面、下端 y */
const IronBalcony: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({
  x, y, w = 62, h = 54,
}) => (
  <g>
    <rect x={x - w} y={y} width={w + 8} height={10} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
    <g stroke={BP.iron} strokeWidth={5}>
      {Array.from({ length: Math.floor(w / 13) }, (_, i) => (
        <line key={i} x1={x - w + 7 + i * 13} y1={y} x2={x - w + 7 + i * 13} y2={y - h} />
      ))}
    </g>
    <rect x={x - w} y={y - h - 9} width={w + 8} height={11} rx={4}
      fill={BP.iron} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

/** シャンデリア (蝋燭つき)。天井 y から吊る */
const Lustre: React.FC<{ x: number; y: number; s?: number; f: number; t?: number; arms?: number }> = ({
  x, y, s = 1, f, t = 1, arms = 6,
}) => {
  const ap = clamp01(t);
  if (ap <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={ap}>
      <line x1={0} y1={0} x2={0} y2={46} stroke={BP.brassDark} strokeWidth={6} />
      <ellipse cx={0} cy={56} rx={16} ry={11} fill={BP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      {Array.from({ length: arms }, (_, i) => {
        const dx = (i - (arms - 1) / 2) * 23;
        const cy = 56 + Math.abs(dx) * 0.22;
        const fl = 4 + Math.sin((f + i * 9) / 5) * 2.2;
        return (
          <g key={i}>
            <path d={`M0 58 Q${dx * 0.6} ${cy + 18} ${dx} ${cy + 10}`}
              fill="none" stroke={BP.brassDark} strokeWidth={4.5} />
            <rect x={dx - 4} y={cy - 4} width={8} height={16} fill={C.candle} stroke={KRP.ink} strokeWidth={2.5} />
            <ellipse cx={dx} cy={cy - 9} rx={3.4} ry={fl} fill={KRP.orange} opacity={0.95} />
          </g>
        );
      })}
    </g>
  );
};

/** 寸法線 (横) */
const DimH: React.FC<{
  x1: number; x2: number; y: number; label: string; t?: number; size?: number; color?: string;
}> = ({ x1, x2, y, label, t = 1, size = 40, color = KRP.red }) => {
  const ap = easeOut(clamp01(t));
  if (ap <= 0) return null;
  const xe = lerp(x1, x2, ap);
  return (
    <g>
      <line x1={x1} y1={y - 20} x2={x1} y2={y + 20} stroke={color} strokeWidth={5} />
      <line x1={x2} y1={y - 20} x2={x2} y2={y + 20} stroke={color} strokeWidth={5} opacity={ap} />
      <line x1={x1} y1={y} x2={xe} y2={y} stroke={color} strokeWidth={6} />
      <polygon points={`${x1},${y} ${x1 + 22},${y - 11} ${x1 + 22},${y + 11}`} fill={color} />
      <polygon points={`${xe},${y} ${xe - 22},${y - 11} ${xe - 22},${y + 11}`} fill={color} />
      <text x={(x1 + x2) / 2} y={y - 16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color} stroke={KRP.white} strokeWidth={7} paintOrder="stroke"
        opacity={ap}>{label}</text>
    </g>
  );
};

/** 寸法線 (縦) */
const DimV: React.FC<{
  x: number; y1: number; y2: number; label: string; t?: number; size?: number; color?: string;
}> = ({ x, y1, y2, label, t = 1, size = 40, color = KRP.red }) => {
  const ap = easeOut(clamp01(t));
  if (ap <= 0) return null;
  const ye = lerp(y1, y2, ap);
  return (
    <g>
      <line x1={x - 20} y1={y1} x2={x + 20} y2={y1} stroke={color} strokeWidth={5} />
      <line x1={x - 20} y1={y2} x2={x + 20} y2={y2} stroke={color} strokeWidth={5} opacity={ap} />
      <line x1={x} y1={y1} x2={x} y2={ye} stroke={color} strokeWidth={6} />
      <polygon points={`${x},${y1} ${x - 11},${y1 + 22} ${x + 11},${y1 + 22}`} fill={color} />
      <polygon points={`${x},${ye} ${x - 11},${ye - 22} ${x + 11},${ye - 22}`} fill={color} />
      <text x={x + 18} y={(y1 + y2) / 2 + 12} textAnchor="start" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color} stroke={KRP.white} strokeWidth={7} paintOrder="stroke"
        opacity={ap}>{label}</text>
    </g>
  );
};

/** アパートの断面の躯体。#217/#219/#220/#224 で必ずこれを呼ぶ (形と座標をそろえる) */
const SectionShell: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 地面と舗石 */}
    <rect x={0} y={GND} width={W} height={H - GND} fill={C.stoneDark} opacity={0.45} />
    <line x1={0} y1={GND} x2={W} y2={GND} stroke={KRP.ink} strokeWidth={8} />
    <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.35}>
      {Array.from({ length: 24 }, (_, i) => (
        <line key={i} x1={i * 82} y1={GND + 8} x2={i * 82 - 16} y2={H} />
      ))}
    </g>
    {/* 躯体 */}
    <rect x={BX0} y={flTop(5)} width={BX1 - BX0} height={GND - flTop(5)}
      fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
    {/* 室内 (切り口の中) */}
    <rect x={IX0} y={flTop(5)} width={IX1 - IX0} height={GND - flTop(5)} fill={KRP.white} opacity={0.72} />
    {/* 外壁 (左。通りに面する) の石積み */}
    <Courses x={BX0} y={flTop(5)} w={IX0 - BX0} h={GND - flTop(5)} />
    {/* 切断面 (右) のハッチ */}
    <rect x={IX1} y={flTop(5)} width={BX1 - IX1} height={GND - flTop(5)} fill={C.stoneDark} opacity={0.5} />
    <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.5}>
      {Array.from({ length: 18 }, (_, i) => (
        <line key={i} x1={IX1} y1={flTop(5) + i * 34} x2={BX1} y2={flTop(5) + i * 34 - 44} />
      ))}
    </g>
    <line x1={IX1} y1={flTop(5)} x2={IX1} y2={GND} stroke={KRP.ink} strokeWidth={5} />
    <line x1={IX0} y1={flTop(5)} x2={IX0} y2={GND} stroke={KRP.ink} strokeWidth={5} />
    {/* 各階の床スラブ + 窓 + バルコニー */}
    {[1, 2, 3, 4, 5].map((n) => {
      const bot = flBot(n);
      const wh = WIN_H[n];
      const wy = bot - 22 - wh;
      return (
        <g key={n}>
          {/* 床 (飴色の木) */}
          <rect x={IX0} y={bot - 16} width={IX1 - IX0} height={18}
            fill={C.amber} stroke={KRP.ink} strokeWidth={4} />
          <rect x={IX0} y={bot + 2} width={IX1 - IX0} height={10} fill={C.stoneDark} opacity={0.7} />
          {/* 窓 (外壁の抜き) */}
          <rect x={BX0 + 6} y={wy} width={IX0 - BX0 - 12} height={wh}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={BX0 + 6} y1={wy + wh / 2} x2={IX0 - 6} y2={wy + wh / 2}
            stroke={KRP.ink} strokeWidth={3} />
          <rect x={BX0 - 4} y={bot - 26} width={IX0 - BX0 + 8} height={10}
            fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3.5} />
          {(n === 2 || n === 5) && <IronBalcony x={BX0 - 2} y={bot - 26} w={64} h={48} />}
        </g>
      );
    })}
    {/* 1階 = 店。アーチの入口と日除け */}
    <path d={`M${IX0 + 26} ${GND} L${IX0 + 26} ${GND - 100} Q${IX0 + 86} ${GND - 148} ${IX0 + 146} ${GND - 100} L${IX0 + 146} ${GND}`}
      fill={C.amber} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
    <path d={`M${BX0 - 92} ${flBot(1) - 128} L${BX0 - 6} ${flBot(1) - 160} L${BX0 - 6} ${flBot(1) - 118} Z`}
      fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} opacity={0.85} />
    {/* 軒 (コーニス) */}
    <rect x={BX0 - 30} y={flTop(5) - 26} width={BX1 - BX0 + 60} height={28} rx={5}
      fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
    <Rivets x1={BX0 - 10} y1={flTop(5) - 12} x2={BX1 + 10} y2={flTop(5) - 12} n={11} r={5} fill={C.stone} />
    {/* マンサード屋根 (亜鉛) = 屋根裏 */}
    <polygon points={`${BX0 - 24},${flTop(5) - 24} ${BX0 + 84},${MTOP} ${BX1 - 84},${MTOP} ${BX1 + 24},${flTop(5) - 24}`}
      fill={C.zinc} stroke={KRP.ink} strokeWidth={7} />
    <g stroke={C.zincDark} strokeWidth={4} opacity={0.9}>
      {[0.22, 0.42, 0.62, 0.82].map((u, i) => (
        <line key={i} x1={lerp(BX0 - 24, BX1 + 24, u)} y1={flTop(5) - 24}
          x2={lerp(BX0 + 84, BX1 - 84, u)} y2={MTOP} />
      ))}
    </g>
    {/* 屋根裏の天窓 (ルカルヌ) */}
    <rect x={700} y={MTOP + 18} width={92} height={76} rx={4}
      fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
    <line x1={746} y1={MTOP + 18} x2={746} y2={MTOP + 94} stroke={KRP.ink} strokeWidth={3} />
    {/* 屋根裏の鉄のベッド (ちっぽけ) */}
    <g>
      <rect x={430} y={flTop(5) - 62} width={118} height={12} fill={BP.iron} stroke={KRP.ink} strokeWidth={3.5} />
      <line x1={436} y1={flTop(5) - 62} x2={436} y2={flTop(5) - 88} stroke={BP.ironDark} strokeWidth={5} />
      <line x1={542} y1={flTop(5) - 62} x2={542} y2={flTop(5) - 78} stroke={BP.ironDark} strokeWidth={5} />
      <rect x={430} y={flTop(5) - 50} width={118} height={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
    {/* 煙突の列 */}
    {[BX0 + 150, BX0 + 330, BX1 - 220].map((cx, i) => (
      <g key={i}>
        <rect x={cx} y={MTOP - 76} width={52} height={80} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={cx - 8} y={MTOP - 90} width={68} height={18} rx={4} fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={cx + 26} cy={MTOP - 110 - ((f * 1.4 + i * 13) % 34)} rx={16} ry={11}
          fill={KRP.gray} opacity={0.4} />
      </g>
    ))}
  </g>
);

/** #219/#220/#224 の中身。どの階も同じ明るさ・同じ家具 (比べる絵なので差をつけない) */
const SectionPlain: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {[1, 2, 3, 4, 5].map((n) => {
      const bot = flBot(n);
      return (
        <g key={n} opacity={0.95}>
          {/* 卓 */}
          <rect x={IX0 + 230} y={bot - 62} width={110} height={11}
            fill={C.amber} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={IX0 + 242} y1={bot - 51} x2={IX0 + 242} y2={bot - 16} stroke={C.amber} strokeWidth={6} />
          <line x1={IX0 + 328} y1={bot - 51} x2={IX0 + 328} y2={bot - 16} stroke={C.amber} strokeWidth={6} />
          {/* 椅子 */}
          <rect x={IX0 + 368} y={bot - 48} width={46} height={9} fill={C.amber} stroke={KRP.ink} strokeWidth={3} />
          <line x1={IX0 + 412} y1={bot - 48} x2={IX0 + 412} y2={bot - 84} stroke={C.amber} strokeWidth={6} />
          <line x1={IX0 + 374} y1={bot - 39} x2={IX0 + 374} y2={bot - 16} stroke={C.amber} strokeWidth={5} />
          {/* 蝋燭 (全階おなじ明るさ) */}
          <rect x={IX0 + 278} y={bot - 84} width={9} height={22} fill={C.candle} stroke={KRP.ink} strokeWidth={2.5} />
          <ellipse cx={IX0 + 282} cy={bot - 90} rx={4} ry={6 + Math.sin((f + n * 7) / 5) * 1.8}
            fill={KRP.orange} opacity={0.9} />
        </g>
      );
    })}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// ===== #217 第6章、高いほど、安い部屋だった。 =====
// 格: 山
// どこ: 19世紀パリのアパートを道の側から切った断面。画面の左3分の2に建物、右に章題
// 演出: 下の階ほど豪華 (シャンデリア・絨毯・鏡)、上へ行くほど質素 (裸の蝋燭・鉄のベッド)
// 動き: 下の階から順に灯がともり、煙突の煙が流れ、カメラがわずかに引く
const Kb6ShouTobira: React.FC<{ f: number }> = ({ f }) => {
  const z = 1.06 - 0.06 * easeOut(clamp01(seg(f, 0, 36)));
  const lit = (n: number) => seg(f, 4 + (5 - n) * 4, 18 + (5 - n) * 4);
  return (
    <Frame f={f} seed={850} bg={KRP.cream}
      over={<ChapterDoor num={6} title="高いほど、安い部屋だった。" left={1250} top={600} width={620}
        t={seg(f, 14, 34)} />}>
      <g transform={zoomAt(z, 740, 520)}>
        <SectionShell f={f} />
        {/* 2階・3階 = 高貴な階。シャンデリア・絨毯・鏡・モールディング */}
        {[2, 3].map((n) => {
          const bot = flBot(n);
          return (
            <g key={n}>
              <rect x={IX0} y={flTop(n) + 4} width={IX1 - IX0} height={12}
                fill={C.gold} stroke={KRP.ink} strokeWidth={3} opacity={0.85} />
              <rect x={IX0 + 120} y={bot - 24} width={360} height={14} rx={4}
                fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} opacity={0.8} />
              <Lustre x={IX0 + 300} y={flTop(n) + 16} s={n === 2 ? 1 : 0.8} f={f} t={lit(n)} arms={n === 2 ? 6 : 5} />
              {/* 鏡 (切断面の壁に掛かる) */}
              <rect x={IX1 - 58} y={bot - 104} width={44} height={74} rx={6}
                fill={KRP.blueSoft} stroke={C.goldDark} strokeWidth={6} />
              {/* 肘掛け椅子 */}
              <rect x={IX0 + 150} y={bot - 60} width={74} height={38} rx={8}
                fill={C.amber} stroke={KRP.ink} strokeWidth={4} />
              <rect x={IX0 + 150} y={bot - 92} width={20} height={34} rx={6}
                fill={C.amber} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 4階・5階 = 質素。卓と裸の蝋燭だけ */}
        {[4, 5].map((n) => {
          const bot = flBot(n);
          const fl = 5 + Math.sin((f + n * 11) / 5) * 2;
          return (
            <g key={n}>
              <rect x={IX0 + 190} y={bot - 56} width={120} height={11}
                fill={C.amber} stroke={KRP.ink} strokeWidth={3.5} />
              <line x1={IX0 + 200} y1={bot - 45} x2={IX0 + 200} y2={bot - 16} stroke={C.amber} strokeWidth={6} />
              <line x1={IX0 + 300} y1={bot - 45} x2={IX0 + 300} y2={bot - 16} stroke={C.amber} strokeWidth={6} />
              <g opacity={clamp01(lit(n))}>
                <rect x={IX0 + 242} y={bot - 80} width={11} height={24}
                  fill={C.candle} stroke={KRP.ink} strokeWidth={2.5} />
                <ellipse cx={IX0 + 247} cy={bot - 86} rx={4.4} ry={fl} fill={KRP.orange} opacity={0.95} />
              </g>
            </g>
          );
        })}
        {/* 1階 = 店の棚 */}
        <g>
          <rect x={IX0 + 190} y={GND - 140} width={200} height={124}
            fill={C.amber} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
            <line x1={IX0 + 190} y1={GND - 98} x2={IX0 + 390} y2={GND - 98} />
            <line x1={IX0 + 190} y1={GND - 56} x2={IX0 + 390} y2={GND - 56} />
          </g>
        </g>
        {/* 豪華→質素の向き */}
        <ForceArrow x={1198} y={262} len={246} rot={90} w={22} color={C.goldDark}
          t={seg(f, 20, 40)} />
      </g>
      <TagPlate x={1300} y={212} text="質素" size={46} t={seg(f, 24, 38)} />
      <TagPlate x={1300} y={486} text="豪華" size={46} t={seg(f, 8, 22)} color={C.goldDark} />
      <TagPlate x={560} y={770} text="19世紀 パリ" size={44} t={seg(f, 2, 16)} />
    </Frame>
  );
};

// ===== #218 19世紀のパリに、同じ形のアパートが並びました。 =====
// ---- #218 用: パリのアパートの正面 (同じ形を4軒並べる) ----
const SGY = 700;   // 建物の足元
const STOP = 196;  // 軒
const SFH = (SGY - STOP) / 5;
const SROOF = 104; // 屋根の頂

const PariFacade: React.FC<{ x: number; w: number; f: number; i: number }> = ({ x, w, f, i }) => {
  const winX = [0.2, 0.5, 0.8].map((u) => x + w * u);
  return (
    <g>
      {/* 石の壁 */}
      <rect x={x} y={STOP} width={w} height={SGY - STOP} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
      <Courses x={x} y={STOP} w={w} h={SGY - STOP} pitch={34} />
      {/* 各階 */}
      {[1, 2, 3, 4, 5].map((n) => {
        const bot = SGY - (n - 1) * SFH;
        const h = n === 1 ? 104 : n === 2 ? 86 : n === 3 ? 78 : n === 4 ? 70 : 60;
        const wy = bot - 18 - h;
        return (
          <g key={n}>
            {/* 階の境の水平目地 */}
            <line x1={x} y1={bot} x2={x + w} y2={bot} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
            {winX.map((wx, k) => (
              <g key={k}>
                <rect x={wx - 31} y={wy} width={62} height={h} rx={3}
                  fill={C.dark} stroke={KRP.ink} strokeWidth={4.5} />
                <rect x={wx - 31} y={wy} width={62} height={h * 0.42} rx={3}
                  fill={KRP.blueSoft} opacity={0.75} />
                <line x1={wx} y1={wy} x2={wx} y2={wy + h} stroke={KRP.ink} strokeWidth={3} />
                {/* まぐさと窓台 */}
                <rect x={wx - 39} y={wy - 13} width={78} height={13} rx={3}
                  fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3.5} />
                <rect x={wx - 37} y={wy + h} width={74} height={11} rx={3}
                  fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3.5} />
                {/* 2階・5階以外は窓ごとの小さな手摺 */}
                {n !== 2 && n !== 5 && n !== 1 && (
                  <g stroke={BP.iron} strokeWidth={4}>
                    {Array.from({ length: 5 }, (_, b) => (
                      <line key={b} x1={wx - 26 + b * 13} y1={wy + h + 11} x2={wx - 26 + b * 13} y2={wy + h + 36} />
                    ))}
                    <line x1={wx - 32} y1={wy + h + 36} x2={wx + 32} y2={wy + h + 36}
                      stroke={KRP.ink} strokeWidth={6} />
                  </g>
                )}
              </g>
            ))}
            {/* 2階と5階は通しのバルコニー */}
            {(n === 2 || n === 5) && (
              <g>
                <rect x={x - 10} y={bot - 20} width={w + 20} height={12}
                  fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
                <g stroke={BP.iron} strokeWidth={5}>
                  {Array.from({ length: Math.floor(w / 17) }, (_, b) => (
                    <line key={b} x1={x - 4 + b * 17} y1={bot - 20} x2={x - 4 + b * 17} y2={bot - 64} />
                  ))}
                </g>
                <rect x={x - 10} y={bot - 74} width={w + 20} height={13} rx={5}
                  fill={BP.iron} stroke={KRP.ink} strokeWidth={4.5} />
              </g>
            )}
          </g>
        );
      })}
      {/* 1階 = 店。日除けと看板 */}
      <rect x={x + 22} y={SGY - 128} width={w - 44} height={128}
        fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x + 40} y={SGY - 104} width={w - 80} height={74} fill={C.dark} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M${x + 14} ${SGY - 128} L${x + w - 14} ${SGY - 128} L${x + w - 36} ${SGY - 182} L${x + 36} ${SGY - 182} Z`}
        fill={i % 2 ? KRP.red : C.goldDark} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      {/* 軒 */}
      <rect x={x - 16} y={STOP - 26} width={w + 32} height={28} rx={5}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
      <Rivets x1={x} y1={STOP - 12} x2={x + w} y2={STOP - 12} n={7} r={5} fill={C.stone} />
      {/* マンサード屋根 (亜鉛) */}
      <polygon points={`${x - 14},${STOP - 24} ${x + 52},${SROOF} ${x + w - 52},${SROOF} ${x + w + 14},${STOP - 24}`}
        fill={C.zinc} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.zincDark} strokeWidth={4} opacity={0.9}>
        {[0.25, 0.5, 0.75].map((u, k) => (
          <line key={k} x1={lerp(x - 14, x + w + 14, u)} y1={STOP - 24}
            x2={lerp(x + 52, x + w - 52, u)} y2={SROOF} />
        ))}
      </g>
      {/* 屋根窓 2つ */}
      {[0.33, 0.67].map((u, k) => (
        <g key={k}>
          <rect x={x + w * u - 26} y={SROOF + 20} width={52} height={50} rx={3}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={x + w * u} y1={SROOF + 20} x2={x + w * u} y2={SROOF + 70} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      {/* 煙突 */}
      <rect x={x + w * 0.5 - 24} y={SROOF - 62} width={48} height={66}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x + w * 0.5 - 32} y={SROOF - 76} width={64} height={18} rx={4}
        fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={x + w * 0.5} cy={SROOF - 96 - ((f * 1.5 + i * 11) % 36)} rx={15} ry={10}
        fill={KRP.gray} opacity={0.35} />
    </g>
  );
};

// 格: 山
// どこ: パリの通りを正面から。同じ形のアパートが4軒、画面の端から端まで並ぶ
// 演出: 石の壁・鉄のバルコニー・マンサード屋根・1階の店・街灯・馬車・歩く人
// 動き: 馬車が右から左へ進み車輪が回る。人が歩く。煙突の煙が上る。街灯が揺れる
const Kb6PariNoApart: React.FC<{ f: number }> = ({ f }) => {
  const run = easeOut(clamp01(seg(f, 0, 42)));
  const cx = 1560 - run * 560;
  const wrot = -run * 420;
  const walk = Math.sin(f / 7) * 7;
  return (
    <Frame f={f} seed={851} bg={KRP.paperCool}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={SROOF + 40} fill={KRP.blueSoft} opacity={0.55} />
      {/* 同じ形の4軒 */}
      {[0, 1, 2, 3].map((i) => (
        <PariFacade key={i} x={14 + i * 474} w={446} f={f} i={i} />
      ))}
      {/* 舗石の通り */}
      <rect x={0} y={SGY} width={W} height={H - SGY} fill={C.stoneDark} opacity={0.5} />
      <line x1={0} y1={SGY} x2={W} y2={SGY} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.3}>
        {Array.from({ length: 7 }, (_, r) => (
          <g key={r}>
            <line x1={0} y1={SGY + 18 + r * 24} x2={W} y2={SGY + 18 + r * 24} />
            {Array.from({ length: 22 }, (_, cc) => (
              <line key={cc} x1={cc * 88 + (r % 2) * 44} y1={SGY + 18 + r * 24}
                x2={cc * 88 + (r % 2) * 44} y2={SGY + 42 + r * 24} />
            ))}
          </g>
        ))}
      </g>
      {/* 馬車 (右から左へ) */}
      <g transform={`translate(${cx} 0)`}>
        {/* 馬 */}
        <g>
          <rect x={-250} y={700} width={150} height={78} rx={24} fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
          <path d="M-250 716 L-300 672 L-272 652 L-236 700 Z" fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
          <path d="M-300 672 L-306 650 L-290 654 Z" fill={BP.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <g stroke={BP.woodDark} strokeWidth={13} strokeLinecap="round">
            <line x1={-232} y1={776} x2={-226 + walk} y2={838} />
            <line x1={-120} y1={776} x2={-128 - walk} y2={838} />
          </g>
          <line x1={-104} y1={712} x2={-70} y2={700} stroke={BP.woodDark} strokeWidth={9} />
        </g>
        {/* 車体 */}
        <rect x={-70} y={644} width={212} height={134} rx={12} fill={C.dark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-46} y={664} width={78} height={62} rx={6} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <rect x={52} y={664} width={66} height={62} rx={6} fill={C.dark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-74} y={620} width={220} height={26} rx={8} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 御者席 (いまは空。背もたれ・足板・馬車のランタン・鞭を立てる) */}
        <g>
          {/* 背もたれ */}
          <rect x={92} y={548} width={16} height={76} rx={6}
            fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={44} y={548} width={70} height={14} rx={6}
            fill={BP.iron} stroke={KRP.ink} strokeWidth={4} />
          {/* 座面の革 */}
          <rect x={30} y={606} width={84} height={18} rx={7}
            fill={BP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 足板 */}
          <rect x={-8} y={644} width={54} height={12} rx={4}
            fill={BP.iron} stroke={KRP.ink} strokeWidth={3.5} />
          {/* 鞭 (立てたまま) */}
          <line x1={104} y1={606} x2={128} y2={520} stroke={BP.woodDark} strokeWidth={5}
            strokeLinecap="round" />
          <path d="M128 520 Q150 536 142 560" fill="none" stroke={KRP.ink} strokeWidth={3} />
          {/* 馬車のランタン (蝋燭) */}
          <rect x={-104} y={600} width={30} height={38} rx={4}
            fill={C.candle} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-110} y={590} width={42} height={12} rx={4}
            fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3.5} />
          <ellipse cx={-89} cy={619} rx={7} ry={9 + Math.sin(f / 6) * 2}
            fill={KRP.orange} opacity={0.9} />
        </g>
        {/* 車輪 */}
        {[[-26, 44], [116, 56]].map(([wx, wr], k) => (
          <g key={k} transform={`translate(${wx} ${798 - (wr - 44)}) rotate(${wrot})`}>
            <circle cx={0} cy={0} r={wr} fill="none" stroke={KRP.ink} strokeWidth={8} />
            <circle cx={0} cy={0} r={wr * 0.2} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
            <g stroke={BP.woodDark} strokeWidth={5}>
              {Array.from({ length: 8 }, (_, s) => {
                const a = (s * Math.PI) / 4;
                return <line key={s} x1={0} y1={0} x2={Math.cos(a) * wr} y2={Math.sin(a) * wr} />;
              })}
            </g>
          </g>
        ))}
        {/* 御者 = 馬の口を取って舗石の上を歩く。足元は歩く人2人と同じ地面の高さ */}
        <g>
          {/* 手綱 (手から馬の口へ) */}
          <path d="M-357 780 Q-336 736 -296 692" fill="none" stroke={BP.woodDark}
            strokeWidth={5} strokeLinecap="round" />
          <Person x={-392 + walk * 0.6} y={832} s={0.52} cloth={C.dark} clothDark="#23282F"
            f={f} phase={1} />
          {/* シルクハット (丸頭に重ねる) */}
          <g transform={`translate(${-392 + walk * 0.6} ${832 + bobOf(f, 1)}) scale(0.52)`}>
            <rect x={-62} y={-258} width={124} height={16} rx={6}
              fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-44} y={-330} width={88} height={76} rx={6}
              fill={C.dark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        </g>
      </g>
      {/* 街灯 */}
      <g>
        <rect x={905} y={476} width={18} height={338} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={914} cy={818} rx={44} ry={13} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4.5} />
        <polygon points="914,400 866,470 962,470" fill={C.candle} stroke={KRP.ink} strokeWidth={5} />
        <rect x={866} y={470} width={96} height={16} rx={4} fill={BP.iron} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={914} cy={442} rx={20 + Math.sin(f / 6) * 3} ry={24} fill={KRP.orange} opacity={0.75} />
        <polygon points="914,372 896,400 932,400" fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 歩く人 */}
      <Person x={380 + walk * 2} y={830} s={0.6} cloth={C.night} clothDark="#1F2A36" f={f} phase={0} />
      <Person x={1270 - walk * 2} y={822} s={0.56} cloth={C.amber} clothDark={BP.woodDark} f={f} phase={2} />
      <TagPlate x={300} y={146} text="19世紀 パリ" size={46} t={seg(f, 2, 16)} />
      <TagPlate x={1620} y={146} text="同じ形" size={46} t={seg(f, 20, 34)} />
    </Frame>
  );
};

// ===== #219 さて、いちばん格式が高い階はどこでしょう。 =====
// ---- #219 のカメラ (#217 の真正面・引きとは別物にする) ----
// 斜め (-6度) に傾けて、図面を机に置いたように見せる。
// ★倍率は 0.84。屋根の頂から1階の足元まで断面を1枚に収める。
//   寄せすぎると各階の引き出し先が紙の天地をはみ出して、札が紙から出てしまう。
const B219 = { PX: 740, PY: 470, Z: 0.84, ROT: -6, DX: -205, DY: 55 };
const b219Cam =
  `translate(${B219.DX} ${B219.DY}) rotate(${B219.ROT} ${B219.PX} ${B219.PY}) ` +
  zoomAt(B219.Z, B219.PX, B219.PY);
/** 断面の中の座標 → 画面の座標 (引き出し線を図にぴたりと繋ぐため) */
const b219Map = (x: number, y: number): [number, number] => {
  const { PX, PY, Z, ROT, DX, DY } = B219;
  const sx = PX + (x - PX) * Z;
  const sy = PY + (y - PY) * Z;
  const a = (ROT * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    DX + PX + (sx - PX) * c - (sy - PY) * s,
    DY + PY + (sx - PX) * s + (sy - PY) * c,
  ];
};
/** 右の「候補」板に並べる行 (上から) */
const ROWS219: [string, number][] = [
  ["屋根裏", 176], ["5階", flMid(5)], ["4階", flMid(4)],
  ["3階", flMid(3)], ["2階", flMid(2)], ["1階", flMid(1)],
];
// 木の板と、鋲で留めた紙
const BD = { x: 1040, y: 46, w: 850, h: 776 };
const PP = { x: 1066, y: 70, w: 798, h: 728 };

// 格: 図
// どこ: #217と同じ断面を、寄って・左に送って・斜めに傾けたカメラで見る
// 演出: 右3割は木の板に鋲で留めた「候補」の紙。6行ぜんぶ○の枠が空のまま + 大きな？
// 動き: 引き出し線と○の枠が下から順に出る。？が浮く。蝋燭が揺れ、煙が上る
const Kb6DonoKai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={852} bg={KRP.cream}>
    <GridPaper />
    {/* 斜めに寄ったカメラ (方眼はまっすぐ = 図面を斜めに置いた感じ) */}
    <g transform={b219Cam}>
      <SectionShell f={f} />
      <SectionPlain f={f} />
    </g>
    {/* ---- 右3割: 木の板に鋲で留めた「候補」の紙 ---- */}
    <g>
      <rect x={BD.x} y={BD.y} width={BD.w} height={BD.h} rx={12}
        fill={C.amber} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.45}>
        {[0.2, 0.52, 0.84].map((u, i) => (
          <line key={i} x1={BD.x + 10} y1={BD.y + BD.h * u} x2={BD.x + BD.w - 10} y2={BD.y + BD.h * u} />
        ))}
      </g>
      <rect x={PP.x} y={PP.y} width={PP.w} height={PP.h} rx={8}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.97} />
      {/* 四隅の鋲 */}
      {[[PP.x + 26, PP.y + 26], [PP.x + PP.w - 26, PP.y + 26],
        [PP.x + 26, PP.y + PP.h - 26], [PP.x + PP.w - 26, PP.y + PP.h - 26]].map(([bx, by], i) => (
        <HexBolt key={i} x={bx} y={by} r={13} rot={i * 15} fill={BP.iron} />
      ))}
      {/* 行の罫線 */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {[1, 2, 3, 4, 5].map((i) => {
          const ya = b219Map(BX1, ROWS219[i - 1][1])[1];
          const yb = b219Map(BX1, ROWS219[i][1])[1];
          return <line key={i} x1={PP.x + 18} y1={(ya + yb) / 2} x2={PP.x + PP.w - 18} y2={(ya + yb) / 2} />;
        })}
      </g>
      {/* 大きな？ (紙の右半分を埋める) */}
      <QMark x={1660} y={430} s={3.6} f={f} t={seg(f, 26, 40)} />
    </g>
    {/* ---- 各階 → 候補の行 をつなぐ引き出し線と、空の○の枠 ---- */}
    {ROWS219.map(([name, my], i) => {
      const [rx, ry] = b219Map(BX1, my);
      const d = (ROWS219.length - 1 - i) * 4; // 下の階から順に
      return (
        <g key={name}>
          <line x1={rx + 8} y1={ry} x2={PP.x + 6} y2={ry} stroke={KRP.ink} strokeWidth={4}
            strokeDasharray="12 10" opacity={clamp01(seg(f, 2 + d, 12 + d))} />
          <circle cx={PP.x + 70} cy={ry} r={30} fill="none" stroke={KRP.ink} strokeWidth={7}
            opacity={clamp01(seg(f, 4 + d, 14 + d))} />
          <TagPlate x={1286} y={ry} text={name} size={44} t={seg(f, 4 + d, 16 + d)} />
        </g>
      );
    })}
  </Frame>
);

// ===== #220 答えは、2階か3階です。 =====
// 格: 並
// どこ: #217/#219 の建物の「2階と3階だけを抜き出した断面」。上下は破断線で切る。
//       全体を見せる #219 とは縮尺もカメラも違う = 同じ図の焼き直しにしない。
// 演出: 高い天井・モールディング・シャンデリア・絨毯・金縁の鏡・通しのバルコニー。
//       「答え」の札は宙に浮かせず、括弧の引き出し線で2つの○に直につなぐ
// 動き: 金の灯が下の階から差し、シャンデリアが点き、○が2階→3階の順に点く
const B220 = {
  WX0: 300, WX1: 420, IX0: 420, IX1: 1350, CX1: 1420,
  F4: 186, C3: 210, F3: 440, C2: 464, F2: 764, BB: 812,
};
/** 破断線 (ここで切ってあるという印)。横に走るジグザグ */
const BreakLine: React.FC<{ x1: number; x2: number; y: number; amp?: number }> = ({
  x1, x2, y, amp = 13,
}) => {
  const n = Math.ceil((x2 - x1) / 56);
  const pts = Array.from({ length: n + 1 }, (_, i) =>
    `${(x1 + ((x2 - x1) * i) / n).toFixed(0)},${(y + (i % 2 ? amp : -amp)).toFixed(0)}`).join(" ");
  return <polyline points={pts} fill="none" stroke={KRP.ink} strokeWidth={6}
    strokeLinejoin="round" strokeLinecap="round" />;
};
const Kb6N2KaiKa3Kai: React.FC<{ f: number }> = ({ f }) => {
  const B = B220;
  const rooms: { top: number; bot: number; s: number }[] = [
    { top: B.C3, bot: B.F3, s: 1.1 },   // 3階
    { top: B.C2, bot: B.F2, s: 1.6 },   // 2階
  ];
  return (
    <Frame f={f} seed={853} bg={KRP.cream}>
      <GridPaper />
      {/* 石の外壁 (通りに面する側) */}
      <rect x={B.WX0} y={B.F4} width={B.WX1 - B.WX0} height={B.BB - B.F4}
        fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      <Courses x={B.WX0} y={B.F4} w={B.WX1 - B.WX0} h={B.BB - B.F4} pitch={30} />
      {/* 室内 */}
      <rect x={B.IX0} y={B.C3} width={B.IX1 - B.IX0} height={B.F2 - B.C3}
        fill={KRP.white} opacity={0.74} />
      {/* 切断面のハッチ */}
      <rect x={B.IX1} y={B.F4} width={B.CX1 - B.IX1} height={B.BB - B.F4}
        fill={C.stoneDark} opacity={0.5} />
      <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.5}>
        {Array.from({ length: 20 }, (_, i) => (
          <line key={i} x1={B.IX1} y1={B.F4 + i * 36} x2={B.CX1} y2={B.F4 + i * 36 - 44} />
        ))}
      </g>
      <line x1={B.IX1} y1={B.F4} x2={B.IX1} y2={B.BB} stroke={KRP.ink} strokeWidth={5} />
      <line x1={B.IX0} y1={B.F4} x2={B.IX0} y2={B.BB} stroke={KRP.ink} strokeWidth={5} />
      {/* 金の灯 (下の階から差す) */}
      {rooms.map((r, i) => (
        <rect key={i} x={B.IX0} y={r.top} width={B.IX1 - B.IX0} height={r.bot - r.top}
          fill={C.gold} opacity={0.3 * clamp01(seg(f, 4 + (1 - i) * 8, 18 + (1 - i) * 8))} />
      ))}
      {/* 床スラブ (飴色の木) 3枚: 4階の床の切れ端 / 3階の床 / 2階の床 */}
      {[[B.F4, B.C3], [B.F3, B.C2], [B.F2, B.F2 + 24]].map(([a, b], i) => (
        <g key={i}>
          <rect x={B.IX0 - 2} y={a} width={B.IX1 - B.IX0 + 4} height={b - a}
            fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
          <rect x={B.IX0 - 2} y={b - 8} width={B.IX1 - B.IX0 + 4} height={8}
            fill={C.stoneDark} opacity={0.7} />
        </g>
      ))}
      {/* 部屋の中身 (2部屋ぶん) */}
      {rooms.map((r, i) => {
        const upper = i === 0;
        const seatY = r.bot - (upper ? 52 : 70);
        return (
          <g key={i}>
            {/* 天井のモールディング (金) */}
            <rect x={B.IX0} y={r.top + 4} width={B.IX1 - B.IX0} height={upper ? 14 : 20}
              fill={C.gold} stroke={KRP.ink} strokeWidth={3.5} opacity={0.88} />
            {/* 壁の鏡板 */}
            <rect x={B.IX0 + 60} y={r.top + 40} width={320} height={r.bot - r.top - 110} rx={8}
              fill="none" stroke={C.stoneDark} strokeWidth={6} opacity={0.75} />
            {/* 絨毯 */}
            <ellipse cx={B.IX0 + (upper ? 400 : 420)} cy={r.bot - 6}
              rx={upper ? 280 : 340} ry={upper ? 20 : 26}
              fill={KRP.red} stroke={KRP.ink} strokeWidth={5} opacity={0.78} />
            {/* シャンデリア */}
            <Lustre x={760} y={r.top + 22} s={r.s} f={f}
              t={seg(f, 6 + (1 - i) * 8, 22 + (1 - i) * 8)} arms={upper ? 5 : 7} />
            {/* 肘掛け椅子 */}
            <g>
              <rect x={480} y={seatY} width={upper ? 140 : 180} height={upper ? 46 : 58} rx={12}
                fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
              <rect x={480} y={seatY - (upper ? 54 : 70)} width={34} height={upper ? 58 : 74} rx={10}
                fill={C.amber} stroke={KRP.ink} strokeWidth={5} />
              <line x1={498} y1={seatY + (upper ? 46 : 58)} x2={498} y2={r.bot - 4}
                stroke={BP.woodDark} strokeWidth={8} />
              <line x1={600 + (upper ? 0 : 50)} y1={seatY + (upper ? 46 : 58)}
                x2={600 + (upper ? 0 : 50)} y2={r.bot - 4} stroke={BP.woodDark} strokeWidth={8} />
            </g>
            {/* 卓と燭台 */}
            <g>
              <rect x={900} y={r.bot - (upper ? 62 : 70)} width={upper ? 160 : 190} height={13}
                fill={C.amber} stroke={KRP.ink} strokeWidth={4} />
              <line x1={918} y1={r.bot - (upper ? 49 : 57)} x2={918} y2={r.bot - 4}
                stroke={C.amber} strokeWidth={8} />
              <line x1={1042 + (upper ? 0 : 30)} y1={r.bot - (upper ? 49 : 57)}
                x2={1042 + (upper ? 0 : 30)} y2={r.bot - 4} stroke={C.amber} strokeWidth={8} />
              <rect x={960} y={r.bot - (upper ? 92 : 100)} width={11} height={30}
                fill={C.candle} stroke={KRP.ink} strokeWidth={3} />
              <ellipse cx={965} cy={r.bot - (upper ? 99 : 107)} rx={5}
                ry={7 + Math.sin((f + i * 9) / 5) * 2} fill={KRP.orange} opacity={0.92} />
            </g>
            {/* 金縁の鏡 (切断面の壁に掛かる) */}
            <rect x={1250} y={upper ? 340 : 620} width={upper ? 76 : 86} height={upper ? 92 : 130}
              rx={7} fill={KRP.blueSoft} stroke={C.gold} strokeWidth={11} />
            <rect x={1250} y={upper ? 340 : 620} width={upper ? 76 : 86} height={upper ? 92 : 130}
              rx={7} fill="none" stroke={KRP.ink} strokeWidth={4} />
            {/* 窓 (外壁の抜き) */}
            <rect x={B.WX0 + 6} y={r.top + (upper ? 54 : 56)} width={B.WX1 - B.WX0 - 12}
              height={upper ? 140 : 210} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
            <line x1={B.WX0 + 6} y1={r.top + (upper ? 124 : 161)} x2={B.WX1 - 6}
              y2={r.top + (upper ? 124 : 161)} stroke={KRP.ink} strokeWidth={3.5} />
            <line x1={(B.WX0 + B.WX1) / 2} y1={r.top + (upper ? 54 : 56)}
              x2={(B.WX0 + B.WX1) / 2} y2={r.top + (upper ? 194 : 266)}
              stroke={KRP.ink} strokeWidth={3.5} />
            <rect x={B.WX0 - 6} y={r.bot - 26} width={B.WX1 - B.WX0 + 12} height={11}
              fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
      {/* 2階は通しのバルコニー (高貴な階の目印) */}
      <IronBalcony x={B.WX0 + 2} y={B.F2 - 26} w={76} h={62} />
      {/* 3階は窓ごとの小さな手摺 */}
      <g stroke={BP.iron} strokeWidth={5}>
        {Array.from({ length: 5 }, (_, b) => (
          <line key={b} x1={B.WX0 - 48 + b * 13} y1={B.F3 - 26} x2={B.WX0 - 48 + b * 13} y2={B.F3 - 62} />
        ))}
        <line x1={B.WX0 - 56} y1={B.F3 - 26} x2={B.WX0 + 8} y2={B.F3 - 26}
          stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 上下の破断線 = ここで切り取ってある印 */}
      <BreakLine x1={B.WX0 - 12} x2={B.CX1 + 12} y={B.F4 + 6} />
      <BreakLine x1={B.WX0 - 12} x2={B.CX1 + 12} y={B.BB - 6} />
      {/* ○ (2階 → 3階の順に点く) */}
      <Maru x={1200} y={290} s={0.62} t={seg(f, 18, 32)} />
      <Maru x={1200} y={560} s={0.62} t={seg(f, 10, 24)} />
      {/* 「答え」の札 → 括弧の引き出し線 → 2つの○ (札を浮かせない) */}
      <g opacity={clamp01(seg(f, 26, 38))} stroke={KRP.red} strokeWidth={6}
        strokeLinecap="round" fill="none">
        <line x1={1644} y1={425} x2={1528} y2={425} />
        <line x1={1520} y1={290} x2={1520} y2={560} />
        <line x1={1520} y1={290} x2={1252} y2={290} />
        <line x1={1520} y1={560} x2={1252} y2={560} />
      </g>
      <g opacity={clamp01(seg(f, 28, 40))}>
        {[290, 560].map((cy) => (
          <circle key={cy} cx={1250} cy={cy} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      <TagPlate x={1720} y={425} text="答え" size={56} t={seg(f, 26, 38)} color={KRP.red} />
      <TagPlate x={140} y={290} text="3階" size={48} t={seg(f, 2, 14)} />
      <TagPlate x={140} y={560} text="2階" size={48} t={seg(f, 2, 14)} fill={C.candle} />
    </Frame>
  );
};

// ===== #221 フランス語で「高貴な階」と呼ばれました。 =====
// 格: 並
// どこ: 2階の室内。描くのは「天井の高い部屋」ひとつ。人は窓辺に1人だけ
// 演出: 高い天井・モールディング・大きな窓・シャンデリア・金縁の鏡・絨毯
// 動き: 蝋燭の炎が揺れ、カーテンが揺れ、窓からの光が差してくる
const Kb6KoukiNaKai: React.FC<{ f: number }> = ({ f }) => {
  const FL = 790, CEIL = 142;
  const sway = Math.sin(f / 13) * 9;
  const light = easeOut(clamp01(seg(f, 6, 34)));
  return (
    <Frame f={f} seed={854} bg={KRP.cream}>
      {/* 壁と床 */}
      <rect x={0} y={0} width={W} height={FL} fill={C.stone} />
      <rect x={0} y={FL} width={W} height={H - FL} fill={C.amber} />
      <g stroke={BP.woodDark} strokeWidth={3} opacity={0.5}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 150 - 60} y1={FL} x2={i * 150 - 180} y2={H} />
        ))}
      </g>
      <line x1={0} y1={FL} x2={W} y2={FL} stroke={KRP.ink} strokeWidth={8} />
      {/* 天井とモールディング */}
      <rect x={0} y={0} width={W} height={CEIL} fill={KRP.white} opacity={0.85} />
      <rect x={0} y={CEIL - 34} width={W} height={36} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
      <Rivets x1={40} y1={CEIL - 16} x2={1880} y2={CEIL - 16} n={16} r={7} fill={C.gold} />
      <line x1={0} y1={CEIL + 20} x2={W} y2={CEIL + 20} stroke={C.goldDark} strokeWidth={5} opacity={0.8} />
      {/* 壁の鏡板 (モールディング) */}
      {[[640, 1180], [1660, 1810]].map(([a, b], i) => (
        <rect key={i} x={a} y={250} width={b - a} height={430} rx={8}
          fill="none" stroke={C.stoneDark} strokeWidth={7} opacity={0.9} />
      ))}
      {/* 窓からの光 */}
      <polygon points={`1250,230 1620,230 1180,${FL} 520,${FL}`} fill={C.candle}
        opacity={0.22 * light} />
      {/* 大きな窓 */}
      <rect x={1236} y={214} width={398} height={534} rx={6}
        fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={KRP.ink} strokeWidth={5}>
        <line x1={1435} y1={214} x2={1435} y2={748} />
        {[1, 2, 3].map((i) => (
          <line key={i} x1={1236} y1={214 + i * 134} x2={1634} y2={214 + i * 134} />
        ))}
      </g>
      <rect x={1214} y={744} width={442} height={22} rx={5} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 窓の外の鉄の手摺 */}
      <g stroke={BP.iron} strokeWidth={6} opacity={0.9}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={1256 + i * 38} y1={566} x2={1256 + i * 38} y2={700} />
        ))}
        <line x1={1240} y1={566} x2={1630} y2={566} stroke={KRP.ink} strokeWidth={8} />
      </g>
      {/* カーテン (揺れる) */}
      {[[1206, 1], [1664, -1]].map(([cxp, sg], i) => (
        <path key={i}
          d={`M${cxp} 196 L${cxp + (sg as number) * 86} 196 Q${cxp + (sg as number) * (70 + sway)} 470 ${cxp + (sg as number) * (104 - sway)} 756 L${cxp} 756 Z`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={6} opacity={0.88} />
      ))}
      <rect x={1180} y={176} width={510} height={24} rx={8} fill={C.goldDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 金縁の鏡 */}
      <rect x={196} y={244} width={324} height={414} rx={10}
        fill={KRP.blueSoft} stroke={C.gold} strokeWidth={18} />
      <rect x={196} y={244} width={324} height={414} rx={10} fill="none" stroke={KRP.ink} strokeWidth={5} />
      <path d="M216 630 L470 268" stroke={KRP.white} strokeWidth={16} opacity={0.5} />
      {/* 絨毯 */}
      <ellipse cx={880} cy={FL + 92} rx={540} ry={118} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} opacity={0.75} />
      <ellipse cx={880} cy={FL + 92} rx={460} ry={92} fill="none" stroke={C.gold} strokeWidth={8} opacity={0.8} />
      {/* シャンデリア */}
      <Lustre x={880} y={CEIL + 20} s={2.2} f={f} t={seg(f, 2, 18)} arms={8} />
      {/* 肘掛け椅子 */}
      <g>
        <rect x={600} y={FL - 128} width={186} height={96} rx={16}
          fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
        <rect x={600} y={FL - 232} width={54} height={112} rx={16}
          fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
        <rect x={732} y={FL - 196} width={54} height={76} rx={14}
          fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
        <line x1={620} y1={FL - 32} x2={620} y2={FL} stroke={BP.woodDark} strokeWidth={10} />
        <line x1={768} y1={FL - 32} x2={768} y2={FL} stroke={BP.woodDark} strokeWidth={10} />
      </g>
      {/* くつろぐ人1人 (窓辺) */}
      <Person x={1046} y={FL} s={0.98} cloth={C.night} clothDark="#1F2A36"
        face="smile" gaze={[0.6, 0]} f={f} />
      <TagPlate x={300} y={760} text="高貴な階" size={48} t={seg(f, 8, 24)} color={C.goldDark} />
      <TagPlate x={640} y={232} text="高い天井" size={42} t={seg(f, 22, 38)} />
    </Frame>
  );
};

// ===== #222 階段を、ほんの少し登るだけで着きます。 =====
// 格: 図
// どこ: 方眼の上。1階から2階までの一段ずつ数えられる階段を、画面の端まで大きく
// 演出: 踏板・蹴込み・ささら桁・鉄の手摺・段の番号。1階ぶんの寸法線と「登る」矢印
// 動き: 段が下から1段ずつ現れ、最後に矢印がひと息で伸びる
const Kb6SukoshiNoboru: React.FC<{ f: number }> = ({ f }) => {
  const N = 16, RUN = 58, RISE = 26;
  const X0 = 356, Y0 = 790;
  const Y1 = Y0 - N * RISE;          // 2階の床 = 374
  const X1 = X0 + N * RUN;           // = 1284
  return (
    <Frame f={f} seed={855} bg={KRP.cream}>
      <GridPaper />
      {/* 1階の床 */}
      <rect x={60} y={Y0} width={X0 - 60 + 8} height={22} fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
      <rect x={60} y={Y0 + 22} width={X0 - 60 + 8} height={16} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 2階の床 (踊り場) */}
      <rect x={X1 - 8} y={Y1} width={1860 - X1} height={22} fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
      <rect x={X1 - 8} y={Y1 + 22} width={1860 - X1} height={16} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
      {/* ささら桁 (段の下の斜め材) */}
      <polygon points={`${X0},${Y0} ${X1},${Y1} ${X1},${Y1 + 64} ${X0},${Y0 + 64}`}
        fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
      {/* 段 */}
      {Array.from({ length: N }, (_, i) => {
        const t = clamp01(seg(f, 2 + i * 1.6, 9 + i * 1.6));
        const x = X0 + i * RUN;
        const y = Y0 - i * RISE;
        return (
          <g key={i} opacity={t}>
            {/* 蹴込み */}
            <rect x={x} y={y - RISE} width={RUN} height={RISE}
              fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
            {/* 踏板 */}
            <rect x={x - 6} y={y - RISE - 13} width={RUN + 14} height={15} rx={3}
              fill={C.amber} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={x + RUN / 2 + 2} y={y - 7} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={20} fill={KRP.ink} opacity={0.85}>{i + 1}</text>
          </g>
        );
      })}
      {/* 鉄の手摺 */}
      <g opacity={clamp01(seg(f, 18, 32))}>
        <line x1={X0 + 10} y1={Y0 - 96} x2={X1 + 10} y2={Y1 - 96} stroke={BP.iron} strokeWidth={14}
          strokeLinecap="round" />
        <line x1={X0 + 10} y1={Y0 - 96} x2={X1 + 10} y2={Y1 - 96} stroke={KRP.ink} strokeWidth={5}
          strokeLinecap="round" opacity={0.5} />
        <g stroke={BP.ironDark} strokeWidth={6}>
          {Array.from({ length: N }, (_, i) => (
            <line key={i} x1={X0 + 10 + i * RUN} y1={Y0 - i * RISE - 96}
              x2={X0 + 10 + i * RUN} y2={Y0 - i * RISE - 14} />
          ))}
        </g>
      </g>
      {/* 1階ぶんの寸法 */}
      <DimV x={244} y1={Y0} y2={Y1} label="1階ぶん" t={seg(f, 10, 28)} size={38} />
      {/* 登る矢印 (ひと息)。label は矢印の上に重なって赤地に赤字になるので使わない。
          文字は左上の空きに白い札で出し、引き出し線で矢印につなぐ */}
      <ForceArrow x={X0 + 40} y={Y0 - 150} len={900} rot={-24.1} w={24}
        color={KRP.red} t={seg(f, 28, 42)} />
      <g opacity={clamp01(seg(f, 32, 42))}>
        <line x1={470} y1={272} x2={628} y2={516} stroke={KRP.red} strokeWidth={5}
          strokeDasharray="12 9" />
        <circle cx={628} cy={520} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={470} y={238} text="登るのはここだけ" size={40} t={seg(f, 30, 42)}
        color={KRP.red} />
      <TagPlate x={152} y={762} text="1階" size={40} t={seg(f, 2, 14)} />
      <TagPlate x={1600} y={300} text="2階" size={40} t={seg(f, 24, 36)} />
    </Frame>
  );
};

// ===== #223 いまのマンションなら、まず売れ残るほうの階です。 =====
// 格: 図
// どこ: 方眼の上に置いた、いまのマンションの価格表。画面いっぱいの1枚の表
// 演出: 上の階ほど高く、下の階ほど安い。棒の長さで一目。上階に○、2階に×
// 動き: 上の行から順に棒が伸び、最後に○と×が点く
const Kb6ImaNaraUrenokori: React.FC<{ f: number }> = ({ f }) => {
  const ROWS: [string, number, number][] = [
    ["20階", 9800, 780], ["15階", 8200, 660], ["10階", 6900, 540],
    ["5階", 5600, 420], ["2階", 4800, 300],
  ];
  const RY = (i: number) => 268 + i * 110;
  return (
    <Frame f={f} seed={856} bg={KRP.cream}>
      <GridPaper />
      {/* 表の台紙 */}
      <rect x={236} y={166} width={1466} height={602} rx={14}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
      <rect x={236} y={166} width={1466} height={62} rx={14}
        fill={C.night} stroke={KRP.ink} strokeWidth={9} />
      <text x={330} y={212} fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.white}>階</text>
      <text x={700} y={212} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={38}
        fill={KRP.white}>価格 (万円)</text>
      <text x={1618} y={212} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38}
        fill={KRP.white}>人気</text>
      {/* 行 */}
      {ROWS.map(([name, price, len], i) => {
        const t = easeOut(clamp01(seg(f, 2 + i * 5, 18 + i * 5)));
        const y = RY(i);
        return (
          <g key={name}>
            <line x1={236} y1={y + 52} x2={1702} y2={y + 52} stroke={KRP.ink}
              strokeWidth={3} opacity={0.35} />
            <text x={330} y={y + 16} fontFamily={FONT} fontWeight={900} fontSize={46}
              fill={KRP.ink}>{name}</text>
            <text x={700} y={y + 16} textAnchor="end" fontFamily={FONT} fontWeight={900}
              fontSize={46} fill={i === 4 ? KRP.red : KRP.ink}>{price}</text>
            <rect x={760} y={y - 26} width={len * t} height={54} rx={7}
              fill={i === 4 ? C.rain : C.night} stroke={KRP.ink} strokeWidth={5} />
            <rect x={760} y={y - 26} width={len * t} height={15} rx={6}
              fill={KRP.white} opacity={0.26} />
          </g>
        );
      })}
      {/* 軸の目盛り (価格の縦線) */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {[0, 1, 2, 3, 4].map((m) => (
          <line key={m} x1={760 + m * 195} y1={232} x2={760 + m * 195} y2={766} />
        ))}
      </g>
      <Maru x={1618} y={RY(0)} s={0.54} stroke={24} t={seg(f, 26, 38)} />
      <Maru x={1618} y={RY(1)} s={0.46} stroke={24} t={seg(f, 30, 40)} />
      <XMark x={1618} y={RY(4)} s={0.78} t={seg(f, 32, 42)} />
      <TagPlate x={820} y={96} text="いまのマンション" size={46} t={seg(f, 2, 16)} />
      <TagPlate x={1150} y={774} text="パリと逆" size={44} t={seg(f, 34, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #224 そこから上へ行くほど、家賃は下がります。 =====
// ---- #224 の左半分: 部屋を1室ずつ木の箱に入れて縦に積む (断面の作り直し) ----
// なぜ: #217/#220 と同じ断面をまた出すと4回目になる。同じ建物を「1室ずつの箱」に
//       組み替えると、右の棒グラフの行と1対1で見比べられて、絵も別物になる。
const RBOX = { X: 260, W: 890, H: 104, DP: 20 };
const ROWS224: [string, number][] = [
  ["屋根裏", 176], ["5階", flMid(5)], ["4階", flMid(4)],
  ["3階", flMid(3)], ["2階", flMid(2)], ["1階", flMid(1)],
];
/** 部屋1室ぶんの箱 (正面 + 奥行き)。kind で中身を変える */
const RoomBox: React.FC<{ cy: number; kind: "attic" | "plain" | "noble" | "shop"; f: number; t: number }> = ({
  cy, kind, f, t,
}) => {
  const { X, W: BW, H: BH, DP } = RBOX;
  const top = cy - BH / 2, bot = cy + BH / 2;
  const ix0 = X + 14, ix1 = X + BW - 14;
  const flr = bot - 24;
  const ap = clamp01(t);
  if (ap <= 0) return null;
  return (
    <g opacity={ap}>
      {/* 奥行き (上面と右面) */}
      <polygon points={`${X},${top} ${X + DP},${top - DP} ${X + BW + DP},${top - DP} ${X + BW},${top}`}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
      <polygon points={`${X + BW},${top} ${X + BW + DP},${top - DP} ${X + BW + DP},${bot - DP} ${X + BW},${bot}`}
        fill={BP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      {/* 木枠と室内 */}
      <rect x={X} y={top} width={BW} height={BH} fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
      <rect x={ix0} y={top + 14} width={ix1 - ix0} height={BH - 28}
        fill={KRP.white} opacity={0.88} stroke={KRP.ink} strokeWidth={3} />
      {/* 床板 (飴色の木) */}
      <rect x={ix0} y={flr} width={ix1 - ix0} height={12} fill={C.amber} stroke={KRP.ink} strokeWidth={3} />
      {/* 屋根裏だけ亜鉛の斜め天井 */}
      {kind === "attic" && (
        <polygon points={`${ix0},${top + 14} ${ix1},${top + 14} ${ix1},${top + 62} ${860},${top + 16} ${560},${top + 16} ${ix0},${top + 62}`}
          fill={C.zinc} stroke={C.zincDark} strokeWidth={4} />
      )}
      {/* 窓 (通りに面する側) */}
      <rect x={ix0 + 26} y={top + (kind === "attic" ? 46 : 26)} width={86}
        height={kind === "attic" ? 34 : BH - 58} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
      <line x1={ix0 + 69} y1={top + (kind === "attic" ? 46 : 26)} x2={ix0 + 69}
        y2={top + (kind === "attic" ? 80 : BH - 32)} stroke={KRP.ink} strokeWidth={3} />
      {/* 高貴な階は絨毯・モールディング・鏡・小さなシャンデリア */}
      {kind === "noble" && (
        <g>
          <rect x={ix0} y={top + 14} width={ix1 - ix0} height={9}
            fill={C.gold} stroke={KRP.ink} strokeWidth={2.5} opacity={0.9} />
          <ellipse cx={700} cy={flr - 2} rx={176} ry={10}
            fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} opacity={0.8} />
          <rect x={1046} y={flr - 60} width={42} height={46} rx={4}
            fill={KRP.blueSoft} stroke={C.gold} strokeWidth={7} />
          <Lustre x={916} y={top + 20} s={0.4} f={f} t={1} arms={5} />
        </g>
      )}
      {/* 1階は店の棚 */}
      {kind === "shop" && (
        <g>
          <rect x={560} y={flr - 58} width={210} height={58}
            fill={C.amber} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
            <line x1={560} y1={flr - 39} x2={770} y2={flr - 39} />
            <line x1={560} y1={flr - 20} x2={770} y2={flr - 20} />
          </g>
        </g>
      )}
      {/* 屋根裏は鉄のベッド、ほかの階は卓と椅子 */}
      {kind === "attic" ? (
        <g>
          <rect x={600} y={flr - 20} width={132} height={11} fill={BP.iron} stroke={KRP.ink} strokeWidth={3} />
          <rect x={600} y={flr - 9} width={132} height={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <line x1={606} y1={flr - 20} x2={606} y2={flr - 44} stroke={BP.ironDark} strokeWidth={4} />
          <line x1={726} y1={flr - 20} x2={726} y2={flr - 34} stroke={BP.ironDark} strokeWidth={4} />
        </g>
      ) : (
        <g>
          <rect x={590} y={flr - 34} width={130} height={10} fill={C.amber} stroke={KRP.ink} strokeWidth={3} />
          <line x1={602} y1={flr - 24} x2={602} y2={flr} stroke={C.amber} strokeWidth={6} />
          <line x1={708} y1={flr - 24} x2={708} y2={flr} stroke={C.amber} strokeWidth={6} />
          <rect x={760} y={flr - 28} width={52} height={9} fill={C.amber} stroke={KRP.ink} strokeWidth={3} />
          <line x1={806} y1={flr - 28} x2={806} y2={flr - 58} stroke={C.amber} strokeWidth={5} />
          <line x1={766} y1={flr - 19} x2={766} y2={flr} stroke={C.amber} strokeWidth={4} />
          <rect x={638} y={flr - 56} width={9} height={22} fill={C.candle} stroke={KRP.ink} strokeWidth={2.5} />
          <ellipse cx={642} cy={flr - 62} rx={4} ry={6 + Math.sin((f + cy / 17) / 5) * 1.8}
            fill={KRP.orange} opacity={0.9} />
        </g>
      )}
    </g>
  );
};

// 格: 図
// どこ: 左は「1室ずつの木の箱」を縦に6つ積んだ組み替え断面。右は家賃の横棒グラフ
// 演出: 箱の行と棒の行が1対1。2階の箱だけ豪華、屋根裏は亜鉛の斜め天井と鉄のベッド
// 動き: 下の箱から順に出て、棒が伸び、最後に赤い線が上へ引かれる。煙突の煙が上る
const Kb6UeHodoSagaru: React.FC<{ f: number }> = ({ f }) => {
  const AX = 1216, PITCH = 142;           // 目盛りの原点と1目盛りの幅
  const BARS: [number, number][] = [[1, 2.5], [2, 4.1], [3, 3.4], [4, 2.4], [5, 1.5]];
  const atticLen = 0.7;
  const tipsRaw: [number, number][] = [
    [AX + 4.1 * PITCH, flMid(2)], [AX + 3.4 * PITCH, flMid(3)],
    [AX + 2.4 * PITCH, flMid(4)], [AX + 1.5 * PITCH, flMid(5)],
    [AX + atticLen * PITCH, 176],
  ];
  const lineT = easeOut(clamp01(seg(f, 24, 42)));
  const shown = Math.max(2, Math.ceil(tipsRaw.length * lineT));
  const pts = tipsRaw.slice(0, shown).map(([px, py]) => `${px.toFixed(0)},${py.toFixed(0)}`).join(" ");
  return (
    <Frame f={f} seed={857} bg={KRP.cream}>
      <GridPaper />
      {/* 煙突の縦管 (箱を縦に貫いて1軒だと分かるようにする) */}
      <g>
        <rect x={206} y={118} width={40} height={700}
          fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={226} y1={150} x2={226} y2={790} n={9} r={5} fill={C.stone} />
        <rect x={194} y={98} width={64} height={22} rx={5}
          fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={226} cy={74 - ((f * 1.4) % 32)} rx={16} ry={11} fill={KRP.gray} opacity={0.4} />
        {ROWS224.map(([name, y]) => (
          <rect key={name} x={244} y={y - 9} width={22} height={18}
            fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      {/* 1室ずつの箱を縦に6つ (下から順に出る) */}
      {ROWS224.map(([name, y], i) => (
        <RoomBox key={name} cy={y} f={f}
          kind={name === "屋根裏" ? "attic" : name === "1階" ? "shop" : name === "2階" ? "noble" : "plain"}
          t={seg(f, 2 + (ROWS224.length - 1 - i) * 3, 12 + (ROWS224.length - 1 - i) * 3)} />
      ))}
      {/* 階の札 (箱の左) */}
      {ROWS224.map(([name, y], i) => (
        <TagPlate key={name} x={110} y={y} text={name} size={36}
          t={seg(f, 4 + (ROWS224.length - 1 - i) * 3, 16 + (ROWS224.length - 1 - i) * 3)} />
      ))}
      {/* 家賃の軸と目盛り */}
      <line x1={AX} y1={140} x2={AX} y2={796} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <g>
        {[0, 1, 2, 3, 4].map((m) => (
          <g key={m}>
            <line x1={AX + m * PITCH} y1={122} x2={AX + m * PITCH} y2={796}
              stroke={KRP.ink} strokeWidth={3} strokeDasharray="10 14" opacity={0.4} />
            <line x1={AX + m * PITCH} y1={108} x2={AX + m * PITCH} y2={140}
              stroke={KRP.ink} strokeWidth={6} />
            <text x={AX + m * PITCH} y={98} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={36} fill={KRP.ink}>{m}</text>
          </g>
        ))}
      </g>
      {/* 各階の棒 */}
      {BARS.map(([n, v], i) => {
        const t = easeOut(clamp01(seg(f, 2 + i * 4, 16 + i * 4)));
        const len = v * PITCH * t;
        return (
          <g key={n}>
            <rect x={AX} y={flMid(n) - 30} width={len} height={60} rx={6}
              fill={n === 2 ? C.gold : C.amber} stroke={KRP.ink} strokeWidth={5} />
            <rect x={AX} y={flMid(n) - 30} width={len} height={16} rx={6}
              fill={KRP.white} opacity={0.3} />
          </g>
        );
      })}
      {/* 屋根裏 */}
      <rect x={AX} y={176 - 30} width={atticLen * PITCH * easeOut(clamp01(seg(f, 22, 34)))} height={60}
        rx={6} fill={C.zinc} stroke={KRP.ink} strokeWidth={5} />
      {/* 棒の先を結ぶ線 = 上へ行くほど家賃が引っこむ */}
      <polyline points={pts} fill="none" stroke={KRP.red} strokeWidth={9}
        strokeLinecap="round" strokeLinejoin="round" opacity={lineT > 0 ? 1 : 0} />
      {tipsRaw.slice(0, shown).map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <Arrow x={tipsRaw[4][0] - 26} y={176} s={0.72} rot={-118} t={seg(f, 36, 42)} />
      <TagPlate x={1640} y={772} text="家賃" size={42} t={seg(f, 6, 20)} />
      {/* 左下は階の札で埋まったので、結論の札は棒の短い右上の空きに置く */}
      <TagPlate x={1660} y={200} text="上ほど安い" size={42} t={seg(f, 28, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #225 最上階は、使用人の部屋でした。 =====
// 格: 山 (この章の★)
// どこ: 最上階の屋根裏。天井が左の高いところから右の低いところへ斜めに下がる
// 演出: 小さな天窓・光の筋と埃・垂木・鉄のベッド・欠けた水差しと洗面器・蝋燭・畳んだ服
// 動き: 蝋燭が揺れ、光の筋の埃が舞い、腰をかがめた使用人がゆれる。カメラがゆっくり寄る
const Kb6ShiyouninNoHeya: React.FC<{ f: number }> = ({ f }) => {
  const FL = 800;
  const SX0 = 120, SY0 = 150, SX1 = 1700, SY1 = 700;   // 斜め天井
  const slope = (x: number) => SY0 + ((x - SX0) / (SX1 - SX0)) * (SY1 - SY0);
  const z = 1 + 0.06 * easeOut(clamp01(seg(f, 0, 40)));
  const fl = 7 + Math.sin(f / 5) * 2.6;
  const shaft = easeOut(clamp01(seg(f, 4, 30)));
  return (
    <Frame f={f} seed={858} bg={KRP.cream} dark>
      <g transform={zoomAt(z, 900, 520)}>
        {/* 室内の壁と床 */}
        <rect x={0} y={0} width={W} height={FL} fill={C.stone} opacity={0.75} />
        <rect x={0} y={FL} width={W} height={H - FL} fill={C.amber} opacity={0.9} />
        <g stroke={BP.woodDark} strokeWidth={4} opacity={0.55}>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1={i * 210 - 40} y1={FL} x2={i * 210 - 180} y2={H} />
          ))}
        </g>
        <line x1={0} y1={FL} x2={W} y2={FL} stroke={KRP.ink} strokeWidth={8} />
        {/* 斜め天井より上 = 屋根の中 (垂木と野地板) */}
        <polygon points={`0,0 ${W},0 ${W},${slope(W)} 0,${slope(0)}`}
          fill={C.zincDark} opacity={0.92} />
        <polygon points={`0,${slope(0) - 26} ${W},${slope(W) - 26} ${W},${slope(W)} 0,${slope(0)}`}
          fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
        {/* 野地板の継ぎ目 */}
        <g stroke={BP.woodDark} strokeWidth={5} opacity={0.8}>
          {Array.from({ length: 20 }, (_, i) => {
            const x = 40 + i * 100;
            return <line key={i} x1={x} y1={slope(x) - 26} x2={x + 11} y2={slope(x) + 2} />;
          })}
        </g>
        <line x1={0} y1={slope(0)} x2={W} y2={slope(W)} stroke={KRP.ink} strokeWidth={8} />
        {/* 梁 (左の壁から斜め天井まで渡る) */}
        <rect x={0} y={404} width={924} height={26} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
        <HexBolt x={884} y={417} r={11} fill={BP.ironDark} />
        {/* 右の腰壁 */}
        <rect x={SX1 - 40} y={slope(SX1 - 40)} width={W - SX1 + 40} height={FL - slope(SX1 - 40)}
          fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
        {/* 左の壁 (煙突の裏) */}
        <rect x={0} y={slope(0)} width={120} height={FL - slope(0)}
          fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} opacity={0.75} />
        {/* 光の筋 */}
        <polygon points={`556,${slope(556)} 760,${slope(760)} 1180,${FL} 846,${FL}`}
          fill={C.candle} opacity={0.3 * shaft} />
        {Array.from({ length: 14 }, (_, i) => {
          const u = rnd(i * 3.1);
          const v = (rnd(i * 7.7) + f / 170) % 1;
          const x = lerp(590 + v * 300, 740 + v * 330, u);
          const y = lerp(slope(620), FL, v);
          return <circle key={i} cx={x} cy={y} r={3 + u * 3} fill={KRP.white} opacity={0.55 * shaft} />;
        })}
        {/* 小さな天窓 (斜面に付く) */}
        <g transform={`translate(658 ${slope(658)}) rotate(19.2)`}>
          <rect x={-106} y={-26} width={212} height={44} rx={5}
            fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-92} y={-18} width={184} height={28} rx={3}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={0} y1={-18} x2={0} y2={10} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-92} y1={-4} x2={92} y2={-4} stroke={KRP.ink} strokeWidth={3} />
          <HexBolt x={-100} y={14} r={9} fill={BP.iron} />
          <HexBolt x={100} y={14} r={9} fill={BP.iron} />
        </g>
        {/* 鉄のベッド (天井がいちばん低いところに押しこまれている) */}
        <g>
          <rect x={1300} y={700} width={300} height={20} fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1300} y={668} width={300} height={34} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={1300} y={678} width={168} height={24} rx={7} fill={C.rain} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
          <rect x={1516} y={656} width={74} height={26} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <g stroke={BP.ironDark} strokeWidth={9} strokeLinecap="round">
            <line x1={1310} y1={716} x2={1310} y2={FL} />
            <line x1={1590} y1={716} x2={1590} y2={FL} />
            <line x1={1310} y1={700} x2={1310} y2={606} />
            <line x1={1590} y1={700} x2={1590} y2={664} />
            <line x1={1310} y1={606} x2={1398} y2={606} />
            <line x1={1590} y1={664} x2={1522} y2={664} />
          </g>
          <g stroke={BP.iron} strokeWidth={6}>
            {[0, 1, 2].map((i) => (
              <line key={i} x1={1332 + i * 26} y1={608} x2={1332 + i * 26} y2={700} />
            ))}
          </g>
        </g>
        {/* 木箱 + 欠けた水差し + 洗面器 */}
        <g>
          <rect x={296} y={672} width={192} height={128} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={BP.woodDark} strokeWidth={4} opacity={0.8}>
            <line x1={296} y1={716} x2={488} y2={716} />
            <line x1={296} y1={758} x2={488} y2={758} />
          </g>
          {/* 水差し (口が欠けている) */}
          <path d="M344 672 L338 604 Q336 586 352 582 L388 582 Q404 586 402 604 L396 672 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M352 582 L362 572 L372 582" fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
          <path d="M402 600 Q426 612 406 638" fill="none" stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={340} y1={624} x2={400} y2={624} stroke={C.rain} strokeWidth={4} opacity={0.8} />
          {/* 洗面器 */}
          <path d="M414 672 L420 650 L488 650 L482 672 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 蝋燭 (木箱のうえ) */}
        <g>
          <rect x={552} y={742} width={118} height={58} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={610} cy={742} rx={30} ry={9} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={600} y={684} width={20} height={58} fill={C.candle} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={610} cy={672} rx={7} ry={fl} fill={KRP.orange} opacity={0.95} />
          <ellipse cx={610} cy={676} rx={22} ry={26} fill={C.candle} opacity={0.22} />
        </g>
        {/* 畳んだ服 */}
        <g>
          <rect x={940} y={754} width={132} height={20} rx={5} fill={C.night} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={946} y={774} width={132} height={20} rx={5} fill={C.rain} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={938} y={736} width={120} height={20} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 壁の釘に掛けた上着 */}
        <g>
          <HexBolt x={250} y={476} r={10} fill={BP.ironDark} />
          <path d="M250 486 L206 522 L214 606 Q250 620 288 606 L294 522 Z"
            fill={C.night} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
          <line x1={250} y1={492} x2={250} y2={612} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        </g>
        {/* 腰をかがめた使用人 */}
        <Person x={1206} y={FL} s={0.86} cloth={C.rain} clothDark="#5E7383"
          face="normal" lean={13} gaze={[-0.3, 0.3]} f={f} />
      </g>
      <TagPlate x={296} y={176} text="屋根裏" size={48} t={seg(f, 6, 20)} />
      <TagPlate x={366} y={292} text="使用人の部屋" size={44} t={seg(f, 22, 38)} />
    </Frame>
  );
};

// ===== #226 広さは9平方メートル。天井は斜めに下がっています。 =====
// 格: 図
// どこ: 方眼の上に、左=平面 (3m×3m)、右=断面 (斜めに下がる天井) を並べた図面
// 演出: 1m=160px の縮尺。9㎡の寸法線、天井高2.6m→0.8m、1.7mの頭が当たる所に印
// 動き: 寸法線が伸び、低い側に斜線が入り、最後に×が点く
const Kb6N9Heihoumetoru: React.FC<{ f: number }> = ({ f }) => {
  const M = 160;                                  // 1m
  const PX0 = 210, PY0 = 294, PS = 3 * M;         // 平面 (3m角)
  const SX0 = 880, SX1 = 1800, SFL = 770;         // 断面
  const HI = SFL - 2.6 * M, LO = SFL - 0.8 * M;   // 天井の高い端・低い端
  const ceil = (x: number) => HI + ((x - SX0) / (SX1 - SX0)) * (LO - HI);
  const HEAD = SFL - 1.7 * M;                     // 頭の高さ
  const HX = SX0 + ((HEAD - HI) / (LO - HI)) * (SX1 - SX0); // 頭が当たる所
  return (
    <Frame f={f} seed={859} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 平面 ===== */}
      <rect x={PX0 - 18} y={PY0 - 18} width={PS + 36} height={PS + 36}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} />
      <rect x={PX0} y={PY0} width={PS} height={PS} fill={C.amber} stroke={KRP.ink} strokeWidth={6} opacity={0.75} />
      <g stroke={BP.woodDark} strokeWidth={3} opacity={0.6}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={PX0} y1={PY0 + (i + 1) * 40} x2={PX0 + PS} y2={PY0 + (i + 1) * 40} />
        ))}
      </g>
      {/* 平面の中の物 (ベッドと木箱) */}
      <rect x={PX0 + 18} y={PY0 + 24} width={84} height={190} rx={6}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={PX0 + 330} y={PY0 + 360} width={118} height={90} rx={6}
        fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
      {/* 戸 (開き勝手) */}
      <path d={`M${PX0 + PS} ${PY0 + 330} a86 86 0 0 0 -86 86`} fill="none"
        stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 10" />
      <rect x={PX0 + PS - 10} y={PY0 + 330} width={20} height={86} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      <text x={PX0 + PS / 2} y={PY0 + PS / 2 + 26} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={82} fill={KRP.red} stroke={KRP.white} strokeWidth={10}
        paintOrder="stroke" opacity={clamp01(seg(f, 20, 34))}>9㎡</text>
      <DimH x1={PX0} x2={PX0 + PS} y={PY0 - 52} label="3m" t={seg(f, 2, 18)} size={42} />
      <DimV x={PX0 - 62} y1={PY0 + PS} y2={PY0} label="3m" t={seg(f, 8, 24)} size={42} />
      {/* ===== 断面 ===== */}
      <rect x={SX0} y={SFL} width={SX1 - SX0} height={22} fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
      <polygon points={`${SX0},${HI} ${SX1},${LO} ${SX1},${LO - 30} ${SX0},${HI - 30}`}
        fill={C.zinc} stroke={KRP.ink} strokeWidth={6} />
      <rect x={SX0 - 22} y={HI - 30} width={22} height={SFL - HI + 30}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={SX1} y={LO} width={22} height={SFL - LO}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 立てない側に斜線 */}
      <g opacity={clamp01(seg(f, 26, 38))}>
        <g stroke={KRP.red} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 16 }, (_, i) => {
            const x = HX + i * 30;
            return x < SX1 ? <line key={i} x1={x} y1={ceil(x)} x2={x - 60} y2={SFL} /> : null;
          })}
        </g>
        <line x1={HX} y1={SFL} x2={HX} y2={HEAD} stroke={KRP.red} strokeWidth={5} strokeDasharray="16 12" />
      </g>
      {/* 寸法 */}
      <DimV x={SX0 + 52} y1={SFL} y2={HI + 6} label="2.6m" t={seg(f, 12, 28)} size={40} />
      <DimV x={SX1 - 54} y1={SFL} y2={LO + 6} label="0.8m" t={seg(f, 18, 32)} size={40} />
      <DimV x={HX - 96} y1={SFL} y2={HEAD} label="1.7m" t={seg(f, 24, 38)} size={40} color={C.goldDark} />
      <XMark x={1660} y={700} s={0.72} t={seg(f, 34, 42)} />
      <TagPlate x={450} y={224} text="平面" size={46} t={seg(f, 2, 14)} />
      <TagPlate x={1340} y={224} text="断面" size={46} t={seg(f, 6, 18)} />
      <TagPlate x={1042} y={724} text="立てるのはここまで" size={38} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #227 屋根は亜鉛。夏は、焼けるように暑い。 =====
// 格: 並
// どこ: 亜鉛の屋根の上。描くのは「焼ける屋根」ひとつ。人は天窓の中に1人だけ
// 演出: 亜鉛板の継ぎ目と立ハゼ・横の段・煙突の列・真上の陽・熱の陽炎
// 動き: 陽炎が立ちのぼり、陽の光条が回り、天窓の人が汗をぬぐう
const Kb6YaneWaAen: React.FC<{ f: number }> = ({ f }) => {
  const ridge = (x: number) => 330 + (x / W) * 100;
  const heat = easeOut(clamp01(seg(f, 2, 26)));
  const drop = (i: number) => ((f + i * 14) % 42) / 42;
  return (
    <Frame f={f} seed={860} bg={KRP.cream}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={440} fill={KRP.blueSoft} opacity={0.6} />
      {/* 真上の陽 */}
      <g transform={`translate(1606 118) rotate(${f * 0.9})`}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 6) * 142}
            y2={Math.sin((i * Math.PI) / 6) * 142} stroke={KRP.orange} strokeWidth={10}
            opacity={0.55} strokeLinecap="round" />
        ))}
      </g>
      <circle cx={1606} cy={118} r={66} fill={C.candle} stroke={KRP.ink} strokeWidth={7} />
      {/* 亜鉛の屋根 */}
      <polygon points={`0,${ridge(0)} ${W},${ridge(W)} ${W},${H} 0,${H}`} fill={C.zinc} />
      {/* 板ごとの濃淡 + 立ハゼ (継ぎ目) */}
      {Array.from({ length: 15 }, (_, i) => {
        const xt = i * 138;
        const xb = xt * 1.18 - 160;
        const xt2 = (i + 1) * 138;
        const xb2 = xt2 * 1.18 - 160;
        return (
          <g key={i}>
            <polygon points={`${xt},${ridge(xt)} ${xt2},${ridge(xt2)} ${xb2},${H} ${xb},${H}`}
              fill={i % 2 ? C.zincDark : C.zinc} opacity={i % 2 ? 0.35 : 1} />
            {/* 立ハゼ: 2本の線 + 光 */}
            <line x1={xt} y1={ridge(xt)} x2={xb} y2={H} stroke={KRP.ink} strokeWidth={6} />
            <line x1={xt + 11} y1={ridge(xt)} x2={xb + 13} y2={H} stroke={C.zincDark} strokeWidth={7} />
            <line x1={xt + 5} y1={ridge(xt)} x2={xb + 6} y2={H} stroke={KRP.white} strokeWidth={3} opacity={0.65} />
          </g>
        );
      })}
      {/* 横の段 (はぎ合わせ) */}
      {[0.3, 0.58, 0.86].map((u, i) => {
        const yl = lerp(ridge(0), H, u);
        const yr = lerp(ridge(W), H, u);
        return (
          <g key={i}>
            <line x1={0} y1={yl} x2={W} y2={yr} stroke={KRP.ink} strokeWidth={5} opacity={0.8} />
            <line x1={0} y1={yl - 7} x2={W} y2={yr - 7} stroke={KRP.white} strokeWidth={4} opacity={0.4} />
          </g>
        );
      })}
      {/* 棟 */}
      <line x1={0} y1={ridge(0)} x2={W} y2={ridge(W)} stroke={KRP.ink} strokeWidth={9} />
      <rect x={-10} y={ridge(0) - 20} width={W + 20} height={16} fill={C.zincDark}
        stroke={KRP.ink} strokeWidth={5} transform={`rotate(2.98 0 ${ridge(0)})`} />
      {/* 煙突の列 */}
      {[150, 500, 1080, 1420, 1760].map((cx, i) => (
        <g key={i}>
          <rect x={cx} y={ridge(cx) - 162} width={72} height={166}
            fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
          <Courses x={cx} y={ridge(cx) - 162} w={72} h={150} pitch={30} />
          <rect x={cx - 12} y={ridge(cx) - 182} width={96} height={24} rx={5}
            fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1].map((k) => (
            <rect key={k} x={cx + 8 + k * 32} y={ridge(cx) - 206} width={22} height={26}
              fill={BP.rust} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <ellipse cx={cx + 36} cy={ridge(cx) - 230 - ((f * 1.6 + i * 9) % 40)} rx={17} ry={11}
            fill={KRP.gray} opacity={0.35} />
        </g>
      ))}
      {/* 陽炎 (屋根の上にゆらぐ) */}
      <g opacity={0.55 * heat}>
        {Array.from({ length: 9 }, (_, i) => {
          const x = 110 + i * 205;
          const p = f / 7 + i;
          return (
            <path key={i}
              d={`M${x} ${ridge(x) + 150} q${Math.sin(p) * 26} -50 0 -100 q${-Math.sin(p + 1) * 26} -50 0 -100`}
              fill="none" stroke={KRP.white} strokeWidth={9} strokeLinecap="round" opacity={0.8} />
          );
        })}
      </g>
      {/* 天窓 (ルカルヌ) と、その下で汗をぬぐう人。主役なので大きく */}
      <g>
        {/* 室内の闇 */}
        <rect x={562} y={450} width={502} height={306} fill={C.dark} stroke={KRP.ink} strokeWidth={8} />
        <Person x={762} y={820} s={1.02} cloth={KRP.white} clothDark={C.stone}
          face="worried" gaze={[0, 0.25]} f={f} />
        {/* 汗 */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={690 + i * 20} cy={556 + drop(i) * 86} rx={8} ry={13}
            fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} opacity={1 - drop(i) * 0.7} />
        ))}
        {/* 手拭い */}
        <path d="M842 548 q52 -20 80 14 q-44 32 -80 6 Z" fill={KRP.white}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 方立と欄間 (顔にかからない位置) */}
        <g stroke={KRP.ink} strokeWidth={7}>
          <line x1={562} y1={492} x2={1064} y2={492} />
          <line x1={1004} y1={492} x2={1004} y2={752} />
        </g>
        <rect x={566} y={454} width={494} height={34} fill={C.zincDark} opacity={0.6} />
        {/* 窓台と腰壁 (下半身を隠す) */}
        <rect x={562} y={676} width={502} height={84} fill={C.zincDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={542} y={660} width={542} height={28} rx={7} fill={C.zinc} stroke={KRP.ink} strokeWidth={6} />
        <rect x={562} y={450} width={502} height={306} fill="none" stroke={KRP.ink} strokeWidth={9} />
        {/* 屋根に取り付く水切り (ここで人の下半身は見えなくなる) */}
        <rect x={548} y={752} width={530} height={92} fill={C.zinc} stroke={KRP.ink} strokeWidth={8} />
        <Rivets x1={572} y1={800} x2={1054} y2={800} n={10} r={6} fill={C.zincDark} />
        {/* 屋根窓の小屋根 */}
        <polygon points="532,450 1094,450 1026,376 600,376" fill={C.zinc} stroke={KRP.ink} strokeWidth={8} />
        <Rivets x1={574} y1={414} x2={1052} y2={414} n={10} r={7} fill={C.zincDark} />
      </g>
      <TagPlate x={240} y={706} text="亜鉛" size={46} t={seg(f, 4, 18)} />
      <TagPlate x={1452} y={706} text="立ハゼ" size={44} t={seg(f, 12, 26)} />
      <TagPlate x={1444} y={300} text="焼ける" size={46} t={seg(f, 24, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb6_shou_tobira: (f) => <Kb6ShouTobira f={f} />,
  kb6_pari_no_apart: (f) => <Kb6PariNoApart f={f} />,
  kb6_dono_kai: (f) => <Kb6DonoKai f={f} />,
  kb6_2kai_ka_3kai: (f) => <Kb6N2KaiKa3Kai f={f} />,
  kb6_kouki_na_kai: (f) => <Kb6KoukiNaKai f={f} />,
  kb6_sukoshi_noboru: (f) => <Kb6SukoshiNoboru f={f} />,
  kb6_ima_nara_urenokori: (f) => <Kb6ImaNaraUrenokori f={f} />,
  kb6_ue_hodo_sagaru: (f) => <Kb6UeHodoSagaru f={f} />,
  kb6_shiyounin_no_heya: (f) => <Kb6ShiyouninNoHeya f={f} />,
  kb6_9heihoume_toru: (f) => <Kb6N9Heihoumetoru f={f} />,
  kb6_yane_wa_aen: (f) => <Kb6YaneWaAen f={f} />,
};

export const K_B6A_MOTIFS: string[] = [
  "kb6_shou_tobira",         // #217 第6章、高いほど、安い部屋だった。
  "kb6_pari_no_apart",       // #218 19世紀のパリに、同じ形のアパートが並びました。
  "kb6_dono_kai",            // #219 さて、いちばん格式が高い階はどこでしょう。
  "kb6_2kai_ka_3kai",        // #220 答えは、2階か3階です。
  "kb6_kouki_na_kai",        // #221 フランス語で「高貴な階」と呼ばれました。
  "kb6_sukoshi_noboru",      // #222 階段を、ほんの少し登るだけで着きます。
  "kb6_ima_nara_urenokori",  // #223 いまのマンションなら、まず売れ残るほうの階です。
  "kb6_ue_hodo_sagaru",      // #224 そこから上へ行くほど、家賃は下がります。
  "kb6_shiyounin_no_heya",   // #225 最上階は、使用人の部屋でした。
  "kb6_9heihoume_toru",      // #226 広さは9平方メートル。天井は斜めに下がっています。
  "kb6_yane_wa_aen",         // #227 屋根は亜鉛。夏は、焼けるように暑い。
];

export const kosoB6aScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
