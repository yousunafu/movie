// karakuri 作風 (お手本: 最高の老後 のテイスト分析から)。
// クラフト紙の背景 + 手描き風ゆらぎ線 + 太い焦げ茶の輪郭 + 丸頭2頭身キャラ。
// こだわり: 全シーンに常時動きを入れる (①人物のまばたき・体ゆれ ②図解が育つ ③ホコリの漂い)。
// 自販機ニセ硬貨回 (docs/jihanki-coin-script.txt) の21モチーフを実装。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Scene } from "../../types";
import { KARAKURI_CHANNEL } from "../../channel";

const W = 1920;
const H = 1080;

// ===== 配色 (styletest/StyleTest.tsx の実験から確定) =====
export const KRP = {
  paper: "#F2EDE4", // クリーム紙地
  paperCool: "#EAF0F4", // 青みの背景
  ink: "#3B332C", // 輪郭の焦げ茶 (真っ黒にしない)
  white: "#FDFBF7",
  gray: "#AEB6BE",
  grayDark: "#7E868E",
  blue: "#8FB8D8",
  blueDeep: "#4A78B8",
  blueSoft: "#C9DCEC",
  orange: "#E8923A",
  yellow: "#F2CE4C",
  cream: "#F7F2E2",
  green: "#7FBF7A",
  red: "#D3402E",
  silver: "#C9CFD4", // 白銅
  brass: "#D9B23C", // 黄銅
  bronze: "#B87A4B", // 青銅
  gold: "#D9C06A", // 500円玉
  copper: "#C78A4E", // 銅
  floor: "#DACBA9",
  captionBg: "rgba(34, 30, 27, 0.88)",
} as const;

export const KARAKURI_FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";
const FONT = KARAKURI_FONT;
const abs: React.CSSProperties = { position: "absolute", inset: 0 };

// ===== 小さな数学ヘルパー =====
export const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
// 区間 [a,b] を 0→1 に
export const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
// ふわっと飛び出す (easeOutBack)
export const pop = (t: number) => {
  const s = 1.70158;
  const p = t - 1;
  return t >= 1 ? 1 : 1 + (s + 1) * p * p * p + s * p * p;
};
export const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

// ===== 手描きゆらぎフィルタ + ハンコのかすれ =====
export const WobbleDefs: React.FC<{ seed?: number }> = ({ seed = 7 }) => (
  <defs>
    <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed={seed} result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
    <filter id="wobbleSoft" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed={seed + 3} result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
    </filter>
    <filter id="stampRough">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
    </filter>
  </defs>
);

// ===== 質感レイヤー (ビネット + 漂うホコリ)。f で粒がゆっくり上に流れる =====
export const Atmosphere: React.FC<{ f: number; dark?: boolean }> = ({ f, dark }) => {
  const dots = [
    [180, 160, 4], [420, 90, 3], [760, 210, 5], [1180, 120, 3],
    [1560, 180, 4], [1760, 420, 3], [240, 620, 3], [90, 880, 4],
    [1680, 760, 5], [1420, 920, 3], [620, 950, 4], [980, 860, 3],
  ] as const;
  return (
    <>
      <svg width={W} height={H} style={abs}>
        {dots.map(([x, y, r], i) => {
          const speed = 0.18 + (i % 3) * 0.1;
          const yy = (((y - f * speed) % H) + H) % H;
          const xx = x + Math.sin(f / 40 + i * 1.7) * 14;
          return (
            <circle key={i} cx={xx} cy={yy} r={r} fill={dark ? "#FFF8E0" : "#FFFFFF"} opacity={dark ? 0.5 : 0.75} />
          );
        })}
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 46%, rgba(0,0,0,0) 62%, rgba(40,28,16,0.22) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ===== 注釈キット =====
export const Badge: React.FC<{ text?: string }> = ({ text = "自販機のからくり" }) => (
  <div
    style={{
      position: "absolute", top: 54, left: 60,
      background: KRP.captionBg, color: KRP.white,
      fontFamily: FONT, fontWeight: 800, fontSize: 34,
      padding: "8px 26px", borderRadius: 999, letterSpacing: 2,
    }}
  >
    {text}
  </div>
);

export const LabelPill: React.FC<{
  x: number; y: number; text: string; color?: string; size?: number; centerX?: boolean;
}> = ({ x, y, text, color = KRP.ink, size = 34, centerX }) => (
  <div
    style={{
      position: "absolute", left: x, top: y,
      transform: centerX ? "translateX(-50%)" : undefined,
      background: KRP.white, color,
      border: `3px solid ${KRP.ink}`, borderRadius: 8,
      fontFamily: FONT, fontWeight: 800, fontSize: size,
      padding: "6px 20px",
      boxShadow: "3px 4px 0 rgba(59, 51, 44, 0.25)",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

export const Stamp: React.FC<{ x: number; y: number; text: string; size?: number; opacity?: number }> = ({
  x, y, text, size = 60, opacity = 0.92,
}) => (
  <div
    style={{
      position: "absolute", left: x, top: y,
      transform: "rotate(-7deg)",
      border: `6px solid ${KRP.red}`, borderRadius: 10,
      color: KRP.red, fontFamily: FONT, fontWeight: 900, fontSize: size,
      padding: "8px 26px", letterSpacing: 6, opacity,
      filter: "url(#stampRough)", whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

// ===== 人物キット (丸頭2頭身。f でまばたき+体の上下ゆれ) =====
type Face = "normal" | "worried" | "surprised" | "smile";
export const Person: React.FC<{
  x: number; // 足元中央のx
  y: number; // 足元のy
  s?: number;
  cloth?: string;
  clothDark?: string;
  helmet?: boolean;
  glasses?: boolean;
  hair?: "cap" | "none";
  face?: Face;
  gaze?: [number, number];
  tasuki?: string;
  lean?: number;
  f?: number; // 現在フレーム (まばたき・ゆれ用)
  phase?: number; // 人物ごとにずらす位相
  still?: boolean; // 体ゆれを止める
}> = ({
  x, y, s = 1, cloth = "#3E4B66", clothDark = "#2E3850",
  helmet = false, glasses = false, hair = "cap", face = "normal",
  gaze = [0, 0], tasuki, lean = 0, f = 0, phase = 0, still = false,
}) => {
  const [gx, gy] = gaze;
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 脚 */}
      <rect x={-30} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={6} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 靴 */}
      <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      <ellipse cx={18} cy={-4} rx={20} ry={9} fill={KRP.ink} />
      {/* 腕 */}
      <rect x={-78} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={56} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 胴体 */}
      <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      <rect x={18} y={-138} width={26} height={20} rx={4} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.55} />
      {/* たすき */}
      {tasuki && (
        <g>
          <polygon points="-58,-160 -30,-160 58,-72 58,-52 44,-52" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <text x={-2} y={-96} fontFamily={FONT} fontWeight={800} fontSize={24} fill={KRP.ink}
            transform="rotate(-45 -2 -96)" textAnchor="middle">
            {tasuki}
          </text>
        </g>
      )}
      {/* 頭 */}
      <circle cx={0} cy={-228} r={64} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {hair === "cap" && !helmet && (
        <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z" fill={KRP.ink} />
      )}
      {helmet && (
        <g>
          <path d="M -66 -248 Q -66 -306 0 -308 Q 66 -306 66 -248 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-76} y={-254} width={152} height={14} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-46} y={-294} width={14} height={40} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          <rect x={32} y={-294} width={14} height={40} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {/* 目 (まばたき中はとじ目の線) */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-34} y1={-220} x2={-14} y2={-220} />
          <line x1={14} y1={-220} x2={34} y2={-220} />
        </g>
      ) : (
        <g>
          <ellipse cx={-24} cy={-222} rx={13} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={24} cy={-222} rx={13} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-24 + gx} cy={-222 + gy} r={face === "surprised" ? 4.5 : 6} fill={KRP.ink} />
          <circle cx={24 + gx} cy={-222 + gy} r={face === "surprised" ? 4.5 : 6} fill={KRP.ink} />
        </g>
      )}
      {glasses && (
        <g fill="none" stroke={KRP.ink} strokeWidth={4.5}>
          <circle cx={-24} cy={-222} r={22} />
          <circle cx={24} cy={-222} r={22} />
          <line x1={-2} y1={-226} x2={2} y2={-226} />
          <line x1={-46} y1={-228} x2={-60} y2={-234} />
          <line x1={46} y1={-228} x2={60} y2={-234} />
        </g>
      )}
      {/* 眉 */}
      {face === "worried" ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-34} y1={-252} x2={-14} y2={-246} />
          <line x1={14} y1={-246} x2={34} y2={-252} />
        </g>
      ) : face === "surprised" ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-34} y1={-254} x2={-14} y2={-254} />
          <line x1={14} y1={-254} x2={34} y2={-254} />
        </g>
      ) : (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-34} y1={-248} x2={-14} y2={-250} />
          <line x1={14} y1={-250} x2={34} y2={-248} />
        </g>
      )}
      {/* 口 */}
      {face === "surprised" ? (
        <ellipse cx={0} cy={-186} rx={10} ry={13} fill={KRP.ink} />
      ) : face === "smile" ? (
        <path d="M -14 -192 Q 0 -178 14 -192" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "worried" ? (
        <path d="M -12 -184 Q 0 -192 12 -184" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <line x1={-10} y1={-186} x2={10} y2={-186} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===== 硬貨 (正面)。text は刻印。hole で5円玉の穴 =====
export const Coin: React.FC<{
  cx: number; cy: number; r: number; fill?: string; text?: string;
  hole?: boolean; textSize?: number; rotate?: number;
}> = ({ cx, cy, r, fill = KRP.gold, text, hole, textSize, rotate = 0 }) => (
  <g transform={`rotate(${rotate} ${cx} ${cy})`}>
    <circle cx={cx} cy={cy} r={r} fill={fill} stroke={KRP.ink} strokeWidth={Math.max(r * 0.045, 5)} />
    <circle cx={cx} cy={cy} r={r * 0.82} fill="none" stroke={KRP.ink} strokeWidth={Math.max(r * 0.022, 2.5)} opacity={0.5} />
    {hole && <circle cx={cx} cy={cy} r={r * 0.26} fill={KRP.paper} stroke={KRP.ink} strokeWidth={Math.max(r * 0.03, 3)} />}
    {text && !hole && (
      <text x={cx} y={cy + (textSize ?? r * 0.62) * 0.36} fontFamily={FONT} fontWeight={900}
        fontSize={textSize ?? r * 0.62} fill={KRP.ink} textAnchor="middle" opacity={0.8}>
        {text}
      </text>
    )}
  </g>
);

// ===== 自動販売機 (正面)。x,y は左上。s=1 で 幅360×高さ620 =====
export const Jihanki: React.FC<{ x: number; y: number; s?: number; f?: number; body?: string }> = ({
  x, y, s = 1, f = 0, body = "#D3402E",
}) => {
  const canColors = [KRP.blue, KRP.orange, KRP.green, KRP.yellow, KRP.blueSoft, "#E89AB0"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 本体 */}
      <rect x={0} y={0} width={360} height={620} rx={16} fill={body} stroke={KRP.ink} strokeWidth={9} />
      {/* 商品窓 */}
      <rect x={26} y={28} width={250} height={240} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      {/* 窓の光 (ちらちら) */}
      <rect x={26} y={28} width={250} height={240} rx={10} fill="#FFF6CE" opacity={0.18 + 0.1 * Math.sin(f / 9)} />
      {[0, 1].map((row) =>
        [0, 1, 2].map((col) => (
          <g key={`${row}-${col}`}>
            <rect x={46 + col * 76} y={48 + row * 110} width={52} height={78} rx={8}
              fill={canColors[row * 3 + col]} stroke={KRP.ink} strokeWidth={4} />
            <rect x={46 + col * 76} y={66 + row * 110} width={52} height={14} fill={KRP.white} opacity={0.6} />
          </g>
        )),
      )}
      {/* 右の操作パネル */}
      <rect x={290} y={28} width={56} height={330} rx={10} fill="#EFE8D8" stroke={KRP.ink} strokeWidth={5} />
      {/* 硬貨投入口 */}
      <rect x={310} y={56} width={14} height={44} rx={5} fill={KRP.ink} />
      {/* ボタン */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={318} cy={150 + i * 56} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 判定ランプ */}
      <circle cx={318} cy={330} r={10} fill={KRP.green} stroke={KRP.ink} strokeWidth={3.5}
        opacity={0.4 + 0.5 * Math.max(Math.sin(f / 7), 0)} />
      {/* 取り出し口 */}
      <rect x={30} y={470} width={220} height={84} rx={12} fill={KRP.ink} />
      <rect x={44} y={484} width={192} height={56} rx={9} fill="#6E573F" />
      {/* 返却口 (右下の小皿) */}
      <circle cx={312} cy={512} r={30} fill="#EFE8D8" stroke={KRP.ink} strokeWidth={5} />
      <circle cx={312} cy={512} r={17} fill={KRP.ink} opacity={0.75} />
      {/* 足 */}
      <rect x={16} y={616} width={60} height={16} fill={KRP.ink} />
      <rect x={284} y={616} width={60} height={16} fill={KRP.ink} />
    </g>
  );
};

// ===== 背景部品: 夕方の空 (流れる雲) と床 =====
export const EveningSky: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={0} y={0} width={W} height={430} fill="#F3D8B8" />
    <rect x={0} y={0} width={W} height={160} fill="#F7E3C8" />
    <circle cx={1540} cy={200} r={56} fill="#F5C96E" />
    {[0, 1, 2].map((i) => {
      const cx = ((i * 760 + f * 0.45) % (W + 420)) - 210;
      return (
        <g key={i} opacity={0.85}>
          <ellipse cx={cx} cy={120 + i * 64} rx={110} ry={25} fill="#FAEFD9" />
          <ellipse cx={cx + 72} cy={108 + i * 64} rx={66} ry={19} fill="#FAEFD9" />
        </g>
      );
    })}
    {/* 山なみ */}
    <path d="M 0 430 L 0 368 Q 300 306 620 360 Q 980 414 1340 350 Q 1640 306 1920 360 L 1920 430 Z"
      fill="#C9A9C0" opacity={0.6} />
    <line x1={0} y1={430} x2={W} y2={430} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
  </g>
);

export const Ground: React.FC<{ y?: number }> = ({ y = 700 }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={KRP.floor} />
    <line x1={0} y1={y} x2={W} y2={y} stroke={KRP.ink} strokeWidth={5} />
    <line x1={0} y1={y + 90} x2={W} y2={y + 90} stroke={KRP.ink} strokeWidth={2.5} opacity={0.3} />
  </g>
);

// 渦巻きのパス (渦電流用)
const spiralPath = (cx: number, cy: number, rMax: number, turns: number): string => {
  const pts: string[] = [];
  const n = 140;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    const r = t * rMax;
    pts.push(`${i === 0 ? "M" : "L"} ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
};

// 稲妻マーク
export const Bolt: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({ x, y, s = 1, opacity = 1 }) => (
  <polygon
    points={`${x},${y} ${x + 16 * s},${y} ${x + 6 * s},${y + 22 * s} ${x + 22 * s},${y + 22 * s} ${x - 6 * s},${y + 54 * s} ${x + 2 * s},${y + 30 * s} ${x - 12 * s},${y + 30 * s}`}
    fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} opacity={opacity}
  />
);

// ============================================================
// シーン 1: jihanki_intro — 夕方の街角。人が硬貨を入れ、1秒で判定される
// ============================================================
const SceneJihankiIntro: React.FC<{ f: number }> = ({ f }) => {
  // 硬貨が手元→投入口へ飛ぶループ (75フレーム周期)
  const T = 75;
  const t = (f % T) / T;
  const fly = seg(t, 0.05, 0.5); // 0→1 で移動
  const sx = 1010, sy = 560; // 手元
  const ex = 1305, ey = 472; // 投入口
  const coinX = sx + (ex - sx) * fly;
  const coinY = sy + (ey - sy) * fly - Math.sin(fly * Math.PI) * 110; // 山なり
  const showCoin = t >= 0.05 && t < 0.52;
  const ping = t >= 0.55 && t < 0.72; // チャリン
  const judged = t >= 0.74; // 判定○
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={41} />
        <g filter="url(#wobbleSoft)">
          <EveningSky f={f} />
        </g>
        <Ground />
        <g filter="url(#wobble)">
          {/* 自販機の影 */}
          <ellipse cx={1420} cy={838} rx={260} ry={22} fill="rgba(40,30,20,0.18)" />
          <Jihanki x={1240} y={210} s={1.0} f={f} />
          {/* 人 (財布を手に自販機を見上げる) */}
          <Person x={930} y={830} s={1.3} cloth="#4A6A8C" clothDark="#37506B" face="normal"
            gaze={[5, -2]} f={f} phase={0} />
          {/* 飛んでいく硬貨 */}
          {showCoin && <Coin cx={coinX} cy={coinY} r={26} text="500" textSize={20} rotate={fly * 540} />}
          {/* チャリンの火花 */}
          {ping && (
            <g stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
              <line x1={ex - 26} y1={ey - 30} x2={ex - 40} y2={ey - 48} />
              <line x1={ex + 10} y1={ey - 36} x2={ex + 14} y2={ey - 56} />
              <line x1={ex + 32} y1={ey - 18} x2={ex + 52} y2={ey - 28} />
            </g>
          )}
          {/* 判定○ (窓の上にぽん) */}
          {judged && (
            <g transform={`scale(${pop(seg(t, 0.74, 0.86))})`} style={{ transformOrigin: "1370px 300px" }}>
              <circle cx={1370} cy={300} r={54} fill={KRP.white} stroke={KRP.green} strokeWidth={10} />
              <path d="M 1344 300 L 1362 320 L 1398 280" fill="none" stroke={KRP.green} strokeWidth={11} strokeLinecap="round" />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={1420} y={150} text="1秒足らずで判定" color={KRP.red} size={38} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 2: coin_reject — メダルや外国コインが返却口へするり
// ============================================================
const SceneCoinReject: React.FC<{ f: number }> = ({ f }) => {
  const T = 95;
  const cycle = Math.floor(f / T) % 2; // 0=メダル 1=外国コイン
  const t = (f % T) / T;
  // 経路: 投入口(840,300) → レールを転がる(→1060,430) → センサーではじかれ → 返却口(700,720)
  const p1 = seg(t, 0.02, 0.3);
  const p2 = seg(t, 0.3, 0.52);
  const p3 = seg(t, 0.56, 0.82);
  let cx = 840, cy = 300;
  if (p1 > 0) { cx = 840 + 220 * p1; cy = 300 + 130 * p1; }
  if (p2 > 0) { cx = 1060 - 120 * p2; cy = 430 + 60 * easeOut(p2); }
  if (p3 > 0) { cx = 940 - 240 * easeOut(p3); cy = 490 + 230 * p3; }
  const bounced = t >= 0.5 && t < 0.62;
  const landed = t >= 0.82;
  return (
    <AbsoluteFill style={{ background: KRP.paperCool }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={43} />
        <Ground y={840} />
        <g filter="url(#wobble)">
          {/* 自販機の断面 (中の通り道が見える) */}
          <rect x={560} y={130} width={760} height={700} rx={18} fill="#D3402E" stroke={KRP.ink} strokeWidth={9} />
          <rect x={610} y={180} width={660} height={600} rx={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          {/* 投入口 (上) */}
          <rect x={816} y={140} width={48} height={56} rx={6} fill={KRP.ink} />
          {/* レール */}
          <line x1={820} y1={330} x2={1120} y2={470} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          {/* センサー (はじく壁) */}
          <rect x={1096} y={350} width={46} height={150} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1119} cy={380} r={9} fill={bounced ? KRP.red : "#8E6F5A"} stroke={KRP.ink} strokeWidth={3} />
          {/* 返却シュート */}
          <path d="M 960 500 Q 760 560 700 700" fill="none" stroke={KRP.ink} strokeWidth={6} strokeDasharray="4 14" opacity={0.6} />
          {/* 返却口 */}
          <rect x={636} y={690} width={150} height={70} rx={12} fill={KRP.ink} />
          <rect x={650} y={702} width={122} height={46} rx={9} fill="#6E573F" />
          {/* はじかれ飛沫 */}
          {bounced && (
            <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round">
              <line x1={1070} y1={400} x2={1046} y2={376} />
              <line x1={1066} y1={440} x2={1038} y2={442} />
              <line x1={1072} y1={478} x2={1050} y2={500} />
            </g>
          )}
          {/* 転がる偽物 (メダル=星 / 外国コイン=W) */}
          {!landed && t > 0.02 && (
            <g transform={`rotate(${t * 720} ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={34} fill={cycle === 0 ? "#D8C8E8" : "#CFD6DC"} stroke={KRP.ink} strokeWidth={5.5} />
              {cycle === 0 ? (
                <polygon
                  points={`${cx},${cy - 16} ${cx + 5},${cy - 5} ${cx + 16},${cy - 5} ${cx + 8},${cy + 3} ${cx + 11},${cy + 14} ${cx},${cy + 7} ${cx - 11},${cy + 14} ${cx - 8},${cy + 3} ${cx - 16},${cy - 5} ${cx - 5},${cy - 5}`}
                  fill={KRP.ink} opacity={0.65}
                />
              ) : (
                <text x={cx} y={cy + 10} fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}
                  textAnchor="middle" opacity={0.7}>W</text>
              )}
            </g>
          )}
          {/* 返却口に落ちた偽物 */}
          {landed && (
            <circle cx={706} cy={716} r={34} fill={cycle === 0 ? "#D8C8E8" : "#CFD6DC"} stroke={KRP.ink} strokeWidth={5.5} />
          )}
          {/* 見ている人 (右) */}
          <Person x={1560} y={832} s={1.22} cloth="#3E4663" clothDark="#2E3449" face="worried"
            gaze={t < 0.5 ? [-6, 0] : [-6, 4]} f={f} phase={1} lean={-2} />
        </g>
      </svg>
      <LabelPill x={706} y={790} text="返却口" size={32} centerX />
      <LabelPill x={1240} y={240} text="するりと戻る" color={KRP.red} size={36} />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 3: jihanki_inside — 中に人はいないのに、なぜ?
// ============================================================
const SceneJihankiInside: React.FC<{ f: number }> = ({ f }) => {
  const qScale = 1 + 0.08 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={47} />
        <Ground y={840} />
        <g filter="url(#wobble)">
          {/* 断面の自販機 (扉が開いている) */}
          <rect x={640} y={140} width={640} height={690} rx={18} fill="#D3402E" stroke={KRP.ink} strokeWidth={9} />
          <rect x={690} y={190} width={540} height={590} rx={12} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          {/* 上段: 商品棚 */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={716 + i * 126} y={214} width={96} height={120} rx={10}
              fill={[KRP.blue, KRP.orange, KRP.green, KRP.yellow][i]} stroke={KRP.ink} strokeWidth={5} />
          ))}
          <line x1={700} y1={352} x2={1220} y2={352} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          {/* 中の人 (想像) に大きな✕ */}
          <g opacity={0.9}>
            <circle cx={960} cy={500} r={56} fill="#C9BBA6" stroke={KRP.ink} strokeWidth={5} />
            <rect x={912} y={556} width={96} height={120} rx={14} fill="#C9BBA6" stroke={KRP.ink} strokeWidth={5} />
            {/* とぼけた顔 */}
            <circle cx={940} cy={494} r={5} fill={KRP.ink} />
            <circle cx={980} cy={494} r={5} fill={KRP.ink} />
            <line x1={948} y1={520} x2={972} y2={520} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
          </g>
          <g stroke={KRP.red} strokeWidth={20} strokeLinecap="round" opacity={0.95}>
            <line x1={840} y1={420} x2={1080} y2={700} />
            <line x1={1080} y1={420} x2={840} y2={700} />
          </g>
          {/* のぞきこむ人 (右) */}
          <Person x={1540} y={838} s={1.25} cloth="#4A6A8C" clothDark="#37506B" face="surprised"
            gaze={[-6, -2]} f={f} phase={2} lean={-7} />
        </g>
        {/* 大きな ? (脈打つ) */}
        <g transform={`translate(480 320) scale(${qScale})`}>
          <text x={0} y={0} fontFamily={FONT} fontWeight={900} fontSize={200} fill={KRP.red} textAnchor="middle">?</text>
        </g>
      </svg>
      {/* 字幕帯と被らないよう、機械の左横の空きに置く */}
      <LabelPill x={290} y={620} text="中に人はいない" color={KRP.red} size={36} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 5: coin_question — 硬貨の「何」を見ている?
// ============================================================
const SceneCoinQuestion: React.FC<{ f: number }> = ({ f }) => {
  const rock = Math.sin(f / 22) * 5;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={53} />
        <g filter="url(#wobble)">
          <ellipse cx={880} cy={810} rx={330} ry={28} fill="rgba(40,30,20,0.15)" />
          {/* 大きな硬貨 (ゆらゆら) */}
          <g transform={`rotate(${rock} 880 520)`}>
            <Coin cx={880} cy={520} r={250} />
            <text x={880} y={580} fontFamily={FONT} fontWeight={900} fontSize={200} fill={KRP.ink}
              textAnchor="middle" opacity={0.8}>?</text>
          </g>
          {/* 虫めがね (ふわふわ) */}
          <g transform={`translate(0 ${Math.sin(f / 15) * 10})`}>
            <circle cx={1330} cy={390} r={110} fill="rgba(201,220,236,0.4)" stroke={KRP.ink} strokeWidth={12} />
            <line x1={1408} y1={468} x2={1530} y2={590} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
          </g>
          {/* まわりに浮かぶ ? */}
          {[
            [460, 300, 0], [1480, 740, 1.8], [500, 760, 3.4],
          ].map(([x, y, ph], i) => (
            <text key={i} x={x} y={y + Math.sin(f / 14 + Number(ph)) * 12} fontFamily={FONT} fontWeight={900}
              fontSize={92} fill={KRP.blueDeep} textAnchor="middle"
              opacity={0.55 + 0.35 * Math.sin(f / 10 + Number(ph))}>?</text>
          ))}
        </g>
      </svg>
      <LabelPill x={880} y={150} text="硬貨の「何」を見ている?" size={40} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 6: answer_three — 答え: 大きさ・厚み・材質
// ============================================================
const SceneAnswerThree: React.FC<{ f: number; items?: { label: string }[] }> = ({ f, items }) => {
  const labels = items && items.length >= 3 ? items.map((i) => i.label) : ["大きさ", "厚み", "材質"];
  const boards = [
    { x: 240, start: 2 },
    { x: 740, start: 16 },
    { x: 1240, start: 30 },
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={59} />
        <g filter="url(#wobble)">
          {boards.map((b, i) => {
            const sc = pop(seg(f, b.start, b.start + 12));
            const float = Math.sin(f / 16 + i * 2) * 6;
            const cx = b.x + 220;
            return (
              <g key={i} transform={`translate(${cx} ${520 + float}) scale(${sc}) translate(${-cx} -520)`}>
                <rect x={b.x} y={310} width={440} height={420} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
                <rect x={b.x + 8} y={318} width={440} height={420} rx={20} fill="none" stroke="rgba(59,51,44,0.25)" strokeWidth={8} />
                {/* 番号の赤丸 */}
                <circle cx={b.x + 52} cy={360} r={34} fill={KRP.red} />
                <text x={b.x + 52} y={374} fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white} textAnchor="middle">
                  {i + 1}
                </text>
                {/* アイコン */}
                {i === 0 && (
                  <g>
                    <Coin cx={cx} cy={480} r={92} fill={KRP.silver} />
                    <line x1={cx - 130} y1={480} x2={cx + 130} y2={480} stroke={KRP.red} strokeWidth={8} />
                    <polygon points={`${cx - 130},480 ${cx - 104},468 ${cx - 104},492`} fill={KRP.red} />
                    <polygon points={`${cx + 130},480 ${cx + 104},468 ${cx + 104},492`} fill={KRP.red} />
                  </g>
                )}
                {i === 1 && (
                  <g>
                    <rect x={cx - 100} y={462} width={200} height={40} rx={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
                    <line x1={cx + 150} y1={436} x2={cx + 150} y2={528} stroke={KRP.red} strokeWidth={8} />
                    <polygon points={`${cx + 150},436 ${cx + 138},460 ${cx + 162},460`} fill={KRP.red} />
                    <polygon points={`${cx + 150},528 ${cx + 138},504 ${cx + 162},504`} fill={KRP.red} />
                  </g>
                )}
                {i === 2 && (
                  <g>
                    <Coin cx={cx} cy={480} r={92} fill={KRP.brass} />
                    {[0, 1, 2, 3].map((k) => {
                      const a = f / 20 + (k * Math.PI) / 2;
                      return (
                        <g key={k} transform={`translate(${cx + Math.cos(a) * 130} ${480 + Math.sin(a) * 130})`}
                          opacity={0.6 + 0.4 * Math.sin(f / 8 + k)}>
                          <path d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
                        </g>
                      );
                    })}
                  </g>
                )}
                <text x={cx} y={672} fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.ink} textAnchor="middle">
                  {labels[i]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={150} text="答えは この3つ" color={KRP.red} size={42} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 7: coinmech — 硬貨を見分ける装置「コインメック」
// ============================================================
const SceneCoinmech: React.FC<{ f: number }> = ({ f }) => {
  const T = 85;
  const t = (f % T) / T;
  const roll = seg(t, 0.08, 0.75);
  const cx = 740 + 430 * roll;
  const cy = 408 + 160 * roll;
  return (
    <AbsoluteFill style={{ background: KRP.paperCool }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={61} />
        <g filter="url(#wobble)">
          {/* 取り付け板 */}
          <rect x={560} y={250} width={800} height={520} rx={20} fill={KRP.gray} stroke={KRP.ink} strokeWidth={9} />
          <rect x={600} y={290} width={720} height={440} rx={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          {/* ネジ */}
          {[
            [590, 280], [1330, 280], [590, 740], [1330, 740],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={14} fill="#D8DDE2" stroke={KRP.ink} strokeWidth={4} />
              <line x1={x - 7} y1={y} x2={x + 7} y2={y} stroke={KRP.ink} strokeWidth={3} transform={`rotate(45 ${x} ${y})`} />
            </g>
          ))}
          {/* 投入の漏斗 */}
          <path d="M 680 290 L 790 290 L 755 370 L 715 370 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          {/* レール */}
          <line x1={700} y1={440} x2={1210} y2={620} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          {/* センサー箱 (LED点滅) */}
          <rect x={920} y={440} width={120} height={100} rx={12} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
          <circle cx={980} cy={420} r={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={3}
            opacity={0.35 + 0.6 * Math.max(Math.sin(f / 6), 0)} />
          {/* 出口2つ */}
          <rect x={1180} y={620} width={110} height={70} rx={10} fill={KRP.green} stroke={KRP.ink} strokeWidth={6} opacity={0.85} />
          <text x={1235} y={665} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink} textAnchor="middle">OK</text>
          <rect x={640} y={620} width={110} height={70} rx={10} fill="#E0A8A0" stroke={KRP.ink} strokeWidth={6} opacity={0.85} />
          <text x={695} y={665} fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink} textAnchor="middle">返却</text>
          {/* 転がる硬貨 */}
          {roll > 0 && roll < 1 && (
            <Coin cx={cx} cy={cy - 36} r={34} text="500" textSize={24} rotate={roll * 900} />
          )}
        </g>
      </svg>
      <LabelPill x={960} y={130} text="コインメック" color={KRP.red} size={48} centerX />
      <svg width={W} height={H} style={{ ...abs, pointerEvents: "none" }}>
        <polygon points="960,210 940,250 980,250" fill={KRP.ink} />
      </svg>
      <Stamp x={1430} y={160} text="硬貨の門番" size={44} />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 8: coin_rail — レールを転がりながらセンサーの前を通過
// ============================================================
const SceneCoinRail: React.FC<{ f: number }> = ({ f }) => {
  const T = 85;
  const t = (f % T) / T;
  const x0 = 330, x1 = 1520, y0 = 470, y1 = 660;
  const cx = x0 + (x1 - x0) * t;
  const cy = y0 + (y1 - y0) * t - 76;
  const near = Math.abs(cx - 960) < 150; // センサー前
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={67} />
        <g filter="url(#wobble)">
          {/* レール (2本線) */}
          <line x1={240} y1={456} x2={1620} y2={676} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          <line x1={240} y1={476} x2={1620} y2={696} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.45} />
          {/* レールの支え */}
          {[400, 760, 1120, 1480].map((x) => {
            const yTop = 456 + ((x - 240) / (1620 - 240)) * 220;
            return <line key={x} x1={x} y1={yTop} x2={x} y2={860} stroke={KRP.ink} strokeWidth={6} opacity={0.5} />;
          })}
          {/* センサーの門 */}
          <rect x={900} y={300} width={120} height={330} rx={16} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} opacity={0.35} />
          <rect x={900} y={300} width={120} height={60} rx={16} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={7} />
          {/* スキャン光 (通過時に光る) */}
          {near && (
            <g opacity={0.5 + 0.4 * Math.sin(f / 3)}>
              <rect x={930} y={360} width={60} height={280} fill={KRP.blue} />
              <circle cx={cx} cy={cy} r={92} fill="none" stroke={KRP.yellow} strokeWidth={10} />
            </g>
          )}
          {/* 転がる硬貨 (回転) */}
          <g transform={`rotate(${t * 1200} ${cx} ${cy})`}>
            <Coin cx={cx} cy={cy} r={76} text="500" textSize={52} />
            <circle cx={cx + 42} cy={cy - 28} r={8} fill={KRP.ink} opacity={0.5} />
          </g>
          {/* 動きの線 */}
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.45}>
            <line x1={cx - 150} y1={cy - 30} x2={cx - 104} y2={cy - 24} />
            <line x1={cx - 160} y1={cy + 14} x2={cx - 110} y2={cy + 18} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={190} text="センサー" size={38} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 9: size_check — 直径と厚みを測る
// ============================================================
const SceneSizeCheck: React.FC<{ f: number }> = ({ f }) => {
  const gap = Math.sin(f / 12) * 10; // ノギスがわずかに開閉
  const ok1 = Math.sin(f / 18) > 0;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={71} />
        <g filter="url(#wobble)">
          {/* 左: 直径 */}
          <Coin cx={580} cy={540} r={190} fill={KRP.silver} text="100" textSize={96} />
          <rect x={360} y={322 - gap} width={440} height={26} rx={8} fill="#EFE3B8" stroke={KRP.ink} strokeWidth={6} />
          <rect x={360} y={732 + gap} width={440} height={26} rx={8} fill="#EFE3B8" stroke={KRP.ink} strokeWidth={6} />
          <line x1={830} y1={350} x2={830} y2={730} stroke={KRP.red} strokeWidth={7} />
          <polygon points="830,350 818,376 842,376" fill={KRP.red} />
          <polygon points="830,730 818,704 842,704" fill={KRP.red} />
          {/* 右: 厚み (横から) */}
          <rect x={1210} y={512} width={260} height={56} rx={18} fill={KRP.silver} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1152 - gap * 0.6} y={460} width={40} height={160} rx={8} fill="#EFE3B8" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1488 + gap * 0.6} y={460} width={40} height={160} rx={8} fill="#EFE3B8" stroke={KRP.ink} strokeWidth={6} />
          <line x1={1340} y1={430} x2={1340} y2={340} stroke={KRP.red} strokeWidth={6} opacity={0.0} />
          <line x1={1210} y1={640} x2={1470} y2={640} stroke={KRP.red} strokeWidth={7} />
          <polygon points="1210,640 1236,628 1236,652" fill={KRP.red} />
          <polygon points="1470,640 1444,628 1444,652" fill={KRP.red} />
          {/* 規格どおり ✓ (交互に点灯) */}
          <g opacity={ok1 ? 1 : 0.25}>
            <circle cx={580} cy={212} r={40} fill={KRP.white} stroke={KRP.green} strokeWidth={9} />
            <path d="M 560 212 L 574 228 L 602 196" fill="none" stroke={KRP.green} strokeWidth={9} strokeLinecap="round" />
          </g>
          <g opacity={ok1 ? 0.25 : 1}>
            <circle cx={1340} cy={300} r={40} fill={KRP.white} stroke={KRP.green} strokeWidth={9} />
            <path d="M 1320 300 L 1334 316 L 1362 284" fill="none" stroke={KRP.green} strokeWidth={9} strokeLinecap="round" />
          </g>
        </g>
      </svg>
      {/* 字幕帯と被らないよう、コインの左横に置く */}
      <LabelPill x={200} y={430} text="直径" size={38} centerX />
      <LabelPill x={1340} y={700} text="厚み" size={38} centerX />
      <LabelPill x={960} y={130} text="規格どおりかを測る" size={38} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 10: fake_same — サイズそっくりの偽物は見抜けない
// ============================================================
const SceneFakeSame: React.FC<{ f: number }> = ({ f }) => {
  const shake = Math.sin(f / 2.5) * 2;
  const qScale = 1 + 0.08 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={73} />
        <g filter="url(#wobble)">
          {/* 本物 */}
          <Coin cx={600} cy={560} r={180} text="500" textSize={92} />
          {/* ニセ (同じ大きさ・ツノつき・そわそわ揺れる) */}
          <g transform={`translate(${shake} 0)`}>
            <Coin cx={1320} cy={560} r={180} fill="#D4B960" text="500" textSize={92} />
            <polygon points="1230,412 1252,344 1282,408" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <polygon points="1358,408 1388,344 1410,412" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 同じ大きさの矢印 */}
          <line x1={420} y1={820} x2={780} y2={820} stroke={KRP.ink} strokeWidth={6} />
          <line x1={1140} y1={820} x2={1500} y2={820} stroke={KRP.ink} strokeWidth={6} />
          {/* どちらも✓ (サイズ検査は通る) */}
          {[600, 1320].map((x) => (
            <g key={x} opacity={0.9}>
              <circle cx={x} cy={318} r={36} fill={KRP.white} stroke={KRP.green} strokeWidth={8} />
              <path d={`M ${x - 18} 318 L ${x - 5} 333 L ${x + 22} 303`} fill="none" stroke={KRP.green} strokeWidth={8} strokeLinecap="round" />
            </g>
          ))}
          {/* まん中の大きな ? */}
          <g transform={`translate(960 580) scale(${qScale})`}>
            <text x={0} y={0} fontFamily={FONT} fontWeight={900} fontSize={170} fill={KRP.red} textAnchor="middle">?</text>
          </g>
        </g>
      </svg>
      <LabelPill x={600} y={145} text="本物" size={40} centerX />
      <LabelPill x={1320} y={145} text="ニセ" color={KRP.red} size={40} centerX />
      <LabelPill x={960} y={218} text="サイズだけでは見抜けない" color={KRP.red} size={38} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 11: material_intro — 本命の検査「材質チェック」
// ============================================================
const SceneMaterialIntro: React.FC<{ f: number }> = ({ f }) => {
  const bannerScale = 1 + 0.02 * Math.sin(f / 10);
  return (
    <AbsoluteFill style={{ background: "#E8E1D2" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={79} />
        <g filter="url(#wobble)">
          {/* スポットライトの光 */}
          <polygon points="960,0 700,760 1220,760" fill="#FBF3D8" opacity={0.75 + 0.1 * Math.sin(f / 12)} />
          <ellipse cx={960} cy={760} rx={300} ry={46} fill="#FBF3D8" opacity={0.8} />
          {/* 照らされる硬貨 */}
          <Coin cx={960} cy={620} r={150} text="500" textSize={78} rotate={Math.sin(f / 24) * 6} />
          {/* きらめき */}
          {[
            [800, 480, 0], [1130, 520, 1.6], [900, 760, 3.1], [1060, 440, 4.4],
          ].map(([x, y, ph], i) => (
            <g key={i} transform={`translate(${x} ${y})`} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9 + Number(ph)))}>
              <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          ))}
        </g>
      </svg>
      {/* 大きな見出し看板 */}
      <div
        style={{
          position: "absolute", left: "50%", top: 180,
          transform: `translateX(-50%) scale(${bannerScale})`,
          background: KRP.white, border: `8px solid ${KRP.ink}`, borderRadius: 18,
          padding: "22px 70px", boxShadow: "6px 8px 0 rgba(59,51,44,0.3)",
          fontFamily: FONT, fontWeight: 900, fontSize: 84, color: KRP.red, letterSpacing: 4,
        }}
      >
        材質チェック
      </div>
      <Stamp x={1400} y={150} text="本命" size={56} />
      <Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 12: coil — センサーの正体は電気を流したコイル
// ============================================================
const SceneCoil: React.FC<{ f: number }> = ({ f }) => {
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={83} />
        <g filter="url(#wobble)">
          {/* 電池 */}
          <rect x={300} y={430} width={130} height={220} rx={14} fill={KRP.green} stroke={KRP.ink} strokeWidth={8} />
          <rect x={340} y={406} width={50} height={24} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <text x={365} y={520} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink} textAnchor="middle">+</text>
          <text x={365} y={610} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink} textAnchor="middle">−</text>
          {/* 配線 (電流が流れるアニメ: 破線が流れる) */}
          <path id="wirePath" d="M 365 406 L 365 310 L 960 310 L 960 430 M 960 650 L 960 760 L 365 760 L 365 650"
            fill="none" stroke={KRP.ink} strokeWidth={8} />
          <path d="M 365 406 L 365 310 L 960 310 L 960 430 M 960 650 L 960 760 L 365 760 L 365 650"
            fill="none" stroke={KRP.yellow} strokeWidth={5} strokeDasharray="18 26"
            strokeDashoffset={-f * 5} />
          {/* コイルの芯 */}
          <rect x={790} y={470} width={340} height={140} rx={20} fill={KRP.gray} stroke={KRP.ink} strokeWidth={8} />
          {/* 巻き線 (銅色) */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <ellipse key={i} cx={830 + i * 44} cy={540} rx={20} ry={86}
              fill="none" stroke={KRP.copper} strokeWidth={13} />
          ))}
          <ellipse cx={830 + 6 * 44} cy={540} rx={20} ry={86} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
          {/* 稲妻 (ちらちら) */}
          <Bolt x={1200} y={430} s={1.3} opacity={Math.sin(f / 5) > 0 ? 1 : 0.25} />
          <Bolt x={1290} y={530} s={1.0} opacity={Math.sin(f / 5 + 2) > 0 ? 1 : 0.25} />
          {/* 磁界の弧 (ふわっと広がる) */}
          {[0, 1, 2].map((i) => {
            const r = 120 + (((f * 1.6 + i * 60) % 180));
            return (
              <ellipse key={i} cx={960} cy={540} rx={r * 1.7} ry={r}
                fill="none" stroke={KRP.blueDeep} strokeWidth={5}
                opacity={0.5 * (1 - (r - 120) / 180)} strokeDasharray="10 14" />
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={140} text="正体は 電気を流したコイル" size={40} centerX />
      <LabelPill x={365} y={820} text="電気" size={32} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 13: eddy — 硬貨の中に「渦電流」が生まれる
// ============================================================
const SceneEddy: React.FC<{ f: number }> = ({ f }) => {
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={89} />
        <g filter="url(#wobble)">
          {/* コイル (横から・左) */}
          <rect x={250} y={420} width={110} height={280} rx={16} fill={KRP.gray} stroke={KRP.ink} strokeWidth={8} />
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={305} cy={470 + i * 60} rx={66} ry={22} fill="none" stroke={KRP.copper} strokeWidth={11} />
          ))}
          {/* コイルから広がる磁界 */}
          {[0, 1, 2].map((i) => {
            const r = 60 + (((f * 2.2 + i * 70) % 210));
            return (
              <path key={i}
                d={`M ${380 + r * 0.3} ${560 - r} Q ${380 + r * 1.5} 560 ${380 + r * 0.3} ${560 + r}`}
                fill="none" stroke={KRP.blueDeep} strokeWidth={6}
                opacity={0.55 * (1 - (r - 60) / 210)} strokeDasharray="12 14" />
            );
          })}
          {/* 硬貨 (大) と中の渦 */}
          <Coin cx={1180} cy={560} r={230} />
          <g transform={`rotate(${f * 2.4} 1180 560)`}>
            <path d={spiralPath(1180, 560, 168, 3.2)} fill="none" stroke={KRP.blueDeep} strokeWidth={10} strokeLinecap="round" />
          </g>
          <g transform={`rotate(${-f * 1.8} 1180 560)`} opacity={0.5}>
            <path d={spiralPath(1180, 560, 100, 2.1)} fill="none" stroke={KRP.blue} strokeWidth={7} strokeLinecap="round" />
          </g>
          {/* 渦の矢印 */}
          <polygon points="1332,430 1308,418 1312,446" fill={KRP.blueDeep}
            transform={`rotate(${f * 2.4} 1180 560)`} />
        </g>
      </svg>
      <LabelPill x={1180} y={200} text="渦電流" color={KRP.red} size={48} centerX />
      <LabelPill x={1180} y={830} text="小さな電気の渦" size={32} centerX />
      <LabelPill x={305} y={330} text="コイル" size={32} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 14: eddy_compare — 渦のでき方は金属の種類で違う
// ============================================================
const SceneEddyCompare: React.FC<{ f: number }> = ({ f }) => {
  const wave = (cx: number, amp: number, len: number): string => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const x = cx - 240 + i * 12;
      const y = 800 + Math.sin(i / len) * amp;
      pts.push(`${i === 0 ? "M" : "L"} ${x} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={97} />
        <g filter="url(#wobble)">
          {/* 左: 白銅 (細かく速い渦) */}
          <Coin cx={560} cy={480} r={190} fill={KRP.silver} />
          <g transform={`rotate(${f * 3.4} 560 480)`}>
            <path d={spiralPath(560, 480, 142, 4.4)} fill="none" stroke={KRP.blueDeep} strokeWidth={8} strokeLinecap="round" />
          </g>
          {/* 右: 黄銅 (おおらかで遅い渦) */}
          <Coin cx={1360} cy={480} r={190} fill={KRP.brass} />
          <g transform={`rotate(${f * 1.5} 1360 480)`}>
            <path d={spiralPath(1360, 480, 142, 2.2)} fill="none" stroke={KRP.orange} strokeWidth={10} strokeLinecap="round" />
          </g>
          {/* 下: それぞれの波形 */}
          <path d={wave(560, 26, 1.3)} fill="none" stroke={KRP.blueDeep} strokeWidth={6}
            strokeDasharray="640 640" strokeDashoffset={-f * 6} />
          <path d={wave(1360, 46, 3.2)} fill="none" stroke={KRP.orange} strokeWidth={6}
            strokeDasharray="640 640" strokeDashoffset={-f * 6} />
        </g>
      </svg>
      <LabelPill x={560} y={168} text="白銅" size={38} centerX />
      <LabelPill x={1360} y={168} text="黄銅" size={38} centerX />
      <Stamp x={812} y={560} text="違う" size={64} />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 15: coin_lineup — 日本の硬貨は材質が少しずつ違う
// ============================================================
const SceneCoinLineup: React.FC<{ f: number }> = ({ f }) => {
  const coins = [
    { cx: 420, fill: KRP.silver, text: "100", label: "白銅" },
    { cx: 960, fill: KRP.brass, text: "", label: "黄銅", hole: true },
    { cx: 1500, fill: KRP.bronze, text: "10", label: "青銅" },
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={101} />
        <g filter="url(#wobble)">
          {coins.map((c, i) => {
            const bobY = Math.sin(f / 18 + i * 2.1) * 10;
            const shineT = ((f * 2.4 + i * 110) % 330) - 165;
            return (
              <g key={i} transform={`translate(0 ${bobY})`}>
                <ellipse cx={c.cx} cy={760} rx={180} ry={20} fill="rgba(40,30,20,0.14)" />
                <Coin cx={c.cx} cy={500} r={170} fill={c.fill} text={c.text} textSize={84} hole={c.hole} />
                {/* 光のすじ (ツヤ) */}
                <g clipPath={`url(#coinClip${i})`}>
                  <rect x={c.cx + shineT - 20} y={310} width={44} height={380}
                    fill="#FFFFFF" opacity={0.4} transform={`rotate(20 ${c.cx} 500)`} />
                </g>
                <clipPath id={`coinClip${i}`}>
                  <circle cx={c.cx} cy={500} r={162} />
                </clipPath>
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={420} y={740} text="100円 = 白銅" size={36} centerX />
      <LabelPill x={960} y={740} text="5円 = 黄銅" size={36} centerX />
      <LabelPill x={1500} y={740} text="10円 = 青銅" size={36} centerX />
      <LabelPill x={960} y={140} text="材質が少しずつ違う" color={KRP.red} size={40} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 16: electric_eye — 目で見るのではなく、電気の反応で見分ける
// ============================================================
const SceneElectricEye: React.FC<{ f: number }> = ({ f }) => {
  const eyeBlink = (f % 80) < 6;
  const checkScale = 1 + 0.06 * Math.sin(f / 9);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={103} />
        <g filter="url(#wobble)">
          {/* 左パネル: 目に✕ */}
          <rect x={160} y={260} width={640} height={480} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          {eyeBlink ? (
            <line x1={370} y1={500} x2={590} y2={500} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
          ) : (
            <g>
              <ellipse cx={480} cy={500} rx={130} ry={82} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
              <circle cx={480} cy={500} r={44} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={480} cy={500} r={18} fill={KRP.ink} />
            </g>
          )}
          <g stroke={KRP.red} strokeWidth={16} strokeLinecap="round" opacity={0.92}>
            <line x1={330} y1={370} x2={630} y2={630} />
            <line x1={630} y1={370} x2={330} y2={630} />
          </g>
          {/* 中央の矢印 (流れる破線) */}
          <line x1={830} y1={500} x2={1070} y2={500} stroke={KRP.ink} strokeWidth={9}
            strokeDasharray="22 18" strokeDashoffset={-f * 4} />
          <polygon points="1090,500 1052,482 1052,518" fill={KRP.ink} />
          {/* 右パネル: コイル+硬貨+⚡+✓ */}
          <rect x={1120} y={260} width={640} height={480} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={1270} cy={440 + i * 56} rx={52} ry={18} fill="none" stroke={KRP.copper} strokeWidth={9} />
          ))}
          <Coin cx={1530} cy={520} r={110} />
          <g transform={`rotate(${f * 2.6} 1530 520)`}>
            <path d={spiralPath(1530, 520, 78, 2.8)} fill="none" stroke={KRP.blueDeep} strokeWidth={6} strokeLinecap="round" />
          </g>
          <Bolt x={1395} y={330} s={1.1} opacity={Math.sin(f / 5) > 0 ? 1 : 0.3} />
          <g transform={`translate(1640 330) scale(${checkScale})`}>
            <circle cx={0} cy={0} r={44} fill={KRP.white} stroke={KRP.green} strokeWidth={10} />
            <path d="M -22 0 L -6 18 L 26 -16" fill="none" stroke={KRP.green} strokeWidth={10} strokeLinecap="round" />
          </g>
        </g>
      </svg>
      {/* 3行字幕と被らないよう、パネルの上に置く */}
      <LabelPill x={480} y={168} text="目では 見ない" size={36} centerX />
      <LabelPill x={1440} y={168} text="電気の反応で 見分ける" color={KRP.red} size={36} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 17: breach — かつてこの仕組みが破られた
// ============================================================
const SceneBreach: React.FC<{ f: number }> = ({ f }) => {
  const crackLen = 900;
  const reveal = easeOut(seg(f, 6, 55));
  const shake = f < 16 ? Math.sin(f * 2.2) * (16 - f) * 0.5 : 0;
  const warnOn = Math.sin(f / 7) > -0.2;
  return (
    <AbsoluteFill style={{ background: "#E3DACA" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={107} />
        <g filter="url(#wobble)" transform={`translate(${shake} 0)`}>
          {/* コインメックの装置 */}
          <rect x={620} y={220} width={680} height={560} rx={20} fill={KRP.gray} stroke={KRP.ink} strokeWidth={9} />
          <rect x={668} y={268} width={584} height={464} rx={14} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
          <line x1={740} y1={380} x2={1180} y2={540} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={0.6} />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={960} cy={560 + i * 40} rx={46} ry={15} fill="none" stroke={KRP.copper} strokeWidth={7} opacity={0.7} />
          ))}
          {/* ひび割れ (描き進む) */}
          <path
            d="M 960 180 L 920 300 L 1000 380 L 930 480 L 1010 560 L 950 660 L 1000 760 L 960 830"
            fill="none" stroke={KRP.red} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={crackLen} strokeDashoffset={crackLen * (1 - reveal)}
          />
          <path
            d="M 930 480 L 840 520 M 1010 560 L 1100 600"
            fill="none" stroke={KRP.red} strokeWidth={8} strokeLinecap="round"
            opacity={reveal > 0.7 ? 1 : 0}
          />
          {/* 警告の三角 (点滅) */}
          <g opacity={warnOn ? 1 : 0.25}>
            <polygon points="1430,260 1530,430 1330,430" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
            <text x={1430} y={408} fontFamily={FONT} fontWeight={900} fontSize={110} fill={KRP.ink} textAnchor="middle">!</text>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={130} text="この仕組みが 破られた" color={KRP.red} size={42} centerX />
      <Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 18: won_fake — 1990年代、「変造500円」の大流行
// ============================================================
const SceneWonFake: React.FC<{ f: number }> = ({ f }) => {
  const drillSpin = f * 26;
  const T = 95;
  const t = (f % T) / T;
  const drilling = t > 0.25 && t < 0.72;
  const holeR = 42 * easeOut(seg(t, 0.3, 0.72));
  return (
    <AbsoluteFill style={{ background: "#DED3BE" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={109} />
        <g filter="url(#wobble)">
          {/* 作業台 */}
          <rect x={360} y={640} width={1200} height={48} rx={10} fill="#8A6F52" stroke={KRP.ink} strokeWidth={8} />
          <rect x={430} y={688} width={44} height={200} fill="#6E573F" stroke={KRP.ink} strokeWidth={6} />
          <rect x={1450} y={688} width={44} height={200} fill="#6E573F" stroke={KRP.ink} strokeWidth={6} />
          {/* 怪しい人影 (全身シルエット) */}
          <g fill="#4A4038" stroke={KRP.ink} strokeWidth={5}>
            <circle cx={1210} cy={360} r={74} />
            <rect x={1130} y={430} width={160} height={180} rx={22} />
            {/* 帽子 */}
            <path d="M 1134 340 Q 1136 282 1210 280 Q 1284 282 1286 340 Z" fill={KRP.ink} />
            <rect x={1120} y={332} width={180} height={16} rx={8} fill={KRP.ink} />
          </g>
          {/* 細い目 (下を見る) */}
          <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round">
            <line x1={1176} y1={368} x2={1198} y2={372} />
            <line x1={1224} y1={372} x2={1246} y2={368} />
          </g>
          {/* 腕 (ドリルへ) */}
          <rect x={1090} y={470} width={120} height={30} rx={15} fill="#4A4038" stroke={KRP.ink} strokeWidth={5}
            transform="rotate(24 1090 470)" />
          {/* ドリル */}
          <g transform={`translate(${920} ${430 + (drilling ? Math.sin(f * 1.8) * 3 : 0)})`}>
            <rect x={-34} y={0} width={68} height={110} rx={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-12} y={110} width={24} height={74} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
            {/* 回転ビット (線がぐるぐる) */}
            <g transform={`rotate(${drillSpin} 0 184)`}>
              <line x1={-16} y1={184} x2={16} y2={184} stroke={KRP.ink} strokeWidth={5} />
              <line x1={0} y1={168} x2={0} y2={200} stroke={KRP.ink} strokeWidth={5} />
            </g>
          </g>
          {/* 硬貨 (穴が開いていく) */}
          <Coin cx={920} cy={620} r={92} fill="#CFD6DC" text={holeR > 30 ? "" : "500"} textSize={44} />
          {holeR > 2 && <circle cx={920} cy={614} r={holeR} fill="#DED3BE" stroke={KRP.ink} strokeWidth={5} />}
          {/* 火花 */}
          {drilling && (
            <g stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" opacity={Math.sin(f * 2) > 0 ? 1 : 0.4}>
              <line x1={880} y1={596} x2={856} y2={578} />
              <line x1={960} y1={596} x2={986} y2={580} />
              <line x1={900} y1={560} x2={888} y2={538} />
            </g>
          )}
          {/* 横に積まれた変造硬貨 */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <Coin cx={600 - i * 26} cy={610 - i * 10} r={62} fill="#CFD6DC" />
              <circle cx={600 - i * 26} cy={606 - i * 10} r={26} fill="#DED3BE" stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
        </g>
      </svg>
      <LabelPill x={330} y={150} text="1990年代" size={38} />
      <Stamp x={1340} y={130} text="変造500円" size={54} />
      <Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 19: new_coin_2000 — 2000年、新素材の500円玉へ
// ============================================================
const SceneNewCoin2000: React.FC<{ f: number }> = ({ f }) => {
  const newScale = pop(seg(f, 8, 26));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={113} />
        <g filter="url(#wobble)">
          {/* 旧500円 (穴あき変造に悩まされた) */}
          <Coin cx={520} cy={540} r={170} fill="#CFD6DC" text="500" textSize={84} />
          <circle cx={520} cy={534} r={44} fill={KRP.paper} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          <g stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round" opacity={0.8}>
            <line x1={400} y1={420} x2={640} y2={660} />
          </g>
          {/* 矢印 */}
          <line x1={760} y1={540} x2={1080} y2={540} stroke={KRP.ink} strokeWidth={10}
            strokeDasharray="26 20" strokeDashoffset={-f * 4.5} />
          <polygon points="1110,540 1066,518 1066,562" fill={KRP.ink} />
          {/* 新500円 (ぽんと登場 + きらめき) */}
          <g transform={`translate(1400 540) scale(${newScale}) translate(-1400 -540)`}>
            <Coin cx={1400} cy={540} r={190} fill={KRP.gold} text="500" textSize={94} />
            {[0, 1, 2, 3].map((i) => {
              const a = f / 16 + (i * Math.PI) / 2;
              return (
                <g key={i} transform={`translate(${1400 + Math.cos(a) * 250} ${540 + Math.sin(a) * 250})`}
                  opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 8 + i * 1.3))}>
                  <path d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z"
                    fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
                </g>
              );
            })}
          </g>
        </g>
      </svg>
      <LabelPill x={520} y={790} text="悩まされた旧500円" size={34} centerX />
      <LabelPill x={1400} y={790} text="電気の性質が違う新素材" color={KRP.red} size={34} centerX />
      <LabelPill x={960} y={140} text="2000年" size={44} centerX />
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// シーン 20: bicolor_2021 — 2021年、2種類の金属の3層構造 (組み上がる)
// ============================================================
const SceneBicolor2021: React.FC<{ f: number }> = ({ f }) => {
  const asm = easeOut(seg(f, 6, 48)); // 3層が集まる
  const ringIn = easeOut(seg(f, 50, 78)); // 外周リングがはまる
  const floatY = Math.sin(f / 20) * 6;
  const cx = 1180;
  const cy = 500;
  const layers = [
    { off: -200, fill: KRP.silver, label: "白銅" },
    { off: 0, fill: KRP.copper, label: "銅" },
    { off: 200, fill: KRP.silver, label: "白銅" },
  ];
  const gap = 54; // 組み上がり後の層の間隔
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={127} />
        <g filter="url(#wobble)" transform={`translate(0 ${floatY})`}>
          {/* 3層 (横から見た板が集まる) */}
          {layers.map((l, i) => {
            const y = cy + (i - 1) * gap + l.off * (1 - asm);
            return (
              <g key={i}>
                <ellipse cx={cx} cy={y} rx={240} ry={44} fill={l.fill} stroke={KRP.ink} strokeWidth={7} />
                <ellipse cx={cx} cy={y - 10} rx={240} ry={40} fill={l.fill} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
              </g>
            );
          })}
          {/* 外周リング (別の金属・横からスライドしてはまる) */}
          <g transform={`translate(${(1 - ringIn) * 460} 0)`} opacity={ringIn > 0.02 ? 1 : 0}>
            <ellipse cx={cx} cy={cy} rx={290} ry={120} fill="none" stroke={KRP.brass} strokeWidth={30} />
            <ellipse cx={cx} cy={cy} rx={290} ry={120} fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          </g>
          {/* 層のラベル線 */}
          {layers.map((l, i) => {
            const y = cy + (i - 1) * gap;
            return (
              <line key={i} x1={700} y1={360 + i * 110} x2={cx - 250} y2={y}
                stroke={KRP.ink} strokeWidth={4} opacity={asm > 0.9 ? 0.6 : 0} />
            );
          })}
        </g>
      </svg>
      {/* 層ラベル (組み上がったら表示) */}
      {easeOut(seg(f, 44, 56)) > 0.5 && (
        <>
          <LabelPill x={560} y={330} text="白銅" size={34} centerX />
          <LabelPill x={560} y={440} text="銅" color={KRP.red} size={34} centerX />
          <LabelPill x={560} y={550} text="白銅" size={34} centerX />
        </>
      )}
      {ringIn > 0.9 && <LabelPill x={1180} y={720} text="まわりは別の金属" size={32} centerX />}
      <LabelPill x={960} y={130} text="2021年 3層構造に" color={KRP.red} size={42} centerX />
      {f > 84 && <Stamp x={1430} y={210} text="偽造ほぼ不可能" size={40} />}
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== カード類 =====

// クイズカード (「さて、ここで問題です。」)
const QuizCard: React.FC<{ f: number }> = ({ f }) => {
  const p = pop(seg(f, 2, 18));
  const pulse = 1 + Math.sin(f / 9) * 0.04;
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: KARAKURI_FONT }}>
      <WobbleDefs seed={61} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {/* 二重の枠 */}
        <rect x={120} y={100} width={1680} height={760} fill="none" stroke={KRP.ink} strokeWidth={7} rx={26} filter="url(#wobble)" />
        <rect x={150} y={128} width={1620} height={704} fill="none" stroke={KRP.ink} strokeWidth={3} rx={20} filter="url(#wobbleSoft)" />
        {/* Qバッジ */}
        <g transform={`translate(960, 300) scale(${p * pulse})`}>
          <circle r={110} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} filter="url(#wobble)" />
          <text y={42} textAnchor="middle" fontSize={120} fontWeight={900} fill={KRP.white} fontFamily={KARAKURI_FONT}>Q</text>
        </g>
        {/* 漂う ? */}
        {[0, 1, 2].map((i) => {
          const fy = Math.sin((f + i * 37) / 16) * 14;
          const xs = [480, 1420, 1240][i];
          const ys = [260, 220, 560][i];
          return (
            <text key={i} x={xs} y={ys + fy} fontSize={64 + i * 10} fontWeight={800} fill={KRP.grayDark} opacity={0.6} fontFamily={KARAKURI_FONT}>?</text>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute", top: 480, left: 0, right: 0, textAlign: "center",
          fontSize: 76, fontWeight: 900, color: KRP.ink, opacity: easeOut(seg(f, 10, 26)),
        }}
      >
        さて、ここで問題です。
      </div>
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 結論カード (文全体を大きく表示)
const ConclusionCard: React.FC<{ f: number; text: string }> = ({ f, text }) => {
  const fade = easeOut(seg(f, 4, 24));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: KARAKURI_FONT }}>
      <WobbleDefs seed={62} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <rect x={110} y={90} width={1700} height={820} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} rx={26} filter="url(#wobble)" />
        <rect x={140} y={118} width={1640} height={764} fill="none" stroke={KRP.ink} strokeWidth={3} rx={20} filter="url(#wobbleSoft)" />
        {/* 飾り: ミニ自販機とツノ付きニセ硬貨 */}
        <g transform="translate(260, 760) scale(0.5)" opacity={0.85}>
          <rect x={-90} y={-250} width={180} height={300} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={8} filter="url(#wobble)" />
          <rect x={-62} y={-222} width={124} height={90} rx={8} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-62} y={-110} width={50} height={26} rx={6} fill={KRP.ink} />
        </g>
        <g transform={`translate(1660, 770) rotate(${Math.sin(f / 11) * 6})`} opacity={0.85}>
          <circle r={62} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} filter="url(#wobble)" />
          <path d="M -38 -48 L -22 -78 L -12 -52 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 38 -48 L 22 -78 L 12 -52 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} />
          <text y={16} textAnchor="middle" fontSize={44} fontWeight={800} fill={KRP.ink} fontFamily={KARAKURI_FONT}>ニセ</text>
        </g>
      </svg>
      <div
        style={{
          position: "absolute", top: 0, left: 240, right: 240, height: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
          fontSize: 62, fontWeight: 900, color: KRP.ink, lineHeight: 1.7, opacity: fade,
        }}
      >
        {text}
      </div>
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// エンディングカード (チャンネル名)
export const EndingCard: React.FC<{ f: number }> = ({ f }) => {
  const p = pop(seg(f, 2, 20));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: KARAKURI_FONT }}>
      <WobbleDefs seed={63} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <g transform={`translate(960, 380) scale(${p})`}>
          <circle r={130} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} filter="url(#wobble)" />
          <text y={48} textAnchor="middle" fontSize={130} fontWeight={900} fill={KRP.white} fontFamily={KARAKURI_FONT}>
            {KARAKURI_CHANNEL.iconLetter}
          </text>
        </g>
        {/* キラキラ */}
        {[0, 1, 2, 3].map((i) => {
          const tw = 0.4 + 0.6 * Math.abs(Math.sin((f + i * 23) / 14));
          const xs = [700, 1220, 820, 1120][i];
          const ys = [230, 260, 540, 520][i];
          return (
            <g key={i} transform={`translate(${xs}, ${ys}) scale(${tw})`} opacity={tw}>
              <path d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute", top: 560, left: 0, right: 0, textAlign: "center",
          fontSize: 68, fontWeight: 900, color: KRP.ink, opacity: easeOut(seg(f, 14, 32)),
        }}
      >
        {KARAKURI_CHANNEL.name}
      </div>
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// 汎用フォールバック (割り当て漏れ時)
const SceneConcept: React.FC<{ f: number; text: string }> = ({ f, text }) => {
  const p = pop(seg(f, 2, 18));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: KARAKURI_FONT }}>
      <WobbleDefs seed={64} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <g transform={`translate(960, 430) scale(${p}) rotate(${Math.sin(f / 13) * 2})`}>
          <circle r={180} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} filter="url(#wobble)" />
          <circle r={26} fill="none" stroke={KRP.ink} strokeWidth={6} transform="translate(-30, -20)" />
          <path d="M -12 0 L 40 52" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" transform="translate(-30, -20)" />
        </g>
      </svg>
      {text && <LabelPill x={960} y={700} text={text} size={44} centerX />}
      <Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 出口 =====

// カードが文全体を表示するか (字幕の二重表示を防ぐ)
// クイズカードも文をカード内に出すので、字幕は重ねない (二重表示を防ぐ)
export const karakuriCardShowsFullText = (scene: Scene): boolean =>
  scene.type === "card" && !scene.isEnding;

export const KarakuriSceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  if (scene.isEnding) return <EndingCard f={f} />;
  if (scene.type === "card") {
    if (scene.motif === "quiz") return <QuizCard f={f} />;
    return <ConclusionCard f={f} text={scene.text} />;
  }
  switch (scene.motif) {
    case "jihanki_intro": return <SceneJihankiIntro f={f} />;
    case "coin_reject": return <SceneCoinReject f={f} />;
    case "jihanki_inside": return <SceneJihankiInside f={f} />;
    case "coin_question": return <SceneCoinQuestion f={f} />;
    case "answer_three": return <SceneAnswerThree f={f} items={scene.items} />;
    case "coinmech": return <SceneCoinmech f={f} />;
    case "coin_rail": return <SceneCoinRail f={f} />;
    case "size_check": return <SceneSizeCheck f={f} />;
    case "fake_same": return <SceneFakeSame f={f} />;
    case "material_intro": return <SceneMaterialIntro f={f} />;
    case "coil": return <SceneCoil f={f} />;
    case "eddy": return <SceneEddy f={f} />;
    case "eddy_compare": return <SceneEddyCompare f={f} />;
    case "coin_lineup": return <SceneCoinLineup f={f} />;
    case "electric_eye": return <SceneElectricEye f={f} />;
    case "breach": return <SceneBreach f={f} />;
    case "won_fake": return <SceneWonFake f={f} />;
    case "new_coin_2000": return <SceneNewCoin2000 f={f} />;
    case "bicolor_2021": return <SceneBicolor2021 f={f} />;
    default: return <SceneConcept f={f} text={scene.emphasis ?? scene.title ?? ""} />;
  }
};
