// 第2章「人を、上げる。」の取りまとめ。
//   #66〜#75  = KosoB2.tsx   (階段〜落ちる)
//   #76〜#82  = KosoB2d.tsx  (安全装置の段)
//   #83〜#89  = KosoB2e.tsx  (つり合いおもりの段)
//   #90〜#101 = KosoB2b.tsx  (つるべ〜ボタン)
//   #102〜#112 = KosoB2c.tsx (無人化〜章の結び)
// 5本に分けてあるのは、同じファイルを何人かで同時に触ると衝突するから。
// ★並べる順番はここで決める。ファイル名の順ではない。
// 絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。

import React from "react";
import { useCurrentFrame } from "remotion";
import { K_B2A_MOTIFS, kosoB2aScene } from "./KosoB2";
import { K_B2B_MOTIFS, kosoB2bScene } from "./KosoB2b";
import { K_B2C_MOTIFS, kosoB2cScene } from "./KosoB2c";
import { K_B2D_MOTIFS, kosoB2dScene } from "./KosoB2d";
import { K_B2E_MOTIFS, kosoB2eScene } from "./KosoB2e";

export const K_B2_MOTIFS: string[] = [
  ...K_B2A_MOTIFS,   // #66〜#75
  ...K_B2D_MOTIFS,   // #76〜#82
  ...K_B2E_MOTIFS,   // #83〜#89
  ...K_B2B_MOTIFS,   // #90〜#101
  ...K_B2C_MOTIFS,   // #102〜#112
];

export const kosoB2Scene = (motif: string, f: number): React.ReactElement | null =>
  kosoB2aScene(motif, f) ?? kosoB2dScene(motif, f) ?? kosoB2eScene(motif, f) ??
  kosoB2bScene(motif, f) ?? kosoB2cScene(motif, f);

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const KOSO_B2_PREVIEW_FRAMES = Math.max(K_B2_MOTIFS.length, 1);
export const KosoB2Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_B2_MOTIFS.length - 1);
  return <>{kosoB2Scene(K_B2_MOTIFS[i] ?? "", 45)}</>;
};
