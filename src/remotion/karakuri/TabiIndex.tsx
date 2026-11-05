// 作品名: 旅とお土産の歴史
// 「旅とお土産の歴史」の全シーン振り分け (マスター出口)。
// 「私は何者?」回の WatashiIndex と同じ方式: 各ブロックファイルは
// 「自分のmotifなら描く / 知らなければnull」を返すので ?? でつなぐ。
// T_ALL_MOTIFS は台本 (docs/tabi-miyage-script-v1.txt) の文#1〜#224 と1対1 (計224枚)。
// 締めのご挨拶 (自動追加の225文目) は tb5 の結び絵を再利用する (scenes-data 反映時に対応)。
// ※ B6 は後から挿入した第10章「発明された『伝統』」。再生順は B4 → B6 → B5。

import React from "react";
import { AbsoluteFill } from "remotion";
import { KRP } from "./KarakuriScenes";
import { tabiB1Scene, T_B1_MOTIFS } from "./TabiB1";
import { tabiB2Scene, T_B2_MOTIFS } from "./TabiB2";
import { tabiB3Scene, T_B3_MOTIFS } from "./TabiB3";
import { tabiB4Scene, T_B4_MOTIFS } from "./TabiB4";
import { tabiB5Scene, T_B5_MOTIFS } from "./TabiB5";
import { tabiB6Scene, T_B6_MOTIFS } from "./TabiB6";

export const T_ALL_MOTIFS: string[] = [
  ...T_B1_MOTIFS, // 文#1〜#53 (序章+第1〜2章)
  ...T_B2_MOTIFS, // 文#54〜#96 (第3〜4章)
  ...T_B3_MOTIFS, // 文#97〜#138 (第5〜7章)
  ...T_B4_MOTIFS, // 文#139〜#174 (第8〜9章)
  ...T_B6_MOTIFS, // 文#175〜#194 (第10章 発明された「伝統」・挿入章)
  ...T_B5_MOTIFS, // 文#195〜#224 (第11章+結章)
];

export const TAllSceneView: React.FC<{ motif: string; f: number }> = ({ motif, f }) =>
  tabiB6Scene(motif, f) ??
  tabiB5Scene(motif, f) ??
  tabiB4Scene(motif, f) ??
  tabiB3Scene(motif, f) ??
  tabiB2Scene(motif, f) ??
  tabiB1Scene(motif, f) ?? (
    // ここに来たら motif 名の打ち間違い。真っ白事故を避けるためクリーム地だけ出す
    <AbsoluteFill style={{ background: KRP.cream }} />
  );
