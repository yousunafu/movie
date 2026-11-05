// 第5章「島には、土地がない。」の取りまとめ。
//   #179〜#188 = KosoB5.tsx
//   #189〜#198 = KosoB5b.tsx
//   #199〜#207 = KosoB5c.tsx
//   #208〜#216 = KosoB5d.tsx
// 分けてあるのは、同じファイルを何人かで同時に触ると衝突するから。
// ★並べる順番はここで決める。ファイル名の順ではない。
// 絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。

import React from "react";
import { useCurrentFrame } from "remotion";
import { K_B5A_MOTIFS, kosoB5aScene } from "./KosoB5";
import { K_B5B_MOTIFS, kosoB5bScene } from "./KosoB5b";
import { K_B5C_MOTIFS, kosoB5cScene } from "./KosoB5c";
import { K_B5D_MOTIFS, kosoB5dScene } from "./KosoB5d";

export const K_B5_MOTIFS: string[] = [
  ...K_B5A_MOTIFS,   // #179〜#188
  ...K_B5B_MOTIFS,   // #189〜#198
  ...K_B5C_MOTIFS,   // #199〜#207
  ...K_B5D_MOTIFS,   // #208〜#216
];

export const kosoB5Scene = (motif: string, f: number): React.ReactElement | null =>
  kosoB5aScene(motif, f) ??
  kosoB5bScene(motif, f) ??
  kosoB5cScene(motif, f) ??
  kosoB5dScene(motif, f);

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const KOSO_B5_PREVIEW_FRAMES = Math.max(K_B5_MOTIFS.length, 1);
export const KosoB5Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_B5_MOTIFS.length - 1);
  return <>{kosoB5Scene(K_B5_MOTIFS[i] ?? "", 45)}</>;
};
