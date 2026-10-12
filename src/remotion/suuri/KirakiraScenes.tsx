// キラキラ画面回 (「キラキラしてるのは世界じゃなくて、あなたの画面です」) の専用シーン集。
// すべて parts.tsx の共通部品 (Frame / Person など) の上に描く。
// 和紙背景 (第3章 = 80年前の資料の世界) への反転は Frame が担当するので、
// ここでは従来どおり黒地用の色 (黒・白・赤の3色) で描けばよい。
//
// 配色の約束ごと (制作ガイド §9-4 ルール5):
// - 赤 (SP.accent) は1画面に1要素まで (弾痕 / 守る丸 / ×印 / 答えの数字 など)
// - きらきらは白い小さな十字星で表現し、赤は使わない
// - シルエット (沈んだ飛行機など) は SP.ink で塗りつぶす
//   → 黒背景では白いシルエット / 和紙では反転して墨色のシルエットになる

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../types";
import {
  SP,
  SUURI_FONT,
  W,
  H,
  Frame,
  DiagramTitle,
  SmallLabel,
  Person,
  appearAt,
  useAppear,
} from "./parts";

type SceneProps = { scene?: Scene; variant?: number };

// ===== 和紙/黒の場面分類 (computeSuuriWashi が参照する) =====
// 第3章「帰ってこなかった飛行機」= 80年前の資料の世界 → 和紙
export const KIRAKIRA_WASHI_MOTIFS = [
  "war_planes",
  "bullet_map",
  "generals",
  "wald_stop",
  "sea_bottom",
  "missing_data",
  "count_disease",
  "runway_phones",
  "whisper_question",
] as const;
// それ以外 (夜のスマホ・画面の世界) → 黒
export const KIRAKIRA_DARK_MOTIFS = [
  "futon_phone",
  "kirakira_feed",
  "scroll_forever",
  "alone_sigh",
  "world_vs_screen",
  "selection_gates",
  "homerun_tv",
  "batter",
  "not_sad_viewer",
  "fail_7of10",
  "hr_divide",
  "juice",
  "life_homerun",
  "gacha_shine",
  "gacha_close",
  "timeline_wins",
  "camera_roll",
  "pick_1of100",
  "calendar_10",
  "rank_up",
  "multiply_calc",
  "ng_film",
  "unfair_match",
  "nothing_tuesday",
  "sink_posts",
  "mutual_shine",
] as const;

// ===== 小さな共通部品 =====

// 弾痕 (赤い点)。appear は 0→1 の出現進行
const BulletHole: React.FC<{ x: number; y: number; appear: number }> = ({ x, y, appear }) => (
  <circle cx={x} cy={y} r={9 * Math.min(appear * 1.4, 1)} fill={SP.accent} opacity={appear} />
);

// 横向きの飛行機シルエット (左向き・塗りつぶし)。(x, y) は機体の中心
// 黒背景=白シルエット / 和紙=墨色シルエット (Frameの反転にまかせる)
const PlaneSilhouette: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
}> = ({ x, y, scale = 1, rotate = 0, opacity = 1 }) => (
  <g
    transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}
    opacity={opacity}
  >
    {/* 胴体 (機首は左) */}
    <path
      d="M -150 0 Q -150 -16 -120 -18 L 90 -18 Q 140 -14 150 2 Q 120 16 80 16 L -120 16 Q -150 14 -150 0 Z"
      fill={SP.ink}
    />
    {/* 主翼 (手前の1枚) */}
    <path d="M -40 -8 L 40 56 L 76 56 L 10 -8 Z" fill={SP.ink} />
    {/* 尾翼 (垂直) */}
    <path d="M 96 -14 L 128 -56 L 150 -56 L 134 -14 Z" fill={SP.ink} />
    {/* 水平尾翼 */}
    <path d="M 104 2 L 146 26 L 162 26 L 134 2 Z" fill={SP.ink} />
  </g>
);

// ===== bullet_map: 弾痕の図 (この動画の山場の絵・和紙) =====
// 育ち方 (文の内容で選び直す §9-3):
//   mode 0 = 帰還機の弾痕が翼としっぽに増えていく
//   mode 1 = 軍の案: 穴だらけの場所に鉄板 (斜線の板)
//   mode 2 = ウォールドの答え: 穴ゼロのエンジンを赤い丸で守る
export const BulletMapScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = scene?.text ?? "";
  const mode = /エンジン|守るべき/.test(text)
    ? 2
    : /鉄板|守ろう/.test(text)
      ? 1
      : Math.min(variant, 2);

  // 弾痕の位置 (翼・しっぽ・後部胴体だけ。エンジンと機首には絶対置かない)
  const holes: [number, number][] = [
    // 左翼
    [560, 585], [630, 566], [700, 602], [770, 575], [840, 598], [880, 560],
    // 右翼
    [1060, 562], [1120, 598], [1190, 570], [1260, 600], [1330, 566], [1396, 588],
    // 水平尾翼 (左右)
    [762, 752], [826, 772], [1104, 770], [1168, 750],
    // 後部胴体
    [942, 660], [978, 700], [952, 730],
  ];

  const title =
    scene?.title ??
    (mode === 2
      ? "ウォールドの答え : 穴ゼロのエンジンを守る"
      : mode === 1
        ? "軍の案 : 穴だらけの場所に鉄板?"
        : "帰ってきた飛行機の、銃弾の穴の記録");

  const bodyFill = SP.background;

  return (
    <Frame>
      <DiagramTitle text={title} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 全体を少し縮めて下げ、上のラベル (y180) と機首が重ならないようにする */}
        <g transform="translate(960 524) scale(0.9) translate(-960 -506)">
        {/* ===== 飛行機の上面図 (機首が上) ===== */}
        <g stroke={SP.line} strokeWidth={5} strokeLinejoin="round">
          {/* 主翼 (後退角つき) */}
          <path d="M 912 470 L 420 570 L 420 622 L 912 556 Z" fill={bodyFill} />
          <path d="M 1008 470 L 1500 570 L 1500 622 L 1008 556 Z" fill={bodyFill} />
          {/* 水平尾翼 */}
          <path d="M 920 706 L 706 766 L 706 800 L 920 752 Z" fill={bodyFill} />
          <path d="M 1000 706 L 1214 766 L 1214 800 L 1000 752 Z" fill={bodyFill} />
          {/* 胴体 (機首 → 尾部) */}
          <path
            d="M 960 206 Q 1014 258 1008 420 L 1008 660 Q 1004 744 982 806 L 938 806 Q 916 744 912 660 L 912 420 Q 906 258 960 206 Z"
            fill={bodyFill}
          />
          {/* コックピットの窓 */}
          <path d="M 936 300 Q 960 286 984 300" fill="none" strokeWidth={4} />
        </g>
        {/* エンジン2基 (翼の上・プロペラつき)。穴はひとつもない */}
        {[742, 1178].map((ex) => (
          <g key={ex} stroke={SP.line} strokeWidth={5}>
            <rect x={ex - 36} y={474} width={72} height={104} rx={18} fill={bodyFill} />
            <circle cx={ex} cy={468} r={10} fill={SP.line} />
            <line x1={ex - 34} y1={444} x2={ex + 34} y2={492} strokeWidth={4} />
            <line x1={ex + 34} y1={444} x2={ex - 34} y2={492} strokeWidth={4} />
          </g>
        ))}
        <SmallLabel x={742} y={445 - 24} text="エンジン" size={28} color={SP.faint} />
        <SmallLabel x={1178} y={445 - 24} text="エンジン" size={28} color={SP.faint} />

        {/* ===== 弾痕 (順に増えていく・ナレーションと同期) ===== */}
        {holes.map(([hx, hy], i) => (
          <BulletHole
            key={i}
            x={hx}
            y={hy}
            appear={
              mode === 0
                ? appearAt(frame, fps, 14 + i * 3)
                : mode === 2
                  ? 0.45 // 答えの場面では穴は脇役 (薄く)
                  : 1
            }
          />
        ))}

        {/* ===== mode 1: 鉄板の案 (斜線の板を翼としっぽに) ===== */}
        {mode === 1 && (
          <g opacity={appearAt(frame, fps, 16)}>
            {[
              { x: 460, y: 540, w: 330, h: 110 },
              { x: 1130, y: 540, w: 330, h: 110 },
              { x: 720, y: 724, w: 190, h: 86 },
              { x: 1010, y: 724, w: 190, h: 86 },
            ].map((p, i) => (
              <g key={i} stroke={SP.line} strokeWidth={4}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" strokeDasharray="14 8" />
                {[0.25, 0.5, 0.75].map((t) => (
                  <line
                    key={t}
                    x1={p.x + p.w * t - 20}
                    y1={p.y + p.h}
                    x2={p.x + p.w * t + 20}
                    y2={p.y}
                    opacity={0.6}
                  />
                ))}
              </g>
            ))}
          </g>
        )}

        {/* ===== mode 2: ウォールドの答え (エンジンを赤い丸で守る) ===== */}
        {mode === 2 &&
          [742, 1178].map((ex, i) => {
            const a = appearAt(frame, fps, 18 + i * 10);
            return (
              <g key={ex} opacity={a}>
                <circle
                  cx={ex}
                  cy={514}
                  r={86 * (0.6 + 0.4 * a)}
                  fill="none"
                  stroke={SP.accent}
                  strokeWidth={9}
                />
              </g>
            );
          })}
        </g>
      </svg>
      {/* 下部の説明ラベル (字幕セーフゾーン y<840 の内側) */}
      {mode === 0 && (
        <div style={labelStyle}>
          穴は <span style={{ color: SP.accent }}>翼としっぽ</span> ばかり ─ エンジンにはゼロ
        </div>
      )}
      {mode === 2 && (
        <div style={labelStyle}>
          穴がひとつもない場所こそ、<span style={{ color: SP.accent }}>撃たれたら帰れない場所</span>
        </div>
      )}
    </Frame>
  );
};

const labelStyle: React.CSSProperties = {
  position: "absolute",
  top: 180,
  width: "100%",
  textAlign: "center",
  fontFamily: SUURI_FONT,
  fontSize: 34,
  fontWeight: 700,
  color: SP.ink,
  letterSpacing: 2,
};

// ===== sea_bottom: 海の底に沈んだ飛行機 (第3章のもう1つの核心絵・和紙) =====
export const SeaBottomScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 波線 (水面) のパスを作る
  let wave = `M 60 400`;
  for (let x = 60; x < W - 60; x += 120) {
    wave += ` Q ${x + 30} 384 ${x + 60} 400 Q ${x + 90} 416 ${x + 120} 400`;
  }

  const sunkA = appearAt(frame, fps, 26); // 沈んだ飛行機
  const bob = Math.sin(frame / 14) * 5;

  // 帰ってきた飛行機は右から左へ画面を通過していく
  // (場面の長さいっぱいで右端→左端を飛びきる)
  const durFrames = ((scene?.durationSec ?? 6) + 0.35) * fps;
  const flyT = Math.min(frame / durFrames, 1);
  const flyDx = W + 240 - flyT * (W + 480) - 1340; // 基準座標(1340)からのずれ

  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "帰ってこなかった飛行機は、どこに?"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 水面より下 (海) のうっすらした横線 */}
        <g stroke={SP.dim} strokeWidth={3} opacity={0.7}>
          {[500, 580, 660, 740].map((y) => (
            <line key={y} x1={60} y1={y} x2={W - 60} y2={y} opacity={0.5} />
          ))}
        </g>
        {/* 水面の波線 */}
        <path d={wave} fill="none" stroke={SP.line} strokeWidth={5} />

        {/* 空: 帰ってきた飛行機 (右から左へ通過していく) */}
        <g transform={`translate(${flyDx}, 0)`}>
          <PlaneSilhouette x={1340} y={286 + bob} scale={0.9} rotate={-4} />
          {/* 飛行機雲 (うしろに伸びる) */}
          <g stroke={SP.faint} strokeWidth={4} strokeLinecap="round" opacity={0.8}>
            <line x1={1500} y1={276 + bob} x2={1650} y2={266 + bob} />
            <line x1={1510} y1={298 + bob} x2={1620} y2={294 + bob} />
          </g>
          <SmallLabel x={1340} y={206} text="帰ってきた飛行機" color={SP.ink} size={32} weight={700} />
        </g>

        {/* 海の底: 沈んだ飛行機2機 (エンジンに赤い点) */}
        <g opacity={sunkA}>
          <PlaneSilhouette x={640} y={700} scale={1.15} rotate={16} />
          {/* エンジン (機首側) の被弾点 */}
          <circle cx={494} cy={664} r={16} fill={SP.accent} />
          {/* 気泡 */}
          {[0, 1, 2].map((i) => {
            const t = ((frame * 1.2 + i * 46) % 140) / 140;
            return (
              <circle
                key={i}
                cx={620 + i * 34}
                cy={640 - t * 170}
                r={5 + i * 2}
                fill="none"
                stroke={SP.faint}
                strokeWidth={3}
                opacity={(1 - t) * 0.8}
              />
            );
          })}
        </g>
        <g opacity={sunkA * 0.85}>
          <PlaneSilhouette x={1300} y={744} scale={0.8} rotate={-12} />
          <circle cx={1404} cy={722} r={13} fill={SP.accent} />
        </g>
      </svg>
      <SmallLabelDiv x={640} y={794} text="エンジンを撃たれた飛行機" />
      <SmallLabelDiv x={1300} y={794} text="記録には残らない" accent />
    </Frame>
  );
};

// div版の小ラベル (svgの外で使う。中央揃え)
const SmallLabelDiv: React.FC<{ x: number; y: number; text: string; accent?: boolean }> = ({
  x,
  y,
  text,
  accent = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 300,
      top: y,
      width: 600,
      textAlign: "center",
      fontFamily: SUURI_FONT,
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: 2,
      color: accent ? SP.accent : SP.ink,
    }}
  >
    {text}
  </div>
);

// ============================================================
// ===== ここから残りのモチーフ (導入〜第4章) =====
// ============================================================

// 中央寄せの説明文 (画面幅いっぱい・中央揃え)
const CenterNote: React.FC<{ top: number; size?: number; children: React.ReactNode }> = ({
  top,
  size = 34,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      width: "100%",
      textAlign: "center",
      fontFamily: SUURI_FONT,
      fontSize: size,
      fontWeight: 700,
      color: SP.ink,
      letterSpacing: 2,
    }}
  >
    {children}
  </div>
);

// きらきら (白い4点星・またたく)。赤は使わない約束 (§9-4)
const Sparkle: React.FC<{ x: number; y: number; s?: number; phase?: number }> = ({
  x,
  y,
  s = 16,
  phase = 0,
}) => {
  const frame = useCurrentFrame();
  const tw = 0.55 + 0.45 * Math.sin(frame / 9 + phase);
  const p = s * 0.18;
  return (
    <path
      d={`M ${x} ${y - s} Q ${x + p} ${y - p} ${x + s} ${y} Q ${x + p} ${y + p} ${x} ${y + s} Q ${x - p} ${y + p} ${x - s} ${y} Q ${x - p} ${y - p} ${x} ${y - s} Z`}
      fill={SP.ink}
      opacity={tw}
    />
  );
};

// スマホの枠。(x, y) = 左上
const Phone: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  children?: React.ReactNode;
}> = ({ x, y, w = 330, h = 600, children }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={34} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
    <line
      x1={x + w / 2 - 40}
      y1={y + 26}
      x2={x + w / 2 + 40}
      y2={y + 26}
      stroke={SP.faint}
      strokeWidth={6}
      strokeLinecap="round"
    />
    {children}
  </g>
);

// ハート (いいね)
const Heart: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({
  x,
  y,
  s = 10,
  color = SP.faint,
}) => (
  <path
    d={`M ${x} ${y + s} C ${x - s * 1.5} ${y - s * 0.5} ${x - s * 0.6} ${y - s * 1.4} ${x} ${y - s * 0.3} C ${x + s * 0.6} ${y - s * 1.4} ${x + s * 1.5} ${y - s * 0.5} ${x} ${y + s} Z`}
    fill={color}
  />
);

// 投稿カード (写真+本文+いいね)。kind で写真の中身が変わる
type CardKind = "travel" | "food" | "pass" | "win" | "plain";
const FeedCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: CardKind;
  opacity?: number;
}> = ({ x, y, w = 280, h = 150, kind = "plain", opacity = 1 }) => {
  const px = x + 16;
  const py = y + 16;
  const ps = h - 56;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={SP.background} stroke={SP.faint} strokeWidth={3} />
      <rect x={px} y={py} width={ps} height={ps} rx={8} fill="none" stroke={SP.line} strokeWidth={3} />
      {kind === "travel" && (
        <g stroke={SP.line} strokeWidth={3} fill="none">
          <path
            d={`M ${px + 6} ${py + ps - 8} L ${px + ps * 0.38} ${py + ps * 0.35} L ${px + ps * 0.62} ${py + ps - 8} Z`}
          />
          <path
            d={`M ${px + ps * 0.5} ${py + ps - 8} L ${px + ps * 0.72} ${py + ps * 0.5} L ${px + ps - 6} ${py + ps - 8} Z`}
          />
          <circle cx={px + ps - 18} cy={py + 18} r={9} />
        </g>
      )}
      {kind === "food" && (
        <g stroke={SP.line} strokeWidth={3} fill="none">
          <path d={`M ${px + 10} ${py + ps * 0.55} Q ${px + ps / 2} ${py + ps + 4} ${px + ps - 10} ${py + ps * 0.55} Z`} />
          <path d={`M ${px + ps * 0.38} ${py + ps * 0.4} q 7 -11 0 -20`} />
          <path d={`M ${px + ps * 0.58} ${py + ps * 0.4} q 7 -11 0 -20`} />
        </g>
      )}
      {kind === "pass" && (
        <g>
          <circle cx={px + ps / 2} cy={py + ps / 2} r={ps * 0.38} fill="none" stroke={SP.line} strokeWidth={4} />
          <text
            x={px + ps / 2}
            y={py + ps / 2 + 9}
            textAnchor="middle"
            fontSize={25}
            fontWeight={700}
            fill={SP.ink}
            fontFamily={SUURI_FONT}
          >
            合格
          </text>
        </g>
      )}
      {kind === "win" && (
        <g>
          <circle cx={px + ps / 2} cy={py + ps / 2} r={ps * 0.3} fill="none" stroke={SP.line} strokeWidth={4} />
          <line
            x1={px + ps / 2 - ps * 0.3}
            y1={py + ps / 2}
            x2={px + ps / 2 + ps * 0.3}
            y2={py + ps / 2}
            stroke={SP.line}
            strokeWidth={3}
          />
          <Sparkle x={px + ps - 12} y={py + 14} s={10} />
        </g>
      )}
      <line x1={px + ps + 14} y1={y + 46} x2={x + w - 18} y2={y + 46} stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
      <line x1={px + ps + 14} y1={y + 74} x2={x + w - 44} y2={y + 74} stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
      <Heart x={px + ps + 26} y={y + h - 30} s={9} />
    </g>
  );
};

// 吹き出し
const Bubble: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  tailTo?: [number, number];
  children?: React.ReactNode;
}> = ({ x, y, w, h, tailTo, children }) => (
  <g>
    {tailTo && (
      <path
        d={`M ${x + w * 0.34} ${y + h - 2} L ${tailTo[0]} ${tailTo[1]} L ${x + w * 0.5} ${y + h - 2} Z`}
        fill={SP.panel}
        stroke={SP.line}
        strokeWidth={4}
      />
    )}
    <rect x={x} y={y} width={w} height={h} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
    {children}
  </g>
);

// ===== futon_phone: 夜、ふとんの中でスマホ (導入の顔) =====
export const FutonPhoneScene: React.FC<SceneProps> = ({ scene }) => {
  const glow = useAppear(10);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "夜、ふとんの中で"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 月と星 (夜) */}
        <path d="M 1610 240 a 56 56 0 1 0 50 82 a 44 44 0 0 1 -50 -82 Z" fill={SP.dim} />
        <Sparkle x={1450} y={200} s={10} phase={1} />
        <Sparkle x={1720} y={380} s={8} phase={3} />
        {/* 床 */}
        <line x1={320} y1={820} x2={1620} y2={820} stroke={SP.dim} strokeWidth={4} />
        {/* まくら と 顔 */}
        <rect x={470} y={716} width={170} height={56} rx={18} fill="none" stroke={SP.line} strokeWidth={5} />
        <circle cx={556} cy={676} r={34} fill="none" stroke={SP.line} strokeWidth={5} />
        {/* ふとん (体を覆う) */}
        <path
          d="M 610 820 L 610 740 Q 620 668 720 660 L 1420 660 Q 1500 668 1504 740 L 1504 820 Z"
          fill={SP.panel}
          stroke={SP.line}
          strokeWidth={5}
        />
        <path d="M 610 756 Q 1050 724 1504 756" fill="none" stroke={SP.dim} strokeWidth={4} />
        {/* スマホ (顔の上にかかげる) と 画面の明かり */}
        <g opacity={glow}>
          <polygon points="590,560 700,560 760,660 530,660" fill={SP.ink} opacity={0.1} />
          <rect x={596} y={470} width={96} height={150} rx={16} transform="rotate(14 644 545)" fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <Sparkle x={700} y={450} s={13} phase={0} />
          <Sparkle x={590} y={414} s={10} phase={2} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kirakira_feed: 画面の中は友達のキラキラ投稿 =====
export const KirakiraFeedScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "画面の中は、きらきら"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Phone x={690} y={190} w={360} h={620}>
          {(["travel", "food", "pass"] as CardKind[]).map((k, i) => (
            <g key={k} opacity={appearAt(frame, fps, 10 + i * 10)}>
              <FeedCard x={730} y={248 + i * 180} w={280} h={160} kind={k} />
            </g>
          ))}
        </Phone>
        {/* まわりのきらきら */}
        <Sparkle x={620} y={260} s={16} phase={0} />
        <Sparkle x={1120} y={320} s={20} phase={2} />
        <Sparkle x={1150} y={620} s={13} phase={4} />
        <Sparkle x={600} y={700} s={12} phase={1} />
        <Sparkle x={1080} y={170} s={11} phase={5} />
        {/* 右側の説明 */}
        <SmallLabel x={1340} y={360} text="旅行" color={SP.ink} size={34} weight={700} />
        <SmallLabel x={1340} y={540} text="ごちそう" color={SP.ink} size={34} weight={700} />
        <SmallLabel x={1340} y={720} text="合格" color={SP.ink} size={34} weight={700} />
        <g stroke={SP.faint} strokeWidth={3}>
          <line x1={1030} y1={330} x2={1280} y2={350} />
          <line x1={1030} y1={510} x2={1260} y2={530} />
          <line x1={1030} y1={690} x2={1280} y2={710} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== scroll_forever: スクロールしても、きらきら =====
export const ScrollForeverScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const kinds: CardKind[] = ["travel", "win", "food", "pass", "travel", "win", "food", "pass"];
  const step = 180;
  const offset = (frame * 3.2) % step;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "スクロールしても、きらきら"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="scrollClip">
            <rect x={708} y={244} width={324} height={520} rx={18} />
          </clipPath>
        </defs>
        <Phone x={690} y={190} w={360} h={620} />
        <g clipPath="url(#scrollClip)">
          {kinds.map((k, i) => (
            <FeedCard key={i} x={730} y={260 + i * step - offset} w={280} h={160} kind={k} />
          ))}
        </g>
        {/* 指のスワイプ軌跡 */}
        <g stroke={SP.faint} strokeWidth={5} strokeLinecap="round" fill="none">
          <path d="M 1150 640 Q 1190 500 1150 360" strokeDasharray="2 16" />
          <path d="M 1136 390 L 1150 352 L 1166 390" />
        </g>
        <Sparkle x={620} y={300} s={14} phase={0} />
        <Sparkle x={1240} y={260} s={17} phase={2} />
        <Sparkle x={1280} y={660} s={12} phase={4} />
        <Sparkle x={580} y={620} s={11} phase={1} />
      </svg>
      <CenterNote top={812} size={30}>どこまでいっても、きらきら</CenterNote>
    </Frame>
  );
};

// ===== alone_sigh: 「自分だけ、何もない毎日」 =====
export const AloneSighScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const a = useAppear(12);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "「自分だけ、何もない毎日だな」"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={420} y1={800} x2={1500} y2={800} stroke={SP.dim} strokeWidth={4} />
        {/* うつむく人 (少し前かがみ) */}
        <g transform="rotate(10 960 640)">
          <Person x={960} y={560} scale={2.6} />
        </g>
        {/* ため息 */}
        <g opacity={a}>
          {[0, 1, 2].map((i) => {
            const t = ((frame * 0.9 + i * 34) % 100) / 100;
            return (
              <circle
                key={i}
                cx={830 - t * 90 - i * 10}
                cy={600 - t * 110}
                r={7 + i * 4}
                fill="none"
                stroke={SP.faint}
                strokeWidth={4}
                opacity={(1 - t) * 0.8}
              />
            );
          })}
          <SmallLabel x={700} y={430} text="はぁ…" color={SP.faint} size={40} />
        </g>
        {/* かたわらのスマホ (伏せてある) */}
        <rect x={1150} y={786} width={150} height={16} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
      </svg>
    </Frame>
  );
};

// ===== world_vs_screen: キラキラなのは世界? 画面? (結論の絵) =====
export const WorldVsScreenScene: React.FC<SceneProps> = ({ scene }) => {
  const text = scene?.text ?? "";
  // 「あなたの画面です」側の文なら、画面を赤い丸で囲む
  const pickScreen = /画面/.test(text) && !/世界ではありません/.test(text);
  const ring = useAppear(16);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "キラキラしているのは、どっち?"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 世界 (地球) */}
        <g stroke={SP.line} strokeWidth={5} fill="none">
          <circle cx={560} cy={490} r={170} />
          <ellipse cx={560} cy={490} rx={75} ry={170} />
          <ellipse cx={560} cy={490} rx={140} ry={170} opacity={0.4} />
          <line x1={398} y1={440} x2={722} y2={440} />
          <line x1={398} y1={545} x2={722} y2={545} />
        </g>
        <SmallLabel x={560} y={752} text="世界" color={SP.ink} size={38} weight={700} />
        {/* 世界ではありません → 赤の斜線 */}
        {!pickScreen && (
          <g opacity={ring} stroke={SP.accent} strokeWidth={10} strokeLinecap="round">
            <line x1={430} y1={360} x2={690} y2={620} />
            <line x1={690} y1={360} x2={430} y2={620} />
          </g>
        )}
        {/* 右: あなたの画面 */}
        <Phone x={1200} y={250} w={300} h={480}>
          <FeedCard x={1232} y={300} w={236} h={130} kind="travel" />
          <FeedCard x={1232} y={450} w={236} h={130} kind="win" />
        </Phone>
        <Sparkle x={1160} y={300} s={14} phase={0} />
        <Sparkle x={1540} y={380} s={17} phase={2} />
        <Sparkle x={1530} y={650} s={12} phase={4} />
        <SmallLabel x={1350} y={792} text="あなたの画面" color={SP.ink} size={38} weight={700} />
        {/* 画面です → 赤い丸で囲む */}
        {pickScreen && (
          <ellipse
            cx={1350}
            cy={490}
            rx={230 * (0.7 + 0.3 * ring)}
            ry={255 * (0.7 + 0.3 * ring)}
            fill="none"
            stroke={SP.accent}
            strokeWidth={9}
            opacity={ring}
          />
        )}
      </svg>
    </Frame>
  );
};

// ===== selection_gates: 画面に届くまでに何回も「選ばれて」いる =====
export const SelectionGatesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 世界のできごと (左の点の群れ)
  const dots: [number, number][] = [];
  for (let i = 0; i < 24; i++) {
    dots.push([250 + (i % 4) * 90 + (i % 3) * 14, 330 + Math.floor(i / 4) * 68 + (i % 2) * 16]);
  }
  const gates = [820, 1130, 1440];
  const gateLabels = ["投稿される", "よく流れる", "上に出る"];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "画面に届くまでに、何回も選ばれる"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={9} fill={SP.faint} opacity={0.9} />
        ))}
        <SmallLabel x={430} y={820} text="世界のできごと ぜんぶ" color={SP.faint} size={30} />
        {/* 3つの関門 */}
        {gates.map((gx, gi) => (
          <g key={gx} opacity={appearAt(frame, fps, 10 + gi * 8)}>
            <line x1={gx} y1={270} x2={gx} y2={468} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
            <line x1={gx} y1={548} x2={gx} y2={746} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
            <SmallLabel x={gx} y={820} text={gateLabels[gi]} color={SP.ink} size={28} weight={700} />
          </g>
        ))}
        {/* 関門を抜けるたびに減っていく点 */}
        {[
          [905, 420], [925, 530], [950, 600], [895, 480], [940, 350], [912, 560], [958, 450], [930, 640],
        ].map(([x, y], i) => (
          <circle key={`a${i}`} cx={x} cy={y} r={9} fill={SP.faint} opacity={appearAt(frame, fps, 18)} />
        ))}
        {[
          [1230, 460], [1265, 540], [1248, 400],
        ].map(([x, y], i) => (
          <circle key={`b${i}`} cx={x} cy={y} r={9} fill={SP.faint} opacity={appearAt(frame, fps, 26)} />
        ))}
        {/* 最後に生き残った1つ (赤) → スマホへ */}
        <circle cx={1560} cy={500} r={11} fill={SP.accent} opacity={appearAt(frame, fps, 34)} />
        <g opacity={appearAt(frame, fps, 34)}>
          <rect x={1650} y={400} width={120} height={208} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <SmallLabel x={1710} y={660} text="あなたの画面" color={SP.ink} size={26} weight={700} />
        </g>
        {/* 流れの矢印 */}
        <g stroke={SP.dim} strokeWidth={4} fill="none">
          <line x1={640} y1={508} x2={790} y2={508} />
          <line x1={980} y1={508} x2={1100} y2={508} />
          <line x1={1290} y1={508} x2={1410} y2={508} />
          <line x1={1470} y1={508} x2={1620} y2={508} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== homerun_tv: 夜のスポーツニュースのホームラン集 =====
export const HomerunTvScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fly = appearAt(frame, fps, 14);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日のホームラン集"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* テレビ */}
        <rect x={610} y={240} width={700} height={440} rx={22} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
        <line x1={860} y1={690} x2={820} y2={760} stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
        <line x1={1060} y1={690} x2={1100} y2={760} stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
        {/* 画面の中: 打った瞬間 */}
        <g>
          <Person x={790} y={520} scale={1.5} />
          <line x1={810} y1={540} x2={880} y2={460} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
          <path
            d={`M 880 470 Q 1020 330 1200 310`}
            fill="none"
            stroke={SP.faint}
            strokeWidth={4}
            strokeDasharray="4 12"
            opacity={fly}
          />
          <circle cx={880 + 320 * fly} cy={470 - 158 * fly} r={11} fill={SP.ink} opacity={fly} />
        </g>
        <text x={1250} y={310} textAnchor="end" fontSize={30} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={2}>
          ホームラン集
        </text>
        <Sparkle x={700} y={310} s={13} phase={0} />
        <Sparkle x={1240} y={610} s={12} phase={3} />
      </svg>
      <CenterNote top={812} size={30}>打った瞬間だけが、次々と流れる</CenterNote>
    </Frame>
  );
};

// ===== batter: 600打席で40本 =====
export const BatterScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fly = appearAt(frame, fps, 12);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "一流のホームランバッター"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={240} y1={780} x2={1680} y2={780} stroke={SP.dim} strokeWidth={4} />
        {/* バッター */}
        <Person x={430} y={560} scale={2.1} />
        <line x1={460} y1={590} x2={560} y2={470} stroke={SP.line} strokeWidth={10} strokeLinecap="round" />
        {/* 打球 */}
        <path d="M 560 480 Q 980 220 1430 330" fill="none" stroke={SP.faint} strokeWidth={4} strokeDasharray="4 14" opacity={fly} />
        <circle cx={560 + 870 * fly} cy={480 - (1 - (2 * fly - 1) ** 2) * 220 - 150 * fly} r={12} fill={SP.ink} opacity={fly} />
        {/* 数字パネル */}
        <g opacity={appearAt(frame, fps, 22)}>
          <rect x={1130} y={430} width={520} height={260} rx={16} fill="none" stroke={SP.dim} strokeWidth={4} />
          <text x={1390} y={530} textAnchor="middle" fontSize={44} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT}>
            1年に 600打席
          </text>
          <text x={1390} y={630} textAnchor="middle" fontSize={44} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT}>
            ホームラン 40本
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// ===== not_sad_viewer: 見ても落ち込まない人 =====
export const NotSadViewerScene: React.FC<SceneProps> = ({ scene }) => {
  const a = useAppear(18);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "くらべて落ち込む人は、いない"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={300} y1={780} x2={1620} y2={780} stroke={SP.dim} strokeWidth={4} />
        {/* テレビ (小) */}
        <rect x={380} y={370} width={420} height={290} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        <line x1={540} y1={665} x2={515} y2={720} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
        <line x1={660} y1={665} x2={685} y2={720} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
        <Person x={500} y={520} scale={1.0} />
        <line x1={515} y1={535} x2={560} y2={482} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
        <Sparkle x={700} y={440} s={11} phase={1} />
        {/* ソファの人 */}
        <rect x={1120} y={640} width={420} height={120} rx={26} fill="none" stroke={SP.line} strokeWidth={5} />
        <rect x={1120} y={530} width={420} height={120} rx={26} fill="none" stroke={SP.line} strokeWidth={5} />
        <Person x={1330} y={480} scale={1.8} />
        {/* 吹き出し (感心するだけ) */}
        <g opacity={a}>
          <Bubble x={1050} y={250} w={520} h={130} tailTo={[1310, 440]}>
            <text x={1310} y={332} textAnchor="middle" fontSize={38} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={2}>
              プロはすごいなあ
            </text>
          </Bubble>
        </g>
      </svg>
    </Frame>
  );
};

// ===== fail_7of10: 超一流でも10回のうち7回は失敗 =====
export const Fail7of10Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 10球: 3つだけ成功 (白)、7つは失敗 (薄い×)
  const hits = new Set([2, 5, 8]);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "超一流バッターの現実"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const x = 350 + i * 136;
          const y = 460;
          const a = appearAt(frame, fps, 8 + i * 3);
          const hit = hits.has(i);
          return (
            <g key={i} opacity={a}>
              <circle cx={x} cy={y} r={46} fill="none" stroke={hit ? SP.line : SP.dim} strokeWidth={5} />
              {/* ボールの縫い目 */}
              <path d={`M ${x - 28} ${y - 32} q 14 32 0 64`} fill="none" stroke={hit ? SP.line : SP.dim} strokeWidth={3} />
              <path d={`M ${x + 28} ${y - 32} q -14 32 0 64`} fill="none" stroke={hit ? SP.line : SP.dim} strokeWidth={3} />
              {hit ? (
                <Sparkle x={x + 40} y={y - 44} s={13} phase={i} />
              ) : (
                <g stroke={SP.faint} strokeWidth={6} strokeLinecap="round" opacity={0.9}>
                  <line x1={x - 22} y1={y - 22} x2={x + 22} y2={y + 22} />
                  <line x1={x + 22} y1={y - 22} x2={x - 22} y2={y + 22} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <CenterNote top={610} size={38}>
        10回のうち <span style={{ color: SP.accent }}>7回は失敗</span> する
      </CenterNote>
      <CenterNote top={690} size={28}>
        <span style={{ color: SP.faint, fontWeight: 400 }}>それでも「超一流」と呼ばれる</span>
      </CenterNote>
    </Frame>
  );
};

// ===== hr_divide: 600 ÷ 40 = 15回に1回 =====
export const HrDivideScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ホームランは、何回に1回?"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={960} y={430} textAnchor="middle" fontSize={92} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={6} opacity={appearAt(frame, fps, 8)}>
          600 ÷ 40 =
          <tspan fill={SP.accent}> 15</tspan>
        </text>
        <g opacity={appearAt(frame, fps, 24)}>
          <text x={960} y={560} textAnchor="middle" fontSize={46} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={3}>
            ホームランは 15回に 1回
          </text>
        </g>
        {/* 15打席のうち1つだけ光る */}
        <g opacity={appearAt(frame, fps, 34)}>
          {Array.from({ length: 15 }).map((_, i) => {
            const x = 420 + i * 78;
            return <circle key={i} cx={x} cy={680} r={17} fill="none" stroke={i === 14 ? SP.line : SP.dim} strokeWidth={4} />;
          })}
          <Sparkle x={420 + 14 * 78} y={636} s={14} phase={0} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== juice: 濃縮ジュース (15分の1 → 7200倍の原液) =====
export const JuiceScene: React.FC<SceneProps> = ({ scene }) => {
  const text = scene?.text ?? "";
  const genEki = /7200|原液|むせる/.test(text); // 原液モード
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glass = (cx: number, cy: number, s: number, fillRatio: number, dense: boolean) => (
    <g transform={`translate(${cx}, ${cy}) scale(${s})`}>
      <path
        d={`M -70 -95 L ${-70 + 24 * fillRatio * 0 + 0} -95`}
        fill="none"
      />
      {/* 中身 */}
      <path
        d={`M ${-70 + 10} ${95 - 170 * fillRatio} L ${70 - 10} ${95 - 170 * fillRatio} L ${52} ${80} Q 0 96 -52 80 Z`}
        fill={SP.ikura}
        opacity={dense ? 0.95 : 0.45}
      />
      {/* グラス */}
      <path d="M -70 -95 L 70 -95 L 52 80 Q 0 96 -52 80 Z" fill="none" stroke={SP.line} strokeWidth={5} />
    </g>
  );
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (genEki ? "7200倍濃縮の原液" : "現実をしぼった、濃縮ジュース")} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {!genEki && (
          <>
            {/* 左: うすい15杯 */}
            {Array.from({ length: 15 }).map((_, i) => {
              const gx = 330 + (i % 5) * 110;
              const gy = 360 + Math.floor(i / 5) * 160;
              return (
                <g key={i} opacity={appearAt(frame, fps, 6 + i * 2)}>
                  {glass(gx, gy, 0.42, 0.8, false)}
                </g>
              );
            })}
            <SmallLabel x={550} y={810} text="ふだんの打席 ぜんぶ" color={SP.faint} size={30} />
            {/* 矢印 */}
            <g stroke={SP.line} strokeWidth={7} strokeLinecap="round" opacity={appearAt(frame, fps, 30)}>
              <line x1={950} y1={500} x2={1130} y2={500} />
              <path d="M 1096 470 L 1140 500 L 1096 530" fill="none" />
            </g>
            {/* 右: ぎゅっと1杯 */}
            <g opacity={appearAt(frame, fps, 36)}>
              {glass(1400, 500, 1.15, 0.92, true)}
              <SmallLabel x={1400} y={720} text="ホームラン集" color={SP.ink} size={32} weight={700} />
            </g>
          </>
        )}
        {genEki && (
          <>
            <g opacity={appearAt(frame, fps, 8)}>{glass(960, 490, 1.5, 0.95, true)}</g>
            {/* 濃さの線 */}
            <g stroke={SP.background} strokeWidth={3} opacity={0.5}>
              <line x1={880} y1={450} x2={1040} y2={450} />
              <line x1={874} y1={510} x2={1046} y2={510} />
            </g>
          </>
        )}
      </svg>
      {!genEki && (
        <CenterNote top={210} size={32}>
          現実を <span style={{ color: SP.accent }}>15分の1</span> に、ぎゅっとしぼる
        </CenterNote>
      )}
      {genEki && (
        <CenterNote top={740} size={36}>
          <span style={{ color: SP.accent }}>7200倍濃縮</span> ─ そのまま飲んだら、むせる
        </CenterNote>
      )}
    </Frame>
  );
};

// ===== life_homerun: 友達の投稿 = 人生のホームラン集 =====
export const LifeHomerunScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "友達の投稿の、正体"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Phone x={430} y={210} w={340} h={580}>
          <FeedCard x={466} y={266} w={268} h={150} kind="travel" />
          <FeedCard x={466} y={436} w={268} h={150} kind="food" />
          <FeedCard x={466} y={606} w={268} h={150} kind="pass" />
        </Phone>
        <Sparkle x={400} y={260} s={13} phase={0} />
        <Sparkle x={820} y={320} s={15} phase={2} />
        <Sparkle x={810} y={700} s={11} phase={4} />
        {/* = */}
        <g stroke={SP.line} strokeWidth={10} strokeLinecap="round" opacity={appearAt(frame, fps, 16)}>
          <line x1={930} y1={470} x2={1030} y2={470} />
          <line x1={930} y1={520} x2={1030} y2={520} />
        </g>
        {/* 右: ベスト盤 (ホームラン集のジャケット) */}
        <g opacity={appearAt(frame, fps, 24)}>
          <rect x={1130} y={300} width={400} height={400} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <Person x={1270} y={500} scale={1.3} />
          <line x1={1288} y1={518} x2={1350} y2={448} stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
          <path d="M 1350 455 Q 1420 390 1480 380" fill="none" stroke={SP.faint} strokeWidth={4} strokeDasharray="4 12" />
          <circle cx={1472} cy={382} r={9} fill={SP.ink} />
          <text x={1330} y={660} textAnchor="middle" fontSize={34} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={2}>
            人生の
            <tspan fill={SP.accent}>ホームラン集</tspan>
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// ===== gacha_shine: 当たった人は、うれしくて投稿する =====
export const GachaShineScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const burst = appearAt(frame, fps, 10);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "当たった人は、投稿する"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 開いたカプセルと放射光 */}
        <g opacity={burst} stroke={SP.line} strokeWidth={4}>
          {[-80, -45, -10, 25, 60, 95, 130, 215].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={620 + Math.cos(rad) * 150}
                y1={480 + Math.sin(rad) * 150}
                x2={620 + Math.cos(rad) * 205}
                y2={480 + Math.sin(rad) * 205}
              />
            );
          })}
        </g>
        <g>
          <path d="M 500 480 a 120 120 0 0 1 240 0 Z" fill={SP.panel} stroke={SP.line} strokeWidth={6} transform={`rotate(${-14 * burst} 620 480)`} />
          <path d="M 500 492 a 120 120 0 0 0 240 0 Z" fill="none" stroke={SP.line} strokeWidth={6} />
        </g>
        <Sparkle x={620} y={400} s={18} phase={0} />
        <text x={620} y={760} textAnchor="middle" fontSize={40} fontWeight={700} fill={SP.accent} fontFamily={SUURI_FONT} letterSpacing={4} opacity={burst}>
          激レア!
        </text>
        {/* 矢印 */}
        <g stroke={SP.line} strokeWidth={6} strokeLinecap="round" opacity={appearAt(frame, fps, 22)}>
          <line x1={880} y1={500} x2={1040} y2={500} />
          <path d="M 1008 472 L 1050 500 L 1008 528" fill="none" />
        </g>
        {/* 右: スクショ投稿 */}
        <g opacity={appearAt(frame, fps, 28)}>
          <Phone x={1150} y={250} w={300} h={500}>
            <FeedCard x={1182} y={320} w={236} h={150} kind="win" />
          </Phone>
          <SmallLabel x={1300} y={560} text="「当たった!」" color={SP.ink} size={32} weight={700} />
          <Sparkle x={1500} y={300} s={14} phase={2} />
          <SmallLabel x={1300} y={810} text="スクショを投稿" color={SP.faint} size={30} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== gacha_close: 外れた人は、そっとアプリを閉じる =====
export const GachaCloseScene: React.FC<SceneProps> = ({ scene }) => {
  const a = useAppear(14);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "外れた人は、何も言わない"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={380} y1={760} x2={1540} y2={760} stroke={SP.dim} strokeWidth={4} />
        {/* 外れカプセル (薄い) */}
        <g opacity={0.5}>
          <circle cx={560} cy={560} r={95} fill="none" stroke={SP.dim} strokeWidth={6} />
          <line x1={465} y1={560} x2={655} y2={560} stroke={SP.dim} strokeWidth={5} />
          <g stroke={SP.faint} strokeWidth={6} strokeLinecap="round">
            <line x1={520} y1={520} x2={600} y2={600} />
            <line x1={600} y1={520} x2={520} y2={600} />
          </g>
        </g>
        <SmallLabel x={560} y={720} text="外れ" color={SP.faint} size={30} />
        {/* うつむいてスマホを伏せる人 */}
        <g transform="rotate(8 1150 600)">
          <Person x={1150} y={520} scale={2.2} />
        </g>
        <rect x={1240} y={744} width={160} height={18} rx={9} fill={SP.panel} stroke={SP.line} strokeWidth={4} opacity={a} />
        <SmallLabel x={1320} y={810} text="そっとアプリを閉じる" color={SP.faint} size={30} />
        {/* 無言 */}
        <g opacity={a}>
          <SmallLabel x={1000} y={400} text="……" color={SP.faint} size={44} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== timeline_wins: タイムラインは当選報告だらけ =====
export const TimelineWinsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "タイムラインは、当選報告だらけ"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Phone x={700} y={185} w={360} h={630}>
          {Array.from({ length: 3 }).map((_, i) => (
            <g key={i} opacity={appearAt(frame, fps, 8 + i * 8)}>
              <FeedCard x={740} y={246 + i * 186} w={280} h={166} kind="win" />
              <text x={905} y={360 + i * 186} fontSize={25} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT}>
                当たった!
              </text>
            </g>
          ))}
        </Phone>
        <Sparkle x={1120} y={280} s={15} phase={1} />
        <Sparkle x={640} y={560} s={12} phase={3} />
        {/* 右: 本当の確率 */}
        <g opacity={appearAt(frame, fps, 26)}>
          <rect x={1210} y={360} width={470} height={240} rx={16} fill="none" stroke={SP.dim} strokeWidth={4} />
          <text x={1445} y={460} textAnchor="middle" fontSize={40} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={2}>
            当たる確率
          </text>
          <text x={1445} y={550} textAnchor="middle" fontSize={56} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT} letterSpacing={2}>
            1%
          </text>
        </g>
      </svg>
      <CenterNote top={806} size={28}>
        <span style={{ color: SP.faint, fontWeight: 400 }}>外れた99%は、画面に流れてこない</span>
      </CenterNote>
    </Frame>
  );
};

// ============================================================
// ===== 第2章: あなたの画面は何倍濃縮か =====
// ============================================================

// ===== camera_roll: あなたのカメラロール (NGだらけ) =====
export const CameraRollScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kinds = [
    "blur", "finger", "face", "blur",
    "blur", "face", "blur", "finger",
    "blur", "good", "blur", "face",
  ] as const;
  const cw = 200;
  const ch = 140;
  const gap = 24;
  const x0 = 960 - (4 * cw + 3 * gap) / 2;
  const y0 = 230;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "あなたのカメラロール"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {kinds.map((k, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = x0 + col * (cw + gap);
          const y = y0 + row * (ch + gap);
          const a = appearAt(frame, fps, 6 + i * 3);
          return (
            <g key={i} opacity={a}>
              <rect x={x} y={y} width={cw} height={ch} rx={10} fill={SP.panel} stroke={SP.dim} strokeWidth={3} />
              {k === "blur" && (
                <g stroke={SP.faint} strokeWidth={5} fill="none" strokeLinecap="round">
                  <path d={`M ${x + 30} ${y + 55} q 35 -22 70 0 q 35 22 70 0`} />
                  <path d={`M ${x + 30} ${y + 92} q 35 -22 70 0 q 35 22 70 0`} />
                </g>
              )}
              {k === "finger" && (
                <g>
                  <clipPath id={`camcell-${i}`}>
                    <rect x={x} y={y} width={cw} height={ch} rx={10} />
                  </clipPath>
                  <g clipPath={`url(#camcell-${i})`}>
                    <circle cx={x + cw / 2} cy={y + ch / 2} r={24} fill="none" stroke={SP.faint} strokeWidth={4} />
                    <ellipse cx={x + cw - 30} cy={y + ch - 24} rx={64} ry={46} fill={SP.dim} />
                  </g>
                </g>
              )}
              {k === "face" && (
                <g stroke={SP.faint} strokeWidth={4} fill="none">
                  <circle cx={x + cw / 2} cy={y + ch / 2 - 6} r={34} />
                  <line x1={x + cw / 2 - 14} y1={y + ch / 2 - 16} x2={x + cw / 2 - 5} y2={y + ch / 2 - 10} />
                  <line x1={x + cw / 2 + 14} y1={y + ch / 2 - 16} x2={x + cw / 2 + 5} y2={y + ch / 2 - 10} />
                  <path d={`M ${x + cw / 2 - 14} ${y + ch / 2 + 14} q 7 -10 14 0 q 7 10 14 0`} />
                </g>
              )}
              {k === "good" && (
                <g>
                  <g stroke={SP.line} strokeWidth={4} fill="none">
                    <path d={`M ${x + 24} ${y + ch - 24} L ${x + 80} ${y + 46} L ${x + 136} ${y + ch - 24} Z`} />
                    <path d={`M ${x + 104} ${y + ch - 24} L ${x + 146} ${y + 76} L ${x + cw - 16} ${y + ch - 24} Z`} />
                  </g>
                  <Sparkle x={x + cw - 32} y={y + 34} s={13} phase={2} />
                </g>
              )}
            </g>
          );
        })}
        <SmallLabel x={960} y={768} text="ブレ・ゆび・変な顔が、ぎっしり" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// ===== pick_1of100: 100枚から奇跡の1枚 (濃縮一段目) =====
export const Pick1of100Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showX100 = /100倍/.test(scene?.text ?? "");
  const fan = [-30, -21, -12, -4, 4, 12, 21, 30];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "100枚から、奇跡の1枚"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 100枚の扇 */}
        {fan.map((r, i) => (
          <g key={i} transform={`rotate(${r} 480 660)`} opacity={appearAt(frame, fps, 4 + i * 2)}>
            <rect x={400} y={330} width={160} height={220} rx={8} fill={SP.panel} stroke={SP.faint} strokeWidth={3} />
            <path d="M 420 520 q 30 -20 60 0 q 30 20 60 0" fill="none" stroke={SP.dim} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
        <SmallLabel x={480} y={790} text="旅行で撮った 100枚" color={SP.ink} size={32} weight={700} />
        {/* 矢印 */}
        <g opacity={appearAt(frame, fps, 20)}>
          <line x1={740} y1={500} x2={1020} y2={500} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
          <path d="M 1020 500 l -34 -20 v 40 Z" fill={SP.line} />
        </g>
        {/* 右: 奇跡の1枚 */}
        <g opacity={appearAt(frame, fps, 28)}>
          <rect x={1170} y={300} width={300} height={400} rx={12} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <g stroke={SP.line} strokeWidth={5} fill="none">
            <path d="M 1210 620 L 1300 440 L 1390 620 Z" />
            <path d="M 1340 620 L 1402 500 L 1446 620 Z" />
            <circle cx={1414} cy={380} r={22} />
          </g>
          <Sparkle x={1210} y={344} s={16} phase={1} />
          <Sparkle x={1500} y={290} s={13} phase={4} />
          <SmallLabel x={1320} y={790} text="投稿する 奇跡の1枚" color={SP.ink} size={32} weight={700} />
        </g>
        {showX100 && (
          <text
            x={960}
            y={262}
            textAnchor="middle"
            fontSize={64}
            fontWeight={800}
            fill={SP.accent}
            fontFamily={SUURI_FONT}
            letterSpacing={3}
            opacity={appearAt(frame, fps, 34)}
          >
            100倍濃縮
          </text>
        )}
      </svg>
    </Frame>
  );
};

// ===== calendar_10: 365日のうち特別な10日 (濃縮二段目) =====
export const Calendar10Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const has36 = /36倍|およそ36/.test(scene?.text ?? "");
  const cols = 37;
  const cell = 22;
  const gap = 4;
  const gx = 960 - (cols * (cell + gap) - gap) / 2;
  const gy = 280;
  const special = new Set([20, 55, 98, 130, 170, 205, 240, 280, 310, 350]);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "投稿したくなる日は、1年に10日"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect x={460} y={222} width={1000} height={540} rx={18} fill={SP.panel} stroke={SP.dim} strokeWidth={4} />
        <SmallLabel x={960} y={262} text="1年 = 365日" color={SP.faint} size={28} />
        {Array.from({ length: 365 }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const sp = special.has(i);
          const a = appearAt(frame, fps, 4 + row * 2);
          return (
            <rect
              key={i}
              x={gx + col * (cell + gap)}
              y={gy + row * (cell + gap)}
              width={cell}
              height={cell}
              rx={3}
              fill={sp ? SP.ink : "none"}
              stroke={sp ? SP.ink : SP.dim}
              strokeWidth={2}
              opacity={a}
            />
          );
        })}
        <g opacity={appearAt(frame, fps, 26)}>
          <text x={960} y={626} textAnchor="middle" fontSize={38} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={2}>
            特別な日は{" "}
            <tspan fill={has36 ? SP.ink : SP.accent} fontWeight={800}>
              10日
            </tspan>
            だけ
          </text>
          <text x={960} y={706} textAnchor="middle" fontSize={44} fontWeight={800} fill={has36 ? SP.accent : SP.faint} fontFamily={SUURI_FONT} letterSpacing={3}>
            {has36 ? "365 ÷ 10 ≒ 36倍" : "何もない355日は、画面に出ない"}
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// ===== rank_up: 人気投稿ほど上に表示 (濃縮三段目) =====
export const RankUpScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const has2 = /2倍/.test(scene?.text ?? "");
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "人気の投稿ほど、上に表示"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 上: 人気投稿 */}
        <g opacity={appearAt(frame, fps, 8)}>
          <FeedCard x={760} y={220} w={400} h={170} kind="travel" />
          <Sparkle x={1190} y={250} s={15} phase={1} />
          <Sparkle x={730} y={300} s={12} phase={3} />
          <SmallLabel x={1330} y={320} text="いいね 1200" color={SP.ink} size={34} weight={700} anchor="start" />
        </g>
        {/* 下: ふつうの投稿 (うすい) */}
        <g opacity={0.45}>
          <FeedCard x={760} y={430} w={400} h={170} kind="plain" />
          <SmallLabel x={1330} y={530} text="いいね 3" color={SP.faint} size={30} anchor="start" />
          <FeedCard x={760} y={640} w={400} h={170} kind="plain" />
          <SmallLabel x={1330} y={740} text="いいね 2" color={SP.faint} size={30} anchor="start" />
        </g>
        {/* 赤い上向き矢印 */}
        <g opacity={appearAt(frame, fps, 18)}>
          <line x1={650} y1={700} x2={650} y2={300} stroke={SP.accent} strokeWidth={10} strokeLinecap="round" />
          <path d="M 650 270 l -26 44 h 52 Z" fill={SP.accent} />
        </g>
        {has2 && (
          <text x={1480} y={470} fontSize={72} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT} opacity={appearAt(frame, fps, 26)}>
            ×2
          </text>
        )}
      </svg>
    </Frame>
  );
};

// ===== multiply_calc: 100 × 36 × 2 = 7200 =====
export const MultiplyCalcScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = scene?.text ?? "";
  const revealed = /7200/.test(t);
  const hl = revealed ? -1 : /100倍/.test(t) ? 0 : /36倍/.test(t) ? 1 : /2倍/.test(t) ? 2 : -1;
  const factors = [
    { v: "100", cap: "奇跡の1枚", cx: 350 },
    { v: "36", cap: "特別な10日", cx: 690 },
    { v: "2", cap: "上に表示", cx: 1030 },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "三段まとめて、掛け算"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {factors.map((f, i) => (
          <g key={i} opacity={appearAt(frame, fps, 8 + i * 12)}>
            <rect
              x={f.cx - 125}
              y={380}
              width={250}
              height={150}
              rx={16}
              fill={SP.panel}
              stroke={hl === i ? SP.accent : SP.line}
              strokeWidth={hl === i ? 8 : 5}
            />
            <text x={f.cx} y={478} textAnchor="middle" fontSize={64} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>
              {f.v}
            </text>
            <SmallLabel x={f.cx} y={580} text={f.cap} color={SP.faint} size={27} />
          </g>
        ))}
        <text x={520} y={475} textAnchor="middle" fontSize={56} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT} opacity={appearAt(frame, fps, 20)}>
          ×
        </text>
        <text x={860} y={475} textAnchor="middle" fontSize={56} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT} opacity={appearAt(frame, fps, 32)}>
          ×
        </text>
        <text x={1200} y={475} textAnchor="middle" fontSize={56} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT} opacity={appearAt(frame, fps, 44)}>
          ＝
        </text>
        <g opacity={appearAt(frame, fps, 52)}>
          <rect
            x={1290}
            y={360}
            width={360}
            height={190}
            rx={16}
            fill={SP.panel}
            stroke={revealed ? SP.accent : SP.dim}
            strokeWidth={revealed ? 8 : 4}
            strokeDasharray={revealed ? undefined : "12 10"}
          />
          <text
            x={1470}
            y={485}
            textAnchor="middle"
            fontSize={revealed ? 84 : 72}
            fontWeight={800}
            fill={revealed ? SP.accent : SP.faint}
            fontFamily={SUURI_FONT}
            letterSpacing={2}
          >
            {revealed ? "7200" : "?"}
          </text>
          {revealed && <SmallLabel x={1470} y={600} text="倍の濃縮" color={SP.ink} size={34} weight={700} />}
        </g>
      </svg>
    </Frame>
  );
};

// ===== ng_film: あなただけのNG集 (フィルム) =====
export const NgFilmScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labels = ["道に迷った1時間", "無言の電車", "ブレた写真", "ポテチの夜"];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "あなただけが見られる、NG集"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect x={300} y={400} width={1320} height={240} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        {Array.from({ length: 21 }).map((_, i) => (
          <g key={i}>
            <rect x={320 + i * 62} y={412} width={20} height={18} rx={4} fill={SP.background} />
            <rect x={320 + i * 62} y={610} width={20} height={18} rx={4} fill={SP.background} />
          </g>
        ))}
        {labels.map((lb, i) => {
          const x = 340 + i * 320;
          const a = appearAt(frame, fps, 8 + i * 8);
          return (
            <g key={i} opacity={a}>
              <rect x={x} y={444} width={280} height={152} rx={6} fill={SP.background} stroke={SP.dim} strokeWidth={3} />
              {i === 0 && (
                <g>
                  <Person x={x + 120} y={480} scale={0.75} />
                  <text x={x + 185} y={505} fontSize={40} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT}>
                    ?
                  </text>
                </g>
              )}
              {i === 1 && (
                <g>
                  <rect x={x + 50} y={475} width={180} height={90} rx={10} fill="none" stroke={SP.faint} strokeWidth={4} />
                  <line x1={x + 110} y1={475} x2={x + 110} y2={565} stroke={SP.faint} strokeWidth={3} />
                  <line x1={x + 170} y1={475} x2={x + 170} y2={565} stroke={SP.faint} strokeWidth={3} />
                  <circle cx={x + 80} cy={510} r={10} fill="none" stroke={SP.faint} strokeWidth={3} />
                </g>
              )}
              {i === 2 && (
                <g stroke={SP.faint} strokeWidth={5} fill="none" strokeLinecap="round">
                  <path d={`M ${x + 50} ${495} q 45 -24 90 0 q 45 24 90 0`} />
                  <path d={`M ${x + 50} ${545} q 45 -24 90 0 q 45 24 90 0`} />
                </g>
              )}
              {i === 3 && (
                <g>
                  <path d={`M ${x + 105} ${560} L ${x + 120} ${478} L ${x + 180} ${478} L ${x + 195} ${560} Z`} fill="none" stroke={SP.faint} strokeWidth={4} strokeLinejoin="round" />
                  <circle cx={x + 90} cy={572} r={4} fill={SP.faint} />
                  <circle cx={x + 212} cy={568} r={4} fill={SP.faint} />
                  <circle cx={x + 150} cy={578} r={4} fill={SP.faint} />
                </g>
              )}
              <SmallLabel x={x + 140} y={700} text={lb} color={SP.faint} size={26} />
            </g>
          );
        })}
        <SmallLabel x={960} y={790} text="ぜんぶ知っているのは、あなただけ" color={SP.ink} size={30} weight={700} />
      </svg>
    </Frame>
  );
};

// ===== unfair_match: 等倍の毎日 vs 7200倍濃縮 =====
export const UnfairMatchScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "これは、勝てない勝負"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 自分 (NG集こみ・等倍) */}
        <g opacity={appearAt(frame, fps, 6)}>
          <Person x={470} y={400} scale={1.7} />
          <rect x={320} y={590} width={300} height={100} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
          <rect x={336} y={602} width={14} height={12} rx={3} fill={SP.background} />
          <rect x={336} y={666} width={14} height={12} rx={3} fill={SP.background} />
          <rect x={590} y={602} width={14} height={12} rx={3} fill={SP.background} />
          <rect x={590} y={666} width={14} height={12} rx={3} fill={SP.background} />
          <rect x={370} y={612} width={90} height={56} rx={4} fill={SP.background} stroke={SP.dim} strokeWidth={3} />
          <rect x={480} y={612} width={90} height={56} rx={4} fill={SP.background} stroke={SP.dim} strokeWidth={3} />
          <SmallLabel x={470} y={760} text="NG集こみ・等倍の毎日" color={SP.ink} size={30} weight={700} />
        </g>
        {/* 中央: VS */}
        <text x={960} y={500} textAnchor="middle" fontSize={88} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={4} opacity={appearAt(frame, fps, 16)}>
          VS
        </text>
        {/* 右: 他人の画面 (7200倍) */}
        <g opacity={appearAt(frame, fps, 24)}>
          <Phone x={1300} y={230} w={300} h={470}>
            <FeedCard x={1328} y={290} w={244} h={140} kind="travel" />
            <FeedCard x={1328} y={460} w={244} h={140} kind="pass" />
          </Phone>
          <Sparkle x={1640} y={270} s={15} phase={1} />
          <Sparkle x={1270} y={540} s={12} phase={4} />
          <SmallLabel x={1450} y={760} text="7200倍濃縮" color={SP.accent} size={34} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== nothing_tuesday: 誰にでもある「何もない火曜日」 =====
export const NothingTuesdayScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "誰にでもある、何もない火曜日"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* カレンダーの一枚 */}
        <g opacity={appearAt(frame, fps, 6)}>
          <rect x={400} y={280} width={240} height={270} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <rect x={400} y={280} width={240} height={64} rx={14} fill={SP.dim} />
          <circle cx={460} cy={280} r={9} fill={SP.background} stroke={SP.line} strokeWidth={4} />
          <circle cx={580} cy={280} r={9} fill={SP.background} stroke={SP.line} strokeWidth={4} />
          <text x={520} y={490} textAnchor="middle" fontSize={96} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>
            火
          </text>
          <SmallLabel x={520} y={600} text="なんでもない平日" color={SP.faint} size={27} />
        </g>
        {/* ソファーでだらだら */}
        <g opacity={appearAt(frame, fps, 14)}>
          <rect x={820} y={520} width={560} height={140} rx={24} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <rect x={790} y={620} width={620} height={120} rx={24} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <g transform="rotate(10 1060 540)">
            <Person x={1060} y={500} scale={1.6} />
          </g>
          <path d="M 1255 648 L 1272 572 L 1330 572 L 1347 648 Z" fill="none" stroke={SP.faint} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={1230} cy={660} r={4} fill={SP.faint} />
          <circle cx={1372} cy={656} r={4} fill={SP.faint} />
          <circle cx={1300} cy={666} r={4} fill={SP.faint} />
          <SmallLabel x={1100} y={800} text="ポテチをこぼして、だらだら" color={SP.faint} size={28} />
        </g>
        {variant >= 1 && (
          <g opacity={appearAt(frame, fps, 20)}>
            <path d="M 1620 250 a 70 70 0 1 0 54 114 a 70 70 0 0 1 -54 -114 Z" fill={SP.line} opacity={0.8} />
            <text x={1480} y={330} fontSize={44} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT}>
              z z…
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== sink_posts: 投稿されないものは海の底へ =====
export const SinkPostsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sink = Math.min(frame * 0.5, 40);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "投稿されないものは、海の底へ"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 水面より上: 投稿された1枚 */}
        <g opacity={appearAt(frame, fps, 6)}>
          <FeedCard x={820} y={220} w={280} h={150} kind="travel" />
          <Sparkle x={1130} y={240} s={14} phase={1} />
          <SmallLabel x={660} y={310} text="投稿される" color={SP.ink} size={32} weight={700} anchor="end" />
        </g>
        {/* 水面 */}
        <path
          d="M 60 430 Q 160 408 260 430 T 460 430 T 660 430 T 860 430 T 1060 430 T 1260 430 T 1460 430 T 1660 430 T 1860 430"
          fill="none"
          stroke={SP.line}
          strokeWidth={5}
        />
        {/* 水面より下: 沈んでいく投稿たち */}
        <g opacity={0.4} transform={`translate(0, ${sink})`}>
          <g transform="rotate(-14 600 560)">
            <FeedCard x={460} y={490} w={280} h={150} kind="plain" />
          </g>
          <g transform="rotate(10 1040 630)">
            <FeedCard x={900} y={555} w={280} h={150} kind="plain" />
          </g>
          <g transform="rotate(-7 1460 550)">
            <FeedCard x={1320} y={480} w={280} h={150} kind="plain" />
          </g>
        </g>
        <circle cx={700} cy={470} r={7} fill="none" stroke={SP.faint} strokeWidth={3} opacity={0.6} />
        <circle cx={1180} cy={500} r={5} fill="none" stroke={SP.faint} strokeWidth={3} opacity={0.6} />
        <circle cx={1520} cy={460} r={6} fill="none" stroke={SP.faint} strokeWidth={3} opacity={0.6} />
        <SmallLabel x={960} y={800} text="失敗と、何もない火曜日は、見えなくなる" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// ============================================================
// ===== 第3章: 帰ってこなかった飛行機 (和紙の世界) =====
// ============================================================

// 軍帽の人 (Person + 帽子)
const CapPerson: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <circle r={16} fill="none" stroke={SP.line} strokeWidth={5} />
    <path d="M -26 66 q 2 -34 26 -36 q 24 2 26 36 Z" fill="none" stroke={SP.line} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -19 -8 Q 0 -31 19 -8 Z" fill={SP.line} />
    <line x1={-25} y1={-7} x2={25} y2={-7} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
  </g>
);

// ===== war_planes: 撃ち落とされる飛行機 (和紙) =====
export const WarPlanesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drift = -frame * 0.5;
  const fall = Math.min(frame * 0.8, 80);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "80年前・第二次世界大戦"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 編隊 */}
        <g transform={`translate(${drift}, 0)`}>
          <PlaneSilhouette x={700} y={300} scale={0.75} />
          <PlaneSilhouette x={950} y={390} scale={0.75} />
          <PlaneSilhouette x={1180} y={290} scale={0.75} />
        </g>
        {/* 対空砲火 (うすい✕) */}
        <g stroke={SP.faint} strokeWidth={4} opacity={0.7} strokeLinecap="round">
          <path d="M 560 520 l 26 26 M 586 520 l -26 26" />
          <path d="M 1240 500 l 26 26 M 1266 500 l -26 26" />
          <path d="M 880 560 l 26 26 M 906 560 l -26 26" />
        </g>
        {/* 撃たれて落ちる1機 */}
        <g transform={`translate(0, ${fall})`} opacity={appearAt(frame, fps, 10)}>
          <path d="M 1660 330 Q 1600 420 1540 470" fill="none" stroke={SP.faint} strokeWidth={5} strokeDasharray="14 12" />
          <PlaneSilhouette x={1480} y={520} scale={0.75} rotate={38} />
          <circle cx={1472} cy={502} r={10} fill={SP.accent} />
        </g>
        <SmallLabel x={960} y={790} text="飛行機が、次々と撃ち落とされてしまう" color={SP.ink} size={32} weight={700} />
      </svg>
    </Frame>
  );
};

// ===== generals: 軍の偉い人たちの会議 (和紙) =====
export const GeneralsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 「こう考えます」の場面だけ作戦 (鉄板) の吹き出し+弾痕を見せる。悩み場面ではネタバレしない
  const showPlan = /(考え|鉄板)/.test(scene?.text ?? "");
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "軍の作戦会議"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 机 */}
        <rect x={520} y={640} width={880} height={26} rx={8} fill={SP.line} />
        <rect x={570} y={666} width={20} height={120} fill={SP.line} />
        <rect x={1330} y={666} width={20} height={120} fill={SP.line} />
        {/* 机の上の記録図 (上から見た飛行機 + 弾痕) */}
        <g opacity={appearAt(frame, fps, 8)}>
          <rect x={690} y={400} width={540} height={236} rx={8} fill={SP.background} stroke={SP.line} strokeWidth={5} />
          <ellipse cx={960} cy={518} rx={16} ry={86} fill={SP.ink} />
          <rect x={860} y={498} width={200} height={20} rx={8} fill={SP.ink} />
          <rect x={922} y={578} width={76} height={14} rx={6} fill={SP.ink} />
          {showPlan && (
            <g>
              <circle cx={895} cy={512} r={6} fill={SP.accent} />
              <circle cx={1022} cy={510} r={6} fill={SP.accent} />
              <circle cx={948} cy={588} r={6} fill={SP.accent} />
              <circle cx={988} cy={586} r={6} fill={SP.accent} />
              <circle cx={870} cy={514} r={6} fill={SP.accent} />
            </g>
          )}
          <SmallLabel x={960} y={434} text={showPlan ? "弾痕の記録" : "作戦の地図"} color={SP.faint} size={24} />
        </g>
        {/* 軍の偉い人たち */}
        <CapPerson x={420} y={480} scale={1.5} />
        <CapPerson x={560} y={510} scale={1.3} />
        <CapPerson x={1480} y={490} scale={1.5} />
        {/* 吹き出し */}
        <g opacity={appearAt(frame, fps, 18)}>
          {showPlan ? (
            <Bubble x={1200} y={230} w={520} h={110} tailTo={[1470, 420]}>
              <text x={1460} y={298} textAnchor="middle" fontSize={34} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={2}>
                鉄板を足して守ろう
              </text>
            </Bubble>
          ) : (
            <Bubble x={1300} y={240} w={320} h={100} tailTo={[1470, 420]}>
              <text x={1460} y={302} textAnchor="middle" fontSize={34} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={4}>
                うーん……
              </text>
            </Bubble>
          )}
        </g>
        <SmallLabel x={430} y={810} text="軍の偉い人たち" color={SP.faint} size={28} />
      </svg>
    </Frame>
  );
};

// ===== wald_stop: 数学者ウォールドが待ったをかける (和紙) =====
export const WaldStopScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ひとりの数学者が、待ったをかけた"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 軍の人たち */}
        <CapPerson x={460} y={500} scale={1.6} />
        <CapPerson x={640} y={530} scale={1.45} />
        <SmallLabel x={550} y={790} text="軍の偉い人たち" color={SP.faint} size={28} />
        {/* 右: ウォールド (手のひらを向ける) */}
        <g opacity={appearAt(frame, fps, 8)}>
          <Person x={1340} y={490} scale={1.7} />
          <path d="M 1300 600 Q 1220 540 1168 480" fill="none" stroke={SP.line} strokeWidth={9} strokeLinecap="round" />
          <circle cx={1156} cy={466} r={17} fill="none" stroke={SP.line} strokeWidth={7} />
          <SmallLabel x={1380} y={790} text="数学者 エイブラハム・ウォールド" color={SP.ink} size={30} weight={700} />
        </g>
        {/* 吹き出し */}
        <g opacity={appearAt(frame, fps, 18)}>
          <Bubble x={1130} y={230} w={460} h={110} tailTo={[1340, 400]}>
            <text x={1360} y={300} textAnchor="middle" fontSize={36} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={3}>
              お待ちください
            </text>
          </Bubble>
        </g>
      </svg>
    </Frame>
  );
};

// ===== missing_data: 届かなかったデータ (和紙) =====
export const MissingDataScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "記録に残らなかったもの"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* クリップボード */}
        <rect x={640} y={226} width={640} height={560} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        <rect x={890} y={200} width={140} height={52} rx={12} fill={SP.line} />
        <SmallLabel x={960} y={306} text="帰ってきた飛行機の記録" color={SP.faint} size={26} />
        {/* 帰還機の列 */}
        {Array.from({ length: 6 }).map((_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <g key={i} opacity={appearAt(frame, fps, 6 + i * 4)}>
              <PlaneSilhouette x={790 + col * 170} y={360 + row * 86} scale={0.24} />
            </g>
          );
        })}
        {/* 届かなかったデータ */}
        <g opacity={appearAt(frame, fps, 30)}>
          <rect x={700} y={520} width={520} height={190} rx={12} fill="none" stroke={SP.faint} strokeWidth={4} strokeDasharray="14 12" />
          <text x={960} y={635} textAnchor="middle" fontSize={76} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            ?
          </text>
          <SmallLabel x={960} y={758} text="届かなかったデータ" color={SP.ink} size={30} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== count_disease: 帰ってきたものだけ数えてしまう病 (和紙) =====
export const CountDiseaseScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "帰ってきたものだけ、数えてしまう病"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 数える人 */}
        <Person x={400} y={420} scale={1.6} />
        <text x={400} y={620} textAnchor="middle" fontSize={44} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={6} opacity={appearAt(frame, fps, 10)}>
          正 正 一
        </text>
        <SmallLabel x={400} y={690} text="手元に残ったぶん" color={SP.faint} size={26} />
        {/* 上: 見えている飛行機 */}
        {Array.from({ length: 3 }).map((_, i) => (
          <g key={i} opacity={appearAt(frame, fps, 6 + i * 5)}>
            <PlaneSilhouette x={880 + i * 300} y={330} scale={0.5} />
          </g>
        ))}
        <SmallLabel x={1180} y={440} text="見えているもの" color={SP.ink} size={28} weight={700} />
        {/* 仕切り (水面がわり) */}
        <line x1={700} y1={500} x2={1760} y2={500} stroke={SP.faint} strokeWidth={4} strokeDasharray="16 14" />
        {/* 下: 数えられない影 */}
        <g opacity={appearAt(frame, fps, 22)}>
          {Array.from({ length: 3 }).map((_, i) => (
            <rect
              key={i}
              x={800 + i * 300}
              y={570}
              width={200}
              height={90}
              rx={12}
              fill="none"
              stroke={SP.faint}
              strokeWidth={4}
              strokeDasharray="12 10"
              opacity={0.7}
            />
          ))}
          <text x={900} y={632} textAnchor="middle" fontSize={44} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>?</text>
          <text x={1200} y={632} textAnchor="middle" fontSize={44} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>?</text>
          <text x={1500} y={632} textAnchor="middle" fontSize={44} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>?</text>
          <SmallLabel x={1180} y={740} text="沈んだぶんは、数えられない" color={SP.ink} size={28} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== runway_phones: 画面は帰ってきたものだけの滑走路 (和紙) =====
export const RunwayPhonesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "画面は、帰ってきたものだけの滑走路"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 滑走路 (奥行き) */}
        <polygon points="340,820 1580,820 1070,300 850,300" fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        <rect x={953} y={740} width={14} height={46} fill={SP.line} />
        <rect x={955} y={640} width={11} height={36} fill={SP.line} />
        <rect x={956} y={556} width={8} height={28} fill={SP.line} />
        <rect x={957} y={482} width={6} height={22} fill={SP.line} />
        <rect x={958} y={420} width={5} height={16} fill={SP.line} />
        {/* 並ぶスマホ (手前ほど大きい) */}
        <g opacity={appearAt(frame, fps, 8)}>
          <rect x={620} y={530} width={130} height={230} rx={16} fill={SP.background} stroke={SP.line} strokeWidth={6} />
          <Sparkle x={765} y={530} s={14} phase={1} />
        </g>
        <g opacity={appearAt(frame, fps, 16)}>
          <rect x={1130} y={440} width={92} height={160} rx={12} fill={SP.background} stroke={SP.line} strokeWidth={5} />
          <Sparkle x={1238} y={444} s={11} phase={3} />
        </g>
        <g opacity={appearAt(frame, fps, 24)}>
          <rect x={890} y={344} width={56} height={100} rx={8} fill={SP.background} stroke={SP.line} strokeWidth={4} />
          <Sparkle x={956} y={348} s={9} phase={5} />
        </g>
        <SmallLabel x={330} y={400} text="沈んだ投稿は" color={SP.faint} size={28} />
        <SmallLabel x={330} y={442} text="ここに並ばない" color={SP.faint} size={28} />
      </svg>
    </Frame>
  );
};

// ===== whisper_question: 「ここに届いていないものは、なんだろう?」 (和紙) =====
export const WhisperQuestionScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ウォールドさんのつぶやき"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 右下: スマホを見る人 */}
        <Person x={1480} y={560} scale={1.7} />
        <rect x={1330} y={600} width={100} height={160} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={5} transform="rotate(-12 1380 680)" />
        {/* 思考の泡 */}
        <circle cx={1350} cy={520} r={10} fill="none" stroke={SP.line} strokeWidth={4} opacity={appearAt(frame, fps, 8)} />
        <circle cx={1270} cy={460} r={17} fill="none" stroke={SP.line} strokeWidth={4} opacity={appearAt(frame, fps, 12)} />
        <g opacity={appearAt(frame, fps, 16)}>
          <ellipse cx={810} cy={350} rx={440} ry={185} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <PlaneSilhouette x={680} y={360} scale={0.75} opacity={0.3} />
          <text x={1020} y={395} textAnchor="middle" fontSize={88} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            ?
          </text>
        </g>
        <SmallLabel x={810} y={700} text="ここに届いていないものは、なんだろう?" color={SP.ink} size={34} weight={700} />
      </svg>
    </Frame>
  );
};

// ============================================================
// ===== 第4章: お互いさま =====
// ============================================================

// ===== mutual_shine: あなたの投稿も誰かの画面でキラキラ =====
export const MutualShineScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "あなたの投稿も、誰かの画面では"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: あなた */}
        <Person x={420} y={520} scale={1.7} />
        <g opacity={appearAt(frame, fps, 8)}>
          <Phone x={560} y={380} w={190} h={330}>
            <FeedCard x={578} y={430} w={154} h={100} kind="travel" />
          </Phone>
          <Sparkle x={760} y={400} s={12} phase={1} />
        </g>
        <SmallLabel x={480} y={800} text="あなた" color={SP.ink} size={30} weight={700} />
        {/* 右: 誰か */}
        <Person x={1500} y={520} scale={1.7} />
        <g opacity={appearAt(frame, fps, 8)}>
          <Phone x={1170} y={380} w={190} h={330}>
            <FeedCard x={1188} y={430} w={154} h={100} kind="pass" />
          </Phone>
          <Sparkle x={1160} y={400} s={12} phase={4} />
        </g>
        <SmallLabel x={1440} y={800} text="誰か" color={SP.ink} size={30} weight={700} />
        {/* 交差する矢印 */}
        <g opacity={appearAt(frame, fps, 18)} fill="none" stroke={SP.faint} strokeWidth={6}>
          <path d="M 480 420 Q 960 220 1180 360" />
          <path d="M 1205 350 l -48 -6 l 28 40 Z" fill={SP.faint} stroke="none" />
          <path d="M 1440 420 Q 960 250 742 362" />
          <path d="M 718 374 l 48 4 l -26 -42 Z" fill={SP.faint} stroke="none" />
        </g>
        <text x={960} y={620} textAnchor="middle" fontSize={60} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT} letterSpacing={4} opacity={appearAt(frame, fps, 26)}>
          お互いさま
        </text>
      </svg>
    </Frame>
  );
};
