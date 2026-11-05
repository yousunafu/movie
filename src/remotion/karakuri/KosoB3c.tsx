// 「なぜ高層ビルは生まれたのか」: 第3章「水は、勝手に上がらない。」後半 (管の空気〜いまの給水)
// 担当範囲: 台本 docs/koso-script-v7.txt の 136〜147行目 (文#135〜#146・12文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は必ず kb3_ で始める。WobbleDefs の seed はこのファイルでは 722〜733 を使う。
// 設計書: docs/koso-ch3-design.md (1文ごとの「格」と絵の中身が決まっている)
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
  skyDay: "#CFE2F0",
  skyHaze: "#E2EAEF",
  skyDusk: "#F0CBA0",
  water: "#7FB4D8",
  waterDeep: "#4E87B0",
  waterPale: "#BFDCEE",
  wood: "#A77C4E",
  woodDark: "#7E5B36",
  woodWet: "#6B4A2E",
  brick: "#B4704C",
  stone: "#CFC6B4",
  tile: "#DCD6C6",
  plaster: "#E6DFCE",
  glass: "#AFC6D4",
  rust: "#8E5A3C",
  ink2: "#3A4350",
  pipeIn: "#4C555E",     // 管の中の闇
  pipeInLit: "#64707B",  // 管の中の濡れた照り
  sheet: "#9BA3A3",      // 屋上の防水シート
  sheetSeam: "#7E8787",
  concrete: "#C6C2B6",
  concreteDark: "#A49F93",
} as const;

// ===================================================================
// このファイルだけの小さな筆 (共用の部品集には足さない)
// ===================================================================

/** 鋳物・コンクリの肌 (粒を撒く。seed が同じなら毎回同じ) */
const Grit: React.FC<{
  x: number; y: number; w: number; h: number; n?: number; seed?: number;
  color?: string; opacity?: number; rmax?: number;
}> = ({ x, y, w, h, n = 60, seed = 1, color = BP.ironDark, opacity = 0.26, rmax = 3.4 }) => (
  <g opacity={opacity} fill={color}>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i}
        cx={x + rnd(seed + i * 3.7) * w}
        cy={y + rnd(seed + i * 5.3 + 11) * h}
        r={1.3 + rnd(seed + i * 9.1 + 5) * rmax} />
    ))}
  </g>
);

/** 断面図の管フランジ (左右に張り出す板 + 六角ボルト2本) */
const SecFlange: React.FC<{
  cx: number; y: number; rOut: number; h?: number; stick?: number; color?: string;
}> = ({ cx, y, rOut, h = 46, stick = 52, color = BP.iron }) => (
  <g>
    <rect x={cx - rOut - stick} y={y} width={(rOut + stick) * 2} height={h} rx={7}
      fill={color} stroke={KRP.ink} strokeWidth={6} />
    <line x1={cx - rOut - stick} y1={y + h / 2} x2={cx + rOut + stick} y2={y + h / 2}
      stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
    <HexBolt x={cx - rOut - stick * 0.52} y={y + h / 2} r={15} />
    <HexBolt x={cx + rOut + stick * 0.52} y={y + h / 2} r={15} />
  </g>
);

/** 溶接の玉 (継ぎ目にだんごを並べる) */
const Weld: React.FC<{
  x1: number; y1: number; x2: number; y2: number; n?: number; r?: number;
}> = ({ x1, y1, x2, y2, n = 10, r = 8 }) => (
  <g fill={BP.rust} stroke={KRP.ink} strokeWidth={2.2} opacity={0.95}>
    {Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      return <circle key={i} cx={lerp(x1, x2, t)} cy={lerp(y1, y2, t)} r={r} />;
    })}
  </g>
);

/** 切り欠きのギザギザ (「ここで切って中を見せている」の印) */
const CutEdge: React.FC<{
  x1: number; x2: number; y: number; amp?: number; n?: number; color?: string;
}> = ({ x1, x2, y, amp = 16, n = 11, color = KRP.ink }) => {
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return `${lerp(x1, x2, t).toFixed(1)},${(y + (i % 2 === 0 ? -amp : amp)).toFixed(1)}`;
  }).join(" ");
  return <polyline points={pts} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />;
};

/** 断面に切られたコイルばね (切り口だから左右の線が互い違いの玉になる) */
const SecSpring: React.FC<{
  cx: number; yTop: number; len: number; w?: number; coils?: number; r?: number; squeeze?: number;
}> = ({ cx, yTop, len, w = 120, coils = 6, r = 15, squeeze = 0 }) => {
  const L = len * (1 - squeeze * 0.22);
  const step = L / coils;
  return (
    <g>
      {Array.from({ length: coils + 1 }, (_, i) => (
        <g key={i}>
          <ellipse cx={cx - w / 2} cy={yTop + i * step} rx={r} ry={r * 0.78}
            fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={cx + w / 2} cy={yTop + i * step + step / 2} rx={r} ry={r * 0.78}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};

/** 水の粒 (飛沫・流れの粒) */
const Drop: React.FC<{ x: number; y: number; r?: number; color?: string; o?: number }> = ({
  x, y, r = 9, color = C.water, o = 1,
}) => (
  <ellipse cx={x} cy={y} rx={r} ry={r * 1.25} fill={color}
    stroke={KRP.ink} strokeWidth={2.4} opacity={o} />
);

/** 臭いのうず (くるくる上がる) */
const Stink: React.FC<{ x: number; y: number; s?: number; t?: number; f?: number }> = ({
  x, y, s = 1, t = 1, f = 0,
}) => {
  const ap = clamp01(t);
  if (ap <= 0) return null;
  const sway = Math.sin(f / 9) * 10;
  return (
    <g transform={`translate(${x + sway} ${y}) scale(${s})`} opacity={ap * 0.85}>
      <path d="M 0 0 C -46 -40 44 -78 -8 -124 C -52 -162 36 -196 -4 -238"
        fill="none" stroke={KRP.grayDark} strokeWidth={13} strokeLinecap="round" />
      <path d="M 0 0 C -46 -40 44 -78 -8 -124 C -52 -162 36 -196 -4 -238"
        fill="none" stroke={KRP.gray} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

/** 水槽 (断面。水位の線と出入口の管付き) */
const SecTank: React.FC<{
  x: number; y: number; w: number; h: number; fill?: number; legs?: boolean; f?: number;
}> = ({ x, y, w, h, fill = 0.66, legs = true, f = 0 }) => {
  const wy = y + h * (1 - fill);
  const rip = Math.sin(f / 7) * 3;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8}
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={6} />
      <rect x={x + 6} y={wy + rip} width={w - 12} height={y + h - wy - 6 - rip}
        fill={C.water} opacity={0.92} />
      <line x1={x + 6} y1={wy + rip} x2={x + w - 6} y2={wy + rip}
        stroke={C.waterDeep} strokeWidth={6} />
      <Rivets x1={x + 14} y1={y + 10} x2={x + w - 14} y2={y + 10} n={Math.max(3, Math.round(w / 60))} r={5} />
      {legs && (
        <g fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5}>
          <rect x={x + 14} y={y + h} width={16} height={26} />
          <rect x={x + w - 30} y={y + h} width={16} height={26} />
        </g>
      )}
    </g>
  );
};

// ===== シーン本体 (ここに1文ずつ書く) =====

// ===== #135 ただし、落ちる水は管の中の空気を引きずります。 =====
// 格: 図
// どこ: 排水立管の切り欠き断面。管は中央より少し左、画面の高さいっぱい
// 演出: 内壁を伝って落ちる水の膜。その後ろの空洞を空気が一緒に下へ引かれる
// 動き: 水のすじが下へ流れ続け、空気の矢印とへの字が下へ送られる
// 絵: #134と同じ縦管。落ちる水に引かれて空気が一緒に下る矢印
const Kb3cKuukiWoHikizuru: React.FC<{ f: number }> = ({ f }) => {
  const CX = 720, RO = 182, RI = 132;   // 管の中心・外半径・内半径
  const air = easeOut(seg(f, 10, 34));
  const film = easeOut(seg(f, 2, 18));
  return (
    <Frame f={f} seed={722} bg={KRP.cream}>
      <GridPaper pitch={60} />

      {/* ---- 管の中 (手前半分を切り欠いて見せている) ---- */}
      <rect x={CX - RI} y={-10} width={RI * 2} height={H + 20} fill={C.pipeIn} />
      {/* 奥の内壁の照り (濡れている) */}
      <rect x={CX - RI + 18} y={-10} width={46} height={H + 20} fill={C.pipeInLit} opacity={0.85} />
      <rect x={CX + RI - 70} y={-10} width={34} height={H + 20} fill={C.pipeInLit} opacity={0.5} />
      <Grit x={CX - RI} y={0} w={RI * 2} h={H} n={70} seed={7} color="#2B3137" opacity={0.3} />

      {/* ---- 内壁を伝う水の膜 (左右2枚) ---- */}
      <g opacity={0.5 + film * 0.5}>
        <rect x={CX - RI} y={-10} width={30 + film * 8} height={H + 20} fill={C.water} />
        <rect x={CX + RI - 30 - film * 8} y={-10} width={30 + film * 8} height={H + 20} fill={C.water} />
      </g>
      {/* 水のすじ (下へ流れる) */}
      <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.8}>
        {Array.from({ length: 16 }, (_, i) => {
          const yy = ((i * 96 + f * 26) % (H + 220)) - 120;
          const left = i % 2 === 0;
          const x = left ? CX - RI + 12 : CX + RI - 12;
          return <line key={i} x1={x} y1={yy} x2={x} y2={yy + 64} />;
        })}
      </g>

      {/* ---- 引きずられる空気 (管の中央の空洞) ---- */}
      <g opacity={0.35 + air * 0.4} stroke={KRP.white} strokeWidth={5} strokeDasharray="22 20">
        <line x1={CX - 44} y1={-10} x2={CX - 44} y2={H + 10} />
        <line x1={CX + 44} y1={-10} x2={CX + 44} y2={H + 10} />
      </g>
      <g stroke={KRP.orange} strokeWidth={10} strokeLinecap="round" fill="none" opacity={air}>
        {Array.from({ length: 7 }, (_, i) => {
          const yy = ((i * 160 + f * 19) % (H + 320)) - 160;
          return <polyline key={i} points={`${CX - 58},${yy} ${CX},${yy + 52} ${CX + 58},${yy}`} />;
        })}
      </g>
      <ForceArrow x={CX} y={252} len={360} rot={90} w={30} color={KRP.orange}
        t={seg(f, 16, 36)} label="空気" labelSize={34} />

      {/* ---- 管の壁 (鋳鉄。左右の帯が切り口) ---- */}
      <g>
        <rect x={CX - RO} y={-10} width={RO - RI} height={H + 20} fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
        <rect x={CX + RI} y={-10} width={RO - RI} height={H + 20} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={7} />
        <Grit x={CX - RO} y={0} w={RO - RI} h={H} n={44} seed={21} opacity={0.3} />
        <Grit x={CX + RI} y={0} w={RO - RI} h={H} n={44} seed={33} color="#2B3137" opacity={0.3} />
      </g>
      {/* 切り欠きのギザギザ (上端・下端) */}
      <CutEdge x1={CX - RI} x2={CX + RI} y={96} amp={15} n={11} />
      <CutEdge x1={CX - RI} x2={CX + RI} y={1016} amp={15} n={11} />

      {/* ---- 継手 (フランジ2段。ボルトと溶接の玉まで) ---- */}
      <SecFlange cx={CX} y={236} rOut={RO} h={50} stick={56} />
      <Weld x1={CX - RO} y1={232} x2={CX + RO} y2={232} n={13} r={7} />
      <SecFlange cx={CX} y={664} rOut={RO} h={50} stick={56} color={BP.steel} />
      <Weld x1={CX - RO} y1={660} x2={CX + RO} y2={660} n={13} r={7} />
      {/* 差し込み口のゴム輪 */}
      <rect x={CX - RI} y={290} width={RI * 2} height={16} fill={KRP.ink} opacity={0.75} />
      <rect x={CX - RI} y={718} width={RI * 2} height={16} fill={KRP.ink} opacity={0.75} />

      {/* ---- 落ちる水の矢印 (管の外に出して言う) ---- */}
      <ForceArrow x={CX - RO - 96} y={340} len={330} rot={90} w={26} color={C.waterDeep}
        t={seg(f, 6, 26)} label="水" labelSize={36} />

      {/* ---- 札 ---- */}
      <TagPlate x={1320} y={214} text="排水立管" size={56} t={seg(f, 4, 18)} />
      <TagPlate x={1360} y={338} text="内壁を水が伝う" size={34} t={seg(f, 12, 26)} color={C.waterDeep} />
      <TagPlate x={1390} y={470} text="あいた所の空気が引かれる" size={32} t={seg(f, 22, 38)} color={KRP.orange} />
      <TagPlate x={240} y={630} text="切り欠き" size={38} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #136 空気の逃げ道がないと、部屋が臭います。 =====
// 格: 並
// どこ: 洗面台の下に寄る。陶器の脚・床タイル・置かれた洗剤
// 演出: S字の封水が吸い出されて切れ、下水の臭いが部屋へ上がる
// 動き: 水面が下がって封水が切れ、臭いのうずが立ち上がる。人が顔をしかめる
// 絵: 洗面台の下。封水が吸い出される。顔をしかめる人
const Kb3cHeyaGaKusai: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 8, 30));
  const sealTop = 470 + drop * 110;      // 水面が下がる (540 を越えると封水が切れる)
  const broke = clamp01((sealTop - 520) / 40);
  const stink = easeOut(seg(f, 22, 40)) * broke;
  const FLOOR = 800;
  const trap = "M 470 300 L 470 500 Q 470 612 580 612 Q 690 612 690 500 L 690 436 L 852 436 L 852 812";
  const seal = `M 470 ${sealTop} L 470 500 Q 470 612 580 612 Q 690 612 690 500 L 690 ${sealTop}`;
  return (
    <Frame f={f} seed={723} bg={KRP.cream}>
      {/* ---- 壁と床 ---- */}
      <rect x={-10} y={-10} width={W + 20} height={FLOOR + 10} fill={C.plaster} />
      <g stroke={C.tile} strokeWidth={4} opacity={0.75}>
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-10} y1={i * 120 + 40} x2={W + 10} y2={i * 120 + 40} />)}
      </g>
      <rect x={-10} y={FLOOR} width={W + 20} height={H - FLOOR + 10} fill={C.tile} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.stone} strokeWidth={5}>
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={i * 180 + 60} y1={FLOOR} x2={i * 180 + 10} y2={H} />)}
        <line x1={-10} y1={FLOOR + 120} x2={W + 10} y2={FLOOR + 120} />
      </g>

      {/* ---- ここから洗面台まわりに寄る (1.18倍。床より下は後から床で隠す) ---- */}
      <g transform={`translate(-40 0) ${zoomAt(1.18, 523, 700)}`}>
      {/* ---- 陶器の洗面台 (下から見上げる。脚は奥) ---- */}
      <rect x={392} y={300} width={190} height={FLOOR - 300} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <line x1={420} y1={320} x2={420} y2={FLOOR} stroke={C.tile} strokeWidth={10} opacity={0.9} />
      <path d="M 210 170 L 836 170 L 790 268 Q 523 346 256 268 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
      <path d="M 256 268 Q 523 346 790 268 Q 700 336 523 338 Q 346 336 256 268 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={5} />
      <rect x={424} y={270} width={92} height={40} rx={8} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={6} />

      {/* ---- S字トラップ (封水) ---- */}
      <path d={trap} fill="none" stroke={KRP.ink} strokeWidth={104} strokeLinecap="round" />
      <path d={trap} fill="none" stroke={BP.steel} strokeWidth={90} strokeLinecap="round" />
      <path d={trap} fill="none" stroke={BP.steelLight} strokeWidth={26} strokeLinecap="round" opacity={0.6} />
      <path d={seal} fill="none" stroke={C.water} strokeWidth={66} strokeLinecap="butt" />
      <line x1={424} y1={sealTop} x2={516} y2={sealTop} stroke={C.waterDeep} strokeWidth={8} />
      <line x1={644} y1={sealTop} x2={736} y2={sealTop} stroke={C.waterDeep} strokeWidth={8} />
      {/* 継手のナット */}
      <g>
        <rect x={420} y={326} width={100} height={34} rx={6} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={640} y={452} width={100} height={34} rx={6} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <HexBolt x={852} y={690} r={16} />
      </g>
      {/* 吸い出される泡 */}
      <g opacity={0.9}>
        {Array.from({ length: 6 }, (_, i) => (
          <Drop key={i} x={566 + Math.sin((f + i * 9) / 7) * 46} y={600 - ((f * 5 + i * 34) % 150)}
            r={7 + (i % 3) * 3} color={C.waterPale} o={0.8} />
        ))}
      </g>
      </g>

      {/* ---- 床を描き直して、管の切り口を床で隠す ---- */}
      <rect x={-10} y={FLOOR} width={W + 20} height={H - FLOOR + 10} fill={C.tile} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.stone} strokeWidth={5}>
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={i * 180 + 60} y1={FLOOR} x2={i * 180 + 10} y2={H} />)}
        <line x1={-10} y1={FLOOR + 120} x2={W + 10} y2={FLOOR + 120} />
      </g>

      {/* ---- 下水から上がる臭い ---- */}
      <ForceArrow x={1006} y={776} len={300} rot={-90} w={24} color={KRP.grayDark}
        t={seg(f, 16, 32)} label="下水" labelSize={32} />
      <Stink x={1180} y={360} s={1.25} t={stink} f={f} />
      <Stink x={1402} y={236} s={1.0} t={stink * 0.9} f={f + 13} />
      <Stink x={930} y={400} s={0.8} t={stink * 0.7} f={f + 26} />

      {/* ---- 置かれた洗剤 ---- */}
      <g>
        <rect x={1092} y={690} width={74} height={110} rx={10} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1112} y={660} width={34} height={34} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1100} y={716} width={58} height={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* ---- 顔をしかめる人 (上半身だけ) ---- */}
      <Person x={1600} y={1240} s={2.3} f={f} face="worried" cloth="#4A5A74" clothDark="#36425C" />

      {/* ---- 札 ---- */}
      <g stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 10" opacity={0.8}>
        <line x1={288} y1={548} x2={372} y2={548} />
      </g>
      <TagPlate x={212} y={548} text="封水" size={48} t={seg(f, 4, 18)} color={C.waterDeep} />
      <TagPlate x={210} y={700} text="吸い出される" size={32} t={seg(f, 12, 26)} />
      <TagPlate x={1430} y={170} text="臭う" size={52} t={seg(f, 28, 42)} color={KRP.red} />
      <XMark x={430} y={548} s={0.9} t={broke * seg(f, 24, 38)} />
    </Frame>
  );
};

// ===== #137 昔は、空気専用の管を別に走らせていました。 =====
// 格: 図
// どこ: 壁の中 (パイプシャフト) の断面。左に水の管、右に空気の管を並べて立てる
// 演出: あいだを枝が何本も繋ぐ。壁の厚みの線で「2本ぶん場所を食う」を見せる
// 動き: 左の管は水が下へ、右の管は空気が上へ流れ続ける。寸法線が伸びる
// 絵: 2本の管を並べる。1本は水、1本は空気。繋ぎの枝
const Kb3cKuukiSenyouKan: React.FC<{ f: number }> = ({ f }) => {
  const WX = 700, WR = 116;     // 水の管
  const AX = 1072, AR = 76;     // 空気の管
  const WALL_L = 452, WALL_R = 1324;
  const dim = easeOut(seg(f, 18, 38));
  const branches = [312, 528, 744];
  return (
    <Frame f={f} seed={724} bg={KRP.cream}>
      <GridPaper pitch={60} />

      {/* ---- シャフトの壁 (厚みを持った2枚) ---- */}
      {[WALL_L - 64, WALL_R].map((wx, k) => (
        <g key={k}>
          <rect x={wx} y={-10} width={64} height={H + 20} fill={C.concrete} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.concreteDark} strokeWidth={5} opacity={0.85}>
            {Array.from({ length: 22 }, (_, i) => (
              <line key={i} x1={wx} y1={i * 56 - 40} x2={wx + 64} y2={i * 56 + 24} />
            ))}
          </g>
        </g>
      ))}
      <TagPlate x={330} y={160} text="壁の厚み" size={34} t={seg(f, 26, 40)} />

      {/* ---- 繋ぎの枝 (水の管から空気の管へ斜めに立ち上がる) ---- */}
      {branches.map((by, i) => (
        <g key={i}>
          <path d={`M ${WX} ${by} L ${AX - 90} ${by} L ${AX} ${by - 82}`} fill="none"
            stroke={KRP.ink} strokeWidth={56} strokeLinejoin="round" strokeLinecap="round" />
          <path d={`M ${WX} ${by} L ${AX - 90} ${by} L ${AX} ${by - 82}`} fill="none"
            stroke={BP.steel} strokeWidth={42} strokeLinejoin="round" strokeLinecap="round" />
          <HexBolt x={AX - 90} y={by} r={13} />
          <g opacity={easeOut(seg(f, 10 + i * 4, 28 + i * 4))}>
            <polyline points={`${AX - 148},${by + 20} ${AX - 110},${by - 2} ${AX - 148},${by - 24}`}
              fill="none" stroke={KRP.orange} strokeWidth={9} strokeLinecap="round" />
          </g>
        </g>
      ))}

      {/* ---- 左: 水の管 ---- */}
      <rect x={WX - WR} y={-10} width={WR * 2} height={H + 20} fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
      <rect x={WX - WR + 22} y={-10} width={WR * 2 - 44} height={H + 20} fill={C.pipeIn} />
      <rect x={WX - WR + 22} y={-10} width={WR * 2 - 44} height={H + 20} fill={C.water} opacity={0.55} />
      <Grit x={WX - WR} y={0} w={WR * 2} h={H} n={48} seed={5} opacity={0.22} />
      <g stroke={KRP.white} strokeWidth={8} strokeLinecap="round" opacity={0.85}>
        {Array.from({ length: 11 }, (_, i) => {
          const yy = ((i * 110 + f * 24) % (H + 200)) - 110;
          return <line key={i} x1={WX - 46 + (i % 3) * 46} y1={yy} x2={WX - 46 + (i % 3) * 46} y2={yy + 58} />;
        })}
      </g>
      <SecFlange cx={WX} y={428} rOut={WR} h={42} stick={44} />
      <ForceArrow x={WX} y={78} len={210} rot={90} w={26} color={C.waterDeep} t={seg(f, 4, 20)} />

      {/* ---- 右: 空気専用の管 ---- */}
      <rect x={AX - AR} y={-10} width={AR * 2} height={H + 20} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={7} />
      <rect x={AX - AR + 18} y={-10} width={AR * 2 - 36} height={H + 20} fill={C.plaster} opacity={0.6} />
      <Grit x={AX - AR} y={0} w={AR * 2} h={H} n={34} seed={17} opacity={0.22} />
      <g stroke={KRP.orange} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.95}>
        {Array.from({ length: 8 }, (_, i) => {
          const yy = H - ((i * 140 + f * 21) % (H + 260));
          return <polyline key={i} points={`${AX - 38},${yy + 44} ${AX},${yy} ${AX + 38},${yy + 44}`} />;
        })}
      </g>
      <SecFlange cx={AX} y={624} rOut={AR} h={40} stick={38} color={BP.steel} />
      <ForceArrow x={AX} y={286} len={200} rot={-90} w={24} color={KRP.orange} t={seg(f, 8, 24)} />

      {/* ---- 寸法線: 管2本ぶんの幅 (上に出す) ---- */}
      <g opacity={dim}>
        <line x1={WALL_L} y1={128} x2={WALL_R} y2={128} stroke={KRP.red} strokeWidth={7} />
        <polygon points={`${WALL_L},128 ${WALL_L + 34},114 ${WALL_L + 34},142`} fill={KRP.red} />
        <polygon points={`${WALL_R},128 ${WALL_R - 34},114 ${WALL_R - 34},142`} fill={KRP.red} />
        <line x1={WALL_L} y1={92} x2={WALL_L} y2={164} stroke={KRP.red} strokeWidth={6} />
        <line x1={WALL_R} y1={92} x2={WALL_R} y2={164} stroke={KRP.red} strokeWidth={6} />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={700} y={772} text="水の管" size={44} t={seg(f, 6, 20)} color={C.waterDeep} />
      <TagPlate x={1612} y={300} text="空気の管" size={46} t={seg(f, 12, 26)} color={KRP.orange} />
      <TagPlate x={1640} y={424} text="もう1本いる" size={34} t={seg(f, 20, 36)} />
      <TagPlate x={1618} y={140} text="管2本ぶんの幅" size={34} t={seg(f, 28, 42)} color={KRP.red} />
      <TagPlate x={236} y={520} text="別系統" size={40} t={seg(f, 16, 30)} />
    </Frame>
  );
};

// ===== #138 いまは、継手の形で管の中心に空気の芯を作ります。 =====
// 格: 図
// どこ: 鋳物の旋回継手の断面に大きく寄る (画面の高さをほぼ使う)
// 演出: 横から入った水が内側の羽根で壁沿いに振られ、中心が芯のまま空く
// 動き: カメラがじわっと寄る。水の粒が枝から入って羽根を回り、壁沿いに落ちる
// 絵: 継手の断面の寄り。水が壁沿いに旋回し、中心が空く
const Kb3cTsugiteNoKatachi: React.FC<{ f: number }> = ({ f }) => {
  const CX = 900;
  const zm = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const outer = "M 688 90 L 1112 90 L 1112 320 L 1240 400 L 1240 620 L 1100 700 L 1100 1000 L 700 1000 L 700 700 L 560 620 L 560 400 L 688 320 Z";
  const bore = "M 744 90 L 1056 90 L 1056 330 L 1184 410 L 1184 610 L 1044 690 L 1044 1000 L 756 1000 L 756 690 L 616 610 L 616 410 L 744 330 Z";
  const swirl = easeOut(seg(f, 8, 30));
  return (
    <Frame f={f} seed={725} bg={KRP.cream}>
      <GridPaper pitch={60} />
      <g transform={zoomAt(zm, CX, 500)}>
        {/* ---- 横から入る枝管 (部屋からの水) ---- */}
        <rect x={1200} y={372} width={W - 1160} height={128} fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1200} y={394} width={W - 1160} height={84} fill={C.pipeIn} />
        <rect x={1540} y={352} width={46} height={168} rx={6} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <HexBolt x={1563} y={366} r={13} />
        <HexBolt x={1563} y={506} r={13} />
        <g opacity={0.95}>
          {Array.from({ length: 6 }, (_, i) => (
            <Drop key={i} x={1860 - ((f * 22 + i * 110) % 700)} y={414 + (i % 3) * 24} r={12} color={C.water} />
          ))}
        </g>

        {/* ---- 継手の鋳物 ---- */}
        <path d={outer} fill={BP.iron} stroke={KRP.ink} strokeWidth={9} />
        <Grit x={560} y={90} w={680} h={910} n={110} seed={41} opacity={0.3} />
        <path d={bore} fill={C.pipeIn} stroke={KRP.ink} strokeWidth={7} />
        {/* 内壁の濡れた照り */}
        <path d="M 756 690 L 756 1000 L 792 1000 L 792 690 Z" fill={C.pipeInLit} opacity={0.8} />
        <path d="M 1008 690 L 1008 1000 L 1044 1000 L 1044 690 Z" fill={C.pipeInLit} opacity={0.5} />

        {/* ---- 差し込み口 (上・下) とゴム輪・ボルト ---- */}
        <SecFlange cx={CX} y={286} rOut={212} h={48} stick={50} />
        <rect x={744} y={200} width={312} height={18} fill={KRP.ink} opacity={0.75} />
        <SecFlange cx={CX} y={702} rOut={200} h={46} stick={48} color={BP.steel} />
        <rect x={756} y={790} width={288} height={18} fill={KRP.ink} opacity={0.75} />
        <Weld x1={560} y1={404} x2={688} y2={330} n={5} r={8} />
        <Weld x1={1240} y1={404} x2={1112} y2={330} n={5} r={8} />

        {/* ---- 内側の旋回羽根 (水を壁へ振る) ---- */}
        <g stroke={KRP.ink} strokeWidth={7} fill={BP.ironDark}>
          <path d="M 616 452 Q 772 492 800 616 L 744 624 Q 712 520 614 500 Z" />
          <path d="M 1184 452 Q 1028 492 1000 616 L 1056 624 Q 1088 520 1186 500 Z" />
          <path d="M 616 580 Q 716 626 744 690 L 700 700 Q 668 648 614 620 Z" />
        </g>

        {/* ---- 壁沿いに振られる水 ---- */}
        <g opacity={0.55 + swirl * 0.45}>
          <path d="M 1184 420 Q 1056 470 1030 620 L 1030 1000 L 1000 1000 L 1000 616 Q 1016 492 1150 440 Z" fill={C.water} />
          <path d="M 616 470 Q 752 520 772 640 L 772 1000 L 800 1000 L 800 636 Q 784 502 620 500 Z" fill={C.water} />
        </g>
        <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.85}>
          {Array.from({ length: 10 }, (_, i) => {
            const yy = 700 + ((i * 64 + f * 20) % 320);
            const left = i % 2 === 0;
            return <line key={i} x1={left ? 782 : 1014} y1={yy} x2={left ? 782 : 1014} y2={yy + 38} />;
          })}
        </g>

        {/* ---- 中心に空く空気の芯 ---- */}
        <rect x={CX - 48} y={330} width={96} height={670} fill={KRP.cream} opacity={0.5} />
        <g stroke={KRP.orange} strokeWidth={6} strokeDasharray="20 18" opacity={0.95}>
          <line x1={CX - 48} y1={330} x2={CX - 48} y2={1000} />
          <line x1={CX + 48} y1={330} x2={CX + 48} y2={1000} />
        </g>
        <ForceArrow x={CX} y={690} len={300} rot={-90} w={26} color={KRP.orange}
          t={seg(f, 18, 38)} label="空気" labelSize={34} />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={320} y={196} text="鋳物の継手" size={42} t={seg(f, 4, 18)} />
      <TagPlate x={300} y={760} text="差し込み口" size={36} t={seg(f, 26, 40)} />
      <TagPlate x={1570} y={640} text="旋回羽根" size={44} t={seg(f, 10, 24)} />
      <TagPlate x={1570} y={762} text="水は壁へ寄る" size={32} t={seg(f, 20, 36)} color={C.waterDeep} />
      <Arrow x={1220} y={568} s={1.0} rot={180} t={seg(f, 14, 28)} color={KRP.ink} />
    </Frame>
  );
};

// ===== #139 一本の管で、水と空気をすれ違わせるんです。 =====
// 格: 図
// どこ: #138の継手から下へ続く1本の管の断面。管は中央より少し右
// 演出: 壁沿いを螺旋に下る水と、中心をまっすぐ上下する空気。すれ違いが主題
// 動き: 螺旋の粒が回りながら下り、輪の上の点が回る。空気の矢印が上へ伸びる
// 絵: 1本の管の断面。壁沿いに水、中心に空気の芯 (#138と対)
const Kb3cIpponDeSurechigau: React.FC<{ f: number }> = ({ f }) => {
  const CX = 1000, RO = 238, RI = 186;
  const spin = f * 0.1;
  const rings = [250, 520, 790];
  return (
    <Frame f={f} seed={726} bg={KRP.cream}>
      <GridPaper pitch={60} />

      {/* ---- 管の中 (#138と同じ鋳物・同じ調子) ---- */}
      <rect x={CX - RI} y={-10} width={RI * 2} height={H + 20} fill={C.pipeIn} />
      <rect x={CX - RI + 16} y={-10} width={40} height={H + 20} fill={C.pipeInLit} opacity={0.8} />
      <rect x={CX + RI - 54} y={-10} width={30} height={H + 20} fill={C.pipeInLit} opacity={0.45} />
      <Grit x={CX - RI} y={0} w={RI * 2} h={H} n={80} seed={13} color="#2B3137" opacity={0.3} />

      {/* ---- 壁沿いを螺旋に下る水 ---- */}
      <g>
        {Array.from({ length: 74 }, (_, i) => {
          const th = i * 0.34 + spin;
          const front = Math.cos(th);
          const x = CX + RI * 0.8 * Math.sin(th);
          const y = ((i * 14 + f * 9) % (H + 60)) - 30;
          return (
            <circle key={i} cx={x} cy={y} r={11 + front * 5}
              fill={front > 0 ? C.water : C.waterDeep}
              stroke={KRP.ink} strokeWidth={front > 0 ? 2.6 : 0}
              opacity={front > 0 ? 1 : 0.55} />
          );
        })}
      </g>
      {/* 螺旋の輪 (回っている事の目印。点が回る) */}
      {rings.map((ry, i) => {
        const th = spin * 2.4 + i * 2.1;
        return (
          <g key={i}>
            <ellipse cx={CX} cy={ry} rx={RI * 0.8} ry={40} fill="none"
              stroke={KRP.white} strokeWidth={5} strokeDasharray="18 16" opacity={0.75} />
            <circle cx={CX + RI * 0.8 * Math.sin(th)} cy={ry + 40 * Math.cos(th)} r={15}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}

      {/* ---- 中心の空気の芯 (まっすぐ上下する) ---- */}
      <rect x={CX - 52} y={-10} width={104} height={H + 20} fill={KRP.cream} opacity={0.52} />
      <g stroke={KRP.orange} strokeWidth={6} strokeDasharray="22 18">
        <line x1={CX - 52} y1={-10} x2={CX - 52} y2={H + 10} />
        <line x1={CX + 52} y1={-10} x2={CX + 52} y2={H + 10} />
      </g>
      <g stroke={KRP.orange} strokeWidth={10} strokeLinecap="round" fill="none">
        {Array.from({ length: 7 }, (_, i) => {
          const yy = H - ((i * 150 + f * 23) % (H + 300));
          return <polyline key={i} points={`${CX - 34},${yy + 42} ${CX},${yy} ${CX + 34},${yy + 42}`} />;
        })}
      </g>

      {/* ---- 管の壁 ---- */}
      <rect x={CX - RO} y={-10} width={RO - RI} height={H + 20} fill={BP.iron} stroke={KRP.ink} strokeWidth={8} />
      <rect x={CX + RI} y={-10} width={RO - RI} height={H + 20} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={8} />
      <Grit x={CX - RO} y={0} w={RO - RI} h={H} n={40} seed={55} opacity={0.3} />
      <Grit x={CX + RI} y={0} w={RO - RI} h={H} n={40} seed={66} color="#2B3137" opacity={0.3} />
      <SecFlange cx={CX} y={618} rOut={RO} h={48} stick={52} />
      <Weld x1={CX - RO} y1={614} x2={CX + RO} y2={614} n={15} r={7} />
      <rect x={CX - RI} y={672} width={RI * 2} height={16} fill={KRP.ink} opacity={0.7} />
      <CutEdge x1={CX - RI} x2={CX + RI} y={64} amp={14} n={13} />

      {/* ---- 上下の矢印 (すれ違い) ---- */}
      <ForceArrow x={CX - RO - 86} y={240} len={300} rot={90} w={28} color={C.waterDeep}
        t={seg(f, 4, 22)} label="水" labelSize={34} />
      <ForceArrow x={CX + RO + 86} y={560} len={300} rot={-90} w={28} color={KRP.orange}
        t={seg(f, 12, 32)} label="空気" labelSize={34} />

      {/* ---- 札 ---- */}
      <TagPlate x={300} y={520} text="壁沿いに水" size={42} t={seg(f, 6, 20)} color={C.waterDeep} />
      <TagPlate x={300} y={648} text="中心は空気" size={42} t={seg(f, 14, 28)} color={KRP.orange} />
      <TagPlate x={288} y={776} text="すれ違う" size={48} t={seg(f, 24, 40)} color={KRP.red} />
      <TagPlate x={1660} y={180} text="管は一本" size={46} t={seg(f, 2, 16)} />
    </Frame>
  );
};

// ===== #140 いまは、屋上のタンクをやめた建物も増えました。 =====
// 格: 並
// どこ: 現代の屋上。防水シートの床・手すり・空。人は置かない
// 演出: 木の桶は無く、4本脚の台座と床に残った円い跡、切り離された立管の口だけ
// 動き: 雲が流れ、切り口の上に陽が差す。落ち葉が1枚くるくる横切る
// 絵: 現代の屋上。桶があった台座だけが残り、跡の輪が残っている
const Kb3cTankWoYameta: React.FC<{ f: number }> = ({ f }) => {
  const FLOOR = 646;
  const cloud = (f * 0.9) % (W + 520);
  const leaf = -120 + ((f * 26) % (W + 240));
  return (
    <Frame f={f} seed={727} bg={C.skyDay}>
      {/* ---- 空と雲 ---- */}
      <rect x={-10} y={-10} width={W + 20} height={FLOOR + 10} fill={C.skyDay} />
      <rect x={-10} y={-10} width={W + 20} height={300} fill={C.skyHaze} opacity={0.55} />
      {[0, 1, 2].map((i) => {
        const cx = ((cloud + i * 640) % (W + 520)) - 260;
        const cy = 110 + i * 86;
        return (
          <g key={i} fill={KRP.white} opacity={0.9}>
            <ellipse cx={cx} cy={cy} rx={150} ry={46} />
            <ellipse cx={cx + 92} cy={cy - 28} rx={104} ry={42} />
            <ellipse cx={cx - 86} cy={cy - 14} rx={80} ry={32} />
          </g>
        );
      })}
      {/* 遠くのビル */}
      <g fill={C.glass} stroke={KRP.ink} strokeWidth={5} opacity={0.75}>
        <rect x={60} y={430} width={150} height={190} />
        <rect x={236} y={482} width={110} height={138} />
        <rect x={1610} y={398} width={180} height={222} />
        <rect x={1476} y={474} width={112} height={146} />
      </g>

      {/* ---- パラペットと手すり ---- */}
      <g>
        <rect x={-10} y={FLOOR - 56} width={W + 20} height={56} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={9}>
          <line x1={-10} y1={FLOOR - 196} x2={W + 10} y2={FLOOR - 196} />
          <line x1={-10} y1={FLOOR - 132} x2={W + 10} y2={FLOOR - 132} />
          {[80, 420, 760, 1160, 1500, 1840].map((px) => (
            <line key={px} x1={px} y1={FLOOR - 212} x2={px} y2={FLOOR - 56} />
          ))}
        </g>
        <g stroke={BP.steelLight} strokeWidth={4}>
          <line x1={-10} y1={FLOOR - 199} x2={W + 10} y2={FLOOR - 199} />
        </g>
      </g>

      {/* ---- 防水シートの床 (継ぎ目の帯) ---- */}
      <rect x={-10} y={FLOOR} width={W + 20} height={H - FLOOR + 10} fill={C.sheet} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={C.sheetSeam} strokeWidth={8}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={-10} y1={FLOOR + 48 + i * 86} x2={W + 10} y2={FLOOR + 48 + i * 86} />
        ))}
      </g>
      <g stroke={KRP.white} strokeWidth={3} opacity={0.5}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={-10} y1={FLOOR + 42 + i * 86} x2={W + 10} y2={FLOOR + 42 + i * 86} />
        ))}
      </g>
      <Grit x={0} y={FLOOR} w={W} h={H - FLOOR} n={60} seed={91} color={C.sheetSeam} opacity={0.4} />

      {/* ---- 桶があった円い跡 (濃くして、輪を二重に残す) ---- */}
      <ellipse cx={970} cy={792} rx={372} ry={80} fill={C.sheetSeam} opacity={0.85} />
      <ellipse cx={970} cy={792} rx={372} ry={80} fill="none" stroke={KRP.ink} strokeWidth={8} opacity={0.85} />
      <ellipse cx={970} cy={792} rx={318} ry={66} fill="none" stroke={KRP.ink} strokeWidth={5}
        strokeDasharray="28 18" opacity={0.6} />
      <Grit x={620} y={726} w={700} h={140} n={46} seed={55} color="#5C6262" opacity={0.45} />

      {/* ---- 無くなった木の桶の影 (点線でなぞる。ここに×を打つ) ---- */}
      <g opacity={0.34 * easeOut(seg(f, 20, 40))}>
        <path d="M 676 238 L 1264 238 L 1232 466 L 708 466 Z" fill={C.wood}
          stroke={KRP.ink} strokeWidth={7} strokeDasharray="26 18" />
        <g stroke={KRP.ink} strokeWidth={5} strokeDasharray="18 14">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={794 + i * 118} y1={238} x2={800 + i * 110} y2={466} />
          ))}
          <line x1={686} y1={306} x2={1254} y2={306} />
          <line x1={698} y1={400} x2={1242} y2={400} />
        </g>
      </g>

      {/* ---- 4本脚の台座だけが残る (大きく。梁の上は空っぽ) ---- */}
      <g>
        {/* 奥の2本 */}
        <rect x={728} y={536} width={30} height={212} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1182} y={536} width={30} height={212} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 筋交い */}
        <g stroke={BP.steel} strokeWidth={16} strokeLinecap="round">
          <line x1={666} y1={800} x2={1274} y2={580} />
          <line x1={666} y1={580} x2={1274} y2={800} />
        </g>
        {/* 手前の2本 */}
        <rect x={638} y={556} width={40} height={256} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1262} y={556} width={40} height={256} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
        {/* 上の梁 (ここに桶が載っていた) */}
        <rect x={600} y={508} width={740} height={50} rx={6} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
        <rect x={600} y={464} width={740} height={32} rx={5} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={628} y1={533} x2={1312} y2={533} n={15} r={8} />
        <Grit x={600} y={464} w={740} h={94} n={34} seed={44} opacity={0.26} />
        <HexBolt x={658} y={808} r={17} />
        <HexBolt x={1282} y={808} r={17} />
      </g>

      {/* ---- 切り離された立管 (盲フランジで塞いである。上は点線で元の続き) ---- */}
      <g>
        {/* 元は上まで伸びていた管 (点線の影) */}
        <g opacity={0.3 * easeOut(seg(f, 24, 42))}>
          <rect x={1456} y={190} width={132} height={330} fill={BP.iron}
            stroke={KRP.ink} strokeWidth={6} strokeDasharray="22 16" />
        </g>
        {/* 切り口のギザギザ */}
        <CutEdge x1={1456} x2={1588} y={524} amp={13} n={7} color={KRP.red} />
        {/* 盲フランジ (蓋) */}
        <rect x={1408} y={548} width={228} height={34} rx={5} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
        <HexBolt x={1438} y={565} r={14} />
        <HexBolt x={1606} y={565} r={14} />
        <SecFlange cx={1522} y={608} rOut={88} h={40} stick={40} />
        {/* 管そのもの (床まで) */}
        <rect x={1456} y={582} width={132} height={230} fill={BP.iron} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1484} y={582} width={46} height={230} fill={C.pipeIn} />
        <rect x={1556} y={582} width={18} height={230} fill={BP.ironDark} />
        <Grit x={1456} y={582} w={132} h={230} n={26} seed={23} opacity={0.3} />
        <Weld x1={1456} y1={700} x2={1588} y2={700} n={6} r={6} />
        <g opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 16))}>
          <line x1={1522} y1={496} x2={1522} y2={530} stroke={KRP.yellow} strokeWidth={10} strokeLinecap="round" />
        </g>
      </g>

      {/* ---- 落ち葉が1枚 ---- */}
      <g transform={`translate(${leaf} ${720 + Math.sin(f / 8) * 26}) rotate(${f * 6})`}>
        <ellipse cx={0} cy={0} rx={22} ry={11} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={300} y={286} text="台座だけ残る" size={40} t={seg(f, 4, 18)} />
      <TagPlate x={330} y={744} text="桶の跡" size={38} t={seg(f, 14, 28)} />
      <TagPlate x={1688} y={290} text="立管は切られた" size={30} t={seg(f, 22, 38)} color={KRP.red} />
      <g stroke={KRP.red} strokeWidth={4} strokeDasharray="12 10" opacity={0.85}>
        <line x1={1688} y1={320} x2={1600} y2={520} />
      </g>
      <XMark x={970} y={348} s={1.15} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #141 ポンプで、各戸へ直接押し込む方式です。 =====
// 格: 並
// どこ: 地下の加圧ポンプ室。機械に寄る。床の排水溝まで入れる
// 演出: ステンレスのポンプ2台・制御盤・圧力タンク・上へ束になって伸びる配管
// 動き: 制御盤のランプが点滅、圧力計の針が振れ、管の中の水が上へ送られる
// 絵: 地下の加圧ポンプ。制御盤とインバーター。管が各階へ直接伸びる
const Kb3cKakkoEChokusetsu: React.FC<{ f: number }> = ({ f }) => {
  const FLOOR = 812;
  const run = easeOut(seg(f, 4, 22));
  const lamp = (n: number) => 0.3 + 0.7 * Math.abs(Math.sin((f + n * 11) / 7));
  const needle = -46 + 52 * run + Math.sin(f / 5) * 7;
  const Pump = ({ x, k }: { x: number; k: number }) => {
    const vib = Math.sin((f + k * 7) / 3) * 1.8 * run;
    return (
      <g transform={`translate(${x} ${vib})`}>
        {/* 基礎 */}
        <rect x={-150} y={FLOOR - 56} width={300} height={56} fill={C.concreteDark} stroke={KRP.ink} strokeWidth={6} />
        <HexBolt x={-118} y={FLOOR - 36} r={13} />
        <HexBolt x={118} y={FLOOR - 36} r={13} />
        {/* 吸込み管 (左へ) */}
        <rect x={-290} y={FLOOR - 196} width={160} height={76} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={6} />
        {/* 渦巻ケーシング */}
        <circle cx={0} cy={FLOOR - 158} r={116} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={0} cy={FLOOR - 158} r={78} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`rotate(${f * 14} 0 ${FLOOR - 158})`} stroke={KRP.ink} strokeWidth={5} fill={BP.steelDark}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path key={a} transform={`rotate(${a} 0 ${FLOOR - 158})`}
              d={`M 0 ${FLOOR - 158} L 62 ${FLOOR - 176} Q 70 ${FLOOR - 150} 50 ${FLOOR - 134} Z`} />
          ))}
        </g>
        <circle cx={0} cy={FLOOR - 158} r={20} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={-96} y1={FLOOR - 62} x2={96} y2={FLOOR - 62} n={7} r={7} />
        {/* 吐出し管 (上へ) */}
        <rect x={-42} y={FLOOR - 390} width={84} height={160} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
        <SecFlange cx={0} y={FLOOR - 404} rOut={44} h={32} stick={26} color={BP.steel} />
        {/* モーター (横置き円筒) */}
        <rect x={-104} y={FLOOR - 316} width={208} height={118} rx={18} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={BP.steel} strokeWidth={6}>
          {[-70, -40, -10, 20, 50, 80].map((dx) => (
            <line key={dx} x1={dx} y1={FLOOR - 310} x2={dx} y2={FLOOR - 204} />
          ))}
        </g>
        <rect x={-34} y={FLOOR - 286} width={68} height={38} rx={5} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-150} y={FLOOR - 56} width={300} height={10} fill={BP.grease} opacity={0.5} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={728} bg={C.plaster}>
      {/* 機械に寄る (部屋ごと1.14倍) */}
      <g transform={zoomAt(1.14, 820, 600)}>
      {/* ---- 地下室の壁・天井・床 ---- */}
      <rect x={-10} y={-10} width={W + 20} height={FLOOR + 10} fill={C.concrete} />
      <Grit x={0} y={0} w={W} h={FLOOR} n={90} seed={71} color={C.concreteDark} opacity={0.35} />
      <rect x={-10} y={-10} width={W + 20} height={92} fill={C.concreteDark} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-10} y={FLOOR} width={W + 20} height={H - FLOOR + 10} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      {/* 床の排水溝 */}
      <rect x={-10} y={FLOOR + 22} width={W + 20} height={46} fill={C.ink2} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={BP.steelLight} strokeWidth={7}>
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={i * 82} y1={FLOOR + 22} x2={i * 82} y2={FLOOR + 68} />
        ))}
      </g>

      {/* ---- 上へ束になって伸びる配管 ---- */}
      {[1082, 1176, 1270].map((px, i) => (
        <g key={px}>
          <rect x={px - 34} y={-10} width={68} height={FLOOR - 320} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.water} strokeWidth={14} strokeLinecap="round" opacity={0.9}>
            {Array.from({ length: 5 }, (_, j) => {
              const yy = (FLOOR - 320) - (((j * 120 + f * 22 + i * 40) % (FLOOR - 240)));
              return <line key={j} x1={px} y1={yy} x2={px} y2={yy + 52} />;
            })}
          </g>
          <SecFlange cx={px} y={286} rOut={36} h={28} stick={22} color={BP.steel} />
        </g>
      ))}
      {/* ヘッダー (2台の吐出しを集める横管) */}
      <rect x={430} y={FLOOR - 452} width={880} height={76} fill={BP.steel} stroke={KRP.ink} strokeWidth={8} />
      <Rivets x1={460} y1={FLOOR - 414} x2={1280} y2={FLOOR - 414} n={14} r={7} />
      <ForceArrow x={1176} y={262} len={200} rot={-90} w={26} color={C.waterDeep}
        t={seg(f, 14, 32)} label="各戸へ" labelSize={34} />

      {/* ---- ポンプ2台 ---- */}
      <Pump x={560} k={0} />
      <Pump x={900} k={1} />

      {/* ---- 圧力タンク ---- */}
      <g>
        <rect x={1452} y={398} width={236} height={376} rx={24} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={8} />
        <ellipse cx={1570} cy={398} rx={118} ry={44} fill={BP.steel} stroke={KRP.ink} strokeWidth={8} />
        <Rivets x1={1472} y1={470} x2={1668} y2={470} n={6} r={7} />
        <rect x={1540} y={774} width={26} height={40} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1600} y={774} width={26} height={40} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 圧力計 */}
        <circle cx={1570} cy={320} r={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${needle} 1570 320)`}>
          <line x1={1570} y1={320} x2={1570} y2={276} stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
        </g>
        <circle cx={1570} cy={320} r={9} fill={KRP.ink} />
        <rect x={1560} y={360} width={20} height={44} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ---- 制御盤 (ランプが点く) ---- */}
      <g>
        <rect x={112} y={286} width={262} height={386} rx={10} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={134} y={310} width={218} height={338} rx={6} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={156} y={334} width={174} height={78} rx={5} fill={C.ink2} stroke={KRP.ink} strokeWidth={5} />
        <text x={243} y={390} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
          fill={KRP.green}>{`0.${4 + (Math.floor(f / 8) % 3)}MPa`}</text>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={186 + i * 58} cy={456} r={21}
            fill={i === 1 ? KRP.green : i === 0 ? KRP.yellow : KRP.red}
            opacity={lamp(i)} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <g fill={BP.steelLight} stroke={KRP.ink} strokeWidth={5}>
          <rect x={160} y={500} width={166} height={34} rx={6} />
          <rect x={160} y={548} width={166} height={34} rx={6} />
        </g>
        <circle cx={243} cy={614} r={22} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <line x1={243} y1={614} x2={243 + Math.cos(f / 9) * 16} y2={614 + Math.sin(f / 9) * 16}
          stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <rect x={168} y={672} width={150} height={16} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={730} y={226} text="加圧ポンプ" size={46} t={seg(f, 4, 18)} />
      <TagPlate x={243} y={740} text="制御盤" size={36} t={seg(f, 12, 26)} />
      <TagPlate x={1570} y={192} text="圧力タンク" size={36} t={seg(f, 18, 32)} />
      <TagPlate x={1240} y={648} text="直接押し込む" size={34} t={seg(f, 26, 42)} color={KRP.red} />
      </g>
    </Frame>
  );
};

// ===== #142 ただし超高層は、いまも水槽に頼っています。 =====
// 格: 山
// どこ: 超高層の断面の全体像。地上の街・空・雲ごと引いて見る
// 演出: 中間階に水槽が何段も。各段から下へ配る管の束。中に小さな人を置いて大きさを比べる
// 動き: 雲が流れ、揚水管の水が上へ、配る管の水が下へ、水槽の水面が揺れる
// 絵: 超高層の断面。中間階に水槽が何段も入っている全体像。人の大きさと比べる
const Kb3cChoukousouWaSuisou: React.FC<{ f: number }> = ({ f }) => {
  const TL = 640, TR = 1280;          // 塔の左右
  const GND = 900;                    // 地面
  const floors = Array.from({ length: 14 }, (_, i) => 130 + i * 56);
  const tanks = [150, 390, 630];      // 中間水槽の段
  const cloud = (f * 1.1) % (W + 560);
  const riser = 1150;
  return (
    <Frame f={f} seed={729} bg={C.skyHaze}>
      {/* ---- 空と雲 ---- */}
      <rect x={-10} y={-10} width={W + 20} height={GND + 10} fill={C.skyDay} />
      <rect x={-10} y={-10} width={W + 20} height={420} fill={C.skyHaze} opacity={0.6} />
      {[0, 1, 2, 3].map((i) => {
        const cx = ((cloud + i * 520) % (W + 560)) - 280;
        const cy = 150 + (i % 2) * 330;
        return (
          <g key={i} fill={KRP.white} opacity={0.82}>
            <ellipse cx={cx} cy={cy} rx={160} ry={44} />
            <ellipse cx={cx + 96} cy={cy - 26} rx={110} ry={40} />
            <ellipse cx={cx - 92} cy={cy - 12} rx={86} ry={30} />
          </g>
        );
      })}

      {/* ---- 地上の街 ---- */}
      <g>
        <rect x={40} y={636} width={470} height={GND - 636} fill={C.glass} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1396} y={592} width={470} height={GND - 592} fill={C.glass} stroke={KRP.ink} strokeWidth={7} />
        <g fill={C.skyHaze} stroke={KRP.ink} strokeWidth={3.5} opacity={0.85}>
          {Array.from({ length: 24 }, (_, i) => (
            <rect key={`l${i}`} x={72 + (i % 6) * 74} y={664 + Math.floor(i / 6) * 58} width={48} height={36} />
          ))}
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={`r${i}`} x={1428 + (i % 6) * 74} y={620 + Math.floor(i / 6) * 58} width={48} height={36} />
          ))}
        </g>
        <rect x={-10} y={GND} width={W + 20} height={H - GND + 10} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      </g>

      {/* 塔だけ横に細める (高さはそのまま = 超高層らしい縦長に) */}
      <g transform="translate(960 0) scale(0.9 1) translate(-960 0)">
      {/* ---- 塔の躯体 (断面) ---- */}
      <rect x={TL} y={92} width={TR - TL} height={GND - 92} fill={C.plaster} stroke={KRP.ink} strokeWidth={8} />
      {/* 外壁の厚み */}
      {[TL, TR - 56].map((wx, k) => (
        <g key={k}>
          <rect x={wx} y={92} width={56} height={GND - 92} fill={C.concrete} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.concreteDark} strokeWidth={4} opacity={0.8}>
            {Array.from({ length: 16 }, (_, i) => (
              <line key={i} x1={wx} y1={100 + i * 52} x2={wx + 56} y2={148 + i * 52} />
            ))}
          </g>
        </g>
      ))}
      {/* 屋根 */}
      <rect x={TL - 28} y={60} width={TR - TL + 56} height={38} rx={6} fill={C.concreteDark} stroke={KRP.ink} strokeWidth={8} />
      {/* 床スラブ */}
      {floors.map((fy) => (
        <g key={fy}>
          <rect x={TL + 56} y={fy} width={TR - TL - 112} height={11} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 内側のガラス面 */}
      <g fill={C.glass} opacity={0.5}>
        {floors.map((fy) => (
          <rect key={fy} x={TL + 56} y={fy - 40} width={26} height={40} />
        ))}
      </g>

      {/* ---- 揚水管 (下から上へ) ---- */}
      <rect x={riser - 22} y={140} width={44} height={652} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={6} />
      <g stroke={KRP.orange} strokeWidth={9} strokeLinecap="round" fill="none">
        {Array.from({ length: 9 }, (_, i) => {
          const yy = 780 - ((i * 92 + f * 24) % 640);
          return <polyline key={i} points={`${riser - 16},${yy + 24} ${riser},${yy} ${riser + 16},${yy + 24}`} />;
        })}
      </g>

      {/* ---- 中間水槽と、各段から下へ配る管の束 ---- */}
      {tanks.map((ty, i) => (
        <g key={ty}>
          <SecTank x={716} y={ty} w={312} h={66} fill={0.62 + i * 0.08} f={f + i * 9} />
          {/* 下へ配る管の束 (3本) + 各階への枝 */}
          {[742, 792, 842].map((px, j) => (
            <g key={px}>
              <rect x={px - 11} y={ty + 92} width={22} height={172} fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
              <g stroke={C.water} strokeWidth={9} strokeLinecap="round" opacity={0.95}>
                {Array.from({ length: 3 }, (_, k) => {
                  const yy = ty + 92 + ((k * 64 + f * 18 + j * 24) % 166);
                  return <line key={k} x1={px} y1={yy} x2={px} y2={yy + 30} />;
                })}
              </g>
            </g>
          ))}
          {[1, 2].map((k) => (
            <rect key={k} x={700} y={ty + 92 + k * 56 - 8} width={160} height={16}
              fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {/* 段ごとのポンプ */}
          <g>
            <circle cx={1070} cy={ty + 120} r={26} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={6} />
            <g transform={`rotate(${f * 16} 1070 ${ty + 120})`} stroke={KRP.ink} strokeWidth={4}>
              <line x1={1052} y1={ty + 120} x2={1088} y2={ty + 120} />
              <line x1={1070} y1={ty + 102} x2={1070} y2={ty + 138} />
            </g>
            <rect x={1100} y={ty + 100} width={54} height={40} rx={7} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
          <rect x={1028} y={ty + 20} width={124} height={18} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}

      {/* ---- 地上階の受水槽とポンプ ---- */}
      <SecTank x={1024} y={790} w={216} h={62} fill={0.72} f={f + 4} />
      <rect x={968} y={806} width={64} height={18} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={940} cy={816} r={28} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={6} />
      <g transform={`rotate(${f * 18} 940 816)`} stroke={KRP.ink} strokeWidth={4}>
        <line x1={920} y1={816} x2={960} y2={816} />
        <line x1={940} y1={796} x2={940} y2={836} />
      </g>
      <rect x={1128} y={776} width={44} height={22} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* ---- 小さな人 (大きさ比べ。細めた塔に合わせて置き直す) ---- */}
      <Person x={1090} y={242} s={0.19} f={f} phase={1} cloth="#4A5A74" clothDark="#36425C" />
      <Person x={1163} y={466} s={0.19} f={f} phase={2} cloth="#7A4A4A" clothDark="#5C3636" />
      <Person x={1100} y={690} s={0.19} f={f} phase={3} cloth="#3E5A4A" clothDark="#2E4438" />
      <Person x={1536} y={896} s={0.19} f={f} phase={4} cloth="#4A4A6A" clothDark="#363650" />
      {/* 人ひとりぶんの高さを赤い括弧で示す */}
      <g stroke={KRP.red} strokeWidth={5} strokeLinecap="round" opacity={easeOut(seg(f, 26, 40))}>
        <line x1={1200} y1={466 - 292 * 0.19} x2={1200} y2={466} />
        <line x1={1186} y1={466 - 292 * 0.19} x2={1214} y2={466 - 292 * 0.19} />
        <line x1={1186} y1={466} x2={1214} y2={466} />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={332} y={180} text="超高層" size={48} t={seg(f, 2, 16)} />
      <TagPlate x={1588} y={240} text="中間水槽" size={42} t={seg(f, 8, 22)} color={C.waterDeep} />
      <TagPlate x={1600} y={364} text="各段から配る" size={32} t={seg(f, 16, 30)} />
      <TagPlate x={1588} y={482} text="人ひとりぶん" size={30} t={seg(f, 26, 40)} color={KRP.red} />
      <TagPlate x={352} y={742} text="地上の受水槽から" size={34} t={seg(f, 20, 34)} />
      <Arrow x={620} y={796} s={0.85} rot={0} t={seg(f, 24, 38)} color={KRP.ink} />
      <Arrow x={1244} y={476} s={0.8} rot={180} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #143 ポンプ一台で押し上げられるのは、16階ほどだから。 =====
// 格: 図
// ---- #143 と #144 で共有する目盛りの座標 (対の連番なので必ず同じ値を使う) ----
const SCL = { x: 620, yTop: 100, yBot: 820, max: 32, rx: 900, rw: 44 };
const scY = (n: number) => lerp(SCL.yBot, SCL.yTop, n / SCL.max);

/** 目盛りの右に並ぶ各階の床線 (#143/#144 共通) */
const FloorTicks: React.FC<{ t?: number }> = ({ t = 1 }) => (
  <g>
    {Array.from({ length: SCL.max }, (_, i) => {
      const n = i + 1;
      const big = n % 8 === 0;
      return (
        <line key={n} x1={SCL.rx + 84} y1={scY(n)} x2={SCL.rx + 84 + (big ? 790 : 640) * clamp01(t)}
          y2={scY(n)} stroke={KRP.ink} strokeWidth={big ? 7 : 3.5} opacity={big ? 0.9 : 0.45} />
      );
    })}
  </g>
);

/** 立管の筒 (#143/#144 共通。中の水は別に描く) */
const RiserTube: React.FC = () => (
  <g>
    <rect x={SCL.rx - SCL.rw} y={SCL.yTop - 40} width={SCL.rw * 2} height={SCL.yBot - SCL.yTop + 80}
      fill={C.pipeIn} stroke={KRP.ink} strokeWidth={7} />
    <rect x={SCL.rx - SCL.rw + 10} y={SCL.yTop - 40} width={12} height={SCL.yBot - SCL.yTop + 80}
      fill={C.pipeInLit} opacity={0.7} />
  </g>
);

/** 小さな加圧ポンプ (#143/#144 共通。羽根が回る) */
const MiniPump: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-74} y={44} width={148} height={26} fill={C.concreteDark} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={0} cy={0} r={48} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
    <g transform={`rotate(${f * 15})`} stroke={KRP.ink} strokeWidth={5} fill={BP.steelDark}>
      {[0, 90, 180, 270].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M 0 0 L 34 -12 Q 38 4 24 14 Z" />
      ))}
    </g>
    <circle cx={0} cy={0} r={11} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
    <rect x={44} y={-30} width={62} height={60} rx={9} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
    <g stroke={BP.steel} strokeWidth={4}>
      {[56, 70, 84, 98].map((dx) => <line key={dx} x1={dx} y1={-24} x2={dx} y2={24} />)}
    </g>
  </g>
);

// どこ: クリーム地の図。縦の階数の目盛りを画面の高さいっぱいに
// 演出: 下のポンプから伸びる水の線が16階でぴたりと止まる。16に赤い印
// 動き: 水位が上がって16階で止まり、そこで小さく波打つ。×と札が出る
// 絵: 縦の階数の目盛り。16階のところに届く線
const Kb3cIchidaiDe16Kai: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 6, 30));
  const stop = scY(16);
  const wob = Math.sin(f / 5) * 5 * rise;
  const top = SCL.yBot - (SCL.yBot - stop) * rise + wob;
  return (
    <Frame f={f} seed={730} bg={KRP.cream}>
      <GridPaper pitch={60} />
      <FloorTicks t={seg(f, 2, 20)} />
      <FloorScale x={SCL.x} yTop={SCL.yTop} yBot={SCL.yBot} max={SCL.max}
        marks={[8, 16, 24, 32]} dashedFrom={16} t={seg(f, 2, 16)} />

      {/* ---- 立管と、上がってくる水 ---- */}
      <RiserTube />
      <rect x={SCL.rx - SCL.rw + 7} y={top} width={SCL.rw * 2 - 14} height={SCL.yBot - top + 40} fill={C.water} />
      <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.75}>
        {Array.from({ length: 6 }, (_, i) => {
          const yy = SCL.yBot - ((i * 120 + f * 26) % Math.max(60, SCL.yBot - top));
          return <line key={i} x1={SCL.rx - 14} y1={yy} x2={SCL.rx - 14} y2={yy + 52} />;
        })}
      </g>
      <line x1={SCL.rx - SCL.rw + 7} y1={top} x2={SCL.rx + SCL.rw - 7} y2={top}
        stroke={C.waterDeep} strokeWidth={9} />
      {/* 止まった印 */}
      <g opacity={rise}>
        <line x1={SCL.rx - 120} y1={stop} x2={SCL.rx + 120} y2={stop} stroke={KRP.red} strokeWidth={9} />
        <line x1={SCL.rx - 120} y1={stop} x2={1380} y2={stop} stroke={KRP.red} strokeWidth={6}
          strokeDasharray="22 18" opacity={0.85} />
      </g>
      <XMark x={SCL.rx} y={stop - 104} s={0.92} t={seg(f, 26, 40)} />

      {/* ---- 下のポンプ1台 ---- */}
      <MiniPump x={SCL.rx} y={SCL.yBot - 2} f={f} s={1.05} />
      <ForceArrow x={SCL.rx + 150} y={SCL.yBot - 40} len={260} rot={-90} w={26} color={C.waterDeep}
        t={seg(f, 8, 26)} label="押す" labelSize={34} />

      {/* ---- 札 ---- */}
      <TagPlate x={248} y={248} text="ポンプ1台" size={44} t={seg(f, 4, 18)} />
      <TagPlate x={1500} y={434} text="16階" size={56} t={seg(f, 18, 32)} color={KRP.red} />
      <TagPlate x={1520} y={560} text="ここまで" size={36} t={seg(f, 26, 40)} />
      <TagPlate x={240} y={776} text="水の高さ" size={38} t={seg(f, 12, 26)} color={C.waterDeep} />
    </Frame>
  );
};

// ===== #144 だから15階ごとに、水槽で縦に区切ります。 =====
// 格: 図
// どこ: #143とまったく同じ目盛り・同じ座標。見る側が「同じ図だ」とわかること
// 演出: 15階と30階に水槽が入り、縦が3つに区切られる。段ごとにポンプが付く
// 動き: 下の段から順に水が満ちていく。区切りの線が左右に伸びる
// 絵: #143と同じ断面を15階ごとに区切る (#143と対の連番)
const Kb3cJugokaiGoto: React.FC<{ f: number }> = ({ f }) => {
  const y15 = scY(15), y30 = scY(30);
  const r1 = easeOut(seg(f, 4, 18));
  const r2 = easeOut(seg(f, 14, 28));
  const r3 = easeOut(seg(f, 24, 38));
  const BOT = SCL.yBot + 40;
  const band = (yl: number, yh: number, r: number) => {
    const t = yl - (yl - yh) * r;
    return <rect x={SCL.rx - SCL.rw + 7} y={t} width={SCL.rw * 2 - 14} height={yl - t} fill={C.water} />;
  };
  return (
    <Frame f={f} seed={731} bg={KRP.cream}>
      <GridPaper pitch={60} />
      <FloorTicks t={seg(f, 2, 20)} />
      <FloorScale x={SCL.x} yTop={SCL.yTop} yBot={SCL.yBot} max={SCL.max}
        marks={[8, 16, 24, 32]} t={seg(f, 2, 16)} />

      {/* ---- 立管。水は下の段から順に満ちる ---- */}
      <RiserTube />
      {band(BOT, y15, r1)}
      {band(y15, y30, r2)}
      {band(y30, SCL.yTop - 40, r3)}
      <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.7}>
        {Array.from({ length: 10 }, (_, i) => {
          const yy = BOT - ((i * 86 + f * 24) % 760);
          return <line key={i} x1={SCL.rx - 14} y1={yy} x2={SCL.rx - 14} y2={yy + 44} />;
        })}
      </g>

      {/* ---- 15階ごとの区切り (線が左右に伸びる) ---- */}
      {[{ y: y15, t: seg(f, 8, 24) }, { y: y30, t: seg(f, 18, 34) }].map((d, i) => (
        <g key={i} opacity={clamp01(d.t)}>
          <line x1={SCL.x - 60} y1={d.y} x2={SCL.x - 60 + 1500 * easeOut(clamp01(d.t))} y2={d.y}
            stroke={KRP.green} strokeWidth={9} strokeDasharray="30 20" />
        </g>
      ))}

      {/* ---- 水槽2段 + 段ごとのポンプ ---- */}
      <SecTank x={790} y={y15 - 58} w={220} h={58} fill={0.68} f={f} />
      <SecTank x={790} y={y30 - 58} w={220} h={58} fill={0.68} f={f + 11} />
      <g stroke={KRP.ink} strokeWidth={5} fill={BP.steelLight}>
        <rect x={1010} y={y15 - 44} width={116} height={20} />
        <rect x={1010} y={y30 - 44} width={116} height={20} />
      </g>
      <MiniPump x={1136} y={y15 - 34} f={f} s={0.78} />
      <MiniPump x={1136} y={y30 - 34} f={f + 7} s={0.78} />
      <MiniPump x={SCL.rx} y={SCL.yBot - 2} f={f} s={1.05} />
      <ForceArrow x={SCL.rx + 150} y={SCL.yBot - 40} len={220} rot={-90} w={24} color={C.waterDeep}
        t={seg(f, 6, 22)} />
      <ForceArrow x={SCL.rx + 150} y={y15 - 90} len={220} rot={-90} w={24} color={C.waterDeep}
        t={seg(f, 16, 32)} />

      {/* ---- 右端: 15階ぶんの寸法 ---- */}
      <g opacity={easeOut(seg(f, 26, 40))}>
        <line x1={1846} y1={y15} x2={1846} y2={y30} stroke={KRP.red} strokeWidth={7} />
        <polygon points={`1846,${y15} 1832,${y15 - 32} 1860,${y15 - 32}`} fill={KRP.red} />
        <polygon points={`1846,${y30} 1832,${y30 + 32} 1860,${y30 + 32}`} fill={KRP.red} />
      </g>

      {/* ---- 札 ---- */}
      <TagPlate x={262} y={248} text="15階ごと" size={44} t={seg(f, 4, 18)} />
      <TagPlate x={1476} y={396} text="水槽" size={46} t={seg(f, 12, 26)} color={C.waterDeep} />
      <TagPlate x={1476} y={182} text="水槽" size={46} t={seg(f, 22, 36)} color={C.waterDeep} />
      <TagPlate x={1752} y={318} text="15階" size={34} t={seg(f, 28, 42)} color={KRP.red} />
      <TagPlate x={254} y={776} text="縦に区切る" size={38} t={seg(f, 16, 30)} color={KRP.green} />
    </Frame>
  );
};

// ===== #145 ちなみに水槽のすぐ下の階は、水圧が強すぎます。 =====
// 格: 並
// どこ: 洗面所。鏡・タイル・濡れた床。蛇口に寄りつつ、のけぞる人を1人入れる
// 演出: 水が勢いよく当たって跳ね、飛沫が人まで飛ぶ
// 動き: f で水の勢いが増し、飛沫の数と飛ぶ距離が増える。人がのけぞる
// 絵: 蛇口から水が勢いよく跳ねて飛び散る。のけぞる人
const Kb3cSuatsuGaTsuyosugi: React.FC<{ f: number }> = ({ f }) => {
  const FLOOR = 812;
  const jet = easeOut(seg(f, 4, 26));
  const jw = 22 + jet * 46;
  const NOZ = { x: 506, y: 500 };
  const HIT = { x: 506, y: 626 };
  const lean = -4 - jet * 10;
  return (
    <Frame f={f} seed={732} bg={C.tile}>
      {/* ---- タイルの壁 ---- */}
      <rect x={-10} y={-10} width={W + 20} height={FLOOR + 10} fill={C.tile} />
      <g stroke={C.stone} strokeWidth={5} opacity={0.9}>
        {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={-10} y1={i * 92} x2={W + 10} y2={i * 92} />)}
        {Array.from({ length: 22 }, (_, i) => <line key={`v${i}`} x1={i * 92} y1={-10} x2={i * 92} y2={FLOOR} />)}
      </g>
      {/* ---- 濡れた床 ---- */}
      <rect x={-10} y={FLOOR} width={W + 20} height={H - FLOOR + 10} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      <ellipse cx={620} cy={FLOOR + 22} rx={330 * (0.4 + jet * 0.6)} ry={30} fill={C.waterPale} opacity={0.85} />
      <ellipse cx={1180} cy={FLOOR + 30} rx={120 * jet} ry={18} fill={C.waterPale} opacity={0.7} />

      {/* ---- 鏡 ---- */}
      <g>
        <rect x={140} y={104} width={690} height={320} rx={8} fill={BP.brass} stroke={KRP.ink} strokeWidth={8} />
        <rect x={166} y={130} width={638} height={268} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.white} strokeWidth={16} opacity={0.5}>
          <line x1={210} y1={392} x2={420} y2={140} />
          <line x1={310} y1={392} x2={520} y2={140} />
        </g>
      </g>

      {/* ---- 洗面台 ---- */}
      <g>
        <rect x={80} y={596} width={800} height={54} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 150 650 Q 170 790 330 796 L 650 796 Q 810 790 830 650 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={7} />
        <ellipse cx={490} cy={650} rx={240} ry={52} fill={C.pipeInLit} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={490} cy={656} rx={196} ry={38} fill={KRP.white} opacity={0.5} />
        <circle cx={490} cy={660} r={26} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ---- 蛇口 ---- */}
      <g>
        <rect x={372} y={442} width={40} height={162} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
        <rect x={340} y={580} width={104} height={26} rx={5} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <rect x={372} y={430} width={152} height={38} rx={8} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
        <rect x={486} y={452} width={40} height={54} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
        <rect x={478} y={494} width={56} height={18} rx={4} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={300} cy={448} r={30} fill={BP.brass} stroke={KRP.ink} strokeWidth={6} />
        <line x1={300} y1={448} x2={300 + Math.cos(f / 11) * 20} y2={448 + Math.sin(f / 11) * 20}
          stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
      </g>

      {/* ---- 勢いよく出る水 ---- */}
      <polygon points={`${NOZ.x - jw / 2},${NOZ.y} ${NOZ.x + jw / 2},${NOZ.y} ${NOZ.x + jw * 0.8},${HIT.y} ${NOZ.x - jw * 0.8},${HIT.y}`}
        fill={C.water} stroke={KRP.ink} strokeWidth={4} />
      <line x1={NOZ.x - 6} y1={NOZ.y} x2={NOZ.x - 10} y2={HIT.y} stroke={KRP.white} strokeWidth={10} opacity={0.85} />
      <line x1={NOZ.x + 12} y1={NOZ.y} x2={NOZ.x + 18} y2={HIT.y} stroke={KRP.white} strokeWidth={5} opacity={0.55} />
      {/* 当たった所の白い霧 (扇に広がる) */}
      <g opacity={jet * 0.26}>
        <path d={`M ${HIT.x} ${HIT.y} Q ${HIT.x - 300} ${HIT.y - 230 * jet} ${HIT.x - 420} ${HIT.y + 60}`}
          fill={KRP.white} stroke="none" />
        <path d={`M ${HIT.x} ${HIT.y} Q ${HIT.x + 320} ${HIT.y - 250 * jet} ${HIT.x + 460} ${HIT.y + 60}`}
          fill={KRP.white} stroke="none" />
      </g>
      {/* 当たって跳ねる飛沫 */}
      <g>
        {Array.from({ length: 40 }, (_, i) => {
          const a = (-174 + (i * 352) / 40 + rnd(i * 3.1) * 44) * (Math.PI / 180);
          const sp = (0.34 + rnd(i * 7.7) * 0.66) * (240 + jet * 640);
          const ph = ((f * 2.6 + i * 7) % 30) / 30;
          const dx = Math.cos(a) * sp * ph;
          const dy = Math.sin(a) * sp * ph + 420 * ph * ph;
          return (
            <Drop key={i} x={HIT.x + dx} y={HIT.y + dy} r={7 + rnd(i * 2.3) * 10}
              color={i % 3 === 0 ? C.waterPale : C.water} o={1 - ph * 0.45} />
          );
        })}
      </g>
      {/* 跳ねたしぶきの尾 (線で勢いを出す) */}
      <g stroke={C.waterPale} strokeWidth={7} strokeLinecap="round" opacity={jet * 0.9}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (-168 + i * 18 + rnd(i * 5.3) * 14) * (Math.PI / 180);
          const L = 110 + rnd(i * 1.7) * 190 * jet;
          return (
            <line key={i} x1={HIT.x + Math.cos(a) * 34} y1={HIT.y + Math.sin(a) * 34}
              x2={HIT.x + Math.cos(a) * L} y2={HIT.y + Math.sin(a) * L - 30} />
          );
        })}
      </g>
      {/* 人の方へ飛ぶ大きな飛沫 */}
      <g opacity={jet}>
        {Array.from({ length: 12 }, (_, i) => {
          const ph = ((f * 2.0 + i * 11) % 34) / 34;
          return (
            <Drop key={i} x={HIT.x + ph * (760 + i * 46)} y={HIT.y - 250 * Math.sin(ph * Math.PI) + i * 14}
              r={13 + (i % 4) * 6} color={C.water} o={1 - ph * 0.35} />
          );
        })}
      </g>

      {/* ---- のけぞる人 ---- */}
      <Person x={1430} y={1150} s={2.0} f={f} lean={lean} face="surprised"
        cloth="#5A4A6A" clothDark="#443654" />

      {/* ---- 札 ---- */}
      <TagPlate x={170} y={520} text="蛇口" size={42} t={seg(f, 4, 18)} />
      <TagPlate x={1046} y={228} text="水圧が強い" size={44} t={seg(f, 12, 26)} color={KRP.red} />
      <TagPlate x={1080} y={352} text="跳ねて飛び散る" size={32} t={seg(f, 20, 36)} />
      <TagPlate x={1066} y={694} text="水槽のすぐ下の階" size={32} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #146 蛇口の手前で、わざわざ圧を下げているんです。 =====
// 格: 図
// どこ: 減圧弁の断面に大きく寄る。クリーム地に図だけ (人も背景も置かない)
// 演出: 入口は太い矢印・出口は細い矢印。ばね/弁体/弁座/パッキン/調整ねじまで描く
// 動き: 弁体がばねに押されて上下し、ばねが縮む。水の粒が左から右へ抜ける
// 絵: 減圧弁の断面の寄り。ばねと弁体。入口の圧と出口の圧の差
const Kb3cGenatsuBen: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 6, 26));
  const lift = 10 + (16 + Math.sin(f / 5) * 12) * open;   // 弁体の持ち上がり
  const SEAT = 596;
  const discY = SEAT - 34 - lift;
  const leader = (x1: number, y1: number, x2: number, y2: number, t: number) => (
    <g opacity={clamp01(t)}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 10" />
      <circle cx={x2} cy={y2} r={9} fill={KRP.ink} />
    </g>
  );
  return (
    <Frame f={f} seed={733} bg={KRP.cream}>
      <GridPaper pitch={60} />

      {/* ---- 入口の管 (太い) ---- */}
      <rect x={-10} y={500} width={660} height={196} fill={BP.iron} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-10} y={526} width={660} height={144} fill={C.pipeIn} />
      <rect x={-10} y={526} width={660} height={144} fill={C.waterDeep} opacity={0.75} />
      <g>
        <rect x={528} y={462} width={36} height={272} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
        <HexBolt x={546} y={480} r={14} />
        <HexBolt x={546} y={716} r={14} />
      </g>
      {/* ---- 出口の管 (同じ太さだが中は薄い) ---- */}
      <rect x={1272} y={500} width={W - 1262} height={196} fill={BP.iron} stroke={KRP.ink} strokeWidth={8} />
      <rect x={1272} y={526} width={W - 1262} height={144} fill={C.pipeIn} />
      <rect x={1272} y={526} width={W - 1262} height={144} fill={C.water} opacity={0.55} />
      <g>
        <rect x={1356} y={462} width={36} height={272} fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
        <HexBolt x={1374} y={480} r={14} />
        <HexBolt x={1374} y={716} r={14} />
      </g>

      {/* ---- 弁の鋳物 ---- */}
      <path d="M 616 300 L 1306 300 L 1306 776 L 616 776 Z" fill={BP.iron} stroke={KRP.ink} strokeWidth={9} />
      <Grit x={616} y={300} w={690} h={476} n={90} seed={81} opacity={0.3} />
      {/* 中の部屋 (左: 入口圧 / 右: 出口圧) */}
      <path d="M 648 332 L 920 332 L 920 560 L 1002 560 L 1002 332 L 1274 332 L 1274 744 L 648 744 Z"
        fill={C.pipeIn} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 648 332 L 920 332 L 920 560 L 960 560 L 960 744 L 648 744 Z" fill={C.waterDeep} opacity={0.7} />
      <path d="M 960 560 L 1002 560 L 1002 332 L 1274 332 L 1274 744 L 960 744 Z" fill={C.water} opacity={0.5} />

      {/* 水の粒 (左は密・右は疎) */}
      <g>
        {Array.from({ length: 9 }, (_, i) => (
          <Drop key={`a${i}`} x={680 + ((f * 9 + i * 30) % 220)} y={380 + (i % 4) * 82} r={10} color={C.waterPale} o={0.95} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <Drop key={`b${i}`} x={1060 + ((f * 13 + i * 60) % 200)} y={420 + (i % 3) * 104} r={9} color={C.waterPale} o={0.7} />
        ))}
      </g>

      {/* ---- 弁座 (座面の肩) ---- */}
      <g fill={BP.brass} stroke={KRP.ink} strokeWidth={6}>
        <rect x={858} y={SEAT - 36} width={66} height={36} />
        <rect x={998} y={SEAT - 36} width={66} height={36} />
      </g>
      <g fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4}>
        <rect x={858} y={SEAT - 44} width={66} height={12} />
        <rect x={998} y={SEAT - 44} width={66} height={12} />
      </g>

      {/* ---- 弁体 (ばねに押されて動く) ---- */}
      <g>
        <rect x={846} y={discY} width={230} height={34} rx={6} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
        <rect x={858} y={discY + 34} width={206} height={14} fill={KRP.ink} opacity={0.8} />
        <rect x={944} y={330} width={34} height={discY - 326} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <HexBolt x={961} y={discY + 17} r={12} fill={BP.brass} />
      </g>
      {/* 隙間を抜ける水の筋 */}
      <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={1064 + i * 10} y1={discY + 20 - i * 5} x2={1112 + i * 22} y2={discY - 6 - i * 9} />
        ))}
      </g>

      {/* ---- ばねの部屋 (上蓋) ---- */}
      <path d="M 812 150 L 1110 150 L 1110 306 L 812 306 Z" fill={BP.iron} stroke={KRP.ink} strokeWidth={9} />
      <Grit x={812} y={150} w={298} h={156} n={34} seed={99} opacity={0.3} />
      <rect x={838} y={170} width={246} height={136} fill={C.plaster} opacity={0.55} stroke={KRP.ink} strokeWidth={5} />
      <SecFlange cx={961} y={296} rOut={149} h={34} stick={34} color={BP.steel} />
      <SecSpring cx={961} yTop={182} len={110} w={162} coils={4} r={16} squeeze={open * (lift / 42)} />
      {/* パッキン (ステムの通り道) */}
      <g>
        <rect x={930} y={306} width={62} height={34} fill={BP.grease} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={3}>
          {[0, 1, 2, 3].map((i) => <line key={i} x1={932 + i * 16} y1={306} x2={946 + i * 16} y2={340} />)}
        </g>
      </g>
      {/* 調整ねじ */}
      <g>
        <rect x={938} y={56} width={46} height={110} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3.5}>
          {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={938} y1={68 + i * 17} x2={984} y2={76 + i * 17} />)}
        </g>
        <HexBolt x={961} y={52} r={38} fill={BP.steelDark} />
      </g>
      <Weld x1={812} y1={154} x2={1110} y2={154} n={10} r={7} />

      {/* ---- 入口・出口の圧の差 ---- */}
      <ForceArrow x={60} y={598} len={430} rot={0} w={48} color={KRP.red}
        t={seg(f, 2, 20)} label="高い圧" labelSize={42} />
      <ForceArrow x={1400} y={598} len={330} rot={0} w={18} color={KRP.green}
        t={seg(f, 14, 32)} label="下げた圧" labelSize={34} />

      {/* ---- 札 (引き出し線つき) ---- */}
      {leader(392, 174, 920, 96, seg(f, 8, 22))}
      <TagPlate x={300} y={174} text="調整ねじ" size={40} t={seg(f, 8, 22)} />
      {leader(368, 322, 882, 236, seg(f, 14, 28))}
      <TagPlate x={276} y={322} text="ばね" size={44} t={seg(f, 14, 28)} />
      {leader(400, 452, 928, 322, seg(f, 20, 34))}
      <TagPlate x={300} y={452} text="パッキン" size={40} t={seg(f, 20, 34)} />
      {leader(1476, 268, 1086, discY + 16, seg(f, 10, 24))}
      <TagPlate x={1588} y={268} text="弁体" size={46} t={seg(f, 10, 24)} />
      {leader(1476, 404, 1058, SEAT - 20, seg(f, 18, 32))}
      <TagPlate x={1588} y={404} text="弁座" size={46} t={seg(f, 18, 32)} />
      <TagPlate x={1606} y={760} text="ここで圧を落とす" size={30} t={seg(f, 28, 42)} color={KRP.green} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb3_kuuki_wo_hikizuru: (f) => <Kb3cKuukiWoHikizuru f={f} />,
  kb3_heya_ga_kusai: (f) => <Kb3cHeyaGaKusai f={f} />,
  kb3_kuuki_senyou_kan: (f) => <Kb3cKuukiSenyouKan f={f} />,
  kb3_tsugite_no_katachi: (f) => <Kb3cTsugiteNoKatachi f={f} />,
  kb3_ippon_de_surechigau: (f) => <Kb3cIpponDeSurechigau f={f} />,
  kb3_tank_wo_yameta: (f) => <Kb3cTankWoYameta f={f} />,
  kb3_kakko_e_chokusetsu: (f) => <Kb3cKakkoEChokusetsu f={f} />,
  kb3_choukousou_wa_suisou: (f) => <Kb3cChoukousouWaSuisou f={f} />,
  kb3_ichidai_de_16kai: (f) => <Kb3cIchidaiDe16Kai f={f} />,
  kb3_15kai_goto: (f) => <Kb3cJugokaiGoto f={f} />,
  kb3_suatsu_ga_tsuyosugi: (f) => <Kb3cSuatsuGaTsuyosugi f={f} />,
  kb3_genatsu_ben: (f) => <Kb3cGenatsuBen f={f} />,
};

export const K_B3C_MOTIFS: string[] = [
  "kb3_kuuki_wo_hikizuru",     // #135 ただし、落ちる水は管の中の空気を引きずります。
  "kb3_heya_ga_kusai",         // #136 空気の逃げ道がないと、部屋が臭います。
  "kb3_kuuki_senyou_kan",      // #137 昔は、空気専用の管を別に走らせていました。
  "kb3_tsugite_no_katachi",    // #138 いまは、継手の形で管の中心に空気の芯を作ります。
  "kb3_ippon_de_surechigau",   // #139 一本の管で、水と空気をすれ違わせるんです。
  "kb3_tank_wo_yameta",        // #140 いまは、屋上のタンクをやめた建物も増えました。
  "kb3_kakko_e_chokusetsu",    // #141 ポンプで、各戸へ直接押し込む方式です。
  "kb3_choukousou_wa_suisou",  // #142 ただし超高層は、いまも水槽に頼っています。
  "kb3_ichidai_de_16kai",      // #143 ポンプ一台で押し上げられるのは、16階ほどだから。
  "kb3_15kai_goto",            // #144 だから15階ごとに、水槽で縦に区切ります。
  "kb3_suatsu_ga_tsuyosugi",   // #145 ちなみに水槽のすぐ下の階は、水圧が強すぎます。
  "kb3_genatsu_ben",           // #146 蛇口の手前で、わざわざ圧を下げているんです。
];

export const kosoB3cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
