// 「『2位』は、120年前に発明された」: 第8章「全国民 同じ物差しへ。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の文#143〜#162 (20文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで20枚。
// motif 名は必ず ib8_ で始める。WobbleDefs の seed はこのファイルでは 1042〜1061 を使う。
// 設計書: docs/briefs/IchiB8.md (1文ごとの「格」と絵の中身を決めてから描く)
//
// ★絵の「格」(制作ガイド §7 第3層) ★2026-11-06 改定: 配分は 山3 : 並3 : 図4
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = 図と札が主役。ただし第16条の床を敷く (50〜120行)
//
// ★制作ガイド第16条「作り込みの床の法 (素肌禁止)」2026-11-06 追加
//   素の方眼 (GridPaper) + クリーム地だけの絵は禁止。方眼を使うなら「何かの紙」の上に clip する。
//   地面や壁が素のベタ1色で広く残っていたら未完成。小物・質感を一段敷く。
//   ただし主役の明快さが最優先。背景は彩度低め・線細め・opacity 控えめ。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。
//   seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間を写すため)。
//   札・章扉タイトルに読点「、」は使わない (札の読点の法)。間は半角スペース。
//
// ★連番で同じ物を映すときは絵を複製せず、1つの部品に phase prop を持たせて切り替える。

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow,
} from "./IchiShared";
import { lerp, rnd, zoomAt, GridPaper } from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色
// ===================================================================
const C = {
  ink: "#3A3A34",
  wall: "#CFD8C8",       // 昭和の教室の壁
  wallShade: "#B2BEAC",
  wainscot: "#B98E58",   // 腰板
  board: "#2E4034",      // 黒板
  boardFrame: "#8A6A3E",
  chalk: "#E8EDE2",
  floor: "#C7A977",      // 板の床
  floorDark: "#A3854F",
  desk: "#CFAE76",       // 学習机
  deskDark: "#A2804C",
  steel: "#9AA2A8",      // 机の脚
  win: "#DCE9F0",        // 窓のすりガラス
  winDeep: "#BBD3E0",
  night: "#263654",      // 天文台の夜空
  nightDeep: "#17213A",
  dome: "#A2B6AA",       // 観測ドーム
  domeDark: "#7E9388",
  brass: "#C9A447",      // 望遠鏡の真鍮
  brassDark: "#9A7B2E",
  star: "#F4ECC9",
  stone: "#B9B2A2",      // 石造り・石畳
  stoneDark: "#948C7C",
  washi: "#EFE4C8",      // 紙・通知表
  washiEdge: "#D6C4A0",
  vermil: "#C2452F",     // 朱 (差し色)
  mapLand: "#D6C9A4",    // 日本地図の陸
  mapSea: "#BDD4E0",
  curve: "#4A6E8A",      // 分布の線
  chair: "#C0754A",      // 椅子
  chairDark: "#95552F",
  lamp: "#F2CE4C",
  lampGlow: "#F7DF93",
  woodDesk: "#8A6239",   // 事務机・観測机の天板
  woodDeskDark: "#6B4A29",
  ruler: "#E0C98A",      // 物差し
  shelf: "#B0885A",
  gakuran: "#2F3A4A",    // 学生服
  gakuranDark: "#232B38",
  sailor: "#3C4A62",
  dohyo: "#C9B88E",      // 土俵マップの輪 (IchiB0 と同じ色味)
  dohyoDark: "#A8966C",
  // ---- #149 の町の広場。天文台 (#145〜#148) と同じ19世紀の町なので石と空を続ける ----
  sky: "#CFDCE4",        // 昼の空 (夜空 night と対になる薄さ)
  skyDeep: "#AEC3D0",    // 空の上側を少し濃くして視線を下の人の列へ落とす
  roof: "#A8705A",       // 低い家並みの瓦屋根
  roofDark: "#85533F",
  // 7人の上着。彩度を落とした5色。隣同士が同じ色にならないよう配る (第16条)
  coatA: "#6E7F8E", coatAD: "#53626F",
  coatB: "#8B6B52", coatBD: "#6B4F3A",
  coatC: "#7A8470", coatCD: "#5C6554",
  coatD: "#9A7E6A", coatDD: "#77604F",
  coatE: "#64708A", coatED: "#4B5569",
  // ---- #157 の机のラシャ (下敷き)。職員室の茶色の机 (#156) と見た目を分けるための緑 ----
  mat: "#3F5048",
  matDark: "#2E3B35",
  mimeo: "#D9E4EC",      // ガリ版刷りの青っぽい紙
  mimeoEdge: "#B9CBD8",
  mimeoInk: "#3C5A74",   // ガリ版の藍インク
};
void Stamp; void XMark; void Arrow; void zoomAt;

// ===================================================================
// この章だけのローカル部品
// ===================================================================

// ---- 昭和の教室の箱 (壁・窓・腰板・板の床)。#143 #149 #150 #152 #153 #154 #159 ----
const Classroom: React.FC<{
  f: number; floorY?: number; winSide?: "left" | "right" | "none"; dim?: number;
}> = ({ f, floorY = 720, winSide = "left", dim = 0 }) => {
  const shimmer = 0.78 + Math.sin(f / 11) * 0.07;
  const wins = winSide === "none" ? [] : winSide === "left" ? [70, 410, 750] : [1010, 1350, 1690];
  return (
    <g>
      {/* 壁 */}
      <rect x={-20} y={-20} width={W + 40} height={floorY + 40} fill={C.wall} />
      <rect x={-20} y={-20} width={W + 40} height={140} fill={C.wallShade} opacity={0.45} />
      {/* 柱と壁のしみ (質感) */}
      <g stroke={C.wallShade} strokeWidth={4} opacity={0.5}>
        <line x1={300} y1={-20} x2={300} y2={floorY} />
        <line x1={1610} y1={-20} x2={1610} y2={floorY} />
      </g>
      <g fill={C.wallShade} opacity={0.28}>
        <ellipse cx={1180} cy={196} rx={92} ry={38} />
        <ellipse cx={520} cy={310} rx={58} ry={24} />
        <ellipse cx={1540} cy={430} rx={70} ry={28} />
      </g>
      {/* 窓 (すりガラスの光と外の木の影) */}
      {wins.map((wx, i) => (
        <g key={wx}>
          <rect x={wx} y={118} width={262} height={332} rx={6} fill={C.win}
            stroke={KRP.ink} strokeWidth={6} opacity={shimmer} />
          <path d={`M ${wx + 28} 448 q 44 ${-96 - Math.sin(f / 13 + i) * 12} 96 -156`}
            fill="none" stroke={C.winDeep} strokeWidth={16} opacity={0.5} />
          <line x1={wx} y1={282} x2={wx + 262} y2={282} stroke={KRP.ink} strokeWidth={5} />
          <line x1={wx + 131} y1={118} x2={wx + 131} y2={450} stroke={KRP.ink} strokeWidth={5} />
          <rect x={wx - 10} y={450} width={282} height={16} rx={5} fill={C.wainscot}
            stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 腰板 */}
      <rect x={-20} y={floorY - 118} width={W + 40} height={118} fill={C.wainscot} opacity={0.48} />
      <line x1={-20} y1={floorY - 118} x2={W + 20} y2={floorY - 118}
        stroke={KRP.ink} strokeWidth={5} opacity={0.55} />
      {/* 板の床 */}
      <rect x={-20} y={floorY} width={W + 40} height={H - floorY + 40} fill={C.floor} />
      <g stroke={C.floorDark} strokeWidth={4} opacity={0.5}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={-20} y1={floorY + 46 + i * 64} x2={W + 20} y2={floorY + 46 + i * 64} />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={`v${i}`} x1={i * 266 + 40} y1={floorY} x2={i * 266 - 90} y2={H} />
        ))}
      </g>
      <g fill={C.floorDark} opacity={0.38}>
        <ellipse cx={360} cy={floorY + 86} rx={14} ry={6} />
        <ellipse cx={1282} cy={floorY + 156} rx={16} ry={7} />
        <ellipse cx={820} cy={floorY + 238} rx={12} ry={5} />
      </g>
      {dim > 0 && <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightDeep} opacity={dim} />}
    </g>
  );
};

// ---- 黒板 (枠・チョーク受け・黒板消し)。children は板の面に描く ----
const Blackboard: React.FC<{
  x: number; y: number; w: number; h: number; f: number; children?: React.ReactNode;
}> = ({ x, y, w, h, f, children }) => (
  <g>
    <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={8}
      fill={C.boardFrame} stroke={KRP.ink} strokeWidth={7} />
    <rect x={x} y={y} width={w} height={h} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
    {/* 拭きあとのむら */}
    <g fill={C.chalk} opacity={0.07}>
      <ellipse cx={x + w * 0.24} cy={y + h * 0.3} rx={w * 0.2} ry={h * 0.2} />
      <ellipse cx={x + w * 0.76} cy={y + h * 0.66} rx={w * 0.22} ry={h * 0.18} />
    </g>
    {children}
    {/* チョーク受け + チョーク + 黒板消し */}
    <rect x={x - 12} y={y + h + 12} width={w + 24} height={20} rx={7}
      fill={C.boardFrame} stroke={KRP.ink} strokeWidth={6} />
    <g>
      <rect x={x + 60} y={y + h + 4} width={62} height={13} rx={6}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <rect x={x + 134} y={y + h + 6} width={44} height={11} rx={5}
        fill={C.lamp} stroke={KRP.ink} strokeWidth={4} />
      <g transform={`translate(${x + w - 130} ${y + h + 2 + Math.sin(f / 14) * 2})`}>
        <rect x={0} y={0} width={96} height={18} rx={4} fill={C.wainscot} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={4} y={14} width={88} height={10} rx={3} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  </g>
);

// ---- 学習机 (正面やや斜め)。人の脚を隠す「前板」にもなる ----
const SchoolDesk: React.FC<{
  x: number; y: number; s?: number; paper?: boolean; f?: number; phase?: number;
}> = ({ x, y, s = 1, paper, f = 0, phase = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 脚 */}
    <g stroke={C.steel} strokeWidth={13} strokeLinecap="round">
      <line x1={-86} y1={-6} x2={-74} y2={104} />
      <line x1={86} y1={-6} x2={74} y2={104} />
      <line x1={-74} y1={104} x2={74} y2={104} />
    </g>
    {/* 天板 */}
    <path d="M -116 -30 L 116 -30 L 104 6 L -104 6 Z" fill={C.desk} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={-104} y={2} width={208} height={16} rx={5} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 木目 */}
    <g stroke={C.deskDark} strokeWidth={3} opacity={0.4}>
      <line x1={-96} y1={-18} x2={96} y2={-18} />
      <line x1={-86} y1={-6} x2={86} y2={-6} />
    </g>
    {paper && (
      <g transform={`rotate(${-3 + Math.sin((f + phase * 9) / 15) * 1.2})`}>
        <rect x={-62} y={-26} width={118} height={30} rx={3}
          fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.5}>
          <line x1={-50} y1={-17} x2={44} y2={-17} />
          <line x1={-50} y1={-8} x2={22} y2={-8} />
        </g>
      </g>
    )}
  </g>
);

// ---- 紙 (机に広げた1枚)。grid を立てると方眼が紙の中だけに clip される (第16条) ----
const PaperSheet: React.FC<{
  id: string; x: number; y: number; w: number; h: number; rot?: number;
  grid?: boolean; rule?: number; children?: React.ReactNode;
}> = ({ id, x, y, w, h, rot = 0, grid, rule = 0, children }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 12} y={y + 14} width={w} height={h} rx={8} fill={KRP.ink} opacity={0.13} />
    <rect x={x} y={y} width={w} height={h} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
    <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx={3} fill="none"
      stroke={KRP.ink} strokeWidth={2.5} opacity={0.32} />
    {grid && (
      <>
        <clipPath id={`clip${id}`}><rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={4} /></clipPath>
        <g clipPath={`url(#clip${id})`} opacity={0.75}><GridPaper tombo={false} pitch={54} /></g>
      </>
    )}
    {rule > 0 && (
      <g stroke={C.washiEdge} strokeWidth={3} opacity={0.9}>
        {Array.from({ length: rule }, (_, i) => (
          <line key={i} x1={x + 34} y1={y + 56 + i * ((h - 100) / Math.max(rule - 1, 1))}
            x2={x + w - 34} y2={y + 56 + i * ((h - 100) / Math.max(rule - 1, 1))} />
        ))}
      </g>
    )}
    {children}
  </g>
);

// ---- 事務机・観測机の天板 (画面いっぱい)。奥に壁、手前に縁 ----
const DeskSurface: React.FC<{ f: number; wall?: string; top?: number; dark?: boolean }> = ({
  f, wall = C.wall, top = 300, dark,
}) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={top + 40} fill={wall} />
    <rect x={-20} y={-20} width={W + 40} height={120} fill={KRP.ink} opacity={dark ? 0.3 : 0.1} />
    <rect x={-20} y={top} width={W + 40} height={H - top + 40} fill={C.woodDesk} />
    <rect x={-20} y={top} width={W + 40} height={22} rx={6} fill={C.woodDeskDark}
      stroke={KRP.ink} strokeWidth={5} />
    {/* 木目 */}
    <g stroke={C.woodDeskDark} strokeWidth={4} opacity={0.4} fill="none">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M -20 ${top + 90 + i * 128} q 480 ${-14 + i * 4} 980 2 t 980 -8`} />
      ))}
    </g>
    <g fill={C.woodDeskDark} opacity={0.35}>
      <ellipse cx={220} cy={top + 180} rx={26} ry={11} />
      <ellipse cx={1660} cy={top + 400} rx={30} ry={13} />
    </g>
    {/* 手前の縁の影 */}
    <rect x={-20} y={H - 60} width={W + 40} height={80} fill={KRP.ink} opacity={0.12} />
    <ellipse cx={960} cy={top + 40} rx={1100} ry={70} fill={C.lampGlow}
      opacity={0.1 + Math.sin(f / 13) * 0.03} />
  </g>
);

// ---- 文鎮 (紙の押さえ) ----
const Paperweight: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({
  x, y, rot = 0, s = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-82} y={-16} width={164} height={32} rx={13} fill={KRP.grayDark}
      stroke={KRP.ink} strokeWidth={5} />
    <circle cx={0} cy={0} r={7} fill={C.brass} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// ---- 星空 (またたく)。#145 #148 ----
const StarField: React.FC<{ f: number; n?: number; y0?: number; y1?: number }> = ({
  f, n = 46, y0 = 20, y1 = 520,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={40 + rnd(i * 7 + 2) * (W - 80)} cy={y0 + rnd(i * 11 + 5) * (y1 - y0)}
        r={1.8 + rnd(i * 13 + 1) * 3.2} fill={C.star}
        opacity={0.35 + 0.55 * Math.abs(Math.sin(f / 12 + i * 0.9))} />
    ))}
  </g>
);

// ---- 望遠鏡。tilt が負で上 (星)・正で下 (人) を向く。#145 #148 ----
const Telescope: React.FC<{ x: number; y: number; s?: number; tilt: number; f: number }> = ({
  x, y, s = 1, tilt, f,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 三脚 */}
    <g stroke={C.woodDeskDark} strokeWidth={17} strokeLinecap="round">
      <line x1={0} y1={0} x2={-78} y2={168} />
      <line x1={0} y1={0} x2={78} y2={168} />
      <line x1={0} y1={0} x2={10} y2={176} />
    </g>
    <circle cx={0} cy={0} r={26} fill={C.brassDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 筒 */}
    <g transform={`rotate(${tilt})`}>
      <rect x={-46} y={-30} width={300} height={60} rx={26} fill={C.brass}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={-46} y={-22} width={300} height={16} rx={8} fill={KRP.white} opacity={0.26} />
      <rect x={244} y={-38} width={34} height={76} rx={10} fill={C.brassDark}
        stroke={KRP.ink} strokeWidth={5.5} />
      <ellipse cx={272} cy={0} rx={10} ry={34} fill={C.night} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 継ぎ目のリング */}
      <g stroke={C.brassDark} strokeWidth={5}>
        <line x1={60} y1={-30} x2={60} y2={30} />
        <line x1={150} y1={-30} x2={150} y2={30} />
      </g>
      {/* 接眼部 */}
      <rect x={-78} y={-18} width={40} height={36} rx={9} fill={C.brassDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* ピントのつまみ (まわる) */}
      <circle cx={30} cy={38} r={13} fill={C.brassDark} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={30} y1={38} x2={30 + Math.cos(f / 7) * 9} y2={38 + Math.sin(f / 7) * 9}
        stroke={KRP.ink} strokeWidth={4} />
    </g>
  </g>
);

// ---- 釣鐘の分布 (黒板のチョーク画)。#152 phase1 / #153 phase2 ----
// 5段階の割り当て: 1=7% / 2=24% / 3=38% / 4=24% / 5=7% (左から1・右端が5)
const BAND_EDGE = [0, 0.07, 0.31, 0.69, 0.93, 1];
const BAND_PCT = ["7", "24", "38", "24", "7"];
const BellCurve: React.FC<{
  f: number; phase: 1 | 2; cx: number; base: number; w: number; h: number;
}> = ({ f, phase, cx, base, w, h }) => {
  const x0 = cx - w / 2;
  const gy = (t: number) => base - h * Math.exp(-(((t - 0.5) * 6) ** 2) / 2);
  const pts = Array.from({ length: 73 }, (_, i) => {
    const t = i / 72;
    return `${(x0 + t * w).toFixed(1)},${gy(t).toFixed(1)}`;
  });
  const draw = easeOut(seg(f, 2, 20));
  const bandPath = (a: number, b: number) => {
    const seq = Array.from({ length: 19 }, (_, i) => {
      const t = a + ((b - a) * i) / 18;
      return `${(x0 + t * w).toFixed(1)} ${gy(t).toFixed(1)}`;
    });
    return `M ${x0 + a * w} ${base} L ${seq.join(" L ")} L ${x0 + b * w} ${base} Z`;
  };
  return (
    <g>
      {/* 下敷きの目盛り (チョークのうすい縦線) */}
      <g stroke={C.chalk} strokeWidth={2.5} opacity={0.2}>
        {BAND_EDGE.map((t, i) => (
          <line key={i} x1={x0 + t * w} y1={base} x2={x0 + t * w} y2={gy(t) - 10} />
        ))}
      </g>
      {/* 帯の塗り */}
      {BAND_EDGE.slice(0, 5).map((a, i) => {
        const b = BAND_EDGE[i + 1];
        const on = phase === 2 ? seg(f, 8 + i * 4, 18 + i * 4) : i === 4 ? seg(f, 16, 28) : 0;
        if (on <= 0.01) return null;
        const col = i === 4 ? C.vermil : i === 0 ? C.curve : C.chalk;
        return <path key={i} d={bandPath(a, b)} fill={col} opacity={on * (i === 4 || i === 0 ? 0.6 : 0.26)} />;
      })}
      {/* 曲線 (描かれていく) */}
      <polyline points={pts.join(" ")} fill="none" stroke={C.chalk} strokeWidth={9}
        strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      {/* 横軸 */}
      <line x1={x0 - 30} y1={base} x2={x0 + w + 30} y2={base}
        stroke={C.chalk} strokeWidth={7} strokeLinecap="round" />
      {/* 評定の数字 (軸の下。帯の真ん中) */}
      <g fontFamily={FONT} fontWeight={900} textAnchor="middle" fill={C.chalk}>
        {BAND_EDGE.slice(0, 5).map((a, i) => {
          const b = BAND_EDGE[i + 1];
          const mx = x0 + ((a + b) / 2) * w;
          const on = phase === 2 ? seg(f, 12 + i * 4, 22 + i * 4) : i === 4 ? seg(f, 20, 30) : 0;
          if (on <= 0.01) return null;
          return (
            <g key={i} opacity={on}>
              <text x={mx} y={base + 54} fontSize={i === 4 ? 56 : 46}
                fill={i === 4 ? C.vermil : C.chalk}>{i + 1}</text>
              <text x={mx} y={base + 98} fontSize={30} opacity={0.85}>{BAND_PCT[i]}%</text>
            </g>
          );
        })}
      </g>
      {/* 右端7%の指し示し (phase1 のときだけ強く) */}
      {phase === 1 && (
        <g opacity={seg(f, 24, 34)}>
          <line x1={x0 + 0.965 * w} y1={base - 10} x2={x0 + 0.965 * w} y2={base - 150}
            stroke={C.vermil} strokeWidth={6} strokeLinecap="round" />
          <polygon points={`${x0 + 0.965 * w},${base - 16} ${x0 + 0.965 * w - 15},${base - 52} ${x0 + 0.965 * w + 15},${base - 52}`}
            fill={C.vermil} />
        </g>
      )}
    </g>
  );
};

// ---- 数直線 (目盛り + 旗)。#157 #161 ----
const NumberLine: React.FC<{
  x1: number; x2: number; y: number; from: number; to: number; step: number;
  f: number; mark?: number | null; color?: string; labelSize?: number;
}> = ({ x1, x2, y, from, to, step, f, mark = null, color = KRP.ink, labelSize = 30 }) => {
  const at = (v: number) => x1 + ((v - from) / (to - from)) * (x2 - x1);
  const ticks: number[] = [];
  for (let v = from; v <= to + 0.001; v += step) ticks.push(Math.round(v));
  return (
    <g>
      <line x1={x1 - 40} y1={y} x2={x2 + 40} y2={y} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <polygon points={`${x2 + 56},${y} ${x2 + 26},${y - 15} ${x2 + 26},${y + 15}`} fill={color} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={at(v)} y1={y - 16} x2={at(v)} y2={y + 16} stroke={color} strokeWidth={5} />
          <text x={at(v)} y={y + 52} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={labelSize} fill={color} stroke={KRP.white} strokeWidth={6} paintOrder="stroke">{v}</text>
        </g>
      ))}
      {mark !== null && (
        <g transform={`translate(${at(mark)} ${y - 18 + Math.sin(f / 7) * 3})`}
          opacity={pop(seg(f, 22, 32))}>
          <line x1={0} y1={0} x2={0} y2={-86} stroke={C.vermil} strokeWidth={7} strokeLinecap="round" />
          <path d="M 0 -86 L 78 -68 L 0 -50 Z" fill={C.vermil} stroke={KRP.ink} strokeWidth={4.5} />
          <text x={34} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={30} fill={KRP.white}>{mark}</text>
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------
// #143 第8章、全国民、同じ物差しへ。
// 格: 山 — 昭和の模擬試験の会場。机の列・受験生の大群・黒板・窓の光・監督
// ------------------------------------------------------------------
const ROWS_143 = [
  { y: 612, s: 0.44, n: 5, x0: 182, gap: 188 },
  { y: 716, s: 0.58, n: 4, x0: 188, gap: 246 },
  { y: 848, s: 0.74, n: 3, x0: 218, gap: 322 },
];
const S143: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.07, easeOut(seg(f, 0, 42)));
  return (
    <Frame
      f={f}
      seed={1042}
      over={<ChapterDoor num={8} title="全国民 同じ物差しへ。" t={seg(f, 8, 26)} left={1030} top={648} width={830} />}
    >
      <g transform={zoomAt(z, 880, 700)}>
        <Classroom f={f} floorY={590} winSide="left" />
        {/* 黒板 (会場の案内が書いてある) */}
        <Blackboard x={1152} y={176} w={606} h={262} f={f}>
          <g stroke={C.chalk} strokeWidth={6} opacity={0.82} strokeLinecap="round">
            <line x1={1196} y1={240} x2={1668} y2={240} />
            <line x1={1196} y1={300} x2={1552} y2={300} />
            <line x1={1196} y1={360} x2={1620} y2={360} />
          </g>
          <g fill={C.chalk} opacity={0.5}>
            <circle cx={1700} cy={300} r={9} />
            <circle cx={1700} cy={360} r={9} />
          </g>
        </Blackboard>
        {/* 教室の時計 (壁) */}
        <g transform="translate(1058 108)">
          <circle r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-20} stroke={KRP.ink} strokeWidth={5} />
          <line
            x1={0}
            y1={0}
            x2={Math.cos(f / 9) * 25}
            y2={Math.sin(f / 9) * 25}
            stroke={C.vermil}
            strokeWidth={4}
          />
        </g>
        {/* 受験生 → 机 の順に描くと、机の前板が脚を隠す */}
        {ROWS_143.map((r, ri) =>
          Array.from({ length: r.n }, (_, i) => {
            const x = r.x0 + i * r.gap;
            return (
              <g key={`r${ri}c${i}`}>
                <PersonMini
                  x={x}
                  y={r.y + 20}
                  s={r.s * 0.95}
                  color={i % 2 === 0 ? C.gakuran : C.sailor}
                  f={f}
                  phase={ri * 3 + i}
                  face="dot"
                  arms="down"
                />
                <SchoolDesk x={x} y={r.y} s={r.s} paper f={f} phase={ri * 2 + i} />
              </g>
            );
          })
        )}
        {/* 監督 (前に立って見ている) */}
        <Person
          x={1072}
          y={636}
          s={0.76}
          cloth={C.gakuranDark}
          clothDark="#1A2028"
          glasses
          face="normal"
          pose="armsFolded"
          f={f}
          phase={4}
        />
        {/* 床に落ちる窓の光 */}
        <g fill={C.win} opacity={0.22}>
          <path d="M 96 604 L 352 604 L 470 820 L 150 820 Z" />
          <path d="M 440 604 L 696 604 L 862 820 L 510 820 Z" />
        </g>
      </g>
      <TagPlate x={1432} y={74} text="模擬試験" size={38} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #144 ここまでの順位は、力士や選手や受験生といった、いわば「参加者」のものでした。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const S144: React.FC<{ f: number }> = ({ f }) => {
  const lit = 0.26 + Math.sin(f / 15) * 0.04;
  return (
    <Frame f={f} seed={1043} bg={KRP.cream}>
      {/* 空と遠景の塀・木 */}
      <rect x={-20} y={-20} width={W + 40} height={460} fill={C.win} opacity={0.6} />
      <g>
        <rect x={-20} y={378} width={W + 40} height={66} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.stoneDark} strokeWidth={4} opacity={0.6}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line key={i} x1={i * 224 + 60} y1={378} x2={i * 224 + 60} y2={444} />
          ))}
        </g>
        {[180, 640, 1280, 1760].map((tx, i) => (
          <g key={tx} opacity={0.5}>
            <rect x={tx - 9} y={300} width={18} height={82} fill={C.woodDeskDark} />
            <ellipse cx={tx} cy={286} rx={78 + i * 9} ry={56} fill={KRP.green} opacity={0.72} />
          </g>
        ))}
      </g>
      {/* 土の地面 */}
      <rect x={-20} y={440} width={W + 40} height={H - 420} fill={C.dohyoDark} opacity={0.5} />
      <g fill={C.dohyoDark} opacity={0.42}>
        <ellipse cx={320} cy={520} rx={120} ry={16} />
        <ellipse cx={1600} cy={560} rx={150} ry={18} />
        <ellipse cx={1020} cy={1010} rx={210} ry={22} />
      </g>
      {/* 土俵 (丸い輪) */}
      <ellipse cx={960} cy={712} rx={556} ry={204} fill={C.dohyo} stroke={KRP.ink} strokeWidth={8} />
      <ellipse cx={960} cy={712} rx={496} ry={172} fill="none" stroke={KRP.white} strokeWidth={14} opacity={0.75} />
      <ellipse cx={960} cy={700} rx={470} ry={150} fill={C.lampGlow} opacity={lit} />
      {/* 縁の外にぐるりと座る見物客 (奥の弧) */}
      {Array.from({ length: 17 }, (_, i) => {
        const a = Math.PI + (i / 16) * Math.PI;
        const px = 960 + Math.cos(a) * 760;
        const py = 540 + Math.sin(a) * 92;
        return (
          <PersonMini
            key={i}
            x={px}
            y={py + 54}
            s={0.3}
            color={i % 3 === 0 ? C.gakuran : i % 3 === 1 ? C.stoneDark : C.chairDark}
            f={f}
            phase={i}
            face="none"
            arms="down"
          />
        );
      })}
      {/* 手前の見物客の背中 (切れて奥行きを作る) */}
      {[150, 400, 1540, 1800].map((px, i) => (
        <g key={px} opacity={0.9}>
          <ellipse cx={px} cy={1010 + Math.sin((f + i * 11) / 17) * 3} rx={92} ry={118} fill={C.stoneDark} />
          <circle cx={px} cy={890} r={48} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 土俵の上の3人だけ: 力士・走者・受験生 */}
      <Person x={742} y={742} s={0.92} cloth={C.vermil} clothDark="#94301F" face="normal" pose="armsFolded" f={f} phase={1} />
      <Person x={968} y={768} s={0.9} cloth={KRP.white} clothDark={KRP.gray} face="normal" pose="run" f={f} phase={5} />
      <Person x={1198} y={736} s={0.88} cloth={C.gakuran} clothDark={C.gakuranDark} glasses face="normal" pose="hold" f={f} phase={9} />
      <TagPlate x={960} y={290} text="参加者だけ" size={44} t={seg(f, 6, 18)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #145 それが全員に広がる下ごしらえをしたのは、ベルギーの天文学者です。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const S145: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.06, 1, easeOut(seg(f, 0, 40)));
  return (
    <Frame f={f} seed={1044} dark bg={C.nightDeep}>
      <g transform={zoomAt(z, 1240, 460)}>
        {/* 夜空 */}
        <rect x={-20} y={-20} width={W + 40} height={700} fill={C.night} />
        <rect x={-20} y={-20} width={W + 40} height={260} fill={C.nightDeep} opacity={0.7} />
        <StarField f={f} n={54} y0={30} y1={560} />
        {/* 天の川のかすみ */}
        <path d="M -20 180 q 520 110 980 40 t 980 -70" fill="none" stroke={C.star} strokeWidth={54} opacity={0.07} />
        {/* 街の屋根 (遠景のシルエット) */}
        <g fill={C.nightDeep} stroke={KRP.ink} strokeWidth={5}>
          <path d="M -20 760 L -20 590 L 160 500 L 340 590 L 340 760 Z" />
          <path d="M 320 760 L 320 630 L 470 556 L 620 630 L 620 760 Z" />
          <path d="M 600 760 L 600 600 L 700 600 L 700 530 L 790 530 L 790 760 Z" />
        </g>
        <g fill={C.lamp} opacity={0.72}>
          {[80, 210, 400, 520, 660].map((wx, i) => (
            <rect key={wx} x={wx} y={640 + (i % 2) * 44} width={34} height={44} rx={4} opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 16 + i))} />
          ))}
        </g>
        {/* 石の丘 */}
        <path d="M -20 1100 L -20 800 q 420 -90 980 -60 t 980 -40 L 1940 1100 Z" fill={C.stoneDark} />
        <g stroke={C.stone} strokeWidth={4} opacity={0.4}>
          <path d="M -20 880 q 480 -50 980 -26 t 980 -28" fill="none" />
          <path d="M -20 960 q 460 -40 980 -20 t 980 -24" fill="none" />
        </g>
        {/* 観測塔 + ドーム */}
        <g>
          <rect x={1096} y={520} width={372} height={400} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.stoneDark} strokeWidth={4} opacity={0.65}>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={1096} y1={578 + i * 72} x2={1468} y2={578 + i * 72} />
            ))}
            <line x1={1282} y1={520} x2={1282} y2={920} />
          </g>
          {/* 窓 (学者が覗く) */}
          <rect x={1146} y={610} width={116} height={140} rx={6} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={6} />
          <line x1={1204} y1={610} x2={1204} y2={750} stroke={KRP.ink} strokeWidth={5} />
          <g opacity={0.92}>
            <circle cx={1186} cy={682} r={25} fill={C.woodDeskDark} />
            <path d="M 1154 750 q 32 -46 64 0 Z" fill={C.woodDeskDark} />
          </g>
          {/* ドーム本体 */}
          <path d="M 1066 524 q 216 -258 432 0 Z" fill={C.dome} stroke={KRP.ink} strokeWidth={8} />
          <g stroke={C.domeDark} strokeWidth={5} opacity={0.75} fill="none">
            <path d="M 1130 460 q 152 -116 304 0" />
            <path d="M 1174 408 q 108 -72 216 0" />
          </g>
          {/* 開いたスリット */}
          <path d="M 1248 524 L 1248 370 q 34 -26 68 0 L 1316 524 Z" fill={C.nightDeep} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 望遠鏡 (空を向く) */}
        <Telescope x={1252} y={520} s={0.9} tilt={-54} f={f} />
      </g>
      <TagPlate x={330} y={118} text="ベルギー" size={40} t={seg(f, 8, 20)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #146 1835年、ケトレーは「平均人」という考え方を発表しました。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
// 「平均人」の白い人型 (#146 #147 で使う)。y = 足元
const AverageMan: React.FC<{
  x: number; y: number; s?: number; t?: number; fill?: string; dash?: boolean;
}> = ({ x, y, s = 1, t = 1, fill = KRP.white, dash }) => {
  const tt = clamp01(t);
  if (tt <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - tt) * 60}) scale(${s})`} opacity={tt}>
      <g fill={fill} stroke={KRP.ink} strokeWidth={5} strokeDasharray={dash ? "14 10" : undefined}>
        <circle cx={0} cy={-268} r={46} />
        <path d="M -52 -214 q 52 -22 104 0 L 72 -92 L 46 -92 L 40 -6 L -40 -6 L -46 -92 L -72 -92 Z" />
        <rect x={-36} y={-10} width={28} height={110} rx={10} />
        <rect x={8} y={-10} width={28} height={110} rx={10} />
      </g>
    </g>
  );
};

const S146: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 10, 30));
  return (
    <Frame f={f} seed={1045} dark bg={C.nightDeep}>
      <DeskSurface f={f} wall={C.night} top={300} dark />
      {/* 奥の棚と星図 (世界を置く) */}
      <g opacity={0.8}>
        <rect x={1540} y={46} width={340} height={224} rx={6} fill={C.nightDeep} stroke={KRP.ink} strokeWidth={6} />
        <g fill={C.star} opacity={0.75}>
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={1570 + rnd(i * 3 + 1) * 280} cy={76 + rnd(i * 5 + 2) * 164} r={3 + rnd(i) * 3} />
          ))}
        </g>
        <path d="M 1596 110 L 1684 168 L 1760 118 L 1840 196" fill="none" stroke={C.star} strokeWidth={3} opacity={0.5} />
      </g>
      {/* 卓上ランプ */}
      <g>
        <ellipse cx={240} cy={700} rx={210} ry={150} fill={C.lampGlow} opacity={0.17 + Math.sin(f / 12) * 0.03} />
        <rect x={214} y={430} width={32} height={176} fill={C.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={230} cy={610} rx={82} ry={22} fill={C.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 160 430 L 300 430 L 266 346 L 194 346 Z" fill={C.brass} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={230} cy={428} rx={56} ry={16} fill={C.lamp} opacity={0.9} />
      </g>
      {/* 論文の紙 */}
      <PaperSheet id="s146" x={470} y={338} w={1000} h={472} rot={-1.4}>
        {/* 見出しの罫と本文の線 */}
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.4}>
          <line x1={516} y1={400} x2={898} y2={400} />
        </g>
        <g stroke={KRP.ink} strokeWidth={2.6} opacity={0.26}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={516} y1={440 + i * 26} x2={786} y2={440 + i * 26} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`b${i}`} x1={516} y1={672 + i * 26} x2={1420} y2={672 + i * 26} />
          ))}
        </g>
        {/* 「平均人」が紙から立ち上がる */}
        <ellipse cx={858} cy={760} rx={118} ry={22} fill={KRP.ink} opacity={0.14 * rise} />
        <AverageMan x={858} y={756} s={0.82} t={rise} />
      </PaperSheet>
      <Paperweight x={1352} y={790} rot={-2} s={0.8} />
      <TagPlate x={300} y={196} text="1835年" size={42} t={seg(f, 2, 12)} />
      <TagPlate x={1286} y={468} text="平均人" size={44} t={seg(f, 24, 36)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #147 たくさんの人間を測って平均を出せば、「標準の人間」の姿が描ける、という発想です。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const S147: React.FC<{ f: number }> = ({ f }) => {
  const gather = easeOut(seg(f, 6, 26));
  const form = easeOut(seg(f, 22, 38));
  const base = 724;
  return (
    <Frame f={f} seed={1046} dark bg={C.nightDeep}>
      <DeskSurface f={f} wall={C.night} top={190} dark />
      {/* 測定帳 (綴じた帳面。綴じ目が真ん中) */}
      <PaperSheet id="s147" x={226} y={214} w={1468} h={620} rot={0.8}>
        <g>
          <line x1={960} y1={224} x2={960} y2={824} stroke={KRP.ink} strokeWidth={5} opacity={0.22} />
          <g fill={KRP.ink} opacity={0.3}>
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={960} cy={300 + i * 120} r={7} />
            ))}
          </g>
        </g>
        {/* 見出しの罫 */}
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.35}>
          <line x1={300} y1={300} x2={640} y2={300} />
        </g>
        {/* 身長の点 (縦棒の高さが身長)。測った順に左右に散らばる */}
        <g>
          {Array.from({ length: 23 }, (_, i) => {
            const sx = 318 + i * 58;
            const spread = (rnd(i * 9 + 3) - 0.5) * 2;
            const hh = 96 + spread * 62;
            const pull = gather * (1 - Math.abs(spread) * 0.1);
            const cx = lerp(sx, 960, pull * 0.42);
            const on = clamp01(seg(f, 1 + i * 0.7, 9 + i * 0.7));
            return (
              <g key={i} opacity={on * (1 - form * 0.55)}>
                <line x1={cx} y1={base} x2={cx} y2={base - hh} stroke={C.curve} strokeWidth={6} strokeLinecap="round" />
                <circle cx={cx} cy={base - hh} r={9} fill={C.curve} stroke={KRP.ink} strokeWidth={3} />
              </g>
            );
          })}
        </g>
        {/* 台の線 (測定の床) */}
        <line x1={286} y1={base} x2={1634} y2={base} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={300 + i * 58} y1={base} x2={300 + i * 58} y2={base + 14} />
          ))}
        </g>
        {/* 真ん中へ収束する矢印 */}
        <g opacity={seg(f, 14, 24)}>
          <Arrow x={690} y={790} s={1.05} rot={0} color={C.vermil} />
          <Arrow x={1232} y={790} s={1.05} rot={180} color={C.vermil} />
        </g>
        {/* できあがる1人の輪郭 */}
        <ellipse cx={960} cy={base} rx={104} ry={20} fill={KRP.ink} opacity={0.13 * form} />
        <AverageMan x={960} y={base} s={0.74} t={form} fill={C.washi} dash />
      </PaperSheet>
      {/* ペンと物差し (机の上) */}
      <g transform="translate(300 902) rotate(-9)">
        <rect x={-150} y={-12} width={300} height={24} rx={11} fill={C.woodDeskDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 150 -12 L 206 0 L 150 12 Z" fill={C.brass} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <g transform="translate(1420 912) rotate(5)">
        <rect x={-210} y={-18} width={420} height={36} rx={6} fill={C.ruler} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.72}>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={i} x1={-194 + i * 32} y1={-18} x2={-194 + i * 32} y2={i % 3 === 0 ? 2 : -6} />
          ))}
        </g>
      </g>
      <TagPlate x={1430} y={300} text="標準の人間" size={40} t={seg(f, 28, 38)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #148 星を測るための統計の技術が、人間に向けられた瞬間でした。
// 格: 山 — ★名場面。ドームの中。望遠鏡が星から下りてきて、人の列を捉える
//
// ★作者の修正指示:「右下の人間たちにズームしていくような演出で」
//   直す前は、カメラが画面のまん中を 1.06 倍に寄るだけで、肝心の「人間たち」は
//   右下に豆粒で並んでいるだけだった。= 「人間に向けられた」の着地点が主役になっていない。
//   そこで、残すものと足すものを分けた (全面描き直しはしない)。
//     残した: ドームの骨組み・スリットの星・観測床の真鍮の目盛り円・望遠鏡・観測者
//     足した:
//       ① 右下の人の列へ 1.68 倍まで寄るカメラ (f=10〜42 で寄り切る)
//       ② 筒先から人へ伸びる光の筋。筒の傾きから座標を計算するので、
//          筒が振れると光もいっしょに振れる (星を照らしていた光がそのまま人に落ちる)
//       ③ 人の列のまわりだけ明るく残す沈み (radialGradient)。視線が自然に右下へ落ちる
//       ④ 床の目盛り円を回る真鍮の指針と、通ってきた跡の弧。
//          星の方角 (左奥) から人の方角 (右) へ振れて、最後は手前の人を指す
//       ⑤ 寄った先に顔がある: 手前の2人を Person にして、筒に気づいて見かえす
//   ★スリットを右へ寄せた理由: 開始の傾き -52度 の筒は「右上」を向くのに、
//     スリットが左上 (x648〜862) にあって、筒と覗き穴の向きが合っていなかった。
//     x1004〜1220 に移すと、筒の延長線 (y=400 のとき x≒1114) がちょうどスリットに乗る。
//   ★服の色を学生服 (gakuran) から町の人の外套 (coatA〜E) に変えた。
//     1835年のベルギーに学生服はいない。#149 の町の人と同じ色で揃えた。
// ------------------------------------------------------------------
// カメラの着地点。寄り切ったとき画面に出る絵の範囲が x700〜1843 / y396〜1039 になるよう逆算した。
// zoomAt(z,ax,ay) は (ax,ay) を動かない点にするので、ax = 画面左端にしたい x × z/(z-1)。
const Z_END_148 = 1.68;
const CAM_X_148 = 1729;
const CAM_Y_148 = 978;
// 筒の先に入る町の人の列。奥 (右上・小さい) から手前 (左下・大きい) へ下りてくる。
// 奥の4人は PersonMini の群れ、手前の2人は顔の出る Person (下で別に置く)。
const CROWD_148: { x: number; y: number; s: number; c: string }[] = [
  { x: 1812, y: 882, s: 0.34, c: C.coatC },
  { x: 1748, y: 890, s: 0.38, c: C.coatA },
  { x: 1676, y: 900, s: 0.42, c: C.coatD },
  { x: 1600, y: 912, s: 0.46, c: C.coatE },
];

const S148: React.FC<{ f: number }> = ({ f }) => {
  // ① 筒が星から人へ向きを変える。+12度 = ほぼ水平 (人は同じ床の奥に立っているので下げすぎない)
  const turn = easeOut(seg(f, 4, 28));
  const tilt = lerp(-52, 12, turn);
  // ② 右下の人の列へ寄り切るカメラ。f=42 で止める (検品プレビュー f=45 は「寄った後」になる)
  const z = lerp(1, Z_END_148, easeOut(seg(f, 10, 42)));
  // ③ 光が人に届いてからの明るさと、まわりの沈み
  const beam = clamp01(seg(f, 14, 34));
  const land = easeOut(seg(f, 18, 40));
  // 筒先の実座標。Telescope の筒は先端まで 282 (s=1.02 込み)。
  // 傾きから出すので、筒が振れれば光の筋も同じだけ振れる
  const rad = (tilt * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  const nx = -uy; // 筒に直交する向き。光の筋の「幅」はこちらに取る
  const ny = ux;
  const tipX = 880 + 282 * ux;
  const tipY = 700 + 282 * uy;
  const farX = tipX + 760 * ux;
  const farY = tipY + 760 * uy;
  const beamPts = [
    [tipX + nx * 33, tipY + ny * 33],
    [farX + nx * 150, farY + ny * 150],
    [farX - nx * 150, farY - ny * 150],
    [tipX - nx * 33, tipY - ny * 33],
  ]
    .map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`)
    .join(" ");
  // ④ 床の目盛り円を回る指針。201度 (左奥=星を見ていた方角) から 2度 (右=人) へ
  const dialDeg = lerp(201, 2, turn);
  const dialRad = (dialDeg * Math.PI) / 180;
  const sweep = Array.from({ length: 26 }, (_, i) => {
    const a = ((201 + (dialDeg - 201) * (i / 25)) * Math.PI) / 180;
    // 真鍮の輪 (r404〜436) の内側を回る跡。指針と同じ半径にそろえてある
    return `${(880 + Math.cos(a) * 348).toFixed(1)} ${(856 + Math.sin(a) * 98).toFixed(1)}`;
  }).join(" L ");
  return (
    <Frame f={f} seed={1047} dark bg={C.nightDeep}>
      <defs>
        {/* ③ 人の列のまわりだけ明るく残す沈み。ふちがぼけるので、筆の跡のように硬くならない */}
        <radialGradient id="s148dim" gradientUnits="userSpaceOnUse" cx={1480} cy={880} r={640}>
          <stop offset="0.45" stopColor={C.nightDeep} stopOpacity={0} />
          {/* 0.5 だと左端の観測者が黒い塊になって顔が読めなかったので 0.42 に浅くした */}
          <stop offset="1" stopColor={C.nightDeep} stopOpacity={0.42} />
        </radialGradient>
      </defs>
      <g transform={zoomAt(z, CAM_X_148, CAM_Y_148)}>
        {/* ドームの内側 (骨組みのリブ) */}
        <rect x={-20} y={-20} width={W + 40} height={760} fill={C.domeDark} />
        <path d="M -20 700 q 980 -940 1960 0 Z" fill={C.dome} />
        <g stroke={C.domeDark} strokeWidth={9} opacity={0.72} fill="none">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M ${-20 + i * 330} 700 q ${990 - i * 330} ${-840 + i * 60} ${1960 - i * 330} 0`} />
          ))}
          <path d="M -20 420 q 980 -220 1960 0" />
          <path d="M -20 200 q 980 -150 1960 0" />
        </g>
        {/* ★寄り切ると画面に出るのはドームの「裾」(絵の y396〜700) だけになり、
           上の2本の輪は画面の外へ抜けてしまう。そこで裾の高さに水平の桁を3本通し、
           鋲を打って、寄ったあとも鉄のドームの内側だと分かるようにした (第16条の床) */}
        <g>
          {[470, 545, 620].map((gy) => (
            <g key={gy}>
              <path d={`M -20 ${gy} q 980 -60 1960 0`} fill="none" stroke={C.domeDark}
                strokeWidth={13} opacity={0.5} />
              <path d={`M -20 ${gy - 7} q 980 -60 1960 0`} fill="none" stroke={C.dome}
                strokeWidth={4} opacity={0.5} />
              <g fill={C.domeDark} opacity={0.62}>
                {Array.from({ length: 15 }, (_, i) => {
                  const t = (i + 0.5) / 15;
                  return <circle key={i} cx={-20 + t * 1960} cy={gy - 30 * t * (1 - t) * 4} r={5} />;
                })}
              </g>
            </g>
          ))}
          {/* ドームが観測床に乗る根もとの輪 (ボルト留め) */}
          <rect x={-20} y={666} width={W + 40} height={36} fill={C.domeDark} opacity={0.75} />
          <line x1={-20} y1={666} x2={W + 20} y2={666} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
          <g fill={C.dome} opacity={0.55}>
            {Array.from({ length: 17 }, (_, i) => (
              <circle key={i} cx={40 + i * 118} cy={684} r={7} />
            ))}
          </g>
        </g>
        {/* 開いたスリットと星。筒の延長線に乗るよう右へ寄せた (上の覚え書き参照)。
            寄り切ったあとも画面の左上に残るので、「星は、まだそこにある」が1枚で読める */}
        <path d="M 1004 700 L 1004 -20 L 1220 -20 L 1220 700 Z" fill={C.nightDeep} stroke={KRP.ink} strokeWidth={8} />
        <g clipPath="url(#slit148)">
          <StarField f={f} n={26} y0={-10} y1={660} />
        </g>
        <clipPath id="slit148"><rect x={1010} y={-20} width={204} height={716} /></clipPath>
        {/* 横へ引いてある扉 (これが開いているからスリットがある)。レールと把手まで描く */}
        <g>
          <rect x={1220} y={-20} width={104} height={686} fill={C.dome} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          <g stroke={C.domeDark} strokeWidth={5} opacity={0.6}>
            <line x1={1272} y1={-20} x2={1272} y2={666} />
          </g>
          <g fill={C.domeDark} opacity={0.6}>
            {[60, 190, 320, 450, 580].map((by) => <circle key={by} cx={1324} cy={by} r={6} />)}
          </g>
          <rect x={1196} y={300} width={22} height={112} rx={10} fill={C.brassDark}
            stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* ドームに吊った石油ランプ。寄ったあとの右上の空きを埋める明かり (6点法②世界を置く) */}
        <g>
          <line x1={1424} y1={236} x2={1424} y2={416} stroke={C.woodDeskDark} strokeWidth={6} />
          <ellipse cx={1424} cy={508} rx={118} ry={100} fill={C.lampGlow}
            opacity={0.12 + Math.sin(f / 13) * 0.025} />
          <path d="M 1386 416 L 1462 416 L 1450 450 L 1398 450 Z" fill={C.brassDark}
            stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 1394 450 L 1454 450 L 1462 536 L 1386 536 Z" fill={C.lamp}
            stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
          <rect x={1396} y={536} width={56} height={20} rx={6} fill={C.brassDark}
            stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={1424} y1={466} x2={1424} y2={520} stroke={C.vermil} strokeWidth={6} opacity={0.7} />
        </g>
        {/* 観測床 (板 + 真鍮の目盛り円) */}
        <rect x={-20} y={700} width={W + 40} height={H - 660} fill={C.woodDesk} />
        <g stroke={C.woodDeskDark} strokeWidth={5} opacity={0.5}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={-20} y1={760 + i * 92} x2={W + 20} y2={760 + i * 92} />
          ))}
        </g>
        <ellipse cx={880} cy={856} rx={430} ry={122} fill="none" stroke={C.brass} strokeWidth={10} opacity={0.85} />
        <g stroke={C.brass} strokeWidth={5} opacity={0.72}>
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={880 + Math.cos(a) * 404}
                y1={856 + Math.sin(a) * 114}
                x2={880 + Math.cos(a) * 436}
                y2={856 + Math.sin(a) * 124}
              />
            );
          })}
        </g>
        {/* ④ 目盛り円を回ってきた跡と、いま指している指針。
            人の手前から伸びてきて最後に手前の人を指すので、床づたいに視線が右下へ運ばれる */}
        <path d={`M ${sweep}`} fill="none" stroke={C.lamp} strokeWidth={9} strokeLinecap="round" opacity={0.28 * turn} />
        {/* 指針は真鍮 (#C9A447) だと明るい床に溶けて見えなかったので、
            ランプ色 (#F2CE4C) に上げ、黒い縁を回して床から浮かせた。
            半径も 392→340 に詰めてある。寄り切ると先が手前の人に重なって
            「人を串刺しにする」絵になってしまうので、人の手前で止める */}
        <g opacity={0.95}>
          <line
            x1={880} y1={856}
            x2={880 + Math.cos(dialRad) * 340} y2={856 + Math.sin(dialRad) * 96}
            stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" opacity={0.45}
          />
          <line
            x1={880} y1={856}
            x2={880 + Math.cos(dialRad) * 340} y2={856 + Math.sin(dialRad) * 96}
            stroke={C.lamp} strokeWidth={8} strokeLinecap="round"
          />
          <circle
            cx={880 + Math.cos(dialRad) * 352} cy={856 + Math.sin(dialRad) * 99}
            r={13} fill={C.lamp} stroke={KRP.ink} strokeWidth={4}
          />
          <circle cx={880} cy={856} r={18} fill={C.brassDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ⑤ 筒の先に入る町の人。足元に影を敷いて床に乗せる (第16条: ベタ地に浮かせない) */}
        <g opacity={clamp01(seg(f, 12, 28))}>
          {CROWD_148.map((p) => (
            <g key={p.x}>
              <ellipse cx={p.x} cy={p.y + 2} rx={56 * p.s} ry={13 * p.s} fill={KRP.ink} opacity={0.2} />
              <PersonMini x={p.x} y={p.y} s={p.s} color={p.c} f={f} phase={p.x % 7} face="dot" arms="down" />
            </g>
          ))}
          {/* 2人目 — 筒のほうを気にして眉を寄せる */}
          <ellipse cx={1470} cy={932} rx={46} ry={12} fill={KRP.ink} opacity={0.22} />
          <Person
            x={1470} y={930} s={0.52} cloth={C.coatC} clothDark={C.coatCD}
            face="worried" gaze={[-5, -1]} f={f} phase={5}
          />
          {/* 手前の1人 — 筒がこちらを向いたことに気づいて見かえす (6点法⑥ 人が反応する) */}
          <ellipse cx={1300} cy={958} rx={56} ry={14} fill={KRP.ink} opacity={0.24} />
          <Person
            x={1300} y={956} s={0.6} cloth={C.coatA} clothDark={C.coatAD}
            face="surprised" gaze={[-6, -2]} f={f} phase={2}
          />
        </g>
        {/* 人の足元に落ちる光だまり (星を照らしていた光が、ここに落ちた) */}
        <ellipse cx={1540} cy={912} rx={380} ry={96} fill={C.lampGlow} opacity={0.16 * land} />
        {/* 望遠鏡 (星から人へ、向きを変える) */}
        <Telescope x={880} y={700} s={1.02} tilt={tilt} f={f} />
        {/* 観測者。寄り切っても画面の左端に残る位置へ置き直した。
            上げた手が接眼部に届くので「この人が筒を下ろした」が読める */}
        <Person
          x={770} y={996} s={0.82} cloth={C.coatD} clothDark={C.coatDD}
          glasses face="surprised" gaze={[6, 2]} pose="raise" f={f} phase={3}
        />
        {/* ③ まわりを沈ませる。いちばん最後に敷くので、ドームも観測者も一段落ちる */}
        <rect x={-700} y={-700} width={W + 1400} height={H + 1400} fill="url(#s148dim)" opacity={land} />
        {/* ② 筒先から人へ伸びる光の筋。沈みの上に置いて、端から端まで明るいままにする
            (望遠鏡 → 人 をつなぐ1本の線として、視線をそのまま右下へ運ぶ) */}
        <g opacity={beam}>
          <polygon points={beamPts} fill={C.lampGlow} opacity={0.3} />
          <polygon points={beamPts} fill={C.lamp} opacity={0.12} />
        </g>
      </g>
      <TagPlate x={1534} y={214} text="人に向く" size={44} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #149 平均が生まれると、人は「自分は平均より上か下か」を気にし始めます。
// 格: 山 — 町の広場。1本の線をはさんで、上に立つ人と下に立つ人に分かれる
//
// ★作者の第1回修正:「説明にふさわしいイラストを作り直して、ちゃんと」
//   直す前は「床に引いた白い線のそばに1人が立つ」だけで、
//   ①上と下に分かれる ②自分がどちら側か気にして見くらべる、が画面に無かった。
//   いちど「背くらべの横木」で描いてみたが、人の身長差は1割ほどしかなく
//   どれが上でどれが下か一目で読めなかった (横木が全員の顔を横切るだけになった)。
//   そこで「高さの差」ではなく「どちら側に立っているか」に作り替えた:
//     1. 画面を横切る1本の朱の線を引き、その線がそのまま石のテラスの上面になる
//     2. 線の上に3人 (見おろす)・線の下に3人 (見あげる)。人の大きさは全員同じなので
//        ちがいは「上か下か」だけになり、一目で分かれる
//     3. まん中の1人は階段の途中で止まり、頭がちょうど線の高さにある。
//        上とも下とも言えないので「？」が出る = 気にし始めた瞬間 (6点法⑤⑥)
//     4. 朱の線は左から右へ引かれていく。これが「平均が生まれる」出来事
//   舞台は #145〜#148 (ケトレーの時代) と地続きの町の広場。
//   8章は教室が6枚も続くので、ここは屋外にして単調さを切った。
// ------------------------------------------------------------------
const LINE_TOP_149 = 424; // 朱の線 (= 平均) の上端。線の上に立つ人の足元でもある
const LINE_BOT_149 = 440; // 朱の線の下端
const WALL_BASE_149 = 830; // テラスの石積みの根もと
const GROUND_149 = 846; // 線の下の石畳。ここに立つ人の足元
const PS_149 = 1.2; // 6人とも同じ大きさ。ちがうのは立っている側だけ
// 階段の途中で止まっている人の足元。
// 777 - 294*1.2 = 424 = LINE_TOP_149 なので、この段に立つと頭のてっぺんが
// ちょうど朱の線とそろう。上とも下とも言えない位置 (この絵の事件)
const STAIR_Y_149 = 777;
// 階段の段板。いちばん上はテラスの笠石、いちばん下は石畳につながる
const STAIR_TREADS_149 = [509, 575, 643, 711, STAIR_Y_149];
const STAIR_X0_149 = 614; // 階段の左上のかど
const STAIR_W_149 = 76; // 段板1枚の奥行き
const STAIR_MID_149 = STAIR_X0_149 + 4 * STAIR_W_149 + STAIR_W_149 / 2; // 立ち止まった人の x
type Fig149 = {
  x: number; cloth: string; dark: string;
  face: "normal" | "worried" | "smile"; gx: number; gy: number;
  pose?: "stand" | "raise" | "armsFolded";
};
// 線の上に立つ3人 (下をのぞきこむ)
// x は左上の章扉 (順位のからくり) と頭がぶつからない 400 以降に置く
const UP_149: Fig149[] = [
  { x: 430, cloth: C.coatA, dark: C.coatAD, face: "smile", gx: 4, gy: 9 },
  { x: 700, cloth: C.coatB, dark: C.coatBD, face: "normal", gx: 6, gy: 9, pose: "armsFolded" },
  { x: 1330, cloth: C.coatD, dark: C.coatDD, face: "smile", gx: -5, gy: 9 },
];
// 線の下に立つ3人 (上を見あげる)
const LOW_149: Fig149[] = [
  { x: 352, cloth: C.coatC, dark: C.coatCD, face: "worried", gx: 3, gy: -10 },
  { x: 1180, cloth: C.coatA, dark: C.coatAD, face: "worried", gx: -3, gy: -10, pose: "raise" },
  { x: 1560, cloth: C.coatB, dark: C.coatBD, face: "worried", gx: -6, gy: -9 },
];
// 奥の低い屋根 (テラスの向こう側)。空との間に一段はさんで奥行きを出す
const ROOFS_149: { x: number; w: number; chimney?: boolean }[] = [
  { x: -40, w: 300, chimney: true },
  { x: 290, w: 250 },
  { x: 570, w: 340, chimney: true },
  { x: 940, w: 280 },
  { x: 1250, w: 320, chimney: true },
  { x: 1600, w: 360 },
];

const S149: React.FC<{ f: number }> = ({ f }) => {
  // カメラはゆっくり寄る (6点法④)
  const z = lerp(1, 1.06, easeOut(seg(f, 0, 42)));
  // 朱の線が左から右へ引かれていく = 「平均が生まれる」
  const draw = easeOut(seg(f, 2, 22));
  const flame = 0.8 + Math.abs(Math.sin(f / 6)) * 0.35;
  // 階段の人は、上を見たり下を見たりして落ちつかない
  const look = Math.sin(f / 11) * 9;
  return (
    <Frame f={f} seed={1048} bg={KRP.cream}>
      <g transform={zoomAt(z, 960, 480)}>
        {/* ---- 空 ---- */}
        <rect x={-20} y={-20} width={W + 40} height={LINE_TOP_149 + 20} fill={C.sky} />
        <rect x={-20} y={-20} width={W + 40} height={260} fill={C.skyDeep} opacity={0.5} />
        {[{ cx: 820, cy: 128, r: 78 }, { cx: 1560, cy: 96, r: 58 }].map((c, i) => (
          <g key={i} fill={KRP.white} opacity={0.6} transform={`translate(${Math.sin(f / 57 + i * 2) * 16} 0)`}>
            <ellipse cx={c.cx} cy={c.cy} rx={c.r * 1.5} ry={c.r * 0.58} />
            <ellipse cx={c.cx - c.r * 0.8} cy={c.cy + 14} rx={c.r} ry={c.r * 0.46} />
            <ellipse cx={c.cx + c.r * 0.85} cy={c.cy + 18} rx={c.r * 0.92} ry={c.r * 0.42} />
          </g>
        ))}
        {/* 鳩 (空に動きを足す) */}
        <g stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.5}>
          {[0, 1].map((k) => {
            const bx = 1020 + k * 130 + ((f * 3 + k * 40) % 400);
            const by = 182 + k * 40 + Math.sin(f / 7 + k) * 10;
            const wing = Math.sin(f / 4 + k * 1.6) * 14;
            return <path key={k} d={`M ${bx - 26} ${by + wing} Q ${bx} ${by - 10} ${bx + 26} ${by + wing}`} />;
          })}
        </g>
        {/* ---- 奥の低い屋根 (テラスの向こう) ---- */}
        {ROOFS_149.map((h) => (
          <g key={h.x} opacity={0.6}>
            {h.chimney && (
              <g>
                <rect x={h.x + h.w * 0.66} y={296} width={30} height={64} fill={C.roofDark}
                  stroke={KRP.ink} strokeWidth={5} />
                <g fill={KRP.white} opacity={0.34}>
                  {[0, 1, 2].map((k) => (
                    <ellipse key={k} cx={h.x + h.w * 0.66 + 15 + Math.sin(f / 15 + k) * 8}
                      cy={274 - k * 26 - ((f / 2 + k * 16) % 48)} rx={14 + k * 4} ry={9 + k * 3} />
                  ))}
                </g>
              </g>
            )}
            <path d={`M ${h.x - 16} 392 L ${h.x + h.w / 2} 318 L ${h.x + h.w + 16} 392 Z`}
              fill={C.roof} stroke={KRP.ink} strokeWidth={6} />
            <g stroke={C.roofDark} strokeWidth={3.5} opacity={0.5}>
              {[0, 1, 2].map((k) => (
                <line key={k} x1={h.x + h.w / 2} y1={318} x2={h.x - 16 + ((h.w + 32) * (k + 1)) / 4} y2={392} />
              ))}
            </g>
            <rect x={h.x} y={392} width={h.w} height={40} fill={C.washiEdge}
              stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
        {/* ---- 石畳 (線より下の広場) ---- */}
        <rect x={-20} y={WALL_BASE_149 - 10} width={W + 40} height={H - WALL_BASE_149 + 40} fill={C.stone} />
        <g stroke={C.stoneDark} strokeWidth={4} opacity={0.5}>
          {[856, 906, 972, 1052].map((y, r) => (
            <g key={y}>
              <line x1={-20} y1={y} x2={W + 20} y2={y} />
              {Array.from({ length: 11 - r * 2 }, (_, k) => {
                const step = (W + 40) / (11 - r * 2);
                const vx = -20 + step * k + (r % 2 ? step / 2 : 0);
                return <line key={k} x1={vx} y1={y} x2={vx - (r + 1) * 6} y2={y - 34} />;
              })}
            </g>
          ))}
        </g>
        {/* ---- テラスの石積み (線の下の世界の壁。第16条の床) ---- */}
        <rect x={-20} y={LINE_BOT_149} width={W + 40} height={WALL_BASE_149 - LINE_BOT_149} fill={C.stone} />
        {/* 笠石 */}
        <rect x={-20} y={LINE_BOT_149} width={W + 40} height={36} fill={C.stoneDark}
          opacity={0.55} stroke={KRP.ink} strokeWidth={5} />
        {/* 石の目地 (段ごとに縦目地をずらす) */}
        <g stroke={C.stoneDark} strokeWidth={4} opacity={0.6}>
          {[530, 584, 638, 692, 746, 800].map((y, r) => (
            <g key={y}>
              <line x1={-20} y1={y} x2={W + 20} y2={y} />
              {Array.from({ length: 11 }, (_, k) => (
                <line key={k} x1={-20 + ((W + 40) / 11) * k + (r % 2 ? 88 : 0)} y1={y}
                  x2={-20 + ((W + 40) / 11) * k + (r % 2 ? 88 : 0)} y2={y - 54} />
              ))}
            </g>
          ))}
        </g>
        {/* 石のむら・苔 */}
        <g fill={C.stoneDark} opacity={0.2}>
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse key={i} cx={60 + rnd(i * 7 + 3) * (W - 120)} cy={500 + rnd(i * 11 + 5) * 310}
              rx={24 + rnd(i * 5 + 1) * 30} ry={9 + rnd(i * 13 + 2) * 6} />
          ))}
        </g>
        <g fill={C.coatC} opacity={0.4}>
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} cx={100 + rnd(i * 9 + 2) * (W - 200)} cy={WALL_BASE_149 - 14}
              rx={40 + rnd(i * 3 + 7) * 50} ry={12} />
          ))}
        </g>
        {/* アーチの窪み (壁を単調にしない) */}
        <g>
          <path d={`M 1392 700 L 1392 616 Q 1452 572 1512 616 L 1512 700 Z`}
            fill={C.nightDeep} opacity={0.5} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M 1392 616 Q 1452 572 1512 616`} fill="none" stroke={C.stoneDark} strokeWidth={9} />
        </g>
        {/* 樋 (右端) */}
        <g>
          <rect x={1836} y={LINE_BOT_149 + 36} width={26} height={WALL_BASE_149 - LINE_BOT_149 - 36}
            fill={C.steel} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
          <rect x={1826} y={612} width={46} height={18} rx={5} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ---- 石段 (上と下をつなぐ。ここに「決めかねている人」が立つ) ----
             前は段板の線を引いただけで、壁と同じ灰色の板に見えてしまった。
             1段を「地面まで届く石のかたまり」として描き、それを横にずらして重ねると
             段差がはっきり出る。左はしに上の段が落とす影を入れて厚みを出す */}
        <g>
          {STAIR_TREADS_149.map((t, k) => {
            const tx = STAIR_X0_149 + k * STAIR_W_149;
            return (
              <g key={t}>
                <rect x={tx} y={t} width={STAIR_W_149} height={GROUND_149 - t}
                  fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
                {/* 段板の上面 (日が当たる) */}
                <rect x={tx} y={t} width={STAIR_W_149} height={7} fill={KRP.white} opacity={0.45} />
                {/* 上の段が落とす影 */}
                {k > 0 && (
                  <rect x={tx + 3} y={t + 7} width={13} height={46} fill={C.stoneDark} opacity={0.45} />
                )}
              </g>
            );
          })}
          {/* 段の脇の手すり。斜めの1本があると「階段」と一目で読める */}
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" fill="none">
            <line x1={STAIR_X0_149 - 18} y1={LINE_BOT_149 + 10}
              x2={STAIR_X0_149 + 5 * STAIR_W_149 + 10} y2={GROUND_149 - 118} opacity={0.75} />
            <line x1={STAIR_X0_149 - 18} y1={LINE_BOT_149 + 10} x2={STAIR_X0_149 - 18} y2={LINE_BOT_149 + 96} />
            <line x1={STAIR_X0_149 + 5 * STAIR_W_149 + 10} y1={GROUND_149 - 118}
              x2={STAIR_X0_149 + 5 * STAIR_W_149 + 10} y2={GROUND_149} />
          </g>
        </g>
        {/* ---- ガス灯 (石畳の上。炎がゆらぐ) ---- */}
        <g>
          <rect x={104} y={556} width={28} height={296} fill={C.woodDeskDark} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={118} cy={852} rx={48} ry={14} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 72 552 L 164 552 L 150 470 L 86 470 Z" fill={C.win} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
          <path d="M 86 470 L 150 470 L 118 434 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={118} cy={520} rx={14 * flame} ry={24 * flame} fill={C.lamp} opacity={0.9} />
        </g>
        {/* ---- 線の上に立つ3人。足元は朱の線そのもの ---- */}
        {UP_149.map((p, i) => (
          <g key={p.x}>
            <ellipse cx={p.x} cy={LINE_TOP_149 - 3} rx={92 * PS_149} ry={14} fill={C.stoneDark} opacity={0.3} />
            <Person x={p.x} y={LINE_TOP_149} s={PS_149} cloth={p.cloth} clothDark={p.dark}
              face={p.face} gaze={[p.gx, p.gy]} pose={p.pose ?? "stand"} f={f} phase={i * 3} />
          </g>
        ))}
        {/* ---- 線の下に立つ3人。見あげている ---- */}
        {LOW_149.map((p, i) => (
          <g key={p.x}>
            <ellipse cx={p.x} cy={GROUND_149 - 3} rx={92 * PS_149} ry={16} fill={C.stoneDark} opacity={0.34} />
            <Person x={p.x} y={GROUND_149} s={PS_149} cloth={p.cloth} clothDark={p.dark}
              face={p.face} gaze={[p.gx, p.gy]} pose={p.pose ?? "stand"} f={f} phase={i * 4 + 2} />
          </g>
        ))}
        {/* ---- ★階段の途中で止まった1人。頭のてっぺんがちょうど線の高さ ---- */}
        <g>
          <ellipse cx={STAIR_MID_149} cy={STAIR_Y_149 - 3} rx={86 * PS_149} ry={13}
            fill={C.stoneDark} opacity={0.3} />
          <Person x={STAIR_MID_149} y={STAIR_Y_149} s={PS_149} cloth={C.coatE} clothDark={C.coatED}
            face="worried" gaze={[2, look]} f={f} phase={6} />
        </g>
        {/* ---- ★朱の線 = 平均。左から右へ引かれていく ---- */}
        <g>
          <rect x={-20} y={LINE_TOP_149} width={(W + 40) * draw} height={LINE_BOT_149 - LINE_TOP_149}
            fill={C.vermil} />
          <rect x={-20} y={LINE_TOP_149} width={(W + 40) * draw} height={5} fill={KRP.white} opacity={0.5} />
          {/* 引かれていく先っぽの白墨の粉 */}
          {draw < 1 && (
            <g fill={C.vermil} opacity={0.5}>
              {[0, 1, 2].map((k) => (
                <circle key={k} cx={-20 + (W + 40) * draw + rnd(k * 5 + 1) * 30}
                  cy={LINE_TOP_149 + 8 + (rnd(k * 7 + 3) - 0.5) * 36} r={4 + rnd(k * 3 + 2) * 5} />
              ))}
            </g>
          )}
        </g>
        {/* 上とも下とも言えない人の「？」 */}
        <QMark x={STAIR_MID_149} y={212} s={0.9} f={f} t={seg(f, 24, 36)} color={C.vermil} />
      </g>
      <TagPlate x={1660} y={352} text="みんなの まん中" size={34} t={seg(f, 8, 20)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #150 この物差しは、やがて日本の通知表にも組み込まれました。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const S150: React.FC<{ f: number }> = ({ f }) => {
  const hand = easeOut(seg(f, 8, 30));
  const px = lerp(1078, 912, hand);
  const py = lerp(704, 736, hand);
  return (
    <Frame f={f} seed={1049} bg={KRP.cream}>
      <Classroom f={f} floorY={640} winSide="left" />
      <Blackboard x={1150} y={168} w={610} h={268} f={f}>
        <g stroke={C.chalk} strokeWidth={6} opacity={0.72} strokeLinecap="round">
          <line x1={1194} y1={238} x2={1500} y2={238} />
          <line x1={1194} y1={300} x2={1620} y2={300} />
        </g>
      </Blackboard>
      {/* 札入れ (壁の掛け札) */}
      <g transform="translate(1066 196)">
        <rect x={-54} y={-46} width={108} height={176} rx={6} fill={C.wainscot} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-40} y={-30 + i * 40} width={80} height={28} rx={3} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      {/* 教卓 */}
      <g>
        <rect x={1138} y={702} width={420} height={210} rx={8} fill={C.woodDesk} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1120} y={672} width={456} height={44} rx={8} fill={C.desk} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.woodDeskDark} strokeWidth={4} opacity={0.5}>
          <line x1={1348} y1={716} x2={1348} y2={912} />
          <line x1={1156} y1={790} x2={1340} y2={790} />
        </g>
        <circle cx={1248} cy={800} r={11} fill={C.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 先生 */}
      <Person x={1356} y={668} s={0.92} cloth="#4A4038" clothDark="#332C25" glasses face="smile" pose="point" pointDir={-1} f={f} phase={6} />
      {/* 通知表 (渡される二つ折りの紙) */}
      <g transform={`translate(${px} ${py}) rotate(${-6 + hand * 4})`}>
        <rect x={-74} y={-50} width={148} height={100} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <line x1={0} y1={-50} x2={0} y2={50} stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
          <line x1={-58} y1={-24} x2={-14} y2={-24} />
          <line x1={-58} y1={-2} x2={-14} y2={-2} />
          <line x1={16} y1={-24} x2={58} y2={-24} />
        </g>
      </g>
      {/* 生徒 (受け取って覗き込む) */}
      <Person x={822} y={904} s={1.06} cloth={C.sailor} clothDark="#2B3547" face="normal" pose="hold" f={f} phase={1} />
      <TagPlate x={560} y={512} text="通知表" size={44} t={seg(f, 20, 32)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #151 かつての通知表は、「クラスの中で上から何%か」で決まっていたのです。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const BAND_Y_151 = BAND_EDGE.map((t) => 252 + t * 556);
const S151: React.FC<{ f: number }> = ({ f }) => {
  const glow = 0.55 + Math.abs(Math.sin(f / 10)) * 0.45;
  return (
    <Frame f={f} seed={1050} bg={KRP.cream}>
      <DeskSurface f={f} wall={C.wall} top={236} />
      {/* 奥の壁の掲示 (世界を置く) */}
      <g opacity={0.55}>
        <rect x={82} y={44} width={300} height={150} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.45}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={112} y1={82 + i * 30} x2={352} y2={82 + i * 30} />
          ))}
        </g>
      </g>
      {/* 開いた通知表 (方眼はこの紙の中だけ) */}
      <PaperSheet id="s151" x={176} y={252} w={1072} h={556} rot={-1.2} grid>
        {/* 二つ折りの折り目 */}
        <line x1={712} y1={262} x2={712} y2={798} stroke={KRP.ink} strokeWidth={5} opacity={0.3} />
        {/* 教科の行と評定の枡 */}
        <g>
          {[0, 1, 2, 3, 4].map((i) => {
            const ry = 352 + i * 88;
            return (
              <g key={i}>
                <line x1={224} y1={ry + 30} x2={1198} y2={ry + 30} stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
                <g stroke={KRP.ink} strokeWidth={4} opacity={0.6} fill="none">
                  {[0, 1, 2].map((k) => (
                    <rect key={k} x={262 + k * 108} y={ry - 24} width={72} height={52} rx={4} />
                  ))}
                </g>
                <g stroke={KRP.ink} strokeWidth={4} opacity={0.34}>
                  <line x1={620} y1={ry} x2={700} y2={ry} />
                </g>
                {/* 評定の数字 (1つだけ入っている) */}
                <text
                  x={298 + ((i * 2) % 3) * 108}
                  y={ry + 18}
                  textAnchor="middle"
                  fontFamily={FONT}
                  fontWeight={900}
                  fontSize={42}
                  fill={i === 0 ? C.vermil : KRP.ink}
                >
                  {[5, 3, 4, 3, 2][i]}
                </text>
              </g>
            );
          })}
        </g>
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.42}>
          <line x1={224} y1={318} x2={1198} y2={318} />
        </g>
      </PaperSheet>
      {/* 「上から何%か」の縦の帯定規 (紙に重なる) */}
      <g>
        <rect x={1314} y={246} width={176} height={568} rx={8} fill={C.ruler} stroke={KRP.ink} strokeWidth={7} opacity={0.96} />
        {BAND_EDGE.slice(0, 5).map((t, i) => {
          const y0 = BAND_Y_151[i];
          const y1 = BAND_Y_151[i + 1];
          const grade = 5 - i;
          return (
            <g key={i}>
              <rect
                x={1320}
                y={y0}
                width={164}
                height={y1 - y0}
                fill={grade === 5 ? C.vermil : grade === 1 ? C.curve : C.washi}
                opacity={grade === 5 || grade === 1 ? 0.5 : 0.3}
              />
              <line x1={1320} y1={y1} x2={1484} y2={y1} stroke={KRP.ink} strokeWidth={4.5} opacity={0.7} />
              <text
                x={1372}
                y={(y0 + y1) / 2 + (i === 0 || i === 4 ? 12 : 14)}
                textAnchor="middle"
                fontFamily={FONT}
                fontWeight={900}
                fontSize={i === 0 || i === 4 ? 32 : 40}
                fill={KRP.ink}
              >
                {grade}
              </text>
              <text
                x={1560}
                y={(y0 + y1) / 2 + 12}
                textAnchor="start"
                fontFamily={FONT}
                fontWeight={800}
                fontSize={i === 0 || i === 4 ? 28 : 34}
                fill={KRP.ink}
                stroke={KRP.white}
                strokeWidth={6}
                paintOrder="stroke"
              >
                {`${BAND_PCT[4 - i]}%`}
              </text>
            </g>
          );
        })}
        {/* 目盛りが光る */}
        <g stroke={C.lamp} strokeWidth={6} opacity={glow}>
          {Array.from({ length: 15 }, (_, i) => (
            <line key={i} x1={1484} y1={262 + i * 38} x2={1512} y2={262 + i * 38} />
          ))}
        </g>
      </g>
      {/* 鉛筆 */}
      <g transform="translate(830 906) rotate(-7)">
        <rect x={-170} y={-11} width={320} height={22} rx={6} fill={C.lamp} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 150 -11 L 196 0 L 150 11 Z" fill={C.washi} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={192} cy={0} r={4} fill={KRP.ink} />
      </g>
      <TagPlate x={1520} y={176} text="上から何%か" size={36} t={seg(f, 4, 16)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #152 5がもらえるのは、クラスの約7%だけ。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
// 黒板の釣鐘 (#152 phase1 = 右端7%だけ / #153 phase2 = 5区画ぜんぶ)。絵は複製しない
const CurveBoard: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => (
  <>
    <Classroom f={f} floorY={790} winSide="none" />
    {/* 壁の時計と掲示 (世界を置く) */}
    <g transform="translate(1792 112)">
      <circle r={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <line x1={0} y1={0} x2={0} y2={-22} stroke={KRP.ink} strokeWidth={5} />
      <line x1={0} y1={0} x2={Math.cos(f / 10) * 26} y2={Math.sin(f / 10) * 26} stroke={C.vermil} strokeWidth={4} />
    </g>
    <g opacity={0.6}>
      <rect x={1700} y={248} width={172} height={226} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.42}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={1726} y1={288 + i * 38} x2={1846} y2={288 + i * 38} />
        ))}
      </g>
    </g>
    {/* 黒板 */}
    <Blackboard x={270} y={160} w={1380} h={470} f={f}>
      <BellCurve f={f} phase={phase} cx={960} base={520} w={1020} h={300} />
      {/* 板の左上の走り書き (世界の密度) */}
      <g stroke={C.chalk} strokeWidth={5} opacity={0.3} strokeLinecap="round">
        <line x1={318} y1={212} x2={470} y2={212} />
        <line x1={318} y1={248} x2={420} y2={248} />
      </g>
    </Blackboard>
    {/* 先生 (板の左で指す) */}
    <Person
      x={186}
      y={944}
      s={1.0}
      cloth="#4A4038"
      clothDark="#332C25"
      glasses
      face="normal"
      pose="point"
      pointDir={1}
      f={f}
      phase={2}
    />
    {/* 生徒の後頭部 (奥行き) */}
    {[560, 900, 1250, 1580].map((sx, i) => (
      <PersonMini
        key={sx}
        x={sx}
        y={1020 + (i % 2) * 18}
        s={0.86}
        color={i % 2 === 0 ? C.gakuran : C.sailor}
        f={f}
        phase={i * 3}
        face="none"
        arms="down"
      />
    ))}
  </>
);

const S152: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1051} bg={KRP.cream}>
    <CurveBoard f={f} phase={1} />
    <TagPlate x={960} y={86} text="5は約7%" size={44} t={seg(f, 6, 18)} color={C.vermil} />
  </Frame>
);

// ------------------------------------------------------------------
// #153 1も約7%、2と4は約24%、真ん中の3は約38%という割り当てです。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const S153: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1052} bg={KRP.cream}>
    <CurveBoard f={f} phase={2} />
    <TagPlate x={960} y={86} text="5段階の割り当て" size={42} t={seg(f, 4, 16)} />
  </Frame>
);

// ------------------------------------------------------------------
// #154 誰かが5を取れば、誰かは5を取れない。そういう仕組みでした。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
// 椅子の背と後脚 (人より先に描く)
const ChairBack: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <g stroke={C.chairDark} strokeWidth={14} strokeLinecap="round">
      <line x1={-62} y1={-92} x2={-56} y2={0} />
      <line x1={62} y1={-92} x2={56} y2={0} />
    </g>
    <rect x={-66} y={-238} width={132} height={150} rx={10} fill={C.chair} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-50} y={-222} width={100} height={48} rx={6} fill={C.chairDark} opacity={0.5} />
  </g>
);
// 椅子の座面と前脚 (人のあとに描く = 脚を隠して「座っている」に見せる)
const ChairFront: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-86} y={-104} width={172} height={30} rx={9} fill={C.chair} stroke={KRP.ink} strokeWidth={6} />
    <g stroke={C.chairDark} strokeWidth={15} strokeLinecap="round">
      <line x1={-74} y1={-78} x2={-84} y2={10} />
      <line x1={74} y1={-78} x2={84} y2={10} />
    </g>
  </g>
);

const S154: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeOut(seg(f, 10, 32));
  const px = lerp(1298, 1672, pull);
  const prot = lerp(0, 16, pull);
  return (
    <Frame f={f} seed={1053} bg={KRP.cream}>
      <Classroom f={f} floorY={620} winSide="left" />
      {/* 奥の机の列 (世界) */}
      <SchoolDesk x={1452} y={672} s={0.5} paper f={f} phase={2} />
      <SchoolDesk x={1716} y={700} s={0.58} f={f} phase={4} />
      {/* 座れた2人 */}
      {[{ cx: 686, ph: 1 }, { cx: 1000, ph: 5 }].map(({ cx, ph }) => (
        <g key={cx}>
          <ellipse cx={cx} cy={884} rx={96} ry={18} fill={KRP.ink} opacity={0.13} />
          <ChairBack x={cx} y={884} s={1.02} />
          <Person
            x={cx}
            y={858}
            s={0.9}
            cloth={ph === 1 ? C.gakuran : C.sailor}
            clothDark={C.gakuranDark}
            face="normal"
            pose="stand"
            f={f}
            phase={ph}
          />
          <ChairFront x={cx} y={884} s={1.02} />
        </g>
      ))}
      {/* 引き抜かれていく椅子 */}
      <g transform={`translate(${px - 1298} ${0}) rotate(${prot} 1298 884)`} opacity={1 - pull * 0.25}>
        <ChairBack x={1298} y={884} s={1.0} />
        <ChairFront x={1298} y={884} s={1.0} />
      </g>
      {/* 引き抜きの線 */}
      <g opacity={pull * 0.7} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
        <line x1={1230} y1={830} x2={1130} y2={822} />
        <line x1={1234} y1={876} x2={1120} y2={874} />
      </g>
      {/* 座れずに立ち尽くす生徒たち (困り顔まで。泣かせない・茶化さない) */}
      <Person x={1318} y={1000} s={1.04} cloth={C.sailor} clothDark="#2B3547" face="worried" pose="stand" f={f} phase={3} />
      <Person x={318} y={986} s={1.0} cloth={C.gakuran} clothDark={C.gakuranDark} face="worried" pose="armsFolded" f={f} phase={7} />
      <Person x={1832} y={956} s={0.86} cloth="#5A5248" clothDark="#403A32" face="normal" pose="stand" f={f} phase={9} />
      {/* 「5」の札 (椅子の上に) */}
      <TagPlate x={686} y={690} text="5" size={40} t={seg(f, 4, 14)} color={C.vermil} />
      <TagPlate x={1000} y={690} text="5" size={40} t={seg(f, 8, 18)} color={C.vermil} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #155 そして1957年、決定打が登場します。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
// 答案の山 (#155 #156 #157 で使う)
const PaperStack: React.FC<{ x: number; y: number; n?: number; w?: number; f?: number; tint?: string }> = ({
  x, y, n = 9, w = 170, f = 0, tint = C.washi,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <rect
        key={i}
        x={x - w / 2 + (rnd(i * 5 + 1) - 0.5) * 16}
        y={y - i * 11}
        width={w}
        height={16}
        rx={3}
        fill={tint}
        stroke={KRP.ink}
        strokeWidth={4}
        transform={`rotate(${(rnd(i * 3 + 2) - 0.5) * 3} ${x} ${y - i * 11})`}
        opacity={0.96}
      />
    ))}
    <rect
      x={x - w / 2}
      y={y - n * 11 - 14}
      width={w}
      height={18}
      rx={3}
      fill={tint}
      stroke={KRP.ink}
      strokeWidth={4}
      transform={`rotate(${-3 + Math.sin(f / 16) * 1.4} ${x} ${y - n * 11})`}
    />
  </g>
);

const S155: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 17) * 7;
  const glow = 0.3 + Math.abs(Math.sin(f / 14)) * 0.1;
  return (
    <Frame f={f} seed={1054} dark bg={C.nightDeep}>
      {/* 夜の職員室 */}
      <rect x={-20} y={-20} width={W + 40} height={740} fill={C.wall} opacity={0.5} />
      <rect x={-20} y={-20} width={W + 40} height={740} fill={C.nightDeep} opacity={0.45} />
      <rect x={-20} y={700} width={W + 40} height={H - 660} fill={C.floorDark} opacity={0.75} />
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.2}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-20} y1={760 + i * 92} x2={W + 20} y2={760 + i * 92} />
        ))}
      </g>
      {/* 夜の窓 */}
      <g>
        <rect x={1460} y={128} width={372} height={300} rx={6} fill={C.night} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1646} y1={128} x2={1646} y2={428} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1460} y1={278} x2={1832} y2={278} stroke={KRP.ink} strokeWidth={5} />
        <g fill={C.star} opacity={0.6}>
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={1484 + rnd(i * 7 + 3) * 324} cy={150 + rnd(i * 11 + 1) * 258} r={3} />
          ))}
        </g>
      </g>
      {/* 壁の棚 (書類と紐) */}
      <g opacity={0.65}>
        <rect x={120} y={140} width={420} height={230} rx={5} fill={C.shelf} stroke={KRP.ink} strokeWidth={7} />
        <line x1={120} y1={256} x2={540} y2={256} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={142 + i * 66} y={166 + (i % 2) * 6} width={54} height={84} rx={3} fill={C.washi} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={`b${i}`} x={150 + i * 78} y={278 + (i % 2) * 8} width={62} height={76} rx={3} fill={C.wainscot} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      {/* ひとつだけ灯った電灯 */}
      <g transform={`translate(${896 + sway} 0)`}>
        <line x1={0} y1={-20} x2={0} y2={210} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -82 288 L 82 288 L 52 210 L -52 210 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={0} cy={292} rx={46} ry={20} fill={C.lamp} />
        <path d="M -78 296 L 78 296 L 470 1080 L -470 1080 Z" fill={C.lampGlow} opacity={glow} />
      </g>
      {/* 机 (2つ) と答案の山 */}
      <g>
        <rect x={580} y={690} width={700} height={44} rx={8} fill={C.desk} stroke={KRP.ink} strokeWidth={7} />
        <rect x={604} y={730} width={652} height={180} rx={6} fill={C.woodDesk} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.woodDeskDark} strokeWidth={4} opacity={0.6}>
          <line x1={930} y1={734} x2={930} y2={910} />
          <line x1={620} y1={812} x2={920} y2={812} />
        </g>
        <circle cx={846} cy={822} r={10} fill={C.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <PaperStack x={700} y={686} n={11} w={178} f={f} />
      <PaperStack x={1168} y={686} n={7} w={160} f={f} tint={C.washiEdge} />
      {/* 奥の机 (影のなか) */}
      <g opacity={0.4}>
        <rect x={1424} y={644} width={420} height={36} rx={7} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1446} y={676} width={376} height={130} rx={5} fill={C.woodDesk} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 誰かの影が机に向かう */}
      <g opacity={0.72}>
        <Person x={420} y={1000} s={1.08} cloth="#2A2A26" clothDark="#1C1C19" face="normal" pose="stand" f={f} phase={5} />
      </g>
      <TagPlate x={330} y={462} text="1957年" size={42} t={seg(f, 4, 16)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #156 偏差値。東京の中学校の先生、桑田昭三さんが進路指導のために考え出したとされています。
// 格: 山 — ★「偏差値が生まれた瞬間」。#155 の夜の職員室とひと続きの世界だが、
//      カメラをぐっと寄せて「影」だった人を主役にする (6点法①③④)。
//      事件 = 手帳に「偏差値」の3文字が書かれ 朱でまるが付く。人の反応 = 先生が見入る。
//      #157 と役割を分けるため、ここは「人と夜の部屋」。図解はいっさい描かない。
// ------------------------------------------------------------------
// 机の手前の板の上端。先生の脚と胴の下はここに隠れる (中腰で机に向かう形)
const DESK_LIP_156 = 744;
// 手帳の位置。先生の hold の手元 (足元 y-148×s) に合わせてある
const NB_CX_156 = 1430;
const NB_CY_156 = 700;

const S156: React.FC<{ f: number }> = ({ f }) => {
  // カメラは手帳めがけてゆっくり寄る (#155 の引きの絵との落差を作る)
  const z = lerp(1, 1.08, easeOut(seg(f, 0, 40)));
  const spark = seg(f, 22, 36);     // ひらめきの線
  const circle = pop(seg(f, 26, 38)); // 朱のまる (書いたあとに囲む)
  const sway = Math.sin(f / 17) * 6;  // 裸電球のゆれ
  const glow = 0.26 + Math.abs(Math.sin(f / 15)) * 0.1;
  return (
    <Frame f={f} seed={1055} dark bg={C.nightDeep}>
      <g transform={zoomAt(z, NB_CX_156, 640)}>
        {/* ---- 夜の職員室の壁 (漆喰 + 腰板)。夜なので暗く沈ませる ---- */}
        <rect x={-20} y={-20} width={W + 40} height={DESK_LIP_156 + 20} fill={C.wall} opacity={0.5} />
        <rect x={-20} y={-20} width={W + 40} height={DESK_LIP_156 + 20} fill={C.nightDeep} opacity={0.4} />
        <rect x={-20} y={648} width={W + 40} height={DESK_LIP_156 - 628} fill={C.wainscot}
          opacity={0.5} stroke={KRP.ink} strokeWidth={5} />
        {/* ---- 夜の窓 (外は暗い。ここが夜だと分かる唯一の抜け) ---- */}
        <g>
          <rect x={118} y={132} width={322} height={292} rx={6} fill={C.night} stroke={KRP.ink} strokeWidth={7} />
          <line x1={279} y1={132} x2={279} y2={424} stroke={KRP.ink} strokeWidth={5} />
          <line x1={118} y1={278} x2={440} y2={278} stroke={KRP.ink} strokeWidth={5} />
          <g fill={C.star} opacity={0.5}>
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={142 + rnd(i * 9 + 4) * 276} cy={154 + rnd(i * 13 + 2) * 250} r={3} />
            ))}
          </g>
        </g>
        {/* ---- 壁の進路の掲示 (紙だけ。校名などの文字は入れない) ---- */}
        <g opacity={0.78}>
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${636 + i * 242} ${250 + (i % 2) * 26}) rotate(${-2 + i * 4})`}>
              <rect x={-90} y={-120} width={180} height={238} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
              <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.4}>
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <line key={k} x1={-66} y1={-82 + k * 36} x2={66} y2={-82 + k * 36} />
                ))}
              </g>
              <circle cx={0} cy={-120} r={9} fill={C.vermil} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          ))}
        </g>
        {/* ---- 日めくり暦 (札「昭和32年」の受け皿。時代をここで示す) ---- */}
        <g transform="translate(1690 378) rotate(2)">
          <rect x={-74} y={-72} width={148} height={150} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-74} y={-72} width={148} height={40} rx={6} fill={C.vermil} stroke={KRP.ink} strokeWidth={5} />
          {/* めくった紙の重なり */}
          <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.45}>
            <line x1={-74} y1={66} x2={74} y2={66} />
            <line x1={-70} y1={74} x2={70} y2={74} />
          </g>
          {/* 下端のめくれ */}
          <path d="M 40 78 q 22 -14 30 -34 l 4 34 Z" fill={C.washiEdge} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ---- 裸電球ひとつ。ここだけが光源なので手帳に光が落ちる ---- */}
        <g transform={`translate(${1148 + sway} 0)`}>
          <line x1={0} y1={-20} x2={0} y2={158} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -70 232 L 70 232 L 44 158 L -44 158 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={0} cy={240} rx={38} ry={18} fill={C.lamp} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -66 244 L 66 244 L 392 760 L -392 760 Z" fill={C.lampGlow} opacity={glow} />
        </g>
        {/* ---- ひらめきの線。頭ではなく「手帳の紙」から出す (思いつきが紙に降りた) ---- */}
        <g opacity={spark} stroke={C.lamp} strokeWidth={9} strokeLinecap="round">
          {[-88, -58, -28, 2].map((a, i) => {
            const rad = (a * Math.PI) / 180;
            const r0 = 128 + i * 5;
            const r1 = 200 + (i % 2) * 22;
            return (
              <line
                key={a}
                x1={1544 + Math.cos(rad) * r0}
                y1={660 + Math.sin(rad) * r0}
                x2={1544 + Math.cos(rad) * r1}
                y2={660 + Math.sin(rad) * r1}
              />
            );
          })}
        </g>
        {/* ---- 先生 (桑田昭三さん。顔は普通の先生。茶化さない) ---- */}
        <Person
          x={NB_CX_156}
          y={820}
          s={1.32}
          cloth="#4A4038"
          clothDark="#332C25"
          glasses
          face="normal"
          gaze={[2, 7]}
          lean={2}
          pose="hold"
          f={f}
          phase={3}
        />
        {/* ---- 手帳 (両手で持ち上げている)。★ここが「偏差値の誕生」 ---- */}
        <g transform={`rotate(-4 ${NB_CX_156} ${NB_CY_156})`}>
          <rect x={NB_CX_156 - 220} y={NB_CY_156 - 100} width={440} height={200} rx={8}
            fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
          {/* とじ目 */}
          <line x1={NB_CX_156} y1={NB_CY_156 - 100} x2={NB_CX_156} y2={NB_CY_156 + 100}
            stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          {/* 左の頁 = 生徒の点数のひかえ (罫と点の列) */}
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.38}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={NB_CX_156 - 198} y1={NB_CY_156 - 62 + i * 34} x2={NB_CX_156 - 26}
                y2={NB_CY_156 - 62 + i * 34} />
            ))}
            <line x1={NB_CX_156 - 110} y1={NB_CY_156 - 86} x2={NB_CX_156 - 110} y2={NB_CY_156 + 72} />
          </g>
          <g fill={C.curve} opacity={0.6}>
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={NB_CX_156 - 70 + (i % 2) * 26} cy={NB_CY_156 - 70 + i * 34} r={6} />
            ))}
          </g>
          {/* 右の頁 = 書かれたばかりの3文字 */}
          <text x={NB_CX_156 + 114} y={NB_CY_156 + 18} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={50} fill={C.ink}>
            偏差値
          </text>
          {/* 朱のまる (書いたあとに自分で囲む) */}
          <ellipse cx={NB_CX_156 + 114} cy={NB_CY_156 - 2} rx={104 * circle} ry={46 * circle}
            fill="none" stroke={C.vermil} strokeWidth={8} opacity={circle} />
        </g>
        {/* ---- 机 (手前の板で下半身を隠す) ---- */}
        <rect x={-20} y={DESK_LIP_156} width={W + 40} height={46} rx={10}
          fill={C.desk} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-20} y={DESK_LIP_156 + 46} width={W + 40} height={H - DESK_LIP_156} fill={C.woodDesk} />
        <g stroke={C.woodDeskDark} strokeWidth={5} opacity={0.42} fill="none">
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M -20 ${850 + i * 92} q 500 ${-12 + i * 5} 980 0 t 980 -8`} />
          ))}
        </g>
        {/* ---- 机の上の仕事道具 (手計算の跡) ---- */}
        <PaperStack x={820} y={826} n={9} w={192} f={f} />
        <PaperStack x={1082} y={830} n={4} w={168} f={f} tint={C.washiEdge} />
        {/* 名簿 (ひとりずつ名前が並ぶ帳面) */}
        <g transform="translate(560 806) rotate(-5)">
          <rect x={-128} y={-48} width={256} height={96} rx={5} fill={C.washiEdge} stroke={KRP.ink} strokeWidth={6} />
          <line x1={-128} y1={-18} x2={128} y2={-18} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
            {[0, 1].map((i) => (
              <line key={i} x1={-106} y1={4 + i * 24} x2={104} y2={4 + i * 24} />
            ))}
            <line x1={-44} y1={-48} x2={-44} y2={48} />
            <line x1={36} y1={-48} x2={36} y2={48} />
          </g>
        </g>
        {/* 算盤 (計算は手でやるしかなかった) */}
        <g transform="translate(1690 812) rotate(-3) scale(0.62)">
          <rect x={-168} y={-72} width={336} height={144} rx={8} fill={C.wainscot} stroke={KRP.ink} strokeWidth={9} />
          <line x1={-168} y1={-26} x2={168} y2={-26} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.woodDeskDark} strokeWidth={6} opacity={0.6}>
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1={-148 + i * 37} y1={-68} x2={-148 + i * 37} y2={68} />
            ))}
          </g>
          <g fill={C.woodDeskDark} stroke={KRP.ink} strokeWidth={5}>
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={-148 + i * 37} cy={-48 + (i % 3) * 4} rx={15} ry={9} />
            ))}
          </g>
        </g>
        {/* 墨壺と筆 (まるを書いた道具) */}
        <g transform="translate(1290 812) rotate(6)">
          <ellipse cx={0} cy={0} rx={38} ry={16} fill={C.nightDeep} stroke={KRP.ink} strokeWidth={5} />
          <line x1={16} y1={-6} x2={132} y2={-74} stroke={C.woodDeskDark} strokeWidth={10} strokeLinecap="round" />
          <line x1={10} y1={-2} x2={30} y2={-14} stroke={C.vermil} strokeWidth={11} strokeLinecap="round" />
        </g>
        {/* ---- 手前の椅子 = 生徒が座る席。進路指導の面談の形にする ---- */}
        <ChairBack x={380} y={980} s={1.2} rot={2} />
      </g>
      <TagPlate x={1660} y={250} text="昭和32年" size={38} t={seg(f, 4, 16)} />
      <TagPlate x={380} y={760} text="生徒の席" size={34} t={seg(f, 18, 30)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #157 テストの点数を、受験生全体の中での「位置」に変換する数字です。
// 格: 図 — ★「仕組み」の1枚。#156 が「人と夜の部屋」なので、ここは真上から見た図にして
//      画も色も完全に分ける (職員室の茶色 → 机のラシャの深緑 + ガリ版刷りの青い紙)。
//      歯車の機械はやめた。点数が分布のどこに刺さるかを見せないと「位置」が伝わらないため。
//      第16条: 図は机のラシャ・木の縁・筆・定規の上に置き、素の地色で終わらせない。
// ------------------------------------------------------------------
// 点数の軸 (0〜100点)。紙のなかに収まる幅
const SC_X1 = 360;
const SC_X2 = 1540;
const SC_Y = 500;
const SCORE_X = (v: number) => SC_X1 + (v / 100) * (SC_X2 - SC_X1);
// 偏差値の軸。平均50点・ばらつき20点 とみれば 70点 = 偏差値60 になる。
// 同じ答案が上下で同じ x に来るよう、点数軸を2倍に伸ばした軸を下に敷く
// (50点と偏差値50 がぴったり重なるので「まん中が50」が目で分かる)
const HENSA_X = (v: number) => SCORE_X(50 + (v - 50) * 2);
const HN_Y = 720;
// 答案の束 (左から 10点刻み)。釣鐘の形になるように枚数を置く
const HIST_157: { v: number; n: number }[] = [
  { v: 10, n: 1 }, { v: 20, n: 2 }, { v: 30, n: 4 }, { v: 40, n: 7 }, { v: 50, n: 9 },
  { v: 60, n: 7 }, { v: 70, n: 4 }, { v: 80, n: 2 }, { v: 90, n: 1 },
];
const SHEET_H_157 = 26; // 1枚ぶんの高さ
const HIT_157 = 70;     // この絵で追いかける答案の点数

const S157: React.FC<{ f: number }> = ({ f }) => {
  // 自分の答案が飛んできて 70点の束の上に着地する
  const land = easeOut(seg(f, 4, 20));
  const px = lerp(520, SCORE_X(HIT_157), land);
  const topOf70 = SC_Y - 4 * SHEET_H_157;
  const py = lerp(250, topOf70 - 56, land);
  const lit = seg(f, 20, 32);   // 70点の束が朱に変わる
  const drop = easeOut(seg(f, 24, 36)); // 下の軸へ落ちる朱の線
  return (
    <Frame f={f} seed={1056} bg={KRP.cream}>
      {/* ---- 机のラシャ (深緑の下敷き)。#156 の茶色の机と見た目を切る ---- */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.mat} />
      <g stroke={C.matDark} strokeWidth={3} opacity={0.5}>
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={i * 84} y1={-20} x2={i * 84} y2={H + 20} />
        ))}
      </g>
      {/* 木の机の縁 (ラシャが敷かれた机だと分かる) */}
      <rect x={-20} y={-20} width={W + 40} height={74} fill={C.woodDesk} />
      <rect x={-20} y={46} width={W + 40} height={14} rx={6} fill={C.woodDeskDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* ---- ガリ版刷りの紙 (青っぽい謄写版の紙。図はこの紙の上だけに載せる) ---- */}
      <rect x={202} y={166} width={1540} height={650} rx={10} fill={KRP.ink} opacity={0.26} />
      <rect x={190} y={150} width={1540} height={650} rx={8} fill={C.mimeo}
        stroke={KRP.ink} strokeWidth={7} />
      {/* 謄写版のインクのむら */}
      <g fill={C.mimeoInk} opacity={0.055}>
        <ellipse cx={520} cy={300} rx={240} ry={110} />
        <ellipse cx={1380} cy={690} rx={280} ry={96} />
      </g>
      {/* 見出しの罫と綴じ穴 */}
      <line x1={246} y1={212} x2={1686} y2={212} stroke={C.mimeoInk} strokeWidth={4} opacity={0.3} />
      <g fill={C.mat} stroke={KRP.ink} strokeWidth={4}>
        <circle cx={700} cy={182} r={11} />
        <circle cx={1230} cy={182} r={11} />
      </g>
      {/* ---- 答案の束 (= 受験生全体)。1枚1枚を積んで分布の形にする ---- */}
      {HIST_157.map(({ v, n }) => {
        const cx = SCORE_X(v);
        const hot = v === HIT_157 ? lit : 0;
        return (
          <g key={v}>
            {Array.from({ length: n }, (_, i) => (
              <rect
                key={i}
                x={cx - 48}
                y={SC_Y - (i + 1) * SHEET_H_157 + 2}
                width={96}
                height={SHEET_H_157 - 4}
                rx={3}
                fill={hot > 0 ? C.vermil : C.washi}
                opacity={hot > 0 ? 0.4 + hot * 0.6 : 1}
                stroke={KRP.ink}
                strokeWidth={4}
                transform={`rotate(${(rnd(v + i * 7) - 0.5) * 2.4} ${cx} ${SC_Y - i * SHEET_H_157})`}
              />
            ))}
          </g>
        );
      })}
      {/* 束の頭をつなぐ分布の線 (「全体」の形) */}
      <polyline
        points={HIST_157.map(({ v, n }) => `${SCORE_X(v)},${SC_Y - n * SHEET_H_157}`).join(" ")}
        fill="none"
        stroke={C.curve}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.75 * seg(f, 6, 22)}
      />
      {/* ---- 点数の軸 ---- */}
      <NumberLine x1={SC_X1} x2={SC_X2} y={SC_Y} from={0} to={100} step={10} f={f}
        color={C.mimeoInk} labelSize={26} />
      {/* 平均の目印。上下の軸で「50」がそろっていることを示す細い縦線 */}
      <line x1={SCORE_X(50)} y1={SC_Y + 18} x2={HENSA_X(50)} y2={HN_Y - 22}
        stroke={C.mimeoInk} strokeWidth={4} strokeDasharray="12 10" opacity={0.4} />
      {/* ---- 飛んできて刺さる1枚の答案 (70点) ---- */}
      <g transform={`translate(${px} ${py}) rotate(${lerp(-18, -5, land)})`}>
        <rect x={-80} y={-50} width={160} height={100} rx={5} fill={C.washi}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.32}>
          <line x1={-62} y1={-28} x2={40} y2={-28} />
          <line x1={-62} y1={-8} x2={10} y2={-8} />
        </g>
        <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={44} fill={C.vermil}>
          70点
        </text>
      </g>
      {/* ---- 点数が下の軸へ落ちていく朱の線 = ★変換 ---- */}
      <line
        x1={SCORE_X(HIT_157)}
        y1={SC_Y + 16}
        x2={SCORE_X(HIT_157)}
        y2={SC_Y + 16 + (HN_Y - 104 - SC_Y - 16) * drop}
        stroke={C.vermil}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray="16 12"
        opacity={drop}
      />
      {/* ---- 偏差値の軸 (旗が「60」で立つ) ---- */}
      <NumberLine x1={HENSA_X(30)} x2={HENSA_X(70)} y={HN_Y} from={30} to={70} step={10} f={f}
        mark={60} color={C.mimeoInk} labelSize={28} />
      {/* ---- ラシャの上の道具 (紙の外。第16条の床) ---- */}
      <g transform="translate(96 520) rotate(-8)">
        <rect x={-18} y={-210} width={36} height={420} rx={8} fill={C.ruler} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={-18} y1={-196 + i * 39} x2={i % 2 ? -2 : 6} y2={-196 + i * 39} />
          ))}
        </g>
      </g>
      <g transform="translate(1840 560) rotate(6)">
        <line x1={0} y1={-180} x2={0} y2={150} stroke={C.woodDeskDark} strokeWidth={14} strokeLinecap="round" />
        <line x1={0} y1={150} x2={0} y2={200} stroke={C.vermil} strokeWidth={15} strokeLinecap="round" />
      </g>
      <TagPlate x={300} y={280} text="答案の数" size={34} t={seg(f, 8, 20)} />
      <TagPlate x={300} y={HN_Y} text="偏差値" size={38} t={seg(f, 12, 24)} color={C.vermil} />
      <TagPlate x={1620} y={HN_Y} text="50 が平均" size={32} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #158 これが模擬試験に乗って、全国へ広がりました。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const SCHOOLS_158: [number, number][] = [
  [548, 736], [722, 686], [860, 604], [1010, 524], [1154, 452], [1300, 374],
];
const S158: React.FC<{ f: number }> = ({ f }) => {
  const src: [number, number] = [320, 936];
  return (
    <Frame f={f} seed={1057} bg={KRP.cream}>
      <DeskSurface f={f} wall={C.wall} top={212} />
      {/* 奥の壁の暦 */}
      <g opacity={0.6}>
        <rect x={1540} y={34} width={300} height={152} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1540} y={34} width={300} height={40} fill={C.vermil} opacity={0.55} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
          {[0, 1, 2].map((i) => (
            <line key={i} x1={1562} y1={100 + i * 28} x2={1818} y2={100 + i * 28} />
          ))}
        </g>
      </g>
      {/* 日本地図の紙 */}
      <PaperSheet id="s158" x={286} y={242} w={1346} h={568} rot={-1}>
        {/* 海のあたり */}
        <ellipse cx={960} cy={526} rx={620} ry={244} fill={C.mapSea} opacity={0.42} />
        {/* 陸 (本州・北海道・四国・九州をかたどった形) */}
        <g fill={C.mapLand} stroke={KRP.ink} strokeWidth={6}>
          <path d="M 598 760 q 60 -78 158 -104 q 120 -34 214 -108 q 118 -92 254 -138 q 78 -26 126 -62 l 52 60 q -58 44 -140 74 q -128 46 -236 132 q -104 82 -222 116 q -96 28 -152 94 Z" />
          <path d="M 1256 392 q 56 -72 128 -84 q 66 -10 92 36 q 24 48 -34 86 q -72 48 -138 24 q -56 -20 -48 -62 Z" />
          <path d="M 744 744 q 44 -22 88 -8 q 34 12 18 42 q -18 34 -70 28 q -48 -6 -36 -62 Z" />
          <path d="M 476 788 q 20 -62 76 -74 q 50 -10 62 30 q 12 48 -34 76 q -52 32 -84 6 q -24 -18 -20 -38 Z" />
        </g>
        {/* 学校の点 */}
        {SCHOOLS_158.map(([dx, dy], i) => (
          <g key={i} opacity={pop(seg(f, 8 + i * 3, 18 + i * 3))}>
            <circle cx={dx} cy={dy} r={14} fill={C.vermil} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={dx} cy={dy} r={26} fill="none" stroke={C.vermil} strokeWidth={4} opacity={0.4} />
          </g>
        ))}
      </PaperSheet>
      {/* 封筒が線を引いて飛ぶ */}
      {SCHOOLS_158.map(([dx, dy], i) => {
        const t = easeOut(seg(f, 4 + i * 3, 24 + i * 3));
        const mx = (src[0] + dx) / 2 + 40;
        const my = Math.min(src[1], dy) - 190 - i * 14;
        const bx = (1 - t) * (1 - t) * src[0] + 2 * (1 - t) * t * mx + t * t * dx;
        const by = (1 - t) * (1 - t) * src[1] + 2 * (1 - t) * t * my + t * t * dy;
        return (
          <g key={i}>
            <path
              d={`M ${src[0]} ${src[1]} Q ${mx} ${my} ${dx} ${dy}`}
              fill="none"
              stroke={C.vermil}
              strokeWidth={4.5}
              opacity={0.42}
              strokeDasharray="16 12"
              pathLength={1}
              strokeDashoffset={0}
            />
            {t > 0.02 && t < 0.995 && (
              <g transform={`translate(${bx} ${by}) rotate(${-18 + i * 6})`}>
                <rect x={-30} y={-20} width={60} height={40} rx={4} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
                <path d="M -30 -20 L 0 4 L 30 -20" fill="none" stroke={KRP.ink} strokeWidth={4.5} />
              </g>
            )}
          </g>
        );
      })}
      {/* 郵袋 */}
      <g transform="translate(286 964)">
        <path d="M -110 100 q -26 -140 46 -186 q 70 -44 142 -6 q 76 40 52 192 Z" fill={C.wainscot} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-96} y={-96} width={190} height={26} rx={10} fill={C.woodDeskDark} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={26} r={28} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.vermil}>
          〒
        </text>
      </g>
      {/* 判子 */}
      <g transform="translate(1706 866) rotate(6)">
        <rect x={-30} y={-104} width={60} height={104} rx={8} fill={C.woodDeskDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-44} y={-6} width={88} height={34} rx={6} fill={C.vermil} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <Paperweight x={1498} y={906} rot={-3} s={0.85} />
      <TagPlate x={1130} y={154} text="全国へ" size={42} t={seg(f, 24, 36)} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #159 隣のクラスどころか、会ったこともない全国の同学年と、毎週比べられる。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const S159: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1058} bg={KRP.cream}>
    <Classroom f={f} floorY={660} winSide="none" />
    {/* 大きな窓 (外に同じ机が遠くまで連なる) */}
    <g>
      <rect x={760} y={92} width={1080} height={436} rx={8} fill={C.win} stroke={KRP.ink} strokeWidth={9} />
      {/* 遠景: 同じ机の列 (薄く) */}
      <g opacity={0.34}>
        {[0, 1, 2, 3, 4].map((r) => (
          <g key={r} opacity={1 - r * 0.16}>
            {Array.from({ length: 6 - r }, (_, i) => (
              <SchoolDesk key={i} x={830 + i * 186 + r * 72} y={492 - r * 74} s={0.3 - r * 0.035} paper f={f} phase={r * 3 + i} />
            ))}
          </g>
        ))}
      </g>
      {/* 窓の桟 */}
      <g stroke={KRP.ink} strokeWidth={7}>
        <line x1={1300} y1={92} x2={1300} y2={528} />
        <line x1={760} y1={310} x2={1840} y2={310} />
      </g>
      <rect x={744} y={528} width={1112} height={22} rx={7} fill={C.wainscot} stroke={KRP.ink} strokeWidth={6} />
    </g>
    {/* 教室の机にすわる1人 */}
    <PersonMini x={372} y={796} s={1.34} color={C.gakuran} f={f} phase={2} face="dot" arms="down" />
    <SchoolDesk x={372} y={776} s={1.3} paper f={f} phase={1} />
    {/* 毎週の封筒が積まれる */}
    <g>
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} transform={`translate(${904 + (rnd(i * 5 + 1) - 0.5) * 22} ${828 - i * 26}) rotate(${(rnd(i * 7 + 2) - 0.5) * 7})`}
          opacity={pop(seg(f, 4 + i * 3, 14 + i * 3))}>
          <rect x={-128} y={-24} width={256} height={48} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -128 -24 L 0 20 L 128 -24" fill="none" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={100} cy={-8} r={9} fill={C.vermil} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
      <ellipse cx={904} cy={852} rx={150} ry={22} fill={KRP.ink} opacity={0.14} />
    </g>
    {/* 奥の机 (世界の密度) */}
    <SchoolDesk x={620} y={700} s={0.66} f={f} phase={6} />
    <TagPlate x={1560} y={656} text="毎週" size={42} t={seg(f, 18, 30)} />
  </Frame>
);

// ------------------------------------------------------------------
// #160 受験の物差しとしてここまで浸透したのは、日本独特だとされています。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const S160: React.FC<{ f: number }> = ({ f }) => {
  const reach = easeOut(seg(f, 10, 30));
  return (
    <Frame f={f} seed={1059} bg={KRP.cream}>
      {/* 進路指導室 */}
      <rect x={-20} y={-20} width={W + 40} height={800} fill={C.wall} />
      <rect x={-20} y={-20} width={W + 40} height={130} fill={C.wallShade} opacity={0.45} />
      <rect x={-20} y={760} width={W + 40} height={H - 720} fill={C.floor} />
      <g stroke={C.floorDark} strokeWidth={4} opacity={0.5}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-20} y1={812 + i * 78} x2={W + 20} y2={812 + i * 78} />
        ))}
      </g>
      {/* 壁の進路の掲示 */}
      <g opacity={0.6}>
        <rect x={94} y={96} width={212} height={272} rx={5} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.42}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={118} y1={140 + i * 38} x2={282} y2={140 + i * 38} />
          ))}
        </g>
      </g>
      {/* 棚 */}
      <g>
        <rect x={360} y={236} width={1200} height={520} rx={8} fill={C.shelf} stroke={KRP.ink} strokeWidth={9} />
        <rect x={380} y={256} width={1160} height={480} fill={C.wainscot} opacity={0.45} />
        <line x1={380} y1={496} x2={1540} y2={496} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={KRP.ink} strokeWidth={7}>
          {[1, 2, 3, 4].map((i) => (
            <line key={i} x1={380 + i * 232} y1={256} x2={380 + i * 232} y2={736} />
          ))}
        </g>
        {/* 各国の棚: 物差しが1本ずつ (他国にも物差しはある) */}
        {[496, 728, 960, 1192, 1424].map((cx, i) => {
          const worn = i === 2;
          return (
            <g key={cx}>
              <g transform={`translate(${cx} ${440}) rotate(${-6 + i * 3})`}>
                <rect
                  x={-22}
                  y={-152}
                  width={44}
                  height={304}
                  rx={7}
                  fill={worn ? C.washiEdge : C.ruler}
                  stroke={KRP.ink}
                  strokeWidth={6}
                />
                <g stroke={KRP.ink} strokeWidth={3} opacity={worn ? 0.9 : 0.6}>
                  {Array.from({ length: 11 }, (_, k) => (
                    <line key={k} x1={-22} y1={-136 + k * 28} x2={k % 2 === 0 ? 4 : -6} y2={-136 + k * 28} />
                  ))}
                </g>
                {/* 使い込まれた手垢 */}
                {worn && (
                  <g fill={C.woodDeskDark} opacity={0.34}>
                    <ellipse cx={0} cy={-62} rx={19} ry={34} />
                    <ellipse cx={2} cy={46} rx={18} ry={40} />
                    <ellipse cx={-4} cy={120} rx={16} ry={22} />
                  </g>
                )}
              </g>
              {/* 下段の書類 */}
              <g>
                {[0, 1, 2, 3].map((k) => (
                  <rect
                    key={k}
                    x={cx - 92 + k * 46}
                    y={540 + (k % 2) * 8}
                    width={38}
                    height={190}
                    rx={4}
                    fill={k % 2 === 0 ? C.washi : C.washiEdge}
                    stroke={KRP.ink}
                    strokeWidth={5}
                  />
                ))}
              </g>
            </g>
          );
        })}
      </g>
      {/* 先生が1人それを取る */}
      <g transform={`translate(${lerp(1320, 1250, reach)} 0)`}>
        <Person x={0} y={1012} s={1.16} cloth="#4A4038" clothDark="#332C25" glasses face="normal" pose="raise" f={f} phase={4} />
      </g>
      <TagPlate x={960} y={176} text="日本の棚" size={38} t={seg(f, 4, 16)} />
      <TagPlate x={1712} y={176} text="とされる" size={38} t={seg(f, 24, 36)} color={KRP.grayDark} />
    </Frame>
  );
};

// ------------------------------------------------------------------
// #161 同じ年に生まれた全員が、同じ一本の数直線に乗りました。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const S161: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1060} bg={KRP.cream}>
    {/* 校庭 (空・校舎・木・土) */}
    <rect x={-20} y={-20} width={W + 40} height={520} fill={C.win} opacity={0.55} />
    <g opacity={0.9}>
      <rect x={180} y={318} width={1180} height={214} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 160 318 L 1380 318 L 1322 262 L 218 262 Z" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} />
      <g fill={C.win} stroke={KRP.ink} strokeWidth={5}>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={222 + i * 126} y={354} width={84} height={66} rx={4} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={`b${i}`} x={222 + i * 126} y={446} width={84} height={62} rx={4} />
        ))}
      </g>
      {/* 時計塔 */}
      <rect x={1396} y={238} width={120} height={294} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      <circle cx={1456} cy={304} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <line x1={1456} y1={304} x2={1456} y2={284} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1456} y1={304} x2={1456 + Math.cos(f / 11) * 24} y2={304 + Math.sin(f / 11) * 24} stroke={C.vermil} strokeWidth={4} />
    </g>
    {[90, 1620, 1820].map((tx, i) => (
      <g key={tx} opacity={0.82}>
        <rect x={tx - 11} y={398} width={22} height={140} fill={C.woodDeskDark} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={tx} cy={372} rx={88 + i * 10} ry={66} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} opacity={0.88} />
      </g>
    ))}
    {/* 校庭の土 */}
    <rect x={-20} y={530} width={W + 40} height={H - 490} fill={C.dohyo} />
    <g fill={C.dohyoDark} opacity={0.35}>
      <ellipse cx={300} cy={620} rx={180} ry={20} />
      <ellipse cx={1400} cy={960} rx={240} ry={26} />
      <ellipse cx={760} cy={1016} rx={200} ry={22} />
    </g>
    <g stroke={C.dohyoDark} strokeWidth={4} opacity={0.3}>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={-20} y1={596 + i * 118} x2={W + 20} y2={606 + i * 118} />
      ))}
    </g>
    {/* 同学年の全員が1本の数直線に乗る */}
    {Array.from({ length: 29 }, (_, i) => (
      <PersonMini
        key={i}
        x={70 + i * 63}
        y={720}
        s={0.46}
        color={i % 3 === 0 ? C.gakuran : i % 3 === 1 ? C.sailor : C.stoneDark}
        f={f}
        phase={i}
        face="dot"
        arms="down"
      />
    ))}
    <NumberLine x1={120} x2={1800} y={726} from={0} to={100} step={20} f={f} labelSize={32} />
    <TagPlate x={960} y={214} text="同じ一本の数直線" size={40} t={seg(f, 6, 18)} />
  </Frame>
);

// ------------------------------------------------------------------
// #162 土俵の拡大は、ここでひとつの完成を迎えます。
// 格: TODO (山/並/図) — 設計書 docs/briefs/IchiB8.md に合わせる
// ------------------------------------------------------------------
const RING_162 = [104, 172, 240, 302];
const S162: React.FC<{ f: number }> = ({ f }) => {
  const cx = 880;
  const cy = 498;
  const lit = 0.5 + Math.abs(Math.sin(f / 9)) * 0.5;
  const z = lerp(1, 1.05, easeOut(seg(f, 6, 42)));
  return (
    <Frame f={f} seed={1061} bg={KRP.cream}>
      <g transform={zoomAt(z, 900, 520)}>
        <DeskSurface f={f} wall={C.wall} top={160} />
        {/* 和紙の絵図 (方眼はこの紙の中だけ = 第16条) */}
        <PaperSheet id="s162" x={196} y={188} w={1528} h={622} rot={-0.8} grid>
          {/* 土俵マップ: 輪が4段目まで広がる */}
          {RING_162.map((r, i) => {
            const on = pop(seg(f, 2 + i * 5, 14 + i * 5));
            const outer = i === RING_162.length - 1;
            return (
              <g key={r} opacity={on}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={outer ? C.vermil : KRP.ink}
                  strokeWidth={outer ? 12 : 7}
                  opacity={outer ? lit : 0.55 - i * 0.07}
                  strokeDasharray={outer ? undefined : "20 12"}
                />
                {outer && (
                  <circle cx={cx} cy={cy} r={r + 16} fill="none" stroke={C.lamp} strokeWidth={9} opacity={lit * 0.45} />
                )}
              </g>
            );
          })}
          {/* 輪の中にたまっていく人 */}
          {Array.from({ length: 34 }, (_, i) => {
            const ring = i < 4 ? 0 : i < 10 ? 1 : i < 19 ? 2 : 3;
            const a = (i / 34) * Math.PI * 2 * 3.1 + ring;
            const rr = RING_162[ring] * (0.42 + rnd(i * 5 + 1) * 0.42);
            return (
              <PersonMini
                key={i}
                x={cx + Math.cos(a) * rr}
                y={cy + Math.sin(a) * rr * 0.86 + 20}
                s={0.19}
                color={ring === 3 ? C.vermil : C.stoneDark}
                f={f}
                phase={i}
                face="none"
                arms="down"
                 />
            );
          })}
          {/* 絵図の走り書き (段ごとの覚え) */}
          <g stroke={KRP.ink} strokeWidth={4} opacity={0.3}>
            <line x1={300} y1={266} x2={520} y2={266} />
            <line x1={300} y1={300} x2={448} y2={300} />
            <line x1={300} y1={734} x2={560} y2={734} />
          </g>
          {/* 4段目を指す朱の矢 */}
          <g opacity={seg(f, 26, 36)}>
            <line x1={cx + 318} y1={cy - 26} x2={1348} y2={cy - 150} stroke={C.vermil} strokeWidth={6} strokeLinecap="round" />
            <circle cx={cx + 312} cy={cy - 22} r={11} fill={C.vermil} />
          </g>
        </PaperSheet>
        {/* 文鎮 と 筆 */}
        <Paperweight x={382} y={842} rot={-2} s={0.9} />
        <Paperweight x={1486} y={862} rot={3} s={0.9} />
        <g transform="translate(1180 930) rotate(-12)">
          <rect x={-190} y={-13} width={340} height={26} rx={10} fill={C.woodDeskDark} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 150 -13 q 60 4 92 13 q -32 9 -92 13 Z" fill={KRP.ink} />
          <rect x={-200} y={-16} width={30} height={32} rx={8} fill={C.brass} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>
      <TagPlate x={1462} y={310} text="同学年の全国民" size={38} t={seg(f, 28, 40)} color={C.vermil} />
    </Frame>
  );
};

// ===================================================================
// motif → シーン
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib8_s143:                  (f) => <S143 f={f} />,
  ib8_s144:                  (f) => <S144 f={f} />,
  ib8_s145:                  (f) => <S145 f={f} />,
  ib8_s146:                  (f) => <S146 f={f} />,
  ib8_s147:                  (f) => <S147 f={f} />,
  ib8_s148:                  (f) => <S148 f={f} />,
  ib8_s149:                  (f) => <S149 f={f} />,
  ib8_s150:                  (f) => <S150 f={f} />,
  ib8_s151:                  (f) => <S151 f={f} />,
  ib8_s152:                  (f) => <S152 f={f} />,
  ib8_s153:                  (f) => <S153 f={f} />,
  ib8_s154:                  (f) => <S154 f={f} />,
  ib8_s155:                  (f) => <S155 f={f} />,
  ib8_s156:                  (f) => <S156 f={f} />,
  ib8_s157:                  (f) => <S157 f={f} />,
  ib8_s158:                  (f) => <S158 f={f} />,
  ib8_s159:                  (f) => <S159 f={f} />,
  ib8_s160:                  (f) => <S160 f={f} />,
  ib8_s161:                  (f) => <S161 f={f} />,
  ib8_s162:                  (f) => <S162 f={f} />,
};

export const I_B8_MOTIFS: string[] = [
  "ib8_s143",                  // #143 第8章、全国民、同じ物差しへ。
  "ib8_s144",                  // #144 ここまでの順位は、力士や選手や受験生といった、いわば「参加者」のものでした。
  "ib8_s145",                  // #145 それが全員に広がる下ごしらえをしたのは、ベルギーの天文学者です。
  "ib8_s146",                  // #146 1835年、ケトレーは「平均人」という考え方を発表しました。
  "ib8_s147",                  // #147 たくさんの人間を測って平均を出せば、「標準の人間」の姿が描ける、という発想です。
  "ib8_s148",                  // #148 星を測るための統計の技術が、人間に向けられた瞬間でした。
  "ib8_s149",                  // #149 平均が生まれると、人は「自分は平均より上か下か」を気にし始めます。
  "ib8_s150",                  // #150 この物差しは、やがて日本の通知表にも組み込まれました。
  "ib8_s151",                  // #151 かつての通知表は、「クラスの中で上から何%か」で決まっていたのです。
  "ib8_s152",                  // #152 5がもらえるのは、クラスの約7%だけ。
  "ib8_s153",                  // #153 1も約7%、2と4は約24%、真ん中の3は約38%という割り当てです。
  "ib8_s154",                  // #154 誰かが5を取れば、誰かは5を取れない。そういう仕組みでした。
  "ib8_s155",                  // #155 そして1957年、決定打が登場します。
  "ib8_s156",                  // #156 偏差値。東京の中学校の先生、桑田昭三さんが進路指導のために考え出したとされています。
  "ib8_s157",                  // #157 テストの点数を、受験生全体の中での「位置」に変換する数字です。
  "ib8_s158",                  // #158 これが模擬試験に乗って、全国へ広がりました。
  "ib8_s159",                  // #159 隣のクラスどころか、会ったこともない全国の同学年と、毎週比べられる。
  "ib8_s160",                  // #160 受験の物差しとしてここまで浸透したのは、日本独特だとされています。
  "ib8_s161",                  // #161 同じ年に生まれた全員が、同じ一本の数直線に乗りました。
  "ib8_s162",                  // #162 土俵の拡大は、ここでひとつの完成を迎えます。
];

export const ichiB8Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B8_PREVIEW_FRAMES = Math.max(I_B8_MOTIFS.length, 1);
export const IchiB8Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B8_MOTIFS.length - 1);
  return <>{ichiB8Scene(I_B8_MOTIFS[i] ?? "", 45)}</>;
};
