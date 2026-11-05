// 作品名: なぜ高層ビルは生まれたのか
// 「なぜ高層ビルは生まれたのか」(docs/koso-script-v7.txt・283文) の全体取りまとめ。
//   ※2026-11-05 に #8 の次へ1文 (ネット通販) を挿した。下の文番号は挿した後の番号 (v1 より+1)。
//   #1〜#28   序      = KosoB0.tsx
//   1章              = KosoB1.tsx
//   2章              = KosoB2Index.tsx (KosoB2 / B2b / B2c / B2d / B2e)
//   3章              = KosoB3Index.tsx (KosoB3 / B3b / B3c)
//   4章 #148〜#179   = KosoB4Index.tsx (KosoB4 / B4b / B4c)
//   5章 #180〜#217   = KosoB5Index.tsx (KosoB5 / B5b / B5c / B5d)
//   6章 #218〜#283   = KosoB6Index.tsx (KosoB6 / B6b / B6c / B6d / B6e / B6f)
//
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。
//   台本の文 i → K_ALL_MOTIFS[i] の絵。順番がずれると全部ずれるので、
//   章を足したときは必ず下の並びに追加すること。

import React from "react";
import { useCurrentFrame } from "remotion";
import { K_B0_MOTIFS, kosoB0Scene } from "./KosoB0";
import { K_B1_MOTIFS, kosoB1Scene } from "./KosoB1";
import { K_B2_MOTIFS, kosoB2Scene } from "./KosoB2Index";
import { K_B3_MOTIFS, kosoB3Scene } from "./KosoB3Index";
import { K_B4_MOTIFS, kosoB4Scene } from "./KosoB4Index";
import { K_B5_MOTIFS, kosoB5Scene } from "./KosoB5Index";
import { K_B6_MOTIFS, kosoB6Scene } from "./KosoB6Index";

export const K_ALL_MOTIFS: string[] = [
  ...K_B0_MOTIFS, // 序
  ...K_B1_MOTIFS, // 第1章
  ...K_B2_MOTIFS, // 第2章
  ...K_B3_MOTIFS, // 第3章
  ...K_B4_MOTIFS, // 第4章 #148〜#179
  ...K_B5_MOTIFS, // 第5章 #180〜#217
  ...K_B6_MOTIFS, // 第6章 #218〜#283 (結びを含む)
];

export const kosoScene = (motif: string, f: number): React.ReactElement | null =>
  kosoB0Scene(motif, f) ??
  kosoB1Scene(motif, f) ??
  kosoB2Scene(motif, f) ??
  kosoB3Scene(motif, f) ??
  kosoB4Scene(motif, f) ??
  kosoB5Scene(motif, f) ??
  kosoB6Scene(motif, f);

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const KOSO_ALL_PREVIEW_FRAMES = Math.max(K_ALL_MOTIFS.length, 1);
export const KosoAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_ALL_MOTIFS.length - 1);
  return <>{kosoScene(K_ALL_MOTIFS[i] ?? "", 45)}</>;
};
