// 作風コピーの実験 (「最高の老後」風)。本編パイプラインとは独立したテスト用。
// ねらい: 今のコード描画のまま、以下の4点でどこまで寄せられるか確かめる。
//   1. 手描き風のゆらぎ線 (feTurbulence + feDisplacementMap)
//   2. 太い焦げ茶の輪郭 + ベタ塗りパステル
//   3. 質感レイヤー (クリーム紙地・ビネット・ホコリ粒子・落ち影)
//   4. 注釈キット (ハンコ・点線枠・マーカー円・ラベル札・字幕帯)
// フレーム0: 車とエンジンの図解 / 1: ロータリー比較図 / 2: 黒板グラフ / 3: 人物テスト

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const W = 1920;
const H = 1080;

// ===== 配色 (お手本の実測イメージ) =====
const RP = {
  paper: "#F2EDE4", // クリーム紙地
  paperCool: "#EAF0F4", // 青みの背景 (車の回)
  room: "#8A6F52", // 茶色の部屋の壁
  roomDark: "#6E573F",
  ink: "#3B332C", // 輪郭の焦げ茶 (真っ黒にしない)
  white: "#FDFBF7",
  gray: "#AEB6BE", // 機械のグレー
  grayDark: "#7E868E",
  blue: "#8FB8D8", // 吸気の青
  blueSoft: "#C9DCEC",
  orange: "#E8923A", // 排気のオレンジ
  yellow: "#F2CE4C", // マーカー黄
  cream: "#F7F2E2",
  green: "#7FBF7A", // 電池の緑
  red: "#D3402E", // ハンコ・強調の赤
  board: "#3E7BB5", // 黒板 (青)
  boardWood: "#8A5A33",
  chalk: "#F2E86E", // チョーク黄
  captionBg: "rgba(34, 30, 27, 0.88)",
} as const;

const FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";

// ===== 共通: 手描きゆらぎフィルタ =====
// すべての絵をこのフィルタ越しに描くと、数学的に正確な線が「人の手の線」になる。
const WobbleDefs: React.FC<{ seed?: number }> = ({ seed = 7 }) => (
  <defs>
    <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.013"
        numOctaves="2"
        seed={seed}
        result="noise"
      />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
    </filter>
    <filter id="wobbleSoft" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.02"
        numOctaves="2"
        seed={seed + 3}
        result="noise"
      />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
    </filter>
  </defs>
);

// ===== 共通: 質感レイヤー (ビネット + ホコリ) =====
const Atmosphere: React.FC<{ dark?: boolean }> = ({ dark }) => {
  // ホコリ粒子: 乱数は固定 (静止画の再現性のため)
  const dots = [
    [180, 160, 4], [420, 90, 3], [760, 210, 5], [1180, 120, 3],
    [1560, 180, 4], [1760, 420, 3], [240, 620, 3], [90, 880, 4],
    [1680, 760, 5], [1420, 920, 3], [620, 950, 4], [980, 860, 3],
  ] as const;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {dots.map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={dark ? "#FFF8E0" : "#FFFFFF"}
            opacity={dark ? 0.5 : 0.75}
          />
        ))}
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

// 章バッジ (左上の黒いラベル)
const ChapterBadge: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      top: 54,
      left: 60,
      background: RP.captionBg,
      color: RP.white,
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: 38,
      padding: "10px 30px",
      borderRadius: 999,
      letterSpacing: 2,
    }}
  >
    {text}
  </div>
);

// 字幕帯 (下中央の黒帯 + 白文字)
const Caption: React.FC<{ lines: string[] }> = ({ lines }) => (
  <div
    style={{
      position: "absolute",
      bottom: 64,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        background: RP.captionBg,
        color: RP.white,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 52,
        lineHeight: 1.45,
        padding: "18px 44px",
        borderRadius: 14,
        textAlign: "center",
        letterSpacing: 1,
      }}
    >
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  </div>
);

// 白いラベル札 (ふちつき)
const LabelPill: React.FC<{
  x: number;
  y: number;
  text: string;
  color?: string;
  size?: number;
}> = ({ x, y, text, color = RP.ink, size = 34 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      background: RP.white,
      color,
      border: `3px solid ${RP.ink}`,
      borderRadius: 8,
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size,
      padding: "6px 20px",
      boxShadow: "3px 4px 0 rgba(59, 51, 44, 0.25)",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

// 朱印ハンコ (赤枠 + 赤文字、少し傾ける)
const Stamp: React.FC<{ x: number; y: number; text: string; size?: number }> = ({
  x,
  y,
  text,
  size = 60,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "rotate(-7deg)",
      border: `6px solid ${RP.red}`,
      borderRadius: 10,
      color: RP.red,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      padding: "8px 26px",
      letterSpacing: 6,
      opacity: 0.92,
      filter: "url(#stampRough)",
    }}
  >
    {text}
  </div>
);

// ===== フレーム0: 車とエンジン (青み背景 + 道路) =====
const SceneCar: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: RP.paperCool }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <WobbleDefs />
        {/* 道路 */}
        <g filter="url(#wobble)">
          <rect x={-20} y={810} width={W + 40} height={10} fill={RP.ink} />
          <rect x={-20} y={820} width={W + 40} height={260} fill="#C6CDD3" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect
              key={i}
              x={60 + i * 300}
              y={920}
              width={120}
              height={14}
              rx={7}
              fill={RP.white}
              opacity={0.9}
            />
          ))}
        </g>

        {/* 車体の影 */}
        <ellipse cx={930} cy={815} rx={560} ry={26} fill="rgba(40,30,20,0.18)" />

        {/* 車 (横から) */}
        <g filter="url(#wobble)">
          {/* ボディ */}
          <path
            d="M 380 790
               L 360 700 Q 355 640 420 630
               L 560 610 Q 700 470 870 460
               L 1180 460 Q 1330 470 1420 600
               L 1480 620 Q 1545 640 1540 700 L 1520 790
               Q 1480 800 1440 795
               L 560 795 Q 420 800 380 790 Z"
            fill={RP.white}
            stroke={RP.ink}
            strokeWidth={10}
            strokeLinejoin="round"
          />
          {/* 窓 */}
          <path
            d="M 640 615 Q 740 495 880 487 L 1150 487 Q 1270 497 1340 600 Z"
            fill={RP.blueSoft}
            stroke={RP.ink}
            strokeWidth={8}
          />
          <line x1={990} y1={490} x2={990} y2={612} stroke={RP.ink} strokeWidth={8} />
          {/* 前後のライト */}
          <rect x={372} y={668} width={46} height={26} rx={10} fill={RP.yellow} stroke={RP.ink} strokeWidth={6} />
          <rect x={1496} y={664} width={40} height={24} rx={8} fill={RP.red} stroke={RP.ink} strokeWidth={6} />
          {/* ドアの線と取っ手 */}
          <path d="M 985 615 L 985 780" stroke={RP.ink} strokeWidth={7} opacity={0.6} />
          <rect x={915} y={648} width={52} height={14} rx={7} fill={RP.ink} opacity={0.75} />
          {/* 床下の電池 (緑のセル) */}
          <rect x={620} y={742} width={660} height={44} rx={10} fill="#2E3A46" stroke={RP.ink} strokeWidth={7} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect
              key={i}
              x={636 + i * 80}
              y={752}
              width={56}
              height={24}
              rx={5}
              fill={RP.green}
            />
          ))}
          {/* タイヤ */}
          {[560, 1320].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={800} r={92} fill="#4A4A50" stroke={RP.ink} strokeWidth={10} />
              <circle cx={cx} cy={800} r={40} fill="#C6CDD3" stroke={RP.ink} strokeWidth={8} />
            </g>
          ))}
          {/* エンジン (前方、グレーの塊 + ファン) */}
          <g>
            <rect x={420} y={640} width={150} height={110} rx={18} fill={RP.gray} stroke={RP.ink} strokeWidth={9} />
            <circle cx={495} cy={695} r={34} fill={RP.cream} stroke={RP.ink} strokeWidth={8} />
            <path
              d="M 495 668 Q 512 684 495 695 Q 478 684 495 668 Z
                 M 520 702 Q 505 715 495 695 Z M 470 702 Q 485 715 495 695 Z"
              fill={RP.blue}
              stroke={RP.ink}
              strokeWidth={5}
            />
            <rect x={436} y={656} width={40} height={16} rx={6} fill={RP.orange} stroke={RP.ink} strokeWidth={5} />
          </g>
        </g>

        {/* 注目の点線枠 (エンジンまわりだけ) */}
        <g filter="url(#wobbleSoft)">
          <rect
            x={398}
            y={614}
            width={196}
            height={154}
            rx={16}
            fill="none"
            stroke="#4A78B8"
            strokeWidth={8}
            strokeDasharray="18 14"
          />
        </g>

        {/* 黄色いマーカー円 (前タイヤに注目) + 赤の✕ (エンジンとの接続が切れている) */}
        <g filter="url(#wobbleSoft)">
          <circle
            cx={560}
            cy={795}
            r={120}
            fill="none"
            stroke={RP.yellow}
            strokeWidth={15}
            opacity={0.95}
          />
          {/* エンジン→タイヤの切れた点線 */}
          <path
            d="M 480 775 Q 505 782 530 790"
            fill="none"
            stroke={RP.red}
            strokeWidth={9}
            strokeDasharray="16 13"
          />
          <g stroke={RP.red} strokeWidth={18} strokeLinecap="round" opacity={0.95}>
            <line x1={330} y1={700} x2={408} y2={778} />
            <line x1={408} y1={700} x2={330} y2={778} />
          </g>
        </g>
        <defs>
          <filter id="stampRough">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
        </defs>
      </svg>

      <ChapterBadge text="01｜ためし書き" />
      <LabelPill x={240} y={180} text="タイヤを回していない" color={RP.red} size={44} />
      <Atmosphere />
      <Caption lines={["このエンジンは、タイヤを", "回していません。"]} />
    </AbsoluteFill>
  );
};

// ===== フレーム1: ロータリー比較図 (茶色の部屋 + 方眼パネル) =====

// ペリトロコイド曲線 (ロータリーのまゆ型ハウジング)
const peritrochoid = (cx: number, cy: number, Rr: number, e: number): string => {
  const pts: string[] = [];
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = cx + e * Math.cos(3 * t) + Rr * Math.cos(t);
    const y = cy + e * Math.sin(3 * t) + Rr * Math.sin(t);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
};

// ルーローの三角形 (ローター)。angleDeg で回転
const reuleaux = (cx: number, cy: number, R: number, angleDeg: number): string => {
  const a = (angleDeg * Math.PI) / 180;
  const v = [0, 1, 2].map((i) => {
    const t = a + (i * 2 * Math.PI) / 3 - Math.PI / 2;
    return [cx + R * Math.cos(t), cy + R * Math.sin(t)] as const;
  });
  const s = R * Math.sqrt(3); // 辺の弧の半径
  return (
    `M ${v[0][0].toFixed(1)} ${v[0][1].toFixed(1)} ` +
    `A ${s} ${s} 0 0 1 ${v[1][0].toFixed(1)} ${v[1][1].toFixed(1)} ` +
    `A ${s} ${s} 0 0 1 ${v[2][0].toFixed(1)} ${v[2][1].toFixed(1)} ` +
    `A ${s} ${s} 0 0 1 ${v[0][0].toFixed(1)} ${v[0][1].toFixed(1)} Z`
  );
};

const Rotary: React.FC<{
  cx: number;
  cy: number;
  scale: number;
  angle: number;
  highlight?: boolean;
}> = ({ cx, cy, scale, angle, highlight }) => {
  const Rr = 150 * scale; // ハウジングの基本半径
  const e = 22 * scale;
  const rotorR = 118 * scale;
  const housing = peritrochoid(cx, cy, Rr, e);
  const housingOuter = peritrochoid(cx, cy, Rr + 34 * scale, e);
  const clipId = `rotClip${cx}`;
  return (
    <g>
      {/* 外殻 (グレー) */}
      <path d={housingOuter} fill={RP.gray} stroke={RP.ink} strokeWidth={9} />
      {/* 内室 (クリーム) */}
      <path d={housing} fill={RP.cream} stroke={RP.ink} strokeWidth={7} />
      <defs>
        <clipPath id={clipId}>
          <path d={housing} />
        </clipPath>
      </defs>
      {/* 吸気 (青) と排気 (オレンジ) の部屋 */}
      <g clipPath={`url(#${clipId})`}>
        <ellipse
          cx={cx - Rr * 0.72}
          cy={cy + Rr * 0.35}
          rx={Rr * 0.75}
          ry={Rr * 0.9}
          fill={RP.blue}
          opacity={0.9}
        />
        <ellipse
          cx={cx + Rr * 0.74}
          cy={cy - Rr * 0.1}
          rx={Rr * 0.72}
          ry={Rr * 0.95}
          fill={RP.orange}
          opacity={0.92}
        />
      </g>
      {/* ローター (ルーローの三角形) */}
      <path
        d={reuleaux(cx + e * 0.6, cy + e * 0.4, rotorR, angle)}
        fill={highlight ? "#F5F8FB" : "#EFF3F6"}
        stroke={highlight ? RP.yellow : RP.ink}
        strokeWidth={highlight ? 12 : 8}
      />
      {highlight ? (
        <path
          d={reuleaux(cx + e * 0.6, cy + e * 0.4, rotorR, angle)}
          fill="none"
          stroke={RP.ink}
          strokeWidth={5}
        />
      ) : null}
      {/* 頂点シール (赤い点) */}
      {[0, 1, 2].map((i) => {
        const t = ((angle * Math.PI) / 180) + (i * 2 * Math.PI) / 3 - Math.PI / 2;
        return (
          <circle
            key={i}
            cx={cx + e * 0.6 + rotorR * Math.cos(t)}
            cy={cy + e * 0.4 + rotorR * Math.sin(t)}
            r={9 * scale + 3}
            fill={RP.red}
            stroke={RP.ink}
            strokeWidth={3}
          />
        );
      })}
      {/* 偏心軸 */}
      <circle cx={cx + e * 0.6} cy={cy + e * 0.4} r={40 * scale} fill="#D8DDE2" stroke={RP.ink} strokeWidth={7} />
      <circle cx={cx + e * 0.6} cy={cy + e * 0.4} r={14 * scale} fill={RP.grayDark} stroke={RP.ink} strokeWidth={5} />
      <line
        x1={cx + e * 0.6}
        y1={cy + e * 0.4}
        x2={cx + e * 0.6 + 60 * scale * Math.cos(((angle - 90) * Math.PI) / 180)}
        y2={cy + e * 0.4 + 60 * scale * Math.sin(((angle - 90) * Math.PI) / 180)}
        stroke={RP.red}
        strokeWidth={7}
      />
    </g>
  );
};

const SceneRotary: React.FC = () => (
  <AbsoluteFill style={{ background: RP.room }}>
    {/* 部屋の床 */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 130,
        background: RP.roomDark,
      }}
    />
    {/* 方眼パネル */}
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 70,
        width: W - 180,
        height: H - 220,
        background: RP.paper,
        borderRadius: 20,
        border: `6px solid ${RP.ink}`,
        boxShadow: "0 14px 0 rgba(30,20,10,0.35)",
      }}
    />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <WobbleDefs seed={13} />
      {/* 方眼 */}
      <g opacity={0.25}>
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={`v${i}`} x1={130 + i * 72} y1={85} x2={130 + i * 72} y2={H - 165} stroke="#B9A98E" strokeWidth={2} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1={100} y1={120 + i * 64} x2={W - 100} y2={120 + i * 64} stroke="#B9A98E" strokeWidth={2} />
        ))}
      </g>
      {/* 2基のロータリー */}
      <g filter="url(#wobble)">
        <Rotary cx={560} cy={480} scale={1.0} angle={18} />
        <Rotary cx={1360} cy={480} scale={0.92} angle={-30} highlight />
      </g>
      {/* 排気量の白箱 */}
      <g filter="url(#wobbleSoft)">
        <rect x={400} y={760} width={320} height={86} rx={18} fill={RP.white} stroke={RP.ink} strokeWidth={7} />
        <rect x={1220} y={760} width={300} height={86} rx={18} fill={RP.white} stroke={RP.ink} strokeWidth={7} />
      </g>
      {/* 定規 (右下) */}
      <g filter="url(#wobbleSoft)">
        <rect x={1280} y={905} width={520} height={44} rx={6} fill="#EFE3B8" stroke={RP.ink} strokeWidth={6} />
        {Array.from({ length: 17 }).map((_, i) => (
          <line
            key={i}
            x1={1300 + i * 30}
            y1={905}
            x2={1300 + i * 30}
            y2={i % 4 === 0 ? 933 : 922}
            stroke={RP.ink}
            strokeWidth={3}
          />
        ))}
      </g>
    </svg>

    {/* テキスト類 (HTMLで上に重ねる) */}
    <div style={{ position: "absolute", left: 420, top: 118, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: RP.ink }}>
      2つ回し
    </div>
    <div style={{ position: "absolute", left: 1270, top: 118, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: RP.red }}>
      1つ回し
    </div>
    <div style={{ position: "absolute", left: 330, top: 196, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: RP.ink, opacity: 0.75 }}>
      R 105mm・はば 80mm × 2
    </div>
    <div style={{ position: "absolute", left: 1180, top: 196, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: RP.ink, opacity: 0.75 }}>
      R 120mm・はば 76mm × 1
    </div>
    <div style={{ position: "absolute", left: 430, top: 772, fontFamily: FONT, fontWeight: 900, fontSize: 54, color: RP.ink }}>
      1,308<span style={{ fontSize: 32 }}>cc</span>
    </div>
    <div style={{ position: "absolute", left: 1266, top: 772, fontFamily: FONT, fontWeight: 900, fontSize: 54, color: RP.red }}>
      830<span style={{ fontSize: 32 }}>cc</span>
    </div>
    <Stamp x={840} y={110} text="① 小さい" size={54} />
    <Atmosphere dark />
    <Caption lines={["大きくなったのに、", "全体は小さくなった。"]} />
  </AbsoluteFill>
);

// ===== フレーム2: 黒板グラフ (茶色の部屋 + 青い黒板) =====
const SceneBoard: React.FC = () => {
  // グラフの線 (平ら → 山 → 谷 → 平ら)
  const graph =
    "M 360 560 L 760 560 Q 820 560 850 470 Q 880 380 910 470 Q 940 560 980 640 " +
    "Q 1010 700 1040 620 Q 1070 560 1140 560 L 1280 560";
  return (
    <AbsoluteFill style={{ background: "#A98E6B" }}>
      {/* 壁の照明 */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <WobbleDefs seed={21} />
        <g filter="url(#wobbleSoft)">
          {[400, 960, 1520].map((x) => (
            <g key={x}>
              <line x1={x} y1={0} x2={x} y2={56} stroke={RP.ink} strokeWidth={6} />
              <path d={`M ${x - 56} 92 Q ${x} 36 ${x + 56} 92 Z`} fill="#3E4A3A" stroke={RP.ink} strokeWidth={6} />
              <ellipse cx={x} cy={96} rx={54} ry={12} fill="#F5EDC9" />
            </g>
          ))}
        </g>
        {/* 黒板 (木枠 + 青) */}
        <g filter="url(#wobble)">
          <rect x={150} y={150} width={1620} height={700} rx={26} fill={RP.boardWood} stroke={RP.ink} strokeWidth={10} />
          <rect x={200} y={196} width={1520} height={608} rx={14} fill={RP.board} stroke={RP.ink} strokeWidth={8} />
          {/* 黒板の消し跡 (うっすら) */}
          <ellipse cx={620} cy={330} rx={220} ry={60} fill="#FFFFFF" opacity={0.06} />
          <ellipse cx={1260} cy={620} rx={260} ry={70} fill="#FFFFFF" opacity={0.05} />
          {/* 軸 */}
          <g stroke="#F2F0E4" strokeWidth={7} fill="none" strokeLinecap="round">
            <line x1={360} y1={280} x2={360} y2={700} />
            <line x1={360} y1={700} x2={1300} y2={700} />
          </g>
          {/* グラフ線 (チョーク黄) */}
          <path d={graph} fill="none" stroke={RP.chalk} strokeWidth={10} strokeLinecap="round" />
          <circle cx={1280} cy={560} r={14} fill={RP.chalk} stroke={RP.ink} strokeWidth={4} />
          {/* 基準の点線 */}
          <line x1={360} y1={560} x2={1300} y2={560} stroke="#F2F0E4" strokeWidth={4} strokeDasharray="4 16" opacity={0.65} />
          {/* チョーク置き */}
          <rect x={1380} y={820} width={200} height={18} rx={6} fill="#6E4826" stroke={RP.ink} strokeWidth={4} />
          <rect x={1400} y={806} width={60} height={14} rx={7} fill={RP.white} />
          <rect x={1480} y={806} width={60} height={14} rx={7} fill={RP.chalk} />
        </g>
      </svg>

      {/* 軸ラベル・注釈 */}
      <div style={{ position: "absolute", left: 250, top: 262, fontFamily: FONT, fontWeight: 800, fontSize: 38, color: "#F2F0E4" }}>
        回転
      </div>
      <div style={{ position: "absolute", left: 1150, top: 716, fontFamily: FONT, fontWeight: 800, fontSize: 38, color: "#F2F0E4" }}>
        時間 →
      </div>
      <LabelPill x={430} y={312} text="上がったり、下がったり" size={38} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <defs>
          <filter id="stampRough">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
        </defs>
      </svg>
      <Stamp x={1430} y={280} text="揺れ" size={64} />
      <ChapterBadge text="02｜ためし書き" />
      <Atmosphere dark />
      <Caption lines={["揺れが問題になるのは、回転が", "上がったり下がったりするときです。"]} />
    </AbsoluteFill>
  );
};

// ===== 人物キット (お手本の頭身2〜2.5キャラをSVGで再現) =====
// 特徴: 大きな丸頭 + 縦長の白目 + 小さな黒目 (視線で演技) + 眉と口だけの感情表現。
// 体はずんどう、腕脚は棒状。制服・ヘルメット・メガネの着せ替えで量産できる。
type Face = "normal" | "worried" | "surprised" | "smile";
const Person: React.FC<{
  x: number; // 足元中央のx
  y: number; // 足元のy
  s?: number; // スケール (1 = 身長約270px)
  cloth?: string; // 服の色
  clothDark?: string; // ズボンの色
  helmet?: boolean;
  glasses?: boolean;
  hair?: "cap" | "none";
  face?: Face;
  gaze?: [number, number]; // 黒目のずらし (視線)
  tasuki?: string; // たすきの文字 (2文字まで)
  lean?: number; // 体の傾き (度)。首かしげ・驚きのけぞり用
}> = ({
  x,
  y,
  s = 1,
  cloth = "#3E4B66",
  clothDark = "#2E3850",
  helmet = false,
  glasses = false,
  hair = "cap",
  face = "normal",
  gaze = [0, 0],
  tasuki,
  lean = 0,
}) => {
  const [gx, gy] = gaze;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
      {/* 脚 */}
      <rect x={-30} y={-58} width={24} height={52} fill={clothDark} stroke={RP.ink} strokeWidth={4.5} />
      <rect x={6} y={-58} width={24} height={52} fill={clothDark} stroke={RP.ink} strokeWidth={4.5} />
      {/* 靴 */}
      <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={RP.ink} />
      <ellipse cx={18} cy={-4} rx={20} ry={9} fill={RP.ink} />
      {/* 腕 (体の横に沿わせる) */}
      <rect x={-78} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={RP.ink} strokeWidth={4.5} />
      <rect x={56} y={-148} width={22} height={82} rx={11} fill={cloth} stroke={RP.ink} strokeWidth={4.5} />
      {/* 胴体 */}
      <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={RP.ink} strokeWidth={5} />
      {/* 胸ポケット */}
      <rect x={18} y={-138} width={26} height={20} rx={4} fill="none" stroke={RP.ink} strokeWidth={3} opacity={0.55} />
      {/* たすき */}
      {tasuki && (
        <g>
          <polygon
            points="-58,-160 -30,-160 58,-72 58,-52 44,-52"
            fill={RP.white}
            stroke={RP.ink}
            strokeWidth={4}
          />
          <text
            x={-2}
            y={-96}
            fontFamily={FONT}
            fontWeight={800}
            fontSize={24}
            fill={RP.ink}
            transform="rotate(-45 -2 -96)"
            textAnchor="middle"
          >
            {tasuki}
          </text>
        </g>
      )}
      {/* 頭 */}
      <circle cx={0} cy={-228} r={64} fill={RP.white} stroke={RP.ink} strokeWidth={5.5} />
      {/* 髪 (黒い帽子状) */}
      {hair === "cap" && !helmet && (
        <path
          d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z"
          fill={RP.ink}
        />
      )}
      {/* ヘルメット (白 + 黄ライン) */}
      {helmet && (
        <g>
          <path
            d="M -66 -248 Q -66 -306 0 -308 Q 66 -306 66 -248 Z"
            fill={RP.white}
            stroke={RP.ink}
            strokeWidth={5}
          />
          <rect x={-76} y={-254} width={152} height={14} rx={7} fill={RP.white} stroke={RP.ink} strokeWidth={4.5} />
          <rect x={-46} y={-294} width={14} height={40} fill={RP.yellow} stroke={RP.ink} strokeWidth={3} />
          <rect x={32} y={-294} width={14} height={40} fill={RP.yellow} stroke={RP.ink} strokeWidth={3} />
        </g>
      )}
      {/* 目 (縦長の白目 + 黒目) */}
      <ellipse cx={-24} cy={-222} rx={13} ry={18} fill={RP.white} stroke={RP.ink} strokeWidth={4} />
      <ellipse cx={24} cy={-222} rx={13} ry={18} fill={RP.white} stroke={RP.ink} strokeWidth={4} />
      <circle cx={-24 + gx} cy={-222 + gy} r={face === "surprised" ? 4.5 : 6} fill={RP.ink} />
      <circle cx={24 + gx} cy={-222 + gy} r={face === "surprised" ? 4.5 : 6} fill={RP.ink} />
      {/* メガネ */}
      {glasses && (
        <g fill="none" stroke={RP.ink} strokeWidth={4.5}>
          <circle cx={-24} cy={-222} r={22} />
          <circle cx={24} cy={-222} r={22} />
          <line x1={-2} y1={-226} x2={2} y2={-226} />
          <line x1={-46} y1={-228} x2={-60} y2={-234} />
          <line x1={46} y1={-228} x2={60} y2={-234} />
        </g>
      )}
      {/* 眉 (感情はここで出す) */}
      {face === "worried" ? (
        <g stroke={RP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-34} y1={-252} x2={-14} y2={-246} />
          <line x1={14} y1={-246} x2={34} y2={-252} />
        </g>
      ) : face === "surprised" ? (
        <g stroke={RP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-34} y1={-254} x2={-14} y2={-254} />
          <line x1={14} y1={-254} x2={34} y2={-254} />
        </g>
      ) : (
        <g stroke={RP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-34} y1={-248} x2={-14} y2={-250} />
          <line x1={14} y1={-250} x2={34} y2={-248} />
        </g>
      )}
      {/* 口 */}
      {face === "surprised" ? (
        <ellipse cx={0} cy={-186} rx={10} ry={13} fill={RP.ink} />
      ) : face === "smile" ? (
        <path d="M -14 -192 Q 0 -178 14 -192" fill="none" stroke={RP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "worried" ? (
        <path d="M -12 -184 Q 0 -192 12 -184" fill="none" stroke={RP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <line x1={-10} y1={-186} x2={10} y2={-186} stroke={RP.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===== フレーム3: 人物テスト (工場の作業員たち) =====
const SceneCharacters: React.FC = () => (
  <AbsoluteFill style={{ background: RP.paper }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <WobbleDefs seed={31} />
      {/* 窓の帯 (外は夕方の空) */}
      <g filter="url(#wobbleSoft)">
        <rect x={0} y={110} width={W} height={210} fill="#F3D8B8" />
        <rect x={0} y={110} width={W} height={70} fill="#F7E3C8" />
        <circle cx={1500} cy={250} r={52} fill="#F5C96E" stroke={RP.ink} strokeWidth={0} />
        <path d="M 0 320 Q 300 240 620 300 Q 980 360 1340 290 Q 1640 240 1920 300 L 1920 320 Z" fill="#C9A9C0" opacity={0.55} />
        {[140, 620, 1100, 1580].map((x) => (
          <rect key={x} x={x} y={100} width={18} height={230} fill="#E2D6C2" stroke={RP.ink} strokeWidth={4} />
        ))}
        <rect x={0} y={96} width={W} height={16} fill="#D8C9A8" stroke={RP.ink} strokeWidth={4} />
        <rect x={0} y={320} width={W} height={18} fill="#D8C9A8" stroke={RP.ink} strokeWidth={4} />
      </g>
      {/* 床 */}
      <rect x={0} y={700} width={W} height={H - 700} fill="#DACBA9" />
      <line x1={0} y1={700} x2={W} y2={700} stroke={RP.ink} strokeWidth={5} />
      <line x1={0} y1={790} x2={W} y2={790} stroke={RP.ink} strokeWidth={2.5} opacity={0.3} />
      {/* 奥の群衆 (小さく並べて量産できることの確認) */}
      <g filter="url(#wobble)" opacity={0.92}>
        <Person x={330} y={742} s={0.62} helmet cloth="#7E93A8" clothDark="#5D7084" face="smile" gaze={[3, 2]} />
        <Person x={520} y={742} s={0.62} helmet cloth="#7E93A8" clothDark="#5D7084" gaze={[4, 2]} />
        <Person x={1420} y={742} s={0.62} helmet cloth="#7E93A8" clothDark="#5D7084" gaze={[-4, 2]} face="smile" />
        <Person x={1610} y={742} s={0.62} helmet cloth="#7E93A8" clothDark="#5D7084" gaze={[-3, 2]} />
      </g>
      {/* 主役3人 (作業員 / メガネの技術者 / たすきの部長) */}
      <g filter="url(#wobble)">
        <Person x={560} y={830} s={1.32} helmet cloth="#6E89A4" clothDark="#50647C" face="smile" gaze={[4, 1]} />
        <Person x={960} y={830} s={1.32} glasses cloth="#4A6A8C" clothDark="#37506B" face="surprised" gaze={[0, 2]} />
        <Person x={1360} y={830} s={1.32} cloth="#3E4663" clothDark="#2E3449" face="worried" gaze={[-5, 2]} tasuki="部長" lean={-2} />
      </g>
    </svg>
    {/* ラベル (頭の上に) */}
    <LabelPill x={430} y={298} text="作業員" size={34} />
    <LabelPill x={840} y={266} text="技術者" size={34} />
    <LabelPill x={1460} y={298} text="部長" size={34} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <filter id="stampRough">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
        </filter>
      </defs>
    </svg>
    <Stamp x={1560} y={120} text="試作" size={56} />
    <ChapterBadge text="03｜人物テスト" />
    <Atmosphere />
    <Caption lines={["この描き方なら、まばたきも", "視線の演技も、コードで動かせます。"]} />
  </AbsoluteFill>
);

// ===== 04: 精巧めの車 (どこまで描き込めるかの実験) =====
// ねらい: 同じ「手描きゆらぎ+焦げ茶輪郭」のまま、面の折り線・灯火類・ホイールの
// スポークまで描き込むと、どのくらい「ちゃんとした車」に見えるかを確かめる。
const DetailedWheel: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <g>
    {/* タイヤ */}
    <circle cx={cx} cy={cy} r={110} fill="#2E2A26" stroke={RP.ink} strokeWidth={7} />
    <circle cx={cx} cy={cy} r={92} fill="none" stroke="#4A443D" strokeWidth={3} />
    {/* ブレーキディスク + 赤キャリパー (スポークの奥) */}
    <circle cx={cx} cy={cy} r={46} fill="#9AA2A8" stroke={RP.ink} strokeWidth={3} />
    <circle cx={cx} cy={cy} r={46} fill="none" stroke="#7E868E" strokeWidth={1.5} strokeDasharray="3 4" />
    <path
      d={`M ${cx + 18} ${cy - 52} A 56 56 0 0 1 ${cx + 52} ${cy - 16} L ${cx + 36} ${cy - 11} A 40 40 0 0 0 ${cx + 13} ${cy - 37} Z`}
      fill={RP.red}
      stroke={RP.ink}
      strokeWidth={3}
    />
    {/* リム + 5本ダブルスポーク */}
    <circle cx={cx} cy={cy} r={68} fill="none" stroke="#D7DBDF" strokeWidth={14} />
    <circle cx={cx} cy={cy} r={75} fill="none" stroke={RP.ink} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i * 72 - 90) * (Math.PI / 180);
      const spoke = (off: number) => {
        const a2 = a + off;
        return `M ${cx + Math.cos(a2) * 16} ${cy + Math.sin(a2) * 16} L ${cx + Math.cos(a2) * 64} ${cy + Math.sin(a2) * 64}`;
      };
      return (
        <g key={i}>
          <path d={spoke(-0.09)} stroke="#D7DBDF" strokeWidth={9} strokeLinecap="round" />
          <path d={spoke(0.09)} stroke="#D7DBDF" strokeWidth={9} strokeLinecap="round" />
          <path d={spoke(0)} stroke={RP.ink} strokeWidth={2.5} />
        </g>
      );
    })}
    {/* センターキャップ + ボルト */}
    <circle cx={cx} cy={cy} r={17} fill="#C3C9CE" stroke={RP.ink} strokeWidth={4} />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i * 72 - 90) * (Math.PI / 180);
      return <circle key={i} cx={cx + Math.cos(a) * 26} cy={cy + Math.sin(a) * 26} r={3} fill={RP.ink} />;
    })}
  </g>
);

const SceneCarDetailed: React.FC = () => {
  const bodyColor = "#B8444A"; // 深い赤のボディ (紙地に映える)
  const bodyDark = "#9A3238";
  const glass = "#C4D8E6";
  return (
    <AbsoluteFill style={{ background: RP.paperCool, fontFamily: FONT }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <WobbleDefs seed={21} />
        {/* 道路 */}
        <rect x={0} y={822} width={W} height={H - 822} fill="#C7C9C1" />
        <path d="M 0 822 L 1920 822" stroke={RP.ink} strokeWidth={5} filter="url(#wobble)" />
        <path d="M 60 905 L 300 905 M 420 905 L 660 905 M 780 905 L 1020 905 M 1140 905 L 1380 905 M 1500 905 L 1740 905" stroke={RP.white} strokeWidth={9} filter="url(#wobble)" opacity={0.8} />
        {/* 落ち影 */}
        <ellipse cx={960} cy={838} rx={680} ry={26} fill="rgba(59,51,44,0.18)" />

        <g filter="url(#wobble)">
          {/* ボディ外形 (フロントは左) */}
          <path
            d="M 330 760
               C 310 745 302 705 308 668
               C 312 640 330 622 368 610
               C 470 585 580 570 680 562
               C 740 495 800 452 880 432
               C 980 412 1130 410 1230 428
               C 1300 442 1350 470 1390 505
               C 1470 515 1540 530 1580 550
               C 1605 562 1615 585 1612 615
               C 1608 660 1598 710 1575 745
               L 1540 762
               L 1495 762
               A 128 128 0 0 0 1245 762
               L 685 762
               A 128 128 0 0 0 435 762
               L 330 760 Z"
            fill={bodyColor}
            stroke={RP.ink}
            strokeWidth={8}
          />
          {/* サイドスカートの陰 (下まわりを一段暗く) */}
          <path d="M 420 742 L 1520 742 L 1540 762 L 1495 762 A 128 128 0 0 0 1245 762 L 685 762 A 128 128 0 0 0 435 762 L 330 760 Z" fill={bodyDark} opacity={0.55} />
          {/* キャラクターライン (面の折り線) */}
          <path d="M 385 648 C 700 626 1200 606 1575 596" stroke={RP.ink} strokeWidth={4} fill="none" opacity={0.65} />
          <path d="M 455 722 C 800 712 1200 704 1545 698" stroke={RP.ink} strokeWidth={3} fill="none" opacity={0.4} />
          {/* ボンネットとトランクの切れ線 */}
          <path d="M 368 612 C 470 590 580 574 676 566" stroke={RP.ink} strokeWidth={3.5} fill="none" opacity={0.6} />
          <path d="M 1392 508 C 1430 512 1500 524 1560 545" stroke={RP.ink} strokeWidth={3.5} fill="none" opacity={0.6} />
          {/* ウインドウ (チルト付きの黒枠) */}
          <path d="M 712 558 C 762 502 818 468 884 450 L 908 554 Z" fill={glass} stroke={RP.ink} strokeWidth={6} />
          <path d="M 928 448 C 1000 438 1080 436 1142 442 L 1152 552 L 918 554 Z" fill={glass} stroke={RP.ink} strokeWidth={6} />
          <path d="M 1168 444 C 1230 448 1280 460 1318 478 C 1340 494 1355 512 1364 530 L 1358 548 L 1176 550 Z" fill={glass} stroke={RP.ink} strokeWidth={6} />
          {/* ガラスの映り込み */}
          <path d="M 955 452 L 935 548 M 995 450 L 975 548" stroke={RP.white} strokeWidth={8} opacity={0.5} />
          <path d="M 1230 460 L 1210 546" stroke={RP.white} strokeWidth={8} opacity={0.45} />
          {/* ベルトライン (窓下の銀モール) */}
          <path d="M 705 562 L 1380 540" stroke="#D7DBDF" strokeWidth={5} opacity={0.9} />
          {/* ドアの切れ線 + フラッシュハンドル */}
          <path d="M 932 452 C 934 550 934 660 930 756" stroke={RP.ink} strokeWidth={3.5} fill="none" opacity={0.7} />
          <path d="M 1162 446 C 1166 550 1166 660 1162 756" stroke={RP.ink} strokeWidth={3.5} fill="none" opacity={0.7} />
          <rect x={1010} y={586} width={70} height={15} rx={7} fill={bodyDark} stroke={RP.ink} strokeWidth={3} />
          <rect x={1240} y={580} width={70} height={15} rx={7} fill={bodyDark} stroke={RP.ink} strokeWidth={3} />
          {/* ドアミラー */}
          <path d="M 886 500 L 866 478 L 902 470 L 912 494 Z" fill={bodyColor} stroke={RP.ink} strokeWidth={5} />
          <path d="M 888 498 L 908 492" stroke={glass} strokeWidth={6} />
          {/* ヘッドライト (LED2眼 + 下にDRLの青すじ) */}
          <path d="M 318 644 L 428 616 L 438 650 C 400 664 350 664 324 658 Z" fill={RP.white} stroke={RP.ink} strokeWidth={5} />
          <circle cx={360} cy={642} r={11} fill={RP.blueSoft} stroke={RP.ink} strokeWidth={3} />
          <circle cx={402} cy={634} r={11} fill={RP.blueSoft} stroke={RP.ink} strokeWidth={3} />
          <path d="M 322 664 L 430 656" stroke={RP.blue} strokeWidth={5} />
          {/* グリル (横スリット) + 下の開口 + フォグ */}
          <rect x={310} y={678} width={100} height={36} rx={8} fill={bodyDark} stroke={RP.ink} strokeWidth={4} />
          <path d="M 316 690 L 404 688 M 316 702 L 404 700" stroke={RP.ink} strokeWidth={3} opacity={0.8} />
          <rect x={326} y={724} width={150} height={26} rx={10} fill="#2E2A26" stroke={RP.ink} strokeWidth={4} />
          <circle cx={352} cy={737} r={8} fill={RP.yellow} stroke={RP.ink} strokeWidth={3} />
          {/* テールランプ + マフラー */}
          <path d="M 1562 552 L 1612 582 L 1610 610 L 1556 585 Z" fill="#D96A52" stroke={RP.ink} strokeWidth={5} />
          <rect x={1548} y={744} width={48} height={18} rx={7} fill={RP.gray} stroke={RP.ink} strokeWidth={4} />
          {/* シャークフィンアンテナ */}
          <path d="M 1198 424 C 1212 414 1228 412 1236 420 L 1226 430 Z" fill={RP.ink} />
        </g>

        {/* ホイール (ゆらぎは弱め: 精密感を残す) */}
        <g filter="url(#wobbleSoft)">
          <DetailedWheel cx={560} cy={760} />
          <DetailedWheel cx={1370} cy={760} />
        </g>

        {/* 注釈 (白ラベル札 + 指し線) */}
        <g filter="url(#wobbleSoft)">
          <path d="M 420 330 L 395 630" stroke={RP.ink} strokeWidth={3} strokeDasharray="7 7" />
          <rect x={290} y={280} width={260} height={52} rx={10} fill={RP.white} stroke={RP.ink} strokeWidth={4} />
          <path d="M 1490 300 L 1385 760" stroke={RP.ink} strokeWidth={3} strokeDasharray="7 7" />
          <rect x={1360} y={248} width={370} height={52} rx={10} fill={RP.white} stroke={RP.ink} strokeWidth={4} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 290, top: 288, width: 260, textAlign: "center", fontSize: 30, fontWeight: 800, color: RP.ink }}>
        LED2眼ライト
      </div>
      <div style={{ position: "absolute", left: 1360, top: 256, width: 370, textAlign: "center", fontSize: 30, fontWeight: 800, color: RP.ink }}>
        スポーク+赤キャリパー
      </div>
      <ChapterBadge text="04｜ためし書き (描き込み多め)" />
      <Atmosphere />
      <Caption lines={["描き込みを増やした車のテスト。", "面の折り線・灯火・ホイールまで線で描けます。"]} />
    </AbsoluteFill>
  );
};

// ===== 本体: フレーム番号でシーンを切り替え (静止画の実験用) =====
export const StyleTest: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame <= 0) return <SceneCar />;
  if (frame === 1) return <SceneRotary />;
  if (frame === 2) return <SceneBoard />;
  if (frame === 3) return <SceneCharacters />;
  return <SceneCarDetailed />;
};
