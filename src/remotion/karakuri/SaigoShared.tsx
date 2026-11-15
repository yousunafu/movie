// 「人類は、昔から飛ばして観ていた」(最後まで観る文化の歴史) の回: 全ブロック共通の部品。
// IchiShared と同じ役割。この回専用なのはバッジと Frame だけで、
// ChapterDoor / TagPlate / QMark / XMark / Arrow は KosoShared の物をそのまま使い回す
// (からくり憲法 第15条: 部品還元の法。同じ物を別の見た目で描き直さない)。
//
// ★ここに背景を置かない。背景キットも作らない (制作ガイド §7 第3層)。
//   背景・空・地面・人の配置・小物は、1文ごとにそのシーンのファイル (SaigoA〜) の中で、
//   そのシーン専用に作る。共有してよいのは「説明の装置」(SaigoParts.tsx) だけ。

import React from "react";
import { AbsoluteFill } from "remotion";
import { KRP, Badge, LabelPill, WobbleDefs, Atmosphere, pop, clamp01 } from "./KarakuriScenes";
import { W, H, abs, FONT } from "./KosoShared";

// 使い回す物の再輸出 (Saigo* からは必ずこのファイル経由で import する)
export { W, H, FONT, abs, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
export { Maru, MaruBatsu } from "./KosoB2Parts";

// 画面隅のバッジ
export const SBadge: React.FC = () => <Badge text="観かたのからくり" />;

// クイズのQバッジ (クイズは3回 #6/#56/#179。毎回この同じ絵柄を使う。絵のブレ禁止)
export const QuizQ: React.FC<{
  f: number; x: number; y: number; s?: number; t?: number;
}> = ({ f, x, y, s = 1, t = 1 }) => {
  const p = pop(clamp01(t)) * (1 + Math.sin(f / 9) * 0.04);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * p})`}>
      <circle r={110} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
      <text y={42} textAnchor="middle" fontSize={120} fontWeight={900}
        fill={KRP.white} fontFamily={FONT}>Q</text>
    </g>
  );
};

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
    <SBadge />
    <Atmosphere f={f} dark={dark} />
  </AbsoluteFill>
);
