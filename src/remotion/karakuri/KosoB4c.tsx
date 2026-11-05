// 「なぜ高層ビルは生まれたのか」: 第4章「灯りと、空気。」後半 (換気〜柱が5本立つ)
// 担当範囲: 台本 docs/koso-script-v7.txt の 170〜179行目 (文#169〜#178・10文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は必ず kb4_ で始める。WobbleDefs の seed はこのファイルでは 762〜771 を使う。
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
//
// ★この範囲の色: 「空気の色」= 灰青・ガラス・白。茶色を続けない。
//   #178 だけは決着なので、灰青の街に光が差すように明るく締める。

import React from "react";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import {
  KPP, TowerOnPillars, PILLAR_ORDER, PILLAR_X, PILLAR_META,
} from "./KosoPillars";
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
  // --- この後半 (空気の色) で足した色 ---
  wall: "#E2EAEE",       // 室内の壁 (白に近い灰青)
  wallShade: "#C6D5DD",  // 壁の陰・舗装
  tile: "#CFDCE3",       // 床タイル
  brick: "#B0705C",      // 煙突のレンガ (半透明で重ねるだけ)
  brickDark: "#8C5444",
  plant: "#7E9E80",      // 観葉植物・街路樹
  ray: "#F7EFD2",        // 差してくる光
  fabric: "#92A7B6",     // ソファの布 (灰青。空気の色から外れない)
  fabricDark: "#6F8493",
  rug: "#C3CBCE",        // 床のラグ
  suit: "#4E6B52",       // #176 の人の服 (#171 の紺と分けるため緑系にする)
  suitDark: "#3B5240",
} as const;

// ===================================================================
// このファイルだけのローカル部品
// (吹き出し口・スイッチ・玄関・換気扇・ビル断面・煙突。共用部品には足さない)
// ===================================================================

/** 断面のハッチ (壁の切り口)。id は呼ぶ側で重複しない名前にする */
const Kb4cHatch: React.FC<{
  id: string; x: number; y: number; w: number; h: number; pitch?: number; color?: string;
}> = ({ id, x, y, w, h, pitch = 26, color = C.castIronPale }) => {
  const n = Math.ceil((w + h) / pitch);
  return (
    <g>
      <clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath>
      <g clipPath={`url(#${id})`} stroke={color} strokeWidth={3} opacity={0.5}>
        {Array.from({ length: n }, (_, i) => (
          <line key={i} x1={x - h + i * pitch} y1={y + h} x2={x + i * pitch} y2={y} />
        ))}
      </g>
    </g>
  );
};

/**
 * 両手で押す人。Person と同じ寸法 (頭 r64/胴116×108/脚52) で、
 * 脚を踏ん張り・体を前に傾け・腕を前に出した姿にしたもの。
 * x,y = 足元。dir=1 で右を押す、-1 で左を押す。
 */
const Kb4cHitoOsu: React.FC<{
  x: number; y: number; s?: number; dir?: 1 | -1; f?: number;
  lean?: number; armLen?: number; cloth?: string; clothDark?: string;
}> = ({
  x, y, s = 1, dir = 1, f = 0, lean = 10, armLen = 110,
  cloth = "#3E4B66", clothDark = "#2E3850",
}) => {
  const bob = Math.sin(f / 13) * 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s * dir} ${s})`}>
      {/* 後ろ足 (踏ん張っている) */}
      <g transform="translate(-8 -58) rotate(32)">
        <rect x={-13} y={-6} width={26} height={64} rx={6} fill={clothDark}
          stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <ellipse cx={-40} cy={-6} rx={21} ry={9} fill={KRP.ink} transform="rotate(-14 -40 -6)" />
      {/* 前足 */}
      <g transform="translate(14 -58) rotate(-8)">
        <rect x={-13} y={-6} width={26} height={60} rx={6} fill={clothDark}
          stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <ellipse cx={22} cy={-4} rx={21} ry={9} fill={KRP.ink} />
      {/* 上半身 (腰で前へ傾く) */}
      <g transform={`rotate(${lean} 0 -58)`}>
        <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={18} y={-138} width={26} height={20} rx={4} fill="none"
          stroke={KRP.ink} strokeWidth={3} opacity={0.55} />
        {/* 奥の腕 */}
        <g transform="translate(22 -126) rotate(-4)">
          <rect x={0} y={-11} width={armLen - 14} height={22} rx={11} fill={clothDark}
            stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={armLen - 2} cy={0} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 手前の腕 */}
        <g transform="translate(30 -150) rotate(-14)">
          <rect x={0} y={-12} width={armLen} height={24} rx={12} fill={cloth}
            stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={armLen + 12} cy={0} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 頭 */}
        <g transform="translate(6 0)">
          <circle cx={0} cy={-228} r={64} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z"
            fill={KRP.ink} />
          {/* 力んだ目と眉 */}
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d="M -38 -224 Q -24 -234 -10 -224" />
            <path d="M 10 -224 Q 24 -234 38 -224" />
            <line x1={-40} y1={-250} x2={-14} y2={-242} />
            <line x1={14} y1={-242} x2={40} y2={-250} />
          </g>
          <path d="M -12 -196 Q 0 -188 12 -196" stroke={KRP.ink} strokeWidth={5}
            fill="none" strokeLinecap="round" />
          {/* 力みの線 */}
          <g stroke={KRP.red} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
            <line x1={-78} y1={-278} x2={-94} y2={-292} />
            <line x1={-58} y1={-296} x2={-66} y2={-316} />
          </g>
        </g>
      </g>
    </g>
  );
};

/** 天井の吹き出し口 (羽根6枚・枠・ねじ4本・面取り) */
const Kb4cDiffuser: React.FC<{
  x: number; y: number; w: number; h: number; f: number;
}> = ({ x, y, w, h, f }) => {
  const inset = 44;
  const ix = x + inset;
  const iy = y + inset;
  const iw = w - inset * 2;
  const ih = h - inset * 2;
  const slats = 6;
  const sh = ih / slats;
  return (
    <g>
      {/* 枠 (外周の板) */}
      <rect x={x} y={y} width={w} height={h} rx={10} fill={C.snow}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} rx={8} fill="none"
        stroke={C.castIronPale} strokeWidth={4} opacity={0.75} />
      {/* 面取り (四隅の斜め) */}
      <g stroke={C.castIronPale} strokeWidth={4} opacity={0.8}>
        <line x1={x + 6} y1={y + 34} x2={x + 34} y2={y + 6} />
        <line x1={x + w - 34} y1={y + 6} x2={x + w - 6} y2={y + 34} />
        <line x1={x + 6} y1={y + h - 34} x2={x + 34} y2={y + h - 6} />
        <line x1={x + w - 34} y1={y + h - 6} x2={x + w - 6} y2={y + h - 34} />
      </g>
      {/* 奥の空洞 */}
      <rect x={ix} y={iy} width={iw} height={ih} fill={C.ink2} opacity={0.62}
        stroke={KRP.ink} strokeWidth={6} />
      {/* 羽根6枚 (手前へ傾いた板。下面が暗い) */}
      {Array.from({ length: slats }, (_, i) => {
        const ty = iy + i * sh;
        const tip = 26 + Math.sin(f / 17 + i) * 2;
        return (
          <g key={i}>
            <polygon
              points={`${ix},${ty + 4} ${ix + iw},${ty + 4} ${ix + iw - 14},${ty + sh - 10} ${ix + 14},${ty + sh - 10}`}
              fill={C.airPale} stroke={KRP.ink} strokeWidth={4.5} />
            <polygon
              points={`${ix + 14},${ty + sh - 10} ${ix + iw - 14},${ty + sh - 10} ${ix + iw - 14},${ty + sh - 10 + tip * 0.22} ${ix + 14},${ty + sh - 10 + tip * 0.22}`}
              fill={C.airBlue} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
          </g>
        );
      })}
      {/* ねじ4本 */}
      {[[x + 24, y + 24], [x + w - 24, y + 24], [x + 24, y + h - 24], [x + w - 24, y + h - 24]].map(
        ([sx, sy], i) => (
          <g key={i}>
            <circle cx={sx} cy={sy} r={14} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4} />
            <line x1={sx - 8} y1={sy + 4} x2={sx + 8} y2={sy - 4}
              stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ),
      )}
    </g>
  );
};

/** 換気扇 (羽根が回る)。housing で角い箱に入れる */
const Kb4cFan: React.FC<{
  x: number; y: number; r: number; f: number; housing?: boolean; speed?: number;
}> = ({ x, y, r, f, housing = true, speed = 7 }) => (
  <g>
    {housing && (
      <g>
        <rect x={x - r - 24} y={y - r - 24} width={(r + 24) * 2} height={(r + 24) * 2} rx={10}
          fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={x - r - 6} y1={y - r - 6} x2={x + r + 6} y2={y - r - 6} n={4} r={7} />
        <Rivets x1={x - r - 6} y1={y + r + 6} x2={x + r + 6} y2={y + r + 6} n={4} r={7} />
      </g>
    )}
    <circle cx={x} cy={y} r={r} fill={C.ink2} opacity={0.5} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={x} cy={y} r={r - 10} fill="none" stroke={C.castIronPale} strokeWidth={4} opacity={0.8} />
    <g transform={`rotate(${f * speed} ${x} ${y})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 72} ${x} ${y})`}>
          <path
            d={`M ${x} ${y} Q ${x + r * 0.78} ${y - r * 0.34} ${x + r * 0.9} ${y + r * 0.1} Q ${x + r * 0.46} ${y + r * 0.2} ${x} ${y} Z`}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
    </g>
    <circle cx={x} cy={y} r={r * 0.19} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4.5} />
    <circle cx={x} cy={y} r={r * 0.07} fill={KRP.ink} />
  </g>
);

/** 給気口 (小さい。羽根が3枚・網・ねじ) */
const Kb4cVent: React.FC<{
  x: number; y: number; w: number; h: number; f?: number;
}> = ({ x, y, w, h, f = 0 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={7} fill={C.snow}
      stroke={KRP.ink} strokeWidth={6} />
    <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} fill={C.ink2}
      opacity={0.45} stroke={KRP.ink} strokeWidth={3.5} />
    {Array.from({ length: 3 }, (_, i) => {
      const yy = y + 14 + ((h - 28) / 3) * (i + 0.5);
      const sw = Math.sin(f / 15 + i) * 1.6;
      return (
        <line key={i} x1={x + 11} y1={yy + sw} x2={x + w - 11} y2={yy - sw}
          stroke={C.airPale} strokeWidth={7} strokeLinecap="round" />
      );
    })}
    <circle cx={x + w / 2} cy={y + 9} r={5} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={2.5} />
  </g>
);

/**
 * 吸い込み口 (リターングリル。給気口より大きい)。
 * 枠・面取り・奥の網・羽根 n 枚・ねじ4本まで描く。#169 の壁用。
 */
const Kb4cReturnGrille: React.FC<{
  x: number; y: number; w: number; h: number; f: number; slats?: number;
}> = ({ x, y, w, h, f, slats = 7 }) => {
  const inset = 28;
  const ix = x + inset;
  const iy = y + inset;
  const iw = w - inset * 2;
  const ih = h - inset * 2;
  const sh = ih / slats;
  const mesh = Math.max(1, Math.floor(iw / 24));
  return (
    <g>
      {/* 枠 (壁に付く板) */}
      <rect x={x} y={y} width={w} height={h} rx={10} fill={C.snow}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={x + 11} y={y + 11} width={w - 22} height={h - 22} rx={8} fill="none"
        stroke={C.castIronPale} strokeWidth={4} opacity={0.75} />
      {/* 面取り (四隅の斜め) */}
      <g stroke={C.castIronPale} strokeWidth={4} opacity={0.8}>
        <line x1={x + 6} y1={y + 28} x2={x + 28} y2={y + 6} />
        <line x1={x + w - 28} y1={y + 6} x2={x + w - 6} y2={y + 28} />
        <line x1={x + 6} y1={y + h - 28} x2={x + 28} y2={y + h - 6} />
        <line x1={x + w - 28} y1={y + h - 6} x2={x + w - 6} y2={y + h - 28} />
      </g>
      {/* 奥の空洞 */}
      <rect x={ix} y={iy} width={iw} height={ih} fill={C.ink2} opacity={0.62}
        stroke={KRP.ink} strokeWidth={6} />
      {/* 奥の網 (縦線) */}
      <g stroke={C.castIronPale} strokeWidth={2.5} opacity={0.45}>
        {Array.from({ length: mesh }, (_, i) => (
          <line key={i} x1={ix + 12 + i * 24} y1={iy + 4} x2={ix + 12 + i * 24} y2={iy + ih - 4} />
        ))}
      </g>
      {/* 羽根 (吸い込む向きに傾いている。わずかに震える) */}
      {Array.from({ length: slats }, (_, i) => {
        const ty = iy + i * sh;
        const tip = Math.sin(f / 15 + i * 0.6) * 1.8;
        return (
          <g key={i}>
            <polygon
              points={`${ix},${ty + 3} ${ix + iw},${ty + 3} ${ix + iw - 11},${ty + sh - 7 + tip} ${ix + 11},${ty + sh - 7 + tip}`}
              fill={C.airPale} stroke={KRP.ink} strokeWidth={4} />
            <line x1={ix + 11} y1={ty + sh - 7 + tip} x2={ix + iw - 11} y2={ty + sh - 7 + tip}
              stroke={C.airBlue} strokeWidth={4} opacity={0.9} />
          </g>
        );
      })}
      {/* ねじ4本 */}
      {[[x + 16, y + 16], [x + w - 16, y + 16], [x + 16, y + h - 16], [x + w - 16, y + h - 16]].map(
        ([sx, sy], i) => (
          <g key={i}>
            <circle cx={sx} cy={sy} r={11} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={3.5} />
            <line x1={sx - 6} y1={sy + 3} x2={sx + 6} y2={sy - 3} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ),
      )}
    </g>
  );
};

/**
 * 3人掛けソファ (脚4本・背もたれ・背クッション3枚・座面・見付け・肘2つ・クッション1つ)。
 * x = 左端, y = 床に着く高さ, w = 幅。#169 の部屋の下半分を埋める。
 */
const Kb4cSofa: React.FC<{
  x: number; y: number; w: number; f: number;
}> = ({ x, y, w, f }) => {
  const seatH = 112;
  const seatTop = y - 154;
  const backTop = y - 302;
  const armTop = y - 214;
  const cw = (w - 132) / 3;
  return (
    <g>
      {/* 脚4本 */}
      {[x + 46, x + w * 0.36, x + w * 0.64, x + w - 46].map((lx, i) => (
        <g key={i}>
          <rect x={lx - 13} y={y - 50} width={26} height={50} rx={6}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={lx} cy={y} rx={18} ry={7} fill={KRP.ink} opacity={0.45} />
        </g>
      ))}
      {/* 背もたれ (奥の板) */}
      <rect x={x + 54} y={backTop} width={w - 108} height={seatTop - backTop + 54} rx={26}
        fill={C.fabricDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 背クッション3枚 (呼吸のようにわずかに動く) */}
      {[0, 1, 2].map((i) => {
        const cx0 = x + 66 + i * cw;
        const sw = Math.sin(f / 15 + i * 0.8) * 1.6;
        return (
          <g key={i}>
            <rect x={cx0} y={backTop + 12 + sw} width={cw - 10} height={seatTop - backTop + 4}
              rx={20} fill={C.fabric} stroke={KRP.ink} strokeWidth={5} />
            <path
              d={`M ${cx0 + 18} ${backTop + 34 + sw} Q ${cx0 + cw / 2 - 5} ${backTop + 54 + sw} ${cx0 + cw - 28} ${backTop + 34 + sw}`}
              fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          </g>
        );
      })}
      {/* 座面 */}
      <rect x={x + 30} y={seatTop} width={w - 60} height={seatH} rx={20}
        fill={C.fabric} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.42}>
        <line x1={x + w / 3} y1={seatTop + 12} x2={x + w / 3} y2={seatTop + seatH - 12} />
        <line x1={x + (w * 2) / 3} y1={seatTop + 12} x2={x + (w * 2) / 3} y2={seatTop + seatH - 12} />
      </g>
      {/* 前の見付け */}
      <rect x={x + 30} y={seatTop + seatH - 20} width={w - 60} height={32} rx={14}
        fill={C.fabricDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 肘2つ */}
      {[x, x + w - 72].map((ax, i) => (
        <g key={i}>
          <rect x={ax} y={armTop} width={72} height={y - 50 - armTop} rx={22}
            fill={C.fabric} stroke={KRP.ink} strokeWidth={6} />
          <rect x={ax + 13} y={armTop + 13} width={46} height={26} rx={12} fill="none"
            stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
        </g>
      ))}
      {/* クッション1つ (ななめに置いてある) */}
      <g transform={`rotate(-12 ${x + 152} ${seatTop - 26})`}>
        <rect x={x + 100} y={seatTop - 78} width={104} height={104} rx={16}
          fill={C.airPale} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={x + 117} y={seatTop - 61} width={70} height={70} rx={10} fill="none"
          stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      </g>
    </g>
  );
};

/**
 * 後ろ姿で、目の前の扉に両手をついて押し開ける人。
 * Person と同じ寸法 (頭 r64/胴116×108/脚52)。x,y = 足元。
 * ★#171 の Kb4cHitoOsu (横向き・顔が見える・片方向に腕を伸ばす) と重ならないように、
 *   カメラを肩越しに回した姿にしてある。顔は描かない。
 */
const Kb4cHitoUshiroDe: React.FC<{
  x: number; y: number; s?: number; f?: number;
  push?: number; armLen?: number; cloth?: string; clothDark?: string;
}> = ({
  x, y, s = 1, f = 0, push = 0, armLen = 118,
  cloth = C.suit, clothDark = C.suitDark,
}) => {
  const strain = Math.sin(f / 7) * 1.8;
  const sink = 6 * clamp01(push);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 両足を開いて踏ん張る */}
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${d * 32} -56) rotate(${d * 13})`}>
          <rect x={-14} y={-6} width={28} height={62} rx={6} fill={clothDark}
            stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      ))}
      <ellipse cx={-54} cy={-4} rx={23} ry={9} fill={KRP.ink} transform="rotate(-10 -54 -4)" />
      <ellipse cx={54} cy={-4} rx={23} ry={9} fill={KRP.ink} transform="rotate(10 54 -4)" />
      <g transform={`translate(0 ${sink})`}>
        {/* 胴 (背中。中心の縫い目・肩のヨーク・ベルト) */}
        <rect x={-58} y={-170} width={116} height={114} rx={16} fill={cloth}
          stroke={KRP.ink} strokeWidth={5} />
        <line x1={0} y1={-162} x2={0} y2={-66} stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
        <path d="M -56 -140 Q 0 -126 56 -140" fill="none" stroke={KRP.ink}
          strokeWidth={3.5} opacity={0.5} />
        <rect x={-58} y={-74} width={116} height={20} rx={6} fill={clothDark}
          stroke={KRP.ink} strokeWidth={4} />
        <rect x={-14} y={-78} width={28} height={28} rx={5} fill={BP.brass}
          stroke={KRP.ink} strokeWidth={4} />
        {/* 両腕 (前の扉へ。肩幅のまま斜め上に伸びる) */}
        {[1, -1].map((d) => (
          <g key={d} transform={`translate(${d * 44} -150) scale(${d} 1) rotate(${-50 + strain})`}>
            <rect x={0} y={-12} width={armLen} height={24} rx={12} fill={cloth}
              stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={armLen - 32} y={-13} width={17} height={26} rx={5} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={armLen + 11} cy={0} r={15} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ))}
        {/* 首 */}
        <rect x={-21} y={-186} width={42} height={24} rx={6} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={4.5} />
        {/* 頭 (後頭部。顔は見えない) */}
        <circle cx={0} cy={-234} r={64} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -64 -216 Q -66 -298 0 -300 Q 66 -298 64 -216 Q 64 -184 0 -182 Q -64 -184 -64 -216 Z"
          fill={KRP.ink} />
        <path d="M -34 -188 Q 0 -168 34 -188 Q 0 -178 -34 -188 Z" fill={KRP.ink} />
        {/* 耳2つ */}
        <ellipse cx={-62} cy={-222} rx={13} ry={19} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={62} cy={-222} rx={13} ry={19} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={4} />
        {/* 力みの線 (左右に出る) */}
        <g stroke={KRP.red} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
          <line x1={-84} y1={-280} x2={-104} y2={-296} />
          <line x1={84} y1={-280} x2={104} y2={-296} />
          <line x1={-56} y1={-302} x2={-64} y2={-324} />
          <line x1={56} y1={-302} x2={64} y2={-324} />
        </g>
      </g>
    </g>
  );
};

/**
 * ビルの断面 + 中を縦に抜ける空気の道。#174 と #175 で同じ形を使う。
 * detail=true で外壁の窓・入口まで描く (#174)。glow は道を昇る光の強さ。
 */
const Kb4cBuildingAir: React.FC<{
  cx: number; top: number; base: number; w: number; f: number;
  detail?: boolean; glow?: number;
}> = ({ cx, top, base, w, f, detail = true, glow = 0 }) => {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const sh = Math.round(w * 0.17);   // 空気の道の半幅
  const sx0 = cx - sh;
  const sx1 = cx + sh;
  const floors = Math.floor((base - top) / 48);
  const gl = clamp01(glow);
  return (
    <g>
      {/* 躯体 */}
      <rect x={x0} y={top} width={w} height={base - top} fill={KPP.towerFace}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={x1 - 34} y={top} width={34} height={base - top} fill={KPP.towerSide} opacity={0.85} />
      {/* 各階の床 (空気の道のところだけ切れている) */}
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.42}>
        {Array.from({ length: floors }, (_, i) => {
          const y = top + 48 * (i + 1);
          return (
            <g key={i}>
              <line x1={x0} y1={y} x2={sx0} y2={y} />
              <line x1={sx1} y1={y} x2={x1} y2={y} />
            </g>
          );
        })}
      </g>
      {/* 外壁の窓 */}
      {detail && (
        <g>
          {Array.from({ length: floors }, (_, i) => {
            const y = top + 48 * i + 14;
            return (
              <g key={i}>
                {[x0 + 16, x0 + 58, sx1 + 10, sx1 + 52].map((wx, k) => (
                  <rect key={k} x={wx} y={y} width={32} height={26} rx={3}
                    fill={KPP.glass} stroke={KRP.ink} strokeWidth={3}
                    opacity={0.55 + rnd(i * 7 + k) * 0.45} />
                ))}
              </g>
            );
          })}
        </g>
      )}
      {/* 空気の道 (縦に抜けている穴) */}
      <rect x={sx0} y={top + 6} width={sx1 - sx0} height={base - top - 6}
        fill={C.airPale} opacity={0.95} />
      <g stroke={KRP.ink} strokeWidth={4.5} strokeDasharray="20 16" opacity={0.75}>
        <line x1={sx0} y1={top + 6} x2={sx0} y2={base} />
        <line x1={sx1} y1={top + 6} x2={sx1} y2={base} />
      </g>
      {/* 道を昇る空気 */}
      {gl > 0.01 && (
        <g opacity={gl}>
          {Array.from({ length: 6 }, (_, i) => {
            const p = (((f / 34) + i / 6) % 1 + 1) % 1;
            const y = base - 20 - p * (base - top - 40);
            const o = Math.sin(p * Math.PI);
            return (
              <g key={i} opacity={o}>
                <ellipse cx={cx + Math.sin(p * 7 + i) * 12} cy={y} rx={sh - 10} ry={24}
                  fill={C.airBlue} stroke={KRP.ink} strokeWidth={3} />
                <polygon
                  points={`${cx},${y - 54} ${cx - 26},${y - 20} ${cx + 26},${y - 20}`}
                  fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
              </g>
            );
          })}
        </g>
      )}
      {/* 屋上 */}
      <rect x={x0 - 16} y={top - 24} width={w + 32} height={28} rx={6}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <rect x={cx - 52} y={top - 82} width={104} height={60} rx={6}
        fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={6} />
      <rect x={cx - 34} y={top - 102} width={28} height={22} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={4} />
      <rect x={cx + 8} y={top - 102} width={28} height={22} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={4} />
      {/* 1階の入口 */}
      {detail && (
        <g>
          <rect x={cx - 74} y={base - 92} width={148} height={92} fill={C.glass}
            stroke={KRP.ink} strokeWidth={6} />
          <line x1={cx} y1={base - 92} x2={cx} y2={base} stroke={KRP.ink} strokeWidth={5} />
          <rect x={cx - 104} y={base - 112} width={208} height={22} rx={5}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
    </g>
  );
};

/** レンガの煙突 (半透明で重ねる。ビル＝煙突だと一目で分かるように) */
const Kb4cChimneyGhost: React.FC<{
  cx: number; top: number; base: number; f: number; t: number; hole: number;
}> = ({ cx, top, base, f, t, hole }) => {
  const a = easeOut(clamp01(t));
  if (a <= 0.01) return null;
  const halfAt = (y: number) => lerp(hole + 58, hole + 140, (y - top) / (base - top));
  const ht = halfAt(top);
  const hb = halfAt(base);
  const courses = Math.floor((base - top) / 58);
  return (
    <g opacity={a}>
      {/* レンガの地 (ビルの輪郭の外側だけ塗る = 建物の絵を濁らせない) */}
      <path
        d={`M ${cx - hb},${base} L ${cx - ht},${top} L ${cx + ht},${top} L ${cx + hb},${base} Z
            M ${cx - hole},${top} L ${cx + hole},${top} L ${cx + hole},${base} L ${cx - hole},${base} Z`}
        fillRule="evenodd" fill={C.brick} opacity={0.34} />
      {/* 煙突の輪郭 (これが遅れて浮かぶ) */}
      <polygon
        points={`${cx - hb},${base} ${cx - ht},${top} ${cx + ht},${top} ${cx + hb},${base}`}
        fill="none" stroke={C.brickDark} strokeWidth={9} strokeDasharray="26 16" opacity={0.9} />
      {/* レンガの目地 (建物の外側だけ) */}
      <g stroke={C.brickDark} strokeWidth={4} opacity={0.6}>
        {Array.from({ length: courses }, (_, i) => {
          const y = top + 58 * (i + 1);
          const h = halfAt(y);
          return (
            <g key={i}>
              <line x1={cx - h} y1={y} x2={cx - hole} y2={y} />
              <line x1={cx + hole} y1={y} x2={cx + h} y2={y} />
            </g>
          );
        })}
      </g>
      {/* 笠木 */}
      <rect x={cx - ht - 26} y={top - 40} width={(ht + 26) * 2} height={40} rx={6}
        fill={C.brick} opacity={0.5} stroke={C.brickDark} strokeWidth={8} />
      {/* 煙 */}
      <g opacity={0.6}>
        {Array.from({ length: 3 }, (_, i) => {
          const p = (((f / 40) + i / 3) % 1 + 1) % 1;
          return (
            <circle key={i} cx={cx - 26 + Math.sin(p * 5 + i) * 34}
              cy={top - 72 - p * 78} r={28 + p * 22}
              fill={C.wallShade} stroke={C.brickDark} strokeWidth={4} opacity={1 - p} />
          );
        })}
      </g>
    </g>
  );
};

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===== #169 そのかわり、機械がいつも空気を入れ替えています。 =====
// 格: 並
// どこ: 高層住戸の居間。天井の吹き出し口に寄りつつ、下半分に部屋そのものを置く
// 演出: 吹き出し口を天井いっぱいに大きく。出した空気が斜めに降り、
//       天井の吸い込み口へ帰っていく = 「入れ替え」の輪が1枚で読める
// 動き: 流れの線が繰り返し降りる / カーテンの裾・背クッション・葉が呼吸のように揺れる
//       / 羽根がわずかに震える / 吸い込み口へ空気が吸い上げられる
// 絵: 天井の吹き出し口と吸い込み口。降りる空気。ソファ・ラグ・観葉植物・カーテンのある部屋
// ★矢印の先端は必ず y=673 までで止める (計算は streak の中。字幕の黒帯 上端854 に頭を隠されない)
const Kb4cKikaiGaIrekaeru: React.FC<{ f: number }> = ({ f }) => {
  const ap = easeOut(clamp01(seg(f, 2, 18)));
  const breath = Math.sin(f / 9);
  // 吹き出し口の真下から左右へ斜めに降りる流れ。
  // 先端の y = sy + uy * (travel + segLen + head) = 470 + 0.545 * 372 = 673 (< 800)
  const streak = (i: number, dir: number) => {
    const p = (((f / 30) + i / 4) % 1 + 1) % 1;
    const ux = dir * 0.84;
    const uy = 0.545;
    const travel = 240;
    const segLen = 100;
    const head = 32;
    const sx = 760 + dir * 240;
    const sy = 470;
    const x1 = sx + ux * travel * p;
    const y1 = sy + uy * travel * p;
    const x2 = x1 + ux * segLen;
    const y2 = y1 + uy * segLen;
    const op = Math.sin(p * Math.PI) * ap;
    const nx = -uy;
    const ny = ux;
    return (
      <g key={`${dir}-${i}`} opacity={op}>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={C.airBlue} strokeWidth={30} strokeLinecap="round" opacity={0.75} />
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={KRP.blueDeep} strokeWidth={13} strokeLinecap="round" />
        <polygon
          points={`${x2 + ux * head},${y2 + uy * head} ${x2 + nx * 22},${y2 + ny * 22} ${x2 - nx * 22},${y2 - ny * 22}`}
          fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={762} bg={KRP.cream}>
      {/* 壁と床 */}
      <rect x={-20} y={520} width={W + 40} height={400} fill={C.wall} />
      <rect x={-20} y={900} width={W + 40} height={200} fill={C.tile} />
      <line x1={-20} y1={900} x2={W + 20} y2={900} stroke={KRP.ink} strokeWidth={6} />
      {/* 天井面 */}
      <rect x={-20} y={-20} width={W + 40} height={540} fill={C.snow} />
      <line x1={-20} y1={520} x2={W + 20} y2={520} stroke={KRP.ink} strokeWidth={7} />
      {/* 壁紙・天井板の継ぎ目 */}
      <g stroke={C.wallShade} strokeWidth={4} opacity={0.85}>
        <line x1={150} y1={-20} x2={150} y2={520} />
        <line x1={1270} y1={-20} x2={1270} y2={520} />
        <line x1={1740} y1={-20} x2={1740} y2={520} />
        <line x1={120} y1={520} x2={120} y2={872} />
        <line x1={1010} y1={520} x2={1010} y2={872} />
      </g>
      {/* 床のラグ (部屋の足元。遠近で台形) */}
      <path d="M 60 1070 L 230 876 L 1170 876 L 1340 1070 Z" fill={C.rug}
        stroke={KRP.ink} strokeWidth={6} />
      <path d="M 186 1000 L 296 906 L 1104 906 L 1214 1000 Z" fill="none"
        stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
      {/* 巾木 */}
      <rect x={-20} y={872} width={W + 40} height={30} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 天井のまわり縁 */}
      <rect x={-20} y={488} width={W + 40} height={32} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 吹き出し口 (主役。天井の左 2/3 を使う) */}
      <Kb4cDiffuser x={330} y={36} w={860} h={420} f={f} />
      {/* 吹き出し口の下にたまる空気 (まわり縁 y=488 より上で止める) */}
      <g opacity={0.3 + 0.3 * (breath * 0.5 + 0.5)}>
        <ellipse cx={760} cy={462} rx={330} ry={26} fill={C.airBlue} />
      </g>
      {/* 吸い込み口 (出した空気はここへ帰る = 入れ替え) */}
      <Kb4cReturnGrille x={1330} y={128} w={320} h={236} f={f} slats={6} />
      {/* 吸い上げられていく空気 (先端 y=376。黒帯とは無関係の高さ) */}
      {[1410, 1490, 1570].map((ax, i) => (
        <ForceArrow key={ax} x={ax} y={526} len={150} rot={-90} w={26}
          color={KRP.blueDeep} t={seg(f, 12 + i * 3, 26 + i * 3)} />
      ))}
      {/* 空気の流れ (吹き出し口から斜めに降りる) */}
      <g>
        {[0, 1, 2, 3].map((i) => streak(i, 1))}
        {[0, 1, 2, 3].map((i) => streak(i, -1))}
      </g>
      {/* カーテン (裾が呼吸のように揺れる) */}
      <rect x={1230} y={534} width={660} height={26} rx={8} fill={BP.steelLight}
        stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1248} cy={547} r={13} fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={1872} cy={547} r={13} fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
      <g>
        {Array.from({ length: 5 }, (_, i) => {
          const x = 1250 + i * 128;
          const sw = Math.sin(f / 9 + i * 0.7) * 18 * (0.4 + ap * 0.6);
          return (
            <path key={i}
              d={`M ${x} 558 L ${x + 128} 558 L ${x + 128 + sw} 844 Q ${x + 64 + sw} ${872 + sw * 0.5} ${x + sw} 844 Z`}
              fill={i % 2 === 0 ? C.airPale : C.glass} stroke={KRP.ink} strokeWidth={5} />
          );
        })}
      </g>
      {/* ソファ (画面の下半分を埋める。空の床をつくらない) */}
      <Kb4cSofa x={170} y={900} w={760} f={f} />
      {/* 観葉植物 (ソファとカーテンのあいだ。葉が空気で揺れる) */}
      <g>
        {/* 鉢 (白い陶器。茶色を足さない) */}
        <path d="M 1026 768 L 1046 900 L 1200 900 L 1220 768 Z" fill={C.snow}
          stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1046 900 L 1200 900 L 1210 834 L 1036 834 Z" fill={C.wallShade}
          opacity={0.55} />
        <rect x={1012} y={744} width={222} height={34} rx={8} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1032} y={762} width={182} height={16} fill={C.soot} opacity={0.55} />
        {/* 葉5枚 */}
        {[-2, -1, 0, 1, 2].map((k, i) => {
          const sw = Math.sin(f / 10 + i * 0.9) * (5 + Math.abs(k) * 4) * (0.4 + ap * 0.6);
          const lx = 1123 + k * 72 + sw;
          const ly = 556 + Math.abs(k) * 28;
          return (
            <g key={i}>
              <path d={`M 1123 762 Q ${1123 + k * 46} 664 ${lx} ${ly + 10}`}
                stroke={C.plant} strokeWidth={17} fill="none" strokeLinecap="round" />
              <ellipse cx={lx} cy={ly} rx={44} ry={30} fill={C.plant}
                stroke={KRP.ink} strokeWidth={5}
                transform={`rotate(${k * 18} ${lx} ${ly})`} />
              <line x1={lx - 32} y1={ly + Math.abs(k) * 2} x2={lx + 32} y2={ly - Math.abs(k) * 2}
                stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
            </g>
          );
        })}
      </g>
      {/* 札 (出す → 帰る の輪)。左の天井は x=330 まで、右の札は吸い上げの矢印 (〜x1605) を避ける */}
      <TagPlate x={180} y={250} text="出す" size={42} t={seg(f, 6, 20)} color={KRP.blueDeep} />
      <TagPlate x={180} y={380} text="いつも動く" size={44} t={seg(f, 8, 22)} />
      <TagPlate x={1790} y={250} text="帰る" size={42} t={seg(f, 18, 32)} color={KRP.blueDeep} />
    </Frame>
  );
};

// ===== #170 止めてはいけない換気です。 =====
// 格: 図
// どこ: 壁付けのスイッチだけに寄る (クリーム地 + 方眼)
// 演出: スイッチ板を画面の 1/2 以上に大きく。板・面取り・ねじ・押し跡まで描く
// 動き: ボタンが押されかけ → その瞬間に赤い × が出て、ボタンが戻る
// 絵: スイッチに赤い×。札「止めない」。スイッチの板とねじまで描く
const Kb4cTometeWaIkenai: React.FC<{ f: number }> = ({ f }) => {
  const push = easeOut(clamp01(seg(f, 6, 18)));
  const back = easeOut(clamp01(seg(f, 20, 30)));
  const depth = 16 * (push - back);
  const lamp = 0.55 + 0.45 * (Math.sin(f / 7) * 0.5 + 0.5);
  return (
    <Frame f={f} seed={763} bg={KRP.cream}>
      <GridPaper />
      {/* 壁の板 (外周) */}
      <rect x={580} y={130} width={760} height={660} rx={20} fill={C.wallShade}
        stroke={KRP.ink} strokeWidth={8} />
      {/* 面取り */}
      <rect x={598} y={148} width={724} height={624} rx={16} fill={C.snow}
        stroke={KRP.ink} strokeWidth={5} />
      <g stroke={C.castIronPale} strokeWidth={4} opacity={0.75} fill="none">
        <rect x={616} y={166} width={688} height={588} rx={12} />
      </g>
      {/* ねじ2本 */}
      {[190, 730].map((sy, i) => (
        <g key={i}>
          <circle cx={960} cy={sy} r={20} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={960} cy={sy} r={11} fill={BP.steel} stroke={KRP.ink} strokeWidth={3} />
          <line x1={948} y1={sy + 6} x2={972} y2={sy - 6} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 押しボタン (膨らみがある) */}
      <g transform={`translate(0 ${depth})`}>
        {/* 上半分 (手前に起きている) */}
        <path d="M 700 286 Q 700 268 718 268 L 1202 268 Q 1220 268 1220 286 L 1220 434 L 700 434 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        {/* 下半分 (奥へ沈んでいる) */}
        <path d="M 700 434 L 1220 434 L 1220 582 Q 1220 600 1202 600 L 718 600 Q 700 600 700 582 Z"
          fill={C.wallShade} stroke={KRP.ink} strokeWidth={7} />
        {/* 面取りの照り */}
        <polygon points="716,286 1204,286 1176,318 744,318" fill={C.snow} opacity={0.95} />
        <ellipse cx={852} cy={344} rx={92} ry={26} fill={KRP.white} opacity={0.95} />
        {/* 真ん中の合わせ目 (シーソーの軸) */}
        <line x1={700} y1={434} x2={1220} y2={434} stroke={KRP.ink} strokeWidth={8} />
        <line x1={700} y1={444} x2={1220} y2={444} stroke={C.castIronPale}
          strokeWidth={7} opacity={0.8} />
        {/* 指で汚れた跡 */}
        <g fill={C.castIron} opacity={0.26}>
          <ellipse cx={960} cy={514} rx={110} ry={56} />
          <ellipse cx={1030} cy={486} rx={46} ry={26} />
          <ellipse cx={894} cy={534} rx={36} ry={20} />
        </g>
        {/* 押し込みの影 (押されるほど薄くなる) */}
        <rect x={700} y={584} width={520} height={22} rx={10} fill={C.castIronPale}
          opacity={0.8 - depth * 0.035} />
      </g>
      {/* 板の影 (ボタンの座) */}
      <rect x={692} y={260} width={536} height={352} rx={20} fill="none"
        stroke={C.castIronPale} strokeWidth={5} opacity={0.6} />
      {/* 標識と動作ランプ */}
      <text x={960} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={48} fill={C.sootPale} opacity={0.9}>換気</text>
      <circle cx={1252} cy={212} r={17} fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5}
        opacity={lamp} />
      {/* 押そうとした力 → ×で止まる */}
      <ForceArrow x={320} y={610} len={240} rot={0} w={28} color={KRP.red}
        t={seg(f, 4, 16)} label="押す" labelSize={36} />
      <XMark x={960} y={434} s={2.6} t={seg(f, 19, 32)} />
      <TagPlate x={1560} y={430} text="止めない" size={56} t={seg(f, 22, 36)} color={KRP.red} />
      <TagPlate x={300} y={430} text="24時間" size={50} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #171 ちなみに、玄関のドアが重い日があります。 =====
// 格: 並
// どこ: 高層住戸の玄関。内側から大きなドアを押している
// 演出: ドアを画面の天地いっぱいに。両手で押す人1人。ドアは少ししか開かない
// 動き: 押す力で体が傾き、ドアがわずかに開いて、また戻る
// 絵: 玄関。両手でドアを押す人。体が傾く
const Kb4cDoorGaOmoi: React.FC<{ f: number }> = ({ f }) => {
  const o = 0.62 * easeOut(clamp01(seg(f, 6, 22))) - 0.26 * easeOut(clamp01(seg(f, 26, 40)));
  const gap = 12 + o * 72;
  const panelX = 940 + gap;
  const panelW = 1620 - panelX;
  const lean = 8 + o * 7;
  return (
    <Frame f={f} seed={764} bg={KRP.cream}>
      {/* 壁・床・たたき */}
      <rect x={-20} y={-20} width={W + 40} height={780} fill={C.wall} />
      <rect x={-20} y={740} width={W + 40} height={360} fill={C.tile} />
      <line x1={-20} y1={740} x2={W + 20} y2={740} stroke={KRP.ink} strokeWidth={6} />
      <rect x={860} y={790} width={W - 840} height={290} fill={C.wallShade} />
      <line x1={860} y1={790} x2={W + 20} y2={790} stroke={KRP.ink} strokeWidth={6} />
      <line x1={860} y1={790} x2={860} y2={1100} stroke={KRP.ink} strokeWidth={6} />
      {/* 壁の継ぎ目 */}
      <g stroke={C.wallShade} strokeWidth={4} opacity={0.9}>
        <line x1={180} y1={-20} x2={180} y2={740} />
        <line x1={620} y1={-20} x2={620} y2={740} />
        <line x1={1760} y1={-20} x2={1760} y2={790} />
      </g>
      {/* 壁のスイッチ */}
      <g>
        <rect x={266} y={392} width={86} height={128} rx={10} fill={C.snow}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={282} y={420} width={54} height={72} rx={7} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={309} cy={406} r={6} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
      {/* ドア枠 (ケーシング) */}
      <rect x={900} y={46} width={760} height={752} rx={6} fill={C.wallShade}
        stroke={KRP.ink} strokeWidth={8} />
      {/* 外の光 (開いたすきま) */}
      <rect x={932} y={74} width={700} height={716} fill={C.airPale} />
      <rect x={932} y={74} width={gap + 10} height={716} fill={C.snow} />
      {/* ドア本体 (右が丁番。少しだけ開く) */}
      <g>
        <rect x={panelX} y={74} width={panelW} height={716} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={8} />
        {/* 戸当たりの陰 */}
        <rect x={panelX} y={74} width={18} height={716} fill={C.wallShade} opacity={0.9} />
        {/* 鏡板 (くぼみ2つ) */}
        <rect x={panelX + 56} y={150} width={panelW - 112} height={254} rx={8} fill="none"
          stroke={KRP.ink} strokeWidth={5} opacity={0.65} />
        <rect x={panelX + 56} y={456} width={panelW - 112} height={254} rx={8} fill="none"
          stroke={KRP.ink} strokeWidth={5} opacity={0.65} />
        {/* のぞき穴 */}
        <circle cx={panelX + panelW * 0.52} cy={122} r={16} fill={BP.steelLight}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 郵便受けの口 */}
        <g>
          <rect x={panelX + panelW * 0.3} y={560} width={240} height={46} rx={7}
            fill={C.castIronPale} stroke={KRP.ink} strokeWidth={6} />
          <line x1={panelX + panelW * 0.3 + 10} y1={583} x2={panelX + panelW * 0.3 + 230} y2={583}
            stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
        </g>
        {/* 把手 (レバー) */}
        <g>
          <rect x={panelX + 26} y={400} width={54} height={54} rx={10} fill={BP.steelLight}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={panelX + 36} y={424} width={128} height={22} rx={11} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 丁番3枚 */}
        {[180, 430, 680].map((hy) => (
          <g key={hy}>
            <rect x={1626} y={hy} width={28} height={76} rx={5} fill={BP.steel}
              stroke={KRP.ink} strokeWidth={5} />
            <circle cx={1640} cy={hy + 20} r={5} fill={KRP.ink} />
            <circle cx={1640} cy={hy + 56} r={5} fill={KRP.ink} />
          </g>
        ))}
      </g>
      {/* 靴1組 (たたき) */}
      <g>
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${1256 + i * 118} 842) rotate(${i === 0 ? -6 : 5})`}>
            <path d="M -46 0 Q -50 -34 -16 -38 L 26 -38 Q 50 -34 50 -8 Q 50 4 30 6 L -34 6 Q -48 6 -46 0 Z"
              fill={C.castIron} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -16 -36 Q 0 -22 24 -24" stroke={C.snow} strokeWidth={4}
              fill="none" opacity={0.6} />
          </g>
        ))}
      </g>
      {/* 押す人 (両手・体が傾く・足が踏ん張る) */}
      <Kb4cHitoOsu x={680 + o * 14} y={740} s={1.75} dir={1} f={f} lean={lean} armLen={140} />
      {/* 押しても少ししか動かない */}
      <ForceArrow x={1220} y={506} len={190} rot={0} w={26} color={KRP.red}
        t={seg(f, 10, 26)} label="押す" labelSize={34} />
    </Frame>
  );
};

// ===== #172 部屋の中が、負圧になっているんです。 =====
// 格: 図
// どこ: 住戸の断面だけ (クリーム地 + 方眼)。人も家具も置かない
// 演出: 部屋の断面を画面いっぱいに。四方から内へ引く矢印。ドアが内へ反る
// 動き: 矢印が内へ強まり、ドアがたわむ。換気扇が回り続ける
// 絵: 部屋の断面。内側へ引く矢印。ドアが内に吸われる
const Kb4cFuatsu: React.FC<{ f: number }> = ({ f }) => {
  const st = easeOut(clamp01(seg(f, 6, 30)));
  const bow = 26 * st;
  return (
    <Frame f={f} seed={765} bg={KRP.cream}>
      <GridPaper />
      {/* 室内 */}
      <rect x={214} y={174} width={1492} height={592} fill={C.airPale} opacity={0.85} />
      {/* 壁 (断面。切り口はハッチ) */}
      <g>
        <rect x={180} y={140} width={1560} height={660} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <rect x={214} y={174} width={1492} height={592} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <Kb4cHatch id="kb4c-h-top" x={180} y={140} w={1560} h={34} />
        <Kb4cHatch id="kb4c-h-bot" x={180} y={766} w={1560} h={34} />
        <Kb4cHatch id="kb4c-h-left" x={180} y={174} w={34} h={592} />
        <Kb4cHatch id="kb4c-h-right" x={1706} y={174} w={34} h={592} />
      </g>
      {/* 床板 */}
      <g stroke={C.wallShade} strokeWidth={4} opacity={0.9}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={214 + 60 + i * 240} y1={700} x2={214 + 60 + i * 240} y2={766} />
        ))}
        <line x1={214} y1={700} x2={1706} y2={700} />
      </g>
      {/* 右の壁: 換気扇 (出す) */}
      <Kb4cFan x={1680} y={330} r={86} f={f} />
      <ForceArrow x={1790} y={330} len={110} rot={0} w={26} color={KRP.red}
        t={seg(f, 2, 14)} />
      {/* 左の壁: 給気口 (小さく開いている) */}
      <Kb4cVent x={176} y={272} w={44} h={116} f={f} />
      <ForceArrow x={236} y={330} len={96} rot={0} w={15} color={KRP.blueDeep}
        t={seg(f, 4, 18)} />
      {/* 左の壁: ドアが内へ吸われて反る */}
      <g>
        <path
          d={`M 186 470 Q ${186 + bow} 628 186 786 L 216 786 Q ${216 + bow} 628 216 470 Z`}
          fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={206 + bow * 0.9} cy={628} r={13} fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <ForceArrow x={246} y={628} len={120} rot={0} w={18} color={KRP.red}
        t={seg(f, 16, 30)} />
      {/* 四方から内へ引く */}
      <ForceArrow x={960} y={212} len={170} rot={90} w={30} color={KRP.blueDeep} t={seg(f, 8, 24)} />
      <ForceArrow x={960} y={728} len={170} rot={-90} w={30} color={KRP.blueDeep} t={seg(f, 10, 26)} />
      <ForceArrow x={380} y={470} len={220} rot={0} w={30} color={KRP.blueDeep} t={seg(f, 12, 28)} />
      <ForceArrow x={1540} y={470} len={220} rot={180} w={30} color={KRP.blueDeep} t={seg(f, 14, 30)} />
      <TagPlate x={960} y={470} text="負圧" size={72} t={seg(f, 18, 32)} color={KRP.red} />
      <TagPlate x={1450} y={230} text="換気扇" size={36} t={seg(f, 6, 20)} />
      <TagPlate x={470} y={230} text="給気口" size={36} t={seg(f, 8, 22)} />
    </Frame>
  );
};

// ===== #173 換気扇が出す量に、給気口が追いつきません。 =====
// 格: 図
// どこ: てんびんだけ (クリーム地 + 方眼)
// 演出: 左の皿に換気扇 (出ていく量)、右の皿に小さな給気口 (入る量)。左が重い
// 動き: 左がゆっくり沈んで止まる。換気扇は回り続ける
// 絵: てんびん。出ていく量が重く、入る量が軽い
const Kb4cOitsukanai: React.FC<{ f: number }> = ({ f }) => {
  const tilt = -11 * easeOut(clamp01(seg(f, 6, 32)));
  return (
    <Frame f={f} seed={766} bg={KRP.cream}>
      <GridPaper />
      {/* 目盛り (竿の下に置く基準) */}
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.4}>
        <line x1={460} y1={690} x2={1460} y2={690} strokeDasharray="20 16" />
      </g>
      <Balance
        x={960} y={200} s={1} f={f} tilt={tilt} span={860} drop={300}
        leftNode={<Kb4cFan x={0} y={-112} r={82} f={f} />}
        rightNode={
          <g>
            <Kb4cVent x={-48} y={-104} w={96} h={96} f={f} />
          </g>
        }
        pivotMark
      />
      <ForceArrow x={300} y={560} len={170} rot={90} w={26} color={KRP.red}
        t={seg(f, 14, 30)} label="多い" labelSize={36} />
      <ForceArrow x={1650} y={600} len={130} rot={-90} w={22} color={KRP.green}
        t={seg(f, 20, 36)} label="少ない" labelSize={34} />
      <TagPlate x={470} y={700} text="出ていく" size={44} t={seg(f, 8, 22)} />
      <TagPlate x={1450} y={700} text="入る" size={44} t={seg(f, 12, 26)} />
    </Frame>
  );
};

// ===== #174 そして高い建物は、それ自体が煙突と同じです。 =====
// 格: 山
// どこ: 灰青の街。手前に高いビル1棟。足元に人3人
// 演出: ビルを天地いっぱいに。中を縦に空気が抜ける道。レンガの煙突を半透明で重ねる
// 動き: 道を空気が下から上へ光るように抜け、重ねた煙突の輪郭が遅れて浮かぶ。カメラが寄る
// 絵: 街の中のビル全体。縦に空気が抜ける。煙突の図と重ねる。足元の人
const Kb4cTatemonoGaEntotsu: React.FC<{ f: number }> = ({ f }) => {
  const e = easeOut(clamp01(seg(f, 0, 40)));
  const z = 1 + 0.06 * e;
  const CX = 820;
  const TOP = 96;
  const BASE = 820;
  return (
    <Frame f={f} seed={767} bg={KRP.cream}>
      {/* 空 (灰青) */}
      <rect x={-20} y={-20} width={W + 40} height={860} fill={C.airPale} />
      <g stroke={C.airBlue} strokeWidth={6} opacity={0.3}>
        <line x1={-20} y1={210} x2={W + 20} y2={196} />
        <line x1={-20} y1={352} x2={W + 20} y2={366} />
      </g>
      <g transform={`translate(0 ${16 * e}) ${zoomAt(z, CX, 520)}`}>
        {/* 低い建物 */}
        <g>
          {[
            [20, 560, 210, 260],
            [242, 646, 140, 174],
            [1164, 600, 200, 220],
            [1500, 540, 200, 280],
            [1716, 650, 190, 170],
          ].map(([bx, by, bw, bh], i) => (
            <g key={i}>
              <rect x={bx} y={by} width={bw} height={bh} fill={C.wallShade}
                stroke={KRP.ink} strokeWidth={5} />
              <g fill={KPP.glass} stroke={KRP.ink} strokeWidth={2.5} opacity={0.8}>
                {Array.from({ length: Math.floor(bh / 54) }, (_, r) =>
                  Array.from({ length: Math.floor(bw / 56) }, (_, c) => (
                    <rect key={`${r}-${c}`} x={bx + 16 + c * 56} y={by + 18 + r * 54}
                      width={28} height={26} />
                  )),
                )}
              </g>
            </g>
          ))}
        </g>
        {/* 街路樹 */}
        {[470, 1420].map((tx, i) => (
          <g key={i}>
            <rect x={tx - 11} y={700} width={22} height={120} fill={BP.woodDark}
              stroke={KRP.ink} strokeWidth={5} />
            <circle cx={tx} cy={676} r={56} fill={C.plant} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={tx - 42} cy={712} r={38} fill={C.plant} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={tx + 42} cy={716} r={34} fill={C.plant} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 主役のビル (中に空気の道) */}
        <Kb4cBuildingAir cx={CX} top={TOP} base={BASE} w={380} f={f} detail glow={easeOut(clamp01(seg(f, 6, 24)))} />
        {/* 重ねた煙突 (遅れて浮かぶ) */}
        <Kb4cChimneyGhost cx={CX} top={TOP + 44} base={BASE} f={f} t={seg(f, 20, 40)} hole={190} />
        {/* 道路と歩道 */}
        <rect x={-20} y={820} width={W + 40} height={280} fill={C.wallShade} />
        <line x1={-20} y1={820} x2={W + 20} y2={820} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.35}>
          <line x1={-20} y1={876} x2={W + 20} y2={876} />
          <line x1={420} y1={820} x2={420} y2={876} />
          <line x1={1180} y1={820} x2={1180} y2={876} />
        </g>
        {/* 足元の人3人 (高さを比べる) */}
        <Person x={1152} y={818} s={0.44} f={f} phase={1} face="surprised" gaze={[0, -4]} />
        <Person x={1248} y={820} s={0.46} f={f} phase={3} cloth="#5A6B46" clothDark="#45523A"
          face="normal" gaze={[0, -4]} />
        <Person x={1336} y={816} s={0.42} f={f} phase={5} cloth="#6B4B52" clothDark="#523A40"
          face="surprised" gaze={[0, -4]} />
      </g>
      {/* 札 */}
      <TagPlate x={1430} y={300} text="煙突と同じ" size={56} t={seg(f, 24, 40)} color={KRP.red} />
      <TagPlate x={1430} y={430} text="空気の道" size={40} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #175 下から上へ、空気が勢いよく通り抜けます。 =====
// 格: 図
// どこ: #174 と同じ断面だけ (街と人を外した連番)
// 演出: 同じ位置・同じ形のビル断面。#174 で細かった線が、ここで太い矢印になる
// 動き: 矢印が下から上へ次々に伸び上がる。1階からは横向きに吸い込まれる
// 絵: #174と同じ断面。矢印が下から上へ太く強調される (#174と対)
const Kb4cShitaKaraUeE: React.FC<{ f: number }> = ({ f }) => {
  const CX = 820;
  const TOP = 96;
  const BASE = 820;
  return (
    <Frame f={f} seed={768} bg={KRP.cream}>
      <GridPaper />
      {/* #174 と同じ形・同じ位置の断面 (街と人は外した) */}
      <Kb4cBuildingAir cx={CX} top={TOP} base={BASE} w={380} f={f} detail={false} glow={0.35} />
      {/* 切り口を示す床スラブの出っぱり */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = TOP + 140 + i * 140;
          return (
            <g key={i}>
              <rect x={CX - 190 - 54} y={y} width={54} height={16} fill={BP.slab}
                stroke={KRP.ink} strokeWidth={4} />
              <rect x={CX + 190} y={y} width={54} height={16} fill={BP.slab}
                stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
      </g>
      {/* 1階から吸い込まれる空気 */}
      <ForceArrow x={420} y={772} len={210} rot={0} w={26} color={KRP.blueDeep} t={seg(f, 2, 14)} />
      <ForceArrow x={1230} y={772} len={210} rot={180} w={26} color={KRP.blueDeep} t={seg(f, 2, 14)} />
      {/* 下から上へ、太い矢印が次々に伸び上がる */}
      {[0, 1, 2, 3].map((i) => (
        <ForceArrow key={i} x={CX} y={796 - i * 180} len={172} rot={-90} w={46}
          color={KRP.blueDeep} t={seg(f, 4 + i * 7, 16 + i * 7)} />
      ))}
      <TagPlate x={1430} y={300} text="下から上へ" size={52} t={seg(f, 10, 24)} />
      <TagPlate x={1430} y={420} text="勢いよく" size={40} t={seg(f, 24, 38)} color={KRP.red} />
      <TagPlate x={330} y={300} text="ビルの中" size={38} t={seg(f, 6, 20)} />
    </Frame>
  );
};

// ===== #176 今度は建物の玄関と、エレベーターの扉が重くなる。 =====
// 格: 並
// どこ: ビルのエレベーターホール。カメラを人の肩越しまで寄せて、低い位置から見る
// 演出: ★#171 (横向きの人が玄関ドアを押す絵) と5カットしか離れていないので、
//       カメラ・構図・人の向きを全部変える。
//       #171 = 横から見た立ち姿・顔が見える・紺の服・腕を右へ伸ばす・赤い矢印1本
//       #176 = 肩越しの後ろ姿・顔は見えない・緑の服・両腕を扉につく・赤い矢印は左右2本
//       玄関は人を置かずに、左奥へ逃げる遠近のガラス面として小さく添える (重いのは2つ)
// 動き: 扉のすきまが詰まって引っかかり、こまかく震える / すきまを空気が昇る
//       / 手のところに当たりの印が出る
// 絵: エレベーター扉を正面から大きく。後ろ姿で両手をつく人。左奥に遠近の玄関
const Kb4cTobiraGaOmoku: React.FC<{ f: number }> = ({ f }) => {
  const push = easeOut(clamp01(seg(f, 8, 24))) - 0.35 * easeOut(clamp01(seg(f, 30, 42)));
  const stuck = easeOut(clamp01(seg(f, 4, 22)));
  const jitter = f > 22 ? Math.sin(f * 0.85) * 2.4 : 0;
  const gap = 150 - 96 * stuck + jitter;      // 扉のすきま (詰まって止まる)
  const half = gap / 2;
  const leafW = 424 - half;                   // 戸1枚の幅
  const rightX = 1010 + half;
  const hit = clamp01(seg(f, 26, 38));
  const rise = easeOut(clamp01(seg(f, 12, 30)));
  // 後ろ姿の人の手が来る位置 (当たりの印をここに出す)
  const handL = [794, 413] as const;
  const handR = [1226, 413] as const;
  return (
    <Frame f={f} seed={769} bg={KRP.cream}>
      {/* 天井・壁・床 (カメラが低いので天井は浅く、床は手前いっぱい) */}
      <rect x={-20} y={-20} width={W + 40} height={840} fill={C.wall} />
      <rect x={-20} y={-20} width={W + 40} height={116} fill={C.snow} />
      <line x1={-20} y1={96} x2={W + 20} y2={96} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={806} width={W + 40} height={300} fill={C.tile} />
      <line x1={-20} y1={806} x2={W + 20} y2={806} stroke={KRP.ink} strokeWidth={7} />
      {/* 床の照り返し (奥から手前へ広がる) */}
      <g opacity={0.5}>
        {[120, 520, 980, 1400, 1700].map((rx, i) => (
          <polygon key={i} points={`${rx},808 ${rx + 76},808 ${rx + 132},1080 ${rx - 14},1080`}
            fill={C.snow} opacity={0.6} />
        ))}
      </g>
      {/* 天井の埋め込み照明4つ */}
      {[150, 310, 1630, 1790].map((lx, i) => (
        <g key={i}>
          <circle cx={lx} cy={46} r={27} fill={C.bulb} stroke={KRP.ink} strokeWidth={5}
            opacity={0.92} />
          <circle cx={lx} cy={46} r={12} fill={C.flameCore} opacity={0.9} />
          <ellipse cx={lx} cy={118} rx={88} ry={26} fill={C.bulb}
            opacity={0.26 + 0.08 * Math.sin(f / 12 + i)} />
        </g>
      ))}
      {/* 天井板の目地 (遠近。奥の一点へ寄る) */}
      <g stroke={C.wallShade} strokeWidth={4} opacity={0.7}>
        <line x1={-20} y1={34} x2={W + 20} y2={34} />
        <line x1={-20} y1={70} x2={W + 20} y2={70} />
      </g>

      {/* ===== 左奥: 建物の玄関 (遠近で逃げるガラス面。人は置かない) ===== */}
      <g>
        {/* 外の明るさ */}
        <polygon points="40,296 430,196 430,796 40,700" fill={C.snow} />
        {/* 枠 (方立・無目) */}
        <polygon points="40,296 430,196 430,796 40,700" fill="none"
          stroke={KRP.ink} strokeWidth={8} />
        {/* ガラス2枚 */}
        <polygon points="68,312 226,272 226,768 68,710" fill={C.glass} opacity={0.82}
          stroke={KRP.ink} strokeWidth={6} />
        <polygon points="254,264 404,226 404,780 254,762" fill={C.glass} opacity={0.82}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 方立 */}
        <polygon points="226,272 254,264 254,762 226,768" fill={C.castIronPale}
          stroke={KRP.ink} strokeWidth={5} />
        {/* ガラスの照り */}
        <g stroke={C.snow} strokeWidth={9} opacity={0.75} strokeLinecap="round">
          <line x1={92} y1={668} x2={210} y2={340} />
          <line x1={140} y1={692} x2={222} y2={468} />
          <line x1={276} y1={742} x2={392} y2={300} />
        </g>
        {/* 街路樹 (外に見える) */}
        <g opacity={0.6}>
          <rect x={330} y={520} width={16} height={240} fill={C.wallShade} />
          <circle cx={338} cy={494} r={56} fill={C.plant} stroke={KRP.ink}
            strokeWidth={4} opacity={0.8} />
        </g>
        {/* 把手 (縦の棒2本) */}
        <rect x={210} y={420} width={17} height={190} rx={8} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={254} y={414} width={17} height={190} rx={8} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 下枠 */}
        <polygon points="40,700 430,796 430,830 40,732" fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={6} />
        {/* ここも引っかかっている印 */}
        <g opacity={hit} stroke={KRP.red} strokeWidth={6} strokeLinecap="round">
          <line x1={240} y1={386} x2={240} y2={346} />
          <line x1={196} y1={396} x2={166} y2={366} />
          <line x1={286} y1={392} x2={316} y2={362} />
        </g>
      </g>

      {/* ===== 中央: エレベーターの扉 (主役。天井から床まで) ===== */}
      <g>
        {/* 枠 (三方枠) */}
        <rect x={520} y={96} width={980} height={710} fill={C.castIronPale}
          stroke={KRP.ink} strokeWidth={9} />
        <rect x={538} y={114} width={944} height={692} fill="none"
          stroke={BP.steelDark} strokeWidth={4} opacity={0.6} />
        {/* ヘッダー (枠の上。階数表示とホールランプ) */}
        <rect x={520} y={96} width={980} height={90} fill={BP.steelLight}
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={944} y={110} width={132} height={62} rx={8} fill={C.ink2}
          stroke={KRP.ink} strokeWidth={6} />
        <text x={1010} y={158} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={42} fill={C.bulb}>1</text>
        {[760, 1260].map((lx, i) => (
          <g key={i}>
            <polygon points={`${lx},120 ${lx - 26},158 ${lx + 26},158`}
              fill={i === 0 ? C.bulb : BP.steel} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        <Rivets x1={560} y1={176} x2={1460} y2={176} n={10} r={8} />
        {/* かごの中の暗がり (すきまから見える) */}
        <rect x={586} y={186} width={848} height={620} fill={C.ink2} opacity={0.6} />
        <line x1={586} y1={560} x2={1434} y2={560} stroke={C.castIronPale}
          strokeWidth={7} opacity={0.5} />
        {/* すきまを昇る空気 (頭より上だけ見える。y=200〜340) */}
        <g opacity={rise * 0.95}>
          {[0, 1, 2].map((i) => {
            const p = (((f / 26) + i / 3) % 1 + 1) % 1;
            const cy = 340 - p * 150;
            return (
              <polygon key={i}
                points={`${1010},${cy - 34} ${1010 - half + 4},${cy + 6} ${1010 + half - 4},${cy + 6}`}
                fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3}
                opacity={Math.sin(p * Math.PI)} />
            );
          })}
        </g>
        {/* 戸2枚 (ステンレスのヘアライン。すきまが詰まって止まる) */}
        <g>
          <rect x={586} y={186} width={leafW} height={620} fill={BP.steelLight}
            stroke={KRP.ink} strokeWidth={7} />
          <rect x={rightX} y={186} width={leafW} height={620} fill={BP.steelLight}
            stroke={KRP.ink} strokeWidth={7} />
          {/* ヘアライン (戸の幅に合わせて動く) */}
          <g stroke={BP.steelDark} strokeWidth={4} opacity={0.6}>
            {[0.26, 0.5, 0.74].map((k) => (
              <line key={`l${k}`} x1={586 + leafW * k} y1={192}
                x2={586 + leafW * k} y2={800} />
            ))}
            {[0.26, 0.5, 0.74].map((k) => (
              <line key={`r${k}`} x1={rightX + leafW * k} y1={192}
                x2={rightX + leafW * k} y2={800} />
            ))}
          </g>
          {/* 戸当たりのゴム (すきまの両縁) */}
          <rect x={586 + leafW - 14} y={186} width={14} height={620} fill={C.soot}
            opacity={0.8} />
          <rect x={rightX} y={186} width={14} height={620} fill={C.soot} opacity={0.8} />
        </g>
        {/* 敷居 (溝2本) */}
        <rect x={586} y={806} width={848} height={30} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.ink2} strokeWidth={5} opacity={0.8}>
          <line x1={600} y1={818} x2={1420} y2={818} />
          <line x1={600} y1={828} x2={1420} y2={828} />
        </g>
      </g>

      {/* 左右へこじ開けようとする力 (人の頭より上に置く) */}
      <ForceArrow x={980} y={246} len={230} rot={180} w={26} color={KRP.red}
        t={seg(f, 10, 26)} />
      <ForceArrow x={1040} y={246} len={230} rot={0} w={26} color={KRP.red}
        t={seg(f, 10, 26)} />

      {/* 扉に両手をつく人 (後ろ姿。#171 の横向き・紺とは別人・別の向き) */}
      <Kb4cHitoUshiroDe x={1010} y={836} s={1.7} f={f} push={push} armLen={118} />
      {/* 手のところの当たりの印 (押しても動かない) */}
      <g opacity={hit} stroke={KRP.red} strokeWidth={6} strokeLinecap="round">
        {[handL, handR].map(([hx, hy], i) => (
          <g key={i} transform={`translate(${hx} ${hy}) scale(${i === 0 ? -1 : 1} 1)`}>
            <line x1={26} y1={-18} x2={56} y2={-40} />
            <line x1={32} y1={6} x2={66} y2={6} />
            <line x1={26} y1={28} x2={56} y2={50} />
          </g>
        ))}
      </g>

      {/* 右手前: 呼びボタンと植栽 (壁ぎわを埋める) */}
      <g>
        <rect x={1522} y={408} width={76} height={128} rx={10} fill={C.snow}
          stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1560} cy={444} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={1560} cy={498} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <g>
        <path d="M 1664 718 L 1684 866 L 1856 866 L 1876 718 Z" fill={C.snow}
          stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1684 866 L 1856 866 L 1864 800 L 1676 800 Z" fill={C.wallShade}
          opacity={0.55} />
        <rect x={1648} y={692} width={244} height={34} rx={8} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={6} />
        {[-1, 0, 1].map((k, i) => {
          const sw = Math.sin(f / 11 + i) * 6;
          const lx = 1770 + k * 78 + sw;
          const ly = 508 + Math.abs(k) * 34;
          return (
            <g key={i}>
              <path d={`M 1770 706 Q ${1770 + k * 50} 618 ${lx} ${ly + 12}`}
                stroke={C.plant} strokeWidth={18} fill="none" strokeLinecap="round" />
              <ellipse cx={lx} cy={ly} rx={46} ry={32} fill={C.plant}
                stroke={KRP.ink} strokeWidth={5}
                transform={`rotate(${k * 16} ${lx} ${ly})`} />
            </g>
          );
        })}
      </g>

      <TagPlate x={230} y={210} text="玄関" size={44} t={seg(f, 6, 20)} />
      <TagPlate x={230} y={330} text="重い" size={48} t={seg(f, 16, 30)} color={KRP.red} />
      <TagPlate x={1700} y={210} text="エレベーター" size={38} t={seg(f, 12, 26)} />
      <TagPlate x={1700} y={330} text="重い" size={48} t={seg(f, 24, 38)} color={KRP.red} />
    </Frame>
  );
};

// ===== #177 空気も、勝手には入ってこないんです。 =====
// 格: 図
// どこ: 窓とガラスの断面だけ (章題「高さに住むコスト」への呼応)
// 演出: 外から部屋へ入ろうとする空気の矢印を画面の 2/3 に大きく。窓の桟は作り込む
// 動き: 矢印が外から近づき、×で止まって跳ね返る
// 絵: 章題への呼応。空気の矢印に赤い×。札「勝手には来ない」
const Kb4cKatteNiKonai: React.FC<{ f: number }> = ({ f }) => {
  const adv = easeOut(clamp01(seg(f, 4, 20)));
  const bounce = -Math.sin(clamp01(seg(f, 20, 36)) * Math.PI) * 30;
  const ax = 130 + bounce;
  return (
    <Frame f={f} seed={770} bg={KRP.cream}>
      <GridPaper />
      {/* 窓 (外枠・桟・ガラス4枚・錠・水切り) */}
      <g>
        <rect x={820} y={120} width={980} height={700} fill={C.castIronPale}
          stroke={KRP.ink} strokeWidth={9} />
        <rect x={858} y={158} width={904} height={624} fill={C.glass} opacity={0.9}
          stroke={KRP.ink} strokeWidth={6} />
        {/* ガラス4枚と桟 */}
        <rect x={1290} y={158} width={40} height={624} fill={BP.steelLight}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={858} y={448} width={904} height={40} fill={BP.steelLight}
          stroke={KRP.ink} strokeWidth={6} />
        {/* ガラスの照り */}
        <g stroke={C.snow} strokeWidth={12} opacity={0.7} strokeLinecap="round">
          <line x1={906} y1={420} x2={1216} y2={196} />
          <line x1={1000} y1={430} x2={1246} y2={254} />
          <line x1={1370} y1={760} x2={1680} y2={530} />
          <line x1={1460} y1={766} x2={1708} y2={590} />
        </g>
        {/* ガラスの縁 (二重線) */}
        <g fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.55}>
          <rect x={876} y={176} width={396} height={254} />
          <rect x={1348} y={176} width={396} height={254} />
          <rect x={876} y={506} width={396} height={258} />
          <rect x={1348} y={506} width={396} height={258} />
        </g>
        {/* クレセント錠 (閉じている) */}
        <g>
          <circle cx={1310} cy={468} r={34} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1310 468 L 1310 418 Q 1348 424 1342 462" stroke={KRP.ink}
            strokeWidth={10} fill="none" strokeLinecap="round" />
          <circle cx={1310} cy={468} r={9} fill={KRP.ink} />
        </g>
        <HexBolt x={880} y={142} r={13} fill={BP.steelDark} />
        <HexBolt x={1740} y={142} r={13} fill={BP.steelDark} />
        {/* 水切り (下枠) */}
        <rect x={790} y={820} width={1040} height={36} rx={6} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 外から入ろうとする空気 (3本・大きく) */}
      {[300, 470, 640].map((ay, i) => (
        <ForceArrow key={i} x={ax} y={ay} len={520} rot={0} w={46}
          color={KRP.blueDeep} t={adv * clamp01(seg(f, 2 + i * 4, 16 + i * 4))} />
      ))}
      {/* ガラスの前で止まる */}
      <XMark x={756} y={470} s={3} t={seg(f, 18, 32)} />
      <TagPlate x={420} y={230} text="勝手には来ない" size={44} t={seg(f, 22, 36)} color={KRP.red} />
      <TagPlate x={200} y={740} text="外" size={40} t={seg(f, 6, 20)} />
      <TagPlate x={1560} y={210} text="室内" size={36} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #178 これで、柱が5本立ちました。 =====
// 格: 山
// どこ: 柱5本の装置ぜんたい。灰青の街に光が差す
// 演出: ★装置の完成。最後の柱 (空気) が立ち、5本の札が順に出る。見上げる人2人
// 動き: 最後の柱が立ち上がる → 揺れが収まる → 札が順に出る → 建物がぴたりと止まる
// 絵: ★装置の完成。5本柱ぜんぶが立ち、タワマン群がぴたりと安定する。見上げる人
const Kb4cHashira5Hon: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(clamp01(seg(f, 2, 20)));
  const ray = easeOut(clamp01(seg(f, 8, 32)));
  const settled = clamp01(seg(f, 20, 28));
  return (
    <Frame f={f} seed={771} bg={KRP.cream}>
      {/* 明るい空 */}
      <rect x={-20} y={-20} width={W + 40} height={900} fill={C.airPale} />
      <rect x={-20} y={-20} width={W + 40} height={420} fill={C.snow} opacity={0.75} />
      {/* 差してくる光 */}
      <g opacity={ray}>
        {[0, 1, 2, 3, 4].map((i) => (
          <polygon key={i}
            points={`170,20 ${1180 + i * 150},1080 ${1300 + i * 150},1080`}
            fill={C.ray} opacity={0.44} />
        ))}
        <circle cx={170} cy={20} r={150} fill={C.ray} opacity={0.7} />
        <circle cx={170} cy={20} r={210} fill={C.ray} opacity={0.3} />
      </g>
      {/* 地面 (街の足元) */}
      <rect x={-20} y={846} width={W + 40} height={260} fill={C.wallShade} />
      <line x1={-20} y1={846} x2={W + 20} y2={846} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.3}>
        <line x1={-20} y1={900} x2={W + 20} y2={900} />
        <line x1={520} y1={846} x2={520} y2={900} />
        <line x1={1400} y1={846} x2={1400} y2={900} />
      </g>
      {/* 装置ぜんたい (最後の柱「空気」が滑り込んで立つ → ぴたりと止まる) */}
      <TowerOnPillars
        f={f}
        pulled={{ kuuki: 0.95 * (1 - rise) }}
        standing={f < 34 ? ["kuuki"] : []}
        labels={false}
        lit={1}
      />
      {/* 5本の札 (順に出る。色は柱の色) */}
      {PILLAR_ORDER.map((id, i) => (
        <TagPlate key={id} x={PILLAR_X[id]} y={782} text={PILLAR_META[id].label}
          size={40} t={seg(f, 20 + i * 3, 26 + i * 3)}
          fill={PILLAR_META[id].color} />
      ))}
      {/* 見上げる人2人 (大きさを比べる) */}
      <Person x={525} y={846} s={0.5} f={f} phase={2} face="surprised" gaze={[0, -5]} />
      <Person x={1105} y={846} s={0.5} f={f} phase={6} cloth="#5A6B46" clothDark="#45523A"
        face="normal" gaze={[0, -5]} />
      {/* もう揺れない印 */}
      <g opacity={settled * 0.9}>
        <g stroke={KRP.green} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M 1706 430 l 44 46 l 86 -104" />
        </g>
      </g>
      <TagPlate x={300} y={180} text="柱が5本" size={56} t={seg(f, 12, 26)} />
      <TagPlate x={300} y={300} text="完成" size={52} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb4_kikai_ga_irekaeru: (f) => <Kb4cKikaiGaIrekaeru f={f} />,
  kb4_tomete_wa_ikenai: (f) => <Kb4cTometeWaIkenai f={f} />,
  kb4_door_ga_omoi: (f) => <Kb4cDoorGaOmoi f={f} />,
  kb4_fuatsu: (f) => <Kb4cFuatsu f={f} />,
  kb4_oitsukanai: (f) => <Kb4cOitsukanai f={f} />,
  kb4_tatemono_ga_entotsu: (f) => <Kb4cTatemonoGaEntotsu f={f} />,
  kb4_shita_kara_ue_e: (f) => <Kb4cShitaKaraUeE f={f} />,
  kb4_tobira_ga_omoku: (f) => <Kb4cTobiraGaOmoku f={f} />,
  kb4_katte_ni_konai: (f) => <Kb4cKatteNiKonai f={f} />,
  kb4_hashira_5hon: (f) => <Kb4cHashira5Hon f={f} />,
};

export const K_B4C_MOTIFS: string[] = [
  "kb4_kikai_ga_irekaeru",    // #169 そのかわり、機械がいつも空気を入れ替えています。
  "kb4_tomete_wa_ikenai",     // #170 止めてはいけない換気です。
  "kb4_door_ga_omoi",         // #171 ちなみに、玄関のドアが重い日があります。
  "kb4_fuatsu",               // #172 部屋の中が、負圧になっているんです。
  "kb4_oitsukanai",           // #173 換気扇が出す量に、給気口が追いつきません。
  "kb4_tatemono_ga_entotsu",  // #174 そして高い建物は、それ自体が煙突と同じです。
  "kb4_shita_kara_ue_e",      // #175 下から上へ、空気が勢いよく通り抜けます。
  "kb4_tobira_ga_omoku",      // #176 今度は建物の玄関と、エレベーターの扉が重くなる。
  "kb4_katte_ni_konai",       // #177 空気も、勝手には入ってこないんです。
  "kb4_hashira_5hon",         // #178 これで、柱が5本立ちました。
];

export const kosoB4cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
