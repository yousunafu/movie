// 「私は何者?」4000年史: ブロック3 = 第7〜9章。
// 担当範囲: 台本 docs/watashi-script-v1.txt の 121〜186行目 (文#120〜#185・66文)。
// 作業ルール: docs/watashi-motifs-rules.md を必ず読んでから作ること。
// WobbleDefs の seed はこのファイルでは 500〜599 を使う。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, WobbleDefs, Atmosphere, LabelPill, Stamp, Person, Ground,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, WBadge, ChapterTitle, RouteMap } from "./WatashiShared";
import { Globe } from "./Jihanki2000Scenes";

// ===== 小ヘルパー =====
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// シーンの外枠 (cream背景 + svg + wobble + キャプション + バッジ + 質感)
const Shell: React.FC<{
  seed: number; f: number; dark?: boolean; wash?: number; pill?: string;
  children?: React.ReactNode; overlay?: React.ReactNode;
}> = ({ seed, f, dark, wash = 0, pill, children, overlay }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      {wash > 0 && <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={wash} />}
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {pill && <LabelPill x={960} y={170} text={pill} centerX />}
    {overlay}
    <WBadge />
    <Atmosphere f={f} dark={dark} />
  </AbsoluteFill>
);

// ぽんと出る白札 (J2のTagPlateの流儀)
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number; color?: string;
}> = ({ x, y, text, size = 30, t = 1, color = KRP.ink }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = text.length * size + 36;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={10}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <text x={0} y={size * 0.4} textAnchor="middle" fontFamily={FONT} fontWeight={800}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// キラッ (4つ角の星)
const Spark: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <polygon transform={`translate(${x} ${y}) scale(${s * sc})`}
      points="0,-30 8,-8 30,0 8,8 0,30 -8,8 -30,0 -8,-8"
      fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
  );
};

// 赤い大きなバツ (2画が順に描かれる)
const XMark: React.FC<{ x: number; y: number; s?: number; f: number; start?: number; w?: number }> = ({
  x, y, s = 1, f, start = 0, w = 16,
}) => {
  const p1 = easeOut(seg(f, start, start + 12));
  const p2 = easeOut(seg(f, start + 10, start + 22));
  if (p1 <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={KRP.red} strokeWidth={w}
      strokeLinecap="round" opacity={0.92}>
      <line x1={-70} y1={-70} x2={-70 + 140 * p1} y2={-70 + 140 * p1} />
      {p2 > 0 && <line x1={70} y1={-70} x2={70 - 140 * p2} y2={-70 + 140 * p2} />}
    </g>
  );
};

// ふきだし (白地・丸角)
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; t?: number; text?: string; size?: number;
  tail?: "left" | "right" | "none";
}> = ({ x, y, w, h, t = 1, text, size = 40, tail = "left" }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5.5} />
      {tail !== "none" && (
        <polygon
          points={tail === "left"
            ? `${-w / 2 + 50},${h / 2 - 4} ${-w / 2 + 110},${h / 2 - 4} ${-w / 2 + 44},${h / 2 + 52}`
            : `${w / 2 - 110},${h / 2 - 4} ${w / 2 - 50},${h / 2 - 4} ${w / 2 - 44},${h / 2 + 52}`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      )}
      {tail !== "none" && (
        <rect x={tail === "left" ? -w / 2 + 50 : w / 2 - 110} y={h / 2 - 10} width={60} height={12}
          fill={KRP.white} />
      )}
      {text && (
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800}
          fontSize={size} fill={KRP.ink}>{text}</text>
      )}
    </g>
  );
};

// 書類 (白い紙 + 題字 + 本文またはグレーの線)
const Doc: React.FC<{
  x: number; y: number; s?: number; t?: number; rot?: number;
  title?: string; body?: string; bodyColor?: string; lines?: number;
}> = ({ x, y, s = 1, t = 1, rot = 0, title, body, bodyColor = KRP.ink, lines = 3 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sc})`}>
      <rect x={-150} y={-190} width={300} height={380} rx={10} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5.5} />
      {title && (
        <>
          <text x={0} y={-124} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={38} fill={KRP.ink}>{title}</text>
          <line x1={-108} y1={-100} x2={108} y2={-100} stroke={KRP.ink} strokeWidth={3.5} />
        </>
      )}
      {body && (
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={46} fill={bodyColor}>{body}</text>
      )}
      {Array.from({ length: lines }, (_, i) => (
        <line key={i} x1={-108} y1={60 + i * 38} x2={i === lines - 1 ? 20 : 108} y2={60 + i * 38}
          stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      ))}
    </g>
  );
};

// 質問紙 (はい/いいえ式。行が順に書き込まれる)
const QSheet: React.FC<{ x: number; y: number; s?: number; f: number; title?: string }> = ({
  x, y, s = 1, f, title = "質問紙",
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-280} y={-320} width={560} height={640} rx={14} fill={KRP.white}
      stroke={KRP.ink} strokeWidth={6} />
    <text x={0} y={-244} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={48} fill={KRP.ink}>{title}</text>
    <line x1={-220} y1={-212} x2={220} y2={-212} stroke={KRP.ink} strokeWidth={4} />
    <text x={130} y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={800}
      fontSize={26} fill={KRP.grayDark}>はい</text>
    <text x={225} y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={800}
      fontSize={26} fill={KRP.grayDark}>いいえ</text>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const y0 = -118 + i * 72;
      const tt = seg(f, 10 + i * 7, 18 + i * 7);
      const left = i % 2 === 0;
      return (
        <g key={i}>
          <path d={`M -236 ${y0} q 30 -8 60 0 t 60 0 t 60 0 t 60 0 t 60 0`} fill="none"
            stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" opacity={0.8} />
          <rect x={113} y={y0 - 17} width={34} height={34} rx={6} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4} />
          <rect x={208} y={y0 - 17} width={34} height={34} rx={6} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4} />
          {tt > 0 && (
            <polyline points={`${(left ? 130 : 225) - 10},${y0} ${(left ? 130 : 225) - 2},${y0 + 9} ${(left ? 130 : 225) + 12},${y0 - 10}`}
              fill="none" stroke={KRP.red} strokeWidth={5.5} strokeLinecap="round"
              strokeLinejoin="round" opacity={clamp01(tt * 2)} />
          )}
        </g>
      );
    })}
  </g>
);

// インクのしみカード (左右対称のしみ)
const BLOT_HALF = "M 0 -86 C -38 -92 -60 -60 -46 -34 C -80 -30 -86 6 -58 18 C -78 40 -62 76 -30 68 C -22 88 -6 92 0 78 Z";
const InkCard: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({
  x, y, s = 1, t = 1, rot = 0,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sc})`}>
      <rect x={-110} y={-150} width={220} height={300} rx={8} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      <g fill={KRP.ink}>
        <path d={BLOT_HALF} />
        <g transform="scale(-1 1)"><path d={BLOT_HALF} /></g>
      </g>
    </g>
  );
};

// 小さな丸頭の人形 (エゴグラム・人数表現用の抽象フィギュア)
const MiniFig: React.FC<{ x: number; y: number; s?: number; color: string; t?: number }> = ({
  x, y, s = 1, color, t = 1,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}>
      <path d="M -26 0 Q -26 -34 0 -34 Q 26 -34 26 0 Z" fill={color} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-50} r={17} fill={color} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 小さな丸頭の人形 (女性とわかるシルエット版: ボブの髪 + 裾の広がる服)
const MiniFigLady: React.FC<{ x: number; y: number; s?: number; color: string; t?: number }> = ({
  x, y, s = 1, color, t = 1,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}>
      {/* 肩から裾が広がるワンピースのシルエット */}
      <path d="M -44 0 L -22 -28 Q -24 -36 0 -36 Q 24 -36 22 -28 L 44 0 Z"
        fill={color} stroke={KRP.ink} strokeWidth={4} />
      {/* 髪 (肩までのボブ。頭の後ろ) */}
      <path d="M -31 -56 Q -31 -80 0 -80 Q 31 -80 31 -56 L 31 -30 L 17 -30 L 17 -52 L -17 -52 L -17 -30 L -31 -30 Z"
        fill={KRP.ink} />
      <circle cx={0} cy={-52} r={17} fill={color} stroke={KRP.ink} strokeWidth={4} />
      {/* 前髪 */}
      <path d="M -18 -54 Q -17 -70 0 -70 Q 17 -70 18 -54 Q 8 -63 0 -62 Q -8 -63 -18 -54 Z" fill={KRP.ink} />
    </g>
  );
};

// Person と同じ体ゆれ (Personに部品を足すとき、ずれないように同じ式を使う)
const personBob = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ===================================================================
// 旅装の人 (移民の表現用)。
// 出身を示す記号は一切つけない: 民族衣装・国旗・特定の帽子・顔立ちの描き分けをしない。
// 全員おなじ顔・おなじ体型で、服の色と荷物だけが違う「旅の人」として描く。
// ===================================================================
const Traveler: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; dir?: 1 | -1;
  coat: string; coatDark: string; hat?: "brim" | "cap" | "none"; bag?: "case" | "box" | "none";
}> = ({ x, y, s = 1, f, phase = 0, dir = 1, coat, coatDark, hat = "cap", bag = "case" }) => {
  const walk = Math.sin((f + phase * 13) / 7);
  const lift = Math.abs(walk) * 3;
  const leg = (lx: number, ang: number) => (
    <g transform={`rotate(${ang} ${lx} -62)`}>
      <rect x={lx - 10} y={-62} width={20} height={58} rx={7} fill={coatDark}
        stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={lx + 3} cy={-2} rx={18} ry={8} fill={KRP.ink} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y - lift}) scale(${s * dir} ${s})`}>
      {leg(-14, walk * 11)}
      {leg(14, -walk * 11)}
      {/* 後ろの腕 */}
      <rect x={-62} y={-158} width={20} height={84} rx={10} fill={coatDark}
        stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${walk * 7} -52 -152)`} />
      {/* コート (ひだと陰つき) */}
      <path d="M -46 -166 L 46 -166 L 58 -58 L -58 -58 Z" fill={coat}
        stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 14 -166 L 46 -166 L 58 -58 L 22 -58 Z" fill={coatDark} />
      <path d="M -46 -166 L 46 -166 L 58 -58 L -58 -58 Z" fill="none"
        stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <line x1={0} y1={-164} x2={4} y2={-58} stroke={KRP.ink} strokeWidth={3.5} />
      <circle cx={-10} cy={-138} r={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
      <circle cx={-8} cy={-110} r={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
      {/* えり */}
      <path d="M -26 -166 L 0 -142 L 26 -166" fill="none" stroke={KRP.ink}
        strokeWidth={4} strokeLinejoin="round" />
      {/* 手前の腕 */}
      <rect x={42} y={-158} width={20} height={84} rx={10} fill={coat}
        stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${-walk * 7} 52 -152)`} />
      {/* 荷物 */}
      {bag === "case" && (
        <g transform={`translate(${52 + walk * 5} -46)`}>
          <path d="M -8 -26 Q 0 -38 8 -26" fill="none" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-34} y={-26} width={68} height={48} rx={6} fill={KRP.bronze}
            stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={-34} y1={-8} x2={34} y2={-8} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        </g>
      )}
      {bag === "box" && (
        <g transform="translate(26 -104)">
          <rect x={-40} y={-34} width={80} height={62} rx={6} fill={KRP.gray}
            stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={0} y1={-34} x2={0} y2={28} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-40} y1={-4} x2={40} y2={-4} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* 頭 (全員おなじ造形) */}
      <circle cx={0} cy={-212} r={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -45 -220 Q -46 -258 0 -260 Q 46 -258 45 -220 Q 22 -236 0 -236 Q -22 -236 -45 -220 Z"
        fill={KRP.ink} />
      <circle cx={-15} cy={-208} r={5.5} fill={KRP.ink} />
      <circle cx={15} cy={-208} r={5.5} fill={KRP.ink} />
      <line x1={-8} y1={-184} x2={8} y2={-184} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
      {hat === "brim" && (
        <g>
          <path d="M -34 -248 Q -34 -286 0 -286 Q 34 -286 34 -248 Z" fill={coatDark}
            stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={-248} rx={62} ry={12} fill={coatDark} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {hat === "cap" && (
        <path d="M -42 -246 Q -44 -282 0 -282 Q 42 -280 44 -252 L 54 -246 Q 20 -238 -42 -246 Z"
          fill={coatDark} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
    </g>
  );
};

// ===================================================================
// 学者・歴史家 (眼鏡 + 襟つきの上着 + えりまき + 手に資料)。
// Person に部品を足すので、ゆれは personBob で位相をそろえる。
// ===================================================================
const Scholar: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  coat: string; coatDark: string; scarf?: string;
  face?: "normal" | "worried" | "smile" | "surprised";
  gaze?: [number, number];
  hold?: "books" | "paper" | "none"; holdSide?: 1 | -1;
}> = ({
  x, y, s = 1, f, phase = 0, coat, coatDark, scarf,
  face = "normal", gaze = [0, 0], hold = "none", holdSide = 1,
}) => {
  const bob = personBob(f, phase);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} glasses face={face} gaze={gaze}
        cloth={coat} clothDark={coatDark} />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {/* 書斎着のV襟 */}
        <path d="M -32 -162 L 0 -116 L 32 -162" fill="none" stroke={KRP.ink}
          strokeWidth={4.5} strokeLinejoin="round" />
        {scarf && (
          <g>
            <path d="M -52 -164 Q 0 -136 52 -164 L 52 -140 Q 0 -112 -52 -140 Z"
              fill={scarf} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <path d="M 24 -142 L 44 -62 L 16 -56 L 0 -134 Z"
              fill={scarf} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}
        {hold === "books" && (
          <g transform={`translate(${holdSide * 102} -86)`}>
            <rect x={-46} y={-6} width={92} height={24} rx={5} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-42} y={-30} width={84} height={24} rx={5} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-44} y={-54} width={88} height={24} rx={5} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {hold === "paper" && (
          <g transform={`translate(${holdSide * 104} -104) rotate(${holdSide * 6})`}>
            <rect x={-42} y={-58} width={84} height={112} rx={7} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={4.5} />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={-28} y1={-32 + i * 26} x2={i === 3 ? 0 : 28} y2={-32 + i * 26}
                stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" />
            ))}
          </g>
        )}
      </g>
    </g>
  );
};

// ===================================================================
// 1940年代アメリカの女性 (キャサリン/イザベル用)。
// ブラウス + Aラインのスカート + まとめ髪/ウェーブの髪。実在の人物なので戯画化しない。
// ===================================================================
const Lady: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  dress: string; dressDark: string;
  hair?: "bun" | "wave"; grayHair?: boolean; earring?: boolean;
  face?: "normal" | "smile" | "worried" | "surprised";
  gaze?: [number, number]; still?: boolean;
}> = ({
  x, y, s = 1, f = 0, phase = 0, dress, dressDark, hair = "wave",
  grayHair = false, earring = false, face = "smile", gaze = [0, 0], still = false,
}) => {
  const [gx, gy] = gaze;
  const bob = still ? 0 : personBob(f, phase);
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* 脚 (ストッキング) と靴 */}
      <rect x={-26} y={-56} width={18} height={50} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <rect x={8} y={-56} width={18} height={50} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <g fill={KRP.ink}>
        <rect x={-23} y={-10} width={8} height={10} />
        <ellipse cx={-14} cy={-6} rx={18} ry={8} />
        <rect x={15} y={-10} width={8} height={10} />
        <ellipse cx={18} cy={-6} rx={18} ry={8} />
      </g>
      {/* 腕 (袖 + 手) */}
      <rect x={-66} y={-158} width={19} height={58} rx={9} fill={dress} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-64} y={-108} width={16} height={46} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <rect x={47} y={-158} width={19} height={58} rx={9} fill={dress} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={48} y={-108} width={16} height={46} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {/* Aラインのスカート */}
      <path d="M -40 -110 L 40 -110 L 78 -42 Q 0 -22 -78 -42 Z" fill={dressDark}
        stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <line x1={-22} y1={-106} x2={-38} y2={-40} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
      <line x1={22} y1={-106} x2={38} y2={-40} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
      {/* ブラウス */}
      <path d="M -48 -166 Q -54 -132 -44 -102 L 44 -102 Q 54 -132 48 -166 Z" fill={dress}
        stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-46} y={-114} width={92} height={16} rx={6} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-9} y={-114} width={18} height={16} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      {/* 襟 */}
      <path d="M -24 -166 L 0 -136 L 24 -166" fill="none" stroke={KRP.ink}
        strokeWidth={4.5} strokeLinejoin="round" />
      {/* 髪 (後ろ) */}
      {hair === "bun" ? (
        <ellipse cx={0} cy={-286} rx={42} ry={28} fill={KRP.ink} stroke={KRP.ink} strokeWidth={4} />
      ) : (
        <path d="M -70 -232 Q -74 -292 0 -294 Q 74 -292 70 -232 L 70 -168 Q 56 -154 48 -170 L 48 -214 L -48 -214 L -48 -170 Q -56 -154 -70 -168 Z"
          fill={KRP.ink} />
      )}
      {/* 頭 */}
      <circle cx={0} cy={-224} r={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 髪 (前) */}
      {hair === "bun" ? (
        <path d="M -57 -230 Q -64 -288 0 -290 Q 64 -288 57 -230 Q 30 -256 0 -252 Q -30 -256 -57 -230 Z"
          fill={KRP.ink} />
      ) : (
        <g>
          <path d="M -57 -228 Q -63 -288 0 -290 Q 63 -288 57 -228 Q 34 -256 6 -246 Q -16 -230 -34 -244 Q -48 -250 -57 -228 Z"
            fill={KRP.ink} />
          <path d="M -58 -246 Q -76 -226 -72 -188 Q -64 -172 -72 -158 Q -54 -152 -50 -174 Q -44 -210 -40 -236 Z"
            fill={KRP.ink} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M 58 -246 Q 76 -226 72 -188 Q 64 -172 72 -158 Q 54 -152 50 -174 Q 44 -210 40 -236 Z"
            fill={KRP.ink} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
        </g>
      )}
      {grayHair && (
        <g fill="none" stroke={KRP.gray} strokeWidth={4} strokeLinecap="round" opacity={0.85}>
          <path d="M -40 -246 Q -22 -268 4 -266" />
          <path d="M 18 -268 Q 36 -264 46 -248" />
        </g>
      )}
      {earring && (
        <g>
          <circle cx={-56} cy={-206} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={56} cy={-206} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={-219} x2={-12} y2={-219} />
          <line x1={12} y1={-219} x2={32} y2={-219} />
        </g>
      ) : (
        <g>
          <ellipse cx={-22} cy={-220} rx={12} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={22} cy={-220} rx={12} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-22 + gx} cy={-220 + gy} r={6} fill={KRP.ink} />
          <circle cx={22 + gx} cy={-220 + gy} r={6} fill={KRP.ink} />
        </g>
      )}
      {/* まつげ */}
      <g stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round">
        <line x1={-34} y1={-230} x2={-43} y2={-238} />
        <line x1={34} y1={-230} x2={43} y2={-238} />
      </g>
      {/* 眉 */}
      <g fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
        {face === "worried" ? (
          <>
            <path d="M -34 -250 Q -22 -244 -12 -240" />
            <path d="M 12 -240 Q 22 -244 34 -250" />
          </>
        ) : (
          <>
            <path d="M -34 -244 Q -23 -252 -12 -246" />
            <path d="M 12 -246 Q 23 -252 34 -244" />
          </>
        )}
      </g>
      {/* 口 (紅) */}
      {face === "surprised" ? (
        <ellipse cx={0} cy={-184} rx={9} ry={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      ) : face === "worried" ? (
        <path d="M -12 -182 Q 0 -190 12 -182" fill="none" stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
      ) : face === "smile" ? (
        <path d="M -14 -190 Q 0 -176 14 -190" fill="none" stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
      ) : (
        <line x1={-11} y1={-185} x2={11} y2={-185} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
      )}
    </g>
  );
};

type LadyProps = {
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "smile" | "worried" | "surprised"; gaze?: [number, number];
};
// 母・キャサリン (年長。まとめ髪 + 白髪まじり + イヤリング)
const Katharine: React.FC<LadyProps> = (p) => (
  <Lady {...p} dress={KRP.orange} dressDark="#8E5A36" hair="bun" grayHair earring />
);
// 娘・イザベル (若々しいウェーブの髪)
const Isabel: React.FC<LadyProps> = (p) => (
  <Lady {...p} dress={KRP.green} dressDark="#3C5644" hair="wave" />
);

// 日本国旗 (縦横比 2:3。日章の直径は縦の5分の3で中央)
const JapanFlag: React.FC<{ x: number; y: number; w?: number; f?: number }> = ({ x, y, w = 198, f = 0 }) => {
  const h = (w * 2) / 3;
  const r = (h * 3) / 10;
  return (
    <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 24) * 1.1})`}>
      <rect x={0} y={0} width={w} height={h} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={w / 2} cy={h / 2} r={r} fill={KRP.red} />
    </g>
  );
};

// スイス国旗 (正方形。32分割で十字の腕幅6・腕の長さ7 = 公式の比率)
const SwissFlag: React.FC<{ x: number; y: number; size?: number; f?: number }> = ({
  x, y, size = 150, f = 0,
}) => {
  const u = size / 32;
  const armW = 6 * u;
  const span = 20 * u;
  return (
    <g transform={`translate(${x} ${y}) rotate(${Math.sin(f / 21) * 1.2})`}>
      <rect x={0} y={0} width={size} height={size} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      <rect x={(size - span) / 2} y={(size - armW) / 2} width={span} height={armW} fill={KRP.white} />
      <rect x={(size - armW) / 2} y={(size - span) / 2} width={armW} height={span} fill={KRP.white} />
    </g>
  );
};

// MBTI風の4タイルカード
const FourTile: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const cols = [KRP.blueSoft, KRP.yellow, KRP.green, KRP.orange];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}>
      <rect x={-96} y={-96} width={192} height={192} rx={14} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-82 + (i % 2) * 86} y={-82 + Math.floor(i / 2) * 86} width={78} height={78}
          rx={8} fill={cols[i]} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
    </g>
  );
};

// 試験用紙 (題なし・線だけの大きな紙)
const TestSheet: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-230} width={340} height={460} rx={12} fill={KRP.white}
      stroke={KRP.ink} strokeWidth={6} />
    <line x1={-120} y1={-160} x2={120} y2={-160} stroke={KRP.ink} strokeWidth={4.5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={-120} y1={-96 + i * 56} x2={i === 4 ? 20 : 120} y2={-96 + i * 56}
        stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
    ))}
  </g>
);

// ===================================================================
// 第7章 (#120〜#138) 真面目の谷: ユーモア停止・Atmosphere dark・賑やかな小物なし
// ===================================================================

// #120 章扉: 試験用紙と、光と影
const SceneCh7Door: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={500} f={f} dark wash={0.08}
    overlay={<ChapterTitle num={7} title="道具は、使う人を選べない。" t={easeOut(seg(f, 16, 36))} />}>
    <g transform={`rotate(${Math.sin(f / 25) * 3} 480 560)`}>
      <TestSheet x={480} y={560} s={1.15} />
    </g>
    {/* 左上のやわらかい光 / 右下のとがった影 */}
    <circle cx={250} cy={260} r={130} fill={KRP.yellow} opacity={0.5} />
    <polygon points="1540,760 1760,690 1700,830 1850,850 1620,950 1500,880"
      fill={KRP.grayDark} opacity={0.65} />
  </Shell>
);

// #121 データが思わぬ方向へ飛んでいく
const SceneDataMisuse: React.FC<{ f: number }> = ({ f }) => {
  const tt = easeOut(seg(f, 20, 55));
  // 2次ベジェに沿って紙が飛ぶ
  const bx = (1 - tt) * (1 - tt) * 620 + 2 * (1 - tt) * tt * 1000 + tt * tt * 1340;
  const by = (1 - tt) * (1 - tt) * 540 + 2 * (1 - tt) * tt * 300 + tt * tt * 480;
  return (
    <Shell seed={501} f={f} dark wash={0.06} pill="陸軍テストのデータが、思わぬ使われ方を">
      {/* 紙の山 */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={480 - i * 10} y={600 - i * 26} width={280} height={200} rx={10}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      ))}
      <TagPlate x={610} y={860} text="陸軍テストのデータ" size={28} />
      {/* 飛んでいく軌跡と紙 */}
      <path d="M 620 540 Q 1000 300 1340 480" fill="none" stroke={KRP.grayDark}
        strokeWidth={5} strokeDasharray="16 14" opacity={0.7} />
      <g transform={`translate(${bx} ${by}) rotate(${tt * 40 - 10})`}>
        <rect x={-55} y={-70} width={110} height={140} rx={8} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={5} />
        <line x1={-32} y1={-30} x2={32} y2={-30} stroke={KRP.grayDark} strokeWidth={4} />
        <line x1={-32} y1={4} x2={32} y2={4} stroke={KRP.grayDark} strokeWidth={4} />
      </g>
      {/* 行き先の暗いかたまり */}
      <polygon points="1430,420 1560,380 1660,450 1640,580 1500,630 1390,550"
        fill={KRP.grayDark} opacity={0.8} />
      <polygon points="1460,460 1570,430 1620,500 1580,560 1480,560"
        fill={KRP.ink} opacity={0.45} />
    </Shell>
  );
};

// #122-123 四方からやってくる旅の人たちと、当時の「誤った主張」の引用札。
// ※出身をにおわせる記号 (民族衣装・国旗・特定の帽子・顔立ちの描き分け) は描かない。
//   主張は引用札の中だけに置き、赤い枠と札で「当時の誤った主張」だと示す。
const SceneClaimDark: React.FC<{ f: number }> = ({ f }) => {
  const come = easeOut(seg(f, 0, 44));
  const up = easeOut(seg(f, 26, 54));
  // 四方 (左手前・右手前・左奥・右奥) から中央へ集まってくる旅の人たち
  const COMERS = [
    { x0: -180, x1: 285, y: 868, s: 0.78, dir: 1 as const, phase: 0, coat: KRP.blueDeep, dark: "#35598C", hat: "brim" as const, bag: "case" as const },
    { x0: 2110, x1: 1636, y: 868, s: 0.78, dir: -1 as const, phase: 2, coat: KRP.bronze, dark: "#8E5A36", hat: "cap" as const, bag: "box" as const },
    { x0: -140, x1: 408, y: 616, s: 0.5, dir: 1 as const, phase: 4, coat: KRP.green, dark: "#3C5644", hat: "none" as const, bag: "box" as const },
    { x0: 2070, x1: 1512, y: 616, s: 0.5, dir: -1 as const, phase: 6, coat: KRP.orange, dark: "#8E5A36", hat: "brim" as const, bag: "case" as const },
  ];
  // 四方から中央へ向かう流れの線
  const INFLOW = [
    { x1: 60, y1: 880, x2: 540, y2: 760 },
    { x1: 1860, y1: 880, x2: 1380, y2: 760 },
    { x1: 60, y1: 560, x2: 560, y2: 640 },
    { x1: 1860, y1: 560, x2: 1360, y2: 640 },
  ];
  return (
    <Shell seed={502} f={f} dark wash={0.08} pill="数字が、主張の根拠にされた">
      {/* 四方からの流れ */}
      {INFLOW.map((l, i) => {
        const a = Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
        return (
          <g key={i} opacity={0.6}>
            <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={KRP.grayDark} strokeWidth={6}
              strokeLinecap="round" strokeDasharray="30 22" strokeDashoffset={-f * 4} />
            <polygon fill={KRP.grayDark}
              points={`${l.x2},${l.y2} ${l.x2 - Math.cos(a - 0.4) * 34},${l.y2 - Math.sin(a - 0.4) * 34} ${l.x2 - Math.cos(a + 0.4) * 34},${l.y2 - Math.sin(a + 0.4) * 34}`} />
          </g>
        );
      })}
      {/* 旅の人たち (奥→手前の順に描く) */}
      {[...COMERS.slice(2), ...COMERS.slice(0, 2)].map((c, i) => {
        const cx = lerp(c.x0, c.x1, come);
        return (
          <g key={i}>
            <ellipse cx={cx} cy={c.y + 4} rx={70 * c.s} ry={13 * c.s} fill={KRP.ink} opacity={0.18} />
            <Traveler x={cx} y={c.y} s={c.s} dir={c.dir} f={f}
              phase={c.phase} coat={c.coat} coatDark={c.dark} hat={c.hat} bag={c.bag} />
          </g>
        );
      })}
      {/* 引用札: 当時の主張を「引用」として掲げる (差別的な文言は書かない) */}
      <g transform={`translate(960 420) scale(${pop(seg(f, 6, 22))})`}>
        <rect x={-352} y={-132} width={704} height={264} rx={18} fill={KRP.white}
          stroke={KRP.red} strokeWidth={8} />
        <text x={-300} y={-28} fontFamily={FONT} fontWeight={900} fontSize={120} fill={KRP.gray}>&#8220;</text>
        <text x={212} y={116} fontFamily={FONT} fontWeight={900} fontSize={120} fill={KRP.gray}>&#8221;</text>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-200 + i * 14} ${-56 + i * 54} q 50 -20 100 0 t 100 0 t 100 0`}
            fill="none" stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round" opacity={0.85} />
        ))}
      </g>
      <TagPlate x={960} y={610} text="当時の、誤った主張" size={32} color={KRP.red}
        t={seg(f, 22, 36)} />
      {/* 根拠として引用された紙 */}
      <g transform={`translate(0 ${(1 - up) * 120})`} opacity={up}>
        <line x1={960} y1={644} x2={960} y2={676} stroke={KRP.ink} strokeWidth={6} opacity={0.7} />
        <Doc x={960} y={752} s={0.42} lines={4} />
        <TagPlate x={960} y={852} text="根拠として引用" size={22} />
      </g>
    </Shell>
  );
};

// #124-125 言葉と文化で傾くはかり
const SceneLanguageBias: React.FC<{ f: number }> = ({ f }) => {
  const a = ((8 + Math.sin(f / 15) * 3) * Math.PI) / 180;
  const cx = 1290, cy = 480, arm = 240;
  const rx = cx + Math.cos(a) * arm, ry = cy + Math.sin(a) * arm;
  const lx = cx - Math.cos(a) * arm, ly = cy - Math.sin(a) * arm;
  const pan = (px: number, py: number) => (
    <g>
      <line x1={px - 56} y1={py + 64} x2={px} y2={py} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={px + 56} y1={py + 64} x2={px} y2={py} stroke={KRP.ink} strokeWidth={4.5} />
      <path d={`M ${px - 70} ${py + 64} Q ${px} ${py + 104} ${px + 70} ${py + 64} Z`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
    </g>
  );
  return (
    <Shell seed={503} f={f} dark wash={0.06} pill="成績は、英語と文化の知識に左右された">
      <Ground y={830} />
      <Person x={470} y={830} f={f} face="worried" cloth={KRP.bronze} clothDark="#8E5A36" gaze={[4, 0]} />
      {/* トランク */}
      <rect x={580} y={752} width={130} height={78} rx={10} fill={KRP.blueDeep}
        stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={622} y={736} width={46} height={18} rx={8} fill="none" stroke={KRP.ink} strokeWidth={5} />
      {/* はかり */}
      <rect x={cx - 14} y={cy} width={28} height={290} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={cx - 120} y={cy + 290} width={240} height={26} rx={8} fill={KRP.grayDark}
        stroke={KRP.ink} strokeWidth={5} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      {pan(lx, ly)}
      {pan(rx, ry)}
      {/* 左皿: 成績の紙 / 右皿: 英語・文化の重り */}
      <g transform={`translate(${lx} ${ly + 36})`}>
        <rect x={-38} y={-52} width={76} height={94} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={-22} y1={-24} x2={22} y2={-24} stroke={KRP.grayDark} strokeWidth={3.5} />
        <line x1={-22} y1={0} x2={22} y2={0} stroke={KRP.grayDark} strokeWidth={3.5} />
      </g>
      <TagPlate x={lx} y={ly - 70} text="成績" size={26} />
      {/* 右皿: 英語 = ABCの辞書 / アメリカの文化 = 野球のボールとアップルパイ */}
      <g transform={`translate(${rx} ${ry + 20})`}>
        {/* 辞書 (立てかけた本) */}
        <g transform="translate(-36 0) rotate(-8) scale(0.9)">
          <rect x={-40} y={-58} width={76} height={102} rx={6} fill={KRP.blueDeep}
            stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-40} y={-58} width={18} height={102} rx={6} fill="#35598C"
            stroke={KRP.ink} strokeWidth={4} />
          <rect x={-14} y={-44} width={44} height={34} rx={5} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={3.5} />
          {/* 背ラベルの幅 44 に3文字。はみ出さないよう 20 にしてある */}
          <text x={8} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={20} fill={KRP.ink}>ABC</text>
          <line x1={-12} y1={6} x2={30} y2={6} stroke={KRP.white} strokeWidth={3.5} opacity={0.8} />
          <line x1={-12} y1={22} x2={22} y2={22} stroke={KRP.white} strokeWidth={3.5} opacity={0.8} />
        </g>
        {/* アップルパイのひと切れ */}
        <g transform="translate(40 24) scale(0.85)">
          <path d="M -36 22 L 36 22 L 26 -6 L -26 -6 Z" fill={KRP.bronze}
            stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -26 -6 L 26 -6 L 12 -30 L -12 -30 Z" fill={KRP.brass}
            stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <line x1={-14} y1={-8} x2={-6} y2={-28} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          <line x1={6} y1={-8} x2={12} y2={-28} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        </g>
        {/* 野球のボール */}
        <g transform="translate(38 -42)">
          <circle cx={0} cy={0} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -17 -24 Q -30 0 -17 24" fill="none" stroke={KRP.red} strokeWidth={4} />
          <path d="M 17 -24 Q 30 0 17 24" fill="none" stroke={KRP.red} strokeWidth={4} />
          {[-16, -4, 8, 20].map((sy) => (
            <g key={sy} stroke={KRP.red} strokeWidth={3} strokeLinecap="round">
              <line x1={-24} y1={sy} x2={-16} y2={sy - 4} />
              <line x1={24} y1={sy} x2={16} y2={sy - 4} />
            </g>
          ))}
        </g>
      </g>
      <TagPlate x={rx + 10} y={ry - 104} text="英語・アメリカの文化" size={24} />
    </Shell>
  );
};

// #126/#128 数字が「追い風」になって門を押す
const SceneTailwind: React.FC<{ f: number }> = ({ f }) => {
  const push = easeOut(seg(f, 20, 50));
  return (
    <Shell seed={504} f={f} dark wash={0.06} pill="数字は、「追い風」に使われた">
      {/* 風の流線 */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M 220 ${380 + i * 150} q 180 ${i % 2 ? 36 : -36} 360 0 t 360 0 t 300 0`}
          fill="none" stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round"
          strokeDasharray="34 26" strokeDashoffset={-f * 4} opacity={0.7} />
      ))}
      {/* 風に乗る紙 (数字のデータ) */}
      {[0, 1, 2].map((i) => (
        <g key={i}
          transform={`translate(${420 + i * 180 + push * 140} ${360 + i * 160 + Math.sin(f / 9 + i) * 10}) rotate(${12 - i * 8})`}>
          <rect x={-50} y={-64} width={100} height={128} rx={8} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5} />
          <line x1={-28} y1={-26} x2={28} y2={-26} stroke={KRP.grayDark} strokeWidth={4} />
          <line x1={-28} y1={6} x2={28} y2={6} stroke={KRP.grayDark} strokeWidth={4} />
        </g>
      ))}
      {/* 閉まりかけの重い門 */}
      <rect x={1430} y={240} width={44} height={620} fill={KRP.ink} opacity={0.85} />
      <g transform={`rotate(${push * 8} 1474 550)`}>
        <rect x={1474} y={270} width={330} height={260} rx={10} fill={KRP.grayDark}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1474} y={550} width={330} height={260} rx={10} fill={KRP.grayDark}
          stroke={KRP.ink} strokeWidth={6} />
      </g>
    </Shell>
  );
};

// #127 多くの歴史家が激論している (賛否がぶつかり、今も続く)
const SceneDebate: React.FC<{ f: number }> = ({ f }) => {
  const wob = Math.sin(f / 12) * 6;
  const clash = Math.sin(f / 7) * 9;
  // 左右の主張が交互に出る (議論が「続いている」感じ)
  const cyc = f % 84;
  const bubbleL = clamp01(seg(cyc, 2, 12) - seg(cyc, 34, 42));
  const bubbleR = clamp01(seg(cyc, 44, 54) - seg(cyc, 76, 84));
  const scribble = (x: number, y: number, w: number) => (
    <g stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.85}>
      <path d={`M ${x - w} ${y - 18} q ${w / 3} -14 ${(w * 2) / 3} 0 t ${(w * 2) / 3} 0`} />
      <path d={`M ${x - w} ${y + 16} q ${w / 3} -14 ${(w * 2) / 3} 0 t ${(w * 2) / 3} 0`} />
    </g>
  );
  return (
    <Shell seed={505} f={f} dark wash={0.06} pill="立法への影響は、今も歴史家の間で議論が続く">
      <Ground y={846} />
      <TagPlate x={960} y={274} text="歴史家たちの議論" size={30} />
      {/* 左の論者たち (賛) */}
      <Scholar x={250} y={846} s={0.68} f={f} phase={4} coat={KRP.bronze} coatDark="#8E5A36"
        scarf={KRP.red} gaze={[6, 0]} hold="books" holdSide={-1} />
      <Scholar x={566} y={846} s={0.9} f={f} phase={0} coat={KRP.grayDark} coatDark="#5E666E"
        gaze={[6, 0]} hold="paper" holdSide={1} />
      {/* 右の論者たち (否) */}
      <Scholar x={1670} y={846} s={0.68} f={f} phase={7} coat={KRP.green} coatDark="#3C5644"
        scarf={KRP.yellow} gaze={[-6, 0]} hold="books" holdSide={1} />
      <Scholar x={1354} y={846} s={0.9} f={f} phase={3} coat={KRP.blueDeep} coatDark="#35598C"
        scarf={KRP.orange} gaze={[-6, 0]} hold="paper" holdSide={-1} />
      {/* 真ん中: 資料を突き合わせる */}
      <g transform={`translate(${-clash} 0) rotate(${-8 - clash * 0.2} 856 620)`}>
        <Doc x={856} y={620} s={0.46} lines={4} />
      </g>
      <g transform={`translate(${clash} 0) rotate(${8 + clash * 0.2} 1064 620)`}>
        <Doc x={1064} y={620} s={0.46} lines={4} />
      </g>
      {/* ぶつかる音 (放射の線) */}
      <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.55}>
        {[-62, -30, 0, 30, 62].map((d, i) => (
          <line key={i} x1={960 + d * 0.5} y1={498} x2={960 + d} y2={448 - Math.abs(d) * 0.18} />
        ))}
      </g>
      {/* 交互に出るふきだし */}
      <g opacity={bubbleL}>
        <Bubble x={690} y={372} w={330} h={132} t={bubbleL} tail="left" />
        {scribble(690, 372, 110)}
      </g>
      <g opacity={bubbleR}>
        <Bubble x={1238} y={372} w={330} h={132} t={bubbleR} tail="right" />
        {scribble(1238, 372, 110)}
      </g>
      {/* ⇄ 向き合う矢印 (議論の往復) */}
      <g transform={`translate(${wob} 0)`}>
        <line x1={790} y1={752} x2={1100} y2={752} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <polygon points="1130,752 1090,736 1090,768" fill={KRP.ink} />
      </g>
      <g transform={`translate(${-wob} 0)`}>
        <line x1={1130} y1={812} x2={820} y2={812} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <polygon points="790,812 830,796 830,828" fill={KRP.ink} />
      </g>
    </Shell>
  );
};

// #128 時代の空気が、世の中の流れを一方向へ後押しした
// (#126 の w3_tailwind とは別の絵。こちらは「門」ではなく「空気そのものの流れ」)
const SceneKuukiAtooshi: React.FC<{ f: number }> = ({ f }) => {
  const push = easeOut(seg(f, 8, 52));
  const CROWD = [0, 1, 2, 3, 4, 5, 6];
  return (
    <Shell seed={561} f={f} dark wash={0.07} pill="時代の空気が、流れを後押しした">
      {/* 背景: 一方向へ向かう大きな流れ */}
      <path d="M 150 700 L 1560 700 L 1560 640 L 1790 760 L 1560 880 L 1560 820 L 150 820 Z"
        fill={KRP.gray} opacity={0.3} />
      {/* 時代の空気のうず */}
      <g transform={`translate(360 350) rotate(${f * 1.1})`}>
        {[0, 1, 2].map((i) => (
          <path key={i}
            d={`M 0 ${-(60 + i * 44)} A ${60 + i * 44} ${60 + i * 44} 0 1 1 ${-(60 + i * 44)} 0`}
            fill="none" stroke={KRP.grayDark} strokeWidth={9 - i * 1.5} strokeLinecap="round"
            opacity={0.8 - i * 0.16} />
        ))}
      </g>
      <TagPlate x={360} y={540} text="時代の空気" size={30} t={seg(f, 6, 20)} />
      {/* 風の帯 (左から右へ流れ続ける) */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i}
          d={`M 120 ${250 + i * 108} q 200 ${i % 2 ? 44 : -44} 400 0 t 400 0 t 400 0 t 400 0`}
          fill="none" stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round"
          strokeDasharray="40 30" strokeDashoffset={-f * 6} opacity={0.6} />
      ))}
      {/* 風に押されて、みな同じ向きへ傾く世の中 */}
      {CROWD.map((i) => {
        const bx = 300 + i * 190 + push * 70;
        const by = 806 + Math.sin(f / 10 + i) * 4;
        return (
          <g key={i} transform={`rotate(${13 + Math.sin(f / 9 + i) * 2} ${bx} ${by})`}>
            <MiniFig x={bx} y={by} s={1.45} color={i % 2 === 0 ? KRP.gray : KRP.grayDark} />
          </g>
        );
      })}
      {/* 風見: すっかり一方向を指している */}
      <g transform={`translate(1740 0)`}>
        <line x1={0} y1={300} x2={0} y2={830} stroke={KRP.grayDark} strokeWidth={10} strokeLinecap="round" />
        <g transform={`translate(0 290) rotate(${Math.sin(f / 16) * 4})`}>
          <polygon points="-96,0 30,0 30,-26 96,16 30,58 30,32 -96,32"
            fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
        <circle cx={0} cy={306} r={12} fill={KRP.ink} />
      </g>
    </Shell>
  );
};

// #129/#131 「優生学」の札と広がるしみ
const SceneYuseigaku: React.FC<{ f: number }> = ({ f }) => {
  const stain = easeOut(seg(f, 14, 50));
  const ppl = seg(f, 30, 44);
  return (
    <Shell seed={506} f={f} dark wash={0.1} pill="当時、広がっていた「優生学」">
      {/* 足元に広がるしみ */}
      <ellipse cx={960} cy={660} rx={40 + 260 * stain} ry={14 + 70 * stain}
        fill={KRP.ink} opacity={0.25} />
      {/* 札 */}
      <rect x={760} y={370} width={400} height={120} rx={12} fill={KRP.grayDark}
        stroke={KRP.ink} strokeWidth={6.5} />
      <text x={960} y={455} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={66} fill={KRP.white}>優生学</text>
      <line x1={960} y1={490} x2={960} y2={620} stroke={KRP.ink} strokeWidth={8} />
      {/* 沈んだ顔の学者たち */}
      <g opacity={ppl}>
        <Person x={430} y={850} s={0.85} f={f} glasses face="normal" gaze={[4, -2]}
          cloth={KRP.grayDark} clothDark="#5E666E" />
        <Person x={1490} y={850} s={0.85} f={f} glasses face="normal" gaze={[-4, -2]} phase={5}
          cloth={KRP.bronze} clothDark="#8E5A36" />
      </g>
    </Shell>
  );
};

// #130 人を仕分けるという発想 (完全に抽象の仕分け図)
const SceneSorting: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={507} f={f} dark wash={0.08} pill="人を「仕分ける」という発想に">
    {/* ベルトライン */}
    <line x1={300} y1={560} x2={1180} y2={560} stroke={KRP.ink} strokeWidth={8} />
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={360 + i * 240} cy={590} r={16} fill="none" stroke={KRP.ink}
        strokeWidth={5} opacity={0.6} />
    ))}
    {/* ゲート */}
    <rect x={1160} y={400} width={26} height={160} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    <polygon points="1120,400 1226,400 1173,340" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 流れる丸たち: 偶数は上へ、奇数は下へ落ちる */}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const u = ((f * 0.9 + i * 45) % 270) / 270;
      const x = 320 + u * 1240;
      const past = Math.max(0, x - 1186);
      const up = i % 2 === 0;
      const y = up ? 530 - past * 0.45 : 530 + past * 0.8;
      const op = past > 0 && !up ? Math.max(0, 1 - past / 260) : 1;
      return (
        <circle key={i} cx={x} cy={y} r={34} fill={up ? KRP.blueSoft : KRP.gray}
          stroke={KRP.ink} strokeWidth={5} opacity={op} />
      );
    })}
    {/* 上がる矢印と落ちる矢印 */}
    <line x1={1390} y1={470} x2={1390} y2={370} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
    <polygon points="1390,340 1372,382 1408,382" fill={KRP.ink} />
    <line x1={1330} y1={660} x2={1330} y2={760} stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round" />
    <polygon points="1330,790 1312,748 1348,748" fill={KRP.grayDark} />
  </Shell>
);

// #131 検査を広めた学者たち自身が、優生思想の支持者だった (重い事実なのでシリアスに)
const SceneGakushaShiji: React.FC<{ f: number }> = ({ f }) => {
  const banner = easeOut(seg(f, 4, 26));
  const MEN = [
    { x: 430, coat: KRP.grayDark, dark: "#5E666E", phase: 0, side: 1 as const },
    { x: 780, coat: KRP.bronze, dark: "#8E5A36", phase: 2, side: -1 as const },
    { x: 1140, coat: KRP.blueDeep, dark: "#35598C", phase: 4, side: 1 as const },
    { x: 1490, coat: KRP.grayDark, dark: "#5E666E", phase: 6, side: -1 as const },
  ];
  return (
    <Shell seed={562} f={f} dark wash={0.12} pill="検査を広めた学者たちの多くも、支持者だった">
      <Ground y={862} />
      {/* 垂れ幕「優生学」 */}
      <g opacity={banner} transform={`translate(0 ${(1 - banner) * -50})`}>
        <line x1={500} y1={244} x2={1420} y2={244} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <path d={`M 640 244 L 1280 244 L 1280 ${452 + Math.sin(f / 18) * 5} Q 960 ${488 + Math.sin(f / 14) * 7} 640 ${452 + Math.sin(f / 18 + 1) * 5} Z`}
          fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <text x={960} y={392} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={96} fill={KRP.white}>優生学</text>
      </g>
      {/* 旗の下に並ぶ、検査用紙を手にした学者たち */}
      {MEN.map((m, i) => (
        <Scholar key={i} x={m.x} y={862} s={0.72} f={f} phase={m.phase}
          coat={m.coat} coatDark={m.dark} face="normal" gaze={[0, -2]}
          hold="paper" holdSide={m.side} />
      ))}
      {/* 旗を見上げる線 (支持) */}
      {MEN.map((m, i) => {
        const tx = 720 + i * 160;
        return (
          <g key={`a${i}`} opacity={seg(f, 24 + i * 5, 38 + i * 5) * 0.75}>
            <line x1={m.x} y1={636} x2={tx} y2={540} stroke={KRP.grayDark} strokeWidth={5}
              strokeLinecap="round" strokeDasharray="14 12" strokeDashoffset={-f * 2} />
            <circle cx={tx} cy={534} r={9} fill={KRP.grayDark} />
          </g>
        );
      })}
      <TagPlate x={960} y={578} text="多くが、支持者だった" size={28} t={seg(f, 40, 54)} />
      {/* 手にしているのは知能検査の用紙 */}
      <g opacity={seg(f, 16, 28)}>
        <line x1={258} y1={762} x2={470} y2={788} stroke={KRP.ink} strokeWidth={4}
          strokeLinecap="round" opacity={0.7} />
        <TagPlate x={196} y={752} text="知能検査の用紙" size={22} />
      </g>
    </Shell>
  );
};

// #132 1927年・最高裁「合憲」
const SceneCourt1927: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={508} f={f} dark wash={0.06} pill="1927年、最高裁は「合憲」とした">
    {/* 裁判所 */}
    <rect x={620} y={820} width={680} height={36} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={660} y={790} width={600} height={30} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={716 + i * 136} y={520} width={80} height={270} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={6} />
    ))}
    <rect x={660} y={470} width={600} height={50} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5.5} />
    <polygon points="620,470 1300,470 960,330" fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
    <TagPlate x={560} y={330} text="1927年" size={34} />
    <TagPlate x={1400} y={330} text="最高裁" size={34} />
    {/* 合憲の札 (静かに出す) */}
    <g opacity={seg(f, 36, 48)}>
      <rect x={830} y={580} width={260} height={120} rx={10} fill={KRP.white}
        stroke={KRP.red} strokeWidth={7} />
      <text x={960} y={666} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={64} fill={KRP.red}>合憲</text>
    </g>
  </Shell>
);

// #133 約7万人 (点の広がりと数字だけ。直接描写はしない)
const Scene70000: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={509} f={f} dark wash={0.18}>
    {Array.from({ length: 70 }, (_, idx) => {
      const ix = idx % 10, iy = Math.floor(idx / 10);
      return (
        <circle key={idx} cx={510 + ix * 100} cy={320 + iy * 82} r={13} fill={KRP.gray}
          opacity={0.8 * seg(f, idx * 0.6, idx * 0.6 + 6)} />
      );
    })}
    <g transform={`translate(960 570) scale(${pop(seg(f, 40, 54))})`}>
      <rect x={-230} y={-72} width={460} height={144} rx={14} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={7} />
      <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={76} fill={KRP.ink}>約7万人</text>
    </g>
  </Shell>
);

// #134 日本の優生保護法と2024年の違憲判決
const SceneJapanLaw: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={510} f={f} dark wash={0.08} pill="日本にも、優生保護法があった">
    {/* 日本国旗 (縦横比2:3・日章は縦の5分の3) */}
    <line x1={190} y1={288} x2={190} y2={880} stroke={KRP.grayDark} strokeWidth={10} strokeLinecap="round" />
    <circle cx={190} cy={282} r={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
    <g transform={`translate(190 304)`}>
      <JapanFlag x={0} y={0} w={186} f={f} />
    </g>
    <TagPlate x={283} y={470} text="日本" size={26} t={seg(f, 8, 22)} />
    <Doc x={660} y={590} s={1.15} title="優生保護法" lines={3} />
    <Doc x={1360} y={590} s={1.15} t={seg(f, 18, 34)} title="最高裁" body="違憲" bodyColor={KRP.red} lines={2} />
    {/* 間の矢印 */}
    <g opacity={seg(f, 12, 26)}>
      <line x1={880} y1={590} x2={1130} y2={590} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <polygon points="1160,590 1118,572 1118,608" fill={KRP.ink} />
    </g>
  </Shell>
);

// #135 暗闇の中の小さな光 (救いの後日談へ)
const SceneHikari: React.FC<{ f: number }> = ({ f }) => {
  const g = easeOut(seg(f, 15, 50));
  return (
    <Shell seed={511} f={f} dark wash={0.5} pill="ひとつだけ、救いの後日談">
      <TagPlate x={960} y={320} text="後日談" size={30} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const r0 = 150 * g + 30, r1 = 150 * g + 90;
        return (
          <line key={i} x1={960 + Math.cos(a) * r0} y1={560 + Math.sin(a) * r0}
            x2={960 + Math.cos(a) * r1} y2={560 + Math.sin(a) * r1}
            stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={g} />
        );
      })}
      <circle cx={960} cy={560} r={150 * g + 4} fill={KRP.yellow} opacity={0.9} />
      <circle cx={960} cy={560} r={70 * g + 2} fill={KRP.white} />
    </Shell>
  );
};

// #136-137 ブリガム、自ら全面撤回
const SceneBrigham: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={512} f={f} dark wash={0.04} pill="ブリガム、自ら全面撤回"
    overlay={f >= 44 ? <Stamp x={1080} y={640} text="全面撤回" size={54} /> : undefined}>
    <Ground y={830} />
    <Person x={520} y={830} f={f} glasses face="worried" gaze={[5, 0]}
      cloth={KRP.blueDeep} clothDark="#35598C" />
    <Bubble x={640} y={370} w={480} h={130} t={seg(f, 46, 56)} text="「根拠がなかった」" size={42} />
    {/* 自分の論文 */}
    <g transform="translate(1250 560)">
      <rect x={-190} y={-240} width={380} height={480} rx={12} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={6.5} />
      <line x1={-130} y1={-170} x2={130} y2={-170} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 中の折れ線グラフ */}
      <line x1={-130} y1={120} x2={130} y2={120} stroke={KRP.grayDark} strokeWidth={4} />
      <line x1={-130} y1={120} x2={-130} y2={-80} stroke={KRP.grayDark} strokeWidth={4} />
      <polyline points="-130,80 -60,20 10,60 80,-40 130,-10" fill="none"
        stroke={KRP.blueDeep} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <line x1={-130} y1={180} x2={60} y2={180} stroke={KRP.grayDark} strokeWidth={5} opacity={0.75} />
    </g>
    <XMark x={1250} y={540} s={2.1} f={f} start={20} w={13} />
  </Shell>
);

// #138 同じ道具が、良い手にも悪い手にも
const SceneToolTwoSides: React.FC<{ f: number }> = ({ f }) => {
  const l = easeOut(seg(f, 14, 30));
  const r = easeOut(seg(f, 28, 44));
  return (
    <Shell seed={513} f={f} dark wash={0.03} pill="道具は、使う人を選べない">
      {/* 台座の上の試験用紙 */}
      <rect x={830} y={740} width={260} height={90} rx={10} fill={KRP.bronze}
        stroke={KRP.ink} strokeWidth={5.5} />
      <TestSheet x={960} y={520} s={0.95} />
      {/* 左: 支援の方向 */}
      <g opacity={l}>
        <line x1={760} y1={560} x2={lerp(760, 600, l)} y2={lerp(560, 480, l)}
          stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <polygon points="580,468 632,470 606,508" fill={KRP.ink} />
        <circle cx={430} cy={380} r={74} fill={KRP.yellow} opacity={0.85} />
        <path d="M 430 470 C 364 420 400 376 430 408 C 460 376 496 420 430 470 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={5} transform="translate(0 110)" />
      </g>
      {/* 右: 暗い使われ方 */}
      <g opacity={r}>
        <line x1={1160} y1={560} x2={lerp(1160, 1320, r)} y2={lerp(560, 480, r)}
          stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        <polygon points="1340,468 1288,470 1314,508" fill={KRP.ink} />
        <polygon points="1420,330 1560,290 1660,360 1630,490 1490,530 1400,450"
          fill={KRP.grayDark} opacity={0.85} />
        <g stroke={KRP.red} strokeWidth={13} strokeLinecap="round">
          <line x1={1480} y1={560} x2={1600} y2={680} />
          <line x1={1600} y1={560} x2={1480} y2={680} />
        </g>
      </g>
    </Shell>
  );
};

// ===================================================================
// 第8章 (#139〜#160) 谷明け: 性格検査の誕生。「完成したら戦争が終わっていた」
// ===================================================================

// 矢印 (線 + 三角。tで伸びる)
const Arrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number; t?: number; color?: string; w?: number;
}> = ({ x1, y1, x2, y2, t = 1, color = KRP.ink, w = 9 }) => {
  const tt = easeOut(clamp01(t));
  if (tt <= 0) return null;
  const ex = lerp(x1, x2, tt), ey = lerp(y1, y2, tt);
  const a = Math.atan2(y2 - y1, x2 - x1);
  const tri = (r: number, da: number) =>
    `${ex + Math.cos(a + da) * r},${ey + Math.sin(a + da) * r}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${tri(30, 0)} ${tri(26, 2.6)} ${tri(26, -2.6)}`} fill={color} />
    </g>
  );
};

// 小さな家 (民間・街の表現)
const HouseIcon: React.FC<{ x: number; y: number; s?: number; color?: string; t?: number }> = ({
  x, y, s = 1, color = KRP.blueSoft, t = 1,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}>
      <rect x={-70} y={-60} width={140} height={120} fill={color} stroke={KRP.ink} strokeWidth={5} />
      <polygon points="-86,-60 86,-60 0,-140" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-22} y={0} width={44} height={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 小さな棒グラフのカード (エゴグラム系・診断の子孫の表現)
const BarsCard: React.FC<{ x: number; y: number; s?: number; t?: number; f?: number }> = ({
  x, y, s = 1, t = 1, f = 60,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const hs = [0.9, 0.5, 0.75, 0.6];
  const cols = [KRP.red, KRP.orange, KRP.blueDeep, KRP.green];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}>
      <rect x={-110} y={-150} width={220} height={300} rx={8} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      <line x1={-80} y1={100} x2={80} y2={100} stroke={KRP.ink} strokeWidth={4} />
      <line x1={-80} y1={100} x2={-80} y2={-100} stroke={KRP.ink} strokeWidth={4} />
      {hs.map((h, i) => {
        const hh = h * 170 * (0.75 + 0.25 * Math.sin((f ?? 0) / 16 + i));
        return (
          <rect key={i} x={-64 + i * 38} y={100 - hh} width={26} height={hh}
            fill={cols[i]} stroke={KRP.ink} strokeWidth={3.5} />
        );
      })}
    </g>
  );
};

// #139 第8章扉: 質問紙と紙飛行機
const SceneCh8Door: React.FC<{ f: number }> = ({ f }) => {
  const tt = easeOut(seg(f, 12, 52));
  const bx = (1 - tt) * (1 - tt) * 620 + 2 * (1 - tt) * tt * 1050 + tt * tt * 1500;
  const by = (1 - tt) * (1 - tt) * 400 + 2 * (1 - tt) * tt * 210 + tt * tt * 330;
  return (
    <Shell seed={514} f={f}
      overlay={<ChapterTitle num={8} title="完成したら、戦争が終わっていた。" t={easeOut(seg(f, 16, 36))} left={980} width={900} />}>
      <QSheet x={430} y={580} s={0.85} f={f} />
      <path d="M 620 400 Q 1050 210 1500 330" fill="none" stroke={KRP.grayDark}
        strokeWidth={5} strokeDasharray="16 14" opacity={0.6} />
      <g transform={`translate(${bx} ${by}) rotate(${10 - tt * 24})`}>
        <polygon points="-50,16 58,-10 -28,-22" fill={KRP.white} stroke={KRP.ink}
          strokeWidth={4.5} strokeLinejoin="round" />
        <polygon points="-50,16 58,-10 -18,2" fill={KRP.blueSoft} stroke={KRP.ink}
          strokeWidth={4.5} strokeLinejoin="round" />
      </g>
    </Shell>
  );
};

// #140 「性格」の話に戻る道しるべ
const SceneBackToSeikaku: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={515} f={f} pill="ここで、「性格」の話に戻る">
    <Ground y={830} />
    <Person x={600} y={830} f={f} face="smile" gaze={[6, 0]} lean={3}
      cloth={KRP.blueDeep} clothDark="#35598C" />
    {/* 道しるべ */}
    <rect x={1130} y={400} width={26} height={430} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
    <g transform={`translate(0 ${Math.sin(f / 14) * 3})`}>
      <polygon points="1050,400 1420,400 1480,445 1420,490 1050,490" fill={KRP.orange}
        stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      <text x={1240} y={462} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={48} fill={KRP.ink}>性格</text>
    </g>
    <g transform={`translate(0 ${Math.sin(f / 14 + 2) * 3})`}>
      <polygon points="1240,540 870,540 810,585 870,630 1240,630" fill={KRP.gray}
        stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      <text x={1040} y={602} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={44} fill={KRP.ink}>能力</text>
    </g>
    <Arrow x1={760} y1={700} x2={1040} y2={700} t={seg(f, 20, 40)} />
  </Shell>
);

// #141 同じ戦争から生えたふたつの枝
const SceneSameRoot: React.FC<{ f: number }> = ({ f }) => {
  const trunk = easeOut(seg(f, 6, 22));
  const br = easeOut(seg(f, 20, 40));
  return (
    <Shell seed={516} f={f} pill="性格検査も、同じ戦争から生まれた">
      <Ground y={840} />
      {/* 幹 */}
      <line x1={960} y1={840} x2={960} y2={840 - 230 * trunk} stroke={KRP.bronze}
        strokeWidth={26} strokeLinecap="round" />
      <line x1={960} y1={840} x2={960} y2={840 - 230 * trunk} stroke={KRP.ink}
        strokeWidth={4} strokeLinecap="round" opacity={0.3} />
      {/* 2本の枝 */}
      <path d={`M 960 620 Q 840 560 ${lerp(960, 710, br)} ${lerp(620, 450, br)}`} fill="none"
        stroke={KRP.bronze} strokeWidth={18} strokeLinecap="round" opacity={br > 0 ? 1 : 0} />
      <path d={`M 960 620 Q 1080 560 ${lerp(960, 1210, br)} ${lerp(620, 450, br)}`} fill="none"
        stroke={KRP.bronze} strokeWidth={18} strokeLinecap="round" opacity={br > 0 ? 1 : 0} />
      {/* 葉のかたまり */}
      <g opacity={1} transform={`translate(0 ${Math.sin(f / 16) * 4})`}>
        <ellipse cx={710} cy={400} rx={150 * pop(seg(f, 38, 52))} ry={100 * pop(seg(f, 38, 52))}
          fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
        <TagPlate x={710} y={400} text="知能検査" size={32} t={seg(f, 42, 52)} />
      </g>
      <g transform={`translate(0 ${Math.sin(f / 16 + 2) * 4})`}>
        <ellipse cx={1210} cy={400} rx={150 * pop(seg(f, 44, 56))} ry={100 * pop(seg(f, 44, 56))}
          fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
        <TagPlate x={1210} y={400} text="性格検査" size={32} t={seg(f, 48, 56)} />
      </g>
      <TagPlate x={960} y={770} text="第一次世界大戦" size={28} />
    </Shell>
  );
};

// #142 軍のもうひとつの悩み
const SceneArmyNayami: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={517} f={f} pill="アメリカ軍には、もうひとつの悩みが">
    <Ground y={830} />
    <Person x={620} y={830} f={f} helmet face="worried" gaze={[3, -4]}
      cloth={KRP.green} clothDark="#3C5644" />
    {/* 考えごとの泡 */}
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={760 + i * 56} cy={520 - i * 68} r={14 + i * 8}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5}
        opacity={seg(f, 8 + i * 8, 16 + i * 8)} />
    ))}
    <g transform={`translate(0 ${Math.sin(f / 15) * 5})`} opacity={seg(f, 30, 42)}>
      <ellipse cx={1180} cy={330} rx={250} ry={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <text x={1180} y={378} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={130} fill={KRP.grayDark}>?</text>
    </g>
    <TagPlate x={620} y={430} text="アメリカ軍" size={28} />
  </Shell>
);

// #143 砲撃と、ヒビの入った心
const SceneShellShock: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={518} f={f} dark wash={0.12} pill="砲撃で、心を病む兵士が続出した">
    {/* 遠くの砲撃の閃き (抑えた表現) */}
    {[0, 1].map((i) => {
      const flash = 0.35 + 0.3 * Math.max(0, Math.sin(f / 7 + i * 2.4));
      return (
        <polygon key={i}
          points={i === 0 ? "300,290 360,230 350,300 420,270 340,360 330,300"
            : "1620,250 1680,200 1668,264 1730,240 1655,320 1642,268"}
          fill={KRP.yellow} opacity={flash} stroke={KRP.ink} strokeWidth={3.5} />
      );
    })}
    <Ground y={840} />
    <Person x={660} y={840} f={f} helmet face="worried" gaze={[0, 4]} lean={-4}
      cloth={KRP.green} clothDark="#3C5644" />
    {/* ヒビの入った心 */}
    <g transform={`translate(1250 ${520 + Math.sin(f / 10) * 4})`}>
      <path d="M 0 90 C -110 10 -58 -66 0 -16 C 58 -66 110 10 0 90 Z"
        fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
      <polyline points="-6,-36 10,-6 -10,24 8,54" fill="none" stroke={KRP.white}
        strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"
        opacity={seg(f, 24, 36)} />
    </g>
  </Shell>
);

// #144 ウッドワースへの依頼
const SceneWoodworthIrai: React.FC<{ f: number }> = ({ f }) => {
  const move = easeOut(seg(f, 14, 44));
  return (
    <Shell seed={519} f={f} pill="心理学者ウッドワースに、開発を頼んだ">
      <Ground y={830} />
      <Person x={520} y={830} f={f} helmet face="normal" gaze={[5, 0]}
        cloth={KRP.green} clothDark="#3C5644" />
      <TagPlate x={520} y={430} text="軍" size={30} />
      <Person x={1400} y={830} f={f} glasses face="normal" gaze={[-5, 0]} phase={4}
        cloth={KRP.bronze} clothDark="#8E5A36" />
      <TagPlate x={1400} y={430} text="ウッドワース" size={30} />
      {/* お願いの書類がすべっていく */}
      <g transform={`translate(${lerp(680, 1210, move)} ${640 - Math.sin(move * Math.PI) * 90}) rotate(${move * 18 - 9})`}>
        <rect x={-70} y={-90} width={140} height={180} rx={8} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={5} />
        <line x1={-42} y1={-40} x2={42} y2={-40} stroke={KRP.grayDark} strokeWidth={4.5} />
        <line x1={-42} y1={0} x2={42} y2={0} stroke={KRP.grayDark} strokeWidth={4.5} />
        <line x1={-42} y1={40} x2={10} y2={40} stroke={KRP.grayDark} strokeWidth={4.5} />
      </g>
      <TagPlate x={960} y={320} text="開発のお願い" size={28} t={seg(f, 36, 48)} />
    </Shell>
  );
};

// #145 入隊前のふるい分け
const SceneScreening: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={520} f={f} pill="入隊前に、見つけ出す質問紙">
    <Ground y={830} />
    {/* 並ぶ人たち */}
    {[0, 1, 2, 3].map((i) => (
      <MiniFig key={i} x={330 + i * 150} y={790 + Math.sin(f / 11 + i) * 4} s={1.5}
        color={i % 2 ? KRP.blueSoft : KRP.gray} t={seg(f, 4 + i * 4, 12 + i * 4)} />
    ))}
    {/* 質問紙のゲート */}
    <rect x={980} y={430} width={22} height={400} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={1180} y={430} width={22} height={400} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={950} y={370} width={282} height={70} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
    <text x={1091} y={418} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={40} fill={KRP.ink}>質問紙</text>
    <Arrow x1={840} y1={700} x2={1300} y2={700} t={seg(f, 24, 42)} />
    {/* 入隊の旗 */}
    <line x1={1520} y1={830} x2={1520} y2={470} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
    <g transform={`skewY(${Math.sin(f / 12) * 2})`}>
      <polygon points="1520,470 1770,500 1520,560" fill={KRP.orange} stroke={KRP.ink} strokeWidth={5.5}
        strokeLinejoin="round" />
    </g>
    <TagPlate x={1600} y={640} text="入隊" size={32} t={seg(f, 40, 52)} />
  </Shell>
);

// #146 はい/いいえの質問紙 (どんどんチェックが入る)
const SceneQsheetCheck: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={521} f={f} pill="答えは、「はい」か「いいえ」">
    {/* うしろに重なる紙の山 (まだまだ続く感) */}
    <rect x={1210} y={300} width={430} height={500} rx={14} fill={KRP.white}
      stroke={KRP.ink} strokeWidth={5} opacity={0.75} transform="rotate(7 1425 550)" />
    <rect x={290} y={310} width={430} height={500} rx={14} fill={KRP.white}
      stroke={KRP.ink} strokeWidth={5} opacity={0.75} transform="rotate(-7 505 560)" />
    <QSheet x={960} y={560} s={1} f={f} />
  </Shell>
);

// #147 あらゆる性格診断のご先祖さま (家系図)
const SceneGosenzo: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={522} f={f} pill="今のあらゆる性格診断の、ご先祖さま">
    {/* ご先祖: 質問紙 */}
    <g transform={`translate(960 385) scale(0.42) translate(-960 -560)`}>
      <QSheet x={960} y={560} s={1} f={f} />
    </g>
    <TagPlate x={1270} y={310} text="世界初の性格検査" size={26} t={seg(f, 8, 20)} />
    {/* 家系図の線 */}
    <line x1={960} y1={490} x2={960} y2={550} stroke={KRP.ink} strokeWidth={6}
      opacity={seg(f, 16, 26)} />
    <line x1={620} y1={550} x2={1300} y2={550} stroke={KRP.ink} strokeWidth={6}
      opacity={seg(f, 20, 30)} />
    {[620, 960, 1300].map((x, i) => (
      <line key={i} x1={x} y1={550} x2={x} y2={610} stroke={KRP.ink} strokeWidth={6}
        opacity={seg(f, 24 + i * 2, 32 + i * 2)} />
    ))}
    {/* 子孫たち */}
    <InkCard x={620} y={750} s={0.85} t={seg(f, 30, 42)} />
    <FourTile x={960} y={750} s={1.15} t={seg(f, 36, 48)} />
    <BarsCard x={1300} y={750} s={0.85} t={seg(f, 42, 54)} f={f} />
  </Shell>
);

// #148 ところで、お気づきでしょうか (虫めがね)
const SceneOkizuki: React.FC<{ f: number }> = ({ f }) => {
  const mx = 760 + Math.cos(f / 18) * 70;
  const my = 540 + Math.sin(f / 13) * 60;
  return (
    <Shell seed={523} f={f} pill="ところで、お気づきでしょうか">
      <QSheet x={720} y={580} s={0.92} f={f} />
      {/* 虫めがね */}
      <g transform={`translate(${mx} ${my})`}>
        <circle cx={0} cy={0} r={110} fill={KRP.blueSoft} opacity={0.35} />
        <circle cx={0} cy={0} r={110} fill="none" stroke={KRP.ink} strokeWidth={10} />
        <line x1={80} y1={80} x2={190} y2={190} stroke={KRP.ink} strokeWidth={20} strokeLinecap="round" />
      </g>
      {/* 大きな ? */}
      <g transform={`translate(1430 ${480 + Math.sin(f / 12) * 8}) scale(${pop(seg(f, 26, 40))})`}>
        <circle cx={0} cy={0} r={130} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6.5} />
        <text x={0} y={58} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={160} fill={KRP.ink}>?</text>
      </g>
    </Shell>
  );
};

// #149 書いているのは、本人
const SceneHonninKaku: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={524} f={f} pill="答えを書いているのは、本人">
    <Ground y={830} />
    <Person x={560} y={830} f={f} face="smile" gaze={[6, 2]} cloth={KRP.orange} clothDark="#8E5A36" />
    <TagPlate x={560} y={430} text="本人" size={32} t={seg(f, 30, 42)} />
    {/* 机と用紙とえんぴつ */}
    <rect x={960} y={700} width={520} height={26} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={1000} y={726} width={26} height={104} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <rect x={1410} y={726} width={26} height={104} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <g transform="rotate(-4 1220 630)">
      <rect x={1090} y={560} width={260} height={140} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <line x1={1120} y1={606} x2={1320} y2={606} stroke={KRP.grayDark} strokeWidth={4.5} />
      <line x1={1120} y1={646} x2={1260} y2={646} stroke={KRP.grayDark} strokeWidth={4.5} />
    </g>
    {/* えんぴつ (書く動き) */}
    <g transform={`translate(${1250 + Math.sin(f / 5) * 26} 560) rotate(40)`}>
      <rect x={-12} y={-90} width={24} height={90} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      <polygon points="-12,0 12,0 0,26" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    {/* 頭から用紙へ */}
    <path d="M 640 560 Q 900 400 1160 540" fill="none" stroke={KRP.blueDeep}
      strokeWidth={7} strokeDasharray="18 16" strokeDashoffset={-f * 2.2} opacity={0.85} />
    <polygon points="1180,556 1136,524 1126,562" fill={KRP.blueDeep} />
  </Shell>
);

// #150 神様でも頭の形でもなく、自分に聞く
const SceneJibunNiKiku: React.FC<{ f: number }> = ({ f }) => {
  const ok = easeOut(seg(f, 38, 54));
  return (
    <Shell seed={525} f={f} pill="自分のことは、自分に聞く">
      {/* 左: 神様 (抽象の光) */}
      <g transform="translate(430 480)">
        <circle cx={0} cy={0} r={54} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return (
            <line key={i} x1={Math.cos(a) * 70} y1={Math.sin(a) * 70}
              x2={Math.cos(a) * 100} y2={Math.sin(a) * 100}
              stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          );
        })}
      </g>
      <XMark x={430} y={480} s={1.1} f={f} start={10} w={13} />
      <TagPlate x={430} y={700} text="神様" size={28} />
      {/* 中: 頭の形 */}
      <g transform="translate(960 480)">
        <circle cx={0} cy={0} r={84} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M -60 -58 q 20 -26 50 -16 M -10 -80 q 30 -14 58 10 M 52 -46 q 24 10 26 40"
          fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      </g>
      <XMark x={960} y={480} s={1.1} f={f} start={22} w={13} />
      <TagPlate x={960} y={700} text="頭の形" size={28} />
      {/* 右: 自分 (手鏡をのぞく) */}
      <g transform={`translate(1480 ${500 + Math.sin(f / 13) * 4})`}>
        <circle cx={-66} cy={-40} r={46} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={-50} cy={-44} r={5} fill={KRP.ink} />
        <path d="M -120 86 Q -116 22 -66 22 Q -16 22 -12 86 Z" fill={KRP.orange}
          stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={74} cy={-30} r={52} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
        <path d="M 50 -52 Q 72 -66 94 -44" fill="none" stroke={KRP.white} strokeWidth={5}
          strokeLinecap="round" />
        <rect x={64} y={24} width={20} height={48} rx={9} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <circle cx={1480} cy={470} r={150 * ok} fill="none" stroke={KRP.green} strokeWidth={14}
        opacity={ok} />
      <TagPlate x={1480} y={700} text="自分" size={28} />
    </Shell>
  );
};

// #151 いちばん大きな乗り換え (路線図 count=4)
const SceneRouteMap4: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={526} f={f} pill="骨のヒビから、いちばん大きな乗り換え">
    <RouteMap x={960} y={540} s={1} f={f} count={4} />
  </Shell>
);

// #152 開発は順調 (チェックが並ぶ)
const SceneKaihatsuJunchou: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={527} f={f} pill="開発は、順調に進んだ">
    {[0, 1, 2].map((i) => {
      const t = seg(f, 10 + i * 12, 22 + i * 12);
      return (
        <g key={i}>
          <Doc x={560 + i * 400} y={560} s={0.95} lines={4} t={seg(f, 2 + i * 10, 12 + i * 10)} />
          <g transform={`translate(${560 + i * 400 + 110} 420) scale(${pop(t)})`}>
            <circle cx={0} cy={0} r={52} fill={KRP.green} stroke={KRP.ink} strokeWidth={5.5} />
            <polyline points="-24,2 -6,20 28,-18" fill="none" stroke={KRP.white}
              strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      );
    })}
    <Arrow x1={440} y1={820} x2={1500} y2={820} t={seg(f, 30, 50)} color={KRP.blueDeep} />
  </Shell>
);

// #153 完成! → 終戦 (笑いの山)
const SceneKanseiShusen: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={528} f={f} pill="完成したときには、戦争が終わっていた"
    overlay={f >= 42 ? <Stamp x={560} y={330} text="終戦" size={74} /> : undefined}>
    <Ground y={830} />
    <Person x={620} y={830} f={f} glasses face="surprised" gaze={[5, -2]}
      cloth={KRP.bronze} clothDark="#8E5A36" />
    <QSheet x={1240} y={580} s={0.8} f={f} />
    <TagPlate x={1240} y={310} text="完成!" size={40} t={seg(f, 14, 26)} />
    <Spark x={1510} y={330} t={seg(f, 20, 32)} />
    <Spark x={990} y={300} s={0.75} t={seg(f, 26, 38)} />
    {/* あせの飛沫 */}
    <g opacity={seg(f, 44, 52)} stroke={KRP.blueDeep} strokeWidth={6} strokeLinecap="round">
      <line x1={520} y1={540} x2={496} y2={510} />
      <line x1={540} y1={560} x2={520} y2={524} />
    </g>
  </Shell>
);

// #154 戦後、民間へ広まる
const SceneMinkanE: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={529} f={f} pill="戦後、民間へ広まっていった">
    <Ground y={840} />
    {/* 軍の木箱 */}
    <rect x={320} y={620} width={280} height={220} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
    <line x1={320} y1={700} x2={600} y2={700} stroke={KRP.ink} strokeWidth={4.5} />
    <text x={460} y={790} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={52} fill={KRP.ink}>軍</text>
    {/* 飛んでいく紙 */}
    {[0, 1, 2].map((i) => {
      const tt = easeOut(seg(f, 10 + i * 9, 48 + i * 4));
      const tx = [1180, 1420, 1650][i];
      const bx = (1 - tt) * (1 - tt) * 460 + 2 * (1 - tt) * tt * (700 + i * 140) + tt * tt * tx;
      const by = (1 - tt) * (1 - tt) * 620 + 2 * (1 - tt) * tt * (260 + i * 40) + tt * tt * 620;
      if (tt <= 0) return null;
      return (
        <g key={i} transform={`translate(${bx} ${by}) rotate(${tt * 30 - 15})`}>
          <rect x={-44} y={-56} width={88} height={112} rx={7} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={-26} y1={-22} x2={26} y2={-22} stroke={KRP.grayDark} strokeWidth={3.5} />
          <line x1={-26} y1={6} x2={26} y2={6} stroke={KRP.grayDark} strokeWidth={3.5} />
        </g>
      );
    })}
    {/* 民間の家なみ */}
    <HouseIcon x={1180} y={760} t={seg(f, 6, 18)} />
    <HouseIcon x={1420} y={750} s={1.15} color={KRP.yellow} t={seg(f, 12, 24)} />
    <HouseIcon x={1660} y={762} color={KRP.gray} t={seg(f, 18, 30)} />
  </Shell>
);

// #155 スイスのロールシャッハ
const SceneRorschach: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={530} f={f} pill="精神科医ロールシャッハの、変わった検査">
    {/* スイスの山なみ */}
    <polygon points="200,620 520,280 840,620" fill={KRP.gray} stroke={KRP.ink} strokeWidth={5.5} />
    <polygon points="430,375 520,280 610,375 560,400 520,375 475,405" fill={KRP.white}
      stroke={KRP.ink} strokeWidth={4.5} />
    <polygon points="700,620 1030,340 1360,620" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
    <polygon points="950,408 1030,340 1110,408 1065,430 1030,405 990,435" fill={KRP.white}
      stroke={KRP.ink} strokeWidth={4.5} />
    {/* スイス国旗 (正方形・赤地に白十字。国の表示として旗竿につける) */}
    <line x1={1536} y1={204} x2={1536} y2={830} stroke={KRP.grayDark} strokeWidth={10} strokeLinecap="round" />
    <circle cx={1536} cy={198} r={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
    <g transform="translate(1541 218)">
      <SwissFlag x={0} y={0} size={148} f={f} />
    </g>
    <TagPlate x={1616} y={420} text="スイス" size={28} />
    <Ground y={830} />
    <Person x={620} y={830} f={f} glasses face="normal" gaze={[5, 0]}
      cloth={KRP.blueSoft} clothDark="#46567A" />
    <TagPlate x={620} y={430} text="ロールシャッハ" size={28} t={seg(f, 10, 22)} />
    <InkCard x={1310} y={660} s={1.05} t={seg(f, 24, 38)} rot={-4} />
    <Spark x={1480} y={480} s={0.8} t={seg(f, 40, 50)} />
  </Shell>
);

// #156 インクを落として二つ折り (3コマ)
const SceneInkFold: React.FC<{ f: number }> = ({ f }) => {
  const drop = easeOut(seg(f, 6, 18));
  const splat = pop(seg(f, 16, 26));
  return (
    <Shell seed={531} f={f} pill="インクを落として、二つ折りにする">
      {/* 1: インクが落ちる */}
      <rect x={340} y={440} width={220} height={300} rx={8} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      <path d={`M 450 ${lerp(270, 560, drop)} q -14 -30 0 -44 q 14 14 0 44`}
        fill={KRP.ink} opacity={drop < 1 ? 1 : 0} />
      <ellipse cx={450} cy={580} rx={44 * splat} ry={30 * splat} fill={KRP.ink} />
      {/* 2: 二つ折り */}
      <g transform="translate(910 590)">
        <rect x={-110} y={-150} width={110} height={300} rx={8} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={-110 + 110 * (1 - Math.abs(Math.sin(f / 22)))} y={-150}
          width={110 * Math.max(0.12, Math.abs(Math.sin(f / 22)))} height={300} rx={8}
          fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-110} y1={-150} x2={-110} y2={150} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 60 -190 q 70 30 30 90" fill="none" stroke={KRP.grayDark} strokeWidth={6}
          strokeLinecap="round" strokeDasharray="14 12" />
        <polygon points="86,-92 106,-124 68,-128" fill={KRP.grayDark} />
      </g>
      {/* 3: 左右対称のしみ */}
      <InkCard x={1440} y={590} s={1.1} t={seg(f, 34, 48)} />
      <Arrow x1={600} y1={590} x2={740} y2={590} t={seg(f, 20, 32)} w={7} />
      <Arrow x1={1080} y1={590} x2={1250} y2={590} t={seg(f, 30, 42)} w={7} />
    </Shell>
  );
};

// #157 「何に見えますか?」
const SceneNaniNiMieru: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={532} f={f} pill="答えから、心の状態を探った">
    <Ground y={830} />
    <Person x={520} y={830} f={f} glasses face="smile" gaze={[6, 0]}
      cloth={KRP.blueSoft} clothDark="#46567A" />
    <Person x={1440} y={830} f={f} face="normal" gaze={[-6, 0]} phase={5}
      cloth={KRP.orange} clothDark="#8E5A36" />
    <g transform={`translate(0 ${Math.sin(f / 14) * 6})`}>
      <InkCard x={990} y={620} s={1.05} t={seg(f, 8, 20)} />
    </g>
    <Bubble x={720} y={340} w={580} h={130} t={seg(f, 24, 36)} text="何に見えますか?" size={44} />
    <g transform={`translate(1430 ${370 + Math.sin(f / 12) * 5}) scale(${pop(seg(f, 40, 52))})`}>
      <circle cx={0} cy={0} r={64} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={80} fill={KRP.grayDark}>?</text>
    </g>
  </Shell>
);

// #158 発表の翌年、若き死 (静かな画面)
const SceneWakakiShi: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={533} f={f} dark wash={0.12} pill="発表の翌年、若くしてこの世を去った">
    <Ground y={840} />
    {/* 机の上に残されたカード */}
    <rect x={700} y={660} width={520} height={26} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={740} y={686} width={26} height={154} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <rect x={1150} y={686} width={26} height={154} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <InkCard x={960} y={540} s={0.8} rot={-5} />
    {/* 空っぽの椅子 */}
    <g transform="translate(1420 700)">
      <rect x={-80} y={0} width={160} height={22} rx={7} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-80} y={-160} width={22} height={160} rx={7} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-66} y={22} width={18} height={118} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={48} y={22} width={18} height={118} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    {/* 舞い落ちる花びら */}
    {Array.from({ length: 6 }, (_, i) => {
      const u = ((f * 1.1 + i * 31) % 150) / 150;
      const px = 320 + i * 240 + Math.sin(f / 14 + i * 2) * 26;
      const py = 210 + u * 560;
      return (
        <ellipse key={i} cx={px} cy={py} rx={13} ry={8} fill={KRP.blueSoft}
          opacity={0.8 * (1 - u * 0.6)} transform={`rotate(${f * 2 + i * 50} ${px} ${py})`} />
      );
    })}
  </Shell>
);

// #159 しみは世界中で使われ続けた (地球儀 + カードの環)
const SceneShimiSekai: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={534} f={f} pill="残されたしみは、世界中で使われ続けた">
    <Globe cx={960} cy={580} r={220} lon0={f * 0.6} f={f} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const x = 960 + Math.cos(a) * 560;
      const y = 580 + Math.sin(a) * 248;
      return <InkCard key={i} x={x} y={y} s={0.34} rot={(i % 3 - 1) * 8}
        t={seg(f, 6 + i * 4, 14 + i * 4)} />;
    })}
  </Shell>
);

// #160 測るものは内側へ
const SceneUchigawaE: React.FC<{ f: number }> = ({ f }) => {
  const pulse = 1 + Math.sin(f / 11) * 0.04;
  return (
    <Shell seed={535} f={f} pill="測りたいものは、どんどん内側へ">
      <circle cx={960} cy={590} r={310} fill={KRP.blueSoft} opacity={0.4}
        stroke={KRP.ink} strokeWidth={6} />
      <TagPlate x={740} y={400} text="能力" size={30} />
      <g transform={`translate(960 590) scale(${pulse})`}>
        <circle cx={0} cy={0} r={150} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={54} fill={KRP.ink}>性格</text>
      </g>
      {/* 内側へ向かう矢印 */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
        const t = easeOut(seg(f, 12 + i * 8, 34 + i * 8));
        const x1 = 960 + Math.cos(a) * 430, y1 = 590 + Math.sin(a) * 400;
        const x2 = 960 + Math.cos(a) * 205, y2 = 590 + Math.sin(a) * 195;
        return <Arrow key={i} x1={x1} y1={y1} x2={x2} y2={y2} t={t} color={KRP.blueDeep} />;
      })}
    </Shell>
  );
};

// ===================================================================
// 第9章 (#161〜#185) 推理小説家、性格を16分割する (MBTI・エゴグラム)
// ===================================================================

// エゴグラムの5人の色 (2シーンで共通に使う)
const FIVE_COLORS = [KRP.red, KRP.orange, KRP.blueDeep, KRP.yellow, KRP.green];
const FIVE_NAMES = ["厳しい親", "優しい親", "冷静な大人", "自由な子", "気づかう子"];

// タイプライター (推理小説家の商売道具)
const Typewriter: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 紙 (打つたびに小きざみに上がる) */}
    <g transform={`translate(0 ${-Math.floor((f % 36) / 12) * 4})`}>
      <rect x={-110} y={-250} width={220} height={150} rx={6} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5} />
      <line x1={-80} y1={-212} x2={80} y2={-212} stroke={KRP.grayDark} strokeWidth={4} />
      <line x1={-80} y1={-178} x2={80} y2={-178} stroke={KRP.grayDark} strokeWidth={4} />
      <line x1={-80} y1={-144} x2={lerp(-80, 60, ((f * 2) % 34) / 34)} y2={-144}
        stroke={KRP.grayDark} strokeWidth={4} />
    </g>
    {/* ローラーと本体 */}
    <rect x={-150} y={-118} width={300} height={34} rx={16} fill={KRP.grayDark}
      stroke={KRP.ink} strokeWidth={5} />
    <path d="M -170 60 L -150 -84 L 150 -84 L 170 60 Z" fill={KRP.blueDeep}
      stroke={KRP.ink} strokeWidth={6} />
    {/* キー */}
    {[0, 1, 2].map((r) => (
      <g key={r}>
        {[0, 1, 2, 3, 4].map((c) => (
          <circle key={c} cx={-88 + c * 44 + r * 11} cy={-44 + r * 30} r={12}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5}
            transform={`translate(0 ${(f + r * 4 + c * 7) % 21 === 0 ? 3 : 0})`} />
        ))}
      </g>
    ))}
  </g>
);

// #161 第9章扉: タイプライターと4タイル
const SceneCh9Door: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={536} f={f}
    overlay={<ChapterTitle num={9} title="推理小説家、性格を16分割する。" t={easeOut(seg(f, 16, 36))} left={980} width={900} />}>
    <Ground y={840} />
    <Typewriter x={470} y={760} s={1.25} f={f} />
    <g transform={`rotate(${Math.sin(f / 16) * 4} 850 330)`}>
      <FourTile x={850} y={330} s={1.05} t={seg(f, 8, 22)} />
    </g>
    <Spark x={1020} y={210} s={0.8} t={seg(f, 26, 38)} />
  </Shell>
);

// #162 第二次世界大戦のころのアメリカで
const SceneMbtiBirth: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 14, 44));
  return (
    <Shell seed={537} f={f} pill="第二次世界大戦のころの、アメリカで生まれた">
      {/* 街なみ */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const hs = [200, 320, 260, 380, 230, 300];
        return (
          <rect key={i} x={240 + i * 250} y={840 - hs[i]} width={190} height={hs[i]}
            fill={i % 2 ? KRP.grayDark : KRP.gray} stroke={KRP.ink} strokeWidth={5.5} />
        );
      })}
      <Ground y={840} />
      {/* ビルの間からのぼる4タイル */}
      <g transform={`translate(960 ${lerp(760, 380, rise)})`}>
        <FourTile x={0} y={0} s={1.5} />
      </g>
      <Spark x={700} y={300} t={seg(f, 40, 50)} />
      <Spark x={1230} y={260} s={0.8} t={seg(f, 46, 56)} />
    </Shell>
  );
};

// #163 大学の研究室ではない
const SceneNotLab: React.FC<{ f: number }> = ({ f }) => {
  const ok = easeOut(seg(f, 38, 54));
  return (
    <Shell seed={538} f={f} pill="作ったのは、大学の研究室ではない">
      <Ground y={830} />
      {/* 大学の建物 */}
      <g>
        <rect x={330} y={790} width={480} height={40} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={400 + i * 140} y={570} width={62} height={220} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5.5} />
        ))}
        <rect x={350} y={530} width={440} height={40} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="330,530 810,530 570,420" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <XMark x={570} y={600} s={1.5} f={f} start={14} w={14} />
      <TagPlate x={570} y={880} text="大学の研究室" size={26} />
      {/* ふつうの家 */}
      <HouseIcon x={1350} y={740} s={1.7} color={KRP.yellow} t={seg(f, 24, 36)} />
      <circle cx={1350} cy={680} r={210 * ok} fill="none" stroke={KRP.green} strokeWidth={14} opacity={ok} />
      <TagPlate x={1350} y={880} text="ふつうの家" size={26} t={seg(f, 30, 42)} />
    </Shell>
  );
};

// #164 母キャサリンと娘イザベル
const SceneHahaMusume: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={539} f={f} pill="キャサリンとイザベル。母と娘">
    <Ground y={840} />
    <Katharine x={660} y={840} s={1.06} f={f} face="smile" gaze={[4, 0]} />
    <TagPlate x={660} y={430} text="母・キャサリン" size={28} t={seg(f, 10, 22)} />
    <Isabel x={1280} y={840} f={f} phase={6} face="smile" gaze={[-4, 0]} />
    <TagPlate x={1280} y={430} text="娘・イザベル" size={28} t={seg(f, 18, 30)} />
    {/* 間のハート */}
    <g transform={`translate(970 ${560 + Math.sin(f / 12) * 6}) scale(${pop(seg(f, 30, 44)) * 0.8})`}>
      <path d="M 0 60 C -74 6 -40 -44 0 -10 C 40 -44 74 6 0 60 Z"
        fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
    </g>
  </Shell>
);

// #165 心理学の専門教育は受けていない
const SceneNoSenmon: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={540} f={f} pill="ふたりとも、専門教育は受けていない">
    <Ground y={866} />
    {/* ふたり (見下ろす絵にはしない。落ち着いた表情で立っている) */}
    <Katharine x={250} y={866} s={0.78} f={f} face="normal" gaze={[5, 0]} />
    <Isabel x={1700} y={866} s={0.78} f={f} phase={5} face="normal" gaze={[-5, 0]} />
    {/* 角帽 */}
    <g transform={`translate(760 ${440 + Math.sin(f / 14) * 4})`}>
      <polygon points="-170,0 0,-70 170,0 0,70" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -90 34 L -90 110 Q 0 150 90 110 L 90 34" fill={KRP.grayDark}
        stroke={KRP.ink} strokeWidth={6} />
      <line x1={0} y1={0} x2={120} y2={30} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={126} cy={92} r={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={120} y1={30} x2={126} y2={80} stroke={KRP.yellow} strokeWidth={7} />
    </g>
    {/* 卒業証書 */}
    <g transform={`translate(1220 ${620 + Math.sin(f / 14 + 2) * 4}) rotate(18)`}>
      <rect x={-150} y={-44} width={300} height={88} rx={40} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-24} y={-50} width={48} height={100} rx={10} fill={KRP.red}
        stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    <XMark x={980} y={540} s={2.3} f={f} start={22} w={15} />
    <TagPlate x={960} y={840} text="心理学の専門教育" size={28} />
  </Shell>
);

// #166 娘の本業は推理小説家
const SceneSuiriSakka: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={541} f={f} pill="娘イザベルの本業は、推理小説家">
    <Ground y={830} />
    <Isabel x={520} y={830} s={1.05} f={f} face="smile" gaze={[6, 0]} />
    <TagPlate x={520} y={430} text="推理小説家" size={30} t={seg(f, 10, 22)} />
    {/* 机とタイプライター */}
    <rect x={900} y={700} width={560} height={26} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={940} y={726} width={26} height={104} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <rect x={1390} y={726} width={26} height={104} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <Typewriter x={1130} y={690} s={0.85} f={f} />
    {/* 積まれた本と虫めがね */}
    <rect x={1330} y={640} width={150} height={34} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={1344} y={606} width={130} height={34} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4.5} />
    <g transform={`translate(${1480 + Math.sin(f / 15) * 8} ${450 + Math.cos(f / 15) * 8})`}>
      <circle cx={0} cy={0} r={52} fill={KRP.blueSoft} opacity={0.4} />
      <circle cx={0} cy={0} r={52} fill="none" stroke={KRP.ink} strokeWidth={8} />
      <line x1={38} y1={38} x2={96} y2={96} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
    </g>
  </Shell>
);

// #167 懸賞コンテストで優勝
const SceneKenshoYusho: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={542} f={f} pill="懸賞コンテストで優勝した、売れっ子">
    {/* トロフィー */}
    <g transform={`translate(880 560) scale(${0.8 + 0.2 * pop(seg(f, 8, 24))})`}>
      <path d="M -120 -160 L 120 -160 L 96 -20 Q 60 60 0 60 Q -60 60 -96 -20 Z"
        fill={KRP.brass} stroke={KRP.ink} strokeWidth={6.5} />
      <path d="M -120 -140 Q -210 -110 -108 -36 M 120 -140 Q 210 -110 108 -36"
        fill="none" stroke={KRP.brass} strokeWidth={16} />
      <path d="M -120 -140 Q -210 -110 -108 -36 M 120 -140 Q 210 -110 108 -36"
        fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
      <rect x={-20} y={60} width={40} height={60} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-90} y={120} width={180} height={44} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
    </g>
    {/* 優勝のロゼット */}
    <g transform={`translate(1310 ${440 + Math.sin(f / 13) * 5}) scale(${pop(seg(f, 22, 36))})`}>
      <circle cx={0} cy={0} r={86} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={0} cy={0} r={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={42} fill={KRP.red}>優勝</text>
      <polygon points="-44,70 -20,150 2,96" fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
      <polygon points="44,70 20,150 -2,96" fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    {/* 売れっ子の本 */}
    <rect x={430} y={700} width={190} height={40} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
    <rect x={450} y={660} width={170} height={40} rx={6} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
    <rect x={440} y={620} width={176} height={40} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
    <Spark x={620} y={430} t={seg(f, 32, 44)} />
    <Spark x={1120} y={260} s={0.75} t={seg(f, 40, 52)} />
  </Shell>
);

// #168 母、ユングの本に夢中
const SceneJungBook: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={543} f={f} pill="母は、人間のタイプ分けに夢中になった">
    <Ground y={830} />
    <Katharine x={560} y={830} s={1.05} f={f} face="smile" gaze={[6, -3]} />
    {/* 開いた本 */}
    <g transform={`translate(1060 ${640 + Math.sin(f / 15) * 5})`}>
      <path d="M 0 -10 Q -130 -60 -250 -16 L -250 120 Q -130 76 0 126 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 0 -10 Q 130 -60 250 -16 L 250 120 Q 130 76 0 126 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={-200} y1={22 + i * 32} x2={-56} y2={14 + i * 32}
            stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" />
          <line x1={56} y1={14 + i * 32} x2={200} y2={22 + i * 32}
            stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" />
        </g>
      ))}
    </g>
    <TagPlate x={1060} y={420} text="ユングの本" size={30} t={seg(f, 8, 20)} />
    {/* 浮かぶタイプのかけら */}
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${1380 + (i % 2) * 150} ${330 + Math.floor(i / 2) * 150 + Math.sin(f / 12 + i) * 8})`}>
        <rect x={-44} y={-44} width={88} height={88} rx={12}
          fill={[KRP.blueSoft, KRP.yellow, KRP.green, KRP.orange][i]}
          stroke={KRP.ink} strokeWidth={4.5}
          transform={`scale(${pop(seg(f, 22 + i * 7, 34 + i * 7))})`} />
      </g>
    ))}
  </Shell>
);

// #169 本 → 誰でも答えられる質問紙
const SceneBookToSheet: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={544} f={f} pill="娘がそれを、質問紙に仕立てた">
    <Ground y={856} />
    {/* 閉じた本 */}
    <g transform={`translate(400 ${560 + Math.sin(f / 15) * 5}) rotate(-6)`}>
      <rect x={-140} y={-190} width={280} height={380} rx={10} fill={KRP.blueDeep}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={-140} y={-190} width={44} height={380} rx={10} fill={KRP.ink} opacity={0.35} />
      <rect x={-60} y={-110} width={160} height={80} rx={8} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={4.5} />
      <text x={20} y={-58} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={40} fill={KRP.ink}>ユング</text>
    </g>
    <Arrow x1={610} y1={460} x2={880} y2={430} t={seg(f, 14, 30)} />
    {/* 仕立てる娘イザベル (ペンを持つ) */}
    <Isabel x={820} y={856} s={0.84} f={f} face="smile" gaze={[6, -2]} />
    <g transform={`translate(${890} ${748 + Math.sin(f / 11) * 4}) rotate(26)`}>
      <rect x={-7} y={-52} width={14} height={92} rx={5} fill={KRP.bronze}
        stroke={KRP.ink} strokeWidth={4} />
      <polygon points="-7,40 7,40 0,62" fill={KRP.ink} />
      <rect x={-8} y={-58} width={16} height={12} rx={4} fill={KRP.brass}
        stroke={KRP.ink} strokeWidth={3} />
    </g>
    {/* 質問紙がぽん */}
    <g transform={`translate(1400 560) scale(${pop(seg(f, 26, 42))}) translate(-1400 -560)`}>
      <QSheet x={1400} y={560} s={0.78} f={f} />
    </g>
  </Shell>
);

// #170 働く女性の仕事さがしの手助けに
const SceneJoseiShigoto: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={545} f={f} pill="働く女性が、合う仕事を見つけるために">
    {[0, 1, 2].map((i) => {
      const y = 400 + i * 190;
      const cols = [KRP.orange, KRP.green, KRP.blueDeep];
      return (
        <g key={i}>
          {/* 働く女性の話なので、女性とわかるシルエット (MiniFigLady) にする */}
          <MiniFigLady x={470} y={y + 50 + Math.sin(f / 12 + i) * 4} s={1.6} color={cols[i]}
            t={seg(f, 4 + i * 6, 12 + i * 6)} />
          <Arrow x1={600} y1={y} x2={1180} y2={y} t={seg(f, 16 + i * 8, 34 + i * 8)}
            color={KRP.grayDark} w={7} />
        </g>
      );
    })}
    {/* 合う仕事のアイコン: 歯車 / 書類 / スパナ */}
    <g transform={`translate(1380 400) rotate(${f * 1.2})`} opacity={seg(f, 28, 38) > 0 ? 1 : 0}>
      <circle cx={0} cy={0} r={52} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return (
          <rect key={k} x={-11} y={-78} width={22} height={28} rx={5} fill={KRP.gray}
            stroke={KRP.ink} strokeWidth={4} transform={`rotate(${(a * 180) / Math.PI})`} />
        );
      })}
      <circle cx={0} cy={0} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    <Doc x={1380} y={590} s={0.52} lines={4} t={seg(f, 36, 46)} />
    <g transform={`translate(1380 780) rotate(-30) scale(${pop(seg(f, 44, 54))})`}>
      <rect x={-10} y={-50} width={20} height={110} rx={9} fill={KRP.grayDark}
        stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={0} cy={-62} r={28} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={0} cy={-70} r={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
    </g>
    <TagPlate x={1380} y={280} text="合う仕事" size={28} t={seg(f, 24, 34)} />
  </Shell>
);

// #171 それがMBTIの始まり
const SceneMbtiStart: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={546} f={f} pill="それが、MBTIの始まり">
    <g transform={`translate(960 470) scale(${pop(seg(f, 8, 26))})`}>
      <rect x={-330} y={-105} width={660} height={210} rx={18} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={8} />
      <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={120} fill={KRP.blueDeep} letterSpacing={10}>MBTI</text>
    </g>
    <FourTile x={960} y={770} s={0.8} t={seg(f, 28, 42)} />
    <Spark x={550} y={320} t={seg(f, 30, 42)} />
    <Spark x={1380} y={300} s={0.8} t={seg(f, 36, 48)} />
    <Spark x={1300} y={700} s={0.65} t={seg(f, 44, 54)} />
  </Shell>
);

// #172 軸の組み合わせでタイプに分ける
const SceneFourAxes: React.FC<{ f: number }> = ({ f }) => {
  const pairs = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
  const tileCols = [KRP.blueSoft, KRP.yellow, KRP.green, KRP.orange];
  return (
    <Shell seed={547} f={f} pill="軸の組み合わせで、タイプに分ける">
      {pairs.map((p, i) => {
        const y = 340 + i * 150;
        const knob = 560 + Math.sin(f / 13 + i * 1.7) * 150;
        return (
          <g key={i} opacity={seg(f, 4 + i * 5, 12 + i * 5) > 0 ? 1 : 0}>
            <line x1={400} y1={y} x2={720} y2={y} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
            <circle cx={360} cy={y} r={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <text x={360} y={y + 15} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={42} fill={KRP.ink}>{p[0]}</text>
            <circle cx={760} cy={y} r={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <text x={760} y={y + 15} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={42} fill={KRP.ink}>{p[1]}</text>
            <circle cx={knob} cy={y} r={24} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          </g>
        );
      })}
      <Arrow x1={860} y1={560} x2={1050} y2={560} t={seg(f, 20, 34)} />
      {/* タイプのマス目 */}
      {Array.from({ length: 16 }, (_, i) => {
        const cx = 1140 + (i % 4) * 120;
        const cy = 390 + Math.floor(i / 4) * 120;
        return (
          <rect key={i} x={cx - 48} y={cy - 48} width={96} height={96} rx={10}
            fill={tileCols[(i + Math.floor(i / 4)) % 4]} stroke={KRP.ink} strokeWidth={4.5}
            transform={`translate(${cx} ${cy}) scale(${pop(seg(f, 22 + i * 2, 30 + i * 2))}) translate(${-cx} ${-cy})`} />
        );
      })}
    </Shell>
  );
};

// #173 心理学の研究報告
const SceneKenkyuHokoku: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={548} f={f} pill="心理学の研究では、こんな報告も">
    <Ground y={830} />
    <Person x={1420} y={830} f={f} glasses face="normal" gaze={[-6, -2]}
      cloth={KRP.grayDark} clothDark="#5E666E" />
    <Doc x={700} y={560} s={1.25} title="研究報告" lines={5} t={seg(f, 6, 18)} />
    <g transform={`translate(${880 + Math.cos(f / 16) * 40} ${600 + Math.sin(f / 16) * 40})`}>
      <circle cx={0} cy={0} r={74} fill={KRP.blueSoft} opacity={0.35} />
      <circle cx={0} cy={0} r={74} fill="none" stroke={KRP.ink} strokeWidth={9} />
      <line x1={54} y1={54} x2={130} y2={130} stroke={KRP.ink} strokeWidth={17} strokeLinecap="round" />
    </g>
  </Shell>
);

// #174 数週間後、約半数が別のタイプに
const SceneHanbunKawaru: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={549} f={f} pill="数週間後、約半数が別のタイプに">
    {/* カレンダーがめくれる */}
    <g transform="translate(960 330)">
      <rect x={-110} y={-80} width={220} height={170} rx={12} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-110} y={-80} width={220} height={46} rx={12} fill={KRP.red}
        stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={-56} cy={-80} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={56} cy={-80} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {/* めくれる1枚 */}
      {/* めくれた紙は上の字幕ピルに重なるので、めくれ切ったら消える */}
      <g transform={`rotate(${-easeOut(seg(f, 14, 34)) * 150} -110 -34)`}
        opacity={0.95 * (1 - seg(f, 34, 46))}>
        <rect x={-110} y={-34} width={220} height={124} rx={10} fill={KRP.blueSoft}
          stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <line x1={-70} y1={10} x2={70} y2={10} stroke={KRP.grayDark} strokeWidth={4.5} />
      <line x1={-70} y1={48} x2={40} y2={48} stroke={KRP.grayDark} strokeWidth={4.5} />
    </g>
    <TagPlate x={960} y={510} text="数週間後" size={28} t={seg(f, 28, 40)} />
    {/* 6人のタイプ札。半分が別の色に変わる */}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = 430 + i * 212;
      const sw = i % 2 === 1;
      const swt = pop(seg(f, 36 + i * 3, 46 + i * 3));
      return (
        <g key={i}>
          <MiniFig x={x} y={800 + Math.sin(f / 12 + i) * 3} s={1.35}
            color={KRP.gray} t={seg(f, 2 + i * 3, 10 + i * 3)} />
          <rect x={x - 40} y={590} width={80} height={80} rx={10}
            fill={sw && swt > 0.5 ? KRP.orange : KRP.blueSoft}
            stroke={KRP.ink} strokeWidth={4.5}
            transform={sw ? `translate(${x} 630) scale(${1 + Math.sin(Math.PI * clamp01(swt)) * 0.25}) translate(${-x} -630)` : undefined} />
        </g>
      );
    })}
  </Shell>
);

// #175 公式MBTIとネットの無料診断は別物
const SceneBetsumono: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={550} f={f} pill="ネットの無料診断は、公式とは別物">
    {/* 公式 */}
    <g transform={`translate(520 580) scale(${pop(seg(f, 6, 20))})`}>
      <rect x={-210} y={-230} width={420} height={460} rx={16} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={6.5} />
      <text x={0} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={46} fill={KRP.ink}>公式MBTI</text>
      <line x1={-150} y1={-106} x2={150} y2={-106} stroke={KRP.ink} strokeWidth={4} />
      <FourTile x={0} y={40} s={1} />
      <line x1={-140} y1={176} x2={140} y2={176} stroke={KRP.grayDark} strokeWidth={5} opacity={0.75} />
    </g>
    {/* ネットの無料診断 */}
    <g transform={`translate(1400 580) scale(${pop(seg(f, 14, 28))})`}>
      <rect x={-210} y={-230} width={420} height={460} rx={16} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={6.5} />
      <text x={0} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={42} fill={KRP.ink}>ネットの無料診断</text>
      <line x1={-150} y1={-106} x2={150} y2={-106} stroke={KRP.ink} strokeWidth={4} />
      {/* 画面とカーソル */}
      <rect x={-130} y={-60} width={260} height={180} rx={10} fill={KRP.blueSoft}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={-96} y={-20} width={192} height={34} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-96} y={30} width={192} height={34} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      <polygon points="0,0 0,46 13,34 24,56 36,50 25,28 42,26"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5}
        transform={`translate(${60 + Math.sin(f / 14) * 16} ${40 + Math.cos(f / 14) * 10})`} />
      <line x1={-140} y1={176} x2={140} y2={176} stroke={KRP.grayDark} strokeWidth={5} opacity={0.75} />
    </g>
    {/* ≠ */}
    <g opacity={seg(f, 30, 42)} stroke={KRP.red} strokeWidth={13} strokeLinecap="round">
      <line x1={880} y1={540} x2={1040} y2={540} />
      <line x1={880} y1={620} x2={1040} y2={620} />
      <line x1={1010} y1={470} x2={910} y2={690} />
    </g>
  </Shell>
);

// #176 心理学の本流から生まれた検査
// 「本流から生まれた」= きちんとした手続きを通ってきた、を一本の流れで見せる。
//   大学・研究室 → データで確かめる → ほかの研究者も確かめる → 性格検査
// 人を格づけする絵・信じている人をからかう絵にはしない (中立に「手続きが違う」だけを言う)。
// 数字は出さない。縦は 300〜846 におさめて、上の帯 (y<160) と下の字幕帯 (y>854) を避ける。
const SceneHonryu: React.FC<{ f: number }> = ({ f }) => {
  const CY = 450; // 4つの節の中心の高さ
  const XS = [280, 740, 1200, 1660];
  const nodeT = (i: number) => seg(f, 4 + i * 17, 18 + i * 17);
  const tagT = (i: number) => seg(f, 11 + i * 17, 25 + i * 17);
  const arrowT = (i: number) => seg(f, 17 + i * 17, 31 + i * 17);
  const barH = [74, 100, 58, 118];
  const okT = (i: number) => pop(seg(f, 46 + i * 6, 60 + i * 6)); // 確認のチェック
  return (
    <Shell seed={551} f={f} pill="本流から生まれた性格検査も、ある">
      {/* 下を流れる「心理学の本流」。手続きが一本につながっていることの土台 */}
      <path d="M 110 744 Q 960 784 1810 744 L 1810 802 Q 960 842 110 802 Z"
        fill={KRP.blue} stroke={KRP.ink} strokeWidth={5.5} opacity={0.85} />
      {[0, 1].map((i) => (
        <path key={i} d={`M 170 ${768 + i * 20} Q 960 ${808 + i * 20} 1750 ${768 + i * 20}`}
          fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round"
          strokeDasharray="44 36" strokeDashoffset={-f * 4} opacity={0.7} />
      ))}
      <TagPlate x={300} y={773} text="心理学の本流" size={28} />

      {/* 節をつなぐ矢印 */}
      <Arrow x1={425} y1={CY} x2={600} y2={CY} t={arrowT(0)} w={8} />
      <Arrow x1={885} y1={CY} x2={1060} y2={CY} t={arrowT(1)} w={8} />
      <Arrow x1={1345} y1={CY} x2={1520} y2={CY} t={arrowT(2)} w={8} />

      {/* ① 大学の研究室 (#163 と同じ建物。あちらは赤バツ、こちらは「ここから出てきた」) */}
      <g transform={`translate(${XS[0]} ${CY}) scale(${0.52 * pop(clamp01(nodeT(0)))})`}>
        <rect x={-240} y={165} width={480} height={40} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        {[-170, -30, 110].map((cx) => (
          <rect key={cx} x={cx} y={-55} width={62} height={220} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5.5} />
        ))}
        <rect x={-220} y={-95} width={440} height={40} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="-240,-95 240,-95 0,-205" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <TagPlate x={XS[0]} y={650} text="大学・研究室" size={26} t={tagT(0)} />

      {/* ② データを集めて確かめる (紙の積み重ね + 棒グラフ。棒は同じ色 = 順位づけではない) */}
      <g transform={`translate(${XS[1]} ${CY}) scale(${pop(clamp01(nodeT(1)))})`}>
        <rect x={-96} y={-124} width={210} height={176} rx={10} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={5} transform="rotate(-7 0 0)" />
        <rect x={-108} y={-112} width={210} height={176} rx={10} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={5} transform="rotate(4 0 0)" />
        <rect x={-120} y={-100} width={240} height={200} rx={12} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={6} />
        <line x1={-90} y1={64} x2={90} y2={64} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        {barH.map((h, i) => {
          const g = easeOut(seg(f, 24 + i * 5, 40 + i * 5)) * h;
          return (
            <rect key={i} x={-84 + i * 44} y={64 - g} width={34} height={g} rx={4}
              fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} opacity={g > 2 ? 1 : 0} />
          );
        })}
      </g>
      <TagPlate x={XS[1]} y={650} text="データで確かめる" size={26} t={tagT(1)} />

      {/* ③ ほかの研究者も確かめる (同じ紙を別の人がもう一度しらべる) */}
      <g transform={`translate(${XS[2]} ${CY}) scale(${pop(clamp01(nodeT(2)))})`}>
        <rect x={-64} y={-128} width={128} height={156} rx={8} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={-40} y1={-88 + i * 34} x2={i === 2 ? 4 : 40} y2={-88 + i * 34}
            stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" />
        ))}
        {/* 虫めがね (ゆっくり動いて「調べている」感じ) */}
        <g transform={`translate(${62 + Math.cos(f / 17) * 16} ${-46 + Math.sin(f / 17) * 16})`}>
          <circle cx={0} cy={0} r={44} fill={KRP.blueSoft} opacity={0.35} />
          <circle cx={0} cy={0} r={44} fill="none" stroke={KRP.ink} strokeWidth={8} />
          <line x1={32} y1={32} x2={74} y2={74} stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
        </g>
        {/* 別々の研究者が、順にチェックしていく */}
        {[KRP.blueSoft, KRP.gray, KRP.green].map((c, i) => (
          <g key={i}>
            <MiniFig x={-92 + i * 92} y={112} s={1.05} color={c} t={seg(f, 36 + i * 6, 48 + i * 6)} />
            <g transform={`translate(${-62 + i * 92} 44) scale(${okT(i) * 0.5})`} opacity={okT(i)}>
              <path d="M -46 2 L -10 40 L 50 -40" fill="none" stroke={KRP.green}
                strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        ))}
      </g>
      <TagPlate x={XS[2]} y={650} text="ほかの研究者も確かめる" size={26} t={tagT(2)} />

      {/* ④ そうして生まれた性格検査 */}
      <g transform={`translate(${XS[3]} ${CY}) scale(${pop(clamp01(nodeT(3)))})`}>
        <rect x={-128} y={-150} width={256} height={300} rx={14} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={-82} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={36} fill={KRP.ink}>性格検査</text>
        <line x1={-96} y1={-56} x2={96} y2={-56} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M -98 ${-6 + i * 44} q 22 -7 44 0 t 44 0 t 44 0`} fill="none"
              stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" opacity={0.85} />
            <rect x={66} y={-22 + i * 44} width={30} height={30} rx={6} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
      <Spark x={1800} y={318} s={1.1} t={seg(f, 60, 74)} />
      <Spark x={1522} y={596} s={0.85} t={seg(f, 66, 80)} />
      {/* カードの中に「性格検査」と書いてあるので、下の札は手順の名前にする */}
      <TagPlate x={XS[3]} y={650} text="こうして生まれた" size={26} t={tagT(3)} />
    </Shell>
  );
};

// #177 たとえば、エゴグラム
const SceneEgogramIntro: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={552} f={f} pill="たとえば、エゴグラム">
    <g transform={`translate(960 400) scale(${pop(seg(f, 8, 24))})`}>
      <rect x={-360} y={-95} width={720} height={190} rx={18} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={8} />
      <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={96} fill={KRP.ink}>エゴグラム</text>
    </g>
    {/* 下に小さな棒グラフの予告 */}
    {FIVE_COLORS.map((c, i) => {
      const h = [120, 70, 100, 130, 80][i] * easeOut(seg(f, 26 + i * 5, 40 + i * 5));
      return (
        <rect key={i} x={740 + i * 95} y={820 - h} width={64} height={h} rx={6}
          fill={c} stroke={KRP.ink} strokeWidth={4.5} />
      );
    })}
    <line x1={710} y1={820} x2={1230} y2={820} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
  </Shell>
);

// #178 バーンの理論を弟子のデュセイが考案
const SceneBerneDusay: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={553} f={f} pill="バーンの理論をもとに、弟子が考案">
    <Ground y={830} />
    <Person x={450} y={830} f={f} glasses face="normal" gaze={[5, 0]}
      cloth={KRP.grayDark} clothDark="#5E666E" />
    <TagPlate x={450} y={430} text="精神科医バーン" size={26} t={seg(f, 6, 18)} />
    {/* 理論の本 */}
    <g transform={`translate(950 ${600 + Math.sin(f / 14) * 5}) scale(${pop(seg(f, 14, 28))})`}>
      <rect x={-120} y={-160} width={240} height={320} rx={10} fill={KRP.green}
        stroke={KRP.ink} strokeWidth={6} />
      <rect x={-120} y={-160} width={36} height={320} rx={10} fill={KRP.ink} opacity={0.35} />
      <rect x={-64} y={-92} width={150} height={120} rx={8} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={4.5} />
      <text x={11} y={-46} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={36} fill={KRP.ink}>交流</text>
      <text x={11} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={36} fill={KRP.ink}>分析</text>
    </g>
    <Arrow x1={610} y1={600} x2={790} y2={600} t={seg(f, 22, 34)} w={7} />
    <Arrow x1={1110} y1={600} x2={1290} y2={600} t={seg(f, 30, 42)} w={7} />
    <Person x={1470} y={830} f={f} face="smile" gaze={[-5, 0]} phase={4}
      cloth={KRP.blueDeep} clothDark="#35598C" />
    <TagPlate x={1470} y={430} text="弟子・デュセイ" size={26} t={seg(f, 38, 50)} />
  </Shell>
);

// #179 心の中に、自分たちが住んでいる
const SceneFiveInKokoro: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={554} f={f} pill="心の中に、自分たちが住んでいる">
    {/* 大きな頭のシルエット */}
    <circle cx={960} cy={560} r={300} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} opacity={0.95} />
    <path d="M 860 858 L 860 880 M 1060 858 L 1060 880" stroke={KRP.ink} strokeWidth={7}
      strokeLinecap="round" />
    {/* 中に住む5人 */}
    {FIVE_COLORS.map((c, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = 960 + Math.cos(a) * 160;
      const y = 590 + Math.sin(a) * 150;
      return (
        <MiniFig key={i} x={x} y={y + Math.sin(f / 11 + i * 1.4) * 6} s={1.5} color={c}
          t={seg(f, 8 + i * 7, 18 + i * 7)} />
      );
    })}
  </Shell>
);

// #180 厳しい親・優しい親・冷静な大人・自由な子・気をつかう子
const SceneFiveJibun: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={555} f={f} pill="心に住む、それぞれの自分">
    {FIVE_COLORS.map((c, i) => {
      const x = 400 + i * 280;
      return (
        <g key={i}>
          <MiniFig x={x} y={600 + Math.sin(f / 11 + i) * 5} s={2.2} color={c}
            t={seg(f, 6 + i * 7, 16 + i * 7)} />
          <TagPlate x={x} y={730} text={FIVE_NAMES[i]} size={26} t={seg(f, 12 + i * 7, 22 + i * 7)} />
        </g>
      );
    })}
  </Shell>
);

// #181 5人の元気さを棒グラフに
const SceneEgogramGraph: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={556} f={f} pill="それぞれの元気さを、棒グラフに">
    {/* 軸 */}
    <line x1={470} y1={790} x2={1520} y2={790} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
    <line x1={470} y1={790} x2={470} y2={310} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={454} y1={740 - i * 100} x2={486} y2={740 - i * 100}
        stroke={KRP.ink} strokeWidth={5} />
    ))}
    <text x={408} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={34} fill={KRP.ink}>高</text>
    <text x={408} y={790} textAnchor="middle" fontFamily={FONT} fontWeight={900}
      fontSize={34} fill={KRP.ink}>低</text>
    <TagPlate x={470} y={258} text="元気さ" size={26} />
    {/* 5本の棒 */}
    {FIVE_COLORS.map((c, i) => {
      const hmax = [380, 210, 300, 430, 250][i];
      const h = hmax * easeOut(seg(f, 8 + i * 7, 30 + i * 7));
      const x = 560 + i * 195;
      return (
        <g key={i}>
          <rect x={x - 55} y={790 - h} width={110} height={h} rx={8}
            fill={c} stroke={KRP.ink} strokeWidth={5} />
          <text x={x} y={848} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={25} fill={KRP.ink}>{FIVE_NAMES[i]}</text>
        </g>
      );
    })}
  </Shell>
);

// #182 東大式エゴグラム、心療内科で現役
const SceneTodaiGenneki: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={557} f={f} pill="日本の心療内科などで、いまも現役"
    overlay={f >= 40 ? <Stamp x={1290} y={690} text="現役" size={56} /> : undefined}>
    <Ground y={830} />
    {/* 心療内科の建物 */}
    <rect x={360} y={430} width={420} height={400} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
    <rect x={340} y={390} width={460} height={50} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={520} y={690} width={110} height={140} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
    {[0, 1].map((i) => (
      <rect key={i} x={410 + i * 240} y={500} width={90} height={90} fill={KRP.blueSoft}
        stroke={KRP.ink} strokeWidth={5} />
    ))}
    <g transform={`translate(0 ${Math.sin(f / 16) * 3})`}>
      <rect x={430} y={300} width={280} height={66} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <text x={570} y={346} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={40} fill={KRP.blueDeep}>心療内科</text>
    </g>
    {/* 東大式エゴグラムの用紙 */}
    <g transform={`translate(1240 590) scale(${pop(seg(f, 12, 26))})`}>
      <rect x={-200} y={-230} width={400} height={460} rx={12} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={6} />
      <text x={0} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={42} fill={KRP.ink}>東大式</text>
      <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={42} fill={KRP.ink}>エゴグラム</text>
      <line x1={-140} y1={-64} x2={140} y2={-64} stroke={KRP.ink} strokeWidth={4} />
      {FIVE_COLORS.map((c, i) => {
        const h = [120, 66, 95, 136, 79][i] * (0.8 + 0.2 * Math.sin(f / 16 + i));
        return (
          <rect key={i} x={-130 + i * 56} y={160 - h} width={38} height={h} rx={5}
            fill={c} stroke={KRP.ink} strokeWidth={3.5} />
        );
      })}
      <line x1={-140} y1={160} x2={140} y2={160} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  </Shell>
);

// #183 娯楽寄りから医療寄りまで、幅がある
const SceneHabaSpectrum: React.FC<{ f: number }> = ({ f }) => {
  const segs = [KRP.yellow, KRP.yellow, KRP.green, KRP.green, KRP.blue, KRP.blueDeep];
  const grow = easeOut(seg(f, 8, 30));
  return (
    <Shell seed={558} f={f} pill="性格を測る道具にも、幅がある">
      {/* 帯 (段階的な色分け) */}
      {segs.map((c, i) => (
        <rect key={i} x={430 + i * 177} y={530} width={177 * grow} height={70}
          fill={c} stroke={KRP.ink} strokeWidth={4.5} />
      ))}
      {/* 両向きの矢印 */}
      <polygon points="380,565 448,522 448,608" fill={KRP.ink} opacity={grow} />
      <polygon points="1540,565 1472,522 1472,608" fill={KRP.ink} opacity={grow} />
      <TagPlate x={520} y={420} text="娯楽寄り" size={30} t={seg(f, 24, 36)} />
      <TagPlate x={1400} y={420} text="医療寄り" size={30} t={seg(f, 30, 42)} />
      {/* 両端の代表 */}
      <FourTile x={520} y={740} s={0.75} t={seg(f, 34, 46)} />
      <BarsCard x={1400} y={740} s={0.62} t={seg(f, 40, 52)} f={f} />
      {/* 帯をすべるつまみ */}
      <circle cx={960 + Math.sin(f / 18) * 420} cy={565} r={26} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={5.5} opacity={grow} />
    </Shell>
  );
};

// #184 世界の自己紹介欄を埋めたのは、4文字のほう
const SceneYonMoji: React.FC<{ f: number }> = ({ f }) => (
  <Shell seed={559} f={f} pill="世界の自己紹介欄を埋めたのは、アルファベット">
    {/* プロフィールカード */}
    <g transform={`translate(960 560) scale(${pop(seg(f, 6, 20))})`}>
      <rect x={-390} y={-240} width={780} height={480} rx={20} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={7} />
      {/* アバター */}
      <circle cx={-240} cy={-90} r={86} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={-240} cy={-118} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -298 -40 Q -240 -88 -182 -40" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 名前の線 */}
      <line x1={-100} y1={-120} x2={300} y2={-120} stroke={KRP.grayDark} strokeWidth={7}
        strokeLinecap="round" opacity={0.8} />
      <line x1={-100} y1={-62} x2={180} y2={-62} stroke={KRP.grayDark} strokeWidth={7}
        strokeLinecap="round" opacity={0.8} />
      <line x1={-330} y1={30} x2={330} y2={30} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
    </g>
    {/* 4文字のタイル */}
    {["E", "N", "F", "P"].map((ch, i) => (
      <g key={i}
        transform={`translate(${790 + i * 115} ${690 + Math.sin(f / 12 + i) * 4}) scale(${pop(seg(f, 24 + i * 6, 34 + i * 6))})`}>
        <rect x={-48} y={-48} width={96} height={96} rx={12}
          fill={[KRP.blueSoft, KRP.yellow, KRP.green, KRP.orange][i]}
          stroke={KRP.ink} strokeWidth={5} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={60} fill={KRP.ink}>{ch}</text>
      </g>
    ))}
    <Spark x={1420} y={330} s={0.8} t={seg(f, 48, 56)} />
  </Shell>
);

// #185 「私は何者?」の答えが、ポケットサイズに
const ScenePocketSize: React.FC<{ f: number }> = ({ f }) => {
  const slide = easeOut(seg(f, 14, 44));
  return (
    <Shell seed={560} f={f} pill="「私は何者?」の答えが、ポケットサイズに">
      {/* シャツの胸もと */}
      <rect x={430} y={330} width={1060} height={510} rx={26} fill={KRP.blueSoft}
        stroke={KRP.ink} strokeWidth={7} />
      <line x1={960} y1={330} x2={960} y2={840} stroke={KRP.ink} strokeWidth={5} opacity={0.4} />
      {[0, 1].map((i) => (
        <circle key={i} cx={960} cy={480 + i * 180} r={16} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={4.5} />
      ))}
      {/* すべりこむカード (ポケットの奥なので先に描く) */}
      <g transform={`translate(660 ${lerp(300, 560, slide)}) rotate(${(1 - slide) * 10})`}>
        <rect x={-100} y={-70} width={200} height={140} rx={10} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={5} />
        <line x1={-64} y1={-28} x2={64} y2={-28} stroke={KRP.grayDark} strokeWidth={4.5} />
        <line x1={-64} y1={4} x2={30} y2={4} stroke={KRP.grayDark} strokeWidth={4.5} />
        <FourTile x={56} y={28} s={0.32} />
      </g>
      {/* ポケット (手前) */}
      <path d="M 500 560 L 530 780 Q 660 824 790 780 L 820 560 Z" fill={KRP.blue}
        stroke={KRP.ink} strokeWidth={6.5} />
      <line x1={500} y1={560} x2={820} y2={560} stroke={KRP.ink} strokeWidth={6.5} strokeLinecap="round" />
      <Spark x={900} y={420} t={seg(f, 46, 56)} />
      <Spark x={1240} y={520} s={0.7} t={seg(f, 50, 58)} />
    </Shell>
  );
};

// ===================================================================
// motif名 → シーンの対応表と、ブロック契約の export
// ===================================================================

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  // 第7章
  w3_ch7_door: (f) => <SceneCh7Door f={f} />,
  w3_data_misuse: (f) => <SceneDataMisuse f={f} />,
  w3_claim_dark: (f) => <SceneClaimDark f={f} />,
  w3_language_bias: (f) => <SceneLanguageBias f={f} />,
  w3_tailwind: (f) => <SceneTailwind f={f} />,
  w3_debate: (f) => <SceneDebate f={f} />,
  w3_kuuki_atooshi: (f) => <SceneKuukiAtooshi f={f} />,
  w3_yuseigaku: (f) => <SceneYuseigaku f={f} />,
  w3_sorting: (f) => <SceneSorting f={f} />,
  w3_gakusha_shiji: (f) => <SceneGakushaShiji f={f} />,
  w3_court1927: (f) => <SceneCourt1927 f={f} />,
  w3_70000: (f) => <Scene70000 f={f} />,
  w3_japan_law: (f) => <SceneJapanLaw f={f} />,
  w3_hikari: (f) => <SceneHikari f={f} />,
  w3_brigham: (f) => <SceneBrigham f={f} />,
  w3_tool_two_sides: (f) => <SceneToolTwoSides f={f} />,
  // 第8章
  w3_ch8_door: (f) => <SceneCh8Door f={f} />,
  w3_back_to_seikaku: (f) => <SceneBackToSeikaku f={f} />,
  w3_same_root: (f) => <SceneSameRoot f={f} />,
  w3_army_nayami: (f) => <SceneArmyNayami f={f} />,
  w3_shell_shock: (f) => <SceneShellShock f={f} />,
  w3_woodworth_irai: (f) => <SceneWoodworthIrai f={f} />,
  w3_screening: (f) => <SceneScreening f={f} />,
  w3_qsheet_check: (f) => <SceneQsheetCheck f={f} />,
  w3_gosenzo: (f) => <SceneGosenzo f={f} />,
  w3_okizuki: (f) => <SceneOkizuki f={f} />,
  w3_honnin_kaku: (f) => <SceneHonninKaku f={f} />,
  w3_jibun_ni_kiku: (f) => <SceneJibunNiKiku f={f} />,
  w3_routemap4: (f) => <SceneRouteMap4 f={f} />,
  w3_kaihatsu_junchou: (f) => <SceneKaihatsuJunchou f={f} />,
  w3_kansei_shusen: (f) => <SceneKanseiShusen f={f} />,
  w3_minkan_e: (f) => <SceneMinkanE f={f} />,
  w3_rorschach: (f) => <SceneRorschach f={f} />,
  w3_ink_fold: (f) => <SceneInkFold f={f} />,
  w3_nani_ni_mieru: (f) => <SceneNaniNiMieru f={f} />,
  w3_wakaki_shi: (f) => <SceneWakakiShi f={f} />,
  w3_shimi_sekai: (f) => <SceneShimiSekai f={f} />,
  w3_uchigawa_e: (f) => <SceneUchigawaE f={f} />,
  // 第9章
  w3_ch9_door: (f) => <SceneCh9Door f={f} />,
  w3_mbti_birth: (f) => <SceneMbtiBirth f={f} />,
  w3_not_lab: (f) => <SceneNotLab f={f} />,
  w3_haha_musume: (f) => <SceneHahaMusume f={f} />,
  w3_no_senmon: (f) => <SceneNoSenmon f={f} />,
  w3_suiri_sakka: (f) => <SceneSuiriSakka f={f} />,
  w3_kensho_yusho: (f) => <SceneKenshoYusho f={f} />,
  w3_jung_book: (f) => <SceneJungBook f={f} />,
  w3_book_to_sheet: (f) => <SceneBookToSheet f={f} />,
  w3_josei_shigoto: (f) => <SceneJoseiShigoto f={f} />,
  w3_mbti_start: (f) => <SceneMbtiStart f={f} />,
  w3_four_axes: (f) => <SceneFourAxes f={f} />,
  w3_kenkyu_hokoku: (f) => <SceneKenkyuHokoku f={f} />,
  w3_hanbun_kawaru: (f) => <SceneHanbunKawaru f={f} />,
  w3_betsumono: (f) => <SceneBetsumono f={f} />,
  w3_honryu: (f) => <SceneHonryu f={f} />,
  w3_egogram_intro: (f) => <SceneEgogramIntro f={f} />,
  w3_berne_dusay: (f) => <SceneBerneDusay f={f} />,
  w3_five_in_kokoro: (f) => <SceneFiveInKokoro f={f} />,
  w3_five_jibun: (f) => <SceneFiveJibun f={f} />,
  w3_egogram_graph: (f) => <SceneEgogramGraph f={f} />,
  w3_todai_genneki: (f) => <SceneTodaiGenneki f={f} />,
  w3_haba_spectrum: (f) => <SceneHabaSpectrum f={f} />,
  w3_yon_moji: (f) => <SceneYonMoji f={f} />,
  w3_pocket_size: (f) => <ScenePocketSize f={f} />,
};

export const watashiB3Scene = (motif: string, f: number): React.ReactElement | null => {
  const S = SCENES[motif];
  return S ? S(f) : null;
};

// 文#120〜#185 (66文) と絵の対応。順番どおり。
export const W_B3_MOTIFS: string[] = [
  "w3_ch7_door", // #120 第7章、道具は、使う人を選べない。
  "w3_data_misuse", // #121 陸軍テストのデータ、思わぬ使われ方
  "w3_claim_dark", // #122 「あの国から来る移民は、知能が低い」
  "w3_claim_dark", // #123 主張の根拠として引用された
  "w3_language_bias", // #124 成績は英語と文化の知識に左右
  "w3_language_bias", // #125 到着したばかりの移民に不利
  "w3_tailwind", // #126 締め出したい人たちの追い風に
  "w3_debate", // #127 立法への影響は今も議論
  "w3_kuuki_atooshi", // #128 時代の空気を後押し
  "w3_yuseigaku", // #129 優生学という考えが広がっていた
  "w3_sorting", // #130 増やす・減らすという思想
  "w3_gakusha_shiji", // #131 学者たちの多くも支持者
  "w3_court1927", // #132 1927年、最高裁「合憲」
  "w3_70000", // #133 約7万人
  "w3_japan_law", // #134 日本の優生保護法と違憲判断
  "w3_hikari", // #135 救いのある後日談
  "w3_brigham", // #136 ブリガム、自ら全面撤回
  "w3_brigham", // #137 「私の分析には、根拠がなかった」
  "w3_tool_two_sides", // #138 助ける道具は、切り捨てる道具にもなる
  "w3_ch8_door", // #139 第8章、完成したら、戦争が終わっていた。
  "w3_back_to_seikaku", // #140 「性格」の話に戻る
  "w3_same_root", // #141 性格検査も同じ大戦から
  "w3_army_nayami", // #142 軍のもうひとつの悩み
  "w3_shell_shock", // #143 砲撃で心を病む兵士が続出
  "w3_woodworth_irai", // #144 ウッドワースに開発を依頼
  "w3_screening", // #145 入隊前に見つけ出す質問紙
  "w3_qsheet_check", // #146 「はい」か「いいえ」の質問
  "w3_gosenzo", // #147 あらゆる性格診断のご先祖さま
  "w3_okizuki", // #148 ところで、お気づきでしょうか
  "w3_honnin_kaku", // #149 書いているのは、本人
  "w3_jibun_ni_kiku", // #150 自分のことは、自分に聞く
  "w3_routemap4", // #151 いちばん大きな乗り換え (路線図count=4)
  "w3_kaihatsu_junchou", // #152 開発は順調に進んだ
  "w3_kansei_shusen", // #153 完成したときには、戦争が終わっていた
  "w3_minkan_e", // #154 戦後、民間へ広まる
  "w3_rorschach", // #155 スイスのロールシャッハ
  "w3_ink_fold", // #156 インクを落として二つ折り
  "w3_nani_ni_mieru", // #157 「これが何に見えますか?」
  "w3_wakaki_shi", // #158 発表の翌年、若くして死去
  "w3_shimi_sekai", // #159 しみは世界中で使われ続けた
  "w3_uchigawa_e", // #160 測りたいものは内側へ
  "w3_ch9_door", // #161 第9章、推理小説家、性格を16分割する。
  "w3_mbti_birth", // #162 第二次世界大戦のころのアメリカで
  "w3_not_lab", // #163 大学の研究室ではない
  "w3_haha_musume", // #164 キャサリンとイザベル。母と娘
  "w3_no_senmon", // #165 専門教育は受けていない
  "w3_suiri_sakka", // #166 娘の本業は推理小説家
  "w3_kensho_yusho", // #167 懸賞コンテストで優勝
  "w3_jung_book", // #168 母はユングの本に夢中
  "w3_book_to_sheet", // #169 娘が質問紙に仕立てた
  "w3_josei_shigoto", // #170 働く女性の仕事さがしの手助けに
  "w3_mbti_start", // #171 それが、MBTIの始まり
  "w3_four_axes", // #172 軸の組み合わせでタイプに分ける
  "w3_kenkyu_hokoku", // #173 心理学の研究ではこんな報告も
  "w3_hanbun_kawaru", // #174 約半数が別のタイプに
  "w3_betsumono", // #175 ネットの無料診断は公式とは別物
  "w3_honryu", // #176 心理学の本流から生まれた検査
  "w3_egogram_intro", // #177 たとえば、エゴグラム
  "w3_berne_dusay", // #178 バーンの理論を弟子のデュセイが考案
  "w3_five_in_kokoro", // #179 心の中に自分たちが住んでいる
  "w3_five_jibun", // #180 厳しい親〜気をつかう子ども
  "w3_egogram_graph", // #181 元気さを棒グラフに
  "w3_todai_genneki", // #182 東大式エゴグラム、いまも現役
  "w3_haba_spectrum", // #183 娯楽寄りから医療寄りまで幅がある
  "w3_yon_moji", // #184 自己紹介欄を埋めたのは4文字のほう
  "w3_pocket_size", // #185 答えが初めてポケットサイズに
];

export const W_B3_PREVIEW_FRAMES = Math.max(W_B3_MOTIFS.length, 1);

// 検品用: 1フレーム = 1シーン (f=60で止めて見る)
export const WatashiB3Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(W_B3_MOTIFS.length - 1, 0));
  const motif = W_B3_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {watashiB3Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 121} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
