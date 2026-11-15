// 作品名: 「2位」は、120年前に発明された
// (docs/ichiban-script-v1.txt・219文) の全体取りまとめ。
//   #1〜#20    序      1位を決めたい生きもの           = IchiB0.tsx
//   #21〜#35   第1章   勝ちたい気持ちは本能            = IchiB1.tsx
//   #36〜#47   第2章   一番槍は書類仕事                = IchiB2.tsx
//   #48〜#62   第3章   1300年前の全国模試              = IchiB3.tsx
//   #63〜#77   第4章   首席は英雄 ビリには木のスプーン = IchiB4.tsx
//   #78〜#102  第5章   番付はあれど優勝はなし          = IchiB5.tsx
//   #103〜#122 第6章   2位が発明された日               = IchiB6.tsx
//   #123〜#142 第7章   毎年日本一は新聞がつくった      = IchiB7.tsx
//   #143〜#162 第8章   全国民 同じ物差しへ             = IchiB8.tsx
//   #163〜#187 第9章   なぜ順位はこんなに刺さるのか    = IchiB9.tsx
//   #188〜#199 第10章  池が地球サイズになった          = IchiB10.tsx
//   #200〜#219 結び    順位は作り変えられる            = IchiB11.tsx
//
// ★絵の正本はここで繋いだ motif の並び (からくり憲法 第11条)。
//   台本の文 i → I_ALL_MOTIFS[i] の絵。順番がずれると全部ずれるので、
//   章を足したときは必ず下の並びに追加すること。
//   ※各章の MOTIFS 配列だけ直しても絵は出ない。ここに繋がって初めて絵になる。

import React from "react";
import { useCurrentFrame } from "remotion";
import { I_B0_MOTIFS, ichiB0Scene } from "./IchiB0";
import { I_B1_MOTIFS, ichiB1Scene } from "./IchiB1";
import { I_B2_MOTIFS, ichiB2Scene } from "./IchiB2";
import { I_B3_MOTIFS, ichiB3Scene } from "./IchiB3";
import { I_B4_MOTIFS, ichiB4Scene } from "./IchiB4";
import { I_B5_MOTIFS, ichiB5Scene } from "./IchiB5";
import { I_B6_MOTIFS, ichiB6Scene } from "./IchiB6";
import { I_B7_MOTIFS, ichiB7Scene } from "./IchiB7";
import { I_B8_MOTIFS, ichiB8Scene } from "./IchiB8";
import { I_B9_MOTIFS, ichiB9Scene } from "./IchiB9";
import { I_B10_MOTIFS, ichiB10Scene } from "./IchiB10";
import { I_B11_MOTIFS, ichiB11Scene } from "./IchiB11";

export const I_ALL_MOTIFS: string[] = [
  ...I_B0_MOTIFS, // 序      #1〜#20
  ...I_B1_MOTIFS, // 第1章   #21〜#35
  ...I_B2_MOTIFS, // 第2章   #36〜#47
  ...I_B3_MOTIFS, // 第3章   #48〜#62
  ...I_B4_MOTIFS, // 第4章   #63〜#77
  ...I_B5_MOTIFS, // 第5章   #78〜#102
  ...I_B6_MOTIFS, // 第6章   #103〜#122
  ...I_B7_MOTIFS, // 第7章   #123〜#142
  ...I_B8_MOTIFS, // 第8章   #143〜#162
  ...I_B9_MOTIFS, // 第9章   #163〜#187
  ...I_B10_MOTIFS, // 第10章  #188〜#199
  ...I_B11_MOTIFS, // 結び    #200〜#219
];

export const ichiScene = (motif: string, f: number): React.ReactElement | null =>
  ichiB0Scene(motif, f) ??
  ichiB1Scene(motif, f) ??
  ichiB2Scene(motif, f) ??
  ichiB3Scene(motif, f) ??
  ichiB4Scene(motif, f) ??
  ichiB5Scene(motif, f) ??
  ichiB6Scene(motif, f) ??
  ichiB7Scene(motif, f) ??
  ichiB8Scene(motif, f) ??
  ichiB9Scene(motif, f) ??
  ichiB10Scene(motif, f) ??
  ichiB11Scene(motif, f);

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_ALL_PREVIEW_FRAMES = Math.max(I_ALL_MOTIFS.length, 1);
export const IchiAllPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_ALL_MOTIFS.length - 1);
  return <>{ichiScene(I_ALL_MOTIFS[i] ?? "", 45)}</>;
};
