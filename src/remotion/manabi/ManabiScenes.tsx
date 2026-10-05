// manabi (身近な科学の図解解説) プリセットの画面一式。
// お手本チャンネルのテイスト分析 (storyboard 212コマ実見) から:
// ほぼ黒の濃紺背景・白い細線の線画・水=くすんだ青・強調=オレンジの2色だけ・
// 図解 (断面図/グラフ/数直線/グリッド比較) が主役・章カードはキーワードだけオレンジ。
// 1ファイルに全部まとめる。

import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { Scene } from "../../types";
import { MANABI_CHANNEL } from "../../channel";
import { ImageScene } from "../scenes/ImageScene";

// 理科室の配色
export const MP = {
  background: "#10151F", // ほぼ黒の濃紺
  panel: "#1A2230", // 少し明るい面
  deep: "#0B0F17",
  ink: "#EAEFF5", // 白い文字
  line: "#C9D4E0", // 線画の白
  faint: "#5E6C84", // 補足の薄い文字・目盛り
  accent: "#E8803C", // 強調のオレンジ
  accentSoft: "#F0A050",
  blue: "#6C93B8", // くすんだ青 (冷たい・水)
  blueDeep: "#31486A",
  blueLight: "#9FC7E8", // 冷気の線
  wood: "#46382A", // 木の面
  woodGrain: "#6B5844", // 木目
  woodWarm: "#A98963",
} as const;

export const MANABI_FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";
export const MANABI_SERIF =
  "'Noto Serif JP', 'Noto Serif CJK JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif";

const W = 1920;
const H = 1080;

// ===== 共通の部品 =====

// 画面の上に小さくチャンネル名 (お手本の「章表示」の位置)
const Header: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 34,
      left: 60,
      fontFamily: MANABI_FONT,
      fontSize: 26,
      letterSpacing: 4,
      color: MP.faint,
    }}
  >
    <span style={{ color: MP.accent }}>—</span> {MANABI_CHANNEL.name}
  </div>
);

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: MP.background }}>
    {children}
    <Header />
  </AbsoluteFill>
);

// 図解の見出し (上部中央・細い線つき)
const DiagramTitle: React.FC<{ text?: string }> = ({ text }) => {
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        width: "100%",
        textAlign: "center",
        fontFamily: MANABI_FONT,
        fontSize: 44,
        fontWeight: 600,
        color: MP.ink,
        letterSpacing: 2,
      }}
    >
      {text}
      <div
        style={{
          width: 64,
          height: 4,
          background: MP.accent,
          margin: "18px auto 0",
          borderRadius: 2,
        }}
      />
    </div>
  );
};

// 線画の手 (左向きに人差し指をのばして触れる形)。fingertip が (0,0) に来る
const Hand: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
}> = ({ x, y, scale = 1, rotate = 0 }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}>
    <path
      d="M 0 0
         Q -10 -8 2 -14
         L 78 -22
         C 110 -30 150 -34 190 -30
         L 420 -16
         L 420 76
         L 200 86
         C 160 90 120 86 92 76
         L 30 68
         Q 18 64 26 56
         L 72 50
         C 84 44 84 32 72 28
         L 36 30
         Q 24 26 32 18
         L 76 12
         Q 64 4 48 4
         Z"
      fill={MP.background}
      stroke={MP.line}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    {/* 親指のライン */}
    <path
      d="M 100 -24 C 130 -44 170 -46 196 -34"
      fill="none"
      stroke={MP.line}
      strokeWidth={6}
      strokeLinecap="round"
    />
  </g>
);

// 冷気のギザギザ線 (触れた瞬間に出る)
const ColdMarks: React.FC<{ x: number; y: number; start: number }> = ({
  x,
  y,
  start,
}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const o = interpolate(t, [0, 6, 40], [0, 1, 0.85], {
    extrapolateRight: "clamp",
  });
  const grow = interpolate(t, [0, 10], [0.6, 1], { extrapolateRight: "clamp" });
  const zig = "m 0 0 l 14 -22 l 10 18 l 16 -26";
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${grow})`}
      opacity={o}
      stroke={MP.blueLight}
      strokeWidth={7}
      fill="none"
      strokeLinecap="round"
    >
      <g transform="translate(-30, -70) rotate(-30)">
        <path d={zig} />
      </g>
      <g transform="translate(30, -86) rotate(5)">
        <path d={zig} />
      </g>
      <g transform="translate(80, -50) rotate(35)">
        <path d={zig} />
      </g>
    </g>
  );
};

// 温もりのふわっとした弧 (ゆっくり広がって消える、繰り返し)
const WarmAura: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const t = (frame / 30 + i / 3) % 1;
        const r = 60 + t * 110;
        const o = (1 - t) * 0.5;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="none"
            stroke={MP.accentSoft}
            strokeWidth={5}
            opacity={o}
          />
        );
      })}
    </g>
  );
};

// 物の下の小さなラベル
const SmallLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  color?: string;
  size?: number;
}> = ({ x, y, text, color = MP.faint, size = 32 }) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    fill={color}
    fontSize={size}
    fontFamily={MANABI_FONT}
    letterSpacing={2}
  >
    {text}
  </text>
);

// ===== 場面 =====

// 金属のドアノブ / 木の棚 に手が触れる
const TouchScene: React.FC<{ scene: Scene; material: "metal" | "wood" }> = ({
  material,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 手がすっと入ってきて触れる
  const reach = spring({ frame, fps, config: { damping: 16, mass: 0.9 } });
  const handX = interpolate(reach, [0, 1], [320, 0]);
  const touchAt = 24;
  const touched = frame >= touchAt;

  const knobX = 700;
  const knobY = 560;
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {material === "metal" ? (
          <>
            {/* ドア */}
            <rect
              x={180}
              y={120}
              width={620}
              height={860}
              fill={MP.panel}
              stroke={MP.line}
              strokeWidth={6}
            />
            <rect
              x={250}
              y={200}
              width={420}
              height={300}
              fill="none"
              stroke={MP.faint}
              strokeWidth={4}
            />
            <rect
              x={250}
              y={560}
              width={420}
              height={340}
              fill="none"
              stroke={MP.faint}
              strokeWidth={4}
            />
            {/* ドアノブ (金属) */}
            <circle cx={knobX} cy={knobY} r={64} fill="none" stroke={MP.faint} strokeWidth={4} />
            <circle
              cx={knobX}
              cy={knobY}
              r={44}
              fill={MP.blueDeep}
              stroke={MP.line}
              strokeWidth={6}
            />
            <path
              d={`M ${knobX - 22} ${knobY - 26} A 34 34 0 0 1 ${knobX + 10} ${knobY - 36}`}
              fill="none"
              stroke={MP.blueLight}
              strokeWidth={5}
              strokeLinecap="round"
            />
            <SmallLabel x={490} y={88} text="金属のドアノブ" color={MP.blueLight} />
            {/* 手 */}
            <Hand x={knobX + 56 + handX} y={knobY - 6} />
            {touched && <ColdMarks x={knobX} y={knobY - 50} start={touchAt} />}
            {/* ヒヤッの「!」 */}
            {touched && (
              <g
                opacity={interpolate(frame - touchAt, [0, 6], [0, 1], {
                  extrapolateRight: "clamp",
                })}
              >
                <circle cx={knobX + 190} cy={knobY - 190} r={44} fill={MP.accent} />
                <text
                  x={knobX + 190}
                  y={knobY - 168}
                  textAnchor="middle"
                  fontSize={60}
                  fontWeight={800}
                  fill={MP.deep}
                  fontFamily={MANABI_FONT}
                >
                  !
                </text>
              </g>
            )}
          </>
        ) : (
          <>
            {/* 木の棚 (板3枚) */}
            {[0, 1, 2].map((i) => {
              const y = 380 + i * 190;
              return (
                <g key={i}>
                  <rect
                    x={240}
                    y={y}
                    width={760}
                    height={64}
                    fill={MP.wood}
                    stroke={MP.line}
                    strokeWidth={5}
                  />
                  <path
                    d={`M 280 ${y + 22} q 90 10 210 2 t 240 6`}
                    fill="none"
                    stroke={MP.woodGrain}
                    strokeWidth={4}
                  />
                  <path
                    d={`M 320 ${y + 44} q 120 -8 260 0 t 230 -4`}
                    fill="none"
                    stroke={MP.woodGrain}
                    strokeWidth={3}
                  />
                  <ellipse cx={380 + i * 60} cy={y + 32} rx={16} ry={9} fill="none" stroke={MP.woodGrain} strokeWidth={3} />
                </g>
              );
            })}
            {/* 棚の支柱 */}
            <rect x={240} y={340} width={22} height={620} fill={MP.wood} stroke={MP.line} strokeWidth={5} />
            <rect x={978} y={340} width={22} height={620} fill={MP.wood} stroke={MP.line} strokeWidth={5} />
            <SmallLabel x={620} y={296} text="木の棚" color={MP.woodWarm} />
            {touched && <WarmAura x={700} y={400} />}
            <Hand x={756 + handX} y={396} />
          </>
        )}
      </svg>
    </Frame>
  );
};

// 温度計2本の比較 (同じ温度を指す)
const ThermometerScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 50 });
  const labels = [
    scene.items?.[0]?.label ?? "金属",
    scene.items?.[1]?.label ?? "木",
  ];
  const temp = scene.items?.find((i) => i.value !== undefined)?.value ?? 20;
  const eqIn = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const Thermo: React.FC<{ x: number; label: string; color: string }> = ({
    x,
    label,
    color,
  }) => {
    const top = 260;
    const bottom = 740;
    const level = interpolate(rise, [0, 1], [bottom, top + 180]);
    return (
      <g>
        {/* 目盛り */}
        {Array.from({ length: 9 }, (_, i) => {
          const y = top + 40 + i * 52;
          return (
            <line
              key={i}
              x1={x - 64}
              x2={x - 40}
              y1={y}
              y2={y}
              stroke={MP.faint}
              strokeWidth={i % 2 === 0 ? 4 : 2}
            />
          );
        })}
        {/* 管 */}
        <rect
          x={x - 20}
          y={top}
          width={40}
          height={bottom - top}
          rx={20}
          fill={MP.panel}
          stroke={MP.line}
          strokeWidth={5}
        />
        {/* 液 */}
        <rect
          x={x - 11}
          y={level}
          width={22}
          height={bottom - level + 20}
          rx={11}
          fill={MP.accent}
        />
        <circle cx={x} cy={bottom + 46} r={44} fill={MP.accent} stroke={MP.line} strokeWidth={5} />
        {/* 値 */}
        <text
          x={x}
          y={top - 36}
          textAnchor="middle"
          fontSize={52}
          fontWeight={700}
          fill={MP.accentSoft}
          fontFamily={MANABI_FONT}
          opacity={interpolate(rise, [0.85, 1], [0, 1])}
        >
          {temp}℃
        </text>
        {/* 名前は上に (下は字幕と重なるため) */}
        <SmallLabel x={x} y={146} text={label} color={color} size={38} />
      </g>
    );
  };

  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Thermo x={700} label={labels[0]} color={MP.blue} />
        <Thermo x={1220} label={labels[1]} color={MP.woodWarm} />
        {/* 同じ温度 → 「=」 */}
        <g opacity={eqIn}>
          <line x1={915} x2={1005} y1={500} y2={500} stroke={MP.ink} strokeWidth={10} strokeLinecap="round" />
          <line x1={915} x2={1005} y1={540} y2={540} stroke={MP.ink} strokeWidth={10} strokeLinecap="round" />
        </g>
      </svg>
      <DiagramTitle text={scene.title ?? "温度はどちらも同じ"} />
    </Frame>
  );
};

// 大きな「?」
const QuestionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14 } });
  const pulse = 1 + 0.015 * Math.sin(frame / 14);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(960, 540) scale(${pop * pulse})`}>
          <circle r={210} fill={MP.panel} stroke={MP.line} strokeWidth={6} />
          <circle cx={-140} cy={-140} r={26} fill={MP.ink} opacity={0.5} />
          <text
            y={84}
            textAnchor="middle"
            fontSize={260}
            fontWeight={600}
            fill={MP.ink}
            fontFamily={MANABI_SERIF}
          >
            ?
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 手のクローズアップ (体温36℃)
const HandWarmScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <WarmAura x={760} y={560} />
        <Hand x={820} y={540} scale={1.7} />
        <g opacity={interpolate(appear, [0.6, 1], [0, 1])}>
          <line x1={880} y1={430} x2={1130} y2={330} stroke={MP.faint} strokeWidth={4} />
          <text
            x={1150}
            y={340}
            fontSize={84}
            fontWeight={700}
            fill={MP.accent}
            fontFamily={MANABI_FONT}
          >
            36℃
          </text>
          <text x={1152} y={396} fontSize={34} fill={MP.faint} fontFamily={MANABI_FONT}>
            手の表面はいつも温かい
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 断面図: 熱が矢印で移動する (手 → 物)
const HeatFlowScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const leftLabel = scene.items?.[0]?.label ?? "手";
  const rightLabel = scene.items?.[1]?.label ?? "金属";
  const boxTop = 330;
  const boxH = 420;
  // 矢印が左から右へ流れ続ける
  const Arrow: React.FC<{ y: number; offset: number }> = ({ y, offset }) => {
    const loop = 46;
    const t = ((frame * 1.6 + offset) % loop) / loop;
    const x = interpolate(t, [0, 1], [760, 1070]);
    const o = interpolate(t, [0, 0.12, 0.8, 1], [0, 1, 1, 0]);
    return (
      <g opacity={o} transform={`translate(${x}, ${y})`}>
        <line x1={-56} x2={6} y1={0} y2={0} stroke={MP.accent} strokeWidth={10} strokeLinecap="round" />
        <path d="M 2 -16 L 30 0 L 2 16 Z" fill={MP.accent} />
      </g>
    );
  };
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 手の側 (温かい) */}
        <rect
          x={420}
          y={boxTop}
          width={320}
          height={boxH}
          rx={16}
          fill="#241A12"
          stroke={MP.accentSoft}
          strokeWidth={6}
        />
        <text x={580} y={boxTop + 96} textAnchor="middle" fontSize={46} fontWeight={700} fill={MP.ink} fontFamily={MANABI_FONT}>
          {leftLabel}
        </text>
        <text x={580} y={boxTop + 170} textAnchor="middle" fontSize={54} fontWeight={700} fill={MP.accentSoft} fontFamily={MANABI_FONT}>
          36℃
        </text>
        <text x={580} y={boxTop + 240} textAnchor="middle" fontSize={30} fill={MP.faint} fontFamily={MANABI_FONT}>
          温かい
        </text>
        {/* 物の側 (冷たい) */}
        <rect
          x={1100}
          y={boxTop}
          width={320}
          height={boxH}
          rx={16}
          fill="#15202E"
          stroke={MP.blue}
          strokeWidth={6}
        />
        <text x={1260} y={boxTop + 96} textAnchor="middle" fontSize={46} fontWeight={700} fill={MP.ink} fontFamily={MANABI_FONT}>
          {rightLabel}
        </text>
        <text x={1260} y={boxTop + 240} textAnchor="middle" fontSize={30} fill={MP.faint} fontFamily={MANABI_FONT}>
          冷たい
        </text>
        {/* 熱の矢印 */}
        <Arrow y={440} offset={0} />
        <Arrow y={540} offset={18} />
        <Arrow y={640} offset={33} />
        <text x={920} y={790} textAnchor="middle" fontSize={34} fill={MP.accent} fontFamily={MANABI_FONT} letterSpacing={2}>
          熱は温かいほうから冷たいほうへ
        </text>
      </svg>
      <DiagramTitle text={scene.title ?? "熱の移動"} />
    </Frame>
  );
};

// 分子の列を熱が順に伝わっていく
const MoleculesScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const n = 10;
  const spacing = 128;
  const startX = 960 - ((n - 1) * spacing) / 2;
  const y = 560;
  // 熱の先端が左から右へ進む (進んだ粒は温まって揺れる)
  const front = interpolate(frame, [10, 100], [-1, n + 1], {
    extrapolateRight: "clamp",
  });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 熱源 (左の炎マーク) */}
        <g transform={`translate(${startX - 170}, ${y})`}>
          <path
            d="M 0 46 C -40 20 -34 -28 0 -58 C 8 -34 26 -28 30 -6 C 48 -18 50 -34 46 -48 C 78 -16 76 26 40 48 C 28 56 12 56 0 46 Z"
            fill={MP.accent}
            opacity={0.9}
            transform={`scale(${1 + 0.05 * Math.sin(frame / 4)})`}
          />
        </g>
        {Array.from({ length: n }, (_, i) => {
          const heated = i < front;
          const heat = heated ? Math.min(1, (front - i) / 2) : 0;
          const jitter = heat * 5;
          const dx = jitter * Math.sin(frame / 2.2 + i * 1.7);
          const dy = jitter * Math.cos(frame / 2.6 + i * 2.3);
          const isFront = Math.abs(i - front) < 1;
          return (
            <g key={i} transform={`translate(${startX + i * spacing + dx}, ${y + dy})`}>
              <circle
                r={40}
                fill={heated ? "#3A2718" : MP.panel}
                stroke={isFront ? MP.accentSoft : heated ? MP.accent : MP.line}
                strokeWidth={isFront ? 8 : 5}
              />
              {heated && (
                <circle r={16} fill={MP.accent} opacity={0.5 + 0.3 * Math.sin(frame / 5 + i)} />
              )}
            </g>
          );
        })}
        {/* 結び線 */}
        <line
          x1={startX - 40}
          x2={startX + (n - 1) * spacing + 40}
          y1={y + 90}
          y2={y + 90}
          stroke={MP.faint}
          strokeWidth={3}
        />
        <text x={960} y={y + 150} textAnchor="middle" fontSize={32} fill={MP.faint} fontFamily={MANABI_FONT}>
          粒がぎっしり並ぶほど、熱は速く伝わる
        </text>
      </svg>
      <DiagramTitle text={scene.title ?? "熱の伝わり方"} />
    </Frame>
  );
};

// チャート: 倍率が大きい2項目は「マスの数」で見せる (お手本の約1000倍表現)
const ManabiChartScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).filter((i) => i.value !== undefined);
  const grow = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 80 });

  // --- グリッド比較 (2項目で倍率が10倍以上) ---
  if (items.length === 2) {
    const sorted = [...items].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    const small = sorted[0];
    const big = sorted[1];
    const ratio = Math.round((big.value ?? 1) / Math.max(small.value ?? 1, 0.0001));
    if (ratio >= 10) {
      const total = Math.min(ratio, 2400);
      const cols = 60;
      const cell = 12;
      const gap = 2;
      const rows = Math.ceil(total / cols);
      const gridW = cols * (cell + gap);
      const gridX = 840;
      const gridH = rows * (cell + gap);
      const gridY = Math.min(Math.max(240, 520 - gridH / 2), 770 - gridH);
      const shown = Math.round(grow * total);
      const fullRows = Math.floor(shown / cols);
      const rest = shown % cols;
      const counter = Math.max(1, Math.round(grow * ratio));
      return (
        <Frame>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {/* 基準 (1マス)。比較の大群とまったく同じ大きさの1マスを、丸で囲んで見せる */}
            <rect x={500 - cell / 2} y={520 - cell / 2} width={cell} height={cell} fill={MP.blueLight} />
            <circle cx={500} cy={520} r={40} fill="none" stroke={MP.blueLight} strokeWidth={3} />
            <SmallLabel x={500} y={630} text={small.label} color={MP.ink} size={38} />
            <SmallLabel x={500} y={680} text="1" color={MP.blueLight} size={40} />
            {/* 比較の大群 (満ちた行はまとめて描く) */}
            {Array.from({ length: fullRows }, (_, r) => (
              <rect
                key={r}
                x={gridX}
                y={gridY + r * (cell + gap)}
                width={gridW - gap}
                height={cell}
                fill={MP.accent}
              />
            ))}
            {rest > 0 && (
              <rect
                x={gridX}
                y={gridY + fullRows * (cell + gap)}
                width={rest * (cell + gap) - gap}
                height={cell}
                fill={MP.accent}
              />
            )}
            {/* マス目の線 (上に重ねて粒感を出す) */}
            {Array.from({ length: Math.min(fullRows + 1, rows) }, (_, r) => (
              <g key={`l${r}`}>
                {Array.from({ length: 12 }, (_, c) => (
                  <line
                    key={c}
                    x1={gridX + c * 5 * (cell + gap) - gap / 2}
                    x2={gridX + c * 5 * (cell + gap) - gap / 2}
                    y1={gridY + r * (cell + gap)}
                    y2={gridY + r * (cell + gap) + cell}
                    stroke={MP.background}
                    strokeWidth={2}
                  />
                ))}
              </g>
            ))}
            <SmallLabel x={gridX + gridW / 2} y={gridY + gridH + 52} text={big.label} color={MP.ink} size={38} />
            <text
              x={gridX + gridW / 2}
              y={gridY - 36}
              textAnchor="middle"
              fontSize={76}
              fontWeight={800}
              fill={MP.accentSoft}
              fontFamily={MANABI_FONT}
            >
              約{counter.toLocaleString()}倍
            </text>
          </svg>
          <DiagramTitle text={scene.title} />
        </Frame>
      );
    }
  }

  // --- それ以外は横棒の比較 ---
  const max = Math.max(...items.map((i) => i.value ?? 0), 1);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {items.slice(0, 4).map((it, i) => {
          const y = 340 + i * 150;
          const w = ((it.value ?? 0) / max) * 820 * grow;
          const strongest = (it.value ?? 0) === max;
          return (
            <g key={i}>
              <text x={560} y={y + 46} textAnchor="end" fontSize={38} fill={MP.ink} fontFamily={MANABI_FONT}>
                {it.label}
              </text>
              <rect x={600} y={y} width={Math.max(w, 4)} height={64} fill={strongest ? MP.accent : MP.blue} rx={4} />
              <text
                x={620 + w}
                y={y + 46}
                fontSize={44}
                fontWeight={700}
                fill={strongest ? MP.accentSoft : MP.blueLight}
                fontFamily={MANABI_FONT}
              >
                {Math.round((it.value ?? 0) * grow * 10) / 10}
                {it.unit ?? ""}
              </text>
            </g>
          );
        })}
      </svg>
      <DiagramTitle text={scene.title ?? "数字で見る"} />
    </Frame>
  );
};

// 折れ線グラフ: 金属に触れた手の温度だけ下がる
const GraphScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  // どちらの線がどっちか: 熱をよく奪う側 (金属など) が急降下。項目の順番に頼らず言葉で判定する
  const l0 = scene.items?.[0]?.label ?? "金属";
  const l1 = scene.items?.[1]?.label ?? "木";
  const conductorRe = /(金属|銅|鉄|アルミ|ステンレス|タイル|石)/;
  const steepLabel = conductorRe.test(l0) ? l0 : conductorRe.test(l1) ? l1 : l0;
  const gentleLabel = steepLabel === l0 ? l1 : l0;
  const ox = 420;
  const oy = 780;
  const topY = 250;
  const rightX = 1520;
  // 線を左から描いていく
  const p = interpolate(frame, [12, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const metalPts = "440,330 560,470 700,620 860,680 1200,700 1460,706";
  const woodPts = "440,330 620,360 900,382 1200,392 1460,396";
  const dashA = 1400;
  const dashB = 1100;
  const labelIn = interpolate(p, [0.9, 1], [0, 1]);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 軸 */}
        <line x1={ox} y1={oy} x2={rightX} y2={oy} stroke={MP.line} strokeWidth={5} />
        <line x1={ox} y1={oy} x2={ox} y2={topY} stroke={MP.line} strokeWidth={5} />
        <path d={`M ${rightX} ${oy} l -20 -11 v 22 Z`} fill={MP.line} />
        <path d={`M ${ox} ${topY} l -11 20 h 22 Z`} fill={MP.line} />
        <text x={ox - 24} y={topY - 24} fontSize={32} fill={MP.faint} fontFamily={MANABI_FONT}>
          手の表面温度
        </text>
        <text x={rightX - 10} y={oy + 56} textAnchor="end" fontSize={32} fill={MP.faint} fontFamily={MANABI_FONT}>
          触れてからの時間 →
        </text>
        {/* 開始点 36度 */}
        <circle cx={440} cy={330} r={12} fill={MP.ink} />
        <text x={400} y={318} textAnchor="end" fontSize={34} fill={MP.ink} fontFamily={MANABI_FONT}>
          36℃
        </text>
        {/* 木: ほぼ下がらない */}
        <polyline
          points={woodPts}
          fill="none"
          stroke={MP.accentSoft}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={dashB}
          strokeDashoffset={(1 - Math.min(p * 1.1, 1)) * dashB}
        />
        {/* 金属: ぐっと下がる */}
        <polyline
          points={metalPts}
          fill="none"
          stroke={MP.blueLight}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={dashA}
          strokeDashoffset={(1 - p) * dashA}
        />
        {/* 線の名前 */}
        <g opacity={labelIn}>
          <text x={1490} y={404} fontSize={38} fontWeight={700} fill={MP.accentSoft} fontFamily={MANABI_FONT}>
            {gentleLabel}
          </text>
          <text x={1490} y={716} fontSize={38} fontWeight={700} fill={MP.blueLight} fontFamily={MANABI_FONT}>
            {steepLabel}
          </text>
          <path d={`M 980 640 l 60 40`} stroke={MP.faint} strokeWidth={3} fill="none" />
          <text x={900} y={630} fontSize={30} fill={MP.faint} fontFamily={MANABI_FONT}>
            ぐっと下がる
          </text>
        </g>
      </svg>
      <DiagramTitle text={scene.title ?? "触れた瞬間の温度"} />
    </Frame>
  );
};

// 風呂場: 冷たいタイルと温かい木の椅子
const BathroomScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* タイルの壁 */}
        <rect x={0} y={140} width={1920} height={600} fill={MP.panel} />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={i * 160} x2={i * 160} y1={140} y2={740} stroke={MP.blueDeep} strokeWidth={4} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <line key={`h${i}`} x1={0} x2={1920} y1={140 + (i + 1) * 150} y2={140 + (i + 1) * 150} stroke={MP.blueDeep} strokeWidth={4} />
        ))}
        {/* 床 */}
        <rect x={0} y={740} width={1920} height={340} fill={MP.deep} />
        <line x1={0} x2={1920} y1={740} y2={740} stroke={MP.line} strokeWidth={5} />
        {/* 冷たいタイルのラベル */}
        <g transform="translate(430, 430)">
          <path d="m 0 0 l 12 -20 l 9 16 l 14 -22" stroke={MP.blueLight} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="m 60 -10 l 12 -20 l 9 16 l 14 -22" stroke={MP.blueLight} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        <SmallLabel x={470} y={530} text="タイル = 熱をよく奪う" color={MP.blueLight} size={34} />
        {/* 木の椅子 */}
        <g transform="translate(1250, 0)">
          <rect x={0} y={620} width={330} height={56} rx={10} fill={MP.wood} stroke={MP.line} strokeWidth={5} />
          <path d="M 40 644 q 80 10 150 2 t 110 4" fill="none" stroke={MP.woodGrain} strokeWidth={4} />
          <rect x={30} y={676} width={30} height={190} fill={MP.wood} stroke={MP.line} strokeWidth={5} />
          <rect x={270} y={676} width={30} height={190} fill={MP.wood} stroke={MP.line} strokeWidth={5} />
          <WarmAura x={165} y={600} />
        </g>
        <SmallLabel x={1415} y={548} text="木 = 熱を奪わない" color={MP.woodWarm} size={34} />
        {/* 湯気 */}
        {[0, 1].map((i) => {
          const t = (frame / 90 + i * 0.5) % 1;
          return (
            <path
              key={i}
              d={`M ${880 + i * 90} ${820 - t * 160} q 20 -30 0 -60 q -20 -30 0 -60`}
              fill="none"
              stroke={MP.faint}
              strokeWidth={5}
              opacity={(1 - t) * 0.5}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </Frame>
  );
};

// 部屋の全景 (予備)
const RoomScene: React.FC = () => (
  <Frame>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <line x1={0} x2={1920} y1={820} y2={820} stroke={MP.line} strokeWidth={5} />
      {/* 窓 */}
      <rect x={260} y={200} width={420} height={380} fill={MP.deep} stroke={MP.line} strokeWidth={6} />
      <line x1={470} x2={470} y1={200} y2={580} stroke={MP.line} strokeWidth={4} />
      <line x1={260} x2={680} y1={390} y2={390} stroke={MP.line} strokeWidth={4} />
      {/* 机とランプ */}
      <rect x={1050} y={640} width={560} height={30} fill={MP.panel} stroke={MP.line} strokeWidth={5} />
      <rect x={1090} y={670} width={24} height={150} fill={MP.panel} stroke={MP.line} strokeWidth={4} />
      <rect x={1540} y={670} width={24} height={150} fill={MP.panel} stroke={MP.line} strokeWidth={4} />
      <path d="M 1480 640 v -120 q 0 -40 -50 -36 l -36 4" fill="none" stroke={MP.line} strokeWidth={6} />
      <path d="M 1394 492 a 38 38 0 0 0 -4 54 l 52 -10 Z" fill={MP.accent} />
      <circle cx={1385} cy={540} r={30} fill={MP.accent} opacity={0.2} />
    </svg>
  </Frame>
);

// 考える人 (線画の横顔と「?」)
const ThinkingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 16, fps, config: { damping: 13 } });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 頭と肩 (線画) */}
        <g stroke={MP.line} strokeWidth={6} fill="none">
          <circle cx={820} cy={480} r={130} />
          <path d="M 600 980 q 10 -220 220 -230 q 210 10 220 230" />
        </g>
        {/* 吹き出しの点々と ? */}
        <circle cx={1000} cy={330} r={10} fill={MP.faint} />
        <circle cx={1050} cy={280} r={14} fill={MP.faint} />
        <g transform={`translate(1170, 200) scale(${Math.max(pop, 0)})`}>
          <circle r={86} fill={MP.panel} stroke={MP.line} strokeWidth={5} />
          <text y={34} textAnchor="middle" fontSize={100} fontWeight={600} fill={MP.accentSoft} fontFamily={MANABI_SERIF}>
            ?
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 図解 (汎用): 中心の言葉と周りの要素
const ConceptScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).slice(0, 4);
  const cx = 960;
  const cy = 560;
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <circle cx={cx} cy={cy} r={150} fill={MP.panel} stroke={MP.accent} strokeWidth={5} />
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={44} fontWeight={700} fill={MP.ink} fontFamily={MANABI_FONT}>
          {scene.title ?? scene.emphasis ?? ""}
        </text>
        {items.map((it, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(items.length, 1);
          const x = cx + Math.cos(angle) * 360;
          const y = cy + Math.sin(angle) * 280;
          const s = spring({ frame: frame - 10 - i * 8, fps, config: { damping: 15 } });
          return (
            <g key={i} opacity={Math.max(s, 0)}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={MP.faint} strokeWidth={3} />
              <circle cx={x} cy={y} r={92} fill={MP.background} stroke={MP.line} strokeWidth={4} />
              <text x={x} y={y + 12} textAnchor="middle" fontSize={32} fill={MP.ink} fontFamily={MANABI_FONT}>
                {it.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// カードがナレーション全文をそのまま大きく見せるか (その場合は字幕を重ねない)
export const manabiCardShowsFullText = (scene: Scene): boolean => {
  if (scene.isEnding || scene.type !== "card") return false;
  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  if (hl && text.includes(hl) && text.length <= 52) return true;
  return !hl && text.length <= 52;
};

// カード: 章見出し・結論 (キーワードだけオレンジ)
const ManabiCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
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
              border: `4px solid ${MP.accent}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: MANABI_SERIF,
              fontSize: 76,
              color: MP.ink,
              marginBottom: 44,
            }}
          >
            {MANABI_CHANNEL.iconLetter}
          </div>
          <div style={{ fontFamily: MANABI_SERIF, fontSize: 68, color: MP.ink, letterSpacing: 6 }}>
            {MANABI_CHANNEL.name}
          </div>
          <div style={{ width: 70, height: 4, background: MP.accent, marginTop: 36, borderRadius: 2 }} />
        </AbsoluteFill>
      </Frame>
    );
  }

  // キーワード (emphasis) が本文に含まれていれば、本文を出してその部分だけオレンジに。
  // 含まれない・本文が長すぎるときは emphasis (無ければ本文) をそのまま大きく。
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
        <div style={{ width: 64, height: 4, background: MP.accent, marginBottom: 56, borderRadius: 2 }} />
        <div
          style={{
            fontFamily: MANABI_SERIF,
            fontSize: useFull ? 62 : 76,
            fontWeight: 600,
            color: MP.ink,
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 1460,
            letterSpacing: 2,
          }}
        >
          {useFull && hl
            ? text.split(hl).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span style={{ color: MP.accent }}>{hl}</span>}
                </span>
              ))
            : display}
        </div>
        <div style={{ width: 64, height: 4, background: MP.accent, marginTop: 56, borderRadius: 2 }} />
      </AbsoluteFill>
    </Frame>
  );
};

// ===== 入口: シーンの型と題材で描き分ける =====

export const ManabiSceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  if (scene.image && scene.type !== "card") {
    return <ImageScene scene={scene} />;
  }
  if (scene.isEnding) return <ManabiCardScene scene={scene} />;

  const m = scene.motif;
  switch (scene.type) {
    case "card":
      return <ManabiCardScene scene={scene} />;
    case "chart":
      return <ManabiChartScene scene={scene} />;
    case "diagram":
      if (m === "heatflow") return <HeatFlowScene scene={scene} />;
      if (m === "molecules") return <MoleculesScene scene={scene} />;
      if (m === "graph") return <GraphScene scene={scene} />;
      return <ConceptScene scene={scene} />;
    case "location":
      if (m === "bathroom") return <BathroomScene />;
      return <RoomScene />;
    case "object":
      if (m === "doorknob") return <TouchScene scene={scene} material="metal" />;
      if (m === "wood") return <TouchScene scene={scene} material="wood" />;
      if (m === "thermometer") return <ThermometerScene scene={scene} />;
      if (m === "hand") return <HandWarmScene />;
      return <QuestionScene />;
    default:
      // character
      if (m === "touch_metal") return <TouchScene scene={scene} material="metal" />;
      if (m === "touch_wood") return <TouchScene scene={scene} material="wood" />;
      return <ThinkingScene />;
  }
};
