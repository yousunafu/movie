// 「旅とお土産の歴史」: ブロック4 = 第8章 + 第9章 (標準時・駅弁・お菓子化・戦後日本)。
// 担当範囲: 台本 docs/tabi-miyage-script-v1.txt の 140〜175行目 (文#139〜#174・36文)。
// motif 名は必ず tb4_ で始める。WobbleDefs の seed はこのファイルでは 700〜799 を使う。
// このファイルを編集してよいのはブロック4担当だけ (共有部品は TabiShared/TabiKits/TabiTravel から import)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, TBadge, ChapterDoor } from "./TabiShared";
import {
  TKP, BritStationBg, SteamLoco, VictorianGent, TimetableSheet,
  MeijiStationBg, EkiUriko, Ekiben, KashiBox, GendaiBg, ModernTraveler,
  PaperBag, OfudaTag, ShinmeiTorii, OnsenBg,
} from "./TabiKits";
import { JetPlane, makeWmap, TABI_JMAP, WorldMapCard } from "./TabiTravel";
import { MapPin, DashArc } from "./Jihanki2000Scenes";

// ===== 小ヘルパー =====
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ===== 画面の額縁 (WatashiB1 と同じ流儀: svg + wobble + バッジ + 上部キャプション) =====
const Frame: React.FC<{
  f: number; seed: number; caption?: string; capX?: number; capY?: number;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, capX = 960, capY = 170, over, children }) => (
  <AbsoluteFill style={{ background: KRP.cream, fontFamily: FONT }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={capX} y={capY} text={caption} centerX size={36} />}
    <TBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 白札 (svg内で使う小さな名札。pop で出す) =====
const TagPlate: React.FC<{
  x: number; y: number; text: string; t?: number; size?: number; color?: string;
}> = ({ x, y, text, t = 1, size = 34, color = KRP.ink }) => {
  if (t <= 0) return null;
  const p = pop(clamp01(t));
  const w = text.length * size + 44;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <rect x={-w / 2} y={-size * 0.8 - 14} width={w} height={size * 1.6 + 16} rx={10}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <text x={0} y={size * 0.4} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ===== 放射バースト (登場の気合い) =====
const Burst: React.FC<{ x: number; y: number; t: number; r?: number; color?: string }> = ({
  x, y, t, r = 170, color = KRP.orange,
}) => {
  if (t <= 0 || t >= 1) return null;
  const e = easeOut(clamp01(t));
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - e}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r1 = r * (0.45 + e * 0.55);
        const r2 = r1 + r * 0.3 * (1 - e);
        return (
          <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
            x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
            stroke={color} strokeWidth={8} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

// ===== 吹き出し (svg内) =====
const Bubble: React.FC<{
  x: number; y: number; text: string; t?: number; size?: number; tail?: [number, number];
}> = ({ x, y, text, t = 1, size = 40, tail = [40, 90] }) => {
  if (t <= 0) return null;
  const p = pop(clamp01(t));
  const w = text.length * size + 64;
  const h = size * 1.9;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <polygon points={`0,${h / 2 - 6} ${tail[0]},${tail[1]} ${tail[0] * 0.4},${h / 2 - 6}`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={KRP.ink}>{text}</text>
    </g>
  );
};

// ===== 針の角度を指定できる時計 (StationClock は針が回り続けるので、止まった時刻用にこちら) =====
const ClockFace: React.FC<{
  x: number; y: number; s?: number; hourDeg: number; minDeg: number;
}> = ({ x, y, s = 1, hourDeg, minDeg }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={0} r={84} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
    <circle cx={0} cy={0} r={68} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={0} y1={-60} x2={0} y2={-48} transform={`rotate(${i * 30})`}
        stroke={KRP.ink} strokeWidth={4.5} />
    ))}
    <line x1={0} y1={10} x2={0} y2={-36} transform={`rotate(${hourDeg})`}
      stroke={KRP.ink} strokeWidth={6.5} strokeLinecap="round" />
    <line x1={0} y1={8} x2={0} y2={-52} transform={`rotate(${minDeg})`}
      stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    <circle cx={0} cy={0} r={6} fill={KRP.ink} />
  </g>
);

// ===== 太陽 =====
const Sun: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${(f / 4) % 360})`}>
    {Array.from({ length: 10 }, (_, i) => (
      <line key={i} x1={0} y1={-66} x2={0} y2={-88} transform={`rotate(${i * 36})`}
        stroke={KRP.orange} strokeWidth={8} strokeLinecap="round" />
    ))}
    <circle cx={0} cy={0} r={52} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
  </g>
);

// ===== ハート =====
const HeartS: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({
  x, y, s = 1, opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M 0 30 C -44 -4 -36 -40 -13 -40 C -3 -40 0 -28 0 -24 C 0 -28 3 -40 13 -40 C 36 -40 44 -4 0 30 Z"
      fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ===== キラキラ (4角星) =====
const SparkleS: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({
  x, y, s = 1, opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M 0 -26 Q 5 -5 26 0 Q 5 5 0 26 Q -5 5 -26 0 Q -5 -5 0 -26 Z"
      fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// ===== 星条旗 (13本縞 + 青地に星。国旗は丁寧に描く) =====
const USFlag: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const fw = 300; const fh = 196;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f / 21) * 1.6})`}>
      {/* ポール */}
      <line x1={-fw / 2 - 10} y1={-fh / 2 - 18} x2={-fw / 2 - 10} y2={fh / 2 + 150}
        stroke={TKP.woodDark} strokeWidth={12} strokeLinecap="round" />
      <circle cx={-fw / 2 - 10} cy={-fh / 2 - 22} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={-fw / 2} y={-fh / 2 + i * (fh / 6.5)} width={fw} height={fh / 13} fill={KRP.red} opacity={0.9} />
      ))}
      <rect x={-fw / 2} y={-fh / 2} width={fw * 0.42} height={fh * 7 / 13} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 15 }, (_, i) => (
        <circle key={i} cx={-fw / 2 + 14 + (i % 5) * 24} cy={-fh / 2 + 13 + Math.floor(i / 5) * 32}
          r={4.5} fill={KRP.white} />
      ))}
      <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh} fill="none" stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// ===== 日の丸 =====
const HinomaruFlag: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f / 23) * 1.4})`}>
    <line x1={-160} y1={-116} x2={-160} y2={250} stroke={TKP.woodDark} strokeWidth={12} strokeLinecap="round" />
    <circle cx={-160} cy={-120} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-150} y={-100} width={300} height={200} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={0} cy={0} r={58} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// ===== 小さな客車列車 (基準合わせの象徴・口実路線図用) =====
const MiniTrain: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-96} y={-66} width={192} height={56} rx={14} fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
    {[-62, -10, 42].map((wx, i) => (
      <rect key={i} x={wx} y={-54} width={30} height={26} rx={5} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
    {[-56, 0, 56].map((cx, i) => (
      <g key={i} transform={`translate(${cx} -4)`}>
        <circle cx={0} cy={0} r={13} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={-9} y1={0} x2={9} y2={0} transform={`rotate(${(f * 7) % 360})`} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
  </g>
);

// ===== フェニックス (宮崎の椰子) =====
const PalmTree: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -14 0 Q -6 -120 2 -200 L 22 -198 Q 16 -120 18 0 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    {[-150, -105, -60, 60, 105, 150].map((a, i) => (
      <path key={i}
        d="M 0 0 Q 60 -34 128 -16 Q 66 -6 10 14 Z"
        transform={`translate(12 -200) rotate(${a + 90 + Math.sin((f + i * 9) / 19) * 3})`}
        fill={TKP.pine} stroke={KRP.ink} strokeWidth={4.5} />
    ))}
    <circle cx={12} cy={-200} r={12} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// ===== 観光バス (横向き・右向き) =====
const Bus: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-190} y={-150} width={380} height={128} rx={22} fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-190} y={-96} width={380} height={18} fill={KRP.white} opacity={0.85} />
    {[-160, -96, -32, 32, 96].map((wx, i) => (
      <rect key={i} x={wx} y={-136} width={46} height={34} rx={7} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    ))}
    <rect x={150} y={-136} width={36} height={60} rx={7} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    {[-110, 110].map((cx, i) => (
      <g key={i} transform={`translate(${cx} -16)`}>
        <circle cx={0} cy={0} r={26} fill={KRP.ink} />
        <circle cx={0} cy={0} r={12} fill={KRP.silver} transform={`rotate(${(f * 8) % 360})`} />
        <line x1={-10} y1={0} x2={10} y2={0} transform={`rotate(${(f * 8) % 360})`} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ))}
  </g>
);

// ===== 開いた菓子箱 (TabiKits の KashiBox open 版をこの回用に作り直したもの) =====
// 共通キットの open 版は個包装 (幅44 + 両耳7) が箱の右壁 (x=130) をはみ出していたので、
// 箱の幅を 260→340 に広げ、個包装8個がすべて内側に収まるよう置き直した。
// 個包装 (幅44 + 両耳7) を 4個 x 2段。箱の内寸 x=-164〜164 の中央に揃えてある。
const KASHI_PACKS: [number, number][] = [
  [-115, -32], [-53, -32], [9, -32], [71, -32],
  [-115, 8], [-53, 8], [9, 8], [71, 8],
];
const KashiBoxOpenFit: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wobble)">
    {/* 箱: 内寸 x=-164〜164。個包装は最大でも x=140 までなので余白が残る */}
    <rect x={-170} y={-54} width={340} height={118} rx={8}
      fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
    {/* 赤い掛け紙 (ふた) */}
    <path d="M -170 -54 L -192 -118 L 192 -118 L 170 -54" fill={KRP.red} opacity={0.88}
      stroke={KRP.ink} strokeWidth={5.5} />
    {KASHI_PACKS.map(([px, py], i) => (
      <g key={i} transform={`translate(${px} ${py})`}>
        <rect x={0} y={0} width={44} height={30} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 0 6 L -7 0 L 0 -4 M 44 6 L 51 0 L 44 -4" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
      </g>
    ))}
  </g>
);

// ===== エッフェル塔 (格子のシルエット) =====
const Eiffel: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round">
    <path d="M -130 0 Q -36 -180 -26 -330 L -10 -460 L 0 -520 L 10 -460 L 26 -330 Q 36 -180 130 0" />
    <path d="M -84 -120 Q 0 -160 84 -120" />
    <path d="M -40 -300 L 40 -300" />
    <path d="M -130 0 Q 0 -90 130 0" />
    <line x1={0} y1={-520} x2={0} y2={-560} />
    <g strokeWidth={3.5} opacity={0.6}>
      <line x1={-96} y1={-60} x2={60} y2={-120} />
      <line x1={96} y1={-60} x2={-60} y2={-120} />
      <line x1={-34} y1={-320} x2={30} y2={-420} />
      <line x1={34} y1={-320} x2={-30} y2={-420} />
    </g>
  </g>
);

// =====================================================================
// ヨーロッパの名所 (#170 の値札シーン用・色つき)。
// どれも「足元 = (0,0)」で、上へ伸びる向き (y がマイナス) に描いてある。
// 色は TKP に足さず、この回だけのローカル const にしてある。
// =====================================================================
const EU_IRON = "#9A7B52";     // エッフェル塔の鉄骨 (茶色の塗装)
const EU_IRON_DK = "#7B5F3C";
const EU_DARK = "#4A443C";     // アーチや窓の奥の暗がり
const EU_GLASS = "#BFD6E6";    // 窓ガラス

// エッフェル塔 (パリ) — 4本脚 + 脚のアーチ + 3段の展望台 + アンテナ
const LmEiffel: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 左右の脚 (下が広がる) */}
    <path d="M -86 0 Q -62 -66 -30 -126 L -14 -126 Q -40 -66 -50 0 Z"
      fill={EU_IRON} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M 86 0 Q 62 -66 30 -126 L 14 -126 Q 40 -66 50 0 Z"
      fill={EU_IRON} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 脚をつなぐ有名なアーチ */}
    <path d="M -48 -6 Q 0 -104 48 -6" fill="none" stroke={EU_IRON_DK} strokeWidth={10} />
    <path d="M -48 -6 Q 0 -104 48 -6" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
    {/* 第1展望台 */}
    <rect x={-84} y={-144} width={168} height={18} rx={3} fill={EU_IRON_DK} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 中段の塔身 */}
    <path d="M -30 -144 Q -23 -200 -17 -262 L 17 -262 Q 23 -200 30 -144 Z"
      fill={EU_IRON} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 第2展望台 */}
    <rect x={-44} y={-278} width={88} height={16} rx={3} fill={EU_IRON_DK} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 上段の塔身 */}
    <path d="M -17 -278 L -8 -358 L 8 -358 L 17 -278 Z" fill={EU_IRON} stroke={KRP.ink} strokeWidth={4} />
    {/* 第3展望台 + 頂部 */}
    <rect x={-21} y={-372} width={42} height={14} rx={3} fill={EU_IRON_DK} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -8 -372 L -4 -398 L 4 -398 L 8 -372 Z" fill={EU_IRON} stroke={KRP.ink} strokeWidth={3.5} />
    <line x1={0} y1={-398} x2={0} y2={-426} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    {/* 鉄骨のすじ */}
    <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
      <line x1={-74} y1={-30} x2={-34} y2={-110} />
      <line x1={74} y1={-30} x2={34} y2={-110} />
      <line x1={-26} y1={-160} x2={24} y2={-250} />
      <line x1={26} y1={-160} x2={-24} y2={-250} />
    </g>
  </g>
);

// 凱旋門 (パリ) — 石造りの門 + 大アーチ + 浮き彫りのパネル
const LmArc: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-82} y={-212} width={164} height={212} fill={TKP.marble} stroke={KRP.ink} strokeWidth={5.5} />
    {/* 屋上の段 */}
    <rect x={-90} y={-236} width={180} height={26} rx={4} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5.5} />
    {/* 大アーチ */}
    <path d="M -38 0 L -38 -108 Q 0 -158 38 -108 L 38 0 Z" fill={EU_DARK} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 両脇の小アーチ */}
    <path d="M -72 0 L -72 -44 Q -60 -64 -48 -44 L -48 0 Z" fill={EU_DARK} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 48 0 L 48 -44 Q 60 -64 72 -44 L 72 0 Z" fill={EU_DARK} stroke={KRP.ink} strokeWidth={4} />
    {/* 浮き彫り */}
    <rect x={-70} y={-198} width={40} height={54} rx={4} fill={TKP.stone} stroke={KRP.ink} strokeWidth={3.5} />
    <rect x={30} y={-198} width={40} height={54} rx={4} fill={TKP.stone} stroke={KRP.ink} strokeWidth={3.5} />
    <line x1={-82} y1={-130} x2={82} y2={-130} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
  </g>
);

// オランダの風車 — 煉瓦色の塔 + まわる4枚羽根
const LmWindmill: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -58 0 L -38 -176 L 38 -176 L 58 0 Z" fill={TKP.brick} stroke={KRP.ink} strokeWidth={5.5} />
    <line x1={-52} y1={-50} x2={52} y2={-50} stroke={TKP.brickDark} strokeWidth={4} opacity={0.75} />
    <line x1={-45} y1={-108} x2={45} y2={-108} stroke={TKP.brickDark} strokeWidth={4} opacity={0.75} />
    {/* 帽子 */}
    <path d="M -46 -176 Q 0 -224 46 -176 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 扉と窓 */}
    <rect x={-16} y={-58} width={32} height={58} rx={4} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-13} y={-134} width={26} height={26} rx={3} fill={EU_GLASS} stroke={KRP.ink} strokeWidth={3.5} />
    {/* 羽根 */}
    <g transform={`translate(0 -196) rotate(${f * 1.6})`}>
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <rect x={-7} y={-96} width={14} height={90} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-92} x2={0} y2={-12} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        </g>
      ))}
    </g>
    <circle cx={0} cy={-196} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// ビッグベン (ロンドン・国会議事堂の時計塔) — 文字盤 + 鐘楼 + 尖塔
const LmBigBen: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 塔身 */}
    <path d="M -44 0 L -38 -296 L 38 -296 L 44 0 Z" fill={TKP.caminoGold} stroke={KRP.ink} strokeWidth={5.5} />
    <line x1={-18} y1={-12} x2={-16} y2={-290} stroke={KRP.ink} strokeWidth={3} opacity={0.28} />
    <line x1={18} y1={-12} x2={16} y2={-290} stroke={KRP.ink} strokeWidth={3} opacity={0.28} />
    {/* 縦に並ぶ窓 */}
    {[-72, -148, -224].map((wy) => (
      <path key={wy} d={`M -11 ${wy} L -11 ${wy - 26} Q 0 ${wy - 40} 11 ${wy - 26} L 11 ${wy} Z`}
        fill={EU_GLASS} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
    {/* 時計の段 */}
    <rect x={-52} y={-372} width={104} height={78} rx={5} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5.5} />
    <circle cx={0} cy={-333} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={0} cy={-333} r={23} fill="none" stroke={KRP.brass} strokeWidth={4} />
    <line x1={0} y1={-333} x2={0} y2={-354} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    <line x1={0} y1={-333} x2={16} y2={-325} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    {/* 鐘楼 (すかし) */}
    <rect x={-42} y={-430} width={84} height={58} rx={4} fill={TKP.caminoGold} stroke={KRP.ink} strokeWidth={5} />
    {[-24, 0, 24].map((lx) => (
      <path key={lx} d={`M ${lx - 8} -382 L ${lx - 8} -410 Q ${lx} -424 ${lx + 8} -410 L ${lx + 8} -382 Z`}
        fill={EU_DARK} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
    {/* 尖塔 */}
    <path d="M -46 -430 L 0 -518 L 46 -430 Z" fill={TKP.brick} stroke={KRP.ink} strokeWidth={5.5} />
    <line x1={0} y1={-518} x2={0} y2={-540} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    <circle cx={0} cy={-546} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// コロッセオ (ローマ) — 3段のアーチ + 右半分が崩れた外壁
const COLO_X = [-85, -51, -17, 17, 51, 85];
const LmColosseum: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 外壁。左2/3が高く、右1/3は崩れて低い */}
    <path d="M -108 0 L -108 -196 Q -108 -224 -66 -231 Q -16 -237 24 -228 L 24 -148 Q 66 -156 108 -146 L 108 0 Z"
      fill={TKP.marble} stroke={KRP.ink} strokeWidth={5.5} />
    {/* 1段目 */}
    {COLO_X.map((ax) => (
      <path key={`a${ax}`} d={`M ${ax - 12} 0 L ${ax - 12} -44 Q ${ax} -70 ${ax + 12} -44 L ${ax + 12} 0 Z`}
        fill={EU_DARK} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
    {/* 2段目 */}
    {COLO_X.map((ax) => (
      <path key={`b${ax}`} d={`M ${ax - 12} -88 L ${ax - 12} -118 Q ${ax} -142 ${ax + 12} -118 L ${ax + 12} -88 Z`}
        fill={EU_DARK} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
    {/* 3段目 (高い部分だけ) */}
    {[-85, -51, -17].map((ax) => (
      <path key={`c${ax}`} d={`M ${ax - 12} -158 L ${ax - 12} -188 Q ${ax} -212 ${ax + 12} -188 L ${ax + 12} -158 Z`}
        fill={EU_DARK} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
    {/* 段の境目 */}
    <line x1={-106} y1={-78} x2={106} y2={-78} stroke={TKP.stone} strokeWidth={5} />
    <line x1={-106} y1={-150} x2={22} y2={-150} stroke={TKP.stone} strokeWidth={5} />
  </g>
);

// ピサの斜塔 (イタリア) — 大理石の円筒 + 回廊 + 傾き
const LmPisa: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform="rotate(-6)">
      <rect x={-40} y={-282} width={80} height={282} fill={TKP.marble} stroke={KRP.ink} strokeWidth={5.5} />
      {[-46, -92, -138, -184, -230].map((ry) => (
        <g key={ry}>
          <rect x={-40} y={ry} width={80} height={10} fill={TKP.stone} stroke={KRP.ink} strokeWidth={3} />
          {[-30, -15, 0, 15, 30].map((cx2) => (
            <line key={cx2} x1={cx2} y1={ry + 10} x2={cx2} y2={ry + 38}
              stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
          ))}
        </g>
      ))}
      {/* 最上部の鐘楼 */}
      <rect x={-30} y={-324} width={60} height={44} rx={4} fill={TKP.stone} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -13 -284 L -13 -304 Q 0 -316 13 -304 L 13 -284 Z" fill={EU_DARK} stroke={KRP.ink} strokeWidth={3.5} />
      {/* 入口 */}
      <path d="M -13 0 L -13 -26 Q 0 -40 13 -26 L 13 0 Z" fill={EU_DARK} stroke={KRP.ink} strokeWidth={4} />
    </g>
  </g>
);

// ===== 洋酒瓶・チョコ箱・スカーフ (戦後みやげ3点) =====
const WhiskyBottle: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-12} y={-150} width={24} height={34} rx={5} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -20 -118 L -44 -74 L -44 96 Q -44 112 -28 112 L 28 112 Q 44 112 44 96 L 44 -74 L 20 -118 Z"
      fill={KRP.copper} opacity={0.92} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={-32} y={-30} width={64} height={78} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>洋酒</text>
  </g>
);
const ChocoBox: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-104} y={-62} width={208} height={124} rx={10} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={-104} y={-62} width={208} height={38} rx={10} fill={KRP.red} opacity={0.85} stroke={KRP.ink} strokeWidth={4.5} />
    {[[-72, 8], [-24, 8], [24, 8], [72, 8]].map(([px], i) => (
      <rect key={i} x={(px as number) - 18} y={-4} width={36} height={44} rx={6}
        fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
  </g>
);
const Scarf: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -130 ${Math.sin(f / 12) * 6} Q -65 ${-60 + Math.sin(f / 10) * 8} 0 ${Math.sin((f + 8) / 12) * 6} Q 65 ${60 + Math.sin(f / 11) * 8} 130 ${Math.sin((f + 16) / 12) * 6} L 130 ${40 + Math.sin((f + 16) / 12) * 6} Q 65 ${100 + Math.sin(f / 11) * 8} 0 ${40 + Math.sin((f + 8) / 12) * 6} Q -65 ${-20 + Math.sin(f / 10) * 8} -130 ${40 + Math.sin(f / 12) * 6} Z`}
      fill={KRP.yellow} opacity={0.92} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={-40} cy={10} r={9} fill="none" stroke={KRP.red} strokeWidth={4} />
    <circle cx={46} cy={40} r={9} fill="none" stroke={KRP.red} strokeWidth={4} />
  </g>
);

// ===== 赤福の色 (こしあんの赤黒い茶色)。TKP には足さずここだけで使う =====
const AKAFUKU_ANKO = "#52362A";    // あん本体
const AKAFUKU_ANKO_DK = "#3E2820"; // 指で押した筋の影
const AKAFUKU_ANKO_LT = "#6B4635"; // 筋の山のハイライト
const AKAFUKU_MOCHI = "#F6F1E6";   // 下からのぞく白い餅

// ===== 温泉まんじゅう (茶色い皮 + 白い腰) =====
const Manju: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -62 10 Q -62 -46 0 -46 Q 62 -46 62 10 Z" fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M -62 10 Q 0 24 62 10 L 62 16 Q 0 32 -62 16 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -24 -30 Q 0 -38 24 -30" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
  </g>
);

// ===== 日本地図の窓 (東京⇄宮崎用)。makeWmap で座標化 =====
const JM = makeWmap(127.5, 145.8, 30, 42, 460, 120, 1000, 800);
const EDO_XY: [number, number] = [JM.X(TABI_JMAP.edo[0]), JM.Y(TABI_JMAP.edo[1])];
const MYZ_XY: [number, number] = [JM.X(TABI_JMAP.miyazaki[0]), JM.Y(TABI_JMAP.miyazaki[1])];
const JMapCard: React.FC<{ clipId: string; children?: React.ReactNode }> = ({ clipId, children }) => (
  <WorldMapCard lonMin={127.5} lonMax={145.8} latMin={30} latMax={42}
    x={460} y={120} w={1000} h={800} clipId={clipId}>
    {children}
  </WorldMapCard>
);
// 地図上の地名 (白フチ文字)
const MapName: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 36 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size}
    fill={KRP.ink} stroke={KRP.white} strokeWidth={8} paintOrder="stroke">{text}</text>
);

// =====================================================================
// 新婚カップルの部品 (#166「3組に1組」用)
// Person は編集できないので、上から重ね描きして「服を着せる」。
//  - 男性: 短髪 (hair="cap") + 上着の打ち合わせ + 色つきネクタイ + ズボン
//  - 女性: 長い髪 (ボブ/まとめ髪) + 丸襟 + ベルト + ひろがるスカート + 明るい色
// 座標はすべて Person のローカル系 (足元が原点。頭 cy=-228 / 胴 -160〜-52 / 脚 -58〜-6)。
// =====================================================================

// 男性の胸もと: 白シャツのV + ネクタイ + ポケットチーフ
const SuitFront: React.FC<{ tie: string; shirt?: string }> = ({ tie, shirt = KRP.white }) => (
  <g>
    <path d="M -30 -161 L 0 -110 L 30 -161 Z" fill={shirt} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    {/* 上着のラペル (襟) */}
    <path d="M -30 -161 L -10 -124 L -26 -118 Z" fill={KRP.ink} opacity={0.45} />
    <path d="M 30 -161 L 10 -124 L 26 -118 Z" fill={KRP.ink} opacity={0.45} />
    {/* ネクタイ: 結び目 + 剣先 */}
    <path d="M -11 -134 L 11 -134 L 14 -122 L 0 -110 L -14 -122 Z" fill={tie} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 0 -110 L 11 -102 L 5 -64 L -5 -64 L -11 -102 Z" fill={tie} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
    {/* ポケットチーフ */}
    <rect x={21} y={-141} width={20} height={10} fill={shirt} stroke={KRP.ink} strokeWidth={2.5} />
  </g>
);

// 女性のスカート (ひろがる裾。靴が見えるよう裾は y=-22 どまり)
const FlareSkirt: React.FC<{ color: string; belt?: string; wide?: number }> = ({ color, belt, wide = 80 }) => (
  <g>
    <path d={`M -52 -78 L 52 -78 L ${wide} -24 Q 0 -10 ${-wide} -24 Z`}
      fill={color} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    {belt && <rect x={-55} y={-88} width={110} height={16} rx={8} fill={belt} stroke={KRP.ink} strokeWidth={3.5} />}
  </g>
);

// Person の胸ポケット (x18..44 / y-138..-118) を塗りつぶして消すあて布。
// ふだんの人物では「シャツの胸ポケット」として正しいが、ウエディングドレスには付かないので隠す。
const PocketPatch: React.FC<{ color: string }> = ({ color }) => (
  <rect x={14} y={-142} width={34} height={28} fill={color} />
);

// ウエディングドレスのハートカットの胸元。白い胴体がのっぺりしないよう線だけ入れる
const SweetheartNeck: React.FC = () => (
  <g fill="none" stroke={KRP.ink} strokeLinecap="round">
    <path d="M -36 -160 Q -34 -130 -17 -134 Q 0 -138 17 -134 Q 34 -130 36 -160"
      strokeWidth={4} opacity={0.55} />
    {/* 身ごろの縦の切り替え */}
    <path d="M -20 -130 L -22 -92" strokeWidth={3} opacity={0.3} />
    <path d="M 20 -130 L 22 -92" strokeWidth={3} opacity={0.3} />
  </g>
);

// 女性の丸襟 (ピーターパンカラー)
const RoundCollar: React.FC<{ color?: string }> = ({ color = KRP.white }) => (
  <path d="M -31 -159 Q -17 -124 0 -124 Q 17 -124 31 -159" fill={color}
    stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
);

// 女性のボブヘア (前髪 + 耳の横に下りる毛)
const BobHair: React.FC<{ color?: string }> = ({ color = KRP.ink }) => (
  <path d="M -67 -230 Q -71 -299 0 -301 Q 71 -299 67 -230 L 67 -186 Q 57 -202 52 -232 Q 27 -259 0 -259 Q -27 -259 -52 -232 Q -57 -202 -67 -186 Z"
    fill={color} />
);

// 女性のまとめ髪 (和装用。横におくれ毛 + 後ろでまとめた髷 + かんざし)
const UpdoHair: React.FC<{ color?: string; kanzashi?: string }> = ({ color = KRP.ink, kanzashi = KRP.red }) => (
  <g>
    {/* 耳の横に下りるおくれ毛 (長い髪に見せる) */}
    <path d="M -64 -246 Q -76 -214 -67 -184 L -49 -191 Q -57 -216 -52 -244 Z" fill={color} />
    <path d="M 64 -246 Q 76 -214 67 -184 L 49 -191 Q 57 -216 52 -244 Z" fill={color} />
    {/* 前髪と頭頂 */}
    <path d="M -64 -236 Q -66 -296 0 -298 Q 66 -296 64 -236 Q 30 -262 0 -262 Q -30 -262 -64 -236 Z" fill={color} />
    {/* 髷 (頭にのるくらいの小ぶり) */}
    <ellipse cx={0} cy={-294} rx={30} ry={18} fill={color} stroke={KRP.ink} strokeWidth={3} />
    {/* かんざし (髷に挿した簪。横向きに短く) */}
    <line x1={8} y1={-294} x2={40} y2={-297} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    <circle cx={43} cy={-298} r={7.5} fill={kanzashi} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 和装の前身頃 (白いV襟 + 帯 + 足元まである裾)
const KimonoFront: React.FC<{ color: string; obi: string; hakama?: boolean }> = ({ color, obi, hakama = false }) => (
  <g>
    {/* 裾 (脚を隠して着物に見せる。靴が見えるよう -16 どまり) */}
    <path d={`M -54 -60 L 54 -60 L ${hakama ? 62 : 58} -16 L ${hakama ? -62 : -58} -16 Z`}
      fill={color} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    {/* 白いV襟 */}
    <path d="M -31 -157 L 0 -106 L 31 -157" fill="none" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" />
    <path d="M -31 -157 L 0 -106" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
    {/* 帯 */}
    <rect x={-50} y={-88} width={100} height={26} rx={8} fill={obi} stroke={KRP.ink} strokeWidth={4} />
    {hakama && (
      <g>
        {/* 羽織紐 (細い白の紐と結び目) */}
        <line x1={-26} y1={-118} x2={26} y2={-118} stroke={KRP.white} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M 0 -127 L 9 -118 L 0 -109 L -9 -118 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
    )}
  </g>
);

// 花嫁のベール + ティアラ + ブーケ (#161 tb4_shinkon と同じ形・同じ色)
const BridalVeil: React.FC = () => (
  <g>
    <path d="M -70 -268 Q -96 -180 -84 -96 L -58 -108 Q -72 -190 -54 -258 Z"
      fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 70 -268 Q 96 -180 84 -96 L 58 -108 Q 72 -190 54 -258 Z"
      fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -62 -272 Q 0 -306 62 -272" fill="none" stroke={KRP.ink} strokeWidth={5} />
    {[-34, 0, 34].map((tx, i) => (
      <circle key={i} cx={tx} cy={-286 - (i === 1 ? 10 : 0)} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
    ))}
  </g>
);

const Bouquet: React.FC<{ x?: number; y?: number }> = ({ x = -92, y = -116 }) => (
  <g transform={`translate(${x} ${y})`}>
    {[[-14, -8], [12, -12], [0, 8], [-4, -22], [16, 4]].map(([bx2, by2], i) => (
      <circle key={i} cx={bx2} cy={by2} r={11}
        fill={[KRP.red, KRP.yellow, KRP.orange, KRP.red, KRP.yellow][i]} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
  </g>
);

// 新婚旅行のトランク (色つき。ベルト2本 + 取っ手)
const TravelCase: React.FC<{ x: number; y: number; s?: number; color: string; belt?: string }> = ({
  x, y, s = 1, color, belt = KRP.ink,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -16 -62 Q 0 -88 16 -62" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
    <rect x={-54} y={-62} width={108} height={62} rx={8} fill={color} stroke={KRP.ink} strokeWidth={5} />
    <line x1={-54} y1={-36} x2={54} y2={-36} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
    <rect x={-30} y={-62} width={13} height={62} fill={belt} opacity={0.8} stroke={KRP.ink} strokeWidth={2.5} />
    <rect x={17} y={-62} width={13} height={62} fill={belt} opacity={0.8} stroke={KRP.ink} strokeWidth={2.5} />
  </g>
);

// =====================================================================
// シーン本体 (1 motif = 1 関数)。アクションは f=0〜90 で完結 → あとは待機ゆれ
// =====================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {

  // #139 第8章の扉: 回る駅時計 + 走り込む蒸気機関車
  tb4_ch8_door: (f) => {
    const locoX = lerp(-360, 560, easeOut(seg(f, 0, 55)));
    const clockT = pop(seg(f, 6, 34));
    return (
      <Frame f={f} seed={700} over={<ChapterDoor num={8} title="鉄道が名物を作る" t={seg(f, 12, 42)} />}>
        {/* 線路 */}
        <line x1={-20} y1={1000} x2={W + 20} y2={1000} stroke={TKP.iron} strokeWidth={10} />
        <line x1={-20} y1={1028} x2={W + 20} y2={1028} stroke={TKP.iron} strokeWidth={10} />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={-10 + i * 158} y={1006} width={70} height={14} rx={4}
            fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
        ))}
        {/* 回り続ける駅時計 (時代が鉄道の時間で回り出す) */}
        <g transform={`translate(480 380) scale(${clockT * 2.3})`}>
          <circle cx={0} cy={0} r={84} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={0} cy={0} r={68} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-60} x2={0} y2={-48} transform={`rotate(${i * 30})`}
              stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          <line x1={0} y1={10} x2={0} y2={-36} transform={`rotate(${(f * 2.4) % 360})`}
            stroke={KRP.ink} strokeWidth={6.5} strokeLinecap="round" />
          <line x1={0} y1={8} x2={0} y2={-52} transform={`rotate(${(f * 7) % 360})`}
            stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
          <circle cx={0} cy={0} r={6} fill={KRP.ink} />
        </g>
        <SteamLoco x={locoX} y={930} s={1.0} f={f} />
      </Frame>
    );
  },

  // #140 1839年・世界初の時刻表: 英国駅 + 紳士 + 時刻表ドン
  tb4_timetable_1839: (f) => (
    <Frame f={f} seed={701}
      over={f >= 40 ? <Stamp x={1280} y={260} text="1839" size={74} /> : undefined}>
      <BritStationBg f={f} />
      <SteamLoco x={1520} y={880} s={0.85} f={f} run={false} />
      <VictorianGent x={470} y={930} s={1.05} f={f} gaze={[5, -4]} face="smile" />
      <TimetableSheet x={880} y={480} s={pop(seg(f, 15, 45)) * 1.9} />
      <Burst x={880} y={480} t={seg(f, 42, 72)} r={300} color={KRP.yellow} />
    </Frame>
  ),

  // #141 町ごとにバラバラの時計台 (3本・違う時刻・ゆれる？)
  tb4_machi_barabara: (f) => (
    <Frame f={f} seed={702} caption="時計は町まかせ">
      {[
        { x: 420, hd: 300, md: 80, ph: 0 },
        { x: 960, hd: 55, md: 210, ph: 1 },
        { x: 1500, hd: 160, md: 330, ph: 2 },
      ].map((c, i) => {
        const t = pop(seg(f, 8 + i * 12, 36 + i * 12));
        const qt = pop(seg(f, 46 + i * 6, 60 + i * 6));
        return (
          <g key={i}>
            {/* 塔 */}
            <g transform={`translate(${c.x} 0) scale(${t})`} opacity={t > 0 ? 1 : 0}>
              <rect x={-70} y={470} width={140} height={400} fill={TKP.stone} stroke={KRP.ink} strokeWidth={6}
                transform={`translate(${c.x * 0} 0)`} />
              <path d="M -86 470 L 0 400 L 86 470 Z" fill={TKP.brick} stroke={KRP.ink} strokeWidth={5.5} />
            </g>
            <g transform={`translate(${c.x} ${560 + bobOf(f, c.ph)}) scale(${t})`}>
              <ClockFace x={0} y={0} s={1.05} hourDeg={c.hd} minDeg={c.md} />
            </g>
            {/* ？がゆれる */}
            <text x={c.x} y={340} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96}
              fill={KRP.red} opacity={qt}
              transform={`rotate(${Math.sin((f + i * 20) / 9) * 9} ${c.x} 340)`}>？</text>
          </g>
        );
      })}
      {/* 地面 */}
      <line x1={-20} y1={872} x2={W + 20} y2={872} stroke={KRP.ink} strokeWidth={6} opacity={0.5} />
    </Frame>
  ),

  // #142 太陽まかせの時刻: 太陽が空を渡り、2軒の町で正午がずれる
  tb4_taiyo_jikoku: (f) => {
    const u = (f % 150) / 150;
    const sx = lerp(260, 1660, u);
    const sy = 400 - Math.sin(u * Math.PI) * 240;
    const house = (hx: number, hd: number, md: number, ph: number) => (
      <g>
        <rect x={hx - 130} y={640} width={260} height={190} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${hx - 160} 640 L ${hx} 540 L ${hx + 160} 640 Z`} fill={TKP.brick} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`translate(${hx} ${730 + bobOf(f, ph)})`}>
          <ClockFace x={0} y={0} s={0.72} hourDeg={hd} minDeg={md} />
        </g>
      </g>
    );
    return (
      <Frame f={f} seed={703}>
        <Sun x={sx} y={sy} s={1.1} f={f} />
        {/* 太陽からの点線 */}
        <line x1={sx} y1={sy + 70} x2={560} y2={600} stroke={KRP.orange} strokeWidth={5}
          strokeDasharray="14 14" opacity={0.7} />
        <line x1={sx} y1={sy + 70} x2={1360} y2={600} stroke={KRP.orange} strokeWidth={5}
          strokeDasharray="14 14" opacity={0.7} />
        {house(560, 0, 0, 0)}
        {house(1360, -32, -160, 1)}
        {/* ずれの両矢印 */}
        <g opacity={pop(seg(f, 40, 58))}>
          <line x1={760} y1={730} x2={1160} y2={730} stroke={KRP.red} strokeWidth={8} />
          <path d="M 760 730 l 26 -14 l 0 28 Z" fill={KRP.red} />
          <path d="M 1160 730 l -26 -14 l 0 28 Z" fill={KRP.red} />
          <text x={960} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={56} fill={KRP.red}>ずれ</text>
        </g>
        <line x1={-20} y1={872} x2={W + 20} y2={872} stroke={KRP.ink} strokeWidth={6} opacity={0.5} />
      </Frame>
    );
  },

  // #143 バラバラ時刻では時刻表が組めない: ✗が描かれ紳士が困る
  tb4_jikokuhyo_dame: (f) => {
    const x1 = seg(f, 28, 42);
    const x2 = seg(f, 42, 56);
    return (
      <Frame f={f} seed={704}>
        <TimetableSheet x={760} y={480} s={1.75} />
        {/* ずれた時計2つ */}
        <ClockFace x={360} y={300} s={0.62} hourDeg={20} minDeg={120} />
        <ClockFace x={360} y={560} s={0.62} hourDeg={310} minDeg={-80} />
        <text x={360} y={444} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.red}>≠</text>
        {/* 大きな✗が描かれる */}
        <g stroke={KRP.red} strokeWidth={26} strokeLinecap="round" opacity={0.92}>
          {x1 > 0 && <line x1={540} y1={250} x2={lerp(540, 990, x1)} y2={lerp(250, 710, x1)} />}
          {x2 > 0 && <line x1={990} y1={250} x2={lerp(990, 540, x2)} y2={lerp(250, 710, x2)} />}
        </g>
        <VictorianGent x={1430} y={860} s={1.15} f={f} face="worried" gaze={[-5, -3]} />
        {/* 汗 */}
        <g opacity={0.85}>
          <path d={`M ${1530} ${520 + ((f * 3) % 40)} q 10 14 0 24 q -10 -10 0 -24 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M ${1340} ${540 + ((f * 3 + 20) % 40)} q 10 14 0 24 q -10 -10 0 -24 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </Frame>
    );
  },

  // #144 大仕掛け: バラバラの針が「鉄道の時間」にそろう
  tb4_soroeru: (f) => {
    const e = easeOut(seg(f, 25, 55));
    const inits: Array<[number, number]> = [[-75, -200], [30, 140], [80, 300]];
    const lineT = easeOut(seg(f, 8, 30));
    const trainX = lerp(-240, 2140, ((f + 40) % 230) / 230);
    return (
      <Frame f={f} seed={705} caption="基準は鉄道の時間">
        {/* 時計をつなぐ点線 */}
        <line x1={420} y1={400} x2={lerp(420, 1500, lineT)} y2={400}
          stroke={KRP.blueDeep} strokeWidth={7} strokeDasharray="18 14" opacity={0.8} />
        {inits.map(([hd, md], i) => {
          const x = 420 + i * 540;
          return (
            <g key={i}>
              <g transform={`translate(${x} ${400 + bobOf(f, i)})`}>
                <ClockFace x={0} y={0} s={1.5} hourDeg={hd * (1 - e)} minDeg={md * (1 - e)} />
              </g>
              <Burst x={x} y={400} t={seg(f, 55 + i * 5, 80 + i * 5)} r={220} color={KRP.yellow} />
            </g>
          );
        })}
        {/* 下を走り抜ける列車 (基準の正体) */}
        <line x1={-20} y1={920} x2={W + 20} y2={920} stroke={TKP.iron} strokeWidth={9} />
        <MiniTrain x={trainX} y={916} s={1.1} f={f} />
      </Frame>
    );
  },

  // #145 1883年アメリカ: 鉄道会社の取り決めで時刻がそろう
  tb4_usa_1883: (f) => {
    const e = easeOut(seg(f, 20, 50));
    return (
      <Frame f={f} seed={706} caption="鉄道会社の取り決め"
        over={f >= 30 ? <Stamp x={1340} y={250} text="1883" size={72} /> : undefined}>
        <USFlag x={430} y={400} s={1.25} f={f} />
        <g transform={`translate(960 ${470 + bobOf(f, 0)})`}>
          <ClockFace x={0} y={0} s={1.9} hourDeg={-40 * (1 - e)} minDeg={-130 * (1 - e)} />
        </g>
        {/* そろった小時計の列 */}
        {[720, 960, 1200].map((x, i) => (
          <g key={i} transform={`translate(${x} 790) scale(${pop(seg(f, 42 + i * 8, 58 + i * 8)) * 0.6})`}>
            <ClockFace x={0} y={0} s={1} hourDeg={0} minDeg={0} />
          </g>
        ))}
        <SteamLoco x={1620} y={900} s={0.78} f={f} />
      </Frame>
    );
  },

  // #146 正午が2回来た日 (Day of Two Noons)。
  // 1883年11月18日、町の時計が新しい標準時より進んでいた町では、いちど正午を迎えてから
  // 針を数分〜十数分「戻した」ので、その日はもう一度正午が来た。
  // → 1つの時計の時間変化として ①正午 → ②針を戻す → ③もう一度正午 と見せる。
  tb4_futatsu_shogo: (f) => {
    // 分針の角度。0度 = 12:00ちょうど。-72度 = 11:48 (12分もどした状態)。
    const BACK = -72;
    let md: number;
    if (f < 22) md = lerp(-66, 0, easeOut(seg(f, 0, 22)));          // ①正午へ近づく
    else if (f < 48) md = 0;                                         // ①正午でいったん止まる
    else if (f < 78) md = lerp(0, BACK, easeOut(seg(f, 48, 78)));    // ②針を戻す
    else md = lerp(BACK, 0, easeOut(seg(f, 84, 116)));               // ③もう一度正午へ
    // 時計の読み (12:00 / 11:5x) を数字でも出すと一目で分かる
    const mm = Math.round(md / 6);                 // 0 または負の分
    const timeText = mm === 0 ? "12:00" : `11:${String(60 + mm).padStart(2, "0")}`;
    const atNoon = mm === 0;
    const phase = f < 48 ? 0 : f < 84 ? 1 : 2;
    const stepText = ["① 1回目の正午", "② 針をもどす", "③ 2回目の正午"][phase];
    const stepColor = [KRP.ink, KRP.orange, KRP.red][phase];
    const ring1 = f >= 22 && f < 46;
    const ring2 = f >= 114 && f < 146;
    const ringing = ring1 || ring2;
    // 正午を知らせる鐘の音 (時計の左右へ広がる弧)
    const bell = ringing ? (
      <g stroke={ring2 ? KRP.red : KRP.orange} strokeWidth={9} fill="none" strokeLinecap="round"
        opacity={0.45 + Math.sin(f / 2) * 0.4}>
        <path d="M 752 380 Q 712 500 752 620" />
        <path d="M 696 342 Q 636 500 696 658" />
        <path d="M 1168 380 Q 1208 500 1168 620" />
        <path d="M 1224 342 Q 1284 500 1224 658" />
      </g>
    ) : null;
    // 「針を戻す」ことを示す、時計の上を左まわり (反時計まわり) に走る太矢印
    const rewind = phase === 1 ? (
      <g opacity={seg(f, 48, 60)}>
        <path d="M 1195 500 A 235 235 0 0 0 725 500" fill="none"
          stroke={KRP.orange} strokeWidth={15} strokeLinecap="round" />
        <path d="M 725 548 l -30 -52 l 60 0 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ) : null;
    return (
      <Frame f={f} seed={707}>
        {/* いまどの段階かの見出し札 (画面上部) */}
        <TagPlate x={960} y={190} text={stepText} t={1} size={44} color={stepColor} />
        {bell}
        {rewind}
        <g transform={`translate(960 ${500 + bobOf(f, 0)})`}>
          <ClockFace x={0} y={0} s={2} hourDeg={md / 12} minDeg={md} />
        </g>
        {/* 時計の読み (数字)。11:48 ←→ 12:00 の往復が数字でも分かる */}
        <g transform="translate(960 730)">
          <rect x={-132} y={-44} width={264} height={88} rx={14}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56}
            fill={atNoon ? KRP.red : KRP.ink}>{timeText}</text>
        </g>
        {/* 正午を迎えた記録 (左=1回目・右=2回目)。「2回来た」ことが絵に残る */}
        {[{ x: 420, t: seg(f, 30, 44), label: "1回目", col: KRP.ink },
        { x: 1500, t: seg(f, 118, 132), label: "2回目", col: KRP.red }].map((r, i) => (
          <g key={i} transform={`translate(${r.x} 540) scale(${pop(clamp01(r.t))})`}>
            <rect x={-132} y={-150} width={264} height={300} rx={18}
              fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
            <g transform="translate(0 -44)">
              <ClockFace x={0} y={0} s={0.9} hourDeg={0} minDeg={0} />
            </g>
            <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42}
              fill={r.col}>{r.label}の</text>
            <text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42}
              fill={r.col}>正午</text>
          </g>
        ))}
        <Burst x={960} y={500} t={seg(f, 114, 142)} r={320} color={KRP.red} />
      </Frame>
    );
  },

  // #147 日本は1886年・勅令でお上から: 日の丸 + 巻物が開く
  tb4_japan_chokurei: (f) => {
    const open = easeOut(seg(f, 15, 45));
    const sh = lerp(70, 430, open);
    return (
      <Frame f={f} seed={708}
        over={f >= 36 ? <Stamp x={1430} y={210} text="1886" size={72} /> : undefined}>
        <HinomaruFlag x={400} y={360} s={1.25} f={f} />
        <g transform={`translate(400 ${760 + bobOf(f, 1)})`}>
          <ClockFace x={0} y={0} s={0.8} hourDeg={0} minDeg={0} />
        </g>
        {/* 勅令の巻物 (上下の軸 + 下へ開く) */}
        <g transform="translate(1140 260)">
          <rect x={-150} y={0} width={300} height={sh} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-170} y={-18} width={340} height={30} rx={15} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-170} y={sh - 10} width={340} height={30} rx={15} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 縦書き「標準時」: 3文字 × 64px = 192px。textAnchor=middle なので y を中心に上下96px 使う。
              巻物の紙面は y=0〜430 なので、y=170 (=74〜266) にすれば上の軸にかからない。 */}
          <text x={0} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64}
            fill={KRP.ink} opacity={seg(f, 40, 52)} style={{ writingMode: "vertical-rl" }}>標準時</text>
          <circle cx={0} cy={sh - 70} r={26} fill="none" stroke={KRP.red} strokeWidth={6}
            opacity={seg(f, 48, 58)} />
          <text x={0} y={sh - 58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28}
            fill={KRP.red} opacity={seg(f, 48, 58)}>勅</text>
        </g>
      </Frame>
    );
  },

  // #148 鉄道がくれたもう1つのもの: 明治の駅 + 布をかけた謎の箱 + ？
  tb4_mou_hitotsu: (f) => {
    const locoX = lerp(-460, 540, easeOut(seg(f, 0, 50)));
    const boxT = pop(seg(f, 30, 50));
    const qT = pop(seg(f, 48, 62));
    return (
      <Frame f={f} seed={709}>
        <MeijiStationBg f={f} />
        <SteamLoco x={locoX} y={975} s={0.95} f={f} />
        {/* 布をかけた箱 (中身はまだ秘密) */}
        <g transform={`translate(1280 860) scale(${boxT})`}>
          <path d="M -150 0 Q -150 -110 -60 -124 Q 0 -150 60 -124 Q 150 -110 150 0 Z"
            fill={KRP.red} opacity={0.88} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -90 -60 Q -60 -90 -20 -70 M 30 -84 Q 70 -80 96 -52" fill="none"
            stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          <circle cx={0} cy={-136} r={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <text x={1280} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150}
          fill={KRP.blueDeep} opacity={qT}
          transform={`rotate(${Math.sin(f / 9) * 7} 1280 620)`}>？</text>
      </Frame>
    );
  },

  // #149 駅弁の誕生: 売り子 + 竹皮包みがドンと登場
  tb4_ekiben_tanjo: (f) => (
    <Frame f={f} seed={710}>
      <MeijiStationBg f={f} />
      <EkiUriko x={620} y={900} s={1.15} f={f} face="smile" gaze={[5, -4]} goods="bento" />
      <g transform={`translate(1310 ${735 + bobOf(f, 2)}) rotate(-5) scale(${pop(seg(f, 18, 46)) * 1.35})`}>
        <Ekiben x={0} y={0} s={1} />
      </g>
      <Burst x={1310} y={735} t={seg(f, 44, 74)} r={240} color={KRP.yellow} />
    </Frame>
  ),

  // #150 1885年・宇都宮駅「説」: 駅名看板へカメラが寄る
  tb4_utsunomiya_setsu: (f) => {
    const sc = 1 + 0.13 * easeOut(seg(f, 10, 65));
    return (
      <Frame f={f} seed={711}
        over={f >= 25 ? <Stamp x={1130} y={230} text="1885 宇都宮駅 説" size={46} /> : undefined}>
        <g transform={`translate(${(1 - sc) * 960} ${(1 - sc) * 395}) scale(${sc})`}>
          <MeijiStationBg f={f} />
          <EkiUriko x={680} y={900} s={1.1} f={f} face="smile" gaze={[4, -5]} goods="bento" />
        </g>
      </Frame>
    );
  },

  // #151 握り飯2個とたくあんで5銭: 開いた駅弁をズーム
  tb4_nigirimeshi: (f) => {
    const sc = 2.3 + 0.5 * easeOut(seg(f, 0, 60));
    return (
      <Frame f={f} seed={712}>
        <Burst x={960} y={560} t={seg(f, 5, 32)} r={380} color={KRP.yellow} />
        <g transform={`translate(960 ${560 + bobOf(f, 0) * 0.6}) scale(${sc})`}>
          <Ekiben x={0} y={0} s={1} open />
        </g>
        {/* ほかほか湯気 */}
        {[800, 1060].map((x, i) => (
          <path key={i}
            d={`M ${x} 420 C ${x - 18 + Math.sin((f + i * 12) / 11) * 12} 360 ${x + 18 + Math.sin((f + i * 20) / 13) * 12} 320 ${x + Math.sin((f + i * 30) / 15) * 16} 250`}
            fill="none" stroke={TKP.steam} strokeWidth={20} strokeLinecap="round" opacity={0.65} />
        ))}
        <TagPlate x={1480} y={350} text="5銭" t={seg(f, 35, 50)} size={56} color={KRP.red} />
      </Frame>
    );
  },

  // #152 駅に名物が並ぶ: 台の上に弁当・菓子箱・壺が順にポン
  tb4_meibutsu_narabu: (f) => (
    <Frame f={f} seed={713}>
      <MeijiStationBg f={f} />
      {/* 売り台 */}
      <g transform="translate(1000 870)">
        <rect x={-320} y={-80} width={640} height={26} rx={6} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-290} y={-54} width={26} height={54} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={264} y={-54} width={26} height={54} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <g transform={`translate(780 ${756 + bobOf(f, 0)}) scale(${pop(seg(f, 15, 30)) * 0.72})`}>
        <Ekiben x={0} y={0} s={1} />
      </g>
      <g transform={`translate(1020 ${740 + bobOf(f, 1)}) scale(${pop(seg(f, 27, 42)) * 0.78})`}>
        <KashiBox x={0} y={0} s={1} />
      </g>
      {/* 名物の壺 */}
      <g transform={`translate(1230 ${744 + bobOf(f, 2)}) scale(${pop(seg(f, 39, 54))})`}>
        <path d="M -20 -96 L 20 -96 L 28 -72 Q 56 -50 56 0 Q 56 48 0 48 Q -56 48 -56 0 Q -56 -50 -28 -72 Z"
          fill={TKP.noren} opacity={0.9} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -34 -28 Q 0 -14 34 -28" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.7} />
      </g>
      {/* のぼり。縦書き「めいぶつ」は 4文字 × 54px = 216px ぶんの高さが要る。
          textAnchor=middle は y を中心に上下108px 使うので、幟は y=370〜750 (380px) に広げ、
          文字の中心を幟の中心 y=560 に合わせて収める。 */}
      <g transform={`translate(560 0) rotate(${Math.sin(f / 17) * 2.5} 0 870)`}>
        <line x1={0} y1={870} x2={0} y2={356} stroke={TKP.woodDark} strokeWidth={10} strokeLinecap="round" />
        <rect x={4} y={370} width={92} height={380} fill={KRP.red} opacity={0.88} stroke={KRP.ink} strokeWidth={5} />
        <text x={50} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
          fill={KRP.white} style={{ writingMode: "vertical-rl" }}>めいぶつ</text>
      </g>
    </Frame>
  ),

  // #153 名物が汽車に乗って広がる: 貨車に菓子箱と弁当
  tb4_meibutsu_maker: (f) => {
    const dash = (f * 9) % 120;
    return (
      <Frame f={f} seed={714}>
        {/* 流れるスピード線 */}
        {[320, 470, 620].map((y, i) => (
          <line key={i} x1={-20} y1={y} x2={W + 20} y2={y} stroke={KRP.grayDark} strokeWidth={6}
            strokeDasharray="90 210" strokeDashoffset={dash + i * 80} opacity={0.4} />
        ))}
        <line x1={-20} y1={930} x2={W + 20} y2={930} stroke={TKP.iron} strokeWidth={10} />
        <SteamLoco x={1460} y={870} s={0.95} f={f} />
        {/* 貨車2両 */}
        {[{ dx: 1070, kind: "kashi" }, { dx: 690, kind: "bento" }].map((c, i) => (
          <g key={i}>
            <g transform={`translate(${c.dx} 870)`}>
              <rect x={-150} y={-44} width={300} height={30} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
              {[-100, 100].map((cx, k) => (
                <g key={k} transform={`translate(${cx} 10)`}>
                  <circle cx={0} cy={0} r={26} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
                  <line x1={-19} y1={0} x2={19} y2={0} transform={`rotate(${(f * 6) % 360})`} stroke={KRP.ink} strokeWidth={4} />
                </g>
              ))}
              {/* 連結棒 */}
              <line x1={150} y1={-30} x2={196} y2={-30} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
            </g>
            {c.kind === "kashi" ? (
              <KashiBox x={c.dx} y={766} s={0.75} />
            ) : (
              <Ekiben x={c.dx} y={786} s={0.75} />
            )}
            <TagPlate x={c.dx} y={640} text="名物" t={seg(f, 30 + i * 14, 44 + i * 14)} size={36} color={KRP.red} />
          </g>
        ))}
      </Frame>
    );
  },

  // #154 土産が変わる予感: 揺れるお札 + ！
  tb4_henka_yokoku: (f) => {
    const shake = Math.sin(f * 1.15) * 8 * (1 - seg(f, 28, 58));
    return (
      <Frame f={f} seed={715}>
        <g transform={`translate(780 520) rotate(${shake}) scale(2.2)`}>
          <OfudaTag x={0} y={0} s={1} />
        </g>
        {/* ぐるぐる回る変化の矢印 */}
        <g transform={`translate(780 520) rotate(${(f * 2.2) % 360})`} opacity={0.75}>
          <path d="M 0 -330 A 330 330 0 0 1 286 -165" fill="none" stroke={KRP.orange} strokeWidth={10} strokeLinecap="round" />
          <path d="M 286 -165 l -10 -44 l 42 18 Z" fill={KRP.orange} />
          <path d="M 0 330 A 330 330 0 0 1 -286 165" fill="none" stroke={KRP.orange} strokeWidth={10} strokeLinecap="round" />
          <path d="M -286 165 l 10 44 l -42 -18 Z" fill={KRP.orange} />
        </g>
        <text x={1340} y={470} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190}
          fill={KRP.red} opacity={pop(seg(f, 35, 50))}
          transform={`rotate(${Math.sin(f / 8) * 5} 1340 470)`}>！</text>
        <Burst x={1340} y={430} t={seg(f, 48, 72)} r={260} color={KRP.red} />
      </Frame>
    );
  },

  // #155 お札からお菓子へ: 太矢印が伸びて菓子箱が開く
  tb4_ofuda_to_kashi: (f) => {
    const at = easeOut(seg(f, 22, 42));
    const ax = lerp(620, 1020, at);
    return (
      <Frame f={f} seed={716}>
        <g transform={`translate(430 ${520 + bobOf(f, 0)}) scale(1.5)`}>
          <OfudaTag x={0} y={0} s={1} />
        </g>
        {/* 太い変化矢印 */}
        {at > 0 && (
          <g>
            <rect x={620} y={488} width={ax - 620} height={64} fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M ${ax} 460 L ${ax + 90} 520 L ${ax} 580 Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
          </g>
        )}
        <g transform={`translate(1410 ${560 + bobOf(f, 1)}) scale(${pop(seg(f, 40, 58)) * 1.2})`}>
          <KashiBoxOpenFit x={0} y={0} s={1} />
        </g>
        <Burst x={1410} y={540} t={seg(f, 55, 80)} r={280} color={KRP.yellow} />
        <HeartS x={1320} y={330} s={0.8} opacity={pop(seg(f, 60, 74))} />
        <HeartS x={1560} y={300} s={0.6} opacity={pop(seg(f, 68, 80))} />
      </Frame>
    );
  },

  // #156 赤福 (社伝では1707): 伊勢の鳥居 + 餅3つが順にポン
  tb4_akafuku: (f) => (
    <Frame f={f} seed={717}
      over={f >= 30 ? <Stamp x={300} y={220} text="社伝では1707" size={46} /> : undefined}>
      <ShinmeiTorii x={380} y={840} s={1.25} />
      {/* 皿 */}
      <ellipse cx={1050} cy={720} rx={320} ry={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {[820, 1050, 1280].map((x, i) => (
        <g key={i} transform={`translate(${x} ${660 + bobOf(f, i)}) scale(${pop(seg(f, 18 + i * 12, 34 + i * 12)) * 1.2})`}>
          {/* 赤福 = 白い餅をこしあんでくるんだもの。
              あんは濃い茶 (赤黒い茶)、表面には指でつけた三筋の波 (五十鈴川の流れ)。 */}
          {/* 下からのぞく白い餅 */}
          <ellipse cx={0} cy={26} rx={86} ry={19} fill={AKAFUKU_MOCHI} stroke={KRP.ink} strokeWidth={5} />
          {/* こしあんの山 */}
          <path d="M -76 24 Q -76 -36 0 -36 Q 76 -36 76 24 Q 0 42 -76 24 Z"
            fill={AKAFUKU_ANKO} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 三筋の波: 2本の溝で3つの筋に分ける */}
          <g fill="none" strokeLinecap="round">
            <path d="M -58 -18 Q -24 -36 6 -18 Q 32 -4 58 -14" stroke={AKAFUKU_ANKO_LT} strokeWidth={6} opacity={0.85} />
            <path d="M -62 0 Q -26 -20 4 0 Q 30 16 60 4" stroke={AKAFUKU_ANKO_DK} strokeWidth={7} />
            <path d="M -58 18 Q -22 -2 8 18 Q 32 32 58 22" stroke={AKAFUKU_ANKO_DK} strokeWidth={7} />
          </g>
          {/* あんのつや */}
          <ellipse cx={-34} cy={-22} rx={18} ry={7} fill={KRP.white} opacity={0.18}
            transform="rotate(-16 -34 -22)" />
        </g>
      ))}
      <TagPlate x={1050} y={420} text="あかふく" t={seg(f, 50, 64)} size={44} color={KRP.red} />
    </Frame>
  ),

  // #157 温泉まんじゅう (1910 伊香保とされる): 湯けむりの里 + まんじゅう3つ
  tb4_onsen_manju: (f) => (
    <Frame f={f} seed={718}
      over={f >= 30 ? <Stamp x={1160} y={230} text="1910 伊香保とされる" size={42} /> : undefined}>
      <OnsenBg f={f} />
      {/* 茶屋の縁台 (皿が宙に浮かないように足元の床まで脚を下ろす) */}
      <g>
        <line x1={561} y1={878} x2={1079} y2={878} stroke={TKP.woodDark} strokeWidth={10} />
        <rect x={548} y={822} width={26} height={112} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1066} y={822} width={26} height={112} fill={TKP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={470} y={798} width={700} height={28} rx={9} fill={TKP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <line x1={500} y1={812} x2={1140} y2={812} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
      </g>
      <ellipse cx={820} cy={760} rx={330} ry={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {[600, 820, 1040].map((x, i) => (
        <g key={i}>
          <g transform={`translate(${x} ${706 + bobOf(f, i)}) scale(${pop(seg(f, 14 + i * 12, 30 + i * 12)) * 1.25})`}>
            <Manju x={0} y={0} s={1} />
          </g>
          <path d={`M ${x} 620 C ${x - 14 + Math.sin((f + i * 16) / 11) * 10} 560 ${x + 14 + Math.sin((f + i * 24) / 13) * 10} 520 ${x + Math.sin((f + i * 32) / 15) * 14} 460`}
            fill="none" stroke={TKP.steam} strokeWidth={16} strokeLinecap="round"
            opacity={0.6 * pop(seg(f, 30 + i * 12, 44 + i * 12))} />
        </g>
      ))}
    </Frame>
  ),

  // #158 「おいしかったよ」の報告が広める: 菓子箱の受け渡し + 浮かぶ便り
  tb4_oishii_houkoku: (f) => {
    const e = easeOut(seg(f, 10, 40));
    const bx = lerp(810, 1070, e);
    const by = 640 - Math.sin(e * Math.PI) * 70;
    return (
      <Frame f={f} seed={719}>
        <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
        <Person x={650} y={840} s={1.12} f={f} phase={0} face="smile" gaze={[6, -3]}
          cloth={TKP.noren} clothDark="#3A5680" />
        <Person x={1270} y={840} s={1.12} f={f} phase={1} face="smile" gaze={[-6, -3]}
          cloth={KRP.orange} clothDark="#C47A2E" />
        <KashiBox x={bx} y={by} s={0.72} />
        {/* ふわふわ浮かぶ「おいしい」の便り */}
        <g transform={`translate(960 ${330 + Math.sin(f / 14) * 7}) scale(${pop(seg(f, 32, 50))})`}>
          <rect x={-130} y={-86} width={260} height={172} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-96} y1={-30 + i * 34} x2={62 - i * 20} y2={-30 + i * 34}
              stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
          ))}
          <path d="M 78 42 C 56 26 60 8 72 8 C 77 8 78 14 78 16 C 78 14 79 8 84 8 C 96 8 100 26 78 42 Z"
            fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        <HeartS x={760} y={420} s={0.7} opacity={pop(seg(f, 46, 60))} />
        <HeartS x={1190} y={400} s={0.8} opacity={pop(seg(f, 54, 68))} />
        <HeartS x={1020} y={500} s={0.55} opacity={pop(seg(f, 62, 76))} />
      </Frame>
    );
  },

  // #159 第9章の扉: カレンダーの頁が飛んで「戦後」へ時間ジャンプ
  tb4_ch9_door: (f) => (
    <Frame f={f} seed={720} over={<ChapterDoor num={9} title="戦後日本の旅" t={seg(f, 12, 42)} />}>
      {/* カレンダー台紙 */}
      <g transform="translate(430 440)">
        <rect x={-190} y={-220} width={380} height={440} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-190} y={-220} width={380} height={86} rx={14} fill={KRP.red} opacity={0.85} stroke={KRP.ink} strokeWidth={6} />
        {[-110, 0, 110].map((rx, i) => (
          <circle key={i} cx={rx} cy={-220} r={14} fill="none" stroke={KRP.ink} strokeWidth={6} />
        ))}
        <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110}
          fill={KRP.ink} opacity={pop(seg(f, 48, 64))}>戦後</text>
      </g>
      {/* 飛んでいく頁 (明治 → 大正) */}
      {["明治", "大正"].map((era, i) => {
        const t = seg(f, 8 + i * 16, 40 + i * 16);
        if (t >= 1) return null;
        const e = easeOut(t);
        const x = 430 + e * 640;
        const y = 440 - Math.sin(e * Math.PI) * 240 - e * 120;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${e * 42})`} opacity={1 - e * 0.8}>
            <rect x={-170} y={-200} width={340} height={400} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={KRP.grayDark}>{era}</text>
          </g>
        );
      })}
      <SparkleS x={700} y={260} s={0.8} opacity={0.5 + Math.sin(f / 7) * 0.4} />
      <SparkleS x={250} y={700} s={0.6} opacity={0.5 + Math.sin((f + 10) / 8) * 0.4} />
    </Frame>
  ),

  // #160 旅の口実に新しい仲間: 口実路線図に「新婚旅行」駅が開業
  tb4_kuchijitsu_nakama: (f) => {
    const lineT = easeOut(seg(f, 8, 40));
    const trainX = lerp(300, 1560, ((f + 30) % 170) / 170);
    const sta = (x: number, name: string, t: number) => (
      <g opacity={t > 0 ? 1 : 0} transform={`translate(${x} 560) scale(${pop(clamp01(t))})`}>
        <circle cx={0} cy={0} r={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-name.length * 24 - 18} y={54} width={name.length * 48 + 36} height={64} rx={10}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>{name}</text>
      </g>
    );
    return (
      <Frame f={f} seed={721} caption="旅の口実の路線図">
        <line x1={260} y1={560} x2={lerp(260, 1660, lineT)} y2={560}
          stroke={KRP.blueDeep} strokeWidth={14} strokeLinecap="round" />
        {sta(480, "お参り", seg(f, 14, 26))}
        {sta(900, "湯治", seg(f, 22, 34))}
        {sta(1340, "新婚旅行", seg(f, 34, 52))}
        <Burst x={1340} y={560} t={seg(f, 50, 74)} r={220} color={KRP.red} />
        <HeartS x={1340} y={420} s={0.8} opacity={pop(seg(f, 54, 68))} />
        <MiniTrain x={trainX} y={548} s={0.75} f={f} />
      </Frame>
    );
  },

  // #161 新婚旅行ブーム: 花婿と花嫁 + 舞うハートと紙吹雪
  // 旧版は礼服の黒とドレスの白だけで、全体が白黒に見えた (2026-11-01 作者指摘)。
  // #166 と同じ部品で、花婿に白シャツ+赤ネクタイ、花嫁に金の帯のドレスを着せて色を足す。
  tb4_shinkon: (f) => (
    <Frame f={f} seed={722}>
      <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
      {/* 舞うハート・紙吹雪は人物より「先」に描く。あとに描くと、どちらも半透明なので
          新郎新婦の顔に透けて見えた (2026-11-01 作者指摘) */}
      {Array.from({ length: 8 }, (_, i) => {
        const cy = 180 + ((f * 2.2 + i * 97) % 520);
        const cx = 360 + i * 170 + Math.sin((f + i * 30) / 12) * 24;
        return (
          <rect key={i} x={cx} y={cy} width={20} height={12} rx={3}
            fill={[KRP.red, KRP.yellow, KRP.green, KRP.blueDeep][i % 4]} opacity={0.8}
            transform={`rotate(${(f * 4 + i * 45) % 360} ${cx} ${cy})`} />
        );
      })}
      {[0, 1, 2].map((i) => {
        const u = ((f * 1.3 + i * 55) % 160) / 160;
        return (
          <HeartS key={i} x={960 + Math.sin((u * 5 + i) * 1.8) * 190} y={620 - u * 360}
            s={0.55 + i * 0.12} opacity={Math.sin(u * Math.PI)} />
        );
      })}
      <Person x={800} y={840} s={1.15} f={f} phase={0} face="smile" gaze={[4, -3]}
        cloth={KRP.ink} clothDark="#2A241F" />
      <g transform={`translate(800 ${840 + bobOf(f, 0)}) scale(1.15)`}>
        <SuitFront tie={KRP.red} />
      </g>
      <Person x={1120} y={840} s={1.15} f={f} phase={1} face="smile" gaze={[-4, -3]}
        cloth={KRP.white} clothDark="#E8E2D4" hair="none" />
      <g transform={`translate(1120 ${840 + bobOf(f, 1)}) scale(1.15)`}>
        <PocketPatch color={KRP.white} />
        <FlareSkirt color={KRP.white} belt={KRP.brass} wide={86} />
        <SweetheartNeck />
      </g>
      {/* 花嫁のベールとティアラ (bob同期) */}
      <g transform={`translate(1120 ${840 + bobOf(f, 1)}) scale(1.15)`}>
        <path d="M -70 -268 Q -96 -180 -84 -96 L -58 -108 Q -72 -190 -54 -258 Z"
          fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 70 -268 Q 96 -180 84 -96 L 58 -108 Q 72 -190 54 -258 Z"
          fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -62 -272 Q 0 -306 62 -272" fill="none" stroke={KRP.ink} strokeWidth={5} />
        {[-34, 0, 34].map((tx, i) => (
          <circle key={i} cx={tx} cy={-286 - (i === 1 ? 10 : 0)} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* ブーケ */}
        <g transform="translate(-92 -116)">
          {[[-14, -8], [12, -12], [0, 8], [-4, -22], [16, 4]].map(([bx2, by2], i) => (
            <circle key={i} cx={bx2} cy={by2} r={11}
              fill={[KRP.red, KRP.yellow, KRP.orange, KRP.red, KRP.yellow][i]} stroke={KRP.ink} strokeWidth={3.5} />
          ))}
        </g>
      </g>
    </Frame>
  ),

  // #162 1960年・ご夫妻の宮崎訪問: 日本地図で東京→宮崎
  tb4_1960_miyazaki: (f) => (
    <Frame f={f} seed={723}
      over={f >= 16 ? <Stamp x={1540} y={200} text="1960" size={66} /> : undefined}>
      <JMapCard clipId="tb4jmap162">
        <DashArc x1={EDO_XY[0]} y1={EDO_XY[1]} x2={MYZ_XY[0]} y2={MYZ_XY[1]}
          t={seg(f, 24, 58)} lift={170} />
        <MapPin x={EDO_XY[0]} y={EDO_XY[1]} t={seg(f, 8, 20)} />
        <MapPin x={MYZ_XY[0]} y={MYZ_XY[1]} t={seg(f, 52, 64)} color={KRP.blueDeep} />
        <MapName x={EDO_XY[0] + 96} y={EDO_XY[1] + 10} text="東京" />
        {f >= 56 && <MapName x={MYZ_XY[0] - 110} y={MYZ_XY[1] + 10} text="宮崎" />}
      </JMapCard>
      <HeartS x={MYZ_XY[0]} y={MYZ_XY[1] - 150} s={0.9} opacity={pop(seg(f, 60, 74))} />
    </Frame>
  ),

  // #163 業界は「チャンス！」: バスと旅館の2人が身を乗り出す
  tb4_gyokai_chance: (f) => (
    <Frame f={f} seed={724}>
      <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
      <Person x={700} y={840} s={1.15} f={f} phase={0} face="surprised" gaze={[6, -4]}
        cloth={KRP.blueDeep} clothDark="#38598C" tasuki="バス" lean={6} />
      <Person x={1220} y={840} s={1.15} f={f} phase={1} face="surprised" gaze={[-6, -4]}
        cloth={KRP.orange} clothDark="#C47A2E" tasuki="旅館" lean={-6} />
      <Burst x={960} y={430} t={seg(f, 10, 34)} r={260} color={KRP.yellow} />
      <Bubble x={960} y={320} text="チャンス！" t={seg(f, 24, 40)} size={48} tail={[-30, 110]} />
      <SparkleS x={560} y={400} s={0.8} opacity={0.5 + Math.sin(f / 6) * 0.45} />
      <SparkleS x={1380} y={370} s={0.7} opacity={0.5 + Math.sin((f + 8) / 7) * 0.45} />
      <SparkleS x={1050} y={540} s={0.55} opacity={0.5 + Math.sin((f + 16) / 6) * 0.45} />
    </Frame>
  ),

  // #164 宮崎を新婚の聖地に仕立てる: 椰子 + 歓迎アーチ + バス到着
  tb4_seichi_shitate: (f) => {
    const postT = easeOut(seg(f, 22, 44));
    const bannerY = lerp(-120, 430, easeOut(seg(f, 40, 58)));
    const busX = lerp(-340, 520, easeOut(seg(f, 45, 92)));
    return (
      <Frame f={f} seed={725}>
        {/* 海と砂浜 */}
        <rect x={-20} y={600} width={W + 40} height={140} fill={TKP.seaBlue} opacity={0.85} />
        <path d={`M -20 600 q 160 ${10 + Math.sin(f / 15) * 6} 320 0 q 160 -10 320 0 q 160 ${10 + Math.sin((f + 20) / 15) * 6} 320 0 q 160 -10 320 0 q 160 10 320 0 q 80 -5 160 0`}
          fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.7} />
        <rect x={-20} y={740} width={W + 40} height={360} fill={TKP.roadTan} opacity={0.6} />
        <Sun x={1700} y={180} s={0.85} f={f} />
        <g transform={`translate(350 740) scale(${pop(seg(f, 8, 24))})`}>
          <PalmTree x={0} y={0} s={1.25} f={f} />
        </g>
        <g transform={`translate(1600 740) scale(${pop(seg(f, 16, 32))})`}>
          <PalmTree x={0} y={0} s={1.1} f={f} />
        </g>
        {/* 歓迎アーチ: 柱がせり上がり、横断幕が降りる */}
        {[700, 1220].map((px, i) => (
          <rect key={i} x={px - 18} y={lerp(800, 430, postT)} width={36} height={lerp(0, 370, postT)}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        ))}
        <g transform={`translate(0 ${bannerY})`}>
          <rect x={640} y={-60} width={640} height={96} rx={12} fill={KRP.red} opacity={0.9} stroke={KRP.ink} strokeWidth={6} />
          <text x={960} y={6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52}
            fill={KRP.white}>ようこそ みやざき</text>
        </g>
        <Bus x={busX} y={830} s={1.05} f={f} />
        <HeartS x={1420} y={330} s={0.7} opacity={pop(seg(f, 56, 70))} />
        <HeartS x={530} y={300} s={0.6} opacity={pop(seg(f, 64, 78))} />
      </Frame>
    );
  },

  // #165 ピークは1974年・年間37万組: 地図の上をハートが次々飛ぶ
  tb4_37man_kumi: (f) => {
    const hearts = Array.from({ length: 5 }, (_, i) => {
      const u = ((f * 1.0 + i * 36) % 180) / 180;
      const mx = (EDO_XY[0] + MYZ_XY[0]) / 2;
      const my = Math.min(EDO_XY[1], MYZ_XY[1]) - 190;
      const qx = (1 - u) * (1 - u) * EDO_XY[0] + 2 * u * (1 - u) * mx + u * u * MYZ_XY[0];
      const qy = (1 - u) * (1 - u) * EDO_XY[1] + 2 * u * (1 - u) * my + u * u * MYZ_XY[1];
      return <HeartS key={i} x={qx} y={qy} s={0.5 + (i % 3) * 0.12} opacity={Math.sin(u * Math.PI)} />;
    });
    return (
      <Frame f={f} seed={726}
        over={
          <>
            {f >= 12 && <Stamp x={1540} y={200} text="1974" size={66} />}
            {f >= 30 && <LabelPill x={1660} y={430} text="年間37万組" centerX size={36} color={KRP.red} />}
          </>
        }>
        <JMapCard clipId="tb4jmap165">
          <DashArc x1={EDO_XY[0]} y1={EDO_XY[1]} x2={MYZ_XY[0]} y2={MYZ_XY[1]}
            t={seg(f, 4, 24)} lift={170} />
          <MapPin x={EDO_XY[0]} y={EDO_XY[1]} t={seg(f, 0, 10)} />
          <MapPin x={MYZ_XY[0]} y={MYZ_XY[1]} t={seg(f, 4, 14)} color={KRP.blueDeep} />
          <MapName x={EDO_XY[0] + 96} y={EDO_XY[1] + 10} text="東京" />
          <MapName x={MYZ_XY[0] - 110} y={MYZ_XY[1] + 10} text="宮崎" />
          {hearts}
        </JMapCard>
      </Frame>
    );
  },

  // #166 3組に1組 (といわれる): 3組のカップル・1組にスポットライト
  // 6人とも色つきの服。男女を描き分ける (男=短髪+スーツ/袴、女=長い髪+スカート/着物)。
  // 左端 (スポットライト) の組は #161 tb4_shinkon の花婿・花嫁と同じ配色・同じ小物にして、
  // 同一人物に見えるようにしている (黒の礼服 / 白のドレス + ベール + ティアラ + ブーケ)。
  tb4_3kumi_1kumi: (f) => {
    const spot = easeOut(seg(f, 28, 48));
    const S = 0.82;
    const DX = 78;      // カップル中心からの左右振り分け
    const GY = 840;     // 足元
    // Person の上に重ねる飾り (Person と同じ bob で揺らす)
    const over = (x: number, ph: number, children: React.ReactNode) => (
      <g transform={`translate(${x} ${GY + bobOf(f, ph)}) scale(${S})`}>{children}</g>
    );

    // 1組目: #161 と同じ花婿 (黒の礼服) と花嫁 (白のドレス)。赤のネクタイ・金の帯で色を足す
    const coupleBride = (cx: number, ph: number) => (
      <g>
        <Person x={cx - DX} y={GY} s={S} f={f} phase={ph} face="smile" gaze={[3, -2]}
          cloth={KRP.ink} clothDark="#2A241F" />
        {over(cx - DX, ph, <SuitFront tie={KRP.red} />)}
        <Person x={cx + DX} y={GY} s={S} f={f} phase={ph + 1} face="smile" gaze={[-3, -2]}
          cloth={KRP.white} clothDark="#E8E2D4" hair="none" />
        {over(cx + DX, ph + 1, (
          <g>
            <PocketPatch color={KRP.white} />
            <FlareSkirt color={KRP.white} belt={KRP.brass} wide={86} />
            <SweetheartNeck />
            <BridalVeil />
            <Bouquet x={-72} y={-108} />
          </g>
        ))}
      </g>
    );

    // 2組目: 洋装の旅行スタイル。夫=紺のスーツ+橙のネクタイ、妻=赤のワンピース+ボブ
    const coupleWestern = (cx: number, ph: number) => (
      <g>
        <Person x={cx - DX} y={GY} s={S} f={f} phase={ph} face="smile" gaze={[3, -2]}
          cloth={TKP.noren} clothDark="#3A5680" />
        {over(cx - DX, ph, <SuitFront tie={KRP.orange} />)}
        <Person x={cx + DX} y={GY} s={S} f={f} phase={ph + 1} face="smile" gaze={[-3, -2]}
          cloth={KRP.red} clothDark={KRP.cream} hair="none" />
        {over(cx + DX, ph + 1, (
          <g>
            <FlareSkirt color={KRP.red} belt="#A32E20" wide={80} />
            <RoundCollar />
            <BobHair />
          </g>
        ))}
      </g>
    );

    // 3組目: 和装。夫=紺の羽織袴、妻=紫の着物+金の帯+まとめ髪
    const coupleKimono = (cx: number, ph: number) => (
      <g>
        <Person x={cx - DX} y={GY} s={S} f={f} phase={ph} face="smile" gaze={[3, -2]}
          cloth={TKP.night} clothDark="#26323F" />
        {over(cx - DX, ph, <KimonoFront color="#26323F" obi={TKP.woodDark} hakama />)}
        <Person x={cx + DX} y={GY} s={S} f={f} phase={ph + 1} face="smile" gaze={[-3, -2]}
          cloth={TKP.purple} clothDark={KRP.cream} hair="none" />
        {over(cx + DX, ph + 1, (
          <g>
            <KimonoFront color={TKP.purple} obi={KRP.brass} />
            <UpdoHair kanzashi={KRP.red} />
          </g>
        ))}
      </g>
    );

    return (
      <Frame f={f} seed={727}>
        <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
        {/* スポットライト (1組目へ) */}
        <polygon points={`480,120 ${480 - 260 * spot},870 ${480 + 260 * spot},870`}
          fill={KRP.yellow} opacity={0.3 * spot} />
        <ellipse cx={480} cy={862} rx={270 * spot} ry={34 * spot} fill={KRP.yellow} opacity={0.4} />
        {/* 新婚旅行のトランク (3組ぶん色違い) */}
        <TravelCase x={286} y={844} s={S} color={KRP.red} belt={TKP.woodDark} />
        <TravelCase x={960} y={844} s={S * 0.92} color={KRP.brass} belt={TKP.woodDark} />
        <TravelCase x={1658} y={844} s={S * 0.92} color={TKP.woodLight} belt={TKP.woodDark} />
        {coupleBride(480, 0)}
        {coupleWestern(960, 2)}
        {coupleKimono(1440, 4)}
        <HeartS x={480} y={430} s={1.1 * pop(seg(f, 40, 56))} opacity={seg(f, 40, 50)} />
        {/* みやざき行きの小旗 */}
        <g transform={`translate(652 700) scale(${pop(seg(f, 50, 64))})`}>
          <line x1={0} y1={0} x2={0} y2={-140} stroke={TKP.woodDark} strokeWidth={8} strokeLinecap="round" />
          <polygon points="0,-140 140,-112 0,-84" fill={KRP.red} opacity={0.9} stroke={KRP.ink} strokeWidth={4.5} />
          <text x={8} y={-104} fontFamily={FONT} fontWeight={900} fontSize={20} fill={KRP.white}>みやざき</text>
        </g>
      </Frame>
    );
  },

  // #167 1964年・海外旅行の自由化: 空港のゲートが開き旅行者が進む
  tb4_1964_jiyuka: (f) => {
    const open = easeOut(seg(f, 25, 55));
    const walkX = lerp(380, 830, easeOut(seg(f, 40, 90)));
    return (
      <Frame f={f} seed={728}
        over={f >= 16 ? <Stamp x={1480} y={200} text="1964" size={66} /> : undefined}>
        <GendaiBg f={f} />
        {/* ゲート (遮断バーが開く) */}
        <rect x={1052} y={560} width={30} height={244} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        <g transform={`translate(1067 600) rotate(${-74 * open})`}>
          <rect x={-250} y={-14} width={250} height={28} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          {[-230, -180, -130, -80].map((sx, i) => (
            <rect key={i} x={sx} y={-14} width={25} height={28} fill={KRP.red} opacity={0.85} />
          ))}
        </g>
        <TagPlate x={1160} y={430} text="海外へ" t={seg(f, 10, 24)} size={44} color={KRP.blueDeep} />
        <ModernTraveler x={walkX} y={800} s={1.1} f={f} face="smile" gaze={[6, -3]} />
        <Burst x={1067} y={560} t={seg(f, 52, 76)} r={200} color={KRP.yellow} />
      </Frame>
    );
  },

  // #168 持ち出しは年1回500ドルまで: 札束に上限の枠がガシャン
  tb4_500_doru: (f) => {
    const stackT = pop(seg(f, 8, 24));
    const barT = easeOut(seg(f, 35, 55));
    return (
      <Frame f={f} seed={729}>
        {/* ドル札束 */}
        <g transform={`translate(680 ${560 + bobOf(f, 0) * 0.5}) scale(${stackT})`}>
          {[36, 18, 0].map((dy, i) => (
            <g key={i} transform={`translate(${(i - 1) * 8} ${dy})`}>
              <rect x={-170} y={-70} width={340} height={120} rx={10} fill={KRP.green} opacity={0.92} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={0} cy={-10} r={38} fill="none" stroke={KRP.ink} strokeWidth={4.5} opacity={0.7} />
              <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.ink} opacity={0.8}>$</text>
            </g>
          ))}
          {/* 帯封 */}
          <g opacity={pop(seg(f, 20, 34))}>
            <rect x={-60} y={-86} width={120} height={180} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.red}>$500</text>
          </g>
        </g>
        {/* 上限の枠が上下から閉まる */}
        <g opacity={barT > 0 ? 1 : 0}>
          <rect x={400} y={lerp(140, 350, barT)} width={560} height={26} fill={KRP.ink} />
          <rect x={400} y={lerp(960, 790, barT)} width={560} height={26} fill={KRP.ink} />
          <TagPlate x={680} y={290} text="上限" t={seg(f, 50, 62)} size={40} color={KRP.red} />
        </g>
        {/* 年1回カレンダー */}
        <g transform={`translate(1360 ${540 + bobOf(f, 2)}) scale(${pop(seg(f, 46, 62))})`}>
          <rect x={-150} y={-170} width={300} height={340} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
          <rect x={-150} y={-170} width={300} height={70} rx={12} fill={KRP.blueDeep} opacity={0.85} stroke={KRP.ink} strokeWidth={5.5} />
          {[-80, 0, 80].map((rx, i) => (
            <circle key={i} cx={rx} cy={-170} r={12} fill="none" stroke={KRP.ink} strokeWidth={5.5} />
          ))}
          <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={KRP.ink}>年1回</text>
        </g>
      </Frame>
    );
  },

  // #169 1965年・ジャルパック登場: ジェット機が滑走路から飛び立つ
  tb4_jalpak_hatsubai: (f) => {
    const t = easeOut(seg(f, 8, 70));
    const px = lerp(340, 1460, t);
    const py = lerp(840, 330, t * t);
    return (
      <Frame f={f} seed={730}
        over={f >= 20 ? <Stamp x={240} y={190} text="1965" size={66} /> : undefined}>
        {/* 滑走路 */}
        <polygon points={`540,1040 1380,1040 1180,760 740,760`} fill={KRP.grayDark} opacity={0.55} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={930 - i * 6} y={820 + i * 70} width={60 + i * 14} height={26}
            fill={KRP.white} opacity={0.8} />
        ))}
        {/* パンフレット */}
        <g transform={`translate(380 ${480 + bobOf(f, 1)}) rotate(-5) scale(${pop(seg(f, 30, 48))})`}>
          <rect x={-130} y={-180} width={260} height={360} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
          <circle cx={0} cy={-80} r={58} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -36 -72 L 30 -96 L 36 -84 L -20 -58 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>パック</text>
          <text x={0} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>旅行</text>
          <line x1={-90} y1={126} x2={90} y2={126} stroke={KRP.red} strokeWidth={6} />
        </g>
        <g transform={`rotate(${-10 * t} ${px} ${py})`}>
          <JetPlane x={px} y={py} s={0.85 + 0.45 * t} f={f} />
        </g>
      </Frame>
    );
  },

  // #170 ヨーロッパ16日間67万5000円: 巨大値札がドンと落ちる
  tb4_nedan_don: (f) => {
    // 値札は中央 (960,410)。左右にヨーロッパの名所を3つずつ並べ、
    // 名所の頂点 (最高でも y≈407) と値札の帯 (x 608〜1254 / y 284〜536) が
    // 重ならないよう、名所は x≤620 と x≥1309 に置いてある。
    const sc = lerp(2.4, 0.82, easeOut(seg(f, 6, 24)));
    const shake = Math.sin(f * 1.5) * 5 * (1 - seg(f, 24, 46));
    return (
      <Frame f={f} seed={731}>
        {/* 地面 */}
        <rect x={-20} y={840} width={W + 40} height={120} fill={TKP.caminoGold} opacity={0.22} />
        <line x1={-20} y1={840} x2={W + 20} y2={840} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
        {/* 左: オランダの風車 / エッフェル塔 / 凱旋門 */}
        <LmWindmill x={130} y={840} s={0.92} f={f} />
        <LmEiffel x={358} y={840} s={0.95} />
        <LmArc x={546} y={840} s={0.82} />
        {/* 右: コロッセオ / ビッグベン / ピサの斜塔 */}
        <LmColosseum x={1400} y={840} s={0.84} />
        <LmBigBen x={1618} y={840} s={0.78} />
        <LmPisa x={1824} y={840} s={0.8} />
        {/* 中央: 値札 */}
        <Burst x={960} y={410} t={seg(f, 22, 50)} r={330} color={KRP.orange} />
        <g transform={`translate(960 410) scale(${sc}) rotate(${-4 + shake})`}>
          {/* 値札 (穴 + ひも) */}
          <path d="M -350 -130 L 290 -130 Q 350 -130 350 -70 L 350 70 Q 350 130 290 130 L -350 130 L -430 0 Z"
            fill={KRP.yellow} opacity={0.95} stroke={KRP.ink} strokeWidth={8} />
          <circle cx={-370} cy={0} r={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -388 -14 Q -470 -90 -430 -170" fill="none" stroke={KRP.ink} strokeWidth={7} />
          <text x={-20} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92}
            fill={KRP.red}>67万5000円</text>
        </g>
        <TagPlate x={960} y={190} text="ヨーロッパ16日間" t={seg(f, 30, 44)} size={40} />
      </Frame>
    );
  },

  // #171 庶民には夢のまた夢: 見上げる人 + 夢の雲の中の欧州旅行
  tb4_yume_no_yume: (f) => (
    <Frame f={f} seed={732}>
      <line x1={-20} y1={882} x2={W + 20} y2={882} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
      <Person x={560} y={860} s={1.2} f={f} phase={0} face="normal" gaze={[5, -7]}
        cloth={TKP.yukata} clothDark="#5C7FA6" />
      {/* 思考のあぶく */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={700 + i * 70} cy={640 - i * 90 + Math.sin((f + i * 14) / 12) * 5}
          r={14 + i * 9} fill={KRP.white} stroke={KRP.ink} strokeWidth={5}
          opacity={pop(seg(f, 8 + i * 8, 22 + i * 8))} />
      ))}
      {/* 夢の雲 */}
      <g transform={`translate(1230 ${400 + Math.sin(f / 16) * 7}) scale(${pop(seg(f, 26, 48))})`}>
        <g>
          <ellipse cx={0} cy={30} rx={400} ry={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={-240} cy={-50} rx={160} ry={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={60} cy={-110} rx={200} ry={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={260} cy={-30} rx={150} ry={100} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={0} cy={10} rx={390} ry={150} fill={KRP.white} />
          <ellipse cx={-240} cy={-50} rx={152} ry={102} fill={KRP.white} />
          <ellipse cx={60} cy={-110} rx={192} ry={122} fill={KRP.white} />
          <ellipse cx={260} cy={-30} rx={142} ry={92} fill={KRP.white} />
        </g>
        <Eiffel x={-170} y={120} s={0.42} />
        <JetPlane x={140} y={-40} s={0.5} f={f} />
      </g>
      {[[840, 220], [1660, 180], [1760, 560]].map(([sx, sy], i) => (
        <SparkleS key={i} x={sx} y={sy} s={0.6 + i * 0.1}
          opacity={(0.5 + Math.sin((f + i * 9) / 7) * 0.45) * seg(f, 40, 56)} />
      ))}
    </Frame>
  ),

  // #172 帰国みやげは特別: 紙袋を提げて「おかえり！」
  tb4_kikoku_miyage: (f) => {
    const tx = lerp(300, 740, easeOut(seg(f, 5, 55)));
    return (
      <Frame f={f} seed={733}>
        <GendaiBg f={f} />
        <ModernTraveler x={tx} y={800} s={1.1} f={f} face="smile" gaze={[6, -2]} />
        {/* 提げた紙袋 (歩きに合わせてゆれる) */}
        <g transform={`rotate(${Math.sin(f / 9) * 4} ${tx - 150} ${700})`}>
          <PaperBag x={tx - 150} y={740} s={0.85} />
        </g>
        <g transform={`rotate(${Math.sin((f + 6) / 9) * 4} ${tx - 240} ${710})`}>
          <PaperBag x={tx - 240} y={748} s={0.72} color={KRP.blueDeep} />
        </g>
        {/* 出迎えの2人 */}
        <Person x={1330} y={800} s={1.05} f={f} phase={2} face="smile" gaze={[-6, -2]}
          cloth={KRP.orange} clothDark="#C47A2E" />
        <Person x={1540} y={805} s={0.72} f={f} phase={3} face="smile" gaze={[-7, -3]}
          cloth={KRP.green} clothDark="#639A5F" />
        <Bubble x={1380} y={400} text="おかえり！" t={seg(f, 42, 58)} size={44} tail={[-20, 100]} />
        <HeartS x={1120} y={420} s={0.7} opacity={pop(seg(f, 56, 70))} />
      </Frame>
    );
  },

  // #173 袋から洋酒・チョコ・スカーフ: 弧を描いて順にポン
  tb4_bag_pops: (f) => {
    const items: Array<{ tx: number; ty: number; el: (s: number) => React.ReactElement }> = [
      { tx: 540, ty: 440, el: (s) => <WhiskyBottle x={0} y={0} s={s} /> },
      { tx: 960, ty: 360, el: (s) => <ChocoBox x={0} y={0} s={s} /> },
      { tx: 1380, ty: 440, el: (s) => <Scarf x={0} y={0} s={s} f={f} /> },
    ];
    return (
      <Frame f={f} seed={734}>
        <line x1={-20} y1={882} x2={W + 20} y2={882} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
        <PaperBag x={960} y={740} s={1.9} />
        {items.map((it, i) => {
          const t = seg(f, 12 + i * 16, 36 + i * 16);
          if (t <= 0) return null;
          const e = easeOut(t);
          const x = lerp(960, it.tx, e);
          const y = lerp(620, it.ty, e) - Math.sin(e * Math.PI) * 170;
          return (
            <g key={i}>
              <g transform={`translate(${x} ${y + (t >= 1 ? bobOf(f, i) : 0)}) scale(${0.4 + pop(t) * 0.75})`}>
                {it.el(1)}
              </g>
              <Burst x={it.tx} y={it.ty} t={seg(f, 34 + i * 16, 52 + i * 16)} r={170} color={KRP.yellow} />
            </g>
          );
        })}
        <SparkleS x={760} y={250} s={0.7} opacity={(0.5 + Math.sin(f / 6) * 0.45) * seg(f, 50, 64)} />
        <SparkleS x={1180} y={220} s={0.6} opacity={(0.5 + Math.sin((f + 7) / 7) * 0.45) * seg(f, 56, 70)} />
      </Frame>
    );
  },

  // #174 土産話とともに手渡す: チョコが弧を描いて家族へ
  tb4_houkokusho: (f) => {
    const e = easeOut(seg(f, 20, 50));
    const cx = lerp(790, 1180, e);
    const cy = lerp(620, 640, e) - Math.sin(e * Math.PI) * 90;
    return (
      <Frame f={f} seed={735}>
        <line x1={-20} y1={872} x2={W + 20} y2={872} stroke={KRP.ink} strokeWidth={6} opacity={0.4} />
        <Person x={620} y={850} s={1.12} f={f} phase={0} face="smile" gaze={[6, -3]}
          cloth={KRP.green} clothDark="#639A5F" />
        <PaperBag x={450} y={800} s={0.8} />
        <Person x={1310} y={850} s={1.12} f={f} phase={1} face="smile" gaze={[-6, -3]}
          cloth={KRP.orange} clothDark="#C47A2E" />
        <Person x={1530} y={855} s={0.72} f={f} phase={2} face="smile" gaze={[-7, -4]}
          cloth={TKP.yukata} clothDark="#5C7FA6" />
        <ChocoBox x={cx} y={cy} s={0.75} />
        {/* 旅の話の吹き出し (中にエッフェル塔) */}
        <g transform={`translate(620 330) scale(${pop(seg(f, 40, 58))})`}>
          <ellipse cx={0} cy={0} rx={190} ry={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <polygon points="60,110 110,210 130,104" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={0} rx={182} ry={122} fill={KRP.white} />
          <Eiffel x={0} y={92} s={0.3} />
        </g>
        <HeartS x={1060} y={380} s={0.7} opacity={pop(seg(f, 56, 70))} />
        <HeartS x={1420} y={430} s={0.55} opacity={pop(seg(f, 64, 78))} />
      </Frame>
    );
  },
};

export const tabiB4Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif] ? SCENES[motif](f) : null;

// 文#139〜#174 に1対1で対応する motif 名の列 (長さは必ず36。再利用は同じ名前を繰り返す)
export const T_B4_MOTIFS: string[] = [
  "tb4_ch8_door",          // #139 第8章扉: 鉄道が名物を作る
  "tb4_timetable_1839",    // #140 1839年 世界初の時刻表
  "tb4_machi_barabara",    // #141 町ごとにバラバラの時計
  "tb4_taiyo_jikoku",      // #142 太陽まかせの時刻
  "tb4_jikokuhyo_dame",    // #143 ずれた時刻では時刻表が組めない
  "tb4_soroeru",           // #144 針が鉄道の時間にそろう (大仕掛け)
  "tb4_usa_1883",          // #145 1883年 米国 (鉄道会社の取り決め)
  "tb4_futatsu_shogo",     // #146 正午が2回来た日
  "tb4_japan_chokurei",    // #147 日本は1886年 勅令で
  "tb4_mou_hitotsu",       // #148 鉄道がくれたもう1つのもの
  "tb4_ekiben_tanjo",      // #149 駅弁の誕生
  "tb4_utsunomiya_setsu",  // #150 1885年 宇都宮駅 説
  "tb4_nigirimeshi",       // #151 握り飯2個とたくあんで5銭
  "tb4_meibutsu_narabu",   // #152 駅に名物が並ぶ
  "tb4_meibutsu_maker",    // #153 名物が汽車で広がる
  "tb4_henka_yokoku",      // #154 土産が変わる予感
  "tb4_ofuda_to_kashi",    // #155 お札からお菓子へ
  "tb4_akafuku",           // #156 赤福 (社伝では1707)
  "tb4_onsen_manju",       // #157 温泉まんじゅう (1910 伊香保とされる)
  "tb4_oishii_houkoku",    // #158 おいしさの報告が広める
  "tb4_ch9_door",          // #159 第9章扉: 戦後日本の旅
  "tb4_kuchijitsu_nakama", // #160 旅の口実に新しい仲間
  "tb4_shinkon",           // #161 新婚旅行ブーム
  "tb4_1960_miyazaki",     // #162 1960年 ご夫妻の宮崎訪問
  "tb4_gyokai_chance",     // #163 業界はチャンス
  "tb4_seichi_shitate",    // #164 宮崎を聖地に仕立てる
  "tb4_37man_kumi",        // #165 1974年 年間37万組
  "tb4_3kumi_1kumi",       // #166 3組に1組 (といわれる)
  "tb4_1964_jiyuka",       // #167 1964年 海外旅行の自由化
  "tb4_500_doru",          // #168 年1回500ドルまで
  "tb4_jalpak_hatsubai",   // #169 1965年 ジャルパック
  "tb4_nedan_don",         // #170 67万5000円の値札
  "tb4_yume_no_yume",      // #171 庶民には夢のまた夢
  "tb4_kikoku_miyage",     // #172 帰国みやげは特別
  "tb4_bag_pops",          // #173 洋酒・チョコ・スカーフ
  "tb4_houkokusho",        // #174 土産話とともに手渡す
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const T_B4_PREVIEW_FRAMES = Math.max(T_B4_MOTIFS.length, 1);
export const TabiB4Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(T_B4_MOTIFS.length - 1, 0));
  const motif = T_B4_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {tabiB4Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 139} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
