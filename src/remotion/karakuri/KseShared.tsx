// 「つながる世界史」をからくり作風で試作する回 (冒頭2分テスト): 全担当共通の部品。
// KosoShared / IchiShared と同じ役割。この回専用なのはバッジ (つながる世界史) と Frame だけで、
// TagPlate / QMark / XMark / Arrow は KosoShared の物をそのまま使い回す
// (からくり憲法 第15条: 部品還元の法。同じ物を別の見た目で描き直さない)。
//
// ★ここに背景を置かない。背景キットも作らない (制作ガイド §7 第3層)。
//   背景・空・地面・人の配置・小物は、1文ごとにそのシーンのファイル (KseA〜KseD) の中で、
//   そのシーン専用に作る。共有してよいのは「説明の装置」と「何度も出る同じ物」だけ。

import React from "react";
import { AbsoluteFill } from "remotion";
import { KRP, Badge, LabelPill, WobbleDefs, Atmosphere } from "./KarakuriScenes";
import { W, H, abs } from "./KosoShared";

// 使い回す物の再輸出 (Kse* からは必ずこのファイル経由で import する)
export { W, H, FONT, abs, TagPlate, QMark, XMark, Arrow } from "./KosoShared";

// 画面隅のバッジ
export const SBadge: React.FC = () => <Badge text="つながる世界史" />;

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
