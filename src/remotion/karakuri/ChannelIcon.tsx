// からくりチャンネルのアイコン (YouTube 800×800・表示は丸切り抜き)。本編とは無関係。
// ★決定版 = D (2026-11-25)。案: A 笑顔アップ / B 青地に歯車からひょっこり / C 放射線の前でバンザイ / D 驚き顔の超アップ (黄) / E 同 (青)
// 書き出し: npx remotion still src/remotion/index.ts ChannelIconA <out.png> --frame=0
// 見比べ:   npx remotion still src/remotion/index.ts ChannelIconSheet <out.png> --frame=0

import React from "react";
import { AbsoluteFill } from "remotion";
import { KRP, KARAKURI_FONT, Person } from "./KarakuriScenes";
import { Gear, Sparkle } from "./ChannelHeader";

export const ICON = 800;
const INK = KRP.ink;
type Variant = "A" | "B" | "C" | "D" | "E";

const Dots: React.FC<{ color: string; opacity?: number }> = ({ color, opacity = 0.45 }) => (
  <g>
    {Array.from({ length: 15 }).map((_, r) =>
      Array.from({ length: 15 }).map((__, c) => (
        <circle key={`${r}-${c}`} cx={c * 60 + (r % 2 ? 30 : 0)} cy={r * 58} r={8} fill={color} opacity={opacity} />
      )),
    )}
  </g>
);

// 800×800 の座標で描く中身
export const IconArt: React.FC<{ v: Variant }> = ({ v }) => {
  if (v === "A") {
    // 顔アップ。頭の後ろに大きな歯車 (後光のように)
    const s = 2.55;
    const headY = 372;
    return (
      <g>
        <rect width={ICON} height={ICON} fill={KRP.yellow} />
        <Dots color="#FFFFFF" />
        <Gear x={400} y={headY} r={318} teeth={14} fill={KRP.orange} rot={6} />
        <Person x={400} y={headY + 228 * s} s={s} face="joy" still />
        <Sparkle x={150} y={150} s={1.6} />
        <Sparkle x={668} y={186} s={1.1} fill={KRP.white} />
      </g>
    );
  }
  if (v === "D" || v === "E") {
    // 驚き顔のもっとアップ。D = 黄色地+オレンジ歯車 / E = 青地+金の歯車
    const s = 3.35;
    const headY = 410;
    const blue = v === "E";
    return (
      <g>
        <rect width={ICON} height={ICON} fill={blue ? KRP.blueDeep : KRP.yellow} />
        <Dots color="#FFFFFF" opacity={blue ? 0.22 : 0.45} />
        <Gear x={400} y={headY - 10} r={318} teeth={15} fill={blue ? KRP.brass : KRP.orange} rot={4} />
        <Person x={400} y={headY + 228 * s} s={s} face="surprised" still />
        {/* びっくりの線 */}
        {[-1, 1].map((side) => (
          <g key={side} stroke={INK} strokeWidth={14} strokeLinecap="round">
            <line x1={400 + side * 255} y1={178} x2={400 + side * 285} y2={130} />
            <line x1={400 + side * 300} y1={245} x2={400 + side * 345} y2={225} />
            <line x1={400 + side * 196} y1={128} x2={400 + side * 206} y2={78} />
          </g>
        ))}
      </g>
    );
  }
  if (v === "B") {
    // 青地。手前の歯車の向こうから、にっこり顔を出す
    const s = 2.3;
    const headY = 330;
    return (
      <g>
        <rect width={ICON} height={ICON} fill={KRP.blueDeep} />
        <Dots color="#FFFFFF" opacity={0.22} />
        <Person x={400} y={headY + 228 * s} s={s} face="smile" gaze={[0, 0]} still />
        <Gear x={640} y={730} r={230} teeth={12} fill={KRP.brass} rot={4} />
        <Gear x={150} y={760} r={170} teeth={10} fill={KRP.silver} rot={-8} />
        <Sparkle x={150} y={190} s={1.5} fill={KRP.yellow} />
        <Sparkle x={668} y={220} s={1.1} />
      </g>
    );
  }
  // C: 放射線の前でバンザイ (全身)
  const rays = 18;
  return (
    <g>
      <rect width={ICON} height={ICON} fill={KRP.yellow} />
      {Array.from({ length: rays }).map((_, i) => {
        const a0 = (i / rays) * Math.PI * 2;
        const a1 = ((i + 0.5) / rays) * Math.PI * 2;
        const R = 700;
        return i % 1 === 0 ? (
          <polygon key={i}
            points={`400,420 ${400 + Math.cos(a0) * R},${420 + Math.sin(a0) * R} ${400 + Math.cos(a1) * R},${420 + Math.sin(a1) * R}`}
            fill={KRP.orange} opacity={0.55} />
        ) : null;
      })}
      <circle cx={400} cy={420} r={250} fill={KRP.cream} stroke={INK} strokeWidth={8} />
      <Person x={400} y={640} s={1.5} pose="banzai" face="joy" still />
      <Sparkle x={196} y={250} s={1.3} />
      <Sparkle x={612} y={236} s={1.6} fill={KRP.red} />
    </g>
  );
};

const Icon: React.FC<{ v: Variant }> = ({ v }) => (
  <AbsoluteFill>
    <svg width={ICON} height={ICON} viewBox={`0 0 ${ICON} ${ICON}`}>
      <IconArt v={v} />
    </svg>
  </AbsoluteFill>
);
export const ChannelIconA: React.FC = () => <Icon v="A" />;
export const ChannelIconB: React.FC = () => <Icon v="B" />;
export const ChannelIconC: React.FC = () => <Icon v="C" />;
export const ChannelIconD: React.FC = () => <Icon v="D" />;
export const ChannelIconE: React.FC = () => <Icon v="E" />;

// 見比べ用 (1920×1080): 丸切り抜き大 + 実寸に近い小さい表示 (98px / 40px)
export const ChannelIconSheet: React.FC = () => {
  const vs: Variant[] = ["A", "D", "E"];
  const big = 440;
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <svg width={1920} height={1080}>
        <defs>
          <clipPath id="circ"><circle cx={400} cy={400} r={400} /></clipPath>
        </defs>
        {vs.map((v, i) => {
          const x = 140 + i * 600;
          return (
            <g key={v}>
              <text x={x + big / 2} y={110} textAnchor="middle" fontFamily={KARAKURI_FONT} fontWeight={900} fontSize={52} fill={INK}>
                案{v}
              </text>
              <g transform={`translate(${x} 150) scale(${big / ICON})`}>
                <g clipPath="url(#circ)"><IconArt v={v} /></g>
              </g>
              {/* 小さい表示 (チャンネルページ / コメント欄くらい) */}
              <g transform={`translate(${x + 60} 680) scale(${98 / ICON})`}>
                <g clipPath="url(#circ)"><IconArt v={v} /></g>
              </g>
              <g transform={`translate(${x + 200} 710) scale(${40 / ICON})`}>
                <g clipPath="url(#circ)"><IconArt v={v} /></g>
              </g>
              <text x={x + 60 + 49} y={820} textAnchor="middle" fontFamily={KARAKURI_FONT} fontSize={24} fill={KRP.grayDark}>98px</text>
              <text x={x + 200 + 20} y={820} textAnchor="middle" fontFamily={KARAKURI_FONT} fontSize={24} fill={KRP.grayDark}>40px</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
