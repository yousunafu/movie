// 作品名: なぜ人は、柔らかいものを握りたくなるのか
// (docs/yawarakai-script-v1.txt) の全体取りまとめ。
//
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。
//   台本の文 i → Y_ALL_MOTIFS[i-1] の絵。順番がずれると全部ずれる。
//   ※各ファイルの MOTIFS 配列だけ直しても絵は出ない。最後に scenes-data.json へ反映する。
//
// 検品プレビュー YawaAll: 1フレーム = 1シーン (f=45 の瞬間)。
//   コマ番号 (フレーム番号) = 文番号 − 1。

import React from "react";
import { useCurrentFrame } from "remotion";
import { YW_A_MOTIFS, yawaAScene } from "./YawaA";
import { YW_AB_MOTIFS, yawaAbScene } from "./YawaAb";
import { YW_B1_MOTIFS, yawaB1Scene } from "./YawaB1";
import { YW_B1B_MOTIFS, yawaB1bScene } from "./YawaB1b";
import { YW_C1_MOTIFS, yawaC1Scene } from "./YawaC1";
import { YW_C2_MOTIFS, yawaC2Scene } from "./YawaC2";
import { YW_C3_MOTIFS, yawaC3Scene } from "./YawaC3";
import { YW_D1_MOTIFS, yawaD1Scene } from "./YawaD1";
import { YW_D2_MOTIFS, yawaD2Scene } from "./YawaD2";
import { YW_D3_MOTIFS, yawaD3Scene } from "./YawaD3";
import { YW_D4_MOTIFS, yawaD4Scene } from "./YawaD4";
import { YW_E1_MOTIFS, yawaE1Scene } from "./YawaE1";
import { YW_E2_MOTIFS, yawaE2Scene } from "./YawaE2";
import { YW_E3_MOTIFS, yawaE3Scene } from "./YawaE3";
import { YW_E4_MOTIFS, yawaE4Scene } from "./YawaE4";
import { YW_F1_MOTIFS, yawaF1Scene } from "./YawaF1";
import { YW_F2_MOTIFS, yawaF2Scene } from "./YawaF2";
import { YW_F3_MOTIFS, yawaF3Scene } from "./YawaF3";
import { YW_F4_MOTIFS, yawaF4Scene } from "./YawaF4";
import { YW_G1_MOTIFS, yawaG1Scene } from "./YawaG1";
import { YW_G2_MOTIFS, yawaG2Scene } from "./YawaG2";
import { YW_G3_MOTIFS, yawaG3Scene } from "./YawaG3";
import { YW_G4_MOTIFS, yawaG4Scene } from "./YawaG4";

export const Y_ALL_MOTIFS: string[] = [
  ...YW_A_MOTIFS, // #1〜#10
  ...YW_AB_MOTIFS, // #11〜#18
  ...YW_B1_MOTIFS, // #19〜#28
  ...YW_B1B_MOTIFS, // #29〜#37
  ...YW_C1_MOTIFS, // #38〜#49
  ...YW_C2_MOTIFS, // #50〜#61
  ...YW_C3_MOTIFS, // #62〜#71
  ...YW_D1_MOTIFS, // #72〜#81
  ...YW_D2_MOTIFS, // #82〜#91
  ...YW_D3_MOTIFS, // #92〜#101
  ...YW_D4_MOTIFS, // #102〜#110
  ...YW_E1_MOTIFS, // #111〜#120
  ...YW_E2_MOTIFS, // #121〜#130
  ...YW_E3_MOTIFS, // #131〜#140
  ...YW_E4_MOTIFS, // #141〜#147
  ...YW_F1_MOTIFS, // #148〜#157
  ...YW_F2_MOTIFS, // #158〜#167
  ...YW_F3_MOTIFS, // #168〜#177
  ...YW_F4_MOTIFS, // #178〜#184
  ...YW_G1_MOTIFS, // #185〜#196
  ...YW_G2_MOTIFS, // #197〜#208
  ...YW_G3_MOTIFS, // #209〜#220
  ...YW_G4_MOTIFS, // #221〜#233
];

export const yawaScene = (motif: string, f: number): React.ReactElement | null =>
  yawaAScene(motif, f) ??
  yawaAbScene(motif, f) ??
  yawaB1Scene(motif, f) ??
  yawaB1bScene(motif, f) ??
  yawaC1Scene(motif, f) ??
  yawaC2Scene(motif, f) ??
  yawaC3Scene(motif, f) ??
  yawaD1Scene(motif, f) ??
  yawaD2Scene(motif, f) ??
  yawaD3Scene(motif, f) ??
  yawaD4Scene(motif, f) ??
  yawaE1Scene(motif, f) ??
  yawaE2Scene(motif, f) ??
  yawaE3Scene(motif, f) ??
  yawaE4Scene(motif, f) ??
  yawaF1Scene(motif, f) ??
  yawaF2Scene(motif, f) ??
  yawaF3Scene(motif, f) ??
  yawaF4Scene(motif, f) ??
  yawaG1Scene(motif, f) ??
  yawaG2Scene(motif, f) ??
  yawaG3Scene(motif, f) ??
  yawaG4Scene(motif, f);

export const YAWA_ALL_PREVIEW_FRAMES = Math.max(Y_ALL_MOTIFS.length, 1);
export const YawaAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Y_ALL_MOTIFS.length - 1);
  return <>{yawaScene(Y_ALL_MOTIFS[i] ?? "", 45)}</>;
};

// 動き確認用 (1シーン200フレーム)。コマ = (文番号−1)*200 + 見たいf
export const YAWA_MOTION_PER = 200;
export const YAWA_MOTION_FRAMES = Math.max(Y_ALL_MOTIFS.length * YAWA_MOTION_PER, 1);
export const YawaAllMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / YAWA_MOTION_PER), Y_ALL_MOTIFS.length - 1);
  return <>{yawaScene(Y_ALL_MOTIFS[i] ?? "", frame - i * YAWA_MOTION_PER)}</>;
};
