// サムネ (1280×720) づくりの共通部品。各回の XxxThumbs.tsx から使う。本編とは無関係。
// - Big: 太い縁取り文字 / Burst: 放射線の背景 / NameTag: 白い名札
// - makeThumbSheet: 4案を大きく2×2で見比べ / makeThumbFeed: おすすめ欄 (スマホ・ダークモード) の大きさで並べる
// 4つの型 (柔らかいもの回で決めた並び):
//   P1 どアップ・リアクション / P2 ビフォーアフター対比 / P3 ミニマル余白 / P4 物語+ワイプ

import React from "react";
import { AbsoluteFill } from "remotion";
import { KRP, KARAKURI_FONT, Person } from "./KarakuriScenes";

export const TW = 1280;
export const TH = 720;
export const INK = KRP.ink;
export const FONT = KARAKURI_FONT;
export const MINCHO = "'Hiragino Mincho ProN', 'Noto Serif JP', 'Yu Mincho', serif";
export type P = 1 | 2 | 3 | 4;
export const PATTERN_NAMES = ["", "P1 どアップ・リアクション", "P2 ビフォーアフター対比", "P3 ミニマル余白", "P4 物語+ワイプ"];

export const Big: React.FC<{
  x: number; y: number; size: number; text: string; fill?: string; stroke?: string; sw?: number;
  anchor?: "start" | "middle" | "end"; font?: string; weight?: number; rot?: number;
}> = ({ x, y, size, text, fill = KRP.white, stroke = INK, sw = 18, anchor = "start", font = FONT, weight = 900, rot = 0 }) => (
  <text x={x} y={y} fontFamily={font} fontWeight={weight} fontSize={size} textAnchor={anchor}
    fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke"
    transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
    {text}
  </text>
);

export const Burst: React.FC<{ cx: number; cy: number; a: string; b: string; n?: number }> = ({ cx, cy, a, b, n = 20 }) => (
  <g>
    <rect width={TW} height={TH} fill={a} />
    {Array.from({ length: n }).map((_, i) => {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 0.5) / n) * Math.PI * 2;
      const R = 1600;
      return (
        <polygon key={i} fill={b}
          points={`${cx},${cy} ${cx + Math.cos(a0) * R},${cy + Math.sin(a0) * R} ${cx + Math.cos(a1) * R},${cy + Math.sin(a1) * R}`} />
      );
    })}
  </g>
);

// 白い名札 (左上 x,y・幅 w は文字数から)
export const NameTag: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; rot?: number }> = ({
  x, y, text, size = 64, color = KRP.red, rot = -6,
}) => {
  const w = text.length * size + size * 0.9;
  const h = size * 1.5;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={KRP.white} stroke={INK} strokeWidth={9} />
      <text x={x + w / 2} y={y + h * 0.71} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ワイプ (丸窓でメインキャラが驚く)。cx,cy = 中心
export const Wipe: React.FC<{ id: string; cx: number; cy: number; r?: number; bg?: string }> = ({ id, cx, cy, r = 150, bg = "#FFD84D" }) => {
  const s = (r / 150) * 1.85;
  return (
    <g>
      <defs><clipPath id={id}><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
      <circle cx={cx} cy={cy} r={r + 8} fill={KRP.white} stroke={INK} strokeWidth={8} />
      <g clipPath={`url(#${id})`}>
        <rect x={cx - r - 10} y={cy - r - 10} width={2 * r + 20} height={2 * r + 20} fill={bg} />
        <Person x={cx} y={cy + 228 * s + 38 * (r / 150)} s={s} face="surprised" gaze={[-3, -1]} still />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={8} />
    </g>
  );
};

type Art = React.FC<{ p: P }>;

export const makeThumb = (Art: Art, p: P): React.FC => () => (
  <AbsoluteFill>
    <svg width={TW} height={TH} viewBox={`0 0 ${TW} ${TH}`}><Art p={p} /></svg>
  </AbsoluteFill>
);

export const makeThumbSheet = (Art: Art, key: string, names: string[] = PATTERN_NAMES): React.FC => () => (
  <AbsoluteFill style={{ background: "#FFFFFF" }}>
    <svg width={1920} height={1080}>
      {([1, 2, 3, 4] as P[]).map((p, i) => {
        const x = 80 + (i % 2) * 900;
        const y = 60 + Math.floor(i / 2) * 530;
        const w = 840;
        return (
          <g key={p}>
            <text x={x} y={y - 14} fontFamily={FONT} fontWeight={800} fontSize={30} fill={INK}>{names[p]}</text>
            <defs><clipPath id={`${key}c${p}`}><rect width={TW} height={TH} rx={30} /></clipPath></defs>
            <g transform={`translate(${x} ${y}) scale(${w / TW})`}>
              <g clipPath={`url(#${key}c${p})`}><Art p={p} /></g>
            </g>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

export const makeThumbFeed = (Art: Art, key: string, title: [string, string], names: string[] = PATTERN_NAMES): React.FC => () => (
  <AbsoluteFill style={{ background: "#0F0F0F" }}>
    <svg width={1920} height={1080}>
      {([1, 2, 3, 4] as P[]).map((p, i) => {
        const w = 400;
        const x = 70 + i * 460;
        const y = 160;
        return (
          <g key={p}>
            <defs><clipPath id={`${key}f${p}`}><rect width={TW} height={TH} rx={40} /></clipPath></defs>
            <g transform={`translate(${x} ${y}) scale(${w / TW})`}>
              <g clipPath={`url(#${key}f${p})`}><Art p={p} /></g>
            </g>
            <text x={x} y={y + 265} fontFamily={FONT} fontWeight={700} fontSize={26} fill="#F1F1F1">{title[0]}</text>
            <text x={x} y={y + 301} fontFamily={FONT} fontWeight={700} fontSize={26} fill="#F1F1F1">{title[1]}</text>
            <text x={x} y={y + 337} fontFamily={FONT} fontSize={22} fill="#AAAAAA">からくりチャンネル</text>
            <text x={x} y={y - 24} fontFamily={FONT} fontSize={24} fill="#AAAAAA">{names[p]}</text>
          </g>
        );
      })}
      {([1, 2, 3, 4] as P[]).map((p, i) => {
        const w = 210;
        const x = 70 + i * 460;
        const y = 700;
        return (
          <g key={`s${p}`}>
            <defs><clipPath id={`${key}s${p}`}><rect width={TW} height={TH} rx={50} /></clipPath></defs>
            <g transform={`translate(${x} ${y}) scale(${w / TW})`}>
              <g clipPath={`url(#${key}s${p})`}><Art p={p} /></g>
            </g>
            <text x={x} y={y + 150} fontFamily={FONT} fontSize={22} fill="#AAAAAA">210px</text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
