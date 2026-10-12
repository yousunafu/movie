// suuri 作風の共通部品。SuuriScenes.tsx と SushiScenes.tsx の両方から使う。
// 配色 (SP)・枠 (Frame)・人のピクトグラム・ラベル・出現アニメに加えて、
// 和紙背景モード (WashiCtx) と寿司の共通部品 (Plate / Lane) をここに置く。

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { SUURI_CHANNEL } from "../../channel";

// 数理室の配色 (黒・白・赤の3色だけで律する)
export const SP = {
  background: "#0A0A0C", // ほぼ真っ黒
  panel: "#16161B", // 少し明るい面
  ink: "#F2F2F4", // 白い文字
  line: "#E2E2E8", // 線画の白
  faint: "#70707C", // 補足の薄い文字・目盛り
  dim: "#3A3A44", // 消えた線・背景の枝
  accent: "#D63B3B", // 強調の赤
  accentSoft: "#E8625A",
  tamago: "#E8C34A", // 卵・ガリの黄色
  ikura: "#E07A3E", // イクラのオレンジ
} as const;

export const SUURI_FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";
export const SUURI_SERIF =
  "'Noto Serif JP', 'Noto Serif CJK JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif";

export const W = 1920;
export const H = 1080;

// ===== 和紙背景モード (寿司パートだけ背景が和風になる) =====
// シーンの絵はいつも通り「黒地に白い線・赤の強調」で描き、
// 和紙モードのときだけ Frame が色を反転して「和紙に墨の線・赤の強調」に変える。
// (全部の絵をそのまま使い回せるようにするための仕掛け)

export const WashiCtx = React.createContext(false);

// ===== 夜の球場モード (キラキラ回の第1章 = 野球の世界) =====
// 黒地のまま、外野フェンスの弧・芝のグラデ・照明塔を薄く敷いて「球場にいる」空気を出す。
// 和紙が優先 (washi のときは球場は描かない)。
export const StadiumCtx = React.createContext(false);

// 夜の球場の背景 (控えめ: 線は SP.dim 系、絵の邪魔をしない)
const StadiumBg: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs>
      {/* 芝: 下にいくほどわずかに緑がにじむ */}
      <linearGradient id="stadiumGrass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0E1A12" stopOpacity={0} />
        <stop offset="100%" stopColor="#13291A" stopOpacity={0.9} />
      </linearGradient>
      <radialGradient id="stadiumGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E8E4C8" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#E8E4C8" stopOpacity={0} />
      </radialGradient>
    </defs>
    {/* 外野フェンスの弧 (画面上方にゆるい弧) */}
    <path
      d="M -80 360 Q 960 130 2000 360"
      fill="none"
      stroke="#2A2A34"
      strokeWidth={10}
    />
    <path
      d="M -80 376 Q 960 146 2000 376"
      fill="none"
      stroke="#20202A"
      strokeWidth={4}
    />
    {/* 芝生 (フェンスから下へ) */}
    <path d="M -80 362 Q 960 132 2000 362 L 2000 1080 L -80 1080 Z" fill="url(#stadiumGrass)" />
    {/* ファウルライン (左右から中央下へ) */}
    <line x1={120} y1={1080} x2={700} y2={620} stroke="#3A3A44" strokeWidth={5} opacity={0.8} />
    <line x1={1800} y1={1080} x2={1220} y2={620} stroke="#3A3A44" strokeWidth={5} opacity={0.8} />
    {/* 照明塔 2本 (フェンスの向こう・ぼんやり光る) */}
    {[
      { x: 310, y: 180 },
      { x: 1610, y: 180 },
    ].map(({ x, y }) => (
      <g key={x}>
        <circle cx={x} cy={y} r={120} fill="url(#stadiumGlow)" />
        <line x1={x} y1={y + 36} x2={x} y2={y + 150} stroke="#2A2A34" strokeWidth={8} />
        <rect x={x - 56} y={y - 20} width={112} height={56} rx={8} fill="none" stroke="#3A3A44" strokeWidth={5} />
        {[0, 1, 2].map((c) => (
          <circle key={c} cx={x - 30 + c * 30} cy={y + 8} r={7} fill="#55523E" />
        ))}
      </g>
    ))}
  </svg>
);

const WASHI_BG = "#F2EBDB"; // 生成りの和紙
const WASHI_WAVE = "#C9BA9A"; // 青海波の薄い線

// 青海波 (せいがいは) のうっすらした繰り返し模様
const Seigaiha: React.FC = () => {
  const fan = (cx: number, cy: number, key: string) => (
    <g key={key}>
      <circle cx={cx} cy={cy} r={50} fill={WASHI_BG} />
      {[48, 36, 24, 12].map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={WASHI_WAVE}
          strokeWidth={2}
          opacity={0.55}
        />
      ))}
    </g>
  );
  // 扇を上の段から順に描き、下の段がその裾を隠す (うろこ状の重なり)
  const fans: [number, number][] = [
    [0, 0],
    [104, 0],
    [52, 26],
    [0, 52],
    [104, 52],
    [52, 78],
  ];
  return (
    <svg
      width={W}
      height={H}
      style={{ position: "absolute", inset: 0, opacity: 0.5 }}
    >
      <defs>
        <pattern
          id="seigaiha"
          width={104}
          height={52}
          patternUnits="userSpaceOnUse"
        >
          {fans.map(([x, y], i) => fan(x, y, `f${i}`))}
        </pattern>
        <radialGradient id="washiVignette" cx="50%" cy="46%" r="75%">
          <stop offset="60%" stopColor={WASHI_BG} stopOpacity={0} />
          <stop offset="100%" stopColor="#D9CDB2" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#seigaiha)" />
      <rect width={W} height={H} fill="url(#washiVignette)" />
    </svg>
  );
};

export const Header: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 34,
      left: 60,
      fontFamily: SUURI_FONT,
      fontSize: 26,
      letterSpacing: 4,
      color: SP.faint,
    }}
  >
    <span style={{ color: SP.accent }}>—</span> {SUURI_CHANNEL.name}
  </div>
);

export const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const washi = React.useContext(WashiCtx);
  const stadium = React.useContext(StadiumCtx);
  if (!washi) {
    return (
      <AbsoluteFill style={{ backgroundColor: SP.background }}>
        {stadium && <StadiumBg />}
        {children}
        <Header />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: WASHI_BG }}>
      <Seigaiha />
      {/* 白い線→墨色、赤→赤のまま になるように反転 (絵は黒地用のまま使い回す) */}
      <AbsoluteFill
        style={{
          filter:
            "invert(0.92) hue-rotate(180deg) saturate(1.5) brightness(0.86) contrast(1.35)",
        }}
      >
        {children}
        <Header />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 図解の見出し (上部中央・赤い細線つき)
export const DiagramTitle: React.FC<{ text?: string }> = ({ text }) => {
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        width: "100%",
        textAlign: "center",
        fontFamily: SUURI_FONT,
        fontSize: 44,
        fontWeight: 700,
        color: SP.ink,
        letterSpacing: 2,
      }}
    >
      {/* 下線はタイトルの文字幅に連動させる (§9-3)。inline-block の幅=文字幅 */}
      <div style={{ display: "inline-block" }}>
        {text}
        <div
          style={{
            width: "100%",
            height: 4,
            background: SP.accent,
            margin: "18px 0 0",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};

// オチ字幕の分割 (例: 「…流れてきます。ガリでした。」)。
// オチ (tail) はナレーションがそこを読む瞬間まで出さない。
// ratio = 本文の文字数割合 ≒ 音声の中でオチが始まる位置
export const splitPunchline = (scene?: {
  text?: string;
  motif?: string;
}): { head: string; tail: string; ratio: number } | null => {
  const text = scene?.text ?? "";
  if (scene?.motif !== "gari") return null;
  const m = text.match(/^(.+[。!?！？])(ガリでした。?)$/);
  if (!m) return null;
  const head = m[1];
  const tail = m[2];
  const ratio = head.length / (head.length + tail.length);
  return { head, tail, ratio };
};

// 人のピクトグラム (頭+肩)。(x, y) が頭の中心
export const Person: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  fill?: boolean;
  opacity?: number;
}> = ({ x, y, scale = 1, color = SP.line, fill = false, opacity = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <circle r={16} fill={fill ? color : "none"} stroke={color} strokeWidth={5} />
    <path
      d="M -26 66 q 2 -34 26 -36 q 24 2 26 36 Z"
      fill={fill ? color : "none"}
      stroke={color}
      strokeWidth={5}
      strokeLinejoin="round"
    />
  </g>
);

// 小さなラベル
export const SmallLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  color?: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  weight?: number;
}> = ({ x, y, text, color = SP.faint, size = 32, anchor = "middle", weight = 400 }) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fill={color}
    fontSize={size}
    fontWeight={weight}
    fontFamily={SUURI_FONT}
    letterSpacing={2}
  >
    {text}
  </text>
);

// 出現アニメの進み (spring)
export const useAppear = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.max(spring({ frame: frame - delay, fps, config: { damping: 16 } }), 0);
};

export const appearAt = (frame: number, fps: number, delay: number) =>
  Math.max(spring({ frame: frame - delay, fps, config: { damping: 16 } }), 0);

// ===== 寿司の共通部品 =====

export type NetaKind =
  | "maguro"
  | "otoro"
  | "chutoro"
  | "gari"
  | "plain"
  | "tamago"
  | "ika"
  | "ikura";

// 寿司皿 (横から見た図)。(x, y) は皿の中心 (縁の高さ)
export const Plate: React.FC<{
  x: number;
  y: number;
  scale?: number;
  kind?: NetaKind | "empty"; // empty = 皿だけ (何が来るかな?の演出用)
  opacity?: number;
  glow?: boolean; // 大トロの輝き (放射線)
}> = ({ x, y, scale = 1, kind = "plain", opacity = 1, glow = false }) => {
  // 和紙モードは色反転フィルタで黄色 (#E8C34A) が焦げ茶に沈むので、
  // 反転後に黄土色 (からし色) に見える色へ置き換える
  const washi = React.useContext(WashiCtx);
  const tamagoC = washi ? "#9C5400" : SP.tamago;
  // シャリを白く見せる工夫: 和紙モードでは皿を一段濃いグレーに落とし、
  // シャリ・イカを「絵の中で一番明るい色」にして白米に見せる。
  // 海苔 (卵の帯・軍艦) は和紙では黒に寄せる
  const plateFill = washi ? "#393939" : SP.background;
  // 黒背景では白く塗る。和紙では「黒く塗る→反転で白く見える」
  const shariFill = washi ? "#000000" : SP.ink;
  const noriFill = washi ? SP.ink : SP.background;
  return (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    {glow && (
      <g stroke={SP.accent} strokeWidth={4} strokeLinecap="round" opacity={0.9}>
        {[-150, -115, -80, -45, -10, 10, 45, 80, 115, 150].map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const x1 = Math.cos(rad) * 92;
          const y1 = Math.sin(rad) * 76 - 18;
          const x2 = Math.cos(rad) * 122;
          const y2 = Math.sin(rad) * 100 - 22;
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    )}
    {/* 皿 */}
    <ellipse rx={74} ry={17} fill={plateFill} stroke={SP.line} strokeWidth={4} />
    {kind === "empty" ? null : kind === "gari" ? (
      // ガリの小さな山 (甘酢漬けの黄色)。土台を塗りつぶして皿が透けないように
      <g strokeLinecap="round">
        <path d="M -26 -6 Q -18 -30 0 -26 Q 18 -34 26 -8 Z" fill={shariFill} stroke={tamagoC} strokeWidth={4} />
        <g stroke={tamagoC} strokeWidth={4} fill="none">
          <path d="M -14 -10 Q -6 -22 6 -18" />
          <path d="M -2 -8 Q 8 -16 16 -12" />
        </g>
      </g>
    ) : (
      <>
        {/* シャリ (塗りつぶして皿が透けないように) */}
        <rect
          x={-40}
          y={-26}
          width={80}
          height={22}
          rx={10}
          fill={shariFill}
          stroke={SP.line}
          strokeWidth={4}
        />
        {/* ネタ */}
        {kind === "plain" && (
          <rect x={-46} y={-40} width={92} height={18} rx={8} fill={shariFill} stroke={SP.line} strokeWidth={4} />
        )}
        {kind === "tamago" && (
          <>
            {/* 黄色い玉子焼き + 海苔の帯 */}
            <rect x={-46} y={-42} width={92} height={20} rx={6} fill={tamagoC} />
            <rect x={-10} y={-44} width={20} height={26} rx={3} fill={noriFill} stroke={SP.line} strokeWidth={3} />
          </>
        )}
        {kind === "ika" && (
          <>
            {/* 白い身 + 斜めの飾り包丁。塗りつぶして皿が透けないように */}
            <rect x={-46} y={-40} width={92} height={18} rx={8} fill={shariFill} stroke={SP.line} strokeWidth={4} />
            <path d="M -28 -36 l 10 10 M -6 -36 l 10 10 M 16 -36 l 10 10" stroke={SP.line} strokeWidth={3} fill="none" opacity={0.8} />
          </>
        )}
        {kind === "ikura" && (
          <>
            {/* 軍艦の海苔 + オレンジの粒 */}
            <rect x={-40} y={-44} width={80} height={40} rx={8} fill={noriFill} stroke={SP.line} strokeWidth={4} />
            {[-24, -8, 8, 24].map((cx) => (
              <circle key={cx} cx={cx} cy={-38} r={8} fill={SP.ikura} />
            ))}
            {[-16, 0, 16].map((cx) => (
              <circle key={`b${cx}`} cx={cx} cy={-46} r={8} fill={SP.ikura} />
            ))}
          </>
        )}
        {kind === "maguro" && (
          <rect x={-46} y={-40} width={92} height={18} rx={8} fill={SP.accent} />
        )}
        {kind === "chutoro" && (
          <>
            <rect x={-46} y={-40} width={92} height={18} rx={8} fill={SP.accentSoft} />
            <path d="M -30 -31 q 10 -6 20 0 M 2 -31 q 10 -6 20 0" stroke={SP.ink} strokeWidth={3} fill="none" opacity={0.7} />
          </>
        )}
        {kind === "otoro" && (
          <>
            <rect x={-50} y={-42} width={100} height={20} rx={9} fill={SP.accent} />
            {/* 霜降りの白いサシ */}
            <g stroke={SP.ink} strokeWidth={3} fill="none" opacity={0.85}>
              <path d="M -38 -40 L -28 -24" />
              <path d="M -18 -42 L -8 -24" />
              <path d="M 2 -40 L 12 -24" />
              <path d="M 22 -42 L 32 -24" />
            </g>
          </>
        )}
      </>
    )}
  </g>
  );
};

// 回転寿司のレーン (ベルトの2本線 + 流れる目盛り)。y はベルト上面
export const Lane: React.FC<{
  y: number;
  speed?: number; // 1フレームあたりの流れ (px)。0で止める
  x0?: number;
  x1?: number;
}> = ({ y, speed = 1.2, x0 = 0, x1 = W }) => {
  const frame = useCurrentFrame();
  const offset = ((frame * speed) % 90 + 90) % 90;
  const ticks: number[] = [];
  for (let x = x0 - 90 + offset; x < x1 + 90; x += 90) ticks.push(x);
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={SP.line} strokeWidth={4} />
      <line x1={x0} y1={y + 64} x2={x1} y2={y + 64} stroke={SP.dim} strokeWidth={4} />
      {ticks.map((x, i) => (
        <line key={i} x1={x} y1={y + 10} x2={x - 26} y2={y + 54} stroke={SP.dim} strokeWidth={3} />
      ))}
    </g>
  );
};
