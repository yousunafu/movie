// 自販機2000年史: 第5章 (日本の1号機は木でできていた) + 第6章 (映画館をおまけにつけた自販機)。
// 設計表 docs/jihanki2000-motifs.md #92〜#126 の35シーン。seed は 160〜194 を1つずつ使う。
// このファイルは新規追加のみ。既存ファイルは変更しない。

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  KRP, WobbleDefs, Atmosphere, LabelPill, Stamp, Coin,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, abs, J2Badge, Globe, globePoint, MapPin, FlagCard,
} from "./Jihanki2000Scenes";
import { JapanMapCard, JapanHop, JmapLabel, JMAP, jmapXY } from "./Jihanki2000JapanMap";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ===== 腕 (hideArm した側に別描きで生やす。二重腕バグ防止) =====
const Arm: React.FC<{ x1: number; y1: number; x2: number; y2: number; cloth: string; s?: number }> = ({
  x1, y1, x2, y2, cloth, s = 1,
}) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={33 * s} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cloth} strokeWidth={24 * s} strokeLinecap="round" />
    <circle cx={x2} cy={y2} r={17 * s} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={5 * s} />
  </g>
);

// ===== SVG内ミニ札 (部位ラベル用) =====
const TagPlate: React.FC<{ x: number; y: number; text: string; size?: number; t?: number }> = ({
  x, y, text, size = 26, t = 1,
}) => {
  if (t <= 0) return null;
  const w = text.length * size + 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * pop(clamp01(t))})`} opacity={clamp01(t * 2)}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={8}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={800}
        fontSize={size} fill={KRP.ink}>{text}</text>
    </g>
  );
};

// ===== ハンコの衝撃線 (8方向) =====
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

// ===== キラッ (4方向の星) =====
const Spark: React.FC<{ cx: number; cy: number; s?: number; color?: string; o?: number }> = ({
  cx, cy, s = 1, color = KRP.yellow, o = 1,
}) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={o}>
    <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z"
      fill={color} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// ===== 吹き出し (角丸+しっぽの丸。t でポンと出る) =====
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

// ===== 俵屋高七 (明治の指物職人: はちまき+前掛け+口ひげ) =====
const Tawaraya: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised";
  gaze?: [number, number];
  hideArm?: "left" | "right" | "both" | "none";
  headTilt?: number; // 首かしげ (度)
  silhouette?: boolean; // 夕景の影絵用
  lean?: number;
}> = ({
  x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0],
  hideArm = "none", headTilt = 0, silhouette = false, lean = 0,
}) => {
  const [gx, gy] = gaze;
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const kimono = silhouette ? KRP.ink : "#5D7390";
  const apron = silhouette ? KRP.ink : "#8A6F4D";
  const skin = silhouette ? KRP.ink : "#F6D7B8";
  const sw = silhouette ? 0 : 5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 脚 */}
      <rect x={-44} y={-58} width={34} height={52} rx={10} fill={silhouette ? KRP.ink : "#44506A"} stroke={KRP.ink} strokeWidth={sw} />
      <rect x={10} y={-58} width={34} height={52} rx={10} fill={silhouette ? KRP.ink : "#44506A"} stroke={KRP.ink} strokeWidth={sw} />
      <ellipse cx={-27} cy={-4} rx={26} ry={10} fill={silhouette ? KRP.ink : "#3A3F4C"} stroke={KRP.ink} strokeWidth={sw} />
      <ellipse cx={27} cy={-4} rx={26} ry={10} fill={silhouette ? KRP.ink : "#3A3F4C"} stroke={KRP.ink} strokeWidth={sw} />
      {/* 腕 (hideArm 側は描かない) */}
      {hideArm !== "left" && hideArm !== "both" && (
        <g>
          <rect x={-78} y={-148} width={22} height={82} rx={11} fill={kimono} stroke={KRP.ink} strokeWidth={sw} />
          <circle cx={-67} cy={-62} r={14} fill={skin} stroke={KRP.ink} strokeWidth={sw} />
        </g>
      )}
      {hideArm !== "right" && hideArm !== "both" && (
        <g>
          <rect x={56} y={-148} width={22} height={82} rx={11} fill={kimono} stroke={KRP.ink} strokeWidth={sw} />
          <circle cx={67} cy={-62} r={14} fill={skin} stroke={KRP.ink} strokeWidth={sw} />
        </g>
      )}
      {/* 胴 (着物) + 前掛け */}
      <rect x={-58} y={-160} width={116} height={108} rx={26} fill={kimono} stroke={KRP.ink} strokeWidth={sw} />
      {!silhouette && (
        <path d="M -34 -160 L 0 -118 L 34 -160" fill="none" stroke={KRP.ink} strokeWidth={4.5} opacity={0.65} />
      )}
      <path d="M -40 -118 L 40 -118 L 32 -54 L -32 -54 Z" fill={apron} stroke={KRP.ink} strokeWidth={sw} />
      {!silhouette && <line x1={-40} y1={-118} x2={40} y2={-118} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />}
      {/* 頭 (headTilt で首かしげ) */}
      <g transform={`rotate(${headTilt} 0 -168)`}>
        <circle cx={0} cy={-218} r={62} fill={skin} stroke={KRP.ink} strokeWidth={sw} />
        {/* 髪 (短髪) */}
        <path d="M -60 -232 Q -52 -282 0 -282 Q 52 -282 60 -232 L 60 -248 Q 44 -270 0 -272 Q -44 -270 -60 -248 Z"
          fill={silhouette ? KRP.ink : "#4A3E33"} stroke={KRP.ink} strokeWidth={silhouette ? 0 : 4} />
        <path d="M -61 -235 Q 0 -268 61 -235 L 61 -252 Q 0 -286 -61 -252 Z"
          fill={silhouette ? KRP.ink : "#4A3E33"} />
        {/* はちまき */}
        <rect x={-63} y={-246} width={126} height={22} rx={11}
          fill={silhouette ? KRP.ink : KRP.white} stroke={KRP.ink} strokeWidth={silhouette ? 0 : 4.5} />
        {!silhouette && (
          <g>
            <circle cx={60} cy={-236} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 66 -230 L 84 -218 M 64 -226 L 76 -208" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
        {!silhouette && (
          <g>
            {/* 目 */}
            {blink ? (
              <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
                <line x1={-28} y1={-212} x2={-12} y2={-212} />
                <line x1={12} y1={-212} x2={28} y2={-212} />
              </g>
            ) : face === "surprised" ? (
              <g>
                <circle cx={-20 + gx} cy={-212 + gy} r={9} fill={KRP.ink} />
                <circle cx={20 + gx} cy={-212 + gy} r={9} fill={KRP.ink} />
              </g>
            ) : (
              <g>
                <circle cx={-20 + gx} cy={-212 + gy} r={6.5} fill={KRP.ink} />
                <circle cx={20 + gx} cy={-212 + gy} r={6.5} fill={KRP.ink} />
              </g>
            )}
            {face === "worried" && (
              <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
                <line x1={-32} y1={-232} x2={-12} y2={-226} />
                <line x1={12} y1={-226} x2={32} y2={-232} />
              </g>
            )}
            {/* 口ひげ + 口 */}
            <path d="M -22 -186 Q 0 -196 22 -186 Q 12 -180 0 -181 Q -12 -180 -22 -186 Z"
              fill="#4A3E33" stroke={KRP.ink} strokeWidth={3} />
            {face === "smile" ? (
              <path d="M -12 -172 Q 0 -162 12 -172" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
            ) : face === "surprised" ? (
              <ellipse cx={0} cy={-170} rx={8} ry={10} fill={KRP.ink} />
            ) : (
              <line x1={-9} y1={-170} x2={9} y2={-170} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
            )}
          </g>
        )}
      </g>
    </g>
  );
};

// ===== 明治の郵便局員 (制帽+詰襟制服) =====
const MeijiPost: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "surprised";
  gaze?: [number, number];
  hideArm?: "left" | "right" | "none";
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0], hideArm = "none" }) => {
  const [gx, gy] = gaze;
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const uni = "#3E4C66";
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* 脚 */}
      <rect x={-44} y={-58} width={34} height={52} rx={10} fill="#2E3850" stroke={KRP.ink} strokeWidth={5} />
      <rect x={10} y={-58} width={34} height={52} rx={10} fill="#2E3850" stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={-27} cy={-4} rx={26} ry={10} fill="#3A3F4C" stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={27} cy={-4} rx={26} ry={10} fill="#3A3F4C" stroke={KRP.ink} strokeWidth={5} />
      {/* 腕 */}
      {hideArm !== "left" && (
        <g>
          <rect x={-78} y={-148} width={22} height={82} rx={11} fill={uni} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-67} cy={-62} r={14} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      {hideArm !== "right" && (
        <g>
          <rect x={56} y={-148} width={22} height={82} rx={11} fill={uni} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={67} cy={-62} r={14} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      {/* 肩かけカバン */}
      <line x1={-40} y1={-152} x2={44} y2={-78} stroke="#6B5234" strokeWidth={12} />
      {/* 胴 (詰襟) */}
      <rect x={-58} y={-160} width={116} height={108} rx={26} fill={uni} stroke={KRP.ink} strokeWidth={5} />
      <line x1={0} y1={-158} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={-14} cy={-138 + i * 30} r={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={14} cy={-138 + i * 30} r={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      <rect x={30} y={-92} width={44} height={36} rx={8} fill="#6B5234" stroke={KRP.ink} strokeWidth={5} />
      {/* 頭 */}
      <circle cx={0} cy={-218} r={62} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={5} />
      {/* 制帽 */}
      <path d="M -62 -244 Q -56 -288 0 -288 Q 56 -288 62 -244 Z" fill={uni} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-66} y={-250} width={132} height={16} rx={8} fill="#2E3850" stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -40 -236 L 40 -236 L 30 -224 L -30 -224 Z" fill="#2E3850" stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-268} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <text x={0} y={-262} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={16} fill={KRP.red}>〒</text>
      {/* 顔 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
          <line x1={-28} y1={-210} x2={-12} y2={-210} />
          <line x1={12} y1={-210} x2={28} y2={-210} />
        </g>
      ) : (
        <g>
          <circle cx={-20 + gx} cy={-210 + gy} r={face === "surprised" ? 9 : 6.5} fill={KRP.ink} />
          <circle cx={20 + gx} cy={-210 + gy} r={face === "surprised" ? 9 : 6.5} fill={KRP.ink} />
        </g>
      )}
      {face === "smile" ? (
        <path d="M -12 -180 Q 0 -168 12 -180" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "surprised" ? (
        <ellipse cx={0} cy={-178} rx={8} ry={10} fill={KRP.ink} />
      ) : (
        <line x1={-9} y1={-178} x2={9} y2={-178} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===== 昭和の子ども (坊主/おかっぱ/帽子の3種。半ズボン+すね出し) =====
const ShowaKid: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  kind?: "bozu" | "okappa" | "capboy";
  face?: "normal" | "smile" | "surprised";
  gaze?: [number, number];
  hideArm?: "left" | "right" | "none";
  tiptoe?: number; // 背伸び量 (px)
  armUp?: boolean; // 右腕を上げる
}> = ({
  x, y, s = 1, f = 0, phase = 0, kind = "bozu", face = "smile",
  gaze = [0, 0], hideArm = "none", tiptoe = 0, armUp = false,
}) => {
  const [gx, gy] = gaze;
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const shirt = kind === "okappa" ? "#D88CA0" : kind === "capboy" ? "#7FA8C9" : "#E8C06A";
  const hairCol = "#3A3027";
  return (
    <g transform={`translate(${x} ${y - tiptoe}) scale(${s})`}>
      {/* すね (素足白) + 靴 */}
      <rect x={-34} y={-44} width={24} height={40 + tiptoe / Math.max(s, 0.001)} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={12} y={-44} width={24} height={40 + tiptoe / Math.max(s, 0.001)} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={-22} cy={-4 + tiptoe / Math.max(s, 0.001)} rx={20} ry={9} fill="#5A4632" stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={24} cy={-4 + tiptoe / Math.max(s, 0.001)} rx={20} ry={9} fill="#5A4632" stroke={KRP.ink} strokeWidth={4.5} />
      {/* 半ズボン */}
      <rect x={-42} y={-78} width={84} height={42} rx={12} fill="#5A6B52" stroke={KRP.ink} strokeWidth={4.5} />
      {/* 腕 */}
      {hideArm !== "left" && (
        <g>
          <rect x={-62} y={-124} width={19} height={62} rx={9.5} fill={shirt} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-52} cy={-58} r={12} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {hideArm !== "right" && (
        armUp ? (
          <g>
            <rect x={44} y={-186} width={19} height={66} rx={9.5} fill={shirt} stroke={KRP.ink} strokeWidth={4.5}
              transform="rotate(18 53 -120)" />
            <circle cx={74} cy={-186} r={12} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ) : (
          <g>
            <rect x={43} y={-124} width={19} height={62} rx={9.5} fill={shirt} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={52} cy={-58} r={12} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        )
      )}
      {/* 胴 (シャツ) */}
      <rect x={-46} y={-134} width={92} height={70} rx={20} fill={shirt} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 頭 */}
      <circle cx={0} cy={-182 - bob} r={52} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={4.5} />
      <g transform={`translate(0 ${-bob})`}>
        {kind === "bozu" && (
          <path d="M -50 -196 Q -44 -232 0 -232 Q 44 -232 50 -196 Q 30 -208 0 -208 Q -30 -208 -50 -196 Z"
            fill={hairCol} opacity={0.5} />
        )}
        {kind === "okappa" && (
          <g>
            <path d="M -52 -168 Q -58 -232 0 -234 Q 58 -232 52 -168 L 42 -168 Q 48 -212 0 -214 Q -48 -212 -42 -168 Z"
              fill={hairCol} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -46 -206 Q 0 -222 46 -206 L 46 -196 Q 0 -212 -46 -196 Z" fill={hairCol} />
          </g>
        )}
        {kind === "capboy" && (
          <g>
            <path d="M -50 -206 Q -44 -238 0 -238 Q 44 -238 50 -206 Z" fill="#B8893E" stroke={KRP.ink} strokeWidth={4} />
            <rect x={-54} y={-212} width={108} height={12} rx={6} fill="#96702E" stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        )}
        {/* 顔 */}
        {blink ? (
          <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
            <line x1={-24} y1={-178} x2={-10} y2={-178} />
            <line x1={10} y1={-178} x2={24} y2={-178} />
          </g>
        ) : (
          <g>
            <circle cx={-17 + gx} cy={-178 + gy} r={face === "surprised" ? 8 : 5.5} fill={KRP.ink} />
            <circle cx={17 + gx} cy={-178 + gy} r={face === "surprised" ? 8 : 5.5} fill={KRP.ink} />
          </g>
        )}
        {face === "smile" ? (
          <path d="M -11 -152 Q 0 -141 11 -152" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
        ) : face === "surprised" ? (
          <ellipse cx={0} cy={-150} rx={7} ry={9} fill={KRP.ink} />
        ) : (
          <line x1={-8} y1={-150} x2={8} y2={-150} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
        )}
        <circle cx={-34} cy={-158} r={7} fill={KRP.red} opacity={0.3} />
        <circle cx={34} cy={-158} r={7} fill={KRP.red} opacity={0.3} />
      </g>
    </g>
  );
};

// ===== 俵谷式の木製自販機 (たばこ)。x,y 左上。幅240×高さ340 =====
const WoodBox: React.FC<{ x: number; y: number; s?: number; cloth?: number }> = ({ x, y, s = 1, cloth = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 脚 */}
    <rect x={14} y={322} width={22} height={24} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5} />
    <rect x={204} y={322} width={22} height={24} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5} />
    {/* 本体 (木) */}
    <rect x={0} y={0} width={240} height={330} rx={10} fill="#C9A26B" stroke={KRP.ink} strokeWidth={8} />
    {/* 木目 */}
    <g stroke="#9C7A4A" strokeWidth={3} opacity={0.6} fill="none">
      <path d="M 20 40 Q 60 44 110 40 Q 170 36 222 42" />
      <path d="M 20 150 Q 80 156 140 150 Q 190 146 222 152" />
      <path d="M 20 260 Q 70 264 130 260 Q 185 256 222 262" />
    </g>
    {/* 屋根飾り */}
    <rect x={-12} y={-18} width={264} height={26} rx={6} fill="#A07E4E" stroke={KRP.ink} strokeWidth={6} />
    {/* 看板 「たばこ」 34px×3字=102 ≤ 札180 */}
    <rect x={30} y={26} width={180} height={54} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <text x={120} y={66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>たばこ</text>
    {/* 投入口 */}
    <rect x={96} y={104} width={48} height={30} rx={6} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5} />
    <rect x={112} y={111} width={16} height={16} rx={3} fill={KRP.ink} />
    {/* 商品窓 */}
    <rect x={40} y={152} width={160} height={74} rx={8} fill="#EFE3C2" stroke={KRP.ink} strokeWidth={5} />
    <rect x={56} y={168} width={54} height={42} rx={5} fill="#B85A4A" stroke={KRP.ink} strokeWidth={4} />
    <rect x={128} y={168} width={54} height={42} rx={5} fill="#4A78B8" stroke={KRP.ink} strokeWidth={4} />
    {/* 取っ手 */}
    <circle cx={120} cy={262} r={17} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
    {/* 取り出し口 */}
    <rect x={64} y={290} width={112} height={26} rx={7} fill="#6B5234" stroke={KRP.ink} strokeWidth={5} />
    {/* 布 (#113 用。cloth=0→1 で上からかぶさる) */}
    {cloth > 0 && (
      <g opacity={clamp01(cloth * 3)}>
        <path
          d={`M -26 ${lerp(-320, -30, cloth)}
             Q 60 ${lerp(-340, -56, cloth)} 120 ${lerp(-336, -48, cloth)}
             Q 180 ${lerp(-340, -56, cloth)} 266 ${lerp(-320, -30, cloth)}
             L 262 ${lerp(-100, 236, cloth)}
             Q 220 ${lerp(-80, 262, cloth)} 196 ${lerp(-96, 244, cloth)}
             Q 120 ${lerp(-76, 272, cloth)} 44 ${lerp(-96, 244, cloth)}
             Q 20 ${lerp(-80, 262, cloth)} -22 ${lerp(-100, 236, cloth)} Z`}
          fill="#8FA8B8" stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 60 ${lerp(-300, -20, cloth)} Q 66 ${lerp(-180, 140, cloth)} 56 ${lerp(-110, 230, cloth)}`}
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        <path d={`M 170 ${lerp(-300, -20, cloth)} Q 176 ${lerp(-180, 140, cloth)} 168 ${lerp(-110, 230, cloth)}`}
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      </g>
    )}
  </g>
);

// ===== 切手はがき自働郵券売機 (アーチ屋根の背高キャビネット) =====
const KitteMachine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 脚 */}
    <rect x={20} y={520} width={26} height={28} fill="#6B5234" stroke={KRP.ink} strokeWidth={5} />
    <rect x={274} y={520} width={26} height={28} fill="#6B5234" stroke={KRP.ink} strokeWidth={5} />
    {/* 本体 + アーチ屋根 */}
    <path d="M 0 90 Q 0 10 160 10 Q 320 10 320 90 L 320 528 L 0 528 Z"
      fill="#B08A56" stroke={KRP.ink} strokeWidth={8} />
    <path d="M 14 92 Q 14 26 160 26 Q 306 26 306 92" fill="none" stroke="#8A6F4D" strokeWidth={5} opacity={0.7} />
    {/* 看板 「切手はがき」 32px×5字=160 ≤ 札230 */}
    <rect x={45} y={64} width={230} height={52} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <text x={160} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.ink}>切手はがき</text>
    {/* 左右2列: 切手 / はがき */}
    {[0, 1].map((i) => {
      const cx0 = 32 + i * 152;
      return (
        <g key={i}>
          <rect x={cx0} y={140} width={124} height={330} rx={10} fill="#C9A26B" stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={cx0 + 18} y={158} width={88} height={44} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
          <text x={cx0 + 62} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.ink}>
            {i === 0 ? "切手" : "はがき"}
          </text>
          {/* 投入口 */}
          <rect x={cx0 + 46} y={222} width={32} height={22} rx={4} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={4} />
          <rect x={cx0 + 56} y={227} width={12} height={12} rx={2} fill={KRP.ink} />
          {/* つまみ */}
          <circle cx={cx0 + 62} cy={300} r={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          {/* 取り出し口 */}
          <rect x={cx0 + 22} y={368} width={80} height={24} rx={6} fill="#6B5234" stroke={KRP.ink} strokeWidth={4.5} />
          {/* 窓 */}
          <rect x={cx0 + 22} y={414} width={80} height={38} rx={6} fill="#EFE3C2" stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      );
    })}
    {/* 幕板 */}
    <rect x={14} y={486} width={292} height={30} rx={6} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ===== チャンバラの影絵 (刀を構えた2人のシルエット) =====
const ChanbaraShadow: React.FC<{ f: number; s?: number; color?: string }> = ({ f, s = 1, color = KRP.ink }) => {
  const swing = Math.sin(f / 7);
  const clash = swing > 0.88;
  return (
    <g transform={`scale(${s})`}>
      {/* 左の侍 */}
      <g transform={`translate(-95 0) rotate(${swing * 7})`} fill={color}>
        <circle cx={0} cy={-96} r={22} />
        <path d="M -6 -102 L 24 -112 L 26 -104 L 0 -94 Z" />
        <path d="M -20 -78 L 20 -78 L 26 -8 L -26 -8 Z" />
        <rect x={-24} y={-10} width={16} height={14} rx={4} />
        <rect x={8} y={-10} width={16} height={14} rx={4} />
        <line x1={14} y1={-66} x2={64} y2={-96} stroke={color} strokeWidth={11} strokeLinecap="round" />
        <line x1={58} y1={-93} x2={100} y2={-118 - swing * 16} stroke={color} strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* 右の侍 */}
      <g transform={`translate(95 0) scale(-1 1) rotate(${-swing * 7})`} fill={color}>
        <circle cx={0} cy={-96} r={22} />
        <path d="M -6 -102 L 24 -112 L 26 -104 L 0 -94 Z" />
        <path d="M -20 -78 L 20 -78 L 26 -8 L -26 -8 Z" />
        <rect x={-24} y={-10} width={16} height={14} rx={4} />
        <rect x={8} y={-10} width={16} height={14} rx={4} />
        <line x1={14} y1={-66} x2={64} y2={-96} stroke={color} strokeWidth={11} strokeLinecap="round" />
        <line x1={58} y1={-93} x2={100} y2={-118 + swing * 16} stroke={color} strokeWidth={6} strokeLinecap="round" />
      </g>
      {clash && <Spark cx={0} cy={-120} s={1.2} color={KRP.yellow} />}
    </g>
  );
};

// ===== キャラメルの箱 (赤箱+白帯)。cx,cy 中心。s=1 で 140×90 =====
const CaramelBox: React.FC<{ cx: number; cy: number; s?: number; rotate?: number }> = ({
  cx, cy, s = 1, rotate = 0,
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${s})`}>
    <rect x={-70} y={-45} width={140} height={90} rx={10} fill="#C14B38" stroke={KRP.ink} strokeWidth={6} />
    {/* 白帯 + 「キャラメル」22px×5字=110 ≤ 帯128 */}
    <rect x={-64} y={-16} width={128} height={34} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.ink}>キャラメル</text>
    <rect x={-70} y={-45} width={140} height={16} rx={8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// ===== 映画のカード (フィルム枠+セピアのミニ映写)。cx,cy 中心。s=1 で 180×130 =====
const FilmCard: React.FC<{ cx: number; cy: number; s?: number; f?: number; rotate?: number }> = ({
  cx, cy, s = 1, f = 0, rotate = 0,
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${s})`}>
    <rect x={-90} y={-65} width={180} height={130} rx={8} fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
    {/* パーフォレーション */}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x={-78 + i * 34} y={-58} width={16} height={12} rx={3} fill={KRP.paper} />
        <rect x={-78 + i * 34} y={46} width={16} height={12} rx={3} fill={KRP.paper} />
      </g>
    ))}
    {/* セピアの画面にミニチャンバラ */}
    <rect x={-74} y={-38} width={148} height={76} rx={4} fill="#E3CFA0" stroke={KRP.ink} strokeWidth={4} />
    <g transform="translate(0 34) scale(0.32)">
      <ChanbaraShadow f={f} color="#5A4426" />
    </g>
  </g>
);

// ===== グリコの映画付き自販機 (赤キャビネット+スクリーン)。x,y 左上。s=1 で 340×600 =====
const GlicoMachine: React.FC<{ x: number; y: number; s?: number; f?: number; playing?: boolean }> = ({
  x, y, s = 1, f = 0, playing = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 脚 */}
    <rect x={24} y={592} width={28} height={26} fill="#7A2A20" stroke={KRP.ink} strokeWidth={5} />
    <rect x={288} y={592} width={28} height={26} fill="#7A2A20" stroke={KRP.ink} strokeWidth={5} />
    {/* 本体 */}
    <rect x={0} y={0} width={340} height={600} rx={14} fill="#A33B30" stroke={KRP.ink} strokeWidth={8} />
    {/* 看板 「グリコ」 40px×3字=120 ≤ 札240 */}
    <rect x={50} y={22} width={240} height={58} rx={9} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <text x={170} y={65} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.red}>グリコ</text>
    {/* スクリーン (枠+暗幕) */}
    <rect x={44} y={100} width={252} height={194} rx={10} fill="#6B5234" stroke={KRP.ink} strokeWidth={6} />
    <rect x={56} y={112} width={228} height={170} rx={6} fill={playing ? "#E3CFA0" : "#2E2620"} stroke={KRP.ink} strokeWidth={4.5} />
    {playing && (
      <g>
        <rect x={56} y={112} width={228} height={170} rx={6} fill="#FFF6CE" opacity={0.1 + 0.08 * Math.sin(f / 3)} />
        <g transform="translate(170 266) scale(0.56)">
          <ChanbaraShadow f={f} color="#5A4426" />
        </g>
      </g>
    )}
    {/* 10銭札 36px×3字=108 ≤ 札150 */}
    <rect x={95} y={316} width={150} height={50} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <text x={170} y={352} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>10銭</text>
    {/* 投入口 */}
    <rect x={138} y={388} width={64} height={34} rx={6} fill="#7A2A20" stroke={KRP.ink} strokeWidth={5} />
    <rect x={160} y={395} width={18} height={20} rx={3} fill={KRP.ink} />
    {/* つまみ */}
    <circle cx={170} cy={474} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
    {/* 取り出し口 + 受け皿 */}
    <rect x={92} y={520} width={156} height={34} rx={8} fill="#6B5234" stroke={KRP.ink} strokeWidth={5.5} />
    <path d="M 92 554 Q 170 576 248 554" fill="none" stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ===== #104/#105 共通: 木箱の断面コインメック (第8章と同じ構図=縦糸) =====
// レール: (420,560)→(1180,640) 右下がり約-6°。関門(寸法ゲート)は x=800 (railY=600)
const railY = (x: number) => 560 + ((x - 420) * 80) / 760;

const WoodMechScene: React.FC<{ f: number; mode: "pass" | "reject"; seed: number; caption: string }> = ({
  f, mode, seed, caption,
}) => {
  const fc = f % 90;
  const r = mode === "pass" ? 34 : 46;
  // 本物: 落下→転がり→関門→金庫口。ニセ物: 関門で跳ね返り→返却トレイ
  let cx = 420, cy = 340, rot = 0, sc = 1, op = 1, squashY = 1;
  if (mode === "pass") {
    const tf = seg(fc, 0, 8);
    const t1 = seg(fc, 8, 40);
    const t2 = seg(fc, 40, 62);
    const t3 = seg(fc, 62, 76);
    if (fc < 8) {
      cx = 420; cy = lerp(340, railY(420) - 9 - r, tf * tf);
    } else if (fc < 40) {
      cx = lerp(420, 800, t1); cy = railY(cx) - 9 - r; rot = (cx - 420) * 1.7;
    } else if (fc < 62) {
      cx = lerp(800, 1180, t2); cy = railY(cx) - 9 - r; rot = (cx - 420) * 1.7;
    } else {
      cx = lerp(1180, 1250, t3); cy = lerp(railY(1180) - 9 - r, 700, t3 * t3);
      rot = (1180 - 420) * 1.7 + t3 * 90; sc = 1 - 0.45 * t3; op = 1 - seg(fc, 70, 76);
    }
  } else {
    const tf = seg(fc, 0, 8);
    const t1 = seg(fc, 8, 38);
    const tb = seg(fc, 38, 46);
    const t2 = seg(fc, 46, 62);
    if (fc < 8) {
      cx = 420; cy = lerp(340, railY(420) - 9 - r, tf * tf);
    } else if (fc < 38) {
      cx = lerp(420, 700, t1); cy = railY(cx) - 9 - r; rot = (cx - 420) * 1.6;
    } else if (fc < 46) {
      cx = lerp(700, 676, tb); cy = railY(cx) - 9 - r - Math.sin(tb * Math.PI) * 14;
      rot = (700 - 420) * 1.6 - tb * 30;
    } else if (fc < 62) {
      cx = lerp(676, 820, t2); cy = (railY(676) - 9 - r) + 300 * t2 * t2;
      rot = (700 - 420) * 1.6 - 30 - t2 * 120;
    } else {
      cx = 820; cy = (railY(676) - 9 - r) + 300;
      rot = (700 - 420) * 1.6 - 150;
      squashY = fc < 66 ? 1 - 0.18 * Math.sin(seg(fc, 62, 66) * Math.PI) : 1;
      op = 1 - seg(fc, 86, 90);
    }
  }
  // 関門の下げ札 (本物が通る時だけ開く)
  const flapOpen = mode === "pass"
    ? easeOut(seg(fc, 30, 44)) - easeOut(seg(fc, 52, 64))
    : 0.1 * Math.sin(seg(fc, 36, 48) * Math.PI); // ニセ物はびくっと揺れるだけ
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={seed} />
        <g filter="url(#wobbleSoft)">
          {/* 木箱の断面カード */}
          <rect x={280} y={170} width={1360} height={760} rx={20} fill="#C9A26B" stroke={KRP.ink} strokeWidth={9} />
          <rect x={320} y={210} width={1280} height={680} rx={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <g stroke="#9C7A4A" strokeWidth={4} opacity={0.5} fill="none">
            <path d="M 300 260 Q 302 500 298 860" />
            <path d="M 1620 260 Q 1618 520 1622 860" />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 投入口ホッパー (左上) */}
          <path d="M 360 250 L 480 250 L 452 330 L 388 330 Z" fill="#B08A56" stroke={KRP.ink} strokeWidth={6} />
          <rect x={398} y={236} width={44} height={18} rx={4} fill={KRP.ink} />
          <line x1={388} y1={330} x2={400} y2={430} stroke={KRP.ink} strokeWidth={7} />
          <line x1={452} y1={330} x2={440} y2={430} stroke={KRP.ink} strokeWidth={7} />
          {/* レール */}
          <line x1={420} y1={560} x2={1180} y2={640} stroke="#8A6F4D" strokeWidth={18} strokeLinecap="round" />
          <line x1={420} y1={560} x2={1180} y2={640} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
          {/* 寸法の関門 (木の鳥居型ゲート) */}
          <rect x={748} y={425} width={16} height={170} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5} />
          <rect x={836} y={434} width={16} height={170} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5} />
          <rect x={740} y={410} width={120} height={30} rx={6} fill="#A07E4E" stroke={KRP.ink} strokeWidth={5.5} />
          <g transform={`rotate(${-55 * clamp01(flapOpen)} 800 442)`}>
            <rect x={792} y={442} width={16} height={100} rx={6} fill="#C9A26B" stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 金庫 (右下) */}
          <rect x={1190} y={620} width={150} height={270} rx={10} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={7} />
          <rect x={1214} y={668} width={72} height={64} rx={8} fill="#3A2E22" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1264} cy={810} r={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
          {/* 返却トレイ (関門の下) */}
          <rect x={814} y={760} width={12} height={82} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={820} cy={842} rx={92} ry={20} fill="#B08A56" stroke={KRP.ink} strokeWidth={6} />
          {/* 硬貨 */}
          <g opacity={op} transform={`translate(${cx} ${cy}) scale(${sc} ${sc * squashY}) translate(${-cx} ${-cy})`}>
            <Coin cx={cx} cy={cy} r={r} fill={mode === "pass" ? KRP.copper : KRP.gray} rotate={rot}
              text={mode === "pass" ? "5" : undefined} />
          </g>
          {mode === "reject" && fc >= 38 && fc < 50 && (
            <g opacity={1 - seg(fc, 44, 50)}>
              <Spark cx={742} cy={railY(720) - 70} s={0.9} color={KRP.red} />
            </g>
          )}
          {/* 部位ラベル */}
          <TagPlate x={420} y={200} text="投入口" t={seg(f, 6, 16)} />
          <TagPlate x={800} y={350} text="寸法の関門" t={seg(f, 14, 24)} />
          <TagPlate x={1430} y={700} text="金庫口" t={seg(f, 22, 32)} />
          <TagPlate x={590} y={840} text="返却トレイ" t={seg(f, 30, 40)} />
          {mode === "pass" && (
            <g>
              <TagPlate x={672} y={470} text="大きさ" size={22} t={seg(f, 40, 50)} />
              <TagPlate x={935} y={500} text="重さ" size={22} t={seg(f, 46, 56)} />
            </g>
          )}
          {mode === "reject" && (
            <g opacity={seg(f, 40, 52)}>
              <line x1={890} y1={240} x2={960} y2={310} stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
              <line x1={960} y1={240} x2={890} y2={310} stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text={caption} />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// 第5章 (#92〜#113)
// ============================================================

// #92 章扉: 地球儀→日本地図ズーム→下関にピン→日の丸+「1888年 下関」
const SceneCh5Door: React.FC<{ f: number }> = ({ f }) => {
  const lon0 = JMAP.shimonoseki[0] + (1 - easeOut(seg(f, 0, 50))) * 420;
  const gp = globePoint(710, 470, 330, JMAP.shimonoseki[0], JMAP.shimonoseki[1], lon0);
  const xfade = easeOut(seg(f, 70, 96));
  const ms = 0.62 + 0.38 * xfade;
  const [sx, sy] = jmapXY(JMAP.shimonoseki[0], JMAP.shimonoseki[1]);
  const titleT = easeOut(seg(f, 112, 130));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={160} />
        <g filter="url(#wobble)">
          {/* 地球儀 (回って日本が正面に来たら地図へクロスフェード) */}
          <g opacity={1 - xfade}>
            <Globe cx={710} cy={470} r={330} lon0={lon0} f={f} />
            {gp.visible && <MapPin x={gp.x} y={gp.y} t={seg(f, 52, 66)} s={0.8} />}
          </g>
          {/* 日本地図カードがズームイン */}
          {xfade > 0.01 && (
            <g opacity={xfade} transform={`translate(${960 - 960 * ms} ${540 - 540 * ms}) scale(${ms})`}>
              <JapanMapCard>
                <MapPin x={sx} y={sy} t={seg(f, 96, 110)} />
                <JmapLabel lon={JMAP.shimonoseki[0]} lat={JMAP.shimonoseki[1]} text="下関" dx={-150} dy={56} />
              </JapanMapCard>
            </g>
          )}
          <g transform="translate(1480 300)" opacity={clamp01(seg(f, 102, 116) * 2)}>
            <g transform={`scale(${0.6 + 0.75 * pop(seg(f, 102, 116))})`}>
              <FlagCard kind="japan" x={0} y={0} s={1} />
            </g>
          </g>
        </g>
      </svg>
      {f >= 118 && <Stamp x={1180} y={430} text="1888年 下関" size={40} />}
      <div
        style={{
          position: "absolute", left: 1060, top: 620, width: 800,
          opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
          fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, color: KRP.grayDark, marginBottom: 6 }}>第5章</div>
        <div
          style={{
            fontSize: 52, fontWeight: 900, color: KRP.ink, lineHeight: 1.3,
            borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
            background: "rgba(253,251,247,0.82)", borderRadius: 8, padding: "4px 10px 10px",
          }}
        >
          日本の1号機は木でできていた
        </div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #93 明治時代・下関の港町 (海+蒸気船+瓦屋根+カモメ)
const SceneMeijiPort: React.FC<{ f: number }> = ({ f }) => {
  const boatBob = Math.sin(f / 16) * 6;
  const shipX = lerp(300, 420, easeOut(seg(f, 0, 150)));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={161} />
        <g filter="url(#wobbleSoft)">
          {/* 空と海 */}
          <rect x={0} y={0} width={W} height={620} fill="#EAF0F4" />
          <rect x={0} y={620} width={W} height={460} fill={KRP.blueSoft} />
          {/* 遠くの山 */}
          <path d="M 1250 620 Q 1450 430 1680 620 Z" fill="#B7C9B0" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1550 620 Q 1740 470 1920 600 L 1920 620 Z" fill="#A8BCA0" stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g filter="url(#wobble)">
          {/* 蒸気船 (ゆっくり進む) */}
          <g transform={`translate(${shipX} ${560 + boatBob})`}>
            <path d="M -150 40 L 150 40 L 118 96 L -118 96 Z" fill="#5A6B7A" stroke={KRP.ink} strokeWidth={6} />
            <rect x={-60} y={-8} width={120} height={48} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-16} y={-66} width={32} height={60} rx={6} fill="#B85A4A" stroke={KRP.ink} strokeWidth={5} />
            {/* 煙 (ぽこぽこ上る) */}
            {[0, 1, 2].map((i) => {
              const t = ((f * 0.9 + i * 50) % 150) / 150;
              return (
                <circle key={i} cx={0 + t * 70} cy={-80 - t * 110} r={12 + t * 20}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} opacity={0.8 * (1 - t)} />
              );
            })}
          </g>
          {/* 波 (横に流れる) */}
          {[0, 1, 2, 3].map((i) => {
            const wx = ((f * (1.2 + i * 0.3) + i * 420) % (W + 300)) - 150;
            return (
              <path key={i} d={`M ${wx - 70} ${700 + i * 80} Q ${wx - 35} ${688 + i * 80} ${wx} ${700 + i * 80} Q ${wx + 35} ${712 + i * 80} ${wx + 70} ${700 + i * 80}`}
                fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
            );
          })}
          {/* 桟橋 */}
          <rect x={880} y={760} width={1040} height={44} fill="#B08A56" stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={940 + i * 210} y={804} width={26} height={120} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5} />
          ))}
          {/* 瓦屋根の町並み */}
          {[0, 1, 2].map((i) => {
            const hx = 1020 + i * 300;
            return (
              <g key={i}>
                <rect x={hx} y={620} width={220} height={140} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
                <path d={`M ${hx - 26} 620 Q ${hx + 110} 560 ${hx + 246} 620 Z`} fill="#5A6B7A" stroke={KRP.ink} strokeWidth={6} />
                <rect x={hx + 30} y={660} width={52} height={70} rx={4} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={4.5} />
                <rect x={hx + 130} y={660} width={52} height={52} rx={4} fill="#EFE3C2" stroke={KRP.ink} strokeWidth={4.5} />
                <line x1={hx + 156} y1={660} x2={hx + 156} y2={712} stroke={KRP.ink} strokeWidth={3.5} />
              </g>
            );
          })}
          {/* カモメ */}
          {[0, 1].map((i) => {
            const gx = ((f * (2 + i) + i * 700) % (W + 240)) - 120;
            const gy = 200 + i * 110 + Math.sin(f / 10 + i * 2) * 16;
            const flap = Math.sin(f / 5 + i) * 14;
            return (
              <g key={i} stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round">
                <path d={`M ${gx - 34} ${gy - flap} Q ${gx} ${gy + 10} ${gx + 34} ${gy - flap}`} />
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="明治時代・下関の港町" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #94 俵谷高七: 作業台で鉋がけ (体ごと押して木くずが舞う)
const SceneTawaraya: React.FC<{ f: number }> = ({ f }) => {
  const fc = f % 48;
  const push = easeOut(seg(fc, 4, 26)) - easeOut(seg(fc, 30, 46));
  const kx = push * 190;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={162} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={770} width={W} height={310} fill={KRP.floor} />
          {/* 工房の壁飾り: 道具棚 */}
          <rect x={1340} y={210} width={420} height={240} rx={12} fill="#EFE3C2" stroke={KRP.ink} strokeWidth={6} />
          <line x1={1340} y1={330} x2={1760} y2={330} stroke={KRP.ink} strokeWidth={5} />
          {/* のこぎり */}
          <g transform="translate(1420 270)">
            <rect x={0} y={-8} width={70} height={16} rx={8} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={4} />
            <path d="M 70 -10 L 210 -4 L 70 12 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 金づち */}
          <g transform="translate(1480 390)">
            <rect x={-8} y={-46} width={16} height={70} rx={6} fill="#B08A56" stroke={KRP.ink} strokeWidth={4} />
            <rect x={-36} y={-62} width={72} height={26} rx={8} fill="#5A6B7A" stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 曲尺 */}
          <path d="M 1640 240 L 1660 240 L 1660 400 L 1600 400 L 1600 380 L 1640 380 Z"
            fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g filter="url(#wobble)">
          {/* 作業台 */}
          <rect x={330} y={700} width={980} height={48} rx={8} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={7} />
          <rect x={380} y={748} width={44} height={120} fill="#6B5234" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1210} y={748} width={44} height={120} fill="#6B5234" stroke={KRP.ink} strokeWidth={6} />
          {/* 削る板材 */}
          <rect x={460} y={662} width={760} height={40} rx={6} fill="#C9A26B" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 480 682 Q 700 678 1200 684" fill="none" stroke="#9C7A4A" strokeWidth={3.5} opacity={0.7} />
          {/* 俵屋 (体ごと押しに行く) */}
          <g transform={`translate(${kx * 0.35} 0)`}>
            <Tawaraya x={640} y={880} s={1.05} f={f} hideArm="both" lean={push * 7} gaze={[4, 5]} face="normal" />
            <Arm x1={590 + kx * 0.2} y1={752} x2={672 + kx} y2={648} cloth="#5D7390" />
            <Arm x1={700 + kx * 0.2} y1={752} x2={800 + kx} y2={648} cloth="#5D7390" />
          </g>
          {/* 鉋 */}
          <g transform={`translate(${kx} 0)`}>
            <rect x={640} y={628} width={176} height={34} rx={8} fill="#B08A56" stroke={KRP.ink} strokeWidth={6} />
            <rect x={712} y={596} width={30} height={40} rx={4} fill="#5A6B7A" stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* 木くず (押すたびにくるんと飛ぶ) */}
          {[0, 1, 2].map((i) => {
            const t = clamp01((fc - 10 - i * 5) / 30);
            if (t <= 0) return null;
            const sx = 820 + kx + i * 22;
            return (
              <path key={i}
                d={`M ${sx + t * 120} ${600 - Math.sin(t * Math.PI) * 90 + i * 14}
                   q 14 -18 28 -4 q 12 12 -4 22 q -14 8 -20 -6`}
                fill="none" stroke="#C9A26B" strokeWidth={7} strokeLinecap="round" opacity={1 - t} />
            );
          })}
          {/* 床の削りくず */}
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${500 + i * 230} ${808 + (i % 2) * 26} q 16 -20 32 -6 q 14 12 -4 24`}
              fill="none" stroke="#C9A26B" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
          ))}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="下関の指物師・俵谷高七" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #95 指物の技: ほぞがゆっくりはまる→カチッ→クギに斜線
const SceneSashimono: React.FC<{ f: number }> = ({ f }) => {
  const fit = easeOut(seg(f, 12, 68));
  const topY = lerp(220, 414, fit);
  const kachi = seg(f, 70, 84);
  const nailT = seg(f, 88, 102);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={163} />
        <g filter="url(#wobbleSoft)">
          <rect x={250} y={150} width={1060} height={800} rx={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          {/* 下の材 (ほぞ穴あき) */}
          <rect x={480} y={560} width={600} height={180} rx={10} fill="#C9A26B" stroke={KRP.ink} strokeWidth={7} />
          <rect x={700} y={560} width={160} height={92} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={6} />
          <path d="M 500 650 Q 640 646 1060 652" fill="none" stroke="#9C7A4A" strokeWidth={3.5} opacity={0.7} />
          {/* 上の材 (ほぞ付き) がゆっくり降りてはまる */}
          <g transform={`translate(0 ${topY - 414})`}>
            <rect x={560} y={244} width={440} height={130} rx={10} fill="#B08A56" stroke={KRP.ink} strokeWidth={7} />
            <rect x={706} y={374} width={148} height={84} fill="#B08A56" stroke={KRP.ink} strokeWidth={6} />
            <path d="M 580 310 Q 760 306 980 312" fill="none" stroke="#8A6F4D" strokeWidth={3.5} opacity={0.7} />
          </g>
          {/* カチッ (はまった瞬間のキラッ+衝撃線) */}
          {kachi > 0 && kachi < 1 && (
            <g opacity={1 - kachi}>
              <Spark cx={660} cy={540} s={0.9} />
              <Spark cx={900} cy={540} s={0.9} />
              <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
                <line x1={640} y1={498} x2={616} y2={470} />
                <line x1={920} y1={498} x2={944} y2={470} />
              </g>
            </g>
          )}
          {kachi >= 1 && <TagPlate x={780} y={492} text="カチッ" size={30} t={1} />}
          {/* クギは使わない (丸にクギ+斜線) */}
          {nailT > 0 && (
            <g transform={`translate(1430 400) scale(${0.6 + 0.4 * pop(nailT)})`} opacity={clamp01(nailT * 2)}>
              <circle cx={0} cy={0} r={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
              {/* クギ */}
              <g transform="rotate(38)">
                <rect x={-10} y={-76} width={20} height={118} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
                <rect x={-30} y={-92} width={60} height={18} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
                <path d="M -10 42 L 0 74 L 10 42 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
              </g>
              <line x1={-96} y1={96} x2={96} y2={-96} stroke={KRP.red} strokeWidth={16} strokeLinecap="round" />
              <circle cx={0} cy={0} r={130} fill="none" stroke={KRP.red} strokeWidth={14} />
            </g>
          )}
          {nailT >= 1 && <TagPlate x={1430} y={580} text="クギを使わない" size={26} t={1} />}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="クギを使わず木を組む指物の技" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #96 噂話: 郵便局員が俵屋に耳打ち→「…！」
const ScenePostRumor: React.FC<{ f: number }> = ({ f }) => {
  const whisT = seg(f, 14, 28);
  const excT = seg(f, 56, 70);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={164} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={780} width={W} height={300} fill={KRP.floor} />
          {/* 郵便ポスト (明治の黒柱型) */}
          <g transform="translate(320 780)">
            <rect x={-56} y={-360} width={112} height={360} rx={14} fill="#3A3F4C" stroke={KRP.ink} strokeWidth={6} />
            <path d="M -66 -360 Q 0 -404 66 -360 Z" fill="#2E3340" stroke={KRP.ink} strokeWidth={6} />
            <rect x={-34} y={-330} width={68} height={14} rx={7} fill={KRP.ink} />
            <rect x={-40} y={-250} width={80} height={60} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={0} y={-208} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>〒</text>
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 郵便局員 (左手を口に当てて耳打ち) */}
          <MeijiPost x={760} y={880} s={1.05} f={f} hideArm="right" face="smile" gaze={[6, 2]} />
          <Arm x1={815} y1={742} x2={850} y2={658} cloth="#3E4C66" />
          {/* 俵屋 (聞いている) */}
          <Tawaraya x={1180} y={880} s={1.05} f={f} phase={3} gaze={[-6, 0]} face={excT > 0 ? "surprised" : "normal"} />
          {/* ひそひそ (点々のミニ吹き出し) */}
          <Bubble x={950} y={520} w={220} h={120} t={whisT} tailTo={[870, 650]}>
            <g fill={KRP.ink}>
              <circle cx={-50} cy={0} r={11} />
              <circle cx={0} cy={0} r={11} />
              <circle cx={50} cy={0} r={11} />
            </g>
          </Bubble>
          {/* 「…！」 俵屋の反応 */}
          <Bubble x={1360} y={460} w={230} h={140} t={excT} tailTo={[1240, 620]}>
            <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.ink}>…！</text>
          </Bubble>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="ある日 耳よりな噂が届く" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #97 外国には「お金を入れると物が出る箱」があるらしい (想像の大吹き出しにゆらめく灰色の機械)
const SceneForeignShadow: React.FC<{ f: number }> = ({ f }) => {
  const bubT = seg(f, 10, 26);
  const wob = Math.sin(f / 11) * 5;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={165} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <Tawaraya x={440} y={900} s={1.1} f={f} gaze={[8, -6]} face="normal" headTilt={-4} />
          {/* もくもくの想像吹き出し */}
          <g opacity={clamp01(bubT * 2)} transform={`translate(1130 430) scale(${0.7 + 0.3 * pop(bubT)})`}>
            <circle cx={-560} cy={300} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-480} cy={230} r={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            {/* 雲形 */}
            <path d="M -380 120 Q -420 20 -300 -10 Q -280 -130 -120 -120 Q -40 -210 120 -160 Q 300 -190 350 -60
                     Q 470 -30 440 90 Q 470 210 330 240 Q 260 330 100 300 Q -60 360 -180 280 Q -340 310 -380 120 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            {/* ゆらめく灰色の機械 (正体不明のシルエット) */}
            <g transform={`translate(${wob} 0)`} opacity={0.8}>
              <rect x={-110} y={-120} width={220} height={300} rx={14} fill={KRP.gray} stroke={KRP.grayDark} strokeWidth={7} />
              <rect x={-70} y={-86} width={140} height={90} rx={8} fill={KRP.grayDark} opacity={0.55} />
              <circle cx={0} cy={80} r={22} fill={KRP.grayDark} opacity={0.65} />
              <rect x={-52} y={126} width={104} height={22} rx={6} fill={KRP.grayDark} opacity={0.55} />
              <text x={0} y={-160} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={KRP.grayDark}>？</text>
            </g>
            {/* コインが入って物が出る矢印 */}
            <g opacity={seg(f, 40, 56)}>
              <Coin cx={-200} cy={-60} r={26} fill={KRP.copper} />
              <path d="M -165 -60 L -125 -60" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
              <path d="M -135 -72 L -121 -60 L -135 -48" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            </g>
            <g opacity={seg(f, 56, 72)}>
              <path d="M 125 140 L 165 140" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
              <path d="M 155 128 L 169 140 L 155 152" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
              <rect x={184} y={116} width={70} height={48} rx={8} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
            </g>
          </g>
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #98 実物を見たことがない (首をかしげる俵屋+「？」が増える)
const SceneNeverSeen: React.FC<{ f: number }> = ({ f }) => {
  const tilt = Math.sin(f / 22) * 3 - 7 * easeOut(seg(f, 10, 40));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={166} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <Tawaraya x={880} y={900} s={1.25} f={f} headTilt={tilt} face="worried" gaze={[4, -4]} />
          {/* ？がぽんぽん浮かぶ */}
          {[0, 1, 2].map((i) => {
            const t = seg(f, 24 + i * 22, 38 + i * 22);
            if (t <= 0) return null;
            const px = 1180 + i * 150;
            const py = 420 - i * 90;
            return (
              <g key={i} transform={`translate(${px} ${py + Math.sin(f / 14 + i) * 8}) scale(${0.6 + 0.4 * pop(t)})`}
                opacity={clamp01(t * 2)}>
                <circle cx={0} cy={0} r={56 + i * 8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
                <text x={0} y={22 + i * 2} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                  fontSize={62 + i * 10} fill={KRP.ink}>？</text>
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="でも実物は誰も見たことがない" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #99 「なら木で作ってしまえ」: 腕まくり→板が5枚飛んできて木箱に組み上がる
const SceneBuildWood: React.FC<{ f: number }> = ({ f }) => {
  const boxT = easeOut(seg(f, 96, 120));
  const planks: Array<[number, number, number, number, number]> = [
    // [飛び始めフレーム, 目標x, 目標y, 幅, 回転]
    [30, 1130, 420, 250, -6],
    [42, 1130, 500, 250, 4],
    [54, 1130, 580, 250, -3],
    [66, 1040, 500, 60, 86],
    [78, 1230, 500, 60, 94],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={167} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          {/* 俵屋: 腕まくりでやる気 (右腕を高く) */}
          <Tawaraya x={430} y={900} s={1.1} f={f} hideArm="right" face="smile" gaze={[8, -6]} />
          <Arm x1={492} y1={770} x2={560} y2={640 - easeOut(seg(f, 6, 20)) * 40} cloth="#5D7390" />
          {/* 気合いの線 */}
          <g opacity={seg(f, 14, 24) * (1 - seg(f, 70, 90))} stroke={KRP.orange} strokeWidth={7} strokeLinecap="round">
            <line x1={560} y1={520} x2={540} y2={470} />
            <line x1={610} y1={540} x2={620} y2={486} />
            <line x1={500} y1={540} x2={468} y2={500} />
          </g>
          {/* 板が飛んできて組み上がる */}
          {boxT < 0.5 && planks.map(([t0, txx, tyy, ww, rr], i) => {
            const t = easeOut(seg(f, t0, t0 + 20));
            if (t <= 0) return null;
            const px = lerp(i % 2 === 0 ? -200 : 2100, txx, t);
            const py = lerp(140 + i * 60, tyy, t);
            const rot = lerp(i % 2 === 0 ? -200 : 220, rr, t);
            return (
              <g key={i} transform={`translate(${px} ${py}) rotate(${rot})`}>
                <rect x={-ww / 2} y={-26} width={ww} height={52} rx={8}
                  fill="#C9A26B" stroke={KRP.ink} strokeWidth={6} />
                <line x1={-ww / 2 + 14} y1={0} x2={ww / 2 - 14} y2={0} stroke="#9C7A4A" strokeWidth={3} opacity={0.7} />
              </g>
            );
          })}
          {/* 完成した木箱へクロスフェード */}
          {boxT > 0 && (
            <g opacity={boxT} transform={`translate(1010 350) scale(${0.9 + 0.1 * boxT})`}>
              <WoodBox x={0} y={0} s={1.3} />
            </g>
          )}
          {boxT >= 1 && (
            <g>
              <Spark cx={980} cy={330} s={1} />
              <Spark cx={1360} cy={820} s={0.8} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="見たことがないなら 木で作ってしまえ" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #100 1888年 たばこ自販機の特許出願 (木箱+特許の書類+ハンコ)
const SceneTobaccoPatent: React.FC<{ f: number }> = ({ f }) => {
  const paperT = easeOut(seg(f, 16, 36));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={168} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <WoodBox x={380} y={420} s={1.35} />
          {/* 特許の書類 (すっと立ち上がる) */}
          <g opacity={paperT} transform={`translate(${lerp(1300, 1210, paperT)} ${lerp(380, 330, paperT)}) rotate(${lerp(10, 3, paperT)})`}>
            <rect x={0} y={0} width={420} height={540} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <text x={210} y={86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>特許願</text>
            <line x1={60} y1={120} x2={360} y2={120} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1={60} y1={170 + i * 54} x2={i === 5 ? 240 : 360} y2={170 + i * 54}
                stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round"
                opacity={0.55 * seg(f, 30 + i * 6, 40 + i * 6)} />
            ))}
            {/* 木箱のミニ図面 */}
            <g opacity={seg(f, 48, 62)}>
              <rect x={268} y={400} width={110} height={118} rx={6} fill="none" stroke={KRP.blueDeep} strokeWidth={4} />
              <rect x={292} y={418} width={62} height={24} rx={4} fill="none" stroke={KRP.blueDeep} strokeWidth={3.5} />
              <circle cx={323} cy={478} r={10} fill="none" stroke={KRP.blueDeep} strokeWidth={3.5} />
            </g>
          </g>
        </g>
      </svg>
      {f >= 86 && <Stamp x={1280} y={660} text="特許出願" size={46} />}
      <LabelPill x={960} y={170} centerX text="1888年 たばこ自販機で特許を出願" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #101 これが記録に残る日本初 (木箱に「日本1号機」の大ハンコ+衝撃線)
const SceneJapanFirst: React.FC<{ f: number }> = ({ f }) => {
  const stampT = seg(f, 30, 44);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={169} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
          {/* 後光 (放射) */}
          <g opacity={0.35 * seg(f, 44, 70)}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
              const a = (i * 30 + 15) * (Math.PI / 180);
              return (
                <path key={i}
                  d={`M 960 470 L ${960 + Math.cos(a) * 820} ${470 + Math.sin(a) * 820 * 0.7}
                     L ${960 + Math.cos(a + 0.12) * 820} ${470 + Math.sin(a + 0.12) * 820 * 0.7} Z`}
                  fill={KRP.yellow} />
              );
            })}
          </g>
        </g>
        <g filter="url(#wobble)">
          <WoodBox x={790} y={310} s={1.5} />
          <Burst cx={960} cy={500} t={seg(f, 42, 70)} r0={340} />
        </g>
      </svg>
      {stampT > 0 && (
        <div style={{ position: "absolute", left: 1190, top: 320, transform: `scale(${0.6 + 0.4 * pop(stampT)})`, transformOrigin: "left top" }}>
          <Stamp x={0} y={0} text="日本1号機" size={66} />
        </div>
      )}
      <LabelPill x={960} y={170} centerX text="記録に残る日本初の自動販売機" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #102 ただの箱じゃない (木箱にぐっと寄る+「！」)
const SceneNotJustBox: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.55 * easeOut(seg(f, 8, 70));
  const exT = seg(f, 76, 90);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={170} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(${960 - 960 * zoom} ${610 - 610 * zoom}) scale(${zoom})`}>
            <WoodBox x={810} y={360} s={1.25} />
          </g>
          {/* 「！」 */}
          {exT > 0 && (
            <g transform={`translate(1430 300) scale(${0.6 + 0.4 * pop(exT)})`} opacity={clamp01(exT * 2)}>
              <circle cx={0} cy={0} r={80} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={7} />
              <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={KRP.ink}>！</text>
            </g>
          )}
          {/* 注目の視線線 */}
          <g opacity={seg(f, 60, 74)} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
            <line x1={620} y1={300} x2={690} y2={360} />
            <line x1={560} y1={470} x2={650} y2={490} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="しかもこれ ただの箱じゃない" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #103 ニセ金よけ付き (扉が開いて中のからくりがチラ見え+バッジ)
const SceneNiseganeBadge: React.FC<{ f: number }> = ({ f }) => {
  const openT = easeOut(seg(f, 20, 56));
  const badgeT = seg(f, 70, 86);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={171} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          {/* 中身 (扉の奥のからくり: ミニレール+ゲート) */}
          <g transform="translate(700 300) scale(1.4)">
            <rect x={0} y={0} width={240} height={330} rx={10} fill="#EFE3C2" stroke={KRP.ink} strokeWidth={8} />
            <g opacity={clamp01(openT * 1.6)}>
              <line x1={30} y1={120} x2={210} y2={150} stroke="#8A6F4D" strokeWidth={10} strokeLinecap="round" />
              <rect x={108} y={76} width={10} height={62} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={3} />
              <rect x={146} y={82} width={10} height={62} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={3} />
              <rect x={100} y={64} width={64} height={16} rx={4} fill="#A07E4E" stroke={KRP.ink} strokeWidth={3.5} />
              <circle cx={62} cy={104} r={13} fill={KRP.copper} stroke={KRP.ink} strokeWidth={3.5} />
              <rect x={28} y={210} width={80} height={46} rx={6} fill="#C9A26B" stroke={KRP.ink} strokeWidth={4} />
              <rect x={140} y={200} width={70} height={90} rx={6} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={4} />
            </g>
            {/* 開く扉 (scaleX で手前に開く表現) */}
            <g transform={`translate(0 0) scale(${1 - 0.92 * openT} 1)`}>
              <rect x={0} y={0} width={240} height={330} rx={10} fill="#C9A26B" stroke={KRP.ink} strokeWidth={8} />
              <rect x={30} y={26} width={180} height={54} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={206} cy={170} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        </g>
      </svg>
      {badgeT > 0 && (
        <div style={{ position: "absolute", left: 1270, top: 360, transform: `scale(${0.6 + 0.4 * pop(badgeT)})`, transformOrigin: "left top" }}>
          <Stamp x={0} y={0} text="ニセ金よけ" size={56} />
        </div>
      )}
      <LabelPill x={960} y={170} centerX text="中にはニセ金よけの仕掛けが" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #104 木のレールを転がして選別 (第8章コインメックと同じ構図=縦糸)
const SceneWoodRail: React.FC<{ f: number }> = ({ f }) => (
  <WoodMechScene f={f} mode="pass" seed={172} caption="重さと大きさでふるいにかける" />
);

// #105 ニセ物は関門ではじかれて返却トレイへ
const SceneWoodReject: React.FC<{ f: number }> = ({ f }) => (
  <WoodMechScene f={f} mode="reject" seed={173} caption="ニセ物ははじいて突き返す" />
);

// #106 売り切れたらお金を返す (札が「売切」に返り、コインが受け皿へ戻る)
const SceneSoldoutReturn: React.FC<{ f: number }> = ({ f }) => {
  const flipT = easeOut(seg(f, 20, 40));
  const coinIn = seg(f, 50, 68);
  const coinOut = seg(f, 78, 100);
  const coinX = coinIn < 1 ? lerp(380, 560, easeOut(coinIn)) : 560;
  const coinY = coinIn < 1 ? lerp(430, 496, coinIn) : 496;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={174} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <WoodBox x={700} y={330} s={1.45} />
          {/* 「あり⇄売切」の札 (窓の上でパタッと裏返る) */}
          <g transform={`translate(1048 540)`}>
            <g transform={`scale(1 ${Math.abs(1 - 2 * flipT)})`}>
              <rect x={-86} y={-36} width={172} height={72} rx={9}
                fill={flipT < 0.5 ? KRP.green : KRP.red} stroke={KRP.ink} strokeWidth={6} />
              <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.white}>
                {flipT < 0.5 ? "あり" : "売切"}
              </text>
            </g>
          </g>
          {/* コイン: 投入口へ入る → 下の取り出し口から戻る */}
          {coinIn > 0 && coinIn < 1 && (
            <Coin cx={coinX} cy={coinY} r={30} fill={KRP.copper} rotate={coinIn * 240} />
          )}
          {coinOut > 0 && (
            <g opacity={1 - seg(f, 128, 142)}>
              <Coin cx={lerp(860, 700, easeOut(coinOut))}
                cy={lerp(760, 846, coinOut) + Math.sin(clamp01(coinOut) * Math.PI) * -60}
                r={30} fill={KRP.copper} rotate={-coinOut * 260} />
            </g>
          )}
          {/* チャリン */}
          {coinOut > 0.9 && (
            <g opacity={1 - seg(f, 112, 130)}>
              <Spark cx={700} cy={800} s={0.8} />
            </g>
          )}
          {/* ことばの矢印 */}
          <g opacity={seg(f, 52, 64) * (1 - seg(f, 70, 82))}>
            <path d="M 420 420 Q 470 400 520 440" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" strokeDasharray="4 16" />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="売り切れたらお金はちゃんと戻る" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #107 世界から見ても早い: 地球儀の下関がキラッと光り波紋が広がる
const SceneWorldShimonoseki: React.FC<{ f: number }> = ({ f }) => {
  const lon0 = 131;
  const gp = globePoint(960, 500, 360, JMAP.shimonoseki[0], JMAP.shimonoseki[1], lon0);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={175} />
        <g filter="url(#wobble)">
          <Globe cx={960} cy={500} r={360} lon0={lon0} f={f} />
          {gp.visible && (
            <g>
              {/* 波紋 (繰り返し広がる) */}
              {[0, 1, 2].map((i) => {
                const t = ((f * 1.1 + i * 34) % 100) / 100;
                return (
                  <circle key={i} cx={gp.x} cy={gp.y} r={16 + t * 150}
                    fill="none" stroke={KRP.red} strokeWidth={6 * (1 - t)} opacity={0.9 * (1 - t)} />
                );
              })}
              <MapPin x={gp.x} y={gp.y} t={seg(f, 6, 20)} s={0.9} />
              {((f % 60) < 14) && <Spark cx={gp.x + 44} cy={gp.y - 90} s={1} />}
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="世界の中でもかなり早い挑戦だった" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #108 1904年 切手はがき自販機 (きらきらの粉と共に登場)
const SceneKitteJihanki: React.FC<{ f: number }> = ({ f }) => {
  const inT = pop(seg(f, 10, 30));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={176} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(800 ${lerp(940, 300, inT) - 300}) scale(${0.7 + 0.3 * inT})`} opacity={clamp01(inT * 2)}>
            <KitteMachine x={0} y={300} s={1.0} />
          </g>
          {/* 金の粉がきらきら舞う */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const t = ((f * 1.3 + i * 19) % 110) / 110;
            const px = 760 + (i % 4) * 140 + Math.sin(f / 17 + i * 2) * 30;
            const py = 240 + t * 560;
            return <Spark key={i} cx={px} cy={py} s={0.35 + (i % 3) * 0.14} color={KRP.gold} o={0.9 * (1 - t)} />;
          })}
          {/* 郵便局員がにっこり案内 */}
          <MeijiPost x={480} y={900} s={1.0} f={f} face="smile" gaze={[7, -3]} hideArm="right" />
          <Arm x1={535} y1={762} x2={660} y2={680} cloth="#3E4C66" />
        </g>
      </svg>
      {f >= 60 && <Stamp x={1280} y={300} text="1904年" size={48} />}
      <LabelPill x={960} y={170} centerX text="切手とはがきの自働郵券売機" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #109 これが現存最古 (切手自販機に「現存最古」の大ハンコ)
const SceneGensonSaiko: React.FC<{ f: number }> = ({ f }) => {
  const stampT = seg(f, 34, 48);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={177} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
          <g opacity={0.3 * seg(f, 48, 72)}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
              const a = (i * 30 + 15) * (Math.PI / 180);
              return (
                <path key={i}
                  d={`M 960 480 L ${960 + Math.cos(a) * 840} ${480 + Math.sin(a) * 840 * 0.7}
                     L ${960 + Math.cos(a + 0.11) * 840} ${480 + Math.sin(a + 0.11) * 840 * 0.7} Z`}
                  fill={KRP.yellow} />
              );
            })}
          </g>
        </g>
        <g filter="url(#wobble)">
          <KitteMachine x={780} y={240} s={1.1} />
          <Burst cx={960} cy={520} t={seg(f, 46, 74)} r0={360} />
        </g>
      </svg>
      {stampT > 0 && (
        <div style={{ position: "absolute", left: 1230, top: 330, transform: `scale(${0.6 + 0.4 * pop(stampT)})`, transformOrigin: "left top" }}>
          <Stamp x={0} y={0} text="現存最古" size={64} />
        </div>
      )}
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #110 いまは郵政博物館に (暗い館内+ガラスケース+スポットライト)
const SceneMuseum: React.FC<{ f: number }> = ({ f }) => {
  const lightT = easeOut(seg(f, 18, 36));
  return (
    <AbsoluteFill style={{ background: "#2E2A26" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={178} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={820} width={W} height={260} fill="#3A342E" />
          {/* 壁の額 */}
          <rect x={250} y={230} width={300} height={220} rx={10} fill="#443C34" stroke="#5A5048" strokeWidth={8} />
          <rect x={1460} y={260} width={240} height={180} rx={10} fill="#443C34" stroke="#5A5048" strokeWidth={8} />
        </g>
        <g filter="url(#wobble)">
          {/* スポットライトの光条 */}
          <path d={`M 900 0 L 1120 0 L 1310 830 L 710 830 Z`} fill="#FFF3C4" opacity={0.22 * lightT} />
          {/* 台座 */}
          <rect x={760} y={760} width={480} height={90} rx={10} fill="#5A5048" stroke="#241F1B" strokeWidth={7} />
          <rect x={790} y={700} width={420} height={60} rx={8} fill="#6B6056" stroke="#241F1B" strokeWidth={6} />
          {/* 展示の切手自販機 */}
          <g opacity={0.35 + 0.65 * lightT}>
            <KitteMachine x={860} y={280} s={0.78} />
          </g>
          {/* ガラスケース */}
          <rect x={800} y={240} width={400} height={470} rx={10} fill="#BBD4E4" opacity={0.2} stroke="#CFE2EE" strokeWidth={5} />
          <line x1={860} y1={260} x2={930} y2={690} stroke={KRP.white} strokeWidth={5} opacity={0.35 * lightT} />
          {/* 説明プレート */}
          <g opacity={seg(f, 50, 66)}>
            <rect x={1270} y={720} width={330} height={74} rx={9} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            <text x={1435} y={768} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={KRP.ink}>郵政博物館</text>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="いまも郵政博物館で会える" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// #111 だが時代が早すぎた (夕景の影絵: 沈む夕日と俵屋と木箱)
const SceneTooEarly: React.FC<{ f: number }> = ({ f }) => {
  const sunY = lerp(430, 560, easeOut(seg(f, 0, 140)));
  return (
    <AbsoluteFill style={{ background: "#E8A05A" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={179} />
        <g filter="url(#wobbleSoft)">
          {/* 夕空のグラデ帯 */}
          <rect x={0} y={0} width={W} height={400} fill="#D97B48" opacity={0.55} />
          <rect x={0} y={320} width={W} height={200} fill="#E8A05A" />
          {/* 夕日 (ゆっくり沈む) */}
          <circle cx={1380} cy={sunY} r={130} fill="#F2CE4C" stroke="#C9731F" strokeWidth={6} opacity={0.95} />
          {/* 海と反射 */}
          <rect x={0} y={620} width={W} height={460} fill="#B85A3A" />
          <g stroke="#F2CE4C" strokeWidth={8} opacity={0.6} strokeLinecap="round">
            <line x1={1310} y1={670} x2={1450} y2={670} />
            <line x1={1340} y1={720} x2={1430} y2={720} />
            <line x1={1300} y1={780} x2={1460} y2={780} />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 地面の影 */}
          <rect x={0} y={840} width={W} height={240} fill="#4A2E22" />
          {/* 影絵: 俵屋がしょんぼり木箱を見る */}
          <Tawaraya x={560} y={880} s={1.1} f={f} silhouette lean={4} gaze={[0, 0]} />
          <g fill="#4A2E22">
            <rect x={900} y={560} width={300} height={290} rx={10} fill="#3A241B" stroke="#3A241B" strokeWidth={6} />
            <rect x={940} y={592} width={220} height={64} rx={8} fill="#2E1C15" />
            <circle cx={1050} cy={760} r={20} fill="#2E1C15" />
          </g>
          {/* ため息 */}
          {[0, 1].map((i) => {
            const t = ((f + i * 40) % 80) / 80;
            return (
              <circle key={i} cx={640 + t * 54} cy={620 - t * 70} r={8 + t * 10}
                fill="none" stroke="#3A241B" strokeWidth={5} opacity={0.7 * (1 - t)} />
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="だが時代が早すぎた" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// #112 硬貨がまだ行き渡っていない (空のがま口+まばらな家+枯れ葉)
const SceneNoCoinsTown: React.FC<{ f: number }> = ({ f }) => {
  const tiltT = easeOut(seg(f, 20, 46));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={180} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={760} width={W} height={320} fill={KRP.floor} />
          {/* まばらな家 */}
          <g opacity={0.8}>
            <rect x={180} y={620} width={200} height={140} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M 160 620 Q 280 560 400 620 Z" fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={1560} y={640} width={180} height={120} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M 1542 640 Q 1650 586 1758 640 Z" fill="#8A6F4D" stroke={KRP.ink} strokeWidth={5.5} />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 大きながま口 (逆さに振っても何も出ない) */}
          <g transform={`translate(900 480) rotate(${lerp(0, 148, tiltT)})`}>
            <path d="M -170 -20 Q -170 -140 0 -140 Q 170 -140 170 -20 Q 170 90 0 110 Q -170 90 -170 -20 Z"
              fill="#B85A4A" stroke={KRP.ink} strokeWidth={8} />
            <path d="M -170 -20 Q 0 -190 170 -20" fill="none" stroke={KRP.ink} strokeWidth={8} />
            <circle cx={-26} cy={-116} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={26} cy={-116} r={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
            {/* 口がぱかっと開いている */}
            <ellipse cx={0} cy={-104} rx={104} ry={26} fill="#5A2E24" stroke={KRP.ink} strokeWidth={6} />
          </g>
          {/* 出てくるのはホコリだけ */}
          {tiltT >= 1 && [0, 1, 2].map((i) => {
            const t = ((f + i * 30) % 70) / 70;
            return (
              <circle key={i} cx={830 + i * 44 + t * 20} cy={620 + t * 110} r={7 + t * 9}
                fill="none" stroke={KRP.grayDark} strokeWidth={4.5} opacity={0.75 * (1 - t)} />
            );
          })}
          {tiltT >= 1 && (
            <TagPlate x={900} y={820} text="からっぽ…" size={30} t={seg(f, 60, 72)} />
          )}
          {/* 枯れ葉がころころ転がる */}
          {[0, 1].map((i) => {
            const t = ((f * 1.4 + i * 70) % 150) / 150;
            const lx = -80 + t * 2100;
            const ly = 870 + Math.abs(Math.sin(t * 14)) * -36 + i * 40;
            return (
              <path key={i} d="M 0 0 q 16 -22 36 -8 q 16 12 -2 26 q -20 12 -34 -18 Z"
                transform={`translate(${lx} ${ly}) rotate(${t * 720})`}
                fill="#C98A3E" stroke={KRP.ink} strokeWidth={3.5} opacity={0.85} />
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="そもそも硬貨がまだ行き渡っていない" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #113 自販機はしばらく眠りにつく (木箱に布がかけられ Zzz)
const SceneLongSleep: React.FC<{ f: number }> = ({ f }) => {
  const clothT = easeOut(seg(f, 14, 46));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={181} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
          {/* 薄暗い窓明かり */}
          <rect x={1380} y={240} width={300} height={360} rx={12} fill="#EFE3C2" stroke={KRP.ink} strokeWidth={6} opacity={0.75} />
          <line x1={1530} y1={240} x2={1530} y2={600} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
          <line x1={1380} y1={420} x2={1680} y2={420} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
        </g>
        <g filter="url(#wobble)">
          <WoodBox x={720} y={400} s={1.45} cloth={clothT} />
          {/* Zzz (ループで浮かぶ) */}
          {clothT >= 1 && [0, 1, 2].map((i) => {
            const t = ((f * 1.2 + i * 33) % 100) / 100;
            return (
              <text key={i} x={1220 + t * 90 + i * 24} y={420 - t * 150 - i * 20}
                fontFamily={FONT} fontWeight={900} fontSize={44 + i * 18} fill={KRP.blueDeep}
                opacity={0.9 * (1 - t)} transform={`rotate(${8 + i * 4} ${1220 + t * 90} ${420 - t * 150})`}>
                Z
              </text>
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="自販機はしばらく眠りにつく" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// 第6章 (#114〜#126)
// ============================================================

// #114 章扉: 日本地図で下関→東京へホップ+「1931年 東京」
const SceneCh6Door: React.FC<{ f: number }> = ({ f }) => {
  const titleT = easeOut(seg(f, 100, 118));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={182} />
        <g filter="url(#wobble)">
          <JapanMapCard>
            <JapanHop f={f} from={JMAP.shimonoseki} to={JMAP.tokyo} t0={16} />
            <JmapLabel lon={JMAP.shimonoseki[0]} lat={JMAP.shimonoseki[1]} text="下関" dx={-150} dy={56} />
            {f >= 80 && <JmapLabel lon={JMAP.tokyo[0]} lat={JMAP.tokyo[1]} text="東京" dx={34} dy={10} />}
          </JapanMapCard>
        </g>
      </svg>
      {f >= 92 && <Stamp x={1250} y={250} text="1931年 東京" size={40} />}
      <div
        style={{
          position: "absolute", left: 850, top: 660, width: 780,
          opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            fontSize: 40, fontWeight: 800, color: KRP.grayDark, marginBottom: 6,
            display: "inline-block", background: "rgba(253,251,247,0.82)",
            borderRadius: 8, padding: "2px 12px",
          }}
        >
          第6章
        </div>
        <div
          style={{
            fontSize: 52, fontWeight: 900, color: KRP.ink, lineHeight: 1.3,
            borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
            background: "rgba(253,251,247,0.82)", borderRadius: 8, padding: "4px 10px 10px",
          }}
        >
          映画館をおまけにつけた自販機
        </div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #115 昭和はじめの街角 (縦看板の商店街+電線+路面電車が横切る)
const SceneShowaStreet: React.FC<{ f: number }> = ({ f }) => {
  const tramX = lerp(-680, 2100, seg(f, 0, 145));
  const signs: Array<[number, string, string]> = [
    [260, "菓子", "#B85A4A"],
    [700, "呉服", "#4A78B8"],
    [1180, "食堂", "#5A8A4E"],
    [1600, "薬", "#C98A3E"],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={183} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={0} width={W} height={700} fill="#EAF0F4" />
          <rect x={0} y={700} width={W} height={380} fill="#C8BC9E" />
          {/* 店の建物 */}
          {signs.map(([sx], i) => (
            <g key={i}>
              <rect x={sx - 150} y={300} width={400} height={400} fill={i % 2 ? "#EFE3C2" : KRP.cream} stroke={KRP.ink} strokeWidth={6} />
              <rect x={sx - 170} y={270} width={440} height={46} rx={6} fill="#8A6F4D" stroke={KRP.ink} strokeWidth={6} />
              <rect x={sx - 110} y={420} width={110} height={160} rx={6} fill="#6B5234" stroke={KRP.ink} strokeWidth={5} />
              <rect x={sx + 60} y={420} width={130} height={110} rx={6} fill="#D8E4EC" stroke={KRP.ink} strokeWidth={5} />
              <line x1={sx + 125} y1={420} x2={sx + 125} y2={530} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          ))}
          {/* 電線 */}
          <g stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.8}>
            <path d="M -20 150 Q 480 215 980 160 Q 1440 215 1940 150" />
            <path d="M -20 195 Q 480 258 980 205 Q 1440 258 1940 195" />
          </g>
          <rect x={940} y={120} width={18} height={590} fill="#6B5234" stroke={KRP.ink} strokeWidth={5} />
          <line x1={880} y1={158} x2={1020} y2={158} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          {/* 縦看板 (文字は縦書き) */}
          {signs.map(([sx, txt, col], i) => (
            <g key={i} transform={`translate(${sx + 170} 320)`}>
              <rect x={-38} y={0} width={76} height={56 + txt.length * 58} rx={9} fill={col} stroke={KRP.ink} strokeWidth={6} />
              {txt.split("").map((ch, j) => (
                <text key={j} x={0} y={66 + j * 58} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                  fontSize={44} fill={KRP.white}>{ch}</text>
              ))}
            </g>
          ))}
          {/* レール */}
          <line x1={0} y1={840} x2={W} y2={840} stroke="#8A8378" strokeWidth={10} />
          <line x1={0} y1={884} x2={W} y2={884} stroke="#8A8378" strokeWidth={10} />
          {/* 路面電車が横切る */}
          <g transform={`translate(${tramX} ${694 + Math.sin(f / 6) * 2})`}>
            <rect x={0} y={0} width={560} height={170} rx={16} fill="#5A8A4E" stroke={KRP.ink} strokeWidth={7} />
            <rect x={0} y={96} width={560} height={30} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={36 + i * 136} y={26} width={92} height={62} rx={8} fill="#D8E4EC" stroke={KRP.ink} strokeWidth={5} />
            ))}
            <circle cx={110} cy={178} r={30} fill="#3A3F4C" stroke={KRP.ink} strokeWidth={6} />
            <circle cx={450} cy={178} r={30} fill="#3A3F4C" stroke={KRP.ink} strokeWidth={6} />
            <line x1={280} y1={0} x2={236} y2={-96} stroke={KRP.ink} strokeWidth={7} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="時は流れて昭和のはじめ 東京" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #116 グリコの自販機 どーんと登場
const SceneGlicoMachine: React.FC<{ f: number }> = ({ f }) => {
  const inT = pop(seg(f, 8, 28));
  const don = seg(f, 24, 40);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={184} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 860) scale(${0.3 + 0.7 * inT}) translate(-960 -860)`} opacity={clamp01(inT * 2)}>
            <GlicoMachine x={790} y={240} s={1.0} f={f} />
          </g>
          <Burst cx={960} cy={520} t={don} r0={380} />
          {/* 子どもたちが見上げる */}
          <ShowaKid x={520} y={890} s={1.0} f={f} kind="bozu" face="surprised" gaze={[8, -6]} />
          <ShowaKid x={1420} y={890} s={0.95} f={f} phase={4} kind="okappa" face="surprised" gaze={[-8, -6]} />
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="グリコのキャラメル自販機 登場" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #117 10銭入れると小さな映画が観られる (大写しのスクリーンでチャンバラ)
const SceneChanbara: React.FC<{ f: number }> = ({ f }) => {
  const flick = 0.1 + 0.07 * Math.sin(f / 2.3) + 0.05 * Math.sin(f / 5.1);
  return (
    <AbsoluteFill style={{ background: "#3A332C" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={185} />
        <g filter="url(#wobble)">
          {/* 映写の光 (左下の映写口から) */}
          <path d="M 180 880 L 1560 180 L 1560 820 Z" fill="#FFF3C4" opacity={0.1} />
          {/* 大きなスクリーン枠 */}
          <rect x={360} y={150} width={1200} height={700} rx={18} fill="#6B5234" stroke={KRP.ink} strokeWidth={10} />
          <rect x={396} y={186} width={1128} height={628} rx={10} fill="#E3CFA0" stroke={KRP.ink} strokeWidth={6} />
          {/* ちらつき */}
          <rect x={396} y={186} width={1128} height={628} rx={10} fill="#FFF6CE" opacity={flick} />
          {/* チャンバラ影絵 (大) */}
          <g transform="translate(960 740) scale(2.4)">
            <ChanbaraShadow f={f} color="#5A4426" />
          </g>
          {/* フィルムの縦キズ */}
          {[0, 1].map((i) => {
            const kx = 500 + ((f * (17 + i * 11)) % 1000);
            return <line key={i} x1={kx} y1={196} x2={kx} y2={804} stroke="#5A4426" strokeWidth={3} opacity={0.25} />;
          })}
          {/* 四隅のパーフォレーション飾り */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={420 + i * 150} y={158} width={26} height={16} rx={4} fill={KRP.paper} opacity={0.9} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={`b${i}`} x={420 + i * 150} y={826} width={26} height={16} rx={4} fill={KRP.paper} opacity={0.9} />
          ))}
          {/* 10銭コイン */}
          <Coin cx={260} cy={310} r={64} fill={KRP.silver} text="10銭" textSize={34} rotate={lerp(-20, 8, easeOut(seg(f, 10, 40)))} />
          <path d="M 260 390 L 260 470" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.8} />
          <path d="M 242 450 L 260 474 L 278 450" fill="none" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.8} />
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="10銭で小さなチャンバラ映画が観られる" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// #118 映画が終わるとキャラメルとおつりが出てくる (取り出し口クローズアップ)
const SceneCaramelDrop: React.FC<{ f: number }> = ({ f }) => {
  const dropT = seg(f, 12, 34);
  const boxY = lerp(300, 690, easeOut(dropT));
  const coin1 = seg(f, 58, 76);
  const coin2 = seg(f, 68, 86);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={186} />
        <g filter="url(#wobbleSoft)">
          {/* 自販機下部の大写し */}
          <rect x={300} y={80} width={1320} height={800} rx={20} fill="#A33B30" stroke={KRP.ink} strokeWidth={10} />
        </g>
        <g filter="url(#wobble)">
          {/* 取り出し口 (大) */}
          <rect x={560} y={330} width={800} height={200} rx={16} fill="#6B5234" stroke={KRP.ink} strokeWidth={9} />
          <rect x={600} y={366} width={720} height={128} rx={10} fill="#3A2E22" stroke={KRP.ink} strokeWidth={6} />
          {/* 受け皿 */}
          <path d="M 520 760 Q 960 850 1400 760 L 1400 800 Q 960 890 520 800 Z"
            fill="#7A2A20" stroke={KRP.ink} strokeWidth={8} />
          {/* キャラメルがコトン */}
          {dropT > 0 && (
            <g transform={dropT >= 1 && f < 44 ? `translate(0 ${Math.sin(seg(f, 34, 44) * Math.PI) * -18})` : undefined}>
              <CaramelBox cx={960} cy={boxY} s={1.5} rotate={lerp(-8, 3, dropT)} />
            </g>
          )}
          {dropT >= 1 && f >= 34 && f < 52 && (
            <g opacity={1 - seg(f, 44, 52)}>
              <Spark cx={830} cy={660} s={0.8} />
              <Spark cx={1100} cy={650} s={0.7} />
            </g>
          )}
          {/* おつりがチャリン×2 */}
          {coin1 > 0 && (
            <Coin cx={lerp(880, 820, coin1)} cy={lerp(420, 700, coin1 * coin1)} r={40}
              fill={KRP.copper} rotate={coin1 * 300} text="1" />
          )}
          {coin2 > 0 && (
            <Coin cx={lerp(1040, 1120, coin2)} cy={lerp(420, 712, coin2 * coin2)} r={40}
              fill={KRP.copper} rotate={-coin2 * 300} text="1" />
          )}
          {coin2 >= 1 && f < 118 && (
            <g opacity={1 - seg(f, 100, 118)}>
              <Spark cx={1180} cy={640} s={0.9} color={KRP.gold} />
              <TagPlate x={1240} y={560} text="チャリン" size={30} t={1} />
            </g>
          )}
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #119 おまけの逆転 (キャラメル[主]と映画[従]の王冠が入れ替わる)
const SceneOmakeReverse: React.FC<{ f: number }> = ({ f }) => {
  const swapT = easeOut(seg(f, 40, 96));
  // キャラメル: 左上(大)→右下(小) / 映画: 右下(小)→左上(大)
  const cX = lerp(620, 1300, swapT), cY = lerp(420, 640, swapT) - Math.sin(swapT * Math.PI) * 180;
  const fX = lerp(1300, 620, swapT), fY = lerp(640, 420, swapT) + Math.sin(swapT * Math.PI) * 180;
  const cS = lerp(2.1, 1.0, swapT);
  const fS = lerp(1.0, 2.1, swapT);
  const crownX = lerp(620, 620, 1), crownY = 240; // 王冠は左上の「主役」の席に残る
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={187} />
        <g filter="url(#wobbleSoft)">
          {/* 主役の席と脇役の席 */}
          <ellipse cx={620} cy={560} rx={330} ry={56} fill={KRP.blueSoft} opacity={0.8} />
          <ellipse cx={1300} cy={740} rx={240} ry={44} fill={KRP.gray} opacity={0.45} />
          <text x={620} y={700} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={KRP.grayDark}>主役</text>
          <text x={1300} y={830} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.grayDark}>おまけ</text>
        </g>
        <g filter="url(#wobble)">
          {/* 入れ替わる2つ */}
          <CaramelBox cx={cX} cy={cY} s={cS} rotate={swapT * 360} />
          <FilmCard cx={fX} cy={fY} s={fS} f={f} rotate={-swapT * 360} />
          {/* 王冠 (主役の席の上でぴょこん) */}
          <g transform={`translate(${crownX} ${crownY + Math.sin(f / 12) * 6}) scale(${1 + 0.1 * Math.sin(f / 9)})`}>
            <path d="M -64 20 L -64 -30 L -30 0 L 0 -42 L 30 0 L 64 -30 L 64 20 Z"
              fill={KRP.gold} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={-64} cy={-34} r={9} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={0} cy={-48} r={9} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={64} cy={-34} r={9} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 入れ替えの回転矢印 */}
          <g opacity={seg(f, 30, 42) * (1 - seg(f, 96, 110))} stroke={KRP.orange} strokeWidth={8} fill="none" strokeLinecap="round">
            <path d="M 820 380 Q 960 300 1140 420" />
            <path d="M 1108 384 L 1146 424 L 1092 436" />
            <path d="M 1100 700 Q 960 790 780 660" />
            <path d="M 812 700 L 774 656 L 830 648" />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="どっちがおまけか分からない" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #120 でも狙いはおつりにあった (暗がりで受け皿のおつりにスポットライト)
const SceneOtsuriSpot: React.FC<{ f: number }> = ({ f }) => {
  const lightT = easeOut(seg(f, 16, 34));
  return (
    <AbsoluteFill style={{ background: "#2E2A26" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={188} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={820} width={W} height={260} fill="#3A342E" />
          {/* 自販機は暗がりにシルエット */}
          <g opacity={0.5}>
            <GlicoMachine x={420} y={180} s={1.0} />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* スポットライト */}
          <path d="M 1120 0 L 1420 0 L 1560 760 L 980 760 Z" fill="#FFF3C4" opacity={0.25 * lightT} />
          {/* 受け皿 (大) とおつり */}
          <g opacity={0.3 + 0.7 * lightT}>
            <path d="M 1010 640 Q 1270 700 1530 640 L 1530 690 Q 1270 760 1010 690 Z"
              fill="#7A2A20" stroke={KRP.ink} strokeWidth={8} />
            <Coin cx={1180} cy={620} r={44} fill={KRP.copper} text="1" rotate={-12} />
            <Coin cx={1300} cy={636} r={44} fill={KRP.copper} text="1" rotate={20} />
            <Coin cx={1402} cy={614} r={44} fill={KRP.silver} text="5" rotate={-6} />
          </g>
          {/* キラン */}
          {lightT >= 1 && [0, 1, 2].map((i) => {
            const t = ((f * 1.4 + i * 31) % 80) / 80;
            return <Spark key={i} cx={1180 + i * 112} cy={560 - t * 60} s={0.5 + 0.3 * (1 - t)} color={KRP.gold} o={1 - t} />;
          })}
          {/* 虫めがね風の注目サークル */}
          <circle cx={1280} cy={628} r={270} fill="none" stroke={KRP.yellow} strokeWidth={8}
            strokeDasharray="30 22" opacity={0.85 * lightT}
            transform={`rotate(${f * 0.6} 1280 628)`} />
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="本当の狙いは「おつり」にあった" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// #121 さしひき図解: 入れたお金 − キャラメル代 ＝ おつり
const SceneSashihiki: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 10, 26));
  const t2 = pop(seg(f, 34, 50));
  const t3 = pop(seg(f, 58, 74));
  const t4 = pop(seg(f, 82, 98));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={189} />
        <g filter="url(#wobbleSoft)">
          <rect x={160} y={200} width={1600} height={620} rx={24} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        </g>
        <g filter="url(#wobble)">
          {/* 10銭 */}
          <g transform={`translate(430 470) scale(${t1})`} opacity={clamp01(t1 * 2)}>
            <Coin cx={0} cy={0} r={110} fill={KRP.silver} text="10銭" textSize={56} />
          </g>
          <TagPlate x={430} y={660} text="入れたお金" size={30} t={seg(f, 20, 30)} />
          {/* − */}
          <g opacity={clamp01(t2 * 2)} transform={`translate(680 470) scale(${t2})`}>
            <line x1={-44} y1={0} x2={44} y2={0} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
          </g>
          {/* キャラメル代 */}
          <g transform={`translate(940 470) scale(${t2})`} opacity={clamp01(t2 * 2)}>
            <CaramelBox cx={0} cy={0} s={1.35} />
          </g>
          <TagPlate x={940} y={660} text="キャラメル代" size={30} t={seg(f, 44, 54)} />
          {/* ＝ */}
          <g opacity={clamp01(t3 * 2)} transform={`translate(1190 470) scale(${t3})`}>
            <line x1={-44} y1={-18} x2={44} y2={-18} stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
            <line x1={-44} y1={18} x2={44} y2={18} stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
          </g>
          {/* おつり */}
          <g transform={`translate(1450 470) scale(${t4})`} opacity={clamp01(t4 * 2)}>
            <Coin cx={-54} cy={10} r={56} fill={KRP.copper} text="1" rotate={-10} />
            <Coin cx={60} cy={-16} r={56} fill={KRP.copper} text="1" rotate={14} />
          </g>
          <TagPlate x={1450} y={660} text="おつり" size={30} t={seg(f, 92, 102)} />
          {t4 >= 1 && <Spark cx={1560} cy={360} s={0.9} color={KRP.gold} />}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="さしひきの計算を機械がやってのける" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #122 おつりを「手渡し」する機械 (扉から腕が伸びて子どもにコインを)
const SceneHandReturn: React.FC<{ f: number }> = ({ f }) => {
  const armT = easeOut(seg(f, 20, 56));
  const handX = lerp(1020, 790, armT);
  const handY = lerp(700, 660, armT);
  const giveT = seg(f, 70, 92);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={190} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <GlicoMachine x={1060} y={210} s={1.0} f={f} />
          {/* 扉がぱかっ */}
          <g transform={`translate(1060 210)`}>
            <g transform={`rotate(${-70 * armT} 92 554)`}>
              <rect x={92} y={520} width={156} height={34} rx={8} fill="#6B5234" stroke={KRP.ink} strokeWidth={5.5} />
            </g>
          </g>
          {/* 機械から伸びる腕 (からくりの擬人化) */}
          <g>
            <line x1={1150} y1={742} x2={handX} y2={handY} stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
            <line x1={1150} y1={742} x2={handX} y2={handY} stroke="#A33B30" strokeWidth={21} strokeLinecap="round" />
            {/* 関節の丸 */}
            <circle cx={lerp(1150, handX, 0.5)} cy={lerp(742, handY, 0.5) + 14} r={13} fill="#7A2A20" stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={handX} cy={handY} r={19} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
            {/* コイン (手の上→子どもの手へ) */}
            {armT > 0.2 && (
              <Coin cx={lerp(handX, 668, easeOut(giveT))} cy={lerp(handY - 38, 652, easeOut(giveT))}
                r={30} fill={KRP.copper} text="1" rotate={giveT * 180} />
            )}
          </g>
          {/* 受け取る子ども (右手を差し出す) */}
          <ShowaKid x={560} y={890} s={1.15} f={f} kind="bozu" face="smile" gaze={[8, -4]} hideArm="right" />
          <Arm x1={612} y1={770} x2={672} y2={668} cloth="#E8C06A" s={0.85} />
          {giveT >= 1 && (
            <g opacity={1 - seg(f, 108, 126)}>
              <Spark cx={700} cy={590} s={0.8} color={KRP.gold} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="おつりまで返す機械は当時の最先端" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #123 東京に約100台 (東京の地図カードに自販機アイコンが増えていく+カウンター)
const SceneTokyo100: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.round(100 * easeOut(seg(f, 16, 112)));
  const spots: Array<[number, number, number]> = [
    // [x, y, 出現フレーム]
    [700, 420, 18], [980, 360, 26], [1240, 450, 34], [840, 560, 42],
    [1120, 620, 50], [620, 660, 58], [1380, 560, 66], [940, 760, 74],
    [1260, 780, 82], [760, 820, 90], [1460, 700, 98], [1080, 500, 106],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={191} />
        <g filter="url(#wobbleSoft)">
          {/* 東京の地図カード */}
          <rect x={240} y={120} width={1440} height={840} rx={24} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          {/* 東京湾 */}
          <path d="M 1680 640 Q 1460 660 1400 800 Q 1380 920 1500 960 L 1680 960 Z"
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          {/* 川 */}
          <path d="M 1000 120 Q 1080 340 1240 480 Q 1380 600 1420 760"
            fill="none" stroke={KRP.blueSoft} strokeWidth={26} strokeLinecap="round" />
          {/* 道 */}
          <g stroke="#D8CCAE" strokeWidth={16} fill="none">
            <path d="M 300 500 Q 800 460 1640 540" />
            <path d="M 760 160 Q 820 540 700 930" />
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 自販機アイコンがぽんぽん増える */}
          {spots.map(([mx, my, t0], i) => {
            const t = pop(seg(f, t0, t0 + 12));
            if (t <= 0) return null;
            return (
              <g key={i} transform={`translate(${mx} ${my}) scale(${t})`}>
                <rect x={-24} y={-40} width={48} height={80} rx={7} fill="#A33B30" stroke={KRP.ink} strokeWidth={4.5} />
                <rect x={-15} y={-30} width={30} height={24} rx={4} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
                <rect x={-12} y={16} width={24} height={9} rx={3} fill="#6B5234" />
              </g>
            );
          })}
          {/* 地名の札 */}
          <TagPlate x={560} y={380} text="デパート" size={26} t={seg(f, 30, 40)} />
          <TagPlate x={1430} y={400} text="駅" size={26} t={seg(f, 54, 64)} />
          <TagPlate x={620} y={780} text="公園" size={26} t={seg(f, 78, 88)} />
        </g>
      </svg>
      {/* 台数カウンター */}
      <div
        style={{
          position: "absolute", left: 1370, top: 160, width: 290,
          background: KRP.white, border: `5px solid ${KRP.ink}`, borderRadius: 14,
          fontFamily: FONT, textAlign: "center", padding: "12px 0 16px",
          boxShadow: "4px 5px 0 rgba(59,51,44,0.25)",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 800, color: KRP.grayDark }}>東京の設置台数</div>
        <div style={{ fontSize: 64, fontWeight: 900, color: KRP.ink, lineHeight: 1.15 }}>
          {f >= 116 ? "約100台" : `${n}台`}
        </div>
      </div>
      <LabelPill x={960} y={170} centerX text="東京を中心に約100台も置かれた" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #124 子どもの行列がそわそわ (先頭の子が背伸びしてのぞきこむ)
const SceneKidsLine: React.FC<{ f: number }> = ({ f }) => {
  const tip = Math.max(0, Math.sin(f / 15)) * 24;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={192} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <GlicoMachine x={210} y={250} s={0.95} f={f} playing />
          {/* 行列 (後ろほど小さく。そわそわ揺れる) */}
          <ShowaKid x={700} y={892} s={1.05} f={f} phase={0} kind="bozu" face="surprised" gaze={[-8, -4]} tiptoe={tip} />
          <ShowaKid x={920} y={894} s={1.0} f={f} phase={2} kind="okappa" face="smile" gaze={[-7, -2]} />
          <ShowaKid x={1130} y={896} s={0.95} f={f} phase={4} kind="capboy" face="normal" gaze={[-7, 0]} />
          <ShowaKid x={1330} y={898} s={0.9} f={f} phase={6} kind="bozu" face="smile" gaze={[-6, 0]} />
          <ShowaKid x={1520} y={900} s={0.85} f={f} phase={8} kind="okappa" face="surprised" gaze={[-6, 0]} />
          {/* そわそわの記号 */}
          {[0, 1, 2].map((i) => {
            const t = ((f * 1.3 + i * 35) % 90) / 90;
            return (
              <g key={i} opacity={0.85 * (1 - t)} stroke={KRP.orange} strokeWidth={6} fill="none" strokeLinecap="round"
                transform={`translate(${860 + i * 300} ${600 - t * 60})`}>
                <path d="M 0 0 q 10 -14 20 0 q 10 14 20 0" />
              </g>
            );
          })}
          {/* 先頭の子の視線 */}
          <g opacity={clamp01(tip / 20)} stroke={KRP.ink} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round">
            <line x1={640} y1={620 - tip} x2={480} y2={480} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={170} centerX text="自販機の前に子どもの行列ができた" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #125 売っていたのはワクワク (子どもの夢想: 映画+キャラメル+キラキラ)
const SceneWakuwaku: React.FC<{ f: number }> = ({ f }) => {
  const bubT = seg(f, 12, 28);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={193} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <ShowaKid x={480} y={900} s={1.25} f={f} kind="bozu" face="smile" gaze={[8, -8]} armUp />
          {/* もくもくの夢想バブル */}
          <g opacity={clamp01(bubT * 2)} transform={`translate(1150 430) scale(${0.7 + 0.3 * pop(bubT)})`}>
            <circle cx={-540} cy={320} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-460} cy={244} r={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -380 120 Q -420 20 -300 -10 Q -280 -130 -120 -120 Q -40 -210 120 -160 Q 300 -190 350 -60
                     Q 470 -30 440 90 Q 470 210 330 240 Q 260 330 100 300 Q -60 360 -180 280 Q -340 310 -380 120 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            {/* 中身: 映画とキャラメル */}
            <g transform={`translate(-110 10) rotate(-6) scale(${1 + 0.04 * Math.sin(f / 11)})`}>
              <FilmCard cx={0} cy={0} s={1.25} f={f} />
            </g>
            <g transform={`translate(200 80) rotate(8) scale(${1 + 0.05 * Math.sin(f / 9 + 2)})`}>
              <CaramelBox cx={0} cy={0} s={1.2} />
            </g>
            {/* キラキラ (まばたくように) */}
            {[[-250, -100], [120, -150], [320, -20], [-40, 180], [280, 190]].map(([px, py], i) => (
              <Spark key={i} cx={px} cy={py} s={0.5 + 0.25 * Math.sin(f / 8 + i * 1.9)} color={KRP.gold}
                o={0.65 + 0.35 * Math.sin(f / 7 + i * 2.4)} />
            ))}
          </g>
        </g>
      </svg>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// #126 「体験を売る」は90年以上前から (グリコ機に大ハンコ)
const SceneTaikenStamp: React.FC<{ f: number }> = ({ f }) => {
  const stampT = seg(f, 32, 46);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={194} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={800} width={W} height={280} fill={KRP.floor} />
          <g opacity={0.3 * seg(f, 46, 72)}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
              const a = (i * 30 + 15) * (Math.PI / 180);
              return (
                <path key={i}
                  d={`M 960 500 L ${960 + Math.cos(a) * 840} ${500 + Math.sin(a) * 840 * 0.7}
                     L ${960 + Math.cos(a + 0.11) * 840} ${500 + Math.sin(a + 0.11) * 840 * 0.7} Z`}
                  fill={KRP.yellow} />
              );
            })}
          </g>
        </g>
        <g filter="url(#wobble)">
          <GlicoMachine x={760} y={230} s={1.05} f={f} playing />
          <Burst cx={960} cy={530} t={seg(f, 44, 72)} r0={360} />
        </g>
      </svg>
      {stampT > 0 && (
        <div style={{ position: "absolute", left: 1210, top: 310, transform: `scale(${0.6 + 0.4 * pop(stampT)})`, transformOrigin: "left top" }}>
          <Stamp x={0} y={0} text="体験を売る" size={64} />
        </div>
      )}
      <LabelPill x={960} y={170} centerX text="「体験を売る」は90年以上前から" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// ディスパッチャ
// ============================================================
export const j2Ch5to6Scene = (motif: string, f: number): React.ReactElement | null => {
  switch (motif) {
    // 第5章
    case "j2_ch5_door": return <SceneCh5Door f={f} />;
    case "j2_meiji_port": return <SceneMeijiPort f={f} />;
    case "j2_tawaraya": return <SceneTawaraya f={f} />;
    case "j2_sashimono": return <SceneSashimono f={f} />;
    case "j2_post_rumor": return <ScenePostRumor f={f} />;
    case "j2_foreign_shadow": return <SceneForeignShadow f={f} />;
    case "j2_never_seen": return <SceneNeverSeen f={f} />;
    case "j2_build_wood": return <SceneBuildWood f={f} />;
    case "j2_tobacco_patent": return <SceneTobaccoPatent f={f} />;
    case "j2_japan_first": return <SceneJapanFirst f={f} />;
    case "j2_not_just_box": return <SceneNotJustBox f={f} />;
    case "j2_nisegane_badge": return <SceneNiseganeBadge f={f} />;
    case "j2_wood_rail": return <SceneWoodRail f={f} />;
    case "j2_wood_reject": return <SceneWoodReject f={f} />;
    case "j2_soldout_return": return <SceneSoldoutReturn f={f} />;
    case "j2_world_shimonoseki": return <SceneWorldShimonoseki f={f} />;
    case "j2_kitte_jihanki": return <SceneKitteJihanki f={f} />;
    case "j2_genson_saiko": return <SceneGensonSaiko f={f} />;
    case "j2_museum": return <SceneMuseum f={f} />;
    case "j2_too_early": return <SceneTooEarly f={f} />;
    case "j2_no_coins_town": return <SceneNoCoinsTown f={f} />;
    case "j2_long_sleep": return <SceneLongSleep f={f} />;
    // 第6章
    case "j2_ch6_door": return <SceneCh6Door f={f} />;
    case "j2_showa_street": return <SceneShowaStreet f={f} />;
    case "j2_glico_machine": return <SceneGlicoMachine f={f} />;
    case "j2_chanbara": return <SceneChanbara f={f} />;
    case "j2_caramel_drop": return <SceneCaramelDrop f={f} />;
    case "j2_omake_reverse": return <SceneOmakeReverse f={f} />;
    case "j2_otsuri_spot": return <SceneOtsuriSpot f={f} />;
    case "j2_sashihiki": return <SceneSashihiki f={f} />;
    case "j2_hand_return": return <SceneHandReturn f={f} />;
    case "j2_tokyo_100": return <SceneTokyo100 f={f} />;
    case "j2_kids_line": return <SceneKidsLine f={f} />;
    case "j2_wakuwaku": return <SceneWakuwaku f={f} />;
    case "j2_taiken_stamp": return <SceneTaikenStamp f={f} />;
    default: return null;
  }
};

export const J2_CH5TO6_MOTIFS: string[] = [
  "j2_ch5_door", "j2_meiji_port", "j2_tawaraya", "j2_sashimono", "j2_post_rumor",
  "j2_foreign_shadow", "j2_never_seen", "j2_build_wood", "j2_tobacco_patent", "j2_japan_first",
  "j2_not_just_box", "j2_nisegane_badge", "j2_wood_rail", "j2_wood_reject", "j2_soldout_return",
  "j2_world_shimonoseki", "j2_kitte_jihanki", "j2_genson_saiko", "j2_museum", "j2_too_early",
  "j2_no_coins_town", "j2_long_sleep",
  "j2_ch6_door", "j2_showa_street", "j2_glico_machine", "j2_chanbara", "j2_caramel_drop",
  "j2_omake_reverse", "j2_otsuri_spot", "j2_sashihiki", "j2_hand_return", "j2_tokyo_100",
  "j2_kids_line", "j2_wakuwaku", "j2_taiken_stamp",
];

