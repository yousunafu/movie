// 「なぜ高層ビルは生まれたのか」: 第5章「島には、土地がない。」中盤 (人が集まる〜地価の結果)
// 担当範囲: 台本 docs/koso-script-v7.txt の 190〜199行目 (文#189〜#198・10文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は必ず kb5_ で始める。WobbleDefs の seed はこのファイルでは 810〜819 を使う。
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
import { KPP, TowerOnPillars } from "./KosoPillars";
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
};

// ===================================================================
// このファイルだけのローカル部品 (共用の KosoB2Parts には足さない)
// ===================================================================

/** 海面の波線。y の下へ n 本、f で横に流れる */
const SeaWaves: React.FC<{ y: number; n?: number; f: number; pitch?: number }> = ({
  y, n = 7, f, pitch = 52,
}) => (
  <g stroke={C.seaDark} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7}>
    {Array.from({ length: n }, (_, i) => {
      const yy = y + 28 + i * pitch;
      const L = 150 + i * 18;
      const off = ((f * (1.1 + i * 0.22) * (i % 2 ? -1 : 1)) % L + L) % L;
      return (
        <g key={i}>
          {Array.from({ length: Math.ceil(W / L) + 2 }, (_, j) => (
            <path key={j} d={`M ${-L + j * L + off} ${yy} q ${L * 0.26} -14 ${L * 0.52} 0`} />
          ))}
        </g>
      );
    })}
  </g>
);

/** カモメ。羽が f ではばたく */
const Gull: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number }> = ({
  x, y, s = 1, f, phase = 0,
}) => {
  const flap = Math.sin((f + phase * 9) / 4.2);
  const dy = Math.sin((f + phase * 13) / 17) * 14;
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${s})`}>
      <path
        d={`M -64 ${8 + flap * 24} q 34 ${-28 - flap * 16} 64 -2 q 30 ${-26 - flap * 16} 64 ${6 + flap * 24}`}
        fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <ellipse cx={0} cy={2} rx={17} ry={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <polygon points="15,-2 32,3 15,8" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={6} cy={-2} r={2.6} fill={KRP.ink} />
    </g>
  );
};

/** 中折れ帽 */
const Hat: React.FC<{ x: number; y: number; s?: number; rot?: number; fill?: string }> = ({
  x, y, s = 1, rot = 0, fill = BP.woodDark,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <path d="M -27 0 q 1 -36 27 -36 q 26 0 27 36 z" fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={-28} y={-13} width={56} height={11} fill={KRP.ink} opacity={0.4} />
    <ellipse cx={0} cy={0} rx={47} ry={12} fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

/** 旅行鞄 */
const Trunk: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -17 -30 q 17 -21 34 0" fill="none" stroke={KRP.ink} strokeWidth={6} />
    <rect x={-40} y={-30} width={80} height={62} rx={7} fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
    <line x1={-40} y1={-6} x2={40} y2={-6} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
    <rect x={-11} y={-14} width={22} height={16} rx={3} fill={BP.brass} stroke={KRP.ink} strokeWidth={3} />
    <Rivets x1={-32} y1={24} x2={32} y2={24} n={4} r={4.5} fill={BP.brassDark} />
  </g>
);

/** 窓の並んだビル。cx=中心 / gy=地面 / n=階数。屋上の赤灯が f で点滅する */
const Tower: React.FC<{
  cx: number; gy: number; n: number; w?: number; fh?: number; fill?: string; f?: number;
}> = ({ cx, gy, n, w = 300, fh = 30, fill = C.cityPale, f = 0 }) => {
  const rows = Math.max(1, Math.floor(n));
  const top = gy - rows * fh;
  const cols = Math.max(2, Math.round(w / 56));
  const cw = w / cols;
  return (
    <g>
      <rect x={cx - w / 2} y={top} width={w} height={rows * fh} fill={fill}
        stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: rows }, (_, r) => (
        <line key={`fl${r}`} x1={cx - w / 2} y1={gy - r * fh} x2={cx + w / 2} y2={gy - r * fh}
          stroke={KRP.ink} strokeWidth={2.5} opacity={0.45} />
      ))}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect key={`w${r}-${c}`}
            x={cx - w / 2 + c * cw + cw * 0.22} y={gy - (r + 1) * fh + fh * 0.24}
            width={cw * 0.56} height={fh * 0.5}
            fill={rnd(r * 13 + c * 7 + 2) < 0.38 ? KRP.yellow : C.cityDark}
            stroke={KRP.ink} strokeWidth={1.8} />
        )))}
      <rect x={cx - w / 2 - 14} y={top - 18} width={w + 28} height={20} rx={4}
        fill={C.cityDark} stroke={KRP.ink} strokeWidth={5} />
      <line x1={cx} y1={top - 18} x2={cx} y2={top - 72} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={cx} cy={top - 78} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4}
        opacity={0.35 + 0.65 * (Math.sin(f / 4.5) * 0.5 + 0.5)} />
    </g>
  );
};

/** 敷地の板 (斜め投影)。cy は手前の辺の高さ */
const LotSlab: React.FC<{
  cx: number; cy: number; w?: number; d?: number; h?: number;
  fill?: string; side?: string; op?: number;
}> = ({ cx, cy, w = 520, d = 230, h = 16, fill = C.island, side = C.rock, op = 1 }) => {
  const sx = d * 0.52, sy = d * 0.40;
  return (
    <g opacity={op}>
      <polygon points={`${cx - w / 2},${cy} ${cx + w / 2},${cy} ${cx + w / 2},${cy + h} ${cx - w / 2},${cy + h}`}
        fill={side} stroke={KRP.ink} strokeWidth={4} />
      <polygon points={`${cx - w / 2},${cy} ${cx + w / 2},${cy} ${cx + w / 2 - sx},${cy - sy} ${cx - w / 2 - sx},${cy - sy}`}
        fill={fill} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

/** 歯車 (技術の印) */
const Gear: React.FC<{ x: number; y: number; r?: number; teeth?: number; rot?: number }> = ({
  x, y, r = 120, teeth = 12, rot = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: teeth }, (_, i) => (
      <rect key={i} x={-17} y={-r - 28} width={34} height={38} rx={5}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5}
        transform={`rotate(${(i * 360) / teeth})`} />
    ))}
    <circle cx={0} cy={0} r={r} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
    <circle cx={0} cy={0} r={r * 0.64} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
    {Array.from({ length: 5 }, (_, i) => (
      <rect key={`s${i}`} x={-13} y={-r * 0.6} width={26} height={r * 0.36} rx={6}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3.5} transform={`rotate(${i * 72})`} />
    ))}
    <circle cx={0} cy={0} r={r * 0.26} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// ===== #189 でも、そこで働きたい人は増え続けます。 =====
// 格: 並 (描くのは「降りてくる列」1つだけ。背景は海・船・桟橋・島影)
// どこ: 島の桟橋。左に横付けした船、右へ伸びる桟橋
// 演出: タラップから桟橋へ、鞄と帽子の列が切れずに続いている。海の色でこの章を始める
// 動き: 列が右へ歩き、波が流れ、煙突の煙が上がり、カモメがはばたく
// 絵: 桟橋。船から降りてくる人の列。トランク・帽子・綱・カモメ
const Kb5bHitoGaFueru: React.FC<{ f: number }> = ({ f }) => {
  const HZ = 352, DECK = 700;
  const walk = easeOut(seg(f, 0, 40));
  const posOf = (p: number): [number, number] =>
    p < 0.4
      ? [lerp(600, 772, p / 0.4), lerp(494, DECK - 8, p / 0.4)]
      : [lerp(772, 1768, (p - 0.4) / 0.6), DECK - 8];
  const PS = 0.58;
  return (
    <Frame f={f} seed={810} bg={KRP.paperCool}>
      {/* 空と海 */}
      <rect x={0} y={0} width={W} height={HZ} fill={KRP.paperCool} />
      <rect x={0} y={HZ} width={W} height={H - HZ} fill={C.sea} />
      <line x1={0} y1={HZ} x2={W} y2={HZ} stroke={KRP.ink} strokeWidth={5} opacity={0.45} />
      <SeaWaves y={HZ} n={8} f={f} />
      {/* 向こうの島影 */}
      <path d={`M 1004 ${HZ} q 90 -26 176 -30 q 70 -36 150 -2 q 104 -16 190 32 z`}
        fill={C.island} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
      <path d={`M 1180 ${HZ - 30} q 60 -30 120 -2`} fill="none" stroke={KRP.ink}
        strokeWidth={3} opacity={0.35} />
      <Gull x={1400} y={148} s={1.0} f={f} phase={0} />
      <Gull x={1668} y={252} s={0.7} f={f} phase={2} />
      <Gull x={1176} y={210} s={0.5} f={f} phase={5} />
      {/* ===== 船 (左に横付け) ===== */}
      {Array.from({ length: 5 }, (_, i) => {
        const u = ((f * 1.1 + i * 8) % 42) / 42;
        return <circle key={`sm${i}`} cx={248 - u * 96} cy={214 - u * 160}
          r={24 + u * 36} fill={KRP.gray} stroke={KRP.ink} strokeWidth={2}
          opacity={0.4 * (1 - u)} />;
      })}
      <rect x={196} y={210} width={104} height={190} fill={C.graphRed} stroke={KRP.ink} strokeWidth={6} />
      <rect x={196} y={210} width={104} height={40} fill={KRP.ink} opacity={0.75} />
      <line x1={468} y1={398} x2={468} y2={108} stroke={BP.woodDark} strokeWidth={13} strokeLinecap="round" />
      <line x1={468} y1={116} x2={70} y2={326} stroke={BP.hempDark} strokeWidth={5} />
      <line x1={468} y1={116} x2={636} y2={388} stroke={BP.hempDark} strokeWidth={5} />
      {/* 船室 */}
      <rect x={316} y={296} width={272} height={104} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={`cw${i}`} x={338 + i * 62} y={320} width={42} height={36}
          fill={BP.glass} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 船体 */}
      <path d="M -80 398 L 630 398 L 642 556 Q 520 726 296 728 L -80 728 Z"
        fill={C.cityDark} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-80} y={428} width={708} height={32} fill={KRP.white} opacity={0.7} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={`ph${i}`}>
          <circle cx={30 + i * 100} cy={508} r={24} fill={BP.glass} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={30 + i * 100} cy={508} r={9} fill={KRP.white} opacity={0.6} />
        </g>
      ))}
      {/* 手すり */}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`rl${i}`} x1={-60 + i * 66} y1={398} x2={-60 + i * 66} y2={362}
          stroke={KRP.ink} strokeWidth={4} />
      ))}
      <line x1={-80} y1={362} x2={620} y2={362} stroke={KRP.ink} strokeWidth={6} />
      {/* ===== 桟橋 ===== */}
      <rect x={736} y={DECK} width={W - 736} height={30} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 19 }, (_, i) => (
        <line key={`pk${i}`} x1={760 + i * 62} y1={DECK} x2={760 + i * 62} y2={DECK + 30}
          stroke={BP.woodDark} strokeWidth={4} opacity={0.8} />
      ))}
      {[820, 1000, 1200, 1400, 1600, 1810].map((px, i) => (
        <g key={`pl${i}`}>
          <rect x={px - 14} y={DECK + 30} width={28} height={150} fill={BP.woodDark}
            stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={px} cy={DECK + 182} rx={34} ry={11} fill={C.seaDark} opacity={0.6} />
        </g>
      ))}
      {/* タラップ */}
      <polygon points="586,462 648,462 806,702 744,702" fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 9 }, (_, i) => {
        const u = (i + 0.5) / 9;
        return <line key={`st${i}`} x1={lerp(586, 744, u)} y1={lerp(462, 702, u)}
          x2={lerp(648, 806, u)} y2={lerp(462, 702, u)} stroke={KRP.ink} strokeWidth={4} opacity={0.65} />;
      })}
      <line x1={566} y1={420} x2={724} y2={660} stroke={BP.hempDark} strokeWidth={7} />
      {/* 繋留の綱 */}
      <rect x={862} y={DECK - 54} width={38} height={56} rx={6} fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
      <rect x={850} y={DECK - 66} width={62} height={18} rx={5} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
      <path d={`M 640 556 Q 756 ${678 + Math.sin(f / 14) * 10} 880 ${DECK - 56}`}
        fill="none" stroke={BP.hemp} strokeWidth={13} strokeLinecap="round" />
      <path d={`M 640 556 Q 756 ${678 + Math.sin(f / 14) * 10} 880 ${DECK - 56}`}
        fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="12 16" opacity={0.6} />
      {/* 巻いた綱 */}
      {[0, 1, 2].map((i) => (
        <ellipse key={`cr${i}`} cx={1124} cy={DECK - 10 - i * 7} rx={46 - i * 11} ry={15 - i * 3.5}
          fill="none" stroke={BP.hemp} strokeWidth={11} />
      ))}
      {/* ===== 降りてくる列 ===== */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const [px, py] = posOf(clamp01(i * 0.142 + walk * 0.2));
        return (
          <g key={`pp${i}`}>
            <Person x={px} y={py} s={PS} f={f} phase={i} gaze={[0.3, 0]}
              cloth={i % 2 ? "#4A5B74" : "#6B5B4A"} clothDark={i % 2 ? "#36435A" : "#4E4235"} />
            <Hat x={px} y={py - 292 * PS + 6} s={PS * 0.92} rot={-5 + i * 2}
              fill={i % 3 === 0 ? BP.woodDark : C.rock} />
            {i % 2 === 0 && <Trunk x={px + 60 * PS} y={py - 44 * PS} s={PS * 0.95} />}
          </g>
        );
      })}
      {/* 落ちた帽子 */}
      <Hat x={988} y={DECK - 4} s={0.5} rot={74} fill={C.rock} />
      {/* 標識と札 */}
      <line x1={1736} y1={DECK} x2={1736} y2={620} stroke={BP.woodDark} strokeWidth={10} />
      <TagPlate x={1736} y={596} text="埠頭" size={40} t={seg(f, 6, 18)} rot={-3} />
      <ForceArrow x={1066} y={452} len={420} rot={0} w={26} color={KRP.red}
        t={seg(f, 14, 36)} label="増え続ける" labelSize={40} />
      <TagPlate x={430} y={768} text="上陸" size={48} t={seg(f, 2, 14)} color={C.graphRed} />
      <TagPlate x={1476} y={768} text="桟橋" size={52} t={seg(f, 10, 24)} />
    </Frame>
  );
};

// ===== #190 人は、人が集まる場所に集まりたがります。 =====
// 格: 図 (人も背景も置かない。点と矢印と札だけ)
// どこ: 方眼紙の上。中央 (940,450) に濃い塊、まわりに散った点
// 演出: 塊を画面の中心から少し左に置き、点の散りを画面の端まで使う
// 動き: 44個の点が時間差で中心へ寄り、点が太る。塊が膨らみ、8本の矢印が内側へ伸びる
// 絵: 点の図。小さな点が中央の濃い塊へ吸い寄せられる矢印。密度が上がる
const Kb5bHitoNiAtsumaru: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 2, 38));
  const CX = 940, CY = 450;
  return (
    <Frame f={f} seed={811} bg={KRP.cream}>
      <GridPaper />
      {/* 中心の濃い塊 */}
      <ellipse cx={CX} cy={CY} rx={lerp(96, 196, t)} ry={lerp(64, 128, t)}
        fill={C.graphBlue} stroke={KRP.ink} strokeWidth={6} opacity={0.26} />
      {Array.from({ length: 30 }, (_, i) => {
        const a = rnd(i * 9 + 2) * Math.PI * 2;
        const r = Math.sqrt(rnd(i * 4 + 7));
        return <circle key={`c${i}`} cx={CX + Math.cos(a) * r * lerp(70, 168, t)}
          cy={CY + Math.sin(a) * r * lerp(46, 108, t)} r={lerp(14, 19, t)}
          fill={C.graphBlue} stroke={KRP.ink} strokeWidth={4} />;
      })}
      {/* 密度の輪 (外ほど薄い) */}
      {[1, 2, 3].map((i) => (
        <ellipse key={`rg${i}`} cx={CX} cy={CY} rx={lerp(220, 196, t) * i * 1.26}
          ry={lerp(140, 128, t) * i * 0.86} fill="none" stroke={KRP.ink} strokeWidth={3}
          strokeDasharray="16 16" opacity={0.3 - i * 0.05} />
      ))}
      {/* 寄っていく点。寄り切らずに濃淡が残る */}
      {Array.from({ length: 52 }, (_, i) => {
        const a = rnd(i * 3 + 1) * Math.PI * 2;
        const r0 = 560 + rnd(i * 7 + 5) * 140;
        const r1 = 90 + Math.pow(rnd(i * 11 + 3), 1.9) * 450;
        const tt = clamp01((t - rnd(i * 5 + 9) * 0.3) / 0.7);
        const r = lerp(r0, r1, easeOut(tt));
        return <circle key={`d${i}`} cx={CX + Math.cos(a) * r * 1.34} cy={CY + Math.sin(a) * r * 0.64}
          r={lerp(11, 19, tt)} fill={r < 340 ? C.graphBlue : KRP.white}
          stroke={KRP.ink} strokeWidth={4} />;
      })}
      {/* 内へ向く矢印 */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const px = CX + Math.cos(a) * 640, py = CY + Math.sin(a) * 300;
        const rot = (Math.atan2(CY - py, CX - px) * 180) / Math.PI;
        return <ForceArrow key={`a${i}`} x={px} y={py} len={230} rot={rot} w={22}
          color={C.graphRed} t={seg(f, 12 + i, 34 + i)} />;
      })}
      <TagPlate x={286} y={742} text="周辺" size={54} t={seg(f, 6, 18)} />
      <TagPlate x={CX} y={742} text="中心" size={58} t={seg(f, 4, 16)} color={C.graphRed} />
      <TagPlate x={1636} y={742} text="密度 ×12" size={46} t={seg(f, 24, 40)} color={C.graphBlue} />
    </Frame>
  );
};

// ===== #191 地面が足りないなら、答えは一つです。 =====
// 格: 並 (描くのは「入りきらない1区画」1つだけ)
// どこ: 街の中の空き地。塀で囲った20m×20mの1区画。#192 でこの真上に積む
// 演出: 塀の中は詰まっていて、門から外へ列がはみ出して画面の右端まで続く
// 動き: 中の人が揺れ、外の列が右へじりじり動き、「満」の判が落ちてくる
// 絵: 1区画の空き地。塀の中に人が入りきらず、外へはみ出して並んでいる。敷地の寸法の札
const Kb5bKotaeWaHitotsu: React.FC<{ f: number }> = ({ f }) => {
  const shuf = Math.sin(f / 9) * 7 + easeOut(seg(f, 0, 40)) * 26;
  const FY = 752, FX0 = 250, FX1 = 1220;   // 手前の辺
  const BX0 = 414, BX1 = 1084, BY = 492;   // 奥の辺
  const inside: [number, number][] = [
    [470, 724], [600, 736], [730, 726], [860, 738], [990, 724], [1110, 712],
    [500, 652], [630, 660], [760, 650], [890, 662], [1020, 648],
    [560, 584], [690, 578], [820, 586], [950, 574],
    [630, 528], [770, 522], [900, 530],
  ];
  return (
    <Frame f={f} seed={812} bg={KRP.cream}>
      {/* 地面 */}
      <rect x={0} y={498} width={W} height={H - 498} fill={C.dust} />
      <line x1={0} y1={498} x2={W} y2={498} stroke={KRP.ink} strokeWidth={6} opacity={0.5} />
      {/* 奥の街並み */}
      {[40, 200, 1300, 1500, 1700].map((bx, i) => (
        <g key={`bg${i}`} opacity={0.42}>
          <rect x={bx} y={498 - 170 - i * 28} width={148} height={170 + i * 28}
            fill={C.cityPale} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 4 }, (_, k) => (
            <line key={k} x1={bx} y1={498 - 36 - k * 38} x2={bx + 148} y2={498 - 36 - k * 38}
              stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
          ))}
        </g>
      ))}
      {/* 区画の地面 */}
      <polygon points={`${FX0},${FY} ${FX1},${FY} ${BX1},${BY} ${BX0},${BY}`}
        fill={C.island} stroke={KRP.ink} strokeWidth={6} />
      {/* 塀 (奥→左→右)。右手前に門の開き */}
      {[[BX0, BY, BX1, BY], [FX0, FY, BX0, BY], [FX1, FY, BX1, BY]].map(([x1, y1, x2, y2], i) => (
        <g key={`fn${i}`}>
          <line x1={x1} y1={y1 - 86} x2={x2} y2={y2 - 86} stroke={BP.wood} strokeWidth={22} />
          <line x1={x1} y1={y1 - 86} x2={x2} y2={y2 - 86} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
          {Array.from({ length: 7 }, (_, k) => {
            const u = k / 6;
            return <rect key={k} x={lerp(x1, x2, u) - 7} y={lerp(y1, y2, u) - 92}
              width={14} height={92} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />;
          })}
        </g>
      ))}
      {/* 門柱。「満」の板を人の頭より上に吊るため、笠木まで高くしてある */}
      <rect x={FX1 - 17} y={FY - 300} width={34} height={300} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={5} />
      <Rivets x1={FX1} y1={FY - 268} x2={FX1} y2={FY - 56} n={5} r={5} fill={BP.brassDark} />
      <rect x={FX1 - 50} y={FY - 326} width={100} height={28} rx={5} fill={BP.wood}
        stroke={KRP.ink} strokeWidth={5} />
      {/* 中の人 (詰まっている) */}
      {inside.map(([px, py], i) => (
        <Person key={`in${i}`} x={px} y={py} s={0.36} f={f} phase={i}
          cloth={i % 3 === 0 ? "#6B5B4A" : "#4A5B74"} clothDark={i % 3 === 0 ? "#4E4235" : "#36435A"}
          gaze={[0, 0]} />
      ))}
      {/* 外へはみ出した列 */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const px = 1262 + i * 112 + shuf;
        return (
          <g key={`out${i}`}>
            <Person x={px} y={768 + i * 6} s={0.44} f={f} phase={i + 3}
              cloth={i % 2 ? "#4A5B74" : "#6B5B4A"} clothDark={i % 2 ? "#36435A" : "#4E4235"}
              gaze={[-0.6, 0]} />
            <Hat x={px} y={768 + i * 6 - 292 * 0.44 + 4} s={0.42} rot={-6 + i * 3} />
          </g>
        );
      })}
      {/* 寸法 (手前の辺) */}
      <line x1={FX0} y1={798} x2={FX1} y2={798} stroke={C.graphRed} strokeWidth={5} />
      <line x1={FX0} y1={778} x2={FX0} y2={818} stroke={C.graphRed} strokeWidth={6} />
      <line x1={FX1} y1={778} x2={FX1} y2={818} stroke={C.graphRed} strokeWidth={6} />
      <TagPlate x={740} y={768} text="20m" size={42} t={seg(f, 8, 20)} color={C.graphRed} />
      {/* 寸法 (奥行き)。右は門に「満」の板が下がるので、左の外へ出して完全に離す
          (前は赤い「満」と赤い縦の「20m」が隣り合って「満20m」と一語に読めてしまった) */}
      <line x1={FX0 - 130} y1={FY} x2={BX0 - 130} y2={BY} stroke={C.graphRed} strokeWidth={5} />
      <line x1={FX0 - 152} y1={FY} x2={FX0 - 108} y2={FY} stroke={C.graphRed} strokeWidth={6} />
      <line x1={BX0 - 152} y1={BY} x2={BX0 - 108} y2={BY} stroke={C.graphRed} strokeWidth={6} />
      <line x1={FX0 - 136} y1={FY} x2={FX0 - 6} y2={FY} stroke={C.graphRed} strokeWidth={3} opacity={0.45} />
      <TagPlate x={159} y={690} text="20m" size={40} t={seg(f, 14, 26)} color={C.graphRed} rot={-6} />
      {/* 引き出し線つきの面積札 */}
      <line x1={420} y1={404} x2={520} y2={560} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
      <circle cx={520} cy={560} r={8} fill={KRP.ink} />
      <TagPlate x={400} y={378} text="400㎡" size={54} t={seg(f, 4, 16)} />
      {/* 門にかかった「満」の板。笠木から吊る (下端 620 で、はみ出した列の頭 640 より上) */}
      <g transform={`translate(${FX1 + 20} ${FY - 294}) rotate(${-4 + Math.sin(f / 8) * 2.4})`}
        opacity={seg(f, 20, 34)}>
        <line x1={-24} y1={-6} x2={-24} y2={40} stroke={KRP.ink} strokeWidth={4} />
        <line x1={24} y1={-6} x2={24} y2={40} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-53} y={34} width={106} height={106} rx={8} fill={C.paper}
          stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={84} fill={KRP.red}>満</text>
      </g>
    </Frame>
  );
};

// ===== #192 上に、積む。 =====
// 格: 山
// どこ: #191 と同じ1区画の真上。敷地の輪郭を手前に残したまま、そこだけ建ち上がる
// 演出: 1層→30層。足場・巻き上げ機・職人2人が上に乗ったまま上がり、地面には見上げる人
// 動き: rows が 1→30 に増え、カメラが z=1.50→0.58 に引く。吊り荷が繰り返し上がる
// 絵: ★同じ1区画の上に、階が1層ずつ積み上がっていく。1層→30層。足場と職人、カメラが引いていく
const Kb5bUeNiTsumu: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(seg(f, 3, 40));
  const rows = Math.max(1, Math.round(lerp(1, 30, grow)));
  const CX = 960, GY = 820, BW = 420, FH = 40;
  const topW = GY - rows * FH;          // 世界座標の最上階
  const z = lerp(1.5, 0.50, grow);
  const SL = CX - BW / 2 - 70, SR = CX + BW / 2 + 70; // 足場の柱
  const hoist = (f * 6) % 96;
  const loadY = lerp(topW + 520, topW + 60, hoist / 96);
  const DKX = CX + 260;                               // 巻き上げ機の柱
  const WY = topW + 300;                              // 吊り足場 (職人が乗る)
  const ledgers = Array.from({ length: Math.floor(rows / 3) + 1 }, (_, i) => GY - i * FH * 3);
  return (
    <Frame f={f} seed={813} bg={KRP.cream}>
      <g transform={zoomAt(z, CX, 700)}>
        {/* 地面と向こうの街並み */}
        <rect x={-1200} y={GY} width={W + 2400} height={900} fill={C.dust} />
        <line x1={-1200} y1={GY} x2={W + 2400} y2={GY} stroke={KRP.ink} strokeWidth={6} opacity={0.6} />
        {[-760, -520, 1480, 1740].map((bx, i) => (
          <g key={`bg${i}`} opacity={0.5}>
            <rect x={bx} y={GY - 150 - i * 34} width={190} height={150 + i * 34}
              fill={C.cityPale} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 4 }, (_, k) => (
              <line key={k} x1={bx} y1={GY - 34 - k * 36} x2={bx + 190} y2={GY - 34 - k * 36}
                stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
            ))}
          </g>
        ))}
        {/* 手前に残した1区画の敷地 */}
        <LotSlab cx={CX} cy={GY + 118} w={700} d={270} h={18} />
        {/* 柵 */}
        {Array.from({ length: 9 }, (_, i) => {
          const fx = CX - 350 + i * 87;
          return <rect key={`fp${i}`} x={fx - 6} y={GY + 46} width={12} height={72}
            fill={BP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />;
        })}
        <line x1={CX - 356} y1={GY + 64} x2={CX + 356} y2={GY + 64}
          stroke={BP.wood} strokeWidth={11} />
        {/* 足場 (柱・水平材・筋交い) */}
        <g>
          {[SL, SR].map((px) => (
            <rect key={px} x={px - 9} y={topW - 86} width={18} height={GY - topW + 86}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {ledgers.map((ly, i) => (
            <g key={`lg${i}`}>
              <rect x={SL - 9} y={ly - 8} width={SR - SL + 18} height={13}
                fill={BP.steel} stroke={KRP.ink} strokeWidth={3.5} />
              {i < ledgers.length - 1 && (
                <line x1={i % 2 ? SL : SR} y1={ly} x2={i % 2 ? SR : SL} y2={ly - FH * 3}
                  stroke={BP.steelDark} strokeWidth={9} opacity={0.9} />
              )}
            </g>
          ))}
        </g>
        {/* 積み上がった階 */}
        <Tower cx={CX} gy={GY} n={rows} w={BW} fh={FH} f={f} />
        {/* いちばん上の作業床 */}
        <rect x={CX - 300} y={topW - 26} width={600} height={16} rx={4}
          fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={CX - 280} y1={topW - 18} x2={CX + 280} y2={topW - 18} n={9} r={5} fill={BP.woodDark} />
        {/* 吊り足場と職人2人 (てっぺんは画面の外に出るので、少し下げた段に乗せる) */}
        <line x1={CX - 330} y1={WY} x2={CX - 330} y2={topW - 20} stroke={BP.wire} strokeWidth={6} />
        <line x1={CX + 330} y1={WY} x2={CX + 330} y2={topW - 20} stroke={BP.wire} strokeWidth={6} />
        <rect x={CX - 346} y={WY} width={692} height={18} rx={4}
          fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
        <Person x={CX - 232} y={WY} s={0.92} f={f} phase={1} helmet
          cloth="#6B6354" clothDark="#4E4840" tasuki={KRP.red} gaze={[0.4, -0.3]} />
        <Person x={CX + 236} y={WY} s={0.88} f={f} phase={3} helmet
          cloth="#4A5B74" clothDark="#36435A" gaze={[-0.4, 0.2]} />
        {/* 巻き上げ機と吊り荷 */}
        <rect x={DKX - 13} y={topW - 190} width={26} height={GY - topW + 190}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <line x1={DKX} y1={topW - 170} x2={DKX + 330} y2={topW - 60}
          stroke={BP.steelDark} strokeWidth={20} strokeLinecap="round" />
        <line x1={DKX} y1={topW - 170} x2={DKX + 200} y2={topW + 30} stroke={BP.wire} strokeWidth={5} />
        <line x1={DKX + 330} y1={topW - 60} x2={DKX + 330} y2={loadY - 26}
          stroke={BP.wire} strokeWidth={7} />
        <g>
          <line x1={DKX + 250} y1={loadY - 26} x2={DKX + 330} y2={loadY - 64} stroke={KRP.ink} strokeWidth={4} />
          <line x1={DKX + 410} y1={loadY - 26} x2={DKX + 330} y2={loadY - 64} stroke={KRP.ink} strokeWidth={4} />
          <rect x={DKX + 230} y={loadY - 26} width={200} height={28} rx={5}
            fill={BP.slab} stroke={KRP.ink} strokeWidth={5} />
          <rect x={DKX + 230} y={loadY + 2} width={200} height={15} rx={4}
            fill={BP.slabDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 資材置き場 */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={`mt${i}`} x={CX - 780 + (i % 2) * 14} y={GY + 60 - i * 18} width={230} height={18}
            rx={4} fill={BP.slab} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <rect x={CX + 620} y={GY + 20} width={92} height={110} rx={10}
          fill={BP.rust} stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={CX + 630} y1={GY + 46} x2={CX + 702} y2={GY + 46} n={4} r={5} fill={BP.ironDark} />
        {/* 地面の人。見上げている */}
        <Person x={CX - 470} y={GY + 108} s={1.0} f={f} phase={5}
          cloth="#6B5B4A" clothDark="#4E4235" gaze={[0.2, -1]} />
        <Person x={CX + 410} y={GY + 112} s={0.96} f={f} phase={7}
          cloth="#4A5B74" clothDark="#36435A" gaze={[-0.2, -1]} />
        <Person x={CX - 950} y={GY + 96} s={0.92} f={f} phase={9} helmet
          cloth="#6B6354" clothDark="#4E4840" gaze={[1, -0.6]} />
        <Hat x={CX - 470} y={GY + 108 - 292 + 4} s={0.96} rot={-5} />
        {/* 砂ぼこり */}
        {Array.from({ length: 7 }, (_, i) => {
          const u = ((f * 1.3 + i * 13) % 46) / 46;
          return <circle key={`d${i}`} cx={CX - 300 + i * 100 + u * 44} cy={GY + 10 - u * 26}
            r={16 + u * 22} fill={C.dust} opacity={0.5 * (1 - u)} />;
        })}
      </g>
      {/* 階数の目盛りと札 (カメラの外。大きさを固定する) */}
      <FloorScale x={460} yTop={160} yBot={760} max={30} marks={[10, 20, 30]}
        dashedFrom={rows} t={seg(f, 6, 24)} />
      <TagPlate x={286} y={262} text={`${rows}層`} size={72} t={seg(f, 2, 12)} color={C.graphRed} />
      <TagPlate x={1610} y={758} text="敷地は同じ" size={46} t={seg(f, 14, 30)} />
      <ForceArrow x={290} y={700} len={340} rot={-90} w={30} color={KRP.red}
        t={seg(f, 8, 34)} label="積む" labelSize={48} />
    </Frame>
  );
};

// ===== #193 30階建てを建てれば、同じ土地を30回使えます。 =====
// 格: 図 (人も背景も置かない。敷地の板と括弧と数だけ)
// どこ: 方眼紙の上。下端 (790) に元の敷地、そこから上へ30枚
// 演出: 同じ板が30枚。いちばん下だけ厚く「元の敷地」として残す
// 動き: 板が下から順に飛び込んで積み上がり、右の括弧が伸びて ×30 が出る
// 絵: 敷地の札が30枚に複製されて積み上がる。横に「×30」。いちばん下に元の敷地
const Kb5bN30Kai: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(seg(f, 2, 36));
  const n = Math.max(1, Math.round(lerp(1, 30, grow)));
  const CX = 860, BASE = 764, PITCH = 20;
  const topY = BASE - 29 * PITCH;      // 30枚目の高さ (184)
  const brace = easeOut(seg(f, 18, 38));
  return (
    <Frame f={f} seed={814} bg={KRP.cream}>
      <GridPaper />
      {/* 元の敷地 (厚い板) */}
      <LotSlab cx={CX} cy={796} w={620} d={250} h={26} />
      <TagPlate x={396} y={768} text="もとの敷地" size={42} t={seg(f, 4, 16)} />
      {/* 複製された30枚 */}
      {Array.from({ length: n }, (_, i) => {
        const tt = clamp01((grow * 30 - i) / 1.4);
        return (
          <g key={`p${i}`} opacity={clamp01(tt * 1.4)}>
            <LotSlab cx={CX + (1 - easeOut(tt)) * 70} cy={BASE - i * PITCH} w={520} d={214} h={9}
              fill={i % 5 === 4 ? C.goldDark : C.paper} side={C.mapLine} />
          </g>
        );
      })}
      {/* 5枚ごとの数 */}
      {[5, 10, 15, 20, 25, 30].map((m) =>
        n >= m ? (
          <text key={`n${m}`} x={CX - 412} y={BASE - (m - 1) * PITCH - 36} textAnchor="end"
            fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}
            stroke={KRP.cream} strokeWidth={6} paintOrder="stroke">{m}</text>
        ) : null)}
      {/* 右の括弧 (下から上へ伸びる) */}
      {(() => {
        const by = BASE + 20, ty = lerp(BASE + 20, topY - 30, brace), my = (by + ty) / 2;
        return (
          <g stroke={KRP.ink} strokeWidth={8} fill="none" strokeLinecap="round">
            <line x1={CX + 332} y1={by} x2={CX + 332} y2={ty} />
            <line x1={CX + 296} y1={by} x2={CX + 332} y2={by} />
            <line x1={CX + 296} y1={ty} x2={CX + 332} y2={ty} />
            <line x1={CX + 332} y1={my} x2={CX + 384} y2={my} opacity={brace} />
          </g>
        );
      })()}
      <TagPlate x={CX + 540} y={lerp(BASE, 470, brace)} text="×30" size={104}
        t={seg(f, 26, 40)} color={C.graphRed} />
      <TagPlate x={CX + 500} y={230} text="同じ土地" size={50} t={seg(f, 32, 42)} />
    </Frame>
  );
};

// ===== #194 経済史の研究では、順番がはっきりしています。 =====
// 格: 図 (人も背景も置かない。本と図表と矢印だけ)
// どこ: 方眼紙の上。見開きの本を画面の端近くまで広げる (幅1380)
// 演出: 左の頁に街区の地図、右の頁に「地価」「高さ」の枠。その間に太い矢印1本
// 動き: 左頁の区画が中央から順に塗られ、右頁の端がめくれて揺れ、矢印が伸び、栞が振れる
// 絵: 開いた本。左頁は地価の濃い区画を塗った街区図、右頁は順番を示す太い矢印1本
const Kb5bJunbanGaHakkiri: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 2, 32));
  const SP = 960, TOP = 196, BOT = 744;
  const flut = Math.sin(f / 7) * 18;
  // 左の頁に載っている街区図の濃さ (中央がいちばん地価が高い)
  const dens = [[0.18, 0.34, 0.22], [0.40, 0.78, 0.46], [0.24, 0.44, 0.26]];
  return (
    <Frame f={f} seed={815} bg={KRP.cream}>
      <GridPaper />
      {/* 表紙 */}
      <path d={`M ${SP} ${TOP + 6} C 700 ${TOP - 44} 420 ${TOP - 38} 212 ${TOP + 20}
        L 250 ${BOT + 40} C 480 ${BOT - 10} 760 ${BOT + 10} ${SP} ${BOT + 46}
        C 1160 ${BOT + 10} 1440 ${BOT - 10} 1670 ${BOT + 40}
        L 1708 ${TOP + 20} C 1500 ${TOP - 38} 1220 ${TOP - 44} ${SP} ${TOP + 6} Z`}
        fill={C.graphRed} stroke={KRP.ink} strokeWidth={7} />
      {/* 頁の束 */}
      {[0, 1, 2].map((i) => (
        <path key={`e${i}`} d={`M ${SP} ${TOP + 16 + i * 7} C 720 ${TOP - 28 + i * 7} 450 ${TOP - 22 + i * 7} 240 ${TOP + 34 + i * 7}
          L 272 ${BOT + 22 - i * 7} C 500 ${BOT - 26 - i * 7} 770 ${BOT - 6 - i * 7} ${SP} ${BOT + 28 - i * 7}
          C 1150 ${BOT - 6 - i * 7} 1420 ${BOT - 26 - i * 7} 1648 ${BOT + 22 - i * 7}
          L 1680 ${TOP + 34 + i * 7} C 1470 ${TOP - 22 + i * 7} 1200 ${TOP - 28 + i * 7} ${SP} ${TOP + 16 + i * 7} Z`}
          fill={i === 2 ? C.paper : KRP.white} stroke={KRP.ink} strokeWidth={5} />
      ))}
      {/* 綴じ目 */}
      <path d={`M ${SP} ${TOP + 30} L ${SP} ${BOT + 26}`} stroke={KRP.ink} strokeWidth={7} opacity={0.7} />
      <path d={`M ${SP - 26} ${TOP + 34} q 26 24 0 ${BOT - TOP - 8}`} fill="none"
        stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      <path d={`M ${SP + 26} ${TOP + 34} q -26 24 0 ${BOT - TOP - 8}`} fill="none"
        stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      {/* ===== 左の頁: 街区の地図 (図1) =====
          もとは棒グラフ＋右上がりの折れ線だったが、次の #195 と型が重なるのでやめた。
          地価の濃いところを塗りつぶした「本に載っている街区図」にしてある */}
      <g>
        <rect x={404} y={286} width={492} height={372} rx={6} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 街区 3×3。濃さ = その区画の地価 */}
        {dens.map((row, r) =>
          row.map((d, c) => {
            const bx = 422 + c * 160, by = 304 + r * 120;
            const rev = clamp01((t * 9 - (r * 3 + c)) / 1.2);
            const hatch = Math.round(d * 7) + 1;
            return (
              <g key={`blk${r}-${c}`}>
                <rect x={bx} y={by} width={134} height={94} fill={C.island}
                  stroke={KRP.ink} strokeWidth={4} />
                <rect x={bx} y={by} width={134} height={94} fill={C.graphRed}
                  opacity={d * 0.72 * rev} />
                <g stroke={KRP.ink} strokeWidth={3} opacity={0.3 * rev}>
                  {Array.from({ length: hatch }, (_, k) => {
                    const px = bx + 12 + (k * 122) / hatch;
                    return <line key={k} x1={px} y1={by + 92} x2={px + 44} y2={by + 2} />;
                  })}
                </g>
              </g>
            );
          }))}
        {/* 道の中心線 */}
        <g stroke={KRP.ink} strokeWidth={3} strokeDasharray="14 12" opacity={0.4}>
          <line x1={422} y1={411} x2={876} y2={411} />
          <line x1={422} y1={531} x2={876} y2={531} />
          <line x1={569} y1={304} x2={569} y2={638} />
          <line x1={729} y1={304} x2={729} y2={638} />
        </g>
        {/* いちばん高い区画を囲む朱の丸 (息をするように明滅する) */}
        <circle cx={649} cy={471} r={78} fill="none" stroke={C.graphRed} strokeWidth={6}
          opacity={(0.45 + 0.3 * (Math.sin(f / 7) * 0.5 + 0.5)) * clamp01(t * 1.6 - 0.6)} />
        {/* 方位 */}
        <g>
          <line x1={862} y1={330} x2={862} y2={306} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="862,298 854,316 870,316" fill={KRP.ink} />
          <text x={862} y={352} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={26} fill={KRP.ink}>北</text>
        </g>
        <text x={650} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={36} fill={KRP.ink}>図 1</text>
      </g>
      {/* ===== 右の頁: 地価 → 高さ ===== */}
      <g>
        <rect x={1046} y={338} width={210} height={128} rx={10} fill={C.paper}
          stroke={KRP.ink} strokeWidth={6} />
        <text x={1151} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={56} fill={C.graphBlue}>地価</text>
        <rect x={1446} y={338} width={210} height={128} rx={10} fill={C.paper}
          stroke={KRP.ink} strokeWidth={6} />
        <text x={1551} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={56} fill={C.graphRed}>高さ</text>
        {/* 本文の代わりの罫 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`ln${i}`} x1={1046} y1={540 + i * 36} x2={i % 2 ? 1600 : 1656} y2={540 + i * 36}
            stroke={KRP.ink} strokeWidth={5} opacity={0.3} />
        ))}
      </g>
      {/* 順番を示す太い矢印1本 */}
      <ForceArrow x={1272} y={402} len={160} rot={0} w={30} color={C.goldDark}
        t={seg(f, 14, 34)} label="順" labelSize={44} />
      {/* めくれた頁の端 */}
      <path d={`M 1680 ${TOP + 34} q ${60 + flut} ${(BOT - TOP) * 0.5} -22 ${BOT - TOP - 12}`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      {/* 栞 */}
      <path d={`M ${SP + 34} ${TOP - 10} L ${SP + 70} ${TOP - 10} L ${SP + 58 + flut * 0.6} 806
        L ${SP + 46 + flut * 0.6} 806 Z`} fill={C.gold} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 題の札。上端 = y - 48*0.85 = 173。画面上部のタイトル帯 (〜160) と二段重ねにしない */}
      <TagPlate x={350} y={214} text="経済史の研究" size={48} t={seg(f, 4, 18)} />
    </Frame>
  );
};

// #196「逆は成り立たない」で使う図。
// もとは #195 と共用していたが、同じ絵が2枚続くのをやめて #195 は別の絵に作り替えた。
// いまはここが「地価と高さを並べた図」の1枚だけ。
const Kb5bChikaFig: React.FC<{ f: number; t: number; shake?: number }> = ({ f, t, shake = 0 }) => {
  const GX = 230, GY = 700, GW = 540, GH = 520;   // グラフの原点と大きさ
  const vals = [0.14, 0.26, 0.4, 0.58, 0.8, 1.0];
  const sx = (i: number) => GX + 44 + i * 82;
  const sy = (v: number) => GY - v * GH * easeOut(t);
  const rows = Math.max(3, Math.round(lerp(3, 26, easeOut(t))));
  const dx = Math.sin(f / 3.1) * shake;
  return (
    <g>
      {/* ===== 左: 地価のグラフ ===== */}
      <rect x={GX - 50} y={GY - GH - 70} width={GW + 120} height={GH + 150} rx={12}
        fill={C.paper} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
      {/* 横の目盛り線と数値 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={`gy${i}`}>
          <line x1={GX} y1={GY - (i * GH) / 4} x2={GX + GW} y2={GY - (i * GH) / 4}
            stroke={KRP.ink} strokeWidth={i === 0 ? 0 : 2.5} strokeDasharray="12 10" opacity={0.45} />
          <line x1={GX - 24} y1={GY - (i * GH) / 4} x2={GX} y2={GY - (i * GH) / 4}
            stroke={KRP.ink} strokeWidth={5} />
          <text x={GX - 34} y={GY - (i * GH) / 4 + 13} textAnchor="end" fontFamily={FONT}
            fontWeight={800} fontSize={34} fill={KRP.ink}>{i * 50}</text>
        </g>
      ))}
      {/* 棒 */}
      {vals.map((v, i) => (
        <rect key={`bar${i}`} x={sx(i) - 30} y={sy(v)} width={60} height={GY - sy(v)}
          fill={C.graphBlue} stroke={KRP.ink} strokeWidth={4.5} opacity={0.85} />
      ))}
      {/* 折れ線と点 */}
      <polyline points={vals.map((v, i) => `${sx(i)},${sy(v) - 14}`).join(" ")}
        fill="none" stroke={C.graphRed} strokeWidth={9} strokeLinecap="round" />
      {vals.map((v, i) => (
        <circle key={`pt${i}`} cx={sx(i)} cy={sy(v) - 14} r={11}
          fill={KRP.white} stroke={C.graphRed} strokeWidth={6} />
      ))}
      {/* 軸 */}
      <line x1={GX} y1={GY} x2={GX + GW} y2={GY} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <line x1={GX} y1={GY} x2={GX} y2={GY - GH - 20} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <polygon points={`${GX},${GY - GH - 46} ${GX - 15},${GY - GH - 14} ${GX + 15},${GY - GH - 14}`} fill={KRP.ink} />
      <text x={GX - 14} y={GY - GH - 60} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={34} fill={KRP.ink}>円/坪</text>
      {/* 下の年の刻み */}
      {vals.map((_, i) => (
        <line key={`tk${i}`} x1={sx(i)} y1={GY} x2={sx(i)} y2={GY + 18}
          stroke={KRP.ink} strokeWidth={5} />
      ))}
      {/* ===== 右: 建物 ===== */}
      <g transform={`translate(${dx} 0)`}>
        <Tower cx={1440} gy={GY} n={rows} w={300} fh={22} f={f} />
      </g>
      <line x1={1180} y1={GY} x2={1800} y2={GY} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`h${i}`} x1={1190 + i * 78} y1={GY + 30} x2={1218 + i * 78} y2={GY + 2}
          stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      ))}
      {/* 高さの寸法線 */}
      <line x1={1662} y1={GY} x2={1662} y2={GY - rows * 22 - 18}
        stroke={C.graphRed} strokeWidth={5} strokeDasharray="16 12" />
      <line x1={1640} y1={GY - rows * 22 - 18} x2={1684} y2={GY - rows * 22 - 18}
        stroke={C.graphRed} strokeWidth={6} />
      <text x={1700} y={GY - rows * 22 - 6} fontFamily={FONT} fontWeight={900}
        fontSize={40} fill={C.graphRed}>{rows}階</text>
      {/* 札 */}
      <TagPlate x={500} y={762} text="地価" size={56} t={seg(f, 4, 16)} color={C.graphBlue} />
      <TagPlate x={1440} y={762} text="高さ" size={56} t={seg(f, 10, 24)} color={C.graphRed} />
    </g>
  );
};

// ===== #195 地価が上がると、建物が高くなる。 =====
// 格: 並 (主役は「貼り替わる地価の立て札」1つ。背景は地面・奥の街・結果のビル)
// ★ここは前はグラフだった。#194 の頁の図表 → #195 → #196 とグラフの型が3枚続いて
//   いたので、#195 は図をやめて「寄りの絵」に作り替えた。原因を値段そのものにする。
// どこ: 空き地の角。手前のまんなかに地価の立て札、右奥に建ったビル
// 演出: 古い値に取り消し線が引かれ、新しい値の板が釘で打ち付けられる。
//   その右奥で階が増えていく。矢印は原因から結果へ1本だけ
// 動き: 札が笠木から吊られて揺れ、取り消し線が引かれ、新しい値の板が飛んで打たれ、
//   ビルが 7→18 階に育ち、カメラが 1.07→1.00 に引く
// 絵: ★大きな地価の立て札。古い値に取り消し線、新しい値の板を釘打ち。右奥でビルが伸び、人が見上げる
const Kb5bChikaGaAgaru: React.FC<{ f: number }> = ({ f }) => {
  const GY = 788;                                  // 地面
  const SX = 556;                                  // 立て札の中心
  const grow = easeOut(seg(f, 4, 34));
  const rows = Math.max(1, Math.round(lerp(7, 18, grow)));
  const strike = easeOut(seg(f, 8, 20));           // 取り消し線の伸び
  const sw = Math.sin(f / 9) * 1.5;                // 立て札の揺れ (笠木が支点)
  const nail = pop(clamp01(seg(f, 16, 30)));       // 新しい値の板が打たれる
  const z = lerp(1.07, 1.0, easeOut(seg(f, 2, 36)));
  return (
    <Frame f={f} seed={816} bg={KRP.cream}>
      <g transform={zoomAt(z, SX, 520)}>
        {/* 奥の街並み */}
        {[20, 186, 1560, 1740].map((bx, i) => (
          <g key={`bg${i}`} opacity={0.38}>
            <rect x={bx} y={GY - 190 - i * 34} width={150} height={190 + i * 34}
              fill={C.cityPale} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 4 }, (_, k) => (
              <line key={k} x1={bx} y1={GY - 44 - k * 42} x2={bx + 150} y2={GY - 44 - k * 42}
                stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
            ))}
          </g>
        ))}
        {/* ===== 結果: 右奥のビル。階が増える ===== */}
        <Tower cx={1286} gy={GY} n={rows} w={300} fh={28} f={f} />
        <line x1={1472} y1={GY} x2={1472} y2={GY - rows * 28 - 20}
          stroke={C.graphRed} strokeWidth={5} strokeDasharray="16 12" />
        <line x1={1450} y1={GY - rows * 28 - 20} x2={1494} y2={GY - rows * 28 - 20}
          stroke={C.graphRed} strokeWidth={6} />
        <text x={1510} y={GY - rows * 28 - 8} fontFamily={FONT} fontWeight={900}
          fontSize={40} fill={C.graphRed}>{rows}階</text>
        {/* 地面と石 */}
        <rect x={0} y={GY} width={W} height={H - GY} fill={C.dust} />
        <line x1={0} y1={GY} x2={W} y2={GY} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={`st${i}`} cx={60 + i * 222} cy={GY + 42 + rnd(i * 3 + 2) * 150}
            rx={13 + rnd(i * 5) * 11} ry={9 + rnd(i * 7) * 7}
            fill={C.rock} stroke={KRP.ink} strokeWidth={3} opacity={0.75} />
        ))}
        {/* 見上げる人 (札を見た人が、ビルのほうを見上げる) */}
        <Person x={936} y={GY} s={0.66} f={f} phase={1}
          cloth="#4A5B74" clothDark="#36435A" gaze={[0.5, -1]} />
        <Person x={1056} y={GY - 4} s={0.6} f={f} phase={5}
          cloth="#6B5B4A" clothDark="#4E4235" gaze={[0.4, -1]} />
        <Hat x={1056} y={GY - 4 - 292 * 0.6 + 4} s={0.58} rot={-8} fill={C.rock} />
        {/* ===== 原因: 地価の立て札 ===== */}
        <path d={`M ${SX - 92} ${GY + 2} q 92 -34 184 0 z`} fill={C.dust}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={SX - 18} y={320} width={36} height={GY - 320} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={SX - 190} y={290} width={380} height={32} rx={6} fill={BP.wood}
          stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={SX - 150} y1={306} x2={SX + 150} y2={306} n={6} r={6} fill={BP.brassDark} />
        <g transform={`rotate(${sw} ${SX} 322)`}>
          {/* 吊り鎖 */}
          {[-126, 126].map((dx) => (
            <g key={dx}>
              <line x1={SX + dx} y1={322} x2={SX + dx} y2={392} stroke={KRP.ink} strokeWidth={10} />
              <line x1={SX + dx} y1={322} x2={SX + dx} y2={392} stroke={BP.brass} strokeWidth={4} />
            </g>
          ))}
          {/* 板 (木枠 + 紙) */}
          <rect x={SX - 236} y={392} width={472} height={326} rx={10} fill={BP.woodLight}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={SX - 214} y={412} width={428} height={286} rx={6} fill={C.paper}
            stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <path key={`gr${i}`} d={`M ${SX - 232} ${420 + i * 100} q 236 ${12 - i * 8} 464 0`}
              fill="none" stroke={BP.woodDark} strokeWidth={3} opacity={0.32} />
          ))}
          {[[-214, 412], [214, 412], [-214, 698], [214, 698]].map(([dx, dy], i) => (
            <circle key={`nl${i}`} cx={SX + dx} cy={dy} r={8}
              fill={BP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {/* 見出し */}
          <text x={SX} y={466} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={44} fill={KRP.ink}>坪</text>
          <line x1={SX - 170} y1={484} x2={SX + 170} y2={484}
            stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
          {/* 古い値 → 取り消し線 */}
          <text x={SX} y={552} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={68} fill={KRP.grayDark}>50万</text>
          <line x1={SX - 126} y1={542} x2={SX - 126 + 252 * strike} y2={526}
            stroke={C.graphRed} strokeWidth={9} strokeLinecap="round" />
          {/* 新しい値の板 (釘で打ち付けられる) */}
          {nail > 0 && (
            <g transform={`translate(${SX} 632) scale(${nail}) rotate(-3)`}>
              <rect x={-186} y={-50} width={372} height={100} rx={8} fill={KRP.white}
                stroke={KRP.ink} strokeWidth={7} />
              <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={78} fill={C.graphRed}>200万</text>
              {[-158, 158].map((dx) => (
                <circle key={dx} cx={dx} cy={0} r={9} fill={BP.brassDark}
                  stroke={KRP.ink} strokeWidth={3} />
              ))}
            </g>
          )}
        </g>
        {/* 原因 → 結果 の矢印1本 */}
        <ForceArrow x={820} y={446} len={300} rot={0} w={32} color={C.graphRed}
          t={seg(f, 22, 40)} label="原因 → 結果" labelSize={42} />
      </g>
      <TagPlate x={556} y={222} text="地価" size={54} t={seg(f, 6, 18)} color={C.graphBlue} />
      <TagPlate x={1600} y={690} text="高さ" size={54} t={seg(f, 12, 26)} color={C.graphRed} />
    </Frame>
  );
};

// ===== #196 逆は、成り立たないそうです。 =====
// 格: 図 (この章でグラフの型を使うのはここ1枚だけ。#195 は別の絵に作り替えた)
// どこ: 方眼紙の上。左に地価のグラフ、右に建物
// 演出: 右の「高さ」から左の「地価」へ押し返す灰色の矢印。
//   その矢印を止め板が受け止めていて、1ミリも進まない。上に大きな×
// 動き: 矢印が伸びて止め板に当たり、衝撃の線が出て、×が落ちてきて、建物が左右に小さく揺れる
// 絵: 地価のグラフと建物。右から左へ押し返す灰色の矢印が止め板に当たって止まり、大きな×
const Kb5bGyakuWaNaranai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={817} bg={KRP.cream}>
    <GridPaper />
    <Kb5bChikaFig f={f} t={1} shake={5} />
    {/* 逆向きの力を受け止める止め板。ここから先へは進めない */}
    <g>
      <rect x={884} y={300} width={44} height={212} rx={6} fill={BP.wood}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={866} y={288} width={80} height={26} rx={5} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={866} y={498} width={80} height={26} rx={5} fill={BP.woodDark}
        stroke={KRP.ink} strokeWidth={5} />
      <HexBolt x={906} y={352} r={13} rot={10} />
      <HexBolt x={906} y={460} r={13} rot={-14} />
      {/* 筋交い (力のくる右側に張る) */}
      {[[330, 300], [482, 512]].map(([y1, y2], i) => (
        <g key={`br${i}`}>
          <line x1={928} y1={y1} x2={988} y2={y2} stroke={BP.woodDark} strokeWidth={14} />
          <line x1={928} y1={y1} x2={988} y2={y2} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        </g>
      ))}
      {/* 当たった衝撃の線 */}
      {[-1, 1].map((k) => (
        <line key={k} x1={946} y1={404 + k * 30} x2={996} y2={404 + k * 62}
          stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round"
          opacity={0.8 * seg(f, 18, 28)} />
      ))}
    </g>
    <ForceArrow x={1180} y={404} len={250} rot={180} w={32} color={KRP.grayDark}
      t={seg(f, 6, 22)} />
    <XMark x={1060} y={290} s={2.0} t={seg(f, 22, 38)} />
    <TagPlate x={1055} y={580} text="高さ → 地価" size={42} t={seg(f, 30, 42)} color={KRP.grayDark} />
  </Frame>
);

// ===== #197 高いビルは、技術の自慢ではなく、地価の結果でした。 =====
// 格: 山 (この章の軸)
// どこ: 街の地面を切った断面。左に技術の歯車、中央に高層ビル、右に地価の物差し
// 演出: 物差しがビルの足元の土に深く刺さっていて、ビルの高さを測っているのは物差しのほう
// 動き: 物差しが dig ぶん沈んで土煙が立つ。歯車が回り続け、×が落ちてくる。人が見上げる
// 絵: ★軸。高いビルの足元に、地価の目盛りが地面に深く刺さっている。技術の歯車に×、地価に○。見上げる人
const Kb5bChikaNoKekka: React.FC<{ f: number }> = ({ f }) => {
  const GY = 640, BX = 820, RX = 1256, RW = 124;
  const dig = easeOut(seg(f, 6, 30)) * 30;
  const z = lerp(1.1, 1.0, easeOut(seg(f, 2, 34)));
  const ticks = Array.from({ length: 13 }, (_, i) => GY - i * 44);
  const majors = ["1倍", "2倍", "4倍", "8倍", "16倍"];
  return (
    <Frame f={f} seed={818} bg={KRP.cream}>
      <g transform={zoomAt(z, BX, GY)}>
        {/* 奥の街 */}
        {[80, 240, 1420, 1600, 1760].map((bx, i) => (
          <g key={`bg${i}`} opacity={0.42}>
            <rect x={bx} y={GY - 210 - i * 26} width={150} height={210 + i * 26}
              fill={C.cityPale} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 5 }, (_, k) => (
              <line key={k} x1={bx} y1={GY - 40 - k * 40} x2={bx + 150} y2={GY - 40 - k * 40}
                stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
            ))}
          </g>
        ))}
        {/* 主役のビル。画面の上へ抜ける */}
        <Tower cx={BX} gy={GY} n={24} w={340} fh={30} f={f} />
        {/* 地面と土の断面 */}
        <rect x={0} y={GY} width={W} height={260} fill={C.dust} />
        <line x1={0} y1={GY} x2={W} y2={GY} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={C.rock} strokeWidth={3.5} opacity={0.55}>
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={i * 86 - 60} y1={GY + 230} x2={i * 86 + 60} y2={GY + 6} />
          ))}
        </g>
        {Array.from({ length: 11 }, (_, i) => (
          <ellipse key={`st${i}`} cx={70 + i * 176} cy={GY + 64 + rnd(i * 3 + 1) * 140}
            rx={14 + rnd(i * 5) * 12} ry={10 + rnd(i * 7) * 8}
            fill={C.rock} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
        ))}
        {/* ビルの基礎 */}
        <rect x={BX - 200} y={GY} width={400} height={74} fill={BP.slabDark}
          stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={BX - 170} y1={GY + 36} x2={BX + 170} y2={GY + 36} n={9} r={7} fill={BP.ironDark} />
        {/* ===== 地価の物差し。土に深く刺さっている ===== */}
        <g transform={`translate(0 ${dig})`}>
          <polygon
            points={`${RX - RW / 2},96 ${RX + RW / 2},96 ${RX + RW / 2},${GY + 150} ${RX},${GY + 196} ${RX - RW / 2},${GY + 150}`}
            fill={C.paper} stroke={KRP.ink} strokeWidth={7} />
          {/* 木口 (右の側面) */}
          <polygon points={`${RX + RW / 2},96 ${RX + RW / 2 + 16},106 ${RX + RW / 2 + 16},${GY + 142} ${RX + RW / 2},${GY + 150}`}
            fill={C.mapLine} stroke={KRP.ink} strokeWidth={5} />
          {/* 土に埋まった部分を暗くする */}
          <polygon
            points={`${RX - RW / 2},${GY} ${RX + RW / 2},${GY} ${RX + RW / 2},${GY + 150} ${RX},${GY + 196} ${RX - RW / 2},${GY + 150}`}
            fill={C.rock} opacity={0.5} />
          {/* 目盛りの刻み */}
          {ticks.map((ty, i) => (
            <line key={`tk${i}`} x1={RX - RW / 2} y1={ty}
              x2={RX - RW / 2 + (i % 2 ? RW * 0.4 : RW * 0.78)} y2={ty}
              stroke={KRP.ink} strokeWidth={i % 2 ? 4 : 6} />
          ))}
          {majors.map((m, i) => (
            <text key={`mj${i}`} x={RX + RW / 2 + 34} y={GY - i * 88 + 15} fontFamily={FONT}
              fontWeight={900} fontSize={40} fill={i === 0 ? KRP.ink : C.graphRed}>{m}</text>
          ))}
        </g>
        {/* 刺さり口の土の盛り上がりと割れ */}
      <path d={`M ${RX - 150} ${GY + 4} q 60 -34 150 -34 q 90 0 150 34 z`}
        fill={C.dust} stroke={KRP.ink} strokeWidth={5} />
      {[-1, 1].map((sg) => (
        <path key={sg} d={`M ${RX + sg * 70} ${GY + 2} l ${sg * 36} 26 l ${sg * 44} -14`}
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      ))}
      {[-1, 1].map((sg) => (
        <ellipse key={`sn${sg}`} cx={RX + sg * 116} cy={GY + 18} rx={26} ry={17}
          fill={C.rock} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 刺さった衝撃の土煙 */}
        {Array.from({ length: 6 }, (_, i) => {
          const u = ((f * 1.6 + i * 11) % 40) / 40;
          return <circle key={`pf${i}`} cx={RX - 80 + i * 36 + u * 40} cy={GY + 8 - u * 40}
            r={14 + u * 28} fill={C.dust} stroke={KRP.ink} strokeWidth={2}
            opacity={0.55 * (1 - u) * easeOut(seg(f, 6, 20))} />;
        })}
        {/* 見上げる人 */}
        <Person x={1600} y={GY} s={0.8} f={f} phase={2}
          cloth="#4A5B74" clothDark="#36435A" gaze={[-0.5, -1]} />
        <Person x={1748} y={GY} s={0.72} f={f} phase={6}
          cloth="#6B5B4A" clothDark="#4E4235" gaze={[-0.6, -1]} />
        <Hat x={1748} y={GY - 292 * 0.72 + 4} s={0.7} rot={-7} fill={C.rock} />
      </g>
      {/* ===== 技術 = ×  /  地価 = ○ ===== */}
      <Gear x={372} y={286} r={132} teeth={13} rot={f * 2.2} />
      <Gear x={530} y={442} r={66} teeth={9} rot={-f * 4.4} />
      <XMark x={394} y={320} s={2.9} t={seg(f, 14, 28)} />
      <TagPlate x={372} y={574} text="技術" size={58} t={seg(f, 10, 24)} />
      <Maru x={1618} y={236} s={1.95} t={seg(f, 24, 38)} />
      <TagPlate x={1618} y={236} text="地価" size={56} t={seg(f, 20, 32)} color={C.graphRed} />
      <ForceArrow x={1096} y={566} len={330} rot={-90} w={26} color={KRP.green}
        t={seg(f, 28, 42)} label="結果" labelSize={42} />
      <TagPlate x={420} y={758} text="歯車では決まらない" size={38} t={seg(f, 30, 42)} color={KRP.grayDark} />
    </Frame>
  );
};

// ===== #198 高さ200メートルを超えるビルは、1930年に6棟。 =====
// 格: 図 (人も背景も置かない。軸と棒と数字だけ)
// どこ: 方眼紙の上。年の軸は1900〜1945、高さの軸は0〜340m
// 演出: 棒グラフの左端。1930年の1本の年にだけ6本が立っていて、あとは何もない
// 動き: 200mの赤い水平線が左から引かれ、6本が左から順に伸び、括弧と「6棟」が出る
// 絵: 棒グラフの左端。200mの水平線、1930年に6本だけ。目盛りと数字
const Kb5bN1930_6Tou: React.FC<{ f: number }> = ({ f }) => {
  const X0 = 300, Y0 = 760, XE = 1800, PX = 1.794;   // 1m = 1.794px
  const yOf = (m: number) => Y0 - m * PX;
  const xOf = (y: number) => X0 + (y - 1900) * 32;
  const hts = [319, 283, 246, 237, 213, 207];
  const line = easeOut(seg(f, 6, 26));
  const brace = seg(f, 26, 40);
  return (
    <Frame f={f} seed={819} bg={KRP.cream}>
      <GridPaper />
      {/* 高さの目盛り */}
      {[0, 100, 200, 300].map((m) => (
        <g key={`ym${m}`}>
          <line x1={X0 - 26} y1={yOf(m)} x2={XE} y2={yOf(m)} stroke={KRP.ink}
            strokeWidth={m === 0 ? 0 : 2.5} strokeDasharray="14 12" opacity={0.35} />
          <line x1={X0 - 26} y1={yOf(m)} x2={X0} y2={yOf(m)} stroke={KRP.ink} strokeWidth={6} />
          <text x={X0 - 38} y={yOf(m) + 13} textAnchor="end" fontFamily={FONT}
            fontWeight={800} fontSize={38} fill={KRP.ink}>{m}</text>
        </g>
      ))}
      {[50, 150, 250].map((m) => (
        <line key={`ys${m}`} x1={X0 - 14} y1={yOf(m)} x2={X0} y2={yOf(m)}
          stroke={KRP.ink} strokeWidth={4} />
      ))}
      <text x={X0 - 38} y={yOf(340) + 4} textAnchor="end" fontFamily={FONT}
        fontWeight={900} fontSize={40} fill={KRP.ink}>m</text>
      {/* 年の目盛り */}
      {[1900, 1910, 1920, 1930, 1940].map((y) => (
        <g key={`xm${y}`}>
          <line x1={xOf(y)} y1={Y0} x2={xOf(y)} y2={Y0 + 22} stroke={KRP.ink} strokeWidth={6} />
          <text x={xOf(y)} y={Y0 + 64} textAnchor="middle" fontFamily={FONT}
            fontWeight={y === 1930 ? 900 : 800} fontSize={y === 1930 ? 46 : 36}
            fill={y === 1930 ? C.graphRed : KRP.ink}>{y}</text>
        </g>
      ))}
      {[1905, 1915, 1925, 1935, 1945].map((y) => (
        <line key={`xs${y}`} x1={xOf(y)} y1={Y0} x2={xOf(y)} y2={Y0 + 12}
          stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 200m の水平線 */}
      <line x1={X0} y1={yOf(200)} x2={lerp(X0, XE, line)} y2={yOf(200)}
        stroke={C.graphRed} strokeWidth={8} strokeDasharray="26 18" />
      <TagPlate x={1662} y={yOf(200) - 54} text="200m" size={48} t={seg(f, 16, 30)} color={C.graphRed} />
      {/* 1930年の6本 */}
      {hts.map((h, i) => {
        const tt = easeOut(clamp01((seg(f, 8, 36) - i * 0.08) / 0.56));
        const hh = h * PX * tt;
        const bx = 1070 + i * 74;
        return (
          <g key={`b${i}`}>
            <rect x={bx} y={Y0 - hh} width={44} height={hh} fill={C.cityPale}
              stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.floor(hh / 26) }, (_, k) => (
              <line key={k} x1={bx} y1={Y0 - (k + 1) * 26} x2={bx + 44} y2={Y0 - (k + 1) * 26}
                stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
            ))}
            <rect x={bx - 6} y={Y0 - hh - 14} width={56} height={16} rx={3}
              fill={C.cityDark} stroke={KRP.ink} strokeWidth={4} opacity={tt} />
            <text x={bx + 22} y={Y0 - hh - 30} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={30} fill={KRP.ink} opacity={tt}>{h}</text>
          </g>
        );
      })}
      {/* 6本をまとめる括弧 */}
      <g stroke={C.graphRed} strokeWidth={7} fill="none" strokeLinecap="round" opacity={brace}>
        <line x1={1064} y1={112} x2={1064 + 436 * brace} y2={112} />
        <line x1={1064} y1={112} x2={1064} y2={150} />
        <line x1={1500} y1={112} x2={1500} y2={150} opacity={brace} />
        <line x1={1500} y1={112} x2={1562} y2={112} opacity={brace} />
      </g>
      <TagPlate x={1664} y={112} text="6棟" size={68} t={seg(f, 30, 42)} color={C.graphRed} />
      {/* 軸 */}
      <line x1={X0} y1={Y0} x2={XE} y2={Y0} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <line x1={X0} y1={Y0} x2={X0} y2={yOf(340)} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <text x={XE - 10} y={Y0 + 64} textAnchor="end" fontFamily={FONT}
        fontWeight={900} fontSize={40} fill={KRP.ink}>年</text>
      {/* 1930年の位置を指す印 */}
      <polygon points={`${xOf(1930)},${Y0 + 30} ${xOf(1930) - 18},${Y0 + 2} ${xOf(1930) + 18},${Y0 + 2}`}
        fill={C.graphRed} stroke={KRP.ink} strokeWidth={4} opacity={seg(f, 4, 16)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb5_hito_ga_fueru: (f) => <Kb5bHitoGaFueru f={f} />,
  kb5_hito_ni_atsumaru: (f) => <Kb5bHitoNiAtsumaru f={f} />,
  kb5_kotae_wa_hitotsu: (f) => <Kb5bKotaeWaHitotsu f={f} />,
  kb5_ue_ni_tsumu: (f) => <Kb5bUeNiTsumu f={f} />,
  kb5_30kai_30kai: (f) => <Kb5bN30Kai f={f} />,
  kb5_junban_ga_hakkiri: (f) => <Kb5bJunbanGaHakkiri f={f} />,
  kb5_chika_ga_agaru: (f) => <Kb5bChikaGaAgaru f={f} />,
  kb5_gyaku_wa_naranai: (f) => <Kb5bGyakuWaNaranai f={f} />,
  kb5_chika_no_kekka: (f) => <Kb5bChikaNoKekka f={f} />,
  kb5_1930_6tou: (f) => <Kb5bN1930_6Tou f={f} />,
};

export const K_B5B_MOTIFS: string[] = [
  "kb5_hito_ga_fueru",      // #189 でも、そこで働きたい人は増え続けます。
  "kb5_hito_ni_atsumaru",   // #190 人は、人が集まる場所に集まりたがります。
  "kb5_kotae_wa_hitotsu",   // #191 地面が足りないなら、答えは一つです。
  "kb5_ue_ni_tsumu",        // #192 上に、積む。
  "kb5_30kai_30kai",        // #193 30階建てを建てれば、同じ土地を30回使えます。
  "kb5_junban_ga_hakkiri",  // #194 経済史の研究では、順番がはっきりしています。
  "kb5_chika_ga_agaru",     // #195 地価が上がると、建物が高くなる。
  "kb5_gyaku_wa_naranai",   // #196 逆は、成り立たないそうです。
  "kb5_chika_no_kekka",     // #197 高いビルは、技術の自慢ではなく、地価の結果でした。
  "kb5_1930_6tou",          // #198 高さ200メートルを超えるビルは、1930年に6棟。
];

export const kosoB5bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
