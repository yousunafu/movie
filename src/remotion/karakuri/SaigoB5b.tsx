// 「人類は、昔から飛ばして観ていた」: 文#111〜#113 (3文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-2.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで3枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1146〜1148。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Danmen/Tehaisho/SaiseiBar/NenpyoEmaki/Fuda3) は設計書で指定された文でだけ使う

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // #111 型職人の工房 (夕暮れ)
  wallIndigo: "#39414F", // 工房の板壁
  brick: "#6E4A3F",      // 炉のレンガ
  brickDark: "#56382F",
  soot: "#2A2420",       // 焚き口の闇
  iron: "#6A7180",       // 鋳型の鉄肌
  ironDark: "#4E545E",   // 鋳型の彫り込み
  emberOrange: "#E07A2F",// 残り火
  emberGlow: "#F2A45C",
  floorNight: "#5A4A36", // 夕暮れの床板
  samue: "#6B543A",      // 職人の作務衣
  samueDark: "#4E3D2A",
  minarai: "#5E6B7E",    // 見習いの着物
  // #112 暗いコンサートホール
  hallNight: "#262E3D",  // ホールの闇
  hallWall: "#313A4D",   // 側壁
  balc: "#2C3342",       // 桟敷の手すり
  stageDusk: "#574A33",  // 舞台奥のほの明かり
  curtainNight: "#7E2830", // 夜の緞帳
  hallGold: "#CBA75A",   // プロセニアムの金
  chandel: "#1F242F",    // 消えたシャンデリアの影
  chandelLine: "#6B7487",
  audA: "#3E4557",       // 客の背中 3色
  audB: "#4A5168",
  audC: "#574F5C",
  seatBack: "#333A49",   // 座席の背もたれ
  // #113 夜の番屋
  wallKura: "#443E52",   // 番屋の板壁 (夜の紫紺)
  yoru: "#232838",       // 窓の外の夜
  tableDark: "#5E4A33",  // 文机の前板
  doma: "#3B332E",       // 土間
  ghost: "#9FB4CC",      // まだ無い物の点線
  hakama: "#44506B",     // 指差す同心の羽織
  hakamaDark: "#333D54",
};
void C; void W; void H; void FONT; void useCurrentFrame;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
// 決まった見た目にするための擬似乱数 (毎フレーム同じ値)
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
// カメラの寄り (cx,cy を注視点にして z 倍)
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

// 「かちり」の衝撃線 (f=at の瞬間から8コマで消える)。#111の落着と#113の朱印で使う
const Kachi: React.FC<{ x: number; y: number; f: number; at: number; s?: number; col?: string }> =
  ({ x, y, f, at, s = 1, col = KRP.yellow }) => {
    const k = (f - at) / 8;
    if (k < 0 || k >= 1) return null;
    const r = (26 + k * 40) * s;
    return (
      <g transform={`translate(${x} ${y})`} opacity={1 - k}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * 60 + 15) * (Math.PI / 180);
          return (
            <line key={i} x1={Math.cos(a) * r} y1={Math.sin(a) * r}
              x2={Math.cos(a) * (r + 20 * s)} y2={Math.sin(a) * (r + 20 * s)}
              stroke={col} strokeWidth={7 * s} strokeLinecap="round" />
          );
        })}
        <ellipse cx={-44 * s} cy={14} rx={16} ry={8} fill={KRP.gray} opacity={0.5 * (1 - k)} />
        <ellipse cx={46 * s} cy={12} rx={14} ry={7} fill={KRP.gray} opacity={0.5 * (1 - k)} />
      </g>
    );
  };

// 鈍い光のきらめき (出て消える十字)
const Glint: React.FC<{ x: number; y: number; f: number; at: number; s?: number }> =
  ({ x, y, f, at, s = 1 }) => {
    const k = clamp01((f - at) / 7);
    if (k <= 0 || k >= 1) return null;
    const g = Math.sin(Math.PI * k);
    return (
      <g transform={`translate(${x} ${y}) scale(${s * (0.6 + g * 0.4)}) rotate(20)`}
        opacity={g * 0.85} stroke={KRP.white} strokeWidth={5} strokeLinecap="round">
        <line x1={-18} y1={0} x2={18} y2={0} />
        <line x1={0} y1={-18} x2={0} y2={18} />
      </g>
    );
  };

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #111 「黙って、座って、最初から最後まで」。
// 格: 山 / seed 1146
// 絵: `Fuda3` の三枚札が、鋳型にかちり、かちり、とはまっていく。完成品の鈍い光。軸
// どこ: 型職人の工房の夕暮れ。左に残り火の炉と煙突、中央に立てた鋳型の鉄板、右に作業台と職人
// 演出: 吊り竿から下りた三枚札が、鉄板の彫り込みへ左から順に「かちり」とはまる。全部はまると鈍い光が鋳肌をひと撫で
// 動き: 札の落着 t=seg(f,2,34) / 接地の衝撃線3回 (f≈7,16,26) / 鈍い光 seg(f,33,42) / 炉の火と火の粉 / 職人のまばたき
const Sg111: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 2, 34);
  const sheen = seg(f, 33, 42);
  const emb = 0.5 + 0.18 * Math.sin(f / 5) + 0.06 * Math.sin(f / 2.3);
  const slots = [
    { cx: 545, w: 292 },
    { cx: 845, w: 292 },
    { cx: 1260, w: 520 },
  ];
  const clickAt = [7, 16.5, 26]; // Fuda3 の pop が受けに触れる瞬間 (式から逆算)
  return (
    <Frame f={f} seed={1146}>
      {/* ===== 壁 (夕暮れの藍) と天井の梁 ===== */}
      <rect x={-20} y={-20} width={W + 40} height={740} fill={C.wallIndigo} />
      {[160, 280, 400, 520, 620].map((wy) => (
        <line key={wy} x1={-20} y1={wy} x2={W + 20} y2={wy} stroke={KRP.ink} strokeWidth={3} opacity={0.13} />
      ))}
      <rect x={-20} y={54} width={W + 40} height={46} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      {[180, 560, 960, 1360, 1740].map((bx) => (
        <circle key={bx} cx={bx} cy={77} r={4} fill={KRP.ink} />
      ))}
      {/* 右上の棚: 小さな鋳型の在庫 */}
      <rect x={1600} y={182} width={300} height={14} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 1618 196 L 1604 230 M 1882 196 L 1896 230" stroke={KRP.ink} strokeWidth={5} fill="none" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1622 + i * 92} y={140 + (i % 2) * 10} width={70} height={42 - (i % 2) * 10}
          fill={C.iron} stroke={KRP.ink} strokeWidth={4.5} />
      ))}

      {/* ===== 左: 炉 (残り火) と煙突 ===== */}
      <rect x={128} y={100} width={88} height={310} fill={C.brickDark} stroke={KRP.ink} strokeWidth={6} />
      <path d={`M 172 92 C ${182 + Math.sin(f / 9) * 6} 62 ${160 + Math.sin(f / 7) * 8} 34 ${176 + Math.sin(f / 11) * 10} 2`}
        fill="none" stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round" opacity={0.5} />
      <rect x={56} y={402} width={360} height={304} rx={10} fill={C.brick} stroke={KRP.ink} strokeWidth={7} />
      <path d="M 56 480 H 416 M 56 556 H 416 M 56 632 H 416" stroke={KRP.ink} strokeWidth={3} opacity={0.35} fill="none" />
      <path d="M 150 402 V 480 M 260 402 V 480 M 110 480 V 556 M 230 480 V 556 M 340 480 V 556 M 170 556 V 632 M 300 556 V 632"
        stroke={KRP.ink} strokeWidth={3} opacity={0.35} fill="none" />
      {/* 焚き口と火 */}
      <path d="M 138 702 L 138 572 Q 236 520 334 572 L 334 702 Z" fill={C.soot} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={236} cy={640} r={74} fill={C.emberGlow} opacity={emb * 0.45} />
      <g transform={`translate(236 692) scale(${1 + 0.08 * Math.sin(f / 3)} ${1 + 0.12 * Math.sin(f / 2.4)})`}>
        <path d="M 0 0 C -34 -16 -26 -52 -8 -66 C -2 -46 10 -44 12 -62 C 30 -46 28 -16 0 0 Z"
          fill={C.emberOrange} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 0 -4 C -14 -12 -12 -30 0 -40 C 12 -30 14 -12 0 -4 Z" fill={KRP.yellow} />
      </g>
      {[0, 1, 2, 3].map((i) => {
        const p = ((f * 2.2 + i * 37) % 130) / 130;
        return <circle key={i} cx={236 + Math.sin(p * 6 + i * 2) * 20} cy={610 - p * 250}
          r={4 - p * 2.5} fill={C.emberGlow} opacity={(1 - p) * 0.8} />;
      })}

      {/* ===== 床板 ===== */}
      <rect x={-20} y={700} width={W + 40} height={400} fill={C.floorNight} />
      <line x1={-20} y1={700} x2={W + 20} y2={700} stroke={KRP.ink} strokeWidth={7} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={140 + i * 240} y1={700} x2={90 + i * 258} y2={1085}
          stroke={KRP.ink} strokeWidth={3} opacity={0.18} />
      ))}
      <path d="M -20 804 Q 960 796 1940 804" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.15} />
      {/* 手桶と金づち */}
      <g transform="translate(482 702)">
        <path d="M -34 -58 L 34 -58 L 28 0 L -28 0 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -30 -58 A 34 30 0 0 1 30 -58" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <line x1={-30} y1={-20} x2={30} y2={-20} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      </g>
      <g transform="translate(700 696) rotate(-8)">
        <rect x={-6} y={-64} width={12} height={64} rx={5} fill={SGP.wood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-30} y={-86} width={60} height={26} rx={6} fill={C.ironDark} stroke={KRP.ink} strokeWidth={4.5} />
      </g>

      {/* ===== 中央: 鋳型の鉄板 (三つの彫り込み) ===== */}
      <polygon points="382,585 452,585 472,702 362,702" fill={C.ironDark} stroke={KRP.ink} strokeWidth={6} />
      <polygon points="1468,585 1538,585 1558,702 1448,702" fill={C.ironDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={330} y={298} width={1260} height={290} rx={8} fill={C.iron} stroke={KRP.ink} strokeWidth={8} />
      <path d="M 360 320 H 760 M 1080 320 H 1500 M 380 568 H 640 M 980 572 H 1560"
        stroke={C.ironDark} strokeWidth={3.5} opacity={0.7} fill="none" />
      {([[360, 324], [1560, 324], [360, 562], [1560, 562]] as const).map(([bx, by]) => (
        <g key={`${bx}-${by}`}>
          <circle cx={bx} cy={by} r={8} fill={C.ironDark} stroke={KRP.ink} strokeWidth={4} />
          <line x1={bx - 4} y1={by - 4} x2={bx + 4} y2={by + 4} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      ))}
      {slots.map((sl) => (
        <g key={sl.cx}>
          <rect x={sl.cx - sl.w / 2} y={332} width={sl.w} height={184} rx={10}
            fill={C.ironDark} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={sl.cx - sl.w / 2 + 12} y1={346} x2={sl.cx + sl.w / 2 - 12} y2={346}
            stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
          <line x1={sl.cx - sl.w / 2 + 10} y1={344} x2={sl.cx - sl.w / 2 + 10} y2={504}
            stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        </g>
      ))}

      {/* ===== 右: 作業台 ===== */}
      <rect x={1626} y={616} width={284} height={18} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={1650} y={634} width={16} height={68} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1862} y={634} width={16} height={68} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
      <g transform="translate(1700 616) rotate(14)">
        <rect x={-5} y={-46} width={10} height={46} rx={4} fill={SGP.wood} stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={-20} y={-62} width={40} height={18} rx={5} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* ===== 三枚札が鋳型へ下りる ===== */}
      <Fuda3 f={f} x={960} y={420} s={1} t={t} />

      {/* かちり の衝撃線 (左から3回) */}
      {slots.map((sl, i) => (
        <Kachi key={i} x={sl.cx} y={508} f={f} at={clickAt[i]} />
      ))}

      {/* ===== 完成品の鈍い光 (鋳肌をひと撫で + うっすら残る) ===== */}
      <defs>
        <clipPath id="sg111slab"><rect x={330} y={298} width={1260} height={290} /></clipPath>
      </defs>
      {sheen > 0 && (
        <g clipPath="url(#sg111slab)">
          <polygon
            points={`${350 + 1150 * sheen},292 ${440 + 1150 * sheen},292 ${340 + 1150 * sheen},594 ${250 + 1150 * sheen},594`}
            fill={KRP.white} opacity={0.2 * Math.sin(Math.PI * Math.min(sheen, 0.999))} />
          <rect x={330} y={298} width={1260} height={290} fill={KRP.white}
            opacity={0.07 * seg(f, 36, 42)} />
        </g>
      )}
      <Glint x={420} y={352} f={f} at={35} />
      <Glint x={975} y={486} f={f} at={37} s={0.8} />
      <Glint x={1488} y={350} f={f} at={39} />

      {/* ===== 人: 出来を見届ける職人と見習い ===== */}
      <Person x={1746} y={826} s={0.9} cloth={C.samue} clothDark={C.samueDark}
        pose="armsFolded" f={f} phase={3} gaze={[-4, -1]} />
      <PersonMini x={505} y={818} s={0.62} color={C.minarai} f={f} phase={7} face="dot" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #112 この型が、コンサートホールで、ほぼ完成します。
// 格: 並 / seed 1147
// 絵: 完成したホールの静寂。満席なのに微動だにしない客席。空気の張りつめた線
// どこ: 暗いコンサートホールを客席のいちばん後ろから。奥にほの明るい舞台、手前は背中の列
// 演出: 満席の背中は1ミリも動かない (f を渡さない)。動くのは張りつめた空気の線・舞台の明かり・塵だけ
// 動き: カメラがゆっくり舞台へ寄る (f0→42) / 空気の線のさざ波 / 明かりの脈 / 指揮棒の先の震え / 塵が立ちのぼる
const Sg112: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const rows = [
    { y: 620, s: 0.34, n: 15, x0: 500, x1: 1420 },
    { y: 700, s: 0.44, n: 12, x0: 400, x1: 1520 },
    { y: 790, s: 0.57, n: 10, x0: 300, x1: 1620 },
    { y: 890, s: 0.76, n: 8, x0: 190, x1: 1730 },
    { y: 1016, s: 1.05, n: 6, x0: 170, x1: 1750 },
  ];
  const audCols = [C.audA, C.audB, C.audC];
  const glow = 0.16 + 0.035 * Math.sin(f / 7);
  return (
    <Frame f={f} seed={1147} dark>
      <g transform={zoomAt(z, 960, 430)}>
        {/* ===== ホールの闇 ===== */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.hallNight} />
        {/* 天井のアーチと消えたシャンデリア */}
        <path d="M 140 150 Q 960 36 1780 150" fill="none" stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
        <path d="M 300 128 Q 960 58 1620 128" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.25} />
        <g transform="translate(960 10)">
          <line x1={0} y1={0} x2={0} y2={44} stroke={C.chandelLine} strokeWidth={5} />
          <ellipse cx={0} cy={66} rx={16} ry={24} fill={C.chandel} stroke={C.chandelLine} strokeWidth={4} />
          <path d="M -74 70 Q 0 118 74 70" fill="none" stroke={C.chandelLine} strokeWidth={5} />
          {([[-74, 70], [0, 94], [74, 70]] as const).map(([ax, ay]) => (
            <g key={ax}>
              <rect x={ax - 4} y={ay - 22} width={8} height={22} fill={C.chandel} stroke={C.chandelLine} strokeWidth={3} />
              <circle cx={ax} cy={ay - 28} r={6} fill={SGP.lampOff} stroke={C.chandelLine} strokeWidth={3} />
            </g>
          ))}
        </g>

        {/* ===== 左右の壁・桟敷 (鏡写し) ===== */}
        {[0, 1].map((side) => (
          <g key={side} transform={side ? `translate(${W} 0) scale(-1 1)` : undefined}>
            <polygon points="-60,110 516,206 516,640 -60,780" fill={C.hallWall} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 120 170 L 120 712 M 300 196 L 300 668 M 440 216 L 440 634"
              stroke={KRP.ink} strokeWidth={4} opacity={0.22} fill="none" />
            {/* 消えた壁の燭台 */}
            <g transform="translate(212 400)">
              <path d="M 0 26 L 0 0 M -14 0 L 14 0" stroke={C.chandelLine} strokeWidth={4} fill="none" />
              <circle cx={0} cy={-8} r={7} fill={SGP.lampOff} stroke={C.chandelLine} strokeWidth={3} />
            </g>
            {/* 桟敷の客の影と手すり */}
            {([[110, 462], [225, 472], [345, 480]] as const).map(([hx, hy]) => (
              <g key={hx} fill={C.audB} stroke={KRP.ink} strokeWidth={4}>
                <circle cx={hx} cy={hy} r={17} />
                <path d={`M ${hx - 24} ${hy + 42} Q ${hx} ${hy + 12} ${hx + 24} ${hy + 42} Z`} />
              </g>
            ))}
            <path d="M -60 496 L 470 516 L 470 592 L -60 614 Z" fill={C.balc} stroke={KRP.ink} strokeWidth={6} />
            <line x1={-60} y1={514} x2={470} y2={534} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          </g>
        ))}

        {/* ===== 舞台 (金の額縁の奥だけ、ほの明るい) ===== */}
        <rect x={516} y={146} width={888} height={348} rx={10} fill={C.hallGold} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 540 160 Q 960 142 1380 160" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
        <rect x={544} y={174} width={832} height={292} fill={C.stageDusk} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={960} cy={436} rx={390} ry={120} fill={SGP.lampGold} opacity={glow} />
        <line x1={544} y1={448} x2={1376} y2={448} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <line x1={544} y1={463} x2={1376} y2={463} stroke={SGP.lampGold} strokeWidth={3} opacity={0.6} />
        {/* 楽団の影 (弾く direct前の構え。みな静止) */}
        {([[688, 408, 0.8], [782, 408, 0.8], [1138, 408, 0.8], [1232, 408, 0.8],
        [640, 446, 1], [735, 446, 1], [830, 446, 1], [1090, 446, 1], [1185, 446, 1], [1280, 446, 1]] as const)
          .map(([px, py, ps], i) => (
            <g key={i} transform={`translate(${px} ${py}) scale(${ps})`}
              fill={C.chandel} stroke={KRP.ink} strokeWidth={3.5}>
              <path d="M -15 0 Q -13 -34 0 -36 Q 13 -34 15 0 Z" />
              <circle cx={0} cy={-45} r={10} />
              <line x1={22} y1={0} x2={22} y2={-34} strokeWidth={3} />
              <rect x={14} y={-52} width={18} height={14} transform="rotate(-16 23 -45)" />
            </g>
          ))}
        {/* 指揮者: 振り上げた棒の先だけ、かすかに震える */}
        <g transform="translate(960 452)">
          <rect x={-36} y={-12} width={72} height={16} rx={4} fill={C.chandel} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -16 -12 L -20 -66 Q 0 -76 20 -66 L 16 -12 Z" fill={C.chandel} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={0} cy={-80} r={12} fill={C.chandel} stroke={KRP.ink} strokeWidth={4.5} />
          <g transform={`rotate(${-54 + Math.sin(f / 4) * 1.4} 14 -60)`}>
            <line x1={14} y1={-60} x2={46} y2={-72} stroke={C.chandel} strokeWidth={8} strokeLinecap="round" />
            <line x1={46} y1={-72} x2={80} y2={-86} stroke={KRP.white} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        </g>
        {/* 緞帳 (左右に寄せたまま) と上の飾り */}
        <path d="M 544 174 L 616 174 Q 630 320 608 466 L 544 466 Z" fill={C.curtainNight} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 586 186 Q 592 320 584 452" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        <path d="M 1376 174 L 1304 174 Q 1290 320 1312 466 L 1376 466 Z" fill={C.curtainNight} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1334 186 Q 1328 320 1336 452" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={i} d={`M ${544 + i * 64} 188 a 32 20 0 0 0 64 0`}
            fill={C.curtainNight} stroke={KRP.ink} strokeWidth={4} />
        ))}

        {/* 舞台のほの明かりが客席へこぼれる帯 */}
        <polygon points="610,470 1310,470 1620,870 300,870" fill={SGP.lampGold}
          opacity={0.045 + 0.012 * Math.sin(f / 7)} />
        {/* 立ちのぼる塵 (音のない空気) */}
        {Array.from({ length: 7 }).map((_, i) => {
          const p = ((f * 0.9 + i * 29) % 140) / 140;
          return <circle key={i} cx={660 + i * 98 + Math.sin(f / 11 + i) * 8} cy={540 - p * 180}
            r={3} fill={SGP.lampGold} opacity={(1 - p) * 0.35} />;
        })}
        {/* 空気の張りつめた線 (弦のようにかすかに波打つ) */}
        {[0, 1, 2].map((i) => (
          <path key={i}
            d={`M 240 ${492 + i * 22} Q 960 ${492 + i * 22 + Math.sin(f / 7 + i * 2.1) * 5} 1680 ${492 + i * 22}`}
            stroke={KRP.white} strokeWidth={2.5} fill="none"
            opacity={0.16 + 0.05 * Math.sin(f / 9 + i)} />
        ))}

        {/* ===== 満席の背中 (f を渡さない = 微動だにしない) ===== */}
        {rows.map((r2, ri) => (
          <g key={ri}>
            {Array.from({ length: r2.n }).map((_, j) => {
              const x = r2.x0 + ((r2.x1 - r2.x0) / (r2.n - 1)) * j + (rnd(ri + 1, j) - 0.5) * 52 * r2.s;
              return <PersonMini key={j} x={x} y={r2.y} s={r2.s}
                color={audCols[(ri + j) % 3]} face="none" />;
            })}
            {/* 座席の背もたれの列 */}
            <rect x={r2.x0 - 60 * r2.s} y={r2.y - 70 * r2.s}
              width={(r2.x1 - r2.x0) + 120 * r2.s} height={76 * r2.s} rx={14 * r2.s}
              fill={C.seatBack} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: r2.n + 1 }).map((_, j) => {
              const x = r2.x0 - 60 * r2.s + ((r2.x1 - r2.x0 + 120 * r2.s) / r2.n) * j;
              return <line key={j} x1={x} y1={r2.y - 64 * r2.s} x2={x} y2={r2.y + 2 * r2.s}
                stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />;
            })}
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #113 ラジオ放送が始まるより、前の話です。
// 格: 山 / seed 1148
// 絵: 章結び・決定打。年表の上、「型の完成」の旗が立つ位置より右に、ラジオ塔 (1920年代) がまだ影も形もない。手配書③マーラーに御用印
// どこ: 夜の番屋。提灯の下、文机に絵巻年表を広げる。左の壁にマーラーの手配書、右に指差す同心
// 演出: 絵巻が右端まで開く → 青い帯の入り口に「型の完成」の旗 → その右の宙にラジオ塔の点線 (まだ無い) → 手配書に御用の朱印がドン
// 動き: 絵巻の開き seg(f,2,12) / 旗 seg(f,12,18) / 点線の塔 seg(f,14,22) / 朱印 seg(f,26,36)+衝撃線 / 提灯のゆれ / カメラが寄る
const Sg113: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.028 * easeOut(seg(f, 0, 42));
  const openT = 0.85 + 0.15 * easeOut(seg(f, 2, 12));
  const flagT = pop(seg(f, 12, 18));
  const ghostO = (0.34 + 0.08 * Math.sin(f / 7)) * seg(f, 14, 22);
  const goyo = seg(f, 26, 36);
  const shake = f >= 30 ? Math.sin(f * 2.6) * 5 * (1 - clamp01((f - 30) / 8)) : 0;
  const wave = Math.sin(f / 6) * 5;
  const lampO = 0.3 + 0.06 * Math.sin(f / 6);
  return (
    <Frame f={f} seed={1148}>
      <g transform={zoomAt(z, 960, 480)}>
        {/* ===== 夜の番屋: 縦板の壁と柱 ===== */}
        <rect x={-40} y={-40} width={W + 80} height={830} fill={C.wallKura} />
        {[130, 330, 860, 1060, 1260, 1480, 1700].map((vx) => (
          <line key={vx} x1={vx} y1={-20} x2={vx} y2={775} stroke={KRP.ink} strokeWidth={3.5} opacity={0.16} />
        ))}
        <rect x={452} y={-20} width={56} height={800} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <line x1={480} y1={0} x2={480} y2={770} stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
        {/* 格子窓の外は夜 (三日月) */}
        <rect x={560} y={118} width={214} height={204} fill={C.yoru} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={704} cy={172} r={28} fill={SGP.paper} opacity={0.9} />
        <circle cx={690} cy={164} r={24} fill={C.yoru} />
        {[613, 666, 719].map((gx) => (
          <line key={gx} x1={gx} y1={120} x2={gx} y2={320} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {[170, 222, 274].map((gy) => (
          <line key={gy} x1={562} y1={gy} x2={772} y2={gy} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 提灯 (明かりの出どころ) */}
        <g transform={`translate(1120 0) rotate(${Math.sin(f / 10) * 2})`}>
          <line x1={0} y1={0} x2={0} y2={94} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={168} r={100} fill={SGP.lampGold} opacity={lampO} />
          <path d="M -44 104 L 44 104 L 52 168 Q 52 224 0 230 Q -52 224 -52 168 Z"
            fill={SGP.paper} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -48 138 L 48 138 M -52 168 L 52 168 M -50 198 L 50 198"
            stroke={KRP.ink} strokeWidth={3} opacity={0.5} fill="none" />
          <rect x={-46} y={94} width={92} height={14} rx={6} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-40} y={226} width={80} height={12} rx={6} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        </g>

        {/* ===== 土間と文机 ===== */}
        <rect x={-40} y={772} width={W + 80} height={340} fill={C.doma} />
        <rect x={70} y={800} width={1780} height={80} fill={C.tableDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={60} y={758} width={1800} height={46} rx={8} fill={SGP.wood} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 120 782 Q 500 774 900 784 M 1100 780 Q 1400 788 1800 780"
          stroke={SGP.woodDark} strokeWidth={3} fill="none" opacity={0.8} />
        {/* 左端の湯のみ (湯気だけ動く) */}
        <g transform="translate(158 758)">
          <path d="M -18 0 L 18 0 L 14 -32 L -14 -32 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={-13} y1={-24} x2={13} y2={-24} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
          <path d={`M -4 -40 C ${-10 + Math.sin(f / 8) * 4} -56 ${2 + Math.sin(f / 6) * 4} -66 -2 -84`}
            fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={0.5} strokeLinecap="round" />
        </g>

        {/* ===== 机の上の絵巻年表 (右端の青い帯まで開く) ===== */}
        <NenpyoEmaki f={f} x={960} y={620} s={0.78} openT={openT} />

        {/* 「型の完成」の旗 (青い帯の入り口に立つ) */}
        {flagT > 0 && (
          <g transform="translate(1429 492)">
            <g transform={`scale(${flagT})`}>
              <rect x={-6} y={-184} width={12} height={184} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={0} cy={-188} r={8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M -6 -178 L -176 ${-166 + wave} L -176 ${-110 + wave} L -6 -122 Z`}
                fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
              <text x={-91} y={-134} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={30} fill={KRP.ink} transform={`rotate(-3 -91 -140)`}>型の完成</text>
              <path d="M -16 0 L 16 0 L 10 -10 L -10 -10 Z" fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        )}

        {/* 旗より右の宙: ラジオ塔はまだ影も形もない (点線だけ) */}
        {ghostO > 0 && (
          <g opacity={ghostO} stroke={C.ghost} fill="none" strokeLinecap="round">
            <path d="M 1570 470 L 1625 240 L 1655 240 L 1710 470" strokeWidth={5} strokeDasharray="10 10" />
            <path d="M 1585 410 L 1695 410 M 1598 352 L 1682 352 M 1611 296 L 1669 296"
              strokeWidth={4} strokeDasharray="9 9" />
            <path d="M 1585 410 L 1682 352 M 1695 410 L 1598 352 M 1598 352 L 1669 296 M 1682 352 L 1611 296"
              strokeWidth={3} strokeDasharray="7 8" />
            <line x1={1640} y1={240} x2={1640} y2={198} strokeWidth={4} strokeDasharray="8 8" />
            <circle cx={1640} cy={190} r={7} strokeWidth={4} strokeDasharray="6 6" />
            <rect x={1548} y={112} width={184} height={58} rx={12} strokeWidth={4} strokeDasharray="10 8" />
            <text x={1640} y={154} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={34} fill={C.ghost} stroke="none">ラジオ塔</text>
          </g>
        )}

        {/* ===== 壁の手配書③マーラー: 御用の朱印がドン ===== */}
        <g transform={`translate(${shake} 0)`}>
          <Tehaisho f={f} who={3} x={258} y={288} s={0.8} goyoT={goyo} />
        </g>
        <Kachi x={258} y={270} f={f} at={30} s={2.2} col={SGP.shuin} />

        {/* ===== 指差して確かめる同心 ===== */}
        <Person x={1762} y={828} s={0.78} cloth={C.hakama} clothDark={C.hakamaDark}
          pose="point" pointDir={-1} f={f} phase={5} gaze={[-4, -3]} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_111: (f) => <Sg111 f={f} />,
  sg_112: (f) => <Sg112 f={f} />,
  sg_113: (f) => <Sg113 f={f} />,
};

export const S_B5B_MOTIFS: string[] = [
  "sg_111", // #111
  "sg_112", // #112
  "sg_113", // #113
];

export const saigoB5bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
