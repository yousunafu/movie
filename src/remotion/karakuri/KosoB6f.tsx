// 「なぜ高層ビルは生まれたのか」: 第6章「高いほど、安い部屋だった。」6 (欲が地面に〜結び)
// 担当範囲: 台本 docs/koso-script-v7.txt の 273〜283行目 (文#272〜#282・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb6_ で始める。WobbleDefs の seed はこのファイルでは 905〜915 を使う。
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
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale, GuideRail,
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
};

// ===================================================================
// このファイルだけのローカル部品 (2回以上出る物は形をそろえるため切り出す)
// ===================================================================

/** 金貨。縁のギザギザと打刻まで描く。地面の層・代金の列に使う */
const Coin: React.FC<{
  x: number; y: number; r?: number; f?: number; seed?: number; rot?: number;
}> = ({ x, y, r = 26, f = 0, seed = 0, rot = 0 }) => {
  const glint = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((f + seed * 9) / 7));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.74} fill={C.goldDark}
        stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={0} cy={-r * 0.1} rx={r * 0.9} ry={r * 0.64} fill={C.gold}
        stroke={KRP.ink} strokeWidth={2.5} />
      {/* 縁のギザ */}
      <g stroke={C.goldDark} strokeWidth={2.2}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 22.5 - 80) * Math.PI / 180;
          return (
            <line key={i} x1={Math.cos(a) * r * 0.9} y1={Math.sin(a) * r * 0.6 - r * 0.1}
              x2={Math.cos(a) * r * 0.66} y2={Math.sin(a) * r * 0.44 - r * 0.1} />
          );
        })}
      </g>
      {/* 打刻 */}
      <ellipse cx={0} cy={-r * 0.1} rx={r * 0.34} ry={r * 0.24} fill="none"
        stroke={C.goldDark} strokeWidth={2.5} />
      {/* 光 */}
      <ellipse cx={-r * 0.32} cy={-r * 0.3} rx={r * 0.26} ry={r * 0.12}
        fill={KRP.white} opacity={0.75 * glint} />
    </g>
  );
};

/** 歯車。歯・肉抜き穴・軸までつくる */
const Gear: React.FC<{
  x: number; y: number; r: number; teeth?: number; rot?: number; fill?: string;
}> = ({ x, y, r, teeth = 14, rot = 0, fill = BP.steel }) => {
  const tr = r * 0.2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`rotate(${rot})`}>
        {Array.from({ length: teeth }, (_, i) => (
          <rect key={i} x={r - tr * 0.5} y={-tr * 0.6} width={tr * 1.3} height={tr * 1.2} rx={3}
            fill={fill} stroke={KRP.ink} strokeWidth={3}
            transform={`rotate(${(i * 360) / teeth})`} />
        ))}
        <circle r={r} fill={fill} stroke={KRP.ink} strokeWidth={5.5} />
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i * 72 + 18) * Math.PI / 180;
          return (
            <circle key={i} cx={Math.cos(a) * r * 0.58} cy={Math.sin(a) * r * 0.58}
              r={r * 0.17} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
          );
        })}
        <circle r={r * 0.3} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      <circle r={r * 0.13} fill={BP.brass} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

/** 代金の計。目盛り60・大目盛りの数字・秒針・軸・裏の歯車まで描く */
const CostDial: React.FC<{
  x: number; y: number; r?: number; f: number; t?: number; step?: boolean; face?: string;
}> = ({ x, y, r = 200, f, t = 1, step = true, face = BP.paper }) => {
  const ap = clamp01(t);
  const tick = step ? Math.floor(f / 5) : f / 5;
  const ang = -90 + tick * 12;
  const jolt = step ? Math.max(0, 1 - ((f % 5) / 2.2)) * 2.4 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(ap)})`}>
      {/* 裏の歯車列 */}
      <Gear x={r * 0.86} y={r * 0.92} r={r * 0.34} teeth={16} rot={f * 2.4} />
      <Gear x={r * 0.86 + r * 0.56} y={r * 0.92 + r * 0.22} r={r * 0.23} teeth={11}
        rot={-f * 3.6} fill={BP.steelLight} />
      {/* 軸 (歯車から針の心棒へ) */}
      <line x1={0} y1={0} x2={r * 0.86} y2={r * 0.92} stroke={BP.steelDark}
        strokeWidth={14} strokeLinecap="round" />
      <line x1={0} y1={0} x2={r * 0.86} y2={r * 0.92} stroke={KRP.ink} strokeWidth={4} />
      {/* 外輪 */}
      <circle r={r} fill={face} stroke={KRP.ink} strokeWidth={9} />
      <circle r={r * 0.94} fill="none" stroke={BP.brassDark} strokeWidth={5} />
      {/* 小目盛り60 + 大目盛り12 */}
      <g>
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 - 90) * Math.PI / 180;
          const big = i % 5 === 0;
          const r0 = big ? r * 0.74 : r * 0.83;
          const done = step && i <= tick % 60;
          return (
            <line key={i}
              x1={Math.cos(a) * r0} y1={Math.sin(a) * r0}
              x2={Math.cos(a) * r * 0.92} y2={Math.sin(a) * r * 0.92}
              stroke={done ? C.gold : KRP.ink} strokeWidth={big ? 7 : 3.5}
              strokeLinecap="round" opacity={done ? 1 : 0.85} />
          );
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 - 90) * Math.PI / 180;
          return (
            <text key={i} x={Math.cos(a) * r * 0.6} y={Math.sin(a) * r * 0.6 + 12}
              textAnchor="middle" fontFamily={FONT} fontWeight={800}
              fontSize={r * 0.15} fill={KRP.grayDark}>{i * 5}</text>
          );
        })}
      </g>
      {/* 秒針 */}
      <g transform={`rotate(${ang + jolt})`}>
        <polygon points={`${r * 0.9},0 ${r * 0.1},${-r * 0.055} ${-r * 0.22},0 ${r * 0.1},${r * 0.055}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 心棒 */}
      <circle r={r * 0.09} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      <HexBolt x={0} y={0} r={r * 0.045} fill={BP.brassDark} />
    </g>
  );
};

/** ポンプ。渦巻ケーシング・羽根・モーター・吸込管・吐出管・台 */
const Pump: React.FC<{
  x: number; y: number; s?: number; f: number; t?: number;
}> = ({ x, y, s = 1, f, t = 1 }) => {
  const ap = clamp01(t);
  if (ap <= 0) return null;
  const rot = f * 9;
  const CX = -62, CY = -104, CR = 94;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * pop(ap)})`}>
      {/* 台 */}
      <rect x={-166} y={-28} width={336} height={36} rx={6}
        fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
      <Rivets x1={-134} y1={-10} x2={138} y2={-10} n={7} r={7} fill={BP.ironDark} />
      {/* 吸込管 (左) */}
      <rect x={-286} y={CY - 30} width={132} height={60} rx={6}
        fill={KPP.mizuDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-296} y={CY - 42} width={22} height={84} rx={5}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      {/* 吐出管 (上) */}
      <rect x={CX - 34} y={CY - 212} width={68} height={126} rx={6}
        fill={KPP.mizu} stroke={KRP.ink} strokeWidth={6} />
      <rect x={CX - 48} y={CY - 224} width={96} height={24} rx={5}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <HexBolt x={CX - 32} y={CY - 212} r={8} />
      <HexBolt x={CX + 32} y={CY - 212} r={8} />
      {/* モーター (右) */}
      <rect x={34} y={CY - 66} width={138} height={132} rx={16}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.steelDark} strokeWidth={7}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={48 + i * 22} y1={CY - 58} x2={48 + i * 22} y2={CY + 58} />
        ))}
      </g>
      <rect x={34} y={CY - 66} width={138} height={132} rx={16}
        fill="none" stroke={KRP.ink} strokeWidth={6} />
      <rect x={60} y={CY + 60} width={86} height={28} rx={5}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 軸 (モーター→ケーシング) */}
      <rect x={CX + CR * 0.6} y={CY - 11} width={34 - CX - CR * 0.6} height={22} rx={5}
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 渦巻ケーシング */}
      <circle cx={CX} cy={CY} r={CR} fill={KPP.mizu} stroke={KRP.ink} strokeWidth={8} />
      <circle cx={CX} cy={CY} r={CR * 0.72} fill={KPP.mizuDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 羽根 (回る) */}
      <g transform={`rotate(${rot} ${CX} ${CY})`}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i * 360) / 7;
          return (
            <path key={i}
              d={`M ${CX + 18} ${CY} Q ${CX + 44} ${CY - 26} ${CX + CR * 0.64} ${CY - 10}`}
              transform={`rotate(${a} ${CX} ${CY})`}
              fill="none" stroke={KRP.white} strokeWidth={9} strokeLinecap="round"
              opacity={0.82} />
          );
        })}
      </g>
      <circle cx={CX} cy={CY} r={18} fill={BP.brass} stroke={KRP.ink} strokeWidth={4.5} />
      {/* ケーシングの合わせボルト */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 + 22) * Math.PI / 180;
        return <HexBolt key={i} x={CX + Math.cos(a) * CR * 0.86} y={CY + Math.sin(a) * CR * 0.86} r={8} />;
      })}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// ===== #272 そして、欲が地面になりました。 =====
// 格: 図
// どこ: 5本柱の足もとに寄った断面図。柱は画面の上端で切れていて、見えるのは足と座だけ。
// 演出: 地面を画面の2/3まで大きく取る。地層のあいだに金貨の層が2枚挟まっていて、
//       その層の上に柱が座っている。「欲」の札は地面のまんなかに大きく。
// 動き: f=0〜20 で地層の線が左から引かれ、f=12〜40 で金貨が層ごとに現れて光る。
//       柱は荷重でわずかに沈み (f=8〜38)、荷重の矢印が上から順に出る。
const Kb6fYokuGaJimen: React.FC<{ f: number }> = ({ f }) => {
  const GY = 398;                                      // 地面の上端
  const draw = easeOut(clamp01(seg(f, 0, 20)));
  const coin = clamp01(seg(f, 12, 40));
  const sink = easeOut(clamp01(seg(f, 8, 38))) * 9;    // 柱が沈む
  const PX = [380, 670, 960, 1250, 1540];
  const PC = [KPP.hone, KPP.hako, KPP.mizu, KPP.akari, KPP.kuuki];
  const PD = [KPP.honeDark, KPP.hakoDark, KPP.mizuDark, KPP.akariDark, KPP.kuukiDark];
  const seams = [{ y: GY + 124, n: 16 }, { y: GY + 292, n: 14 }];
  return (
    <Frame f={f} seed={905} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 柱の足もと (上端で切れている) ===== */}
      {PX.map((px, i) => (
        <g key={px} transform={`translate(0 ${sink})`}>
          <rect x={px - 62} y={-24} width={124} height={GY + 26}
            fill={PC[i]} stroke={KRP.ink} strokeWidth={7} />
          <rect x={px - 62} y={-24} width={32} height={GY + 26} fill={KRP.white} opacity={0.24} />
          <rect x={px + 36} y={-24} width={26} height={GY + 26} fill={PD[i]} opacity={0.55} />
          <Rivets x1={px} y1={70} x2={px} y2={GY - 56} n={6} r={8} fill={PD[i]} />
          {/* 柱の座 (地面にめり込む板) */}
          <rect x={px - 98} y={GY - 36} width={196} height={40} rx={6}
            fill={BP.slabDark} stroke={KRP.ink} strokeWidth={7} />
          <HexBolt x={px - 72} y={GY - 16} r={9} />
          <HexBolt x={px + 72} y={GY - 16} r={9} />
          <ForceArrow x={px} y={96} len={146} rot={90} w={20} color={KRP.red}
            t={seg(f, 8 + i * 3, 24 + i * 3)} />
        </g>
      ))}
      {/* ===== 地面の断面 ===== */}
      <rect x={-20} y={GY} width={W + 40} height={H - GY + 20}
        fill={KPP.ground} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-20} y={GY + 196} width={W + 40} height={H - GY - 176}
        fill={KPP.bedrock} opacity={0.55} />
      {/* 地層の線 (左から引かれる) */}
      <g stroke={KRP.ink} strokeWidth={4.5} opacity={0.42}>
        {[62, 196, 258, 372].map((d) => (
          <line key={d} x1={-20} y1={GY + d} x2={-20 + (W + 40) * draw} y2={GY + d} />
        ))}
      </g>
      {/* 砂利 */}
      <g>
        {Array.from({ length: 44 }, (_, i) => (
          <ellipse key={i} cx={30 + rnd(i * 7 + 2) * 1860} cy={GY + 26 + rnd(i * 3 + 5) * 400}
            rx={7 + rnd(i) * 9} ry={5 + rnd(i * 5) * 6}
            fill={KPP.groundDark} opacity={0.5} stroke={KRP.ink} strokeWidth={2} />
        ))}
      </g>
      {/* ===== 金貨の層 ===== */}
      {seams.map((s, si) => (
        <g key={si}>
          <rect x={-20} y={s.y - 36} width={W + 40} height={72}
            fill={C.goldDark} opacity={0.28 * clamp01(coin * 2)} />
          <g stroke={C.goldDark} strokeWidth={4} opacity={0.6 * clamp01(coin * 2)}>
            <line x1={-20} y1={s.y - 36} x2={W + 20} y2={s.y - 36} />
            <line x1={-20} y1={s.y + 36} x2={W + 20} y2={s.y + 36} />
          </g>
          {Array.from({ length: s.n }, (_, i) => {
            const t = clamp01((coin - si * 0.16 - (i / s.n) * 0.52) * 3.4);
            if (t <= 0) return null;
            return (
              <g key={i} opacity={t}>
                <Coin x={34 + i * ((W - 68) / (s.n - 1))}
                  y={s.y + (rnd(i * 11 + si * 3) - 0.5) * 34}
                  r={27 * pop(t)} f={f} seed={i + si * 7}
                  rot={(rnd(i * 5 + si) - 0.5) * 44} />
              </g>
            );
          })}
        </g>
      ))}
      {/* ===== 札 ===== */}
      <TagPlate x={960} y={636} text="欲" size={124} t={seg(f, 18, 34)} fill={C.gold} />
      <TagPlate x={174} y={482} text="地面" size={46} t={seg(f, 4, 18)} />
      <TagPlate x={1684} y={524} text="金貨の層" size={40} t={seg(f, 22, 38)} color={C.goldDark} />
      <TagPlate x={170} y={154} text="柱" size={44} t={seg(f, 2, 14)} />
      <TagPlate x={1690} y={760} text="地価" size={40} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ===== #273 そして揃ったあとも、動かし続けなければなりません。 =====
// 格: 並
// どこ: タワマンの地下機械室。奥壁に配管と電線管、右に配電盤、左にポンプ。床はコンクリ。
// 演出: 描くのは「回り続けているポンプ」1つ。人は点検の人1人だけ、計器を見ている。
//       背景は壁・天井の配管・床・配電盤の4要素だけに絞る。
// 動き: ポンプの羽根が毎フレーム回る。配電盤の計器の針がゆれ、表示灯が点滅する。
//       f=0〜40 でゆっくり寄る。立管の水の矢印が f=14〜34 で上がる。
const Kb6fUgokashiTsuzukeru: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.03 * easeOut(clamp01(seg(f, 0, 40)));
  const FY = 764;
  // --- 配管の通り芯 (ポンプの吐出口から拾う。ずれないように数で押さえる) ---
  const PX = 700, PS = 1.18;        // ポンプの置き場所と倍率 (<Pump> と同じ値)
  const RX = PX - 62 * PS;          // 立管の中心 = 吐出口の中心 (626.84)
  const RHW = 34 * PS;              // 管の半分の太さ = 吐出管と同じ (40.12)
  const RFW = 48 * PS;              // フランジの半分の幅 = ポンプ側と同じ (56.64)
  const RBOT = FY - 328 * PS;       // ポンプ上フランジの上面 = 継ぐ高さ (376.96)
  const CEIL = 128;                 // 天井の横引き管の下端
  const EFR = 34;                   // エルボの隅肉の半径
  const needle = Math.sin(f / 4.2) * 11 - 28;
  const needle2 = Math.sin(f / 3.1 + 1.4) * 9 + 18;
  const lamp = (k: number) => (Math.floor(f / 6 + k) % 3 === 0 ? 1 : 0.22);
  return (
    <Frame f={f} seed={906} bg={KRP.cream}>
      <g transform={zoomAt(z, 820, 520)}>
        {/* ===== 壁と床 ===== */}
        <rect x={0} y={60} width={W} height={FY - 60} fill={BP.chalk}
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={0} y={FY} width={W} height={H - FY} fill={BP.slab}
          stroke={KRP.ink} strokeWidth={8} />
        <g stroke={BP.slabDark} strokeWidth={5} opacity={0.6}>
          <line x1={0} y1={FY + 76} x2={W} y2={FY + 76} />
          <line x1={520} y1={FY} x2={430} y2={H} />
          <line x1={1240} y1={FY} x2={1330} y2={H} />
        </g>
        {/* 壁の目地 */}
        <g stroke={BP.slabDark} strokeWidth={3} opacity={0.4}>
          {[220, 380, 540, 700].map((y) => <line key={y} x1={0} y1={y} x2={W} y2={y} />)}
        </g>
        {/* ===== 天井の配管と電線管 ===== */}
        <rect x={-10} y={76} width={W + 20} height={52} rx={8}
          fill={KPP.mizu} stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={60} y1={102} x2={1860} y2={102} n={13} r={8} fill={KPP.mizuDark} />
        <rect x={-10} y={148} width={W + 20} height={30} rx={6}
          fill={KPP.akari} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={5}>
          {[240, 700, 1160, 1620].map((x) => (
            <g key={x}>
              <rect x={x - 16} y={62} width={32} height={22} fill={BP.steelDark}
                stroke={KRP.ink} strokeWidth={5} />
              <rect x={x - 12} y={128} width={24} height={22} fill={BP.steelDark}
                stroke={KRP.ink} strokeWidth={5} />
            </g>
          ))}
        </g>
        {/* ===== 水の立管 (ポンプの吐出口 → エルボ → 天井の横引き管) =====
            中心 x も太さも、ポンプの吐出管 (RX / RHW) から拾って合わせてある */}
        {/* 管の中身 */}
        <path d={`M ${RX - RHW} ${CEIL} L ${RX - RHW} ${RBOT} L ${RX + RHW} ${RBOT} L ${RX + RHW} ${CEIL} Z`}
          fill={KPP.mizu} />
        {/* エルボの隅肉 (ここで曲がって天井の横引き管へ抜ける) */}
        <path d={`M ${RX - RHW} ${CEIL} L ${RX - RHW} ${CEIL + EFR} Q ${RX - RHW} ${CEIL} ${RX - RHW - EFR} ${CEIL} Z`}
          fill={KPP.mizu} />
        <path d={`M ${RX + RHW} ${CEIL} L ${RX + RHW} ${CEIL + EFR} Q ${RX + RHW} ${CEIL} ${RX + RHW + EFR} ${CEIL} Z`}
          fill={KPP.mizu} />
        {/* 横引き管の下辺の線を、管の口のぶんだけ消して1本につなげる */}
        <rect x={RX - RHW + 4} y={CEIL - 8} width={RHW * 2 - 8} height={16} fill={KPP.mizu} />
        {/* 管の輪郭 (隅肉から下へ、そのまま立管の壁になる) */}
        <path d={`M ${RX - RHW - EFR} ${CEIL} Q ${RX - RHW} ${CEIL} ${RX - RHW} ${CEIL + EFR} L ${RX - RHW} ${RBOT}`}
          fill="none" stroke={KRP.ink} strokeWidth={7} />
        <path d={`M ${RX + RHW + EFR} ${CEIL} Q ${RX + RHW} ${CEIL} ${RX + RHW} ${CEIL + EFR} L ${RX + RHW} ${RBOT}`}
          fill="none" stroke={KRP.ink} strokeWidth={7} />
        {/* 水の向き (管の中。札は管に重ならないよう左へ出す) */}
        <ForceArrow x={RX} y={RBOT - 30} len={164} rot={-90} w={22} color={KPP.mizuDark}
          t={seg(f, 14, 34)} />
        <text x={RX - RHW - 42} y={CEIL + 174} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={38} fill={KPP.mizuDark} stroke={KRP.white}
          strokeWidth={6} paintOrder="stroke" opacity={easeOut(seg(f, 14, 34))}>水</text>
        {/* つなぎ目のフランジ (ポンプ側の同じ幅・同じボルト位置で締めてある) */}
        <rect x={RX - RFW} y={RBOT - 27} width={RFW * 2} height={27} rx={5} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={5} />
        <HexBolt x={RX - 32 * PS} y={RBOT - 13.5} r={8} />
        <HexBolt x={RX + 32 * PS} y={RBOT - 13.5} r={8} />
        {/* ===== ポンプ (主役。回り続けている) ===== */}
        <Pump x={PX} y={FY} s={PS} f={f} t={seg(f, 2, 14)} />
        {/* ===== 配電盤 ===== */}
        <g>
          <rect x={1216} y={264} width={468} height={460} rx={10}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={8} />
          <rect x={1240} y={288} width={420} height={412} rx={6}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 計器2つ */}
          {[[1340, 382], [1560, 382]].map(([mx, my], i) => (
            <g key={i}>
              <circle cx={mx} cy={my} r={74} fill={BP.paper} stroke={KRP.ink} strokeWidth={7} />
              <g stroke={KRP.ink} strokeWidth={4}>
                {Array.from({ length: 11 }, (_, k) => {
                  const a = (-210 + k * 24) * Math.PI / 180;
                  return (
                    <line key={k} x1={mx + Math.cos(a) * 54} y1={my + Math.sin(a) * 54}
                      x2={mx + Math.cos(a) * 66} y2={my + Math.sin(a) * 66} />
                  );
                })}
              </g>
              <line x1={mx} y1={my} x2={mx + Math.cos(((i ? needle2 : needle) - 90) * Math.PI / 180) * 58}
                y2={my + Math.sin(((i ? needle2 : needle) - 90) * Math.PI / 180) * 58}
                stroke={KRP.red} strokeWidth={8} strokeLinecap="round" />
              <circle cx={mx} cy={my} r={10} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          {/* ブレーカーの列 */}
          {Array.from({ length: 3 }, (_, r2) => (
            <g key={r2}>
              {Array.from({ length: 7 }, (_, c2) => (
                <rect key={c2} x={1268 + c2 * 54} y={494 + r2 * 68} width={38} height={50} rx={5}
                  fill={BP.chalk} stroke={KRP.ink} strokeWidth={4} />
              ))}
            </g>
          ))}
          {/* 表示灯 */}
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={1636} cy={500 + k * 68} r={17}
              fill={k === 0 ? KPP.kuuki : k === 1 ? KPP.akari : KRP.red}
              opacity={lamp(k)} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
        </g>
        {/* ===== 点検の人 (計器を見ている) ===== */}
        <Person x={1060} y={FY} s={1.06} f={f} cloth={KPP.kuuki} clothDark={KPP.kuukiDark}
          helmet face="normal" gaze={[0.6, -0.15]} lean={2} />
        {/* 手の点検板 */}
        <g>
          <rect x={1110} y={518} width={96} height={126} rx={7} fill={BP.paper}
            stroke={KRP.ink} strokeWidth={6} transform="rotate(10 1158 580)" />
          <g stroke={KRP.grayDark} strokeWidth={4} opacity={0.7}
            transform="rotate(10 1158 580)">
            {[548, 578, 608].map((y) => <line key={y} x1={1124} y1={y} x2={1192} y2={y} />)}
          </g>
        </g>
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={214} y={234} text="機械室" size={50} t={seg(f, 2, 14)} />
      <TagPlate x={214} y={592} text="ポンプ" size={42} t={seg(f, 10, 24)} color={KPP.mizuDark} />
      <TagPlate x={1450} y={206} text="配電盤" size={44} t={seg(f, 16, 30)} color={KPP.akariDark} />
      <TagPlate x={1058} y={400} text="点検" size={40} t={seg(f, 24, 38)} />
      <TagPlate x={1700} y={784} text="24時間" size={38} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #274 高さの代金は、いまも毎秒払われています。 =====
// 格: 図
// どこ: クリーム地の方眼。描くのは代金の計 (大きな文字盤) ひとつと、右の払った分の柱。
// 演出: 文字盤を画面の短辺の半分より大きく取り、裏の歯車列と針の心棒まで見せる。
//       右に縦の目盛りを立て、秒針が1つ刻むたびに1目盛り積み上がる。
// 動き: 秒針は5フレームごとにカクッと1目盛り進む (歯車は連続して回る)。
//       右の柱は刻みに合わせて段が増え、天面に金貨が乗る。
const Kb6fMaibyouHarawareru: React.FC<{ f: number }> = ({ f }) => {
  const tick = Math.floor(f / 5);                 // 刻んだ数
  const GB = 700, GT = 196, GN = 12;              // 右の目盛りの下端・上端・段数
  const step = (GB - GT) / GN;
  const filled = Math.min(GN, tick);
  const jolt = Math.max(0, 1 - ((f % 5) / 2.2)) * 5;
  return (
    <Frame f={f} seed={907} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 代金の計 (主役) ===== */}
      <CostDial x={640} y={420} r={280} f={f} t={seg(f, 2, 16)} />
      {/* 文字盤を据える台 */}
      <rect x={300} y={716} width={680} height={30} rx={7}
        fill={BP.slabDark} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={340} y1={731} x2={940} y2={731} n={9} r={7} fill={BP.ironDark} />
      {/* ===== 右: 払った分の縦目盛り ===== */}
      <g>
        {/* 枠 */}
        <rect x={1376} y={GT - 26} width={168} height={GB - GT + 52} rx={8}
          fill={BP.paper} stroke={KRP.ink} strokeWidth={8} />
        {/* 積み上がった段 */}
        {Array.from({ length: filled }, (_, i) => (
          <rect key={i} x={1392} y={GB - (i + 1) * step + 3} width={136} height={step - 6} rx={4}
            fill={i % 2 === 0 ? C.gold : C.goldDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 目盛りと数字 */}
        <g>
          {Array.from({ length: GN + 1 }, (_, i) => (
            <g key={i}>
              <line x1={1544} y1={GB - i * step} x2={1596} y2={GB - i * step}
                stroke={KRP.ink} strokeWidth={i % 3 === 0 ? 7 : 4} />
              {i % 3 === 0 && (
                <text x={1612} y={GB - i * step + 13} fontFamily={FONT} fontWeight={800}
                  fontSize={34} fill={KRP.ink}>{i}</text>
              )}
            </g>
          ))}
          <line x1={1544} y1={GT} x2={1544} y2={GB} stroke={KRP.ink} strokeWidth={8} />
        </g>
        {/* 天面の金貨 */}
        {filled > 0 && (
          <g transform={`translate(0 ${-jolt})`}>
            <Coin x={1428} y={GB - filled * step - 18} r={26} f={f} seed={2} />
            <Coin x={1484} y={GB - filled * step - 26} r={24} f={f} seed={5} rot={14} />
          </g>
        )}
        {/* 台 */}
        <rect x={1346} y={GB + 26} width={228} height={28} rx={6}
          fill={BP.slabDark} stroke={KRP.ink} strokeWidth={7} />
      </g>
      {/* 秒針から目盛りへ渡る矢印 */}
      <ForceArrow x={1000} y={300} len={320} rot={0} w={22} color={KRP.red}
        t={seg(f, 12, 28)} label="毎秒" labelSize={42} />
      {/* ===== 札 ===== */}
      <TagPlate x={560} y={778} text="代金の計" size={44} t={seg(f, 6, 20)} />
      <TagPlate x={1460} y={128} text="払った分" size={46} t={seg(f, 18, 32)} />
      <TagPlate x={1700} y={420} text="増え続ける" size={34} t={seg(f, 26, 40)} color={KRP.red} />
      <TagPlate x={206} y={150} text="1秒＝1目盛り" size={34} t={seg(f, 22, 38)} />
    </Frame>
  );
};

// ===== #275 払っているのは、電気と、ポンプと、点検する人です。 =====
// 格: 図
// どこ: クリーム地の方眼を3つに割った並べ図。背景は置かない。
// 演出: 「電気」「ポンプ」「点検する人」の3札を横に大きく並べ、上に○、下にそれぞれの図。
//       画面の横幅をいっぱいに使い、3つを同じ大きさ・同じ高さにそろえる。
// 動き: f=2〜34 で左から順に ○ → 札 → 図 が立ち上がる。
//       電気は雷が点滅、ポンプは羽根が回り、人はまばたきと体ゆれ。
const Kb6fDenkiPumpTenken: React.FC<{ f: number }> = ({ f }) => {
  const CX = [360, 960, 1560];
  const ap = (i: number) => seg(f, 2 + i * 7, 18 + i * 7);
  const spark = Math.floor(f / 4) % 2 === 0 ? 1 : 0.3;
  return (
    <Frame f={f} seed={908} bg={KRP.cream}>
      <GridPaper />
      {/* 仕切り */}
      <g stroke={KRP.ink} strokeWidth={6} strokeDasharray="20 16" opacity={0.5}>
        <line x1={660} y1={110} x2={660} y2={812} />
        <line x1={1260} y1={110} x2={1260} y2={812} />
      </g>
      {/* 図を据える台 */}
      {CX.map((cx, i) => (
        <rect key={cx} x={cx - 230} y={752} width={460} height={26} rx={6}
          fill={BP.slabDark} stroke={KRP.ink} strokeWidth={7} opacity={clamp01(ap(i) * 2)} />
      ))}
      {/* ===== ○ ===== */}
      {CX.map((cx, i) => <Maru key={cx} x={cx} y={198} s={0.92} t={ap(i)} />)}

      {/* ===== 1: 電気 (電柱と雷) ===== */}
      <g opacity={clamp01(ap(0) * 2)}>
        <rect x={344} y={462} width={34} height={292} fill={BP.wood}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={214} y={474} width={294} height={24} rx={5} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={6} />
        {[250, 470].map((ix) => (
          <g key={ix}>
            <rect x={ix - 13} y={444} width={26} height={32} rx={5} fill={BP.glass}
              stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={ix} cy={444} rx={20} ry={8} fill={BP.chalk}
              stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <g stroke={KRP.ink} strokeWidth={7} fill="none">
          <path d="M 120 418 Q 186 462 250 440" />
          <path d="M 470 440 Q 536 462 602 418" />
        </g>
        {/* 変圧器 */}
        <rect x={386} y={520} width={76} height={110} rx={10} fill={BP.steel}
          stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={400} y1={540} x2={448} y2={540} n={3} r={6} fill={BP.steelDark} />
        {/* 雷 */}
        <g opacity={spark}>
          <Bolt x={280} y={556} s={2.6} />
        </g>
        <TagPlate x={360} y={796} text="電線と電気" size={32} t={seg(f, 16, 30)} />
      </g>

      {/* ===== 2: ポンプ ===== */}
      <g opacity={clamp01(ap(1) * 2)}>
        <Pump x={1010} y={748} s={0.56} f={f} t={ap(1)} />
        <TagPlate x={960} y={796} text="水を上げる" size={32} t={seg(f, 22, 36)} />
      </g>

      {/* ===== 3: 点検する人 ===== */}
      <g opacity={clamp01(ap(2) * 2)}>
        <Person x={1512} y={752} s={0.94} f={f} cloth={KPP.kuuki} clothDark={KPP.kuukiDark}
          helmet face="normal" gaze={[0.3, 0.1]} />
        {/* 点検板 */}
        <rect x={1588} y={560} width={88} height={118} rx={7} fill={BP.paper}
          stroke={KRP.ink} strokeWidth={6} transform="rotate(9 1632 620)" />
        <g stroke={KRP.grayDark} strokeWidth={4} opacity={0.7} transform="rotate(9 1632 620)">
          {[590, 618, 646].map((y) => <line key={y} x1={1602} y1={y} x2={1662} y2={y} />)}
        </g>
        <TagPlate x={1560} y={796} text="毎日見に行く" size={32} t={seg(f, 28, 42)} />
      </g>

      {/* ===== 札 (3つ・大きく) ===== */}
      <TagPlate x={360} y={350} text="電気" size={66} t={ap(0)} color={KPP.akariDark} />
      <TagPlate x={960} y={350} text="ポンプ" size={66} t={ap(1)} color={KPP.mizuDark} />
      <TagPlate x={1560} y={350} text="点検する人" size={58} t={ap(2)} color={KPP.kuukiDark} />
    </Frame>
  );
};

// ===== #276 冒頭の巻き戻しは、遊びではありませんでした。 =====
// 格: 図
// どこ: クリーム地の方眼。序章の巻き戻しを2枚の小窓で再掲する。
// 演出: 左の窓に1850年の低い町、右の窓に5本柱の上のタワマン (いま)。
//       上の弧が右→左 (巻き戻し)、下の弧が左→右 (現在へ)。弧は画面の端まで大きく回す。
// 動き: f=4〜24 で上の弧が右から左へ引かれ、f=20〜40 で下の弧が左から右へ引かれる。
//       右の窓の装置はゆっくり揺れ続ける。
const Kb6fMakimodoshi: React.FC<{ f: number }> = ({ f }) => {
  const back = easeOut(clamp01(seg(f, 4, 24)));
  const fwd = easeOut(clamp01(seg(f, 20, 40)));
  const LD = 1760;
  const Panel: React.FC<{ x: number; y: number; w: number; h: number; t: number;
    children?: React.ReactNode }> = ({ x, y, w, h, t, children }) => (
    <g opacity={clamp01(t * 2)}>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={BP.paper}
        stroke={KRP.ink} strokeWidth={9} />
      <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx={6}
        fill="none" stroke={BP.shaftDark} strokeWidth={4} opacity={0.6} />
      {children}
    </g>
  );
  return (
    <Frame f={f} seed={909} bg={KRP.cream}>
      <GridPaper />

      {/* ===== 上の弧: 巻き戻し (右 → 左) ===== */}
      <g fill="none" strokeLinecap="round">
        <path d="M 1660 206 Q 960 36 260 206" stroke={KRP.ink} strokeWidth={30} opacity={0.9}
          strokeDasharray={`${LD * back} ${LD}`} />
        <path d="M 1660 206 Q 960 36 260 206" stroke={KRP.red} strokeWidth={20}
          strokeDasharray={`${LD * back} ${LD}`} />
      </g>
      <g transform={`translate(260 206) rotate(166)`} opacity={clamp01((back - 0.88) * 9)}>
        <polygon points="0,0 -70,-44 -70,44" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <text x={960} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={54} fill={KRP.red} stroke={KRP.white} strokeWidth={9} paintOrder="stroke"
        opacity={clamp01((back - 0.4) * 3)}>巻き戻し</text>

      {/* ===== 左の窓: 1850年の町 ===== */}
      <Panel x={200} y={262} w={660} h={370} t={seg(f, 2, 14)}>
        <rect x={214} y={548} width={632} height={70} fill={KPP.ground} opacity={0.7} />
        <line x1={214} y1={548} x2={846} y2={548} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => {
          const bx = 262 + i * 196;
          const bh = 150 + i * 16;
          return (
            <g key={i}>
              <rect x={bx} y={548 - bh} width={158} height={bh} fill={C.stone}
                stroke={KRP.ink} strokeWidth={6} />
              <polygon points={`${bx - 14},${548 - bh} ${bx + 79},${548 - bh - 52} ${bx + 172},${548 - bh}`}
                fill={C.amber} stroke={KRP.ink} strokeWidth={6} />
              {/* 煙突 */}
              <rect x={bx + 108} y={548 - bh - 66} width={30} height={52} fill={C.stoneDark}
                stroke={KRP.ink} strokeWidth={5} />
              {/* 蝋燭の窓 */}
              <rect x={bx + 34} y={548 - bh + 42} width={44} height={54} fill={C.candle}
                stroke={KRP.ink} strokeWidth={5} />
              <rect x={bx + 96} y={548 - bh + 42} width={44} height={54} fill={C.stoneDark}
                stroke={KRP.ink} strokeWidth={5} />
              <rect x={bx + 60} y={494} width={44} height={54} fill={BP.woodDark}
                stroke={KRP.ink} strokeWidth={5} />
            </g>
          );
        })}
      </Panel>

      {/* ===== 右の窓: いま (5本柱の上のタワマン) ===== */}
      <Panel x={1060} y={262} w={660} h={370} t={seg(f, 8, 22)}>
        <g transform="translate(948.4 230.8) scale(0.46)">
          <TowerOnPillars f={f} labels={false} ground={false} sky={false} />
        </g>
        <rect x={1074} y={610} width={632} height={14} fill={KPP.ground} opacity={0.85} />
        <line x1={1074} y1={610} x2={1706} y2={610} stroke={KRP.ink} strokeWidth={6} />
      </Panel>

      {/* ===== 下の弧: 現在へ (左 → 右) ===== */}
      <g fill="none" strokeLinecap="round">
        <path d="M 260 672 Q 960 806 1660 672" stroke={KRP.ink} strokeWidth={28} opacity={0.9}
          strokeDasharray={`${LD * fwd} ${LD}`} />
        <path d="M 260 672 Q 960 806 1660 672" stroke={KPP.mizuDark} strokeWidth={18}
          strokeDasharray={`${LD * fwd} ${LD}`} />
      </g>
      <g transform={`translate(1660 672) rotate(-28)`} opacity={clamp01((fwd - 0.88) * 9)}>
        <polygon points="0,0 -66,-42 -66,42" fill={KPP.mizuDark} stroke={KRP.ink} strokeWidth={6} />
      </g>

      {/* ===== 札 ===== */}
      <TagPlate x={530} y={716} text="1850年" size={46} t={seg(f, 12, 26)} />
      <TagPlate x={1390} y={716} text="いま" size={46} t={seg(f, 24, 38)} />
      <TagPlate x={960} y={790} text="現在へ" size={38} t={seg(f, 32, 42)} color={KPP.mizuDark} />
    </Frame>
  );
};

// ===== #277 ★停電した日に、あの部屋は本当に1850年に戻ります。 =====
// 格: 山
// どこ: 序章 (文#1・#17) と同じタワマンの一室。奥壁・右の窓・左の流し・中央の低いテーブル。
//       床は板張り。窓が右・人が中央より左、というならびは序章とそろえてある。
// 演出: この絵の主役は「暗い部屋に蝋燭が1本」。だから蝋燭はもとの2.2倍に寄せて
//       画面の高さの3分の1以上を取り、部屋のあかりはその光の輪ひとつだけにする。
//       電気の物 (ダウンライト・テレビ・エアコン・冷蔵庫・蛇口) は輪郭だけ薄く残し、
//       窓の外の夜景も消して、代わりに月が見えるようにする (街が消えて初めて月が出る)。
//       住人は蝋燭のほうへ身を乗り出し、手をかざす。床には蝋燭の長い影がのびる。
//       札は小さくして左上と右上の端へ逃がす (先に目に入るのは絵であって文字ではない)。
// 動き: f=8 で停電の一瞬のがくつき (カメラ)、f=8〜26 で電気の物と街の灯りが薄れ、
//       f=16〜40 で蝋燭の炎・火鉢の炭・水桶・影が出てくる。炎は毎フレームゆれる。
const Kb6fN1850NiModoru: React.FC<{ f: number }> = ({ f }) => {
  const out = easeOut(clamp01(seg(f, 8, 26)));      // 電気が消える
  const old = easeOut(clamp01(seg(f, 16, 40)));     // 1850年が立ち上がる
  const jolt = Math.max(0, 1 - Math.abs(f - 8) / 3) * 7;
  const z = 1 + 0.06 * easeOut(clamp01(seg(f, 0, 42)));
  const flame = Math.sin(f / 2.1) * 3.4 + Math.sin(f / 3.7) * 2.1;
  const flick = 0.84 + 0.16 * Math.sin(f / 3.1) + 0.06 * Math.sin(f / 1.7);
  const ember = 0.55 + 0.45 * Math.sin(f / 5.5);
  const FY = 742;                                   // 床の線
  const modern = 1 - out;
  const ghost = 0.44 + 0.56 * modern;               // 消えた電気の物の濃さ
  const CS = 2.2;                                   // 蝋燭の寄り (もとの2.2倍)
  const CX0 = 968, CY0 = 610;                       // 蝋燭の足もと = 寄りの基準
  const FLY = CY0 - CS * 136;                       // 炎のあたりの高さ
  return (
    <Frame f={f} seed={910} bg={KRP.cream}>
      <g transform={`${zoomAt(z, CX0, 470)} translate(${jolt * 0.4} ${jolt})`}>
        {/* ===== 部屋の箱 ===== */}
        <rect x={96} y={104} width={1728} height={FY - 104}
          fill={lerp(0, 1, old) > 0.5 ? C.dark : C.dark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={96} y={104} width={1728} height={FY - 104}
          fill={KRP.white} opacity={0.82 * modern + 0.1} />
        <rect x={96} y={104} width={1728} height={FY - 104}
          fill={C.candle} opacity={0.14 * old} />
        {/* 天井 */}
        <rect x={96} y={104} width={1728} height={74}
          fill={BP.slab} opacity={0.9} stroke={KRP.ink} strokeWidth={6} />
        {/* 床 (板張り) */}
        <rect x={60} y={FY} width={1800} height={H - FY}
          fill={KRP.floor} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={BP.woodDark} strokeWidth={4} opacity={0.5}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={60 + i * 225} y1={FY} x2={20 + i * 250} y2={H} />
          ))}
          <line x1={60} y1={FY + 54} x2={1860} y2={FY + 54} />
        </g>
        {/* 壁の巾木 */}
        <rect x={96} y={FY - 26} width={1728} height={26}
          fill={BP.woodDark} opacity={0.75} stroke={KRP.ink} strokeWidth={4} />

        {/* ===== 右の窓 (外の夜景が消える) ===== */}
        <rect x={1176} y={186} width={548} height={344} rx={6}
          fill={C.night} stroke={KRP.ink} strokeWidth={8} />
        {/* 夜景のビルの窓。停電は街ごとなので、外も一緒に消える */}
        <g>
          {Array.from({ length: 7 }, (_, b) => {
            const bx = 1196 + b * 76;
            const bh = 110 + rnd(b * 3 + 1) * 190;
            return (
              <g key={b}>
                <rect x={bx} y={530 - bh} width={58} height={bh}
                  fill={C.nightPale} stroke={KRP.ink} strokeWidth={3.5}
                  opacity={0.26 + 0.64 * modern} />
                {Array.from({ length: Math.floor(bh / 34) }, (_, r2) => (
                  Array.from({ length: 2 }, (_, c2) => {
                    const on = rnd(b * 17 + r2 * 5 + c2) > 0.35;
                    return (
                      <rect key={`${r2}-${c2}`} x={bx + 10 + c2 * 24} y={530 - bh + 12 + r2 * 34}
                        width={16} height={18}
                        fill={on ? C.candle : C.night}
                        opacity={on ? 0.04 + 0.86 * modern : 0.5} />
                    );
                  })
                ))}
              </g>
            );
          })}
        </g>
        {/* 街ごと落ちた外。窓はほぼ一枚の闇になる */}
        <rect x={1176} y={186} width={548} height={344} fill={C.night} opacity={0.74 * out} />
        {/* 月 (街の灯りが消えて、やっと見えるようになったもの) */}
        <g opacity={old}>
          <circle cx={1628} cy={256} r={118} fill={KRP.white} opacity={0.1 * old} />
          <circle cx={1628} cy={256} r={46} fill={BP.chalk} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1646} cy={242} r={12} fill={C.nightPale} opacity={0.45} />
          <circle cx={1610} cy={272} r={8} fill={C.nightPale} opacity={0.4} />
          <circle cx={1636} cy={278} r={5} fill={C.nightPale} opacity={0.4} />
          {/* 星 */}
          {[[1248, 232], [1330, 290], [1536, 212], [1700, 330], [1282, 404]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={3.5}
              fill={KRP.white} opacity={(0.4 + 0.5 * Math.sin((f + i * 13) / 6)) * old} />
          ))}
        </g>
        {/* 窓枠 */}
        <g stroke={KRP.ink} strokeWidth={7} fill="none">
          <rect x={1176} y={186} width={548} height={344} rx={6} />
          <line x1={1450} y1={186} x2={1450} y2={530} />
          <line x1={1176} y1={358} x2={1724} y2={358} />
        </g>
        <rect x={1162} y={530} width={576} height={22} rx={5}
          fill={BP.woodLight} stroke={KRP.ink} strokeWidth={5} />

        {/* ===== 天井のダウンライト (消える) ===== */}
        {[520, 960, 1400].map((lx, i) => (
          <g key={lx}>
            <circle cx={lx} cy={152} r={28} fill={modern > 0.4 ? BP.lamp : BP.chalk}
              stroke={KRP.ink} strokeWidth={5} />
            <circle cx={lx} cy={152} r={74} fill={BP.lampGlow}
              opacity={0.5 * modern * (i === 1 ? 1 : 0.8)} />
            <circle cx={lx} cy={152} r={124} fill={BP.lampGlow} opacity={0.22 * modern} />
          </g>
        ))}
        <XMark x={960} y={152} s={0.86} t={seg(f, 12, 26)} />

        {/* ===== エアコン (消える: 輪郭だけ残る) ===== */}
        <g opacity={ghost}>
          <rect x={1290} y={118} width={300} height={56} rx={10}
            fill={KRP.white} opacity={0.25 + 0.7 * modern}
            stroke={KRP.ink} strokeWidth={5} strokeDasharray={modern > 0.5 ? "none" : "16 12"} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.4 + 0.5 * modern}>
            <line x1={1310} y1={160} x2={1570} y2={160} />
          </g>
        </g>

        {/* ===== 左: 流しと蛇口 ===== */}
        {/* 台。1850年では混合栓の載ったカウンターではなく、ただの板の台に見える */}
        <rect x={150} y={596} width={392} height={28} rx={5}
          fill={BP.slab} stroke={KRP.ink} strokeWidth={6} />
        <rect x={154} y={600} width={384} height={20} rx={4} fill={BP.wood} opacity={0.88 * old} />
        <rect x={162} y={624} width={368} height={118}
          fill={BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={BP.woodDark} strokeWidth={4} opacity={0.6}>
          <line x1={346} y1={624} x2={346} y2={742} />
          <line x1={178} y1={690} x2={330} y2={690} />
        </g>
        {/* 蛇口 (水道が死ぬので、これも輪郭だけになって引く) */}
        <g opacity={0.18 + 0.82 * modern}>
          <rect x={286} y={494} width={20} height={104} fill={BP.steel}
            stroke={KRP.ink} strokeWidth={5} />
          <path d="M 296 500 Q 296 470 350 470 L 356 470 L 356 512"
            fill="none" stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
          <path d="M 296 500 Q 296 470 350 470 L 356 470 L 356 512"
            fill="none" stroke={BP.steelLight} strokeWidth={7} strokeLinecap="round" />
          <circle cx={266} cy={498} r={16} fill={BP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          {/* 出ていた水 */}
          <rect x={349} y={512} width={14} height={76} rx={7}
            fill={KPP.mizu} opacity={0.85 * modern} />
          <ellipse cx={356} cy={596} rx={34} ry={9} fill={KPP.mizu} opacity={0.6 * modern} />
        </g>
        {/* 冷蔵庫 (輪郭になる) */}
        <g opacity={ghost}>
          <rect x={602} y={398} width={176} height={344} rx={10}
            fill={KRP.white} opacity={0.2 + 0.72 * modern}
            stroke={KRP.ink} strokeWidth={6} strokeDasharray={modern > 0.5 ? "none" : "18 13"} />
          <line x1={602} y1={498} x2={778} y2={498} stroke={KRP.ink} strokeWidth={5}
            opacity={0.4 + 0.5 * modern} />
          <rect x={742} y={440} width={14} height={44} rx={6} fill={BP.steel}
            opacity={0.3 + 0.65 * modern} stroke={KRP.ink} strokeWidth={3.5} />
        </g>

        {/* ===== 中央: 低いテーブル ===== */}
        <rect x={836} y={606} width={322} height={24} rx={5}
          fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={858} y={630} width={22} height={112} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={1114} y={630} width={22} height={112} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 消えた平たい画面 (テレビ): 奥壁 */}
        <g opacity={ghost}>
          <rect x={846} y={262} width={420} height={236} rx={8}
            fill={modern > 0.5 ? C.dark : KRP.white}
            opacity={modern > 0.5 ? 0.85 : 0.14}
            stroke={KRP.ink} strokeWidth={6} strokeDasharray={modern > 0.5 ? "none" : "18 13"} />
          <rect x={866} y={282} width={380} height={196} fill={C.nightPale}
            opacity={0.8 * modern} />
          <rect x={1026} y={498} width={60} height={22} fill={BP.ironDark}
            opacity={0.3 + 0.6 * modern} stroke={KRP.ink} strokeWidth={4} />
        </g>

        {/* ===== 1850年の物 ===== */}
        {/* ★蝋燭。この絵の主役なので、もとの 2.2 倍に寄せて画面の高さの3分の1以上を取る。
            部屋のあかりはこの光の輪ひとつだけ (天井も窓の外も死んでいる) */}
        <g opacity={old}>
          {/* 光の輪。円を重ねると段がつくので、ひと続きのぼかしで落とす */}
          <defs>
            <radialGradient id="kb6fCandleGlow">
              <stop offset="0%" stopColor={KRP.white} stopOpacity={0.82} />
              <stop offset="11%" stopColor={C.candle} stopOpacity={0.66} />
              <stop offset="26%" stopColor={C.candle} stopOpacity={0.4} />
              <stop offset="50%" stopColor={C.candle} stopOpacity={0.19} />
              <stop offset="100%" stopColor={C.candle} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={CX0} cy={FLY + 26} r={560} fill="url(#kb6fCandleGlow)"
            opacity={old * flick} />
          {/* 蝋燭そのもの (もとの筆づかいのまま、足もとを軸に寄る) */}
          <g transform={`translate(${CX0} ${CY0}) scale(${CS}) translate(${-CX0} ${-CY0})`}>
            {/* 燭台 */}
            <ellipse cx={968} cy={602} rx={52} ry={14} fill={BP.brass}
              stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={968} cy={596} rx={52} ry={14} fill={BP.brassLight}
              stroke={KRP.ink} strokeWidth={5} />
            {/* 受け皿の縁の打ち出し */}
            <g stroke={BP.brassDark} strokeWidth={2.4} opacity={0.8}>
              {Array.from({ length: 7 }, (_, i) => (
                <line key={i} x1={930 + i * 13} y1={592} x2={930 + i * 13} y2={600} />
              ))}
            </g>
            <rect x={958} y={566} width={20} height={34} fill={BP.brassDark}
              stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={968} cy={566} rx={30} ry={9} fill={BP.brassLight}
              stroke={KRP.ink} strokeWidth={4} />
            {/* 蝋 (垂れた蝋まで描く) */}
            <rect x={952} y={492} width={32} height={76} rx={6} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={5} />
            <path d="M 952 500 q 16 12 32 0" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M 951 512 q -7 14 -1 24 q 7 -8 2 -24 Z" fill={BP.chalk}
              stroke={KRP.ink} strokeWidth={2} opacity={0.8} />
            <path d="M 984 522 q 7 12 1 21 q -7 -7 -2 -21 Z" fill={BP.chalk}
              stroke={KRP.ink} strokeWidth={2} opacity={0.8} />
            {/* 芯 */}
            <line x1={968} y1={496} x2={968} y2={486} stroke={KRP.ink} strokeWidth={3.5} />
            {/* 炎 */}
            <g transform={`translate(${flame * 0.5} 0)`}>
              <path d={`M 968 492 q ${18 + flame} -20 ${2 + flame * 0.3} -46 q -${20 - flame} 26 -2 46`}
                fill={C.candle} stroke={KRP.ink} strokeWidth={3.5} />
              <path d={`M 968 488 q 8 -12 1 -26 q -9 14 -1 26`} fill={KRP.white} opacity={0.9} />
            </g>
          </g>
        </g>
        {/* 水桶 (流しの前の床) */}
        <g opacity={old} transform={`translate(0 ${(1 - old) * 40})`}>
          <ellipse cx={300} cy={748} rx={92} ry={20} fill={BP.woodDark} opacity={0.4} />
          <path d="M 222 666 L 236 744 Q 300 760 364 744 L 378 666 Z"
            fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={300} cy={666} rx={78} ry={20} fill={BP.woodLight}
            stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={300} cy={670} rx={62} ry={14}
            fill={KPP.mizu} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={300 + Math.sin(f / 9) * 6} cy={670} rx={34} ry={7}
            fill={KPP.mizuDark} opacity={0.6} />
          {/* 箍 (たが) */}
          <g fill="none" stroke={BP.steelDark} strokeWidth={6}>
            <path d="M 229 700 Q 300 716 371 700" />
            <path d="M 234 730 Q 300 746 366 730" />
          </g>
          {/* 柄杓 */}
          <g>
            <rect x={352} y={592} width={14} height={86} rx={6} fill={BP.woodLight}
              stroke={KRP.ink} strokeWidth={4} transform="rotate(16 359 640)" />
            <ellipse cx={382} cy={584} rx={30} ry={16} fill={BP.wood}
              stroke={KRP.ink} strokeWidth={5} />
          </g>
        </g>
        {/* 火鉢 (右の床) */}
        <g opacity={old} transform={`translate(0 ${(1 - old) * 40})`}>
          <ellipse cx={1476} cy={752} rx={118} ry={22} fill={BP.woodDark} opacity={0.4} />
          <circle cx={1476} cy={700} r={130} fill={C.candle} opacity={0.16 * old * ember} />
          <path d="M 1376 652 L 1386 740 Q 1476 760 1566 740 L 1576 652 Z"
            fill={C.amber} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={1476} cy={652} rx={100} ry={26} fill={BP.woodLight}
            stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={1476} cy={656} rx={82} ry={19} fill={BP.chalk}
            stroke={KRP.ink} strokeWidth={4} />
          {/* 炭 */}
          {[-48, -16, 16, 48, -32, 32].map((dx, i) => (
            <ellipse key={i} cx={1476 + dx} cy={654 + (i > 3 ? -8 : 0)}
              rx={20} ry={11}
              fill={i % 2 === 0 ? BP.ironDark : BP.spark}
              opacity={i % 2 === 0 ? 0.95 : 0.55 + 0.45 * ember}
              stroke={KRP.ink} strokeWidth={3} />
          ))}
          {/* 立ちのぼる熱 */}
          <g stroke={BP.spark} strokeWidth={4} fill="none" opacity={0.5 * old}>
            <path d={`M 1442 630 q ${8 + flame} -26 -4 -50`} />
            <path d={`M 1500 626 q ${-8 + flame} -28 6 -54`} />
          </g>
          {/* 五徳 */}
          <g stroke={KRP.ink} strokeWidth={6} fill="none">
            <path d="M 1414 648 L 1414 614 L 1538 614 L 1538 648" />
          </g>
        </g>

        {/* ===== 住人 1人 (蝋燭のほうへ寄って、手をかざす) ===== */}
        {/* 蝋燭1本だけが光源なので、人の影は反対側の床へ長くのびる */}
        <g opacity={0.5 * old}>
          <path d="M 574 842 Q 400 856 186 892 Q 250 920 414 906 Q 540 894 604 874 Z"
            fill={KRP.ink} />
          <ellipse cx={192} cy={892} rx={58} ry={26} fill={KRP.ink} />
          <ellipse cx={624} cy={850} rx={108} ry={27} fill={KRP.ink} />
        </g>
        <Person x={624} y={848} s={1.5} f={f} cloth={C.nightPale} clothDark={C.night}
          face="surprised" gaze={[0.5, 0.12]} lean={3} />
        {/* かざした手 (炎のほうへ伸ばす。袖→手首→手のひら) */}
        <g opacity={old}>
          <path d="M 706 626 Q 782 588 840 522" fill="none"
            stroke={KRP.ink} strokeWidth={46} strokeLinecap="round" />
          <path d="M 706 626 Q 782 588 840 522" fill="none"
            stroke={C.nightPale} strokeWidth={34} strokeLinecap="round" />
          {/* 袖口 */}
          <ellipse cx={814} cy={550} rx={17} ry={22} fill={C.night}
            stroke={KRP.ink} strokeWidth={4} transform="rotate(-42 814 550)" />
          {/* 手のひら (指をそろえて炎のほうへ向ける) */}
          <g transform="rotate(-30 858 504)">
            <path d="M 826 496 q -22 3 -20 24 q 15 12 25 -8 Z" fill={KRP.white}
              stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            <rect x={826} y={464} width={64} height={76} rx={26} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={5} />
            <g stroke={KRP.ink} strokeWidth={3.4} strokeLinecap="round" opacity={0.6}>
              <line x1={843} y1={470} x2={843} y2={500} />
              <line x1={859} y1={468} x2={859} y2={500} />
              <line x1={875} y1={470} x2={875} y2={500} />
            </g>
            {/* 炎のあかりが手のひらに乗る */}
            <rect x={830} y={468} width={56} height={68} rx={24} fill={C.candle}
              opacity={0.42 * flick} />
          </g>
        </g>
      </g>

      {/* 部屋ぜんぶに回る蝋燭のあかり (人も家具もこの一本で照らされている) */}
      <circle cx={CX0} cy={FLY + 90} r={900} fill="url(#kb6fCandleGlow)"
        opacity={0.26 * old * flick} />

      {/* ===== 札 (小さくして左上と右上の端へ逃がす。先に目に入るのは蝋燭) ===== */}
      <TagPlate x={166} y={152} text="停電" size={40} t={seg(f, 6, 18)}
        color={KRP.red} fill={KRP.white} />
      <TagPlate x={186} y={244} text="1850年" size={44} t={seg(f, 22, 38)} />
      <TagPlate x={1702} y={152} text="同じ部屋" size={34} t={seg(f, 16, 32)} />
      <TagPlate x={1222} y={596} text="蝋燭" size={36} t={seg(f, 26, 40)} />
      <TagPlate x={300} y={772} text="水桶" size={34} t={seg(f, 28, 42)} />
      <TagPlate x={1476} y={772} text="火鉢" size={34} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ===== #278 便利さとは、代金が消えることではありません。 =====
// 格: 図
// どこ: クリーム地の方眼。札立ての台に「消えた」の札が1枚だけ立っている。
// 演出: 上の段に「代金」の札と金貨7枚を台に並べ、そこから下の「消えた」へ矢印を下ろす。
//       「消えた」の札を画面の横 1/4 を占める大きさに取り、赤い× を2本の筆で大きく書く。
// 動き: f=0〜16 で金貨が並び、f=10〜24 で矢印が下り、f=18〜38 で×の2本が順に引かれる。
const Kb6fKieruKotoDeNai: React.FC<{ f: number }> = ({ f }) => {
  const x1 = easeOut(clamp01(seg(f, 18, 30)));
  const x2 = easeOut(clamp01(seg(f, 26, 38)));
  const shake = x2 > 0 && x2 < 1 ? Math.sin(f * 2.1) * 3 : 0;
  return (
    <Frame f={f} seed={911} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 上の段: 代金はちゃんとある ===== */}
      <rect x={560} y={296} width={800} height={28} rx={6}
        fill={BP.slabDark} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={600} y1={310} x2={1320} y2={310} n={9} r={7} fill={BP.ironDark} />
      {Array.from({ length: 7 }, (_, i) => {
        const t = clamp01(seg(f, i * 2, i * 2 + 10));
        if (t <= 0) return null;
        return (
          <g key={i} opacity={t}>
            <Coin x={620 + i * 120} y={268} r={44 * pop(t)} f={f} seed={i * 3}
              rot={(rnd(i * 9) - 0.5) * 26} />
          </g>
        );
      })}
      {/* ===== 下の段: 「消えた」の札立て ===== */}
      <rect x={600} y={720} width={720} height={34} rx={7}
        fill={BP.slabDark} stroke={KRP.ink} strokeWidth={8} />
      <g transform={`translate(${shake} 0)`}>
        <rect x={930} y={618} width={60} height={110} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={6} />
        <TagPlate x={960} y={520} text="消えた" size={148} t={seg(f, 8, 22)} />
      </g>
      {/* 矢印: 代金 → 消えた */}
      <ForceArrow x={960} y={338} len={110} rot={90} w={24} color={KRP.grayDark}
        t={seg(f, 10, 24)} />
      {/* ===== 赤い× (2本の筆で大きく) ===== */}
      <g stroke={KRP.red} strokeWidth={34} strokeLinecap="round" opacity={0.95}>
        <line x1={656} y1={372} x2={656 + 608 * x1} y2={372 + 300 * x1} />
        <line x1={1264} y1={372} x2={1264 - 608 * x2} y2={372 + 300 * x2} />
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={960} y={176} text="代金" size={64} t={seg(f, 2, 14)} fill={C.gold} />
      <TagPlate x={248} y={520} text="便利さ" size={46} t={seg(f, 4, 18)} />
      <ForceArrow x={350} y={520} len={240} rot={0} w={20} color={KRP.grayDark}
        t={seg(f, 12, 26)} />
      <TagPlate x={1684} y={520} text="ちがう" size={44} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #279 誰かが払い続けて、見えなくなることでした。 =====
// 格: 図
// どこ: 床を1本の線で切った断面図。線の上は何もない明るい部屋、線の下が機械の床下。
// 演出: 上に「見えなくなった」の札と○。下は床スラブの断面 (鉄筋・ハッチ) を切って、
//       代金の計・歯車・配管・電線管が回り続けている。画面の下 2/3 を床下に使う。
// 動き: 秒針が5フレームごとに1つ刻み、歯車は連続で回る。
//       f=16〜42 で金貨が配管の上を右へ流れていく (払われ続けている)。
const Kb6fHaraiTsuzukete: React.FC<{ f: number }> = ({ f }) => {
  const SY = 316;                                  // 床スラブの上端
  const SH = 56;
  const flow = clamp01(seg(f, 16, 42));
  return (
    <Frame f={f} seed={912} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 床の上 (何も見えない) ===== */}
      <Maru x={672} y={186} s={0.94} t={seg(f, 8, 22)} />

      {/* ===== 床スラブの断面 ===== */}
      <rect x={-20} y={SY} width={W + 40} height={SH} fill={BP.slab}
        stroke={KRP.ink} strokeWidth={8} />
      <g stroke={BP.slabDark} strokeWidth={4} opacity={0.75}>
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={-20 + i * 82} y1={SY + SH} x2={20 + i * 82} y2={SY} />
        ))}
      </g>
      {/* 鉄筋 */}
      <g>
        {Array.from({ length: 19 }, (_, i) => (
          <circle key={i} cx={30 + i * 104} cy={SY + SH * 0.5} r={9}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
      </g>
      {/* ===== 床下 (暗い) ===== */}
      <rect x={-20} y={SY + SH} width={W + 40} height={H - SY - SH + 20}
        fill={C.dark} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-20} y={SY + SH} width={W + 40} height={H - SY - SH + 20}
        fill={KRP.white} opacity={0.08} />
      {/* 吊りボルトと梁 */}
      <g>
        {[220, 1500, 1760].map((x) => (
          <g key={x}>
            <rect x={x - 9} y={SY + SH} width={18} height={92} fill={BP.steelDark}
              stroke={KRP.ink} strokeWidth={4} />
            <HexBolt x={x} y={SY + SH + 92} r={13} />
          </g>
        ))}
      </g>
      {/* ===== 代金の計 (回り続けている) ===== */}
      <CostDial x={620} y={566} r={176} f={f} t={seg(f, 4, 18)} face={BP.chalk} />
      {/* ===== 大きな歯車列 ===== */}
      <Gear x={1216} y={534} r={118} teeth={18} rot={f * 2.1} />
      <Gear x={1392} y={606} r={78} teeth={13} rot={-f * 3.2} fill={BP.steelLight} />
      <line x1={1216} y1={534} x2={1392} y2={606} stroke={BP.steelDark} strokeWidth={12} />
      {/* ===== 配管の上を流れる金貨 ===== */}
      <rect x={840} y={744} width={1040} height={44} rx={8}
        fill={KPP.mizuDark} stroke={KRP.ink} strokeWidth={6} />
      <g>
        {Array.from({ length: 5 }, (_, i) => {
          const p = ((f / 34) + i * 0.2) % 1;
          return (
            <g key={i} opacity={flow}>
              <Coin x={860 + p * 1000} y={722} r={25} f={f} seed={i} />
            </g>
          );
        })}
      </g>
      {/* 電線管 */}
      <rect x={-20} y={672} width={440} height={30} rx={6}
        fill={KPP.akari} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.ink} strokeWidth={5}>
        {[60, 220, 380].map((x) => (
          <rect key={x} x={x - 12} y={660} width={24} height={20} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={5} />
        ))}
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={1030} y={186} text="見えなくなった" size={66} t={seg(f, 2, 16)} />
      <TagPlate x={196} y={428} text="床の下" size={40} t={seg(f, 10, 24)} fill={KRP.white} />
      <TagPlate x={620} y={786} text="代金の計" size={40} t={seg(f, 18, 32)} fill={KRP.white} />
      <TagPlate x={1312} y={786} text="動き続ける" size={38} t={seg(f, 26, 40)}
        color={KRP.red} fill={KRP.white} />
    </Frame>
  );
};

// ===== #280 明日、あなたがあの箱に乗る数十秒。 =====
// 格: 並
// どこ: エレベーターのかごの中。奥壁を正面に見る。左右は壁、下は床、上は天井の照明。
// 演出: 描くのは「上がっていくかごの中」1つ。人は乗っている1人だけ。
//       背景は奥壁の真鍮パネル・手すり・床の目地・天井照明の4要素だけ。
// 動き: 階数表示が5フレームごとに1つ上がる。かご全体がごく小さく上下にゆれる。
//       上向きの矢印灯が点滅し、床の目地が静かに動かない (静けさを出す)。
const Kb6fAnoHakoNiNoru: React.FC<{ f: number }> = ({ f }) => {
  const floorNo = 12 + Math.floor(f / 5);
  const sway = Math.sin(f / 7.5) * 2.4;
  const up = Math.floor(f / 4) % 2 === 0 ? 1 : 0.3;
  const FY = 792;                                  // かごの床の線
  return (
    <Frame f={f} seed={913} bg={KRP.cream}>
      <g transform={`translate(0 ${sway})`}>
        {/* ===== 左右の壁 (遠近) ===== */}
        <polygon points={`120,70 448,196 448,${FY} 120,1060`}
          fill={BP.brassDark} stroke={KRP.ink} strokeWidth={8} />
        <polygon points={`1800,70 1472,196 1472,${FY} 1800,1060`}
          fill={BP.brassDark} stroke={KRP.ink} strokeWidth={8} />
        <polygon points={`120,70 448,196 448,${FY} 120,1060`}
          fill={KRP.white} opacity={0.14} />
        {/* 側壁の手すり */}
        <g>
          <path d={`M 150 640 L 448 594`} stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
          <path d={`M 150 640 L 448 594`} stroke={BP.brassLight} strokeWidth={11} strokeLinecap="round" />
          <path d={`M 1770 640 L 1472 594`} stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
          <path d={`M 1770 640 L 1472 594`} stroke={BP.brassLight} strokeWidth={11} strokeLinecap="round" />
        </g>
        {/* ===== 奥壁 ===== */}
        <rect x={448} y={196} width={1024} height={FY - 196}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={8} />
        {/* 真鍮パネルの目地 */}
        <g stroke={BP.brassDark} strokeWidth={5} opacity={0.8}>
          {[704, 960, 1216].map((x) => <line key={x} x1={x} y1={196} x2={x} y2={FY} />)}
          <line x1={448} y1={462} x2={1472} y2={462} />
        </g>
        <g fill={KRP.white} opacity={0.12}>
          {[448, 704, 960, 1216].map((x) => <rect key={x} x={x + 12} y={208} width={62} height={FY - 220} />)}
        </g>
        {/* 奥壁の手すり */}
        <rect x={470} y={586} width={980} height={18} rx={9}
          fill={BP.brassLight} stroke={KRP.ink} strokeWidth={6} />
        {[530, 960, 1390].map((x) => (
          <rect key={x} x={x - 11} y={604} width={22} height={34}
            fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 巾木 */}
        <rect x={448} y={FY - 30} width={1024} height={30}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />

        {/* ===== 天井と照明 ===== */}
        <polygon points={`120,70 448,196 1472,196 1800,70`}
          fill={BP.slab} stroke={KRP.ink} strokeWidth={8} />
        <rect x={660} y={104} width={600} height={70} rx={14}
          fill={BP.lamp} stroke={KRP.ink} strokeWidth={7} />
        <rect x={660} y={104} width={600} height={70} rx={14}
          fill={BP.lampGlow} opacity={0.6} />
        <ellipse cx={960} cy={250} rx={520} ry={130} fill={BP.lampGlow} opacity={0.3} />

        {/* ===== 床 (目地) ===== */}
        <polygon points={`448,${FY} 1472,${FY} 1800,1060 120,1060`}
          fill={BP.slabDark} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.45}>
          <line x1={448} y1={FY} x2={120} y2={1060} />
          <line x1={704} y1={FY} x2={540} y2={1060} />
          <line x1={960} y1={FY} x2={960} y2={1060} />
          <line x1={1216} y1={FY} x2={1380} y2={1060} />
          <line x1={1472} y1={FY} x2={1800} y2={1060} />
        </g>

        {/* ===== 階数表示 (奥壁の上) ===== */}
        <g>
          <rect x={790} y={246} width={340} height={150} rx={12}
            fill={BP.board} stroke={KRP.ink} strokeWidth={8} />
          <text x={960} y={356} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={104} fill={C.emerGreen}>{floorNo}</text>
          {/* 上向きの矢印灯 */}
          <polygon points="1182,320 1138,372 1226,372" fill={C.emerGreen}
            stroke={KRP.ink} strokeWidth={5} opacity={up} />
        </g>

        {/* ===== 操作盤 ===== */}
        <g>
          <rect x={1276} y={486} width={150} height={84} rx={8}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 2 }, (_, r2) => (
            Array.from({ length: 3 }, (_, c2) => (
              <circle key={`${r2}-${c2}`} cx={1306 + c2 * 45} cy={510 + r2 * 38} r={14}
                fill={r2 === 0 && c2 === 1 ? C.emerGreen : BP.chalk}
                stroke={KRP.ink} strokeWidth={4} />
            ))
          ))}
        </g>

        {/* ===== 乗っている人1人 ===== */}
        <Person x={820} y={850} s={1.1} f={f} cloth={C.nightPale} clothDark={C.night}
          face="normal" gaze={[0.05, -0.2]} />
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={250} y={192} text="かご" size={46} t={seg(f, 4, 18)} />
      <TagPlate x={1700} y={192} text="階数" size={44} t={seg(f, 14, 28)} />
      <TagPlate x={1700} y={520} text="手すり" size={36} t={seg(f, 22, 36)} />
      <TagPlate x={262} y={700} text="数十秒" size={42} t={seg(f, 28, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #281 床の下は、何十メートルも空っぽです。 =====
// 格: 図
// どこ: 縦穴の断面図。かごは画面の上端に小さく、その下はぜんぶ空っぽの縦穴。
// 演出: 穴の壁・案内レール2本・深さの目盛り (10m刻み) を描き、中身は何も置かない。
//       空白そのものが主役なので、穴を画面の横半分・縦ぜんぶに大きく取る。
// 動き: 深さの数字が上から順に出る (f=6〜40)。塵が落ちていく。
//       かごはワイヤで吊られたままわずかに上下する。
const Kb6fYukaNoShita: React.FC<{ f: number }> = ({ f }) => {
  const SX1 = 520, SX2 = 1360;                     // 穴の内法
  const CT = 132, CB = 286;                        // かごの上端・下端
  const bob = Math.sin(f / 9) * 4;
  const DEPTHS = [0, 10, 20, 30, 40, 50];
  const dy = (i: number) => 300 + i * 104;
  return (
    <Frame f={f} seed={914} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 穴の壁 (断面ハッチ) ===== */}
      <rect x={300} y={60} width={SX1 - 300} height={H - 60} fill={BP.shaft}
        stroke={KRP.ink} strokeWidth={8} />
      <rect x={SX2} y={60} width={260} height={H - 60} fill={BP.shaft}
        stroke={KRP.ink} strokeWidth={8} />
      <g stroke={BP.shaftDark} strokeWidth={4} opacity={0.7}>
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i}>
            <line x1={300} y1={120 + i * 80} x2={SX1} y2={60 + i * 80} />
            <line x1={SX2} y1={120 + i * 80} x2={SX2 + 260} y2={60 + i * 80} />
          </g>
        ))}
      </g>
      {/* ===== 縦穴の中 (空っぽ・下へ暗くなる) ===== */}
      <rect x={SX1} y={60} width={SX2 - SX1} height={H - 60} fill={BP.shaftDeep} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={SX1} y={240 + i * 210} width={SX2 - SX1} height={H} fill={KRP.ink}
          opacity={0.14} />
      ))}
      <rect x={SX1} y={60} width={SX2 - SX1} height={H - 60} fill="none"
        stroke={KRP.ink} strokeWidth={8} />
      {/* ===== 案内レール2本 ===== */}
      <GuideRail x={SX1 + 54} y1={CB} y2={H} w={30} splice={214} />
      <GuideRail x={SX2 - 54} y1={CB} y2={H} w={30} splice={214} />
      {/* ===== 落ちていく塵 ===== */}
      <g fill={KRP.white}>
        {Array.from({ length: 16 }, (_, i) => {
          const p = ((f / 46) + rnd(i * 13 + 1)) % 1;
          return (
            <circle key={i} cx={SX1 + 70 + rnd(i * 5 + 2) * (SX2 - SX1 - 140)}
              cy={CB + p * (H - CB)} r={3 + rnd(i * 3) * 4}
              opacity={0.5 * (1 - p)} />
          );
        })}
      </g>
      {/* ===== かご (上端に小さく) ===== */}
      <g transform={`translate(0 ${bob})`}>
        {/* 吊りワイヤ */}
        <Rope x1={935} y1={-20} x2={935} y2={CT} w={14} kind="wire" f={f} />
        <Rope x1={985} y1={-20} x2={985} y2={CT} w={14} kind="wire" f={f} />
        <rect x={875} y={CT - 22} width={170} height={26} rx={5}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        {/* かご本体 (縦穴の内法いっぱい) */}
        <rect x={576} y={CT} width={768} height={CB - CT} rx={6}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={8} />
        <rect x={602} y={CT + 22} width={716} height={CB - CT - 56} rx={4}
          fill={BP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={BP.brassLight} strokeWidth={5} opacity={0.8}>
          <line x1={960} y1={CT + 22} x2={960} y2={CB - 34} />
        </g>
        <Rivets x1={592} y1={CB - 16} x2={1328} y2={CB - 16} n={13} r={7} fill={BP.ironDark} />
        {/* 案内靴 (レールに噛んでいる) */}
        <rect x={SX1 + 32} y={CT + 40} width={44} height={70} rx={5}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={SX2 - 76} y={CT + 40} width={44} height={70} rx={5}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* ===== 深さの目盛り ===== */}
      <g>
        <line x1={1680} y1={300} x2={1680} y2={H} stroke={KRP.ink} strokeWidth={9} />
        {DEPTHS.map((d, i) => {
          const t = clamp01(seg(f, 6 + i * 5, 18 + i * 5));
          return (
            <g key={d} opacity={t}>
              <line x1={1646} y1={dy(i)} x2={1714} y2={dy(i)}
                stroke={KRP.ink} strokeWidth={i % 2 === 0 ? 8 : 5} />
              <text x={1736} y={dy(i) + 14} fontFamily={FONT} fontWeight={800}
                fontSize={40} fill={KRP.ink}>{d}m</text>
            </g>
          );
        })}
        {/* 小目盛り (1mごと) */}
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
          {Array.from({ length: 52 }, (_, i) => (
            <line key={i} x1={1664} y1={300 + i * 10.4} x2={1696} y2={300 + i * 10.4} />
          ))}
        </g>
        {/* 穴の底までの引き出し線 */}
        <line x1={SX2} y1={300} x2={1646} y2={300} stroke={KRP.ink} strokeWidth={5}
          strokeDasharray="16 12" opacity={0.7} />
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={960} y={566} text="空っぽ" size={122} t={seg(f, 14, 30)} />
      <TagPlate x={400} y={190} text="かご" size={40} t={seg(f, 2, 14)} />
      <TagPlate x={398} y={700} text="縦穴" size={40} t={seg(f, 20, 34)} fill={KRP.white} />
      <TagPlate x={1680} y={196} text="深さ" size={44} t={seg(f, 8, 22)} />
    </Frame>
  );
};

// ===== #282 ★それを怖がらずにいられるのは、誰かのおかげです。 =====
// 格: 山
// どこ: 朝のタワマンを縦に切った断面。上半分が地上の塔 (エレベーターのかごの中に人1人)、
//       真ん中に街のスラブ、下半分が地下の機械室 (5本柱・ポンプ・点検する人)。
// 演出: 払う側 (地下) と、払われている側 (かごの中の人) を1枚の絵の上下に同時に入れる。
//       明け方の光を塔の後ろに置き、窓が1つずつ灯って静かに明るく終わる。
//       かごの人と地下のポンプを1本の立管でつなぎ、支えが届いていることを見せる。
// 動き: f=0〜42 で後光がひろがり窓が順に灯る。かごは静かに上がる。ポンプの羽根は回り続け、
//       点検の人は計器のほうを見てゆれる。柱は左から順に光が通る (f=6〜42)。
// 絵: ★結び。かごの中の人と、それを支える5本柱・回るポンプ・点検する人が同じ画面に収まる。静かに明るく終わる
const Kb6fDarekaNoOkage: React.FC<{ f: number }> = ({ f }) => {
  const glow = easeOut(clamp01(seg(f, 0, 42)));
  const lit = clamp01(seg(f, 4, 40));
  const rise = easeOut(clamp01(seg(f, 6, 42))) * 26;
  const z = 1 + 0.025 * easeOut(clamp01(seg(f, 0, 42)));
  const SLAB = 470, BASE = 820;                        // スラブ上端・地下の床
  const PX = [380, 670, 960, 1250, 1540];
  const PC = [KPP.hone, KPP.hako, KPP.mizu, KPP.akari, KPP.kuuki];
  const PD = [KPP.honeDark, KPP.hakoDark, KPP.mizuDark, KPP.akariDark, KPP.kuukiDark];
  const PL = ["骨", "箱", "水", "灯り", "空気"];
  const CT = 212 - rise, CB = 430 - rise;              // かごの上端・下端
  return (
    <Frame f={f} seed={915} bg={KRP.cream}>
      <g transform={zoomAt(z, 960, 440)}>
        {/* ===== 明け方の空と後光 ===== */}
        <rect x={0} y={0} width={W} height={SLAB} fill={KPP.sky} opacity={0.75} />
        <circle cx={960} cy={300} r={240 + 300 * glow} fill={C.candle} opacity={0.17} />
        <circle cx={960} cy={300} r={140 + 170 * glow} fill={C.candle} opacity={0.2} />
        <circle cx={960} cy={300} r={70 + 70 * glow} fill={KRP.white} opacity={0.4} />

        {/* ===== 隣の低い建物 (左右) ===== */}
        {[[96, 330], [240, 372], [1660, 348], [1796, 388]].map(([bx, by], i) => (
          <g key={i}>
            <rect x={bx} y={by} width={130} height={SLAB - by}
              fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={7} />
            {Array.from({ length: Math.floor((SLAB - by) / 46) }, (_, r2) => (
              <rect key={r2} x={bx + 20} y={by + 22 + r2 * 46} width={90} height={28}
                fill={rnd(i * 7 + r2) > 0.45 ? C.candle : KPP.glass}
                opacity={0.4 + 0.6 * lit} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
          </g>
        ))}

        {/* ===== 塔 (断面) ===== */}
        <rect x={560} y={96} width={800} height={SLAB - 96}
          fill={KPP.towerFace} stroke={KRP.ink} strokeWidth={8} />
        {/* 各階の床スラブ */}
        <g>
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={560} y={122 + i * 50} width={800} height={12}
              fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          ))}
        </g>
        {/* 住戸の窓 (順に灯る) */}
        <g>
          {Array.from({ length: 7 }, (_, r2) => (
            [0, 1, 4, 5].map((c2) => {
              const t = clamp01(lit * 2 - (r2 * 4 + c2) / 30);
              return (
                <rect key={`${r2}-${c2}`} x={588 + c2 * 132} y={142 + r2 * 50}
                  width={104} height={30}
                  fill={t > 0.1 ? C.candle : KPP.glass} opacity={0.35 + 0.65 * t}
                  stroke={KRP.ink} strokeWidth={4} />
              );
            })
          ))}
        </g>
        {/* ===== エレベーターの縦穴とかご ===== */}
        <rect x={848} y={110} width={224} height={SLAB - 110}
          fill={BP.shaftDeep} stroke={KRP.ink} strokeWidth={7} />
        <GuideRail x={866} y1={116} y2={SLAB - 6} w={20} splice={160} opacity={0.9} />
        <GuideRail x={1054} y1={116} y2={SLAB - 6} w={20} splice={160} opacity={0.9} />
        <Rope x1={936} y1={110} x2={936} y2={CT} w={12} kind="wire" f={f} />
        <Rope x1={984} y1={110} x2={984} y2={CT} w={12} kind="wire" f={f} />
        {/* かご */}
        <g>
          <rect x={886} y={CT - 18} width={148} height={22} rx={5}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={856} y={CT} width={208} height={CB - CT} rx={5}
            fill={BP.brass} stroke={KRP.ink} strokeWidth={7} />
          <rect x={872} y={CT + 16} width={176} height={CB - CT - 32} rx={4}
            fill={BP.lampGlow} stroke={KRP.ink} strokeWidth={4} />
          {/* 天井灯 */}
          <rect x={900} y={CT + 24} width={120} height={14} rx={6}
            fill={BP.lamp} stroke={KRP.ink} strokeWidth={4} />
          {/* 乗っている人 */}
          <Person x={960} y={CB - 22} s={0.6} f={f} cloth={C.nightPale} clothDark={C.night}
            face="smile" gaze={[0, -0.1]} />
          <Rivets x1={868} y1={CB - 12} x2={1052} y2={CB - 12} n={7} r={6} fill={BP.ironDark} />
        </g>

        {/* ===== 街のスラブ ===== */}
        <rect x={-20} y={SLAB} width={W + 40} height={44}
          fill={BP.slab} stroke={KRP.ink} strokeWidth={8} />
        <Rivets x1={40} y1={SLAB + 22} x2={1880} y2={SLAB + 22} n={16} r={8} fill={BP.slabDark} />

        {/* ===== 地下 (機械室) ===== */}
        <rect x={-20} y={SLAB + 44} width={W + 40} height={H - SLAB - 44}
          fill={C.dark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-20} y={SLAB + 44} width={W + 40} height={H - SLAB - 44}
          fill={KRP.white} opacity={0.09} />
        {/* 地下の床 (地面) */}
        <rect x={-20} y={BASE} width={W + 40} height={H - BASE + 20}
          fill={KPP.ground} stroke={KRP.ink} strokeWidth={8} />
        {/* ===== 5本柱 ===== */}
        {PX.map((px, i) => {
          const sweep = clamp01(seg(f, 6 + i * 6, 20 + i * 6));
          return (
            <g key={px}>
              <rect x={px - 62} y={SLAB + 40} width={124} height={BASE - SLAB - 40}
                fill={PC[i]} stroke={KRP.ink} strokeWidth={7} />
              <rect x={px - 62} y={SLAB + 40} width={30} height={BASE - SLAB - 40}
                fill={KRP.white} opacity={0.2 + 0.4 * sweep} />
              <rect x={px + 36} y={SLAB + 40} width={26} height={BASE - SLAB - 40}
                fill={PD[i]} opacity={0.55} />
              <Rivets x1={px} y1={SLAB + 86} x2={px} y2={BASE - 46} n={4} r={7} fill={PD[i]} />
              {/* 柱の座 */}
              <rect x={px - 92} y={BASE - 28} width={184} height={32} rx={5}
                fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
              <HexBolt x={px - 66} y={BASE - 12} r={8} />
              <HexBolt x={px + 66} y={BASE - 12} r={8} />
            </g>
          );
        })}
        {/* ===== ポンプ (回り続けている) ===== */}
        <Pump x={178} y={BASE - 6} s={0.62} f={f} t={seg(f, 2, 14)} />
        {/* ポンプ → 塔 の立管 (支えが上まで届いている) */}
        <g>
          {/* ポンプの吐出 → 横引き管 のつなぎ */}
          <rect x={114} y={632} width={50} height={54} fill={KPP.mizu}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={96} y={600} width={708} height={40} rx={6} fill={KPP.mizu}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={764} y={SLAB + 34} width={40} height={606 - SLAB - 34} fill={KPP.mizu}
            stroke={KRP.ink} strokeWidth={6} />
          <HexBolt x={784} y={640} r={9} />
          <ForceArrow x={784} y={592} len={96} rot={-90} w={18} color={KPP.mizuDark}
            t={seg(f, 18, 34)} />
        </g>
        {/* ===== 点検する人 ===== */}
        <Person x={1392} y={BASE - 30} s={0.54} f={f} cloth={KPP.kuuki} clothDark={KPP.kuukiDark}
          helmet face="normal" gaze={[-0.5, 0]} lean={-2} />
        {/* 手の点検灯 */}
        <g>
          <rect x={1330} y={690} width={26} height={44} rx={5} fill={BP.steelDark}
            stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1343} cy={684} r={17} fill={BP.lamp} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1343} cy={684} r={46} fill={BP.lampGlow} opacity={0.35 * glow} />
        </g>
      </g>
      {/* ===== 札 ===== */}
      <TagPlate x={1498} y={252} text="あなた" size={42} t={seg(f, 10, 24)} />
      <Arrow x={1180} y={252} s={0.9} rot={180} t={seg(f, 16, 28)} color={KRP.grayDark} />
      {PX.map((px, i) => (
        <TagPlate key={px} x={px} y={548} text={PL[i]} size={34}
          t={seg(f, 8 + i * 5, 22 + i * 5)} />
      ))}
      <TagPlate x={178} y={548} text="ポンプ" size={34} t={seg(f, 4, 18)} color={KPP.mizuDark} />
      <TagPlate x={1392} y={596} text="点検" size={34} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb6_yoku_ga_jimen: (f) => <Kb6fYokuGaJimen f={f} />,
  kb6_ugokashi_tsuzukeru: (f) => <Kb6fUgokashiTsuzukeru f={f} />,
  kb6_maibyou_harawareru: (f) => <Kb6fMaibyouHarawareru f={f} />,
  kb6_denki_pump_tenken: (f) => <Kb6fDenkiPumpTenken f={f} />,
  kb6_makimodoshi: (f) => <Kb6fMakimodoshi f={f} />,
  kb6_1850_ni_modoru: (f) => <Kb6fN1850NiModoru f={f} />,
  kb6_kieru_koto_de_nai: (f) => <Kb6fKieruKotoDeNai f={f} />,
  kb6_harai_tsuzukete: (f) => <Kb6fHaraiTsuzukete f={f} />,
  kb6_ano_hako_ni_noru: (f) => <Kb6fAnoHakoNiNoru f={f} />,
  kb6_yuka_no_shita: (f) => <Kb6fYukaNoShita f={f} />,
  kb6_dareka_no_okage: (f) => <Kb6fDarekaNoOkage f={f} />,
};

export const K_B6F_MOTIFS: string[] = [
  "kb6_yoku_ga_jimen",       // #272 そして、欲が地面になりました。
  "kb6_ugokashi_tsuzukeru",  // #273 そして揃ったあとも、動かし続けなければなりません。
  "kb6_maibyou_harawareru",  // #274 高さの代金は、いまも毎秒払われています。
  "kb6_denki_pump_tenken",   // #275 払っているのは、電気と、ポンプと、点検する人です。
  "kb6_makimodoshi",         // #276 冒頭の巻き戻しは、遊びではありませんでした。
  "kb6_1850_ni_modoru",      // #277 ★停電した日に、あの部屋は本当に1850年に戻ります。
  "kb6_kieru_koto_de_nai",   // #278 便利さとは、代金が消えることではありません。
  "kb6_harai_tsuzukete",     // #279 誰かが払い続けて、見えなくなることでした。
  "kb6_ano_hako_ni_noru",    // #280 明日、あなたがあの箱に乗る数十秒。
  "kb6_yuka_no_shita",       // #281 床の下は、何十メートルも空っぽです。
  "kb6_dareka_no_okage",     // #282 ★それを怖がらずにいられるのは、誰かのおかげです。
];

export const kosoB6fScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
