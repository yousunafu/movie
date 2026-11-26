// クリスマス回B「日本のクリスマスは、なぜこうなったのか」 (docs/xmasjp-script-v1.txt) の全体取りまとめ。
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。台本の文 i → XJ_ALL_MOTIFS[i-1]。
// 検品プレビュー XjAll: 1フレーム = 1シーン (f=45)。コマ番号 = 文番号 − 1。

import React from "react";
import { useCurrentFrame } from "remotion";
import { XJ_A_MOTIFS, xjAScene } from "./XjA";
import { XJ_AB_MOTIFS, xjAbScene } from "./XjAb";
import { XJ_B_MOTIFS, xjBScene } from "./XjB";
import { XJ_BB_MOTIFS, xjBbScene } from "./XjBb";
import { XJ_C_MOTIFS, xjCScene } from "./XjC";
import { XJ_CB_MOTIFS, xjCbScene } from "./XjCb";
import { XJ_D_MOTIFS, xjDScene } from "./XjD";
import { XJ_DB_MOTIFS, xjDbScene } from "./XjDb";
import { XJ_E_MOTIFS, xjEScene } from "./XjE";
import { XJ_EB_MOTIFS, xjEbScene } from "./XjEb";
import { XJ_F_MOTIFS, xjFScene } from "./XjF";
import { XJ_FB_MOTIFS, xjFbScene } from "./XjFb";
import { XJ_G_MOTIFS, xjGScene } from "./XjG";
import { XJ_GB_MOTIFS, xjGbScene } from "./XjGb";
import { XJ_H_MOTIFS, xjHScene } from "./XjH";
import { XJ_HB_MOTIFS, xjHbScene } from "./XjHb";
import { XJ_J_MOTIFS, xjJScene } from "./XjJ";
import { XJ_JB_MOTIFS, xjJbScene } from "./XjJb";
import { XJ_K_MOTIFS, xjKScene } from "./XjK";

export const XJ_ALL_MOTIFS: string[] = [
  ...XJ_A_MOTIFS, // #1〜#12
  ...XJ_AB_MOTIFS, // #13〜#24
  ...XJ_B_MOTIFS, // #25〜#36
  ...XJ_BB_MOTIFS, // #37〜#48
  ...XJ_C_MOTIFS, // #49〜#60
  ...XJ_CB_MOTIFS, // #61〜#72
  ...XJ_D_MOTIFS, // #73〜#84
  ...XJ_DB_MOTIFS, // #85〜#96
  ...XJ_E_MOTIFS, // #97〜#108
  ...XJ_EB_MOTIFS, // #109〜#120
  ...XJ_F_MOTIFS, // #121〜#132
  ...XJ_FB_MOTIFS, // #133〜#144
  ...XJ_G_MOTIFS, // #145〜#156
  ...XJ_GB_MOTIFS, // #157〜#168
  ...XJ_H_MOTIFS, // #169〜#180
  ...XJ_HB_MOTIFS, // #181〜#192
  ...XJ_J_MOTIFS, // #193〜#204
  ...XJ_JB_MOTIFS, // #205〜#216
  ...XJ_K_MOTIFS, // #217〜#224
];

export const xjScene = (motif: string, f: number): React.ReactElement | null =>
  xjAScene(motif, f) ??
  xjAbScene(motif, f) ??
  xjBScene(motif, f) ??
  xjBbScene(motif, f) ??
  xjCScene(motif, f) ??
  xjCbScene(motif, f) ??
  xjDScene(motif, f) ??
  xjDbScene(motif, f) ??
  xjEScene(motif, f) ??
  xjEbScene(motif, f) ??
  xjFScene(motif, f) ??
  xjFbScene(motif, f) ??
  xjGScene(motif, f) ??
  xjGbScene(motif, f) ??
  xjHScene(motif, f) ??
  xjHbScene(motif, f) ??
  xjJScene(motif, f) ??
  xjJbScene(motif, f) ??
  xjKScene(motif, f);

export const XJ_ALL_PREVIEW_FRAMES = Math.max(XJ_ALL_MOTIFS.length, 1);
export const XjAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, XJ_ALL_MOTIFS.length - 1);
  return <>{xjScene(XJ_ALL_MOTIFS[i] ?? "", 45)}</>;
};

// 動き確認用 (1シーン200フレーム)。コマ = (文番号−1)*200 + 見たいf
export const XJ_MOTION_PER = 200;
export const XJ_MOTION_FRAMES = Math.max(XJ_ALL_MOTIFS.length * XJ_MOTION_PER, 1);
export const XjAllMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / XJ_MOTION_PER), XJ_ALL_MOTIFS.length - 1);
  return <>{xjScene(XJ_ALL_MOTIFS[i] ?? "", frame - i * XJ_MOTION_PER)}</>;
};
