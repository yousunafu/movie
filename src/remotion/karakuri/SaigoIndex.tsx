// 作品名: 人類は、昔から飛ばして観ていた
// (docs/saigomade-script-v1.txt・237文) の全体取りまとめ。
//
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。
//   台本の文 i → S_ALL_MOTIFS[i-1] の絵。順番がずれると全部ずれる。
//   ※各ファイルの MOTIFS 配列だけ直しても絵は出ない。最後に scenes-data.json へ反映する。
//
// 検品プレビュー SaigoAll: 1フレーム = 1シーン (f=45 の瞬間)。
//   コマ番号 (フレーム番号) = 文番号 − 1。全237コマ。

import React from "react";
import { useCurrentFrame } from "remotion";
import { S_A_MOTIFS, saigoAScene } from "./SaigoA";
import { S_AB_MOTIFS, saigoAbScene } from "./SaigoAb";
import { S_B1_MOTIFS, saigoB1Scene } from "./SaigoB1";
import { S_B1B_MOTIFS, saigoB1bScene } from "./SaigoB1b";
import { S_B2_MOTIFS, saigoB2Scene } from "./SaigoB2";
import { S_B2B_MOTIFS, saigoB2bScene } from "./SaigoB2b";
import { S_B3_MOTIFS, saigoB3Scene } from "./SaigoB3";
import { S_B3B_MOTIFS, saigoB3bScene } from "./SaigoB3b";
import { S_B4_MOTIFS, saigoB4Scene } from "./SaigoB4";
import { S_B5_MOTIFS, saigoB5Scene } from "./SaigoB5";
import { S_B5B_MOTIFS, saigoB5bScene } from "./SaigoB5b";
import { S_B6_MOTIFS, saigoB6Scene } from "./SaigoB6";
import { S_B6B_MOTIFS, saigoB6bScene } from "./SaigoB6b";
import { S_B7_MOTIFS, saigoB7Scene } from "./SaigoB7";
import { S_B7B_MOTIFS, saigoB7bScene } from "./SaigoB7b";
import { S_B8_MOTIFS, saigoB8Scene } from "./SaigoB8";
import { S_B9_MOTIFS, saigoB9Scene } from "./SaigoB9";
import { S_B9B_MOTIFS, saigoB9bScene } from "./SaigoB9b";
import { S_B10_MOTIFS, saigoB10Scene } from "./SaigoB10";
import { S_B10B_MOTIFS, saigoB10bScene } from "./SaigoB10b";
import { S_C_MOTIFS, saigoCScene } from "./SaigoC";
import { S_CB_MOTIFS, saigoCbScene } from "./SaigoCb";
// 修正3: 地図のシーン (#180 #181 #185) は監督が別ファイルで描き直し、各章の絵より先に引く
import { saigoChizuScene } from "./SaigoChizuScenes";

export const S_ALL_MOTIFS: string[] = [
  ...S_A_MOTIFS, // #1〜#12
  ...S_AB_MOTIFS, // #13〜#25
  ...S_B1_MOTIFS, // #26〜#37
  ...S_B1B_MOTIFS, // #38〜#44
  ...S_B2_MOTIFS, // #45〜#56
  ...S_B2B_MOTIFS, // #57〜#64
  ...S_B3_MOTIFS, // #65〜#76
  ...S_B3B_MOTIFS, // #77〜#86
  ...S_B4_MOTIFS, // #87〜#98
  ...S_B5_MOTIFS, // #99〜#110
  ...S_B5B_MOTIFS, // #111〜#113
  ...S_B6_MOTIFS, // #114〜#125
  ...S_B6B_MOTIFS, // #126〜#136
  ...S_B7_MOTIFS, // #137〜#148
  ...S_B7B_MOTIFS, // #149〜#160
  ...S_B8_MOTIFS, // #161〜#171
  ...S_B9_MOTIFS, // #172〜#183
  ...S_B9B_MOTIFS, // #184〜#194
  ...S_B10_MOTIFS, // #195〜#206
  ...S_B10B_MOTIFS, // #207〜#218
  ...S_C_MOTIFS, // #219〜#228
  ...S_CB_MOTIFS, // #229〜#237
];

export const saigoScene = (motif: string, f: number): React.ReactElement | null =>
  saigoChizuScene(motif, f) ??
  saigoAScene(motif, f) ??
  saigoAbScene(motif, f) ??
  saigoB1Scene(motif, f) ??
  saigoB1bScene(motif, f) ??
  saigoB2Scene(motif, f) ??
  saigoB2bScene(motif, f) ??
  saigoB3Scene(motif, f) ??
  saigoB3bScene(motif, f) ??
  saigoB4Scene(motif, f) ??
  saigoB5Scene(motif, f) ??
  saigoB5bScene(motif, f) ??
  saigoB6Scene(motif, f) ??
  saigoB6bScene(motif, f) ??
  saigoB7Scene(motif, f) ??
  saigoB7bScene(motif, f) ??
  saigoB8Scene(motif, f) ??
  saigoB9Scene(motif, f) ??
  saigoB9bScene(motif, f) ??
  saigoB10Scene(motif, f) ??
  saigoB10bScene(motif, f) ??
  saigoCScene(motif, f) ??
  saigoCbScene(motif, f);

export const SAIGO_ALL_PREVIEW_FRAMES = Math.max(S_ALL_MOTIFS.length, 1);
export const SaigoAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, S_ALL_MOTIFS.length - 1);
  return <>{saigoScene(S_ALL_MOTIFS[i] ?? "", 45)}</>;
};

// 動き確認用 (1シーン200フレーム)。コマ = (文番号−1)*200 + 見たいf
export const SAIGO_MOTION_PER = 200;
export const SAIGO_MOTION_FRAMES = Math.max(S_ALL_MOTIFS.length * SAIGO_MOTION_PER, 1);
export const SaigoAllMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / SAIGO_MOTION_PER), S_ALL_MOTIFS.length - 1);
  return <>{saigoScene(S_ALL_MOTIFS[i] ?? "", frame - i * SAIGO_MOTION_PER)}</>;
};
