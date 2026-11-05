// 「なぜ高層ビルは生まれたのか」: ブロック1 = 第1章「壁を、やめる。」
// 担当範囲: 台本 docs/koso-script-v7.txt の 29〜66行目 (文#28〜#65・38文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで38枚。
// motif 名は必ず kb1_ で始める。WobbleDefs の seed はこのファイルでは 500〜599 を使う。
//
// ★作り方の約束 (作者の指示をそのまま置いておく)
//   「各場面にふさわしい背景や演出動きを緻密に細かく色んな所に配置するのが基本」
//   「キットを作ってそこから展開する (= 同じ背景の中で置く物だけ入れ替える) のは
//     基本的にやらないで欲しい」
//   なので、このファイルには「全38シーン共通の背景」は作っていない。
//   下に置いてあるのは煉瓦の目地・煙・炎・寸法線のような “筆” だけで、
//   どこで・いつ・誰が・何をしている場面かは 1文ごとに別に組んでいる。
//
// ★ただし全シーンを同じ濃さで描かない (制作ガイド 第3層-7「絵に格をつける」)。
//   山 = 遠景/中景/近景の3層を端から端まで入れて世界を描く (2割)。
//   並 = 主役と、その場所が分かる最小限だけ (3〜4割)。
//   図 = 紙地に主役の図だけ。背景・通行人・小物は置かない (4〜5割)。
//   図・並でも線・色・札・フォントの品質は落とさず、必ず f で動かし、
//   主役は画面の中央に大きく置く (シンプル ≠ 小さい。余白は「寄り」)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   文字は 23px 以上。重要な要素は y=200〜870 に置く (上に章タイトル帯・下に字幕)。

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, TowerOnPillars } from "./KosoPillars";

// ===================================================================
// このファイルだけで使う色 (1890年代シカゴ〜現代の素材の色)
// ===================================================================
const C = {
  brick: "#B4704C",       // 煉瓦の赤茶
  brickDark: "#8E5438",   // 煉瓦の目地・陰
  brickLight: "#C98B66",  // 日の当たる煉瓦
  stone: "#CFC6B4",       // 石灰石
  stoneDark: "#A99E89",
  mortar: "#E3DACA",
  clay: "#8E9B86",        // シカゴの青粘土
  clayDark: "#6E7A68",
  soil: "#B79A6E",        // 表土
  soilDark: "#96794F",
  sand: "#D6C296",
  rock: "#9A948A",        // 硬い層
  steel: "#8A94A0",       // 鉄骨 (柱「骨」と同じ色)
  steelDark: "#6B7480",
  steelHot: "#E05A2A",    // 赤熱した鉄
  terra: "#C97F55",       // テラコッタ (素焼き)
  terraDark: "#A3603B",
  terraLight: "#DFA17A",
  glass: "#AFC9DC",
  glassDeep: "#7FA3BE",
  skyDay: "#CFE2F0",
  skyHaze: "#E2EAEF",
  skyDusk: "#F0CBA0",
  skyNight: "#2A3850",
  skyFire: "#8E2E20",
  smoke: "#CFC8BC",
  wood: "#A77C4E",
  woodDark: "#7E5B36",
  concrete: "#C7C3B8",
  concreteDark: "#A49F93",
  rubber: "#4A4640",      // 免震の積層ゴム
  oil: "#C08A3A",         // ダンパーの油
  board: "#2E3A33",       // 黒板
  lamp: "#F5DD9A",
  brass: "#C9A646",       // 真鍮 (把手・計器)
  ink2: "#3A4350",        // 窓の暗がり
  paper: "#F2EAD6",       // 図面・帳簿の紙
} as const;

// ===================================================================
// 小さな “筆” (背景キットではない。線や粒を引くための道具)
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Person と同じゆれ式 (帽子などを人物に同期させる)
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;
// (cx,cy) に寄るカメラ
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// seed から 0〜1 の擬似乱数 (同じ seed なら毎回同じ = 絵がちらつかない)
const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// 煉瓦の目地。矩形の領域に積み目地を引く
const Bricks: React.FC<{
  x: number; y: number; w: number; h: number; bw?: number; bh?: number;
  fill?: string; line?: string; opacity?: number; lw?: number;
}> = ({ x, y, w, h, bw = 48, bh = 22, fill = C.brick, line = C.brickDark, opacity = 1, lw = 2 }) => {
  const rows = Math.max(1, Math.floor(h / bh));
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      <g stroke={line} strokeWidth={lw} opacity={0.75}>
        {Array.from({ length: rows }, (_, r) => {
          const yy = y + r * bh;
          const off = (r % 2) * (bw / 2);
          const cols = Math.ceil(w / bw) + 1;
          return (
            <g key={r}>
              {r > 0 && <line x1={x} y1={yy} x2={x + w} y2={yy} />}
              {Array.from({ length: cols }, (_, c) => {
                const xx = x + off + c * bw;
                if (xx <= x + 1 || xx >= x + w - 1) return null;
                return <line key={c} x1={xx} y1={yy} x2={xx} y2={Math.min(yy + bh, y + h)} />;
              })}
            </g>
          );
        })}
      </g>
    </g>
  );
};

// 切石の積み (煉瓦より目が大きく、目地が太い)
const Stones: React.FC<{
  x: number; y: number; w: number; h: number; bw?: number; bh?: number;
  fill?: string; line?: string; opacity?: number;
}> = ({ x, y, w, h, bw = 118, bh = 56, fill = C.stone, line = C.stoneDark, opacity = 1 }) => {
  const rows = Math.max(1, Math.floor(h / bh));
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      {Array.from({ length: rows }, (_, r) => {
        const yy = y + r * bh;
        const off = (r % 2) * (bw / 2);
        const cols = Math.ceil(w / bw) + 1;
        return (
          <g key={r}>
            {Array.from({ length: cols }, (_, c) => {
              const xx = x + off + c * bw;
              const x0 = Math.max(xx, x);
              const x1 = Math.min(xx + bw, x + w);
              if (x1 - x0 < 8) return null;
              return (
                <rect key={c} x={x0 + 2} y={yy + 2} width={x1 - x0 - 4} height={bh - 4} rx={3}
                  fill={fill} stroke={line} strokeWidth={3} />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

// 立ちのぼる煙 (煙突・火事・砂ぼこり)
const Smoke: React.FC<{
  x: number; y: number; f: number; n?: number; r?: number; rise?: number;
  speed?: number; drift?: number; color?: string; opacity?: number; grow?: number;
}> = ({
  x, y, f, n = 6, r = 26, rise = 240, speed = 0.7, drift = 40,
  color = C.smoke, opacity = 0.7, grow = 1.8,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const p = ((((i / n) + (f * speed) / rise) % 1) + 1) % 1;
      const yy = y - p * rise;
      const xx = x + Math.sin(p * 3.1 + i) * drift * p;
      const rr = r * (1 + p * grow);
      return (
        <circle key={i} cx={xx} cy={yy} r={rr} fill={color}
          opacity={opacity * (1 - p) * (0.45 + 0.55 * Math.sin(p * Math.PI))} />
      );
    })}
  </g>
);

// 炎 1つ (3重: 外=橙 中=黄 芯=白)
const Flame: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number }> =
  ({ x, y, s = 1, f, phase = 0 }) => {
    const k = Math.sin((f + phase * 11) / 5.5);
    const k2 = Math.sin((f + phase * 7) / 3.5);
    const hh = 1 + k * 0.14;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d={`M -34 0 Q -40 ${-52 * hh} ${-8 + k2 * 5} ${-96 * hh} Q 6 ${-60 * hh} 20 ${-104 * hh} Q 42 ${-56 * hh} 34 0 Z`}
          fill={KRP.orange} stroke={KRP.red} strokeWidth={4} />
        <path d={`M -20 0 Q -24 ${-36 * hh} ${-2 + k2 * 4} ${-68 * hh} Q 14 ${-38 * hh} 20 0 Z`}
          fill={KRP.yellow} />
        <path d={`M -9 0 Q -10 ${-20 * hh} ${k2 * 3} ${-38 * hh} Q 9 ${-20 * hh} 9 0 Z`}
          fill="#FFF3C8" opacity={0.95} />
      </g>
    );
  };

// 火の粉 (舞い上がる粒)
const Embers: React.FC<{
  x: number; y: number; f: number; n?: number; w?: number; h?: number; color?: string; s?: number;
}> = ({ x, y, f, n = 12, w = 240, h = 340, color = KRP.yellow, s = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const p = ((((i / n) + (f * 0.9) / h) % 1) + 1) % 1;
      const xx = x + (rnd(i * 5.1) - 0.5) * w + Math.sin(f / 9 + i * 2) * 22;
      const yy = y - p * h;
      return <circle key={i} cx={xx} cy={yy} r={(2.5 + rnd(i * 3.3) * 4) * s}
        fill={color} opacity={(1 - p) * 0.95} />;
    })}
  </g>
);

// 雲 1つ
const Cloud: React.FC<{ cx: number; cy: number; s?: number; fill?: string; opacity?: number }> =
  ({ cx, cy, s = 1, fill = KRP.white, opacity = 0.9 }) => (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={opacity}>
      <ellipse cx={-54} cy={10} rx={62} ry={26} fill={fill} />
      <ellipse cx={14} cy={-6} rx={74} ry={38} fill={fill} />
      <ellipse cx={74} cy={14} rx={58} ry={24} fill={fill} />
      <ellipse cx={18} cy={20} rx={92} ry={22} fill={fill} />
    </g>
  );

// 鳥 (ゆるいV字。はばたく)
const Birds: React.FC<{
  x: number; y: number; f: number; n?: number; s?: number; speed?: number;
  color?: string; spread?: number;
}> = ({ x, y, f, n = 3, s = 1, speed = 0.55, color = KRP.ink, spread = 90 }) => (
  <g stroke={color} strokeWidth={4} fill="none" strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const xx = x + ((f * speed + i * spread) % (W + 300)) - 150;
      const yy = y + Math.sin(f / 26 + i * 1.3) * 16 + i * 26;
      const wing = 10 + Math.sin(f / 5 + i) * 8;
      return (
        <path key={i}
          d={`M ${xx - 20 * s} ${yy + wing * s * 0.4} Q ${xx} ${yy - wing * s} ${xx + 20 * s} ${yy + wing * s * 0.4}`} />
      );
    })}
  </g>
);

// 横の寸法線 (t で左から伸び、札が出る)
const DimH: React.FC<{
  x1: number; x2: number; y: number; text: string; t?: number; size?: number;
  color?: string; labelDy?: number; tick?: number; above?: boolean;
}> = ({ x1, x2, y, text, t = 1, size = 30, color = KRP.red, labelDy, tick = 18, above = true }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const xm = lerp(x1, x2, easeOut(tt));
  const dy = labelDy ?? (above ? -36 : 42);
  return (
    <g>
      <line x1={x1} y1={y - tick} x2={x1} y2={y + tick} stroke={color} strokeWidth={4.5} />
      <line x1={x1} y1={y} x2={xm} y2={y} stroke={color} strokeWidth={4.5} />
      {tt > 0.96 && (
        <g fill={color}>
          <line x1={x2} y1={y - tick} x2={x2} y2={y + tick} stroke={color} strokeWidth={4.5} />
          <polygon points={`${x1},${y} ${x1 + 20},${y - 9} ${x1 + 20},${y + 9}`} />
          <polygon points={`${x2},${y} ${x2 - 20},${y - 9} ${x2 - 20},${y + 9}`} />
        </g>
      )}
      <TagPlate x={(x1 + x2) / 2} y={y + dy} text={text} size={size}
        t={clamp01((tt - 0.55) / 0.35)} color={color} />
    </g>
  );
};

// 縦の寸法線
const DimV: React.FC<{
  x: number; y1: number; y2: number; text: string; t?: number; size?: number;
  color?: string; labelDx?: number; tick?: number;
}> = ({ x, y1, y2, text, t = 1, size = 30, color = KRP.red, labelDx = 0, tick = 18 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const ym = lerp(y1, y2, easeOut(tt));
  return (
    <g>
      <line x1={x - tick} y1={y1} x2={x + tick} y2={y1} stroke={color} strokeWidth={4.5} />
      <line x1={x} y1={y1} x2={x} y2={ym} stroke={color} strokeWidth={4.5} />
      {tt > 0.96 && (
        <g fill={color}>
          <line x1={x - tick} y1={y2} x2={x + tick} y2={y2} stroke={color} strokeWidth={4.5} />
          <polygon points={`${x},${y1} ${x - 9},${y1 + 20} ${x + 9},${y1 + 20}`} />
          <polygon points={`${x},${y2} ${x - 9},${y2 - 20} ${x + 9},${y2 - 20}`} />
        </g>
      )}
      <TagPlate x={x + labelDx} y={(y1 + y2) / 2} text={text} size={size}
        t={clamp01((tt - 0.55) / 0.35)} color={color} />
    </g>
  );
};

// 荷重の太い矢印 (下向き)。重さの流れを示す
const LoadArrow: React.FC<{
  x: number; y1: number; y2: number; w?: number; color?: string; t?: number; opacity?: number;
}> = ({ x, y1, y2, w = 20, color = KRP.red, t = 1, opacity = 0.85 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const ye = lerp(y1, y2, easeOut(tt));
  const head = Math.min(34, Math.abs(ye - y1) * 0.5);
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y1} width={w} height={Math.max(0, ye - y1 - head)} fill={color} />
      <polygon points={`${x},${ye} ${x - w},${ye - head} ${x + w},${ye - head}`} fill={color} />
    </g>
  );
};

// 上向きの太い矢印 (持ち上げる)
const LiftArrow: React.FC<{
  x: number; y1: number; y2: number; w?: number; color?: string; t?: number; opacity?: number;
}> = ({ x, y1, y2, w = 20, color = KRP.green, t = 1, opacity = 0.9 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const ye = lerp(y1, y2, easeOut(tt));
  const head = Math.min(34, Math.abs(y1 - ye) * 0.5);
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={ye + head} width={w} height={Math.max(0, y1 - ye - head)} fill={color} />
      <polygon points={`${x},${ye} ${x - w},${ye + head} ${x + w},${ye + head}`} fill={color} />
    </g>
  );
};

// リベット列 (2点を結ぶ線上に鉄のびょうを並べる)
const Rivets: React.FC<{
  x1: number; y1: number; x2: number; y2: number; n?: number; r?: number; color?: string;
}> = ({ x1, y1, x2, y2, n = 6, r = 5.5, color = C.steelDark }) => (
  <g fill={color}>
    {Array.from({ length: n }, (_, i) => {
      const p = (i + 0.5) / n;
      return <circle key={i} cx={lerp(x1, x2, p)} cy={lerp(y1, y2, p)} r={r} />;
    })}
  </g>
);

// 鉄骨 (I形鋼) の正面。縦
const IBeamV: React.FC<{
  x: number; y1: number; y2: number; w?: number; color?: string; dark?: string; rivets?: boolean;
}> = ({ x, y1, y2, w = 38, color = C.steel, dark = C.steelDark, rivets = true }) => (
  <g>
    <rect x={x - w / 2} y={y1} width={w} height={y2 - y1} fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={x - w / 2 + 5} y={y1} width={7} height={y2 - y1} fill={dark} opacity={0.8} />
    <rect x={x + w / 2 - 12} y={y1} width={7} height={y2 - y1} fill={dark} opacity={0.5} />
    {rivets && <Rivets x1={x} y1={y1 + 14} x2={x} y2={y2 - 14} n={Math.max(3, Math.round((y2 - y1) / 46))} />}
  </g>
);

// 鉄骨 (I形鋼) の正面。横
const IBeamH: React.FC<{
  y: number; x1: number; x2: number; h?: number; color?: string; dark?: string; rivets?: boolean;
}> = ({ y, x1, x2, h = 30, color = C.steel, dark = C.steelDark, rivets = true }) => (
  <g>
    <rect x={x1} y={y - h / 2} width={x2 - x1} height={h} fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={x1} y={y - 4} width={x2 - x1} height={8} fill={dark} opacity={0.65} />
    {rivets && <Rivets x1={x1 + 14} y1={y} x2={x2 - 14} y2={y} n={Math.max(3, Math.round((x2 - x1) / 54))} />}
  </g>
);

// 遠景の街並み (seed で形が変わる。シーンごとに別の seed を使う)
const RowOfBuildings: React.FC<{
  x0: number; x1: number; base: number; seed: number; minH?: number; maxH?: number;
  fill?: string; stroke?: string; sw?: number; windows?: boolean; winColor?: string;
  opacity?: number; count?: number; roof?: boolean;
}> = ({
  x0, x1, base, seed, minH = 60, maxH = 180, fill = C.stoneDark, stroke = KRP.ink,
  sw = 3.5, windows = false, winColor = C.glass, opacity = 1, count, roof = true,
}) => {
  const n = count ?? Math.max(3, Math.round((x1 - x0) / 130));
  const bw = (x1 - x0) / n;
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const r = rnd(seed * 17.3 + i * 4.7);
        const r2 = rnd(seed * 5.1 + i * 9.3);
        const h = minH + r * (maxH - minH);
        const x = x0 + i * bw;
        const w = bw * (0.78 + r2 * 0.2);
        const rows = Math.max(1, Math.floor(h / 44));
        const cols = Math.max(1, Math.floor(w / 34));
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={sw} />
            {roof && r2 > 0.55 && (
              <rect x={x + w * 0.3} y={base - h - 22} width={w * 0.2} height={22}
                fill={fill} stroke={stroke} strokeWidth={sw} />
            )}
            {windows && Array.from({ length: rows }, (_, rr) =>
              Array.from({ length: cols }, (_, cc) => (
                <rect key={`${rr}-${cc}`}
                  x={x + 9 + (cc * (w - 18)) / cols} y={base - h + 14 + (rr * (h - 20)) / rows}
                  width={Math.max(6, (w - 18) / cols - 9)} height={Math.max(8, (h - 20) / rows - 13)}
                  fill={winColor} opacity={0.6 + rnd(seed + rr * 3 + cc * 11) * 0.35} />
              )))}
          </g>
        );
      })}
    </g>
  );
};

// ガス灯 (1890年代の街灯)
const GasLamp: React.FC<{ x: number; y: number; s?: number; f?: number; lit?: boolean }> =
  ({ x, y, s = 1, f = 0, lit = false }) => {
    const glow = lit ? 0.35 + 0.2 * Math.sin(f / 13) : 0;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-9} y={-250} width={18} height={250} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-22} y={-18} width={44} height={18} rx={4} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -30 -250 L 30 -250 L 22 -300 L -22 -300 Z" fill={lit ? C.lamp : KRP.white}
          stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
        <path d="M -24 -300 L 24 -300 L 0 -328 Z" fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        {lit && <circle cx={0} cy={-274} r={52} fill={KRP.yellow} opacity={glow} />}
        {lit && <circle cx={0} cy={-272} r={12} fill="#FFF3C8" />}
        <line x1={-26} y1={-232} x2={26} y2={-232} stroke={KRP.ink} strokeWidth={4} />
      </g>
    );
  };

// 1890年代の馬車 (馬1頭 + 四輪の客車)。flip で向きが変わる
const Carriage: React.FC<{ x: number; y: number; s?: number; f?: number; flip?: boolean }> =
  ({ x, y, s = 1, f = 0, flip = false }) => {
    const step = Math.sin(f / 7) * 6;
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
        {/* 馬 */}
        <path d="M -300 -78 Q -300 -118 -256 -118 L -196 -118 Q -176 -118 -176 -92 L -176 -70 Q -176 -56 -196 -56 L -282 -56 Q -300 -56 -300 -78 Z"
          fill="#6E5440" stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -300 -112 Q -330 -120 -336 -152 Q -338 -170 -322 -172 Q -304 -174 -300 -152 Z"
          fill="#6E5440" stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -336 -152 L -352 -140 L -336 -132 Z" fill="#6E5440" stroke={KRP.ink} strokeWidth={4} />
        <line x1={-278} y1={-56} x2={-282 + step} y2={0} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <line x1={-250} y1={-56} x2={-244 - step} y2={0} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <line x1={-206} y1={-56} x2={-212 - step} y2={0} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <line x1={-186} y1={-56} x2={-180 + step} y2={0} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        {/* 客車 */}
        <rect x={-140} y={-178} width={190} height={122} rx={10} fill="#3A3F4A" stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-120} y={-162} width={70} height={56} rx={6} fill={C.glass} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        <rect x={-36} y={-162} width={70} height={56} rx={6} fill={C.glass} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        <rect x={-146} y={-192} width={202} height={18} rx={6} fill="#2C313A" stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={44} y={-150} width={42} height={94} rx={6} fill="#4A5160" stroke={KRP.ink} strokeWidth={5} />
        {/* 車輪 */}
        {[-104, 26].map((wx, i) => (
          <g key={i} transform={`translate(${wx} -22)`}>
            <circle cx={0} cy={0} r={i === 0 ? 30 : 34} fill="none" stroke={KRP.ink} strokeWidth={6} />
            <g transform={`rotate(${f * 4})`} stroke={KRP.ink} strokeWidth={3.5}>
              <line x1={-26} y1={0} x2={26} y2={0} />
              <line x1={0} y1={-26} x2={0} y2={26} />
              <line x1={-19} y1={-19} x2={19} y2={19} />
              <line x1={19} y1={-19} x2={-19} y2={19} />
            </g>
          </g>
        ))}
      </g>
    );
  };

// 山高帽 (1890年代の紳士)。Person の頭に重ねる
const Bowler: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = "#352E28" }) => (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <path d="M -54 -262 Q -56 -320 0 -320 Q 56 -320 54 -262 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-262} rx={90} ry={15} fill={color} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );

// 鳥打ち帽 (職人・労働者)
const FlatCap: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = "#5C6670" }) => (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <path d="M -60 -268 Q -62 -312 0 -312 Q 62 -312 60 -268 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -62 -268 Q -96 -266 -100 -252 Q -62 -248 -10 -256 Z" fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );

// シルクハット (設計者・大家)
const TopHat: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = "#272320" }) => (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <ellipse cx={0} cy={-262} rx={94} ry={16} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-48} y={-358} width={96} height={100} rx={6} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-48} y={-288} width={96} height={16} fill="#6B4A32" opacity={0.8} />
    </g>
  );

// 木の床板 (室内の床)
const PlankFloor: React.FC<{
  y: number; h: number; n?: number; fill?: string; line?: string; x0?: number; x1?: number;
}> = ({ y, h, n = 9, fill = C.wood, line = C.woodDark, x0 = -20, x1 = W + 20 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={h} fill={fill} />
    <g stroke={line} strokeWidth={3} opacity={0.6}>
      {Array.from({ length: n }, (_, i) => {
        const yy = y + ((i + 1) / (n + 1)) * h;
        return <line key={i} x1={x0} y1={yy} x2={x1} y2={yy} />;
      })}
    </g>
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ひび (石や壁が割れる)
const Crack: React.FC<{ d: string; t?: number; color?: string; sw?: number }> =
  ({ d, t = 1, color = KRP.ink, sw = 5 }) => {
    const tt = clamp01(t);
    if (tt <= 0.02) return null;
    return <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
      strokeLinejoin="round" opacity={tt} />;
  };

// 電線 (1890年代シカゴの空は電線だらけ)
const Wires: React.FC<{
  x0: number; x1: number; y: number; n?: number; sag?: number; color?: string; opacity?: number;
}> = ({ x0, x1, y, n = 3, sag = 26, color = KRP.ink, opacity = 0.5 }) => (
  <g stroke={color} strokeWidth={3} fill="none" opacity={opacity}>
    {Array.from({ length: n }, (_, i) => (
      <path key={i} d={`M ${x0} ${y + i * 16} Q ${(x0 + x1) / 2} ${y + i * 16 + sag} ${x1} ${y + i * 16}`} />
    ))}
  </g>
);

// 現代のタワークレーン (#58 以降でだけ使う)
const TowerCrane: React.FC<{
  x: number; base: number; top: number; f: number; arm?: number; flip?: boolean;
}> = ({ x, base, top, f, arm = 420, flip = false }) => {
  const sw = flip ? -1 : 1;
  const hook = top + 130 + Math.sin(f / 37) * 60;
  const hx = x + sw * (arm * 0.55);
  return (
    <g>
      <rect x={x - 22} y={top} width={44} height={base - top} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
        {Array.from({ length: Math.max(2, Math.round((base - top) / 50)) }, (_, i) => {
          const y0 = top + i * 50;
          return (
            <g key={i}>
              <line x1={x - 22} y1={y0} x2={x + 22} y2={y0 + 50} />
              <line x1={x + 22} y1={y0} x2={x - 22} y2={y0 + 50} />
            </g>
          );
        })}
      </g>
      <rect x={flip ? x - arm : x} y={top - 14} width={arm} height={22} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={flip ? x : x - arm * 0.3} y={top - 14} width={arm * 0.3} height={22}
        fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      <polygon points={`${x - 26},${top - 14} ${x + 26},${top - 14} ${x},${top - 86}`}
        fill="none" stroke={KRP.ink} strokeWidth={4} />
      <line x1={hx} y1={top + 8} x2={hx} y2={hook} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={hx - 16} y={hook} width={32} height={20} rx={4} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// ===================================================================
// 文#28 章扉「壁を、やめる。」
//   どこ: 1890年代シカゴの街角。歩道から、重い煉瓦の壁を見上げている。
//   演出: 画面左は壁しかない (上は画面の外へ切れる = 高さと重さ)。右は空けて題字。
//   動き: 壁から煉瓦が1つ、ぽろっと外れて浮き出す (= これから壁をやめる話)。
// ===================================================================
const Kb1Door: React.FC<{ f: number }> = ({ f }) => {
  const outT = easeOut(seg(f, 22, 52));         // 煉瓦が外れる
  const carX = 1180 - ((f * 1.2) % 1500);       // 馬車が車道をゆっくり横切る
  return (
    <Frame
      f={f} seed={500} bg={C.skyHaze}
      over={<ChapterDoor num={1} title="壁を、やめる。" t={seg(f, 6, 26)} left={1016} top={248} width={852} />}
    >
      {/* ───── 遠景: 空・雲・工場の煙・通りの奥の街並み ───── */}
      <rect x={-20} y={-20} width={W + 40} height={650} fill={C.skyDay} />
      <rect x={-20} y={-20} width={W + 40} height={230} fill={C.skyHaze} />
      <Cloud cx={1180 + Math.sin(f / 130) * 26} cy={150} s={1.0} opacity={0.7} />
      <Cloud cx={1700} cy={206} s={0.74} opacity={0.5} />
      {[1000, 1096].map((cx, i) => (
        <g key={i}>
          <rect x={cx} y={450} width={24} height={180} fill={C.brickDark} stroke={KRP.ink} strokeWidth={4} />
          <Smoke x={cx + 12} y={446} f={f + i * 37} n={5} r={17} rise={300} speed={0.5} drift={64} opacity={0.42} />
        </g>
      ))}
      <RowOfBuildings x0={845} x1={1960} base={626} seed={3} minH={92} maxH={168}
        fill={C.stoneDark} windows winColor={C.glass} opacity={0.82} />
      <Birds x={1240} y={352} f={f} n={3} s={0.85} speed={0.6} color={C.steelDark} />

      {/* ───── 中景: 車道・電柱と電線・向かいの歩道 ───── */}
      {/* 向かいの歩道 (奥の街の足もと) と、そこを歩く小さな人影 */}
      <rect x={-20} y={600} width={W + 40} height={30} fill="#BCB2A0" stroke={KRP.ink} strokeWidth={4} />
      {[1010, 1190, 1560, 1760].map((px, i) => (
        <g key={i} opacity={0.8}>
          <rect x={px - 11} y={548} width={22} height={54} fill={i % 2 ? "#5A5464" : "#4A4A52"}
            stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={px} cy={538} r={12} fill="#E9D9BE" stroke={KRP.ink} strokeWidth={3.5} />
          <ellipse cx={px} cy={528} rx={17} ry={6} fill={KRP.ink} />
        </g>
      ))}
      {/* 車道 (敷石) */}
      <rect x={-20} y={626} width={W + 40} height={282} fill="#9D9789" />
      <line x1={-20} y1={626} x2={W + 20} y2={626} stroke={KRP.ink} strokeWidth={5} />
      <g stroke="#8A8477" strokeWidth={3} opacity={0.85}>
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 22 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-20 + c * 92 + (r % 2) * 46} y={630 + r * 46} width={88} height={42}
              fill={(r + c) % 3 === 0 ? "#999385" : "#A09A8C"} />
          )))}
      </g>
      {/* 轍 (わだち) */}
      <g stroke="#8A8477" strokeWidth={7} opacity={0.5}>
        <line x1={-20} y1={790} x2={W + 20} y2={782} />
        <line x1={-20} y1={848} x2={W + 20} y2={840} />
      </g>
      {[900, 1420, 1900].map((px, i) => (
        <g key={i}>
          <rect x={px - 9} y={300} width={18} height={330} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <line x1={px - 44} y1={338} x2={px + 44} y2={338} stroke={KRP.ink} strokeWidth={5} />
          <line x1={px - 38} y1={386} x2={px + 38} y2={386} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      <Wires x0={900} x1={1420} y={336} n={3} sag={30} />
      <Wires x0={1420} x1={1900} y={336} n={3} sag={26} />
      <Carriage x={carX} y={880} s={0.7} f={f} />
      {/* 荷車と樽 (車道の右手) */}
      <g transform="translate(1660 862)">
        <rect x={-130} y={-54} width={260} height={30} rx={5} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-120} y={-24} width={240} height={14} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {[-72, 0, 72].map((bx, i) => (
          <g key={i}>
            <rect x={bx - 34} y={-134} width={68} height={82} rx={9} fill="#A5763F"
              stroke={KRP.ink} strokeWidth={5} />
            <line x1={bx - 34} y1={-110} x2={bx + 34} y2={-110} stroke={KRP.ink} strokeWidth={4} />
            <line x1={bx - 34} y1={-78} x2={bx + 34} y2={-78} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {[-88, 90].map((wx, i) => (
          <g key={i}>
            <circle cx={wx} cy={-4} r={40} fill="none" stroke={KRP.ink} strokeWidth={7} />
            <circle cx={wx} cy={-4} r={8} fill={KRP.ink} />
            {Array.from({ length: 6 }, (_, k) => (
              <line key={k} x1={wx} y1={-4} x2={wx + Math.cos((k * Math.PI) / 3) * 35}
                y2={-4 + Math.sin((k * Math.PI) / 3) * 35} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
          </g>
        ))}
        <path d="M -130 -40 l -70 -28" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" fill="none" />
      </g>

      {/* ───── 主役: 画面左の、重い煉瓦の壁 (上は画面の外) ───── */}
      <g>
        <Bricks x={-20} y={-20} w={846} h={930} bw={54} bh={25} />
        {/* 石の帯 (腰壁・胴差し・軒の下) */}
        <Stones x={-20} y={762} w={846} h={148} bw={132} bh={74} />
        {[150, 452].map((yy, i) => (
          <rect key={i} x={-20} y={yy} width={846} height={26} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* アーチ窓 2段×3列 (壁が厚いので窓が奥まって見える) */}
        {[196, 498].map((wy) =>
          [60, 318, 576].map((wx) => (
            <g key={`${wy}-${wx}`}>
              <path d={`M ${wx} ${wy + 228} L ${wx} ${wy + 84} A 94 94 0 0 1 ${wx + 188} ${wy + 84} L ${wx + 188} ${wy + 228} Z`}
                fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${wx + 26} ${wy + 228} L ${wx + 26} ${wy + 92} A 68 68 0 0 1 ${wx + 162} ${wy + 92} L ${wx + 162} ${wy + 228} Z`}
                fill="#43556A" stroke={KRP.ink} strokeWidth={4.5} />
              <line x1={wx + 94} y1={wy + 34} x2={wx + 94} y2={wy + 228} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
              <line x1={wx + 26} y1={wy + 150} x2={wx + 162} y2={wy + 150} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
              {/* 窓台 */}
              <rect x={wx - 10} y={wy + 226} width={208} height={18} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
            </g>
          )))}
        {/* 壁の右端の輪郭 (ここで壁が終わる = 厚みのある角) */}
        <rect x={790} y={-20} width={36} height={930} fill={C.brickDark} opacity={0.55} />
        <line x1={826} y1={-20} x2={826} y2={910} stroke={KRP.ink} strokeWidth={7} />
      </g>

      {/* 外れていく煉瓦 (軌跡と粉じんを添えて「壁がほどけ出した」と読めるように) */}
      <g opacity={outT}>
        <path d={`M 826 640 Q ${826 + outT * 80} ${600 - outT * 50} ${826 + outT * 150} ${640 - outT * 62}`}
          fill="none" stroke={C.brickDark} strokeWidth={5} strokeDasharray="12 14"
          strokeLinecap="round" opacity={0.6} />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={830 + rnd(i * 3.7) * 150 * outT} cy={636 + rnd(i * 5.1) * 70 - outT * 24}
            r={3 + rnd(i * 2.3) * 6} fill={C.brickLight} opacity={0.6} />
        ))}
      </g>
      <g transform={`translate(${826 + outT * 150} ${640 - outT * 62}) rotate(${outT * 26})`} opacity={1 - outT * 0.1}>
        <rect x={-27} y={-12} width={54} height={25} fill={C.brickLight} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 2つめ (抜けかけ) */}
      <g transform={`translate(${820 + outT * 54} ${700 - outT * 10}) rotate(${outT * -12})`} opacity={outT}>
        <rect x={-27} y={-12} width={54} height={25} fill={C.brick} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <g opacity={outT * 0.8}>
        <rect x={790} y={628} width={36} height={25} fill="#4A3B30" />
        <rect x={790} y={690} width={30} height={25} fill="#4A3B30" opacity={0.7} />
      </g>

      {/* ───── 近景: 手前の歩道・ガス灯・壁を見上げる2人 ───── */}
      <rect x={-20} y={902} width={W + 40} height={200} fill="#C3B9A4" />
      <line x1={-20} y1={902} x2={W + 20} y2={902} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.3}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={i * 290} y1={902} x2={i * 290 - 40} y2={1090} />)}
        <line x1={-20} y1={990} x2={W + 20} y2={990} />
      </g>
      <GasLamp x={960} y={902} s={0.82} f={f} />
      <GasLamp x={1700} y={902} s={0.74} f={f} />
      {/* 手前の歩道を行く人と犬 */}
      <Person x={1380} y={1040} s={0.8} cloth="#5A5064" clothDark="#403848" face="normal"
        gaze={[-0.9, -0.4]} lean={-3} f={f} phase={5} />
      <TopHat x={1380} y={1040} s={0.8} f={f} phase={5} color="#2A2630" />
      <g transform={`translate(1486 ${1046 + Math.sin(f / 9) * 3})`}>
        <ellipse cx={0} cy={-30} rx={44} ry={26} fill="#8A7256" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-40} cy={-56} r={24} fill="#8A7256" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -56 -70 q -10 -20 6 -22 l 8 18 Z" fill="#6E5A42" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-50} cy={-56} r={4} fill={KRP.ink} />
        <g stroke={KRP.ink} strokeWidth={5}>
          <line x1={-24} y1={-10} x2={-26} y2={14} />
          <line x1={-2} y1={-8} x2={0} y2={14} />
          <line x1={24} y1={-10} x2={28} y2={14} />
        </g>
        <path d={`M 40 -42 q 26 ${-18 + Math.sin(f / 6) * 10} 34 -34`} fill="none"
          stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      </g>
      <Person x={520} y={986} s={0.86} cloth="#4A5A74" clothDark="#36445C" face="surprised"
        gaze={[-2, -7]} f={f} phase={1} />
      <Bowler x={520} y={986} s={0.86} f={f} phase={1} />
      <Person x={700} y={996} s={0.9} cloth="#6B5B45" clothDark="#53452F" face="worried"
        gaze={[-3, -6]} f={f} phase={3} />
      <FlatCap x={700} y={996} s={0.9} f={f} phase={3} color="#7A6A52" />
    </Frame>
  );
};

// ===================================================================
// 文#29 まず、建物は自分の重さに負けます。
//   どこ: 曇りの日の石材置き場。石工が試しに積み上げた小さな石の塔。
//   演出: 寄り。塔のまんなかに視線を集め、いちばん下の石だけが潰れていく。
//   動き: 上から「自分の重さ」の矢印が降り、最下段がはらみ出してひびが入り、粉が落ちる。
// ===================================================================
const Kb1OmosaNiMakeru: React.FC<{ f: number }> = ({ f }) => {
  const load = seg(f, 8, 30);
  const bulge = easeOut(seg(f, 26, 50));         // 下の石がはらむ
  const crackT = seg(f, 36, 54);
  const sink = bulge * 9;
  const base = 806;                               // 塔の足元
  const tiers = [0, 1, 2, 3, 4, 5];               // 6段
  return (
    <Frame f={f} seed={501} bg="#E7E2D6">
      {/* ───── 遠景: 低い曇り空・製材所と工場の煙・水平線の街 ───── */}
      <rect x={-20} y={-20} width={W + 40} height={560} fill="#DFE3E4" />
      <rect x={-20} y={-20} width={W + 40} height={260} fill="#E9EBEA" />
      {[160, 300, 1660].map((cx, i) => (
        <Smoke key={i} x={cx} y={430} f={f + i * 50} n={6} r={30} rise={400} speed={0.42} drift={90}
          color="#C6C0B6" opacity={0.45} />
      ))}
      <RowOfBuildings x0={-40} x1={760} base={540} seed={7} minH={70} maxH={140}
        fill="#A8A294" windows winColor="#C9D3D8" opacity={0.6} />
      <RowOfBuildings x0={1180} x1={1960} base={540} seed={11} minH={60} maxH={150}
        fill="#A8A294" windows winColor="#C9D3D8" opacity={0.6} />
      {[200, 330, 1700].map((cx, i) => (
        <rect key={i} x={cx - 12} y={400} width={24} height={142} fill="#8E887C" stroke={KRP.ink} strokeWidth={3.5} opacity={0.75} />
      ))}

      {/* ───── 中景: 石材置き場。切石の山・木のデリック・荷馬車 ───── */}
      <rect x={-20} y={540} width={W + 40} height={H} fill="#BCAE92" />
      <line x1={-20} y1={540} x2={W + 20} y2={540} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-20} y={700} width={W + 40} height={H - 680} fill="#AC9D80" />
      <line x1={-20} y1={700} x2={W + 20} y2={700} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      {/* 木のデリック (石を吊る) */}
      <g>
        <rect x={1390} y={330} width={22} height={372} fill={C.wood} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={1401} y1={336} x2={1660} y2={430} stroke={C.wood} strokeWidth={18} />
        <line x1={1401} y1={336} x2={1660} y2={430} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1401} y1={336} x2={1222} y2={700} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1620} y1={424} x2={1620} y2={556 + Math.sin(f / 36) * 22} stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={1576} y={556 + Math.sin(f / 36) * 22} width={88} height={54} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 置かれた切石の山 (左右) */}
      <Stones x={60} y={600} w={380} h={108} bw={126} bh={54} fill="#C4BBA8" />
      <Stones x={120} y={546} w={252} h={54} bw={126} bh={54} fill="#CCC3B0" />
      <Stones x={1536} y={620} w={360} h={88} bw={120} bh={44} fill="#C4BBA8" />
      <Carriage x={1300} y={742} s={0.5} f={f * 0.2} flip />

      {/* ───── 主役: 試しに積んだ石の塔 (6段)。いちばん下が負ける ───── */}
      <g transform={`translate(0 ${sink})`}>
        {tiers.map((i) => {
          const wBase = 300;
          const yTop = base - (i + 1) * 62;
          const shrink = i * 14;
          const w = wBase - shrink * 2;
          const grow = i === 0 ? bulge * 26 : 0;     // 最下段だけ横にはらむ
          return (
            <g key={i}>
              <path d={`M ${960 - w / 2 - grow} ${yTop + 62} L ${960 - w / 2} ${yTop} L ${960 + w / 2} ${yTop} L ${960 + w / 2 + grow} ${yTop + 62} Z`}
                fill={i === 0 ? "#C3B49C" : C.stone} stroke={KRP.ink} strokeWidth={5.5} />
              <line x1={960 - w / 6} y1={yTop + 6} x2={960 - w / 6} y2={yTop + 56} stroke={C.stoneDark} strokeWidth={3} opacity={0.7} />
              <line x1={960 + w / 6} y1={yTop + 6} x2={960 + w / 6} y2={yTop + 56} stroke={C.stoneDark} strokeWidth={3} opacity={0.7} />
              {/* 窓のスリット (建物だと分かるように) */}
              {i > 0 && (
                <rect x={952} y={yTop + 16} width={16} height={32} rx={3} fill="#4A5566" stroke={KRP.ink} strokeWidth={3} />
              )}
            </g>
          );
        })}
        {/* 最下段のひび */}
        <Crack d="M 836 806 l 22 -28 l -14 -22 l 26 -12" t={crackT} color={KRP.red} sw={6} />
        <Crack d="M 1086 806 l -24 -26 l 16 -24 l -22 -12" t={crackT} color={KRP.red} sw={6} />
        <Crack d="M 960 806 l 0 -34 l -18 -24" t={clamp01(crackT * 1.2 - 0.3)} color={KRP.red} sw={5} />
      </g>
      {/* 自分の重さ */}
      <LoadArrow x={960} y1={326} y2={448} w={26} t={load} color={KRP.red} />
      <TagPlate x={960} y={272} text="重さ" size={38} t={seg(f, 12, 30)} color={KRP.red} />
      {/* 砕けて落ちる石の粉 */}
      <g>
        {Array.from({ length: 14 }, (_, i) => {
          const p = ((((i / 14) + (f * 0.9) / 90) % 1) + 1) % 1;
          const side = i % 2 === 0 ? -1 : 1;
          return (
            <circle key={i} cx={960 + side * (142 + rnd(i) * 26)} cy={766 + p * 60}
              r={3 + rnd(i * 2.3) * 4} fill="#8D7F68" opacity={(1 - p) * bulge} />
          );
        })}
      </g>

      {/* ───── 近景の地面: 石くず・わだち・道具まわり ───── */}
      {/* わだち */}
      <g stroke="#9A8B6E" strokeWidth={8} opacity={0.5}>
        <line x1={-20} y1={930} x2={W + 20} y2={918} />
        <line x1={-20} y1={1006} x2={W + 20} y2={994} />
      </g>
      {/* 石くず */}
      <g>
        {Array.from({ length: 46 }, (_, i) => {
          const cx = rnd(i * 3.7) * W;
          const cy = 836 + rnd(i * 5.9) * 240;
          const s = 6 + rnd(i * 2.7) * 16;
          return (
            <polygon key={i}
              points={`${cx},${cy - s} ${cx + s},${cy} ${cx + s * 0.3},${cy + s * 0.7} ${cx - s * 0.8},${cy + s * 0.3}`}
              fill="#C9C0AC" stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
          );
        })}
      </g>
      {/* 粉の山 2つ */}
      {[[260, 1058], [1180, 1040]].map(([px, py], i) => (
        <g key={i}>
          <path d={`M ${px! - 96} ${py!} q ${96} ${-66} ${192} 0 Z`} fill="#C6BBA2"
            stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${px! - 50} ${py! - 20} q 50 -24 92 2`} fill="none" stroke="#A89C84" strokeWidth={4} />
        </g>
      ))}
      {/* ロープの輪 */}
      <g transform="translate(880 1046)">
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={0} cy={-i * 11} rx={70 - i * 9} ry={22 - i * 3} fill="none"
            stroke="#A58F62" strokeWidth={11} />
        ))}
        <ellipse cx={0} cy={-22} rx={52} ry={15} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 水桶 */}
      <g transform="translate(1570 1040)">
        <path d="M -56 -74 L 56 -74 L 42 0 L -42 0 Z" fill="#9A7C50" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-58} y={-78} width={116} height={14} rx={5} fill="#7E6440" stroke={KRP.ink} strokeWidth={4} />
        <path d="M -50 -84 q 50 -56 100 0" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-70} rx={48} ry={10} fill="#A8BCC4" />
      </g>
      {/* 木のそり (荷台) と端材 */}
      <g transform="translate(1800 950)">
        <rect x={-130} y={-20} width={260} height={22} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-116} y={2} width={22} height={34} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={94} y={2} width={22} height={34} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-96} y={-88} width={110} height={68} fill="#C4BBA8" stroke={KRP.ink} strokeWidth={5} />
        <rect x={16} y={-66} width={92} height={46} fill="#CCC3B0" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-62} y={-134} width={78} height={46} fill="#BDB49F" stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ───── 近景: 石工の道具と、それを見ている石工 ───── */}
      <g transform="translate(360 926) rotate(-8)">
        <rect x={-12} y={-150} width={24} height={150} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-54} y={-186} width={108} height={44} rx={8} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g transform="translate(470 930) rotate(14)">
        <rect x={-10} y={-120} width={20} height={120} rx={5} fill={C.steel} stroke={KRP.ink} strokeWidth={4.5} />
        <polygon points="-10,-120 10,-120 0,-146" fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <Person x={1420} y={960} s={0.98} cloth="#5E6A58" clothDark="#46503F" face="worried"
        gaze={[-7, -2]} f={f} phase={2} />
      <FlatCap x={1420} y={960} s={0.98} f={f} phase={2} color="#6E6450" />
      <Person x={620} y={1000} s={1.04} cloth="#7B6A52" clothDark="#5F513C" face="surprised"
        gaze={[6, -3]} f={f} phase={5} />
      <FlatCap x={620} y={1000} s={1.04} f={f} phase={5} color="#8A7A5E" />
    </Frame>
  );
};

// ===================================================================
// 文#30 昔の建物は、壁で自分を支えていました。
//   型: 図。方眼の紙地に、石造の建物の断面を1つだけ、画面いっぱいに。
//   演出: 両サイドの町家・空・丘・鐘楼・石畳・井戸・樽・犬は落とす。
//         残すのは「厚い壁 (茶)」「壁に架かる床 (木)」「壁を下る重さ (赤)」だけ。
//         壁の窓は開口の断面で見せ、壁がどれだけ厚いかを穴の深さで分からせる。
//   動き: 床が上から1枚ずつ壁へ架かっていく → 重さが壁の中を下り続ける (ループ)
//         → 最後に、壁の真下の地面に赤いハッチ (全部ここに来る) が入る。
// ===================================================================
const Kb1KabeDeSasaeru: React.FC<{ f: number }> = ({ f }) => {
  const X0 = 430, X1 = 1490, TH = 190;          // 建物の外側 / 壁の厚み
  const TOP = 268, GY = 800;                    // 軒の高さ / 地面
  const inL = X0 + TH, inR = X1 - TH;           // 室内の左右
  const FLOORS = [410, 560, 710];               // 床の上面 (上から順に架かる)
  const flow = (f % 54) / 54;                   // 重さの流れ (ループ)
  const grd = easeOut(seg(f, 30, 42));          // 地面が受け止める印
  return (
    <Frame f={f} seed={502} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={200} x2={60 + i * 90} y2={846} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={200 + i * 92} x2={1860} y2={200 + i * 92} />
        ))}
      </g>

      {/* 室内 (断面の奥) */}
      <rect x={inL} y={TOP} width={inR - inL} height={GY - TOP} fill="#E0D5BE" />
      <rect x={inL} y={TOP} width={inR - inL} height={GY - TOP} fill="#8C7F66" opacity={0.12} />

      {/* 切妻の屋根 = 重さの出どころ */}
      <polygon points={`${X0 - 40},${TOP} ${X1 + 40},${TOP} 960,206`}
        fill="#9C6B4C" stroke={KRP.ink} strokeWidth={7} />
      <g stroke="#7E4C34" strokeWidth={4} opacity={0.75}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={448 + i * 196} y1={TOP} x2={856 + i * 40} y2={216} />
        ))}
      </g>

      {/* 厚い壁 (茶 = 煉瓦・石の壁。左右2枚だけで建物を支えている) */}
      {[0, 1].map((i) => {
        const wx = i === 0 ? X0 : X1 - TH;        // 壁の左端
        const o = i === 0 ? X0 : X1;              // 外側の面
        const n = i === 0 ? inL : inR;            // 室内側の面
        return (
          <g key={`w${i}`}>
            <Bricks x={wx} y={TOP} w={TH} h={GY - TOP} bw={62} bh={30}
              fill="#9A6448" line="#7E4C34" lw={2.5} />
            {/* 重さが壁の中を下りていく (ループ。窓の穴の裏を通る) */}
            {[0, 1, 2, 3].map((k) => {
              const p = (flow + k / 4) % 1;
              const yy = TOP + 36 + p * (GY - TOP - 72);
              const cx = wx + TH / 2;
              return (
                <polygon key={`q${k}`}
                  points={`${cx},${yy + 30} ${cx - 26},${yy - 6} ${cx + 26},${yy - 6}`}
                  fill={KRP.red} opacity={0.28 + 0.6 * Math.sin(p * Math.PI)} />
              );
            })}
            {/* 窓の開口 (外から内へ広がる = 壁の厚みが穴の深さで分かる) */}
            <rect x={wx} y={430} width={TH} height={26} fill={C.stone}
              stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${o},474 L ${n},456 L ${n},538 L ${o},520 Z`}
              fill={C.paper} stroke={KRP.ink} strokeWidth={5} />
            <rect x={wx} y={538} width={TH} height={16} fill={C.stoneDark}
              stroke={KRP.ink} strokeWidth={4} />
            <rect x={wx} y={TOP} width={TH} height={GY - TOP} fill="none"
              stroke={KRP.ink} strokeWidth={7} />
            {/* 壁の真下 = 重さの行き先 */}
            <g stroke={KRP.red} strokeWidth={5} opacity={0.8 * grd}>
              {[0, 1, 2, 3].map((k) => (
                <line key={`g${k}`} x1={wx + 8 + k * 46} y1={GY + 8}
                  x2={wx - 18 + k * 46} y2={GY + 40 * grd} />
              ))}
            </g>
          </g>
        );
      })}

      {/* 床は壁に架かっているだけ (端が壁の中へ食い込む) */}
      {FLOORS.map((fy, i) => {
        const t = easeOut(seg(f, 4 + i * 8, 22 + i * 8));
        if (t <= 0.02) return null;
        const a = inL - 64, b = inR + 64;
        return (
          <g key={`fl${i}`}>
            <rect x={a} y={fy + 24} width={64} height={22} fill={C.stone}
              stroke={KRP.ink} strokeWidth={4} opacity={t} />
            <rect x={inR} y={fy + 24} width={64} height={22} fill={C.stone}
              stroke={KRP.ink} strokeWidth={4} opacity={t} />
            <rect x={a} y={fy} width={(b - a) * t} height={24} fill={C.wood}
              stroke={KRP.ink} strokeWidth={5} />
            <g stroke={C.woodDark} strokeWidth={4} opacity={0.65}>
              {Array.from({ length: 11 }, (_, k) => {
                const jx = inL + 20 + k * 62;
                if (jx > a + (b - a) * t) return null;
                return <line key={k} x1={jx} y1={fy + 24} x2={jx} y2={fy + 44} />;
              })}
            </g>
            {/* 床の重さは壁へ渡される */}
            <Arrow x={inL - 6} y={fy - 16} s={0.3} rot={180} t={t} />
            <Arrow x={inR + 6} y={fy - 16} s={0.3} rot={0} t={t} />
          </g>
        );
      })}

      {/* 地面 */}
      <line x1={120} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={160 + i * 145} y1={GY} x2={130 + i * 145} y2={GY + 34} />
        ))}
      </g>

      {/* 札 */}
      <TagPlate x={960} y={334} text="壁が自分と中身を支える" size={30}
        t={seg(f, 2, 14)} color={KRP.white} fill="#6B5134" />
      <TagPlate x={960} y={762} text="重さは壁の中を下りる" size={28}
        t={seg(f, 20, 32)} color={KRP.ink} fill={KRP.white} />
      <DimH x1={X0} x2={inL} y={756} text="厚い壁" size={26} t={seg(f, 28, 40)}
        color="#7E4C34" labelDy={-74} tick={14} />
    </Frame>
  );
};

// ===================================================================
// 文#31 高くするには、下の壁を厚くするしかありません。
//   型: 図。板塀のチョーク画をそのまま「図面」に昇格させ、3段階の断面だけを残す。
//   演出: 右半分の工事現場 (煉瓦の建物・足場・滑車・職人) と、空・隣町・
//         煉瓦の山・一輪車・板塀そのものは落とす。残すのは3つの断面だけ。
//         同じ外幅・同じ階高で 3階 / 8階 / 16階 を並べ、違いは壁の太さだけにする。
//         茶 = 煉瓦の壁 / 赤い破線 = 上と同じ薄さならここまで / 赤 = 壁に食われた分。
//   動き: 3階 → 8階 → 16階 と下から積まれ、高いものほど下の壁が太る
//         → 16階だけ破線との差に赤が入り、壁の中を重さが下り続ける (ループ)。
// ===================================================================
const Kb1ShitaWoAtsuku: React.FC<{ f: number }> = ({ f }) => {
  const GY = 820, HALF = 250, TOPW = 22, PITCH = 32;   // 地面 / 外幅の半分 / 上の壁 / 階高
  const flow = (f % 54) / 54;                          // 重さの流れ (ループ)
  const paint = easeOut(seg(f, 30, 42));               // 壁に食われた分 (赤)
  const STACKS = [
    { cx: 400, n: 3, base: 30, rise: seg(f, 4, 18), tag: "3階", last: false },
    { cx: 960, n: 8, base: 80, rise: seg(f, 14, 28), tag: "8階", last: false },
    { cx: 1520, n: 16, base: 176, rise: seg(f, 24, 40), tag: "16階", last: true },
  ];
  return (
    <Frame f={f} seed={503} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={200} x2={60 + i * 90} y2={GY} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={200 + i * 88} x2={1860} y2={200 + i * 88} />
        ))}
      </g>

      {STACKS.map(({ cx, n, base, rise, tag, last }, k) => {
        const r = easeOut(rise);
        const h = n * PITCH, yTop = GY - h;                 // 出来上がりの高さ
        const th = (y: number) => TOPW + (base - TOPW) * clamp01((y - yTop) / h);
        const nv = Math.min(n, Math.floor(r * (n + 1.2)));  // 積み終わった階数
        return (
          <g key={k}>
            {/* 1階ずつ積む (外幅は同じ。下へ行くほど壁が太る) */}
            {Array.from({ length: n }, (_, i) => {
              const t = clamp01(r * (n + 1.2) - i);
              if (t <= 0.04) return null;
              const yy = GY - (i + 1) * PITCH;
              const w = th(yy + PITCH / 2);
              return (
                <g key={i} opacity={Math.min(1, t * 2)}>
                  <rect x={cx - HALF} y={yy} width={HALF * 2} height={PITCH}
                    fill="#E0D5BE" stroke={KRP.ink} strokeWidth={3} />
                  {[cx - HALF, cx + HALF - w].map((wx, s) => (
                    <g key={s}>
                      <Bricks x={wx} y={yy} w={w} h={PITCH} bw={44} bh={16}
                        fill="#9A6448" line="#7E4C34" lw={2} />
                      <rect x={wx} y={yy} width={w} height={PITCH} fill="none"
                        stroke={KRP.ink} strokeWidth={3} />
                    </g>
                  ))}
                  {/* 床 (木) */}
                  <rect x={cx - HALF + w} y={yy + PITCH - 8} width={(HALF - w) * 2} height={8}
                    fill={C.wood} stroke={C.woodDark} strokeWidth={2} />
                </g>
              );
            })}

            {/* 積んだぶんの外形線 */}
            {nv > 0 && (
              <rect x={cx - HALF} y={GY - nv * PITCH} width={HALF * 2} height={nv * PITCH}
                fill="none" stroke={KRP.ink} strokeWidth={6} />
            )}

            {/* 屋上の軒 */}
            <g opacity={clamp01(r * 1.1 - 0.85) * 4}>
              <rect x={cx - HALF - 16} y={yTop - 20} width={HALF * 2 + 32} height={20}
                fill="#9C6B4C" stroke={KRP.ink} strokeWidth={5} />
            </g>

            {/* 上と同じ薄さならここまでだったはず、の赤い破線 (壁の上に重ねて引く) */}
            {last && [cx - (HALF - TOPW), cx + (HALF - TOPW)].map((dx, i) => (
              <line key={`d${i}`} x1={dx} y1={yTop} x2={dx} y2={GY} stroke={KRP.red}
                strokeWidth={4.5} strokeDasharray="18 14" opacity={0.85 * clamp01(r * 2 - 0.7)} />
            ))}

            {/* 16階だけ: 破線と壁の内側の差 = 壁に食われた分 (赤) */}
            {last && Array.from({ length: Math.floor(h / 26) }, (_, m) => {
              const y = GY - 14 - m * 26;
              const w = th(y);
              if (w <= TOPW + 10) return null;
              const d = (w - TOPW) * paint;
              return (
                <g key={`p${m}`} stroke={KRP.red} strokeWidth={4} opacity={0.75}>
                  <line x1={cx - HALF + TOPW} y1={y} x2={cx - HALF + TOPW + d} y2={y - 16} />
                  <line x1={cx + HALF - TOPW} y1={y} x2={cx + HALF - TOPW - d} y2={y - 16} />
                </g>
              );
            })}

            {/* 16階だけ: 重さが壁の中を下り続ける (ループ) */}
            {last && [0, 1, 2, 3].map((m) => {
              const p = (flow + m / 4) % 1;
              const y = yTop + 30 + p * (h - 60);
              const w = th(y), s = Math.min(22, w * 0.42);
              const op = (0.25 + 0.6 * Math.sin(p * Math.PI)) * clamp01(r * 2 - 1);
              return (
                <g key={`q${m}`} fill={KRP.red} opacity={op}>
                  {[cx - HALF + w / 2, cx + HALF - w / 2].map((qx, s2) => (
                    <polygon key={s2}
                      points={`${qx},${y + s} ${qx - s},${y - s * 0.6} ${qx + s},${y - s * 0.6}`} />
                  ))}
                </g>
              );
            })}

            <TagPlate x={cx} y={yTop - 52} text={tag} size={32}
              t={seg(f, 2 + k * 10, 14 + k * 10)} color={KRP.white} fill="#6B5134" />
          </g>
        );
      })}

      {/* 地面 */}
      <line x1={100} y1={GY} x2={1820} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={140 + i * 134} y1={GY} x2={110 + i * 134} y2={GY + 34} />
        ))}
      </g>

      {/* 下の壁の厚みくらべ (3階 ↔ 16階) と、言いたいこと */}
      <DimH x1={400 - HALF} x2={400 - HALF + 30} y={776} text="薄い壁" size={26}
        t={seg(f, 16, 26)} color="#7E4C34" labelDy={-60} tick={14} />
      <DimH x1={1520 - HALF} x2={1520 - HALF + 176} y={776} text="厚い壁" size={26}
        t={seg(f, 32, 42)} color="#7E4C34" labelDy={-60} tick={14} />
      <Arrow x={1790} y={760} s={0.5} rot={180} t={seg(f, 32, 42)} />
      <TagPlate x={700} y={250} text="下の壁を厚くするしかない" size={28}
        t={seg(f, 30, 42)} color={KRP.ink} fill={KRP.white} />
    </Frame>
  );
};

// ===================================================================
// 文#32 シカゴに、煉瓦で16階まで積んだビルがあります。
//   型: 図 (立面図)。主役は「煉瓦で16階まで積んだビル」1棟だけ。
//       空・街並み・煙突・馬車・電柱・通行人・ガス灯・新聞売りは落とした。
//   演出: 画面のセンター (x=960) に、上下いっぱい (y=212〜840) で立てる。
//         左右の余白は「向かいの歩道から見上げている」ぶんの寄り。
//         右に階の目盛り、左に数えあがる階数だけを置く。
//   動き: 1階の石の基部から順に、煉瓦が1階ぶんずつ上から落ちて積まれていく。
//         左の数字が 1 → 16 と数えあがり、積み終わると軒が載って札が出る。
// ===================================================================
const Kb1Chicago16kai: React.FC<{ f: number }> = ({ f }) => {
  const GY = 840, BTOP = 246, BX = 722, BW = 476;   // 地面 / 胴体の上端 / ビルの左端 / 幅
  const G = 64;                                      // 1階 (石の基部) の高さ
  const base = GY - G;                               // 2階の床 = 煉瓦の積み始め
  const FH = (base - BTOP) / 15;                     // 2〜16階の1階ぶんの高さ
  const r = easeOut(seg(f, 4, 30));                  // 積み上がり
  const count = Math.min(16, Math.max(1, Math.floor(r * 16.999)));
  const cap = seg(f, 30, 38);                        // 軒が載る
  const SX = BX + BW + 54;                           // 階の目盛りの位置
  return (
    <Frame f={f} seed={504} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={200} x2={60 + i * 90} y2={GY} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={200 + i * 86} x2={1860} y2={200 + i * 86} />
        ))}
      </g>

      {/* ───── 主役: 煉瓦で16階 (下から1階ぶんずつ積まれる) ───── */}
      {Array.from({ length: 16 }, (_, i) => {
        const t = clamp01(r * 17.4 - i);
        if (t <= 0.04) return null;
        const top = i === 0 ? base : base - i * FH;
        const hh = i === 0 ? G : FH;
        const drop = (1 - Math.min(1, t)) * 30;       // 上から落ちてきて納まる
        return (
          <g key={i} opacity={Math.min(1, t * 2.5)} transform={`translate(0 ${-drop})`}>
            {i === 0 ? (
              <g>
                {/* 1階 = 切石の基部 + アーチの入口 */}
                <Stones x={BX} y={top} w={BW} h={hh} bw={96} bh={hh} fill={C.stone} />
                <rect x={BX} y={top} width={BW} height={hh} fill="none"
                  stroke={KRP.ink} strokeWidth={6} />
                <path d={`M 906 ${GY} L 906 834 A 54 54 0 0 1 1014 834 L 1014 ${GY} Z`}
                  fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
                <path d="M 944 782 L 976 782 L 970 812 L 950 812 Z"
                  fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
                {[BX + 48, BX + BW - 148].map((wx, k) => (
                  <rect key={k} x={wx} y={GY - 46} width={100} height={36}
                    fill={C.ink2} stroke={KRP.ink} strokeWidth={4} />
                ))}
              </g>
            ) : (
              <g>
                {/* 煉瓦の胴体 1階ぶん (茶 = 煉瓦の壁) */}
                <Bricks x={BX} y={top} w={BW} h={hh} bw={44} bh={hh / 2.2}
                  fill="#9A6448" line="#7E4C34" lw={2.5} />
                <rect x={BX} y={top} width={BW} height={hh} fill="none"
                  stroke={KRP.ink} strokeWidth={5} />
                {/* 出窓が3本、縦に連なる */}
                {[0, 1, 2].map((c) => {
                  const wx = BX + 46 + c * 144;
                  return (
                    <g key={c}>
                      <rect x={wx} y={top + 5} width={96} height={hh - 13}
                        fill={C.ink2} stroke={KRP.ink} strokeWidth={4} />
                      <line x1={wx + 48} y1={top + 5} x2={wx + 48} y2={top + hh - 8}
                        stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
                      <rect x={wx - 6} y={top + hh - 8} width={108} height={7}
                        fill={C.stone} stroke={KRP.ink} strokeWidth={2.5} />
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        );
      })}

      {/* 出窓の縦の通り (16階ぶんが1本に見える) */}
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.3 * clamp01(r * 1.4)}>
        {[36, 152, 180, 296, 324, 440].map((dx, i) => (
          <line key={i} x1={BX + dx} y1={BTOP} x2={BX + dx} y2={base} />
        ))}
      </g>

      {/* 最上部の軒 (積み終わると載る) */}
      <g opacity={clamp01(cap * 2.2)} transform={`translate(0 ${(1 - easeOut(cap)) * -20})`}>
        <rect x={BX - 24} y={BTOP - 34} width={BW + 48} height={36} rx={6}
          fill="#9C6B4C" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={BX - 24 + i * 45.6} y={BTOP + 2} width={22} height={14}
            fill="#7E4C34" stroke={KRP.ink} strokeWidth={3} />
        ))}
      </g>

      {/* 階の目盛り (1 → 16 と灯っていく) */}
      <g>
        <line x1={SX} y1={GY} x2={SX} y2={BTOP} stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
        {Array.from({ length: 16 }, (_, i) => {
          const yy = i === 0 ? GY - G / 2 : base - (i - 0.5) * FH;
          const on = i < count;
          return (
            <g key={i} opacity={on ? 1 : 0.18}>
              <line x1={SX - 18} y1={yy} x2={SX + 18} y2={yy} stroke={KRP.ink} strokeWidth={5} />
              {(i + 1) % 4 === 0 && (
                <text x={SX + 30} y={yy + 10} fontFamily={FONT} fontWeight={900}
                  fontSize={30} fill={KRP.ink}>{i + 1}</text>
              )}
            </g>
          );
        })}
        <TagPlate x={1452} y={290} text="16階" size={44} t={seg(f, 30, 40)}
          color={KRP.white} fill="#6B5134" />
      </g>

      {/* 数えあがる階数 */}
      <g opacity={clamp01(seg(f, 4, 10))}>
        <text x={470} y={480} textAnchor="end" fontFamily={FONT} fontWeight={900}
          fontSize={170} fill={KRP.ink}>{count}</text>
        <text x={484} y={480} fontFamily={FONT} fontWeight={900}
          fontSize={60} fill={KRP.grayDark}>階</text>
      </g>
      <TagPlate x={400} y={286} text="シカゴ" size={38} t={seg(f, 2, 12)}
        color={KRP.white} fill="#6B5134" />
      <TagPlate x={430} y={574} text="煉瓦だけで積んだ" size={30} t={seg(f, 24, 34)}
        color={KRP.ink} fill={KRP.white} />

      {/* 地面 */}
      <line x1={120} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={168 + i * 145} y1={GY} x2={140 + i * 145} y2={GY + 28} />
        ))}
      </g>
    </Frame>
  );
};

// ===================================================================
// 文#33 1891年完成。基部の壁は、1.8メートルほど。
//   型: 図 (断面)。#32 と同じモナドノック・ビルの、足もとだけに寄る。
//       主役は「壁の厚み」ひとつ。向かいの街並み・馬車・入口のアーチと扉・
//       測量員・犬・歩道の遠近線は落とした。人は比較用に1人だけ残す。
//   演出: 1メートル=181px の尺で描く。壁の厚み 1.8m (326px) を画面のセンターに立て、
//         上は破断線で画面の外へ続かせる。隣に立つ人の背 1.7m とほぼ同じ幅になる。
//         1891 は定礎石に彫って持たせる (札で言わない)。
//   動き: 切り口が上から下へ降りていき、通ったところだけ煉瓦の小口とハッチングが出る。
//         切り終わると寸法線が左から右へ開いて「1.8メートル」。人が見上げて驚く。
// ===================================================================
const Kb1KibuWall18m: React.FC<{ f: number }> = ({ f }) => {
  const GY = 820, PX = 181;                     // 地面 / 1メートルのpx (人の背1.7m=308pxに合わせた)
  const WX0 = 960 - (1.8 * PX) / 2;             // 壁の厚み 1.8m ぶん
  const WX1 = 960 + (1.8 * PX) / 2;
  const TOP = 206, FOOT = 60;                   // 破断線の位置 / 石の基礎
  const WB = GY - FOOT;                         // 煉瓦の下端
  const ROWS = 17, RH = 31, BY = 228;           // 小口の段数・段の高さ・はじまり
  const BWID = (WX1 - WX0 - 20) / 5;            // 小口1個の幅
  const cut = easeOut(seg(f, 2, 20));           // 切り口が降りる
  const cy = BY + cut * (WB - BY);              // いま切っている深さ
  const dim = seg(f, 20, 36);
  const zig = (y: number, dy: number) =>
    Array.from({ length: 13 }, (_, i) => {
      const x = WX0 + (i * (WX1 - WX0)) / 12;
      return `${i === 0 ? "M" : "L"} ${x} ${y + (i % 2 ? dy : 0)}`;
    }).join(" ");
  return (
    <Frame f={f} seed={505} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.55}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={200} x2={60 + i * 90} y2={GY} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={200 + i * 86} x2={1860} y2={200 + i * 86} />
        ))}
      </g>

      {/* ───── 主役: 基部の壁 (茶 = 煉瓦の壁)。上は破断線で画面の外へ続く ───── */}
      <polygon
        points={`${Array.from({ length: 13 }, (_, i) => {
          const x = WX0 + (i * (WX1 - WX0)) / 12;
          return `${x},${TOP + (i % 2 ? 16 : 0)}`;
        }).join(" ")} ${WX1},${WB} ${WX0},${WB}`}
        fill="#9A6448" stroke={KRP.ink} strokeWidth={7} />

      {/* 切った煉瓦の小口 (切り口が通った段だけ出る) */}
      {Array.from({ length: ROWS }, (_, r) => {
        const t = clamp01(cut * (ROWS + 2) - r);
        if (t <= 0.05) return null;
        const yy = BY + r * RH;
        const odd = r % 2 === 1;
        const xs: [number, number][] = odd
          ? [
            [WX0 + 10, BWID / 2],
            ...Array.from({ length: 4 }, (_, c) =>
              [WX0 + 10 + BWID / 2 + c * BWID, BWID] as [number, number]),
            [WX1 - 10 - BWID / 2, BWID / 2],
          ]
          : Array.from({ length: 5 }, (_, c) =>
            [WX0 + 10 + c * BWID, BWID] as [number, number]);
        return (
          <g key={r} opacity={Math.min(1, t * 2.5)}>
            {xs.map(([bx, bw], c) => (
              <rect key={c} x={bx + 3} y={yy} width={bw - 6} height={24} rx={2}
                fill={odd ? "#A06A4C" : "#AE7152"} stroke="#7E4C34" strokeWidth={2.5} />
            ))}
          </g>
        );
      })}

      {/* 断面のハッチング */}
      <g stroke="#6E4330" strokeWidth={3} opacity={0.32}>
        {Array.from({ length: 12 }, (_, i) => {
          const y0 = 252 + i * 44;
          if (y0 > cy) return null;
          return <line key={i} x1={WX0} y1={y0 + 30} x2={WX1} y2={y0} />;
        })}
      </g>

      {/* 破断線 (上へ続く) と、いま降りている切り口 */}
      <path d={zig(TOP, 16)} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      {cut < 1 && (
        <g>
          <path d={zig(cy, 12)} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <Smoke x={960} y={cy} f={f} n={4} r={15} rise={130} speed={0.6} drift={70}
            color={C.smoke} opacity={0.4 * (1 - cut)} />
        </g>
      )}

      {/* 定礎石 (1891年完成) */}
      <g transform="translate(960 676)">
        <rect x={-115} y={-48} width={230} height={96} rx={5}
          fill="#C3B9A2" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-103} y={-36} width={206} height={72} rx={3}
          fill="none" stroke="#8E8571" strokeWidth={3.5} />
        <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={52} fill="#5F5343">1891</text>
      </g>

      {/* 石の基礎 */}
      <Stones x={WX0 - 20} y={WB} w={WX1 - WX0 + 40} h={FOOT} bw={112} bh={FOOT} fill={C.stone} />
      <rect x={WX0 - 20} y={WB} width={WX1 - WX0 + 40} height={FOOT} fill="none"
        stroke={KRP.ink} strokeWidth={6} />

      {/* 厚みの寸法 1.8メートル */}
      <DimH x1={WX0} x2={WX1} y={500} text="1.8メートル" t={dim} size={38} labelDy={-58} />

      {/* 比べるための人 1人 (背 1.7m)。壁の厚みを見上げる */}
      <Person x={1360} y={GY} s={1.0} cloth="#4D5E7C" clothDark="#3A4861" face="surprised"
        gaze={[-7, -2]} f={f} phase={2} />
      <Bowler x={1360} y={GY} s={1.0} f={f} phase={2} />
      <DimV x={1540} y1={512} y2={GY} text="人の背 1.7m" t={seg(f, 26, 40)} size={26}
        color={KRP.ink} labelDx={120} />

      {/* 札 (左の余白に縦積み) + 壁を指す矢印 */}
      <TagPlate x={400} y={286} text="基部の壁" size={42} t={seg(f, 2, 12)}
        color={KRP.white} fill="#6B5134" />
      <Arrow x={788} y={306} s={0.72} t={seg(f, 10, 18)} color={KRP.ink} />

      {/* 地面 */}
      <line x1={120} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={168 + i * 145} y1={GY} x2={140 + i * 145} y2={GY + 28} />
        ))}
      </g>
    </Frame>
  );
};

// ===================================================================
// 文#33 いちばん上では、46センチまで細くなります。
//   型: 図。#32 と同じ縮尺・同じ描き方 (茶の切り口 + 煉瓦の小口 + 赤い寸法) のまま、
//       切る場所だけを「基部」から「いちばん上」へ移した1枚。背景は置かない。
//   演出: 壁の外側の面は上から下まで1本の直線でそろえ、途中は破断線で省略する。
//         煉瓦の小口の数がそのまま厚み = 下は8枚 (1.8m) / 上は2枚 (46cm)。
//   動き: 基部が外から内へ1列ずつ積まれる → 破断線が入る → ずっと上の2枚が出る
//         → 46cm の寸法が引かれる → 上の内側の面から赤い破線が基部まで落ちる。
// ===================================================================
const Kb1Saijou46cm: React.FC<{ f: number }> = ({ f }) => {
  const OX = 700, BW = 66, BH = 30;                 // 外側の面 / 煉瓦の小口 (上下で同寸)
  const z = lerp(1, 1.018, easeOut(seg(f, 0, 42))); // ゆっくり寄る
  const brk = seg(f, 14, 22);                       // 破断線 (途中は省略)
  const drop = easeOut(seg(f, 30, 42));             // 上の厚みを下へ落とす赤い破線
  const SLABS = [
    { cols: 8, rows: 7, y0: 644, t: seg(f, 1, 14), cap: false },   // 基部 = 煉瓦8枚 = 1.8m
    { cols: 2, rows: 6, y0: 330, t: seg(f, 18, 30), cap: true },   // いちばん上 = 2枚 = 46cm
  ];
  return (
    <Frame f={f} seed={506} bg={C.paper}>
      <defs>
        {SLABS.map(({ cols, rows, y0 }, k) => (
          <clipPath key={k} id={`kb1c33${k}`}>
            <rect x={OX} y={y0} width={cols * BW} height={rows * BH} />
          </clipPath>
        ))}
      </defs>
      <g transform={zoomAt(z, 960, 560)}>
        {/* 図面の方眼 */}
        <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
          {Array.from({ length: 21 }, (_, i) => (
            <line key={`gv${i}`} x1={60 + i * 90} y1={212} x2={60 + i * 90} y2={860} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`gh${i}`} x1={60} y1={212 + i * 86} x2={1860} y2={212 + i * 86} />
          ))}
        </g>
        {/* 壁の外側の面 = いちばん上から基部まで、1本の直線 */}
        <line x1={OX} y1={310} x2={OX} y2={854} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />

        {/* ───── 主役: 同じ壁を2か所で切った切り口 ───── */}
        {SLABS.map(({ cols, rows, y0, t, cap }, k) => {
          const w = cols * BW, h = rows * BH, tt = easeOut(t);
          return (
            <g key={k}>
              <rect x={OX} y={y0} width={w} height={h} fill="#9A6448" opacity={clamp01(t * 5)} />
              {/* 煉瓦の小口 (外側から内側へ1列ずつ積まれる) */}
              {Array.from({ length: cols }, (_, c) => {
                const ct = clamp01(tt * (cols + 0.8) - c);
                if (ct <= 0.02) return null;
                return (
                  <g key={c} opacity={Math.min(1, ct * 2)}>
                    {Array.from({ length: rows }, (_, r) => (
                      <rect key={r} x={OX + c * BW + 3} y={y0 + r * BH + 3} width={BW - 6} height={BH - 6}
                        rx={2} fill={(r + c) % 2 === 0 ? "#AE7152" : "#A06A4C"}
                        stroke="#7E4C34" strokeWidth={2.5} />
                    ))}
                  </g>
                );
              })}
              {/* 断面のハッチング */}
              <g clipPath={`url(#kb1c33${k})`} stroke="#6E4330" strokeWidth={3} opacity={0.3 * tt}>
                {Array.from({ length: 14 }, (_, i) => (
                  <line key={i} x1={OX - 40} y1={y0 + i * 46}
                    x2={OX + w + 40} y2={y0 + i * 46 - (w + 80) * 0.5} />
                ))}
              </g>
              {/* 切り口の枠 (外側の面・内側の面を太く) */}
              <rect x={OX} y={y0} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={7}
                opacity={clamp01(t * 5)} />
              {/* いちばん上だけ、笠木の石が乗る */}
              {cap && (
                <g opacity={clamp01((t - 0.55) / 0.3)}>
                  <rect x={OX - 12} y={y0 - 22} width={w + 24} height={22} rx={3}
                    fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
                  <line x1={OX + BW} y1={y0 - 22} x2={OX + BW} y2={y0} stroke={C.stoneDark} strokeWidth={3} />
                </g>
              )}
            </g>
          );
        })}

        {/* ───── 途中は省略 (破断線) ───── */}
        <g opacity={clamp01(brk * 1.4)}>
          <rect x={OX - 14} y={524} width={8 * BW + 28} height={60} fill={C.paper} />
          {[532, 576].map((yy, i) => (
            <path key={i} d={`M ${OX - 14} ${yy} ` + Array.from({ length: 14 }, (_, j) =>
              `L ${OX - 14 + (j + 1) * 40} ${yy + (j % 2 === 0 ? -13 : 13)}`).join(" ")}
              fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          ))}
        </g>

        {/* ───── 上の厚みを基部まで下ろす赤い破線 (本来ならここまでだったはず) ───── */}
        <g opacity={clamp01(drop * 3)}>
          <line x1={OX + 2 * BW} y1={510} x2={OX + 2 * BW} y2={lerp(510, 854, drop)}
            stroke={KRP.white} strokeWidth={11} opacity={0.55} />
          <line x1={OX + 2 * BW} y1={510} x2={OX + 2 * BW} y2={lerp(510, 854, drop)}
            stroke={KRP.red} strokeWidth={5} strokeDasharray="20 16" />
        </g>

        {/* ───── 地面 ───── */}
        <line x1={620} y1={854} x2={1330} y2={854} stroke={KRP.ink} strokeWidth={7}
          opacity={clamp01(seg(f, 1, 10))} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.3 * clamp01(seg(f, 4, 14))}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={660 + i * 80} y1={854} x2={638 + i * 80} y2={864} />
          ))}
        </g>

        {/* ───── 寸法と札 ───── */}
        <DimH x1={OX} x2={OX + 8 * BW} y={770} text="1.8m" size={40} t={seg(f, 8, 20)} labelDy={-58} />
        <DimH x1={OX} x2={OX + 2 * BW} y={300} text="46cm" size={34} t={seg(f, 24, 38)} labelDy={-54} />
        <Arrow x={850} y={368} s={0.6} rot={180} t={seg(f, 28, 38)} />
        <TagPlate x={1180} y={352} text="いちばん上" size={32} t={seg(f, 26, 36)}
          color={KRP.white} fill="#6B5134" />
        <TagPlate x={1180} y={420} text="煉瓦2枚" size={28} t={seg(f, 30, 40)} rot={-3} />
        <Arrow x={1244} y={700} s={0.6} rot={180} t={seg(f, 12, 22)} />
        <TagPlate x={1484} y={700} text="基部" size={32} t={seg(f, 10, 20)}
          color={KRP.white} fill="#6B5134" />
        <TagPlate x={1484} y={766} text="煉瓦8枚" size={28} t={seg(f, 14, 24)} rot={2} />
      </g>
    </Frame>
  );
};

// ===================================================================
// 文#34 下へ行くほど、壁が太っていく建物です。
//   型: 図。#33 の「上=46cm / 下=1.8m」をつないで、建物1棟の形そのものを見せる。
//       夜の設計事務所 (製図板・窓・ガス灯・設計者) は落として、断面だけを画面の
//       中央に大きく据える。#36 が「8階建てと16階建ての比べ」なので、ここは1棟。
//   演出: 外側の面は左右ともまっすぐ。内側の面だけが2階ごとに段で内へ張り出し、
//         壁が楔形に太る。窓の開口は壁の厚みぶんの深さなので、下へ行くほど深い。
//         赤い破線 = 壁が46センチのままならここが内側の面だったはず。
//   動き: 笠木が降りて乗る → 壁が上から下へ2階ぶんずつ積まれ、赤い破線を越えて
//         内へ張り出していく → 16階の高さ → 基部で 1.8m の寸法が出る。
// ===================================================================
const Kb1ShitaHodoFutoru: React.FC<{ f: number }> = ({ f }) => {
  const CX = 960, HALF = 400, ROOF = 252, GY = 846;   // 建物の外側 (まっすぐ) と屋上・地面
  const N = 16, SH = (GY - ROOF) / N;                 // 16階 / 1階の高さ
  const ST = 8, SBH = (GY - ROOF) / ST;               // 壁の厚みは2階ごとに1段変わる
  const wAt = (s: number) => lerp(44, 176, s / (ST - 1));   // 46cm → 1.8m
  const p = easeOut(seg(f, 4, 38));
  const dd = easeOut(seg(f, 12, 26));
  const pp = easeOut(seg(f, 0, 8));
  const z = lerp(1, 1.02, easeOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={507} bg={C.paper}>
      <g transform={zoomAt(z, 960, 600)}>
        {/* 図面の方眼 */}
        <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
          {Array.from({ length: 21 }, (_, i) => (
            <line key={`gv${i}`} x1={60 + i * 90} y1={212} x2={60 + i * 90} y2={846} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`gh${i}`} x1={60} y1={212 + i * 86} x2={1860} y2={212 + i * 86} />
          ))}
        </g>

        {/* ───── 主役: 建物1棟の断面。壁 (茶) が2階ごとに内へ太る ───── */}
        {Array.from({ length: ST }, (_, s) => {
          const vis = clamp01(p * (ST + 0.6) - s);
          if (vis <= 0.02) return null;
          const w = wAt(s), yy = ROOF + s * SBH;
          return (
            <g key={s} opacity={Math.min(1, vis * 2)}>
              {[CX - HALF, CX + HALF - w].map((x0, side) => (
                <g key={side}>
                  <Bricks x={x0} y={yy} w={w} h={SBH} bw={w > 100 ? 44 : 30} bh={24}
                    fill="#9A6448" line="#7E4C34" lw={2.5} />
                  <rect x={x0} y={yy} width={w} height={SBH} fill="none"
                    stroke={KRP.ink} strokeWidth={6} />
                  {/* 窓の開口。壁の厚みぶんの深さなので、下へ行くほど深くなる */}
                  <rect x={x0} y={yy + 25} width={w} height={24} fill={C.paper}
                    stroke={KRP.ink} strokeWidth={3.5} />
                </g>
              ))}
              {/* 2階ぶんの床 */}
              {[0, 1].map((j) => (
                <line key={j} x1={CX - HALF + w} y1={yy + (j + 1) * SH}
                  x2={CX + HALF - w} y2={yy + (j + 1) * SH}
                  stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
              ))}
            </g>
          );
        })}

        {/* 基部の石の布基礎 */}
        <g opacity={clamp01((p - 0.78) * 5)}>
          {[CX - HALF, CX + HALF - wAt(ST - 1)].map((x0, i) => (
            <rect key={i} x={x0} y={GY - 24} width={wAt(ST - 1)} height={24}
              fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
          ))}
        </g>

        {/* 屋上の笠木 (#33 のいちばん上と同じ石。上から降りてきて乗る) */}
        <g opacity={clamp01(pp * 2)}>
          <rect x={CX - HALF - 16} y={ROOF - 20 - (1 - pp) * 26} width={HALF * 2 + 32} height={20}
            rx={3} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        </g>

        {/* 壁が46センチのままなら、内側の面はここだった (赤い破線)。
            太った壁の上にかぶせて引く = 破線を越えて内へ張り出したことが見える */}
        {[CX - HALF + wAt(0), CX + HALF - wAt(0)].map((dx, i) => (
          <g key={`d${i}`} opacity={clamp01(dd * 3)}>
            <line x1={dx} y1={ROOF} x2={dx} y2={lerp(ROOF, GY, dd)}
              stroke={KRP.white} strokeWidth={11} opacity={0.55} />
            <line x1={dx} y1={ROOF} x2={dx} y2={lerp(ROOF, GY, dd)}
              stroke={KRP.red} strokeWidth={5} strokeDasharray="20 16" />
          </g>
        ))}

        {/* 地面 */}
        <line x1={200} y1={GY} x2={1720} y2={GY} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={i} x1={250 + i * 120} y1={GY} x2={226 + i * 120} y2={GY + 16} />
          ))}
        </g>

        {/* ───── 寸法と札 ───── */}
        <DimH x1={CX - HALF} x2={CX - HALF + wAt(0)} y={300} text="46cm" size={34}
          t={seg(f, 10, 22)} labelDy={-54} />
        <DimH x1={CX - HALF} x2={CX - HALF + wAt(ST - 1)} y={812} text="1.8m" size={38}
          t={seg(f, 30, 42)} labelDy={-56} />
        <DimV x={390} y1={ROOF} y2={GY} text="16階" size={34} t={seg(f, 22, 36)} color={KRP.ink} />
        <TagPlate x={268} y={290} text="外側はまっすぐ" size={26} t={seg(f, 16, 26)} rot={-2} />
        <Arrow x={540} y={330} s={0.56} t={seg(f, 18, 28)} color={KRP.ink} />
        <Arrow x={1400} y={400} s={0.56} rot={180} t={seg(f, 8, 18)} color={KRP.ink} />
        <TagPlate x={1620} y={400} text="煉瓦の壁" size={30} t={seg(f, 6, 16)}
          color={KRP.white} fill="#6B5134" />
        <Arrow x={1322} y={640} s={0.56} rot={180} t={seg(f, 28, 40)} />
        <TagPlate x={1630} y={640} text="46センチのままなら" size={26} t={seg(f, 26, 38)}
          color={KRP.red} rot={-3} />
      </g>
    </Frame>
  );
};

// ===================================================================
// 文#35 壁が太るぶん、貸せる床は減ります。
//   型: 図。同じ幅の建物を「上の階」「下の階」で上下に並べた、断面の見比べ。
//   演出: 違うのは壁の太さだけ。真ん中の緑が貸せる床で、そこに机が並ぶ。
//         上の階から下ろした点線が「上の階ならここまで床だった」位置。
//         下の階はその分を壁に食われて赤く、机が2卓ぶん置けない。
//   動き: 上の階の緑と机が伸びる → 下の階の緑が伸びる (点線まで届かない)
//         → 届かなかった分に赤が塗られる。
// ===================================================================
const Kb1KaseruYukaHeru: React.FC<{ f: number }> = ({ f }) => {
  const X0 = 330, X1 = 1590, TH = 230;   // 建物の外側 (上下で同じ幅) と1段の高さ
  const THIN = 36;                        // 上の階の壁の厚み = 点線の位置
  const paint = easeOut(seg(f, 28, 42));
  const TIERS = [
    { ty: 240, wall: THIN, grow: seg(f, 6, 22), tag: "上の階", sub: "壁46センチ" },
    { ty: 580, wall: 158, grow: seg(f, 20, 36), tag: "下の階", sub: "壁1.8メートル" },
  ];
  return (
    <Frame f={f} seed={508} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={190} x2={60 + i * 90} y2={880} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={190 + i * 86} x2={1860} y2={190 + i * 86} />
        ))}
      </g>

      {/* 「上の階ならここまで床だった」点線 (上の階の壁の内側から下へ下ろす) */}
      {[X0 + THIN, X1 - THIN].map((dx, i) => (
        <line key={`d${i}`} x1={dx} y1={260} x2={dx} y2={846} stroke={KRP.red}
          strokeWidth={5} strokeDasharray="20 16" opacity={0.85 * clamp01(seg(f, 18, 28) * 2)} />
      ))}

      {TIERS.map(({ ty, wall, grow, tag, sub }, k) => {
        const inL = X0 + wall, inR = X1 - wall;
        const g = easeOut(grow);
        const fy = ty + 204;                                  // 床の上面
        const nd = Math.floor((inR - inL + 66) / 186);         // 置ける机の数 (机の大きさは上下で同じ)
        const dx0 = (inL + inR) / 2 - (nd * 186 - 66) / 2;
        return (
          <g key={k}>
            {/* 階の箱 (天井と床は木、左右は煉瓦の壁) */}
            <rect x={X0} y={ty} width={X1 - X0} height={TH} fill="#E0D5BE"
              stroke={KRP.ink} strokeWidth={7} />
            {/* 貸せる床 (緑) が左から伸びる */}
            <rect x={inL} y={ty + 24} width={(inR - inL) * g} height={180}
              fill={KRP.green} opacity={0.3} />
            {/* 机が1卓ずつ並ぶ */}
            {Array.from({ length: nd }, (_, j) => {
              const t = clamp01(g * (nd + 0.6) - j);
              if (t <= 0.04) return null;
              const dx = dx0 + j * 186;
              return (
                <g key={j} opacity={t}>
                  <rect x={dx} y={fy - 56} width={130} height={22} rx={5}
                    fill="#8A6A44" stroke={KRP.ink} strokeWidth={5} />
                  <rect x={dx + 12} y={fy - 34} width={18} height={34} fill="#6B5134"
                    stroke={KRP.ink} strokeWidth={4} />
                  <rect x={dx + 100} y={fy - 34} width={18} height={34} fill="#6B5134"
                    stroke={KRP.ink} strokeWidth={4} />
                </g>
              );
            })}
            {/* 左右の壁 */}
            {[X0, X1 - wall].map((wx, i) => (
              <g key={`w${i}`}>
                <rect x={wx} y={ty} width={wall} height={TH} fill="#9A6448" />
                <Bricks x={wx} y={ty} w={wall} h={TH} bw={wall > 80 ? 52 : 36} bh={26}
                  fill="#9A6448" line="#7E4C34" lw={2.5} />
                <rect x={wx} y={ty} width={wall} height={TH} fill="none"
                  stroke={KRP.ink} strokeWidth={7} />
              </g>
            ))}
            {/* 壁に食われた分 (下の階だけ。点線から壁の内側までを赤で潰す) */}
            {wall > THIN && [[X0 + THIN, inL], [inR, X1 - THIN]].map(([a, b], i) => {
              const w = (b - a) * paint;
              const x = i === 0 ? b - w : a;
              return (
                <g key={`r${i}`}>
                  <rect x={x} y={ty + 24} width={w} height={180} fill={KRP.red} opacity={0.42} />
                  <g stroke={KRP.red} strokeWidth={5} opacity={0.85}>
                    {Array.from({ length: 7 }, (_, m) => (
                      <line key={m} x1={Math.max(x, a)} y1={ty + 54 + m * 28}
                        x2={Math.min(x + w, b)} y2={ty + 24 + m * 28} />
                    ))}
                  </g>
                </g>
              );
            })}
            {/* 天井と床 */}
            <rect x={X0} y={ty} width={X1 - X0} height={22} fill={C.wood}
              stroke={KRP.ink} strokeWidth={5} />
            <rect x={X0} y={fy} width={X1 - X0} height={26} fill={C.wood}
              stroke={KRP.ink} strokeWidth={5} />
            {/* 貸せる床の寸法 */}
            <DimH x1={inL} x2={inR} y={ty + 92} text="貸せる床" size={32} t={grow}
              color="#2F7A4A" labelDy={-44} tick={14} />
            {/* 階の札 (左はしを揃えて縦積み) */}
            <TagPlate x={196} y={ty + 72} text={tag} size={32} t={seg(f, 2 + k * 14, 14 + k * 14)}
              color={KRP.white} fill="#6B5134" />
            <TagPlate x={196} y={ty + 130} text={sub} size={26}
              t={seg(f, 6 + k * 14, 18 + k * 14)} color={KRP.ink} fill={KRP.white} />
          </g>
        );
      })}

      <Arrow x={1600} y={690} s={0.62} rot={180} t={seg(f, 34, 42)} />
      <TagPlate x={1726} y={600} text="壁にとられた分" size={26} t={seg(f, 32, 42)}
        color={KRP.white} fill="#9A4030" rot={3} />
    </Frame>
  );
};

// ===================================================================
// 文#36 高く建てるほど、損をする構造でした。
//   型: 並。#35と同じ描き方 (茶=壁 / 緑=貸せる床 / 点線=壁が薄ければここまで) で、
//       8階建てと16階建てを並べる。前の絵の続きとして読める。
//   演出: 高いほうは下を支えるために壁が太く、台形に細っていく。
//         点線との差 (赤) が、高いほうだけ大きく溜まる。
//   動き: 8階建てが下から積まれる → 16階建てが積まれる → 赤が塗られる。
// ===================================================================
const Kb1TakakuHodoSon: React.FC<{ f: number }> = ({ f }) => {
  const GY = 812, PITCH = 32, BH = 22, HALF = 300, TOPW = 22;
  const paint = easeOut(seg(f, 28, 42));
  const STACKS = [
    { cx: 560, n: 8, base: 58, rise: seg(f, 4, 20), tag: "8階建て", ty: 512 },
    { cx: 1360, n: 16, base: 100, rise: seg(f, 16, 36), tag: "16階建て", ty: 256 },
  ];
  return (
    <Frame f={f} seed={509} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={190} x2={60 + i * 90} y2={812} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={190 + i * 86} x2={1860} y2={190 + i * 86} />
        ))}
      </g>

      {STACKS.map(({ cx, n, base, rise, tag, ty }, k) => {
        const r = easeOut(rise);
        return (
          <g key={k}>
            {/* 壁が薄ければここまで床だった、の点線 */}
            {[cx - (HALF - TOPW), cx + (HALF - TOPW)].map((dx, i) => (
              <line key={`d${i}`} x1={dx} y1={GY - 14 - (n - 1) * PITCH} x2={dx} y2={GY}
                stroke={KRP.red} strokeWidth={4.5} strokeDasharray="18 14"
                opacity={0.85 * clamp01(r * 2 - 0.6)} />
            ))}
            {Array.from({ length: n }, (_, i) => {
              const t = clamp01(r * (n + 1.2) - i);
              if (t <= 0.04) return null;
              const yy = GY - 24 - i * PITCH;
              const wall = lerp(base, TOPW, i / (n - 1));
              const inner = HALF - wall;
              return (
                <g key={i} opacity={Math.min(1, t * 2)}>
                  {/* 階まるごと (茶 = 壁) */}
                  <rect x={cx - HALF} y={yy} width={HALF * 2} height={BH}
                    fill="#9A6448" stroke={KRP.ink} strokeWidth={3.5} />
                  {/* 貸せる床 (緑) */}
                  <rect x={cx - inner} y={yy + 3} width={inner * 2} height={BH - 6}
                    fill={KRP.green} opacity={0.42} />
                  <rect x={cx - inner} y={yy + 3} width={inner * 2} height={BH - 6}
                    fill="none" stroke="#2F7A4A" strokeWidth={3} />
                  {/* 壁にとられた分 (赤) */}
                  {wall > TOPW + 1 && [-1, 1].map((s) => {
                    const w = (wall - TOPW) * paint;
                    const x = s < 0 ? cx - inner - w : cx + inner;
                    return (
                      <g key={s}>
                        <rect x={x} y={yy + 3} width={w} height={BH - 6}
                          fill={KRP.red} opacity={0.3} />
                        <line x1={x} y1={yy + BH - 3} x2={x + w} y2={yy + 3}
                          stroke={KRP.red} strokeWidth={3.5} opacity={0.75} />
                      </g>
                    );
                  })}
                </g>
              );
            })}
            {/* 屋上の軒 */}
            <g opacity={clamp01(r * 1.1 - 0.85) * 4}>
              <rect x={cx - HALF - 16} y={GY - 24 - (n - 1) * PITCH - 20} width={HALF * 2 + 32}
                height={20} fill="#9C6B4C" stroke={KRP.ink} strokeWidth={5} />
            </g>
            <TagPlate x={cx} y={ty} text={tag} size={38} t={seg(f, 2 + k * 12, 14 + k * 12)}
              color={KRP.white} fill="#6B5134" />
          </g>
        );
      })}

      {/* 地面 */}
      <line x1={120} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={160 + i * 145} y1={GY} x2={130 + i * 145} y2={GY + 34} />
        ))}
      </g>

      {/* 札 (左上の空きに縦積み) */}
      <TagPlate x={560} y={330} text="赤 = 壁にとられた床" size={26} t={seg(f, 30, 40)}
        color={KRP.white} fill="#9A4030" />
      <TagPlate x={560} y={392} text="高くするほど、下の赤が増える" size={26} t={seg(f, 36, 44)}
        color={KRP.ink} fill={KRP.white} />
    </Frame>
  );
};

// ===================================================================
// 文#38 しかもシカゴの地面は、やわらかい粘土です。
//   どこ: 建てる前の敷地。地面を試しに掘った穴。手前側を切り取った断面。
//   演出: 画面の2/3が土。表土→砂→青い粘土。粘土の層は画面の下へ抜けていき、
//         硬い岩はこの画面には入らない (= ずっと下)。
//   動き: 監督がスコップで粘土をすくい、ねばって垂れる。穴の底の職人の長靴が沈む。
// ===================================================================
const Kb1NendoJiban: React.FC<{ f: number }> = ({ f }) => {
  const gy = 420;                 // 地面の高さ
  const L1 = 500, L2 = 572;       // 表土の下端 / 砂の下端
  const px0 = 560, px1 = 1300, pbot = 886;   // 穴の左右と底
  const drip = ((f * 0.9) % 60) / 60;
  const lab = seg(f, 14, 34);
  return (
    <Frame f={f} seed={510} bg="#D7E4EC">
      {/* ───── 遠景: くもった空・仮囲い・向こうの低い街 ───── */}
      <rect x={-20} y={-20} width={W + 40} height={gy + 20} fill="#D2DFE8" />
      <Cloud cx={320} cy={92} s={1.2} fill="#EDF2F5" opacity={0.9} />
      <Cloud cx={1180} cy={64} s={1.0} fill="#E6ECF0" opacity={0.8} />
      <Cloud cx={1720} cy={150} s={0.7} fill="#E6ECF0" opacity={0.6} />
      <Birds x={-160} y={120} f={f} n={3} speed={0.6} />
      <RowOfBuildings x0={-40} x1={1960} base={gy - 6} seed={113} minH={90} maxH={210}
        fill="#A9B2B6" windows winColor="#D6E3EA" opacity={0.5} sw={3} count={15} />
      <Smoke x={420} y={240} f={f} n={5} r={16} rise={200} speed={0.5} color="#C3CACE" opacity={0.42} />
      <Smoke x={1540} y={252} f={f} n={5} r={13} rise={180} speed={0.45} color="#C3CACE" opacity={0.36} />
      {/* 現場の仮囲い (板塀) */}
      <g>
        <rect x={-20} y={286} width={W + 40} height={134} fill="#9E8155" stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#7A6240" strokeWidth={4} opacity={0.85}>
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={-20 + i * 82} y1={286} x2={-20 + i * 82} y2={420} />
          ))}
        </g>
        <rect x={-20} y={306} width={W + 40} height={14} fill="#7A6240" opacity={0.7} />
        <rect x={-20} y={382} width={W + 40} height={14} fill="#7A6240" opacity={0.7} />
      </g>

      {/* ───── 地層の断面 (手前を切り取ってある) ───── */}
      {/* 粘土 (画面の下まで続く = 底が見えない) */}
      <rect x={-20} y={L2} width={W + 40} height={H - L2 + 20} fill={C.clay} />
      <g stroke={C.clayDark} strokeWidth={4} opacity={0.5}>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M -20 ${L2 + 60 + i * 76} Q 480 ${L2 + 36 + i * 76} 960 ${L2 + 70 + i * 76} T 1940 ${L2 + 50 + i * 76}`}
            fill="none" />
        ))}
      </g>
      {/* 粘土のつや (やわらかくて濡れている感じ) */}
      <g fill="#A8B49E" opacity={0.35}>
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse key={i} cx={rnd(i * 3.1) * 1960 - 20} cy={L2 + 40 + rnd(i * 7.7) * 520}
            rx={30 + rnd(i * 2.3) * 50} ry={10 + rnd(i * 4.9) * 10} />
        ))}
      </g>
      {/* 砂・砂礫 */}
      <rect x={-20} y={L1} width={W + 40} height={L2 - L1} fill={C.sand} />
      <g fill={C.soilDark} opacity={0.55}>
        {Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={rnd(i * 1.7) * 1960 - 20} cy={L1 + 6 + rnd(i * 5.3) * (L2 - L1 - 12)}
            r={2 + rnd(i * 2.9) * 4} />
        ))}
      </g>
      {/* 表土 */}
      <rect x={-20} y={gy} width={W + 40} height={L1 - gy} fill={C.soil} />
      <g fill={C.soilDark} opacity={0.5}>
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={rnd(i * 4.1) * 1960 - 20} cy={gy + 8 + rnd(i * 6.1) * (L1 - gy - 14)}
            r={2.5 + rnd(i * 3.7) * 4} />
        ))}
      </g>
      {/* 層の境目の線 */}
      <line x1={-20} y1={gy} x2={W + 20} y2={gy} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-20} y1={L1} x2={W + 20} y2={L1} stroke="#8E7A52" strokeWidth={5} />
      <line x1={-20} y1={L2} x2={W + 20} y2={L2} stroke={C.clayDark} strokeWidth={5} />
      {/* 地面に生えた草 */}
      <g stroke="#6E7A4A" strokeWidth={4} fill="none" strokeLinecap="round">
        {Array.from({ length: 26 }, (_, i) => {
          const xx = rnd(i * 8.3) * 1960 - 20;
          if (xx > px0 - 40 && xx < px1 + 40) return null;
          const sw2 = Math.sin(f / 21 + i) * 5;
          return <path key={i} d={`M ${xx} ${gy} q ${-6 + sw2} -16 ${-14 + sw2} -26 M ${xx} ${gy} q ${8 + sw2} -14 ${16 + sw2} -22`} />;
        })}
      </g>

      {/* ───── 穴 (試掘坑)。中は暗く、底は粘土 ───── */}
      <g>
        <rect x={px0} y={gy} width={px1 - px0} height={pbot - gy} fill="#5E6358" />
        {/* 穴の向こう側の壁にも同じ層が出ている (暗め) */}
        <rect x={px0} y={gy} width={px1 - px0} height={L1 - gy} fill="#8A7149" />
        <rect x={px0} y={L1} width={px1 - px0} height={L2 - L1} fill="#A89468" />
        <rect x={px0} y={L2} width={px1 - px0} height={pbot - L2} fill="#6E7A68" />
        <g stroke="#56604E" strokeWidth={4} opacity={0.5}>
          {Array.from({ length: 4 }, (_, i) => (
            <path key={i} d={`M ${px0} ${L2 + 50 + i * 76} Q ${(px0 + px1) / 2} ${L2 + 28 + i * 76} ${px1} ${L2 + 56 + i * 76}`} fill="none" />
          ))}
        </g>
        {/* 穴の底 (たまった水) */}
        <ellipse cx={(px0 + px1) / 2} cy={pbot - 14} rx={(px1 - px0) / 2 - 20} ry={26} fill="#7F9298" opacity={0.75} />
        <rect x={px0} y={gy} width={px1 - px0} height={pbot - gy} fill="none" stroke={KRP.ink} strokeWidth={7} />
        {/* 土留めの板と支え */}
        <g>
          <rect x={px0 + 6} y={gy + 10} width={26} height={pbot - gy - 20} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <rect x={px1 - 32} y={gy + 10} width={26} height={pbot - gy - 20} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          {[560, 700].map((yy, i) => (
            <rect key={i} x={px0 + 10} y={yy} width={px1 - px0 - 20} height={20}
              fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
          ))}
        </g>
        {/* 梯子 */}
        <g>
          <rect x={1176} y={gy - 30} width={14} height={pbot - gy + 30} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1248} y={gy - 30} width={14} height={pbot - gy + 30} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={1176} y={gy - 10 + i * 52} width={86} height={12} fill={C.woodDark}
              stroke={KRP.ink} strokeWidth={3.5} />
          ))}
        </g>
        {/* 吊るしたランタン */}
        <g>
          <line x1={760} y1={gy} x2={760} y2={620} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={738} y={620} width={44} height={56} rx={5} fill="#5A6068" stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={746} y={630} width={28} height={36} fill="#FFE9A8" />
          <circle cx={760} cy={648} r={62} fill={KRP.yellow} opacity={0.22 + 0.06 * Math.sin(f / 11)} />
        </g>
        {/* 穴の底の職人 (長靴が粘土に沈んでいる) */}
        <Person x={950} y={pbot - 10} s={0.72} cloth="#5A6450" clothDark="#454D3D" face="worried"
          gaze={[0, 5]} f={f} phase={6} />
        <FlatCap x={950} y={pbot - 10} s={0.72} f={f} phase={6} color="#6B7558" />
        <g>
          <ellipse cx={936} cy={pbot - 6} rx={30} ry={13} fill={C.clayDark} opacity={0.85} />
          <ellipse cx={972} cy={pbot - 2} rx={28} ry={12} fill={C.clayDark} opacity={0.85} />
        </g>
        {/* 粘土のバケツ */}
        <g transform={`translate(1070 ${pbot - 24})`}>
          <path d="M -34 0 L -28 -56 L 28 -56 L 34 0 Z" fill="#7A8088" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -26 -56 Q 0 -96 26 -56" fill="none" stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={-54} rx={27} ry={9} fill={C.clay} stroke={C.clayDark} strokeWidth={3} />
        </g>
      </g>

      {/* ───── 層の名札 ───── */}
      <TagPlate x={300} y={462} text="表土" size={28} t={lab} fill="#F2E6CE" />
      <TagPlate x={300} y={538} text="砂" size={28} t={clamp01((lab - 0.2) / 0.5)} fill="#F2E6CE" />
      <TagPlate x={1640} y={660} text="青い粘土" size={36} t={clamp01((lab - 0.35) / 0.5)}
        color={KRP.white} fill="#5C6B55" />
      {/* 硬い岩はこの画面に入らない (下向きの長い点線) */}
      <g opacity={clamp01((lab - 0.6) / 0.4)}>
        <line x1={1640} y1={716} x2={1640} y2={1030} stroke={KRP.red} strokeWidth={5} strokeDasharray="18 16" />
        <polygon points="1640,1062 1618,1022 1662,1022" fill={KRP.red} />
        <TagPlate x={1640} y={790} text="硬い岩はもっと下" size={26} t={clamp01((lab - 0.7) / 0.3)}
          fill="#F2E6CE" rot={-2} />
      </g>

      {/* ───── 近景: 穴の縁。監督がスコップで粘土をすくう ───── */}
      {/* 掘り上げた土の山 */}
      <g>
        <path d="M 1340 420 Q 1430 316 1540 420 Z" fill={C.soil} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1430 342 Q 1470 364 1500 420 L 1430 420 Z" fill={C.soilDark} opacity={0.5} />
        <path d="M 160 420 Q 268 300 400 420 Z" fill={C.clay} stroke={KRP.ink} strokeWidth={5} />
        <g fill={C.clayDark} opacity={0.45}>
          <ellipse cx={250} cy={376} rx={34} ry={14} />
          <ellipse cx={320} cy={400} rx={26} ry={11} />
        </g>
      </g>
      {/* 巻き上げ機 (穴から土を上げる) */}
      <g>
        <rect x={420} y={120} width={16} height={300} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={880} y={120} width={16} height={300} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={400} y={100} width={516} height={20} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={658} cy={136} r={28} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <g transform={`rotate(${f * 3} 658 136)`} stroke={KRP.ink} strokeWidth={4}>
          <line x1={636} y1={136} x2={680} y2={136} />
          <line x1={658} y1={114} x2={658} y2={158} />
        </g>
        <line x1={658} y1={164} x2={658} y2={364} stroke={KRP.ink} strokeWidth={3.5} />
        <g transform="translate(658 420)">
          <path d="M -40 0 L -32 -56 L 32 -56 L 40 0 Z" fill="#7A8088" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -30 -56 Q 0 -100 30 -56" fill="none" stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={-54} rx={31} ry={10} fill={C.clay} stroke={C.clayDark} strokeWidth={3} />
        </g>
      </g>
      {/* 監督 (しゃがんでスコップで粘土をすくっている) */}
      <Person x={1490} y={418} s={0.9} cloth="#4B5872" clothDark="#394459" face="worried"
        gaze={[-7, 4]} f={f} phase={3} />
      <Bowler x={1490} y={418} s={0.9} f={f} phase={3} />
      <g transform={`translate(1392 ${330 + bobOf(f, 3)}) rotate(28)`}>
        <rect x={-6} y={0} width={13} height={126} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -34 126 L 34 126 L 28 196 L -28 196 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -26 130 L 26 130 L 22 184 L -22 184 Z" fill={C.clay} stroke={C.clayDark} strokeWidth={3} />
      </g>
      {/* 粘土が糸を引いて垂れる */}
      <g opacity={0.95}>
        <path d={`M 1452 500 Q 1446 ${520 + drip * 90} 1450 ${540 + drip * 130}`}
          fill="none" stroke={C.clay} strokeWidth={9} strokeLinecap="round" />
        <circle cx={1450} cy={548 + drip * 134} r={11 + drip * 5} fill={C.clay} stroke={C.clayDark} strokeWidth={3} />
      </g>
      {/* 指で押したへこみ (左の粘土の山に) */}
      <g>
        <ellipse cx={268} cy={386} rx={15} ry={9} fill={C.clayDark} opacity={0.7} />
        <ellipse cx={296} cy={398} rx={12} ry={7} fill={C.clayDark} opacity={0.6} />
      </g>

      {/* ───── 断面の粘土そのものを見せる (ここが空きがちなので作り込む) ───── */}
      {/* 粘土に混じった小石と貝 */}
      <g>
        {Array.from({ length: 22 }, (_, i) => {
          const xx = rnd(i * 9.1) * 1900;
          const yy = L2 + 30 + rnd(i * 4.3) * 470;
          if (xx > px0 - 30 && xx < px1 + 30 && yy < pbot + 20) return null;
          return <ellipse key={i} cx={xx} cy={yy} rx={9 + rnd(i * 2.1) * 9} ry={6 + rnd(i * 5.7) * 5}
            fill="#8E9A86" stroke={C.clayDark} strokeWidth={3} opacity={0.8}
            transform={`rotate(${rnd(i * 6.3) * 60 - 30} ${xx} ${yy})`} />;
        })}
        {[[196, 812], [1810, 926]].map(([sx, sy], i) => (
          <g key={i} transform={`translate(${sx} ${sy}) rotate(${i ? 14 : -10})`}>
            <path d="M -30 10 Q -26 -22 0 -24 Q 28 -22 30 10 Z" fill="#D9D2BE" stroke={KRP.ink} strokeWidth={4} />
            <g stroke="#A89F88" strokeWidth={2.5}>
              <line x1={-18} y1={6} x2={-8} y2={-18} />
              <line x1={0} y1={8} x2={0} y2={-22} />
              <line x1={18} y1={6} x2={8} y2={-18} />
            </g>
          </g>
        ))}
      </g>
      {/* 切り出した粘土のかたまりと、切る針金 (左手前) */}
      <g transform="translate(330 966)">
        <path d="M -104 56 L -96 -56 L 96 -64 L 110 56 Z" fill="#8FA08A" stroke={KRP.ink} strokeWidth={6} />
        <path d="M -96 -56 L 96 -64 L 74 -34 L -74 -28 Z" fill="#A4B49C" stroke={KRP.ink} strokeWidth={4} />
        <g stroke="#6E7E68" strokeWidth={3.5} opacity={0.7}>
          <line x1={-60} y1={-20} x2={-54} y2={46} />
          <line x1={20} y1={-26} x2={28} y2={44} />
        </g>
        {/* 針金 (両端に木の握り) */}
        <line x1={-150} y1={-96} x2={150} y2={-108} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-180} y={-110} width={34} height={26} rx={5} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={148} y={-124} width={34} height={26} rx={5} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 粘土の面からにじむ水 (やわらかく湿っている印) */}
      <g>
        {[[760, 950], [1480, 880], [1860, 1016]].map(([wx, wy], i) => {
          const dp = (((f * 0.8) / 60 + i * 0.37) % 1);
          return (
            <g key={i}>
              <path d={`M ${wx} ${wy! - 40} q 6 26 -2 52`} fill="none" stroke="#9FB6BC" strokeWidth={6}
                strokeLinecap="round" opacity={0.75} />
              <circle cx={wx! - 2} cy={wy! + 12 + dp * 46} r={7} fill="#9FB6BC" opacity={0.85 * (1 - dp)} />
              <ellipse cx={wx! - 2} cy={wy! + 62} rx={26 + dp * 12} ry={8} fill="#8FA7AE" opacity={0.4} />
            </g>
          );
        })}
      </g>
      {/* 長靴のあと (粘土のやわらかさ) */}
      <g fill={C.clayDark} opacity={0.45}>
        {[[1540, 1046], [1660, 1004], [1392, 1062]].map(([bx, by], i) => (
          <ellipse key={i} cx={bx} cy={by} rx={34} ry={15} transform={`rotate(${-12 + i * 9} ${bx} ${by})`} />
        ))}
      </g>
    </Frame>
  );
};

// ===================================================================
// 文#39 設計者は、20センチ沈むと見込んでいました。
//   型: 図 (改修)。旧版は現場の仮小屋の室内で、右半分を窓 (外の工事) と
//       粘土の試料瓶の棚、左を煙突つきのストーブが占めていたため、
//       主役の黒板が x=236〜1128 (中心 x=682) まで左に押し出されていた。
//       小屋の世界をぜんぶ落とし、黒板だけを方眼の紙地の中央 (中心 x=960) に
//       1320×494 で大きく据え直した。#35・#36 と同じ「格『図』」の形。
//   絵: 黒板の中に、白チョークの建物の断面と基礎・いまの地面、
//       赤チョークの下向き矢印・沈んだあとの破線・20センチの寸法。
//       色の語彙: 赤 = 失う分 (沈んで下がる20センチ)。
//   動き: チョークが線を引いていき (strokeDashoffset)、矢印が下へ伸び、
//         20センチ分が左から赤く塗られる。チョークが寸法の所まで寄り、
//         粉が落ち続ける。
// ===================================================================
const Kb120cmMikomi: React.FC<{ f: number }> = ({ f }) => {
  const BX = 300, BY = 206, BW = 1320, BH = 494;   // 黒板の外枠 (中心 x=960)
  const bG = 486;                                   // 黒板の中の「いまの地面」
  const SINK = 104;                                 // 20センチぶんの高さ
  const GL = 420, GR = 1500;                        // 地面の線の左右
  const BL = 700, BR = 1060, BT = 262;              // 建物の断面
  const ap = easeOut(seg(f, 8, 34));
  const chalk = (t: number) => clamp01((ap - t) / 0.16);
  const paint = easeOut(seg(f, 26, 40));
  const chx = 960 + 200 * clamp01(chalk(0.62));     // チョークの位置 (矢印→寸法)
  const chy = lerp(bG + 12, bG + SINK, chalk(0.42)) + bobOf(f, 2);
  return (
    <Frame f={f} seed={511} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={190} x2={60 + i * 90} y2={860} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={190 + i * 86} x2={1860} y2={190 + i * 86} />
        ))}
      </g>

      {/* ───── 主役: 黒板 (中心 x=960) ───── */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={6} fill="#6B5435" stroke={KRP.ink} strokeWidth={8} />
      <rect x={BX + 22} y={BY + 22} width={BW - 44} height={BH - 44} fill={C.board}
        stroke={KRP.ink} strokeWidth={5} />
      {/* チョーク受けと黒板消し */}
      <rect x={BX} y={BY + BH} width={BW} height={26} rx={5} fill="#6B5435" stroke={KRP.ink} strokeWidth={6} />
      <rect x={1456} y={BY + BH - 6} width={100} height={34} rx={5} fill="#6E6256" stroke={KRP.ink} strokeWidth={4} />

      {/* 計算の走り書き (右上) と黒板消しの跡 */}
      <g stroke="#CFC8B4" strokeWidth={4} opacity={0.42 * chalk(0.1)} strokeLinecap="round">
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={1390} y1={290 + i * 34} x2={1420 + rnd(i * 3.3) * 140} y2={290 + i * 34} />
        ))}
        <line x1={1390} y1={454} x2={1566} y2={454} strokeWidth={5} />
      </g>
      <g fill="#45524A" opacity={0.3}>
        <ellipse cx={1340} cy={640} rx={110} ry={30} />
        <ellipse cx={900} cy={648} rx={80} ry={24} />
      </g>

      {/* 建物の断面と階の線 (白チョーク) */}
      <g stroke="#F1EDE0" fill="none" strokeWidth={7} strokeLinecap="round">
        <path d={`M ${BL} ${bG} L ${BL} ${BT} L ${BR} ${BT} L ${BR} ${bG}`}
          strokeDasharray={1100} strokeDashoffset={1100 * (1 - chalk(0))} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={BL} y1={BT + 20 + i * 38} x2={BR} y2={BT + 20 + i * 38}
            strokeWidth={3.5} opacity={0.6 * chalk(0.08)} />
        ))}
        {/* 基礎 (建物より広い) */}
        <path d={`M ${BL - 32} ${bG} L ${BL - 32} ${bG - 26} L ${BR + 32} ${bG - 26} L ${BR + 32} ${bG}`}
          strokeWidth={6} opacity={chalk(0.16)} />
        {/* いまの地面 */}
        <line x1={GL} y1={bG} x2={GR} y2={bG} strokeWidth={7}
          strokeDasharray={1100} strokeDashoffset={1100 * (1 - chalk(0.22))} />
      </g>
      {/* 地面のハッチ (やわらかい粘土) */}
      <g stroke="#CFC8B4" strokeWidth={3} opacity={0.55 * chalk(0.28)}>
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={GL + 12 + i * 68} y1={bG} x2={GL - 10 + i * 68} y2={bG + 28} />
        ))}
      </g>

      {/* 沈んで失う20センチ (赤) */}
      <g>
        <rect x={GL} y={bG} width={(GR - GL) * paint} height={SINK} fill={KRP.red} opacity={0.34} />
        <g stroke={KRP.red} strokeWidth={5} opacity={0.72}>
          {Array.from({ length: 11 }, (_, i) => {
            const x1 = GL + i * 100, w = (GR - GL) * paint;
            if (x1 > GL + w) return null;
            return <line key={i} x1={x1} y1={bG + SINK} x2={Math.min(x1 + SINK, GL + w)} y2={bG} />;
          })}
        </g>
      </g>
      {/* 沈む向きの矢印 (赤チョーク) */}
      {[760, 860, 960].map((xx, i) => {
        const t = chalk(0.34 + i * 0.04);
        if (t <= 0.02) return null;
        return (
          <g key={i}>
            <line x1={xx} y1={bG + 12} x2={xx} y2={lerp(bG + 12, bG + SINK - 10, t)}
              stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
            {t > 0.9 && (
              <polygon points={`${xx},${bG + SINK + 10} ${xx - 17},${bG + SINK - 24} ${xx + 17},${bG + SINK - 24}`}
                fill={KRP.red} />
            )}
          </g>
        );
      })}
      {/* 沈んだあとの位置 */}
      <line x1={GL} y1={bG + SINK} x2={GR} y2={bG + SINK} stroke={KRP.red} strokeWidth={6}
        strokeDasharray="22 16" opacity={chalk(0.5)} />
      {/* 20センチの寸法 */}
      <g opacity={chalk(0.58)}>
        <line x1={1160} y1={bG} x2={1160} y2={bG + SINK} stroke={KRP.red} strokeWidth={6} />
        <line x1={1136} y1={bG} x2={1184} y2={bG} stroke={KRP.red} strokeWidth={6} />
        <line x1={1136} y1={bG + SINK} x2={1184} y2={bG + SINK} stroke={KRP.red} strokeWidth={6} />
        <text x={1196} y={bG + 72} fontFamily={FONT} fontWeight={900} fontSize={56} fill="#F1EDE0">20cm</text>
      </g>
      {/* 黒板の中の文字 (白=いま / 赤=沈んだあと) */}
      <text x={GL + 10} y={bG - 30} fontFamily={FONT} fontWeight={900} fontSize={30}
        fill="#F1EDE0" opacity={chalk(0.26)}>いまの地面</text>
      <text x={GL + 10} y={bG + SINK + 52} fontFamily={FONT} fontWeight={900} fontSize={30}
        fill={KRP.red} opacity={chalk(0.54)}>沈んだあと</text>

      {/* 書いているチョークと、落ちる粉 */}
      <g transform={`translate(${chx} ${chy}) rotate(-20)`}>
        <rect x={-11} y={-34} width={22} height={66} rx={5} fill="#F1EDE0" stroke={KRP.ink} strokeWidth={4} />
        <rect x={-11} y={-34} width={22} height={14} rx={4} fill="#DCD6C4" />
      </g>
      <g fill="#F1EDE0" opacity={0.75}>
        {Array.from({ length: 7 }, (_, i) => {
          const pp = ((f * 1.4 + i * 19) % 120) / 120;
          return (
            <circle key={i} cx={chx + (rnd(i * 4.1) - 0.5) * 26} cy={chy + 24 + pp * 90}
              r={2.5 + rnd(i * 2.7) * 2.5} opacity={0.8 * (1 - pp)} />
          );
        })}
      </g>

      {/* 札 */}
      <TagPlate x={960} y={772} text="沈む見込み 20センチ" size={34} t={seg(f, 30, 42)}
        color={KRP.white} fill="#9A4030" rot={-1} />
    </Frame>
  );
};

// ===================================================================
// 文#40 だから、あらかじめ20センチ持ち上げて建てた。
//   どこ: 基礎工事のまっ最中。地面を切った断面で、石の基礎と立ち上がりが見える。
//   演出: 「本来ここが天端」の青い点線より、実際の天端が 20cm 上にある。
//         水平を見る器械 (レベル) と標尺で、わざと高く出している所。
//   動き: 緑の矢印が点線から実際の天端まで持ち上がり、「20cm上げる」の札が出る。
// ===================================================================
const Kb120cmAgeru: React.FC<{ f: number }> = ({ f }) => {
  const up = seg(f, 12, 36);
  const gy = 656;        // 地面
  const planned = 566;   // 本来の天端
  const actual = 522;    // 実際に積んだ天端 (20cm上)
  return (
    <Frame f={f} seed={512} bg="#DCE8EE">
      {/* ───── 遠景: 朝の空・隣の建物・煙突 ───── */}
      <rect x={-20} y={-20} width={W + 40} height={540} fill="#CFE2EF" />
      <circle cx={300} cy={130} r={70} fill="#FAF0CC" opacity={0.8} />
      <Cloud cx={880} cy={110} s={1.15} opacity={0.85} />
      <Cloud cx={1620} cy={180} s={0.8} opacity={0.6} />
      <Birds x={-120} y={230} f={f} n={4} speed={0.8} />
      <RowOfBuildings x0={-40} x1={760} base={520} seed={151} minH={120} maxH={280}
        fill="#AEB7BC" windows winColor="#DCE7ED" opacity={0.55} sw={3} count={7} />
      <RowOfBuildings x0={1280} x1={1960} base={520} seed={163} minH={150} maxH={300}
        fill="#AEB7BC" windows winColor="#DCE7ED" opacity={0.55} sw={3} count={6} />
      <Smoke x={620} y={360} f={f} n={5} r={16} rise={230} speed={0.5} color="#C5CBCE" opacity={0.4} />
      <Wires x0={-20} x1={1940} y={210} n={3} sag={30} opacity={0.2} />
      {/* 奥の足場 */}
      <g stroke={C.woodDark} strokeWidth={9} opacity={0.9}>
        <line x1={1360} y1={520} x2={1360} y2={200} />
        <line x1={1520} y1={520} x2={1520} y2={200} />
        <line x1={1680} y1={520} x2={1680} y2={200} />
        <line x1={1340} y1={280} x2={1700} y2={280} />
        <line x1={1340} y1={400} x2={1700} y2={400} />
        <line x1={1360} y1={280} x2={1520} y2={400} />
      </g>
      <Person x={1520} y={400} s={0.42} cloth="#5A6450" clothDark="#454D3D" f={f} phase={5} />

      {/* ───── 中景: 掘り下げた所。地面の断面と石の基礎 ───── */}
      {/* 地面 (手前を切ってある) */}
      <rect x={-20} y={gy} width={W + 40} height={H - gy + 20} fill={C.soil} />
      <rect x={-20} y={gy + 86} width={W + 40} height={H} fill={C.clay} />
      <line x1={-20} y1={gy + 86} x2={W + 20} y2={gy + 86} stroke={C.clayDark} strokeWidth={5} />
      <g stroke={C.clayDark} strokeWidth={4} opacity={0.45}>
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M -20 ${gy + 150 + i * 80} Q 600 ${gy + 126 + i * 80} 1240 ${gy + 158 + i * 80} T 1940 ${gy + 140 + i * 80}`} fill="none" />
        ))}
      </g>
      <g fill={C.soilDark} opacity={0.5}>
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={rnd(i * 4.3) * 1960 - 20} cy={gy + 8 + rnd(i * 6.7) * 70} r={2.5 + rnd(i * 3.1) * 4} />
        ))}
      </g>
      <line x1={-20} y1={gy} x2={W + 20} y2={gy} stroke={KRP.ink} strokeWidth={6} />
      {/* 石の基礎 (地中に広がる台形) */}
      <g>
        <polygon points={`560,${gy} 1480,${gy} 1560,${gy + 240} 480,${gy + 240}`}
          fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.stoneDark} strokeWidth={4} opacity={0.85}>
          <line x1={520} y1={gy + 120} x2={1520} y2={gy + 120} />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={600 + i * 112} y1={gy} x2={588 + i * 118} y2={gy + 120} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`b${i}`} x1={548 + i * 122} y1={gy + 120} x2={536 + i * 128} y2={gy + 240} />
          ))}
        </g>
      </g>
      {/* 立ち上がりの煉瓦 (ここの高さが主役) */}
      <g>
        <rect x={660} y={actual} width={700} height={gy - actual} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
        <Bricks x={666} y={actual + 6} w={688} h={gy - actual - 12} bw={52} bh={26} />
        {/* 天端のモルタル */}
        <rect x={654} y={actual - 14} width={712} height={16} rx={4} fill={C.mortar} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 本来の天端 (青い点線) */}
      <line x1={420} y1={planned} x2={1660} y2={planned} stroke="#2F6FA8" strokeWidth={6} strokeDasharray="22 16" />
      <TagPlate x={330} y={planned} text="本来の高さ" size={26} t={seg(f, 6, 18)} color={KRP.white} fill="#2F6FA8" />
      {/* 20cm 持ち上げた矢印 */}
      <LiftArrow x={1470} y1={planned} y2={actual - 10} w={22} t={up} />
      <DimV x={1560} y1={actual - 10} y2={planned} text="20cm" t={up} size={32} labelDx={116} />
      <TagPlate x={1000} y={448} text="20cm上げて建てる" size={28} t={clamp01((seg(f, 24, 42)))}
        color={KRP.white} fill="#9A4030" rot={-2} />
      {/* 水糸 */}
      <line x1={420} y1={actual - 22} x2={1660} y2={actual - 22} stroke="#C4452F" strokeWidth={3} />

      {/* ───── 近景: レベル (器械) と標尺・煉瓦の山・モルタル ───── */}
      {/* 三脚とレベル */}
      <g transform="translate(300 1010)">
        <line x1={0} y1={-130} x2={-70} y2={60} stroke={C.woodDark} strokeWidth={10} />
        <line x1={0} y1={-130} x2={70} y2={60} stroke={C.woodDark} strokeWidth={10} />
        <line x1={0} y1={-130} x2={6} y2={60} stroke={C.woodDark} strokeWidth={9} />
        <rect x={-62} y={-174} width={124} height={44} rx={8} fill={C.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={34} y={-166} width={70} height={28} rx={6} fill="#5E6670" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-56} cy={-152} r={14} fill="#2E3744" stroke={KRP.ink} strokeWidth={4} />
        <line x1={-110} y1={-152} x2={116} y2={-152} stroke="#C4452F" strokeWidth={3} strokeDasharray="12 10" />
      </g>
      <Person x={430} y={1016} s={1.05} cloth="#4B5872" clothDark="#394459" face="normal"
        gaze={[7, -2]} f={f} phase={2} />
      <Bowler x={430} y={1016} s={1.05} f={f} phase={2} />
      {/* 標尺を持つ職人 */}
      <Person x={1700} y={1046} s={1.1} cloth="#5A6450" clothDark="#454D3D" face="normal"
        gaze={[-6, -3]} f={f} phase={6} />
      <g transform={`translate(1610 ${560 + bobOf(f, 6)})`}>
        <rect x={-18} y={0} width={36} height={480} fill="#F0E6CC" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-18} y={i * 40} width={36} height={20} fill={i % 2 ? "#C4452F" : "#2E3744"} opacity={0.85} />
        ))}
      </g>
      {/* 煉瓦の山とモルタル桶 */}
      <g>
        <Bricks x={120} y={760} w={260} h={120} bw={52} bh={26} />
        <rect x={120} y={760} width={260} height={120} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <Bricks x={150} y={700} w={190} h={60} bw={52} bh={26} />
        <rect x={150} y={700} width={190} height={60} fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g transform="translate(900 960)">
        <ellipse cx={0} cy={0} rx={96} ry={34} fill="#8E8A80" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-10} rx={82} ry={26} fill="#DDD6C6" />
        <path d="M 74 -20 L 162 -72 L 176 -50 L 92 -4 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 手押し車 */}
      <g transform="translate(1270 1010)">
        <path d="M -110 -60 L 110 -60 L 86 -6 L -86 -6 Z" fill="#7A8088" stroke={KRP.ink} strokeWidth={6} />
        <line x1={110} y1={-54} x2={190} y2={-20} stroke={C.woodDark} strokeWidth={9} />
        <line x1={-110} y1={-54} x2={-186} y2={-20} stroke={C.woodDark} strokeWidth={9} />
        <circle cx={0} cy={28} r={34} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <g transform={`rotate(${f * 2.4})`} stroke={KRP.ink} strokeWidth={3.5}>
          <line x1={-26} y1={28} x2={26} y2={28} />
          <line x1={0} y1={2} x2={0} y2={54} />
        </g>
        <Bricks x={-80} y={-96} w={160} h={38} bw={44} bh={19} />
      </g>
    </Frame>
  );
};

// ===================================================================
// 文#41 実際には、50センチ以上沈んだとされます。
//   どこ: 完成から何年かあと。ビルの入口まわり。歩道との取り合いが崩れている。
//   演出: 寄り。本来いちばん下だった段が地面に埋まり、歩道との間に段差と隙間。
//         建物側だけが下がっているので、水はたまり、敷石が建物へ傾く。
//   動き: 赤い寸法線が下へ伸びて「50cm以上」。水たまりに波紋。
// ===================================================================
const Kb150cmShizumu: React.FC<{ f: number }> = ({ f }) => {
  const dim = seg(f, 14, 40);
  const gy = 700;          // 歩道の高さ (沈下の寸法が字幕帯 y≒855 に隠れないよう高めに取る)
  const sunk = 96;         // 沈んだ量 (50cm)
  return (
    <Frame f={f} seed={513} bg="#E4E0D2">
      {/* ───── 遠景: 曇りの空・向かいの街・馬車 ───── */}
      <rect x={-20} y={-20} width={W + 40} height={430} fill="#D6DFE4" />
      <Cloud cx={420} cy={96} s={1.1} fill="#EEF2F4" opacity={0.85} />
      <Cloud cx={1480} cy={140} s={0.9} fill="#E8EDF0" opacity={0.7} />
      <RowOfBuildings x0={-40} x1={1960} base={430} seed={179} minH={160} maxH={330}
        fill="#B0B7BB" windows winColor="#D8E3E9" opacity={0.4} sw={3} count={13} />
      <Wires x0={-20} x1={1940} y={236} n={4} sag={32} opacity={0.2} />
      {/* 向かいの車道。手前の歩道 (gy) まで続けて、左側に空白ができないようにする */}
      <rect x={-20} y={430} width={W + 40} height={gy - 430} fill="#A9A294" opacity={0.45} />
      <g stroke="#8C8578" strokeWidth={4} opacity={0.3}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-20 + i * 130} y1={gy} x2={120 + i * 150} y2={556} />
        ))}
      </g>
      <Carriage x={420} y={548} s={0.38} f={f * 0.3} flip />
      <Person x={1180} y={548} s={0.34} cloth="#5B6478" clothDark="#454D5E" f={f} phase={3} />
      <Person x={1240} y={552} s={0.33} cloth="#6B5A44" clothDark="#53452F" f={f} phase={8} />

      {/* ───── 中景: ビルの正面 (沈んでいる側) ───── */}
      <g>
        <rect x={420} y={120} width={1540} height={gy - 120 + sunk} fill={C.brick} stroke={KRP.ink} strokeWidth={7} />
        <Bricks x={426} y={126} w={1528} h={gy - 126 + sunk} bw={54} bh={27} />
        {/* 帯石 */}
        <rect x={420} y={300} width={1540} height={28} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        {/* 窓 (2列) */}
        {[[520, 160], [520, 380], [1660, 160], [1660, 380]].map(([wx, wy], i) => (
          <g key={i}>
            <rect x={wx} y={wy} width={170} height={170} fill="#46586C" stroke={KRP.ink} strokeWidth={6} />
            <line x1={wx + 85} y1={wy} x2={wx + 85} y2={wy + 170} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
            <rect x={wx - 12} y={wy - 20} width={194} height={22} rx={4} fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ))}
        {/* 入口のアーチと階段 (下の段が埋まっている) */}
        <path d={`M 880 ${gy + sunk} L 880 520 A 190 190 0 0 1 1260 520 L 1260 ${gy + sunk} Z`}
          fill="#333D4A" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 852 528 A 218 218 0 0 1 1288 528 L 1258 528 A 188 188 0 0 0 882 528 Z"
          fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        <rect x={920} y={600} width={130} height={196} fill="#6B4A32" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1090} y={600} width={130} height={196} fill="#6B4A32" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1062} cy={692} r={11} fill={C.brass} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={1108} cy={692} r={11} fill={C.brass} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 階段 (3段のうち上の1段しか出ていない) */}
        <rect x={840} y={gy + sunk - 40} width={460} height={34} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        <rect x={812} y={gy + sunk - 6} width={516} height={34} fill="#BEB5A2" stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
        {/* ひび (沈下でできた) */}
        <Crack d="M 700 330 l 18 70 l -22 64 l 26 88 l -14 72" t={1} sw={6} color="#5A3A28" />
        <Crack d="M 1500 306 l -20 62 l 24 70 l -18 92" t={1} sw={5} color="#5A3A28" />
        {/* 定礎石 (半分埋まった) */}
        <g transform={`translate(640 ${gy + 4})`}>
          <rect x={-100} y={-48} width={200} height={96} rx={6} fill="#C3B9A2" stroke={KRP.ink} strokeWidth={6} />
          <text x={0} y={4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill="#5F5343">1891</text>
        </g>
      </g>

      {/* ───── 沈んだ量の寸法 ───── */}
      <line x1={300} y1={gy} x2={1960} y2={gy} stroke="#2F6FA8" strokeWidth={6} strokeDasharray="22 16" />
      <TagPlate x={236} y={gy - 34} text="もとの高さ" size={26} t={seg(f, 8, 20)} color={KRP.white} fill="#2F6FA8" />

      {/* ───── 近景: 歩道が建物側へ傾き、水がたまっている ───── */}
      <polygon points={`-20,${gy} 420,${gy} 420,${gy + sunk} -20,${gy + 30}`} fill="#C7BDA8" />
      <polygon points={`-20,${gy + 30} 420,${gy + sunk} 1960,${gy + sunk} 1960,1100 -20,1100`} fill="#BBB1A0" />
      <line x1={-20} y1={gy + 30} x2={420} y2={gy + sunk} stroke={KRP.ink} strokeWidth={6} />
      <line x1={420} y1={gy + sunk} x2={1960} y2={gy + sunk} stroke={KRP.ink} strokeWidth={6} />
      {/* 敷石が建物へ向かって傾いている */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={-20 + i * 300} y1={gy + 30 + i * 9} x2={-80 + i * 320} y2={H + 20} />
        ))}
        <line x1={-20} y1={gy + 96} x2={1960} y2={gy + 118} />
      </g>
      {/* 建物との隙間 (黒い割れ目) */}
      <path d={`M 400 ${gy + 92} l 40 8 l 300 4 l 500 -2 l 400 4 l 320 -2 l 0 16 l -1560 -6 Z`}
        fill="#4A4438" opacity={0.85} />
      {/* 沈んだ量の寸法。歩道の面より手前に描かないと、歩道の塗りに隠れてしまう */}
      <DimV x={352} y1={gy} y2={gy + sunk} text="50cm以上" t={dim} size={34} labelDx={-62} />
      <Arrow x={470} y={gy + sunk / 2} s={0.6} rot={90} t={clamp01((dim - 0.6) / 0.4)} />

      {/* 水たまり (波紋)。建物ぎわが低いので、水は壁の方へ寄っている */}
      <g>
        <ellipse cx={820} cy={906} rx={210} ry={40} fill="#8FA7B2" opacity={0.75} />
        <ellipse cx={820} cy={906} rx={210} ry={40} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {[0, 1].map((i) => {
          const pp = (((f * 0.9) / 60 + i * 0.5) % 1);
          return <ellipse key={i} cx={820} cy={906} rx={30 + pp * 166} ry={7 + pp * 30}
            fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.6 * (1 - pp)} />;
        })}
      </g>
      {/* 傾きを見る人 (下げ振りを垂らしている) */}
      <Person x={1660} y={1012} s={1.0} cloth="#4A5468" clothDark="#363E4F" face="surprised"
        gaze={[-7, 3]} f={f} phase={4} />
      <Bowler x={1660} y={1012} s={1.0} f={f} phase={4} />
      <g>
        <line x1={1566} y1={828 + bobOf(f, 4)} x2={1562} y2={960} stroke={KRP.ink} strokeWidth={3} />
        <polygon points="1562,960 1550,992 1574,992" fill={C.brass} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 近景の小物: 傾いたガス灯・割れた敷石・こぼれた砂利 */}
      <g transform="rotate(6 1480 1082)">
        <GasLamp x={1480} y={1082} s={1.15} f={f} />
      </g>
      <g>
        <polygon points="300,1004 430,994 446,1048 286,1056" fill="#A99F8E" stroke={KRP.ink} strokeWidth={5} />
        <line x1={362} y1={998} x2={376} y2={1052} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <g fill="#A69B88" stroke={KRP.ink} strokeWidth={3} opacity={0.8}>
        {Array.from({ length: 14 }, (_, i) => {
          const px = 60 + rnd(i * 3 + 7) * 1780;
          const py = 968 + rnd(i * 5 + 2) * 100;
          return <ellipse key={i} cx={px} cy={py} rx={9 + rnd(i + 31) * 8} ry={6 + rnd(i + 17) * 5} />;
        })}
      </g>
    </Frame>
  );
};

// ===== #42 重すぎて、自分で地面にめり込んだんです。 =====
// どこ: 歩道のすぐ下まで切り開いた地面の断面。地上は煉瓦の基部と歩道、地下は表土・砂・粘土。
// 演出: 石を積んだ巨大な基礎が粘土の中へお椀形にめり込み、押しのけられた粘土が左右へ逃げて
//       地表まで盛り上がる。建物ぎわの敷石は持ち上がって割れ、埋設の土管や木の水道管も傾く。
// 動き: 建物の中を荷重の矢印が降り、基礎がじわりと沈み、粘土の逃げ矢印が左右へ開く。
const Kb1MeriKomi: React.FC<{ f: number }> = ({ f }) => {
  const sink = 30 * easeOut(clamp01(seg(f, 8, 34)));
  const tLoad = seg(f, 12, 28);
  const tEsc = seg(f, 22, 38);
  const tTag = seg(f, 26, 40);
  const GR = 470;    // 地面の高さ
  const CLAY = 606;  // もとの粘土の面
  const padB = 638 + sink;
  const clayTop =
    `M -20 ${CLAY} L 280 ${CLAY} Q 388 ${CLAY - 64} 474 ${padB} ` +
    `L 1446 ${padB} Q 1532 ${CLAY - 64} 1640 ${CLAY} L 1940 ${CLAY} L 1940 1100 L -20 1100 Z`;
  return (
    <Frame f={f} seed={514} bg={KRP.cream}>
      {/* --- 遠景: 煙った空と向こうの街 --- */}
      <rect x={-20} y={-20} width={W + 40} height={GR + 24} fill={C.skyHaze} />
      <Cloud cx={320} cy={112} s={1.1} opacity={0.72} />
      <Cloud cx={1560} cy={88} s={0.92} opacity={0.58} />
      <Birds x={1160} y={148} f={f} n={3} s={0.78} />
      <Smoke x={150} y={318} f={f} n={5} r={20} rise={150} color={C.smoke} opacity={0.28} />
      <RowOfBuildings x0={-30} x1={580} base={GR} seed={9} minH={120} maxH={252} opacity={0.42} count={5} />
      <RowOfBuildings x0={1340} x1={1950} base={GR} seed={14} minH={130} maxH={268} opacity={0.42} count={5} />
      <Wires x0={-20} x1={420} y={286} n={2} sag={22} opacity={0.35} />

      {/* --- 中景(地上): 煉瓦の基部。上は破れた紙のように切れて「まだ上へ続く」 --- */}
      <g transform={`translate(0 ${sink * 0.9})`}>
        <path
          d={`M 548 212 L 606 186 L 668 210 L 736 184 L 806 208 L 876 182 L 948 208 L 1020 184
              L 1090 210 L 1158 186 L 1226 212 L 1298 188 L 1372 214 L 1372 ${GR} L 548 ${GR} Z`}
          fill={C.brick} stroke={KRP.ink} strokeWidth={6}
        />
        <Bricks x={548} y={214} w={824} h={GR - 214} bw={52} bh={24} opacity={0.5} />
        {/* アーチ窓 3つ */}
        {[628, 886, 1144].map((wx, i) => (
          <g key={i}>
            <path d={`M ${wx} 380 L ${wx} 290 Q ${wx + 72} 250 ${wx + 144} 290 L ${wx + 144} 380 Z`}
              fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
            <line x1={wx + 72} y1={262} x2={wx + 72} y2={380} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
            <rect x={wx - 10} y={380} width={164} height={14} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 沈下でできた壁のひび */}
        <Crack d="M 572 240 L 592 300 L 566 352 L 590 420" t={seg(f, 20, 36)} sw={5} />
        <Crack d="M 1352 252 L 1326 308 L 1350 366 L 1322 436" t={seg(f, 24, 40)} sw={5} />
      </g>

      {/* 歩道: 遠いところは平らな敷石、建物ぎわは持ち上がって割れている */}
      <g>
        {[-20, 70, 160].map((sx, i) => (
          <rect key={i} x={sx} y={GR - 30} width={88} height={34} fill="#B3A994" stroke={KRP.ink} strokeWidth={4} />
        ))}
        {[1676, 1766, 1856].map((sx, i) => (
          <rect key={i} x={sx} y={GR - 30} width={88} height={34} fill="#B3A994" stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 持ち上がった敷石 (左) */}
        <polygon points={`252,${GR - 30} 344,${GR - 50} 348,${GR - 16} 256,${GR + 4}`} fill="#B3A994" stroke={KRP.ink} strokeWidth={4} />
        <polygon points={`356,${GR - 54} 448,${GR - 44} 452,${GR - 10} 360,${GR - 20}`} fill="#BDB39E" stroke={KRP.ink} strokeWidth={4} />
        <polygon points={`460,${GR - 44} 544,${GR - 24} 546,${GR + 4} 462,${GR - 10}`} fill="#B3A994" stroke={KRP.ink} strokeWidth={4} />
        {/* 持ち上がった敷石 (右) */}
        <polygon points={`1376,${GR - 24} 1460,${GR - 46} 1464,${GR - 12} 1380,${GR + 4}`} fill="#B3A994" stroke={KRP.ink} strokeWidth={4} />
        <polygon points={`1472,${GR - 48} 1564,${GR - 54} 1568,${GR - 18} 1476,${GR - 14}`} fill="#BDB39E" stroke={KRP.ink} strokeWidth={4} />
        <polygon points={`1576,${GR - 52} 1664,${GR - 30} 1666,${GR + 4} 1580,${GR - 18}`} fill="#B3A994" stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* 歩道の人 (大きさの目安)。地上の小ささと地下の大きさを比べさせる */}
      <Person x={120} y={GR - 26} s={0.44} cloth="#6E7A86" clothDark="#55606A" hair="none" face="worried" gaze={[0.6, 0.5]} f={f} phase={1} />
      <Bowler x={120} y={GR - 26} s={0.44} f={f} phase={1} />
      <Person x={1830} y={GR - 26} s={0.42} cloth="#7D6A58" clothDark="#64533F" hair="none" face="normal" gaze={[-0.6, 0.5]} f={f} phase={3} />
      <FlatCap x={1830} y={GR - 26} s={0.42} f={f} phase={3} />

      {/* --- 中景(地下): 表土・砂・粘土 --- */}
      <rect x={-20} y={GR} width={W + 40} height={56} fill={C.soil} stroke={KRP.ink} strokeWidth={0} />
      <rect x={-20} y={GR + 56} width={W + 40} height={80} fill={C.sand} />
      <path d={clayTop} fill={C.clay} stroke={KRP.ink} strokeWidth={6} />
      {/* 粘土の中のねばり模様 + 基礎の下を回り込む流れ線 */}
      <g stroke={C.clayDark} strokeWidth={3.5} fill="none" opacity={0.5}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i}
            d={`M -20 ${700 + i * 78} Q 480 ${724 + i * 78} 960 ${700 + i * 78} T 1940 ${708 + i * 78}`} />
        ))}
      </g>
      <g stroke={C.clayDark} strokeWidth={4.5} fill="none" opacity={0.75}>
        {[0, 1, 2].map((i) => (
          <path key={i}
            d={`M ${392 - i * 70} ${660 + i * 36} Q 960 ${770 + i * 56} ${1528 + i * 70} ${660 + i * 36}`} />
        ))}
      </g>
      {/* 埋設物: 土管と、当時の木の水道管 (丸太をくり抜いたもの)。沈下で傾いている */}
      <g transform="rotate(-7 170 556)">
        <rect x={60} y={538} width={220} height={38} rx={8} fill={C.terra} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={280} cy={557} rx={11} ry={19} fill={C.terraDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <g transform="rotate(8 1760 548)">
        <rect x={1640} y={528} width={260} height={44} rx={10} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1648} cy={550} rx={12} ry={21} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1760} y1={528} x2={1760} y2={572} stroke={C.woodDark} strokeWidth={4} />
      </g>
      {/* 根っこ (表土の手触り) */}
      <g stroke={C.soilDark} strokeWidth={3.5} fill="none" opacity={0.8}>
        <path d={`M 700 ${GR + 2} L 686 ${GR + 30} L 702 ${GR + 52}`} />
        <path d={`M 1540 ${GR + 2} L 1556 ${GR + 26} L 1538 ${GR + 48}`} />
        <path d={`M 1600 ${GR + 2} L 1588 ${GR + 24}`} />
      </g>

      {/* --- 主役: 段々に広がる石の基礎。粘土を押しのけて沈んでいる --- */}
      <g transform={`translate(0 ${sink})`}>
        <rect x={548} y={GR} width={824} height={50} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        <Stones x={548} y={GR} w={824} h={50} bw={124} bh={50} opacity={0.6} />
        <rect x={512} y={GR + 50} width={896} height={58} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        <Stones x={512} y={GR + 50} w={896} h={58} bw={130} bh={58} opacity={0.6} />
        <rect x={474} y={GR + 108} width={972} height={60} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        <Stones x={474} y={GR + 108} w={972} h={60} bw={138} bh={60} fill={C.stoneDark} line="#6F6659" opacity={0.6} />
        {/* 底に敷いた鉄のレール (グリレージ) */}
        <g>
          {[520, 660, 800, 940, 1080, 1220, 1360].map((bx, i) => (
            <rect key={i} x={bx} y={GR + 160} width={76} height={14} fill={C.steel} stroke={KRP.ink} strokeWidth={3.5} />
          ))}
        </g>
      </g>

      {/* 荷重の矢印: 建物の中を降りて基礎へ */}
      <LoadArrow x={700} y1={246} y2={GR - 16} w={22} t={tLoad} />
      <LoadArrow x={960} y1={230} y2={GR - 16} w={26} t={tLoad} />
      <LoadArrow x={1220} y1={246} y2={GR - 16} w={22} t={tLoad} />
      <LoadArrow x={960} y1={GR + 190 + sink} y2={GR + 300 + sink} w={30} t={seg(f, 20, 34)} />

      {/* もとの粘土の面 (青い破線) と、めり込んだ深さ */}
      <g opacity={clamp01(seg(f, 16, 30))}>
        <line x1={-20} y1={CLAY} x2={420} y2={CLAY} stroke={KRP.blueDeep} strokeWidth={5} strokeDasharray="20 14" />
        <line x1={1500} y1={CLAY} x2={1940} y2={CLAY} stroke={KRP.blueDeep} strokeWidth={5} strokeDasharray="20 14" />
        <text x={1936} y={CLAY - 18} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={26} fill={KRP.blueDeep}>
          もとの粘土の面
        </text>
      </g>

      {/* 粘土が左右へ逃げる */}
      <g opacity={clamp01(tEsc)}>
        <Arrow x={316} y={690} s={1.0} rot={200} t={tEsc} />
        <Arrow x={262} y={830} s={0.9} rot={184} t={seg(f, 26, 40)} />
        <Arrow x={1604} y={690} s={1.0} rot={340} t={tEsc} />
        <Arrow x={1658} y={830} s={0.9} rot={356} t={seg(f, 26, 40)} />
      </g>

      {/* 札: 重さ → 基礎 → 粘土 */}
      <TagPlate x={286} y={258} text="建物ぜんぶの重さ" size={30} t={seg(f, 10, 24)} />
      <Arrow x={530} y={258} s={0.8} t={seg(f, 14, 26)} />
      <TagPlate x={296} y={762} text="粘土が横へ逃げる" size={30} t={tTag} fill={KRP.white} />
      <TagPlate x={1620} y={762} text="だから沈む" size={30} t={seg(f, 30, 44)} />
      <TagPlate x={960} y={GR + 212 + sink} text="自分の重さで食い込む" size={32} t={seg(f, 32, 46)} color={KRP.red} />

      {/* --- 近景: 切り口のきわ。こぼれた土と煉瓦の欠け --- */}
      <g>
        <path d="M -20 1026 L 120 1014 L 300 1030 L 470 1012 L 660 1032 L 860 1016 L 1060 1034
                 L 1260 1014 L 1460 1032 L 1660 1016 L 1860 1030 L 1940 1020 L 1940 1100 L -20 1100 Z"
          fill={C.soilDark} stroke={KRP.ink} strokeWidth={6} />
        {[80, 260, 520, 780, 1120, 1400, 1700].map((px, i) => (
          <ellipse key={i} cx={px} cy={1056 + (i % 3) * 8} rx={16 + (i % 4) * 5} ry={10 + (i % 3) * 3}
            fill={C.rock} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        <g transform="rotate(-14 420 1046)">
          <rect x={372} y={1028} width={96} height={34} fill={C.brick} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        <g transform="rotate(10 1540 1050)">
          <rect x={1492} y={1032} width={90} height={32} fill={C.brickLight} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      </g>
    </Frame>
  );
};

// ===== #43 そこで、考え方がひっくり返ります。 =====
// どこ: 解体中の通り。厚い煉瓦壁を倒している現場で、埃っぽい午後。
// 演出: 画面中央で高い煉瓦壁が手前へ倒れかかり、土埃が噴き上がる。空には大きな
//       「裏返す」のU字矢印。右には釘1本でぶら下がった「壁」の札が逆さに揺れる。
// 動き: 壁が傾きを深め、煉瓦が降り、埃がふくらみ、職人が綱を引いて下がる。
const Kb1KangaekataHikkurikaeru: React.FC<{ f: number }> = ({ f }) => {
  const tilt = -44 * easeOut(clamp01(seg(f, 6, 40)));   // 壁の倒れ角
  const tDust = clamp01(seg(f, 14, 40));
  const tArc = seg(f, 20, 38);
  const GRD = 772;  // 通りの高さ
  // 落ちてくる煉瓦 (seed で位置を固定)
  const bricksFalling = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const p = clamp01(seg(f, 10 + i * 3, 46 + i * 2));
    return {
      x: 540 + rnd(i * 3 + 1) * 420 - p * 150,
      y: 250 + rnd(i * 3 + 2) * 180 + p * p * 430,
      r: rnd(i * 3 + 3) * 360 + f * 3,
      o: p < 0.02 ? 0 : 1,
    };
  });
  return (
    <Frame f={f} seed={515} bg={KRP.cream}>
      {/* --- 遠景: 埃で白っぽい空、向こうの街と煙突 --- */}
      <rect x={-20} y={-20} width={W + 40} height={GRD + 24} fill="#E7DFCD" />
      <rect x={-20} y={300} width={W + 40} height={GRD - 276} fill={C.skyHaze} opacity={0.5} />
      <Cloud cx={1620} cy={120} s={1.0} opacity={0.5} />
      <Birds x={300} y={176} f={f} n={4} s={0.7} speed={0.4} />
      <RowOfBuildings x0={-30} x1={620} base={GRD - 60} seed={21} minH={220} maxH={420} opacity={0.34} count={6} />
      <RowOfBuildings x0={1180} x1={1950} base={GRD - 60} seed={27} minH={240} maxH={450} opacity={0.34} count={6} />
      {/* 教会の尖塔と工場の煙突 (遠景の目印) */}
      <g opacity={0.4}>
        <rect x={236} y={318} width={46} height={394} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="236,318 259,228 282,318" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1460} y={286} width={54} height={426} fill="#9A8E7C" stroke={KRP.ink} strokeWidth={4} />
        <rect x={1450} y={274} width={74} height={20} fill="#8A7E6C" stroke={KRP.ink} strokeWidth={4} />
      </g>
      <Smoke x={1487} y={268} f={f} n={6} r={22} rise={190} color={C.smoke} opacity={0.3} />

      {/* --- 中景左: 向かいの店先・貼り紙だらけの板塀・ガス灯・荷車 --- */}
      <g>
        <rect x={-30} y={402} width={430} height={GRD - 402} fill="#C2A98C" stroke={KRP.ink} strokeWidth={6} />
        <Bricks x={-30} y={402} w={430} h={GRD - 402} bw={52} bh={24} fill="#C2A98C" line="#9B8468" opacity={0.4} />
        <rect x={-30} y={378} width={450} height={32} fill="#9B8468" stroke={KRP.ink} strokeWidth={5} />
        {[10, 150, 290].map((wx, i) => (
          <rect key={i} x={wx} y={450} width={94} height={118} fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 日よけ */}
        <path d="M -30 610 L 420 610 L 400 672 L -30 672 Z" fill="#9A7E63" stroke={KRP.ink} strokeWidth={5} />
        <g stroke="#7E6450" strokeWidth={5}>
          {[40, 130, 220, 310].map((lx, i) => (<line key={i} x1={lx} y1={610} x2={lx - 10} y2={672} />))}
        </g>
        {/* 板塀と貼り紙 */}
        <rect x={400} y={606} width={300} height={GRD - 606} fill={C.board} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={456 + i * 62} y1={606} x2={456 + i * 62} y2={GRD} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
        ))}
        <g transform="rotate(-5 470 660)">
          <rect x={418} y={626} width={104} height={70} fill={C.paper} stroke={KRP.ink} strokeWidth={4} />
          <g stroke={KRP.grayDark} strokeWidth={4}>
            {[0, 1, 2].map((i) => (<line key={i} x1={430} y1={646 + i * 18} x2={510} y2={646 + i * 18} />))}
          </g>
        </g>
        <g transform="rotate(4 610 690)">
          <rect x={556} y={654} width={110} height={76} fill="#E8DCC0" stroke={KRP.ink} strokeWidth={4} />
          <g stroke={KRP.grayDark} strokeWidth={4}>
            {[0, 1, 2].map((i) => (<line key={i} x1={568} y1={676 + i * 18} x2={654} y2={676 + i * 18} />))}
          </g>
        </g>
      </g>
      <GasLamp x={744} y={GRD} s={1.0} f={f} lit={false} />

      {/* --- 中景: まだ残っている建物の袖壁 (倒す壁の向こう側) --- */}
      <g>
        <rect x={1134} y={352} width={392} height={GRD - 352} fill={C.brickLight} stroke={KRP.ink} strokeWidth={6} />
        <Bricks x={1134} y={352} w={392} h={GRD - 352} bw={50} bh={23} fill={C.brickLight} opacity={0.42} />
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => (
            <rect key={`${r}${c}`} x={1190 + c * 190} y={404 + r * 124} width={110} height={82}
              fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
          )),
        )}
        {/* 壁をもぎ取ったあとの段々の跡 */}
        <path d="M 1134 352 L 1078 352 L 1078 410 L 1134 410" fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1134 480 L 1072 480 L 1072 538 L 1134 538" fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1134 608 L 1080 608 L 1080 666 L 1134 666" fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* --- 主役: 倒れかかる厚い煉瓦壁。足元を軸に手前左へ回る --- */}
      <g transform={`rotate(${tilt} 1012 ${GRD})`}>
        <rect x={792} y={214} width={226} height={GRD - 214} fill={C.brick} stroke={KRP.ink} strokeWidth={7} />
        <Bricks x={792} y={214} w={226} h={GRD - 214} bw={54} bh={25} opacity={0.55} />
        {/* 壁の厚みの見える側面 */}
        <polygon points={`1018,214 1092,246 1092,${GRD} 1018,${GRD}`} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <line key={i} x1={1018} y1={262 + i * 52} x2={1092} y2={294 + i * 52} />
          ))}
        </g>
        {/* 天端の笠石 */}
        <rect x={776} y={190} width={258} height={28} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="1034,190 1106,222 1092,248 1034,218" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 根元の折れ (煉瓦が砕けている) */}
        <path d={`M 792 ${GRD - 80} L 836 ${GRD - 46} L 880 ${GRD - 88} L 930 ${GRD - 40} L 976 ${GRD - 86} L 1018 ${GRD - 44} L 1018 ${GRD} L 792 ${GRD} Z`}
          fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
        <Crack d={`M 800 ${GRD - 180} L 854 ${GRD - 130} L 812 ${GRD - 90}`} t={seg(f, 8, 24)} sw={6} />
        {/* 引き綱 */}
        <path d={`M 800 300 Q 640 350 470 ${GRD - 150}`} stroke="#8B7B5E" strokeWidth={7} fill="none" />
      </g>

      {/* 落ちてくる煉瓦 */}
      <g>
        {bricksFalling.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r})`} opacity={b.o}>
            <rect x={-30} y={-13} width={60} height={26} fill={C.brick} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>

      {/* 土埃: 壁の足元から大きく噴き上がる */}
      <g opacity={tDust}>
        <ellipse cx={880} cy={GRD - 30} rx={430 * tDust} ry={120 * tDust} fill="#CDC0A4" opacity={0.85} />
        <ellipse cx={640} cy={GRD - 70} rx={200 * tDust} ry={130 * tDust} fill="#D6CAB0" opacity={0.8} />
        <ellipse cx={1050} cy={GRD - 90} rx={170 * tDust} ry={120 * tDust} fill="#D6CAB0" opacity={0.7} />
        <Smoke x={930} y={GRD - 40} f={f} n={10} r={70} rise={330} speed={1.5} drift={70} color="#CBBE9F" opacity={0.95} grow={2.2} />
        <Smoke x={690} y={GRD - 20} f={f} n={8} r={58} rise={250} speed={1.2} drift={-70} color="#D8CDB4" opacity={0.9} grow={2.0} />
        {/* 埃のかたまり: まず塗りだけで一つながりの塊にし、あとから上側だけ輪郭を描く
            (粒ごとに縁取りをすると「泡の山」に見えてしまうため) */}
        <g fill="#E2D8C0" opacity={0.92}>
          {[
            [574, 716, 96], [664, 652, 82], [742, 684, 74], [812, 608, 102], [886, 660, 86],
            [934, 576, 84], [1004, 638, 76], [1072, 694, 64], [540, 752, 70], [1126, 736, 54],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx!} cy={cy! + Math.sin((f + i * 13) / 17) * 8} r={r! * (0.6 + 0.4 * tDust)} />
          ))}
        </g>
        <g fill="#EFE7D4" opacity={0.8}>
          {[[704, 558, 56], [796, 520, 46], [880, 486, 52], [962, 522, 40], [1030, 566, 34]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx!} cy={cy! - Math.sin((f + i * 9) / 13) * 10} r={r! * (0.5 + 0.5 * tDust)} />
          ))}
        </g>
        {/* 塊の上の縁だけを1本の線でなぞる */}
        <path d={`M ${524 + 60 * (1 - tDust)} 756 q 34 -108 110 -116 q 44 -4 62 34
                  q 40 -96 118 -98 q 52 0 64 56 q 26 -82 96 -76 q 56 6 58 72
                  q 30 -54 84 -36 q 48 16 44 78 q 34 -26 62 2`}
          fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.55 * tDust} strokeLinecap="round" />
        {/* 足元の濃い埃 */}
        <ellipse cx={850} cy={GRD - 8} rx={420 * tDust} ry={46 * tDust} fill="#B5A684" opacity={0.6} />
        {/* 横へ走る埃の筋 */}
        <g stroke="#C6B894" strokeWidth={7} strokeLinecap="round" opacity={0.5 * tDust}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={1090 + i * 40} y1={660 + i * 36} x2={1090 + i * 40 + 120 + tDust * 90} y2={648 + i * 36} />
          ))}
        </g>
      </g>

      {/* --- 空: 「裏返す」U字の大矢印 --- */}
      <g opacity={clamp01(tArc)}>
        <path d={`M 1236 ${430} A 196 196 0 1 1 1628 430`} stroke={KRP.red} strokeWidth={20}
          fill="none" strokeLinecap="round" strokeDasharray={`${tArc * 640} 640`} />
        {tArc > 0.86 && (
          <polygon points="1628,492 1592,420 1664,420" fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
        )}
      </g>
      <TagPlate x={1432} y={250} text="考えを裏返す" size={34} t={seg(f, 26, 40)} color={KRP.red} />

      {/* 釘にぶら下がった古い看板「壁で支える」。赤い×で消される = 考えが裏返る */}
      <g transform={`rotate(${Math.sin(f / 11) * 3} 1700 548)`}>
        <circle cx={1700} cy={548} r={9} fill={C.steelDark} stroke={KRP.ink} strokeWidth={3.5} />
        <line x1={1700} y1={548} x2={1596} y2={610} stroke={C.steelDark} strokeWidth={5} />
        <line x1={1700} y1={548} x2={1804} y2={610} stroke={C.steelDark} strokeWidth={5} />
        <rect x={1570} y={608} width={262} height={104} rx={8} fill="#E4D8BC" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1582} y={620} width={238} height={80} rx={5} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        <text x={1701} y={678} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={40} fill="#5A4E3C">壁で支える</text>
      </g>
      {/* 消し線は札の全面に大きく引く (真ん中だけだと字が潰れて読めない) */}
      <g stroke={KRP.red} strokeWidth={14} strokeLinecap="round" opacity={0.9 * clamp01(seg(f, 34, 48))}>
        <line x1={1586} y1={616} x2={1816} y2={704} />
        <line x1={1816} y1={616} x2={1586} y2={704} />
      </g>

      {/* --- 近景: 通りと、綱を引いて下がる職人、瓦礫と手押し車 --- */}
      <rect x={-20} y={GRD} width={W + 40} height={H - GRD + 20} fill={C.soil} />
      <g stroke={C.soilDark} strokeWidth={4} opacity={0.55}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={-20} y1={GRD + 40 + i * 58} x2={1940} y2={GRD + 24 + i * 58} />
        ))}
      </g>
      {/* 瓦礫の山 (煉瓦がばらけて積もっている) */}
      <path d="M 520 1080 L 600 992 L 700 1012 L 790 966 L 880 1008 L 970 986 L 1040 1080 Z"
        fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
      <Bricks x={560} y={1006} w={440} h={76} bw={56} bh={26} fill={C.brick} opacity={0.55} />
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`rotate(${-30 + i * 17} ${600 + i * 86} ${968 - (i % 3) * 20})`}>
            <rect x={574 + i * 86} y={954 - (i % 3) * 20} width={58} height={26}
              fill={i % 2 ? C.brickLight : C.brick} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ))}
      </g>
      {/* 綱を引く職人 2人 (壁から離れる向き) */}
      <g>
        <path d={`M 470 ${GRD - 150} Q 400 ${GRD - 60} 332 ${GRD + 8}`} stroke="#8B7B5E" strokeWidth={7} fill="none" />
        <Person x={300} y={GRD + 104} s={0.74} cloth="#6B7A5E" clothDark="#52604A" hair="none"
          face="surprised" gaze={[0.8, -0.4]} lean={-10} f={f} phase={2} />
        <FlatCap x={300} y={GRD + 104} s={0.74} f={f} phase={2} color="#4E5A64" />
        <Person x={166} y={GRD + 150} s={0.84} cloth="#8A6A4E" clothDark="#6B5038" hair="none"
          face="worried" gaze={[0.8, -0.3]} lean={-8} f={f} phase={5} />
        <FlatCap x={166} y={GRD + 150} s={0.84} f={f} phase={5} color="#6A5E52" />
      </g>
      {/* 手押し車と道具 (近景) */}
      <g transform="translate(1340 980) scale(1.05)">
        <polygon points="0,0 210,0 186,70 24,70" fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <line x1={24} y1={70} x2={-36} y2={104} stroke={KRP.ink} strokeWidth={7} />
        <line x1={186} y1={70} x2={246} y2={104} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={106} cy={104} r={34} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={106} cy={104} r={9} fill={C.woodDark} stroke={KRP.ink} strokeWidth={3} />
        {[30, 86, 142].map((bx, i) => (
          <rect key={i} x={bx} y={-26} width={54} height={26} fill={C.brick} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      <g transform="rotate(-24 1760 1010)">
        <rect x={1748} y={880} width={16} height={140} fill={C.wood} stroke={KRP.ink} strokeWidth={4.5} />
        <polygon points="1740,1016 1772,1016 1766,1064 1746,1064" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </Frame>
  );
};

// ===================================================================
// 文#44 壁で支えるのをやめて、鉄の枠を組めばいい。
//   型: 図 (改修)。第1章の山場。旧版は晴れた日の建設現場まるごと
//       (空・雲・鳥・遠景の街・電柱と電線・炉と職人4人・つりバケツ・デリック・
//        仮囲いの看板・荷車・見上げる通行人2人) で、主役の鉄骨が埋もれていた。
//       世界の要素をぜんぶ落とし、柱と梁だけの枠を方眼の紙地の中央
//       (中心 x=960 / 幅1160 × 高さ548) に大きく立てた。
//   絵: 左に捨てた厚い煉瓦の壁 (茶 #9A6448) に赤い×、中央に鉄の枠 (C.steel)。
//       壁がなくなった分、床は端から端まで緑 (= 貸せる床。#35・#36 と同じ語彙)。
//   動き: 柱が下から伸び上がり、梁が下の段から順に架かって継ぎ手が付き、
//         緑の床が端まで伸び、すじかいが入り、壁に×が落ちる。
// ===================================================================
const Kb1TetsuNoWaku: React.FC<{ f: number }> = ({ f }) => {
  const GY = 820, TOPY = 272;                            // 地面と柱の頭
  const CX = [380, 670, 960, 1250, 1540];                // 柱 (中心 x=960)
  const LV = [680, 555, 430, 305];                       // 梁の段
  const CW = 56, BH = 40;                                // 柱の幅 / 梁の高さ
  const X0 = CX[0]! - 28, X1 = CX[4]! + 28;              // 梁の左右
  const colTop = lerp(GY, TOPY, easeOut(seg(f, 2, 24)));
  return (
    <Frame f={f} seed={516} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={190} x2={60 + i * 90} y2={820} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={190 + i * 86} x2={1860} y2={190 + i * 86} />
        ))}
      </g>

      {/* ───── 左: やめた厚い煉瓦の壁 (茶) に赤い× ───── */}
      <g>
        <rect x={100} y={560} width={170} height={GY - 560} fill="#9A6448" />
        <Bricks x={100} y={560} w={170} h={GY - 560} bw={56} bh={26}
          fill="#9A6448" line="#7E4C34" lw={2.5} />
        <rect x={100} y={560} width={170} height={GY - 560} fill="none"
          stroke={KRP.ink} strokeWidth={7} />
      </g>
      <XMark x={185} y={690} s={0.86} t={seg(f, 20, 34)} />
      <TagPlate x={185} y={512} text="壁は、やめた" size={32} t={seg(f, 6, 18)} />

      {/* ───── 主役: 柱と梁だけの鉄の枠 ───── */}
      {/* 床 (壁がないので端から端まで緑 = 貸せる床。いちばん上の梁は屋根なので床なし) */}
      {LV.map((ly, i) => {
        const g = easeOut(seg(f, 13 + i * 5, 26 + i * 5));
        if (i === LV.length - 1 || g <= 0.02) return null;
        return (
          <g key={`fl${i}`}>
            <rect x={X0} y={ly - 58} width={(X1 - X0) * g} height={36}
              fill={KRP.green} opacity={0.34} />
            <line x1={X0} y1={ly - 58} x2={X0 + (X1 - X0) * g} y2={ly - 58}
              stroke="#2F7A4A" strokeWidth={4} opacity={0.9} />
          </g>
        );
      })}
      {/* 柱 (リベット打ちのI形鋼) */}
      {CX.map((cx, i) => (
        <g key={`c${i}`}>
          <rect x={cx - CW / 2} y={colTop} width={CW} height={GY - colTop}
            fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
          <rect x={cx - CW / 2 + 8} y={colTop} width={10} height={GY - colTop}
            fill={C.steelDark} opacity={0.75} />
          <rect x={cx + CW / 2 - 18} y={colTop} width={10} height={GY - colTop}
            fill={C.steelDark} opacity={0.45} />
          <g fill={C.steelDark}>
            {Array.from({ length: Math.max(0, Math.floor((GY - colTop - 40) / 54)) }, (_, k) => (
              <circle key={k} cx={cx} cy={colTop + 28 + k * 54} r={5} />
            ))}
          </g>
        </g>
      ))}
      {/* 梁 (下の段から順に架かる) */}
      {LV.map((ly, i) => {
        const t = clamp01(seg(f, 8 + i * 5, 20 + i * 5));
        if (t <= 0.02) return null;
        const xe = lerp(X0, X1, easeOut(t));
        return (
          <g key={`b${i}`}>
            <rect x={X0} y={ly - BH / 2} width={xe - X0} height={BH}
              fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
            <rect x={X0} y={ly - 6} width={xe - X0} height={12} fill={C.steelDark} opacity={0.6} />
            <g fill={C.steelDark}>
              {Array.from({ length: Math.max(0, Math.floor((xe - X0 - 44) / 60)) }, (_, k) => (
                <circle key={k} cx={X0 + 32 + k * 60} cy={ly} r={5} />
              ))}
            </g>
          </g>
        );
      })}
      {/* 継ぎ手の当て板・リベット・ひかえ板 */}
      {LV.map((ly, i) =>
        CX.map((cx, j) => {
          const t = clamp01(seg(f, 8 + i * 5, 20 + i * 5));
          if (t < 0.4 + j * 0.1) return null;
          return (
            <g key={`j${i}-${j}`}>
              <polygon points={`${cx - 46},${ly + 28} ${cx - 96},${ly + 28} ${cx - 46},${ly - 8}`}
                fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
              <polygon points={`${cx + 46},${ly + 28} ${cx + 96},${ly + 28} ${cx + 46},${ly - 8}`}
                fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
              <rect x={cx - 46} y={ly - 28} width={92} height={56} rx={5}
                fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
              <g fill={C.steelDark}>
                {[-26, 0, 26].map((dx) => (
                  <g key={dx}>
                    <circle cx={cx + dx} cy={ly - 14} r={5.5} />
                    <circle cx={cx + dx} cy={ly + 14} r={5.5} />
                  </g>
                ))}
              </g>
            </g>
          );
        }),
      )}
      {/* すじかい (いちばん下の段の左右) */}
      <g opacity={clamp01(seg(f, 24, 36))} strokeLinecap="round">
        {[408, 1278].map((bx, i) => (
          <g key={i}>
            <line x1={bx} y1={LV[0]!} x2={bx + 234} y2={LV[1]!} stroke={C.steel} strokeWidth={20} />
            <line x1={bx} y1={LV[0]!} x2={bx + 234} y2={LV[1]!} stroke={KRP.ink} strokeWidth={5} opacity={0.45} />
          </g>
        ))}
      </g>

      {/* 地面と柱の基礎 */}
      <line x1={100} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      {CX.map((cx, i) => (
        <rect key={`p${i}`} x={cx - 46} y={GY} width={92} height={30}
          fill={C.concrete} stroke={KRP.ink} strokeWidth={5} />
      ))}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={140 + i * 145} y1={GY} x2={112 + i * 145} y2={GY + 34} />
        ))}
      </g>

      {/* 札と寸法 */}
      <TagPlate x={960} y={234} text="鉄の枠で支える" size={36} t={seg(f, 16, 28)}
        color={KRP.white} fill="#9A4030" />
      <TagPlate x={1700} y={620} text="柱と梁だけ" size={32} t={seg(f, 26, 38)} />
      <DimH x1={X0} x2={X1} y={774} text="端から端まで貸せる" size={30} t={seg(f, 30, 42)}
        color="#2F7A4A" labelDy={-34} tick={14} />
    </Frame>
  );
};

// ===== #45 ちょうどこの頃、鋼が安く作れるようになりました。 =====
// どこ: 夜の製鋼所の中。高い屋根組と青黒い高窓、床にはレールが走っている。
// 演出: 洋梨形の転炉が傾いて、口から炎と火花を噴きながら、まっ白に光る鋼を
//       大きな取鍋へ注ぎこむ。左の黒板には「鋼のねだん」が右下がりに引かれている。
// 動き: 炎と火花がゆれ、注ぐ流れが太くなり、取鍋の湯面の明かりが脈打つ。
const Kb1HaganeYasuku: React.FC<{ f: number }> = ({ f }) => {
  const FL = 880;
  const tPour = clamp01(seg(f, 10, 34));
  const glow = 0.55 + 0.25 * Math.sin(f / 7);
  const tilt = 34;
  // 転炉の口の位置 (傾けたあとの座標)
  const th = (tilt * Math.PI) / 180;
  const mx = 820 + (7 * Math.cos(th) - -380 * Math.sin(th));
  const my = 772 + (7 * Math.sin(th) + -380 * Math.cos(th));
  return (
    <Frame f={f} seed={517} bg="#2B2723" dark>
      <defs>
        <radialGradient id="kb1g45" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={KRP.yellow} stopOpacity={0.55} />
          <stop offset="60%" stopColor={KRP.orange} stopOpacity={0.2} />
          <stop offset="100%" stopColor={KRP.orange} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* --- 遠景: 小屋組と高窓、クレーンの桁 --- */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#2B2723" />
      <ellipse cx={1050} cy={520} rx={900} ry={560} fill="url(#kb1g45)" />
      <g stroke="#4A433C" strokeWidth={7} fill="none">
        <line x1={-20} y1={118} x2={1940} y2={118} />
        <line x1={-20} y1={214} x2={1940} y2={214} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <path key={i} d={`M ${-20 + i * 170} 214 L ${65 + i * 170} 118 L ${150 + i * 170} 214`} />
        ))}
      </g>
      <g>
        {[[60, 420], [1480, 1860]].map(([wx0, wx1], k) => (
          <g key={k}>
            <rect x={wx0} y={244} width={wx1! - wx0!} height={128} fill="#2F3E52" stroke="#5A5248" strokeWidth={6} />
            {[1, 2, 3].map((i) => (
              <line key={i} x1={wx0! + ((wx1! - wx0!) / 4) * i} y1={244} x2={wx0! + ((wx1! - wx0!) / 4) * i} y2={372}
                stroke="#5A5248" strokeWidth={4} />
            ))}
            <line x1={wx0!} y1={308} x2={wx1!} y2={308} stroke="#5A5248" strokeWidth={4} />
          </g>
        ))}
      </g>
      {/* 天井クレーンの桁とフック */}
      <g>
        <rect x={-20} y={300} width={W + 40} height={26} fill="#3E3831" stroke="#575048" strokeWidth={5} />
        <rect x={1640} y={326} width={110} height={44} fill="#4A433C" stroke="#5F574E" strokeWidth={5} />
        <line x1={1695} y1={370} x2={1695} y2={500} stroke="#6A6258" strokeWidth={5} />
        <path d="M 1676 500 Q 1695 548 1714 500" stroke="#6A6258" strokeWidth={8} fill="none" />
      </g>

      {/* --- 中景左: 煉瓦の柱と、値段を書いた黒板 --- */}
      <g>
        <rect x={86} y={372} width={240} height={FL - 372} fill="#4A3A32" stroke={KRP.ink} strokeWidth={6} />
        <Bricks x={86} y={372} w={240} h={FL - 372} bw={56} bh={26} fill="#4A3A32" line="#2F2520" opacity={0.6} />
        <rect x={110} y={452} width={420} height={236} rx={8} fill="#2A332E" stroke="#6B6054" strokeWidth={7} />
        <text x={138} y={500} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>鋼のねだん</text>
        <polyline points="150,534 230,548 310,582 390,626 470,656" fill="none"
          stroke={KRP.white} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={`${clamp01(seg(f, 14, 34)) * 360} 360`} />
        {[150, 230, 310, 390, 470].map((px, i) => (
          <circle key={i} cx={px} cy={[534, 548, 582, 626, 656][i]!} r={7} fill={KRP.white} />
        ))}
        <polygon points="470,672 448,632 494,632" fill={KRP.white} opacity={clamp01(seg(f, 30, 42))} />
        <text x={500} y={668} fontFamily={FONT} fontWeight={800} fontSize={26} fill={KRP.white} opacity={clamp01(seg(f, 30, 44))}>下がる</text>
      </g>

      {/* --- 主役: 傾いた転炉 --- */}
      <g transform={`translate(820 772) rotate(${tilt})`}>
        {/* 胴 */}
        <path d="M -140 0 Q -164 -130 -120 -240 L -46 -380 L 60 -380 L 120 -240 Q 164 -130 140 0 Q 0 58 -140 0 Z"
          fill="#4D453C" stroke={KRP.ink} strokeWidth={8} />
        {/* 内張りの焼き物が赤熱して透けて見える */}
        <path d="M -104 -40 Q -118 -140 -86 -228 L -34 -340 L 44 -340 L 88 -228 Q 120 -140 106 -40 Q 0 8 -104 -40 Z"
          fill="#6A4A33" stroke="#8A5A32" strokeWidth={5} opacity={0.85} />
        {/* トラニオン環 */}
        <rect x={-172} y={-178} width={344} height={74} rx={10} fill="#5B5248" stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={-150} y1={-141} x2={150} y2={-141} n={11} r={7} color="#2F2A25" />
        <rect x={-232} y={-158} width={62} height={34} fill="#6A6158" stroke={KRP.ink} strokeWidth={6} />
        <rect x={170} y={-158} width={62} height={34} fill="#6A6158" stroke={KRP.ink} strokeWidth={6} />
        {/* 口のふち (白熱) */}
        <ellipse cx={7} cy={-380} rx={56} ry={17} fill={KRP.yellow} stroke={KRP.orange} strokeWidth={6} opacity={0.95} />
      </g>
      {/* 転炉を受ける台 (傾けない) */}
      <g>
        <rect x={520} y={598} width={74} height={282} fill="#4A433C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1016} y={598} width={74} height={282} fill="#4A433C" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={557} cy={620} r={30} fill="#6A6158" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1053} cy={620} r={30} fill="#6A6158" stroke={KRP.ink} strokeWidth={6} />
        <rect x={470} y={852} width={680} height={34} fill="#3C352F" stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* 口から噴く炎と火花 */}
      <g transform={`translate(${mx} ${my}) rotate(${tilt})`}>
        <Flame x={-30} y={0} s={1.5} f={f} phase={0} />
        <Flame x={24} y={-8} s={1.9} f={f} phase={2} />
        <Flame x={72} y={6} s={1.2} f={f} phase={4} />
      </g>
      <Embers x={mx + 40} y={my - 40} f={f} n={16} w={420} h={400} s={1.2} />
      <Smoke x={mx + 120} y={my - 220} f={f} n={5} r={30} rise={200} color="#6E6457" opacity={0.35} />

      {/* 注ぐ鋼の流れ */}
      <g opacity={tPour}>
        <path d={`M ${mx + 30} ${my + 10} Q ${mx + 230} ${my + 110} 1372 666`}
          stroke={KRP.orange} strokeWidth={34 * tPour} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={`M ${mx + 30} ${my + 10} Q ${mx + 230} ${my + 110} 1372 666`}
          stroke={KRP.yellow} strokeWidth={16 * tPour} fill="none" strokeLinecap="round" />
      </g>

      {/* --- 中景右: 大きな取鍋とその台車 --- */}
      <g>
        <path d="M 1228 644 L 1560 644 L 1520 836 L 1268 836 Z" fill="#4D453C" stroke={KRP.ink} strokeWidth={8} />
        <Rivets x1={1248} y1={690} x2={1540} y2={690} n={10} r={7} color="#2F2A25" />
        <ellipse cx={1394} cy={646} rx={166} ry={26} fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
        <ellipse cx={1394} cy={644} rx={120} ry={16} fill={KRP.yellow} opacity={glow} />
        <circle cx={1218} cy={700} r={26} fill="#6A6158" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1570} cy={700} r={26} fill="#6A6158" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1248} y={836} width={292} height={30} fill="#3C352F" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1296} cy={886} r={30} fill="#5B5248" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1492} cy={886} r={30} fill="#5B5248" stroke={KRP.ink} strokeWidth={6} />
      </g>
      <Embers x={1394} y={610} f={f} n={12} w={300} h={300} s={1.0} />
      <Smoke x={1394} y={596} f={f} n={5} r={26} rise={240} color="#7A6F60" opacity={0.3} />

      {/* --- 近景: 床のレール・鋼の塊・道具・見ている職人 --- */}
      <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill="#3A342E" />
      <g stroke="#554D44" strokeWidth={9}>
        <line x1={-20} y1={944} x2={1940} y2={938} />
        <line x1={-20} y1={1008} x2={1940} y2={1002} />
      </g>
      <g stroke="#4A433C" strokeWidth={8}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <line key={i} x1={-20 + i * 190} y1={928} x2={-20 + i * 190} y2={1024} />
        ))}
      </g>
      {/* 固まった鋼の塊 (インゴット) の山 */}
      <g transform="translate(1660 998)">
        {[0, 1, 2].map((i) => (
          <polygon key={i} points={`${-130 + i * 96},0 ${-40 + i * 96},0 ${-56 + i * 96},-96 ${-114 + i * 96},-96`}
            fill="#6E6A64" stroke={KRP.ink} strokeWidth={6} />
        ))}
        <polygon points="-82,-96 8,-96 -8,-192 -66,-192" fill="#7C7872" stroke={KRP.ink} strokeWidth={6} />
      </g>
      <TagPlate x={1440} y={786} text="鋼のかたまり" size={30} t={seg(f, 24, 38)} />
      {/* 長い棒を持って見ている職人 2人 (逆光のシルエット) */}
      <g>
        <Person x={430} y={1046} s={1.0} cloth="#38332E" clothDark="#272320" hair="none"
          face="normal" gaze={[0.85, -0.25]} lean={4} f={f} phase={3} />
        <FlatCap x={430} y={1046} s={1.0} f={f} phase={3} color="#2E2A26" />
        <line x1={372} y1={790} x2={700} y2={1012} stroke="#554D44" strokeWidth={10} />
        <Person x={246} y={1072} s={1.1} cloth="#403A34" clothDark="#2B2724" hair="none"
          face="normal" gaze={[0.85, -0.2]} f={f} phase={6} />
        <FlatCap x={246} y={1072} s={1.1} f={f} phase={6} color="#332F2B" />
      </g>
      {/* 近景の道具: 大きな鋏と手桶 */}
      <g transform="rotate(16 940 1030)">
        <line x1={928} y1={930} x2={952} y2={1072} stroke="#5E564C" strokeWidth={9} />
        <line x1={956} y1={930} x2={980} y2={1072} stroke="#5E564C" strokeWidth={9} />
        <circle cx={942} cy={1000} r={9} fill="#7A7268" stroke={KRP.ink} strokeWidth={3} />
      </g>
      <TagPlate x={1660} y={462} text="安く、どんどん" size={32} t={seg(f, 32, 46)} color={KRP.red} />
    </Frame>
  );
};

// ===== #46 鉄の骨組みは、石の壁の3分の1の重さです。 =====
// どこ: 朝の河岸の資材置き場。向こうに帆船の帆柱と煉瓦の倉庫。
// 演出: 大きな竿秤。左の皿に石の壁の塊ひとつ、右の皿に鉄の骨組みが3つ。
//       ちょうど釣り合っている = 鉄ひとつは石の3分の1。帳簿を持つ親方が確かめている。
// 動き: 竿がわずかに上下して止まり、札が順に出る。河には小舟が流れていく。
const Kb1SanbunNoIchi: React.FC<{ f: number }> = ({ f }) => {
  const GRD = 880;
  const wob = Math.sin(f / 19) * (1.4 + 3 * (1 - clamp01(seg(f, 0, 30))));
  const boatX = -200 + ((f * 2.6 + 900) % 2400);
  // 鉄の骨組みの小さな立方体 (3つ並ぶ)
  const Cube: React.FC<{ x: number; y: number; w: number; h: number; d: number }> =
    ({ x, y, w, h, d }) => (
      <g stroke={KRP.ink} strokeWidth={5} fill="none">
        <rect x={x} y={y - h} width={w} height={h} fill={C.steel} opacity={0.14} />
        <rect x={x} y={y - h} width={w} height={h} />
        <line x1={x} y1={y - h} x2={x + d} y2={y - h - d} />
        <line x1={x + w} y1={y - h} x2={x + w + d} y2={y - h - d} />
        <line x1={x + w} y1={y} x2={x + w + d} y2={y - d} />
        <line x1={x + d} y1={y - h - d} x2={x + w + d} y2={y - h - d} />
        <line x1={x + w + d} y1={y - h - d} x2={x + w + d} y2={y - d} />
        <line x1={x + w * 0.5} y1={y - h} x2={x + w * 0.5} y2={y} strokeWidth={4} />
        <line x1={x} y1={y - h * 0.5} x2={x + w} y2={y - h * 0.5} strokeWidth={4} />
      </g>
    );
  return (
    <Frame f={f} seed={518} bg={KRP.cream}>
      {/* --- 遠景: 朝の空、河、帆船、煉瓦の倉庫 --- */}
      <rect x={-20} y={-20} width={W + 40} height={700} fill="#EBD9BC" />
      <rect x={-20} y={330} width={W + 40} height={370} fill={C.skyHaze} opacity={0.55} />
      <Cloud cx={420} cy={132} s={1.1} opacity={0.75} />
      <Cloud cx={1480} cy={176} s={0.88} opacity={0.6} />
      <Birds x={1120} y={226} f={f} n={4} s={0.72} speed={0.45} />
      {/* 河 */}
      <rect x={-20} y={660} width={W + 40} height={120} fill={KRP.blueSoft} />
      <g stroke={KRP.blue} strokeWidth={4} opacity={0.75}>
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M -20 ${686 + i * 26} Q 300 ${676 + i * 26} 620 ${688 + i * 26} T 1260 ${682 + i * 26} T 1940 ${690 + i * 26}`} fill="none" />
        ))}
      </g>
      {/* 帆船の帆柱 (向こう岸) */}
      <g opacity={0.6}>
        {[1420, 1596, 1770].map((sx, i) => (
          <g key={i}>
            <line x1={sx} y1={660} x2={sx} y2={300 + i * 36} stroke={C.woodDark} strokeWidth={8} />
            <line x1={sx - 60} y1={360 + i * 36} x2={sx + 60} y2={360 + i * 36} stroke={C.woodDark} strokeWidth={6} />
            <line x1={sx - 44} y1={450 + i * 36} x2={sx + 44} y2={450 + i * 36} stroke={C.woodDark} strokeWidth={5} />
            <path d={`M ${sx} 660 L ${sx - 74} 648 L ${sx + 74} 648 Z`} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
      {/* 小舟 (流れていく) */}
      <g transform={`translate(${boatX} 0)`} opacity={0.8}>
        <path d="M 0 716 L 104 716 L 92 744 L 12 744 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <line x1={52} y1={716} x2={52} y2={656} stroke={C.woodDark} strokeWidth={5} />
        <path d="M 54 658 L 54 712 L 104 712 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 煉瓦の倉庫 (左の遠景) */}
      <g opacity={0.72}>
        <rect x={-30} y={408} width={520} height={252} fill={C.brickLight} stroke={KRP.ink} strokeWidth={6} />
        <Bricks x={-30} y={408} w={520} h={252} bw={50} bh={23} fill={C.brickLight} opacity={0.4} />
        <polygon points="-30,408 230,330 490,408" fill="#8E8475" stroke={KRP.ink} strokeWidth={6} />
        {[40, 180, 320].map((wx, i) => (
          <g key={i}>
            <rect x={wx} y={466} width={88} height={112} fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
            <rect x={wx - 10} y={452} width={108} height={16} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>

      {/* --- 中景: 地面 --- */}
      <rect x={-20} y={GRD - 100} width={W + 40} height={H - GRD + 120} fill="#CFC0A2" />
      <path d="M -20 780 L 420 772 L 900 790 L 1380 774 L 1940 788 L 1940 900 L -20 900 Z" fill="#BFAF90" stroke={KRP.ink} strokeWidth={5} />
      <g stroke="#A89878" strokeWidth={4} opacity={0.8}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={-20} y1={840 + i * 62} x2={1940} y2={826 + i * 62} />
        ))}
      </g>

      {/* --- 主役: 竿秤 --- */}
      {/* 柱 */}
      <rect x={926} y={268} width={68} height={GRD - 180} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.woodDark} strokeWidth={6}>
        <line x1={926} y1={400} x2={994} y2={400} />
        <line x1={926} y1={560} x2={994} y2={560} />
        <line x1={926} y1={720} x2={994} y2={720} />
      </g>
      <polygon points="960,236 1000,286 920,286" fill={C.steelDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 柱の足元の石の台 */}
      <rect x={874} y={700} width={172} height={44} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
      {/* 竿 */}
      <g transform={`rotate(${wob} 960 268)`}>
        <rect x={500} y={254} width={920} height={28} rx={8} fill={C.steel} stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={540} y1={268} x2={1380} y2={268} n={14} r={6} />
        {/* 吊り鎖 */}
        <g stroke={KRP.ink} strokeWidth={5}>
          <line x1={580} y1={282} x2={580} y2={580} />
          <line x1={1340} y1={282} x2={1340} y2={580} />
          <line x1={580} y1={580} x2={452} y2={624} />
          <line x1={580} y1={580} x2={708} y2={624} />
          <line x1={1340} y1={580} x2={1212} y2={624} />
          <line x1={1340} y1={580} x2={1468} y2={624} />
        </g>
        {/* 左の皿と石の壁の塊 */}
        <rect x={436} y={620} width={288} height={22} rx={6} fill={C.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={476} y={452} width={210} height={168} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
        <Stones x={476} y={452} w={210} h={168} bw={106} bh={56} opacity={0.65} />
        <polygon points="686,452 740,478 740,620 686,620" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 右の皿と鉄の骨組み3つ */}
        <rect x={1196} y={620} width={288} height={22} rx={6} fill={C.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <Cube x={1208} y={620} w={78} h={96} d={22} />
        <Cube x={1304} y={620} w={78} h={96} d={22} />
        <Cube x={1400} y={620} w={78} h={96} d={22} />
      </g>
      {/* つり合いの印 */}
      <g opacity={clamp01(seg(f, 24, 38))}>
        <line x1={960} y1={196} x2={960} y2={236} stroke={KRP.red} strokeWidth={6} />
        <TagPlate x={960} y={214} text="つり合い" size={28} t={seg(f, 24, 38)} color={KRP.red} />
      </g>

      {/* --- 札 --- */}
      <TagPlate x={580} y={700} text="石の壁 1つ" size={32} t={seg(f, 8, 22)} />
      <TagPlate x={1340} y={700} text="鉄の骨 3つ" size={32} t={seg(f, 14, 28)} />
      <TagPlate x={960} y={796} text="鉄は3分の1の重さ" size={38} t={seg(f, 30, 44)} color={KRP.red} />

      {/* --- 近景: 帳簿の親方・皿を押さえる職人・木箱・樽・藁・猫 --- */}
      <g>
        <Person x={250} y={1056} s={1.12} cloth="#55606E" clothDark="#3F4852" hair="none"
          face="smile" gaze={[0.8, -0.2]} f={f} phase={2} />
        <Bowler x={250} y={1056} s={1.12} f={f} phase={2} />
        {/* 帳簿 */}
        <g transform={`translate(330 ${878 + bobOf(f, 2)}) rotate(-10)`}>
          <rect x={0} y={0} width={126} height={92} rx={6} fill={C.paper} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.grayDark} strokeWidth={3}>
            {[0, 1, 2, 3].map((i) => (<line key={i} x1={14} y1={22 + i * 18} x2={112} y2={22 + i * 18} />))}
          </g>
        </g>
      </g>
      <Person x={1690} y={1042} s={1.06} cloth="#7E6A4E" clothDark="#62513A" hair="none"
        face="normal" gaze={[-0.85, -0.15]} lean={-6} f={f} phase={5} />
      <FlatCap x={1690} y={1042} s={1.06} f={f} phase={5} color="#5F5A50" />
      {/* 木箱と樽 */}
      <g transform="translate(60 1012)">
        <rect x={0} y={-108} width={176} height={108} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={-70} x2={176} y2={-70} stroke={C.woodDark} strokeWidth={5} />
        <line x1={0} y1={-108} x2={176} y2={0} stroke={C.woodDark} strokeWidth={5} />
      </g>
      <g transform="translate(1860 1036)">
        <path d="M -62 0 Q -78 -62 -62 -126 L 62 -126 Q 78 -62 62 0 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-72} y1={-42} x2={72} y2={-42} stroke={C.woodDark} strokeWidth={6} />
        <line x1={-72} y1={-88} x2={72} y2={-88} stroke={C.woodDark} strokeWidth={6} />
      </g>
      {/* 藁くず */}
      <g stroke="#B9A16A" strokeWidth={4}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={i} x1={520 + i * 140} y1={1062 - (i % 3) * 10} x2={566 + i * 140} y2={1050 - (i % 2) * 14} />
        ))}
      </g>
      {/* 猫 (木箱の上) */}
      <g transform="translate(140 902)">
        <path d="M -44 0 Q -50 -34 -24 -38 L 24 -38 Q 50 -34 44 0 Z" fill="#8A7E70" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-34} cy={-50} r={18} fill="#8A7E70" stroke={KRP.ink} strokeWidth={5} />
        <polygon points="-48,-62 -42,-82 -30,-66" fill="#8A7E70" stroke={KRP.ink} strokeWidth={4} />
        <polygon points="-26,-66 -18,-84 -12,-62" fill="#8A7E70" stroke={KRP.ink} strokeWidth={4} />
        <path d="M 44 -8 Q 70 -24 58 -48" stroke={KRP.ink} strokeWidth={5} fill="none" />
      </g>
    </Frame>
  );
};

// ===== #47 あるビルは、10階ぶんの鉄骨を15日で立てました。 =====
// どこ: 建ちあがる鉄骨の真下。歩道からあおむけに見上げた構図。
// 演出: 柱も梁も上へすぼまって消失点へ集まる。間から青空が抜け、10段ぶん数えられる。
//       手前右には日めくり。めくられた15枚が空へ舞い上がっていく。
// 動き: 段が下から上へ次々そろい、紙が回りながら飛び、見上げる職人の帽子がゆれる。
const Kb115nichi10kai: React.FC<{ f: number }> = ({ f }) => {
  const VPX = 960, VPY = 150;
  const BOT = 1080;
  // 下の x を、高さ y での見かけの x に直す (真下からのあおり)
  const px = (xb: number, y: number) => {
    const k = ((BOT - y) / (BOT - VPY)) * 0.9;
    return xb + (VPX - xb) * k;
  };
  const sc = (y: number) => 1 - ((BOT - y) / (BOT - VPY)) * 0.86;
  const COLB = [40, 420, 760, 1160, 1500, 1880];
  const LVL = [1012, 848, 712, 600, 508, 432, 370, 318, 276, 240];
  const grown = clamp01(seg(f, 4, 38));
  // 舞い上がる日めくり 15枚
  const sheets = Array.from({ length: 15 }, (_, i) => {
    const p = clamp01(seg(f, 6 + i * 2, 40 + i * 1.4));
    return {
      x: 1720 - p * (420 + rnd(i + 1) * 900),
      y: 820 - p * (420 + rnd(i + 7) * 540) + Math.sin((f + i * 9) / 11) * 14,
      r: -40 + rnd(i + 3) * 80 + f * (1.4 + rnd(i + 5) * 2),
      s: 0.5 + rnd(i + 11) * 0.5,
      o: p <= 0.02 ? 0 : 1 - p * 0.25,
      n: i + 1,
    };
  });
  return (
    <Frame f={f} seed={519} bg={KRP.cream}>
      {/* --- 遠景: 真上の空 --- */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.skyDay} />
      <rect x={-20} y={-20} width={W + 40} height={520} fill="#B8D6EA" opacity={0.6} />
      <Cloud cx={420} cy={300} s={1.3} opacity={0.75} />
      <Cloud cx={1520} cy={214} s={1.0} opacity={0.62} />
      <Cloud cx={1000} cy={560} s={0.8} opacity={0.45} />
      <Birds x={520} y={430} f={f} n={5} s={0.6} speed={0.5} spread={110} />
      {/* 消失点のあたりの光 */}
      <circle cx={VPX} cy={VPY} r={150} fill={KRP.white} opacity={0.35} />

      {/* --- 主役: 真下から見上げた鉄骨。柱が上へすぼまる --- */}
      <g>
        {/* 柱 */}
        {COLB.map((xb, i) => {
          const topY = lerp(BOT, 236, clamp01(grown * 1.3));
          const wB = 56, wT = 56 * sc(236);
          return (
            <g key={i}>
              <polygon
                points={`${xb - wB / 2},${BOT + 20} ${xb + wB / 2},${BOT + 20} ${px(xb, topY) + (wT / 2) * 1},${topY} ${px(xb, topY) - (wT / 2) * 1},${topY}`}
                fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
              <line x1={xb} y1={BOT + 20} x2={px(xb, topY)} y2={topY} stroke={C.steelDark} strokeWidth={4} opacity={0.6} />
            </g>
          );
        })}
        {/* 梁 (上の段ほど細く短く) */}
        {LVL.map((ly, i) => {
          const o = clamp01((grown - (i / LVL.length) * 0.82) * 7);
          if (o <= 0.02) return null;
          const x0 = px(COLB[0]!, ly), x1 = px(COLB[5]!, ly);
          const h = Math.max(7, 40 * sc(ly));
          return (
            <g key={i} opacity={o}>
              <rect x={x0 - 20 * sc(ly)} y={ly - h / 2} width={x1 - x0 + 40 * sc(ly)} height={h}
                fill={C.steel} stroke={KRP.ink} strokeWidth={Math.max(2.5, 6 * sc(ly))} />
              <rect x={x0 - 20 * sc(ly)} y={ly - h / 2} width={x1 - x0 + 40 * sc(ly)} height={h * 0.3}
                fill={C.steelDark} opacity={0.35} />
              {/* 継ぎ手 */}
              {COLB.map((xb, j) => (
                <rect key={j} x={px(xb, ly) - 26 * sc(ly)} y={ly - h * 0.78} width={52 * sc(ly)} height={h * 1.56}
                  fill={C.steelDark} stroke={KRP.ink} strokeWidth={Math.max(2, 4.5 * sc(ly))} />
              ))}
              {/* 段の番号は空のほうへ。丸札にして 1・4・7・10 階だけ読ませる */}
              {[0, 3, 6, 9].includes(i) && (
                <g>
                  <circle cx={px(COLB[0]!, ly) - 62} cy={ly} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                  <text x={px(COLB[0]!, ly) - 62} y={ly + 12} textAnchor="middle" fontFamily={FONT}
                    fontWeight={900} fontSize={i === 9 ? 30 : 34} fill={KRP.ink}>{i + 1}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* すじかい (下2マス) */}
        <g opacity={clamp01(seg(f, 18, 32))}>
          <line x1={px(COLB[1]!, 1012)} y1={1012} x2={px(COLB[2]!, 848)} y2={848}
            stroke={C.steel} strokeWidth={22} strokeLinecap="round" />
          <line x1={px(COLB[1]!, 1012)} y1={1012} x2={px(COLB[2]!, 848)} y2={848}
            stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
          <line x1={px(COLB[4]!, 1012)} y1={1012} x2={px(COLB[3]!, 848)} y2={848}
            stroke={C.steel} strokeWidth={22} strokeLinecap="round" />
          <line x1={px(COLB[4]!, 1012)} y1={1012} x2={px(COLB[3]!, 848)} y2={848}
            stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
        </g>
        {/* 上のほうで働く職人 (小さい) */}
        <Person x={px(860, 600)} y={600 - 20} s={0.3} cloth="#5F6E7C" clothDark="#47535E" hair="none"
          face="normal" gaze={[0.5, 0]} f={f} phase={3} />
        <FlatCap x={px(860, 600)} y={600 - 20} s={0.3} f={f} phase={3} color="#4A5660" />
        <Person x={px(1240, 712)} y={712 - 22} s={0.36} cloth="#7A6A52" clothDark="#5E5140" hair="none"
          face="normal" gaze={[-0.5, 0]} f={f} phase={6} />
        <FlatCap x={px(1240, 712)} y={712 - 22} s={0.36} f={f} phase={6} color="#5A5248" />
        {/* つり上げ中の梁と綱 */}
        <g>
          <line x1={VPX + 30} y1={VPY + 20} x2={px(1340, 470)} y2={470} stroke={KRP.ink} strokeWidth={4} />
          <rect x={px(1340, 470) - 86} y={462} width={172} height={16} fill={C.steel} stroke={KRP.ink} strokeWidth={4.5}
            transform={`rotate(${Math.sin(f / 16) * 6} ${px(1340, 470)} 470)`} />
        </g>
      </g>

      {/* --- 舞い上がる日めくり 15枚 --- */}
      <g>
        {sheets.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.r}) scale(${s.s})`} opacity={s.o}>
            <rect x={-46} y={-58} width={92} height={116} rx={5} fill={C.paper} stroke={KRP.ink} strokeWidth={4.5} />
            <line x1={-46} y1={-30} x2={46} y2={-30} stroke={KRP.red} strokeWidth={4} />
            <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink}>{s.n}</text>
          </g>
        ))}
      </g>

      {/* --- 近景右: 日めくり本体 (めくられて薄くなっている) --- */}
      <g>
        <rect x={1560} y={706} width={400} height={374} rx={10} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1596} y={760} width={330} height={272} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1596} y={760} width={330} height={56} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
        <text x={1761} y={804} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>日めくり</text>
        <text x={1761} y={950} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={KRP.ink}>15</text>
        <text x={1761} y={1006} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={KRP.grayDark}>日</text>
        <circle cx={1660} cy={736} r={11} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1862} cy={736} r={11} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* --- 札 --- */}
      <TagPlate x={318} y={262} text="10階ぶんの鉄骨" size={34} t={seg(f, 10, 24)} />
      <TagPlate x={330} y={352} text="たった15日" size={38} t={seg(f, 26, 40)} color={KRP.red} />

      {/* --- 近景左: 見上げている職人 (大きく、画面の下で切れる) --- */}
      <Person x={300} y={1180} s={1.38} cloth="#6B7A5E" clothDark="#52604A" hair="none"
        face="surprised" gaze={[0.25, -0.85]} lean={-6} f={f} phase={1} />
      <FlatCap x={300} y={1180} s={1.38} f={f} phase={1} color="#4E5A64" />
      {/* 職人の持つ巻いた図面 */}
      <g transform={`rotate(-28 520 ${930 + bobOf(f, 1)})`}>
        <rect x={468} y={880 + bobOf(f, 1)} width={120} height={38} rx={19} fill={C.paper} stroke={KRP.ink} strokeWidth={5} />
        <line x1={468} y1={899 + bobOf(f, 1)} x2={588} y2={899 + bobOf(f, 1)} stroke={KRP.grayDark} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// ===== #48 すると、壁は重さを持たなくてよくなります。 =====
// どこ: 仕上げ中のビルの正面。真ん中の1マスだけ壁がまだ無く、中の鉄柱が丸見え。
// 演出: 赤い荷重の矢印は鉄柱の中だけを流れ落ちる。壁の面には×。
//       いま吊り下げられている壁板が、梁の金物にぶら下がって待っている = 壁は「掛け物」。
// 動き: 矢印が上から下へ伸び、吊り板がゆれ、下では荷車が壁板を運んでくる。
const Kb1KabeOmosaNashi: React.FC<{ f: number }> = ({ f }) => {
  const ST = 900;                       // 歩道
  const COL = [330, 730, 1130, 1530];   // 鉄柱
  const FLR = [900, 744, 588, 432, 276];
  const tArr = seg(f, 10, 34);
  const sway = Math.sin(f / 17) * 9;
  return (
    <Frame f={f} seed={520} bg={KRP.cream}>
      {/* --- 遠景: 午後の空と、隣の低い建物 --- */}
      <rect x={-20} y={-20} width={W + 40} height={ST + 24} fill="#E3D8BE" />
      <rect x={-20} y={120} width={W + 40} height={520} fill={C.skyHaze} opacity={0.42} />
      <Cloud cx={140} cy={150} s={1.0} opacity={0.7} />
      <Cloud cx={1820} cy={206} s={0.85} opacity={0.6} />
      <Birds x={1760} y={330} f={f} n={3} s={0.7} speed={0.45} />
      <RowOfBuildings x0={-30} x1={300} base={ST} seed={41} minH={280} maxH={430} opacity={0.6} count={3} />
      <RowOfBuildings x0={1620} x1={1950} base={ST} seed={47} minH={300} maxH={450} opacity={0.6} count={3} />
      <Wires x0={-20} x1={300} y={420} n={2} sag={28} opacity={0.4} />

      {/* --- 主役: ビルの正面。左右の1マスは壁あり、真ん中は壁なし --- */}
      {/* 床板 (壁の無いマスから見える) */}
      <g>
        <rect x={700} y={228} width={460} height={ST - 228} fill="#564C44" />
        {FLR.map((fy, i) => (
          <g key={i}>
            <rect x={700} y={fy - 20} width={460} height={20} fill={C.concrete} stroke={KRP.ink} strokeWidth={5} />
            <rect x={700} y={fy - 36} width={460} height={16} fill={C.concreteDark} opacity={0.6} />
          </g>
        ))}
        {/* 中の明かりと、奥の仕切り */}
        {[744, 588, 432].map((fy, i) => (
          <g key={i}>
            <rect x={742} y={fy - 118} width={124} height={82} fill="#6E6256" stroke="#4A4038" strokeWidth={4} />
            <rect x={1000} y={fy - 118} width={124} height={82} fill="#6E6256" stroke="#4A4038" strokeWidth={4} />
          </g>
        ))}
      </g>
      {/* 鉄の骨 (柱と梁) */}
      <g>
        {COL.map((cx, i) => (<IBeamV key={i} x={cx} y1={238} y2={ST} w={54} />))}
        {FLR.map((fy, i) => (<IBeamH key={i} y={fy - 44} x1={290} x2={1570} h={34} />))}
      </g>
      {/* 左右のマス: うすい壁板 (焼き物の化粧) + 窓 */}
      {[[360, 700], [1160, 1500]].map(([wx0, wx1], k) => (
        <g key={k}>
          <rect x={wx0!} y={252} width={wx1! - wx0!} height={ST - 252} fill={C.terraLight} stroke={KRP.ink} strokeWidth={6} />
          <g stroke="#B9A98E" strokeWidth={3.5}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line key={i} x1={wx0!} y1={300 + i * 92} x2={wx1!} y2={300 + i * 92} />
            ))}
          </g>
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x={wx0! + 42} y={326 + r * 156} width={wx1! - wx0! - 84} height={104}
                fill={C.glassDeep} stroke={KRP.ink} strokeWidth={5} />
              <line x1={wx0! + (wx1! - wx0!) / 2} y1={326 + r * 156} x2={wx0! + (wx1! - wx0!) / 2} y2={430 + r * 156}
                stroke={KRP.ink} strokeWidth={4} />
              <polygon points={`${wx0! + 50},${422 + r * 156} ${wx0! + 130},${334 + r * 156} ${wx0! + 168},${334 + r * 156} ${wx0! + 88},${422 + r * 156}`}
                fill={KRP.white} opacity={0.3} />
            </g>
          ))}
        </g>
      ))}

      {/* 荷重の矢印は柱の中だけを流れる */}
      {COL.map((cx, i) => (
        <LoadArrow key={i} x={cx} y1={268} y2={ST - 30} w={26} t={tArr} opacity={0.9} />
      ))}
      {/* 壁には「重さが流れない」印 */}
      <XMark x={530} y={560} s={0.95} t={seg(f, 24, 38)} />
      <XMark x={1330} y={560} s={0.95} t={seg(f, 28, 42)} />
      <TagPlate x={530} y={672} text="壁は支えない" size={32} t={seg(f, 26, 40)} />
      <TagPlate x={1330} y={672} text="重さは柱の中" size={32} t={seg(f, 30, 44)} color={KRP.red} />

      {/* 吊り下げられて待っている壁板 (梁の金物にぶら下がる) */}
      <g transform={`rotate(${sway * 0.25} 930 400)`}>
        <line x1={930} y1={400} x2={898} y2={520} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={930} y1={400} x2={962} y2={520} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={858} y={520} width={204} height={148} fill={C.terraLight} stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#B9A98E" strokeWidth={4}>
          {[0, 1, 2].map((i) => (<line key={i} x1={858} y1={556 + i * 38} x2={1062} y2={556 + i * 38} />))}
        </g>
        {/* 板の厚み (うすい) */}
        <polygon points="1062,520 1086,532 1086,680 1062,668" fill="#C6B69A" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={930} cy={398} r={12} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={940} y={722} text="壁は、ぶら下げるだけ" size={30} t={seg(f, 34, 48)} />

      {/* --- 近景: 歩道・壁板を運ぶ荷車・職人・街灯・犬 --- */}
      <rect x={-20} y={ST} width={W + 40} height={H - ST + 20} fill="#C9BCA4" />
      <g stroke="#A89A80" strokeWidth={4}>
        {[0, 1, 2].map((i) => (<line key={i} x1={-20} y1={ST + 44 + i * 58} x2={1940} y2={ST + 32 + i * 58} />))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (<line key={i} x1={-20 + i * 210} y1={ST} x2={-40 + i * 232} y2={H} />))}
      </g>
      <GasLamp x={132} y={ST + 30} s={1.25} f={f} lit={false} />
      {/* 壁板を積んだ荷車 */}
      <g transform="translate(1480 1012)">
        <rect x={-190} y={-14} width={400} height={28} fill={C.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`rotate(${-7 + i * 1.5} ${-130 + i * 86} -20)`}>
            <rect x={-170 + i * 86} y={-150} width={74} height={136} fill={C.terraLight} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        <circle cx={-120} cy={54} r={42} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={150} cy={54} r={42} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-190} y1={0} x2={-290} y2={-26} stroke={KRP.ink} strokeWidth={7} />
      </g>
      <Person x={660} y={1062} s={1.08} cloth="#5C6A58" clothDark="#45513F" hair="none"
        face="normal" gaze={[0.3, -0.7]} lean={-4} f={f} phase={2} />
      <FlatCap x={660} y={1062} s={1.08} f={f} phase={2} color="#50584E" />
      <Person x={1018} y={1074} s={1.02} cloth="#7A5F48" clothDark="#5E4836" hair="none"
        face="smile" gaze={[-0.3, -0.7]} f={f} phase={6} />
      <Bowler x={1018} y={1074} s={1.02} f={f} phase={6} />
      {/* 犬 */}
      <g transform="translate(300 1040)">
        <path d="M -56 0 Q -62 -46 -30 -50 L 34 -50 Q 64 -46 56 0 Z" fill="#9A8B74" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={56} cy={-62} r={22} fill="#9A8B74" stroke={KRP.ink} strokeWidth={5} />
        <polygon points="40,-76 36,-104 58,-84" fill="#86785F" stroke={KRP.ink} strokeWidth={4} />
        <path d="M -56 -16 Q -86 -34 -74 -58" stroke={KRP.ink} strokeWidth={5} fill="none" />
      </g>
    </Frame>
  );
};

// ===== #49 壁は、ただの皮になりました。ガラスでも済みます。 =====
// どこ: 通りの向かいから見上げた、ガラスばかりの正面。白い焼き物の細い枠だけが残る。
// 演出: 面のほとんどがガラス。上のほうの窓には雲が、下のほうの窓には向かいの煉瓦の
//       建物と荷馬車が映りこむ。右端で角を見せ、皮の薄さを矢印で指す。
// 動き: 映りこんだ雲が流れ、窓拭きの職人が足場でゆれ、鳩が庇に並ぶ。
const Kb1KawaGlass: React.FC<{ f: number }> = ({ f }) => {
  const ST = 920;
  const BAYS = [[250, 640], [770, 1160], [1290, 1680]];  // 出窓 3列
  const ROW = [236, 368, 500, 632, 764];                  // 窓の段
  const drift = (f * 0.5) % 200;
  const swing = Math.sin(f / 15) * 10;
  return (
    <Frame f={f} seed={521} bg={KRP.cream}>
      <defs>
        <clipPath id="kb1c49">
          <rect x={180} y={200} width={1560} height={ST - 200} />
        </clipPath>
      </defs>
      {/* --- 遠景: 明るい空。建物の上に少しだけ見える --- */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.skyDay} />
      <Cloud cx={100} cy={110} s={1.1} opacity={0.85} />
      <Cloud cx={1860} cy={150} s={0.9} opacity={0.7} />
      <Birds x={960} y={128} f={f} n={4} s={0.62} speed={0.5} />

      {/* --- 主役: ガラスの面 --- */}
      {/* 下地 (白い焼き物の枠) */}
      <rect x={180} y={200} width={1560} height={ST - 200} fill="#EFE7D8" stroke={KRP.ink} strokeWidth={7} />
      {/* 横の帯 (各階の胴差し) */}
      <g>
        {ROW.map((ry, i) => (
          <g key={i}>
            <rect x={180} y={ry + 96} width={1560} height={36} fill="#E2D8C4" stroke={KRP.ink} strokeWidth={5} />
            <line x1={180} y1={ry + 108} x2={1740} y2={ry + 108} stroke="#C8BCA4" strokeWidth={4} />
          </g>
        ))}
      </g>
      {/* 出窓3列 (前へ張り出す) + ガラス */}
      <g clipPath="url(#kb1c49)">
        {BAYS.map(([bx0, bx1], k) => (
          <g key={k}>
            {/* 張り出しの側面 (影側) */}
            <polygon points={`${bx0! - 34},224 ${bx0!},200 ${bx0!},${ST} ${bx0! - 34},${ST}`}
              fill="#D6CBB4" stroke={KRP.ink} strokeWidth={5} />
            <polygon points={`${bx1!},200 ${bx1! + 34},224 ${bx1! + 34},${ST} ${bx1!},${ST}`}
              fill="#C9BDA4" stroke={KRP.ink} strokeWidth={5} />
            {ROW.map((ry, i) => (
              <g key={i}>
                {/* 大きな一枚ガラス + 両わきの開き窓 */}
                <rect x={bx0! + 14} y={ry} width={bx1! - bx0! - 28} height={96}
                  fill={i < 2 ? C.glass : C.glassDeep} stroke={KRP.ink} strokeWidth={5} />
                <line x1={bx0! + 96} y1={ry} x2={bx0! + 96} y2={ry + 96} stroke={KRP.ink} strokeWidth={4.5} />
                <line x1={bx1! - 96} y1={ry} x2={bx1! - 96} y2={ry + 96} stroke={KRP.ink} strokeWidth={4.5} />
                {/* 上の段は雲が、下の段は向かいの煉瓦の街が映る */}
                {i < 2 ? (
                  <g opacity={0.72}>
                    <ellipse cx={bx0! + 150 + ((drift + k * 70 + i * 40) % (bx1! - bx0!))} cy={ry + 34} rx={74} ry={22} fill={KRP.white} />
                    <ellipse cx={bx0! + 110 + ((drift + k * 70 + i * 40) % (bx1! - bx0!))} cy={ry + 50} rx={48} ry={16} fill={KRP.white} />
                  </g>
                ) : (
                  <g opacity={0.45}>
                    {/* 向かいの煉瓦の街なみが、ひと続きの影になって映る */}
                    <path
                      d={`M ${bx0! + 14} ${ry + 96} L ${bx0! + 14} ${ry + 58} L ${bx0! + 70} ${ry + 58}
                          L ${bx0! + 70} ${ry + 34} L ${bx0! + 148} ${ry + 34} L ${bx0! + 148} ${ry + 62}
                          L ${bx0! + 214} ${ry + 62} L ${bx0! + 214} ${ry + 28} L ${bx0! + 286} ${ry + 28}
                          L ${bx0! + 286} ${ry + 56} L ${bx0! + 362} ${ry + 56} L ${bx0! + 362} ${ry + 96} Z`}
                      fill={C.brick} />
                    <g fill={C.brickDark} opacity={0.8}>
                      {[0, 1, 2, 3, 4, 5].map((j) => (
                        <rect key={j} x={bx0! + 36 + j * 58} y={ry + 72} width={26} height={24} />
                      ))}
                    </g>
                  </g>
                )}
                {/* 斜めのハイライト */}
                <polygon points={`${bx0! + 30},${ry + 92} ${bx0! + 118},${ry + 4} ${bx0! + 168},${ry + 4} ${bx0! + 80},${ry + 92}`}
                  fill={KRP.white} opacity={0.34} />
              </g>
            ))}
          </g>
        ))}
        {/* 出窓と出窓のあいだ (引っこんだ面) にも窓 */}
        {[[654, 756], [1174, 1276]].map(([ix0, ix1], k) => (
          <g key={k}>
            <rect x={ix0!} y={200} width={ix1! - ix0!} height={ST - 200} fill="#DCD2BC" stroke={KRP.ink} strokeWidth={5} />
            {ROW.map((ry, i) => (
              <rect key={i} x={ix0! + 16} y={ry + 8} width={ix1! - ix0! - 32} height={80}
                fill={C.glassDeep} stroke={KRP.ink} strokeWidth={4.5} />
            ))}
          </g>
        ))}
      </g>
      {/* 庇と、並んだ鳩 */}
      <g>
        <rect x={160} y={200} width={1600} height={34} fill="#E2D8C4" stroke={KRP.ink} strokeWidth={6} />
        {[420, 470, 1040, 1092, 1500].map((px2, i) => (
          <g key={i} transform={`translate(${px2} ${196 + Math.sin((f + i * 23) / 21) * 2})`}>
            <ellipse cx={0} cy={-14} rx={20} ry={13} fill="#9FA8B0" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={14} cy={-28} r={9} fill="#9FA8B0" stroke={KRP.ink} strokeWidth={3.5} />
            <polygon points="22,-30 32,-27 22,-24" fill={C.brass} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
      </g>

      {/* 窓拭きの職人 (つり足場) */}
      <g transform={`rotate(${swing * 0.3} 940 236)`}>
        <line x1={880} y1={236} x2={880} y2={560} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1040} y1={236} x2={1040} y2={560} stroke={KRP.ink} strokeWidth={5} />
        <rect x={846} y={560} width={228} height={20} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <Person x={960} y={560} s={0.72} cloth="#6B7A8A" clothDark="#515E6B" hair="none"
          face="smile" gaze={[0.3, -0.3]} f={f} phase={4} />
        <FlatCap x={960} y={560} s={0.72} f={f} phase={4} color="#55606A" />
        <g transform={`translate(1032 ${452 + bobOf(f, 4)})`}>
          <rect x={-22} y={0} width={44} height={40} fill={C.steel} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -22 2 Q 0 -22 22 2" stroke={KRP.ink} strokeWidth={4} fill="none" />
        </g>
      </g>

      {/* 右端: 角を見せて「皮の薄さ」を指す */}
      <g>
        <polygon points={`1740,200 1800,232 1800,${ST} 1740,${ST}`} fill="#C3B79E" stroke={KRP.ink} strokeWidth={6} />
        <polygon points={`1740,244 1762,256 1762,${ST - 40} 1740,${ST - 40}`} fill={C.glassDeep} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <Arrow x={1736} y={398} s={0.85} rot={180} t={seg(f, 26, 40)} />
      <TagPlate x={1746} y={320} text="皮はこれだけ" size={28} t={seg(f, 26, 40)} color={KRP.red} />

      {/* --- 札 --- */}
      <TagPlate x={300} y={790} text="壁は、ただの皮" size={34} t={seg(f, 8, 22)} />
      <TagPlate x={1310} y={788} text="ガラスで済む" size={34} t={seg(f, 18, 32)} color={KRP.red} />

      {/* --- 近景: 日よけ・店先・歩道・通行人・街灯 --- */}
      <rect x={-20} y={ST} width={W + 40} height={H - ST + 20} fill="#C6B9A0" />
      <path d="M 180 920 L 1740 920 L 1700 1006 L 220 1006 Z" fill="#8E5C4A" stroke={KRP.ink} strokeWidth={7} />
      <g stroke="#6E4638" strokeWidth={6}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line key={i} x1={260 + i * 170} y1={920} x2={252 + i * 166} y2={1006} />
        ))}
      </g>
      <g stroke="#A89A80" strokeWidth={4}>
        {[0, 1].map((i) => (<line key={i} x1={-20} y1={1030 + i * 30} x2={1940} y2={1022 + i * 30} />))}
      </g>
      <GasLamp x={96} y={1046} s={1.5} f={f} lit={false} />
      {/* 立て看板と、見上げる親子 */}
      <g transform="translate(300 1066)">
        <polygon points="-74,0 -10,-150 10,-150 -54,0" fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="74,0 10,-150 -10,-150 54,0" fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-66} y={-144} width={132} height={104} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5}
          transform="rotate(-6)" />
        <text x={-2} y={-84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
          fill={KRP.ink} transform="rotate(-6)">貸室</text>
      </g>
      <Person x={520} y={1074} s={1.06} cloth="#6E5F7C" clothDark="#564A62" hair="none"
        face="surprised" gaze={[0.35, -0.85]} lean={-6} f={f} phase={5} />
      <Bowler x={520} y={1074} s={1.06} f={f} phase={5} color="#4A3F34" />
      <Person x={636} y={1078} s={0.74} cloth="#C27A5E" clothDark="#9E5C44" hair="cap"
        face="smile" gaze={[0.2, -0.9]} lean={-8} f={f} phase={9} />
      <Person x={1836} y={1070} s={1.1} cloth="#5A6672" clothDark="#434E58" hair="none"
        face="surprised" gaze={[-0.4, -0.8]} lean={-5} f={f} phase={3} />
      <TopHat x={1836} y={1070} s={1.1} f={f} phase={3} />
      <Person x={1668} y={1078} s={1.04} cloth="#8A6A58" clothDark="#6A5040" hair="none"
        face="smile" gaze={[-0.5, -0.7]} f={f} phase={7} />
      <Bowler x={1668} y={1078} s={1.04} f={f} phase={7} />
    </Frame>
  );
};

// ===== #50 ただし、鉄には弱点があります。火です。 =====
// どこ: 夜の鍛冶場。奥に炉、天井に太い梁、壁には鋏や蹄鉄がずらり。
// 演出: 炉で真っ赤になった鉄の棒が、金床の上でぐにゃりと曲がる。
//       「火」の札を炉のそばに置き、曲がった棒に矢印で寄せる。
// 動き: 炉の火と火花がゆれ、弟子がふいごを押し、焼き入れ桶から湯気が立つ。
const Kb1TetsuNoJakutenHi: React.FC<{ f: number }> = ({ f }) => {
  const FL = 892;
  const heat = 0.6 + 0.3 * Math.sin(f / 6);
  const bel = Math.sin(f / 14) * 14;   // ふいごの動き
  return (
    <Frame f={f} seed={522} bg="#2A2521" dark>
      <defs>
        <radialGradient id="kb1g50" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={KRP.yellow} stopOpacity={0.5} />
          <stop offset="100%" stopColor={KRP.orange} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#2A2521" />
      <ellipse cx={1420} cy={640} rx={700} ry={460} fill="url(#kb1g50)" />
      <ellipse cx={780} cy={740} rx={420} ry={260} fill="url(#kb1g50)" opacity={0.8} />

      {/* --- 遠景: 小屋組の梁と、板壁 --- */}
      <rect x={-20} y={200} width={W + 40} height={FL - 200} fill="#3B322B" />
      <g stroke="#4E4339" strokeWidth={4} opacity={0.8}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <line key={i} x1={-20 + i * 170} y1={200} x2={-20 + i * 170} y2={FL} />
        ))}
      </g>
      <g>
        <rect x={-20} y={118} width={W + 40} height={46} fill="#4A3E34" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-20} y={196} width={W + 40} height={34} fill="#413629" stroke={KRP.ink} strokeWidth={5} />
        {[120, 520, 960, 1400, 1800].map((bx, i) => (
          <rect key={i} x={bx - 22} y={164} width={44} height={34} fill="#56493D" stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
      {/* 夜の窓と月 */}
      <g>
        <rect x={112} y={262} width={238} height={178} fill="#27354A" stroke="#5B4F43" strokeWidth={7} />
        <line x1={231} y1={262} x2={231} y2={440} stroke="#5B4F43" strokeWidth={5} />
        <line x1={112} y1={350} x2={350} y2={350} stroke="#5B4F43" strokeWidth={5} />
        <circle cx={176} cy={312} r={26} fill="#E8E2CE" opacity={0.85} />
      </g>
      {/* 壁に掛かった道具: 鋏・槌・蹄鉄 */}
      <g>
        {[430, 520, 610].map((tx, i) => (
          <g key={i}>
            <line x1={tx} y1={284} x2={tx - 10} y2={440} stroke="#7A6B59" strokeWidth={9} />
            <line x1={tx + 20} y1={284} x2={tx + 30} y2={440} stroke="#7A6B59" strokeWidth={9} />
            <circle cx={tx + 10} cy={286} r={10} fill="#8D7E6A" stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
        {[720, 820].map((hx, i) => (
          <g key={i}>
            <line x1={hx} y1={286} x2={hx} y2={420} stroke="#6E5F4C" strokeWidth={11} />
            <rect x={hx - 36} y={262} width={72} height={34} rx={6} fill="#8A8278" stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {[920, 1000, 1080].map((sx, i) => (
          <path key={i} d={`M ${sx - 28} ${330 + i * 6} A 30 30 0 1 1 ${sx + 28} ${330 + i * 6}`}
            stroke="#8A8278" strokeWidth={13} fill="none" />
        ))}
      </g>

      {/* --- 中景右: 炉と煙突のフード --- */}
      <g>
        <polygon points="1104,290 1676,290 1600,596 1180,596" fill="#4A4038" stroke={KRP.ink} strokeWidth={7} />
        <rect x={1310} y={118} width={160} height={180} fill="#3E342C" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1150} y={596} width={480} height={296} fill="#5A4034" stroke={KRP.ink} strokeWidth={7} />
        <Bricks x={1150} y={596} w={480} h={296} bw={56} bh={26} fill="#5A4034" line="#3A2620" opacity={0.6} />
        {/* 炭の寝床 */}
        <ellipse cx={1390} cy={608} rx={196} ry={44} fill="#2E2520" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={1390} cy={604} rx={156} ry={32} fill={KRP.orange} opacity={0.95} />
        <ellipse cx={1390} cy={600} rx={104} ry={20} fill={KRP.yellow} opacity={heat} />
        <Flame x={1316} y={596} s={1.3} f={f} phase={0} />
        <Flame x={1400} y={588} s={1.7} f={f} phase={2} />
        <Flame x={1478} y={598} s={1.1} f={f} phase={4} />
        <Embers x={1390} y={560} f={f} n={14} w={320} h={320} s={1.1} />
        <Smoke x={1390} y={520} f={f} n={5} r={26} rise={230} color="#6B6054" opacity={0.3} />
      </g>
      {/* ふいご (弟子が押す) */}
      <g>
        <path d={`M 1664 ${640 + bel} L 1804 ${600 + bel} L 1804 ${760 - bel} L 1664 ${726 - bel} Z`}
          fill="#7A5C42" stroke={KRP.ink} strokeWidth={7} />
        <line x1={1664} y1={684} x2={1606} y2={668} stroke="#4A4038" strokeWidth={16} />
        <line x1={1804} y1={700 + bel} x2={1792} y2={820} stroke={C.woodDark} strokeWidth={14} />
        <Person x={1796} y={FL + 20} s={0.92} cloth="#5A4C3E" clothDark="#43382D" hair="none"
          face="normal" gaze={[-0.4, -0.3]} lean={6} f={f} phase={5} />
        <FlatCap x={1796} y={FL + 20} s={0.92} f={f} phase={5} color="#473C32" />
      </g>
      <TagPlate x={1390} y={332} text="火" size={44} t={seg(f, 6, 20)} color={KRP.red} />

      {/* --- 主役: 金床の上で、ぐにゃりと曲がった赤い鉄の棒 --- */}
      <g>
        {/* 切り株の台 */}
        <rect x={624} y={792} width={212} height={100} fill={C.woodDark} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={730} cy={792} rx={106} ry={22} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 金床 */}
        <path d="M 586 760 L 880 760 L 848 798 L 790 798 L 790 812 L 676 812 L 676 798 L 618 798 Z"
          fill="#5E5A54" stroke={KRP.ink} strokeWidth={7} />
        <path d="M 880 760 L 946 772 L 900 790 L 848 798 Z" fill="#6E6A64" stroke={KRP.ink} strokeWidth={6} />
        {/* 赤熱して曲がった鉄の棒 (金床の面に乗っている) */}
        {(() => {
          const d = "M 566 738 Q 650 732 694 756 Q 742 782 800 756 Q 850 734 906 740";
          return (
            <g>
              <path d={d} stroke={KRP.ink} strokeWidth={42} fill="none" strokeLinecap="round" />
              <path d={d} stroke={C.steelHot} strokeWidth={34} fill="none" strokeLinecap="round" />
              <path d={d} stroke={KRP.orange} strokeWidth={24} fill="none" strokeLinecap="round" opacity={0.96} />
              <path d={d} stroke={KRP.yellow} strokeWidth={13} fill="none" strokeLinecap="round" opacity={heat + 0.2} />
              <path d={d} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={heat * 0.85} />
            </g>
          );
        })()}
        <Embers x={730} y={726} f={f} n={12} w={300} h={240} s={0.95} />
        {/* 鋏 (棒の左端をつかむ) — 柄は鍛冶屋の手元へ */}
        <g>
          <line x1={430} y1={786} x2={566} y2={732} stroke="#6E6A64" strokeWidth={12} strokeLinecap="round" />
          <line x1={430} y1={812} x2={566} y2={752} stroke="#6E6A64" strokeWidth={12} strokeLinecap="round" />
          <circle cx={566} cy={742} r={13} fill="#8A8278" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 槌を振り上げた鍛冶屋 */}
        <Person x={352} y={FL + 28} s={1.24} cloth="#4A4036" clothDark="#342C24" hair="none"
          face="normal" gaze={[0.8, 0.2]} lean={8} f={f} phase={2} />
        <FlatCap x={352} y={FL + 28} s={1.24} f={f} phase={2} color="#3A322A" />
        {/* 腕 */}
        <line x1={400} y1={700} x2={520} y2={676} stroke="#4A4036" strokeWidth={26} strokeLinecap="round" />
        <circle cx={524} cy={674} r={17} fill="#E9D9BE" stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${-18 + Math.sin(f / 9) * 14} 524 674)`}>
          <line x1={524} y1={674} x2={746} y2={624} stroke={C.wood} strokeWidth={15} strokeLinecap="round" />
          <rect x={740} y={588} width={92} height={62} rx={8} fill="#8A847A" stroke={KRP.ink} strokeWidth={6} />
          <rect x={740} y={606} width={92} height={12} fill="#5E5852" opacity={0.7} />
        </g>
      </g>
      <Arrow x={962} y={742} s={0.95} rot={180} t={seg(f, 26, 40)} />
      <TagPlate x={1096} y={742} text="熱いと、ぐにゃり" size={32} t={seg(f, 26, 40)} color={KRP.red} />

      {/* --- 近景: 土間・焼き入れ桶・炭俵・鉄の棒束 --- */}
      <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill="#352D26" />
      <g stroke="#473D34" strokeWidth={5}>
        {[0, 1, 2].map((i) => (<line key={i} x1={-20} y1={FL + 38 + i * 56} x2={1940} y2={FL + 26 + i * 56} />))}
      </g>
      {/* 焼き入れ桶と湯気 */}
      <g transform="translate(1060 1072)">
        <path d="M -104 0 Q -118 -78 -102 -140 L 102 -140 Q 118 -78 104 0 Z" fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={0} cy={-140} rx={103} ry={22} fill="#2C3A4A" stroke={KRP.ink} strokeWidth={6} />
        <line x1={-114} y1={-54} x2={114} y2={-54} stroke={C.woodDark} strokeWidth={7} />
      </g>
      <Smoke x={1060} y={924} f={f} n={5} r={24} rise={170} color="#8E8A80" opacity={0.3} />
      {/* 炭俵 */}
      <g transform="translate(180 1062)">
        <path d="M -82 0 Q -96 -96 0 -104 Q 96 -96 82 0 Z" fill="#5A4C3C" stroke={KRP.ink} strokeWidth={7} />
        <g fill="#241F1B" stroke={KRP.ink} strokeWidth={3.5}>
          {[-44, -8, 30, 58].map((cx, i) => (<circle key={i} cx={cx} cy={-108 + (i % 2) * 12} r={17} />))}
        </g>
      </g>
      {/* 鉄の棒を立てた樽 (近景右) */}
      <g transform="translate(1440 1076)">
        {[-3, -1.2, 0.4, 2.1, 3.6].map((k, i) => (
          <line key={i} x1={k * 20} y1={-120} x2={k * 34 - 10} y2={-320 - rnd(i * 6.6) * 60}
            stroke="#6E6A64" strokeWidth={13} strokeLinecap="round" />
        ))}
        <path d="M -96 0 Q -108 -82 -92 -148 L 92 -148 Q 108 -82 96 0 Z" fill="#6B5541" stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={0} cy={-148} rx={93} ry={20} fill="#4C3B2C" stroke={KRP.ink} strokeWidth={6} />
        <line x1={-104} y1={-62} x2={104} y2={-62} stroke="#3E3026" strokeWidth={8} />
      </g>
    </Frame>
  );
};

// ===== #51 鉄は燃えません。熱でねじ曲がって、崩れます。 =====
// どこ: 燃えている建物の中。2層ぶんを横から切った断面。
// 演出: 真ん中の鉄柱だけが赤熱して S 字に座屈し、上の床が垂れ下がる。右端は既に崩れている。
// 動き: 座屈が進む/上階がたわむ/鋲が弾け飛ぶ/炎が揺れ煙が天井を走る。
// 奥: 窓の外に別の建物の火と夜空。中: 柱・梁・たわむ床。近: 焼け落ちた梁と瓦礫。
const Kb1Nejimagaru: React.FC<{ f: number }> = ({ f }) => {
  const FL = 876;    // 下の階の床面
  const UP = 522;    // 上の階の床面
  const CEIL = 250;  // 小屋梁
  const bend = 56 * easeOut(clamp01(seg(f, 8, 38)));
  const sag = 44 * easeOut(clamp01(seg(f, 14, 44)));
  const heat = 0.7 + 0.24 * Math.sin(f / 5.5);
  const HOT = 1180;  // 赤熱して曲がる柱
  // 座屈した柱の芯線 (S字)
  const spine =
    `M ${HOT} ${FL} C ${HOT - bend * 0.5} ${FL - 70}, ${HOT - bend} ${FL - 130}, ${HOT - bend * 0.95} ${FL - 182}` +
    ` C ${HOT - bend * 0.9} ${FL - 240}, ${HOT + bend * 1.15} ${FL - 268}, ${HOT + bend * 1.1} ${FL - 316}` +
    ` C ${HOT + bend * 1.05} ${FL - 344}, ${HOT} ${UP + 26}, ${HOT} ${UP}`;
  return (
    <Frame f={f} seed={523} dark bg="#3B1D13">
      <defs>
        <radialGradient id="kb1g51" cx="0.5" cy="0.78" r="0.8">
          <stop offset="0" stopColor="#FFB04A" stopOpacity="0.52" />
          <stop offset="0.5" stopColor="#D1551E" stopOpacity="0.26" />
          <stop offset="1" stopColor="#3B1D13" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- 奥: 窓の外。別の建物が燃えている夜 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#3B1D13" />
      {/* 奥の壁 (煉瓦) */}
      <rect x={-20} y={190} width={W + 40} height={FL - 190} fill="#4A2417" />
      <Bricks x={-20} y={190} w={W + 40} h={FL - 190} bw={56} bh={26}
        fill="#55291A" line="#36180F" opacity={0.85} lw={2} />
      {/* 窓の抜け (3つ) — 外の火が見える */}
      {[[240, 356], [1448, 356], [1700, 356]].map(([wx, wy], i) => (
        <g key={i}>
          <rect x={wx!} y={wy! - 170} width={190} height={250} fill="#1A1620" stroke={KRP.ink} strokeWidth={6} />
          <rect x={wx! + 8} y={wy! - 162} width={174} height={234} fill="#241C26" />
          {/* 外の町並みと火 */}
          <RowOfBuildings x0={wx! + 8} x1={wx! + 182} base={wy! + 72} seed={51 + i * 3}
            minH={56} maxH={120} fill="#191420" stroke="#191420" sw={0} opacity={1} count={4} />
          <Flame x={wx! + 54} y={wy! + 26} s={0.42} f={f} phase={i} />
          <Flame x={wx! + 132} y={wy! + 36} s={0.32} f={f} phase={i + 2} />
          <rect x={wx! + 86} y={wy! - 162} width={9} height={234} fill="#3A2C22" />
          <rect x={wx! + 8} y={wy! - 54} width={174} height={9} fill="#3A2C22" />
        </g>
      ))}
      {/* 火明かり */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="url(#kb1g51)" />

      {/* ---- 中: 小屋梁と上の階の床 ---- */}
      <IBeamH y={CEIL} x1={-20} x2={W + 20} h={34} color="#6E5A4C" dark="#3E3027" />
      {[400, 740, 1620].map((cx, i) => (
        <g key={i}>
          <IBeamV x={cx} y1={UP} y2={FL} w={46} color="#7A6454" dark="#3E3027" />
          <IBeamV x={cx} y1={CEIL} y2={UP} w={42} color="#7A6454" dark="#3E3027" />
          <rect x={cx - 46} y={UP - 30} width={92} height={34} fill="#6E5A4C" stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* たわんだ上の階の床 */}
      <path
        d={`M -20 ${UP} L 740 ${UP} Q ${HOT} ${UP + sag * 1.5} 1620 ${UP} L ${W + 20} ${UP}` +
          ` L ${W + 20} ${UP + 40} L 1620 ${UP + 40} Q ${HOT} ${UP + sag * 1.5 + 40} 740 ${UP + 40} L -20 ${UP + 40} Z`}
        fill="#5A4433" stroke={KRP.ink} strokeWidth={5} />
      {/* 床板の目 */}
      <g stroke="#3A2A1E" strokeWidth={3} opacity={0.7}>
        {Array.from({ length: 16 }, (_, i) => {
          const xx = -20 + i * 124;
          const dy = xx > 740 && xx < 1620 ? sag * 1.5 * (1 - Math.abs((xx - HOT) / 440) ** 2) : 0;
          return <line key={i} x1={xx} y1={UP + dy} x2={xx} y2={UP + dy + 40} />;
        })}
      </g>
      {/* たわみのひび */}
      <Crack d={`M ${HOT - 130} ${UP + 18} l 40 -14 l 34 16 l 46 -12 l 40 14`} t={seg(f, 26, 44)} color="#2A1A12" sw={6} />

      {/* ---- 赤熱して座屈した柱 ---- */}
      <path d={spine} fill="none" stroke={KRP.ink} strokeWidth={60} strokeLinecap="round" />
      <path d={spine} fill="none" stroke={C.steelHot} strokeWidth={50} strokeLinecap="round" opacity={0.96} />
      <path d={spine} fill="none" stroke={KRP.orange} strokeWidth={34} strokeLinecap="round" opacity={heat} />
      <path d={spine} fill="none" stroke={KRP.yellow} strokeWidth={18} strokeLinecap="round" opacity={heat * 0.95} />
      <path d={spine} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={heat * 0.8} />
      {/* 柱の足元の継手板 (まだ健在) */}
      <rect x={HOT - 48} y={FL - 44} width={96} height={48} fill="#7A6454" stroke={KRP.ink} strokeWidth={4.5} />
      <Rivets x1={HOT - 30} y1={FL - 20} x2={HOT + 30} y2={FL - 20} n={3} r={6} color="#3E3027" />
      {/* 熱のゆらぎ */}
      <g stroke={KRP.yellow} strokeWidth={4} fill="none" opacity={0.5}>
        {Array.from({ length: 4 }, (_, i) => {
          const yy = FL - 110 - i * 120;
          const w2 = 26 + i * 6;
          const ph = Math.sin(f / 7 + i) * 10;
          return <path key={i} d={`M ${HOT + 78 + ph} ${yy} q ${w2} -22 0 -44 q ${-w2} -22 0 -44`} />;
        })}
      </g>
      {/* 弾け飛ぶ鋲 */}
      {Array.from({ length: 7 }, (_, i) => {
        const p = ((f / 44 + i * 0.143) % 1 + 1) % 1;
        const a = -0.45 - rnd(i * 3.3) * 1.9;
        const rr = p * 250;
        const rx = HOT + 30 + Math.cos(a) * rr * 1.35;
        const ry = FL - 300 + Math.sin(a) * rr + p * p * 90;
        return (
          <g key={i} opacity={(1 - p) * 0.95}>
            <line x1={rx - Math.cos(a) * 30} y1={ry - Math.sin(a) * 30} x2={rx} y2={ry}
              stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" />
            <circle cx={rx} cy={ry} r={9} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
          </g>
        );
      })}

      {/* ---- 右端: 既に崩れた一画 ---- */}
      <g>
        {/* 折れて落ちた梁 */}
        <g transform={`translate(1760 ${FL - 60}) rotate(-38)`}>
          <rect x={-180} y={-18} width={360} height={36} fill="#5E4A3C" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-180} y={-5} width={360} height={10} fill="#33261E" opacity={0.7} />
        </g>
        <g transform={`translate(1546 ${FL - 34}) rotate(22)`}>
          <rect x={-140} y={-14} width={280} height={28} fill="#554336" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 瓦礫 */}
        {Array.from({ length: 13 }, (_, i) => {
          const bx = 1480 + rnd(i * 7.7) * 420;
          const by = FL - 8 - rnd(i * 2.9) * 44;
          return <rect key={i} x={bx} y={by} width={44} height={20} rx={3}
            transform={`rotate(${(rnd(i * 5.5) - 0.5) * 70} ${bx + 22} ${by + 10})`}
            fill="#5B2C1C" stroke={KRP.ink} strokeWidth={3} />;
        })}
        <XMark x={1762} y={700} s={0.86} t={seg(f, 30, 44)} />
      </g>

      {/* ---- 下の階の床と炎 ---- */}
      <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill="#2E1A12" />
      <PlankFloor y={FL} h={H - FL + 20} n={13} fill="#3A2317" line="#1F100A" />
      {/* 焼け残りの木箱 */}
      {[[150, 1.0], [560, 0.84], [900, 0.7]].map(([bx, bs], i) => (
        <g key={i} transform={`translate(${bx} ${FL}) scale(${bs})`}>
          <rect x={-74} y={-96} width={148} height={96} fill="#4A3425" stroke={KRP.ink} strokeWidth={5} />
          <line x1={-74} y1={-50} x2={74} y2={-50} stroke="#271A12" strokeWidth={4} />
          <line x1={0} y1={-96} x2={0} y2={0} stroke="#271A12" strokeWidth={4} />
        </g>
      ))}
      {/* 床を走る炎 */}
      {[80, 220, 360, 500, 640, 820, 980, 1360, 1520, 1700, 1850].map((fx, i) => (
        <Flame key={i} x={fx} y={FL + 6} s={0.68 + rnd(i * 4.1) * 0.52} f={f} phase={i * 1.7} />
      ))}
      <Flame x={HOT - 60} y={FL + 4} s={1.15} f={f} phase={3} />
      <Flame x={HOT + 70} y={FL + 4} s={1.0} f={f} phase={6} />
      <Embers x={960} y={FL - 40} f={f} n={26} w={1900} h={520} s={1.1} />
      {/* 天井を走る煙 */}
      <Smoke x={420} y={CEIL + 40} f={f} n={6} r={56} rise={-130} speed={0.5} drift={190}
        color="#1B1310" opacity={0.6} grow={2.1} />
      <Smoke x={1320} y={CEIL + 40} f={f} n={6} r={62} rise={-130} speed={0.45} drift={-210}
        color="#1B1310" opacity={0.6} grow={2.1} />

      {/* ---- 近景: 手前に焼け落ちた梁と瓦礫 ---- */}
      <g>
        <path d={`M -40 1080 L -40 940 L 420 1026 L 760 1080 Z`} fill="#1B100B" />
        <g transform="translate(300 1046) rotate(-14)">
          <rect x={-330} y={-26} width={660} height={52} fill="#2A1A11" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-330} y={-8} width={660} height={14} fill="#120A06" opacity={0.8} />
        </g>
        <Flame x={120} y={1010} s={1.5} f={f} phase={9} />
        <path d={`M ${W + 40} 1080 L ${W + 40} 952 L 1520 1040 L 1280 1080 Z`} fill="#1B100B" />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={430} y={300} text="鉄は燃えない" size={34} t={seg(f, 4, 18)}
        fill="#FDF6E8" color={KRP.ink} />
      <Arrow x={HOT - 110} y={FL - 250} s={1.0} rot={0} t={seg(f, 20, 32)} color={KRP.yellow} />
      <TagPlate x={720} y={FL - 250} text="熱でねじ曲がる" size={34} t={seg(f, 22, 36)}
        fill={KRP.yellow} color={KRP.ink} />
      <TagPlate x={1700} y={420} text="そして崩れる" size={32} t={seg(f, 32, 46)}
        fill={KRP.red} color={KRP.white} />
    </Frame>
  );
};

// ===== #52 1871年のシカゴの大火で、それが分かりました。 =====
// どこ: シカゴの川べり。向こう岸の町が一面燃えている夜。
// 演出: 遠景=燃える街と巨大な煙、中景=川面の照り返しと避難する橋、近景=荷を背負う人々。
// 動き: 炎と煙が揺れ、橋の上の人影が左へ流れ、火の粉が降る。
// #51 (建物の中) とは真逆の、引いた俯瞰の夜景にして絵を変える。
const Kb11871Taika: React.FC<{ f: number }> = ({ f }) => {
  const SKY = 560;    // 向こう岸の地面
  const WATER = 604;  // 水面の上端
  const BANK = 812;   // こちら岸の上端
  const t1 = clamp01(seg(f, 2, 20));
  return (
    <Frame f={f} seed={524} dark bg="#241820">
      <defs>
        <radialGradient id="kb1g52" cx="0.52" cy="0.52" r="0.72">
          <stop offset="0" stopColor="#FFC25C" stopOpacity="0.6" />
          <stop offset="0.45" stopColor="#E0641F" stopOpacity="0.34" />
          <stop offset="1" stopColor="#241820" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kb1g52w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A4A22" />
          <stop offset="1" stopColor="#2B1C1C" />
        </linearGradient>
      </defs>

      {/* ---- 空 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={WATER + 40} fill="#241820" />
      {/* 煙にかすむ月 */}
      <circle cx={1736} cy={176} r={48} fill="#C9B38A" opacity={0.42} />
      {/* 立ちのぼる巨大な煙 (空の大半) */}
      <Smoke x={620} y={SKY - 120} f={f} n={8} r={120} rise={520} speed={0.26} drift={160}
        color="#2E2228" opacity={0.58} grow={2.6} />
      <Smoke x={1180} y={SKY - 150} f={f} n={8} r={134} rise={560} speed={0.22} drift={-150}
        color="#332530" opacity={0.56} grow={2.7} />
      <Smoke x={300} y={SKY - 90} f={f} n={6} r={96} rise={460} speed={0.3} drift={210}
        color="#2A1F24" opacity={0.5} grow={2.4} />
      {/* 火明かり */}
      <ellipse cx={960} cy={SKY - 40} rx={1180} ry={520} fill="url(#kb1g52)" />

      {/* ---- 遠景: 燃える街 ---- */}
      {/* いちばん奥 (かすんだ屋根) */}
      <RowOfBuildings x0={-20} x1={W + 20} base={SKY - 54} seed={181} minH={64} maxH={190}
        fill="#3A2A2E" stroke="#3A2A2E" sw={0} windows={false} opacity={0.75} count={16} />
      {/* 手前の街区 (窓が光る) */}
      <RowOfBuildings x0={-20} x1={W + 20} base={SKY} seed={52} minH={110} maxH={286}
        fill="#2A1C20" stroke={KRP.ink} sw={4} windows winColor={KRP.yellow} opacity={1} count={13} />
      {/* 教会の尖塔 */}
      <g>
        <rect x={1392} y={SKY - 300} width={76} height={300} fill="#2A1C20" stroke={KRP.ink} strokeWidth={4.5} />
        <polygon points={`1430,${SKY - 404} 1388,${SKY - 296} 1472,${SKY - 296}`}
          fill="#2A1C20" stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={1414} y={SKY - 262} width={32} height={44} fill={KRP.yellow} opacity={0.85} />
        <Flame x={1430} y={SKY - 388} s={0.72} f={f} phase={2} />
      </g>
      {/* 屋根の上の炎 */}
      {[90, 230, 400, 560, 700, 860, 1010, 1170, 1300, 1560, 1700, 1860].map((fx, i) => (
        <Flame key={i} x={fx} y={SKY - 96 - rnd(i * 6.3) * 110} s={0.8 + rnd(i * 2.2) * 0.9}
          f={f} phase={i * 1.4} />
      ))}
      {/* 崩れかけた壁 */}
      <g transform={`translate(640 ${SKY}) rotate(-16)`} opacity={0.95}>
        <rect x={-54} y={-220} width={108} height={220} fill="#47262A" stroke={KRP.ink} strokeWidth={4} />
      </g>
      <Embers x={960} y={SKY - 150} f={f} n={34} w={1900} h={620} s={1.2} />

      {/* ---- 中景: 向こう岸の石垣と川 ---- */}
      <rect x={-20} y={SKY} width={W + 40} height={WATER - SKY} fill="#241A1E" />
      <Stones x={-20} y={SKY} w={W + 40} h={WATER - SKY} bw={118} bh={26}
        fill="#2E2126" line="#130D10" opacity={1} />
      <rect x={-20} y={WATER} width={W + 40} height={BANK - WATER + 6} fill="url(#kb1g52w)" />
      <rect x={-20} y={WATER} width={W + 40} height={10} fill="#C98A3E" opacity={0.75} />
      {/* 炎の真下に落ちる、縦に伸びた照り返し */}
      <g>
        {[90, 230, 400, 560, 700, 860, 1010, 1170, 1300, 1430, 1560, 1700, 1860].map((fx, i) => {
          const sway = Math.sin(f / 10 + i * 0.9) * 10;
          const wd = 26 + rnd(i * 3.1) * 30;
          return (
            <path key={i}
              d={`M ${fx - wd / 2} ${WATER} q ${sway} 60 ${-sway * 0.6} 120 q ${-sway} 50 ${sway * 0.4} ${BANK - WATER}` +
                ` l ${wd} 0 q ${-sway * 0.4} ${-(BANK - WATER)} ${sway} -50 q ${sway * 0.6} -60 ${-sway} -120 Z`}
              fill={i % 3 === 0 ? KRP.yellow : KRP.orange} opacity={0.26 + rnd(i * 1.7) * 0.22} />
          );
        })}
      </g>
      {/* さざ波 */}
      <g opacity={0.55}>
        {Array.from({ length: 18 }, (_, i) => {
          const yy = WATER + 16 + i * 11;
          const ph = Math.sin(f / 11 + i * 0.8) * 30;
          const wd = 120 + rnd(i * 3.1) * 420;
          const xx = 60 + rnd(i * 8.8) * 1600 + ph;
          return <rect key={i} x={xx} y={yy} width={wd} height={4} rx={2} fill="#F3D6A4" opacity={0.42} />;
        })}
      </g>
      {/* 係船杭と小舟 */}
      {[150, 1760].map((px2, i) => (
        <g key={i}>
          <rect x={px2} y={WATER - 16} width={16} height={74} fill="#1A1216" stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={px2 + 8} cy={WATER - 16} rx={13} ry={6} fill="#241A1E" stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      <g transform={`translate(${1640 + Math.sin(f / 23) * 14} ${WATER + 92})`}>
        <path d="M -82 0 Q -66 32 0 32 Q 66 32 82 0 Z" fill="#1A1216" stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-6} y={-74} width={11} height={74} fill="#1A1216" stroke={KRP.ink} strokeWidth={3} />
        <circle cx={-34} cy={-16} r={13} fill="#1A1216" stroke={KRP.ink} strokeWidth={3} />
        <circle cx={26} cy={-16} r={13} fill="#1A1216" stroke={KRP.ink} strokeWidth={3} />
      </g>

      {/* ---- 中景: 避難の橋 (向こう岸からこちら岸へ斜めに架かる) ---- */}
      {(() => {
        const AX = 1420, AY = WATER + 14;   // 向こう岸側のたもと
        const BX = -60, BY = BANK - 10;     // こちら岸側のたもと
        const px3 = (p: number) => AX + (BX - AX) * p;
        const py3 = (p: number) => AY + (BY - AY) * p;
        return (
          <g>
            {/* 橋脚 */}
            {[0.26, 0.56, 0.84].map((p, i) => (
              <rect key={i} x={px3(p) - 24} y={py3(p)} width={48} height={BANK + 40 - py3(p)}
                fill="#150F12" stroke={KRP.ink} strokeWidth={4} />
            ))}
            {/* 橋げた */}
            <polygon points={`${AX} ${AY} ${BX} ${BY} ${BX} ${BY + 34} ${AX} ${AY + 34}`}
              fill="#241A1C" stroke={KRP.ink} strokeWidth={5} />
            {/* トラス (上弦と斜材) */}
            <g stroke={KRP.ink} strokeWidth={4.5} fill="none">
              <line x1={AX} y1={AY - 86} x2={BX} y2={BY - 86} />
              {Array.from({ length: 15 }, (_, i) => {
                const p = i / 14;
                const p2 = (i + 1) / 14;
                return (
                  <g key={i}>
                    <line x1={px3(p)} y1={py3(p) - 86} x2={px3(p)} y2={py3(p)} />
                    {i < 14 && <line x1={px3(p)} y1={py3(p)} x2={px3(p2)} y2={py3(p2) - 86} />}
                  </g>
                );
              })}
            </g>
            {/* 橋のたもとの門柱 */}
            <rect x={AX - 10} y={AY - 124} width={44} height={160} fill="#241A1C" stroke={KRP.ink} strokeWidth={5} />
            {/* 逃げる人影の列 (こちら岸へ) */}
            {Array.from({ length: 17 }, (_, i) => {
              const p = (((f * 0.0024 + i / 17) % 1) + 1) % 1;
              const sc = 0.78 + p * 0.5;
              const sway = Math.sin((f + i * 9) / 9) * 2;
              const hh = 54;
              return (
                <g key={i} transform={`translate(${px3(p)} ${py3(p)}) scale(${sc})`} fill="#140D10">
                  <ellipse cx={0} cy={-hh - 13} rx={11} ry={13} />
                  <path d={`M -12 ${-hh} q 12 ${sway - 6} 24 0 l 3 ${hh} l -9 0 l -6 -26 l -6 26 l -9 0 Z`} />
                  {i % 4 === 0 && <rect x={-30} y={-hh - 16} width={22} height={20} rx={4} />}
                  {i % 5 === 2 && <ellipse cx={0} cy={-hh - 30} rx={20} ry={11} />}
                </g>
              );
            })}
            {/* 荷車 */}
            {(() => {
              const p = ((f * 0.0024 + 0.42) % 1 + 1) % 1;
              const sc = 0.78 + p * 0.5;
              return (
                <g transform={`translate(${px3(p)} ${py3(p)}) scale(${sc})`} fill="#140D10">
                  <rect x={-62} y={-48} width={124} height={36} rx={4} />
                  <rect x={-50} y={-70} width={94} height={24} rx={4} />
                  <circle cx={-34} cy={-6} r={15} /><circle cx={34} cy={-6} r={15} />
                  <path d="M -62 -40 l -42 -16" stroke="#140D10" strokeWidth={7} strokeLinecap="round" />
                </g>
              );
            })()}
          </g>
        );
      })()}

      {/* ---- 近景: こちら岸 ---- */}
      <rect x={-20} y={BANK} width={W + 40} height={H - BANK + 20} fill="#1E1518" />
      {/* 石積みの護岸 */}
      <Stones x={-20} y={BANK} w={W + 40} h={70} bw={126} bh={34} fill="#2C2126" line="#140E11" opacity={1} />
      {/* 玉石の地面 */}
      <g opacity={0.6}>
        {Array.from({ length: 70 }, (_, i) => (
          <ellipse key={i} cx={rnd(i * 9.1) * (W + 40) - 20} cy={BANK + 80 + rnd(i * 4.4) * 190}
            rx={16 + rnd(i * 2.2) * 12} ry={9 + rnd(i * 3.3) * 6}
            fill="#2A2024" stroke="#120C0F" strokeWidth={2} />
        ))}
      </g>
      {/* 逃げる人たち (手前) */}
      <g>
        <Person x={330} y={1058} s={1.12} f={f} phase={0} cloth="#4A3A42" clothDark="#2A1F25"
          hair="cap" face="worried" gaze={[0.4, -0.3]} lean={-5} />
        {/* 背負った荷 */}
        <g transform="translate(330 1058)">
          <rect x={-128} y={-250} width={104} height={92} rx={12} fill="#6B543C" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -128 -228 q -22 10 -18 40" stroke={KRP.ink} strokeWidth={5} fill="none" />
        </g>
        <Bowler x={330} y={1058} s={1.12} f={f} phase={0} color="#2A2228" />

        <Person x={496} y={1072} s={0.78} f={f} phase={2} cloth="#5E4A52" clothDark="#32242A"
          hair="none" face="worried" gaze={[0.5, -0.5]} lean={-3} />
        {/* 子どもの抱えたぬいぐるみ的な包み */}
        <rect x={476} y={898} width={46} height={40} rx={8} fill="#8A7050" stroke={KRP.ink} strokeWidth={4} />

        <Person x={1560} y={1066} s={1.06} f={f} phase={4} cloth="#3E3340" clothDark="#231C25"
          hair="cap" face="surprised" gaze={[-0.6, -0.5]} lean={4} />
        <FlatCap x={1560} y={1066} s={1.06} f={f} phase={4} color="#2E2630" />
        {/* 手押し車いっぱいの家財 */}
        <g transform="translate(1736 1040)">
          <rect x={-110} y={-96} width={220} height={74} rx={6} fill="#4C3B2C" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-86} y={-150} width={76} height={56} rx={5} fill="#6B543C" stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={6} y={-136} width={90} height={42} rx={5} fill="#5A4636" stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-56} cy={-10} r={28} fill="#2C2126" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-56} cy={-10} r={9} fill={KRP.ink} />
          <path d="M 110 -70 l 86 -26" stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        {/* 置き去られたトランクと犬 */}
        <g transform="translate(980 1046)">
          <rect x={-66} y={-54} width={132} height={54} rx={6} fill="#53402F" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-66} y={-30} width={132} height={9} fill="#2E2318" />
          <rect x={-14} y={-66} width={28} height={14} rx={6} fill="#2E2318" stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="translate(1180 1050)" fill="#1C1418" stroke={KRP.ink} strokeWidth={4}>
          <ellipse cx={0} cy={-26} rx={44} ry={22} />
          <circle cx={40} cy={-48} r={18} />
          <path d="M -44 -26 l -20 -22" fill="none" strokeLinecap="round" />
          <line x1={-24} y1={-6} x2={-24} y2={0} /><line x1={24} y1={-6} x2={24} y2={0} />
        </g>
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={352} y={268} text="1871年 シカゴ" size={36} t={t1} fill="#FDF6E8" color={KRP.ink} />
      <TagPlate x={1240} y={300} text="街ごと燃えた" size={34} t={seg(f, 14, 28)} fill={KRP.red} color={KRP.white} />
      <TagPlate x={1116} y={782} text="鉄も、火には勝てない" size={30} t={seg(f, 28, 44)}
        fill="#FDF6E8" color={KRP.ink} />
    </Frame>
  );
};

// ===== #53 そこで、鉄の柱を焼き物で包みます。 =====
// どこ: 建てかけのビルの床の上。右側は壁がまだ無く、空と下の街が見える昼。
// 演出: 主役の鉄柱に、焼き物のブロックが下から巻かれていく。上はまだ裸の鉄。
// 動き: 巻き上がりが伸びる/職人がブロックを差し込む/塵が舞う/下の街を鳥が横切る。
// 近景に断面の見えるブロックを置いて「中は空洞の焼き物」だと分かるようにする。
const Kb1TerracottaTsutsumu: React.FC<{ f: number }> = ({ f }) => {
  const FL = 886;    // 床
  const CEIL = 262;  // 上の梁
  const HX = 860;    // 主役の柱
  const wrapTop = FL - 44 - 268 * easeOut(clamp01(seg(f, 6, 38)));
  // 焼き物の「殻」1段 (煉瓦と区別するため、白茶色・大きめ・側面の返しつき)
  const Block: React.FC<{ x: number; y: number; w?: number; h?: number; off?: boolean }> =
    ({ x, y, w = 150, h = 48, off = false }) => (
      <g>
        {/* 左の返し (柱を回り込んでいる面) */}
        <path d={`M ${x - w / 2} ${y - h} l -26 13 l 0 ${h} l 26 -13 Z`}
          fill="#C8A782" stroke={KRP.ink} strokeWidth={4} />
        {/* 正面 */}
        <rect x={x - w / 2} y={y - h} width={w} height={h} rx={4}
          fill="#E8CFAC" stroke={KRP.ink} strokeWidth={4.5} />
        {/* 目地 */}
        <rect x={x - w / 2} y={y - 7} width={w} height={7} fill="#BE9B72" opacity={0.85} />
        {/* 釉薬のつや */}
        <rect x={x - w / 2 + 10} y={y - h + 8} width={w * 0.3} height={7} rx={3.5}
          fill={KRP.white} opacity={0.5} />
        <line x1={off ? x - w / 4 : x + w / 4} y1={y - h} x2={off ? x - w / 4 : x + w / 4} y2={y - 7}
          stroke="#BE9B72" strokeWidth={4} />
      </g>
    );
  return (
    <Frame f={f} seed={525} bg="#D9E4EC">
      {/* ---- 奥: 開いた側から見える空と、下の街 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={FL + 40} fill="#CFDDE8" />
      <Cloud cx={1560} cy={330} s={1.25} fill={KRP.white} opacity={0.95} />
      <Cloud cx={1250} cy={240} s={0.9} fill={KRP.white} opacity={0.8} />
      <Birds x={1380} y={400} f={f} n={4} s={0.9} speed={0.6} />
      {/* ずっと下に見える街 (低い位置の屋根) */}
      <RowOfBuildings x0={1110} x1={W + 20} base={FL - 10} seed={531} minH={70} maxH={180}
        fill="#8294A4" stroke="#4E6376" sw={3.5} opacity={0.62} count={8} />
      <RowOfBuildings x0={1110} x1={W + 20} base={FL + 4} seed={53} minH={36} maxH={120}
        fill="#6E8294" stroke="#3E5366" sw={4} windows winColor="#CFE0EA" opacity={0.9} count={10} />
      {/* 足場丸太と、下から荷を上げる滑車 */}
      <g>
        <rect x={1142} y={CEIL + 20} width={16} height={FL - CEIL - 20} fill="#A98A5E" stroke={KRP.ink} strokeWidth={4} />
        <rect x={1858} y={CEIL + 20} width={16} height={FL - CEIL - 20} fill="#A98A5E" stroke={KRP.ink} strokeWidth={4} />
        {[CEIL + 150, CEIL + 380].map((yy, i) => (
          <rect key={i} x={1142} y={yy} width={732} height={13} fill="#A98A5E" stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 突き出した腕木と滑車 */}
        <rect x={1540} y={CEIL + 40} width={330} height={20} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1596} cy={CEIL + 80} r={28} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1596} cy={CEIL + 80} r={8} fill={KRP.ink} />
        <line x1={1596} y1={CEIL + 108} x2={1596} y2={FL - 230 + Math.sin(f / 31) * 26}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 吊り上げ中のブロック箱 */}
        <g transform={`translate(1596 ${FL - 150 + Math.sin(f / 31) * 26})`}>
          <path d="M -84 -80 L 0 -42 L 84 -80" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-90} y={-80} width={180} height={104} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-74} y={-116} width={64} height={40} rx={4} fill="#E8CFAC" stroke={KRP.ink} strokeWidth={5} />
          <rect x={6} y={-116} width={64} height={40} rx={4} fill="#E8CFAC" stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>
      {/* 床の端の手すりロープ */}
      <g>
        {[1200, 1420, 1660].map((px4, i) => (
          <rect key={i} x={px4} y={FL - 150} width={14} height={150} fill={C.steelDark}
            stroke={KRP.ink} strokeWidth={4} />
        ))}
        <Wires x0={1150} x1={1874} y={FL - 128} n={2} sag={22} color={KRP.ink} opacity={0.75} />
      </g>

      {/* ---- 中: 天井の梁と、裸の鉄骨 ---- */}
      <rect x={-20} y={CEIL - 34} width={W + 40} height={34} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
      <IBeamH y={CEIL + 22} x1={-20} x2={W + 20} h={40} />
      {/* 奥の壁 (まだ素地の中空タイル。窓あなから空が見える) */}
      <rect x={-20} y={CEIL + 42} width={1140} height={FL - CEIL - 42} fill="#C6BCA8" />
      <g>
        {Array.from({ length: 11 }, (_, r) =>
          Array.from({ length: 10 }, (_, c) => {
            const bx = -20 + c * 118, by = CEIL + 48 + r * 56;
            if (by > FL - 50) return null;
            return <rect key={`${r}-${c}`} x={bx + (r % 2) * 26} y={by} width={112} height={50} rx={4}
              fill="#CFC6B2" stroke="#9A9180" strokeWidth={3.5} />;
          }))}
      </g>
      {/* 窓あな (2つ) */}
      {[[20, 404], [520, 404]].map(([wx, wy], i) => (
        <g key={i}>
          <rect x={wx!} y={wy!} width={186} height={300} fill="#CFE2EC" stroke={KRP.ink} strokeWidth={7} />
          <RowOfBuildings x0={wx! + 6} x1={wx! + 180} base={wy! + 294} seed={55 + i * 4}
            minH={40} maxH={130} fill="#8294A4" stroke="#4E6376" sw={3} opacity={0.75} count={5} />
          <line x1={wx!} y1={wy! + 150} x2={wx! + 186} y2={wy! + 150} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
        </g>
      ))}
      {/* 吊り下げた仮設の電球 */}
      <g>
        <path d={`M -20 ${CEIL + 56} Q 560 ${CEIL + 116} 1140 ${CEIL + 56}`} fill="none" stroke={KRP.ink} strokeWidth={4} />
        {[180, 460, 740, 1020].map((lx, i) => {
          const ly = CEIL + 56 + 60 * (1 - ((lx - 560) / 580) ** 2) * 0.8;
          return (
            <g key={i}>
              <line x1={lx} y1={ly} x2={lx} y2={ly + 44} stroke={KRP.ink} strokeWidth={3.5} />
              <circle cx={lx} cy={ly + 58} r={18} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
      </g>
      {/* 左: すでに包み終えた柱 */}
      <g>
        {Array.from({ length: 11 }, (_, i) => (
          <Block key={i} x={325} y={FL - i * 52} w={178} h={52} off={i % 2 === 0} />
        ))}
        <TagPlate x={325} y={322} text="できあがり" size={28} t={seg(f, 30, 44)} fill={KRP.white} />
      </g>
      {/* 立てかけた梯子と材木の山 */}
      <g>
        <g transform="translate(1215 0) rotate(7 0 0)">
          <rect x={0} y={CEIL + 120} width={13} height={FL - CEIL - 120} fill="#B5945E" stroke={KRP.ink} strokeWidth={4} />
          <rect x={92} y={CEIL + 120} width={13} height={FL - CEIL - 120} fill="#B5945E" stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={0} y={CEIL + 170 + i * 68} width={105} height={11} fill="#C9A86E" stroke={KRP.ink} strokeWidth={3.5} />
          ))}
        </g>
      </g>

      {/* ---- 主役: 下から巻かれていく柱 ---- */}
      <g>
        {/* 裸の鉄 */}
        <IBeamV x={HX} y1={CEIL + 42} y2={FL} w={112} color={C.steel} dark={C.steelDark} />
        <rect x={HX - 78} y={CEIL + 52} width={156} height={44} rx={4} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={HX - 54} y1={CEIL + 74} x2={HX + 54} y2={CEIL + 74} n={4} r={7} color="#5A5650" />
        {/* 巻かれた焼き物 (下から上へ) */}
        {Array.from({ length: 14 }, (_, i) => {
          const by = FL - i * 52;
          if (by - 52 < wrapTop) return null;
          return <Block key={i} x={HX} y={by} w={172} h={52} off={i % 2 === 0} />;
        })}
        {/* 境目 (ここまで包んだ) */}
        <line x1={HX - 110} y1={wrapTop + 8} x2={HX + 110} y2={wrapTop + 8}
          stroke={KRP.red} strokeWidth={5} strokeDasharray="16 12" opacity={0.85} />
        {/* 職人が次のブロックを差し込む */}
        <g transform={`translate(${HX + 236} ${wrapTop + 26 + Math.sin(f / 13) * 5})`}>
          <Block x={0} y={0} w={160} h={52} />
        </g>
        <Person x={HX + 374} y={FL} s={1.0} cloth={KRP.blue} clothDark={KRP.blueDeep} helmet
          face="normal" gaze={[-0.7, -0.2]} lean={-6} f={f} phase={1} />
        {/* 足場板 */}
        <rect x={HX + 150} y={FL - 2} width={430} height={22} fill={C.wood} stroke={KRP.ink} strokeWidth={4.5} />
      </g>

      {/* ---- 床 ---- */}
      <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill="#C3C7C4" />
      <g stroke="#A2A7A4" strokeWidth={4} opacity={0.9}>
        {[0, 1, 2].map((i) => (<line key={i} x1={-20} y1={FL + 46 + i * 60} x2={1940} y2={FL + 40 + i * 60} />))}
      </g>

      {/* ---- 近景: 断面の見えるブロック・モルタル桶・一輪車 ---- */}
      <g transform="translate(300 1046)">
        <rect x={-150} y={-120} width={300} height={120} rx={7} fill="#E8CFAC" stroke={KRP.ink} strokeWidth={7} />
        {/* 中の空洞 */}
        <g fill="#8F8372" stroke={KRP.ink} strokeWidth={4.5}>
          {[-105, -35, 35, 105].map((cx, i) => (<rect key={i} x={cx - 26} y={-98} width={52} height={76} rx={4} />))}
        </g>
        <rect x={-150} y={-144} width={300} height={28} rx={5} fill="#C8A782" stroke={KRP.ink} strokeWidth={6} />
      </g>
      <TagPlate x={300} y={816} text="中は空どうの焼き物" size={28} t={seg(f, 22, 38)} fill={KRP.white} />
      {/* モルタル桶とこて */}
      <g transform="translate(700 1060)">
        <path d="M -78 0 Q -92 -60 -72 -96 L 72 -96 Q 92 -60 78 0 Z" fill={C.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-96} rx={73} ry={18} fill="#CFCABC" stroke={KRP.ink} strokeWidth={5} />
        <g transform="rotate(-24 96 -70)">
          <rect x={86} y={-82} width={110} height={20} rx={4} fill="#B9BEC2" stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={186} y={-90} width={46} height={16} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 積んだブロックの山 */}
      <g transform="translate(1480 1070)">
        {Array.from({ length: 8 }, (_, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          return <Block key={i} x={col * 160 - 80} y={-row * 46} w={150} h={46} off={row % 2 === 0} />;
        })}
      </g>
      {/* 舞う粉じん (大きめ・少なめ) */}
      <g fill="#D8CFBC" opacity={0.45}>
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={rnd(i * 5.3) * W} cy={FL - 260 - ((f * 1.1 + i * 60) % 400)}
            rx={7 + rnd(i * 2.1) * 8} ry={4 + rnd(i * 3.7) * 5} />
        ))}
      </g>

      {/* ---- 札 ---- */}
      <Arrow x={HX + 100} y={430} s={0.9} rot={180} t={seg(f, 8, 20)} />
      <TagPlate x={HX + 250} y={430} text="鉄の柱" size={32} t={seg(f, 8, 20)} fill={KRP.white} />
      <Arrow x={HX - 100} y={790} s={0.9} rot={0} t={seg(f, 18, 32)} />
      <TagPlate x={HX - 290} y={790} text="焼き物で包む" size={34} t={seg(f, 18, 32)} fill="#E8CFAC" />
    </Frame>
  );
};

// ===== #54 骨に、燃えない服を着せたんです。 =====
// どこ: 仕立て屋の店の中。板の床、腰板の壁、通りに面した窓。昼。
// 演出: 試着台の上に鉄の柱が「お客」として立ち、焼き物の上着を着せられている。
// 動き: 仕立屋が袖を合わせ、巻尺が揺れ、通りを人が通り、吊るした服が揺れる。
// #53 の工事現場とは真逆の、生活の場の比喩シーン。
const Kb1MoenaiFuku: React.FC<{ f: number }> = ({ f }) => {
  const FL = 902;
  const sway = Math.sin(f / 17) * 3;
  const open = easeOut(clamp01(seg(f, 8, 36)));   // 上着が閉じていく
  return (
    <Frame f={f} seed={526} bg="#F0E2C8">
      {/* ---- 奥: 壁・腰板・窓 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={FL + 40} fill="#E6D2AE" />
      <g stroke="#D2BB93" strokeWidth={4} opacity={0.9}>
        {Array.from({ length: 13 }, (_, i) => (<line key={i} x1={-20 + i * 155} y1={160} x2={-20 + i * 155} y2={FL} />))}
      </g>
      <rect x={-20} y={FL - 230} width={W + 40} height={230} fill="#C8A878" />
      <rect x={-20} y={FL - 246} width={W + 40} height={22} fill="#A98A5E" stroke={KRP.ink} strokeWidth={5} />
      {/* 天井の廻り縁と吊りランプ */}
      <rect x={-20} y={132} width={W + 40} height={30} fill="#A98A5E" stroke={KRP.ink} strokeWidth={5} />
      {[430, 1480].map((lx, i) => (
        <g key={i}>
          <line x1={lx} y1={162} x2={lx} y2={252} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${lx - 62} 252 L ${lx + 62} 252 L ${lx + 38} 312 L ${lx - 38} 312 Z`}
            fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={lx} cy={326} r={17} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 通りに面した窓 (外に人が通る) */}
      <g>
        <rect x={1232} y={300} width={560} height={372} fill="#CFE0EA" stroke="#8A6A42" strokeWidth={10} />
        <RowOfBuildings x0={1240} x1={1784} base={592} seed={54} minH={70} maxH={210}
          fill="#A9B8C4" stroke="#6E8092" sw={3} opacity={0.85} count={6} />
        <rect x={1240} y={592} width={544} height={74} fill="#B5B2A8" />
        {/* 通行人 (窓の向こう) */}
        {Array.from({ length: 3 }, (_, i) => {
          const wx = 1250 + (((f * 1.1 + i * 210) % 600));
          return (
            <g key={i} transform={`translate(${wx} 650) scale(0.46)`} fill="#4A4A52">
              <ellipse cx={0} cy={-128} rx={28} ry={32} />
              <path d="M -30 -100 q 30 -14 60 0 l 8 100 l -22 0 l -16 -60 l -16 60 l -22 0 Z" />
            </g>
          );
        })}
        <line x1={1512} y1={300} x2={1512} y2={672} stroke="#8A6A42" strokeWidth={8} />
        <line x1={1232} y1={486} x2={1792} y2={486} stroke="#8A6A42" strokeWidth={8} />
        {/* ガラスに貼った屋号 */}
        <rect x={1300} y={340} width={170} height={60} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
        <text x={1385} y={386} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>仕立</text>
      </g>
      {/* 左: 吊るした上着 (焼き物色) */}
      <g>
        <rect x={60} y={356} width={420} height={14} rx={7} fill="#8A6A42" stroke={KRP.ink} strokeWidth={5} />
        <rect x={64} y={356} width={16} height={150} fill="#8A6A42" stroke={KRP.ink} strokeWidth={4} />
        <rect x={452} y={356} width={16} height={150} fill="#8A6A42" stroke={KRP.ink} strokeWidth={4} />
        {[130, 250, 370].map((cx, i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 15 + i) * 1.6} ${cx} 370)`}>
            <path d={`M ${cx} 370 l -14 24 l 28 0 Z`} fill="none" stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${cx - 62} 404 q 62 -22 124 0 l 14 206 l -152 0 Z`}
              fill={i === 1 ? C.terraDark : C.terra} stroke={KRP.ink} strokeWidth={5} />
            <line x1={cx} y1={404} x2={cx} y2={610} stroke={C.terraDark} strokeWidth={4} opacity={0.7} />
          </g>
        ))}
        <TagPlate x={270} y={690} text="燃えない服" size={30} t={seg(f, 24, 38)} fill={KRP.white} />
      </g>

      {/* ---- 床 ---- */}
      <PlankFloor y={FL} h={H - FL + 20} n={11} fill="#B8935F" line="#8A6A42" />
      {/* 敷物 */}
      <g>
        <ellipse cx={880} cy={1010} rx={420} ry={82} fill="#8E5B4A" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={880} cy={1010} rx={330} ry={60} fill="none" stroke="#C99A72" strokeWidth={6} />
      </g>

      {/* ---- 主役: 試着台の上の鉄の柱が、焼き物の上着を着る ---- */}
      <g>
        {/* 丸い試着台 */}
        <ellipse cx={880} cy={880} rx={210} ry={44} fill="#9C7A4E" stroke={KRP.ink} strokeWidth={6} />
        <rect x={670} y={880} width={420} height={44} fill="#8A6A42" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={880} cy={924} rx={210} ry={40} fill="#7A5C3A" stroke={KRP.ink} strokeWidth={6} />
        {/* 鉄の柱 (お客さん) — 上下に素の鉄が見えるようにする */}
        <IBeamV x={880} y1={300} y2={880} w={116} color={C.steel} dark={C.steelDark} />
        {/* 柱の頭に帽子代わりの継手板 */}
        <rect x={800} y={272} width={160} height={38} rx={4} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={828} y1={291} x2={932} y2={291} n={4} r={7} color="#5A5650" />
        {/* 焼き物の上着 (左右から閉じる。裾は 786 で止めて足元の鉄を見せる) */}
        <g transform={`translate(${-82 + 82 * open} 0)`}>
          <path d="M 880 438 L 756 476 L 740 786 L 880 786 Z" fill={C.terra} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 880 438 L 756 476 l -8 62 l 40 10 l 6 -44 Z" fill={C.terraDark} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={C.terraDark} strokeWidth={3.5} opacity={0.65}>
            {[560, 622, 684, 746].map((yy, i) => (<line key={i} x1={746} y1={yy} x2={880} y2={yy} />))}
          </g>
        </g>
        <g transform={`translate(${82 - 82 * open} 0)`}>
          <path d="M 880 438 L 1004 476 L 1020 786 L 880 786 Z" fill={C.terra} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 880 438 L 1004 476 l 8 62 l -40 10 l -6 -44 Z" fill={C.terraDark} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={C.terraDark} strokeWidth={3.5} opacity={0.65}>
            {[560, 622, 684, 746].map((yy, i) => (<line key={i} x1={880} y1={yy} x2={1014} y2={yy} />))}
          </g>
        </g>
        {/* 裾の折り返し */}
        <rect x={740} y={774} width={280} height={24} rx={5} fill={C.terraDark} stroke={KRP.ink} strokeWidth={5} />
        {/* ボタン */}
        {open > 0.9 && [540, 606, 672, 738].map((by, i) => (
          <circle key={i} cx={880} cy={by} r={14} fill={C.terraLight} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 肩 */}
        <path d="M 880 432 L 794 470 L 880 486 L 966 470 Z" fill={C.terraLight}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 裾から下の素の鉄に、矢印で寄る */}
        <Arrow x={806} y={824} s={0.78} rot={0} t={seg(f, 34, 46)} />
        <TagPlate x={578} y={790} text="中は鉄のまま" size={28} t={seg(f, 34, 42)} fill={KRP.white} />
      </g>

      {/* ---- 仕立屋 (しゃがんで裾を合わせる) と お針子 ---- */}
      <g>
        <Person x={1196} y={FL + 92} s={1.1} cloth="#5B6B7A" clothDark="#3B4856" hair="cap"
          face="smile" gaze={[-0.8, 0.1]} lean={-7} f={f} phase={3} />
        {/* 首にかけた巻尺 */}
        <path d={`M 1154 ${FL + 92 - 214} q 42 ${56 + sway * 2} 84 0`} fill="none"
          stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" />
        {/* 手に持った巻尺の先 */}
        <path d={`M 1152 ${FL - 40} q -70 -30 -150 -8`} fill="none" stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" />
        {/* 針山 */}
        <g transform={`translate(1348 ${FL - 10})`}>
          <circle cx={0} cy={0} r={34} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {[-40, -10, 24, 60].map((a, i) => (
            <line key={i} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 54} y2={Math.sin((a * Math.PI) / 180) * 54 - 20}
              stroke="#8A8278" strokeWidth={4} />
          ))}
        </g>
      </g>
      {/* 作業台とミシン風の道具 */}
      <g transform="translate(420 1078)">
        <rect x={-230} y={-120} width={460} height={28} fill="#A98A5E" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-210} y={-92} width={22} height={92} fill="#8A6A42" stroke={KRP.ink} strokeWidth={5} />
        <rect x={188} y={-92} width={22} height={92} fill="#8A6A42" stroke={KRP.ink} strokeWidth={5} />
        {/* たたんだ焼き物色の布 */}
        <rect x={-180} y={-164} width={150} height={44} rx={6} fill={C.terra} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-170} y={-200} width={130} height={38} rx={6} fill={C.terraLight} stroke={KRP.ink} strokeWidth={5} />
        {/* はさみ */}
        <g transform="translate(90 -140) rotate(-16)">
          <line x1={-60} y1={0} x2={40} y2={-14} stroke="#B9BEC2" strokeWidth={8} />
          <line x1={-60} y1={14} x2={40} y2={6} stroke="#B9BEC2" strokeWidth={8} />
          <circle cx={56} cy={-20} r={16} fill="none" stroke={KRP.ink} strokeWidth={6} />
          <circle cx={56} cy={16} r={16} fill="none" stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 姿見 */}
      <g transform="translate(1700 1040)">
        <rect x={-96} y={-520} width={192} height={470} rx={10} fill="#DCE6EA" stroke="#8A6A42" strokeWidth={11} />
        {/* 鏡にうつった「服を着た柱」。空っぽの白板にしないため、中身を描き込む */}
        <g opacity={0.72}>
          <rect x={-86} y={-152} width={172} height={94} fill="#C9B79B" />
          <line x1={-86} y1={-152} x2={86} y2={-152} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
          <ellipse cx={-6} cy={-140} rx={74} ry={22} fill="#8B5F3C" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-26} y={-494} width={52} height={62} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -6 -432 L -54 -414 L -54 -168 L 42 -168 L 42 -414 Z"
            fill={C.terraLight} stroke={KRP.ink} strokeWidth={4.5} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
            {[-372, -312, -252, -192].map((yy, i) => (<line key={i} x1={-54} y1={yy} x2={42} y2={yy} />))}
          </g>
          <line x1={-6} y1={-414} x2={-6} y2={-168} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          {/* 後ろ姿の仕立屋 */}
          <g transform="translate(58 -168)">
            <path d="M -22 0 L -22 -68 Q -22 -92 0 -92 Q 22 -92 22 -68 L 22 0 Z"
              fill="#5A6472" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={0} cy={-112} r={22} fill="#E6D2B4" stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        <path d="M -70 -490 l 120 170 l -120 60 Z" fill={KRP.white} opacity={0.45} />
        <path d="M -30 -40 l -46 40 M 30 -40 l 46 40" stroke={KRP.ink} strokeWidth={7} />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={880} y={244} text="鉄の骨" size={32} t={seg(f, 4, 18)} fill={KRP.white} />
      <Arrow x={1092} y={600} s={0.95} rot={180} t={seg(f, 26, 40)} />
      <TagPlate x={1438} y={790} text="燃えない服を着せる" size={32} t={seg(f, 26, 40)} fill={C.terraLight} />
    </Frame>
  );
};

// ===================================================================
// 文#54 素材は、植木鉢と同じ焼き物です。
//   型: 図。方眼の紙地に、主役を2つだけ。街・空・丘・窯・職人・猫は全部落とした。
//   演出: 左に「植木鉢」、右に「鉄の柱を包む焼き物」。どちらも中央側の半分を
//         切った半断面にして、切り口を「=」の両どなりに向かい合わせる。
//         切り口の45度ハッチ・terraの色・縁の厚みが2つで完全に同じ = 同じ焼き物。
//   動き: 鉢が据わる → 断面が開いて土が盛り上がり、ハッチが上から引かれる
//         → 柱の焼き物が下から積まれ、中の鉄が現れる → 「=」が出て、
//         下に同じハッチの見本が出る。芽はずっと揺れている。
// ===================================================================
const Kb1Uekibachi: React.FC<{ f: number }> = ({ f }) => {
  // 植木鉢 (半断面は右半分)
  const PX = 500, RIM_HW = 330, RIM_Y = 372, RIM_H = 40;
  const BT = 412, BB = 762, BOT = 800, TW = 38, SS = 476;
  const oxAt = (y: number) => lerp(300, 200, clamp01((y - BT) / (BOT - BT)));
  const ixAt = (y: number) => oxAt(y) - TW;
  // 鉄の柱 (半断面は左半分)
  const CX = 1430, OHW = 200, CT = 44, CTOP = 340, CBOT = 800, CH = 46, NC = 10;
  const GY = 806;
  // 45度のハッチ = 焼き物の切り口の印。鉢・柱・見本で同じ道具を使う
  const hatch45 = (x0: number, y0: number, x1: number, y1: number, g = 22) => {
    const out: { a: number; b: number; c: number; d: number }[] = [];
    const h = y1 - y0;
    for (let s = x0 - h; s < x1; s += g) {
      const ax = Math.max(s, x0), bx = Math.min(s + h, x1);
      if (bx - ax > 3) out.push({ a: ax, b: y1 - (ax - s), c: bx, d: y1 - (bx - s) });
    }
    return out;
  };
  const Hatch: React.FC<{ r: ReturnType<typeof hatch45>; t: number }> = ({ r, t }) => (
    <g stroke={C.terraDark} strokeWidth={4} opacity={0.8}>
      {r.map((s, i) => {
        const tt = clamp01(t * (r.length + 2) - i);
        if (tt <= 0.04) return null;
        return <line key={i} x1={s.a} y1={s.b} x2={lerp(s.a, s.c, tt)} y2={lerp(s.b, s.d, tt)} />;
      })}
    </g>
  );
  const potT = easeOut(seg(f, 2, 14));        // 鉢が据わる
  const cut = easeOut(seg(f, 10, 26));        // 断面が開く
  const stack = easeOut(seg(f, 8, 26));       // 焼き物が下から積まれる
  const grow = easeOut(seg(f, 14, 32));       // 芽が伸びる
  const eq = pop(clamp01(seg(f, 26, 36)));    // 「=」
  const leg = pop(clamp01(seg(f, 30, 42)));   // 切り口の見本
  const sway = Math.sin(f / 15) * 4;
  const soilTop = lerp(BB, SS, cut);
  return (
    <Frame f={f} seed={527} bg={C.paper}>
      {/* 図面の方眼 */}
      <g stroke="#DCD2BC" strokeWidth={2.5} opacity={0.6}>
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`gv${i}`} x1={60 + i * 90} y1={190} x2={60 + i * 90} y2={812} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gh${i}`} x1={60} y1={190 + i * 86} x2={1860} y2={190 + i * 86} />
        ))}
      </g>

      {/* ───── 左の主役: 植木鉢 (右半分が切り口) ───── */}
      <g opacity={Math.min(1, potT * 2)} transform={`translate(0 ${(1 - potT) * 36})`}>
        {/* 芽 (縁の後ろから出る。ずっと揺れている) */}
        <g transform={`translate(380 400) rotate(${sway}) scale(${0.3 + 0.7 * grow}) translate(-380 -400)`}>
          <path d="M 380 404 Q 352 322 308 262" fill="none" stroke="#5E8A4A" strokeWidth={7} strokeLinecap="round" />
          <g transform="rotate(-26 266 268)">
            <ellipse cx={266} cy={268} rx={46} ry={24} fill="#6FA055" stroke={KRP.ink} strokeWidth={5} />
          </g>
          <g transform="rotate(20 414 316)">
            <ellipse cx={414} cy={316} rx={40} ry={21} fill="#7EAE60" stroke={KRP.ink} strokeWidth={5} />
          </g>
        </g>
        {/* 鉢の胴 */}
        <path d={`M ${PX - 300} ${BT} L ${PX + 300} ${BT} L ${PX + 200} ${BOT} L ${PX - 200} ${BOT} Z`}
          fill={C.terra} stroke={KRP.ink} strokeWidth={7} />
        {/* 外側 (左半分) の素焼きの肌: 胴の絞りに沿う刷毛目と、ろくろの輪じま */}
        <g stroke={C.terraDark} opacity={0.3} strokeWidth={4}>
          {[0.18, 0.4, 0.62, 0.84].map((u, i) => (
            <line key={i} x1={PX - oxAt(BT + 14) * u} y1={BT + 14}
              x2={PX - oxAt(BOT - 14) * u} y2={BOT - 14} />
          ))}
        </g>
        <g stroke={C.terraDark} opacity={0.55} strokeWidth={5}>
          {[520, 604, 688].map((y, i) => (<line key={i} x1={PX - oxAt(y)} y1={y} x2={PX} y2={y} />))}
        </g>
        {/* 切り口の内側: からの空間 → 土が盛り上がる */}
        <g opacity={Math.min(1, cut * 3)}>
          <path d={`M ${PX} ${BT} L ${PX + ixAt(BT)} ${BT} L ${PX + ixAt(BB)} ${BB} L ${PX} ${BB} Z`}
            fill={KRP.cream} />
          <path d={`M ${PX} ${soilTop} L ${PX + ixAt(soilTop)} ${soilTop} L ${PX + ixAt(BB)} ${BB} L ${PX} ${BB} Z`}
            fill={C.soil} />
          <g fill={C.soilDark} opacity={0.6}>
            {Array.from({ length: 9 }, (_, i) => {
              const sy = soilTop + 30 + rnd(i * 3.1) * (BB - soilTop - 54);
              if (sy > BB - 12) return null;
              return <ellipse key={i} cx={PX + 26 + rnd(i * 5.7) * Math.max(10, ixAt(sy) - 58)} cy={sy}
                rx={13 + rnd(i * 2.3) * 11} ry={8 + rnd(i * 1.7) * 5} />;
            })}
          </g>
          <line x1={PX} y1={soilTop} x2={PX + ixAt(soilTop)} y2={soilTop} stroke={C.soilDark} strokeWidth={6} />
          {/* 内側の面と底 */}
          <path d={`M ${PX + ixAt(BT)} ${BT} L ${PX + ixAt(BB)} ${BB} L ${PX} ${BB}`}
            fill="none" stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 切り口のハッチ: 胴の壁 (絞りに沿う) / 底の板 / 縁の厚み */}
        <g stroke={C.terraDark} strokeWidth={4} opacity={0.8}>
          {Array.from({ length: 16 }, (_, i) => {
            const y0 = BT + TW + i * 22;
            if (y0 > BB) return null;
            const tt = clamp01(cut * 19 - i);
            if (tt <= 0.04) return null;
            return <line key={i} x1={PX + ixAt(y0)} y1={y0}
              x2={lerp(PX + ixAt(y0), PX + oxAt(y0 - TW), tt)} y2={lerp(y0, y0 - TW, tt)} />;
          })}
        </g>
        <Hatch r={hatch45(PX, BB, PX + 198, BOT)} t={cut} />
        {/* 縁 (厚い返し。切り口は同じハッチ) */}
        <rect x={PX - RIM_HW} y={RIM_Y} width={RIM_HW * 2} height={RIM_H} rx={6}
          fill={C.terraDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={PX - RIM_HW + 16} y={RIM_Y + 9} width={210} height={8} rx={4} fill={C.terraLight} opacity={0.75} />
        <Hatch r={hatch45(PX, RIM_Y, PX + RIM_HW, RIM_Y + RIM_H)} t={cut} />
        {/* 切った面 (中心線) */}
        <line x1={PX} y1={RIM_Y} x2={PX} y2={BOT} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
      </g>

      {/* ───── 右の主役: 鉄の柱を包む焼き物 (左半分が切り口) ───── */}
      <g>
        {/* 中の鉄 (切り口から見える。上から下へ現れる) */}
        <g opacity={Math.min(1, cut * 3)}>
          <rect x={CX - 156} y={CTOP} width={44} height={(CBOT - CTOP) * cut} fill={C.steel}
            stroke={KRP.ink} strokeWidth={5} />
          <rect x={CX - 112} y={CTOP} width={112} height={(CBOT - CTOP) * cut} fill={C.steelDark} />
          {Array.from({ length: 7 }, (_, i) => {
            const ry = CTOP + 42 + i * 64;
            if (ry > CTOP + (CBOT - CTOP) * cut - 14) return null;
            return <circle key={i} cx={CX - 134} cy={ry} r={8} fill="#5A5650" stroke={KRP.ink} strokeWidth={3} />;
          })}
        </g>
        {/* 焼き物の殻が下から積まれる */}
        {Array.from({ length: NC }, (_, i) => {
          const t = clamp01(stack * (NC + 1.5) - i);
          if (t <= 0.04) return null;
          const y = CBOT - (i + 1) * CH;
          return (
            <g key={i} opacity={Math.min(1, t * 2)}>
              {/* 外側 (右半分) */}
              <rect x={CX} y={y} width={OHW} height={CH} fill={C.terra} stroke={KRP.ink} strokeWidth={4.5} />
              <rect x={CX} y={y + CH - 8} width={OHW} height={8} fill={C.terraDark} opacity={0.85} />
              <line x1={CX + (i % 2 ? 94 : 142)} y1={y} x2={CX + (i % 2 ? 94 : 142)} y2={y + CH - 8}
                stroke={C.terraDark} strokeWidth={4} />
              <rect x={CX + 16} y={y + 10} width={58} height={8} rx={4} fill={C.terraLight} opacity={0.8} />
              {/* 切り口側の壁 (左半分) */}
              <rect x={CX - OHW} y={y} width={CT} height={CH} fill={C.terra} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 切り口のハッチと、包みの内・外の面 */}
        <Hatch r={hatch45(CX - OHW, CTOP, CX - OHW + CT, CBOT)} t={cut} />
        <g opacity={Math.min(1, stack * 3)}>
          <rect x={CX - OHW} y={CTOP} width={OHW * 2} height={CBOT - CTOP} fill="none"
            stroke={KRP.ink} strokeWidth={7} />
          <line x1={CX - 156} y1={CTOP} x2={CX - 156} y2={CBOT} stroke={KRP.ink} strokeWidth={6} />
          <line x1={CX} y1={CTOP} x2={CX} y2={CBOT} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        </g>
        {/* 柱の頭の継手板 (ここだけ鉄が裸) */}
        <g opacity={Math.min(1, seg(f, 4, 16) * 2)}>
          <rect x={CX - 160} y={296} width={320} height={44} rx={4} fill={C.steelDark}
            stroke={KRP.ink} strokeWidth={6} />
          {[-108, -36, 36, 108].map((dx, i) => (
            <circle key={i} cx={CX + dx} cy={318} r={8} fill="#5A5650" stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
      </g>

      {/* ───── 中央: 同じ物だ、の印 ───── */}
      <g transform={`translate(960 505) scale(${eq}) translate(-960 -505)`}>
        <rect x={875} y={440} width={170} height={36} rx={18} fill={KRP.ink} />
        <rect x={875} y={534} width={170} height={36} rx={18} fill={KRP.ink} />
      </g>
      {/* 切り口の見本 (鉢と柱に引いたのと同じハッチ) */}
      <g transform={`translate(960 650) scale(${leg}) translate(-960 -650)`}>
        <rect x={886} y={600} width={148} height={100} rx={6} fill={C.terra} stroke={KRP.ink} strokeWidth={6} />
        <Hatch r={hatch45(886, 600, 1034, 700)} t={1} />
      </g>

      {/* ───── 地面 ───── */}
      <line x1={120} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={160 + i * 145} y1={GY} x2={130 + i * 145} y2={GY + 34} />
        ))}
      </g>

      {/* ───── 札 ───── */}
      <TagPlate x={600} y={276} text="植木鉢" size={40} t={seg(f, 4, 16)} fill={KRP.white} />
      <TagPlate x={1430} y={276} text="鉄の柱の服" size={40} t={seg(f, 8, 20)} fill={C.terraLight} />
      <Arrow x={1566} y={318} s={0.8} rot={180} t={seg(f, 20, 32)} />
      <TagPlate x={1758} y={318} text="中は鉄" size={26} t={seg(f, 20, 32)} fill={KRP.white} />
      <TagPlate x={960} y={756} text="同じ土、同じ焼き物" size={28} t={seg(f, 32, 42)} fill={C.terraLight} />
    </Frame>
  );
};

// ===== #56 1904年のボルティモアの大火で、効き目が出ます。 =====
// どこ: ボルティモアの目抜き通り。昼だが煙で黄ばんだ空。
// 演出: #52 の夜景とは逆に、昼の通りの高さから見上げる。蒸気ポンプ車と放水が主役。
// 動き: 放水の弧が揺れ、ポンプの煙突が煙を吐き、馬が足踏みし、野次馬が揺れる。
// 奥: 上層から煙を噴くビル。中: ポンプ車と消防士。近: 濡れた敷石とホース、警官と野次馬。
const Kb11904Baltimore: React.FC<{ f: number }> = ({ f }) => {
  const GR = 872;
  const jet = Math.sin(f / 9) * 22;
  return (
    <Frame f={f} seed={528} bg="#D6CDBB">
      {/* ---- 奥: 煙でくすんだ空と、燃えているビル ---- */}
      <rect x={-20} y={-20} width={W + 40} height={GR + 40} fill="#C9C0AC" />
      <rect x={-20} y={-20} width={W + 40} height={420} fill="#B9AE96" opacity={0.55} />
      <circle cx={300} cy={244} r={58} fill="#E8D9A8" opacity={0.6} />
      {/* 奥の街 */}
      <RowOfBuildings x0={-20} x1={W + 20} base={GR - 220} seed={561} minH={120} maxH={330}
        fill="#A79C8A" stroke="#7E7462" sw={3.5} opacity={0.7} count={11} />
      {/* 手前の街区 (煙を噴く) */}
      <g>
        {[[-40, 330], [320, 300], [660, 360], [1040, 290], [1360, 340], [1700, 320]].map(([bx, bw], i) => {
          const bh = 360 + rnd(i * 4.3) * 230;
          const by = GR - 150 - bh;
          return (
            <g key={i}>
              <rect x={bx!} y={by} width={bw!} height={bh} fill="#9E8E7E" stroke={KRP.ink} strokeWidth={5} />
              <rect x={bx! - 10} y={by - 22} width={bw! + 20} height={26} fill="#8A7A6A" stroke={KRP.ink} strokeWidth={5} />
              {/* 窓 (上の階は火と煙) */}
              {Array.from({ length: 5 }, (_, r) =>
                Array.from({ length: Math.max(2, Math.round(bw! / 110)) }, (_, c) => {
                  const wx = bx! + 26 + c * 104;
                  const wy = by + 32 + r * 92;
                  if (wy > GR - 220) return null;
                  const burning = r < 2;
                  return (
                    <rect key={`${r}-${c}`} x={wx} y={wy} width={62} height={62}
                      fill={burning ? KRP.orange : "#6E6454"} stroke={KRP.ink} strokeWidth={4} />
                  );
                }))}
              <Smoke x={bx! + bw! / 2} y={by + 40} f={f} n={5} r={56} rise={340} speed={0.38}
                drift={i % 2 ? 150 : -150} color="#6E6454" opacity={0.42} grow={2.4} />
              {i % 2 === 0 && <Flame x={bx! + bw! / 2} y={by + 6} s={1.5} f={f} phase={i} />}
            </g>
          );
        })}
      </g>
      <Embers x={960} y={420} f={f} n={18} w={1900} h={520} s={1.0} />

      {/* ---- 地面: 濡れた敷石 ---- */}
      <rect x={-20} y={GR} width={W + 40} height={H - GR + 20} fill="#8E8C84" />
      <g stroke="#75736B" strokeWidth={3} opacity={0.85}>
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 22 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-20 + c * 92 + (r % 2) * 46} y={GR + r * 38} width={88} height={34}
              fill="#8A8880" />
          )))}
      </g>
      {/* 水たまりと反射 */}
      {[[260, 1004], [860, 1052], [1480, 998]].map(([px6, py6], i) => (
        <g key={i}>
          <ellipse cx={px6!} cy={py6!} rx={150 + i * 30} ry={30} fill="#A8B4B8" opacity={0.75} />
          <ellipse cx={px6!} cy={py6!} rx={90} ry={14} fill={KRP.orange} opacity={0.3} />
        </g>
      ))}
      {/* ホース */}
      <path d={`M -20 1060 Q 420 1000 760 1046 Q 1100 1090 1420 1010 Q 1700 944 1940 972`}
        fill="none" stroke="#5E5A52" strokeWidth={24} strokeLinecap="round" />
      <path d={`M -20 1060 Q 420 1000 760 1046 Q 1100 1090 1420 1010 Q 1700 944 1940 972`}
        fill="none" stroke="#7A7568" strokeWidth={12} strokeLinecap="round" />
      {[380, 1120, 1660].map((cx, i) => (
        <rect key={i} x={cx - 20} y={GR + 150 + (i % 2) * 24} width={40} height={34} rx={6}
          fill={C.brass} stroke={KRP.ink} strokeWidth={5} />
      ))}

      {/* ---- 中: 蒸気ポンプ車と馬 ---- */}
      <g transform="translate(1270 0)">
        {/* 馬 2頭 */}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${320 + i * 118} ${GR}) scale(${1.02 - i * 0.06})`}>
            <path d="M -86 -118 q 0 -44 44 -44 l 76 0 q 24 0 24 28 l 0 28 q 0 16 -24 16 l -96 0 q -24 0 -24 -28 Z"
              fill="#5A4436" stroke={KRP.ink} strokeWidth={5} />
            <path d="M 50 -150 q 34 -10 42 18 l 6 36 q 2 18 -20 20 l -28 2 Z" fill="#5A4436" stroke={KRP.ink} strokeWidth={5} />
            <path d="M 78 -186 l 6 24 l 14 -20 Z" fill="#5A4436" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={84} cy={-120} r={5} fill={KRP.ink} />
            <g stroke={KRP.ink} strokeWidth={5}>
              <line x1={-62} y1={-74} x2={-66 + Math.sin(f / 7 + i) * 8} y2={0} />
              <line x1={-30} y1={-74} x2={-24} y2={0} />
              <line x1={30} y1={-74} x2={36 - Math.sin(f / 7 + i) * 8} y2={0} />
              <line x1={56} y1={-74} x2={62} y2={0} />
            </g>
            <path d="M -86 -130 q -30 40 -16 76" fill="none" stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
        {/* ポンプ車の本体 */}
        <rect x={-140} y={GR - 150} width={330} height={92} rx={8} fill="#8A2E2E" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-120} y={GR - 300} width={150} height={154} rx={10} fill={C.brass} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={-45} cy={GR - 300} rx={75} ry={18} fill="#C9A24A" stroke={KRP.ink} strokeWidth={5} />
        {/* 煙突 */}
        <rect x={60} y={GR - 420} width={64} height={276} fill="#3E3A34" stroke={KRP.ink} strokeWidth={6} />
        <rect x={46} y={GR - 440} width={92} height={28} rx={5} fill="#2E2A26" stroke={KRP.ink} strokeWidth={5} />
        {/* 車輪 */}
        {[-80, 130].map((wx, i) => (
          <g key={i}>
            <circle cx={wx} cy={GR - 44} r={62 - i * 8} fill="none" stroke={KRP.ink} strokeWidth={8} />
            <circle cx={wx} cy={GR - 44} r={13} fill={KRP.ink} />
            {Array.from({ length: 8 }, (_, k) => (
              <line key={k} x1={wx} y1={GR - 44} x2={wx + Math.cos((k * Math.PI) / 4) * (56 - i * 8)}
                y2={GR - 44 + Math.sin((k * Math.PI) / 4) * (56 - i * 8)} stroke={KRP.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
        <rect x={-150} y={GR - 54} width={350} height={14} fill="#5E2626" stroke={KRP.ink} strokeWidth={4} />
      </g>
      <Smoke x={1362} y={GR - 456} f={f} n={5} r={30} rise={300} speed={0.6} drift={-120}
        color="#4E4A44" opacity={0.5} grow={2.2} />

      {/* ---- 中: 放水する消防士 ---- */}
      <g>
        <Person x={880} y={GR + 26} s={1.0} cloth="#3E4C5E" clothDark="#2A3542" helmet
          face="normal" gaze={[-0.6, -0.6]} lean={-6} f={f} phase={1} />
        <Person x={1010} y={GR + 26} s={0.94} cloth="#3E4C5E" clothDark="#2A3542" helmet
          face="normal" gaze={[-0.5, -0.5]} lean={-8} f={f} phase={4} />
        {/* 筒先 (左上の燃える窓へ向ける) */}
        <g transform="translate(1070 690) rotate(-148)">
          <rect x={-10} y={-14} width={120} height={28} rx={6} fill={C.brass} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="110,-16 150,-7 150,7 110,16" fill="#C9A24A" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 狙っている窓 (ここが燃えている、と分かるように大きく描く) */}
        <g>
          <rect x={180} y={424} width={108} height={92} fill="#8A4A1E" stroke={KRP.ink} strokeWidth={5} />
          <rect x={192} y={436} width={84} height={68} fill={KRP.orange} />
          <Flame x={234} y={430} s={1.1} f={f} phase={2} />
        </g>
        {/* 水の弧: 筒先 → その窓 */}
        <path d={`M 940 610 Q ${620 + jet} ${264 + jet * 0.4} 234 ${470 - jet}`}
          fill="none" stroke="#9ECBDE" strokeWidth={26} strokeLinecap="round" opacity={0.85} />
        <path d={`M 940 610 Q ${620 + jet} ${272 + jet * 0.4} 234 ${480 - jet}`}
          fill="none" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.75} />
        {/* 飛沫 (当たったところで跳ねる) */}
        <g fill="#BFE0EC" opacity={0.78}>
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={170 + rnd(i * 3.3) * 150} cy={420 + rnd(i * 7.1) * 150 - ((f * 2 + i * 30) % 120)}
              r={6 + rnd(i * 2.2) * 9} />
          ))}
        </g>
        {/* 当たった窓から立つ白い蒸気 */}
        <Smoke x={234} y={462} f={f} n={4} r={34} rise={230} speed={0.7} drift={-70}
          color="#DCE8EC" opacity={0.6} grow={2.3} />
      </g>

      {/* ---- 近景: 野次馬と警官 ---- */}
      <g>
        {/* 規制のロープ */}
        {[70, 420, 780].map((px7, i) => (
          <rect key={i} x={px7} y={944} width={13} height={120} fill="#4E4A42" stroke={KRP.ink} strokeWidth={4} />
        ))}
        <path d="M 60 980 Q 420 1012 790 980" fill="none" stroke={KRP.red} strokeWidth={7} />
        <Person x={170} y={1070} s={1.14} cloth="#4A4A52" clothDark="#32323A" hair="cap"
          face="surprised" gaze={[0.7, -0.6]} lean={-3} f={f} phase={0} />
        <Bowler x={170} y={1070} s={1.14} f={f} phase={0} color="#2E2E36" />
        <Person x={330} y={1078} s={0.98} cloth="#6A5E52" clothDark="#4A4038" hair="none"
          face="worried" gaze={[0.8, -0.5]} lean={2} f={f} phase={3} />
        <TopHat x={330} y={1078} s={0.98} f={f} phase={3} color="#262226" />
        <Person x={560} y={1076} s={1.04} cloth="#2E4258" clothDark="#1E2E40" hair="cap"
          face="normal" gaze={[0.6, -0.3]} lean={0} f={f} phase={6} />
        {/* 警官の帽子とバッジ */}
        <g transform={`translate(560 ${1076 + bobOf(f, 6)})`}>
          <rect x={-56} y={-306} width={112} height={48} rx={10} fill="#1E2E40" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -58 -262 q 58 -16 116 0 l 0 12 q -58 -14 -116 0 Z" fill="#17232F" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-282} r={14} fill={C.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 落ちた帽子 */}
        <g transform="translate(1020 1060) rotate(16)">
          <ellipse cx={0} cy={0} rx={56} ry={16} fill="#3A3238" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -32 -4 q -2 -36 32 -36 q 34 0 32 36 Z" fill="#3A3238" stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={700} y={250} text="1904年 ボルティモア" size={32} t={seg(f, 4, 18)} fill={KRP.white} />
      <TagPlate x={1480} y={648} text="また、大火" size={32} t={seg(f, 20, 34)} fill={KRP.red} color={KRP.white} />
    </Frame>
  );
};

// ===== #57 中は燃え尽きたのに、鉄の骨は立っていました。 =====
// どこ: 火が消えた翌朝の通り。白んだ空、低い朝日、まだ細い煙。
// 演出: 焼け殻のビルを正面から。中身は空っぽで、鉄の骨組みだけが残って立っている。
//       隣は煉瓦の建物が崩れた瓦礫 — 対比で「骨が効いた」ことを見せる。
// 動き: 細い煙がゆらぎ、灰が舞い、見上げる人がうなずき、写真師が構える。
const Kb1HoneTatteita: React.FC<{ f: number }> = ({ f }) => {
  const GR = 900;
  const TOP = 268;
  const COL = [700, 880, 1060, 1240];
  const LV = [GR - 20, 760, 640, 520, 400, TOP + 20];
  return (
    <Frame f={f} seed={529} bg="#E2E6E4">
      {/* ---- 奥: 白んだ朝空 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={GR + 40} fill="#DCE4E6" />
      <rect x={-20} y={-20} width={W + 40} height={360} fill="#F0E6D4" opacity={0.7} />
      <circle cx={1660} cy={264} r={74} fill="#F6E3B4" opacity={0.85} />
      <Cloud cx={420} cy={226} s={1.1} fill="#F2F0E8" opacity={0.85} />
      <Cloud cx={1180} cy={180} s={0.8} fill="#F2F0E8" opacity={0.7} />
      <Birds x={520} y={330} f={f} n={4} s={0.85} speed={0.45} color="#6E7A80" />
      {/* 遠景の無事な街 */}
      <RowOfBuildings x0={-20} x1={W + 20} base={GR - 160} seed={571} minH={90} maxH={240}
        fill="#B4BCBE" stroke="#86908E" sw={3.5} opacity={0.6} count={12} />

      {/* ---- 左: 崩れた煉瓦の建物 ---- */}
      <g>
        <path d={`M -20 ${GR} L -20 460 L 300 460 L 310 600 L 430 640 L 470 ${GR} Z`}
          fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
        <Bricks x={-20} y={460} w={340} h={440} bw={54} bh={25} fill={C.brick} line={C.brickDark} opacity={0.55} />
        {/* 崩れた口 */}
        <path d={`M 120 460 L 160 640 L 250 600 L 300 ${GR} L 120 ${GR} Z`} fill="#4E4038" stroke={KRP.ink} strokeWidth={5} />
        {/* 瓦礫の山 */}
        <path d={`M 60 ${GR} Q 240 ${GR - 150} 470 ${GR - 60} L 560 ${GR} Z`} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 22 }, (_, i) => {
          const bx = 90 + rnd(i * 6.1) * 450;
          const by = GR - 20 - rnd(i * 3.7) * 110;
          return <rect key={i} x={bx} y={by} width={46} height={21} rx={3}
            transform={`rotate(${(rnd(i * 8.3) - 0.5) * 80} ${bx + 23} ${by + 10})`}
            fill={C.brick} stroke={KRP.ink} strokeWidth={3} />;
        })}
        <Smoke x={300} y={GR - 160} f={f} n={4} r={22} rise={230} speed={0.4} drift={70}
          color="#B8B2A6" opacity={0.42} grow={2.0} />
        <XMark x={250} y={700} s={0.8} t={seg(f, 30, 44)} />
        <TagPlate x={236} y={812} text="煉瓦は崩れた" size={28} t={seg(f, 30, 44)} fill={KRP.white} />
      </g>

      {/* ---- 主役: 焼け残った鉄の骨組み ---- */}
      <g>
        {/* 焼け落ちた床スラブの名残 */}
        {LV.slice(0, 5).map((ly, i) => (
          <g key={i}>
            <rect x={COL[0]! - 30} y={ly - 10} width={COL[3]! - COL[0]! + 60} height={20}
              fill="#6E6660" stroke={KRP.ink} strokeWidth={4.5} />
            {/* 焦げた床の欠け */}
            <path d={`M ${COL[0]! + 60} ${ly - 10} l 40 26 l 60 -26 Z`} fill="#3E3832" opacity={0.8} />
          </g>
        ))}
        {/* 柱 (焼けて黒ずんだ鉄) */}
        {COL.map((cx, i) => (
          <g key={i}>
            <IBeamV x={cx} y1={TOP} y2={GR} w={38} color="#8A847C" dark="#4E4842" />
            {/* はがれ残った焼き物 */}
            {[GR - 60, GR - 160, 640, 400].map((ty, k) => (
              (i + k) % 2 === 0 ? (
                <rect key={k} x={cx - 34} y={ty - 48} width={68} height={48} rx={4}
                  fill="#D8C0A2" stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
              ) : null
            ))}
          </g>
        ))}
        {/* 屋根の梁 */}
        <IBeamH y={TOP} x1={COL[0]! - 50} x2={COL[3]! + 50} h={30} color="#8A847C" dark="#4E4842" />
        {/* すすけた外壁の名残 (左右だけ) */}
        <rect x={COL[0]! - 86} y={TOP} width={56} height={GR - TOP} fill="#9A8E80" stroke={KRP.ink} strokeWidth={5} />
        <rect x={COL[3]! + 30} y={TOP} width={56} height={GR - TOP} fill="#9A8E80" stroke={KRP.ink} strokeWidth={5} />
        {/* すすの流れ */}
        <g fill="#4E4842" opacity={0.3}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${COL[0]! - 70 + i * 12} ${TOP + 40} q 10 160 -4 ${GR - TOP - 60} l 10 0 q 14 -160 4 -${GR - TOP - 100} Z`} />
          ))}
        </g>
        {/* 細い煙 */}
        <Smoke x={880} y={520} f={f} n={4} r={18} rise={300} speed={0.34} drift={90}
          color="#C6C0B4" opacity={0.4} grow={2.2} />
        <Smoke x={1180} y={680} f={f} n={3} r={16} rise={260} speed={0.3} drift={-70}
          color="#C6C0B4" opacity={0.35} grow={2.0} />
        {/* 骨の中が空っぽだと分かるように、空が透ける */}
        <TagPlate x={970} y={330} text="中は燃え尽きた" size={30} t={seg(f, 8, 22)} fill={KRP.white} />
      </g>

      {/* ---- 右: 無事な隣の建物 ---- */}
      <g>
        <rect x={1420} y={430} width={420} height={GR - 430} fill="#C2BCAE" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1406} y={408} width={448} height={30} fill="#A8A294" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 3 }, (_, c) => (
            <rect key={`${r}-${c}`} x={1458 + c * 128} y={466 + r * 108} width={76} height={74}
              fill="#7E8A92" stroke={KRP.ink} strokeWidth={4} />
          )))}
      </g>

      {/* ---- 地面と近景 ---- */}
      <rect x={-20} y={GR} width={W + 40} height={H - GR + 20} fill="#A8A69C" />
      <g stroke="#8E8C82" strokeWidth={3} opacity={0.9}>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 22 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-20 + c * 92 + (r % 2) * 46} y={GR + r * 38} width={88} height={34} fill="#A4A298" />
          )))}
      </g>
      {/* 灰 */}
      <g fill="#E4E0D6" opacity={0.6}>
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={rnd(i * 4.1) * W} cy={((f * 0.8 + i * 52) % 900) + 150} r={3 + rnd(i * 2.7) * 4} />
        ))}
      </g>
      {/* 残されたホース */}
      <path d="M -20 1040 Q 320 996 640 1046 Q 980 1092 1320 1026"
        fill="none" stroke="#6E6A60" strokeWidth={20} strokeLinecap="round" />
      {/* 見上げる2人 */}
      <Person x={620} y={1072} s={1.1} cloth="#4A5464" clothDark="#303844" hair="cap"
        face="surprised" gaze={[0.3, -0.8]} lean={3} f={f} phase={2} />
      <Bowler x={620} y={1072} s={1.1} f={f} phase={2} color="#2E3238" />
      <Person x={790} y={1078} s={1.0} cloth="#6A6054" clothDark="#4A4238" hair="none"
        face="normal" gaze={[0.2, -0.8]} lean={-4} f={f} phase={5} />
      <TopHat x={790} y={1078} s={1.0} f={f} phase={5} color="#262226" />
      {/* 指さす腕 */}
      <line x1={666} y1={840} x2={742} y2={690} stroke="#4A5464" strokeWidth={24} strokeLinecap="round" />
      <circle cx={748} cy={684} r={16} fill="#E9D9BE" stroke={KRP.ink} strokeWidth={4} />
      {/* 三脚の写真機 */}
      <g transform="translate(1600 1070)">
        <g stroke="#6B543C" strokeWidth={11} strokeLinecap="round">
          <line x1={0} y1={0} x2={-10} y2={-180} /><line x1={-70} y1={0} x2={-16} y2={-180} />
          <line x1={70} y1={0} x2={-4} y2={-180} />
        </g>
        <rect x={-74} y={-280} width={140} height={104} rx={8} fill="#5A4436" stroke={KRP.ink} strokeWidth={6} />
        <rect x={60} y={-250} width={42} height={46} rx={6} fill="#3E342C" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -74 -280 q -36 -10 -46 26 l 0 56 q 8 32 46 22 Z" fill="#3A322A" stroke={KRP.ink} strokeWidth={5} />
      </g>
      <Person x={1746} y={1074} s={1.0} cloth="#564E58" clothDark="#3A343E" hair="cap"
        face="normal" gaze={[-0.8, -0.2]} lean={-6} f={f} phase={7} />

      {/* ---- 札 ---- */}
      <Arrow x={1360} y={366} s={0.95} rot={180} t={seg(f, 22, 36)} />
      <TagPlate x={1600} y={366} text="鉄の骨は立っている" size={30} t={seg(f, 22, 36)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== #58 では、いまの柱はどうなっているでしょう。 =====
// どこ: 現代の工事現場。真っ青な空、タワークレーン、メッシュシート。
// 演出: ここで一気に現代へ飛ぶ。これまでの茶色い世界から、青と黄の現代色に切り替える。
// 動き: クレーンが旋回し、吊り荷が揺れ、?マークが跳ね、作業員が図面を見上げる。
const Kb1ImaNoHashira: React.FC<{ f: number }> = ({ f }) => {
  const GR = 912;
  return (
    <Frame f={f} seed={530} bg="#CFE6F2">
      {/* ---- 奥: 空と現代の街 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={GR + 40} fill="#BEDCEE" />
      <rect x={-20} y={-20} width={W + 40} height={340} fill="#A6CFE8" opacity={0.7} />
      <Cloud cx={260} cy={214} s={1.2} />
      <Cloud cx={1520} cy={168} s={0.9} opacity={0.85} />
      <Birds x={900} y={260} f={f} n={5} s={0.8} speed={0.7} color="#6E8496" />
      {/* 遠景のガラスのビル */}
      {[[60, 190, 330], [300, 150, 420], [1500, 170, 390], [1720, 200, 300]].map(([bx, bw, bh], i) => (
        <g key={i}>
          <rect x={bx!} y={GR - 150 - bh!} width={bw!} height={bh!} fill="#9FC2D8"
            stroke="#6E90A8" strokeWidth={4} opacity={0.8} />
          <g fill="#BBD8E8" opacity={0.8}>
            {Array.from({ length: Math.floor(bh! / 56) }, (_, r) => (
              <rect key={r} x={bx! + 12} y={GR - 150 - bh! + 16 + r * 56} width={bw! - 24} height={34} />
            ))}
          </g>
        </g>
      ))}
      <RowOfBuildings x0={-20} x1={W + 20} base={GR - 140} seed={581} minH={70} maxH={190}
        fill="#A8BECC" stroke="#7892A6" sw={3.5} opacity={0.72} count={12} />

      {/* ---- タワークレーン ---- */}
      <TowerCrane x={1560} base={GR} top={210} f={f} arm={520} flip />
      {/* 吊り荷 (鉄骨の束) */}
      <g transform={`translate(${1274 + Math.sin(f / 29) * 24} ${470 + Math.sin(f / 23) * 18})`}>
        <line x1={0} y1={-200} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -70 -30 L 0 -56 L 70 -30" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-96} y={-30} width={192} height={26} fill={KRP.blue} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-96} y={-4} width={192} height={26} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ---- 中: 建てかけの現代ビル (メッシュシート) ---- */}
      <g>
        <rect x={560} y={300} width={620} height={GR - 300} fill="#D6D2C4" stroke={KRP.ink} strokeWidth={6} />
        {/* 足場とメッシュ */}
        <rect x={560} y={300} width={620} height={GR - 300} fill="#C8D8DE" opacity={0.6} />
        <g stroke="#9AA8AE" strokeWidth={2.5} opacity={0.9}>
          {Array.from({ length: 26 }, (_, i) => (<line key={i} x1={560 + i * 24} y1={300} x2={560 + i * 24} y2={GR} />))}
          {Array.from({ length: 26 }, (_, i) => (<line key={i} x1={560} y1={300 + i * 24} x2={1180} y2={300 + i * 24} />))}
        </g>
        <g stroke={C.steelDark} strokeWidth={9}>
          {[380, 500, 620, 740, 860].map((yy, i) => (<line key={i} x1={560} y1={yy} x2={1180} y2={yy} />))}
          {[600, 780, 960, 1140].map((xx, i) => (<line key={i} x1={xx} y1={300} x2={xx} y2={GR} />))}
        </g>
        {/* シートの隙間から見える柱 (ここが次の話の主役) */}
        <rect x={840} y={420} width={210} height={430} fill="#E8E4D6" stroke={KRP.ink} strokeWidth={6} />
        <IBeamV x={945} y1={430} y2={840} w={86} color="#A3B2BC" dark="#5E6A72" rivets={false} />
        <rect x={560} y={272} width={620} height={34} fill={KRP.blue} stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* ---- 地面・仮囲い ---- */}
      <rect x={-20} y={GR} width={W + 40} height={H - GR + 20} fill="#9FA6A2" />
      <rect x={-20} y={GR} width={W + 40} height={16} fill="#7E8682" />
      {/* 仮囲い (青) */}
      <rect x={-20} y={GR - 110} width={520} height={110} fill={KRP.blue} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.blueDeep} strokeWidth={4} opacity={0.8}>
        {Array.from({ length: 6 }, (_, i) => (<line key={i} x1={-20 + i * 90} y1={GR - 110} x2={-20 + i * 90} y2={GR} />))}
      </g>
      <rect x={60} y={GR - 86} width={300} height={62} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <text x={210} y={GR - 40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>工事中</text>
      <rect x={1340} y={GR - 110} width={600} height={110} fill={KRP.blue} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.blueDeep} strokeWidth={4} opacity={0.8}>
        {Array.from({ length: 7 }, (_, i) => (<line key={i} x1={1340 + i * 90} y1={GR - 110} x2={1340 + i * 90} y2={GR} />))}
      </g>

      {/* ---- 近景: 図面を見上げる作業員・コーン・鉄筋 ---- */}
      <Person x={430} y={1072} s={1.16} cloth={KRP.yellow} clothDark="#C99A2E" helmet
        face="normal" gaze={[0.6, -0.7]} lean={4} f={f} phase={1} />
      {/* 手に持った図面 */}
      <g transform="translate(560 920) rotate(-12)">
        <rect x={-10} y={-86} width={180} height={130} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#8A9AA6" strokeWidth={3}>
          {[0, 1, 2, 3].map((i) => (<line key={i} x1={6} y1={-66 + i * 30} x2={154} y2={-66 + i * 30} />))}
        </g>
        <rect x={60} y={-66} width={46} height={110} fill="none" stroke={KRP.red} strokeWidth={5} />
      </g>
      {/* 反射ベスト */}
      <rect x={386} y={810} width={90} height={18} fill="#F2F0E0" opacity={0.9} />
      <Person x={1180} y={1078} s={1.02} cloth="#E2792E" clothDark="#B85A1E" helmet
        face="normal" gaze={[-0.3, -0.7]} lean={-5} f={f} phase={5} />
      {/* カラーコーン */}
      {[740, 880, 1420, 1560].map((cx, i) => (
        <g key={i} transform={`translate(${cx} 1066) scale(${1 - i * 0.04})`}>
          <ellipse cx={0} cy={0} rx={56} ry={16} fill="#D6531E" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -36 -4 L -11 -112 L 11 -112 L 36 -4 Z" fill="#E8641E" stroke={KRP.ink} strokeWidth={5} />
          <rect x={-26} y={-72} width={52} height={18} fill={KRP.white} opacity={0.9} />
        </g>
      ))}
      {/* 鉄筋の束 */}
      <g transform="translate(1740 1058)">
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={-150 + i * 8} y1={-16 - i * 5} x2={150 + i * 8} y2={-16 - i * 5}
            stroke="#8A9298" strokeWidth={11} strokeLinecap="round" />
        ))}
        <rect x={-110} y={-70} width={16} height={74} fill="#5E6468" stroke={KRP.ink} strokeWidth={4} />
        <rect x={92} y={-70} width={16} height={74} fill="#5E6468" stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* ---- 問いかけ ---- */}
      <QMark x={945} y={556} s={1.35} f={f} t={seg(f, 10, 26)} />
      <TagPlate x={945} y={790} text="いまの柱は?" size={36} t={seg(f, 18, 32)} fill={KRP.white} />
    </Frame>
  );
};

// ===== #59 中身は、鉄と、高強度のコンクリートです。 =====
// どこ: 建てかけの高層ビルの「中」。天井はまだ無く、見上げれば鉄骨と空。
// 演出: 主役の丸い鋼管の柱を手前に据え、正面をごっそり切り取って中身を見せる。
//       上からコンクリートポンプの管が差し込まれ、どろりと流し込まれている。
// 動き: 流し込まれたコンクリートの面がじわりと上がる。管が脈打つ。粉じんが舞う。
const Kb1Cft: React.FC<{ f: number }> = ({ f }) => {
  const FL = 902;            // 打ちっぱなしの床
  const CEIL = 252;          // 上の梁
  const CX = 880, CW = 300;  // 主役の柱の中心と直径
  const CL = CX - CW / 2, CR = CX + CW / 2;
  const TW = 22;             // 鋼管の肉厚
  const HOLE_T = 404, HOLE_B = 836;              // 切り取った窓
  const HL = CL + 54, HR = CR - 54;              // 窓の左右 (外側に鋼の面を残す)
  const lv = lerp(HOLE_B - 20, HOLE_T + 38, easeOut(clamp01(seg(f, 6, 40)))); // 中身の天端
  const pulse = 1 + Math.sin(f / 7) * 0.05;
  return (
    <Frame f={f} seed={531} bg="#CFCBC2">
      {/* ---- 奥: 開口のむこうの空と街 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={FL + 40} fill="#BCD4E2" />
      <rect x={-20} y={-20} width={W + 40} height={330} fill="#A8C6DA" opacity={0.75} />
      <Cloud cx={330} cy={356} s={1.0} opacity={0.8} />
      <Cloud cx={1560} cy={318} s={0.8} opacity={0.7} />
      <Birds x={520} y={392} f={f} n={4} s={0.7} speed={0.5} color="#70889A" />
      {/* 眼下の街 (ここは高いところ、という合図) */}
      <RowOfBuildings x0={-20} x1={W + 20} base={FL - 150} seed={591} minH={60} maxH={180}
        fill="#9FB4C2" stroke="#7490A2" sw={3.2} opacity={0.5} count={14} />
      <RowOfBuildings x0={-20} x1={W + 20} base={FL - 110} seed={592} minH={40} maxH={120}
        fill="#8EA6B6" stroke="#6B8798" sw={3.2} opacity={0.62} count={11} />

      {/* ---- 上: まだ裸の鉄骨の天井 ---- */}
      <g>
        <IBeamH y={CEIL} x1={-20} x2={W + 20} h={46} color={C.steel} dark={C.steelDark} />
        <IBeamH y={CEIL - 96} x1={-20} x2={W + 20} h={30} color="#9BA5B0" dark={C.steelDark} rivets={false} />
        {[180, 520, 1240, 1620].map((bx, i) => (
          <g key={i}>
            <IBeamV x={bx} y1={CEIL - 120} y2={CEIL} w={34} color="#9BA5B0" dark={C.steelDark} rivets={false} />
            <polygon points={`${bx - 90},${CEIL - 26} ${bx - 18},${CEIL - 26} ${bx - 18},${CEIL - 96}`}
              fill="none" stroke={C.steelDark} strokeWidth={7} />
          </g>
        ))}
        {/* 仮設の吊り照明 */}
        {[420, 1360].map((lx, i) => (
          <g key={i}>
            <line x1={lx} y1={CEIL + 20} x2={lx} y2={CEIL + 98} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 44} ${CEIL + 142} L ${lx - 16} ${CEIL + 98} L ${lx + 16} ${CEIL + 98} L ${lx + 44} ${CEIL + 142} Z`}
              fill="#4E4A44" stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={lx} cy={CEIL + 142} rx={44} ry={13} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={lx} cy={CEIL + 190} rx={74} ry={34} fill={KRP.yellow} opacity={0.22} />
          </g>
        ))}
      </g>

      {/* ---- 床: 打ちっぱなしのスラブ ---- */}
      <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill="#B6B2A8" />
      <rect x={-20} y={FL} width={W + 40} height={18} fill="#8E8A80" />
      <g stroke="#A09C92" strokeWidth={4} opacity={0.9}>
        {[958, 1008, 1062, 1122].map((yy, i) => (<line key={i} x1={-20} y1={yy} x2={W + 20} y2={yy} />))}
      </g>
      {/* 床の端の立ち上がりと安全手すり */}
      <g>
        <rect x={-20} y={FL - 54} width={W + 40} height={54} fill="#C2BEB4" stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.yellow} strokeWidth={11}>
          <line x1={-20} y1={FL - 180} x2={W + 20} y2={FL - 180} />
          <line x1={-20} y1={FL - 112} x2={W + 20} y2={FL - 112} />
        </g>
        <g stroke={KRP.ink} strokeWidth={3.5} fill="none">
          <line x1={-20} y1={FL - 180} x2={W + 20} y2={FL - 180} />
          <line x1={-20} y1={FL - 112} x2={W + 20} y2={FL - 112} />
        </g>
        {[80, 400, 1320, 1640, 1880].map((px, i) => (
          <rect key={i} x={px} y={FL - 196} width={14} height={142} fill="#D6531E" stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>

      {/* ---- 奥の柱 2本 (同じ丸い鋼管) ---- */}
      {[330, 1520].map((px, i) => (
        <g key={i}>
          <rect x={px - 62} y={CEIL + 24} width={124} height={FL - CEIL - 78} fill="#99A4AE"
            stroke={KRP.ink} strokeWidth={5} />
          <rect x={px - 50} y={CEIL + 24} width={20} height={FL - CEIL - 78} fill="#C2CBD2" opacity={0.75} />
          <rect x={px + 32} y={CEIL + 24} width={16} height={FL - CEIL - 78} fill="#6E7A84" opacity={0.6} />
          <ellipse cx={px} cy={CEIL + 24} rx={62} ry={17} fill="#B4BEC6" stroke={KRP.ink} strokeWidth={5} />
          {/* 柱脚のベースプレート */}
          <rect x={px - 84} y={FL - 66} width={168} height={22} fill="#7E8A94" stroke={KRP.ink} strokeWidth={5} />
          <Rivets x1={px - 66} y1={FL - 55} x2={px + 66} y2={FL - 55} n={6} r={5} color={KRP.ink} />
        </g>
      ))}

      {/* ---- 中: コンクリートポンプの管 ---- */}
      <g>
        <path d={`M 1880 ${CEIL - 40} L 1360 ${CEIL - 40} Q ${1180 * pulse} ${CEIL - 36} ${CX + 10} ${CEIL + 30} L ${CX + 10} 352`}
          fill="none" stroke="#4E5A62" strokeWidth={54} strokeLinecap="round" />
        <path d={`M 1880 ${CEIL - 40} L 1360 ${CEIL - 40} Q ${1180 * pulse} ${CEIL - 36} ${CX + 10} ${CEIL + 30} L ${CX + 10} 352`}
          fill="none" stroke="#7E8A92" strokeWidth={34} strokeLinecap="round" opacity={0.85} />
        {/* 管の継ぎ手 */}
        {[[1700, CEIL - 40], [1430, CEIL - 40]].map(([jx, jy], i) => (
          <rect key={i} x={jx! - 13} y={jy! - 36} width={26} height={72} rx={6}
            fill={C.brass} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 吐き出し口 */}
        <rect x={CX - 36} y={340} width={92} height={40} rx={8} fill="#3E4A52" stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* ---- 主役: 切り取った丸鋼管の柱 ---- */}
      <g>
        {/* 鋼管 本体 */}
        <rect x={CL} y={300} width={CW} height={FL - 346} fill="#9DA8B2" stroke={KRP.ink} strokeWidth={6} />
        <rect x={CL + 12} y={300} width={34} height={FL - 346} fill="#C6CFD6" opacity={0.8} />
        <rect x={CR - 40} y={300} width={26} height={FL - 346} fill="#6E7A84" opacity={0.6} />
        <ellipse cx={CX} cy={300} rx={CW / 2} ry={30} fill="#AEB8C0" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={CX} cy={300} rx={CW / 2 - TW} ry={30 - 8} fill="#7E8A94" stroke={KRP.ink} strokeWidth={5} />

        {/* 切り取った窓 = 中身が見える (左右に鋼の面を残す) */}
        <g>
          {/* 中のコンクリート (まだ入っていない上側は暗い空洞) */}
          <rect x={HL} y={HOLE_T} width={HR - HL} height={HOLE_B - HOLE_T} fill="#3E3E3A" />
          <rect x={HL + TW} y={lv} width={HR - HL - TW * 2} height={HOLE_B - lv} fill="#C4C0B4" />
          <rect x={HL + TW} y={lv} width={HR - HL - TW * 2} height={14} fill="#D8D4C8" />
          {/* 骨材のつぶつぶ */}
          <g>
            {Array.from({ length: 34 }, (_, i) => {
              const gx = HL + TW + 12 + rnd(i * 3.7) * (HR - HL - TW * 2 - 24);
              const gy = lv + 28 + rnd(i * 5.9) * (HOLE_B - lv - 36);
              if (gy > HOLE_B - 8) return null;
              return <circle key={i} cx={gx} cy={gy} r={4 + rnd(i * 2.3) * 6}
                fill={i % 3 === 0 ? "#948E82" : "#A8A296"} />;
            })}
          </g>
          {/* 中の鉄筋 (縦) */}
          <g stroke="#5E6A72" strokeWidth={8} opacity={0.8}>
            {[-44, 0, 44].map((dx, i) => (
              <line key={i} x1={CX + dx} y1={Math.max(lv + 10, HOLE_T + 10)} x2={CX + dx} y2={HOLE_B - 8} />
            ))}
          </g>
          {/* 落ちているコンクリート */}
          <path d={`M ${CX - 26} 382 Q ${CX - 12 + Math.sin(f / 6) * 10} ${(lv + 382) / 2} ${CX - 8} ${lv + 4}
                    L ${CX + 42} ${lv + 4} Q ${CX + 46 + Math.sin(f / 6) * 10} ${(lv + 382) / 2} ${CX + 32} 382 Z`}
            fill="#CFCBBE" stroke={KRP.ink} strokeWidth={4} />
          {/* 窓の縁 = 鋼の肉厚が見える */}
          <rect x={HL} y={HOLE_T} width={TW} height={HOLE_B - HOLE_T} fill="#6E7A84" stroke={KRP.ink} strokeWidth={5} />
          <rect x={HR - TW} y={HOLE_T} width={TW} height={HOLE_B - HOLE_T} fill="#5E6A74" stroke={KRP.ink} strokeWidth={5} />
          <rect x={HL} y={HOLE_T} width={HR - HL} height={HOLE_B - HOLE_T} fill="none"
            stroke={KRP.ink} strokeWidth={6} />
          {/* めくれた切り口 (左にめくれ上がった鋼板) */}
          <path d={`M ${HL} ${HOLE_T} l -52 -34 l 0 ${HOLE_B - HOLE_T + 14} l 52 20 Z`}
            fill="#B4BEC6" stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${HL - 52} ${HOLE_T - 34} l 0 ${HOLE_B - HOLE_T + 14}`} stroke="#8A949C" strokeWidth={6} />
        </g>
        {/* 柱脚 */}
        <rect x={CL - 40} y={FL - 66} width={CW + 80} height={26} fill="#7E8A94" stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={CL - 18} y1={FL - 53} x2={CR + 18} y2={FL - 53} n={8} r={6} color={KRP.ink} />
      </g>

      {/* ---- 近景: 作業員と道具 ---- */}
      <Person x={430} y={1086} s={1.2} cloth="#2E6E8E" clothDark="#1E4E68" helmet
        face="normal" gaze={[0.7, -0.4]} lean={4} f={f} phase={2} />
      {/* バイブレータのホース */}
      <path d={`M 540 940 Q ${700 + Math.sin(f / 5) * 14} 1000 ${CL + 40} ${FL - 120}`}
        fill="none" stroke="#3E4A52" strokeWidth={18} strokeLinecap="round" />
      <Person x={1360} y={1080} s={1.08} cloth="#D6531E" clothDark="#A63C12" helmet
        face="normal" gaze={[-0.7, -0.4]} lean={-6} f={f} phase={6} />
      {/* 鉄筋の束と一輪車 */}
      <g transform="translate(180 1060)">
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={-130 + i * 7} y1={-14 - i * 6} x2={130 + i * 7} y2={-14 - i * 6}
            stroke="#8A9298" strokeWidth={10} strokeLinecap="round" />
        ))}
      </g>
      <g transform="translate(1680 1044)">
        <path d="M -110 0 L 110 0 L 86 -74 L -86 -74 Z" fill="#9AA2A8" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-96} cy={30} r={30} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <line x1={96} y1={-60} x2={168} y2={-96} stroke={C.wood} strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* 粉じん */}
      <g fill="#E6E2D6" opacity={0.42}>
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx={rnd(i * 4.7) * W} cy={620 + rnd(i * 2.9) * 300 - ((f * 1.1 + i * 60) % 240)}
            rx={22 + rnd(i * 6.1) * 26} ry={11 + rnd(i * 3.3) * 10} />
        ))}
      </g>

      {/* ---- 札 ---- */}
      <Arrow x={CL - 60} y={352} s={0.9} rot={0} t={seg(f, 10, 24)} />
      <TagPlate x={CL - 250} y={352} text="鋼の管" size={32} t={seg(f, 10, 24)} fill={KRP.white} />
      <Arrow x={CR + 64} y={660} s={0.9} rot={180} t={seg(f, 24, 38)} />
      <TagPlate x={CR + 348} y={660} text="中は高強度コンクリート" size={30} t={seg(f, 24, 38)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== #60 同じ太さで、昔よりずっと重い建物を支えます。 =====
// どこ: 夕方の広場。石畳、噴水、街路樹、ベンチ、街灯。
// 演出: 台座の上に同じ太さの柱を2本立て、片方に昔の煉瓦ビル、片方にいまの高層ビルを載せる。
//       柱の太さは同じ (寸法線で示す)、上に載る重さだけが違う。
// 動き: 重さの矢印が右だけ太く何本も降りてくる。噴水が上がり、鳩が歩き、人が見上げる。
const Kb1OnajiFutosa: React.FC<{ f: number }> = ({ f }) => {
  const GR = 918;
  const PED = GR - 36;        // 台座の天
  const COLT = 636;           // 柱の頭
  const CWID = 118;           // 柱の太さ (左右で同じ)
  const LX = 520, RX = 1360;
  const tOld = clamp01(seg(f, 6, 22));
  const tNew = clamp01(seg(f, 14, 34));
  return (
    <Frame f={f} seed={532} bg="#F0D9B8">
      {/* ---- 奥: 夕空 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={GR + 40} fill="#F3DCBA" />
      <rect x={-20} y={-20} width={W + 40} height={300} fill="#E8B98C" opacity={0.7} />
      <rect x={-20} y={280} width={W + 40} height={200} fill="#F6E2C0" opacity={0.6} />
      <circle cx={960} cy={430} r={86} fill="#F6C777" opacity={0.75} />
      <Cloud cx={250} cy={236} s={1.1} fill="#F7E6CE" opacity={0.85} />
      <Cloud cx={1700} cy={290} s={0.9} fill="#F7E6CE" opacity={0.75} />
      <Birds x={700} y={300} f={f} n={5} s={0.8} speed={0.5} color="#8A6E58" />
      <RowOfBuildings x0={-20} x1={W + 20} base={GR - 14} seed={601} minH={50} maxH={140}
        fill="#C19878" stroke="#96724F" sw={3.5} opacity={0.5} count={14} />

      {/* ---- 広場の石畳 ---- */}
      <rect x={-20} y={GR} width={W + 40} height={H - GR + 20} fill="#D8C4A2" />
      <g stroke="#BBA482" strokeWidth={3} opacity={0.9}>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 20 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-20 + c * 100 + (r % 2) * 50} y={GR + r * 40} width={96} height={36}
              fill="#D4C09E" />
          )))}
      </g>

      {/* ---- 広場の道具立て ---- */}
      {/* 低い植え込み (中央は空けておく: 札と人のため) */}
      {[[830, 0.9], [1096, 0.78]].map(([px, s], i) => (
        <g key={i} transform={`translate(${px!} ${GR + 14}) scale(${s!})`}>
          <rect x={-92} y={-54} width={184} height={54} fill="#C4B49A" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-100} y={-66} width={200} height={18} fill="#D2C3A8" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-44} cy={-82} r={38} fill="#7E9A66" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={14} cy={-94} r={44} fill="#8EA876" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={62} cy={-80} r={34} fill="#6E8A58" stroke={KRP.ink} strokeWidth={5} />
          {[-30, 20, 56].map((dx, k) => (
            <circle key={k} cx={dx} cy={-96 - (k % 2) * 16} r={8} fill={KRP.red} opacity={0.8} />
          ))}
        </g>
      ))}
      {/* 広場の掲示板 */}
      <g transform={`translate(1716 ${GR})`}>
        <rect x={-14} y={-150} width={14} height={150} fill="#5E5248" stroke={KRP.ink} strokeWidth={4} />
        <rect x={84} y={-150} width={14} height={150} fill="#5E5248" stroke={KRP.ink} strokeWidth={4} />
        <rect x={-30} y={-280} width={144} height={138} rx={8} fill="#E8DCC4" stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#B0A288" strokeWidth={4}>
          {[0, 1, 2, 3].map((i) => (<line key={i} x1={-12} y1={-254 + i * 30} x2={96} y2={-254 + i * 30} />))}
        </g>
        <rect x={40} y={-250} width={62} height={76} fill="#C9D9E4" stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 街路樹 */}
      {[130, 1830].map((tx, i) => (
        <g key={i}>
          <rect x={tx - 17} y={GR - 196} width={34} height={196} fill="#8A6A4A" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={tx} cy={GR - 258} r={92} fill="#7E9A66" stroke={KRP.ink} strokeWidth={6} />
          <circle cx={tx - 56} cy={GR - 214} r={60} fill="#8EA876" stroke={KRP.ink} strokeWidth={6} />
          <circle cx={tx + 56} cy={GR - 222} r={56} fill="#6E8A58" stroke={KRP.ink} strokeWidth={6} />
        </g>
      ))}
      {/* 街灯 */}
      <GasLamp x={300} y={GR} s={1.0} f={f} lit />
      <GasLamp x={1640} y={GR} s={0.92} f={f} lit />
      {/* ベンチ */}
      <g transform="translate(760 1006)">
        <rect x={-120} y={-44} width={240} height={18} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-120} y={-76} width={240} height={16} rx={6} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-104} y={-26} width={16} height={56} fill="#4E4A44" stroke={KRP.ink} strokeWidth={4} />
        <rect x={88} y={-26} width={16} height={56} fill="#4E4A44" stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 鳩 */}
      {[[640, 1058], [1120, 1078], [1210, 1062]].map(([px, py], i) => (
        <g key={i} transform={`translate(${px! + Math.sin(f / 23 + i) * 8} ${py!})`}>
          <ellipse cx={0} cy={0} rx={28} ry={18} fill="#9AA4AC" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={22} cy={-16} r={12} fill="#9AA4AC" stroke={KRP.ink} strokeWidth={4} />
          <polygon points="32,-16 48,-12 32,-8" fill={KRP.orange} />
        </g>
      ))}

      {/* ---- 左: 昔の建物 ---- */}
      <g opacity={tOld}>
        {/* 台座 */}
        <rect x={LX - 170} y={PED} width={340} height={56} fill="#C4B49A" stroke={KRP.ink} strokeWidth={6} />
        <rect x={LX - 186} y={PED - 22} width={372} height={26} fill="#D2C3A8" stroke={KRP.ink} strokeWidth={6} />
        {/* 柱 (同じ太さ・昔は鋳鉄) */}
        <IBeamV x={LX} y1={COLT} y2={PED - 22} w={CWID} color="#6E6A62" dark="#484440" />
        {/* 昔の建物: 煉瓦の低いビル */}
        <g>
          <rect x={LX - 230} y={COLT - 248} width={460} height={248} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
          <Bricks x={LX - 230} y={COLT - 248} w={460} h={248} bw={54} bh={25} opacity={0.5} />
          <rect x={LX - 248} y={COLT - 280} width={496} height={34} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 4 }, (_, c) => (
              <rect key={`${r}-${c}`} x={LX - 194 + c * 106} y={COLT - 228 + r * 54} width={58} height={38}
                fill="#6E5A4E" stroke={KRP.ink} strokeWidth={4} />
            )))}
          <rect x={LX - 230} y={COLT - 6} width={460} height={14} fill={C.brickDark} />
        </g>
        <TagPlate x={LX} y={COLT - 336} text="昔" size={34} t={seg(f, 12, 24)} fill={KRP.white} />
        {/* 重さの矢印 (建物の中を通って柱の頭へ。柱そのものは隠さない) */}
        <g opacity={0.9}>
          <LoadArrow x={LX} y1={COLT - 196} y2={COLT - 16} w={20} t={seg(f, 24, 38)} />
        </g>
      </g>

      {/* ---- 右: いまの建物 ---- */}
      <g opacity={tNew}>
        <rect x={RX - 170} y={PED} width={340} height={56} fill="#C4B49A" stroke={KRP.ink} strokeWidth={6} />
        <rect x={RX - 186} y={PED - 22} width={372} height={26} fill="#D2C3A8" stroke={KRP.ink} strokeWidth={6} />
        {/* 柱 (左とまったく同じ太さ) */}
        <IBeamV x={RX} y1={COLT} y2={PED - 22} w={CWID} color="#9DA8B2" dark="#5E6A72" />
        {/* いまの建物: 細くて高いガラスの塔 */}
        <g>
          <rect x={RX - 150} y={208} width={300} height={COLT - 208} fill="#A8C4D6" stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 11 }, (_, r) => (
            <g key={r}>
              <rect x={RX - 132} y={224 + r * 38} width={264} height={24} fill="#CFE2EC" opacity={0.9} />
              <line x1={RX - 150} y1={252 + r * 38} x2={RX + 150} y2={252 + r * 38}
                stroke="#7A9AB0" strokeWidth={3} />
            </g>
          ))}
          <g stroke="#7A9AB0" strokeWidth={3}>
            {[-76, 0, 76].map((dx, i) => (<line key={i} x1={RX + dx} y1={208} x2={RX + dx} y2={COLT} />))}
          </g>
          <rect x={RX - 166} y={184} width={332} height={30} fill="#7A9AB0" stroke={KRP.ink} strokeWidth={6} />
          <rect x={RX - 38} y={132} width={14} height={56} fill={KRP.ink} />
          <circle cx={RX - 31} cy={128} r={10} fill={KRP.red} opacity={0.7 + Math.sin(f / 8) * 0.3} />
        </g>
        {/* 重さの矢印 (太く何本も。こちらも建物の中を通す) */}
        <g opacity={0.9}>
          {[-54, -18, 18, 54].map((dx, i) => (
            <LoadArrow key={i} x={RX + dx} y1={COLT - 196} y2={COLT - 16} w={30}
              t={seg(f, 24 + i * 3, 38 + i * 3)} />
          ))}
        </g>
        <TagPlate x={RX} y={COLT - 336} text="いま" size={34} t={seg(f, 20, 32)} fill={KRP.white} />
        <TagPlate x={RX + 320} y={812} text="ずっと重い" size={32} t={seg(f, 32, 44)}
          fill={KRP.red} color={KRP.white} />
      </g>

      {/* ---- 寸法: 太さは同じ ---- */}
      <DimH x1={LX - CWID / 2} x2={LX + CWID / 2} y={700} text="" t={seg(f, 28, 40)} size={26} above />
      <DimH x1={RX - CWID / 2} x2={RX + CWID / 2} y={700} text="" t={seg(f, 28, 40)} size={26} above />
      <TagPlate x={940} y={700} text="太さは同じ" size={32} t={seg(f, 32, 44)} fill={KRP.white} />

      {/* ---- 近景: 見上げる人 ---- */}
      <Person x={880} y={1084} s={1.14} cloth="#4E6E8A" clothDark="#36506A" hair="cap"
        face="surprised" gaze={[0.6, -0.8]} lean={-4} f={f} phase={1} />
      <Person x={1026} y={1072} s={0.98} cloth="#B8563E" clothDark="#8E3C2A" hair="none"
        face="smile" gaze={[0.5, -0.8]} lean={3} f={f} phase={4} />
      <Person x={260} y={1070} s={1.0} cloth="#6A6A74" clothDark="#4A4A54" hair="cap"
        face="normal" gaze={[0.8, -0.5]} lean={2} f={f} phase={7} />
    </Frame>
  );
};

// ===== #61 日本はこれに、揺れを吸う仕掛けを足しました。 =====
// どこ: 日本の街かど。手前に電柱と電線、自販機、のれんの定食屋、縦書きの看板。
//       奥に高層ビルが2本。曇りがちの昼。
// 演出: 地面から揺れの波が広がり、街じゅうが小刻みに横揺れしている。
//       高層ビルだけが上でゆっくり大きく揺れる — そこに「仕掛けを足す」話へつなぐ。
// 動き: 看板・のれん・電線・自販機の中身が揺れる。地震計の紙がぎざぎざを描く。
const Kb1NihonYure: React.FC<{ f: number }> = ({ f }) => {
  const GR = 884;
  const sh = Math.sin(f / 5.5) * 9;          // 街の小刻みな揺れ
  const sway = Math.sin(f / 13) * 26;        // 高層ビルの頭のゆっくりした揺れ
  const ring = (f % 46) / 46;
  return (
    <Frame f={f} seed={533} bg="#DCE2E0">
      {/* ---- 奥: 曇りぎみの空と山 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={GR + 40} fill="#D2DCDE" />
      <rect x={-20} y={-20} width={W + 40} height={320} fill="#BCCCD2" opacity={0.65} />
      <Cloud cx={420} cy={200} s={1.2} fill="#EEF2F0" opacity={0.9} />
      <Cloud cx={1380} cy={168} s={1.0} fill="#EEF2F0" opacity={0.8} />
      {/* 遠くの山なみ */}
      <path d={`M -20 ${GR - 230} L 240 ${GR - 400} L 420 ${GR - 300} L 640 ${GR - 430}
                L 860 ${GR - 290} L 1080 ${GR - 380} L 1320 ${GR - 270} L 1560 ${GR - 410}
                L 1940 ${GR - 250} L 1940 ${GR} L -20 ${GR} Z`}
        fill="#9FB0AE" stroke="#7E908E" strokeWidth={4} opacity={0.75} />
      <Birds x={300} y={380} f={f} n={5} s={0.85} speed={0.5} color="#6E8080" />
      {/* 遠景の街 */}
      <RowOfBuildings x0={-20} x1={W + 20} base={GR - 150} seed={611} minH={70} maxH={200}
        fill="#B4BEBE" stroke="#8E9A9A" sw={3.2} opacity={0.65} count={14} />

      {/* ---- 中: 揺れている高層ビル 2本 ---- */}
      {[[600, 250, 300], [1180, 310, 232]].map(([bx, by, bw], i) => {
        const sw2 = sway * (i ? 0.7 : 1);
        return (
          <g key={i} transform={`translate(${bx!} ${GR - 150}) skewX(${-sw2 * 0.04})`}>
            <rect x={-bw! / 2} y={-(GR - 150 - by!)} width={bw!} height={GR - 150 - by!}
              fill="#93A8B4" stroke={KRP.ink} strokeWidth={6} />
            {/* 窓はマス目にする (横帯だけだとシャッターに見えてしまう) */}
            {(() => {
              const bh = GR - 150 - by!;
              const cols = Math.max(3, Math.round(bw! / 74));
              const rows = Math.floor(bh / 48);
              const cw = (bw! - 28) / cols;
              return Array.from({ length: rows }, (_, r) =>
                Array.from({ length: cols }, (_, c) => (
                  <rect key={`${r}-${c}`} x={-bw! / 2 + 14 + c * cw + 5} y={-bh + 18 + r * 48}
                    width={cw - 10} height={28} fill="#D8E8F0" stroke="#6E8694" strokeWidth={2.5} />
                )));
            })()}
            {/* 階を区切る水平の帯 */}
            <g fill="#7E94A0" opacity={0.8}>
              {Array.from({ length: Math.floor((GR - 150 - by!) / 192) }, (_, r) => (
                <rect key={r} x={-bw! / 2} y={-(GR - 150 - by!) + 60 + r * 192} width={bw!} height={10} />
              ))}
            </g>
            {/* 隅の柱 (建物の角が立って見えるように) */}
            <g fill="#6E8694">
              <rect x={-bw! / 2 + 2} y={-(GR - 150 - by!)} width={12} height={GR - 150 - by!} />
              <rect x={bw! / 2 - 14} y={-(GR - 150 - by!)} width={12} height={GR - 150 - by!} />
            </g>
            <rect x={-bw! / 2 - 14} y={-(GR - 150 - by!) - 26} width={bw! + 28} height={28}
              fill="#8EA4B0" stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={-(GR - 150 - by!) - 46} r={9} fill={KRP.red}
              opacity={0.6 + Math.sin(f / 7 + i) * 0.4} />
            {/* 揺れの軌跡 */}
            <path d={`M ${-sw2 * 1.6} ${-(GR - 150 - by!) - 70} q ${sw2 * 1.6} -18 ${sw2 * 3.2} 0`}
              fill="none" stroke={KRP.red} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
          </g>
        );
      })}

      {/* ---- 地面と、地面から広がる揺れの波 ---- */}
      <rect x={-20} y={GR} width={W + 40} height={H - GR + 20} fill="#9E9C94" />
      <rect x={-20} y={GR} width={W + 40} height={14} fill="#7E7C74" />
      {/* 車道の白線 */}
      <g fill="#E8E6DC" opacity={0.85}>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-40 + i * 230} y={1000} width={130} height={14} rx={6} />
        ))}
      </g>
      <g stroke="#C2C0B6" strokeWidth={5} opacity={0.8}>
        <line x1={-20} y1={944} x2={W + 20} y2={944} />
      </g>
      {/* 揺れの波紋 (地面から) */}
      {[0, 1, 2].map((k) => {
        const p = ((ring + k / 3) % 1);
        return (
          <g key={k} opacity={(1 - p) * 0.8}>
            <ellipse cx={960} cy={GR + 40} rx={200 + p * 1100} ry={24 + p * 110}
              fill="none" stroke={KRP.red} strokeWidth={9} />
          </g>
        );
      })}

      {/* ---- 中景: のれんの定食屋と看板 ---- */}
      <g transform={`translate(${sh * 0.5} 0)`}>
        <rect x={1420} y={GR - 390} width={520} height={390} fill="#C8B294" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1400} y={GR - 420} width={560} height={40} fill="#8E6E4E" stroke={KRP.ink} strokeWidth={6} />
        {/* 2階の窓 */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={1452 + i * 158} y={GR - 356} width={116} height={92}
            fill="#8EA4A8" stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 店先 */}
        <rect x={1420} y={GR - 230} width={520} height={230} fill="#E2D6BE" stroke={KRP.ink} strokeWidth={6} />
        {/* のれん (揺れる) */}
        <g transform={`translate(0 ${GR - 230}) skewX(${sh * 0.5})`}>
          <rect x={1444} y={0} width={470} height={96} fill="#2E4E6E" stroke={KRP.ink} strokeWidth={5} />
          {[1562, 1680, 1798].map((lx, i) => (
            <line key={i} x1={lx} y1={4} x2={lx} y2={96} stroke="#1E3A56" strokeWidth={5} />
          ))}
          <text x={1680} y={66} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={44} fill={KRP.white}>めし</text>
        </g>
        {/* 縦書きの袖看板 (揺れる) */}
        <g transform={`rotate(${sh * 0.35} 1400 ${GR - 400})`}>
          <rect x={1356} y={GR - 400} width={74} height={250} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          {["定", "食", "処"].map((ch, i) => (
            <text key={i} x={1393} y={GR - 340 + i * 76} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={54} fill={KRP.white}>{ch}</text>
          ))}
        </g>
      </g>

      {/* ---- 中景: 自販機とごみ箱 ---- */}
      <g transform={`translate(${sh} 0)`}>
        <rect x={168} y={GR - 300} width={200} height={300} rx={8} fill="#C8322E" stroke={KRP.ink} strokeWidth={6} />
        <rect x={188} y={GR - 276} width={160} height={150} fill="#F0ECE0" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 2 }, (_, r) =>
          Array.from({ length: 3 }, (_, c) => (
            <rect key={`${r}-${c}`} x={200 + c * 50} y={GR - 264 + r * 70} width={34} height={56} rx={5}
              fill={["#E8A42E", "#3E7A4E", "#2E5E9E"][c]} stroke={KRP.ink} strokeWidth={4}
              transform={`translate(${Math.sin(f / 5 + c + r) * 3} 0)`} />
          )))}
        <rect x={188} y={GR - 112} width={160} height={30} rx={6} fill="#3A3632" stroke={KRP.ink} strokeWidth={5} />
        <rect x={214} y={GR - 66} width={110} height={38} rx={6} fill="#5E5A54" stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g transform={`translate(${sh * 0.8} 0)`}>
        <rect x={400} y={GR - 128} width={100} height={128} rx={8} fill="#7E8A84" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={450} cy={GR - 128} rx={52} ry={14} fill="#9AA6A0" stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ---- 近景: 電柱と電線 ---- */}
      <Wires x0={-20} x1={W + 20} y={300} n={4} sag={34} color="#4E4A44" opacity={0.6} />
      <g transform={`translate(${96 + sh * 1.2} 0)`}>
        <rect x={790} y={180} width={46} height={GR - 180 + 90} fill="#B4B0A6" stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={6}>
          <line x1={700} y1={252} x2={926} y2={252} />
          <line x1={716} y1={330} x2={910} y2={330} />
        </g>
        {[716, 776, 850, 910].map((ix, i) => (
          <g key={i}>
            <rect x={ix - 9} y={228} width={18} height={26} fill="#7E8A92" stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={ix} cy={224} rx={15} ry={9} fill="#D6D2C6" stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 変圧器 */}
        <rect x={846} y={356} width={86} height={130} rx={10} fill="#8E948E" stroke={KRP.ink} strokeWidth={6} />
        <rect x={846} y={376} width={86} height={12} fill="#6E746E" />
        <rect x={846} y={440} width={86} height={12} fill="#6E746E" />
      </g>

      {/* ---- 近景: 身構える人と、倒れかけた自転車 ---- */}
      <Person x={1120} y={1082} s={1.18} cloth="#3E5E7E" clothDark="#2A4258" hair="cap"
        face="surprised" gaze={[-0.5, -0.5]} lean={sh * 0.5} f={f} phase={1} />
      <Person x={1296} y={1074} s={1.0} cloth="#8E6E4E" clothDark="#6A5038" hair="none"
        face="worried" gaze={[-0.6, -0.3]} lean={-sh * 0.4} f={f} phase={5} />
      <g transform={`translate(600 1062) rotate(${12 + sh * 0.4})`}>
        <circle cx={-86} cy={0} r={54} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <circle cx={86} cy={0} r={54} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <path d="M -86 0 L -20 -62 L 60 -62 L 86 0 M -20 -62 L 0 0 L 86 0" fill="none"
          stroke="#2E6E8E" strokeWidth={10} strokeLinecap="round" />
        <line x1={60} y1={-62} x2={96} y2={-92} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      </g>

      {/* ---- 地震計の紙 (右下の小道具) ---- */}
      <g transform="translate(1660 996)">
        <rect x={-180} y={-74} width={360} height={148} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d={Array.from({ length: 36 }, (_, i) => {
          const px = -168 + i * 9.4;
          const py = Math.sin((i + f * 0.6) / 1.3) * (i > 12 ? 44 : 7);
          return `${i === 0 ? "M" : "L"} ${px} ${py}`;
        }).join(" ")} fill="none" stroke={KRP.red} strokeWidth={5} />
        <line x1={-180} y1={-40} x2={180} y2={-40} stroke="#C8C4B8" strokeWidth={3} />
        <line x1={-180} y1={40} x2={180} y2={40} stroke="#C8C4B8" strokeWidth={3} />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={300} y={252} text="日本" size={36} t={seg(f, 4, 16)} fill={KRP.white} />
      <TagPlate x={1020} y={640} text="よく揺れる" size={32} t={seg(f, 14, 28)} fill={KRP.red} color={KRP.white} />
      <TagPlate x={700} y={812} text="揺れを吸う仕掛けを足す" size={30} t={seg(f, 28, 42)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== #62 基礎にゴムを挟んで、地面と建物を切り離す。 =====
// どこ: 建物の足もと「免震ピット」の断面。地面を切って、床下をのぞきこんでいる。
// 演出: 上は建物の底 (動く)、下は基礎と地盤 (動かない)。その間に積層ゴムが挟まる。
//       建物の端と、ピットの壁のあいだに「すきま」がある — ここが切り離されている印。
// 動き: 積層ゴムが斜めにせん断して、上の建物だけが左右にずれる。点検の人が見上げる。
const Kb1MenshinGomu: React.FC<{ f: number }> = ({ f }) => {
  const SKY = 196;             // 地上の地面の線
  const SOIL_B = 352;          // 表土の下端 = ピットの天井のあたり
  const SLB_T = 356, SLB_B = 448;   // 建物の底のスラブ
  const BR_T = 492, BR_B = 646;     // 積層ゴムの上下
  const FD_T = 700, FD_B = 806;     // 基礎の版
  const PIT_F = 806;           // ピットの床
  const dx = Math.sin(f / 14) * 34 * easeOut(clamp01(seg(f, 8, 34)));  // 上だけ横にずれる
  const BX = [430, 960, 1490];
  // 積層ゴム 1基 (ゴムと鋼板の縞。上ほど横にずれて、せん断して見える)
  const Bearing: React.FC<{ x: number; w: number; cut?: boolean }> = ({ x, w, cut = false }) => {
    const n = 11;
    const hh = (BR_B - BR_T) / n;
    return (
      <g>
        {/* 上下のフランジ */}
        <rect x={x - w / 2 - 26 + dx} y={BR_T - 26} width={w + 52} height={26}
          fill="#7E8A94" stroke={KRP.ink} strokeWidth={5} />
        <rect x={x - w / 2 - 26} y={BR_B} width={w + 52} height={26}
          fill="#7E8A94" stroke={KRP.ink} strokeWidth={5} />
        {/* 縞 */}
        {Array.from({ length: n }, (_, i) => {
          const p = 1 - i / (n - 1);             // 上ほど 1
          const ox = dx * p;
          const yy = BR_T + i * hh;
          return (
            <g key={i}>
              <rect x={x - w / 2 + ox} y={yy} width={w} height={hh}
                fill={i % 2 ? "#3A3630" : "#4E4A44"} stroke={KRP.ink} strokeWidth={3} />
              {i % 2 === 1 && (
                <rect x={x - w / 2 + ox} y={yy + hh - 7} width={w} height={7} fill="#A8B2B8" />
              )}
              {cut && i % 2 === 1 && (
                <rect x={x - w / 2 + ox + 10} y={yy + 5} width={w * 0.26} height={5} rx={2.5}
                  fill="#6E6A62" />
              )}
            </g>
          );
        })}
        {/* アンカーボルト */}
        <Rivets x1={x - w / 2 - 12} y1={BR_B + 13} x2={x + w / 2 + 12} y2={BR_B + 13}
          n={5} r={6} color={KRP.ink} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={534} bg="#C6BCA8">
      {/* ---- 地上 (のぞいている場所の目印) ---- */}
      <rect x={-20} y={-20} width={W + 40} height={SKY + 20} fill="#BFD6E4" />
      <RowOfBuildings x0={-20} x1={W + 20} base={SKY} seed={621} minH={50} maxH={130}
        fill="#A2B8C6" stroke="#7E96A6" sw={3} opacity={0.6} count={12} />
      <rect x={-20} y={SKY - 16} width={W + 40} height={18} fill="#9A9890" stroke={KRP.ink} strokeWidth={4} />
      {/* 地上に立っている建物の足もと (ずれるのはこちら) */}
      <g transform={`translate(${dx} 0)`}>
        <rect x={260} y={40} width={1400} height={SKY - 56} fill="#C8D6DE" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={300 + i * 150} y={72} width={106} height={74} fill="#8EAAB8"
            stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      {/* 断面の切り口 (ギザギザ) */}
      <path d={Array.from({ length: 25 }, (_, i) =>
        `${i === 0 ? "M" : "L"} ${-20 + i * 80} ${SKY + 2 + (i % 2) * 20}`).join(" ") + ` L ${W + 20} ${SOIL_B} L -20 ${SOIL_B} Z`}
        fill={C.soil} stroke={KRP.ink} strokeWidth={5} />
      {/* 表土の小石 */}
      <g fill={C.soilDark} opacity={0.6}>
        {Array.from({ length: 30 }, (_, i) => (
          <ellipse key={i} cx={rnd(i * 3.1) * W} cy={SKY + 40 + rnd(i * 5.3) * 100}
            rx={7 + rnd(i * 2.1) * 9} ry={5 + rnd(i * 4.4) * 6} />
        ))}
      </g>

      {/* ---- ピットの中 (暗い) ---- */}
      <rect x={-20} y={SOIL_B} width={W + 40} height={H - SOIL_B + 20} fill="#6E6A62" />
      <rect x={-20} y={SOIL_B} width={W + 40} height={10} fill="#4E4A44" />
      {/* ピットの壁 (動かない側) */}
      {[[-20, 246], [1694, 286]].map(([wx, ww], i) => (
        <g key={i}>
          <rect x={wx!} y={SOIL_B} width={ww!} height={PIT_F - SOIL_B + 40} fill="#A8A498"
            stroke={KRP.ink} strokeWidth={6} />
          <g stroke="#8E8A80" strokeWidth={4} opacity={0.8}>
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={wx!} y1={SOIL_B + 60 + k * 110} x2={wx! + ww!} y2={SOIL_B + 60 + k * 110} />
            ))}
          </g>
        </g>
      ))}
      {/* 壁の作業灯 */}
      {[[176, 470], [1748, 470]].map(([lx, ly], i) => (
        <g key={i}>
          <rect x={lx! - 16} y={ly! - 14} width={32} height={28} rx={5} fill="#4E4A44"
            stroke={KRP.ink} strokeWidth={4} />
          <circle cx={lx!} cy={ly!} r={15} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <polygon points={`${lx!},${ly!} ${lx! + (i ? -240 : 240)},${ly! + 210} ${lx! + (i ? -40 : 40)},${ly! + 250}`}
            fill={KRP.yellow} opacity={0.14} />
        </g>
      ))}

      {/* ---- 下: 基礎の版と地盤 (動かない) ---- */}
      <rect x={-20} y={FD_T} width={W + 40} height={FD_B - FD_T} fill="#B4AEA0" stroke={KRP.ink} strokeWidth={6} />
      <g stroke="#9A9486" strokeWidth={4} opacity={0.9}>
        {Array.from({ length: 14 }, (_, i) => (<line key={i} x1={-20 + i * 142} y1={FD_T} x2={-20 + i * 142} y2={FD_B} />))}
      </g>
      <rect x={-20} y={FD_B} width={W + 40} height={H - FD_B + 20} fill={C.clay} />
      <g fill={C.clayDark} opacity={0.5}>
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse key={i} cx={rnd(i * 6.7) * W} cy={FD_B + 26 + rnd(i * 2.9) * 210}
            rx={12 + rnd(i * 3.9) * 20} ry={7 + rnd(i * 5.1) * 11} />
        ))}
      </g>
      {/* 基礎の台座 */}
      {BX.map((bx, i) => (
        <rect key={i} x={bx - 132} y={BR_B + 26} width={264} height={FD_T - BR_B - 26}
          fill="#BEB8AA" stroke={KRP.ink} strokeWidth={6} />
      ))}

      {/* ---- 上: 建物の底 (動く) ---- */}
      <g transform={`translate(${dx} 0)`}>
        <rect x={260} y={SLB_T} width={1400} height={SLB_B - SLB_T} fill="#CFCABC"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={260} y={SLB_B - 16} width={1400} height={16} fill="#A8A294" />
        <g stroke="#B0AA9C" strokeWidth={4} opacity={0.9}>
          {Array.from({ length: 12 }, (_, i) => (<line key={i} x1={300 + i * 116} y1={SLB_T} x2={300 + i * 116} y2={SLB_B} />))}
        </g>
        {/* 建物の柱 (スラブから上へ抜ける) */}
        {BX.map((bx, i) => (
          <g key={i}>
            <rect x={bx - 58} y={SOIL_B - 10} width={116} height={SLB_T - SOIL_B + 14}
              fill="#9DA8B2" stroke={KRP.ink} strokeWidth={6} />
            <rect x={bx - 46} y={SOIL_B - 10} width={20} height={SLB_T - SOIL_B + 14} fill="#C6CFD6" opacity={0.7} />
          </g>
        ))}
        {/* ゴムに載る台座 */}
        {BX.map((bx, i) => (
          <rect key={i} x={bx - 112} y={SLB_B} width={224} height={BR_T - SLB_B - 26}
            fill="#C2BCAE" stroke={KRP.ink} strokeWidth={6} />
        ))}
      </g>

      {/* ---- 積層ゴム 3基 (中央が主役で大きい) ---- */}
      <Bearing x={BX[0]!} w={168} />
      <Bearing x={BX[2]!} w={168} />
      <Bearing x={BX[1]!} w={204} cut />

      {/* ---- すきま (切り離されている印) ---- */}
      <g>
        <rect x={226 + dx} y={SLB_T} width={34} height={SLB_B - SLB_T} fill={KRP.yellow} opacity={0.5} />
        <rect x={1660 + dx} y={SLB_T} width={34} height={SLB_B - SLB_T} fill={KRP.yellow} opacity={0.5} />
        <DimH x1={1660 + dx} x2={1694 + dx} y={SLB_T - 40} text="すきま" t={seg(f, 26, 40)} size={26} above />
      </g>
      {/* 上だけ動く、という矢印 */}
      <g opacity={clamp01(seg(f, 18, 32))}>
        <Arrow x={1240 + dx} y={402} s={0.7} rot={dx > 0 ? 0 : 180} t={1} color={KRP.red} />
      </g>

      {/* ---- 点検の人 ---- */}
      <Person x={1580} y={PIT_F + 2} s={0.88} cloth="#2E6E8E" clothDark="#1E4E68" helmet
        face="normal" gaze={[-0.6, -0.7]} lean={-5} f={f} phase={3} />
      {/* 懐中電灯の光 */}
      <g opacity={0.3}>
        <polygon points={`1510,700 1270,560 1290,660`} fill={KRP.yellow} />
      </g>
      <Person x={344} y={PIT_F + 2} s={0.8} cloth="#D6531E" clothDark="#A63C12" helmet
        face="normal" gaze={[0.7, -0.5]} lean={4} f={f} phase={6} />

      {/* ---- 札 ---- */}
      <Arrow x={BX[1]! - 150} y={570} s={0.9} rot={0} t={seg(f, 12, 26)} />
      <TagPlate x={BX[1]! - 420} y={570} text="積層ゴム" size={32} t={seg(f, 12, 26)} fill={KRP.white} />
      <TagPlate x={700} y={756} text="土台は動かない" size={28} t={seg(f, 30, 42)} fill={KRP.white} />
      <TagPlate x={1290} y={756} text="地面と切り離す" size={32} t={seg(f, 30, 42)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== #63 建物の中に油の筒を仕込んで、揺れを熱に変える。 =====
// どこ: ビルのある階の中。ガラス張りの外壁ぎわに、むき出しの斜め材 (ブレース) が走っている。
// 演出: 斜め材の途中に太い筒 = オイルダンパー。筒だけ断面にして、中の油とピストンを見せる。
//       筒のまわりに熱のゆらぎ。温度計が上がる。
// 動き: ピストンが行ったり来たりし、油がかき回され、熱のもやが立ちのぼる。
const Kb1OilDamper: React.FC<{ f: number }> = ({ f }) => {
  const FL = 902, CEIL = 236;
  const AX = 520, AY = 846, BX2 = 1420, BY2 = 330;    // ブレースの両端
  const ang = (Math.atan2(BY2 - AY, BX2 - AX) * 180) / Math.PI;
  const MX = (AX + BX2) / 2, MY = (AY + BY2) / 2;     // 筒の中心
  const braceLen = Math.hypot(BX2 - AX, BY2 - AY);     // 斜め材の実長
  const stroke = Math.sin(f / 9) * 46;                 // ピストンの往復
  const heat = clamp01(seg(f, 16, 40));
  return (
    <Frame f={f} seed={535} bg="#E6E2D6">
      {/* ---- 奥: ガラスの外壁と、その向こうの街 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={FL + 40} fill="#CFE0EA" />
      <rect x={-20} y={-20} width={W + 40} height={300} fill="#B6D2E2" opacity={0.7} />
      <Cloud cx={420} cy={250} s={1.0} opacity={0.8} />
      <Cloud cx={1540} cy={300} s={0.8} opacity={0.7} />
      <Birds x={700} y={330} f={f} n={4} s={0.7} speed={0.5} color="#789AAE" />
      <RowOfBuildings x0={-20} x1={W + 20} base={FL - 120} seed={631} minH={90} maxH={260}
        fill="#9FBACC" stroke="#7794A8" sw={3.2} opacity={0.5} count={12} />
      <RowOfBuildings x0={-20} x1={W + 20} base={FL - 70} seed={632} minH={50} maxH={150}
        fill="#8CA8BC" stroke="#6B899E" sw={3.2} opacity={0.6} count={9} />
      {/* ガラスの方立て (縦) と無目 (横) */}
      <g>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={-20 + i * 206} y={CEIL + 40} width={22} height={FL - CEIL - 100}
            fill="#B8BEC2" stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={-20} y={CEIL + 40} width={W + 40} height={22} fill="#B8BEC2" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-20} y={560} width={W + 40} height={18} fill="#B8BEC2" stroke={KRP.ink} strokeWidth={5} />
        <rect x={-20} y={FL - 82} width={W + 40} height={26} fill="#A8AEB2" stroke={KRP.ink} strokeWidth={5} />
        {/* 映り込み */}
        <g fill={KRP.white} opacity={0.22}>
          {[120, 740, 1360].map((gx, i) => (
            <polygon key={i} points={`${gx},${CEIL + 62} ${gx + 120},${CEIL + 62} ${gx - 80},${FL - 82} ${gx - 200},${FL - 82}`} />
          ))}
        </g>
      </g>

      {/* ---- 天井 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={CEIL + 20} fill="#DCD8CC" stroke={KRP.ink} strokeWidth={6} />
      <g stroke="#C2BEB2" strokeWidth={4}>
        {Array.from({ length: 13 }, (_, i) => (<line key={i} x1={-20 + i * 152} y1={-20} x2={-20 + i * 152} y2={CEIL} />))}
        <line x1={-20} y1={120} x2={W + 20} y2={120} />
      </g>
      {[260, 760, 1260, 1760].map((lx, i) => (
        <g key={i}>
          <rect x={lx - 54} y={CEIL - 22} width={108} height={22} rx={5} fill="#F2EFE2"
            stroke={KRP.ink} strokeWidth={5} />
          <polygon points={`${lx - 54},${CEIL} ${lx + 54},${CEIL} ${lx + 150},${FL - 60} ${lx - 150},${FL - 60}`}
            fill={KRP.yellow} opacity={0.15} />
        </g>
      ))}
      {/* 天井のむき出しダクト (オフィスの空気感) */}
      <g>
        <rect x={-20} y={96} width={W + 40} height={66} fill="#C8C4B8" stroke={KRP.ink} strokeWidth={5} />
        <g stroke="#ABA79B" strokeWidth={4}>
          {Array.from({ length: 17 }, (_, i) => (<line key={i} x1={40 + i * 116} y1={96} x2={40 + i * 116} y2={162} />))}
        </g>
        {[430, 1130, 1700].map((vx, i) => (
          <g key={i}>
            <rect x={vx - 52} y={162} width={104} height={30} rx={5} fill="#B4B0A4"
              stroke={KRP.ink} strokeWidth={5} />
            <g stroke={KRP.ink} strokeWidth={3.5}>
              {[0, 1, 2].map((k) => (<line key={k} x1={vx - 40} y1={170 + k * 8} x2={vx + 40} y2={170 + k * 8} />))}
            </g>
          </g>
        ))}
      </g>

      {/* ---- 床 ---- */}
      <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill="#C4B9A6" />
      <g stroke="#AEA28E" strokeWidth={4} opacity={0.9}>
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 13 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-20 + c * 152 + (r % 2) * 76} y={FL + r * 36} width={148} height={32}
              fill="#C8BDAA" />
          )))}
      </g>

      {/* ---- 室内の物 (ここはビルの中だ、という合図) ---- */}
      {/* 観葉植物 */}
      <g transform="translate(180 1000)">
        <path d="M -56 0 L 56 0 L 42 -86 L -42 -86 Z" fill="#B4603E" stroke={KRP.ink} strokeWidth={6} />
        {[-1, -0.4, 0.3, 1].map((k, i) => (
          <path key={i} d={`M 0 -86 Q ${k * 90} ${-150 - i * 16} ${k * 130} ${-250 + i * 26}`}
            fill="none" stroke="#5E8A52" strokeWidth={14} strokeLinecap="round" />
        ))}
      </g>
      {/* 机と椅子 */}
      <g transform="translate(1700 1010)">
        <rect x={-150} y={-120} width={300} height={20} rx={5} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-134} y={-100} width={16} height={100} fill="#6E5A46" stroke={KRP.ink} strokeWidth={4} />
        <rect x={118} y={-100} width={16} height={100} fill="#6E5A46" stroke={KRP.ink} strokeWidth={4} />
        <rect x={-104} y={-168} width={92} height={56} rx={6} fill="#4E5A62" stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ---- 主役: 斜めのブレース + 油の筒 ---- */}
      <g>
        {/* 取り付け部 */}
        <polygon points={`${AX - 110},${AY + 40} ${AX + 70},${AY + 40} ${AX + 34},${AY - 80}`}
          fill="#8A94A0" stroke={KRP.ink} strokeWidth={6} />
        <polygon points={`${BX2 + 110},${BY2 - 46} ${BX2 - 70},${BY2 - 46} ${BX2 - 34},${BY2 + 74}`}
          fill="#8A94A0" stroke={KRP.ink} strokeWidth={6} />
        {/* 斜め材 (回転群の中では水平に描く。長さは両端の実距離で取る) */}
        <g transform={`rotate(${ang} ${MX} ${MY})`}>
          <rect x={MX - braceLen / 2 - 60} y={MY - 27} width={braceLen + 120} height={54}
            fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        </g>
        <g transform={`rotate(${ang} ${MX} ${MY})`}>
          {/* 筒 (断面) */}
          <rect x={MX - 230} y={MY - 62} width={460} height={124} rx={14}
            fill="#5E6A72" stroke={KRP.ink} strokeWidth={7} />
          {/* 中の油 */}
          <rect x={MX - 212} y={MY - 46} width={424} height={92} rx={8} fill="#D69A2E" />
          <g fill="#E8B94E" opacity={0.75}>
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={MX - 190 + i * 48} cy={MY - 20 + Math.sin(f / 6 + i) * 14}
                rx={16} ry={9} />
            ))}
          </g>
          {/* ピストンの頭 */}
          <rect x={MX - 26 + stroke} y={MY - 46} width={52} height={92} rx={6}
            fill="#B8C0C6" stroke={KRP.ink} strokeWidth={6} />
          {/* 小穴から噴き出す油 */}
          <g stroke="#B87A1E" strokeWidth={5} opacity={0.9}>
            <line x1={MX - 26 + stroke} y1={MY - 24} x2={MX - 76 + stroke} y2={MY - 24} />
            <line x1={MX + 26 + stroke} y1={MY + 22} x2={MX + 76 + stroke} y2={MY + 22} />
          </g>
          {/* ピストンの棒 */}
          <rect x={MX + 26 + stroke} y={MY - 17} width={300} height={34}
            fill="#C6CED4" stroke={KRP.ink} strokeWidth={6} />
          {/* 筒の縁 */}
          <rect x={MX - 230} y={MY - 62} width={460} height={124} rx={14}
            fill="none" stroke={KRP.ink} strokeWidth={7} />
          <Rivets x1={MX - 200} y1={MY - 48} x2={MX + 200} y2={MY - 48} n={8} r={5} color="#3E464C" />
        </g>
        {/* 往復の矢印 */}
        <g opacity={clamp01(seg(f, 10, 24))}>
          <Arrow x={AX - 36} y={AY - 118} s={0.55} rot={ang + 180} t={1} color={KRP.red} />
          <Arrow x={BX2 + 36} y={BY2 + 112} s={0.55} rot={ang} t={1} color={KRP.red} />
        </g>
      </g>

      {/* ---- 熱 ---- */}
      <g opacity={heat}>
        <ellipse cx={MX} cy={MY} rx={300} ry={190} fill={KRP.orange} opacity={0.14} />
        {Array.from({ length: 7 }, (_, i) => {
          const hx = MX - 210 + i * 70;
          const rise = ((f * 1.6 + i * 40) % 200);
          return (
            <path key={i} d={`M ${hx} ${MY - 90 - rise} q 20 -26 0 -52 q -20 -26 0 -52`}
              fill="none" stroke={KRP.orange} strokeWidth={6} strokeLinecap="round"
              opacity={0.75 * (1 - rise / 200)} />
          );
        })}
        {/* 温度計 */}
        <g transform="translate(1660 560)">
          <rect x={-18} y={-180} width={36} height={190} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={28} r={38} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-9} y={-150 + (1 - heat) * 140} width={18} height={150 * heat + 10} rx={9} fill={KRP.red} />
          <g stroke={KRP.ink} strokeWidth={4}>
            {[0, 1, 2, 3].map((i) => (<line key={i} x1={18} y1={-150 + i * 46} x2={40} y2={-150 + i * 46} />))}
          </g>
        </g>
      </g>

      {/* ---- 指さす技術者 ---- */}
      <Person x={880} y={1072} s={1.14} cloth="#3E5E7E" clothDark="#2A4258" helmet glasses
        face="normal" gaze={[0.4, -0.7]} lean={5} f={f} phase={2} />
      <line x1={944} y1={840} x2={1056} y2={736} stroke="#3E5E7E" strokeWidth={24} strokeLinecap="round" />
      <circle cx={1062} cy={730} r={16} fill="#E9D9BE" stroke={KRP.ink} strokeWidth={4} />
      <Person x={1116} y={1066} s={0.96} cloth="#D6531E" clothDark="#A63C12" helmet
        face="smile" gaze={[-0.4, -0.6]} lean={-4} f={f} phase={6} />

      {/* ---- 札 ---- */}
      <Arrow x={MX - 330} y={MY + 36} s={0.9} rot={0} t={seg(f, 8, 22)} />
      <TagPlate x={MX - 600} y={MY + 36} text="油の筒" size={32} t={seg(f, 8, 22)} fill={KRP.white} />
      <TagPlate x={1440} y={806} text="揺れが熱に変わる" size={32} t={seg(f, 28, 42)}
        fill={KRP.orange} color={KRP.white} />
    </Frame>
  );
};

// ===== #64 硬くして耐えるのではなく、逃がして捨てるんです。 =====
// どこ: 振動実験室。並んだ2台の振動台に、同じ大きさの模型が載っている。
// 演出: 左は硬い模型 — 台の動きがそのまま伝わって、柱にひびが入る (×)。
//       右はゴムとダンパー付き — 台だけ動いて、模型はゆっくり傾くだけ (○)。
// 動き: 2台の台が同じだけ動く。左の模型は激しく、右の模型はほとんど動かない。
//       奥の記録計に、大きい波と小さい波が並んで描かれる。
const Kb1NigasuSuteru: React.FC<{ f: number }> = ({ f }) => {
  const FL = 918, CEIL = 206;
  const TBL = 836;                        // 振動台の天
  const d = Math.sin(f / 8) * 30;         // 台の動き (左右で同じ)
  const hard = d * 2.2;                   // 硬い方は上まで揺れが伝わる
  const soft = d * 0.22;                  // 逃がす方はほとんど伝わらない
  const LX = 520, RX = 1400;
  return (
    <Frame f={f} seed={536} bg="#D8DCDA">
      {/* ---- 実験室の壁と天井 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={FL + 40} fill="#CBD2D2" />
      <rect x={-20} y={-20} width={W + 40} height={CEIL + 20} fill="#B8C0C2" stroke={KRP.ink} strokeWidth={6} />
      <g stroke="#9EA8AA" strokeWidth={4}>
        {Array.from({ length: 13 }, (_, i) => (<line key={i} x1={-20 + i * 152} y1={-20} x2={-20 + i * 152} y2={CEIL} />))}
      </g>
      {/* 天井のトラスと照明 */}
      <g stroke="#8A9496" strokeWidth={7} fill="none">
        <line x1={-20} y1={CEIL + 44} x2={W + 20} y2={CEIL + 44} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${-20 + i * 126} ${CEIL} L ${43 + i * 126} ${CEIL + 44} L ${106 + i * 126} ${CEIL}`} />
        ))}
      </g>
      {[300, 960, 1620].map((lx, i) => (
        <g key={i}>
          <line x1={lx} y1={CEIL + 44} x2={lx} y2={CEIL + 96} stroke={KRP.ink} strokeWidth={5} />
          <rect x={lx - 74} y={CEIL + 96} width={148} height={30} rx={6} fill="#F2EFE2"
            stroke={KRP.ink} strokeWidth={5} />
          <polygon points={`${lx - 74},${CEIL + 126} ${lx + 74},${CEIL + 126} ${lx + 190},${FL} ${lx - 190},${FL}`}
            fill={KRP.yellow} opacity={0.07} />
        </g>
      ))}
      {/* 壁の計測ラック */}
      <g transform="translate(960 0)">
        <rect x={-290} y={430} width={580} height={300} rx={10} fill="#8E9698" stroke={KRP.ink} strokeWidth={6} />
        {/* 記録計の紙: 左は大きい波、右は小さい波 */}
        {[[-150, 2.2], [150, 0.4]].map(([px, amp], i) => (
          <g key={i} transform={`translate(${px!} 530)`}>
            <rect x={-116} y={-76} width={232} height={152} rx={8} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={6} />
            <path d={Array.from({ length: 30 }, (_, k) => {
              const qx = -106 + k * 7.3;
              const qy = Math.sin((k + f * 0.5) / 1.4) * 26 * amp!;
              return `${k === 0 ? "M" : "L"} ${qx} ${Math.max(-62, Math.min(62, qy))}`;
            }).join(" ")} fill="none" stroke={i ? KRP.green : KRP.red} strokeWidth={5} />
            <line x1={-116} y1={0} x2={116} y2={0} stroke="#C8C4B8" strokeWidth={3} />
          </g>
        ))}
        {/* つまみ */}
        <g>
          {[-200, -120, 120, 200].map((kx, i) => (
            <circle key={i} cx={kx} cy={678} r={20} fill="#D6D2C6" stroke={KRP.ink} strokeWidth={5} />
          ))}
        </g>
        <rect x={-290} y={640} width={580} height={10} fill="#6E7678" />
      </g>
      {/* ケーブルラック */}
      <path d="M -20 392 Q 300 420 560 392 M 1360 392 Q 1660 420 1940 392"
        fill="none" stroke="#5E6668" strokeWidth={14} strokeLinecap="round" />
      {/* 壁の表示板 (左) と時計 (右) */}
      <g transform="translate(186 326)">
        <rect x={-120} y={-72} width={240} height={144} rx={8} fill="#E8E4D8"
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={-120} y={-72} width={240} height={34} fill="#D6531E" />
        <text x={0} y={-46} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={24} fill={KRP.white}>振動実験室</text>
        <g stroke="#A8B0B2" strokeWidth={5}>
          {[0, 1, 2].map((i) => (<line key={i} x1={-92} y1={-8 + i * 30} x2={92} y2={-8 + i * 30} />))}
        </g>
      </g>
      <g transform="translate(1760 326)">
        <circle cx={0} cy={0} r={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={Math.cos((i * 90 * Math.PI) / 180) * 44} y1={Math.sin((i * 90 * Math.PI) / 180) * 44}
              x2={Math.cos((i * 90 * Math.PI) / 180) * 54} y2={Math.sin((i * 90 * Math.PI) / 180) * 54} />
          ))}
        </g>
        <line x1={0} y1={0} x2={26} y2={-22} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <line x1={0} y1={0} x2={-14} y2={40} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
      </g>

      {/* ---- 床 ---- */}
      <rect x={-20} y={FL} width={W + 40} height={H - FL + 20} fill="#AEB4B2" />
      <rect x={-20} y={FL} width={W + 40} height={14} fill="#8A9290" />
      <g stroke="#9AA2A0" strokeWidth={4} opacity={0.9}>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 14 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-20 + c * 142 + (r % 2) * 71} y={FL + r * 36} width={138} height={32}
              fill="#B2B8B6" />
          )))}
      </g>

      {/* ---- 2台の振動台 ---- */}
      {[[LX, -1], [RX, 1]].map(([tx, side], i) => (
        <g key={i}>
          {/* 台座 */}
          <rect x={tx! - 260} y={TBL + 44} width={520} height={FL - TBL - 44}
            fill="#8E9698" stroke={KRP.ink} strokeWidth={6} />
          {/* 動く天板 */}
          <rect x={tx! - 250 + d} y={TBL} width={500} height={44} rx={6}
            fill="#B8C0C2" stroke={KRP.ink} strokeWidth={6} />
          <g stroke="#7E8688" strokeWidth={4}>
            {[-160, 0, 160].map((kx, k) => (
              <line key={k} x1={tx! + kx + d} y1={TBL} x2={tx! + kx + d} y2={TBL + 44} />
            ))}
          </g>
          {/* 加振ピストン: 筒は床に固定、棒だけが天板と一緒に伸び縮みする */}
          <g>
            {/* 棒 (筒の口 → 動く天板の側面) */}
            <rect
              x={Math.min(tx! + side! * 300, tx! + side! * 250 + d)}
              y={TBL + 68}
              width={Math.abs(side! * 300 - (side! * 250 + d))}
              height={20} fill="#C6CED4" stroke={KRP.ink} strokeWidth={4} />
            {/* 筒 */}
            <rect x={tx! + side! * 300 - 40} y={TBL + 52} width={80} height={54} rx={8}
              fill="#5E6A72" stroke={KRP.ink} strokeWidth={6} />
          </g>
          {/* 台の動きの矢印 (左右とも同じ) */}
          <g opacity={clamp01(seg(f, 6, 18))}>
            <Arrow x={tx! - 270} y={FL - 36} s={0.5} rot={180} t={1} color={KRP.ink} />
            <Arrow x={tx! + 270} y={FL - 36} s={0.5} rot={0} t={1} color={KRP.ink} />
          </g>
        </g>
      ))}

      {/* ---- 左: 硬い模型 (ひびが入る) ---- */}
      <g>
        <g transform={`translate(${d} 0)`}>
          {/* 硬い柱 4本 */}
          {[-150, -50, 50, 150].map((kx, i) => (
            <g key={i} transform={`translate(0 836) skewX(${-hard * 0.03}) translate(0 -836)`}>
              <rect x={LX + kx - 22} y={566} width={44} height={270} fill="#A8A294"
                stroke={KRP.ink} strokeWidth={6} />
            </g>
          ))}
          <rect x={LX - 206} y={520} width={412} height={50} fill="#C2BCAE" stroke={KRP.ink} strokeWidth={6} />
          <rect x={LX - 186} y={438} width={372} height={88} fill="#CFC9BA" stroke={KRP.ink} strokeWidth={6} />
          {[-110, 0, 110].map((kx, i) => (
            <rect key={i} x={LX + kx - 44} y={458} width={88} height={48} fill="#7E8A92"
              stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        {/* ひび */}
        <Crack d={`M ${LX - 172 + d} 600 l 30 38 l -24 38 l 30 46`} t={seg(f, 20, 36)} sw={11} color={KRP.red} />
        <Crack d={`M ${LX + 172 + d} 640 l -30 34 l 26 40 l -28 46`} t={seg(f, 26, 42)} sw={11} color={KRP.red} />
        <Crack d={`M ${LX - 28 + d} 590 l 28 44 l -22 34`} t={seg(f, 30, 44)} sw={10} color={KRP.red} />
        <XMark x={LX} y={352} s={0.9} t={seg(f, 30, 44)} />
        <TagPlate x={LX} y={256} text="硬くして耐える" size={30} t={seg(f, 12, 26)} fill={KRP.white} />
      </g>

      {/* ---- 右: 逃がす模型 (ゴムとダンパー) ---- */}
      <g>
        {/* ゴム支承 (台の上。台と一緒に動く) */}
        {[-150, 150].map((kx, i) => (
          <g key={i}>
            {Array.from({ length: 5 }, (_, k) => (
              <rect key={k} x={RX + kx - 40 + d + (soft - d) * (k / 4)} y={782 + k * 11}
                width={80} height={11} fill={k % 2 ? "#3A3630" : "#4E4A44"}
                stroke={KRP.ink} strokeWidth={2.5} />
            ))}
          </g>
        ))}
        <g transform={`translate(${soft} 0)`}>
          {/* 柱 */}
          {[-150, -50, 50, 150].map((kx, i) => (
            <rect key={i} x={RX + kx - 22} y={566} width={44} height={216} fill="#9DA8B2"
              stroke={KRP.ink} strokeWidth={6} />
          ))}
          {/* 中のダンパー (斜め) */}
          <g>
            <line x1={RX - 140} y1={770} x2={RX + 140} y2={590} stroke={C.steel}
              strokeWidth={18} strokeLinecap="round" />
            <g transform={`rotate(-32.7 ${RX} 680)`}>
              <rect x={RX - 74} y={656} width={148} height={48} rx={10} fill="#5E6A72"
                stroke={KRP.ink} strokeWidth={5} />
              <rect x={RX - 60} y={666} width={120} height={28} rx={5} fill="#D69A2E" />
              <rect x={RX - 10 + soft} y={662} width={22} height={36} rx={4} fill="#C6CED4"
                stroke={KRP.ink} strokeWidth={4} />
            </g>
            {/* 熱 */}
            <g opacity={clamp01(seg(f, 22, 40))}>
              {[0, 1, 2].map((i) => {
                const rise = ((f * 1.4 + i * 46) % 140);
                return (
                  <path key={i} d={`M ${RX - 40 + i * 42} ${630 - rise} q 14 -18 0 -36`}
                    fill="none" stroke={KRP.orange} strokeWidth={5} strokeLinecap="round"
                    opacity={0.8 * (1 - rise / 140)} />
                );
              })}
            </g>
          </g>
          <rect x={RX - 206} y={520} width={412} height={50} fill="#C2BCAE" stroke={KRP.ink} strokeWidth={6} />
          <rect x={RX - 186} y={438} width={372} height={88} fill="#CFC9BA" stroke={KRP.ink} strokeWidth={6} />
          {[-110, 0, 110].map((kx, i) => (
            <rect key={i} x={RX + kx - 44} y={458} width={88} height={48} fill="#7E8A92"
              stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        {/* ○ の印 */}
        <g opacity={clamp01(seg(f, 30, 44))}>
          <circle cx={RX} cy={352} r={58} fill="none" stroke={KRP.green} strokeWidth={16} />
        </g>
        <TagPlate x={RX} y={256} text="逃がして捨てる" size={30} t={seg(f, 18, 32)} fill={KRP.white} />
      </g>

      {/* ---- 近景: 記録を見る研究者 ---- */}
      <Person x={960} y={1076} s={1.12} cloth="#E8E6DE" clothDark="#C4C2BA" glasses
        face="normal" gaze={[-0.5, -0.5]} lean={-4} f={f} phase={2} />
      <Person x={1116} y={1070} s={0.96} cloth="#4E6E8A" clothDark="#36506A" hair="cap"
        face="smile" gaze={[-0.6, -0.4]} lean={4} f={f} phase={5} />
      {/* 近景の小物: ケーブルドラムと工具箱 */}
      <g transform="translate(130 1004)">
        <ellipse cx={0} cy={0} rx={104} ry={30} fill="#7E8688" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-104} y={-120} width={208} height={120} fill="#8E9698" stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-120} rx={104} ry={30} fill="#A8B0B2" stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#5E6668" strokeWidth={6} fill="none">
          {[0, 1, 2].map((i) => (<path key={i} d={`M -104 ${-96 + i * 32} Q 0 ${-78 + i * 32} 104 ${-96 + i * 32}`} />))}
        </g>
      </g>
      <g transform="translate(1838 1012)">
        <rect x={-100} y={-86} width={200} height={86} rx={8} fill="#D6531E" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-100} y={-120} width={200} height={38} rx={8} fill="#B8441A" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-30} y={-146} width={60} height={28} rx={10} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <line x1={-100} y1={-46} x2={100} y2={-46} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 手元の板 */}
      <g transform="translate(866 940) rotate(-14)">
        <rect x={-60} y={-70} width={120} height={150} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#A8B0B2" strokeWidth={4}>
          {[0, 1, 2, 3].map((i) => (<line key={i} x1={-42} y1={-46 + i * 32} x2={42} y2={-46 + i * 32} />))}
        </g>
      </g>
    </Frame>
  );
};

// ===== #65 壁をやめた話の、いまのところです。 =====
// どこ: 夕暮れの空の下。5本柱の装置だけを置き、空と地面はこのシーン用に描く。
// 演出: 「骨」の柱だけが立ち、残り4本はまだ影。章の締めとして全体を引きで見せる。
// 動き: 夕空の雲が流れ、鳥が渡り、地面の草が揺れる。
const Kb1ShouMatome: React.FC<{ f: number }> = ({ f }) => {
  const GND = 824;   // KosoPillars の地面の高さに合わせる
  return (
    <Frame f={f} seed={537} bg="#F2DCBC">
      {/* ---- このシーン用の空 ---- */}
      <rect x={-20} y={-20} width={W + 40} height={GND + 20} fill="#F4DFC0" />
      <rect x={-20} y={-20} width={W + 40} height={260} fill="#E8A86E" opacity={0.6} />
      <rect x={-20} y={220} width={W + 40} height={240} fill="#F6E6C8" opacity={0.55} />
      <circle cx={1680} cy={300} r={96} fill="#F6C070" opacity={0.65} />
      <circle cx={1680} cy={300} r={150} fill="#F6C070" opacity={0.2} />
      <Cloud cx={300 + ((f * 0.3) % 400)} cy={158} s={1.3} fill="#FBEFDC" opacity={0.9} />
      <Cloud cx={1180 + ((f * 0.2) % 300)} cy={214} s={0.95} fill="#FBEFDC" opacity={0.8} />
      <Cloud cx={760} cy={312} s={0.75} fill="#FBEFDC" opacity={0.6} />
      <Birds x={240} y={376} f={f} n={6} s={0.9} speed={0.42} color="#8A6A50" />

      {/* ---- 遠くの街なみ (装置より奥) ---- */}
      <RowOfBuildings x0={-20} x1={W + 20} base={GND - 6} seed={641} minH={60} maxH={170}
        fill="#D2A77E" stroke="#A87E58" sw={3.2} opacity={0.42} count={15} />

      {/* ---- 5本柱の装置 (共有部品。空と地面はこちらで描いたので描かせない) ---- */}
      <TowerOnPillars f={f} dimmed={["hako", "mizu", "akari", "kuuki"]} standing={["hone"]}
        tiltScale={0.1} labels />

      {/* ---- このシーン用の地面 ---- */}
      <rect x={-20} y={GND + 56} width={W + 40} height={H - GND - 36} fill="#C9A87E" />
      <rect x={-20} y={GND + 56} width={W + 40} height={14} fill="#A8865E" />
      <g stroke="#B5946C" strokeWidth={4} opacity={0.9}>
        {Array.from({ length: 4 }, (_, r) => (
          <line key={r} x1={-20} y1={GND + 110 + r * 46} x2={W + 20} y2={GND + 110 + r * 46} />
        ))}
      </g>
      {/* 手前の草 */}
      <g stroke="#8A9A5E" strokeWidth={6} strokeLinecap="round" fill="none">
        {Array.from({ length: 34 }, (_, i) => {
          const gx = -20 + i * 58 + rnd(i * 3.3) * 30;
          const gh = 34 + rnd(i * 5.7) * 38;
          const bend = Math.sin(f / 17 + i) * 9;
          return <path key={i} d={`M ${gx} ${H - 10} q ${bend} ${-gh / 2} ${bend * 2} ${-gh}`} />;
        })}
      </g>
      {/* 小石 */}
      <g fill="#A8865E" opacity={0.7}>
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx={rnd(i * 7.1) * W} cy={GND + 120 + rnd(i * 2.3) * 110}
            rx={10 + rnd(i * 4.9) * 12} ry={6 + rnd(i * 6.1) * 7} />
        ))}
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={420} y={248} text="壁をやめて、骨にした" size={32} t={seg(f, 6, 22)} fill={KRP.white} />
      <TagPlate x={1310} y={248} text="残りは、あと4本" size={32} t={seg(f, 22, 38)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb1_door: (f) => <Kb1Door f={f} />,
  kb1_omosa_ni_makeru: (f) => <Kb1OmosaNiMakeru f={f} />,
  kb1_kabe_de_sasaeru: (f) => <Kb1KabeDeSasaeru f={f} />,
  kb1_shita_wo_atsuku: (f) => <Kb1ShitaWoAtsuku f={f} />,
  kb1_chicago_16kai: (f) => <Kb1Chicago16kai f={f} />,
  kb1_kibu_wall_18m: (f) => <Kb1KibuWall18m f={f} />,
  kb1_saijou_46cm: (f) => <Kb1Saijou46cm f={f} />,
  kb1_shita_hodo_futoru: (f) => <Kb1ShitaHodoFutoru f={f} />,
  kb1_kaseru_yuka_heru: (f) => <Kb1KaseruYukaHeru f={f} />,
  kb1_takaku_hodo_son: (f) => <Kb1TakakuHodoSon f={f} />,
  kb1_nendo_jiban: (f) => <Kb1NendoJiban f={f} />,
  kb1_20cm_mikomi: (f) => <Kb120cmMikomi f={f} />,
  kb1_20cm_ageru: (f) => <Kb120cmAgeru f={f} />,
  kb1_50cm_shizumu: (f) => <Kb150cmShizumu f={f} />,
  kb1_meri_komi: (f) => <Kb1MeriKomi f={f} />,
  kb1_kangaekata_hikkurikaeru: (f) => <Kb1KangaekataHikkurikaeru f={f} />,
  kb1_tetsu_no_waku: (f) => <Kb1TetsuNoWaku f={f} />,
  kb1_hagane_yasuku: (f) => <Kb1HaganeYasuku f={f} />,
  kb1_sanbun_no_ichi: (f) => <Kb1SanbunNoIchi f={f} />,
  kb1_15nichi_10kai: (f) => <Kb115nichi10kai f={f} />,
  kb1_kabe_omosa_nashi: (f) => <Kb1KabeOmosaNashi f={f} />,
  kb1_kawa_glass: (f) => <Kb1KawaGlass f={f} />,
  kb1_tetsu_no_jakuten_hi: (f) => <Kb1TetsuNoJakutenHi f={f} />,
  kb1_nejimagaru: (f) => <Kb1Nejimagaru f={f} />,
  kb1_1871_taika: (f) => <Kb11871Taika f={f} />,
  kb1_terracotta_tsutsumu: (f) => <Kb1TerracottaTsutsumu f={f} />,
  kb1_moenai_fuku: (f) => <Kb1MoenaiFuku f={f} />,
  kb1_uekibachi: (f) => <Kb1Uekibachi f={f} />,
  kb1_1904_baltimore: (f) => <Kb11904Baltimore f={f} />,
  kb1_hone_tatteita: (f) => <Kb1HoneTatteita f={f} />,
  kb1_ima_no_hashira: (f) => <Kb1ImaNoHashira f={f} />,
  kb1_cft: (f) => <Kb1Cft f={f} />,
  kb1_onaji_futosa: (f) => <Kb1OnajiFutosa f={f} />,
  kb1_nihon_yure: (f) => <Kb1NihonYure f={f} />,
  kb1_menshin_gomu: (f) => <Kb1MenshinGomu f={f} />,
  kb1_oil_damper: (f) => <Kb1OilDamper f={f} />,
  kb1_nigasu_suteru: (f) => <Kb1NigasuSuteru f={f} />,
  kb1_shou_matome: (f) => <Kb1ShouMatome f={f} />,
};

export const K_B1_MOTIFS: string[] = [
  "kb1_door",                // #28 第1章、壁を、やめる。
  "kb1_omosa_ni_makeru",     // #29 まず、建物は自分の重さに負けます。
  "kb1_kabe_de_sasaeru",     // #30 昔の建物は、壁で自分を支えていました。
  "kb1_shita_wo_atsuku",     // #31 高くするには、下の壁を厚くするしかありません。
  "kb1_chicago_16kai",       // #32 シカゴに、煉瓦で16階まで積んだビルがあります。
  "kb1_kibu_wall_18m",       // #33 1891年完成。基部の壁は、1.8メートルほど。
  "kb1_saijou_46cm",         // #34 いちばん上では、46センチまで細くなります。
  "kb1_shita_hodo_futoru",   // #35 下へ行くほど、壁が太っていく建物です。
  "kb1_kaseru_yuka_heru",    // #36 壁が太るぶん、貸せる床は減ります。
  "kb1_takaku_hodo_son",     // #37 高く建てるほど、損をする構造でした。
  "kb1_nendo_jiban",         // #38 しかもシカゴの地面は、やわらかい粘土です。
  "kb1_20cm_mikomi",         // #39 設計者は、20センチ沈むと見込んでいました。
  "kb1_20cm_ageru",          // #40 だから、あらかじめ20センチ持ち上げて建てた。
  "kb1_50cm_shizumu",        // #41 実際には、50センチ以上沈んだとされます。
  "kb1_meri_komi",           // #42 重すぎて、自分で地面にめり込んだんです。
  "kb1_kangaekata_hikkurikaeru", // #43 そこで、考え方がひっくり返ります。
  "kb1_tetsu_no_waku",       // #44 壁で支えるのをやめて、鉄の枠を組めばいい。
  "kb1_hagane_yasuku",       // #45 ちょうどこの頃、鋼が安く作れるようになりました。
  "kb1_sanbun_no_ichi",      // #46 鉄の骨組みは、石の壁の3分の1の重さです。
  "kb1_15nichi_10kai",       // #47 あるビルは、10階ぶんの鉄骨を15日で立てました。
  "kb1_kabe_omosa_nashi",    // #48 すると、壁は重さを持たなくてよくなります。
  "kb1_kawa_glass",          // #49 壁は、ただの皮になりました。ガラスでも済みます。
  "kb1_tetsu_no_jakuten_hi", // #50 ただし、鉄には弱点があります。火です。
  "kb1_nejimagaru",          // #51 鉄は燃えません。熱でねじ曲がって、崩れます。
  "kb1_1871_taika",          // #52 1871年のシカゴの大火で、それが分かりました。
  "kb1_terracotta_tsutsumu", // #53 そこで、鉄の柱を焼き物で包みます。
  "kb1_moenai_fuku",         // #54 骨に、燃えない服を着せたんです。
  "kb1_uekibachi",           // #55 素材は、植木鉢と同じ焼き物です。
  "kb1_1904_baltimore",      // #56 1904年のボルティモアの大火で、効き目が出ます。
  "kb1_hone_tatteita",       // #57 中は燃え尽きたのに、鉄の骨は立っていました。
  "kb1_ima_no_hashira",      // #58 では、いまの柱はどうなっているでしょう。
  "kb1_cft",                 // #59 中身は、鉄と、高強度のコンクリートです。
  "kb1_onaji_futosa",        // #60 同じ太さで、昔よりずっと重い建物を支えます。
  "kb1_nihon_yure",          // #61 日本はこれに、揺れを吸う仕掛けを足しました。
  "kb1_menshin_gomu",        // #62 基礎にゴムを挟んで、地面と建物を切り離す。
  "kb1_oil_damper",          // #63 建物の中に油の筒を仕込んで、揺れを熱に変える。
  "kb1_nigasu_suteru",       // #64 硬くして耐えるのではなく、逃がして捨てるんです。
  "kb1_shou_matome",         // #65 壁をやめた話の、いまのところです。
];

export const kosoB1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const KOSO_B1_PREVIEW_FRAMES = Math.max(K_B1_MOTIFS.length, 1);
export const KosoB1Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, K_B1_MOTIFS.length - 1);
  return <>{kosoB1Scene(K_B1_MOTIFS[i] ?? "", 45)}</>;
};
