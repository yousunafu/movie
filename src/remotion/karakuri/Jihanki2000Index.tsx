// 自販機2000年史の全シーン振り分け (マスター出口)。
// 章ファイルが増えたらここに ?? でつなぐ (循環importを避けるため、各章ファイルは
// 「自分のmotifなら描く / 知らなければnull」を返す方式)。

import React from "react";
import { Jihanki2000SceneView, J2_PREVIEW_MOTIFS } from "./Jihanki2000Scenes";
import { j2Ch2to4Scene, J2_CH2TO4_MOTIFS } from "./Jihanki2000Ch2to4";
import { j2Ch4Scene, J2_CH4_MOTIFS } from "./Jihanki2000Ch4";
import { j2Ch5to6Scene, J2_CH5TO6_MOTIFS } from "./Jihanki2000Ch5to6";
import { j2Ch7to8Scene, J2_CH7TO8_MOTIFS } from "./Jihanki2000Ch7to8";
import { j2Ch9to10Scene, J2_CH9TO10_MOTIFS } from "./Jihanki2000Ch9to10";
import { j2Ch11to12Scene, J2_CH11TO12_MOTIFS } from "./Jihanki2000Ch11to12";

export const J2_ALL_MOTIFS: string[] = [
  ...J2_PREVIEW_MOTIFS, ...J2_CH2TO4_MOTIFS, ...J2_CH4_MOTIFS,
  ...J2_CH5TO6_MOTIFS, ...J2_CH7TO8_MOTIFS,
  ...J2_CH9TO10_MOTIFS, ...J2_CH11TO12_MOTIFS,
];

export const J2AllSceneView: React.FC<{ motif: string; f: number }> = ({ motif, f }) =>
  j2Ch11to12Scene(motif, f) ??
  j2Ch9to10Scene(motif, f) ??
  j2Ch7to8Scene(motif, f) ??
  j2Ch5to6Scene(motif, f) ??
  j2Ch4Scene(motif, f) ??
  j2Ch2to4Scene(motif, f) ??
  <Jihanki2000SceneView motif={motif} f={f} />;
