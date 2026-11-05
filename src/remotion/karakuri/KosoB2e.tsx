// 「なぜ高層ビルは生まれたのか」: 第2章「人を、上げる。」つり合いおもりの段
// 担当範囲: 文#83〜#89・7文。1文 = 1シーン = 1枚の絵。
// motif 名は必ず kb2_ で始める。WobbleDefs の seed はこのファイルでは 617〜623 を使う。
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

// ===== #83 やがて動力は、電気のモーターに変わります。 =====
// 格: 並
// どこ: 1900年代のビルの機械室。漆喰の壁 + 腰の煉瓦、コンクリの床。右上に窓、天井に縦穴への吹き抜け。
// 演出: 真ん中に電気モーターを大きく置く (巻線の点検窓・冷却フィン・端子箱・軸・継手・台座のボルト・名板)。
//       モーターが綱車を回し、ロープが天井の穴から上の縦穴へ抜ける。
//       左の隅には蒸気機関が布をかけられ押しやられている (はずみ車の縁だけのぞく)。保守の人が1人。
// 動き: 綱車と継手ボルトが回る / ロープの撚りが流れる / 窓の光にホコリが舞う /
//       布がゆれる / 開閉器の表示灯が点滅 / 人がゆれて まばたきする。
const Kb2DenkiMotor: React.FC<{ f: number }> = ({ f }) => {
  const spin = f * 7;
  const sway = Math.sin(f / 29) * 2.4;
  const lampOn = (f % 44) > 10;
  return (
    <Frame f={f} seed={617} bg={KRP.cream}>
      {/* --- 壁 (漆喰 + 腰の煉瓦) と床 --- */}
      <rect x={-20} y={-20} width={W + 40} height={800} fill={BP.shaft} />
      <Bricks x={-20} y={520} w={W + 40} h={260} />
      <rect x={-20} y={508} width={W + 40} height={18} fill={BP.shaftDark}
        stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-20} y={780} width={W + 40} height={130} fill={BP.slab}
        stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.slabDark} strokeWidth={4} opacity={0.6}>
        <line x1={-20} y1={822} x2={W + 20} y2={822} />
        <line x1={470} y1={780} x2={470} y2={910} />
        <line x1={1250} y1={780} x2={1250} y2={910} />
      </g>

      {/* --- 天井の吹き抜け (ロープが上の縦穴へ抜ける) --- */}
      <rect x={1148} y={-30} width={364} height={76} fill={BP.shaftDeep}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={1148} y={40} width={364} height={16} fill={BP.slabDark}
        stroke={KRP.ink} strokeWidth={4.5} />

      {/* --- 窓と、落ちてくる光 --- */}
      <rect x={1480} y={110} width={350} height={310} fill={BP.glass}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={1492} y={122} width={326} height={286} fill={KRP.white} opacity={0.34} />
      <g stroke={KRP.ink} strokeWidth={5}>
        <line x1={1480} y1={213} x2={1830} y2={213} />
        <line x1={1480} y1={316} x2={1830} y2={316} />
        <line x1={1597} y1={110} x2={1597} y2={420} />
        <line x1={1714} y1={110} x2={1714} y2={420} />
      </g>
      <rect x={1462} y={418} width={386} height={22} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      <polygon points="1480,420 1830,420 1434,780 1016,780" fill={KRP.white} opacity={0.17} />
      <Motes x={1020} y={420} w={410} h={356} f={f} n={22} opacity={0.5} />

      {/* --- 左の隅: 布をかけられた蒸気機関 --- */}
      <g transform={`rotate(${sway} 250 790)`}>
        <circle cx={238} cy={658} r={128} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={9} />
        <circle cx={238} cy={658} r={100} fill="none" stroke={BP.steelDark} strokeWidth={11} />
        <g stroke={BP.steelDark} strokeWidth={9}>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={238} y1={658}
              x2={238 + Math.cos(i * 1.2566) * 100} y2={658 + Math.sin(i * 1.2566) * 100} />
          ))}
        </g>
        <circle cx={238} cy={658} r={22} fill={BP.grease} stroke={KRP.ink} strokeWidth={5} />
        {/* かけられた布 (裾まで) */}
        <path d="M 52 792 L 58 584 Q 94 478 208 462 Q 354 448 406 552 L 442 792 Z"
          fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
        <g stroke="#A99E89" strokeWidth={5} fill="none" opacity={0.95}>
          <path d="M 122 482 L 134 788" />
          <path d="M 228 462 L 238 790" />
          <path d="M 332 490 L 356 790" />
          <path d="M 58 600 Q 242 642 430 596" />
          <path d="M 58 692 Q 242 730 436 688" />
        </g>
        <path d="M 52 792 Q 130 810 208 790 Q 302 810 442 792" fill="none"
          stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 蜘蛛の巣とこぼれた油 */}
      <g stroke={KRP.grayDark} strokeWidth={3} opacity={0.75} fill="none">
        <path d="M 30 452 L 148 452 M 30 452 L 30 556 M 30 452 Q 108 494 30 556 M 30 452 Q 76 522 30 556" />
      </g>
      <ellipse cx={482} cy={800} rx={62} ry={14} fill={BP.grease} opacity={0.55} />
      <TagPlate x={248} y={410} text="蒸気機関" size={40} t={seg(f, 20, 34)} />

      {/* --- 配線: 開閉器の箱 → 電線管 → 端子箱 --- */}
      <rect x={440} y={148} width={204} height={154} rx={8} fill={BP.board}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={456} y={164} width={172} height={122} rx={5} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={478 + i * 52} y={182} width={16} height={60} rx={5}
              fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={486 + i * 52} cy={248} r={10} fill={BP.brassLight}
              stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
      </g>
      <circle cx={608} cy={268} r={15} fill={lampOn ? KRP.red : BP.ironDark}
        stroke={KRP.ink} strokeWidth={4} />
      {lampOn && <circle cx={608} cy={268} r={32} fill={KRP.red} opacity={0.3} />}
      <path d="M 812 404 L 604 404 L 604 302 L 542 302" fill="none" stroke={BP.ironDark}
        strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M 812 404 L 604 404 L 604 302 L 542 302" fill="none" stroke={BP.steelLight}
        strokeWidth={6} strokeLinejoin="round" opacity={0.55} />
      <g fill={BP.steel} stroke={KRP.ink} strokeWidth={3.5}>
        <rect x={700} y={392} width={18} height={26} rx={4} />
        <rect x={592} y={344} width={26} height={18} rx={4} />
      </g>

      {/* --- 主役: 電気モーター --- */}
      {/* 台座 */}
      <rect x={596} y={698} width={568} height={84} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={578} y={766} width={604} height={22} fill={BP.grease}
        stroke={KRP.ink} strokeWidth={5} />
      <line x1={596} y1={740} x2={1164} y2={740} stroke={BP.iron} strokeWidth={5} opacity={0.7} />
      {[644, 764, 996, 1116].map((bx) => <HexBolt key={bx} x={bx} y={716} r={15} />)}
      {/* 固定子の外筒 */}
      <rect x={648} y={428} width={424} height={272} rx={36} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={8} />
      {/* 冷却フィン */}
      <g>
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <line x1={674} y1={448 + i * 36} x2={1046} y2={448 + i * 36}
              stroke={BP.steelDark} strokeWidth={8} />
            <line x1={674} y1={441 + i * 36} x2={1046} y2={441 + i * 36}
              stroke={BP.steelLight} strokeWidth={4} opacity={0.85} />
          </g>
        ))}
      </g>
      {/* 両端の軸受けカバー */}
      {[652, 1068].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={564} rx={42} ry={142} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2, 3, 4].map((i) => (
            <HexBolt key={i} x={ex} y={454 + i * 55} r={9} />
          ))}
        </g>
      ))}
      {/* 巻線の点検窓 (銅の巻線がのぞく) */}
      <rect x={706} y={496} width={154} height={116} rx={10} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={6} />
      <g fill="none" strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M ${726 + i * 34} 600 Q ${726 + i * 34} 516 ${746 + i * 34} 516`}
              stroke={BP.brass} strokeWidth={14} />
            <path d={`M ${726 + i * 34} 600 Q ${726 + i * 34} 516 ${746 + i * 34} 516`}
              stroke={BP.brassLight} strokeWidth={5} opacity={0.75} />
          </g>
        ))}
      </g>
      {/* 名板 */}
      <rect x={902} y={594} width={136} height={64} rx={6} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={5} />
      <text x={970} y={638} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={36} fill={KRP.ink}>25HP</text>
      {/* 端子箱 */}
      <rect x={812} y={370} width={166} height={64} rx={8} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={830} y={386} r={8} />
      <HexBolt x={960} y={386} r={8} />
      <rect x={862} y={384} width={66} height={14} rx={4} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={3.5} />
      {/* 軸と継手 */}
      <rect x={1066} y={544} width={154} height={40} fill={BP.steelLight}
        stroke={KRP.ink} strokeWidth={6} />
      <line x1={1080} y1={556} x2={1210} y2={556} stroke={BP.steelDark} strokeWidth={4} />
      <rect x={1188} y={512} width={46} height={104} rx={6} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={1211} y={532} r={10} rot={spin * 0.4} />
      <HexBolt x={1211} y={596} r={10} rot={spin * 0.4} />
      {/* 上の縦穴へ抜けるロープ → 綱車 */}
      <Rope x1={1222} y1={566} x2={1212} y2={14} w={16} kind="wire" f={f} />
      <Rope x1={1438} y1={566} x2={1452} y2={14} w={16} kind="wire" f={f} />
      <Sheave x={1330} y={566} r={132} rot={spin} spokes={5} groove bracket={false} />

      <TagPlate x={860} y={306} text="電気モーター" size={54} t={seg(f, 6, 22)} />

      {/* --- 保守の人 --- */}
      <Person x={1562} y={782} s={0.95} f={f} cloth="#4A5A52" clothDark="#36443E"
        gaze={[-1, 0]} hair="cap" />
      <FlatCap x={1562} y={782} s={0.95} f={f} color="#5C6670" />
      {/* 油差し (手もと) */}
      <g transform={`translate(1636 ${700 + bobOf(f, 0)}) scale(0.5)`}>
        <path d="M -36 60 L 36 60 L 30 6 L -30 6 Z" fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 24 16 L 96 -36" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" fill="none" />
        <rect x={-18} y={-10} width={36} height={18} rx={5} fill={BP.brassDark}
          stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 道具箱 */}
      <rect x={1706} y={716} width={156} height={66} rx={6} fill={C.wood}
        stroke={KRP.ink} strokeWidth={6} />
      <line x1={1706} y1={742} x2={1862} y2={742} stroke={C.woodDark} strokeWidth={5} />
      <rect x={1764} y={704} width={42} height={16} rx={6} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={4} />
    </Frame>
  );
};

// ===================================================================
// #84 / #85 共通: ロープ式の骨格図
//   2枚を「同じ絵に？が足される」演出にするため、座標と動きを1か所に置いて使い回す。
// ===================================================================
// 綱車は梁 (beamY..beamY+beamH) に吊り金物で取り付く。Sheave の金物は中心から
// r+112 だけ上に伸びるので、shY - shR = 150 を崩さないこと (崩すと梁から浮く)。
// 年の目盛り矢印は廃止したので、かご・おもり・レールを下へ伸ばして余白を吸わせている。
const RS = {
  beamY: 28, beamH: 60,
  shX: 960, shY: 330, shR: 180,
  carX: 500, carW: 390, carH: 358, carFloorY: 818,
  cwX: 1420, cwW: 230, cwH: 328, cwFloorY: 818,
  railTop: 198, railBot: 864,
  carRailOff: 241, cwRailOff: 148,
} as const;
const RS_TL = RS.shX - RS.shR * 0.82;
const RS_TR = RS.shX + RS.shR * 0.82;

const RopeSkeleton: React.FC<{ f: number; showQ?: boolean }> = ({ f, showQ = false }) => {
  // かごが上がりおもりが下がる、ゆっくりした往復 (図でも必ず動く)
  const sw = Math.sin((f - 4) / 17) * easeOut(clamp01(seg(f, 2, 18)));
  const carY = RS.carFloorY - sw * 18;
  const cwY = RS.cwFloorY + sw * 18;
  const carHitch = carY - RS.carH - 54;
  const cwHitch = cwY - RS.cwH - 26;
  return (
    <>
      <GridPaper />
      {/* 吊り元の機械梁 (端から端まで横切らせる) */}
      <rect x={-20} y={RS.beamY} width={W + 40} height={RS.beamH} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={46} y1={RS.beamY + RS.beamH / 2} x2={1874} y2={RS.beamY + RS.beamH / 2}
        n={16} r={8} />
      {/* 案内レール (かご2本・おもり2本) */}
      <GuideRail x={RS.carX - RS.carRailOff} y1={RS.railTop} y2={RS.railBot} w={22} opacity={0.9} />
      <GuideRail x={RS.carX + RS.carRailOff} y1={RS.railTop} y2={RS.railBot} w={22} opacity={0.9} />
      <GuideRail x={RS.cwX - RS.cwRailOff} y1={RS.railTop} y2={RS.railBot} w={16} opacity={0.8} />
      <GuideRail x={RS.cwX + RS.cwRailOff} y1={RS.railTop} y2={RS.railBot} w={16} opacity={0.8} />
      {/* ロープ: かご → 綱車 → おもり */}
      <Rope x1={RS.carX} y1={carHitch} x2={RS_TL} y2={RS.shY} w={20} kind="wire" f={f} />
      <Rope x1={RS_TL} y1={RS.shY} x2={RS_TR} y2={RS.shY} w={20} kind="wire" f={f} opacity={0.4} />
      <Rope x1={RS_TR} y1={RS.shY} x2={RS.cwX} y2={cwHitch} w={20} kind="wire" f={f} />
      {/* 綱車 (画面の高さの1/3を使う) */}
      <Sheave x={RS.shX} y={RS.shY} r={RS.shR} rot={-sw * 28} spokes={6} groove bracket />
      {/* かごと、つり合いおもり */}
      <Car x={RS.carX} y={carY} w={RS.carW} h={RS.carH} f={f} door={0} sling lamp />
      <Counterweight x={RS.cwX} y={cwY} w={RS.cwW} h={RS.cwH} plates={9} />
      {/* 札 (縦穴の中央は「綱車」と「いまも同じ形」の札で使い切る) */}
      {/* 帯OK 上端 = 200 - 64*0.85 = 145.6。左上のタイトル帯 (y 54〜111) の下に出す。
          下端 260.4 で、下の「ロープ」の札 (上端 279.2) とも重ならない */}
      <TagPlate x={240} y={200} text="ロープ式" size={64} t={seg(f, 4, 18)} />
      <g opacity={clamp01(seg(f, 12, 24))}>
        <line x1={446} y1={338} x2={612} y2={378} stroke={KRP.ink} strokeWidth={4}
          strokeDasharray="14 10" />
      </g>
      <TagPlate x={330} y={320} text="ロープ" size={48} t={seg(f, 12, 26)} />
      <TagPlate x={960} y={592} text="綱車" size={62} t={seg(f, 8, 22)} />
      <TagPlate x={152} y={700} text="かご" size={60} t={seg(f, 16, 30)} />
      <TagPlate x={1760} y={700} text="おもり" size={52} t={seg(f, 20, 34)} />
      <TagPlate x={960} y={752} text="いまも同じ形" size={56} t={seg(f, 26, 40)} />
      {showQ && <QMark x={1180} y={620} s={2.4} f={f} t={seg(f, 8, 26)} />}
    </>
  );
};

// ===== #84 そして広まったのが、いまにつながるロープ式です。 =====
// 格: 図
// どこ: クリーム地の方眼。ロープ式の骨格図だけ。人も背景も置かない。
// 演出: 上に綱車、左にかご、右におもり、縦にレール。中央下に「いまも同じ形」の札。
//       (年の目盛り矢印は作者の指示で廃止。図を下へ伸ばして余白を吸わせた)
// 動き: かごが上がり おもりが下がる往復 / 綱車が逆に回る / ロープの撚りが流れる / 札が順に出る。
const Kb2RopeShiki: React.FC<{ f: number }> = ({ f }) => {
  return (
    <Frame f={f} seed={618} bg={KRP.cream}>
      <RopeSkeleton f={f} />
    </Frame>
  );
};

// ===== #85 ここに、少し面白い工夫があります。 =====
// 格: 図
// どこ: #84 とまったく同じ骨格図・同じ座標。
// 演出: おもりのあたりに大きな？が足されるだけ。他はいっさい変えない。
// 動き: #84 と同じ動き + ？が ふわっと出て 上下にゆれる。
const Kb2OmoshiroiKufuu: React.FC<{ f: number }> = ({ f }) => {
  return (
    <Frame f={f} seed={619} bg={KRP.cream}>
      <RopeSkeleton f={f} showQ />
    </Frame>
  );
};

// ===== #86 人が乗る箱を、「かご」と呼びます。 =====
// 格: 並
// どこ: かごの中。真鍮の鏡板・手すり・木の床板・天井の吊り照明。左は格子扉で、その外は縦穴。
// 演出: 描くのは「かごの中」ひとつ。人は1人。木札に「かご」。
// 動き: 格子の外を階の床が過ぎてゆく (上がっている) / 天井灯がゆらぐ /
//       光の筋にホコリ / 押しボタンが点る / 階数の針が動く / 人がゆれて まばたきする。
const Kb2KagoToYobu: React.FC<{ f: number }> = ({ f }) => {
  const glow = 0.24 + 0.1 * Math.sin(f / 9);
  const passY = 96 + ((f * 7) % 560);
  const needle = -176 + ((f * 1.1) % 64);
  return (
    <Frame f={f} seed={620} bg={KRP.cream}>
      {/* --- 天井 --- */}
      <rect x={-20} y={-20} width={W + 40} height={98} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={C.woodDark} strokeWidth={5} opacity={0.85}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={180 + i * 320} y1={-20} x2={180 + i * 320} y2={78} />
        ))}
      </g>
      {/* --- 奥の壁 --- */}
      <rect x={110} y={78} width={1700} height={624} fill={BP.wood}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={130} y={98} width={1660} height={584} fill={BP.woodLight} />
      {/* 真鍮の鏡板 4枚 (3枚目は鏡) */}
      {[0, 1, 2, 3].map((i) => {
        const px = 760 + i * 262;
        return (
          <g key={i}>
            <rect x={px} y={150} width={236} height={420} rx={10} fill={BP.brass}
              stroke={KRP.ink} strokeWidth={6} />
            <rect x={px + 18} y={168} width={200} height={384} rx={8} fill={BP.brassDark}
              stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
            <rect x={px + 34} y={184} width={168} height={352} rx={6} fill={BP.brassLight}
              stroke={KRP.ink} strokeWidth={4} />
            {i === 2 ? (
              <g>
                <rect x={px + 50} y={200} width={136} height={320} rx={8} fill={BP.glass}
                  stroke={KRP.ink} strokeWidth={5} />
                <path d={`M ${px + 62} 500 L ${px + 172} 216`} stroke={KRP.white}
                  strokeWidth={22} opacity={0.5} strokeLinecap="round" />
              </g>
            ) : (
              <g>
                <polygon points={`${px + 118},256 ${px + 186},360 ${px + 118},464 ${px + 50},360`}
                  fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
                <circle cx={px + 118} cy={360} r={22} fill={BP.brassDark}
                  stroke={KRP.ink} strokeWidth={4} />
              </g>
            )}
          </g>
        );
      })}
      {/* --- 真鍮の手すり --- */}
      <rect x={752} y={468} width={1040} height={20} rx={9} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={5} />
      {[820, 1270, 1720].map((bx) => (
        <rect key={bx} x={bx - 10} y={486} width={20} height={34} rx={5}
          fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* --- 床 --- */}
      <rect x={110} y={684} width={1700} height={24} fill={BP.brassDark}
        stroke={KRP.ink} strokeWidth={5} />
      <PlankFloor y={706} h={180} n={7} fill={BP.wood} line={BP.woodDark} />
      <rect x={880} y={742} width={760} height={16} fill={BP.brass} opacity={0.5} />

      {/* --- 天井の吊り照明 --- */}
      <line x1={960} y1={60} x2={960} y2={134} stroke={BP.brassDark} strokeWidth={14} />
      <circle cx={960} cy={206} r={140} fill={BP.lampGlow} opacity={glow} />
      <circle cx={960} cy={196} r={78} fill={BP.lamp} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 882 196 Q 960 114 1038 196 Z" fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={960} cy={216} r={32} fill="#FFF6D4" stroke={KRP.ink} strokeWidth={4} />
      <polygon points="884,236 1036,236 1340,878 580,878" fill={KRP.white} opacity={0.13} />
      <Motes x={680} y={260} w={560} h={600} f={f} n={20} opacity={0.42} />

      {/* --- 格子扉と、その外の縦穴 --- */}
      <rect x={150} y={96} width={492} height={598} fill={BP.shaftDeep}
        stroke={KRP.ink} strokeWidth={7} />
      <GuideRail x={566} y1={96} y2={694} w={22} opacity={0.7} />
      {/* 過ぎてゆく階の床 */}
      <rect x={152} y={passY} width={488} height={26} fill={BP.slab}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={152} y={passY - 12} width={488} height={12} fill={BP.slabDark} opacity={0.85} />
      {/* 伸縮格子 */}
      <g stroke={BP.steelDark} strokeWidth={10} strokeLinejoin="round" fill="none">
        {[0, 1, 2, 3].map((c) => [0, 1, 2, 3, 4].map((r) => {
          const cx = 210 + c * 120, cy = 150 + r * 120;
          return (
            <polygon key={`a${c}-${r}`}
              points={`${cx},${cy - 60} ${cx + 60},${cy} ${cx},${cy + 60} ${cx - 60},${cy}`} />
          );
        }))}
        {[0, 1, 2].map((c) => [0, 1, 2, 3].map((r) => {
          const cx = 270 + c * 120, cy = 210 + r * 120;
          return (
            <polygon key={`b${c}-${r}`}
              points={`${cx},${cy - 60} ${cx + 60},${cy} ${cx},${cy + 60} ${cx - 60},${cy}`} />
          );
        }))}
      </g>
      <g>
        {[0, 1, 2, 3].map((c) => [0, 1, 2, 3, 4].map((r) => (
          <circle key={`r${c}-${r}`} cx={210 + c * 120} cy={150 + r * 120} r={8}
            fill={BP.steelLight} stroke={KRP.ink} strokeWidth={3} />
        )))}
      </g>
      {/* 扉の枠と上下のレール・真鍮の把手 */}
      <rect x={142} y={86} width={508} height={24} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={142} y={678} width={508} height={24} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={140} y={86} width={26} height={616} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={614} y={86} width={36} height={616} fill={BP.brass}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={620} y={358} width={24} height={124} rx={11} fill={BP.brassLight}
        stroke={KRP.ink} strokeWidth={5} />

      {/* --- 押しボタンの盤と定員札 --- */}
      <ButtonPanel x={700} y={400} s={0.5} rows={5} cols={1} lit={1} f={f} />
      <TagPlate x={700} y={620} text="定員 10 名" size={34} t={seg(f, 24, 38)} fill={BP.brass} />

      {/* --- 階数の針 (壁の文字盤) --- */}
      <g>
        <path d="M 1572 334 A 92 92 0 0 1 1756 334 Z" fill={BP.paper}
          stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={4}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const a = Math.PI + (i / 6) * Math.PI;
            return (
              <line key={i} x1={1664 + Math.cos(a) * 80} y1={334 + Math.sin(a) * 80}
                x2={1664 + Math.cos(a) * 64} y2={334 + Math.sin(a) * 64} />
            );
          })}
        </g>
        <line x1={1664} y1={334}
          x2={1664 + Math.cos((needle * Math.PI) / 180) * 70}
          y2={334 + Math.sin((needle * Math.PI) / 180) * 70}
          stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
        <circle cx={1664} cy={334} r={11} fill={KRP.ink} />
      </g>

      {/* --- 乗っている人 1人 --- */}
      <Person x={1250} y={706} s={1.55} f={f} cloth="#3E4B66" clothDark="#2E3850"
        gaze={[-1, 0]} hair="cap" />
      <Bowler x={1250} y={706} s={1.55} f={f} />

      {/* --- 木札 --- */}
      <g opacity={clamp01(seg(f, 10, 22))} stroke={KRP.ink} strokeWidth={4}>
        <line x1={1620} y1={520} x2={1640} y2={566} />
        <line x1={1700} y1={520} x2={1680} y2={566} />
      </g>
      <TagPlate x={1660} y={616} text="かご" size={72} t={seg(f, 12, 26)}
        fill={BP.woodLight} />
    </Frame>
  );
};

// ===================================================================
// #87 / #88 / #89 の縦穴の寸法 (Shaft の中の算式をなぞって札や矢印を合わせる)
// ===================================================================
// --- #87 (山) ---
const S87 = { x: 1000, y: 300, w: 640, h: 530, carW: 260, carH: 150, floors: 3 } as const;
const S87_CAR_X = S87.x + S87.w * 0.34;          // 1217.6
const S87_SH_X = S87.x + S87.w * 0.56;           // 1358.4
const S87_SH_Y = S87.y - 96;                     // 204
const S87_SH_R = Math.min(S87.w * 0.16, 96);     // 96
const S87_TOP = S87.y + 36;                      // 336
const S87_BOT = S87.y + S87.h - 28;              // 802
const S87_CW_X = 1520;
const S87_FY = [0, 1, 2].map((i) => lerp(S87_BOT, S87_TOP, (i + 1) / (S87.floors + 1)));

// ===== #87 ロープの反対側に、重いおもりが下がっています。 =====
// 格: 山
// どこ: ビルの縦穴の全景 (切り取り図)。左は3階ぶんの床と待つ人、右は縦穴・かご・おもり、上は機械室。
// 演出: 縦穴を画面の高さいっぱいに。かごの中に人2人、各階に待つ人。
//       右のおもりは鋳物板9枚の重なりを見せ、赤い「重い」の矢印で重さを言う。
// 動き: かごが上がり おもりが下がる / 綱車が回る / ロープの撚りが流れる /
//       縦穴にホコリが舞う / 人がゆれて まばたきする / 札と矢印が順に出る。
const Kb2OmoriSagaru: React.FC<{ f: number }> = ({ f }) => {
  const tt = easeOut(clamp01(seg(f, 4, 38)));
  const carT = lerp(0.62, 0.74, tt);
  const carFloorY = lerp(S87_BOT, S87_TOP + S87.carH, carT);
  const cwFloorY = lerp(726, 764, tt);
  return (
    <Frame f={f} seed={621} bg={KRP.cream}>
      {/* --- 建物の切り取り: 屋根・外壁・階の床 --- */}
      <rect x={126} y={306} width={876} height={524} fill={BP.shaft} opacity={0.3} />
      <rect x={38} y={282} width={964} height={26} fill={BP.slabDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={38} y={248} width={28} height={38} fill={BP.slabDark}
        stroke={KRP.ink} strokeWidth={5} />
      <Bricks x={38} y={306} w={88} h={524} />
      <rect x={38} y={306} width={88} height={524} fill="none" stroke={KRP.ink} strokeWidth={6} />
      {[500, 616, 732].map((wy) => (
        <g key={wy}>
          <rect x={56} y={wy} width={54} height={58} fill={BP.glass}
            stroke={KRP.ink} strokeWidth={5} />
          <line x1={83} y1={wy} x2={83} y2={wy + 58} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {S87_FY.map((fy, i) => (
        <g key={i}>
          <rect x={58} y={fy} width={944} height={16} fill={BP.slab}
            stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={58} y={fy + 16} width={944} height={8} fill={BP.slabDark} opacity={0.8} />
          <text x={176} y={fy - 18} fontFamily={FONT} fontWeight={800} fontSize={32}
            fill={KRP.ink} opacity={0.8}>{i + 1}F</text>
        </g>
      ))}
      {/* 地下 (ピット) */}
      <rect x={126} y={702} width={876} height={128} fill={BP.shaftDeep} opacity={0.22} />
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.5}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={160 + i * 180} y1={718} x2={200 + i * 180} y2={828} />
        ))}
      </g>

      {/* --- 機械室 (屋上) --- */}
      <rect x={S87.x - 26} y={84} width={S87.w + 52} height={200} fill={BP.shaft}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.shaftDark} strokeWidth={3} opacity={0.5}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={S87.x - 26} y1={118 + i * 40} x2={S87.x + S87.w + 26} y2={118 + i * 40} />
        ))}
      </g>
      {/* 巻上機 (電気モーター + 歯車箱) */}
      <rect x={1026} y={248} width={240} height={22} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={1030} y={176} width={126} height={74} rx={18} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.steelDark} strokeWidth={5} opacity={0.85}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={1040} y1={190 + i * 16} x2={1146} y2={190 + i * 16} />
        ))}
      </g>
      <rect x={1156} y={160} width={114} height={90} rx={8} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={1174} y={176} r={9} />
      <HexBolt x={1252} y={176} r={9} />
      <HexBolt x={1174} y={234} r={9} />
      {/* 制御盤 */}
      <rect x={1488} y={152} width={132} height={130} rx={6} fill={BP.board}
        stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1504 + i * 38} y={170} width={16} height={54} rx={5}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <circle cx={1554} cy={254} r={11} fill={(f % 40) > 12 ? KRP.green : BP.ironDark}
        stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={S87.x - 26} y={280} width={S87.w + 52} height={24} fill={BP.slabDark}
        stroke={KRP.ink} strokeWidth={5} />

      {/* --- 縦穴 (かご・階の床・レール・ロープ) --- */}
      <Shaft x={S87.x} y={S87.y} w={S87.w} h={S87.h} f={f} carT={carT}
        floors={S87.floors} carW={S87.carW} carH={S87.carH} door={1}
        showMachine={false} showCw={false} showRail
        carChildren={(
          <g>
            <Person x={-58} y={-8} s={0.4} f={f} phase={1} cloth="#3E4B66" clothDark="#2E3850" />
            <Person x={48} y={-8} s={0.38} f={f} phase={3} cloth="#7A4B3A" clothDark="#5C382B" />
          </g>
        )} />
      {/* つり合いおもり側: 案内レールと鋼索と、鋳物板の重なり */}
      <GuideRail x={S87_CW_X - 92} y1={S87_TOP} y2={S87_BOT} w={14} opacity={0.8} />
      <GuideRail x={S87_CW_X + 92} y1={S87_TOP} y2={S87_BOT} w={14} opacity={0.8} />
      <Rope x1={S87_SH_X + S87_SH_R * 0.82} y1={S87_SH_Y} x2={S87_CW_X} y2={cwFloorY - 326}
        w={12} kind="wire" f={f} />
      <Counterweight x={S87_CW_X} y={cwFloorY} w={130} h={300} plates={9} />
      {/* 綱車 (機械室の床をまたいで縦穴に落ちる) */}
      <rect x={S87_SH_X - 72} y={100} width={144} height={26} rx={6} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={S87_SH_X - 26} y={122} width={52} height={86} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      <Sheave x={S87_SH_X} y={S87_SH_Y} r={S87_SH_R} rot={f * 2.4} spokes={6}
        groove bracket={false} />
      <Motes x={1020} y={340} w={600} h={450} f={f} n={16} opacity={0.3} />

      {/* --- 各階で待つ人 --- */}
      <Person x={320} y={S87_FY[0]} s={0.34} f={f} phase={2} cloth="#4A5A52" clothDark="#36443E" gaze={[1, 0]} />
      <Bowler x={320} y={S87_FY[0]} s={0.34} f={f} phase={2} />
      <Person x={438} y={S87_FY[0]} s={0.32} f={f} phase={5} cloth="#5E5A7A" clothDark="#45425C" gaze={[1, 0]} />
      <Person x={760} y={S87_FY[0]} s={0.33} f={f} phase={7} cloth="#7A4B3A" clothDark="#5C382B" gaze={[1, 0]} />
      <Person x={346} y={S87_FY[1]} s={0.34} f={f} phase={4} cloth="#3E4B66" clothDark="#2E3850" gaze={[1, 0]} />
      <FlatCap x={346} y={S87_FY[1]} s={0.34} f={f} phase={4} />
      <Person x={636} y={S87_FY[2]} s={0.33} f={f} phase={6} cloth="#4A5A52" clothDark="#36443E" gaze={[1, 0]} />

      {/* --- 札と矢印 --- */}
      <TagPlate x={1150} y={120} text="機械室" size={40} t={seg(f, 6, 20)} />
      <Arrow x={1082} y={512} rot={0} t={seg(f, 12, 24)} s={0.9} />
      <TagPlate x={880} y={512} text="かご" size={48} t={seg(f, 10, 24)} />
      <ForceArrow x={1700} y={432} len={272} rot={90} w={24} color={KRP.red}
        t={seg(f, 18, 36)} label="重い" labelSize={40} />
      <TagPlate x={1770} y={740} text="おもり" size={48} t={seg(f, 22, 38)} />
    </Frame>
  );
};

// ===================================================================
// #88 / #89 共通: 対になる2枚のための縦穴の寸法
// ===================================================================
const S88 = { x: 470, y: 260, w: 1000, h: 560, carW: 280, carH: 230, floors: 7 } as const;
const S88_SH_X = S88.x + S88.w * 0.56;          // 1030
const S88_SH_Y = S88.y - 96;                    // 164
const S88_SH_R = Math.min(S88.w * 0.16, 96);    // 96
const S88_TOP = S88.y + 36;                     // 296
const S88_BOT = S88.y + S88.h - 28;             // 792
const S88_CW_H = S88.carH * 0.78;               // 179.4

/** #88/#89 の対図。up=true で「かごが上がる / おもりが下がる」 */
const ShaftPair: React.FC<{ f: number; up: boolean }> = ({ f, up }) => {
  const tt = easeOut(clamp01(seg(f, 3, 36)));
  const carT = up ? lerp(0.34, 0.88, tt) : lerp(0.62, 0.1, tt);
  const carFloorY = lerp(S88_BOT, S88_TOP + S88.carH, carT);
  const cwFloorY = lerp(S88_TOP + S88_CW_H, S88_BOT, carT);
  const ap = clamp01(seg(f, 12, 28));
  return (
    <>
      <GridPaper />
      {/* 機械室 */}
      <rect x={S88.x - 26} y={52} width={S88.w + 52} height={206} fill={BP.shaft}
        stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.shaftDark} strokeWidth={3} opacity={0.5}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={S88.x - 26} y1={84 + i * 40} x2={S88.x + S88.w + 26} y2={84 + i * 40} />
        ))}
      </g>
      {/* 巻上機 */}
      <rect x={540} y={228} width={250} height={22} fill={BP.ironDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={546} y={150} width={134} height={80} rx={20} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.steelDark} strokeWidth={5} opacity={0.85}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={558} y1={166 + i * 17} x2={668} y2={166 + i * 17} />
        ))}
      </g>
      <rect x={680} y={136} width={116} height={94} rx={8} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={6} />
      <HexBolt x={698} y={152} r={9} />
      <HexBolt x={778} y={152} r={9} />
      <rect x={1300} y={126} width={140} height={132} rx={6} fill={BP.board}
        stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1318 + i * 40} y={144} width={16} height={56} rx={5}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <rect x={S88.x - 26} y={236} width={S88.w + 52} height={22} fill={BP.slabDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 綱車の吊り金物 */}
      <rect x={S88_SH_X - 72} y={72} width={144} height={26} rx={6} fill={BP.steel}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={S88_SH_X - 26} y={94} width={52} height={74} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 縦穴ぜんぶ */}
      <Shaft x={S88.x} y={S88.y} w={S88.w} h={S88.h} f={f} carT={carT}
        floors={S88.floors} carW={S88.carW} carH={S88.carH}
        showMachine={false} showCw showRail />
      <Sheave x={S88_SH_X} y={S88_SH_Y} r={S88_SH_R} rot={(up ? -1 : 1) * f * 3.4}
        spokes={6} groove bracket={false} />
      {/* かごとおもりの高さを外へ引き出す補助線 */}
      <g opacity={ap} strokeDasharray="20 14">
        <line x1={120} y1={carFloorY} x2={S88.x} y2={carFloorY}
          stroke={KRP.green} strokeWidth={6} />
        <line x1={S88.x + S88.w} y1={cwFloorY} x2={1830} y2={cwFloorY}
          stroke={KRP.green} strokeWidth={6} />
      </g>
      {/* 上下の矢印 (緑) */}
      {up ? (
        <>
          <ForceArrow x={360} y={740} len={320} rot={-90} w={26} color={KRP.green}
            t={seg(f, 10, 30)} label="上がる" labelSize={38} />
          <ForceArrow x={1580} y={420} len={320} rot={90} w={26} color={KRP.green}
            t={seg(f, 14, 34)} label="下がる" labelSize={38} />
        </>
      ) : (
        <>
          <ForceArrow x={360} y={420} len={320} rot={90} w={26} color={KRP.green}
            t={seg(f, 10, 30)} label="下がる" labelSize={38} />
          <ForceArrow x={1580} y={740} len={320} rot={-90} w={26} color={KRP.green}
            t={seg(f, 14, 34)} label="上がる" labelSize={38} />
        </>
      )}
      <TagPlate x={230} y={300} text="かご" size={60} t={seg(f, 4, 18)} />
      <TagPlate x={1720} y={300} text="おもり" size={56} t={seg(f, 6, 20)} />
    </>
  );
};

// ===== #88 かごが上がると、おもりが下がる。 =====
// 格: 図
// どこ: クリーム地の方眼に、縦穴の図だけ。#89 とまったく同じ構図。
// 演出: かごが上、おもりが下。緑の上向き矢印と下向き矢印。高さを補助線で外へ引き出す。
// 動き: かごが下から上へ上がり、おもりが同時に下がる / 綱車が回る / 矢印と補助線が出る。
const Kb2KagoAgaru: React.FC<{ f: number }> = ({ f }) => {
  return (
    <Frame f={f} seed={622} bg={KRP.cream}>
      <ShaftPair f={f} up />
    </Frame>
  );
};

// ===== #89 かごが下がると、おもりが上がる。 =====
// 格: 図
// どこ: #88 とまったく同じ構図・同じ座標。上下だけ逆。
// 演出: かごが下、おもりが上。矢印も逆向き。2枚を並べたとき「対」に見えること。
// 動き: かごが上から下へ下がり、おもりが同時に上がる / 綱車が逆に回る / 矢印と補助線が出る。
const Kb2KagoSagaru: React.FC<{ f: number }> = ({ f }) => {
  return (
    <Frame f={f} seed={623} bg={KRP.cream}>
      <ShaftPair f={f} up={false} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb2_denki_motor: (f) => <Kb2DenkiMotor f={f} />,
  kb2_rope_shiki: (f) => <Kb2RopeShiki f={f} />,
  kb2_omoshiroi_kufuu: (f) => <Kb2OmoshiroiKufuu f={f} />,
  kb2_kago_to_yobu: (f) => <Kb2KagoToYobu f={f} />,
  kb2_omori_sagaru: (f) => <Kb2OmoriSagaru f={f} />,
  kb2_kago_agaru: (f) => <Kb2KagoAgaru f={f} />,
  kb2_kago_sagaru: (f) => <Kb2KagoSagaru f={f} />,
};

export const K_B2E_MOTIFS: string[] = [
  "kb2_denki_motor",      // #83 やがて動力は、電気のモーターに変わります。
  "kb2_rope_shiki",       // #84 そして広まったのが、いまにつながるロープ式です。
  "kb2_omoshiroi_kufuu",  // #85 ここに、少し面白い工夫があります。
  "kb2_kago_to_yobu",     // #86 人が乗る箱を、「かご」と呼びます。
  "kb2_omori_sagaru",     // #87 ロープの反対側に、重いおもりが下がっています。
  "kb2_kago_agaru",       // #88 かごが上がると、おもりが下がる。
  "kb2_kago_sagaru",      // #89 かごが下がると、おもりが上がる。
];

export const kosoB2eScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
