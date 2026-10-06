// kouzou (仕事・組織の構造図解) プリセットの画面一式。
// お手本チャンネルのテイスト分析 (docs/参考チャンネル一覧.md Motocrab 世界構造考察) から:
// 生成り (アイボリー) の紙の背景・黒〜墨のピクトグラムと線・矢印・分岐図・
// 差し色は青緑1色・章と結論だけ濃紺カードに白文字・下端の黒帯に白ゴシック字幕。
// 演出は「線が描かれていく・矢印が伸びる・分岐が順に現れる」静かで知的な動き。
// 1ファイルに全部まとめる (manabi / rekishi の構成を踏襲)。

import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { Scene } from "../../types";
import { KOUZOU_CHANNEL } from "../../channel";
import { ImageScene } from "../scenes/ImageScene";

// 図書館の配色 (KP)
export const KP = {
  paper: "#F2EDE3", // 生成り (絵エリアの背景)
  paperDark: "#E3DCCB", // 紙のわずかなムラ
  ink: "#1E1E1C", // 黒〜墨 (ピクトグラム・線・文字)
  inkSoft: "#5A574F", // 薄い線・補足
  teal: "#2A8C82", // 青緑 (唯一の差し色)
  tealSoft: "#9CC5BF", // 青緑の淡い面
  navy: "#1B2A41", // 濃紺 (章・結論カード)
  white: "#F7F5EF", // カードの白文字
  band: "#101010", // 下端の黒帯 (字幕領域)
} as const;

export const KOUZOU_FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";

const W = 1920;
const H = 1080;
// 下端の黒帯 (字幕領域)。rekishi (20%) より薄め。Video.tsx が参照する
export const KOUZOU_BAND_H = 150;
const ART_H = H - KOUZOU_BAND_H; // 930 (絵エリア)

// ===== 共通の部品 =====

// 下端の黒帯 (字幕は Video.tsx がこの中に白ゴシックで置く)
const Band: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      bottom: 0,
      width: "100%",
      height: KOUZOU_BAND_H,
      backgroundColor: KP.band,
    }}
  />
);

// 画面左上に小さくチャンネル名 (manabi と同じ発想の控えめなヘッダー)
const Header: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 30,
      left: 56,
      fontFamily: KOUZOU_FONT,
      fontSize: 25,
      letterSpacing: 4,
      color: KP.inkSoft,
    }}
  >
    <span style={{ color: KP.teal }}>—</span> {KOUZOU_CHANNEL.name}
  </div>
);

// 絵エリアの土台: 生成りの紙 + わずかなムラ + ヘッダー + 下端の黒帯
const Sheet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: KP.band }}>
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: ART_H,
        backgroundColor: KP.paper,
        overflow: "hidden",
      }}
    >
      <svg width={W} height={ART_H} viewBox={`0 0 ${W} ${ART_H}`}>
        {/* 紙のムラ (決まった位置の淡い楕円) */}
        <ellipse cx={420} cy={180} rx={420} ry={210} fill={KP.paperDark} opacity={0.3} />
        <ellipse cx={1560} cy={700} rx={430} ry={220} fill={KP.paperDark} opacity={0.26} />
        <ellipse cx={1200} cy={120} rx={300} ry={130} fill={KP.paperDark} opacity={0.2} />
        {children}
      </svg>
      <Header />
    </div>
    <Band />
  </AbsoluteFill>
);

// 図解の見出し (上部中央・青緑の短い下線)
const SheetTitle: React.FC<{ text?: string }> = ({ text }) => {
  if (!text) return null;
  return (
    <g>
      <text
        x={W / 2}
        y={104}
        textAnchor="middle"
        fontSize={46}
        fontWeight={700}
        fill={KP.ink}
        fontFamily={KOUZOU_FONT}
        letterSpacing={3}
      >
        {text}
      </text>
      <rect x={W / 2 - 36} y={124} width={72} height={5} rx={2.5} fill={KP.teal} />
    </g>
  );
};

// 0→1 の進行 (delay フレーム後に dur フレームかけて)。描画アニメの共通ヘルパー
// (hooks ではないので map の中でも使える)
const prog = (frame: number, delay: number, dur = 14) =>
  interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// 線が描かれていく path (strokeDasharray で左から伸びる)
const DrawPath: React.FC<{
  d: string;
  len: number;
  delay: number;
  dur?: number;
  color?: string;
  width?: number;
}> = ({ d, len, delay, dur = 20, color = KP.ink, width = 6 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={len}
      strokeDashoffset={(1 - p) * len}
    />
  );
};

// 水平の矢印が左から伸びる (線 + 矢じり)
const GrowArrow: React.FC<{
  x: number;
  y: number;
  length: number;
  delay: number;
  dur?: number;
  color?: string;
  width?: number;
}> = ({ x, y, length, delay, dur = 18, color = KP.teal, width = 7 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur);
  const tip = x + length * p;
  return (
    <g stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x} y1={y} x2={tip} y2={y} />
      {p > 0.12 && <path d={`M ${tip - 20} ${y - 16} L ${tip} ${y} L ${tip - 20} ${y + 16}`} />}
    </g>
  );
};

// 人型ピクトグラム (頭 + 丸い胴)。足元が (x, y)
const Person: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({
  x,
  y,
  s = 1,
  color = KP.ink,
  opacity = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={opacity}>
    <circle cx={0} cy={-104} r={22} fill={color} />
    <path d="M -30 0 L -30 -46 Q -30 -74 0 -74 Q 30 -74 30 -46 L 30 0 Z" fill={color} />
  </g>
);

// 吹き出し (中に短い線 = 発言の記号)。tail は下向き
const Bubble: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  delay: number;
  accent?: boolean;
  mark?: string; // "…" "!" など。無ければ横線2本
}> = ({ x, y, w = 120, h = 78, delay, accent, mark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 14 }, durationInFrames: 20 });
  const s = Math.max(pop, 0);
  const stroke = accent ? KP.teal : KP.ink;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={s > 0.02 ? 1 : 0}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={KP.paper} stroke={stroke} strokeWidth={5} />
      <path d={`M -14 ${h / 2 - 2} L 0 ${h / 2 + 22} L 12 ${h / 2 - 2} Z`} fill={KP.paper} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-14} y={h / 2 - 5} width={28} height={8} fill={KP.paper} />
      {mark ? (
        <text x={0} y={14} textAnchor="middle" fontSize={40} fontWeight={700} fill={stroke} fontFamily={KOUZOU_FONT}>
          {mark}
        </text>
      ) : (
        <g stroke={stroke} strokeWidth={6} strokeLinecap="round">
          <line x1={-w / 2 + 24} y1={-10} x2={w / 2 - 24} y2={-10} />
          <line x1={-w / 2 + 24} y1={12} x2={w / 2 - 40} y2={12} />
        </g>
      )}
    </g>
  );
};

// ===== 場面 (motif ごとの図解) =====

// meeting: 会議室。テーブルと人のピクトグラム、吹き出しが増えていく
const MeetingScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const tableY = 650;
  const seats = [430, 700, 970, 1240, 1510];
  return (
    <Sheet>
      <SheetTitle text={scene.title} />
      {/* 床の線 */}
      <line x1={160} x2={1760} y1={tableY + 160} y2={tableY + 160} stroke={KP.inkSoft} strokeWidth={4} opacity={0.5} />
      {/* 人 (テーブルの奥に並ぶ) */}
      {seats.map((sx, i) => (
        <Person key={i} x={sx} y={tableY - 10} s={1.06} />
      ))}
      {/* テーブル (手前) */}
      <rect x={300} y={tableY} width={1320} height={44} rx={10} fill={KP.paper} stroke={KP.ink} strokeWidth={7} />
      <line x1={420} y1={tableY + 44} x2={400} y2={tableY + 158} stroke={KP.ink} strokeWidth={9} strokeLinecap="round" />
      <line x1={1500} y1={tableY + 44} x2={1520} y2={tableY + 158} stroke={KP.ink} strokeWidth={9} strokeLinecap="round" />
      {/* 吹き出しが増えていく (発言が発言を呼ぶ) */}
      <Bubble x={430} y={tableY - 240} delay={10} />
      <Bubble x={710} y={tableY - 268} delay={40} />
      <Bubble x={985} y={tableY - 236} delay={70} accent mark="…" />
      <Bubble x={1255} y={tableY - 272} delay={100} />
      <Bubble x={1525} y={tableY - 240} delay={130} />
      <Bubble x={860} y={tableY - 400} w={104} h={68} delay={165} />
      <Bubble x={1130} y={tableY - 416} w={104} h={68} delay={195} />
      {/* 壁の時計 (時間が過ぎていく記号) */}
      <g transform="translate(1720, 220)">
        <circle r={56} fill={KP.paper} stroke={KP.ink} strokeWidth={6} />
        <line x1={0} y1={0} x2={0} y2={-34} stroke={KP.ink} strokeWidth={6} strokeLinecap="round" />
        <line x1={0} y1={0} x2={24} y2={12} stroke={KP.teal} strokeWidth={6} strokeLinecap="round" />
      </g>
    </Sheet>
  );
};

// structure: 箱3つの分岐図。該当の箱が青緑で順に点灯
const StructureScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const labels = (scene.items ?? []).map((i) => i.label).filter(Boolean).slice(0, 3);
  const boxes = labels.length >= 2 ? labels : ["要因 1", "要因 2", "要因 3"];
  const n = boxes.length;
  const rootX = W / 2;
  const rootY = 250;
  const childY = 560;
  const boxW = 420;
  const boxH = 130;
  const xs = boxes.map((_, i) => W / 2 + (i - (n - 1) / 2) * 500);
  return (
    <Sheet>
      <SheetTitle text={scene.title ?? "構造を分解する"} />
      {/* 根の箱 */}
      <rect x={rootX - 230} y={rootY - 60} width={460} height={120} rx={12} fill={KP.paper} stroke={KP.ink} strokeWidth={7} />
      <text x={rootX} y={rootY + 14} textAnchor="middle" fontSize={42} fontWeight={700} fill={KP.ink} fontFamily={KOUZOU_FONT}>
        {scene.emphasis?.replace(/[「」]/g, "") ?? "構造"}
      </text>
      {/* 分岐線が順に描かれる */}
      {xs.map((x, i) => {
        const midY = (rootY + 60 + childY - boxH / 2) / 2 + 10;
        const d = `M ${rootX} ${rootY + 60} L ${rootX} ${midY} L ${x} ${midY} L ${x} ${childY - boxH / 2}`;
        const len = Math.abs(midY - rootY - 60) + Math.abs(x - rootX) + Math.abs(childY - boxH / 2 - midY);
        return <DrawPath key={i} d={d} len={len} delay={14 + i * 22} dur={22} width={5.5} />;
      })}
      {/* 箱が順に現れ、青緑で順に点灯 */}
      {xs.map((x, i) => {
        const appear = prog(frame, 30 + i * 22, 12);
        // 全部出そろったあと、1つずつ順に点灯してまわる
        const litStart = 30 + n * 22 + 20;
        const cycle = Math.floor(Math.max(frame - litStart, 0) / 50);
        const lit = frame >= litStart && cycle % n === i;
        return (
          <g key={i} opacity={appear} transform={`translate(0, ${(1 - appear) * 20})`}>
            <rect
              x={x - boxW / 2}
              y={childY - boxH / 2}
              width={boxW}
              height={boxH}
              rx={12}
              fill={lit ? KP.teal : KP.paper}
              stroke={lit ? KP.teal : KP.ink}
              strokeWidth={7}
            />
            <text
              x={x}
              y={childY + 14}
              textAnchor="middle"
              fontSize={40}
              fontWeight={700}
              fill={lit ? KP.white : KP.ink}
              fontFamily={KOUZOU_FONT}
            >
              {boxes[i]}
            </text>
          </g>
        );
      })}
    </Sheet>
  );
};

// mix: 性質の違う仕事 (報告・議論・決定) が1つの枠に押し込まれる図
const MixScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labels = (scene.items ?? []).map((i) => i.label).filter(Boolean).slice(0, 3);
  const jobs = labels.length >= 2 ? labels : ["報告", "議論", "決定"];
  const fx = W / 2 - 390;
  const fy = 300;
  const fw = 780;
  const fh = 430;
  // 3つのブロックが左・上・右から枠の中へ押し込まれる
  const starts: [number, number][] = [
    [fx - 560, fy + fh / 2 - 60],
    [fx + fw / 2 - 150, fy - 260],
    [fx + fw + 260, fy + fh / 2 - 60],
  ];
  const targets: [number, number][] = [
    [fx + 50, fy + 60],
    [fx + fw / 2 - 150, fy + 165],
    [fx + fw - 350, fy + 270],
  ];
  return (
    <Sheet>
      <SheetTitle text={scene.title ?? "1つの会議に押し込まれる仕事"} />
      {/* 枠 = 1つの会議 */}
      <rect x={fx} y={fy} width={fw} height={fh} rx={14} fill="none" stroke={KP.ink} strokeWidth={8} />
      <text x={fx + fw / 2} y={fy - 24} textAnchor="middle" fontSize={36} fontWeight={700} fill={KP.inkSoft} fontFamily={KOUZOU_FONT}>
        1つの会議
      </text>
      {jobs.map((label, i) => {
        const delay = 16 + i * 26;
        // spring は hook ではないが、map 内でも使えるよう frame を引数で渡す
        const p = spring({ frame: frame - delay, fps, config: { damping: 18 }, durationInFrames: 30 });
        const s = Math.max(p, 0);
        const [sx, sy] = starts[i] ?? starts[0];
        const [tx, ty] = targets[i] ?? targets[0];
        const x = interpolate(s, [0, 1], [sx, tx]);
        const y = interpolate(s, [0, 1], [sy, ty]);
        const accent = i === 1; // 真ん中 (議論) だけ青緑 = 性質が違うことの記号
        return (
          <g key={i} opacity={Math.min(1, s * 3 + 0.25)}>
            <rect x={x} y={y} width={300} height={120} rx={12} fill={accent ? KP.tealSoft : KP.paper} stroke={accent ? KP.teal : KP.ink} strokeWidth={7} />
            <text x={x + 150} y={y + 72} textAnchor="middle" fontSize={40} fontWeight={700} fill={KP.ink} fontFamily={KOUZOU_FONT}>
              {label}
            </text>
          </g>
        );
      })}
      {/* 押し込む矢印 (外→枠の中) */}
      <GrowArrow x={fx - 240} y={fy + fh / 2} length={170} delay={14} />
      <g transform={`rotate(90, ${fx + fw / 2}, ${fy - 180})`}>
        <GrowArrow x={fx + fw / 2 - 85} y={fy - 180} length={130} delay={40} />
      </g>
      <g transform={`rotate(180, ${fx + fw + 120}, ${fy + fh / 2})`}>
        <GrowArrow x={fx + fw + 35} y={fy + fh / 2} length={170} delay={66} />
      </g>
    </Sheet>
  );
};

// no_end: 「終わりの条件」のチェックボックスに×。時間の線が右へ伸び続ける
const NoEndScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const boxX = W / 2 - 330;
  const boxY = 260;
  const xP = prog(frame, 26, 16);
  // 時間の線: 止まらずに右へ伸び続ける (画面端でもわずかに進み続ける見せ方)
  const lineX0 = 260;
  const lineY = 640;
  const lineLen = Math.min(20 + frame * 9, 1360) + Math.max(0, frame * 9 - 1340) * 0.02;
  const tip = lineX0 + Math.min(lineLen, 1400);
  return (
    <Sheet>
      <SheetTitle text={scene.title ?? "終わりの条件がない"} />
      {/* チェックボックスと項目名 */}
      <rect x={boxX} y={boxY} width={92} height={92} rx={10} fill={KP.paper} stroke={KP.ink} strokeWidth={8} />
      <text x={boxX + 130} y={boxY + 64} fontSize={46} fontWeight={700} fill={KP.ink} fontFamily={KOUZOU_FONT}>
        終わりの条件
      </text>
      {/* × が描かれる (2画) */}
      <DrawPath d={`M ${boxX + 16} ${boxY + 16} L ${boxX + 76} ${boxY + 76}`} len={90} delay={26} dur={10} color={KP.teal} width={11} />
      <DrawPath d={`M ${boxX + 76} ${boxY + 16} L ${boxX + 16} ${boxY + 76}`} len={90} delay={38} dur={10} color={KP.teal} width={11} />
      <g opacity={xP}>
        <text x={boxX + 580} y={boxY + 64} fontSize={38} fontWeight={700} fill={KP.teal} fontFamily={KOUZOU_FONT}>
          = 決まっていない
        </text>
      </g>
      {/* 時間の線が右へ伸び続ける */}
      <text x={lineX0} y={lineY - 46} fontSize={36} fontWeight={700} fill={KP.inkSoft} fontFamily={KOUZOU_FONT}>
        時間
      </text>
      <line x1={lineX0} y1={lineY} x2={tip} y2={lineY} stroke={KP.ink} strokeWidth={9} strokeLinecap="round" />
      <path d={`M ${tip - 24} ${lineY - 18} L ${tip} ${lineY} L ${tip - 24} ${lineY + 18}`} fill="none" stroke={KP.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      {/* 目盛り (過ぎた分だけ現れる) */}
      {Array.from({ length: 9 }, (_, i) => {
        const mx = lineX0 + 150 + i * 150;
        if (mx > tip - 30) return null;
        return <line key={i} x1={mx} x2={mx} y1={lineY - 16} y2={lineY + 16} stroke={KP.inkSoft} strokeWidth={5} />;
      })}
      {/* 「まだ続く」の点々 */}
      {tip > 1500 && (
        <g fill={KP.teal}>
          <circle cx={1700} cy={lineY} r={7} opacity={0.5 + 0.5 * Math.sin(frame / 6)} />
          <circle cx={1740} cy={lineY} r={7} opacity={0.5 + 0.5 * Math.sin(frame / 6 - 1)} />
          <circle cx={1780} cy={lineY} r={7} opacity={0.5 + 0.5 * Math.sin(frame / 6 - 2)} />
        </g>
      )}
    </Sheet>
  );
};

// silence: 沈黙→不安→発言の連鎖。人型から吹き出しが連鎖する矢印図
const SilenceScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const baseY = 700;
  const xs = [420, 960, 1500];
  return (
    <Sheet>
      <SheetTitle text={scene.title ?? "発言が発言を呼ぶ"} />
      <line x1={220} x2={1700} y1={baseY + 4} y2={baseY + 4} stroke={KP.inkSoft} strokeWidth={4} opacity={0.5} />
      {xs.map((x, i) => (
        <Person key={i} x={x} y={baseY} s={1.3} />
      ))}
      {/* 1人目: 沈黙 (…) → 不安 (!) → 発言、が矢印で連鎖していく */}
      <Bubble x={xs[0]} y={baseY - 330} delay={8} mark="…" />
      <Bubble x={xs[0] + 10} y={baseY - 480} w={76} h={64} delay={40} accent mark="!" />
      <GrowArrow x={xs[0] + 100} y={baseY - 330} length={330} delay={70} />
      <Bubble x={xs[1]} y={baseY - 330} delay={100} />
      <Bubble x={xs[1] + 10} y={baseY - 480} w={76} h={64} delay={130} accent mark="!" />
      <GrowArrow x={xs[1] + 100} y={baseY - 330} length={330} delay={158} />
      <Bubble x={xs[2]} y={baseY - 330} delay={188} />
    </Sheet>
  );
};

// anchor: 時間の錨。60分のバー。30分で結論が出ても60分まで埋まる
const AnchorScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const barX = 300;
  const barY = 480;
  const barW = 1320;
  const barH = 110;
  // 0→30分 (前半) は仕事、30→60分 (後半) もなぜか埋まっていく
  const p = interpolate(frame, [10, 190], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fillW = barW * p;
  const halfW = barW / 2;
  const kekkronO = prog(frame, 96, 14); // ちょうど30分 (p=0.5 付近) で「結論」が出る
  const minutes = Math.round(p * 60);
  return (
    <Sheet>
      <SheetTitle text={scene.title ?? "時間の錨"} />
      {/* 60分の枠 */}
      <rect x={barX} y={barY} width={barW} height={barH} rx={10} fill={KP.paper} stroke={KP.ink} strokeWidth={8} />
      {/* 前半 (仕事の時間) は墨、後半 (結論後も埋まる時間) は青緑の淡い面 */}
      <rect x={barX + 4} y={barY + 4} width={Math.max(Math.min(fillW, halfW) - 4, 0)} height={barH - 8} rx={7} fill={KP.ink} opacity={0.88} />
      {fillW > halfW && (
        <rect x={barX + halfW} y={barY + 4} width={fillW - halfW} height={barH - 8} fill={KP.tealSoft} opacity={0.9} />
      )}
      {/* 30分の線と「結論」フラグ */}
      <line x1={barX + halfW} x2={barX + halfW} y1={barY - 26} y2={barY + barH + 26} stroke={KP.teal} strokeWidth={6} strokeDasharray="12 10" />
      <g opacity={kekkronO} transform={`translate(${barX + halfW}, ${barY - 92}) scale(${0.8 + 0.2 * kekkronO})`}>
        <rect x={-110} y={-44} width={220} height={74} rx={12} fill={KP.teal} />
        <path d="M -14 30 L 0 52 L 14 30 Z" fill={KP.teal} />
        <text x={0} y={8} textAnchor="middle" fontSize={40} fontWeight={800} fill={KP.white} fontFamily={KOUZOU_FONT}>
          結論
        </text>
      </g>
      {/* 目盛り */}
      {[0, 30, 60].map((min) => (
        <g key={min}>
          <line x1={barX + (barW * min) / 60} x2={barX + (barW * min) / 60} y1={barY + barH} y2={barY + barH + 18} stroke={KP.ink} strokeWidth={5} />
          <text x={barX + (barW * min) / 60} y={barY + barH + 66} textAnchor="middle" fontSize={36} fontWeight={700} fill={KP.inkSoft} fontFamily={KOUZOU_FONT}>
            {min}分
          </text>
        </g>
      ))}
      {/* 経過のカウント */}
      <text x={barX + barW} y={barY - 56} textAnchor="end" fontSize={48} fontWeight={800} fill={KP.ink} fontFamily={KOUZOU_FONT}>
        {minutes}分
      </text>
      {/* 錨のアイコン (60分の端に。時間がそこに固定される記号) */}
      <g transform={`translate(${barX + barW + 90}, ${barY + barH / 2 - 10})`} stroke={KP.ink} strokeWidth={9} fill="none" strokeLinecap="round">
        <circle cx={0} cy={-52} r={16} />
        <line x1={0} y1={-36} x2={0} y2={56} />
        <line x1={-34} y1={-6} x2={34} y2={-6} />
        <path d="M -46 28 Q -46 64 0 64 Q 46 64 46 28" />
        <path d="M -46 28 l -14 18 M -46 28 l 18 12" />
        <path d="M 46 28 l 14 18 M 46 28 l -18 12" />
      </g>
    </Sheet>
  );
};

// law: パーキンソンの法則。枠=与えられた時間、中身の仕事が枠いっぱいに膨らむ
const LawScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fx = W / 2 - 480;
  const fy = 280;
  const fw = 960;
  const fh = 440;
  // 中身が小さな塊から枠いっぱいまで膨らむ
  const grow = spring({ frame: frame - 24, fps, config: { damping: 40, stiffness: 28 }, durationInFrames: 120 });
  const g = Math.max(grow, 0);
  const iw = interpolate(g, [0, 1], [280, fw - 24]);
  const ih = interpolate(g, [0, 1], [150, fh - 24]);
  const cx = fx + fw / 2;
  const cy = fy + fh / 2;
  const labelO = prog(frame, 10, 12);
  return (
    <Sheet>
      <SheetTitle text={scene.title ?? "パーキンソンの法則"} />
      {/* 枠 = 与えられた時間 */}
      <rect x={fx} y={fy} width={fw} height={fh} rx={14} fill="none" stroke={KP.ink} strokeWidth={9} />
      <g opacity={labelO}>
        <text x={cx} y={fy - 26} textAnchor="middle" fontSize={38} fontWeight={700} fill={KP.ink} fontFamily={KOUZOU_FONT}>
          枠 = 与えられた時間
        </text>
      </g>
      {/* 中身 = 仕事 (青緑の面が膨らむ) */}
      <rect x={cx - iw / 2} y={cy - ih / 2} width={iw} height={ih} rx={14} fill={KP.tealSoft} stroke={KP.teal} strokeWidth={7} opacity={0.95} />
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={46} fontWeight={800} fill={KP.ink} fontFamily={KOUZOU_FONT}>
        仕事
      </text>
      {/* 膨らむ向きの小さな矢印 (四方へ) */}
      {g > 0.15 && g < 0.98 && (
        <g stroke={KP.teal} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
          <path d={`M ${cx - iw / 2 - 10} ${cy} l -34 0 m 14 -12 l -14 12 l 14 12`} />
          <path d={`M ${cx + iw / 2 + 10} ${cy} l 34 0 m -14 -12 l 14 12 l -14 12`} />
          <path d={`M ${cx} ${cy - ih / 2 - 10} l 0 -30 m -12 12 l 12 -12 l 12 12`} />
          <path d={`M ${cx} ${cy + ih / 2 + 10} l 0 30 m -12 -12 l 12 12 l 12 -12`} />
        </g>
      )}
    </Sheet>
  );
};

// concept: 汎用の構造図 (つながりのネットワーク)。想定外の motif でも破綻しない予備
const ConceptScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const nodes: [number, number, number][] = [
    [W / 2, 450, 64], // 中心
    [560, 280, 44],
    [1360, 270, 44],
    [430, 620, 44],
    [1480, 640, 44],
    [960, 760, 44],
  ];
  const labels = (scene.items ?? []).map((i) => i.label).filter(Boolean);
  return (
    <Sheet>
      <SheetTitle text={scene.title ?? "つながりの構造"} />
      {/* 線が中心から順に描かれる */}
      {nodes.slice(1).map(([x, y], i) => {
        const [cx, cy] = nodes[0];
        const len = Math.hypot(x - cx, y - cy);
        return (
          <DrawPath key={i} d={`M ${cx} ${cy} L ${x} ${y}`} len={len} delay={16 + i * 14} dur={16} width={5} color={KP.inkSoft} />
        );
      })}
      {/* 節点が順に現れる */}
      {nodes.map(([x, y, r], i) => {
        const p = prog(frame, 8 + i * 14, 12);
        const label = i === 0 ? scene.emphasis?.replace(/[「」]/g, "") : labels[i - 1];
        return (
          <g key={i} opacity={p} transform={`translate(${x}, ${y}) scale(${0.6 + 0.4 * p})`}>
            <circle r={r} fill={i === 0 ? KP.teal : KP.paper} stroke={i === 0 ? KP.teal : KP.ink} strokeWidth={6} />
            {label && label.length <= 6 && (
              <text y={i === 0 ? 12 : 10} textAnchor="middle" fontSize={i === 0 ? 34 : 26} fontWeight={700} fill={i === 0 ? KP.white : KP.ink} fontFamily={KOUZOU_FONT}>
                {label}
              </text>
            )}
          </g>
        );
      })}
    </Sheet>
  );
};

// chart: 棒バーの比較 (30分 vs 60分 など) + カウントアップ
const KouzouChartScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = (scene.items ?? []).filter((i) => i.value !== undefined).slice(0, 4);
  const grow = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 80 });
  if (items.length === 0) return <ConceptScene scene={scene} />;
  const max = Math.max(...items.map((i) => i.value ?? 0), 1);
  // 本文で言及された数字の側を青緑で強調。無ければ最大値
  const mentioned = items.findIndex((it) => it.value !== undefined && scene.text.includes(String(it.value)));
  const strongIdx = mentioned !== -1 ? mentioned : items.findIndex((it) => (it.value ?? 0) === max);
  const rowH = items.length <= 2 ? 190 : 150;
  const top = 300 - (items.length - 2) * 30;
  return (
    <Sheet>
      <SheetTitle text={scene.title ?? "数字で見る"} />
      {items.map((it, i) => {
        const y = top + i * rowH;
        const w = ((it.value ?? 0) / max) * 900 * grow;
        const strong = i === strongIdx;
        return (
          <g key={i}>
            <text x={520} y={y + 54} textAnchor="end" fontSize={40} fontWeight={700} fill={KP.ink} fontFamily={KOUZOU_FONT}>
              {it.label}
            </text>
            <rect x={560} y={y} width={Math.max(w, 4)} height={78} rx={8} fill={strong ? KP.teal : KP.ink} opacity={strong ? 1 : 0.85} />
            <text x={586 + w} y={y + 54} fontSize={46} fontWeight={800} fill={strong ? KP.teal : KP.ink} fontFamily={KOUZOU_FONT}>
              {Math.round((it.value ?? 0) * grow)}
              {it.unit ?? ""}
            </text>
          </g>
        );
      })}
      {/* 下の基準線 */}
      <line x1={560} x2={560} y1={top - 40} y2={top + items.length * rowH - 40} stroke={KP.ink} strokeWidth={6} />
    </Sheet>
  );
};

// ===== カード (章・結論だけの濃紺カード) =====

// カードがナレーション全文をそのまま見せるか (その場合は字幕を重ねない。manabi と同じ考え方)
export const kouzouCardShowsFullText = (scene: Scene): boolean => {
  if (scene.isEnding || scene.type !== "card") return false;
  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  if (hl && text.includes(hl) && text.length <= 52) return true;
  return !hl && text.length <= 52;
};

// 濃紺の全面カードの土台 (上は濃紺、下端の黒帯は維持)
const NavySurface: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: KP.band }}>
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: ART_H,
        backgroundColor: KP.navy,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </div>
    <Band />
  </AbsoluteFill>
);

// card: 濃紺カードに白ゴシック。emphasis の語だけ青緑 (章の切り替えと結論)
const KouzouCardScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 26 });

  if (scene.isEnding) {
    return (
      <NavySurface>
        <div style={{ opacity: inP, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              border: `4px solid ${KP.teal}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: KOUZOU_FONT,
              fontSize: 72,
              fontWeight: 700,
              color: KP.white,
              marginBottom: 44,
            }}
          >
            {KOUZOU_CHANNEL.iconLetter}
          </div>
          <div style={{ fontFamily: KOUZOU_FONT, fontSize: 64, fontWeight: 700, color: KP.white, letterSpacing: 8 }}>
            {KOUZOU_CHANNEL.name}
          </div>
          <div style={{ width: 70, height: 4, background: KP.teal, marginTop: 36, borderRadius: 2 }} />
        </div>
      </NavySurface>
    );
  }

  const hl = scene.emphasis?.replace(/[「」]/g, "").trim();
  const text = scene.text.replace(/[。]$/, "");
  const useFull = Boolean(hl && text.includes(hl) && text.length <= 52) || (!hl && text.length <= 52);
  const display = useFull ? text : (hl ?? scene.title ?? text.slice(0, 40));
  const rise = interpolate(inP, [0, 1], [24, 0]);
  return (
    <NavySurface>
      <div style={{ opacity: inP, transform: `translateY(${rise}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 64, height: 4, background: KP.teal, marginBottom: 54, borderRadius: 2 }} />
        <div
          style={{
            fontFamily: KOUZOU_FONT,
            fontSize: useFull ? 58 : 72,
            fontWeight: 700,
            color: KP.white,
            textAlign: "center",
            lineHeight: 1.75,
            maxWidth: 1460,
            letterSpacing: 2,
          }}
        >
          {useFull && hl
            ? text.split(hl).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span style={{ color: KP.teal, filter: "brightness(1.5)" }}>{hl}</span>}
                </span>
              ))
            : display}
        </div>
        <div style={{ width: 64, height: 4, background: KP.teal, marginTop: 54, borderRadius: 2 }} />
      </div>
    </NavySurface>
  );
};

// ===== 入口: motif (題材) を type より優先して描き分ける =====

// motif 名のゆらぎを吸収して代表名に寄せる (AIブレ対策)
// (例: "meeting_room"→meeting、"boxes"/"branch"→structure、"parkinson"→law、
//  "timeline"/"endless"→no_end、"speak"/"bubble"→silence、"time_anchor"→anchor)
export const resolveKouzouMotif = (m: string): string | undefined => {
  if (/anchor|time_bar|60min/.test(m)) return "anchor";
  if (/no_end|endless|no_goal|checkbox|infinite|timeline|forever/.test(m)) return "no_end";
  if (/silence|silent|speak|bubble|chain|voice|utter/.test(m)) return "silence";
  if (/law|parkinson|expand|inflate|fill_time|swell/.test(m)) return "law";
  if (/mix|mixed|overlap|combine|stuff|cram/.test(m)) return "mix";
  if (/structure|box|branch|tree|decompose|breakdown|factor/.test(m)) return "structure";
  if (/meeting|kaigi|room|table|conference|discussion/.test(m)) return "meeting";
  if (/concept|network|node|link|relation/.test(m)) return "concept";
  return undefined;
};

export const KouzouSceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  // AI画像があれば絵エリア (上部) に収めて見せる。下端の黒帯は維持する
  if (scene.image && scene.type !== "card") {
    return (
      <AbsoluteFill style={{ backgroundColor: KP.band }}>
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
  if (scene.isEnding) return <KouzouCardScene scene={scene} />;

  // 題材 (motif) を型より優先して拾う。AIが type を揺らしても専用の図解が出るように
  if (scene.type !== "card" && scene.type !== "chart") {
    const m = resolveKouzouMotif(scene.motif ?? "");
    if (m === "meeting") return <MeetingScene scene={scene} />;
    if (m === "structure") return <StructureScene scene={scene} />;
    if (m === "mix") return <MixScene scene={scene} />;
    if (m === "no_end") return <NoEndScene scene={scene} />;
    if (m === "silence") return <SilenceScene scene={scene} />;
    if (m === "anchor") return <AnchorScene scene={scene} />;
    if (m === "law") return <LawScene scene={scene} />;
    if (m === "concept") return <ConceptScene scene={scene} />;
  }
  switch (scene.type) {
    case "card":
      return <KouzouCardScene scene={scene} />;
    case "chart":
      return <KouzouChartScene scene={scene} />;
    case "location":
    case "character":
      return <MeetingScene scene={scene} />;
    default:
      // diagram / object / 想定外の motif は汎用の構造図で受ける
      return <ConceptScene scene={scene} />;
  }
};
