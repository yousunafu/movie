// 第3章「水は、勝手に上がらない。」の取りまとめ。
//   #113〜#123 = KosoB3.tsx
//   #124〜#134 = KosoB3b.tsx
//   #135〜#146 = KosoB3c.tsx
// 3本に分けてあるのは、同じファイルを何人かで同時に触ると衝突するから。
// ★並べる順番はここで決める。ファイル名の順ではない。
// 絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。

import React from "react";
import { useCurrentFrame } from "remotion";
import { K_B3A_MOTIFS, kosoB3aScene } from "./KosoB3";
import { K_B3B_MOTIFS, kosoB3bScene } from "./KosoB3b";
import { K_B3C_MOTIFS, kosoB3cScene } from "./KosoB3c";

export const K_B3_MOTIFS: string[] = [
  ...K_B3A_MOTIFS,   // #113〜#123
  ...K_B3B_MOTIFS,   // #124〜#134
  ...K_B3C_MOTIFS,   // #135〜#146
];

export const kosoB3Scene = (motif: string, f: number): React.ReactElement | null =>
  kosoB3aScene(motif, f) ??
  kosoB3bScene(motif, f) ??
  kosoB3cScene(motif, f);

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const KOSO_B3_PREVIEW_FRAMES = Math.max(K_B3_MOTIFS.length, 1);
export const KosoB3Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_B3_MOTIFS.length - 1);
  return <>{kosoB3Scene(K_B3_MOTIFS[i] ?? "", 45)}</>;
};
