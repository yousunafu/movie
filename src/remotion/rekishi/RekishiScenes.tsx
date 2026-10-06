// rekishi (歴史と深い時間の資料図版) プリセットの画面一式。
// お手本チャンネルのテイスト分析 (docs/参考チャンネル一覧.md 世界史裏探訪) から:
// 上約8割が資料画像風の絵・下約2割が真っ黒の帯 (字幕領域)・要所に白背景の箇条書きスライド。
// AI画像休止中のため、資料画像の代わりにセピアの古文書・銅版画調SVG (細い平行ハッチングの陰影
// + 二重枠の額装 + ゆっくりしたKen Burnsズーム) で「スライド型」の雰囲気を作る。
// 1ファイルに全部まとめる (manabi の構成を踏襲)。

import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { Scene } from "../../types";
import { REKISHI_CHANNEL } from "../../channel";
import { ImageScene } from "../scenes/ImageScene";

// 資料室の配色 (RP)
export const RP = {
  paper: "#E8DCC4", // 羊皮紙セピア (絵エリアの背景)
  paperDark: "#D6C3A0", // 古紙のムラ
  ink: "#3B2A1E", // 焦茶の線画・文字
  inkSoft: "#6B5540", // 薄い線・補足
  rust: "#8B3A2E", // 錆朱 (強調)
  rustSoft: "#A0522D",
  band: "#000000", // 下帯 (字幕領域)
  cardPaper: "#F5F0E6", // 箇条書きスライドの紙白
} as const;

export const REKISHI_FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";
export const REKISHI_SERIF =
  "'Noto Serif JP', 'Noto Serif CJK JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif";

const W = 1920;
const H = 1080;
// 下帯は画面の約20% (= 216px)。字幕はこの中に収める (Video.tsx が参照)
export const REKISHI_BAND_H = Math.round(H * 0.2); // 216
const ART_H = H - REKISHI_BAND_H; // 864 (絵エリア)

// ===== 共通の部品 =====

// 下2割の真っ黒の帯 (字幕は Video.tsx がこの中に白文字で置く)
const Band: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      bottom: 0,
      width: "100%",
      height: REKISHI_BAND_H,
      backgroundColor: RP.band,
    }}
  />
);

// 銅版画のハッチング (平行線) パターン。各SVGの中で参照する
const Defs: React.FC = () => (
  <defs>
    {/* 斜め45度の細い平行線 (標準の陰影) */}
    <pattern id="rkHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke={RP.ink} strokeWidth="1.4" opacity="0.5" />
    </pattern>
    {/* 淡い陰影 */}
    <pattern id="rkHatchLight" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="10" stroke={RP.ink} strokeWidth="1" opacity="0.3" />
    </pattern>
    {/* 濃い陰影 (クロスハッチ) */}
    <pattern id="rkHatchDense" width="7" height="7" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="7" y2="7" stroke={RP.ink} strokeWidth="1.4" opacity="0.65" />
      <line x1="7" y1="0" x2="0" y2="7" stroke={RP.ink} strokeWidth="1.4" opacity="0.65" />
    </pattern>
    {/* 錆の質感 */}
    <pattern id="rkHatchRust" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1="0" y1="0" x2="0" y2="8" stroke={RP.rust} strokeWidth="1.8" opacity="0.6" />
    </pattern>
    {/* 水平の細線 (空・水面) */}
    <pattern id="rkHatchFlat" width="12" height="9" patternUnits="userSpaceOnUse">
      <line x1="0" y1="4" x2="12" y2="4" stroke={RP.ink} strokeWidth="1" opacity="0.28" />
    </pattern>
  </defs>
);

// 古紙の下地 (わずかなムラとしみ)
const PaperTexture: React.FC = () => (
  <g>
    <rect width={W} height={ART_H} fill={RP.paper} />
    <ellipse cx={420} cy={170} rx={400} ry={210} fill={RP.paperDark} opacity={0.16} />
    <ellipse cx={1560} cy={660} rx={430} ry={230} fill={RP.paperDark} opacity={0.14} />
    <ellipse cx={1180} cy={110} rx={280} ry={130} fill={RP.paperDark} opacity={0.1} />
    <ellipse cx={240} cy={720} rx={300} ry={160} fill={RP.paperDark} opacity={0.12} />
    {/* 古いしみ (決まった位置の小さな点) */}
    {Array.from({ length: 26 }, (_, i) => {
      const x = ((i * 523) % 1800) + 60;
      const y = ((i * 311) % 760) + 50;
      return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill={RP.ink} opacity={0.07} />;
    })}
  </g>
);

// 絵エリアの額装: 古紙 + Ken Burnsズーム (1.0→1.06) + ビネット + 細い二重枠 + 下帯
const Plate: React.FC<{ children: React.ReactNode; zoom?: boolean }> = ({
  children,
  zoom = true,
}) => {
  const frame = useCurrentFrame();
  const scale = zoom
    ? interpolate(frame, [0, 300], [1, 1.06], { extrapolateRight: "clamp" })
    : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: RP.band }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: ART_H,
          backgroundColor: RP.paper,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${scale})`,
            transformOrigin: "50% 45%",
          }}
        >
          <svg width={W} height={ART_H} viewBox={`0 0 ${W} ${ART_H}`}>
            <Defs />
            <PaperTexture />
            {children}
          </svg>
        </div>
        {/* 古紙のビネット (四隅をわずかに暗く) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(59,42,30,0) 55%, rgba(59,42,30,0.2) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* 資料画像らしい細い二重枠の額装 */}
        <div style={{ position: "absolute", inset: 22, border: `3px solid ${RP.ink}`, opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 36, border: `1.5px solid ${RP.ink}`, opacity: 0.45 }} />
      </div>
      <Band />
    </AbsoluteFill>
  );
};

// 図版の見出し (上部中央・明朝・錆朱の短い下線)
const PlateTitle: React.FC<{ text?: string }> = ({ text }) => {
  if (!text) return null;
  return (
    <g>
      <text
        x={W / 2}
        y={96}
        textAnchor="middle"
        fontSize={42}
        fontWeight={600}
        fill={RP.ink}
        fontFamily={REKISHI_SERIF}
        letterSpacing={4}
      >
        {text}
      </text>
      <rect x={W / 2 - 32} y={112} width={64} height={4} fill={RP.rust} />
    </g>
  );
};

// 図版下部のキャプション (博物図版の「Fig.」)
const Caption: React.FC<{ x?: number; y?: number; text: string }> = ({
  x = W / 2,
  y = 790,
  text,
}) => (
  <g>
    <line x1={x - 190} x2={x + 190} y1={y - 38} y2={y - 38} stroke={RP.inkSoft} strokeWidth={2} opacity={0.7} />
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={32}
      fill={RP.inkSoft}
      fontFamily={REKISHI_SERIF}
      letterSpacing={6}
    >
      {text}
    </text>
  </g>
);

// 版画風の太陽 (放射線つき)
const EngravedSun: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 56 }) => (
  <g stroke={RP.inkSoft} fill="none">
    <circle cx={x} cy={y} r={r} strokeWidth={3} />
    <circle cx={x} cy={y} r={r - 14} strokeWidth={1.5} opacity={0.6} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return (
        <line
          key={i}
          x1={x + Math.cos(a) * (r + 10)}
          y1={y + Math.sin(a) * (r + 10)}
          x2={x + Math.cos(a) * (r + 30)}
          y2={y + Math.sin(a) * (r + 30)}
          strokeWidth={2.5}
        />
      );
    })}
  </g>
);

// 版画風の雲 (重ねた弧)
const EngravedCloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${s})`} stroke={RP.inkSoft} fill={RP.paper} strokeWidth={3}>
    <path d="M -120 20 Q -130 -20 -80 -24 Q -70 -56 -20 -48 Q 10 -70 50 -44 Q 100 -50 104 -10 Q 140 0 120 20 Z" />
    <path d="M -90 8 q 20 -14 44 -2" fill="none" strokeWidth={1.5} opacity={0.5} />
    <path d="M -10 -6 q 24 -16 52 -4" fill="none" strokeWidth={1.5} opacity={0.5} />
  </g>
);

// 鳥 (遠景の「M」線)
const Birds: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke={RP.ink} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7}>
    <path d={`M ${x} ${y} q 12 -14 24 0 q 12 -14 24 0`} />
    <path d={`M ${x + 90} ${y - 36} q 10 -12 20 0 q 10 -12 20 0`} />
    <path d={`M ${x - 70} ${y - 18} q 9 -11 18 0 q 9 -11 18 0`} />
  </g>
);

// ===== 場面 (motif ごとの図版) =====

// city: 廃墟になる都市の遠景
const CityScene: React.FC = () => {
  const groundY = 660;
  // 壊れた上端のビルを1棟描く
  const Building: React.FC<{
    x: number;
    w: number;
    top: number;
    jag?: number[];
  }> = ({ x, w, top, jag = [0, -34, 10, -20, 24, -8] }) => {
    const step = w / (jag.length - 1);
    const topPts = jag.map((dy, i) => `${x + i * step},${top + dy}`).join(" L ");
    return (
      <g>
        <path
          d={`M ${x} ${groundY} L ${x} ${top + jag[0]} L ${topPts} L ${x + w} ${groundY} Z`}
          fill={RP.paper}
          stroke={RP.ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {/* 右側面の陰影 (ハッチング) */}
        <path
          d={`M ${x + w * 0.62} ${groundY} L ${x + w * 0.62} ${top + 6} L ${x + w} ${top + jag[jag.length - 1]} L ${x + w} ${groundY} Z`}
          fill="url(#rkHatch)"
        />
        {/* 窓 */}
        {Array.from({ length: 4 }, (_, c) =>
          Array.from({ length: Math.floor((groundY - top - 70) / 64) }, (_, r) => (
            <rect
              key={`${c}-${r}`}
              x={x + 20 + c * ((w - 40) / 4) + 4}
              y={top + 50 + r * 64}
              width={(w - 40) / 4 - 14}
              height={38}
              fill={(c + r) % 3 === 0 ? "url(#rkHatchDense)" : "none"}
              stroke={RP.ink}
              strokeWidth={2.5}
            />
          )),
        )}
      </g>
    );
  };
  return (
    <Plate>
      <EngravedSun x={260} y={170} />
      <EngravedCloud x={1460} y={160} />
      <EngravedCloud x={1050} y={120} s={0.7} />
      <Birds x={1500} y={300} />
      {/* 地面 */}
      <line x1={90} x2={1830} y1={groundY} y2={groundY} stroke={RP.ink} strokeWidth={5} />
      <rect x={90} y={groundY} width={1740} height={110} fill="url(#rkHatchLight)" />
      {/* 遠景の低いビル群 */}
      <Building x={420} w={200} top={380} />
      <Building x={660} w={240} top={260} jag={[0, -40, 16, -26, 6, -14]} />
      <Building x={950} w={180} top={420} jag={[0, -22, 8, -30, 14, -6]} />
      <Building x={1170} w={260} top={300} jag={[0, -18, 28, -40, 8, -24]} />
      <Building x={1480} w={190} top={440} jag={[0, -28, 6, -16, 18, -10]} />
      {/* 手前の瓦礫の山 */}
      <path
        d={`M 180 ${groundY} q 90 -70 200 0 Z`}
        fill="url(#rkHatch)"
        stroke={RP.ink}
        strokeWidth={4}
      />
      <path
        d={`M 1620 ${groundY} q 80 -56 180 0 Z`}
        fill="url(#rkHatch)"
        stroke={RP.ink}
        strokeWidth={4}
      />
      <Caption text="Fig. 1 ─ 静まりかえる都市" />
    </Plate>
  );
};

// ruin: ツタに覆われるビル
const RuinScene: React.FC = () => {
  const frame = useCurrentFrame();
  // ツタが下から伸びていく
  const growth = interpolate(frame, [0, 110], [0, 1], { extrapolateRight: "clamp" });
  const bx = 760;
  const bw = 400;
  const top = 150;
  const groundY = 700;
  const Vine: React.FC<{ d: string; len: number; delay: number; leaves: [number, number][] }> = ({
    d,
    len,
    delay,
    leaves,
  }) => {
    const p = interpolate(frame - delay, [0, 100], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <g>
        <path
          d={d}
          fill="none"
          stroke={RP.ink}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={(1 - p) * len}
        />
        {leaves.map(([lx, ly], i) => {
          const o = interpolate(p, [(i + 1) / (leaves.length + 1), (i + 1.6) / (leaves.length + 1)], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <g key={i} opacity={o}>
              <ellipse
                cx={lx}
                cy={ly}
                rx={20}
                ry={11}
                transform={`rotate(${(i % 2 === 0 ? -1 : 1) * 38}, ${lx}, ${ly})`}
                fill={i % 3 === 0 ? "url(#rkHatchRust)" : "url(#rkHatch)"}
                stroke={RP.ink}
                strokeWidth={2.5}
              />
            </g>
          );
        })}
      </g>
    );
  };
  return (
    <Plate>
      <EngravedCloud x={320} y={170} s={0.8} />
      <Birds x={1420} y={240} />
      <line x1={90} x2={1830} y1={groundY} y2={groundY} stroke={RP.ink} strokeWidth={5} />
      <rect x={90} y={groundY} width={1740} height={80} fill="url(#rkHatchLight)" />
      {/* ビル本体 (上端が崩れている) */}
      <path
        d={`M ${bx} ${groundY} L ${bx} ${top + 30} L ${bx + 70} ${top} L ${bx + 120} ${top + 42} L ${bx + 200} ${top + 14} L ${bx + 270} ${top + 50} L ${bx + 340} ${top + 24} L ${bx + bw} ${top + 60} L ${bx + bw} ${groundY} Z`}
        fill={RP.paper}
        stroke={RP.ink}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path
        d={`M ${bx + bw * 0.66} ${groundY} L ${bx + bw * 0.66} ${top + 30} L ${bx + bw} ${top + 60} L ${bx + bw} ${groundY} Z`}
        fill="url(#rkHatch)"
      />
      {/* 窓 */}
      {Array.from({ length: 4 }, (_, c) =>
        Array.from({ length: 7 }, (_, r) => (
          <rect
            key={`${c}-${r}`}
            x={bx + 36 + c * 88}
            y={top + 90 + r * 70}
            width={56}
            height={44}
            fill={(c * 7 + r) % 4 === 0 ? "url(#rkHatchDense)" : "none"}
            stroke={RP.ink}
            strokeWidth={3}
          />
        )),
      )}
      {/* ツタ (左・中央・右から這い上がる) */}
      <Vine
        d={`M ${bx - 40} ${groundY} C ${bx + 10} ${groundY - 120} ${bx - 30} ${groundY - 240} ${bx + 50} ${groundY - 330} C ${bx + 110} ${groundY - 400} ${bx + 40} ${groundY - 470} ${bx + 90} ${groundY - 540}`}
        len={700}
        delay={0}
        leaves={[
          [bx - 10, groundY - 90],
          [bx + 6, groundY - 200],
          [bx + 42, groundY - 300],
          [bx + 86, groundY - 390],
          [bx + 58, groundY - 470],
        ]}
      />
      <Vine
        d={`M ${bx + 230} ${groundY} C ${bx + 180} ${groundY - 140} ${bx + 260} ${groundY - 240} ${bx + 210} ${groundY - 360} C ${bx + 180} ${groundY - 440} ${bx + 250} ${groundY - 500} ${bx + 230} ${groundY - 560}`}
        len={640}
        delay={14}
        leaves={[
          [bx + 206, groundY - 110],
          [bx + 234, groundY - 230],
          [bx + 214, groundY - 330],
          [bx + 222, groundY - 450]
        ]}
      />
      <Vine
        d={`M ${bx + bw + 50} ${groundY} C ${bx + bw - 20} ${groundY - 100} ${bx + bw + 30} ${groundY - 220} ${bx + bw - 40} ${groundY - 320}`}
        len={420}
        delay={30}
        leaves={[
          [bx + bw + 10, groundY - 80],
          [bx + bw - 4, groundY - 190],
          [bx + bw - 30, groundY - 280],
        ]}
      />
      {/* 根本の茂み */}
      <g opacity={Math.min(1, growth * 2)}>
        <path
          d={`M ${bx - 90} ${groundY} q 100 -70 260 0 Z`}
          fill="url(#rkHatch)"
          stroke={RP.ink}
          strokeWidth={4}
        />
        <path
          d={`M ${bx + 200} ${groundY} q 120 -60 300 0 Z`}
          fill="url(#rkHatch)"
          stroke={RP.ink}
          strokeWidth={4}
        />
      </g>
      <Caption text="Fig. 2 ─ 緑にのまれる建造物" />
    </Plate>
  );
};

// decay: 錆と砂 (半ば埋もれた鉄骨と歯車)
const DecayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const windO = 0.4 + 0.2 * Math.sin(frame / 18);
  const gx = 700;
  const gy = 520;
  return (
    <Plate>
      <EngravedSun x={1620} y={170} r={48} />
      {/* 歯車 (半分砂に埋まる) */}
      <g stroke={RP.ink} strokeWidth={6} fill={RP.paper}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <rect
              key={i}
              x={gx - 20}
              y={gy - 196}
              width={40}
              height={44}
              transform={`rotate(${(a * 180) / Math.PI}, ${gx}, ${gy})`}
              fill={RP.paper}
              stroke={RP.ink}
              strokeWidth={5}
            />
          );
        })}
        <circle cx={gx} cy={gy} r={160} />
        <circle cx={gx} cy={gy} r={56} fill="url(#rkHatchLight)" />
      </g>
      {/* 歯車の錆 */}
      <path
        d={`M ${gx - 150} ${gy - 40} a 160 160 0 0 1 120 -112 q 30 60 -10 110 q -60 40 -110 2 Z`}
        fill="url(#rkHatchRust)"
        stroke={RP.rust}
        strokeWidth={3}
        opacity={0.9}
      />
      {/* 傾いた鉄骨 (I形梁) */}
      <g transform="rotate(-24, 1300, 560)">
        <rect x={1240} y={240} width={120} height={34} fill={RP.paper} stroke={RP.ink} strokeWidth={5} />
        <rect x={1278} y={274} width={44} height={320} fill={RP.paper} stroke={RP.ink} strokeWidth={5} />
        <rect x={1240} y={594} width={120} height={34} fill={RP.paper} stroke={RP.ink} strokeWidth={5} />
        <rect x={1278} y={300} width={44} height={120} fill="url(#rkHatchRust)" />
        <rect x={1286} y={470} width={36} height={90} fill="url(#rkHatch)" />
      </g>
      {/* 砂丘 (手前の砂が物を飲み込む) */}
      <path
        d={`M 60 864 L 60 640 Q 400 560 760 640 T 1460 630 Q 1700 610 1860 660 L 1860 864 Z`}
        fill={RP.paper}
        stroke={RP.ink}
        strokeWidth={5}
      />
      <path
        d={`M 60 864 L 60 700 Q 460 630 900 700 T 1860 710 L 1860 864 Z`}
        fill="url(#rkHatchLight)"
        stroke={RP.ink}
        strokeWidth={4}
      />
      {/* 砂の粒と風の線 */}
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={200 + i * 118} cy={696 + ((i * 37) % 60)} r={3} fill={RP.ink} opacity={0.4} />
      ))}
      <g stroke={RP.inkSoft} strokeWidth={3} fill="none" strokeLinecap="round" opacity={windO}>
        <path d="M 220 300 q 140 -30 300 0 q 60 12 110 -6" />
        <path d="M 320 380 q 120 -24 260 0" />
        <path d="M 1430 330 q 120 -26 240 4" />
      </g>
      <Caption text="Fig. 3 ─ 錆と砂に還る" />
    </Plate>
  );
};

// dinosaur: 恐竜骨格の博物図版
const DinosaurScene: React.FC = () => {
  const baseY = 640;
  return (
    <Plate>
      {/* 台座の地面 */}
      <line x1={280} x2={1660} y1={baseY} y2={baseY} stroke={RP.ink} strokeWidth={5} />
      <rect x={280} y={baseY} width={1380} height={36} fill="url(#rkHatchLight)" />
      <g stroke={RP.ink} fill="none" strokeLinecap="round">
        {/* 背骨 (首→胴→尾) */}
        <path
          d="M 600 300 C 700 240 850 240 980 280 C 1100 316 1220 330 1330 380 C 1430 424 1530 470 1640 520"
          strokeWidth={14}
        />
        {/* 頭骨 */}
        <path
          d="M 600 300 L 480 320 L 420 360 L 500 376 L 560 366 L 616 340 Z"
          fill={RP.paper}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path d="M 430 362 L 520 372" strokeWidth={4} />
        <circle cx={520} cy={338} r={12} strokeWidth={5} />
        {/* 肋骨 */}
        {Array.from({ length: 7 }, (_, i) => {
          const x = 760 + i * 58;
          const y = 258 + i * 8;
          return <path key={i} d={`M ${x} ${y} C ${x - 26} ${y + 90} ${x - 20} ${y + 160} ${x + 14} ${y + 196}`} strokeWidth={7} />;
        })}
        {/* 骨盤 */}
        <ellipse cx={1240} cy={356} rx={70} ry={48} fill={RP.paper} strokeWidth={7} />
        {/* 後ろ脚 (大腿骨→脛→足指) */}
        <path d={`M 1240 380 L 1180 500 L 1210 ${baseY - 20}`} strokeWidth={10} />
        <path d={`M 1210 ${baseY - 20} l -36 20 M 1210 ${baseY - 20} l 6 22 M 1210 ${baseY - 20} l 40 16`} strokeWidth={7} />
        <path d={`M 1300 390 L 1350 506 L 1330 ${baseY - 20}`} strokeWidth={10} />
        <path d={`M 1330 ${baseY - 20} l -34 20 M 1330 ${baseY - 20} l 8 22 M 1330 ${baseY - 20} l 42 14`} strokeWidth={7} />
        {/* 小さな前肢 */}
        <path d="M 740 330 l 30 70 l 34 20" strokeWidth={7} />
        {/* 尾の骨の節 */}
        {Array.from({ length: 5 }, (_, i) => {
          const x = 1400 + i * 52;
          const y = 412 + i * 22;
          return <line key={i} x1={x} y1={y - 22} x2={x - 14} y2={y + 22} strokeWidth={5} />;
        })}
      </g>
      {/* 足元の影 */}
      <ellipse cx={1270} cy={baseY + 16} rx={220} ry={14} fill="url(#rkHatch)" />
      <Caption text="Fig. 4 ─ 恐竜の骨格 (6600万年前)" />
    </Plate>
  );
};

// fossilize: 埋没→地層→化石化の3段階の図解 (左から順に現れる)
const FossilizeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const panelY = 220;
  const panelH = 400;
  const panelW = 400;
  // 骨の図形 (中央に描く)
  const Bone: React.FC<{ x: number; y: number; dark?: boolean }> = ({ x, y, dark }) => (
    <g transform={`translate(${x}, ${y}) rotate(-18)`}>
      <rect x={-70} y={-13} width={140} height={26} rx={13} fill={dark ? "url(#rkHatchRust)" : RP.paper} stroke={dark ? RP.rust : RP.ink} strokeWidth={5} />
      {[-70, 70].map((bx) =>
        [-12, 12].map((by) => (
          <circle key={`${bx}${by}`} cx={bx} cy={by} r={16} fill={dark ? "url(#rkHatchRust)" : RP.paper} stroke={dark ? RP.rust : RP.ink} strokeWidth={5} />
        )),
      )}
    </g>
  );
  const Panel: React.FC<{ cx: number; stage: 0 | 1 | 2; label: string; delay: number }> = ({
    cx,
    stage,
    label,
    delay,
  }) => {
    const o = interpolate(frame - delay, [0, 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const x = cx - panelW / 2;
    return (
      <g opacity={o}>
        <rect x={x} y={panelY} width={panelW} height={panelH} fill={RP.paper} stroke={RP.ink} strokeWidth={5} />
        {stage === 0 && (
          <>
            {/* 水面と泥 */}
            <rect x={x} y={panelY} width={panelW} height={panelH - 120} fill="url(#rkHatchFlat)" />
            <path d={`M ${x} ${panelY + panelH - 120} h ${panelW}`} stroke={RP.ink} strokeWidth={4} />
            <rect x={x} y={panelY + panelH - 120} width={panelW} height={120} fill="url(#rkHatchLight)" />
            <Bone x={cx} y={panelY + panelH - 130} />
            {/* 沈む矢印 */}
            <path d={`M ${cx} ${panelY + 60} v 110 m -16 -24 l 16 24 l 16 -24`} stroke={RP.rust} strokeWidth={6} fill="none" strokeLinecap="round" />
          </>
        )}
        {stage === 1 && (
          <>
            {/* 積み重なる地層 */}
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect
                  x={x}
                  y={panelY + i * 70}
                  width={panelW}
                  height={70}
                  fill={i % 2 === 0 ? "url(#rkHatchLight)" : "none"}
                />
                <line x1={x} x2={x + panelW} y1={panelY + (i + 1) * 70} y2={panelY + (i + 1) * 70} stroke={RP.ink} strokeWidth={3} />
              </g>
            ))}
            <rect x={x} y={panelY + 280} width={panelW} height={panelH - 280} fill="url(#rkHatch)" />
            <Bone x={cx} y={panelY + 330} />
          </>
        )}
        {stage === 2 && (
          <>
            <rect x={x} y={panelY} width={panelW} height={panelH} fill="url(#rkHatchDense)" opacity={0.5} />
            <Bone x={cx} y={panelY + panelH / 2} dark />
            {/* 石化のひび */}
            <path d={`M ${x + 40} ${panelY + 60} l 60 50 l -16 44 M ${x + panelW - 50} ${panelY + 310} l -54 -40 l 10 -40`} stroke={RP.ink} strokeWidth={3} fill="none" />
          </>
        )}
        <text x={cx} y={panelY + panelH + 56} textAnchor="middle" fontSize={34} fill={RP.ink} fontFamily={REKISHI_FONT} fontWeight={600}>
          {label}
        </text>
      </g>
    );
  };
  const ArrowBetween: React.FC<{ x: number; delay: number }> = ({ x, delay }) => {
    const o = interpolate(frame - delay, [0, 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <g opacity={o} stroke={RP.rust} strokeWidth={8} fill="none" strokeLinecap="round">
        <path d={`M ${x - 36} ${panelY + panelH / 2} h 64 m -22 -20 l 24 20 l -24 20`} />
      </g>
    );
  };
  return (
    <Plate>
      <PlateTitle text="化石ができるまで" />
      <Panel cx={380} stage={0} label="泥に埋まる" delay={0} />
      <ArrowBetween x={650} delay={24} />
      <Panel cx={960} stage={1} label="地層が積み重なる" delay={30} />
      <ArrowBetween x={1230} delay={54} />
      <Panel cx={1540} stage={2} label="鉱物に置きかわり化石に" delay={60} />
    </Plate>
  );
};

// strata: 地層の断面と「薄い一枚の線」(錆朱の線が左から引かれる)
const StrataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const x0 = 140;
  const x1 = 1780;
  const top = 180;
  const bottom = 700;
  const layers = [
    { h: 70, fill: "none" },
    { h: 76, fill: "url(#rkHatchLight)" },
    { h: 64, fill: "url(#rkHatchFlat)" },
    { h: 58, fill: "none" }, // ← この層の下に錆朱の線
    { h: 78, fill: "url(#rkHatch)" },
    { h: 70, fill: "url(#rkHatchLight)" },
    { h: 104, fill: "url(#rkHatchDense)" },
  ];
  // 錆朱の線 (人類の時代) が左から引かれる
  const lineP = interpolate(frame, [16, 76], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelO = interpolate(frame, [78, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  let y = top;
  const bands: React.ReactNode[] = [];
  let rustY = 0;
  layers.forEach((l, i) => {
    const yy = y;
    bands.push(
      <g key={i}>
        <rect x={x0} y={yy} width={x1 - x0} height={l.h} fill={l.fill} />
        <path
          d={`M ${x0} ${yy + l.h} q 220 ${i % 2 === 0 ? 10 : -10} 460 0 t 460 0 t 460 0 t 300 0`}
          fill="none"
          stroke={RP.ink}
          strokeWidth={3.5}
        />
      </g>,
    );
    y += l.h;
    if (i === 3) rustY = y + 4;
  });
  return (
    <Plate>
      <PlateTitle text="地層に刻まれる一枚の線" />
      {/* 断面の外枠 */}
      <rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill="none" stroke={RP.ink} strokeWidth={5} />
      {bands}
      {/* 人類の時代 = 薄い錆朱の線 */}
      <rect x={x0 + 4} y={rustY} width={(x1 - x0 - 8) * lineP} height={7} fill={RP.rust} />
      {/* 引き出し線とラベル */}
      <g opacity={labelO}>
        <circle cx={430} cy={rustY + 3} r={34} fill="none" stroke={RP.rust} strokeWidth={4} />
        <path d={`M 456 ${rustY - 20} L 560 ${rustY - 86}`} stroke={RP.rust} strokeWidth={3.5} />
        <text x={574} y={rustY - 94} fontSize={38} fontWeight={700} fill={RP.rust} fontFamily={REKISHI_FONT}>
          人類の時代 (薄い一枚の線)
        </text>
      </g>
      {/* 深さの目盛り */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={x0 - 18} x2={x0} y1={top + i * ((bottom - top) / 3)} y2={top + i * ((bottom - top) / 3)} stroke={RP.inkSoft} strokeWidth={3} />
      ))}
    </Plate>
  );
};

// future_fossil: ペットボトルと鶏の骨の標本図版
const FutureFossilScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const o2 = interpolate(frame, [18, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cy = 440;
  return (
    <Plate>
      <PlateTitle text={scene.title ?? "未来の化石の候補"} />
      {/* ペットボトル */}
      <g>
        <g stroke={RP.ink} strokeWidth={6} fill={RP.paper} strokeLinejoin="round">
          {/* キャップ */}
          <rect x={596} y={cy - 260} width={88} height={44} rx={6} />
          {/* 首〜肩〜胴 */}
          <path
            d={`M 612 ${cy - 216}
               L 612 ${cy - 186} C 560 ${cy - 150} 540 ${cy - 120} 540 ${cy - 80}
               L 540 ${cy + 170} Q 540 ${cy + 210} 580 ${cy + 210}
               L 700 ${cy + 210} Q 740 ${cy + 210} 740 ${cy + 170}
               L 740 ${cy - 80} C 740 ${cy - 120} 720 ${cy - 150} 668 ${cy - 186}
               L 668 ${cy - 216} Z`}
          />
        </g>
        {/* ボトルのくびれの横線と陰影 */}
        <g stroke={RP.ink} strokeWidth={2.5} opacity={0.7}>
          <path d={`M 544 ${cy - 10} q 96 18 192 0`} fill="none" />
          <path d={`M 544 ${cy + 30} q 96 18 192 0`} fill="none" />
          <path d={`M 544 ${cy + 70} q 96 18 192 0`} fill="none" />
        </g>
        <path
          d={`M 672 ${cy - 160} C 716 ${cy - 130} 726 ${cy - 100} 726 ${cy - 70} L 726 ${cy + 180} Q 726 ${cy + 196} 706 ${cy + 196} L 668 ${cy + 196} L 668 ${cy - 150} Z`}
          fill="url(#rkHatchLight)"
        />
        <rect x={600} y={cy - 252} width={80} height={28} fill="url(#rkHatch)" />
        <Caption x={640} y={cy + 320} text="Fig. 5 ─ ペットボトル" />
      </g>
      {/* 鶏の骨 */}
      <g opacity={o2}>
        <g transform={`translate(1300, ${cy}) rotate(-28)`} stroke={RP.ink} strokeWidth={6}>
          <rect x={-150} y={-24} width={300} height={48} rx={24} fill={RP.paper} />
          <circle cx={-158} cy={-24} r={34} fill={RP.paper} />
          <circle cx={-170} cy={16} r={30} fill={RP.paper} />
          <circle cx={158} cy={-20} r={32} fill={RP.paper} />
          <circle cx={168} cy={18} r={28} fill={RP.paper} />
          {/* 陰影 */}
          <path d="M -140 6 q 140 26 280 6 l 0 12 q -140 18 -282 -2 Z" fill="url(#rkHatchLight)" stroke="none" />
        </g>
        <ellipse cx={1300} cy={cy + 120} rx={210} ry={16} fill="url(#rkHatch)" />
        <Caption x={1300} y={cy + 320} text="Fig. 6 ─ 鶏の骨" />
      </g>
    </Plate>
  );
};

// moon_footprint: 月面の足跡 (上=漆黒の空と地球、下=月面と足跡)
const MoonFootprintScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rayO = interpolate(frame, [30, 48], [0, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const horizon = 380;
  return (
    <Plate>
      {/* 漆黒の空 (焦茶で塗る) */}
      <rect x={0} y={0} width={W} height={horizon} fill={RP.ink} />
      {/* 星 */}
      {Array.from({ length: 30 }, (_, i) => {
        const x = ((i * 397) % 1760) + 80;
        const y = ((i * 211) % (horizon - 90)) + 40;
        return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 3.5 : 2} fill={RP.paper} opacity={0.9} />;
      })}
      {/* 地球 */}
      <g>
        <circle cx={1560} cy={150} r={74} fill={RP.paper} stroke={RP.paperDark} strokeWidth={3} />
        <path d="M 1510 120 q 30 -16 56 2 q 24 16 48 6" fill="none" stroke={RP.inkSoft} strokeWidth={5} />
        <path d="M 1516 176 q 34 14 66 -2" fill="none" stroke={RP.inkSoft} strokeWidth={5} />
        <path d={`M 1560 76 a 74 74 0 0 1 0 148 a 110 74 0 0 0 0 -148`} fill={RP.ink} opacity={0.35} />
      </g>
      {/* 月面 */}
      <path d={`M 0 ${horizon} q 480 -36 960 0 t 960 8 L 1920 864 L 0 864 Z`} fill={RP.paper} stroke={RP.ink} strokeWidth={4} />
      {/* クレーター */}
      {[
        [300, 520, 90, 26],
        [1580, 500, 110, 30],
        [1240, 700, 70, 20],
        [520, 760, 100, 26],
      ].map(([cx, cy, rx, ry], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={RP.ink} strokeWidth={4} />
          <path d={`M ${cx - rx} ${cy} a ${rx} ${ry} 0 0 0 ${rx * 2} 0`} fill="url(#rkHatchLight)" />
        </g>
      ))}
      {/* 足跡 (ブーツの靴底) */}
      <g transform="rotate(-8, 960, 600)">
        <rect x={850} y={440} width={220} height={330} rx={70} fill={RP.paper} stroke={RP.ink} strokeWidth={8} />
        <rect x={866} y={456} width={188} height={298} rx={58} fill="none" stroke={RP.ink} strokeWidth={3} opacity={0.6} />
        {/* 踏み跡の横溝 */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={884} y={480 + i * 40} width={152} height={22} rx={10} fill="url(#rkHatchDense)" stroke={RP.ink} strokeWidth={2.5} />
        ))}
      </g>
      {/* 強調の放射線 */}
      <g stroke={RP.rust} strokeWidth={5} strokeLinecap="round" opacity={rayO}>
        {[-40, -15, 15, 40].map((a) => (
          <line
            key={a}
            x1={960 + Math.sin((a * Math.PI) / 180) * 220}
            y1={600 - Math.cos((a * Math.PI) / 180) * 220}
            x2={960 + Math.sin((a * Math.PI) / 180) * 280}
            y2={600 - Math.cos((a * Math.PI) / 180) * 280}
          />
        ))}
      </g>
      <Caption x={430} y={820} text="Fig. 7 ─ 月面に残る足跡" />
    </Plate>
  );
};

// question: 大きな「?」の図版風
const QuestionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 15 } });
  return (
    <Plate>
      <g transform={`translate(${W / 2}, 420) scale(${Math.max(pop, 0)})`}>
        {/* 装飾の二重円 */}
        <circle r={262} fill="none" stroke={RP.ink} strokeWidth={6} />
        <circle r={242} fill="none" stroke={RP.ink} strokeWidth={2.5} opacity={0.7} />
        <circle r={262} fill="url(#rkHatchLight)" opacity={0.4} />
        {/* 四隅の飾り線 */}
        {[45, 135, 225, 315].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M 0 -300 q 18 14 0 30 q -18 -14 0 -30" fill={RP.rust} />
          </g>
        ))}
        <text
          y={120}
          textAnchor="middle"
          fontSize={360}
          fontWeight={600}
          fill={RP.ink}
          fontFamily={REKISHI_SERIF}
        >
          ?
        </text>
      </g>
      <Caption text="─ 問い ─" />
    </Plate>
  );
};

// concept (汎用の予備図版): 砂時計 = 時の流れ
const HourglassScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cx = W / 2;
  const top = 200;
  const bottom = 660;
  const mid = (top + bottom) / 2;
  const sandP = (frame % 240) / 240;
  return (
    <Plate>
      <g stroke={RP.ink} strokeWidth={6} fill="none">
        {/* 上下の台 */}
        <rect x={cx - 190} y={top - 36} width={380} height={36} rx={8} fill={RP.paper} />
        <rect x={cx - 190} y={bottom} width={380} height={36} rx={8} fill={RP.paper} />
        <rect x={cx - 184} y={top - 28} width={368} height={20} fill="url(#rkHatchLight)" stroke="none" />
        <rect x={cx - 184} y={bottom + 8} width={368} height={20} fill="url(#rkHatchLight)" stroke="none" />
        {/* 支柱 */}
        <line x1={cx - 170} x2={cx - 170} y1={top} y2={bottom} strokeWidth={8} />
        <line x1={cx + 170} x2={cx + 170} y1={top} y2={bottom} strokeWidth={8} />
        {/* ガラスの上下の球 */}
        <path d={`M ${cx - 130} ${top} Q ${cx - 130} ${mid - 30} ${cx - 10} ${mid} Q ${cx - 130} ${mid + 30} ${cx - 130} ${bottom} L ${cx + 130} ${bottom} Q ${cx + 130} ${mid + 30} ${cx + 10} ${mid} Q ${cx + 130} ${mid - 30} ${cx + 130} ${top} Z`} />
      </g>
      {/* 上の砂 */}
      <path d={`M ${cx - 100} ${top + 40} L ${cx + 100} ${top + 40} Q ${cx + 60} ${mid - 40} ${cx} ${mid - 14} Q ${cx - 60} ${mid - 40} ${cx - 100} ${top + 40} Z`} fill="url(#rkHatch)" />
      {/* 落ちる砂 (点線が流れる) */}
      <line
        x1={cx}
        x2={cx}
        y1={mid}
        y2={bottom - 30}
        stroke={RP.rustSoft}
        strokeWidth={5}
        strokeDasharray="4 14"
        strokeDashoffset={-sandP * 72}
      />
      {/* 下に積もる砂 */}
      <path d={`M ${cx - 110} ${bottom - 4} Q ${cx} ${bottom - 90} ${cx + 110} ${bottom - 4} Z`} fill="url(#rkHatchRust)" stroke={RP.rust} strokeWidth={3} />
      <Caption text="─ 時の流れ ─" />
    </Plate>
  );
};

// chart: 倍率を「1マス vs N個の壁」で見せる (銅版画調・セル自動縮小・カウントアップ)
const RekishiChartScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).filter((i) => i.value !== undefined);
  const grow = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 90 });

  if (items.length === 2) {
    const sorted = [...items].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    const small = sorted[0];
    const big = sorted[1];
    const ratio = Math.round((big.value ?? 1) / Math.max(small.value ?? 1, 0.0001));
    if (ratio >= 10) {
      // N=10000 でも収まるよう、マスの大きさを自動で縮める (大きさはごまかさず数で見せる)
      const total = Math.min(ratio, 12000);
      const gw = 880; // 壁の最大幅
      const gh = 470; // 壁の最大高さ
      let cell = 16;
      let gap = 2;
      const fits = (c: number, g: number) => {
        const cols = Math.max(1, Math.floor(gw / (c + g)));
        return Math.ceil(total / cols) * (c + g) <= gh;
      };
      while (cell > 3 && !fits(cell, gap)) {
        cell--;
        if (cell < 8) gap = 1;
      }
      const cols = Math.max(1, Math.floor(gw / (cell + gap)));
      const rows = Math.ceil(total / cols);
      const gridX = 760;
      const gridW = cols * (cell + gap);
      const gridH = rows * (cell + gap);
      const gridY = Math.max(190, 440 - gridH / 2);
      const shown = Math.round(grow * total);
      const fullRows = Math.floor(shown / cols);
      const rest = shown % cols;
      const counter = Math.max(1, Math.round(grow * ratio));
      const counterY = Math.max(gridY - 36, 172);
      return (
        <Plate zoom={false}>
          <PlateTitle text={scene.title ?? "数字で見る"} />
          {/* 基準の1マス (壁とまったく同じ大きさ)。丸囲みで見せる */}
          <rect x={430 - cell / 2} y={450 - cell / 2} width={cell} height={cell} fill={RP.rust} />
          <circle cx={430} cy={450} r={44} fill="none" stroke={RP.rust} strokeWidth={4} />
          <text x={430} y={560} textAnchor="middle" fontSize={38} fontWeight={700} fill={RP.ink} fontFamily={REKISHI_FONT}>
            {small.label}
          </text>
          <text x={430} y={614} textAnchor="middle" fontSize={40} fontWeight={700} fill={RP.rust} fontFamily={REKISHI_FONT}>
            1
          </text>
          {/* 壁 (満ちた行はまとめて描く) */}
          {Array.from({ length: fullRows }, (_, r) => (
            <rect
              key={r}
              x={gridX}
              y={gridY + r * (cell + gap)}
              width={gridW - gap}
              height={cell}
              fill={RP.ink}
              opacity={0.88}
            />
          ))}
          {rest > 0 && (
            <rect
              x={gridX}
              y={gridY + fullRows * (cell + gap)}
              width={rest * (cell + gap) - gap}
              height={cell}
              fill={RP.ink}
              opacity={0.88}
            />
          )}
          {/* 縦の区切り線 (版画の彫り目のような粒感) */}
          {Array.from({ length: 11 }, (_, c) => (
            <line
              key={c}
              x1={gridX + (c + 1) * (gridW / 12)}
              x2={gridX + (c + 1) * (gridW / 12)}
              y1={gridY}
              y2={gridY + Math.min(gridH, (fullRows + (rest > 0 ? 1 : 0)) * (cell + gap))}
              stroke={RP.paper}
              strokeWidth={1.5}
              opacity={0.7}
            />
          ))}
          <rect x={gridX - 6} y={gridY - 6} width={gridW + 12} height={gridH + 12} fill="none" stroke={RP.inkSoft} strokeWidth={2.5} />
          <text
            x={gridX + gridW / 2}
            y={gridY + gridH + 54}
            textAnchor="middle"
            fontSize={38}
            fontWeight={700}
            fill={RP.ink}
            fontFamily={REKISHI_FONT}
          >
            {big.label}
          </text>
          {/* カウントアップ (約10,000倍) */}
          <text
            x={gridX + gridW / 2}
            y={counterY}
            textAnchor="middle"
            fontSize={72}
            fontWeight={800}
            fill={RP.rust}
            fontFamily={REKISHI_FONT}
          >
            約{counter.toLocaleString()}倍
          </text>
        </Plate>
      );
    }
  }

  // それ以外は横棒の比較 (セピア版)
  const max = Math.max(...items.map((i) => i.value ?? 0), 1);
  return (
    <Plate zoom={false}>
      <PlateTitle text={scene.title ?? "数字で見る"} />
      {items.slice(0, 4).map((it, i) => {
        const y = 240 + i * 140;
        const w = ((it.value ?? 0) / max) * 820 * grow;
        const strongest = (it.value ?? 0) === max;
        return (
          <g key={i}>
            <text x={520} y={y + 46} textAnchor="end" fontSize={36} fill={RP.ink} fontFamily={REKISHI_FONT} fontWeight={600}>
              {it.label}
            </text>
            <rect x={560} y={y} width={Math.max(w, 4)} height={62} fill={strongest ? RP.rust : "url(#rkHatch)"} stroke={RP.ink} strokeWidth={3} />
            <text
              x={580 + w}
              y={y + 46}
              fontSize={42}
              fontWeight={700}
              fill={strongest ? RP.rust : RP.ink}
              fontFamily={REKISHI_FONT}
            >
              {Math.round((it.value ?? 0) * grow * 10) / 10}
              {it.unit ?? ""}
            </text>
          </g>
        );
      })}
    </Plate>
  );
};

// ===== カード (白背景の箇条書きスライド) =====

// カードがナレーション全文をそのまま見せるか (その場合は字幕を重ねない。manabi と同じ考え方)
export const rekishiCardShowsFullText = (scene: Scene): boolean => {
  if (scene.isEnding || scene.type !== "card") return false;
  // 箇条書きスライド (items あり) は要点だけ見せるので、字幕は出す
  if (scene.items && scene.items.length > 0) return false;
  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  if (hl && text.includes(hl) && text.length <= 52) return true;
  return !hl && text.length <= 52;
};

// 紙白の全面スライドの土台 (上80%。黒帯は下20%に残す)
const CardSurface: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: RP.band }}>
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: ART_H,
        backgroundColor: RP.cardPaper,
        overflow: "hidden",
      }}
    >
      {/* スライドにも細い二重枠 */}
      <div style={{ position: "absolute", inset: 26, border: `2.5px solid ${RP.ink}`, opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: 40, border: `1.5px solid ${RP.ink}`, opacity: 0.35 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
    <Band />
  </AbsoluteFill>
);

// emphasis の語だけ錆朱にして文字列を描く
const RustText: React.FC<{ text: string; hl?: string }> = ({ text, hl }) => {
  if (!hl || !text.includes(hl)) return <>{text}</>;
  return (
    <>
      {text.split(hl).map((part, i, arr) => (
        <span key={i}>
          {part}
          {i < arr.length - 1 && <span style={{ color: RP.rust }}>{hl}</span>}
        </span>
      ))}
    </>
  );
};

// card: 白背景スライドに黒明朝で見出し+箇条書き (結論シーンで使用)
const RekishiCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 26 });

  if (scene.isEnding) {
    return (
      <CardSurface>
        <div style={{ opacity: inP, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              border: `4px solid ${RP.rust}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: REKISHI_SERIF,
              fontSize: 76,
              color: RP.ink,
              marginBottom: 44,
            }}
          >
            {REKISHI_CHANNEL.iconLetter}
          </div>
          <div style={{ fontFamily: REKISHI_SERIF, fontSize: 66, color: RP.ink, letterSpacing: 8 }}>
            {REKISHI_CHANNEL.name}
          </div>
          <div style={{ width: 70, height: 4, background: RP.rust, marginTop: 36, borderRadius: 2 }} />
        </div>
      </CardSurface>
    );
  }

  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  const bullets = (scene.items ?? []).map((i) => i.label).filter(Boolean);
  const rise = interpolate(inP, [0, 1], [24, 0]);

  // 箇条書きスライド: 見出し + 「・」の列挙。emphasis の語だけ錆朱
  if (bullets.length > 0) {
    const heading = scene.title ?? hl ?? "まとめ";
    return (
      <CardSurface>
        <div style={{ opacity: inP, transform: `translateY(${rise}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: REKISHI_SERIF,
              fontSize: 60,
              fontWeight: 700,
              color: RP.ink,
              letterSpacing: 4,
              textAlign: "center",
            }}
          >
            {heading}
          </div>
          <div style={{ width: 90, height: 4, background: RP.rust, margin: "30px 0 52px", borderRadius: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 34, alignItems: "flex-start" }}>
            {bullets.slice(0, 4).map((b, i) => {
              const o = interpolate(frame - 14 - i * 10, [0, 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: REKISHI_SERIF,
                    fontSize: 46,
                    fontWeight: 600,
                    color: RP.ink,
                    lineHeight: 1.6,
                    maxWidth: 1420,
                    opacity: o,
                  }}
                >
                  <span style={{ color: RP.rust, marginRight: 22 }}>・</span>
                  <RustText text={b} hl={hl} />
                </div>
              );
            })}
          </div>
        </div>
      </CardSurface>
    );
  }

  // 1行の結論スライド: 本文 (短ければ全文、長ければ核心の語) を大きく
  const useFull = Boolean(hl && text.includes(hl) && text.length <= 52) || (!hl && text.length <= 52);
  const display = useFull ? text : (hl ?? scene.title ?? text.slice(0, 40));
  return (
    <CardSurface>
      <div style={{ opacity: inP, transform: `translateY(${rise}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 64, height: 4, background: RP.rust, marginBottom: 56, borderRadius: 2 }} />
        <div
          style={{
            fontFamily: REKISHI_SERIF,
            fontSize: useFull ? 60 : 74,
            fontWeight: 600,
            color: RP.ink,
            textAlign: "center",
            lineHeight: 1.75,
            maxWidth: 1460,
            letterSpacing: 2,
          }}
        >
          {useFull ? <RustText text={text} hl={hl} /> : display}
        </div>
        <div style={{ width: 64, height: 4, background: RP.rust, marginTop: 56, borderRadius: 2 }} />
      </div>
    </CardSurface>
  );
};

// ===== 入口: motif (題材) を type より優先して描き分ける =====

export const RekishiSceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  // AI画像があれば絵エリア (上80%) に収めて見せる。下20%の黒帯は維持する
  if (scene.image && scene.type !== "card") {
    return (
      <AbsoluteFill style={{ backgroundColor: RP.band }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: ART_H,
            overflow: "hidden",
          }}
        >
          <ImageScene scene={scene} />
        </div>
        <Band />
      </AbsoluteFill>
    );
  }
  if (scene.isEnding) return <RekishiCardScene scene={scene} />;

  const m = scene.motif;
  // 題材 (motif) を型より優先して拾う。AIが type を揺らしても専用の図版が出るように
  if (scene.type !== "card" && scene.type !== "chart") {
    if (m === "city") return <CityScene />;
    if (m === "ruin") return <RuinScene />;
    if (m === "decay") return <DecayScene />;
    if (m === "dinosaur") return <DinosaurScene />;
    if (m === "fossilize") return <FossilizeScene />;
    if (m === "strata") return <StrataScene />;
    if (m === "future_fossil") return <FutureFossilScene scene={scene} />;
    if (m === "moon_footprint") return <MoonFootprintScene />;
    if (m === "question") return <QuestionScene />;
  }
  switch (scene.type) {
    case "card":
      return <RekishiCardScene scene={scene} />;
    case "chart":
      return <RekishiChartScene scene={scene} />;
    case "location":
      return <CityScene />;
    case "object":
      return <QuestionScene />;
    default:
      // character / diagram / その他の concept
      return <HourglassScene />;
  }
};
