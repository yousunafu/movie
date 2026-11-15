// 第4章「首席は英雄 ビリには木のスプーン。」専用のローカル部品。
// 共通部品 (KarakuriScenes / IchiShared / KosoB2Parts) は一切変更せず、
// この章だけで使い回す舞台部品をここに集める (KosoB2Parts.tsx と同じ作法)。
// 名前は ib4 / C4 で閉じてあるので他の章と衝突しない。

import React from "react";
import { KRP, Person, PersonMini } from "./KarakuriScenes";
import { GridPaper, rnd, bobOf, lerp } from "./KosoB2Parts";

// KarakuriScenes は Face / Pose 型を export していないのでローカルに別名を作る
export type IFace =
  | "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
export type IPose =
  | "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";

// ===================================================================
// 第4章の色 (石造学寮・板床・掲示板・印刷工場)
// ===================================================================
export const C4 = {
  ink: "#3A352C",
  // 切石
  stone: "#D6CDB8",
  stoneShade: "#BEB39A",
  stoneLine: "#A99D82",
  // 石畳
  cobble: "#C8BFA8",
  cobbleDark: "#AAA087",
  // 板床・木机
  wood: "#A8824F",
  woodDark: "#7C5C32",
  woodLight: "#C4A273",
  // ガウン
  gown: "#3C3A3E",
  gownDark: "#28262A",
  gownAlt: "#4C4650",
  gownAltDark: "#352F38",
  // 修道服
  habit: "#2E2C2E",
  habitDark: "#1E1C1E",
  // 紙
  paper: "#F3ECD9",
  paperDark: "#DCD2B6",
  paperShade: "#C9BE9E",
  // 窓の空
  sky: "#D9E0DC",
  skyWarm: "#EBDEC0",
  glass: "#C3CFCB",
  // 蔦・芝
  leaf: "#7F8E6C",
  leafDark: "#5F6E4E",
  grass: "#9DA87E",
  // 赤・金
  red: "#B5452F",
  redDeep: "#8C3220",
  gold: "#B8933E",
  // 煉瓦の町
  brick: "#B07A5E",
  brickDark: "#8A5C42",
  // 工場
  iron: "#6E6A62",
  ironDark: "#4C4944",
  oil: "#3E3A33",
  sumi: "#2B2824",
};

// ===================================================================
// 石畳の地面 (目地・小石・ひび・手前の影)
// ===================================================================
export const CobbleGround: React.FC<{ y?: number; k?: number; op?: number }> = ({
  y = 752,
  k = 0,
  op = 1,
}) => (
  <g opacity={op}>
    <rect x={0} y={y} width={1920} height={1080 - y} fill={C4.cobble} />
    {/* 横の目地 */}
    {[...Array(7)].map((_, r) => {
      const ly = y + 18 + r * r * 7 + r * 20;
      if (ly > 1070) return null;
      return (
        <g key={`cr${r}`}>
          <line
            x1={0}
            y1={ly}
            x2={1920}
            y2={ly}
            stroke={C4.cobbleDark}
            strokeWidth={2.4}
            opacity={0.6}
          />
          {/* 縦の目地 (段ごとに半ピッチずらす) */}
          {[...Array(9)].map((_, c) => {
            const pitch = 210 + r * 18;
            const lx = (r % 2 ? pitch / 2 : 0) + c * pitch;
            if (lx > 1920) return null;
            return (
              <line
                key={`cc${r}_${c}`}
                x1={lx}
                y1={ly}
                x2={lx}
                y2={Math.min(ly + 20 + r * 20, 1075)}
                stroke={C4.cobbleDark}
                strokeWidth={2.2}
                opacity={0.5}
              />
            );
          })}
        </g>
      );
    })}
    {/* 小石 */}
    {[...Array(20)].map((_, i) => (
      <ellipse
        key={`pb${i}`}
        cx={rnd(i * 13 + k * 31 + 3) * 1900}
        cy={y + 14 + rnd(i * 7 + k * 17 + 5) * (1060 - y)}
        rx={4 + rnd(i * 5 + k) * 7}
        ry={3 + rnd(i * 11 + k) * 5}
        fill={C4.cobbleDark}
        opacity={0.5}
      />
    ))}
    {/* 落ち葉 */}
    {[...Array(7)].map((_, i) => (
      <ellipse
        key={`lf${i}`}
        cx={rnd(i * 23 + k * 7 + 9) * 1880}
        cy={y + 30 + rnd(i * 17 + k * 3 + 1) * (1030 - y)}
        rx={11}
        ry={5}
        fill={C4.leafDark}
        opacity={0.3}
        transform={`rotate(${rnd(i * 3 + k) * 80 - 40} ${rnd(i * 23 + k * 7 + 9) * 1880} ${y + 30})`}
      />
    ))}
    {/* 手前の影 */}
    <rect x={0} y={1010} width={1920} height={70} fill={C4.ink} opacity={0.08} />
    {/* 地面の上端の線 */}
    <line x1={0} y1={y} x2={1920} y2={y} stroke={C4.ink} strokeWidth={3.4} opacity={0.5} />
  </g>
);

// ===================================================================
// 切石の壁 (目地を一段ずつずらす)
// ===================================================================
export const StoneWall: React.FC<{
  x: number; y: number; w: number; h: number; op?: number; courseH?: number;
}> = ({ x, y, w, h, op = 1, courseH = 64 }) => {
  const rows = Math.max(1, Math.floor(h / courseH));
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} fill={C4.stone} stroke={C4.ink} strokeWidth={4} />
      {[...Array(rows)].map((_, r) => {
        const ly = y + (r + 1) * courseH;
        if (ly >= y + h) return null;
        return (
          <g key={`sr${r}`}>
            <line x1={x} y1={ly} x2={x + w} y2={ly} stroke={C4.stoneLine} strokeWidth={2.6} opacity={0.8} />
            {[...Array(Math.ceil(w / 128) + 1)].map((_, c) => {
              const lx = x + (r % 2 ? 64 : 0) + c * 128;
              if (lx <= x || lx >= x + w) return null;
              return (
                <line
                  key={`sc${r}_${c}`}
                  x1={lx}
                  y1={ly}
                  x2={lx}
                  y2={Math.min(ly + courseH, y + h)}
                  stroke={C4.stoneLine}
                  strokeWidth={2.4}
                  opacity={0.7}
                />
              );
            })}
          </g>
        );
      })}
      {/* 石の汚れ */}
      {[...Array(10)].map((_, i) => (
        <ellipse
          key={`sg${i}`}
          cx={x + rnd(i * 19 + 3) * w}
          cy={y + rnd(i * 7 + 11) * h}
          rx={20 + rnd(i * 5) * 26}
          ry={10 + rnd(i * 13) * 14}
          fill={C4.stoneShade}
          opacity={0.4}
        />
      ))}
    </g>
  );
};

// ===================================================================
// 尖頭窓 (格子つき)
// ===================================================================
export const GothicWindow: React.FC<{
  cx: number; y: number; w: number; h: number; op?: number; lit?: boolean;
}> = ({ cx, y, w, h, op = 1, lit = false }) => {
  const hw = w / 2;
  const arch = w * 0.62;
  const d = `M ${cx - hw} ${y + h} L ${cx - hw} ${y + arch} Q ${cx} ${y - arch * 0.26} ${cx + hw} ${y + arch} L ${cx + hw} ${y + h} Z`;
  return (
    <g opacity={op}>
      {/* 枠石 */}
      <path d={d} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={5} transform={`translate(0 0) scale(1)`} />
      <path
        d={`M ${cx - hw + 11} ${y + h} L ${cx - hw + 11} ${y + arch} Q ${cx} ${y - arch * 0.26 + 18} ${cx + hw - 11} ${y + arch} L ${cx + hw - 11} ${y + h} Z`}
        fill={lit ? C4.skyWarm : C4.glass}
        stroke={C4.ink}
        strokeWidth={3.4}
      />
      {/* 縦の桟 */}
      <line x1={cx} y1={y + 10} x2={cx} y2={y + h} stroke={C4.ink} strokeWidth={4} opacity={0.8} />
      {/* 横の桟 */}
      {[...Array(Math.max(1, Math.floor(h / 56)))].map((_, i) => {
        const ly = y + arch + 10 + i * 56;
        if (ly >= y + h - 6) return null;
        return (
          <line key={`gw${i}`} x1={cx - hw + 11} y1={ly} x2={cx + hw - 11} y2={ly} stroke={C4.ink} strokeWidth={2.6} opacity={0.6} />
        );
      })}
      {/* 下の敷石 */}
      <rect x={cx - hw - 8} y={y + h} width={w + 16} height={12} fill={C4.stoneShade} stroke={C4.ink} strokeWidth={3.4} />
    </g>
  );
};

// ===================================================================
// 蔦 (壁を這う)
// ===================================================================
export const Ivy: React.FC<{ x: number; y: number; h: number; k?: number; f?: number }> = ({
  x, y, h, k = 0, f = 0,
}) => (
  <g>
    <path
      d={`M ${x} ${y + h} C ${x - 28} ${y + h * 0.7} ${x + 30} ${y + h * 0.4} ${x + 6} ${y}`}
      stroke={C4.leafDark}
      strokeWidth={5}
      fill="none"
      opacity={0.85}
    />
    {[...Array(12)].map((_, i) => {
      const t = i / 11;
      const px = x + Math.sin(t * 5 + k) * 34 + 4;
      const py = y + h * (1 - t);
      const sway = Math.sin((f + i * 9) / 18) * 2.4;
      return (
        <ellipse
          key={`iv${i}`}
          cx={px + sway}
          cy={py}
          rx={16 + rnd(i * 7 + k) * 9}
          ry={11 + rnd(i * 3 + k) * 6}
          fill={i % 3 ? C4.leaf : C4.leafDark}
          stroke={C4.ink}
          strokeWidth={2}
          opacity={0.9}
          transform={`rotate(${rnd(i * 5 + k) * 70 - 35} ${px} ${py})`}
        />
      );
    })}
  </g>
);

// ===================================================================
// ガウンの学生 (Person の上に学士服と角帽を重ねる)
//   Person の transform と完全に同じ式を使う (bob はスケールしない)
// ===================================================================
export const Gakusei: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  pose?: IPose; pointDir?: 1 | -1; face?: IFace; gaze?: [number, number];
  lean?: number; alt?: boolean; cap?: boolean; sash?: boolean;
}> = ({
  x, y, s = 1, f, phase = 0, pose = "stand", pointDir, face = "normal",
  gaze, lean = 0, alt = false, cap = true, sash = false,
}) => {
  const g = alt ? C4.gownAlt : C4.gown;
  const gd = alt ? C4.gownAltDark : C4.gownDark;
  return (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s}) rotate(${lean})`}>
      <Person
        x={0}
        y={0}
        s={1}
        still
        hair="none"
        cloth={g}
        clothDark={gd}
        pose={pose}
        pointDir={pointDir}
        face={face}
        gaze={gaze}
      />
      {/* ガウンの裾 (脚の上・腕より下、y -62〜-2 に収める) */}
      <path d="M -54 -62 L -72 -2 L 72 -2 L 54 -62 Z" fill={g} stroke={C4.ink} strokeWidth={4.5} />
      <path d="M 0 -62 L 0 -2" stroke={gd} strokeWidth={4} opacity={0.8} />
      <path d="M -36 -58 L -46 -4" stroke={gd} strokeWidth={3} opacity={0.5} />
      <path d="M 36 -58 L 46 -4" stroke={gd} strokeWidth={3} opacity={0.5} />
      {/* 白い襟 (バンド) */}
      <path d="M -20 -162 L -20 -138 L 0 -126 L 20 -138 L 20 -162 Z" fill={KRP.white} stroke={C4.ink} strokeWidth={3.4} />
      <line x1={-8} y1={-160} x2={-8} y2={-130} stroke={C4.ink} strokeWidth={2.2} opacity={0.5} />
      <line x1={8} y1={-160} x2={8} y2={-130} stroke={C4.ink} strokeWidth={2.2} opacity={0.5} />
      {/* 肩のフード */}
      <path d="M -56 -156 Q 0 -128 56 -156 L 56 -168 Q 0 -142 -56 -168 Z" fill={gd} stroke={C4.ink} strokeWidth={3.6} />
      {sash && (
        <polygon points="-44,-158 -16,-158 46,-76 46,-56 30,-56" fill={C4.red} stroke={C4.ink} strokeWidth={3.4} opacity={0.95} />
      )}
      {cap && (
        <g>
          {/* 角帽の天板 */}
          <polygon points="-74,-286 74,-286 60,-268 -60,-268" fill={C4.sumi} stroke={C4.ink} strokeWidth={4.5} />
          {/* 帽体 */}
          <path d="M -40 -268 L -34 -292 L 34 -292 L 40 -268 Z" fill={C4.gownDark} stroke={C4.ink} strokeWidth={4} />
          {/* タッセル */}
          <line x1={62} y1={-284} x2={80} y2={-250} stroke={C4.gold} strokeWidth={3.4} />
          <ellipse cx={81} cy={-243} rx={7} ry={11} fill={C4.gold} stroke={C4.ink} strokeWidth={2.4} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 修道服の人 (写字机の修道士)
// ===================================================================
export const Shudoshi: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  pose?: IPose; face?: IFace; gaze?: [number, number]; lean?: number; hood?: boolean;
}> = ({ x, y, s = 1, f, phase = 0, pose = "stand", face = "normal", gaze, lean = 0, hood = true }) => (
  <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s}) rotate(${lean})`}>
    <Person
      x={0}
      y={0}
      s={1}
      still
      hair="none"
      cloth={C4.habit}
      clothDark={C4.habitDark}
      pose={pose}
      face={face}
      gaze={gaze}
    />
    {/* 長衣の裾 (足まで) */}
    <path d="M -56 -62 L -78 0 L 78 0 L 56 -62 Z" fill={C4.habit} stroke={C4.ink} strokeWidth={4.5} />
    <path d="M -30 -58 L -42 -2" stroke={C4.habitDark} strokeWidth={3} opacity={0.6} />
    <path d="M 30 -58 L 42 -2" stroke={C4.habitDark} strokeWidth={3} opacity={0.6} />
    {/* 腰の帯 */}
    <rect x={-58} y={-76} width={116} height={16} fill={C4.woodDark} stroke={C4.ink} strokeWidth={3.4} />
    <line x1={10} y1={-62} x2={16} y2={-16} stroke={C4.woodDark} strokeWidth={5} />
    {hood && (
      <path d="M -62 -258 Q 0 -300 62 -258 L 62 -214 Q 0 -244 -62 -214 Z" fill={C4.habitDark} stroke={C4.ink} strokeWidth={4.5} />
    )}
  </g>
);

// ===================================================================
// 掲示板の木枠 (鋲・古い貼り跡)
// ===================================================================
export const NoticeBoard: React.FC<{
  x: number; y: number; w: number; h: number; children?: React.ReactNode;
}> = ({ x, y, w, h, children }) => (
  <g>
    {/* 枠の影 */}
    <rect x={x + 10} y={y + 12} width={w} height={h} fill={C4.ink} opacity={0.14} />
    {/* 木枠 */}
    <rect x={x} y={y} width={w} height={h} rx={6} fill={C4.woodDark} stroke={C4.ink} strokeWidth={5.5} />
    {/* 板の面 */}
    <rect x={x + 26} y={y + 26} width={w - 52} height={h - 52} fill={C4.paperShade} stroke={C4.ink} strokeWidth={4} />
    {/* 枠の木目 */}
    {[0, 1, 2].map((i) => (
      <line key={`nw${i}`} x1={x + 6} y1={y + 8 + i * 7} x2={x + w - 6} y2={y + 8 + i * 7} stroke={C4.wood} strokeWidth={2} opacity={0.4} />
    ))}
    {/* 古い貼り跡 */}
    {[...Array(9)].map((_, i) => (
      <rect
        key={`pm${i}`}
        x={x + 40 + rnd(i * 17 + 3) * (w - 160)}
        y={y + 40 + rnd(i * 7 + 9) * (h - 140)}
        width={40 + rnd(i * 5) * 70}
        height={30 + rnd(i * 11) * 46}
        fill={C4.paperDark}
        opacity={0.4}
        transform={`rotate(${rnd(i * 3) * 8 - 4} ${x + w / 2} ${y + h / 2})`}
      />
    ))}
    {children}
    {/* 鋲 (四隅と辺の中) */}
    {[
      [x + 14, y + 14], [x + w - 14, y + 14], [x + 14, y + h - 14], [x + w - 14, y + h - 14],
      [x + w / 2, y + 14], [x + w / 2, y + h - 14], [x + 14, y + h / 2], [x + w - 14, y + h / 2],
    ].map(([cx, cy], i) => (
      <g key={`rv${i}`}>
        <circle cx={cx} cy={cy} r={9} fill={C4.gold} stroke={C4.ink} strokeWidth={3} />
        <circle cx={cx - 2.4} cy={cy - 2.4} r={2.8} fill={KRP.white} opacity={0.7} />
      </g>
    ))}
  </g>
);

// ===================================================================
// 順位表 (1位から最下位まで一本につながる長い紙)
//   phase 1 = 全体を引いて見る / phase 2 = 下端に寄る
// ===================================================================
export const RankList: React.FC<{
  x: number; y: number; w: number; h: number; rows: number;
  f: number; markLast?: boolean; op?: number;
}> = ({ x, y, w, h, rows, f, markLast = false, op = 1 }) => {
  const rh = h / rows;
  return (
    <g opacity={op}>
      {/* 紙 */}
      <rect x={x} y={y} width={w} height={h} fill={C4.paper} stroke={C4.ink} strokeWidth={4.5} />
      {/* 縦の罫 (順位の列) */}
      <line x1={x + 72} y1={y} x2={x + 72} y2={y + h} stroke={C4.paperShade} strokeWidth={3} />
      {/* 行 */}
      {[...Array(rows)].map((_, i) => {
        const ly = y + (i + 1) * rh;
        const last = markLast && i === rows - 1;
        return (
          <g key={`rl${i}`}>
            {ly < y + h - 2 && (
              <line x1={x + 10} y1={ly} x2={x + w - 10} y2={ly} stroke={C4.paperShade} strokeWidth={2.4} />
            )}
            {/* 順位の刻み */}
            <rect
              x={x + 20}
              y={ly - rh + rh * 0.3}
              width={rh < 24 ? 24 : 36}
              height={Math.max(4, rh * 0.26)}
              fill={last ? C4.red : C4.sumi}
              opacity={last ? 0.95 : 0.7}
            />
            {/* 名前の刻み (長さをばらす) */}
            {[0, 1].map((j) => (
              <rect
                key={`nm${i}_${j}`}
                x={x + 94 + j * (w * 0.38)}
                y={ly - rh + rh * 0.32}
                width={(w * 0.3) * (0.4 + rnd(i * 7 + j * 3) * 0.6)}
                height={Math.max(3, rh * 0.22)}
                fill={last ? C4.redDeep : C4.sumi}
                opacity={last ? 0.9 : 0.55}
              />
            ))}
          </g>
        );
      })}
      {/* 紙のめくれ (右下) */}
      <path
        d={`M ${x + w} ${y + h - 30} L ${x + w} ${y + h} L ${x + w - 30} ${y + h} Z`}
        fill={C4.paperDark}
        stroke={C4.ink}
        strokeWidth={3}
      />
      {/* 風のゆれ */}
      <path
        d={`M ${x} ${y + h} q ${w / 2} ${Math.sin(f / 11) * 5} ${w} 0`}
        stroke={C4.ink}
        strokeWidth={2.6}
        fill="none"
        opacity={0.35}
      />
    </g>
  );
};

// ===================================================================
// 木のスプーン (柄の長い木匙)
// ===================================================================
// hero=true で主役サイズ用の描き込み (木目を足す・節・壺の内側の影・縁の照り) を重ねる。
// #73 #74 の小さい匙は従来どおり (hero なし) なので見た目は変わらない。
export const WoodenSpoon: React.FC<{
  x: number; y: number; s?: number; rot?: number; op?: number; hero?: boolean;
}> = ({ x, y, s = 1, rot = 0, op = 1, hero = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    {/* 柄 */}
    <rect x={-22} y={-40} width={44} height={420} rx={20} fill={C4.wood} stroke={C4.ink} strokeWidth={5} />
    {/* 柄の木目 */}
    <line x1={-8} y1={-20} x2={-8} y2={360} stroke={C4.woodDark} strokeWidth={3} opacity={0.5} />
    <line x1={10} y1={10} x2={10} y2={340} stroke={C4.woodDark} strokeWidth={2.4} opacity={0.4} />
    {/* 柄の端 */}
    <ellipse cx={0} cy={376} rx={24} ry={14} fill={C4.woodLight} stroke={C4.ink} strokeWidth={4.5} />
    {/* 匙の壺 */}
    <ellipse cx={0} cy={-128} rx={96} ry={122} fill={C4.woodLight} stroke={C4.ink} strokeWidth={6} />
    <ellipse cx={0} cy={-132} rx={70} ry={94} fill={C4.wood} stroke={C4.ink} strokeWidth={4} />
    {/* 内側の削り跡 */}
    {[0, 1, 2, 3].map((i) => (
      <path
        key={`sp${i}`}
        d={`M ${-52 + i * 16} -200 q ${12} 70 ${4} 134`}
        stroke={C4.woodDark}
        strokeWidth={2.6}
        fill="none"
        opacity={0.4}
      />
    ))}
    {/* 首のつなぎ */}
    <path d="M -22 -34 Q 0 -14 22 -34" stroke={C4.ink} strokeWidth={4} fill="none" opacity={0.6} />
    {hero && (
      <g>
        {/* 柄の木目を足す */}
        <line x1={-15} y1={20} x2={-15} y2={334} stroke={C4.woodDark} strokeWidth={2.4} opacity={0.38} />
        <line x1={17} y1={56} x2={17} y2={300} stroke={C4.woodDark} strokeWidth={2} opacity={0.3} />
        {/* 柄の節 */}
        <ellipse cx={-4} cy={146} rx={7} ry={14} fill={C4.woodDark} opacity={0.42} />
        <ellipse cx={8} cy={262} rx={5} ry={10} fill={C4.woodDark} opacity={0.32} />
        {/* 柄の照り (左側に1本) */}
        <line x1={-16} y1={-24} x2={-16} y2={352} stroke={KRP.white} strokeWidth={5} opacity={0.22} strokeLinecap="round" />
        {/* 壺の内側の影 (くぼみに見せる) */}
        <ellipse cx={0} cy={-116} rx={62} ry={82} fill={C4.woodDark} opacity={0.26} />
        {/* 壺の縁の照りと影 */}
        <path d="M -84 -152 Q -98 -98 -62 -44" stroke={KRP.white} strokeWidth={8} fill="none" opacity={0.4} strokeLinecap="round" />
        <path d="M 84 -152 Q 98 -98 62 -44" stroke={C4.woodDark} strokeWidth={7} fill="none" opacity={0.45} strokeLinecap="round" />
        {/* 壺の削り跡をもう一段 */}
        {[0, 1, 2].map((i) => (
          <path
            key={`hs${i}`}
            d={`M ${-30 + i * 30} -84 q ${6} 30 ${2} 58`}
            stroke={C4.woodDark}
            strokeWidth={2.4}
            fill="none"
            opacity={0.3}
          />
        ))}
      </g>
    )}
  </g>
);

// ===================================================================
// 新聞 (一面に名前の罫)
// ===================================================================
export const Newspaper: React.FC<{
  x: number; y: number; w: number; h: number; rot?: number; op?: number; headline?: boolean;
}> = ({ x, y, w, h, rot = 0, op = 1, headline = true }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`} opacity={op}>
    <rect x={x} y={y} width={w} height={h} fill={C4.paper} stroke={C4.ink} strokeWidth={4.5} />
    {/* 中折れ */}
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={C4.paperShade} strokeWidth={4} />
    {/* 題字の帯 */}
    <rect x={x + 14} y={y + 12} width={w - 28} height={h * 0.1} fill={C4.sumi} opacity={0.75} />
    {headline && (
      <>
        {/* 一面の名の罫 (太い1本) */}
        <rect x={x + 22} y={y + h * 0.18} width={(w - 44) * 0.64} height={h * 0.09} fill={C4.redDeep} opacity={0.85} />
        <rect x={x + 22} y={y + h * 0.3} width={(w - 44) * 0.42} height={h * 0.055} fill={C4.sumi} opacity={0.6} />
      </>
    )}
    {/* 本文の段組 */}
    {[0, 1].map((col) =>
      [...Array(8)].map((_, i) => (
        <rect
          key={`np${col}_${i}`}
          x={x + 22 + col * (w / 2 - 8)}
          y={y + h * 0.42 + i * (h * 0.066)}
          width={(w / 2 - 44) * (0.6 + rnd(i * 7 + col * 3) * 0.4)}
          height={Math.max(2.6, h * 0.026)}
          fill={C4.sumi}
          opacity={0.42}
        />
      )),
    )}
  </g>
);

// ===================================================================
// 板床と木机の教室 (板目・窓の光・掛け地図・チョーク受け)
// ===================================================================
export const PlankRoom: React.FC<{ f: number; k?: number; lit?: boolean }> = ({ f, k = 0, lit = true }) => (
  <g>
    {/* 漆喰壁 */}
    <rect x={0} y={0} width={1920} height={700} fill={C4.stone} />
    {/* 壁の汚れ */}
    {[...Array(9)].map((_, i) => (
      <ellipse
        key={`wg${i}`}
        cx={rnd(i * 13 + k * 7 + 1) * 1900}
        cy={60 + rnd(i * 5 + k * 3) * 560}
        rx={60 + rnd(i * 11) * 70}
        ry={28 + rnd(i * 3) * 34}
        fill={C4.stoneShade}
        opacity={0.3}
      />
    ))}
    {/* 腰板 */}
    <rect x={0} y={560} width={1920} height={140} fill={C4.wood} stroke={C4.ink} strokeWidth={4} />
    {[...Array(12)].map((_, i) => (
      <line key={`wp${i}`} x1={i * 164} y1={560} x2={i * 164} y2={700} stroke={C4.woodDark} strokeWidth={3} opacity={0.5} />
    ))}
    {/* 窓 (右) */}
    <GothicWindow cx={1660} y={130} w={240} h={360} lit={lit} />
    {/* 窓からの光 */}
    {lit && (
      <polygon
        points="1540,500 1790,500 1340,1010 760,1010"
        fill={C4.skyWarm}
        opacity={0.16 + Math.sin(f / 23) * 0.02}
      />
    )}
    {/* 掛け地図 (左) */}
    <g>
      <rect x={120} y={120} width={300} height={16} rx={6} fill={C4.woodDark} stroke={C4.ink} strokeWidth={3.4} />
      <rect x={136} y={136} width={268} height={244} fill={C4.paperDark} stroke={C4.ink} strokeWidth={4} />
      <path d="M 170 200 q 60 40 44 90 q -10 40 50 54" stroke={C4.leafDark} strokeWidth={3.4} fill="none" opacity={0.6} />
      <path d="M 300 180 q 56 46 40 96 q -12 38 44 58" stroke={C4.leafDark} strokeWidth={3.4} fill="none" opacity={0.5} />
      {[0, 1, 2].map((i) => (
        <line key={`mg${i}`} x1={136} y1={190 + i * 60} x2={404} y2={190 + i * 60} stroke={C4.stoneLine} strokeWidth={1.6} opacity={0.4} />
      ))}
      <rect x={136} y={380} width={268} height={12} rx={5} fill={C4.woodDark} stroke={C4.ink} strokeWidth={3} />
    </g>
    {/* 黒板のチョーク受け */}
    <rect x={620} y={386} width={660} height={18} rx={6} fill={C4.woodDark} stroke={C4.ink} strokeWidth={3.4} />
    <rect x={640} y={376} width={44} height={12} rx={5} fill={KRP.white} stroke={C4.ink} strokeWidth={2.6} />
    <rect x={700} y={378} width={30} height={10} rx={4} fill={KRP.white} stroke={C4.ink} strokeWidth={2.4} />
    {/* 板床 */}
    <PlankFloor y={700} k={k} />
  </g>
);

// ===================================================================
// 板床 (板目・継ぎ目・影)
// ===================================================================
export const PlankFloor: React.FC<{ y?: number; k?: number; op?: number }> = ({
  y = 700, k = 0, op = 1,
}) => (
  <g opacity={op}>
    <rect x={0} y={y} width={1920} height={1080 - y} fill={C4.wood} />
    {/* 板の継ぎ目 (奥行きに合わせて間隔を広げる) */}
    {[...Array(8)].map((_, r) => {
      const ly = y + 14 + r * r * 6 + r * 18;
      if (ly > 1072) return null;
      return (
        <line key={`pf${r}`} x1={0} y1={ly} x2={1920} y2={ly} stroke={C4.woodDark} strokeWidth={3} opacity={0.55} />
      );
    })}
    {/* 縦の木口 */}
    {[...Array(7)].map((_, i) => {
      const lx = 120 + i * 280;
      return (
        <line key={`pv${i}`} x1={lx} y1={y} x2={lx + (lx - 960) * 0.3} y2={1080} stroke={C4.woodDark} strokeWidth={2.4} opacity={0.35} />
      );
    })}
    {/* 板目 */}
    {[...Array(14)].map((_, i) => (
      <path
        key={`gr${i}`}
        d={`M ${rnd(i * 13 + k * 7) * 1900} ${y + 20 + rnd(i * 5 + k) * (1020 - y)} q 90 ${rnd(i * 3) * 10 - 5} 180 0`}
        stroke={C4.woodDark}
        strokeWidth={2}
        fill="none"
        opacity={0.3}
      />
    ))}
    <rect x={0} y={1012} width={1920} height={68} fill={C4.ink} opacity={0.08} />
    <line x1={0} y1={y} x2={1920} y2={y} stroke={C4.ink} strokeWidth={3.4} opacity={0.5} />
  </g>
);

// ===================================================================
// 木机 (インク壺と羽ペンつき)
// ===================================================================
export const WoodDesk: React.FC<{
  x: number; y: number; w: number; h?: number; ink?: boolean; quill?: boolean;
}> = ({ x, y, w, h = 120, ink = false, quill = false }) => (
  <g>
    <ellipse cx={x + w / 2} cy={y + h + 18} rx={w * 0.52} ry={18} fill={C4.ink} opacity={0.14} />
    {/* 天板 */}
    <rect x={x} y={y} width={w} height={26} rx={6} fill={C4.woodLight} stroke={C4.ink} strokeWidth={5} />
    <rect x={x + 8} y={y + 26} width={w - 16} height={14} fill={C4.woodDark} stroke={C4.ink} strokeWidth={3.4} />
    {/* 木目 */}
    {[0, 1, 2].map((i) => (
      <line key={`dg${i}`} x1={x + 16} y1={y + 7 + i * 7} x2={x + w - 16} y2={y + 7 + i * 7} stroke={C4.woodDark} strokeWidth={2} opacity={0.35} />
    ))}
    {/* 脚 */}
    <rect x={x + 26} y={y + 40} width={24} height={h - 40} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4} />
    <rect x={x + w - 50} y={y + 40} width={24} height={h - 40} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4} />
    <rect x={x + 40} y={y + h - 34} width={w - 80} height={12} fill={C4.woodDark} stroke={C4.ink} strokeWidth={3.4} />
    {ink && (
      <g>
        <ellipse cx={x + w - 96} cy={y - 6} rx={26} ry={10} fill={C4.sumi} stroke={C4.ink} strokeWidth={3.4} />
        <path d={`M ${x + w - 122} ${y - 6} L ${x + w - 116} ${y - 36} L ${x + w - 76} ${y - 36} L ${x + w - 70} ${y - 6} Z`} fill={C4.glass} stroke={C4.ink} strokeWidth={4} />
        <ellipse cx={x + w - 96} cy={y - 34} rx={20} ry={7} fill={C4.sumi} stroke={C4.ink} strokeWidth={3} />
      </g>
    )}
    {quill && (
      <g transform={`translate(${x + w - 96} ${y - 36}) rotate(22)`}>
        <path d="M 0 0 L 8 -110" stroke={C4.ink} strokeWidth={4} />
        <path d="M 8 -110 Q 44 -86 16 -40 Q 6 -60 0 -30 Z" fill={KRP.white} stroke={C4.ink} strokeWidth={3.4} />
      </g>
    )}
  </g>
);

// ===================================================================
// 規則集 (開いた分厚い本。方眼を頁に clip する)
// ===================================================================
export const RuleBook: React.FC<{
  cx: number; cy: number; w: number; h: number; idk: string; f: number;
  grid?: boolean; children?: React.ReactNode;
}> = ({ cx, cy, w, h, idk, f, grid = true, children }) => {
  const hw = w / 2;
  const hh = h / 2;
  return (
    <g>
      {/* 本の影 */}
      <ellipse cx={cx} cy={cy + hh + 30} rx={hw * 1.04} ry={26} fill={C4.ink} opacity={0.16} />
      {/* 背後の小口 (分厚さ) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={`eg${i}`}
          d={`M ${cx - hw - 6 + i * 2} ${cy + hh - i * 6} Q ${cx} ${cy + hh + 22 - i * 6} ${cx + hw + 6 - i * 2} ${cy + hh - i * 6}`}
          stroke={C4.paperShade}
          strokeWidth={5}
          fill="none"
          opacity={0.9}
        />
      ))}
      {/* 表紙の縁 */}
      <path
        d={`M ${cx - hw - 14} ${cy - hh + 10} Q ${cx} ${cy - hh - 16} ${cx + hw + 14} ${cy - hh + 10} L ${cx + hw + 14} ${cy + hh + 6} Q ${cx} ${cy + hh + 30} ${cx - hw - 14} ${cy + hh + 6} Z`}
        fill={C4.redDeep}
        stroke={C4.ink}
        strokeWidth={5.5}
      />
      {/* 両頁 */}
      <clipPath id={`ib4rb${idk}`}>
        <path
          d={`M ${cx - hw} ${cy - hh + 14} Q ${cx} ${cy - hh - 8} ${cx + hw} ${cy - hh + 14} L ${cx + hw} ${cy + hh} Q ${cx} ${cy + hh + 22} ${cx - hw} ${cy + hh} Z`}
        />
      </clipPath>
      <path
        d={`M ${cx - hw} ${cy - hh + 14} Q ${cx} ${cy - hh - 8} ${cx + hw} ${cy - hh + 14} L ${cx + hw} ${cy + hh} Q ${cx} ${cy + hh + 22} ${cx - hw} ${cy + hh} Z`}
        fill={C4.paper}
        stroke={C4.ink}
        strokeWidth={4.5}
      />
      {grid && (
        <g clipPath={`url(#ib4rb${idk})`} opacity={0.12}>
          <GridPaper pitch={48} opacity={1} tombo={false} />
        </g>
      )}
      <g clipPath={`url(#ib4rb${idk})`}>
        {/* 頁の陰 (綴じ目の近く) */}
        <ellipse cx={cx} cy={cy} rx={56} ry={hh} fill={C4.paperShade} opacity={0.45} />
        {children}
      </g>
      {/* 綴じ目 */}
      <path d={`M ${cx} ${cy - hh + 6} Q ${cx + 8} ${cy} ${cx} ${cy + hh + 14}`} stroke={C4.ink} strokeWidth={4} fill="none" opacity={0.6} />
      {/* 栞紐 */}
      <path
        d={`M ${cx + 4} ${cy + hh + 6} q ${6} ${40 + Math.sin(f / 13) * 5} ${-10} ${74}`}
        stroke={C4.red}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
};

// ===================================================================
// 輪転機 (回る胴・ベルト・歯車・刷り上がる紙)
// ===================================================================
export const RotaryPress: React.FC<{ x: number; y: number; s?: number; f: number }> = ({
  x, y, s = 1, f,
}) => {
  const spin = f * 5.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 台座 */}
      <rect x={-320} y={160} width={640} height={60} rx={8} fill={C4.ironDark} stroke={C4.ink} strokeWidth={5} />
      {/* 枠 */}
      <rect x={-290} y={-220} width={580} height={386} rx={12} fill={C4.iron} stroke={C4.ink} strokeWidth={5.5} />
      <rect x={-250} y={-180} width={500} height={310} rx={8} fill={C4.ironDark} stroke={C4.ink} strokeWidth={4} opacity={0.8} />
      {/* 大胴 (回る) */}
      <g transform={`translate(-110 -30) rotate(${spin})`}>
        <circle cx={0} cy={0} r={118} fill={C4.iron} stroke={C4.ink} strokeWidth={5.5} />
        <circle cx={0} cy={0} r={86} fill={C4.ironDark} stroke={C4.ink} strokeWidth={4} />
        {[...Array(8)].map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line key={`sk${i}`} x1={Math.cos(a) * 24} y1={Math.sin(a) * 24} x2={Math.cos(a) * 82} y2={Math.sin(a) * 82} stroke={C4.ink} strokeWidth={4} opacity={0.7} />
          );
        })}
        <circle cx={0} cy={0} r={18} fill={C4.gold} stroke={C4.ink} strokeWidth={4} />
      </g>
      {/* 小胴 */}
      <g transform={`translate(110 -70) rotate(${-spin * 1.6})`}>
        <circle cx={0} cy={0} r={72} fill={C4.iron} stroke={C4.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={48} fill={C4.ironDark} stroke={C4.ink} strokeWidth={3.6} />
        {[...Array(6)].map((_, i) => {
          const a = (i * Math.PI) / 3;
          return (
            <line key={`sm${i}`} x1={0} y1={0} x2={Math.cos(a) * 46} y2={Math.sin(a) * 46} stroke={C4.ink} strokeWidth={3.4} opacity={0.6} />
          );
        })}
      </g>
      {/* 歯車 */}
      <g transform={`translate(132 70) rotate(${spin * 2})`}>
        <circle cx={0} cy={0} r={40} fill={C4.gold} stroke={C4.ink} strokeWidth={4.5} />
        {[...Array(10)].map((_, i) => {
          const a = (i * Math.PI) / 5;
          return (
            <rect
              key={`gt${i}`}
              x={-7}
              y={-52}
              width={14}
              height={16}
              fill={C4.gold}
              stroke={C4.ink}
              strokeWidth={3}
              transform={`rotate(${(a * 180) / Math.PI})`}
            />
          );
        })}
        <circle cx={0} cy={0} r={11} fill={C4.ironDark} stroke={C4.ink} strokeWidth={3} />
      </g>
      {/* ベルト */}
      <path d="M -110 -148 L 110 -142 M -110 88 L 110 -2" stroke={C4.oil} strokeWidth={10} fill="none" opacity={0.85} />
      {/* 油染み */}
      {[...Array(5)].map((_, i) => (
        <ellipse key={`ol${i}`} cx={-240 + rnd(i * 13) * 520} cy={190 + rnd(i * 7) * 22} rx={20 + rnd(i * 5) * 24} ry={7} fill={C4.oil} opacity={0.4} />
      ))}
      {/* 刷り上がる紙 (右へ出る) */}
      {[...Array(5)].map((_, i) => {
        const t = ((f + i * 8) % 40) / 40;
        return (
          <g key={`ps${i}`} transform={`translate(${290 + t * 180} ${-90 + t * 40}) rotate(${-8 + t * 18})`} opacity={1 - t * 0.3}>
            <rect x={0} y={0} width={110} height={74} fill={C4.paper} stroke={C4.ink} strokeWidth={3.4} />
            <rect x={8} y={8} width={94} height={10} fill={C4.sumi} opacity={0.6} />
            {[0, 1, 2, 3].map((j) => (
              <rect key={`pl${j}`} x={8} y={26 + j * 11} width={70 + rnd(i * 3 + j) * 24} height={4} fill={C4.sumi} opacity={0.4} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ===================================================================
// 土俵の輪 (序#15・第2章#47・第3章#59 と同じ描き方)
// ===================================================================
export const DohyoRing: React.FC<{
  cx: number; cy: number; r: number; color: string;
  dash?: boolean; sw?: number; op?: number;
}> = ({ cx, cy, r, color, dash = false, sw = 7, op = 1 }) => (
  <circle
    cx={cx}
    cy={cy}
    r={r}
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeDasharray={dash ? "16 14" : undefined}
    opacity={op}
  />
);

// ===================================================================
// 机に広げた地図 (文鎮・筆・方眼を地図に clip)
// ===================================================================
export const MapDesk: React.FC<{
  f: number; idk: string;
  px?: number; py?: number; pw?: number; ph?: number;
  grid?: boolean; children?: React.ReactNode;
}> = ({ f, idk, px = 150, py = 196, pw = 1620, ph = 568, grid = true, children }) => (
  <g>
    {/* 奥の壁 */}
    <rect x={0} y={0} width={1920} height={760} fill={C4.stone} />
    {[...Array(8)].map((_, i) => (
      <ellipse key={`mw${i}`} cx={rnd(i * 13 + 5) * 1900} cy={40 + rnd(i * 7) * 600} rx={70 + rnd(i * 5) * 60} ry={30 + rnd(i * 3) * 28} fill={C4.stoneShade} opacity={0.26} />
    ))}
    {/* 奥の書棚 */}
    <g opacity={0.5}>
      <rect x={1560} y={60} width={320} height={430} fill={C4.woodDark} stroke={C4.ink} strokeWidth={4.5} />
      {[0, 1, 2].map((r) => (
        <g key={`sh${r}`}>
          <rect x={1572} y={76 + r * 140} width={296} height={126} fill={C4.wood} opacity={0.5} />
          {[...Array(7)].map((_, i) => (
            <rect
              key={`bk${r}_${i}`}
              x={1584 + i * 40}
              y={96 + r * 140 + rnd(i * 7 + r) * 14}
              width={28}
              height={96 - rnd(i * 3 + r) * 20}
              fill={i % 3 === 0 ? C4.redDeep : i % 3 === 1 ? C4.leafDark : C4.sumi}
              stroke={C4.ink}
              strokeWidth={2.6}
            />
          ))}
        </g>
      ))}
    </g>
    {/* 腰板 */}
    <rect x={0} y={600} width={1920} height={160} fill={C4.wood} stroke={C4.ink} strokeWidth={4} />
    {[...Array(11)].map((_, i) => (
      <line key={`mp${i}`} x1={i * 178} y1={600} x2={i * 178} y2={760} stroke={C4.woodDark} strokeWidth={3} opacity={0.45} />
    ))}
    {/* 机の天板 (画面いっぱい) */}
    <rect x={0} y={760} width={1920} height={320} fill={C4.woodLight} />
    {[...Array(9)].map((_, i) => (
      <line key={`dt${i}`} x1={0} y1={776 + i * 34} x2={1920} y2={776 + i * 34} stroke={C4.woodDark} strokeWidth={2.4} opacity={0.3} />
    ))}
    <line x1={0} y1={760} x2={1920} y2={760} stroke={C4.ink} strokeWidth={4.5} />
    {/* 地図の紙 */}
    <ellipse cx={px + pw / 2} cy={py + ph + 26} rx={pw * 0.5} ry={24} fill={C4.ink} opacity={0.14} />
    <clipPath id={`ib4md${idk}`}>
      <rect x={px} y={py} width={pw} height={ph} rx={6} />
    </clipPath>
    <rect x={px} y={py} width={pw} height={ph} rx={6} fill={C4.paper} stroke={C4.ink} strokeWidth={5} />
    {grid && (
      <g clipPath={`url(#ib4md${idk})`} opacity={0.11}>
        <GridPaper pitch={52} opacity={1} tombo={false} />
      </g>
    )}
    <g clipPath={`url(#ib4md${idk})`}>{children}</g>
    {/* 紙の縁の折れ */}
    <path d={`M ${px} ${py + ph} L ${px + 44} ${py + ph} L ${px} ${py + ph - 44} Z`} fill={C4.paperDark} stroke={C4.ink} strokeWidth={3.4} />
    {/* 文鎮 ×2 */}
    {[[px + 60, py + 16], [px + pw - 130, py + ph - 34]].map(([bx, by], i) => (
      <g key={`bz${i}`}>
        <rect x={bx} y={by} width={70} height={24} rx={8} fill={C4.ironDark} stroke={C4.ink} strokeWidth={4} />
        <rect x={bx + 8} y={by + 4} width={54} height={6} rx={3} fill={KRP.white} opacity={0.3} />
      </g>
    ))}
    {/* 筆 */}
    <g transform={`translate(1700 886) rotate(-16)`}>
      <rect x={-10} y={-120} width={20} height={190} rx={9} fill={C4.wood} stroke={C4.ink} strokeWidth={4} />
      <path d="M -10 70 Q 0 112 10 70 Z" fill={C4.sumi} stroke={C4.ink} strokeWidth={3.4} />
      <rect x={-12} y={56} width={24} height={14} rx={5} fill={C4.gold} stroke={C4.ink} strokeWidth={3} />
    </g>
    {/* 動く光 */}
    <ellipse
      cx={760 + Math.sin(f / 31) * 120}
      cy={py + ph * 0.4}
      rx={420}
      ry={210}
      fill={C4.skyWarm}
      opacity={0.1}
    />
  </g>
);

export { PersonMini, lerp };
