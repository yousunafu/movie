// 「つながる世界史」からくり試作回: 取りまとめ (索引)。
// 文#1〜#19 の並び順はここが正本。担当ファイル (KseA〜D) はこの表に従うだけ。

import React from "react";
import { useCurrentFrame } from "remotion";
import { KSE_A_SCENES } from "./KseA";
import { KSE_B_SCENES } from "./KseB";
import { KSE_C_SCENES } from "./KseC";
import { KSE_D_SCENES } from "./KseD";

export const KSE_MOTIFS: string[] = [
  "ksa_op_tsunagaru",    // #1 時代が違っても、国が違っても、人の心は変わらない。…つながる世界史。
  "ksa_radio_1945",      // #2 1945年8月15日、正午。ラジオから、雑音まじりの声が流れました。
  "ksa_tenno_koe",       // #3 多くの日本人にとって、初めて聞く天皇の声でした。
  "ksa_gyokusai_yameta", // #4 その中に、「堪え難きを堪え、忍び難きを忍び」という一節が…戦争をやめました。
  "ksa_1988_iran",       // #5 43年後の1988年。イランでも、同じことが起きます。
  "ksb_khomeini_teisen", // #6 最後まで「勝つまでやめない」と言い続けた最高指導者ホメイニが、停戦を受け入れたのです。
  "ksb_doku_no_hai",     // #7 そのとき読み上げられた言葉が、「私は、毒の杯を飲み干した」。
  "ksb_notify_tsuyoki",  // #8 「一番強気だった人が、最後に負けを引き受けてる……」
  "ksb_yameru_to_iu",    // #9 そうです。戦争は、負ける側の誰かが「ここでやめる」と言わなければ、終わりません。
  "ksc_2026_ansatsu",    // #10 そして2026年。イランは、その最高指導者を、戦争で殺されました。
  "ksc_fuzai_endan",     // #11 後を継いだ息子は、8か月たった今も、公の場に姿を見せていません。…ほぼ文書だけです。
  "ksc_gyokuon_ji",      // #12 玉音放送の「玉音」とは、声のことです。
  "ksc_wakaremichi",     // #13 今のイランに、毒杯を飲むと言える「声」はあるのか。…忠臣蔵なのか。
  "ksc_nihonjin_seisai", // #14 さらに、この戦争の裏側で、ひとりの日本人がアメリカから制裁を受けています。
  "ksd_notify_nihonjin", // #15 「え、日本人が？ 何をしたの？」
  "ksd_ito_tsunagaru",   // #16 その話も、最後にひとつにつながります。
  "ksd_kata_kurabe",     // #17 先にお断りすると、…「型」を比べる話です。
  "ksd_notify_ima",      // #18 「そもそも、今どうなってるんだっけ？」
  "ksd_60byo_osarai",    // #19 60秒でおさらいします。
];

export const kseScene = (motif: string, f: number): React.ReactElement | null =>
  (KSE_A_SCENES[motif] ?? KSE_B_SCENES[motif] ?? KSE_C_SCENES[motif] ?? KSE_D_SCENES[motif])?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const KSE_PREVIEW_FRAMES = Math.max(KSE_MOTIFS.length, 1);
export const KsePreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, KSE_MOTIFS.length - 1);
  return <>{kseScene(KSE_MOTIFS[i] ?? "", 45)}</>;
};

// ===== 動き確認用: 1シーン 200フレーム ずつ通して再生する =====
// コマ番号 = (文番号 − 1) × 200 + 見たい f
export const KSE_MOTION_PER = 200;
export const KSE_MOTION_FRAMES = Math.max(KSE_MOTIFS.length * KSE_MOTION_PER, 1);
export const KseMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / KSE_MOTION_PER), KSE_MOTIFS.length - 1);
  return <>{kseScene(KSE_MOTIFS[i] ?? "", frame - i * KSE_MOTION_PER)}</>;
};
