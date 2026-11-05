// 「なぜ高層ビルは生まれたのか」: 第3章「水は、勝手に上がらない。」中盤 (桶の作り〜軸〜出ていく水)
// 担当範囲: 台本 docs/koso-script-v7.txt の 125〜135行目 (文#124〜#134・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb3_ で始める。WobbleDefs の seed はこのファイルでは 711〜721 を使う。
// 設計書: docs/koso-ch3-design.md (1文ごとの「格」と絵の中身が決まっている)
//
// ★絵の「格」(制作ガイド §7 第3層-7)
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = クリーム地に図と札だけ。人も背景も置かない (25〜50行)
//   ★「図」「並」も品質は落とさない。短いのは賑やかさを削ったからで、雑に描いたからではない。
//     線・色・札・フォントは山と完全に同じ。必ず f で動く。図そのものを作り込む。
//     大きく置いて画面を使い切る (「小さい物を真ん中にポツンと」が最悪の失敗)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。

import React from "react";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, TowerOnPillars } from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。金物の色は BP を使う)
// ===================================================================
const C = {
  skyDay: "#CFE2F0",
  skyHaze: "#E2EAEF",
  skyDusk: "#F0CBA0",
  water: "#7FB4D8",
  waterDeep: "#4E87B0",
  waterPale: "#BFDCEE",
  wood: "#A77C4E",
  woodDark: "#7E5B36",
  woodWet: "#6B4A2E",
  brick: "#B4704C",
  stone: "#CFC6B4",
  tile: "#DCD6C6",
  plaster: "#E6DFCE",
  glass: "#AFC6D4",
  rust: "#8E5A3C",
  ink2: "#3A4350",
} as const;

// ===================================================================
// このファイルだけの部品 — 木の給水桶 (形はこの回で固定。別担当も同じ形を描く)
//   縦板28枚 / 鋼のたが3本 (ターンバックル付き) / 円錐の屋根 (頂点に通気) /
//   4本脚の木の台座 (筋交い) / 側面から下へ給水の立管1本
// ===================================================================
const STAVES = 28;

/** 板1枚の木目 (筋と節)。寄りの絵でだけ呼ぶ */
const Grain: React.FC<{
  x: number; y: number; w: number; h: number; seed: number; wet?: number;
}> = ({ x, y, w, h, seed, wet = 0 }) => (
  <g>
    {[0, 1].map((i) => {
      const gx = x + w * (0.3 + 0.4 * i);
      const bend = (rnd(seed + i * 5) - 0.5) * w * 0.5;
      return (
        <path key={i} d={`M ${gx} ${y} Q ${gx + bend} ${y + h * 0.5} ${gx} ${y + h}`}
          fill="none" stroke={C.woodDark} strokeWidth={2.6}
          opacity={0.42 + wet * 0.28} />
      );
    })}
    {rnd(seed) > 0.68 && (
      <g>
        <ellipse cx={x + w * 0.5} cy={y + h * (0.18 + rnd(seed + 9) * 0.6)}
          rx={w * 0.27} ry={w * 0.36} fill={C.woodDark} stroke={KRP.ink}
          strokeWidth={2.4} opacity={0.8} />
        <ellipse cx={x + w * 0.5} cy={y + h * (0.18 + rnd(seed + 9) * 0.6)}
          rx={w * 0.12} ry={w * 0.16} fill={C.woodWet} opacity={0.7} />
      </g>
    )}
  </g>
);

/** 桶の胴 (縦板の円筒)。top=胴の上端 / wet=下から濡れている割合 */
const TankStaves: React.FC<{
  cx: number; top: number; w: number; h: number; n?: number;
  wet?: number; grain?: boolean; seed?: number;
}> = ({ cx, top, w, h, n = STAVES, wet = 0, grain = false, seed = 1 }) => {
  const x0 = cx - w / 2;
  const sw = w / n;
  return (
    <g>
      <rect x={x0} y={top} width={w} height={h} fill={C.wood}
        stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: n }, (_, i) => {
        const sx = x0 + i * sw;
        const u = (i + 0.5) / n;
        const shade = 1 - Math.sin(u * Math.PI);     // 円筒なので端が暗い
        return (
          <g key={i}>
            <rect x={sx} y={top} width={sw} height={h} fill={C.woodDark}
              opacity={shade * 0.5} />
            {grain && sw > 22 && (
              <Grain x={sx} y={top} w={sw} h={h} seed={seed + i * 3} wet={wet} />
            )}
            <line x1={sx} y1={top} x2={sx} y2={top + h} stroke={KRP.ink}
              strokeWidth={sw > 22 ? 3 : 2} opacity={0.72} />
          </g>
        );
      })}
      {/* 濡れている下側 */}
      {wet > 0.01 && (
        <g>
          <rect x={x0} y={top + h * (1 - wet)} width={w} height={h * wet}
            fill={C.woodWet} opacity={0.42} />
          <path
            d={`M ${x0} ${top + h * (1 - wet)} ${Array.from({ length: 9 }, (_, i) =>
              `L ${x0 + (w / 8) * i} ${top + h * (1 - wet) + (rnd(seed + i) - 0.5) * 26}`,
            ).join(" ")} L ${x0 + w} ${top + h * (1 - wet)}`}
            fill="none" stroke={C.woodWet} strokeWidth={7} opacity={0.5} />
        </g>
      )}
      <rect x={x0} y={top} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={6} />
    </g>
  );
};

/** 鋼のたが1本。tb="L"|"R" の側にターンバックル (ボルトで締める金具) */
const TankHoop: React.FC<{
  cx: number; y: number; w: number; th?: number; tb?: "L" | "R" | null;
  rust?: number; seed?: number; shrink?: number;
}> = ({ cx, y, w, th = 30, tb = null, rust = 0.4, seed = 2, shrink = 0 }) => {
  const hw = w / 2 + 9 - shrink;
  const nub = tb === "L" ? -1 : 1;
  return (
    <g>
      <rect x={cx - hw} y={y} width={hw * 2} height={th} rx={5}
        fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
      <rect x={cx - hw} y={y + th * 0.18} width={hw * 2} height={th * 0.2}
        fill={KRP.white} opacity={0.22} />
      {/* 錆 */}
      {rust > 0.05 && Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={cx - hw + (hw * 2) * (0.12 + i * 0.19)}
          cy={y + th * (0.3 + rnd(seed + i) * 0.5)}
          rx={th * (0.3 + rnd(seed + i * 2) * 0.5)} ry={th * 0.26}
          fill={C.rust} opacity={rust * 0.75} />
      ))}
      <Rivets x1={cx - hw + th} y1={y + th / 2} x2={cx + hw - th} y2={y + th / 2}
        n={Math.max(4, Math.round(w / 90))} r={th * 0.17} fill={BP.ironDark} />
      {/* ターンバックル */}
      {tb && (
        <g transform={`translate(${cx + nub * (hw - 4)} ${y + th / 2})`}>
          <rect x={nub > 0 ? -6 : -th * 2.1} y={-th * 0.62} width={th * 2.2} height={th * 1.24}
            rx={th * 0.3} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          <rect x={nub > 0 ? th * 0.2 : -th * 1.5} y={-th * 0.24} width={th * 1.1}
            height={th * 0.48} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3} />
          <HexBolt x={nub > 0 ? th * 1.9 : -th * 1.9} y={0} r={th * 0.48} fill={BP.steelDark} />
          <HexBolt x={nub > 0 ? -th * 0.1 : th * 0.1} y={0} r={th * 0.44} fill={BP.steelDark} />
        </g>
      )}
    </g>
  );
};

/** 円錐の屋根 (頂点に通気の突起) */
const TankRoof: React.FC<{ cx: number; baseY: number; w: number; h: number }> = ({
  cx, baseY, w, h,
}) => {
  const hw = w / 2 + 24;
  return (
    <g>
      <polygon points={`${cx - hw},${baseY} ${cx},${baseY - h} ${cx + hw},${baseY}`}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 稜線 */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.5}>
        {[-0.62, -0.3, 0, 0.3, 0.62].map((u, i) => (
          <line key={i} x1={cx + hw * u} y1={baseY} x2={cx} y2={baseY - h} />
        ))}
      </g>
      <polygon points={`${cx - hw},${baseY} ${cx},${baseY - h} ${cx - hw * 0.1},${baseY}`}
        fill={KRP.white} opacity={0.12} />
      {/* 軒 */}
      <rect x={cx - hw} y={baseY - 6} width={hw * 2} height={Math.max(14, h * 0.1)} rx={6}
        fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
      {/* 通気の突起 */}
      <rect x={cx - w * 0.045} y={baseY - h - h * 0.17} width={w * 0.09} height={h * 0.2}
        fill={BP.iron} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={cx} cy={baseY - h - h * 0.18} rx={w * 0.075} ry={h * 0.04}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

/** 4本脚の木の台座 (筋交い付き) */
const TankBase: React.FC<{ cx: number; top: number; w: number; h: number }> = ({
  cx, top, w, h,
}) => {
  const post = Math.max(18, w * 0.085);
  const out = w * 0.42, inn = w * 0.15;
  return (
    <g>
      {/* 奥の2本 */}
      {[-inn, inn].map((d, i) => (
        <rect key={`b${i}`} x={cx + d - post * 0.42} y={top} width={post * 0.84} height={h * 0.92}
          fill={C.woodDark} stroke={KRP.ink} strokeWidth={4.5} opacity={0.85} />
      ))}
      {/* 筋交い */}
      <g stroke={C.woodDark} strokeWidth={Math.max(9, post * 0.5)} strokeLinecap="round">
        <line x1={cx - out} y1={top + h * 0.28} x2={cx + out} y2={top + h * 0.82} />
        <line x1={cx + out} y1={top + h * 0.28} x2={cx - out} y2={top + h * 0.82} />
      </g>
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
        <line x1={cx - out} y1={top + h * 0.28} x2={cx + out} y2={top + h * 0.82} />
        <line x1={cx + out} y1={top + h * 0.28} x2={cx - out} y2={top + h * 0.82} />
      </g>
      {/* 手前の2本 */}
      {[-out, out].map((d, i) => (
        <g key={`f${i}`}>
          <rect x={cx + d - post / 2} y={top} width={post} height={h}
            fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={cx + d - post / 2} y={top} width={post * 0.3} height={h}
            fill={KRP.white} opacity={0.16} />
        </g>
      ))}
      {/* 梁 */}
      <rect x={cx - w * 0.5} y={top - 4} width={w} height={post * 0.7}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

/** 給水の立管 (桶の側面から下へ1本)。f でわずかに震える */
const DownPipe: React.FC<{
  xTank: number; yTank: number; x: number; yBot: number; w?: number; f: number;
  tremble?: number; pulse?: boolean;
}> = ({ xTank, yTank, x, yBot, w = 36, f, tremble = 0, pulse = false }) => {
  const sh = Math.sin(f / 2.6) * tremble;
  const pt = pulse ? (f % 34) / 34 : -1;
  return (
    <g>
      {/* 継手 (桶の側面 → エルボ) */}
      <rect x={Math.min(xTank, x) - 4} y={yTank - w / 2} width={Math.abs(x - xTank) + 8} height={w}
        rx={6} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x - w / 2 + sh} y={yTank - w / 2} width={w} height={yBot - yTank + w / 2}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x - w / 2 + sh + w * 0.14} y={yTank - w / 2} width={w * 0.2}
        height={yBot - yTank + w / 2} fill={KRP.white} opacity={0.26} />
      {/* フランジ */}
      {[0.3, 0.68].map((u, i) => (
        <g key={i}>
          <rect x={x - w * 0.86 + sh} y={yTank + (yBot - yTank) * u} width={w * 1.72} height={w * 0.44}
            rx={5} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4.5} />
          <HexBolt x={x - w * 0.62 + sh} y={yTank + (yBot - yTank) * u + w * 0.22} r={w * 0.15} />
          <HexBolt x={x + w * 0.62 + sh} y={yTank + (yBot - yTank) * u + w * 0.22} r={w * 0.15} />
        </g>
      ))}
      {/* 中を水が送られている気配 */}
      {pt >= 0 && (
        <ellipse cx={x + sh} cy={yTank + (yBot - yTank) * pt} rx={w * 0.26} ry={w * 0.5}
          fill={C.waterPale} opacity={0.55} />
      )}
    </g>
  );
};

/** 俯瞰で見た桶 (屋根が主。胴が少しだけ見える) */
const TankFromAbove: React.FC<{
  x: number; y: number; r: number; o?: number; seed?: number;
}> = ({ x, y, r, o = 1, seed = 1 }) => {
  const sw = Math.max(2, r * 0.07);
  return (
    <g opacity={o}>
      {/* 影 */}
      <ellipse cx={x + r * 0.55} cy={y + r * 1.3} rx={r * 1.0} ry={r * 0.3}
        fill={KRP.ink} opacity={0.15} />
      {/* 脚 (桶は屋根に直接置かず、台の上) */}
      <g fill={C.woodDark} stroke={KRP.ink} strokeWidth={sw}>
        <rect x={x - r * 0.82} y={y + r * 1.1} width={r * 0.2} height={r * 0.34} />
        <rect x={x + r * 0.62} y={y + r * 1.1} width={r * 0.2} height={r * 0.34} />
      </g>
      {/* 胴 (たっぷり背の高い円筒) */}
      <path d={`M ${x - r} ${y} L ${x - r} ${y + r * 1.1} Q ${x} ${y + r * 1.46} ${x + r} ${y + r * 1.1} L ${x + r} ${y} Z`}
        fill={C.wood} stroke={KRP.ink} strokeWidth={sw} />
      {/* 丸みの陰 */}
      <path d={`M ${x + r * 0.42} ${y} L ${x + r * 0.42} ${y + r * 1.26} Q ${x + r * 0.72} ${y + r * 1.24} ${x + r} ${y + r * 1.1} L ${x + r} ${y} Z`}
        fill={KRP.ink} opacity={0.14} />
      {/* たが2本 */}
      {[0.4, 0.88].map((u, i) => (
        <path key={i} d={`M ${x - r} ${y + r * u} Q ${x} ${y + r * (u + 0.36)} ${x + r} ${y + r * u}`}
          fill="none" stroke={BP.iron} strokeWidth={Math.max(2.2, r * 0.1)} />
      ))}
      {r > 36 && (
        <g stroke={KRP.ink} strokeWidth={1.8} opacity={0.42}>
          {Array.from({ length: 9 }, (_, i) => {
            const u = -0.9 + i * 0.225;
            return <line key={i} x1={x + r * u} y1={y} x2={x + r * u}
              y2={y + r * (1.1 + 0.34 * (1 - Math.abs(u)))} />;
          })}
        </g>
      )}
      {/* 屋根 (円すい。奥の縁と手前の縁) */}
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.34} fill={C.woodDark}
        stroke={KRP.ink} strokeWidth={sw} />
      <path d={`M ${x - r} ${y} Q ${x} ${y - r * 0.2} ${x} ${y - r * 0.52} Q ${x} ${y - r * 0.2} ${x + r} ${y}`}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={sw} />
      <path d={`M ${x - r} ${y} Q ${x - r * 0.4} ${y + r * 0.3} ${x} ${y + r * 0.34} Q ${x + r * 0.4} ${y + r * 0.3} ${x + r} ${y}`}
        fill={C.woodDark} stroke={KRP.ink} strokeWidth={sw} />
      <g stroke={KRP.ink} strokeWidth={1.8} opacity={0.5}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = Math.PI * (i / 5) + rnd(seed) * 0.3;
          return <line key={i} x1={x} y1={y - r * 0.5}
            x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r * 0.34} />;
        })}
      </g>
      <path d={`M ${x - r * 0.72} ${y - r * 0.12} Q ${x - r * 0.3} ${y - r * 0.38} ${x} ${y - r * 0.48}`}
        fill="none" stroke={KRP.white} strokeWidth={Math.max(2, r * 0.08)} opacity={0.2} />
      {/* 頂の通気 */}
      <rect x={x - r * 0.12} y={y - r * 0.74} width={r * 0.24} height={r * 0.26}
        fill={BP.iron} stroke={KRP.ink} strokeWidth={Math.max(1.6, sw * 0.7)} />
    </g>
  );
};

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===== #124 市が把握している給水タンクは、約6千基。 =====
// 格: 並
// どこ: マンハッタンの屋根の上。少し高いところから見下ろしている
// 演出: 手前の3基はしっかり描き、奥へ行くほど小さく薄く。数えきれない数そのものが主役
// 動き: 奥から手前へ順に桶が現れる (数が増えていく) + 雲が流れる + ゆっくり寄る
// 絵: 屋根を俯瞰。桶が点々と数えきれないほど並ぶ。数の札
const Kb3bRokusenKi: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.022 * easeOut(clamp01(seg(f, 0, 40)));
  const rows = [
    { y: 288, r: 24, o: 0.3, n: 11, dx: 10 },
    { y: 350, r: 32, o: 0.44, n: 9, dx: 70 },
    { y: 418, r: 44, o: 0.6, n: 8, dx: -20 },
    { y: 512, r: 62, o: 0.8, n: 6, dx: 90 },
    { y: 664, r: 96, o: 1, n: 4, dx: 40 },
  ];
  return (
    <Frame f={f} seed={711} bg={KRP.cream}>
      <g transform={zoomAt(zoom, 960, 620)}>
        {/* 空 */}
        <rect x={-20} y={-20} width={W + 40} height={252} fill={C.skyHaze} />
        {[0, 1, 2].map((i) => {
          const cx = ((f * 1.3 + i * 740) % (W + 520)) - 260;
          return (
            <g key={`c${i}`} opacity={0.5}>
              <ellipse cx={cx} cy={74 + i * 42} rx={190} ry={26} fill={KRP.white} />
              <ellipse cx={cx + 90} cy={64 + i * 42} rx={120} ry={22} fill={KRP.white} />
            </g>
          );
        })}
        {/* 遠くのビル */}
        <g fill={C.stone} stroke={KRP.ink} strokeWidth={4} opacity={0.55}>
          {[[20, 150, 180], [250, 112, 150], [430, 158, 200], [660, 96, 160],
            [860, 148, 240], [1130, 118, 180], [1340, 160, 150], [1510, 104, 210],
            [1750, 146, 190]].map(([bx, by, bw], i) => (
              <rect key={i} x={bx} y={by} width={bw} height={232 - by + 8} />
            ))}
        </g>
        {/* 屋根の面 (手前へ下る。段ごとに色を変えて面を見せる) */}
        {[{ y: 232, h: 92, fill: C.plaster }, { y: 324, h: 102, fill: C.tile },
          { y: 426, h: 128, fill: C.stone }, { y: 554, h: 170, fill: C.plaster },
          { y: 724, h: 380, fill: C.tile }].map((b, i) => (
            <g key={`b${i}`}>
              <rect x={-20} y={b.y} width={W + 40} height={b.h} fill={b.fill}
                stroke={KRP.ink} strokeWidth={4} />
              <rect x={-20} y={b.y} width={W + 40} height={14} fill={BP.slabDark} opacity={0.6} />
              <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.22}>
                {Array.from({ length: 5 }, (_, k) => (
                  <line key={k} x1={120 + k * 420 + i * 90} y1={b.y + 14}
                    x2={120 + k * 420 + i * 90} y2={b.y + b.h} />
                ))}
              </g>
            </g>
          ))}
        {/* 煙突と排気 */}
        {[[205, 318, 34, 70], [1495, 414, 44, 84], [905, 544, 40, 78],
          [1660, 700, 56, 110], [330, 700, 50, 104]].map(([cx, cy, cw, ch], i) => (
            <g key={`ch${i}`}>
              <rect x={cx} y={cy - ch} width={cw} height={ch} fill={C.brick}
                stroke={KRP.ink} strokeWidth={5} />
              <rect x={cx - 7} y={cy - ch - 14} width={cw + 14} height={16} rx={4}
                fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
              <g stroke={KRP.ink} strokeWidth={2} opacity={0.3}>
                {Array.from({ length: 4 }, (_, k) => (
                  <line key={k} x1={cx} y1={cy - ch + 16 + k * 20} x2={cx + cw} y2={cy - ch + 16 + k * 20} />
                ))}
              </g>
              <ellipse cx={cx + cw / 2 + Math.sin((f + i * 9) / 12) * 10}
                cy={cy - ch - 44 - ((f * 1.6 + i * 30) % 60)} rx={20} ry={13}
                fill={KRP.gray} opacity={0.3} />
            </g>
          ))}
        {/* 桶の群れ (奥から順に出てくる) */}
        {rows.map((row, ri) => (
          <g key={`r${ri}`}>
            {Array.from({ length: row.n }, (_, i) => {
              const x = row.dx + 130 + (i * (W - 180)) / row.n + rnd(ri * 7 + i) * 50;
              const t = pop(clamp01(seg(f, 1 + (4 - ri) * 1.2 + i * 0.7, 13 + (4 - ri) * 1.2 + i * 0.7)));
              if (t <= 0) return null;
              return (
                <g key={i} transform={`translate(${x} ${row.y}) scale(${t}) translate(${-x} ${-row.y})`}>
                  <TankFromAbove x={x} y={row.y} r={row.r} o={row.o} seed={ri * 11 + i} />
                </g>
              );
            })}
          </g>
        ))}
      </g>
      <TagPlate x={1470} y={640} text="給水タンク" size={38} t={seg(f, 8, 22)} />
      <TagPlate x={1470} y={758} text="約6,000基" size={48} t={seg(f, 24, 38)} color={KRP.red} />
    </Frame>
  );
};

// ===== #125 木の桶は、いまも何千基も現役で働いています。 =====
// 格: 並
// どこ: 屋上の桶1基の真ん前。背景は空と隣のビルの壁だけ
// 演出: 板の木目・節・濡れた色の差・たがの錆まで寄って描く。描くのは桶1つだけ
// 動き: 立管がわずかに震える (今日も水が送られている) + 水滴が落ちる + じわっと寄る
// 絵: 1基の桶に寄る。濡れた板・流れた水の跡・今日も水が入っている気配
const Kb3bImaMoGeneki: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.024 * easeOut(clamp01(seg(f, 0, 40)));
  const drop = (f % 30) / 30;
  return (
    <Frame f={f} seed={712} bg={KRP.cream}>
      <g transform={zoomAt(zoom, 820, 520)}>
        {/* 空 */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.skyDay} />
        {[0, 1].map((i) => (
          <ellipse key={i} cx={((f * 1.1 + i * 900) % (W + 600)) - 300} cy={120 + i * 90}
            rx={210} ry={30} fill={KRP.white} opacity={0.5} />
        ))}
        {/* 隣のビルの壁 */}
        <rect x={1540} y={-20} width={400} height={H + 40} fill={C.brick}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.28}>
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={1540} y1={i * 84} x2={1920} y2={i * 84} />
          ))}
        </g>
        {Array.from({ length: 5 }, (_, r) => [0, 1].map((c) => (
          <g key={`w${r}${c}`}>
            <rect x={1596 + c * 190} y={70 + r * 200} width={120} height={150}
              fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
            <polygon points={`${1596 + c * 190},${220 + r * 200} ${1716 + c * 190},${70 + r * 200} ${1716 + c * 190},${120 + r * 200} ${1646 + c * 190},${220 + r * 200}`}
              fill={KRP.white} opacity={0.22} />
          </g>
        )))}
        {/* 桶 (大きく寄る) */}
        <TankRoof cx={820} baseY={215} w={1000} h={150} />
        <TankStaves cx={820} top={215} w={1000} h={590} wet={0.46} grain seed={5} />
        {/* 流れた水の跡の筋 */}
        <g>
          {[-0.76, -0.5, -0.22, 0.06, 0.3, 0.52, 0.78].map((u, i) => {
            const x = 820 + u * 470;
            const y0 = 290 + rnd(i * 3) * 120;
            return (
              <path key={i} d={`M ${x} ${y0} Q ${x + (rnd(i) - 0.5) * 26} ${(y0 + 805) / 2} ${x + (rnd(i + 5) - 0.5) * 20} 805`}
                fill="none" stroke={C.woodWet} strokeWidth={9 + rnd(i * 7) * 16}
                opacity={0.38} strokeLinecap="round" />
            );
          })}
        </g>
        <TankHoop cx={820} y={248} w={1000} th={38} tb="R" rust={0.5} seed={3} />
        <TankHoop cx={820} y={474} w={1000} th={38} tb="L" rust={0.66} seed={9} />
        <TankHoop cx={820} y={698} w={1000} th={38} tb="R" rust={0.8} seed={15} />
        <TankBase cx={820} top={805} w={1000} h={250} />
        {/* 立管 (震える) */}
        <DownPipe xTank={1300} yTank={610} x={1392} yBot={1060} w={44} f={f}
          tremble={1.7} pulse />
        {/* 水滴 */}
        <circle cx={1392} cy={820 + drop * 220} r={12 - drop * 4} fill={C.water}
          stroke={KRP.ink} strokeWidth={3} opacity={1 - drop * 0.5} />
        <ellipse cx={1392} cy={1046} rx={30 + drop * 24} ry={8}
          fill={C.waterPale} opacity={0.5 - drop * 0.3} />
      </g>
      <TagPlate x={262} y={316} text="濡れた板" size={42} t={seg(f, 8, 22)} />
      <TagPlate x={1684} y={424} text="錆びたたが" size={38} t={seg(f, 16, 30)} />
      <TagPlate x={1560} y={700} text="立管" size={40} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ===== #126 釘も接着剤も、使っていません。 =====
// 格: 図
// どこ: クリーム地の方眼の上。人も背景も置かない
// 演出: 釘と糊の缶を「物」として作り込む (頭・軸の筋・先端・錆 / ラベル・ふた・垂れた糊)
// 動き: 釘がわずかに揺れる + 糊が垂れて台に溜まっていく + ×が2つ打たれる
// 絵: 釘に赤い×、接着剤の缶に赤い×。釘と缶そのものを作り込む
const Kb3bKugiMoNoriMo: React.FC<{ f: number }> = ({ f }) => {
  const drip = easeOut(clamp01(seg(f, 6, 40)));
  const sway = Math.sin(f / 15) * 1.4;
  const Nail = (
    <g transform={`translate(0 -140) rotate(${-20 + sway})`}>
      {/* 軸 (頭→先端へ細る) */}
      <polygon points="-216,-27 168,-15 254,0 168,15 -216,27"
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={6} />
      <polygon points="-216,-27 168,-15 168,-5 -216,-9"
        fill={KRP.white} opacity={0.4} />
      <g stroke={BP.steelDark} strokeWidth={3.5} opacity={0.7}>
        <line x1={-200} y1={8} x2={160} y2={6} />
        <line x1={-200} y1={18} x2={150} y2={11} />
      </g>
      {/* 錆 */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={40 + i * 66} cy={(rnd(i * 4) - 0.5) * 20}
          rx={26 - i * 4} ry={13} fill={C.rust} opacity={0.55} />
      ))}
      {/* 頭 (打たれた凹み) */}
      <ellipse cx={-224} cy={0} rx={22} ry={54} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={-230} cy={0} rx={10} ry={46} fill={BP.steelLight} opacity={0.8} />
      <g stroke={BP.steelDark} strokeWidth={3} opacity={0.8} fill="none">
        <path d="M -238 -22 q 10 10 0 20" />
        <path d="M -234 14 q 9 8 1 16" />
      </g>
      {/* 先端 */}
      <polygon points="222,8 262,0 222,-8" fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
  const Can = (
    <g>
      {/* 胴 */}
      <rect x={-150} y={-250} width={300} height={246} fill={BP.steelLight}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={-150} y={-250} width={62} height={246} fill={KRP.white} opacity={0.34} />
      <rect x={96} y={-250} width={54} height={246} fill={BP.steelDark} opacity={0.3} />
      <ellipse cx={0} cy={-4} rx={150} ry={30} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      {/* 口と ふた (少し開いている) */}
      <ellipse cx={0} cy={-250} rx={150} ry={32} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-250} rx={96} ry={20} fill={BP.grease}
        stroke={KRP.ink} strokeWidth={5} />
      <g transform="translate(196 -70) rotate(16)">
        <ellipse cx={0} cy={0} rx={62} ry={76} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={-10} cy={-6} rx={38} ry={50} fill={BP.steelLight} opacity={0.7} />
      </g>
      {/* ラベル */}
      <rect x={-150} y={-204} width={300} height={122} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={-150} y={-204} width={300} height={16} fill={KRP.red} opacity={0.75} />
      <rect x={-150} y={-98} width={300} height={16} fill={KRP.red} opacity={0.75} />
      <text x={0} y={-124} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={74} fill={KRP.ink}>糊</text>
      {/* 垂れた糊 */}
      <path d={`M 140 -236 q 26 ${60 * drip} 10 ${150 * drip} q -16 ${40 * drip} -4 ${56 * drip}`}
        fill="none" stroke={BP.brassLight} strokeWidth={22} strokeLinecap="round" />
      <path d={`M 140 -236 q 26 ${60 * drip} 10 ${150 * drip} q -16 ${40 * drip} -4 ${56 * drip}`}
        fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      <ellipse cx={154} cy={-6} rx={54 * drip + 20} ry={13 * drip + 5}
        fill={BP.brassLight} stroke={KRP.ink} strokeWidth={4} opacity={0.92} />
    </g>
  );
  return (
    <Frame f={f} seed={713} bg={KRP.cream}>
      <GridPaper />
      <MaruBatsu x={960} y={600} s={1.2} t={seg(f, 14, 28)} gap={850} labelSize={44}
        leftMark="batsu" rightMark="batsu" leftText="釘" rightText="接着剤"
        leftNode={Nail} rightNode={Can} />
    </Frame>
  );
};

// ===== #127 鋼のたがで、外から締め上げるだけです。 =====
// 格: 山
// どこ: ビルの屋上。足場の板の上。空と遠くのビル、床、工具箱まで入れる
// 演出: 桶の構造 (縦板28枚・たが3本・ターンバックル) の全体像。職人が1人、レンチで締め上げる
// 動き: 職人が力をこめて引く (レンチが回る・力線と汗) → たががわずかに縮む + 雲が流れる
// 絵: 桶の構造の全体像。板・3本のたが・ターンバックル。職人が締め上げている
const Kb3bHaganeNoTaga: React.FC<{ f: number }> = ({ f }) => {
  const grip = easeOut(clamp01(seg(f, 2, 16)));
  const pull = (Math.sin((f - 10) / 13) * 0.5 + 0.5) * easeOut(clamp01(seg(f, 6, 30)));
  const shrink = pull * 5;
  const wrenchRot = -5 + pull * 9;
  return (
    <Frame f={f} seed={714} bg={KRP.cream}>
      {/* 空 */}
      <rect x={-20} y={-20} width={W + 40} height={592} fill={C.skyDay} />
      {[0, 1, 2].map((i) => (
        <g key={`c${i}`} opacity={0.52}>
          <ellipse cx={((f * 1.2 + i * 680) % (W + 560)) - 280} cy={92 + i * 76}
            rx={180} ry={28} fill={KRP.white} />
          <ellipse cx={((f * 1.2 + i * 680) % (W + 560)) - 200} cy={80 + i * 76}
            rx={112} ry={22} fill={KRP.white} />
        </g>
      ))}
      {/* 遠くのビル */}
      <g fill={C.stone} stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
        {[[30, 430, 170], [240, 392, 140], [1420, 410, 180], [1640, 366, 150],
          [1810, 420, 130]].map(([bx, by, bw], i) => (
            <rect key={i} x={bx} y={by} width={bw} height={572 - by} />
          ))}
      </g>
      {/* 屋上の床 */}
      <rect x={-20} y={572} width={W + 40} height={H} fill={C.tile} />
      <rect x={-20} y={572} width={W + 40} height={26} fill={C.stone}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={-20} y={840} width={W + 40} height={34} fill={BP.slabDark}
        stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.2}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={-20 + i * 290} y1={598} x2={-120 + i * 290} y2={840} />
        ))}
        <line x1={-20} y1={712} x2={W + 20} y2={712} />
      </g>
      {/* 桶 */}
      <TankRoof cx={700} baseY={250} w={560} h={140} />
      <TankStaves cx={700} top={250} w={560} h={450} wet={0.2} grain seed={21} />
      <TankHoop cx={700} y={284} w={560} th={30} tb="L" rust={0.3} seed={4} shrink={shrink} />
      <TankHoop cx={700} y={466} w={560} th={30} tb="L" rust={0.35} seed={8} shrink={shrink} />
      <TankHoop cx={700} y={648} w={560} th={32} tb="R" rust={0.4} seed={12} shrink={shrink} />
      <TankBase cx={700} top={700} w={560} h={170} />
      <DownPipe xTank={960} yTank={560} x={1020} yBot={874} w={30} f={f} tremble={0.6} />
      {/* 締まる方向 (外から締める)。札が桶に重ならないよう、矢は桶の外から出す */}
      <ForceArrow x={150} y={372} len={260 + pull * 14} rot={0} w={22}
        color={KRP.green} t={seg(f, 20, 34)} label="外から締める" labelSize={34} />
      <ForceArrow x={1250} y={372} len={260 + pull * 14} rot={180} w={22}
        color={KRP.green} t={seg(f, 20, 34)} />
      {/* 足場の板 */}
      <g>
        <rect x={1010} y={706} width={700} height={24} fill={BP.wood}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={1010} y={730} width={700} height={22} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={1050} y1={718} x2={1670} y2={718} n={9} r={6} fill={BP.woodDark} />
        {[1080, 1640].map((px, i) => (
          <rect key={i} x={px} y={752} width={28} height={122} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
        <line x1={1094} y1={760} x2={1654} y2={866} stroke={BP.steel} strokeWidth={14} />
        <line x1={1094} y1={760} x2={1654} y2={866} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      </g>
      {/* 工具箱 */}
      <g>
        <rect x={1480} y={624} width={200} height={84} fill={BP.ironDark}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={1480} y={624} width={200} height={16} fill={BP.steelDark} />
        <path d="M 1548 624 q 32 -40 64 0" fill="none" stroke={KRP.ink} strokeWidth={7} />
        <g stroke={BP.steelLight} strokeWidth={10} strokeLinecap="round">
          <line x1={1500} y1={620} x2={1536} y2={586} />
          <line x1={1522} y1={620} x2={1566} y2={598} />
        </g>
        <circle cx={1536} cy={584} r={13} fill="none" stroke={BP.steelLight} strokeWidth={9} />
      </g>
      {/* 職人 */}
      <Person x={1277} y={706} s={1} f={f} helmet lean={-5}
        cloth="#3E5A66" clothDark="#2C4350" gaze={[-5, 1]} />
      {/* レンチ (ターンバックルのナットを噛んでいる) */}
      <g transform={`rotate(${wrenchRot} 1000 663)`}>
        <rect x={1000} y={650} width={214} height={27} rx={9} fill={BP.steelLight}
          stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={1016} y={655} width={180} height={7} fill={KRP.white} opacity={0.5} />
        <path d="M 1012 630 l 0 66 l -32 -12 l 0 -42 Z" fill={BP.steel}
          stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={1212} cy={663} r={23} fill="none" stroke={BP.steelLight} strokeWidth={13} />
        <circle cx={1212} cy={663} r={23} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
        {/* 握り手 */}
        <g opacity={grip}>
          <ellipse cx={1206} cy={660} rx={38} ry={28} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={1180 + i * 16} y={636} width={13} height={26} rx={6}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <path d="M 1176 668 q -16 10 -2 22" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={2.6} opacity={0.5}>
            <line x1={1192} y1={668} x2={1222} y2={668} />
            <line x1={1194} y1={678} x2={1220} y2={678} />
          </g>
        </g>
      </g>
      {/* 力線と汗 */}
      <g opacity={easeOut(clamp01(seg(f, 16, 30))) * (0.55 + pull * 0.45)}>
        <g stroke={KRP.red} strokeWidth={7} strokeLinecap="round">
          <line x1={1290} y1={556} x2={1330} y2={528} />
          <line x1={1318} y1={580} x2={1364} y2={566} />
          <line x1={1266} y1={538} x2={1288} y2={500} />
        </g>
        <ellipse cx={1348} cy={492} rx={11} ry={16} fill={C.water}
          stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={1372} cy={528} rx={9} ry={13} fill={C.water}
          stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 回す向きの赤い矢は置かない。緑の「外から締める」と力線・汗で十分に伝わり、
          それ以上足すと職人の腕の上に赤が乗って絵が濁る */}
      {/* 札 (ターンバックルへは引き出し線で指す) */}
      <line x1={960} y1={728} x2={1002} y2={680} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
      <TagPlate x={870} y={762} text="ターンバックル" size={34} t={seg(f, 24, 38)} />
      <TagPlate x={1588} y={330} text="鋼のたが" size={46} t={seg(f, 6, 20)} />
      <line x1={236} y1={498} x2={430} y2={430} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
      <TagPlate x={210} y={540} text="縦板28枚" size={36} t={seg(f, 12, 26)} />
    </Frame>
  );
};

// ===== #128 水を入れると、はじめは漏れます。 =====
// 格: 並
// どこ: 桶の真下。足場の板の高さまで寄る (桶の胴は画面の上に切れている)
// 演出: 描くのは「漏れ」1つだけ。板のすきま・濡れて色の変わった板・跳ねた飛沫まで
// 動き: 水の筋が落ち続ける (破線が流れる) + 飛沫が跳ねる + 手桶の水面が揺れる
// 絵: 桶の下。板のすきまから水が筋になって落ちる。受ける桶と濡れた足場
const Kb3bHajimeWaMoreru: React.FC<{ f: number }> = ({ f }) => {
  const leak = easeOut(clamp01(seg(f, 2, 24)));
  const streaks = [470, 545, 618, 690, 762, 848, 932, 1024, 1118];
  return (
    <Frame f={f} seed={715} bg={KRP.cream}>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.skyDay} />
      <rect x={-20} y={742} width={W + 40} height={H} fill={C.tile} />
      {/* 桶の下側 (胴は上で切れている) */}
      <TankStaves cx={820} top={-40} w={760} h={370} wet={0.92} grain seed={31} />
      <TankHoop cx={820} y={236} w={760} th={34} tb="L" rust={0.72} seed={6} />
      {/* 底板 (下へふくらむ) */}
      <path d="M 440 330 Q 820 410 1200 330 L 1200 302 L 440 302 Z"
        fill={C.woodWet} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 440 330 Q 820 410 1200 330" fill="none" stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={2.6} opacity={0.4}>
        {[-0.6, -0.3, 0, 0.3, 0.6].map((u, i) => (
          <line key={i} x1={820 + u * 380} y1={304} x2={820 + u * 380} y2={330 + (1 - Math.abs(u)) * 72} />
        ))}
      </g>
      {/* 脚 */}
      <TankBase cx={820} top={338} w={760} h={404} />
      {/* 漏れる水の筋 */}
      <g opacity={leak}>
        {streaks.map((x, i) => {
          const w = 7 + rnd(i * 5) * 13;
          const y0 = 352 + (1 - Math.abs((x - 820) / 380)) * 64;
          return (
            <g key={i}>
              <line x1={x} y1={y0} x2={x + (rnd(i) - 0.5) * 14} y2={748}
                stroke={C.water} strokeWidth={w} strokeLinecap="round"
                strokeDasharray={`${40 + rnd(i * 3) * 30} ${16 + rnd(i * 7) * 14}`}
                strokeDashoffset={-((f * 17) % 90)} opacity={0.85} />
              <line x1={x} y1={y0} x2={x + (rnd(i) - 0.5) * 14} y2={748}
                stroke={C.waterPale} strokeWidth={w * 0.3} strokeLinecap="round"
                strokeDasharray="30 26" strokeDashoffset={-((f * 21) % 56)} />
              {/* すきまの口 */}
              <ellipse cx={x} cy={y0} rx={w * 0.9} ry={w * 0.5} fill={C.waterDeep}
                stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
      </g>
      {/* 足場の板 (濡れて色が変わっている) */}
      <g>
        <rect x={-20} y={748} width={W + 40} height={30} fill={BP.wood}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={-20} y={778} width={W + 40} height={26} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5} />
        <g opacity={leak * 0.72}>
          {streaks.map((x, i) => (
            <ellipse key={i} cx={x} cy={762} rx={46 + rnd(i * 9) * 34} ry={15}
              fill={C.woodWet} />
          ))}
        </g>
        <g stroke={KRP.ink} strokeWidth={2.4} opacity={0.3}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={i * 250} y1={748} x2={i * 250} y2={804} />
          ))}
        </g>
      </g>
      {/* 跳ねた飛沫 */}
      <g opacity={leak}>
        {streaks.map((x, i) => {
          const p = Math.abs(Math.sin((f + i * 7) / 5));
          return (
            <g key={i}>
              <path d={`M ${x - 40 - p * 14} 746 q ${40 + p * 14} ${-26 - p * 16} ${80 + p * 28} 0`}
                fill="none" stroke={C.waterPale} strokeWidth={6} opacity={0.75} />
              <circle cx={x - 46 - p * 20} cy={732 - p * 18} r={6 + p * 4}
                fill={C.waterPale} stroke={KRP.ink} strokeWidth={2.5} />
              <circle cx={x + 44 + p * 22} cy={728 - p * 22} r={5 + p * 5}
                fill={C.waterPale} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          );
        })}
      </g>
      {/* 受ける手桶 */}
      <g>
        <path d="M 700 756 L 724 900 L 1026 900 L 1050 756 Z" fill={C.wood}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={2.6} opacity={0.6}>
          {[0.2, 0.4, 0.6, 0.8].map((u, i) => (
            <line key={i} x1={700 + 350 * u} y1={756} x2={724 + 302 * u} y2={900} />
          ))}
        </g>
        <rect x={706} y={790} width={338} height={18} fill={BP.iron}
          stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={875} cy={758} rx={175} ry={24} fill={C.water}
          stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={875} cy={756 + Math.sin(f / 6) * 3} rx={150} ry={16}
          fill={C.waterPale} opacity={0.7} />
        <path d="M 706 752 q 170 -92 338 0" fill="none" stroke={BP.iron} strokeWidth={10} />
        <path d="M 706 752 q 170 -92 338 0" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      </g>
      {/* 見上げる職人の足元だけ */}
      <g>
        <rect x={226} y={690} width={34} height={62} fill="#2C4350" stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={276} y={690} width={34} height={62} fill="#2C4350" stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={240} cy={754} rx={34} ry={14} fill={KRP.ink} />
        <ellipse cx={292} cy={754} rx={34} ry={14} fill={KRP.ink} />
        <ellipse cx={266} cy={766} rx={78} ry={17} fill={C.waterPale} opacity={0.6} />
      </g>
      <line x1={400} y1={452} x2={492} y2={386} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
      <TagPlate x={330} y={492} text="板のすきま" size={36} t={seg(f, 10, 24)} />
      <TagPlate x={1520} y={300} text="漏れる" size={52} t={seg(f, 20, 34)} color={KRP.red} />
      <TagPlate x={1316} y={700} text="受け桶" size={36} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ===== #129 木が水を吸って膨らみ、すきまが自分で閉じます。 =====
// 格: 図
// どこ: クリーム地の方眼。板2枚の断面だけに寄る (#128の板と同じ色・同じ木目の調子)
// 演出: 木口の年輪と繊維を作り込む。画面の半分以上を板が占める大きさ
// 動き: すきまが時間とともに閉じる + 水の色がじわっと木にしみる + 水滴がすきまに落ちる
// 絵: 板2枚の断面の寄り。すきまが閉じていく (#128と対の連番)
const Kb3bFukurandeTojiru: React.FC<{ f: number }> = ({ f }) => {
  const tt = easeOut(clamp01(seg(f, 6, 34)));
  const gap = lerp(90, 8, tt);
  const FY = 152, FH = 600, FW = 440;
  const Board: React.FC<{ dir: 1 | -1; seed: number }> = ({ dir, seed }) => {
    const inner = 960 + dir * (gap / 2);          // すきま側の端
    const outer = inner + dir * FW;
    const x0 = Math.min(inner, outer);
    const pith = inner + dir * FW * 2.0;          // 年輪の中心 (板の外)
    return (
      <g>
        {/* 上の面 (繊維が奥へ走る) */}
        <polygon points={`${x0},${FY} ${x0 + FW},${FY} ${x0 + FW + 64},${FY - 46} ${x0 + 64},${FY - 46}`}
          fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.woodDark} strokeWidth={3} opacity={0.55}>
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={x0 + 26 + i * 60} y1={FY} x2={x0 + 26 + i * 60 + 64} y2={FY - 46} />
          ))}
        </g>
        {/* 木口の面 */}
        <rect x={x0} y={FY} width={FW} height={FH} fill={BP.woodLight}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 年輪 (面の中だけに出す = 入れ子の svg で切る) */}
        <svg x={x0 + 3} y={FY + 3} width={FW - 6} height={FH - 6}>
          <g transform={`translate(${-(x0 + 3)} ${-(FY + 3)})`}>
            {Array.from({ length: 11 }, (_, i) => (
              <circle key={i} cx={pith} cy={FY + FH * 0.46} r={FW * (0.42 + i * 0.13)}
                fill="none" stroke={C.woodDark} strokeWidth={i % 2 ? 7 : 4}
                opacity={0.42} />
            ))}
            {/* 放射の割れ */}
            <g stroke={C.woodWet} strokeWidth={5} opacity={0.4}>
              <line x1={pith} y1={FY + FH * 0.46} x2={inner} y2={FY + FH * 0.2} />
              <line x1={pith} y1={FY + FH * 0.46} x2={inner} y2={FY + FH * 0.78} />
            </g>
          </g>
        </svg>
        {/* 節 */}
        <ellipse cx={inner + dir * FW * 0.62} cy={FY + FH * 0.72} rx={34} ry={46}
          fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        {/* 水を吸った側 (すきま側から濡れていく) */}
        <g opacity={0.22 + tt * 0.5}>
          <path d={`M ${inner} ${FY} L ${inner} ${FY + FH} L ${inner + dir * 150} ${FY + FH} ${Array.from({ length: 6 }, (_, i) =>
            `L ${inner + dir * (150 + (rnd(seed + i) - 0.5) * 70)} ${FY + FH - (FH / 6) * (i + 1)}`,
          ).join(" ")} Z`} fill={C.woodWet} />
        </g>
        {/* すきま側の木端 (ここが当たる) */}
        <rect x={inner - dir * 4 - (dir > 0 ? 0 : 8)} y={FY} width={12} height={FH}
          fill={C.woodWet} opacity={0.5} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={716} bg={KRP.cream}>
      <GridPaper />
      {/* すきま (奥の暗がり)。上の面も奥へ続くので、同じ暗さで続ける */}
      <polygon
        points={`${960 - gap / 2},${FY} ${960 + gap / 2},${FY} ${960 + gap / 2 + 64},${FY - 46} ${960 - gap / 2 + 64},${FY - 46}`}
        fill={BP.shaftDeep} opacity={0.75} />
      <rect x={960 - gap / 2} y={FY} width={gap} height={FH} fill={BP.shaftDeep} opacity={0.75} />
      {/* すきまに落ちる水 */}
      {[0, 1, 2].map((i) => {
        const p = ((f * 9 + i * 70) % 210) / 210;
        return (
          <ellipse key={i} cx={960} cy={FY + 40 + p * (FH - 80)} rx={Math.max(3, gap * 0.3)}
            ry={16} fill={C.waterPale} opacity={(1 - p) * 0.9} />
        );
      })}
      <Board dir={-1} seed={3} />
      <Board dir={1} seed={17} />
      {/* 水を吸う矢印 */}
      <ForceArrow x={945} y={300} len={190} rot={180} w={22} color={C.waterDeep}
        t={seg(f, 8, 22)} />
      <ForceArrow x={975} y={300} len={190} rot={0} w={22} color={C.waterDeep}
        t={seg(f, 8, 22)} label="水を吸う" labelSize={36} />
      {/* 膨らむ矢印 (板の中からすきまへ) */}
      <ForceArrow x={640} y={620} len={250} rot={0} w={24} color={KRP.green}
        t={seg(f, 18, 32)} label="膨らむ" labelSize={36} />
      <ForceArrow x={1280} y={620} len={250} rot={180} w={24} color={KRP.green}
        t={seg(f, 18, 32)} />
      {/* すきまの寸法 */}
      <g opacity={easeOut(clamp01(seg(f, 24, 38)))}>
        <line x1={960 - gap / 2} y1={796} x2={960 - gap / 2} y2={830} stroke={KRP.red} strokeWidth={5} />
        <line x1={960 + gap / 2} y1={796} x2={960 + gap / 2} y2={830} stroke={KRP.red} strokeWidth={5} />
        <line x1={960 - gap / 2 - 70} y1={813} x2={960 + gap / 2 + 70} y2={813}
          stroke={KRP.red} strokeWidth={5} strokeDasharray="14 10" />
      </g>
      <TagPlate x={300} y={196} text="木口（年輪）" size={34} t={seg(f, 4, 18)} />
      <TagPlate x={1588} y={196} text="すきまが閉じる" size={34} t={seg(f, 26, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== #130 21世紀の街を、樽が支えています。 =====
// 格: 山
// どこ: いまの街の屋上。夕方の光。奥はガラスの高層ビル、手前は古い屋根
// 演出: ガラスと木の対比が主題。桶が1基どしんと立ち、奥の新しいビルを背負う
// 動き: 雲が流れる + 窓の灯りが順に点く + ガラスに光が走る + 立管に水のパルス
// 絵: 現代の高層街のスカイライン。手前に木の桶。ガラスと木の対比
const Kb3bTaruGaSasaeru: React.FC<{ f: number }> = ({ f }) => {
  const lamp = clamp01(seg(f, 8, 36));
  const shine = ((f * 12) % 2600) - 300;
  const towers = [
    { x: 60, w: 170, top: 300 }, { x: 860, w: 190, top: 196 },
    { x: 1070, w: 150, top: 300 }, { x: 1240, w: 210, top: 128 },
    { x: 1470, w: 160, top: 262 }, { x: 1650, w: 230, top: 190 },
  ];
  return (
    <Frame f={f} seed={717} bg={KRP.cream}>
      {/* 夕方の空 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.skyHaze} />
      <rect x={-20} y={300} width={W + 40} height={520} fill={C.skyDusk} opacity={0.72} />
      <rect x={-20} y={610} width={W + 40} height={210} fill={KRP.yellow} opacity={0.26} />
      {/* 薄い雲 */}
      {[0, 1, 2, 3].map((i) => (
        <g key={`c${i}`} opacity={0.4}>
          <ellipse cx={((f * 1.5 + i * 560) % (W + 620)) - 310} cy={120 + i * 92}
            rx={230} ry={20} fill={KRP.white} />
          <ellipse cx={((f * 1.5 + i * 560) % (W + 620)) - 180} cy={134 + i * 92}
            rx={150} ry={15} fill={KRP.white} />
        </g>
      ))}
      {/* ガラスの高層ビル */}
      {towers.map((t, ti) => (
        <g key={`t${ti}`}>
          {/* ガラスの壁 (窓枠より面が勝つ = ガラス張りに見える) */}
          <rect x={t.x} y={t.top} width={t.w} height={800 - t.top} fill={C.glass}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={t.x + t.w * 0.72} y={t.top} width={t.w * 0.28} height={800 - t.top}
            fill={KPP.towerSide} opacity={0.5} />
          {/* 各階の横目地 */}
          <g stroke={KRP.ink} strokeWidth={2.4} opacity={0.3}>
            {Array.from({ length: Math.floor((790 - t.top) / 46) }, (_, r) => (
              <line key={`h${r}`} x1={t.x} y1={t.top + 14 + r * 46} x2={t.x + t.w} y2={t.top + 14 + r * 46} />
            ))}
          </g>
          {/* 窓 (灯りが順に点く。点くのは少しだけ) */}
          {Array.from({ length: Math.floor((790 - t.top) / 46) }, (_, r) =>
            Array.from({ length: Math.max(2, Math.floor(t.w / 50)) }, (_, c) => {
              const on = rnd(ti * 31 + r * 7 + c * 3) < lamp * 0.3;
              return (
                <rect key={`${r}-${c}`} x={t.x + 14 + c * 50} y={t.top + 18 + r * 46}
                  width={34} height={30} fill={on ? BP.lamp : "#9FBACB"}
                  stroke={KRP.ink} strokeWidth={2.2} opacity={on ? 0.95 : 0.55} />
              );
            }))}
          {/* ガラスの反射 */}
          <polygon points={`${t.x},${800} ${t.x + t.w * 0.5},${t.top} ${t.x + t.w * 0.76},${t.top} ${t.x + t.w * 0.26},${800}`}
            fill={KRP.white} opacity={0.17} />
          {/* 走る光 */}
          {shine > t.x - 200 && shine < t.x + t.w + 200 && (
            <polygon points={`${shine},${800} ${shine + 70},${t.top} ${shine + 120},${t.top} ${shine + 50},${800}`}
              fill={KRP.white} opacity={0.2} />
          )}
          <rect x={t.x - 8} y={t.top - 16} width={t.w + 16} height={18} rx={5}
            fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 奥の古い屋根 */}
      {[[980, 700, 180], [1180, 720, 150]].map(([rx, ry, rw], i) => (
        <g key={`o${i}`}>
          <polygon points={`${rx},${ry + 90} ${rx + rw / 2},${ry} ${rx + rw},${ry + 90}`}
            fill={C.brick} stroke={KRP.ink} strokeWidth={5} />
          <rect x={rx} y={ry + 86} width={rw} height={80} fill={C.plaster}
            stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 手前の屋上 */}
      <rect x={-20} y={760} width={W + 40} height={34} fill={C.stone}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={790} width={W + 40} height={H} fill={C.tile} />
      <g stroke={KRP.ink} strokeWidth={2.6} opacity={0.22}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={i * 240} y1={794} x2={i * 240 - 120} y2={1080} />
        ))}
        <line x1={-20} y1={900} x2={W + 20} y2={900} />
      </g>
      {/* 木の桶 (どしんと1基) */}
      <TankRoof cx={560} baseY={240} w={500} h={150} />
      <TankStaves cx={560} top={240} w={500} h={480} wet={0.42} grain seed={41} />
      <TankHoop cx={560} y={274} w={500} th={30} tb="R" rust={0.52} seed={7} />
      <TankHoop cx={560} y={468} w={500} th={30} tb="L" rust={0.6} seed={13} />
      <TankHoop cx={560} y={668} w={500} th={30} tb="R" rust={0.7} seed={19} />
      <TankBase cx={560} top={720} w={500} h={70} />
      <DownPipe xTank={790} yTank={620} x={852} yBot={830} w={32} f={f} tremble={0.8} pulse />
      {/* 夕日の照り返し (桶の左肩) */}
      <path d="M 320 248 L 420 248 L 420 716 L 320 716 Z" fill={KRP.yellow} opacity={0.16} />
      {/* 見上げる人 (手前の床に立つので大きい) */}
      <ellipse cx={1310} cy={944} rx={96} ry={20} fill={KRP.ink} opacity={0.16} />
      <Person x={1310} y={944} s={0.92} f={f} gaze={[1, -6]} face="surprised"
        cloth="#4A5570" clothDark="#353E55" />
      <line x1={300} y1={756} x2={386} y2={672} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
      <TagPlate x={250} y={780} text="木の桶" size={44} t={seg(f, 6, 20)} />
      <TagPlate x={1468} y={250} text="ガラスの塔" size={42} t={seg(f, 18, 32)} />
    </Frame>
  );
};

// ===== #131 つまり上の階の水は、建物の性質ではありません。 =====
// 格: 図
// どこ: クリーム地の方眼。吊り下げた大きな木札だけ
// 演出: 札と×を画面いっぱいに。札の木目・釘・紐まで作り込む
// 動き: 札が紐で揺れる + 赤い×が2本、順に引かれる
// 絵: 「建物の性質」と書いた札に赤い×
const Kb3bSeishitsuDeNai: React.FC<{ f: number }> = ({ f }) => {
  const swing = Math.sin(f / 17) * 1.2;
  const L = 1272;                                  // ×1本の長さ
  const x1 = easeOut(clamp01(seg(f, 8, 22)));
  const x2 = easeOut(clamp01(seg(f, 20, 34)));
  return (
    <Frame f={f} seed={718} bg={KRP.cream}>
      <GridPaper />
      {/* 吊り紐 */}
      <Rope x1={620} y1={-20} x2={700} y2={214} w={18} kind="hemp" f={f} />
      <Rope x1={1300} y1={-20} x2={1220} y2={214} w={18} kind="hemp" f={f} />
      <g transform={`rotate(${swing} 960 200)`}>
        {/* 木札 */}
        <rect x={360} y={214} width={1200} height={380} rx={18} fill={C.wood}
          stroke={KRP.ink} strokeWidth={9} />
        <rect x={386} y={240} width={1148} height={328} rx={12} fill="none"
          stroke={C.woodDark} strokeWidth={7} opacity={0.8} />
        {/* 木目 */}
        <g stroke={C.woodDark} strokeWidth={5} opacity={0.4}>
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M 372 ${252 + i * 50} Q 960 ${252 + i * 50 + (rnd(i) - 0.5) * 40} 1548 ${252 + i * 50}`}
              fill="none" />
          ))}
        </g>
        <ellipse cx={520} cy={520} rx={34} ry={24} fill={C.woodDark}
          stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <rect x={360} y={214} width={1200} height={30} fill={KRP.white} opacity={0.18} />
        {/* 釘 */}
        {[[404, 258], [1516, 258], [404, 550], [1516, 550]].map(([nx, ny], i) => (
          <g key={i}>
            <circle cx={nx} cy={ny} r={15} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={nx - 4} cy={ny - 4} r={5} fill={BP.steelLight} />
          </g>
        ))}
        <text x={960} y={445} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={148} fill={KRP.ink} stroke={KRP.white} strokeWidth={14}
          paintOrder="stroke">建物の性質</text>
        {/* 赤い× (2本、順に引かれる)。字が読めるよう細めに、少し透かす */}
        <g stroke={KRP.red} strokeWidth={30} strokeLinecap="round" opacity={0.82}>
          <line x1={372} y1={226} x2={1548} y2={582}
            strokeDasharray={L} strokeDashoffset={L * (1 - x1)} />
          <line x1={1548} y1={226} x2={372} y2={582}
            strokeDasharray={L} strokeDashoffset={L * (1 - x2)} />
        </g>
        <g stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" opacity={0.5}>
          <line x1={372} y1={226} x2={1548} y2={582}
            strokeDasharray={L} strokeDashoffset={L * (1 - x1)} />
          <line x1={1548} y1={226} x2={372} y2={582}
            strokeDasharray={L} strokeDashoffset={L * (1 - x2)} />
        </g>
      </g>
      <TagPlate x={960} y={736} text="ちがう" size={56} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #132 ポンプが働き続けている、その結果です。 =====
// 格: 山
// どこ: 5本柱の装置の足元。機械室の基礎の上。装置は上半分、ポンプは下半分
// 演出: ★章の軸。上の階に水があるのは、この羽根が回り続けている結果。止まれば終わる緊張を残す
// 動き: 羽根が回る + ベルトが走る + 水の柱が立ち上がる + 圧力計の針が震える +
//       「運転中」の灯が点滅 + 高さの代金の針が下がる
// 絵: ★軸。5本柱の装置で「水」の柱が立ち上がる。足元でポンプが回り続けている。代金の目盛りが下がる
const Kb3bPumpGaHataraku: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(clamp01(seg(f, 8, 34)));
  const colTop = lerp(615, 320, rise);
  const rot = f * 11;
  const belt = -((f * 22) % 48);
  const lamp = (Math.sin(f / 4.2) + 1) / 2;
  const needle = Math.sin(f / 3.1) * 7 - 34;
  const costY = lerp(300, 636, easeOut(clamp01(seg(f, 14, 40))));
  return (
    <Frame f={f} seed={719} bg={KRP.cream}>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KPP.sky} opacity={0.42} />
      {/* 5本柱の装置 (上半分に置く) */}
      <g transform="translate(300 -70) scale(0.72)">
        <TowerOnPillars f={f} standing={["mizu"]} dimmed={["akari", "kuuki"]}
          labels tiltScale={0.22} lit={0.92} />
      </g>
      {/* 機械室の基礎 */}
      <rect x={-20} y={845} width={W + 40} height={H} fill={KPP.bedrock} />
      <rect x={-20} y={845} width={W + 40} height={16} fill={BP.slabDark}
        stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.26}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 150} y1={861} x2={i * 150 - 60} y2={960} />
        ))}
      </g>
      {/* 立ち上がる水の柱 */}
      <g>
        <rect x={961} y={colTop} width={60} height={625 - colTop} fill={C.water}
          stroke={KRP.ink} strokeWidth={5} opacity={0.88} />
        <rect x={969} y={colTop} width={16} height={625 - colTop} fill={C.waterPale} opacity={0.6} />
        <path d={`M 961 ${colTop} q 15 ${-16 - Math.sin(f / 5) * 8} 30 0 q 15 ${16 + Math.sin(f / 5) * 8} 30 0`}
          fill="none" stroke={C.waterDeep} strokeWidth={7} />
        {[0, 1, 2, 3].map((i) => {
          const by = 610 - ((f * 11 + i * 78) % Math.max(40, 610 - colTop));
          return (
            <circle key={i} cx={975 + ((i % 2) ? 20 : 0)} cy={by} r={7 + (i % 3) * 3}
              fill={KRP.white} stroke={C.waterDeep} strokeWidth={3} opacity={0.8} />
          );
        })}
      </g>
      {/* ポンプ (渦巻ケーシング + 羽根) */}
      <g>
        {/* 吸い込み管 (下から) */}
        <rect x={470} y={742} width={430} height={44} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={470} y={750} width={430} height={11} fill={KRP.white} opacity={0.26} />
        <rect x={470} y={742} width={44} height={120} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={452} y={776} width={80} height={22} rx={5} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={4} />
        <HexBolt x={462} y={787} r={9} />
        <HexBolt x={522} y={787} r={9} />
        {/* 吐出し管 (ポンプ → 水の柱) */}
        <rect x={956} y={600} width={70} height={60} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={5} />
        {/* ケーシング */}
        <circle cx={991} cy={715} r={104} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={991} cy={715} r={86} fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 991 629 q 70 0 70 44 l -36 0 q 0 -22 -34 -22 Z" fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={4} />
        {/* 羽根 (回り続けている) */}
        <g transform={`rotate(${rot} 991 715)`}>
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i}
              transform={`rotate(${i * 60} 991 715)`}
              d="M 991 715 q 46 -14 76 10 q -34 26 -76 -10 Z"
              fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <circle cx={991} cy={715} r={20} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
          <line x1={991} y1={695} x2={991} y2={735} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g stroke={BP.grease} strokeWidth={4} opacity={0.5}>
          <line x1={915} y1={790} x2={941} y2={812} />
        </g>
        {/* 台 */}
        <rect x={866} y={812} width={250} height={34} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={5} />
        <HexBolt x={890} y={829} r={11} />
        <HexBolt x={1092} y={829} r={11} />
        {/* 軸と車 */}
        <rect x={866} y={706} width={40} height={18} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${-rot} 862 715)`}>
          <circle cx={862} cy={715} r={42} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={862} cy={715} r={13} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
          <line x1={820} y1={715} x2={904} y2={715} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 電動機 */}
        <rect x={590} y={646} width={180} height={150} rx={14} fill={BP.ironDark}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={BP.steelDark} strokeWidth={7}>
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={606} y1={666 + i * 22} x2={754} y2={666 + i * 22} />
          ))}
        </g>
        <rect x={604} y={796} width={152} height={26} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={770} y={706} width={32} height={18} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${-rot} 802 715)`}>
          <circle cx={802} cy={715} r={30} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={802} cy={715} r={10} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ベルト (走る) */}
        <g stroke={BP.ironDark} strokeWidth={13}>
          <line x1={802} y1={685} x2={862} y2={673} />
          <line x1={802} y1={745} x2={862} y2={757} />
        </g>
        <g stroke={KRP.white} strokeWidth={4} strokeDasharray="14 34" strokeDashoffset={belt} opacity={0.65}>
          <line x1={802} y1={685} x2={862} y2={673} />
          <line x1={862} y1={757} x2={802} y2={745} />
        </g>
        {/* 圧力計 (針が震える) */}
        <g>
          <circle cx={1106} cy={640} r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={KRP.ink} strokeWidth={3}>
            {Array.from({ length: 7 }, (_, i) => {
              const a = (-200 + i * 32) * Math.PI / 180;
              return <line key={i} x1={1106 + Math.cos(a) * 30} y1={640 + Math.sin(a) * 30}
                x2={1106 + Math.cos(a) * 38} y2={640 + Math.sin(a) * 38} />;
            })}
          </g>
          <line x1={1106} y1={640} x2={1106 + Math.cos(needle * Math.PI / 180) * 32}
            y2={640 + Math.sin(needle * Math.PI / 180) * 32}
            stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
          <circle cx={1106} cy={640} r={7} fill={KRP.ink} />
        </g>
      </g>
      {/* 運転中の灯 (止まれば終わる) */}
      <g>
        <rect x={1300} y={636} width={210} height={96} rx={10} fill={BP.ironDark}
          stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1352} cy={684} r={28} fill={KRP.red} opacity={0.35 + lamp * 0.65}
          stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1352} cy={676} r={9} fill={KRP.white} opacity={0.5 + lamp * 0.5} />
        <g opacity={lamp}>
          <g stroke={KRP.red} strokeWidth={5} strokeLinecap="round">
            <line x1={1352} y1={636} x2={1352} y2={616} />
            <line x1={1392} y1={656} x2={1408} y2={644} />
            <line x1={1312} y1={656} x2={1296} y2={644} />
          </g>
        </g>
        <rect x={1396} y={660} width={94} height={48} rx={6} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={4} />
        <g stroke={BP.lampGlow} strokeWidth={4} opacity={0.6}>
          <line x1={1408} y1={676} x2={1478} y2={676} />
          <line x1={1408} y1={692} x2={1458} y2={692} />
        </g>
      </g>
      {/* 高さの代金の目盛り (下がる) */}
      <g>
        <rect x={1736} y={272} width={56} height={400} rx={10} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1736} y={costY} width={56} height={672 - costY} fill={KRP.orange}
          stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={1736} y1={300 + i * 44} x2={1766} y2={300 + i * 44} />
          ))}
        </g>
        <polygon points={`${1718},${costY} ${1696},${costY - 18} ${1696},${costY + 18}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <ForceArrow x={1670} y={330} len={200} rot={90} w={18} color={KRP.red}
          t={seg(f, 20, 34)} />
      </g>
      {/* 見上げる人 */}
      <Person x={240} y={845} s={0.92} f={f} gaze={[2, -6]} face="surprised"
        cloth="#3E5A66" clothDark="#2C4350" />
      <TagPlate x={1196} y={762} text="ポンプ" size={46} t={seg(f, 4, 18)} />
      <TagPlate x={1404} y={776} text="運転中" size={40} t={seg(f, 24, 38)} color={KRP.red} />
      <TagPlate x={1660} y={200} text="高さの代金" size={40} t={seg(f, 14, 28)} />
    </Frame>
  );
};

// ===== #133 出ていく水の話も、しておきます。 =====
// 格: 図
// どこ: クリーム地の方眼。流れの向きだけを描く
// 演出: それまで上向きだった流れ (薄く残す) が、下向きに入れ替わる合図
// 動き: 上向きの矢印が薄れ、U字に折り返して下向きの矢印が伸びる + 水玉が下へ流れる
// 絵: 矢印が下を向く。札「出ていく水」。ここから話が反転する合図
const Kb3bDeteikuMizu: React.FC<{ f: number }> = ({ f }) => {
  const turn = easeOut(clamp01(seg(f, 2, 20)));
  const grow = easeOut(clamp01(seg(f, 10, 36)));
  const fade = 1 - easeOut(clamp01(seg(f, 6, 26))) * 0.72;
  const tipY = lerp(240, 628, grow);
  const UL = 1180;
  return (
    <Frame f={f} seed={720} bg={KRP.cream}>
      <GridPaper />
      {/* それまでの上向きの流れ (薄く残す) */}
      <g opacity={fade}>
        <rect x={452} y={238} width={136} height={474} fill={KRP.gray}
          stroke={KRP.ink} strokeWidth={6} opacity={0.5} />
        <polygon points="520,120 390,266 650,266" fill={KRP.gray}
          stroke={KRP.ink} strokeWidth={6} opacity={0.5} />
        <g stroke={KRP.white} strokeWidth={6} opacity={0.5}>
          <line x1={496} y1={260} x2={496} y2={700} />
        </g>
      </g>
      {/* 折り返し (ここで話が反転する) */}
      <path d="M 520 150 q 0 -96 300 -96 q 300 0 300 150"
        fill="none" stroke={KRP.red} strokeWidth={22} strokeLinecap="round"
        strokeDasharray={UL} strokeDashoffset={UL * (1 - turn)} opacity={0.9} />
      <polygon points={`1120,${232} 1082,${160} 1158,${160}`} fill={KRP.red}
        stroke={KRP.ink} strokeWidth={5} opacity={turn} />
      {/* 下向きの矢印 (主役) */}
      <g>
        <rect x={1052} y={226} width={136} height={Math.max(0, tipY - 226)}
          fill={C.waterDeep} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1068} y={226} width={34} height={Math.max(0, tipY - 226)}
          fill={C.waterPale} opacity={0.5} />
        <polygon points={`1120,${tipY + 128} 980,${tipY} 1260,${tipY}`}
          fill={C.waterDeep} stroke={KRP.ink} strokeWidth={6} />
        <polygon points={`1120,${tipY + 108} 1010,${tipY + 4} 1086,${tipY + 4}`}
          fill={C.waterPale} opacity={0.35} />
        {/* 下へ流れる水玉 */}
        {[0, 1, 2, 3].map((i) => {
          const p = ((f * 14 + i * 96) % 384) / 384;
          const y = 250 + p * Math.max(0, tipY - 280);
          return (
            <ellipse key={i} cx={1096 + (i % 2) * 44} cy={y} rx={13} ry={22}
              fill={KRP.white} stroke={C.waterDeep} strokeWidth={4} opacity={0.85} />
          );
        })}
      </g>
      <TagPlate x={520} y={764} text="上げる水" size={38} t={seg(f, 4, 18)} color={KRP.grayDark} />
      <TagPlate x={1570} y={420} text="出ていく水" size={50} t={seg(f, 24, 38)} color={C.waterDeep} />
    </Frame>
  );
};

// ===== #134 下水は下りなので、放っておけば落ちます。 =====
// 格: 図
// どこ: クリーム地の方眼。縦の下水管1本を画面の高さいっぱいに (中央より少し左)
// 演出: 継手・フランジ・ボルト・切り欠きの中の濡れた内壁まで作り込む。動力の矢印は置かない
// 動き: 水が落ち続ける (破線が流れる) + しぶきが跳ねる + 内壁の濡れが光る
// 絵: 縦の管。水が落ちていく。動力の矢印はない
const Kb3bGesuiWaOchiru: React.FC<{ f: number }> = ({ f }) => {
  const PX = 700, PW = 250;
  const flow = clamp01(seg(f, 0, 16));
  const run = -((f * 26) % 112);
  const splash = Math.abs(Math.sin(f / 5));
  return (
    <Frame f={f} seed={721} bg={KRP.cream}>
      <GridPaper />
      {/* 管の本体 */}
      <rect x={PX - PW / 2} y={-20} width={PW} height={H + 40} fill={BP.steelLight}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={PX - PW / 2 + 16} y={-20} width={42} height={H + 40} fill={KRP.white} opacity={0.42} />
      <rect x={PX + PW / 2 - 54} y={-20} width={54} height={H + 40} fill={BP.steelDark} opacity={0.3} />
      {/* 切り欠き (中が見える) — 内壁の濡れと落ちる水 */}
      <svg x={PX - PW / 2 + 7} y={372} width={PW - 14} height={300}>
        <g transform={`translate(${-(PX - PW / 2 + 7)} ${-372})`}>
          <rect x={PX - PW / 2} y={372} width={PW} height={300} fill={BP.shaftDeep} />
          {/* 濡れた内壁 */}
          <rect x={PX - PW / 2 + 7} y={372} width={30} height={300} fill={C.waterPale} opacity={0.3} />
          <rect x={PX + PW / 2 - 40} y={372} width={28} height={300} fill={C.waterPale} opacity={0.18} />
          <g stroke={C.waterPale} strokeWidth={4} opacity={0.5}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={PX - 96 + i * 62} y1={372} x2={PX - 102 + i * 62} y2={672} />
            ))}
          </g>
          {/* 落ちる水 (途切れない柱。中を筋と泡が流れ落ちる) */}
          <rect x={PX - 42} y={372} width={84} height={300} fill={C.water} opacity={0.88} />
          <rect x={PX - 42} y={372} width={22} height={300} fill={KRP.white} opacity={0.26} />
          <rect x={PX + 24} y={372} width={18} height={300} fill={C.waterDeep} opacity={0.3} />
          <g stroke={C.waterPale} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
            {[-26, -8, 10, 28].map((dx, i) => (
              <line key={i} x1={PX + dx} y1={372} x2={PX + dx - 3} y2={672}
                strokeDasharray={`${54 + i * 16} ${40 + i * 10}`}
                strokeDashoffset={run * (1 + i * 0.22)} />
            ))}
          </g>
          {/* 泡 */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 376 + ((f * 15 + i * 61) % 292);
            return (
              <ellipse key={i} cx={PX - 24 + ((i * 17) % 50)} cy={y}
                rx={7} ry={11} fill={KRP.white} opacity={0.55} />
            );
          })}
          {/* 落ちる向きの山形 (矢印ではない。水の形) */}
          <g stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.6}>
            {[0, 1, 2].map((i) => {
              const y = 392 + ((f * 13 + i * 100) % 300);
              return <path key={i} d={`M ${PX - 30} ${y} L ${PX} ${y + 26} L ${PX + 30} ${y}`} />;
            })}
          </g>
        </g>
      </svg>
      <rect x={PX - PW / 2 + 7} y={372} width={PW - 14} height={300} fill="none"
        stroke={KRP.ink} strokeWidth={6} />
      {/* 管の中を落ちる水 (切り欠きの外は管ごしに薄く) */}
      <g opacity={flow * 0.42}>
        <rect x={PX - 38} y={-20} width={76} height={386} fill={C.water} />
        <rect x={PX - 38} y={678} width={76} height={H - 658} fill={C.water} />
        <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.5}>
          <line x1={PX - 14} y1={-20} x2={PX - 14} y2={366}
            strokeDasharray="60 50" strokeDashoffset={run} />
          <line x1={PX - 14} y1={678} x2={PX - 14} y2={H + 20}
            strokeDasharray="60 50" strokeDashoffset={run} />
        </g>
      </g>
      {/* 継手 (受け口) + フランジ + ボルト */}
      <g>
        <rect x={PX - PW / 2 - 36} y={236} width={PW + 72} height={116} rx={10}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
        <rect x={PX - PW / 2 - 36} y={252} width={PW + 72} height={18}
          fill={KRP.white} opacity={0.3} />
        <rect x={PX - PW / 2 - 58} y={236} width={PW + 116} height={30} rx={8}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={PX - PW / 2 - 58} y={322} width={PW + 116} height={30} rx={8}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <HexBolt x={PX + sg * (PW / 2 + 32)} y={251} r={15} />
            <HexBolt x={PX + sg * (PW / 2 + 32)} y={337} r={15} />
          </g>
        ))}
        <g stroke={C.rust} strokeWidth={6} opacity={0.5}>
          <line x1={PX - PW / 2 - 20} y1={290} x2={PX - PW / 2 + 30} y2={290} />
        </g>
      </g>
      <g>
        <rect x={PX - PW / 2 - 30} y={742} width={PW + 60} height={64} rx={9}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
        {[-1, 1].map((sg) => (
          <HexBolt key={sg} x={PX + sg * (PW / 2 + 8)} y={774} r={16} />
        ))}
        <rect x={PX - PW / 2 - 30} y={756} width={PW + 60} height={12}
          fill={KRP.white} opacity={0.26} />
      </g>
      {/* 下端から落ちていく水としぶき */}
      <g>
        <ellipse cx={PX} cy={1010} rx={92 + splash * 24} ry={20}
          fill={C.waterPale} opacity={0.5} />
        <circle cx={PX - 108 - splash * 20} cy={980 - splash * 30} r={10 + splash * 5}
          fill={C.waterPale} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={PX + 112 + splash * 22} cy={972 - splash * 34} r={9 + splash * 6}
          fill={C.waterPale} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <line x1={1164} y1={268} x2={880} y2={294} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
      <TagPlate x={1308} y={252} text="下水の立管" size={48} t={seg(f, 4, 18)} />
      <TagPlate x={1308} y={398} text="下りだけ" size={44} t={seg(f, 20, 34)} color={KRP.green} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb3_rokusen_ki: (f) => <Kb3bRokusenKi f={f} />,
  kb3_ima_mo_geneki: (f) => <Kb3bImaMoGeneki f={f} />,
  kb3_kugi_mo_nori_mo: (f) => <Kb3bKugiMoNoriMo f={f} />,
  kb3_hagane_no_taga: (f) => <Kb3bHaganeNoTaga f={f} />,
  kb3_hajime_wa_moreru: (f) => <Kb3bHajimeWaMoreru f={f} />,
  kb3_fukurande_tojiru: (f) => <Kb3bFukurandeTojiru f={f} />,
  kb3_taru_ga_sasaeru: (f) => <Kb3bTaruGaSasaeru f={f} />,
  kb3_seishitsu_de_nai: (f) => <Kb3bSeishitsuDeNai f={f} />,
  kb3_pump_ga_hataraku: (f) => <Kb3bPumpGaHataraku f={f} />,
  kb3_deteiku_mizu: (f) => <Kb3bDeteikuMizu f={f} />,
  kb3_gesui_wa_ochiru: (f) => <Kb3bGesuiWaOchiru f={f} />,
};

export const K_B3B_MOTIFS: string[] = [
  "kb3_rokusen_ki",        // #124 市が把握している給水タンクは、約6千基。
  "kb3_ima_mo_geneki",     // #125 木の桶は、いまも何千基も現役で働いています。
  "kb3_kugi_mo_nori_mo",   // #126 釘も接着剤も、使っていません。
  "kb3_hagane_no_taga",    // #127 鋼のたがで、外から締め上げるだけです。
  "kb3_hajime_wa_moreru",  // #128 水を入れると、はじめは漏れます。
  "kb3_fukurande_tojiru",  // #129 木が水を吸って膨らみ、すきまが自分で閉じます。
  "kb3_taru_ga_sasaeru",   // #130 21世紀の街を、樽が支えています。
  "kb3_seishitsu_de_nai",  // #131 つまり上の階の水は、建物の性質ではありません。
  "kb3_pump_ga_hataraku",  // #132 ポンプが働き続けている、その結果です。
  "kb3_deteiku_mizu",      // #133 出ていく水の話も、しておきます。
  "kb3_gesui_wa_ochiru",   // #134 下水は下りなので、放っておけば落ちます。
];

export const kosoB3bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
