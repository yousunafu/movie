// 「なぜ高層ビルは生まれたのか」: 第6章「高いほど、安い部屋だった。」3 (1925年〜誰が払うか)
// 担当範囲: 台本 docs/koso-script-v7.txt の 240〜250行目 (文#239〜#249・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb6_ で始める。WobbleDefs の seed はこのファイルでは 872〜882 を使う。
// 設計書: docs/koso-ch6-design.md (1文ごとの「格」と絵の中身が決まっている)
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
  stone: "#E0D6C2",
  stoneDark: "#B6A88E",
  zinc: "#A9B0B4",
  zincDark: "#7B8488",
  amber: "#C9A06A",
  candle: "#F0C971",
  night: "#2B3A4A",
  nightPale: "#4C6076",
  gold: "#D9A93E",
  goldDark: "#9E7820",
  rain: "#8FA3B2",
  mudWater: "#6E7257",
  emerGreen: "#4FA06A",
  dark: "#39414B",
  nightDeep: "#1E2A38",   // 夜空のいちばん奥
  blueprint: "#2E5C84",   // 青焼きの地
  bpLine: "#E6EEF6",      // 青焼きの白い線
  bpLineSoft: "#9FC0DA",
  snow: "#CFE2EF",
  glow: "#FFE9A8",
};

// ===================================================================
// このファイルだけで使うローカル部品
// ===================================================================

/** 窓を並べた帯。lit=灯る割合 (0〜1)。n枚のうち前から順に灯る */
const WinRow: React.FC<{
  x: number; y: number; w: number; h: number; n: number; lit: number;
  gap?: number; dim?: string; seed?: number;
}> = ({ x, y, w, h, n, lit, gap = 8, dim = C.nightDeep, seed = 1 }) => {
  const cw = (w - gap * (n - 1)) / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const on = lit * n > i + 0.001;
        const flick = 0.82 + rnd(seed * 13 + i) * 0.18;
        return (
          <rect key={i} x={x + i * (cw + gap)} y={y} width={cw} height={h}
            fill={on ? C.candle : dim} opacity={on ? flick : 0.85}
            stroke={KRP.ink} strokeWidth={2.5} />
        );
      })}
    </g>
  );
};

/** 星。f でまたたく */
const Stars: React.FC<{ f: number; n?: number; seed?: number; yMax?: number }> = ({
  f, n = 34, seed = 7, yMax = 620,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const sx = rnd(seed + i * 3.1) * (W - 40) + 20;
      const sy = rnd(seed + i * 7.7) * yMax + 20;
      const r = 1.6 + rnd(seed + i * 2.3) * 2.6;
      const tw = 0.4 + 0.6 * (Math.sin(f / 7 + i * 1.9) * 0.5 + 0.5);
      return <circle key={i} cx={sx} cy={sy} r={r} fill={KRP.white} opacity={tw * 0.9} />;
    })}
  </g>
);

/** 遠景のビルの影。窓はごく小さく */
const FarSkyline: React.FC<{ f: number; yBase: number; seed?: number; n?: number }> = ({
  f, yBase, seed = 21, n = 9,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const bw = 110 + rnd(seed + i) * 130;
      const bx = -40 + i * ((W + 80) / n) + rnd(seed + i * 5) * 30;
      const bh = 150 + rnd(seed + i * 11) * 320;
      return (
        <g key={i}>
          <rect x={bx} y={yBase - bh} width={bw} height={bh}
            fill={C.dark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 4 }, (_, r2) => (
            <WinRow key={r2} x={bx + 12} y={yBase - bh + 26 + r2 * 46} w={bw - 24} h={22}
              n={Math.max(2, Math.round((bw - 24) / 34))}
              lit={rnd(seed + i * 31 + r2 * 3) * 0.7 + Math.sin(f / 23 + i) * 0.05}
              gap={6} seed={seed + i * 9 + r2} />
          ))}
        </g>
      );
    })}
  </g>
);

/** 価格の階段グラフ。★使うのは #244 の1枚だけ (#245/#246 は別の絵にした。同じ絵を続けない) */
const STAIR = {
  x0: 360, cell: 140, n: 10,
  axX: 300, yBot: 780, yTop: 280,
  pLo: 98, pHi: 122,
};
const stairY = (p: number) =>
  STAIR.yBot - (p - STAIR.pLo) * ((STAIR.yBot - STAIR.yTop) / (STAIR.pHi - STAIR.pLo));
const stairPrice = (n: number) => 100 + 2 * (n - 1);

const PriceStairs: React.FC<{ f: number; mode: 0 | 1 | 2 }> = ({ f, mode }) => {
  const { x0, cell, n, axX, yBot } = STAIR;
  const grow = easeOut(clamp01(seg(f, 4, 30)));           // 左から階段が伸びる
  const drop = easeOut(clamp01(seg(f, 12, 32)));          // #246 最上階が下がる
  const shown = grow * n;
  const topOf = (i: number) => {
    const base = stairY(stairPrice(i + 1));
    if (mode === 2 && i === n - 1) return lerp(base, stairY(110), drop);
    return base;
  };
  // 階段の輪郭 (伸びている分だけ)
  const pts: string[] = [`${x0},${yBot}`];
  for (let i = 0; i < n; i++) {
    const vis = clamp01(shown - i);
    if (vis <= 0) break;
    const xa = x0 + i * cell;
    const xb = xa + cell * vis;
    pts.push(`${xa},${topOf(i)}`, `${xb},${topOf(i)}`);
  }
  const last = pts[pts.length - 1].split(",");
  pts.push(`${last[0]},${yBot}`);
  const ticks = [98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122];
  return (
    <g>
      {/* 目盛りの横罫 */}
      <g stroke={BP.shaftDark} strokeWidth={2} opacity={0.35}>
        {ticks.map((p) => <line key={p} x1={axX} y1={stairY(p)} x2={1800} y2={stairY(p)} />)}
      </g>
      {/* 階段の面 */}
      <polygon points={pts.join(" ")} fill={C.gold} opacity={0.42} />
      <polyline points={pts.slice(1, -1).join(" ")} fill="none"
        stroke={KRP.ink} strokeWidth={9} strokeLinejoin="round" />
      {/* 各段の天板にハイライト */}
      {Array.from({ length: n }, (_, i) => {
        const vis = clamp01(shown - i);
        if (vis <= 0) return null;
        return (
          <rect key={i} x={x0 + i * cell + 6} y={topOf(i)} width={(cell - 12) * vis} height={12}
            fill={C.goldDark} opacity={0.75} />
        );
      })}
      {/* 縦軸 */}
      <line x1={axX} y1={yBot} x2={axX} y2={STAIR.yTop - 14} stroke={KRP.ink}
        strokeWidth={9} strokeLinecap="round" />
      {/* 軸の折れ (0からでない印) */}
      <g stroke={KRP.ink} strokeWidth={7} fill="none">
        <path d={`M${axX - 20},${yBot + 14} l20,-13 l-20,-13`} />
        <path d={`M${axX - 20},${yBot + 40} l20,-13 l-20,-13`} />
      </g>
      {ticks.map((p) => (
        <g key={`t${p}`}>
          <line x1={axX - 18} y1={stairY(p)} x2={axX} y2={stairY(p)}
            stroke={KRP.ink} strokeWidth={5} />
          {p % 4 === 2 && (
            <text x={axX - 28} y={stairY(p) + 11} textAnchor="end" fontFamily={FONT}
              fontWeight={800} fontSize={30} fill={KRP.ink}>{p}%</text>
          )}
        </g>
      ))}
      {/* 横軸 */}
      <line x1={axX} y1={yBot} x2={1800} y2={yBot} stroke={KRP.ink}
        strokeWidth={9} strokeLinecap="round" />
      {Array.from({ length: n }, (_, i) => (
        <g key={`x${i}`}>
          <line x1={x0 + i * cell} y1={yBot} x2={x0 + i * cell} y2={yBot + 16}
            stroke={KRP.ink} strokeWidth={5} />
          <text x={x0 + i * cell + cell / 2} y={yBot + 42} textAnchor="middle"
            fontFamily={FONT} fontWeight={800} fontSize={27} fill={KRP.ink}>{i + 1}階</text>
        </g>
      ))}
      <line x1={1800} y1={yBot} x2={1800} y2={yBot + 16} stroke={KRP.ink} strokeWidth={5} />
      <text x={212} y={STAIR.yTop - 30} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={34} fill={KRP.ink}>値段</text>
    </g>
  );
};

/** 人のピクトグラム (図の中の「人の側」) */
const PersonIcon: React.FC<{ x: number; y: number; s?: number; f?: number; ph?: number; fill?: string }> = ({
  x, y, s = 1, f = 0, ph = 0, fill = C.night,
}) => (
  <g transform={`translate(${x} ${y + Math.sin((f + ph * 13) / 12) * 4}) scale(${s})`}>
    <circle cx={0} cy={-128} r={34} fill={fill} stroke={KRP.ink} strokeWidth={5} />
    <path d="M-44,0 L-44,-62 Q-44,-96 0,-96 Q44,-96 44,-62 L44,0 Z"
      fill={fill} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// ===== #239 1925年、ニューヨークのあるビルの最上階。 =====
// 格: 山
// どこ: ニューヨークの夜景。手前の低い屋上から、アールデコのビルの頂部を見上げている
// 演出: 夜空・星・月・遠景のビル群。主役の塔は段々に後退するアールデコ。最上階の一段だけが金色に灯る
// 動き: 窓が下から順に灯る (f=8〜30) / 頂部の探照灯が左右に振れる / 航空障害灯が点滅 / 頂部へゆっくり寄る
// 絵: ★1925年のニューヨークの夜。ビルの最上階だけに明かりが灯る。アールデコの頂部・夜景・星・年号の札
const Kb6cN1925Ny: React.FC<{ f: number }> = ({ f }) => {
  const CX = 980;
  const lit = easeOut(clamp01(seg(f, 8, 30)));          // 最上階が灯る
  const low = easeOut(clamp01(seg(f, 2, 20))) * 0.35;   // 下の階はまばら
  const z = 1 + 0.06 * easeOut(clamp01(seg(f, 0, 42))); // 頂部へ寄る
  const beam = Math.sin(f / 17) * 20;
  const blink = (f % 24) < 12 ? 1 : 0.25;
  const crown = [0, 1, 2, 3, 4].map((k) => ({
    hw: 140 - k * 26, yb: 400 - k * 46, yt: 400 - k * 46 - 46,
  }));
  return (
    <Frame f={f} seed={872} bg={KRP.cream} dark>
      <g transform={zoomAt(z, CX, 420)}>
        {/* 夜空 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.nightDeep} />
        <rect x={-60} y={420} width={W + 120} height={H} fill={C.night} opacity={0.85} />
        <Stars f={f} n={38} seed={11} yMax={660} />
        {/* 月 */}
        <circle cx={1690} cy={168} r={62} fill="#F3EEDC" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1712} cy={150} r={13} fill={C.stoneDark} opacity={0.5} />
        <circle cx={1668} cy={192} r={9} fill={C.stoneDark} opacity={0.4} />
        {/* 遠景のビル群 */}
        <FarSkyline f={f} yBase={900} seed={23} n={9} />
        {/* 探照灯 (頂部から2本) */}
        {[-1, 1].map((sg) => (
          <polygon key={sg}
            points={`${CX},${200} ${CX + sg * 520 + beam * sg * 6},${-60} ${CX + sg * 300 + beam * sg * 6},${-60}`}
            fill={C.glow} opacity={0.16 * lit} />
        ))}
        {/* 主役の塔: 下の段 */}
        <rect x={CX - 220} y={620} width={440} height={H - 620 + 60}
          fill={C.dark} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.nightPale} strokeWidth={4} opacity={0.5}>
          {[-150, -75, 0, 75, 150].map((o) => (
            <line key={o} x1={CX + o} y1={624} x2={CX + o} y2={H} />
          ))}
        </g>
        {[0, 1, 2].map((r2) => (
          <WinRow key={`a${r2}`} x={CX - 196} y={656 + r2 * 72} w={392} h={44} n={9}
            lit={low} gap={10} seed={41 + r2} />
        ))}
        {/* 中の段 */}
        <rect x={CX - 180} y={480} width={360} height={146}
          fill={C.dark} stroke={KRP.ink} strokeWidth={7} />
        <WinRow x={CX - 156} y={508} w={312} h={46} n={7} lit={low * 0.6} gap={10} seed={57} />
        <rect x={CX - 196} y={466} width={392} height={22} rx={6}
          fill={C.zincDark} stroke={KRP.ink} strokeWidth={6} />
        {/* ★最上階 (ここだけ灯る) */}
        <rect x={CX - 140} y={400} width={280} height={74}
          fill={C.dark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={CX - 190} y={388} width={380} height={190} fill={C.glow}
          opacity={0.14 * lit} />
        <WinRow x={CX - 124} y={412} w={248} h={50} n={5} lit={lit} gap={10} seed={71} />
        <rect x={CX - 152} y={386} width={304} height={20} rx={6}
          fill={C.gold} stroke={KRP.ink} strokeWidth={6} opacity={0.4 + 0.6 * lit} />
        {/* アールデコの頂部: 段々の弧 + 三角窓 */}
        {crown.map((c, k) => (
          <g key={k}>
            <path d={`M${CX - c.hw},${c.yb} L${CX - c.hw},${c.yt + c.hw * 0.55}
              Q${CX},${c.yt - c.hw * 0.35} ${CX + c.hw},${c.yt + c.hw * 0.55} L${CX + c.hw},${c.yb} Z`}
              fill={C.zinc} stroke={KRP.ink} strokeWidth={7} />
            <path d={`M${CX - c.hw * 0.72},${c.yb} L${CX - c.hw * 0.72},${c.yt + c.hw * 0.62}
              Q${CX},${c.yt + c.hw * 0.08} ${CX + c.hw * 0.72},${c.yt + c.hw * 0.62} L${CX + c.hw * 0.72},${c.yb} Z`}
              fill="none" stroke={C.zincDark} strokeWidth={5} opacity={0.9} />
            {[-1, 0, 1].map((o) => (
              <polygon key={o}
                points={`${CX + o * c.hw * 0.45},${c.yb - 12} ${CX + o * c.hw * 0.45 - 13},${c.yb - 40} ${CX + o * c.hw * 0.45 + 13},${c.yb - 40}`}
                fill={lit > 0.5 ? C.candle : C.nightDeep} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 尖塔と航空障害灯 */}
        <rect x={CX - 8} y={94} width={16} height={84} fill={C.zinc}
          stroke={KRP.ink} strokeWidth={5} />
        <circle cx={CX} cy={88} r={14} fill={KRP.red} stroke={KRP.ink}
          strokeWidth={4} opacity={blink} />
        {/* 手前の低い屋上 (見上げている場所) */}
        <polygon points={`-40,1080 -40,812 300,790 640,820 640,1080`}
          fill={C.nightDeep} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-40} y={772} width={320} height={44} rx={6}
          fill={C.dark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={470} y={700} width={92} height={124} rx={8}
          fill={C.dark} stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={-20} y1={794} x2={268} y2={794} n={7} r={7} fill={C.zincDark} />
        {/* 見上げている人 */}
        <Person x={326} y={800} s={0.62} f={f} cloth={C.nightPale} clothDark={C.night}
          hair="cap" face="surprised" gaze={[0.55, -0.6]} lean={-3} />
      </g>
      {/* 札 */}
      <Arrow x={1214} y={440} s={1.15} rot={180} t={seg(f, 24, 36)} color={C.gold} />
      <TagPlate x={1480} y={440} text="最上階" size={48} t={seg(f, 26, 38)} color={C.goldDark} />
      <TagPlate x={1480} y={556} text="ここだけ明かり" size={34} t={seg(f, 30, 42)} />
      <TagPlate x={330} y={200} text="1925年" size={62} t={seg(f, 4, 18)} />
      <TagPlate x={330} y={318} text="ニューヨーク" size={38} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #240 もともと、使用人の部屋として計画された階でした。 =====
// 格: 図
// どこ: 製図台の上。最上階の平面図 (青焼き) を1枚、画面いっぱいに置いて真上から見ている
// 演出: 人も背景も置かない。青焼きの紙・白い罫・壁の二重線・寸法線・表題欄まで作り込む
// 動き: 罫が左から引かれる (f=2〜22) / 小部屋が左から順に出る (f=10〜30) / 赤鉛筆の丸が描かれる (f=22〜40)
// 絵: 青焼きの図面。その階の部屋に「使用人」の書き込み。図面の罫と文字を作り込む
const Kb6cMotoWaShiyounin: React.FC<{ f: number }> = ({ f }) => {
  const SX = 150, SY = 92, SW = 1620, SH = 712;         // 青焼きの紙
  const RX = 300, RY = 282, RW = 1180, RH = 372;        // 間取りの外壁
  const CORR_Y = RY + 164, CORR_H = 62;                 // 廊下
  const cells = 6, cw = RW / cells;
  const draw = easeOut(clamp01(seg(f, 2, 22)));         // 罫が引かれる
  const shown = easeOut(clamp01(seg(f, 10, 30))) * cells;
  const circ = easeOut(clamp01(seg(f, 22, 40)));        // 赤鉛筆の丸
  const CIR = 2 * Math.PI * 400;                        // 丸の周長 (ざっと)
  return (
    <Frame f={f} seed={873} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.1} />
      {/* 青焼きの紙 (角が留められている) */}
      <rect x={SX + 10} y={SY + 12} width={SW} height={SH} fill={KRP.ink} opacity={0.18} />
      <rect x={SX} y={SY} width={SW} height={SH} fill={C.blueprint}
        stroke={KRP.ink} strokeWidth={8} />
      <rect x={SX + 22} y={SY + 22} width={SW - 44} height={SH - 44} fill="none"
        stroke={C.bpLineSoft} strokeWidth={4} opacity={0.8} />
      <g>
        {[[SX + 46, SY + 46], [SX + SW - 46, SY + 46], [SX + 46, SY + SH - 46], [SX + SW - 46, SY + SH - 46]].map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={13} fill={C.zinc} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      {/* 罫 (紙の方眼。左から引かれる) */}
      <g stroke={C.bpLineSoft} strokeWidth={2} opacity={0.42}>
        {Array.from({ length: 26 }, (_, i) => {
          const gx = SX + 30 + i * 62;
          if (gx > SX + 30 + (SW - 60) * draw) return null;
          return <line key={`v${i}`} x1={gx} y1={SY + 28} x2={gx} y2={SY + SH - 28} />;
        })}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`h${i}`} x1={SX + 28} y1={SY + 36 + i * 62}
            x2={SX + 28 + (SW - 56) * draw} y2={SY + 36 + i * 62} />
        ))}
      </g>
      {/* 平面図: 外壁 (二重線) */}
      <g opacity={draw}>
        <rect x={RX} y={RY} width={RW} height={RH} fill="none"
          stroke={C.bpLine} strokeWidth={11} />
        <rect x={RX + 15} y={RY + 15} width={RW - 30} height={RH - 30} fill="none"
          stroke={C.bpLine} strokeWidth={5} opacity={0.75} />
        {/* 廊下 */}
        <rect x={RX + 15} y={CORR_Y} width={RW - 30} height={CORR_H}
          fill={C.bpLineSoft} opacity={0.18} />
        <line x1={RX + 15} y1={CORR_Y} x2={RX + RW - 15} y2={CORR_Y}
          stroke={C.bpLine} strokeWidth={6} />
        <line x1={RX + 15} y1={CORR_Y + CORR_H} x2={RX + RW - 15} y2={CORR_Y + CORR_H}
          stroke={C.bpLine} strokeWidth={6} />
        <text x={RX + 76} y={CORR_Y + 44} fontFamily={FONT} fontWeight={800}
          fontSize={30} fill={C.bpLine} opacity={0.95}>廊下</text>
        {/* 階段と昇降機 (下側) */}
        <rect x={RX + 15} y={CORR_Y + CORR_H} width={190} height={RH - 15 - (CORR_Y + CORR_H - RY)}
          fill="none" stroke={C.bpLine} strokeWidth={5} />
        <g stroke={C.bpLine} strokeWidth={4} opacity={0.85}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={RX + 15} y1={CORR_Y + CORR_H + 22 + i * 24}
              x2={RX + 205} y2={CORR_Y + CORR_H + 22 + i * 24} />
          ))}
        </g>
        <text x={RX + 34} y={RH + RY - 24} fontFamily={FONT} fontWeight={800}
          fontSize={26} fill={C.bpLine}>階段</text>
        <rect x={RX + 222} y={CORR_Y + CORR_H} width={148} height={112}
          fill="none" stroke={C.bpLine} strokeWidth={5} />
        <line x1={RX + 222} y1={CORR_Y + CORR_H} x2={RX + 370} y2={CORR_Y + CORR_H + 112}
          stroke={C.bpLine} strokeWidth={4} opacity={0.8} />
        <text x={RX + 238} y={CORR_Y + CORR_H + 90} fontFamily={FONT} fontWeight={800}
          fontSize={26} fill={C.bpLine}>昇降機</text>
        {/* 下側の大きい室 */}
        <rect x={RX + 390} y={CORR_Y + CORR_H} width={RW - 405} height={RH - 15 - (CORR_Y + CORR_H - RY)}
          fill="none" stroke={C.bpLine} strokeWidth={5} />
        <text x={RX + 420} y={CORR_Y + CORR_H + 70} fontFamily={FONT} fontWeight={800}
          fontSize={30} fill={C.bpLine}>物置・機械室</text>
      </g>
      {/* ★上側: 使用人の小部屋が左から順に出る */}
      {Array.from({ length: cells }, (_, i) => {
        const vis = clamp01(shown - i);
        if (vis <= 0) return null;
        const x = RX + 15 + i * ((RW - 30) / cells);
        const w = (RW - 30) / cells;
        return (
          <g key={i} opacity={vis}>
            <rect x={x} y={RY + 15} width={w} height={CORR_Y - RY - 15}
              fill={C.bpLineSoft} opacity={0.14} />
            <line x1={x} y1={RY + 15} x2={x} y2={CORR_Y} stroke={C.bpLine} strokeWidth={6} />
            {/* 窓 (外壁側の破線) */}
            <line x1={x + 22} y1={RY + 15} x2={x + w - 22} y2={RY + 15}
              stroke={C.snow} strokeWidth={7} strokeDasharray="16 12" />
            {/* 戸の開き (廊下側) */}
            <path d={`M${x + 26},${CORR_Y} l0,-52 M${x + 26},${CORR_Y} a52,52 0 0,1 52,-52`}
              fill="none" stroke={C.bpLine} strokeWidth={4} opacity={0.9} />
            {/* 寝台の印 */}
            <rect x={x + w - 76} y={RY + 40} width={54} height={86}
              fill="none" stroke={C.bpLine} strokeWidth={4} opacity={0.8} />
            <text x={x + w / 2} y={CORR_Y - 22} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={34} fill={C.bpLine}>使用人</text>
            <text x={x + w / 2} y={CORR_Y - 60} textAnchor="middle" fontFamily={FONT}
              fontWeight={800} fontSize={25} fill={C.snow} opacity={0.9}>9㎡</text>
          </g>
        );
      })}
      {/* 寸法線 (小部屋1つぶん) */}
      <g opacity={easeOut(clamp01(seg(f, 20, 34)))}>
        <line x1={RX + 15} y1={RY - 36} x2={RX + 15 + (RW - 30) / cells} y2={RY - 36}
          stroke={C.snow} strokeWidth={5} />
        {[RX + 15, RX + 15 + (RW - 30) / cells].map((tx) => (
          <line key={tx} x1={tx} y1={RY - 56} x2={tx} y2={RY + 6}
            stroke={C.snow} strokeWidth={4} />
        ))}
        <text x={RX + 15 + (RW - 30) / cells / 2} y={RY - 48} textAnchor="middle"
          fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.snow}>3.0m</text>
      </g>
      {/* ★赤鉛筆の丸 (使用人の列を囲う) */}
      <ellipse cx={(RX + RW / 2) + 8} cy={(RY + CORR_Y) / 2 - 4} rx={620} ry={122}
        fill="none" stroke={KRP.red} strokeWidth={10} opacity={0.92}
        strokeDasharray={`${CIR * circ} ${CIR}`} strokeLinecap="round"
        transform={`rotate(-1 ${RX + RW / 2} ${(RY + CORR_Y) / 2})`} />
      {/* 表題欄 */}
      <g opacity={easeOut(clamp01(seg(f, 14, 28)))}>
        <rect x={SX + SW - 440} y={SY + SH - 196} width={406} height={160}
          fill="none" stroke={C.bpLine} strokeWidth={6} />
        <line x1={SX + SW - 440} y1={SY + SH - 142} x2={SX + SW - 34} y2={SY + SH - 142}
          stroke={C.bpLine} strokeWidth={4} />
        <line x1={SX + SW - 440} y1={SY + SH - 90} x2={SX + SW - 34} y2={SY + SH - 90}
          stroke={C.bpLine} strokeWidth={4} />
        <line x1={SX + SW - 230} y1={SY + SH - 142} x2={SX + SW - 230} y2={SY + SH - 36}
          stroke={C.bpLine} strokeWidth={4} />
        <text x={SX + SW - 422} y={SY + SH - 160} fontFamily={FONT} fontWeight={900}
          fontSize={32} fill={C.bpLine}>最上階 平面図</text>
        <text x={SX + SW - 422} y={SY + SH - 106} fontFamily={FONT} fontWeight={800}
          fontSize={26} fill={C.bpLine}>縮尺 1:100</text>
        <text x={SX + SW - 212} y={SY + SH - 106} fontFamily={FONT} fontWeight={800}
          fontSize={26} fill={C.bpLine}>1925</text>
        <text x={SX + SW - 422} y={SY + SH - 54} fontFamily={FONT} fontWeight={800}
          fontSize={26} fill={C.bpLine}>第19階</text>
        <text x={SX + SW - 212} y={SY + SH - 54} fontFamily={FONT} fontWeight={800}
          fontSize={26} fill={C.snow}>N.Y.</text>
      </g>
      {/* 札 */}
      <TagPlate x={560} y={756} text="使用人の部屋" size={50} t={seg(f, 26, 40)}
        color={KRP.red} rot={-1} />
      <TagPlate x={1070} y={756} text="計画の図面" size={38} t={seg(f, 6, 20)} />
    </Frame>
  );
};

// ===== #241 それが、約460平方メートルの住居になります。 =====
// 格: 図
// どこ: 方眼の上。9㎡の四角と460㎡の四角を底辺をそろえて並べ、真横から見ている
// 演出: 人も背景も置かない。寸法線・補助線・目盛りの刻み・9㎡の割りまで作り込む
// 動き: 大きい四角が底辺から立ち上がる (f=4〜26) / 9㎡の割りが左下から順に塗られる / 寸法線が伸びる
// 絵: 面積の比較。9㎡の小さな四角と460㎡の大きな四角 (#226と対)。寸法線
const Kb6cN460Heihou: React.FC<{ f: number }> = ({ f }) => {
  const BASE = 784;                                  // 底辺
  const BIG = 616, BX = 884;                         // 大きい四角 (約21m角)
  const CELL = BIG / 7;                              // 9㎡ぶんの割り
  const SML = CELL, SX = 392;                        // 小さい四角 (3m角)
  const grow = easeOut(clamp01(seg(f, 4, 26)));
  const fill = easeOut(clamp01(seg(f, 12, 40))) * 49;
  const dim = easeOut(clamp01(seg(f, 18, 34)));
  const pulse = 1 + 0.05 * Math.sin(f / 9);
  const bh = BIG * grow;
  return (
    <Frame f={f} seed={874} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.14} />
      {/* 地面の罫 (底辺をそろえた印) */}
      <line x1={120} y1={BASE} x2={1820} y2={BASE} stroke={KRP.ink} strokeWidth={9}
        strokeLinecap="round" />
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.5}>
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1={140 + i * 98} y1={BASE + 8} x2={112 + i * 98} y2={BASE + 34} />
        ))}
      </g>
      {/* 小さい四角 (9㎡) */}
      <g transform={`translate(${SX + SML / 2} ${BASE - SML / 2}) scale(${pulse}) translate(${-SX - SML / 2} ${-BASE + SML / 2})`}>
        <rect x={SX} y={BASE - SML} width={SML} height={SML}
          fill={C.stone} stroke={KRP.ink} strokeWidth={8} />
        <line x1={SX} y1={BASE} x2={SX + SML} y2={BASE - SML}
          stroke={C.stoneDark} strokeWidth={4} />
        <text x={SX + SML / 2} y={BASE - SML / 2 + 12} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={30} fill={KRP.ink}>9㎡</text>
      </g>
      {/* 小さい四角の寸法 */}
      <g opacity={dim}>
        <line x1={SX} y1={BASE + 60} x2={SX + SML} y2={BASE + 60} stroke={KRP.ink} strokeWidth={5} />
        {[SX, SX + SML].map((tx) => (
          <line key={tx} x1={tx} y1={BASE + 42} x2={tx} y2={BASE + 78} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <text x={SX + SML / 2} y={BASE + 50} textAnchor="middle" fontFamily={FONT}
          fontWeight={800} fontSize={28} fill={KRP.ink}>3m</text>
      </g>
      {/* ★大きい四角 (約460㎡)。底辺から立ち上がる */}
      <rect x={BX} y={BASE - bh} width={BIG} height={bh} fill={C.gold} opacity={0.32} />
      {/* 9㎡の割り (左下から順に塗られる) */}
      <g>
        {Array.from({ length: 49 }, (_, k) => {
          const cxi = k % 7, cyi = Math.floor(k / 7);
          const x = BX + cxi * CELL;
          const y = BASE - (cyi + 1) * CELL;
          if (y < BASE - bh - 2) return null;
          const vis = clamp01(fill - k);
          if (vis <= 0) return null;
          return (
            <rect key={k} x={x + 4} y={y + 4} width={CELL - 8} height={CELL - 8}
              fill={C.goldDark} opacity={0.3 * vis}
              stroke={C.goldDark} strokeWidth={3} />
          );
        })}
      </g>
      <g stroke={C.goldDark} strokeWidth={3} opacity={0.6 * grow}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`cv${i}`} x1={BX + (i + 1) * CELL} y1={BASE} x2={BX + (i + 1) * CELL} y2={BASE - bh} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`ch${i}`} x1={BX} y1={BASE - (i + 1) * CELL} x2={BX + BIG} y2={BASE - (i + 1) * CELL}
            opacity={BASE - (i + 1) * CELL > BASE - bh ? 1 : 0} />
        ))}
      </g>
      <rect x={BX} y={BASE - bh} width={BIG} height={bh} fill="none"
        stroke={KRP.ink} strokeWidth={10} />
      {/* 大きい四角の寸法 (横と縦) */}
      <g opacity={dim}>
        <line x1={BX} y1={BASE + 60} x2={BX + BIG} y2={BASE + 60} stroke={KRP.ink} strokeWidth={5} />
        {[BX, BX + BIG].map((tx) => (
          <line key={tx} x1={tx} y1={BASE + 42} x2={tx} y2={BASE + 78} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <text x={BX + BIG / 2} y={BASE + 50} textAnchor="middle" fontFamily={FONT}
          fontWeight={800} fontSize={30} fill={KRP.ink}>約21m</text>
        <line x1={BX + BIG + 70} y1={BASE} x2={BX + BIG + 70} y2={BASE - BIG}
          stroke={KRP.ink} strokeWidth={5} />
        {[BASE, BASE - BIG].map((ty) => (
          <line key={ty} x1={BX + BIG + 52} y1={ty} x2={BX + BIG + 88} y2={ty}
            stroke={KRP.ink} strokeWidth={4} />
        ))}
        <text x={BX + BIG + 104} y={BASE - BIG / 2 + 11} fontFamily={FONT}
          fontWeight={800} fontSize={30} fill={KRP.ink}>約21m</text>
        {/* 補助線 */}
        <line x1={SX + SML} y1={BASE - SML} x2={BX} y2={BASE - SML}
          stroke={BP.shaftDark} strokeWidth={4} strokeDasharray="18 14" />
      </g>
      {/* 9㎡ → 460㎡ の矢印 */}
      <ForceArrow x={520} y={BASE - 200} len={300} rot={-34} w={22} color={C.goldDark}
        t={seg(f, 22, 38)} label="約50倍" labelSize={38} />
      {/* 札 */}
      <TagPlate x={452} y={196} text="約460㎡" size={66} t={seg(f, 8, 22)}
        fill={C.candle} rot={-1} />
      <TagPlate x={452} y={306} text="住居" size={40} t={seg(f, 16, 30)} />
      <TagPlate x={424} y={620} text="9㎡" size={44} t={seg(f, 2, 16)} />
    </Frame>
  );
};

// ===== #242 名前は、ペントハウス。元は物置の呼び名です。 =====
// 格: 並
// どこ: 夕暮れの屋上。正面に素っ気ない板張りの物置小屋 (#243 と同じ座標・同じ大きさ)
// 演出: 描くのは小屋ひとつ。板戸・箒・木箱・裸電球・洗濯紐・通気管・高架水槽。人は1人だけ
// 動き: 裸電球が揺れる / 洗濯物が風に揺れる / 板戸が少し開く (f=14〜34) / 人が小屋を見る
// 絵: 屋上の素っ気ない物置小屋。板戸・箒・木箱・ランプ・洗濯紐。小屋の札
const Kb6cPenthouseMonooki: React.FC<{ f: number }> = ({ f }) => {
  const X1 = 560, X2 = 1240, YT = 362, YB = 820;
  const sw = Math.sin(f / 13) * 11;                      // 電球の揺れ
  const wind = Math.sin(f / 15) * 9;                      // 洗濯物
  const ajar = easeOut(clamp01(seg(f, 14, 34))) * 16;     // 板戸が開く角度
  const planks = Array.from({ length: 12 }, (_, i) => X1 + 10 + i * 56);
  return (
    <Frame f={f} seed={875} bg={KRP.cream}>
      {/* 夕暮れの空 */}
      <rect x={-40} y={-40} width={W + 80} height={940} fill={C.nightPale} />
      <rect x={-40} y={-40} width={W + 80} height={420} fill={C.night} opacity={0.42} />
      <Stars f={f} n={12} seed={5} yMax={300} />
      {/* 屋上の床 */}
      <rect x={-40} y={818} width={W + 80} height={H} fill={BP.slab}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.slabDark} strokeWidth={4} opacity={0.8}>
        {[862, 918, 986, 1064].map((y) => <line key={y} x1={-40} y1={y} x2={W + 40} y2={y} />)}
      </g>
      {/* 高架水槽 (奥) */}
      <g>
        <rect x={1480} y={452} width={290} height={176} rx={10}
          fill={C.zincDark} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.zinc} strokeWidth={4} opacity={0.8}>
          {[500, 548, 596].map((y) => <line key={y} x1={1486} y1={y} x2={1764} y2={y} />)}
        </g>
        <Rivets x1={1492} y1={466} x2={1758} y2={466} n={8} r={6} fill={BP.ironDark} />
        {[1520, 1620, 1730].map((x) => (
          <rect key={x} x={x} y={628} width={18} height={150} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={4} />
        ))}
        <line x1={1500} y1={700} x2={1750} y2={700} stroke={BP.steelDark} strokeWidth={10} />
      </g>
      {/* 通気管 + 洗濯紐 */}
      <rect x={142} y={462} width={62} height={360} fill={C.zincDark}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={126} y={436} width={94} height={32} rx={8} fill={C.zinc}
        stroke={KRP.ink} strokeWidth={6} />
      <Rope x1={204} y1={474} x2={X1 - 36} y2={404} w={9} kind="hemp" f={f} />
      {[[300, 0], [400, 1], [492, 2]].map(([cx, i]) => (
        <g key={cx} transform={`translate(${cx} ${474 - (cx - 204) * 0.2}) rotate(${wind + (i as number) * 3})`}>
          <path d={`M-46,6 L46,6 L${52 + wind * 0.4},116 L${-40 + wind * 0.4},122 Z`}
            fill={i === 1 ? C.stone : KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-30} cy={4} r={7} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={32} cy={4} r={7} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      {/* 小屋: 屋根 (亜鉛板・左が高い) */}
      <polygon points={`${X1 - 44},${YT - 14} ${X2 + 54},${YT + 44} ${X2 + 54},${YT + 74} ${X1 - 44},${YT + 16}`}
        fill={C.zinc} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.zincDark} strokeWidth={4} opacity={0.85}>
        {Array.from({ length: 11 }, (_, i) => {
          const x = X1 - 30 + i * 62;
          const y = YT - 14 + (x - (X1 - 44)) * 0.0577;
          return <line key={i} x1={x} y1={y} x2={x} y2={y + 30} />;
        })}
      </g>
      {/* 小屋: 板張りの壁 */}
      <rect x={X1} y={YT + 16} width={X2 - X1} height={YB - YT - 16}
        fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.9}>
        {planks.map((x) => <line key={x} x1={x} y1={YT + 20} x2={x} y2={YB - 4} />)}
      </g>
      <rect x={X1} y={YB - 26} width={X2 - X1} height={26} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={6} />
      {/* 小窓 (埃っぽい4枚ガラス) */}
      <rect x={1076} y={500} width={118} height={118} fill={BP.glass}
        stroke={KRP.ink} strokeWidth={7} opacity={0.75} />
      <line x1={1135} y1={502} x2={1135} y2={616} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1078} y1={559} x2={1192} y2={559} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1062} y={486} width={146} height={16} fill={BP.woodLight}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 板戸 (両開き・左だけ少し開く) */}
      {[-1, 1].map((sg) => (
        <g key={sg} transform={sg === -1
          ? `translate(790 470) rotate(${-ajar}) translate(-790 -470)` : ""}>
          <rect x={sg === -1 ? 790 : 900} y={470} width={110} height={YB - 470}
            fill={BP.woodLight} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={BP.woodDark} strokeWidth={4}>
            <line x1={sg === -1 ? 826 : 936} y1={474} x2={sg === -1 ? 826 : 936} y2={YB - 4} />
            <line x1={sg === -1 ? 862 : 972} y1={474} x2={sg === -1 ? 862 : 972} y2={YB - 4} />
            <line x1={sg === -1 ? 792 : 902} y1={620} x2={sg === -1 ? 898 : 1008} y2={560} />
          </g>
          {[500, 640, 780].map((hy) => (
            <rect key={hy} x={sg === -1 ? 790 : 962} y={hy} width={48} height={18} rx={4}
              fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
      ))}
      {/* 掛け金と南京錠 */}
      <rect x={884} y={630} width={34} height={14} rx={3} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={4} />
      <rect x={890} y={644} width={24} height={30} rx={6} fill={BP.iron}
        stroke={KRP.ink} strokeWidth={4} />
      {/* 裸電球 (壁の腕木から吊る) */}
      <rect x={1196} y={436} width={66} height={12} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={4} />
      <line x1={1248} y1={444} x2={1248 + sw} y2={500} stroke={KRP.ink} strokeWidth={5} />
      <polygon points={`${1236 + sw},${500} ${1260 + sw},${500} ${1278 + sw},${534} ${1218 + sw},${534}`}
        fill={C.zincDark} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1248 + sw} cy={556} r={24} fill={BP.lamp} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={1248 + sw} cy={556} r={62} fill={BP.lampGlow} opacity={0.22} />
      {/* 箒 */}
      <g transform="rotate(-11 600 818)">
        <rect x={592} y={548} width={14} height={248} fill={BP.woodLight}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={578} y={790} width={42} height={26} rx={5} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5} />
        <g stroke={BP.hempDark} strokeWidth={5}>
          {[-18, -10, -2, 6, 14].map((o) => (
            <line key={o} x1={599 + o * 0.6} y1={814} x2={599 + o * 1.9} y2={872} />
          ))}
        </g>
      </g>
      {/* 木箱 2つ */}
      {[[1292, 694, 164, 126], [1308, 592, 132, 102]].map(([bx, by, bw, bh], i) => (
        <g key={i}>
          <rect x={bx} y={by} width={bw} height={bh} fill={BP.woodLight}
            stroke={KRP.ink} strokeWidth={7} />
          <g stroke={BP.woodDark} strokeWidth={4}>
            <line x1={bx + 6} y1={by + bh * 0.36} x2={bx + bw - 6} y2={by + bh * 0.36} />
            <line x1={bx + 6} y1={by + bh * 0.7} x2={bx + bw - 6} y2={by + bh * 0.7} />
            <line x1={bx + 6} y1={by + bh - 4} x2={bx + bw - 6} y2={by + 4} />
          </g>
          <rect x={bx} y={by} width={14} height={bh} fill={BP.wood}
            stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 小屋を見ている人 (1人だけ) */}
      <Person x={420} y={828} s={0.68} f={f} cloth={BP.steelDark} clothDark={BP.ironDark}
        hair="cap" face="normal" gaze={[0.6, -0.1]} />
      {/* 札 */}
      <TagPlate x={900} y={426} text="物置" size={54} t={seg(f, 6, 20)}
        fill={BP.woodLight} rot={-2} />
      <TagPlate x={1620} y={268} text="屋上" size={40} t={seg(f, 14, 28)} />
      <TagPlate x={300} y={706} text="板戸・箒・木箱" size={32} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ===== #243 ★物置の名前が、いちばん高い部屋の名前になりました。 =====
// 格: 山
// どこ: ★高層マンションの屋上。画面の下3分の1が屋上スラブで、縁の向こうははるか下の夜景
// 演出: 屋上に建つガラス張りの豪華な部屋 (ペントハウス)。左奥に同じ形の素っ気ない物置を並べて対比する
// 動き: 灯りがともる (f=4〜26) / 金の看板が鎖で下りてくる (f=14〜36) / シャンデリアが揺れる
//       / 換気扇と室外機が回る / 航空障害灯が明滅する / 街の灯りがまたたく / ゆっくり寄る
// 絵: ★眼下に夜の街。屋上スラブ・パラペット・手すり・高架水槽・室外機・避雷針。
//     その上にガラスと金の最上階の部屋。左に同じ形の素っ気ない物置

/** #243 専用: 眼下にひろがる夜の街。
 *  ★街区はぜんぶ「屋根が見える」向きで描く = 自分がその上にいることの証拠 */
const Kb6cCityBelow: React.FC<{ f: number }> = ({ f }) => {
  const VPX = 960, VPY = 362;                       // 消失点 (地平)
  const rowY = Array.from({ length: 10 }, (_, i) => VPY + 764 * (i / 9) ** 2);
  return (
    <g>
      {/* 地平の残光 */}
      <rect x={-60} y={VPY - 132} width={W + 120} height={132} fill={C.nightPale} opacity={0.36} />
      <rect x={-60} y={VPY - 28} width={W + 120} height={28} fill="#3C5673" opacity={0.85} />
      {/* はるか下の地面 */}
      <rect x={-60} y={VPY} width={W + 120} height={H - VPY + 80} fill="#121C29" />
      {/* 大通り (消失点へ集まる = 見下ろしている) */}
      {Array.from({ length: 13 }, (_, k) => {
        const d = k - 6;
        const bx = VPX + d * 332, tx = VPX + d * 15;
        return (
          <polygon key={k}
            points={`${bx - 23},1150 ${bx + 23},1150 ${tx + 3},${VPY + 2} ${tx - 3},${VPY + 2}`}
            fill="#36485E" opacity={0.6} />
        );
      })}
      {/* 横の通り (下へ行くほど間隔が開く) */}
      {rowY.map((y, i) => (
        <line key={i} x1={-60} y1={y} x2={W + 60} y2={y} stroke="#36485E"
          strokeWidth={2 + 16 * ((y - VPY) / 764)} opacity={0.55} />
      ))}
      {/* 街区 (奥から手前へ。どれも屋根の面が見える) */}
      {rowY.slice(2).map((y, ri) => {
        const i = ri + 2;
        const s = (y - VPY) / 764;
        const n = Math.round(17 - 10 * s);
        const pitch = (W + 240) / n;
        return (
          <g key={i}>
            {Array.from({ length: n }, (_, j) => {
              const bx = -120 + j * pitch + rnd(i * 31 + j * 7) * pitch * 0.42;
              const w2 = (18 + 230 * s) * (0.7 + rnd(i * 5 + j * 11) * 0.7);
              const h2 = (14 + 250 * s) * (0.55 + rnd(i * 13 + j * 3) * 0.85);
              const dep = 5 + 62 * s;
              const ty = y - h2;
              const rows = Math.max(1, Math.floor((h2 - 14) / (10 + 16 * s)));
              return (
                <g key={j}>
                  <rect x={bx} y={ty} width={w2} height={h2} fill="#2A3444"
                    stroke={KRP.ink} strokeWidth={2 + 2.4 * s} />
                  <polygon
                    points={`${bx},${ty} ${bx + dep * 0.72},${ty - dep} ${bx + w2 + dep * 0.72},${ty - dep} ${bx + w2},${ty}`}
                    fill="#56667B" stroke={KRP.ink} strokeWidth={2 + 2.4 * s} />
                  {Array.from({ length: rows }, (_, r2) => (
                    <rect key={r2} x={bx + w2 * 0.16} y={ty + 7 + r2 * (10 + 16 * s)}
                      width={w2 * 0.68} height={3 + 8 * s} fill={BP.lamp}
                      opacity={rnd(i * 7.3 + j * 3.1 + r2 * 1.7) > 0.4
                        ? 0.42 + 0.38 * (Math.sin(f / 12 + i + j + r2) * 0.5 + 0.5) : 0.07} />
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}
      {/* 街灯の粒 */}
      {Array.from({ length: 140 }, (_, i) => {
        const gy = VPY + 30 + rnd(301 + i * 2.7) ** 1.5 * 740;
        const gx = -20 + rnd(307 + i * 3.3) * (W + 40);
        const tw = 0.4 + 0.6 * (Math.sin(f / 9 + i * 1.7) * 0.5 + 0.5);
        return (
          <circle key={i} cx={gx} cy={gy} r={1.4 + (gy - VPY) / 300}
            fill={i % 4 === 0 ? C.glow : BP.lamp} opacity={0.62 * tw} />
        );
      })}
      {/* かすみ (遠いほど白む) */}
      <rect x={-60} y={VPY} width={W + 120} height={190} fill={C.nightPale} opacity={0.2} />
    </g>
  );
};

const Kb6cMonookiNoNamae: React.FC<{ f: number }> = ({ f }) => {
  const DF = 700;                                         // 屋上スラブの奥の縁
  const dL = (y: number) => lerp(340, 60, (y - DF) / 380);
  const dR = (y: number) => lerp(1620, 1860, (y - DF) / 380);
  const PX1 = 610, PX2 = 1322, PYT = 316, PYB = 820;      // ペントハウスの箱
  const SX1 = 258, SX2 = 518, SYT = 556, SYB = 822;       // 左の素っ気ない物置 (同じ形)
  const lit = easeOut(clamp01(seg(f, 4, 26)));            // 灯りがともる
  const sign = easeOut(clamp01(seg(f, 14, 36)));          // 金の看板が下りてくる
  const z = 1 + 0.06 * easeOut(clamp01(seg(f, 0, 42)));
  const sw = Math.sin(f / 12) * 9;                        // シャンデリアの揺れ
  const flick = 0.86 + 0.14 * (Math.sin(f / 6) * 0.5 + 0.5);
  const signY = lerp(372, 452, sign);
  const beacon = 0.35 + 0.65 * (Math.sin(f / 4.5) * 0.5 + 0.5);
  return (
    <Frame f={f} seed={876} bg={KRP.cream} dark>
      <g transform={zoomAt(z, 940, 560)}>
        {/* ===== 夜空と、はるか下の街 ===== */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.nightDeep} />
        <Kb6cCityBelow f={f} />
        <Stars f={f} n={28} seed={5} yMax={360} />
        <circle cx={252} cy={300} r={46} fill="#F3EEDC" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={268} cy={286} r={10} fill={C.stoneDark} opacity={0.5} />

        {/* ===== 屋上スラブ (画面の下3分の1。左右の外はもう空中) ===== */}
        <polygon points={`340,${DF} 1620,${DF} 1860,1080 60,1080`} fill={BP.slab}
          stroke={KRP.ink} strokeWidth={7} />
        <g stroke={BP.slabDark} strokeWidth={4} opacity={0.7}>
          {[770, 848, 942, 1046].map((y) => (
            <line key={y} x1={dL(y)} y1={y} x2={dR(y)} y2={y} />
          ))}
          {[0.14, 0.32, 0.5, 0.68, 0.86].map((u) => (
            <line key={u} x1={lerp(340, 1620, u)} y1={DF} x2={lerp(60, 1860, u)} y2={1080} />
          ))}
        </g>
        {/* パラペット (立ち上がり) と笠木 */}
        <rect x={340} y={612} width={1280} height={DF - 612} fill={BP.slabDark}
          stroke={KRP.ink} strokeWidth={6} />
        <polygon points={`324,592 340,${DF} 60,1080 36,998`} fill={BP.slabDark}
          stroke={KRP.ink} strokeWidth={6} />
        <polygon points={`1636,592 1620,${DF} 1860,1080 1884,998`} fill={BP.slabDark}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={324} y={590} width={1312} height={24} rx={5} fill={BP.slab}
          stroke={KRP.ink} strokeWidth={6} />
        <polygon points={`324,590 340,616 60,1024 36,998`} fill={BP.slab}
          stroke={KRP.ink} strokeWidth={5} />
        <polygon points={`1636,590 1620,616 1860,1024 1884,998`} fill={BP.slab}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 手すり (縁の上) */}
        <g>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={378 + i * 134} y={528} width={10} height={70}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3.5} />
          ))}
          <rect x={346} y={522} width={1268} height={13} rx={6} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={4} />
          <rect x={346} y={560} width={1268} height={9} rx={4} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={3.5} />
        </g>

        {/* ===== 右: 高架水槽・室外機・避雷針 (屋上の持ち物) ===== */}
        <g>
          {[1410, 1500, 1596].map((x) => (
            <rect key={x} x={x} y={530} width={18} height={182} fill={BP.steelDark}
              stroke={KRP.ink} strokeWidth={4} />
          ))}
          <line x1={1404} y1={644} x2={1618} y2={644} stroke={BP.steelDark} strokeWidth={9} />
          <rect x={1384} y={406} width={248} height={132} rx={10} fill={C.zincDark}
            stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.zinc} strokeWidth={4} opacity={0.75}>
            {[442, 476, 510].map((y) => <line key={y} x1={1390} y1={y} x2={1626} y2={y} />)}
          </g>
          <Rivets x1={1394} y1={420} x2={1622} y2={420} n={8} r={6} fill={BP.ironDark} />
          <rect x={1470} y={384} width={72} height={26} rx={6} fill={C.zinc}
            stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 避雷針 + 航空障害灯 (高いことの印) */}
        <g>
          <line x1={1700} y1={420} x2={1612} y2={850} stroke={BP.wire} strokeWidth={4} opacity={0.7} />
          <rect x={1688} y={322} width={13} height={534} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={4} />
          <polygon points="1694,286 1706,326 1682,326" fill={BP.steel}
            stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1694} cy={364} r={13} fill={KRP.red} opacity={beacon}
            stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={1694} cy={364} r={30} fill={KRP.red} opacity={0.22 * beacon} />
          <rect x={1656} y={846} width={80} height={22} rx={5} fill={BP.ironDark}
            stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 室外機 (羽根が回る) */}
        <g>
          <rect x={1398} y={768} width={206} height={98} rx={8} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={7} />
          <rect x={1398} y={768} width={206} height={20} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1468} cy={824} r={34} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${f * 9} 1468 824)`}>
            {[0, 120, 240].map((a) => (
              <path key={a} transform={`rotate(${a} 1468 824)`}
                d="M1468,824 q28,-12 31,9 q-17,13 -31,-9" fill={BP.steelLight}
                stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
          <g stroke={BP.steelDark} strokeWidth={4}>
            {[1528, 1550, 1572].map((x) => <line key={x} x1={x} y1={796} x2={x} y2={856} />)}
          </g>
        </g>

        {/* ===== 左奥: もとの物置と同じ形の、素っ気ない小屋 ===== */}
        <g>
          <polygon points={`${SX1 - 16},${SYT - 6} ${SX2 + 20},${SYT + 16} ${SX2 + 20},${SYT + 30} ${SX1 - 16},${SYT + 8}`}
            fill={C.zinc} stroke={KRP.ink} strokeWidth={6} />
          <rect x={SX1} y={SYT + 8} width={SX2 - SX1} height={SYB - SYT - 8}
            fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={BP.woodDark} strokeWidth={3.5} opacity={0.9}>
            {[32, 64, 96, 128, 160, 192].map((o) => (
              <line key={o} x1={SX1 + o} y1={SYT + 12} x2={SX1 + o} y2={SYB - 3} />
            ))}
          </g>
          <rect x={SX1} y={SYB - 16} width={SX2 - SX1} height={16} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={5} />
          {/* 板戸 (両開き) */}
          <rect x={326} y={672} width={112} height={SYB - 672} fill={BP.woodLight}
            stroke={KRP.ink} strokeWidth={6} />
          <line x1={382} y1={676} x2={382} y2={SYB - 4} stroke={BP.woodDark} strokeWidth={4} />
          <line x1={330} y1={776} x2={434} y2={700} stroke={BP.woodDark} strokeWidth={4} />
          <rect x={370} y={736} width={24} height={13} rx={3} fill={BP.ironDark}
            stroke={KRP.ink} strokeWidth={3} />
          {/* 埃っぽい小窓 */}
          <rect x={452} y={654} width={54} height={54} fill={BP.glass} opacity={0.7}
            stroke={KRP.ink} strokeWidth={5} />
          <line x1={479} y1={656} x2={479} y2={706} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={454} y1={681} x2={504} y2={681} stroke={KRP.ink} strokeWidth={3.5} />
          {/* 回る換気扇 */}
          <g>
            <rect x={393} y={560} width={15} height={18} fill={C.zincDark}
              stroke={KRP.ink} strokeWidth={4} />
            <circle cx={400} cy={536} r={24} fill={C.zinc} stroke={KRP.ink} strokeWidth={5} />
            <g transform={`rotate(${f * 11} 400 536)`} stroke={C.zincDark} strokeWidth={4}>
              {[0, 60, 120].map((a) => (
                <line key={a} transform={`rotate(${a} 400 536)`}
                  x1={379} y1={536} x2={421} y2={536} />
              ))}
            </g>
          </g>
          {/* 板看板「物置」 */}
          <rect x={276} y={586} width={130} height={48} rx={5} fill={BP.woodLight}
            stroke={KRP.ink} strokeWidth={5} />
          <text x={341} y={621} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={34} fill={KRP.ink}>物置</text>
          {/* 箒 */}
          <g transform="rotate(-9 534 818)">
            <rect x={528} y={656} width={11} height={162} fill={BP.woodLight}
              stroke={KRP.ink} strokeWidth={4} />
            <rect x={518} y={798} width={32} height={20} rx={4} fill={BP.woodDark}
              stroke={KRP.ink} strokeWidth={4} />
            <g stroke={BP.hempDark} strokeWidth={4}>
              {[-12, -6, 0, 6, 12].map((o) => (
                <line key={o} x1={534 + o * 0.6} y1={816} x2={534 + o * 1.7} y2={856} />
              ))}
            </g>
          </g>
        </g>

        {/* ===== 中央: 屋上に建つ、ガラスと金の部屋 (ペントハウス) ===== */}
        {/* 金の庇 (物置と同じ、左が高い形) */}
        <polygon points={`${PX1 - 46},${PYT - 14} ${PX2 + 54},${PYT + 44} ${PX2 + 54},${PYT + 78} ${PX1 - 46},${PYT + 20}`}
          fill={C.gold} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.goldDark} strokeWidth={4} opacity={0.9}>
          {Array.from({ length: 12 }, (_, i) => {
            const x = PX1 - 32 + i * 62;
            const y = PYT - 14 + (x - (PX1 - 46)) * 0.0714;
            return <line key={i} x1={x} y1={y} x2={x} y2={y + 34} />;
          })}
        </g>
        {/* 金の壁 */}
        <rect x={PX1} y={PYT + 20} width={PX2 - PX1} height={PYB - PYT - 20}
          fill={C.gold} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={C.goldDark} strokeWidth={4} opacity={0.85}>
          <line x1={PX1 + 20} y1={PYT + 36} x2={PX1 + 20} y2={PYB - 8} />
          <line x1={PX2 - 20} y1={PYT + 36} x2={PX2 - 20} y2={PYB - 8} />
          <line x1={PX1 + 8} y1={PYT + 52} x2={PX2 - 8} y2={PYT + 52} />
        </g>
        {/* 大きなガラス面 */}
        <rect x={650} y={382} width={632} height={404} fill={C.nightDeep}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={650} y={382} width={632} height={404} fill={C.candle}
          opacity={0.55 * lit * flick} />
        <ellipse cx={740} cy={470} rx={150} ry={110} fill={C.glow} opacity={0.3 * lit} />
        <ellipse cx={1192} cy={470} rx={150} ry={110} fill={C.glow} opacity={0.3 * lit} />
        {/* 中の調度 (影絵) */}
        <g opacity={lit} fill={C.dark} stroke={KRP.ink} strokeWidth={5}>
          {/* 長椅子 */}
          <rect x={668} y={686} width={172} height={46} rx={10} />
          <rect x={656} y={716} width={196} height={30} rx={8} />
          <rect x={666} y={746} width={14} height={26} />
          <rect x={828} y={746} width={14} height={26} />
          {/* 肘掛け椅子 */}
          <rect x={1092} y={698} width={96} height={48} rx={10} />
          <rect x={1082} y={722} width={116} height={26} rx={8} />
          <rect x={1090} y={748} width={12} height={24} />
          <rect x={1178} y={748} width={12} height={24} />
          {/* 丸テーブル */}
          <ellipse cx={1240} cy={714} rx={42} ry={14} />
          <rect x={1234} y={714} width={12} height={58} />
          <ellipse cx={1240} cy={774} rx={30} ry={10} />
        </g>
        {/* 卓上の明かり */}
        <g opacity={lit}>
          <polygon points="1216,686 1264,686 1274,712 1206,712" fill={BP.lamp}
            stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1240} cy={706} r={44} fill={BP.lampGlow} opacity={0.26 * flick} />
        </g>
        {/* シャンデリア 2基 (揺れる) */}
        {[740, 1192].map((cx, k) => (
          <g key={cx} opacity={lit}>
            <line x1={cx} y1={386} x2={cx + sw * (k ? 0.8 : 1)} y2={486}
              stroke={BP.brassDark} strokeWidth={6} />
            {/* 真鍮の受け皿 */}
            <path d={`M${cx + sw - 28},${482} Q${cx + sw},${516} ${cx + sw + 28},${482} Z`}
              fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
            {/* 外へ張り出す腕の先に、上を向いた蝋燭が4本立つ */}
            {[-52, -22, 22, 52].map((o, i) => {
              const X = cx + sw + o;
              const tipY = Math.abs(o) > 40 ? 452 : 464;
              return (
                <g key={o}>
                  <path d={`M${cx + sw},${490} Q${cx + sw + o * 0.8},${494} ${X},${tipY}`}
                    fill="none" stroke={BP.brass} strokeWidth={7} strokeLinecap="round" />
                  <polygon
                    points={`${X - 13},${tipY} ${X + 13},${tipY} ${X + 8},${tipY + 14} ${X - 8},${tipY + 14}`}
                    fill={BP.brass} stroke={KRP.ink} strokeWidth={3.5} />
                  <rect x={X - 6} y={tipY - 22} width={12} height={24} fill={C.snow}
                    stroke={KRP.ink} strokeWidth={3} />
                  <path
                    d={`M${X},${tipY - 46} Q${X + 10},${tipY - 30} ${X},${tipY - 22} Q${X - 10},${tipY - 30} ${X},${tipY - 46} Z`}
                    fill={BP.lamp} stroke={KRP.ink} strokeWidth={2.5} opacity={flick} />
                  <circle cx={X} cy={tipY - 32} r={24} fill={BP.lampGlow}
                    opacity={0.26 * flick * (1 - i * 0.05)} />
                </g>
              );
            })}
            {/* 受け皿から下がる雫形の飾り */}
            {[-20, 0, 20].map((o, i) => (
              <path key={o}
                d={`M${cx + sw + o},${504 + i * 3} Q${cx + sw + o + 7},${515} ${cx + sw + o},${523 + i * 3} Q${cx + sw + o - 7},${515} ${cx + sw + o},${504 + i * 3} Z`}
                fill={C.snow} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
            ))}
          </g>
        ))}
        {/* 真鍮のガラス戸 */}
        {[-1, 1].map((sg) => {
          const dx = sg === -1 ? 880 : 968;
          return (
            <g key={sg}>
              <rect x={dx} y={542} width={84} height={244} fill={BP.glass} opacity={0.85}
                stroke={BP.brassDark} strokeWidth={8} />
              <rect x={dx} y={542} width={84} height={244} fill={C.candle}
                opacity={0.45 * lit * flick} />
              <rect x={dx} y={542} width={84} height={244} fill="none"
                stroke={KRP.ink} strokeWidth={5} />
              <rect x={sg === -1 ? 938 : 974} y={618} width={12} height={112} rx={6}
                fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
              <line x1={dx + 12} y1={776} x2={dx + 72} y2={560} stroke={KRP.white}
                strokeWidth={6} opacity={0.28} />
            </g>
          );
        })}
        {/* 方立と無目 (金) */}
        <g fill={C.gold} stroke={KRP.ink} strokeWidth={5}>
          <rect x={852} y={382} width={18} height={404} />
          <rect x={1062} y={382} width={18} height={404} />
          <rect x={650} y={528} width={202} height={15} />
          <rect x={1080} y={528} width={202} height={15} />
        </g>
        {/* ガラスの照り */}
        <g stroke={KRP.white} strokeWidth={9} opacity={0.17}>
          <line x1={672} y1={770} x2={824} y2={400} />
          <line x1={712} y1={770} x2={864} y2={400} />
          <line x1={1104} y1={770} x2={1256} y2={400} />
        </g>
        {/* ★金の看板が鎖で下りてくる */}
        <g opacity={clamp01(sign * 1.3)}>
          {[-148, 148].map((o) => (
            <line key={o} x1={966 + o} y1={368} x2={966 + o} y2={signY - 32}
              stroke={BP.brassDark} strokeWidth={7} strokeDasharray="12 8" />
          ))}
          <TagPlate x={966} y={signY} text="ペントハウス" size={48} t={1}
            fill={C.gold} color={KRP.ink} rot={0} />
        </g>
        {/* 台輪と階段 */}
        <rect x={PX1 - 12} y={786} width={PX2 - PX1 + 24} height={34} fill={C.goldDark}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 床に落ちる金色の明かり */}
        <polygon points="660,820 1286,820 1500,1080 448,1080" fill={C.glow}
          opacity={0.18 * lit} />
        <rect x={846} y={806} width={240} height={20} fill={C.gold}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={826} y={826} width={280} height={20} fill={C.goldDark}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 赤い絨毯 */}
        <polygon points="828,846 1104,846 1176,1044 756,1044" fill={KRP.red}
          opacity={0.78 * lit} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.gold} strokeWidth={5} opacity={0.6 * lit}>
          <line x1={846} y1={850} x2={778} y2={1040} />
          <line x1={1086} y1={850} x2={1154} y2={1040} />
        </g>
        {/* 真鍮の灯り柱 2本 と 鉢植え */}
        {[806, 1270].map((x) => (
          <g key={x} opacity={lit}>
            <rect x={x - 9} y={788} width={18} height={68} fill={BP.brassDark}
              stroke={KRP.ink} strokeWidth={4} />
            <rect x={x - 21} y={752} width={42} height={38} rx={6} fill={BP.lamp}
              opacity={flick} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={x} cy={770} r={44} fill={BP.lampGlow} opacity={0.22 * flick} />
          </g>
        ))}
        <g opacity={lit}>
          <rect x={1128} y={768} width={100} height={70} rx={8} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={6} />
          {[-30, 0, 30].map((o, i) => (
            <path key={o}
              d={`M${1178 + o},768 q${o * 0.5 - 4 + Math.sin(f / 14 + i) * 5},-46 ${o * 1.2},-74`}
              fill="none" stroke={C.emerGreen} strokeWidth={9} strokeLinecap="round" />
          ))}
        </g>
        {/* 見上げている人 */}
        <Person x={638} y={866} s={0.72} f={f} cloth={C.amber} clothDark={C.goldDark}
          hair="cap" face="surprised" gaze={[0.7, -0.4]} lean={-3} />
      </g>
      {/* 札 (2枚だけ。「ペントハウス」「物置」は建物の看板なので絵の中) */}
      <TagPlate x={1588} y={224} text="いちばん高い部屋" size={36} t={seg(f, 26, 40)} />
      <TagPlate x={296} y={474} text="同じ形" size={40} t={seg(f, 6, 20)} />
      <Arrow x={600} y={474} s={1.05} rot={0} t={seg(f, 12, 26)} color={KRP.red} />
    </Frame>
  );
};

// ===== #244 いまは、1階上がるごとに2%ほど高くなります。 =====
// 格: 図
// どこ: 方眼の上。価格の階段グラフ1つだけ。★階段グラフを出すのはこの1枚だけ (#245/#246 は別の絵)
// 演出: 人も背景も置かない。縦軸の%・横軸の階数・軸の折れ・各段の天板まで作り込む
// 動き: 階段が左から1段ずつ伸びる (f=4〜30) / 各段の立ち上がりに +2% の矢印が順に出る
// 絵: 階段状に上がる価格のグラフ。1段ごとに+2%の矢印。目盛りと数字
const Kb6cN1Kai2Percent: React.FC<{ f: number }> = ({ f }) => {
  const { x0, cell, n } = STAIR;
  return (
    <Frame f={f} seed={877} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.12} />
      <PriceStairs f={f} mode={0} />
      {/* 各段の立ち上がりに +2% の矢印 */}
      {Array.from({ length: n - 1 }, (_, i) => {
        const yA = stairY(stairPrice(i + 1));
        const t = seg(f, 8 + i * 2.6, 20 + i * 2.6);
        return (
          <ForceArrow key={i} x={x0 + (i + 1) * cell - 16} y={yA} len={46} rot={-90} w={15}
            color={KRP.red} t={t} label={i % 3 === 0 ? "+2%" : undefined} labelSize={28} />
        );
      })}
      {/* 1階ぶんの幅の寸法 */}
      <g opacity={easeOut(clamp01(seg(f, 22, 36)))}>
        <line x1={x0 + 2 * cell} y1={258} x2={x0 + 3 * cell} y2={258}
          stroke={KRP.ink} strokeWidth={5} />
        {[x0 + 2 * cell, x0 + 3 * cell].map((tx) => (
          <line key={tx} x1={tx} y1={240} x2={tx} y2={276} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <text x={x0 + 2.5 * cell} y={232} textAnchor="middle" fontFamily={FONT}
          fontWeight={800} fontSize={28} fill={KRP.ink}>1階</text>
      </g>
      {/* 札 */}
      <TagPlate x={1510} y={200} text="1階ごと +2%" size={48} t={seg(f, 6, 20)}
        fill={C.candle} rot={-1} />
      <TagPlate x={1510} y={312} text="いまの値段" size={36} t={seg(f, 14, 28)} />
    </Frame>
  );
};

// ===== #245 ただし、面白い例外があります。 =====
// 格: 並
// どこ: 検分の台。1階から10階までの「+2%」の立て札が横一列に打ってあり、右端の1本だけ布が掛かっている
// 演出: ★#244 の階段グラフはここでは出さない (同じ絵を続けない。絵そのものを替えた)。
//       板の縁・木目・真鍮の六角釘・杭・打ち込んだ土・影、布の折り目と麻紐まで作り込む
// 動き: 立て札が左から順に立つ (f=2〜34) / 布の裾が揺れる / ？が1つだけ跳ねて出る / 人が覗き込む
// 絵: 横一列の「+2%」の立て札10本。右端の1本だけ布が掛かって中が見えない。その上に大きな？が1つ。覗き込む人
const Kb6cOmoshiroiReigai: React.FC<{ f: number }> = ({ f }) => {
  const GY = 712;                                  // 杭を打ち込む地面の線
  const BT = 442, BH = 108, BW = 112;              // 板の上端・高さ・幅
  const N = 10;
  const hem = Math.sin(f / 9) * 7;                 // 布の裾のゆれ
  return (
    <Frame f={f} seed={878} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.12} />
      {/* 地面と、杭を打ち込んだ土 */}
      <line x1={90} y1={GY} x2={1860} y2={GY}
        stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <g stroke={BP.shaftDark} strokeWidth={5} opacity={0.55}>
        {Array.from({ length: 23 }, (_, i) => (
          <line key={i} x1={100 + i * 78} y1={GY + 12} x2={126 + i * 78} y2={GY + 38} />
        ))}
      </g>
      {/* 立て札 10本 (1階〜10階ぶん)。左から順に立つ */}
      {Array.from({ length: N }, (_, i) => {
        const t = easeOut(clamp01(seg(f, 2 + i * 2.2, 14 + i * 2.2)));
        if (t <= 0) return null;
        const cx = 470 + i * 140;
        const by = BT + (1 - t) * 46;                // 下から持ち上がって立つ
        const odd = i === N - 1;                     // ★例外はこの1本だけ
        return (
          <g key={i} opacity={t}>
            <ellipse cx={cx + 12} cy={GY + 5} rx={64} ry={11} fill={KRP.ink} opacity={0.12} />
            {/* 杭 */}
            <rect x={cx - 11} y={by + BH - 8} width={22} height={GY - by - BH + 12}
              fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
            <line x1={cx} y1={by + BH + 12} x2={cx} y2={GY - 10}
              stroke={BP.woodDark} strokeWidth={3} opacity={0.8} />
            {/* 板 */}
            <rect x={cx - BW / 2} y={by} width={BW} height={BH} rx={6}
              fill={C.candle} stroke={KRP.ink} strokeWidth={6} />
            <rect x={cx - BW / 2 + 9} y={by + 9} width={BW - 18} height={BH - 18} rx={4}
              fill="none" stroke={BP.woodDark} strokeWidth={3} opacity={0.45} />
            <HexBolt x={cx - BW / 2 + 19} y={by + 19} r={7} rot={12} fill={BP.brassDark} />
            <HexBolt x={cx + BW / 2 - 19} y={by + 19} r={7} rot={-8} fill={BP.brassDark} />
            <text x={cx} y={by + BH / 2 + 15} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={38} fill={KRP.ink}>+2%</text>
            {/* 階数 */}
            <text x={cx} y={GY + 76} textAnchor="middle" fontFamily={FONT}
              fontWeight={800} fontSize={27} fill={KRP.ink}>{i + 1}階</text>
            {/* ★右端の1本だけ布が掛かっていて、中身が見えない */}
            {odd && (
              <g>
                <path
                  d={`M${cx - BW / 2 - 12},${by - 16} H${cx + BW / 2 + 12} V${by + BH + 4}`
                    + ` C${cx + 44},${by + BH + 16 + hem} ${cx + 16},${by + BH - 2 - hem} ${cx - 8},${by + BH + 12 + hem}`
                    + ` C${cx - 34},${by + BH + 22 - hem} ${cx - 50},${by + BH - 4 + hem} ${cx - BW / 2 - 12},${by + BH + 6} Z`}
                  fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
                <g stroke={C.stoneDark} strokeWidth={4} opacity={0.75} fill="none">
                  <path d={`M${cx - 30},${by - 10} q7,58 -2,112`} />
                  <path d={`M${cx + 34},${by - 10} q-8,56 0,110`} />
                </g>
                <Rope x1={cx - BW / 2 - 18} y1={by + 26} x2={cx + BW / 2 + 18} y2={by + 22}
                  w={11} kind="hemp" f={f} />
              </g>
            )}
          </g>
        );
      })}
      {/* ★疑問は1つに絞る (？は布の掛かった1本の真上だけ) */}
      <QMark x={1730} y={390} s={2.6} f={f} t={seg(f, 24, 38)} />
      <Arrow x={1650} y={506} s={1.1} rot={0} t={seg(f, 30, 42)} color={KRP.red} />
      {/* 覗き込む人 */}
      <Person x={250} y={GY} s={1.05} f={f} cloth={KRP.blue} clothDark={KRP.blueDeep}
        hair="cap" face="surprised" gaze={[0.85, -0.4]} lean={3} />
      {/* 札 */}
      <TagPlate x={330} y={248} text="例外" size={56} t={seg(f, 6, 20)}
        fill={C.candle} color={KRP.red} rot={-2} />
      <TagPlate x={900} y={248} text="どれも +2%" size={40} t={seg(f, 14, 28)} />
    </Frame>
  );
};

// ===== #246 韓国の研究では、最上階は1〜8%安いそうです。 =====
// 格: 並
// どこ: 日中。少し斜め (正面＋右の側面) から見た集合住宅の上の5階ぶん。壁は画面の下へ抜ける
// 演出: ★#244 の階段グラフはここでは出さない (同じ絵を続けない。絵そのものを替えた)。
//       屋上の塔屋・給水塔・はしご・手すり、各階のベランダ・窓の桟・壁の目地、
//       手前の報告書の綴じクリップと中の小さな図まで作り込む
// 動き: 下の階の値札が順に出る / 最上階だけ「+2%」が引っ込んで赤い「−1〜8%」に架け替わる (f=16〜32)
//       / 屋上から赤い矢印が落ちる / 窓の照り返しが動く / 雲が流れる / 研究者が見上げる
// 絵: 斜めから見た最上階まわり。下の階は「+2%」、最上階だけ赤い「−1〜8%」。手前に韓国の研究の報告書と研究者
const Kb6cKankoku1to8: React.FC<{ f: number }> = ({ f }) => {
  const FL = 600, FR = 1330;                 // 正面の壁の左右
  const DX = 150, DY = -70;                  // 側面の奥行き (右へ行くほど上がる)
  const TOP = 300, FH = 132;                 // 最上階の床の上端・1階ぶんの高さ
  const BOT = 1240;                          // 壁は画面の下へ抜ける (寄っている印)
  const sy = (d: number, y: number) => y + (DY * d) / DX;   // 側面の点 (奥行き d のときの y)
  const glint = Math.sin(f / 17) * 18;                      // 窓の照り返しの動き
  const cloud = Math.sin(f / 41) * 14;                      // 雲の流れ
  return (
    <Frame f={f} seed={879} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.1} />
      {/* 雲 (空いた左上を埋める。ゆっくり流れる) */}
      {[{ cx: 250, cy: 246, s: 1 }, { cx: 470, cy: 190, s: 0.72 }].map((c) => (
        <g key={c.cx} transform={`translate(${c.cx + cloud} ${c.cy}) scale(${c.s})`}>
          <path d="M-110,24 q-6,-40 34,-44 q10,-38 56,-30 q26,-30 62,-6 q42,-6 44,34 q24,8 14,46 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
        </g>
      ))}

      {/* ===== 建物 (上の5階ぶんだけ。斜めから) ===== */}
      {/* 右の側面 */}
      <polygon points={`${FR},${TOP} ${FR + DX},${sy(DX, TOP)} ${FR + DX},${sy(DX, BOT)} ${FR},${BOT}`}
        fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} />
      {/* 屋上の天面 */}
      <polygon points={`${FL},${TOP} ${FR},${TOP} ${FR + DX},${sy(DX, TOP)} ${FL + DX},${sy(DX, TOP)}`}
        fill={BP.shaftDark} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
        {[40, 80, 120].map((d) => (
          <line key={d} x1={FL + d} y1={sy(d, TOP)} x2={FR + d} y2={sy(d, TOP)} />
        ))}
      </g>
      {/* 正面の壁 */}
      <rect x={FL} y={TOP} width={FR - FL} height={BOT - TOP}
        fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      {/* 壁の目地 (階のあいだの細い線) */}
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.22}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={FL + 8} y1={TOP + 66 + i * 66} x2={FR - 8} y2={TOP + 66 + i * 66} />
        ))}
      </g>
      {/* ★最上階だけ色を落とす (ここだけ安い) */}
      <rect x={FL} y={TOP} width={FR - FL} height={FH} fill={KRP.red} opacity={0.1} />
      <polygon points={`${FR},${TOP} ${FR + DX},${sy(DX, TOP)} ${FR + DX},${sy(DX, TOP + FH)} ${FR},${TOP + FH}`}
        fill={KRP.red} opacity={0.09} />

      {/* 階のしきり */}
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.6}>
        {Array.from({ length: 5 }, (_, i) => {
          const ty = TOP + (i + 1) * FH;
          return (
            <g key={i}>
              <line x1={FL} y1={ty} x2={FR} y2={ty} />
              <line x1={FR} y1={ty} x2={FR + DX} y2={sy(DX, ty)} />
            </g>
          );
        })}
      </g>

      {/* 各階の窓とベランダ */}
      {Array.from({ length: 5 }, (_, i) => {
        const ty = TOP + i * FH;
        // 最上階は部屋が広いので窓が大きく2枚、下の階は3枚
        const wins = i === 0
          ? [{ x: 646, w: 150 }, { x: 826, w: 150 }]
          : [{ x: 646, w: 118 }, { x: 814, w: 118 }, { x: 982, w: 118 }];
        return (
          <g key={i}>
            {wins.map((wn) => (
              <g key={wn.x}>
                <rect x={wn.x} y={ty + 22} width={wn.w} height={58}
                  fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
                <polygon
                  points={`${wn.x + 24 + glint},${ty + 78} ${wn.x + 52 + glint},${ty + 78} ${wn.x + 84 + glint},${ty + 26} ${wn.x + 56 + glint},${ty + 26}`}
                  fill={KRP.white} opacity={0.38} />
                <line x1={wn.x + wn.w / 2} y1={ty + 22} x2={wn.x + wn.w / 2} y2={ty + 80}
                  stroke={KRP.ink} strokeWidth={4} />
                <line x1={wn.x} y1={ty + 51} x2={wn.x + wn.w} y2={ty + 51}
                  stroke={KRP.ink} strokeWidth={3} opacity={0.7} />
              </g>
            ))}
            {/* 側面の窓 (1枚だけ。斜めに見える) */}
            <polygon
              points={`${FR + 32},${sy(32, ty + 24)} ${FR + 112},${sy(112, ty + 24)} ${FR + 112},${sy(112, ty + 78)} ${FR + 32},${sy(32, ty + 78)}`}
              fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
            {/* ベランダの手すり (最上階にはない。屋上の広いテラスを使うから) */}
            {i > 0 && (
              <g>
                <rect x={FL + 16} y={ty + 96} width={FR - FL - 32} height={20}
                  fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} opacity={0.92} />
                <g stroke={BP.ironDark} strokeWidth={5} opacity={0.85}>
                  {Array.from({ length: 19 }, (_, k) => (
                    <line key={k} x1={FL + 30 + k * 38} y1={ty + 100}
                      x2={FL + 30 + k * 38} y2={ty + 124} />
                  ))}
                </g>
                <line x1={FR} y1={ty + 106} x2={FR + DX - 16} y2={sy(DX - 16, ty + 106)}
                  stroke={BP.ironDark} strokeWidth={9} opacity={0.9} />
              </g>
            )}
          </g>
        );
      })}

      {/* 屋上の塔屋 (階段室) */}
      <g>
        <polygon points="900,160 956,134 956,230 900,256"
          fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={700} y={160} width={200} height={96} fill={C.stone}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={762} y={192} width={62} height={64} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5} />
        <circle cx={812} cy={224} r={6} fill={BP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 屋上の給水塔とはしご */}
      <g>
        <g stroke={KRP.ink} strokeWidth={4}>
          {[1130, 1186, 1242].map((lx) => (
            <rect key={lx} x={lx} y={196} width={13} height={62} fill={BP.ironDark} />
          ))}
          <line x1={1130} y1={226} x2={1255} y2={226} />
        </g>
        <rect x={1108} y={118} width={170} height={80} rx={18} fill={C.zinc}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.zincDark} strokeWidth={5} opacity={0.9}>
          <line x1={1112} y1={144} x2={1274} y2={144} />
          <line x1={1112} y1={172} x2={1274} y2={172} />
        </g>
        <g stroke={KRP.ink} strokeWidth={4}>
          <line x1={1288} y1={132} x2={1288} y2={258} />
          <line x1={1310} y1={132} x2={1310} y2={258} />
          {Array.from({ length: 6 }, (_, k) => (
            <line key={k} x1={1288} y1={142 + k * 22} x2={1310} y2={142 + k * 22} />
          ))}
        </g>
      </g>
      {/* 屋上の手すり (手前の縁。屋上の物より手前にあるので最後に描く) */}
      <g>
        <line x1={FL} y1={TOP - 54} x2={FR} y2={TOP - 54} stroke={BP.ironDark} strokeWidth={9} />
        <line x1={FL} y1={TOP - 28} x2={FR} y2={TOP - 28} stroke={BP.ironDark} strokeWidth={5} />
        <g stroke={BP.ironDark} strokeWidth={6}>
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={FL + 10 + k * 90} y1={TOP - 54} x2={FL + 10 + k * 90} y2={TOP} />
          ))}
        </g>
      </g>

      {/* ===== 値札 ===== */}
      {/* 下の階は「+2%」 (下から順に出る) */}
      <TagPlate x={1215} y={788} text="+2%" size={32} t={seg(f, 4, 16)} fill={C.candle} />
      <TagPlate x={1215} y={656} text="+2%" size={32} t={seg(f, 8, 20)} fill={C.candle} />
      <TagPlate x={1215} y={524} text="+2%" size={32} t={seg(f, 12, 24)} fill={C.candle} />
      {/* ★最上階だけ架け替わる: 「+2%」が引っ込み、赤い「−1〜8%」が少し下に下りる */}
      <TagPlate x={1215} y={366} text="+2%" size={32}
        t={seg(f, 4, 16) * (1 - seg(f, 16, 26))} fill={C.candle} />
      <TagPlate x={1200} y={400} text="−1〜8%" size={34} t={seg(f, 18, 32)}
        fill={C.candle} color={KRP.red} rot={-1} />
      {/* 最上階の札から建物へ引き出し線 */}
      <line x1={1566} y1={330} x2={1474} y2={354} stroke={KRP.ink} strokeWidth={5}
        opacity={easeOut(seg(f, 12, 26))} />
      {/* 「最上階だけ安い」へ落ちる赤い矢印 */}
      <ForceArrow x={1640} y={372} len={72} rot={90} w={20}
        color={KRP.red} t={seg(f, 20, 34)} />
      <TagPlate x={1640} y={330} text="最上階" size={34} t={seg(f, 10, 24)} />
      <TagPlate x={1640} y={470} text="最上階だけ安い" size={32} t={seg(f, 24, 38)}
        fill={C.candle} color={KRP.red} />

      {/* ===== 手前: 韓国の研究の報告書 ===== */}
      <g transform="rotate(-6 320 545)">
        <rect x={176} y={434} width={290} height={226} rx={6} fill={KRP.ink}
          opacity={0.12} transform="translate(10 12)" />
        <rect x={176} y={434} width={290} height={226} rx={6} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 綴じクリップ */}
        <rect x={290} y={418} width={64} height={30} rx={7} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={4} />
        <line x1={306} y1={424} x2={306} y2={442} stroke={BP.steelDark} strokeWidth={4} />
        <line x1={338} y1={424} x2={338} y2={442} stroke={BP.steelDark} strokeWidth={4} />
        {/* 本文の罫 */}
        <g stroke={KRP.gray} strokeWidth={5} opacity={0.85}>
          <line x1={200} y1={476} x2={420} y2={476} />
          <line x1={200} y1={498} x2={392} y2={498} />
          <line x1={200} y1={520} x2={428} y2={520} />
        </g>
        {/* 中の小さな図: 下の階は上へ、最上階だけ下へ */}
        <line x1={198} y1={606} x2={444} y2={606} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={210 + k * 52} y={606 - (28 + k * 12)} width={34}
            height={28 + k * 12} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <rect x={366} y={606} width={34} height={30} fill={KRP.red}
          stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        <text x={422} y={646} textAnchor="middle" fontFamily={FONT} fontWeight={800}
          fontSize={26} fill={KRP.red}>−%</text>
      </g>
      <TagPlate x={320} y={360} text="韓国の研究" size={34} t={seg(f, 6, 20)}
        fill={C.candle} rot={-6} />
      {/* 見上げる研究者 */}
      <Person x={300} y={820} s={1.0} f={f} cloth={KRP.white} clothDark={KRP.gray}
        hair="cap" glasses face="surprised" gaze={[0.9, -0.6]} lean={4} />
    </Frame>
  );
};

// ===== #247 屋根の下は、冷暖房にお金がかかるからです。 =====
// 格: 並
// どこ: 最上階の部屋を真横から切った断面。斜めの天井がそのまま屋根の裏になっている
// 演出: 描くのは「屋根の下の部屋」ひとつ。屋根の上に陽、外に雪。室内はエアコンと電気の目盛りだけ
// 動き: 熱の矢印が屋根を抜けて降りてくる / 冷えが上がる / エアコンの風が出る / 電気代の目盛りが上がる
// 絵: 最上階の部屋。斜めの天井の上に夏の熱と冬の冷えの印。エアコンと電気代の目盛りが上がる
const Kb6cYaneNoShita: React.FC<{ f: number }> = ({ f }) => {
  const RL = 236, RR = 1700, FLR = 820;                   // 部屋の左右と床
  const CL = 300, CR = 560;                               // 天井の左端・右端の高さ
  const heat = easeOut(clamp01(seg(f, 4, 24)));
  const cold = easeOut(clamp01(seg(f, 10, 30)));
  const blow = easeOut(clamp01(seg(f, 14, 32)));
  const meter = easeOut(clamp01(seg(f, 16, 40)));
  const wob = Math.sin(f / 9) * 6;
  const ceilY = (x: number) => CL + ((x - RL) / (RR - RL)) * (CR - CL);
  return (
    <Frame f={f} seed={880} bg={KRP.cream}>
      {/* 外の空 (屋根の上) */}
      <rect x={-40} y={-40} width={W + 80} height={700} fill={C.snow} opacity={0.5} />
      {/* 陽 (夏の熱) */}
      <circle cx={1520} cy={150} r={66} fill={C.candle} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.orange} strokeWidth={8} strokeLinecap="round" opacity={0.9}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * 36 + f * 0.8) * Math.PI / 180;
          return (
            <line key={i} x1={1520 + Math.cos(a) * 82} y1={150 + Math.sin(a) * 82}
              x2={1520 + Math.cos(a) * 112} y2={150 + Math.sin(a) * 112} />
          );
        })}
      </g>
      {/* 雪 (冬の冷え) */}
      {Array.from({ length: 11 }, (_, i) => {
        const sx2 = 180 + i * 104 + Math.sin((f + i * 9) / 13) * 14;
        const sy2 = 60 + ((f * 1.6 + i * 61) % 190);
        return (
          <g key={i} stroke={C.nightPale} strokeWidth={7} strokeLinecap="round"
            transform={`translate(${sx2} ${sy2}) rotate(${f * 1.4 + i * 20})`} opacity={0.95}>
            <line x1={-18} y1={0} x2={18} y2={0} />
            <line x1={0} y1={-18} x2={0} y2={18} />
            <line x1={-12} y1={-12} x2={12} y2={12} />
            <line x1={12} y1={-12} x2={-12} y2={12} />
          </g>
        );
      })}
      {/* 屋根 (勾配。亜鉛板の継ぎ目つき) */}
      <polygon points={`${RL - 90},${CL - 76} ${RR + 90},${CR - 76} ${RR + 90},${CR - 18} ${RL - 90},${CL - 18}`}
        fill={C.zinc} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={C.zincDark} strokeWidth={5} opacity={0.9}>
        {Array.from({ length: 13 }, (_, i) => {
          const x = RL - 70 + i * 130;
          const y = (CL - 76) + ((x - (RL - 90)) / (RR + 180)) * (CR - CL);
          return <line key={i} x1={x} y1={y} x2={x} y2={y + 58} />;
        })}
      </g>
      {/* 室内: 壁と床 */}
      <polygon points={`${RL},${CL} ${RR},${CR} ${RR},${FLR} ${RL},${FLR}`}
        fill={C.stone} stroke={KRP.ink} strokeWidth={8} />
      {/* 天井の裏 (垂木) */}
      <g stroke={C.stoneDark} strokeWidth={6} opacity={0.75}>
        {Array.from({ length: 11 }, (_, i) => {
          const x = RL + 60 + i * 136;
          return <line key={i} x1={x} y1={ceilY(x)} x2={x} y2={ceilY(x) + 46} />;
        })}
      </g>
      <rect x={RL} y={FLR} width={RR - RL} height={34} fill={BP.wood}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={4}>
        {[380, 620, 860, 1100, 1340, 1580].map((x) => (
          <line key={x} x1={x} y1={FLR + 4} x2={x} y2={FLR + 30} />
        ))}
      </g>
      {/* 熱と冷えが室内に溜まる色 */}
      <polygon points={`${RL},${CL} ${RR},${CR} ${RR},${CR + 150} ${RL},${CL + 150}`}
        fill={KRP.orange} opacity={0.22 * heat} />
      <polygon points={`${RL},${FLR - 150} ${RR},${FLR - 150} ${RR},${FLR} ${RL},${FLR}`}
        fill={C.rain} opacity={0.2 * cold} />
      {/* 熱が屋根を抜けて降りてくる */}
      {[780, 1030, 1270, 1490].map((hx, i) => (
        <ForceArrow key={hx} x={hx} y={ceilY(hx) - 130} len={176} rot={90} w={20}
          color={KRP.orange} t={seg(f, 6 + i * 3, 22 + i * 3)} />
      ))}
      {/* 冷えが抜けて出ていく */}
      {[480, 640].map((cx2, i) => (
        <ForceArrow key={cx2} x={cx2} y={ceilY(cx2) + 70} len={168} rot={-90} w={20}
          color={C.rain} t={seg(f, 12 + i * 4, 28 + i * 4)} />
      ))}
      {/* エアコン (壁掛け) と風 */}
      <g>
        <rect x={1300} y={590} width={300} height={104} rx={14} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={1312} y={668} width={276} height={22} rx={8} fill={C.stoneDark}
          stroke={KRP.ink} strokeWidth={5} />
        <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.8}>
          {[612, 628, 644].map((y) => <line key={y} x1={1318} y1={y} x2={1582} y2={y} />)}
        </g>
        <circle cx={1566} cy={606} r={9} fill={C.emerGreen} stroke={KRP.ink} strokeWidth={3}
          opacity={(f % 20) < 10 ? 1 : 0.35} />
        {/* 吹き出す風 */}
        {[0, 1, 2].map((i) => (
          <path key={i}
            d={`M${1300 - i * 86},${700 + i * 16} q-90,${26 + wob} -176,${4 + wob * 1.4}`}
            fill="none" stroke={C.nightPale} strokeWidth={9} strokeLinecap="round"
            opacity={blow * (0.85 - i * 0.2)} />
        ))}
      </g>
      {/* 電気代の目盛り (縦。上がる) */}
      <g>
        <rect x={290} y={430} width={86} height={340} rx={10} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={300} y={430 + 330 - 320 * meter} width={66} height={320 * meter}
          fill={KRP.red} opacity={0.85} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={376} y1={752 - i * 40} x2={i % 2 === 0 ? 404 : 392} y2={752 - i * 40} />
          ))}
        </g>
        {[0, 4, 8].map((i) => (
          <text key={i} x={414} y={762 - i * 40} fontFamily={FONT} fontWeight={800}
            fontSize={24} fill={KRP.ink}>{i * 25}</text>
        ))}
        <rect x={290} y={430} width={86} height={340} rx={10} fill="none"
          stroke={KRP.ink} strokeWidth={7} />
        <circle cx={333} cy={430 + 334 - 320 * meter} r={14} fill={KRP.red}
          stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 部屋の人 (1人だけ。暑さにうんざり) */}
      <Person x={1000} y={822} s={0.74} f={f} cloth={C.nightPale} clothDark={C.night}
        hair="cap" face="worried" gaze={[0.2, -0.6]} />
      {/* 札 */}
      <TagPlate x={1200} y={766} text="冷暖房" size={44} t={seg(f, 20, 34)} />
      <TagPlate x={334} y={372} text="電気代" size={38} t={seg(f, 10, 24)}
        fill={C.candle} />
      <TagPlate x={760} y={560} text="屋根のすぐ下" size={40} t={seg(f, 2, 16)} />
      <TagPlate x={1166} y={196} text="夏の熱" size={40} t={seg(f, 8, 22)}
        color={KRP.orange} />
      <TagPlate x={452} y={150} text="冬の冷え" size={40} t={seg(f, 14, 28)}
        color={C.nightPale} />
    </Frame>
  );
};

// ===== #248 つまり値段は、高さでも眺めでもありません。 =====
// 格: 図
// どこ: 方眼の上。鎖で吊った大きな木の看板が2枚だけ下がっている
// 演出: 人も背景も置かない。板の木目・縁の額・六角ボルト・鎖の輪まで作り込む
// 動き: 2枚が少しずつ振れる / 赤い×が順に打たれる (f=10〜22, 20〜32) / 打たれた板が沈む
// 絵: 「高さ」「眺め」と書いた大きな札2枚に赤い×
const Kb6cTakasaDemoNagameDemo: React.FC<{ f: number }> = ({ f }) => {
  const BW = 600, BH = 300, BY = 300;
  const boards: { x: number; label: string; t: number }[] = [
    { x: 250, label: "高さ", t: seg(f, 10, 22) },
    { x: 1070, label: "眺め", t: seg(f, 20, 32) },
  ];
  return (
    <Frame f={f} seed={881} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.14} />
      {/* 吊り元の梁 */}
      <rect x={-20} y={66} width={W + 40} height={58} fill={BP.wood}
        stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={60} y1={95} x2={1860} y2={95} n={14} r={8} fill={BP.woodDark} />
      {boards.map((b, bi) => {
        const hit = easeOut(clamp01(b.t));
        const sway = Math.sin(f / 15 + bi * 2.1) * 1.6 * (1 - hit * 0.6);
        const sink = hit * 16;
        const cx2 = b.x + BW / 2;
        return (
          <g key={b.label}>
            {/* 鎖 */}
            {[-190, 190].map((o) => (
              <g key={o}>
                {Array.from({ length: 7 }, (_, i) => (
                  <ellipse key={i} cx={cx2 + o + sway * (i / 7) * 3}
                    cy={128 + i * 26 + sink * (i / 7)} rx={10} ry={16}
                    fill="none" stroke={BP.steelDark} strokeWidth={6} />
                ))}
              </g>
            ))}
            <g transform={`translate(${cx2} ${124}) rotate(${sway}) translate(${-cx2} ${-124 + sink})`}>
              {/* 板 */}
              <rect x={b.x + 10} y={BY + 12} width={BW} height={BH} fill={KRP.ink} opacity={0.18} />
              <rect x={b.x} y={BY} width={BW} height={BH} fill={BP.woodLight}
                stroke={KRP.ink} strokeWidth={9} />
              <g stroke={BP.woodDark} strokeWidth={4} opacity={0.55}>
                {[48, 112, 188, 252].map((o) => (
                  <path key={o} d={`M${b.x + 6},${BY + o} q${BW * 0.5},${o % 2 ? 16 : -16} ${BW - 12},0`}
                    fill="none" />
                ))}
              </g>
              {/* 縁の額 */}
              <rect x={b.x + 22} y={BY + 22} width={BW - 44} height={BH - 44} fill="none"
                stroke={BP.woodDark} strokeWidth={6} />
              {[[b.x + 40, BY + 40], [b.x + BW - 40, BY + 40],
                [b.x + 40, BY + BH - 40], [b.x + BW - 40, BY + BH - 40]].map(([hx, hy], i) => (
                  <HexBolt key={i} x={hx} y={hy} r={15} rot={12 * i} fill={BP.brass} />
                ))}
              {/* 文字 */}
              {/* 赤い× (文字より先に打つ。文字は白縁で浮かせる) */}
              <XMark x={cx2} y={BY + BH / 2} s={2.3 * pop(clamp01(b.t))} t={1} />
              <text x={cx2} y={BY + BH / 2 + 48} textAnchor="middle" fontFamily={FONT}
                fontWeight={900} fontSize={132} fill={KRP.ink}
                stroke={BP.woodLight} strokeWidth={14} paintOrder="stroke">{b.label}</text>
            </g>
            {/* 打たれたときの埃 */}
            {hit > 0.02 && hit < 0.98 && (
              <g opacity={1 - hit}>
                {[-1, 1].map((sg) => (
                  <circle key={sg} cx={cx2 + sg * (60 + hit * 90)} cy={BY + BH + 20 + hit * 30}
                    r={12 + hit * 16} fill={BP.shaftDark} opacity={0.5} />
                ))}
              </g>
            )}
          </g>
        );
      })}
      {/* 札 */}
      <TagPlate x={960} y={752} text="決め手ではない" size={46} t={seg(f, 28, 42)}
        color={KRP.red} rot={-1} />
      <TagPlate x={960} y={200} text="値段" size={44} t={seg(f, 2, 14)} fill={C.candle} />
    </Frame>
  );
};

// ===== #249 代金を誰が払うか、で決まるんです。 =====
// 格: 図
// どこ: 方眼の上。左に「誰が払うか」の看板、右に払う人の側。その間を矢印がつなぐ
// 演出: 人も背景も置かない。看板・○の判・硬貨・目盛りの刻みと数字まで作り込む
// 動き: ○が判のように押される / 矢印が人の側へ伸びる / 下の目盛りの指針が人の側へ寄る (f=18〜40)
// 絵: 「誰が払うか」の札に○。矢印が人の側へ向く。目盛りがそれに合わせて動く
const Kb6cDareGaHarau: React.FC<{ f: number }> = ({ f }) => {
  const BX = 180, BY = 250, BW = 620, BH = 300;           // 看板
  const SL = 260, SR = 1800, SY = 740;                    // 目盛り
  const slide = easeOut(clamp01(seg(f, 18, 40)));
  const ptrX = lerp((SL + SR) / 2, SR - 220, slide);
  const coin = easeOut(clamp01(seg(f, 22, 38)));
  return (
    <Frame f={f} seed={882} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.14} />
      {/* 看板 */}
      <rect x={BX + 10} y={BY + 12} width={BW} height={BH} fill={KRP.ink} opacity={0.18} />
      <rect x={BX} y={BY} width={BW} height={BH} fill={BP.woodLight}
        stroke={KRP.ink} strokeWidth={9} />
      <g stroke={BP.woodDark} strokeWidth={4} opacity={0.55}>
        {[52, 128, 206, 262].map((o) => (
          <path key={o} d={`M${BX + 6},${BY + o} q${BW * 0.5},${o % 2 ? 14 : -14} ${BW - 12},0`}
            fill="none" />
        ))}
      </g>
      <rect x={BX + 22} y={BY + 22} width={BW - 44} height={BH - 44} fill="none"
        stroke={BP.woodDark} strokeWidth={6} />
      {[[BX + 40, BY + 40], [BX + BW - 40, BY + 40],
        [BX + 40, BY + BH - 40], [BX + BW - 40, BY + BH - 40]].map(([hx, hy], i) => (
          <HexBolt key={i} x={hx} y={hy} r={15} rot={12 * i} fill={BP.brass} />
        ))}
      {/* ○の判 (文字の上に押す) */}
      <Maru x={BX + BW / 2} y={BY + BH / 2} s={2.05} t={seg(f, 8, 22)}
        color={KRP.green} stroke={18} />
      <text x={BX + BW / 2} y={BY + 136} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={92} fill={KRP.ink}
        stroke={BP.woodLight} strokeWidth={12} paintOrder="stroke">誰が</text>
      <text x={BX + BW / 2} y={BY + 248} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={92} fill={KRP.ink}
        stroke={BP.woodLight} strokeWidth={12} paintOrder="stroke">払うか</text>
      {/* 矢印が人の側へ */}
      <ForceArrow x={BX + BW + 60} y={BY + BH / 2} len={420} rot={0} w={28}
        color={KRP.green} t={seg(f, 14, 32)} label="代金" labelSize={40} />
      {/* 払う人の側 */}
      <g>
        {[1380, 1570, 1760].map((px, i) => (
          <PersonIcon key={px} x={px} y={580} s={1.5} f={f} ph={i} fill={C.night} />
        ))}
        {/* 手から出る硬貨 */}
        {[0, 1, 2, 3].map((i) => {
          const t2 = clamp01(coin * 1.3 - i * 0.18);
          if (t2 <= 0) return null;
          const cx2 = lerp(1470, 1520 + i * 26, t2);
          const cy2 = lerp(440, 236, t2) - Math.sin(t2 * Math.PI) * 26;
          return (
            <g key={i} opacity={1 - t2 * 0.25}>
              <circle cx={cx2} cy={cy2} r={23} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={cx2} cy={cy2} r={11} fill="none" stroke={C.goldDark} strokeWidth={4} />
            </g>
          );
        })}
      </g>
      {/* 目盛り (指針が人の側へ寄る) */}
      <line x1={SL} y1={SY} x2={SR} y2={SY} stroke={KRP.ink} strokeWidth={10}
        strokeLinecap="round" />
      <g>
        {Array.from({ length: 21 }, (_, i) => {
          const x = lerp(SL, SR, i / 20);
          const big = i % 5 === 0;
          return (
            <g key={i}>
              <line x1={x} y1={SY} x2={x} y2={SY + (big ? 30 : 18)} stroke={KRP.ink}
                strokeWidth={big ? 7 : 5} />
              {big && (
                <text x={x} y={SY + 62} textAnchor="middle" fontFamily={FONT}
                  fontWeight={800} fontSize={26} fill={KRP.ink}>{i * 5}</text>
              )}
            </g>
          );
        })}
      </g>
      {/* 指針 */}
      <g transform={`translate(${ptrX} ${SY})`}>
        <polygon points="0,-6 -26,-72 26,-72" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-9} y={-120} width={18} height={54} fill={KRP.red}
          stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 目盛りの両端のしるし */}
      <TagPlate x={340} y={672} text="建物" size={34} t={seg(f, 6, 20)} />
      <TagPlate x={1740} y={672} text="払う人" size={34} t={seg(f, 12, 26)}
        fill={C.candle} />
      {/* 札 */}
      <TagPlate x={1140} y={178} text="値段はここで決まる" size={40} t={seg(f, 26, 40)}
        fill={C.candle} rot={-1} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb6_1925_ny: (f) => <Kb6cN1925Ny f={f} />,
  kb6_moto_wa_shiyounin: (f) => <Kb6cMotoWaShiyounin f={f} />,
  kb6_460heihou: (f) => <Kb6cN460Heihou f={f} />,
  kb6_penthouse_monooki: (f) => <Kb6cPenthouseMonooki f={f} />,
  kb6_monooki_no_namae: (f) => <Kb6cMonookiNoNamae f={f} />,
  kb6_1kai_2percent: (f) => <Kb6cN1Kai2Percent f={f} />,
  kb6_omoshiroi_reigai: (f) => <Kb6cOmoshiroiReigai f={f} />,
  kb6_kankoku_1_8: (f) => <Kb6cKankoku1to8 f={f} />,
  kb6_yane_no_shita: (f) => <Kb6cYaneNoShita f={f} />,
  kb6_takasa_demo_nagame_demo: (f) => <Kb6cTakasaDemoNagameDemo f={f} />,
  kb6_dare_ga_harau: (f) => <Kb6cDareGaHarau f={f} />,
};

export const K_B6C_MOTIFS: string[] = [
  "kb6_1925_ny",                  // #239 1925年、ニューヨークのあるビルの最上階。
  "kb6_moto_wa_shiyounin",        // #240 もともと、使用人の部屋として計画された階でした。
  "kb6_460heihou",                // #241 それが、約460平方メートルの住居になります。
  "kb6_penthouse_monooki",        // #242 名前は、ペントハウス。元は物置の呼び名です。
  "kb6_monooki_no_namae",         // #243 ★物置の名前が、いちばん高い部屋の名前になりました。
  "kb6_1kai_2percent",            // #244 いまは、1階上がるごとに2%ほど高くなります。
  "kb6_omoshiroi_reigai",         // #245 ただし、面白い例外があります。
  "kb6_kankoku_1_8",              // #246 韓国の研究では、最上階は1〜8%安いそうです。
  "kb6_yane_no_shita",            // #247 屋根の下は、冷暖房にお金がかかるからです。
  "kb6_takasa_demo_nagame_demo",  // #248 つまり値段は、高さでも眺めでもありません。
  "kb6_dare_ga_harau",            // #249 代金を誰が払うか、で決まるんです。
];

export const kosoB6cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
