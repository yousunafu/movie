// 「エレベーターの歴史」: ブロック2 = 第2章 (機械はあった、安心がなかった)。
// 担当範囲: 台本 docs/elevator-script-v1.txt の 30〜43行目 (文#29〜#42・14文)。
// motif 名は必ず el2_ で始める。WobbleDefs の seed はこのファイルでは 1100〜1199 を使う。
//
// ★絵づくりの6原則 (序章の修正で効いたもの。この章も全カットこれに従う)
//  ① 寄る        : 主役は画面の高さの半分以上。全体像を見せるのは章に1〜2枚だけ。
//  ② 世界を置く  : 紙の上に図を浮かせない。必ず空・床・壁・街を描いて「どこなのか」を出す。
//  ③ 部品を作り込む: 3回以上出るものは1つだけ精巧に作り、全カットで使い回す。
//                   この章の共通世界は ローマ / ヴェルサイユ / 19世紀の工場 の3つ。
//  ④ カメラを動かす: 引き→寄り、横移動、スポット。1枚のなかで視点が動く。
//  ⑤ 事件を起こす  : 札で説明しない。物が動く・開く・切れる・落ちる。
//  ⑥ 人が反応する  : 仕組みの図にも人を置いて、驚く・踏ん張る・青ざめる。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, EBadge } from "./ElevShared";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};
// (cx,cy) に向かってカメラを寄せる transform
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

// ===== 時代色 (KRP に無い色はここだけ。制作ガイドの「増やすなら2〜3色」の範囲) =====
const ROME_HI = "#9CC3DF"; // ローマの空 (上)
const ROME_LO = "#E7DCBE"; // ローマの空 (地平)
const SAND = "#D9C08A"; // 闘技場の砂
const SAND_DK = "#C0A66E";
const STONE = "#D7CAB1"; // 石灰岩
const STONE_DK = "#B9A98C";
const STONE_SH = "#95866C"; // 石の影
const VERS_WALL = "#F0E7D2"; // 宮殿の壁
const GILT = "#C9A33F"; // 金装飾
const PARQUET = "#C99B63"; // 寄木の床
const NIGHT_SKY = "#2A3650"; // 夜空の紺 (序章 ElevB0 と同じ値)
const BRICK = "#A9553F"; // 19世紀のレンガ
const BRICK_DK = "#8C4433";
const SOOT_HI = "#B9AE9A"; // 煤けた空
const SOOT_LO = "#D6C9AE";

// ===== シーンの共通ガワ =====
const Frame: React.FC<{
  f: number; seed: number; caption?: string; dark?: boolean; bg?: string;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, dark, bg, over, children }) => (
  <AbsoluteFill style={{ background: bg ?? KRP.cream }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={960} y={170} centerX text={caption} />}
    <EBadge />
    <Atmosphere f={f} dark={dark} />
  </AbsoluteFill>
);

// ===== 小物キット =====
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number; color?: string; fill?: string;
}> = ({ x, y, text, size = 34, t = 1, color = KRP.ink, fill = KRP.white }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = text.length * size + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={10}
        fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// 丸数字つきの図解ラベル (力の伝わり道の番号ふり)
const NumTag: React.FC<{ x: number; y: number; n: number; text: string; t?: number; size?: number }> =
  ({ x, y, n, text, t = 1, size = 30 }) => {
    const sc = pop(clamp01(t));
    if (sc <= 0) return null;
    const w = text.length * size + size * 2.6 + 26;
    return (
      <g transform={`translate(${x} ${y}) scale(${sc})`}>
        <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={size * 0.85}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-w / 2 + size * 0.95} cy={0} r={size * 0.7} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
        <text x={-w / 2 + size * 0.95} y={size * 0.32} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={size * 0.88} fill={KRP.white}>{n}</text>
        <text x={size * 0.62} y={size * 0.36} textAnchor="middle" fontFamily={FONT}
          fontWeight={900} fontSize={size} fill={KRP.ink}>{text}</text>
      </g>
    );
  };

const FlowArrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number; t?: number; color?: string; w?: number;
}> = ({ x1, y1, x2, y2, t = 1, color = KRP.orange, w = 10 }) => {
  const tt = easeOut(clamp01(t));
  if (tt <= 0) return null;
  const tx = lerp(x1, x2, tt), ty = lerp(y1, y2, tt);
  const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g>
      <line x1={x1} y1={y1} x2={tx} y2={ty} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <g transform={`translate(${tx} ${ty}) rotate(${a})`} opacity={tt}>
        <polygon points="6,0 -30,-19 -30,19" fill={color} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </g>
  );
};

const Burst: React.FC<{ x: number; y: number; r?: number; color?: string; t?: number; n?: number }> =
  ({ x, y, r = 60, color = KRP.orange, t = 1, n = 10 }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    return (
      <g transform={`translate(${x} ${y})`} opacity={tt}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + 0.25;
          const r1 = r * (0.55 + tt * 0.45);
          return (
            <line key={i} x1={Math.cos(a) * r * 0.55} y1={Math.sin(a) * r * 0.55}
              x2={Math.cos(a) * r1} y2={Math.sin(a) * r1}
              stroke={color} strokeWidth={6} strokeLinecap="round" />
          );
        })}
      </g>
    );
  };

const Heart: React.FC<{ x: number; y: number; s?: number; t?: number; f?: number }> =
  ({ x, y, s = 1, t = 1, f = 0 }) => {
    const sc = pop(clamp01(t)) * s * (1 + Math.sin(f / 7) * 0.07);
    if (sc <= 0) return null;
    return (
      <g transform={`translate(${x} ${y}) scale(${sc})`}>
        <path d="M 0 26 C -34 -2 -30 -34 -12 -34 C -4 -34 0 -27 0 -22 C 0 -27 4 -34 12 -34 C 30 -34 34 -2 0 26 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      </g>
    );
  };

const Sweat: React.FC<{ x: number; y: number; f: number; n?: number }> = ({ x, y, f, n = 2 }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: n }, (_, i) => {
      const p = ((f * 1.6 + i * 24) % 48) / 48;
      return (
        <ellipse key={i} cx={i * 26 - (n - 1) * 13} cy={p * 46} rx={8} ry={12}
          fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} opacity={1 - p} />
      );
    })}
  </g>
);

const Sparkle: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z"
        fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

// 滑車 (回転は rot で渡す)
const Pulley: React.FC<{ x: number; y: number; r?: number; rot?: number; color?: string }> =
  ({ x, y, r = 34, rot = 0, color = KRP.brass }) => (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={0} r={r} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`rotate(${rot})`}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={0} y1={0}
            x2={Math.cos((i / 6) * Math.PI * 2) * (r - 7)}
            y2={Math.sin((i / 6) * Math.PI * 2) * (r - 7)}
            stroke={KRP.ink} strokeWidth={3.5} />
        ))}
      </g>
      <circle cx={0} cy={0} r={r * 0.22} fill={KRP.ink} />
    </g>
  );

// 木箱
const Crate: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-46} y={-62} width={92} height={62} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} rx={4} />
    <line x1={-46} y1={-44} x2={46} y2={-44} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
    <line x1={-46} y1={-18} x2={46} y2={-18} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
    <line x1={-46} y1={-62} x2={46} y2={0} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
  </g>
);

// 煙・湯気
const Steam: React.FC<{ x: number; y: number; f: number; s?: number; n?: number; color?: string }> =
  ({ x, y, f, s = 1, n = 4, color = KRP.white }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: n }, (_, i) => {
        const p = ((f * 0.9 + i * (100 / n)) % 100) / 100;
        return (
          <circle key={i} cx={Math.sin(p * 4 + i) * 26} cy={-p * 190} r={20 + p * 40}
            fill={color} stroke={KRP.ink} strokeWidth={3} opacity={(1 - p) * 0.75} />
        );
      })}
    </g>
  );

// 松明 (ローマの地下用)
const Torch: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const w = 1 + Math.sin(f / 4) * 0.14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-18} r={78} fill={KRP.orange} opacity={0.17 * w} />
      <circle cx={0} cy={-18} r={46} fill={KRP.yellow} opacity={0.2 * w} />
      <rect x={-6} y={0} width={12} height={54} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} rx={3} />
      <path d={`M 0 ${-46 * w} C 20 -22 16 -2 0 -2 C -16 -2 -20 -22 0 ${-46 * w} Z`}
        fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M 0 ${-28 * w} C 10 -14 8 -4 0 -4 C -8 -4 -10 -14 0 ${-28 * w} Z`} fill={KRP.yellow} />
    </g>
  );
};

// ろうそく (宮殿用)
const Candle: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const w = 1 + Math.sin(f / 5) * 0.16;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-34} r={44} fill={KRP.yellow} opacity={0.16 * w} />
      <rect x={-7} y={-30} width={14} height={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} rx={3} />
      <path d={`M 0 ${-54 * w} C 9 -40 7 -31 0 -31 C -7 -31 -9 -40 0 ${-54 * w} Z`}
        fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
      <rect x={-16} y={6} width={32} height={8} fill={GILT} stroke={KRP.ink} strokeWidth={3} rx={3} />
    </g>
  );
};

const CrossMark: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={0.95}>
      <line x1={-42} y1={-42} x2={42} y2={42} stroke={KRP.red} strokeWidth={18} strokeLinecap="round" />
      <line x1={42} y1={-42} x2={-42} y2={42} stroke={KRP.red} strokeWidth={18} strokeLinecap="round" />
    </g>
  );
};

const CheckMark: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const tt = easeOut(clamp01(t));
  if (tt <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -34 2 L -10 28 L 36 -30" fill="none" stroke={KRP.green} strokeWidth={16}
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray={120} strokeDashoffset={120 * (1 - tt)} />
    </g>
  );
};

const Skull: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <path d="M -30 10 C -30 -26 -16 -38 0 -38 C 16 -38 30 -26 30 10 L 22 10 L 22 24 L -22 24 L -22 10 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={-12} cy={-6} r={8} fill={KRP.ink} />
      <circle cx={12} cy={-6} r={8} fill={KRP.ink} />
      <line x1={-8} y1={14} x2={-8} y2={24} stroke={KRP.ink} strokeWidth={3.5} />
      <line x1={8} y1={14} x2={8} y2={24} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

// 群衆用の小さい頭 (たくさん並べて密度を出す)
const MiniHead: React.FC<{ x: number; y: number; s?: number; color?: string; jump?: number; arms?: boolean }> =
  ({ x, y, s = 1, color = KRP.blueDeep, jump = 0, arms = false }) => (
    <g transform={`translate(${x} ${y - jump}) scale(${s})`}>
      <path d="M -13 16 C -13 2 -7 -3 0 -3 C 7 -3 13 2 13 16 Z" fill={color} stroke={KRP.ink} strokeWidth={2.6} />
      <circle cx={0} cy={-11} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.6} />
      {arms && (
        <>
          <line x1={-10} y1={4} x2={-19} y2={-13} stroke={KRP.ink} strokeWidth={2.8} strokeLinecap="round" />
          <line x1={10} y1={4} x2={19} y2={-13} stroke={KRP.ink} strokeWidth={2.8} strokeLinecap="round" />
        </>
      )}
    </g>
  );

// ===== 同一人物の見た目 (このファイル内で固定) =====
// ルイ15世: 青のコート + 白かつら + 金の縁取り
const LOUIS_COAT = KRP.blueDeep;
const LOUIS_DARK = "#38598C";
const Wig: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 -16 C -52 -62 -26 -84 0 -84 C 26 -84 52 -62 46 -16 C 40 10 26 18 20 6 C 14 -8 -14 -8 -20 6 C -26 18 -40 10 -46 -16 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    {[-34, -20, 20, 34].map((cx, i) => (
      <circle key={i} cx={cx} cy={-6 + (i % 2) * 12} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    ))}
  </g>
);
const Louis: React.FC<{ x: number; y: number; s?: number; f: number; face?: "normal" | "smile" | "surprised"; gaze?: [number, number] }> =
  ({ x, y, s = 1, f, face = "smile", gaze = [0, 0] }) => (
    <g>
      <Person x={x} y={y} s={s} f={f} cloth={LOUIS_COAT} clothDark={LOUIS_DARK}
        face={face} gaze={gaze} hair="none" phase={1} />
      <Wig x={x} y={y - 252 * s + Math.sin((f + 17) / 13) * 3} s={s * 0.92} />
    </g>
  );

// 係の人: 煤けた茶の作業着 + 鉢巻
const KAKARI_CLOTH = KRP.bronze;
const KAKARI_DARK = "#8A5733";
const Attendant: React.FC<{ x: number; y: number; s?: number; f: number; face?: "normal" | "worried" | "surprised"; lean?: number; still?: boolean }> =
  ({ x, y, s = 1, f, face = "worried", lean = 0, still }) => (
    <g>
      <Person x={x} y={y} s={s} f={f} cloth={KAKARI_CLOTH} clothDark={KAKARI_DARK}
        face={face} hair="cap" tasuki={KRP.white} lean={lean} phase={3} still={still} />
    </g>
  );

// ライオン
const Lion: React.FC<{ x: number; y: number; s?: number; f?: number; roar?: number }> =
  ({ x, y, s = 1, f = 0, roar = 0 }) => {
    const br = Math.sin(f / 11) * 2;
    const jaw = 10 + roar * 26;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* 影 */}
        <ellipse cx={6} cy={4} rx={116} ry={18} fill={KRP.ink} opacity={0.17} />
        {/* しっぽ */}
        <path d={`M -96 -74 C -150 -70 -152 -124 -124 ${-124 + br}`} fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        <circle cx={-124} cy={-124 + br} r={15} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        {/* 後ろ脚 */}
        <rect x={-86} y={-56} width={30} height={56} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 胴 */}
        <ellipse cx={-14} cy={-84 + br} rx={92} ry={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        {/* 前脚 */}
        <rect x={34} y={-58} width={30} height={58} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-2} y={-54} width={28} height={54} rx={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        {/* たてがみ */}
        <g transform={`translate(86 ${-126 + br})`}>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <ellipse key={i} cx={Math.cos(a) * 46} cy={Math.sin(a) * 46} rx={22} ry={17}
              transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 46} ${Math.sin(a) * 46})`}
              fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />;
          })}
          <circle cx={0} cy={0} r={50} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
          {/* 顔 */}
          <circle cx={6} cy={2} r={40} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-8} cy={-10} r={5.5} fill={KRP.ink} />
          <circle cx={20} cy={-10} r={5.5} fill={KRP.ink} />
          <path d="M 6 4 L -1 11 L 13 11 Z" fill={KRP.ink} />
          {/* 口 (roar で開く) */}
          <ellipse cx={6} cy={20 + jaw * 0.3} rx={14 + roar * 7} ry={jaw * 0.55} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          {roar > 0.3 && (
            <>
              <polygon points="-3,14 1,24 5,14" fill={KRP.white} />
              <polygon points="9,14 13,24 17,14" fill={KRP.white} />
            </>
          )}
        </g>
      </g>
    );
  };

// ===================================================================
// 世界1: 古代ローマ (#29 / #30 / #31 で使い回す)
// ===================================================================

// 空。dusk で夕方に変わる
const RomeSky: React.FC<{ f: number; dim?: number }> = ({ f, dim = 0 }) => (
  <g opacity={1 - dim * 0.45}>
    <rect x={-400} y={-400} width={2720} height={1480} fill={ROME_HI} />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-400} y={300 + i * 62} width={2720} height={64}
        fill={ROME_LO} opacity={0.1 + i * 0.11} />
    ))}
    <circle cx={1700} cy={168} r={62} fill={KRP.yellow} opacity={0.75} />
    {/* 雲 */}
    {[[280, 150, 1.1], [820, 96, 0.8], [1380, 196, 0.95], [1860, 108, 0.7]].map(([cx, cy, s], i) => (
      <g key={i} transform={`translate(${(cx as number) + Math.sin(f / 90 + i) * 14} ${cy}) scale(${s})`} opacity={0.72}>
        <ellipse cx={-46} cy={8} rx={52} ry={26} fill={KRP.white} />
        <ellipse cx={14} cy={-8} rx={64} ry={34} fill={KRP.white} />
        <ellipse cx={72} cy={10} rx={46} ry={24} fill={KRP.white} />
      </g>
    ))}
    {/* 鳥 */}
    {[[520, 268, 0], [596, 240, 7], [660, 286, 14]].map(([bx, by, ph], i) => {
      const w = Math.sin((f + (ph as number) * 3) / 9) * 7;
      const px = (bx as number) + f * 0.5;
      return (
        <path key={i} d={`M ${px - 16} ${by} Q ${px - 8} ${(by as number) - 9 - w} ${px} ${by} Q ${px + 8} ${(by as number) - 9 - w} ${px + 16} ${by}`}
          fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
      );
    })}
  </g>
);

// コロッセオの外観。局所原点 = 足元中央。幅980・高さ560 (s=1)
const ColosseoOuter: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const CW = 980, N = 9, AW = CW / N;
  const tierY = [0, -150, -300]; // 各段の下端
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={10} cy={6} rx={CW / 2 + 30} ry={30} fill={KRP.ink} opacity={0.14} />
      {/* 本体 */}
      <rect x={-CW / 2} y={-452} width={CW} height={452} fill={STONE} stroke={KRP.ink} strokeWidth={6} />
      {/* 最上部の壁 (アティカ) */}
      <rect x={-CW / 2} y={-560} width={CW} height={112} fill={STONE_DK} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={-CW / 2 + i * AW + AW / 2 - 17} y={-528} width={34} height={46}
          fill={STONE_SH} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 日よけの柱 (ウェラリウム用のマスト) */}
      {Array.from({ length: N + 1 }, (_, i) => (
        <line key={i} x1={-CW / 2 + i * AW} y1={-560} x2={-CW / 2 + i * AW} y2={-612}
          stroke={KRP.ink} strokeWidth={5} />
      ))}
      {/* 楕円の縁 (円形であることを出す) */}
      <ellipse cx={0} cy={-560} rx={CW / 2} ry={54} fill={STONE} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-556} rx={CW / 2 - 56} ry={34} fill={STONE_SH} stroke={KRP.ink} strokeWidth={5} />
      {/* アーチ3段 */}
      {tierY.map((ty, t) => (
        <g key={t}>
          <rect x={-CW / 2} y={ty - 150} width={CW} height={18} fill={STONE_DK} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: N }, (_, i) => {
            const cx = -CW / 2 + i * AW + AW / 2;
            const ow = 62, oh = 96;
            return (
              <g key={i}>
                <path d={`M ${cx - ow / 2} ${ty - 22} L ${cx - ow / 2} ${ty - oh} A ${ow / 2} ${ow / 2} 0 0 1 ${cx + ow / 2} ${ty - oh} L ${cx + ow / 2} ${ty - 22} Z`}
                  fill={STONE_SH} stroke={KRP.ink} strokeWidth={5} />
                {/* 柱 */}
                <rect x={cx + AW / 2 - 9} y={ty - 140} width={18} height={118}
                  fill={STONE_DK} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
                {/* 2段目3段目は像を置く */}
                {t > 0 && i % 2 === 1 && (
                  <g transform={`translate(${cx} ${ty - 34})`}>
                    <circle cx={0} cy={-62} r={9} fill={STONE} stroke={KRP.ink} strokeWidth={3} />
                    <path d="M -10 -52 L 10 -52 L 7 -12 L -7 -12 Z" fill={STONE} stroke={KRP.ink} strokeWidth={3} />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      ))}
      {/* 石積みの目地 */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={-CW / 2} y1={-40 - i * 48} x2={CW / 2} y2={-40 - i * 48}
          stroke={KRP.ink} strokeWidth={1.6} opacity={0.13} />
      ))}
      {/* 入口の人だかり */}
      {Array.from({ length: 22 }, (_, i) => (
        <MiniHead key={i} x={-CW / 2 + 40 + i * 42} y={-4} s={0.92}
          color={[KRP.blueDeep, KRP.red, KRP.green, KRP.orange, KRP.bronze][i % 5]}
          jump={Math.sin((f + i * 9) / 14) * 2} />
      ))}
    </g>
  );
};

// 闘技場の内側 (すり鉢の観客席 + 砂の舞台)。#31 で使う
const ArenaBowl: React.FC<{ f: number; cheer?: number }> = ({ f, cheer = 0 }) => {
  const rows = [
    { y: 404, s: 0.86, n: 30, o: 0.78 },
    { y: 470, s: 0.96, n: 27, o: 0.86 },
    { y: 544, s: 1.08, n: 24, o: 0.93 },
    { y: 626, s: 1.22, n: 21, o: 1 },
  ];
  return (
    <g>
      {/* 空 */}
      <rect x={-200} y={-200} width={2320} height={560} fill={ROME_HI} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={-200} y={180 + i * 36} width={2320} height={38} fill={ROME_LO} opacity={0.09 + i * 0.07} />
      ))}
      {/* 日よけの布 (ウェラリウム) */}
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M ${-60 + i * 250} -40 Q ${60 + i * 250} ${150 + Math.sin(f / 40 + i) * 10} ${190 + i * 250} -40`}
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} opacity={0.62} />
      ))}
      {/* 向こう側の外壁 */}
      <rect x={-200} y={300} width={2320} height={74} fill={STONE_DK} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={-160 + i * 88} y={316} width={30} height={42} fill={STONE_SH} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {/* 観客席のすり鉢 */}
      <path d="M -200 374 L 2120 374 L 2120 700 L -200 700 Z" fill={STONE} stroke="none" />
      {rows.map((r, ri) => (
        <g key={ri}>
          <rect x={-200} y={r.y - 6} width={2320} height={r.y === 626 ? 80 : 70}
            fill={ri % 2 ? STONE : STONE_DK} stroke={KRP.ink} strokeWidth={4} opacity={0.96} />
          {Array.from({ length: r.n }, (_, i) => (
            <MiniHead key={i} x={-120 + i * (2160 / r.n) + (ri % 2) * 22} y={r.y + 20} s={r.s * 0.92}
              color={[KRP.blueDeep, KRP.red, KRP.green, KRP.orange, KRP.bronze, KRP.blue][(i + ri) % 6]}
              arms={cheer > 0.4 && (i + ri) % 3 === 0}
              jump={cheer * (6 + ((i * 7 + ri * 3) % 9)) * (0.5 + 0.5 * Math.sin((f + i * 11) / 6))} />
          ))}
        </g>
      ))}
      {/* 舞台の手すり壁 */}
      <rect x={-200} y={694} width={2320} height={52} fill={STONE_DK} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 30 }, (_, i) => (
        <line key={i} x1={-180 + i * 72} y1={694} x2={-180 + i * 72} y2={746} stroke={KRP.ink} strokeWidth={2.4} opacity={0.3} />
      ))}
      {/* 砂の舞台 */}
      <rect x={-200} y={744} width={2320} height={400} fill={SAND} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={-200} y={744 + i * 70} width={2320} height={72} fill={SAND_DK} opacity={0.06 + i * 0.05} />
      ))}
      {Array.from({ length: 70 }, (_, i) => {
        const px = ((i * 137) % 2200) - 140;
        const py = 770 + ((i * 83) % 300);
        return <ellipse key={i} cx={px} cy={py} rx={7 + (i % 4) * 3} ry={3} fill={SAND_DK} opacity={0.4} />;
      })}
    </g>
  );
};

// コロッセオの地下 (ヒュポゲウム)。#30 で使う。床面 y=300、地下の底 y=900
const Hypogeum: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 地上: 砂の舞台と観客のシルエット */}
    <rect x={-200} y={-200} width={2320} height={500} fill={ROME_HI} opacity={0.5} />
    <rect x={-200} y={196} width={2320} height={60} fill={STONE_DK} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 26 }, (_, i) => (
      <MiniHead key={i} x={-120 + i * 82} y={196} s={0.95} color={[KRP.blueDeep, KRP.red, KRP.green, KRP.orange][i % 4]}
        jump={Math.sin((f + i * 13) / 15) * 3} />
    ))}
    <rect x={-200} y={256} width={2320} height={46} fill={SAND} stroke={KRP.ink} strokeWidth={5} />
    {/* 砂の粒 */}
    {Array.from({ length: 40 }, (_, i) => (
      <ellipse key={i} cx={((i * 151) % 2200) - 140} cy={268 + ((i * 37) % 24)} rx={6} ry={2.5} fill={SAND_DK} opacity={0.45} />
    ))}
    {/* 床を支える梁 */}
    {Array.from({ length: 13 }, (_, i) => (
      <rect key={i} x={-120 + i * 170} y={302} width={26} height={54} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
    ))}
    {/* 地下の壁 (石積み) */}
    <rect x={-200} y={302} width={2320} height={820} fill={STONE_SH} />
    {Array.from({ length: 11 }, (_, r) => (
      <g key={r}>
        <line x1={-200} y1={356 + r * 56} x2={2120} y2={356 + r * 56} stroke={KRP.ink} strokeWidth={2.4} opacity={0.22} />
        {Array.from({ length: 16 }, (_, c) => (
          <line key={c} x1={-160 + c * 146 + (r % 2) * 73} y1={356 + r * 56}
            x2={-160 + c * 146 + (r % 2) * 73} y2={412 + r * 56}
            stroke={KRP.ink} strokeWidth={2.2} opacity={0.18} />
        ))}
      </g>
    ))}
    {/* 奥のアーチ通路 */}
    {[220, 1560].map((ax, i) => (
      <path key={i} d={`M ${ax - 90} 900 L ${ax - 90} 560 A 90 90 0 0 1 ${ax + 90} 560 L ${ax + 90} 900 Z`}
        fill={KRP.ink} opacity={0.3} stroke={KRP.ink} strokeWidth={5} />
    ))}
    {/* 地下の床 */}
    <rect x={-200} y={892} width={2320} height={230} fill={STONE_DK} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ===================================================================
// 世界2: ヴェルサイユ (#32 〜 #37 で使い回す)
// ===================================================================

// 夕暮れ / 夜の空
const VersSky: React.FC<{ f: number; night?: boolean }> = ({ f, night }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1480} fill={night ? NIGHT_SKY : "#8EA8C8"} />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-400} y={250 + i * 58} width={2720} height={60}
        fill={night ? "#3C4A6B" : KRP.orange} opacity={night ? 0.1 + i * 0.07 : 0.07 + i * 0.08} />
    ))}
    {night ? (
      <>
        <circle cx={300} cy={176} r={58} fill={KRP.cream} opacity={0.92} />
        <circle cx={322} cy={164} r={50} fill={NIGHT_SKY} opacity={0.75} />
        {Array.from({ length: 26 }, (_, i) => {
          const sx = ((i * 211) % 1900) + 20;
          const sy = ((i * 97) % 380) + 40;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin((f + i * 23) / 24));
          return <circle key={i} cx={sx} cy={sy} r={2.6} fill={KRP.white} opacity={tw * 0.9} />;
        })}
      </>
    ) : (
      <circle cx={1620} cy={300} r={78} fill={KRP.orange} opacity={0.72} />
    )}
    {!night && [[340, 170, 1.0], [1100, 120, 0.85], [1760, 210, 0.7]].map(([cx, cy, s], i) => (
      <g key={i} transform={`translate(${(cx as number) + Math.sin(f / 100 + i) * 12} ${cy}) scale(${s})`} opacity={0.6}>
        <ellipse cx={-40} cy={8} rx={54} ry={22} fill={KRP.cream} />
        <ellipse cx={20} cy={-6} rx={66} ry={30} fill={KRP.cream} />
      </g>
    ))}
  </g>
);

// 宮殿の外観。局所原点 = 足元中央。幅1180・高さ400 (s=1)
const PalaceOuter: React.FC<{ x: number; y: number; s?: number; f: number; night?: boolean; lit2F?: number }> =
  ({ x, y, s = 1, f, night, lit2F = 0 }) => {
    const BW = 1180;
    const winFill = night ? (0.3 + lit2F * 0.7 > 0.5 ? KRP.yellow : "#5A6B8C") : KRP.blueSoft;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={6} rx={BW / 2 + 40} ry={26} fill={KRP.ink} opacity={0.15} />
        {/* 翼棟 (左右) */}
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <rect x={sg === -1 ? -BW / 2 : BW / 2 - 330} y={-258} width={330} height={258}
              fill={VERS_WALL} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M ${sg === -1 ? -BW / 2 - 16 : BW / 2 - 346} -258 L ${sg === -1 ? -BW / 2 + 22 : BW / 2 - 308} -318 L ${sg === -1 ? -BW / 2 + 308 : BW / 2 - 22} -318 L ${sg === -1 ? -BW / 2 + 346 : BW / 2 + 16} -258 Z`}
              fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
        {/* 中央棟 (少し高い) */}
        <rect x={-270} y={-330} width={540} height={330} fill={VERS_WALL} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -292 -330 L -248 -404 L 248 -404 L 292 -330 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 中央のペディメント */}
        <path d="M -118 -330 L 0 -412 L 118 -330 Z" fill={VERS_WALL} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={-356} r={20} fill={GILT} stroke={KRP.ink} strokeWidth={4} />
        {/* 屋根の飾り */}
        {[-200, -100, 100, 200].map((rx, i) => (
          <g key={i}>
            <line x1={rx} y1={-404} x2={rx} y2={-440} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={rx} cy={-448} r={9} fill={GILT} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
        {/* 窓 (2階ぶん × たくさん) */}
        {Array.from({ length: 22 }, (_, i) => {
          const wx = -BW / 2 + 32 + i * 52;
          const is2F = true;
          const lit = night && ((i * 5) % 7 < 2 || (i === 11 && lit2F > 0.3));
          return (
            <g key={i}>
              {/* 1階: アーチ窓 */}
              <path d={`M ${wx} -84 L ${wx} -148 A 15 15 0 0 1 ${wx + 30} -148 L ${wx + 30} -84 Z`}
                fill={night ? (lit ? KRP.yellow : "#5A6B8C") : KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
              {/* 2階 */}
              {is2F && (
                <rect x={wx} y={-238} width={30} height={76}
                  fill={i === 11 && lit2F > 0.1 ? KRP.yellow : winFill} stroke={KRP.ink} strokeWidth={4} />
              )}
            </g>
          );
        })}
        {/* 中央の大窓 */}
        {[-80, -20, 40].map((wx, i) => (
          <rect key={i} x={wx} y={-306} width={42} height={96}
            fill={night ? KRP.yellow : KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {/* 基壇と階段 */}
        <rect x={-BW / 2 - 24} y={-26} width={BW + 48} height={26} fill={STONE_DK} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-150} y={-14} width={300} height={16} fill={STONE} stroke={KRP.ink} strokeWidth={4} />
        {/* 石の目地 */}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={-BW / 2} y1={-40 - i * 44} x2={BW / 2} y2={-40 - i * 44}
            stroke={KRP.ink} strokeWidth={1.6} opacity={0.12} />
        ))}
      </g>
    );
  };

// 宮殿の庭 (#33 用)。手前に花壇と噴水
const PalaceGarden: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 芝 */}
    <rect x={-200} y={900} width={2320} height={240} fill="#A9B88A" stroke={KRP.ink} strokeWidth={5} />
    {/* 砂利の道 */}
    <path d="M 760 900 L 1160 900 L 1500 1120 L 420 1120 Z" fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
    {/* 刈り込み花壇 (パルテール) */}
    {[-1, 1].map((sg) => (
      <g key={sg}>
        <ellipse cx={960 + sg * 520} cy={990} rx={250} ry={74} fill="#8FA86E" stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={960 + sg * 520} cy={990} rx={160} ry={44} fill="none" stroke={KRP.cream} strokeWidth={6} />
        <ellipse cx={960 + sg * 520} cy={990} rx={80} ry={22} fill="none" stroke={KRP.cream} strokeWidth={5} />
      </g>
    ))}
    {/* 円錐の植木 */}
    {[160, 420, 1500, 1760].map((tx, i) => (
      <g key={i}>
        <path d={`M ${tx} 790 L ${tx + 42} 926 L ${tx - 42} 926 Z`} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
        <rect x={tx - 10} y={926} width={20} height={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    {/* 噴水 */}
    <g transform="translate(960 968)">
      <ellipse cx={0} cy={0} rx={150} ry={46} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-6} rx={120} ry={32} fill={KRP.blue} opacity={0.5} />
      <rect x={-14} y={-76} width={28} height={76} fill={GILT} stroke={KRP.ink} strokeWidth={4.5} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = -Math.PI / 2 + (i - 3) * 0.3;
        const p = ((f * 2 + i * 9) % 40) / 40;
        return (
          <path key={i} d={`M 0 -78 Q ${Math.cos(a) * 70} ${-130 + p * 12} ${Math.cos(a) * 128} -6`}
            fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.7} />
        );
      })}
    </g>
  </g>
);

// 宮殿の室内 (金の壁板・寄木の床)。x,y = 部屋の左上、w,h = 大きさ
const PalaceRoom: React.FC<{ x: number; y: number; w: number; h: number; f: number; dim?: number }> =
  ({ x, y, w, h, f, dim = 0 }) => {
    const floorH = Math.min(150, h * 0.22);
    const panels = Math.max(2, Math.floor(w / 190));
    return (
      <g transform={`translate(${x} ${y})`} opacity={1 - dim}>
        {/* 壁 */}
        <rect x={0} y={0} width={w} height={h} fill={VERS_WALL} stroke={KRP.ink} strokeWidth={6} />
        {/* 金の壁板 */}
        {Array.from({ length: panels }, (_, i) => {
          const pw = w / panels;
          return (
            <g key={i}>
              <rect x={i * pw + 22} y={34} width={pw - 44} height={h - floorH - 72}
                fill="none" stroke={GILT} strokeWidth={5} rx={10} />
              <rect x={i * pw + 38} y={50} width={pw - 76} height={h - floorH - 104}
                fill="none" stroke={GILT} strokeWidth={2.6} rx={8} opacity={0.75} />
              <circle cx={i * pw + pw / 2} cy={78} r={11} fill={GILT} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 天井の縁飾り */}
        <rect x={0} y={0} width={w} height={26} fill={GILT} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        {/* 寄木の床 */}
        <rect x={0} y={h - floorH} width={w} height={floorH} fill={PARQUET} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: Math.ceil(w / 54) }, (_, i) => (
          <g key={i}>
            <line x1={i * 54} y1={h - floorH} x2={i * 54 + floorH} y2={h} stroke={KRP.ink} strokeWidth={2.4} opacity={0.3} />
            <line x1={i * 54 + floorH} y1={h - floorH} x2={i * 54} y2={h} stroke={KRP.ink} strokeWidth={2.4} opacity={0.3} />
          </g>
        ))}
        <line x1={0} y1={h - floorH} x2={w} y2={h - floorH} stroke={KRP.ink} strokeWidth={5} />
      </g>
    );
  };

// シャンデリア
const Chandelier: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f / 60) * 1.2})`}>
    <line x1={0} y1={-110} x2={0} y2={-34} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={0} cy={-26} r={16} fill={GILT} stroke={KRP.ink} strokeWidth={4} />
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      const ax = Math.cos(a) * 62, ay = Math.sin(a) * 22;
      return (
        <g key={i}>
          <path d={`M 0 -20 Q ${ax * 0.6} ${ay + 16} ${ax} ${ay}`} fill="none" stroke={GILT} strokeWidth={5} />
          <Candle x={ax} y={ay} f={f + i * 5} s={0.62} />
        </g>
      );
    })}
    <circle cx={0} cy={0} r={76} fill={KRP.yellow} opacity={0.12} />
  </g>
);

// 天蓋ベッド (愛人の部屋)
const CanopyBed: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-96, 96].map((px, i) => (
      <rect key={i} x={px - 7} y={-230} width={14} height={230} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
    ))}
    <rect x={-112} y={-252} width={224} height={30} fill={GILT} stroke={KRP.ink} strokeWidth={4.5} rx={6} />
    {/* 天蓋の布 */}
    <path d="M -112 -222 Q -74 -150 -96 -58 L -58 -58 Q -78 -150 -46 -222 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 112 -222 Q 74 -150 96 -58 L 58 -58 Q 78 -150 46 -222 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
    {/* マットレス */}
    <rect x={-100} y={-62} width={200} height={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} rx={8} />
    <rect x={-100} y={-34} width={200} height={34} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} rx={6} />
    <rect x={-84} y={-80} width={58} height={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} rx={10} />
  </g>
);

// ===================================================================
// 世界3: 19世紀の工場 (#38 〜 #42 で使い回す)
// ===================================================================

const SootSky: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-400} y={-400} width={2720} height={1480} fill={SOOT_HI} />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-400} y={240 + i * 56} width={2720} height={58} fill={SOOT_LO} opacity={0.1 + i * 0.1} />
    ))}
    <circle cx={1500} cy={200} r={66} fill={KRP.cream} opacity={0.45} />
    {/* 煤けた雲 */}
    {[[260, 150, 1.2], [900, 110, 1.0], [1700, 180, 0.9]].map(([cx, cy, s], i) => (
      <g key={i} transform={`translate(${(cx as number) + Math.sin(f / 110 + i) * 10} ${cy}) scale(${s})`} opacity={0.5}>
        <ellipse cx={-50} cy={8} rx={60} ry={26} fill={KRP.grayDark} />
        <ellipse cx={20} cy={-8} rx={74} ry={34} fill={KRP.grayDark} />
        <ellipse cx={86} cy={10} rx={52} ry={24} fill={KRP.grayDark} />
      </g>
    ))}
  </g>
);

// レンガ壁 (目地つき)
const BrickWall: React.FC<{ x: number; y: number; w: number; h: number; opacity?: number; dark?: boolean }> =
  ({ x, y, w, h, opacity = 1, dark }) => (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={0} y={0} width={w} height={h} fill={dark ? BRICK_DK : BRICK} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: Math.ceil(h / 30) }, (_, r) => (
        <g key={r}>
          <line x1={0} y1={r * 30} x2={w} y2={r * 30} stroke={KRP.ink} strokeWidth={1.8} opacity={0.22} />
          {Array.from({ length: Math.ceil(w / 68) }, (_, c) => (
            <line key={c} x1={c * 68 + (r % 2) * 34} y1={r * 30} x2={c * 68 + (r % 2) * 34} y2={r * 30 + 30}
              stroke={KRP.ink} strokeWidth={1.8} opacity={0.18} />
          ))}
        </g>
      ))}
    </g>
  );

// 工場の内部 (レンガ壁・高窓からの光・板張りの床・梁)
const MillInterior: React.FC<{ f: number; dim?: number }> = ({ f, dim = 0 }) => (
  <g opacity={1 - dim}>
    <BrickWall x={-200} y={-200} w={2320} h={1120} />
    {/* 高窓 3つ + 光の筋 */}
    {[280, 960, 1640].map((wx, i) => (
      <g key={i}>
        <path d={`M ${wx - 110} 330 L ${wx - 110} 170 A 110 110 0 0 1 ${wx + 110} 170 L ${wx + 110} 330 Z`}
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <line x1={wx} y1={64} x2={wx} y2={330} stroke={KRP.ink} strokeWidth={4} />
        <line x1={wx - 110} y1={236} x2={wx + 110} y2={236} stroke={KRP.ink} strokeWidth={4} />
        {/* 斜めに落ちる光 */}
        <path d={`M ${wx - 110} 330 L ${wx + 110} 330 L ${wx + 330} 920 L ${wx + 110} 920 Z`}
          fill={KRP.yellow} opacity={0.1} />
      </g>
    ))}
    {/* 梁 */}
    <rect x={-200} y={330} width={2320} height={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    {[140, 620, 1300, 1780].map((px, i) => (
      <rect key={i} x={px - 15} y={356} width={30} height={560} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} opacity={0.85} />
    ))}
    {/* 板張りの床 */}
    <rect x={-200} y={892} width={2320} height={260} fill={KRP.floor} stroke={KRP.ink} strokeWidth={6} />
    {Array.from({ length: 18 }, (_, i) => (
      <line key={i} x1={-180 + i * 124} y1={892} x2={-180 + i * 124} y2={1120} stroke={KRP.ink} strokeWidth={2.4} opacity={0.26} />
    ))}
    {/* 舞い上がる埃 */}
    {Array.from({ length: 14 }, (_, i) => {
      const p = ((f * 0.5 + i * 31) % 160) / 160;
      return <circle key={i} cx={((i * 229) % 1900) + 20} cy={880 - p * 620} r={3 + (i % 3)} fill={KRP.white} opacity={(1 - p) * 0.3} />;
    })}
  </g>
);

// 工場の外観 1棟。局所原点 = 足元中央
const Mill: React.FC<{ x: number; y: number; s?: number; f: number; floors?: number; chimney?: boolean; hoist?: number }> =
  ({ x, y, s = 1, f, floors = 4, chimney = true, hoist }) => {
    const BW = 330, FH = 108;
    const topY = -floors * FH;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={5} rx={BW / 2 + 20} ry={18} fill={KRP.ink} opacity={0.15} />
        {chimney && (
          <>
            <rect x={BW / 2 - 74} y={topY - 250} width={46} height={254} fill={BRICK_DK} stroke={KRP.ink} strokeWidth={5} />
            <rect x={BW / 2 - 82} y={topY - 262} width={62} height={20} fill={BRICK_DK} stroke={KRP.ink} strokeWidth={5} />
            <Steam x={BW / 2 - 51} y={topY - 268} f={f} s={0.78} n={4} color={KRP.gray} />
          </>
        )}
        <BrickWall x={-BW / 2} y={topY} w={BW} h={floors * FH} />
        {/* 切妻屋根 */}
        <path d={`M ${-BW / 2 - 20} ${topY} L 0 ${topY - 66} L ${BW / 2 + 20} ${topY} Z`}
          fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 窓 */}
        {Array.from({ length: floors }, (_, r) =>
          Array.from({ length: 3 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-BW / 2 + 34 + c * 98} y={topY + 26 + r * FH} width={54} height={66}
              fill={(r * 3 + c) % 4 === 0 ? KRP.yellow : "#6E7B88"} stroke={KRP.ink} strokeWidth={4} />
          )),
        )}
        {/* 荷揚げ口 + 梁 + 滑車 */}
        {hoist !== undefined && (
          <g>
            <rect x={-54} y={topY + 26} width={108} height={96} fill={KRP.ink} opacity={0.55} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-10} y={topY - 36} width={108} height={14} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
            <Pulley x={86} y={-8 + topY} r={15} rot={hoist * 420} />
            <line x1={86} y1={topY + 6} x2={86} y2={topY + 6 + (1 - hoist) * (floors * FH - 120)} stroke={KRP.ink} strokeWidth={4} />
            <Crate x={86} y={topY + 6 + (1 - hoist) * (floors * FH - 120) + 60} s={0.5} />
          </g>
        )}
        {/* 扉 */}
        <rect x={-42} y={-86} width={84} height={86} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      </g>
    );
  };

// ===================================================================
// #29 実は、物を上に運ぶ機械そのものは、大昔からありました。
//     引きのローマの街 → ゆっくりコロッセオへ寄る
// ===================================================================
const SceneOomukashi: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.95 * easeInOut(seg(f, 12, 124));
  return (
    <Frame f={f} seed={1100} caption="上に運ぶ機械は 大昔からあった"
      over={<>{f >= 80 && <Stamp x={1430} y={700} text="大昔から" size={56} />}</>}>
      <g transform={zoomAt(z, 1020, 600)}>
        <RomeSky f={f} />
        {/* 遠くの丘 */}
        <path d="M -200 700 Q 240 596 660 700 Z" fill="#9FAE86" opacity={0.6} />
        <path d="M 1240 700 Q 1700 584 2120 700 Z" fill="#9FAE86" opacity={0.6} />
        {/* 水道橋 (左奥) */}
        <g opacity={0.8}>
          <rect x={-200} y={600} width={620} height={26} fill={STONE_DK} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M ${-180 + i * 104} 700 L ${-180 + i * 104} 660 A 32 32 0 0 1 ${-116 + i * 104} 660 L ${-116 + i * 104} 700 Z`}
              fill={STONE} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        {/* 糸杉 */}
        {[520, 600, 1640, 1740].map((tx, i) => (
          <g key={i}>
            <ellipse cx={tx} cy={632} rx={22} ry={76} fill="#5E7E55" stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={tx - 7} y={700} width={14} height={30} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
        {/* 地面 */}
        <rect x={-200} y={700} width={2320} height={420} fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
        {/* 石畳 */}
        {Array.from({ length: 7 }, (_, r) => (
          <g key={r}>
            <line x1={-200} y1={740 + r * 52} x2={2120} y2={740 + r * 52} stroke={KRP.ink} strokeWidth={2} opacity={0.2} />
            {Array.from({ length: 20 }, (_, c) => (
              <line key={c} x1={-160 + c * 118 + (r % 2) * 59} y1={740 + r * 52}
                x2={-160 + c * 118 + (r % 2) * 59} y2={792 + r * 52} stroke={KRP.ink} strokeWidth={2} opacity={0.16} />
            ))}
          </g>
        ))}
        <ColosseoOuter x={1020} y={700} s={0.74} f={f} />
        {/* 手前を歩くローマ人 */}
        <Person x={330} y={880} s={0.9} f={f} cloth={KRP.cream} clothDark={KRP.floor} phase={2} gaze={[4, -3]} />
        <Person x={1680} y={898} s={0.96} f={f} cloth={KRP.red} clothDark="#A8301F" phase={5} gaze={[-5, -3]} />
      </g>
    </Frame>
  );
};

// ===================================================================
// #30 古代ローマのコロッセオには、猛獣を舞台へ運ぶ昇降機があった。
//     地下へ寄る。人力ウインチ→ロープ→かご が ①②③ で順につながる
// ===================================================================
const SceneColosseo: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.42 * easeInOut(seg(f, 10, 86));
  const push = easeInOut(seg(f, 40, 110)); // ウインチを回す量
  const rot = push * 190;
  const cageY = lerp(760, 420, push); // かごが上がる
  return (
    <Frame f={f} seed={1101} dark caption="コロッセオの床下に 昇降機">
      <g transform={zoomAt(z, 900, 660)}>
        <Hypogeum f={f} />
        <Torch x={240} y={620} f={f} s={1.15} />
        <Torch x={1640} y={620} f={f + 9} s={1.15} />

        {/* 昇降路 (石の縦穴) */}
        <rect x={1096} y={302} width={260} height={592} fill={KRP.ink} opacity={0.34} />
        <line x1={1096} y1={302} x2={1096} y2={894} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1356} y1={302} x2={1356} y2={894} stroke={KRP.ink} strokeWidth={6} />
        {/* 床のはね上げ戸 */}
        <rect x={1096} y={256} width={260} height={46} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />

        {/* 滑車 (天井の梁) */}
        <rect x={1060} y={330} width={330} height={22} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <Pulley x={1226} y={382} r={40} rot={-rot} />

        {/* ロープ: ウインチ → 滑車 → かご */}
        <line x1={620} y1={690} x2={1186} y2={382} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1226} y1={422} x2={1226} y2={cageY - 118} stroke={KRP.ink} strokeWidth={7} />

        {/* かご (木枠の檻) */}
        <g transform={`translate(1226 ${cageY})`}>
          <rect x={-104} y={-118} width={208} height={118} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-104} y={-118} width={208} height={118} fill={SAND} opacity={0.25} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={-88 + i * 29} y1={-118} x2={-88 + i * 29} y2={0} stroke={KRP.ink} strokeWidth={5} />
          ))}
          <Lion x={6} y={-6} s={0.36} f={f} roar={seg(f, 70, 100) * 0.8} />
        </g>

        {/* 人力ウインチ (大きく・2人で押す) */}
        <g transform="translate(560 894)">
          <ellipse cx={0} cy={2} rx={150} ry={22} fill={KRP.ink} opacity={0.2} />
          <rect x={-66} y={-204} width={132} height={204} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={-66} y1={-180 + i * 42} x2={66} y2={-180 + i * 42} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          ))}
          {/* 巻かれたロープ */}
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} cx={0} cy={-176 + i * 26} rx={70} ry={11} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.65} />
          ))}
          {/* 押し棒 (回転) */}
          <g transform={`rotate(${rot * 0.35})`}>
            <rect x={-200} y={-222} width={400} height={16} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} rx={8} />
          </g>
          <Pulley x={0} y={-212} r={26} rot={rot} color={KRP.copper} />
        </g>
        {/* 押す2人 (踏ん張る) */}
        <Attendant x={398} y={894} s={0.94} f={f} face="worried" lean={11} />
        <Attendant x={726} y={894} s={0.94} f={f + 7} face="worried" lean={-11} />
        <Sweat x={366} y={636} f={f} n={2} />
        <Sweat x={758} y={636} f={f + 11} n={2} />

        {/* 力の伝わり道 */}
        <FlowArrow x1={640} y1={620} x2={1130} y2={400} t={seg(f, 54, 76)} w={9} />
        <FlowArrow x1={1300} y1={430} x2={1300} y2={cageY - 140} t={seg(f, 76, 96)} w={9} />
      </g>
      <NumTag x={416} y={398} n={1} text="人力ウインチ" t={seg(f, 44, 60)} size={30} />
      <NumTag x={820} y={312} n={2} text="ロープ" t={seg(f, 62, 78)} size={30} />
      <NumTag x={1612} y={520} n={3} text="かご" t={seg(f, 84, 100)} size={30} />
    </Frame>
  );
};

// ===================================================================
// #31 ライオンが、床の下からせり上がってくる仕掛けです。 (章の見せ場)
//     砂の舞台に寄る。戸が開き、ライオンが大きくせり上がり、観客が総立ち
// ===================================================================
const SceneLionAgaru: React.FC<{ f: number }> = ({ f }) => {
  const open = easeInOut(seg(f, 14, 50)); // はね上げ戸
  const rise = easeInOut(seg(f, 36, 102)); // せり上がり
  const cheer = seg(f, 64, 96);
  const z = 1 + 0.28 * easeInOut(seg(f, 0, 110));
  const lionY = lerp(1040, 846, rise);
  return (
    <Frame f={f} seed={1102} caption="床の下から ライオンがせり上がる">
      <g transform={zoomAt(z, 960, 700)}>
        <ArenaBowl f={f} cheer={cheer} />
        {/* 穴 */}
        <ellipse cx={960} cy={852} rx={200 * open} ry={30 * open} fill={KRP.ink} opacity={0.7} />
        {/* はね上げ戸 (2枚が左右に開く) */}
        {[-1, 1].map((sg) => (
          <g key={sg} transform={`translate(${960 + sg * (10 + open * 196)} 846) rotate(${sg * open * 42})`}>
            <rect x={sg === -1 ? -186 : 0} y={-16} width={186} height={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 4 }, (_, i) => (
              <line key={i} x1={(sg === -1 ? -186 : 0) + 38 + i * 38} y1={-16}
                x2={(sg === -1 ? -186 : 0) + 38 + i * 38} y2={10} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
            ))}
          </g>
        ))}
        {/* せり上がる床板 */}
        <rect x={830} y={lionY} width={260} height={28} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        {/* ライオン (大きく) */}
        <g opacity={rise > 0.02 ? 1 : 0}>
          <Lion x={940} y={lionY} s={1.05} f={f} roar={seg(f, 72, 98)} />
        </g>
        {/* 砂埃 */}
        {Array.from({ length: 12 }, (_, i) => {
          const p = ((f * 1.3 + i * 17) % 70) / 70;
          return (
            <circle key={i} cx={960 + (i - 6) * 42 + Math.sin(i) * 16} cy={866 - p * 70}
              r={16 + p * 30} fill={SAND_DK} opacity={(1 - p) * 0.45 * rise} />
          );
        })}
        <Burst x={1158} y={636} r={96} t={seg(f, 76, 94)} n={12} color={KRP.red} />
      </g>
      <TagPlate x={420} y={494} text="せり上がる" size={46} t={seg(f, 44, 62)} fill={KRP.yellow} />
      <TagPlate x={1560} y={398} text="観客は大よろこび" size={38} t={seg(f, 84, 102)} />
    </Frame>
  );
};

// ===================================================================
// #32 18世紀のフランスには、もっとすごいのがあります。
//     カメラが右へ横移動して、ローマの街からフランスの宮殿前へ
// ===================================================================
const SceneFranceE: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 10, 112));
  const camX = -pan * 2150;
  return (
    <Frame f={f} seed={1103} caption="お次は 18世紀のフランス"
      over={<>{f >= 92 && <Stamp x={1340} y={712} text="もっとすごい" size={48} />}</>}>
      <g transform={`translate(${camX} 0)`}>
        {/* 空は通しで1枚 */}
        <rect x={-300} y={-300} width={5000} height={1380} fill="#9CC3DF" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={-300} y={300 + i * 62} width={5000} height={64} fill={ROME_LO} opacity={0.08 + i * 0.09} />
        ))}
        <circle cx={1700} cy={168} r={62} fill={KRP.yellow} opacity={0.7} />
        {/* 地面 (通し) */}
        <rect x={-300} y={760} width={5000} height={420} fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
        <rect x={2400} y={760} width={2300} height={420} fill="#A9B88A" stroke={KRP.ink} strokeWidth={5} />
        {/* 左: ローマ */}
        <ColosseoOuter x={620} y={760} s={0.52} f={f} />
        {[1180, 1300].map((tx, i) => (
          <ellipse key={i} cx={tx} cy={690} rx={20} ry={72} fill="#5E7E55" stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {/* 道しるべ */}
        <g transform="translate(1680 760)">
          <rect x={-8} y={-210} width={16} height={210} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
          <g transform="translate(0 -186)">
            <path d="M -8 -26 L 152 -26 L 186 0 L 152 26 L -8 26 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <text x={78} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>パリへ</text>
          </g>
          <g transform="translate(0 -118)">
            <path d="M 8 -24 L -144 -24 L -176 0 L -144 24 L 8 24 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            <text x={-80} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.grayDark}>ローマ</text>
          </g>
        </g>
        {/* 中: 並木 */}
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={1980 + i * 150} y={620} width={18} height={142} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={1989 + i * 150} cy={596} r={54} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 右: ヴェルサイユ */}
        <PalaceOuter x={3300} y={760} s={0.62} f={f} />
        {[2880, 3730].map((tx, i) => (
          <g key={i}>
            <path d={`M ${tx} 640 L ${tx + 36} 762 L ${tx - 36} 762 Z`} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 馬車 */}
        <g transform="translate(3060 760)">
          <circle cx={-52} cy={-26} r={26} fill="none" stroke={KRP.ink} strokeWidth={6} />
          <circle cx={56} cy={-30} r={30} fill="none" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-70} y={-118} width={140} height={78} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={-46} y={-104} width={44} height={38} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      <TagPlate x={1480} y={310} text="18世紀 フランス" size={44} t={seg(f, 86, 104)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===================================================================
// #33 1743年、ヴェルサイユ宮殿。
//     引きの庭 → 2階の窓へゆっくり寄る
// ===================================================================
const SceneVersailles: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 1.15 * easeInOut(seg(f, 16, 126));
  return (
    <Frame f={f} seed={1104} caption="1743年 ヴェルサイユ宮殿"
      over={<>{f >= 10 && <Stamp x={1430} y={300} text="1743年" size={62} />}</>}>
      <g transform={zoomAt(z, 960, 560)}>
        <VersSky f={f} />
        <PalaceOuter x={960} y={768} s={1.0} f={f} />
        <PalaceGarden f={f} />
        {/* 衛兵 */}
        <Person x={700} y={830} s={0.52} f={f} cloth={KRP.red} clothDark="#A8301F" phase={2} still />
        <Person x={1220} y={830} s={0.52} f={f} cloth={KRP.red} clothDark="#A8301F" phase={4} still />
        {/* 庭を歩く貴族 */}
        <Louis x={470} y={960} s={0.66} f={f} face="smile" gaze={[5, 0]} />
        <Person x={1480} y={972} s={0.68} f={f} cloth={KRP.yellow} clothDark={GILT} hair="none" phase={6} gaze={[-5, 0]} />
      </g>
      <TagPlate x={330} y={520} text="王様の家" size={40} t={seg(f, 74, 92)} />
    </Frame>
  );
};

// ===================================================================
// #34 ルイ15世は、自分専用の昇降機「空飛ぶ椅子」を作らせました。
//     金の広間。壁の溝を椅子が実際に上がる
// ===================================================================
const SceneTobuIsu: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeInOut(seg(f, 34, 116));
  const chairY = lerp(792, 476, rise);
  const z = 1 + 0.3 * easeInOut(seg(f, 6, 90));
  return (
    <Frame f={f} seed={1105} caption="ルイ15世専用の「空飛ぶ椅子」">
      <g transform={zoomAt(z, 1130, 620)}>
        <PalaceRoom x={120} y={250} w={1680} h={660} f={f} />
        <Chandelier x={620} y={352} s={1.05} f={f} />
        {/* 大きな鏡 */}
        <g transform="translate(360 560)">
          <rect x={-104} y={-180} width={208} height={330} rx={100} fill={KRP.blueSoft} stroke={GILT} strokeWidth={10} />
          <rect x={-104} y={-180} width={208} height={330} rx={100} fill="none" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -70 110 L 20 -130" stroke={KRP.white} strokeWidth={12} opacity={0.5} />
        </g>
        <Candle x={900} y={700} f={f} s={1.15} />
        {/* 壁の溝 (昇降路) */}
        <rect x={1046} y={272} width={240} height={638} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
        <line x1={1082} y1={272} x2={1082} y2={910} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        <line x1={1250} y1={272} x2={1250} y2={910} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        <Pulley x={1166} y={330} r={34} rot={rise * 420} color={GILT} />
        <line x1={1166} y1={364} x2={1166} y2={chairY - 150} stroke={KRP.ink} strokeWidth={6} />
        {/* おもり */}
        <line x1={1230} y1={340} x2={1230} y2={lerp(430, 760, rise)} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1210} y={lerp(430, 760, rise)} width={40} height={88} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 金の椅子 + ルイ */}
        <g transform={`translate(1150 ${chairY})`}>
          <rect x={-96} y={-150} width={192} height={24} fill={GILT} stroke={KRP.ink} strokeWidth={5} rx={6} />
          <rect x={-70} y={-126} width={140} height={126} fill={GILT} stroke={KRP.ink} strokeWidth={5.5} rx={10} />
          <rect x={-52} y={-108} width={104} height={92} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} rx={8} />
        </g>
        <Louis x={1150} y={chairY - 6} s={0.74} f={f} face="smile" gaze={[0, -3]} />
        <Sparkle x={1310} y={chairY - 180} s={0.9} t={seg(f, 60, 80)} />
        <Sparkle x={1000} y={chairY - 110} s={0.68} t={seg(f, 70, 90)} />
        <FlowArrow x1={1390} y1={820} x2={1390} y2={520} t={seg(f, 48, 78)} w={11} />
      </g>
      <TagPlate x={1636} y={330} text="空飛ぶ椅子" size={44} t={seg(f, 26, 44)} fill={KRP.red} color={KRP.white} />
      <TagPlate x={330} y={812} text="ルイ15世" size={38} t={seg(f, 14, 32)} />
    </Frame>
  );
};

// ===================================================================
// #35 目的は、上の階に住む愛人の部屋へ、こっそり通うため。
//     2階ぶんの断面。椅子が下の王の部屋から上の愛人の部屋へ上がりきる
// ===================================================================
const SceneAijinHeya: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeInOut(seg(f, 20, 100));
  const chairY = lerp(856, 486, rise);
  const arrive = seg(f, 96, 120);
  return (
    <Frame f={f} seed={1106} caption="上の階は 愛人の部屋">
      {/* 外の夜 */}
      <VersSky f={f} night />
      {/* 2階 = 愛人の部屋 */}
      <PalaceRoom x={150} y={282} w={1140} h={316} f={f} />
      <CanopyBed x={420} y={578} s={0.88} />
      <Candle x={760} y={566} f={f} s={0.9} />
      <Heart x={1012} y={392} s={1.1} t={seg(f, 60, 80)} f={f} />
      <Heart x={1096} y={448} s={0.72} t={seg(f, 72, 92)} f={f + 9} />
      {/* 愛人 */}
      <Person x={1010} y={578} s={0.78} f={f} cloth={KRP.red} clothDark="#A8301F" hair="none"
        face="smile" gaze={[6, 2]} phase={7} />
      {/* 1階 = 王の部屋 */}
      <PalaceRoom x={150} y={598} w={1140} h={312} f={f} />
      {/* 王冠の紋章 */}
      <g transform="translate(420 724)">
        <circle cx={0} cy={0} r={60} fill={KRP.cream} stroke={GILT} strokeWidth={7} />
        <path d="M -34 14 L -34 -14 L -17 2 L 0 -22 L 17 2 L 34 -14 L 34 14 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <Candle x={760} y={878} f={f + 13} s={0.9} />
      {/* 床の境 */}
      <line x1={150} y1={598} x2={1290} y2={598} stroke={KRP.ink} strokeWidth={7} />
      {/* 昇降路 */}
      <rect x={1290} y={282} width={252} height={628} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
      <Pulley x={1416} y={338} r={32} rot={rise * 400} color={GILT} />
      <line x1={1416} y1={370} x2={1416} y2={chairY - 146} stroke={KRP.ink} strokeWidth={6} />
      <line x1={1486} y1={346} x2={1486} y2={lerp(410, 772, rise)} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1466} y={lerp(410, 772, rise)} width={40} height={86} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 椅子 + ルイ */}
      <g transform={`translate(1398 ${chairY})`}>
        <rect x={-92} y={-146} width={184} height={22} fill={GILT} stroke={KRP.ink} strokeWidth={5} rx={6} />
        <rect x={-66} y={-124} width={132} height={124} fill={GILT} stroke={KRP.ink} strokeWidth={5.5} rx={10} />
        <rect x={-48} y={-106} width={96} height={90} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} rx={8} />
      </g>
      <Louis x={1398} y={chairY - 6} s={0.7} f={f} face="smile" gaze={[-5, -2]} />
      {/* こっそり感の点線 */}
      <path d={`M 1130 820 Q 1300 740 1340 ${chairY - 60}`} fill="none" stroke={KRP.orange}
        strokeWidth={5} strokeDasharray="12 10" opacity={0.75} />
      <FlowArrow x1={1620} y1={840} x2={1620} y2={500} t={seg(f, 34, 70)} w={11} />
      <TagPlate x={1748} y={352} text="愛人の部屋" size={34} t={seg(f, 10, 28)} fill={KRP.red} color={KRP.white} />
      <TagPlate x={1748} y={706} text="王の部屋" size={34} t={seg(f, 18, 36)} />
      <TagPlate x={430} y={286} text="こっそり通う" size={40} t={arrive} fill={KRP.yellow} />
    </Frame>
  );
};

// ===================================================================
// #36 動力は、煙突の中に控えた係の人の、腕力でした。
//     煙突の中へ寄る。係の人が引く → 椅子が上がる (①〜④)
// ===================================================================
const SceneEntotsuUdemashi: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.46 * easeInOut(seg(f, 8, 92));
  const pull = easeInOut(seg(f, 38, 112));
  const chairY = lerp(820, 520, pull);
  const armPhase = Math.sin(f / 6);
  return (
    <Frame f={f} seed={1107} dark caption="動力は 煙突の中の係の人">
      <g transform={zoomAt(z, 700, 640)}>
        {/* 宮殿の壁の断面 */}
        <PalaceRoom x={1060} y={252} w={820} h={672} f={f} dim={0.08} />
        <Chandelier x={1620} y={346} s={0.82} f={f} />
        {/* 煙突 (煤けた縦穴) */}
        <rect x={-200} y={-200} width={1260} height={1320} fill={VERS_WALL} stroke={KRP.ink} strokeWidth={6} />
        <rect x={360} y={-200} width={520} height={1320} fill="#4A423A" stroke={KRP.ink} strokeWidth={7} />
        {/* 煤の粒 */}
        {Array.from({ length: 50 }, (_, i) => (
          <circle key={i} cx={380 + ((i * 97) % 480)} cy={-120 + ((i * 173) % 1180)}
            r={3 + (i % 3) * 2} fill={KRP.ink} opacity={0.3} />
        ))}
        {/* 石積みの目地 */}
        {Array.from({ length: 16 }, (_, r) => (
          <line key={r} x1={360} y1={-120 + r * 82} x2={880} y2={-120 + r * 82}
            stroke={KRP.white} strokeWidth={2} opacity={0.1} />
        ))}
        {/* 煙突の床 */}
        <rect x={360} y={900} width={520} height={30} fill={KRP.ink} opacity={0.5} />
        <Torch x={430} y={856} f={f} s={0.82} />

        {/* 上の滑車 */}
        <rect x={330} y={300} width={1020} height={22} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <Pulley x={620} y={360} r={42} rot={pull * 460} />
        <Pulley x={1240} y={360} r={42} rot={-pull * 460} color={GILT} />
        {/* ロープ: 係の人 → 滑車 → 滑車 → 椅子 */}
        <line x1={620} y1={402} x2={620} y2={lerp(660, 788, pull)} stroke={KRP.ink} strokeWidth={8} />
        <line x1={662} y1={360} x2={1198} y2={360} stroke={KRP.ink} strokeWidth={8} />
        <line x1={1240} y1={402} x2={1240} y2={chairY - 146} stroke={KRP.ink} strokeWidth={8} />

        {/* 係の人 (大きく・渾身で引く) */}
        <Attendant x={600} y={900} s={1.26} f={f} face="worried" lean={-9} />
        {/* 引いている腕 */}
        <line x1={600} y1={700} x2={620} y2={lerp(660, 790, pull) + armPhase * 8}
          stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
        <Sweat x={520} y={660} f={f} n={3} />
        <Burst x={600} y={768} r={62} t={seg(f, 44, 64)} n={9} color={KRP.red} />

        {/* 宮殿側: 上がる椅子 */}
        <g transform={`translate(1240 ${chairY})`}>
          <rect x={-86} y={-146} width={172} height={22} fill={GILT} stroke={KRP.ink} strokeWidth={5} rx={6} />
          <rect x={-62} y={-124} width={124} height={124} fill={GILT} stroke={KRP.ink} strokeWidth={5.5} rx={10} />
          <rect x={-44} y={-106} width={88} height={90} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} rx={8} />
        </g>
        <Louis x={1240} y={chairY - 6} s={0.66} f={f} face="smile" />
        <FlowArrow x1={1400} y1={830} x2={1400} y2={540} t={seg(f, 70, 100)} w={10} />
      </g>
      <NumTag x={330} y={300} n={1} text="係の人" t={seg(f, 20, 36)} size={30} />
      <NumTag x={306} y={408} n={2} text="ロープ" t={seg(f, 44, 60)} size={30} />
      <NumTag x={960} y={268} n={3} text="滑車" t={seg(f, 60, 76)} size={30} />
      <NumTag x={1684} y={340} n={4} text="椅子が上がる" t={seg(f, 80, 96)} size={30} />
    </Frame>
  );
};

// ===================================================================
// #37 王様の恋のために、今夜も誰かがロープを引くのです。
//     夜の宮殿。上の窓は明るくハート、壁の中の係の人はひとり暗闇で引く
// ===================================================================
const SceneKoiNoTame: React.FC<{ f: number }> = ({ f }) => {
  const pull = (Math.sin(f / 16) + 1) / 2; // 延々と引き続ける
  return (
    <Frame f={f} seed={1108} dark bg={NIGHT_SKY} caption="今夜も 誰かがロープを引く">
      <VersSky f={f} night />
      {/* 宮殿の外観 (右半分) */}
      <g opacity={0.95}>
        <PalaceOuter x={1310} y={900} s={0.86} f={f} night lit2F={1} />
      </g>
      <PalaceGarden f={f} />
      {/* 手前に大きく: 壁の断面 (煙突) */}
      <g transform="translate(0 0)">
        <rect x={-40} y={210} width={620} height={760} fill={VERS_WALL} stroke={KRP.ink} strokeWidth={6} />
        <rect x={110} y={210} width={330} height={760} fill="#3E372F" stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={i} cx={130 + ((i * 89) % 300)} cy={230 + ((i * 151) % 710)}
            r={3 + (i % 3) * 2} fill={KRP.ink} opacity={0.4} />
        ))}
        {/* ろうそく1本だけ */}
        <Candle x={168} y={930} f={f} s={0.78} />
        {/* 滑車とロープ */}
        <rect x={80} y={252} width={390} height={18} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <Pulley x={286} y={300} r={34} rot={pull * 160} />
        <line x1={286} y1={334} x2={286} y2={lerp(640, 720, pull)} stroke={KRP.ink} strokeWidth={7} />
        <line x1={320} y1={300} x2={320} y2={210} stroke={KRP.ink} strokeWidth={7} />
        {/* 係の人 */}
        <Attendant x={272} y={966} s={1.08} f={f} face="worried" lean={-6} />
        <line x1={272} y1={790} x2={286} y2={lerp(645, 722, pull)} stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
        <Sweat x={206} y={760} f={f} n={2} />
      </g>
      {/* 上の窓: 明るい部屋とハート */}
      <g transform="translate(1316 452)">
        <rect x={-130} y={-116} width={260} height={212} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} rx={8} />
        <rect x={-130} y={-116} width={260} height={212} fill={KRP.orange} opacity={0.18} rx={8} />
        <Louis x={-48} y={78} s={0.5} f={f} face="smile" gaze={[5, 0]} />
        <Person x={54} y={78} s={0.5} f={f} cloth={KRP.red} clothDark="#A8301F" hair="none" face="smile" gaze={[-5, 0]} phase={8} />
        <Heart x={6} y={-44} s={0.78} t={1} f={f} />
      </g>
      <TagPlate x={1316} y={288} text="王様の恋" size={40} t={seg(f, 14, 32)} fill={KRP.red} color={KRP.white} />
      <TagPlate x={286} y={590} text="腕力ひとつ" size={38} t={seg(f, 30, 50)} />
      <TagPlate x={960} y={790} text="今夜も、誰かが引いている" size={38} t={seg(f, 70, 92)} fill={KRP.cream} />
    </Frame>
  );
};

// ===================================================================
// #38 19世紀になると、蒸気の力で荷物を上げ下げするようになります。
//     工場の中。ボイラーの火 → はずみ車 → ベルト → 巻き胴 → ロープ → 荷台 (①〜⑥)
// ===================================================================
const SceneJoukiLift: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.2 * easeInOut(seg(f, 6, 80));
  const run = easeInOut(seg(f, 36, 118));
  const spin = run * 900 + f * 2;
  const loadY = lerp(846, 470, run);
  const fire = 1 + Math.sin(f / 4) * 0.2;
  return (
    <Frame f={f} seed={1109} dark caption="蒸気の力で 荷物を上げ下げ">
      <g transform={zoomAt(z, 860, 620)}>
        <MillInterior f={f} />
        {/* ボイラー */}
        <g transform="translate(300 892)">
          <ellipse cx={0} cy={4} rx={180} ry={22} fill={KRP.ink} opacity={0.2} />
          <rect x={-170} y={-286} width={340} height={286} rx={22} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-170} y={-286} width={340} height={46} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
          {[-110, -36, 38, 112].map((bx, i) => (
            <circle key={i} cx={bx} cy={-263} r={9} fill={KRP.ink} opacity={0.6} />
          ))}
          {/* 焚き口の火 */}
          <rect x={-96} y={-104} width={192} height={88} fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d={`M ${-70 + i * 35} -20 C ${-56 + i * 35} ${-56 * fire} ${-84 + i * 35} ${-62 * fire} ${-70 + i * 35} ${-84 * fire}`}
              fill="none" stroke={i % 2 ? KRP.yellow : KRP.orange} strokeWidth={11} strokeLinecap="round" />
          ))}
          <circle cx={0} cy={-60} r={116} fill={KRP.orange} opacity={0.14 * fire} />
          {/* 圧力計 */}
          <circle cx={116} cy={-180} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <line x1={116} y1={-180} x2={116 + Math.cos(-2.2 + run * 1.7) * 20} y2={-180 + Math.sin(-2.2 + run * 1.7) * 20}
            stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
          {/* 煙突 */}
          <rect x={-150} y={-396} width={54} height={112} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <Steam x={-123} y={-400} f={f} s={0.78} n={4} color={KRP.white} />
        </g>
        {/* はずみ車 */}
        <g transform={`translate(600 740)`}>
          <circle cx={0} cy={0} r={118} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
          <g transform={`rotate(${spin})`}>
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={0} y1={0} x2={Math.cos((i / 8) * Math.PI * 2) * 104} y2={Math.sin((i / 8) * Math.PI * 2) * 104}
                stroke={KRP.ink} strokeWidth={7} />
            ))}
          </g>
          <circle cx={0} cy={0} r={22} fill={KRP.ink} />
          {/* ピストン棒 */}
          <line x1={-118} y1={0} x2={-240} y2={-30} stroke={KRP.ink} strokeWidth={10} />
        </g>
        {/* ベルト */}
        <line x1={600} y1={622} x2={1032} y2={668} stroke={KRP.ink} strokeWidth={9} />
        <line x1={600} y1={858} x2={1032} y2={790} stroke={KRP.ink} strokeWidth={9} />
        {/* 巻き胴 */}
        <g transform="translate(1032 728)">
          <circle cx={0} cy={0} r={62} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`rotate(${-spin * 1.6})`}>
            {Array.from({ length: 6 }, (_, i) => (
              <line key={i} x1={0} y1={0} x2={Math.cos((i / 6) * Math.PI * 2) * 52} y2={Math.sin((i / 6) * Math.PI * 2) * 52}
                stroke={KRP.ink} strokeWidth={5} />
            ))}
          </g>
        </g>
        {/* 上の滑車 → 荷台 */}
        <rect x={960} y={382} width={600} height={22} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <Pulley x={1380} y={436} r={42} rot={spin * 0.8} />
        <line x1={1070} y1={700} x2={1338} y2={436} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1380} y1={478} x2={1380} y2={loadY - 24} stroke={KRP.ink} strokeWidth={7} />
        {/* 荷台 */}
        <g transform={`translate(1380 ${loadY})`}>
          <rect x={-140} y={-20} width={280} height={24} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} rx={4} />
          <Crate x={-62} y={-20} s={0.95} />
          <Crate x={58} y={-20} s={0.8} />
          <line x1={-140} y1={-20} x2={0} y2={-74} stroke={KRP.ink} strokeWidth={5} />
          <line x1={140} y1={-20} x2={0} y2={-74} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 見上げる工員 */}
        <Attendant x={1680} y={900} s={0.98} f={f} face="surprised" />
        <Attendant x={830} y={900} s={0.9} f={f + 9} face="normal" />
      </g>
      <NumTag x={300} y={292} n={1} text="ボイラー" t={seg(f, 14, 30)} size={28} />
      <NumTag x={610} y={398} n={2} text="はずみ車" t={seg(f, 32, 48)} size={28} />
      <NumTag x={810} y={820} n={3} text="ベルト" t={seg(f, 48, 64)} size={28} />
      <NumTag x={1060} y={846} n={4} text="巻き胴" t={seg(f, 62, 78)} size={28} />
      <NumTag x={1480} y={320} n={5} text="ロープ" t={seg(f, 76, 92)} size={28} />
      <NumTag x={1700} y={540} n={6} text="荷台が上がる" t={seg(f, 92, 108)} size={28} />
    </Frame>
  );
};

// ===================================================================
// #39 工場や倉庫では、当たり前の機械になりました。
//     煤けた工場街。3棟とも荷が上がっている
// ===================================================================
const SceneKoujouAtarimae: React.FC<{ f: number }> = ({ f }) => {
  const h = (o: number) => (Math.sin((f + o) / 34) + 1) / 2;
  return (
    <Frame f={f} seed={1110} caption="工場や倉庫では 当たり前の機械に">
      <SootSky f={f} />
      {/* 遠景の煙突 */}
      {[120, 300, 1640, 1860].map((cx, i) => (
        <g key={i} opacity={0.4}>
          <rect x={cx} y={360} width={30} height={330} fill={KRP.grayDark} />
          <Steam x={cx + 15} y={356} f={f + i * 13} s={0.5} n={3} color={KRP.gray} />
        </g>
      ))}
      {/* 運河 */}
      <rect x={-200} y={906} width={2320} height={220} fill={KRP.blue} opacity={0.6} />
      {Array.from({ length: 18 }, (_, i) => (
        <line key={i} x1={-160 + i * 122} y1={940 + (i % 3) * 34} x2={-60 + i * 122} y2={940 + (i % 3) * 34}
          stroke={KRP.white} strokeWidth={4} opacity={0.4} />
      ))}
      {/* 石畳の岸 */}
      <rect x={-200} y={836} width={2320} height={74} fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={-160 + i * 104} y1={836} x2={-160 + i * 104} y2={910} stroke={KRP.ink} strokeWidth={2.2} opacity={0.22} />
      ))}
      {/* 3棟 */}
      <Mill x={330} y={840} s={0.82} f={f} floors={4} hoist={h(0)} />
      <Mill x={960} y={840} s={0.95} f={f} floors={5} hoist={h(40)} />
      <Mill x={1600} y={840} s={0.8} f={f} floors={4} hoist={h(80)} />
      {/* ガス灯 */}
      {[650, 1290].map((lx, i) => (
        <g key={i}>
          <rect x={lx - 6} y={690} width={12} height={150} fill={KRP.ink} />
          <rect x={lx - 20} y={652} width={40} height={44} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={lx} cy={674} r={46} fill={KRP.yellow} opacity={0.14} />
        </g>
      ))}
      {/* 荷馬車 */}
      <g transform="translate(820 838)">
        <circle cx={-56} cy={-24} r={24} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={62} cy={-26} r={26} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={-80} y={-84} width={160} height={56} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} rx={6} />
        <Crate x={-30} y={-84} s={0.42} />
        <Crate x={34} y={-84} s={0.42} />
      </g>
      {/* 働く人 */}
      <Attendant x={1180} y={838} s={0.62} f={f} face="normal" />
      <Attendant x={1430} y={838} s={0.6} f={f + 11} face="normal" />
      <TagPlate x={330} y={322} text="工場" size={34} t={seg(f, 12, 28)} />
      <TagPlate x={960} y={236} text="倉庫" size={34} t={seg(f, 24, 40)} />
      <TagPlate x={1600} y={322} text="工場" size={34} t={seg(f, 36, 52)} />
      <TagPlate x={960} y={736} text="どこでも当たり前に" size={40} t={seg(f, 70, 92)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===================================================================
// #40 それでも、人は乗りません。
//     同じ工場の中。荷だけが上がり、人は横の狭い階段をぞろぞろ上る
// ===================================================================
const SceneHitoNoranai: React.FC<{ f: number }> = ({ f }) => {
  const run = easeInOut(seg(f, 20, 96));
  const loadY = lerp(846, 450, run);
  const back = easeOut(seg(f, 62, 104)) * 86; // 後ずさり
  return (
    <Frame f={f} seed={1111} dark caption="それでも 人は乗らない">
      <MillInterior f={f} />
      {/* 左: 木の階段をぞろぞろ上る */}
      <g>
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={120 + i * 74} y={846 - i * 76} width={78} height={18} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={120 + i * 74} y={864 - i * 76} width={14} height={58} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
          </g>
        ))}
        <line x1={110} y1={790} x2={660} y2={258} stroke={KRP.ink} strokeWidth={6} />
        {[0, 2, 4].map((i) => (
          <Attendant key={i} x={168 + i * 74} y={846 - i * 76} s={0.56} f={f + i * 13} face="worried" lean={5} />
        ))}
      </g>
      <TagPlate x={300} y={320} text="人は階段" size={38} t={seg(f, 14, 32)} />

      {/* 右: 荷だけが上がる昇降路 */}
      <rect x={1130} y={352} width={420} height={560} fill={KRP.cream} opacity={0.3} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1100} y={330} width={480} height={22} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      <Pulley x={1340} y={386} r={40} rot={run * 700} />
      <line x1={1340} y1={426} x2={1340} y2={loadY - 24} stroke={KRP.ink} strokeWidth={7} />
      <g transform={`translate(1340 ${loadY})`}>
        <rect x={-150} y={-20} width={300} height={24} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} rx={4} />
        <Crate x={-66} y={-20} s={1.0} />
        <Crate x={62} y={-20} s={0.84} />
        <line x1={-150} y1={-20} x2={0} y2={-76} stroke={KRP.ink} strokeWidth={5} />
        <line x1={150} y1={-20} x2={0} y2={-76} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <FlowArrow x1={1620} y1={840} x2={1620} y2={470} t={seg(f, 34, 70)} w={11} />
      <TagPlate x={1620} y={386} text="荷物だけ" size={36} t={seg(f, 30, 48)} />

      {/* 手前で後ずさりする工員 (大きく) */}
      <g transform={`translate(${-back} 0)`}>
        <Attendant x={880} y={1010} s={1.5} f={f} face="worried" lean={-7} />
        {/* 両手で「いやいや」 */}
        <g opacity={seg(f, 56, 76)}>
          <line x1={760} y1={700} x2={690} y2={640} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
          <line x1={1000} y1={700} x2={1070} y2={640} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
        </g>
        <CrossMark x={880} y={560} s={1.1} t={seg(f, 62, 82)} />
      </g>
      <TagPlate x={640} y={520} text="乗らない" size={46} t={seg(f, 76, 96)} fill={KRP.red} color={KRP.white} />
    </Frame>
  );
};

// ===================================================================
// #41 ロープが切れたら、落ちて死ぬからです。
//     想像をやめて、実際にロープが切れて荷台が落ちる瞬間を大きく
// ===================================================================
const SceneRopeKiretara: React.FC<{ f: number }> = ({ f }) => {
  const snap = seg(f, 30, 40); // 切れる瞬間
  const fall = easeInOut(seg(f, 38, 86)); // 落下 (加速)
  const loadY = lerp(400, 866, fall * fall);
  const crash = seg(f, 82, 100);
  const shake = crash > 0 && crash < 1 ? Math.sin(f * 2.4) * 9 * (1 - crash) : 0;
  return (
    <Frame f={f} seed={1112} dark caption="ロープが切れたら 落ちて死ぬ">
      <g transform={`translate(${shake} ${shake * 0.4})`}>
        <MillInterior f={f} dim={0.1} />
        {/* 上の梁と滑車 */}
        <rect x={700} y={250} width={620} height={24} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <Pulley x={960} y={310} r={46} rot={fall * 1200} />
        {/* 切れたロープ: 上側は跳ね上がる */}
        <path d={`M 960 356 Q ${930 - fall * 60} ${430 - fall * 40} ${900 - fall * 120} ${404 - fall * 70}`}
          fill="none" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        {/* ほつれた繊維 */}
        {snap > 0 && Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={900 - fall * 120} y1={404 - fall * 70}
            x2={900 - fall * 120 + (i - 3) * 13} y2={404 - fall * 70 + 34 + (i % 2) * 12}
            stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        ))}
        {/* 切断マーク */}
        <Burst x={930} y={400} r={110} t={snap * (1 - seg(f, 44, 62))} n={12} color={KRP.red} />
        {/* 落ちる荷台 */}
        <g transform={`translate(960 ${loadY}) rotate(${fall * 13})`}>
          <rect x={-156} y={-22} width={312} height={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} rx={4} />
          {/* 下側のちぎれロープ */}
          <path d="M 0 -78 Q -16 -140 -40 -186" fill="none" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          <line x1={-156} y1={-22} x2={0} y2={-78} stroke={KRP.ink} strokeWidth={5} />
          <line x1={156} y1={-22} x2={0} y2={-78} stroke={KRP.ink} strokeWidth={5} />
          <Crate x={-68} y={-22} s={1.05} rot={-fall * 24} />
          <Crate x={66} y={-22} s={0.9} rot={fall * 30} />
        </g>
        {/* 速度線 */}
        {fall > 0.1 && Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={790 + i * 44} y1={loadY - 190 - (i % 3) * 50}
            x2={790 + i * 44} y2={loadY - 90 - (i % 3) * 50}
            stroke={KRP.ink} strokeWidth={5} opacity={0.3 * fall} strokeLinecap="round" />
        ))}
        {/* 砕けた破片と土煙 */}
        {crash > 0 && (
          <>
            {Array.from({ length: 16 }, (_, i) => {
              const a = -Math.PI + (i / 16) * Math.PI;
              const d = crash * 260;
              return (
                <rect key={i} x={960 + Math.cos(a) * d} y={880 + Math.sin(a) * d * 0.5}
                  width={16 + (i % 3) * 8} height={11} rx={2} fill={KRP.copper}
                  stroke={KRP.ink} strokeWidth={3} transform={`rotate(${i * 37} ${960 + Math.cos(a) * d} ${880 + Math.sin(a) * d * 0.5})`}
                  opacity={1 - crash * 0.4} />
              );
            })}
            {Array.from({ length: 10 }, (_, i) => (
              <circle key={i} cx={960 + (i - 5) * 70} cy={880 - crash * 60} r={30 + crash * 56}
                fill={KRP.floor} opacity={(1 - crash) * 0.55} />
            ))}
          </>
        )}
      </g>
      {/* 青ざめる工員たち */}
      <Attendant x={360} y={1010} s={1.18} f={f} face="surprised" lean={-10} />
      <Attendant x={1600} y={1010} s={1.1} f={f + 7} face="surprised" lean={9} />
      <Skull x={1700} y={360} s={1.2} t={seg(f, 90, 108)} />
      <TagPlate x={430} y={370} text="ぶつっ" size={52} t={seg(f, 32, 46)} fill={KRP.red} color={KRP.white} />
      <TagPlate x={1430} y={540} text="命は預けられない" size={44} t={seg(f, 96, 116)} fill={KRP.white} color={KRP.red} />
    </Frame>
  );
};

// ===================================================================
// #42 技術はもう、あった。足りないのは、安心でした。
//     工場を背景に、大きな天秤。技術の皿は重く沈み、安心の皿は空っぽ
// ===================================================================
const SceneAnshinTarinai: React.FC<{ f: number }> = ({ f }) => {
  const tilt = easeInOut(seg(f, 24, 92)) * 15;
  const BX = 960, BY = 560;
  const L = 420;
  const rad = (tilt * Math.PI) / 180;
  const lx = BX - Math.cos(rad) * L, ly = BY - Math.sin(rad) * L;
  const rx = BX + Math.cos(rad) * L, ry = BY + Math.sin(rad) * L;
  return (
    <Frame f={f} seed={1113} caption="技術はあるのに 安心が足りない">
      <MillInterior f={f} dim={0.55} />
      {/* 天秤 */}
      <g>
        <rect x={BX - 56} y={BY} width={112} height={330} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={7} />
        <rect x={BX - 130} y={BY + 318} width={260} height={40} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={7} />
        <g transform={`rotate(${tilt} ${BX} ${BY})`}>
          <rect x={BX - L} y={BY - 13} width={L * 2} height={26} rx={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <circle cx={BX} cy={BY} r={28} fill={GILT} stroke={KRP.ink} strokeWidth={6} />
        {/* 左の皿: 技術 (重い) */}
        <line x1={lx} y1={ly} x2={lx} y2={ly + 130} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${lx - 130} ${ly + 130} L ${lx + 130} ${ly + 130} L ${lx + 96} ${ly + 182} L ${lx - 96} ${ly + 182} Z`}
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`translate(${lx} ${ly + 86})`}>
          <circle cx={-44} cy={0} r={38} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={-50} y={-44} width={12} height={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3}
              transform={`rotate(${i * 45} -44 0)`} />
          ))}
          <circle cx={30} cy={10} r={26} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
          <rect x={6} y={-48} width={56} height={34} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 右の皿: 安心 (空っぽ) */}
        <line x1={rx} y1={ry} x2={rx} y2={ry + 130} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${rx - 130} ${ry + 130} L ${rx + 130} ${ry + 130} L ${rx + 96} ${ry + 182} L ${rx - 96} ${ry + 182} Z`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 空っぽを強調する点線の輪郭 */}
        <ellipse cx={rx} cy={ry + 72} rx={64} ry={48} fill="none" stroke={KRP.red}
          strokeWidth={6} strokeDasharray="14 12" opacity={seg(f, 56, 80)} />
        <text x={rx} y={ry + 88} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={60} fill={KRP.red} opacity={seg(f, 64, 86)}>?</text>
      </g>
      <CheckMark x={300} y={420} s={1.5} t={seg(f, 14, 40)} />
      <TagPlate x={lx} y={ly + 246} text="技術" size={42} t={seg(f, 20, 40)} fill={KRP.cream} />
      <TagPlate x={rx} y={ry + 246} text="安心" size={42} t={seg(f, 44, 64)} fill={KRP.white} color={KRP.red} />
      <TagPlate x={960} y={790} text="足りないのは 安心だった" size={42} t={seg(f, 84, 106)} fill={KRP.yellow} />
    </Frame>
  );
};

// ===================================================================
// 一覧と書き出し
// ===================================================================
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  el2_oomukashi: (f) => <SceneOomukashi f={f} />,
  el2_colosseo: (f) => <SceneColosseo f={f} />,
  el2_lion_agaru: (f) => <SceneLionAgaru f={f} />,
  el2_france_e: (f) => <SceneFranceE f={f} />,
  el2_versailles: (f) => <SceneVersailles f={f} />,
  el2_tobu_isu: (f) => <SceneTobuIsu f={f} />,
  el2_aijin_heya: (f) => <SceneAijinHeya f={f} />,
  el2_entotsu_udemashi: (f) => <SceneEntotsuUdemashi f={f} />,
  el2_koi_no_tame: (f) => <SceneKoiNoTame f={f} />,
  el2_jouki_lift: (f) => <SceneJoukiLift f={f} />,
  el2_koujou_atarimae: (f) => <SceneKoujouAtarimae f={f} />,
  el2_hito_noranai: (f) => <SceneHitoNoranai f={f} />,
  el2_rope_kiretara: (f) => <SceneRopeKiretara f={f} />,
  el2_anshin_tarinai: (f) => <SceneAnshinTarinai f={f} />,
};

export const elevB2Scene = (motif: string, f: number): React.ReactElement | null => {
  const make = SCENES[motif];
  return make ? make(f) : null;
};

// 台本の文と1対1 (順番を変えないこと)
export const EL_B2_MOTIFS: string[] = [
  "el2_oomukashi", // #29 引きのローマ → コロッセオへ寄る
  "el2_colosseo", // #30 地下の人力ウインチ (①②③)
  "el2_lion_agaru", // #31 砂の床が開いてライオンがせり上がる (章の見せ場)
  "el2_france_e", // #32 カメラ横移動でローマ → ヴェルサイユ
  "el2_versailles", // #33 庭から宮殿へ寄る + 1743年
  "el2_tobu_isu", // #34 金の広間で椅子が上がる
  "el2_aijin_heya", // #35 2階の愛人の部屋へ到着
  "el2_entotsu_udemashi", // #36 煙突の中の係の人 (①〜④)
  "el2_koi_no_tame", // #37 夜。明るい窓と暗い煙突の対比
  "el2_jouki_lift", // #38 蒸気リフト (①〜⑥)
  "el2_koujou_atarimae", // #39 煤けた工場街。3棟とも荷が上がる
  "el2_hito_noranai", // #40 荷だけ昇降機、人は階段
  "el2_rope_kiretara", // #41 ロープが切れて荷台が落ちる
  "el2_anshin_tarinai", // #42 天秤。技術は重く、安心は空っぽ
];

export const EL_B2_PREVIEW_FRAMES = EL_B2_MOTIFS.length;

// 検品用: 1フレーム=1シーン。演出が終わった状態が見えるよう f=130 で描く
export const ElevB2Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, EL_B2_MOTIFS.length - 1);
  const motif = EL_B2_MOTIFS[i];
  return (
    <AbsoluteFill>
      {elevB2Scene(motif, 130)}
      <LabelPill x={24} y={16} text={`#${i + 29} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};

// 動き確認用: 1シーン5秒ずつ通し再生
export const EL_B2_MOTION_PER = 150;
export const EL_B2_MOTION_FRAMES = EL_B2_MOTIFS.length * EL_B2_MOTION_PER;
export const ElevB2Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.floor(frame / EL_B2_MOTION_PER), EL_B2_MOTIFS.length - 1);
  const f = frame - i * EL_B2_MOTION_PER;
  return <AbsoluteFill>{elevB2Scene(EL_B2_MOTIFS[i], f)}</AbsoluteFill>;
};

// ===================================================================
// 【見本 v2】2026-11-02 作者指摘「情報量が多すぎる / 窓をただ沢山置いただけ /
//   仕組みが誰にでもぱっと分かるようにしたい」への試作。
//
//   v1 で足した②世界が、背景の密度を上げて主役を埋めてしまった。
//   v2 の歯止め:
//     ・背景は「どこなのか」が分かる最小限まで減らす (目地・砂粒・群衆・反復装飾を削る)
//     ・反復は「数で出す」のをやめ、1つを大きくして意味を持たせる
//     ・仕組みは「力の通り道」を1本の明るい色で最後までつなぐ
//     ・札は2枚まで。札で説明せず、札は動きの添え物にする
//
//   採用が決まったら SCENES の該当行を差し替え、旧 Scene を削除すること。
// ===================================================================

// --- #30 v2: 人が回す → ロープ → かごが上がる を1本の線で見せる ---
const SceneColosseoB: React.FC<{ f: number }> = ({ f }) => {
  const push = easeInOut(seg(f, 18, 112));
  const rot = push * 230;
  const cageTop = lerp(742, 452, push);
  const z = 1 + 0.1 * easeInOut(seg(f, 0, 90));
  const HX = 1310;            // 昇降路の中心
  const PY = 376;             // 滑車の高さ
  const WX = 560, WTOP = 646; // ウインチの中心とロープの出口
  return (
    <Frame f={f} seed={1151} dark>
      <g transform={zoomAt(z, 1000, 560)}>
        {/* --- 世界: 地下。石の壁は「面」だけ。目地も砂粒も描かない --- */}
        <rect x={-100} y={-100} width={2120} height={1280} fill={STONE_SH} />
        {/* 奥のアーチ通路 (1つだけ・暗く) */}
        <path d="M 180 886 L 180 560 A 118 118 0 0 1 416 560 L 416 886 Z"
          fill={KRP.ink} opacity={0.26} stroke={KRP.ink} strokeWidth={6} />
        {/* 地下の床 */}
        <rect x={-100} y={870} width={2120} height={310} fill={STONE_DK} stroke={KRP.ink} strokeWidth={6} />

        {/* --- 舞台 (上) と はね上げ戸。「舞台へ運ぶ」を出すための最小限 --- */}
        <rect x={-100} y={214} width={2120} height={96} fill={SAND} stroke={KRP.ink} strokeWidth={6} />
        {/* 戸が開いた穴 (舞台の床がパカッと開いている) */}
        <rect x={HX - 150} y={214} width={300} height={96} fill={KRP.ink} opacity={0.5} />
        {/* 開いた戸板 2枚 (蝶番から立ち上がる) */}
        <g transform={`translate(${HX - 150} 214) rotate(-62)`}>
          <rect x={-152} y={-26} width={152} height={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        </g>
        <g transform={`translate(${HX + 150} 214) rotate(62)`}>
          <rect x={0} y={-26} width={152} height={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 舞台から差し込む光 */}
        <path d={`M ${HX - 150} 310 L ${HX + 150} 310 L ${HX + 300} 870 L ${HX - 300} 870 Z`}
          fill={KRP.yellow} opacity={0.15} />

        {/* --- 仕組み1: 天井の梁と滑車 --- */}
        <rect x={HX - 240} y={PY - 92} width={480} height={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        <line x1={HX} y1={PY - 66} x2={HX} y2={PY - 44} stroke={KRP.ink} strokeWidth={9} />

        {/* --- 仕組み2: ロープ (力の通り道。1本のオレンジで最後までつなぐ) --- */}
        <g strokeLinecap="round">
          {/* 外側の黒 */}
          <line x1={WX} y1={WTOP} x2={HX - 54} y2={PY} stroke={KRP.ink} strokeWidth={19} />
          <line x1={HX} y1={PY} x2={HX} y2={cageTop} stroke={KRP.ink} strokeWidth={19} />
          {/* 内側のオレンジ */}
          <line x1={WX} y1={WTOP} x2={HX - 54} y2={PY} stroke={KRP.orange} strokeWidth={9} />
          <line x1={HX} y1={PY} x2={HX} y2={cageTop} stroke={KRP.orange} strokeWidth={9} />
        </g>
        <Pulley x={HX} y={PY} r={56} rot={-rot} />

        {/* --- 仕組み3: かご (ライオン入り)。大きく --- */}
        <g transform={`translate(${HX} ${cageTop})`}>
          <rect x={-176} y={0} width={352} height={238} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-176} y={0} width={352} height={238} fill={SAND} opacity={0.22} />
          {[-88, 88].map((bx) => (
            <line key={bx} x1={bx} y1={6} x2={bx} y2={232} stroke={KRP.ink} strokeWidth={7} />
          ))}
          <Lion x={-14} y={222} s={0.78} f={f} roar={seg(f, 92, 122) * 0.9} />
        </g>
        {/* かごが上がる矢印 */}
        {seg(f, 76, 92) > 0 && (
          <g opacity={seg(f, 76, 92)}>
            <line x1={HX + 300} y1={742} x2={HX + 300} y2={cageTop + 60} stroke={KRP.orange} strokeWidth={13} strokeLinecap="round" />
            <polygon points={`${HX + 300},${cageTop + 20} ${HX + 266},${cageTop + 76} ${HX + 334},${cageTop + 76}`}
              fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}

        {/* --- 仕組み4: 人力ウインチ。大きく、2人が踏ん張る --- */}
        <g transform={`translate(${WX} 870)`}>
          <ellipse cx={0} cy={2} rx={168} ry={24} fill={KRP.ink} opacity={0.22} />
          <rect x={-92} y={-224} width={184} height={224} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={7} />
          {/* 巻かれたロープ (3本だけ) */}
          {[-176, -132, -88].map((cy) => (
            <ellipse key={cy} cx={0} cy={cy} rx={96} ry={15} fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          ))}
          {/* 押し棒 */}
          <g transform={`rotate(${rot * 0.3})`}>
            <rect x={-236} y={-250} width={472} height={20} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          </g>
          <Pulley x={0} y={-240} r={30} rot={rot} color={KRP.copper} />
        </g>
        <Attendant x={352} y={870} s={1.14} f={f} face="worried" lean={13} />
        <Attendant x={768} y={870} s={1.14} f={f + 7} face="worried" lean={-13} />
        <Sweat x={318} y={590} f={f} n={2} />
        <Sweat x={800} y={590} f={f + 11} n={2} />

        <Torch x={140} y={470} f={f} s={1.25} />
      </g>
      {/* 札は2枚だけ */}
      <TagPlate x={330} y={352} text="人が回す" size={38} t={seg(f, 44, 60)} fill={KRP.yellow} />
      <TagPlate x={1700} y={352} text="かごが上がる" size={38} t={seg(f, 84, 100)} fill={KRP.yellow} />
    </Frame>
  );
};

// --- #33 v2: 窓を減らして大きくし、宮殿そのものに寄る ---
const SceneVersaillesB: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.16 * easeInOut(seg(f, 8, 96));
  const carriage = easeInOut(seg(f, 20, 86));
  const cx2 = lerp(2320, 1500, carriage);
  const look = seg(f, 90, 118);
  return (
    <Frame f={f} seed={1152} over={<Stamp x={1496} y={244} text="1743年" size={58} />}>
      <g transform={zoomAt(z, 960, 600)}>
        {/* 空 (夕暮れ) */}
        <rect x={-100} y={-100} width={2120} height={1000} fill="#E8D9B4" />
        <rect x={-100} y={-100} width={2120} height={420} fill="#CBD8E4" opacity={0.75} />
        <circle cx={1660} cy={214} r={74} fill={KRP.yellow} opacity={0.55} />

        {/* 庭 (芝と、宮殿へ伸びる道。1本だけ) */}
        <rect x={-100} y={812} width={2120} height={368} fill="#A9B88A" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 700 812 L 1220 812 L 1560 1180 L 360 1180 Z" fill={KRP.floor} stroke={KRP.ink} strokeWidth={6} />

        {/* --- 宮殿 (主役。画面の高さの6割) --- */}
        {/* 基壇 */}
        <rect x={160} y={770} width={1600} height={48} fill={STONE_DK} stroke={KRP.ink} strokeWidth={6} />
        {/* 翼棟 (左右。本体より低い) */}
        {[-1, 1].map((sg) => {
          const wx0 = sg === -1 ? 196 : 1410;
          return (
            <g key={sg}>
              <rect x={wx0} y={470} width={314} height={300} fill={VERS_WALL} stroke={KRP.ink} strokeWidth={7} />
              <path d={`M ${wx0 - 24} 470 L ${wx0 + 26} 396 L ${wx0 + 288} 396 L ${wx0 + 338} 470 Z`}
                fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
              {[0, 1].map((k) => {
                const wx = wx0 + 86 + k * 142;
                return (
                  <g key={k}>
                    <path d={`M ${wx - 42} 690 L ${wx - 42} 582 A 42 42 0 0 1 ${wx + 42} 582 L ${wx + 42} 690 Z`}
                      fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
                    <line x1={wx} y1={542} x2={wx} y2={690} stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
                    <rect x={wx - 48} y={690} width={96} height={13} fill={GILT} stroke={KRP.ink} strokeWidth={4} />
                  </g>
                );
              })}
            </g>
          );
        })}
        {/* 本体 */}
        <rect x={510} y={330} width={900} height={440} fill={VERS_WALL} stroke={KRP.ink} strokeWidth={7} />
        {/* マンサード屋根 */}
        <path d="M 484 330 L 548 230 L 1372 230 L 1436 330 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
        {/* 中央のペディメント */}
        <path d="M 820 330 L 960 198 L 1100 330 Z" fill={VERS_WALL} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={960} cy={288} r={30} fill={GILT} stroke={KRP.ink} strokeWidth={5} />
        {/* 屋根の彫像 3体だけ */}
        {[700, 960, 1220].map((sx, i) => (
          <g key={i} transform={`translate(${sx} ${i === 1 ? 198 : 230})`}>
            <circle cx={0} cy={-46} r={15} fill={GILT} stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -17 -32 L 17 -32 L 11 0 L -11 0 Z" fill={GILT} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ))}
        {/* 金のモール (本体の上端。1本だけ) */}
        <rect x={510} y={386} width={900} height={16} fill={GILT} stroke={KRP.ink} strokeWidth={4} />

        {/* 窓は7つだけ。そのぶん大きく */}
        {[-3, -2, -1, 0, 1, 2, 3].map((k) => {
          const wx = 960 + k * 126;
          const big = k === 0;
          const w = big ? 112 : 84;
          const top = big ? 452 : 474;
          return (
            <g key={k}>
              <path d={`M ${wx - w / 2} 650 L ${wx - w / 2} ${top + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${wx + w / 2} ${top + w / 2} L ${wx + w / 2} 650 Z`}
                fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
              <line x1={wx} y1={top} x2={wx} y2={650} stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
              <line x1={wx - w / 2} y1={552} x2={wx + w / 2} y2={552} stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
              {/* 窓の下の金の手すり */}
              <rect x={wx - w / 2 - 6} y={650} width={w + 12} height={13} fill={GILT} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        {/* 中央の扉 */}
        <path d="M 894 770 L 894 724 A 66 66 0 0 1 1026 724 L 1026 770 Z" fill={GILT} stroke={KRP.ink} strokeWidth={6} />
        <rect x={894} y={690} width={132} height={80} fill={GILT} stroke={KRP.ink} strokeWidth={6} />
        <line x1={960} y1={690} x2={960} y2={770} stroke={KRP.ink} strokeWidth={5} />

        {/* --- 事件: 馬車が着いて、廷臣が宮殿を見上げる --- */}
        <g transform={`translate(${cx2} 904)`}>
          <ellipse cx={0} cy={6} rx={140} ry={20} fill={KRP.ink} opacity={0.2} />
          <circle cx={-78} cy={-34} r={34} fill="none" stroke={KRP.ink} strokeWidth={7} />
          <circle cx={74} cy={-40} r={40} fill="none" stroke={KRP.ink} strokeWidth={7} />
          <rect x={-96} y={-160} width={186} height={106} rx={18} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-62} y={-142} width={58} height={50} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <rect x={18} y={-142} width={58} height={50} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -96 -120 L -176 -104 L -176 -78" fill="none" stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g opacity={look}>
          <Attendant x={392} y={880} s={1.12} f={f} face="surprised" />
          <Attendant x={534} y={880} s={1.12} f={f + 9} face="surprised" />
        </g>
      </g>
    </Frame>
  );
};

// 見本の見くらべ用: 0=旧#30 / 1=新#30 / 2=旧#33 / 3=新#33
const SAMPLE: { label: string; node: (f: number) => React.ReactElement }[] = [
  { label: "旧 #30 コロッセオ", node: (f) => <SceneColosseo f={f} /> },
  { label: "新 #30 コロッセオ", node: (f) => <SceneColosseoB f={f} /> },
  { label: "旧 #33 ヴェルサイユ", node: (f) => <SceneVersailles f={f} /> },
  { label: "新 #33 ヴェルサイユ", node: (f) => <SceneVersaillesB f={f} /> },
];
export const EL_B2_SAMPLE_FRAMES = SAMPLE.length;
export const ElevB2Sample: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, SAMPLE.length - 1);
  return (
    <AbsoluteFill>
      {SAMPLE[i].node(130)}
      <LabelPill x={24} y={16} text={SAMPLE[i].label} size={26} />
    </AbsoluteFill>
  );
};
