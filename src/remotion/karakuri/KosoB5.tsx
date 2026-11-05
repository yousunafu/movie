// 「なぜ高層ビルは生まれたのか」: 第5章「島には、土地がない。」前半 (5本立った〜島は増えない)
// 担当範囲: 台本 docs/koso-script-v7.txt の 180〜189行目 (文#179〜#188・10文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は必ず kb5_ で始める。WobbleDefs の seed はこのファイルでは 800〜809 を使う。
// 設計書: docs/koso-ch5-design.md (1文ごとの「格」と絵の中身が決まっている)
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
import {
  KPP, TowerOnPillars, PILLAR_X, PILLAR_ORDER, PILLAR_META,
  PILLAR_TOP, PILLAR_BOTTOM, type PillarId,
} from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。金物の色は BP を使う)
// ===================================================================
const C = {
  sea: "#8FB3C4",
  seaDark: "#5E8597",
  island: "#D8CDB6",
  rock: "#9A8E78",
  paper: "#EFE7D4",
  mapLine: "#A08A62",
  gold: "#D9A93E",
  goldDark: "#9E7820",
  graphRed: "#C0483A",
  graphBlue: "#4A6E8A",
  cityPale: "#C8CFD4",
  cityDark: "#7E8A93",
  dust: "#B5A68D",
  darkSky: "#56606B",
  // 舞台 (#185) の色は、この章の語彙 (海の青灰 / 島のベージュ / 岩盤) から採る。
  // 赤い緞帳と濃紺はこの章に無い色だったので捨てた。
  stageWall: "#41596A",   // 奥の壁 = 海の深いところ
  curtain: "#5E8597",     // 緞帳 = 海の青灰
  curtainDark: "#44667A",
  stageFloor: "#CDBF9F",  // 床 = 島のベージュ
  stageFloorDark: "#A89372",
  shadow: "#2A3A44",
  spot: "#F2E6C8",
};

// ===================================================================
// この章だけのローカル部品
// ===================================================================

// ----- マンハッタン島の輪郭 (#179・#187・#188 で同じ形を使う) -----
// 南端 (バッテリー) t=0 → 北端 t=1。side=+1 がイースト川側、-1 がハドソン川側。
const ISL = { x0: 262, y0: 702, x1: 1678, y1: 252 };
const ISL_L = Math.hypot(ISL.x1 - ISL.x0, ISL.y1 - ISL.y0);
const ISL_U = { x: (ISL.x1 - ISL.x0) / ISL_L, y: (ISL.y1 - ISL.y0) / ISL_L };
const ISL_N = { x: -ISL_U.y, y: ISL_U.x };   // 東(右下)向きの法線
const ISL_PROF: [number, number][] = [
  [0, 0], [0.035, 40], [0.09, 64], [0.17, 86], [0.26, 106],
  [0.37, 124], [0.47, 134], [0.57, 127], [0.67, 112],
  [0.77, 92], [0.86, 68], [0.94, 44], [1, 13],
];
const islHalf = (t: number) => {
  const tc = clamp01(t);
  for (let i = 1; i < ISL_PROF.length; i++) {
    const [ta, wa] = ISL_PROF[i - 1];
    const [tb, wb] = ISL_PROF[i];
    if (tc <= tb) return lerp(wa, wb, (tc - ta) / (tb - ta || 1));
  }
  return 13;
};
const islMid = (t: number): [number, number] => [
  ISL.x0 + ISL_U.x * ISL_L * t, ISL.y0 + ISL_U.y * ISL_L * t,
];
const islEdge = (t: number, side: number, jag = true): [number, number] => {
  const [mx, my] = islMid(t);
  const w = islHalf(t) + (jag ? (rnd(Math.round(t * 997) + (side > 0 ? 31 : 71)) - 0.5) * 11 : 0);
  return [mx + ISL_N.x * w * side, my + ISL_N.y * w * side];
};
const islPath = (jag = true, n = 48) => {
  const p: string[] = [];
  for (let i = 0; i <= n; i++) { const [x, y] = islEdge(i / n, 1, jag); p.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
  for (let i = n; i >= 0; i--) { const [x, y] = islEdge(i / n, -1, jag); p.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
  return `M${p.join(" L")} Z`;
};

// ----- 海と波 -----
const Kb5Sea: React.FC<{ f: number; rows?: number }> = ({ f, rows = 8 }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.sea} />
    {/* 深いところ (画面の四隅を沈ませる) */}
    <g fill={C.seaDark} opacity={0.26}>
      <rect x={-20} y={-20} width={W + 40} height={150} />
      <rect x={-20} y={H - 190} width={W + 40} height={210} />
    </g>
    <g stroke={C.seaDark} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.55}>
      {Array.from({ length: rows * 11 }, (_, k) => {
        const ix = k % 11, iy = Math.floor(k / 11);
        const bx = -40 + ix * 182 + (iy % 2) * 91;
        const by = 54 + iy * 134 + rnd(k * 1.7) * 18;
        const dx = Math.sin(f / 21 + rnd(k * 3.3) * 6.283) * 13;
        return <path key={k} d={`M${bx + dx} ${by} q 23 -14 46 0 q 23 14 46 0`} />;
      })}
    </g>
  </g>
);

// ----- 俯瞰のビル1棟 (前面 + 窓の列 + 屋根) -----
const Kb5Roof: React.FC<{
  x: number; y: number; w: number; h: number; d?: number; t?: number; seed?: number;
}> = ({ x, y, w, h, d = 10, t = 1, seed = 0 }) => {
  const hh = h * easeOut(clamp01(t));
  if (hh < 1) return null;
  const pale = rnd(seed * 7.1) > 0.55;
  const rows = Math.max(1, Math.floor(hh / 23));
  return (
    <g>
      <polygon
        points={`${x - w / 2},${y} ${x + w / 2},${y} ${x + w / 2},${y - hh} ${x - w / 2},${y - hh}`}
        fill={pale ? C.cityPale : KPP.towerFace} stroke={KRP.ink} strokeWidth={2.6} />
      <g fill={C.cityDark} opacity={0.7}>
        {Array.from({ length: rows }, (_, r) => (
          <rect key={r} x={x - w / 2 + 4} y={y - hh + 8 + r * 23} width={Math.max(2, w - 8)} height={7} />
        ))}
      </g>
      <polygon
        points={`${x - w / 2},${y - hh} ${x + w / 2},${y - hh} ${x + w / 2 - d * 0.6},${y - hh - d} ${x - w / 2 - d * 0.6},${y - hh - d}`}
        fill={C.cityDark} stroke={KRP.ink} strokeWidth={2.6} />
    </g>
  );
};

// ----- 島を端から端までビルで埋める -----
const Kb5IslandCity: React.FC<{ f: number; n?: number; appear?: boolean }> = ({ f, n = 104, appear = true }) => {
  const items = Array.from({ length: n }, (_, i) => {
    const t = clamp01(0.03 + (i / n) * 0.93 + (rnd(i * 2.1) - 0.5) * 0.014);
    const u = (rnd(i * 5.7) - 0.5) * 1.52;
    const [mx, my] = islMid(t);
    const hw = islHalf(t);
    const x = mx + ISL_N.x * u * hw;
    const y = my + ISL_N.y * u * hw;
    // 南端 (ウォール街) と中ほど (ミッドタウン) が高い
    const peak = Math.max(
      Math.exp(-((t - 0.07) ** 2) / 0.0035),
      Math.exp(-((t - 0.45) ** 2) / 0.012) * 0.92,
    );
    return {
      i, x, y, t,
      w: 20 + rnd(i * 3.7) * 22,
      h: 15 + peak * 112 + rnd(i * 9.3) * 32,
    };
  }).sort((a, b) => a.y - b.y);
  return (
    <g>
      {items.map((b) => (
        <Kb5Roof key={b.i} x={b.x} y={b.y} w={b.w} h={b.h} seed={b.i}
          t={appear ? seg(f, 2 + (1 - b.t) * 16, 14 + (1 - b.t) * 16) : 1} />
      ))}
    </g>
  );
};

// ----- 碁盤の街路 -----
const Kb5Streets: React.FC<{ opacity?: number }> = ({ opacity = 0.5 }) => (
  <g stroke={C.mapLine} strokeWidth={3} opacity={opacity} fill="none" strokeLinecap="round">
    {[-0.72, -0.46, -0.2, 0.06, 0.32, 0.58, 0.82].map((u, i) => (
      <polyline key={`a${i}`} points={Array.from({ length: 22 }, (_, k) => {
        const t = 0.04 + (k / 21) * 0.92;
        const [mx, my] = islMid(t);
        const hw = islHalf(t);
        return `${(mx + ISL_N.x * u * hw).toFixed(1)},${(my + ISL_N.y * u * hw).toFixed(1)}`;
      }).join(" ")} />
    ))}
    {Array.from({ length: 25 }, (_, i) => {
      const t = 0.05 + i * 0.0365;
      const [ax, ay] = islEdge(t, -0.92, false);
      const [bx, by] = islEdge(t, 0.92, false);
      return <line key={`s${i}`} x1={ax} y1={ay} x2={bx} y2={by} />;
    })}
  </g>
);

// ----- 岸壁 (桟橋が櫛のように突き出す) -----
const Kb5Piers: React.FC = () => (
  <g>
    {Array.from({ length: 36 }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      const t = 0.05 + Math.floor(i / 2) * 0.052;
      if (t > 0.93) return null;
      const [ex, ey] = islEdge(t, side, false);
      const len = 24 + rnd(i * 4.3) * 26;
      const nx = ISL_N.x * side, ny = ISL_N.y * side;
      return (
        <g key={i}>
          <line x1={ex} y1={ey} x2={ex + nx * len} y2={ey + ny * len}
            stroke={BP.woodDark} strokeWidth={9} strokeLinecap="round" />
          <rect x={ex + nx * len * 0.45 - 8} y={ey + ny * len * 0.45 - 8}
            width={17} height={15} fill={C.dust} stroke={KRP.ink} strokeWidth={2} />
        </g>
      );
    })}
  </g>
);

// ----- 船 (煙を吐く汽船 / 帆船) -----
const Kb5Ship: React.FC<{ x: number; y: number; s?: number; f: number; sail?: boolean }> = ({ x, y, s = 1, f, sail = false }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 15 + x / 90) * 4}) scale(${s})`}>
    <path d="M-62 0 L62 0 L48 22 L-48 22 Z" fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-34} y={-18} width={56} height={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    {sail ? (
      <g>
        <line x1={0} y1={-18} x2={0} y2={-96} stroke={KRP.ink} strokeWidth={5} />
        <path d="M2 -92 L44 -24 L2 -24 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M-2 -80 L-38 -26 L-2 -26 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    ) : (
      <g>
        <rect x={-8} y={-54} width={22} height={38} fill={BP.rust} stroke={KRP.ink} strokeWidth={3.5} />
        {[0, 1, 2].map((i) => {
          const p = ((f / 11 + i * 0.33) % 1);
          return (
            <circle key={i} cx={3 - p * 46} cy={-58 - p * 52} r={9 + p * 13}
              fill={C.dust} stroke={KRP.ink} strokeWidth={2.5} opacity={0.75 * (1 - p)} />
          );
        })}
      </g>
    )}
    <g stroke={C.seaDark} strokeWidth={4} strokeLinecap="round" opacity={0.7}>
      <path d={`M-96 ${26} q 24 -11 48 0`} />
      <path d={`M54 ${26} q 24 -11 48 0`} />
    </g>
  </g>
);

// ----- 吊り橋 (#187 の2本) -----
const Kb5Bridge: React.FC<{ ax: number; ay: number; bx: number; by: number; f: number; t?: number }> = ({ ax, ay, bx, by, f, t = 1 }) => {
  const ap = easeOut(clamp01(t));
  if (ap <= 0.01) return null;
  const ex = lerp(ax, bx, ap), ey = lerp(ay, by, ap);
  const t1x = lerp(ax, bx, 0.26), t1y = lerp(ay, by, 0.26);
  const t2x = lerp(ax, bx, 0.74), t2y = lerp(ay, by, 0.74);
  const dip = 46 + Math.sin(f / 26) * 3;
  const mx = (t1x + t2x) / 2, my = (t1y + t2y) / 2;
  return (
    <g>
      <line x1={ax} y1={ay} x2={ex} y2={ey} stroke={BP.slabDark} strokeWidth={17} strokeLinecap="round" />
      <line x1={ax} y1={ay} x2={ex} y2={ey} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
      {ap > 0.8 && (
        <g>
          <path d={`M${t1x} ${t1y - 70} Q ${mx} ${my - 70 + dip} ${t2x} ${t2y - 70}`}
            fill="none" stroke={KRP.ink} strokeWidth={5} />
          {[t1x, t2x].map((tx, i) => {
            const ty = i === 0 ? t1y : t2y;
            return (
              <g key={i}>
                <rect x={tx - 11} y={ty - 86} width={22} height={88} fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
                <line x1={tx - 11} y1={ty - 58} x2={tx + 11} y2={ty - 58} stroke={KRP.ink} strokeWidth={4} />
              </g>
            );
          })}
          <g stroke={KRP.ink} strokeWidth={2.6} opacity={0.8}>
            {Array.from({ length: 7 }, (_, i) => {
              const q = (i + 1) / 8;
              const hx = lerp(t1x, t2x, q), hy = lerp(t1y, t2y, q);
              const sagY = hy - 70 + Math.sin(q * Math.PI) * dip;
              return <line key={i} x1={hx} y1={sagY} x2={hx} y2={hy} />;
            })}
          </g>
        </g>
      )}
    </g>
  );
};

// ----- 5本柱の装置 (#180・#181・#184 で同じ形を使う) -----
const Kb5PillarFig: React.FC<{
  f: number; standing?: PillarId[]; maru?: boolean; maruT?: (i: number) => number;
}> = ({ f, standing = [], maru = false, maruT }) => (
  <g>
    {/* 左端の寸法線 (柱の高さ)。装置の縮尺を示す */}
    <g stroke={KRP.ink} strokeWidth={5}>
      <line x1={108} y1={PILLAR_TOP} x2={108} y2={PILLAR_BOTTOM} />
      <line x1={88} y1={PILLAR_TOP} x2={128} y2={PILLAR_TOP} />
      <line x1={88} y1={PILLAR_BOTTOM} x2={128} y2={PILLAR_BOTTOM} />
      <polygon points={`108,${PILLAR_TOP + 2} 99,${PILLAR_TOP + 26} 117,${PILLAR_TOP + 26}`} fill={KRP.ink} stroke="none" />
      <polygon points={`108,${PILLAR_BOTTOM - 2} 99,${PILLAR_BOTTOM - 26} 117,${PILLAR_BOTTOM - 26}`} fill={KRP.ink} stroke="none" />
    </g>
    <text x={70} y={PILLAR_TOP + 148} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={40} fill={KRP.ink}>柱</text>
    <TowerOnPillars f={f} ground labels={false} lit={1} standing={standing} />
    {maru && PILLAR_ORDER.map((id, i) => {
      const t = clamp01(maruT ? maruT(i) : 1);
      if (t <= 0) return null;
      return (
        <g key={id}>
          <circle cx={PILLAR_X[id]} cy={684} r={42 * pop(t)} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5} />
          <Maru x={PILLAR_X[id]} y={684} s={0.46} stroke={18} t={t} color={KRP.green} />
        </g>
      );
    })}
  </g>
);

// ----- 同じ5本柱を「真下から見上げた」図 (#181 専用のカメラ) -----
// #180 は真横の断面。#181 で同じ絵を出さないために、床に立って見上げた形で描き直す。
// 5本が上へすぼまり、頭の上を街のスラブが塞いでいる。柱の中身は横から見たときと同じ物。
const UP_TOP = 300;          // 柱の上端 (スラブの下面)
const UP_BOT = 1000;         // 柱の下端 (足元。カメラのすぐ手前)
const upY = (v: number) => lerp(UP_TOP, UP_BOT, v);
const upHW = (v: number) => lerp(34, 92, v);                    // 奥は細く、手前は太い
const upCX = (id: PillarId, v: number) => 960 + (PILLAR_X[id] - 960) * lerp(0.6, 1.58, v);

const Kb5UpPillar: React.FC<{ id: PillarId; f: number; lit: number }> = ({ id, f, lit }) => {
  const m = PILLAR_META[id];
  const P = (v: number, k: number) => `${upCX(id, v) + upHW(v) * k},${upY(v)}`;
  const guts = (() => {
    if (id === "hone") {
      const n = 7;
      return (
        <g stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.78}>
          {Array.from({ length: n }, (_, i) => {
            const v0 = i / n, v1 = (i + 1) / n;
            const c0 = upCX(id, v0), c1 = upCX(id, v1);
            const h0 = upHW(v0) * 0.62, h1 = upHW(v1) * 0.62;
            return (
              <g key={i}>
                <line x1={c0 - h0} y1={upY(v0)} x2={c1 + h1} y2={upY(v1)} />
                <line x1={c0 + h0} y1={upY(v0)} x2={c1 - h1} y2={upY(v1)} />
                <line x1={c1 - h1 * 1.12} y1={upY(v1)} x2={c1 + h1 * 1.12} y2={upY(v1)} />
              </g>
            );
          })}
        </g>
      );
    }
    if (id === "hako") {
      const vc = 0.3 + ((Math.sin(f / 34) + 1) / 2) * 0.44;
      const v0 = vc - 0.09, v1 = vc + 0.09;
      return (
        <g>
          <polygon points={`${P(0.04, -0.56)} ${P(0.04, 0.56)} ${P(1, 0.56)} ${P(1, -0.56)}`}
            fill={KRP.white} opacity={0.42} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={upCX(id, 0.04) - upHW(0.04) * 0.26} y1={upY(0.04)}
            x2={upCX(id, v0) - upHW(v0) * 0.26} y2={upY(v0)} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={upCX(id, 0.04) + upHW(0.04) * 0.26} y1={upY(0.04)}
            x2={upCX(id, v0) + upHW(v0) * 0.26} y2={upY(v0)} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={upCX(id, 0.05)} cy={upY(0.05)} r={upHW(0.05) * 0.4}
            fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          {/* かご (真下から見るので、底板と4つの角が見える) */}
          <polygon points={`${P(v0, -0.46)} ${P(v0, 0.46)} ${P(v1, 0.5)} ${P(v1, -0.5)}`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={upCX(id, v1) - upHW(v1) * 0.5} y1={upY(v1)}
            x2={upCX(id, v1) + upHW(v1) * 0.5} y2={upY(v1)} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        </g>
      );
    }
    if (id === "mizu") {
      return (
        <g>
          <polygon points={`${P(0.1, -0.3)} ${P(0.1, 0.3)} ${P(1, 0.3)} ${P(1, -0.3)}`}
            fill={KRP.white} opacity={0.9} stroke={KRP.ink} strokeWidth={4.5} />
          <polygon points={`${P(0.0, -0.78)} ${P(0.0, 0.78)} ${P(0.08, 0.72)} ${P(0.08, -0.72)}`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <g fill={KPP.mizuDark} opacity={0.88}>
            {Array.from({ length: 6 }, (_, i) => {
              const v = 0.98 - ((i / 6 + (f / 110)) % 1) * 0.84;
              const c = upCX(id, v), s = upHW(v) * 0.34;
              return <polygon key={i} points={`${c},${upY(v) - s * 1.5} ${c - s},${upY(v) + s * 0.5} ${c + s},${upY(v) + s * 0.5}`} />;
            })}
          </g>
          <circle cx={upCX(id, 0.94)} cy={upY(0.94)} r={upHW(0.94) * 0.34}
            fill={KPP.mizuDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
      );
    }
    if (id === "akari") {
      return (
        <g>
          <line x1={upCX(id, 0.03)} y1={upY(0.03)} x2={upCX(id, 0.97)} y2={upY(0.97)}
            stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, i) => {
            const v = 0.1 + i * 0.2;
            const c = upCX(id, v), r = upHW(v) * 0.4;
            const on = 0.55 + 0.45 * ((Math.sin(f / 19 + i) + 1) / 2);
            return (
              <g key={i}>
                <circle cx={c} cy={upY(v)} r={r * 2} fill={KPP.akari} opacity={0.26 * on} />
                <circle cx={c} cy={upY(v)} r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
                <circle cx={c} cy={upY(v)} r={r * 0.54} fill={KPP.akari} opacity={on} />
              </g>
            );
          })}
        </g>
      );
    }
    return (
      <g>
        <polygon points={`${P(0.04, -0.56)} ${P(0.04, 0.56)} ${P(1, 0.56)} ${P(1, -0.56)}`}
          fill={KRP.white} opacity={0.5} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.5}>
          {[0.12, 0.3, 0.48, 0.66, 0.84].map((v) => (
            <line key={v} x1={upCX(id, v) - upHW(v) * 0.56} y1={upY(v)}
              x2={upCX(id, v) + upHW(v) * 0.56} y2={upY(v)} />
          ))}
        </g>
        <g stroke={KPP.kuukiDark} strokeWidth={5.5} strokeLinecap="round" fill="none">
          {Array.from({ length: 4 }, (_, i) => {
            const v = 0.96 - ((i / 4 + (f / 90)) % 1) * 0.8;
            const c = upCX(id, v), s = upHW(v) * 0.34;
            return (
              <g key={i}>
                <line x1={c} y1={upY(v) + s * 1.1} x2={c} y2={upY(v) - s * 0.6} />
                <polyline points={`${c - s * 0.8},${upY(v)} ${c},${upY(v) - s * 0.8} ${c + s * 0.8},${upY(v)}`} />
              </g>
            );
          })}
        </g>
      </g>
    );
  })();
  return (
    <g>
      {lit > 0.01 && (
        <polygon points={`${P(0, -1.5)} ${P(0, 1.5)} ${P(1, 1.32)} ${P(1, -1.32)}`}
          fill={m.color} opacity={0.26 * lit} />
      )}
      <polygon points={`${P(0, -1)} ${P(0, 1)} ${P(1, 1)} ${P(1, -1)}`}
        fill={m.color} stroke={KRP.ink} strokeWidth={6} />
      <polygon points={`${P(0, 0.56)} ${P(0, 1)} ${P(1, 1)} ${P(1, 0.56)}`}
        fill={m.dark} opacity={0.75} />
      {guts}
      {/* 柱の頭がスラブに食い込む座 */}
      <polygon points={`${P(-0.03, -1.3)} ${P(-0.03, 1.3)} ${P(0.03, 1.12)} ${P(0.03, -1.12)}`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// ===== #179 第5章、島には、土地がない。 =====
// 格: 山
// どこ: マンハッタン島の真上。海しか無いところに、島だけが浮いている
// 演出: 画面ぜんぶが海。その真ん中の細長い一本の島に、端から端までビルが詰まっている。
//       「増えない土地に、全部を積んだ」が一目で分かる絵にする。章題は右下
// 動き: 波が流れ、島の北から南へビルが順に生え、カメラがゆっくり寄る
// 絵: 章扉。マンハッタン島の俯瞰。海に囲まれた細長い島に、端から端までびっしりビル。章題
const Kb5ShouTobira: React.FC<{ f: number }> = ({ f }) => {
  const zin = easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={800} bg={C.sea}
      over={<ChapterDoor num={5} title="島には、土地がない。" left={1130} top={636} width={740}
        t={seg(f, 16, 40)} />}>
      <Kb5Sea f={f} />
      <g transform={`${zoomAt(1 + zin * 0.05, 820, 470)} translate(62 44) scale(0.86)`}>
        {/* 島のまわりの浅瀬 */}
        <path d={islPath(false)} fill={C.seaDark} opacity={0.4}
          transform="translate(0 0) scale(1)" strokeWidth={46} stroke={C.seaDark} strokeOpacity={0.3} />
        {/* 島 */}
        <path d={islPath()} fill={C.island} stroke={KRP.ink} strokeWidth={7} />
        <path d={islPath(false)} fill="none" stroke={C.mapLine} strokeWidth={4} opacity={0.5}
          strokeDasharray="14 12" />
        <Kb5Streets opacity={0.42} />
        <Kb5Piers />
        <Kb5IslandCity f={f} n={158} />
      </g>
      {/* 船 (海に人の営みを置く) */}
      <Kb5Ship x={258} y={372} s={0.72} f={f} />
      <Kb5Ship x={1596} y={822} s={0.66} f={f} sail />
      {/* 方位 */}
      <g transform="translate(1790 180)" opacity={0.88}>
        <circle cx={0} cy={0} r={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        <polygon points="0,-44 13,0 0,14 -13,0" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        <polygon points="0,44 13,0 0,-14 -13,0" fill={C.cityPale} stroke={KRP.ink} strokeWidth={3.5} />
        <text x={0} y={-56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>N</text>
      </g>
      <TagPlate x={1388} y={268} text="マンハッタン島" size={44} t={seg(f, 8, 24)} fill={KRP.white} />
      <TagPlate x={300} y={616} text="海" size={48} t={seg(f, 20, 34)} fill={C.sea} />
    </Frame>
  );
};

// ===== #180 柱は、5本立ちました。 =====
// 格: 図
// どこ: 図面の上。5本柱の装置だけ
// 演出: 5本ぜんぶ立っていて、上の街がまっすぐ載っている。左に柱の高さの寸法線
// 動き: 柱が左から順に光り、○が左から順に付く
// 絵: 5本柱の装置。5本とも立っていて、上のタワマン群が安定している (TowerOnPillars)
const Kb5Hashira5Hon: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={801} bg={KRP.cream}>
    <GridPaper />
    <Kb5PillarFig f={f} maru
      standing={PILLAR_ORDER.filter((_, i) => f >= 4 + i * 5)}
      maruT={(i) => seg(f, 4 + i * 6, 15 + i * 6)} />
    <TagPlate x={960} y={770} text="柱 5／5" size={46} t={seg(f, 28, 40)} />
  </Frame>
);

// ===== #181 骨、箱、水、灯り、空気。 =====
// 格: 図
// どこ: 同じ装置の「真下」。床に立って、5本の柱を見上げている
// 演出: #180 の真横の断面と同じ絵にしない。カメラを床まで下ろして見上げる。
//       5本が上へすぼまり、頭の上を街のスラブが塞いでいる。中身 (骨組み・かご・立管・
//       電球・ダクト) は、この角度でこそ柱のすぐ内側に見える
// 動き: 名が左から順に点き、その柱が光る。かごが上下し、水と空気が上へ流れ、電球が明滅する
// 絵: 5本柱を真下から見上げた図。上はスラブの下面と街の足。手前の柱は画面の外へ太る
const Kb5HoneHakoMizu: React.FC<{ f: number }> = ({ f }) => {
  const zin = easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={802} bg={KRP.cream}>
      <GridPaper />
      <g transform={zoomAt(1 + zin * 0.05, 960, 620)}>
        {/* 足元の床 (消失点へ向かう線で「見上げている」ことを示す) */}
        <g stroke={C.mapLine} strokeWidth={3.5} opacity={0.4}>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={i} x1={-260 + i * 200} y1={H + 20} x2={lerp(620, 1300, i / 12)} y2={UP_TOP} />
          ))}
        </g>
        {/* 頭の上の街 (スラブの下面と、その向こうに立つ棟の足) */}
        <g>
          {[[760, 150, 240], [1180, 140, 206], [968, 162, 300], [600, 118, 150], [1352, 126, 168]].map(
            ([bx, bw, bh], i) => (
              <Kb5Roof key={i} x={bx} y={176} w={bw} h={bh} d={14} seed={i + 41} />
            ),
          )}
          <polygon points="420,320 1500,320 1320,170 600,170"
            fill={KPP.groundDark} stroke={KRP.ink} strokeWidth={7} />
          {/* 下面の梁 (消失点へ集まる) */}
          <g stroke={KRP.ink} strokeWidth={4} opacity={0.42}>
            {Array.from({ length: 7 }, (_, i) => {
              const q = (i + 1) / 8;
              return <line key={i} x1={lerp(420, 1500, q)} y1={320} x2={lerp(600, 1320, q)} y2={170} />;
            })}
            <line x1={474} y1={275} x2={1446} y2={275} />
            <line x1={528} y1={230} x2={1392} y2={230} />
          </g>
          <line x1={420} y1={320} x2={1500} y2={320} stroke={KRP.ink} strokeWidth={8} />
        </g>
        {/* 5本の柱 (手前ほど太い。両端は画面の外へ出る) */}
        {PILLAR_ORDER.map((id, i) => (
          <Kb5UpPillar key={id} id={id} f={f}
            lit={seg(f, 4 + i * 7, 14 + i * 7) * (1 - seg(f, 24 + i * 7, 40 + i * 7) * 0.4)} />
        ))}
      </g>
      <TagPlate x={287} y={700} text="骨" size={46} t={seg(f, 4, 14)} color={KPP.honeDark} />
      <TagPlate x={607} y={740} text="箱" size={46} t={seg(f, 11, 21)} color={KPP.hakoDark} />
      <TagPlate x={960} y={760} text="水" size={46} t={seg(f, 18, 28)} color={KPP.mizuDark} />
      <TagPlate x={1313} y={740} text="灯り" size={46} t={seg(f, 25, 35)} color={KPP.akariDark} />
      <TagPlate x={1633} y={700} text="空気" size={46} t={seg(f, 32, 42)} color={KPP.kuukiDark} />
    </Frame>
  );
};

// ===== #182 道具が揃ったのは、1880年から1900年の20年です。 =====
// 格: 図
// どこ: 図面の上。画面の端から端まで渡した木の年表尺だけ
// 演出: 200年の尺を端まで使い、そのうち20年ぶんだけが赤く太い。5本の柱の印が全部その帯に落ちる
// 動き: 尺が左から引かれ、赤い帯が広がり、5つの印が上から順に帯へ落ちる
// 絵: 横長の年表。1800〜2000の目盛り。1880〜1900の20年だけ赤い帯で太く、5つの印がそこに集まる
const Kb5N1880to1900: React.FC<{ f: number }> = ({ f }) => {
  const X0 = 130, X1 = 1810, Y = 548, BH = 92;
  const xOf = (y: number) => X0 + ((y - 1800) / 200) * (X1 - X0);
  const draw = easeOut(seg(f, 0, 14));
  const band = easeOut(seg(f, 12, 24));
  const bx0 = xOf(1880), bx1 = xOf(1900);
  return (
    <Frame f={f} seed={803} bg={KRP.cream}>
      <GridPaper />
      {/* 木の年表尺。木口まで描く */}
      <g>
        <rect x={X0} y={Y} width={(X1 - X0) * draw} height={BH}
          fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={X0} y={Y + BH - 20} width={(X1 - X0) * draw} height={20}
          fill={BP.woodDark} opacity={0.75} />
        {/* 木目 */}
        <g stroke={BP.woodDark} strokeWidth={3} opacity={0.45} fill="none">
          {[22, 46, 68].map((dy) => (
            <path key={dy} d={`M${X0} ${Y + dy} Q 700 ${Y + dy - 7} 1200 ${Y + dy + 5} T ${X0 + (X1 - X0) * draw} ${Y + dy}`} />
          ))}
        </g>
        {/* 木口 (左右の小口) */}
        <polygon points={`${X0},${Y} ${X0 - 20},${Y + 12} ${X0 - 20},${Y + BH + 12} ${X0},${Y + BH}`}
          fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {draw > 0.98 && (
          <polygon points={`${X1},${Y} ${X1 + 20},${Y + 12} ${X1 + 20},${Y + BH + 12} ${X1},${Y + BH}`}
            fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        )}
      </g>
      {/* 赤い帯 (1880〜1900 の20年。尺より上下に太い) */}
      <g opacity={band}>
        <rect x={bx0} y={Y - 76} width={(bx1 - bx0) * band} height={BH + 96}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={7} opacity={0.92} />
        <Rivets x1={bx0 + 18} y1={Y + BH + 4} x2={bx0 + (bx1 - bx0) * band - 18} y2={Y + BH + 4}
          n={4} r={8} fill={C.graphRed} />
      </g>
      {/* 目盛り。10年きざみ、20年ごとに長い刻みと数字 */}
      <g opacity={draw}>
        {Array.from({ length: 21 }, (_, i) => {
          const yr = 1800 + i * 10;
          const x = xOf(yr);
          const major = i % 2 === 0;
          return (
            <g key={yr}>
              <line x1={x} y1={Y} x2={x} y2={Y - (major ? 40 : 21)}
                stroke={KRP.ink} strokeWidth={major ? 6 : 4} />
              {major && (
                <text x={x} y={Y + BH + 62} textAnchor="middle" fontFamily={FONT}
                  fontWeight={800} fontSize={32} fill={KRP.ink}>{yr}</text>
              )}
            </g>
          );
        })}
        <text x={X1 + 46} y={Y + BH + 62} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>年</text>
      </g>
      {/* 5つの道具が、たった20年の上に、ひと塊で載っている。
          小さい印を5つ散らすと何の絵か読めないので、帯より大きい「木箱ひと箱」にする */}
      {band > 0.5 && (
        <g>
          {/* 箱の影 (赤い帯の上に落ちる) */}
          <ellipse cx={886} cy={478} rx={212} ry={16} fill={KRP.ink} opacity={0.22} />
          {/* 木箱 */}
          <rect x={690} y={236} width={392} height={238} rx={14}
            fill={BP.paper} stroke={KRP.ink} strokeWidth={8} />
          <rect x={690} y={236} width={392} height={30} rx={14} fill={BP.wood}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={690} y={442} width={392} height={32} fill={BP.wood}
            stroke={KRP.ink} strokeWidth={8} />
          <g stroke={BP.woodDark} strokeWidth={5} opacity={0.5}>
            <line x1={712} y1={280} x2={712} y2={440} />
            <line x1={1060} y1={280} x2={1060} y2={440} />
          </g>
          <HexBolt x={714} y={252} r={11} />
          <HexBolt x={1058} y={252} r={11} />
          <HexBolt x={714} y={458} r={11} />
          <HexBolt x={1058} y={458} r={11} />
        </g>
      )}
      {/* 5つの道具が上から箱へ落ちてくる */}
      {PILLAR_ORDER.map((id, i) => {
        const t = seg(f, 14 + i * 4, 28 + i * 4);
        if (t <= 0) return null;
        const [cx, cy] = [[760, 310], [886, 310], [1012, 310], [823, 412], [949, 412]][i];
        const y = lerp(cy - 330, cy, easeOut(t));
        const m = PILLAR_META[id];
        return (
          <g key={id}>
            <circle cx={cx} cy={y} r={56} fill={m.color} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={cx - 17} cy={y - 19} r={14} fill={KRP.white} opacity={0.8} />
            <text x={cx} y={y + (m.label.length > 1 ? 13 : 19)} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={m.label.length > 1 ? 37 : 54} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={6} paintOrder="stroke">{m.label}</text>
          </g>
        );
      })}
      {/* 20年ぶんの寸法 */}
      {/* 200年ぜんぶの寸法 */}
      <g opacity={draw} stroke={KRP.ink} strokeWidth={6}>
        <line x1={X0} y1={756} x2={X1} y2={756} />
        <line x1={X0} y1={738} x2={X0} y2={774} />
        <line x1={X1} y1={738} x2={X1} y2={774} />
      </g>
      <TagPlate x={886} y={186} text="道具 5つ" size={44} t={seg(f, 30, 42)} fill={BP.paper} />
      <TagPlate x={(bx0 + bx1) / 2} y={610} text="20年" size={44} t={seg(f, 26, 40)}
        color={KRP.red} />
      <TagPlate x={330} y={756} text="200年" size={44} t={seg(f, 8, 22)} />
    </Frame>
  );
};

// ===== #183 ただし、柱には、立つ地面が要ります。 =====
// 格: 図
// どこ: 柱の足元。地面を真横から切った断面。画面の下半分ぜんぶが地層
// 演出: 同じ柱を2本だけ並べ、足の先がどこに届いているかだけを見せる。左は空振り、右は岩盤に噛む
// 動き: 左の柱が下りてきて空を切り、土が崩れる。右は岩盤に噛んで石の粉が飛び、下から反力が立つ
// 絵: 柱の足元に寄る。左は宙に浮いて沈む柱、右は地面に食い込む柱。地面の断面 (土・砂利・岩盤)
const Kb5JimenGaIru: React.FC<{ f: number }> = ({ f }) => {
  const SUR = 498;                 // 地面の高さ
  const drop = easeOut(seg(f, 4, 34));
  // 左の柱は土を押し分けて下りるが、岩盤には届かないまま沈みつづける
  const footL = 466 + drop * 104 + Math.sin(f / 7) * 3;
  const bite = easeOut(seg(f, 10, 30));
  // 左右で太さを変えない。変えると「細いから沈む」に見えてしまう
  const LW = 100;
  const Leg: React.FC<{ x: number; bot: number; col: string; dark: string }> = ({ x, bot, col, dark }) => (
    <g>
      <rect x={x - LW} y={120} width={LW * 2} height={bot - 120} fill={col} stroke={KRP.ink} strokeWidth={7} />
      <rect x={x + LW - 48} y={120} width={48} height={bot - 120} fill={dark} opacity={0.8} />
      <Rivets x1={x - 72} y1={150} x2={x - 72} y2={bot - 40} n={10} r={9} fill={dark} />
      <Rivets x1={x + 26} y1={150} x2={x + 26} y2={bot - 40} n={10} r={9} fill={dark} />
      {/* 足板 */}
      <rect x={x - LW - 30} y={bot - 26} width={LW * 2 + 60} height={30} fill={dark} stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={x - LW} y={bot - 11} r={13} fill={BP.ironDark} />
      <HexBolt x={x + LW} y={bot - 11} r={13} fill={BP.ironDark} />
    </g>
  );
  return (
    <Frame f={f} seed={804} bg={KRP.cream}>
      <GridPaper />
      {/* 地層の断面 */}
      <g>
        <rect x={-20} y={SUR} width={W + 40} height={76} fill={KPP.ground} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-20} y={SUR + 76} width={W + 40} height={86} fill={C.dust} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-20} y={SUR + 162} width={W + 40} height={H - SUR - 142} fill={C.rock} stroke={KRP.ink} strokeWidth={7} />
        {/* 砂利の粒 */}
        <g fill={C.rock} stroke={KRP.ink} strokeWidth={2.4} opacity={0.9}>
          {Array.from({ length: 64 }, (_, i) => (
            <circle key={i} cx={20 + rnd(i * 1.9) * (W - 40)}
              cy={SUR + 88 + rnd(i * 4.4) * 64} r={6 + rnd(i * 7.7) * 8} />
          ))}
        </g>
        {/* 岩盤の層理 */}
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.42} fill="none">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M-20 ${SUR + 214 + i * 62} Q 480 ${SUR + 196 + i * 62} 960 ${SUR + 222 + i * 62} T 1940 ${SUR + 208 + i * 62}`} />
          ))}
        </g>
        {/* 草 */}
        <g stroke={KPP.kuukiDark} strokeWidth={4} strokeLinecap="round">
          {Array.from({ length: 40 }, (_, i) => {
            const gx = 24 + i * 48;
            return <path key={i} d={`M${gx} ${SUR} l ${3 + rnd(i) * 5} -16`} />;
          })}
        </g>
      </g>
      {/* 左: 宙を切る柱 */}
      <Leg x={428} bot={footL} col={KPP.hone} dark={KPP.honeDark} />
      <g>
        <line x1={222} y1={SUR} x2={660} y2={SUR} stroke={KRP.red} strokeWidth={7} strokeDasharray="22 16" />
        {/* 足の先から岩盤まで、まだこれだけ空いている */}
        <line x1={428} y1={footL + 10} x2={428} y2={SUR + 150} stroke={KRP.red} strokeWidth={6}
          strokeDasharray="14 11" />
        <g stroke={KRP.red} strokeWidth={6}>
          <line x1={398} y1={SUR + 156} x2={458} y2={SUR + 156} />
        </g>
        {/* 押し分けられて崩れる土 */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const p = ((f / 13 + i * 0.17) % 1);
          return (
            <circle key={i} cx={330 + i * 40 + Math.sin(f / 8 + i) * 7} cy={footL - 30 + p * 64}
              r={7 + rnd(i * 3.1) * 7} fill={KPP.groundDark} stroke={KRP.ink} strokeWidth={2.6}
              opacity={0.85 * (1 - p)} />
          );
        })}
      </g>
      <ForceArrow x={222} y={282} len={192} rot={90} w={28} color={KRP.red} t={seg(f, 12, 30)} />
      <TagPlate x={222} y={562} text="沈む" size={44} t={seg(f, 16, 30)} color={KRP.red} />
      <XMark x={222} y={206} s={1.3} t={seg(f, 18, 32)} />
      {/* 右: 岩盤まで届く柱 */}
      <Leg x={1456} bot={SUR + 196} col={KPP.hone} dark={KPP.honeDark} />
      <g>
        {/* 広がったフーチングと杭 */}
        <polygon points={`${1456 - 168},${SUR + 196} ${1456 + 168},${SUR + 196} ${1456 + 118},${SUR + 254} ${1456 - 118},${SUR + 254}`}
          fill={BP.slab} stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={1456 - 128} y1={SUR + 224} x2={1456 + 128} y2={SUR + 224} n={7} r={9} fill={BP.slabDark} />
        {[-90, 0, 90].map((dx) => (
          <g key={dx}>
            <rect x={1456 + dx - 17} y={SUR + 248} width={34} height={78 * bite}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
            {bite > 0.9 && (
              <polygon points={`${1456 + dx - 17},${SUR + 326} ${1456 + dx + 17},${SUR + 326} ${1456 + dx},${SUR + 356}`}
                fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
            )}
          </g>
        ))}
        {/* 噛んだときの石の粉 */}
        {[0, 1, 2, 3].map((i) => {
          const p = ((f / 11 + i * 0.25) % 1);
          return (
            <circle key={i} cx={1456 + (i - 1.5) * 92} cy={SUR + 238 - p * 42}
              r={7 + i * 2} fill={C.dust} stroke={KRP.ink} strokeWidth={2.4}
              opacity={0.8 * (1 - p) * bite} />
          );
        })}
      </g>
      {/* 緑の字を緑の矢印に重ねると読めないので、札にして矢印の足元へ置く */}
      <ForceArrow x={1760} y={SUR + 208} len={196} rot={-90} w={30} color={KRP.green}
        t={seg(f, 20, 36)} />
      <TagPlate x={1748} y={760} text="支える" size={46} t={seg(f, 24, 38)} color={KPP.kuukiDark} />
      <Maru x={1766} y={210} s={0.8} t={seg(f, 24, 38)} />
      {/* 地層の名札 (真ん中の柱と柱のあいだ) */}
      <TagPlate x={944} y={536} text="土" size={38} t={seg(f, 6, 18)} fill={KPP.ground} />
      <TagPlate x={944} y={616} text="砂利" size={38} t={seg(f, 10, 22)} fill={C.dust} />
      <TagPlate x={944} y={726} text="岩盤" size={40} t={seg(f, 14, 26)} fill={C.rock} />
      <TagPlate x={428} y={172} text="土だけ" size={44} t={seg(f, 16, 30)} color={KRP.red} />
      <TagPlate x={1456} y={172} text="岩盤まで" size={44} t={seg(f, 22, 36)} color={KPP.kuukiDark} />
    </Frame>
  );
};

// ===== #184 建つ理由がなければ、建ちません。 =====
// 格: 図
// どこ: 装置の足元に、カメラごと寄る。5本のうち4本ぶんしか画面に入らない
// 演出: #180 の引いた真横・#181 の見上げに続けて、ここは寄り。柱の中身 (トラス・かご・
//       立管・電球) が手で触れる大きさで見えている = 装置は完成している。
//       その手前に、空欄のままの記入札だけが吊られている
// 動き: カメラがさらに寄り、吊られた札が振り子のように揺れ、？が浮き沈みする
// 絵: 柱の寄り。手前に「理由」の欄が空っぽの大きな記入札と、大きな？
const Kb5RiyuuGaNai: React.FC<{ f: number }> = ({ f }) => {
  const sw = Math.sin(f / 15) * 2.6 * easeOut(seg(f, 2, 20));
  const zin = easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={805} bg={KRP.cream}>
      <GridPaper />
      {/* 装置に寄る (街の頭は画面の外。見えているのは柱と足元だけ) */}
      <g transform={zoomAt(1.6 + zin * 0.07, 820, 700)}>
        <TowerOnPillars f={f} ground labels={false} lit={1} />
      </g>
      {/* 手前に吊り下がった記入札 (空欄のまま) */}
      <g transform={`rotate(${sw} 1430 -60)`}>
        <g stroke={KRP.ink} strokeWidth={6}>
          <line x1={1100} y1={-10} x2={1062} y2={122} />
          <line x1={1760} y1={-10} x2={1798} y2={122} />
        </g>
        <rect x={980} y={118} width={900} height={322} rx={14}
          fill={BP.paper} stroke={KRP.ink} strokeWidth={8} />
        <rect x={980} y={118} width={222} height={322} rx={14}
          fill={BP.wood} stroke={KRP.ink} strokeWidth={8} />
        <text x={1091} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={62} fill={KRP.white}>理由</text>
        {/* 罫線だけがあって、何も書かれていない */}
        <g stroke={C.mapLine} strokeWidth={5} opacity={0.65}>
          <line x1={1240} y1={212} x2={1832} y2={212} />
          <line x1={1240} y1={292} x2={1832} y2={292} />
          <line x1={1240} y1={372} x2={1832} y2={372} />
        </g>
        <rect x={1236} y={160} width={602} height={246} rx={8} fill="none"
          stroke={KRP.red} strokeWidth={6} strokeDasharray="20 15" opacity={0.75} />
        <HexBolt x={1062} y={126} r={14} />
        <HexBolt x={1798} y={126} r={14} />
      </g>
      {/* 大きな？ (読めるようにうしろに紙を敷く) */}
      <g>
        <circle cx={1276} cy={648} r={142} fill={KRP.cream} stroke={KRP.ink}
          strokeWidth={7} opacity={0.94} />
        <QMark x={1276} y={716} s={2.4} f={f} t={seg(f, 10, 26)} />
      </g>
      <TagPlate x={348} y={752} text="装置 ○" size={46} t={seg(f, 16, 30)} color={KPP.kuukiDark} />
      <TagPlate x={1760} y={752} text="理由 ？" size={46} t={seg(f, 26, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== #185 ここで、もう一人の主役を呼びます。 =====
// 格: 並
// どこ: 舞台の上。下手の袖口。床にスポットの円がひとつ
// 演出: 袖から半分だけ出た本人が立っていて、その影がスポットの真ん中まで長く伸びる。
//       ★影だけを置かない。影を落とす本体が必ず画面にいること。
// 色: 赤い緞帳と濃紺はこの章に無い色なので捨てた。緞帳は海の青灰、床は島のベージュ。
// 動き: 影がのびる。緞帳が揺れ、光の中の埃が流れ、本人がこちらを見る
// 絵: 舞台の袖。青灰の緞帳とベージュの床、スポットの円。袖から半分出た人と、その長い影
const Kb5MouHitori: React.FC<{ f: number }> = ({ f }) => {
  const ex = easeOut(seg(f, 4, 40));
  const SX = 420, SY = 838;            // 影の根 = 本人の足元
  const len = 300 + 520 * ex;
  const hx = SX + len * 0.98, hy = SY - len * 0.12;
  const perp = { x: 0.12, y: 0.98 };
  const sway = Math.sin(f / 23) * 6;
  const sh = (q: number, k: number) =>
    `${lerp(SX, hx, q) + perp.x * k},${lerp(SY, hy, q) + perp.y * k}`;
  return (
    <Frame f={f} seed={806} bg={C.stageWall} dark>
      {/* 奥の壁とベージュの床 */}
      <rect x={-20} y={-20} width={W + 40} height={660} fill={C.stageWall} />
      <rect x={-20} y={620} width={W + 40} height={H - 600} fill={C.stageFloor} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.stageFloorDark} strokeWidth={5} opacity={0.85}>
        {Array.from({ length: 17 }, (_, i) => {
          const q = i / 16;
          return <line key={i} x1={lerp(300, 1620, q)} y1={620} x2={lerp(-240, 2160, q)} y2={H + 20} />;
        })}
        <line x1={160} y1={760} x2={1760} y2={760} strokeWidth={4} opacity={0.6} />
        <line x1={-40} y1={940} x2={1960} y2={940} strokeWidth={4} opacity={0.6} />
      </g>
      {/* スポットライトの光の筋と円 */}
      <polygon points={`430,-20 640,-20 ${1050 + 380},760 ${1050 - 380},760`}
        fill={C.spot} opacity={0.16} />
      <ellipse cx={1050} cy={762} rx={382} ry={122} fill={C.spot}
        opacity={0.34 + Math.sin(f / 9) * 0.03} />
      <ellipse cx={1050} cy={762} rx={382} ry={122} fill="none" stroke={C.spot}
        strokeWidth={6} opacity={0.5} />
      {/* 光の中の埃 */}
      <g fill={C.spot} opacity={0.6}>
        {Array.from({ length: 18 }, (_, i) => {
          const p = ((f / 60 + rnd(i * 2.3)) % 1);
          return <circle key={i} cx={480 + rnd(i * 5.1) * 640 + p * 180}
            cy={-10 + p * 740} r={3 + rnd(i * 8.3) * 4} />;
        })}
      </g>
      {/* 本人の足元から伸びる長い影 (人の形のまま引き伸ばす) */}
      <g fill={C.shadow} opacity={0.55}>
        <polygon points={`${sh(0, -72)} ${sh(0, -18)} ${sh(0.42, -30)} ${sh(0.4, -66)}`} />
        <polygon points={`${sh(0, 10)} ${sh(0, 66)} ${sh(0.4, 62)} ${sh(0.42, 20)}`} />
        <polygon points={`${sh(0.38, -72)} ${sh(0.38, 68)} ${sh(0.86, 56)} ${sh(0.86, -58)}`} />
        <polygon points={`${sh(0.86, -24)} ${sh(0.86, 24)} ${sh(0.93, 22)} ${sh(0.93, -22)}`} />
        <ellipse cx={hx + 34} cy={hy + 2} rx={64} ry={52}
          transform={`rotate(-8 ${hx + 34} ${hy + 2})`} />
        {/* 前へ出した腕 */}
        <polygon points={`${sh(0.62, -52)} ${sh(0.6, -14)} ${hx - 36},${hy + 108} ${hx - 70},${hy + 86}`} />
      </g>
      {/* ★影の本体。袖から半分だけ出て立っている */}
      <g>
        <ellipse cx={SX + 6} cy={SY + 8} rx={94} ry={20} fill={C.shadow} opacity={0.35} />
        <Person x={SX} y={SY} s={1.5} f={f} cloth="#39414F" clothDark="#272E39"
          hair="cap" gaze={[9, 2]} lean={2} />
        {/* スポットの側から当たる縁の光 */}
        <path d={`M${SX + 86} ${SY - 232} q 22 54 20 128`} fill="none" stroke={C.spot}
          strokeWidth={7} strokeLinecap="round" opacity={0.5} />
      </g>
      {/* 緞帳 (下手・上手) と上の蛇腹 */}
      {[0, 1].map((s) => {
        const x0 = s === 0 ? -20 : 1612;
        const ww = s === 0 ? 330 : 330;
        return (
          <g key={s} transform={`translate(${s === 0 ? sway : -sway} 0)`}>
            <rect x={x0} y={-20} width={ww} height={H + 40} fill={C.curtain} stroke={KRP.ink} strokeWidth={7} />
            <g>
              {Array.from({ length: 4 }, (_, i) => (
                <path key={i} d={`M${x0 + 30 + i * 76} -20 Q ${x0 + 54 + i * 76} ${H / 2} ${x0 + 30 + i * 76} ${H + 20} L${x0 + 68 + i * 76} ${H + 20} Q ${x0 + 92 + i * 76} ${H / 2} ${x0 + 68 + i * 76} -20 Z`}
                  fill={C.curtainDark} opacity={0.62} />
              ))}
            </g>
          </g>
        );
      })}
      <g>
        <path d="M-20 -20 L1940 -20 L1940 70 Q 1700 196 1460 74 Q 1210 196 960 74 Q 710 196 460 74 Q 220 196 -20 70 Z"
          fill={C.curtain} stroke={KRP.ink} strokeWidth={7} />
        <g fill={KPP.akari} stroke={KRP.ink} strokeWidth={3}>
          {Array.from({ length: 13 }, (_, i) => (
            <circle key={i} cx={40 + i * 152} cy={128 + Math.sin(i * 1.3) * 32} r={11} />
          ))}
        </g>
      </g>
      <QMark x={hx + 54} y={hy - 92} s={1.15} f={f} t={seg(f, 24, 38)} color={KPP.akari} />
      <TagPlate x={168} y={312} text="袖" size={46} t={seg(f, 6, 20)} fill={BP.paper} />
      <TagPlate x={1052} y={296} text="舞台" size={46} t={seg(f, 14, 28)} fill={BP.paper} />
    </Frame>
  );
};

// ===== #186 人間の、欲です。 =====
// 格: 並
// どこ: 薄暗い机の前。机の上にマンハッタンの地図が広げてあり、その右に金貨の山
// 演出: 人は1人。顔ではなく「伸びる手」に寄る。手はこの作風の白い手 (丸い太指3本・爪は描かない)
// 動き: 手が金貨へ近づき、指が握りこみ、硬貨が光り、地図の端がめくれる
// 絵: 影の正体。金貨の山と地図に手を伸ばす人1人。白い手・袖・光る硬貨。札「欲」
const Kb5Yoku: React.FC<{ f: number }> = ({ f }) => {
  const reach = easeOut(seg(f, 6, 38));
  const hx = 1302 + reach * 96, hy = 744 - reach * 28;
  const grip = reach * 9;   // 指先の握りこみ
  // 丸い太い指を1本ぶん、ひと続きの輪郭として吐く。
  // a = 付け根の上側 / t = 指先の中心 / w = 水かき (付け根の下側)
  const fing = (a: number[], t: number[], w: number[]) => {
    const mx = (a[0] + w[0]) / 2, my = (a[1] + w[1]) / 2;
    const tx = t[0] - grip * 0.6, ty = t[1] + grip * 1.2;
    const r = Math.hypot(a[0] - mx, a[1] - my) || 1;
    const nx = (a[0] - mx) / r, ny = (a[1] - my) / r;
    const L = Math.hypot(tx - mx, ty - my) || 1;
    const ux = (tx - mx) / L, uy = (ty - my) / L;
    const t1x = tx + nx * r * 0.92, t1y = ty + ny * r * 0.92;
    const t2x = tx - nx * r * 0.92, t2y = ty - ny * r * 0.92;
    const k = r * 1.1;
    const v = (n: number) => n.toFixed(1);
    return `Q${v(mx + ux * L * 0.6 + nx * r)} ${v(my + uy * L * 0.6 + ny * r)} ${v(t1x)} ${v(t1y)}`
      + ` Q${v(t1x + ux * k)} ${v(t1y + uy * k)} ${v(tx + ux * r * 0.95)} ${v(ty + uy * r * 0.95)}`
      + ` Q${v(t2x + ux * k)} ${v(t2y + uy * k)} ${v(t2x)} ${v(t2y)}`
      + ` Q${v(mx + ux * L * 0.6 - nx * r)} ${v(my + uy * L * 0.6 - ny * r)} ${v(w[0])} ${v(w[1])}`;
  };
  return (
    <Frame f={f} seed={807} bg={C.darkSky} dark>
      <rect x={-20} y={-20} width={W + 40} height={860} fill={C.darkSky} />
      <rect x={-20} y={820} width={W + 40} height={H - 800} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 壁に残る影 (#185 の影の正体) */}
      <g fill={C.shadow} opacity={0.34}>
        <ellipse cx={276} cy={508} rx={96} ry={112} />
        <polygon points="150,600 408,588 470,860 118,860" />
      </g>
      {/* 人 (1人だけ) */}
      <Person x={416} y={986} s={1.46} f={f} cloth="#39414F" clothDark="#272E39"
        hair="cap" gaze={[0.7, 0.25]} lean={4} />
      {/* 机 */}
      <polygon points="744,636 1900,636 1940,876 652,876" fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={5} opacity={0.8}>
        {[0.2, 0.42, 0.64, 0.84].map((q, i) => (
          <line key={i} x1={lerp(744, 1900, q)} y1={636} x2={lerp(652, 1940, q)} y2={876} />
        ))}
      </g>
      <rect x={640} y={872} width={1300} height={26} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 地図 (同じ島の形を縮めて置く) */}
      <g>
        <polygon points="752,648 1286,648 1312,834 726,834" fill={C.paper} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.mapLine} strokeWidth={2.6} opacity={0.45}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={766 + i * 62} y1={650} x2={752 + i * 64} y2={832} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={746 - i * 5} y1={664 + i * 42} x2={1290 + i * 6} y2={664 + i * 42} />
          ))}
        </g>
        <g transform={`translate(${770 - 262 * 0.3} ${660 - 252 * 0.3}) scale(0.3)`}>
          <path d={islPath(false)} fill={C.island} stroke={KRP.ink} strokeWidth={9} />
          <path d={islPath(false)} fill="none" stroke={KRP.red} strokeWidth={6} opacity={0.8} />
        </g>
        {/* めくれた右上の角 */}
        <polygon points={`1286,648 1312,${834} ${1286 - 54 - Math.sin(f / 17) * 8},${700} `}
          fill={BP.paper} stroke={KRP.ink} strokeWidth={5} opacity={0.0} />
        <path d={`M1286 648 Q ${1248 + Math.sin(f / 17) * 10} 668 1272 700 L1300 686 Z`}
          fill={BP.chalk} stroke={KRP.ink} strokeWidth={5} />
        {/* 地価の押しピン */}
        <g>
          <line x1={1012} y1={744} x2={1012} y2={704} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1012} cy={698} r={15} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>
      {/* 金貨の山 */}
      <g>
        {[
          [1506, 828, 7], [1596, 834, 5], [1680, 826, 8], [1552, 806, 4], [1640, 804, 6],
        ].map(([cx, cy, n], s) => (
          <g key={s}>
            {Array.from({ length: n }, (_, i) => (
              <g key={i}>
                <ellipse cx={cx} cy={cy - i * 15} rx={52} ry={18}
                  fill={C.gold} stroke={KRP.ink} strokeWidth={4.5} />
                <ellipse cx={cx} cy={cy - i * 15 - 4} rx={34} ry={10}
                  fill={C.goldDark} opacity={0.45} />
              </g>
            ))}
          </g>
        ))}
        {/* 転がった硬貨 */}
        {[[1420, 852], [1766, 846], [1472, 792]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={28} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={cx} cy={cy} r={15} fill="none" stroke={C.goldDark} strokeWidth={5} />
          </g>
        ))}
        {/* 光る */}
        <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round">
          {[[1552, 714], [1678, 700], [1472, 764]].map(([gx, gy], i) => {
            const o = Math.max(0, Math.sin(f / 10 + i * 2.1));
            return (
              <g key={i} opacity={o}>
                <line x1={gx - 22} y1={gy} x2={gx + 22} y2={gy} />
                <line x1={gx} y1={gy - 22} x2={gx} y2={gy + 22} />
              </g>
            );
          })}
        </g>
      </g>
      {/* 伸びる手 (この作風の手: 白・太い輪郭・丸い指3本。爪と手相の線は描かない) */}
      <g>
        {/* 袖 */}
        <polygon points={`452,688 486,790 ${hx - 152},${hy + 46} ${hx - 170},${hy - 12}`}
          fill="#39414F" stroke={KRP.ink} strokeWidth={7} />
        <g transform={`translate(${hx} ${hy})`}>
          {/* 掌・指3本・親指をひと続きの輪郭で描く (部品を浮かせない) */}
          <path d={[
            "M-132 -38",
            "Q-70 -62 -10 -58",            // 手の甲
            "Q22 -56 44 -46",              // こぶしの山
            fing([44, -46], [136, -22], [50, 0]),
            fing([50, 0], [146, 26], [46, 44]),
            fing([46, 44], [124, 70], [36, 84]),
            "Q0 98 -40 92",                // 掌の下 (小指球)
            "Q-68 88 -82 102",             // 親指 (丸いふくらみ1つ)
            "Q-100 124 -122 108",
            "Q-142 96 -118 60",
            "Q-123 46 -124 34",            // 手首へ戻る (袖口の下に隠れる)
            "Z",
          ].join(" ")}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={7}
            strokeLinejoin="round" strokeLinecap="round" />
          {/* 袖口 = 服の色のリング1本 */}
          <rect x={-176} y={-54} width={66} height={122} rx={18}
            fill="#272E39" stroke={KRP.ink} strokeWidth={7} />
        </g>
      </g>
      <TagPlate x={1724} y={238} text="欲" size={76} t={seg(f, 20, 36)} fill={C.gold} />
      <TagPlate x={892} y={586} text="地図" size={36} t={seg(f, 10, 24)} fill={BP.paper} />
      <TagPlate x={1596} y={608} text="金" size={44} t={seg(f, 14, 28)} fill={C.gold} />
    </Frame>
  );
};

// ===== #187 舞台は、ニューヨークのマンハッタン。 =====
// 格: 山
// どこ: 島の全景。斜め上から。奥 (上端) がニュージャージーの岩盤の崖、右下がブルックリン
// 演出: 両側を川で挟まれ、岸壁が櫛のように出て、橋2本だけが外とつながっている。
//       「ここしか無い・ここへしか行けない」が地形で分かるように置く
// 動き: 橋が奥から架かり、船が進んで煙を吐き、波が流れ、カメラがゆっくり寄る
// 絵: マンハッタン島の全景。ハドソン川とイーストリバー、橋2本、港の船、岸壁、碁盤の街路、奥に岩盤の層
const Kb5Manhattan: React.FC<{ f: number }> = ({ f }) => {
  const zin = easeOut(seg(f, 0, 42));
  const [b1x, b1y] = islEdge(0.30, 1, false);
  const [b2x, b2y] = islEdge(0.42, 1, false);
  return (
    <Frame f={f} seed={808} bg={C.sea}>
      <Kb5Sea f={f} />
      <g transform={zoomAt(1 + zin * 0.045, 900, 470)}>
        {/* 奥 = ニュージャージーの岩盤の崖 (層理まで描く) */}
        <g>
          <polygon points="-20,-20 1940,-20 1940,142 1380,166 760,138 -20,170"
            fill={KPP.ground} stroke={KRP.ink} strokeWidth={7} />
          <polygon points="-20,112 1940,86 1940,150 1380,174 760,146 -20,178"
            fill={C.rock} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.45}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M-20 ${128 + i * 16} Q 700 ${110 + i * 16} 1940 ${102 + i * 16}`} fill="none" />
            ))}
          </g>
          {/* 崖の上の木立 */}
          <g fill={KPP.kuukiDark} stroke={KRP.ink} strokeWidth={3}>
            {Array.from({ length: 24 }, (_, i) => (
              <circle key={i} cx={30 + i * 82} cy={56 + rnd(i * 3.3) * 34} r={14 + rnd(i * 5.1) * 9} />
            ))}
          </g>
        </g>
        {/* 右下 = ブルックリン側の陸 */}
        <g>
          <polygon points="1120,1100 1420,760 1680,618 1940,560 1940,1100"
            fill={C.island} stroke={KRP.ink} strokeWidth={7} />
          <g>
            {Array.from({ length: 22 }, (_, i) => (
              <Kb5Roof key={i} x={1450 + rnd(i * 2.7) * 460} y={720 + rnd(i * 6.1) * 320}
                w={22 + rnd(i * 4.4) * 18} h={18 + rnd(i * 8.8) * 32} seed={i + 90} />
            ))}
          </g>
        </g>
        {/* 橋2本 (外とのつながり) */}
        <Kb5Bridge ax={b1x} ay={b1y} bx={1252} by={1012} f={f} t={seg(f, 8, 26)} />
        <Kb5Bridge ax={b2x} ay={b2y} bx={1452} by={898} f={f} t={seg(f, 16, 34)} />
        {/* 島 */}
        <path d={islPath()} fill={C.island} stroke={KRP.ink} strokeWidth={7} />
        <Kb5Streets opacity={0.5} />
        <Kb5Piers />
        <Kb5IslandCity f={f} n={100} appear={false} />
        {/* 島の南端の砲台と公園 */}
        <g>
          <circle cx={300} cy={678} r={24} fill={C.dust} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={300} cy={678} r={10} fill={KPP.kuukiDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
      {/* 船 (ハドソン / イースト / 港) */}
      <Kb5Ship x={404} y={356} s={0.8} f={f} />
      <Kb5Ship x={712} y={212} s={0.64} f={f} sail />
      <Kb5Ship x={1540} y={556} s={0.72} f={f} />
      {/* 方位と縮尺 */}
      <g transform="translate(140 258)" opacity={0.9}>
        <circle cx={0} cy={0} r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        <polygon points="0,-40 12,0 0,12 -12,0" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        <polygon points="0,40 12,0 0,-12 -12,0" fill={C.cityPale} stroke={KRP.ink} strokeWidth={3.5} />
        <text x={0} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.ink}>N</text>
      </g>
      <g transform="translate(96 772)">
        <rect x={0} y={0} width={240} height={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <rect x={0} y={0} width={80} height={18} fill={KRP.ink} />
        <rect x={160} y={0} width={80} height={18} fill={KRP.ink} />
        <text x={240} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={800}
          fontSize={28} fill={KRP.ink}>5km</text>
      </g>
      <TagPlate x={1720} y={110} text="岩盤" size={38} t={seg(f, 24, 38)} fill={C.rock} />
      <TagPlate x={454} y={234} text="ハドソン川" size={36} t={seg(f, 8, 22)} fill={C.sea} />
      <TagPlate x={1282} y={690} text="イースト川" size={36} t={seg(f, 14, 28)} fill={C.sea} />
      <TagPlate x={866} y={448} text="マンハッタン" size={52} t={seg(f, 2, 18)} fill={KRP.white} />
    </Frame>
  );
};

// ===== #188 ここは、島です。土地は、どうやっても増えません。 =====
// 格: 図
// どこ: #187 と同じ島を、街を消した「輪郭だけ」にして真上から
// 演出: 赤い線が島をひと回りして閉じる。四方へ出ようとする矢印は全部×。外は海しかない
// 動き: 赤い輪郭が一周描かれ、4本の矢印が伸びて×が打たれ、波が流れる
// 絵: 島の輪郭を赤でなぞる。外へ広げようとする矢印4本すべてに×。海の波
const Kb5ShimaWaFuenai: React.FC<{ f: number }> = ({ f }) => {
  const trace = easeOut(seg(f, 2, 26));
  // 外へ出ようとする4方向。rot は法線の向きから出す
  const degW = (Math.atan2(-ISL_N.y, -ISL_N.x) * 180) / Math.PI;
  const degE = (Math.atan2(ISL_N.y, ISL_N.x) * 180) / Math.PI;
  const degS = (Math.atan2(-ISL_U.y, -ISL_U.x) * 180) / Math.PI;
  const degN = (Math.atan2(ISL_U.y, ISL_U.x) * 180) / Math.PI;
  const [wx, wy] = islEdge(0.42, -1, false);
  const [ex, ey] = islEdge(0.55, 1, false);
  const [sx, sy] = islMid(0);
  const [nx2, ny2] = islMid(1);
  const SP: { x: number; y: number; rot: number; len: number; d: number }[] = [
    { x: wx - ISL_N.x * 22, y: wy - ISL_N.y * 22, rot: degW, len: 186, d: 0 },
    { x: ex + ISL_N.x * 22, y: ey + ISL_N.y * 22, rot: degE, len: 152, d: 5 },
    { x: sx - ISL_U.x * 22, y: sy - ISL_U.y * 22, rot: degS, len: 168, d: 10 },
    { x: nx2 + ISL_U.x * 22, y: ny2 + ISL_U.y * 22, rot: degN, len: 142, d: 15 },
  ];
  return (
    <Frame f={f} seed={809} bg={C.sea}>
      <Kb5Sea f={f} rows={9} />
      {/* 島 (街は描かない。形だけ) */}
      <path d={islPath()} fill={C.island} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.mapLine} strokeWidth={3} opacity={0.3} fill="none">
        {Array.from({ length: 13 }, (_, i) => {
          const t = 0.06 + i * 0.072;
          const [ax, ay] = islEdge(t, -0.9, false);
          const [bx, by] = islEdge(t, 0.9, false);
          return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} />;
        })}
      </g>
      {/* 赤い輪郭をなぞる */}
      <path d={islPath(false, 72)} fill="none" stroke={KRP.red} strokeWidth={13}
        strokeLinecap="round" pathLength={1}
        strokeDasharray={`${trace} ${1 - trace}`} />
      {/* 四方へ出ようとする矢印 (全部ダメ) */}
      {SP.map((a, i) => {
        const t = seg(f, 14 + a.d, 26 + a.d);
        const mx = a.x + Math.cos((a.rot * Math.PI) / 180) * a.len * 0.56;
        const my = a.y + Math.sin((a.rot * Math.PI) / 180) * a.len * 0.56;
        return (
          <g key={i}>
            <ForceArrow x={a.x} y={a.y} len={a.len} rot={a.rot} w={26}
              color={C.graphRed} t={t} />
            <XMark x={mx} y={my} s={1.05} t={seg(f, 24 + a.d, 34 + a.d)} />
          </g>
        );
      })}
      <TagPlate x={940} y={424} text="島" size={60} t={seg(f, 6, 20)} fill={C.island} />
      <TagPlate x={1448} y={332} text="面積 = 一定" size={42} t={seg(f, 30, 42)} color={KRP.red} />
      <TagPlate x={478} y={768} text="海" size={46} t={seg(f, 10, 24)} fill={C.sea} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb5_shou_tobira: (f) => <Kb5ShouTobira f={f} />,
  kb5_hashira_5hon: (f) => <Kb5Hashira5Hon f={f} />,
  kb5_hone_hako_mizu: (f) => <Kb5HoneHakoMizu f={f} />,
  kb5_1880_1900: (f) => <Kb5N1880to1900 f={f} />,
  kb5_jimen_ga_iru: (f) => <Kb5JimenGaIru f={f} />,
  kb5_riyuu_ga_nai: (f) => <Kb5RiyuuGaNai f={f} />,
  kb5_mou_hitori: (f) => <Kb5MouHitori f={f} />,
  kb5_yoku: (f) => <Kb5Yoku f={f} />,
  kb5_manhattan: (f) => <Kb5Manhattan f={f} />,
  kb5_shima_wa_fuenai: (f) => <Kb5ShimaWaFuenai f={f} />,
};

export const K_B5A_MOTIFS: string[] = [
  "kb5_shou_tobira",      // #179 第5章、島には、土地がない。
  "kb5_hashira_5hon",     // #180 柱は、5本立ちました。
  "kb5_hone_hako_mizu",   // #181 骨、箱、水、灯り、空気。
  "kb5_1880_1900",        // #182 道具が揃ったのは、1880年から1900年の20年です。
  "kb5_jimen_ga_iru",     // #183 ただし、柱には、立つ地面が要ります。
  "kb5_riyuu_ga_nai",     // #184 建つ理由がなければ、建ちません。
  "kb5_mou_hitori",       // #185 ここで、もう一人の主役を呼びます。
  "kb5_yoku",             // #186 人間の、欲です。
  "kb5_manhattan",        // #187 舞台は、ニューヨークのマンハッタン。
  "kb5_shima_wa_fuenai",  // #188 ここは、島です。土地は、どうやっても増えません。
];

export const kosoB5aScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
