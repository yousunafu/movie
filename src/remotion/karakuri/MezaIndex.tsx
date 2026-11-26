// 目覚まし回「人はなぜ、自力で起きられないのか」 (docs/mezamashi-script-v1.txt) の全体取りまとめ。
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。台本の文 i → MZ_ALL_MOTIFS[i-1]。
// 検品プレビュー MezaAll: 1フレーム = 1シーン (f=45)。コマ番号 = 文番号 − 1。

import React from "react";
import { useCurrentFrame } from "remotion";
import { MZ_A_MOTIFS, mezaAScene } from "./MezaA";
import { MZ_AB_MOTIFS, mezaAbScene } from "./MezaAb";
import { MZ_B_MOTIFS, mezaBScene } from "./MezaB";
import { MZ_BB_MOTIFS, mezaBbScene } from "./MezaBb";
import { MZ_C_MOTIFS, mezaCScene } from "./MezaC";
import { MZ_CB_MOTIFS, mezaCbScene } from "./MezaCb";
import { MZ_D_MOTIFS, mezaDScene } from "./MezaD";
import { MZ_DB_MOTIFS, mezaDbScene } from "./MezaDb";
import { MZ_E_MOTIFS, mezaEScene } from "./MezaE";
import { MZ_EB_MOTIFS, mezaEbScene } from "./MezaEb";
import { MZ_F_MOTIFS, mezaFScene } from "./MezaF";
import { MZ_G_MOTIFS, mezaGScene } from "./MezaG";
import { MZ_GB_MOTIFS, mezaGbScene } from "./MezaGb";
import { MZ_GC_MOTIFS, mezaGcScene } from "./MezaGc";
import { MZ_H_MOTIFS, mezaHScene } from "./MezaH";
import { MZ_HB_MOTIFS, mezaHbScene } from "./MezaHb";
import { MZ_J_MOTIFS, mezaJScene } from "./MezaJ";
import { MZ_JB_MOTIFS, mezaJbScene } from "./MezaJb";

export const MZ_ALL_MOTIFS: string[] = [
  ...MZ_A_MOTIFS, // #1〜#11
  ...MZ_AB_MOTIFS, // #12〜#23
  ...MZ_B_MOTIFS, // #24〜#35
  ...MZ_BB_MOTIFS, // #36〜#47
  ...MZ_C_MOTIFS, // #48〜#59
  ...MZ_CB_MOTIFS, // #60〜#72
  ...MZ_D_MOTIFS, // #73〜#84
  ...MZ_DB_MOTIFS, // #85〜#96
  ...MZ_E_MOTIFS, // #97〜#108
  ...MZ_EB_MOTIFS, // #109〜#120
  ...MZ_F_MOTIFS, // #121〜#132
  ...MZ_G_MOTIFS, // #133〜#144
  ...MZ_GB_MOTIFS, // #145〜#156
  ...MZ_GC_MOTIFS, // #157〜#168
  ...MZ_H_MOTIFS, // #169〜#180
  ...MZ_HB_MOTIFS, // #181〜#192
  ...MZ_J_MOTIFS, // #193〜#203
  ...MZ_JB_MOTIFS, // #204〜#213
];

export const mezaScene = (motif: string, f: number): React.ReactElement | null =>
  mezaAScene(motif, f) ??
  mezaAbScene(motif, f) ??
  mezaBScene(motif, f) ??
  mezaBbScene(motif, f) ??
  mezaCScene(motif, f) ??
  mezaCbScene(motif, f) ??
  mezaDScene(motif, f) ??
  mezaDbScene(motif, f) ??
  mezaEScene(motif, f) ??
  mezaEbScene(motif, f) ??
  mezaFScene(motif, f) ??
  mezaGScene(motif, f) ??
  mezaGbScene(motif, f) ??
  mezaGcScene(motif, f) ??
  mezaHScene(motif, f) ??
  mezaHbScene(motif, f) ??
  mezaJScene(motif, f) ??
  mezaJbScene(motif, f);

export const MEZA_ALL_PREVIEW_FRAMES = Math.max(MZ_ALL_MOTIFS.length, 1);
export const MezaAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, MZ_ALL_MOTIFS.length - 1);
  return <>{mezaScene(MZ_ALL_MOTIFS[i] ?? "", 45)}</>;
};

// 動き確認用 (1シーン200フレーム)。コマ = (文番号−1)*200 + 見たいf
export const MEZA_MOTION_PER = 200;
export const MEZA_MOTION_FRAMES = Math.max(MZ_ALL_MOTIFS.length * MEZA_MOTION_PER, 1);
export const MezaAllMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / MEZA_MOTION_PER), MZ_ALL_MOTIFS.length - 1);
  return <>{mezaScene(MZ_ALL_MOTIFS[i] ?? "", frame - i * MEZA_MOTION_PER)}</>;
};
