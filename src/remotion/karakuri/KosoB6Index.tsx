// 第6章「高いほど、安い部屋だった。」の取りまとめ。
//   #217〜#227 = KosoB6.tsx
//   #228〜#238 = KosoB6b.tsx
//   #239〜#249 = KosoB6c.tsx
//   #250〜#260 = KosoB6d.tsx
//   #261〜#271 = KosoB6e.tsx
//   #272〜#282 = KosoB6f.tsx
// 分けてあるのは、同じファイルを何人かで同時に触ると衝突するから。
// ★並べる順番はここで決める。ファイル名の順ではない。
// 絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。

import React from "react";
import { useCurrentFrame } from "remotion";
import { K_B6A_MOTIFS, kosoB6aScene } from "./KosoB6";
import { K_B6B_MOTIFS, kosoB6bScene } from "./KosoB6b";
import { K_B6C_MOTIFS, kosoB6cScene } from "./KosoB6c";
import { K_B6D_MOTIFS, kosoB6dScene } from "./KosoB6d";
import { K_B6E_MOTIFS, kosoB6eScene } from "./KosoB6e";
import { K_B6F_MOTIFS, kosoB6fScene } from "./KosoB6f";

export const K_B6_MOTIFS: string[] = [
  ...K_B6A_MOTIFS,   // #217〜#227
  ...K_B6B_MOTIFS,   // #228〜#238
  ...K_B6C_MOTIFS,   // #239〜#249
  ...K_B6D_MOTIFS,   // #250〜#260
  ...K_B6E_MOTIFS,   // #261〜#271
  ...K_B6F_MOTIFS,   // #272〜#282
];

export const kosoB6Scene = (motif: string, f: number): React.ReactElement | null =>
  kosoB6aScene(motif, f) ??
  kosoB6bScene(motif, f) ??
  kosoB6cScene(motif, f) ??
  kosoB6dScene(motif, f) ??
  kosoB6eScene(motif, f) ??
  kosoB6fScene(motif, f);

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const KOSO_B6_PREVIEW_FRAMES = Math.max(K_B6_MOTIFS.length, 1);
export const KosoB6Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_B6_MOTIFS.length - 1);
  return <>{kosoB6Scene(K_B6_MOTIFS[i] ?? "", 45)}</>;
};
