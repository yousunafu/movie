// 「なぜ高層ビルは生まれたのか」: 第4章「灯りと、空気。」前半 (ガスの火〜電気の灯り)
// 担当範囲: 台本 docs/koso-script-v7.txt の 148〜158行目 (文#147〜#157・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb4_ で始める。WobbleDefs の seed はこのファイルでは 740〜750 を使う。
// 設計書: docs/koso-ch4-design.md (1文ごとの「格」と絵の中身が決まっている)
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
  flame: "#F0A02E",
  flameCore: "#F6D06A",
  soot: "#2E2A28",
  sootPale: "#5A524C",
  amber: "#C9A06A",
  wallpaper: "#B88A5E",
  wallDark: "#7E5B36",
  bulb: "#F4DE8E",
  castIron: "#3E4247",
  castIronPale: "#5E646B",
  airBlue: "#9FB6C4",
  airPale: "#D6E2E8",
  glass: "#AFC6D4",
  night: "#2B3A4A",
  snow: "#EDF1F3",
  ink2: "#3A4350",
} as const;

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===================================================================
// このファイルだけのローカル部品 (共用部品集には足さない)
// ===================================================================

/** 魚尾のガス炎。芯・外炎・ゆらぎまで描く。向き rot=0 で上向き */
const FishTailFlame: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; rot?: number; core?: number;
}> = ({ x, y, s = 1, f, phase = 0, rot = 0, core = 1 }) => {
  const w1 = Math.sin((f + phase * 9) / 5.5) * 0.14;
  const w2 = Math.sin((f + phase * 13) / 3.7 + 1.2) * 0.1;
  const br = 1 + Math.sin((f + phase * 7) / 4.3) * 0.055;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * br} ${s})`}>
      {/* 外炎 (魚の尾のように左右に開く) */}
      <path
        d={`M0,0 C${-26 + w1 * 40},-14 ${-52 + w1 * 60},-40 ${-46 + w1 * 50},-76
            C${-42 + w1 * 44},-100 ${-20},-88 ${-8 + w2 * 16},-104
            C${4 + w2 * 14},-88 ${40 - w1 * 44},-102 ${46 - w1 * 50},-76
            C${52 - w1 * 60},-40 ${26 - w1 * 40},-14 0,0 Z`}
        fill={C.flame} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" opacity={0.95} />
      {/* 内炎 */}
      <path
        d={`M0,-4 C${-16 + w2 * 22},-18 ${-28 + w2 * 26},-40 ${-24 + w2 * 22},-62
            C${-20},-78 ${-6 + w1 * 10},-62 ${-2 + w1 * 8},-78
            C${2 - w1 * 8},-62 ${20},-78 ${24 - w2 * 22},-62
            C${28 - w2 * 26},-40 ${16 - w2 * 22},-18 0,-4 Z`}
        fill={C.flameCore} stroke="none" opacity={0.9} />
      {/* 炎の芯 (青い根元。ガスの燃焼) */}
      <ellipse cx={0} cy={-11 * core} rx={11 * core} ry={16 * core}
        fill={C.airBlue} opacity={0.75} />
    </g>
  );
};

/** 立ち上がる煤の筋。t で伸びる */
const SootPlume: React.FC<{
  x: number; y: number; h?: number; w?: number; f: number; t?: number; n?: number; seed?: number;
}> = ({ x, y, h = 300, w = 70, f, t = 1, n = 5, seed = 1 }) => {
  const ap = easeOut(clamp01(t));
  if (ap <= 0) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const r0 = rnd(seed * 31 + i * 7);
        const r1 = rnd(seed * 17 + i * 13);
        const dx = (r0 - 0.5) * w;
        const sway = Math.sin((f + i * 11) / 9) * (10 + r1 * 14);
        const hh = h * (0.58 + r1 * 0.42) * ap;
        return (
          <path key={i}
            d={`M${x + dx},${y} C${x + dx + sway},${y - hh * 0.36}
               ${x + dx - sway * 1.3},${y - hh * 0.7} ${x + dx + sway * 0.6},${y - hh}`}
            fill="none" stroke={i % 2 ? C.soot : C.sootPale}
            strokeWidth={16 + r0 * 13} strokeLinecap="round"
            opacity={(0.5 - r1 * 0.17) * ap} />
        );
      })}
      {/* 煤の粒 */}
      {Array.from({ length: n * 2 }, (_, i) => {
        const r0 = rnd(seed * 53 + i * 11);
        const r1 = rnd(seed * 91 + i * 5);
        const up = ((f * 2.2 + r0 * 120) % 120) / 120;
        return (
          <circle key={`p${i}`} cx={x + (r1 - 0.5) * w * 1.5 + Math.sin((f + i * 9) / 8) * 11}
            cy={y - h * up * ap} r={4 + r0 * 6}
            fill={C.soot} opacity={(1 - up) * 0.5 * ap} />
        );
      })}
    </g>
  );
};

/** 真鍮のガス灯金具 (コックのレバー・ねじ・バーナーの口) */
const GasFitting: React.FC<{
  x: number; y: number; s?: number; f: number;
}> = ({ x, y, s = 1, f }) => {
  const lever = Math.sin(f / 16) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* バーナーの口 (魚尾用のスリット) */}
      <path d="M-34,0 L-22,-30 L22,-30 L34,0 Z" fill={BP.brass}
        stroke={KRP.ink} strokeWidth={5} />
      <line x1={-14} y1={-30} x2={-14} y2={-16} stroke={KRP.ink} strokeWidth={4} />
      <line x1={14} y1={-30} x2={14} y2={-16} stroke={KRP.ink} strokeWidth={4} />
      {/* 首のねじ山 */}
      <rect x={-28} y={0} width={56} height={46} rx={5} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={5} />
      {[8, 20, 32].map((yy) => (
        <line key={yy} x1={-28} y1={yy} x2={28} y2={yy} stroke={KRP.ink}
          strokeWidth={3.5} opacity={0.72} />
      ))}
      {/* 軸 */}
      <rect x={-17} y={46} width={34} height={72} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={5} />
      <line x1={-6} y1={48} x2={-6} y2={116} stroke={BP.brassLight} strokeWidth={7} opacity={0.8} />
      {/* コックの胴 */}
      <circle cx={0} cy={140} r={30} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={0} cy={140} r={12} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      {/* コックのレバー (動く) */}
      <g transform={`rotate(${22 + lever} 0 140)`}>
        <rect x={22} y={131} width={82} height={18} rx={9} fill={BP.brassLight}
          stroke={KRP.ink} strokeWidth={5} />
        <circle cx={104} cy={140} r={13} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <HexBolt x={0} y={182} r={16} fill={BP.brassDark} />
    </g>
  );
};

/** ガラスのホヤ (炎を囲む筒。上が開いている) */
const GlassChimney: React.FC<{
  x: number; y: number; w?: number; h?: number;
}> = ({ x, y, w = 150, h = 250 }) => (
  <g>
    <path
      d={`M${x - w / 2},${y} C${x - w / 2 - 12},${y - h * 0.44}
         ${x - w * 0.30},${y - h * 0.80} ${x - w * 0.36},${y - h}
         L${x + w * 0.36},${y - h}
         C${x + w * 0.30},${y - h * 0.80} ${x + w / 2 + 12},${y - h * 0.44} ${x + w / 2},${y} Z`}
      fill={C.glass} fillOpacity={0.3} stroke={KRP.ink} strokeWidth={5.5} />
    {/* ガラスの合わせ目のハイライト */}
    <path d={`M${x - w * 0.26},${y - 18} C${x - w * 0.30},${y - h * 0.5}
       ${x - w * 0.19},${y - h * 0.78} ${x - w * 0.21},${y - h + 14}`}
      fill="none" stroke={KRP.white} strokeWidth={9} opacity={0.6} strokeLinecap="round" />
    <path d={`M${x + w * 0.30},${y - 26} C${x + w * 0.32},${y - h * 0.52}
       ${x + w * 0.22},${y - h * 0.74} ${x + w * 0.23},${y - h + 20}`}
      fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.4} strokeLinecap="round" />
    {/* 上の口の縁 */}
    <ellipse cx={x} cy={y - h} rx={w * 0.36} ry={13} fill="none"
      stroke={KRP.ink} strokeWidth={5.5} />
  </g>
);

/** 石膏のメダリオン (天井の飾り)。葉・薔薇・渦巻き・同心円の縁 */
const Medallion: React.FC<{
  x: number; y: number; r?: number; t?: number; f: number; leaves?: number;
}> = ({ x, y, r = 300, t = 1, f, leaves = 12 }) => {
  const ap = easeOut(clamp01(t));
  const br = Math.sin(f / 19) * 0.006 + 1;
  const PL = "#E6DCC6";       // 石膏
  const PLs = "#C6B99C";      // 石膏の影
  const PLd = "#A99C80";
  return (
    <g transform={`translate(${x} ${y}) scale(${br})`} opacity={ap}>
      {/* 外の同心円の縁 */}
      <circle cx={0} cy={0} r={r} fill={PL} stroke={KRP.ink} strokeWidth={7} />
      <circle cx={0} cy={0} r={r * 0.95} fill="none" stroke={PLd} strokeWidth={10} opacity={0.8} />
      <circle cx={0} cy={0} r={r * 0.88} fill={PLs} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={0} cy={0} r={r * 0.82} fill={PL} stroke={KRP.ink} strokeWidth={5} />
      {/* 縁の玉飾り (エッグ・アンド・ダート) */}
      {Array.from({ length: leaves * 2 }, (_, i) => {
        const a = (i / (leaves * 2)) * Math.PI * 2;
        const rr = r * 0.915;
        return (
          <ellipse key={`b${i}`} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr}
            rx={13} ry={9} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * rr} ${Math.sin(a) * rr})`}
            fill={i % 2 ? PL : PLd} stroke={KRP.ink} strokeWidth={3} />
        );
      })}
      {/* アカンサスの葉 (放射) */}
      {Array.from({ length: leaves }, (_, i) => {
        const deg = (i / leaves) * 360;
        const r1 = rnd(i * 23 + 5);
        return (
          <g key={`l${i}`} transform={`rotate(${deg})`}>
            <path
              d={`M0,-${r * 0.30} C${r * 0.13},-${r * 0.40} ${r * 0.11},-${r * 0.62} 0,-${r * 0.79}
                 C-${r * 0.11},-${r * 0.62} -${r * 0.13},-${r * 0.40} 0,-${r * 0.30} Z`}
              fill={i % 2 ? PL : PLs} stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={0} y1={-r * 0.33} x2={0} y2={-r * 0.74}
              stroke={PLd} strokeWidth={4} opacity={0.9} />
            {/* 葉脈 */}
            {[0.42, 0.54, 0.66].map((k) => (
              <g key={k}>
                <line x1={0} y1={-r * k} x2={r * 0.055} y2={-r * (k + 0.06)}
                  stroke={PLd} strokeWidth={3} opacity={0.75} />
                <line x1={0} y1={-r * k} x2={-r * 0.055} y2={-r * (k + 0.06)}
                  stroke={PLd} strokeWidth={3} opacity={0.75} />
              </g>
            ))}
            {/* 塗りの剥がれ */}
            {r1 > 0.62 && (
              <ellipse cx={r * 0.03} cy={-r * 0.52} rx={9} ry={14} fill={PLd} opacity={0.6} />
            )}
          </g>
        );
      })}
      {/* 渦巻き (葉の間) */}
      {Array.from({ length: leaves }, (_, i) => {
        const deg = (i / leaves) * 360 + 180 / leaves;
        return (
          <g key={`s${i}`} transform={`rotate(${deg})`}>
            <path d={`M0,-${r * 0.40} C${r * 0.10},-${r * 0.48} ${r * 0.12},-${r * 0.62}
               ${r * 0.02},-${r * 0.63} C-${r * 0.05},-${r * 0.635} -${r * 0.045},-${r * 0.55}
               ${r * 0.015},-${r * 0.555}`}
              fill="none" stroke={KRP.ink} strokeWidth={4.5} opacity={0.85} />
          </g>
        );
      })}
      {/* 中心の薔薇 (花芯から外へ3重) */}
      <circle cx={0} cy={0} r={r * 0.30} fill={PLs} stroke={KRP.ink} strokeWidth={5.5} />
      {[0, 1, 2].map((ring) => {
        const n = 6 + ring * 2;
        const rr = r * (0.11 + ring * 0.065);
        const pr = r * (0.055 - ring * 0.008);
        return Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + ring * 0.42;
          return (
            <ellipse key={`${ring}-${i}`} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr}
              rx={pr * 1.5} ry={pr}
              transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * rr} ${Math.sin(a) * rr})`}
              fill={ring % 2 ? PL : "#D8CDB4"} stroke={KRP.ink} strokeWidth={3.5} />
          );
        });
      })}
      <circle cx={0} cy={0} r={r * 0.055} fill={PLd} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

/** 煉瓦の壁の面 */
const BrickWall: React.FC<{
  x: number; y: number; w: number; h: number; pitch?: number; fill?: string; line?: string; op?: number;
}> = ({ x, y, w, h, pitch = 30, fill = "#8A4F3C", line = "#6B3A2B", op = 1 }) => {
  const rows = Math.ceil(h / pitch);
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={line} strokeWidth={3}>
        {Array.from({ length: rows }, (_, i) => (
          <line key={`r${i}`} x1={x} y1={y + i * pitch} x2={x + w} y2={y + i * pitch} />
        ))}
        {Array.from({ length: rows }, (_, i) =>
          Array.from({ length: Math.ceil(w / (pitch * 2.2)) + 1 }, (_, j) => {
            const bx = x + j * pitch * 2.2 + (i % 2 ? pitch * 1.1 : 0);
            if (bx > x + w) return null;
            return (
              <line key={`c${i}-${j}`} x1={bx} y1={y + i * pitch}
                x2={bx} y2={Math.min(y + h, y + (i + 1) * pitch)} />
            );
          }))}
      </g>
    </g>
  );
};

// ===== #147 第4章、灯りと、空気。 =====
// 格: 山
// どこ: 夜の街。5階建ての煉瓦ビルを切り開いた断面を、少し見上げる位置から
// 演出: 下2階の窓は飴色に明るく、上3階は煤色のまま暗い。屋根の煙突から煙。街灯と歩く人
// 動き: 下階の灯りが f で順に点く / 煙突の煙が流れる / 街灯の炎が揺れる / 人が歩く
// 絵: 章扉。夜のビルの断面。下の階は明るく、上の階は暗い。窓・灯り・煙突。章題
const Kb4ShouTobira: React.FC<{ f: number }> = ({ f }) => {
  const BX = 150, BW = 720;          // ビルの左端と幅
  const GY = 940;                     // 地面
  const FLH = 170;                    // 1階の高さ
  const floors = 4;
  const LPX = 1070;                   // 街灯のx
  const smoke = seg(f, 2, 42);
  const walk = easeOut(seg(f, 0, 42));
  const lit = (i: number) => easeOut(seg(f, 4 + i * 7, 18 + i * 7)); // 下から順に
  return (
    <Frame f={f} seed={740} bg={C.night} dark
      over={<ChapterDoor num={4} title="灯りと、空気。" t={seg(f, 6, 24)}
        left={1370} top={498} width={470} />}>
      {/* 夜空 */}
      <rect x={0} y={0} width={W} height={GY} fill={C.night} />
      <rect x={0} y={0} width={W} height={430} fill="#1F2B38" opacity={0.75} />
      {Array.from({ length: 40 }, (_, i) => {
        const r0 = rnd(i * 13 + 3), r1 = rnd(i * 29 + 7);
        return (
          <circle key={i} cx={r0 * W} cy={r1 * 420} r={1.8 + rnd(i * 5) * 2.4}
            fill={KRP.white} opacity={0.3 + Math.sin((f + i * 17) / 12) * 0.2} />
        );
      })}
      {/* 奥の街並みのシルエット */}
      {[[1000, 520], [1130, 440], [1270, 560], [1420, 470], [1570, 540], [1720, 420]].map(
        ([sx, sy], i) => (
          <g key={i}>
            <rect x={sx} y={sy} width={118} height={GY - sy} fill="#1A2530"
              stroke="#111A22" strokeWidth={4} />
            {Array.from({ length: 4 }, (_, j) => (
              <rect key={j} x={sx + 20 + (j % 2) * 52} y={sy + 34 + Math.floor(j / 2) * 70}
                width={38} height={46} fill={j % 3 === 0 ? C.amber : "#222E3A"}
                opacity={j % 3 === 0 ? 0.6 : 1} />
            ))}
          </g>
        ))}
      {/* 地面 */}
      <rect x={0} y={GY} width={W} height={H - GY} fill="#242D36"
        stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={i * 150} y1={GY} x2={i * 150 - 30} y2={H}
          stroke="#1A222A" strokeWidth={4} />
      ))}

      {/* ===== ビルの断面 ===== */}
      {/* 奥の煉瓦の外壁 (断面の向こう側) */}
      <BrickWall x={BX} y={GY - FLH * floors - 40} w={BW} h={FLH * floors + 40} pitch={28} />
      {/* 各階の床スラブと部屋 */}
      {Array.from({ length: floors }, (_, i) => {
        const fy = GY - FLH * (i + 1);
        const on = i < 2;                      // 下2階だけ明るい
        const a = on ? lit(i) : 0;
        return (
          <g key={i}>
            {/* 部屋の中 */}
            <rect x={BX + 16} y={fy + 14} width={BW - 32} height={FLH - 18}
              fill={on ? C.wallDark : "#2A2420"} opacity={on ? 0.35 + a * 0.6 : 1} />
            {on && (
              <rect x={BX + 16} y={fy + 14} width={BW - 32} height={FLH - 18}
                fill={C.amber} opacity={a * 0.42} />
            )}
            {/* 床スラブ */}
            <rect x={BX} y={fy} width={BW} height={16} fill={BP.slabDark}
              stroke={KRP.ink} strokeWidth={5} />
            {/* 窓 (断面側から見える開口を3つ) */}
            {[0, 1, 2].map((j) => {
              const wx = BX + 76 + j * 236;
              return (
                <g key={j}>
                  <rect x={wx} y={fy + 40} width={132} height={88}
                    fill={on ? C.flameCore : "#1C1816"} opacity={on ? 0.30 + a * 0.68 : 1}
                    stroke={BP.woodDark} strokeWidth={8} />
                  <line x1={wx + 66} y1={fy + 40} x2={wx + 66} y2={fy + 128}
                    stroke={BP.woodDark} strokeWidth={7} />
                  <line x1={wx} y1={fy + 84} x2={wx + 132} y2={fy + 84}
                    stroke={BP.woodDark} strokeWidth={7} />
                  {/* 窓台 */}
                  <rect x={wx - 10} y={fy + 128} width={152} height={13}
                    fill={BP.slab} stroke={KRP.ink} strokeWidth={4} />
                  {/* 明るい窓からもれる光 */}
                  {on && (
                    <polygon
                      points={`${wx},${fy + 44} ${wx - 54},${fy + 150} ${wx + 186},${fy + 150} ${wx + 132},${fy + 44}`}
                      fill={C.flameCore} opacity={a * 0.1} />
                  )}
                </g>
              );
            })}
            {/* 部屋の中の小さなガス灯 (下2階だけ) */}
            {on && (
              <g>
                <line x1={BX + 420} y1={fy + 14} x2={BX + 420} y2={fy + 54}
                  stroke={BP.brass} strokeWidth={8} />
                <FishTailFlame x={BX + 420} y={fy + 92} s={0.34} f={f} phase={i * 3} />
              </g>
            )}
            {/* 上階の煤 (暗い階の天井に黒いしみ) */}
            {!on && (
              <ellipse cx={BX + BW / 2} cy={fy + 26} rx={BW * 0.32} ry={20}
                fill={C.soot} opacity={0.5} />
            )}
          </g>
        );
      })}
      {/* 断面の切り口 (左右の壁の厚み) */}
      <rect x={BX - 20} y={GY - FLH * floors - 40} width={22} height={FLH * floors + 40}
        fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={BX + BW - 2} y={GY - FLH * floors - 40} width={22} height={FLH * floors + 40}
        fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 屋根 */}
      <polygon
        points={`${BX - 34},${GY - FLH * floors - 40} ${BX + BW / 2},${GY - FLH * floors - 128} ${BX + BW + 34},${GY - FLH * floors - 40}`}
        fill="#5E3B2C" stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={BX + 40 + i * 110} y1={GY - FLH * floors - 44}
          x2={BX + BW / 2 - (3 - i) * 24} y2={GY - FLH * floors - 120}
          stroke="#46291D" strokeWidth={4} />
      ))}
      {/* 煙突 */}
      <BrickWall x={BX + 520} y={GY - FLH * floors - 210} w={96} h={130} pitch={24}
        fill="#7E4635" line="#5E3225" />
      <rect x={BX + 506} y={GY - FLH * floors - 228} width={124} height={26} rx={5}
        fill={BP.slabDark} stroke={KRP.ink} strokeWidth={5} />
      <SootPlume x={BX + 568} y={GY - FLH * floors - 236} h={250} w={96} f={f}
        t={smoke} n={6} seed={4} />

      {/* ===== 街灯 ===== */}
      <g>
        <polygon points={`${LPX},${GY - 420} ${LPX - 150},${GY} ${LPX + 150},${GY}`}
          fill={C.flameCore} opacity={0.13} />
        <rect x={LPX - 12} y={GY - 300} width={24} height={300} fill={C.castIron}
          stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={LPX} cy={GY} rx={58} ry={14} fill={C.castIronPale}
          stroke={KRP.ink} strokeWidth={5} />
        {[0.3, 0.55, 0.8].map((k) => (
          <rect key={k} x={LPX - 18} y={GY - 300 * k} width={36} height={12} rx={4}
            fill={C.castIronPale} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        <GlassChimney x={LPX} y={GY - 310} w={110} h={156} />
        <FishTailFlame x={LPX} y={GY - 338} s={0.62} f={f} phase={2} />
        {/* 笠 */}
        <polygon points={`${LPX},${GY - 520} ${LPX - 68},${GY - 466} ${LPX + 68},${GY - 466}`}
          fill={C.castIron} stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ===== 歩く人 (街灯の下) ===== */}
      <ellipse cx={lerp(1300, 1200, walk)} cy={GY + 22} rx={66} ry={13}
        fill="#121A21" opacity={0.5} />
      <ellipse cx={1448} cy={GY + 32} rx={58} ry={12} fill="#121A21" opacity={0.5} />
      <Person x={lerp(1300, 1200, walk)} y={GY + 14} s={0.86} f={f} cloth="#2F3A4C"
        clothDark="#222A38" hair="cap" face="normal" gaze={[-0.3, -0.4]} />
      <Person x={1448} y={GY + 26} s={0.78} f={f} phase={3} cloth="#3C3330"
        clothDark="#2A2422" hair="cap" face="normal" gaze={[-0.5, -0.2]} />

      {/* 札 */}
      <TagPlate x={1510} y={180} text="上の階は、暗い" size={40} t={seg(f, 20, 36)}
        color={C.soot} fill="#E8E0CE" />
      <TagPlate x={1510} y={296} text="下の階だけ明るい" size={34} t={seg(f, 28, 42)}
        color={KRP.ink} fill={C.flameCore} />
    </Frame>
  );
};

// ===== #148 19世紀の灯りは、ガスの火でした。 =====
// 格: 山
// どこ: 1870年代の客間。正面から見た室内の全景。奥の壁いっぱい
// 演出: 壁のガス灯が2つ燃える。暖炉・マントルピース・絵皿・厚いカーテン・絨毯。室内は暗い
// 動き: 炎が揺れ、それに合わせて壁の光だまりと人の影が揺れる。暖炉の火も明滅
// 絵: 19世紀の室内の全景。壁のガス灯が燃え、家族が3人。飴色の壁紙・暖炉・厚いカーテン・影が揺れる
const Kb4GasNoHi: React.FC<{ f: number }> = ({ f }) => {
  const FY = 880;                                 // 床の線
  const flick = Math.sin(f / 5.5) * 0.5 + 0.5;    // 炎の明滅 0〜1
  const flick2 = Math.sin(f / 7.3 + 2) * 0.5 + 0.5;
  const shade = Math.sin(f / 6.1) * 16;           // 影の揺れ
  const on = easeOut(seg(f, 0, 14));
  return (
    <Frame f={f} seed={741} bg="#2A211A" dark>
      {/* ===== 壁 (飴色の壁紙・暗い) ===== */}
      <rect x={0} y={0} width={W} height={FY} fill={C.wallDark} />
      <rect x={0} y={0} width={W} height={FY} fill="#000000" opacity={0.3} />
      {/* 壁紙のダマスク模様 */}
      {Array.from({ length: 9 }, (_, i) =>
        Array.from({ length: 6 }, (_, j) => {
          const px = 110 + i * 215 + (j % 2 ? 107 : 0);
          const py = 100 + j * 150;
          return (
            <g key={`${i}-${j}`} opacity={0.3}>
              <path d={`M${px},${py - 34} C${px + 30},${py - 16} ${px + 30},${py + 16} ${px},${py + 34}
                 C${px - 30},${py + 16} ${px - 30},${py - 16} ${px},${py - 34} Z`}
                fill={C.wallpaper} stroke="#6B4C2C" strokeWidth={3} />
              <circle cx={px} cy={py} r={8} fill="#6B4C2C" />
              <path d={`M${px - 44},${py} C${px - 30},${py - 22} ${px - 12},${py - 22} ${px - 6},${py}`}
                fill="none" stroke={C.wallpaper} strokeWidth={3.5} />
              <path d={`M${px + 44},${py} C${px + 30},${py + 22} ${px + 12},${py + 22} ${px + 6},${py}`}
                fill="none" stroke={C.wallpaper} strokeWidth={3.5} />
            </g>
          );
        }))}
      {/* 腰板と廻り縁 */}
      <rect x={0} y={700} width={W} height={26} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={0} y={726} width={W} height={FY - 726} fill="#5E4328" />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={i * 124} y1={726} x2={i * 124} y2={FY}
          stroke="#46311C" strokeWidth={5} />
      ))}
      <rect x={0} y={54} width={W} height={22} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={5} />

      {/* ===== 床と絨毯 ===== */}
      <rect x={0} y={FY} width={W} height={H - FY} fill="#4A3722"
        stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={i * 170} y1={FY} x2={i * 170 - 40} y2={H}
          stroke="#38291A" strokeWidth={4} />
      ))}
      <path d={`M140,${FY + 16} L1780,${FY + 16} L1860,${H} L60,${H} Z`}
        fill="#7A3A34" stroke={KRP.ink} strokeWidth={6} />
      <path d={`M240,${FY + 44} L1680,${FY + 44} L1730,${H} L190,${H} Z`}
        fill="none" stroke="#C9A06A" strokeWidth={7} opacity={0.75} />

      {/* ===== 暖炉とマントルピース (左) ===== */}
      <g>
        {/* マントルピースの上板 */}
        <rect x={120} y={474} width={470} height={30} rx={5} fill="#3A3A3E"
          stroke={KRP.ink} strokeWidth={6} />
        {/* 左右の柱 */}
        <rect x={140} y={504} width={62} height={226} fill="#4A4A50"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={508} y={504} width={62} height={226} fill="#4A4A50"
          stroke={KRP.ink} strokeWidth={6} />
        {[540, 600, 660].map((yy) => (
          <g key={yy}>
            <line x1={140} y1={yy} x2={202} y2={yy} stroke="#303034" strokeWidth={4} />
            <line x1={508} y1={yy} x2={570} y2={yy} stroke="#303034" strokeWidth={4} />
          </g>
        ))}
        {/* 焚き口 */}
        <rect x={202} y={520} width={306} height={210} fill="#1A1410"
          stroke={KRP.ink} strokeWidth={6} />
        {/* 暖炉の火 */}
        <ellipse cx={355} cy={714} rx={116} ry={26} fill="#2A201A" />
        {[0, 1, 2, 3].map((i) => (
          <FishTailFlame key={i} x={286 + i * 46} y={716} s={0.26 + (i % 2) * 0.1}
            f={f} phase={i * 4} />
        ))}
        <ellipse cx={355} cy={700} rx={120 + flick * 16} ry={70 + flick * 10}
          fill={C.flame} opacity={0.2 + flick * 0.12} />
        {/* 火格子 */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={222 + i * 33} y1={660} x2={222 + i * 33} y2={730}
            stroke={C.castIron} strokeWidth={8} />
        ))}
        <line x1={214} y1={668} x2={498} y2={668} stroke={C.castIron} strokeWidth={9} />
        {/* マントルの上の絵皿と燭台 */}
        <circle cx={222} cy={436} r={44} fill="#C9BCA2" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={222} cy={436} r={28} fill="none" stroke="#7A6A50" strokeWidth={4} />
        <circle cx={222} cy={436} r={13} fill="#8A5A42" stroke={KRP.ink} strokeWidth={3} />
        <circle cx={492} cy={436} r={44} fill="#C9BCA2" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={492} cy={436} r={28} fill="none" stroke="#7A6A50" strokeWidth={4} />
        <circle cx={492} cy={436} r={13} fill="#8A5A42" stroke={KRP.ink} strokeWidth={3} />
        {/* 置き時計 */}
        <rect x={322} y={386} width={96} height={88} rx={8} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={370} cy={430} r={30} fill="#E6DCC6" stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={370} y1={430} x2={370} y2={410} stroke={KRP.ink} strokeWidth={4} />
        <line x1={370} y1={430} x2={386} y2={436} stroke={KRP.ink} strokeWidth={3.5} />
      </g>

      {/* ===== 厚いカーテンと窓 (右) ===== */}
      <g>
        <rect x={1360} y={150} width={420} height={556} fill="#1C2733"
          stroke={BP.woodDark} strokeWidth={12} />
        <line x1={1570} y1={150} x2={1570} y2={706} stroke={BP.woodDark} strokeWidth={9} />
        <line x1={1360} y1={430} x2={1780} y2={430} stroke={BP.woodDark} strokeWidth={9} />
        {/* 夜の外 (水色は影の中だけ) */}
        <circle cx={1470} cy={248} r={34} fill={C.airPale} opacity={0.3} />
        {/* カーテンレール */}
        <rect x={1300} y={122} width={540} height={20} rx={6} fill={BP.brassDark}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 左右の厚いカーテン */}
        {[0, 1].map((sd) => (
          <g key={sd}>
            <path
              d={sd === 0
                ? `M1300,142 L1300,${FY} L1420,${FY} C1392,620 1416,330 1400,142 Z`
                : `M1840,142 L1840,${FY} L1720,${FY} C1748,620 1724,330 1740,142 Z`}
              fill="#6B2A2A" stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2].map((k) => (
              <path key={k}
                d={sd === 0
                  ? `M${1326 + k * 26},150 C${1322 + k * 26},420 ${1338 + k * 26},640 ${1334 + k * 26},${FY - 6}`
                  : `M${1814 - k * 26},150 C${1818 - k * 26},420 ${1802 - k * 26},640 ${1806 - k * 26},${FY - 6}`}
                fill="none" stroke="#4E1C1C" strokeWidth={7} />
            ))}
          </g>
        ))}
        {/* 房飾り */}
        <circle cx={1424} cy={620} r={17} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1716} cy={620} r={17} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* ===== 壁のガス灯 2つ (主役) ===== */}
      {[0, 1].map((i) => {
        const gx = i === 0 ? 760 : 1180;
        const fl = i === 0 ? flick : flick2;
        return (
          <g key={i} opacity={on}>
            {/* 壁の光だまり */}
            <ellipse cx={gx} cy={320} rx={240 + fl * 30} ry={230 + fl * 26}
              fill={C.flameCore} opacity={0.11 + fl * 0.07} />
            {/* 壁付けのブラケット */}
            <rect x={gx - 24} y={236} width={48} height={40} rx={6} fill={BP.brassDark}
              stroke={KRP.ink} strokeWidth={5} />
            <HexBolt x={gx - 12} y={250} r={9} fill={BP.brassDark} />
            <HexBolt x={gx + 12} y={250} r={9} fill={BP.brassDark} />
            <rect x={gx - 12} y={276} width={24} height={62} fill={BP.brass}
              stroke={KRP.ink} strokeWidth={5} />
            {/* 笠 (反射板) */}
            <path d={`M${gx - 86},338 L${gx + 86},338 L${gx + 56},300 L${gx - 56},300 Z`}
              fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
            <GlassChimney x={gx} y={482} w={120} h={142} />
            <FishTailFlame x={gx} y={462} s={0.6} f={f} phase={i * 5} />
            <GasFitting x={gx} y={482} s={0.52} f={f} />
            {/* 天井へのびる煤 */}
            <SootPlume x={gx} y={326} h={250} w={56} f={f}
              t={seg(f, 10, 40)} n={3} seed={i + 2} />
          </g>
        );
      })}

      {/* ===== 家族3人 (炎に合わせて影が揺れる) ===== */}
      {/* 肘掛け椅子に座る人 (左) */}
      <g>
        <rect x={596} y={740} width={176} height={132} rx={14} fill="#5E2E2E"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={580} y={690} width={52} height={182} rx={12} fill="#6B3434"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={736} y={690} width={52} height={182} rx={12} fill="#6B3434"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={610} y={600} width={150} height={150} rx={16} fill="#6B3434"
          stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={684 + shade * 0.9} cy={878} rx={122} ry={18} fill="#140E0A" opacity={0.55} />
        <Person x={684} y={796} s={0.72} f={f} phase={1} cloth="#3A3348"
          clothDark="#2A2436" hair="cap" face="normal" gaze={[0.3, -0.2]} still />
      </g>
      {/* 立つ人 (中央・ガス灯のほうを見る) */}
      <ellipse cx={1020 + shade} cy={886} rx={96} ry={17} fill="#140E0A" opacity={0.55} />
      <Person x={1020} y={884} s={1.0} f={f} phase={2} cloth="#2E3A33"
        clothDark="#222C26" hair="cap" face="normal" gaze={[-0.5, -0.6]} />
      {/* 子ども (右・絨毯に立つ) */}
      <ellipse cx={1264 + shade * 1.2} cy={898} rx={70} ry={14} fill="#140E0A" opacity={0.5} />
      <Person x={1264} y={896} s={0.64} f={f} phase={4} cloth="#7A4A2E"
        clothDark="#5E3722" hair="cap" face="smile" gaze={[-0.3, -0.7]} />

      {/* 炎に照らされた床の光だまり */}
      <ellipse cx={1000} cy={FY + 70} rx={620 + flick * 50} ry={100}
        fill={C.flame} opacity={0.08 + flick * 0.04} />

      {/* 札 */}
      <TagPlate x={300} y={238} text="ガスの火" size={56} t={seg(f, 14, 28)}
        color={C.soot} fill={C.flameCore} />
      <TagPlate x={300} y={330} text="1870年代の客間" size={32} t={seg(f, 24, 40)}
        fill="#E8E0CE" />
    </Frame>
  );
};

// ===== #149 ガス灯は、煤が出ます。 =====
// 格: 並
// どこ: #148と同じ部屋のガス灯。壁紙は近いところだけ見える寄りの絵
// 演出: 描くのは「ガス灯1つ」だけ。ホヤ・真鍮の金具とねじ・コックのレバー・魚尾の炎
// 動き: 炎が揺れ、黒い煤が立ち上って画面の上へ消えていく。コックのレバーが小さく動く
// 絵: ガス灯に寄る。ガラスのホヤ・金具・魚尾の炎。黒い煤が立ち上る
const Kb4SusuGaDeru: React.FC<{ f: number }> = ({ f }) => {
  const GX = 700;                      // ガス灯の中心
  const flick = Math.sin(f / 5.2) * 0.5 + 0.5;
  const rise = seg(f, 2, 40);
  return (
    <Frame f={f} seed={742} bg="#2A211A" dark>
      {/* 近いところの壁紙だけ (寄っているので模様は大きい) */}
      <rect x={0} y={0} width={W} height={H} fill={C.wallDark} />
      <rect x={0} y={0} width={W} height={H} fill="#000000" opacity={0.32} />
      {Array.from({ length: 5 }, (_, i) =>
        Array.from({ length: 4 }, (_, j) => {
          const px = 180 + i * 430 + (j % 2 ? 215 : 0);
          const py = 150 + j * 300;
          return (
            <g key={`${i}-${j}`} opacity={0.26}>
              <path d={`M${px},${py - 76} C${px + 64},${py - 36} ${px + 64},${py + 36} ${px},${py + 76}
                 C${px - 64},${py + 36} ${px - 64},${py - 36} ${px},${py - 76} Z`}
                fill={C.wallpaper} stroke="#6B4C2C" strokeWidth={5} />
              <circle cx={px} cy={py} r={19} fill="#6B4C2C" />
              <path d={`M${px - 96},${py} C${px - 66},${py - 48} ${px - 26},${py - 48} ${px - 13},${py}`}
                fill="none" stroke={C.wallpaper} strokeWidth={6} />
              <path d={`M${px + 96},${py} C${px + 66},${py + 48} ${px + 26},${py + 48} ${px + 13},${py}`}
                fill="none" stroke={C.wallpaper} strokeWidth={6} />
            </g>
          );
        }))}
      {/* 壁の光だまり */}
      <ellipse cx={GX} cy={470} rx={430 + flick * 44} ry={400 + flick * 40}
        fill={C.flameCore} opacity={0.12 + flick * 0.07} />

      {/* ===== 煤 (ホヤの口から画面の外へ) ===== */}
      <SootPlume x={GX} y={300} h={290} w={200} f={f} t={rise} n={8} seed={9} />

      {/* ===== ガラスのホヤ (大きく。短辺の 1/3 ＋炎で画面を使い切る) ===== */}
      <GlassChimney x={GX} y={636} w={310} h={330} />
      {/* ホヤの内側の煤の曇り (上のほうだけ黒い) */}
      <path d={`M${GX - 108},330 L${GX + 108},330
         C${GX + 96},430 ${GX - 96},430 ${GX - 108},330 Z`}
        fill={C.soot} opacity={0.44} />
      {/* ホヤを受ける真鍮のギャラリー (爪3本) */}
      {[-1, 0, 1].map((k) => (
        <rect key={k} x={GX + k * 114 - 14} y={578} width={28} height={66} rx={7}
          fill={BP.brassLight} stroke={KRP.ink} strokeWidth={5} />
      ))}
      <ellipse cx={GX} cy={638} rx={164} ry={32} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={7} />
      <ellipse cx={GX} cy={632} rx={126} ry={20} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={5} />

      {/* ===== 魚尾の炎 (大きく) ===== */}
      <FishTailFlame x={GX} y={614} s={2.15} f={f} core={0.6} />

      {/* ===== 金具とコック (レバーが動く) ===== */}
      <GasFitting x={GX} y={622} s={1.14} f={f} />
      {/* 壁付けの座金とガス管 (壁の中から立ち上がる) */}
      <rect x={GX - 86} y={812} width={172} height={54} rx={10} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={GX - 62} y1={839} x2={GX + 62} y2={839} n={4} r={11} fill={BP.brassLight} />
      <rect x={GX - 20} y={860} width={40} height={220} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={6} />

      {/* 矢印と札。煤が上へ行くことを言う */}
      <ForceArrow x={GX + 246} y={366} len={250} rot={-90} w={26}
        color={C.soot} t={seg(f, 16, 34)} label="煤" labelSize={44} />
      <TagPlate x={1440} y={236} text="煤" size={64} t={seg(f, 8, 22)}
        color={KRP.white} fill={C.soot} />
      <TagPlate x={1440} y={356} text="ガラスのホヤ" size={34} t={seg(f, 18, 32)}
        fill="#E8E0CE" />
      <TagPlate x={1440} y={468} text="魚尾の炎" size={34} t={seg(f, 24, 38)}
        color={C.soot} fill={C.flameCore} />
      <TagPlate x={1440} y={580} text="コック" size={34} t={seg(f, 30, 42)}
        fill="#E8E0CE" />
      <Arrow x={GX + 242} y={782} s={1.0} rot={180} t={seg(f, 32, 42)} color={BP.brassLight} />
    </Frame>
  );
};

// ===== #150 しかも炎は、上を向いていました。 =====
// 格: 図
// どこ: 図。クリーム地＋方眼。人も背景も置かない
// 演出: 画面左2/3に巨大な魚尾の炎 (高さ 600px 超)。上向きの太い矢印2本。右に横向き＋×の対比
// 動き: 炎が揺れて明滅する / 矢印が伸びる / 煤の粒が真上へ流れる
// 絵: 炎の向きの図。上向きの矢印。熱と煤が真上へ行くことだけを言う
const Kb4HonooWaUe: React.FC<{ f: number }> = ({ f }) => {
  const FX = 640, FY = 790;            // 炎の根元
  const flick = Math.sin(f / 5.0) * 0.5 + 0.5;
  return (
    <Frame f={f} seed={743} bg={KRP.cream}>
      <GridPaper />
      {/* 熱の広がり (炎の上だけ) */}
      <ellipse cx={FX} cy={300} rx={260 + flick * 40} ry={430 + flick * 36}
        fill={C.flame} opacity={0.1 + flick * 0.05} />
      {/* バーナーの台 (切り口を太い線で) */}
      <rect x={FX - 180} y={FY} width={360} height={40} rx={8} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={9} />
      <rect x={FX - 118} y={FY - 36} width={236} height={38} rx={6} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={8} />
      {[FX - 70, FX, FX + 70].map((bx) => (
        <line key={bx} x1={bx} y1={FY - 36} x2={bx} y2={FY - 6}
          stroke={KRP.ink} strokeWidth={6} />
      ))}
      <Rivets x1={FX - 150} y1={FY + 20} x2={FX + 150} y2={FY + 20} n={5} r={11}
        fill={BP.brassLight} />
      {/* 巨大な炎 (s=6.4 → 高さ約 670px) */}
      <FishTailFlame x={FX} y={FY - 36} s={6.4} f={f} core={0.42} />
      {/* 炎の芯の線 (真上を向く中心軸) */}
      <line x1={FX} y1={FY - 60} x2={FX} y2={180} stroke={KRP.white}
        strokeWidth={8} strokeDasharray="26 20" opacity={0.6} />
      {/* 煤の粒が真上へ */}
      {Array.from({ length: 14 }, (_, i) => {
        const r0 = rnd(i * 19 + 2);
        const up = ((f * 2.6 + r0 * 150) % 150) / 150;
        return (
          <circle key={i} cx={FX + (r0 - 0.5) * 300 + Math.sin((f + i * 8) / 9) * 16}
            cy={FY - 180 - up * 520} r={6 + r0 * 9}
            fill={C.soot} opacity={(1 - up) * 0.55} />
        );
      })}
      {/* 上向きの太い矢印2本 (熱と煤) */}
      <ForceArrow x={FX - 426} y={640} len={420} rot={-90} w={34}
        color={KRP.red} t={seg(f, 6, 24)} label="熱" labelSize={52} />
      <ForceArrow x={FX + 426} y={640} len={420} rot={-90} w={34}
        color={C.soot} t={seg(f, 12, 30)} label="煤" labelSize={52} />

      {/* 右に対比: 横向きには行かない */}
      <g opacity={easeOut(seg(f, 22, 38))}>
        <ForceArrow x={1420} y={540} len={250} rot={0} w={30}
          color={KRP.gray} t={seg(f, 22, 36)} />
        <XMark x={1546} y={540} s={1.5} t={seg(f, 28, 40)} />
        <TagPlate x={1546} y={700} text="横には行かない" size={34} t={seg(f, 32, 42)} />
      </g>
      {/* 札 */}
      <TagPlate x={1510} y={200} text="炎は上を向く" size={52} t={seg(f, 4, 20)}
        color={C.soot} fill={C.flameCore} />
      <TagPlate x={300} y={200} text="真上へ" size={48} t={seg(f, 16, 32)}
        color={KRP.red} />
      <TagPlate x={254} y={706} text="バーナー" size={32} t={seg(f, 24, 40)} />
    </Frame>
  );
};

// ===== #151 だから天井が、まっさきに黒くなります。 =====
// 格: 並
// どこ: 部屋の真下から見上げた天井。画面いっぱいが天井板。四隅に壁の上端が見える
// 演出: 描くのは「黒くなる天井」だけ。天井板の板目・廻り縁・下がったガス灯の金具
// 動き: 吊り金具の真上の黒いしみが f で同心に広がる。炎が揺れ、煤が上がり続ける
// 絵: 見上げた天井。照明の真上から黒いしみが広がっていく
const Kb4TenjouGaKuroku: React.FC<{ f: number }> = ({ f }) => {
  const CX = 900, CY = 470;             // 吊り元 (天井の中心)
  const grow = easeOut(seg(f, 2, 40));  // しみの広がり
  const flick = Math.sin(f / 5.4) * 0.5 + 0.5;
  return (
    <Frame f={f} seed={744} bg="#2A241C" dark>
      {/* 天井板 (見上げなので中心へ向かって狭まる) */}
      <rect x={0} y={0} width={W} height={H} fill="#8A6A44" />
      <rect x={0} y={0} width={W} height={H} fill="#000000" opacity={0.26} />
      {/* 板目 (縦の板を 11 枚) */}
      {Array.from({ length: 12 }, (_, i) => {
        const bx = i * 168;
        return (
          <g key={i}>
            <line x1={bx} y1={0} x2={bx} y2={H} stroke="#5E4428" strokeWidth={7} />
            {/* 木目 */}
            {Array.from({ length: 4 }, (_, j) => {
              const r0 = rnd(i * 17 + j * 5);
              return (
                <path key={j}
                  d={`M${bx + 30 + r0 * 100},${j * 290} C${bx + 50 + r0 * 90},${j * 290 + 90}
                     ${bx + 20 + r0 * 110},${j * 290 + 190} ${bx + 44 + r0 * 96},${j * 290 + 290}`}
                  fill="none" stroke="#6E5230" strokeWidth={4} opacity={0.75} />
              );
            })}
          </g>
        );
      })}
      {/* 四隅の壁の上端 (見上げの手がかり) と廻り縁 */}
      {[
        `M0,0 L300,0 L0,300 Z`,
        `M${W},0 L${W - 300},0 L${W},300 Z`,
        `M0,${H} L300,${H} L0,${H - 300} Z`,
        `M${W},${H} L${W - 300},${H} L${W},${H - 300} Z`,
      ].map((d, i) => (
        <path key={i} d={d} fill="#4A3522" stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
      ))}
      {/* 廻り縁 (モールディング。見上げた四角) */}
      <g fill="none" stroke={BP.woodDark} strokeWidth={14}>
        <rect x={150} y={110} width={W - 300} height={H - 220} rx={6} />
      </g>
      <g fill="none" stroke="#C9A06A" strokeWidth={6} opacity={0.6}>
        <rect x={176} y={136} width={W - 352} height={H - 272} rx={6} />
      </g>

      {/* ===== 黒いしみ (同心に広がる) ===== */}
      {[
        { r: 430, op: 0.30, d: 0 },
        { r: 330, op: 0.40, d: 4 },
        { r: 236, op: 0.52, d: 8 },
        { r: 152, op: 0.68, d: 12 },
        { r: 84, op: 0.86, d: 16 },
      ].map((s, i) => {
        const g = easeOut(seg(f, s.d, s.d + 26));
        // 手描きのゆるい縁 (なめらかな閉曲線)
        const n = 20;
        const pt = (k: number) => {
          const a = (k / n) * Math.PI * 2;
          const rr = s.r * g * (0.90 + rnd(i * 29 + (k % n) * 7) * 0.18);
          return [CX + Math.cos(a) * rr * 1.16, CY + Math.sin(a) * rr] as const;
        };
        let d = "";
        for (let k = 0; k <= n; k += 1) {
          const [x0, y0] = pt(k);
          const [x1, y1] = pt(k + 1);
          if (k === 0) d += `M${x0.toFixed(1)},${y0.toFixed(1)}`;
          d += `Q${x0.toFixed(1)},${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)},${((y0 + y1) / 2).toFixed(1)}`;
        }
        return <path key={i} d={`${d}Z`} fill={C.soot} opacity={s.op * g} />;
      })}
      {/* しみの縁の煤の粒 */}
      {Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2 + f / 90;
        const rr = (450 + rnd(i * 13) * 150) * grow;
        return (
          <circle key={i} cx={CX + Math.cos(a) * rr * 1.18} cy={CY + Math.sin(a) * rr}
            r={5 + rnd(i * 7) * 10} fill={C.soot} opacity={0.4 * grow} />
        );
      })}

      {/* ===== 下がったガス灯 (真下から見上げた金具) ===== */}
      {/* 天井の取り付け座 */}
      <circle cx={CX} cy={CY} r={62} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={7} />
      <circle cx={CX} cy={CY} r={38} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <HexBolt key={i} x={CX + Math.cos((i * 90 + 45) * Math.PI / 180) * 50}
          y={CY + Math.sin((i * 90 + 45) * Math.PI / 180) * 50} r={12} fill={BP.brassLight} />
      ))}
      {/* 吊り棒 (見上げなので短く手前へ) */}
      <rect x={CX - 20} y={CY} width={40} height={120} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={6} />
      {[30, 60, 90].map((yy) => (
        <line key={yy} x1={CX - 20} y1={CY + yy} x2={CX + 20} y2={CY + yy}
          stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
      ))}
      {/* 笠を真下から見た同心円 */}
      <circle cx={CX} cy={CY + 170} r={150} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={8} />
      <circle cx={CX} cy={CY + 170} r={112} fill={C.flameCore}
        opacity={0.26 + flick * 0.2} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={CX} cy={CY + 170} r={66} fill={C.flame}
        opacity={0.6 + flick * 0.3} />
      <circle cx={CX} cy={CY + 170} r={30} fill={C.flameCore} opacity={0.95} />
      {/* 炎から立つ煤 (しみへ吸い込まれる) */}
      <SootPlume x={CX} y={CY + 160} h={160} w={120} f={f} t={seg(f, 4, 32)} n={4} seed={6} />

      {/* 矢印と札 */}
      <ForceArrow x={CX - 330} y={CY + 230} len={250} rot={-90} w={26}
        color={C.sootPale} t={seg(f, 14, 32)} label="煤" labelSize={44} />
      <TagPlate x={1510} y={214} text="天井が黒くなる" size={44} t={seg(f, 8, 24)}
        color={KRP.white} fill={C.soot} />
      <TagPlate x={1510} y={330} text="まっさきに" size={34} t={seg(f, 20, 36)}
        color={KRP.red} fill="#E8E0CE" />
      <TagPlate x={330} y={214} text="見上げた天井" size={34} t={seg(f, 26, 42)}
        fill="#E8E0CE" />
      <TagPlate x={1480} y={760} text="廻り縁" size={32} t={seg(f, 32, 42)} fill="#E8E0CE" />
    </Frame>
  );
};

// ===== #152 当時の天井には、照明の周りに飾りがあります。 =====
// 格: 山
// どこ: 真下から見上げた天井。石膏のメダリオンが画面いっぱい (半径 420 = 短辺の 78%)
// 演出: 葉12枚・薔薇3重・渦巻き・同心円の縁・玉飾り。石膏の陰影と塗りの剥がれ。四隅に蛇腹の廻り縁
// 動き: 飾りが呼吸するように微かに拡縮 / 下がったガス灯の炎が揺れ、光が石膏の凹凸をなめる
// 絵: 天井の飾り (石膏のメダリオン) を作り込む。葉・薔薇・渦巻き。真下から見上げる構図
const Kb4TenjouKazari: React.FC<{ f: number }> = ({ f }) => {
  const CX = 870, CY = 470, R = 420;
  const flick = Math.sin(f / 5.6) * 0.5 + 0.5;
  const appear = seg(f, 0, 20);
  return (
    <Frame f={f} seed={745} bg="#2E2720" dark>
      {/* 漆喰の天井 */}
      <rect x={0} y={0} width={W} height={H} fill="#B8A98C" />
      <rect x={0} y={0} width={W} height={H} fill="#000000" opacity={0.22} />
      {/* 漆喰のひび */}
      {Array.from({ length: 10 }, (_, i) => {
        const r0 = rnd(i * 23 + 1), r1 = rnd(i * 41 + 5);
        return (
          <path key={i}
            d={`M${r0 * W},${r1 * H} l${30 + r0 * 60},${-20 + r1 * 50} l${-18 + r1 * 44},${34 + r0 * 40}`}
            fill="none" stroke="#8A7A5E" strokeWidth={3.5} opacity={0.6} />
        );
      })}
      {/* 四隅の蛇腹の廻り縁 (3段) */}
      {[0, 1, 2].map((k) => (
        <rect key={k} x={60 + k * 34} y={44 + k * 34}
          width={W - 120 - k * 68} height={H - 88 - k * 68} rx={8}
          fill="none" stroke={k % 2 ? "#9A8C70" : BP.woodDark} strokeWidth={k === 0 ? 16 : 11} />
      ))}
      {/* 廻り縁の歯飾り (デンティル) */}
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={`t${i}`} x={110 + i * 80} y={78} width={34} height={22}
          fill="#9A8C70" stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={`b${i}`} x={110 + i * 80} y={H - 100} width={34} height={22}
          fill="#9A8C70" stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
      ))}

      {/* 炎の光が石膏をなめる (下からの光) */}
      <ellipse cx={CX} cy={CY + 120} rx={R * 1.15} ry={R * 0.95}
        fill={C.flameCore} opacity={0.14 + flick * 0.08} />

      {/* ===== メダリオン (主役・画面いっぱい) ===== */}
      <Medallion x={CX} y={CY} r={R} t={appear} f={f} leaves={12} />
      {/* 石膏の落ち影 (飾りの右下に) */}
      <g opacity={0.3}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <ellipse key={i} cx={CX + Math.cos(a) * R * 0.55 + 16}
              cy={CY + Math.sin(a) * R * 0.55 + 16} rx={R * 0.06} ry={R * 0.14}
              transform={`rotate(${(a * 180) / Math.PI + 90} ${CX + Math.cos(a) * R * 0.55 + 16} ${CY + Math.sin(a) * R * 0.55 + 16})`}
              fill="#6E6248" />
          );
        })}
      </g>

      {/* ===== 中心から下がる金具とガス灯 ===== */}
      <circle cx={CX} cy={CY} r={42} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={CX} cy={CY} r={24} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <HexBolt key={i} x={CX + Math.cos((i * 90 + 45) * Math.PI / 180) * 33}
          y={CY + Math.sin((i * 90 + 45) * Math.PI / 180) * 33} r={9} fill={BP.brassLight} />
      ))}
      {/* 吊り棒 (手前へ) */}
      <rect x={CX - 17} y={CY} width={34} height={200} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={6} />
      {[46, 92, 138, 184].map((yy) => (
        <line key={yy} x1={CX - 17} y1={CY + yy} x2={CX + 17} y2={CY + yy}
          stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
      ))}
      {/* 真下から見た笠と炎 (飾りの外側に出して、中心の薔薇を見せる) */}
      <circle cx={CX} cy={CY + 258} r={104} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={8} />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <line key={i} x1={CX + Math.cos(a) * 60} y1={CY + 258 + Math.sin(a) * 60}
            x2={CX + Math.cos(a) * 100} y2={CY + 258 + Math.sin(a) * 100}
            stroke="#8A6E22" strokeWidth={4} opacity={0.8} />
        );
      })}
      <circle cx={CX} cy={CY + 258} r={74} fill={C.flameCore}
        opacity={0.28 + flick * 0.2} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={CX} cy={CY + 258} r={44} fill={C.flame} opacity={0.65 + flick * 0.28} />
      <circle cx={CX} cy={CY + 258} r={20} fill={C.flameCore} opacity={0.95} />
      {/* わずかな煤 */}
      <SootPlume x={CX} y={CY + 250} h={150} w={100} f={f} t={seg(f, 16, 40)} n={3} seed={11} />

      {/* 札 */}
      <TagPlate x={1588} y={212} text="石膏の飾り" size={46} t={seg(f, 10, 26)}
        color={KRP.ink} fill="#E6DCC6" />
      <TagPlate x={1588} y={324} text="葉と薔薇と渦巻き" size={30} t={seg(f, 20, 36)}
        fill="#E6DCC6" />
      <TagPlate x={1588} y={430} text="照明の周り" size={30} t={seg(f, 28, 42)}
        fill="#E6DCC6" />
      <TagPlate x={238} y={212} text="見上げ" size={34} t={seg(f, 24, 40)} fill="#E6DCC6" />
      <Arrow x={CX + R + 54} y={CY - 120} s={0.9} rot={180} t={seg(f, 30, 42)}
        color={BP.woodDark} />
    </Frame>
  );
};

// ===== #153 飾りの奥には、換気の穴が隠されていました。 =====
// 格: 図
// どこ: 図。#152の飾りの右半分を切った断面。石膏の色と葉の調子は#152と同じ (対の寄り)
// 演出: 葉と葉の谷の影に、穴が3つ隠れている。穴の縁の立ち上がり・奥の暗がりまで描く
// 動き: 葉の影が f で退いて穴があらわになる / 穴の奥から煤が吸い込まれていく
// 絵: 飾りの断面。葉の影に隠された穴が見える (#152と対の寄り)
const Kb4KazariNoOku: React.FC<{ f: number }> = ({ f }) => {
  const TOP = 388;                    // 石膏の上面 (天井裏がわ)
  const BOT = 606;                    // 石膏の下面 (部屋がわ)
  const PL = "#E6DCC6", PLs = "#C6B99C", PLd = "#A99C80";
  const reveal = easeOut(seg(f, 10, 36));   // 影が退いて穴が見える
  const holes = [460, 900, 1340];
  const LW = 220;                     // 葉1枚の幅
  return (
    <Frame f={f} seed={746} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 石膏の飾りの断面 (端から端まで・厚く) ===== */}
      <rect x={-20} y={TOP} width={W + 40} height={BOT - TOP} fill={PLs}
        stroke={KRP.ink} strokeWidth={12} />
      {/* 切り口のハッチング (断面の印) */}
      <g stroke={PLd} strokeWidth={6} opacity={0.85}>
        {Array.from({ length: 34 }, (_, i) => (
          <line key={i} x1={i * 62 - 40} y1={BOT} x2={i * 62 + 180} y2={TOP} />
        ))}
      </g>
      {/* 石膏の下面の輪郭 = 葉の山と谷 (#152 と同じ葉を横から見た形) */}
      {Array.from({ length: 9 }, (_, i) => {
        const lx = 100 + i * LW;
        return (
          <g key={i}>
            <path d={`M${lx - LW / 2},${BOT} C${lx - 72},${BOT + 142} ${lx + 72},${BOT + 142} ${lx + LW / 2},${BOT}`}
              fill={i % 2 ? PL : "#D8CDB4"} stroke={KRP.ink} strokeWidth={8} />
            {/* 葉の中筋 */}
            <line x1={lx} y1={BOT + 14} x2={lx} y2={BOT + 112} stroke={PLd} strokeWidth={7} />
            {/* 葉脈 */}
            {[0.34, 0.54].map((k) => (
              <g key={k}>
                <path d={`M${lx - 62},${BOT + 26} C${lx - 40},${BOT + 70 * k + 50} ${lx - 18},${BOT + 92} ${lx - 5},${BOT + 102}`}
                  fill="none" stroke={PLd} strokeWidth={5} opacity={0.8} />
                <path d={`M${lx + 62},${BOT + 26} C${lx + 40},${BOT + 70 * k + 50} ${lx + 18},${BOT + 92} ${lx + 5},${BOT + 102}`}
                  fill="none" stroke={PLd} strokeWidth={5} opacity={0.8} />
              </g>
            ))}
            {/* 塗りの剥がれ */}
            {rnd(i * 13 + 3) > 0.5 && (
              <ellipse cx={lx + 34} cy={BOT + 62} rx={17} ry={12} fill={PLd} opacity={0.6} />
            )}
          </g>
        );
      })}

      {/* ===== 葉の谷に隠された換気の穴 ===== */}
      {holes.map((hx, i) => {
        const r = easeOut(seg(f, 10 + i * 5, 32 + i * 5));
        return (
          <g key={hx}>
            {/* 穴の奥 (上へ続く暗がり。上ほど薄れる) */}
            <path d={`M${hx - 52},${TOP} L${hx - 58},150 L${hx + 58},150 L${hx + 52},${TOP} Z`}
              fill="#2A2420" opacity={0.3} />
            {/* 穴の筒 (石膏を貫く) */}
            <rect x={hx - 52} y={TOP - 4} width={104} height={BOT - TOP + 10}
              fill="#241F1A" stroke={KRP.ink} strokeWidth={8} />
            {/* 筒の内壁の照り */}
            <rect x={hx - 36} y={TOP} width={14} height={BOT - TOP}
              fill={PLd} opacity={0.35} />
            {/* 穴の縁の立ち上がり (面取り。部屋がわ) */}
            <path d={`M${hx - 82},${BOT + 16} L${hx - 52},${BOT - 26} L${hx + 52},${BOT - 26} L${hx + 82},${BOT + 16} Z`}
              fill={PLd} stroke={KRP.ink} strokeWidth={7} />
            {/* 吸い込まれる煤 (下から筒を抜けて上へ) */}
            <g opacity={r}>
              {Array.from({ length: 7 }, (_, k) => {
                const up = ((f * 2.4 + k * 20 + i * 11) % 140) / 140;
                return (
                  <circle key={k} cx={hx + (rnd(i * 7 + k * 3) - 0.5) * 60}
                    cy={BOT + 90 - up * 440} r={7 + rnd(k * 5 + i) * 10}
                    fill={C.soot} opacity={(1 - up * 0.8) * 0.6} />
                );
              })}
            </g>
            {/* 葉の影 (f で退いて穴があらわになる) */}
            <path d={`M${hx - LW / 2},${BOT - 8} C${hx - 72},${BOT + 136} ${hx + 72},${BOT + 136} ${hx + LW / 2},${BOT - 8} Z`}
              fill={C.soot} opacity={0.6 * (1 - reveal)} />
            {/* 上向きの矢印 (筒の上) */}
            <ForceArrow x={hx} y={TOP - 40} len={200} rot={-90} w={24}
              color={C.soot} t={seg(f, 18 + i * 4, 38 + i * 4)} />
          </g>
        );
      })}

      {/* 寸法の引き出し (穴の径) */}
      <g opacity={easeOut(seg(f, 28, 42))}>
        <g stroke={KRP.ink} strokeWidth={5}>
          <line x1={holes[1] - 52} y1={TOP - 112} x2={holes[1] + 52} y2={TOP - 112} />
          <line x1={holes[1] - 52} y1={TOP - 130} x2={holes[1] - 52} y2={TOP - 94} />
          <line x1={holes[1] + 52} y1={TOP - 130} x2={holes[1] + 52} y2={TOP - 94} />
        </g>
      </g>

      {/* 札 */}
      <TagPlate x={1600} y={168} text="換気の穴" size={46} t={seg(f, 4, 20)}
        color={KRP.white} fill={C.soot} />
      <TagPlate x={1600} y={276} text="飾りの奥に隠す" size={30} t={seg(f, 18, 34)} />
      <TagPlate x={300} y={168} text="飾りの断面" size={34} t={seg(f, 10, 26)} />
      <TagPlate x={300} y={276} text="石膏" size={32} t={seg(f, 24, 38)} fill={PL} />
      <TagPlate x={holes[1]} y={790} text="葉の谷に開く" size={32} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ===== #154 煤と熱を、天井裏へ逃がすためです。 =====
// 格: 図
// どこ: 図。#153の穴から上へ、天井裏までを一枚に切った断面。切り口の線を太く
// 演出: 下=部屋 (暗い)、中=石膏と穴、上=天井裏の梁と野地板、梁の間にたまった煤
// 動き: 煤と熱の矢印が穴を通って上へ伸びる / 粒が穴を抜けて天井裏へ散る
// 絵: 天井裏までの断面。煤と熱が穴から上へ抜ける矢印
const Kb4TenjouuraE: React.FC<{ f: number }> = ({ f }) => {
  const CEIL = 560;                    // 石膏の下面
  const ATTIC = 450;                   // 石膏の上面 = 天井裏の床
  const ROOF = 150;                    // 野地板の下面
  const HX = 820;                      // 穴の中心
  const PL = "#E6DCC6", PLs = "#C6B99C", PLd = "#A99C80";
  const flow = seg(f, 4, 36);
  return (
    <Frame f={f} seed={747} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 上: 天井裏 ===== */}
      <rect x={-20} y={ROOF} width={W + 40} height={ATTIC - ROOF} fill="#6E5F4C" />
      <rect x={-20} y={ROOF} width={W + 40} height={ATTIC - ROOF}
        fill="#000000" opacity={0.12} />
      {/* 野地板 (天井裏の上) */}
      <rect x={-20} y={ROOF - 54} width={W + 40} height={56} fill={BP.wood}
        stroke={KRP.ink} strokeWidth={10} />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={i * 124} y1={ROOF - 54} x2={i * 124} y2={ROOF + 2}
          stroke={BP.woodDark} strokeWidth={5} />
      ))}
      {/* 梁 (断面で切られた角材。切り口に木口のハッチ) */}
      {[220, 560, 1080, 1420, 1760].map((bx, i) => (
        <g key={bx}>
          <rect x={bx - 58} y={ROOF} width={116} height={ATTIC - ROOF} fill={BP.wood}
            stroke={KRP.ink} strokeWidth={9} />
          {/* 木口の年輪 */}
          {[0.22, 0.38, 0.54, 0.7].map((k) => (
            <ellipse key={k} cx={bx} cy={ROOF + (ATTIC - ROOF) * 0.45}
              rx={54 * k} ry={(ATTIC - ROOF) * 0.42 * k}
              fill="none" stroke={BP.woodDark} strokeWidth={4} opacity={0.8} />
          ))}
          {/* 梁の根元にたまった煤 */}
          <path d={`M${bx - 58},${ATTIC} q28,-${22 + i * 5} 58,-${14 + i * 4}
             q30,8 58,${14 + i * 4} Z`} fill={C.soot} opacity={0.75} />
        </g>
      ))}
      {/* 天井裏の床にたまった煤 (穴の周りが濃い) */}
      {Array.from({ length: 5 }, (_, i) => {
        const g = easeOut(seg(f, 8 + i * 4, 32 + i * 4));
        const r = (90 + i * 110) * g;
        return (
          <ellipse key={i} cx={HX} cy={ATTIC - 10} rx={r} ry={18 + i * 5}
            fill={C.soot} opacity={(0.62 - i * 0.1) * g} />
        );
      })}
      {/* 天井裏に舞う煤の粒 */}
      {Array.from({ length: 18 }, (_, i) => {
        const r0 = rnd(i * 17 + 3), r1 = rnd(i * 31 + 9);
        const up = ((f * 2.0 + r0 * 130) % 130) / 130;
        return (
          <circle key={i} cx={HX + (r1 - 0.5) * 700 * up + Math.sin((f + i * 9) / 10) * 14}
            cy={ATTIC - up * (ATTIC - ROOF - 20)} r={5 + r0 * 9}
            fill={C.sootPale} opacity={(1 - up * 0.8) * 0.6 * flow} />
        );
      })}

      {/* ===== 中: 石膏の天井の厚み (切り口の線を太く) ===== */}
      <rect x={-20} y={ATTIC} width={W + 40} height={CEIL - ATTIC} fill={PLs}
        stroke={KRP.ink} strokeWidth={12} />
      <g stroke={PLd} strokeWidth={5} opacity={0.85}>
        {Array.from({ length: 38 }, (_, i) => (
          <line key={i} x1={i * 54 - 20} y1={CEIL} x2={i * 54 + 90} y2={ATTIC} />
        ))}
      </g>
      {/* 石膏の下面の葉 (#153 と同じ調子) */}
      {Array.from({ length: 10 }, (_, i) => {
        const lx = 100 + i * 192;
        return (
          <g key={i}>
            <path d={`M${lx - 94},${CEIL} C${lx - 60},${CEIL + 60} ${lx + 60},${CEIL + 60} ${lx + 94},${CEIL}`}
              fill={i % 2 ? PL : "#D8CDB4"} stroke={KRP.ink} strokeWidth={7} />
            <line x1={lx} y1={CEIL + 8} x2={lx} y2={CEIL + 48} stroke={PLd} strokeWidth={5} />
          </g>
        );
      })}
      {/* 穴 (石膏を貫く筒。奥の暗がり) */}
      <rect x={HX - 50} y={ATTIC - 6} width={100} height={CEIL - ATTIC + 18}
        fill="#1A1512" stroke={KRP.ink} strokeWidth={9} />
      <path d={`M${HX - 72},${CEIL + 10} L${HX - 50},${CEIL - 22} L${HX + 50},${CEIL - 22} L${HX + 72},${CEIL + 10} Z`}
        fill={PLd} stroke={KRP.ink} strokeWidth={7} />

      {/* ===== 下: 部屋 (暗い) ===== */}
      <rect x={-20} y={CEIL + 56} width={W + 40} height={H - CEIL - 36} fill="#2E2520" />
      <rect x={-20} y={CEIL + 56} width={W + 40} height={H - CEIL - 36}
        fill={C.wallDark} opacity={0.35} />
      {/* 部屋のガス灯 (穴の真下) */}
      <rect x={HX - 14} y={CEIL + 40} width={28} height={70} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={6} />
      <path d={`M${HX - 86},${CEIL + 158} L${HX + 86},${CEIL + 158} L${HX + 52},${CEIL + 110} L${HX - 52},${CEIL + 110} Z`}
        fill={BP.brassDark} stroke={KRP.ink} strokeWidth={6} />
      <FishTailFlame x={HX} y={CEIL + 288} s={1.15} f={f} />
      <ellipse cx={HX} cy={CEIL + 230} rx={250} ry={180}
        fill={C.flameCore} opacity={0.13 + Math.sin(f / 5.5) * 0.05} />

      {/* ===== 穴を通る煤と熱の矢印 ===== */}
      <ForceArrow x={HX - 170} y={CEIL + 30} len={320} rot={-90} w={30}
        color={KRP.red} t={seg(f, 6, 26)} label="熱" labelSize={48} />
      <ForceArrow x={HX + 170} y={CEIL + 30} len={320} rot={-90} w={30}
        color={C.soot} t={seg(f, 12, 32)} label="煤" labelSize={48} />
      {/* 穴の中を抜ける太い矢印 */}
      <ForceArrow x={HX} y={CEIL + 20} len={300} rot={-90} w={40}
        color={C.flame} t={seg(f, 16, 38)} />

      {/* 札 */}
      <TagPlate x={1560} y={236} text="天井裏" size={48} t={seg(f, 4, 20)}
        color={KRP.white} fill={C.soot} />
      <TagPlate x={1560} y={348} text="梁にたまる煤" size={30} t={seg(f, 18, 34)}
        fill="#E8E0CE" />
      <TagPlate x={300} y={236} text="ここへ逃がす" size={34} t={seg(f, 12, 28)}
        color={KRP.red} fill="#E8E0CE" />
      <TagPlate x={300} y={506} text="天井" size={32} t={seg(f, 24, 38)} fill={PL} />
      <TagPlate x={1620} y={760} text="部屋" size={32} t={seg(f, 30, 42)} fill="#E8E0CE" />
    </Frame>
  );
};

// ===== #155 一酸化炭素も出るので、窓を閉めきれません。 =====
// 格: 並
// どこ: 冬の部屋。上げ下げ窓に寄った絵。窓は画面の高さの6割を占める
// 演出: 描くのは「指の幅だけ開いた窓」だけ。外は雪。人は1人 (膝に毛布・肩をすくめる)
// 動き: 隙間から入る冷気の筋が流れ込む / 雪が降る / 人が震える (小さく上下) / ガス灯が揺れる
// 絵: 冬の部屋。窓が指の幅だけ開いている。外は雪。肩をすくめる人
const Kb4MadoWoShimerenai: React.FC<{ f: number }> = ({ f }) => {
  const WX = 640, WY = 150, WW = 620, WH = 660;   // 窓枠
  const GAP = 26;                                  // 開いている隙間
  const MID = WY + WH * 0.46;                      // 下窓の上框の位置
  const shiver = Math.sin(f / 2.6) * 2.4;
  const cold = seg(f, 2, 40);
  const flick = Math.sin(f / 5.8) * 0.5 + 0.5;
  return (
    <Frame f={f} seed={748} bg="#2A2420" dark>
      {/* 部屋の壁 (暗い飴色) */}
      <rect x={0} y={0} width={W} height={H} fill={C.wallDark} />
      <rect x={0} y={0} width={W} height={H} fill="#000000" opacity={0.36} />
      {/* 壁紙の縦縞 */}
      {Array.from({ length: 24 }, (_, i) => (
        <line key={i} x1={i * 82} y1={0} x2={i * 82} y2={H}
          stroke={C.wallpaper} strokeWidth={9} opacity={0.14} />
      ))}
      {/* 腰板 */}
      <rect x={0} y={852} width={W} height={24} fill={BP.woodDark} />

      {/* ===== 上げ下げ窓 ===== */}
      {/* 外 (雪の夜) */}
      <rect x={WX} y={WY} width={WW} height={WH} fill="#52636E" />
      <rect x={WX} y={WY} width={WW} height={WH * 0.62} fill="#3E4E5A" />
      {/* 外の家並みのシルエット */}
      {[[WX + 40, 520], [WX + 180, 470], [WX + 330, 540], [WX + 470, 490]].map(([sx, sy], i) => (
        <g key={i}>
          <rect x={sx} y={sy} width={110} height={WY + WH - sy} fill="#2E3C46" />
          <polygon points={`${sx - 12},${sy} ${sx + 55},${sy - 46} ${sx + 122},${sy}`}
            fill={C.snow} opacity={0.8} />
        </g>
      ))}
      {/* 積もった雪 */}
      <path d={`M${WX},${WY + WH - 60} Q${WX + 150},${WY + WH - 96} ${WX + 310},${WY + WH - 62}
         Q${WX + 470},${WY + WH - 94} ${WX + WW},${WY + WH - 56} L${WX + WW},${WY + WH} L${WX},${WY + WH} Z`}
        fill={C.snow} opacity={0.92} />
      {/* 降る雪 */}
      {Array.from({ length: 46 }, (_, i) => {
        const r0 = rnd(i * 13 + 1), r1 = rnd(i * 29 + 5);
        const dy = ((f * (1.6 + r1 * 1.8) + r0 * WH) % WH);
        return (
          <circle key={i} cx={WX + r0 * WW + Math.sin((f + i * 11) / 14) * 16}
            cy={WY + dy} r={3 + r1 * 5} fill={C.snow} opacity={0.5 + r1 * 0.45} />
        );
      })}

      {/* 窓枠 (太い木) */}
      <rect x={WX - 26} y={WY - 26} width={WW + 52} height={WH + 52} fill="none"
        stroke={BP.woodDark} strokeWidth={52} />
      <rect x={WX - 26} y={WY - 26} width={WW + 52} height={WH + 52} fill="none"
        stroke={KRP.ink} strokeWidth={7} />
      {/* 上窓 (サッシ)。下框が GAP ぶん上にずれて隙間ができている */}
      <g>
        <rect x={WX + 10} y={WY + 10} width={WW - 20} height={MID - WY - 10 - GAP}
          fill="none" stroke={BP.woodDark} strokeWidth={26} />
        <line x1={WX + WW / 2} y1={WY + 10} x2={WX + WW / 2} y2={MID - GAP}
          stroke={BP.woodDark} strokeWidth={16} />
        <line x1={WX + 10} y1={WY + (MID - WY) * 0.5} x2={WX + WW - 10} y2={WY + (MID - WY) * 0.5}
          stroke={BP.woodDark} strokeWidth={14} />
        {/* ガラスの反射 */}
        <path d={`M${WX + 60},${MID - GAP - 30} L${WX + 230},${WY + 40}`}
          stroke={KRP.white} strokeWidth={10} opacity={0.22} />
      </g>
      {/* 下窓 */}
      <g>
        <rect x={WX + 10} y={MID} width={WW - 20} height={WY + WH - MID - 10}
          fill="none" stroke={BP.woodDark} strokeWidth={26} />
        <line x1={WX + WW / 2} y1={MID} x2={WX + WW / 2} y2={WY + WH - 10}
          stroke={BP.woodDark} strokeWidth={16} />
        <line x1={WX + 10} y1={MID + (WY + WH - MID) * 0.5}
          x2={WX + WW - 10} y2={MID + (WY + WH - MID) * 0.5}
          stroke={BP.woodDark} strokeWidth={14} />
      </g>
      {/* ★隙間 (指の幅だけ) */}
      <rect x={WX + 10} y={MID - GAP} width={WW - 20} height={GAP}
        fill="#1A2630" stroke={KRP.ink} strokeWidth={5} />
      {/* 隙間から見える雪片 */}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={WX + 60 + i * 70} cy={MID - GAP / 2 + Math.sin((f + i * 7) / 6) * 6}
          r={4} fill={C.snow} opacity={0.8} />
      ))}
      {/* 掛け金 (開いているので外れている) */}
      <g>
        <rect x={WX + WW / 2 - 40} y={MID + 4} width={80} height={20} rx={6}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${-38} ${WX + WW / 2} ${MID + 14})`}>
          <rect x={WX + WW / 2 - 6} y={MID - 44} width={16} height={52} rx={6}
            fill={BP.brassLight} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      </g>

      {/* ===== 冷気の筋 (隙間から室内へ斜めに降りる) ===== */}
      {Array.from({ length: 7 }, (_, i) => {
        const r0 = rnd(i * 23 + 7);
        const t = easeOut(clamp01(cold - i * 0.06));
        const sx = WX + 70 + i * 78;
        const L = (260 + r0 * 190) * t;
        const sw = Math.sin((f + i * 13) / 11) * 22;
        return (
          <path key={i}
            d={`M${sx},${MID - GAP + 10} C${sx - 40 + sw},${MID + L * 0.4}
               ${sx - 120 + sw},${MID + L * 0.7} ${sx - 170 + sw * 0.5},${MID + L}`}
            fill="none" stroke={C.airPale} strokeWidth={13 + r0 * 8}
            strokeLinecap="round" opacity={0.42 * t} />
        );
      })}
      {/* 冷気の粒 */}
      {Array.from({ length: 16 }, (_, i) => {
        const r0 = rnd(i * 31 + 3);
        const p = ((f * 2.4 + r0 * 110) % 110) / 110;
        return (
          <circle key={i} cx={WX + 90 + r0 * 460 - p * 230} cy={MID + p * 330}
            r={4 + r0 * 6} fill={C.airBlue} opacity={(1 - p) * 0.5 * cold} />
        );
      })}

      {/* ===== ガス灯 (点いている。右の壁) ===== */}
      <g>
        <ellipse cx={1600} cy={330} rx={210 + flick * 26} ry={200 + flick * 24}
          fill={C.flameCore} opacity={0.12 + flick * 0.07} />
        <rect x={1588} y={196} width={24} height={62} fill={BP.brass}
          stroke={KRP.ink} strokeWidth={5} />
        <path d={`M1512,312 L1688,312 L1656,262 L1544,262 Z`}
          fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <GlassChimney x={1600} y={470} w={130} h={150} />
        <FishTailFlame x={1600} y={448} s={0.66} f={f} phase={3} />
        <GasFitting x={1600} y={470} s={0.56} f={f} />
        <SootPlume x={1600} y={300} h={200} w={60} f={f} t={seg(f, 12, 40)} n={3} seed={14} />
      </g>

      {/* ===== 肩をすくめた人1人 (膝に毛布・椅子に座る) ===== */}
      <g transform={`translate(0 ${shiver})`}>
        {/* 椅子 */}
        <rect x={214} y={726} width={168} height={120} rx={10} fill="#5E3A2E"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={226} y={566} width={146} height={166} rx={12} fill="#6B4234"
          stroke={KRP.ink} strokeWidth={6} />
        {[600, 646, 692].map((yy) => (
          <line key={yy} x1={232} y1={yy} x2={366} y2={yy} stroke="#4A2C22" strokeWidth={5} />
        ))}
        <Person x={298} y={780} s={0.78} f={f} phase={1} cloth="#3A3548"
          clothDark="#2A2636" hair="cap" face="worried" gaze={[0.6, -0.2]} still />
        {/* 膝の毛布 */}
        <path d="M196,742 Q298,702 400,742 L418,840 Q298,812 178,840 Z"
          fill="#7A4A3A" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={204 + i * 52} y1={726} x2={196 + i * 52} y2={834}
            stroke="#5E3528" strokeWidth={5} />
        ))}
        {/* 白い息 */}
        {Array.from({ length: 3 }, (_, i) => {
          const p = ((f + i * 14) % 42) / 42;
          return (
            <ellipse key={i} cx={330 + p * 80} cy={592 - p * 40}
              rx={20 + p * 26} ry={13 + p * 16} fill={C.airPale}
              opacity={(1 - p) * 0.5} />
          );
        })}
      </g>

      {/* 札 */}
      <TagPlate x={1510} y={690} text="閉めきれない" size={40} t={seg(f, 8, 24)}
        color={KRP.red} fill="#E8E0CE" />
      <TagPlate x={312} y={212} text="一酸化炭素" size={44} t={seg(f, 2, 18)}
        color={KRP.white} fill={C.soot} />
      <TagPlate x={312} y={322} text="冬でも隙間を空ける" size={28} t={seg(f, 18, 34)}
        fill="#E8E0CE" />
      <TagPlate x={1500} y={474} text="指の幅だけ開く" size={30} t={seg(f, 24, 40)}
        color={KRP.ink} fill={C.airPale} />
      <Arrow x={WX + WW + 56} y={MID - GAP / 2} s={0.8} rot={180} t={seg(f, 28, 42)}
        color={C.airPale} />
    </Frame>
  );
};

// ===== #156 1882年、エジソンが発電所を動かしました。 =====
// 格: 山
// どこ: 1882年の発電所の機械室。煉瓦の建屋の中。左に焚き口、中央にはずみ車、右に発電機の列
// 演出: 巨大なはずみ車と長いベルトが画面を斜めに横切る。石炭の赤い光・配電盤。ここから明るくなる
// 動き: はずみ車が回り、ベルトが流れる / 焚き口の火が明滅 / 配電盤の針が振れる / 人の背中が石炭をくべる
// 絵: 発電所の中。ベルト・蒸気機関・発電機・石炭をくべる口。年号の札。人物の顔は描かない
const Kb4Hatsudensho1882: React.FC<{ f: number }> = ({ f }) => {
  const FWX = 1180, FWY = 460, FWR = 300;      // はずみ車
  const rot = f * 5.2;                           // 回る
  const belt = (f * 9) % 44;                     // ベルトの流れ
  const fire = Math.sin(f / 4.4) * 0.5 + 0.5;
  const needle = Math.sin(f / 9) * 22;
  const stoke = Math.sin(f / 12) * 16;           // くべる動き
  return (
    <Frame f={f} seed={749} bg="#3A2E26" dark>
      {/* ===== 建屋 ===== */}
      <BrickWall x={-20} y={-20} w={W + 40} h={H + 40} pitch={40}
        fill="#7A4432" line="#5A3024" />
      <rect x={0} y={0} width={W} height={H} fill="#000000" opacity={0.3} />
      {/* アーチ窓 (夜) */}
      {[300, 980, 1660].map((ax) => (
        <g key={ax}>
          <path d={`M${ax - 95},300 L${ax - 95},130 A95,95 0 0 1 ${ax + 95},130 L${ax + 95},300 Z`}
            fill="#223040" stroke="#4A2A20" strokeWidth={14} />
          <line x1={ax} y1={56} x2={ax} y2={300} stroke="#4A2A20" strokeWidth={8} />
          <line x1={ax - 95} y1={200} x2={ax + 95} y2={200} stroke="#4A2A20" strokeWidth={8} />
        </g>
      ))}
      {/* 床 */}
      <rect x={0} y={840} width={W} height={H - 840} fill="#4A4038"
        stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={i * 200} y1={840} x2={i * 200 - 40} y2={H}
          stroke="#38302A" strokeWidth={5} />
      ))}

      {/* ===== 天井の長い主軸と吊り金具 ===== */}
      <rect x={-20} y={330} width={W + 40} height={34} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={6} />
      {[160, 560, 960, 1360, 1760].map((hx) => (
        <g key={hx}>
          <rect x={hx - 16} y={250} width={32} height={84} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={5} />
          <HexBolt x={hx} y={262} r={14} />
        </g>
      ))}
      <Rivets x1={40} y1={347} x2={1880} y2={347} n={18} r={9} />

      {/* ===== 焚き口 (左。赤い光) ===== */}
      <g>
        <rect x={60} y={560} width={400} height={300} rx={12} fill={C.castIron}
          stroke={KRP.ink} strokeWidth={9} />
        <Rivets x1={88} y1={586} x2={432} y2={586} n={9} r={10} fill={C.castIronPale} />
        {/* 扉の口 (開いていて赤い) */}
        <rect x={120} y={640} width={200} height={180} rx={8} fill="#1A0E08"
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={120} y={640} width={200} height={180} fill="#C9321E"
          opacity={0.55 + fire * 0.35} />
        <rect x={132} y={720} width={176} height={92} fill={C.flameCore}
          opacity={0.4 + fire * 0.4} />
        {[0, 1, 2, 3].map((i) => (
          <FishTailFlame key={i} x={152 + i * 48} y={814} s={0.3 + (i % 2) * 0.12}
            f={f} phase={i * 5} />
        ))}
        {/* 焚き口の外へもれる赤い光 */}
        <polygon points="120,650 -40,900 480,900 320,650" fill="#E85A2E"
          opacity={0.14 + fire * 0.1} />
        {/* 開いた鋳鉄の扉 */}
        <g transform="rotate(-24 330 730)">
          <rect x={318} y={632} width={28} height={196} rx={6} fill={C.castIronPale}
            stroke={KRP.ink} strokeWidth={7} />
        </g>
        <circle cx={398} cy={730} r={22} fill={C.castIronPale}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 石炭の山 */}
        <path d="M-10,860 Q60,800 150,836 Q110,858 60,860 Z" fill="#241F1C"
          stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => (
          <polygon key={i}
            points={`${20 + i * 17},${842 + rnd(i * 7) * 14} ${34 + i * 17},${830 + rnd(i * 11) * 12} ${46 + i * 17},${848 + rnd(i * 5) * 10}`}
            fill="#332C27" stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 蒸気のボイラー管 */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={70 + i * 134} y={500} width={60} height={64} rx={8}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        ))}
      </g>

      {/* ===== 石炭をくべる人 (背中だけ。顔は描かない) ===== */}
      <g transform={`translate(${stoke * 0.6} 0)`}>
        {/* 胴 (背中) */}
        <path d="M470,860 Q452,742 510,700 Q568,678 596,714 Q630,760 614,860 Z"
          fill="#2E2A28" stroke={KRP.ink} strokeWidth={7} />
        {/* 頭 (後頭部のみ。顔なし) */}
        <circle cx={548} cy={664} r={48} fill="#2A2522" stroke={KRP.ink} strokeWidth={7} />
        <path d="M506,648 Q548,614 592,650" fill="none" stroke="#1E1A18" strokeWidth={9} />
        {/* 腕 (シャベルを握る) */}
        <path d={`M512,730 Q456,${770 + stoke} 404,${806 + stoke}`} fill="none"
          stroke="#2E2A28" strokeWidth={34} strokeLinecap="round" />
        <path d={`M596,742 Q556,${796 + stoke * 0.6} 500,${826 + stoke * 0.6}`} fill="none"
          stroke="#2E2A28" strokeWidth={30} strokeLinecap="round" />
        {/* シャベル */}
        <line x1={396} y1={800 + stoke} x2={512} y2={834 + stoke * 0.6}
          stroke={BP.wood} strokeWidth={16} strokeLinecap="round" />
        <path d={`M396,${800 + stoke} l-56,${-4} l-10,${44} l58,${10} Z`}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        {/* 脚 */}
        <rect x={486} y={840} width={40} height={60} fill="#1E1A18"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={556} y={840} width={40} height={60} fill="#1E1A18"
          stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* ===== 巨大なはずみ車 (回る) ===== */}
      <g>
        {/* ベルト (はずみ車 → 天井の主軸) */}
        <g stroke={BP.grease} strokeWidth={30} fill="none" opacity={0.95}>
          <line x1={FWX - FWR + 6} y1={FWY} x2={700} y2={347} />
          <line x1={FWX + FWR - 6} y1={FWY} x2={1700} y2={347} />
        </g>
        <g stroke={KRP.ink} strokeWidth={5} fill="none">
          <line x1={FWX - FWR - 9} y1={FWY} x2={688} y2={333} />
          <line x1={FWX - FWR + 21} y1={FWY} x2={712} y2={361} />
          <line x1={FWX + FWR + 9} y1={FWY} x2={1712} y2={333} />
          <line x1={FWX + FWR - 21} y1={FWY} x2={1688} y2={361} />
        </g>
        {/* ベルトの継ぎ目 (流れる) */}
        {Array.from({ length: 11 }, (_, i) => {
          const t = ((i * 44 + belt) % 484) / 484;
          return (
            <g key={i}>
              <line x1={lerp(FWX - FWR, 700, t)} y1={lerp(FWY, 347, t)}
                x2={lerp(FWX - FWR, 700, t) + 14} y2={lerp(FWY, 347, t) - 16}
                stroke={BP.woodDark} strokeWidth={7} />
              <line x1={lerp(FWX + FWR, 1700, t)} y1={lerp(FWY, 347, t)}
                x2={lerp(FWX + FWR, 1700, t) - 14} y2={lerp(FWY, 347, t) - 16}
                stroke={BP.woodDark} strokeWidth={7} />
            </g>
          );
        })}
        {/* 車輪の外輪 */}
        <circle cx={FWX} cy={FWY} r={FWR} fill="none" stroke={C.castIron} strokeWidth={46} />
        <circle cx={FWX} cy={FWY} r={FWR} fill="none" stroke={KRP.ink} strokeWidth={7} />
        <circle cx={FWX} cy={FWY} r={FWR - 46} fill="none" stroke={KRP.ink} strokeWidth={6} />
        {/* スポーク (回る) */}
        <g transform={`rotate(${rot} ${FWX} ${FWY})`}>
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 45} ${FWX} ${FWY})`}>
              <rect x={FWX - 13} y={FWY - FWR + 30} width={26} height={FWR - 30}
                fill={C.castIronPale} stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
          <circle cx={FWX} cy={FWY} r={62} fill={C.castIron}
            stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 6 }, (_, i) => (
            <HexBolt key={i} x={FWX + Math.cos((i * 60) * Math.PI / 180) * 42}
              y={FWY + Math.sin((i * 60) * Math.PI / 180) * 42} r={12} />
          ))}
        </g>
        <circle cx={FWX} cy={FWY} r={26} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 軸受けの台 */}
        <path d={`M${FWX - 76},${FWY + 40} L${FWX + 76},${FWY + 40} L${FWX + 112},840 L${FWX - 112},840 Z`}
          fill={C.castIron} stroke={KRP.ink} strokeWidth={8} />
        <Rivets x1={FWX - 70} y1={700} x2={FWX + 70} y2={700} n={5} r={10}
          fill={C.castIronPale} />
        {/* 蒸気機関の連接棒 (ピストンへ) */}
        <g transform={`rotate(${rot} ${FWX} ${FWY})`}>
          <circle cx={FWX} cy={FWY - 200} r={20} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>

      {/* ===== 発電機の列 (右) ===== */}
      {[0, 1, 2].map((i) => {
        const dx = 1452 + i * 158;
        return (
          <g key={i}>
            <rect x={dx - 62} y={640} width={124} height={200} rx={10}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={8} />
            {/* 磁極 */}
            <rect x={dx - 44} y={600} width={88} height={56} rx={8} fill={C.castIron}
              stroke={KRP.ink} strokeWidth={6} />
            {/* 巻線 (銅) */}
            {Array.from({ length: 5 }, (_, k) => (
              <line key={k} x1={dx - 56} y1={676 + k * 30} x2={dx + 56} y2={676 + k * 30}
                stroke={KRP.copper} strokeWidth={11} />
            ))}
            {/* 回る整流子 */}
            <g transform={`rotate(${-rot * 1.6} ${dx} ${FWY + 110})`}>
              <circle cx={dx} cy={FWY + 110} r={34} fill={KRP.brass}
                stroke={KRP.ink} strokeWidth={6} />
              <line x1={dx - 30} y1={FWY + 110} x2={dx + 30} y2={FWY + 110}
                stroke={KRP.ink} strokeWidth={5} />
              <line x1={dx} y1={FWY + 80} x2={dx} y2={FWY + 140}
                stroke={KRP.ink} strokeWidth={5} />
            </g>
            {/* 火花 */}
            {Array.from({ length: 3 }, (_, k) => (
              <line key={`s${k}`} x1={dx + 26} y1={FWY + 100}
                x2={dx + 42 + Math.sin((f + k * 9 + i * 5) / 3) * 10}
                y2={FWY + 86 + k * 9} stroke={C.bulb} strokeWidth={4}
                opacity={0.4 + Math.abs(Math.sin((f + k * 7) / 4)) * 0.6} />
            ))}
          </g>
        );
      })}

      {/* ===== 配電盤 (右上。針が振れる) ===== */}
      <g>
        <rect x={1392} y={400} width={400} height={170} rx={10} fill={BP.board}
          stroke={KRP.ink} strokeWidth={9} />
        <Rivets x1={1414} y1={420} x2={1770} y2={420} n={8} r={8} fill={BP.steelLight} />
        {[0, 1, 2].map((i) => {
          const mx = 1456 + i * 92;
          return (
            <g key={i}>
              <circle cx={mx} cy={494} r={38} fill="#E6DCC6"
                stroke={BP.brass} strokeWidth={7} />
              <path d={`M${mx - 26},${494} A26,26 0 0 1 ${mx + 26},${494}`}
                fill="none" stroke={KRP.ink} strokeWidth={4} />
              <g transform={`rotate(${needle + i * 8 - 12} ${mx} ${494})`}>
                <line x1={mx} y1={494} x2={mx} y2={468} stroke={KRP.red} strokeWidth={5} />
              </g>
              <circle cx={mx} cy={494} r={5} fill={KRP.ink} />
            </g>
          );
        })}
        {/* 開閉器 (レバー) */}
        <rect x={1700} y={458} width={66} height={80} rx={8} fill={C.castIron}
          stroke={KRP.ink} strokeWidth={6} />
        <g transform={`rotate(${24 + needle * 0.2} 1733 528)`}>
          <rect x={1726} y={468} width={16} height={64} rx={7} fill={KRP.copper}
            stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>

      {/* ここから明るくなる: 発電機からの光 */}
      <ellipse cx={1600} cy={700} rx={420} ry={300} fill={C.bulb}
        opacity={0.07 + easeOut(seg(f, 14, 40)) * 0.1} />

      {/* 札 */}
      <TagPlate x={300} y={212} text="1882年" size={64} t={seg(f, 2, 18)}
        color={C.soot} fill={C.bulb} />
      <TagPlate x={840} y={212} text="発電所" size={48} t={seg(f, 12, 28)}
        color={KRP.white} fill={C.castIron} />
      <TagPlate x={300} y={330} text="エジソン" size={32} t={seg(f, 20, 36)}
        fill="#E8E0CE" />
      <TagPlate x={880} y={790} text="はずみ車" size={32} t={seg(f, 26, 40)}
        fill="#E8E0CE" />
      <TagPlate x={1640} y={290} text="配電盤" size={32} t={seg(f, 30, 42)}
        fill="#E8E0CE" />
    </Frame>
  );
};

// ===== #157 電気の灯りは、火を使いません。煤も出ない。 =====
// 格: 図
// どこ: 図。クリーム地＋方眼。MaruBatsu の対比台に左=ガスの炎、右=白熱球
// 演出: 電球を作り込む (フィラメントの螺旋・支持線・口金のねじ山・ガラスの合わせ目・排気の尖り)
// 動き: 左の炎が揺れ、煤の筋が左にだけ立ち上る / 右はフィラメントが静かに明滅し、光の輪が広がる
// 絵: 左に炎＋赤い×、右に白熱球＋○。フィラメントと口金まで作り込む
const Kb4HiWoTsukawanai: React.FC<{ f: number }> = ({ f }) => {
  const flick = Math.sin(f / 5.0) * 0.5 + 0.5;
  const glow = easeOut(seg(f, 10, 38));
  const hum = Math.sin(f / 13) * 0.5 + 0.5;
  // 左: ガスのバーナーと魚尾の炎。原点 (0,0) が台の上面 = 物の底
  const gasNode = (
    <g>
      {/* 炎の明かり */}
      <ellipse cx={0} cy={-300} rx={230 + flick * 30} ry={220 + flick * 26}
        fill={C.flame} opacity={0.13 + flick * 0.07} />
      {/* 煤の筋 (左にだけ上がる) */}
      <SootPlume x={0} y={-482} h={250} w={190} f={f} t={seg(f, 4, 36)} n={7} seed={21} />
      {/* ガラスのホヤ */}
      <GlassChimney x={0} y={-182} w={290} h={300} />
      {/* ホヤの内側の煤の曇り */}
      <path d="M-102,-458 L102,-458 C92,-368 -92,-368 -102,-458 Z"
        fill={C.soot} opacity={0.46} />
      {/* 魚尾の炎 */}
      <FishTailFlame x={0} y={-208} s={1.5} f={f} />
      {/* ホヤ受けのギャラリー */}
      {[-1, 0, 1].map((k) => (
        <rect key={k} x={k * 104 - 13} y={-238} width={26} height={60} rx={6}
          fill={BP.brassLight} stroke={KRP.ink} strokeWidth={5} />
      ))}
      <ellipse cx={0} cy={-180} rx={150} ry={28} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={6} />
      {/* 金具とコック */}
      <GasFitting x={0} y={-182} s={1.0} f={f} />
    </g>
  );
  // 右: 白熱球 (作り込む)。原点 (0,0) が台の上面 = 口金の底
  const BY = -330;        // ガラス球の中心
  const BR = 150;         // ガラス球の半径
  const SPIRAL = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    const fx = lerp(-11, 11, t);
    const fy = BY - 10 - Math.sin(t * Math.PI) * 64;
    const ox = Math.sin(t * Math.PI * 11) * 22;
    const oy = Math.cos(t * Math.PI * 11) * 12;
    return `${i === 0 ? "M" : "L"}${(fx + ox).toFixed(1)},${(fy - oy).toFixed(1)}`;
  }).join(" ");
  const bulbNode = (
    <g>
      {/* 光の輪 (f で広がる) */}
      <circle cx={0} cy={BY} r={BR + 190} fill={C.bulb}
        opacity={glow * (0.16 + hum * 0.07)} />
      {[0, 1, 2].map((i) => {
        const g = easeOut(clamp01(glow - i * 0.18));
        return (
          <circle key={i} cx={0} cy={BY} r={(BR + 56 + i * 76) * g} fill="none"
            stroke={C.bulb} strokeWidth={15 - i * 3} opacity={(0.42 - i * 0.11) * g} />
        );
      })}
      {/* ガラス球 (梨形。首は下、排気の尖りは上) */}
      <path
        d={`M-48,-186 C-${BR * 0.80},-214 -${BR + 10},-300 -${BR * 0.92},-382
           C-${BR * 0.72},-452 -${BR * 0.30},-482 0,-480
           C${BR * 0.30},-482 ${BR * 0.72},-452 ${BR * 0.92},-382
           C${BR + 10},-300 ${BR * 0.80},-214 48,-186 Z`}
        fill={C.glass} fillOpacity={0.26} stroke={KRP.ink} strokeWidth={6} />
      {/* 排気の尖り (ティップ。頂点に残るガラスの突起) */}
      <path d="M-16,-472 L0,-520 L16,-472 Z"
        fill={C.glass} fillOpacity={0.55} stroke={KRP.ink} strokeWidth={5} />
      {/* ガラスの合わせ目 (縦のハイライト2本) */}
      <path d="M-96,-250 C-112,-320 -82,-410 -56,-446"
        fill="none" stroke={KRP.white} strokeWidth={11} opacity={0.58} strokeLinecap="round" />
      <path d="M86,-236 C104,-310 76,-400 54,-438"
        fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.38} strokeLinecap="round" />
      {/* 内部: ステムとボタン */}
      <rect x={-15} y={-250} width={30} height={66} fill={C.glass}
        fillOpacity={0.6} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={0} cy={-250} rx={27} ry={14} fill={C.glass}
        fillOpacity={0.7} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 支持線 (モリブデンの針3本) */}
      {[-1, 0, 1].map((k) => (
        <line key={k} x1={k * 9} y1={-252} x2={k * 62} y2={-404}
          stroke={BP.wire} strokeWidth={4.5} />
      ))}
      {/* 導入線 2本 (口金からフィラメントへ) */}
      <line x1={-11} y1={-150} x2={-11} y2={-340} stroke={BP.wire} strokeWidth={7} />
      <line x1={11} y1={-150} x2={11} y2={-340} stroke={BP.wire} strokeWidth={7} />
      {/* ★フィラメントの螺旋 (光る) */}
      <g>
        <ellipse cx={0} cy={-372} rx={84} ry={56} fill={C.bulb}
          opacity={(0.32 + hum * 0.22) * glow} />
        <path d={SPIRAL} fill="none" stroke={C.flame} strokeWidth={11}
          strokeLinecap="round" opacity={0.5 + glow * 0.45} />
        <path d={SPIRAL} fill="none" stroke={C.bulb} strokeWidth={7}
          strokeLinecap="round" opacity={0.6 + glow * 0.4} />
        <path d={SPIRAL} fill="none" stroke={KRP.white} strokeWidth={3}
          strokeLinecap="round" opacity={(0.5 + hum * 0.4) * glow} />
      </g>
      {/* 首リング */}
      <rect x={-66} y={-186} width={132} height={36} rx={7} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={6} />
      {/* ★口金 (ねじ山)。少し下へ細くなる */}
      <path d="M-58,-150 L-50,-10 L50,-10 L58,-150 Z"
        fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 7 }, (_, i) => {
        const yy = -140 + i * 19;
        return (
          <path key={i} d={`M-55,${yy} Q0,${yy + 15} 55,${yy - 5}`} fill="none"
            stroke={BP.brassDark} strokeWidth={6.5} />
        );
      })}
      {/* 口金とガラスの間の絶縁 (黒い輪) */}
      <rect x={-52} y={-16} width={104} height={14} rx={5} fill={C.soot}
        stroke={KRP.ink} strokeWidth={4.5} />
      {/* 底の電極 */}
      <ellipse cx={0} cy={-2} rx={50} ry={16} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={-2} r={21} fill={C.castIron} stroke={KRP.ink} strokeWidth={5} />
      {/* 煤が出ないことの印 (空っぽの丸が3つ上がる) */}
      <g opacity={glow}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={-104 + i * 104} cy={-610 - Math.sin((f + i * 11) / 12) * 10}
            r={15} fill="none" stroke={KRP.green} strokeWidth={6} strokeDasharray="11 10" />
        ))}
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={750} bg={KRP.cream}>
      <GridPaper />
      {/* 対比台。marks は自前で置く (MaruBatsu の固定位置だと物に重なる) */}
      <MaruBatsu x={960} y={700} s={1.0} t={seg(f, 2, 20)}
        leftNode={gasNode} rightNode={bulbNode}
        leftText="ガスの火" rightText="電気の灯り"
        leftMark="none" rightMark="none" gap={860} labelSize={38} />
      {/* ×と○ (物の外側に置く) */}
      <XMark x={222} y={420} s={1.9} t={seg(f, 14, 30)} />
      <Maru x={1716} y={420} s={1.15} t={seg(f, 20, 36)} />
      {/* 煤の矢印は左にだけ */}
      <ForceArrow x={742} y={430} len={240} rot={-90} w={26}
        color={C.soot} t={seg(f, 12, 32)} label="煤" labelSize={42} />
      {/* 札 */}
      <TagPlate x={248} y={142} text="火を使う" size={40} t={seg(f, 8, 24)}
        color={KRP.white} fill={C.soot} />
      <TagPlate x={1670} y={142} text="火を使わない" size={38} t={seg(f, 16, 32)}
        color={C.soot} fill={C.bulb} />
      <TagPlate x={1690} y={638} text="煤も出ない" size={34} t={seg(f, 30, 42)}
        color={KRP.green} />
      <TagPlate x={238} y={638} text="煤が出る" size={34} t={seg(f, 24, 40)}
        color={KRP.white} fill={C.soot} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb4_shou_tobira: (f) => <Kb4ShouTobira f={f} />,
  kb4_gas_no_hi: (f) => <Kb4GasNoHi f={f} />,
  kb4_susu_ga_deru: (f) => <Kb4SusuGaDeru f={f} />,
  kb4_honoo_wa_ue: (f) => <Kb4HonooWaUe f={f} />,
  kb4_tenjou_ga_kuroku: (f) => <Kb4TenjouGaKuroku f={f} />,
  kb4_tenjou_kazari: (f) => <Kb4TenjouKazari f={f} />,
  kb4_kazari_no_oku: (f) => <Kb4KazariNoOku f={f} />,
  kb4_tenjouura_e: (f) => <Kb4TenjouuraE f={f} />,
  kb4_mado_wo_shimerenai: (f) => <Kb4MadoWoShimerenai f={f} />,
  kb4_1882_hatsudensho: (f) => <Kb4Hatsudensho1882 f={f} />,
  kb4_hi_wo_tsukawanai: (f) => <Kb4HiWoTsukawanai f={f} />,
};

export const K_B4A_MOTIFS: string[] = [
  "kb4_shou_tobira",         // #147 第4章、灯りと、空気。
  "kb4_gas_no_hi",           // #148 19世紀の灯りは、ガスの火でした。
  "kb4_susu_ga_deru",        // #149 ガス灯は、煤が出ます。
  "kb4_honoo_wa_ue",         // #150 しかも炎は、上を向いていました。
  "kb4_tenjou_ga_kuroku",    // #151 だから天井が、まっさきに黒くなります。
  "kb4_tenjou_kazari",       // #152 当時の天井には、照明の周りに飾りがあります。
  "kb4_kazari_no_oku",       // #153 飾りの奥には、換気の穴が隠されていました。
  "kb4_tenjouura_e",         // #154 煤と熱を、天井裏へ逃がすためです。
  "kb4_mado_wo_shimerenai",  // #155 一酸化炭素も出るので、窓を閉めきれません。
  "kb4_1882_hatsudensho",    // #156 1882年、エジソンが発電所を動かしました。
  "kb4_hi_wo_tsukawanai",    // #157 電気の灯りは、火を使いません。煤も出ない。
];

export const kosoB4aScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
