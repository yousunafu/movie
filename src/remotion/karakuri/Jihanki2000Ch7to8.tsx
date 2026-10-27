// 自販機2000年史 第7章「10円玉と、噴水の魔法」(127〜143) + 第8章「ポケットの中の起爆剤」(144〜167)。
// 1957年名古屋の噴水式ジュース自販機ブーム〜1967年新硬貨とコインメック (ニセ硬貨との戦い)。
// WobbleDefs の seed はこのファイルでは 200〜243 を使う (他ファイルと重複させない)。

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  KRP, WobbleDefs, Atmosphere, LabelPill, Stamp, Coin, Jihanki, Bolt,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, J2Badge, JihankiNight, MapPin } from "./Jihanki2000Scenes";
import { JapanMapCard, JapanHop, JmapLabel, JMAP, jmapXY } from "./Jihanki2000JapanMap";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 4点星 (キラキラ)
const star4 = (cx: number, cy: number, r: number): string =>
  `M ${cx} ${cy - r} Q ${cx + r * 0.22} ${cy - r * 0.22} ${cx + r} ${cy} ` +
  `Q ${cx + r * 0.22} ${cy + r * 0.22} ${cx} ${cy + r} ` +
  `Q ${cx - r * 0.22} ${cy + r * 0.22} ${cx - r} ${cy} ` +
  `Q ${cx - r * 0.22} ${cy - r * 0.22} ${cx} ${cy - r} Z`;

const Sparkle: React.FC<{ x: number; y: number; r: number; f: number; phase?: number; color?: string }> = ({
  x, y, r, f, phase = 0, color = "#FFF2B8",
}) => {
  const tw = 0.5 + 0.5 * Math.sin((f + phase * 13) / 7);
  return <path d={star4(x, y, r * (0.72 + tw * 0.32))} fill={color} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35 + tw * 0.65} />;
};

// 折れ線ループ上の位置 (t=0..1)。循環矢印用
const polyPoint = (pts: Array<[number, number]>, t: number): { x: number; y: number; ang: number } => {
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lens.push(L);
    total += L;
  }
  let d = (((t % 1) + 1) % 1) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const u = lens[i] === 0 ? 0 : d / lens[i];
      return {
        x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u,
        y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u,
        ang: Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]),
      };
    }
    d -= lens[i];
  }
  return { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], ang: 0 };
};

// 円弧矢印 (渦電流・循環用)。a0→a1 (ラジアン、時計回り)
const ArcArrow: React.FC<{
  cx: number; cy: number; r: number; a0: number; a1: number;
  color?: string; width?: number; dashed?: boolean; opacity?: number;
}> = ({ cx, cy, r, a0, a1, color = KRP.red, width = 10, dashed, opacity = 1 }) => {
  const p0x = cx + r * Math.cos(a0), p0y = cy + r * Math.sin(a0);
  const p1x = cx + r * Math.cos(a1), p1y = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const tang = a1 + Math.PI / 2;
  const hx = Math.cos(tang), hy = Math.sin(tang);
  const px = Math.cos(a1), py = Math.sin(a1);
  const L = width * 2.6, Wd = width * 1.5;
  return (
    <g opacity={opacity}>
      <path d={`M ${p0x} ${p0y} A ${r} ${r} 0 ${large} 1 ${p1x} ${p1y}`} fill="none"
        stroke={color} strokeWidth={width} strokeLinecap="round"
        strokeDasharray={dashed ? "16 16" : undefined} />
      <polygon points={`${p1x + hx * L},${p1y + hy * L} ${p1x + px * Wd},${p1y + py * Wd} ${p1x - px * Wd},${p1y - py * Wd}`}
        fill={color} />
    </g>
  );
};

// 渦電流の渦 (複数リングが回る)
const SwirlRings: React.FC<{
  cx: number; cy: number; radii: number[]; f: number; speed?: number; color?: string; dashed?: boolean; width?: number;
}> = ({ cx, cy, radii, f, speed = 3, color = "#4A78B8", dashed, width = 10 }) => (
  <g>
    {radii.map((r, i) => (
      <g key={i} transform={`rotate(${f * speed * (i % 2 === 0 ? 1 : 1.35) + i * 140} ${cx} ${cy})`}>
        <ArcArrow cx={cx} cy={cy} r={r} a0={0} a1={4.3} color={color} width={width} dashed={dashed} />
      </g>
    ))}
  </g>
);

// ===== 別描きの腕 (体側の腕は hideArm で消して、こちらを1本だけ描く) =====
const Arm: React.FC<{ x1: number; y1: number; x2: number; y2: number; cloth: string; s?: number }> = ({
  x1, y1, x2, y2, cloth, s = 1,
}) => (
  <g strokeLinecap="round">
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={33 * s} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cloth} strokeWidth={24 * s} />
    <circle cx={x2} cy={y2} r={17 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5 * s} />
  </g>
);

// ===== 新キャラ: 昭和30年代の人々 (fountain_oyako = mother + boy) =====
type ShowaRole = "mother" | "boy" | "girl" | "man" | "woman";
type ShowaFace = "normal" | "smile" | "worried" | "surprised";
const ShowaPerson: React.FC<{
  x: number; y: number; s?: number; role: ShowaRole; f?: number; phase?: number;
  face?: ShowaFace; gaze?: [number, number]; hideArm?: "left" | "right";
  blush?: boolean; sparkleEyes?: boolean;
}> = ({ x, y, s = 1, role, f = 0, phase = 0, face = "normal", gaze = [0, 0], hideArm, blush, sparkleEyes }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2 && !sparkleEyes;
  const [gx, gy] = gaze;
  const child = role === "boy" || role === "girl";
  const cloth = role === "mother" ? "#F0EBDF" : role === "boy" ? "#DCD6C4"
    : role === "girl" ? "#D98A8A" : role === "man" ? "#E3DCC8" : "#7E96B8";
  const clothDark = role === "mother" ? "#8C6E54" : role === "boy" ? "#4C5D78"
    : role === "girl" ? "#C27878" : role === "man" ? "#5A5248" : "#5E7294";
  const hair = "#3A322A";
  const eyeY = child ? -204 : -222;
  const headCY = child ? -206 : -222;
  const pulse = 0.85 + 0.15 * Math.sin((f + phase * 9) / 6);
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {child ? (
        <g>
          {/* 半ズボン+すね */}
          <rect x={-28} y={-56} width={22} height={26} rx={6} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={6} y={-56} width={22} height={26} rx={6} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-24} y={-34} width={15} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={9} y={-34} width={15} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ) : role === "mother" || role === "woman" ? (
        <path d="M -42 -62 L 42 -62 L 54 -2 L -54 -2 Z" fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      ) : (
        <g>
          <rect x={-30} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={6} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      <ellipse cx={-17} cy={-3} rx={18} ry={8} fill={KRP.ink} />
      <ellipse cx={17} cy={-3} rx={18} ry={8} fill={KRP.ink} />
      {/* 腕 */}
      {hideArm !== "left" && (
        <rect x={child ? -66 : -78} y={child ? -128 : -148} width={child ? 20 : 22} height={child ? 66 : 82}
          rx={10} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {hideArm !== "right" && (
        <rect x={child ? 46 : 56} y={child ? -128 : -148} width={child ? 20 : 22} height={child ? 66 : 82}
          rx={10} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {/* 胴 */}
      {child ? (
        <rect x={-50} y={-140} width={100} height={92} rx={14} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      ) : (
        <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      )}
      {/* 役ごとの服の飾り */}
      {role === "mother" && (
        <g>
          {/* 割烹着のひも+すそ */}
          <path d="M -58 -150 Q 0 -138 58 -150" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          <path d="M -58 -62 Q 0 -50 58 -62" fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          <circle cx={0} cy={-120} r={4.5} fill={KRP.cream} stroke={KRP.ink} strokeWidth={2.5} />
          <circle cx={0} cy={-94} r={4.5} fill={KRP.cream} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      )}
      {role === "boy" && (
        <g stroke={KRP.ink} strokeWidth={4} fill={clothDark}>
          {/* 吊りズボンのサスペンダー */}
          <rect x={-34} y={-140} width={14} height={92} />
          <rect x={20} y={-140} width={14} height={92} />
        </g>
      )}
      {role === "girl" && (
        <path d="M -50 -140 L 50 -140 L 64 -50 L -64 -50 Z" fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      )}
      {role === "man" && (
        <g>
          <path d="M -20 -160 L 0 -140 L 20 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-140} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        </g>
      )}
      {role === "woman" && (
        <path d="M -18 -160 L 0 -142 L 18 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      )}
      {/* 頭 */}
      <ellipse cx={0} cy={headCY} rx={child ? 56 : 58} ry={child ? 50 : 56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 髪・帽子 */}
      {role === "mother" && (
        <g>
          <path d={`M -58 ${headCY - 10} Q -60 ${headCY - 64} 0 ${headCY - 66} Q 60 ${headCY - 64} 58 ${headCY - 10} Q 32 ${headCY - 38} 0 ${headCY - 40} Q -32 ${headCY - 38} -58 ${headCY - 10} Z`}
            fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={0} cy={headCY - 66} r={19} fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {role === "woman" && (
        <g>
          <path d={`M -58 ${headCY - 8} Q -62 ${headCY - 62} 0 ${headCY - 64} Q 62 ${headCY - 62} 58 ${headCY - 8} Q 30 ${headCY - 36} 0 ${headCY - 38} Q -30 ${headCY - 36} -58 ${headCY - 8} Z`}
            fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-44} cy={headCY - 46} r={12} fill={hair} />
          <circle cx={44} cy={headCY - 46} r={12} fill={hair} />
        </g>
      )}
      {role === "man" && (
        <g>
          <path d={`M -56 ${headCY - 16} Q 0 ${headCY - 66} 56 ${headCY - 16} L 58 ${headCY - 6} Q 0 ${headCY - 28} -58 ${headCY - 6} Z`}
            fill="#6E6256" stroke={KRP.ink} strokeWidth={4.5} />
          <path d={`M 32 ${headCY - 12} Q 66 ${headCY - 16} 78 ${headCY} L 54 ${headCY + 6} Z`} fill="#5C5248" stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {role === "boy" && (
        <g>
          <path d={`M -54 ${headCY - 14} Q 0 ${headCY - 62} 54 ${headCY - 14} L 56 ${headCY - 4} Q 0 ${headCY - 24} -56 ${headCY - 4} Z`}
            fill="#3E4B66" stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={0} cy={headCY - 46} r={6} fill="#2E3850" stroke={KRP.ink} strokeWidth={3} />
          <rect x={-18} y={headCY - 12} width={36} height={9} rx={4} fill="#2E3850" stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {role === "girl" && (
        <g>
          <path d={`M -56 ${headCY + 18} Q -62 ${headCY - 56} 0 ${headCY - 58} Q 62 ${headCY - 56} 56 ${headCY + 18} L 44 ${headCY + 14} Q 48 ${headCY - 26} 0 ${headCY - 30} Q -48 ${headCY - 26} -44 ${headCY + 14} Z`}
            fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
          <path d={`M 34 ${headCY - 44} l 16 -14 l 2 18 l 16 -4 l -10 16 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {/* ほっぺ */}
      {blush && (
        <g fill="#F0A092" opacity={0.8}>
          <circle cx={-36} cy={eyeY + 24} r={12} />
          <circle cx={36} cy={eyeY + 24} r={12} />
        </g>
      )}
      {/* 目 */}
      {sparkleEyes ? (
        <g>
          <path d={star4(-22 + gx, eyeY + gy, 15 * pulse)} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          <path d={star4(22 + gx, eyeY + gy, 15 * pulse)} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={-22 + gx} cy={eyeY + gy} r={3.5} fill={KRP.white} />
          <circle cx={22 + gx} cy={eyeY + gy} r={3.5} fill={KRP.white} />
        </g>
      ) : blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={eyeY} x2={-12} y2={eyeY} />
          <line x1={12} y1={eyeY} x2={32} y2={eyeY} />
        </g>
      ) : (
        <g>
          <circle cx={-22 + gx} cy={eyeY + gy} r={6} fill={KRP.ink} />
          <circle cx={22 + gx} cy={eyeY + gy} r={6} fill={KRP.ink} />
        </g>
      )}
      {/* 眉・口 */}
      <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" fill="none">
        {face === "worried" ? (
          <>
            <line x1={-32} y1={eyeY - 24} x2={-12} y2={eyeY - 18} />
            <line x1={12} y1={eyeY - 18} x2={32} y2={eyeY - 24} />
          </>
        ) : face === "surprised" ? (
          <>
            <line x1={-32} y1={eyeY - 28} x2={-12} y2={eyeY - 28} />
            <line x1={12} y1={eyeY - 28} x2={32} y2={eyeY - 28} />
          </>
        ) : (
          <>
            <line x1={-32} y1={eyeY - 22} x2={-12} y2={eyeY - 24} />
            <line x1={12} y1={eyeY - 24} x2={32} y2={eyeY - 22} />
          </>
        )}
        {face === "surprised" ? (
          <ellipse cx={0} cy={eyeY + 38} rx={9} ry={12} fill={KRP.ink} />
        ) : face === "smile" ? (
          <path d={`M -13 ${eyeY + 34} Q 0 ${eyeY + 47} 13 ${eyeY + 34}`} />
        ) : face === "worried" ? (
          <path d={`M -11 ${eyeY + 40} Q 0 ${eyeY + 32} 11 ${eyeY + 40}`} />
        ) : (
          <line x1={-9} y1={eyeY + 38} x2={9} y2={eyeY + 38} />
        )}
      </g>
    </g>
  );
};

// ===== 紙コップ (x,y=底の中央)。level=0..1 でジュースが入る =====
const PaperCup: React.FC<{ x: number; y: number; s?: number; level?: number }> = ({ x, y, s = 1, level = 0 }) => {
  const lv = clamp01(level);
  const t0 = 80 * lv;
  const wTop = 28 + (t0 / 84) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -30 0 L 30 0 L 40 -84 L -40 -84 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      {lv > 0.02 && (
        <path d={`M ${-wTop + 3} ${-t0} L ${wTop - 3} ${-t0} L ${26} -3 L ${-26} -3 Z`} fill={KRP.orange} opacity={0.9} />
      )}
      {/* 赤い帯 */}
      <path d="M -37 -62 L 37 -62" stroke={KRP.red} strokeWidth={7} opacity={0.85} />
      <path d="M -40 -84 L 40 -84" stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
};

// ===== ガラス玉 (中で噴水が吹き上がる)。lit=0..1 で明るさ、fountainOn=false で噴水停止 =====
const GlassGlobe: React.FC<{
  cx: number; cy: number; r: number; f: number;
  speed?: number; lit?: number; fountainOn?: boolean; empty?: boolean;
}> = ({ cx, cy, r, f, speed = 1, lit = 1, fountainOn = true, empty = false }) => {
  const surfY = cy + r * 0.34;
  const halfW = Math.sqrt(Math.max(r * r - (r * 0.34) * (r * 0.34), 0)) * 0.96;
  const ntX = cx, ntY = cy - r * 0.16;
  return (
    <g>
      {/* あかりのにじみ */}
      {lit > 0.05 && <circle cx={cx} cy={cy} r={r * 1.14} fill="#FFE9A8" opacity={0.22 * lit} />}
      {/* ガラス */}
      <circle cx={cx} cy={cy} r={r} fill={empty ? "#DDE2E2" : "#EDF6FA"} opacity={0.6}
        stroke={KRP.ink} strokeWidth={Math.max(r * 0.045, 5)} />
      {/* ジュースのプール */}
      {!empty && (
        <g>
          <path d={`M ${cx - halfW} ${surfY} A ${r} ${r} 0 0 0 ${cx + halfW} ${surfY} Z`}
            fill={KRP.orange} opacity={0.45 + 0.45 * lit} />
          <path d={`M ${cx - halfW} ${surfY} Q ${cx} ${surfY + Math.sin(f / 7) * r * 0.03} ${cx + halfW} ${surfY}`}
            fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        </g>
      )}
      {/* 噴水の柱 (ノズル) */}
      <path d={`M ${cx - r * 0.1} ${cy + r * 0.86} L ${cx + r * 0.1} ${cy + r * 0.86} L ${cx + r * 0.055} ${ntY} L ${cx - r * 0.055} ${ntY} Z`}
        fill={KRP.silver} stroke={KRP.ink} strokeWidth={Math.max(r * 0.02, 3)} />
      {/* 噴水 */}
      {fountainOn && !empty && (
        <g>
          {[-1, 1].map((side) => (
            <path key={side}
              d={`M ${ntX} ${ntY} Q ${ntX + side * r * 0.4} ${cy - r * 0.64} ${ntX + side * r * 0.62} ${surfY - r * 0.04}`}
              fill="none" stroke={KRP.orange} strokeWidth={Math.max(r * 0.055, 5)}
              strokeLinecap="round" opacity={0.5 + 0.4 * lit} />
          ))}
          <path d={`M ${ntX} ${ntY} Q ${ntX} ${cy - r * 0.74} ${ntX} ${cy - r * 0.5}`}
            fill="none" stroke={KRP.orange} strokeWidth={Math.max(r * 0.05, 5)} strokeLinecap="round" opacity={0.5 + 0.4 * lit} />
          {/* しずく */}
          {Array.from({ length: 8 }, (_, i) => {
            const tt = (((f * speed * 1.4 + i * 13) % 52) + 52) % 52 / 52;
            const side = i % 2 === 0 ? -1 : 1;
            const bx = ntX + side * r * 0.4, by = cy - r * 0.64;
            const ex = ntX + side * r * 0.62, ey = surfY - r * 0.04;
            const a = (1 - tt) * (1 - tt), b = 2 * (1 - tt) * tt, c = tt * tt;
            return (
              <circle key={i} cx={a * ntX + b * bx + c * ex} cy={a * ntY + b * by + c * ey}
                r={Math.max(r * 0.035, 3.5)} fill="#F7B23B" stroke={KRP.ink} strokeWidth={2}
                opacity={0.5 + 0.4 * lit} />
            );
          })}
        </g>
      )}
      {/* きらめき */}
      {lit > 0.3 && fountainOn && !empty && (
        <g>
          <Sparkle x={cx - r * 0.5} y={cy - r * 0.45} r={r * 0.1} f={f} phase={0} />
          <Sparkle x={cx + r * 0.42} y={cy - r * 0.6} r={r * 0.08} f={f} phase={2} />
          <Sparkle x={cx + r * 0.6} y={cy + r * 0.05} r={r * 0.07} f={f} phase={4} />
        </g>
      )}
      {/* ガラスのハイライト */}
      <path d={`M ${cx - r * 0.62} ${cy - r * 0.38} Q ${cx - r * 0.45} ${cy - r * 0.66} ${cx - r * 0.16} ${cy - r * 0.72}`}
        fill="none" stroke={KRP.white} strokeWidth={Math.max(r * 0.045, 4)} strokeLinecap="round" opacity={0.75} />
      {/* 台座リング */}
      <rect x={cx - r * 0.56} y={cy + r * 0.84} width={r * 1.12} height={r * 0.18} rx={r * 0.07}
        fill={KRP.brass} stroke={KRP.ink} strokeWidth={Math.max(r * 0.03, 3.5)} />
    </g>
  );
};

// ===== 噴水式ジュース自販機 (x,y=足元中央)。s=1 で全高およそ820 =====
const FountainMachine: React.FC<{
  x: number; y: number; s?: number; f: number;
  speed?: number; lit?: number; fountainOn?: boolean; empty?: boolean; cup?: boolean;
}> = ({ x, y, s = 1, f, speed = 1, lit = 1, fountainOn = true, empty = false, cup = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 台 */}
    <rect x={-145} y={-34} width={290} height={34} rx={8} fill="#8C4A31" stroke={KRP.ink} strokeWidth={5} />
    {/* 本体 */}
    <rect x={-130} y={-564} width={260} height={530} rx={14} fill="#C9573B" stroke={KRP.ink} strokeWidth={8} />
    {/* 上ぶた (ガラス玉の台) */}
    <rect x={-150} y={-596} width={300} height={38} rx={10} fill="#8C4A31" stroke={KRP.ink} strokeWidth={6} />
    {/* ガラス玉 */}
    <GlassGlobe cx={0} cy={-706} r={112} f={f} speed={speed} lit={lit} fountainOn={fountainOn} empty={empty} />
    {/* 看板パネル */}
    <rect x={-98} y={-544} width={196} height={110} rx={10} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <text x={0} y={-474} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>
      ジュース
    </text>
    {/* 値札 */}
    <rect x={-62} y={-414} width={124} height={46} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    <text x={0} y={-380} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={KRP.red}>
      10円
    </text>
    {/* コイン投入口 */}
    <rect x={76} y={-352} width={42} height={62} rx={7} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={92} y={-338} width={10} height={36} rx={4} fill={KRP.ink} />
    {/* コップの受け口 */}
    <rect x={-84} y={-332} width={150} height={134} rx={12} fill={KRP.ink} />
    <rect x={-72} y={-320} width={126} height={110} rx={9} fill="#5A4636" />
    {cup && <PaperCup x={-9} y={-216} s={0.92} level={0.72} />}
    {/* ノズル */}
    <rect x={-17} y={-332} width={16} height={22} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
    {/* 足 */}
    <rect x={-120} y={-10} width={54} height={10} fill={KRP.ink} />
    <rect x={66} y={-10} width={54} height={10} fill={KRP.ink} />
  </g>
);

// ===== 提灯 (x,y=つり下げ点)。f でゆれる =====
const Chochin: React.FC<{ x: number; y: number; f: number; phase?: number; s?: number }> = ({
  x, y, f, phase = 0, s = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin((f + phase * 11) / 15) * 7}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={18} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-16} y={16} width={32} height={10} rx={4} fill={KRP.ink} />
    <ellipse cx={0} cy={66} rx={34} ry={44} fill="#E05A3A" stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -32 52 Q 0 60 32 52 M -34 68 Q 0 76 34 68 M -30 84 Q 0 92 30 84"
      fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.55} />
    <rect x={-14} y={106} width={28} height={9} rx={4} fill={KRP.ink} />
    <ellipse cx={-10} cy={56} rx={8} ry={14} fill="#F2A074" opacity={0.8} />
  </g>
);

// ===== 缶ジュース (x,y=底の中央)。sx で回転の見かけ (1=正面, 0付近=真横) =====
export const CanDrink: React.FC<{ x: number; y: number; s?: number; sx?: number; coffee?: boolean }> = ({ x, y, s = 1, sx = 1, coffee = false }) => {
  const front = sx > 0.18;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`scale(${Math.max(Math.abs(sx), 0.14)} 1)`}>
        <rect x={-40} y={-128} width={80} height={124} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={-126} rx={40} ry={10} fill="#DDE2E6" stroke={KRP.ink} strokeWidth={4} />
        {front && (coffee ? (
          <g>
            <rect x={-40} y={-102} width={80} height={66} fill="#6B4A2F" stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={0} cy={-69} r={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -11 -77 h 18 v 10 a 9 9 0 0 1 -18 0 Z" fill="#6B4A2F" stroke={KRP.ink} strokeWidth={2.5} />
            <path d="M 7 -75 q 9 1 8 7 q -1 5 -8 4" fill="none" stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ) : (
          <g>
            <rect x={-40} y={-102} width={80} height={66} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={0} cy={-69} r={22} fill="#F2B23B" stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M 0 -91 q 10 -8 16 -2 q -8 6 -16 2" fill={KRP.green} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
        <rect x={-10} y={-132} width={20} height={7} rx={3} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2.5} />
        <line x1={-28} y1={-116} x2={-28} y2={-16} stroke={KRP.white} strokeWidth={6} opacity={0.5} />
      </g>
    </g>
  );
};

// ===== 地図用ミニ噴水自販機アイコン (x,y=中心)。t=0..1 でポコッ =====
const MiniFountain: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t <= 0) return null;
  const p = pop(clamp01(t));
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <rect x={-22} y={-14} width={44} height={54} rx={6} fill="#C9573B" stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-26} r={19} fill="#EDF6FA" stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-23} r={9} fill={KRP.orange} />
    </g>
  );
};

// ===== コインメック/木箱の断面パネル (第5章の木箱断面と同じ構図) =====
// カード rect(280,170,1360,760) / レール (420,560)→(1180,640) / センサー (800,600)
// 金庫口 (1250,700) / 返却トレイ (820,840)
const railY = (x: number) => 560 + (x - 420) * (80 / 760);
const MechPanel: React.FC<{
  mode: "wood" | "metal"; f: number; opacity?: number;
  kick?: number; alert?: number; children?: React.ReactNode;
}> = ({ mode, f, opacity = 1, kick = 0, alert = 0, children }) => {
  const wood = mode === "wood";
  const panel = wood ? "#E6D3A8" : "#F3EBD7";
  const railFill = wood ? "#B98A52" : KRP.silver;
  return (
    <g opacity={opacity}>
      {/* 断面カード */}
      <rect x={280} y={170} width={1360} height={760} rx={20} fill={panel} stroke={KRP.ink} strokeWidth={7} />
      {wood && (
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.14} fill="none">
          {[260, 420, 580, 740].map((gy) => (
            <path key={gy} d={`M 320 ${gy} Q 700 ${gy - 16} 1080 ${gy} Q 1380 ${gy + 12} 1600 ${gy}`} />
          ))}
        </g>
      )}
      {/* 投入口 (420,430) */}
      <rect x={376} y={416} width={88} height={22} rx={8} fill={KRP.ink} />
      <text x={420} y={396} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28}
        fill={KRP.ink} opacity={0.7}>投入口</text>
      {/* 落下ガイド */}
      <line x1={398} y1={440} x2={398} y2={536} stroke={KRP.ink} strokeWidth={5} opacity={0.55} />
      <line x1={442} y1={440} x2={442} y2={536} stroke={KRP.ink} strokeWidth={5} opacity={0.55} />
      {/* レール (下り坂 約-8°) */}
      <line x1={420} y1={560} x2={1180} y2={640} stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
      <line x1={420} y1={560} x2={1180} y2={640} stroke={railFill} strokeWidth={11} strokeLinecap="round" />
      {/* レールの支柱 */}
      {[620, 1020].map((px) => (
        <rect key={px} x={px - 8} y={railY(px) + 8} width={16} height={900 - railY(px) - 8}
          fill={railFill} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
      ))}
      {/* 中央 (800,600): 木の関門 or コイルセンサー */}
      {wood ? (
        <g>
          {/* 上からつり下がる木の関門 (支点で回る) */}
          <rect x={770} y={250} width={60} height={160} fill="#A77B45" stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${-38 * clamp01(kick) + Math.sin(f / 19) * 2} 800 410)`}>
            <rect x={786} y={410} width={28} height={150} rx={8} fill="#B98A52" stroke={KRP.ink} strokeWidth={5} />
            <circle cx={800} cy={548} r={16} fill="#8C6E54" stroke={KRP.ink} strokeWidth={4} />
          </g>
          <circle cx={800} cy={410} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={690} y={300} width={220} height={48} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <text x={800} y={334} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink}>木の関門</text>
        </g>
      ) : (
        <g>
          {/* コイルセンサー (レールの上に待ち構える) */}
          <rect x={790} y={408} width={20} height={96} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={754} y={496} width={92} height={62} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          {[768, 784, 800, 816, 832].map((wx) => (
            <line key={wx} x1={wx} y1={500} x2={wx} y2={554} stroke={KRP.copper} strokeWidth={6} />
          ))}
          <circle cx={800} cy={527} r={34 + 6 * Math.sin(f / 6)} fill={KRP.yellow}
            opacity={0.14 + 0.1 * Math.sin(f / 6)} />
          {alert > 0.02 && <circle cx={800} cy={560} r={52} fill={KRP.red} opacity={0.35 * alert} />}
          <rect x={672} y={300} width={256} height={48} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <text x={800} y={334} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink}>コイルセンサー</text>
        </g>
      )}
      {/* 金庫口 (1250,700) */}
      <rect x={1186} y={646} width={148} height={112} rx={12} fill={wood ? "#A77B45" : KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={1204} y={664} width={112} height={76} rx={8} fill={KRP.ink} />
      <text x={1260} y={798} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28}
        fill={KRP.ink} opacity={0.75}>金庫へ</text>
      {/* 返却トレイ (820,840) */}
      <path d="M 738 822 L 902 822 L 882 866 Q 820 880 758 866 Z" fill={railFill} stroke={KRP.ink} strokeWidth={5} />
      <text x={820} y={908} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28}
        fill={KRP.ink} opacity={0.75}>返却</text>
      {children}
    </g>
  );
};

// ============================================================
// 第7章 10円玉と噴水の魔法 (127〜143)
// ============================================================

// ===== 127. 扉: 日本地図で東京→名古屋へホップ =====
const SceneCh7Door: React.FC<{ f: number }> = ({ f }) => {
  const stampOn = f >= 92;
  const titleT = easeOut(seg(f, 100, 118));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={200} />
        <g filter="url(#wobbleSoft)">
          <JapanMapCard>
            <JapanHop f={f} from={JMAP.tokyo} to={JMAP.nagoya} t0={16} lift={130} />
            <JmapLabel lon={139.7} lat={35.68} text="東京" />
            <JmapLabel lon={136.9} lat={35.17} text="名古屋" dx={-176} dy={34} />
          </JapanMapCard>
        </g>
      </svg>
      {stampOn && <Stamp x={320} y={180} text="1957年 名古屋" size={44} />}
      <div style={{
        position: "absolute", left: 1130, top: 680, width: 660,
        opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
      }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: KRP.grayDark, letterSpacing: 6 }}>
          第7章
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 54, color: KRP.ink, lineHeight: 1.4,
          borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
        }}>
          10円玉と噴水の魔法
        </div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 128. 布がバサッと外れて、自販機が目を覚ます =====
const SceneWake1957: React.FC<{ f: number }> = ({ f }) => {
  const flyT = easeOut(seg(f, 30, 56));
  const clothOp = 1 - seg(f, 46, 60);
  const lit = seg(f, 58, 80);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={201} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={890} width={W} height={190} fill={KRP.floor} />
          {lit > 0.05 && <circle cx={960} cy={480} r={560} fill="#FFE9A8" opacity={0.16 * lit} />}
        </g>
        <g filter="url(#wobble)">
          <FountainMachine x={960} y={900} f={f} speed={1} lit={lit} fountainOn={f > 56} />
          {/* かぶせてある布 (バサッと飛んでいく) */}
          {clothOp > 0.01 && (
            <g opacity={clothOp}
              transform={`translate(${flyT * 640} ${-flyT * 470}) rotate(${flyT * 34 + Math.sin(f / 17) * 1.5} 960 500)`}>
              <path d="M 756 150 Q 960 46 1164 150 L 1206 876 Q 960 936 714 876 Z"
                fill="#E8DFC8" stroke={KRP.ink} strokeWidth={7} />
              <g fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.3}>
                <path d="M 860 130 Q 846 500 830 870" />
                <path d="M 980 110 Q 986 500 992 898" />
                <path d="M 1100 134 Q 1116 500 1130 880" />
              </g>
            </g>
          )}
          {f > 62 && (
            <g>
              <Sparkle x={700} y={260} r={26} f={f} phase={0} />
              <Sparkle x={1240} y={200} r={30} f={f} phase={2} />
              <Sparkle x={1280} y={640} r={22} f={f} phase={4} />
            </g>
          )}
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 129. 名古屋のお祭り (屋台+提灯+人だかり) =====
const Yatai: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={20} y={500} width={18} height={360} fill="#8C6E54" stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={360} y={500} width={18} height={360} fill="#8C6E54" stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={0} y={426} width={400} height={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={14 + i * 100} y={426} width={46} height={78} fill={KRP.red} opacity={0.88} />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={40 + i * 80} cy={504} r={22} fill={i % 2 === 0 ? KRP.red : KRP.white}
        stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
    ))}
    <rect x={10} y={660} width={380} height={44} fill="#B98A52" stroke={KRP.ink} strokeWidth={5} />
  </g>
);
const SceneNagoyaFair: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={202} />
      <g filter="url(#wobbleSoft)">
        <rect x={0} y={860} width={W} height={220} fill={KRP.floor} />
        <Yatai x={30} />
        <Yatai x={1490} />
        <path d="M 0 150 Q 480 215 960 185 Q 1440 155 1920 205" fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g filter="url(#wobble)">
        {[[240, 190, 0], [620, 205, 1], [1000, 184, 2], [1380, 162, 3], [1720, 196, 4]].map(([cx, cy, ph]) => (
          <Chochin key={ph} x={cx} y={cy} f={f} phase={ph} s={0.9} />
        ))}
        <FountainMachine x={1180} y={888} s={0.92} f={f} />
        <ShowaPerson x={400} y={892} s={1.02} role="man" f={f} phase={0} face="surprised" gaze={[7, -2]} />
        <ShowaPerson x={575} y={894} s={0.98} role="woman" f={f} phase={1} face="smile" gaze={[7, -2]} />
        <ShowaPerson x={735} y={894} s={1} role="boy" f={f} phase={2} face="smile" gaze={[7, -3]} />
        <ShowaPerson x={872} y={895} s={0.96} role="girl" f={f} phase={3} face="surprised" gaze={[7, -3]} />
      </g>
    </svg>
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 130. 噴水式ジュース自販機の全体図 (キラッ) =====
const SceneFountainAll: React.FC<{ f: number }> = ({ f }) => {
  const sweepX = -500 + ((f * 17) % 2600);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={203} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={900} width={W} height={180} fill={KRP.floor} />
          <circle cx={960} cy={480} r={520} fill={KRP.cream} opacity={0.6} />
        </g>
        <g filter="url(#wobble)">
          <FountainMachine x={880} y={920} s={1} f={f} />
          {/* ツヤの帯がスーッと走る */}
          <g transform="rotate(18 960 540)" opacity={0.3}>
            <rect x={sweepX} y={-300} width={110} height={1700} fill={KRP.white} />
          </g>
          <Sparkle x={660} y={170} r={28} f={f} phase={1} />
          <Sparkle x={1130} y={300} r={24} f={f} phase={3} />
          {/* 投入口のそばの10円玉 */}
          <g transform={`translate(0 ${Math.sin(f / 11) * 8})`}>
            <Coin cx={1180} cy={540} r={48} fill={KRP.bronze} text="10" textSize={36} />
          </g>
          <path d="M 1128 560 L 1016 582" stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
          <polygon points="1004,585 1032,567 1036,596" fill={KRP.red} />
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="10円玉を入れると…" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 131. 紙コップがストンと落ちる (受け口のクローズアップ) =====
const SceneCupDrop: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 100;
  const dropT = seg(cyc, 8, 26);
  const landed = cyc >= 26;
  const bounce = landed ? Math.abs(Math.sin((cyc - 26) / 5.5)) * 22 * Math.max(0, 1 - (cyc - 26) / 28) : 0;
  const cupY = lerp(180, 790, dropT * dropT) - bounce;
  const dustT = seg(cyc, 26, 44);
  const ston = pop(seg(cyc, 28, 42)) * (1 - seg(cyc, 78, 94));
  return (
    <AbsoluteFill style={{ background: "#C9573B" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={204} />
        <g filter="url(#wobbleSoft)">
          {/* 自販機の受け口 (大写し) */}
          <rect x={60} y={0} width={1800} height={1080} fill="#C9573B" />
          <rect x={520} y={160} width={880} height={720} rx={28} fill={KRP.ink} />
          <rect x={556} y={196} width={808} height={648} rx={20} fill="#5A4636" />
          <rect x={556} y={790} width={808} height={54} fill="#46382C" />
        </g>
        <g filter="url(#wobble)">
          {/* ノズル */}
          <rect x={916} y={160} width={88} height={64} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          {/* 紙コップ (ストン) */}
          {cyc >= 8 && <PaperCup x={960} y={cupY} s={3.1} level={0} />}
          {/* 着地のホコリ */}
          {dustT > 0.01 && dustT < 1 && (
            <g fill="none" stroke={KRP.white} strokeWidth={8} strokeLinecap="round" opacity={0.8 * (1 - dustT)}>
              <path d={`M ${828 - dustT * 70} ${786 - dustT * 46} q -18 -16 -12 -38`} />
              <path d={`M ${1092 + dustT * 70} ${786 - dustT * 46} q 18 -16 12 -38`} />
            </g>
          )}
          {ston > 0.02 && (
            <g transform={`translate(1310 480) rotate(-8) scale(${ston})`}>
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88}
                fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3}>ストン</text>
            </g>
          )}
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 132. 1杯ぶん注がれてピタリと止まる =====
const ScenePourStop: React.FC<{ f: number }> = ({ f }) => {
  const lv = seg(f, 20, 88) * 0.85;
  const pouring = f >= 18 && f < 88;
  const juiceTopY = 840 - 4.2 * 80 * lv;
  const pita = pop(seg(f, 92, 106));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={205} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={0} width={W} height={200} fill="#C9573B" />
          <rect x={0} y={196} width={W} height={16} fill={KRP.ink} />
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          {/* ノズル */}
          <path d="M 912 200 L 1008 200 L 992 282 L 928 282 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          {/* ジュースの柱 */}
          {pouring && lv > 0.01 && (
            <rect x={946} y={278} width={28} height={Math.max(juiceTopY - 278, 0)} fill={KRP.orange} opacity={0.92} />
          )}
          <PaperCup x={960} y={840} s={4.2} level={lv} />
          {/* ピタッの効果線 */}
          {pita > 0.02 && (
            <g stroke={KRP.red} strokeWidth={10} strokeLinecap="round" opacity={pita}>
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  <line x1={960 + sd * 220} y1={520} x2={960 + sd * 290} y2={490} />
                  <line x1={960 + sd * 230} y1={600} x2={960 + sd * 305} y2={600} />
                  <line x1={960 + sd * 220} y1={680} x2={960 + sd * 290} y2={710} />
                </g>
              ))}
            </g>
          )}
          {pita > 0.02 && (
            <g transform={`translate(1360 420) rotate(-7) scale(${pita})`}>
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92}
                fill={KRP.red}>ピタッ</text>
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="1杯ぶんだけで、ピタリ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 133. 二分割: ヘロンのシーソー ⇔ 電気の弁 (同時に開→閉) =====
const SceneHeronValve: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 120;
  const val = clamp01(easeOut(seg(cyc, 10, 30)) - easeOut(seg(cyc, 70, 90)));
  const ang = -10 * val;
  const headY = lerp(638, 520, val);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={206} />
        <g filter="url(#wobbleSoft)">
          <rect x={60} y={150} width={840} height={790} rx={20} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1020} y={150} width={840} height={790} rx={20} fill="#EAF0F4" stroke={KRP.ink} strokeWidth={6} />
          <line x1={960} y1={140} x2={960} y2={950} stroke={KRP.ink} strokeWidth={5} strokeDasharray="20 18" opacity={0.6} />
        </g>
        <g filter="url(#wobble)">
          {/* --- 左: ヘロンの壺の断面 (シーソーの弁) --- */}
          <g transform="translate(470 880) scale(0.85)">
            <path d="M -150 -560 L 150 -560 L 120 -490 Q 196 -380 178 -170 Q 160 0 0 0 Q -160 0 -178 -170 Q -196 -380 -120 -490 Z"
              fill={KRP.bronze} stroke={KRP.ink} strokeWidth={8} />
            <path d="M -120 -480 Q -170 -376 -154 -170 Q -140 -26 0 -26 Q 140 -26 154 -170 Q 170 -376 120 -480 Z"
              fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} opacity={0.96} />
            {/* 中の水 */}
            <path d="M -148 -190 Q -136 -32 0 -30 Q 136 -32 148 -190 Q 70 -216 0 -216 Q -70 -216 -148 -190 Z"
              fill={KRP.blueSoft} />
            <path d="M -148 -190 Q 0 -222 148 -190" fill="none" stroke={KRP.blueDeep} strokeWidth={5} opacity={0.7} />
            {/* 注ぎ口 */}
            <path d="M 168 -240 L 230 -224 L 230 -198 L 172 -206 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
            {val > 0.5 && (
              <path d={`M 226 -200 Q 234 -130 228 -40`} fill="none" stroke={KRP.orange} strokeWidth={13}
                strokeLinecap="round" opacity={0.9} />
            )}
            {/* シーソーのてこ */}
            <g transform={`rotate(${ang} 0 -330)`}>
              <rect x={-120} y={-340} width={240} height={18} rx={8} fill="#B98A52" stroke={KRP.ink} strokeWidth={5} />
              <circle cx={-108} cy={-331} r={26} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
              <line x1={112} y1={-331} x2={150} y2={-246} stroke={KRP.ink} strokeWidth={4} />
            </g>
            <circle cx={0} cy={-330} r={11} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
          {/* --- 右: 電磁弁の断面 --- */}
          <g>
            {/* パイプ */}
            <rect x={1120} y={620} width={620} height={90} rx={10} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
            <rect x={1132} y={634} width={596} height={62} fill={KRP.orange} opacity={0.85} />
            {val > 0.4 && (
              <g stroke={KRP.white} strokeWidth={9} strokeLinecap="round" opacity={0.8 * val}>
                {[0, 1, 2, 3].map((i) => {
                  const dx = 1160 + ((f * 7 + i * 140) % 540);
                  return <line key={i} x1={dx} y1={665} x2={dx + 48} y2={665} />;
                })}
              </g>
            )}
            {/* プランジャー (弁の栓) */}
            <rect x={1425} y={400} width={30} height={Math.max(headY - 400, 4)} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={1402} y={headY} width={76} height={72} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
            {/* 電磁コイルの箱 */}
            <rect x={1360} y={300} width={160} height={130} rx={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6.5} />
            {[1378, 1404, 1430, 1456, 1482].map((wx) => (
              <line key={wx} x1={wx} y1={308} x2={wx} y2={422} stroke={KRP.copper} strokeWidth={8} />
            ))}
            {val > 0.2 && <circle cx={1440} cy={365} r={86} fill={KRP.yellow} opacity={0.22 * val} />}
            {val > 0.5 && <Bolt x={1552} y={310} s={0.9} opacity={0.6 + 0.4 * Math.sin(f / 4)} />}
          </g>
        </g>
      </svg>
      <LabelPill x={150} y={210} text="2000年前 ヘロンのシーソー" size={30} />
      <LabelPill x={1240} y={210} text="いま 電気の弁" size={30} />
      <LabelPill x={960} y={170} centerX text={val > 0.5 ? "開く" : "閉じる"} color={val > 0.5 ? KRP.red : KRP.ink} />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 134. ガラス玉の噴水 (大写しのきらきらループ) =====
const SceneGlassFountain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={207} />
      <g filter="url(#wobbleSoft)">
        <circle cx={960} cy={470} r={520} fill={KRP.cream} opacity={0.7} />
        <path d="M 850 800 L 1070 800 L 1130 1000 L 790 1000 Z" fill="#8C4A31" stroke={KRP.ink} strokeWidth={7} />
      </g>
      <g filter="url(#wobble)">
        <GlassGlobe cx={960} cy={470} r={330} f={f} />
        <Sparkle x={520} y={240} r={30} f={f} phase={1} />
        <Sparkle x={1420} y={330} r={26} f={f} phase={3} />
      </g>
    </svg>
    <LabelPill x={960} y={170} centerX text="てっぺんで、オレンジの噴水" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 135. 中身がまるごと見える (親子が見上げる) =====
const SceneMieruNakami: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={208} />
      <g filter="url(#wobbleSoft)">
        <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
      </g>
      <g filter="url(#wobble)">
        <FountainMachine x={620} y={900} s={1.02} f={f} />
        {/* 男の子 (ほっぺ+目がキラーン)。指さしの腕は別描き */}
        <ShowaPerson x={1170} y={898} s={1.05} role="boy" f={f} phase={1}
          face="smile" gaze={[-7, -3]} blush sparkleEyes hideArm="left" />
        <Arm x1={1130} y1={772} x2={980} y2={680} cloth="#DCD6C4" s={1.05} />
        <ShowaPerson x={1430} y={898} s={1.08} role="mother" f={f} phase={2} face="smile" gaze={[-6, -3]} />
      </g>
    </svg>
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 136. 子どもも大人も行列 (じわじわ進む) =====
const SceneFountainLine: React.FC<{ f: number }> = ({ f }) => {
  const shift = easeOut(seg(f, 20, 130)) * 46;
  const lineup: Array<[number, ShowaRole, ShowaFace, number]> = [
    [780, "boy", "smile", 0], [930, "girl", "smile", 1], [1090, "man", "normal", 2],
    [1250, "woman", "smile", 3], [1420, "boy", "surprised", 4], [1580, "mother", "normal", 5],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={209} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <FountainMachine x={400} y={900} s={1} f={f} />
          {lineup.map(([px, role, face, ph]) => (
            <ShowaPerson key={ph} x={px - shift} y={896} s={role === "boy" || role === "girl" ? 0.98 : 1.04}
              role={role} f={f} phase={ph} face={face} gaze={[-7, -2]} />
          ))}
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 137. 地図にミニ噴水自販機がポコポコ増える =====
const SceneDepartSpread: React.FC<{ f: number }> = ({ f }) => {
  const spots: Array<[number, number]> = [
    [136.9, 35.17], [139.7, 35.68], [135.5, 34.69], [140.87, 38.27],
    [132.46, 34.4], [130.4, 33.59], [138.0, 36.4], [141.35, 43.06],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={210} />
        <g filter="url(#wobbleSoft)">
          <JapanMapCard>
            {spots.map(([lon, lat], i) => {
              const [x, y] = jmapXY(lon, lat);
              return <MiniFountain key={i} x={x} y={y} t={seg(f, 14 + i * 12, 26 + i * 12)} />;
            })}
            <JmapLabel lon={136.9} lat={35.17} text="名古屋" dx={-176} dy={56} />
          </JapanMapCard>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="デパートの屋上や商店街へ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 138. 「約10,000台」カウントアップ =====
const Scene10000Count: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.floor(easeOut(seg(f, 8, 70)) * 10000);
  const don = 1 + 0.1 * pop(seg(f, 68, 80)) - 0.1 * seg(f, 80, 92);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={211} />
        <g filter="url(#wobbleSoft)" opacity={0.3}>
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 7 }, (_, c) => (
              <g key={`${r}${c}`} transform={`translate(${150 + c * 272} ${90 + r * 250})`}>
                <rect x={-22} y={-14} width={44} height={54} rx={6} fill="#C9573B" stroke={KRP.ink} strokeWidth={4} />
                <circle cx={0} cy={-26} r={19} fill="#EDF6FA" stroke={KRP.ink} strokeWidth={4} />
              </g>
            )),
          )}
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 540) scale(${don}) translate(-960 -540)`}>
            <rect x={480} y={330} width={960} height={380} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
            <text x={960} y={580} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={160} fill={KRP.red}>
              {`約${n.toLocaleString("en-US")}`}
              <tspan fontSize={76} fill={KRP.ink}>{" 台"}</tspan>
            </text>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={230} centerX text="多いときには、全国で" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 139. 自販機ブーム最初の花火 (噴水→夜空の花火) =====
const SceneFirstFireworks: React.FC<{ f: number }> = ({ f }) => {
  const riseT = seg(f, 40, 62);
  const burst1 = seg(f, 60, 82);
  const burst2 = seg(f, 84, 106);
  const Burst: React.FC<{ cx: number; cy: number; t: number; color: string }> = ({ cx, cy, t, color }) =>
    t > 0.01 ? (
      <g opacity={1 - Math.max(0, (t - 0.7) / 0.3)}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r0 = 30 + easeOut(t) * 180, r1 = 60 + easeOut(t) * 260;
          return (
            <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0}
              x2={cx + Math.cos(a) * r1} y2={cy + Math.sin(a) * r1}
              stroke={color} strokeWidth={10} strokeLinecap="round" />
          );
        })}
        <circle cx={cx} cy={cy} r={24 * (1 - t)} fill={KRP.white} />
      </g>
    ) : null;
  return (
    <AbsoluteFill style={{ background: "#2B3047" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={212} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={900} width={W} height={180} fill="#232736" />
          {[[180, 160], [420, 90], [1560, 140], [1760, 320]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={4} fill={KRP.white} opacity={0.5 + 0.4 * Math.sin(f / 9 + i)} />
          ))}
        </g>
        <g filter="url(#wobble)">
          <FountainMachine x={960} y={920} s={0.86} f={f} lit={0.9} />
          {/* 噴水のしずくが夜空へのぼる */}
          {riseT > 0.01 && riseT < 1 && (
            <g fill="#F7B23B" stroke={KRP.ink} strokeWidth={2}>
              {[0, 1, 2].map((i) => {
                const tt = clamp01(riseT - i * 0.12);
                return <circle key={i} cx={960 + (i - 1) * 40 * tt} cy={lerp(330, 300 - 60 * i, tt)} r={9} opacity={tt} />;
              })}
            </g>
          )}
          <Burst cx={960} cy={270} t={burst1} color={KRP.orange} />
          <Burst cx={1390} cy={220} t={burst2} color={KRP.yellow} />
          <Burst cx={490} cy={250} t={seg(f, 100, 122)} color="#E89AB0" />
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 140. ただし弱点が…… (スローになって「…ん？」) =====
const SceneButWeak: React.FC<{ f: number }> = ({ f }) => {
  const bub = pop(seg(f, 30, 46));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={213} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={900} width={W} height={180} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <FountainMachine x={760} y={920} s={1} f={f} speed={0.25} lit={0.8} />
          {bub > 0.02 && (
            <g transform={`translate(1360 360) scale(${bub}) translate(-1360 -360)`}>
              <circle cx={1360} cy={340} r={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
              <circle cx={1218} cy={474} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={1168} cy={530} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <text x={1360} y={372} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={KRP.ink}>
                …ん？
              </text>
            </g>
          )}
        </g>
        <rect x={0} y={0} width={W} height={H} fill="#3B332C" opacity={0.08 * seg(f, 20, 60)} />
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 141. 断面図: 同じジュースがぐるぐる循環 (章のオチ) =====
const SceneJunkanArrows: React.FC<{ f: number }> = ({ f }) => {
  const LOOP: Array<[number, number]> = [
    [960, 240], [1060, 440], [1180, 520], [1180, 760], [1000, 810],
    [770, 760], [770, 520], [880, 440], [960, 240],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={214} />
        <g filter="url(#wobbleSoft)">
          <rect x={360} y={120} width={1200} height={810} rx={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          {/* 配管ループ */}
          <path d={"M " + LOOP.map((p) => p.join(" ")).join(" L ")} fill="none"
            stroke={KRP.grayDark} strokeWidth={34} strokeLinejoin="round" opacity={0.5} />
          <path d={"M " + LOOP.map((p) => p.join(" ")).join(" L ")} fill="none"
            stroke={KRP.orange} strokeWidth={20} strokeLinejoin="round" opacity={0.8} />
        </g>
        <g filter="url(#wobble)">
          <GlassGlobe cx={960} cy={330} r={150} f={f} />
          {/* ポンプ */}
          <g transform="translate(1000 810)">
            <circle cx={0} cy={0} r={62} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6.5} />
            <g transform={`rotate(${f * 6})`}>
              {[0, 120, 240].map((a) => (
                <path key={a} d="M 0 0 L 40 -14 Q 52 0 40 14 Z" fill={KRP.grayDark} stroke={KRP.ink}
                  strokeWidth={3.5} transform={`rotate(${a})`} />
              ))}
            </g>
            <circle cx={0} cy={0} r={10} fill={KRP.ink} />
          </g>
          {/* 循環の矢印 (4つが周回) */}
          {[0, 1, 2, 3].map((i) => {
            const p = polyPoint(LOOP, f / 120 + i / 4);
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${(p.ang * 180) / Math.PI})`}>
                <polygon points="26,0 -14,-18 -14,18" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="同じジュースが、ぐるぐる循環" color={KRP.red} />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 142. 噴水が止まり、あかりが消える =====
const SceneFountainFade: React.FC<{ f: number }> = ({ f }) => {
  const lit = 1 - seg(f, 30, 110);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={215} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={900} width={W} height={180} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <FountainMachine x={960} y={920} s={1} f={f} speed={0.5} lit={lit} fountainOn={f < 60} empty={f >= 96} />
        </g>
        <rect x={0} y={0} width={W} height={H} fill="#2A2420" opacity={0.3 * seg(f, 40, 110)} />
      </svg>
      <LabelPill x={960} y={170} centerX text="噴水は、やがて街から消えた" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 143. それでも「買う楽しさ」は残った (子の目の星) =====
const SceneFunRemains: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={216} />
      <g filter="url(#wobbleSoft)">
        <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
      </g>
      <g filter="url(#wobble)">
        <FountainMachine x={620} y={900} s={1} f={f} lit={0.15} fountainOn={false} empty cup={false} />
        <ShowaPerson x={1240} y={898} s={1.1} role="boy" f={f} phase={1}
          face="smile" gaze={[-6, -3]} blush sparkleEyes />
        <Sparkle x={1120} y={560} r={22} f={f} phase={0} />
        <Sparkle x={1372} y={530} r={26} f={f} phase={2} />
        <Sparkle x={1300} y={440} r={18} f={f} phase={4} />
      </g>
    </svg>
    <LabelPill x={960} y={170} centerX text="「買う楽しさ」は、残った" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ============================================================
// 第8章 ポケットの中の起爆剤 (144〜167)
// ============================================================

// ===== 144. 扉: 名古屋から波紋、全国にピンがポコポコ =====
const SceneCh8Door: React.FC<{ f: number }> = ({ f }) => {
  const [ngx, ngy] = jmapXY(136.9, 35.17);
  const cities: Array<[number, number]> = [
    [139.7, 35.68], [135.5, 34.69], [132.46, 34.4], [130.4, 33.59], [140.87, 38.27], [141.35, 43.06],
  ];
  const stampOn = f >= 96;
  const titleT = easeOut(seg(f, 102, 120));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={217} />
        <g filter="url(#wobbleSoft)">
          <JapanMapCard>
            {/* 名古屋から広がる波紋 */}
            {[0, 1, 2].map((i) => {
              const t = (((f * 2 + i * 44) % 130) + 130) % 130 / 130;
              return (
                <circle key={i} cx={ngx} cy={ngy} r={20 + t * 300} fill="none"
                  stroke={KRP.red} strokeWidth={5} opacity={0.55 * (1 - t)} />
              );
            })}
            <MapPin x={ngx} y={ngy} t={1} s={0.9} />
            {cities.map(([lon, lat], i) => {
              const [x, y] = jmapXY(lon, lat);
              return <MapPin key={i} x={x} y={y} t={seg(f, 28 + i * 12, 42 + i * 12)} s={0.8} />;
            })}
            <JmapLabel lon={136.9} lat={35.17} text="名古屋" dx={-176} dy={56} />
          </JapanMapCard>
        </g>
      </svg>
      {stampOn && <Stamp x={320} y={180} text="1967年 全国へ" size={44} />}
      <div style={{
        position: "absolute", left: 1130, top: 680, width: 660,
        opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
      }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: KRP.grayDark, letterSpacing: 6 }}>
          第8章
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 54, color: KRP.ink, lineHeight: 1.4,
          borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
        }}>
          ポケットの中の起爆剤
        </div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 145. 高度経済成長 (ビルが伸びる+クレーン) =====
const SceneKodoSeicho: React.FC<{ f: number }> = ({ f }) => {
  // v2修正: ビル群が時間差でにょきにょき建ち上がり、窓が下から灯っていく。
  // 奥には東京タワー (1958年完成=時代の象徴) も立ち上がる
  const GROUND = 880;
  // [x, 幅, 最終高さ, 建ちはじめf, 色番号]
  const BLDGS: [number, number, number, number, number][] = [
    [110, 220, 420, 8, 0],
    [400, 180, 560, 26, 1],
    [640, 250, 330, 44, 0],
    [950, 300, 620, 62, 1],
    [1320, 200, 460, 80, 0],
    [1590, 240, 370, 98, 1],
  ];
  const towerT = easeOut(seg(f, 70, 140)); // 東京タワー (奥) はゆっくり
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={218} />
        <g filter="url(#wobbleSoft)">
          <circle cx={290} cy={210} r={110} fill={KRP.yellow} opacity={0.85} stroke={KRP.ink} strokeWidth={5} />
          {/* 東京タワー (奥・シルエット気味)。下からにょきっ */}
          {towerT > 0.01 && (
            <g transform={`translate(830 ${GROUND}) scale(0.85 ${towerT * 0.85})`} opacity={0.75}>
              <polygon points="-150,0 -44,-430 44,-430 150,0" fill="#C65B3C" stroke={KRP.ink} strokeWidth={5} />
              {/* 脚の間のアーチ */}
              <path d={`M -116 0 Q 0 -150 116 0 Z`} fill={KRP.paper} stroke={KRP.ink} strokeWidth={4.5} />
              {/* 展望台 */}
              <rect x={-62} y={-462} width={124} height={34} rx={8} fill="#E8E2D4" stroke={KRP.ink} strokeWidth={4.5} />
              {/* 上部+アンテナ */}
              <polygon points="-40,-462 -14,-650 14,-650 40,-462" fill="#C65B3C" stroke={KRP.ink} strokeWidth={4.5} />
              <line x1={0} y1={-650} x2={0} y2={-740} stroke={KRP.ink} strokeWidth={7} />
              {/* 横げた */}
              {[-120, -220, -320, -400].map((ty) => (
                <line key={ty} x1={-150 * (-ty < 430 ? 1 + ty / 430 * 0.7 : 0.3)} y1={ty} x2={150 * (-ty < 430 ? 1 + ty / 430 * 0.7 : 0.3)} y2={ty}
                  stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
              ))}
            </g>
          )}
          <rect x={0} y={GROUND} width={W} height={H - GROUND} fill={KRP.floor} />
          <line x1={0} y1={GROUND} x2={W} y2={GROUND} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ビル群 (時間差でにょきにょき) */}
        <g filter="url(#wobble)">
          {BLDGS.map(([bx, bw, bh, start, ci], bi) => {
            const t = easeOut(seg(f, start, start + 46));
            if (t < 0.01) return null;
            const h = bh * t;
            const done = t >= 0.99;
            // 窓: 下の階から順に灯る (建った高さより下だけ)
            const floors = Math.floor((bh - 50) / 90);
            const cols = Math.max(2, Math.floor(bw / 90));
            return (
              <g key={bi}>
                <rect x={bx} y={GROUND - h} width={bw} height={h}
                  fill={ci ? KRP.cream : KRP.blueSoft} stroke={KRP.ink} strokeWidth={6.5} />
                {/* 屋上のふち (完成したら) */}
                {done && <rect x={bx - 8} y={GROUND - h - 14} width={bw + 16} height={14} rx={4}
                  fill={ci ? "#D8CEB4" : "#9FB3C8"} stroke={KRP.ink} strokeWidth={4.5} />}
                {Array.from({ length: floors }, (_, fi) => {
                  const wy = GROUND - 70 - fi * 90;
                  if (wy < GROUND - h + 26) return null; // まだ建っていない階
                  return Array.from({ length: cols }, (_, c2) => (
                    <rect key={`${fi}-${c2}`} x={bx + 24 + c2 * ((bw - 48 - 46) / Math.max(1, cols - 1))} y={wy}
                      width={46} height={52} rx={5} fill={KRP.yellow} opacity={0.8} stroke={KRP.ink} strokeWidth={3.5} />
                  ));
                })}
                {/* 建ちきった瞬間の土ぼこり */}
                {(() => {
                  const dustT = seg(f, start + 42, start + 62);
                  if (dustT < 0.01 || dustT > 0.99) return null;
                  return [0, 1, 2].map((d) => (
                    <circle key={d} cx={bx + (d * bw) / 2} cy={GROUND - 8 - dustT * 26}
                      r={14 + dustT * 18} fill="#D8D2C4" opacity={0.5 * (1 - dustT)} />
                  ));
                })()}
              </g>
            );
          })}
          {/* クレーン (いちばん高いビルの隣で作業中) */}
          <g transform="translate(1270 880)">
            <rect x={-20} y={-660} width={40} height={660} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5.5} />
            <g stroke={KRP.ink} strokeWidth={3} opacity={0.55}>
              {Array.from({ length: 7 }, (_, i) => (
                <line key={i} x1={-20} y1={-90 - i * 84} x2={20} y2={-174 - i * 84} />
              ))}
            </g>
            <g transform={`rotate(${Math.sin(f / 45) * 20} 0 -660)`}>
              <rect x={-290} y={-682} width={400} height={28} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5.5} />
              {/* フックで鉄骨を吊って運ぶ */}
              <line x1={-264} y1={-654} x2={-264} y2={-470} stroke={KRP.ink} strokeWidth={4.5} />
              <rect x={-316} y={-470} width={104} height={26} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            </g>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={140} text="1960年代 高度経済成長" size={40} centerX />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 146. 缶ジュース登場 (1本がくるっと回る) =====
const SceneCanJuice: React.FC<{ f: number }> = ({ f }) => {
  const sx = Math.cos(((f % 90) / 90) * Math.PI * 2);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={219} />
        <g filter="url(#wobbleSoft)">
          {/* うしろの棚 */}
          <rect x={240} y={140} width={1440} height={620} rx={18} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          {[330, 540, 750].map((sy) => (
            <g key={sy}>
              <line x1={270} y1={sy} x2={1650} y2={sy} stroke={KRP.ink} strokeWidth={7} />
              {Array.from({ length: 8 }, (_, i) => (
                <CanDrink key={i} x={380 + i * 170} y={sy - 4} s={0.78} />
              ))}
            </g>
          ))}
        </g>
        <g filter="url(#wobble)">
          <circle cx={960} cy={760} r={250} fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={6} />
          <CanDrink x={960} y={940} s={2.3} sx={sx} />
          <Sparkle x={1170} y={600} r={26} f={f} phase={1} />
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="缶入り飲料、登場" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 147. 1967年、決定的な出来事 (暗転+スポットライト) =====
const Scene1967Spot: React.FC<{ f: number }> = ({ f }) => {
  const beam = easeOut(seg(f, 8, 40));
  const lit = seg(f, 40, 56);
  const don = 1 + 0.12 * pop(seg(f, 42, 56)) - 0.12 * seg(f, 56, 70);
  return (
    <AbsoluteFill style={{ background: "#2A2724" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={220} />
        <g filter="url(#wobbleSoft)">
          {/* 2本のサーチライト */}
          <polygon points={`120,1080 ${lerp(-300, 850, beam)},180 ${lerp(-100, 1070, beam)},180 420,1080`}
            fill="#FFF3C4" opacity={0.3} />
          <polygon points={`1800,1080 ${lerp(2220, 1070, beam)},180 ${lerp(2020, 850, beam)},180 1500,1080`}
            fill="#FFF3C4" opacity={0.3} />
          {lit > 0.05 && <circle cx={960} cy={480} r={360} fill="#FFF3C4" opacity={0.25 * lit} />}
        </g>
        <g filter="url(#wobble)">
          <g opacity={lit} transform={`translate(960 480) scale(${don}) translate(-960 -480)`}>
            <text x={960} y={560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={260}
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6}>1967</text>
          </g>
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 148. 新しい100円・50円 (ドーン+回転落下) =====
const SceneNewCoins: React.FC<{ f: number }> = ({ f }) => {
  const don = pop(seg(f, 10, 26));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={221} />
        <g filter="url(#wobbleSoft)">
          <circle cx={960} cy={480} r={430} fill={KRP.cream} opacity={0.8} />
          {/* 降りそそぐ50円玉 */}
          {Array.from({ length: 6 }, (_, i) => {
            const t = (((f * 1.6 + i * 34) % 170) + 170) % 170 / 170;
            const cx = 190 + i * 310;
            return (
              <g key={i} opacity={0.9}>
                <Coin cx={cx} cy={-120 + t * 1320} r={54} fill={KRP.silver} hole rotate={f * 4 + i * 60} />
              </g>
            );
          })}
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 480) scale(${don}) translate(-960 -480)`}>
            <Coin cx={960} cy={480} r={200} fill={KRP.silver} text="100" textSize={110} />
            {don > 0.9 && (
              <g stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" opacity={0.7}>
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <line key={a} x1={960 + Math.cos((a * Math.PI) / 180) * 236} y1={480 + Math.sin((a * Math.PI) / 180) * 236}
                    x2={960 + Math.cos((a * Math.PI) / 180) * 290} y2={480 + Math.sin((a * Math.PI) / 180) * 290} />
                ))}
              </g>
            )}
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="100円と50円が、新しくなった" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 149. お札くにゃくにゃ vs コインキラン =====
const SceneBillVsCoin: React.FC<{ f: number }> = ({ f }) => {
  const wob = Math.sin(f / 9);
  const shine = ((f * 10) % 700) - 150;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={222} />
        <g filter="url(#wobbleSoft)">
          <rect x={60} y={150} width={840} height={740} rx={20} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1020} y={150} width={840} height={740} rx={20} fill="#EAF0F4" stroke={KRP.ink} strokeWidth={6} />
          <line x1={960} y1={140} x2={960} y2={900} stroke={KRP.ink} strokeWidth={5} strokeDasharray="20 18" opacity={0.6} />
        </g>
        <g filter="url(#wobble)">
          {/* 左: くにゃくにゃのお札 */}
          <g transform={`translate(480 520) rotate(${wob * 4})`}>
            <path d={`M -260 ${-130 + wob * 18} Q -130 ${-170 - wob * 22} 0 ${-130 + wob * 20} Q 130 ${-90 - wob * 20} 260 ${-130 + wob * 16}
              L 260 ${130 + wob * 14} Q 130 ${170 + wob * 20} 0 ${130 - wob * 18} Q -130 ${90 + wob * 18} -260 ${130 - wob * 14} Z`}
              fill="#DCE7D2" stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={0} cy={wob * 4} rx={88} ry={102} fill="none" stroke={KRP.ink} strokeWidth={4.5} opacity={0.6} />
            <circle cx={0} cy={-18 + wob * 4} r={34} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
            <path d={`M -34 ${30 + wob * 4} Q 0 ${50 + wob * 4} 34 ${30 + wob * 4}`} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
          </g>
          {/* 右: ピシッとしたコイン */}
          <Coin cx={1440} cy={520} r={190} fill={KRP.silver} text="100" textSize={100} />
          <clipPath id="j2CoinClip222">
            <circle cx={1440} cy={520} r={182} />
          </clipPath>
          <g clipPath="url(#j2CoinClip222)" opacity={0.55}>
            <rect x={1140 + shine} y={260} width={60} height={520} fill={KRP.white} transform={`rotate(22 1440 520)`} />
          </g>
          <Sparkle x={1600} y={380} r={28} f={f} phase={2} />
        </g>
      </svg>
      <LabelPill x={330} y={210} text="お札 ヨレヨレ" size={32} />
      <LabelPill x={1300} y={210} text="コイン カチッ" size={32} color={KRP.red} />
      <LabelPill x={960} y={170} centerX text="機械が扱いやすいのは、どっち？" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 150. ポケットの小銭で買い物が完結 (3コマ順点灯) =====
const ScenePocketKansei: React.FC<{ f: number }> = ({ f }) => {
  const lit = [seg(f, 10, 24), seg(f, 52, 66), seg(f, 94, 108)];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={223} />
        <g filter="url(#wobbleSoft)">
          {[140, 710, 1280].map((cx, i) => (
            <rect key={i} x={cx} y={260} width={500} height={460} rx={20} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={7} opacity={0.35 + 0.65 * lit[i]} />
          ))}
        </g>
        <g filter="url(#wobble)">
          {/* 1: ポケットと小銭 */}
          <g opacity={0.35 + 0.65 * lit[0]}>
            <path d="M 260 380 L 520 380 L 500 620 Q 390 660 280 620 Z" fill="#4C5D78" stroke={KRP.ink} strokeWidth={6} />
            <path d="M 260 380 Q 390 420 520 380" fill="none" stroke={KRP.ink} strokeWidth={5} />
            <Coin cx={340} cy={330} r={42} fill={KRP.silver} text="100" textSize={26} rotate={-14} />
            <Coin cx={436} cy={310} r={36} fill={KRP.silver} hole rotate={10} />
          </g>
          {/* 2: 自販機 */}
          <g opacity={0.35 + 0.65 * lit[1]}>
            <Jihanki x={852} y={310} s={0.58} f={f} />
          </g>
          {/* 3: 缶ジュース */}
          <g opacity={0.35 + 0.65 * lit[2]}>
            <CanDrink x={1530} y={640} s={1.7} />
            <Sparkle x={1660} y={400} r={24} f={f} phase={1} />
          </g>
          {/* 矢印 */}
          {[656, 1226].map((ax, i) => {
            const t = pop(seg(f, 36 + i * 42, 48 + i * 42));
            return t > 0.02 ? (
              <g key={i} transform={`translate(${ax} 490) scale(${t})`}>
                <polygon points="-26,-24 14,0 -26,24" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
              </g>
            ) : null;
          })}
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 151. 自販機が街を埋めていく (夜の灯り) =====
const SceneMachiUmaru: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#2B3047" }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={224} />
      <g filter="url(#wobbleSoft)">
        {[[260, 140], [620, 90], [1060, 170], [1500, 110], [1800, 220]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={4} fill={KRP.white} opacity={0.5 + 0.4 * Math.sin(f / 9 + i * 2)} />
        ))}
        {/* ビルのシルエット */}
        <g fill="#20242F" stroke="#171A22" strokeWidth={4}>
          <rect x={0} y={420} width={300} height={460} />
          <rect x={320} y={540} width={260} height={340} />
          <rect x={700} y={470} width={280} height={410} />
          <rect x={1060} y={560} width={240} height={320} />
          <rect x={1380} y={430} width={300} height={450} />
          <rect x={1700} y={580} width={220} height={300} />
        </g>
        <rect x={0} y={876} width={W} height={204} fill="#232736" />
      </g>
      <g filter="url(#wobble)">
        {[180, 540, 905, 1270, 1640].map((mx, i) => {
          const t = pop(seg(f, 12 + i * 18, 26 + i * 18));
          return t > 0.02 ? (
            <g key={i} transform={`translate(${mx} 876) scale(${t}) translate(${-mx} -876)`}>
              <JihankiNight x={mx - 86} y={580} s={0.48} f={f} />
            </g>
          ) : null;
        })}
      </g>
    </svg>
    <J2Badge />
    <Atmosphere f={f} dark />
  </AbsoluteFill>
);

// ===== 152. 避けて通れない相手 (暗がりに怪しいコイン) =====
const SceneSakerarenai: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#413B33" }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={225} />
      <g filter="url(#wobbleSoft)">
        <polygon points="960,-40 520,1080 1400,1080" fill="#FFF3C4" opacity={0.14} />
        <ellipse cx={960} cy={940} rx={440} ry={70} fill="#FFF3C4" opacity={0.12} />
      </g>
      <g filter="url(#wobble)">
        <g transform={`translate(${Math.sin(f / 17) * 14} 0) rotate(${Math.sin(f / 23) * 6} 960 560)`}>
          <circle cx={960} cy={560} r={240} fill="#2E2A25" stroke="#1E1B17" strokeWidth={10} />
          <circle cx={960} cy={560} r={196} fill="none" stroke="#1E1B17" strokeWidth={5} opacity={0.7} />
          <text x={960} y={620} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170}
            fill="#55493C" opacity={0.9}>？</text>
        </g>
        <text x={620} y={330} fontFamily={FONT} fontWeight={900} fontSize={64} fill="#6E6256"
          opacity={0.5 + 0.3 * Math.sin(f / 11)}>？</text>
        <text x={1320} y={280} fontFamily={FONT} fontWeight={900} fontSize={80} fill="#6E6256"
          opacity={0.5 + 0.3 * Math.sin(f / 13 + 2)}>？</text>
      </g>
    </svg>
    <LabelPill x={960} y={170} centerX text="避けて通れない相手がいた" />
    <J2Badge />
    <Atmosphere f={f} dark />
  </AbsoluteFill>
);

// ===== 153. ニセ硬貨ドーン (稲妻+集中線) =====
const SceneNiseCoin: React.FC<{ f: number }> = ({ f }) => {
  const don = pop(seg(f, 12, 28));
  const flash = (f % 14) < 7;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={226} />
        <g filter="url(#wobbleSoft)">
          {/* 集中線 */}
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.5}>
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2 + 0.2;
              return (
                <line key={i} x1={960 + Math.cos(a) * 480} y1={540 + Math.sin(a) * 480}
                  x2={960 + Math.cos(a) * (640 + (i % 3) * 90)} y2={540 + Math.sin(a) * (640 + (i % 3) * 90)} />
              );
            })}
          </g>
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 540) scale(${don}) translate(-960 -540)`}>
            <circle cx={960} cy={540} r={230} fill="#9AA0A0" stroke={KRP.ink} strokeWidth={10} />
            <circle cx={960} cy={540} r={188} fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
            <text x={960} y={600} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={160}
              fill={KRP.ink} opacity={0.65}>？</text>
          </g>
          {don > 0.9 && (
            <g>
              <Bolt x={560} y={240} s={1.6} opacity={flash ? 1 : 0.25} />
              <Bolt x={1330} y={200} s={1.9} opacity={flash ? 0.25 : 1} />
              <Bolt x={1420} y={660} s={1.4} opacity={flash ? 1 : 0.25} />
            </g>
          )}
        </g>
      </svg>
      {f >= 30 && <Stamp x={1180} y={300} text="ニセ硬貨" size={72} />}
      <LabelPill x={960} y={170} centerX text="台数とお金が増えるほど…" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== レールを転がる硬貨 (MechPanel用の共通部品)。period=90f ループ =====
const RollingCoin: React.FC<{ f: number; fill?: string; text?: string; toTray?: boolean }> = ({
  f, fill = KRP.bronze, text = "10", toTray = false,
}) => {
  const cyc = f % 90;
  const dropT = easeOut(seg(cyc, 0, 12));
  if (toTray) {
    // 途中ではじかれて返却トレイへ
    const rollT = seg(cyc, 12, 42);
    const rx = lerp(420, 790, rollT);
    const flyT = seg(cyc, 42, 60);
    const x = cyc < 42 ? rx : lerp(790, 822, flyT);
    const y = cyc < 12 ? lerp(430, railY(420) - 44, dropT)
      : cyc < 42 ? railY(rx) - 44
        : lerp(railY(790) - 44, 820, flyT) - Math.sin(flyT * Math.PI) * 90;
    const op = 1 - seg(cyc, 74, 86);
    return op > 0.02 ? (
      <Coin cx={x} cy={y} r={34} fill={fill} text={text} textSize={24} rotate={rollT * 620 + flyT * 240} />
    ) : null;
  }
  const rollT = seg(cyc, 12, 64);
  const exitT = seg(cyc, 64, 76);
  const rx = lerp(420, 1180, rollT);
  const x = rx + exitT * 76;
  const y = cyc < 12 ? lerp(430, railY(420) - 44, dropT) : railY(rx) - 44 + exitT * 56;
  const op = 1 - seg(cyc, 70, 82);
  return op > 0.02 ? (
    <Coin cx={x} cy={y} r={34} fill={fill} text={text} textSize={24} rotate={rollT * 900} />
  ) : null;
};

// ===== 154. 木の仕掛け→コインメックへモーフ (80年で大進化) =====
const Scene80YearsMorph: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 45, 100);
  const cyc = f % 90;
  const kick = pop(seg(cyc, 34, 42)) * (1 - seg(cyc, 48, 58));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={227} />
        <g filter="url(#wobbleSoft)">
          {t < 0.99 && <MechPanel mode="wood" f={f} opacity={1 - t} kick={kick} />}
          {t > 0.01 && <MechPanel mode="metal" f={f} opacity={t} />}
        </g>
        <g filter="url(#wobble)">
          <RollingCoin f={f} />
        </g>
      </svg>
      <LabelPill x={340} y={110} text={t < 0.5 ? "80年前の木の仕掛け" : "いまのコインメック"} size={30} />
      <LabelPill x={960} y={170} centerX text="80年で、大進化" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 155. コインメックの場所 (透視図でピカピカ→拡大) =====
const SceneCoinmechPos: React.FC<{ f: number }> = ({ f }) => {
  const blink = 0.5 + 0.5 * Math.sin(f / 7);
  const insetT = pop(seg(f, 56, 76));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={228} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={900} width={W} height={180} fill={KRP.floor} />
          {/* 透けた自販機 */}
          <rect x={400} y={180} width={400} height={720} rx={16} fill={KRP.blueSoft} opacity={0.55}
            stroke={KRP.ink} strokeWidth={8} />
          <rect x={430} y={214} width={240} height={250} rx={10} fill={KRP.white} opacity={0.6} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 投入口 → コインメックの箱 */}
          <rect x={712} y={300} width={16} height={44} rx={5} fill={KRP.ink} />
          <rect x={620} y={380} width={140} height={104} rx={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6.5} />
          <rect x={620} y={380} width={140} height={104} rx={12} fill={KRP.yellow} opacity={0.4 * blink} />
          <line x1={720} y1={344} x2={700} y2={380} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          {/* 引き出し線 → 拡大の丸 */}
          <line x1={760} y1={432} x2={1206} y2={480} stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 12" opacity={0.7} />
          {insetT > 0.02 && (
            <g transform={`translate(1430 500) scale(${insetT}) translate(-1430 -500)`}>
              <circle cx={1430} cy={500} r={238} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
              {/* ミニレール+ミニコイル */}
              <line x1={1270} y1={540} x2={1590} y2={580} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
              <line x1={1270} y1={540} x2={1590} y2={580} stroke={KRP.silver} strokeWidth={7} strokeLinecap="round" />
              <rect x={1396} y={430} width={70} height={52} rx={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
              {[1408, 1422, 1436, 1450].map((wx) => (
                <line key={wx} x1={wx} y1={434} x2={wx} y2={478} stroke={KRP.copper} strokeWidth={5} />
              ))}
              <Coin cx={1330} cy={500} r={26} fill={KRP.silver} rotate={f * 6} />
              <text x={1430} y={660} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>
                コインメック
              </text>
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="入り口に、小さな検査装置" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 156. レールを転がりながらセンサーの前へ =====
const SceneCoinRail: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 90;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={229} />
        <g filter="url(#wobbleSoft)">
          <MechPanel mode="metal" f={f} />
        </g>
        <g filter="url(#wobble)">
          <RollingCoin f={f} fill={KRP.silver} text="100" />
          {/* ころころの動き線 */}
          {cyc > 16 && cyc < 60 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.5}>
              {(() => {
                const rx = lerp(420, 1180, seg(cyc, 12, 64));
                return (
                  <>
                    <line x1={rx - 74} y1={railY(rx) - 90} x2={rx - 112} y2={railY(rx) - 96} />
                    <line x1={rx - 70} y1={railY(rx) - 44} x2={rx - 116} y2={railY(rx) - 44} />
                  </>
                );
              })()}
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="転がりながら、検査の前へ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 157. 直径と厚みをゲージで測る =====
const SceneSizeCheck: React.FC<{ f: number }> = ({ f }) => {
  const g1 = easeOut(seg(f, 18, 38));
  const ok1 = pop(seg(f, 42, 56));
  const g2 = easeOut(seg(f, 66, 86));
  const ok2 = pop(seg(f, 90, 104));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={230} />
        <g filter="url(#wobbleSoft)">
          <rect x={80} y={170} width={860} height={700} rx={20} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <rect x={980} y={170} width={860} height={700} rx={20} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        </g>
        <g filter="url(#wobble)">
          {/* 左: 直径 */}
          <Coin cx={510} cy={560} r={160} fill={KRP.silver} text="100" textSize={84} />
          <g transform={`translate(0 ${lerp(-240, 0, g1)})`} opacity={Math.min(g1 * 3, 1)}>
            <line x1={350} y1={316} x2={670} y2={316} stroke={KRP.red} strokeWidth={10} />
            <line x1={350} y1={316} x2={350} y2={420} stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
            <line x1={670} y1={316} x2={670} y2={420} stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
          </g>
          {ok1 > 0.02 && (
            <g transform={`translate(510 260) scale(${ok1})`}>
              <path d="M -34 2 L -8 28 L 40 -26" fill="none" stroke={KRP.green} strokeWidth={18} strokeLinecap="round" />
            </g>
          )}
          {/* 右: 厚み (硬貨を真横から) */}
          <rect x={1330} y={480} width={160} height={44} rx={16} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
          <g opacity={Math.min(g2 * 3, 1)}>
            <g transform={`translate(${lerp(-150, 0, g2)} 0)`}>
              <line x1={1296} y1={400} x2={1296} y2={600} stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
            </g>
            <g transform={`translate(${lerp(150, 0, g2)} 0)`}>
              <line x1={1524} y1={400} x2={1524} y2={600} stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
            </g>
          </g>
          {ok2 > 0.02 && (
            <g transform={`translate(1410 300) scale(${ok2})`}>
              <path d="M -34 2 L -8 28 L 40 -26" fill="none" stroke={KRP.green} strokeWidth={18} strokeLinecap="round" />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={400} y={810} text="直径" size={34} />
      <LabelPill x={1340} y={810} text="厚み" size={34} />
      <LabelPill x={960} y={170} centerX text="まず、規格どおりかを測る" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 158. そっくりコインが澄まし顔で通過 (「！？」) =====
const SceneSokkuriPass: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 90;
  const cx = lerp(160, 1760, cyc / 90);
  const cy = 620 + (cx - 160) * 0.02;
  const bikkuri = pop(seg(cyc, 50, 62)) * (1 - seg(cyc, 82, 90));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={231} />
        <g filter="url(#wobbleSoft)">
          {/* レール (大写し) */}
          <line x1={0} y1={742} x2={W} y2={774} stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
          <line x1={0} y1={742} x2={W} y2={774} stroke={KRP.silver} strokeWidth={16} strokeLinecap="round" />
          {/* サイズゲージの門 */}
          <path d="M 850 760 L 850 360 Q 960 300 1070 360 L 1070 760" fill="none" stroke={KRP.grayDark} strokeWidth={26} />
          <rect x={806} y={260} width={308} height={66} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <text x={960} y={307} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={KRP.ink}>
            サイズ検査
          </text>
        </g>
        <g filter="url(#wobble)">
          {/* そっくりコイン (澄まし顔) */}
          <g transform={`translate(${cx} ${cy - 110})`}>
            <circle cx={0} cy={0} r={110} fill="#BCC3B8" stroke={KRP.ink} strokeWidth={8} />
            <circle cx={0} cy={0} r={90} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
            {/* とじた目+すまし口 */}
            <path d="M -52 -16 Q -34 -32 -16 -16" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <path d="M 16 -16 Q 34 -32 52 -16" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <path d="M -14 38 Q 0 46 14 38" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          </g>
          {bikkuri > 0.02 && (
            <g transform={`translate(1030 220) scale(${bikkuri})`}>
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={KRP.red}>
                ！？
              </text>
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="サイズそっくりだと、見抜けない" color={KRP.red} />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 159. 本命の検査「材質チェック」(コイルがスタンバイ) =====
const SceneZairyoBadge: React.FC<{ f: number }> = ({ f }) => {
  const lamp = 0.5 + 0.5 * Math.sin(f / 6);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={232} />
        <g filter="url(#wobbleSoft)">
          {/* レール+待ち構えるコイル */}
          <line x1={120} y1={700} x2={1800} y2={740} stroke={KRP.ink} strokeWidth={26} strokeLinecap="round" />
          <line x1={120} y1={700} x2={1800} y2={740} stroke={KRP.silver} strokeWidth={14} strokeLinecap="round" />
        </g>
        <g filter="url(#wobble)">
          <rect x={850} y={520} width={220} height={150} rx={18} fill={KRP.silver} stroke={KRP.ink} strokeWidth={8} />
          {[884, 922, 960, 998, 1036].map((wx) => (
            <line key={wx} x1={wx} y1={530} x2={wx} y2={660} stroke={KRP.copper} strokeWidth={12} />
          ))}
          {/* スタンバイランプ */}
          <circle cx={1110} cy={500} r={22} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} opacity={0.4 + 0.6 * lamp} />
          <circle cx={1110} cy={500} r={40} fill={KRP.green} opacity={0.2 * lamp} />
          <text x={1160} y={512} fontFamily={FONT} fontWeight={800} fontSize={34} fill={KRP.ink} opacity={0.8}>
            スタンバイ
          </text>
        </g>
      </svg>
      {f >= 10 && <Stamp x={560} y={200} text="材質チェック" size={76} />}
      {/* v3: 中央だと左の「材質チェック」スタンプ(x280-840)と重なる → 右の空きへ */}
      <LabelPill x={1300} y={170} centerX text="いよいよ、本命の検査" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 160. センサーの正体は電気を流したコイル =====
const SceneCoilSensor: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={233} />
      <g filter="url(#wobbleSoft)">
        <rect x={240} y={200} width={1440} height={620} rx={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        {/* 電池と配線 */}
        <path d="M 660 540 L 500 540 L 500 760 L 1420 760 L 1420 540 L 1260 540" fill="none"
          stroke={KRP.ink} strokeWidth={8} />
        <rect x={900} y={726} width={120} height={68} rx={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        <text x={960} y={774} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>電池</text>
      </g>
      <g filter="url(#wobble)">
        {/* コイルの芯 */}
        <rect x={660} y={470} width={600} height={140} rx={70} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
        {/* まきつく銅線 */}
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={712 + i * 55} cy={540} rx={26} ry={92} fill="none"
            stroke={KRP.copper} strokeWidth={13} />
        ))}
        {/* 電流の光が走る */}
        {[0, 1].map((k) => {
          const prog = (((f * 2 + k * 50) % 100) + 100) % 100 / 100;
          const gx = 690 + prog * 580;
          const gy = 540 + Math.sin(prog * Math.PI * 2 * 9.5) * 86;
          return <circle key={k} cx={gx} cy={gy} r={13} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />;
        })}
        <Bolt x={1330} y={300} s={1.2} opacity={0.6 + 0.4 * Math.sin(f / 5)} />
      </g>
    </svg>
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 161. 硬貨の中に渦電流がぐるぐる =====
const SceneUzuDenryu: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={234} />
      <g filter="url(#wobbleSoft)">
        {/* 右: コイルを真横から */}
        <rect x={1510} y={300} width={190} height={460} rx={26} fill={KRP.silver} stroke={KRP.ink} strokeWidth={8} />
        {[340, 410, 480, 550, 620, 690].map((wy) => (
          <line key={wy} x1={1520} y1={wy} x2={1690} y2={wy} stroke={KRP.copper} strokeWidth={13} />
        ))}
        {/* 磁力のカーブ */}
        <g fill="none" stroke={KRP.blueDeep} strokeWidth={6}
          strokeDasharray="18 16" opacity={0.5 + 0.25 * Math.sin(f / 8)}>
          <path d="M 1500 380 Q 1240 420 1120 520" />
          <path d="M 1500 530 Q 1300 540 1180 560" />
          <path d="M 1500 680 Q 1240 640 1120 560" />
        </g>
      </g>
      <g filter="url(#wobble)">
        {/* 左: 大きな硬貨と中の渦 */}
        <Coin cx={680} cy={540} r={260} fill={KRP.silver} />
        <SwirlRings cx={680} cy={540} radii={[90, 150, 205]} f={f} speed={3} />
      </g>
    </svg>
    <LabelPill x={960} y={170} centerX text="硬貨の中に「渦電流」が生まれる" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 162. 渦のでき方は材質でまったく違う =====
const SceneUzuChigai: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={235} />
      <g filter="url(#wobbleSoft)">
        <rect x={60} y={170} width={840} height={700} rx={20} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1020} y={170} width={840} height={700} rx={20} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <line x1={960} y1={160} x2={960} y2={880} stroke={KRP.ink} strokeWidth={5} strokeDasharray="20 18" opacity={0.6} />
      </g>
      <g filter="url(#wobble)">
        {/* 左: 100円 (白銅) きつい渦が速く回る */}
        <Coin cx={480} cy={520} r={200} fill={KRP.silver} />
        <SwirlRings cx={480} cy={520} radii={[60, 105, 155]} f={f} speed={4.4} width={11} />
        {/* 右: 5円 (黄銅・穴あき) ゆるい渦がゆっくり */}
        <Coin cx={1440} cy={520} r={200} fill={KRP.brass} hole />
        <SwirlRings cx={1440} cy={520} radii={[110, 165]} f={f} speed={1.6} dashed width={9} color="#7A94B8" />
      </g>
    </svg>
    <LabelPill x={330} y={790} text="100円 白銅" size={32} />
    <LabelPill x={1290} y={790} text="5円 黄銅" size={32} />
    <LabelPill x={960} y={170} centerX text="渦のでき方が、まったく違う" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 163. 硬貨ラインナップと材質ラベル (順にポン) =====
const SceneCoinLineup: React.FC<{ f: number }> = ({ f }) => {
  const coins: Array<{ label: string; mat: string; fill: string; text?: string; hole?: boolean }> = [
    { label: "1円", mat: "アルミ", fill: "#DDE2E6", text: "1" },
    { label: "5円", mat: "黄銅", fill: KRP.brass, hole: true },
    { label: "10円", mat: "青銅", fill: KRP.bronze, text: "10" },
    { label: "100円", mat: "白銅", fill: KRP.silver, text: "100" },
    { label: "500円", mat: "ニッケル黄銅", fill: KRP.gold, text: "500" },
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={236} />
        <g filter="url(#wobbleSoft)">
          <rect x={120} y={260} width={1680} height={420} rx={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          {coins.map((c, i) => (
            <Coin key={i} cx={330 + i * 320} cy={470} r={98} fill={c.fill} text={c.text} hole={c.hole} textSize={52} />
          ))}
          {coins.map((c, i) => (
            <text key={i} x={330 + i * 320} y={640} textAnchor="middle" fontFamily={FONT}
              fontWeight={800} fontSize={40} fill={KRP.ink}>{c.label}</text>
          ))}
        </g>
      </svg>
      {coins.map((c, i) => {
        const t = pop(seg(f, 16 + i * 22, 30 + i * 22));
        return t > 0.02 ? (
          <div key={i} style={{ position: "absolute", left: 330 + i * 320, top: 710, transform: `translateX(-50%) scale(${t})` }}>
            <LabelPill x={0} y={0} text={c.mat} size={30} color={KRP.red} />
          </div>
        ) : null;
      })}
      <LabelPill x={960} y={170} centerX text="材質が、少しずつ違う" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 164. 目で見るのではなく、電気の反応で見分ける =====
const SceneDenkiMe: React.FC<{ f: number }> = ({ f }) => {
  const coinX = 300 + ((f * 11) % 1500);
  const amp = 12 + 70 * Math.exp(-(((coinX - 960) / 180) ** 2));
  const wave = (ox: number) =>
    Array.from({ length: 40 }, (_, i) => {
      const px = ox - 170 + i * 8.5;
      return `${px},${440 + Math.sin((i + f * 0.8) / 2.2) * amp}`;
    }).join(" ");
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={237} />
        <g filter="url(#wobbleSoft)">
          <rect x={360} y={220} width={1200} height={440} rx={26} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={9} />
          {/* 2つのスクリーンが「目」 */}
          <rect x={430} y={300} width={460} height={280} rx={18} fill="#20261E" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1030} y={300} width={460} height={280} rx={18} fill="#20261E" stroke={KRP.ink} strokeWidth={6} />
          {/* まゆ */}
          <path d="M 470 268 Q 660 234 880 268" fill="none" stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
          <path d="M 1040 268 Q 1260 234 1450 268" fill="none" stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
        </g>
        <g filter="url(#wobble)">
          {/* 緑の波形 */}
          <polyline points={wave(660)} fill="none" stroke="#6CE07A" strokeWidth={7} strokeLinecap="round" />
          <polyline points={wave(1260)} fill="none" stroke="#6CE07A" strokeWidth={7} strokeLinecap="round" />
          {/* 下のレールを転がる硬貨 */}
          <line x1={120} y1={800} x2={1800} y2={836} stroke={KRP.ink} strokeWidth={24} strokeLinecap="round" />
          <line x1={120} y1={800} x2={1800} y2={836} stroke={KRP.silver} strokeWidth={13} strokeLinecap="round" />
          <Coin cx={coinX} cy={800 + (coinX - 120) * 0.021 - 76} r={62} fill={KRP.silver} text="100"
            textSize={36} rotate={f * 7} />
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="目ではなく、電気の反応で見分ける" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 165. 1990年代、ニセ500円が大流行 (警報) =====
const Scene500Warning: React.FC<{ f: number }> = ({ f }) => {
  const flash = 0.5 + 0.5 * Math.sin(f / 5);
  return (
    <AbsoluteFill style={{ background: "#352F29" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={238} />
        <g filter="url(#wobbleSoft)">
          {/* 回転する警告灯 */}
          <g transform={`rotate(${f * 4} 960 180)`}>
            {[0, 90, 180, 270].map((a) => (
              <polygon key={a} points="960,180 1210,100 1210,260" fill={KRP.red} opacity={0.22}
                transform={`rotate(${a} 960 180)`} />
            ))}
          </g>
          <circle cx={960} cy={180} r={56} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} opacity={0.5 + 0.5 * flash} />
        </g>
        <g filter="url(#wobble)">
          {/* 穴をあけられた外国コインのシルエット */}
          <g transform={`rotate(${Math.sin(f / 21) * 5} 960 580)`}>
            <circle cx={960} cy={580} r={230} fill="#4E463C" stroke="#241F1A" strokeWidth={10} />
            <circle cx={960} cy={580} r={52} fill="#352F29" stroke="#241F1A" strokeWidth={7} />
            <text x={960} y={760} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
              fill="#241F1A" opacity={0.8}>500?</text>
          </g>
        </g>
        <rect x={0} y={0} width={W} height={H} fill={KRP.red} opacity={0.08 * flash} />
      </svg>
      <LabelPill x={960} y={170} centerX text="ニセ500円が、大流行" color={KRP.red} />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 166. 2021年、500円玉は3層構造に進化 =====
const Scene500ThreeLayers: React.FC<{ f: number }> = ({ f }) => {
  // v3: 2000年の改鋳 (白銅→ニッケル黄銅。ニセ500円対策) を左に追加した2段構え。
  // #165のニセ500円大流行 → まず2000年に素材チェンジ → 2021年に3層構造、の流れがつながるように。
  const layers: Array<{ y: number; fill: string; name: string; t0: number }> = [
    { y: 700, fill: KRP.silver, name: "白銅", t0: 76 },
    { y: 636, fill: KRP.copper, name: "銅", t0: 94 },
    { y: 572, fill: KRP.silver, name: "白銅", t0: 112 },
  ];
  const coin1T = pop(seg(f, 8, 22));   // 白銅コイン
  const arrowT = seg(f, 24, 36);       // 矢印
  const coin2T = pop(seg(f, 34, 48));  // ニッケル黄銅コイン
  const frontT = pop(seg(f, 132, 148)); // 2021年の完成コイン
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={239} />
        <g filter="url(#wobbleSoft)">
          {/* 左: 2000年の素材チェンジ */}
          <rect x={110} y={240} width={740} height={570} rx={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          {/* 右: 2021年の3層構造 */}
          <rect x={950} y={240} width={850} height={570} rx={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          {/* 白銅コイン (〜2000年) */}
          {coin1T > 0.02 && (
            <g transform={`translate(295 500) scale(${coin1T}) translate(-295 -500)`}>
              <circle cx={295} cy={500} r={105} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
              <circle cx={295} cy={500} r={78} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
              <text x={295} y={520} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52}
                fill={KRP.ink} opacity={0.75}>500</text>
            </g>
          )}
          {/* 矢印 */}
          {arrowT > 0.02 && (
            <g opacity={arrowT}>
              <line x1={418} y1={500} x2={512} y2={500} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
              <polygon points="540,500 504,482 504,518" fill={KRP.ink} />
            </g>
          )}
          {/* ニッケル黄銅コイン (2000年〜。金色っぽくなった) */}
          {coin2T > 0.02 && (
            <g transform={`translate(665 500) scale(${coin2T}) translate(-665 -500)`}>
              <circle cx={665} cy={500} r={105} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
              <circle cx={665} cy={500} r={78} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
              <text x={665} y={520} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52}
                fill={KRP.ink} opacity={0.75}>500</text>
            </g>
          )}
          {/* 真横から見た3層 (1枚ずつ重なる) */}
          {layers.map((L, i) => {
            const t = seg(f, L.t0, L.t0 + 16);
            if (t <= 0) return null;
            const yy = lerp(L.y - 240, L.y, easeOut(t));
            return (
              <g key={i} opacity={Math.min(t * 3, 1)}>
                <rect x={1010} y={yy} width={440} height={54} rx={18} fill={L.fill} stroke={KRP.ink} strokeWidth={7} />
              </g>
            );
          })}
        </g>
      </svg>
      {/* 素材名 (コインの下) */}
      {f >= 18 && <LabelPill x={295} y={640} centerX text="白銅" size={28} />}
      {f >= 46 && <LabelPill x={665} y={640} centerX text="ニッケル黄銅" size={28} />}
      {f >= 56 && <LabelPill x={480} y={726} centerX text="ニセ硬貨対策で素材チェンジ" size={26} color={KRP.red} />}
      {/* 3層のラベル */}
      {layers.map((L, i) => {
        const t = seg(f, L.t0 + 10, L.t0 + 22);
        return t > 0.02 ? (
          <div key={i} style={{ position: "absolute", left: 1480, top: L.y - 2, opacity: t }}>
            <LabelPill x={0} y={0} text={L.name} size={28} />
          </div>
        ) : null;
      })}
      {/* 2021年の完成コイン (外側ニッケル黄銅+中は3層) */}
      {frontT > 0.02 && (
        <svg width={W} height={H} style={abs}>
          <WobbleDefs seed={243} />
          <g filter="url(#wobble)" transform={`translate(1640 420) scale(${frontT}) translate(-1640 -420)`}>
            <circle cx={1640} cy={420} r={125} fill={KRP.gold} stroke={KRP.ink} strokeWidth={8} />
            <circle cx={1640} cy={420} r={74} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <text x={1640} y={440} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
              fill={KRP.ink} opacity={0.8}>500</text>
          </g>
        </svg>
      )}
      {f >= 4 && <Stamp x={160} y={268} text="2000年" size={40} />}
      {f >= 126 && <Stamp x={1000} y={268} text="2021年" size={40} />}
      {/* 見出し (左右それぞれ) */}
      <LabelPill x={480} y={170} centerX text="まず、素材をチェンジ" />
      <LabelPill x={1375} y={170} centerX text="2種類の金属を重ねた、3層構造" size={34} />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 167. 二分割: 木の目 vs 電気の目 (ニセ硬貨を同時にはじく) =====
const SceneWoodVsMech: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 100;
  const kick = pop(seg(cyc, 42, 52)) * (1 - seg(cyc, 58, 70));
  const batsu = pop(seg(cyc, 46, 58)) * (1 - seg(cyc, 86, 98));
  // ニセ硬貨: 落下→転がり→はじかれて返却トレイへ
  const FakeCoin: React.FC = () => {
    const dropT = easeOut(seg(cyc, 0, 10));
    const rollT = seg(cyc, 10, 45);
    const flyT = seg(cyc, 45, 62);
    const rx = lerp(420, 790, rollT);
    const x = cyc < 45 ? rx : lerp(790, 822, flyT);
    const y0 = railY(790) - 44;
    const y = cyc < 10 ? lerp(430, railY(420) - 44, dropT)
      : cyc < 45 ? railY(rx) - 44
        : lerp(y0, 820, flyT) - Math.sin(flyT * Math.PI) * 90;
    const op = 1 - seg(cyc, 80, 92);
    return op > 0.02 ? (
      <Coin cx={x} cy={y} r={34} fill="#9AA0A0" text="?" textSize={30} rotate={rollT * 620 + flyT * 240} />
    ) : null;
  };
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={240} />
        <g filter="url(#wobbleSoft)">
          <line x1={960} y1={120} x2={960} y2={940} stroke={KRP.ink} strokeWidth={5} strokeDasharray="20 18" opacity={0.6} />
          {/* 左: 木箱のミニ断面 */}
          <g transform="translate(480 560) scale(0.47) translate(-960 -550)">
            <MechPanel mode="wood" f={f} kick={kick}>
              <FakeCoin />
              {batsu > 0.02 && (
                <g transform={`translate(800 540) scale(${batsu})`} stroke={KRP.red} strokeWidth={26} strokeLinecap="round">
                  <line x1={-56} y1={-56} x2={56} y2={56} />
                  <line x1={56} y1={-56} x2={-56} y2={56} />
                </g>
              )}
            </MechPanel>
          </g>
          {/* 右: コインメックのミニ断面 */}
          <g transform="translate(1440 560) scale(0.47) translate(-960 -550)">
            <MechPanel mode="metal" f={f} alert={kick}>
              <FakeCoin />
              {batsu > 0.02 && (
                <g transform={`translate(800 540) scale(${batsu})`} stroke={KRP.red} strokeWidth={26} strokeLinecap="round">
                  <line x1={-56} y1={-56} x2={56} y2={56} />
                  <line x1={56} y1={-56} x2={-56} y2={56} />
                </g>
              )}
            </MechPanel>
          </g>
        </g>
      </svg>
      <LabelPill x={290} y={160} text="80年前 下関" size={30} />
      <LabelPill x={1230} y={160} text="現代 コインメック" size={30} />
      <LabelPill x={960} y={170} centerX text="木の目は、電気の目へ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// 出口: motif → シーン振り分け (知らないmotifは null)
// ============================================================
export const j2Ch7to8Scene = (motif: string, f: number): React.ReactElement | null => {
  switch (motif) {
    // 第7章
    case "j2_ch7_door": return <SceneCh7Door f={f} />;
    case "j2_wake_1957": return <SceneWake1957 f={f} />;
    case "j2_nagoya_fair": return <SceneNagoyaFair f={f} />;
    case "j2_fountain_all": return <SceneFountainAll f={f} />;
    case "j2_cup_drop": return <SceneCupDrop f={f} />;
    case "j2_pour_stop": return <ScenePourStop f={f} />;
    case "j2_heron_valve": return <SceneHeronValve f={f} />;
    case "j2_glass_fountain": return <SceneGlassFountain f={f} />;
    case "j2_mieru_nakami": return <SceneMieruNakami f={f} />;
    case "j2_fountain_line": return <SceneFountainLine f={f} />;
    case "j2_depart_spread": return <SceneDepartSpread f={f} />;
    case "j2_10000_count": return <Scene10000Count f={f} />;
    case "j2_first_fireworks": return <SceneFirstFireworks f={f} />;
    case "j2_but_weak": return <SceneButWeak f={f} />;
    case "j2_junkan_arrows": return <SceneJunkanArrows f={f} />;
    case "j2_fountain_fade": return <SceneFountainFade f={f} />;
    case "j2_fun_remains": return <SceneFunRemains f={f} />;
    // 第8章
    case "j2_ch8_door": return <SceneCh8Door f={f} />;
    case "j2_kodo_seicho": return <SceneKodoSeicho f={f} />;
    case "j2_can_juice": return <SceneCanJuice f={f} />;
    case "j2_1967_spot": return <Scene1967Spot f={f} />;
    case "j2_new_coins": return <SceneNewCoins f={f} />;
    case "j2_bill_vs_coin": return <SceneBillVsCoin f={f} />;
    case "j2_pocket_kansei": return <ScenePocketKansei f={f} />;
    case "j2_machi_umaru": return <SceneMachiUmaru f={f} />;
    case "j2_sakerarenai": return <SceneSakerarenai f={f} />;
    case "j2_nise_coin": return <SceneNiseCoin f={f} />;
    case "j2_80years_morph": return <Scene80YearsMorph f={f} />;
    case "j2_coinmech_pos": return <SceneCoinmechPos f={f} />;
    case "j2_coin_rail": return <SceneCoinRail f={f} />;
    case "j2_size_check": return <SceneSizeCheck f={f} />;
    case "j2_sokkuri_pass": return <SceneSokkuriPass f={f} />;
    case "j2_zairyo_badge": return <SceneZairyoBadge f={f} />;
    case "j2_coil_sensor": return <SceneCoilSensor f={f} />;
    case "j2_uzu_denryu": return <SceneUzuDenryu f={f} />;
    case "j2_uzu_chigai": return <SceneUzuChigai f={f} />;
    case "j2_coin_lineup": return <SceneCoinLineup f={f} />;
    case "j2_denki_me": return <SceneDenkiMe f={f} />;
    case "j2_500_warning": return <Scene500Warning f={f} />;
    case "j2_500_3layers": return <Scene500ThreeLayers f={f} />;
    case "j2_wood_vs_mech": return <SceneWoodVsMech f={f} />;
    default: return null;
  }
};

export const J2_CH7TO8_MOTIFS: string[] = [
  "j2_ch7_door", "j2_wake_1957", "j2_nagoya_fair", "j2_fountain_all", "j2_cup_drop",
  "j2_pour_stop", "j2_heron_valve", "j2_glass_fountain", "j2_mieru_nakami", "j2_fountain_line",
  "j2_depart_spread", "j2_10000_count", "j2_first_fireworks", "j2_but_weak", "j2_junkan_arrows",
  "j2_fountain_fade", "j2_fun_remains",
  "j2_ch8_door", "j2_kodo_seicho", "j2_can_juice", "j2_1967_spot", "j2_new_coins",
  "j2_bill_vs_coin", "j2_pocket_kansei", "j2_machi_umaru", "j2_sakerarenai", "j2_nise_coin",
  "j2_80years_morph", "j2_coinmech_pos", "j2_coin_rail", "j2_size_check", "j2_sokkuri_pass",
  "j2_zairyo_badge", "j2_coil_sensor", "j2_uzu_denryu", "j2_uzu_chigai", "j2_coin_lineup",
  "j2_denki_me", "j2_500_warning", "j2_500_3layers", "j2_wood_vs_mech",
];
