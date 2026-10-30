// 「私は何者?」4000年史の全シーン振り分け (マスター出口)。
// 自販機回の Jihanki2000Index と同じ方式: 各ブロックファイルは
// 「自分のmotifなら描く / 知らなければnull」を返すので ?? でつなぐ。
// W_ALL_MOTIFS は台本 (docs/watashi-script-v1.txt) の文#1〜#252 と1対1 (計252枚)。
// 締めのご挨拶 (自動追加の253文目) は assign.ts 側で w4_final_q を再利用する。

import React from "react";
import { AbsoluteFill } from "remotion";
import { KRP } from "./KarakuriScenes";
import { watashiB1Scene, W_B1_MOTIFS } from "./WatashiB1";
import { watashiB2Scene, W_B2_MOTIFS } from "./WatashiB2";
import { watashiB3Scene, W_B3_MOTIFS } from "./WatashiB3";
import { watashiB4Scene, W_B4_MOTIFS } from "./WatashiB4";

export const W_ALL_MOTIFS: string[] = [
  ...W_B1_MOTIFS, // 文#1〜#69 (導入+第1〜3章)
  ...W_B2_MOTIFS, // 文#70〜#119 (第4〜6章)
  ...W_B3_MOTIFS, // 文#120〜#185 (第7〜9章)
  ...W_B4_MOTIFS, // 文#186〜#252 (第10〜12章+結び)
];

export const WAllSceneView: React.FC<{ motif: string; f: number }> = ({ motif, f }) =>
  watashiB4Scene(motif, f) ??
  watashiB3Scene(motif, f) ??
  watashiB2Scene(motif, f) ??
  watashiB1Scene(motif, f) ?? (
    // ここに来たら motif 名の打ち間違い。真っ白事故を避けるためクリーム地だけ出す
    <AbsoluteFill style={{ background: KRP.cream }} />
  );
