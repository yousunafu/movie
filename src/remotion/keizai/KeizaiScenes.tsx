// keizai (経済ニュース解説) プリセットの画面一式。
// お手本チャンネルのテイスト分析 (docs/参考チャンネル一覧.md 大人の学び直しTV) から:
// ニュース番組のフリップ風。濃紺〜黒のスタジオ風グラデ背景に、情報は白い「フリップボード」で見せる。
// 見出しは赤いバーに白抜き太ゴシック、強調数字は黄色のビッグ文字 (黒縁取り)、
// グラフは原色 (緑・紫) の横棒+白抜きの金額ラベル。画面右上に小さな番組タイトルリボン。
// フリップは「スッと差し込まれる」「順に点灯する」動きでナレーションと同期させる。
// 1ファイルに全部まとめる (manabi / rekishi の構成を踏襲)。

import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { Scene } from "../../types";
import { KEIZAI_CHANNEL } from "../../channel";
import { ImageScene } from "../scenes/ImageScene";

// 経済室の配色 (EP)
export const EP = {
  bgTop: "#0B1430", // スタジオ背景の上 (濃紺)
  bgBottom: "#16254D", // スタジオ背景の下
  board: "#F7F7F5", // フリップボードの白
  boardEdge: "#D9D7CE", // フリップの縁
  ink: "#11213F", // フリップ上の本文 (濃紺)
  inkSoft: "#445070", // 補足の文字
  red: "#C8102E", // 見出しバーの赤
  yellow: "#FFD400", // 強調数字の黄
  green: "#3BA55C", // グラフバーの緑
  purple: "#7B5EA7", // グラフバーの紫
  white: "#FFFFFF",
} as const;

export const KEIZAI_FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";

const W = 1920;
const H = 1080;
// 画面下部は字幕 (白文字+黒縁) が来るので、フリップは y≈860 より上に収めること

// 黄色のビッグ文字用: 白フリップの上でも読めるよう濃紺の縁取りを付ける
const YELLOW_EDGE =
  "3px 0 0 #11213F, -3px 0 0 #11213F, 0 3px 0 #11213F, 0 -3px 0 #11213F, 2px 2px 0 #11213F, -2px 2px 0 #11213F, 2px -2px 0 #11213F, -2px -2px 0 #11213F";

// ===== 共通の部品 =====

// スタジオ背景 (濃紺グラデ+上からの淡いライト)
const Studio: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{ background: `linear-gradient(180deg, ${EP.bgTop} 0%, ${EP.bgBottom} 100%)` }}
  >
    {/* スタジオの照明 (中央上からの淡い光) */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 65% 50% at 50% -8%, rgba(120,150,210,0.22) 0%, rgba(120,150,210,0) 70%)",
      }}
    />
    {/* 床の反射らしい薄い帯 */}
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "100%",
        height: 150,
        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

// 画面右上の小さな番組タイトルリボン
const Ribbon: React.FC = () => (
  <div style={{ position: "absolute", top: 34, right: 46, display: "flex", alignItems: "stretch" }}>
    <div style={{ width: 10, backgroundColor: EP.red }} />
    <div
      style={{
        backgroundColor: "rgba(247,247,245,0.94)",
        color: EP.ink,
        fontFamily: KEIZAI_FONT,
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: 2,
        padding: "8px 20px 8px 16px",
      }}
    >
      {KEIZAI_CHANNEL.name}
    </div>
  </div>
);

// 白フリップボード。delay フレーム後に下から「スッと差し込まれる」。
// lit=false だと点灯前 (薄暗い) 状態で待機できる (cost_chain の順点灯用)
const Flip: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay?: number;
  lit?: boolean;
  children?: React.ReactNode;
}> = ({ x, y, w, h, delay = 0, lit = true, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 16,
  });
  const rise = interpolate(inP, [0, 1], [46, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        backgroundColor: EP.board,
        border: `3px solid ${EP.boardEdge}`,
        borderRadius: 14,
        boxShadow: "0 14px 34px rgba(0,0,0,0.5)",
        opacity: inP * (lit ? 1 : 0.32),
        transform: `translateY(${rise}px)`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};

// フリップ上部の赤い見出しバー (白抜き太ゴシック)
const RedBar: React.FC<{ text: string; fontSize?: number }> = ({ text, fontSize = 40 }) => (
  <div
    style={{
      backgroundColor: EP.red,
      color: EP.white,
      fontFamily: KEIZAI_FONT,
      fontSize,
      fontWeight: 900,
      letterSpacing: 3,
      textAlign: "center",
      padding: "12px 24px",
    }}
  >
    {text}
  </div>
);

// 黄色のビッグ数字 (濃紺の縁取り付き)
const BigYellow: React.FC<{ text: string; fontSize?: number }> = ({ text, fontSize = 88 }) => (
  <span
    style={{
      fontFamily: KEIZAI_FONT,
      fontSize,
      fontWeight: 900,
      color: EP.yellow,
      textShadow: YELLOW_EDGE,
      letterSpacing: 1,
    }}
  >
    {text}
  </span>
);

// SVGの赤い太矢印 (右向き)。p=0→1 で伸びる
const ArrowRight: React.FC<{ x: number; y: number; len: number; p: number; color?: string }> = ({
  x,
  y,
  len,
  p,
  color = EP.red,
}) => {
  const l = Math.max(len * p, 1);
  return (
    <g opacity={p}>
      <line x1={x} y1={y} x2={x + l - 26} y2={y} stroke={color} strokeWidth={16} strokeLinecap="round" />
      <path d={`M ${x + l - 34} ${y - 26} L ${x + l} ${y} L ${x + l - 34} ${y + 26} Z`} fill={color} />
    </g>
  );
};

// items から数値を2つ拾う (無ければ既定値)
const twoValues = (scene: Scene, def: [number, number]): [number, number] => {
  const vals = (scene.items ?? [])
    .map((i) => i.value)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (vals.length >= 2) return [vals[0], vals[1]];
  return def;
};

// ===== 場面 (motif ごとのフリップシーン) =====

// news: ニュース速報風の導入 (赤い速報タブ+白フリップの大見出し)
const NewsScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const headline =
    scene.text.match(/「([^」]+)」/)?.[1] ?? scene.title ?? scene.emphasis ?? "経済ニュース";
  const blink = 0.75 + 0.25 * Math.sin(frame / 7);
  const subO = interpolate(frame, [26, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Studio>
      <Ribbon />
      <Flip x={260} y={250} w={1400} h={420}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div
            style={{
              backgroundColor: EP.red,
              color: EP.white,
              fontFamily: KEIZAI_FONT,
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: 6,
              padding: "14px 34px",
              opacity: blink,
            }}
          >
            速報
          </div>
          <div style={{ flex: 1, borderBottom: `4px solid ${EP.red}` }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 330,
            gap: 30,
          }}
        >
          <div
            style={{
              fontFamily: KEIZAI_FONT,
              fontSize: 92,
              fontWeight: 900,
              color: EP.ink,
              letterSpacing: 2,
              textAlign: "center",
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontFamily: KEIZAI_FONT,
              fontSize: 36,
              fontWeight: 700,
              color: EP.inkSoft,
              opacity: subO,
            }}
          >
            ─ そのあと、何が起きる? ─
          </div>
        </div>
      </Flip>
    </Studio>
  );
};

// exchange: 両替の図 (1ドル = 100円 → 150円 のカウントアップ)
const ExchangeScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [v0, v1] = twoValues(scene, [100, 150]);
  const grow = spring({ frame: frame - 24, fps, config: { damping: 200 }, durationInFrames: 70 });
  const count = Math.round(v0 + (v1 - v0) * grow);
  const done = grow > 0.98;
  return (
    <Studio>
      <Ribbon />
      <Flip x={210} y={190} w={1500} h={560}>
        <RedBar text={scene.title ?? "円安とは?"} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 440,
            gap: 56,
          }}
        >
          {/* ドル硬貨 */}
          <svg width={280} height={280} viewBox="0 0 280 280">
            <circle cx={140} cy={140} r={120} fill={EP.green} stroke={EP.ink} strokeWidth={8} />
            <circle cx={140} cy={140} r={96} fill="none" stroke={EP.white} strokeWidth={4} opacity={0.8} />
            <text
              x={140}
              y={192}
              textAnchor="middle"
              fontSize={150}
              fontWeight={900}
              fill={EP.white}
              fontFamily={KEIZAI_FONT}
            >
              $
            </text>
          </svg>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: KEIZAI_FONT, fontSize: 56, fontWeight: 900, color: EP.ink }}>
              1ドル =
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <BigYellow text={String(count)} fontSize={150} />
              <span style={{ fontFamily: KEIZAI_FONT, fontSize: 64, fontWeight: 900, color: EP.ink }}>
                円
              </span>
            </div>
            <div style={{ fontFamily: KEIZAI_FONT, fontSize: 40, fontWeight: 800, color: EP.inkSoft }}>
              {v0}円 →{" "}
              <span style={{ color: EP.red }}>
                {v1}円{done ? " (円の力が下がる)" : ""}
              </span>
            </div>
          </div>
          {/* 円硬貨 (必要な円が増えていく) */}
          <svg width={300} height={300} viewBox="0 0 300 300">
            {Array.from({ length: 6 }, (_, i) => {
              const o = interpolate(grow, [i / 6, (i + 0.8) / 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <g key={i} opacity={i < 4 ? 1 : o}>
                  <ellipse cx={150} cy={250 - i * 34} rx={104} ry={26} fill={EP.board} stroke={EP.ink} strokeWidth={6} />
                  <text
                    x={150}
                    y={260 - i * 34}
                    textAnchor="middle"
                    fontSize={30}
                    fontWeight={900}
                    fill={EP.ink}
                    fontFamily={KEIZAI_FONT}
                  >
                    ¥
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Flip>
    </Studio>
  );
};

// import_japan: 日本地図の簡略形+外から入る矢印+赤バーフリップ (食料 約6割 / エネルギー 約9割)
const ImportJapanScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const labeled = (scene.items ?? []).filter((i) => i.label && i.value !== undefined);
  const rows =
    labeled.length >= 2
      ? labeled.slice(0, 2).map((i) => ({ label: i.label, big: `約${i.value}${i.unit ?? "割"}` }))
      : [
          { label: "食料", big: "約6割" },
          { label: "エネルギー", big: "約9割" },
        ];
  const arrowP = (d: number) =>
    interpolate(frame - d, [0, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Studio>
      <Ribbon />
      {/* 左: 日本地図の簡略形 (白シルエット) と海から入る矢印 */}
      <svg width={980} height={760} viewBox="0 0 980 760" style={{ position: "absolute", left: 60, top: 110 }}>
        {/* 海 (薄い枠) */}
        <rect x={20} y={20} width={940} height={700} rx={24} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.25)" strokeWidth={3} />
        <g fill={EP.board} stroke={EP.ink} strokeWidth={5} strokeLinejoin="round">
          {/* 北海道 */}
          <path d="M 700 120 L 780 90 L 840 130 L 820 200 L 740 220 L 690 180 Z" />
          {/* 本州 */}
          <path d="M 700 250 L 760 290 L 740 380 L 640 470 L 520 520 L 420 560 L 330 560 L 360 500 L 480 460 L 580 390 L 640 300 Z" />
          {/* 四国 */}
          <path d="M 430 590 L 520 570 L 540 610 L 450 630 Z" />
          {/* 九州 */}
          <path d="M 300 590 L 370 590 L 380 660 L 310 690 L 280 640 Z" />
        </g>
        {/* 外から入ってくる矢印 (輸入) */}
        <ArrowRight x={60} y={330} len={250} p={arrowP(10)} color={EP.yellow} />
        <ArrowRight x={40} y={470} len={240} p={arrowP(22)} color={EP.yellow} />
        <ArrowRight x={80} y={610} len={190} p={arrowP(34)} color={EP.yellow} />
        <text x={110} y={290} fontSize={34} fontWeight={800} fill={EP.white} fontFamily={KEIZAI_FONT}>
          海外から
        </text>
      </svg>
      {/* 右: 赤バーフリップ2枚 */}
      {rows.map((r, i) => (
        <Flip key={i} x={1110} y={210 + i * 290} w={720} h={240} delay={16 + i * 22}>
          <RedBar text={r.label} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 150,
              gap: 20,
            }}
          >
            <BigYellow text={r.big} fontSize={104} />
            <span style={{ fontFamily: KEIZAI_FONT, fontSize: 40, fontWeight: 800, color: EP.ink }}>
              を輸入
            </span>
          </div>
        </Flip>
      ))}
    </Studio>
  );
};

// cost_chain: 仕入れ値→企業→価格転嫁の矢印チェーン (フリップが順に点灯)
const CostChainScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const labels =
    (scene.items ?? []).filter((i) => i.label).length >= 3
      ? (scene.items ?? []).slice(0, 3).map((i) => i.label)
      : ["仕入れ値が上がる", "企業が負担する", "価格に転嫁される"];
  const steps = [0, 34, 68];
  const arrowP = (d: number) =>
    interpolate(frame - d, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Studio>
      <Ribbon />
      <Flip x={160} y={160} w={1600} h={150} delay={0}>
        <RedBar text={scene.title ?? "値上がりが届くまで"} fontSize={46} />
      </Flip>
      {labels.map((label, i) => {
        const lit = frame >= steps[i];
        return (
          <Flip key={i} x={140 + i * 580} w={500} h={300} y={420} delay={steps[i]} lit={lit}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 43,
                  backgroundColor: i === 2 ? EP.red : EP.ink,
                  color: EP.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: KEIZAI_FONT,
                  fontSize: 46,
                  fontWeight: 900,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  fontFamily: KEIZAI_FONT,
                  fontSize: 44,
                  fontWeight: 900,
                  color: i === 2 ? EP.red : EP.ink,
                  textAlign: "center",
                  lineHeight: 1.4,
                  padding: "0 20px",
                }}
              >
                {label}
              </div>
            </div>
          </Flip>
        );
      })}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <ArrowRight x={648} y={570} len={100} p={arrowP(steps[1] - 6)} />
        <ArrowRight x={1228} y={570} len={100} p={arrowP(steps[2] - 6)} />
      </svg>
    </Studio>
  );
};

// ripple: 小麦→パン、原油→電気代・輸送費の分岐図
const RippleScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const arrowP = (d: number) =>
    interpolate(frame - d, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Src: React.FC<{ y: number; label: string; delay: number }> = ({ y, label, delay }) => (
    <Flip x={190} y={y} w={460} h={190} delay={delay}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontFamily: KEIZAI_FONT,
          fontSize: 56,
          fontWeight: 900,
          color: EP.ink,
        }}
      >
        {label}
        <span style={{ color: EP.red, fontSize: 46, marginLeft: 16 }}>▲UP</span>
      </div>
    </Flip>
  );
  const Dst: React.FC<{ y: number; label: string; delay: number }> = ({ y, label, delay }) => (
    <Flip x={1280} y={y} w={460} h={160} delay={delay}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontFamily: KEIZAI_FONT,
          fontSize: 50,
          fontWeight: 900,
          color: EP.ink,
          gap: 14,
        }}
      >
        {label}
        <span style={{ color: EP.red, fontSize: 42 }}>▲</span>
      </div>
    </Flip>
  );
  return (
    <Studio>
      <Ribbon />
      <Flip x={160} y={130} w={1600} h={140} delay={0}>
        <RedBar text={scene.title ?? "値上がりの連鎖"} fontSize={44} />
      </Flip>
      <Src y={340} label="小麦" delay={10} />
      <Src y={620} label="原油" delay={34} />
      <Dst y={340} label="パン" delay={30} />
      <Dst y={540} label="電気代" delay={54} />
      <Dst y={720} label="輸送費" delay={66} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 小麦 → パン */}
        <ArrowRight x={680} y={430} len={560} p={arrowP(20)} />
        {/* 原油 → 電気代 / 輸送費 (分岐カーブが左から描かれる) */}
        {(
          [
            { d: "M 680 705 C 920 705 1040 625 1244 625", head: "M 1218 599 L 1262 625 L 1218 651 Z", delay: 46 },
            { d: "M 680 735 C 920 735 1040 800 1244 800", head: "M 1218 774 L 1262 800 L 1218 826 Z", delay: 58 },
          ] as const
        ).map((a, i) => {
          const p = arrowP(a.delay);
          const len = 640;
          return (
            <g key={i}>
              <path
                d={a.d}
                fill="none"
                stroke={EP.red}
                strokeWidth={14}
                strokeLinecap="round"
                strokeDasharray={len}
                strokeDashoffset={(1 - p) * len}
              />
              <path d={a.head} fill={EP.red} opacity={p > 0.92 ? 1 : 0} />
            </g>
          );
        })}
      </svg>
    </Studio>
  );
};

// transport: トラックのピクト+あらゆる値札に輸送費が含まれる図
const TransportScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const truckX = interpolate(frame, [0, 90], [180, 820], { extrapolateRight: "clamp" });
  const tagLabels = ["食品", "日用品", "家電"];
  return (
    <Studio>
      <Ribbon />
      <Flip x={160} y={120} w={1600} h={140} delay={0}>
        <RedBar text={scene.title ?? "輸送費はすべての値段の中に"} fontSize={44} />
      </Flip>
      {/* 値札3枚 (どれにも「輸送費」の黄色い層が入っている) */}
      {tagLabels.map((t, i) => (
        <Flip key={i} x={280 + i * 480} y={330} w={400} h={300} delay={12 + i * 14}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                height: 110,
                fontFamily: KEIZAI_FONT,
                fontSize: 42,
                fontWeight: 900,
                color: EP.ink,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  border: `5px solid ${EP.ink}`,
                  display: "inline-block",
                }}
              />
              {t}の値札
            </div>
            {/* 値段の内訳 (積み上げ) */}
            <div style={{ flex: 1, margin: "0 46px 26px", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  flex: 2,
                  backgroundColor: EP.ink,
                  color: EP.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: KEIZAI_FONT,
                  fontSize: 30,
                  fontWeight: 800,
                }}
              >
                商品そのもの
              </div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: EP.yellow,
                  color: EP.ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: KEIZAI_FONT,
                  fontSize: 32,
                  fontWeight: 900,
                  border: `3px solid ${EP.ink}`,
                }}
              >
                輸送費
              </div>
            </div>
          </div>
        </Flip>
      ))}
      {/* トラックのピクト (下を走る) */}
      <svg width={W} height={220} viewBox={`0 0 ${W} 220`} style={{ position: "absolute", left: 0, top: 640 }}>
        <line x1={120} y1={180} x2={1800} y2={180} stroke="rgba(255,255,255,0.4)" strokeWidth={5} strokeDasharray="30 22" />
        <g transform={`translate(${truckX}, 0)`}>
          {/* 荷台 */}
          <rect x={0} y={40} width={300} height={110} rx={10} fill={EP.board} stroke={EP.ink} strokeWidth={6} />
          <text x={150} y={110} textAnchor="middle" fontSize={40} fontWeight={900} fill={EP.ink} fontFamily={KEIZAI_FONT}>
            輸送費
          </text>
          {/* 運転席 */}
          <path d="M 300 70 L 380 70 L 420 110 L 420 150 L 300 150 Z" fill={EP.green} stroke={EP.ink} strokeWidth={6} />
          <rect x={316} y={84} width={54} height={36} fill={EP.bgTop} stroke={EP.ink} strokeWidth={4} />
          {/* 車輪 */}
          <circle cx={70} cy={162} r={30} fill={EP.ink} stroke={EP.white} strokeWidth={5} />
          <circle cx={230} cy={162} r={30} fill={EP.ink} stroke={EP.white} strokeWidth={5} />
          <circle cx={370} cy={162} r={30} fill={EP.ink} stroke={EP.white} strokeWidth={5} />
        </g>
      </svg>
    </Studio>
  );
};

// price_up: 値札の数字が上がるアニメ
const PriceUpScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [v0, v1] = twoValues(scene, [198, 258]);
  const grow = spring({ frame: frame - 20, fps, config: { damping: 200 }, durationInFrames: 70 });
  const count = Math.round(v0 + (v1 - v0) * grow);
  const arrowO = interpolate(frame, [52, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Studio>
      <Ribbon />
      {/* 値札 (穴あきタグ型のフリップ) */}
      <Flip x={500} y={200} w={920} h={520} delay={0}>
        <RedBar text={scene.title ?? "店頭価格"} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 400,
            gap: 18,
          }}
        >
          <div style={{ fontFamily: KEIZAI_FONT, fontSize: 44, fontWeight: 800, color: EP.inkSoft }}>
            国産野菜も
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <BigYellow text={count.toLocaleString()} fontSize={170} />
            <span style={{ fontFamily: KEIZAI_FONT, fontSize: 70, fontWeight: 900, color: EP.ink }}>
              円
            </span>
          </div>
          <div style={{ fontFamily: KEIZAI_FONT, fontSize: 38, fontWeight: 800, color: EP.inkSoft }}>
            {v0}円 → <span style={{ color: EP.red }}>{v1}円</span>
          </div>
        </div>
      </Flip>
      {/* 上向きの赤矢印 */}
      <svg width={300} height={520} viewBox="0 0 300 520" style={{ position: "absolute", left: 1470, top: 210, opacity: arrowO }}>
        <line x1={150} y1={460} x2={150} y2={140} stroke={EP.red} strokeWidth={26} strokeLinecap="round" />
        <path d="M 90 180 L 150 60 L 210 180 Z" fill={EP.red} />
      </svg>
    </Studio>
  );
};

// balance: 天秤 (左に痛み・右に恩恵。輸出企業は追い風)
const BalanceScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // ゆっくり左右に揺れてから水平に落ち着く (痛みと恩恵が「別の場所に出る」構造)
  const settle = spring({ frame: frame - 30, fps, config: { damping: 9 }, durationInFrames: 90 });
  const tilt = (1 - settle) * 7 * Math.sin(frame / 12);
  const cx = 960;
  const beamY = 330;
  const rad = (tilt * Math.PI) / 180;
  const half = 480;
  const lx = cx - Math.cos(rad) * half;
  const ly = beamY - Math.sin(rad) * half;
  const rx = cx + Math.cos(rad) * half;
  const ry = beamY + Math.sin(rad) * half;
  const Pan: React.FC<{ x: number; y: number; title: string; lines: string[]; color: string }> = ({
    x,
    y,
    title,
    lines,
    color,
  }) => (
    <div
      style={{
        position: "absolute",
        left: x - 260,
        top: y + 60,
        width: 520,
        backgroundColor: EP.board,
        border: `3px solid ${EP.boardEdge}`,
        borderRadius: 14,
        boxShadow: "0 14px 34px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundColor: color,
          color: EP.white,
          fontFamily: KEIZAI_FONT,
          fontSize: 42,
          fontWeight: 900,
          textAlign: "center",
          letterSpacing: 6,
          padding: "10px 0",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "20px 30px", display: "flex", flexDirection: "column", gap: 12 }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: KEIZAI_FONT,
              fontSize: 36,
              fontWeight: 800,
              color: EP.ink,
              textAlign: "center",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Studio>
      <Ribbon />
      <Flip x={360} y={90} w={1200} h={130} delay={0}>
        <RedBar text={scene.title ?? "円安の痛みと恩恵"} fontSize={44} />
      </Flip>
      {/* 天秤 (白い線画) */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* 支柱と台 */}
        <rect x={cx - 16} y={beamY} width={32} height={320} fill={EP.board} stroke={EP.ink} strokeWidth={4} />
        <rect x={cx - 170} y={beamY + 320} width={340} height={30} rx={10} fill={EP.board} stroke={EP.ink} strokeWidth={4} />
        {/* 梁 */}
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={EP.board} strokeWidth={20} strokeLinecap="round" />
        <circle cx={cx} cy={beamY} r={26} fill={EP.yellow} stroke={EP.ink} strokeWidth={5} />
        {/* 吊り紐 */}
        <line x1={lx} y1={ly} x2={lx} y2={ly + 70} stroke={EP.board} strokeWidth={8} />
        <line x1={rx} y1={ry} x2={rx} y2={ry + 70} stroke={EP.board} strokeWidth={8} />
      </svg>
      <Pan x={lx} y={ly} title="痛み" lines={["輸入品が高くなる", "家計の負担が増える"]} color={EP.red} />
      <Pan x={rx} y={ry} title="恩恵" lines={["輸出企業に追い風", "海外で売ると有利"]} color={EP.green} />
    </Studio>
  );
};

// chart: 横棒グラフ比較 (緑/紫バー+白抜きラベル+黄色強調+カウントアップ)
const KeizaiChartScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).filter((i) => i.value !== undefined).slice(0, 4);
  const grow = spring({ frame: frame - 10, fps, config: { damping: 200 }, durationInFrames: 80 });
  if (items.length === 0) return <KeizaiFallbackScene scene={scene} />;
  const max = Math.max(...items.map((i) => i.value ?? 0), 0.0001);
  // 強調するのは本文で言及された数値の側。無ければ最大値
  const mentionedIdx = items.findIndex((i) =>
    scene.text.replace(/[,，]/g, "").includes(String(i.value)),
  );
  const strongIdx = mentionedIdx >= 0 ? mentionedIdx : items.findIndex((i) => (i.value ?? 0) === max);
  const barColors = [EP.green, EP.purple, EP.green, EP.purple];
  const rowH = items.length <= 2 ? 170 : 130;
  const top = 250 + (items.length <= 2 ? 60 : 0);
  const fmt = (v: number) => {
    const r = Math.round(v * 10) / 10;
    return Number.isInteger(r) ? r.toLocaleString() : r.toLocaleString();
  };
  return (
    <Studio>
      <Ribbon />
      <Flip x={160} y={110} w={1600} h={720} delay={0}>
        <RedBar text={scene.title ?? "数字で比べる"} fontSize={46} />
        <div style={{ position: "relative", height: 580 }}>
          {items.map((it, i) => {
            const w = ((it.value ?? 0) / max) * 1000 * grow;
            const val = (it.value ?? 0) * grow;
            const strong = i === strongIdx;
            const y = top - 110 + i * rowH;
            return (
              <div key={i} style={{ position: "absolute", left: 0, top: y, width: "100%" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 40,
                    top: 18,
                    width: 300,
                    textAlign: "right",
                    fontFamily: KEIZAI_FONT,
                    fontSize: 40,
                    fontWeight: 900,
                    color: EP.ink,
                  }}
                >
                  {it.label}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 370,
                    top: 10,
                    width: Math.max(w, 8),
                    height: rowH - 54,
                    backgroundColor: barColors[i],
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 20,
                    boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.18)",
                  }}
                >
                  {/* 白抜きの金額ラベル (バーの中) */}
                  {w > 190 && (
                    <span
                      style={{
                        fontFamily: KEIZAI_FONT,
                        fontSize: 44,
                        fontWeight: 900,
                        color: EP.white,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmt(val)}
                      {it.unit ?? ""}
                    </span>
                  )}
                </div>
                {/* 強調側はバーの右に黄色のビッグ数字 */}
                {strong && (
                  <div style={{ position: "absolute", left: 390 + Math.max(w, 8), top: -4 }}>
                    <BigYellow text={`${fmt(val)}${it.unit ?? ""}`} fontSize={rowH <= 130 ? 66 : 84} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Flip>
    </Studio>
  );
};

// 汎用fallback: 想定外の motif でも白フリップ+キーワードで破綻しない
const KeizaiFallbackScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  const display = hl ?? scene.title ?? (text.length <= 28 ? text : text.slice(0, 26));
  return (
    <Studio>
      <Ribbon />
      <Flip x={310} y={260} w={1300} h={400}>
        <RedBar text="POINT" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 300,
            padding: "0 60px",
          }}
        >
          <div
            style={{
              fontFamily: KEIZAI_FONT,
              fontSize: 76,
              fontWeight: 900,
              color: EP.ink,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {display}
          </div>
        </div>
      </Flip>
    </Studio>
  );
};

// ===== カード (まとめフリップ) =====

// カードがナレーション全文をそのまま見せるか (その場合は字幕を重ねない。manabi / rekishi と同じ考え方)
export const keizaiCardShowsFullText = (scene: Scene): boolean => {
  if (scene.isEnding || scene.type !== "card") return false;
  // 箇条書きフリップ (items あり) は要点だけ見せるので、字幕は出す
  if (scene.items && scene.items.length > 0) return false;
  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  if (hl && text.includes(hl) && text.length <= 52) return true;
  return !hl && text.length <= 52;
};

// emphasis の語だけ赤にして文字列を描く (白フリップの上は黄色より赤が読みやすい)
const RedText: React.FC<{ text: string; hl?: string }> = ({ text, hl }) => {
  if (!hl || !text.includes(hl)) return <>{text}</>;
  return (
    <>
      {text.split(hl).map((part, i, arr) => (
        <span key={i}>
          {part}
          {i < arr.length - 1 && <span style={{ color: EP.red }}>{hl}</span>}
        </span>
      ))}
    </>
  );
};

// card: 赤見出しバー+白ボード+箇条書きのまとめフリップ
const KeizaiCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });

  if (scene.isEnding) {
    return (
      <Studio>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: inP,
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              border: `5px solid ${EP.yellow}`,
              backgroundColor: EP.board,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: KEIZAI_FONT,
              fontSize: 76,
              fontWeight: 900,
              color: EP.ink,
              marginBottom: 44,
            }}
          >
            {KEIZAI_CHANNEL.iconLetter}
          </div>
          <div
            style={{
              fontFamily: KEIZAI_FONT,
              fontSize: 68,
              fontWeight: 900,
              color: EP.white,
              letterSpacing: 8,
            }}
          >
            {KEIZAI_CHANNEL.name}
          </div>
          <div style={{ width: 90, height: 6, background: EP.red, marginTop: 36, borderRadius: 3 }} />
        </div>
      </Studio>
    );
  }

  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  const bullets = (scene.items ?? []).map((i) => i.label).filter(Boolean);

  // 箇条書きフリップ: 赤見出しバー+「・」の列挙 (1行ずつ順に出る)
  if (bullets.length > 0) {
    const heading = scene.title ?? hl ?? "まとめ";
    return (
      <Studio>
        <Ribbon />
        <Flip x={260} y={130} w={1400} h={700}>
          <RedBar text={heading} fontSize={52} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 40,
              height: 590,
              padding: "0 90px",
            }}
          >
            {bullets.slice(0, 4).map((b, i) => {
              const o = interpolate(frame - 16 - i * 12, [0, 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: KEIZAI_FONT,
                    fontSize: 50,
                    fontWeight: 800,
                    color: EP.ink,
                    lineHeight: 1.5,
                    opacity: o,
                  }}
                >
                  <span style={{ color: EP.red, marginRight: 24 }}>■</span>
                  <RedText text={b} hl={hl} />
                </div>
              );
            })}
          </div>
        </Flip>
      </Studio>
    );
  }

  // 1行のまとめフリップ: 本文 (短ければ全文、長ければ核心の語) を大きく
  const useFull = Boolean(hl && text.includes(hl) && text.length <= 52) || (!hl && text.length <= 52);
  const display = useFull ? text : (hl ?? scene.title ?? text.slice(0, 40));
  return (
    <Studio>
      <Ribbon />
      <Flip x={210} y={230} w={1500} h={460}>
        <RedBar text={scene.title ?? "まとめ"} fontSize={46} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 370,
            padding: "0 70px",
          }}
        >
          <div
            style={{
              fontFamily: KEIZAI_FONT,
              fontSize: useFull ? 58 : 72,
              fontWeight: 900,
              color: EP.ink,
              textAlign: "center",
              lineHeight: 1.65,
            }}
          >
            {useFull ? <RedText text={text} hl={hl} /> : display}
          </div>
        </div>
      </Flip>
    </Studio>
  );
};

// ===== 入口: motif (題材) を type より優先して描き分ける =====

// motif名のゆらぎを吸収して代表名に寄せる
// (例: "dollar"/"yen"→exchange、"truck"→transport、"scale"→balance、"breaking_news"→news)
export const resolveKeizaiMotif = (m: string): string | undefined => {
  if (/import|japan|map|rely/.test(m)) return "import_japan";
  if (/cost|chain|burden|pass_?on|tenka|shiire/.test(m)) return "cost_chain";
  if (/ripple|spread|wheat|bread|oil|branch/.test(m)) return "ripple";
  if (/transport|truck|logistic|deliver|ship/.test(m)) return "transport";
  if (/price|tag|inflation/.test(m)) return "price_up";
  if (/balance|scale|export|benefit|tailwind/.test(m)) return "balance";
  if (/exchange|currency|dollar|yen|rate|fx|kawase/.test(m)) return "exchange";
  if (/news|breaking|headline|flash/.test(m)) return "news";
  return undefined;
};

export const KeizaiSceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  // AI画像があればそれを優先 (カード以外)
  if (scene.image && scene.type !== "card") {
    return <ImageScene scene={scene} />;
  }
  if (scene.isEnding) return <KeizaiCardScene scene={scene} />;

  // 題材 (motif) を型より優先して拾う。AIが type を揺らしても専用のフリップが出るように
  // (card / chart 系は型で分ける)
  if (scene.type !== "card" && scene.type !== "chart") {
    const m = resolveKeizaiMotif(scene.motif ?? "");
    if (m === "news") return <NewsScene scene={scene} />;
    if (m === "exchange") return <ExchangeScene scene={scene} />;
    if (m === "import_japan") return <ImportJapanScene scene={scene} />;
    if (m === "cost_chain") return <CostChainScene scene={scene} />;
    if (m === "ripple") return <RippleScene scene={scene} />;
    if (m === "transport") return <TransportScene scene={scene} />;
    if (m === "price_up") return <PriceUpScene scene={scene} />;
    if (m === "balance") return <BalanceScene scene={scene} />;
  }
  switch (scene.type) {
    case "card":
      return <KeizaiCardScene scene={scene} />;
    case "chart":
      return <KeizaiChartScene scene={scene} />;
    default:
      // character / object / diagram / location の concept など
      return <KeizaiFallbackScene scene={scene} />;
  }
};
