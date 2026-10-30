// 「私は何者?」4000年史: ブロック2 = 第4〜6章。
// 担当範囲: 台本 docs/watashi-script-v1.txt の 71〜120行目 (文#70〜#119・50文)。
// 作業ルール: docs/watashi-motifs-rules.md を必ず読んでから作ること。
// WobbleDefs の seed はこのファイルでは 400〜499 を使う (400〜442 を使用)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, WobbleDefs, Atmosphere, LabelPill, Stamp, Ground, Coin,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, WBadge, ChapterTitle, RouteMap } from "./WatashiShared";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const SKIN = "#F6D7B8"; // 肌色は固定 (ルール§3)

// ===== 腕 (hideArm した側に別描きで生やす。二重腕バグ防止。お手本 J2Ch5to6 と同じ) =====
const Arm: React.FC<{ x1: number; y1: number; x2: number; y2: number; cloth: string; s?: number }> = ({
  x1, y1, x2, y2, cloth, s = 1,
}) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={33 * s} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cloth} strokeWidth={24 * s} strokeLinecap="round" />
    <circle cx={x2} cy={y2} r={17 * s} fill={SKIN} stroke={KRP.ink} strokeWidth={5 * s} />
  </g>
);

// ===== SVG内ミニ札 (部位ラベル用。お手本と同じ) =====
const TagPlate: React.FC<{ x: number; y: number; text: string; size?: number; t?: number; color?: string }> = ({
  x, y, text, size = 26, t = 1, color = KRP.ink,
}) => {
  if (t <= 0) return null;
  const w = text.length * size + 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * pop(clamp01(t))})`} opacity={clamp01(t * 2)}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={8}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={800}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ===== 吹き出し (お手本と同じ) =====
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; t: number;
  tailTo?: [number, number]; children?: React.ReactNode;
}> = ({ x, y, w, h, t, tailTo, children }) => {
  if (t <= 0) return null;
  const sc = 0.6 + 0.4 * pop(clamp01(t));
  const tx = tailTo ? tailTo[0] : x;
  const ty = tailTo ? tailTo[1] : y + h / 2 + 120;
  return (
    <g opacity={clamp01(t * 2.5)}>
      {tailTo && (
        <g>
          <circle cx={lerp(x, tx, 0.55)} cy={lerp(y + h / 2, ty, 0.5)} r={16}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={lerp(x, tx, 0.78)} cy={lerp(y + h / 2, ty, 0.76)} r={9}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      <g transform={`translate(${x} ${y}) scale(${sc})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {children}
      </g>
    </g>
  );
};

// ===== キラッ (4方向の星。お手本と同じ) =====
const Spark: React.FC<{ cx: number; cy: number; s?: number; color?: string; o?: number }> = ({
  cx, cy, s = 1, color = KRP.yellow, o = 1,
}) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={o}>
    <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z"
      fill={color} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// ===== 衝撃線 (8方向。お手本と同じ) =====
const Burst: React.FC<{ cx: number; cy: number; t: number; r0?: number }> = ({ cx, cy, t, r0 = 220 }) => {
  if (t <= 0 || t >= 1) return null;
  const b = easeOut(t);
  return (
    <g opacity={1 - b}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i * 45 * Math.PI) / 180;
        const r1 = r0 + b * 90;
        const r2 = r1 + 60;
        return (
          <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1 * 0.62}
            x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2 * 0.62}
            stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

// ===== 大きな「？」 (ぽんと出てふわふわ漂う) =====
const QMark: React.FC<{ x: number; y: number; s?: number; t?: number; f?: number; phase?: number }> = ({
  x, y, s = 1, t = 1, f = 0, phase = 0,
}) => {
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + Math.sin((f + phase * 23) / 11) * 6}) scale(${s * (0.5 + 0.5 * pop(clamp01(t)))})`}
      opacity={clamp01(t * 2)}>
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={130} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3}>?</text>
    </g>
  );
};

// ===== 歯車 (くるくる回る) =====
const Gear: React.FC<{ cx: number; cy: number; r: number; f?: number; speed?: number; color?: string }> = ({
  cx, cy, r, f = 0, speed = 1, color = KRP.grayDark,
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${f * speed * 1.4})`}>
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <rect key={i} x={-r * 0.14} y={-r - r * 0.22} width={r * 0.28} height={r * 0.3} rx={3}
        fill={color} stroke={KRP.ink} strokeWidth={3.5} transform={`rotate(${i * 45})`} />
    ))}
    <circle cx={0} cy={0} r={r} fill={color} stroke={KRP.ink} strokeWidth={4.5} />
    <circle cx={0} cy={0} r={r * 0.4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// ===================================================================
// 人物: 19世紀〜20世紀初頭の紳士 (お手本 Tawaraya の流儀。hideArm 対応)
// ===================================================================
type GFace = "normal" | "smile" | "worried" | "surprised";
const Gent: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  coat?: string; pants?: string;
  hatKind?: "top" | "army" | "none";
  glasses?: boolean; mustache?: boolean;
  face?: GFace; gaze?: [number, number];
  hideArm?: "left" | "right" | "both" | "none";
  lean?: number;
}> = ({
  x, y, s = 1, f = 0, phase = 0, coat = KRP.blueDeep, pants = KRP.grayDark,
  hatKind = "none", glasses = false, mustache = false,
  face = "normal", gaze = [0, 0], hideArm = "none", lean = 0,
}) => {
  const [gx, gy] = gaze;
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 脚 */}
      <rect x={-44} y={-58} width={34} height={52} rx={10} fill={pants} stroke={KRP.ink} strokeWidth={5} />
      <rect x={10} y={-58} width={34} height={52} rx={10} fill={pants} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={-27} cy={-4} rx={26} ry={10} fill={KRP.ink} />
      <ellipse cx={27} cy={-4} rx={26} ry={10} fill={KRP.ink} />
      {/* 腕 (hideArm 側は描かない) */}
      {hideArm !== "left" && hideArm !== "both" && (
        <g>
          <rect x={-78} y={-148} width={22} height={82} rx={11} fill={coat} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-67} cy={-62} r={14} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      {hideArm !== "right" && hideArm !== "both" && (
        <g>
          <rect x={56} y={-148} width={22} height={82} rx={11} fill={coat} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={67} cy={-62} r={14} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      {/* 胴 (上着) */}
      <rect x={-58} y={-160} width={116} height={108} rx={20} fill={coat} stroke={KRP.ink} strokeWidth={5} />
      <line x1={0} y1={-156} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      <circle cx={-16} cy={-116} r={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} opacity={0.85} />
      <circle cx={-16} cy={-88} r={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} opacity={0.85} />
      {/* 頭 */}
      <circle cx={0} cy={-218} r={62} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
      {/* 髪 (帽子がないとき) */}
      {hatKind === "none" && (
        <g>
          <path d="M -60 -232 Q -52 -280 0 -280 Q 52 -280 60 -232 L 60 -246 Q 44 -268 0 -270 Q -44 -268 -60 -246 Z"
            fill={KRP.ink} />
          <path d="M -61 -234 Q 0 -266 61 -234 L 61 -250 Q 0 -284 -61 -250 Z" fill={KRP.ink} />
        </g>
      )}
      {/* シルクハット */}
      {hatKind === "top" && (
        <g>
          <rect x={-42} y={-326} width={84} height={76} rx={8} fill={KRP.ink} />
          <rect x={-70} y={-258} width={140} height={16} rx={8} fill={KRP.ink} />
          <rect x={-42} y={-274} width={84} height={12} fill={KRP.grayDark} />
        </g>
      )}
      {/* 軍帽 */}
      {hatKind === "army" && (
        <g>
          <path d="M -60 -244 Q -54 -288 0 -288 Q 54 -288 60 -244 Z" fill={pants} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-64} y={-250} width={128} height={16} rx={8} fill={pants} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -38 -236 L 38 -236 L 28 -224 L -28 -224 Z" fill={KRP.ink} />
          <circle cx={0} cy={-268} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      )}
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
          <line x1={-28} y1={-212} x2={-12} y2={-212} />
          <line x1={12} y1={-212} x2={28} y2={-212} />
        </g>
      ) : (
        <g>
          <circle cx={-20 + gx} cy={-212 + gy} r={face === "surprised" ? 9 : 6.5} fill={KRP.ink} />
          <circle cx={20 + gx} cy={-212 + gy} r={face === "surprised" ? 9 : 6.5} fill={KRP.ink} />
        </g>
      )}
      {glasses && (
        <g fill="none" stroke={KRP.ink} strokeWidth={4.5}>
          <circle cx={-20} cy={-212} r={20} />
          <circle cx={20} cy={-212} r={20} />
          <line x1={-1} y1={-216} x2={1} y2={-216} />
          <line x1={-40} y1={-218} x2={-56} y2={-224} />
          <line x1={40} y1={-218} x2={56} y2={-224} />
        </g>
      )}
      {/* 眉 */}
      {face === "worried" ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={-242} x2={-12} y2={-236} />
          <line x1={12} y1={-236} x2={32} y2={-242} />
        </g>
      ) : face === "surprised" ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={-246} x2={-12} y2={-246} />
          <line x1={12} y1={-246} x2={32} y2={-246} />
        </g>
      ) : (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={-240} x2={-12} y2={-242} />
          <line x1={12} y1={-242} x2={32} y2={-240} />
        </g>
      )}
      {/* 口ひげ */}
      {mustache && (
        <path d="M -22 -184 Q 0 -194 22 -184 Q 12 -178 0 -179 Q -12 -178 -22 -184 Z"
          fill={KRP.ink} stroke={KRP.ink} strokeWidth={2} />
      )}
      {/* 口 */}
      {face === "surprised" ? (
        <ellipse cx={0} cy={-168} rx={8} ry={10} fill={KRP.ink} />
      ) : face === "smile" ? (
        <path d="M -12 -172 Q 0 -161 12 -172" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "worried" ? (
        <path d="M -11 -166 Q 0 -174 11 -166" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <line x1={-9} y1={-169} x2={9} y2={-169} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===== 婦人 (ロングドレス+まとめ髪) =====
const Lady: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  dress?: string; face?: GFace; gaze?: [number, number];
  hideArm?: "left" | "right" | "none"; lean?: number; hat?: boolean;
}> = ({
  x, y, s = 1, f = 0, phase = 0, dress = KRP.red, face = "normal",
  gaze = [0, 0], hideArm = "none", lean = 0, hat = false,
}) => {
  const [gx, gy] = gaze;
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* ドレス (すそ広がり) */}
      <path d="M -42 -160 L 42 -160 L 68 -4 L -68 -4 Z" fill={dress} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={-24} cy={-3} rx={17} ry={7} fill={KRP.ink} />
      <ellipse cx={24} cy={-3} rx={17} ry={7} fill={KRP.ink} />
      {/* 帯 */}
      <rect x={-46} y={-108} width={92} height={14} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {/* 腕 */}
      {hideArm !== "left" && (
        <g>
          <rect x={-70} y={-150} width={21} height={78} rx={10} fill={dress} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-60} cy={-66} r={13} fill={SKIN} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {hideArm !== "right" && (
        <g>
          <rect x={49} y={-150} width={21} height={78} rx={10} fill={dress} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={60} cy={-66} r={13} fill={SKIN} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {/* 頭 */}
      <circle cx={0} cy={-214} r={58} fill={SKIN} stroke={KRP.ink} strokeWidth={5} />
      {/* まとめ髪+おだんご */}
      <path d="M -56 -226 Q -50 -272 0 -272 Q 50 -272 56 -226 Q 28 -246 0 -246 Q -28 -246 -56 -226 Z" fill={KRP.ink} />
      <circle cx={0} cy={-274} r={18} fill={KRP.ink} />
      {hat && (
        <g>
          <ellipse cx={0} cy={-268} rx={52} ry={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -30 -268 Q -30 -300 0 -300 Q 30 -300 30 -268 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={24} cy={-284} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
          <line x1={-26} y1={-208} x2={-11} y2={-208} />
          <line x1={11} y1={-208} x2={26} y2={-208} />
        </g>
      ) : (
        <g>
          <circle cx={-19 + gx} cy={-208 + gy} r={face === "surprised" ? 8.5 : 6} fill={KRP.ink} />
          <circle cx={19 + gx} cy={-208 + gy} r={face === "surprised" ? 8.5 : 6} fill={KRP.ink} />
        </g>
      )}
      {/* 眉・口 */}
      {face === "worried" ? (
        <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
          <line x1={-29} y1={-236} x2={-11} y2={-231} />
          <line x1={11} y1={-231} x2={29} y2={-236} />
        </g>
      ) : (
        <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
          <line x1={-29} y1={-234} x2={-11} y2={-236} />
          <line x1={11} y1={-236} x2={29} y2={-234} />
        </g>
      )}
      {face === "smile" ? (
        <path d="M -11 -170 Q 0 -160 11 -170" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "surprised" ? (
        <ellipse cx={0} cy={-168} rx={7} ry={9} fill={KRP.ink} />
      ) : face === "worried" ? (
        <path d="M -10 -164 Q 0 -172 10 -164" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <line x1={-8} y1={-168} x2={8} y2={-168} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===== 子ども (小さめ。教室・ビネー章用) =====
const Kid: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  shirt?: string; hair?: "bozu" | "okappa";
  face?: GFace; gaze?: [number, number];
}> = ({
  x, y, s = 1, f = 0, phase = 0, shirt = KRP.yellow, hair = "bozu",
  face = "smile", gaze = [0, 0],
}) => {
  const [gx, gy] = gaze;
  const bob = Math.sin((f + phase * 17) / 12) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* 脚 */}
      <rect x={-26} y={-42} width={20} height={38} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={8} y={-42} width={20} height={38} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={-16} cy={-3} rx={16} ry={8} fill={KRP.ink} />
      <ellipse cx={18} cy={-3} rx={16} ry={8} fill={KRP.ink} />
      {/* 腕 */}
      <rect x={-54} y={-106} width={17} height={56} rx={8.5} fill={shirt} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={-45} cy={-48} r={11} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
      <rect x={37} y={-106} width={17} height={56} rx={8.5} fill={shirt} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={45} cy={-48} r={11} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
      {/* 胴 */}
      <rect x={-40} y={-114} width={80} height={62} rx={18} fill={shirt} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 頭 */}
      <circle cx={0} cy={-158} r={46} fill={SKIN} stroke={KRP.ink} strokeWidth={4.5} />
      {hair === "bozu" ? (
        <path d="M -44 -170 Q -38 -202 0 -202 Q 38 -202 44 -170 Q 24 -182 0 -182 Q -24 -182 -44 -170 Z" fill={KRP.ink} />
      ) : (
        <path d="M -46 -150 Q -50 -204 0 -204 Q 50 -204 46 -150 L 36 -150 Q 40 -180 0 -182 Q -40 -180 -36 -150 Z"
          fill={KRP.ink} />
      )}
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
          <line x1={-22} y1={-154} x2={-9} y2={-154} />
          <line x1={9} y1={-154} x2={22} y2={-154} />
        </g>
      ) : (
        <g>
          <circle cx={-15 + gx} cy={-154 + gy} r={face === "surprised" ? 7 : 5.5} fill={KRP.ink} />
          <circle cx={15 + gx} cy={-154 + gy} r={face === "surprised" ? 7 : 5.5} fill={KRP.ink} />
        </g>
      )}
      {face === "worried" && (
        <g stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round">
          <line x1={-24} y1={-174} x2={-8} y2={-170} />
          <line x1={8} y1={-170} x2={24} y2={-174} />
        </g>
      )}
      {/* 口 */}
      {face === "smile" ? (
        <path d="M -10 -132 Q 0 -122 10 -132" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      ) : face === "worried" ? (
        <path d="M -9 -126 Q 0 -134 9 -126" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      ) : face === "surprised" ? (
        <ellipse cx={0} cy={-130} rx={6} ry={8} fill={KRP.ink} />
      ) : (
        <line x1={-7} y1={-130} x2={7} y2={-130} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===== 群衆の一人 (小さい簡略人物。新兵の列など) =====
const Mob: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  color?: string; cap?: boolean; worried?: boolean;
}> = ({ x, y, s = 1, f = 0, phase = 0, color = KRP.blue, cap = false, worried = false }) => {
  const bob = Math.sin((f + phase * 19) / 12) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <rect x={-30} y={-78} width={60} height={70} rx={16} fill={color} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={0} cy={-104} r={30} fill={SKIN} stroke={KRP.ink} strokeWidth={4.5} />
      {cap ? (
        <g>
          <path d="M -29 -116 Q -26 -138 0 -138 Q 26 -138 29 -116 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-32} y={-120} width={64} height={9} rx={4.5} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ) : (
        <path d="M -28 -112 Q -24 -136 0 -136 Q 24 -136 28 -112 Q 14 -122 0 -122 Q -14 -122 -28 -112 Z" fill={KRP.ink} />
      )}
      <circle cx={-10} cy={-102} r={4} fill={KRP.ink} />
      <circle cx={10} cy={-102} r={4} fill={KRP.ink} />
      {worried ? (
        <path d="M -6 -88 Q 0 -93 6 -88" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
      ) : (
        <line x1={-5} y1={-89} x2={5} y2={-89} stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===================================================================
// 横顔の頭 (骨相学の章の主役。zones で区分け線、bumps でデコボコ)
// 原寸: 高さ約340px (y -170〜170)。右向き。
// ===================================================================
const HeadProfile: React.FC<{
  x: number; y: number; s?: number; flip?: boolean;
  zones?: boolean; zoneT?: number; // 0〜1でラベルが順にぽん
  bumps?: boolean; fill?: string;
}> = ({ x, y, s = 1, flip = false, zones = false, zoneT = 1, bumps = false, fill = KRP.white }) => {
  const zt = (i: number) => clamp01(zoneT * 4 - i);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* 頭+首の輪郭 */}
      <path d="M 0 -170
        C -80 -170 -124 -112 -124 -42
        C -124 22 -104 62 -82 92
        L -82 170 L 8 170 L 8 112
        C 44 106 72 98 92 80
        Q 112 64 110 50
        Q 96 46 98 38
        Q 118 32 122 22
        Q 136 10 140 -4
        Q 122 -14 106 -16
        Q 112 -32 114 -46
        Q 110 -118 62 -148
        Q 32 -170 0 -170 Z"
        fill={fill} stroke={KRP.ink} strokeWidth={6} />
      {/* デコボコ (輪郭の上の小さなふくらみ) */}
      {bumps && (
        <g fill={fill} stroke={KRP.ink} strokeWidth={5}>
          <path d="M -20 -171 q 22 -24 46 -4" fill="none" />
          <path d="M -122 -80 q -20 20 -6 44" fill="none" />
          <path d="M 64 -148 q 24 -14 40 6" fill="none" />
        </g>
      )}
      {/* 耳 */}
      <circle cx={-26} cy={16} r={22} fill={fill} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -34 10 Q -22 6 -20 20" fill="none" stroke={KRP.ink} strokeWidth={4} />
      {/* 目・眉 */}
      <path d="M 74 -36 Q 86 -44 98 -35" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
      <line x1={72} y1={-58} x2={102} y2={-52} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      {/* 区分け線 (耳から放射状の破線) */}
      {zones && (
        <g stroke={KRP.ink} strokeWidth={3.5} strokeDasharray="10 10" opacity={0.6} fill="none">
          <line x1={-26} y1={-6} x2={-58} y2={-160} />
          <line x1={-26} y1={-6} x2={30} y2={-166} />
          <line x1={-26} y1={-6} x2={96} y2={-118} />
          <line x1={-26} y1={-6} x2={112} y2={-38} />
          <path d="M -114 -74 Q -10 -138 102 -78" />
        </g>
      )}
      {/* 区分けラベル */}
      {zones && (
        <g transform={flip ? "scale(-1 1)" : undefined}>
          <TagPlate x={flip ? 66 : -66} y={-104} text="慎重" size={24} t={zt(0)} />
          <TagPlate x={flip ? -12 : 12} y={-128} text="社交" size={24} t={zt(1)} />
          <TagPlate x={flip ? -70 : 70} y={-76} text="記憶" size={24} t={zt(2)} />
          <TagPlate x={flip ? 88 : -88} y={-22} text="音感" size={24} t={zt(3)} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// デコボコ頭 (骨相学「図鑑」用)。輪郭そのものを計算で作り、指定した向きだけ
// ぽこっとふくらませる。顔はまん丸+小さな鼻だけの記号的・コミカルな形で、
// 実在の人種・民族を想起させる造形はいっさい使わない。
// deg: 180=うしろ / 270=てっぺん / 360=顔の前。180〜360 の範囲でふくらみの位置を指定。
// ===================================================================
const bumpSkullPath = (deg0: number, h: number) => {
  const g = (deg: number) => {
    const d = ((deg - deg0 + 540) % 360) - 180;
    return Math.exp(-((d / 17) ** 2));
  };
  const base = Math.max(g(180), g(360));
  const pts: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const deg = 180 + (i / 72) * 180;
    const r = 100 + (h * Math.max(0, g(deg) - base)) / (1 - base);
    const a = (deg * Math.PI) / 180;
    pts.push(`${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`);
  }
  return (
    `M ${pts[0]} L ${pts.slice(1).join(" L ")} ` +
    "C 100 18 111 24 118 34 C 123 43 113 49 100 49 " +
    "C 97 73 84 89 58 93 L 58 116 L -58 116 L -58 72 " +
    "C -88 58 -100 28 -100 0 Z"
  );
};

const BumpHead: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  deg: number; fill?: string; mood?: "smile" | "calm" | "wink" | "oh";
}> = ({ x, y, s = 1, f = 0, phase = 0, deg, fill = KRP.blueSoft, mood = "smile" }) => {
  const bob = Math.sin((f + phase * 23) / 13) * 3;
  const h = 50 + Math.sin((f + phase * 17) / 9) * 4; // ふくらみがゆっくり呼吸する
  const blink = ((f + phase * 37) % 101) < 5 && f > 2;
  const a = (deg * Math.PI) / 180;
  const ringX = Math.cos(a) * (100 + h + 12);
  const ringY = Math.sin(a) * (100 + h + 12);
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <path d={bumpSkullPath(deg, h)} fill={fill} stroke={KRP.ink} strokeWidth={6} />
      {/* 耳 */}
      <circle cx={-10} cy={8} r={18} fill={fill} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -18 2 Q -6 -2 -4 12" fill="none" stroke={KRP.ink} strokeWidth={4} />
      {/* 目 */}
      {blink || mood === "wink" ? (
        <path d="M 52 -20 Q 62 -30 72 -20" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
      ) : (
        <circle cx={62} cy={-20} r={7} fill={KRP.ink} />
      )}
      {/* 眉 */}
      <line x1={48} y1={-46} x2={78} y2={-40} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      {/* 口 */}
      {mood === "oh" ? (
        <ellipse cx={96} cy={60} rx={7} ry={9} fill={KRP.ink} />
      ) : mood === "calm" ? (
        <line x1={88} y1={60} x2={104} y2={58} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <path d="M 87 56 Q 96 68 105 54" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
      {/* えり */}
      <line x1={-40} y1={100} x2={44} y2={100} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" opacity={0.6} />
      {/* ふくらみを丸で囲って「ここ」と示す */}
      <circle cx={ringX} cy={ringY} r={44} fill="none" stroke={KRP.red} strokeWidth={5}
        strokeDasharray="12 14" strokeDashoffset={-f * 1.1} opacity={0.85} />
    </g>
  );
};

// ===== テスト用紙 (アルファ=文字 / ベータ=絵と記号 / plain=白紙に線) =====
const TestSheet: React.FC<{
  x: number; y: number; s?: number; kind?: "alpha" | "beta" | "plain"; rot?: number; heart?: boolean;
}> = ({ x, y, s = 1, kind = "plain", rot = 0, heart = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-95} y={-125} width={190} height={250} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <line x1={-66} y1={-88} x2={66} y2={-88} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
    {kind !== "beta" && (
      <g stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" opacity={0.85}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={-66} y1={-52 + i * 30} x2={i === 4 ? 10 : 66} y2={-52 + i * 30} />
        ))}
      </g>
    )}
    {kind === "beta" && (
      <g>
        <circle cx={-38} cy={-38} r={18} fill="none" stroke={KRP.blueDeep} strokeWidth={4.5} />
        <path d="M 20 -56 L 56 -56 L 38 -22 Z" fill="none" stroke={KRP.orange} strokeWidth={4.5} />
        <rect x={-56} y={8} width={34} height={34} fill="none" stroke={KRP.green} strokeWidth={4.5} />
        <path d="M 12 24 L 60 24 M 44 8 L 60 24 L 44 40" fill="none" stroke={KRP.ink} strokeWidth={4.5}
          strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -60 68 L 60 68 M -60 68 L -60 96 L 20 96 L 20 82" fill="none" stroke={KRP.grayDark} strokeWidth={4} />
      </g>
    )}
    {heart && (
      <path d="M 0 96 C -8 82 -30 82 -30 100 C -30 114 -10 124 0 130 C 10 124 30 114 30 100 C 30 82 8 82 0 96 Z"
        fill={KRP.red} stroke={KRP.ink} strokeWidth={4} transform="translate(44 -160) scale(0.7)" />
    )}
  </g>
);

// ===== 骨相学の診断書 (横顔アイコン入りの紙。導入のShindanShoとは別物) =====
const CertPaper: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-90} y={-120} width={180} height={240} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    {/* 紙の幅 180 に6文字。はみ出さないよう 26 にしてある */}
    <text x={0} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink}>
      骨相学診断書
    </text>
    <line x1={-62} y1={-64} x2={62} y2={-64} stroke={KRP.ink} strokeWidth={3.5} />
    <g transform="translate(-34 -8) scale(0.22)">
      <HeadProfile x={0} y={0} zones zoneT={0} />
    </g>
    <g stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" opacity={0.85}>
      <line x1={14} y1={-28} x2={62} y2={-28} />
      <line x1={14} y1={-2} x2={62} y2={-2} />
      <line x1={14} y1={24} x2={48} y2={24} />
    </g>
    <circle cx={48} cy={84} r={22} fill="none" stroke={KRP.red} strokeWidth={4} />
    <text x={48} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.red}>骨</text>
  </g>
);

// ===================================================================
// 第4章 (#70〜#86): 骨相学 = 笑いの山②
// ===================================================================

// #70 章扉: 大きな横顔+測定キャリパー
const SceneCh4Door: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 6, 36));
  const open = 22 + Math.sin(f / 9) * 6; // キャリパーの開閉
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={400} />
        <g filter="url(#wobble)" opacity={t}>
          <HeadProfile x={540} y={520} s={1.3} bumps />
          {/* キャリパー (上から頭を測る) */}
          <g transform="translate(540 120)">
            <circle cx={0} cy={0} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
            <g transform={`rotate(${-open})`}>
              <line x1={0} y1={0} x2={0} y2={330} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
              <line x1={0} y1={0} x2={0} y2={330} stroke={KRP.brass} strokeWidth={7} strokeLinecap="round" />
              <circle cx={0} cy={330} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
            <g transform={`rotate(${open})`}>
              <line x1={0} y1={0} x2={0} y2={330} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
              <line x1={0} y1={0} x2={0} y2={330} stroke={KRP.brass} strokeWidth={7} strokeLinecap="round" />
              <circle cx={0} cy={330} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
          </g>
          <Spark cx={820} cy={300} s={0.9} o={0.5 + 0.5 * Math.sin(f / 7)} />
          <Spark cx={260} cy={720} s={0.7} color={KRP.orange} o={0.5 + 0.5 * Math.sin(f / 7 + 2)} />
        </g>
      </svg>
      <ChapterTitle num={4} title="頭のデコボコ、測ります。" t={easeOut(seg(f, 14, 44))} />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #71 19世紀の欧米の街で大流行
const SceneBoomStreet: React.FC<{ f: number }> = ({ f }) => {
  const b = (i: number) => clamp01(seg(f, 12 + i * 10, 34 + i * 10));
  const MiniHeadBubble: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
    t <= 0 ? null : (
      <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * pop(t)})`} opacity={clamp01(t * 2)}>
        <circle cx={0} cy={0} r={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={34} cy={74} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <HeadProfile x={-8} y={4} s={0.32} zones zoneT={1} fill={KRP.blueSoft} />
      </g>
    );
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={401} />
        <g filter="url(#wobble)">
          {/* 街並み */}
          <g opacity={0.9}>
            <rect x={120} y={340} width={300} height={400} fill={KRP.paper} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M 110 340 L 270 240 L 430 340 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={620} y={300} width={260} height={440} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={1080} y={360} width={280} height={380} fill={KRP.paper} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M 1070 360 L 1220 260 L 1370 360 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={1540} y={320} width={260} height={420} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
            {[180, 300, 680, 790, 1140, 1270, 1600, 1710].map((x, i) => (
              <rect key={i} x={x} y={i % 2 === 0 ? 420 : 480} width={64} height={80} rx={6}
                fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            ))}
          </g>
          <Ground y={740} />
          <Gent x={480} y={900} s={0.95} f={f} phase={0} hatKind="top" face="smile" gaze={[3, -2]} />
          <Lady x={950} y={900} s={0.95} f={f} phase={1} dress={KRP.green} face="surprised" gaze={[-3, -2]} hat />
          <Gent x={1430} y={900} s={0.95} f={f} phase={2} coat={KRP.orange} face="smile" mustache gaze={[-3, -2]} />
          <MiniHeadBubble x={620} y={430} t={b(0)} />
          <MiniHeadBubble x={1090} y={400} t={b(1)} />
          <MiniHeadBubble x={1570} y={440} t={b(2)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="欧米で、とんでもない診断が大流行" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #72/#73 骨相学の頭の地図 (額入りの大きな図)
const SceneHeadMap: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 4, 26));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={402} />
        <g filter="url(#wobble)" opacity={t}>
          {/* 額縁の掛け図 */}
          <rect x={430} y={262} width={1060} height={626} rx={14} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={7} />
          <rect x={458} y={290} width={1004} height={570} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <HeadProfile x={930} y={610} s={1.32} zones zoneT={seg(f, 14, 50)} fill={KRP.blueSoft} />
          {/* 図のタイトル札 */}
          <g transform={`translate(960 340) scale(${0.7 + 0.3 * pop(seg(f, 10, 32))})`}>
            <rect x={-170} y={-36} width={340} height={72} rx={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
              fill={KRP.ink}>骨相学</text>
          </g>
          <Spark cx={520} cy={820} s={0.8} o={0.5 + 0.5 * Math.sin(f / 8)} />
          <Spark cx={1410} cy={360} s={0.8} color={KRP.orange} o={0.5 + 0.5 * Math.sin(f / 8 + 2)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="頭の形で、性格や才能がわかる…?" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #73 頭のデコボコで性格や才能がわかる、という説 (当時の「図鑑」仕立て)
// 4枚とも同じ顔・同じ色にして「ふくらみの場所だけが違う」ことを示す。
// 実在の人種・民族を思わせる描き分けはしない。赤スタンプで「今では否定」と明示。
const BUMP_CARDS: { deg: number; part: string; trait: string; color: string }[] = [
  { deg: 335, part: "ひたいの上", trait: "慎重さ", color: KRP.blueSoft },
  { deg: 285, part: "あたまの上", trait: "ほがらかさ", color: KRP.green },
  { deg: 240, part: "うしろの上", trait: "記おく力", color: KRP.yellow },
  { deg: 200, part: "耳のうしろ", trait: "音楽の才能", color: KRP.orange },
];

const SceneHeadBumps: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={444} />
      <g filter="url(#wobble)">
        {BUMP_CARDS.map((c, i) => {
          const cx = 270 + i * 460;
          const t = pop(seg(f, 6 + i * 9, 30 + i * 9));
          const tp = pop(seg(f, 36 + i * 9, 58 + i * 9));
          return (
            <g key={c.part} transform={`translate(${cx} 540) scale(${0.82 + 0.18 * t}) translate(${-cx} ${-540})`}
              opacity={clamp01(t * 1.6)}>
              {/* カード */}
              <rect x={cx - 205} y={255} width={410} height={570} rx={16}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              {/* 部位の名前 */}
              <rect x={cx - 165} y={278} width={330} height={64} rx={12}
                fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
              <text x={cx} y={323} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36}
                fill={KRP.ink}>{c.part}</text>
              {/* 頭 (4枚とも同じ顔・同じ色。ふくらみの位置だけが違う) */}
              <BumpHead x={cx} y={565} s={0.78} f={f} phase={i} deg={c.deg}
                fill={KRP.blueSoft} mood={i === 1 ? "smile" : i === 3 ? "oh" : "calm"} />
              <text x={cx} y={716} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26}
                fill={KRP.grayDark}>ここが出ていると</text>
              {/* 割りあてられた性格・才能 */}
              <g transform={`translate(${cx} 772) scale(${0.7 + 0.3 * tp})`} opacity={clamp01(tp * 1.6)}>
                <rect x={-152} y={-34} width={304} height={68} rx={34}
                  fill={c.color} stroke={KRP.ink} strokeWidth={5} />
                <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38}
                  fill={KRP.ink}>{c.trait}</text>
              </g>
            </g>
          );
        })}
        {/* 今では否定されている、という距離感を画面に残す */}
        <g transform="translate(1630 200) rotate(-5)" opacity={clamp01(seg(f, 70, 92)) * 0.95}>
          <rect x={-188} y={-42} width={376} height={80} rx={10}
            fill="none" stroke={KRP.red} strokeWidth={6} />
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
            fill={KRP.red}>今では否定</text>
        </g>
        <Spark cx={120} cy={880} s={0.7} o={0.4 + 0.4 * Math.sin(f / 9)} />
        <Spark cx={1840} cy={870} s={0.7} color={KRP.orange} o={0.4 + 0.4 * Math.sin(f / 9 + 2)} />
      </g>
    </svg>
    <LabelPill x={700} y={170} text="デコボコで、性格や才能がわかる?" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #74 医師ガルが提唱し、またたく間に広まる
const SceneGall: React.FC<{ f: number }> = ({ f }) => {
  const spread = easeOut(seg(f, 20, 56));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={403} />
        <g filter="url(#wobble)">
          <Ground y={700} />
          {/* 演台 */}
          <rect x={330} y={584} width={320} height={122} rx={12} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
          <Gent x={490} y={596} s={0.94} f={f} phase={0} coat={KRP.grayDark} glasses mustache
            face="smile" gaze={[4, -2]} hideArm="right" />
          <Arm x1={542} y1={474} x2={648} y2={412} cloth={KRP.grayDark} />
          {/* 説の吹き出し (字幕帯に当たらないよう上段に寄せる) */}
          <Bubble x={950} y={408} w={400} h={296} t={seg(f, 8, 30)} tailTo={[664, 420]}>
            <HeadProfile x={-6} y={16} s={0.68} zones zoneT={1} fill={KRP.blueSoft} />
          </Bubble>
          {/* 広がる波紋 */}
          {[0, 1, 2].map((i) => {
            const rr = 140 + spread * (190 + i * 150);
            return (
              <path key={i} d={`M ${950 + rr * 0.5} ${408 - rr * 0.35} A ${rr} ${rr} 0 0 1 ${950 + rr * 0.62} ${408 + rr * 0.5}`}
                fill="none" stroke={KRP.orange} strokeWidth={7} strokeLinecap="round"
                strokeDasharray="4 26" opacity={(0.9 - i * 0.22) * spread} />
            );
          })}
          {/* 聞き入る人々 (足元を地面 y=700 にそろえる) */}
          <Mob x={1420} y={700} s={1.0} f={f} phase={0} color={KRP.blue} />
          <Mob x={1580} y={708} s={0.95} f={f} phase={1} color={KRP.green} />
          <Mob x={1736} y={698} s={1.05} f={f} phase={2} color={KRP.orange} />
          <Spark cx={1500} cy={520} s={0.7} o={clamp01(spread * 1.4 - 0.3)} />
          <Spark cx={1700} cy={556} s={0.6} color={KRP.orange} o={clamp01(spread * 1.4 - 0.5)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="医師ガルが唱え、またたく間に" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #75 ニューヨークの有料診断所
const SceneNYShindanjo: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={404} />
      <g filter="url(#wobble)">
        {/* 高いビルの街 */}
        <g opacity={0.85}>
          <rect x={90} y={220} width={200} height={560} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={1460} y={180} width={190} height={600} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={1680} y={300} width={180} height={480} fill={KRP.paper} stroke={KRP.ink} strokeWidth={5.5} />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x={122} y={260 + r * 120} width={50} height={64} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={206} y={260 + r * 120} width={50} height={64} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={1492} y={230 + r * 130} width={46} height={62} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={1566} y={230 + r * 130} width={46} height={62} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          ))}
        </g>
        <Ground y={780} />
        {/* 診断所の店構え */}
        <rect x={420} y={400} width={620} height={380} fill={KRP.paper} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 400 400 L 420 340 L 1040 340 L 1060 400 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M ${420 + i * 103.3} 400 Q ${471 + i * 103.3} 436 ${523 + i * 103.3} 400`}
            fill={i % 2 === 0 ? KRP.red : KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {/* 看板 */}
        <g transform={`translate(730 500) scale(${0.7 + 0.3 * pop(seg(f, 6, 28))})`}>
          <rect x={-240} y={-44} width={480} height={88} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <text x={-44} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46}
            fill={KRP.ink}>骨相学 診断所</text>
          <g transform="translate(174 0) rotate(-8)">
            <rect x={-54} y={-28} width={108} height={56} rx={10} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
              fill={KRP.red}>有料</text>
          </g>
        </g>
        {/* 扉+行列 */}
        <rect x={620} y={600} width={150} height={180} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={742} cy={692} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
        <Mob x={880} y={880} s={1.1} f={f} phase={0} color={KRP.blue} />
        <Mob x={1030} y={890} s={1.05} f={f} phase={1} color={KRP.green} />
        <Mob x={1180} y={884} s={1.1} f={f} phase={2} color={KRP.orange} />
        <Mob x={1330} y={892} s={1.0} f={f} phase={3} color={KRP.red} />
      </g>
    </svg>
    <LabelPill x={960} y={170} text="ニューヨークに、有料の診断所" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #76〜#78 診断所の中 (共通セット+段階演出)
const Parlor: React.FC<{ f: number; stage: "touch" | "bubble" | "pay" }> = ({ f, stage }) => {
  const handX = 804 + Math.sin(f / 4) * 16; // さわさわ動く手
  const handY = 368 + Math.cos(f / 4) * 8;
  const coinT = (i: number) => clamp01(seg(f, 10 + i * 12, 44 + i * 12));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={stage === "touch" ? 405 : stage === "bubble" ? 406 : 407} />
        <g filter="url(#wobble)">
          {/* 部屋 */}
          <rect x={0} y={0} width={W} height={760} fill={KRP.paper} />
          <Ground y={760} />
          {/* 窓+カーテン */}
          <rect x={220} y={180} width={300} height={330} rx={10} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
          <line x1={370} y1={180} x2={370} y2={510} stroke={KRP.ink} strokeWidth={5} />
          <line x1={220} y1={345} x2={520} y2={345} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 205 170 Q 250 320 215 520 L 165 520 Q 185 330 165 170 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 535 170 Q 490 320 525 520 L 575 520 Q 555 330 575 170 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {/* 壁の横顔の額 */}
          <rect x={1430} y={200} width={250} height={260} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1446} y={216} width={218} height={228} rx={6} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          <HeadProfile x={1548} y={332} s={0.34} zones zoneT={1} fill={KRP.blueSoft} />
          {/* 椅子 (背もたれ+座面+肘掛け) */}
          <rect x={600} y={330} width={70} height={420} rx={22} fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
          {/* お客 (座り姿: 胴+頭。脚は肘掛けで隠す) */}
          <g transform={`translate(0 ${Math.sin(f / 13) * 2.5})`}>
            <rect x={690} y={470} width={120} height={180} rx={24} fill={KRP.blue} stroke={KRP.ink} strokeWidth={5.5} />
            <circle cx={762} cy={408} r={58} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M 706 396 Q 712 352 762 352 Q 812 352 818 396 Q 790 380 762 380 Q 734 380 706 396 Z" fill={KRP.ink} />
            {((f + 31) % 97) < 5 ? (
              <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
                <line x1={770} y1={408} x2={784} y2={408} />
              </g>
            ) : (
              <circle cx={780} cy={408} r={6} fill={KRP.ink} />
            )}
            <path d="M 788 440 Q 796 434 802 440" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round"
              transform={stage === "pay" ? "translate(0 2)" : undefined} />
          </g>
          {/* 座面+肘掛け (手前。脚を隠す) */}
          <rect x={620} y={640} width={280} height={110} rx={18} fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={850} y={540} width={64} height={210} rx={20} fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 診断士 */}
          <Gent x={1180} y={880} s={1.08} f={f} phase={2} coat={KRP.bronze} glasses mustache
            face="smile" gaze={[-4, -2]} hideArm="left" />
          <Arm x1={1104} y1={728} x2={handX} y2={handY} cloth={KRP.bronze} s={1.08} />
          {/* さわさわ線 */}
          <g stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" fill="none"
            opacity={0.6 + 0.4 * Math.sin(f / 4)}>
            <path d="M 700 330 q 14 -18 30 -6" />
            <path d="M 826 320 q 16 -14 28 0" />
          </g>
          {/* 段階: お金 */}
          {stage === "pay" && (
            <g>
              {[0, 1, 2].map((i) => {
                const t = coinT(i);
                if (t <= 0) return null;
                const cx = lerp(880, 1110, t);
                const cy = 600 - Math.sin(t * Math.PI) * 170 + i * 6;
                return <g key={i} opacity={clamp01((1 - t) * 6)}><Coin cx={cx} cy={cy} r={30} /></g>;
              })}
              <Coin cx={1116} cy={610} r={30} />
              <Spark cx={1150} cy={540} s={0.7} o={0.5 + 0.5 * Math.sin(f / 6)} />
            </g>
          )}
        </g>
        {/* 吹き出し (wobbleの外・文字をにじませない) */}
        {stage === "bubble" && (
          <Bubble x={1370} y={300} w={520} h={230} t={seg(f, 6, 26)} tailTo={[1230, 560]}>
            <text x={0} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44}
              fill={KRP.ink}>慎重さのふくらみ、</text>
            <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44}
              fill={KRP.ink}>大きいですね</text>
          </Bubble>
        )}
      </svg>
      <LabelPill x={960} y={170}
        text={stage === "touch" ? "お客は椅子で、頭をさわってもらう" : stage === "bubble" ? "診断士のおことば" : "撫でられて、お金を払う"}
        centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #79 就職の身元保証に診断書
const SceneShushoku: React.FC<{ f: number }> = ({ f }) => {
  const slide = easeOut(seg(f, 8, 40));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={408} />
        <g filter="url(#wobble)">
          <Ground y={780} />
          {/* 雇い主 (机のうしろ) */}
          <Gent x={1400} y={760} s={1.05} f={f} phase={1} coat={KRP.grayDark} mustache glasses
            face="normal" gaze={[-4, -1]} hideArm="both" />
          {/* 机 */}
          <rect x={1130} y={620} width={560} height={46} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1170} y={666} width={480} height={220} rx={8} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 応募者 */}
          <Gent x={560} y={890} s={1.05} f={f} phase={0} coat={KRP.blue} hatKind="top"
            face="smile" gaze={[4, -2]} hideArm="right" />
          <Arm x1={622} y1={736} x2={810} y2={620} cloth={KRP.blue} s={1.05} />
          {/* 診断書 (すべり出す) */}
          <CertPaper x={lerp(830, 1050, slide)} y={lerp(560, 520, slide)} s={1.05} rot={lerp(-14, 4, slide)} />
          <TagPlate x={1050} y={330} text="身元保証がわり" size={34} t={seg(f, 36, 54)} color={KRP.blueDeep} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="就職に、骨相学の診断書を" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #80 結婚相手選びに頭の形の相性
const SceneKekkon: React.FC<{ f: number }> = ({ f }) => {
  const ht = pop(seg(f, 14, 38));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={409} />
        <g filter="url(#wobble)">
          <HeadProfile x={520} y={560} s={1.08} zones zoneT={1} fill={KRP.blueSoft} />
          <HeadProfile x={1400} y={560} s={1.08} zones zoneT={1} flip fill={KRP.white} />
          {/* ハート */}
          {ht > 0 && (
            <g transform={`translate(960 430) scale(${ht * (1 + Math.sin(f / 9) * 0.05)})`}>
              <path d="M 0 -18 C -16 -52 -72 -52 -72 -6 C -72 30 -22 58 0 74 C 22 58 72 30 72 -6 C 72 -52 16 -52 0 -18 Z"
                fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
            </g>
          )}
          <Burst cx={960} cy={430} t={seg(f, 30, 58)} r0={130} />
          <TagPlate x={960} y={620} text="相性" size={38} t={seg(f, 34, 52)} color={KRP.red} />
          <Spark cx={760} cy={300} s={0.8} o={0.5 + 0.5 * Math.sin(f / 7)} />
          <Spark cx={1180} cy={290} s={0.7} color={KRP.orange} o={0.5 + 0.5 * Math.sin(f / 7 + 2)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="結婚相手選びにも、頭の形" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #81 科学的な根拠は?
const SceneKonkyoQ: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={410} />
      <g filter="url(#wobble)">
        {/* 字幕帯に当たらないよう、頭も「?」もひとまわり上に寄せる */}
        <HeadProfile x={930} y={530} s={1.2} zones zoneT={1} fill={KRP.blueSoft} />
        <QMark x={560} y={430} s={1.1} t={seg(f, 8, 24)} f={f} phase={0} />
        <QMark x={1372} y={400} s={1.3} t={seg(f, 18, 34)} f={f} phase={1} />
        <QMark x={1286} y={706} s={0.9} t={seg(f, 28, 44)} f={f} phase={2} />
      </g>
    </svg>
    <LabelPill x={960} y={170} text="肝心の、科学的な根拠は?" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #82 脳の実験できっぱり否定
const SceneHitei: React.FC<{ f: number }> = ({ f }) => {
  const xT = easeOut(seg(f, 18, 34));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={411} />
        <g filter="url(#wobble)">
          <Ground y={780} />
          {/* 実験テーブル */}
          <rect x={200} y={620} width={520} height={40} rx={9} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={250} y={660} width={60} height={220} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
          <rect x={610} y={660} width={60} height={220} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
          {/* フラスコ */}
          <path d="M 300 510 L 300 556 L 262 614 Q 258 622 268 622 L 352 622 Q 362 622 358 614 L 320 556 L 320 510 Z"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={296} cy={494 + Math.sin(f / 8) * 4} r={9} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
          {/* 脳の模型 (台つき) */}
          <rect x={430} y={586} width={160} height={36} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 445 586 Q 430 500 510 486 Q 596 476 594 548 Q 592 586 575 586 Z"
            fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M 470 560 q 14 -30 36 -12 M 510 520 q 20 -14 34 6" fill="none" stroke={KRP.ink}
            strokeWidth={4} opacity={0.65} />
          {/* 科学者 */}
          <Gent x={880} y={890} s={1.05} f={f} phase={0} coat={KRP.white} glasses
            face="normal" gaze={[4, -2]} hideArm="right" />
          <Arm x1={942} y1={736} x2={1120} y2={580} cloth={KRP.white} s={1.05} />
          {/* 骨相学カードに大きな× */}
          <rect x={1230} y={330} width={440} height={420} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <HeadProfile x={1440} y={560} s={0.62} zones zoneT={1} fill={KRP.blueSoft} />
          {xT > 0 && (
            <g stroke={KRP.red} strokeWidth={26} strokeLinecap="round" opacity={0.92}>
              <line x1={1280} y1={380} x2={lerp(1280, 1620, clamp01(xT * 2))} y2={lerp(380, 700, clamp01(xT * 2))} />
              {xT > 0.5 && (
                <line x1={1620} y1={380} x2={lerp(1620, 1280, clamp01(xT * 2 - 1))} y2={lerp(380, 700, clamp01(xT * 2 - 1))} />
              )}
            </g>
          )}
          <Burst cx={1450} cy={540} t={seg(f, 32, 58)} r0={260} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="脳の実験で、たしかめた結果…" centerX />
      <Stamp x={1250} y={770} text="きっぱり否定" size={54} />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #83/#84 それでも人気は続いた
const SceneNinkiTsuzuku: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={412} />
      <g filter="url(#wobble)">
        <Ground y={780} />
        {/* 色あせた「科学×」カード */}
        <g opacity={0.55}>
          <rect x={170} y={330} width={330} height={320} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <HeadProfile x={330} y={500} s={0.46} fill={KRP.blueSoft} />
          <g stroke={KRP.red} strokeWidth={18} strokeLinecap="round">
            <line x1={210} y1={370} x2={460} y2={610} />
            <line x1={460} y1={370} x2={210} y2={610} />
          </g>
          <TagPlate x={335} y={700} text="科学は否定" size={28} />
        </g>
        {/* それでも診断所に行列 */}
        <rect x={760} y={420} width={520} height={360} fill={KRP.paper} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 740 420 L 760 364 L 1280 364 L 1300 420 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
        <g transform="translate(1020 500)">
          <rect x={-200} y={-38} width={400} height={76} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
            fill={KRP.ink}>骨相学 診断所</text>
        </g>
        <rect x={930} y={620} width={140} height={160} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <Mob x={1370 + i * 140} y={880 + (i % 2) * 10} s={1.05 - i * 0.02} f={f} phase={i}
              color={[KRP.blue, KRP.green, KRP.orange, KRP.red][i]} />
            <path d="M 0 -8 C -4 -16 -15 -16 -15 -6 C -15 1 -5 7 0 10 C 5 7 15 1 15 -6 C 15 -16 4 -16 0 -8 Z"
              fill={KRP.red} stroke={KRP.ink} strokeWidth={3}
              transform={`translate(${1370 + i * 140} ${700 + Math.sin((f + i * 20) / 9) * 8}) scale(1.1)`} />
          </g>
        ))}
      </g>
    </svg>
    <LabelPill x={960} y={170} text="否定されても、行列は続いた" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #85 「当たってる気がする」は根拠より強い (天秤)
const SceneTenbin: React.FC<{ f: number }> = ({ f }) => {
  const tilt = easeOut(seg(f, 10, 44)) * 9 + Math.sin(f / 16) * 1.2;
  const rad = (tilt * Math.PI) / 180;
  const armL = 420;
  const pan = (side: -1 | 1) => ({
    x: 960 + Math.cos(rad) * armL * side,
    y: 420 + Math.sin(rad) * armL * side,
  });
  const L = pan(-1);
  const R = pan(1);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={413} />
        <g filter="url(#wobble)">
          <Ground y={820} />
          {/* 支柱 */}
          <path d="M 905 820 L 960 440 L 1015 820 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          <rect x={830} y={812} width={260} height={36} rx={10} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 竿 */}
          <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={KRP.ink} strokeWidth={17} strokeLinecap="round" />
          <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={KRP.brass} strokeWidth={9} strokeLinecap="round" />
          <circle cx={960} cy={420} r={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 左皿: 根拠 (軽い) */}
          <g>
            <line x1={L.x} y1={L.y} x2={L.x - 60} y2={L.y + 120} stroke={KRP.ink} strokeWidth={5} />
            <line x1={L.x} y1={L.y} x2={L.x + 60} y2={L.y + 120} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${L.x - 90} ${L.y + 120} Q ${L.x} ${L.y + 170} ${L.x + 90} ${L.y + 120} Z`}
              fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={L.x - 36} y={L.y + 58} width={72} height={62} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            <TagPlate x={L.x} y={L.y - 56} text="根拠" size={32} />
          </g>
          {/* 右皿: 気がする (重い) */}
          <g>
            <line x1={R.x} y1={R.y} x2={R.x - 60} y2={R.y + 120} stroke={KRP.ink} strokeWidth={5} />
            <line x1={R.x} y1={R.y} x2={R.x + 60} y2={R.y + 120} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${R.x - 90} ${R.y + 120} Q ${R.x} ${R.y + 170} ${R.x + 90} ${R.y + 120} Z`}
              fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M 0 -20 C -18 -58 -82 -58 -82 -6 C -82 34 -26 64 0 82 C 26 64 82 34 82 -6 C 82 -58 18 -58 0 -20 Z"
              fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5}
              transform={`translate(${R.x} ${R.y + 50})`} />
            <TagPlate x={R.x} y={R.y - 70} text="当たってる気がする" size={30} t={seg(f, 24, 44)} color={KRP.red} />
          </g>
          <Spark cx={R.x + 130} cy={R.y - 10} s={0.7} o={0.5 + 0.5 * Math.sin(f / 7)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="「気がする」は、根拠より強い" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #86 この現象にはあとで名前が付く
const SceneNamaeAto: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 8, 34));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={414} />
        <g filter="url(#wobble)">
          {/* 大きな名札 (荷札型) */}
          <g transform={`translate(960 530) rotate(${Math.sin(f / 18) * 2}) scale(${0.7 + 0.3 * t})`}>
            <path d="M -330 -170 L 230 -170 L 330 0 L 230 170 L -330 170 Z"
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={252} cy={0} r={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
            <path d={`M 274 0 Q 360 ${-30 + Math.sin(f / 10) * 14} 420 ${20 + Math.sin(f / 10 + 1) * 14}`}
              fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <text x={-70} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120}
              fill={KRP.ink}>？？？</text>
          </g>
          <TagPlate x={960} y={790} text="名前は、のちほど" size={34} t={seg(f, 30, 50)} color={KRP.blueDeep} />
          <Spark cx={500} cy={300} s={0.9} o={0.5 + 0.5 * Math.sin(f / 7)} />
          <Spark cx={1430} cy={280} s={0.8} color={KRP.orange} o={0.5 + 0.5 * Math.sin(f / 7 + 2)} />
          <Spark cx={1360} cy={760} s={0.7} o={0.5 + 0.5 * Math.sin(f / 7 + 4)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="この妙な現象、覚えておいてください" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// __SCENES_CH4__

// ===================================================================
// 第5章 (#87〜#103): ビネー = 善意の物語
// ===================================================================

// #87 章扉: 校舎+虫めがね
const SceneCh5Door: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 6, 36));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={415} />
        <g filter="url(#wobble)" opacity={t}>
          {/* おひさま */}
          <circle cx={210} cy={210} r={64} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2 + f / 90;
            return (
              <line key={i} x1={210 + Math.cos(a) * 84} y1={210 + Math.sin(a) * 84}
                x2={210 + Math.cos(a) * 112} y2={210 + Math.sin(a) * 112}
                stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
            );
          })}
          <Ground y={820} />
          {/* 校舎 (章タイトルの帯 x1080〜 と重ならないよう左に寄せる) */}
          <rect x={250} y={430} width={520} height={390} fill={KRP.paper} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 220 430 L 510 316 L 800 430 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
          <rect x={456} y={336} width={110} height={94} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={511} cy={383} r={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={511} y1={383} x2={511} y2={365} stroke={KRP.ink} strokeWidth={4} />
          <line x1={511} y1={383} x2={524} y2={390} stroke={KRP.ink} strokeWidth={4} />
          <rect x={296} y={498} width={104} height={114} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={620} y={498} width={104} height={114} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={456} y={664} width={112} height={156} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 花だん (地面のにぎやかし。帯の下には置かない) */}
          {[180, 860, 930].map((gx, i) => (
            <path key={gx} d={`M ${gx} 820 Q ${gx - 14} ${784 + Math.sin((f + i * 20) / 14) * 4} ${gx - 24} 776`}
              fill="none" stroke={KRP.green} strokeWidth={6} strokeLinecap="round" />
          ))}
          {/* 先生と子ども (章タイトルの左どなりに立たせる) */}
          <Lady x={846} y={820} s={0.96} f={f} phase={0} dress={KRP.blueDeep} face="smile" gaze={[3, 0]} />
          <Kid x={964} y={820} s={0.96} f={f} phase={1} shirt={KRP.yellow} face="smile" gaze={[-3, -1]} />
          {/* ふわふわ浮く虫めがね+ハート (章タイトルの真上) */}
          <g transform={`translate(1480 ${344 + Math.sin(f / 11) * 10}) rotate(-18)`}>
            <circle cx={0} cy={0} r={86} fill="none" stroke={KRP.ink} strokeWidth={13} />
            <circle cx={0} cy={0} r={86} fill={KRP.blueSoft} opacity={0.35} />
            <line x1={62} y1={62} x2={128} y2={128} stroke={KRP.ink} strokeWidth={17} strokeLinecap="round" />
            <line x1={62} y1={62} x2={128} y2={128} stroke={KRP.bronze} strokeWidth={9} strokeLinecap="round" />
            <path d="M 0 -14 C -10 -34 -42 -34 -42 -6 C -42 16 -12 32 0 42 C 12 32 42 16 42 -6 C 42 -34 10 -34 0 -14 Z"
              fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        </g>
      </svg>
      <ChapterTitle num={5} title="困っている子を、見つけたい。" t={easeOut(seg(f, 14, 44))} left={1080} top={596} width={800} />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #88 「頭の形」から「頭の中身」へ
const SceneKatachiNakami: React.FC<{ f: number }> = ({ f }) => {
  const arrow = pop(seg(f, 22, 44));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={416} />
        <g filter="url(#wobble)">
          {/* 左: 頭の形 */}
          <rect x={200} y={300} width={540} height={520} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <HeadProfile x={458} y={560} s={0.72} bumps fill={KRP.blueSoft} />
          <g transform="translate(470 250)">
            <rect x={-130} y={-36} width={260} height={72} rx={12} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
              fill={KRP.ink}>頭の形</text>
          </g>
          {/* 右: 頭の中身 */}
          <rect x={1180} y={300} width={540} height={520} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <HeadProfile x={1438} y={560} s={0.72} fill={KRP.yellow} />
          {/* ※歯車は頭蓋 (脳) の内側だけに置くこと。HeadProfile のローカル座標で
              x -115〜100 / y -155〜-45 が安全圏。目・眉はローカル (72〜102, -58〜-35)
              にあるので、そこへ掛かると顔とぶつかる (作者ダメ出し #89)。
              world = (1438, 560) + local × 0.72。歯車の実半径は r×1.52 (歯の先端まで)。
              下の2つは local 中心 (-52,-100) r34 / (45,-108) r30 を換算したもの。 */}
          <Gear cx={1401} cy={488} r={24} f={f} speed={1} color={KRP.orange} />
          <Gear cx={1470} cy={482} r={21} f={f} speed={-1.4} color={KRP.blue} />
          <g transform={`translate(1450 250)`}>
            <rect x={-150} y={-36} width={300} height={72} rx={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
              fill={KRP.ink}>頭の中身</text>
          </g>
          {/* 矢印 */}
          {arrow > 0 && (
            <g transform={`translate(960 560) scale(${arrow})`}>
              <path d="M -130 -36 L 40 -36 L 40 -74 L 130 0 L 40 74 L 40 36 L -130 36 Z"
                fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} text="診断の対象が、うつりかわる" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #89 1905年ビネー、世界初の知能検査
const SceneBinet1905: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={417} />
      <g filter="url(#wobble)">
        <Ground y={800} />
        {/* 机 */}
        <rect x={820} y={640} width={700} height={44} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        <rect x={870} y={684} width={70} height={190} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1400} y={684} width={70} height={190} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
        {/* 検査用紙+羽ペン */}
        <TestSheet x={1160} y={500} s={1.12} rot={-3} />
        <g transform={`translate(1350 ${540 + Math.sin(f / 10) * 5}) rotate(24)`}>
          <path d="M 0 0 Q 26 -70 12 -148 Q -6 -92 -14 -16 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={0} y1={0} x2={6} y2={28} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* ビネー */}
        <Gent x={520} y={900} s={1.15} f={f} phase={0} coat={KRP.grayDark} glasses mustache
          face="smile" gaze={[4, -2]} hideArm="right" />
        <Arm x1={590} y1={740} x2={830} y2={600} cloth={KRP.grayDark} s={1.15} />
        <TagPlate x={520} y={520} text="心理学者ビネー" size={34} t={seg(f, 8, 26)} color={KRP.blueDeep} />
        <TagPlate x={1160} y={300} text="世界初の知能検査" size={38} t={seg(f, 26, 46)} color={KRP.red} />
      </g>
    </svg>
    <Stamp x={1480} y={200} text="1905年" size={58} />
    <LabelPill x={760} y={170} text="フランスで生まれた新しい検査" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #91/#92 きっかけは学校 (教室とついていけない子)
// ※この絵は2文で使う。move で動きを切り替える (作者要望 2026-10-30):
//   - #91「きっかけは、学校でした」  → move=false。まず教室をそのまま見せるだけ。右端の子も動かさない。
//   - #92「義務教育が広がり、…課題に」→ move=true。ここで初めて右端の子が取り残されて離れていく。
//   1文目から動かしてしまうと、2文目で見せたい「取り残される」の見せ場が先食いされる。
// ※右端の「ついていけない子」だけ、自分の机を置いたまま右へすーっと離れていく。
//   「消える」のではなく「取り残されて離れていく」絵にしたいので、画面外には出さず
//   380px でぴたりと止める。検品プレビューの f=60 で約240pxずれて、机からはっきり
//   離れた「離れていく途中」になる (150px だと机の右はしに座っているようにしか見えなかった)。
//   ぐるぐる・汗・スピード線も同じ away だけ一緒に動かすこと (子だけ動かすとバラける)。
// ※もう一つ大事なこと: 子どもは y=830 に立っていて、ふだんは机 (天板 y800) に
//   下半身が隠れている。横にずらすだけだと、机の脚の下はし (y954) より上に足が来るので
//   「宙に浮いて座っている」ように見えてしまった。なので離れる量に合わせて
//   drop (最大124px) ぶん下へ降ろし、机の脚と同じ床の線に足をつける。
//   ぐるぐる・汗・スピード線も同じ drop だけ下げること。
const SceneKyoushitsu: React.FC<{ f: number; move?: boolean }> = ({ f, move = true }) => {
  const away = move ? Math.min(380, Math.max(0, (f - 8) * 4.6)) : 0;
  const drop = (away / 380) * 124;
  return (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={418} />
      <g filter="url(#wobble)">
        <rect x={0} y={0} width={W} height={760} fill={KRP.paper} />
        <Ground y={760} />
        {/* 黒板 */}
        <rect x={420} y={230} width={1080} height={330} rx={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={420} y={548} width={1080} height={22} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
        <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.85} fill="none">
          <line x1={500} y1={310} x2={860} y2={310} />
          <line x1={500} y1={380} x2={780} y2={380} />
          <line x1={500} y1={450} x2={830} y2={450} />
          <circle cx={1150} cy={380} r={62} />
          <path d="M 1290 320 L 1420 320 M 1355 320 L 1355 450 M 1290 450 L 1420 450" />
        </g>
        {/* 机と子どもたち */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            {/* 右の子だけ away ぶん右へずらす。机 (下3つの rect) はその場に残す */}
            {i === 2 && away > 14 && (
              <g stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round"
                opacity={0.45 * clamp01((away - 14) / 40)}>
                <line x1={1320 + away - 150} y1={700 + drop} x2={1320 + away - 78} y2={700 + drop} />
                <line x1={1320 + away - 128} y1={742 + drop} x2={1320 + away - 66} y2={742 + drop} />
                <line x1={1320 + away - 156} y1={782 + drop} x2={1320 + away - 84} y2={782 + drop} />
              </g>
            )}
            <Kid x={480 + i * 420 + (i === 2 ? away : 0)} y={830 + (i === 2 ? drop : 0)} s={1.0} f={f} phase={i}
              shirt={[KRP.yellow, KRP.blue, KRP.green][i]} hair={i === 1 ? "okappa" : "bozu"}
              face={i === 2 ? "worried" : "smile"} gaze={i === 2 ? [0, 2] : [0, -2]} />
            <rect x={390 + i * 420} y={800} width={230} height={34} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
            <rect x={420 + i * 420} y={834} width={34} height={120} fill={KRP.copper} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={556 + i * 420} y={834} width={34} height={120} fill={KRP.copper} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ))}
        {/* 困っている子の上にぐるぐる (子と一緒に右へ流れる) */}
        <g transform={`translate(${1320 + away} ${620 + drop}) rotate(${f * 3})`} opacity={0.85}>
          <path d="M 0 0 m -40 0 a 40 40 0 1 1 80 0 a 32 32 0 1 1 -62 6 a 22 22 0 1 1 42 -4"
            fill="none" stroke={KRP.blueDeep} strokeWidth={6} strokeLinecap="round" />
        </g>
        <path d={`M ${1395 + away} ${585 + drop} q 12 18 -2 34`} fill="none" stroke={KRP.blue} strokeWidth={6} strokeLinecap="round"
          opacity={0.5 + 0.5 * Math.sin(f / 7)} />
      </g>
    </svg>
    <LabelPill x={960} y={170} text={move ? "みんなが、学校へ" : "きっかけは、学校"} centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
  );
};

// #92/#93 文部省の委員会 (decide=方針決定 / stuck=方法がない)
const Committee: React.FC<{ f: number; mode: "decide" | "stuck" }> = ({ f, mode }) => {
  const stuck = mode === "stuck";
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={stuck ? 420 : 419} />
        <g filter="url(#wobble)">
          <rect x={0} y={0} width={W} height={780} fill={KRP.paper} />
          <Ground y={780} />
          {/* 旗っぽい掲示 (文字なし・特定国旗にしない) */}
          <rect x={250} y={230} width={240} height={150} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <g stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" opacity={0.8}>
            <line x1={286} y1={278} x2={454} y2={278} />
            <line x1={286} y1={312} x2={420} y2={312} />
            <line x1={286} y1={346} x2={440} y2={346} />
          </g>
          {/* 委員たち (机のうしろ) */}
          <Gent x={560} y={760} s={1.02} f={f} phase={0} coat={KRP.blueDeep} mustache
            face={stuck ? "worried" : "normal"} gaze={[2, -1]} hideArm="both" />
          <Gent x={960} y={755} s={1.05} f={f} phase={1} coat={KRP.grayDark} glasses
            face={stuck ? "worried" : "smile"} gaze={[0, -1]} hideArm={stuck ? "both" : "right"} />
          <Gent x={1360} y={760} s={1.02} f={f} phase={2} coat={KRP.bronze} mustache glasses
            face={stuck ? "worried" : "normal"} gaze={[-2, -1]} hideArm="both" />
          {!stuck && <Arm x1={1024} y1={610} x2={1120} y2={470} cloth={KRP.grayDark} s={1.05} />}
          {/* 長机 */}
          <rect x={330} y={620} width={1260} height={48} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          <rect x={370} y={668} width={1180} height={212} rx={8} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 机上の書類 */}
          <TestSheet x={620} y={596} s={0.42} rot={-7} />
          <TestSheet x={1270} y={598} s={0.42} rot={5} />
          {stuck && (
            <g>
              <TestSheet x={450} y={856} s={0.5} rot={-18} />
              <TestSheet x={1490} y={866} s={0.5} rot={14} />
              {/* ※QMark の y は「?」のベースライン。字の上端はおよそ y - 94×s、
                  さらに上下に±6px ふわふわ揺れる。上部テロップ帯 (y 140〜200) に
                  食い込まないよう、どの ? も y - 94×s - 6 > 200 を守ること。
                  真ん中が一番大きく高い配置はそのまま、全体を下げて逃がした (作者ダメ出し #94)。 */}
              <QMark x={620} y={410} s={0.9} t={seg(f, 8, 24)} f={f} phase={0} />
              <QMark x={1010} y={370} s={1.1} t={seg(f, 18, 34)} f={f} phase={1} />
              <QMark x={1390} y={420} s={0.9} t={seg(f, 28, 44)} f={f} phase={2} />
            </g>
          )}
        </g>
        {!stuck && (
          <Bubble x={1330} y={330} w={560} h={230} t={seg(f, 10, 30)} tailTo={[1140, 560]}>
            <text x={0} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42}
              fill={KRP.ink}>支援が必要な子を、</text>
            <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42}
              fill={KRP.ink}>早く見つけよう</text>
          </Bubble>
        )}
      </svg>
      <LabelPill x={stuck ? 960 : 620} y={170}
        text={stuck ? "ところが、見つける方法がない" : "文部省の委員会"} centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #94 ビネーとシモン、検査を自作
const SceneJisaku: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={421} />
      <g filter="url(#wobble)">
        <rect x={0} y={0} width={W} height={790} fill={KRP.paper} />
        <Ground y={790} />
        {/* 作業机 */}
        <rect x={430} y={640} width={1060} height={46} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        <rect x={480} y={686} width={960} height={200} rx={8} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 散らばる紙+はさみ */}
        <TestSheet x={760} y={590} s={0.52} rot={-10} />
        <TestSheet x={1000} y={580} s={0.56} rot={4} />
        <TestSheet x={1230} y={596} s={0.5} rot={14} />
        <g transform="translate(1390 600) rotate(30)">
          <circle cx={-14} cy={26} r={14} fill="none" stroke={KRP.ink} strokeWidth={6} />
          <circle cx={14} cy={26} r={14} fill="none" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -10 14 L 10 -52 M 10 14 L -10 -52" stroke={KRP.silver} strokeWidth={9} strokeLinecap="round" />
          <path d="M -10 14 L 10 -52 M 10 14 L -10 -52" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" />
        </g>
        {/* ビネー (左) + シモン (右・白衣) */}
        <Gent x={620} y={770} s={1.05} f={f} phase={0} coat={KRP.grayDark} glasses mustache
          face="smile" gaze={[3, -1]} hideArm="right" />
        <Arm x1={688} y1={624} x2={860} y2={560} cloth={KRP.grayDark} s={1.05} />
        <Gent x={1320} y={770} s={1.05} f={f} phase={1} coat={KRP.white} mustache
          face="smile" gaze={[-3, -1]} hideArm="left" />
        <Arm x1={1252} y1={624} x2={1090} y2={566} cloth={KRP.white} s={1.05} />
        <TagPlate x={620} y={400} text="ビネー" size={32} t={seg(f, 8, 24)} color={KRP.blueDeep} />
        <TagPlate x={1320} y={400} text="医師シモン" size={32} t={seg(f, 16, 32)} color={KRP.blueDeep} />
        <Spark cx={960} cy={420} s={0.8} o={0.5 + 0.5 * Math.sin(f / 7)} />
      </g>
    </svg>
    <LabelPill x={960} y={170} text="ないなら、自分たちで作る" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #95 やさしい問題から順に (階段とつまずき)
const SceneKaidan: React.FC<{ f: number }> = ({ f }) => {
  const stepT = (i: number) => pop(seg(f, 4 + i * 7, 22 + i * 7));
  // のぼる → 3段目のかどで足をひっかける → ぺたんとおしりをつく、までを f で演じる。
  // 転んだ子を笑う絵にしないため、痛そうな表現はせず、表情は「あれ?」でとめる。
  const walk = easeOut(seg(f, 44, 82));
  const trip = seg(f, 82, 96);
  const fall = easeOut(seg(f, 96, 118));
  const settle = easeOut(seg(f, 118, 134));
  const kx = walk < 0.5
    ? lerp(445, 705, walk * 2)
    : lerp(705, 1004, (walk - 0.5) * 2) + lerp(0, 48, trip) - lerp(0, 44, fall);
  const ky = walk < 0.5
    ? lerp(760, 650, walk * 2) - Math.abs(Math.sin(walk * 2 * Math.PI)) * 15
    : lerp(650, 540, (walk - 0.5) * 2) - Math.abs(Math.sin((walk - 0.5) * 2 * Math.PI)) * 15;
  const kRot = lerp(0, 56, easeOut(trip)) + lerp(0, -70, fall) + lerp(0, 10, settle);
  const kSink = lerp(0, 44, fall) - lerp(0, 6, settle);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={422} />
        <g filter="url(#wobble)">
          <Ground y={880} />
          {/* のぼり階段 (5段) */}
          {[0, 1, 2, 3, 4].map((i) => {
            const t = stepT(i);
            if (t <= 0) return null;
            const x = 330 + i * 260;
            const top = 760 - i * 110;
            return (
              <g key={i} transform={`translate(${x + 115} ${top + (880 - top) / 2}) scale(${t}) translate(${-(x + 115)} ${-(top + (880 - top) / 2)})`}>
                <rect x={x} y={top} width={230} height={880 - top} fill={i === 4 ? KRP.yellow : KRP.blueSoft}
                  stroke={KRP.ink} strokeWidth={5.5} />
                {/* 段上の問題カード */}
                <g transform={`translate(${x + 115} ${top - 64})`}>
                  <rect x={-58} y={-46} width={116} height={92} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
                  {i === 0 && <circle cx={0} cy={0} r={22} fill="none" stroke={KRP.blueDeep} strokeWidth={5} />}
                  {i === 1 && <path d="M -22 18 L 0 -20 L 22 18 Z" fill="none" stroke={KRP.orange} strokeWidth={5} />}
                  {i === 2 && <path d="M -24 -14 L 24 -14 M -24 10 L 10 10" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />}
                  {i === 3 && <path d="M -20 14 L -4 -16 L 6 2 L 22 -18" fill="none" stroke={KRP.green} strokeWidth={5} strokeLinecap="round" />}
                  {i === 4 && <path d="M -22 16 L 22 16 M -22 16 L -22 -12 L 8 -12 M 8 -12 L 8 16" fill="none" stroke={KRP.red} strokeWidth={5} />}
                </g>
              </g>
            );
          })}
          {/* ひっかかった段かどを光らせる */}
          {trip > 0 && (
            <g opacity={clamp01(Math.min(trip * 3, (1 - fall) * 2 + 0.35))}>
              <circle cx={1110} cy={430} r={30 + trip * 16} fill="none" stroke={KRP.red}
                strokeWidth={6} strokeDasharray="10 12" strokeDashoffset={-f * 1.4} />
            </g>
          )}
          {/* のぼって、つまずいて、ぺたんと座る子 */}
          <g transform={`translate(${kx} ${ky + kSink}) rotate(${kRot}) translate(${-kx} ${-(ky + kSink)})`}>
            <Kid x={kx} y={ky + kSink} s={1.05} f={f} phase={0} shirt={KRP.yellow}
              face={trip > 0 ? "surprised" : "smile"} gaze={[2, trip > 0 ? -1 : 0]} />
          </g>
          {/* 転んだ瞬間のぽんっという煙 (痛そうにしない) */}
          {[0, 1, 2].map((i) => {
            const pt = seg(f, 112 + i * 3, 138 + i * 3);
            if (pt <= 0 || pt >= 1) return null;
            const dir = i === 0 ? -1 : i === 1 ? 1 : -0.4;
            return (
              <circle key={i} cx={kx + dir * (46 + pt * 54)} cy={ky + kSink - pt * 26}
                r={12 + pt * 16} fill="none" stroke={KRP.grayDark} strokeWidth={4.5} opacity={(1 - pt) * 0.8} />
            );
          })}
          {/* 「あれ?」のひとこと */}
          <path d={`M ${kx + 74} ${ky + kSink - 250} q 14 16 0 32`} fill="none" stroke={KRP.blue} strokeWidth={6}
            strokeLinecap="round" opacity={clamp01(trip * 2) * (0.5 + 0.5 * Math.sin(f / 7))} />
          <TagPlate x={610} y={352} text="ここでつまずく" size={30} t={seg(f, 118, 136)} color={KRP.red} />
          <path d={`M 744 352 Q ${(744 + kx) / 2} ${392} ${kx - 62} ${ky + kSink - 118}`} fill="none"
            stroke={KRP.red} strokeWidth={5} strokeLinecap="round" strokeDasharray="12 12"
            opacity={clamp01(seg(f, 124, 142)) * 0.9} />
          <TagPlate x={610} y={424} text="つまずいた所が、その子の今" size={26} t={seg(f, 134, 152)} color={KRP.blueDeep} />
          {/* 方向ラベル */}
          <TagPlate x={420} y={840} text="やさしい" size={30} t={stepT(0)} />
          <TagPlate x={1510} y={300} text="むずかしい" size={30} t={stepT(4)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="どのあたりで、つまずくかを見る" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #96 目的は序列ではなく支援
const SceneShien: React.FC<{ f: number }> = ({ f }) => {
  const okT = pop(seg(f, 30, 50));
  const ngT = pop(seg(f, 10, 30));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={423} />
        <g filter="url(#wobble)">
          <line x1={960} y1={250} x2={960} y2={900} stroke={KRP.ink} strokeWidth={4} strokeDasharray="14 16" opacity={0.4} />
          {/* 左: 序列 (×) */}
          <g opacity={0.9}>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={300 + i * 130} y={700 - i * 70} width={110} height={130 + i * 70}
                  fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} opacity={0.8} />
                <circle cx={355 + i * 130} cy={660 - i * 70} r={30} fill={SKIN} stroke={KRP.ink} strokeWidth={4.5} />
                <path d={`M ${325 + i * 130} ${648 - i * 70} Q ${330 + i * 130} ${628 - i * 70} ${355 + i * 130} ${628 - i * 70} Q ${380 + i * 130} ${628 - i * 70} ${385 + i * 130} ${648 - i * 70} Z`} fill={KRP.ink} />
              </g>
            ))}
            {ngT > 0 && (
              <g transform={`translate(490 560) scale(${ngT})`}>
                <circle cx={0} cy={0} r={110} fill="none" stroke={KRP.red} strokeWidth={0} />
                <g stroke={KRP.red} strokeWidth={22} strokeLinecap="round">
                  <line x1={-85} y1={-85} x2={85} y2={85} />
                  <line x1={85} y1={-85} x2={-85} y2={85} />
                </g>
              </g>
            )}
            <TagPlate x={490} y={866} text="序列をつける" size={32} t={ngT} />
          </g>
          {/* 右: 支援 (○) */}
          <g>
            <Lady x={1280} y={820} s={1.0} f={f} phase={0} dress={KRP.blueDeep} face="smile"
              gaze={[3, 1]} hideArm="right" />
            <Arm x1={1335} y1={680} x2={1455} y2={620} cloth={KRP.blueDeep} />
            <Kid x={1540} y={820} s={1.02} f={f} phase={1} shirt={KRP.yellow} face="smile" gaze={[-3, -1]} />
            {okT > 0 && (
              <circle cx={1420} cy={540} r={100 * okT} fill="none" stroke={KRP.green} strokeWidth={20} />
            )}
            <TagPlate x={1420} y={866} text="支援につなげる" size={32} t={okT} color={KRP.green} />
            <Spark cx={1620} cy={600} s={0.7} o={clamp01(okT) * (0.5 + 0.5 * Math.sin(f / 7))} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} text="目的は、支援" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #97 ビネーは書き残した (ランプの机で執筆)
const SceneBinetKaku: React.FC<{ f: number }> = ({ f }) => {
  const glow = 0.25 + 0.1 * Math.sin(f / 9);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={424} />
        <g filter="url(#wobble)">
          <rect x={0} y={0} width={W} height={800} fill={KRP.paper} />
          <Ground y={800} />
          {/* 本棚 */}
          <rect x={180} y={240} width={360} height={560} fill={KRP.copper} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <line x1={180} y1={420 + r * 180} x2={540} y2={420 + r * 180} stroke={KRP.ink} strokeWidth={5} />
              {[0, 1, 2, 3, 4].map((b) => (
                <rect key={b} x={210 + b * 62} y={300 + r * 180} width={44} height={116} rx={4}
                  fill={[KRP.red, KRP.blue, KRP.green, KRP.yellow, KRP.blueDeep][(b + r) % 5]}
                  stroke={KRP.ink} strokeWidth={4} />
              ))}
            </g>
          ))}
          {/* ランプのあかり */}
          <circle cx={1430} cy={520} r={260} fill={KRP.yellow} opacity={glow} />
          {/* 机 */}
          <rect x={760} y={660} width={900} height={46} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          <rect x={810} y={706} width={800} height={190} rx={8} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
          {/* ランプ */}
          <rect x={1390} y={600} width={80} height={24} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={1420} y={540} width={20} height={64} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1370 548 Q 1430 480 1490 548 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
          {/* 紙+ペンを持つビネー */}
          <TestSheet x={1120} y={600} s={0.6} rot={-4} />
          <Gent x={930} y={790} s={1.05} f={f} phase={0} coat={KRP.grayDark} glasses mustache
            face="normal" gaze={[3, 2]} hideArm="right" />
          <Arm x1={995} y1={645} x2={1080 + Math.sin(f / 5) * 14} y2={568} cloth={KRP.grayDark} s={1.05} />
          <g transform={`translate(${1090 + Math.sin(f / 5) * 14} 560) rotate(36)`}>
            <path d="M 0 0 Q 22 -58 10 -120 Q -6 -74 -12 -14 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} text="ビネー本人は、こう書き残した" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #98 「残忍な悲観論だ」の引用カード
const SceneZannin: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 6, 30));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={425} />
        <g filter="url(#wobble)" opacity={t}>
          {/* ※このシーンは上部テロップを出さない (作者指示 #99)。字幕のかわりに
              この引用枠そのものが主役なので、枠は画面中央 (横 230〜1690 = 中心960 /
              縦 240〜780 = 中心510) いっぱいに取ってある。下の似顔 (y=880・半径74 →
              上端806) と当たらないよう、枠の下端は 790 より上に収めること。 */}
          <g transform={`translate(0 ${(1 - t) * 24}) rotate(${Math.sin(f / 22) * 0.6} 960 540)`}>
            <rect x={230} y={240} width={1460} height={540} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <path d="M 300 322 q 0 -38 40 -38 q -20 11 -13 38 Z M 360 322 q 0 -38 40 -38 q -20 11 -13 38 Z"
              fill={KRP.grayDark} />
          </g>
          {/* ビネーの似顔 (左下) */}
          <g transform="translate(430 880)">
            <circle cx={0} cy={0} r={74} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M -72 -16 Q -64 -72 0 -72 Q 64 -72 72 -16 Q 36 -42 0 -42 Q -36 -42 -72 -16 Z" fill={KRP.ink} />
            <circle cx={-24} cy={-4} r={6} fill={KRP.ink} />
            <circle cx={24} cy={-4} r={6} fill={KRP.ink} />
            <g fill="none" stroke={KRP.ink} strokeWidth={4}>
              <circle cx={-24} cy={-4} r={18} />
              <circle cx={24} cy={-4} r={18} />
            </g>
            <path d="M -20 32 Q 0 24 20 32 Q 10 40 0 39 Q -10 40 -20 32 Z" fill={KRP.ink} />
          </g>
          <TagPlate x={600} y={880} text="ビネー" size={30} t={seg(f, 26, 42)} color={KRP.blueDeep} />
        </g>
      </svg>
      {/* 引用文 (div。にじませず読みやすく)。
          ※枠 (縦 240〜780) の中央にそろえてある。2行 × fontSize 76 × lineHeight 1.6
          = 243px なので top = 510 - 243/2 ≒ 388。横は枠と同じ 230 幅1460 の中央そろえ。
          いちばん長い行は「という考えは、残忍な悲観論だ」」の15文字 ≒ 1140px で、
          左右に 160px ずつ余白が残る。文字を大きくするならここを再計算すること。 */}
      <div style={{
        position: "absolute", left: 230, top: 388, width: 1460, opacity: t, textAlign: "center",
        fontFamily: FONT, fontWeight: 900, fontSize: 76, lineHeight: 1.6, color: KRP.ink,
      }}>
        「知能は変わらない固定量だ、
        <br />
        という考えは、<span style={{ color: KRP.red }}>残忍な悲観論だ</span>」
      </div>
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #99 ひとつの数字で決めつけるな (子どもと伸びる芽)
const SceneKimetsukeruNa: React.FC<{ f: number }> = ({ f }) => {
  const ngT = pop(seg(f, 8, 28));
  const growT = easeOut(seg(f, 26, 54));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={426} />
        <g filter="url(#wobble)">
          <Ground y={840} />
          <Kid x={960} y={840} s={1.3} f={f} phase={0} shirt={KRP.yellow} face="smile" gaze={[0, -2]} />
          {/* 左: 数字の札に× */}
          {ngT > 0 && (
            <g transform={`translate(430 480) rotate(-8) scale(${ngT})`}>
              <rect x={-170} y={-110} width={340} height={220} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              {/* 札の幅 340 に7文字。はみ出さないよう 44 にしてある */}
              <text x={0} y={-18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
                fill={KRP.grayDark}>ひとつの数字で</text>
              <text x={0} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
                fill={KRP.grayDark}>決めつける</text>
              <g stroke={KRP.red} strokeWidth={20} strokeLinecap="round" opacity={0.9}>
                <line x1={-150} y1={-92} x2={150} y2={92} />
                <line x1={150} y1={-92} x2={-150} y2={92} />
              </g>
            </g>
          )}
          {/* 右: 可能性の芽がのびる */}
          <g transform="translate(1430 700)">
            <path d={`M 0 60 Q ${-12} ${60 - 150 * growT} 6 ${60 - 260 * growT}`}
              fill="none" stroke={KRP.green} strokeWidth={13} strokeLinecap="round" />
            {growT > 0.4 && (
              <g transform={`translate(6 ${60 - 260 * growT}) scale(${clamp01((growT - 0.4) / 0.4)})`}>
                <path d="M 0 0 Q -56 -14 -64 -66 Q -10 -58 0 0 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
                <path d="M 0 0 Q 56 -14 64 -66 Q 10 -58 0 0 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
              </g>
            )}
            <path d="M -70 60 Q 0 96 70 60 L 54 120 L -54 120 Z" fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
            <TagPlate x={0} y={190} text="可能性はのびる" size={30} t={clamp01(growT * 1.6 - 0.4)} color={KRP.green} />
          </g>
          <Spark cx={1570} cy={360} s={0.8} o={clamp01(growT * 1.4 - 0.4) * (0.5 + 0.5 * Math.sin(f / 7))} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="子どもの可能性を、決めつけない" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #100/#101 IQはビネーの発明ではない
const SceneIQBetsujin: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 6, 28));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={427} />
        <g filter="url(#wobble)">
          {/* 大きなIQメダル */}
          <g transform={`translate(560 490) scale(${0.7 + 0.3 * t}) rotate(${Math.sin(f / 16) * 2})`}>
            <circle cx={0} cy={0} r={210} fill={KRP.brass} stroke={KRP.ink} strokeWidth={8} />
            <circle cx={0} cy={0} r={168} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5.5} />
            <text x={0} y={56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={160}
              fill={KRP.ink}>IQ</text>
          </g>
          {/* ≠ */}
          <g stroke={KRP.red} strokeWidth={18} strokeLinecap="round" opacity={pop(seg(f, 20, 40))}>
            <line x1={870} y1={440} x2={1050} y2={440} />
            <line x1={870} y1={530} x2={1050} y2={530} />
            <line x1={1010} y1={380} x2={910} y2={590} />
          </g>
          {/* ビネーの似顔+あとの学者たち */}
          <g transform="translate(1250 430)">
            <circle cx={0} cy={0} r={66} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M -64 -14 Q -58 -64 0 -64 Q 58 -64 64 -14 Q 32 -38 0 -38 Q -32 -38 -64 -14 Z" fill={KRP.ink} />
            <g fill="none" stroke={KRP.ink} strokeWidth={4}>
              <circle cx={-22} cy={-2} r={16} />
              <circle cx={22} cy={-2} r={16} />
            </g>
            <circle cx={-22} cy={-2} r={5.5} fill={KRP.ink} />
            <circle cx={22} cy={-2} r={5.5} fill={KRP.ink} />
            <path d="M -18 30 Q 0 22 18 30 Q 9 37 0 36 Q -9 37 -18 30 Z" fill={KRP.ink} />
          </g>
          <TagPlate x={1250} y={560} text="ビネーの発明ではない" size={30} t={seg(f, 28, 46)} color={KRP.red} />
          {/* 磨く学者たち */}
          <Gent x={1480} y={900} s={0.92} f={f} phase={1} coat={KRP.blueDeep} glasses
            face="smile" gaze={[2, -2]} hideArm="right" />
          <Arm x1={1535} y1={765} x2={1620 + Math.sin(f / 5) * 12} y2={700} cloth={KRP.blueDeep} s={0.92} />
          <Gent x={1750} y={898} s={0.88} f={f} phase={2} coat={KRP.green} mustache
            face="smile" gaze={[-2, -2]} hideArm="left" />
          <Arm x1={1692} y1={775} x2={1640 + Math.sin(f / 5 + 2) * 12} y2={706} cloth={KRP.green} s={0.88} />
          <g transform={`translate(1636 740) rotate(${Math.sin(f / 5) * 8})`}>
            <rect x={-54} y={-30} width={108} height={60} rx={10} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>IQ</text>
          </g>
          <TagPlate x={1620} y={580} text="あとの学者が整えた" size={28} t={seg(f, 38, 56)} />
          <Spark cx={1700} cy={660} s={0.6} o={0.5 + 0.5 * Math.sin(f / 6)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="有名な「IQ」は、別の人の仕上げ" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #102 やさしい道具が出発点
const SceneYasashiiDougu: React.FC<{ f: number }> = ({ f }) => {
  const glow = 0.3 + 0.12 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={428} />
        <g filter="url(#wobble)">
          <Ground y={840} />
          <circle cx={960} cy={480} r={300} fill={KRP.yellow} opacity={glow} />
          <circle cx={960} cy={480} r={200} fill={KRP.yellow} opacity={glow * 0.8} />
          <TestSheet x={960} y={480} s={1.5} heart />
          <Lady x={480} y={880} s={1.05} f={f} phase={0} dress={KRP.blueDeep} face="smile"
            gaze={[4, -2]} hideArm="right" />
          <Arm x1={535} y1={735} x2={720} y2={600} cloth={KRP.blueDeep} s={1.05} />
          <Kid x={1460} y={890} s={1.08} f={f} phase={1} shirt={KRP.yellow} face="smile" gaze={[-4, -2]} />
          <Spark cx={700} cy={300} s={0.8} o={0.5 + 0.5 * Math.sin(f / 7)} />
          <Spark cx={1240} cy={280} s={0.7} color={KRP.orange} o={0.5 + 0.5 * Math.sin(f / 7 + 2)} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="出発点は、やさしい道具" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #103 海を渡って別の顔に
const SceneUmiWataru: React.FC<{ f: number }> = ({ f }) => {
  const sail = easeOut(seg(f, 0, 58));
  const shipX = lerp(430, 1280, sail);
  const shipY = 620 + Math.sin(f / 10) * 8;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={429} />
        <g filter="url(#wobble)">
          {/* 海 */}
          <rect x={0} y={660} width={W} height={420} fill={KRP.blueSoft} />
          <line x1={0} y1={660} x2={W} y2={660} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M ${120 + i * 310 + Math.sin(f / 12 + i) * 16} ${760 + (i % 3) * 80} q 40 -24 80 0`}
              fill="none" stroke={KRP.blueDeep} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
          ))}
          {/* 両岸 */}
          <path d="M 0 660 L 300 660 Q 240 560 150 540 L 0 520 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M 1920 660 L 1620 660 Q 1690 560 1780 540 L 1920 520 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
          <TagPlate x={170} y={450} text="フランス" size={30} />
          <TagPlate x={1760} y={450} text="アメリカ" size={30} />
          {/* 航路 */}
          <path d="M 300 620 Q 960 520 1620 620" fill="none" stroke={KRP.ink} strokeWidth={4.5}
            strokeDasharray="4 26" strokeLinecap="round" opacity={0.6} />
          {/* 蒸気船+大きな検査用紙 */}
          <g transform={`translate(${shipX} ${shipY})`}>
            <TestSheet x={0} y={-250} s={1.0} rot={Math.sin(f / 10) * 3} heart />
            <path d="M -180 -10 L 180 -10 L 130 70 L -130 70 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-70} y={-80} width={140} height={70} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-20} y={-150} width={44} height={74} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            {/* 煙 */}
            {[0, 1, 2].map((i) => {
              const pt = ((f * 1.6 + i * 34) % 100) / 100;
              return (
                <circle key={i} cx={2 - pt * 90} cy={-170 - pt * 90} r={12 + pt * 16}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} opacity={0.8 - pt * 0.7} />
              );
            })}
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} text="海を渡って、別の顔に" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===================================================================
// 第6章 (#104〜#119): Army Alpha/Beta = 加速
// ===================================================================

// #104 章扉: 整列した兵士たち+降りそそぐ検査用紙
const SceneCh6Door: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 6, 36));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={430} />
        <g filter="url(#wobble)" opacity={t}>
          <Ground y={800} />
          {/* 兵士の隊列 (左半分) */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <Mob key={`${row}-${col}`} x={220 + col * 190 + row * 46} y={640 + row * 110}
                s={0.78 + row * 0.14} f={f} phase={row * 4 + col} cap
                color={[KRP.green, KRP.blue, KRP.bronze][row]} />
            )),
          )}
          {/* 空からふわふわ降る検査用紙 */}
          {[0, 1, 2].map((i) => {
            const fall = ((f * 1.1 + i * 90) % 260) / 260;
            return (
              <TestSheet key={i} x={360 + i * 300} y={150 + fall * 330} s={0.44}
                kind={i % 2 === 0 ? "alpha" : "beta"} rot={-14 + i * 12 + Math.sin(f / 9 + i) * 6} />
            );
          })}
          <Spark cx={1030} cy={300} s={0.8} o={0.5 + 0.5 * Math.sin(f / 7)} />
        </g>
      </svg>
      <ChapterTitle num={6} title="175万人の、一斉テスト。" t={easeOut(seg(f, 14, 44))} left={1040} width={820} />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===================================================================
// 星条旗 (小さくても正確に: 13本の赤白しま / 左上のカントン / 9段の星 6-5-6-5…)
// w=旗の幅。旗じたいは (0,0) を左上として描く。風でゆっくり波うつ。
// ===================================================================
const star5 = (r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.382;
    const a = (-90 + i * 36) * (Math.PI / 180);
    pts.push(`${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;
};

const UsFlag: React.FC<{ x: number; y: number; w: number; f?: number }> = ({ x, y, w, f = 0 }) => {
  const h = w * 0.6484; // 公式比 1:1.9
  const stripe = h / 13;
  const cantonW = w * 0.76 / 1.9; // 公式: 幅の 2/5
  const cantonH = stripe * 7;
  const wave = Math.sin(f / 12) * 2.5;
  return (
    <g transform={`translate(${x} ${y}) skewY(${wave * 0.5})`}>
      <rect x={0} y={0} width={w} height={h} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={0} y={i * 2 * stripe} width={w} height={stripe} fill={KRP.red} />
      ))}
      <rect x={0} y={0} width={cantonW} height={cantonH} fill={KRP.blueDeep} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((row) => {
        const n = row % 2 === 0 ? 6 : 5;
        const gap = cantonW / 12;
        return [...Array(n)].map((_, c) => (
          <path key={`${row}-${c}`} d={star5(stripe * 0.3)} fill={KRP.white}
            transform={`translate(${gap * (row % 2 === 0 ? 1 + c * 2 : 2 + c * 2)} ${(cantonH / 10) * (row + 1)})`} />
        ));
      })}
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

// #105 第一次世界大戦・アメリカ軍の巨大な悩み (塹壕・鉄条網・大勢の新兵と将校)
const SceneWW1Nayami: React.FC<{ f: number }> = ({ f }) => {
  const pile = easeOut(seg(f, 6, 34));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={431} />
        <g filter="url(#wobble)">
          {/* 遠くの煙 (丘のむこうから立ちのぼる。血なまぐさい描写はしない) */}
          {[
            { cx: 300, r: 1.0, ph: 0 }, { cx: 1180, r: 0.86, ph: 3 },
            { cx: 1560, r: 0.72, ph: 5 }, { cx: 1856, r: 0.62, ph: 7 },
          ].map((p) => (
            <g key={p.cx} opacity={0.3}>
              {[0, 1, 2, 3, 4].map((i) => (
                <circle key={i} cx={p.cx + Math.sin((f + p.ph * 19 + i * 34) / 26) * (6 + i * 5)}
                  cy={520 - i * 44 * p.r} r={(18 + i * 7) * p.r}
                  fill={KRP.gray} stroke={KRP.grayDark} strokeWidth={3} />
              ))}
            </g>
          ))}
          {/* 遠景のなだらかな丘 */}
          <path d="M -20 540 Q 300 468 620 536 Q 980 470 1340 534 Q 1660 480 1940 530 L 1940 640 L -20 640 Z"
            fill={KRP.paper} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          <Ground y={790} />
          {/* 鉄条網 (杭 + とげつきの線) */}
          {[70, 290, 510, 730, 950, 1170, 1390, 1610, 1830].map((px) => (
            <line key={px} x1={px} y1={632} x2={px} y2={556} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          ))}
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <path d={`M 70 ${574 + r * 20} Q 500 ${562 + r * 20} 950 ${576 + r * 20} Q 1400 ${590 + r * 20} 1830 ${572 + r * 20}`}
                fill="none" stroke={KRP.grayDark} strokeWidth={4} />
              {[180, 400, 620, 840, 1060, 1280, 1500, 1720].map((bx) => (
                <g key={bx} transform={`translate(${bx} ${572 + r * 20})`}>
                  <line x1={-9} y1={-9} x2={9} y2={9} stroke={KRP.grayDark} strokeWidth={3.5} />
                  <line x1={9} y1={-9} x2={-9} y2={9} stroke={KRP.grayDark} strokeWidth={3.5} />
                </g>
              ))}
            </g>
          ))}
          {/* 塹壕の中に並ぶ新兵たち (当時の略帽) */}
          {[
            [120, 0.6], [238, 0.58], [352, 0.62], [470, 0.58],
            [592, 0.61], [706, 0.57], [824, 0.6],
          ].map(([mx, ms], i) => (
            <Mob key={mx} x={mx} y={700} s={ms} f={f} phase={i * 3} cap
              color={[KRP.green, KRP.bronze, KRP.grayDark][i % 3]} />
          ))}
          {/* 塹壕のふち (土のう) */}
          <rect x={-20} y={690} width={980} height={64} rx={14} fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ellipse key={i} cx={30 + i * 110} cy={690} rx={58} ry={26}
              fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {/* 星条旗 (小さいが、しま13本・星50個まできっちり) */}
          <line x1={168} y1={790} x2={168} y2={378} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <circle cx={168} cy={372} r={11} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <UsFlag x={172} y={386} w={236} f={f} />
          {/* 入隊名簿の山 */}
          <g transform={`translate(1430 ${lerp(880, 700, pile)})`} opacity={pile}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={-206 + (i % 3) * 16 - 8} y={48 - i * 40} width={392} height={42} rx={7}
                fill={i % 2 === 0 ? KRP.white : KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
            ))}
            <TestSheet x={62} y={-162} s={0.54} rot={9} />
            <TestSheet x={-126} y={-170} s={0.5} rot={-11} />
          </g>
          <TagPlate x={1430} y={330} text="新兵がどんどん集まる" size={32} t={seg(f, 28, 46)} color={KRP.blueDeep} />
          {/* 手前に押しよせる新兵の列 */}
          {[
            [980, 0.84, 0], [1098, 0.8, 1], [1210, 0.86, 2],
            [1680, 0.82, 3], [1800, 0.86, 4], [1890, 0.78, 5],
          ].map(([mx, ms, ph]) => (
            <Mob key={mx} x={mx} y={858} s={ms} f={f} phase={ph as number} cap worried
              color={[KRP.green, KRP.bronze, KRP.blue][(ph as number) % 3]} />
          ))}
          {/* 悩む将校 */}
          <Gent x={620} y={880} s={1.08} f={f} phase={0} coat={KRP.green} pants={KRP.green} hatKind="army"
            mustache face="worried" gaze={[4, -1]} />
          {/* 汗 */}
          <path d={`M 702 ${614 + Math.sin(f / 7) * 5} q 13 18 -2 34`} fill="none" stroke={KRP.blue}
            strokeWidth={6} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f / 7)} />
          <QMark x={820} y={420} s={0.95} t={seg(f, 20, 36)} f={f} phase={1} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="第一次世界大戦・アメリカの巨大な悩み" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===================================================================
// 新兵 (うしろ姿)。顔は描かない。手前は大きく、奥は小さく並べて奥行きを出す。
// ===================================================================
const RecruitBack: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number; color?: string;
}> = ({ x, y, s = 1, f = 0, phase = 0, color = KRP.green }) => {
  const sway = Math.sin((f + phase * 21) / 14);
  return (
    <g transform={`translate(${x + sway * 3} ${y}) scale(${s}) rotate(${sway * 1.6})`}>
      {/* 足 */}
      <rect x={-19} y={-26} width={15} height={26} rx={5} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
      <rect x={5} y={-26} width={15} height={26} rx={5} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
      {/* 外とう (うしろ) */}
      <path d="M -32 -24 L -28 -98 Q 0 -108 28 -98 L 32 -24 Z" fill={color} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={0} y1={-98} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
      {/* 背のう */}
      <rect x={-21} y={-88} width={42} height={40} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
      <line x1={-21} y1={-70} x2={21} y2={-70} stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
      {/* 首とうしろ頭 */}
      <rect x={-9} y={-112} width={18} height={14} fill={SKIN} stroke={KRP.ink} strokeWidth={3.5} />
      <circle cx={0} cy={-134} r={25} fill={SKIN} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 当時の略帽 */}
      <path d="M -25 -144 Q -22 -166 0 -166 Q 22 -166 25 -144 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-27} y={-148} width={54} height={8} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

// 行き先の小さな看板 (砲兵 / 通信 / 整備)。奥にあるので小さいが、中身はきっちり描く。
const DestSign: React.FC<{
  x: number; y: number; s: number; kind: "gun" | "radio" | "fix"; label: string;
}> = ({ x, y, s, kind, label }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={-6} y1={54} x2={-6} y2={132} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
    <line x1={6} y1={54} x2={6} y2={132} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
    <rect x={-150} y={-54} width={300} height={110} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    {kind === "gun" && (
      <g transform="translate(-96 4)">
        {/* 野砲: 砲身・防盾・車輪・架尾 */}
        <line x1={-18} y1={6} x2={-46} y2={26} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <rect x={-16} y={-30} width={54} height={14} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4}
          transform="rotate(-22 -16 -23)" />
        <path d="M -20 -14 L 16 -14 L 16 10 L -20 10 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-2} cy={18} r={17} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-2} cy={18} r={4} fill={KRP.ink} />
      </g>
    )}
    {kind === "radio" && (
      <g transform="translate(-96 4)">
        {/* 野戦電話: 箱・受話器・電波 */}
        <rect x={-26} y={-10} width={52} height={38} rx={6} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-12} cy={10} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        <line x1={6} y1={-10} x2={6} y2={-34} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${12 + i * 9} ${-34 - i * 6} a ${10 + i * 9} ${10 + i * 9} 0 0 1 0 ${20 + i * 12}`}
            fill="none" stroke={KRP.blueDeep} strokeWidth={4} strokeLinecap="round" />
        ))}
      </g>
    )}
    {kind === "fix" && (
      <g transform="translate(-96 4)">
        {/* 整備: 歯車とスパナ */}
        <Gear cx={-10} cy={4} r={24} color={KRP.grayDark} />
        <circle cx={26} cy={-22} r={11} fill="none" stroke={KRP.silver} strokeWidth={8} />
        <line x1={32} y1={-13} x2={54} y2={16} stroke={KRP.silver} strokeWidth={11} strokeLinecap="round" />
        <circle cx={26} cy={-22} r={11} fill="none" stroke={KRP.ink} strokeWidth={3} />
      </g>
    )}
    <text x={44} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>{label}</text>
  </g>
);

// #106 大量の新兵を、どの部署に? (手前に新兵のうしろ姿、奥で道が三つに分かれる)
const SceneHaizokuQ: React.FC<{ f: number }> = ({ f }) => {
  const sign = (i: number) => pop(seg(f, 14 + i * 9, 38 + i * 9));
  // ===================================================================
  // 分かれ道の遠近法 (作者ダメ出し #107「奥につづく分かれ道の描き方が下手」で作り直し)
  // ルール:
  //  1. 地平線 HZ の高さを決める。道は絶対に HZ より上に描かない。
  //     (前の絵は枝道が地平線の上に伸びていたので「宙に浮いた帯」に見えていた)
  //  2. 道幅は「画面上で地平線からどれだけ下か」に比例させる = 全3車線で (y - HZ) * K。
  //     これだけで台形が自動的に正しい遠近になる。
  //  3. 枝道の中心線を地平線まで延ばした点＝その枝の消失点 (vpX)。ここでは
  //     左 (600,HZ) / 中央 (960,HZ) / 右 (1320,HZ) に収束させている。
  //  4. 看板は「枝道のいちばん奥の地面」に立てる。DestSign は支柱の足もとが
  //     ローカル y=132 なので、足もとの y から 132*s を引いた位置が看板の y になる。
  // 数値を触るときは、この4つが崩れていないか必ず確認すること。
  // ===================================================================
  // ※枝の「寝かせ具合」は中心線の傾き dy/dx で決まる。水平から45度くらいまで
  //   起こさないと、枝が横へ広がった三角形に見えて道に見えない。そのために
  //   分岐点 JY と地平線 HZ のあいだに 220px の高さを取り、消失点は左右 600/1320 と
  //   内側ぎみに置いている (外へ open しすぎると寝た羽根に見える)。
  // ※手前のはし BY は画面の下はし (1080) に合わせること。途中で切ると道が
  //   「地面に置いた凧」に見えてしまう (検品でそう見えた)。
  const HZ = 460;          // 地平線
  const K = 2.2;           // 奥行き係数 (全3車線ぶんの道幅 = (y - HZ) * K)
  const JY = 680;          // 道が三つに分かれる位置 (分岐線の y)
  const BY = 1080;         // 道の手前のはし (＝画面の下はし)
  // lanes 車線ぶんの「半分の幅」
  const halfW = (y: number, lanes: number) => ((y - HZ) * K * lanes) / 6;
  // 手前 (xn,yn) から奥 (xf,yf) へ伸びる道の台形
  const quad = (xn: number, yn: number, xf: number, yf: number, lanes: number) => {
    const a = halfW(yn, lanes);
    const b = halfW(yf, lanes);
    return `M ${xn - a} ${yn} L ${xn + a} ${yn} L ${xf + b} ${yf} L ${xf - b} ${yf} Z`;
  };
  // 分岐線上での各枝の中心 (左・中央・右で3等分)
  const laneW = halfW(JY, 1) * 2;
  const nearC = [960 - laneW, 960, 960 + laneW];
  // 各枝の消失点 (地平線上) と、枝のいちばん奥の y
  // 枝は地平線のすぐ手前 (farY) まで伸ばして、ほとんど点になるまで細らせる。
  // 途中でぷつりと切ると「途中で終わった帯」に見えてしまう。
  const vpX = [600, 960, 1320];
  const farY = [482, 478, 482];
  // 奥のはしの中心 = 分岐点から消失点へ向かう直線上の点
  const farC = nearC.map((cx, i) => {
    const t = (JY - farY[i]) / (JY - HZ);
    return cx + (vpX[i] - cx) * t;
  });
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={432} />
        <defs>
          {/* 地面の明暗: 地平線の近くはかすんで明るく、手前ほど濃く (遠近感のかなめ) */}
          <linearGradient id="w2haizokuGround" x1="0" y1={HZ} x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={KRP.bronze} stopOpacity={0} />
            <stop offset="0.4" stopColor={KRP.bronze} stopOpacity={0.2} />
            <stop offset="1" stopColor={KRP.bronze} stopOpacity={0.42} />
          </linearGradient>
          {/* 路面も同じく、奥ほど地面の色になじませる */}
          <linearGradient id="w2haizokuRoad" x1="0" y1={HZ} x2="0" y2={BY} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={KRP.paper} stopOpacity={0.5} />
            <stop offset="0.5" stopColor={KRP.paper} stopOpacity={1} />
            <stop offset="1" stopColor={KRP.paper} stopOpacity={1} />
          </linearGradient>
        </defs>
        <g filter="url(#wobble)">
          {/* 地面 (地平線から下ぜんぶ)。土の色 → 手前ほど濃い影を重ねる */}
          <rect x={0} y={HZ} width={W} height={H - HZ} fill={KRP.floor} />
          <rect x={0} y={HZ} width={W} height={H - HZ} fill="url(#w2haizokuGround)" />
          {/* 地平線 */}
          <line x1={0} y1={HZ} x2={W} y2={HZ} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
          {/* 奥の三本 (先に描いて、手前の一本道にのみ込ませる) */}
          {[0, 1, 2].map((i) => (
            <path key={`branch-${i}`} d={quad(nearC[i], JY, farC[i], farY[i], 1)}
              fill="url(#w2haizokuRoad)" stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
          ))}
          {/* 手前から分岐点までの一本道 */}
          <path d={quad(960, BY, 960, JY, 3)}
            fill="url(#w2haizokuRoad)" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* 路肩 (道のふちの内側に落ちる影。奥ほど細くなる) */}
          {[-1, 1].map((sgn) => {
            const a = halfW(BY, 3);
            const b = halfW(JY, 3);
            return (
              <path key={`shoulder-${sgn}`}
                d={`M ${960 + sgn * a} ${BY} L ${960 + sgn * a * 0.93} ${BY} L ${960 + sgn * b * 0.93} ${JY} L ${960 + sgn * b} ${JY} Z`}
                fill={KRP.bronze} opacity={0.22} />
            );
          })}
          {/* 中央線 (奥ほど短く・間隔もつまる。y = HZ + (BY-HZ)/奥行き で置く) */}
          {[0, 1, 2].map((n) => {
            const d0 = 1 + n * 0.38;
            const y0 = HZ + (BY - HZ) / d0;
            const y1 = HZ + (BY - HZ) / (d0 + 0.26);
            const w0 = (y0 - HZ) * 0.03;
            const w1 = (y1 - HZ) * 0.03;
            return (
              <path key={`clane-${n}`}
                d={`M ${960 - w0} ${y0} L ${960 + w0} ${y0} L ${960 + w1} ${y1} L ${960 - w1} ${y1} Z`}
                fill={KRP.grayDark} opacity={0.5} />
            );
          })}
          {/* 行き先の看板 (奥の地面に立てる。足もと = 枝道のいちばん奥) */}
          {([
            { k: "gun" as const, label: "砲兵?", s: 0.6 },
            { k: "radio" as const, label: "通信?", s: 0.54 },
            { k: "fix" as const, label: "整備?", s: 0.6 },
          ]).map((sg, i) => (
            <g key={`sign-${i}`} opacity={sign(i)} transform={`translate(0 ${(1 - sign(i)) * 18})`}>
              <DestSign x={farC[i]} y={farY[i] - 132 * sg.s} s={sg.s} kind={sg.k} label={sg.label} />
            </g>
          ))}
          {/* ※以前あった「行き先のあいだを往復する矢印」は作者指示で削除 (#107)。
              動きが目ざわりなうえ、矢印の根もとが新兵の群れに埋もれて読めなかった。
              「どこへ?」は看板の「?」と右上の大きな ? で伝える。 */}
          <QMark x={1700} y={350} s={0.95} t={seg(f, 34, 50)} f={f} phase={0} />
          {/* 奥から手前へ、どんどん増える新兵のうしろ姿 (5列)。
              ※各列は必ず道幅 halfW(y,3) の内側に収めること (道からはみ出すと興ざめ)。
              ※いちばん奥の列は分岐点 JY (=680) より下、足もと y=760 に置くこと。群れが
                分かれ目をふさぐと、枝道が本道とつながって見えず「宙に浮いた三角形」に
                戻ってしまう (作者ダメ出し #107 の原因そのもの)。
              ※各列の左右はし = halfW(y,3) の 0.8 倍。halfW(y,3) = (y-460)*1.1 なので、
                y を動かしたらここも計算しなおすこと。 */}
          {[
            { y: 760, s: 0.3, xs: [696, 784, 872, 960, 1048, 1136, 1224] },
            { y: 812, s: 0.38, xs: [650, 753, 857, 960, 1063, 1167, 1270] },
            { y: 872, s: 0.47, xs: [597, 701, 804, 908, 1012, 1115, 1219, 1323] },
            { y: 940, s: 0.57, xs: [538, 659, 779, 900, 1020, 1141, 1261, 1382] },
            { y: 1012, s: 0.66, xs: [476, 597, 718, 839, 960, 1081, 1202, 1323, 1444] },
          ].map((row, ri) =>
            row.xs.map((rx, ci) => (
              <RecruitBack key={`${ri}-${ci}`} x={rx} y={row.y} s={row.s} f={f} phase={ri * 5 + ci}
                color={[KRP.green, KRP.bronze, KRP.grayDark, KRP.green][(ri + ci) % 4]} />
            )),
          )}
        </g>
      </svg>
      <LabelPill x={420} y={170} text="大量の新兵、どこに配属する?" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #107 一人ずつ面接する時間はない (長蛇の列+ぐるぐる時計)
const SceneMensetsuMuri: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={433} />
      <g filter="url(#wobble)">
        <Ground y={800} />
        {/* 面接官 (机より先に描いて、下半身を机で隠す) */}
        <Gent x={430} y={800} s={0.98} f={f} phase={0} coat={KRP.green} pants={KRP.green} hatKind="army"
          mustache face="worried" gaze={[3, 0]} hideArm="both" />
        <path d={`M 508 ${574 + Math.sin(f / 7) * 4} q 12 16 -2 30`} fill="none" stroke={KRP.blue}
          strokeWidth={5.5} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f / 7)} />
        {/* 面接の机 */}
        <rect x={250} y={660} width={400} height={44} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        <rect x={290} y={704} width={320} height={190} rx={8} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
        {/* ※書類は机の右寄りに置くこと。面接官 (Gent x=430 s=0.98) は頭が x 369〜491 /
            y 525〜647 を占めるので、x=420 付近だと紙が顔に掛かる (作者ダメ出し #108)。
            s=0.4・rot=-6 のとき紙の横幅は約86px なので、中心 x=575 で左端 532 ＝顔と干渉しない。 */}
        <TestSheet x={575} y={616} s={0.4} rot={-6} />
        {/* 面接中の1人 */}
        <Mob x={760} y={890} s={1.12} f={f} phase={1} cap color={KRP.green} worried />
        {/* 奥へ続く長蛇の列 */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Mob key={i} x={940 + i * 135} y={880 - i * 52} s={1.0 - i * 0.1} f={f} phase={i + 2} cap
            color={[KRP.blue, KRP.bronze, KRP.green][i % 3]} />
        ))}
        <path d="M 900 560 Q 1400 420 1850 400" fill="none" stroke={KRP.ink} strokeWidth={4}
          strokeDasharray="4 22" opacity={0.45} />
        <TagPlate x={1520} y={620} text="列は、はるか先まで" size={30} t={seg(f, 26, 44)} color={KRP.blueDeep} />
        {/* ぐるぐる回る時計 */}
        <g transform="translate(1030 320)">
          <circle cx={0} cy={0} r={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <line key={i} x1={Math.cos((i / 12) * Math.PI * 2) * 92} y1={Math.sin((i / 12) * Math.PI * 2) * 92}
              x2={Math.cos((i / 12) * Math.PI * 2) * 78} y2={Math.sin((i / 12) * Math.PI * 2) * 78}
              stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          <line x1={0} y1={0} x2={Math.cos(f / 3 - Math.PI / 2) * 72} y2={Math.sin(f / 3 - Math.PI / 2) * 72}
            stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.cos(f / 36 - Math.PI / 2) * 48} y2={Math.sin(f / 36 - Math.PI / 2) * 48}
            stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={0} r={10} fill={KRP.ink} />
        </g>
        {/* 時計から飛ぶ焦り線 */}
        <g stroke={KRP.orange} strokeWidth={5.5} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 5)}>
          <line x1={880} y1={230} x2={850} y2={200} />
          <line x1={1180} y1={230} x2={1210} y2={200} />
        </g>
      </g>
    </svg>
    <LabelPill x={960} y={170} text="一人ずつ面接するヒマは、ない" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #108 心理学者たちの提案「知能検査を、全員に」
const SceneTeian: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={434} />
      <g filter="url(#wobble)">
        <Ground y={790} />
        {/* 心理学者2人 (左。1人が手を挙げる) */}
        <Gent x={420} y={900} s={1.08} f={f} phase={0} coat={KRP.grayDark} glasses
          face="smile" gaze={[4, -2]} hideArm="right" />
        <Arm x1={485} y1={745} x2={610} y2={560} cloth={KRP.grayDark} s={1.08} />
        <Gent x={700} y={896} s={1.0} f={f} phase={1} coat={KRP.blueDeep} glasses mustache
          face="smile" gaze={[3, -2]} />
        <TagPlate x={540} y={300} text="心理学者たち" size={32} t={seg(f, 6, 22)} color={KRP.blueDeep} />
        {/* 聞く将校 (右) */}
        <Gent x={1560} y={900} s={1.08} f={f} phase={2} coat={KRP.green} pants={KRP.green} hatKind="army"
          mustache face="surprised" gaze={[-4, -2]} />
      </g>
      {/* 提案の吹き出し (文字はにじませない) */}
      <Bubble x={1060} y={380} w={620} h={330} t={seg(f, 10, 30)} tailTo={[680, 620]}>
        <g transform="translate(-170 10)">
          <TestSheet x={0} y={0} s={0.78} rot={-5} />
        </g>
        <text x={120} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46}
          fill={KRP.ink}>知能検査を、</text>
        <text x={120} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
          fill={KRP.red}>全員に</text>
      </Bubble>
    </svg>
    <LabelPill x={960} y={170} text="心理学者たちが、提案します" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #109 筆記式のアルファ
const SceneAlpha: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 6, 28));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={435} />
        <g filter="url(#wobble)">
          <Ground y={820} />
          {/* 大きなアルファ用紙 */}
          <g transform={`translate(640 520) scale(${0.8 + 0.2 * t})`}>
            <TestSheet x={0} y={0} s={2.1} kind="alpha" rot={-2} />
          </g>
          <g transform={`translate(640 300) scale(${t})`}>
            <rect x={-230} y={-44} width={460} height={88} rx={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
            {/* 帯の幅 460 に10文字。はみ出さないよう 42 にしてある */}
            <text x={0} y={15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42}
              fill={KRP.ink}>筆記式の「アルファ」</text>
          </g>
          {/* 机で書く兵士 (机より先に描いて、机のうしろに立たせる) */}
          <Gent x={1440} y={820} s={0.92} f={f} phase={0} coat={KRP.green} pants={KRP.green} hatKind="army"
            face="normal" gaze={[0, 3]} hideArm="right" />
          <rect x={1210} y={690} width={460} height={40} rx={9} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={1250} y={730} width={60} height={160} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1560} y={730} width={60} height={160} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
          <TestSheet x={1430} y={640} s={0.42} rot={-4} />
          <Arm x1={1495} y1={689} x2={1460 + Math.sin(f / 5) * 12} y2={636} cloth={KRP.green} s={0.92} />
          {/* 鉛筆 */}
          <g transform={`translate(${1462 + Math.sin(f / 5) * 12} 630) rotate(40)`}>
            <rect x={-7} y={-56} width={14} height={56} rx={4} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -7 0 L 0 16 L 7 0 Z" fill={SKIN} stroke={KRP.ink} strokeWidth={3} />
          </g>
          <TagPlate x={1440} y={420} text="読み書きできる人むけ" size={30} t={seg(f, 26, 44)} color={KRP.blueDeep} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="読み書きできる人には、筆記式" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #110 絵と記号のベータ
const SceneBeta: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 6, 28));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={436} />
        <g filter="url(#wobble)">
          <Ground y={820} />
          {/* 大きなベータ用紙 */}
          <g transform={`translate(1280 520) scale(${0.8 + 0.2 * t})`}>
            <TestSheet x={0} y={0} s={2.1} kind="beta" rot={2} />
          </g>
          <g transform={`translate(1280 300) scale(${t})`}>
            <rect x={-250} y={-44} width={500} height={88} rx={14} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46}
              fill={KRP.ink}>絵と記号の「ベータ」</text>
          </g>
          {/* ほっとする兵士たち (左) */}
          <Mob x={380} y={880} s={1.25} f={f} phase={0} cap color={KRP.green} />
          <Mob x={620} y={895} s={1.18} f={f} phase={1} cap color={KRP.bronze} />
          {/* 安心のふわふわ音符がわりのキラ */}
          <Spark cx={300} cy={580} s={0.8} o={0.5 + 0.5 * Math.sin(f / 7)} />
          <Spark cx={560} cy={540} s={0.7} color={KRP.orange} o={0.5 + 0.5 * Math.sin(f / 7 + 2)} />
          <TagPlate x={500} y={440} text="英語が苦手でも、だいじょうぶ" size={30} t={seg(f, 26, 44)} color={KRP.green} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="移民や読み書きが苦手な人には、絵" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #111 流れ作業のように仕分ける (ベルトコンベア)
const SceneNagare: React.FC<{ f: number }> = ({ f }) => {
  const beltSpan = W + 360;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={437} />
        <g filter="url(#wobble)">
          <Ground y={880} />
          {/* 検査ゲート */}
          <rect x={820} y={260} width={300} height={430} rx={14} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6.5} />
          <rect x={870} y={420} width={200} height={270} rx={10} fill={KRP.paper} stroke={KRP.ink} strokeWidth={5.5} />
          <g transform="translate(970 330)">
            <rect x={-110} y={-36} width={220} height={72} rx={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>検査中</text>
          </g>
          <Gear cx={866} cy={262} r={34} f={f} speed={2.6} color={KRP.orange} />
          <Gear cx={1078} cy={262} r={26} f={f} speed={-3.6} color={KRP.blue} />
          {/* ベルト (ぐんと速く回す = 大量生産の勢い) */}
          <rect x={-40} y={700} width={2000} height={54} rx={18} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <circle key={i} cx={60 + i * 230} cy={768} r={30} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5}
              transform={`rotate(${f * 11} ${60 + i * 230} 768)`} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <line key={i} x1={((i * 170 + f * 9) % 2040) - 40} y1={706} x2={((i * 170 + f * 9) % 2040) - 4} y2={748}
              stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
          ))}
          {/* 流れる兵士たち (9人がベルトでどんどん運ばれる) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const x = ((f * 9 + i * (beltSpan / 9)) % beltSpan) - 180;
            const inGate = x > 820 && x < 1120;
            return (
              <g key={i} opacity={inGate ? 0 : 1}>
                <Mob x={x} y={706} s={1.06} f={f} phase={i * 2} cap
                  color={[KRP.green, KRP.blue, KRP.bronze][i % 3]} />
                {/* 通過後は紙を持つ */}
                {x >= 1120 && <TestSheet x={x + 54} y={620} s={0.3} kind={i % 2 === 0 ? "alpha" : "beta"} rot={8} />}
                {/* 速さを出すスピード線 */}
                <line x1={x - 66} y1={660 - (i % 3) * 16} x2={x - 128} y2={660 - (i % 3) * 16}
                  stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" opacity={inGate ? 0 : 0.5} />
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={170} text="流れ作業のように、仕分けていく" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #112 その数、およそ175万人 (大きな掲示板+人の海)
const Scene175Man: React.FC<{ f: number }> = ({ f }) => {
  const t = pop(seg(f, 10, 36));
  const rowT = (i: number) => clamp01(seg(f, 18 + i * 8, 34 + i * 8));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={438} />
        <g filter="url(#wobble)">
          {/* 人の海 (奥から並ぶ小さな頭) */}
          {[0, 1, 2, 3].map((row) => (
            <g key={row} opacity={rowT(3 - row) * (0.45 + row * 0.18)}>
              {Array.from({ length: 12 - row * 1 }, (_, i) => {
                const x = 120 + i * (150 + row * 14) + (row % 2) * 70;
                const y = 560 + row * 110;
                const s = 0.52 + row * 0.16;
                return <Mob key={i} x={x} y={y} s={s} f={f} phase={row * 12 + i} cap
                  color={[KRP.green, KRP.blue, KRP.bronze][(row + i) % 3]} />;
              })}
            </g>
          ))}
        </g>
      </svg>
      {/* 掲示板 (文字はにじませない) */}
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(960 330) scale(${0.7 + 0.3 * t})`} opacity={t}>
          <rect x={-470} y={-130} width={940} height={260} rx={18} fill={KRP.ink} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-446} y={-106} width={892} height={212} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40}
            fill={KRP.grayDark}>検査を受けた兵士</text>
          <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96}
            fill={KRP.red}>約175万人</text>
        </g>
      </svg>
      <LabelPill x={960} y={170} text="その数は…" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #113 「頭の中身」が大量生産のように測られた (工場のゲージとハンコ)
const SceneTairyoSokutei: React.FC<{ f: number }> = ({ f }) => {
  const press = Math.max(Math.sin(f / 8), 0); // ハンコの上下
  const needle = -50 + 40 * (0.5 + 0.5 * Math.sin(f / 11));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={439} />
        <g filter="url(#wobble)">
          {/* 工場の屋根 */}
          <path d="M 120 250 L 400 130 L 400 250 L 680 130 L 680 250 L 960 130 L 960 250 Z"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} opacity={0.85} />
          <Ground y={860} />
          {/* ベルト */}
          <rect x={-40} y={680} width={2000} height={50} rx={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <circle key={i} cx={80 + i * 230} cy={744} r={28} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5}
              transform={`rotate(${f * 4} ${80 + i * 230} 744)`} />
          ))}
          {/* 流れる横顔たち */}
          {[0, 1, 2].map((i) => {
            const x = ((f * 2.6 + i * 640) % (W + 400)) - 200;
            return <HeadProfile key={i} x={x} y={595} s={0.42}
              fill={[KRP.blueSoft, KRP.white, KRP.yellow][i]} />;
          })}
          {/* 計測ゲージ (目盛りつき) */}
          <g transform="translate(1380 330)">
            <rect x={-150} y={-120} width={300} height={220} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -104 60 A 104 104 0 0 1 104 60" fill="none" stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = Math.PI + (i / 4) * Math.PI;
              return (
                <line key={i} x1={Math.cos(a) * 104} y1={60 + Math.sin(a) * 104}
                  x2={Math.cos(a) * 84} y2={60 + Math.sin(a) * 84} stroke={KRP.ink} strokeWidth={4.5} />
              );
            })}
            <line x1={0} y1={60} x2={Math.cos(((needle - 90) * Math.PI) / 180) * 88}
              y2={60 + Math.sin(((needle - 90) * Math.PI) / 180) * 88}
              stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
            <circle cx={0} cy={60} r={11} fill={KRP.ink} />
          </g>
          <TagPlate x={1380} y={160} text="はかる" size={28} t={1} />
          {/* 下りてくる計測ハンコ */}
          <g transform={`translate(760 ${330 + press * 160})`}>
            <rect x={-60} y={-130} width={120} height={110} rx={12} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={-28} y={-220} width={56} height={90} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-74} y={-28} width={148} height={30} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
          <Burst cx={760} cy={600} t={press > 0.92 ? 0.3 : 0} r0={120} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="人類史上はじめての、大量測定" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #114 やさしい道具が、巨大な選別マシンに
const SceneSenbetsuMachine: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 8, 32));
  const arrowT = pop(seg(f, 22, 44));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={440} />
        <g filter="url(#wobble)">
          <Ground y={860} />
          {/* 左: 教室生まれのやさしい道具 (小さく) */}
          <g opacity={t}>
            <circle cx={360} cy={520} r={150} fill={KRP.yellow} opacity={0.3 + 0.1 * Math.sin(f / 8)} />
            <TestSheet x={360} y={520} s={0.8} heart />
            <TagPlate x={360} y={740} text="教室生まれ" size={30} t={t} color={KRP.green} />
          </g>
          {/* 矢印+10年あまり */}
          {arrowT > 0 && (
            <g transform={`translate(700 520) scale(${arrowT})`}>
              <path d="M -90 -30 L 30 -30 L 30 -62 L 110 0 L 30 62 L 30 30 L -90 30 Z"
                fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
            </g>
          )}
          <TagPlate x={700} y={380} text="10年あまりで" size={30} t={arrowT} />
          {/* 右: 巨大な選別マシン */}
          <g opacity={easeOut(seg(f, 26, 50))}>
            <path d="M 1010 300 L 1560 300 L 1460 440 L 1110 440 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6.5} />
            <rect x={1110} y={440} width={350} height={320} rx={14} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
            <Gear cx={1285} cy={560} r={52} f={f} speed={1} color={KRP.orange} />
            <Gear cx={1392} cy={640} r={34} f={f} speed={-1.5} color={KRP.blue} />
            <circle cx={1180} cy={660} r={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={4}
              opacity={0.4 + 0.6 * Math.max(Math.sin(f / 6), 0)} />
            {/* 落ちていく人かげ */}
            <Mob x={1285} y={300 - ((f * 1.6) % 90)} s={0.72} f={f} phase={0} cap color={KRP.green} worried />
            {/* 2本の出口シュート */}
            <path d="M 1110 760 L 940 880 L 1030 880 L 1180 760 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M 1460 760 L 1630 880 L 1540 880 L 1390 760 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
            <TagPlate x={1560} y={236} text="巨大な選別マシン" size={34} t={seg(f, 36, 54)} color={KRP.red} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} text="やさしい道具、姿を変える" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #115 リキャップ: 神様→体→数字 (路線図 count=3)
const SceneRoute3: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={441} />
      <g filter="url(#wobble)">
        {/* 遠くの雲 */}
        {[0, 1, 2].map((i) => {
          const cx = ((i * 740 + f * 0.4) % (W + 420)) - 210;
          return (
            <g key={i} opacity={0.8}>
              <ellipse cx={cx} cy={250 + i * 54} rx={100} ry={24} fill={KRP.white} />
              <ellipse cx={cx + 66} cy={238 + i * 54} rx={60} ry={18} fill={KRP.white} />
            </g>
          );
        })}
        <RouteMap x={960} y={560} s={1.12} f={f} count={3} />
        <TagPlate x={960} y={830} text="聞く相手の、乗り換えの歴史" size={32} t={seg(f, 50, 68)} color={KRP.blueDeep} />
      </g>
    </svg>
    <LabelPill x={960} y={170} text="振り返ってみましょう" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #116 そして答えは「数字」になった (数字駅をクローズアップ)
const SceneSujiAnswer: React.FC<{ f: number }> = ({ f }) => {
  const glowT = easeOut(seg(f, 30, 54));
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={442} />
        <g filter="url(#wobble)">
          {/* 数字駅のうしろの光 */}
          <circle cx={960} cy={560} r={240 * glowT} fill={KRP.yellow} opacity={0.3} />
          <RouteMap x={744} y={560} s={1.2} f={f} count={3} />
          {/* 数字駅を囲む注目リング (駅の画面位置 = 744 + 180*1.2 = 960) */}
          {glowT > 0 && (
            <circle cx={960} cy={560} r={150 + Math.sin(f / 8) * 8} fill="none"
              stroke={KRP.orange} strokeWidth={9 * glowT} strokeDasharray="26 18" opacity={glowT} />
          )}
          <Spark cx={1230} cy={340} s={0.9} o={glowT * (0.5 + 0.5 * Math.sin(f / 7))} />
          <Spark cx={700} cy={320} s={0.7} color={KRP.orange} o={glowT * (0.5 + 0.5 * Math.sin(f / 7 + 2))} />
          <TagPlate x={960} y={830} text="いまの答えは、ここ" size={32} t={glowT} color={KRP.orange} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="答えは、「数字」になった" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #117 数字には、人を並べ替える力もある
const SceneNarabekae: React.FC<{ f: number }> = ({ f }) => {
  const bar = (i: number) => easeOut(seg(f, 8 + i * 8, 30 + i * 8));
  const heights = [130, 215, 300, 385];
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={443} />
        <g filter="url(#wobble)">
          {/* 字幕帯に当たらないよう、地面ごと一段上げる */}
          <Ground y={840} />
          {/* 高さ順の台 (数字の札は白紙=決めつけ防止) */}
          {[0, 1, 2, 3].map((i) => {
            const h = heights[i] * bar(i);
            const x = 430 + i * 300;
            return (
              <g key={i}>
                <rect x={x - 100} y={840 - h} width={200} height={h}
                  fill={i === 3 ? KRP.orange : KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
                {/* 白紙の成績札 */}
                {bar(i) > 0.9 && (
                  <g transform={`translate(${x} ${840 - h + 52})`}>
                    <rect x={-54} y={-30} width={108} height={60} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                    <line x1={-32} y1={0} x2={32} y2={0} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />
                  </g>
                )}
                {bar(i) > 0.9 && (
                  <Mob x={x} y={840 - h} s={0.95} f={f} phase={i} cap
                    color={[KRP.green, KRP.blue, KRP.bronze, KRP.green][i]} worried={i === 0} />
                )}
              </g>
            );
          })}
          {/* 並べ替えの矢印 (全員の頭より上を通す) */}
          <g opacity={pop(seg(f, 40, 60))}>
            <path d="M 340 540 Q 870 330 1400 270" fill="none" stroke={KRP.red} strokeWidth={10}
              strokeLinecap="round" strokeDasharray="2 26" />
            <path d="M 1368 228 L 1428 268 L 1372 302 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <TagPlate x={430} y={336} text="並べ替える力" size={34} t={seg(f, 44, 62)} color={KRP.red} />
        </g>
      </svg>
      <LabelPill x={960} y={170} text="数字は便利。でも…" centerX />
      <WBadge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #118 戦争が終わり、「成績表」が社会へ流れ出す
const SceneSeisekiNagare: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
      <WobbleDefs seed={444} />
      <g filter="url(#wobble)">
        <Ground y={800} />
        {/* 軍の門 (左) */}
        <rect x={150} y={360} width={70} height={440} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={520} y={360} width={70} height={440} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={110} y={300} width={520} height={70} rx={10} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
        {/* 開いた門扉 */}
        <g transform="rotate(-24 220 780)">
          <rect x={220} y={440} width={150} height={340} rx={8} fill="none" stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={220} y1={520} x2={370} y2={520} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={220} y1={620} x2={370} y2={620} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        <TagPlate x={370} y={240} text="戦争、おわる" size={32} t={seg(f, 6, 24)} />
        {/* 街なみ (右) */}
        <g opacity={0.9}>
          <rect x={1420} y={420} width={180} height={380} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={1620} y={360} width={170} height={440} fill={KRP.paper} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M 1610 360 L 1705 280 L 1800 360 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={1450} y={460 + r * 110} width={48} height={60} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={1530} y={460 + r * 110} width={48} height={60} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={1668} y={420 + r * 110} width={46} height={58} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          ))}
        </g>
        {/* 門から街へ飛んでいく成績表 */}
        {[0, 1, 2, 3].map((i) => {
          const t = ((f * 1.3 + i * 42) % 160) / 160;
          const x = lerp(430, 1500, t);
          const y = 520 - Math.sin(t * Math.PI) * 220 + i * 26;
          return <TestSheet key={i} x={x} y={y} s={0.4 - t * 0.08} rot={-16 + t * 42 + i * 8}
            kind={i % 2 === 0 ? "alpha" : "beta"} />;
        })}
        <path d="M 440 540 Q 960 240 1510 480" fill="none" stroke={KRP.ink} strokeWidth={4}
          strokeDasharray="4 24" opacity={0.4} />
      </g>
    </svg>
    <LabelPill x={960} y={170} text="テストの「成績表」が、社会へ" centerX />
    <WBadge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// #119 ここから物語は、少しだけ暗くなる (雲がおひさまを隠す)
const SceneKurakuNaru: React.FC<{ f: number }> = ({ f }) => {
  const cloudT = easeOut(seg(f, 10, 60));
  const dim = cloudT * 0.26;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      <svg width={W} height={H} style={abs} viewBox={`0 0 ${W} ${H}`}>
        <WobbleDefs seed={445} />
        <g filter="url(#wobble)">
          {/* おひさま */}
          <circle cx={960} cy={330} r={110} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <line key={i} x1={960 + Math.cos(a) * 140} y1={330 + Math.sin(a) * 140}
                x2={960 + Math.cos(a) * 180} y2={330 + Math.sin(a) * 180}
                stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" opacity={1 - cloudT} />
            );
          })}
          <Ground y={820} />
          {/* 地面のやさしい道具 (ぽつん。地面に接地) */}
          <TestSheet x={960} y={720} s={0.78} heart rot={-5} />
          {/* せまってくる大きな雲 */}
          <g transform={`translate(${lerp(-760, 150, cloudT)} 0)`}>
            <g opacity={0.96}>
              <ellipse cx={430} cy={320} rx={330} ry={130} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
              <ellipse cx={700} cy={250} rx={240} ry={110} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
              <ellipse cx={180} cy={250} rx={200} ry={95} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
            </g>
          </g>
        </g>
      </svg>
      {/* 画面全体がすこし暗くなる */}
      <AbsoluteFill style={{ background: `rgba(40, 28, 16, ${dim})`, pointerEvents: "none" }} />
      <LabelPill x={960} y={170} text="ここから、少しだけ暗いお話" centerX />
      <WBadge />
      <Atmosphere f={f} dark={cloudT > 0.6} />
    </AbsoluteFill>
  );
};

// motif を知っていれば描く / 知らなければ null (マスター出口が次のファイルに回す)
export const watashiB2Scene = (motif: string, f: number): React.ReactElement | null => {
  switch (motif) {
    // 第4章 (#70〜#86)
    case "w2_ch4_door": return <SceneCh4Door f={f} />;
    case "w2_boom_street": return <SceneBoomStreet f={f} />;
    case "w2_head_map": return <SceneHeadMap f={f} />;
    case "w2_head_bumps": return <SceneHeadBumps f={f} />;
    case "w2_gall": return <SceneGall f={f} />;
    case "w2_ny_shindanjo": return <SceneNYShindanjo f={f} />;
    case "w2_parlor_touch": return <Parlor f={f} stage="touch" />;
    case "w2_parlor_bubble": return <Parlor f={f} stage="bubble" />;
    case "w2_parlor_pay": return <Parlor f={f} stage="pay" />;
    case "w2_shushoku": return <SceneShushoku f={f} />;
    case "w2_kekkon": return <SceneKekkon f={f} />;
    case "w2_konkyo_q": return <SceneKonkyoQ f={f} />;
    case "w2_hitei": return <SceneHitei f={f} />;
    case "w2_ninki_tsuzuku": return <SceneNinkiTsuzuku f={f} />;
    case "w2_tenbin": return <SceneTenbin f={f} />;
    case "w2_namae_ato": return <SceneNamaeAto f={f} />;
    // 第5章 (#87〜#103)
    case "w2_ch5_door": return <SceneCh5Door f={f} />;
    case "w2_katachi_nakami": return <SceneKatachiNakami f={f} />;
    case "w2_binet_1905": return <SceneBinet1905 f={f} />;
    case "w2_kyoushitsu": return <SceneKyoushitsu f={f} move={false} />;
    case "w2_kyoushitsu_hanareru": return <SceneKyoushitsu f={f} move />;
    case "w2_committee_decide": return <Committee f={f} mode="decide" />;
    case "w2_committee_stuck": return <Committee f={f} mode="stuck" />;
    case "w2_jisaku": return <SceneJisaku f={f} />;
    case "w2_kaidan": return <SceneKaidan f={f} />;
    case "w2_shien": return <SceneShien f={f} />;
    case "w2_binet_kaku": return <SceneBinetKaku f={f} />;
    case "w2_zannin": return <SceneZannin f={f} />;
    case "w2_kimetsukeru_na": return <SceneKimetsukeruNa f={f} />;
    case "w2_iq_betsujin": return <SceneIQBetsujin f={f} />;
    case "w2_yasashii_dougu": return <SceneYasashiiDougu f={f} />;
    case "w2_umi_wataru": return <SceneUmiWataru f={f} />;
    // 第6章 (#104〜#119)
    case "w2_ch6_door": return <SceneCh6Door f={f} />;
    case "w2_ww1_nayami": return <SceneWW1Nayami f={f} />;
    case "w2_haizoku_q": return <SceneHaizokuQ f={f} />;
    case "w2_mensetsu_muri": return <SceneMensetsuMuri f={f} />;
    case "w2_teian": return <SceneTeian f={f} />;
    case "w2_alpha": return <SceneAlpha f={f} />;
    case "w2_beta": return <SceneBeta f={f} />;
    case "w2_nagare_sagyo": return <SceneNagare f={f} />;
    case "w2_175man": return <Scene175Man f={f} />;
    case "w2_tairyo_sokutei": return <SceneTairyoSokutei f={f} />;
    case "w2_senbetsu_machine": return <SceneSenbetsuMachine f={f} />;
    case "w2_route3": return <SceneRoute3 f={f} />;
    case "w2_suji_answer": return <SceneSujiAnswer f={f} />;
    case "w2_narabekae": return <SceneNarabekae f={f} />;
    case "w2_seiseki_nagare": return <SceneSeisekiNagare f={f} />;
    case "w2_kuraku_naru": return <SceneKurakuNaru f={f} />;
    default: return null;
  }
};

// 文#70〜#119 に1対1で対応する motif 名の列 (長さは必ず50。再利用は同じ名前を繰り返す)
export const W_B2_MOTIFS: string[] = [
  // 第4章 (#70〜#86)
  "w2_ch4_door",         // #70 第4章、頭のデコボコ、測ります。
  "w2_boom_street",      // #71 19世紀の欧米で大流行
  "w2_head_map",         // #72 その名も、骨相学。
  "w2_head_bumps",       // #73 頭のデコボコで性格や才能がわかる説 (新規)
  "w2_gall",             // #74 1790年代にガルが唱え、またたく間に
  "w2_ny_shindanjo",     // #75 ニューヨークに有料の診断所
  "w2_parlor_touch",     // #76 お客は椅子に座り、頭を触ってもらう
  "w2_parlor_bubble",    // #77 「慎重さのふくらみ、大きいですね」
  "w2_parlor_pay",       // #78 頭を撫でられて、お金を払う
  "w2_shushoku",         // #79 就職の身元保証に診断書
  "w2_kekkon",           // #80 結婚相手選びにも頭の形の相性
  "w2_konkyo_q",         // #81 肝心の科学的な根拠は?
  "w2_hitei",            // #82 脳の実験できっぱり否定
  "w2_ninki_tsuzuku",    // #83 では流行は終わったのか。終わりませんでした
  "w2_ninki_tsuzuku",    // #84 否定後も人気は何十年も続いた (再利用)
  "w2_tenbin",           // #85 「当たっている気がする」は根拠より強い
  "w2_namae_ato",        // #86 この妙な現象、あとで名前が付く
  // 第5章 (#87〜#103)
  "w2_ch5_door",         // #87 第5章、困っている子を、見つけたい。
  "w2_katachi_nakami",   // #88 「頭の形」から「頭の中身」へ
  "w2_binet_1905",       // #89 1905年ビネー、世界初の知能検査
  "w2_kyoushitsu",            // #91 きっかけは学校 (まだ動かさない)
  "w2_kyoushitsu_hanareru",   // #92 義務教育・ついていけない子が課題 (ここで右端の子が離れる)
  "w2_committee_decide", // #92 委員会「支援が必要な子を早く見つけよう」
  "w2_committee_stuck",  // #93 ところが見つける方法がない
  "w2_jisaku",           // #94 ビネーがシモンとともに検査を自作
  "w2_kaidan",           // #95 年齢ごとの問題、どこでつまずくか
  "w2_shien",            // #96 目的は序列ではなく支援
  "w2_binet_kaku",       // #97 ビネー本人はこう書き残した
  "w2_zannin",           // #98 「残忍な悲観論だ」
  "w2_kimetsukeru_na",   // #99 可能性をひとつの数字で決めつけるな
  "w2_iq_betsujin",      // #100 IQはビネーの発明ではない
  "w2_iq_betsujin",      // #101 死後、別の学者たちが整えた (再利用)
  "w2_yasashii_dougu",   // #102 やさしい道具が出発点
  "w2_umi_wataru",       // #103 海を渡って別の顔に
  // 第6章 (#104〜#119)
  "w2_ch6_door",         // #104 第6章、175万人の、一斉テスト。
  "w2_ww1_nayami",       // #105 第一次世界大戦・アメリカの巨大な悩み
  "w2_haizoku_q",        // #106 大量の新兵をどの部署に配属?
  "w2_mensetsu_muri",    // #107 一人ずつ面接する時間はない
  "w2_teian",            // #108 心理学者たち「知能検査を全員に」
  "w2_alpha",            // #109 筆記式のアルファ
  "w2_beta",             // #110 絵と記号のベータ
  "w2_nagare_sagyo",     // #111 流れ作業のように仕分け
  "w2_175man",           // #112 その数、およそ175万人
  "w2_tairyo_sokutei",   // #113 頭の中身が大量生産のように測られた
  "w2_senbetsu_machine", // #114 やさしい道具が巨大な選別マシンに
  "w2_route3",           // #115 振り返り: 神様に聞いた時代、体に聞いた時代
  "w2_suji_answer",      // #116 そして今、答えは「数字」に
  "w2_narabekae",        // #117 数字には人を並べ替える力も
  "w2_seiseki_nagare",   // #118 戦争が終わり「成績表」が社会へ
  "w2_kuraku_naru",      // #119 ここから物語は少しだけ暗くなる
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const W_B2_PREVIEW_FRAMES = Math.max(W_B2_MOTIFS.length, 1);
export const WatashiB2Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(W_B2_MOTIFS.length - 1, 0));
  const motif = W_B2_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {watashiB2Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 71} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
