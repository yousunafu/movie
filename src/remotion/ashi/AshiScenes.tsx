// ashi (夜の教養エッセイ) プリセットの画面一式。
// お手本チャンネルのテイスト分析から: 夜・ダークトーン・フラットイラスト・
// シルエットの人物・間接照明の暖かい光・明朝体。1ファイルに全部まとめる。

import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { Scene } from "../../types";
import { ASHI_CHANNEL } from "../../channel";
import { ImageScene } from "../scenes/ImageScene";

// 夜の配色
export const AP = {
  background: "#141B2E", // 夜空の紺
  backgroundAlt: "#18213A",
  deep: "#0C1222", // いちばん暗い空
  ink: "#EAE5D8", // 生成り色の文字
  sub: "#EFEAE0",
  faint: "#8A93AC", // 補足の薄い文字
  amber: "#E3A75C", // 間接照明の琥珀色
  amberSoft: "#F0C98A",
  moon: "#E9E4D3",
  blue: "#5F7CA8",
  green: "#6E8F7C",
  silhouette: "#070B16", // 人物シルエット
  building: "#0E1526",
  frame: "#C9B178", // 額装の金
} as const;

export const ASHI_FONT =
  "'Noto Serif JP', 'Noto Serif CJK JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif";

// ===== 共通の部品 =====

// 星空 (位置は決め打ちの疑似乱数。ゆっくり瞬く)
const Stars: React.FC<{ count?: number; maxY?: number }> = ({
  count = 70,
  maxY = 560,
}) => {
  const frame = useCurrentFrame();
  const stars = Array.from({ length: count }, (_, i) => {
    const h1 = Math.sin(i * 127.1 + 1) * 43758.5453;
    const h2 = Math.sin(i * 311.7 + 7) * 43758.5453;
    return {
      x: (h1 - Math.floor(h1)) * 1920,
      y: (h2 - Math.floor(h2)) * maxY,
      r: 1.4 + (i % 3) * 0.9,
      p: i * 1.7,
    };
  });
  return (
    <g>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={AP.moon}
          opacity={0.25 + 0.4 * Math.abs(Math.sin(frame / 40 + s.p))}
        />
      ))}
    </g>
  );
};

// 月 (ほんのり光る)
const Moon: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 90 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.9} fill={AP.moon} opacity={0.07} />
    <circle cx={x} cy={y} r={r * 1.35} fill={AP.moon} opacity={0.1} />
    <circle cx={x} cy={y} r={r} fill={AP.moon} />
    <circle cx={x - r * 0.3} cy={y - r * 0.25} r={r * 0.16} fill={AP.background} opacity={0.14} />
    <circle cx={x + r * 0.28} cy={y + r * 0.2} r={r * 0.11} fill={AP.background} opacity={0.12} />
  </g>
);

// 立っている人のシルエット (yは足元)
const PersonStand: React.FC<{ x: number; y: number; h?: number; color?: string }> = ({
  x,
  y,
  h = 260,
  color = AP.silhouette,
}) => {
  const head = h * 0.145;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx={0} cy={-h + head} r={head} fill={color} />
      <path
        d={`M ${-h * 0.13} ${-h + head * 2.4} Q 0 ${-h + head * 1.9} ${h * 0.13} ${-h + head * 2.4} L ${h * 0.17} 0 L ${-h * 0.17} 0 Z`}
        fill={color}
      />
    </g>
  );
};

// 座って考え込む人のシルエット (yは床)
const PersonSit: React.FC<{ x: number; y: number; color?: string }> = ({
  x,
  y,
  color = AP.silhouette,
}) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* 前かがみの背中〜頭 */}
    <path
      d={`M -90 0 L -90 -150 Q -86 -230 -20 -252 Q 40 -268 64 -236 Q 80 -214 66 -196 Q 36 -170 30 -120 L 30 0 Z`}
      fill={color}
    />
    {/* 頭 */}
    <circle cx={52} cy={-252} r={34} fill={color} />
    {/* 頬杖の腕 */}
    <path d={`M 30 -120 Q 70 -160 58 -216`} stroke={color} strokeWidth={26} fill="none" strokeLinecap="round" />
  </g>
);

// 街灯 (柱 + 琥珀色の光の輪)。光はろうそくのようにかすかに揺れる
const StreetLamp: React.FC<{ x: number; groundY: number; h?: number }> = ({
  x,
  groundY,
  h = 460,
}) => {
  const frame = useCurrentFrame();
  const fl = 1 + 0.16 * Math.sin(frame / 5 + x) * Math.sin(frame / 13 + x * 0.7);
  return (
    <g>
      <ellipse cx={x} cy={groundY - h} rx={170} ry={150} fill={AP.amber} opacity={0.1 * fl} />
      <ellipse cx={x} cy={groundY - h} rx={90} ry={80} fill={AP.amber} opacity={0.14 * fl} />
      <rect x={x - 7} y={groundY - h} width={14} height={h} fill={AP.silhouette} />
      <path d={`M ${x - 7} ${groundY - h + 4} Q ${x} ${groundY - h - 36} ${x + 42} ${groundY - h - 24}`} stroke={AP.silhouette} strokeWidth={12} fill="none" />
      <circle cx={x + 46} cy={groundY - h - 18} r={20} fill={AP.amberSoft} />
      <circle cx={x + 46} cy={groundY - h - 18} r={44} fill={AP.amber} opacity={0.25 * fl} />
      {/* 地面の光だまり */}
      <ellipse cx={x + 40} cy={groundY} rx={190} ry={26} fill={AP.amber} opacity={0.12 * fl} />
    </g>
  );
};

// ふわふわ漂う光の粒 (飽きさせない環境アニメーション。控えめに)
const Particles: React.FC<{ count?: number }> = ({ count = 12 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const h1 = Math.sin(i * 91.7 + 3) * 43758.5453;
        const h2 = Math.sin(i * 47.3 + 9) * 43758.5453;
        const fx = h1 - Math.floor(h1);
        const fy = h2 - Math.floor(h2);
        const speed = 0.25 + fx * 0.35;
        const y = ((fy * 1080 - frame * speed) % 1080 + 1080) % 1080;
        const x = fx * 1920 + Math.sin(frame / 50 + i * 2.1) * 34;
        const op = 0.1 + 0.16 * Math.abs(Math.sin(frame / 55 + i));
        return (
          <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill={AP.amberSoft} opacity={op} />
        );
      })}
    </g>
  );
};

// シーン全体のゆっくりしたズーム (奇数・偶数で寄り/引きを交互) と、
// シーン切り替わりの短い暗転フェード
export const AshiMotion: React.FC<{ index: number; children: React.ReactNode }> = ({
  index,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dur = Math.max(durationInFrames, 30);
  const zoomIn = index % 2 === 0;
  const scale = interpolate(frame, [0, dur], zoomIn ? [1, 1.065] : [1.065, 1], {
    extrapolateRight: "clamp",
  });
  const fade = interpolate(frame, [0, 10, dur - 10, dur], [1, 0, 0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{ backgroundColor: AP.deep, opacity: fade * 0.95, pointerEvents: "none" }}
      />
    </AbsoluteFill>
  );
};

// ビルのシルエット (窓にぽつぽつ灯り)
const Skyline: React.FC<{ groundY: number; opacity?: number }> = ({
  groundY,
  opacity = 1,
}) => {
  const buildings = [
    { x: 0, w: 210, h: 330 },
    { x: 230, w: 150, h: 470 },
    { x: 400, w: 190, h: 260 },
    { x: 610, w: 160, h: 520 },
    { x: 790, w: 220, h: 360 },
    { x: 1030, w: 150, h: 440 },
    { x: 1200, w: 200, h: 300 },
    { x: 1420, w: 160, h: 490 },
    { x: 1600, w: 320, h: 350 },
  ];
  return (
    <g opacity={opacity}>
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={groundY - b.h} width={b.w} height={b.h} fill={AP.building} />
          {Array.from({ length: Math.floor(b.h / 85) }, (_, r) =>
            Array.from({ length: Math.floor(b.w / 60) }, (_, c) => {
              const lit = Math.sin((i + 1) * (r + 2) * (c + 3) * 7.13) > 0.45;
              return lit ? (
                <rect
                  key={`${r}-${c}`}
                  x={b.x + 22 + c * 58}
                  y={groundY - b.h + 28 + r * 80}
                  width={22}
                  height={30}
                  fill={AP.amber}
                  opacity={0.75}
                />
              ) : null;
            }),
          )}
        </g>
      ))}
    </g>
  );
};

// 画面全体をふわっと出す
const useEnter = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  return { enter, opacity: interpolate(enter, [0, 1], [0, 1]) };
};

const Sky: React.FC = () => (
  <>
    <defs>
      <linearGradient id="ashiSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={AP.deep} />
        <stop offset="100%" stopColor={AP.background} />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#ashiSky)" />
  </>
);

// ===== 人物の場面 =====

export const AshiCharacterScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { opacity } = useEnter();
  const G = 900; // 地面の高さ
  const m = scene.motif;

  // ① 行列のミニストーリー: 一人が右から歩いてきて、行列の最後尾で気づく
  const QN = 8; // 行列の人数 (密度高め)
  const qx = (i: number) => 500 + i * 146;
  const stopX = qx(QN - 1) + 200; // 立ち止まる位置
  const walkEnd = 84; // このフレームで立ち止まる
  const wx = interpolate(frame, [8, walkEnd], [2090, stopX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isWalking = frame >= 8 && frame < walkEnd;
  const bob = isWalking ? Math.abs(Math.sin(frame / 3.2)) * 8 : 0;
  const lean = interpolate(frame, [walkEnd - 10, walkEnd], [-5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const notice = spring({ frame: frame - (walkEnd + 5), fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ backgroundColor: AP.background }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Sky />
        <Stars />
        <Particles />
        <g opacity={opacity}>
          {m === "window" ? (
            <g>
              {/* 室内: 窓辺で月を眺める */}
              <rect width={1920} height={1080} fill={AP.deep} opacity={0.5} />
              <rect x={560} y={150} width={800} height={620} rx={10} fill={AP.background} stroke={AP.silhouette} strokeWidth={26} />
              <rect x={560} y={150} width={800} height={620} fill={AP.deep} />
              <Moon x={1120} y={340} r={95} />
              {/* 窓の中の星 */}
              {[
                [640, 230], [730, 420], [840, 300], [900, 560], [1240, 220],
                [1300, 480], [1180, 620], [660, 640], [1330, 330],
              ].map(([sx, sy], i) => (
                <circle key={i} cx={sx} cy={sy} r={2.4} fill={AP.moon} opacity={0.6} />
              ))}
              <rect x={948} y={150} width={24} height={620} fill={AP.silhouette} />
              <rect x={560} y={448} width={800} height={24} fill={AP.silhouette} />
              <rect x={520} y={770} width={880} height={30} fill={AP.silhouette} />
              <PersonStand x={790} y={1010} h={420} />
            </g>
          ) : m === "thinking" ? (
            <g>
              {/* 机で考え込む。卓上ランプの光 */}
              <rect width={1920} height={1080} fill={AP.deep} opacity={0.45} />
              <ellipse cx={1180} cy={560} rx={420} ry={330} fill={AP.amber} opacity={0.08} />
              <rect x={620} y={760} width={760} height={28} fill={AP.silhouette} />
              <rect x={660} y={788} width={34} height={200} fill={AP.silhouette} />
              <rect x={1300} y={788} width={34} height={200} fill={AP.silhouette} />
              {/* 卓上ランプ */}
              <path d="M 1270 760 L 1250 640 L 1330 640 Z" fill={AP.silhouette} />
              <path d="M 1236 648 Q 1290 600 1344 648 L 1330 664 Q 1290 630 1250 664 Z" fill={AP.amberSoft} />
              <ellipse cx={1290} cy={700} rx={150} ry={90} fill={AP.amber} opacity={0.2} />
              <PersonSit x={940} y={760} />
              {/* 浮かぶ「?」 */}
              <text x={1060} y={420} fontFamily={ASHI_FONT} fontSize={110} fill={AP.faint} opacity={0.8}>
                ?
              </text>
            </g>
          ) : m === "queue" ? (
            <g>
              {/* ① お店 → 密な行列 → 一人が歩いてきて気づく、のミニストーリー */}
              <Skyline groundY={G} opacity={0.6} />
              <Moon x={1680} y={160} r={72} />
              <rect x={0} y={G} width={1920} height={180} fill={AP.deep} />
              <StreetLamp x={1240} groundY={G} h={430} />
              {/* 先頭の店 (ひさし + 灯りのともるショーウィンドウ) */}
              <rect x={140} y={G - 350} width={330} height={350} fill={AP.building} />
              <rect x={128} y={G - 372} width={354} height={32} rx={8} fill={AP.frame} opacity={0.9} />
              <circle cx={305} cy={G - 312} r={17} fill={AP.amberSoft} />
              <rect x={186} y={G - 266} width={238} height={180} fill={AP.amber} opacity={0.85} />
              <rect x={186} y={G - 266} width={238} height={180} fill="none" stroke={AP.silhouette} strokeWidth={10} />
              <ellipse cx={305} cy={G} rx={230} ry={24} fill={AP.amber} opacity={0.1} />
              {/* 密度を上げた行列 */}
              {Array.from({ length: QN }, (_, i) => (
                <PersonStand
                  key={i}
                  x={qx(i) + (i % 3) * 8}
                  y={G}
                  h={246 + ((i * 5) % 3) * 13}
                />
              ))}
              {/* 右から歩いてくる人 (立ち止まって行列に気づく) */}
              <g transform={`translate(${wx}, ${G - bob}) rotate(${lean})`}>
                <PersonStand x={0} y={0} h={272} color="#0A1020" />
              </g>
              {/* 気づきの「!」 */}
              <g
                transform={`translate(${stopX + 14}, ${G - 330}) scale(${Math.max(notice, 0)})`}
                opacity={Math.min(Math.max(notice, 0), 1)}
              >
                <circle cx={0} cy={-28} r={52} fill={AP.deep} stroke={AP.amberSoft} strokeWidth={4} />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fontFamily={ASHI_FONT}
                  fontSize={72}
                  fontWeight={700}
                  fill={AP.amberSoft}
                >
                  !
                </text>
              </g>
            </g>
          ) : m === "crowd" ? (
            <g>
              {/* 群衆 */}
              <Skyline groundY={G} opacity={0.8} />
              <Moon x={960} y={180} r={85} />
              <rect x={0} y={G} width={1920} height={180} fill={AP.deep} />
              {Array.from({ length: 12 }, (_, i) => {
                const h1 = Math.sin((i + 1) * 97.3) * 43758.5;
                const fx = h1 - Math.floor(h1);
                return (
                  <PersonStand
                    key={i}
                    x={120 + i * 150 + fx * 60}
                    y={G + (i % 3) * 26}
                    h={230 + fx * 90}
                    color={i % 3 === 1 ? "#0A1020" : AP.silhouette}
                  />
                );
              })}
            </g>
          ) : m === "walking" ? (
            <g>
              {/* 夜道をひとり歩く */}
              <Skyline groundY={G} opacity={0.55} />
              <Moon x={1620} y={200} r={85} />
              <rect x={0} y={G} width={1920} height={180} fill={AP.deep} />
              <StreetLamp x={520} groundY={G} />
              <StreetLamp x={1420} groundY={G} h={430} />
              {/* 歩く人 (足を開いたシルエット) */}
              <g transform="translate(960, 900)">
                <circle cx={0} cy={-262} r={40} fill={AP.silhouette} />
                <path d="M -36 -196 Q 0 -222 36 -196 L 30 -92 L 66 0 L 34 0 L 4 -70 L -26 0 L -58 0 L -30 -98 Z" fill={AP.silhouette} />
              </g>
            </g>
          ) : m === "reading" ? (
            <g>
              {/* 部屋で読書。フロアランプ */}
              <rect width={1920} height={1080} fill={AP.deep} opacity={0.45} />
              <ellipse cx={960} cy={620} rx={520} ry={380} fill={AP.amber} opacity={0.08} />
              {/* フロアランプ */}
              <rect x={1310} y={430} width={14} height={470} fill={AP.silhouette} />
              <path d="M 1250 430 L 1317 330 L 1384 430 Z" fill={AP.amberSoft} />
              <ellipse cx={1317} cy={470} rx={190} ry={110} fill={AP.amber} opacity={0.2} />
              {/* 椅子と人 */}
              <rect x={700} y={690} width={420} height={48} rx={22} fill={AP.silhouette} />
              <rect x={700} y={470} width={60} height={260} rx={26} fill={AP.silhouette} />
              <rect x={726} y={738} width={40} height={162} fill={AP.silhouette} />
              <rect x={1054} y={738} width={40} height={162} fill={AP.silhouette} />
              <circle cx={880} cy={480} r={40} fill={AP.silhouette} />
              <path d="M 836 548 Q 880 520 924 548 L 948 700 L 812 700 Z" fill={AP.silhouette} />
              {/* 本 */}
              <path d="M 905 590 L 1010 560 L 1022 620 L 918 650 Z" fill={AP.moon} />
              <path d="M 905 590 L 800 575 L 795 636 L 918 650 Z" fill={AP.amberSoft} />
            </g>
          ) : m === "phone" ? (
            <g>
              {/* 暗闇でスマホの光に照らされる */}
              <rect width={1920} height={1080} fill={AP.deep} opacity={0.72} />
              <ellipse cx={960} cy={560} rx={330} ry={300} fill={AP.blue} opacity={0.16} />
              <circle cx={960} cy={420} r={66} fill={AP.silhouette} />
              <path d="M 884 528 Q 960 486 1036 528 L 1072 900 L 848 900 Z" fill={AP.silhouette} />
              {/* 顔に当たる青白い光 */}
              <path d="M 928 452 A 66 66 0 0 0 1012 388 L 980 470 Z" fill={AP.blue} opacity={0.5} />
              {/* スマホ */}
              <rect x={916} y={560} width={88} height={150} rx={14} fill="#1E2A44" stroke={AP.blue} strokeWidth={5} />
              <rect x={928} y={576} width={64} height={110} fill={AP.blue} opacity={0.75} />
            </g>
          ) : (
            <g>
              {/* talking (既定): 街灯の下で語る */}
              <Skyline groundY={G} opacity={0.5} />
              <Moon x={1640} y={190} r={85} />
              <rect x={0} y={G} width={1920} height={180} fill={AP.deep} />
              <StreetLamp x={760} groundY={G} h={500} />
              <PersonStand x={960} y={G} h={330} />
            </g>
          )}
        </g>
        {/* 強調の言葉 */}
        {scene.emphasis && (
          <g opacity={opacity}>
            <text
              x={960}
              y={150}
              textAnchor="middle"
              fontFamily={ASHI_FONT}
              fontSize={64}
              fontWeight={700}
              fill={AP.amberSoft}
            >
              {scene.emphasis}
            </text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ===== 物 (象徴) の場面 =====

const Symbol: React.FC<{ motif: string }> = ({ motif }) => {
  switch (motif) {
    case "moon":
      return (
        <g>
          <circle cx={0} cy={0} r={190} fill={AP.moon} />
          <circle cx={-58} cy={-48} r={30} fill={AP.background} opacity={0.15} />
          <circle cx={55} cy={40} r={22} fill={AP.background} opacity={0.13} />
          <circle cx={10} cy={95} r={16} fill={AP.background} opacity={0.12} />
        </g>
      );
    case "clock":
      return (
        <g>
          <circle cx={0} cy={0} r={190} fill="#1C2742" stroke={AP.moon} strokeWidth={14} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={Math.sin(a) * 158}
                y1={-Math.cos(a) * 158}
                x2={Math.sin(a) * 174}
                y2={-Math.cos(a) * 174}
                stroke={AP.moon}
                strokeWidth={8}
              />
            );
          })}
          <line x1={0} y1={0} x2={0} y2={-108} stroke={AP.amberSoft} strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={0} x2={82} y2={46} stroke={AP.moon} strokeWidth={10} strokeLinecap="round" />
          <circle cx={0} cy={0} r={13} fill={AP.amberSoft} />
        </g>
      );
    case "scale":
      return (
        <g>
          <rect x={-10} y={-190} width={20} height={300} fill={AP.moon} />
          <rect x={-150} y={110} width={300} height={22} rx={10} fill={AP.moon} />
          <rect x={-190} y={-190} width={380} height={16} rx={8} fill={AP.moon} />
          {/* 左の皿 */}
          <line x1={-182} y1={-180} x2={-182} y2={-60} stroke={AP.moon} strokeWidth={6} />
          <path d="M -242 -60 Q -182 0 -122 -60 Z" fill={AP.amberSoft} />
          {/* 右の皿 (少し下がる) */}
          <line x1={182} y1={-180} x2={182} y2={-20} stroke={AP.moon} strokeWidth={6} />
          <path d="M 122 -20 Q 182 40 242 -20 Z" fill={AP.amberSoft} />
        </g>
      );
    case "lightbulb":
      return (
        <g>
          <circle cx={0} cy={-40} r={150} fill={AP.amberSoft} />
          <path d="M -58 86 L 58 86 L 42 150 L -42 150 Z" fill={AP.faint} />
          <rect x={-42} y={150} width={84} height={16} fill={AP.faint} />
          <rect x={-36} y={176} width={72} height={14} fill={AP.faint} />
          <path d="M -34 -60 Q 0 -110 34 -60 L 0 20 Z" fill={AP.amber} opacity={0.6} />
          {[-1, 0, 1].map((i) => (
            <line
              key={i}
              x1={i * 180}
              y1={-250 - Math.abs(i) * -40}
              x2={i * 140}
              y2={-200 - Math.abs(i) * -30}
              stroke={AP.amberSoft}
              strokeWidth={10}
              strokeLinecap="round"
            />
          ))}
        </g>
      );
    case "hourglass":
      return (
        <g>
          <rect x={-150} y={-220} width={300} height={26} rx={12} fill={AP.frame} />
          <rect x={-150} y={194} width={300} height={26} rx={12} fill={AP.frame} />
          <path d="M -120 -194 L 120 -194 L 20 0 L 120 194 L -120 194 L -20 0 Z" fill="#1C2742" stroke={AP.moon} strokeWidth={8} />
          {/* 砂 */}
          <path d="M -86 -170 L 86 -170 L 8 -24 L -8 -24 Z" fill={AP.amberSoft} />
          <path d="M -70 194 L 70 194 L 0 110 Z" fill={AP.amberSoft} />
          <line x1={0} y1={-20} x2={0} y2={110} stroke={AP.amberSoft} strokeWidth={7} />
        </g>
      );
    case "mask":
      return (
        <g>
          {/* 2つの仮面 (本音と建前) */}
          <g transform="translate(-110, 0) rotate(-10)">
            <ellipse cx={0} cy={0} rx={120} ry={160} fill={AP.moon} />
            <ellipse cx={-42} cy={-40} rx={26} ry={16} fill={AP.background} />
            <ellipse cx={42} cy={-40} rx={26} ry={16} fill={AP.background} />
            <path d="M -50 70 Q 0 110 50 70" stroke={AP.background} strokeWidth={12} fill="none" strokeLinecap="round" />
          </g>
          <g transform="translate(130, 20) rotate(12)">
            <ellipse cx={0} cy={0} rx={120} ry={160} fill={AP.faint} />
            <ellipse cx={-42} cy={-40} rx={26} ry={16} fill={AP.deep} />
            <ellipse cx={42} cy={-40} rx={26} ry={16} fill={AP.deep} />
            <path d="M -50 95 Q 0 55 50 95" stroke={AP.deep} strokeWidth={12} fill="none" strokeLinecap="round" />
          </g>
        </g>
      );
    case "coffee":
      return (
        <g>
          <path d="M -130 -40 L 130 -40 L 110 150 Q 0 190 -110 150 Z" fill={AP.moon} />
          <path d="M 130 -20 Q 220 -10 190 70 Q 174 110 112 104" stroke={AP.moon} strokeWidth={22} fill="none" />
          <ellipse cx={0} cy={-40} rx={130} ry={30} fill="#6B4A2F" />
          {[-50, 10, 60].map((x, i) => (
            <path
              key={i}
              d={`M ${x} -90 Q ${x - 18} -130 ${x} -168 Q ${x + 18} -204 ${x} -240`}
              stroke={AP.faint}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              opacity={0.8}
            />
          ))}
        </g>
      );
    case "book":
    default:
      return (
        <g>
          {/* 開いた本 */}
          <path d="M 0 -60 Q -120 -120 -240 -90 L -240 120 Q -120 90 0 150 Z" fill={AP.moon} />
          <path d="M 0 -60 Q 120 -120 240 -90 L 240 120 Q 120 90 0 150 Z" fill={AP.sub} />
          <line x1={0} y1={-60} x2={0} y2={150} stroke={AP.faint} strokeWidth={6} />
          {[-180, -120].map((y, i) => (
            <g key={i}>
              <path d={`M -200 ${y / 2 + 10} Q -110 ${y / 2 - 16} -40 ${y / 2 + 4}`} stroke={AP.faint} strokeWidth={6} fill="none" />
              <path d={`M 40 ${y / 2 + 4} Q 110 ${y / 2 - 16} 200 ${y / 2 + 10}`} stroke={AP.faint} strokeWidth={6} fill="none" />
            </g>
          ))}
          <path d="M -200 60 Q -110 36 -40 56" stroke={AP.faint} strokeWidth={6} fill="none" />
          <path d="M 40 56 Q 110 36 200 60" stroke={AP.faint} strokeWidth={6} fill="none" />
        </g>
      );
  }
};

export const AshiObjectScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 100 } });
  const scale = interpolate(enter, [0, 1], [0.85, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: AP.background }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Sky />
        <Stars count={50} />
        <Particles count={10} />
        <g opacity={enter}>
          {/* 琥珀色の後光 */}
          <circle cx={960} cy={480} r={430} fill={AP.amber} opacity={0.07} />
          <circle cx={960} cy={480} r={320} fill={AP.amber} opacity={0.08} />
          <circle cx={960} cy={480} r={230} fill={AP.amber} opacity={0.08} />
          <g transform={`translate(960, 480) scale(${scale})`}>
            <Symbol motif={scene.motif} />
          </g>
        </g>
        {scene.emphasis && (
          <text
            x={960}
            y={150}
            textAnchor="middle"
            fontFamily={ASHI_FONT}
            fontSize={62}
            fontWeight={700}
            fill={AP.amberSoft}
            opacity={enter}
          >
            {scene.emphasis}
          </text>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ===== 風景の場面 =====

export const AshiLocationScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { opacity } = useEnter();
  const G = 920;
  const m = scene.motif;

  return (
    <AbsoluteFill style={{ backgroundColor: AP.background }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Sky />
        <Particles count={10} />
        <g opacity={opacity}>
          {m === "room" ? (
            <g>
              {/* 間接照明の部屋と本棚 */}
              <rect width={1920} height={1080} fill="#121A30" />
              <rect x={0} y={880} width={1920} height={200} fill="#0D1426" />
              {/* 窓と月 */}
              <rect x={1360} y={140} width={420} height={520} fill={AP.deep} stroke={AP.silhouette} strokeWidth={22} />
              <Moon x={1570} y={330} r={70} />
              <rect x={1558} y={140} width={20} height={520} fill={AP.silhouette} />
              {/* 本棚 */}
              <rect x={160} y={180} width={640} height={700} fill="#0B1122" stroke="#1E2A44" strokeWidth={14} />
              {[0, 1, 2, 3].map((row) => (
                <g key={row}>
                  <rect x={172} y={330 + row * 170} width={616} height={14} fill="#1E2A44" />
                  {Array.from({ length: 9 }, (_, i) => {
                    const h1 = Math.sin((row + 1) * (i + 2) * 53.7) * 43758.5;
                    const f = h1 - Math.floor(h1);
                    const colors = [AP.amber, AP.blue, AP.green, AP.faint, "#A8654F"];
                    return (
                      <rect
                        key={i}
                        x={196 + i * 64}
                        y={212 + row * 170 + f * 24}
                        width={44}
                        height={118 - f * 24}
                        fill={colors[Math.floor(f * 5) % 5]}
                        opacity={0.8}
                      />
                    );
                  })}
                </g>
              ))}
              {/* フロアランプの灯り */}
              <rect x={1060} y={480} width={13} height={420} fill={AP.silhouette} />
              <path d="M 1005 480 L 1066 390 L 1128 480 Z" fill={AP.amberSoft} />
              <ellipse cx={1066} cy={540} rx={230} ry={150} fill={AP.amber} opacity={0.16} />
              {/* 机 */}
              <rect x={900} y={760} width={380} height={24} fill={AP.silhouette} />
              <rect x={930} y={784} width={28} height={140} fill={AP.silhouette} />
              <rect x={1220} y={784} width={28} height={140} fill={AP.silhouette} />
            </g>
          ) : m === "street" ? (
            <g>
              {/* 夜の通り */}
              <Skyline groundY={G - 60} opacity={0.75} />
              <Moon x={330} y={190} r={80} />
              <Stars count={45} />
              <rect x={0} y={G - 60} width={1920} height={240} fill={AP.deep} />
              {/* 道 */}
              <path d={`M 700 1080 L 1220 1080 L 1030 ${G - 60} L 890 ${G - 60} Z`} fill="#121A30" />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={950} y={G + 10 + i * 56} width={16} height={34} fill={AP.moon} opacity={0.5} transform={`skewX(-2)`} />
              ))}
              <StreetLamp x={560} groundY={G - 60} />
              <StreetLamp x={1340} groundY={G - 60} h={420} />
            </g>
          ) : (
            <g>
              {/* city (既定): 夜の街並みの全景 */}
              <Stars count={70} />
              <Moon x={1540} y={210} r={100} />
              <Skyline groundY={G} />
              <rect x={0} y={G} width={1920} height={160} fill={AP.deep} />
              {/* 手前の暗いビル */}
              <rect x={-40} y={G - 620} width={300} height={620} fill="#080E1C" />
              <rect x={1700} y={G - 560} width={260} height={560} fill="#080E1C" />
            </g>
          )}
        </g>
        {scene.emphasis && (
          <text
            x={960}
            y={170}
            textAnchor="middle"
            fontFamily={ASHI_FONT}
            fontSize={64}
            fontWeight={700}
            fill={AP.ink}
            opacity={opacity}
          >
            {scene.emphasis}
          </text>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ===== 数値の比較 =====

// ④ 人型ピクトグラム: 10人のうち何人か、を琥珀色の塗りで見せる
const MiniPersonShape: React.FC<{ x: number; color: string; opacity?: number }> = ({
  x,
  color,
  opacity = 1,
}) => (
  <g transform={`translate(${x}, 0)`} opacity={opacity}>
    <circle cx={0} cy={17} r={14} fill={color} />
    <path d="M -14 42 Q 0 31 14 42 L 18 112 L -18 112 Z" fill={color} />
  </g>
);

const PictoRow: React.FC<{ fillRatio: number; color: string; id: string }> = ({
  fillRatio,
  color,
  id,
}) => {
  const W = 560;
  const xs = Array.from({ length: 10 }, (_, i) => 28 + i * 56);
  const w = Math.max(0, Math.min(1, fillRatio)) * W;
  return (
    <svg width={W} height={118} viewBox={`0 0 ${W} 118`}>
      <defs>
        <clipPath id={`picto-${id}`}>
          <rect x={0} y={0} width={w} height={118} />
        </clipPath>
      </defs>
      {xs.map((x, i) => (
        <MiniPersonShape key={i} x={x} color={AP.faint} opacity={0.26} />
      ))}
      <g clipPath={`url(#picto-${id})`}>
        {xs.map((x, i) => (
          <MiniPersonShape key={i} x={x} color={color} />
        ))}
      </g>
    </svg>
  );
};

export const AshiChartScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).slice(0, 4).filter((i) => i.label);
  const values = items.map((i) => Math.abs(i.value ?? 1));
  const max = Math.max(...values, 1);
  const colors = [AP.amber, AP.blue, AP.green, AP.moon];

  return (
    <AbsoluteFill style={{ backgroundColor: AP.background }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Sky />
        <Stars count={40} />
      </svg>
      {scene.title && (
        <div
          style={{
            position: "absolute",
            top: 76,
            width: "100%",
            textAlign: "center",
            fontFamily: ASHI_FONT,
            fontSize: 58,
            fontWeight: 700,
            color: AP.ink,
          }}
        >
          {scene.title}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 0,
          right: 0,
          bottom: 230,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 120,
        }}
      >
        {items.length > 0 ? (
          items.map((item, i) => {
            // ⑥ 数値はカウントアップ、⑤塗りもじわっと満ちていく
            const grow = spring({
              frame: frame - i * Math.round(fps * 0.45),
              fps,
              config: { damping: 100 },
            });
            const val = item.value !== undefined ? Math.abs(item.value) : undefined;
            const shown = val !== undefined ? Math.round(val * grow) : undefined;
            const unit = item.unit ?? "";
            const isPercent = /[%％]/.test(unit) || /パーセント/.test(unit);
            const ratio =
              val === undefined ? 0.5 : isPercent ? Math.min(val, 100) / 100 : val / max;
            const strongest = val !== undefined && val === max && items.length > 1;
            return (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}
              >
                {shown !== undefined && (
                  <div
                    style={{
                      fontFamily: ASHI_FONT,
                      fontSize: strongest ? 150 : 116,
                      fontWeight: 700,
                      color: strongest ? AP.amberSoft : AP.moon,
                      lineHeight: 1,
                      textShadow: strongest ? `0 0 70px ${AP.amber}66` : undefined,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {shown}
                    <span style={{ fontSize: strongest ? 76 : 60 }}>{unit}</span>
                  </div>
                )}
                <PictoRow
                  fillRatio={ratio * grow}
                  color={colors[i % colors.length]}
                  id={`${scene.index}-${i}`}
                />
                <div
                  style={{
                    fontFamily: ASHI_FONT,
                    fontSize: 42,
                    fontWeight: 700,
                    color: AP.ink,
                    maxWidth: 480,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })
        ) : (
          <AshiEmphasisNumber text={scene.emphasis ?? scene.text} />
        )}
      </div>
    </AbsoluteFill>
  );
};

const AshiEmphasisNumber: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = text.match(/[0-9０-９][0-9０-９.,．]*\s*[%％割倍人年歳個本回分秒億万千]*/);
  const num = m ? m[0] : "";
  // ⑥ 数値部分はカウントアップで登場させる
  const half = num.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  const nm = half.match(/[0-9]+(?:\.[0-9]+)?/);
  const value = nm ? parseFloat(nm[0]) : null;
  const suffix = nm ? half.slice(half.indexOf(nm[0]) + nm[0].length) : "";
  const grow = spring({ frame, fps, config: { damping: 100 } });
  const shown =
    value === null
      ? num
      : Number.isInteger(value)
        ? `${Math.round(value * grow)}${suffix}`
        : `${(value * grow).toFixed(1)}${suffix}`;
  return (
    <div
      style={{
        fontFamily: ASHI_FONT,
        fontSize: 170,
        fontWeight: 700,
        color: AP.amberSoft,
        border: `3px solid ${AP.frame}`,
        borderRadius: 8,
        padding: "40px 100px",
        boxShadow: `inset 0 0 0 10px ${AP.background}, inset 0 0 0 13px ${AP.frame}`,
      }}
    >
      {shown || "数字"}
    </div>
  );
};

// ===== 概念の図解 =====

export const AshiDiagramScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).slice(0, 4).filter((i) => i.label);
  const cx = 960;
  const cy = 560;

  return (
    <AbsoluteFill style={{ backgroundColor: AP.background }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Sky />
        <Stars count={40} />
        {/* 中心の円 */}
        <circle cx={cx} cy={cy} r={200} fill={AP.amber} opacity={0.1} />
        <circle cx={cx} cy={cy} r={150} fill="#1C2742" stroke={AP.frame} strokeWidth={4} />
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontFamily={ASHI_FONT}
          fontSize={48}
          fontWeight={700}
          fill={AP.ink}
        >
          {scene.title ?? "考え方"}
        </text>
        {/* 周りの要素 */}
        {items.map((item, i) => {
          const grow = spring({
            frame: frame - i * Math.round(fps * 0.25),
            fps,
            config: { damping: 100 },
          });
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(items.length, 1);
          const x = cx + Math.cos(angle) * 480;
          const y = cy + Math.sin(angle) * 300;
          return (
            <g key={i} opacity={grow}>
              <line
                x1={cx + Math.cos(angle) * 155}
                y1={cy + Math.sin(angle) * 155}
                x2={x}
                y2={y}
                stroke={AP.faint}
                strokeWidth={3}
                strokeDasharray="10 10"
              />
              <rect
                x={x - 190}
                y={y - 52}
                width={380}
                height={104}
                rx={12}
                fill={AP.backgroundAlt}
                stroke={AP.faint}
                strokeWidth={3}
              />
              <text
                x={x}
                y={y + 16}
                textAnchor="middle"
                fontFamily={ASHI_FONT}
                fontSize={42}
                fontWeight={700}
                fill={AP.ink}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ===== 結論カード / 終了画面 =====

export const AshiCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const scale = interpolate(enter, [0, 1], [0.94, 1]);

  if (scene.isEnding) {
    return (
      <AbsoluteFill style={{ backgroundColor: AP.background, justifyContent: "center", alignItems: "center" }}>
        <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <Sky />
          <Stars count={60} />
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 44,
            transform: `scale(${scale})`,
            opacity: enter,
            marginBottom: 100,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 190,
              height: 190,
              borderRadius: "50%",
              background: AP.deep,
              border: `4px solid ${AP.frame}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: ASHI_FONT,
              fontSize: 92,
              fontWeight: 700,
              color: AP.moon,
              boxShadow: `0 0 80px ${AP.amber}33`,
            }}
          >
            {ASHI_CHANNEL.iconLetter}
          </div>
          <div style={{ fontFamily: ASHI_FONT, fontSize: 64, fontWeight: 700, color: AP.ink }}>
            {ASHI_CHANNEL.name}
          </div>
          <div
            style={{
              fontFamily: ASHI_FONT,
              fontSize: 42,
              fontWeight: 700,
              color: AP.deep,
              background: AP.amberSoft,
              borderRadius: 8,
              padding: "20px 64px",
            }}
          >
            チャンネル登録はこちら
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ②③ 文字ドン: 核心の言葉を画面いっぱいの大きな文字で見せる。
  // 本文に「...」の引用があれば先に小さく出し、強調語を後から大きくドンと出す2段構え
  const quoted = scene.text.match(/「([^」]+)」/)?.[1];
  const main = scene.emphasis ?? quoted ?? scene.text;
  const line1 = quoted && quoted !== main ? quoted : null;
  const mainSize = Math.max(64, Math.min(150, Math.floor(1560 / Math.max(main.length, 1))));
  const enter1 = spring({ frame: frame - 5, fps, config: { damping: 200 } });
  const enter2 = spring({ frame: frame - (line1 ? 34 : 10), fps, config: { damping: 12 } });
  const scale2 = interpolate(enter2, [0, 1], [0.6, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: AP.background, justifyContent: "center", alignItems: "center" }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <Sky />
        <Stars count={50} />
        <Particles count={9} />
        <circle cx={960} cy={500} r={480} fill={AP.amber} opacity={0.05} />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 58,
          marginBottom: 150,
          position: "relative",
        }}
      >
        {line1 && (
          <div
            style={{
              fontFamily: ASHI_FONT,
              fontSize: 76,
              fontWeight: 700,
              color: AP.ink,
              opacity: enter1,
            }}
          >
            「{line1}」
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 34,
            opacity: Math.min(Math.max(enter2, 0), 1),
            transform: `scale(${scale2})`,
          }}
        >
          <div style={{ width: 130, height: 3, background: AP.frame }} />
          <div
            style={{
              fontFamily: ASHI_FONT,
              fontSize: mainSize,
              fontWeight: 700,
              color: AP.amberSoft,
              lineHeight: 1.5,
              textAlign: "center",
              maxWidth: 1620,
              textShadow: `0 0 70px ${AP.amber}55`,
            }}
          >
            {main}
          </div>
          <div style={{ width: 130, height: 3, background: AP.frame }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== 振り分け =====

export const AshiSceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  // 結論カード以外は、AI画像があればそれを優先
  if (scene.image && scene.type !== "card") {
    return <ImageScene scene={scene} />;
  }
  switch (scene.type) {
    case "object":
      return <AshiObjectScene scene={scene} />;
    case "diagram":
      return <AshiDiagramScene scene={scene} />;
    case "chart":
      return <AshiChartScene scene={scene} />;
    case "location":
      return <AshiLocationScene scene={scene} />;
    case "card":
      return <AshiCardScene scene={scene} />;
    default:
      return <AshiCharacterScene scene={scene} />;
  }
};
