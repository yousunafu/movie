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
  interpolateColors,
} from "remotion";
import type { Scene } from "../../types";
import { MANABI_CHANNEL } from "../../channel";
import { ImageScene } from "../scenes/ImageScene";
import { wrapJa } from "../wrapJa";

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
  green: "#7FA06A", // 控えめな緑 (植物・ツタ)
  rust: "#A66A3A", // 錆のオレンジ褐色
  sand: "#8D7F66", // 砂
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
        {/* 名前と値は同じ行に「金属 20℃」。上下はタイトル・字幕と重なるため */}
        <text
          x={x - 6}
          y={top - 36}
          textAnchor="end"
          fontSize={40}
          fontWeight={700}
          fill={color}
          fontFamily={MANABI_FONT}
        >
          {label}
        </text>
        <text
          x={x + 8}
          y={top - 36}
          fontSize={52}
          fontWeight={700}
          fill={MP.accentSoft}
          fontFamily={MANABI_FONT}
          opacity={interpolate(rise, [0.85, 1], [0, 1])}
        >
          {temp}℃
        </text>
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
  // 相手が木などの「熱を奪わない物」なら、矢印をほとんど流さない (意味が逆になるのを防ぐ)
  const weak = /木|布|紙|プラ|発泡|ウール|毛/.test(rightLabel);
  const boxTop = 330;
  const boxH = 420;
  // 矢印が左から右へ流れ続ける
  const Arrow: React.FC<{ y: number; offset: number }> = ({ y, offset }) => {
    const loop = 46;
    const t = ((frame * (weak ? 0.5 : 1.6) + offset) % loop) / loop;
    const x = interpolate(t, [0, 1], [760, weak ? 900 : 1070]);
    const o = interpolate(t, [0, 0.12, 0.8, 1], [0, 1, 1, 0]) * (weak ? 0.45 : 1);
    return (
      <g opacity={o} transform={`translate(${x}, ${y})`}>
        <line x1={-56} x2={6} y1={0} y2={0} stroke={MP.accent} strokeWidth={weak ? 6 : 10} strokeLinecap="round" />
        <path d="M 2 -16 L 30 0 L 2 16 Z" fill={MP.accent} transform={weak ? "scale(0.7)" : undefined} />
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
          fill={weak ? "#201A10" : "#15202E"}
          stroke={weak ? MP.woodWarm : MP.blue}
          strokeWidth={6}
        />
        <text x={1260} y={boxTop + 96} textAnchor="middle" fontSize={46} fontWeight={700} fill={MP.ink} fontFamily={MANABI_FONT}>
          {rightLabel}
        </text>
        <text x={1260} y={boxTop + 240} textAnchor="middle" fontSize={30} fill={weak ? MP.woodWarm : MP.faint} fontFamily={MANABI_FONT}>
          {weak ? "熱を奪わない" : "冷たい"}
        </text>
        {/* 熱の矢印 (weak のときは1本だけ・ゆっくり・途中まで) */}
        <Arrow y={weak ? 540 : 440} offset={0} />
        {!weak && <Arrow y={540} offset={18} />}
        {!weak && <Arrow y={640} offset={33} />}
        {weak && (
          <g stroke={MP.faint} strokeWidth={4}>
            <line x1={940} x2={1000} y1={500} y2={580} />
            <line x1={1000} x2={940} y1={500} y2={580} />
          </g>
        )}
        <text x={920} y={790} textAnchor="middle" fontSize={34} fill={weak ? MP.woodWarm : MP.accent} fontFamily={MANABI_FONT} letterSpacing={2}>
          {weak ? "熱はほとんど流れない → 手の温かさが保たれる" : "熱は温かいほうから冷たいほうへ"}
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
      // マスの大きさは倍率に合わせて自動で縮める (最小3px)。
      // 「約10,000倍」のような大きい数でも、左の1マスと同じ大きさのまま正直に画面へ収める。
      // 小ささ自体がスケール感の演出になる (丸囲みがあるので基準の1マスは見失わない)
      const maxW = 840; // 大群に使える横幅
      const maxH = 520; // 縦 (タイトルと字幕を避けた範囲)
      let cell = 12;
      for (; cell > 3; cell--) {
        const tryPitch = cell + (cell >= 8 ? 2 : 1);
        const tryCols = Math.floor(maxW / tryPitch);
        if (Math.ceil(ratio / tryCols) * tryPitch <= maxH) break;
      }
      const gap = cell >= 8 ? 2 : 1;
      const pitch = cell + gap;
      const cols = Math.floor(maxW / pitch);
      // それでも収まらない超巨大な倍率は、描く数だけ上限で止める (カウントは本当の倍率まで)
      const total = Math.min(ratio, cols * Math.floor(maxH / pitch));
      const rows = Math.ceil(total / cols);
      const gridW = cols * pitch;
      const gridX = 840;
      const gridH = rows * pitch;
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
                y={gridY + r * pitch}
                width={gridW - gap}
                height={cell}
                fill={MP.accent}
              />
            ))}
            {rest > 0 && (
              <rect
                x={gridX}
                y={gridY + fullRows * pitch}
                width={rest * pitch - gap}
                height={cell}
                fill={MP.accent}
              />
            )}
            {/* マス目の線 (5マスごとに縦線を重ねて粒感を出す。マスが小さいときは細く) */}
            {Array.from({ length: Math.floor(cols / 5) + 1 }, (_, c) => (
              <line
                key={`l${c}`}
                x1={gridX + c * 5 * pitch - gap / 2}
                x2={gridX + c * 5 * pitch - gap / 2}
                y1={gridY}
                y2={gridY + (fullRows + (rest > 0 ? 1 : 0)) * pitch}
                stroke={MP.background}
                strokeWidth={cell >= 8 ? 2 : 1}
              />
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

// ===== 人類の痕跡テーマの場面 (台本「1億年後の地球」用) =====

// 長い骨 (大腿骨のかたち)。中心が (0,0)
const LongBone: React.FC<{
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  color: string;
  fill?: string;
  opacity?: number;
}> = ({ x, y, rotate = 0, scale = 1, color, fill = MP.background, opacity = 1 }) => (
  <g
    transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}
    opacity={opacity}
    stroke={color}
    strokeWidth={5}
    fill={fill}
  >
    <rect x={-70} y={-11} width={140} height={22} rx={11} />
    <circle cx={-76} cy={-13} r={15} />
    <circle cx={-76} cy={13} r={15} />
    <circle cx={76} cy={-13} r={15} />
    <circle cx={76} cy={13} r={15} />
  </g>
);

// 都市のスカイライン + 人のピクトグラムがふっと消える (人類が突然いなくなったら)
const CityVanishScene: React.FC = () => {
  const frame = useCurrentFrame();
  const groundY = 820;
  const fadeIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  // (x, 幅, 高さ)
  const buildings: [number, number, number][] = [
    [120, 150, 300],
    [300, 130, 430],
    [460, 190, 560],
    [690, 130, 360],
    [1100, 170, 500],
    [1300, 130, 390],
    [1460, 200, 590],
    [1690, 130, 310],
  ];
  const Person: React.FC<{ x: number; vanishAt: number }> = ({ x, vanishAt }) => {
    const o = interpolate(frame, [vanishAt, vanishAt + 12], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const ring = interpolate(frame, [vanishAt, vanishAt + 18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <g>
        <g opacity={o} stroke={MP.ink} strokeWidth={6} fill="none" strokeLinecap="round">
          <circle cx={x} cy={groundY - 104} r={17} />
          <line x1={x} y1={groundY - 86} x2={x} y2={groundY - 34} />
          <line x1={x - 22} y1={groundY - 64} x2={x + 22} y2={groundY - 64} />
          <line x1={x} y1={groundY - 34} x2={x - 16} y2={groundY} />
          <line x1={x} y1={groundY - 34} x2={x + 16} y2={groundY} />
        </g>
        {/* 消えた瞬間のふわっとした輪 */}
        {frame >= vanishAt && ring < 1 && (
          <circle
            cx={x}
            cy={groundY - 62}
            r={20 + ring * 40}
            fill="none"
            stroke={MP.blueLight}
            strokeWidth={3}
            opacity={(1 - ring) * 0.6}
          />
        )}
      </g>
    );
  };
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} opacity={fadeIn}>
        {/* ビル群 (白線画) */}
        {buildings.map(([bx, bw, bh], i) => {
          const by = groundY - bh;
          const winCols = Math.max(Math.floor((bw - 40) / 54), 1);
          const winRows = Math.max(Math.floor((bh - 60) / 74), 1);
          return (
            <g key={i}>
              <rect x={bx} y={by} width={bw} height={bh} fill={MP.background} stroke={MP.line} strokeWidth={5} />
              {Array.from({ length: winRows }, (_, r) =>
                Array.from({ length: winCols }, (_, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={bx + 22 + c * 54}
                    y={by + 26 + r * 74}
                    width={30}
                    height={42}
                    fill="none"
                    stroke={MP.faint}
                    strokeWidth={2.5}
                  />
                )),
              )}
            </g>
          );
        })}
        {/* 地面 */}
        <line x1={0} x2={W} y1={groundY} y2={groundY} stroke={MP.line} strokeWidth={5} />
        {/* 人々 (左から順にふっと消える) */}
        <Person x={560} vanishAt={36} />
        <Person x={770} vanishAt={50} />
        <Person x={950} vanishAt={64} />
        <Person x={1150} vanishAt={78} />
        <Person x={1340} vanishAt={92} />
      </svg>
    </Frame>
  );
};

// ビルが植物と雨に飲み込まれる (廃墟化)
const RuinScene: React.FC = () => {
  const frame = useCurrentFrame();
  const groundY = 820;
  const p = interpolate(frame, [12, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // ツタ1本: 下から上へ伸びる線 + 通過した所に葉が開く
  const Vine: React.FC<{
    d: string;
    length: number;
    delay: number;
    leaves: [number, number, number, number][]; // [x, y, 回転, 出現タイミング0-1]
  }> = ({ d, length, delay, leaves }) => {
    const vp = Math.min(Math.max(p * 1.25 - delay, 0), 1);
    return (
      <g>
        <path
          d={d}
          fill="none"
          stroke={MP.green}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={(1 - vp) * length}
        />
        {leaves.map(([lx, ly, rot, at], i) => {
          const lo = interpolate(vp, [at, at + 0.1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <g key={i} transform={`translate(${lx}, ${ly}) rotate(${rot}) scale(${lo})`} opacity={lo}>
              <ellipse rx={26} ry={13} fill={MP.green} opacity={0.45} stroke={MP.green} strokeWidth={3} />
            </g>
          );
        })}
      </g>
    );
  };
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* ビル (輪郭だけ残った廃墟) */}
        <rect x={740} y={240} width={420} height={580} fill={MP.panel} stroke={MP.line} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => (
            <rect
              key={`${r}-${c}`}
              x={775 + c * 92}
              y={280 + r * 92}
              width={54}
              height={58}
              fill="none"
              stroke={MP.faint}
              strokeWidth={2.5}
            />
          )),
        )}
        <rect x={470} y={470} width={230} height={350} fill={MP.panel} stroke={MP.line} strokeWidth={5} />
        {Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 2 }, (_, c) => (
            <rect
              key={`s${r}-${c}`}
              x={505 + c * 90}
              y={510 + r * 100}
              width={50}
              height={56}
              fill="none"
              stroke={MP.faint}
              strokeWidth={2.5}
            />
          )),
        )}
        {/* 地面と草 */}
        <line x1={0} x2={W} y1={groundY} y2={groundY} stroke={MP.line} strokeWidth={5} />
        {[260, 400, 1230, 1400, 1580].map((gx, i) => {
          const g0 = Math.min(Math.max(p * 3 - i * 0.2, 0), 1);
          return (
            <g key={i} transform={`translate(${gx}, ${groundY}) scale(1, ${g0})`} stroke={MP.green} strokeWidth={5} fill="none" strokeLinecap="round">
              <line x1={0} y1={0} x2={-8} y2={-36} />
              <line x1={10} y1={0} x2={10} y2={-46} />
              <line x1={20} y1={0} x2={28} y2={-32} />
            </g>
          );
        })}
        {/* ツタ (下から伸びてビルを覆う) */}
        <Vine
          d={`M 760 ${groundY} C 724 740 790 680 752 600 C 722 530 788 460 750 390 C 730 340 762 300 748 258`}
          length={640}
          delay={0}
          leaves={[
            [768, 730, -30, 0.2],
            [742, 610, 25, 0.42],
            [772, 470, -20, 0.62],
            [740, 330, 30, 0.82],
            [756, 268, -35, 0.95],
          ]}
        />
        <Vine
          d={`M 950 ${groundY} C 920 760 980 700 946 620 C 918 550 976 480 944 410`}
          length={460}
          delay={0.18}
          leaves={[
            [962, 740, 25, 0.3],
            [934, 600, -25, 0.6],
            [958, 470, 20, 0.88],
          ]}
        />
        <Vine
          d={`M 1148 ${groundY} C 1180 740 1120 670 1156 590 C 1186 520 1128 450 1160 380 C 1176 330 1150 290 1162 250`}
          length={660}
          delay={0.1}
          leaves={[
            [1136, 720, 30, 0.25],
            [1168, 600, -25, 0.45],
            [1138, 460, 25, 0.68],
            [1170, 340, -30, 0.88],
          ]}
        />
        <Vine
          d={`M 560 ${groundY} C 536 760 584 710 556 640 C 532 580 580 530 558 480`}
          length={380}
          delay={0.3}
          leaves={[
            [572, 740, 25, 0.35],
            [546, 620, -25, 0.7],
            [570, 500, 20, 0.95],
          ]}
        />
        {/* 雨 (斜めの線が降り続ける) */}
        {Array.from({ length: 18 }, (_, i) => {
          const rx = (i * 127 + 40) % 1880;
          const fall = (frame * 11 + i * 173) % 780;
          const ry = 60 + fall;
          return (
            <line
              key={i}
              x1={rx - fall * 0.16}
              y1={ry}
              x2={rx - fall * 0.16 - 11}
              y2={ry + 36}
              stroke={MP.blueLight}
              strokeWidth={3.5}
              strokeLinecap="round"
              opacity={0.45}
            />
          );
        })}
      </svg>
    </Frame>
  );
};

// 鉄は錆び、コンクリートは砂に戻る (風化)
const DecayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const groundY = 820;
  const rustP = interpolate(frame, [10, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const erodeP = interpolate(frame, [20, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const steel = interpolateColors(rustP, [0, 1], [MP.line, MP.rust]);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 鉄骨 (だんだん錆色に) */}
        <g stroke={steel} strokeWidth={14} strokeLinecap="round" fill="none">
          <line x1={480} y1={330} x2={480} y2={760} />
          <line x1={760} y1={330} x2={760} y2={760} />
          <line x1={480} y1={330} x2={760} y2={330} />
          <line x1={480} y1={545} x2={760} y2={545} />
          <line x1={480} y1={330} x2={760} y2={545} />
          <line x1={760} y1={330} x2={480} y2={545} />
        </g>
        {[
          [480, 330],
          [760, 330],
          [480, 545],
          [760, 545],
          [480, 760],
          [760, 760],
        ].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r={10} fill={MP.background} stroke={steel} strokeWidth={5} />
        ))}
        {/* 錆の粒がぽろぽろ落ちる */}
        {rustP > 0.5 &&
          Array.from({ length: 8 }, (_, i) => {
            const t = ((frame * 5 + i * 41) % 60) / 60;
            const px = 500 + ((i * 83) % 240);
            return (
              <circle
                key={i}
                cx={px}
                cy={765 + t * 48}
                r={4}
                fill={MP.rust}
                opacity={(1 - t) * 0.8}
              />
            );
          })}
        <SmallLabel x={620} y={280} text="鉄 → 錆びる" color={MP.accentSoft} size={34} />
        {/* コンクリートの塊 (角から崩れて砂に) */}
        <rect x={1080} y={470} width={360} height={230} fill={MP.panel} stroke={MP.line} strokeWidth={6} />
        {/* 欠けていく角 (背景色でえぐる) */}
        <path
          d={`M ${1440 - erodeP * 180} 470 L 1440 470 L 1440 ${470 + erodeP * 140} Z`}
          fill={MP.background}
        />
        {/* ひび割れ */}
        <path
          d={`M ${1440 - erodeP * 180} 470 l -36 48 l 24 36 l -40 44`}
          fill="none"
          stroke={MP.faint}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={erodeP}
        />
        <SmallLabel x={1260} y={280} text="コンクリート → 砂に" color={MP.faint} size={34} />
        {/* 砂の粒が落ちる */}
        {Array.from({ length: 16 }, (_, i) => {
          const t = ((frame * 6 + i * 31) % 72) / 72;
          const px = 1120 + ((i * 67) % 300);
          const py = 700 + t * (groundY - 700);
          return (
            <circle key={i} cx={px} cy={py} r={3.5} fill={MP.sand} opacity={(1 - t) * 0.85 * erodeP} />
          );
        })}
        {/* 積もる砂山 */}
        <ellipse
          cx={1260}
          cy={groundY}
          rx={50 + erodeP * 180}
          ry={4 + erodeP * 34}
          fill={MP.sand}
          opacity={0.9}
        />
        {/* 地面 */}
        <line x1={0} x2={W} y1={groundY} y2={groundY} stroke={MP.line} strokeWidth={5} />
      </svg>
    </Frame>
  );
};

// 恐竜の骨格 (首長竜風) が左から順に描かれる
const DinosaurScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [8, 88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // 背骨: 頭(左上) → 首を下る → 胴 → 尻尾が右へ伸び上がる
  const spineD =
    "M 452 346 C 520 384 580 470 660 540 C 740 600 860 630 980 626 C 1120 620 1240 600 1340 556 C 1440 514 1548 468 1660 428";
  const spineLen = 1500;
  const seg = (a: number, b: number) =>
    interpolate(p, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 頭骨 */}
        <g opacity={seg(0, 0.06)}>
          <ellipse cx={428} cy={322} rx={36} ry={23} transform="rotate(-16 428 322)" fill={MP.background} stroke={MP.line} strokeWidth={6} />
          <path d="M 398 334 L 452 346" stroke={MP.line} strokeWidth={5} strokeLinecap="round" fill="none" />
          <circle cx={416} cy={314} r={6} fill="none" stroke={MP.line} strokeWidth={4} />
        </g>
        {/* 背骨 (左から描かれる) */}
        <path
          d={spineD}
          fill="none"
          stroke={MP.line}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={spineLen}
          strokeDashoffset={(1 - p) * spineLen}
        />
        {/* 首の節 */}
        {[
          [500, 404],
          [556, 452],
          [612, 500],
        ].map(([nx, ny], i) => (
          <line
            key={i}
            x1={nx - 12}
            y1={ny - 14}
            x2={nx + 12}
            y2={ny + 14}
            stroke={MP.line}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={seg(0.1 + i * 0.05, 0.16 + i * 0.05)}
          />
        ))}
        {/* 肋骨 (順に現れる) */}
        {Array.from({ length: 7 }, (_, i) => {
          const rx = 800 + i * 64;
          return (
            <path
              key={i}
              d={`M ${rx} 622 q -16 66 10 130`}
              fill="none"
              stroke={MP.line}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={seg(0.38 + i * 0.05, 0.46 + i * 0.05)}
            />
          );
        })}
        {/* 尻尾の節 */}
        {[
          [1400, 530],
          [1500, 488],
          [1596, 450],
        ].map(([tx, ty], i) => (
          <line
            key={i}
            x1={tx - 10}
            y1={ty - 14}
            x2={tx + 10}
            y2={ty + 14}
            stroke={MP.line}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={seg(0.78 + i * 0.05, 0.86 + i * 0.05)}
          />
        ))}
        {/* 前脚・後脚 (関節の丸つき) */}
        {(
          [
            [770, 604, 744, 702, 756, 782, 0.72],
            [1270, 592, 1296, 700, 1284, 782, 0.84],
          ] as const
        ).map(([x1, y1, x2, y2, x3, y3, at], i) => (
          <g key={i} opacity={seg(at, at + 0.1)}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MP.line} strokeWidth={8} strokeLinecap="round" />
            <line x1={x2} y1={y2} x2={x3} y2={y3} stroke={MP.line} strokeWidth={7} strokeLinecap="round" />
            <line x1={x3 - 16} y1={y3} x2={x3 + 34} y2={y3} stroke={MP.line} strokeWidth={7} strokeLinecap="round" />
            <circle cx={x1} cy={y1} r={9} fill={MP.background} stroke={MP.line} strokeWidth={5} />
            <circle cx={x2} cy={y2} r={8} fill={MP.background} stroke={MP.line} strokeWidth={5} />
          </g>
        ))}
        {/* 地面のライン */}
        <line x1={560} x2={1560} y1={800} y2={800} stroke={MP.faint} strokeWidth={3} strokeDasharray="12 10" />
      </svg>
    </Frame>
  );
};

// 図解: 地表の骨は朽ちて消え、泥に埋まった骨だけが残る
const FossilizeScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [30, 80], [1, 0.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markIn = interpolate(frame, [78, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const layerColors = ["#2A3346", "#233049", "#1C2638"];
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 仕切り */}
        <line x1={960} x2={960} y1={240} y2={790} stroke={MP.faint} strokeWidth={3} strokeDasharray="10 12" />
        {/* 左: 地表に置かれた骨 → 朽ちて消える */}
        <SmallLabel x={480} y={276} text="地表に出たまま" color={MP.ink} size={38} />
        <rect x={100} y={640} width={760} height={180} fill="#151B27" stroke="none" />
        <line x1={100} x2={860} y1={640} y2={640} stroke={MP.line} strokeWidth={5} />
        <LongBone x={480} y={608} rotate={-8} color={MP.line} opacity={fadeOut} />
        {/* 朽ちるチリ */}
        {Array.from({ length: 6 }, (_, i) => {
          const t = ((frame * 3 + i * 29) % 50) / 50;
          return (
            <circle
              key={i}
              cx={420 + i * 26}
              cy={600 - t * 60}
              r={3}
              fill={MP.faint}
              opacity={(1 - t) * (1 - fadeOut) * 0.8}
            />
          );
        })}
        <g opacity={markIn} stroke={MP.faint} strokeWidth={9} strokeLinecap="round">
          <line x1={452} y1={400} x2={508} y2={456} />
          <line x1={508} y1={400} x2={452} y2={456} />
        </g>
        <SmallLabel x={480} y={762} text="朽ちて消える" color={MP.faint} size={34} />
        {/* 右: 泥に埋まった骨 → 層が重なって残る */}
        <SmallLabel x={1440} y={276} text="泥に埋まった" color={MP.accentSoft} size={38} />
        <rect x={1060} y={640} width={760} height={180} fill="#272217" stroke="none" />
        <line x1={1060} x2={1820} y1={640} y2={640} stroke={MP.line} strokeWidth={5} />
        {/* 泥の層が上に重なっていく */}
        {layerColors.map((c, k) => {
          const s = spring({ frame: frame - 22 - k * 16, fps, config: { damping: 200 }, durationInFrames: 20 });
          const y = 640 - 56 * (k + 1);
          return (
            <g key={k} opacity={Math.max(s, 0)}>
              <rect x={1060} y={y + (1 - s) * -30} width={760} height={56} fill={c} />
              <line x1={1060} x2={1820} y1={y + (1 - s) * -30} y2={y + (1 - s) * -30} stroke={MP.blueDeep} strokeWidth={2} />
            </g>
          );
        })}
        {/* 埋まった骨 (オレンジで残り続ける) */}
        <LongBone x={1440} y={724} rotate={-8} color={MP.accent} fill="#3A2718" />
        <g opacity={markIn}>
          <circle cx={1440} cy={428} r={30} fill="none" stroke={MP.accent} strokeWidth={8} />
        </g>
        <SmallLabel x={1440} y={790} text="化石として残る" color={MP.accentSoft} size={34} />
      </svg>
      <DiagramTitle text={scene.title ?? "化石になる条件"} />
    </Frame>
  );
};

// 地層の断面。人類の時代は細いオレンジ1本の線
const StrataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [15, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eIn = interpolate(frame, [74, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bands: [number, string][] = [
    [70, "#1B2330"],
    [52, "#242E40"],
    [84, "#161D2A"],
    [60, "#2B3448"],
    [46, "#1E2634"],
    [76, "#232B3B"],
    [58, "#19202E"],
    [88, "#262F42"],
    [64, "#141A26"],
    [80, "#202939"],
  ];
  let y = 150;
  const rects = bands.map(([h, c], i) => {
    const r = <rect key={i} x={0} y={y} width={W} height={h} fill={c} />;
    y += h;
    return r;
  });
  const lineY = 150 + 70 + 52 + 84 + 60 + 46 + 76; // 6本目と7本目の層の境目
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {rects}
        {/* 人類の時代 = 細いオレンジの1本線 (左から走る) */}
        <rect x={0} y={lineY - 7} width={W * p} height={14} fill={MP.accent} opacity={0.22} />
        <rect x={0} y={lineY - 2.5} width={W * p} height={5} fill={MP.accent} />
        {/* 丸で囲んでラベル */}
        <g opacity={eIn}>
          <ellipse cx={1180} cy={lineY} rx={110} ry={48} fill="none" stroke={MP.accentSoft} strokeWidth={5} />
          <line x1={1180} y1={lineY - 48} x2={1180} y2={400} stroke={MP.faint} strokeWidth={3} />
          <text
            x={1180}
            y={372}
            textAnchor="middle"
            fontSize={46}
            fontWeight={700}
            fill={MP.accentSoft}
            fontFamily={MANABI_FONT}
          >
            人類の時代
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// 未来の化石候補: ペットボトルと鶏の骨をオレンジの輪でハイライト
const FutureFossilScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring1 = spring({ frame: frame - 28, fps, config: { damping: 14 } });
  const ring2 = spring({ frame: frame - 52, fps, config: { damping: 14 } });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* ペットボトル (白線画) */}
        <g stroke={MP.line} strokeWidth={6} fill={MP.background} strokeLinejoin="round">
          <rect x={636} y={316} width={48} height={28} rx={6} />
          <path
            d={`M 640 344 L 640 384 C 600 416 585 448 585 490 L 585 692
                Q 585 730 625 730 L 695 730 Q 735 730 735 692 L 735 490
                C 735 448 720 416 680 384 L 680 344 Z`}
          />
        </g>
        {[560, 600, 640].map((ry) => (
          <line key={ry} x1={588} x2={732} y1={ry} y2={ry} stroke={MP.faint} strokeWidth={3} />
        ))}
        <path d="M 600 470 q 0 -36 28 -58" fill="none" stroke={MP.faint} strokeWidth={3} strokeLinecap="round" />
        <SmallLabel x={660} y={792} text="ペットボトル" color={MP.ink} size={36} />
        {/* 鶏の骨 */}
        <LongBone x={1260} y={524} rotate={-24} scale={1.6} color={MP.line} />
        <SmallLabel x={1260} y={792} text="鶏の骨" color={MP.ink} size={36} />
        {/* オレンジの輪で順にハイライト */}
        <g transform="translate(660, 524)" opacity={Math.max(ring1, 0)}>
          <ellipse rx={150 * Math.max(ring1, 0.001)} ry={258 * Math.max(ring1, 0.001)} fill="none" stroke={MP.accent} strokeWidth={6} />
        </g>
        <g transform="translate(1260, 524)" opacity={Math.max(ring2, 0)}>
          <ellipse rx={230 * Math.max(ring2, 0.001)} ry={150 * Math.max(ring2, 0.001)} fill="none" stroke={MP.accent} strokeWidth={6} />
        </g>
      </svg>
      <DiagramTitle text={scene.title ?? "未来の化石の候補"} />
    </Frame>
  );
};

// 月面に残る足跡 (風も雨もない。静かな演出)
const MoonFootprintScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fp = interpolate(frame, [24, 64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 黒い空 */}
        <rect x={0} y={0} width={W} height={H} fill="#05080F" />
        {/* またたく星 */}
        {Array.from({ length: 46 }, (_, i) => {
          const sx = (i * 373 + 60) % 1880;
          const sy = ((i * 211) % 540) + 60;
          const tw = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(frame / 11 + i * 1.7));
          return <circle key={i} cx={sx} cy={sy} r={1.4 + (i % 3)} fill={MP.ink} opacity={tw} />;
        })}
        {/* 遠くの地球 */}
        <g opacity={0.95}>
          <circle cx={1620} cy={190} r={44} fill={MP.blueDeep} stroke={MP.blue} strokeWidth={3} />
          <path d="M 1596 170 q 18 12 40 6 q 14 16 -6 30" fill="none" stroke={MP.blue} strokeWidth={4} strokeLinecap="round" />
        </g>
        {/* 月面の地平線 */}
        <path
          d={`M 0 716 Q 480 664 960 688 Q 1440 710 1920 680 L 1920 1080 L 0 1080 Z`}
          fill="#1C222E"
        />
        <path
          d={`M 0 716 Q 480 664 960 688 Q 1440 710 1920 680`}
          fill="none"
          stroke={MP.line}
          strokeWidth={4}
          opacity={0.8}
        />
        {/* クレーター */}
        <ellipse cx={330} cy={800} rx={74} ry={18} fill="none" stroke="#39414F" strokeWidth={4} />
        <ellipse cx={1500} cy={766} rx={50} ry={13} fill="none" stroke="#39414F" strokeWidth={3} />
        <ellipse cx={1150} cy={892} rx={92} ry={22} fill="none" stroke="#39414F" strokeWidth={4} />
        {/* ブーツの足跡 (オレンジで1つ、静かに浮かぶ) */}
        <ellipse cx={770} cy={756} rx={150} ry={56} fill={MP.accent} opacity={0.07 * fp} />
        <g transform="translate(770, 748) rotate(-18) scale(1.08, 0.62)" opacity={fp}>
          <rect x={-52} y={-128} width={104} height={170} rx={34} fill="rgba(232, 128, 60, 0.12)" stroke={MP.accent} strokeWidth={5} />
          <rect x={-44} y={62} width={88} height={64} rx={22} fill="rgba(232, 128, 60, 0.12)" stroke={MP.accent} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={-38} y={-112 + i * 28} width={76} height={14} rx={7} fill={MP.accent} opacity={0.85} />
          ))}
          <rect x={-30} y={80} width={60} height={14} rx={7} fill={MP.accent} opacity={0.85} />
        </g>
      </svg>
    </Frame>
  );
};

// 都市の断面図: 地下鉄のトンネルに水位が上がっていく (ポンプが止まると水没)
const FloodScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const groundY = 400;
  const tubeX = 300;
  const tubeW = 1320;
  const tubeTop = 560;
  const tubeBottom = 880;
  // 水位が下から上がっていく (ナレーションと同期してゆっくり)
  const rise = interpolate(frame, [18, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const waterY = tubeBottom - 24 - rise * (tubeBottom - tubeTop - 70);
  const wave = (x: number) => 6 * Math.sin(frame / 9 + x / 120);
  const waveD = `M ${tubeX + 10} ${waterY} ${Array.from({ length: 12 }, (_, i) => {
    const wx = tubeX + 10 + ((i + 1) * (tubeW - 20)) / 12;
    return `L ${wx} ${waterY + wave(wx)}`;
  }).join(" ")} L ${tubeX + tubeW - 10} ${tubeBottom - 6} L ${tubeX + 10} ${tubeBottom - 6} Z`;
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 地上: 小さなスカイライン */}
        {(
          [
            [360, 150, 170],
            [560, 120, 230],
            [840, 160, 130],
            [1120, 130, 210],
            [1380, 150, 160],
          ] as const
        ).map(([bx, bw, bh], i) => (
          <rect
            key={i}
            x={bx}
            y={groundY - bh}
            width={bw}
            height={bh}
            fill={MP.background}
            stroke={MP.line}
            strokeWidth={4}
          />
        ))}
        {/* 地面と地下の土 */}
        <rect x={0} y={groundY} width={W} height={H - groundY} fill="#151B27" />
        <line x1={0} x2={W} y1={groundY} y2={groundY} stroke={MP.line} strokeWidth={5} />
        {/* 地上への階段 (水の入り口) */}
        <g stroke={MP.line} strokeWidth={4} fill="none">
          <path d={`M 1500 ${groundY} l 0 40 l 40 0 l 0 40 l 40 0 l 0 46 l 40 0`} />
        </g>
        {/* 地下鉄のトンネル */}
        <rect
          x={tubeX}
          y={tubeTop}
          width={tubeW}
          height={tubeBottom - tubeTop}
          rx={46}
          fill={MP.deep}
          stroke={MP.line}
          strokeWidth={6}
        />
        {/* 電車 (白線画) */}
        <g stroke={MP.line} strokeWidth={5} fill={MP.panel}>
          <rect x={430} y={640} width={520} height={170} rx={26} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={470 + i * 120} y={676} width={76} height={56} fill={MP.deep} strokeWidth={3} />
          ))}
          <circle cx={520} cy={818} r={20} fill={MP.deep} />
          <circle cx={860} cy={818} r={20} fill={MP.deep} />
        </g>
        {/* 水 (下から静かに満ちる) */}
        <path d={waveD} fill={MP.blueDeep} opacity={0.72} />
        <path
          d={`M ${tubeX + 10} ${waterY} ${Array.from({ length: 12 }, (_, i) => {
            const wx = tubeX + 10 + ((i + 1) * (tubeW - 20)) / 12;
            return `L ${wx} ${waterY + wave(wx)}`;
          }).join(" ")}`}
          fill="none"
          stroke={MP.blueLight}
          strokeWidth={4}
        />
        {/* 階段から流れ込む水 */}
        <path
          d={`M 1504 ${groundY + 4} l 0 44 l 40 0 l 0 44 l 40 0 l 0 40`}
          fill="none"
          stroke={MP.blueLight}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="16 14"
          strokeDashoffset={-frame * 2.2}
          opacity={0.8}
        />
        {/* 止まったポンプ */}
        <g opacity={0.9}>
          <circle cx={1450} cy={760} r={34} fill={MP.panel} stroke={MP.line} strokeWidth={5} />
          <line x1={1428} y1={738} x2={1472} y2={782} stroke={MP.blueLight} strokeWidth={6} strokeLinecap="round" />
          <SmallLabel x={1450} y={846} text="ポンプ停止" color={MP.blueLight} size={28} />
        </g>
        <SmallLabel x={660} y={530} text="地下鉄のトンネル" color={MP.faint} size={32} />
      </svg>
      <DiagramTitle text={scene.title ?? "人がいなくなった都市の地下"} />
    </Frame>
  );
};

// ゴミ処分場の断面 = 未来の遺跡。埋まった人工物をオレンジの輪でハイライト
const TrashLayerScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surfaceY = 420;
  // ゴミの層が下から順に積み重なって見えてくる
  const layers: [number, string][] = [
    [820, "#2A3346"],
    [700, "#232C3E"],
    [580, "#1C2534"],
  ];
  const ringAt = [52, 68, 84];
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 地表 (草がすこし生えた丘) */}
        <path
          d={`M 0 ${surfaceY + 40} Q 480 ${surfaceY - 40} 960 ${surfaceY} Q 1440 ${surfaceY + 30} 1920 ${surfaceY - 10} L 1920 0 L 0 0 Z`}
          fill={MP.background}
        />
        <path
          d={`M 0 ${surfaceY + 40} Q 480 ${surfaceY - 40} 960 ${surfaceY} Q 1440 ${surfaceY + 30} 1920 ${surfaceY - 10}`}
          fill="none"
          stroke={MP.line}
          strokeWidth={5}
        />
        {[300, 700, 1200, 1650].map((gx, i) => (
          <g key={i} transform={`translate(${gx}, ${surfaceY - 10 - (i % 2) * 16})`} stroke={MP.green} strokeWidth={4} fill="none" strokeLinecap="round">
            <line x1={0} y1={0} x2={-6} y2={-28} />
            <line x1={8} y1={0} x2={8} y2={-34} />
            <line x1={16} y1={0} x2={22} y2={-24} />
          </g>
        ))}
        {/* 土 */}
        <rect x={0} y={surfaceY + 30} width={W} height={H - surfaceY} fill="#151B27" />
        {/* ゴミの層 (下から順に現れる) */}
        {layers.map(([y, c], k) => {
          const s = spring({ frame: frame - 8 - k * 14, fps, config: { damping: 200 }, durationInFrames: 18 });
          return (
            <g key={k} opacity={Math.max(s, 0)}>
              <rect x={160} y={y} width={1600} height={110} rx={14} fill={c} />
              <line x1={160} x2={1760} y1={y} y2={y} stroke={MP.blueDeep} strokeWidth={3} />
            </g>
          );
        })}
        {/* 埋まっている人工物 (白線画) */}
        {/* ペットボトル (小) */}
        <g transform="translate(480, 750) rotate(18) scale(0.55)" stroke={MP.line} strokeWidth={7} fill="none" strokeLinejoin="round">
          <rect x={-28} y={-150} width={56} height={26} rx={7} />
          <path d="M -24 -124 L -24 -96 C -58 -70 -70 -42 -70 -6 L -70 110 Q -70 142 -36 142 L 36 142 Q 70 142 70 110 L 70 -6 C 70 -42 58 -70 24 -96 L 24 -124 Z" />
        </g>
        {/* 鶏の骨 */}
        <LongBone x={1050} y={740} rotate={-18} scale={0.8} color={MP.line} fill="none" />
        {/* 陶器の茶わん */}
        <g transform="translate(1480, 640)" stroke={MP.line} strokeWidth={6} fill="none">
          <path d="M -90 -20 Q -80 60 0 60 Q 80 60 90 -20 Z" />
          <ellipse cx={0} cy={-20} rx={90} ry={18} />
        </g>
        {/* オレンジの輪で順にハイライト */}
        {(
          [
            [480, 745, 130, 110],
            [1050, 740, 130, 80],
            [1480, 660, 140, 90],
          ] as const
        ).map(([cx, cy, rx, ry], i) => {
          const s = spring({ frame: frame - ringAt[i], fps, config: { damping: 14 } });
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={rx * Math.max(s, 0.001)}
              ry={ry * Math.max(s, 0.001)}
              fill="none"
              stroke={MP.accent}
              strokeWidth={6}
              opacity={Math.max(s, 0)}
            />
          );
        })}
        <SmallLabel x={960} y={530} text="ゴミ処分場 = すぐ埋まり、酸素に触れない" color={MP.accentSoft} size={34} />
      </svg>
      <DiagramTitle text={scene.title ?? "未来の遺跡になる場所"} />
    </Frame>
  );
};

// 年表: 数十年→数百年→数千年→1万年。左から目盛りが伸びる
const TimelineScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const axisY = 600;
  const x0 = 240;
  const x1 = 1680;
  const p = interpolate(frame, [10, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headX = x0 + (x1 - x0) * p;
  const defaults = [
    { time: "数十年", note: "木造が朽ちる" },
    { time: "数百年", note: "鉄が錆びる" },
    { time: "数千年", note: "コンクリートが砕ける" },
    { time: "1万年", note: "都市は地形に還る" },
  ];
  // items があれば注釈を差し替える (label = 注釈)
  const marks = defaults.map((d, i) => ({
    ...d,
    note: scene.items?.[i]?.label ?? d.note,
    x: x0 + ((x1 - x0) * (i + 1)) / 4.3,
  }));
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 軸 (左から伸びる) */}
        <line x1={x0} y1={axisY} x2={headX} y2={axisY} stroke={MP.line} strokeWidth={6} strokeLinecap="round" />
        {p > 0.98 && <path d={`M ${x1 + 26} ${axisY} l -24 -13 v 26 Z`} fill={MP.line} />}
        <SmallLabel x={x0} y={axisY + 64} text="今" color={MP.ink} size={34} />
        <circle cx={x0} cy={axisY} r={11} fill={MP.ink} />
        {marks.map((m, i) => {
          const reached = headX >= m.x;
          const o = interpolate(headX, [m.x - 30, m.x + 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const last = i === marks.length - 1;
          const c = last ? MP.accent : MP.line;
          return (
            <g key={i} opacity={o}>
              <line x1={m.x} y1={axisY - 22} x2={m.x} y2={axisY + 22} stroke={c} strokeWidth={last ? 7 : 5} />
              <text
                x={m.x}
                y={axisY + 72}
                textAnchor="middle"
                fontSize={last ? 46 : 40}
                fontWeight={700}
                fill={last ? MP.accentSoft : MP.ink}
                fontFamily={MANABI_FONT}
              >
                {m.time}
              </text>
              {/* 注釈 (目盛りの上、字幕と重ならない高さ) */}
              <line x1={m.x} y1={axisY - 22} x2={m.x} y2={axisY - 88 - (i % 2) * 70} stroke={MP.faint} strokeWidth={2.5} opacity={reached ? 0.8 : 0} />
              <SmallLabel x={m.x} y={axisY - 104 - (i % 2) * 70} text={m.note} color={last ? MP.accentSoft : MP.faint} size={30} />
            </g>
          );
        })}
      </svg>
      <DiagramTitle text={scene.title ?? "痕跡が消えていく時間"} />
    </Frame>
  );
};

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
  // 章扉カードは「第N章 + 章タイトル」だけを静かに見せる (字幕も重ねない)
  if (scene.motif === "chapter") return true;
  // クイズ出題カードは出題文をそのまま大きく見せる (字幕も重ねない)
  if (scene.motif === "quiz") return true;
  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  if (hl && text.includes(hl) && text.length <= 52) return true;
  return !hl && text.length <= 52;
};

// 章扉カード: 濃紺の背景にオレンジの細線 +「第1章」+ 章タイトル。静かに1秒でフェードイン
const CHAPTER_NUM_RE = /第[0-9０-９一二三四五六七八九十]+章/;
const ChapterCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" });
  // 章番号は title か本文から拾う
  const num =
    scene.title?.match(CHAPTER_NUM_RE)?.[0] ?? scene.text.match(CHAPTER_NUM_RE)?.[0] ?? "";
  // 章タイトル: title (章番号を除く) が最優先。無ければ本文の前置き・章番号・結びを削って導く
  let titleText = (scene.title ?? "").replace(CHAPTER_NUM_RE, "").replace(/^[、。:：\s]+/, "").trim();
  if (!titleText) {
    titleText = scene.text
      .replace(/^(まず|第一に|ここからは|次は|次に|続いて|最後に|さて|それでは)[、\s]*/, "")
      .replace(CHAPTER_NUM_RE, "")
      .replace(/^[はもで]?[、\s]*/, "")
      .replace(/(から|を)?見て(いき|み)ましょう[。]?$/, "")
      .replace(/(の話|のお話)です[。]?$/, "")
      .replace(/について考えます[。]?$/, "")
      .replace(/です[。]?$/, "")
      .replace(/[。]$/, "")
      .trim();
  }
  return (
    <Frame>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fade }}>
        <div style={{ width: 170, height: 3, background: MP.accent, borderRadius: 2 }} />
        {num && (
          <div
            style={{
              fontFamily: MANABI_SERIF,
              fontSize: 46,
              color: MP.accent,
              letterSpacing: 12,
              marginTop: 44,
            }}
          >
            {num}
          </div>
        )}
        <div
          style={{
            fontFamily: MANABI_SERIF,
            fontSize: 78,
            fontWeight: 600,
            color: MP.ink,
            letterSpacing: 6,
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 1500,
            marginTop: num ? 30 : 48,
          }}
        >
          {wrapJa(titleText)}
        </div>
        <div style={{ width: 170, height: 3, background: MP.accent, borderRadius: 2, marginTop: 52 }} />
      </AbsoluteFill>
    </Frame>
  );
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
          {/* 文節単位で折り返す (全作風共通ルール: wrapJa)。強調語は途中で割れない */}
          {useFull && hl ? wrapJa(text, hl, { color: MP.accent }) : wrapJa(String(display))}
        </div>
        <div style={{ width: 64, height: 4, background: MP.accent, marginTop: 56, borderRadius: 2 }} />
      </AbsoluteFill>
    </Frame>
  );
};

// ===== 睡眠テーマの画面 =====

// クイズ出題カード: 小さなQの輪+出題文だけ。大人向けに演出は控えめ (静かにフェードイン)
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
            border: `3px solid ${MP.accent}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: MANABI_SERIF,
            fontSize: 44,
            color: MP.accent,
          }}
        >
          Q
        </div>
        <div
          style={{
            fontFamily: MANABI_SERIF,
            fontSize: 64,
            fontWeight: 600,
            color: MP.ink,
            letterSpacing: 4,
            textAlign: "center",
            lineHeight: 1.7,
            maxWidth: 1460,
            marginTop: 48,
          }}
        >
          {wrapJa(text)}
        </div>
        <div style={{ width: 64, height: 3, background: MP.accent, marginTop: 48, borderRadius: 2 }} />
      </AbsoluteFill>
    </Frame>
  );
};

// 一晩の眠りの波: 深い眠りから始まり、明け方ほどレム (浅い) が増える90分周期のグラフ
const SleepWaveScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const ox = 380;
  const oy = 760;
  const topY = 240;
  const rightX = 1580;
  const p = interpolate(frame, [12, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wave =
    "M 420 330 C 460 520 480 680 560 690 C 640 700 660 420 700 350 " +
    "C 740 470 760 640 830 660 C 900 680 920 400 960 330 " +
    "C 1000 440 1020 580 1090 600 C 1160 620 1180 380 1220 320 " +
    "C 1260 400 1280 500 1340 520 C 1400 540 1420 350 1460 300 L 1545 298";
  const dash = 3600;
  // レム睡眠の帯 (明け方ほど長い)。線の進みに合わせて順に灯る
  const rems = [
    { x: 682, w: 34, y: 338 },
    { x: 940, w: 48, y: 320 },
    { x: 1198, w: 64, y: 310 },
    { x: 1438, w: 110, y: 290 },
  ];
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <line x1={ox} y1={oy} x2={rightX} y2={oy} stroke={MP.line} strokeWidth={5} />
        <line x1={ox} y1={oy} x2={ox} y2={topY} stroke={MP.line} strokeWidth={5} />
        <path d={`M ${rightX} ${oy} l -20 -11 v 22 Z`} fill={MP.line} />
        <text x={ox - 30} y={300} textAnchor="end" fontSize={32} fill={MP.faint} fontFamily={MANABI_FONT}>
          浅い
        </text>
        <text x={ox - 30} y={720} textAnchor="end" fontSize={32} fill={MP.faint} fontFamily={MANABI_FONT}>
          深い
        </text>
        <text x={ox + 40} y={oy + 52} fontSize={32} fill={MP.faint} fontFamily={MANABI_FONT}>
          就寝
        </text>
        <text x={rightX - 10} y={oy + 52} textAnchor="end" fontSize={32} fill={MP.faint} fontFamily={MANABI_FONT}>
          起床 →
        </text>
        {/* 眠りの波 (左から描く) */}
        <path
          d={wave}
          fill="none"
          stroke={MP.blueLight}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={dash}
          strokeDashoffset={(1 - p) * dash}
        />
        {/* レム睡眠の帯 */}
        {rems.map((r, i) => (
          <g key={i} opacity={interpolate(p, [0.2 + i * 0.2, 0.3 + i * 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
            <line x1={r.x} y1={r.y - 22} x2={r.x + r.w} y2={r.y - 22} stroke={MP.accent} strokeWidth={10} strokeLinecap="round" />
          </g>
        ))}
        <g opacity={interpolate(p, [0.35, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
          <text x={1180} y={240} fontSize={36} fontWeight={700} fill={MP.accent} fontFamily={MANABI_FONT}>
            レム睡眠 (浅い)
          </text>
          <text x={500} y={640} fontSize={36} fontWeight={700} fill={MP.blueLight} fontFamily={MANABI_FONT}>
            ノンレム睡眠 (深い)
          </text>
        </g>
        {/* 約90分のひと周期 */}
        <g opacity={interpolate(p, [0.25, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
          <path d="M 420 826 v 14 h 280 v -14" fill="none" stroke={MP.faint} strokeWidth={4} />
          <text x={560} y={880} textAnchor="middle" fontSize={32} fill={MP.ink} fontFamily={MANABI_FONT}>
            約90分でひと周期
          </text>
        </g>
      </svg>
      <DiagramTitle text={scene.title ?? "一晩の眠りの波"} />
    </Frame>
  );
};

// 脳の側面図のりんかく (dream_brain / brain_wash で共用)
const BRAIN_PATH =
  "M 700 640 C 550 610 470 500 495 395 C 520 295 650 225 830 210 " +
  "C 1030 193 1250 245 1340 380 C 1405 480 1385 585 1285 648 " +
  "C 1205 697 1075 710 975 698 C 935 726 895 745 858 738 " +
  "C 838 734 846 706 858 690 C 800 678 745 662 700 640 Z";

// 夢を見る脳: 視覚野・扁桃体はオレンジに灯り、前頭前野 (理性) だけお休み
const DreamBrainScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const pulse = (ph: number) => 0.5 + 0.3 * Math.sin(frame / 8 + ph);
  const labelIn = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <path d={BRAIN_PATH} fill={MP.panel} stroke={MP.line} strokeWidth={6} />
        {/* 前頭前野: 休止中 (点線・薄く) */}
        <circle cx={610} cy={410} r={95} fill="none" stroke={MP.faint} strokeWidth={5} strokeDasharray="14 12" />
        <text x={610} y={400} textAnchor="middle" fontSize={30} fill={MP.faint} fontFamily={MANABI_FONT}>
          z z
        </text>
        <text x={610} y={444} textAnchor="middle" fontSize={26} fill={MP.faint} fontFamily={MANABI_FONT}>
          休止中
        </text>
        {/* 視覚野: 映像の処理 (強く灯る) */}
        <circle cx={1250} cy={490} r={88} fill={MP.accent} opacity={0.14 + 0.1 * Math.sin(frame / 8)} />
        <circle cx={1250} cy={490} r={88} fill="none" stroke={MP.accent} strokeWidth={6} opacity={pulse(0)} />
        {/* 扁桃体: 感情 (小さく強く灯る) */}
        <circle cx={930} cy={555} r={48} fill={MP.accent} opacity={0.16 + 0.1 * Math.sin(frame / 8 + 2)} />
        <circle cx={930} cy={555} r={48} fill="none" stroke={MP.accent} strokeWidth={6} opacity={pulse(2)} />
        {/* ラベル */}
        <g opacity={labelIn}>
          <line x1={470} y1={262} x2={575} y2={338} stroke={MP.faint} strokeWidth={3} />
          <text x={440} y={240} textAnchor="middle" fontSize={34} fontWeight={700} fill={MP.ink} fontFamily={MANABI_FONT}>
            前頭前野
          </text>
          <text x={440} y={284} textAnchor="middle" fontSize={27} fill={MP.faint} fontFamily={MANABI_FONT}>
            論理・判断
          </text>
          <line x1={1480} y1={282} x2={1310} y2={430} stroke={MP.faint} strokeWidth={3} />
          <text x={1530} y={250} textAnchor="middle" fontSize={34} fontWeight={700} fill={MP.accent} fontFamily={MANABI_FONT}>
            視覚野
          </text>
          <text x={1530} y={294} textAnchor="middle" fontSize={27} fill={MP.faint} fontFamily={MANABI_FONT}>
            映像の処理
          </text>
          <line x1={880} y1={790} x2={922} y2={610} stroke={MP.faint} strokeWidth={3} />
          <text x={850} y={830} textAnchor="middle" fontSize={34} fontWeight={700} fill={MP.accent} fontFamily={MANABI_FONT}>
            扁桃体
          </text>
          <text x={1010} y={830} fontSize={27} fill={MP.faint} fontFamily={MANABI_FONT}>
            感情
          </text>
        </g>
      </svg>
      <DiagramTitle text={scene.title ?? "夢を見ている脳"} />
    </Frame>
  );
};

// 体が動かない仕組み: 夢の中は走っていても、指令は脳幹でせき止められる
const BodyLockScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const blockIn = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelIn = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 夢の吹き出し: 走っている人 */}
        <circle cx={560} cy={568} r={8} fill="none" stroke={MP.faint} strokeWidth={4} />
        <circle cx={592} cy={520} r={13} fill="none" stroke={MP.faint} strokeWidth={4} />
        <ellipse cx={740} cy={370} rx={200} ry={120} fill="none" stroke={MP.line} strokeWidth={5} />
        <g stroke={MP.accent} strokeWidth={7} fill="none" strokeLinecap="round">
          <circle cx={720} cy={310} r={24} />
          <path d="M 720 334 L 712 400 M 712 400 L 660 440 M 712 400 L 768 444 M 716 356 L 660 380 M 716 356 L 778 352" />
        </g>
        <text x={1030} y={330} fontSize={27} fill={MP.faint} fontFamily={MANABI_FONT}>
          夢の中では走っている
        </text>
        {/* ベッドと眠る人 */}
        <line x1={320} y1={732} x2={1600} y2={732} stroke={MP.line} strokeWidth={6} />
        <circle cx={520} cy={668} r={52} fill={MP.background} stroke={MP.line} strokeWidth={6} />
        <path d="M 580 648 Q 960 586 1380 660 L 1380 730 L 580 730 Z" fill={MP.panel} stroke={MP.line} strokeWidth={6} />
        {/* 指令の線: 脳から体へ → 脳幹 (首) でストップ */}
        <line x1={552} y1={690} x2={618} y2={700} stroke={MP.accentSoft} strokeWidth={7} strokeLinecap="round" />
        <g opacity={blockIn}>
          <circle cx={652} cy={702} r={30} fill={MP.background} stroke={MP.accent} strokeWidth={6} />
          <path d="M 638 688 L 666 716 M 666 688 L 638 716" stroke={MP.accent} strokeWidth={6} strokeLinecap="round" />
        </g>
        <line x1={694} y1={704} x2={1320} y2={704} stroke={MP.faint} strokeWidth={5} strokeDasharray="6 16" opacity={0.6} />
        {/* ラベル */}
        <g opacity={labelIn}>
          <line x1={652} y1={740} x2={652} y2={790} stroke={MP.faint} strokeWidth={3} />
          <text x={652} y={830} textAnchor="middle" fontSize={34} fontWeight={700} fill={MP.accent} fontFamily={MANABI_FONT}>
            脳幹でせき止める
          </text>
          <text x={1180} y={800} textAnchor="middle" fontSize={32} fill={MP.ink} fontFamily={MANABI_FONT}>
            体は動かない
          </text>
        </g>
      </svg>
      <DiagramTitle text={scene.title ?? "体が動かない仕組み"} />
    </Frame>
  );
};

// 記憶の引っ越し: 海馬 (一時保管庫) → 大脳皮質 (長期保管庫)
const MemoryTransferScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const dots = [0, 1, 2, 3, 4];
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 海馬 */}
        <rect x={300} y={330} width={360} height={320} rx={16} fill="none" stroke={MP.line} strokeWidth={6} />
        <text x={480} y={400} textAnchor="middle" fontSize={40} fontWeight={700} fill={MP.ink} fontFamily={MANABI_FONT}>
          海馬
        </text>
        <text x={480} y={446} textAnchor="middle" fontSize={27} fill={MP.faint} fontFamily={MANABI_FONT}>
          一時保管庫
        </text>
        {/* 大脳皮質 */}
        <rect x={1140} y={270} width={480} height={420} rx={16} fill="none" stroke={MP.line} strokeWidth={6} />
        <text x={1380} y={344} textAnchor="middle" fontSize={40} fontWeight={700} fill={MP.ink} fontFamily={MANABI_FONT}>
          大脳皮質
        </text>
        <text x={1380} y={390} textAnchor="middle" fontSize={27} fill={MP.faint} fontFamily={MANABI_FONT}>
          長期保管庫
        </text>
        {/* 矢印 */}
        <line x1={690} y1={500} x2={1090} y2={500} stroke={MP.line} strokeWidth={6} />
        <path d="M 1110 500 l -26 -14 v 28 Z" fill={MP.line} />
        {/* ゆったりした脳波 */}
        <path
          d="M 700 600 q 50 -36 100 0 t 100 0 t 100 0 t 100 0"
          fill="none"
          stroke={MP.blueLight}
          strokeWidth={5}
          strokeDasharray="18 14"
          strokeDashoffset={-frame * 1.6}
          opacity={0.8}
        />
        <text x={900} y={668} textAnchor="middle" fontSize={27} fill={MP.faint} fontFamily={MANABI_FONT}>
          大きくゆったりした脳波に乗せて
        </text>
        {/* 記憶の粒が移っていく */}
        {dots.map((i) => {
          const t = interpolate(frame - 14 - i * 16, [0, 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const sx = 470 + (i % 2) * 70;
          const sy = 490 + (i % 3) * 44;
          const ex = 1250 + (i % 3) * 110;
          const ey = 460 + Math.floor(i / 3) * 110;
          const x = sx + (ex - sx) * t;
          const y = sy + (ey - sy) * t - Math.sin(t * Math.PI) * 70;
          return (
            <rect key={i} x={x - 13} y={y - 13} width={26} height={26} rx={5} fill={MP.accentSoft} opacity={0.95} />
          );
        })}
      </svg>
      <DiagramTitle text={scene.title ?? "記憶の引っ越し"} />
    </Frame>
  );
};

// 記憶の選別 (剪定): 大事なつながりは太く、使わないつながりは消える
const PruningScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [24, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nodes: [number, number][] = [
    [520, 330], [840, 260], [1220, 310], [1470, 430],
    [1300, 660], [900, 710], [560, 630], [1050, 480],
  ];
  const strong: [number, number][] = [[0, 7], [7, 2], [7, 4]];
  const weak: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [1, 7], [5, 7]];
  const labelIn = interpolate(p, [0.6, 1], [0, 1]);
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {weak.map(([a, b], i) => (
          <line
            key={`w${i}`}
            x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
            stroke={MP.faint}
            strokeWidth={3}
            opacity={1 - p * 0.9}
          />
        ))}
        {strong.map(([a, b], i) => (
          <line
            key={`s${i}`}
            x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
            stroke={MP.accent}
            strokeWidth={3 + p * 6}
            strokeLinecap="round"
          />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={17} fill={MP.background} stroke={MP.line} strokeWidth={5} />
        ))}
        <g opacity={labelIn}>
          <text x={1480} y={280} textAnchor="middle" fontSize={32} fontWeight={700} fill={MP.accent} fontFamily={MANABI_FONT}>
            大事なつながりは強く
          </text>
          <text x={520} y={810} fontSize={32} fill={MP.faint} fontFamily={MANABI_FONT}>
            使わないつながりは消えていく
          </text>
        </g>
      </svg>
      <DiagramTitle text={scene.title ?? "記憶の選別"} />
    </Frame>
  );
};

// 眠る脳の洗浄: 脳脊髄液が細胞のすき間を流れ、老廃物を洗い流す
const BrainWashScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const labelIn = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flows = [
    "M 560 420 C 700 330 900 330 1040 400 C 1140 450 1230 520 1310 575",
    "M 580 520 C 760 610 980 630 1180 585 C 1240 570 1290 590 1330 620",
    "M 690 300 C 850 258 1050 268 1200 330",
  ];
  const cells: [number, number, number][] = [
    [660, 470, 52], [900, 350, 46], [1150, 470, 52], [880, 600, 44],
  ];
  // 老廃物の粒: 左から右下の出口へ流れて消える
  const waste = [0, 1, 2, 3, 4];
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <path d={BRAIN_PATH} fill={MP.panel} stroke={MP.line} strokeWidth={6} />
        {cells.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={MP.background} stroke={MP.faint} strokeWidth={4} />
        ))}
        {/* 流れる脳脊髄液 */}
        {flows.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={MP.blueLight}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="26 20"
            strokeDashoffset={-frame * 2.4 - i * 15}
            opacity={0.85}
          />
        ))}
        {/* 老廃物が流されていく */}
        {waste.map((i) => {
          const t = ((frame * 0.012 + i * 0.21) % 1);
          const x = 600 + (1330 - 600) * t;
          const y = 430 + (610 - 430) * t + Math.sin(t * 6 + i) * 26;
          const o = t < 0.1 ? t * 10 : t > 0.85 ? (1 - t) * 6.7 : 1;
          return <circle key={i} cx={x} cy={y} r={11} fill={MP.rust} opacity={o * 0.9} />;
        })}
        {/* 出口の矢印 */}
        <line x1={1330} y1={620} x2={1440} y2={690} stroke={MP.blueLight} strokeWidth={5} opacity={0.7} />
        <path d="M 1452 698 l -30 -4 l 14 -24 Z" fill={MP.blueLight} opacity={0.7} />
        <g opacity={labelIn}>
          <line x1={1500} y1={282} x2={1255} y2={360} stroke={MP.faint} strokeWidth={3} />
          <text x={1545} y={250} textAnchor="middle" fontSize={34} fontWeight={700} fill={MP.blueLight} fontFamily={MANABI_FONT}>
            脳脊髄液
          </text>
          <text x={1545} y={294} textAnchor="middle" fontSize={27} fill={MP.faint} fontFamily={MANABI_FONT}>
            すき間を流れる
          </text>
          <text x={480} y={810} fontSize={32} fontWeight={700} fill={MP.rust} fontFamily={MANABI_FONT}>
            ● 老廃物
          </text>
          <text x={640} y={810} fontSize={32} fill={MP.ink} fontFamily={MANABI_FONT}>
            を洗い流す
          </text>
        </g>
      </svg>
      <DiagramTitle text={scene.title ?? "眠る脳の洗浄"} />
    </Frame>
  );
};

// 夜、眠る人: 月と星とベッド (静かな場面)
const SleepingScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* 月 (三日月) */}
        <path d="M 1480 180 A 92 92 0 1 0 1480 344 A 72 72 0 1 1 1480 180 Z" fill={MP.ink} opacity={0.85} />
        {/* 星 */}
        {[[1240, 220], [1650, 420], [1330, 460], [320, 260]].map(([x, y], i) => (
          <g key={i} opacity={0.4 + 0.4 * Math.abs(Math.sin(frame / 22 + i * 1.6))} stroke={MP.faint} strokeWidth={3} strokeLinecap="round">
            <line x1={x - 12} y1={y} x2={x + 12} y2={y} />
            <line x1={x} y1={y - 12} x2={x} y2={y + 12} />
          </g>
        ))}
        {/* Zzz */}
        {[0, 1, 2].map((i) => (
          <text
            key={i}
            x={700 + i * 66}
            y={500 - i * 72}
            fontSize={34 + i * 14}
            fill={MP.blueLight}
            fontFamily={MANABI_FONT}
            opacity={0.25 + 0.55 * Math.abs(Math.sin(frame / 26 + i * 0.9))}
          >
            Z
          </text>
        ))}
        {/* ベッド */}
        <rect x={470} y={560} width={28} height={190} fill={MP.background} stroke={MP.line} strokeWidth={6} />
        <line x1={420} y1={752} x2={1500} y2={752} stroke={MP.line} strokeWidth={6} />
        <rect x={498} y={648} width={880} height={56} rx={12} fill={MP.panel} stroke={MP.line} strokeWidth={6} />
        <rect x={524} y={614} width={150} height={40} rx={14} fill={MP.background} stroke={MP.line} strokeWidth={5} />
        <circle cx={600} cy={602} r={44} fill={MP.background} stroke={MP.line} strokeWidth={6} />
        <path d="M 660 590 Q 980 540 1350 620 L 1350 650 L 660 650 Z" fill={MP.panel} stroke={MP.line} strokeWidth={6} />
      </svg>
    </Frame>
  );
};

// 睡眠テーマのmotif名のゆらぎを吸収して代表名に寄せる
const resolveSleepMotif = (m: string): string | undefined => {
  if (/sleep_wave|hypnogram|cycle|rem|wave/.test(m)) return "sleep_wave";
  if (/dream|amygdala|visual|prefrontal|brain_region|brain_map/.test(m)) return "dream_brain";
  if (/lock|paralysis|atonia|kanashibari|brainstem|freeze/.test(m)) return "body_lock";
  if (/memory|hippocamp|cortex|transfer|consolidat/.test(m)) return "memory_transfer";
  if (/prun|synap|trim/.test(m)) return "pruning";
  if (/wash|glymph|clean|csf|waste|amyloid|fluid/.test(m)) return "brain_wash";
  if (/sleep|bed|night|zzz/.test(m)) return "sleeping";
  return undefined;
};

// ===== 入口: シーンの型と題材で描き分ける =====

// 人類の痕跡テーマのmotif名のゆらぎを吸収して代表名に寄せる
// (例: "city_vanish"→city、"rust"→decay、"moon"/"footprint"→moon_footprint、
//  "fossil" 単体は fossilize に、"bone"/"skeleton" は dinosaur に)
const resolveTraceMotif = (m: string): string | undefined => {
  if (/future_fossil|plastic|bottle|chicken/.test(m)) return "future_fossil";
  if (/moon|footprint|lunar/.test(m)) return "moon_footprint";
  if (/trash|landfill|garbage|dump|waste/.test(m)) return "trash_layer"; // "trash_layer" は strata より先に
  if (/flood|submerg|underwater|subway|metro/.test(m)) return "flood";
  if (/timeline|chronolog|countup/.test(m)) return "timeline";
  if (/strata|stratum|layer/.test(m)) return "strata";
  if (/fossil|sediment|buri|bury|mud/.test(m)) return "fossilize";
  if (/dino|rex|skeleton|bone/.test(m)) return "dinosaur";
  if (/decay|rust|crumble|erosion|sand/.test(m)) return "decay";
  if (/ruin|overgrow|vine|plant/.test(m)) return "ruin";
  if (/city|skyline|vanish/.test(m)) return "city";
  return undefined;
};

export const ManabiSceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  if (scene.image && scene.type !== "card") {
    return <ImageScene scene={scene} />;
  }
  if (scene.isEnding) return <ManabiCardScene scene={scene} />;

  const m = scene.motif;
  // 題材 (motif) を型より優先して拾う。AIが type を diagram/object で揺らしても専用の絵が出るように
  if (scene.type !== "card" && scene.type !== "chart") {
    if (m === "thermometer") return <ThermometerScene scene={scene} />;
    if (m === "doorknob" || m === "touch_metal") return <TouchScene scene={scene} material="metal" />;
    if (m === "wood" || m === "touch_wood") return <TouchScene scene={scene} material="wood" />;
    if (m === "hand") return <HandWarmScene />;
    if (m === "question") return <QuestionScene />;
    if (m === "bathroom") return <BathroomScene />;
    // 人類の痕跡テーマ (名前のゆらぎも resolveTraceMotif で吸収)
    const trace = resolveTraceMotif(m ?? "");
    if (trace === "city") return <CityVanishScene />;
    if (trace === "ruin") return <RuinScene />;
    if (trace === "decay") return <DecayScene />;
    if (trace === "dinosaur") return <DinosaurScene />;
    if (trace === "fossilize") return <FossilizeScene scene={scene} />;
    if (trace === "strata") return <StrataScene />;
    if (trace === "future_fossil") return <FutureFossilScene scene={scene} />;
    if (trace === "moon_footprint") return <MoonFootprintScene />;
    if (trace === "flood") return <FloodScene scene={scene} />;
    if (trace === "trash_layer") return <TrashLayerScene scene={scene} />;
    if (trace === "timeline") return <TimelineScene scene={scene} />;
    // 睡眠テーマ (名前のゆらぎも resolveSleepMotif で吸収)
    const sleep = resolveSleepMotif(m ?? "");
    if (sleep === "sleep_wave") return <SleepWaveScene scene={scene} />;
    if (sleep === "dream_brain") return <DreamBrainScene scene={scene} />;
    if (sleep === "body_lock") return <BodyLockScene scene={scene} />;
    if (sleep === "memory_transfer") return <MemoryTransferScene scene={scene} />;
    if (sleep === "pruning") return <PruningScene scene={scene} />;
    if (sleep === "brain_wash") return <BrainWashScene scene={scene} />;
    if (sleep === "sleeping") return <SleepingScene />;
  }
  switch (scene.type) {
    case "card":
      // 章扉カード (motif=chapter) は専用の静かな画面
      if (m === "chapter") return <ChapterCardScene scene={scene} />;
      // クイズ出題カード (motif=quiz) は控えめな出題画面
      if (m === "quiz") return <QuizCardScene scene={scene} />;
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
