// 「私は何者?」4000年史: ブロック4 = 第10〜12章 + 結び。
// 担当範囲: 台本 docs/watashi-script-v1.txt の 187〜253行目 (文#186〜#252・67文)。
// 作業ルール: docs/watashi-motifs-rules.md を必ず読んでから作ること。
// WobbleDefs の seed はこのファイルでは 600〜699 を使う (1シーン1個、600〜654)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, KARAKURI_FONT, LabelPill, Stamp, Person, Atmosphere, WobbleDefs,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, abs, WBadge, ChapterTitle, PUR, RouteMap, ShindanSho, UranaiMachine,
} from "./WatashiShared";
import { FlagCard } from "./Jihanki2000Scenes";
import { JapanMapCard, jmapXY } from "./Jihanki2000JapanMap";

const FONT = KARAKURI_FONT;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ===== シーンの共通ガワ (背景クリーム + svg + WobbleDefs + WBadge + Atmosphere) =====
const Sc: React.FC<{
  seed: number; f: number; dark?: boolean;
  svg?: React.ReactNode; html?: React.ReactNode;
}> = ({ seed, f, dark, svg, html }) => (
  <AbsoluteFill style={{ background: KRP.cream }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={abs}>
      <WobbleDefs seed={seed} />
      {svg}
    </svg>
    {html}
    <WBadge />
    <Atmosphere f={f} dark={dark} />
  </AbsoluteFill>
);

// ===== 小さな共通部品 (このブロック内専用) =====

// 床の線
const Floor: React.FC<{ y?: number }> = ({ y = 880 }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={KRP.floor} opacity={0.45} />
    <line x1={0} y1={y} x2={W} y2={y} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
  </g>
);

// 名札 (svg内)
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; color?: string; t?: number; fill?: string;
}> = ({ x, y, text, size = 34, color = KRP.ink, t = 1, fill = KRP.white }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const w = text.length * size + 44;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * pop(tt)})`} opacity={clamp01(tt * 2)}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={10}
        fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ふきだし (1行)
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; text: string; size?: number;
  tailTo?: [number, number]; t?: number; color?: string;
}> = ({ x, y, w, h, text, size = 36, tailTo, t = 1, color = KRP.ink }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  return (
    <g opacity={tt} transform={`scale(${0.9 + 0.1 * pop(tt)})`} style={{ transformOrigin: `${x}px ${y}px` }}>
      {tailTo && (
        <polygon points={`${x - 22},${y + h / 2 - 8} ${x + 22},${y + h / 2 - 8} ${tailTo[0]},${tailTo[1]}`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2.6}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// 星型
const STAR_PATH = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 30 : 13;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`);
  }
  return "M " + pts.join(" L ") + " Z";
})();
const StarShape: React.FC<{
  x: number; y: number; s?: number; color?: string; o?: number; rot?: number;
}> = ({ x, y, s = 1, color = KRP.yellow, o = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <path d={STAR_PATH} fill={color} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
  </g>
);

// 大きな「?」
const QMark: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number }> = ({
  x, y, s = 1, color = KRP.orange, o = 1,
}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170 * s}
    fill={color} stroke={KRP.ink} strokeWidth={7 * s} style={{ paintOrder: "stroke" }} opacity={o}>?</text>
);

// 放射線 (大当たり・注目の演出)
const Burst: React.FC<{ x: number; y: number; r1?: number; r2?: number; n?: number; o?: number }> = ({
  x, y, r1 = 120, r2 = 190, n = 10, o = 0.85,
}) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.2;
      return (
        <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1}
          x2={x + Math.cos(a) * r2} y2={y + Math.sin(a) * r2}
          stroke={KRP.orange} strokeWidth={7} strokeLinecap="round" />
      );
    })}
  </g>
);

// 新聞 (420x560 中央基準)。uranai=占いコーナーつき
const NewsSheet: React.FC<{ x: number; y: number; s?: number; rot?: number; uranai?: boolean }> = ({
  x, y, s = 1, rot = 0, uranai,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-210} y={-280} width={420} height={560} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
    <rect x={-170} y={-250} width={340} height={46} rx={8} fill={KRP.ink} opacity={0.88} />
    <line x1={-170} y1={-178} x2={170} y2={-178} stroke={KRP.ink} strokeWidth={4} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line key={i} x1={-170} y1={-140 + i * 36} x2={i % 3 === 2 ? 30 : 170} y2={-140 + i * 36}
        stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.72} />
    ))}
    {uranai && (
      <g transform="translate(96 176)">
        <rect x={-100} y={-76} width={200} height={152} rx={10} fill={KRP.cream} stroke={KRP.orange} strokeWidth={6} />
        <StarShape x={-38} y={-20} s={0.75} />
        <text x={34} y={0} fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.ink}
          textAnchor="middle">?</text>
        <text x={0} y={54} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.orange}
          textAnchor="middle">占い</text>
      </g>
    )}
  </g>
);

// 王冠
const Crown: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -80 30 L -80 -28 L -40 -2 L 0 -52 L 40 -2 L 80 -28 L 80 30 Z"
      fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
    <rect x={-84} y={30} width={168} height={22} rx={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
    <circle cx={-80} cy={-34} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={0} cy={-58} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={80} cy={-34} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);

// 血液型チップ (丸いしずく形に文字。あるある表現はしない)
const BloodChip: React.FC<{ x: number; y: number; letter: string; s?: number; t?: number }> = ({
  x, y, letter, s = 1, t = 1,
}) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * pop(tt)})`}>
      <path d="M 0 -64 Q 44 -8 44 22 Q 44 62 0 62 Q -44 62 -44 22 Q -44 -8 0 -64 Z"
        fill={KRP.red} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={letter.length > 1 ? 40 : 50}
        fill={KRP.white}>{letter}</text>
    </g>
  );
};

// 紙 (ぐにゃぐにゃ線のみ。読める文字は書かない)
const SquigglePaper: React.FC<{
  x: number; y: number; w?: number; h?: number; rot?: number; lines?: number; header?: boolean;
}> = ({ x, y, w = 260, h = 340, rot = 0, lines = 5, header = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    {header && (
      <line x1={-w / 2 + 28} y1={-h / 2 + 50} x2={w / 2 - 28} y2={-h / 2 + 50}
        stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
    )}
    {Array.from({ length: lines }, (_, i) => (
      <line key={i} x1={-w / 2 + 28} y1={-h / 2 + 96 + i * ((h - 130) / lines)}
        x2={w / 2 - (i % 2 === 0 ? 28 : 64)} y2={-h / 2 + 96 + i * ((h - 130) / lines)}
        stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
    ))}
  </g>
);

// ブラウン管テレビ。原点 = 画面の中心。screen の中身は原点基準 (±160, ±130 以内) で描く
const TvSet: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number;
  screen?: React.ReactNode; antenna?: boolean; body?: string;
}> = ({ x, y, s = 1, f, phase = 0, screen, antenna = true, body = KRP.bronze }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {antenna && (
      <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
        <line x1={-70} y1={-188} x2={-150} y2={-296 + Math.sin((f + phase * 13) / 16) * 6} />
        <line x1={-70} y1={-188} x2={20} y2={-308 + Math.cos((f + phase * 13) / 18) * 6} />
      </g>
    )}
    {/* 脚 */}
    <rect x={-168} y={196} width={46} height={34} rx={8} fill={KRP.ink} />
    <rect x={150} y={196} width={46} height={34} rx={8} fill={KRP.ink} />
    {/* 筐体 */}
    <rect x={-218} y={-188} width={478} height={388} rx={26} fill={body} stroke={KRP.ink} strokeWidth={7} />
    {/* 画面 */}
    <rect x={-170} y={-140} width={340} height={280} rx={20} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
    {screen}
    {/* 走査線のチラつき */}
    <rect x={-166} y={-136 + ((f * 3) % 272)} width={332} height={10} fill={KRP.white} opacity={0.3} />
    {/* つまみ */}
    <circle cx={212} cy={-84} r={26} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5}
      transform={`rotate(${f * 2.2} 212 -84)`} />
    <line x1={212} y1={-84} x2={212} y2={-106} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round"
      transform={`rotate(${f * 2.2} 212 -84)`} />
    <circle cx={212} cy={6} r={26} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
    <rect x={186} y={72} width={54} height={96} rx={8} fill={KRP.ink} opacity={0.45} />
  </g>
);

// 日本列島 (共用の JapanMapCard と同じ座標。緑で塗り直すため輪郭を複製)
const JP_HONSHU: Array<[number, number]> = [
  [130.9, 34.1], [131.9, 34.7], [132.9, 35.1], [134.5, 35.6], [135.9, 35.95],
  [136.8, 36.3], [136.75, 37.35], [137.35, 37.5], [138.5, 37.9], [139.4, 38.4],
  [139.9, 39.9], [140.3, 41.2], [140.9, 40.9], [141.3, 41.3], [141.5, 40.4],
  [141.7, 39.3], [141.0, 38.3], [140.9, 37.0], [140.95, 35.75], [139.9, 35.4],
  [139.1, 34.65], [138.2, 34.75], [137.0, 34.65], [136.9, 34.25], [136.3, 33.5],
  [135.2, 33.55], [135.1, 34.3], [134.0, 34.55], [132.5, 34.35], [131.4, 33.95],
];
const JP_KYUSHU: Array<[number, number]> = [
  [130.9, 33.9], [130.3, 33.6], [129.8, 33.3], [129.6, 32.6], [130.2, 32.0],
  [130.3, 31.3], [130.7, 31.0], [131.1, 31.4], [131.5, 31.9], [131.9, 32.8],
  [131.5, 33.6],
];
const JP_SHIKOKU: Array<[number, number]> = [
  [132.0, 33.4], [132.8, 34.1], [134.1, 34.35], [134.7, 34.2], [134.6, 33.5],
  [133.9, 33.45], [133.2, 33.35], [132.6, 32.9],
];
const JP_HOKKAIDO: Array<[number, number]> = [
  [140.3, 42.3], [139.8, 43.2], [140.5, 43.7], [141.3, 43.7], [141.6, 45.4],
  [142.6, 44.9], [144.3, 44.1], [145.3, 44.3], [145.6, 43.6], [144.4, 43.0],
  [143.3, 42.0], [142.0, 42.6], [141.0, 41.9],
];
const jpoly = (pts: Array<[number, number]>): string =>
  "M " + pts.map(([lon, lat]) => jmapXY(lon, lat).join(" ")).join(" L ") + " Z";
const JapanGreen: React.FC = () => (
  <g>
    {[JP_HOKKAIDO, JP_HONSHU, JP_SHIKOKU, JP_KYUSHU].map((p, i) => (
      <path key={i} d={jpoly(p)} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    ))}
  </g>
);

// 12星座 (星の並びを線でつないだ形。-52〜52 の箱に収まるよう正規化ずみ)
type Zodiac = { name: string; pts: Array<[number, number]>; edges: Array<[number, number]>; bg: string };
const ZODIACS: Zodiac[] = [
  // 色はクリーム地に沈まないものを選ぶ (cream は背景と同じなので使わない)
  { name: "おひつじ", bg: KRP.red, pts: [[-42, 14], [-12, -18], [16, -4], [44, 26]], edges: [[0, 1], [1, 2], [2, 3]] },
  { name: "おうし", bg: KRP.bronze, pts: [[-44, -26], [-16, 4], [14, 4], [44, -26], [0, 32]], edges: [[0, 1], [1, 2], [2, 3], [1, 4], [2, 4]] },
  { name: "ふたご", bg: KRP.yellow, pts: [[-28, -34], [-28, 10], [-26, 34], [24, -34], [24, 10], [26, 34]], edges: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4]] },
  { name: "かに", bg: KRP.orange, pts: [[-42, -20], [-10, 0], [12, -26], [42, 6], [-4, 32]], edges: [[0, 1], [1, 2], [2, 3], [1, 4]] },
  { name: "しし", bg: KRP.gold, pts: [[-44, 20], [-30, -16], [0, -32], [24, -10], [20, 20], [44, 34]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  { name: "おとめ", bg: KRP.green, pts: [[-44, -20], [-14, -4], [10, -20], [34, 0], [14, 30]], edges: [[0, 1], [1, 2], [2, 3], [1, 4]] },
  { name: "てんびん", bg: KRP.blueSoft, pts: [[0, -32], [-40, 4], [40, 4], [-44, 30], [44, 30]], edges: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2]] },
  { name: "さそり", bg: KRP.copper, pts: [[-44, -26], [-20, -10], [4, 0], [26, 14], [40, 34], [14, 40]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  { name: "いて", bg: KRP.orange, pts: [[-40, 26], [-2, -4], [38, -30], [4, -34], [16, 8]], edges: [[0, 1], [1, 2], [1, 3], [1, 4]] },
  { name: "やぎ", bg: KRP.gray, pts: [[-44, -16], [0, -32], [40, -2], [2, 34]], edges: [[0, 1], [1, 2], [2, 3], [3, 0]] },
  { name: "みずがめ", bg: KRP.blue, pts: [[-44, -16], [-14, 10], [14, -16], [44, 10], [-14, 34]], edges: [[0, 1], [1, 2], [2, 3], [1, 4]] },
  { name: "うお", bg: KRP.green, pts: [[-44, -26], [-20, 2], [-8, 14], [20, -2], [44, -24]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
];

// 星座エンブレム (丸い色札 + 星の並び + 名前)。小さくしても線が潰れないよう太めに
const ZodiacEmblem: React.FC<{
  x: number; y: number; z: Zodiac; s?: number; t?: number; f: number; phase?: number; name?: boolean;
}> = ({ x, y, z, s = 1, t = 1, f, phase = 0, name = true }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  const tw = Math.sin((f + phase * 19) / 15) * 2.5;
  return (
    <g transform={`translate(${x} ${y + tw}) scale(${s * (0.75 + 0.25 * pop(tt))})`} opacity={clamp01(tt * 2)}>
      <circle r={78} fill={z.bg} stroke={KRP.ink} strokeWidth={6} />
      <circle r={62} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      {/* 星座の線。小さく並べても潰れないよう太め */}
      <g stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" opacity={0.9}>
        {z.edges.map(([a, b], i) => (
          <line key={i} x1={z.pts[a][0] * 0.66} y1={z.pts[a][1] * 0.66 - 6}
            x2={z.pts[b][0] * 0.66} y2={z.pts[b][1] * 0.66 - 6} />
        ))}
      </g>
      {z.pts.map(([px, py], i) => (
        <circle key={i} cx={px * 0.66} cy={py * 0.66 - 6} r={9} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={4}
          opacity={0.72 + 0.28 * Math.abs(Math.sin(f / 9 + i * 1.3 + phase))} />
      ))}
      {name && (
        <g transform="translate(0 102)">
          <rect x={-78} y={-27} width={156} height={54} rx={12} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4.5} />
          <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32}
            fill={KRP.ink}>{z.name}</text>
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 第10章 王女さま誕生、星占いはじまる (#186〜#198)
// ===================================================================

// #186 章扉
const SceneCh10Door: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 4, 26));
  const t2 = pop(seg(f, 14, 36));
  const starPos: Array<[number, number, number]> = [
    [240, 230, 1], [700, 170, 0.7], [170, 560, 0.85], [790, 500, 0.6], [520, 330, 0.55],
  ];
  return (
    <Sc seed={600} f={f}
      svg={
        <g filter="url(#wobble)">
          {starPos.map(([sx, sy, ss], i) => (
            <StarShape key={i} x={sx} y={sy} s={ss * (0.92 + 0.08 * Math.sin(f / 7 + i * 2))} />
          ))}
          <g transform={`translate(470 640) rotate(-6) scale(${0.9 + 0.1 * t1})`} opacity={t1}>
            <NewsSheet x={0} y={0} uranai />
          </g>
          <g transform={`translate(470 240) scale(${t2})`}>
            <Crown s={1.25} />
          </g>
        </g>
      }
      html={<ChapterTitle num={10} title="王女さま誕生、星占いはじまる" t={seg(f, 8, 30)} />}
    />
  );
};

// #187 朝の星座占い、いつ生まれた?
const SceneAsaUranai: React.FC<{ f: number }> = ({ f }) => {
  // 朝の情報番組の「今日の星占い」コーナーが並ぶ。ランキングの数字は出さず星の数で表す
  const tvs: Array<{ x: number; z: Zodiac; stars: number; at: number }> = [
    { x: 300, z: ZODIACS[4], stars: 3, at: 4 },
    { x: 670, z: ZODIACS[1], stars: 2, at: 12 },
    { x: 1040, z: ZODIACS[10], stars: 1, at: 20 },
  ];
  return (
    <Sc seed={601} f={f}
      svg={
        <g filter="url(#wobble)">
          {/* 朝日 (窓の外) */}
          <g transform="translate(150 330)">
            <circle r={62} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const r2 = 96 + Math.sin(f / 9 + i) * 6;
              return (
                <line key={i} x1={Math.cos(a) * 78} y1={Math.sin(a) * 78}
                  x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
                  stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
              );
            })}
          </g>
          <Floor />
          {/* テレビを置く台 */}
          <rect x={60} y={760} width={1270} height={120} rx={10} fill={KRP.bronze}
            stroke={KRP.ink} strokeWidth={6} />
          {tvs.map((tv, i) => {
            const t = pop(seg(f, tv.at, tv.at + 18));
            return (
              <g key={tv.x} opacity={clamp01(t * 2)}>
                <TvSet x={tv.x} y={617} s={0.62} f={f} phase={i}
                  screen={
                    <g>
                      <rect x={-162} y={-134} width={324} height={52} rx={10} fill={KRP.orange}
                        stroke={KRP.ink} strokeWidth={4.5} />
                      <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                        fontSize={32} fill={KRP.white}>きょうの星占い</text>
                      <ZodiacEmblem x={-66} y={26} z={tv.z} s={0.64} f={f} phase={i} name={false} />
                      {[0, 1, 2].map((k) => (
                        <StarShape key={k} x={82} y={-28 + k * 54} s={0.52}
                          color={k < tv.stars ? KRP.yellow : KRP.white}
                          o={k < tv.stars ? 1 : 0.5} />
                      ))}
                    </g>
                  }
                />
              </g>
            );
          })}
          {/* 見ている人 */}
          <Person x={1620} y={890} s={1.05} f={f} cloth={KRP.blueDeep} face="smile" gaze={[-6, 2]} />
          <QMark x={1790} y={470} s={0.85} o={pop(seg(f, 30, 50))} />
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="朝の星座占いは、いつ生まれた?" size={36} />}
    />
  );
};

// #188 星占いは古代から / 新聞の占い欄は浅い
const FURUI_LABEL_Y = 790; // 左右の下ラベルの高さ (左右そろえる。個別に書き換えない)
const SceneFuruiAtarashii: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 4, 24));
  const t2 = pop(seg(f, 16, 36));
  return (
    <Sc seed={602} f={f}
      svg={
        <g filter="url(#wobble)">
          {/* 左: 古代の星図盤 */}
          {/* 字幕帯に下ラベルが隠れないよう全体を少し縮小して上へ (実映像検品で発見) */}
          <g transform={`translate(430 520) scale(${t1 * 0.78})`}>
            <circle r={252} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
            <circle r={200} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.5} />
            <g transform={`rotate(${f * 0.2})`}>
              <polyline points="-120,-60 -40,-110 40,-70 110,-120" fill="none"
                stroke={KRP.white} strokeWidth={3.5} opacity={0.8} />
              <polyline points="-100,80 -20,50 60,110 130,60" fill="none"
                stroke={KRP.white} strokeWidth={3.5} opacity={0.8} />
              {([[-120, -60], [-40, -110], [40, -70], [110, -120], [-100, 80], [-20, 50], [60, 110], [130, 60]] as Array<[number, number]>).map(([px, py], i) => (
                <circle key={i} cx={px} cy={py} r={9} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
              ))}
            </g>
            <StarShape x={0} y={0} s={0.9} />
          </g>
          {/* 左右で見くらべる絵なので、下の札2枚は必ず同じ y にそろえる。
              (以前 786 と 800 でずれていて、第233文と同じ「高さが合ってない」指摘の対象だった。
               ここを別々の数字に戻さないこと) */}
          <TagPlate x={430} y={FURUI_LABEL_Y} text="星占い: 古代から" t={t1} />
          {/* 中央の両矢印 */}
          <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.85}>
            <line x1={740} y1={520} x2={910} y2={520} />
            <polyline points="770,490 740,520 770,550" fill="none" strokeLinejoin="round" />
            <polyline points="880,490 910,520 880,550" fill="none" strokeLinejoin="round" />
          </g>
          {/* 右: 新聞とテレビ (どちらの占いコーナーも歴史は浅い) */}
          <g transform={`translate(1160 520) scale(${t2})`}>
            <NewsSheet x={0} y={0} s={0.68} uranai />
          </g>
          <g opacity={clamp01(t2 * 2)}>
            <TvSet x={1580} y={520} s={0.52} f={f}
              screen={
                <g>
                  <rect x={-162} y={-134} width={324} height={52} rx={10} fill={KRP.orange}
                    stroke={KRP.ink} strokeWidth={4.5} />
                  <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                    fontSize={32} fill={KRP.white}>今日の占い</text>
                  <ZodiacEmblem x={-62} y={26} z={ZODIACS[7]} s={0.64} f={f} phase={2} name={false} />
                  {[0, 1, 2].map((k) => (
                    <StarShape key={k} x={84} y={-28 + k * 54} s={0.52}
                      color={k < 2 ? KRP.yellow : KRP.white} o={k < 2 ? 1 : 0.5} />
                  ))}
                </g>
              }
            />
          </g>
          <TagPlate x={1330} y={FURUI_LABEL_Y} text="新聞やテレビの占い欄: 意外と浅い" size={30}
            color={KRP.red} t={t2} />
        </g>
      }
    />
  );
};

// #189 1930年、イギリス
const SceneUk1930: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 6, 28));
  return (
    <Sc seed={603} f={f}
      svg={
        <g filter="url(#wobble)">
          <Floor />
          {/* ビッグベン風の時計塔 */}
          <g transform="translate(620 880)">
            <rect x={-95} y={-640} width={190} height={640} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6.5} />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={-95} y1={-120 - i * 130} x2={95} y2={-120 - i * 130}
                stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
            ))}
            <polygon points="-105,-640 0,-800 105,-640" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={-520} r={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
            <line x1={0} y1={-520} x2={0} y2={-566} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round"
              transform={`rotate(${f * 0.5} 0 -520)`} />
            <line x1={0} y1={-520} x2={34} y2={-520} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
            <rect x={-56} y={-110} width={112} height={110} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
          </g>
          {/* 雲 */}
          <g fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} opacity={0.9}>
            <ellipse cx={1120 + Math.sin(f / 20) * 8} cy={240} rx={90} ry={40} />
            <ellipse cx={1560 - Math.sin(f / 24) * 8} cy={170} rx={70} ry={32} />
          </g>
          <g transform={`translate(1330 460) scale(${t1})`}>
            <FlagCard kind="uk" x={0} y={0} s={1.25} />
          </g>
        </g>
      }
      html={<Stamp x={1180} y={620} text="イギリス" size={66} />}
    />
  );
};

// 文#191 新聞社の企画会議
// 作者フィードバック (2026-10-30):
//  ・左にあった輪転機は「パソコンのモニター」に見えてしまうので削除した。
//  ・「締切 きょう夕方」の貼り紙も不要とのことで削除した。
// 空いた左半分には、この章でずっと使っている NewsSheet (新聞そのもの) を大きく置いて、
// 「ここは新聞社の話」と一目で分かるようにしてある。企画前なので占いコーナーはまだ付けない。
// 刷り上がりの紙は新聞と編集デスクのあいだへ移し、左・中・右で重さが散るようにした。
const SceneShinbunKikaku: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 14, 36));
  return (
    <Sc seed={604} f={f}
      svg={
        <g filter="url(#wobble)">
          <Floor />
          {/* 左: その新聞社が出している新聞 (既存部品 NewsSheet を流用)。
              札の下端 y=322 / 新聞の上端 y=331 で、テロップ帯 (y=140〜200) には掛からない */}
          <TagPlate x={400} y={286} text="新聞社" size={38} />
          <NewsSheet x={400} y={600} s={0.96} rot={-3} />
          {/* 刷り上がって舞う紙 (新聞と編集デスクのあいだの空きを埋める) */}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${680 + i * 54} ${560 - ((f * 1.6 + i * 26) % 90)}) rotate(${-14 + i * 12})`}
              opacity={0.9}>
              <rect x={-44} y={-56} width={88} height={112} rx={8} fill={KRP.white}
                stroke={KRP.ink} strokeWidth={4.5} />
              <line x1={-24} y1={-14} x2={24} y2={-14} stroke={KRP.grayDark} strokeWidth={4} />
              <line x1={-24} y1={14} x2={14} y2={14} stroke={KRP.grayDark} strokeWidth={4} />
            </g>
          ))}
          {/* 編集デスク */}
          <rect x={830} y={752} width={1010} height={130} rx={12} fill={KRP.bronze}
            stroke={KRP.ink} strokeWidth={6} />
          <Person x={1010} y={872} s={0.86} f={f} cloth={KRP.grayDark} face="smile" gaze={[4, -2]} />
          <Person x={1330} y={872} s={0.86} f={f} phase={2} cloth={KRP.green} face="surprised"
            gaze={[-4, -2]} />
          <SquigglePaper x={880} y={700} w={120} h={130} rot={-8} lines={3} />
          <SquigglePaper x={1160} y={698} w={120} h={130} rot={6} lines={3} />
          {/* タイプライター */}
          <g transform="translate(1690 752)">
            <rect x={-96} y={-70} width={192} height={70} rx={10} fill={KRP.grayDark}
              stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={-74} y={-130} width={148} height={64} rx={8} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={5} />
            <line x1={-56} y1={-100} x2={56} y2={-100} stroke={KRP.grayDark} strokeWidth={4.5} />
            {[0, 1, 2].map((r) => (
              <g key={r}>
                {[0, 1, 2, 3, 4].map((c) => (
                  <circle key={c} cx={-64 + c * 32} cy={-52 + r * 17} r={7}
                    fill={(f + r * 5 + c * 3) % 37 < 4 ? KRP.yellow : KRP.gray}
                    stroke={KRP.ink} strokeWidth={3} />
                ))}
              </g>
            ))}
          </g>
          {/* アイデアのふきだし (人物の頭より上に置いて重ならないようにする) */}
          <g opacity={t1}>
            <circle cx={1230} cy={610} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={1252} cy={558} r={19} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <ellipse cx={1310} cy={388} rx={300} ry={138} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <g transform="translate(1310 348) scale(0.6)"><Crown /></g>
            <text x={1310} y={468} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={38} fill={KRP.ink}>王女誕生の記念企画!</text>
          </g>
        </g>
      }
    />
  );
};

// #191 占星術師が王女のゆりかごを占う
const SceneCribHoroscope: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 10, 32));
  return (
    <Sc seed={605} f={f}
      svg={
        <g filter="url(#wobble)">
          <Floor />
          {/* 占星術師 (紫のローブ+とんがり帽子) */}
          <Person x={600} y={880} f={f} cloth={PUR.mid} clothDark={PUR.deep} gaze={[5, -3]} />
          <g transform="translate(600 880)">
            <polygon points="-72,-284 72,-284 0,-432" fill={PUR.deep} stroke={KRP.ink} strokeWidth={5.5}
              strokeLinejoin="round" />
            <StarShape x={0} y={-340} s={0.55} />
          </g>
          {/* ゆりかご */}
          <g transform="translate(1180 880)">
            <path d="M -150 -120 Q -150 -10 0 -10 Q 150 -10 150 -120 Z"
              fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -150 -120 Q -110 -250 40 -230 L 40 -120 Z"
              fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M -170 0 Q 0 46 170 0" fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
            {/* 赤ちゃん */}
            <circle cx={70} cy={-150} r={42} fill="#F6D7B8" stroke={KRP.ink} strokeWidth={5} />
            <path d="M 54 -158 Q 62 -150 70 -158 M 78 -158 Q 86 -150 94 -158" fill="none"
              stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
            <path d="M 70 -192 Q 76 -212 92 -206" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
            <rect x={-10} y={-130} width={160} height={36} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
          {/* ホロスコープ盤 */}
          <g transform={`translate(1480 330) scale(${t1})`}>
            <circle r={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
            <circle r={104} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line key={i} x1={Math.cos(a) * 104} y1={Math.sin(a) * 104}
                  x2={Math.cos(a) * 150} y2={Math.sin(a) * 150}
                  stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
              );
            })}
            <line x1={0} y1={0} x2={0} y2={-92} stroke={KRP.orange} strokeWidth={7} strokeLinecap="round"
              transform={`rotate(${f * 1.2})`} />
            <circle r={14} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <StarShape x={1310} y={180} s={0.6} o={0.9} />
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="生まれたばかりの王女を占う" size={36} />}
    />
  );
};

// #192 占星術師ネイラー
const SceneNaylor: React.FC<{ f: number }> = ({ f }) => {
  const stars: Array<[number, number, number]> = [
    [330, 310, 0.8], [1250, 215, 0.55], [1690, 300, 0.7], [250, 640, 0.5],
    [1760, 620, 0.6], [560, 215, 0.45],
  ];
  return (
    // このシーンだけ、神秘的な紫の夜空に切り替える (ほかは明るいクリーム地)
    <Sc seed={606} f={f} dark
      svg={
        <g>
          <rect x={0} y={0} width={W} height={H} fill={PUR.deep} />
          <ellipse cx={960} cy={640} rx={780} ry={580} fill={PUR.mid} opacity={0.55} />
          <ellipse cx={900} cy={700} rx={430} ry={380} fill={PUR.glow} opacity={0.26} />
          <g filter="url(#wobble)">
            {/* 背景のホロスコープ盤 */}
            <g transform={`translate(900 590) rotate(${f * 0.1})`} opacity={0.5}>
              <circle r={438} fill="none" stroke={PUR.glow} strokeWidth={6} />
              <circle r={336} fill="none" stroke={PUR.glow} strokeWidth={4} />
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return (
                  <line key={i} x1={Math.cos(a) * 336} y1={Math.sin(a) * 336}
                    x2={Math.cos(a) * 438} y2={Math.sin(a) * 438}
                    stroke={PUR.glow} strokeWidth={4} />
                );
              })}
            </g>
            {stars.map(([sx, sy, ss], i) => (
              <StarShape key={i} x={sx} y={sy} s={ss * (0.88 + 0.12 * Math.sin(f / 8 + i * 1.7))}
                o={0.75 + 0.25 * Math.abs(Math.sin(f / 10 + i))} />
            ))}
            {/* 床 (紫の光の線) */}
            <line x1={0} y1={890} x2={W} y2={890} stroke={PUR.glow} strokeWidth={6} opacity={0.6} />
            <Person x={860} y={890} s={1.12} f={f} cloth={PUR.mid} clothDark={PUR.deep} face="smile"
              gaze={[4, 0]} />
            {/* とんがり帽子とローブの星 */}
            <g transform="translate(860 890) scale(1.12)">
              <polygon points="-74,-286 74,-286 0,-430" fill={PUR.deep} stroke={KRP.ink}
                strokeWidth={5.5} strokeLinejoin="round" />
              <StarShape x={0} y={-342} s={0.5} />
              <StarShape x={-30} y={-120} s={0.36} />
              <StarShape x={28} y={-86} s={0.28} />
            </g>
            {/* 水晶玉 */}
            <g transform="translate(1450 890)">
              <path d="M -90 0 L -52 -72 L 52 -72 L 90 0 Z" fill={KRP.brass} stroke={KRP.ink}
                strokeWidth={6} strokeLinejoin="round" />
              <circle cx={0} cy={-176} r={108} fill={PUR.glow} stroke={KRP.ink} strokeWidth={6.5}
                opacity={0.95} />
              <circle cx={-34} cy={-212} r={28} fill={KRP.white} opacity={0.6} />
              <circle cx={0} cy={-176} r={132 + Math.sin(f / 9) * 6} fill="none" stroke={KRP.yellow}
                strokeWidth={4} opacity={0.4} />
              <StarShape x={18} y={-162} s={0.42} o={0.85 + 0.15 * Math.sin(f / 7)} />
            </g>
            <TagPlate x={860} y={300} text="占星術師 ネイラー" size={44} t={seg(f, 8, 26)} />
          </g>
        </g>
      }
    />
  );
};

// #193 連載が大当たり → 新聞社のなかで社員が飛び上がって喜ぶ
const SceneRensaiHit: React.FC<{ f: number }> = ({ f }) => {
  const crew: Array<{ x: number; cloth: string; face: "smile" | "surprised"; ph: number }> = [
    { x: 640, cloth: KRP.blueDeep, face: "smile", ph: 0 },
    { x: 990, cloth: KRP.orange, face: "surprised", ph: 2.4 },
    { x: 1340, cloth: KRP.green, face: "smile", ph: 4.8 },
  ];
  return (
    <Sc seed={607} f={f}
      svg={
        <g filter="url(#wobble)">
          <Floor />
          <Burst x={990} y={540} r1={300} r2={400} n={14} o={0.5} />
          {/* 編集部のデスク (左右) */}
          <rect x={-20} y={762} width={400} height={120} rx={12} fill={KRP.bronze}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={1560} y={762} width={400} height={120} rx={12} fill={KRP.bronze}
            stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={70 + (i % 2) * 10} y={740 - i * 26} width={250} height={26} rx={6}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={1650 + (i % 2) * 10} y={740 - i * 26} width={230} height={26} rx={6}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
          {/* 飛び上がって喜ぶ社員 */}
          {crew.map((p, i) => {
            const jy = -Math.abs(Math.sin((f + p.ph * 7) / 9)) * 78;
            return (
              <g key={p.x}>
                {/* 足もとの勢いの線 */}
                <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.5}>
                  <line x1={p.x - 86} y1={884} x2={p.x - 118} y2={856} />
                  <line x1={p.x + 86} y1={884} x2={p.x + 118} y2={856} />
                </g>
                <Person x={p.x} y={880 + jy} s={0.94} f={f} phase={i * 3} cloth={p.cloth}
                  face={p.face} gaze={[0, -3]} />
                {/* 喜びのポーズ: ひじ (-67,-66) から前腕を斜め上に伸ばし、先にこぶし。
                    Person の腕は下向きのまま = 「ひじを曲げて両手を上げた」形になる。
                    腕を二重に描かないよう、前腕はひじから先だけにしてある。 */}
                <g transform={`translate(${p.x} ${880 + jy}) scale(0.94)`}>
                  {[-1, 1].map((d) => (
                    <g key={d}>
                      <line x1={d * 67} y1={-66} x2={d * 140} y2={-204}
                        stroke={KRP.ink} strokeWidth={31} strokeLinecap="round" />
                      <line x1={d * 67} y1={-66} x2={d * 140} y2={-204}
                        stroke={p.cloth} strokeWidth={22} strokeLinecap="round" />
                      {/* こぶしは顔と同じ色 (この作風の肌色) */}
                      <circle cx={d * 146} cy={-216} r={18} fill={KRP.white}
                        stroke={KRP.ink} strokeWidth={4.5} />
                    </g>
                  ))}
                </g>
              </g>
            );
          })}
          {/* 宙に舞う新聞 */}
          {([[760, 420, -24], [1140, 370, 18], [1500, 450, 34]] as Array<[number, number, number]>).map(
            ([px, py, rot], i) => (
              <g key={i} transform={`translate(${px} ${py + Math.sin(f / 8 + i * 2) * 14}) rotate(${rot + Math.sin(f / 11 + i) * 6})`}>
                <NewsSheet x={0} y={0} s={0.34} uranai />
              </g>
            ),
          )}
        </g>
      }
      html={<Stamp x={1430} y={200} text="大当たり" size={66} />}
    />
  );
};

// #195 街で「当たってる!」と大評判 (#193 の社内とは別の絵)
const SceneMachiHyouban: React.FC<{ f: number }> = ({ f }) => {
  const readers: Array<{ x: number; cloth: string; lean: number; ph: number; say?: string }> = [
    { x: 470, cloth: KRP.orange, lean: -5, ph: 0, say: "当たってる!" },
    { x: 940, cloth: KRP.blueDeep, lean: 4, ph: 3 },
    { x: 1420, cloth: KRP.green, lean: -3, ph: 6, say: "ほんとだ!" },
  ];
  return (
    <Sc seed={655} f={f}
      svg={
        <g filter="url(#wobble)">
          {/* 街なみ (背景のビル) */}
          <g fill={KRP.gray} stroke={KRP.ink} strokeWidth={5.5} opacity={0.75}>
            <rect x={60} y={420} width={260} height={462} rx={8} />
            <rect x={360} y={330} width={220} height={552} rx={8} />
            <rect x={1180} y={370} width={240} height={512} rx={8} />
            <rect x={1470} y={440} width={300} height={442} rx={8} />
          </g>
          <g fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} opacity={0.8}>
            {([[60, 420, 260, 400], [360, 330, 220, 490], [1180, 370, 240, 450], [1470, 440, 300, 380]] as Array<[number, number, number, number]>).map(
              ([bx, by, bw, bh], bi) =>
                Array.from({ length: Math.floor((bh - 60) / 90) }, (_, r) =>
                  Array.from({ length: Math.floor((bw - 40) / 80) }, (_, c) => (
                    <rect key={`${bi}-${r}-${c}`} x={bx + 32 + c * 80} y={by + 46 + r * 90}
                      width={44} height={54} rx={5}
                      opacity={(bi * 3 + r * 2 + c + Math.floor(f / 24)) % 5 === 0 ? 0.45 : 1} />
                  )),
                ),
            )}
          </g>
          {/* 街灯 */}
          <g transform="translate(750 880)">
            <rect x={-10} y={-470} width={20} height={470} fill={KRP.grayDark}
              stroke={KRP.ink} strokeWidth={4.5} />
            <ellipse cx={0} cy={-492} rx={44} ry={28} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          </g>
          <Floor />
          {/* 新聞を読んで驚く通行人 */}
          {readers.map((p, i) => {
            const t = pop(seg(f, 4 + i * 9, 22 + i * 9));
            return (
              <g key={p.x}>
                <Person x={p.x} y={884} s={0.95} f={f} phase={i * 4} cloth={p.cloth}
                  face="surprised" gaze={[0, 4]} lean={p.lean} />
                {/* 手に持った新聞 (顔が隠れないよう体の横に広げる) */}
                {/* 新聞は体のすぐ横 (顔は隠さず、手に持って見えるぎりぎりの位置) */}
                <g transform={`translate(${p.x + 132} ${770 + Math.sin((f + i * 11) / 13) * 3}) rotate(${p.lean})`}>
                  <NewsSheet x={0} y={0} s={0.38} uranai />
                </g>
                {p.say && (
                  <Bubble x={p.x + (i === 0 ? -20 : 40)} y={330} w={p.say.length * 42 + 60} h={104}
                    text={p.say} size={42} color={KRP.red}
                    tailTo={[p.x + 20, 470]} t={t} />
                )}
                <Burst x={p.x} y={560} r1={150} r2={196} n={9} o={0.3 + 0.2 * Math.sin(f / 9 + i)} />
              </g>
            );
          })}
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="「当たった」と大評判に" size={36} />}
    />
  );
};

// #194 「イギリスの航空機が危ない」→ 飛行船事故
const SceneHikousen: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={608} f={f}
    svg={
      <g filter="url(#wobble)">
        {/* 見出しカード */}
        <g>
          {/* カードは見出しの文字だけ。左にあった灰色の四角は意味がないので置かない (作者の指示) */}
          <rect x={360} y={190} width={1200} height={130} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <text x={960} y={278} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={56} fill={KRP.red}>「イギリスの航空機が危ない」</text>
        </g>
        {/* 飛行船 (傾いて煙。直接の墜落描写はしない) */}
        <g transform={`translate(930 ${640 + Math.sin(f / 10) * 6}) rotate(10)`}>
          <ellipse cx={0} cy={0} rx={300} ry={92} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6.5} />
          {[-180, -60, 60, 180].map((px) => (
            <path key={px} d={`M ${px} -88 Q ${px + 10} 0 ${px} 88`} fill="none"
              stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          ))}
          <polygon points="268,-44 356,-86 356,-20" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="268,44 356,86 356,20" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-70} y={86} width={140} height={44} rx={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 煙 */}
          <g fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} opacity={0.65}>
            <circle cx={320} cy={-96 - (f % 40) * 0.8} r={26} />
            <circle cx={366} cy={-130 - (f % 40) * 1.1} r={34} />
            <circle cx={416} cy={-168 - (f % 40) * 1.3} r={42} />
          </g>
        </g>
      </g>
    }
  />
);

// #196 #197 12星座の形式に進化
const Scene12Seiza: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 4, 28));
  return (
    <Sc seed={609} f={f}
      svg={
        <g filter="url(#wobble)">
          <g transform={`translate(960 590) scale(${t1}) rotate(${f * 0.12})`}>
            <circle r={336} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            {Array.from({ length: 12 }, (_, i) => {
              const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2;
              const a1 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
              const x0 = Math.cos(a0) * 330, y0 = Math.sin(a0) * 330;
              const x1 = Math.cos(a1) * 330, y1 = Math.sin(a1) * 330;
              const am = (a0 + a1) / 2;
              const mx = Math.cos(am) * 235, my = Math.sin(am) * 235;
              return (
                <g key={i}>
                  <path d={`M 0 0 L ${x0} ${y0} A 330 330 0 0 1 ${x1} ${y1} Z`}
                    fill={i % 2 === 0 ? KRP.cream : KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
                  <g transform={`translate(${mx} ${my}) rotate(${-f * 0.12})`}>
                    <StarShape x={0} y={0} s={0.5} />
                    <circle cx={-26} cy={20} r={5} fill={KRP.blueDeep} />
                    <circle cx={26} cy={18} r={5} fill={KRP.blueDeep} />
                  </g>
                </g>
              );
            })}
            <circle r={96} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6.5} />
            <g transform={`rotate(${-f * 0.12})`}>
              <StarShape x={0} y={0} s={1.1} color={KRP.white} />
            </g>
          </g>
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="生まれた月で分ける、おなじみの形式へ" size={36} />}
    />
  );
};

// #197 12星座ぜんぶを色つきで散らす (#196 の円盤とは別の絵)
const Scene12SeizaAll: React.FC<{ f: number }> = ({ f }) => {
  // 3段とも名前札 (中心+102, 高さ54) の下端が y=880 を超えないように段の高さを決める
  const cols = [290, 735, 1180, 1625];
  const rows = [318, 512, 706];
  const jitter = [-10, 8, -6, 10, 6, -10, 9, -7, -8, 5, 10, -9];
  return (
    <Sc seed={656} f={f}
      svg={
        <g filter="url(#wobble)">
          {/* 背景のうすい星 */}
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={130 + ((i * 263) % 1660)} cy={270 + ((i * 419) % 600)}
              r={4 + (i % 3)} fill={KRP.grayDark}
              opacity={0.2 + 0.2 * Math.abs(Math.sin(f / 13 + i))} />
          ))}
          {ZODIACS.map((z, i) => {
            const cx = cols[i % 4] + jitter[i] * 1.4;
            const cy = rows[Math.floor(i / 4)] + jitter[(i + 5) % 12];
            return (
              <ZodiacEmblem key={z.name} x={cx} y={cy} z={z} s={0.9} f={f} phase={i}
                t={seg(f, 2 + i * 4, 20 + i * 4)} />
            );
          })}
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="生まれた月で、グループ分け" size={36} />}
    />
  );
};

// #198 ついに日刊に
const SceneNikkan: React.FC<{ f: number }> = ({ f }) => {
  // 「毎日、占い欄のある新聞が出る」を一列に並べて見せる (ラベルと絵が重ならない高さに配置)
  const days = ["月", "火", "水", "木", "金"];
  return (
    <Sc seed={610} f={f}
      svg={
        <g filter="url(#wobble)">
          {days.map((d, i) => {
            const x = 400 + i * 300;
            const t = pop(seg(f, 4 + i * 10, 22 + i * 10));
            const glow = Math.abs(Math.sin((f - i * 9) / 18));
            return (
              <g key={d} opacity={clamp01(t * 2)}>
                <g transform={`translate(${x} 540) rotate(${-3 + i * 1.5}) scale(${0.42 * (0.82 + 0.18 * t)})`}>
                  <NewsSheet x={0} y={0} uranai />
                </g>
                {/* 占い欄が毎日ある、という光 */}
                <circle cx={x + 40} cy={614} r={48} fill="none" stroke={KRP.orange} strokeWidth={5}
                  opacity={0.2 + 0.6 * glow} />
                <g transform={`translate(${x} 752) scale(${t})`}>
                  <circle r={46} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
                  <text y={17} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
                    fill={KRP.ink}>{d}</text>
                </g>
              </g>
            );
          })}
          {/* 毎日つづく、の矢印 */}
          <g stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none"
            opacity={0.85}>
            <line x1={330} y1={846} x2={1700} y2={846} />
            <polyline points="1656,816 1700,846 1656,876" />
          </g>
          <TagPlate x={182} y={846} text="毎日" size={34} t={seg(f, 2, 18)} />
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="「私は何者?」が、ついに日刊に" size={36} />}
    />
  );
};

// ===================================================================
// 第11章 血液型は、日本生まれ (#199〜#214)
// ===================================================================

// #199 章扉
const SceneCh11Door: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={611} f={f}
    svg={
      <g filter="url(#wobble)">
        <g transform={`translate(440 420) scale(${pop(seg(f, 4, 24))})`}>
          <FlagCard kind="japan" x={0} y={0} s={1.5} />
        </g>
        <BloodChip x={300} y={740} letter="A" s={0.85} t={seg(f, 12, 26)} />
        <BloodChip x={460} y={790} letter="B" s={0.85} t={seg(f, 18, 32)} />
        <BloodChip x={620} y={740} letter="O" s={0.85} t={seg(f, 24, 38)} />
        <BloodChip x={780} y={790} letter="AB" s={0.85} t={seg(f, 30, 44)} />
      </g>
    }
    html={<ChapterTitle num={11} title="血液型は、日本生まれ" t={seg(f, 8, 30)} />}
  />
);

// #200 #201 日本にしかない発明 = 血液型性格診断
const SceneNihonHatsumei: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 10, 32));
  return (
    <Sc seed={612} f={f}
      svg={
        // 地図カードを少し縮めて下げ、上のラベルと重ならないようにする (元は y=120 開始でラベルと衝突)
        <g filter="url(#wobble)" transform="translate(960 600) scale(0.8333) translate(-960 -540)">
          <JapanMapCard>
            {/* 日本列島を緑に塗り直す (共用カードはクリーム。同じ輪郭を重ねている) */}
            <JapanGreen />
            {/* ひらめき電球 */}
            <g transform={`translate(1130 430) scale(${t1})`}>
              <circle r={64} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
              <rect x={-26} y={56} width={52} height={30} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
              {Array.from({ length: 6 }, (_, i) => {
                const a = -Math.PI / 2 + (i - 2.5) * 0.5;
                return (
                  <line key={i} x1={Math.cos(a) * 82} y1={Math.sin(a) * 82}
                    x2={Math.cos(a) * 112} y2={Math.sin(a) * 112}
                    stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
                );
              })}
            </g>
            <BloodChip x={700} y={620} letter="A" s={0.72} t={seg(f, 16, 30)} />
            <BloodChip x={860} y={700} letter="B" s={0.72} t={seg(f, 22, 36)} />
            <BloodChip x={1310} y={640} letter="O" s={0.72} t={seg(f, 28, 42)} />
            <BloodChip x={1420} y={430} letter="AB" s={0.72} t={seg(f, 34, 48)} />
          </JapanMapCard>
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="日本にしかない発明: 血液型性格診断" size={36} />}
    />
  );
};

// #202 1927年、古川竹二の論文
const SceneFurukawa1927: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={613} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        <Person x={660} y={880} f={f} cloth={KRP.grayDark} glasses face="normal" gaze={[5, -2]} />
        {/* 発表する論文 */}
        <g transform={`translate(1230 560) scale(${pop(seg(f, 8, 30))})`}>
          <SquigglePaper x={0} y={0} w={360} h={470} lines={6} />
          <BloodChip x={-100} y={-150} letter="A" s={0.5} />
          <BloodChip x={100} y={-150} letter="O" s={0.5} />
        </g>
        <TagPlate x={660} y={300} text="教育学者 古川竹二" size={38} t={seg(f, 10, 28)} />
      </g>
    }
    html={<Stamp x={1430} y={720} text="1927年" size={58} />}
  />
);

// #203 A型は慎重、O型はおおらか…の原型 (中身の文字は読めない線で)
const SceneBunruiPaper: React.FC<{ f: number }> = ({ f }) => {
  const rows: Array<[string, number]> = [["A", 0], ["B", 1], ["O", 2], ["AB", 3]];
  return (
    <Sc seed={614} f={f}
      svg={
        <g filter="url(#wobble)">
          <g transform="translate(960 590)">
            <rect x={-430} y={-330} width={860} height={660} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <line x1={-350} y1={-250} x2={350} y2={-250} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
            {rows.map(([letter, i]) => {
              const ry = -160 + i * 128;
              const t = pop(seg(f, 8 + i * 7, 26 + i * 7));
              return (
                <g key={letter} opacity={clamp01(t * 2)}>
                  <g transform={`translate(-300 ${ry}) scale(${0.62 * t})`}>
                    <path d="M 0 -64 Q 44 -8 44 22 Q 44 62 0 62 Q -44 62 -44 22 Q -44 -8 0 -64 Z"
                      fill={KRP.red} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
                    <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                      fontSize={letter.length > 1 ? 40 : 50} fill={KRP.white}>{letter}</text>
                  </g>
                  <path d={`M -200 ${ry} q 40 -14 80 0 q 40 14 80 0 q 40 -14 80 0 q 30 10 60 0`}
                    fill="none" stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
                  <path d={`M -200 ${ry + 44} q 36 -12 72 0 q 36 12 72 0 q 36 -12 72 0`}
                    fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
                </g>
              );
            })}
          </g>
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="あの分類の原型" size={36} />}
    />
  );
};

// ===== 文#205 用: 当時の日本の軍隊ふうの小物 =====
// 旭日旗・日章旗・階級章・星章など、特定の政治的シンボルは意図的に描かない (炎上を避けるため)。
// 「軍帽・カーキの軍服・脚絆・横一列の整列」の4点だけで時代の雰囲気を出す方針。
// カーキ色は KRP に無いので bronze(茶) と copper(赤茶) と floor(砂色) で代用する。

// 軍帽 (丸い天井 + 帯 + 短いひさし)。Person と同じ (x, y=足元) と s を渡せば頭に乗る。
// 高さの根拠: Person の頭は中心 y-228s・半径 64s なので、頭頂は y-292s。
// 帽子の帯が y-306s〜-280s に来るように原点を y-292s に置いてある (目や眉を隠さない)。
const ArmyCap: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y - 292 * s}) scale(${s})`}>
    {/* 天井 */}
    <path d="M -64 -12 Q -64 -78 0 -80 Q 64 -78 64 -12 Z"
      fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
    {/* 帯 */}
    <rect x={-68} y={-14} width={136} height={26} rx={9} fill={KRP.copper}
      stroke={KRP.ink} strokeWidth={4.5} />
    {/* ひさし */}
    <path d="M -74 12 Q 0 30 74 12 Q 74 26 0 42 Q -74 26 -74 12 Z" fill={KRP.ink} />
    {/* 帽章はただの丸にする (特定の国章・階級章を描かないため) */}
    <circle cx={0} cy={-36} r={11} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// 脚絆 (ゲートル)。Person の脚 (ローカル x=±18 中心・y -58〜-6) にかぶせる布。
const Gaiters: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-18, 18].map((lx) => (
      <g key={lx}>
        <rect x={lx - 15} y={-56} width={30} height={44} rx={6} fill={KRP.floor}
          stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={lx - 15} y1={-48 + i * 13} x2={lx + 15} y2={-44 + i * 13}
            stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        ))}
      </g>
    ))}
  </g>
);

// 文#205 軍隊で適性判定の試み
// 作者フィードバック (2026-10-30):「もう少し日本軍っぽく、イラストを改良して」。
//  ・緑の服 → カーキ (bronze/copper) の軍服にした
//  ・軍帽と脚絆を足し、全員 still で不動の姿勢にして「整列」に見せた
//  ・足元に整列の目安線を引いた
//  ・血液型は、この章でずっと使っている BloodChip を流用 (前は白い札+赤文字で描き分けていた)
// 旗・国章などのシンボルは出していない。
const SceneGuntai: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={615} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        {/* 整列の目安線 */}
        <line x1={760} y1={906} x2={1800} y2={906} stroke={KRP.ink} strokeWidth={5}
          strokeDasharray="22 18" strokeLinecap="round" opacity={0.35} />
        {/* 横一列に並ぶ兵士 (武器は描かない) */}
        {(["A", "B", "O", "AB"] as const).map((letter, i) => {
          const px = 860 + i * 272;
          return (
            <g key={letter}>
              <Person x={px} y={880} s={0.9} f={f} phase={i * 3} cloth={KRP.bronze}
                clothDark={KRP.copper} hair="none" face="normal" still />
              <Gaiters x={px} y={880} s={0.9} />
              <ArmyCap x={px} y={880} s={0.9} />
              {/* 頭上の血液型。帽子の天辺 (y=880-372*0.9=545) に掛からない高さに置く */}
              <BloodChip x={px} y={470} letter={letter} s={0.5}
                t={seg(f, 12 + i * 7, 30 + i * 7)} />
            </g>
          );
        })}
        {/* 判定役の将校 (クリップボード) */}
        <Person x={420} y={880} s={0.96} f={f} phase={8} cloth={KRP.bronze}
          clothDark={KRP.copper} hair="none" face="normal" gaze={[6, 0]} still />
        <Gaiters x={420} y={880} s={0.96} />
        <ArmyCap x={420} y={880} s={0.96} />
        <g transform="translate(552 700) rotate(8)">
          <rect x={-70} y={-95} width={140} height={190} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-30} y={-112} width={60} height={30} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-42} y1={-40} x2={42} y2={-40} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
          <line x1={-42} y1={6} x2={30} y2={6} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
          <line x1={-42} y1={52} x2={42} y2={52} stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="軍隊で適性判定に使う試みまで" size={36} />}
  />
);

// #205 追試が合わない
const SceneTsuishiBatsu: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={616} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        <Person x={500} y={880} f={f} cloth={KRP.blueDeep} glasses face="worried" gaze={[6, -2]} />
        {/* 合わない2枚の結果 */}
        <g transform="translate(1050 560) rotate(-6)">
          <SquigglePaper x={0} y={0} w={300} h={400} lines={0} header />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-100} y={60 - i * 90} width={90 + i * 50} height={40} rx={8}
              fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
        </g>
        <g transform="translate(1480 600) rotate(7)">
          <SquigglePaper x={0} y={0} w={300} h={400} lines={0} header />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-100} y={60 - i * 90} width={190 - i * 60} height={40} rx={8}
              fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
          ))}
        </g>
        {/* 合わない印 */}
        <g transform={`translate(1265 330) scale(${pop(seg(f, 18, 38))})`} stroke={KRP.red}
          strokeWidth={16} strokeLinecap="round">
          <line x1={-55} y1={-55} x2={55} y2={55} />
          <line x1={55} y1={-55} x2={-55} y2={55} />
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="追試を重ねても、結果が合わない" size={36} />}
  />
);

// #206 1933年、学会で否定されて幕
const SceneGakkaiMaku: React.FC<{ f: number }> = ({ f }) => {
  const cl = easeOut(seg(f, 20, 52)); // 幕が閉じる
  return (
    <Sc seed={617} f={f}
      svg={
        <g filter="url(#wobble)">
          <Floor />
          {/* 演台と発表者 */}
          <Person x={960} y={840} s={0.95} f={f} cloth={KRP.grayDark} glasses face="worried" />
          <g transform="translate(960 880)">
            <rect x={-170} y={-200} width={340} height={200} rx={12} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-200} y={-232} width={400} height={44} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          </g>
          {/* 否定の札 */}
          <g transform={`translate(960 330) scale(${pop(seg(f, 6, 26))})`}>
            <rect x={-140} y={-110} width={280} height={220} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
            <g stroke={KRP.red} strokeWidth={18} strokeLinecap="round">
              <line x1={-70} y1={-60} x2={70} y2={60} />
              <line x1={70} y1={-60} x2={-70} y2={60} />
            </g>
          </g>
          {/* 閉じる幕 */}
          <g>
            <rect x={lerp(-680, -40, cl)} y={120} width={680} height={840} fill={KRP.red}
              stroke={KRP.ink} strokeWidth={7} rx={10} />
            <rect x={lerp(1920, 1280, cl)} y={120} width={680} height={840} fill={KRP.red}
              stroke={KRP.ink} strokeWidth={7} rx={10} />
            {[0, 1, 2].map((i) => (
              <g key={i} stroke={KRP.ink} strokeWidth={4} opacity={0.4}>
                <line x1={lerp(-680, -40, cl) + 170 + i * 170} y1={140} x2={lerp(-680, -40, cl) + 170 + i * 170} y2={940} />
                <line x1={lerp(1920, 1280, cl) + 170 + i * 170} y1={140} x2={lerp(1920, 1280, cl) + 170 + i * 170} y2={940} />
              </g>
            ))}
          </g>
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="学会で公式に否定、ブームは幕" size={36} />}
    />
  );
};

// #207 #208 1971年のベストセラーで復活
const Scene1971Book: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 4, 26));
  return (
    <Sc seed={618} f={f}
      svg={
        <g filter="url(#wobble)">
          <Floor />
          <Burst x={760} y={480} r1={260} r2={350} n={12} o={0.6} />
          {/* 大きな本 */}
          <g transform={`translate(760 880) scale(${t1})`}>
            <g transform="translate(0 -250)">
              <rect x={-190} y={-230} width={380} height={480} rx={14} fill={KRP.orange} stroke={KRP.ink} strokeWidth={7} />
              <rect x={-190} y={-230} width={54} height={480} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
              <line x1={-80} y1={-150} x2={140} y2={-150} stroke={KRP.white} strokeWidth={9} strokeLinecap="round" />
              <line x1={-80} y1={-96} x2={100} y2={-96} stroke={KRP.white} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
              <BloodChip x={-20} y={60} letter="A" s={0.55} />
              <BloodChip x={90} y={120} letter="O" s={0.55} />
              {/* 相性の矢印 */}
              <path d="M 20 100 Q 40 70 60 96" fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
            </g>
          </g>
          {/* 作者フィードバック (2026-10-30): 星が「1971年」のスタンプに被って読みにくい。
              スタンプ (html) はだいたい x=412〜800 / y=192〜352 を占めるので、
              星はその枠の外 (下・左) へ逃がした。右の星は元から枠の外なのでそのまま。 */}
          <StarShape x={390} y={560} s={0.6} o={0.9} />
          <StarShape x={1010} y={260} s={0.5} o={0.9} />
          {/* 作家 */}
          <Person x={1420} y={880} f={f} cloth={KRP.grayDark} face="smile" gaze={[-5, -2]} />
          <TagPlate x={1420} y={330} text="作家 能見正比古" size={36} t={seg(f, 14, 32)} />
        </g>
      }
      html={<Stamp x={430} y={210} text="1971年" size={60} />}
    />
  );
};

// #209 テレビと雑誌が飛びつく
const SceneTvZasshi: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={619} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        {/* レトロテレビ (画面の文字がはみ出さないよう大きめ + 文字は画面の中央に整列) */}
        <TvSet x={600} y={600} s={1.15} f={f}
          screen={
            <g>
              <rect x={-162} y={-134} width={324} height={58} rx={10} fill={KRP.red}
                stroke={KRP.ink} strokeWidth={4.5} />
              <text x={0} y={-92} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={34} fill={KRP.white}>けさの血液型</text>
              {["A", "B", "O", "AB"].map((L, i) => (
                <BloodChip key={L} x={-126 + i * 84} y={40} letter={L} s={0.7}
                  t={seg(f, 8 + i * 6, 22 + i * 6)} />
              ))}
            </g>
          }
        />
        {/* 生放送の赤ランプ */}
        <g transform="translate(280 318)">
          <rect x={-86} y={-40} width={172} height={62} rx={12} fill={KRP.ink} />
          <circle cx={-52} cy={-9} r={15} fill={KRP.red}
            opacity={0.45 + 0.55 * Math.abs(Math.sin(f / 11))} />
          <text x={16} y={6} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={34} fill={KRP.white}>生放送</text>
        </g>
        <Burst x={1120} y={560} r1={78} r2={132} n={9} o={0.55} />
        {/* 雑誌の山 */}
        <g transform="translate(1430 880)">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={-180 + (i % 2) * 16} y={-54 - i * 50} width={360} height={50} rx={8}
              fill={i % 2 === 0 ? KRP.blueSoft : KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          ))}
        </g>
        {/* 雑誌の表紙 (血液型の文字をはっきり) */}
        <g transform={`translate(1420 ${420 + Math.sin(f / 15) * 5}) rotate(5)`}>
          <rect x={-160} y={-180} width={320} height={360} rx={12} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={-160} y={-180} width={320} height={86} rx={12} fill={KRP.red}
            stroke={KRP.ink} strokeWidth={6} />
          <text x={0} y={-118} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={44} fill={KRP.white}>大特集</text>
          <BloodChip x={-80} y={16} letter="A" s={0.72} t={seg(f, 12, 26)} />
          <BloodChip x={64} y={16} letter="AB" s={0.72} t={seg(f, 18, 32)} />
          <line x1={-110} y1={116} x2={110} y2={116} stroke={KRP.grayDark} strokeWidth={6}
            strokeLinecap="round" opacity={0.75} />
          <line x1={-110} y1={150} x2={56} y2={150} stroke={KRP.grayDark} strokeWidth={6}
            strokeLinecap="round" opacity={0.6} />
        </g>
        {/* 奥にもう一冊 */}
        <g transform={`translate(1740 ${540 + Math.sin(f / 13 + 1) * 4}) rotate(-11) scale(0.74)`}>
          <rect x={-150} y={-180} width={300} height={360} rx={12} fill={KRP.cream}
            stroke={KRP.ink} strokeWidth={6} />
          <rect x={-150} y={-180} width={300} height={80} rx={12} fill={KRP.orange}
            stroke={KRP.ink} strokeWidth={6} />
          <BloodChip x={0} y={10} letter="O" s={0.8} t={seg(f, 24, 38)} />
          <line x1={-100} y1={120} x2={100} y2={120} stroke={KRP.grayDark} strokeWidth={6}
            strokeLinecap="round" opacity={0.7} />
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="テレビと雑誌が飛びついた" size={36} />}
  />
);

// #210 根付いたのはほぼ東アジアだけ (太平洋中心=日本式の世界地図)
// 国境は描かず、大陸のシルエット + 色のハイライトだけで示す (docs/watashi-motifs-rules.md §5)
const MAP_X0 = 200, MAP_Y0 = 230, MAP_W = 1520, MAP_H = 660;
// 左端 25°W / 中央 155°E。日本はやや中央より左に来る (日本の市販世界地図の並び)
const wx = (lon: number) => MAP_X0 + ((lon + 25 + 720) % 360) * (MAP_W / 360);
const wy = (lat: number) => MAP_Y0 + (78 - lat) * (MAP_H / 136);
const wpoly = (pts: Array<[number, number]>) =>
  "M " + pts.map(([lo, la]) => `${wx(lo).toFixed(1)} ${wy(la).toFixed(1)}`).join(" L ") + " Z";

const EURASIA: Array<[number, number]> = [
  [-9, 36], [-9, 43], [-2, 43], [0, 49], [-5, 50], [2, 51], [4, 53], [8, 54], [8, 57], [5, 58],
  [11, 58], [13, 55], [19, 54], [21, 56], [18, 59], [25, 60], [21, 65], [22, 70], [31, 70],
  [41, 67], [55, 69], [69, 73], [76, 73], [101, 77], [113, 74], [129, 73], [142, 73], [160, 70],
  [170, 69], [180, 66], [178, 62], [170, 60], [163, 58], [156, 51], [142, 54], [141, 46],
  [135, 43], [131, 43], [130, 38], [127, 35], [122, 39], [118, 38], [121, 31], [117, 23],
  [109, 21], [106, 10], [103, 1], [100, 7], [98, 13], [94, 16], [90, 22], [88, 21], [80, 15],
  [77, 8], [73, 20], [68, 24], [61, 25], [57, 25], [57, 20], [52, 16], [45, 12], [43, 13],
  [40, 21], [35, 28], [34, 31], [36, 36], [30, 31], [27, 36], [23, 37], [18, 40], [16, 38],
  [12, 45], [14, 45], [19, 42], [13, 38], [9, 41], [6, 43], [3, 42], [-2, 36],
];
const BRITAIN: Array<[number, number]> = [
  [-5, 50], [-3, 51], [1, 51], [2, 53], [-1, 54], [0, 56], [-2, 58], [-5, 58], [-6, 56],
  [-3, 55], [-5, 54], [-3, 53], [-5, 52],
];
const IRELAND: Array<[number, number]> = [
  [-9.8, 52], [-9.8, 54], [-7, 55], [-6, 54], [-6, 52], [-9, 51],
];
const AFRICA: Array<[number, number]> = [
  [-17, 15], [-16, 21], [-10, 27], [-6, 36], [3, 37], [10, 37], [11, 33], [20, 32], [25, 32],
  [32, 31], [35, 24], [39, 18], [43, 12], [48, 12], [51, 11], [43, 2], [40, -5], [40, -15],
  [36, -21], [33, -26], [28, -32], [25, -34], [18, -35], [18, -30], [14, -23], [12, -17],
  [9, -1], [1, 6], [-5, 5], [-10, 5], [-13, 9],
];
const AUSTRALIA: Array<[number, number]> = [
  [114, -22], [113, -26], [116, -32], [120, -34], [129, -32], [136, -35], [141, -38], [147, -38],
  [150, -35], [153, -28], [146, -19], [142, -11], [137, -12], [131, -12], [126, -14], [122, -17],
];
const NZ_N: Array<[number, number]> = [
  [172.5, -34.5], [176, -37], [178, -38], [175, -41], [173, -39],
];
const NZ_S: Array<[number, number]> = [
  [172, -40.5], [174, -42], [170, -46], [166.5, -46], [167, -44],
];
const N_AMERICA: Array<[number, number]> = [
  [-168, 66], [-166, 60], [-162, 58], [-158, 56], [-152, 59], [-140, 60], [-131, 55], [-124, 48],
  [-124, 40], [-120, 34], [-117, 32], [-110, 23], [-105, 20], [-97, 16], [-92, 15], [-88, 16],
  [-87, 21], [-90, 21], [-94, 18], [-97, 22], [-97, 28], [-93, 30], [-89, 29], [-84, 30],
  [-81, 25], [-80, 32], [-76, 35], [-70, 42], [-67, 45], [-60, 47], [-64, 49], [-57, 51],
  [-64, 60], [-78, 62], [-95, 70], [-85, 70], [-82, 73], [-95, 77], [-110, 77], [-125, 70],
  [-141, 70], [-156, 71], [-166, 68],
];
const S_AMERICA: Array<[number, number]> = [
  [-81, 8], [-77, 8], [-72, 12], [-62, 11], [-52, 5], [-50, 0], [-44, -2], [-35, -5], [-38, -13],
  [-39, -18], [-48, -25], [-54, -34], [-58, -39], [-62, -41], [-65, -45], [-68, -50], [-69, -55],
  [-74, -52], [-73, -45], [-75, -38], [-71, -30], [-70, -23], [-71, -18], [-76, -14], [-81, -6],
  [-80, -2], [-78, 1], [-77, 6],
];
const GREENLAND: Array<[number, number]> = [
  [-73, 76], [-68, 78], [-55, 78], [-40, 78], [-30, 77], [-26, 74], [-26, 70], [-32, 68],
  [-40, 65], [-45, 61], [-50, 63], [-55, 67], [-62, 70], [-70, 73],
];
// ハイライトする3地域 (朝鮮半島は国境を描かず1つの形にする)
const KOREA: Array<[number, number]> = [
  [126.4, 37.8], [126.0, 36.9], [126.5, 36.0], [126.4, 34.6], [127.3, 34.3], [128.5, 34.8],
  [129.4, 35.5], [129.4, 36.8], [129.0, 37.5], [128.4, 38.6], [128.3, 39.5], [127.5, 39.8],
  [127.4, 40.7], [129.7, 41.5], [130.6, 42.3], [129.7, 41.8], [128.0, 41.5], [126.5, 41.0],
  [125.0, 40.0], [124.4, 40.1], [125.2, 39.6], [125.5, 38.6],
];
const TAIWAN: Array<[number, number]> = [
  [121.0, 25.3], [122.0, 25.0], [121.9, 24.0], [121.0, 22.6], [120.6, 22.0], [120.2, 23.0],
  [120.1, 24.2], [120.7, 25.1],
];
const HIGHLIGHT = [JP_HOKKAIDO, JP_HONSHU, JP_SHIKOKU, JP_KYUSHU, KOREA, TAIWAN];

// 拡大図 (インセット) 用の投影
const ipoly = (pts: Array<[number, number]>) =>
  "M " + pts.map(([lo, la]) => `${((lo - 136) * 11 + 35).toFixed(1)} ${((36 - la) * 11 - 25).toFixed(1)}`).join(" L ") + " Z";

const SceneAsiaMap: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 16, 40));
  const t2 = pop(seg(f, 34, 58));
  return (
    <Sc seed={620} f={f}
      svg={
        <g filter="url(#wobble)">
          {/* 海 */}
          <rect x={MAP_X0} y={MAP_Y0} width={MAP_W} height={MAP_H} rx={20}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
          {/* 経緯線 */}
          <g stroke={KRP.white} strokeWidth={3} opacity={0.4}>
            {[-25, 5, 35, 65, 95, 125, 155, -175, -145, -115, -85, -55].map((lo) => (
              <line key={lo} x1={wx(lo)} y1={MAP_Y0 + 4} x2={wx(lo)} y2={MAP_Y0 + MAP_H - 4} />
            ))}
            {[60, 30, -30].map((la) => (
              <line key={la} x1={MAP_X0 + 4} y1={wy(la)} x2={MAP_X0 + MAP_W - 4} y2={wy(la)} />
            ))}
          </g>
          <line x1={MAP_X0 + 4} y1={wy(0)} x2={MAP_X0 + MAP_W - 4} y2={wy(0)}
            stroke={KRP.white} strokeWidth={4.5} strokeDasharray="16 12" opacity={0.75} />
          {/* 大陸のシルエット (国境は描かない) */}
          <g fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round">
            {[EURASIA, AFRICA, N_AMERICA, S_AMERICA, GREENLAND, AUSTRALIA, BRITAIN, IRELAND, NZ_N, NZ_S].map(
              (p, i) => <path key={i} d={wpoly(p)} />,
            )}
          </g>
          {/* 東アジアのハイライト */}
          <g fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" opacity={t1}>
            {HIGHLIGHT.map((p, i) => <path key={i} d={wpoly(p)} />)}
          </g>
          <circle cx={868} cy={436} r={94 + Math.sin(f / 10) * 4} fill="none" stroke={KRP.orange}
            strokeWidth={7} strokeDasharray="18 14" opacity={t1} />
          {/* 引き出し線 */}
          <g stroke={KRP.orange} strokeWidth={5} strokeDasharray="14 11" opacity={t2}>
            <line x1={930} y1={492} x2={1012} y2={556} />
          </g>
          {/* 拡大図 */}
          <g transform={`translate(1200 700) scale(${0.85 + 0.15 * t2})`} opacity={clamp01(t2 * 2)}>
            <rect x={-200} y={-150} width={400} height={300} rx={16} fill={KRP.blueSoft}
              stroke={KRP.ink} strokeWidth={6} />
            <g fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round">
              {HIGHLIGHT.map((p, i) => <path key={i} d={ipoly(p)} />)}
            </g>
          </g>
          <TagPlate x={1200} y={508} text="日本・韓国・台湾" size={32} t={t2} color={KRP.red} />
        </g>
      }
      html={<LabelPill x={960} y={166} centerX text="根付いたのは、ほぼ東アジアだけ" size={34} color={KRP.ink} />}
    />
  );
};

// #211 海外では輸血の話だと思われる
const SceneYuketsu: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={621} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        <Person x={620} y={880} f={f} cloth={KRP.orange} face="smile" gaze={[5, 0]} />
        <Person x={1300} y={880} f={f} phase={4} cloth={KRP.blueDeep} face="surprised" gaze={[-5, 0]} />
        <Bubble x={620} y={400} w={430} h={110} text="血液型は何型?" size={40} tailTo={[640, 560]}
          t={seg(f, 4, 18)} />
        {/* 相手の頭の中 = 輸血バッグ (赤十字マークは描かない) */}
        <g opacity={pop(seg(f, 20, 40))}>
          <circle cx={1390} cy={560} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1420} cy={500} r={19} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={1460} cy={350} rx={210} ry={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <g transform="translate(1430 345)">
            <rect x={-60} y={-80} width={120} height={150} rx={22} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={-20} y={-100} width={40} height={22} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-40} y={-30} width={80} height={56} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 0 -18 Q 10 -4 10 2 Q 10 12 0 12 Q -10 12 -10 2 Q -10 -4 0 -18 Z" fill={KRP.red} />
            <path d="M 60 40 Q 110 60 110 110" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
          <QMark x={1620} y={300} s={0.65} />
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="海外では「輸血の話?」になる" size={36} />}
  />
);

// #212 日米の大調査でも関連なし
const SceneKanrenNashi: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 18, 40));
  return (
    <Sc seed={622} f={f}
      svg={
        <g filter="url(#wobble)">
          <FlagCard kind="japan" x={520} y={330} s={0.9} />
          <FlagCard kind="usa" x={1400} y={330} s={0.9} />
          {/* 調査票の山 (人数の数字は描かない) */}
          {[520, 1400].map((cx) => (
            <g key={cx} transform={`translate(${cx} 640)`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={i} x={-130 + (i % 2) * 10} y={-i * 34} width={260} height={34} rx={7}
                  fill={i % 2 === 0 ? KRP.white : KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
              ))}
              <line x1={-90} y1={16} x2={90} y2={16} stroke={KRP.grayDark} strokeWidth={5} opacity={0.75} />
            </g>
          ))}
          {/* 血液型 ↔ 性格 に × */}
          <g transform="translate(960 790)">
            <g transform="translate(-260 0)">
              <rect x={-130} y={-50} width={260} height={100} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
              <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
                fill={KRP.red}>血液型</text>
            </g>
            <g transform="translate(260 0)">
              <rect x={-130} y={-50} width={260} height={100} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
              <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
                fill={KRP.blueDeep}>性格</text>
            </g>
            <line x1={-120} y1={0} x2={120} y2={0} stroke={KRP.ink} strokeWidth={7} strokeDasharray="16 12" />
            <g transform={`scale(${t1})`} stroke={KRP.red} strokeWidth={15} strokeLinecap="round">
              <line x1={-48} y1={-48} x2={48} y2={48} />
              <line x1={48} y1={-48} x2={-48} y2={48} />
            </g>
          </g>
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="大規模な調査でも、関連は見つからない" size={36} />}
    />
  );
};

// #213 #214 「当たっている気がする」は根拠より強い (天秤)
const SceneKigasuru: React.FC<{ f: number }> = ({ f }) => {
  const tilt = easeOut(seg(f, 10, 44)) * 11; // 天秤が傾く
  const rad = (tilt * Math.PI) / 180;
  const armL = 430;
  const lx = 960 - Math.cos(rad) * armL;
  const ly = 430 + Math.sin(rad) * armL;
  const rx = 960 + Math.cos(rad) * armL;
  const ry = 430 - Math.sin(rad) * armL;
  return (
    <Sc seed={623} f={f}
      svg={
        <g filter="url(#wobble)">
          <Floor />
          {/* 支柱 */}
          <polygon points="920,880 1000,880 975,440 945,440" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={960} cy={430} r={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
          {/* 腕 */}
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
          {/* 左皿 (重い): 当たっている気がする */}
          <g transform={`translate(${lx} ${ly})`}>
            <line x1={0} y1={0} x2={0} y2={90} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -150 90 Q 0 170 150 90 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
            <g transform="translate(0 40)">
              <path d="M 0 36 C -58 -10 -46 -66 0 -38 C 46 -66 58 -10 0 36 Z"
                fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round"
                transform="translate(0 -58) scale(1.5)" />
            </g>
            <TagPlate x={0} y={226} text="当たっている気がする" size={32} />
          </g>
          {/* 右皿 (軽い): 根拠 */}
          <g transform={`translate(${rx} ${ry})`}>
            <line x1={0} y1={0} x2={0} y2={90} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -150 90 Q 0 170 150 90 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
            <g transform="translate(0 56)">
              <rect x={-54} y={-66} width={108} height={66} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <line x1={-30} y1={-44} x2={30} y2={-44} stroke={KRP.grayDark} strokeWidth={4.5} opacity={0.8} />
              <line x1={-30} y1={-22} x2={18} y2={-22} stroke={KRP.grayDark} strokeWidth={4.5} opacity={0.8} />
            </g>
            <TagPlate x={0} y={226} text="根拠" size={32} color={KRP.grayDark} />
          </g>
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="それでも、やめられない" size={36} />}
    />
  );
};

// ===================================================================
// 第12章 全員に、同じ診断書 (#215〜#237)
// ===================================================================

// #215 章扉 (扇形に並んだ診断書)
const SceneCh12Door: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={624} f={f}
    svg={
      <g filter="url(#wobble)">
        <ShindanSho x={330} y={560} rot={-16} s={1.05} t={seg(f, 4, 20)} />
        <ShindanSho x={500} y={520} rot={0} s={1.1} t={seg(f, 12, 28)} />
        <ShindanSho x={670} y={560} rot={16} s={1.05} t={seg(f, 20, 36)} />
      </g>
    }
    html={<ChapterTitle num={12} title="全員に、同じ診断書" t={seg(f, 8, 30)} />}
  />
);

// #216 なぜ「当たっている」と感じるのか
const SceneNazeQ: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={625} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        <Person x={840} y={880} f={f} cloth={KRP.blueDeep} face="normal" gaze={[5, 3]} />
        <ShindanSho x={1150} y={660} rot={6} s={0.95} t={seg(f, 4, 18)} />
        <QMark x={1420} y={400} s={1.25} o={pop(seg(f, 14, 34))} />
        <QMark x={600} y={360} s={0.7} o={pop(seg(f, 24, 44)) * 0.85} />
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="なぜ、根拠がなくても当たっていると感じる?" size={34} />}
  />
);

// #217 #218 1948年、心理学者バートラム・フォア
const SceneForer: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={626} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        {/* スポットライト (フラットな光) */}
        <polygon points="960,0 700,880 1220,880" fill={KRP.yellow} opacity={0.3} />
        <Person x={960} y={880} s={1.1} f={f} cloth={KRP.grayDark} glasses face="smile" />
        {/* 蝶ネクタイ */}
        <g transform="translate(960 880) scale(1.1)">
          <polygon points="-26,-158 0,-146 -26,-134" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
          <polygon points="26,-158 0,-146 26,-134" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        <TagPlate x={960} y={280} text="心理学者 バートラム・フォア" size={40} t={seg(f, 8, 26)} />
        <QMark x={1360} y={460} s={0.8} o={0.9} />
      </g>
    }
  />
);

// #219 学生たちに性格テスト (39の数字は絵に入れない)
const SceneTest39: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={627} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor y={900} />
        {/* 教室: 2列x4人の学生が書いている */}
        {[0, 1, 2, 3].map((c) =>
          [0, 1].map((r) => {
            const px = 640 + c * 330 - r * 90;
            const py = 700 + r * 190;
            const cloths = [KRP.blueDeep, KRP.green, KRP.orange, KRP.grayDark];
            return (
              <g key={`${c}-${r}`}>
                <Person x={px} y={py} s={0.62} f={f} phase={c * 2 + r * 5}
                  cloth={cloths[(c + r) % 4]} face="normal" gaze={[0, 6]} />
                <rect x={px - 95} y={py - 108} width={190} height={108} rx={10}
                  fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
                <rect x={px - 60} y={py - 124} width={120} height={24} rx={6}
                  fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              </g>
            );
          }),
        )}
        {/* 前に立つフォア */}
        <Person x={250} y={840} s={0.9} f={f} phase={9} cloth={KRP.grayDark} glasses face="smile" gaze={[6, 0]} />
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="学生たちに性格テスト" size={36} />}
  />
);

// #220 「あなた専用の診断結果です」と手渡し
const SceneTewatashi: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={628} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        <Person x={480} y={880} f={f} cloth={KRP.grayDark} glasses face="smile" gaze={[6, 0]} />
        <ShindanSho x={760} y={660} rot={8} s={0.72} t={seg(f, 4, 18)} />
        {/* 受け取る学生の列 */}
        <Person x={1060} y={880} f={f} phase={2} cloth={KRP.blueDeep} face="smile" gaze={[-6, 0]} />
        <Person x={1360} y={880} s={0.94} f={f} phase={5} cloth={KRP.green} face="normal" gaze={[-6, 0]} />
        <Person x={1640} y={880} s={0.88} f={f} phase={7} cloth={KRP.orange} face="normal" gaze={[-6, 0]} />
        <Bubble x={620} y={340} w={560} h={110} text="あなた専用の診断結果です" size={38}
          tailTo={[520, 520]} t={seg(f, 10, 26)} />
      </g>
    }
  />
);

// #221 どれだけ当たっているか採点してもらう
const SceneSaiten: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 10, 32));
  return (
    <Sc seed={629} f={f}
      svg={
        <g filter="url(#wobble)">
          <ShindanSho x={520} y={560} rot={-5} s={1.15} t={seg(f, 2, 16)} />
          {/* 採点カード (0〜5の目盛り) */}
          <g transform={`translate(1230 560) scale(${t1})`}>
            <rect x={-360} y={-220} width={720} height={440} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
            <text x={0} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
              fill={KRP.ink}>どれだけ当たってる?</text>
            <line x1={-280} y1={20} x2={280} y2={20} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const px = -280 + i * 112;
              return (
                <g key={i}>
                  <line x1={px} y1={4} x2={px} y2={36} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
                  <text x={px} y={96} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42}
                    fill={KRP.ink}>{i}</text>
                </g>
              );
            })}
            <text x={330} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34}
              fill={KRP.grayDark}>点</text>
            {/* えんぴつが高得点側に丸をつける */}
            <circle cx={-280 + 4.4 * 112} cy={20} r={44} fill="none" stroke={KRP.red} strokeWidth={7}
              opacity={seg(f, 26, 40)} />
            <g transform={`translate(${lerp(120, 236, easeOut(seg(f, 20, 40)))} ${lerp(-80, -34, easeOut(seg(f, 20, 40)))}) rotate(40)`}>
              <rect x={-14} y={-90} width={28} height={110} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
              <polygon points="-14,20 14,20 0,52" fill="#F6D7B8" stroke={KRP.ink} strokeWidth={4} />
              <polygon points="-5,38 5,38 0,52" fill={KRP.ink} />
            </g>
          </g>
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="当たり具合を採点してもらう" size={36} />}
    />
  );
};

// #222 平均4.26点 (軸・目盛り・単位・数値をきちんと描く)
const Scene426Graph: React.FC<{ f: number }> = ({ f }) => {
  const ax0 = -480, ax1 = 480; // 0点〜5点のx
  const vx = (v: number) => ax0 + ((ax1 - ax0) * v) / 5;
  const grow = easeOut(seg(f, 8, 44));
  const barEnd = vx(4.26 * grow);
  return (
    <Sc seed={630} f={f}
      svg={
        <g filter="url(#wobble)">
          <g transform="translate(960 600)">
            <rect x={-600} y={-300} width={1200} height={560} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
            <text x={0} y={-212} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46}
              fill={KRP.ink}>「当たってる」採点の平均</text>
            {/* 軸 */}
            <line x1={ax0} y1={120} x2={ax1 + 40} y2={120} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i}>
                <line x1={vx(i)} y1={120} x2={vx(i)} y2={146} stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" />
                <text x={vx(i)} y={198} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
                  fill={KRP.ink}>{i}</text>
              </g>
            ))}
            <text x={ax1 + 88} y={198} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34}
              fill={KRP.grayDark}>(点)</text>
            {/* 横棒 */}
            <rect x={ax0} y={0} width={Math.max(barEnd - ax0, 2)} height={84} rx={10}
              fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />
            {/* 数値ラベル */}
            <g opacity={seg(f, 36, 50)}>
              <line x1={vx(4.26)} y1={-30} x2={vx(4.26)} y2={120} stroke={KRP.red} strokeWidth={5}
                strokeDasharray="12 10" />
              <g transform={`translate(${vx(4.26)} -90) scale(${0.85 + 0.15 * pop(seg(f, 36, 54))})`}>
                <rect x={-180} y={-52} width={360} height={104} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
                <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56}
                  fill={KRP.white}>平均 4.26点</text>
              </g>
            </g>
            <text x={-430} y={-110} fontFamily={FONT} fontWeight={800} fontSize={34}
              fill={KRP.grayDark}>5点満点</text>
          </g>
        </g>
      }
    />
  );
};

// #223 「すごく当たってる」の大合唱
const SceneDaigassho: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={631} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        {[0, 1, 2].map((i) => {
          const px = 480 + i * 480;
          return (
            <g key={i}>
              <Person x={px} y={880} s={0.95} f={f} phase={i * 3}
                cloth={[KRP.blueDeep, KRP.green, KRP.orange][i]} face="smile" gaze={[0, -4]} />
              <Bubble x={px} y={360} w={440} h={104} text="すごく当たってる!" size={40}
                tailTo={[px, 530]} t={seg(f, 6 + i * 8, 22 + i * 8)} />
            </g>
          );
        })}
      </g>
    }
  />
);

// #224 ですが、タネがありました (暗転サスペンス)
const SceneTane: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={632} f={f} dark
    svg={
      <g>
        <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={0.62} />
        <g filter="url(#wobble)">
          <ellipse cx={960} cy={600} rx={420} ry={330} fill={KRP.yellow} opacity={0.28} />
          <polygon points="960,60 700,600 1220,600" fill={KRP.yellow} opacity={0.2} />
          <ShindanSho x={960} y={600} s={1.2} t={seg(f, 6, 24)} />
          <QMark x={1280} y={380} s={0.9} color={KRP.yellow} o={pop(seg(f, 20, 40))} />
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="ですが、タネがありました" size={36} />}
  />
);

// #225 配られた診断結果は、全員同じ文章
const SceneZeninOnaji: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={633} f={f}
    svg={
      <g filter="url(#wobble)">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <ShindanSho key={`${r}-${c}`} x={560 + c * 400} y={330 + r * 270} s={0.56}
              t={seg(f, 4 + (r * 3 + c) * 4, 16 + (r * 3 + c) * 4)} />
          )),
        )}
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => (
            <text key={`eq-${r}-${c}`} x={760 + c * 400} y={352 + r * 270} textAnchor="middle"
              fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.orange}
              stroke={KRP.ink} strokeWidth={2.5} opacity={seg(f, 30, 46)}>=</text>
          )),
        )}
      </g>
    }
    html={<Stamp x={1430} y={430} text="全員同じ" size={70} />}
  />
);

// #226 星占いの本からの切り貼り
const SceneKirihari: React.FC<{ f: number }> = ({ f }) => {
  const snip = Math.sin(f / 5) * 12;
  return (
    <Sc seed={634} f={f}
      svg={
        <g filter="url(#wobble)">
          {/* 開いた星占い本 */}
          <g transform="translate(560 620)">
            <path d="M -300 -180 Q -150 -220 0 -180 L 0 200 Q -150 160 -300 200 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <path d="M 300 -180 Q 150 -220 0 -180 L 0 200 Q 150 160 300 200 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <StarShape x={-150} y={-80} s={0.6} />
            <line x1={-240} y1={0} x2={-60} y2={0} stroke={KRP.grayDark} strokeWidth={5} opacity={0.75} />
            <line x1={-240} y1={60} x2={-80} y2={60} stroke={KRP.grayDark} strokeWidth={5} opacity={0.75} />
            <line x1={60} y1={-60} x2={240} y2={-60} stroke={KRP.grayDark} strokeWidth={5} opacity={0.75} />
            <line x1={60} y1={0} x2={220} y2={0} stroke={KRP.grayDark} strokeWidth={5} opacity={0.75} />
            {/* 切り取られた穴 */}
            <rect x={60} y={40} width={180} height={56} rx={6} fill={KRP.cream}
              stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 8" />
          </g>
          {/* ハサミ */}
          <g transform="translate(900 380) rotate(-20)">
            <g transform={`rotate(${snip})`}>
              <path d="M 0 0 L 120 -34" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
              <circle cx={-34} cy={22} r={24} fill="none" stroke={KRP.ink} strokeWidth={9} />
            </g>
            <g transform={`rotate(${-snip})`}>
              <path d="M 0 0 L 120 34" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
              <circle cx={-34} cy={-22} r={24} fill="none" stroke={KRP.ink} strokeWidth={9} />
            </g>
            <circle cx={0} cy={0} r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 切り抜き片が診断書へ */}
          {([[1120, 500, -12], [1200, 620, 8], [1130, 740, -6]] as Array<[number, number, number]>).map(([px, py, rot], i) => (
            <g key={i} transform={`translate(${px} ${py + Math.sin(f / 9 + i * 2) * 5}) rotate(${rot})`}>
              <rect x={-90} y={-26} width={180} height={52} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <path d="M -60 0 q 20 -10 40 0 q 20 10 40 0" fill="none" stroke={KRP.grayDark}
                strokeWidth={4.5} strokeLinecap="round" opacity={0.8} />
            </g>
          ))}
          <ShindanSho x={1540} y={620} rot={5} s={1.05} t={seg(f, 4, 18)} />
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="中身は、星占いの本などから切り貼り" size={36} />}
    />
  );
};

// #227 #228 ほぼ全員が「これは私だ」
const SceneKoreWatashi: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={635} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        {[0, 1].map((i) => {
          const px = 640 + i * 640;
          return (
            <g key={i}>
              <Person x={px} y={880} f={f} phase={i * 4} cloth={i === 0 ? KRP.orange : KRP.blueDeep}
                face="smile" gaze={[0, 4]} />
              <ShindanSho x={px} y={805} rot={i === 0 ? -4 : 5} s={0.5} t={seg(f, 4, 18)} />
            </g>
          );
        })}
        <Bubble x={960} y={330} w={420} h={110} text="これは私だ!" size={44} t={seg(f, 12, 28)} />
        {/* ハート */}
        {([[430, 480, 0.8], [1180, 430, 0.65], [1520, 520, 0.9]] as Array<[number, number, number]>).map(([px, py, ps], i) => (
          <g key={i} transform={`translate(${px} ${py + Math.sin(f / 8 + i * 2) * 6}) scale(${ps * pop(seg(f, 16 + i * 6, 32 + i * 6))})`}>
            <path d="M 0 36 C -58 -10 -46 -66 0 -38 C 46 -66 58 -10 0 36 Z"
              fill={KRP.red} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          </g>
        ))}
      </g>
    }
  />
);

// #229 「バーナム効果」と命名
const SceneBarnumName: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 6, 30));
  return (
    <Sc seed={636} f={f}
      svg={
        <g filter="url(#wobble)">
          <Burst x={960} y={540} r1={340} r2={440} n={14} o={0.5} />
          {/* 飾りの旗 */}
          <path d="M 300 220 Q 960 330 1620 220" fill="none" stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const t = i / 6;
            const px = 300 + (1620 - 300) * t;
            const py = 220 + Math.sin(Math.PI * t) * 108;
            return (
              <polygon key={i} points={`${px - 26},${py} ${px + 26},${py} ${px},${py + 44}`}
                fill={[KRP.red, KRP.yellow, KRP.blueDeep, KRP.green][i % 4]} stroke={KRP.ink} strokeWidth={4} />
            );
          })}
          {/* 命名プレート */}
          <g transform={`translate(960 560) scale(${t1})`}>
            <rect x={-440} y={-150} width={880} height={300} rx={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
            <rect x={-410} y={-120} width={820} height={240} rx={14} fill="none" stroke={KRP.orange} strokeWidth={6} />
            <text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88}
              fill={KRP.ink}>バーナム効果</text>
            <text x={0} y={76} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38}
              fill={KRP.grayDark}>のちに名付けられた心の働き</text>
          </g>
          <StarShape x={420} y={760} s={0.6} o={0.9} />
          <StarShape x={1500} y={780} s={0.7} o={0.9} />
        </g>
      }
    />
  );
};

// ===== 効き目のコツ3つ: #229 (アイコンだけ) と #230 (文字を1つずつ開示) で共用 =====
// 丸数字は使わない (数字を増やさない約束)。アイコンだけで「3つある」と伝える。
const KOTSU_ROWS: Array<{ label: string; icon: React.ReactNode }> = [
  {
    label: "誰にでも当てはまる",
    icon: (
      <g>
        <circle cx={-26} cy={0} r={22} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={10} cy={-8} r={22} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={38} cy={6} r={22} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
    ),
  },
  {
    label: "内容が好意的",
    icon: (
      <path d="M 0 30 C -46 -8 -36 -54 0 -28 C 36 -54 46 -8 0 30 Z"
        fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    ),
  },
  {
    label: "両面がある",
    icon: (
      <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1={-40} y1={0} x2={40} y2={0} />
        <polyline points="-22,-20 -44,0 -22,20" />
        <polyline points="22,-20 44,0 22,20" />
      </g>
    ),
  },
];
const KOTSU_ROW_Y = (i: number) => -86 + i * 150; // カード中心(960,580)からの相対y

// カードの枠と見出し (両シーン共通。中身は children)
const KotsuCard: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g transform={`translate(960 ${580 + Math.sin(f / 26) * 3})`}>
    <rect x={-520} y={-320} width={1040} height={640} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
    <text x={0} y={-226} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52}
      fill={KRP.ink}>効き目のコツ</text>
    <line x1={-300} y1={-186} x2={300} y2={-186} stroke={KRP.orange} strokeWidth={7} strokeLinecap="round" />
    {children}
  </g>
);

// #229 「効き目のコツは、3つ。」= アイコンだけ出す (答えはまだ見せない)
const SceneKotsu3: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={637} f={f}
    svg={
      <g filter="url(#wobble)">
        <KotsuCard f={f}>
          {KOTSU_ROWS.map((row, i) => {
            const t = pop(seg(f, 8 + i * 12, 28 + i * 12));
            if (t <= 0) return null;
            return (
              <g key={row.label} transform={`translate(0 ${KOTSU_ROW_Y(i)})`} opacity={clamp01(t * 2)}>
                <g transform={`translate(-360 0) scale(${t})`}>
                  <circle r={58} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
                  {row.icon}
                </g>
                {/* 答えの入る場所 (まだ空白。点線の枠でじらす) */}
                <rect x={-250} y={-34} width={660} height={68} rx={14} fill={KRP.cream}
                  stroke={KRP.grayDark} strokeWidth={4.5} strokeDasharray="16 12" opacity={0.75}
                  strokeDashoffset={-f * 0.7} />
              </g>
            );
          })}
        </KotsuCard>
      </g>
    }
  />
);

// #230 「誰にでも当てはまる/好意的/両面ある」= 読み上げに合わせて1つずつ文字が出る
// 尺 6.368秒 ≒ 191フレーム。だいたい3等分 (f=6 / 68 / 130 から出し始める)
const SceneKotsu3Reveal: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={657} f={f}
    svg={
      <g>
        {/* この文だけ背景を変える (種明かしの山場) */}
        <rect x={0} y={0} width={W} height={H} fill={KRP.blueSoft} />
        <rect x={0} y={0} width={W} height={H} fill={KRP.white} opacity={0.3} />
        {/* うっすら動く斜めストライプ */}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-200 + i * 170 + ((f * 0.5) % 170)} y1={-40}
            x2={-520 + i * 170 + ((f * 0.5) % 170)} y2={H + 40}
            stroke={KRP.blue} strokeWidth={26} opacity={0.14} />
        ))}
        <g filter="url(#wobble)">
          <KotsuCard f={f}>
            {KOTSU_ROWS.map((row, i) => {
              const t0 = 6 + i * 62;
              const t = pop(seg(f, t0, t0 + 18));
              const lit = f >= t0;
              return (
                <g key={row.label} transform={`translate(0 ${KOTSU_ROW_Y(i)})`}>
                  {/* アイコンは最初から出ている (前のシーンからの続き) */}
                  <g transform={`translate(-360 0) scale(${lit ? 1 + 0.08 * (1 - clamp01(t)) : 1})`}
                    opacity={lit ? 1 : 0.4}>
                    <circle r={58} fill={lit ? KRP.yellow : KRP.cream} stroke={KRP.ink} strokeWidth={5} />
                    {row.icon}
                  </g>
                  {/* 文字が出てくる */}
                  {t > 0 && (
                    <g opacity={clamp01(t * 2)} transform={`translate(${(1 - clamp01(t)) * 26} 0)`}>
                      <rect x={-250} y={-34} width={660} height={68} rx={14} fill={KRP.cream}
                        stroke={KRP.ink} strokeWidth={4.5} />
                      <text x={-226} y={16} fontFamily={FONT} fontWeight={900} fontSize={46}
                        fill={KRP.ink}>{row.label}こと</text>
                    </g>
                  )}
                  {!lit && (
                    <rect x={-250} y={-34} width={660} height={68} rx={14} fill={KRP.cream}
                      stroke={KRP.grayDark} strokeWidth={4.5} strokeDasharray="16 12" opacity={0.6}
                      strokeDashoffset={-f * 0.7} />
                  )}
                </g>
              );
            })}
          </KotsuCard>
        </g>
      </g>
    }
  />
);

// ===== 冒頭 (#4/#5) の診断シーンと同じ見た目 =====
// WatashiB1.tsx の SceneShindanPaper と、背景の紫・上の暗幕・診断書の位置 (480,560 s=2.0)・
// 点線のひもづけ線 (770→1000)・オレンジの丸 (1060)・名札 を揃える。
// 視聴者が「これ、最初に見たやつだ」とすぐ分かるようにするため、数値も B1 と同じにしてある。
const PurpleStage: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={PUR.deep} />
    <rect x={0} y={0} width={W} height={H} fill={PUR.mid} opacity={0.4} />
    <ellipse cx={960} cy={540} rx={820} ry={560} fill={PUR.glow} opacity={0.26} />
    <ellipse cx={960} cy={540} rx={520} ry={380} fill={PUR.glow} opacity={0.24} />
    {/* 上端の暗幕のドレープ (ゆっくり揺れる) */}
    <g fill={PUR.mid} stroke={KRP.ink} strokeWidth={4} opacity={0.9}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i}
          d={`M ${i * 340 - 60} -10 Q ${i * 340 + 110} ${96 + (i % 2) * 22 + Math.sin(f / 22 + i) * 6} ${i * 340 + 280} -10 Z`} />
      ))}
    </g>
  </g>
);

// 診断書 + 右側の箇条書き (B1 と同じ組み方)
const ShindanRows: React.FC<{
  f: number; rows: Array<{ y: number; x: number; text: string; fill: string; at: number }>;
}> = ({ f, rows }) => {
  const sway = Math.sin(f / 26) * 1.5;
  return (
    <g>
      {/* 紙の上端が上のラベル (下端およそ y=231) にかぶらないよう、少し小さく・少し下げてある。
          下端は y=886 なので字幕にもかからない。 */}
      <g transform={`rotate(${sway} 480 580)`}>
        <ShindanSho x={480} y={580} s={1.8} rot={-3} t={seg(f, 2, 20)} />
      </g>
      {rows.map((r, i) => (
        <g key={i}>
          <g opacity={seg(f, r.at, r.at + 12)}>
            <line x1={770} y1={r.y} x2={1000} y2={r.y} stroke={PUR.glow} strokeWidth={4.5}
              strokeDasharray="10 13" strokeLinecap="round" strokeDashoffset={-f * 0.6} />
          </g>
          <g transform={`translate(1060 ${r.y}) scale(${pop(seg(f, r.at, r.at + 14))})`}>
            <circle cx={0} cy={0} r={16} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
          <TagPlate x={r.x} y={r.y} text={r.text} size={40} t={seg(f, r.at + 4, r.at + 20)} fill={r.fill} />
        </g>
      ))}
    </g>
  );
};

// 文#233 「しっかりして見えるけど、本当は心配性」= 冒頭の診断書の一文を抜き出して見せる
// 作者フィードバック (2026-10-30):「オレンジのテロップと水色のテロップの縦の位置が合ってない」
//   → 続けて「横並びじゃなくて縦に並びたいけど、縦のラインがずれてたから指摘した」。
// つまり直すのは **並べ方ではなく x (縦のライン)** のほう。
// もとは y=420 / 700 の上下2段で、x が 1330 / 1300 / 1250 とバラバラだったのがズレの正体。
// → 上下2段のまま、札3枚の中心 x を RYOUMEN_X にそろえた。
//   ※一度「横1行」に並べ替えてしまったが、作者の意図と違うので縦に戻してある。
//     ここを横並びにし直さないこと。
// 紙 (診断書) → 札 のつなぎ (点線＋オレンジの丸) は ShindanRows の rows に渡すと
// B1 と同じ作法で自動的に描かれるので、2枚はそれを使う。「けど」はつなぎ不要なので手置き。
// 揃えるのは「札の左はし」。TagPlate は中心 x を受け取るので、
// 左はし RYOUMEN_LEFT から幅の半分だけ右へずらした中心を計算して渡す。
// 幅は TagPlate の計算式 (文字数*size+44) と同じ式で出すこと。
const RYOUMEN_LEFT = 1140; // 札の左はしの縦ライン (オレンジの丸 x=1060 のすぐ右)
const plateX = (text: string, size: number) => RYOUMEN_LEFT + (text.length * size + 44) / 2;
const RyoumenArt: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* ShindanRows の札は size=40 固定。
        9文字→404px / 6文字→284px。左はしはどちらも 1140 にそろう */}
    <ShindanRows f={f} rows={[
      { y: 420, x: plateX("しっかりして見える", 40), text: "しっかりして見える", fill: KRP.yellow, at: 6 },
      { y: 700, x: plateX("本当は心配性", 40), text: "本当は心配性", fill: KRP.blueSoft, at: 36 },
    ]} />
    {/* つなぎの「けど」(2枚のちょうど真ん中。左はしは上下と同じライン) */}
    <TagPlate x={plateX("けど", 30)} y={560} text="けど" size={30} color={KRP.red} t={seg(f, 26, 42)} />
  </g>
);
const SceneRyoumen: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={638} f={f} dark
    svg={<g><PurpleStage f={f} /><g filter="url(#wobble)"><RyoumenArt f={f} /></g></g>}
    html={<LabelPill x={960} y={170} centerX text="「しっかりして見えるけど、本当は心配性」" size={34} />}
  />
);

// 文#234 ……どこかで聞きましたね
// 作者フィードバック (2026-10-30):「核心の部分だから、それにふさわしいイラストと演出で」。
// もとは汎用の大きな「?」を1個置いただけだったので、専用の絵に描き直した。
// 作りは「既視感 (デジャヴ) の回廊」:
//  ・背景は #233 と同じ PurpleStage (冒頭 #4/#5 の診断シーンとも地続きに見せる)
//  ・直前の文で出した "同じ一文" の札が、奥へ小さくなりながら5枚重なる = 「前にも見た」
//  ・四隅を細い線でつないで一点透視にし、いちばん奥はオレンジのぼんやりした光にする
//  ・札は手前 → 奥の順に増えるので、記憶をさかのぼっていく感じになる
//  ・「?」は消さずに、いちばん奥の光の中へ小さく置いた (「どこで聞いたんだっけ?」の意味)
//  ・冒頭の診断書そのものはここでは出さない。種明かしは次の文#235 の仕事なので先にバラさない
const DOKOKA_LINE = "しっかりして見えるけど、本当は心配性"; // 18文字
const DOKOKA_VPX = 960; // 一点透視の消失点
const DOKOKA_VPY = 356;
const DOKOKA_FRONT_Y = 726; // いちばん手前の札の中心y
// k=0 が手前。奥へ行くほど小さく・薄くなる
const dokokaCard = (k: number) => {
  const s = 1 - 0.185 * k;
  return {
    s,
    cy: DOKOKA_VPY + (DOKOKA_FRONT_Y - DOKOKA_VPY) * s,
    hw: 620 * s, // 札の半分の幅
    hh: 78 * s,  // 札の半分の高さ
  };
};
const SceneDokokaQ: React.FC<{ f: number }> = ({ f }) => {
  const front = dokokaCard(0);
  const back = dokokaCard(4);
  return (
    <Sc seed={639} f={f} dark
      svg={
        <g>
          <PurpleStage f={f} />
          <g filter="url(#wobble)">
            {/* いちばん奥のぼんやりした光 (「どこか」の在りか) */}
            <ellipse cx={DOKOKA_VPX} cy={420} rx={360} ry={172} fill={KRP.orange}
              opacity={0.16 * seg(f, 34, 56)} />
            {/* 奥へ向かう一点透視の線 (手前の札の四隅 → いちばん奥の札の四隅) */}
            <g opacity={0.5 * seg(f, 42, 58)} stroke={PUR.glow} strokeWidth={3.5}
              strokeLinecap="round">
              {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as Array<[number, number]>).map(([sx, sy], i) => (
                <line key={i}
                  x1={DOKOKA_VPX + sx * front.hw} y1={front.cy + sy * front.hh}
                  x2={DOKOKA_VPX + sx * back.hw} y2={back.cy + sy * back.hh} />
              ))}
            </g>
            {/* 同じ一文の札が奥へ重なる (奥 → 手前の順に描いて手前を上に重ねる) */}
            {[4, 3, 2, 1, 0].map((k) => {
              const c = dokokaCard(k);
              const t = pop(seg(f, 2 + k * 9, 18 + k * 9));
              if (t <= 0) return null;
              const op = [1, 0.5, 0.35, 0.24, 0.15][k] * t;
              return (
                <g key={k} opacity={op}>
                  <rect x={DOKOKA_VPX - c.hw} y={c.cy - c.hh} width={c.hw * 2} height={c.hh * 2}
                    rx={22 * c.s} fill={KRP.white} stroke={KRP.ink} strokeWidth={6 * c.s} />
                  <text x={DOKOKA_VPX} y={c.cy + 48 * c.s * 0.36} textAnchor="middle"
                    fontFamily={FONT} fontWeight={900} fontSize={48 * c.s} fill={KRP.ink}>
                    {DOKOKA_LINE}
                  </text>
                  {/* 手前の1枚だけ、#233 と同じ色で両面の2語に下線を引く
                      (18文字・48px なので左端は 960-18*48/2=528。9文字目まで / 13〜18文字目) */}
                  {k === 0 && (
                    <g strokeWidth={7} strokeLinecap="round" opacity={0.95}>
                      <line x1={528} y1={c.cy + 36} x2={960} y2={c.cy + 36} stroke={KRP.yellow} />
                      <line x1={1104} y1={c.cy + 36} x2={1392} y2={c.cy + 36} stroke={KRP.blueSoft} />
                    </g>
                  )}
                </g>
              );
            })}
            {/* いちばん奥の「?」=「どこで聞いたんだっけ?」 */}
            <QMark x={DOKOKA_VPX} y={396} s={0.62} o={pop(seg(f, 48, 66))} />
          </g>
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="……どこかで聞きましたね" size={36} />}
    />
  );
};

// #233 この動画の冒頭で渡した診断文 (冒頭 #4/#5 とまったく同じ紙・同じ3行で回想)
const SceneRecallMachine: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={640} f={f} dark
    svg={
      <g>
        <PurpleStage f={f} />
        <g filter="url(#wobble)">
          <ShindanRows f={f} rows={[
            { y: 360, x: 1330, text: "しっかりしている", fill: KRP.yellow, at: 10 },
            { y: 560, x: 1230, text: "心配性", fill: KRP.blueSoft, at: 28 },
            { y: 760, x: 1290, text: "自分のペース", fill: KRP.white, at: 46 },
          ]} />
          {/* 紙を吐き出した本人 (すみに小さく) */}
          <UranaiMachine x={1726} y={968} s={0.42} f={f} />
          {/* 回想の枠 */}
          <rect x={60} y={128} width={1800} height={872} rx={30} fill="none" stroke={KRP.white}
            strokeWidth={8} strokeDasharray="34 22" opacity={0.85} strokeDashoffset={-f * 0.8} />
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="この動画の冒頭で、あなたに渡した診断文" size={34} />}
  />
);

// #235 あれは誰にでも当てはまる文章でした (種明かし)
const SceneTanemeakashi: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={641} f={f}
    svg={
      <g>
        <rect x={0} y={0} width={W} height={H} fill={PUR.deep} opacity={0.34} />
        <g filter="url(#wobble)">
          <ellipse cx={640} cy={560} rx={560} ry={480} fill={PUR.glow} opacity={0.32} />
          <UranaiMachine x={640} y={950} s={0.8} f={f} />
          {/* 吐き出される同じ診断書たち */}
          <ShindanSho x={1060} y={760} rot={-10} s={0.62} t={seg(f, 4, 18)} />
          <ShindanSho x={1270} y={620} rot={6} s={0.66} t={seg(f, 12, 26)} />
          <ShindanSho x={1500} y={740} rot={16} s={0.6} t={seg(f, 20, 34)} />
          <ShindanSho x={1370} y={380} rot={-6} s={0.58} t={seg(f, 28, 42)} />
          <ShindanSho x={1620} y={460} rot={10} s={0.54} t={seg(f, 36, 50)} />
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="誰にでも当てはまる、お手本の文章" size={36} />}
  />
);

// #236 あなたが単純だからではない (やさしい着地)
const SceneKawaiiChakuchi: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={642} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        <Person x={960} y={880} s={1.05} f={f} cloth={KRP.orange} face="smile" gaze={[0, 4]} />
        <ShindanSho x={960} y={800} rot={-3} s={0.5} t={seg(f, 2, 14)} />
        {([[620, 440, 0.8], [1300, 420, 0.9], [760, 280, 0.6], [1170, 250, 0.65]] as Array<[number, number, number]>).map(([px, py, ps], i) => (
          <g key={i} transform={`translate(${px} ${py + Math.sin(f / 9 + i * 1.7) * 6}) scale(${ps * pop(seg(f, 8 + i * 7, 26 + i * 7))})`}>
            <path d="M 0 36 C -58 -10 -46 -66 0 -38 C 46 -66 58 -10 0 36 Z"
              fill={KRP.red} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" opacity={0.92} />
          </g>
        ))}
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="あなたが単純だから、ではない" size={36} />}
  />
);

// #237 4000年変わらない、人なつっこい仕組み
const SceneKokoro4000: React.FC<{ f: number }> = ({ f }) => {
  const t1 = pop(seg(f, 4, 26));
  return (
    <Sc seed={643} f={f}
      svg={
        <g filter="url(#wobble)">
          <g transform={`translate(960 580) scale(${t1})`}>
            {/* 大きなハート */}
            <path d="M 0 240 C -380 -60 -300 -420 0 -250 C 300 -420 380 -60 0 240 Z"
              fill={KRP.cream} stroke={KRP.red} strokeWidth={13} strokeLinejoin="round" />
            {/* 中で回る歯車 */}
            <g transform={`rotate(${f * 1.1})`}>
              {Array.from({ length: 8 }, (_, i) => (
                <rect key={i} x={-17} y={-128} width={34} height={42} rx={8} fill={KRP.brass}
                  stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${i * 45})`} />
              ))}
              <circle r={96} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
              <circle r={34} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
            </g>
          </g>
          <StarShape x={460} y={300} s={0.55} o={0.85} />
          <StarShape x={1450} y={280} s={0.65} o={0.85} />
          <StarShape x={1540} y={700} s={0.5} o={0.8} />
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="人の心の、人なつっこい仕組み" size={36} />}
    />
  );
};

// ===================================================================
// 結び (#238〜#252)
// ===================================================================

// 歴史のミニアイコン (結びのリキャップで使い回す)
const IconBone: React.FC = () => (
  <g>
    <path d="M -46 -62 Q 2 -84 48 -58 Q 66 -10 44 58 Q 0 80 -42 60 Q -64 -4 -46 -62 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -8 -48 L 4 -16 L -10 10 L 6 44" fill="none" stroke={KRP.ink} strokeWidth={4.5}
      strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 4 -16 L 26 -24 M -10 10 L -34 16" fill="none" stroke={KRP.ink} strokeWidth={4}
      strokeLinecap="round" />
  </g>
);
const IconHead: React.FC = () => (
  <g>
    <circle cx={-26} cy={-44} r={15} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={8} cy={-52} r={13} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={38} cy={-34} r={12} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    <circle r={54} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -40 -18 Q 0 -34 40 -14 M -44 14 Q 0 0 44 16" fill="none" stroke={KRP.ink}
      strokeWidth={3.5} strokeDasharray="8 8" opacity={0.7} />
  </g>
);
const IconInk: React.FC = () => (
  <path d="M 0 -58 Q 26 -40 22 -18 Q 54 -26 58 2 Q 60 30 32 34 Q 40 58 16 60 Q -6 62 -10 42 Q -40 56 -50 32 Q -58 8 -34 -2 Q -52 -24 -28 -38 Q -14 -48 0 -58 Z"
    fill={KRP.ink} />
);
const IconLetters: React.FC = () => (
  <g fontFamily={FONT} fontWeight={900} fontSize={34}>
    {(["M", "B", "T", "I"] as const).map((ch, i) => (
      <g key={ch} transform={`translate(${(i % 2) * 56 - 28} ${Math.floor(i / 2) * 56 - 28})`}>
        <rect x={-24} y={-24} width={48} height={48} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <text x={0} y={12} textAnchor="middle" fill={KRP.blueDeep}>{ch}</text>
      </g>
    ))}
  </g>
);
const RECAP_ICONS: Array<{ name: string; node: React.ReactNode }> = [
  { name: "骨のヒビ", node: <IconBone /> },
  { name: "星の動き", node: <StarShape x={0} y={0} s={1.7} /> },
  { name: "頭のデコボコ", node: <IconHead /> },
  { name: "インクのしみ", node: <IconInk /> },
  { name: "アルファベット", node: <IconLetters /> },
];

// #238 #248 聞いてきた相手の総ざらい (5枚のアイコンカード)
const SceneRecapIcons: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={644} f={f}
    svg={
      <g filter="url(#wobble)">
        {RECAP_ICONS.map((ic, i) => {
          const t = pop(seg(f, 4 + i * 8, 22 + i * 8));
          return (
            <g key={ic.name} transform={`translate(${340 + i * 310} ${540 + (i % 2) * 44}) scale(${t})`}>
              <rect x={-130} y={-150} width={260} height={300} rx={18} fill={KRP.white}
                stroke={KRP.ink} strokeWidth={6.5} />
              <g transform="translate(0 -30)">{ic.node}</g>
              <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
                fill={KRP.ink}>{ic.name}</text>
            </g>
          );
        })}
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="「私は何者?」の聞き先の歴史" size={36} />}
  />
);

// #239 #240 乗り換え路線図の全回収 (RouteMap count=4)
const SceneRoutemap4: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={645} f={f}
    svg={
      <g filter="url(#wobble)">
        <RouteMap x={960} y={560} s={1.18} f={f} count={4} />
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="聞く相手を、乗り換えてきた" size={36} />}
  />
);

// #241 答えのありかが空から自分の中へ降りてくる
const SceneSoraOriru: React.FC<{ f: number }> = ({ f }) => {
  const t = easeOut(seg(f, 6, 50));
  const sx = lerp(620, 960, t);
  const sy = lerp(210, 690, t);
  return (
    <Sc seed={646} f={f}
      svg={
        <g filter="url(#wobble)">
          {/* 遠い空 */}
          <rect x={0} y={0} width={W} height={330} fill={KRP.blueSoft} opacity={0.75} />
          <path d={`M 0 330 Q 480 290 960 330 Q 1440 370 1920 330`} fill="none"
            stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
          <StarShape x={320} y={150} s={0.5} o={0.85} />
          <StarShape x={1540} y={130} s={0.6} o={0.85} />
          <ellipse cx={1250} cy={200} rx={90} ry={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <Floor />
          <Person x={960} y={880} f={f} cloth={KRP.blueDeep} face="smile" gaze={[0, -5]} />
          {/* 降りてくる星の軌跡 */}
          <path d={`M 620 210 Q 760 420 960 690`} fill="none" stroke={KRP.orange} strokeWidth={6}
            strokeDasharray="16 14" opacity={0.9} strokeLinecap="round" />
          <StarShape x={sx} y={sy} s={0.95} rot={f * 2} />
          {/* 胸で光る */}
          {t >= 1 && (
            <circle cx={960} cy={690} r={54 + Math.sin(f / 5) * 6} fill="none" stroke={KRP.orange}
              strokeWidth={5} opacity={0.8} />
          )}
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="答えのありかは、少しずつ自分の中へ" size={36} />}
    />
  );
};

// 文#243 / 文#244 聞いていることはずっと同じ →「私は、何者?」
// 作者フィードバック (2026-10-30):
//  「文#243 ではまだ『私は何者?』を出さないでほしい。そのあとのシーンで出してほしい」
// もとは文#243 と文#244 が同じ motif で、文#243 の時点から答え (問いの文言) が
// 見えてしまっていた。そこで同じ絵を使い回したまま reveal だけ切り替える形に分けた。
//  ・reveal=false (文#243 w4_onaji_toi)      … 問いの文字は出さない。「ずっと同じ」とだけ言い、
//                                              5つのアイコンが同じ一点を指す = 気配だけを置く。
//  ・reveal=true  (文#244 w4_onaji_toi_reveal)… そこで初めて「私は、何者?」が大きく出る。
// 絵のブレを避けるため、カードの位置・大きさ・まわりを回るアイコンは2つで完全に共通。
const OnajiToiBase: React.FC<{ f: number; reveal: boolean }> = ({ f, reveal }) => {
  const t1 = pop(seg(f, 6, 28));
  const glow = 0.5 + 0.5 * Math.sin(f / 9); // ゆっくりした息づかい (点滅にならない速さ)
  return (
    <Sc seed={647} f={f}
      svg={
        <g filter="url(#wobble)">
          {/* まわりを薄く回る時代のアイコン */}
          <g opacity={0.5}>
            {RECAP_ICONS.map((ic, i) => {
              const a = (i / 5) * Math.PI * 2 + f * 0.004;
              const px = 960 + Math.cos(a) * 640;
              const py = 560 + Math.sin(a) * 320;
              // アイコンから中心へ向かう短い線 (長さ90)。
              // 「どの時代も、同じ一点を指している」を線で見せる。
              // カードの角 (±480 / ±170) には届かない長さにしてあるので文字に掛からない。
              const d = Math.hypot(960 - px, 560 - py);
              const ux = (960 - px) / d;
              const uy = (560 - py) / d;
              return (
                <g key={ic.name}>
                  <line x1={px + ux * 46} y1={py + uy * 46} x2={px + ux * 136} y2={py + uy * 136}
                    stroke={KRP.ink} strokeWidth={4} strokeLinecap="round"
                    strokeDasharray="10 12" strokeDashoffset={-f * 0.7} opacity={0.8} />
                  <g transform={`translate(${px} ${py}) scale(0.78)`}>{ic.node}</g>
                </g>
              );
            })}
          </g>
          {/* 真ん中の問いカード (位置・大きさは文#243 と文#244 で共通) */}
          <g transform={`translate(960 560) scale(${t1})`}>
            {/* 文#244 で問いが出る瞬間の波紋 (カードの外側へ広がって消える) */}
            {reveal && [0, 1].map((i) => {
              const w = seg(f, 10 + i * 14, 54 + i * 14);
              if (w <= 0 || w >= 1) return null;
              return (
                <rect key={i} x={-480 - w * 70} y={-170 - w * 70}
                  width={960 + w * 140} height={340 + w * 140} rx={24 + w * 20}
                  fill="none" stroke={KRP.orange} strokeWidth={6} opacity={(1 - w) * 0.6} />
              );
            })}
            <rect x={-480} y={-170} width={960} height={340} rx={24} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={8} />
            {reveal ? (
              <g>
                <text x={0} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96}
                  fill={KRP.ink}>私は、何者?</text>
                <text x={0} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38}
                  fill={KRP.grayDark}>聞いていることは、ずっと同じ</text>
              </g>
            ) : (
              // 文#243: 問いの文字はまだ出さない。
              // 代わりに「ここに何か入る」余白だけを、うっすら光る枠で置いておく。
              <g>
                <text x={0} y={-52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62}
                  fill={KRP.ink}>聞いていることは、</text>
                <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62}
                  fill={KRP.ink}>ずっと同じ</text>
                <rect x={-250} y={78} width={500} height={62} rx={14} fill="none"
                  stroke={KRP.orange} strokeWidth={5} strokeDasharray="14 14"
                  strokeDashoffset={-f * 0.8} opacity={0.35 + 0.35 * glow} />
              </g>
            )}
          </g>
        </g>
      }
    />
  );
};
const SceneOnajiToi: React.FC<{ f: number }> = ({ f }) => <OnajiToiBase f={f} reveal={false} />;
const SceneOnajiToiReveal: React.FC<{ f: number }> = ({ f }) => <OnajiToiBase f={f} reveal />;

// #243 #244 「汝自身を知れ」の石碑 (神殿そのものは描かない)
// 絵柄は共通。#244 はここにゆっくり寄っていく (SceneSekihiZoom)
const SekihiArt: React.FC<{ f: number; t1: number; sub?: boolean }> = ({ f, t1, sub = true }) => (
  <g>
    <Floor y={860} />
    {/* 欠けた円柱の根元 (左右) */}
    <g fill={KRP.gray} stroke={KRP.ink} strokeWidth={5.5}>
      <path d="M 300 860 L 300 700 L 330 680 L 360 706 L 400 684 L 430 860 Z" />
      <path d="M 1520 860 L 1520 740 L 1560 716 L 1600 744 L 1620 860 Z" />
    </g>
    {[0, 1].map((i) => (
      <line key={i} x1={312 + i * 40} y1={726} x2={312 + i * 40} y2={846}
        stroke={KRP.ink} strokeWidth={3.5} opacity={0.4} />
    ))}
    {/* 石碑 */}
    <g transform={`translate(960 860) scale(${t1})`}>
      <path d="M -240 0 L -240 -420 Q -240 -520 0 -520 Q 240 -520 240 -420 L 240 0 Z"
        fill={KRP.gray} stroke={KRP.ink} strokeWidth={7.5} />
      <path d="M -200 -40 L -200 -410 Q -200 -480 0 -480 Q 200 -480 200 -410 L 200 -40 Z"
        fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      <text x={0} y={-290} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76}
        fill={KRP.ink}>汝自身を知れ</text>
      {sub && (
        <g>
          <line x1={-140} y1={-236} x2={140} y2={-236} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          <text x={0} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40}
            fill={KRP.ink} opacity={0.8}>— 分際をわきまえよ —</text>
        </g>
      )}
      {/* ヒビ */}
      <path d="M 160 -520 L 140 -460 L 170 -420" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      {/* 石のざらつき (ゆっくり明滅) */}
      {([[-150, -400], [120, -350], [-60, -110], [170, -180], [-190, -220]] as Array<[number, number]>).map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={5} fill={KRP.ink}
          opacity={0.1 + 0.08 * Math.abs(Math.sin(f / 23 + i))} />
      ))}
    </g>
    {/* 月桂樹の小枝 */}
    {[-1, 1].map((d) => (
      <g key={d} transform={`translate(${960 + d * 300} 840) scale(${d} 1)`}>
        <path d="M 0 0 Q 50 -40 110 -50" fill="none" stroke={KRP.green} strokeWidth={6} strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={28 + i * 26} cy={-16 - i * 11} rx={17} ry={9}
            fill={KRP.green} stroke={KRP.ink} strokeWidth={3.5}
            transform={`rotate(-22 ${28 + i * 26} ${-16 - i * 11})`} />
        ))}
      </g>
    ))}
  </g>
);

const SceneSekihi: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={648} f={f}
    svg={<g filter="url(#wobble)"><SekihiArt f={f} t1={pop(seg(f, 4, 26))} /></g>}
    html={<LabelPill x={960} y={170} centerX text="古代ギリシャに刻まれた言葉" size={36} />}
  />
);

// #244 もともとは厳しい戒めの言葉 (同じ石碑にゆっくり寄る。影を濃くして重みを出す)
// 尺 5.80秒 ≒ 174フレーム。ゆっくり 1.0→1.22 倍、石碑の文字あたりを中心に寄せる
const SceneSekihiZoom: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.22 * easeOut(clamp01(f / 168)); // ずっと止まらずに寄り続ける
  const cx = 960, cy = 520; // 寄る中心 (「汝自身を知れ」の文字あたり)
  const dark = seg(f, 0, 70); // だんだん陰が濃くなる
  return (
    <Sc seed={658} f={f}
      svg={
        <g>
          <g transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`}>
            <g filter="url(#wobble)">
              <SekihiArt f={f} t1={1} sub={false} />
              {/* 戒めの一文を石碑の中に大きく刻む */}
              <g transform="translate(960 860)">
                <line x1={-180} y1={-236} x2={180} y2={-236} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
                <text x={0} y={-168} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
                  fill={KRP.ink} opacity={0.9}>人間の</text>
                <text x={0} y={-104} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
                  fill={KRP.ink} opacity={0.9}>分際をわきまえよ</text>
              </g>
            </g>
          </g>
          {/* 画面のまわりを暗く落として、厳しさを出す */}
          <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={0.1 + 0.16 * dark} />
          <rect x={0} y={0} width={W} height={260} fill={KRP.ink} opacity={0.12 + 0.14 * dark} />
          <rect x={0} y={0} width={300} height={H} fill={KRP.ink} opacity={0.1 + 0.12 * dark} />
          <rect x={1620} y={0} width={300} height={H} fill={KRP.ink} opacity={0.1 + 0.12 * dark} />
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="もとは、厳しい戒めの言葉" size={36} />}
    />
  );
};

// #246 ソクラテスの読み替え
const SceneSocrates: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={649} f={f}
    svg={
      <g filter="url(#wobble)">
        <Floor />
        <Person x={760} y={880} s={1.05} f={f} still cloth={KRP.white} clothDark={KRP.gray}
          hair="none" face="smile" gaze={[4, -2]} />
        {/* ひげと肩掛け布 */}
        <g transform="translate(760 880) scale(1.05)">
          <path d="M -44 -196 Q -48 -130 0 -124 Q 48 -130 44 -196 Q 20 -176 0 -176 Q -20 -176 -44 -196 Z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -58 -160 L 58 -92 L 58 -62 L 30 -62 L -58 -116 Z" fill={KRP.gray}
            stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" opacity={0.9} />
          {/* 頭頂はうすく */}
          <path d="M -50 -268 Q -30 -288 0 -290 Q 30 -288 50 -268" fill="none" stroke={KRP.ink}
            strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        </g>
        <Bubble x={1270} y={380} w={560} h={120} text="自分の無知を知れ" size={46}
          tailTo={[900, 540]} t={seg(f, 12, 30)} />
        <TagPlate x={760} y={300} text="哲学者 ソクラテス" size={36} t={seg(f, 4, 22)} />
      </g>
    }
  />
);

// #247 以来、読み替えが続く (時代ごとのカード)
const SceneYomikae: React.FC<{ f: number }> = ({ f }) => {
  const cards: Array<{ text: string; fill: string; color: string }> = [
    { text: "汝自身を知れ", fill: KRP.gray, color: KRP.ink },
    { text: "自分の無知を知れ", fill: KRP.cream, color: KRP.ink },
    { text: "私は、何者?", fill: KRP.white, color: KRP.blueDeep },
  ];
  // カードは階段状に3枚。矢印は「右上のあいているポケット」に通して、札にも文字にもかぶせない。
  //   札0: x 260..860  y 244..416 / 札1: x 660..1260 y 474..646 / 札2: x 1060..1660 y 704..876
  //   矢印1は x 860..1060・y 350..462 の空き、矢印2は x 1260..1460・y 580..692 の空きを通る
  const cardX = [560, 960, 1360];
  const cardY = [330, 560, 790];
  const arrows = [
    { d: "M 886 352 Q 1012 372 1052 448", tip: [1060, 462] as [number, number], at: 26 },
    { d: "M 1286 582 Q 1412 602 1452 678", tip: [1460, 692] as [number, number], at: 50 },
  ];
  return (
    <Sc seed={650} f={f}
      svg={
        <g filter="url(#wobble)">
          {cards.map((c, i) => {
            const t = pop(seg(f, 4 + i * 24, 24 + i * 24));
            if (t <= 0) return null;
            return (
              <g key={c.text}
                transform={`translate(${cardX[i]} ${cardY[i] + Math.sin(f / 21 + i * 1.7) * 3}) rotate(${-4 + i * 4}) scale(${t})`}>
                <rect x={-300} y={-86} width={600} height={172} rx={18} fill={c.fill}
                  stroke={KRP.ink} strokeWidth={6.5} />
                <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54}
                  fill={c.color}>{c.text}</text>
              </g>
            );
          })}
          {/* つなぐ矢印 (札のすきまを通す。線は流れるように点線を動かす) */}
          {arrows.map((a, i) => {
            const t = seg(f, a.at, a.at + 16);
            if (t <= 0) return null;
            return (
              <g key={i} opacity={t}>
                <path d={a.d} fill="none" stroke={KRP.orange} strokeWidth={9} strokeLinecap="round"
                  strokeDasharray="22 16" strokeDashoffset={-f * 1.2} />
                <polygon points="0,0 -36,-15 -36,15" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5}
                  strokeLinejoin="round" transform={`translate(${a.tip[0]} ${a.tip[1]}) rotate(61)`} />
              </g>
            );
          })}
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="人類は、読み替え続けている" size={36} />}
    />
  );
};

// #249 今夜もどこかで、誰かが答えている (夜の窓辺。93の数字は入れない)
const SceneYoruMadobe: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={651} f={f} dark
    svg={
      <g>
        {/* 夜空 */}
        <rect x={0} y={0} width={W} height={H} fill={KRP.blueDeep} />
        <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={0.45} />
        {([[180, 160], [430, 90], [700, 200], [1180, 110], [1500, 170], [1740, 90], [920, 70]] as Array<[number, number]>).map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={5 + (i % 3)} fill={KRP.white}
            opacity={0.55 + 0.45 * Math.abs(Math.sin(f / 11 + i * 1.8))} />
        ))}
        <circle cx={1620} cy={220} r={74} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={1592} cy={204} r={60} fill={KRP.blueDeep} opacity={0.85} />
        <g filter="url(#wobble)">
          {/* 家の壁 (画面下半分) */}
          <rect x={0} y={560} width={W} height={520} fill={KRP.ink} opacity={0.92} />
          {/* 明かりのついた窓の中 */}
          <g transform="translate(760 790)">
            <rect x={-330} y={-190} width={660} height={380} rx={14} fill={KRP.yellow}
              stroke={KRP.white} strokeWidth={8} />
            {/* 机に向かう人 (シルエット気味) */}
            <g fill={KRP.ink} opacity={0.92}>
              <circle cx={-130} cy={-10} r={52} />
              <path d="M -210 150 Q -205 50 -130 52 Q -60 50 -52 150 Z" />
            </g>
            <rect x={-40} y={92} width={330} height={24} rx={8} fill={KRP.ink} opacity={0.92} />
            {/* たくさんの設問のチェックリスト */}
            <g transform="translate(120 -30)">
              <rect x={-110} y={-120} width={220} height={230} rx={10} fill={KRP.white}
                stroke={KRP.ink} strokeWidth={5} />
              {[0, 1, 2, 3, 4].map((i) => {
                const checked = seg(f, 10 + i * 9, 16 + i * 9) >= 1;
                return (
                  <g key={i} transform={`translate(0 ${-86 + i * 44})`}>
                    <rect x={-86} y={-13} width={26} height={26} rx={5} fill={KRP.white}
                      stroke={KRP.ink} strokeWidth={4} />
                    {checked && (
                      <polyline points="-82,-2 -74,8 -62,-10" fill="none" stroke={KRP.green}
                        strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    <line x1={-44} y1={0} x2={86 - (i % 2) * 26} y2={0} stroke={KRP.grayDark}
                      strokeWidth={4.5} strokeLinecap="round" opacity={0.8} />
                  </g>
                );
              })}
            </g>
          </g>
          {/* 隣の暗い窓 */}
          <rect x={1330} y={660} width={300} height={240} rx={12} fill={KRP.blueDeep} opacity={0.5}
            stroke={KRP.grayDark} strokeWidth={6} />
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="今夜もどこかで、誰かが答えている" size={36} />}
  />
);

// #250 4000年たっても、答えは出ていない (夜の街)
const SceneYoruMachi: React.FC<{ f: number }> = ({ f }) => (
  <Sc seed={652} f={f} dark
    svg={
      <g>
        <rect x={0} y={0} width={W} height={H} fill={KRP.blueDeep} />
        <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={0.42} />
        {Array.from({ length: 14 }, (_, i) => {
          const px = 90 + i * 136;
          const py = 70 + ((i * 97) % 240);
          return (
            <circle key={i} cx={px} cy={py} r={4 + (i % 3)} fill={KRP.white}
              opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 10 + i * 1.4))} />
          );
        })}
        <circle cx={300} cy={210} r={66} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={274} cy={196} r={54} fill={KRP.blueDeep} opacity={0.8} />
        <g filter="url(#wobble)">
          {/* 街のシルエット */}
          {([[60, 620, 230], [330, 500, 260], [630, 680, 200], [870, 440, 300], [1210, 580, 240], [1490, 520, 280]] as Array<[number, number, number]>).map(([bx, by, bw], i) => (
            <g key={i}>
              <rect x={bx} y={by} width={bw} height={1080 - by} fill={KRP.ink} opacity={0.94} />
              {/* 窓あかり (ぽつぽつ点く) */}
              {[0, 1, 2, 3, 4, 5].map((wi) => {
                const wx = bx + 34 + (wi % 2) * (bw / 2);
                const wy = by + 50 + Math.floor(wi / 2) * 110;
                const on = Math.sin(f / 16 + i * 2.2 + wi * 1.9) > -0.25;
                return (
                  <rect key={wi} x={wx} y={wy} width={44} height={56} rx={6}
                    fill={KRP.yellow} opacity={on ? 0.92 : 0.12} />
                );
              })}
            </g>
          ))}
        </g>
      </g>
    }
    html={<LabelPill x={960} y={170} centerX text="満足のいく答えは、まだ出ていない" size={36} />}
  />
);

// #251 だからこそ、明日も誰かが聞く (夜明け)
const SceneAshita: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 4, 50));
  return (
    <Sc seed={653} f={f}
      svg={
        <g filter="url(#wobble)">
          <rect x={0} y={0} width={W} height={620} fill={KRP.blueSoft} opacity={0.7} />
          {/* 朝日 */}
          <g transform={`translate(1240 ${lerp(760, 620, rise)})`}>
            <circle r={130} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6.5} />
            {Array.from({ length: 7 }, (_, i) => {
              const a = -Math.PI + (i / 6) * Math.PI;
              return (
                <line key={i} x1={Math.cos(a) * 160} y1={Math.sin(a) * 160}
                  x2={Math.cos(a) * 205} y2={Math.sin(a) * 205}
                  stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" />
              );
            })}
          </g>
          {/* 地平線 */}
          <rect x={0} y={620} width={W} height={460} fill={KRP.floor} opacity={0.7} />
          <line x1={0} y1={620} x2={W} y2={620} stroke={KRP.ink} strokeWidth={5.5} opacity={0.7} />
          <path d="M 0 800 Q 640 760 1920 820" fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
          {/* 歩いていく小さな人 */}
          <Person x={560} y={840} s={0.72} f={f} cloth={KRP.orange} face="smile" gaze={[6, -3]} lean={3} />
          <ellipse cx={610} cy={846} rx={110} ry={13} fill={KRP.ink} opacity={0.18} />
        </g>
      }
      html={<LabelPill x={960} y={170} centerX text="だからこそ、明日も誰かが聞く" size={36} />}
    />
  );
};

// #252 ——私は、何者? (夜空の星が大きな「?」をかたどる)
const SceneFinalQ: React.FC<{ f: number }> = ({ f }) => {
  // 「?」をかたどる星の座標
  const qStars: Array<[number, number]> = [
    [790, 260], [900, 200], [1030, 210], [1120, 290], [1130, 400],
    [1050, 490], [965, 560], [960, 660],
  ];
  const dot: [number, number] = [960, 790];
  return (
    <Sc seed={654} f={f} dark
      svg={
        <g>
          <rect x={0} y={0} width={W} height={H} fill={KRP.blueDeep} />
          <rect x={0} y={0} width={W} height={H} fill={KRP.ink} opacity={0.5} />
          {/* 背景の星 */}
          {Array.from({ length: 18 }, (_, i) => {
            const px = 70 + ((i * 227) % 1800);
            const py = 60 + ((i * 131) % 700);
            return (
              <circle key={i} cx={px} cy={py} r={3 + (i % 3)} fill={KRP.white}
                opacity={0.3 + 0.4 * Math.abs(Math.sin(f / 12 + i * 1.6))} />
            );
          })}
          <g filter="url(#wobbleSoft)">
            {/* 星座線 (順に結ばれる) */}
            {qStars.slice(0, -1).map(([x1, y1], i) => {
              const [x2, y2] = qStars[i + 1];
              const t = seg(f, 6 + i * 5, 12 + i * 5);
              return (
                <line key={i} x1={x1} y1={y1} x2={lerp(x1, x2, t)} y2={lerp(y1, y2, t)}
                  stroke={KRP.white} strokeWidth={3.5} opacity={0.75} />
              );
            })}
            {/* 星 */}
            {qStars.map(([px, py], i) => (
              <g key={i}>
                <circle cx={px} cy={py} r={10 + Math.sin(f / 7 + i * 1.3) * 2.5} fill={KRP.yellow}
                  stroke={KRP.ink} strokeWidth={3} />
                <circle cx={px} cy={py} r={20 + Math.sin(f / 7 + i * 1.3) * 4} fill="none"
                  stroke={KRP.yellow} strokeWidth={2} opacity={0.5} />
              </g>
            ))}
            {/* 点 */}
            <circle cx={dot[0]} cy={dot[1]} r={16 + Math.sin(f / 6) * 3} fill={KRP.yellow}
              stroke={KRP.ink} strokeWidth={3.5} opacity={pop(seg(f, 46, 60))} />
          </g>
          {/* 丘と見上げる人のシルエット */}
          <path d="M 0 1080 L 0 960 Q 480 900 960 940 Q 1440 980 1920 930 L 1920 1080 Z"
            fill={KRP.ink} opacity={0.95} />
          <g fill={KRP.ink} transform="translate(1430 940)">
            <circle cx={0} cy={-150} r={34} />
            <path d="M -44 0 Q -40 -120 0 -118 Q 40 -120 44 0 Z" />
          </g>
        </g>
      }
    />
  );
};

// motif を知っていれば描く / 知らなければ null (マスター出口が次のファイルに回す)
export const watashiB4Scene = (motif: string, f: number): React.ReactElement | null => {
  switch (motif) {
    // 第10章
    case "w4_ch10_door": return <SceneCh10Door f={f} />;
    case "w4_asa_uranai": return <SceneAsaUranai f={f} />;
    case "w4_furui_atarashii": return <SceneFuruiAtarashii f={f} />;
    case "w4_uk_1930": return <SceneUk1930 f={f} />;
    case "w4_shinbun_kikaku": return <SceneShinbunKikaku f={f} />;
    case "w4_crib_horoscope": return <SceneCribHoroscope f={f} />;
    case "w4_naylor": return <SceneNaylor f={f} />;
    case "w4_rensai_hit": return <SceneRensaiHit f={f} />;
    case "w4_hikousen": return <SceneHikousen f={f} />;
    case "w4_machi_hyouban": return <SceneMachiHyouban f={f} />;
    case "w4_12seiza": return <Scene12Seiza f={f} />;
    case "w4_12seiza_all": return <Scene12SeizaAll f={f} />;
    case "w4_nikkan": return <SceneNikkan f={f} />;
    // 第11章
    case "w4_ch11_door": return <SceneCh11Door f={f} />;
    case "w4_nihon_hatsumei": return <SceneNihonHatsumei f={f} />;
    case "w4_furukawa_1927": return <SceneFurukawa1927 f={f} />;
    case "w4_bunrui_paper": return <SceneBunruiPaper f={f} />;
    case "w4_guntai": return <SceneGuntai f={f} />;
    case "w4_tsuishi_batsu": return <SceneTsuishiBatsu f={f} />;
    case "w4_gakkai_maku": return <SceneGakkaiMaku f={f} />;
    case "w4_1971_book": return <Scene1971Book f={f} />;
    case "w4_tv_zasshi": return <SceneTvZasshi f={f} />;
    case "w4_asia_map": return <SceneAsiaMap f={f} />;
    case "w4_yuketsu": return <SceneYuketsu f={f} />;
    case "w4_kanren_nashi": return <SceneKanrenNashi f={f} />;
    case "w4_kigasuru": return <SceneKigasuru f={f} />;
    // 第12章
    case "w4_ch12_door": return <SceneCh12Door f={f} />;
    case "w4_naze_q": return <SceneNazeQ f={f} />;
    case "w4_forer": return <SceneForer f={f} />;
    case "w4_test39": return <SceneTest39 f={f} />;
    case "w4_tewatashi": return <SceneTewatashi f={f} />;
    case "w4_saiten": return <SceneSaiten f={f} />;
    case "w4_426_graph": return <Scene426Graph f={f} />;
    case "w4_daigassho": return <SceneDaigassho f={f} />;
    case "w4_tane": return <SceneTane f={f} />;
    case "w4_zenin_onaji": return <SceneZeninOnaji f={f} />;
    case "w4_kirihari": return <SceneKirihari f={f} />;
    case "w4_kore_watashi": return <SceneKoreWatashi f={f} />;
    case "w4_barnum_name": return <SceneBarnumName f={f} />;
    case "w4_kotsu3": return <SceneKotsu3 f={f} />;
    case "w4_kotsu3_reveal": return <SceneKotsu3Reveal f={f} />;
    case "w4_ryoumen": return <SceneRyoumen f={f} />;
    case "w4_dokoka_q": return <SceneDokokaQ f={f} />;
    case "w4_recall_machine": return <SceneRecallMachine f={f} />;
    case "w4_tanemeakashi": return <SceneTanemeakashi f={f} />;
    case "w4_kawaii_chakuchi": return <SceneKawaiiChakuchi f={f} />;
    case "w4_kokoro_4000": return <SceneKokoro4000 f={f} />;
    // 結び
    case "w4_recap_icons": return <SceneRecapIcons f={f} />;
    case "w4_routemap4": return <SceneRoutemap4 f={f} />;
    case "w4_sora_oriru": return <SceneSoraOriru f={f} />;
    case "w4_onaji_toi": return <SceneOnajiToi f={f} />;
    case "w4_onaji_toi_reveal": return <SceneOnajiToiReveal f={f} />;
    case "w4_sekihi": return <SceneSekihi f={f} />;
    case "w4_sekihi_zoom": return <SceneSekihiZoom f={f} />;
    case "w4_socrates": return <SceneSocrates f={f} />;
    case "w4_yomikae": return <SceneYomikae f={f} />;
    case "w4_yoru_madobe": return <SceneYoruMadobe f={f} />;
    case "w4_yoru_machi": return <SceneYoruMachi f={f} />;
    case "w4_ashita": return <SceneAshita f={f} />;
    case "w4_final_q": return <SceneFinalQ f={f} />;
    default: return null;
  }
};

// 文#186〜#252 に1対1で対応する motif 名の列 (長さは必ず67。再利用は同じ名前を繰り返す)
export const W_B4_MOTIFS: string[] = [
  // ===== 第10章 (#186〜#198) =====
  "w4_ch10_door",        // #186 第10章、王女さま誕生、星占いはじまる。
  "w4_asa_uranai",       // #187 朝の星座占いはいつ生まれた?
  "w4_furui_atarashii",  // #188 星占いは古代から/新聞の欄は浅い
  "w4_uk_1930",          // #189 1930年、イギリス
  "w4_shinbun_kikaku",   // #190 王女誕生を記念した新聞の企画
  "w4_crib_horoscope",   // #191 生まれたばかりの王女を占わせた
  "w4_naylor",           // #192 占星術師ネイラー
  "w4_rensai_hit",       // #193 記事が大当たり、連載開始
  "w4_hikousen",         // #194 「航空機が危ない」直後の飛行船事故
  "w4_machi_hyouban",    // #195 「当たった」と大評判、人気不動 (#193とは別の絵。街の評判)
  "w4_12seiza",          // #196 誕生日だけで読める形式に進化
  "w4_12seiza_all",      // #197 おなじみの12星座占い (#196とは別の絵。12星座ぜんぶ)
  "w4_nikkan",           // #198 「私は何者?」がついに日刊に
  // ===== 第11章 (#199〜#214) =====
  "w4_ch11_door",        // #199 第11章、血液型は、日本生まれ。
  "w4_nihon_hatsumei",   // #200 日本にしかない発明
  "w4_nihon_hatsumei",   // #201 血液型性格診断です
  "w4_furukawa_1927",    // #202 1927年、古川竹二の論文
  "w4_bunrui_paper",     // #203 A型は慎重…あの分類の原型
  "w4_guntai",           // #204 軍隊で適性判定の試み
  "w4_tsuishi_batsu",    // #205 追試を重ねても結果が合わない
  "w4_gakkai_maku",      // #206 1933年、学会で否定され幕
  "w4_1971_book",        // #207 復活させたのは1971年のベストセラー
  "w4_1971_book",        // #208 能見正比古の血液型の相性本
  "w4_tv_zasshi",        // #209 テレビと雑誌が飛びつき国民的話題に
  "w4_asia_map",         // #210 根付いたのはほぼ東アジアだけ
  "w4_yuketsu",          // #211 海外では輸血の話だと思われる
  "w4_kanren_nashi",     // #212 日米の大調査でも関連は見つからない
  "w4_kigasuru",         // #213 それでも、やめられない
  "w4_kigasuru",         // #214 「当たっている気がする」は根拠より強い
  // ===== 第12章 (#215〜#237) =====
  "w4_ch12_door",        // #215 第12章、全員に、同じ診断書。
  "w4_naze_q",           // #216 なぜ「当たっている」と感じるのか
  "w4_forer",            // #217 1948年、謎に挑んだ心理学者
  "w4_forer",            // #218 バートラム・フォア
  "w4_test39",           // #219 学生39人に性格テスト
  "w4_tewatashi",        // #220 「あなた専用の診断結果です」と手渡し
  "w4_saiten",           // #221 どれだけ当たっているか採点
  "w4_426_graph",        // #222 5点満点で、平均4.26点
  "w4_daigassho",        // #223 「すごく当たってる」の大合唱
  "w4_tane",             // #224 ですが、タネがありました
  "w4_zenin_onaji",      // #225 診断結果は全員、同じ文章
  "w4_kirihari",         // #226 星占いの本などからの切り貼り
  "w4_kore_watashi",     // #227 ほぼ全員が「これは私だ」
  "w4_kore_watashi",     // #228 曖昧な文章を自分だけへの診断だと感じる
  "w4_barnum_name",      // #229 「バーナム効果」と名付けられた
  "w4_kotsu3",           // #230 効き目のコツは、3つ (アイコンだけ)
  "w4_kotsu3_reveal",    // #231 誰にでも当てはまる・好意的・両面ある (文字を1つずつ開示)
  "w4_ryoumen",          // #232 「しっかりして見えるけど、本当は心配性」
  "w4_dokoka_q",         // #233 ……どこかで聞きましたね
  "w4_recall_machine",   // #234 この動画の冒頭で渡した診断文
  "w4_tanemeakashi",     // #235 誰にでも当てはまる文章でした
  "w4_kawaii_chakuchi",  // #236 あなたが単純だからではない
  "w4_kokoro_4000",      // #237 4000年変わらない人なつっこい仕組み
  // ===== 結び (#238〜#252) =====
  "w4_recap_icons",      // #238 骨のヒビ、星、頭、インク、アルファベット
  "w4_routemap4",        // #239 聞く相手を乗り換えてきた
  "w4_routemap4",        // #240 神様に聞き、体に聞き、数字に聞き、自分に聞いた
  "w4_sora_oriru",       // #241 答えのありかは空から自分の中へ
  "w4_onaji_toi",        // 文#243 でも、聞いていることは、ずっと同じです (問いの文字はまだ出さない)
  "w4_onaji_toi_reveal", // 文#244 私は、何者なのか (ここで初めて「私は、何者?」を大きく出す)
  "w4_sekihi",           // #244 「汝自身を知れ」の石碑
  "w4_sekihi_zoom",      // #245 もともとは厳しい戒めの言葉 (同じ石碑にゆっくり寄る)
  "w4_socrates",         // #246 ソクラテスの読み替え
  "w4_yomikae",          // #247 以来、読み替え続けている
  "w4_recap_icons",      // #248 占いで、検査で、診断で
  "w4_yoru_madobe",      // #249 今夜もどこかで誰かが答えている
  "w4_yoru_machi",       // #250 4000年たっても答えは出ていない
  "w4_ashita",           // #251 だからこそ、明日も誰かが聞く
  "w4_final_q",          // #252 ——私は、何者?
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const W_B4_PREVIEW_FRAMES = Math.max(W_B4_MOTIFS.length, 1);
export const WatashiB4Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(W_B4_MOTIFS.length - 1, 0));
  const motif = W_B4_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {watashiB4Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 187} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
