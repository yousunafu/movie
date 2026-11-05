// 「なぜ高層ビルは生まれたのか」: 第2章「人を、上げる。」安全装置の段
// 担当範囲: 文#76〜#82・7文。1文 = 1シーン = 1枚の絵。
// motif 名は必ず kb2_ で始める。WobbleDefs の seed はこのファイルでは 610〜616 を使う。
// 設計書: docs/koso-ch2-design.md (1文ごとの「格」と絵の中身が決まっている)
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
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, TowerOnPillars } from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, RopeFray, Sheave, GrooveSection, GuideRail, ToothRail,
  Spring, Pawl, Sparks, Car, Counterweight, Shaft, Balance,
  Maru, MaruBatsu, SpeedGraph, FloorScale, ForceArrow, ButtonPanel, Lever, FlowPlates,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。装置の色は BP を使う)
// ===================================================================
const C = {
  skyDay: "#CFE2F0",
  skyHaze: "#E2EAEF",
  skyDusk: "#F0CBA0",
  brick: "#B4704C",
  brickDark: "#8E5438",
  stone: "#CFC6B4",
  wood: "#A77C4E",
  woodDark: "#7E5B36",
  ink2: "#3A4350",
} as const;

// ===================================================================
// このファイルだけの “筆”
//   背景キットではない。線・粒・質感を引くための道具にすぎない。
//   「どこで・いつ・誰が・何をしている場面か」は 1文ごとにゼロから組む。
// ===================================================================

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

// 切石の積み (煉瓦より目が大きい)
const Stones: React.FC<{
  x: number; y: number; w: number; h: number; bw?: number; bh?: number;
  fill?: string; line?: string; opacity?: number;
}> = ({ x, y, w, h, bw = 118, bh = 56, fill = C.stone, line = "#A99E89", opacity = 1 }) => {
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

// 立ちのぼる煙 (煙突・蒸気・ほこり)
const Smoke: React.FC<{
  x: number; y: number; f: number; n?: number; r?: number; rise?: number;
  speed?: number; drift?: number; color?: string; opacity?: number; grow?: number;
}> = ({
  x, y, f, n = 6, r = 26, rise = 240, speed = 0.7, drift = 40,
  color = "#CFC8BC", opacity = 0.7, grow = 1.8,
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

// 遠景の街並み (seed で形が変わる。シーンごとに別の seed を渡す)
const RowOfBuildings: React.FC<{
  x0: number; x1: number; base: number; seed: number; minH?: number; maxH?: number;
  fill?: string; sw?: number; windows?: boolean; winColor?: string;
  opacity?: number; count?: number; roof?: boolean;
}> = ({
  x0, x1, base, seed, minH = 60, maxH = 180, fill = "#A99E89",
  sw = 3.5, windows = false, winColor = BP.glass, opacity = 1, count, roof = true,
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
            <rect x={x} y={base - h} width={w} height={h} fill={fill} stroke={KRP.ink} strokeWidth={sw} />
            {roof && r2 > 0.55 && (
              <rect x={x + w * 0.3} y={base - h - 22} width={w * 0.2} height={22}
                fill={fill} stroke={KRP.ink} strokeWidth={sw} />
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

// ガス灯 (1870年代の街灯)
const GasLamp: React.FC<{ x: number; y: number; s?: number; f?: number; lit?: boolean }> =
  ({ x, y, s = 1, f = 0, lit = false }) => {
    const glow = lit ? 0.35 + 0.2 * Math.sin(f / 13) : 0;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-9} y={-250} width={18} height={250} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-22} y={-18} width={44} height={18} rx={4} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -30 -250 L 30 -250 L 22 -300 L -22 -300 Z" fill={lit ? BP.lamp : KRP.white}
          stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
        <path d="M -24 -300 L 24 -300 L 0 -328 Z" fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        {lit && <circle cx={0} cy={-274} r={52} fill={KRP.yellow} opacity={glow} />}
        {lit && <circle cx={0} cy={-272} r={12} fill="#FFF3C8" />}
        <line x1={-26} y1={-232} x2={26} y2={-232} stroke={KRP.ink} strokeWidth={4} />
      </g>
    );
  };

// 帽子 3種 (Person の頭に重ねる。頭頂は局所 y=-292)
const Bowler: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = "#352E28" }) => (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <path d="M -54 -262 Q -56 -320 0 -320 Q 56 -320 54 -262 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-262} rx={90} ry={15} fill={color} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
const FlatCap: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = "#5C6670" }) => (
    <g transform={`translate(${x} ${y + bobOf(f, phase)}) scale(${s})`}>
      <path d="M -60 -268 Q -62 -312 0 -312 Q 62 -312 60 -268 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -62 -268 Q -96 -266 -100 -252 Q -62 -248 -10 -256 Z" fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
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

// ひび (木や樽が割れる)
const Crack: React.FC<{ d: string; t?: number; color?: string; sw?: number }> =
  ({ d, t = 1, color = KRP.ink, sw = 5 }) => {
    const tt = clamp01(t);
    if (tt <= 0.02) return null;
    return <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
      strokeLinejoin="round" opacity={tt} />;
  };

// 光の筋に舞うホコリ (倉庫・機械室の窓の下)
const Motes: React.FC<{
  x: number; y: number; w: number; h: number; f: number; n?: number; color?: string; opacity?: number;
}> = ({ x, y, w, h, f, n = 26, color = KRP.white, opacity = 0.75 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const p = ((((i / n) + (f * 0.5) / h) % 1) + 1) % 1;
      const xx = x + rnd(i * 7.7) * w + Math.sin(f / 21 + i) * 14;
      const yy = y + h - p * h;
      return <circle key={i} cx={xx} cy={yy} r={2 + rnd(i * 3.1) * 4}
        fill={color} opacity={opacity * (0.3 + 0.7 * Math.sin(p * Math.PI))} />;
    })}
  </g>
);

// 工房・機械室の壁にかかる道具 (釘に吊る)
const WallTools: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 吊り桟 */}
    <rect x={-250} y={-16} width={500} height={18} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 大ハンマー */}
    <g transform={`rotate(${Math.sin(f / 41) * 1.4} -186 0)`}>
      <rect x={-196} y={0} width={20} height={176} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-224} y={160} width={76} height={38} rx={6} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
    {/* 大きなスパナ */}
    <g transform={`rotate(${Math.sin(f / 33 + 1) * 1.6} -60 0)`}>
      <rect x={-70} y={0} width={20} height={150} rx={9} fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -84 146 L -36 146 L -36 186 L -56 186 L -56 168 L -64 168 L -64 186 L -84 186 Z"
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    {/* 油差し */}
    <g transform="translate(70 24)">
      <path d="M -36 60 L 36 60 L 30 6 L -30 6 Z" fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 24 16 L 96 -36" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" fill="none" />
      <rect x={-18} y={-10} width={36} height={18} rx={5} fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
    {/* ロープの束 */}
    <g transform="translate(206 40)">
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={0} cy={i * 22} rx={46 - i * 5} ry={16} fill="none"
          stroke={BP.hempDark} strokeWidth={10} />
      ))}
    </g>
    {/* 釘 */}
    <g>
      {[-186, -60, 70, 206].map((nx) => <circle key={nx} cx={nx} cy={-7} r={7}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3} />)}
    </g>
  </g>
);

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===== #76 そこで、切れても受け止める仕掛けが作られます。 =====
// 格: 山
// どこ: 1850年代の鉄工所の作業場。煉瓦の壁・高窓・板の床・天井の木梁。
// 演出: 梁から吊った試験台に、かご / 案内レール / 歯のレール / ばね / 爪が組み上がっている。
//       左の壁に道具、右に作業台と万力と木屑、高窓から光の筋が落ちて埃が舞う。
//       職人 (左) と親方 (右・爪を指さす) が、できたばかりの仕掛けを見ている。
// 動き: 吊りランプが揺れ、爪が小さく開閉し、埃が舞い、札が「ばね→爪→歯のレール→安全装置」の順に出る。
const Kb2UketomeruShikake: React.FC<{ f: number }> = ({ f }) => {
  const FLOOR = 782;
  const CAR_X = 820, CAR_Y = 706, CAR_W = 340, CAR_H = 352;
  const RAIL_L = 600, RAIL_T = 1180;
  const PIV = { x: 1005, y: 572 };
  const pawlRot = -28 + Math.sin(f / 16) * 3.4;
  const sway = Math.sin(f / 37) * 2.4;
  const t1 = seg(f, 6, 18), t2 = seg(f, 13, 25), t3 = seg(f, 19, 31), t4 = seg(f, 26, 40);
  return (
    <Frame f={f} seed={610} bg={KRP.cream}>
      {/* 煉瓦の壁 */}
      <Bricks x={-20} y={-20} w={W + 40} h={FLOOR + 20} bw={92} bh={40} />
      <rect x={-20} y={-20} width={W + 40} height={FLOOR + 20} fill={C.ink2} opacity={0.1} />
      {/* 高窓 */}
      <rect x={1180} y={70} width={380} height={256} fill={BP.glass} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={KRP.ink} strokeWidth={5} opacity={0.85}>
        <line x1={1370} y1={74} x2={1370} y2={322} />
        <line x1={1184} y1={198} x2={1556} y2={198} />
      </g>
      <rect x={1164} y={322} width={412} height={20} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
      {/* 窓から落ちる光の筋 */}
      <polygon points={`1180,340 1560,340 1300,${FLOOR} 820,${FLOOR}`} fill={KRP.white} opacity={0.17} />
      {/* 天井の木梁 */}
      <rect x={-20} y={60} width={W + 40} height={54} fill={C.wood} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={70} y1={88} x2={1850} y2={88} n={15} r={8} fill={C.woodDark} />
      {/* 壁に吊った道具 */}
      <WallTools x={300} y={210} f={f} />
      {/* 吊りランプ */}
      <g transform={`rotate(${sway} 1700 114)`}>
        <line x1={1700} y1={114} x2={1700} y2={238} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1628 300 L 1772 300 L 1742 238 L 1658 238 Z"
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={1700} cy={318} r={24} fill={BP.lamp} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1700} cy={318} r={62} fill={BP.lampGlow} opacity={0.26 + 0.08 * Math.sin(f / 11)} />
      </g>
      {/* 板の床 */}
      <PlankFloor y={FLOOR} h={H - FLOOR} n={7} />
      <Crack d={`M 300 ${FLOOR + 42} l 50 26 l -24 30 l 56 34`} t={1} sw={4} color={C.woodDark} />
      {/* 作業台と万力 */}
      <rect x={1330} y={620} width={560} height={34} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1364} y={654} width={30} height={128} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1826} y={654} width={30} height={128} fill={C.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1380} y={706} width={462} height={18} fill={C.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={1398} y={556} width={120} height={66} rx={8} fill={BP.iron} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1424} y={518} width={46} height={46} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1518} y1={590} x2={1594} y2={590} stroke={BP.steel} strokeWidth={14} strokeLinecap="round" />
      <circle cx={1602} cy={590} r={16} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1620} y={596} width={58} height={24} rx={6} fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
      <HexBolt x={1706} y={606} r={15} />
      <HexBolt x={1754} y={608} r={13} />
      {/* 床の木屑 */}
      <g fill={BP.woodLight} stroke={KRP.ink} strokeWidth={3}>
        {Array.from({ length: 9 }, (_, i) => {
          const wx = 1270 + rnd(i * 3.3) * 570;
          const wy = FLOOR + 24 + rnd(i * 7.1) * 62;
          return (
            <ellipse key={i} cx={wx} cy={wy} rx={18 + rnd(i + 1) * 15} ry={7}
              transform={`rotate(${-24 + rnd(i * 5 + 2) * 48} ${wx} ${wy})`} />
          );
        })}
      </g>

      {/* ===== 仕掛け本体 ===== */}
      <GuideRail x={RAIL_L} y1={130} y2={FLOOR} w={30} splice={300} />
      <ToothRail x={RAIL_T} y1={130} y2={FLOOR} w={40} pitch={58} dir={-1} />
      <Rope x1={CAR_X} y1={108} x2={CAR_X} y2={180} w={22} kind="hemp" f={f} />
      <rect x={CAR_X - 68} y={170} width={136} height={30} rx={6}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5.5} />
      <Spring x={CAR_X} y={200} len={100} w={104} coils={6} stress={0.42} />
      <Car x={CAR_X} y={CAR_Y} w={CAR_W} h={CAR_H} f={f} door={0.26} cage sling lamp />
      {/* ばね → 爪 をつなぐロッド */}
      <line x1={CAR_X + 78} y1={306} x2={PIV.x - 8} y2={PIV.y - 20}
        stroke={KRP.ink} strokeWidth={15} strokeLinecap="round" />
      <line x1={CAR_X + 78} y1={306} x2={PIV.x - 8} y2={PIV.y - 20}
        stroke={BP.steel} strokeWidth={8} strokeLinecap="round" />
      <Pawl x={PIV.x} y={PIV.y} s={0.7} dir={1} rot={pawlRot} bite={0} />

      {/* 職人と親方 */}
      <Person x={250} y={FLOOR} s={0.62} cloth="#6B5B45" clothDark="#50412F"
        face="normal" gaze={[5, 0]} f={f} phase={1} />
      <FlatCap x={250} y={FLOOR} s={0.62} f={f} phase={1} />
      <Person x={1270} y={FLOOR} s={0.58} cloth="#44506B" clothDark="#333C52"
        face="smile" gaze={[-5, -2]} f={f} phase={3} />
      <g transform={`translate(${1236} ${695 + bobOf(f, 3)}) rotate(225)`}>
        <rect x={-10} y={-11} width={104} height={22} rx={11}
          fill="#44506B" stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={106} cy={0} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <Bowler x={1270} y={FLOOR} s={0.58} f={f} phase={3} />

      {/* 舞う埃 */}
      <Motes x={860} y={344} w={660} h={FLOOR - 344} f={f} n={30} opacity={0.62} />

      {/* 札 */}
      <TagPlate x={665} y={242} text="ばね" size={42} t={t1} />
      <TagPlate x={1090} y={660} text="爪" size={42} t={t2} />
      <TagPlate x={392} y={640} text="かご" size={44} t={t2} />
      <Arrow x={600} y={640} t={t2} />
      <TagPlate x={1420} y={420} text="歯のレール" size={38} t={t3} />
      <TagPlate x={1620} y={756} text="安全装置" size={46} t={t4} color={KRP.red} />
    </Frame>
  );
};

// ===================================================================
// #77〜#79 は「同じ図を少しずつ変える3枚」。座標はここに1か所だけ置いて3枚で使い回す。
//   左: かごの枠の柱 → ばね受け → 横向きのばね → 爪を乗せた台 → 爪 → 右: 歯のレール
//   ロープは台から斜め上へ張る (左上向きの分力で台を引き戻し、ばねを縮めている)
// ===================================================================
const MG = {
  postX: 200, postW: 68,          // かごの枠の柱 (ばねの受け)
  spX: 300, spY: 470, spW: 150, spCoils: 12,
  carHalfH: 96, carW: 200,        // 爪を乗せた台 (左端 = ばねの右端)
  pivotRel: 790,                  // #77 爪の軸
  pivotFire: 985,                 // #78 押し出された爪の軸
  pivotBite: 1030,                // #79 噛んだ爪の軸
  pawlS: 2.3,                     // 爪の大きさ (先端 = 軸 + 345)
  railX: 1441, railW: 70, railPitch: 88, railY1: 60, railY2: 806,
  toothTip: 1380,                 // 歯の先端 x (= railX - railW/2 - 26)
  beamY: 130, beamH: 46, beamX2: 760,
  botY: 760, botH: 46, botX2: 1420,
  ropeTopX: 402,                  // ロープが画面上端から入る x
} as const;

const carXOf = (pivotX: number) => pivotX - 160;
const ropeAnchorOf = (pivotX: number) => carXOf(pivotX) + 70;

/** #77〜#79 共通の骨組み: かごの枠・歯のレール・ばね・台・爪 */
const MechBody: React.FC<{
  f: number; pivotX: number; stress: number; bite: number; pawlRot: number;
}> = ({ f, pivotX, stress, bite, pawlRot }) => {
  const cx0 = carXOf(pivotX);
  const spLen = cx0 - MG.spX;
  return (
    <g>
      {/* かごの枠 (上の桁・左の柱・下の桁) */}
      <rect x={MG.postX} y={MG.beamY} width={MG.beamX2 - MG.postX} height={MG.beamH}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={MG.postX + 34} y1={MG.beamY + MG.beamH / 2} x2={MG.beamX2 - 34}
        y2={MG.beamY + MG.beamH / 2} n={8} r={8} fill={BP.ironDark} />
      <rect x={MG.postX} y={150} width={MG.postW} height={MG.botY - 150}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
      <rect x={MG.postX + MG.postW * 0.36} y={150} width={MG.postW * 0.26} height={MG.botY - 150}
        fill={BP.steelLight} opacity={0.75} />
      <Rivets x1={MG.postX + 17} y1={210} x2={MG.postX + 17} y2={MG.botY - 40} n={9} r={8} />
      <rect x={MG.postX} y={MG.botY} width={MG.botX2 - MG.postX} height={MG.botH}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={MG.postX + 40} y1={MG.botY + MG.botH / 2} x2={MG.botX2 - 40}
        y2={MG.botY + MG.botH / 2} n={14} r={8} fill={BP.ironDark} />
      {/* 歯のレール */}
      <ToothRail x={MG.railX} y1={MG.railY1} y2={MG.railY2} w={MG.railW}
        pitch={MG.railPitch} dir={-1} />
      {/* ばね受けのブラケット */}
      <rect x={MG.postX + MG.postW - 6} y={MG.spY - 124} width={46} height={248} rx={8}
        fill={BP.iron} stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={MG.postX + MG.postW + 17} y={MG.spY - 86} r={12} />
      <HexBolt x={MG.postX + MG.postW + 17} y={MG.spY + 86} r={12} />
      {/* 横向きのばね */}
      <Spring x={MG.spX} y={MG.spY} len={spLen} w={MG.spW} coils={MG.spCoils}
        vertical={false} stress={stress} />
      {/* 爪を乗せた台 (すべり台) */}
      <rect x={cx0} y={MG.spY - MG.carHalfH} width={MG.carW} height={MG.carHalfH * 2} rx={10}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
      <rect x={cx0 + 16} y={MG.spY - MG.carHalfH + 16} width={MG.carW - 32}
        height={MG.carHalfH * 2 - 32} rx={8}
        fill={BP.steelLight} stroke={BP.steelDark} strokeWidth={5} opacity={0.8} />
      <HexBolt x={cx0 + 34} y={MG.spY - 62} r={13} />
      <HexBolt x={cx0 + 34} y={MG.spY + 62} r={13} />
      <HexBolt x={cx0 + MG.carW - 34} y={MG.spY - 62} r={13} />
      <HexBolt x={cx0 + MG.carW - 34} y={MG.spY + 62} r={13} />
      {/* すべり台の案内溝 */}
      <g stroke={BP.grease} strokeWidth={10} opacity={0.5}>
        <line x1={MG.spX + 40} y1={MG.spY - MG.carHalfH - 16} x2={MG.railX - 120} y2={MG.spY - MG.carHalfH - 16} />
        <line x1={MG.spX + 40} y1={MG.spY + MG.carHalfH + 16} x2={MG.railX - 120} y2={MG.spY + MG.carHalfH + 16} />
      </g>
      {/* 爪 */}
      <Pawl x={pivotX} y={MG.spY} s={MG.pawlS} dir={1} rot={pawlRot} bite={bite} />
      {/* 台にロープを結ぶ耳 */}
      <rect x={ropeAnchorOf(pivotX) - 26} y={MG.spY - MG.carHalfH - 32} width={52} height={36} rx={8}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={ropeAnchorOf(pivotX)} cy={MG.spY - MG.carHalfH - 14} r={9}
        fill={BP.grease} stroke={KRP.ink} strokeWidth={4} />
      {f >= 0 ? null : null}
    </g>
  );
};

// ===== #77 ロープが引いている間だけ、ブレーキが外れている。 =====
// 格: 図
// どこ: クリーム地に方眼。機構図①。人も背景も置かない。
// 演出: ロープが左上へ張り、台を引き戻してばねを縮めている。爪は歯のレールから離れていて、
//       その「すき間」を破線の両矢印で測る。緑の矢印が「張っている」。
// 動き: ロープの撚りが f で流れる / 爪が微かに震える / すき間の矢印が脈打つ / 札が順に出る。
const Kb2BrakeHazureteiru: React.FC<{ f: number }> = ({ f }) => {
  const piv = MG.pivotRel;
  const tipX = piv + 345;
  const ra = ropeAnchorOf(piv);
  const pulse = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <Frame f={f} seed={611} bg={KRP.cream}>
      <GridPaper />
      <MechBody f={f} pivotX={piv} stress={0.45} bite={0}
        pawlRot={-2 + Math.sin(f / 15) * 1.8} />
      {/* 張ったロープ (左上へ抜ける) */}
      <Rope x1={MG.ropeTopX} y1={-10} x2={ra} y2={MG.spY - MG.carHalfH - 14}
        w={26} kind="hemp" f={f} />
      <ForceArrow x={950} y={345} len={230} rot={-130.6} w={24} color={KRP.green}
        t={seg(f, 8, 24)} label="張っている" labelSize={36} />
      {/* 爪と歯のすき間 */}
      <g opacity={0.55 + 0.45 * pulse}>
        <line x1={tipX + 8} y1={MG.spY} x2={MG.toothTip - 8} y2={MG.spY}
          stroke={KRP.red} strokeWidth={7} strokeDasharray="22 16" />
        <polygon points={`${tipX + 8},${MG.spY} ${tipX + 52},${MG.spY - 22} ${tipX + 52},${MG.spY + 22}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        <polygon points={`${MG.toothTip - 8},${MG.spY} ${MG.toothTip - 52},${MG.spY - 22} ${MG.toothTip - 52},${MG.spY + 22}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 札 */}
      <TagPlate x={640} y={86} text="ロープ" size={44} t={seg(f, 4, 16)} />
      <TagPlate x={420} y={676} text="バネ" size={48} t={seg(f, 10, 22)} />
      <TagPlate x={660} y={676} text="縮んでいる" size={32} t={seg(f, 16, 28)} />
      <TagPlate x={900} y={644} text="爪" size={48} t={seg(f, 14, 26)} />
      <TagPlate x={1250} y={560} text="すき間" size={38} t={seg(f, 20, 32)} color={KRP.red} />
      <TagPlate x={1660} y={680} text="歯のレール" size={42} t={seg(f, 22, 34)} />
      <TagPlate x={1180} y={700} text="外れている" size={44} t={seg(f, 28, 42)} color={KRP.green} />
    </Frame>
  );
};

// ===== #78 切れた瞬間、バネが爪を押し出します。 =====
// 格: 図
// どこ: #77 と同じ構図・同じ座標。機構図②。
// 演出: ロープが途中で切れ、上の端と下の端がほつれる。下の端は台から垂れてたるむ。
//       ばねが伸びきって台を右へ押し、爪が歯のレールへ飛び出していく。赤い矢印。
// 動き: ばねの長さと台の位置が f=4〜24 で伸びる / ほつれが開く / 残像の線が脈打つ。
const Kb2BaneGaTsume: React.FC<{ f: number }> = ({ f }) => {
  const fire = easeOut(seg(f, 4, 24));
  const piv = lerp(MG.pivotRel, MG.pivotFire, fire);
  const ra = ropeAnchorOf(piv);
  const frayT = seg(f, 2, 16);
  const blur = 0.35 + 0.65 * Math.abs(Math.sin(f / 8));
  return (
    <Frame f={f} seed={612} bg={KRP.cream}>
      <GridPaper />
      {/* 残像 (爪が飛び出した跡) */}
      <g opacity={0.3 * blur * fire}>
        {[-58, 0, 58].map((dy) => (
          <line key={dy} x1={MG.pivotRel + 30} y1={MG.spY + dy} x2={piv + 30} y2={MG.spY + dy}
            stroke={BP.spark} strokeWidth={14} strokeLinecap="round" />
        ))}
      </g>
      <MechBody f={f} pivotX={piv} stress={1} bite={0} pawlRot={Math.sin(f / 6) * 2.2} />
      {/* 切れたロープ: 上の端 */}
      <Rope x1={MG.ropeTopX} y1={-10} x2={560} y2={185} w={26} kind="hemp" f={f} />
      <RopeFray x={560} y={185} dir={1} s={1.5} kind="hemp" t={frayT} />
      {/* 切れたロープ: 台から垂れた下の端 (たるむ) */}
      <Rope x1={ra - 240} y1={330} x2={ra} y2={MG.spY - MG.carHalfH - 14}
        w={26} kind="hemp" f={f} sag={70 + 50 * frayT} />
      <RopeFray x={ra - 240} y={330} dir={-1} s={1.5} kind="hemp" t={frayT} />
      <XMark x={700} y={240} s={1.1} t={seg(f, 8, 20)} />
      {/* 押し出す力 */}
      <ForceArrow x={880} y={318} len={320} rot={0} w={26} color={KRP.red}
        t={seg(f, 12, 30)} label="押し出す" labelSize={38} />
      {/* 札 */}
      <TagPlate x={400} y={300} text="切れた" size={50} t={seg(f, 2, 14)} color={KRP.red} />
      <TagPlate x={430} y={676} text="バネ" size={48} t={seg(f, 10, 22)} />
      <TagPlate x={660} y={676} text="のびる" size={40} t={seg(f, 16, 28)} color={KRP.red} />
      <TagPlate x={1010} y={644} text="爪" size={48} t={seg(f, 18, 30)} />
      <TagPlate x={1660} y={680} text="歯のレール" size={42} t={seg(f, 22, 34)} />
    </Frame>
  );
};

// ===== #79 爪がレールの歯に噛み、箱を受け止めます。 =====
// 格: 図
// どこ: #77/#78 と同じ構図のまま、噛み合う点へカメラが寄る (z=1.3)。機構図③。
// 演出: 爪のくさびが歯の谷に食い込み、火花が散る。下に赤い停止バーを引いて「止まった」。
// 動き: 寄りが f=0〜30 で深くなる / 爪が最後の 45px を進む / 火花が f で散る / 札が出る。
const Kb2TsumeGaKamu: React.FC<{ f: number }> = ({ f }) => {
  const bite = easeOut(seg(f, 2, 18));
  const piv = lerp(MG.pivotFire, MG.pivotBite, bite);
  const z = lerp(1.22, 1.3, easeOut(seg(f, 0, 30)));
  const FX = 1150, FY = 480;
  const sx = (p: number) => p * z + (FX - FX * z);
  const sy = (p: number) => p * z + (FY - FY * z);
  const ra = ropeAnchorOf(piv);
  return (
    <Frame f={f} seed={613} bg={KRP.cream}>
      <GridPaper />
      <g transform={zoomAt(z, FX, FY)}>
        <MechBody f={f} pivotX={piv} stress={0.28} bite={bite}
          pawlRot={Math.sin(f / 5) * 1.2 * (1 - bite)} />
        {/* 垂れた切れロープの残り */}
        <Rope x1={ra - 250} y1={330} x2={ra} y2={MG.spY - MG.carHalfH - 14}
          w={26} kind="hemp" f={f} sag={130} />
        <RopeFray x={ra - 250} y={330} dir={-1} s={1.5} kind="hemp" t={1} />
      </g>
      {/* 火花 (噛み合う点) */}
      <Sparks x={sx(piv + 345)} y={sy(MG.spY)} f={f} n={13} s={1.4} t={seg(f, 8, 16)} />
      {/* 「止まった」印: 赤い停止バー */}
      <g opacity={easeOut(seg(f, 20, 34))}>
        <rect x={1040} y={620} width={400} height={17} rx={5} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1040} y={645} width={400} height={17} rx={5} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 札 */}
      <TagPlate x={620} y={180} text="噛んだ" size={56} t={seg(f, 6, 20)} color={KRP.red} />
      <TagPlate x={860} y={690} text="爪" size={50} t={seg(f, 12, 24)} />
      <TagPlate x={1700} y={300} text="歯" size={50} t={seg(f, 10, 22)} />
      <TagPlate x={1230} y={740} text="止まった" size={60} t={seg(f, 24, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== #80 壊れたら止まる、という考え方です。 =====
// 格: 図
// どこ: クリーム地に方眼。「壊れたら」→「止まる」の大札2枚を赤い矢印でつなぐ。
// 演出: 札だけで終わらせない。左の札の下に切れたロープの小図、右の札の下に噛んだ爪の小図を添える。
// 動き: 左札→矢印→右札の順に出る / 垂れたロープが揺れる / 爪の噛み合いに火花が脈打つ。
const Kb2KowaretaraTomaru: React.FC<{ f: number }> = ({ f }) => {
  const swing = Math.sin(f / 13) * 16;
  const spark = seg(f, 24, 32);
  return (
    <Frame f={f} seed={614} bg={KRP.cream}>
      <GridPaper />
      {/* 大札2枚と矢印 */}
      <TagPlate x={480} y={320} text="壊れたら" size={90} t={seg(f, 2, 16)} />
      <ForceArrow x={700} y={320} len={580} rot={0} w={38} color={KRP.red} t={seg(f, 14, 30)} />
      <TagPlate x={1440} y={320} text="止まる" size={90} t={seg(f, 26, 40)} />

      {/* 左の小図: 切れたロープ (大きく) */}
      <g opacity={easeOut(seg(f, 8, 22))}>
        <rect x={392} y={410} width={176} height={40} rx={8}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <HexBolt x={424} y={430} r={12} />
        <HexBolt x={536} y={430} r={12} />
        <Rope x1={480} y1={448} x2={480} y2={556} w={34} kind="hemp" f={f} />
        <RopeFray x={480} y={556} dir={1} s={2} kind="hemp" t={seg(f, 12, 24)} />
        <XMark x={480} y={606} s={1.2} t={seg(f, 16, 26)} />
        <g transform={`rotate(${swing} 480 656)`}>
          <RopeFray x={480} y={656} dir={-1} s={2} kind="hemp" t={seg(f, 12, 24)} />
          <Rope x1={480} y1={656} x2={480} y2={742} w={34} kind="hemp" f={f} />
        </g>
      </g>

      {/* 右の小図: 歯に噛んだ爪 (大きく) */}
      <g opacity={easeOut(seg(f, 20, 34))}>
        <ToothRail x={1540} y1={410} y2={742} w={56} pitch={56} dir={-1} />
        <rect x={1180} y={496} width={130} height={120} rx={10}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={6.5} />
        <HexBolt x={1208} y={524} r={12} />
        <HexBolt x={1208} y={588} r={12} />
        <Pawl x={1261} y={556} s={1.5} dir={1} rot={0} bite={1} />
        <Sparks x={1495} y={560} f={f} n={11} s={1.1} t={spark} />
      </g>

      {/* 小図の見出し */}
      <TagPlate x={480} y={790} text="ロープが切れる" size={34} t={seg(f, 14, 26)} />
      <TagPlate x={1440} y={790} text="爪が噛む" size={34} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ===== #81 要ったのは力ではなく、落とさない仕組みでした。 =====
// 格: 図
// どこ: クリーム地に方眼。画面の横幅いっぱいのてんびん (竿は 240〜1680)。
// 演出: 左の皿に「力」=鋳物のおもり1枚が乗って軽く上がり、右の皿に「仕組み」=ばねと爪と歯の
//       小さな組み物が乗って重く下がる。左に灰色の上向き矢印、右に緑の下向き矢印。
// 動き: 竿が f=6〜34 で右へ傾く / Balance 自身が f でゆれる / 矢印と札が順に出る。
const Kb2ShikumiGaItta: React.FC<{ f: number }> = ({ f }) => {
  const tilt = 9 * easeOut(seg(f, 6, 34));
  // 左の皿: 「力」= 鋳物のおもり1枚 (軽い)
  const chikara = (
    <g>
      <rect x={-96} y={-150} width={192} height={150} rx={10}
        fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.ironDark} strokeWidth={5} opacity={0.8}>
        <line x1={-96} y1={-104} x2={96} y2={-104} />
        <line x1={-96} y1={-50} x2={96} y2={-50} />
      </g>
      <path d="M -34 -150 Q -34 -192 0 -192 Q 34 -192 34 -150"
        fill="none" stroke={BP.steelDark} strokeWidth={16} strokeLinecap="round" />
      <path d="M -34 -150 Q -34 -192 0 -192 Q 34 -192 34 -150"
        fill="none" stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
  // 右の皿: 「仕組み」= ばね + 爪 + 歯のレールの組み物 (重い)
  const shikumi = (
    <g>
      <rect x={-150} y={-34} width={300} height={34} rx={8}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={7} />
      {/* 歯のレールの切れ端 */}
      <rect x={76} y={-250} width={46} height={216} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
      <g fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4}>
        {[0, 1, 2, 3].map((i) => (
          <polygon key={i} points={`76,${-240 + i * 50} 54,${-222 + i * 50} 76,${-204 + i * 50}`} />
        ))}
      </g>
      {/* 爪 */}
      <g transform="translate(-24 -150)">
        <path d="M -14 -22 L 66 -30 L 92 2 L 66 32 L -14 22 Z"
          fill={BP.spark} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-14} cy={0} r={17} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <HexBolt x={34} y={0} r={9} />
      </g>
      {/* ばね */}
      <Spring x={-140} y={-150} len={110} w={74} coils={7} vertical={false} stress={0.9} />
      {/* 台の脚 */}
      <HexBolt x={-108} y={-17} r={11} />
      <HexBolt x={108} y={-17} r={11} />
    </g>
  );
  return (
    <Frame f={f} seed={615} bg={KRP.cream}>
      <GridPaper />
      <Balance x={960} y={250} s={0.85} f={f} tilt={tilt} span={1700} drop={360}
        leftNode={chikara} rightNode={shikumi} pivotMark />
      {/* 軽い / 重い */}
      <ForceArrow x={168} y={446} len={190} rot={-90} w={22} color={KRP.grayDark}
        t={seg(f, 14, 28)} label="軽い" labelSize={34} />
      <ForceArrow x={1800} y={548} len={210} rot={90} w={24} color={KRP.green}
        t={seg(f, 18, 32)} label="重い" labelSize={34} />
      {/* 札 */}
      <TagPlate x={285} y={226} text="力" size={72} t={seg(f, 4, 18)} color={KRP.grayDark} />
      <TagPlate x={1635} y={740} text="仕組み" size={60} t={seg(f, 24, 40)} color={KRP.green} />
    </Frame>
  );
};

// ===== #82 1850年代。ここから、箱に人が乗りはじめます。 =====
// 格: 山
// どこ: 1850年代の博覧会の会場。鉄骨トラスの天井、アーチ窓の煉瓦壁、石の床、ガス灯。
// 演出: 画面の横中央で人を乗せた箱 (開いた荷揚げ台) がロープで上がる。その右奥に巻き上げ胴。
//       手前の群衆7人は左右に振り分ける (左4人・右3人)。2人が指をさし、全員が見上げる。
//       左に「博覧会」の垂れ幕、左下に年号の札。
// 動き: 台が f=4〜36 で 140px 上がる / 滑車と巻き胴が回る / ガス灯が揺らぐ /
//       会場の埃が舞う / 中央の昇降機にほんの少し寄る (zoomAt 1.00→1.14)。
const Kb2HitoGaNoru: React.FC<{ f: number }> = ({ f }) => {
  const FLOOR = 806;
  const rise = easeOut(seg(f, 4, 36));
  const pY = 700 - 140 * rise;
  // ほんの少しだけ寄る (中央の昇降機を見やすくする程度。寄りすぎない)
  const z = lerp(1, 1.14, easeOut(seg(f, 4, 38)));
  const crowd: Array<[number, number, string, string, number, "normal" | "surprised" | "smile", string]> = [
    // 左の4人 (昇降機より左)
    [290, 0.60, "#4A5A6E", "#36434F", 1, "surprised", "bowler"],
    [440, 0.66, "#6B4B3A", "#50372A", 4, "normal", "top"],
    [585, 0.58, "#5C6670", "#434B53", 7, "smile", "flat"],
    [700, 0.62, "#7A6243", "#5B4830", 9, "surprised", "flat"],
    // 右の3人 (巻き上げ胴より右)
    [1500, 0.68, "#3E4B66", "#2E3850", 2, "surprised", "bowler"],
    [1630, 0.64, "#434F45", "#313A34", 5, "normal", "top"],
    [1750, 0.57, "#64515F", "#4A3B46", 11, "smile", "bowler"],
  ];
  return (
    <Frame f={f} seed={616} bg={KRP.cream}>
      <g transform={zoomAt(z, 960, 560)}>
        {/* 会場の空気 */}
        <rect x={-60} y={100} width={W + 120} height={FLOOR - 100} fill={C.skyHaze} />
        {/* 奥の煉瓦壁 */}
        <Bricks x={-60} y={430} w={W + 120} h={FLOOR - 430} bw={96} bh={42} opacity={0.55} />
        {/* アーチ窓 */}
        {[240, 620, 1000, 1700].map((cxw) => (
          <g key={cxw}>
            <path d={`M ${cxw - 72} 430 L ${cxw - 72} 300 Q ${cxw} 236 ${cxw + 72} 300 L ${cxw + 72} 430 Z`}
              fill={BP.glass} stroke={KRP.ink} strokeWidth={7} opacity={0.85} />
            <g stroke={KRP.ink} strokeWidth={4} opacity={0.7}>
              <line x1={cxw} y1={262} x2={cxw} y2={430} />
              <line x1={cxw - 72} y1={352} x2={cxw + 72} y2={352} />
            </g>
          </g>
        ))}
        {/* 鉄骨トラスの天井 */}
        <rect x={-60} y={64} width={W + 120} height={26} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={178} width={W + 120} height={26} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={BP.steel} strokeWidth={11}>
          {Array.from({ length: 13 }, (_, i) => {
            const x0 = -40 + i * 160;
            return (
              <g key={i}>
                <line x1={x0} y1={90} x2={x0} y2={178} />
                <line x1={x0} y1={178} x2={x0 + 160} y2={90} />
              </g>
            );
          })}
        </g>
        <Rivets x1={40} y1={77} x2={1880} y2={77} n={16} r={7} fill={BP.ironDark} />
        {/* 垂れ幕「博覧会」 */}
        <g>
          <line x1={200} y1={204} x2={200} y2={240} stroke={KRP.ink} strokeWidth={5} />
          <line x1={600} y1={204} x2={600} y2={240} stroke={KRP.ink} strokeWidth={5} />
          <rect x={140} y={236} width={520} height={132} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
          <rect x={156} y={252} width={488} height={100} fill="none" stroke={BP.brassLight} strokeWidth={6} />
          <text x={400} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={74} fill={KRP.white}>博覧会</text>
          <g fill={KRP.red} stroke={KRP.ink} strokeWidth={5}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M ${166 + i * 84} 368 L ${250 + i * 84} 368 L ${208 + i * 84} 404 Z`} />
            ))}
          </g>
        </g>
        {/* 石の床 */}
        <Stones x={-60} y={FLOOR} w={W + 120} h={H - FLOOR} bw={172} bh={70} />
        <line x1={-60} y1={FLOOR} x2={W + 60} y2={FLOOR} stroke={KRP.ink} strokeWidth={7} />
        {/* 案内レールと巻き上げ装置 (昇降機を画面の横中央 x=960 に置く) */}
        <GuideRail x={776} y1={204} y2={FLOOR} w={24} splice={300} />
        <GuideRail x={1144} y1={204} y2={FLOOR} w={24} splice={300} />
        <Sheave x={960} y={300} r={88} rot={-rise * 150} spokes={6} groove bracket />
        <Rope x1={890} y1={300} x2={890} y2={pY - 318} w={16} kind="hemp" f={f} />
        <Rope x1={1032} y1={292} x2={1242} y2={306} w={16} kind="hemp" f={f} />
        {/* 巻き上げ胴 (右の見物人の場所をあけるため綱車の近くに寄せている) */}
        <circle cx={1290} cy={310} r={62} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1290} cy={310} r={40} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform={`rotate(${rise * 220} 1290 310)`}>
          <line x1={1290} y1={310} x2={1290} y2={248} stroke={KRP.ink} strokeWidth={9} />
          <circle cx={1290} cy={240} r={15} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <rect x={1266} y={372} width={48} height={FLOOR - 372} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 人を乗せた荷揚げ台 */}
        <g>
          <rect x={800} y={pY - 318} width={320} height={30} rx={6}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={806} y={pY - 290} width={26} height={290} fill={BP.steel} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={1088} y={pY - 290} width={26} height={290} fill={BP.steel} stroke={KRP.ink} strokeWidth={5.5} />
          <Rivets x1={819} y1={pY - 260} x2={819} y2={pY - 40} n={6} r={6} />
          <Rivets x1={1101} y1={pY - 260} x2={1101} y2={pY - 40} n={6} r={6} />
          <rect x={790} y={pY} width={340} height={32} rx={5}
            fill={BP.wood} stroke={KRP.ink} strokeWidth={6.5} />
          <g stroke={BP.woodDark} strokeWidth={4} opacity={0.75}>
            <line x1={798} y1={pY + 11} x2={1122} y2={pY + 11} />
            <line x1={798} y1={pY + 22} x2={1122} y2={pY + 22} />
          </g>
          {/* 樽 */}
          <path d={`M 842 ${pY} L 836 ${pY - 72} L 914 ${pY - 72} L 908 ${pY} Z`}
            fill={BP.wood} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={838} y1={pY - 48} x2={912} y2={pY - 48} stroke={BP.ironDark} strokeWidth={7} />
          <line x1={840} y1={pY - 22} x2={910} y2={pY - 22} stroke={BP.ironDark} strokeWidth={7} />
          {/* 乗っている人 */}
          <Person x={986} y={pY} s={0.62} cloth="#2F3A4C" clothDark="#232B38"
            face="normal" gaze={[0, -3]} f={f} phase={6} />
          <TopHat x={986} y={pY} s={0.62} f={f} phase={6} />
        </g>
        {/* ガス灯 (寄りで切れない位置に) */}
        <GasLamp x={170} y={FLOOR} s={0.95} f={f} lit />
        <GasLamp x={1770} y={FLOOR} s={0.95} f={f} lit />
        {/* 群衆 */}
        {crowd.map(([cx, s, cloth, dark, ph, face, hat]) => (
          <g key={cx}>
            <Person x={cx} y={FLOOR} s={s} cloth={cloth} clothDark={dark}
              face={face} gaze={[0, -6]} f={f} phase={ph} />
            {hat === "bowler" && <Bowler x={cx} y={FLOOR} s={s} f={f} phase={ph} />}
            {hat === "flat" && <FlatCap x={cx} y={FLOOR} s={s} f={f} phase={ph} />}
            {hat === "top" && <TopHat x={cx} y={FLOOR} s={s} f={f} phase={ph} />}
          </g>
        ))}
        {/* 指さす2人の腕 (左は x=700 の人・右は x=1500 の人。どちらも中央の昇降機を指す。
            手の先が隣の人の顔や巻き上げ胴の柱に当たらない位置にしてある) */}
        <g transform={`translate(${736} ${FLOOR - 93 + bobOf(f, 9)}) rotate(-45)`}>
          <rect x={-10} y={-11} width={104} height={22} rx={11}
            fill="#7A6243" stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={106} cy={0} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        <g transform={`translate(${1463} ${FLOOR - 96 + bobOf(f, 2)}) rotate(225)`}>
          <rect x={-10} y={-11} width={104} height={22} rx={11}
            fill="#3E4B66" stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={106} cy={0} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 会場の埃 (中央の昇降機まわり) */}
        <Motes x={750} y={320} w={460} h={470} f={f} n={22} opacity={0.5} />
      </g>
      {/* 札 (寄りの外) */}
      <TagPlate x={300} y={480} text="1850年代" size={56} t={seg(f, 2, 16)} />
      <TagPlate x={960} y={660} text="人が乗る" size={48} t={seg(f, 24, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb2_uketomeru_shikake: (f) => <Kb2UketomeruShikake f={f} />,
  kb2_brake_hazureteiru: (f) => <Kb2BrakeHazureteiru f={f} />,
  kb2_bane_ga_tsume: (f) => <Kb2BaneGaTsume f={f} />,
  kb2_tsume_ga_kamu: (f) => <Kb2TsumeGaKamu f={f} />,
  kb2_kowaretara_tomaru: (f) => <Kb2KowaretaraTomaru f={f} />,
  kb2_shikumi_ga_itta: (f) => <Kb2ShikumiGaItta f={f} />,
  kb2_hito_ga_noru: (f) => <Kb2HitoGaNoru f={f} />,
};

export const K_B2D_MOTIFS: string[] = [
  "kb2_uketomeru_shikake",  // #76 そこで、切れても受け止める仕掛けが作られます。
  "kb2_brake_hazureteiru",  // #77 ロープが引いている間だけ、ブレーキが外れている。
  "kb2_bane_ga_tsume",      // #78 切れた瞬間、バネが爪を押し出します。
  "kb2_tsume_ga_kamu",      // #79 爪がレールの歯に噛み、箱を受け止めます。
  "kb2_kowaretara_tomaru",  // #80 壊れたら止まる、という考え方です。
  "kb2_shikumi_ga_itta",    // #81 要ったのは力ではなく、落とさない仕組みでした。
  "kb2_hito_ga_noru",       // #82 1850年代。ここから、箱に人が乗りはじめます。
];

export const kosoB2dScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
