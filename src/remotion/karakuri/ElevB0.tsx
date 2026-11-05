// 「エレベーターの歴史」: ブロック0 = 序章 (現代の夜景からの逆転ツカミ)。
// 担当範囲: 台本 docs/elevator-script-v1.txt の 2〜11行目 (文#1〜#10・10文)。
// motif 名は必ず el0_ で始める。WobbleDefs の seed はこのファイルでは 1000〜1099 を使う。
// このファイルを編集してよいのはブロック0担当だけ (共有部品は ElevShared/KarakuriScenes から import)。
//
// 序章の方針 (作者の指示):
// - 基本は「夜景をバックに」展開する。例外は #6 (百年前の屋根裏=クラフト紙地) と #9 (黒地+スポットライト)。
// - タワマンは #1/#3/#4/#5/#8 で同じ SlimTower を使い回す (絵のブレ防止)。
// - 百年前のアパートは #7/#8 で同じ OldApartment を使い回す。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, EBadge, ChapterDoor } from "./ElevShared";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// ゆっくり始まってゆっくり止まる (カメラの寄りに使う。急に動かないように)
const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};
// (cx,cy) に向かってカメラを寄せる transform (TabiB1 と同じ流儀)
const zoomAt = (z: number, cx: number, cy: number) => `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

// 夜景用のパレット外色はこの3色だけ (制作ガイドの「増やすなら2〜3色まで」の範囲)
const NIGHT_SKY = "#2A3650";  // 夜空の紺
const NIGHT_LOW = "#3C4A6B";  // 地平線近くの明るい紺
const NIGHT_BLD = "#4A5878";  // 夜のビルの青灰

// ===== シーンの共通ガワ: 紙地 + ゆらぎ + バッジ + 質感 (TabiB1 の Frame と同じ流儀) =====
const Frame: React.FC<{
  f: number; seed: number; caption?: string; dark?: boolean; bg?: string;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, dark, bg, over, children }) => (
  <AbsoluteFill style={{ background: bg ?? KRP.cream }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={960} y={170} centerX text={caption} />}
    <EBadge />
    <Atmosphere f={f} dark={dark} />
  </AbsoluteFill>
);

// ===== 小物キット =====
// 木札風ラベル (svg内。中央寄せ)
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number; color?: string; fill?: string;
}> = ({ x, y, text, size = 34, t = 1, color = KRP.ink, fill = KRP.white }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = text.length * size + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={10}
        fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// びっくり放射線 (主役登場の後光)
const Rays: React.FC<{ x: number; y: number; r0: number; r1: number; t?: number; n?: number; f?: number; color?: string }> =
  ({ x, y, r0, r1, t = 1, n = 14, f = 0, color = KRP.orange }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    return (
      <g transform={`translate(${x} ${y}) rotate(${f * 0.25})`} opacity={tt}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + 0.22;
          const rr = r0 + (r1 - r0) * (0.6 + tt * 0.4);
          return (
            <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0}
              x2={Math.cos(a) * rr} y2={Math.sin(a) * rr}
              stroke={color} strokeWidth={9} strokeLinecap="round" />
          );
        })}
      </g>
    );
  };

// きらんと光る4芒星
const Sparkle: React.FC<{ x: number; y: number; s?: number; t?: number; f?: number; color?: string }> =
  ({ x, y, s = 1, t = 1, f = 0, color = KRP.yellow }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    const sc = s * tt * (0.85 + 0.25 * Math.sin(f / 4 + x));
    return (
      <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={tt}>
        <path d="M 0 -30 Q 5 -5 30 0 Q 5 5 0 30 Q -5 5 -30 0 Q -5 -5 0 -30 Z"
          fill={color} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
  };

// 太い矢印 (水平。t で先端まで伸びる)
const GrowArrow: React.FC<{ x1: number; x2: number; y: number; t?: number; color?: string; w?: number }> =
  ({ x1, x2, y, t = 1, color = KRP.orange, w = 12 }) => {
    const tt = easeOut(clamp01(t));
    if (tt <= 0) return null;
    const tip = lerp(x1, x2, tt);
    const dir = x2 > x1 ? 1 : -1;
    return (
      <g>
        <line x1={x1} y1={y} x2={tip - dir * 26} y2={y} stroke={color} strokeWidth={w} strokeLinecap="round" />
        <polygon points={`${tip},${y} ${tip - dir * 40},${y - 24} ${tip - dir * 40},${y + 24}`} fill={color} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    );
  };

// スポットライト (上から円錐状に落ちる光 + 足元の光だまり)
const Spotlight: React.FC<{
  x: number; y: number; halfW?: number; apexY?: number; t?: number; pool?: boolean; strong?: number;
}> = ({ x, y, halfW = 150, apexY = -220, t = 1, pool = true, strong = 1 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const o = tt * strong;
  return (
    <g>
      <polygon points={`${x},${apexY} ${x - halfW * 1.5},${y + 180} ${x + halfW * 1.5},${y + 180}`}
        fill={KRP.yellow} opacity={0.09 * o} />
      <polygon points={`${x},${apexY} ${x - halfW},${y + 90} ${x + halfW},${y + 90}`}
        fill={KRP.yellow} opacity={0.13 * o} />
      <polygon points={`${x},${apexY} ${x - halfW * 0.5},${y} ${x + halfW * 0.5},${y}`}
        fill={KRP.white} opacity={0.12 * o} />
      {pool && (
        <ellipse cx={x} cy={y} rx={halfW * 1.15} ry={halfW * 0.28}
          fill={KRP.yellow} opacity={0.22 * o} />
      )}
    </g>
  );
};

// ===================================================================
// 夜景キット (#1〜#5・#8・#10 の共通背景)
// ===================================================================

// 夜の街 (空のグラデ段・星・月・遠景スカイライン・吊り橋・水面・近景ビル・路面)
const NightCity: React.FC<{ f: number; dim?: number }> = ({ f, dim = 1 }) => (
  <g opacity={dim}>
    {/* 夜空 (上は濃紺 → 地平線近くへ段々明るく) */}
    <rect x={-20} y={-20} width={W + 40} height={926} fill={NIGHT_SKY} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={-20} y={420 + i * 80} width={W + 40} height={486 - i * 80}
        fill={NIGHT_LOW} opacity={0.13} />
    ))}
    {/* 星 (またたく) */}
    {([[150, 90], [370, 150], [560, 60], [700, 210], [890, 110], [1120, 70], [1300, 160],
      [1440, 110], [1540, 60], [1660, 190], [1740, 120], [1840, 60], [990, 230], [430, 250],
      [250, 350], [1210, 300], [820, 320], [1870, 290]] as const)
      .map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 4 : 2.8} fill={KRP.white}
          opacity={0.3 + 0.6 * (0.5 + 0.5 * Math.sin(f / 15 + i * 1.9))} />
      ))}
    {/* 月 */}
    <circle cx={250} cy={180} r={86} fill={KRP.yellow} opacity={0.13} />
    <circle cx={250} cy={180} r={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} opacity={0.95} />
    <circle cx={232} cy={166} r={10} fill={KRP.ink} opacity={0.14} />
    <circle cx={268} cy={194} r={7} fill={KRP.ink} opacity={0.12} />
    {/* 遠景スカイライン (いちばん奥。薄いシルエット) */}
    {([[60, 672, 92], [170, 700, 76], [300, 650, 110], [470, 690, 88], [620, 664, 70],
      [760, 636, 96], [900, 682, 80], [1050, 646, 104], [1240, 676, 86], [1400, 652, 96],
      [1560, 686, 74], [1700, 640, 110], [1860, 672, 90]] as const)
      .map(([bx, bt, bw], i) => (
        <g key={i} opacity={0.4}>
          <rect x={bx - bw / 2} y={bt} width={bw} height={762 - bt} fill={NIGHT_BLD} />
          {Array.from({ length: 3 }, (_, j) => (
            <rect key={j} x={bx - bw / 2 + 12 + (j % 2) * (bw * 0.45)} y={bt + 22 + j * 30}
              width={13} height={9} fill={KRP.yellow} opacity={(i + j) % 3 === 0 ? 0.75 : 0.22} />
          ))}
        </g>
      ))}
    {/* 水面 (中景の湾。きらきらの横線) */}
    <rect x={-20} y={756} width={W + 40} height={54} fill={NIGHT_SKY} opacity={0.95} />
    <rect x={-20} y={756} width={W + 40} height={54} fill={KRP.blueDeep} opacity={0.35} />
    {Array.from({ length: 16 }, (_, i) => (
      <line key={i} x1={40 + i * 118} y1={766 + (i % 4) * 11} x2={110 + i * 118} y2={766 + (i % 4) * 11}
        stroke={KRP.white} strokeWidth={2.5}
        opacity={0.12 + 0.2 * (0.5 + 0.5 * Math.sin(f / 11 + i))} />
    ))}
    {/* 吊り橋 (左側。主塔・ケーブル・吊材・橋げたの灯) */}
    <g opacity={0.9}>
      <line x1={-20} y1={752} x2={720} y2={752} stroke={KRP.ink} strokeWidth={9} />
      <line x1={-20} y1={746} x2={720} y2={746} stroke={KRP.silver} strokeWidth={3} opacity={0.55} />
      {[90, 560].map((tx) => (
        <g key={tx}>
          <rect x={tx - 13} y={596} width={26} height={158} fill={NIGHT_BLD} stroke={KRP.ink} strokeWidth={4} />
          <rect x={tx - 30} y={636} width={60} height={11} fill={NIGHT_BLD} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={tx - 30} y={690} width={60} height={11} fill={NIGHT_BLD} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={tx} cy={588} r={5} fill={KRP.red}
            opacity={0.35 + 0.6 * (0.5 + 0.5 * Math.sin(f / 9))} />
        </g>
      ))}
      {/* メインケーブル (たわみ) */}
      <path d="M -20 660 Q 40 602 90 598 Q 320 598 325 706 Q 330 598 560 598 Q 650 600 720 666"
        fill="none" stroke={KRP.silver} strokeWidth={5} opacity={0.8} />
      <path d="M 90 598 Q 325 712 560 598" fill="none" stroke={KRP.silver} strokeWidth={5} opacity={0.8} />
      {/* 吊材 */}
      {Array.from({ length: 11 }, (_, i) => {
        const hx = 110 + i * 42;
        const u = (hx - 90) / 470;
        const hy = 598 + 4 * 28.5 * u * (1 - u) * 4;
        return <line key={i} x1={hx} y1={hy} x2={hx} y2={750} stroke={KRP.silver} strokeWidth={2.2} opacity={0.55} />;
      })}
      {/* 橋げたの灯 */}
      {Array.from({ length: 13 }, (_, i) => (
        <circle key={i} cx={10 + i * 56} cy={742} r={3.4} fill={KRP.yellow}
          opacity={0.55 + 0.4 * (0.5 + 0.5 * Math.sin(f / 8 + i * 0.7))} />
      ))}
    </g>
    {/* 近景ビル群 (手前。窓明かりはまだら) */}
    {([[810, 690, 110], [930, 652, 96], [1480, 666, 126], [1640, 624, 104],
      [1830, 672, 130], [420, 700, 96], [150, 716, 84]] as const)
      .map(([bx, bt, bw], i) => (
        <g key={i}>
          <rect x={bx - bw / 2} y={bt} width={bw} height={892 - bt} fill={NIGHT_BLD}
            opacity={0.88} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, j) =>
            [0, 1].map((c) => (
              <rect key={`${j}-${c}`} x={bx - bw / 2 + 16 + c * (bw * 0.46)} y={bt + 24 + j * 32}
                width={bw * 0.28} height={15} fill={KRP.yellow}
                opacity={(i * 3 + j * 5 + c * 7) % 9 < 4 ? 0.82 : 0.14} />
            ))
          )}
          <rect x={bx - bw / 2 - 7} y={bt - 12} width={bw + 14} height={14}
            fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
    {/* 路面 */}
    <rect x={-20} y={886} width={W + 40} height={H - 866} fill={KRP.ink} opacity={0.9} />
    <line x1={-20} y1={888} x2={W + 20} y2={888} stroke={KRP.silver} strokeWidth={3.5} opacity={0.42} />
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={-40 + i * 230} y={1000} width={120} height={9} fill={KRP.yellow} opacity={0.3} />
    ))}
  </g>
);

// ===================================================================
// タワーマンション (細身でおしゃれ目。#1/#3/#4/#5/#8 で使い回す)
// 局所原点 = 足元の中央 (y=0 が地面。上は負の方向)
// ===================================================================
export const TFLOORS = 28;          // 階数
export const TFH = 34;              // 1階ぶんの高さ (局所座標)
export const TW = 150;              // 基準部の幅
const TW_TOP = 108;                 // セットバック後 (22階以上) の幅
const T_SETBACK = 22;               // ここから上は細くなる
const TOP_Y = -TFLOORS * TFH;       // 屋上スラブの高さ (= -952)
const tHalf = (i: number) => (i >= T_SETBACK ? TW_TOP : TW) / 2;

const SlimTower: React.FC<{
  x: number; y: number; s?: number; f: number;
  podium?: boolean; litSeed?: number; topGlow?: number; children?: React.ReactNode;
}> = ({ x, y, s = 1, f, podium = true, litSeed = 3, topGlow = 0, children }) => {
  const blink = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(f / 7));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 足元の影 */}
      <ellipse cx={0} cy={6} rx={TW * 1.25} ry={16} fill={KRP.ink} opacity={0.3} />
      {/* 本体 (上部でセットバックする細身のシルエット) */}
      <polygon
        points={[
          `${-TW / 2},0`,
          `${-TW / 2},${-T_SETBACK * TFH}`,
          `${-TW_TOP / 2},${-T_SETBACK * TFH}`,
          `${-TW_TOP / 2},${TOP_Y}`,
          `${TW_TOP / 2},${TOP_Y}`,
          `${TW_TOP / 2},${-T_SETBACK * TFH}`,
          `${TW / 2},${-T_SETBACK * TFH}`,
          `${TW / 2},0`,
        ].join(" ")}
        fill={NIGHT_BLD} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 各階: バルコニーのスラブ + 窓 (点灯はまだら) */}
      {Array.from({ length: TFLOORS }, (_, i) => {
        const hw = tHalf(i);
        const yTop = -(i + 1) * TFH;
        const cols = i >= T_SETBACK ? 2 : 3;
        const cw = (hw * 2 - 22) / cols;
        return (
          <g key={i}>
            {Array.from({ length: cols }, (_, c) => {
              const lit = (i * 7 + c * 13 + litSeed * 5) % 11 < 6;
              return (
                <rect key={c} x={-hw + 11 + c * cw + 3} y={yTop + 7} width={cw - 6} height={TFH - 16}
                  fill={lit ? KRP.yellow : NIGHT_SKY} opacity={lit ? 0.9 : 0.85} />
              );
            })}
            {/* スラブ (手すりの横線) */}
            <line x1={-hw - 4} y1={yTop + TFH - 5} x2={hw + 4} y2={yTop + TFH - 5}
              stroke={KRP.silver} strokeWidth={4} opacity={0.5} />
            <line x1={-hw - 4} y1={yTop + TFH - 1} x2={hw + 4} y2={yTop + TFH - 1}
              stroke={KRP.ink} strokeWidth={2} opacity={0.35} />
          </g>
        );
      })}
      {/* 縦のガラス方立 (おしゃれ目に見せる縦線) */}
      {[-0.5, 0, 0.5].map((u, i) => (
        <line key={i} x1={TW * u * 0.62} y1={-T_SETBACK * TFH} x2={TW * u * 0.62} y2={-6}
          stroke={KRP.silver} strokeWidth={3} opacity={0.42} />
      ))}
      {[-0.3, 0.3].map((u, i) => (
        <line key={i} x1={TW_TOP * u} y1={TOP_Y + 6} x2={TW_TOP * u} y2={-T_SETBACK * TFH}
          stroke={KRP.silver} strokeWidth={3} opacity={0.42} />
      ))}
      {/* ガラス面の斜めの照り */}
      <polygon points={`${-TW / 2},-300 ${-TW / 2 + 70},-470 ${-TW / 2 + 120},-470 ${-TW / 2},-180`}
        fill={KRP.white} opacity={0.1} />
      <polygon points={`${TW / 2},-60 ${TW / 2},-230 ${TW / 2 - 86},-60`} fill={KRP.white} opacity={0.07} />
      {/* 最上階まわりを明るくする (スポットライトを当てたとき) */}
      {topGlow > 0 && (
        <g opacity={clamp01(topGlow)}>
          <rect x={-TW_TOP / 2 - 2} y={TOP_Y} width={TW_TOP + 4} height={TFH * 3}
            fill={KRP.yellow} opacity={0.55} />
          <rect x={-TW_TOP / 2 - 10} y={TOP_Y - 4} width={TW_TOP + 20} height={TFH * 3 + 8}
            fill="none" stroke={KRP.yellow} strokeWidth={5} opacity={0.85} />
        </g>
      )}
      {/* 屋上: パラペット + 塔屋 + 尖塔 + 航空障害灯 */}
      <rect x={-TW_TOP / 2 - 12} y={TOP_Y - 17} width={TW_TOP + 24} height={19}
        fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-32} y={TOP_Y - 50} width={64} height={34} fill={NIGHT_BLD} stroke={KRP.ink} strokeWidth={5} />
      <line x1={0} y1={TOP_Y - 50} x2={0} y2={TOP_Y - 132} stroke={KRP.ink} strokeWidth={5} />
      <line x1={-18} y1={TOP_Y - 72} x2={18} y2={TOP_Y - 72} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
      <circle cx={0} cy={TOP_Y - 140} r={16} fill={KRP.red} opacity={0.22 + 0.2 * blink} />
      <circle cx={0} cy={TOP_Y - 140} r={7} fill={KRP.red} opacity={blink} stroke={KRP.ink} strokeWidth={2.5} />
      {/* 足元のエントランス棟 (ロビーが黄色く灯る) */}
      {podium && (
        <g>
          <rect x={-TW * 0.86} y={-94} width={TW * 1.72} height={94}
            fill={NIGHT_BLD} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-TW * 0.74} y={-78} width={TW * 1.48} height={74}
            fill={KRP.yellow} opacity={0.55} stroke={KRP.ink} strokeWidth={3.5} />
          {[-1, 0, 1].map((c, i) => (
            <line key={i} x1={c * TW * 0.37} y1={-78} x2={c * TW * 0.37} y2={-4}
              stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          ))}
          {/* 自動ドア */}
          <rect x={-30} y={-66} width={60} height={66} fill={KRP.white} opacity={0.85}
            stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-66} x2={0} y2={0} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          {/* 庇 */}
          <rect x={-TW * 1.02} y={-108} width={TW * 2.04} height={16} rx={6}
            fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 植栽 */}
          {[-TW * 0.95, TW * 0.95].map((px, i) => (
            <g key={i}>
              <rect x={px - 17} y={-34} width={34} height={34} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={px} cy={-50} r={24} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            </g>
          ))}
        </g>
      )}
      {children}
    </g>
  );
};

// ===================================================================
// 百年前のアパート (#7 外観 / #8 左の対比。マンサード屋根・鎧戸・2階の高窓)
// 局所原点 = 足元の中央。2階の中心は局所 y=-190
// ===================================================================
const OA_2F_Y = -190;
const OldApartment: React.FC<{
  x: number; y: number; s?: number; f: number; night?: boolean; lit2F?: number;
}> = ({ x, y, s = 1, f, night = false, lit2F = 0 }) => {
  const wall = night ? KRP.paperCool : KRP.white;
  const glass = night ? NIGHT_SKY : KRP.blueSoft;
  const flick = 0.75 + 0.25 * Math.sin(f / 5);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={250} ry={15} fill={KRP.ink} opacity={0.28} />
      {/* マンサード屋根 */}
      <polygon points="-218,-520 -150,-628 150,-628 218,-520" fill={KRP.grayDark}
        stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <polygon points="-150,-628 150,-628 120,-648 -120,-648" fill={KRP.ink} opacity={0.85} />
      {/* 屋根窓 (ドーマー) ×3 */}
      {[-96, 0, 96].map((dx, i) => (
        <g key={i}>
          <polygon points={`${dx - 34},-556 ${dx},-600 ${dx + 34},-556`} fill={KRP.grayDark}
            stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={dx - 26} y={-556} width={52} height={40} fill={glass} stroke={KRP.ink} strokeWidth={4} />
          <line x1={dx} y1={-556} x2={dx} y2={-516} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        </g>
      ))}
      {/* 軒 (コーニス) */}
      <rect x={-232} y={-528} width={464} height={22} rx={5} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
      {/* 本体 */}
      <rect x={-210} y={-506} width={420} height={506} fill={wall} stroke={KRP.ink} strokeWidth={6} />
      {/* 階の帯 */}
      {[-380, -260, -120].map((ly, i) => (
        <line key={i} x1={-210} y1={ly} x2={210} y2={ly} stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
      ))}
      {/* 4階 (-506〜-380): 小さい窓 */}
      {[-130, 0, 130].map((wx, i) => (
        <g key={i}>
          <rect x={wx - 32} y={-480} width={64} height={78} fill={glass} stroke={KRP.ink} strokeWidth={4} />
          <line x1={wx} y1={-480} x2={wx} y2={-402} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          <line x1={wx - 32} y1={-442} x2={wx + 32} y2={-442} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        </g>
      ))}
      {/* 3階 (-380〜-260): 窓 + 鎧戸 */}
      {[-130, 0, 130].map((wx, i) => (
        <g key={i}>
          <rect x={wx - 36} y={-356} width={72} height={88} fill={glass} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={wx - 56} y={-356} width={18} height={88} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={wx + 38} y={-356} width={18} height={88} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          <line x1={wx} y1={-356} x2={wx} y2={-268} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        </g>
      ))}
      {/* 2階 (-260〜-120): 背の高いアーチ窓 + 錬鉄のバルコニー = いちばん良い部屋 */}
      <g>
        {lit2F > 0 && (
          <rect x={-200} y={-256} width={400} height={128} fill={KRP.yellow}
            opacity={0.45 * clamp01(lit2F) * flick} />
        )}
        {[-130, 0, 130].map((wx, i) => (
          <g key={i}>
            <path d={`M ${wx - 44} -140 L ${wx - 44} -214 A 44 44 0 0 1 ${wx + 44} -214 L ${wx + 44} -140 Z`}
              fill={lit2F > 0 ? KRP.yellow : glass} opacity={lit2F > 0 ? 0.92 * flick : 1}
              stroke={KRP.ink} strokeWidth={5} />
            <line x1={wx} y1={-250} x2={wx} y2={-140} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
            <line x1={wx - 44} y1={-186} x2={wx + 44} y2={-186} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
            {/* 窓上の飾り */}
            <path d={`M ${wx - 52} -248 A 52 52 0 0 1 ${wx + 52} -248`} fill="none"
              stroke={KRP.brass} strokeWidth={5} opacity={0.9} />
          </g>
        ))}
        {/* 錬鉄の手すり (2階の見せ場) */}
        <rect x={-196} y={-140} width={392} height={9} rx={4} fill={KRP.ink} />
        {Array.from({ length: 25 }, (_, i) => (
          <line key={i} x1={-186 + i * 15.5} y1={-131} x2={-186 + i * 15.5} y2={-96}
            stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        <rect x={-196} y={-100} width={392} height={9} rx={4} fill={KRP.ink} />
      </g>
      {/* 1階 (-120〜0): 石積み + 玄関 + ガス灯 */}
      <rect x={-210} y={-120} width={420} height={120} fill={night ? KRP.gray : KRP.cream}
        opacity={0.9} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 4 }, (_, r) => (
        <line key={r} x1={-210} y1={-96 + r * 28} x2={210} y2={-96 + r * 28}
          stroke={KRP.ink} strokeWidth={2.5} opacity={0.3} />
      ))}
      <path d="M -46 0 L -46 -72 A 46 46 0 0 1 46 -72 L 46 0 Z" fill={KRP.bronze}
        stroke={KRP.ink} strokeWidth={5.5} />
      <line x1={0} y1={-114} x2={0} y2={0} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      <circle cx={-16} cy={-48} r={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      {/* ガス灯 ×2 */}
      {[-178, 178].map((gx, i) => (
        <g key={i}>
          <line x1={gx} y1={0} x2={gx} y2={-104} stroke={KRP.ink} strokeWidth={6} />
          <rect x={gx - 15} y={-140} width={30} height={38} fill={KRP.yellow} opacity={0.95}
            stroke={KRP.ink} strokeWidth={4} />
          <polygon points={`${gx - 17},-140 ${gx + 17},-140 ${gx},-156`} fill={KRP.grayDark}
            stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={gx} cy={-121} r={40} fill={KRP.yellow} opacity={0.16 * flick} />
        </g>
      ))}
    </g>
  );
};

// ===================================================================
// 不動産チラシ (#2 だけで使う。中央原点・w600×h800。ごちゃごちゃさせない)
// ===================================================================
const Flyer: React.FC<{ f?: number }> = ({ f = 0 }) => (
  <g>
    {/* 紙 (影つき) */}
    <rect x={-290} y={-390} width={600} height={800} rx={8} fill={KRP.ink} opacity={0.3} />
    <rect x={-300} y={-400} width={600} height={800} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    {/* 上の帯 */}
    <rect x={-300} y={-400} width={600} height={88} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-300} y={-344} width={600} height={32} fill={KRP.red} />
    <text x={0} y={-340} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white}>
      新築タワーマンション
    </text>
    {/* 物件写真 (夜のタワマンだけ。小物は置かない) */}
    <rect x={-250} y={-292} width={500} height={226} rx={6} fill={NIGHT_SKY} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={-186} cy={-248} r={20} fill={KRP.yellow} opacity={0.95} />
    <g transform="translate(40 -66) scale(0.2)">
      <SlimTower x={0} y={0} s={1} f={f} podium={false} litSeed={5} />
    </g>
    {/* 売り文句 (大きく2行だけ) */}
    <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill={KRP.ink}>最上階</text>
    <text x={0} y={152} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={68} fill={KRP.red}>特別価格</text>
    {/* 金額の帯 */}
    <rect x={-250} y={196} width={500} height={82} rx={8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
    <text x={0} y={256} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.ink}>1億2000万円</text>
    {/* 下に小さく1行 */}
    <rect x={-170} y={320} width={340} height={44} rx={22} fill={KRP.ink} />
    <text x={0} y={351} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={KRP.white}>モデルルーム公開中</text>
  </g>
);

// ===================================================================
// 家賃カウンター (#3。上の階へスクロールすると数字が上がる)
// ===================================================================
const RentCounter: React.FC<{
  x: number; y: number; floor: number; rent: number; t: number;
}> = ({ x, y, floor, rent, t }) => {
  const digits = String(Math.round(rent)).padStart(3, " ");
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 箱 */}
      <rect x={-184} y={-154} width={368} height={288} rx={16} fill={KRP.ink} opacity={0.3} />
      <rect x={-194} y={-164} width={368} height={288} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      {/* 見出し */}
      <rect x={-194} y={-164} width={368} height={56} rx={16} fill={KRP.blueDeep} />
      <rect x={-194} y={-124} width={368} height={16} fill={KRP.blueDeep} />
      <text x={-10} y={-124} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>
        この階の家賃
      </text>
      {/* 階数 */}
      <rect x={-166} y={-94} width={128} height={52} rx={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={-102} y={-54} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>
        {floor}F
      </text>
      {/* 金額 (オドメーター風) */}
      <rect x={-166} y={-26} width={236} height={82} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-166 + (i + 1) * 59} y1={-26} x2={-166 + (i + 1) * 59} y2={56}
          stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      ))}
      {digits.split("").map((d, i) => (
        <text key={i} x={-136 + i * 59} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={60} fill={KRP.yellow}>{d}</text>
      ))}
      <text x={124} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>万円</text>
      {/* ゲージ (上へ行くほど満ちる) */}
      <rect x={-166} y={74} width={318} height={28} rx={14} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-162} y={78} width={310 * clamp01(t)} height={20} rx={10} fill={KRP.orange} />
      {/* 上向き矢印 (数字が上がっている印) */}
      {[0, 1, 2].map((i) => {
        const o = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin((t * 40) - i * 1.4));
        return (
          <polygon key={i} points={`${142},${-70 - i * 26} ${126},${-48 - i * 26} ${158},${-48 - i * 26}`}
            fill={KRP.orange} opacity={o} />
        );
      })}
    </g>
  );
};

// ===================================================================
// 尻もちをついて痛がる人 (#5。局所原点 = お尻が着いた地面)
// ===================================================================
const FallenPerson: React.FC<{ x: number; y: number; s?: number; f: number; t?: number }> =
  ({ x, y, s = 1, f, t = 1 }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    const jig = Math.sin(f / 3.5) * 2.6;
    const up = (1 - pop(tt)) * 40; // 落ちた直後に少し弾む
    return (
      <g transform={`translate(${x} ${y - up}) scale(${s})`} opacity={tt}>
        <ellipse cx={34} cy={6} rx={150} ry={18} fill={KRP.ink} opacity={0.24} />
        {/* 前へ投げ出した足 (太い線を二重に引いて輪郭にする) */}
        <path d="M -10 -58 Q 66 -44 128 -72" stroke={KRP.ink} strokeWidth={42} fill="none" strokeLinecap="round" />
        <path d="M -10 -58 Q 66 -44 128 -72" stroke={KRP.gray} strokeWidth={29} fill="none" strokeLinecap="round" />
        <ellipse cx={136} cy={-76} rx={28} ry={18} fill={KRP.ink} transform="rotate(-20 136 -76)" />
        <path d="M -4 -28 Q 74 -16 140 -40" stroke={KRP.ink} strokeWidth={42} fill="none" strokeLinecap="round" />
        <path d="M -4 -28 Q 74 -16 140 -40" stroke={KRP.gray} strokeWidth={29} fill="none" strokeLinecap="round" />
        <ellipse cx={148} cy={-44} rx={28} ry={18} fill={KRP.ink} transform="rotate(-16 148 -44)" />
        {/* 胴 + 頭 (後ろに倒れこむ) */}
        <g transform={`rotate(${-13 + jig} -30 -30)`}>
          {/* 後ろ手で体を支える */}
          <path d="M -86 -136 Q -148 -92 -140 -26" stroke={KRP.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d="M -86 -136 Q -148 -92 -140 -26" stroke={KRP.cream} strokeWidth={22} fill="none" strokeLinecap="round" />
          <rect x={-92} y={-178} width={116} height={156} rx={36} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
          <path d="M -92 -120 L 24 -120" stroke={KRP.ink} strokeWidth={3.5} opacity={0.3} />
          {/* 頭 */}
          <circle cx={-34} cy={-246} r={74} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          <path d="M -108 -254 a 74 74 0 0 1 148 0 q -32 -28 -74 -28 q -42 0 -74 28 Z" fill={KRP.ink} />
          {/* >< の目 */}
          <g stroke={KRP.ink} strokeWidth={6.5} strokeLinecap="round" fill="none">
            <path d="M -68 -262 l 22 16 l -22 16" />
            <path d="M -2 -262 l -22 16 l 22 16" />
          </g>
          {/* 痛がる口 */}
          <path d="M -50 -210 q 16 24 32 0 q -16 -10 -32 0 Z" fill={KRP.ink} />
          {/* ほっぺの赤み */}
          <ellipse cx={-80} cy={-222} rx={13} ry={8} fill={KRP.red} opacity={0.35} />
          <ellipse cx={10} cy={-222} rx={13} ry={8} fill={KRP.red} opacity={0.35} />
        </g>
        {/* 痛みのぐるぐる + 星 */}
        <g opacity={0.3 + 0.7 * (0.5 + 0.5 * Math.sin(f / 6))}>
          <path d="M -150 -330 q 30 -34 56 -6 q -22 24 -44 2 q 16 -18 34 -2"
            fill="none" stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" />
        </g>
        <Sparkle x={60} y={-336} s={0.9} t={1} f={f} color={KRP.orange} />
        <Sparkle x={-176} y={-258} s={0.6} t={1} f={f + 8} color={KRP.orange} />
        {/* 「いたっ」 */}
        <g transform="translate(176 -268)">
          <rect x={-78} y={-46} width={156} height={92} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <polygon points="-70,36 -26,40 -58,76" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={KRP.red}>いたっ</text>
        </g>
      </g>
    );
  };

// ===================================================================
// 序章 #1〜#10
// ===================================================================

// #1 すごい引きの夜景 → ゆっくりタワマンへ寄る → 最上階にスポットライト
const SceneYakeiZoom: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 1.9 * easeInOut(seg(f, 10, 120)); // ゆっくり (110フレームかけて寄る)
  const spotT = seg(f, 82, 112);
  return (
    <Frame f={f} seed={1000} dark caption="現代の夜景">
      <g transform={zoomAt(z, 1180, 470)}>
        <NightCity f={f} />
        <SlimTower x={1180} y={890} s={0.48} f={f} litSeed={3} topGlow={spotT} />
        <Spotlight x={1180} y={470} halfW={62} apexY={-300} t={spotT} pool={false} />
      </g>
      <TagPlate x={560} y={390} text="最上階" size={52} t={seg(f, 100, 118)} color={KRP.red} />
      <GrowArrow x1={700} x2={1020} y={390} t={seg(f, 106, 122)} />
    </Frame>
  );
};

// #2 不動産チラシ「最上階 特別価格」。左の空きに「※高いほうの」注釈 (重ねない)
const SceneTakaiHou: React.FC<{ f: number }> = ({ f }) => {
  const sc = pop(seg(f, 6, 30)) * 0.9;
  const rot = 8 - 12 * easeOut(seg(f, 14, 46)); // 8° → -4° で傾いて止まる
  const ringT = seg(f, 48, 62);
  const noteT = clamp01((f - 66) / 14);
  return (
    <Frame f={f} seed={1001} dark
      over={<>{f >= 66 && <Stamp x={520} y={452} text="※高いほうの" size={52} />}</>}>
      <NightCity f={f} dim={0.5} />
      {sc > 0 && (
        <g transform={`translate(1270 560) rotate(${rot}) scale(${sc})`}>
          <Flyer f={f} />
          {/* 「特別価格」を赤丸で囲む (チラシと一緒に傾く) */}
          <ellipse cx={0} cy={148} rx={202} ry={58} fill="none" stroke={KRP.red}
            strokeWidth={10} opacity={ringT} />
        </g>
      )}
      {/* 注釈からの引き出し線 */}
      {noteT > 0 && (
        <path d="M 640 520 Q 830 580 988 668" fill="none" stroke={KRP.red} strokeWidth={5.5}
          strokeDasharray="13 10" opacity={noteT} />
      )}
    </Frame>
  );
};

// #3 細身のタワマンを下から上へスクロール。右の家賃カウンターの数字がどんどん上がる
const SceneUeHodoTakai: React.FC<{ f: number }> = ({ f }) => {
  const t = easeInOut(seg(f, 12, 126));
  const s = 1.7;
  const fh = TFH * s;
  const floorF = t * (TFLOORS - 1); // 0 = 1F 〜 27 = 28F
  const HI_Y = 560;                 // 注目している階は画面のこの高さに固定
  const baseY = HI_Y + fh * (floorF + 0.5);
  const rent = 20 + floorF * 3;     // 20万円 → 101万円
  return (
    <Frame f={f} seed={1002} dark caption="上の階ほど 家賃が上がる">
      {/* 背景も少しだけ一緒に動かす (スクロールしている感じ) */}
      <g transform={`translate(0 ${fh * floorF * 0.08})`}>
        <NightCity f={f} dim={0.55} />
      </g>
      <SlimTower x={540} y={baseY} s={s} f={f} litSeed={4}>
        <rect x={-TW / 2 - 10} y={-(floorF + 1) * TFH} width={TW + 20} height={TFH}
          fill={KRP.yellow} opacity={0.5} />
        <rect x={-TW / 2 - 15} y={-(floorF + 1) * TFH - 5} width={TW + 30} height={TFH + 10}
          fill="none" stroke={KRP.orange} strokeWidth={7 / s} />
      </SlimTower>
      {/* 注目階 → カウンターの引き出し線 */}
      <line x1={700} y1={HI_Y} x2={1070} y2={HI_Y} stroke={KRP.orange} strokeWidth={5}
        strokeDasharray="14 10" opacity={0.9} />
      <RentCounter x={1300} y={HI_Y} floor={Math.round(floorF) + 1} rent={rent} t={t} />
      {/* 左: スクロールの目安 */}
      <rect x={284} y={300} width={18} height={496} rx={9} fill={KRP.gray}
        stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
      <rect x={288} y={lerp(766, 306, t)} width={10} height={26} rx={5} fill={KRP.orange} />
      <polygon points="293,264 265,310 321,310" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
    </Frame>
  );
};

// #4 同じタワマンの「足元」だけを映して通行人が素通り (誰も見上げない)
const SceneAtarimae: React.FC<{ f: number }> = ({ f }) => {
  const walkers: Array<[number, number, number, string, string, number]> = [
    // [速さ, オフセット, 大きさ, 服, 服(濃), 位相]
    [4.0, 1040, 0.98, KRP.blueDeep, "#38598C", 1],
    [3.2, 480, 0.9, KRP.green, "#639A5F", 2],
    [4.6, 1620, 1.04, KRP.orange, "#C07838", 3],
  ];
  return (
    <Frame f={f} seed={1003} dark caption="当たり前すぎて 誰も見上げない">
      <NightCity f={f} dim={0.75} />
      {/* 全体は映さない。足元だけが画面を占める大きさ */}
      <SlimTower x={820} y={890} s={2.5} f={f} litSeed={3} />
      {/* 歩道の縁 */}
      <line x1={-20} y1={906} x2={W + 20} y2={906} stroke={KRP.silver} strokeWidth={4} opacity={0.4} />
      {/* 街灯 */}
      <g>
        <line x1={1620} y1={890} x2={1620} y2={470} stroke={KRP.ink} strokeWidth={9} />
        <path d="M 1620 470 q 0 -40 -58 -40" fill="none" stroke={KRP.ink} strokeWidth={9} />
        <ellipse cx={1556} cy={442} rx={30} ry={17} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="1526,442 1586,442 1556,620" fill={KRP.yellow} opacity={0.14} />
      </g>
      {walkers.map(([v, o, s, c1, c2, ph], k) => {
        const px = ((f * v + o) % 2400) - 200;
        return (
          <Person key={k} x={px} y={904} s={s} f={f} phase={ph} face="normal"
            gaze={[6, 2]} cloth={c1} clothDark={c2} />
        );
      })}
    </Frame>
  );
};

// #5 タワマンが上下にひっくり返り、右のキャラも回って尻もち (この回の核演出)
const SceneSakasama: React.FC<{ f: number }> = ({ f }) => {
  const flipT = pop(seg(f, 24, 74)); // 少し行き過ぎて戻る「ぐるん」
  const a = 180 * flipT;
  const TX = 600, TY = 880, TS = 0.52;
  const cyRot = TY - (TFLOORS * TFH * TS) / 2; // 回転の中心
  const standT = 1 - seg(f, 62, 74);
  const fallT = seg(f, 68, 88);
  const arcT = seg(f, 8, 20) * (1 - seg(f, 66, 80));
  const tags: Array<[number, string, boolean]> = [[394, "1.2億", true], [856, "3000万", false]];
  return (
    <Frame f={f} seed={1004} dark
      over={<>{f >= 8 && <Stamp x={1640} y={236} text="百年前" size={58} />}</>}>
      <NightCity f={f} dim={0.5} />
      {/* 上下反転するタワマン (値札も一緒に入れ替わる) */}
      <g transform={`rotate(${a} ${TX} ${cyRot})`}>
        <SlimTower x={TX} y={TY} s={TS} f={f} litSeed={3} />
        {tags.map(([ty, label, hot], i) => (
          <g key={i}>
            <line x1={648} y1={ty} x2={744} y2={ty} stroke={KRP.orange} strokeWidth={4.5}
              strokeDasharray="9 7" />
            {/* 札だけ逆回転させて、位置は入れ替わるが文字は読めるまま */}
            <g transform={`rotate(${-a} 840 ${ty})`}>
              <TagPlate x={840} y={ty} text={label} size={40}
                fill={hot ? KRP.red : KRP.white} color={hot ? KRP.white : KRP.ink} />
            </g>
          </g>
        ))}
      </g>
      {/* 回転を予告する円弧矢印 */}
      {arcT > 0 && (
        <g opacity={arcT} stroke={KRP.orange} strokeWidth={9} fill="none" strokeLinecap="round">
          <path d="M 318 556 A 300 300 0 0 1 882 556" />
          <polygon points="900,544 836,524 858,594" fill={KRP.orange} stroke="none" />
          <path d="M 882 712 A 300 300 0 0 1 318 712" />
          <polygon points="300,724 364,744 342,674" fill={KRP.orange} stroke="none" />
        </g>
      )}
      {/* 右のキャラも一緒に回って、尻もちをついて痛がる */}
      {standT > 0 && (
        <g transform={`rotate(${a} 1420 740)`} opacity={standT}>
          <Person x={1420} y={880} s={0.95} f={f} phase={2} face="normal" gaze={[-4, 0]}
            cloth={KRP.blueDeep} clothDark="#38598C" still />
        </g>
      )}
      <FallenPerson x={1318} y={886} s={0.76} f={f} t={fallT} />
      <TagPlate x={1130} y={252} text="世界は逆さま" size={42} t={seg(f, 88, 104)} color={KRP.red} />
    </Frame>
  );
};

// #6 反転後の最上階にズーム。屋根裏の粗末な部屋 (ここだけ背景はクラフト紙地のまま)
const SceneSaijoukaiYasui: React.FC<{ f: number }> = ({ f }) => {
  const z = 0.82 + 0.18 * easeInOut(seg(f, 0, 44));
  const flame = 1 + 0.18 * Math.sin(f / 3.2) + 0.08 * Math.sin(f / 1.7);
  const FLOOR = 860; // 床板の高さ。家具はすべてここに足を着ける
  return (
    <Frame f={f} seed={1005} caption="百年前の最上階は 屋根裏部屋">
      <g transform={zoomAt(z, 960, 540)}>
        {/* 屋根裏: 斜めの天井と梁 */}
        <polygon points={`300,${FLOOR} 300,520 960,210 1620,520 1620,${FLOOR}`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <line x1={330} y1={520} x2={960} y2={236} stroke={KRP.copper} strokeWidth={18} opacity={0.85} />
        <line x1={1590} y1={520} x2={960} y2={236} stroke={KRP.copper} strokeWidth={18} opacity={0.85} />
        <line x1={620} y1={400} x2={620} y2={FLOOR} stroke={KRP.copper} strokeWidth={13} opacity={0.6} />
        <line x1={1300} y1={400} x2={1300} y2={FLOOR} stroke={KRP.copper} strokeWidth={13} opacity={0.6} />
        {/* 床板 */}
        <line x1={300} y1={FLOOR} x2={1620} y2={FLOOR} stroke={KRP.ink} strokeWidth={6} opacity={0.8} />
        {[460, 760, 1060, 1360].map((lx) => (
          <line key={lx} x1={lx} y1={FLOOR} x2={lx + 60} y2={FLOOR + 20} stroke={KRP.ink} strokeWidth={2.5} opacity={0.25} />
        ))}
        {/* 丸窓から夜空と月 */}
        <circle cx={960} cy={330} r={74} fill={NIGHT_SKY} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={935} cy={312} r={22} fill={KRP.yellow} opacity={0.95} />
        <circle cx={1000} cy={352} r={3} fill={KRP.white} opacity={0.8} />
        <line x1={886} y1={330} x2={1034} y2={330} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
        <line x1={960} y1={256} x2={960} y2={404} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
        {/* 粗末なベッド (脚が床にちゃんと着く: 原点 FLOOR で脚の下端が 0) */}
        <g transform={`translate(560 ${FLOOR})`}>
          <rect x={-180} y={-96} width={360} height={40} rx={6} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-180} y={-56} width={20} height={56} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
          <rect x={160} y={-56} width={20} height={56} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-168} y={-118} width={336} height={28} rx={12} fill={KRP.yellow} opacity={0.55} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-60} y={-130} width={228} height={34} rx={10} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 20 -124 l 22 22 M 42 -124 l -22 22" stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          <rect x={-150} y={-140} width={80} height={36} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 木箱の机 (床に着地) + ロウソク + 水差し */}
        <g transform={`translate(1330 ${FLOOR})`}>
          <rect x={-90} y={-110} width={180} height={110} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-90} y1={-55} x2={90} y2={-55} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          <rect x={-40} y={-152} width={24} height={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(-28 -158) scale(${flame})`}>
            <path d="M 0 0 Q 11 -16 0 -34 Q -11 -16 0 0 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
            <path d="M 0 -6 Q 5 -14 0 -24 Q -5 -14 0 -6 Z" fill={KRP.yellow} />
          </g>
          <circle cx={-28} cy={-158} r={46} fill={KRP.yellow} opacity={0.14 * flame} />
          <path d="M 30 -110 q -14 -36 10 -52 q 30 -10 36 18 q 4 22 -14 34 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 水の入ったたらい (床に置く) */}
        <g transform={`translate(880 ${FLOOR})`}>
          <path d="M -54 -44 L 54 -44 L 44 0 L -44 0 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-50} y1={-30} x2={50} y2={-30} stroke={KRP.blueSoft} strokeWidth={8} opacity={0.8} />
        </g>
        {/* 壁のつぎはぎ */}
        <g transform="translate(700 600) rotate(-8)">
          <rect x={-46} y={-34} width={92} height={68} fill={KRP.gray} opacity={0.55} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 7" />
        </g>
      </g>
      <TagPlate x={960} y={520} text="いちばん安い" size={52} t={seg(f, 40, 58)} color={KRP.blueDeep} />
      <TagPlate x={420} y={300} text="最上階" size={36} t={seg(f, 16, 32)} />
    </Frame>
  );
};

// #7 百年前のアパートの「2階」にスポットライト → 寄る → そのまま室内へ切り替わる
const SceneNikaiCrown: React.FC<{ f: number }> = ({ f }) => {
  const CX = 960, CY = 880 + OA_2F_Y * 1.3; // 2階の中心 (世界座標) = 880 - 247 = 633
  const exT = 1 - seg(f, 58, 80);
  const inT = seg(f, 58, 80);
  const exZ = 1 + 2.0 * easeInOut(seg(f, 14, 80));
  const inZ = 1.26 - 0.26 * easeOut(seg(f, 62, 116));
  const spotT = seg(f, 6, 26);
  const flame = 1 + 0.15 * Math.sin(f / 3);
  return (
    <Frame f={f} seed={1006} dark={exT > 0.5} caption="百年前の2階は お金持ちの階">
      {/* --- 外観 (スポットライトが2階に当たる → 寄る) --- */}
      {exT > 0 && (
        <g opacity={exT}>
          <g transform={zoomAt(exZ, CX, CY)}>
            <NightCity f={f} dim={0.8} />
            <OldApartment x={CX} y={880} s={1.3} f={f} night lit2F={spotT} />
            <Spotlight x={CX} y={CY + 70} halfW={240} apexY={-200} t={spotT} pool={false} />
            <rect x={CX - 290} y={CY - 96} width={580} height={192} fill="none"
              stroke={KRP.yellow} strokeWidth={7} opacity={0.8 * spotT} />
          </g>
        </g>
      )}
      {/* --- 室内 (いちばん良い部屋) --- */}
      {inT > 0 && (
        <g opacity={inT}>
          <g transform={zoomAt(inZ, 960, 540)}>
            {/* 高い天井の広間 */}
            <rect x={300} y={200} width={1320} height={660} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <line x1={300} y1={258} x2={1620} y2={258} stroke={KRP.brass} strokeWidth={8} opacity={0.8} />
            <line x1={300} y1={276} x2={1620} y2={276} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
            {/* ヘリンボーンの床 */}
            <rect x={300} y={760} width={1320} height={100} fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 11 }, (_, i) => (
              <g key={i} stroke={KRP.ink} strokeWidth={2.5} opacity={0.3}>
                <line x1={330 + i * 120} y1={860} x2={390 + i * 120} y2={760} />
                <line x1={390 + i * 120} y1={760} x2={450 + i * 120} y2={860} />
              </g>
            ))}
            {/* 背の高い窓 ×2 + 豪華カーテン */}
            {[520, 1400].map((wx) => (
              <g key={wx}>
                <rect x={wx - 95} y={310} width={190} height={400} rx={10} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
                <line x1={wx} y1={310} x2={wx} y2={710} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
                <line x1={wx - 95} y1={510} x2={wx + 95} y2={510} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
                <path d={`M ${wx - 130} 300 Q ${wx - 96} 420 ${wx - 118} 540 Q ${wx - 86} 620 ${wx - 108} 716 L ${wx - 150} 716 L ${wx - 150} 300 Z`}
                  fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                <path d={`M ${wx + 130} 300 Q ${wx + 96} 420 ${wx + 118} 540 Q ${wx + 86} 620 ${wx + 108} 716 L ${wx + 150} 716 L ${wx + 150} 300 Z`}
                  fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                <rect x={wx - 160} y={282} width={320} height={34} rx={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                <circle cx={wx - 118} cy={540} r={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={wx + 118} cy={540} r={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
              </g>
            ))}
            {/* シャンデリア */}
            <g transform="translate(960 200)">
              <line x1={0} y1={0} x2={0} y2={62} stroke={KRP.brass} strokeWidth={7} />
              <path d="M -110 92 Q 0 150 110 92" fill="none" stroke={KRP.brass} strokeWidth={9} />
              <path d="M -110 92 Q -110 56 -96 48 M 110 92 Q 110 56 96 48" fill="none" stroke={KRP.brass} strokeWidth={7} />
              <circle cx={0} cy={110} r={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
              {[-110, 0, 110].map((cx2, i) => (
                <g key={i} transform={`translate(${cx2} ${cx2 === 0 ? 62 : 80})`}>
                  <rect x={-7} y={0} width={14} height={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                  <g transform={`translate(0 -4) scale(${flame})`}>
                    <path d="M 0 0 Q 7 -10 0 -22 Q -7 -10 0 0 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={2.5} />
                  </g>
                </g>
              ))}
            </g>
            {/* 中央の壁飾り: 王冠の紋章 */}
            <g transform="translate(960 480)">
              <circle cx={0} cy={0} r={118} fill={KRP.white} stroke={KRP.brass} strokeWidth={10} />
              <circle cx={0} cy={0} r={100} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
              <g transform={`translate(0 10) scale(${0.6 + 0.4 * pop(seg(f, 78, 98))})`}>
                <path d="M -70 34 L -70 -18 L -36 10 L 0 -44 L 36 10 L 70 -18 L 70 34 Z"
                  fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
                <rect x={-70} y={34} width={140} height={22} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
                <circle cx={0} cy={-50} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={-70} cy={-24} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={70} cy={-24} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
              </g>
            </g>
          </g>
          <Sparkle x={1070} y={400} s={1.1} t={seg(f, 96, 108)} f={f} />
          <Sparkle x={880} y={430} s={0.75} t={seg(f, 100, 112)} f={f + 6} />
          <TagPlate x={960} y={700} text="いちばん良い部屋" size={48} t={seg(f, 92, 108)} color={KRP.red} />
        </g>
      )}
      <TagPlate x={420} y={300} text="2階" size={36} t={seg(f, 16, 32) * (1 - seg(f, 58, 72))} />
    </Frame>
  );
};

// #8 逆転を起こした「たった一つの機械」。左=百年前のアパート / 右=いまのタワマン (精巧に)
const SceneTattaHitotsu: React.FC<{ f: number }> = ({ f }) => {
  const boxT = pop(seg(f, 2, 18));
  const wob = Math.sin(f / 9) * 4 * seg(f, 18, 26);
  return (
    <Frame f={f} seed={1007} dark>
      <NightCity f={f} dim={0.6} />
      {/* 左: 百年前のアパート (#7 と同じ建物) */}
      <g opacity={easeOut(seg(f, 8, 26))}>
        <OldApartment x={360} y={884} s={0.62} f={f} night />
        <TagPlate x={360} y={424} text="百年前" size={36} t={seg(f, 16, 30)} />
      </g>
      {/* 右: いまのタワマン (#1 と同じ建物。全景を精巧に) */}
      <g opacity={easeOut(seg(f, 14, 32))}>
        <SlimTower x={1600} y={884} s={0.58} f={f} litSeed={6} />
        <TagPlate x={1600} y={272} text="いま" size={36} t={seg(f, 22, 36)} />
      </g>
      {/* 中央: 謎の機械 (黒い箱 + ?) がゆれる */}
      {boxT > 0 && (
        <g transform={`translate(960 548) rotate(${wob}) scale(${boxT})`}>
          <rect x={-150} y={-170} width={300} height={340} rx={18} fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={-62} cy={-78} r={44} fill="none" stroke={KRP.silver} strokeWidth={6} opacity={0.3} />
          <circle cx={58} cy={-50} r={30} fill="none" stroke={KRP.silver} strokeWidth={5} opacity={0.25} />
          <circle cx={-62} cy={-78} r={10} fill={KRP.silver} opacity={0.3} />
          <text x={0} y={118} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={185} fill={KRP.yellow}>?</text>
        </g>
      )}
      {/* 左右から矢印 */}
      <GrowArrow x1={580} x2={776} y={548} t={seg(f, 28, 46)} />
      <GrowArrow x1={1440} x2={1144} y={548} t={seg(f, 36, 54)} />
      <TagPlate x={960} y={816} text="たった一つの機械" size={40} t={seg(f, 52, 68)} />
    </Frame>
  );
};

// #9 黒地 + スポットライト。エレベーターが上から降りてきて扉が開き、人が前に出てくる
const SceneShuyakuElevator: React.FC<{ f: number }> = ({ f }) => {
  const dropT = easeOut(seg(f, 2, 44));
  const boxY = lerp(-660, 0, dropT);              // 上から降りてくる
  const dx = easeOut(seg(f, 50, 82)) * 160;       // 扉の開き
  const stepT = easeOut(seg(f, 86, 126));         // 人が前に出てくる
  const floorNum = Math.max(1, Math.ceil(5 - dropT * 4));
  const py = boxY * (1 - stepT) + lerp(812, 942, stepT);
  const ps = lerp(0.95, 1.14, stepT);
  return (
    <Frame f={f} seed={1008} bg={KRP.ink}>
      {/* スポットライト (黒地に光だけ) */}
      <Spotlight x={960} y={846} halfW={300} apexY={-160} t={1} strong={1.35} />
      <Rays x={960} y={560} r0={360} r1={660} t={seg(f, 48, 70)} n={16} f={f} color={KRP.orange} />
      {/* 床のライン (光だまりの中だけ見える) */}
      <ellipse cx={960} cy={846} rx={430} ry={70} fill={KRP.yellow} opacity={0.1} />
      <line x1={560} y1={846} x2={1360} y2={846} stroke={KRP.silver} strokeWidth={4} opacity={0.35} />
      {/* エレベーター本体 (上から降りてくる) */}
      <g transform={`translate(0 ${boxY})`}>
        {/* かごの中 */}
        <rect x={800} y={332} width={320} height={490} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={800} y={332} width={320} height={490} fill={KRP.yellow} opacity={0.42} />
        <line x1={800} y1={628} x2={1120} y2={628} stroke={KRP.bronze} strokeWidth={9} />
        <line x1={846} y1={332} x2={846} y2={822} stroke={KRP.ink} strokeWidth={3} opacity={0.22} />
        <line x1={1074} y1={332} x2={1074} y2={822} stroke={KRP.ink} strokeWidth={3} opacity={0.22} />
        {/* 扉 (開口部でクリップして左右へスライド) */}
        <clipPath id="elevDoorClip1008">
          <rect x={800} y={332} width={320} height={490} />
        </clipPath>
        <g clipPath="url(#elevDoorClip1008)">
          <g transform={`translate(${-dx} 0)`}>
            <rect x={800} y={332} width={160} height={490} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <line x1={880} y1={360} x2={880} y2={794} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
          </g>
          <g transform={`translate(${dx} 0)`}>
            <rect x={960} y={332} width={160} height={490} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <line x1={1040} y1={360} x2={1040} y2={794} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
          </g>
        </g>
        {/* 枠 + 階数表示 (降りているあいだ数字が減る) */}
        <rect x={768} y={288} width={384} height={534} fill="none" stroke={KRP.silver} strokeWidth={9} />
        <rect x={768} y={288} width={384} height={46} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        <text x={936} y={326} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={33}
          fill={KRP.yellow}>{floorNum}F</text>
        <polygon points="1040,300 1014,300 1027,324" fill={KRP.orange} opacity={dropT < 1 ? 1 : 0.25} />
        <polygon points="1082,300 1056,300 1069,324" fill={KRP.orange} opacity={dropT < 1 ? 0.5 : 0.25} />
      </g>
      {/* 乗っていた人 (扉が開いて前に出てくる。背は高め) */}
      <ellipse cx={960} cy={py + 6} rx={92 * ps} ry={16} fill={KRP.ink} opacity={0.4} />
      <Person x={960} y={py} s={ps} f={f} phase={5} face="smile" gaze={[0, 2]}
        cloth={KRP.blueDeep} clothDark="#38598C" still={stepT <= 0.01} />
      <TagPlate x={376} y={332} text="今日の主役" size={38} t={seg(f, 54, 70)} />
      <TagPlate x={376} y={438} text="エレベーター" size={52} t={seg(f, 62, 80)} color={KRP.red} />
    </Frame>
  );
};

// #10 題字「上と下がひっくり返った170年」+ 昇降かごが実際に上下する (1往復)
const Scene170nenTitle: React.FC<{ f: number }> = ({ f }) => {
  // 下 → 上 → 下 の1往復 (滑車とおもりも連動)
  const up = easeInOut(seg(f, 10, 78));
  const down = easeInOut(seg(f, 96, 148));
  const travel = clamp01(up - down);        // 0 = 最下部 / 1 = 最上部
  const BOT = 760, TOP = 330;
  const cageY = lerp(BOT, TOP, travel);
  const cwY = lerp(TOP, BOT, travel);
  const spin = travel * 560;                // 滑車の回転は移動量に比例
  const floorNo = 1 + Math.round(travel * 5);
  return (
    <Frame f={f} seed={1009} dark
      over={<ChapterDoor num={0} title="上と下がひっくり返った170年" left={880} top={560} width={920} t={seg(f, 18, 46)} />}>
      <NightCity f={f} dim={0.5} />
      {/* 左: 小さな昇降路 (滑車 + ロープ + かご + おもり) */}
      <rect x={340} y={130} width={360} height={746} rx={10} fill={KRP.paperCool} opacity={0.85}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 階の目印 */}
      {Array.from({ length: 6 }, (_, i) => {
        const fy = BOT - i * ((BOT - TOP) / 5);
        return (
          <g key={i}>
            <line x1={348} y1={fy + 40} x2={692} y2={fy + 40} stroke={KRP.ink} strokeWidth={3}
              strokeDasharray="10 8" opacity={0.3} />
            <text x={676} y={fy + 34} textAnchor="end" fontFamily={FONT} fontWeight={800}
              fontSize={21} fill={KRP.grayDark} opacity={0.8}>{i + 1}F</text>
          </g>
        );
      })}
      {/* 頂部の梁と滑車 (回る) */}
      <rect x={350} y={150} width={340} height={26} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`translate(520 240) rotate(${spin})`}>
        <circle cx={0} cy={0} r={52} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
        {[0, 45, 90, 135].map((a) => (
          <line key={a} x1={-44} y1={0} x2={44} y2={0} stroke={KRP.ink} strokeWidth={4} opacity={0.5} transform={`rotate(${a})`} />
        ))}
      </g>
      <line x1={520} y1={176} x2={520} y2={188} stroke={KRP.ink} strokeWidth={5} />
      {/* ロープ (かご側とおもり側) */}
      <line x1={468} y1={252} x2={448} y2={cageY - 84} stroke={KRP.ink} strokeWidth={5} />
      <line x1={572} y1={252} x2={620} y2={cwY - 56} stroke={KRP.ink} strokeWidth={5} />
      {/* かごのレール */}
      <line x1={386} y1={300} x2={386} y2={856} stroke={KRP.grayDark} strokeWidth={5} opacity={0.7} />
      <line x1={510} y1={300} x2={510} y2={856} stroke={KRP.grayDark} strokeWidth={5} opacity={0.7} />
      {/* かご (実際に上下する) */}
      <g transform={`translate(448 ${cageY})`}>
        <rect x={-62} y={-84} width={124} height={150} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-62} y={-84} width={124} height={150} rx={8} fill={KRP.yellow} opacity={0.4} />
        <line x1={0} y1={-84} x2={0} y2={66} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <rect x={-62} y={-102} width={124} height={18} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* おもり (逆に動く) */}
      <g transform={`translate(620 ${cwY})`}>
        <rect x={-26} y={-56} width={52} height={112} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-26} y1={-20} x2={26} y2={-20} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
        <line x1={-26} y1={16} x2={26} y2={16} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
      </g>
      {/* 階数表示 */}
      <rect x={252} y={196} width={118} height={58} rx={10} fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
      <text x={311} y={240} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38}
        fill={KRP.yellow}>{floorNo}F</text>
      {/* 上下の両矢印 */}
      <g opacity={seg(f, 24, 40)}>
        <line x1={286} y1={420} x2={286} y2={680} stroke={KRP.orange} strokeWidth={10} strokeLinecap="round" />
        <polygon points="286,388 258,444 314,444" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
        <polygon points="286,712 258,656 314,656" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    </Frame>
  );
};

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  el0_yakei_zoom: (f) => <SceneYakeiZoom f={f} />,
  el0_takai_hou: (f) => <SceneTakaiHou f={f} />,
  el0_ue_hodo_takai: (f) => <SceneUeHodoTakai f={f} />,
  el0_atarimae: (f) => <SceneAtarimae f={f} />,
  el0_sakasama: (f) => <SceneSakasama f={f} />,
  el0_saijoukai_yasui: (f) => <SceneSaijoukaiYasui f={f} />,
  el0_nikai_crown: (f) => <SceneNikaiCrown f={f} />,
  el0_tatta_hitotsu: (f) => <SceneTattaHitotsu f={f} />,
  el0_shuyaku_elevator: (f) => <SceneShuyakuElevator f={f} />,
  el0_170nen_title: (f) => <Scene170nenTitle f={f} />,
};

export const elevB0Scene = (motif: string, f: number): React.ReactElement | null => {
  const S = SCENES[motif];
  return S ? S(f) : null;
};

// 文#1〜#10 に1対1で対応する motif 名の列 (長さは必ず10)
export const EL_B0_MOTIFS: string[] = [
  "el0_yakei_zoom",       // #1 引きの夜景 → タワマンへゆっくり寄る → 最上階にスポット
  "el0_takai_hou",        // #2 チラシ「最上階 特別価格」+ 「※高いほうの」注釈
  "el0_ue_hodo_takai",    // #3 上の階へスクロール。家賃カウンターの数字が上がる
  "el0_atarimae",         // #4 タワマンの足元だけ。通行人が素通り
  "el0_sakasama",         // #5 タワマンが上下反転。キャラも回って尻もち (核演出)
  "el0_saijoukai_yasui",  // #6 百年前の最上階 = 屋根裏部屋 (背景はクラフト紙地)
  "el0_nikai_crown",      // #7 2階にスポット → 寄る → 室内 (いちばん良い部屋)
  "el0_tatta_hitotsu",    // #8 百年前のアパート vs いまのタワマン + ?の箱
  "el0_shuyaku_elevator", // #9 黒地+スポット。上から降りて扉が開き人が前に出る
  "el0_170nen_title",     // #10 題字 + かごが実際に上下する
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (動きが出きった f=130 の瞬間を描く) =====
export const EL_B0_PREVIEW_FRAMES = Math.max(EL_B0_MOTIFS.length, 1);
export const ElevB0Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(EL_B0_MOTIFS.length - 1, 0));
  const motif = EL_B0_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {elevB0Scene(motif, 130)}
      <LabelPill x={24} y={16} text={`#${i + 1} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};

// ===== 動き確認用: 1シーン150フレーム (5秒) ずつ通して再生する =====
export const EL_B0_MOTION_PER = 150;
export const EL_B0_MOTION_FRAMES = EL_B0_MOTIFS.length * EL_B0_MOTION_PER;
export const ElevB0Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / EL_B0_MOTION_PER), EL_B0_MOTIFS.length - 1);
  const motif = EL_B0_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {elevB0Scene(motif, frame - i * EL_B0_MOTION_PER)}
      <LabelPill x={24} y={16} text={`#${i + 1} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
