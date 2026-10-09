// suuri (数理・統計で身近な疑問を解く図解) プリセットの画面一式。
// お手本のテイスト分析 (考えすぎる葦の数理統計回) から:
// 真っ黒の背景・白い線のピクトグラム・強調は赤1色だけ・
// 系図/ネットワーク/グラフの図解が主役・カードはキーワードだけ赤。
// 1ファイルに全部まとめる。

import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { Scene } from "../../types";
import { SUURI_CHANNEL } from "../../channel";
import { ImageScene } from "../scenes/ImageScene";
import { wrapJa } from "../wrapJa";

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
} as const;

export const SUURI_FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";
export const SUURI_SERIF =
  "'Noto Serif JP', 'Noto Serif CJK JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif";

const W = 1920;
const H = 1080;

// ===== 共通の部品 =====

const Header: React.FC = () => (
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

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: SP.background }}>
    {children}
    <Header />
  </AbsoluteFill>
);

// 図解の見出し (上部中央・赤い細線つき)
const DiagramTitle: React.FC<{ text?: string }> = ({ text }) => {
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
      {text}
      <div
        style={{
          width: 64,
          height: 4,
          background: SP.accent,
          margin: "18px auto 0",
          borderRadius: 2,
        }}
      />
    </div>
  );
};

// 人のピクトグラム (頭+肩)。(x, y) が頭の中心
const Person: React.FC<{
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
const SmallLabel: React.FC<{
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
const useAppear = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.max(spring({ frame: frame - delay, fps, config: { damping: 16 } }), 0);
};

// ===== 語り・つなぎの人物 =====

// variant (何回目の登場か) で立ち位置と吹き出しを変え、同じ姿の再登場を防ぐ
const ThinkingScene: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const pop = useAppear(16);
  const v = variant % 3;
  const px = v === 1 ? 1100 : v === 2 ? 960 : 820; // 体の中心
  const bx = v === 1 ? 650 : v === 2 ? 1330 : 1170; // 吹き出し
  const dir = v === 1 ? -1 : 1;
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g stroke={SP.line} strokeWidth={6} fill="none">
          <circle cx={px} cy={480} r={130} />
          <path d={`M ${px - 220} 980 q 10 -220 220 -230 q 210 10 220 230`} />
        </g>
        <circle cx={px + dir * 180} cy={330} r={10} fill={SP.faint} />
        <circle cx={px + dir * 230} cy={280} r={14} fill={SP.faint} />
        <g transform={`translate(${bx}, 200) scale(${pop})`}>
          <circle r={86} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <text y={34} textAnchor="middle" fontSize={v === 2 ? 68 : 100} fontWeight={700} fill={SP.accentSoft} fontFamily={SUURI_FONT}>
            {v === 2 ? "？？" : "?"}
          </text>
        </g>
        {v === 2 && <line x1={560} y1={982} x2={1360} y2={982} stroke={SP.dim} strokeWidth={4} />}
      </svg>
    </Frame>
  );
};

const SurprisedScene: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const frame = useCurrentFrame();
  const pop = useAppear(10);
  const flip = variant % 2 === 1;
  const px = flip ? 1100 : 820;
  const ex = flip ? 770 : 1150;
  const jump = interpolate(frame, [8, 14, 20], [0, -16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const double = variant >= 2; // 3回目以降は「!!」
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(0, ${jump})`} stroke={SP.line} strokeWidth={6} fill="none">
          <circle cx={px} cy={480} r={130} />
          <path d={`M ${px - 220} 980 q 10 -220 220 -230 q 210 10 220 230`} />
        </g>
        <g transform={`translate(${ex}, 240) scale(${pop})`}>
          <circle r={90} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
          <text y={38} textAnchor="middle" fontSize={double ? 92 : 110} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            {double ? "!!" : "!"}
          </text>
        </g>
        {[[-40, -40, -25], [40, -46, 20], [0, -60, 0]].map(([dx, dy, rot], i) => (
          <g key={i} transform={`translate(${ex + dx * 2.2}, ${110 + dy}) rotate(${rot})`} opacity={pop}>
            <line x1={0} y1={0} x2={0} y2={26} stroke={SP.accentSoft} strokeWidth={7} strokeLinecap="round" />
          </g>
        ))}
      </svg>
    </Frame>
  );
};

const NoddingScene: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const frame = useCurrentFrame();
  const pop = useAppear(14);
  const flip = variant % 2 === 1;
  const px = flip ? 1100 : 820;
  const cxm = flip ? 770 : 1150;
  const nod = Math.sin(frame / 7) * 6;
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g stroke={SP.line} strokeWidth={6} fill="none">
          <g transform={`translate(0, ${nod})`}>
            <circle cx={px} cy={485} r={130} />
          </g>
          <path d={`M ${px - 220} 980 q 10 -220 220 -230 q 210 10 220 230`} />
        </g>
        <g transform={`translate(${cxm}, 260) scale(${pop})`}>
          {variant >= 2 ? (
            <rect x={-86} y={-86} width={172} height={172} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          ) : (
            <circle r={86} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          )}
          <path
            d="M -38 2 L -8 34 L 46 -28"
            fill="none"
            stroke={SP.accent}
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </Frame>
  );
};

// 名もなき農民・漁師 (鍬を持つピクト+空欄の名札)
const UnknownFarmerScene: React.FC = () => {
  const pop = useAppear(20);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 地面 */}
        <line x1={360} y1={880} x2={1560} y2={880} stroke={SP.dim} strokeWidth={5} />
        {/* 農民: 頭・体・鍬 */}
        <g stroke={SP.line} strokeWidth={6} fill="none">
          {/* 編み笠 */}
          <path d="M 700 356 q 90 -66 180 0 Z" fill={SP.panel} />
          <circle cx={790} cy={420} r={72} />
          <path d="M 672 880 q 6 -300 118 -310 q 112 10 118 310" />
          {/* 腕と鍬 */}
          <path d="M 860 620 L 1060 520" strokeLinecap="round" />
          <path d="M 1060 520 L 1160 760" strokeLinecap="round" />
          <path d="M 1160 760 l 70 26" strokeWidth={10} strokeLinecap="round" />
        </g>
        {/* 名札: 空欄 */}
        <g transform={`translate(1270, 300)`} opacity={pop}>
          <rect x={0} y={0} width={320} height={150} rx={10} fill={SP.panel} stroke={SP.faint} strokeWidth={4} />
          <text x={160} y={64} textAnchor="middle" fontSize={34} fill={SP.faint} fontFamily={SUURI_FONT}>
            名前
          </text>
          <text x={160} y={122} textAnchor="middle" fontSize={44} fontWeight={700} fill={SP.accent} fontFamily={SUURI_FONT}>
            記録なし
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// ===== 物 =====

const QuestionScene: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const pop = useAppear(8);
  const pop2 = useAppear(20);
  if (variant % 2 === 1) {
    // 2回目は大中小の「?」が階段に並ぶ
    return (
      <Frame>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {[
            { x: 660, y: 640, r: 200, fs: 230, main: true, p: pop },
            { x: 1130, y: 520, r: 140, fs: 160, main: false, p: pop2 },
            { x: 1460, y: 420, r: 95, fs: 110, main: false, p: pop2 },
          ].map((q, i) => (
            <g key={i} transform={`translate(${q.x}, ${q.y}) scale(${q.p})`}>
              <circle r={q.r} fill={SP.panel} stroke={q.main ? SP.line : SP.dim} strokeWidth={6} />
              <text y={q.fs * 0.33} textAnchor="middle" fontSize={q.fs} fontWeight={700} fill={q.main ? SP.accent : SP.faint} fontFamily={SUURI_FONT}>
                ?
              </text>
            </g>
          ))}
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(960, 560) scale(${pop})`}>
          <circle r={230} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <text y={85} textAnchor="middle" fontSize={260} fontWeight={700} fill={SP.accent} fontFamily={SUURI_FONT}>
            ?
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 当たりくじ: 並んだくじの中で1本だけ赤く灯る
const LotteryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = 420 + i * 185;
          const win = i === 3;
          const s = Math.max(spring({ frame: frame - 6 - i * 4, fps, config: { damping: 15 } }), 0);
          const lit = win
            ? interpolate(frame, [48, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : 0;
          return (
            <g key={i} transform={`translate(${x}, ${win ? 420 - lit * 60 : 460}) scale(${s})`}>
              <rect
                x={-62}
                y={0}
                width={124}
                height={330}
                rx={10}
                fill={win && lit > 0.5 ? SP.panel : SP.background}
                stroke={win && lit > 0.5 ? SP.accent : SP.line}
                strokeWidth={win && lit > 0.5 ? 7 : 5}
              />
              <line x1={-62} y1={70} x2={62} y2={70} stroke={win && lit > 0.5 ? SP.accent : SP.dim} strokeWidth={4} strokeDasharray="10 10" />
              {win && lit > 0.5 ? (
                <text y={230} textAnchor="middle" fontSize={76} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
                  当
                </text>
              ) : (
                <text y={230} textAnchor="middle" fontSize={60} fill={SP.dim} fontFamily={SUURI_FONT}>
                  ?
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// 家系図の巻物 (系図の線の一部が破線=創作・借り物)。
// variant で赤い印の文言と位置を変え、同じ姿の再登場を防ぐ
const ScrollScene: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const frame = useCurrentFrame();
  const stamp = [
    { text: "創作まじり", x: 1250, y: 600, rot: -12 },
    { text: "証拠は?", x: 1230, y: 360, rot: 8 },
    { text: "要注意", x: 680, y: 600, rot: -8 },
  ][variant % 3];
  const open = interpolate(frame, [8, 50], [0.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const paperW = 980 * open;
  const mark = interpolate(frame, [60, 74], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 紙 (中央から左右へ開く) */}
        <rect x={960 - paperW / 2} y={300} width={paperW} height={480} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        {/* 軸 */}
        <rect x={960 - paperW / 2 - 34} y={270} width={34} height={540} rx={14} fill={SP.background} stroke={SP.line} strokeWidth={5} />
        <rect x={960 + paperW / 2} y={270} width={34} height={540} rx={14} fill={SP.background} stroke={SP.line} strokeWidth={5} />
        {/* 系図の線 (開いた分だけ見える) */}
        <g clipPath="url(#scrollClip)">
          <clipPath id="scrollClip">
            <rect x={960 - paperW / 2} y={300} width={paperW} height={480} />
          </clipPath>
          <g stroke={SP.line} strokeWidth={4} fill="none">
            <line x1={620} y1={400} x2={1300} y2={400} />
            <line x1={700} y1={400} x2={700} y2={520} />
            <line x1={960} y1={400} x2={960} y2={520} />
            <line x1={1220} y1={400} x2={1220} y2={520} />
            <line x1={620} y1={520} x2={1040} y2={520} strokeDasharray="14 12" stroke={SP.faint} />
            <line x1={840} y1={520} x2={840} y2={640} strokeDasharray="14 12" stroke={SP.faint} />
            <line x1={700} y1={640} x2={1300} y2={640} strokeDasharray="14 12" stroke={SP.faint} />
          </g>
          {[700, 960, 1220].map((x) => (
            <rect key={x} x={x - 52} y={340} width={104} height={56} fill={SP.background} stroke={SP.line} strokeWidth={4} />
          ))}
          {[840, 1100].map((x) => (
            <rect key={x} x={x - 52} y={560} width={104} height={56} fill={SP.background} stroke={SP.faint} strokeWidth={4} strokeDasharray="10 8" />
          ))}
        </g>
        {/* 赤い印 (variantで文言と位置が変わる) */}
        <g opacity={mark} transform={`translate(${stamp.x}, ${stamp.y}) rotate(${stamp.rot})`}>
          <rect x={-130} y={-46} width={260} height={92} rx={10} fill="none" stroke={SP.accent} strokeWidth={6} />
          <text y={18} textAnchor="middle" fontSize={54} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            {stamp.text}
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 年賀状: はがきがすっと立ち、宛名「藤原道長様」に赤の斜線
const NengajoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = useAppear(10);
  const strike = interpolate(frame, [52, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(960, 560) rotate(${(1 - pop) * 8}) scale(${0.6 + pop * 0.4})`} opacity={pop}>
          <rect x={-280} y={-380} width={560} height={760} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          {/* 切手と郵便番号枠 */}
          <rect x={-240} y={-340} width={110} height={130} fill="none" stroke={SP.faint} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={60 + i * 62} y={-340} width={50} height={64} fill="none" stroke={SP.accent} strokeWidth={4} />
          ))}
          {/* 宛名 */}
          <text x={0} y={40} textAnchor="middle" fontSize={76} fontWeight={700} fill={SP.ink} fontFamily={SUURI_SERIF} writing-mode="vertical-rl" transform="translate(0, -140)">
            藤原道長様
          </text>
          {/* 赤い斜線 (出さなくて大丈夫) */}
          <line
            x1={-150}
            y1={-200}
            x2={-150 + 300 * strike}
            y2={-200 + 420 * strike}
            stroke={SP.accent}
            strokeWidth={14}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </Frame>
  );
};

// ===== カード =====

export const suuriCardShowsFullText = (scene: Scene): boolean => {
  if (scene.isEnding || scene.type !== "card") return false;
  if (scene.motif === "chapter") return true;
  if (scene.motif === "quiz") return true;
  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  if (hl && text.includes(hl) && text.length <= 52) return true;
  return !hl && text.length <= 52;
};

const CHAPTER_NUM_RE = /第[0-9０-９一二三四五六七八九十]+章/;
const ChapterCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" });
  const num =
    scene.title?.match(CHAPTER_NUM_RE)?.[0] ?? scene.text.match(CHAPTER_NUM_RE)?.[0] ?? "";
  let titleText = (scene.title ?? "").replace(CHAPTER_NUM_RE, "").replace(/^[、。:：\s]+/, "").trim();
  if (!titleText) {
    titleText = scene.text
      .replace(/^(まず|第一に|ここからは|次は|次に|続いて|最後に|さて|それでは)[、\s]*/, "")
      .replace(CHAPTER_NUM_RE, "")
      .replace(/^[はもで]?[、\s]*/, "")
      .replace(/(から|を)?見て(いき|み)ましょう[。]?$/, "")
      .replace(/(という話|の話|のお話)です[。]?$/, "")
      .replace(/について考えます[。]?$/, "")
      .replace(/です[。]?$/, "")
      .replace(/[。]$/, "")
      .trim();
  }
  return (
    <Frame>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fade }}>
        <div style={{ width: 170, height: 3, background: SP.accent, borderRadius: 2 }} />
        {num && (
          <div
            style={{
              fontFamily: SUURI_FONT,
              fontSize: 46,
              fontWeight: 700,
              color: SP.accent,
              letterSpacing: 12,
              marginTop: 44,
            }}
          >
            {num}
          </div>
        )}
        <div
          style={{
            fontFamily: SUURI_FONT,
            fontSize: 78,
            fontWeight: 800,
            color: SP.ink,
            letterSpacing: 6,
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 1500,
            marginTop: num ? 30 : 48,
          }}
        >
          {wrapJa(titleText)}
        </div>
        <div style={{ width: 170, height: 3, background: SP.accent, borderRadius: 2, marginTop: 52 }} />
      </AbsoluteFill>
    </Frame>
  );
};

const QuizCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" });
  const text = scene.text.replace(/[。]$/, "");
  return (
    <Frame>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fade }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            border: `3px solid ${SP.accent}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: SUURI_FONT,
            fontSize: 44,
            fontWeight: 700,
            color: SP.accent,
          }}
        >
          Q
        </div>
        <div
          style={{
            fontFamily: SUURI_FONT,
            fontSize: 64,
            fontWeight: 700,
            color: SP.ink,
            letterSpacing: 4,
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 1460,
            marginTop: 48,
          }}
        >
          {wrapJa(text)}
        </div>
        <div style={{ width: 64, height: 3, background: SP.accent, marginTop: 48, borderRadius: 2 }} />
      </AbsoluteFill>
    </Frame>
  );
};

const SuuriCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 26 });

  if (scene.isEnding) {
    return (
      <Frame>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: inP }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              border: `4px solid ${SP.accent}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: SUURI_FONT,
              fontSize: 76,
              fontWeight: 700,
              color: SP.ink,
              marginBottom: 44,
            }}
          >
            {SUURI_CHANNEL.iconLetter}
          </div>
          <div style={{ fontFamily: SUURI_FONT, fontSize: 68, fontWeight: 700, color: SP.ink, letterSpacing: 6 }}>
            {SUURI_CHANNEL.name}
          </div>
          <div style={{ width: 70, height: 4, background: SP.accent, marginTop: 36, borderRadius: 2 }} />
        </AbsoluteFill>
      </Frame>
    );
  }

  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  const useFull = Boolean(hl && text.includes(hl) && text.length <= 52);
  const display = useFull ? text : (hl ?? (text.length <= 52 ? text : scene.title ?? text.slice(0, 40)));

  const rise = interpolate(inP, [0, 1], [26, 0]);
  return (
    <Frame>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: inP,
          transform: `translateY(${rise}px)`,
        }}
      >
        <div style={{ width: 64, height: 4, background: SP.accent, marginBottom: 56, borderRadius: 2 }} />
        <div
          style={{
            fontFamily: SUURI_FONT,
            fontSize: useFull ? 62 : 76,
            fontWeight: 800,
            color: SP.ink,
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 1460,
            letterSpacing: 2,
          }}
        >
          {useFull && hl ? wrapJa(text, hl, { color: SP.accent }) : wrapJa(String(display))}
        </div>
        <div style={{ width: 64, height: 4, background: SP.accent, marginTop: 56, borderRadius: 2 }} />
      </AbsoluteFill>
    </Frame>
  );
};

// ===== ここから図解 (この作風の主役) =====
// spring進行 (フック無し版。ループの中で使うため)
const appearAt = (frame: number, fps: number, delay: number) =>
  Math.max(spring({ frame: frame - delay, fps, config: { damping: 16 } }), 0);

// 倍々ゲームの家系図: あなたから上へ 2人→4人→8人→16人 と倍増。
// variant で木が1段育って32人まで伸びる
const DoublingTreeScene: React.FC<{ scene: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grown = variant > 0;
  const rows = grown
    ? [
        { n: 1, y: 900, sp: 0, sc: 1, label: "あなた 1人", red: false },
        { n: 2, y: 770, sp: 260, sc: 0.8, label: "両親 2人", red: false },
        { n: 4, y: 650, sp: 160, sc: 0.68, label: "祖父母 4人", red: false },
        { n: 8, y: 540, sp: 100, sc: 0.58, label: "曽祖父母 8人", red: false },
        { n: 16, y: 440, sp: 64, sc: 0.48, label: "16人", red: false },
        { n: 32, y: 350, sp: 40, sc: 0.38, label: "32人 …まだ続く", red: true },
      ]
    : [
        { n: 1, y: 880, sp: 0, sc: 1, label: "あなた 1人", red: false },
        { n: 2, y: 740, sp: 260, sc: 0.85, label: "両親 2人", red: false },
        { n: 4, y: 610, sp: 160, sc: 0.7, label: "祖父母 4人", red: false },
        { n: 8, y: 490, sp: 100, sc: 0.6, label: "曽祖父母 8人", red: false },
        { n: 16, y: 380, sp: 64, sc: 0.5, label: "16人 …倍々!", red: true },
      ];
  const cx = 880;
  const pos = (ri: number, j: number) => ({
    x: cx + (j - (rows[ri].n - 1) / 2) * rows[ri].sp,
    y: rows[ri].y,
  });
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "先祖は倍々で増える"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {rows.slice(0, -1).map((row, ri) =>
          Array.from({ length: row.n }, (_, j) => {
            const c = pos(ri, j);
            const p1 = pos(ri + 1, j * 2);
            const p2 = pos(ri + 1, j * 2 + 1);
            const op = appearAt(frame, fps, 20 + (ri + 1) * 14);
            return (
              <g key={`${ri}-${j}`} stroke={SP.dim} strokeWidth={3} opacity={op}>
                <line x1={c.x} y1={c.y - 20} x2={p1.x} y2={p1.y + 70 * rows[ri + 1].sc} />
                <line x1={c.x} y1={c.y - 20} x2={p2.x} y2={p2.y + 70 * rows[ri + 1].sc} />
              </g>
            );
          }),
        )}
        {rows.map((row, ri) => {
          const p = appearAt(frame, fps, 8 + ri * 14);
          return (
            <g key={ri} opacity={p}>
              {Array.from({ length: row.n }, (_, j) => (
                <Person
                  key={j}
                  x={pos(ri, j).x}
                  y={pos(ri, j).y}
                  scale={row.sc * (0.6 + 0.4 * p)}
                  color={row.red ? SP.accentSoft : SP.line}
                />
              ))}
              <SmallLabel
                x={1560}
                y={row.y + 40}
                text={row.label}
                anchor="start"
                color={row.red ? SP.accent : SP.faint}
                size={row.red ? 38 : 32}
                weight={row.red ? 800 : 400}
              />
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// さかのぼる代数 × 先祖の人数の爆発カーブ。
// variant で目盛りの組を変え、3回目はカーブの先 (1兆席) まで見せる
const ExpCurveScene: React.FC<{ scene: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = Math.min(variant, 2);
  const ox = 330;
  const oy = 870;
  const ex2 = 1600;
  const ey = 250;
  const curveY = (t: number) => oy - (oy - ey) * ((Math.pow(2, 10 * t) - 1) / 1023);
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    d += `${i === 0 ? "M" : "L"} ${(ox + (ex2 - ox) * t).toFixed(1)} ${curveY(t).toFixed(1)} `;
  }
  const len = 2600;
  const draw = interpolate(frame, [12, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markerSets = [
    [
      { t: 0.5, label: "10代前", value: "1,024人", red: false },
      { t: 0.78, label: "20代前", value: "約105万人", red: false },
      { t: 1, label: "30代前", value: "約10億人", red: true },
    ],
    [
      { t: 0.32, label: "5代前", value: "32人", red: false },
      { t: 0.5, label: "10代前", value: "1,024人", red: false },
      { t: 0.78, label: "20代前", value: "約105万人", red: true },
    ],
    [
      { t: 0.5, label: "10代前", value: "1,024人", red: false },
      { t: 1, label: "30代前", value: "約10億人", red: true },
    ],
  ];
  const markers = markerSets[v];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "さかのぼるほど爆発する"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g stroke={SP.faint} strokeWidth={4}>
          <line x1={ox} y1={oy} x2={ex2 + 40} y2={oy} />
          <line x1={ox} y1={oy} x2={ox} y2={ey - 40} />
        </g>
        <SmallLabel x={ex2 + 40} y={oy + 48} text="さかのぼる代数 →" anchor="end" />
        <SmallLabel x={ox - 20} y={ey - 60} text="先祖の人数" anchor="start" />
        <path
          d={d}
          fill="none"
          stroke={SP.line}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
        />
        {markers.map((mk, i) => {
          const p = appearAt(frame, fps, 46 + i * 16);
          const x = ox + (ex2 - ox) * mk.t;
          const y = curveY(mk.t);
          return (
            <g key={i} opacity={p}>
              <circle cx={x} cy={y} r={14} fill={mk.red ? SP.accent : SP.ink} />
              <SmallLabel x={x} y={y - 68} text={mk.label} color={SP.faint} size={30} />
              <SmallLabel
                x={x}
                y={y - 28}
                text={mk.value}
                color={mk.red ? SP.accent : SP.ink}
                size={mk.red ? 44 : 36}
                weight={800}
              />
            </g>
          );
        })}
        {v === 2 && (
          <g opacity={appearAt(frame, fps, 70)}>
            <line x1={ex2} y1={ey} x2={ex2 + 130} y2={ey - 120} stroke={SP.accent} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" />
            <SmallLabel x={ex2 - 20} y={ey - 140} text="40代前は…約1兆席" anchor="end" color={SP.accent} size={40} weight={800} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 全校生徒1,000人の学校 (1,024人のたとえ)
const SchoolScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = appearAt(frame, fps, 10);
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 16; c++) {
      const idx = r * 16 + c;
      const op = interpolate(frame, [30 + idx * 0.5, 38 + idx * 0.5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      dots.push(
        <circle key={idx} cx={1010 + c * 38} cy={360 + r * 50} r={9} fill={SP.line} opacity={op} />,
      );
    }
  }
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "全校生徒1,000人の学校"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g stroke={SP.line} strokeWidth={6} fill="none" opacity={b}>
          <rect x={300} y={430} width={540} height={340} />
          <path d="M 270 430 L 570 300 L 870 430" strokeLinejoin="round" />
          <rect x={520} y={620} width={100} height={150} />
          <circle cx={570} cy={520} r={44} />
          <line x1={570} y1={520} x2={570} y2={494} />
          <line x1={570} y1={520} x2={592} y2={520} />
          <rect x={350} y={490} width={60} height={60} />
          <rect x={770} y={490} width={60} height={60} />
        </g>
        {dots}
        <SmallLabel x={1300} y={850} text="生徒ひとり = 1つの点 (約1,000人)" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// 仙台市まるごと (約105万人) の街と人混み
const CityPopScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const buildings = [
    { x: 330, w: 130, h: 260 },
    { x: 490, w: 110, h: 380 },
    { x: 630, w: 150, h: 300 },
    { x: 810, w: 120, h: 460 },
    { x: 960, w: 140, h: 340 },
    { x: 1130, w: 110, h: 420 },
    { x: 1270, w: 150, h: 280 },
    { x: 1450, w: 120, h: 360 },
  ];
  const base = 760;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "仙台市 まるごと1つ分"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {buildings.map((bd, i) => {
          const p = appearAt(frame, fps, 10 + i * 6);
          const bh = bd.h * p;
          return (
            <g key={i}>
              <rect x={bd.x} y={base - bh} width={bd.w} height={bh} fill="none" stroke={SP.line} strokeWidth={5} />
              {p > 0.9 &&
                Array.from({ length: Math.floor(bd.h / 90) }, (_, r) => (
                  <g key={r}>
                    <rect x={bd.x + 24} y={base - bd.h + 30 + r * 90} width={26} height={26} fill={SP.dim} />
                    <rect x={bd.x + bd.w - 50} y={base - bd.h + 30 + r * 90} width={26} height={26} fill={SP.dim} />
                  </g>
                ))}
            </g>
          );
        })}
        <line x1={260} y1={base} x2={1660} y2={base} stroke={SP.faint} strokeWidth={4} />
        {Array.from({ length: 40 }, (_, i) => {
          const op = interpolate(frame, [50 + i, 58 + i], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <circle key={i} cx={330 + (i % 20) * 66} cy={818 + Math.floor(i / 20) * 48} r={8} fill={SP.line} opacity={op} />
          );
        })}
        <g opacity={appearAt(frame, fps, 60)}>
          <text x={960} y={255} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={46} fontWeight={800} fill={SP.accent}>
            人口 約105万人
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 地球 + 「必要な席10億 vs 当時の世界人口3億」の棒くらべ
const GlobePopScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = appearAt(frame, fps, 8);
  const bar1 = appearAt(frame, fps, 30);
  const bar2 = appearAt(frame, fps, 48);
  const bx = 1120;
  const base = 840;
  const h1 = 500 * bar1;
  const h2 = 160 * bar2;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "地球の人口でも足りない"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform="translate(560, 560)" opacity={g} stroke={SP.line} strokeWidth={5} fill="none">
          <circle r={230} />
          <ellipse rx={230} ry={90} />
          <ellipse rx={90} ry={230} />
          <line x1={-230} y1={0} x2={230} y2={0} />
        </g>
        <g opacity={bar1}>
          <rect x={bx} y={base - h1} width={180} height={h1} fill={SP.accent} opacity={0.92} />
          <SmallLabel x={bx + 90} y={base - h1 - 70} text="約10億" color={SP.accent} size={46} weight={800} />
          <SmallLabel x={bx + 90} y={base - h1 - 26} text="必要な先祖の席" color={SP.accent} size={30} weight={700} />
        </g>
        <g opacity={bar2}>
          <rect x={bx + 300} y={base - h2} width={180} height={h2} fill="none" stroke={SP.line} strokeWidth={5} />
          <SmallLabel x={bx + 390} y={base - h2 - 70} text="約3億" color={SP.ink} size={42} weight={700} />
          <SmallLabel x={bx + 390} y={base - h2 - 26} text="当時の世界人口" size={30} />
        </g>
        <line x1={bx - 40} y1={base} x2={bx + 540} y2={base} stroke={SP.faint} strokeWidth={4} />
      </svg>
    </Frame>
  );
};

// 1人のご先祖がたくさんの「席」を掛け持ちする図
const SeatShareScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pp = appearAt(frame, fps, 8);
  const seats: { x: number; y: number }[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) seats.push({ x: 1020 + c * 100, y: 330 + r * 100 });
  const linked = [2, 7, 9, 14, 16, 21, 27];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "1人で何役も掛け持ち"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={pp}>
          <Person x={480} y={440} scale={3.2} />
          <SmallLabel x={480} y={760} text="同じ1人のご先祖" size={34} color={SP.ink} weight={700} />
        </g>
        {seats.map((s, i) => {
          const p = appearAt(frame, fps, 16 + i * 2);
          const isL = linked.includes(i);
          return (
            <rect
              key={i}
              x={s.x - 30}
              y={s.y - 30}
              width={60}
              height={60}
              rx={8}
              fill="none"
              stroke={isL ? SP.accent : SP.dim}
              strokeWidth={isL ? 6 : 4}
              opacity={p}
            />
          );
        })}
        {linked.map((i, k) => {
          const s = seats[i];
          const p = appearAt(frame, fps, 60 + k * 6);
          return (
            <line key={i} x1={610} y1={470} x2={s.x - 34} y2={s.y} stroke={SP.accent} strokeWidth={4} opacity={p * 0.85} />
          );
        })}
        <g opacity={appearAt(frame, fps, 100)}>
          <text x={1310} y={900} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={44} fontWeight={800} fill={SP.accent}>
            平均140席を掛け持ち
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 数字の棒グラフ (count-up 付き。いちばん大きい棒だけ赤)
const SuuriChartScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).filter((it) => typeof it.value === "number").slice(0, 4);
  if (items.length === 0) return <ConceptScene scene={scene} />;
  const max = Math.max(...items.map((it) => it.value ?? 0), 1);
  const top = items.findIndex((it) => it.value === max);
  const y0 = items.length <= 2 ? 400 : 330;
  const rowH = items.length <= 2 ? 220 : 160;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "数字で見る"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {items.map((it, i) => {
          const p = appearAt(frame, fps, 14 + i * 12);
          const wBar = 60 + 860 * ((it.value ?? 0) / max) * p;
          const red = i === top;
          const num = Math.round((it.value ?? 0) * Math.min(p * 1.2, 1));
          return (
            <g key={i}>
              <SmallLabel x={540} y={y0 + i * rowH + 54} text={it.label} anchor="end" color={SP.ink} size={36} weight={700} />
              <rect
                x={580}
                y={y0 + i * rowH}
                width={wBar}
                height={84}
                fill={red ? SP.accent : "none"}
                stroke={red ? SP.accent : SP.line}
                strokeWidth={5}
                rx={6}
              />
              <SmallLabel
                x={580 + wBar + 28}
                y={y0 + i * rowH + 56}
                text={`${num.toLocaleString("ja-JP")}${it.unit ?? ""}`}
                anchor="start"
                color={red ? SP.accent : SP.ink}
                size={red ? 44 : 38}
                weight={800}
              />
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// きれいな二分木 → 途中で合流する網へ
const NetMergeScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pL = appearAt(frame, fps, 8);
  const pA = appearAt(frame, fps, 44);
  const pR = appearAt(frame, fps, 56);
  const lv = [820, 670, 520, 370];
  const leftCols: number[][] = [
    [0],
    [-110, 110],
    [-190, -65, 65, 190],
    [-230, -165, -98, -33, 33, 98, 165, 230],
  ];
  const Lx = 470;
  const Rx = 1400;
  const l2 = [-110, 110];
  const l3 = [-160, 0, 160];
  const l4 = [-220, -80, 80, 220];
  const netLines: [number, number, number, number][] = [
    [0, lv[0], l2[0], lv[1]],
    [0, lv[0], l2[1], lv[1]],
    [l2[0], lv[1], l3[0], lv[2]],
    [l2[0], lv[1], l3[1], lv[2]],
    [l2[1], lv[1], l3[1], lv[2]],
    [l2[1], lv[1], l3[2], lv[2]],
    [l3[0], lv[2], l4[0], lv[3]],
    [l3[0], lv[2], l4[1], lv[3]],
    [l3[1], lv[2], l4[1], lv[3]],
    [l3[1], lv[2], l4[2], lv[3]],
    [l3[2], lv[2], l4[2], lv[3]],
    [l3[2], lv[2], l4[3], lv[3]],
  ];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "家系図は木ではなく網"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={pL}>
          {leftCols.slice(0, -1).map((cols, li) =>
            cols.map((c0, j) => (
              <g key={`${li}-${j}`} stroke={SP.dim} strokeWidth={3}>
                <line x1={Lx + c0} y1={lv[li]} x2={Lx + leftCols[li + 1][j * 2]} y2={lv[li + 1]} />
                <line x1={Lx + c0} y1={lv[li]} x2={Lx + leftCols[li + 1][j * 2 + 1]} y2={lv[li + 1]} />
              </g>
            )),
          )}
          {leftCols.map((cols, li) =>
            cols.map((c0, j) => (
              <circle key={`${li}-${j}`} cx={Lx + c0} cy={lv[li]} r={14} fill="none" stroke={SP.line} strokeWidth={5} />
            )),
          )}
          <SmallLabel x={Lx} y={930} text="理屈では きれいな木" size={32} color={SP.faint} />
        </g>
        <g opacity={pA} stroke={SP.accent} strokeWidth={8} strokeLinecap="round" fill="none">
          <line x1={810} y1={590} x2={1010} y2={590} />
          <path d="M 1010 590 L 970 566 M 1010 590 L 970 614" />
        </g>
        <g opacity={pR}>
          {netLines.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={Rx + x1} y1={y1} x2={Rx + x2} y2={y2} stroke={SP.dim} strokeWidth={3} />
          ))}
          <circle cx={Rx} cy={lv[0]} r={14} fill="none" stroke={SP.line} strokeWidth={5} />
          {l2.map((c, i) => (
            <circle key={i} cx={Rx + c} cy={lv[1]} r={14} fill="none" stroke={SP.line} strokeWidth={5} />
          ))}
          {l3.map((c, i) => (
            <circle
              key={i}
              cx={Rx + c}
              cy={lv[2]}
              r={i === 1 ? 18 : 14}
              fill={i === 1 ? SP.accent : "none"}
              stroke={i === 1 ? SP.accent : SP.line}
              strokeWidth={5}
            />
          ))}
          {l4.map((c, i) => (
            <circle
              key={i}
              cx={Rx + c}
              cy={lv[3]}
              r={i === 1 || i === 2 ? 18 : 14}
              fill={i === 1 || i === 2 ? SP.accent : "none"}
              stroke={i === 1 || i === 2 ? SP.accent : SP.line}
              strokeWidth={5}
            />
          ))}
          <SmallLabel x={Rx} y={930} text="現実は 合流する網" size={34} color={SP.accent} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// はとこ婚: 左右の家をさかのぼると同じ曽祖父母に行き着く
const HatokoScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p1 = appearAt(frame, fps, 8);
  const p2 = appearAt(frame, fps, 26);
  const p3 = appearAt(frame, fps, 48);
  const ring = appearAt(frame, fps, 70);
  const topX = 960;
  const topY = 300;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "はとこ婚なら席がひとつに"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g stroke={SP.dim} strokeWidth={4} fill="none">
          <path d="M 700 800 L 560 630" opacity={p2} />
          <path d="M 1220 800 L 1360 630" opacity={p2} />
          <path d={`M 560 540 L ${topX - 60} ${topY + 90}`} opacity={p3} />
          <path d={`M 1360 540 L ${topX + 60} ${topY + 90}`} opacity={p3} />
        </g>
        <g opacity={p1}>
          <Person x={700} y={820} scale={1.3} />
          <Person x={1220} y={820} scale={1.3} />
          <line x1={760} y1={880} x2={1160} y2={880} stroke={SP.accent} strokeWidth={5} />
          <SmallLabel x={960} y={850} text="はとこ同士の結婚" color={SP.ink} size={34} weight={700} />
        </g>
        <g opacity={p2}>
          <Person x={560} y={560} scale={0.9} color={SP.faint} />
          <Person x={1360} y={560} scale={0.9} color={SP.faint} />
          <SmallLabel x={440} y={590} text="祖父母" anchor="end" />
          <SmallLabel x={1480} y={590} text="祖父母" anchor="start" />
        </g>
        <g opacity={p3}>
          <Person x={topX - 50} y={topY} scale={1.1} color={SP.accentSoft} />
          <Person x={topX + 50} y={topY} scale={1.1} color={SP.accentSoft} />
        </g>
        <g opacity={ring}>
          <circle cx={topX} cy={topY + 25} r={140} fill="none" stroke={SP.accent} strokeWidth={5} strokeDasharray="14 12" />
          <SmallLabel x={topX + 170} y={topY + 30} text="同じ曽祖父母!" anchor="start" color={SP.accent} size={40} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 日本列島に親戚ネットワークが赤く走る (variantで灯る線が増える)
const JapanNetScene: React.FC<{ scene: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = appearAt(frame, fps, 8);
  const nodes: [number, number][] = [
    [620, 780], [760, 720], [860, 640], [980, 600], [1080, 540],
    [1160, 460], [1260, 400], [1360, 330], [900, 700], [1040, 660],
    [1180, 560], [740, 820],
  ];
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
    [1, 8], [8, 9], [9, 10], [10, 5], [0, 11], [11, 8], [2, 9], [4, 10], [3, 9],
  ];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "日本中が遠い親戚"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={p * 0.9} stroke={SP.dim} strokeWidth={4} fill="none">
          <path d="M 540 860 Q 500 800 580 760 Q 660 730 720 760 Q 760 800 700 850 Q 620 890 540 860 Z" />
          <path d="M 760 780 Q 740 700 840 640 Q 980 560 1120 480 Q 1240 410 1300 360 Q 1360 320 1380 360 Q 1360 440 1240 520 Q 1080 630 920 720 Q 820 770 760 780 Z" />
          <path d="M 1380 240 Q 1360 180 1440 160 Q 1520 170 1500 250 Q 1450 300 1400 280 Z" />
          <path d="M 880 760 Q 920 740 980 760 Q 960 800 900 800 Z" />
        </g>
        {edges.map(([a, b], i) => {
          const lit = (i + Math.floor(frame / 6) + variant * 5) % edges.length < 3 + Math.min(variant, 2) * 2;
          return (
            <line
              key={i}
              x1={nodes[a][0]}
              y1={nodes[a][1]}
              x2={nodes[b][0]}
              y2={nodes[b][1]}
              stroke={lit ? SP.accent : SP.faint}
              strokeWidth={lit ? 5 : 3}
              opacity={appearAt(frame, fps, 20 + i * 3) * (lit ? 1 : 0.7)}
            />
          );
        })}
        {nodes.map(([x, y], i) => {
          const red = variant >= 1 && i % 5 === 0;
          return (
            <circle key={i} cx={x} cy={y} r={red ? 13 : 10} fill={red ? SP.accent : SP.line} opacity={appearAt(frame, fps, 14 + i * 3)} />
          );
        })}
      </svg>
    </Frame>
  );
};

// 藤原道長本人 (烏帽子・束帯・扇・望月)。
// 「この世をば」の歌の文では望月の歌モード、variant で構図を変える
const MichinagaScene: React.FC<{ scene?: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const moon = appearAt(frame, fps, 8);
  const body = appearAt(frame, fps, 20);
  const tag = appearAt(frame, fps, 54);
  const poem = /この世をば|望月の歌|欠けたる/.test(scene?.text ?? "");

  if (poem) {
    // 望月の歌: 大きな満月と歌 (縦書き)
    return (
      <Frame>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <circle cx={700} cy={540} r={250} fill="none" stroke={SP.line} strokeWidth={6} opacity={moon} />
          <circle cx={700} cy={540} r={290} fill="none" stroke={SP.dim} strokeWidth={2} opacity={moon * 0.7} />
          <SmallLabel x={700} y={900} text="望月 = 欠けたところのない満月" size={30} />
          {["この世をば", "わが世とぞ思ふ", "望月の…"].map((ln, i) => (
            <text
              key={i}
              x={1420 - i * 110}
              y={300}
              fontFamily={SUURI_SERIF}
              fontSize={54}
              fontWeight={700}
              fill={i === 2 ? SP.accent : SP.ink}
              letterSpacing={8}
              writingMode="vertical-rl"
              opacity={appearAt(frame, fps, 20 + i * 16)}
            >
              {ln}
            </text>
          ))}
        </svg>
      </Frame>
    );
  }

  const v = variant % 3;
  if (v === 2) {
    // 3回目は顔のクローズアップ (烏帽子を大きく)
    return (
      <Frame>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g opacity={body} stroke={SP.line} strokeWidth={7} fill="none">
            <path d="M 700 460 Q 720 220 820 200 Q 920 220 940 460 Z" strokeLinejoin="round" />
            <circle cx={820} cy={600} r={140} />
            <path d="M 540 1000 q 20 -260 280 -270 q 260 10 280 270" />
          </g>
          <g opacity={tag}>
            <text x={1340} y={560} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={64} fontWeight={800} fill={SP.ink} letterSpacing={8}>
              藤原道長
            </text>
            <SmallLabel x={1340} y={630} text="この人が「あなたの先祖」" color={SP.accent} size={34} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  const flip = v === 1; // 2回目は左右を入れ替える
  const mx = flip ? 1100 : 820; // 人物の中心
  const moonX = flip ? 480 : 1360;
  const dx = mx - 820;
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={moon}>
          <circle cx={moonX} cy={300} r={130} fill="none" stroke={SP.line} strokeWidth={5} opacity={0.9} />
          <SmallLabel x={moonX} y={490} text="望月 (満月)" color={SP.faint} size={30} />
        </g>
        <g opacity={body} stroke={SP.line} strokeWidth={6} fill="none" transform={`translate(${dx}, 0)`}>
          <path d="M 760 330 Q 770 220 820 210 Q 870 220 880 330 Z" strokeLinejoin="round" />
          <circle cx={820} cy={400} r={72} />
          <path d="M 560 900 Q 580 640 700 560 L 820 500 L 940 560 Q 1060 640 1080 900 Z" strokeLinejoin="round" />
          <path d="M 700 620 L 640 900 M 940 620 L 1000 900" />
          <path d="M 1030 700 L 1120 600 M 1030 700 L 1150 640 M 1030 700 L 1160 690" />
          <path d="M 1120 600 Q 1160 640 1160 690" />
        </g>
        <g opacity={tag}>
          <text x={moonX} y={640} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={58} fontWeight={800} fill={SP.ink} letterSpacing={6}>
            藤原道長
          </text>
          <SmallLabel x={moonX} y={700} text={flip ? "権力も子孫も桁違い" : "966 - 1028 平安貴族の頂点"} size={28} />
        </g>
      </svg>
    </Frame>
  );
};

// ポイント3つの箱 (赤い番号バッジつき)
const ThreePointsScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labels = (scene.items?.map((it) => it.label).filter(Boolean) ?? []).slice(0, 3);
  const texts = labels.length === 3 ? labels : ["千年前くらいの人である", "子孫が大繁栄した", "記録が残っている"];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "ポイントは3つ"} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 36, paddingTop: 60 }}>
        {texts.map((t, i) => {
          const p = appearAt(frame, fps, 18 + i * 16);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                width: 1100,
                padding: "32px 48px",
                background: SP.panel,
                border: `3px solid ${SP.dim}`,
                borderRadius: 14,
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px)`,
              }}
            >
              <div
                style={{
                  minWidth: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: SP.accent,
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: SUURI_FONT,
                  fontSize: 42,
                  fontWeight: 800,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontFamily: SUURI_FONT, fontSize: 44, fontWeight: 700, color: SP.ink }}>{t}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </Frame>
  );
};

// 道長から下へ子孫が増殖していく。
// variant で木が1段深く育ち、ラベルも変わる (同じ姿の再登場を防ぐ)
const DescendTreeScene: React.FC<{ scene: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const top = appearAt(frame, fps, 8);
  const v = Math.min(variant, 2);
  const rows =
    v === 0
      ? [
          { n: 3, y: 480, sp: 300, sc: 0.85 },
          { n: 7, y: 640, sp: 170, sc: 0.65 },
        ]
      : [
          { n: 3, y: 440, sp: 300, sc: 0.8 },
          { n: 7, y: 570, sp: 170, sc: 0.6 },
          { n: 13, y: 700, sp: 112, sc: 0.48 },
        ];
  const cx = 960;
  const rowX = (row: { n: number; sp: number }, j: number) => cx + (j - (row.n - 1) / 2) * row.sp;
  const label = ["千年後 → 無数の子孫", "代を重ねるごとに加速する", "もう数えきれない"][v];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "子孫は下へ広がり続ける"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={top}>
          <path d="M 932 316 Q 938 252 960 247 Q 982 252 988 316 Z" fill="none" stroke={SP.line} strokeWidth={5} strokeLinejoin="round" />
          <Person x={960} y={340} scale={1.2} />
          <SmallLabel x={1110} y={350} text="道長" anchor="start" color={SP.ink} size={36} weight={700} />
        </g>
        {rows.map((row, ri) => {
          const p = appearAt(frame, fps, 26 + ri * 16);
          const parent = ri === 0 ? null : rows[ri - 1];
          return (
            <g key={ri} opacity={p}>
              {Array.from({ length: row.n }, (_, j) => {
                const x = rowX(row, j);
                const px = parent
                  ? rowX(parent, Math.min(Math.floor((j / row.n) * parent.n), parent.n - 1))
                  : cx;
                const py = parent ? parent.y + 50 * parent.sc : 418;
                const redDot = v === 2 && ri === rows.length - 1 && j % 4 === 1;
                return (
                  <g key={j}>
                    <line x1={px} y1={py} x2={x} y2={row.y - 20} stroke={SP.dim} strokeWidth={3} />
                    <Person x={x} y={row.y} scale={row.sc} color={redDot ? SP.accentSoft : SP.line} />
                  </g>
                );
              })}
            </g>
          );
        })}
        {v === 0 ? (
          <>
            {Array.from({ length: 60 }, (_, i) => {
              const op = interpolate(frame, [62 + i, 70 + i], [0, 0.9], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <circle key={i} cx={420 + (i % 20) * 57} cy={790 + Math.floor(i / 20) * 52} r={9} fill={SP.line} opacity={op} />
              );
            })}
            <SmallLabel x={960} y={762} text={label} color={SP.accent} size={34} weight={800} />
          </>
        ) : (
          <>
            {[880, 960, 1040].map((x, i) => (
              <circle key={i} cx={x} cy={752} r={8} fill={SP.faint} opacity={appearAt(frame, fps, 70 + i * 6)} />
            ))}
            <SmallLabel x={960} y={800} text={label} color={SP.accent} size={36} weight={800} />
          </>
        )}
      </svg>
    </Frame>
  );
};

// 多くの家系は途中で絶える。残った1本だけが今につながる
const ExtinctLineScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = [420, 650, 880, 1110, 1340, 1570];
  const stops = [520, 700, 0, 620, 820, 560];
  const survivor = 2;
  const yTop = 280;
  const yBot = 860;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "家系は簡単に途絶える"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <SmallLabel x={300} y={yTop + 10} text="千年前" anchor="end" />
        <SmallLabel x={300} y={yBot + 10} text="現代" anchor="end" />
        {cols.map((x, i) => {
          const p = appearAt(frame, fps, 10 + i * 8);
          const isS = i === survivor;
          const endY = isS
            ? yTop + (yBot - yTop) * Math.min(p * 1.1, 1)
            : Math.min(yTop + (yBot - yTop) * p * 1.4, stops[i]);
          const cross = appearAt(frame, fps, 34 + i * 8);
          return (
            <g key={i}>
              <circle cx={x} cy={yTop} r={12} fill="none" stroke={SP.line} strokeWidth={5} opacity={p} />
              <line x1={x} y1={yTop + 14} x2={x} y2={endY} stroke={isS ? SP.line : SP.dim} strokeWidth={isS ? 6 : 4} opacity={p} />
              {!isS && cross > 0.1 && (
                <g transform={`translate(${x}, ${stops[i]}) scale(${cross})`} stroke={SP.accent} strokeWidth={8} strokeLinecap="round">
                  <line x1={-22} y1={-22} x2={22} y2={22} />
                  <line x1={22} y1={-22} x2={-22} y2={22} />
                </g>
              )}
              {isS && (
                <g opacity={appearAt(frame, fps, 80)}>
                  <circle cx={x} cy={yBot} r={20} fill={SP.accent} />
                  <circle cx={x} cy={yBot} r={34} fill="none" stroke={SP.accentSoft} strokeWidth={3} opacity={0.7} />
                  <SmallLabel x={x + 56} y={yBot + 12} text="生き残った1本" color={SP.accent} size={34} weight={800} anchor="start" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// 一家三后: 道長の娘3人がきさきに。皇室へ血が入る
const CrownScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = appearAt(frame, fps, 8);
  const topP = appearAt(frame, fps, 70);
  const crownPath = (x: number, y: number, s: number) =>
    `M ${x - 34 * s} ${y} L ${x - 34 * s} ${y - 26 * s} L ${x - 17 * s} ${y - 10 * s} L ${x} ${y - 34 * s} L ${x + 17 * s} ${y - 10 * s} L ${x + 34 * s} ${y - 26 * s} L ${x + 34 * s} ${y} Z`;
  const daughters = [660, 960, 1260];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "一家三后 — 娘3人がきさきに"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={base}>
          <Person x={960} y={820} scale={1.3} />
          <SmallLabel x={790} y={835} text="藤原道長" color={SP.ink} size={34} weight={700} anchor="end" />
        </g>
        {daughters.map((x, i) => {
          const p = appearAt(frame, fps, 26 + i * 14);
          return (
            <g key={i} opacity={p}>
              <line x1={960} y1={800} x2={x} y2={610} stroke={SP.dim} strokeWidth={4} />
              <Person x={x} y={555} scale={1} />
              <path d={crownPath(x, 512, 1)} fill="none" stroke={SP.accent} strokeWidth={5} strokeLinejoin="round" />
            </g>
          );
        })}
        <g opacity={topP}>
          <line x1={960} y1={470} x2={960} y2={330} stroke={SP.accent} strokeWidth={5} strokeDasharray="12 10" />
          <path d={crownPath(960, 290, 1.7)} fill="none" stroke={SP.accent} strokeWidth={6} strokeLinejoin="round" />
          <SmallLabel x={1090} y={300} text="天皇家へ" color={SP.accent} size={38} weight={800} anchor="start" />
        </g>
      </svg>
    </Frame>
  );
};

// あなた→道長の経路は1本ではなく何万本もある
const PathCountScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colsN = 6;
  const rowsN = 4;
  const gx = (c: number) => 480 + c * 200;
  const gy = (r: number) => 310 + r * 170;
  const grid = appearAt(frame, fps, 8);
  const routes = [
    [3, 2, 2, 1, 1, 0],
    [3, 3, 2, 2, 1, 0],
    [3, 2, 1, 1, 0, 0],
    [3, 3, 3, 2, 1, 0],
  ];
  const route = routes[Math.floor(frame / 20) % routes.length];
  const d = route.map((r, c) => `${c === 0 ? "M" : "L"} ${gx(c)} ${gy(r)}`).join(" ");
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "つながる経路は何万本も"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={grid}>
          {Array.from({ length: colsN - 1 }, (_, c) =>
            Array.from({ length: rowsN }, (_, r) => (
              <g key={`${c}-${r}`} stroke={SP.dim} strokeWidth={2} opacity={0.6}>
                <line x1={gx(c)} y1={gy(r)} x2={gx(c + 1)} y2={gy(r)} />
                {r < rowsN - 1 && <line x1={gx(c)} y1={gy(r + 1)} x2={gx(c + 1)} y2={gy(r)} />}
              </g>
            )),
          )}
          {Array.from({ length: colsN }, (_, c) =>
            Array.from({ length: rowsN }, (_, r) => (
              <circle key={`${c}-${r}`} cx={gx(c)} cy={gy(r)} r={10} fill={SP.dim} />
            )),
          )}
        </g>
        <path
          d={d}
          fill="none"
          stroke={SP.accent}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={appearAt(frame, fps, 24)}
        />
        <g opacity={grid}>
          <circle cx={gx(0)} cy={gy(3)} r={22} fill="none" stroke={SP.line} strokeWidth={5} />
          <SmallLabel x={gx(0) - 50} y={gy(3) + 12} text="あなた" anchor="end" color={SP.ink} size={34} weight={700} />
          <circle cx={gx(5)} cy={gy(0)} r={26} fill="none" stroke={SP.accent} strokeWidth={5} />
          <SmallLabel x={gx(5)} y={gy(0) - 56} text="道長" color={SP.accent} size={36} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// DNAは代ごとに半分ずつ薄まる (らせん + 半減バー)。
// variant で段数が育つ: 1回目は3段まで、2回目から30代前 (ほぼ0%) まで
const DnaHalfScene: React.FC<{ scene: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const helix = appearAt(frame, fps, 8);
  const allBars = [
    { label: "親", v: 0.5, text: "1/2" },
    { label: "祖父母", v: 0.25, text: "1/4" },
    { label: "曽祖父母", v: 0.125, text: "1/8" },
    { label: "…10代前", v: 0.02, text: "約0.1%" },
    { label: "30代前", v: 0.006, text: "ほぼ0%" },
  ];
  const bars = variant === 0 ? allBars.slice(0, 3) : allBars;
  const rowH = variant === 0 ? 170 : 120;
  const ringOn = variant >= 2;
  const turns: React.ReactNode[] = [];
  for (let i = 0; i < 40; i++) {
    const y = 260 + i * 16;
    const ph = i / 4 + frame / 30;
    const x1 = 380 + Math.sin(ph) * 90;
    const x2 = 380 - Math.sin(ph) * 90;
    turns.push(
      <g key={i} opacity={helix}>
        <circle cx={x1} cy={y} r={5} fill={SP.line} />
        <circle cx={x2} cy={y} r={5} fill={SP.faint} />
        {i % 4 === 0 && <line x1={x1} y1={y} x2={x2} y2={y} stroke={SP.dim} strokeWidth={3} />}
      </g>,
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "DNAは半分ずつ薄まる"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {turns}
        {bars.map((b2, i) => {
          const p = appearAt(frame, fps, 16 + i * 12);
          const wBar = 760 * b2.v * p + 8;
          const red = i >= 3;
          const y = 300 + i * rowH;
          return (
            <g key={i} opacity={p}>
              <SmallLabel x={790} y={y + 40} text={b2.label} anchor="end" color={SP.ink} size={32} weight={700} />
              <rect x={820} y={y} width={wBar} height={56} fill={red ? SP.accent : SP.line} rx={4} />
              <SmallLabel
                x={840 + wBar + 16}
                y={y + 42}
                text={b2.text}
                anchor="start"
                color={red ? SP.accent : SP.faint}
                size={red ? 40 : 32}
                weight={red ? 800 : 400}
              />
            </g>
          );
        })}
        {ringOn && (
          <g opacity={appearAt(frame, fps, 80)}>
            <rect
              x={760}
              y={300 + (bars.length - 1) * rowH - 22}
              width={520}
              height={100}
              rx={14}
              fill="none"
              stroke={SP.accent}
              strokeWidth={4}
              strokeDasharray="14 12"
            />
            <SmallLabel
              x={1320}
              y={300 + (bars.length - 1) * rowH + 42}
              text="それでも、つながりは本物"
              anchor="start"
              color={SP.accent}
              size={34}
              weight={800}
            />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// 平安から現代まで、一度も途切れなかった命のバトン。
// variant で鎖が長く・波打つ形に育つ
const ChainLightsScene: React.FC<{ scene: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = variant >= 1 ? 20 : 14;
  const x0 = 300;
  const x1 = 1620;
  const xi = (i: number) => x0 + ((x1 - x0) / (n - 1)) * i;
  const yi = (i: number) => 560 + (variant >= 1 ? Math.sin(i * 0.8) * 60 : 0);
  const lit = Math.floor(frame / 5) % (n + 8);
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "千年、一度も途切れなかった"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Array.from({ length: n - 1 }, (_, i) => (
          <line
            key={i}
            x1={xi(i) + 20}
            y1={yi(i)}
            x2={xi(i + 1) - 20}
            y2={yi(i + 1)}
            stroke={i < lit ? SP.accentSoft : SP.dim}
            strokeWidth={i < lit ? 5 : 3}
            opacity={appearAt(frame, fps, 10 + i * 4)}
          />
        ))}
        {Array.from({ length: n }, (_, i) => {
          const p = appearAt(frame, fps, 8 + i * 4);
          const isLit = i === lit;
          return (
            <g key={i} opacity={p}>
              <circle
                cx={xi(i)}
                cy={yi(i)}
                r={isLit ? 22 : 14}
                fill={i <= lit ? SP.accent : "none"}
                stroke={i <= lit ? SP.accent : SP.line}
                strokeWidth={4}
              />
              {isLit && <circle cx={xi(i)} cy={yi(i)} r={36} fill="none" stroke={SP.accentSoft} strokeWidth={3} opacity={0.6} />}
            </g>
          );
        })}
        <SmallLabel x={x0} y={yi(0) + 90} text="平安時代" color={SP.ink} size={34} weight={700} />
        <SmallLabel x={x1} y={yi(n - 1) + 90} text="現代のあなた" color={SP.accent} size={34} weight={800} />
      </svg>
    </Frame>
  );
};

// 今日の道のり (章の一覧)
const RoadmapScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labels = (scene.items?.map((it) => it.label).filter(Boolean) ?? []).slice(0, 4);
  const texts = labels.length >= 2 ? labels : ["先祖の倍々ゲーム", "人数が合わない謎", "なぜ道長なのか", "それでも奇跡"];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "今日の道のり"} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30, paddingTop: 70 }}>
        {texts.map((t, i) => {
          const p = appearAt(frame, fps, 16 + i * 14);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 34,
                width: 1060,
                padding: "26px 44px",
                background: SP.panel,
                borderLeft: `8px solid ${SP.accent}`,
                borderRadius: 10,
                opacity: p,
                transform: `translateX(${(1 - p) * 40}px)`,
              }}
            >
              <div style={{ fontFamily: SUURI_FONT, fontSize: 34, fontWeight: 800, color: SP.accent, minWidth: 130 }}>
                第{i + 1}章
              </div>
              <div style={{ fontFamily: SUURI_FONT, fontSize: 40, fontWeight: 700, color: SP.ink }}>{t}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </Frame>
  );
};

// 昔の村 (藁ぶき屋根と田んぼ)
const VillageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = appearAt(frame, fps, 6);
  const h1 = appearAt(frame, fps, 16);
  const h2 = appearAt(frame, fps, 28);
  const f = appearAt(frame, fps, 40);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <path
          d="M 240 560 L 460 360 L 680 560 M 560 460 L 760 300 L 980 480"
          fill="none"
          stroke={SP.dim}
          strokeWidth={5}
          opacity={m}
          strokeLinejoin="round"
        />
        <g opacity={h1} stroke={SP.line} strokeWidth={6} fill="none" strokeLinejoin="round">
          <path d="M 520 640 L 700 480 L 880 640 Z" />
          <rect x={570} y={640} width={260} height={160} />
          <rect x={670} y={700} width={70} height={100} />
        </g>
        <g opacity={h2} stroke={SP.line} strokeWidth={5} fill="none" strokeLinejoin="round">
          <path d="M 1020 680 L 1150 560 L 1280 680 Z" />
          <rect x={1055} y={680} width={190} height={120} />
        </g>
        <g opacity={f} stroke={SP.faint} strokeWidth={4}>
          {Array.from({ length: 3 }, (_, r) =>
            Array.from({ length: 10 }, (_, c) => (
              <line key={`${r}-${c}`} x1={420 + c * 110} y1={848 + r * 34} x2={470 + c * 110} y2={848 + r * 34} />
            )),
          )}
        </g>
      </svg>
    </Frame>
  );
};

// まとめ・概念図 (中心の円 + まわりの要素)。該当する絵がない diagram の受け皿
const ConceptScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const center = appearAt(frame, fps, 10);
  const word = (scene.emphasis ?? scene.title ?? "ポイント").replace(/[「」]/g, "").slice(0, 10);
  const items = (scene.items?.map((it) => it.label).filter(Boolean) ?? []).slice(0, 4);
  const angles = [0, 180, -90, 90];
  const cx = 960;
  const cy = 580;
  const lines = word.length > 5 ? [word.slice(0, Math.ceil(word.length / 2)), word.slice(Math.ceil(word.length / 2))] : [word];
  return (
    <Frame>
      <DiagramTitle text={items.length > 0 ? scene.title : undefined} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {items.map((t, i) => {
          const p = appearAt(frame, fps, 30 + i * 12);
          const a = (angles[i % angles.length] * Math.PI) / 180;
          const x = cx + Math.cos(a) * 445;
          const y = cy + Math.sin(a) * 250;
          return (
            <g key={i} opacity={p}>
              <line x1={cx + Math.cos(a) * 180} y1={cy + Math.sin(a) * 180} x2={x} y2={y} stroke={SP.dim} strokeWidth={4} />
              <circle cx={x} cy={y} r={96} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
              <text x={x} y={y + 12} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={700} fill={SP.ink}>
                {String(t).slice(0, 6)}
              </text>
            </g>
          );
        })}
        <g transform={`translate(${cx}, ${cy}) scale(${center})`}>
          <circle r={170} fill={SP.panel} stroke={SP.accent} strokeWidth={6} />
          {lines.map((ln, i) => (
            <text
              key={i}
              y={lines.length === 1 ? 16 : i === 0 ? -14 : 44}
              textAnchor="middle"
              fontFamily={SUURI_FONT}
              fontSize={44}
              fontWeight={800}
              fill={SP.ink}
              letterSpacing={2}
            >
              {ln}
            </text>
          ))}
        </g>
      </svg>
    </Frame>
  );
};

// ===== 台本の言葉に寄り添う絵 (2回目の総点検で追加した9種) =====

// 掛け算と少しの想像力: 考える人の吹き出しに赤い×記号
const MultiplyImagineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = useAppear(14);
  const tw = Math.sin(frame / 9) * 4;
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g stroke={SP.line} strokeWidth={6} fill="none">
          <circle cx={820} cy={480} r={130} />
          <path d="M 600 980 q 10 -220 220 -230 q 210 10 220 230" />
        </g>
        <circle cx={1000} cy={340} r={10} fill={SP.faint} />
        <circle cx={1055} cy={290} r={14} fill={SP.faint} />
        <g transform={`translate(1230, 210) scale(${pop})`}>
          <ellipse rx={150} ry={110} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <text x={-44} y={34} textAnchor="middle" fontSize={100} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            ×
          </text>
          <text x={52} y={32} textAnchor="middle" fontSize={84} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>
            2
          </text>
        </g>
        {[[1440, 120, -20], [1060, 100, 15], [1430, 330, 30]].map(([x, y, rot], i) => (
          <g key={i} transform={`translate(${x}, ${y + tw}) rotate(${rot})`} opacity={pop}>
            <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={SP.accentSoft} />
          </g>
        ))}
      </svg>
    </Frame>
  );
};

// 数学の話: 黒板風の枠。文に割り算・計算があれば実際の式を黒板に書く
const MathTalkScene: React.FC<{ scene: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = scene.text;
  // 文に出てきた計算をそのまま黒板に書く (左辺=白、右辺=赤)
  const eq = /割り算|140/.test(t)
    ? { lhs: "10億 ÷ 700万", rhs: "≒ 140" }
    : /10億|30代/.test(t)
      ? { lhs: "2 × 2 × … × 2", rhs: "≒ 10億" }
      : variant === 1
        ? { lhs: "2 × 2 × 2 × …", rhs: "= ?" }
        : null;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "数学で考える"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect
          x={430}
          y={300}
          width={1060}
          height={500}
          rx={18}
          fill={SP.panel}
          stroke={SP.line}
          strokeWidth={5}
          opacity={appearAt(frame, fps, 8)}
        />
        {eq ? (
          <>
            <text
              x={960}
              y={510}
              textAnchor="middle"
              fontSize={92}
              fontWeight={800}
              fill={SP.line}
              fontFamily={SUURI_FONT}
              opacity={appearAt(frame, fps, 20)}
            >
              {eq.lhs}
            </text>
            <text
              x={960}
              y={690}
              textAnchor="middle"
              fontSize={104}
              fontWeight={800}
              fill={SP.accent}
              fontFamily={SUURI_FONT}
              opacity={appearAt(frame, fps, 48)}
            >
              {eq.rhs}
            </text>
          </>
        ) : (
          ["×", "÷", "√", "=", "%"].map((s, i) => (
            <text
              key={i}
              x={560 + i * 200}
              y={590}
              textAnchor="middle"
              fontSize={120}
              fontWeight={800}
              fill={i === 0 ? SP.accent : SP.line}
              fontFamily={SUURI_FONT}
              opacity={appearAt(frame, fps, 20 + i * 10)}
            >
              {s}
            </text>
          ))
        )}
        <SmallLabel x={960} y={880} text="道具は掛け算と、少しの想像力だけ" size={34} />
      </svg>
    </Frame>
  );
};

// 「正」の字で人数を数える
const TallyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect
          x={510}
          y={280}
          width={900}
          height={440}
          rx={18}
          fill={SP.panel}
          stroke={SP.line}
          strokeWidth={5}
          opacity={appearAt(frame, fps, 6)}
        />
        {["正", "正", "正"].map((s, i) => (
          <text
            key={i}
            x={680 + i * 280}
            y={560}
            textAnchor="middle"
            fontSize={180}
            fontWeight={700}
            fill={i === 2 ? SP.accent : SP.line}
            fontFamily={SUURI_SERIF}
            opacity={appearAt(frame, fps, 16 + i * 12)}
          >
            {s}
          </text>
        ))}
        <SmallLabel x={960} y={830} text="実際の人数を数えてみる" size={34} />
      </svg>
    </Frame>
  );
};

// ごく普通の家と家族 (代々、普通の家系)
const OrdinaryHouseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = appearAt(frame, fps, 8);
  const fp = appearAt(frame, fps, 26);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={hp} stroke={SP.line} strokeWidth={6} fill="none">
          <path d="M 560 560 L 800 380 L 1040 560" strokeLinejoin="round" />
          <rect x={620} y={560} width={360} height={320} />
          <rect x={760} y={700} width={90} height={180} />
        </g>
        <g opacity={fp}>
          <Person x={1180} y={700} scale={1.6} />
          <Person x={1320} y={720} scale={1.4} />
          <Person x={1430} y={760} scale={1.0} />
        </g>
        <SmallLabel x={960} y={210} text="代々、ごく普通の家系" color={SP.ink} size={38} weight={700} />
      </svg>
    </Frame>
  );
};

// あなたと父・母の小さな系図 (親は2人)。
// 「親から子へ半分ずつ」の文では線に 1/2 のラベルがつく
const ParentsScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const you = appearAt(frame, fps, 8);
  const pa = appearAt(frame, fps, 24);
  const num = appearAt(frame, fps, 44);
  const half = /半分/.test(scene.text);
  return (
    <Frame>
      <DiagramTitle text={half ? "親から子へ、半分ずつ" : scene.title ?? "あなたの親は2人"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g stroke={SP.dim} strokeWidth={4} opacity={pa}>
          <line x1={720} y1={490} x2={940} y2={630} />
          <line x1={1200} y1={490} x2={980} y2={630} />
        </g>
        {half && (
          <g opacity={num}>
            <SmallLabel x={790} y={645} text="1/2" color={SP.accent} size={40} weight={800} />
            <SmallLabel x={1130} y={645} text="1/2" color={SP.accent} size={40} weight={800} />
          </g>
        )}
        <g opacity={you}>
          <Person x={960} y={690} scale={2.2} color={SP.accentSoft} />
          <SmallLabel x={960} y={890} text="あなた" color={SP.accent} size={36} weight={800} />
        </g>
        <g opacity={pa}>
          <Person x={720} y={360} scale={1.8} />
          <SmallLabel x={720} y={560} text="父" color={SP.ink} size={34} weight={700} />
          <Person x={1200} y={360} scale={1.8} />
          <SmallLabel x={1200} y={560} text="母" color={SP.ink} size={34} weight={700} />
        </g>
        <g opacity={num}>
          <text x={1510} y={450} textAnchor="middle" fontSize={110} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            2人
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 倍々に高くなる棒グラフ (4人→8人→16人→32人)
const NumberLadderScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [
    { label: "祖父母", n: "4人", h: 90 },
    { label: "曽祖父母", n: "8人", h: 180 },
    { label: "その上", n: "16人", h: 300 },
    { label: "さらに上", n: "32人", h: 460 },
  ];
  const baseY = 780;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "倍々に増える先祖"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <line x1={420} y1={baseY} x2={1520} y2={baseY} stroke={SP.faint} strokeWidth={3} />
        {bars.map((b, i) => {
          const p = appearAt(frame, fps, 12 + i * 12);
          const x = 500 + i * 270;
          const red = i === bars.length - 1;
          return (
            <g key={i} opacity={p}>
              <rect
                x={x}
                y={baseY - b.h * p}
                width={150}
                height={b.h * p}
                fill={red ? SP.accent : SP.panel}
                stroke={red ? SP.accent : SP.line}
                strokeWidth={4}
              />
              <SmallLabel
                x={x + 75}
                y={baseY - b.h - 24}
                text={b.n}
                color={red ? SP.accent : SP.ink}
                size={red ? 44 : 36}
                weight={800}
              />
              <SmallLabel x={x + 75} y={baseY + 48} text={b.label} size={30} />
              {i < bars.length - 1 && (
                <SmallLabel x={x + 212} y={baseY - 180} text="×2" color={SP.accentSoft} size={38} weight={800} />
              )}
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// 現代→江戸→戦国→平安と時間をさかのぼる矢印
const TimelineScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineP = appearAt(frame, fps, 8);
  // 文に出てきた時代を赤く灯す (江戸の話なら江戸が赤くなる)
  const redName = /平安|千年/.test(scene.text)
    ? "平安"
    : /江戸/.test(scene.text)
      ? "江戸"
      : /戦国/.test(scene.text)
        ? "戦国"
        : "平安";
  const eras = [
    { x: 1420, name: "現代", sub: "いま" },
    { x: 1100, name: "江戸", sub: "約300年前" },
    { x: 780, name: "戦国", sub: "約450年前" },
    { x: 460, name: "平安", sub: "約1000年前" },
  ].map((e) => ({ ...e, red: e.name === redName }));
  const y = 560;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "時間をさかのぼる"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <line x1={1500} y1={y} x2={1500 - 1120 * lineP} y2={y} stroke={SP.line} strokeWidth={5} />
        <path d={`M 380 ${y} l 34 -20 v 40 Z`} fill={SP.line} opacity={lineP} />
        {eras.map((e, i) => {
          const p = appearAt(frame, fps, 16 + i * 12);
          return (
            <g key={i} opacity={p}>
              <circle cx={e.x} cy={y} r={e.red ? 20 : 14} fill={e.red ? SP.accent : SP.line} />
              <SmallLabel
                x={e.x}
                y={y - 46}
                text={e.name}
                color={e.red ? SP.accent : SP.ink}
                size={e.red ? 52 : 42}
                weight={800}
              />
              <SmallLabel x={e.x} y={y + 80} text={e.sub} size={28} />
            </g>
          );
        })}
        <SmallLabel x={960} y={820} text="さかのぼるほど先祖の席は増えていく" size={32} />
      </svg>
    </Frame>
  );
};

// 日本列島と当時の人口 (文中の「〜万人」をそのまま赤で見せる)
const JapanPopScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = appearAt(frame, fps, 8);
  const num = appearAt(frame, fps, 40);
  const popText = scene.text.match(/約?[0-9０-９,，]+万人/)?.[0] ?? "約700万人";
  const dots: [number, number][] = [
    [620, 790], [700, 750], [820, 690], [900, 650], [980, 610],
    [1060, 560], [1140, 500], [1220, 440], [1300, 380], [880, 720],
    [1000, 670], [1100, 590], [760, 800], [1180, 530],
  ];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "当時の日本の人口"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={p * 0.9} stroke={SP.dim} strokeWidth={4} fill="none">
          <path d="M 540 860 Q 500 800 580 760 Q 660 730 720 760 Q 760 800 700 850 Q 620 890 540 860 Z" />
          <path d="M 760 780 Q 740 700 840 640 Q 980 560 1120 480 Q 1240 410 1300 360 Q 1360 320 1380 360 Q 1360 440 1240 520 Q 1080 630 920 720 Q 820 770 760 780 Z" />
          <path d="M 1380 240 Q 1360 180 1440 160 Q 1520 170 1500 250 Q 1450 300 1400 280 Z" />
          <path d="M 880 760 Q 920 740 980 760 Q 960 800 900 800 Z" />
        </g>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={9} fill={SP.line} opacity={appearAt(frame, fps, 14 + i * 3)} />
        ))}
        <g opacity={num}>
          <text x={1340} y={760} textAnchor="middle" fontSize={92} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            {popText}
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 先祖に深くおじぎする人 (感謝)
const ThanksScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anc = appearAt(frame, fps, 8);
  const bow = appearAt(frame, fps, 20);
  const tag = appearAt(frame, fps, 48);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={anc * 0.7}>
          <Person x={420} y={260} scale={1.1} color={SP.faint} />
          <Person x={560} y={200} scale={0.9} color={SP.faint} />
          <Person x={690} y={160} scale={0.75} color={SP.faint} />
          <Person x={800} y={130} scale={0.6} color={SP.faint} />
        </g>
        <g transform={`rotate(${-35 * bow}, 1060, 850)`}>
          <Person x={1060} y={520} scale={5} />
        </g>
        <g opacity={tag}>
          <text x={1340} y={520} textAnchor="middle" fontSize={96} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            感謝
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// ===== 文に寄り添う専用絵 (2回目の総点検で追加した10種) =====

// 平安の身分ピラミッド。頂点の烏帽子の人だけ赤 = 最高権力者
const HierarchyTopScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    { n: 9, y: 840, sc: 0.85, sp: 150 },
    { n: 5, y: 680, sc: 0.95, sp: 180 },
    { n: 3, y: 520, sc: 1.0, sp: 210 },
  ];
  const top = appearAt(frame, fps, 58);
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "平安の最高権力者"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {rows.map((row, i) => (
          <g key={i} opacity={appearAt(frame, fps, 12 + i * 14)}>
            {Array.from({ length: row.n }).map((_, j) => (
              <Person key={j} x={960 + (j - (row.n - 1) / 2) * row.sp} y={row.y} scale={row.sc} color={SP.faint} />
            ))}
          </g>
        ))}
        <g opacity={top}>
          <Person x={960} y={350} scale={1.5} color={SP.accent} />
          <path d="M 940 328 Q 948 252 978 262 L 984 330 Z" fill={SP.accent} />
          <SmallLabel x={1110} y={360} text="道長" color={SP.accent} size={42} weight={800} anchor="start" />
        </g>
      </svg>
    </Frame>
  );
};

// あなたの家と隣の家。さかのぼる線はどこかで必ず合流する
const NeighborMergeScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const houses = appearAt(frame, fps, 10);
  const lines = appearAt(frame, fps, 30);
  const merge = appearAt(frame, fps, 62);
  const housePath = (x: number, y: number) =>
    `M ${x - 80} ${y} L ${x - 80} ${y - 80} L ${x} ${y - 140} L ${x + 80} ${y - 80} L ${x + 80} ${y} Z`;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "隣の家ともどこかで合流"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={houses} stroke={SP.line} strokeWidth={5} fill="none" strokeLinejoin="round">
          <path d={housePath(600, 800)} />
          <path d={housePath(1320, 800)} />
        </g>
        <g opacity={houses}>
          <SmallLabel x={600} y={856} text="あなたの家" color={SP.ink} size={34} weight={700} />
          <SmallLabel x={1320} y={856} text="隣の佐藤さんの家" color={SP.ink} size={34} weight={700} />
        </g>
        <g opacity={lines} stroke={SP.dim} strokeWidth={4} fill="none">
          <path d="M 600 660 Q 560 580 700 520 Q 840 460 940 415" />
          <path d="M 640 660 Q 700 570 820 505 Q 920 455 945 425" />
          <path d="M 1320 660 Q 1360 580 1220 520 Q 1080 460 980 415" />
          <path d="M 1280 660 Q 1220 570 1100 505 Q 1000 455 975 425" />
        </g>
        <g opacity={merge}>
          <circle cx={960} cy={400} r={20} fill={SP.accent} />
          <circle cx={960} cy={400} r={46} fill="none" stroke={SP.accent} strokeWidth={4} strokeDasharray="10 8" />
          <SmallLabel x={960} y={310} text="どこかで必ず合流する" color={SP.accent} size={42} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 子が3人、孫が9人 — 文の数字をそのまま絵にする
const ChildGrandchildScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p0 = appearAt(frame, fps, 8);
  const childXs = [660, 960, 1260];
  const grandXs = Array.from({ length: 9 }, (_, i) => 480 + i * 120);
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "子3人なら孫9人"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={p0}>
          <Person x={960} y={330} scale={1.2} />
        </g>
        {childXs.map((x, i) => (
          <g key={i} opacity={appearAt(frame, fps, 24 + i * 8)}>
            <line x1={960} y1={400} x2={x} y2={530} stroke={SP.dim} strokeWidth={4} />
            <Person x={x} y={580} scale={1} />
          </g>
        ))}
        {grandXs.map((x, i) => (
          <g key={i} opacity={appearAt(frame, fps, 54 + i * 5)}>
            <line x1={childXs[Math.floor(i / 3)]} y1={650} x2={x} y2={770} stroke={SP.dim} strokeWidth={3} />
            <Person x={x} y={810} scale={0.8} />
          </g>
        ))}
        <g opacity={appearAt(frame, fps, 48)}>
          <SmallLabel x={1500} y={595} text="3人" color={SP.accent} size={54} weight={800} anchor="start" />
        </g>
        <g opacity={appearAt(frame, fps, 96)}>
          <SmallLabel x={1640} y={825} text="9人" color={SP.accent} size={54} weight={800} anchor="start" />
        </g>
      </svg>
    </Frame>
  );
};

// 必要な先祖の数が日本列島を丸ごと飲み込む
const SwallowJapanScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = appearAt(frame, fps, 8);
  const grow = appearAt(frame, fps, 36);
  const tag = appearAt(frame, fps, 72);
  const r = 120 + grow * 380;
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "日本を丸ごと飲み込む"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={land * 0.9} stroke={SP.line} strokeWidth={4} fill="none">
          <path d="M 540 860 Q 500 800 580 760 Q 660 730 720 760 Q 760 800 700 850 Q 620 890 540 860 Z" />
          <path d="M 760 780 Q 740 700 840 640 Q 980 560 1120 480 Q 1240 410 1300 360 Q 1360 320 1380 360 Q 1360 440 1240 520 Q 1080 630 920 720 Q 820 770 760 780 Z" />
          <path d="M 1380 240 Q 1360 180 1440 160 Q 1520 170 1500 250 Q 1450 300 1400 280 Z" />
          <path d="M 880 760 Q 920 740 980 760 Q 960 800 900 800 Z" />
        </g>
        <circle cx={1000} cy={540} r={r} fill="none" stroke={SP.accent} strokeWidth={6} strokeDasharray="16 12" opacity={grow} />
        <g opacity={tag}>
          <SmallLabel x={1000} y={250} text="必要な先祖の数" color={SP.accent} size={46} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// 道長には12人の子がいた — 12人を実際に描く
const TwelveChildrenScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p0 = appearAt(frame, fps, 8);
  const tag = appearAt(frame, fps, 92);
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "道長の子は12人"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={p0}>
          <Person x={960} y={300} scale={1.4} />
          <path d="M 942 278 Q 950 210 978 220 L 984 282 Z" fill={SP.line} />
          <SmallLabel x={1090} y={310} text="藤原道長" color={SP.ink} size={36} weight={700} anchor="start" />
          <line x1={960} y1={400} x2={960} y2={460} stroke={SP.dim} strokeWidth={4} />
          <line x1={585} y1={460} x2={1335} y2={460} stroke={SP.dim} strokeWidth={4} />
        </g>
        {Array.from({ length: 12 }).map((_, i) => {
          const x = 585 + (i % 6) * 150;
          const y = i < 6 ? 580 : 740;
          return (
            <g key={i} opacity={appearAt(frame, fps, 24 + i * 6)}>
              {i < 6 && <line x1={x} y1={460} x2={x} y2={530} stroke={SP.dim} strokeWidth={3} />}
              <Person x={x} y={y} scale={0.95} />
            </g>
          );
        })}
        <g opacity={tag}>
          <SmallLabel x={1560} y={680} text="12人" color={SP.accent} size={64} weight={800} anchor="start" />
        </g>
      </svg>
    </Frame>
  );
};

// 孫から天皇が2人 (後一条・後朱雀)
const EmperorGrandsonsScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = appearAt(frame, fps, 8);
  const mid = appearAt(frame, fps, 28);
  const crownPath = (x: number, y: number, s: number) =>
    `M ${x - 34 * s} ${y} L ${x - 34 * s} ${y - 26 * s} L ${x - 17 * s} ${y - 10 * s} L ${x} ${y - 34 * s} L ${x + 17 * s} ${y - 10 * s} L ${x + 34 * s} ${y - 26 * s} L ${x + 34 * s} ${y} Z`;
  const sons = [
    { x: 700, name: "後一条天皇" },
    { x: 1220, name: "後朱雀天皇" },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "孫が天皇になった"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={base}>
          <Person x={960} y={830} scale={1.3} />
          <SmallLabel x={790} y={845} text="藤原道長" color={SP.ink} size={34} weight={700} anchor="end" />
        </g>
        <g opacity={mid}>
          <line x1={960} y1={810} x2={960} y2={670} stroke={SP.dim} strokeWidth={4} />
          <Person x={960} y={620} scale={1.05} />
          <SmallLabel x={1070} y={635} text="娘 (きさき)" color={SP.faint} size={30} anchor="start" />
        </g>
        {sons.map((s, i) => {
          const p = appearAt(frame, fps, 54 + i * 16);
          return (
            <g key={i} opacity={p}>
              <line x1={960} y1={600} x2={s.x} y2={450} stroke={SP.dim} strokeWidth={4} />
              <Person x={s.x} y={395} scale={1.15} />
              <path d={crownPath(s.x, 345, 1.15)} fill="none" stroke={SP.accent} strokeWidth={5} strokeLinejoin="round" />
              <SmallLabel x={s.x} y={520} text={s.name} color={SP.accent} size={38} weight={800} />
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// 血筋は貴族のほとんどへ、さらに武家へも広がった
const SpreadSamuraiScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p0 = appearAt(frame, fps, 8);
  const grid = (cx: number, delay: number, color: string) =>
    Array.from({ length: 6 }).map((_, i) => (
      <g key={i} opacity={appearAt(frame, fps, delay + i * 5)}>
        <Person x={cx - 90 + (i % 3) * 90} y={i < 3 ? 520 : 660} scale={0.9} color={color} />
      </g>
    ));
  const arrow = (x1: number, x2: number, delay: number) => (
    <g opacity={appearAt(frame, fps, delay)}>
      <line x1={x1} y1={580} x2={x2 - 26} y2={580} stroke={SP.accent} strokeWidth={6} />
      <path d={`M ${x2 - 30} 562 L ${x2} 580 L ${x2 - 30} 598 Z`} fill={SP.accent} />
    </g>
  );
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "貴族から武家へ"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={p0}>
          <Person x={420} y={570} scale={1.4} />
          <path d="M 402 548 Q 410 480 438 490 L 444 552 Z" fill={SP.line} />
          <SmallLabel x={420} y={790} text="道長" color={SP.ink} size={36} weight={700} />
        </g>
        {arrow(530, 740, 24)}
        {grid(960, 32, SP.line)}
        <SmallLabel x={960} y={790} text="貴族のほとんど" color={SP.ink} size={36} weight={700} />
        {arrow(1120, 1330, 62)}
        {grid(1500, 70, SP.faint)}
        <SmallLabel x={1500} y={790} text="武家 (源氏・平家)" color={SP.ink} size={36} weight={700} />
      </svg>
    </Frame>
  );
};

// 手のひらを突き出して「待った!」をかける人
const WaitStopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const body = appearAt(frame, fps, 8);
  const hand = appearAt(frame, fps, 26);
  const tag = appearAt(frame, fps, 52);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={body} stroke={SP.line} strokeWidth={10} fill="none">
          <circle cx={700} cy={480} r={130} />
          <path d="M 480 980 q 10 -220 220 -230 q 210 10 220 230" />
        </g>
        <g opacity={hand}>
          <line x1={880} y1={740} x2={1130} y2={470} stroke={SP.line} strokeWidth={22} strokeLinecap="round" />
          <circle cx={1180} cy={420} r={52} fill="none" stroke={SP.ink} strokeWidth={9} />
          {[-28, -10, 8, 26].map((dx, i) => (
            <line key={i} x1={1180 + dx} y1={388} x2={1180 + dx} y2={352} stroke={SP.ink} strokeWidth={8} strokeLinecap="round" />
          ))}
          <circle cx={1180} cy={420} r={110} fill="none" stroke={SP.accent} strokeWidth={6} strokeDasharray="14 12" />
        </g>
        <g opacity={tag}>
          <text x={1480} y={340} textAnchor="middle" fontSize={100} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            待った!
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 「家系図、お作りします」の看板と巻物と小判 = 商売
const KakeizuBusinessScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sign = appearAt(frame, fps, 10);
  const goods = appearAt(frame, fps, 36);
  const coin = appearAt(frame, fps, 62);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g opacity={sign}>
          <rect x={510} y={260} width={900} height={190} rx={18} fill="none" stroke={SP.line} strokeWidth={6} />
          <line x1={760} y1={260} x2={760} y2={190} stroke={SP.dim} strokeWidth={5} />
          <line x1={1160} y1={260} x2={1160} y2={190} stroke={SP.dim} strokeWidth={5} />
          <text x={960} y={378} textAnchor="middle" fontSize={62} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT}>
            家系図、お作りします
          </text>
        </g>
        <g opacity={goods} stroke={SP.line} strokeWidth={6} fill="none">
          <rect x={620} y={600} width={420} height={200} rx={10} />
          <circle cx={620} cy={700} r={34} />
          <circle cx={1040} cy={700} r={34} />
          <line x1={700} y1={660} x2={960} y2={660} stroke={SP.dim} strokeWidth={4} />
          <line x1={700} y1={700} x2={960} y2={700} stroke={SP.dim} strokeWidth={4} />
          <line x1={700} y1={740} x2={960} y2={740} stroke={SP.dim} strokeWidth={4} />
        </g>
        <g opacity={coin}>
          <circle cx={1330} cy={700} r={90} fill="none" stroke={SP.accent} strokeWidth={7} />
          <text x={1330} y={732} textAnchor="middle" fontSize={84} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            ¥
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 奇跡のリレーのいちばん先に、いまのあなたが立っている
const YouHereScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = 12;
  const you = appearAt(frame, fps, 70);
  return (
    <Frame>
      <DiagramTitle text={scene.title ?? "そのいちばん先に"} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Array.from({ length: n }).map((_, i) => {
          const t = i / (n - 1);
          const x = 300 + t * 1000;
          const y = 830 - Math.sin(t * Math.PI * 0.5) * 220;
          const p = appearAt(frame, fps, 10 + i * 5);
          return (
            <g key={i} opacity={p}>
              {i > 0 && (
                <line
                  x1={300 + ((i - 1) / (n - 1)) * 1000}
                  y1={830 - Math.sin(((i - 1) / (n - 1)) * Math.PI * 0.5) * 220}
                  x2={x}
                  y2={y}
                  stroke={SP.dim}
                  strokeWidth={4}
                />
              )}
              <circle cx={x} cy={y} r={11} fill={SP.line} />
            </g>
          );
        })}
        <g opacity={you}>
          <line x1={1300} y1={610} x2={1430} y2={580} stroke={SP.accent} strokeWidth={5} strokeDasharray="10 8" />
          <Person x={1500} y={520} scale={3} color={SP.accent} />
          <SmallLabel x={1500} y={370} text="あなた" color={SP.accent} size={52} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// motif名のゆらぎを吸収して代表名に寄せる
const resolveSuuriMotif = (m: string): string | undefined => {
  // 文に寄り添う10種は最優先 (emperor_grandsons→crown などの誤吸収を防ぐため順番が大事)
  if (/hierarchy|pyramid|apex|power_top/.test(m)) return "hierarchy_top";
  if (/neighbor|sato/.test(m)) return "neighbor_merge";
  if (/child_grand|grandchild/.test(m)) return "child_grandchild";
  if (/swallow|engulf/.test(m)) return "swallow_japan";
  if (/twelve|12_?child/.test(m)) return "twelve_children";
  if (/emperor_grand|grandson/.test(m)) return "emperor_grandsons";
  if (/samurai|warrior|buke/.test(m)) return "spread_samurai";
  if (/wait|stop|hold/.test(m)) return "wait_stop";
  if (/business|shop|service/.test(m)) return "kakeizu_business";
  if (/you_here|you_now|stand/.test(m)) return "you_here";
  // 新しい9種も既存の判定より先に見る (multi→seat_share などの誤吸収を防ぐため順番が大事)
  if (/multiply|imagin/.test(m)) return "multiply_imagine";
  if (/math|calc|equation|formula|blackboard/.test(m)) return "math_talk";
  if (/thanks|gratitude|pray|bow/.test(m)) return "thanks";
  if (/tally|counting/.test(m)) return "tally";
  if (/ordinary|house|home/.test(m)) return "ordinary_house";
  if (/parents|father|mother/.test(m)) return "parents";
  if (/ladder/.test(m)) return "number_ladder";
  if (/timeline|history|edo|heian|era\b/.test(m)) return "timeline";
  if (/population|japan_pop/.test(m)) return "japan_pop";
  if (/japan|nippon/.test(m)) return "japan_net";
  if (/doubling|pedigree|ancestor_tree|binary/.test(m)) return "doubling_tree";
  if (/exp|curve|billion|trillion|explos/.test(m)) return "exp_curve";
  if (/school|student/.test(m)) return "school";
  if (/city|sendai|skyline/.test(m)) return "city_pop";
  if (/globe|earth|world/.test(m)) return "globe_pop";
  if (/seat|share|overlap|multi/.test(m)) return "seat_share";
  if (/merge|net|web|mesh|converg|collaps/.test(m)) return "net_merge";
  if (/hatoko|cousin|marri/.test(m)) return "hatoko";
  if (/michinaga|fujiwara|noble|aristocrat/.test(m)) return "michinaga";
  if (/three|point/.test(m)) return "three_points";
  if (/descend|offspring|children/.test(m)) return "descend_tree";
  if (/extinct|broken|dead|absent/.test(m)) return "extinct_line";
  if (/crown|empress|emperor|consort/.test(m)) return "crown";
  if (/path|route/.test(m)) return "path_count";
  if (/dna|gene|half|dilut/.test(m)) return "dna_half";
  if (/chain|relay|light|unbroken/.test(m)) return "chain_lights";
  if (/lottery|jackpot|winning/.test(m)) return "lottery";
  if (/scroll|geneal|document|record/.test(m)) return "scroll";
  if (/nengajo|postcard|new_?year|greeting/.test(m)) return "nengajo";
  if (/farmer|fisher|unknown|anonym|commoner|peasant/.test(m)) return "unknown_farmer";
  if (/village|rural|hamlet/.test(m)) return "village";
  if (/roadmap|agenda|outline|toc|chapters/.test(m)) return "roadmap";
  if (/surpris|exclam|shock|aha|notice/.test(m)) return "surprised";
  if (/nod|agree|convinc/.test(m)) return "nodding";
  if (/question/.test(m)) return "question";
  if (/think/.test(m)) return "thinking";
  return undefined;
};

// ===== 入口: シーンの型と題材で描き分ける =====

// 各シーンが「同じ絵の何回目の登場か」を数える。
// 2回目以降は variant として渡し、同じ姿の再登場を防ぐ (絵が育つ仕組み)
export const computeSuuriVariants = (scenes: Scene[]): number[] => {
  const seen = new Map<string, number>();
  return scenes.map((s) => {
    const m = resolveSuuriMotif(s.motif ?? "") ?? s.motif ?? "";
    const key = `${s.type === "card" || s.type === "chart" ? s.type + ":" : ""}${m}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    return n;
  });
};

export const SuuriSceneView: React.FC<{ scene: Scene; variant?: number }> = ({ scene, variant = 0 }) => {
  if (scene.image && scene.type !== "card") {
    return <ImageScene scene={scene} />;
  }
  if (scene.isEnding) return <SuuriCardScene scene={scene} />;

  const m = resolveSuuriMotif(scene.motif ?? "") ?? scene.motif;
  // 題材 (motif) を型より優先して拾う。AIが type を揺らしても専用の絵が出るように
  if (scene.type !== "card" && scene.type !== "chart") {
    if (m === "hierarchy_top") return <HierarchyTopScene scene={scene} />;
    if (m === "neighbor_merge") return <NeighborMergeScene scene={scene} />;
    if (m === "child_grandchild") return <ChildGrandchildScene scene={scene} />;
    if (m === "swallow_japan") return <SwallowJapanScene scene={scene} />;
    if (m === "twelve_children") return <TwelveChildrenScene scene={scene} />;
    if (m === "emperor_grandsons") return <EmperorGrandsonsScene scene={scene} />;
    if (m === "spread_samurai") return <SpreadSamuraiScene scene={scene} />;
    if (m === "wait_stop") return <WaitStopScene />;
    if (m === "kakeizu_business") return <KakeizuBusinessScene />;
    if (m === "you_here") return <YouHereScene scene={scene} />;
    if (m === "doubling_tree") return <DoublingTreeScene scene={scene} variant={variant} />;
    if (m === "exp_curve") return <ExpCurveScene scene={scene} variant={variant} />;
    if (m === "school") return <SchoolScene scene={scene} />;
    if (m === "city_pop") return <CityPopScene scene={scene} />;
    if (m === "globe_pop") return <GlobePopScene scene={scene} />;
    if (m === "seat_share") return <SeatShareScene scene={scene} />;
    if (m === "net_merge") return <NetMergeScene scene={scene} />;
    if (m === "hatoko") return <HatokoScene scene={scene} />;
    if (m === "japan_net") return <JapanNetScene scene={scene} variant={variant} />;
    if (m === "michinaga") return <MichinagaScene scene={scene} variant={variant} />;
    if (m === "three_points") return <ThreePointsScene scene={scene} />;
    if (m === "descend_tree") return <DescendTreeScene scene={scene} variant={variant} />;
    if (m === "extinct_line") return <ExtinctLineScene scene={scene} />;
    if (m === "crown") return <CrownScene scene={scene} />;
    if (m === "path_count") return <PathCountScene scene={scene} />;
    if (m === "dna_half") return <DnaHalfScene scene={scene} variant={variant} />;
    if (m === "chain_lights") return <ChainLightsScene scene={scene} variant={variant} />;
    if (m === "roadmap") return <RoadmapScene scene={scene} />;
    if (m === "multiply_imagine") return <MultiplyImagineScene />;
    if (m === "math_talk") return <MathTalkScene scene={scene} variant={variant} />;
    if (m === "tally") return <TallyScene />;
    if (m === "ordinary_house") return <OrdinaryHouseScene />;
    if (m === "parents") return <ParentsScene scene={scene} />;
    if (m === "number_ladder") return <NumberLadderScene scene={scene} />;
    if (m === "timeline") return <TimelineScene scene={scene} />;
    if (m === "japan_pop") return <JapanPopScene scene={scene} />;
    if (m === "thanks") return <ThanksScene />;
    if (m === "lottery") return <LotteryScene />;
    if (m === "scroll") return <ScrollScene variant={variant} />;
    if (m === "nengajo") return <NengajoScene />;
    if (m === "unknown_farmer") return <UnknownFarmerScene />;
    if (m === "village") return <VillageScene />;
    if (m === "question") return <QuestionScene variant={variant} />;
    if (m === "surprised") return <SurprisedScene variant={variant} />;
    if (m === "nodding") return <NoddingScene variant={variant} />;
  }
  switch (scene.type) {
    case "card":
      if (m === "chapter") return <ChapterCardScene scene={scene} />;
      if (m === "quiz") return <QuizCardScene scene={scene} />;
      return <SuuriCardScene scene={scene} />;
    case "chart":
      return <SuuriChartScene scene={scene} />;
    case "diagram":
      return <ConceptScene scene={scene} />;
    case "location":
      return <VillageScene />;
    case "object":
      return <QuestionScene variant={variant} />;
    default:
      return <ThinkingScene variant={variant} />;
  }
};
