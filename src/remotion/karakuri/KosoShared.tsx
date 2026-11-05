// 「なぜ高層ビルは生まれたのか」の回: 全ブロック共通の部品。
// ここにある物は必ずここから import して使う (同じ物を別の見た目で描き直さない。絵のブレ防止)。
// - KBadge: 画面隅のバッジ (全シーンに置く)
// - ChapterDoor: 章の題字ブロック
// - Frame: 1シーンの外枠 (ゆらぎ + バッジ + 空気)
// - TagPlate / QMark / Arrow / XMark: 小物
// 5本柱の装置 (TowerOnPillars 等) は KosoPillars.tsx から import する。
//
// ★ここに背景を置かない。背景キットも作らない (制作ガイド §7 第3層-6)。
//   背景・空・地面・街並み・カメラの寄り引き・人の配置・小物は、1文ごとに
//   そのシーンのファイル (KosoB0〜B6) の中で、そのシーン専用に作る。
//   共有してよいのは「説明の装置」と「何度も出る同じ物」だけ。

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  KRP, KARAKURI_FONT, Badge, LabelPill, WobbleDefs, Atmosphere, clamp01, pop,
} from "./KarakuriScenes";

export const W = 1920;
export const H = 1080;
export const FONT = KARAKURI_FONT;
export const abs: React.CSSProperties = { position: "absolute", inset: 0 };

// 画面隅のバッジ (旅回の TBadge・私は何者回の WBadge と同じ位置づけ)
export const KBadge: React.FC = () => <Badge text="高層ビルのからくり" />;

// 1シーンの外枠。children は svg の中に入る (ゆらぎフィルタがかかる)。
export const Frame: React.FC<{
  f: number; seed: number; caption?: string; dark?: boolean;
  over?: React.ReactNode; children?: React.ReactNode;
  bg?: string;
}> = ({ f, seed, caption, dark, over, children, bg = KRP.cream }) => (
  <AbsoluteFill style={{ background: bg }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={960} y={170} centerX text={caption} />}
    <KBadge />
    <Atmosphere f={f} dark={dark} />
  </AbsoluteFill>
);

// 章の題字ブロック (num=0 なら「第N章」行を出さない: 序・結むけ)
export const ChapterDoor: React.FC<{
  num: number; title: string; t?: number; left?: number; top?: number; width?: number;
}> = ({ num, title, t = 1, left = 1020, top = 620, width = 840 }) => {
  const tt = clamp01(t);
  return (
    <div style={{
      position: "absolute", left, top, width, opacity: tt,
      transform: `translateY(${(1 - tt) * 30}px)`, fontFamily: FONT,
    }}>
      {num > 0 && (
        <div style={{ fontSize: 40, fontWeight: 800, color: KRP.grayDark, marginBottom: 6 }}>第{num}章</div>
      )}
      <div style={{
        fontSize: 52, fontWeight: 900, color: KRP.ink, lineHeight: 1.3,
        borderBottom: `6px solid ${KRP.ink}`, borderRadius: 8,
        background: "rgba(253,251,247,0.82)", padding: "4px 10px 10px",
      }}>
        {title}
      </div>
    </div>
  );
};

// ===== svg内の小物 =====

// 木札風ラベル (中央寄せ)
export const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number;
  color?: string; fill?: string; rot?: number;
}> = ({ x, y, text, size = 34, t = 1, color = KRP.ink, fill = KRP.white, rot = 0 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = text.length * size + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rot})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={10}
        fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ？マーク
export const QMark: React.FC<{
  x: number; y: number; s?: number; f?: number; t?: number; color?: string;
}> = ({ x, y, s = 1, f = 0, t = 1, color = KRP.red }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  const bob = Math.sin(f / 11) * 5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${sc})`}>
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={110} fill={color} stroke={KRP.ink} strokeWidth={5}
        paintOrder="stroke">？</text>
    </g>
  );
};

// ×マーク (「できない」の印)
export const XMark: React.FC<{
  x: number; y: number; s?: number; t?: number; color?: string;
}> = ({ x, y, s = 1, t = 1, color = KRP.red }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} stroke={color}
      strokeWidth={16} strokeLinecap="round" opacity={0.92}>
      <line x1={-48} y1={-48} x2={48} y2={48} />
      <line x1={48} y1={-48} x2={-48} y2={48} />
    </g>
  );
};

// 矢印 (指差し用)
export const Arrow: React.FC<{
  x: number; y: number; s?: number; rot?: number; t?: number; color?: string;
}> = ({ x, y, s = 1, rot = 0, t = 1, color = KRP.red }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rot})`}>
      <polygon points="0,0 -46,-26 -46,-10 -110,-10 -110,10 -46,10 -46,26"
        fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
};
