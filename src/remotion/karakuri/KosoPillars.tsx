// =====================================================================
// 「なぜ高層ビルは生まれたのか」 5本柱の装置 (この回いちばんの共通部品)
//
// 作者の指定:
//   「タワマン群があるけどその下に5本ぐらいの柱(今回の要素たち)があって
//     成り立ってるということ。その柱を一本一本抜いていきグラグラする
//     ようすとその柱はどうやってできたのかってことを表現したいね」
//
// 柱5本 = 骨 / 箱 / 水 / 灯り / 空気 (ぜんぶ技術)
// 地面   = 欲・地価 (第5章。柱ではなく、柱が立つ地面)
//
// 序  : 5本を1本ずつ抜く → 最後は空中 (文#11〜#24)
// 1〜4章: 1本ずつ立て直す (各章の終わりで PillarStand)
// 5章 : 柱は揃った。では地面は? (GroundReveal)
// 結  : 電気の柱を抜くと水の柱も一緒に倒れる (連鎖倒壊)
//
// ★この装置を使うシーンは、必ずここから import する。描き直し禁止。
//
// ★ただし「装置」だけがここに在る。背景はここに置かない。
//   この装置を出すシーンでも、背景・空・地面・カメラの寄り引き・まわりの小物は
//   1文ごとに別に作る (制作ガイド §7 第3層-6)。
//   同じ絵が2回出たら、それは手抜き。
//
// ★傾きの決まり (ここを勝手に変えない)
//   街は「残っている柱の上端」を軸に、支えきれない側へ傾く。
//   - 街の重心(x=960)が、残った柱の内側にある → 傾かない。少し寄るだけ。
//   - 重心が、残った柱の外へはみ出した → その側へ倒れる (最大9度)。
//   - 抜いている途中は、柱が座から外れるまで荷重を支えている。
//     外れた瞬間にガクッと来て、そのあとは新しい傾きで落ち着く。
//   - 柱ぜんぶ無し (float=1) は、揺らさずに止める = 「空中にある」。
//   ぶるぶる震わせない。画面から飛び出させない。
// =====================================================================

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, KARAKURI_FONT, WobbleDefs, Atmosphere, LabelPill,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";

const W = 1920;
const H = 1080;
const FONT = KARAKURI_FONT;

// 柱ごとの色 (この5色は全編を通して変えない。視聴者が色で柱を覚えるため)
export const KPP = {
  hone: "#8A94A0",      // 骨 = 鉄骨の青灰
  honeDark: "#6B7480",
  hako: "#C98A3C",      // 箱 = エレベーターのかごの真鍮色
  hakoDark: "#A66E28",
  mizu: "#5E93C4",      // 水 = 青
  mizuDark: "#44739E",
  akari: "#E0B63C",     // 灯り = 黄
  akariDark: "#BE9622",
  kuuki: "#86B394",     // 空気 = 緑
  kuukiDark: "#688F75",
  // 地面 (欲・地価)
  ground: "#C8A86E",
  groundDark: "#A3864F",
  bedrock: "#9C968A",
  // 建物
  towerFace: "#DDE4EA",
  towerSide: "#BCC6CF",
  glass: "#AFC9DC",
  sky: "#DCE8F2",
  dust: "#D8D2C4",
} as const;

export type PillarId = "hone" | "hako" | "mizu" | "akari" | "kuuki";

export const PILLAR_ORDER: PillarId[] = ["hone", "hako", "mizu", "akari", "kuuki"];

export const PILLAR_META: Record<PillarId, { label: string; color: string; dark: string; sub: string }> = {
  hone:  { label: "骨",   color: KPP.hone,  dark: KPP.honeDark,  sub: "鉄の骨組み" },
  hako:  { label: "箱",   color: KPP.hako,  dark: KPP.hakoDark,  sub: "エレベーター" },
  mizu:  { label: "水",   color: KPP.mizu,  dark: KPP.mizuDark,  sub: "ポンプと水槽" },
  akari: { label: "灯り", color: KPP.akari, dark: KPP.akariDark, sub: "電気" },
  kuuki: { label: "空気", color: KPP.kuuki, dark: KPP.kuukiDark, sub: "換気と空調" },
};

// 柱の配置 (この座標は固定。シーンごとに動かさない)
export const PILLAR_X: Record<PillarId, number> = {
  hone: 380, hako: 670, mizu: 960, akari: 1250, kuuki: 1540,
};
export const PILLAR_W = 124;
export const SLAB_Y = 520;        // 街のスラブの上端
export const PILLAR_TOP = 552;    // 柱の上端 (= スラブの下端)
export const PILLAR_BOTTOM = 824; // 柱の下端 (= 地面の上端。下に名札と地面の文字が入る)
export const PILLAR_H = PILLAR_BOTTOM - PILLAR_TOP;

// =====================================================================
// 柱1本 ( 中身の模様が柱ごとに違う = 「どの柱か」が一目で分かる )
// =====================================================================
export const Pillar: React.FC<{
  id: PillarId;
  x?: number;          // 省略すると定位置
  top?: number;
  h?: number;
  w?: number;
  f?: number;
  label?: boolean;     // 下に名札を出すか
  sub?: boolean;       // 名札の下に小さい説明を出すか
  out?: number;        // 0=定位置, 1=抜けきった (横へ滑り出て消える)
  outDir?: -1 | 1;     // 抜ける向き
  fallen?: number;     // 0=立っている, 1=倒れた (根元で回転)
  glow?: number;       // 0〜1 立ったばかりの光
  dim?: number;        // 0〜1 灰色に沈める (まだ無い柱)
}> = ({
  id, x, top = PILLAR_TOP, h = PILLAR_H, w = PILLAR_W, f = 0,
  label = true, sub = false, out = 0, outDir = 1, fallen = 0, glow = 0, dim = 0,
}) => {
  const m = PILLAR_META[id];
  const cx = x ?? PILLAR_X[id];
  const o = clamp01(out);
  const fa = clamp01(fallen);
  if (o >= 1) return null;

  // 抜けるとき: 横へ少し滑り出し、荷重が抜けたぶん沈み、少し傾いて消える。
  // 大きく飛び出させない (隣の柱の場所を横切らない。画面からも出さない)。
  // 前半 = 座から横へ引き抜かれる / 後半 = 支えを失って外へ倒れ込み、消える。
  const eo = easeOut(o);
  const o2 = clamp01((o - 0.45) / 0.55);
  const slide = eo * 120 * outDir;
  const drop = o2 * o2 * 54;
  const outTilt = o2 * 34 * outDir;
  const alpha = clamp01(1 - o / 0.88);
  const rot = fa * 78 * outDir;            // 根元を軸に倒れる
  const base = top + h;                     // 根元のy
  const col = dim > 0 ? KRP.gray : m.color;
  const colD = dim > 0 ? KRP.grayDark : m.dark;

  return (
    <g opacity={alpha * (1 - dim * 0.55)}>
      <g transform={`translate(${slide} ${drop}) rotate(${outTilt} ${cx} ${base}) rotate(${rot} ${cx} ${base})`}>
        {/* 立ったばかりの光 */}
        {glow > 0 && (
          <rect x={cx - w / 2 - 16} y={top - 16} width={w + 32} height={h + 32} rx={14}
            fill={m.color} opacity={0.3 * clamp01(glow)} />
        )}
        {/* 柱の本体 (影の柱は破線 = 「ここに柱が要る」) */}
        <rect x={cx - w / 2} y={top} width={w} height={h} rx={6}
          fill={col} stroke={KRP.ink} strokeWidth={dim > 0 ? 5 : 6}
          strokeDasharray={dim > 0 ? "18 14" : undefined}
          opacity={dim > 0 ? 0.5 : 1} />
        {/* 右側の陰 (立体感) */}
        {dim <= 0 && (
          <rect x={cx + w / 2 - 22} y={top} width={22} height={h}
            fill={colD} opacity={0.75} />
        )}
        {/* 中身の模様 */}
        <g clipPath="none">
          <PillarGuts id={id} cx={cx} top={top} h={h} w={w} f={f} dim={dim > 0} />
        </g>
        {/* 上端の座 (スラブを受ける皿)。影の柱はまだ据わっていないので描かない */}
        {dim <= 0 && (
          <rect x={cx - w / 2 - 14} y={top - 18} width={w + 28} height={20} rx={5}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        )}
        {/* 下端の台 */}
        <rect x={cx - w / 2 - 14} y={base - 2} width={w + 28} height={22} rx={5}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5}
          opacity={dim > 0 ? 0.45 : 1} />
      </g>
      {/* 名札 (倒れても地面に残る) */}
      {label && (
        <g>
          <rect x={cx - 62} y={base + 34} width={124} height={54} rx={9}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <text x={cx} y={base + 72} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={38} fill={dim > 0 ? KRP.grayDark : KRP.ink}>{m.label}</text>
          {sub && (
            <text x={cx} y={base + 116} textAnchor="middle" fontFamily={FONT}
              fontWeight={800} fontSize={23} fill={KRP.grayDark}>{m.sub}</text>
          )}
        </g>
      )}
    </g>
  );
};

// 柱の中身: 骨=トラス / 箱=かごと滑車 / 水=立管と水槽 / 灯り=電線と電球 / 空気=ダクト
const PillarGuts: React.FC<{
  id: PillarId; cx: number; top: number; h: number; w: number; f: number; dim?: boolean;
}> = ({ id, cx, top, h, w, f, dim }) => {
  const ink = KRP.ink;
  const lw = 4.5;
  const n = 6; // 段数
  const step = h / n;

  if (id === "hone") {
    // 鉄骨トラス: たすき掛けのブレース
    return (
      <g stroke={ink} strokeWidth={lw} opacity={dim ? 0.3 : 0.75} fill="none" strokeLinecap="round">
        {Array.from({ length: n }, (_, i) => {
          const y0 = top + i * step;
          const y1 = y0 + step;
          return (
            <g key={i}>
              <line x1={cx - w / 2 + 12} y1={y0} x2={cx + w / 2 - 12} y2={y1} />
              <line x1={cx + w / 2 - 12} y1={y0} x2={cx - w / 2 + 12} y2={y1} />
              <line x1={cx - w / 2 + 8} y1={y1} x2={cx + w / 2 - 8} y2={y1} />
            </g>
          );
        })}
      </g>
    );
  }

  if (id === "hako") {
    // エレベーター: 井戸の縦穴 + 上下するかご + おもり
    const t = (Math.sin(f / 34) + 1) / 2;            // 0〜1
    const cageY = top + 26 + t * (h - 116);
    const wgtY = top + 26 + (1 - t) * (h - 116);
    return (
      <g opacity={dim ? 0.35 : 1}>
        {/* 昇降路 */}
        <rect x={cx - w / 2 + 14} y={top + 10} width={w - 28} height={h - 20}
          fill={KRP.white} opacity={0.45} stroke={ink} strokeWidth={3.5} />
        {/* ロープ */}
        <line x1={cx - 20} y1={top + 12} x2={cx - 20} y2={cageY} stroke={ink} strokeWidth={3} />
        <line x1={cx + 24} y1={top + 12} x2={cx + 24} y2={wgtY} stroke={ink} strokeWidth={3} />
        {/* 滑車 */}
        <circle cx={cx + 2} cy={top + 12} r={16} fill={KRP.silver} stroke={ink} strokeWidth={4} />
        {/* かご */}
        <rect x={cx - 44} y={cageY} width={48} height={56} rx={4}
          fill={KRP.white} stroke={ink} strokeWidth={5} />
        <line x1={cx - 20} y1={cageY + 6} x2={cx - 20} y2={cageY + 50} stroke={ink} strokeWidth={3} opacity={0.5} />
        {/* おもり */}
        <rect x={cx + 12} y={wgtY + 10} width={26} height={40} rx={3}
          fill={KRP.grayDark} stroke={ink} strokeWidth={4.5} />
      </g>
    );
  }

  if (id === "mizu") {
    // 立管 + 上の水槽 + 上向きの流れ
    const flow = (f / 4) % 40;
    return (
      <g opacity={dim ? 0.35 : 1}>
        {/* 屋上水槽 */}
        <rect x={cx - 40} y={top + 8} width={80} height={44} rx={6}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={cx - 34} y={top + 26} width={68} height={22} fill={KPP.mizuDark} opacity={0.6} />
        {/* 立管 */}
        <rect x={cx - 14} y={top + 50} width={28} height={h - 62}
          fill={KRP.white} opacity={0.92} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 上向きの流れ (三角) */}
        <g fill={KPP.mizuDark} opacity={0.85}>
          {Array.from({ length: 5 }, (_, i) => {
            const y = top + h - 24 - ((i * 40 + flow) % (h - 70));
            return <polygon key={i} points={`${cx},${y - 12} ${cx - 9},${y + 4} ${cx + 9},${y + 4}`} />;
          })}
        </g>
        {/* ポンプ (根元) */}
        <circle cx={cx} cy={top + h - 26} r={21} fill={KPP.mizuDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${f * 6} ${cx} ${top + h - 26})`} stroke={KRP.white} strokeWidth={5} strokeLinecap="round">
          <line x1={cx - 11} y1={top + h - 26} x2={cx + 11} y2={top + h - 26} />
          <line x1={cx} y1={top + h - 37} x2={cx} y2={top + h - 15} />
        </g>
      </g>
    );
  }

  if (id === "akari") {
    // 電線 + 等間隔の電球 (ゆっくり明滅)
    return (
      <g opacity={dim ? 0.35 : 1}>
        <line x1={cx} y1={top + 10} x2={cx} y2={top + h - 10}
          stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, i) => {
          const y = top + 34 + i * ((h - 70) / 4);
          const on = dim ? 0.2 : 0.55 + 0.45 * ((Math.sin(f / 19 + i) + 1) / 2);
          return (
            <g key={i}>
              {!dim && <circle cx={cx} cy={y} r={30} fill={KPP.akari} opacity={0.28 * on} />}
              <circle cx={cx} cy={y} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={cx} cy={y} r={8} fill={KPP.akari} opacity={on} />
            </g>
          );
        })}
      </g>
    );
  }

  // kuuki: ダクト (角の折れた帯) + 流れる矢印
  const ph = (f / 5) % 36;
  return (
    <g opacity={dim ? 0.35 : 1}>
      <rect x={cx - 30} y={top + 10} width={60} height={h - 20} rx={5}
        fill={KRP.white} opacity={0.55} stroke={KRP.ink} strokeWidth={4} />
      {/* ダクトの継ぎ目 */}
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.5}>
        {Array.from({ length: 5 }, (_, i) => {
          const y = top + 26 + i * ((h - 46) / 4);
          return <line key={i} x1={cx - 30} y1={y} x2={cx + 30} y2={y} />;
        })}
      </g>
      {/* 流れる矢印 (下→上) */}
      <g stroke={KPP.kuukiDark} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.95}>
        {Array.from({ length: 4 }, (_, i) => {
          const y = top + h - 20 - ((i * 50 + ph) % (h - 50));
          return (
            <g key={i}>
              <line x1={cx} y1={y + 16} x2={cx} y2={y - 8} />
              <polyline points={`${cx - 11},${y + 2} ${cx},${y - 10} ${cx + 11},${y + 2}`} />
            </g>
          );
        })}
      </g>
    </g>
  );
};

// =====================================================================
// タワマン1棟 / タワマン群
// =====================================================================
export const Tower: React.FC<{
  x: number; base: number; h: number; w: number; f?: number;
  lit?: number;        // 0〜1 窓の点灯率 (0 = 停電)
  night?: boolean;
  front?: boolean;     // 手前の棟 (濃く描く)
  seed?: number;
}> = ({ x, base, h, w, f = 0, lit = 1, night = false, front = true, seed = 3 }) => {
  const rows = Math.max(3, Math.round(h / 46));
  const cols = Math.max(2, Math.round(w / 40));
  const cw = (w - 22) / cols;
  const rh = (h - 40) / rows;
  const face = front ? KPP.towerFace : KPP.towerSide;
  return (
    <g>
      {/* 胴体 */}
      <rect x={x - w / 2} y={base - h} width={w} height={h}
        fill={face} stroke={KRP.ink} strokeWidth={front ? 6 : 4.5} />
      {/* 右の陰 */}
      <rect x={x + w / 2 - 16} y={base - h} width={16} height={h}
        fill={KPP.towerSide} opacity={0.8} />
      {/* 屋上の設備 (水槽と室外機) */}
      <rect x={x - w / 2 + 10} y={base - h - 22} width={w - 20} height={22}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={x - 16} y={base - h - 46} width={32} height={26} rx={4}
        fill={KPP.mizu} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
      {/* 窓 */}
      <g>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const k = (r * 7 + c * 13 + seed * 29) % 100;
            const on = k / 100 < lit;
            const wx = x - w / 2 + 11 + c * cw;
            const wy = base - h + 18 + r * rh;
            return (
              <rect key={`${r}-${c}`} x={wx} y={wy} width={cw - 7} height={rh - 9} rx={2}
                fill={on ? (night ? KPP.akari : KPP.glass) : KRP.grayDark}
                opacity={on ? (night ? 0.95 : 0.8) : 0.5}
                stroke={KRP.ink} strokeWidth={2.4} />
            );
          }),
        )}
      </g>
    </g>
  );
};

// タワマン群 (スラブの上に5棟)。スラブの上端 = y
export const TowerCluster: React.FC<{
  y?: number; f?: number; lit?: number; night?: boolean;
}> = ({ y = SLAB_Y, f = 0, lit = 1, night = false }) => (
  <g>
    {/* 奥の棟 */}
    <Tower x={520} base={y} h={296} w={150} f={f} lit={lit} night={night} front={false} seed={5} />
    <Tower x={1420} base={y} h={268} w={140} f={f} lit={lit} night={night} front={false} seed={9} />
    {/* 手前の棟 */}
    <Tower x={760} base={y} h={386} w={186} f={f} lit={lit} night={night} seed={2} />
    <Tower x={1180} base={y} h={340} w={170} f={f} lit={lit} night={night} seed={7} />
    <Tower x={972} base={y} h={430} w={200} f={f} lit={lit} night={night} seed={1} />
  </g>
);

// 街のスラブ (タワマン群を載せる板。これが柱に支えられている)
export const CitySlab: React.FC<{ y?: number; h?: number }> = ({ y = SLAB_Y, h = 32 }) => (
  <g>
    <rect x={180} y={y} width={1560} height={h} rx={6}
      fill={KPP.ground} stroke={KRP.ink} strokeWidth={6} />
    <rect x={180} y={y + h - 11} width={1560} height={11} fill={KPP.groundDark} opacity={0.8} />
  </g>
);

// =====================================================================
// 地面 (第5章: 欲・地価)
// =====================================================================
export const GroundBed: React.FC<{
  y?: number; f?: number; label?: string; t?: number; crack?: number;
}> = ({ y = PILLAR_BOTTOM + 20, f = 0, label, t = 1, crack = 0 }) => {
  const tt = clamp01(t);
  return (
    <g opacity={tt}>
      <rect x={-20} y={y} width={W + 40} height={H - y + 20}
        fill={KPP.ground} stroke={KRP.ink} strokeWidth={6} />
      {/* 地層 */}
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.35}>
        <line x1={-20} y1={y + 54} x2={W + 20} y2={y + 54} />
        <line x1={-20} y1={y + 104} x2={W + 20} y2={y + 104} />
      </g>
      <rect x={-20} y={y + 104} width={W + 40} height={H - y - 84} fill={KPP.bedrock} opacity={0.5} />
      {/* ひび (地面が足りない / 揺れる) */}
      {crack > 0 && (
        <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round" opacity={0.85 * clamp01(crack)} fill="none">
          <path d={`M 525 ${y} l 24 44 l -30 36 l 26 40`} />
          <path d={`M 1395 ${y} l -26 48 l 32 34 l -22 44`} />
          <path d={`M 815 ${y} l 18 36 l -22 30`} />
          <path d={`M 1105 ${y} l -20 40 l 26 28`} />
        </g>
      )}
      {label && (
        <g>
          <rect x={W / 2 - 230} y={y + 148} width={460} height={74} rx={12}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <text x={W / 2} y={y + 202} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={46} fill={KRP.ink}>{label}</text>
        </g>
      )}
    </g>
  );
};

// =====================================================================
// 装置ぜんたい: 柱の上にタワマン群。抜くとグラグラする。
// pulled: 抜けている柱 (0〜1で途中も表せる)。1本でも抜けると傾く。
// =====================================================================
export type PulledMap = Partial<Record<PillarId, number>>;

// 街の重心のx (タワマン群の真ん中)。この点を支点で支えられるかが勝負。
const CITY_CX = 960;
// 柱の並びの半幅 (380〜1540 の中心が960なので 580)
const SPAN_HALF = 580;

const TILT_LEAN_MAX = 2.6;    // 支持が片寄っただけの傾き (まだ倒れない)
const TILT_TOPPLE_MAX = 9;    // 重心が支点の外に出たときの傾き (ここで倒れる)
const SWAY_MAX = 1.5;         // 柱が減ったぶんの、ゆっくりした揺れ
const TILT_CLAMP = 11;        // これ以上は傾けない (画面から飛び出すので)

export const TowerOnPillars: React.FC<{
  f?: number;
  pulled?: PulledMap;          // 抜き具合
  dimmed?: PillarId[];         // 「まだ無い」柱 (灰色で置く)
  standing?: PillarId[];       // 「いま立った」柱 (光る)
  labels?: boolean;
  subs?: boolean;
  night?: boolean;
  lit?: number;
  ground?: boolean;            // 地面を描くか
  groundLabel?: string;
  groundCrack?: number;
  fallen?: PulledMap;          // 倒れかけ/倒れた柱 (0〜1)
  float?: number;              // 1 = 柱ぜんぶ無しで空中に浮いている
  slabY?: number;
  shake?: number;              // 追加のグラグラ (0〜1)。地震・台風用
  tiltScale?: number;          // 傾きの倍率。章末の「まだ足りない」は 0.25 くらいで示す
  // ★空と地面は、既定では描かない。シーンごとに作った背景の上に、この装置だけを置く。
  //   検品プレビューのような「装置だけ見たい」場面でだけ sky / ground を true にする。
  sky?: boolean;
}> = ({
  f = 0, pulled = {}, dimmed = [], standing = [], labels = true, subs = false,
  night = false, lit = 1, ground = false, groundLabel, groundCrack = 0,
  fallen = {}, float = 0, slabY = SLAB_Y, shake = 0, tiltScale = 1, sky = false,
}) => {
  // ===== 支持のモデル =====================================================
  // 柱1本の「効いている度合い」 s (1=効いている, 0=効いていない)。
  // 抜けかけ・倒れかけ・まだ無い(影) はぜんぶ s を下げる。
  //
  // ★抜いている途中は、まだ柱が荷重を受けている。
  //   柱が座から外れる (p≒0.55) までは支えたまま、そこから一気に力が抜ける。
  //   こうしないと、柱がまだそこに在るのに街が傾きはじめてしまう。
  const lose = (p: number) => {
    const t = clamp01((clamp01(p) - 0.55) / 0.45);
    return t * t * (3 - 2 * t);   // なめらかに 0→1
  };
  const g = (id: PillarId) => Math.max(
    lose(pulled[id] ?? 0), clamp01(fallen[id] ?? 0), dimmed.includes(id) ? 1 : 0);
  const sups = PILLAR_ORDER.map((id) => ({ x: PILLAR_X[id], s: clamp01(1 - g(id)) }));
  const live = sups.filter((p) => p.s > 0.02);
  const tot = sups.reduce((a, p) => a + p.s, 0);   // 効いている柱の合計 (0〜5)
  const fl = clamp01(float);

  // 支持の重心 (どこで支えているか)
  const xs = tot > 0.02
    ? sups.reduce((a, p) => a + p.s * p.x, 0) / tot
    : CITY_CX;

  // 支点の端 (いちばん外で効いている柱)。
  // 抜けかけの柱は s が減るにつれて「端」が内側の柱へ連続的に移る。
  const edgeOf = (side: "R" | "L") => {
    if (live.length === 0) return CITY_CX;
    const q = [...live].sort((a, b) => (side === "R" ? b.x - a.x : a.x - b.x));
    const a = q[0];
    const b = q[1];
    return b ? b.x + (a.x - b.x) * a.s : a.x;
  };
  const xR = edgeOf("R");
  const xL = edgeOf("L");

  // 重心が支点の外にはみ出した量。はみ出したら、その側へ倒れる。
  const overR = Math.max(0, CITY_CX - xR);
  const overL = Math.max(0, xL - CITY_CX);
  const tipRight = overR >= overL;
  const toppleT = easeOut(clamp01(Math.max(overR, overL) / 420));
  const topple = toppleT * TILT_TOPPLE_MAX * (tipRight ? 1 : -1);

  // はみ出す前の「片寄っただけ」の傾き (支持の重心が中心からずれているぶん)
  const lean = TILT_LEAN_MAX * Math.max(-1, Math.min(1, (CITY_CX - xs) / SPAN_HALF));

  // 柱が減ったぶんの、ゆっくりした揺れ (高い建物は実際にゆっくり揺れる)
  const swayAmp = ((5 - tot) / 5) * SWAY_MAX + shake * 1.4;
  const sway = (Math.sin(f / 40) * 0.75 + Math.sin(f / 17) * 0.25) * swayAmp;

  // 荷重が移る瞬間だけの衝撃 (移り終われば収まる。ずっと揺れ続けない)
  const impact = PILLAR_ORDER.reduce((a, id) => {
    const p = clamp01(pulled[id] ?? 0);
    if (p <= 0.4 || p >= 0.999) return a;
    return a + Math.sin(clamp01((p - 0.4) / 0.6) * Math.PI);
  }, 0);
  const jolt = Math.min(impact, 1) * Math.sin(f / 4.5) * 0.9;

  // ぜんぶ合わせた傾き。空中 (float) では凍らせる = 揺れない。
  const tilt = Math.max(-TILT_CLAMP, Math.min(TILT_CLAMP,
    (lean + topple + sway + jolt) * tiltScale * (1 - fl)));

  // 回る軸。倒れるときは支点の端、まだ倒れないうちは支持の重心。
  // どちらも柱の上端 (スラブとの接点) なので、街は柱から離れない。
  const pivotX = xs + (((tipRight ? xR : xL) - xs) * toppleT);
  const pivotY = slabY + 32;

  // 圧縮でわずかに沈むぶん (柱の座に食い込まない程度)
  const sink = Math.min(6, (5 - tot) * 1.1) * (1 - fl);

  return (
    <g>
      {/* 空 (検品用。本番のシーンでは、そのシーンの背景を別に描く) */}
      {sky && (
        <rect x={-20} y={-20} width={W + 40} height={H + 40}
          fill={night ? "#2B3A4E" : KPP.sky} opacity={night ? 0.55 : 0.4} />
      )}

      {/* 地面 */}
      {ground && <GroundBed y={PILLAR_BOTTOM + 20} f={f} label={groundLabel} crack={groundCrack} />}

      {/* 柱 */}
      {PILLAR_ORDER.map((id) => (
        <Pillar
          key={id} id={id} f={f} label={labels} sub={subs}
          out={pulled[id] ?? 0}
          fallen={fallen[id] ?? 0}
          outDir={PILLAR_X[id] < 960 ? -1 : 1}
          dim={dimmed.includes(id) ? 1 : 0}
          glow={standing.includes(id) ? (Math.sin(f / 9) + 1) / 2 : 0}
        />
      ))}

      {/* 浮いているときの足元の空白 (点線で「ここに何も無い」と示す) */}
      {fl > 0.01 && (
        <g opacity={fl}>
          <line x1={180} y1={PILLAR_BOTTOM + 20} x2={1740} y2={PILLAR_BOTTOM + 20}
            stroke={KRP.red} strokeWidth={6} strokeDasharray="22 18" />
        </g>
      )}

      {/* 街 (スラブ + タワマン群)
          残っている柱の上端を軸に、支えきれない側へ傾く。
          柱ぜんぶ無し (float=1) のときは、揺らさずに止める = 「空中にある」 */}
      <g transform={`translate(0 ${sink}) rotate(${tilt} ${pivotX} ${pivotY})`}>
        <TowerCluster y={slabY} f={f} lit={lit} night={night} />
        <CitySlab y={slabY} />
      </g>

      {/* 抜けた瞬間の砂ぼこり */}
      {PILLAR_ORDER.map((id) => {
        const p = clamp01(pulled[id] ?? 0);
        if (p <= 0.02 || p >= 0.9) return null;
        const o = Math.sin(p * Math.PI);
        const x = PILLAR_X[id];
        return (
          <g key={`d-${id}`} opacity={o * 0.8}>
            {[0, 1, 2, 3].map((i) => (
              <circle key={i}
                cx={x + (i - 1.5) * 34 + Math.sin(f / 6 + i) * 8}
                cy={PILLAR_BOTTOM - 10 - p * 36 - i * 10}
                r={16 + i * 5} fill={KPP.dust} stroke={KRP.ink} strokeWidth={3} opacity={0.75} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

// =====================================================================
// 柱5本を横一列に (章末の確認・第5章の「柱は5本立ちました」)
// done: チェックの付く柱
// =====================================================================
export const PillarRow: React.FC<{
  f?: number; done?: PillarId[]; top?: number; h?: number; subs?: boolean;
  checkT?: number;
}> = ({ f = 0, done = [], top = 400, h = 360, subs = true, checkT = 1 }) => (
  <g>
    {PILLAR_ORDER.map((id) => {
      const on = done.includes(id);
      return (
        <g key={id}>
          <Pillar id={id} f={f} top={top} h={h} label sub={subs}
            dim={on ? 0 : 1} glow={on ? 0.35 : 0} />
          {on && <CheckMark x={PILLAR_X[id] + 68} y={top - 36} t={checkT} />}
        </g>
      );
    })}
  </g>
);

// チェック印
export const CheckMark: React.FC<{ x: number; y: number; s?: number; t?: number }> =
  ({ x, y, s = 1, t = 1 }) => {
    const sc = pop(clamp01(t)) * s;
    if (sc <= 0) return null;
    return (
      <g transform={`translate(${x} ${y}) scale(${sc})`}>
        <circle cx={0} cy={0} r={30} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
        <polyline points="-14,2 -4,13 15,-11" fill="none" stroke={KRP.white}
          strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };

// =====================================================================
// 柱1本の寄り (章の中で「この柱はどうやってできたのか」に入る合図)
// =====================================================================
export const PillarCloseup: React.FC<{
  id: PillarId; f?: number; t?: number; title?: string;
}> = ({ id, f = 0, t = 1, title }) => {
  const m = PILLAR_META[id];
  const sc = 0.7 + easeOut(clamp01(t)) * 0.3;
  return (
    <g>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={m.color} opacity={0.12} />
      <g transform={`translate(960 540) scale(${sc}) translate(-960 -540)`}>
        <Pillar id={id} f={f} x={620} top={200} h={680} w={210} label={false} />
      </g>
      {/* 右に名前と説明 */}
      <g>
        <rect x={900} y={400} width={620} height={200} rx={14}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={940} y={492} fontFamily={FONT} fontWeight={900} fontSize={82} fill={KRP.ink}>
          {m.label}
        </text>
        <text x={940} y={556} fontFamily={FONT} fontWeight={800} fontSize={38} fill={KRP.grayDark}>
          {title ?? m.sub}
        </text>
      </g>
    </g>
  );
};

// =====================================================================
// 連鎖倒壊 (結: 電気の柱を抜くと水の柱も一緒に倒れる)
// phase: 0=5本立っている → 0.5=灯りが抜ける → 1=水も倒れる
// =====================================================================
export const PillarChainFall: React.FC<{ f?: number; phase?: number }> = ({ f = 0, phase = 0 }) => {
  const p = clamp01(phase);
  const pullAkari = clamp01(p / 0.45);
  const fallMizu = clamp01((p - 0.45) / 0.55);
  return (
    <g>
      <TowerOnPillars
        f={f}
        pulled={{ akari: pullAkari }}
        fallen={{ mizu: fallMizu }}
        lit={1 - pullAkari * 0.85}
        night
        shake={fallMizu * 0.5}
       sky ground />
      {/* つながりの線 (灯りが抜けたから水も倒れる) */}
      {fallMizu > 0.02 && (
        <path
          d={`M ${PILLAR_X.akari} ${PILLAR_TOP + 60} Q ${(PILLAR_X.akari + PILLAR_X.mizu) / 2} ${PILLAR_TOP - 60} ${PILLAR_X.mizu} ${PILLAR_TOP + 60}`}
          fill="none" stroke={KRP.red} strokeWidth={7} strokeDasharray="16 12"
          opacity={0.9 * fallMizu} />
      )}
    </g>
  );
};

// =====================================================================
// 検品用プレビュー (憲法第3層: 部品を先に見る)
// =====================================================================
const PV = [
  "柱5本 + タワマン群 (完成形)",
  "空気を抜く",
  "空気と箱を抜く",
  "空気・箱・水を抜く",
  "灯りも抜く",
  "骨も抜く = 空中",
  "骨だけ立った (第1章の終わり)",
  "骨と箱 (第2章の終わり)",
  "骨・箱・水 (第3章の終わり)",
  "5本ぜんぶ (第4章の終わり)",
  "柱は揃った。地面が要る (第5章)",
  "地面が足りない (ひび)",
  "柱1本の寄り: 骨",
  "柱1本の寄り: 箱",
  "柱1本の寄り: 水",
  "柱1本の寄り: 灯り",
  "柱1本の寄り: 空気",
  "連鎖倒壊 (結)",
] as const;

export const KOSO_PILLARS_PREVIEW_FRAMES = PV.length * 150;

export const KosoPillarsPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / 150), PV.length - 1);
  const f = frame % 150;
  const all: PillarId[] = PILLAR_ORDER;

  const body = (() => {
    switch (i) {
      case 0: return <TowerOnPillars f={f} subs  sky ground />;
      case 1: return <TowerOnPillars f={f} pulled={{ kuuki: seg(f, 10, 60) }}  sky ground />;
      case 2: return <TowerOnPillars f={f} pulled={{ kuuki: 1, hako: seg(f, 10, 60) }}  sky ground />;
      case 3: return <TowerOnPillars f={f} pulled={{ kuuki: 1, hako: 1, mizu: seg(f, 10, 60) }}  sky ground />;
      case 4: return <TowerOnPillars f={f} pulled={{ kuuki: 1, hako: 1, mizu: 1, akari: seg(f, 10, 60) }} lit={0.25} night  sky ground />;
      case 5: return <TowerOnPillars f={f} pulled={{ kuuki: 1, hako: 1, mizu: 1, akari: 1, hone: seg(f, 10, 60) }}
        lit={0.1} night float={seg(f, 50, 90)} ground={false}  sky />;
      // 章末は「まだ足りない」を少し傾けて示すだけ。倒壊させるのは序と結だけ。
      case 6: return <TowerOnPillars f={f} dimmed={["hako", "mizu", "akari", "kuuki"]} standing={["hone"]} tiltScale={0.22}  sky ground />;
      case 7: return <TowerOnPillars f={f} dimmed={["mizu", "akari", "kuuki"]} standing={["hako"]} tiltScale={0.28}  sky ground />;
      case 8: return <TowerOnPillars f={f} dimmed={["akari", "kuuki"]} standing={["mizu"]} tiltScale={0.4}  sky ground />;
      case 9: return <TowerOnPillars f={f} standing={["kuuki"]} subs  sky ground />;
      case 10: return <PillarRow f={f} done={all} checkT={seg(f, 20, 50)} />;
      case 11: return <TowerOnPillars f={f} groundCrack={seg(f, 10, 50)} groundLabel="欲" shake={0.4} sky ground />;
      case 12: return <PillarCloseup id="hone" f={f} t={seg(f, 0, 30)} />;
      case 13: return <PillarCloseup id="hako" f={f} t={seg(f, 0, 30)} />;
      case 14: return <PillarCloseup id="mizu" f={f} t={seg(f, 0, 30)} />;
      case 15: return <PillarCloseup id="akari" f={f} t={seg(f, 0, 30)} />;
      case 16: return <PillarCloseup id="kuuki" f={f} t={seg(f, 0, 30)} />;
      default: return <PillarChainFall f={f} phase={seg(f, 10, 130)} />;
    }
  })();

  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <WobbleDefs seed={11} />
        <g filter="url(#wobble)">{body}</g>
      </svg>
      <LabelPill x={24} y={16} text={`${i + 1}/${PV.length} ${PV[i]}`} size={28} />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};
