// =====================================================================
// 「旅とお土産の歴史」時代考証キット (憲法第3層: 個別シーンより先に作る)
// 8キット: ①古代ローマ ②中世巡礼路 ③江戸街道・伊勢 ④18世紀欧州
//          ⑤江戸湯治場 ⑥19世紀英国鉄道 ⑦明治日本の鉄道 ⑧戦後〜現代
// 設計書: docs/tabi-miyage-kousei.md / 色とゆらぎは KarakuriScenes の型を踏襲
// =====================================================================

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, KARAKURI_FONT, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";

const W = 1920;
const H = 1080;
const FONT = KARAKURI_FONT;

// 旅キット用の追加色 (KRPに無い中間色。輪郭は必ず KRP.ink)
export const TKP = {
  seaBlue: "#A8C8DC",      // 地中海の海
  marble: "#EDE7D8",       // 大理石
  terracotta: "#C2653F",   // ローマの帯
  forest: "#5E7A58",       // 熊野の深い杉山
  forestDark: "#46603F",
  mist: "#E9EDE6",         // 山の霧
  caminoGold: "#DFC489",   // スペインの乾いた平原
  stone: "#C9C2B2",        // 石造り
  roadTan: "#D9C49A",      // 江戸の土の道
  pine: "#4F7A4D",         // 松
  woodDark: "#8A6A48",     // 木造の柱・梁
  woodLight: "#C09A6C",    // 木の壁
  noren: "#4A6A9C",        // 暖簾の藍
  tuscany: "#E4D3A8",      // 18世紀イタリアの丘
  cypress: "#3F5E42",      // 糸杉
  brick: "#A85A44",        // 英国の煉瓦
  brickDark: "#8A4636",
  iron: "#5A6068",         // 鋳鉄
  steam: "#F2F2EE",        // 蒸気・湯けむり
  yukata: "#7A9CC0",       // 浴衣の藍
  airport: "#DCE8F0",      // 現代の明るい空間
  night: "#324258",        // 夕暮れの山の藍
} as const;

// =====================================================================
// キット① 古代ローマ (1章: バイアエ・身分の旅)
// =====================================================================

// 背景: 温かい空気 + 上端にテラコッタの波帯 (中国の雷文帯と描き分け) + 海
export const RomaBg: React.FC<{ f: number; sea?: boolean }> = ({ f, sea = true }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.terracotta} opacity={0.06} />
    {/* 上端の帯: テラコッタ地に白の連続波 (ローマの波紋様) */}
    <rect x={-20} y={-20} width={W + 40} height={96} fill={TKP.terracotta} opacity={0.9} />
    <line x1={-20} y1={78} x2={W + 20} y2={78} stroke={TKP.marble} strokeWidth={6} />
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d={`M ${40 + i * 124} 44 q 26 -34 52 0 q -20 -12 -30 6`}
        fill="none" stroke={TKP.marble} strokeWidth={5} strokeLinecap="round" />
    ))}
    {/* 海 (地中海) と太陽 */}
    {sea && (
      <g>
        <rect x={-20} y={560} width={W + 40} height={200} fill={TKP.seaBlue} opacity={0.65} />
        <line x1={-20} y1={560} x2={W + 20} y2={560} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i}
            d={`M ${120 + i * 270 + Math.sin(f / 30 + i) * 10} ${610 + (i % 3) * 38} q 30 -14 60 0`}
            fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
        ))}
        <circle cx={1660} cy={250} r={64} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      </g>
    )}
    {/* 足元: 石畳 */}
    <rect x={-20} y={760} width={W + 40} height={H - 740} fill={TKP.stone} opacity={0.55} />
    <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.4}>
      <line x1={-20} y1={760} x2={W + 20} y2={760} />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M ${i * 170 + 40} 760 l -26 ${H - 760}`} />
      ))}
      <line x1={-20} y1={880} x2={W + 20} y2={880} />
    </g>
  </g>
);

// 神殿 (ペディメント + 円柱4本)。バイアエの別荘・神殿のどちらにも使う
export const RomanTemple: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 基壇 */}
    <rect x={-250} y={-28} width={500} height={28} fill={TKP.marble} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-270} y={-10} width={540} height={14} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 円柱 (フルーティング溝つき) */}
    {[-186, -62, 62, 186].map((cx) => (
      <g key={cx}>
        <rect x={cx - 26} y={-240} width={52} height={212} fill={TKP.marble} stroke={KRP.ink} strokeWidth={5} />
        <line x1={cx - 10} y1={-234} x2={cx - 10} y2={-34} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
        <line x1={cx + 10} y1={-234} x2={cx + 10} y2={-34} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35} />
        {/* 柱頭 (イオニア式の渦巻き) */}
        <rect x={cx - 34} y={-262} width={68} height={22} fill={TKP.marble} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={cx - 26} cy={-251} r={9} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={cx + 26} cy={-251} r={9} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={cx - 32} y={-36} width={64} height={12} fill={TKP.marble} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    {/* エンタブラチュア + ペディメント (三角破風) */}
    <rect x={-246} y={-292} width={492} height={32} fill={TKP.marble} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -262 -292 L 0 -392 L 262 -292 Z" fill={TKP.marble} stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M -216 -300 L 0 -382 L 216 -300 Z" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
  </g>
);

// トガ姿の人 (Person + 白いトガの掛け布。肩から斜めのドレープ)
export const TogaPerson: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; laurel?: boolean;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "smile", laurel = false }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face}
        cloth={KRP.white} clothDark={TKP.marble} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* トガのドレープ: 右肩から左腰へ */}
        <path d="M 30 -158 Q -10 -120 -52 -92 L -60 -64 Q 0 -96 44 -140 Z"
          fill={TKP.marble} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -60 -64 Q -66 -80 -52 -92" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        {/* 裾のライン */}
        <path d="M -56 -58 Q 0 -44 56 -58" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        {/* 短い髪 (前髪ライン) */}
        <path d="M -58 -252 Q -30 -284 8 -286 Q 50 -282 60 -250 Q 54 -266 30 -272 Q -20 -280 -58 -252 Z"
          fill={KRP.ink} opacity={0.9} />
        {/* 月桂冠 (身分の記号) */}
        {laurel && (
          <g stroke={KRP.ink} strokeWidth={3} fill={KRP.green}>
            {[-50, -34, -16, 2, 20, 38].map((lx, i) => (
              <ellipse key={i} cx={lx} cy={-272 - Math.sin(i) * 4} rx={13} ry={6}
                transform={`rotate(${-24 + i * 10} ${lx} -272)`} />
            ))}
          </g>
        )}
      </g>
    </g>
  );
};

// ワインの杯 (バイアエの歓楽の記号)
export const WineCup: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -34 -52 Q -34 -20 0 -16 Q 34 -20 34 -52 Z" fill={KRP.gold} stroke={KRP.ink} strokeWidth={4.5} />
    <ellipse cx={0} cy={-52} rx={34} ry={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
    <rect x={-4} y={-16} width={8} height={24} fill={KRP.gold} stroke={KRP.ink} strokeWidth={3.5} />
    <ellipse cx={0} cy={10} rx={22} ry={6} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// =====================================================================
// キット② 中世の巡礼路 (2章: 熊野 / サンティアゴ)
// =====================================================================

// 背景A: 熊野 — 深い杉山が重なり、霧がたなびく
export const KumanoBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.forest} opacity={0.08} />
    {/* 遠い山 → 近い山 (3層) */}
    <path d={`M -20 560 Q 300 380 640 520 Q 980 340 1380 500 Q 1680 400 1940 520 L 1940 820 L -20 820 Z`}
      fill={TKP.forest} opacity={0.35} />
    <path d={`M -20 660 Q 380 480 820 640 Q 1240 470 1940 640 L 1940 900 L -20 900 Z`}
      fill={TKP.forest} opacity={0.6} />
    <path d={`M -20 790 Q 500 640 1100 760 Q 1560 660 1940 760 L 1940 1100 L -20 1100 Z`}
      fill={TKP.forestDark} opacity={0.8} />
    {/* 杉の木立 (シルエット) */}
    {[140, 330, 1560, 1760].map((tx, i) => (
      <g key={i} transform={`translate(${tx} ${700 + (i % 2) * 60}) scale(${1 + (i % 2) * 0.3})`}>
        <path d="M 0 -210 L 34 -120 L 16 -120 L 46 -40 L -46 -40 L -16 -120 L -34 -120 Z"
          fill={TKP.forestDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-8} y={-40} width={16} height={40} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    ))}
    {/* たなびく霧 */}
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={400 + i * 560 + Math.sin(f / 46 + i * 2) * 24} cy={600 + i * 60}
        rx={260} ry={34} fill={TKP.mist} opacity={0.5} />
    ))}
    {/* 山道 (つづら折り) */}
    <path d="M 420 1100 Q 700 920 960 960 Q 1300 1000 1500 870"
      fill="none" stroke={TKP.roadTan} strokeWidth={74} strokeLinecap="round" opacity={0.9} />
    <path d="M 420 1100 Q 700 920 960 960 Q 1300 1000 1500 870"
      fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.35} strokeDasharray="2 26" />
  </g>
);

// 王子社 (熊野の道しるべの小さな社)
export const OjiShrine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-56} y={-96} width={112} height={78} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-20} y={-72} width={40} height={54} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -80 -96 L 0 -150 L 80 -96 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 千木 */}
    <line x1={-28} y1={-128} x2={-6} y2={-166} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    <line x1={28} y1={-128} x2={6} y2={-166} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    <rect x={-66} y={-18} width={132} height={18} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// 院政期の参詣者: 白い浄衣 + 立烏帽子 + 杖
export const HeianPilgrim: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised";
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "worried" }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face}
        cloth={KRP.white} clothDark={KRP.white} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 浄衣の広袖 (腕を覆う) */}
        <path d="M -58 -150 L -96 -74 L -56 -66 L -40 -140 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 58 -150 L 96 -74 L 56 -66 L 40 -140 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 襟合わせ */}
        <path d="M -20 -160 L 8 -120 L 30 -160" fill="none" stroke={KRP.ink} strokeWidth={4} />
        {/* 立烏帽子 (黒くて縦に高い) */}
        <path d="M -30 -282 Q -34 -356 2 -362 Q 34 -352 28 -282 Q 0 -294 -30 -282 Z"
          fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
        {/* 髪のライン */}
        <path d="M -58 -248 Q 0 -276 58 -248 Q 30 -264 0 -264 Q -30 -264 -58 -248 Z" fill={KRP.ink} opacity={0.85} />
        {/* 金剛杖 */}
        <line x1={92} y1={-170} x2={108} y2={0} stroke={TKP.woodDark} strokeWidth={11} strokeLinecap="round" />
        <line x1={92} y1={-170} x2={108} y2={0} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      </g>
    </g>
  );
};

// 背景B: サンティアゴへの道 — 乾いた金の平原 + 大聖堂の遠景
export const CaminoBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.caminoGold} opacity={0.22} />
    {/* なだらかな丘 */}
    <path d="M -20 620 Q 460 540 980 610 Q 1460 540 1940 600 L 1940 1100 L -20 1100 Z"
      fill={TKP.caminoGold} opacity={0.65} />
    <path d="M -20 780 Q 600 700 1940 760 L 1940 1100 L -20 1100 Z" fill={TKP.caminoGold} opacity={0.9} />
    {/* 大聖堂の遠景 (双塔) */}
    <g transform="translate(1520 598)" opacity={0.88}>
      <rect x={-120} y={-120} width={240} height={120} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
      {[-86, 86].map((tx) => (
        <g key={tx}>
          <rect x={tx - 26} y={-212} width={52} height={92} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
          <path d={`M ${tx - 32} -212 L ${tx} -258 L ${tx + 32} -212 Z`} fill={TKP.stone} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={tx} y1={-258} x2={tx} y2={-278} stroke={KRP.ink} strokeWidth={4} />
          <line x1={tx - 8} y1={-270} x2={tx + 8} y2={-270} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      <circle cx={0} cy={-70} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -30 0 L -30 -36 Q 0 -58 30 -36 L 30 0 Z" fill={KRP.ink} opacity={0.5} />
    </g>
    {/* 太陽と鳥 */}
    <circle cx={300} cy={220} r={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
    {[0, 1].map((i) => (
      <path key={i} d={`M ${720 + i * 180 + Math.sin(f / 24 + i) * 12} ${200 + i * 50} q 16 -16 32 0 q 16 -16 32 0`}
        fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
    ))}
    {/* 一本道 */}
    <path d="M 960 1100 Q 940 900 1100 760 L 1180 760 Q 1040 900 1120 1100 Z"
      fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
  </g>
);

// 欧州の巡礼者: つば広帽 (ホタテ貝つき) + マント + 杖とひょうたん
export const EuroPilgrim: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised";
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "smile" }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face}
        cloth={TKP.woodDark} clothDark={TKP.woodDark} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* マント (肩掛け) */}
        <path d="M -58 -156 Q 0 -176 58 -156 L 70 -70 Q 0 -94 -70 -70 Z"
          fill={TKP.brickDark} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
        {/* つば広帽 + ホタテ貝 */}
        <ellipse cx={0} cy={-268} rx={92} ry={20} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -44 -268 Q -40 -316 0 -318 Q 40 -316 44 -268 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform="translate(0 -292) scale(0.5)"><ScallopShell x={0} y={0} /></g>
        {/* 杖 + ひょうたん */}
        <line x1={-96} y1={-200} x2={-110} y2={0} stroke={TKP.woodDark} strokeWidth={11} strokeLinecap="round" />
        <circle cx={-98} cy={-196} r={10} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
        <g transform="translate(-122 -140)">
          <circle cx={0} cy={10} r={16} fill={KRP.copper} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-12} r={11} fill={KRP.copper} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-26} x2={-88 + -8} y2={-178 + 120} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        </g>
      </g>
    </g>
  );
};

// ホタテ貝 (サンティアゴの象徴。バッジにも帽子にも使う)
export const ScallopShell: React.FC<{ x: number; y: number; s?: number; metal?: boolean }> = ({
  x, y, s = 1, metal = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 36 L -52 -20 Q -52 -52 0 -52 Q 52 -52 52 -20 Z"
      fill={metal ? KRP.silver : KRP.cream} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    {[-36, -20, 0, 20, 36].map((fx, i) => (
      <line key={i} x1={0} y1={30} x2={fx} y2={-44 + Math.abs(fx) * 0.28}
        stroke={KRP.ink} strokeWidth={3.5} opacity={0.65} />
    ))}
    <rect x={-14} y={-60} width={28} height={14} rx={4}
      fill={metal ? KRP.silver : KRP.cream} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// バッジの鋳型 (2枚割り。開くと貝の彫りが見える) — 「量産」の見せ場
export const BadgeMold: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({
  x, y, s = 1, open = 1,
}) => {
  const ang = 14 * clamp01(open);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 左右の石型 */}
      <g transform={`rotate(${-ang} -70 40)`}>
        <rect x={-150} y={-70} width={140} height={140} rx={10} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5.5} />
        <g transform="translate(-80 0) scale(0.72)" opacity={0.75}>
          <ScallopShell x={0} y={6} metal />
        </g>
        <circle cx={-80} cy={-54} r={7} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      <g transform={`rotate(${ang} 70 40)`}>
        <rect x={10} y={-70} width={140} height={140} rx={10} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={80} cy={0} r={40} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        <circle cx={80} cy={-54} r={7} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 湯口 (注ぎ込み) */}
      <path d="M -16 -92 L 0 -70 L 16 -92 Z" fill="none" stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// =====================================================================
// キット③ 江戸の街道・宿場・伊勢 (3〜4章)
// =====================================================================

// 背景: 松並木の街道 + 遠くに富士 (東海道の記号)
export const KaidoBg: React.FC<{ f: number; fuji?: boolean }> = ({ f, fuji = true }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.roadTan} opacity={0.1} />
    {/* 富士 */}
    {fuji && (
      <g transform="translate(1470 520)" opacity={0.85}>
        <path d="M -260 0 L -70 -240 Q 0 -268 70 -240 L 260 0 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -78 -232 Q 0 -258 78 -232 L 46 -180 Q 24 -196 10 -176 Q -8 -196 -26 -178 Q -40 -194 -46 -180 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
    )}
    {/* 遠い丘 */}
    <path d="M -20 620 Q 420 540 900 606 Q 1300 560 1940 610 L 1940 1100 L -20 1100 Z"
      fill={TKP.pine} opacity={0.18} />
    {/* 街道 (画面を斜めに走る土の道) */}
    <path d="M -20 1100 L 540 700 L 820 700 L 520 1100 Z" fill={TKP.roadTan} opacity={0.95} />
    <path d="M 540 700 L 820 700 M -20 1100 L 540 700 M 520 1100 L 820 700"
      stroke={KRP.ink} strokeWidth={4} opacity={0.4} fill="none" />
    {/* 並木の足元の土手 */}
    <rect x={-20} y={884} width={W + 40} height={H - 864} fill={TKP.pine} opacity={0.12} />
    {/* 雲 */}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${260 + i * 980 + Math.sin(f / 44 + i * 2) * 16} ${170 + i * 60})`}>
        <ellipse cx={0} cy={0} rx={110} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        <ellipse cx={70} cy={-16} rx={60} ry={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
      </g>
    ))}
  </g>
);

// 松の木 (街道の並木。sで大小)
export const MatsuTree: React.FC<{ x: number; y: number; s?: number; flip?: boolean }> = ({
  x, y, s = 1, flip = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {/* 曲がった幹 */}
    <path d="M -10 0 Q -26 -90 6 -150 Q 30 -200 14 -252 L 34 -252 Q 54 -196 28 -146 Q 2 -92 18 0 Z"
      fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 枝 */}
    <path d="M 20 -200 Q 70 -216 104 -204" fill="none" stroke={TKP.woodDark} strokeWidth={10} strokeLinecap="round" />
    <path d="M 2 -140 Q -56 -158 -88 -140" fill="none" stroke={TKP.woodDark} strokeWidth={9} strokeLinecap="round" />
    {/* 松葉の笠 (扁平な雲形3つ) */}
    <ellipse cx={24} cy={-286} rx={96} ry={34} fill={TKP.pine} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={116} cy={-220} rx={66} ry={26} fill={TKP.pine} stroke={KRP.ink} strokeWidth={4.5} />
    <ellipse cx={-96} cy={-156} rx={62} ry={24} fill={TKP.pine} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// 宿場の建物 (瓦屋根 + 暖簾 + 格子)
export const Shukuba: React.FC<{ x: number; y: number; s?: number; sign?: string }> = ({
  x, y, s = 1, sign = "旅籠",
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 壁 */}
    <rect x={-210} y={-200} width={420} height={200} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5.5} />
    {/* 瓦屋根 (ゆるい反り) */}
    <path d="M -250 -200 Q 0 -232 250 -200 L 226 -266 Q 0 -294 -226 -266 Z"
      fill={TKP.iron} stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M -226 -266 Q 0 -294 226 -266" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
    {/* 格子窓 */}
    <g stroke={KRP.ink} strokeWidth={4} fill={TKP.woodDark}>
      <rect x={-184} y={-168} width={120} height={90} />
      {[-168, -148, -128, -108, -88].map((lx) => (
        <line key={lx} x1={lx} y1={-168} x2={lx} y2={-78} stroke={TKP.woodLight} strokeWidth={6} />
      ))}
    </g>
    {/* 入口 + 暖簾 */}
    <rect x={30} y={-150} width={150} height={150} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    <g>
      <rect x={22} y={-158} width={166} height={64} fill={TKP.noren} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={77} y1={-158} x2={77} y2={-94} stroke={KRP.ink} strokeWidth={4} />
      <line x1={132} y1={-158} x2={132} y2={-94} stroke={KRP.ink} strokeWidth={4} />
      <text x={105} y={-114} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
        fill={KRP.white}>{sign}</text>
    </g>
  </g>
);

// 神明鳥居 (伊勢の鳥居は笠木がまっすぐ。朱塗りにしない素木)
export const ShinmeiTorii: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={-120} y1={0} x2={-104} y2={-280} stroke={TKP.woodLight} strokeWidth={30} strokeLinecap="round" />
    <line x1={120} y1={0} x2={104} y2={-280} stroke={TKP.woodLight} strokeWidth={30} strokeLinecap="round" />
    <line x1={-120} y1={0} x2={-104} y2={-280} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
    <line x1={120} y1={0} x2={104} y2={-280} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
    {/* 貫 (ぬき) と笠木 (まっすぐ=神明系) */}
    <rect x={-128} y={-238} width={256} height={20} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={-158} y={-300} width={316} height={26} rx={4} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// 江戸の旅人: 菅笠 + 着物の裾からげ + 振り分け荷物 + 杖
export const EdoTraveler: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; cloth?: string;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "smile", cloth = TKP.noren }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face}
        cloth={cloth} clothDark={KRP.white} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 着物の襟 + 帯 */}
        <path d="M -24 -160 L 10 -112 L 34 -160" fill="none" stroke={KRP.white} strokeWidth={7} />
        <rect x={-58} y={-104} width={116} height={20} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        {/* 菅笠 (大きな円錐) */}
        <path d="M -94 -258 L 0 -322 L 94 -258 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -94 -258 Q 0 -244 94 -258" fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-30} y1={-252} x2={-14} y2={-196} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        <line x1={30} y1={-252} x2={14} y2={-196} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        {/* 振り分け荷物 (肩の棒 + 前後の包み) */}
        <line x1={-66} y1={-168} x2={70} y2={-152} stroke={TKP.woodDark} strokeWidth={9} strokeLinecap="round" />
        <g transform="translate(-84 -142)">
          <rect x={-26} y={-20} width={52} height={44} rx={10} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={0} y1={-20} x2={-16} y2={-168 + 142} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        <g transform="translate(88 -126)">
          <rect x={-24} y={-18} width={48} height={40} rx={10} fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={0} y1={-18} x2={-14} y2={-152 + 126} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* 脚絆 (白い巻き) */}
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
          <line x1={-30} y1={-40} x2={-6} y2={-40} />
          <line x1={-30} y1={-26} x2={-6} y2={-26} />
          <line x1={6} y1={-40} x2={30} y2={-40} />
          <line x1={6} y1={-26} x2={30} y2={-26} />
        </g>
      </g>
    </g>
  );
};

// 御師: 羽織姿 + 扇 + お札の文箱を捧げ持つ
export const OnshiPerson: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised";
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "smile" }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face}
        cloth={TKP.night} clothDark={KRP.gray} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 羽織 (肩線 + 前が開いて中の着物が見える) */}
        <path d="M -58 -156 L -70 -64 L -46 -60 L -30 -150 Z" fill={TKP.night} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 58 -156 L 70 -64 L 46 -60 L 30 -150 Z" fill={TKP.night} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -22 -158 L 4 -108 L 28 -158" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 羽織紐 */}
        <path d="M -10 -132 Q 4 -124 18 -132" fill="none" stroke={KRP.white} strokeWidth={4.5} />
        {/* 髷 (ちょんまげ) */}
        <path d="M -56 -252 Q 0 -278 56 -252 Q 28 -266 0 -266 Q -28 -266 -56 -252 Z" fill={KRP.ink} />
        <rect x={-7} y={-300} width={14} height={34} rx={7} fill={KRP.ink} transform="rotate(-18 0 -284)" />
        {/* 捧げ持つ文箱 (お札入れ) */}
        <g transform="translate(96 -120)">
          <rect x={-34} y={-24} width={68} height={40} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={-34} y1={-8} x2={34} y2={-8} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          <rect x={-8} y={-20} width={16} height={30} fill={KRP.red} opacity={0.85} />
        </g>
      </g>
    </g>
  );
};

// 御祓大麻 (お札): 縦長の白札 + 朱印。土産の「正体」
export const OfudaTag: React.FC<{ x: number; y: number; s?: number; text?: string }> = ({
  x, y, s = 1, text = "御祓",
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-36} y={-130} width={72} height={260} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -36 -130 L 0 -158 L 36 -130 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <text x={0} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46}
      fill={KRP.ink} writing-mode="tb">{text}</text>
    <circle cx={0} cy={74} r={22} fill="none" stroke={KRP.red} strokeWidth={5} opacity={0.9} />
    <text x={0} y={84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.red}>印</text>
  </g>
);

// 往来手形 (折り紙の証文 + 黒い印)
export const TegataCard: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({
  x, y, s = 1, rot = -4,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-120} y={-80} width={240} height={160} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <text x={0} y={-36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>往来手形</text>
    {[0, 1, 2].map((i) => (
      <line key={i} x1={-92} y1={-4 + i * 26} x2={92 - i * 30} y2={-4 + i * 26}
        stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
    ))}
    <rect x={56} y={28} width={44} height={44} rx={5} fill={KRP.red} opacity={0.85} />
  </g>
);

// 講の積立帳 (帳簿 + 銭)
export const KouChoubou: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-76} width={220} height={152} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <line x1={0} y1={-76} x2={0} y2={76} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
    <text x={-55} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink}>伊勢講</text>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <line x1={-96} y1={-8 + i * 24} x2={-14} y2={-8 + i * 24} stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
        <line x1={14} y1={-32 + i * 24} x2={96} y2={-32 + i * 24} stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
      </g>
    ))}
    {/* 寛永通宝風の銭 (穴あき) */}
    {[[-150, 56], [150, 40], [128, 76]].map(([cx, cy], i) => (
      <g key={i} transform={`translate(${cx} ${cy})`}>
        <circle cx={0} cy={0} r={26} fill={KRP.copper} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-8} y={-8} width={16} height={16} fill={KRP.paper} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    ))}
  </g>
);

// 餞別の包み (のし紙風の白包み + 水引)
export const SenbetsuPack: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-48} width={140} height={96} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -70 -48 L -30 0 L -70 48 M 70 -48 L 30 0 L 70 48" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
    <line x1={0} y1={-48} x2={0} y2={48} stroke={KRP.red} strokeWidth={7} />
    <line x1={-8} y1={-48} x2={-8} y2={48} stroke={KRP.white} strokeWidth={3} />
    <path d="M -16 -8 Q 0 -24 16 -8 Q 0 8 -16 -8" fill="none" stroke={KRP.red} strokeWidth={4.5} />
  </g>
);

// =====================================================================
// キット④ 18世紀欧州 (5章: グランドツアー)
// =====================================================================

// 背景: トスカーナの丘 + 糸杉 + 遠くのヴィラ。温かい黄土の空気
export const EuroBg18c: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.tuscany} opacity={0.14} />
    {/* なだらかな丘 3層 (遠いほど薄い黄土、手前は濃く) */}
    <path d={`M -20 ${H - 340} Q 480 ${H - 480} 980 ${H - 350} T ${W + 20} ${H - 390} L ${W + 20} ${H + 20} L -20 ${H + 20} Z`}
      fill={TKP.tuscany} opacity={0.95} filter="url(#wobbleSoft)" />
    <path d={`M -20 ${H - 340} Q 480 ${H - 480} 980 ${H - 350} T ${W + 20} ${H - 390}`}
      fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.25} filter="url(#wobbleSoft)" />
    <path d={`M -20 ${H - 190} Q 600 ${H - 310} 1200 ${H - 190} T ${W + 20} ${H - 230} L ${W + 20} ${H + 20} L -20 ${H + 20} Z`}
      fill={TKP.roadTan} filter="url(#wobbleSoft)" />
    <path d={`M -20 ${H - 190} Q 600 ${H - 310} 1200 ${H - 190} T ${W + 20} ${H - 230}`}
      fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3} filter="url(#wobbleSoft)" />
    {/* ブドウ畑の畝 (丘の模様) */}
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${320 + i * 90} ${H - 260 + i * 26} q 160 ${-26 + i * 8} 330 ${6 + i * 6}`}
        fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.18} />
    ))}
    <rect x={-20} y={H - 120} width={W + 40} height={140} fill={KRP.floor} opacity={0.85} />
    <line x1={-20} y1={H - 120} x2={W + 20} y2={H - 120} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
    {/* 糸杉の並び */}
    {[[190, H - 160, 1.1], [290, H - 150, 0.85], [1160, H - 300, 0.6], [1250, H - 292, 0.5], [1700, H - 170, 1.05], [1800, H - 155, 0.8]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
        <path d="M 0 0 C -26 -40 -30 -120 0 -190 C 30 -120 26 -40 0 0 Z" fill={TKP.cypress} stroke={KRP.ink} strokeWidth={5} />
        <line x1={0} y1={0} x2={0} y2={18} stroke={KRP.ink} strokeWidth={6} />
      </g>
    ))}
    {/* 遠くのヴィラ (丘の上の屋敷) */}
    <g transform={`translate(860 ${H - 400}) scale(0.72)`} filter="url(#wobble)" opacity={0.95}>
      <rect x={-90} y={-70} width={180} height={70} fill={TKP.marble} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -100 -70 L 0 -118 L 100 -70 Z" fill={TKP.terracotta} stroke={KRP.ink} strokeWidth={5} />
      {[-58, -20, 18, 42].map((wx, i) => (
        <rect key={i} x={wx} y={-52} width={16} height={28} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
    </g>
    {/* 太陽 */}
    <circle cx={1700} cy={150} r={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} filter="url(#wobble)" opacity={0.9} />
  </g>
);

// 四輪の旅行馬車 (グランドツアーの乗り物・馬付き)
export const Carriage: React.FC<{ x: number; y: number; s?: number; f: number; horse?: boolean }> = ({ x, y, s = 1, f, horse = true }) => {
  const wheel = (f * 4) % 360;
  const sway = Math.sin(f / 9) * 2;
  const trot = Math.sin(f / 6) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
      {horse && (
        <g transform="translate(300 0)">
          {/* 引き具 (馬車と馬をつなぐ棒) */}
          <line x1={-150} y1={-56} x2={-28} y2={-62} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          {/* 胴 */}
          <ellipse cx={30} cy={-88} rx={88} ry={48} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={6} />
          {/* 首 (太いくさび形) */}
          <path d="M 58 -108 L 102 -196 L 148 -186 L 108 -82 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* 顔 (前に突き出た楕円) */}
          <g transform="translate(128 -192) rotate(16)">
            <ellipse cx={30} cy={0} rx={44} ry={21} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={24} cy={-7} r={5} fill={KRP.ink} />
            <circle cx={68} cy={3} r={4} fill={KRP.ink} opacity={0.7} />
            {/* 耳 */}
            <path d="M -2 -16 L -12 -42 L 14 -24 Z" fill={KRP.ink} />
          </g>
          {/* たてがみ (首の後ろ縁) */}
          <path d="M 58 -108 L 102 -196 L 116 -192 L 74 -100 Z" fill={KRP.ink} opacity={0.85} />
          {/* 脚 (前後それぞれ歩行で前後に振る) */}
          <g stroke={KRP.ink} strokeWidth={10} strokeLinecap="round">
            <line x1={-24} y1={-50} x2={-30 - trot} y2={0} />
            <line x1={-2} y1={-48} x2={6 + trot} y2={0} />
            <line x1={62} y1={-48} x2={56 + trot} y2={0} />
            <line x1={84} y1={-50} x2={92 - trot} y2={0} />
          </g>
          {/* しっぽ */}
          <path d={`M -54 -92 Q -82 -74 ${-74 + Math.sin(f / 11) * 6} -40`} fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        </g>
      )}
      {/* 車体 */}
      <g transform={`translate(0 ${sway})`}>
        <rect x={-130} y={-150} width={210} height={110} rx={18} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-104} y={-128} width={62} height={52} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-14} y={-128} width={62} height={52} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-130} y={-168} width={210} height={22} rx={10} fill={KRP.ink} opacity={0.85} />
        {/* 屋根の旅行鞄 */}
        <rect x={-72} y={-196} width={96} height={30} rx={8} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-46} y1={-196} x2={-46} y2={-166} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <line x1={0} y1={-196} x2={0} y2={-166} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        {/* 御者台 */}
        <rect x={86} y={-140} width={64} height={18} rx={8} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 車輪 2つ (スポーク回転) */}
      {[[-78, 0, 46], [96, 0, 40]].map(([cx, cy, r], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <circle cx={0} cy={0} r={r} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          <g transform={`rotate(${wheel})`}>
            {[0, 45, 90, 135].map((a) => (
              <line key={a} x1={-r + 7} y1={0} x2={r - 7} y2={0} transform={`rotate(${a})`} stroke={KRP.ink} strokeWidth={5} />
            ))}
          </g>
          <circle cx={0} cy={0} r={7} fill={KRP.ink} />
        </g>
      ))}
    </g>
  );
};

// 貴族の子弟 (三角帽 + 金縁の長コート)。Person着せ替え方式
export const NobleSon: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number];
}> = ({ x, y, s = 1, f, phase = 0, face = "normal", gaze }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} gaze={gaze} hair="none" cloth={KRP.blueDeep} clothDark="#3A5E92" />
      <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
        <g transform={`translate(0 ${bob})`}>
          {/* 金縁のコート前立て */}
          <line x1={-20} y1={-152} x2={-20} y2={-36} stroke={KRP.gold} strokeWidth={7} strokeLinecap="round" />
          <line x1={20} y1={-152} x2={20} y2={-36} stroke={KRP.gold} strokeWidth={7} strokeLinecap="round" />
          {[-118, -88, -58].map((by, i) => (
            <circle key={i} cx={0} cy={by} r={6} fill={KRP.gold} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {/* クラヴァット (白の襟飾り) */}
          <path d="M -16 -158 Q 0 -142 16 -158 L 10 -126 Q 0 -118 -10 -126 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {/* 三角帽 (黒・縁は金) */}
          <g transform="translate(0 -228)">
            {/* 横髪 (白い巻き毛) */}
            <circle cx={-58} cy={-24} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={58} cy={-24} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -80 -34 Q 0 -186 80 -34 Q 42 -66 0 -70 Q -42 -66 -80 -34 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -80 -34 Q 0 -186 80 -34" fill="none" stroke={KRP.gold} strokeWidth={5} />
          </g>
        </g>
      </g>
    </g>
  );
};

// 金縁額装の風景画 (カナレット役: 高級土産)
export const FramedPainting: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    <rect x={-120} y={-90} width={240} height={180} rx={6} fill={KRP.gold} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-100} y={-70} width={200} height={140} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 運河と建物 (ヴェネツィア風) */}
    <rect x={-100} y={18} width={200} height={52} fill={TKP.seaBlue} />
    <path d="M -84 18 L -84 -34 L -40 -34 L -40 18 M -62 -34 L -62 -52 L -50 -52 L -50 -34" fill={TKP.marble} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M 30 18 L 30 -24 L 86 -24 L 86 18" fill={TKP.terracotta} opacity={0.8} stroke={KRP.ink} strokeWidth={3.5} />
    {/* ゴンドラ */}
    <path d="M -30 44 Q 4 54 42 42 Q 22 50 -12 50 Z" fill={KRP.ink} />
    <path d="M -100 32 q 24 5 48 0 q 24 -5 48 0 q 24 5 48 0 q 24 -5 56 0" fill="none" stroke={KRP.white} strokeWidth={2.5} opacity={0.7} />
    <rect x={-100} y={-70} width={200} height={140} fill="none" stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// 白黒の版画 (ピラネージ役: 廉価土産)。紙がまくれている
export const PrintSheet: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`} filter="url(#wobble)">
    <rect x={-95} y={-125} width={190} height={250} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 95 101 L 95 125 L 71 125 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    {/* 遺跡の版画 (黒線のみ = 版画らしさ) */}
    <g stroke={KRP.ink} fill="none" strokeWidth={4}>
      <path d="M -62 60 L -62 -30 M -34 60 L -34 -34 M -6 60 L -6 -36 M 22 60 L 22 -34 M 50 60 L 50 -30" />
      <path d="M -70 -30 Q -6 -52 58 -30" strokeWidth={5} />
      <line x1={-72} y1={60} x2={64} y2={60} strokeWidth={5} />
    </g>
    {/* ハッチング (版画の影線) */}
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={-66 + i * 8} y1={84} x2={-50 + i * 8} y2={68} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
    ))}
    <line x1={-60} y1={100} x2={60} y2={100} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
  </g>
);

// =====================================================================
// キット⑤ 江戸の湯治場 (6章: 湯治・一廻り7日)
// =====================================================================

// 背景: 山あいの夕景 + 立ちのぼる湯けむり
export const OnsenBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.night} opacity={0.1} />
    {/* 山なみ 2層 */}
    <path d={`M -20 ${H - 360} L 320 ${H - 620} L 700 ${H - 380} L 1080 ${H - 640} L 1500 ${H - 390} L ${W + 20} ${H - 540} L ${W + 20} ${H + 20} L -20 ${H + 20} Z`}
      fill={TKP.night} opacity={0.3} filter="url(#wobbleSoft)" />
    <path d={`M -20 ${H - 240} L 420 ${H - 460} L 880 ${H - 260} L 1340 ${H - 480} L ${W + 20} ${H - 270} L ${W + 20} ${H + 20} L -20 ${H + 20} Z`}
      fill={TKP.forest} opacity={0.55} filter="url(#wobbleSoft)" />
    <rect x={-20} y={H - 140} width={W + 40} height={160} fill={KRP.floor} opacity={0.9} />
    <line x1={-20} y1={H - 140} x2={W + 20} y2={H - 140} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
    {/* 湯けむり (ゆらゆら上がる 3本) */}
    {[[300, 0], [960, 40], [1620, 80]].map(([bx, ph], i) => {
      const sway = Math.sin((f + (ph as number)) / 23) * 26;
      return (
        <path key={i}
          d={`M ${bx} ${H - 160} C ${bx - 30 + sway} ${H - 330} ${bx + 40 + sway} ${H - 460} ${bx + sway * 1.6} ${H - 640}`}
          fill="none" stroke={TKP.steam} strokeWidth={46} strokeLinecap="round" opacity={0.55} filter="url(#wobbleSoft)" />
      );
    })}
  </g>
);

// 岩組みの露天風呂 (湯けむり付き)
export const Rotenburo: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    {/* 湯船 */}
    <ellipse cx={0} cy={0} rx={230} ry={64} fill={TKP.seaBlue} stroke={KRP.ink} strokeWidth={6} />
    <path d={`M -170 ${-6 + Math.sin(f / 11) * 3} q 42 ${8 + Math.sin(f / 7) * 3} 84 0 q 42 -8 84 0 q 42 8 84 0`}
      fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.75} />
    {/* 岩の縁 */}
    {[[-228, -12, 42], [-150, 26, 36], [150, 30, 38], [226, -8, 44], [-40, 48, 34], [70, 50, 32]].map(([cx, cy, r], i) => (
      <g key={i} transform={`translate(${cx} ${cy})`}>
        <path d={`M ${-r} 10 Q ${-r * 0.7} ${-r} 0 ${-r * 0.9} Q ${r * 0.8} ${-r * 0.8} ${r} 8 Q 0 ${r * 0.5} ${-r} 10 Z`}
          fill={TKP.stone} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
    ))}
    {/* 湯けむり */}
    <path d={`M -60 -30 C ${-80 + Math.sin(f / 17) * 14} -120 ${-30 + Math.sin(f / 13) * 14} -180 ${-50 + Math.sin(f / 19) * 20} -260`}
      fill="none" stroke={TKP.steam} strokeWidth={30} strokeLinecap="round" opacity={0.6} />
    <path d={`M 80 -26 C ${60 + Math.sin((f + 30) / 15) * 14} -110 ${110 + Math.sin(f / 12) * 12} -170 ${90 + Math.sin((f + 50) / 21) * 20} -240`}
      fill="none" stroke={TKP.steam} strokeWidth={24} strokeLinecap="round" opacity={0.5} />
  </g>
);

// 湯宿 (「ゆ」の暖簾)
export const YuYado: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    {/* 屋根 */}
    <path d="M -230 -200 L 0 -268 L 230 -200 L 206 -178 L 0 -238 L -206 -178 Z" fill={KRP.ink} opacity={0.88} />
    {/* 壁と柱 */}
    <rect x={-196} y={-186} width={392} height={186} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
    <line x1={-196} y1={-90} x2={196} y2={-90} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
    {/* 格子窓 */}
    {[-160, 96].map((wx, i) => (
      <g key={i}>
        <rect x={wx} y={-162} width={64} height={56} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
        {[1, 2, 3].map((k) => (
          <line key={k} x1={wx + k * 16} y1={-162} x2={wx + k * 16} y2={-106} stroke={KRP.ink} strokeWidth={3} />
        ))}
      </g>
    ))}
    {/* 「ゆ」の暖簾 */}
    <rect x={-66} y={-170} width={132} height={96} fill={TKP.noren} stroke={KRP.ink} strokeWidth={5} />
    <line x1={-22} y1={-170} x2={-22} y2={-74} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
    <line x1={22} y1={-170} x2={22} y2={-74} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
    <text x={0} y={-104} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.white}>ゆ</text>
    {/* 入口 */}
    <rect x={-50} y={-74} width={100} height={74} fill={KRP.ink} opacity={0.5} />
  </g>
);

// 浴衣の人 (V襟 + 帯 + 頭に手ぬぐい)。Person着せ替え方式
export const YukataPerson: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number]; tenugui?: boolean;
}> = ({ x, y, s = 1, f, phase = 0, face = "smile", gaze, tenugui = true }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} gaze={gaze} hair="none" cloth={TKP.yukata} clothDark="#5E80A6" />
      <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
        <g transform={`translate(0 ${bob})`}>
          {/* V襟 (左前) */}
          <path d="M -30 -156 L 0 -108 L 30 -156" fill="none" stroke={KRP.white} strokeWidth={9} strokeLinecap="round" />
          <path d="M -30 -156 L 0 -108" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          {/* 帯 */}
          <rect x={-46} y={-84} width={92} height={22} rx={8} fill={KRP.ink} opacity={0.82} />
          {tenugui && (
            <g transform="translate(0 -228)">
              {/* 頭にのせた畳んだ手ぬぐい (頭頂を覆う白い布) */}
              <path d="M -52 -46 Q 0 -86 52 -46 L 58 -32 Q 0 -62 -58 -32 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
              <line x1={-18} y1={-58} x2={-14} y2={-42} stroke={TKP.noren} strokeWidth={4} opacity={0.7} />
              <line x1={18} y1={-58} x2={14} y2={-42} stroke={TKP.noren} strokeWidth={4} opacity={0.7} />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// 温泉番付 (相撲番付風の縦長紙)
export const OnsenBanzuke: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    <rect x={-105} y={-150} width={210} height={300} rx={4} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
    <text x={0} y={-104} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>温泉番付</text>
    <line x1={-80} y1={-86} x2={80} y2={-86} stroke={KRP.ink} strokeWidth={4} />
    <line x1={0} y1={-86} x2={0} y2={128} stroke={KRP.ink} strokeWidth={4} />
    {/* 東西の欄: 上ほど大きい字 (番付らしさ) */}
    <text x={-46} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={25} fill={KRP.ink}>東</text>
    <text x={46} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={25} fill={KRP.ink}>西</text>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <line x1={-86} y1={-30 + i * 38} x2={-14} y2={-30 + i * 38} stroke={KRP.ink} strokeWidth={4 - i * 0.6} opacity={0.65} />
        <line x1={14} y1={-30 + i * 38} x2={86} y2={-30 + i * 38} stroke={KRP.ink} strokeWidth={4 - i * 0.6} opacity={0.65} />
      </g>
    ))}
  </g>
);

// 『旅行用心集』(1810年のガイドブック)
export const YoujinshuBook: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`} filter="url(#wobble)">
    {/* 和綴じ本 */}
    <rect x={-85} y={-115} width={170} height={230} rx={4} fill={TKP.noren} stroke={KRP.ink} strokeWidth={6} />
    {/* 綴じ糸 */}
    {[-85, -42, 1, 44, 87].map((ty, i) => (
      <circle key={i} cx={-68} cy={ty} r={4.5} fill={KRP.ink} />
    ))}
    <line x1={-68} y1={-90} x2={-68} y2={92} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
    {/* 題箋 (縦書きの白札) */}
    <rect x={-20} y={-100} width={62} height={200} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    <text x={11} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}
      style={{ writingMode: "vertical-rl" as const }}>旅行用心集</text>
  </g>
);

// =====================================================================
// キット⑥ 19世紀英国の鉄道 (7〜8章前半: クック・時刻表)
// =====================================================================

// 背景: 煉瓦アーチの駅 + 鉄とガラスの大屋根 + 煙
export const BritStationBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.brick} opacity={0.07} />
    {/* 鉄とガラスの大屋根 (弓形トラス2本 + その間の支柱) */}
    <path d={`M -20 330 Q ${W / 2} -150 ${W + 20} 330`} fill="none" stroke={TKP.iron} strokeWidth={22} filter="url(#wobbleSoft)" />
    <path d={`M -20 420 Q ${W / 2} -40 ${W + 20} 420`} fill="none" stroke={TKP.iron} strokeWidth={12} opacity={0.8} filter="url(#wobbleSoft)" />
    {Array.from({ length: 11 }, (_, i) => {
      const t = (i + 1) / 12;
      const u = 1 - t;
      const x = -20 + t * (W + 40);
      // 2次ベジェの実座標 (上アーチ: 330→-150→330 / 下アーチ: 420→-40→420)
      const y1 = u * u * 330 + 2 * t * u * -150 + t * t * 330;
      const y2 = u * u * 420 + 2 * t * u * -40 + t * t * 420;
      return <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke={TKP.iron} strokeWidth={7} opacity={0.75} />;
    })}
    {/* 煉瓦の壁 (左右) */}
    {[[-20, 0], [W - 240, 1]].map(([bx], i) => (
      <g key={i}>
        <rect x={bx as number} y={300} width={260} height={H - 420} fill={TKP.brick} opacity={0.85} filter="url(#wobbleSoft)" />
        {Array.from({ length: 7 }, (_, r) => (
          <line key={r} x1={bx as number} y1={360 + r * 56} x2={(bx as number) + 260} y2={360 + r * 56} stroke={TKP.brickDark} strokeWidth={4} opacity={0.7} />
        ))}
        {/* アーチ窓 */}
        <path d={`M ${(bx as number) + 80} 560 L ${(bx as number) + 80} 440 Q ${(bx as number) + 130} 380 ${(bx as number) + 180} 440 L ${(bx as number) + 180} 560 Z`}
          fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
      </g>
    ))}
    {/* プラットホーム */}
    <rect x={-20} y={H - 150} width={W + 40} height={170} fill={TKP.stone} opacity={0.9} />
    <line x1={-20} y1={H - 150} x2={W + 20} y2={H - 150} stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
    {/* 漂う蒸気 */}
    <ellipse cx={520 + Math.sin(f / 29) * 30} cy={300} rx={190} ry={54} fill={TKP.steam} opacity={0.42} filter="url(#wobbleSoft)" />
    <ellipse cx={1340 + Math.sin((f + 40) / 23) * 36} cy={240} rx={150} ry={44} fill={TKP.steam} opacity={0.36} filter="url(#wobbleSoft)" />
  </g>
);

// 横向きの蒸気機関車 (動輪回転 + 煙)
export const SteamLoco: React.FC<{ x: number; y: number; s?: number; f: number; run?: boolean }> = ({ x, y, s = 1, f, run = true }) => {
  const wheel = run ? (f * 6) % 360 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
      {/* 煙 (もくもくと上がる雲形) */}
      {[0, 1, 2].map((i) => {
        const t = ((f / 2 + i * 18) % 54) / 54;
        const cx = 128 + Math.sin((f + i * 40) / 15) * 10 - t * 56;
        const cy = -200 - t * 130;
        const r = 20 + t * 30;
        return (
          <g key={i} opacity={0.85 - t * 0.65}>
            <circle cx={cx} cy={cy} r={r} fill={TKP.steam} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={cx - r * 0.7} cy={cy + r * 0.35} r={r * 0.62} fill={TKP.steam} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={cx + r * 0.7} cy={cy + r * 0.3} r={r * 0.55} fill={TKP.steam} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={cx} cy={cy} r={r} fill={TKP.steam} />
            <circle cx={cx - r * 0.7} cy={cy + r * 0.35} r={r * 0.56} fill={TKP.steam} />
            <circle cx={cx + r * 0.7} cy={cy + r * 0.3} r={r * 0.5} fill={TKP.steam} />
          </g>
        );
      })}
      {/* ボイラー */}
      <rect x={-40} y={-128} width={210} height={84} rx={38} fill={KRP.green} stroke={KRP.ink} strokeWidth={6.5} />
      <rect x={-40} y={-128} width={210} height={84} rx={38} fill="none" stroke={KRP.ink} strokeWidth={6.5} />
      {/* 煙突 */}
      <path d="M 112 -128 L 112 -176 L 146 -176 L 146 -128 M 106 -176 L 152 -176 L 152 -190 L 106 -190 Z" fill={KRP.ink} />
      {/* 蒸気ドーム */}
      <path d="M 28 -128 Q 48 -156 68 -128 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* 運転室 */}
      <rect x={-150} y={-168} width={116} height={124} rx={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={6.5} />
      <rect x={-128} y={-148} width={52} height={44} rx={6} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 台枠と緩衝器 */}
      <rect x={-160} y={-44} width={344} height={26} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M 184 -38 L 206 -38 M 206 -48 L 206 -28" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
      {/* 動輪 (大1 + 小2) + 連結棒 */}
      <g transform="translate(-6 10)">
        <circle cx={0} cy={0} r={52} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${wheel})`}>
          {[0, 60, 120].map((a) => (
            <line key={a} x1={-45} y1={0} x2={45} y2={0} transform={`rotate(${a})`} stroke={KRP.ink} strokeWidth={5} />
          ))}
        </g>
        <circle cx={0} cy={0} r={8} fill={KRP.ink} />
      </g>
      {[-116, 110].map((cx, i) => (
        <g key={i} transform={`translate(${cx} 26)`}>
          <circle cx={0} cy={0} r={34} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6.5} />
          <g transform={`rotate(${wheel})`}>
            <line x1={-27} y1={0} x2={27} y2={0} stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={0} y1={-27} x2={0} y2={27} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
          <circle cx={0} cy={0} r={6} fill={KRP.ink} />
        </g>
      ))}
      {/* 連結棒 (動輪の回転に合わせて上下) */}
      <line x1={-116} y1={26 + Math.sin((wheel * Math.PI) / 180) * 20} x2={110} y2={26 + Math.sin((wheel * Math.PI) / 180) * 20}
        stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" opacity={0.85} />
    </g>
  );
};

// ヴィクトリア朝紳士 (シルクハット + フロックコート)。Person着せ替え方式
export const VictorianGent: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number];
}> = ({ x, y, s = 1, f, phase = 0, face = "normal", gaze }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} gaze={gaze} hair="none" cloth={KRP.ink} clothDark="#2A241F" />
      <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
        <g transform={`translate(0 ${bob})`}>
          {/* 白シャツ + 蝶タイ */}
          <path d="M -14 -158 L 0 -120 L 14 -158 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M -12 -156 L 0 -148 L 12 -156 L 12 -142 L 0 -148 L -12 -142 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          {/* シルクハット */}
          <g transform="translate(0 -228)">
            <rect x={-40} y={-108} width={80} height={72} rx={6} fill={KRP.ink} />
            <rect x={-62} y={-42} width={124} height={14} rx={7} fill={KRP.ink} />
            <rect x={-40} y={-56} width={80} height={10} fill={KRP.silver} opacity={0.5} />
          </g>
        </g>
      </g>
    </g>
  );
};

// 時刻表 (TIME TABLE と時計)
export const TimetableSheet: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    <rect x={-110} y={-145} width={220} height={290} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <text x={0} y={-104} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink} letterSpacing={1}>TIME</text>
    <text x={0} y={-72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink} letterSpacing={1}>TABLE</text>
    <line x1={-86} y1={-56} x2={86} y2={-56} stroke={KRP.ink} strokeWidth={4} />
    <line x1={0} y1={-56} x2={0} y2={118} stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <line x1={-88} y1={-30 + i * 32} x2={-12} y2={-30 + i * 32} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        <circle cx={34 + (i % 3) * 18} cy={-30 + i * 32} r={4} fill={KRP.ink} opacity={0.6} />
      </g>
    ))}
  </g>
);

// 駅の時計 (ローマ数字風の懐中時計デザイン)
export const StationClock: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    <circle cx={0} cy={0} r={84} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
    <circle cx={0} cy={0} r={68} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={0} y1={-60} x2={0} y2={-48} transform={`rotate(${i * 30})`} stroke={KRP.ink} strokeWidth={4.5} />
    ))}
    <line x1={0} y1={10} x2={0} y2={-36} transform={`rotate(${(f / 3) % 360})`} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
    <line x1={0} y1={8} x2={0} y2={-52} transform={`rotate(${(f * 2) % 360})`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
    <circle cx={0} cy={0} r={6} fill={KRP.ink} />
    <path d="M -14 -84 L -14 -102 L 14 -102 L 14 -84" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// 1シリング硬貨
export const ShillingCoin: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    <circle cx={0} cy={0} r={56} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={0} cy={0} r={44} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
    <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>1</text>
    <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={13} fill={KRP.ink} opacity={0.75}>SHILLING</text>
  </g>
);

// =====================================================================
// キット⑦ 明治日本の鉄道 (8章後半: 駅弁・お札が菓子に変わる)
// =====================================================================

// 背景: 和洋折衷の駅舎 + ホーム + 空
export const MeijiStationBg: React.FC<{ f: number; sign?: string }> = ({ f, sign = "うつのみや" }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueSoft} opacity={0.14} />
    {/* 雲 */}
    <ellipse cx={380 + Math.sin(f / 31) * 16} cy={160} rx={130} ry={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.75} filter="url(#wobbleSoft)" />
    <ellipse cx={1560 + Math.sin((f + 60) / 27) * 14} cy={120} rx={110} ry={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={0.7} filter="url(#wobbleSoft)" />
    {/* 駅舎 (寄棟屋根 + 洋風の柱 = 和洋折衷) */}
    <g transform={`translate(${W / 2} 320)`} filter="url(#wobbleSoft)">
      <path d="M -560 0 L -500 -120 L 500 -120 L 560 0 Z" fill={KRP.ink} opacity={0.85} />
      <rect x={-520} y={0} width={1040} height={270} fill={TKP.woodLight} opacity={0.95} stroke={KRP.ink} strokeWidth={6} />
      {/* 洋風の白い柱 */}
      {[-460, -240, 240, 460].map((px, i) => (
        <rect key={i} x={px - 16} y={0} width={32} height={270} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      ))}
      {/* アーチ窓 (洋) と格子窓 (和) の混在 */}
      {[-380, -310].map((wx, i) => (
        <path key={i} d={`M ${wx} 150 L ${wx} 70 Q ${wx + 22} 40 ${wx + 44} 70 L ${wx + 44} 150 Z`} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
      ))}
      {[300, 380].map((wx, i) => (
        <g key={i}>
          <rect x={wx} y={76} width={56} height={74} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
          {[1, 2, 3].map((k) => (
            <line key={k} x1={wx + k * 14} y1={76} x2={wx + k * 14} y2={150} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
      ))}
      {/* 駅名看板 (右から読み風に中央) */}
      <rect x={-170} y={34} width={340} height={64} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.ink}>{sign}</text>
      {/* 入口 */}
      <rect x={-90} y={130} width={180} height={140} fill={KRP.ink} opacity={0.45} />
    </g>
    {/* ホームと線路 */}
    <rect x={-20} y={H - 190} width={W + 40} height={80} fill={TKP.stone} opacity={0.9} />
    <line x1={-20} y1={H - 190} x2={W + 20} y2={H - 190} stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
    <rect x={-20} y={H - 90} width={W + 40} height={110} fill={KRP.floor} opacity={0.8} />
    {Array.from({ length: 13 }, (_, i) => (
      <rect key={i} x={-10 + i * 156} y={H - 72} width={64} height={16} rx={4} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={3.5} opacity={0.85} />
    ))}
    <line x1={-20} y1={H - 52} x2={W + 20} y2={H - 52} stroke={TKP.iron} strokeWidth={9} />
    <line x1={-20} y1={H - 30} x2={W + 20} y2={H - 30} stroke={TKP.iron} strokeWidth={9} />
  </g>
);

// 駅売り子 (首から下げた販売箱)。Person着せ替え方式
export const EkiUriko: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number]; goods?: "bento" | "kashi";
}> = ({ x, y, s = 1, f, phase = 0, face = "smile", gaze, goods = "bento" }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} gaze={gaze} hair="cap" cloth={TKP.noren} clothDark="#3A5680" tasuki={goods === "bento" ? "べんとう" : "おかし"} />
      <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
        <g transform={`translate(0 ${bob})`}>
          {/* 首かけ紐 */}
          <path d="M -34 -168 L -62 -84 M 34 -168 L 62 -84" fill="none" stroke={KRP.ink} strokeWidth={5} />
          {/* 販売箱 */}
          <rect x={-78} y={-88} width={156} height={54} rx={6} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
          <line x1={-78} y1={-66} x2={78} y2={-66} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          {/* 箱の中身 */}
          {goods === "bento" ? (
            [[-52, 0], [-6, 1], [40, 2]].map(([gx], i) => (
              <rect key={i} x={(gx as number)} y={-104} width={38} height={20} rx={4} fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={4} />
            ))
          ) : (
            [[-52, 0], [-6, 1], [40, 2]].map(([gx], i) => (
              <rect key={i} x={(gx as number)} y={-104} width={38} height={20} rx={4} fill={KRP.red} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
            ))
          )}
        </g>
      </g>
    </g>
  );
};

// 駅弁 (竹皮包み + 握り飯)
export const Ekiben: React.FC<{ x: number; y: number; s?: number; open?: boolean }> = ({ x, y, s = 1, open = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    {open ? (
      <g>
        {/* 開いた竹皮 + 握り飯2つ + たくあん */}
        <ellipse cx={0} cy={10} rx={130} ry={58} fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -130 6 Q -150 -10 -140 -30 M 130 6 Q 150 -10 140 -30" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {[[-44, 0], [20, 0]].map(([ox], i) => (
          <g key={i} transform={`translate(${ox} -14)`}>
            <path d="M -30 18 L 0 -30 L 30 18 Q 0 30 -30 18 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-10} y={0} width={20} height={18} fill={KRP.ink} opacity={0.8} />
          </g>
        ))}
        <ellipse cx={78} cy={8} rx={16} ry={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={96} cy={14} rx={16} ry={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ) : (
      <g>
        {/* 竹皮包み (ひもで十字縛り) */}
        <path d="M -110 -34 Q 0 -62 110 -34 Q 122 0 110 34 Q 0 62 -110 34 Q -122 0 -110 -34 Z"
          fill={TKP.roadTan} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -110 -34 Q 0 -8 110 -34 M -110 34 Q 0 10 110 34" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        <line x1={0} y1={-52} x2={0} y2={52} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-116} y1={0} x2={116} y2={0} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={9} fill="none" stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    )}
  </g>
);

// =====================================================================
// キット⑧ 戦後〜現代日本 (序・9〜10章・結: 空港・売り場・個包装)
// =====================================================================

// 背景: 空港ロビー (大きな窓 + 外にジェット機)
export const GendaiBg: React.FC<{ f: number; plane?: boolean }> = ({ f, plane = true }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={TKP.airport} opacity={0.5} />
    {/* 大きなガラス窓 */}
    <rect x={120} y={110} width={W - 240} height={540} rx={14} fill={KRP.blueSoft} opacity={0.6} stroke={KRP.ink} strokeWidth={6} filter="url(#wobbleSoft)" />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={120 + (i + 1) * ((W - 240) / 5)} y1={110} x2={120 + (i + 1) * ((W - 240) / 5)} y2={650} stroke={KRP.ink} strokeWidth={4.5} opacity={0.55} />
    ))}
    {/* 窓の外: 滑走路とジェット機 */}
    <line x1={140} y1={560} x2={W - 140} y2={560} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
    {plane && (
      <g transform={`translate(${720 + Math.sin(f / 40) * 6} 440) scale(0.85)`} filter="url(#wobble)">
        <path d="M -190 0 Q -190 -42 -120 -46 L 150 -46 Q 215 -40 230 -10 Q 215 8 150 10 L -120 10 Q -190 8 -190 0 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 150 -46 Q 200 -42 230 -10 L 182 -12 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -30 -8 L -120 60 L -70 60 L 20 -2 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -150 -40 L -196 -96 L -164 -96 L -116 -44 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-100} y1={-28} x2={120} y2={-28} stroke={KRP.blueDeep} strokeWidth={6} opacity={0.8} />
        {[-70, -34, 2, 38, 74].map((wx, i) => (
          <circle key={i} cx={wx} cy={-14} r={5} fill={KRP.ink} opacity={0.6} />
        ))}
      </g>
    )}
    {/* 床 (明るいタイル) */}
    <rect x={-20} y={H - 280} width={W + 40} height={300} fill={KRP.white} opacity={0.75} />
    <line x1={-20} y1={H - 280} x2={W + 20} y2={H - 280} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <line key={i} x1={i * 384 - 120} y1={H - 280} x2={i * 384 + 60} y2={H + 20} stroke={KRP.ink} strokeWidth={2.5} opacity={0.14} />
    ))}
  </g>
);

// お土産売り場の棚 (箱がずらり)
export const MiyageShelf: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    {/* 棚本体 */}
    <rect x={-250} y={-340} width={500} height={340} rx={10} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={7} />
    <line x1={-250} y1={-230} x2={250} y2={-230} stroke={KRP.ink} strokeWidth={6} />
    <line x1={-250} y1={-120} x2={250} y2={-120} stroke={KRP.ink} strokeWidth={6} />
    {/* 棚の箱 (3段 × 色違い) */}
    {([
      [-216, -302, KRP.red], [-130, -302, KRP.yellow], [-44, -302, KRP.blueSoft], [42, -302, KRP.green], [128, -302, KRP.orange],
      [-216, -192, KRP.blueSoft], [-130, -192, KRP.orange], [-44, -192, KRP.red], [42, -192, KRP.yellow], [128, -192, KRP.green],
      [-216, -82, KRP.yellow], [-130, -82, KRP.green], [-44, -82, KRP.orange], [42, -82, KRP.blueSoft], [128, -82, KRP.red],
    ] as [number, number, string][]).map(([bx, by, c], i) => (
      <g key={i} transform={`translate(${bx} ${by})`}>
        <rect x={0} y={0} width={76} height={54} rx={5} fill={c} opacity={0.88} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={10} y={14} width={56} height={26} rx={4} fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
    {/* 値札ポップ */}
    <g transform="translate(196 -356)">
      <rect x={-54} y={-30} width={108} height={52} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.red}>名物</text>
    </g>
  </g>
);

// お菓子の化粧箱 (個包装が覗く)
export const KashiBox: React.FC<{ x: number; y: number; s?: number; open?: boolean; label?: string }> = ({ x, y, s = 1, open = false, label = "銘菓" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    {open ? (
      <g>
        {/* 開いた箱: 個包装が2列 */}
        <rect x={-130} y={-50} width={260} height={110} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -130 -50 L -150 -110 L 150 -110 L 130 -50" fill={KRP.yellow} opacity={0.9} stroke={KRP.ink} strokeWidth={5.5} />
        {[[-104, -28], [-48, -28], [8, -28], [64, -28], [-76, 8], [-20, 8], [36, 8], [92, 8]].map(([px, py], i) => (
          <g key={i} transform={`translate(${px} ${py})`}>
            <rect x={0} y={0} width={44} height={30} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 0 6 L -7 0 L 0 -4 M 44 6 L 51 0 L 44 -4" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          </g>
        ))}
      </g>
    ) : (
      <g>
        {/* 閉じた箱 + 包装紙 + 掛け紙 */}
        <rect x={-130} y={-62} width={260} height={124} rx={8} fill={KRP.yellow} opacity={0.92} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-36} y={-62} width={72} height={124} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>{label}</text>
        <line x1={-130} y1={-30} x2={-36} y2={-30} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
        <line x1={36} y1={-30} x2={130} y2={-30} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      </g>
    )}
  </g>
);

// 脱酸素剤の小袋 (エージレス役・10章のからくり図解の主役)
export const DatsusansoPack: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`} filter="url(#wobble)">
    <rect x={-70} y={-46} width={140} height={92} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
    {/* 圧着のギザギザ縁 */}
    {[-46, 38].map((ey, i) => (
      <path key={i} d={`M -70 ${ey} l 10 4 l 10 -4 l 10 4 l 10 -4 l 10 4 l 10 -4 l 10 4 l 10 -4 l 10 4 l 10 -4 l 10 4 l 10 -4 l 10 4 l 10 -4`}
        fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
    ))}
    <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.ink}>だっさんそざい</text>
    <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={15} fill={KRP.red}>たべられません</text>
  </g>
);

// 現代の旅行者 (キャリーケースを引く)。Person着せ替え方式
export const ModernTraveler: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number]; caseColor?: string;
}> = ({ x, y, s = 1, f, phase = 0, face = "normal", gaze, caseColor = KRP.orange }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} gaze={gaze} hair="cap" cloth={KRP.green} clothDark="#639A5F" />
      <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
        {/* キャリーケース (本体は地面基準で固定、ハンドルだけ手に合わせ微動) */}
        <g transform="translate(120 0)">
          {/* 伸ばしたハンドル (ケース上面から斜めに手元へ) */}
          <line x1={10} y1={-150} x2={-58} y2={-96 + bob} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={-70} y1={-108 + bob} x2={-46} y2={-84 + bob} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          <rect x={-20} y={-150} width={96} height={140} rx={14} fill={caseColor} stroke={KRP.ink} strokeWidth={6} />
          <line x1={8} y1={-150} x2={8} y2={-10} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          <line x1={48} y1={-150} x2={48} y2={-10} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          <circle cx={-2} cy={-2} r={10} fill={KRP.ink} />
          <circle cx={58} cy={-2} r={10} fill={KRP.ink} />
          {/* ステッカー */}
          <circle cx={30} cy={-108} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      </g>
    </g>
  );
};

// 紙袋 (お土産の手提げ)
export const PaperBag: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = KRP.red }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    <path d="M -58 -70 L 58 -70 L 66 70 L -66 70 Z" fill={color} opacity={0.85} stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M -28 -70 Q -28 -108 0 -108 Q 28 -108 28 -70" fill="none" stroke={KRP.ink} strokeWidth={6} />
    <rect x={-34} y={-30} width={68} height={44} rx={6} fill={KRP.white} opacity={0.9} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// =====================================================================
// プレビュー合成: 8キットを150フレームずつ巡回 (確認用)
// npx remotion still TabiKits out.png --frame=N (N = キット番号×150 + 75)
// =====================================================================

export const TABIKITS_PREVIEW_FRAMES = 8 * 150;

const KitLabel: React.FC<{ text: string }> = ({ text }) => (
  <g>
    <rect x={40} y={H - 104} width={text.length * 33 + 60} height={66} rx={14} fill={KRP.white} opacity={0.92} stroke={KRP.ink} strokeWidth={5} />
    <text x={66} y={H - 58} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>{text}</text>
  </g>
);

export const TabiKitsPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const kit = Math.min(7, Math.floor(frame / 150));
  const f = frame % 150;

  return (
    <AbsoluteFill style={{ backgroundColor: KRP.paper }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs />

        {kit === 0 && (
          <g>
            <RomaBg f={f} />
            <RomanTemple x={330} y={820} s={1.15} />
            <TogaPerson x={880} y={950} s={1} f={f} phase={0} face="smile" laurel />
            <TogaPerson x={1120} y={950} s={0.92} f={f} phase={3} face="normal" />
            <WineCup x={1030} y={760} s={1.1} />
            <KitLabel text="キット① 古代ローマ (1章 バイアエ)" />
          </g>
        )}

        {kit === 1 && (
          <g>
            {f < 75 ? (
              <g>
                <KumanoBg f={f} />
                <OjiShrine x={1430} y={870} s={1.1} />
                <HeianPilgrim x={620} y={950} s={1} f={f} phase={0} face="worried" />
                <HeianPilgrim x={840} y={960} s={0.9} f={f} phase={4} face="normal" />
                <KitLabel text="キット②a 熊野の巡礼路 (2章)" />
              </g>
            ) : (
              <g>
                <CaminoBg f={f} />
                <EuroPilgrim x={660} y={950} s={1} f={f} phase={0} />
                <EuroPilgrim x={880} y={960} s={0.92} f={f} phase={5} />
                <ScallopShell x={1360} y={620} s={1.4} metal />
                <BadgeMold x={1600} y={640} s={1.1} open={1} />
                <KitLabel text="キット②b サンティアゴ巡礼とバッジ (2章)" />
              </g>
            )}
          </g>
        )}

        {kit === 2 && (
          <g>
            <KaidoBg f={f} fuji />
            <MatsuTree x={180} y={880} s={1.1} />
            <MatsuTree x={1760} y={860} s={0.95} flip />
            <Shukuba x={420} y={900} s={0.95} sign="旅籠" />
            <ShinmeiTorii x={1540} y={900} s={1.05} />
            <EdoTraveler x={880} y={960} s={1} f={f} phase={0} />
            <OnshiPerson x={1140} y={960} s={0.95} f={f} phase={3} />
            <OfudaTag x={1300} y={700} s={1} />
            <TegataCard x={760} y={660} s={0.9} rot={-6} />
            <KouChoubou x={1060} y={560} s={0.8} />
            <SenbetsuPack x={620} y={540} s={0.85} />
            <KitLabel text="キット③ 江戸の街道・伊勢 (3〜4章)" />
          </g>
        )}

        {kit === 3 && (
          <g>
            <EuroBg18c f={f} />
            <Carriage x={430} y={930} s={1} f={f} />
            <NobleSon x={1120} y={950} s={1} f={f} phase={0} face="smile" />
            <FramedPainting x={1520} y={640} s={1} />
            <PrintSheet x={1740} y={840} s={0.8} rot={6} />
            <KitLabel text="キット④ 18世紀欧州 グランドツアー (5章)" />
          </g>
        )}

        {kit === 4 && (
          <g>
            <OnsenBg f={f} />
            <YuYado x={1430} y={900} s={0.95} />
            <Rotenburo x={520} y={880} s={1} f={f} />
            <YukataPerson x={940} y={950} s={1} f={f} phase={0} face="smile" />
            <OnsenBanzuke x={1100} y={560} s={0.9} />
            <YoujinshuBook x={790} y={560} s={0.8} rot={-5} />
            <KitLabel text="キット⑤ 江戸の湯治場 (6章)" />
          </g>
        )}

        {kit === 5 && (
          <g>
            <BritStationBg f={f} />
            <SteamLoco x={560} y={880} s={1.05} f={f} run />
            <VictorianGent x={1120} y={945} s={1} f={f} phase={0} />
            <TimetableSheet x={1430} y={700} s={0.95} />
            <StationClock x={1680} y={560} s={0.9} f={f} />
            <ShillingCoin x={1660} y={800} s={1} />
            <KitLabel text="キット⑥ 19世紀英国の鉄道 (7〜8章)" />
          </g>
        )}

        {kit === 6 && (
          <g>
            <MeijiStationBg f={f} sign="うつのみや" />
            <EkiUriko x={760} y={945} s={1} f={f} phase={0} goods="bento" />
            <EkiUriko x={1240} y={950} s={0.95} f={f} phase={4} goods="kashi" />
            <Ekiben x={1620} y={820} s={0.9} />
            <Ekiben x={1620} y={640} s={0.8} open />
            <KitLabel text="キット⑦ 明治日本の鉄道 (8章 駅弁)" />
          </g>
        )}

        {kit === 7 && (
          <g>
            <GendaiBg f={f} plane />
            <MiyageShelf x={1480} y={960} s={1} />
            <ModernTraveler x={620} y={950} s={1} f={f} phase={0} face="normal" />
            <KashiBox x={950} y={640} s={0.95} open />
            <DatsusansoPack x={950} y={430} s={0.9} rot={-4} />
            <PaperBag x={360} y={760} s={0.95} />
            <KitLabel text="キット⑧ 戦後〜現代 (序・9〜10章・結)" />
          </g>
        )}

        <Atmosphere f={frame} />
      </svg>
    </AbsoluteFill>
  );
};
