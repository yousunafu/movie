// 自販機2000年史 第4章「レストランまるごと自販機」(シーン71〜91)。
// 1902年フィラデルフィアのオートマット: 壁一面の小窓レストランの種明かし〜1991年の閉店まで。
// WobbleDefs の seed はこのファイルでは 135〜158 を使う (他ファイルと重複させない)。

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  KRP, WobbleDefs, Atmosphere, LabelPill, Stamp, Coin,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, abs, J2Badge,
  Globe, globePoint, DashArc, MapPin, FlagCard, JihankiNight,
} from "./Jihanki2000Scenes";
import { TownPerson } from "./Jihanki2000Ch2to4";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

// ===== 食べ物 (小窓の中身。中心が原点) =====
const FoodPie: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={20} rx={36} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -28 16 Q -28 -10 0 -12 Q 28 -10 28 16 Z" fill={KRP.copper} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -28 10 Q 0 20 28 10" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
    {[-18, -6, 6, 18].map((px) => (
      <circle key={px} cx={px} cy={-4} r={2.4} fill={KRP.ink} opacity={0.4} />
    ))}
  </g>
);
const FoodBeans: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -34 0 Q -34 26 0 26 Q 34 26 34 0 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={34} ry={8} fill={KRP.copper} stroke={KRP.ink} strokeWidth={3.5} />
    {[[-18, -2], [-4, 2], [10, -3], [20, 1], [2, -5]].map(([bx, by], i) => (
      <ellipse key={i} cx={bx} cy={by} rx={5} ry={3.6} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={1.8} />
    ))}
  </g>
);
const FoodCoffee: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={24} rx={34} ry={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -22 -14 L 22 -14 L 18 20 L -18 20 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 22 -8 Q 38 -6 34 8 Q 32 14 19 14" fill="none" stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={0} cy={-14} rx={22} ry={5} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
type FoodKind = "pie" | "beans" | "coffee" | "empty";
const Food: React.FC<{ kind: FoodKind; s?: number }> = ({ kind, s = 1 }) =>
  kind === "pie" ? <FoodPie s={s} /> : kind === "beans" ? <FoodBeans s={s} /> : kind === "coffee" ? <FoodCoffee s={s} /> : null;

// ===== 湯気 (fc でゆらゆら上る) =====
const Steam: React.FC<{ x: number; y: number; f: number; s?: number; n?: number }> = ({ x, y, f, s = 1, n = 2 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = ((f * 1.1 + i * 34) % 80) / 80;
      const sway = Math.sin((f + i * 23) / 9) * 10 * s;
      return (
        <path key={i}
          d={`M 0 0 q ${10 * s} ${-16 * s} 0 ${-32 * s} q ${-10 * s} ${-16 * s} 0 ${-32 * s}`}
          transform={`translate(${x + i * 20 * s - (n - 1) * 10 * s + sway} ${y - t * 70 * s})`}
          fill="none" stroke={KRP.grayDark} strokeWidth={5 * s} strokeLinecap="round"
          opacity={0.65 * (1 - t)} />
      );
    })}
  </g>
);

// ===== オートマットの小窓 1マス (x,y=ガラス中央)。open=0..1 でガラス戸が上へスライド =====
const Cell: React.FC<{
  x: number; y: number; s?: number; food?: FoodKind;
  open?: number; lit?: boolean; foodOpacity?: number;
}> = ({ x, y, s = 1, food = "pie", open = 0, lit = true, foodOpacity = 1 }) => {
  const gw = 110, gh = 96; // ガラス開口
  const doorH = gh * (1 - clamp01(open));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 金属枠 */}
      <rect x={-75} y={-65} width={150} height={130} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* 開口 (中の棚) */}
      <rect x={-gw / 2} y={-gh / 2} width={gw} height={gh} rx={4}
        fill={food === "empty" ? "#8D8273" : lit ? "#F7EDC9" : "#C9BFA8"} stroke={KRP.ink} strokeWidth={4} />
      {/* 棚板の線 */}
      <line x1={-gw / 2} y1={gh / 2 - 14} x2={gw / 2} y2={gh / 2 - 14} stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
      {/* 中身 */}
      {food !== "empty" && (
        <g transform="translate(0 12)" opacity={foodOpacity}>
          <Food kind={food} s={0.78} />
        </g>
      )}
      {/* ガラス戸 (下から doorH ぶんだけ見える = 上にスライド) */}
      {doorH > 2 && (
        <g>
          <rect x={-gw / 2} y={-gh / 2} width={gw} height={doorH} fill="#DCE8EE" opacity={0.4} />
          <line x1={-gw / 2} y1={-gh / 2 + doorH} x2={gw / 2} y2={-gh / 2 + doorH} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-14} y={-gh / 2 + doorH - 10} width={28} height={8} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2.5} />
          <line x1={-gw / 2 + 10} y1={-gh / 2 + 8} x2={-gw / 2 + 30} y2={-gh / 2 + doorH * 0.5} stroke={KRP.white} strokeWidth={4} opacity={0.5} />
        </g>
      )}
    </g>
  );
};

// ===== 小窓の壁 (cols×rows)。x0,y0=左上マスの中心 =====
const FOOD_CYCLE: FoodKind[] = ["pie", "beans", "coffee"];
export const WindowWall: React.FC<{
  x0: number; y0: number; cols: number; rows: number;
  pitchX?: number; pitchY?: number; s?: number; lit?: boolean;
}> = ({ x0, y0, cols, rows, pitchX = 170, pitchY = 150, s = 1, lit = true }) => (
  <g>
    {/* 壁の下地 (大理石風) */}
    <rect x={x0 - 110 * s} y={y0 - 100 * s} width={(cols - 1) * pitchX + 220 * s} height={(rows - 1) * pitchY + 200 * s}
      rx={10} fill="#E7DFCE" stroke={KRP.ink} strokeWidth={6} />
    {Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (
        <Cell key={`${r}-${c}`} x={x0 + c * pitchX} y={y0 + r * pitchY} s={s}
          food={FOOD_CYCLE[(r * 2 + c) % 3]} lit={lit} />
      )),
    )}
  </g>
);

// ===== 新キャラ: コック (白衣+コック帽。TownPerson と同じ骨格) =====
type Ch4Face = "normal" | "smile" | "worried" | "surprised";
export const Cook: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: Ch4Face; gaze?: [number, number]; hideArm?: "left" | "right"; mustache?: boolean;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0], hideArm, mustache }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  const cloth = "#F0EBDF", clothDark = "#8C8578";
  const eyeY = -216;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <rect x={-30} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={6} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      <ellipse cx={18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      {hideArm !== "left" && (
        <rect x={-78} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {hideArm !== "right" && (
        <rect x={56} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {/* 白衣 (ダブルボタン) */}
      <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      {[-14, 14].map((bx) =>
        [-134, -110, -86].map((by) => <circle key={`${bx}${by}`} cx={bx} cy={by} r={4.5} fill={KRP.ink} opacity={0.65} />),
      )}
      {/* 首もとのスカーフ */}
      <path d="M -24 -162 L 24 -162 L 0 -138 Z" fill="#C0563F" stroke={KRP.ink} strokeWidth={4} />
      {/* 頭 (まんじゅう型) */}
      <ellipse cx={0} cy={-218} rx={60} ry={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* コック帽 (トック) */}
      <g>
        <rect x={-38} y={-330} width={76} height={70} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-26} cy={-330} r={19} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={0} cy={-340} r={21} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={26} cy={-330} r={19} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-42} y={-272} width={84} height={14} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* 目 */}
      {blink ? (
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
      {/* 口ひげ */}
      {mustache && (
        <path d={`M -26 ${eyeY + 30} Q -13 ${eyeY + 20} 0 ${eyeY + 28} Q 13 ${eyeY + 20} 26 ${eyeY + 30} Q 13 ${eyeY + 38} 0 ${eyeY + 32} Q -13 ${eyeY + 38} -26 ${eyeY + 30} Z`} fill={KRP.ink} />
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
        {!mustache && (face === "surprised" ? (
          <ellipse cx={0} cy={eyeY + 38} rx={9} ry={12} fill={KRP.ink} />
        ) : face === "smile" ? (
          <path d={`M -13 ${eyeY + 34} Q 0 ${eyeY + 47} 13 ${eyeY + 34}`} />
        ) : face === "worried" ? (
          <path d={`M -11 ${eyeY + 40} Q 0 ${eyeY + 32} 11 ${eyeY + 40}`} />
        ) : (
          <line x1={-9} y1={eyeY + 38} x2={9} y2={eyeY + 38} />
        ))}
      </g>
    </g>
  );
};

// ===== 新キャラ: 両替ブースの女性係員 (ニッケル嬢) =====
const ClerkWoman: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: Ch4Face; gaze?: [number, number]; hideArm?: "left" | "right";
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "smile", gaze = [0, 0], hideArm }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  const cloth = "#A8687E", clothDark = "#8E5569";
  const hair = "#5A4636";
  const eyeY = -222;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* ロングスカート */}
      <path d="M -44 -64 L 44 -64 L 56 -2 L -56 -2 Z" fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={-20} cy={-2} rx={18} ry={8} fill={KRP.ink} />
      <ellipse cx={20} cy={-2} rx={18} ry={8} fill={KRP.ink} />
      {hideArm !== "left" && (
        <rect x={-78} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {hideArm !== "right" && (
        <rect x={56} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {/* ブラウス */}
      <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      {/* 白い襟 */}
      <path d="M -20 -160 L 0 -140 L 20 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-128} r={5} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
      {/* 頭 (たまご型) */}
      <ellipse cx={0} cy={-222} rx={56} ry={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 髪 (前分け+おだんご) */}
      <path d="M -56 -234 Q -58 -288 0 -290 Q 58 -288 56 -234 Q 36 -262 0 -264 Q -36 -262 -56 -234 Z"
        fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={0} cy={-292} r={22} fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -56 -234 Q -62 -214 -56 -196 L -46 -224 Z" fill={hair} />
      <path d="M 56 -234 Q 62 -214 56 -196 L 46 -224 Z" fill={hair} />
      {/* 目 (まつげつき) */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-30} y1={eyeY} x2={-12} y2={eyeY} />
          <line x1={12} y1={eyeY} x2={30} y2={eyeY} />
        </g>
      ) : (
        <g>
          <circle cx={-20 + gx} cy={eyeY + gy} r={6} fill={KRP.ink} />
          <circle cx={20 + gx} cy={eyeY + gy} r={6} fill={KRP.ink} />
          <g stroke={KRP.ink} strokeWidth={3} strokeLinecap="round">
            <line x1={-30} y1={eyeY - 8} x2={-36} y2={eyeY - 12} />
            <line x1={30} y1={eyeY - 8} x2={36} y2={eyeY - 12} />
          </g>
        </g>
      )}
      {/* 眉・口 */}
      <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" fill="none">
        <line x1={-30} y1={eyeY - 22} x2={-12} y2={eyeY - 24} />
        <line x1={12} y1={eyeY - 24} x2={30} y2={eyeY - 22} />
        {face === "smile" ? (
          <path d={`M -12 ${eyeY + 32} Q 0 ${eyeY + 44} 12 ${eyeY + 32}`} />
        ) : face === "surprised" ? (
          <ellipse cx={0} cy={eyeY + 36} rx={8} ry={11} fill={KRP.ink} />
        ) : (
          <line x1={-9} y1={eyeY + 36} x2={9} y2={eyeY + 36} />
        )}
      </g>
    </g>
  );
};

// ===== 新キャラ: 仕事帰りの客 (ハンチング帽の労働者) =====
const WorkerMan: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: Ch4Face; gaze?: [number, number]; hideArm?: "left" | "right"; chew?: number;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0], hideArm, chew = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  const cloth = "#5E7291", clothDark = "#4C5D78";
  const eyeY = -212;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <rect x={-30} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={6} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      <ellipse cx={18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      {hideArm !== "left" && (
        <rect x={-78} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {hideArm !== "right" && (
        <rect x={56} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      {/* 作業ベスト風の前あき */}
      <line x1={0} y1={-160} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      {[-120, -96].map((by) => <circle key={by} cx={0} cy={by} r={4} fill={KRP.cream} stroke={KRP.ink} strokeWidth={2.5} />)}
      {/* 頭 (よこ長まんじゅう) */}
      <ellipse cx={0} cy={-212} rx={62} ry={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* ほっぺ (もぐもぐ用) */}
      {chew > 0.05 && (
        <circle cx={-34} cy={eyeY + 30} r={14 + chew * 7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {/* ハンチング帽 */}
      <g>
        <path d="M -60 -230 Q 0 -284 60 -230 L 62 -218 Q 0 -242 -62 -218 Z" fill="#6E6256" stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M -34 -226 Q -70 -230 -82 -214 L -58 -206 Z" fill="#5C5248" stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={eyeY} x2={-12} y2={eyeY} />
          <line x1={12} y1={eyeY} x2={32} y2={eyeY} />
        </g>
      ) : (
        <g>
          <circle cx={-22 + gx} cy={eyeY + gy} r={6.5} fill={KRP.ink} />
          <circle cx={22 + gx} cy={eyeY + gy} r={6.5} fill={KRP.ink} />
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
        {chew > 0.05 ? (
          <ellipse cx={0} cy={eyeY + 38} rx={7} ry={5 + chew * 6} fill={KRP.ink} />
        ) : face === "surprised" ? (
          <ellipse cx={0} cy={eyeY + 38} rx={9} ry={12} fill={KRP.ink} />
        ) : face === "smile" ? (
          <path d={`M -13 ${eyeY + 34} Q 0 ${eyeY + 47} 13 ${eyeY + 34}`} />
        ) : (
          <line x1={-9} y1={eyeY + 38} x2={9} y2={eyeY + 38} />
        )}
      </g>
    </g>
  );
};

// ===== 71. 第4章扉 (GlobeHop→フィラデルフィア。NYから短い弧) =====
const PHILLY = { lon: -75.16, lat: 39.95 };
const NEWYORK = { lon: -74, lat: 40.7 };
const SceneCh4Door: React.FC<{ f: number }> = ({ f }) => {
  const cx = 710, cy = 470, r = 330;
  const spinT = easeOut(seg(f, 0, 55));
  const lon0 = PHILLY.lon + (1 - spinT) * 420;
  const stopped = f >= 55;
  const tp = globePoint(cx, cy, r, PHILLY.lon, PHILLY.lat, lon0);
  const fp = globePoint(cx, cy, r, NEWYORK.lon, NEWYORK.lat, lon0);
  const arcT = seg(f, 58, 86);
  const pinT = seg(f, 86, 100);
  const flagT = pop(seg(f, 102, 116));
  const stampOn = f >= 118;
  const titleT = easeOut(seg(f, 112, 130));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={135} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
          {stopped && <DashArc x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} t={arcT} lift={90} />}
          {stopped && <MapPin x={tp.x} y={tp.y} t={pinT} />}
        </g>
      </svg>
      {flagT > 0.01 && (
        <svg width={W} height={H} style={abs}>
          <WobbleDefs seed={136} />
          <g filter="url(#wobbleSoft)" transform={`translate(1430 330) scale(${flagT}) translate(-1430 -330)`}>
            <FlagCard kind="usa" x={1430} y={330} s={1.35} />
          </g>
        </svg>
      )}
      {stampOn && <Stamp x={1150} y={470} text="1902年 フィラデルフィア" size={40} />}
      <div style={{
        position: "absolute", left: 1130, top: 620, width: 760,
        opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
      }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: KRP.grayDark, letterSpacing: 6 }}>
          第4章
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 60, color: KRP.ink, lineHeight: 1.4,
          borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
        }}>
          レストランまるごと自販機
        </div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 72. 街並み+「AUTOMAT」看板 (電飾が順に点く) =====
const SceneAutomatSign: React.FC<{ f: number }> = ({ f }) => {
  const letters = "AUTOMAT".split("");
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={137} />
        <g filter="url(#wobbleSoft)">
          {/* 夕方の街並み (うしろのビル) */}
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <g fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5}>
            <rect x={60} y={420} width={300} height={460} />
            <rect x={1560} y={380} width={300} height={500} />
          </g>
          <g fill={KRP.cream} stroke={KRP.ink} strokeWidth={3}>
            {[0, 1, 2].map((r) =>
              [0, 1].map((c) => (
                <rect key={`l${r}${c}`} x={110 + c * 110} y={470 + r * 120} width={70} height={74} />
              )),
            )}
            {[0, 1, 2].map((r) =>
              [0, 1].map((c) => (
                <rect key={`r${r}${c}`} x={1610 + c * 110} y={430 + r * 120} width={70} height={74} />
              )),
            )}
          </g>
          {/* 店の建物 */}
          <rect x={400} y={560} width={1120} height={320} fill="#D8CBB4" stroke={KRP.ink} strokeWidth={6} />
          <g fill="#F7E9B8" stroke={KRP.ink} strokeWidth={5}>
            <rect x={450} y={620} width={280} height={220} />
            <rect x={820} y={620} width={280} height={220} />
            <rect x={1190} y={620} width={280} height={220} />
          </g>
          <line x1={400} y1={600} x2={1520} y2={600} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 看板 */}
          <rect x={360} y={240} width={1200} height={250} rx={18} fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} />
          <rect x={382} y={262} width={1156} height={206} rx={12} fill="none" stroke={KRP.cream} strokeWidth={4} opacity={0.6} />
          {/* 文字 (順に点灯) */}
          {letters.map((ch, i) => {
            const on = f >= 16 + i * 11;
            const shimmer = on ? 0.86 + 0.14 * Math.abs(Math.sin((f + i * 9) / 11)) : 1;
            return (
              <g key={i}>
                {on && <circle cx={960 + (i - 3) * 155} cy={368} r={74} fill={KRP.yellow} opacity={0.12} />}
                <text x={960 + (i - 3) * 155} y={412} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                  fontSize={128} fill={on ? KRP.yellow : KRP.grayDark} opacity={on ? shimmer : 0.55}>
                  {ch}
                </text>
              </g>
            );
          })}
          {/* ふちの電球 */}
          {Array.from({ length: 15 }, (_, i) => {
            const bx = 400 + i * 80;
            const allOn = f >= 16 + 7 * 11;
            const tw = allOn && ((Math.floor(f / 9) + i) % 2 === 0);
            return (
              <g key={i}>
                <circle cx={bx} cy={252} r={9} fill={tw ? KRP.yellow : KRP.cream} stroke={KRP.ink} strokeWidth={3}
                  opacity={tw ? 1 : 0.55} />
                <circle cx={bx} cy={478} r={9} fill={tw ? KRP.cream : KRP.yellow} stroke={KRP.ink} strokeWidth={3}
                  opacity={tw ? 0.55 : 1} />
              </g>
            );
          })}
          {/* 看板の支え */}
          <line x1={560} y1={490} x2={560} y2={560} stroke={KRP.ink} strokeWidth={10} />
          <line x1={1360} y1={490} x2={1360} y2={560} stroke={KRP.ink} strokeWidth={10} />
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 73. 店の外観 (ガラス越しの光。扉が開いて光が漏れる) =====
const SceneAutomatFront: React.FC<{ f: number }> = ({ f }) => {
  const openT = easeOut(seg(f, 30, 75));
  const glow = 0.5 + 0.1 * Math.sin(f / 11);
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={138} />
        <g filter="url(#wobbleSoft)">
          {/* 歩道 */}
          <rect x={0} y={840} width={W} height={240} fill={KRP.floor} />
          <line x1={0} y1={840} x2={W} y2={840} stroke={KRP.ink} strokeWidth={5} />
          {/* 店の正面 */}
          <rect x={260} y={170} width={1400} height={670} fill="#D8CBB4" stroke={KRP.ink} strokeWidth={7} />
          {/* 看板 */}
          <rect x={430} y={200} width={1060} height={110} rx={12} fill={KRP.ink} />
          <text x={960} y={282} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76}
            fill={KRP.yellow} letterSpacing={18}>AUTOMAT</text>
          {/* 大きなガラス窓 (あたたかい光) */}
          <g>
            <rect x={330} y={360} width={420} height={420} fill="#F7E9B8" opacity={glow + 0.35} stroke={KRP.ink} strokeWidth={6} />
            <rect x={1170} y={360} width={420} height={420} fill="#F7E9B8" opacity={glow + 0.35} stroke={KRP.ink} strokeWidth={6} />
            {/* 窓の桟 */}
            <line x1={540} y1={360} x2={540} y2={780} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
            <line x1={1380} y1={360} x2={1380} y2={780} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
            <line x1={330} y1={570} x2={750} y2={570} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
            <line x1={1170} y1={570} x2={1590} y2={570} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
            {/* 窓の中の小窓の気配 */}
            <g fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} opacity={0.55}>
              {[0, 1].map((r) => [0, 1, 2].map((c) => (
                <rect key={`a${r}${c}`} x={370 + c * 120} y={420 + r * 160} width={90} height={100} rx={6} />
              )))}
              {[0, 1].map((r) => [0, 1, 2].map((c) => (
                <rect key={`b${r}${c}`} x={1210 + c * 120} y={420 + r * 160} width={90} height={100} rx={6} />
              )))}
            </g>
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 入口 (両開き扉が開く) */}
          <rect x={820} y={380} width={280} height={460} fill="#8C7A5E" stroke={KRP.ink} strokeWidth={6} />
          <rect x={836} y={396} width={248} height={444} fill="#F5E6B8" opacity={0.3 + openT * 0.65} />
          {/* 左右の扉 (外へスライドして開く) */}
          <g>
            <rect x={836 - openT * 96} y={396} width={124} height={444} fill="#A9814F" stroke={KRP.ink} strokeWidth={5} />
            <rect x={856 - openT * 96} y={430} width={84} height={240} fill="#F7E9B8" opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={946 - openT * 96} cy={640} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
          <g>
            <rect x={960 + openT * 96} y={396} width={124} height={444} fill="#A9814F" stroke={KRP.ink} strokeWidth={5} />
            <rect x={980 + openT * 96} y={430} width={84} height={240} fill="#F7E9B8" opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={974 + openT * 96} cy={640} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* 歩道に漏れる光 */}
          <path d={`M 870 840 L 1050 840 L ${1050 + 180 * openT} 1020 L ${870 - 180 * openT} 1020 Z`}
            fill="#F7E9B8" opacity={0.5 * openT} />
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 74. 壁一面の小窓 (カメラが横になめる) =====
const SceneWallWindows: React.FC<{ f: number }> = ({ f }) => {
  const tx = -480 * seg(f, 8, 142);
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={139} />
        <g transform={`translate(${tx} 0)`}>
          <g filter="url(#wobbleSoft)">
            {/* 床と幅木 */}
            <rect x={-100} y={900} width={2700} height={180} fill={KRP.floor} />
            <line x1={-100} y1={900} x2={2600} y2={900} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-100} y={150} width={2700} height={60} fill="#E7DFCE" stroke={KRP.ink} strokeWidth={5} />
          </g>
          <g filter="url(#wobble)">
            <WindowWall x0={130} y0={330} cols={14} rows={4} pitchX={172} pitchY={152} s={0.92} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="壁一面に小さなガラス窓" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 75. 小窓3つに寄り (パイ/豆/コーヒー。湯気ゆらゆら) =====
const SceneWindowFoods: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 150;
  const items: Array<{ x: number; food: FoodKind; label: string }> = [
    { x: 400, food: "pie", label: "パイ" },
    { x: 960, food: "beans", label: "豆料理" },
    { x: 1520, food: "coffee", label: "コーヒー" },
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={140} />
        <g filter="url(#wobbleSoft)">
          <rect x={60} y={150} width={1800} height={760} rx={14} fill="#E7DFCE" stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          {items.map((it, i) => (
            <g key={i}>
              <Cell x={it.x} y={530} s={2.6} food={it.food} />
              {/* 湯気 (ガラスの中でゆらゆら) */}
              {it.food !== "pie" && <Steam x={it.x} y={480} f={fc + i * 17} s={1.3} n={2} />}
              {it.food === "pie" && <Steam x={it.x} y={486} f={fc + 30} s={1.1} n={2} />}
            </g>
          ))}
        </g>
      </svg>
      {items.map((it, i) => (
        <LabelPill key={i} x={it.x} y={790} centerX text={it.label} size={32} />
      ))}
      <LabelPill x={960} y={170} centerX text="窓の向こうにできたての一皿" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 76. 1つの窓の正面 (コイン→つまみ→窓パカッ→パイを取る。ループ) =====
const SceneNickelKnob: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 130;
  const coinT = seg(fc, 4, 24);        // コインがスロットへ
  const knobT = easeOut(seg(fc, 26, 48)); // つまみ回転
  const openT = easeOut(seg(fc, 50, 68)); // 窓が開く
  const grabT = seg(fc, 72, 102);      // 手が伸びてパイを取る
  const closeT = seg(fc, 108, 124);    // 窓が閉じる
  const open = clamp01(openT - closeT);
  // コイン位置 (右上からスロットへ)
  const coinX = lerp(1310, 1180, easeOut(coinT));
  const coinY = lerp(300, 420, coinT);
  // 手 (右下から窓の中へ→戻る)
  const reach = grabT < 0.5 ? easeOut(grabT * 2) : 1 - easeOut((grabT - 0.5) * 2);
  const handX = lerp(1700, 860, reach);
  const handY = lerp(950, 560, reach);
  const pieTaken = fc >= 87 && fc < 126; // 取った後は空
  const piePinned = grabT > 0.25 && grabT < 1 && fc >= 87; // 手と一緒に動く
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={141} />
        <g filter="url(#wobbleSoft)">
          <rect x={160} y={140} width={1300} height={800} rx={14} fill="#E7DFCE" stroke={KRP.ink} strokeWidth={7} />
          {/* となりの窓の気配 */}
          <g opacity={0.5}>
            <Cell x={330} y={360} s={1.1} food="beans" />
            <Cell x={330} y={700} s={1.1} food="coffee" />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 主役の窓 */}
          <Cell x={860} y={540} s={3.1} food="pie" open={open} foodOpacity={pieTaken ? 0 : 1} />
          {/* 右側の操作盤 */}
          <rect x={1130} y={360} width={180} height={380} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
          {/* コイン投入口 */}
          <rect x={1196} y={408} width={48} height={14} rx={7} fill={KRP.ink} />
          <text x={1220} y={462} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30}
            fill={KRP.ink} opacity={0.75}>5¢</text>
          {/* つまみ (回る) */}
          <g transform={`rotate(${knobT * 120} 1220 600)`}>
            <circle cx={1220} cy={600} r={52} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
            <rect x={1212} y={552} width={16} height={52} rx={8} fill={KRP.ink} />
          </g>
          <circle cx={1220} cy={600} r={8} fill={KRP.ink} />
          {/* 回す向きの矢印 */}
          {knobT > 0 && knobT < 1 && (
            <path d="M 1288 556 A 80 80 0 0 1 1300 636" fill="none" stroke={KRP.red} strokeWidth={7}
              strokeLinecap="round" markerEnd="none" />
          )}
          {/* コイン */}
          {coinT > 0 && coinT < 1 && (
            <Coin cx={coinX} cy={coinY} r={34} fill={KRP.silver} text="5" rotate={coinT * 160} />
          )}
          {/* 取り出す手 (別描きの腕1本) */}
          {grabT > 0 && grabT < 1 && (
            <g>
              <Arm x1={1760} y1={1010} x2={handX} y2={handY} cloth="#5E7291" s={1.25} />
              {piePinned && (
                <g transform={`translate(${handX} ${handY - 34})`}>
                  <FoodPie s={0.95} />
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="5セントを入れて、つまみをクルッ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 77. 引きで壁全体+赤ハンコ「全部自販機」 =====
const SceneWholeVending: React.FC<{ f: number }> = ({ f }) => {
  const stampOn = f >= 46;
  const burst = seg(f, 46, 66);
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={142} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          <WindowWall x0={330} y0={300} cols={8} rows={4} pitchX={180} pitchY={152} s={0.95} />
          {/* ハンコの衝撃線 */}
          {stampOn && burst < 1 && (
            <g stroke={KRP.red} strokeWidth={8} strokeLinecap="round" opacity={1 - burst}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                const rad = (a * Math.PI) / 180;
                const r1 = 260 + burst * 90, r2 = r1 + 60;
                return (
                  <line key={a} x1={960 + Math.cos(rad) * r1} y1={540 + Math.sin(rad) * r1 * 0.62}
                    x2={960 + Math.cos(rad) * r2} y2={540 + Math.sin(rad) * r2 * 0.62} />
                );
              })}
            </g>
          )}
        </g>
      </svg>
      {stampOn && <Stamp x={620} y={430} text="全部自販機" size={92} />}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 78. ベルリン→米国の小さい弧 (アイデアの輸入) =====
const SceneBerlinIdea: React.FC<{ f: number }> = ({ f }) => {
  const cx = 700, cy = 540, r = 300;
  const lon0 = -31; // ベルリンと米東海岸が両方見える向きで固定
  const bp = globePoint(cx, cy, r, 13.4, 52.5, lon0);
  const up = globePoint(cx, cy, r, PHILLY.lon, PHILLY.lat, lon0);
  const arcT = seg(f, 18, 62);
  const pinT = seg(f, 62, 78);
  const flagT = pop(seg(f, 82, 96));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={143} />
        <g filter="url(#wobbleSoft)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
          <DashArc x1={bp.x} y1={bp.y} x2={up.x} y2={up.y} t={arcT} lift={150} />
          <MapPin x={up.x} y={up.y} t={pinT} />
          {/* ベルリン側の出発点 */}
          <circle cx={bp.x} cy={bp.y} r={13} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {flagT > 0.01 && (
          <g transform={`translate(1430 330) scale(${flagT}) translate(-1430 -330)`}>
            <FlagCard kind="usa" x={1430} y={330} s={1.2} />
          </g>
        )}
      </svg>
      <LabelPill x={bp.x + 30} y={bp.y - 110} text="ベルリン" size={30} />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 79. 空っぽの小窓に「？」ぷかぷか =====
const SceneEmptyQ: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 150;
  const bobQ = Math.sin(fc / 14) * 16;
  const tilt = Math.sin(fc / 23) * 8;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={144} />
        <g filter="url(#wobbleSoft)">
          <rect x={260} y={160} width={1400} height={760} rx={14} fill="#E7DFCE" stroke={KRP.ink} strokeWidth={7} />
          <g opacity={0.5}>
            <Cell x={430} y={380} s={1.1} food="pie" />
            <Cell x={430} y={700} s={1.1} food="beans" />
            <Cell x={1490} y={380} s={1.1} food="coffee" />
            <Cell x={1490} y={700} s={1.1} food="pie" />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 空の窓 (開いたまま) */}
          <Cell x={960} y={600} s={3.0} food="empty" open={1} />
          {/* 大きな？ (v3: テロップ(y170-230)に食い込まないよう下げる) */}
          <g transform={`translate(960 ${400 + bobQ}) rotate(${tilt})`}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190}
              fill={KRP.blueDeep} stroke={KRP.white} strokeWidth={10} paintOrder="stroke">？</text>
          </g>
          {/* 小さな？×2 (v3: 同上、下げる) */}
          <text x={700} y={340 + Math.sin(fc / 11 + 2) * 12} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={76} fill={KRP.grayDark} opacity={0.8}>？</text>
          <text x={1240} y={355 + Math.sin(fc / 12 + 4) * 12} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={96} fill={KRP.grayDark} opacity={0.8}>？</text>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="空っぽの窓には、だれが補充を？" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 80. 種明かし: カメラが壁の裏へ横移動→巨大な厨房 (この章の見せ場) =====
const SceneBehindWall: React.FC<{ f: number }> = ({ f }) => {
  const tx = -900 * easeOut(seg(f, 25, 95));
  const revealed = f >= 78;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={145} />
        <g transform={`translate(${tx} 0)`}>
          <g filter="url(#wobbleSoft)">
            {/* 客席側の床 */}
            <rect x={-100} y={880} width={2020} height={200} fill={KRP.floor} />
            <line x1={-100} y1={880} x2={1880} y2={880} stroke={KRP.ink} strokeWidth={5} />
            {/* 厨房側の床と背景 */}
            <rect x={1960} y={120} width={960} height={960} fill="#EFE3C8" />
            <rect x={1960} y={880} width={960} height={200} fill="#D9C9A4" />
            <line x1={1960} y1={880} x2={2920} y2={880} stroke={KRP.ink} strokeWidth={5} />
            {/* 厨房の棚 (パイがずらり) */}
            <rect x={2560} y={240} width={300} height={420} fill="#C9B690" stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2].map((r) => (
              <g key={r}>
                <line x1={2560} y1={360 + r * 110} x2={2860} y2={360 + r * 110} stroke={KRP.ink} strokeWidth={4} />
                {[0, 1, 2].map((c) => (
                  <g key={c} transform={`translate(${2615 + c * 95} ${340 + r * 110})`}>
                    <FoodPie s={0.62} />
                  </g>
                ))}
              </g>
            ))}
          </g>
          <g filter="url(#wobble)">
            {/* 客席側: 小窓の壁 */}
            <WindowWall x0={240} y0={300} cols={9} rows={4} pitchX={180} pitchY={152} s={0.95} />
            {/* 客 (ふしぎそうに見ている) */}
            <WorkerMan x={1180} y={880} s={1.1} f={f} face="surprised" gaze={[6, -3]} />
            {/* 壁の断面 (しきり) */}
            <rect x={1880} y={120} width={80} height={960} fill="#B8A888" stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={1884} y1={160 + i * 118} x2={1956} y2={200 + i * 118} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
            ))}
            {/* 壁の裏側のハッチ (補充口) */}
            {[0, 1, 2, 3].map((r) => (
              <rect key={r} x={1972} y={262 + r * 152} width={74} height={96} rx={6}
                fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
            ))}
            {/* 厨房: 大なべ+コック */}
            <ellipse cx={2270} cy={790} rx={150} ry={34} fill="#9A938A" stroke={KRP.ink} strokeWidth={5} />
            <path d="M 2130 660 L 2410 660 L 2390 790 L 2150 790 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
            <Steam x={2270} y={640} f={f} s={1.6} n={3} />
            <Cook x={2470} y={900} s={1.05} f={f} phase={1} face="smile" gaze={[-6, -2]} mustache />
            <Cook x={2130} y={905} s={1.0} f={f} phase={3} gaze={[5, -3]} />
          </g>
        </g>
      </svg>
      {revealed ? (
        /* v3: y=915は字幕帯(1行時y≥931)と衝突していた → テロップ位置(上部)に移動 */
        <div style={{
          position: "absolute", left: 960, top: 160,
          transform: `translateX(-50%) scale(${pop(seg(f, 78, 92))})`,
          background: KRP.white, border: `4px solid ${KRP.red}`, borderRadius: 10,
          color: KRP.red, fontFamily: FONT, fontWeight: 900, fontSize: 42,
          padding: "6px 26px", whiteSpace: "nowrap",
          boxShadow: "3px 4px 0 rgba(59, 51, 44, 0.25)",
        }}>
          壁の裏は、巨大な厨房！
        </div>
      ) : (
        <LabelPill x={960} y={170} centerX text="壁のうしろは…" />
      )}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 81. 厨房: コックが作り、係がせっせと補充 (流れ作業ループ) =====
const SceneKitchenRefill: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 90;
  // 補充係の腕: トレイ(左)→ハッチ(右)を往復
  const sw = fc < 45 ? easeOut(seg(fc, 8, 40)) : 1 - easeOut(seg(fc, 53, 85));
  const hx = lerp(1180, 1545, sw);
  const hy = lerp(700, 500, sw);
  const hatchOpen = clamp01(seg(fc, 30, 42) - seg(fc, 60, 72));
  // コックのかき混ぜ (小さな円運動)
  const stirX = 560 + Math.cos(fc / 7) * 36;
  const stirY = 600 + Math.sin(fc / 7) * 14;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={146} />
        <g filter="url(#wobbleSoft)">
          {/* 厨房の壁と床 */}
          <rect x={0} y={0} width={W} height={880} fill="#EFE3C8" />
          <rect x={0} y={880} width={W} height={200} fill="#D9C9A4" />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {/* 右端: 小窓の壁の裏側 */}
          <rect x={1660} y={120} width={260} height={760} fill="#B8A888" stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x={1700} y={200 + r * 170} width={110} height={110} rx={8}
                fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
              {/* ハッチの中身 (上から2段目は補充中) */}
              {r !== 1 && (
                <g transform={`translate(${1755} ${268 + r * 170})`}>
                  <FoodPie s={0.6} />
                </g>
              )}
              {r === 1 && hatchOpen < 0.5 && fc >= 45 && (
                <g transform={`translate(${1755} ${268 + r * 170})`}>
                  <FoodPie s={0.6} />
                </g>
              )}
            </g>
          ))}
          {/* 補充中のハッチのふた */}
          <rect x={1700} y={370 - hatchOpen * 90} width={110} height={110 * (1 - hatchOpen)} rx={8}
            fill="#CBB27A" stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        </g>
        <g filter="url(#wobble)">
          {/* 大なべとコック */}
          <ellipse cx={560} cy={790} rx={170} ry={36} fill="#9A938A" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 400 640 L 720 640 L 696 790 L 424 790 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={560} cy={640} rx={160} ry={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
          <Steam x={560} y={600} f={f} s={1.7} n={3} />
          <Cook x={320} y={900} s={1.1} f={f} phase={0} face="smile" gaze={[6, -2]} mustache hideArm="right" />
          {/* かき混ぜ腕+おたま */}
          <Arm x1={320 + 67 * 1.1} y1={900 - 148 * 1.1 + Math.sin(f / 13) * 3} x2={stirX} y2={stirY} cloth="#F0EBDF" s={1.1} />
          <line x1={stirX} y1={stirY} x2={stirX + 26} y2={stirY + 56} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          {/* 2人目のコック (パイを運ぶ) */}
          <Cook x={900} y={910} s={1.05} f={f} phase={2} gaze={[5, -2]} hideArm="right" />
          <Arm x1={900 + 67 * 1.05} y1={910 - 148 * 1.05 + Math.sin((f + 34) / 13) * 3} x2={1060} y2={680} cloth="#F0EBDF" s={1.05} />
          <g transform="translate(1075 660)">
            <FoodPie s={0.85} />
          </g>
          {/* 補充係 (窓の裏へ次々セット) */}
          <WorkerMan x={1390} y={910} s={1.1} f={f} phase={4} face="smile" gaze={[6, -3]} hideArm="right" />
          <Arm x1={1390 + 67 * 1.1} y1={910 - 148 * 1.1 + Math.sin((f + 68) / 13) * 3} x2={hx} y2={hy} cloth="#5E7291" s={1.1} />
          {/* 運んでいるパイ (ハッチ到着で消える) */}
          {sw < 0.96 && fc < 45 && (
            <g transform={`translate(${hx} ${hy - 30})`}>
              <FoodPie s={0.8} />
            </g>
          )}
          {/* 手元のトレイ */}
          <rect x={1080} y={726} width={220} height={16} rx={8} fill={KRP.copper} stroke={KRP.ink} strokeWidth={4} />
          <g transform="translate(1140 710)"><FoodPie s={0.6} /></g>
          <g transform="translate(1230 710)"><FoodPie s={0.6} /></g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="コックが作り、係がせっせと補充" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 82. 断面図: 表=無人/裏=大勢 (「無人」→「超・有人」に書き換わる) =====
const SceneSuperManned: React.FC<{ f: number }> = ({ f }) => {
  const swap = f >= 70;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={147} />
        <g filter="url(#wobbleSoft)">
          {/* 白いカード */}
          <rect x={240} y={180} width={1440} height={720} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {/* 左右の地面 */}
          <line x1={280} y1={840} x2={1640} y2={840} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* まんなかの壁 (断面) */}
          <rect x={920} y={260} width={80} height={580} fill="#B8A888" stroke={KRP.ink} strokeWidth={6} />
          {/* 壁の左面: 小窓の列 */}
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={856} y={300 + r * 130} width={64} height={86} rx={6}
              fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {/* 表側: 客1人 */}
          <WorkerMan x={560} y={840} s={1.0} f={f} gaze={[7, -2]} />
          {/* 裏側: 大勢 */}
          <Cook x={1130} y={840} s={0.82} f={f} phase={1} gaze={[-5, -2]} mustache />
          <Cook x={1290} y={845} s={0.82} f={f} phase={2} face="smile" gaze={[-5, -2]} />
          <ClerkWoman x={1440} y={840} s={0.82} f={f} phase={3} gaze={[-5, -2]} />
          <TownPerson x={1575} y={845} s={0.82} role="barkeep" f={f} phase={4} face="smile" gaze={[-6, -2]} />
          <Steam x={1210} y={520} f={f} s={1.0} n={2} />
        </g>
      </svg>
      {/* 左右の見出し */}
      <LabelPill x={560} y={250} centerX text="おもて" size={30} color={KRP.grayDark} />
      <LabelPill x={1340} y={250} centerX text="うら" size={30} color={KRP.grayDark} />
      {/* 「無人」→「超・有人」 (v3: y122のバーストが下のテロップ(y170)と重なっていた → 上下に整理) */}
      {!swap ? (
        <LabelPill x={960} y={88} centerX text="無人レストラン…？" size={42} />
      ) : (
        <div style={{
          position: "absolute", left: 960, top: 76,
          transform: `translateX(-50%) scale(${pop(seg(f, 70, 84))})`,
          background: KRP.white, border: `5px solid ${KRP.red}`, borderRadius: 10,
          color: KRP.red, fontFamily: FONT, fontWeight: 900, fontSize: 48,
          padding: "6px 28px", whiteSpace: "nowrap",
          boxShadow: "3px 4px 0 rgba(59, 51, 44, 0.25)",
        }}>
          超・有人レストラン！
        </div>
      )}
      <LabelPill x={960} y={196} centerX text="無人に見えて、裏は大勢" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 83. 入口の両替ブース (お札→コインの山) =====
const SceneChangeBooth: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 90;
  const billT = seg(fc, 6, 32);   // お札を差し出す
  const sweepT = seg(fc, 38, 56); // 係がサッと
  const billX = lerp(850, 1050, easeOut(billT));
  const billY = lerp(650, 668, billT);
  const bob1 = Math.sin(f / 13) * 3;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={148} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {/* うしろの小窓の壁 (うっすら) */}
          <g opacity={0.4}>
            <WindowWall x0={240} y0={260} cols={4} rows={2} pitchX={170} pitchY={150} s={0.8} />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 両替ブース */}
          <rect x={1060} y={260} width={420} height={620} fill="#A9814F" stroke={KRP.ink} strokeWidth={7} />
          <path d="M 1030 260 L 1510 260 L 1480 200 L 1060 200 Z" fill="#8C6A3E" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1120} y={210} width={300} height={44} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
          <text x={1270} y={243} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32}
            fill={KRP.ink} letterSpacing={6}>両替 CHANGE</text>
          {/* 窓口 (中は少し暗い) */}
          <rect x={1110} y={330} width={320} height={330} rx={10} fill="#E3D4AE" stroke={KRP.ink} strokeWidth={6} />
          {/* 係員 (窓口の中に見えるよう、窓でクリップ) */}
          <clipPath id="ch4boothwin">
            <rect x={1116} y={336} width={308} height={320} rx={8} />
          </clipPath>
          <g clipPath="url(#ch4boothwin)">
            <ClerkWoman x={1270} y={760} s={1.05} f={f} face="smile" gaze={[-6, -1]} hideArm="left" />
          </g>
          {/* 係員の腕 (窓から出してコインを置く) */}
          <Arm x1={1270 - 67 * 1.05} y1={760 - 148 * 1.05 + bob1}
            x2={lerp(1190, 1140, sweepT)} y2={650} cloth="#A8687E" s={1.05} />
          {/* 窓口の格子 (顔にかからない上側だけ) */}
          {[1170, 1240, 1310, 1380].map((gx) => (
            <line key={gx} x1={gx} y1={336} x2={gx} y2={448} stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
          ))}
          {/* カウンターの台 */}
          <rect x={1080} y={660} width={380} height={34} rx={8} fill="#E7DFCE" stroke={KRP.ink} strokeWidth={5} />
          {/* コインの山 */}
          <g>
            {[[1150, 688], [1190, 692], [1230, 688], [1170, 668], [1210, 670], [1190, 650]].map(([cx2, cy2], i) => (
              <ellipse key={i} cx={cx2} cy={cy2} rx={24} ry={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
            ))}
          </g>
          {/* 飛んでいるコイン (係の手→山) */}
          {[0, 1, 2].map((i) => {
            const p = ((fc * 1.6 + i * 26) % 78) / 78;
            if (p > 0.6) return null;
            const t = p / 0.6;
            const cxp = lerp(1160, 1190, t);
            const cyp = lerp(645, 660, t) - Math.sin(t * Math.PI) * 60;
            return <Coin key={i} cx={cxp} cy={cyp} r={16} fill={KRP.silver} rotate={t * 240} />;
          })}
          {/* 客 (お札を差し出す) */}
          <WorkerMan x={700} y={900} s={1.15} f={f} gaze={[7, -2]} hideArm="right" />
          <Arm x1={700 + 67 * 1.15} y1={900 - 148 * 1.15 + bob1} x2={billX} y2={billY} cloth="#5E7291" s={1.15} />
          {/* お札 */}
          {billT < 1 && (
            <g transform={`translate(${billX} ${billY - 30}) rotate(-8)`}>
              <rect x={-34} y={-18} width={68} height={36} rx={4} fill="#9CBB7A" stroke={KRP.ink} strokeWidth={3.5} />
              <circle cx={0} cy={0} r={10} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.6} />
              <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={17} fill={KRP.ink}>$1</text>
            </g>
          )}
        </g>
      </svg>
      {/* v3: 中央だとブースの「両替 CHANGE」看板(x1120〜)に被る → 左の空きへ */}
      <LabelPill x={520} y={170} centerX text="まずは入口の両替ブースへ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 84. ニッケル嬢の手元 (残像の腕+コインの弧) =====
const SceneNickelThrow: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 48;
  const s = 1.9;
  const px = 580, py = 1130; // 係員の足元 (画面下にはみ出して上半身アップ)
  const bob = Math.sin(f / 13) * 3;
  const sx = px + 67 * s, sy = py - 148 * s + bob;
  // 本物の腕 (すばやく往復)
  const a = (-26 + Math.sin(f / 2.6) * 34) * (Math.PI / 180);
  const len = 220;
  const hx = sx + Math.cos(a) * len, hy = sy + Math.sin(a) * len;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={149} />
        <g filter="url(#wobbleSoft)">
          {/* うしろの壁 */}
          <rect x={0} y={0} width={W} height={840} fill="#EFE3C8" />
          {/* 大理石カウンター */}
          <rect x={0} y={840} width={W} height={240} fill="#E7DFCE" stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={840} x2={W} y2={840} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 120 920 Q 400 900 680 924" fill="none" stroke={KRP.grayDark} strokeWidth={3} opacity={0.4} />
          <path d="M 1100 960 Q 1420 940 1760 966" fill="none" stroke={KRP.grayDark} strokeWidth={3} opacity={0.4} />
        </g>
        <g filter="url(#wobble)">
          {/* 係員 (上半身アップ) */}
          <ClerkWoman x={px} y={py} s={s} f={f} face="smile" gaze={[6, 2]} hideArm="right" />
          {/* 残像の腕 (扇形に3本) */}
          {[-30, 0, 30].map((deg, i) => {
            const ga = (-26 + deg) * (Math.PI / 180);
            return (
              <g key={i} opacity={0.18}>
                <Arm x1={sx} y1={sy} x2={sx + Math.cos(ga) * len} y2={sy + Math.sin(ga) * len} cloth="#A8687E" s={s * 0.78} />
              </g>
            );
          })}
          {/* 本物の腕 */}
          <Arm x1={sx} y1={sy} x2={hx} y2={hy} cloth="#A8687E" s={s * 0.78} />
          {/* スピード線 */}
          <g stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
            <path d={`M ${sx + 150} ${sy - 150} A 210 210 0 0 1 ${sx + 230} ${sy + 60}`} fill="none" />
            <path d={`M ${sx + 190} ${sy - 190} A 260 260 0 0 1 ${sx + 290} ${sy + 70}`} fill="none" opacity={0.5} />
          </g>
          {/* コインの弧 (手元→右の受け皿) */}
          {[0, 1, 2, 3, 4].map((i) => {
            const p = ((fc + i * 10) % 48) / 48;
            const t = easeOut(p);
            const cxp = lerp(hx, 1430, t);
            const cyp = lerp(hy, 880, t) - Math.sin(t * Math.PI) * 180;
            return <Coin key={i} cx={cxp} cy={cyp} r={20} fill={KRP.silver} rotate={p * 540} />;
          })}
          {/* キラッ */}
          {[0, 1].map((i) => {
            const kx = 1000 + i * 260, ky = 560 + i * 60;
            const tw = 0.4 + 0.6 * Math.abs(Math.sin((f + i * 17) / 7));
            return (
              <g key={i} stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" opacity={tw}>
                <line x1={kx - 16} y1={ky} x2={kx + 16} y2={ky} />
                <line x1={kx} y1={ky - 16} x2={kx} y2={ky + 16} />
              </g>
            );
          })}
          {/* 受け皿とコインの山 */}
          <path d="M 1310 900 Q 1430 950 1560 900 L 1540 862 L 1330 862 Z" fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
          {[[1390, 862], [1430, 858], [1470, 864], [1410, 844], [1452, 846]].map(([cx2, cy2], i) => (
            <ellipse key={i} cx={cx2} cy={cy2} rx={22} ry={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
          ))}
        </g>
      </svg>
      <LabelPill x={1240} y={300} text="あだ名は「ニッケル投げ」" size={38} />
      <LabelPill x={960} y={170} centerX text="早業すぎる両替係" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 85/87 共用: 1人席でパイを頬ばる (sepia で87のセピア演出) =====
const DinerAlone: React.FC<{ f: number; dim?: number; seed?: number }> = ({ f, dim = 0, seed = 150 }) => {
  const fc = f % 70;
  // 手: 皿→口を往復
  const c = (Math.sin(fc / 11 - 1.2) + 1) / 2;
  const bob = Math.sin((f + 5 * 17) / 13) * 3;
  const sx = 1420 - 67 * 1.2, sy = 940 - 148 * 1.2 + bob;
  const hx = lerp(1210, 1330, c), hy = lerp(640, 700, c);
  const chew = c > 0.7 ? (c - 0.7) / 0.3 : 0;
  return (
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobbleSoft)">
        {/* 壁と床 */}
        <rect x={0} y={0} width={W} height={820} fill="#EBE2CE" />
        <rect x={0} y={560} width={W} height={260} fill="#DCD2BA" stroke={KRP.ink} strokeWidth={4} />
        <rect x={0} y={820} width={W} height={260} fill={KRP.floor} />
        <line x1={0} y1={820} x2={W} y2={820} stroke={KRP.ink} strokeWidth={5} />
        {/* 窓 (やわらかい光) */}
        <rect x={300} y={180} width={520} height={440} rx={10} fill="#F7E9C8" stroke={KRP.ink} strokeWidth={6}
          opacity={1 - dim * 0.5} />
        <line x1={560} y1={180} x2={560} y2={620} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
        <line x1={300} y1={400} x2={820} y2={400} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
        {/* 窓の外のビル影 */}
        <g fill={KRP.gray} opacity={0.5 - dim * 0.2}>
          <rect x={340} y={260} width={80} height={140} />
          <rect x={450} y={230} width={70} height={170} />
          <rect x={640} y={250} width={90} height={150} />
        </g>
        {/* 光のさしこみ */}
        <path d="M 320 620 L 800 620 L 980 820 L 240 820 Z" fill="#F7E9C8" opacity={(0.3 - dim * 0.22)} />
      </g>
      <g filter="url(#wobble)">
        {/* 丸テーブル (1人席) */}
        <ellipse cx={1150} cy={660} rx={210} ry={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1134} y={680} width={32} height={210} fill="#8C7A5E" stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1150} cy={898} rx={90} ry={18} fill="#8C7A5E" stroke={KRP.ink} strokeWidth={5} />
        {/* 皿とパイ (残り) */}
        <ellipse cx={1085} cy={648} rx={62} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1055 644 Q 1055 622 1085 620 Q 1107 622 1111 638 L 1085 648 Z"
          fill={KRP.copper} stroke={KRP.ink} strokeWidth={3.5} />
        {/* コーヒー (手の通り道と重ならない左側へ) */}
        <g transform="translate(975 622)">
          <FoodCoffee s={1.0} />
        </g>
        <Steam x={975} y={592} f={f} s={1.0} n={2} />
        {/* 客 (もぐもぐ) */}
        <WorkerMan x={1420} y={940} s={1.2} f={f} phase={5} face="smile" gaze={[-6, -1]}
          hideArm="left" chew={chew} />
        {/* パイを持つ腕 */}
        <Arm x1={sx} y1={sy} x2={hx} y2={hy} cloth="#5E7291" s={1.2} />
        <g transform={`translate(${hx - 6} ${hy - 34}) rotate(-14)`}>
          <path d="M -26 16 L 0 -14 L 26 16 Z" fill={KRP.copper} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      </g>
    </svg>
  );
};

const ScenePieAlone: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
    <DinerAlone f={f} />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 86. 米国東海岸の地図に店アイコン増殖 (カウントアップ100+) =====
const SceneChain100: React.FC<{ f: number }> = ({ f }) => {
  const spots: Array<[number, number]> = [
    [1000, 280], [930, 360], [880, 440], [960, 330], [850, 520],
    [920, 400], [790, 560], [1010, 240], [870, 300], [760, 480],
    [700, 620], [820, 640], [900, 580], [740, 380],
  ];
  const n = Math.min(100, Math.floor(seg(f, 18, 100) * 100));
  const plus = f >= 100;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={151} />
        <g filter="url(#wobbleSoft)">
          {/* 白いカード (海) */}
          <rect x={280} y={160} width={1360} height={760} rx={24} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
          {/* 東海岸の陸地 (左側) */}
          <path d="M 300 180 L 1060 180 Q 1010 260 985 330 Q 940 380 945 430 Q 880 510 900 570
            Q 980 640 950 700 Q 870 790 890 900 L 300 900 Z"
            fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          {/* 海の波線 */}
          <g stroke={KRP.blueDeep} strokeWidth={3} opacity={0.4} fill="none">
            <path d="M 1150 320 q 30 -14 60 0 q 30 14 60 0" />
            <path d="M 1250 560 q 30 -14 60 0 q 30 14 60 0" />
            <path d="M 1100 760 q 30 -14 60 0 q 30 14 60 0" />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 店アイコン (順にポン) */}
          {spots.map(([sx2, sy2], i) => {
            const t = pop(seg(f, 20 + i * 6, 34 + i * 6));
            if (t <= 0.01) return null;
            return (
              <g key={i} transform={`translate(${sx2} ${sy2}) scale(${t})`}>
                <rect x={-26} y={-18} width={52} height={40} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                {/* ひさし */}
                <path d="M -30 -18 L 30 -18 L 24 -34 L -24 -34 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
                {[-18, -6, 6].map((lx) => <line key={lx} x1={lx} y1={-32} x2={lx} y2={-20} stroke={KRP.white} strokeWidth={3} />)}
                <rect x={-8} y={0} width={16} height={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
              </g>
            );
          })}
          {/* 都市名 */}
          <circle cx={985} cy={330} r={7} fill={KRP.ink} />
          <circle cx={930} cy={408} r={7} fill={KRP.ink} />
        </g>
      </svg>
      <LabelPill x={1010} y={300} text="ニューヨーク" size={26} />
      <LabelPill x={955} y={395} text="フィラデルフィア" size={26} />
      {/* カウントアップ */}
      <div style={{
        position: "absolute", left: 1320, top: 620, width: 280, textAlign: "center",
        fontFamily: FONT, fontWeight: 900, fontSize: 110, color: KRP.red,
        textShadow: "3px 4px 0 rgba(59,51,44,0.18)",
      }}>
        {n}{plus ? "+" : ""}
      </div>
      <div style={{
        position: "absolute", left: 1320, top: 750, width: 280, textAlign: "center",
        fontFamily: FONT, fontWeight: 800, fontSize: 36, color: KRP.ink,
      }}>
        店舗
      </div>
      <LabelPill x={960} y={170} centerX text="大都市の台所、100店舗超のチェーン" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 87. 画面がすこしセピアに (85と同じ構図+照明が落ちる) =====
const SceneSepia: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 15, 110);
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <DinerAlone f={f} dim={t} seed={152} />
      {/* セピアのベール */}
      <AbsoluteFill style={{ background: "#6E4A2A", opacity: 0.38 * t, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "rgba(30, 22, 12, 1)", opacity: 0.22 * t, pointerEvents: "none" }} />
      <J2Badge />
      <Atmosphere f={f} dark={t > 0.6} />
    </AbsoluteFill>
  );
};

// ===== 88. 小窓の灯りがひとつずつ消える =====
const SceneLightsOff: React.FC<{ f: number }> = ({ f }) => {
  const order = [3, 9, 1, 14, 6, 11, 0, 17, 4, 13, 8, 19, 2, 16, 10, 5, 20, 12, 7, 18, 15];
  const cols = 7, rows = 3;
  return (
    <AbsoluteFill style={{ background: "#3A3F4C", fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={153} />
        <g filter="url(#wobbleSoft)">
          {/* 夜の壁と床 */}
          <rect x={0} y={0} width={W} height={880} fill="#434A5A" />
          <rect x={0} y={880} width={W} height={200} fill="#353B48" />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          <rect x={210} y={200} width={1500} height={620} rx={12} fill="#55503F" stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const i = r * cols + c;
              const offAt = 12 + order[i] * 6;
              const lit = 1 - seg(f, offAt, offAt + 8);
              const x = 350 + c * 204, y = 320 + r * 188;
              return (
                <g key={i}>
                  {/* 灯りのにじみ */}
                  {lit > 0.05 && (
                    <circle cx={x} cy={y} r={120} fill="#F5E6B8" opacity={0.16 * lit} />
                  )}
                  <rect x={x - 72} y={y - 62} width={144} height={124} rx={8}
                    fill="#6B5E3E" stroke={KRP.ink} strokeWidth={5} />
                  <rect x={x - 52} y={y - 44} width={104} height={88} rx={4}
                    fill={lit > 0.05 ? "#F5E6B8" : "#2E3340"} opacity={lit > 0.05 ? 0.45 + 0.55 * lit : 1}
                    stroke={KRP.ink} strokeWidth={4} />
                </g>
              );
            }),
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="時代の波に、少しずつ消えて" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 89. 「CLOSED」の札が掛かる店先 (1991年NY) =====
const SceneClosed1991: React.FC<{ f: number }> = ({ f }) => {
  const swing = Math.sin(f / 11) * 6 * (1 - 0.4 * seg(f, 0, 120));
  const stampOn = f >= 50;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={154} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <line x1={0} y1={880} x2={W} y2={880} stroke={KRP.ink} strokeWidth={5} />
          {/* 店の正面 (くすんだ色) */}
          <rect x={300} y={140} width={1320} height={740} fill="#C9BBA2" stroke={KRP.ink} strokeWidth={7} />
          <rect x={430} y={170} width={1060} height={96} rx={12} fill="#55503F" />
          <text x={960} y={240} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64}
            fill="#B8A574" letterSpacing={16} opacity={0.85}>AUTOMAT</text>
          {/* 暗いガラス窓 */}
          <rect x={360} y={320} width={380} height={460} fill="#5E6470" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1180} y={320} width={380} height={460} fill="#5E6470" stroke={KRP.ink} strokeWidth={6} />
          <line x1={420} y1={340} x2={560} y2={760} stroke={KRP.white} strokeWidth={5} opacity={0.18} />
          <line x1={1260} y1={340} x2={1400} y2={760} stroke={KRP.white} strokeWidth={5} opacity={0.18} />
        </g>
        <g filter="url(#wobble)">
          {/* 扉 */}
          <rect x={820} y={330} width={280} height={550} fill="#8C7A5E" stroke={KRP.ink} strokeWidth={6} />
          <rect x={850} y={360} width={220} height={320} fill="#5E6470" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1070} cy={660} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
          {/* 掛け札のフック */}
          <circle cx={960} cy={400} r={7} fill={KRP.ink} />
          {/* CLOSED の札 (カタンと揺れる) */}
          <g transform={`rotate(${swing} 960 400)`}>
            <line x1={930} y1={402} x2={960} y2={448} stroke={KRP.ink} strokeWidth={4} />
            <line x1={990} y1={402} x2={960} y2={448} stroke={KRP.ink} strokeWidth={4} />
            <rect x={858} y={448} width={204} height={96} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <text x={960} y={514} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46}
              fill={KRP.red} letterSpacing={4}>CLOSED</text>
          </g>
        </g>
      </svg>
      {stampOn && <Stamp x={1260} y={620} text="1991年 ニューヨーク" size={40} />}
      {/* v3: y=170だと店の看板(AUTOMAT, y170-266)を隠していた → 建物の上の余白へ */}
      <LabelPill x={960} y={56} centerX text="最後の1店が、静かに閉まった" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 90. 米国地図から自販機が屋内 (建物) へ引っ込む =====
const SceneMachinesIndoor: React.FC<{ f: number }> = ({ f }) => {
  // [機械の出発点, 建物の位置]
  const pairs: Array<{ from: [number, number]; to: [number, number]; d: number }> = [
    { from: [620, 420], to: [800, 380], d: 0 },
    { from: [1060, 330], to: [1220, 390], d: 12 },
    { from: [880, 620], to: [1020, 500], d: 24 },
    { from: [1340, 520], to: [1210, 395], d: 36 },
    { from: [700, 700], to: [820, 385], d: 48 },
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={155} />
        <g filter="url(#wobbleSoft)">
          <rect x={240} y={150} width={1440} height={780} rx={24} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
          {/* 米国本土のシルエット (左=西海岸、右上=メイン、右下=フロリダ、下=テキサス) */}
          <path d="M 430 320 L 1120 308
            Q 1150 340 1195 326 L 1370 338
            L 1405 300 L 1438 318 L 1392 398
            Q 1340 462 1270 508 L 1245 535
            L 1305 628 Q 1312 666 1282 658 L 1212 556
            Q 1105 582 1010 574 L 960 610
            Q 942 664 912 658 Q 890 650 894 610 L 894 570
            L 690 556 L 462 492 Z"
            fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          {/* 五大湖のなごり */}
          <path d="M 1140 352 Q 1172 374 1210 360" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        </g>
        <g filter="url(#wobble)">
          {/* 建物 (受け皿) */}
          {[[800, 380], [1220, 390], [1020, 500]].map(([bx, by], i) => {
            const absorbed = pairs.some((p) => p.to[0] === bx && seg(f, 25 + p.d, 70 + p.d) >= 1);
            const puff = absorbed ? 1 + 0.06 * Math.sin(f / 5) : 1;
            return (
              <g key={i} transform={`translate(${bx} ${by}) scale(${puff})`}>
                <rect x={-44} y={-56} width={88} height={92} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
                <rect x={-52} y={-66} width={104} height={14} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
                {[0, 1].map((r2) => [0, 1].map((c2) => (
                  <rect key={`${r2}${c2}`} x={-28 + c2 * 32} y={-42 + r2 * 34} width={22} height={24}
                    fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
                )))}
                <rect x={-12} y={10} width={24} height={26} fill={KRP.ink} />
              </g>
            );
          })}
          {/* 自販機 (建物へ吸い込まれて縮む) */}
          {pairs.map((p, i) => {
            const t = easeOut(seg(f, 25 + p.d, 70 + p.d));
            const mx = lerp(p.from[0], p.to[0], t);
            const my = lerp(p.from[1], p.to[1], t);
            const sc = 1 - 0.75 * t;
            const op = 1 - seg(t, 0.75, 1);
            if (op <= 0.01) return null;
            return (
              <g key={i} transform={`translate(${mx} ${my}) scale(${sc})`} opacity={op}>
                <rect x={-30} y={-52} width={60} height={104} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                <rect x={-20} y={-40} width={40} height={30} rx={4} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3.5} />
                <rect x={-20} y={4} width={40} height={10} rx={4} fill={KRP.ink} opacity={0.75} />
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="機械は、街から建物の中へ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 91. 「なぜ？」+日本の夜道のミニカット (しおり=伏線) =====
const SceneWhyBookmark: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 150;
  const bobQ = Math.sin(fc / 16) * 14;
  const cardT = easeOut(seg(f, 25, 50));
  const ribbonT = pop(seg(f, 85, 100));
  return (
    <AbsoluteFill style={{ background: "#2E3A52", fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={156} />
        <g filter="url(#wobbleSoft)">
          {/* 夜空の星 */}
          {[[200, 180], [430, 320], [700, 150], [980, 260], [300, 560], [560, 700], [160, 820], [840, 560]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4}
              fill="#F7EFC9" opacity={0.3 + 0.5 * Math.abs(Math.sin((f + i * 29) / 21))} />
          ))}
        </g>
        <g filter="url(#wobble)">
          {/* ミニカット: 日本の夜道 (右下のカード) */}
          <g opacity={cardT} transform={`translate(${1280} ${530 + (1 - cardT) * 60})`}>
            <rect x={-40} y={-40} width={640} height={480} rx={18} fill="#232C40" stroke={KRP.cream} strokeWidth={6} />
            <clipPath id="ch4nightclip">
              <rect x={-28} y={-28} width={616} height={456} rx={12} />
            </clipPath>
            <g clipPath="url(#ch4nightclip)">
              <rect x={-28} y={-28} width={616} height={456} fill="#2E3A52" />
              {/* 月 */}
              <circle cx={470} cy={60} r={42} fill="#F5E6B8" stroke={KRP.ink} strokeWidth={3.5} />
              <circle cx={455} cy={52} r={9} fill="#E8D49A" opacity={0.7} />
              {/* 道路 */}
              <rect x={-28} y={330} width={616} height={98} fill="#3A4154" />
              <line x1={-28} y1={330} x2={588} y2={330} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={-10 + i * 160} y={374} width={70} height={10} rx={5} fill="#D9CBA8" opacity={0.7} />
              ))}
              {/* 電柱 */}
              <rect x={60} y={40} width={18} height={300} fill="#4A4438" stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={20} y={70} width={98} height={12} fill="#4A4438" stroke={KRP.ink} strokeWidth={3} />
              <line x1={118} y1={76} x2={588} y2={120} stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
              {/* ぽつんと光る自販機 */}
              <JihankiNight x={280} y={120} s={0.36} f={f} />
            </g>
            {/* しおりリボン (伏線マーク) */}
            {ribbonT > 0.01 && (
              <g transform={`translate(520 -40) scale(${ribbonT})`}>
                <path d="M -26 0 L 26 0 L 26 96 L 0 70 L -26 96 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
              </g>
            )}
          </g>
        </g>
      </svg>
      {/* 大きな「なぜ？」 */}
      <div style={{
        position: "absolute", left: 180, top: 330 + bobQ, width: 900,
        fontFamily: FONT, fontWeight: 900, fontSize: 190, color: KRP.white,
        textShadow: "6px 8px 0 rgba(0,0,0,0.35)", letterSpacing: 8,
      }}>
        なぜ？
      </div>
      <LabelPill x={960} y={170} centerX text="この謎は、のちほど日本の夜道で" size={36} />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 振り分け =====
export const j2Ch4Scene = (motif: string, f: number): React.ReactElement | null => {
  switch (motif) {
    case "j2_ch4_door": return <SceneCh4Door f={f} />;
    case "j2_automat_sign": return <SceneAutomatSign f={f} />;
    case "j2_automat_front": return <SceneAutomatFront f={f} />;
    case "j2_wall_windows": return <SceneWallWindows f={f} />;
    case "j2_window_foods": return <SceneWindowFoods f={f} />;
    case "j2_nickel_knob": return <SceneNickelKnob f={f} />;
    case "j2_whole_vending": return <SceneWholeVending f={f} />;
    case "j2_berlin_idea": return <SceneBerlinIdea f={f} />;
    case "j2_empty_q": return <SceneEmptyQ f={f} />;
    case "j2_behind_wall": return <SceneBehindWall f={f} />;
    case "j2_kitchen_refill": return <SceneKitchenRefill f={f} />;
    case "j2_super_manned": return <SceneSuperManned f={f} />;
    case "j2_change_booth": return <SceneChangeBooth f={f} />;
    case "j2_nickel_throw": return <SceneNickelThrow f={f} />;
    case "j2_pie_alone": return <ScenePieAlone f={f} />;
    case "j2_chain_100": return <SceneChain100 f={f} />;
    case "j2_sepia": return <SceneSepia f={f} />;
    case "j2_lights_off": return <SceneLightsOff f={f} />;
    case "j2_closed_1991": return <SceneClosed1991 f={f} />;
    case "j2_machines_indoor": return <SceneMachinesIndoor f={f} />;
    case "j2_why_bookmark": return <SceneWhyBookmark f={f} />;
    default: return null;
  }
};

export const J2_CH4_MOTIFS: string[] = [
  "j2_ch4_door",
  "j2_automat_sign",
  "j2_automat_front",
  "j2_wall_windows",
  "j2_window_foods",
  "j2_nickel_knob",
  "j2_whole_vending",
  "j2_berlin_idea",
  "j2_empty_q",
  "j2_behind_wall",
  "j2_kitchen_refill",
  "j2_super_manned",
  "j2_change_booth",
  "j2_nickel_throw",
  "j2_pie_alone",
  "j2_chain_100",
  "j2_sepia",
  "j2_lights_off",
  "j2_closed_1991",
  "j2_machines_indoor",
  "j2_why_bookmark",
];
