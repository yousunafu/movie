// からくりチャンネルの「終わりの絵」(全回共通のエンディング)。
// 2026-11-26 作者「1番最後のイラストを、こないだつくったからくりチャンネルのヘッダーの画像を使った終わりイラストを別でつくりたい。
//   またみてね！みたいな文とかも入るといいかも」「これからもそうしたい」
// 2026-11-26 v2 のあと作者「最後のイラストはもう少しだけシンプルにしたいかも」
//   → ヘッダーの左右の小さなコマ6つをやめ、真ん中の題字パネル (からくりチャンネル+合言葉) だけを大きく。
//     背景はヘッダーと同じ黄色の水玉、歯車は左上と右下に1組ずつ。
// 題字パネルはヘッダー決定版 (ChannelHeader.tsx) の物をそのまま切り抜いて使う (見た目のブレ禁止)。
// 下の方 (y>854) には終わりのナレーションの字幕が乗るので、パネルと文字はその上に収める。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { KRP, KARAKURI_FONT, seg, pop, easeOut, clamp01, Atmosphere } from "./KarakuriScenes";
import { ChannelHeader, Gear, Sparkle } from "./ChannelHeader";

// ヘッダー (2560×1440) の中の題字パネルの範囲 (少し余白込み)
const TP = { x: 806, y: 534, w: 958, h: 382 }; // パネルの外の帯の色が見えないよう、パネル+影ぎりぎりで切る
const SC = 1.22; // 画面での大きさ (幅 ≈ 1180px)

// 背景の色の候補 (2026-11-26 作者「背景少しうすくできない？薄い黄色というか。これもパターンでください」)
export const ENDING_BG = {
  A: { base: "#F8E08A", dot: "#FFFFFF", dotOp: 0.5 },  // 少し薄い黄色
  B: { base: "#FBEBB2", dot: "#FFFFFF", dotOp: 0.6 },  // 薄い黄色
  C: { base: "#FCF3D2", dot: "#F2D27A", dotOp: 0.45 }, // クリームに黄色の水玉
  D: { base: "#FFF8E6", dot: "#F6DC8E", dotOp: 0.5 },  // ほぼ白に近いクリーム
} as const;
export type EndingBg = keyof typeof ENDING_BG;

export const KarakuriEnding: React.FC<{ f: number; bg?: EndingBg | "header" }> = ({ f, bg = "B" }) => { // 2026-11-26 作者が B (薄い黄色) に決定
  const pal = bg === "header" ? { base: KRP.yellow, dot: "#FFFFFF", dotOp: 0.45 } : ENDING_BG[bg];
  const enter = pop(seg(f, 2, 16));
  const breathe = 1 + 0.012 * Math.sin(f / 18);
  const word = "またみてね！";
  const pw = TP.w * SC, ph = TP.h * SC;
  const cx = 960, cy = 560;
  return (
    <AbsoluteFill style={{ background: pal.base, overflow: "hidden" }}>
      {/* 背景: ヘッダーと同じ黄色の水玉と、歯車1組ずつ */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 20 }, (_, r) => Array.from({ length: 34 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={c * 60 + (r % 2 ? 30 : 0)} cy={r * 58} r={7} fill={pal.dot} opacity={pal.dotOp} />
        )))}
        <Gear x={150} y={170} r={96} teeth={12} fill={KRP.orange} rot={6 + f * 1.2} />
        <Gear x={292} y={250} r={50} teeth={8} fill={KRP.white} rot={-10 - f * 2.3} />
        <Gear x={1790} y={900} r={104} teeth={12} fill={KRP.blueDeep} rot={12 - f * 1.1} />
        <Gear x={1636} y={834} r={50} teeth={8} fill={KRP.white} rot={4 + f * 2.3} />
        {[[1700, 150, 1.3, KRP.white], [240, 860, 1.1, KRP.orange]].map(([x, y, s, c], i) => {
          const tw = 0.55 + 0.45 * Math.abs(Math.sin((f + i * 17) / 12));
          return <Sparkle key={i} x={x as number} y={y as number} s={(s as number) * tw} fill={c as string} />;
        })}
      </svg>
      {/* 真ん中: ヘッダーの題字パネルだけを切り抜いて大きく */}
      <div style={{
        position: "absolute", left: cx - pw / 2, top: cy - ph / 2, width: pw, height: ph, overflow: "hidden", borderRadius: 44 * SC,
        transform: `scale(${enter * breathe})`, transformOrigin: "50% 50%",
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, width: 2560, height: 1440,
          transform: `scale(${SC}) translate(${-TP.x}px, ${-TP.y}px)`, transformOrigin: "0 0",
        }}>
          <ChannelHeader />
        </div>
      </div>
      {/* またみてね！ (パネルの上。1文字ずつ弾んで出る) */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 96, display: "flex", justifyContent: "center",
        fontFamily: KARAKURI_FONT, fontWeight: 900, fontSize: 124, letterSpacing: 6,
      }}>
        {word.split("").map((ch, i) => {
          const t = clamp01(seg(f, 12 + i * 4, 24 + i * 4));
          const bob = t >= 1 ? Math.sin((f - i * 6) / 7) * 5 : 0;
          return (
            <span key={i} style={{
              display: "inline-block", color: i === word.length - 1 ? KRP.red : KRP.white,
              WebkitTextStroke: `9px ${KRP.ink}`, paintOrder: "stroke fill",
              transform: `translateY(${(1 - pop(t)) * -70 + bob}px) scale(${0.4 + 0.6 * pop(t)})`,
              opacity: t > 0 ? 1 : 0,
              textShadow: `0 7px 0 rgba(59,51,44,0.25)`,
            }}>{ch}</span>
          );
        })}
      </div>
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};
void easeOut;

// 背景の色を見比べる検品用 (1コマ = 1パターン。f=70 の絵)
export const KarakuriEndingBgPreview: React.FC = () => {
  const fr = useCurrentFrame();
  const keys: EndingBg[] = ["A", "B", "C", "D"];
  return <KarakuriEnding f={70} bg={keys[Math.min(fr, 3)]} />;
};
