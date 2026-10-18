// のぞき見くんと絵の具のマジック回 (暗号/鍵交換) の専用シーン。
// この回の核は「絵の具の色」。黒地に絵の具の6色 (PC) が映えること、
// 混ざり色の整合 (オレンジ=黄+赤 / 緑=黄+青 / 茶=黄+赤+青) に見えることが最優先。
// 和紙モードは使わない (色反転フィルタが絵の具の色を狂わせるため、全編黒地)。
//
// 持続レイアウト「交換ボード」: あなた(左)・バケツリレーのレーン(中央)・お店(右)・
// のぞき見くん(中央下) の配置を固定し、ステージごとに motif を分けて同じボードが育つ。

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../types";
import {
  SP,
  SUURI_FONT,
  W,
  H,
  Frame,
  DiagramTitle,
  SmallLabel,
  appearAt,
} from "./parts";

type SceneProps = { scene?: Scene; variant?: number };

// ===== 絵の具の配色 (この回の主役。彩度ひかえめで上品に) =====
export const PC = {
  yellow: "#E2C44A", // スタートの黄 (公開してよい色)
  red: "#D6483B", // あなたのひみつの赤 (絵の具シーンでは強調赤を兼ねる)
  blue: "#4A7FC9", // お店のひみつの青
  orange: "#DE8A3C", // 黄+赤 (あなたが送る色)
  green: "#5FA86A", // 黄+青 (お店が送る色)
  brown: "#8A5A3B", // ひみつの茶色 (完成した鍵)
  fakeBrown: "#9A6B35", // 黄が2倍入ったニセ茶 (のぞき見くんの作戦2)
  // ===== v2で追加した脇役の色 (主役の絵の具を食わない控えめトーン) =====
  wood: "#8A6A47", // 机・木箱
  sky: "#7FA8D9", // 窓の空
  paper: "#EDE4CC", // 手紙・封筒
  gold: "#D9A441", // 鍵・錠前
} as const;

// 背景分類 (全編黒地)。SuuriScenes の computeSuuriWashi から参照する
export const NOZOKI_DARK_MOTIFS = [
  "nozoki_ex_declare",
  "nozoki_ex_pocket",
  "nozoki_ex_orange",
  "nozoki_ex_green",
  "nozoki_ex_mix_you",
  "nozoki_ex_mix_shop",
  "nozoki_ex_brown",
  "nozoki_ex_recap",
  "nozoki_no_unmix",
] as const;

// なめらかな移動 (ゆっくり出て、ゆっくり着く)
export const easeInOut = (t: number) => t * t * (3 - 2 * t);
export const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

// ===== 絵の具の部品 =====

// 絵の具チップ (丸角の色見本。塗りは必ず面で塗る)
export const PaintChip: React.FC<{
  x: number;
  y: number;
  color: string;
  scale?: number;
  opacity?: number;
  glow?: boolean; // 完成の茶色だけ白いグロー
}> = ({ x, y, color, scale = 1, opacity = 1, glow = false }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    {glow && (
      <g stroke={SP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.9}>
        {[-150, -110, -70, -30, 30, 70, 110, 150].map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={Math.cos(rad) * 52}
              y1={Math.sin(rad) * 52}
              x2={Math.cos(rad) * 74}
              y2={Math.sin(rad) * 74}
            />
          );
        })}
      </g>
    )}
    <rect x={-30} y={-30} width={60} height={60} rx={14} fill={color} stroke={SP.line} strokeWidth={4} />
    {/* 絵の具のツヤ (左上のハイライト) */}
    <path d="M -16 -14 Q -14 -20 -6 -18" fill="none" stroke={SP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
  </g>
);

// 混ぜるうつわ (中で2色がぐるぐる回って、1色に混ざる)
// mix: 0=混ざる前 → 1=完成。フレームを渡すと回転が進む
export const MixBowl: React.FC<{
  x: number;
  y: number;
  scale?: number;
  colorA: string;
  colorB: string;
  result: string;
  mix: number;
  frame: number;
  opacity?: number;
}> = ({ x, y, scale = 1, colorA, colorB, result, mix, frame, opacity = 1 }) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = 1 - clamp01(mix / 0.7); // ぐるぐるの半径 (混ざるほど中心へ)
  const r = 34 * orbit;
  const ang = frame / 5;
  const ax = Math.cos(ang) * r;
  const ay = Math.sin(ang) * r * 0.45;
  const resA = clamp01((mix - 0.55) / 0.45); // 混ざった色の浮かび上がり
  const done = resA > 0.92;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <defs>
        <clipPath id={`bowl${id}`}>
          <ellipse cx={0} cy={-6} rx={64} ry={19} />
        </clipPath>
      </defs>
      {/* うつわの胴 */}
      <path d="M -70 -6 Q -66 54 0 54 Q 66 54 70 -6" fill={SP.panel} stroke={SP.line} strokeWidth={5} />
      {/* うつわの口 */}
      <ellipse cx={0} cy={-6} rx={70} ry={22} fill={SP.background} stroke={SP.line} strokeWidth={5} />
      {/* 中の絵の具 */}
      <g clipPath={`url(#bowl${id})`}>
        {/* 混ざったあとの色 (面で塗る) */}
        <ellipse cx={0} cy={-4} rx={62} ry={17} fill={result} opacity={resA} />
        {/* 混ざる前の2色 (ぐるぐる) */}
        <g opacity={1 - resA}>
          <circle cx={ax} cy={-5 + ay} r={24} fill={colorA} />
          <circle cx={-ax} cy={-5 - ay} r={24} fill={colorB} />
          {/* うずの筋 */}
          <path
            d={`M ${ax * 0.5} ${-5 + ay * 0.5} Q 0 ${-18} ${-ax * 0.5} ${-5 - ay * 0.5}`}
            fill="none"
            stroke={SP.ink}
            strokeWidth={3}
            opacity={0.35}
          />
        </g>
      </g>
      {/* かきまぜ棒 (混ざりきるまで) */}
      {resA < 0.95 && (
        <line
          x1={ax * 0.8}
          y1={-5 + ay * 0.8}
          x2={ax * 0.8 + 34}
          y2={-64}
          stroke={SP.line}
          strokeWidth={6}
          strokeLinecap="round"
        />
      )}
      {/* 完成のキラン */}
      {done && (
        <g stroke={SP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.85}>
          <line x1={-86} y1={-36} x2={-72} y2={-24} />
          <line x1={86} y1={-36} x2={72} y2={-24} />
          <line x1={0} y1={-46} x2={0} y2={-30} />
        </g>
      )}
    </g>
  );
};

// 絵の具チューブ (ラベルに色の面)
export const PaintTube: React.FC<{
  x: number;
  y: number;
  color: string;
  scale?: number;
  rotate?: number;
  opacity?: number;
}> = ({ x, y, color, scale = 1, rotate = 0, opacity = 1 }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
    {/* キャップ */}
    <rect x={-12} y={-66} width={24} height={18} rx={4} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    {/* 肩 */}
    <path d="M -22 -48 L 22 -48 L 30 -30 L -30 -30 Z" fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    {/* 胴 (色の面で塗る) */}
    <rect x={-30} y={-30} width={60} height={88} rx={10} fill={color} stroke={SP.line} strokeWidth={4} />
    {/* おしりの折り目 */}
    <line x1={-30} y1={48} x2={30} y2={48} stroke={SP.line} strokeWidth={5} />
    <line x1={-24} y1={56} x2={24} y2={56} stroke={SP.line} strokeWidth={4} />
  </g>
);

// ===== マスコット =====

// あなた (左)。胸に四角いポケット (ひみつの色チップが入る)
export const YouFigure: React.FC<{
  x: number;
  y: number; // 頭の中心
  scale?: number;
  pocketColor?: string; // ポケットの中のひみつの色
  pocketPulse?: number; // ポケットを光らせる (0〜1)
}> = ({ x, y, scale = 1, pocketColor, pocketPulse = 0 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <circle r={16} fill="none" stroke={SP.line} strokeWidth={5} />
    <path
      d="M -30 80 q 2 -44 30 -46 q 28 2 30 46 Z"
      fill={SP.background}
      stroke={SP.line}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    {/* 胸ポケット (いつも同じ位置 = 連続性) */}
    <rect x={-2} y={48} width={26} height={24} rx={5} fill={SP.background} stroke={SP.line} strokeWidth={4} />
    {pocketColor && (
      <rect x={2} y={52} width={18} height={16} rx={4} fill={pocketColor} />
    )}
    {pocketPulse > 0 && (
      <rect
        x={-8}
        y={42}
        width={38}
        height={36}
        rx={8}
        fill="none"
        stroke={pocketColor ?? SP.ink}
        strokeWidth={4}
        opacity={pocketPulse}
      />
    )}
  </g>
);

// お店 (右)。エプロン+頭上の小さな看板
export const ShopFigure: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pocketColor?: string;
  pocketPulse?: number;
  sign?: boolean;
}> = ({ x, y, scale = 1, pocketColor, pocketPulse = 0, sign = true }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {sign && (
      <g>
        <line x1={-26} y1={-74} x2={-18} y2={-38} stroke={SP.faint} strokeWidth={3} />
        <line x1={26} y1={-74} x2={18} y2={-38} stroke={SP.faint} strokeWidth={3} />
        <rect x={-44} y={-104} width={88} height={34} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={3.5} />
        <text x={0} y={-79} textAnchor="middle" fill={SP.ink} fontSize={22} fontWeight={700} fontFamily={SUURI_FONT}>
          お店
        </text>
      </g>
    )}
    <circle r={16} fill="none" stroke={SP.line} strokeWidth={5} />
    <path
      d="M -30 80 q 2 -44 30 -46 q 28 2 30 46 Z"
      fill={SP.background}
      stroke={SP.line}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    {/* エプロン (首ひも+前かけ) */}
    <path d="M -10 40 L 0 34 L 10 40" fill="none" stroke={SP.line} strokeWidth={3.5} />
    <path d="M -16 44 L 16 44 L 13 78 L -13 78 Z" fill={SP.panel} stroke={SP.line} strokeWidth={3.5} />
    {/* エプロンのポケット (ひみつの青が入る) */}
    <rect x={-10} y={54} width={20} height={16} rx={4} fill={SP.background} stroke={SP.line} strokeWidth={3} />
    {pocketColor && <rect x={-7} y={57} width={14} height={11} rx={3} fill={pocketColor} />}
    {pocketPulse > 0 && (
      <rect x={-15} y={49} width={30} height={26} rx={6} fill="none" stroke={pocketColor ?? SP.ink} strokeWidth={4} opacity={pocketPulse} />
    )}
  </g>
);

// のぞき見くん (ほっかむり+大きな丸い目。憎めないコソ泥)
export type NozokiPose =
  | "binocular" // 双眼鏡でのぞく
  | "listen" // 聞き耳
  | "memo" // メモ帳にガリガリ
  | "arms" // 腕組み
  | "gakkuri" // ガックリ
  | "idea" // ひらめき電球
  | "puzzled"; // ? (茶色が作れない)
export const NozokiKun: React.FC<{
  x: number;
  y: number; // 頭の中心
  scale?: number;
  pose?: NozokiPose;
  frame?: number;
  opacity?: number;
  hoodColor?: string; // ほっかむりの色 (v2から泥棒の唐草イメージで緑が標準)
}> = ({ x, y, scale = 1, pose = "binocular", frame = 0, opacity = 1, hoodColor = PC.green }) => {
  const droop = pose === "gakkuri" ? 14 : 0; // ガックリはうなだれる
  return (
    <g transform={`translate(${x}, ${y + droop}) scale(${scale})`} opacity={opacity}>
      {/* 肩 */}
      <path
        d="M -34 86 q 2 -48 34 -50 q 32 2 34 50 Z"
        fill={SP.background}
        stroke={SP.line}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* 頭 */}
      <circle r={22} fill={SP.background} stroke={SP.line} strokeWidth={5} />
      {/* ほっかむり (頭の上半分をおおう布+てっぺんの結び目) */}
      <path
        d="M -24 -2 Q -26 -30 0 -30 Q 26 -30 24 -2 Q 12 -14 0 -14 Q -12 -14 -24 -2 Z"
        fill={hoodColor}
        stroke={SP.line}
        strokeWidth={3}
      />
      <path d="M -8 -30 Q -16 -44 -4 -42" fill="none" stroke={hoodColor} strokeWidth={6} strokeLinecap="round" />
      <path d="M 8 -30 Q 16 -44 4 -42" fill="none" stroke={hoodColor} strokeWidth={6} strokeLinecap="round" />
      {/* 大きな丸い目 (上目づかい) */}
      {pose !== "binocular" && (
        <g>
          <circle cx={-9} cy={0} r={8} fill={SP.ink} />
          <circle cx={9} cy={0} r={8} fill={SP.ink} />
          <circle cx={-9} cy={pose === "gakkuri" ? 3 : -3} r={3.5} fill={SP.background} />
          <circle cx={9} cy={pose === "gakkuri" ? 3 : -3} r={3.5} fill={SP.background} />
        </g>
      )}
      {/* ポーズ */}
      {pose === "binocular" && (
        <g>
          {/* 双眼鏡 (上に向けてのぞく) */}
          <g transform="translate(0, -4) rotate(-12)">
            <circle cx={-11} cy={0} r={11} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <circle cx={11} cy={0} r={11} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <rect x={-5} y={-4} width={10} height={8} fill={SP.panel} stroke={SP.line} strokeWidth={3} />
            <circle cx={-11} cy={0} r={4.5} fill={SP.ink} />
            <circle cx={11} cy={0} r={4.5} fill={SP.ink} />
          </g>
          {/* 視線 (点線で上へ) */}
          <g stroke={SP.faint} strokeWidth={3} strokeDasharray="7 9" opacity={0.8}>
            <line x1={-16} y1={-16} x2={-66} y2={-72} />
            <line x1={16} y1={-16} x2={66} y2={-72} />
          </g>
        </g>
      )}
      {pose === "listen" && (
        <g>
          {/* 耳に手 */}
          <path d="M 24 2 q 14 -4 14 10 q 0 10 -12 8" fill="none" stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
          <path d="M -24 2 q -14 -4 -14 10 q 0 10 12 8" fill="none" stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
        </g>
      )}
      {pose === "memo" && (
        <g>
          {/* メモ帳+ペン (ガリガリ動く) */}
          <g transform={`translate(30, 40) rotate(${Math.sin(frame / 2.2) * 7})`}>
            <rect x={-6} y={-28} width={40} height={52} rx={5} fill={SP.ink} stroke={SP.line} strokeWidth={3} transform="rotate(8)" />
            <g stroke={SP.background} strokeWidth={3} transform="rotate(8)">
              <line x1={0} y1={-16} x2={28} y2={-16} />
              <line x1={0} y1={-6} x2={28} y2={-6} />
              <line x1={0} y1={4} x2={20} y2={4} />
            </g>
            <line x1={34} y1={-20} x2={48} y2={-38} stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
      )}
      {pose === "arms" && (
        <g stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d="M -28 56 q 28 -14 56 2" />
          <path d="M 28 48 q -28 16 -56 2" />
        </g>
      )}
      {pose === "gakkuri" && (
        <g stroke={SP.faint} strokeWidth={4} strokeLinecap="round">
          {/* ショックの縦線 */}
          <line x1={-14} y1={-58} x2={-14} y2={-40} />
          <line x1={0} y1={-64} x2={0} y2={-44} />
          <line x1={14} y1={-58} x2={14} y2={-40} />
        </g>
      )}
      {pose === "idea" && (
        <g transform="translate(0, -72)">
          <circle cx={0} cy={0} r={16} fill={PC.yellow} stroke={SP.line} strokeWidth={4} />
          <rect x={-7} y={14} width={14} height={8} rx={3} fill={SP.panel} stroke={SP.line} strokeWidth={3} />
          <g stroke={PC.yellow} strokeWidth={4} strokeLinecap="round">
            <line x1={-26} y1={-14} x2={-36} y2={-22} />
            <line x1={26} y1={-14} x2={36} y2={-22} />
            <line x1={0} y1={-24} x2={0} y2={-36} />
          </g>
        </g>
      )}
      {pose === "puzzled" && (
        <text x={34} y={-40} fontSize={44} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
          ?
        </text>
      )}
    </g>
  );
};

// ===== 交換ボード (持続レイアウト) =====
// 固定配置: あなた x=300 / レーン 500〜1420 / お店 x=1620 / のぞき見くん 中央下

const EX = {
  youX: 300,
  shopX: 1620,
  headY: 400,
  figScale: 2.1,
  laneY: 560, // レーン上面
  laneX0: 490,
  laneX1: 1430,
  chipY: 524, // レーンに乗るチップの中心
  youSpotX: 560, // あなたの前 (レーン左端)
  shopSpotX: 1360, // お店の前 (レーン右端)
  nozokiX: 960,
  nozokiY: 705, // 体の下端が 2行字幕 (上端 y≒855) に入らないように
  nozokiScale: 1.3,
} as const;

// バケツリレーのレーン (流れる目盛りつき)
const RelayLane: React.FC<{ frame: number; dim?: boolean }> = ({ frame, dim = false }) => {
  const speed = 0.9;
  const offset = (((frame * speed) % 90) + 90) % 90;
  const ticks: number[] = [];
  for (let x = EX.laneX0 - 90 + offset; x < EX.laneX1 + 90; x += 90) ticks.push(x);
  const main = dim ? SP.dim : SP.line;
  return (
    <g opacity={dim ? 0.7 : 1}>
      <line x1={EX.laneX0} y1={EX.laneY} x2={EX.laneX1} y2={EX.laneY} stroke={main} strokeWidth={4} />
      <line x1={EX.laneX0} y1={EX.laneY + 52} x2={EX.laneX1} y2={EX.laneY + 52} stroke={SP.dim} strokeWidth={4} />
      {ticks.map((x, i) =>
        x > EX.laneX0 - 10 && x < EX.laneX1 + 10 ? (
          <line key={i} x1={x} y1={EX.laneY + 8} x2={x - 22} y2={EX.laneY + 44} stroke={SP.dim} strokeWidth={3} />
        ) : null,
      )}
    </g>
  );
};

// 交換ボードの土台 (人物・レーン・のぞき見くん・名前ラベル)
const ExchangeBoard: React.FC<{
  frame: number;
  youPocket?: string;
  shopPocket?: string;
  youPulse?: number;
  shopPulse?: number;
  nozokiPose?: NozokiPose;
  laneDim?: boolean;
  children?: React.ReactNode;
}> = ({ frame, youPocket, shopPocket, youPulse = 0, shopPulse = 0, nozokiPose = "binocular", laneDim, children }) => (
  <g>
    <RelayLane frame={frame} dim={laneDim} />
    <YouFigure x={EX.youX} y={EX.headY} scale={EX.figScale} pocketColor={youPocket} pocketPulse={youPulse} />
    <ShopFigure x={EX.shopX} y={EX.headY} scale={EX.figScale} pocketColor={shopPocket} pocketPulse={shopPulse} />
    <SmallLabel x={EX.youX} y={628} text="あなた" color={SP.ink} size={34} weight={700} />
    {/* お店は頭上の看板が名前を兼ねる (二重表記を避ける) */}
    <NozokiKun x={EX.nozokiX} y={EX.nozokiY} scale={EX.nozokiScale} pose={nozokiPose} frame={frame} />
    <SmallLabel x={EX.nozokiX + 205} y={EX.nozokiY + 60} text="のぞき見くん" color={SP.faint} size={28} weight={700} />
    {children}
  </g>
);

// レーンを渡るチップ (進行 t: 0=出発 1=到着。トコトコ揺れながら進む)
const TravelChip: React.FC<{
  from: number;
  to: number;
  t: number;
  color: string;
  frame: number;
}> = ({ from, to, t, color, frame }) => {
  const tt = easeInOut(clamp01(t));
  const x = from + (to - from) * tt;
  const moving = tt > 0.02 && tt < 0.98;
  const bob = moving ? Math.sin(frame / 3.5) * 4 : 0;
  const dir = Math.sign(to - from);
  return (
    <g>
      {moving && (
        <g stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.55}>
          <line x1={x - dir * 48} y1={EX.chipY - 10} x2={x - dir * 76} y2={EX.chipY - 10} />
          <line x1={x - dir * 44} y1={EX.chipY + 12} x2={x - dir * 66} y2={EX.chipY + 12} />
        </g>
      )}
      <PaintChip x={x} y={EX.chipY + bob} color={color} />
    </g>
  );
};

// メガホン (宣言)
export const Megaphone: React.FC<{ x: number; y: number; flip?: boolean; wave?: number }> = ({ x, y, flip = false, wave = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${flip ? -1 : 1}, 1)`}>
    <path d="M 0 -16 L 44 -34 L 44 34 L 0 16 Z" fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    <rect x={-16} y={-16} width={16} height={32} rx={5} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    {/* 音の波 */}
    <g stroke={SP.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={wave}>
      <path d="M 56 -22 q 14 22 0 44" />
      <path d="M 74 -34 q 22 34 0 68" />
    </g>
  </g>
);

// ふきだし (上端 y>=160 を守って置くこと)
export const Bubble: React.FC<{
  x: number; // 中心
  y: number; // 上端
  w: number;
  h: number;
  tailTo: [number, number];
  opacity?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, tailTo, opacity = 1, children }) => (
  <g opacity={opacity}>
    <path
      d={`M ${x - 20} ${y + h} L ${tailTo[0]} ${tailTo[1]} L ${x + 16} ${y + h} Z`}
      fill={SP.panel}
      stroke={SP.line}
      strokeWidth={4}
    />
    <rect x={x - w / 2} y={y} width={w} height={h} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    <rect x={x - 20 + 2} y={y + h - 5} width={32} height={9} fill={SP.panel} />
    {children}
  </g>
);

// ===== 交換ボードの各ステージ =====

type ExStage =
  | "declare" // 行66-68: 黄色からスタート宣言
  | "pocket" // 行73-75: 赤をポケットへ
  | "orange" // 行76: 黄+赤→オレンジがレーンを渡る
  | "green" // 行77: 黄+青→緑が渡る
  | "mix_you" // 行81-83: あなたの最終混合
  | "mix_shop" // 行84-85: お店の最終混合
  | "brown" // 行90: 同じ茶色が完成 (グロー)
  | "recap"; // 行91-95: 総集編 (赤と青は一度も旅していない)

export const ExchangeScene: React.FC<SceneProps & { stage: ExStage }> = ({ scene, variant = 0, stage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durFrames = Math.max(((scene?.durationSec ?? 6) + 0.35) * fps, 1);
  const prog = clamp01(frame / durFrames); // シーン全体の進行
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 26);
  const a3 = appearAt(frame, fps, 44);

  // --- その1: 黄色からスタート宣言 (v0 宣言ポーズ / v1 黄チップがポン / v2 丸聞こえ) ---
  if (stage === "declare") {
    const v = variant % 3;
    const title = v === 2 ? "のぞき見くんにも、丸聞こえ" : "スタートの色を、宣言";
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? title} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <ExchangeBoard frame={frame} nozokiPose={v === 2 ? "listen" : "binocular"}>
            {/* ふたりがメガホンで宣言 */}
            <g opacity={a1}>
              <Megaphone x={EX.youX + 110} y={330} wave={0.5 + Math.sin(frame / 4) * 0.5} />
              <Megaphone x={EX.shopX - 110} y={330} flip wave={0.5 + Math.sin(frame / 4 + 2) * 0.5} />
            </g>
            {v >= 1 && (
              <g opacity={a1}>
                {/* ふきだし「黄色から スタート!」 */}
                <Bubble x={660} y={190} w={360} h={104} tailTo={[EX.youX + 150, 330]}>
                  <text x={620} y={238} textAnchor="middle" fill={SP.ink} fontSize={37} fontWeight={800} fontFamily={SUURI_FONT}>
                    黄色から
                  </text>
                  <text x={620} y={280} textAnchor="middle" fill={SP.ink} fontSize={37} fontWeight={800} fontFamily={SUURI_FONT}>
                    スタート!
                  </text>
                  <PaintChip x={792} y={242} color={PC.yellow} scale={0.9} />
                </Bubble>
                <Bubble x={1260} y={190} w={360} h={104} tailTo={[EX.shopX - 150, 330]}>
                  <text x={1220} y={238} textAnchor="middle" fill={SP.ink} fontSize={37} fontWeight={800} fontFamily={SUURI_FONT}>
                    黄色から
                  </text>
                  <text x={1220} y={280} textAnchor="middle" fill={SP.ink} fontSize={37} fontWeight={800} fontFamily={SUURI_FONT}>
                    スタート!
                  </text>
                  <PaintChip x={1392} y={242} color={PC.yellow} scale={0.9} />
                </Bubble>
                {/* 黄チップが両者の前にポン (ぽよんと着地) */}
                <g transform={`translate(${EX.youSpotX}, ${EX.chipY}) scale(${a2})`}>
                  <PaintChip x={0} y={0} color={PC.yellow} />
                </g>
                <g transform={`translate(${EX.shopSpotX}, ${EX.chipY}) scale(${a2})`}>
                  <PaintChip x={0} y={0} color={PC.yellow} />
                </g>
                <g opacity={a3}>
                  <SmallLabel x={EX.youSpotX} y={468} text="スタートの黄" color={SP.faint} size={27} />
                  <SmallLabel x={EX.shopSpotX} y={468} text="スタートの黄" color={SP.faint} size={27} />
                </g>
              </g>
            )}
            {v === 2 && (
              <g opacity={a2}>
                {/* 音の波がのぞき見くんに届く */}
                <g stroke={SP.faint} strokeWidth={4} fill="none" strokeLinecap="round">
                  <path d={`M 560 400 Q 760 560 ${EX.nozokiX - 80} ${EX.nozokiY - 40}`} strokeDasharray="4 16" />
                  <path d={`M 1360 400 Q 1160 560 ${EX.nozokiX + 80} ${EX.nozokiY - 40}`} strokeDasharray="4 16" />
                </g>
                <SmallLabel x={EX.nozokiX} y={EX.nozokiY - 110} text="きこえてます" color={SP.accent} size={30} weight={800} />
              </g>
            )}
          </ExchangeBoard>
        </svg>
      </Frame>
    );
  }

  // --- その2前半: ひみつの赤をポケットへ (v0 選ぶ / v1 赤に決定 / v2 絶対に送らない) ---
  if (stage === "pocket") {
    const v = variant % 3;
    // v0: 赤チップが弧を描いてポケットへ飛び込む
    const flyT = easeInOut(clamp01((frame - 20) / 34));
    const sx = 620;
    const sy = 300;
    const pxX = EX.youX + 22; // ポケットの位置 (scale 2.1 で +10*2.1)
    const pxY = EX.headY + 126;
    const fx = sx + (pxX - sx) * flyT;
    const fy = sy + (pxY - sy) * flyT - Math.sin(flyT * Math.PI) * 130;
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "ひみつの色は、ポケットへ"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <ExchangeBoard
            frame={frame}
            youPocket={v >= 1 || flyT > 0.95 ? PC.red : undefined}
            youPulse={v >= 1 ? 0.5 + Math.sin(frame / 6) * 0.3 : 0}
            nozokiPose="binocular"
          >
            {/* スタートの黄は置いたまま (連続性) */}
            <PaintChip x={EX.youSpotX} y={EX.chipY} color={PC.yellow} />
            <PaintChip x={EX.shopSpotX} y={EX.chipY} color={PC.yellow} />
            {v === 0 && (
              <g opacity={a1}>
                {/* 選べる色たち (選ばれなかった色は薄く) */}
                {[PC.red, PC.blue, PC.green, PC.orange].map((c, i) => (
                  <PaintChip
                    key={c}
                    x={620 + i * 110}
                    y={300}
                    color={c}
                    opacity={i === 0 ? 0 : 0.55 - flyT * 0.2}
                    scale={0.9}
                  />
                ))}
                <SmallLabel x={790} y={212} text="1色だけ、えらぶ" color={SP.ink} size={30} weight={700} />
                {/* 赤チップが飛んでポケットへ */}
                {flyT < 1 ? (
                  <PaintChip x={fx} y={fy} color={PC.red} scale={0.9 - flyT * 0.4} />
                ) : null}
              </g>
            )}
            {v === 1 && (
              <g opacity={a1}>
                {/* 「今日は、赤にしましょう」: 赤チップを大きく見せてからポケットに */}
                <PaintChip x={620} y={300} color={PC.red} scale={1.5 - a2 * 0.5} glow={false} />
                <g opacity={a2}>
                  <SmallLabel x={620} y={420} text="あなたのひみつ = 赤" color={SP.ink} size={32} weight={800} />
                </g>
              </g>
            )}
            {v === 2 && (
              <g opacity={a1}>
                {/* レーンに大きな× = 絶対に送らない */}
                <g opacity={a2} stroke={SP.accent} strokeWidth={14} strokeLinecap="round">
                  <line x1={910} y1={470} x2={1010} y2={570} />
                  <line x1={1010} y1={470} x2={910} y2={570} />
                </g>
                <g opacity={a3}>
                  <SmallLabel x={960} y={430} text="赤は、レーンに乗せない" color={SP.accent} size={32} weight={800} />
                </g>
              </g>
            )}
          </ExchangeBoard>
        </svg>
      </Frame>
    );
  }

  // --- その2後半: 混ぜてから送る (orange: あなた→お店 / green: お店→あなた) ---
  if (stage === "orange" || stage === "green") {
    const isOrange = stage === "orange";
    const mixerX = isOrange ? EX.youSpotX : EX.shopSpotX;
    const from = isOrange ? EX.youSpotX + 90 : EX.shopSpotX - 90;
    const to = isOrange ? EX.shopSpotX : EX.youSpotX;
    const secret = isOrange ? PC.red : PC.blue;
    const result = isOrange ? PC.orange : PC.green;
    // 前半 45% で混色、後半でレーンを渡る
    const mixT = clamp01(prog / 0.42);
    const sendT = clamp01((prog - 0.5) / 0.46);
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? (isOrange ? "混ぜてから、送る" : "お店も、同じやり方で")} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <ExchangeBoard
            frame={frame}
            youPocket={PC.red}
            shopPocket={isOrange ? undefined : PC.blue}
            nozokiPose="binocular"
          >
            {/* 混ぜるうつわ (黄+ひみつの色 → 送る色) */}
            <MixBowl
              x={mixerX}
              y={EX.chipY - 36}
              colorA={PC.yellow}
              colorB={secret}
              result={result}
              mix={mixT}
              frame={frame}
            />
            {/* 内訳タグ */}
            <g opacity={a2}>
              <PaintChip x={mixerX - 52} y={400} color={PC.yellow} scale={0.55} />
              <text x={mixerX} y={410} textAnchor="middle" fill={SP.ink} fontSize={34} fontWeight={800} fontFamily={SUURI_FONT}>
                +
              </text>
              <PaintChip x={mixerX + 52} y={400} color={secret} scale={0.55} />
            </g>
            {/* 混ざったらチップになってレーンを渡る */}
            {sendT > 0 && <TravelChip from={from} to={to} t={sendT} color={result} frame={frame} />}
            {/* 届いた側に着地ラベル */}
            {sendT > 0.96 && (
              <SmallLabel x={to} y={462} text="とうちゃく" color={SP.faint} size={26} />
            )}
          </ExchangeBoard>
        </svg>
      </Frame>
    );
  }

  // --- その3: 最終混合 (mix_you: 緑+赤 / mix_shop: オレンジ+青) ---
  if (stage === "mix_you" || stage === "mix_shop") {
    const isYou = stage === "mix_you";
    const v = variant % 3;
    const mixerX = isYou ? EX.youSpotX : EX.shopSpotX;
    const arrived = isYou ? PC.green : PC.orange; // 届いた色
    const secret = isYou ? PC.red : PC.blue; // ポケットのひみつ
    const inside: [string, string, string] = isYou
      ? [PC.yellow, PC.blue, PC.red] // 黄と青に、赤
      : [PC.yellow, PC.red, PC.blue]; // 黄と赤に、青
    const mixT = v === 0 ? 0 : clamp01((frame - 14) / (durFrames * 0.6));
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? (isYou ? "届いた緑に、ポケットの赤" : "届いたオレンジに、ポケットの青")} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <ExchangeBoard
            frame={frame}
            youPocket={PC.red}
            shopPocket={PC.blue}
            youPulse={isYou && v === 0 ? 0.5 + Math.sin(frame / 6) * 0.3 : 0}
            shopPulse={!isYou && v === 0 ? 0.5 + Math.sin(frame / 6) * 0.3 : 0}
            nozokiPose="binocular"
          >
            {v === 0 ? (
              // 仕上げの前: 届いたチップがうつわの横に待機
              <g opacity={a1}>
                <PaintChip x={mixerX - 70} y={EX.chipY} color={arrived} />
                <SmallLabel x={mixerX - 70} y={462} text="届いた色" color={SP.faint} size={26} />
                <MixBowl x={mixerX + 60} y={EX.chipY - 36} colorA={arrived} colorB={secret} result={PC.brown} mix={0} frame={frame} opacity={a1} />
              </g>
            ) : (
              <g>
                {/* ポケットのひみつを混ぜて茶色へ */}
                <MixBowl x={mixerX} y={EX.chipY - 36} colorA={arrived} colorB={secret} result={PC.brown} mix={mixT} frame={frame} />
                {/* 内訳タグ: 3色 (順番ちがい) */}
                <g opacity={a2}>
                  {inside.map((c, i) => (
                    <PaintChip key={i} x={mixerX - 76 + i * 76} y={396} color={c} scale={0.55} />
                  ))}
                  <text x={mixerX - 38} y={406} textAnchor="middle" fill={SP.ink} fontSize={30} fontWeight={800} fontFamily={SUURI_FONT}>
                    +
                  </text>
                  <text x={mixerX + 38} y={406} textAnchor="middle" fill={SP.ink} fontSize={30} fontWeight={800} fontFamily={SUURI_FONT}>
                    +
                  </text>
                </g>
              </g>
            )}
          </ExchangeBoard>
        </svg>
      </Frame>
    );
  }

  // --- 同じ茶色が完成 (グロー) ---
  if (stage === "brown") {
    const pulse = 1 + Math.sin(frame / 7) * 0.04;
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "ふたりだけの、同じ色"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <ExchangeBoard frame={frame} youPocket={PC.red} shopPocket={PC.blue} nozokiPose="puzzled" laneDim>
            <g opacity={a1} transform={`translate(${EX.youSpotX}, ${EX.chipY - 20}) scale(${pulse * 1.25})`}>
              <PaintChip x={0} y={0} color={PC.brown} glow />
            </g>
            <g opacity={a1} transform={`translate(${EX.shopSpotX}, ${EX.chipY - 20}) scale(${pulse * 1.25})`}>
              <PaintChip x={0} y={0} color={PC.brown} glow />
            </g>
            <g opacity={a2}>
              <text x={960} y={400} textAnchor="middle" fill={SP.ink} fontSize={96} fontWeight={800} fontFamily={SUURI_FONT}>
                =
              </text>
              <SmallLabel x={960} y={300} text="ひみつの茶色、完成" color={SP.ink} size={36} weight={800} />
            </g>
          </ExchangeBoard>
        </svg>
      </Frame>
    );
  }

  // --- 総集編: 赤と青は一度も旅していない ---
  // v0 (行86「今日いちばん大事なこと」) は、赤帯の核心バッジ+スポットライトで「ここが本日の核心」と一目で分かる見せ方にする
  const v = variant % 5;
  const ringPulse = 0.55 + Math.sin(frame / 6) * 0.35;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (v === 0 ? "ここが、本日の核心" : "ひみつは、一度も旅していない")} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <ExchangeBoard
          frame={frame}
          youPocket={PC.red}
          shopPocket={PC.blue}
          youPulse={v === 1 || v === 2 ? ringPulse : 0}
          shopPulse={v === 1 || v === 2 ? ringPulse : 0}
          nozokiPose={v >= 3 ? "gakkuri" : "arms"}
          laneDim={v === 0 || v === 1 || v === 2}
        >
          {/* レーンを通った色だけ点灯 (オレンジ・緑。黄は宣言で伝えただけでレーンは通っていない) */}
          <g opacity={v === 0 ? 0.35 : v === 1 || v === 2 ? 0.3 : 1}>
            <PaintChip x={860} y={EX.chipY} color={PC.orange} scale={0.85} />
            <PaintChip x={1060} y={EX.chipY} color={PC.green} scale={0.85} />
          </g>
          {v === 0 && (
            <g>
              {/* スポットライト (バッジの上から光が落ちる) */}
              <path
                d={`M 820 150 L 1100 150 L 1260 470 L 660 470 Z`}
                fill={SP.ink}
                opacity={0.06 + Math.sin(frame / 9) * 0.02}
              />
              {/* 赤帯の核心バッジ (ハンコ風にドン) */}
              <g transform={`translate(960, 300) rotate(-4) scale(${1.6 - Math.min(a1, 1) * 0.6})`} opacity={a1}>
                <rect x={-356} y={-76} width={712} height={152} rx={18} fill={SP.panel} stroke={SP.accent} strokeWidth={10} />
                <text
                  x={0}
                  y={24}
                  textAnchor="middle"
                  fill={SP.accent}
                  fontSize={62}
                  fontWeight={800}
                  fontFamily={SUURI_FONT}
                  letterSpacing={6}
                >
                  ここが、本日の核心
                </text>
              </g>
              {/* バッジまわりの集中線 */}
              <g stroke={SP.accent} strokeWidth={5} strokeLinecap="round" opacity={a2 * ringPulse}>
                <line x1={540} y1={214} x2={586} y2={242} />
                <line x1={1380} y1={214} x2={1334} y2={242} />
                <line x1={540} y1={386} x2={586} y2={358} />
                <line x1={1380} y1={386} x2={1334} y2={358} />
              </g>
            </g>
          )}
          {v === 3 && (
            <g opacity={a2}>
              <SmallLabel x={960} y={452} text="レーンを通ったのは、混ぜたあとの色だけ" color={SP.ink} size={30} weight={700} />
            </g>
          )}
          {(v === 1 || v === 2) && (
            <g opacity={a1}>
              {/* 赤と青がポケットから出ていないことを、ふわっと光る輪でなぞる */}
              <SmallLabel x={EX.youX} y={300} text="赤は ずっとここ" color={SP.accent} size={30} weight={800} />
              <SmallLabel x={EX.shopX} y={300} text="青も ずっとここ" color={PC.blue} size={30} weight={800} />
              <g stroke={SP.faint} strokeWidth={3} strokeDasharray="6 10">
                <line x1={EX.youX} y1={312} x2={EX.youX + 20} y2={EX.headY + 112} />
                <line x1={EX.shopX} y1={312} x2={EX.shopX} y2={EX.headY + 100} />
              </g>
            </g>
          )}
          {v === 4 && (
            <g opacity={a1}>
              <g transform={`translate(${EX.youSpotX}, ${EX.chipY - 90})`}>
                <PaintChip x={0} y={0} color={PC.brown} glow />
              </g>
              <g transform={`translate(${EX.shopSpotX}, ${EX.chipY - 90})`}>
                <PaintChip x={0} y={0} color={PC.brown} glow />
              </g>
              <g opacity={a2}>
                <SmallLabel x={960} y={330} text="なのに、同じ色" color={SP.ink} size={40} weight={800} />
              </g>
            </g>
          )}
        </ExchangeBoard>
      </svg>
    </Frame>
  );
};

// ===== 混ぜたら戻せない (行58-61。4段階で育つ) =====
// v0: 確認の前置き (チューブ3本+!) / v1: 混ぜる→戻せないの一方通行
// v2: オレンジを2色に分けて、は無理 (×) / v3: 「戻せない」が今日の主役

export const NoUnmixScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = variant % 4;
  const a1 = appearAt(frame, fps, 8);
  const a2 = appearAt(frame, fps, 28);
  const a3 = appearAt(frame, fps, 48);

  if (v === 0) {
    // 確認の前置き: 絵の具チューブ3本がならぶ
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "はじめる前に、ひとつだけ"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {[PC.yellow, PC.red, PC.blue].map((c, i) => (
            <g key={c} opacity={appearAt(frame, fps, 10 + i * 8)}>
              <PaintTube x={760 + i * 200} y={480} color={c} scale={1.5} rotate={(i - 1) * 6} />
            </g>
          ))}
          <g opacity={a3}>
            <circle cx={1340} cy={300} r={54} fill="none" stroke={SP.accent} strokeWidth={6} />
            <text x={1340} y={326} textAnchor="middle" fill={SP.accent} fontSize={72} fontWeight={800} fontFamily={SUURI_FONT}>
              !
            </text>
            <SmallLabel x={960} y={750} text="だいじな性質が、ひとつ" color={SP.ink} size={36} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }

  if (v === 1) {
    // 混ぜたら戻せない: 上段=混ぜるのは一瞬 (→) / 下段=戻すのは×
    const mixT = clamp01((frame - 16) / 44);
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "混ぜたら、戻せない"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {/* 上段: 黄+赤 → オレンジ (混色アニメ) */}
          <g opacity={a1}>
            <PaintChip x={560} y={370} color={PC.yellow} />
            <text x={660} y={384} textAnchor="middle" fill={SP.ink} fontSize={44} fontWeight={800} fontFamily={SUURI_FONT}>
              +
            </text>
            <PaintChip x={760} y={370} color={PC.red} />
            <g opacity={a2}>
              <path d="M 860 370 L 980 370" stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
              <path d="M 960 352 L 988 370 L 960 388" fill="none" stroke={SP.line} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <MixBowl x={1180} y={360} colorA={PC.yellow} colorB={PC.red} result={PC.orange} mix={mixT} frame={frame} />
            <SmallLabel x={1180} y={480} text="混ぜるのは、かんたん" color={SP.faint} size={28} />
          </g>
          {/* 下段: オレンジ → 元の2色 は × */}
          <g opacity={a3}>
            <PaintChip x={1180} y={640} color={PC.orange} />
            <g>
              <path d="M 1080 640 L 960 640" stroke={SP.dim} strokeWidth={6} strokeLinecap="round" />
              <path d="M 982 622 L 954 640 L 982 658" fill="none" stroke={SP.dim} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <PaintChip x={860} y={640} color={PC.yellow} opacity={0.5} />
            <PaintChip x={740} y={640} color={PC.red} opacity={0.5} />
            {/* 逆もどりの矢印に大きな× */}
            <g stroke={SP.accent} strokeWidth={12} strokeLinecap="round">
              <line x1={980} y1={596} x2={1064} y2={684} />
              <line x1={1064} y1={596} x2={980} y2={684} />
            </g>
            <SmallLabel x={960} y={770} text="戻すのは、できない" color={SP.accent} size={32} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }

  if (v === 2) {
    // オレンジを「元の2色に分けて」→ 無理
    const shake = Math.sin(frame / 2.5) * (a2 > 0.5 ? 3 : 0);
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "「元の2色に分けて」は、無理"} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {/* 大きなオレンジの絵の具だまり */}
          <g opacity={a1} transform={`translate(${680 + shake}, 480)`}>
            <path
              d="M 0 -90 C 70 -90 110 -40 104 20 C 98 80 50 104 0 104 C -50 104 -98 80 -104 20 C -110 -40 -70 -90 0 -90 Z"
              fill={PC.orange}
              stroke={SP.line}
              strokeWidth={5}
            />
            <path d="M -40 -40 Q -20 -56 4 -46" fill="none" stroke={SP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
          </g>
          <SmallLabel x={680} y={660} text="オレンジ" color={SP.ink} size={32} weight={700} />
          {/* 分けようとする2つの空きカップ + ? */}
          <g opacity={a2}>
            <g stroke={SP.dim} strokeWidth={5} fill={SP.panel}>
              <path d="M 1120 420 L 1230 420 L 1216 520 L 1134 520 Z" />
              <path d="M 1120 580 L 1230 580 L 1216 680 L 1134 680 Z" />
            </g>
            <text x={1175} y={492} textAnchor="middle" fill={SP.faint} fontSize={52} fontWeight={800} fontFamily={SUURI_FONT}>
              ?
            </text>
            <text x={1175} y={652} textAnchor="middle" fill={SP.faint} fontSize={52} fontWeight={800} fontFamily={SUURI_FONT}>
              ?
            </text>
            {/* 分ける矢印 (点線) */}
            <g stroke={SP.dim} strokeWidth={5} strokeDasharray="10 12" fill="none">
              <path d="M 800 440 Q 960 400 1110 462" />
              <path d="M 800 530 Q 960 600 1110 622" />
            </g>
          </g>
          {/* 大きな× */}
          <g opacity={a3} stroke={SP.accent} strokeWidth={14} strokeLinecap="round">
            <line x1={900} y1={450} x2={1010} y2={570} />
            <line x1={1010} y1={450} x2={900} y2={570} />
          </g>
          <g opacity={a3}>
            <SmallLabel x={960} y={770} text="元の2色には、分けられない" color={SP.accent} size={32} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }

  // v3: 「戻せない」が今日の主役 (スポットライト)
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日の主役"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* スポットライト */}
        <g opacity={a1}>
          <path d="M 900 160 L 1020 160 L 1240 760 L 680 760 Z" fill={SP.ink} opacity={0.08} />
          <path d="M 920 160 L 1000 160 L 1160 760 L 760 760 Z" fill={SP.ink} opacity={0.08} />
        </g>
        {/* 台座の上のオレンジ */}
        <g opacity={a1}>
          <rect x={810} y={620} width={300} height={26} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
          <g transform="translate(960, 500)">
            <path
              d="M 0 -80 C 62 -80 98 -36 92 18 C 86 70 44 92 0 92 C -44 92 -86 70 -92 18 C -98 -36 -62 -80 0 -80 Z"
              fill={PC.orange}
              stroke={SP.line}
              strokeWidth={5}
            />
            <path d="M -36 -36 Q -18 -50 2 -42" fill="none" stroke={SP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
          </g>
        </g>
        {/* 「戻せない」の札 (赤枠) */}
        <g opacity={a2}>
          <rect x={760} y={690} width={400} height={84} rx={14} fill={SP.background} stroke={SP.accent} strokeWidth={5} />
          <text x={960} y={748} textAnchor="middle" fill={SP.accent} fontSize={52} fontWeight={800} fontFamily={SUURI_FONT}>
            戻せない
          </text>
        </g>
      </svg>
    </Frame>
  );
};
