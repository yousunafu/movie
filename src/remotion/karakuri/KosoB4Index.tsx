// 第4章「灯りと、空気。」の取りまとめ。
//   #147〜#157 = KosoB4.tsx
//   #158〜#168 = KosoB4b.tsx
//   #169〜#178 = KosoB4c.tsx
// 3本に分けてあるのは、同じファイルを何人かで同時に触ると衝突するから。
// ★並べる順番はここで決める。ファイル名の順ではない。
// 絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。

import React from "react";
import { useCurrentFrame } from "remotion";
import { K_B4A_MOTIFS, kosoB4aScene } from "./KosoB4";
import { K_B4B_MOTIFS, kosoB4bScene } from "./KosoB4b";
import { K_B4C_MOTIFS, kosoB4cScene } from "./KosoB4c";

export const K_B4_MOTIFS: string[] = [
  ...K_B4A_MOTIFS,   // #147〜#157
  ...K_B4B_MOTIFS,   // #158〜#168
  ...K_B4C_MOTIFS,   // #169〜#178
];

export const kosoB4Scene = (motif: string, f: number): React.ReactElement | null =>
  kosoB4aScene(motif, f) ??
  kosoB4bScene(motif, f) ??
  kosoB4cScene(motif, f);

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const KOSO_B4_PREVIEW_FRAMES = Math.max(K_B4_MOTIFS.length, 1);
export const KosoB4Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_B4_MOTIFS.length - 1);
  return <>{kosoB4Scene(K_B4_MOTIFS[i] ?? "", 45)}</>;
};
