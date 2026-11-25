// 「人は、なぜ暇をつぶすのか」の効果音表 (saigoSe.ts と同じしくみ)。
// motif 名 → そのシーンの何コマ目で何を鳴らすか。ここに無い motif は空配列で、他の回には影響しない。
// 2026-11-26 作者「イラストがボタンを押してビリっとするときに、画面が揺れる演出とビリって音効果音にないかな？」
// 音: 効果音ラボ「電気バチバチ」(various/electricity1.mp3) の頭0.55秒を切り出したもの (electricity1-biri.mp3)
import type { SaigoSeCue } from "./saigoSe";

const BIRI = "se/various/electricity1-biri.mp3";
const biri = (at: number, volume = 0.6): SaigoSeCue => ({ file: BIRI, at, volume });

export const HIMA_SE: Record<string, SaigoSeCue[]> = {
  // 押した瞬間のコマは、絵師の報告 (第1回修正) から
  hm_005: [biri(36)],                                              // #5 はじめて押す
  hm_009: [5, 12, 17, 29, 41].map((t) => biri(t, 0.42)),             // #9 190回の連打 (小さめに5回)
  hm_172: [biri(20, 0.5)],                                         // #172 ちょんと押す
  hm_178: [4, 14, 24, 34, 44, 54, 64].map((t) => biri(t, 0.35)),     // #178 退屈な映像を見ながら何度も押す
};
void biri;
