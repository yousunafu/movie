// クリスマス回A「サンタクロースは、だれが作ったのか」 (docs/santa-script-v1.txt) の全体取りまとめ。
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。台本の文 i → ST_ALL_MOTIFS[i-1]。
// 検品プレビュー SantaAll: 1フレーム = 1シーン (f=45)。コマ番号 = 文番号 − 1。

import React from "react";
import { useCurrentFrame } from "remotion";
import { ST_A_MOTIFS, santaAScene } from "./SantaA";
import { ST_AB_MOTIFS, santaAbScene } from "./SantaAb";
import { ST_B_MOTIFS, santaBScene } from "./SantaB";
import { ST_BB_MOTIFS, santaBbScene } from "./SantaBb";
import { ST_C_MOTIFS, santaCScene } from "./SantaC";
import { ST_CB_MOTIFS, santaCbScene } from "./SantaCb";
import { ST_D_MOTIFS, santaDScene } from "./SantaD";
import { ST_DB_MOTIFS, santaDbScene } from "./SantaDb";
import { ST_E_MOTIFS, santaEScene } from "./SantaE";
import { ST_EB_MOTIFS, santaEbScene } from "./SantaEb";
import { ST_F_MOTIFS, santaFScene } from "./SantaF";
import { ST_FB_MOTIFS, santaFbScene } from "./SantaFb";
import { ST_G_MOTIFS, santaGScene } from "./SantaG";
import { ST_GB_MOTIFS, santaGbScene } from "./SantaGb";
import { ST_H_MOTIFS, santaHScene } from "./SantaH";
import { ST_HB_MOTIFS, santaHbScene } from "./SantaHb";
import { ST_J_MOTIFS, santaJScene } from "./SantaJ";
import { ST_JB_MOTIFS, santaJbScene } from "./SantaJb";
import { ST_K_MOTIFS, santaKScene } from "./SantaK";

export const ST_ALL_MOTIFS: string[] = [
  ...ST_A_MOTIFS, // #1〜#12
  ...ST_AB_MOTIFS, // #13〜#24
  ...ST_B_MOTIFS, // #25〜#36
  ...ST_BB_MOTIFS, // #37〜#48
  ...ST_C_MOTIFS, // #49〜#60
  ...ST_CB_MOTIFS, // #61〜#72
  ...ST_D_MOTIFS, // #73〜#84
  ...ST_DB_MOTIFS, // #85〜#96
  ...ST_E_MOTIFS, // #97〜#108
  ...ST_EB_MOTIFS, // #109〜#120
  ...ST_F_MOTIFS, // #121〜#132
  ...ST_FB_MOTIFS, // #133〜#144
  ...ST_G_MOTIFS, // #145〜#156
  ...ST_GB_MOTIFS, // #157〜#168
  ...ST_H_MOTIFS, // #169〜#180
  ...ST_HB_MOTIFS, // #181〜#192
  ...ST_J_MOTIFS, // #193〜#204
  ...ST_JB_MOTIFS, // #205〜#216
  ...ST_K_MOTIFS, // #217〜#224
];

export const santaScene = (motif: string, f: number): React.ReactElement | null =>
  santaAScene(motif, f) ??
  santaAbScene(motif, f) ??
  santaBScene(motif, f) ??
  santaBbScene(motif, f) ??
  santaCScene(motif, f) ??
  santaCbScene(motif, f) ??
  santaDScene(motif, f) ??
  santaDbScene(motif, f) ??
  santaEScene(motif, f) ??
  santaEbScene(motif, f) ??
  santaFScene(motif, f) ??
  santaFbScene(motif, f) ??
  santaGScene(motif, f) ??
  santaGbScene(motif, f) ??
  santaHScene(motif, f) ??
  santaHbScene(motif, f) ??
  santaJScene(motif, f) ??
  santaJbScene(motif, f) ??
  santaKScene(motif, f);

export const ST_ALL_PREVIEW_FRAMES = Math.max(ST_ALL_MOTIFS.length, 1);
export const SantaAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, ST_ALL_MOTIFS.length - 1);
  return <>{santaScene(ST_ALL_MOTIFS[i] ?? "", 45)}</>;
};

// 動き確認用 (1シーン200フレーム)。コマ = (文番号−1)*200 + 見たいf
export const ST_MOTION_PER = 200;
export const ST_MOTION_FRAMES = Math.max(ST_ALL_MOTIFS.length * ST_MOTION_PER, 1);
export const SantaAllMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / ST_MOTION_PER), ST_ALL_MOTIFS.length - 1);
  return <>{santaScene(ST_ALL_MOTIFS[i] ?? "", frame - i * ST_MOTION_PER)}</>;
};
