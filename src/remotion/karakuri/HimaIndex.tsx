// 「名前を奪われる」のは、なぜあんなに怖いのか (docs/hima-script-v2.txt) の全体取りまとめ。
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。台本の文 i → H_ALL_MOTIFS[i-1]。
// 検品プレビュー HimaAll: 1フレーム = 1シーン (f=45)。コマ番号 = 文番号 − 1。

import React from "react";
import { useCurrentFrame } from "remotion";
import { HM_A_MOTIFS, himaAScene } from "./HimaA";
import { HM_AB_MOTIFS, himaAbScene } from "./HimaAb";
import { HM_B_MOTIFS, himaBScene } from "./HimaB";
import { HM_BB_MOTIFS, himaBbScene } from "./HimaBb";
import { HM_C_MOTIFS, himaCScene } from "./HimaC";
import { HM_D_MOTIFS, himaDScene } from "./HimaD";
import { HM_DB_MOTIFS, himaDbScene } from "./HimaDb";
import { HM_E_MOTIFS, himaEScene } from "./HimaE";
import { HM_EB_MOTIFS, himaEbScene } from "./HimaEb";
import { HM_F_MOTIFS, himaFScene } from "./HimaF";
import { HM_FB_MOTIFS, himaFbScene } from "./HimaFb";
import { HM_FC_MOTIFS, himaFcScene } from "./HimaFc";
import { HM_G_MOTIFS, himaGScene } from "./HimaG";
import { HM_GB_MOTIFS, himaGbScene } from "./HimaGb";
import { HM_GC_MOTIFS, himaGcScene } from "./HimaGc";
import { HM_H_MOTIFS, himaHScene } from "./HimaH";
import { HM_HB_MOTIFS, himaHbScene } from "./HimaHb";
import { HM_J_MOTIFS, himaJScene } from "./HimaJ";
import { HM_JB_MOTIFS, himaJbScene } from "./HimaJb";

export const H_ALL_MOTIFS: string[] = [
  ...HM_A_MOTIFS, // #1〜#11
  ...HM_AB_MOTIFS, // #12〜#23
  ...HM_B_MOTIFS, // #24〜#35
  ...HM_BB_MOTIFS, // #36〜#47
  ...HM_C_MOTIFS, // #48〜#58
  ...HM_D_MOTIFS, // #59〜#70
  ...HM_DB_MOTIFS, // #71〜#82
  ...HM_E_MOTIFS, // #83〜#94
  ...HM_EB_MOTIFS, // #95〜#103
  ...HM_F_MOTIFS, // #104〜#115
  ...HM_FB_MOTIFS, // #116〜#127
  ...HM_FC_MOTIFS, // #128〜#137
  ...HM_G_MOTIFS, // #138〜#149
  ...HM_GB_MOTIFS, // #150〜#161
  ...HM_GC_MOTIFS, // #162〜#172
  ...HM_H_MOTIFS, // #173〜#183
  ...HM_HB_MOTIFS, // #184〜#193
  ...HM_J_MOTIFS, // #194〜#204
  ...HM_JB_MOTIFS, // #205〜#215
];

export const himaScene = (motif: string, f: number): React.ReactElement | null =>
  himaAScene(motif, f) ??
  himaAbScene(motif, f) ??
  himaBScene(motif, f) ??
  himaBbScene(motif, f) ??
  himaCScene(motif, f) ??
  himaDScene(motif, f) ??
  himaDbScene(motif, f) ??
  himaEScene(motif, f) ??
  himaEbScene(motif, f) ??
  himaFScene(motif, f) ??
  himaFbScene(motif, f) ??
  himaFcScene(motif, f) ??
  himaGScene(motif, f) ??
  himaGbScene(motif, f) ??
  himaGcScene(motif, f) ??
  himaHScene(motif, f) ??
  himaHbScene(motif, f) ??
  himaJScene(motif, f) ??
  himaJbScene(motif, f);

export const HIMA_ALL_PREVIEW_FRAMES = Math.max(H_ALL_MOTIFS.length, 1);
export const HimaAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, H_ALL_MOTIFS.length - 1);
  return <>{himaScene(H_ALL_MOTIFS[i] ?? "", 45)}</>;
};

// 動き確認用 (1シーン200フレーム)。コマ = (文番号−1)*200 + 見たいf
export const HIMA_MOTION_PER = 200;
export const HIMA_MOTION_FRAMES = Math.max(H_ALL_MOTIFS.length * HIMA_MOTION_PER, 1);
export const HimaAllMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / HIMA_MOTION_PER), H_ALL_MOTIFS.length - 1);
  return <>{himaScene(H_ALL_MOTIFS[i] ?? "", frame - i * HIMA_MOTION_PER)}</>;
};
