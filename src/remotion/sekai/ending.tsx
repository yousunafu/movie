// 作風 sekai の終わりの1枚。
// ★2026-11-09 不具合: motif "ending" の絵が無く、最後の5秒が
//   「絵 未実装: ending」の点線枠のまま納品されていた。ここで埋める。
// 作り込み版・廉価版の両方で同じ物を使う (終わりはチャンネルの顔なので差をつけない)。

import React from "react";
import { SKP, SEKAI_SERIF, SekaiGround, seg, easeOut, W, H } from "./parts";
import type { SekaiArt } from "./world";

// 夜が明けきらない地平。弧がゆっくり明るくなって、チャンネル名が立つ。
const SekaiEnding: SekaiArt = ({ f }) => {
  const rise = easeOut(seg(f, 0, 46));
  const name = easeOut(seg(f, 18, 60));
  const rule = easeOut(seg(f, 34, 78));
  const CY = 1560; // 地球の中心 (画面のはるか下)
  const R = 760;
  return (
    <>
      <SekaiGround f={f} />

      {/* 地平の弧。下からの照り返しだけが残っている */}
      <defs>
        <radialGradient id="sekai-end-glow" cx="50%" cy="100%" r="62%">
          <stop offset="0%" stopColor="#C98A3C" stopOpacity={0.34 * rise} />
          <stop offset="100%" stopColor="#C98A3C" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={H - 560} width={W} height={560} fill="url(#sekai-end-glow)" />
      <circle cx={W / 2} cy={CY} r={R} fill={SKP.sumiDeep} />
      <circle
        cx={W / 2}
        cy={CY}
        r={R}
        fill="none"
        stroke={SKP.kinariDim}
        strokeWidth={2.6}
        opacity={0.55 * rise}
      />
      {/* 弧の上に小さな灯が4つ。遠い国にも人が住んでいる、という念押し */}
      {[-470, -150, 190, 520].map((dx, i) => {
        const t = easeOut(seg(f, 26 + i * 7, 56 + i * 7));
        const ang = dx / R;
        const x = W / 2 + Math.sin(ang) * R;
        const y = CY - Math.cos(ang) * R;
        return (
          <circle key={dx} cx={x} cy={y} r={4.4} fill={SKP.kohaku} opacity={t * 0.9} />
        );
      })}

      {/* 錆朱の細い罫を1本。sekai の画面はここだけ強い色 */}
      <rect
        x={W / 2 - 230 * rule}
        y={706}
        width={460 * rule}
        height={4}
        fill={SKP.sabi}
      />

      <text
        x={W / 2}
        y={648}
        textAnchor="middle"
        fontFamily={SEKAI_SERIF}
        fontSize={78}
        fontWeight={700}
        fill={SKP.kinari}
        letterSpacing={14}
        opacity={name}
      >
        つながる世界史
      </text>
    </>
  );
};

export const GROUP_END: Record<string, SekaiArt> = {
  ending: SekaiEnding,
};
