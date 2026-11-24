// 「名前を奪われる」のは、なぜあんなに怖いのか (docs/namae-script-v1.txt) の全体取りまとめ。
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。台本の文 i → N_ALL_MOTIFS[i-1]。
// 検品プレビュー NamaeAll: 1フレーム = 1シーン (f=45)。コマ番号 = 文番号 − 1。

import React from "react";
import { useCurrentFrame } from "remotion";
import { NM_A_MOTIFS, namaeAScene } from "./NamaeA";
import { NM_AB_MOTIFS, namaeAbScene } from "./NamaeAb";
import { NM_AC_MOTIFS, namaeAcScene } from "./NamaeAc";
import { NM_B1_MOTIFS, namaeB1Scene } from "./NamaeB1";
import { NM_B1B_MOTIFS, namaeB1bScene } from "./NamaeB1b";
import { NM_B1C_MOTIFS, namaeB1cScene } from "./NamaeB1c";
import { NM_C1_MOTIFS, namaeC1Scene } from "./NamaeC1";
import { NM_C1B_MOTIFS, namaeC1bScene } from "./NamaeC1b";
import { NM_C1C_MOTIFS, namaeC1cScene } from "./NamaeC1c";
import { NM_D1_MOTIFS, namaeD1Scene } from "./NamaeD1";
import { NM_D1B_MOTIFS, namaeD1bScene } from "./NamaeD1b";
import { NM_D1C_MOTIFS, namaeD1cScene } from "./NamaeD1c";
import { NM_E1_MOTIFS, namaeE1Scene } from "./NamaeE1";
import { NM_E1B_MOTIFS, namaeE1bScene } from "./NamaeE1b";
import { NM_F1_MOTIFS, namaeF1Scene } from "./NamaeF1";
import { NM_F1B_MOTIFS, namaeF1bScene } from "./NamaeF1b";
import { NM_G1_MOTIFS, namaeG1Scene } from "./NamaeG1";
import { NM_G1B_MOTIFS, namaeG1bScene } from "./NamaeG1b";
import { NM_G1C_MOTIFS, namaeG1cScene } from "./NamaeG1c";
import { NM_H1_MOTIFS, namaeH1Scene } from "./NamaeH1";
import { NM_H1B_MOTIFS, namaeH1bScene } from "./NamaeH1b";
import { NM_H1C_MOTIFS, namaeH1cScene } from "./NamaeH1c";
import { NM_H1D_MOTIFS, namaeH1dScene } from "./NamaeH1d";
import { NM_I1_MOTIFS, namaeI1Scene } from "./NamaeI1";
import { NM_I1B_MOTIFS, namaeI1bScene } from "./NamaeI1b";
import { NM_I1C_MOTIFS, namaeI1cScene } from "./NamaeI1c";
import { NM_J1_MOTIFS, namaeJ1Scene } from "./NamaeJ1";
import { NM_J1B_MOTIFS, namaeJ1bScene } from "./NamaeJ1b";

export const N_ALL_MOTIFS: string[] = [
  ...NM_A_MOTIFS, // #1〜#9
  ...NM_AB_MOTIFS, // #10〜#18
  ...NM_AC_MOTIFS, // #19〜#26
  ...NM_B1_MOTIFS, // #27〜#35
  ...NM_B1B_MOTIFS, // #36〜#44
  ...NM_B1C_MOTIFS, // #45〜#52
  ...NM_C1_MOTIFS, // #53〜#61
  ...NM_C1B_MOTIFS, // #62〜#69
  ...NM_C1C_MOTIFS, // #70〜#77
  ...NM_D1_MOTIFS, // #78〜#85
  ...NM_D1B_MOTIFS, // #86〜#93
  ...NM_D1C_MOTIFS, // #94〜#100
  ...NM_E1_MOTIFS, // #101〜#107
  ...NM_E1B_MOTIFS, // #108〜#113
  ...NM_F1_MOTIFS, // #114〜#123
  ...NM_F1B_MOTIFS, // #124〜#133
  ...NM_G1_MOTIFS, // #134〜#142
  ...NM_G1B_MOTIFS, // #143〜#151
  ...NM_G1C_MOTIFS, // #152〜#159
  ...NM_H1_MOTIFS, // #160〜#168
  ...NM_H1B_MOTIFS, // #169〜#176
  ...NM_H1C_MOTIFS, // #177〜#185
  ...NM_H1D_MOTIFS, // #186〜#193
  ...NM_I1_MOTIFS, // #194〜#202
  ...NM_I1B_MOTIFS, // #203〜#211
  ...NM_I1C_MOTIFS, // #212〜#222
  ...NM_J1_MOTIFS, // #223〜#233
  ...NM_J1B_MOTIFS, // #234〜#244
];

export const namaeScene = (motif: string, f: number): React.ReactElement | null =>
  namaeAScene(motif, f) ??
  namaeAbScene(motif, f) ??
  namaeAcScene(motif, f) ??
  namaeB1Scene(motif, f) ??
  namaeB1bScene(motif, f) ??
  namaeB1cScene(motif, f) ??
  namaeC1Scene(motif, f) ??
  namaeC1bScene(motif, f) ??
  namaeC1cScene(motif, f) ??
  namaeD1Scene(motif, f) ??
  namaeD1bScene(motif, f) ??
  namaeD1cScene(motif, f) ??
  namaeE1Scene(motif, f) ??
  namaeE1bScene(motif, f) ??
  namaeF1Scene(motif, f) ??
  namaeF1bScene(motif, f) ??
  namaeG1Scene(motif, f) ??
  namaeG1bScene(motif, f) ??
  namaeG1cScene(motif, f) ??
  namaeH1Scene(motif, f) ??
  namaeH1bScene(motif, f) ??
  namaeH1cScene(motif, f) ??
  namaeH1dScene(motif, f) ??
  namaeI1Scene(motif, f) ??
  namaeI1bScene(motif, f) ??
  namaeI1cScene(motif, f) ??
  namaeJ1Scene(motif, f) ??
  namaeJ1bScene(motif, f);

export const NAMAE_ALL_PREVIEW_FRAMES = Math.max(N_ALL_MOTIFS.length, 1);
export const NamaeAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, N_ALL_MOTIFS.length - 1);
  return <>{namaeScene(N_ALL_MOTIFS[i] ?? "", 45)}</>;
};

// 動き確認用 (1シーン200フレーム)。コマ = (文番号−1)*200 + 見たいf
export const NAMAE_MOTION_PER = 200;
export const NAMAE_MOTION_FRAMES = Math.max(N_ALL_MOTIFS.length * NAMAE_MOTION_PER, 1);
export const NamaeAllMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / NAMAE_MOTION_PER), N_ALL_MOTIFS.length - 1);
  return <>{namaeScene(N_ALL_MOTIFS[i] ?? "", frame - i * NAMAE_MOTION_PER)}</>;
};
