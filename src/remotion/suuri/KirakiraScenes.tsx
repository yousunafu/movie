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

// ===== キラキラ回だけのカラーパレット =====
// 約束ごと: 「画面の中のキラキラ = カラフル」「現実 = モノクロ+赤」
// 線画の繊細さを壊さないよう、彩度は少し落とした中明度の色にそろえる
// (和紙反転 invert(0.92)+hue-rotate(180deg) でも色相がほぼ保たれる明度帯)
export const KC = {
  yellow: "#E8C34A", // 月・ガチャ上・レモン・王冠
  pink: "#E287A5", // ハート・ガチャ下
  blue: "#5B8DD9", // 地球の海・星条旗の青
  skyBlue: "#7FB2E5", // 旅行サムネの空
  green: "#5CA86E", // 山・地球の大陸
  orange: "#E08A3C", // ごちそう・オレンジ
  lime: "#9CC45C", // ライム
  sea: "#4A7FB5", // 海の波線 (和紙でも青く残る)
} as const;

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
  "ww2_year",
  "wald_profile",
] as const;
// 第1章 (野球の世界) → 黒地に夜の球場の背景を薄く敷く
export const KIRAKIRA_STADIUM_MOTIFS = [
  "homerun_tv",
  "batter_rally",
  "not_sad_viewer",
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
  "not_consolation",
  "batter_rally",
  "orange_press",
  "lemon_press",
  "lime_press",
  "drink_fall",
  "boxer_champ",
  "sofa_clock",
] as const;
// orz はどのリストにも入れない (前の場面の背景を引き継ぐ中立の絵)

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

// 点線の幽霊飛行機 (塗りなし・破線)。「記録に残らなかった機」を表す
const GhostPlane: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
}> = ({ x, y, scale = 1, rotate = 0, opacity = 1 }) => (
  <g
    transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}
    opacity={opacity}
    fill="none"
    stroke={SP.faint}
    strokeWidth={5}
    strokeDasharray="12 10"
    strokeLinejoin="round"
  >
    <path d="M -150 0 Q -150 -16 -120 -18 L 90 -18 Q 140 -14 150 2 Q 120 16 80 16 L -120 16 Q -150 14 -150 0 Z" />
    <path d="M -40 -8 L 40 56 L 76 56 L 10 -8 Z" />
    <path d="M 96 -14 L 128 -56 L 150 -56 L 134 -14 Z" />
    <path d="M 104 2 L 146 26 L 162 26 L 134 2 Z" />
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

  // 弾痕の位置 (翼・しっぽ・後部胴体だけ。輪郭の内側で、エンジン (x706-778 / x1142-1214) と機首は避ける)
  const holes: [number, number][] = [
    // 左翼
    [490, 586], [545, 564], [600, 556], [650, 575], [848, 516], [884, 540],
    // 右翼
    [1036, 540], [1072, 516], [1270, 580], [1320, 556], [1375, 590], [1430, 586],
    // 水平尾翼 (左右)
    [790, 762], [860, 744], [1060, 744], [1130, 762],
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

        {/* ===== mode 1: 鉄板の案 (翼・しっぽの輪郭に沿った斜めの板。エンジンは避ける) ===== */}
        {mode === 1 && (
          <g opacity={appearAt(frame, fps, 16)}>
            {[
              // 左翼 (外側・エンジンより先端側)
              "450,576 690,527 690,574 450,606",
              // 左翼 (内側・エンジンと胴体のあいだ)
              "790,507 895,486 895,546 790,560",
              // 右翼 (内側)
              "1025,486 1130,507 1130,560 1025,546",
              // 右翼 (外側)
              "1230,527 1470,576 1470,606 1230,574",
              // 水平尾翼 (左右)
              "730,769 900,722 900,747 730,786",
              "1020,722 1190,769 1190,786 1020,747",
            ].map((pts, i) => {
              const xs = pts.split(" ").map((p) => p.split(",").map(Number));
              const minX = Math.min(...xs.map((p) => p[0]));
              const maxX = Math.max(...xs.map((p) => p[0]));
              const topL = xs[0][1];
              const topR = xs[1][1];
              const botR = xs[2][1];
              const botL = xs[3][1];
              return (
                <g key={i} stroke={SP.line} strokeWidth={4}>
                  <polygon points={pts} fill="none" strokeDasharray="14 8" />
                  {[0.3, 0.55, 0.8].map((t) => {
                    const lx = minX + (maxX - minX) * t;
                    const ty = topL + (topR - topL) * t;
                    const by = botL + (botR - botL) * t;
                    return <line key={t} x1={lx - 14} y1={by} x2={lx + 14} y2={ty} opacity={0.6} />;
                  })}
                </g>
              );
            })}
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
        {/* 水面より下 (海) のうっすらした横線 (海の青) */}
        <g stroke={KC.sea} strokeWidth={3} opacity={0.65}>
          {[500, 580, 660, 740].map((y) => (
            <line key={y} x1={60} y1={y} x2={W - 60} y2={y} opacity={0.5} />
          ))}
        </g>
        {/* 水面の波線 (海の青) */}
        <path d={wave} fill="none" stroke={KC.sea} strokeWidth={6} />

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
// colored=true で「画面の中のキラキラ」用のカラフル表示 (現実=モノクロ、との対比)
type CardKind = "travel" | "food" | "pass" | "win" | "plain";
const FeedCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: CardKind;
  opacity?: number;
  colored?: boolean;
}> = ({ x, y, w = 280, h = 150, kind = "plain", opacity = 1, colored = false }) => {
  const px = x + 16;
  const py = y + 16;
  const ps = h - 56;
  // 合格は「金色がかった赤」(お祝いの色)
  const passGold = "#D98E3A";
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={SP.background} stroke={SP.faint} strokeWidth={3} />
      <rect
        x={px}
        y={py}
        width={ps}
        height={ps}
        rx={8}
        fill={colored && kind === "travel" ? KC.skyBlue : "none"}
        stroke={SP.line}
        strokeWidth={3}
      />
      {kind === "travel" && (
        <g stroke={SP.line} strokeWidth={3} fill={colored ? KC.green : "none"}>
          <path
            d={`M ${px + 6} ${py + ps - 8} L ${px + ps * 0.38} ${py + ps * 0.35} L ${px + ps * 0.62} ${py + ps - 8} Z`}
          />
          <path
            d={`M ${px + ps * 0.5} ${py + ps - 8} L ${px + ps * 0.72} ${py + ps * 0.5} L ${px + ps - 6} ${py + ps - 8} Z`}
          />
          <circle cx={px + ps - 18} cy={py + 18} r={9} fill={colored ? KC.yellow : "none"} />
        </g>
      )}
      {kind === "food" && (
        <g stroke={SP.line} strokeWidth={3} fill="none">
          <path
            d={`M ${px + 10} ${py + ps * 0.55} Q ${px + ps / 2} ${py + ps + 4} ${px + ps - 10} ${py + ps * 0.55} Z`}
            fill={colored ? KC.orange : "none"}
          />
          <path d={`M ${px + ps * 0.38} ${py + ps * 0.4} q 7 -11 0 -20`} />
          <path d={`M ${px + ps * 0.58} ${py + ps * 0.4} q 7 -11 0 -20`} />
        </g>
      )}
      {kind === "pass" && (
        <g>
          <circle
            cx={px + ps / 2}
            cy={py + ps / 2}
            r={ps * 0.38}
            fill="none"
            stroke={colored ? passGold : SP.line}
            strokeWidth={4}
          />
          <text
            x={px + ps / 2}
            y={py + ps / 2 + 9}
            textAnchor="middle"
            fontSize={25}
            fontWeight={700}
            fill={colored ? passGold : SP.ink}
            fontFamily={SUURI_FONT}
          >
            合格
          </text>
        </g>
      )}
      {kind === "win" && (
        <g>
          <circle
            cx={px + ps / 2}
            cy={py + ps / 2}
            r={ps * 0.3}
            fill={colored ? KC.yellow : "none"}
            stroke={SP.line}
            strokeWidth={4}
          />
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
      <Heart x={px + ps + 26} y={y + h - 30} s={9} color={colored ? KC.pink : SP.faint} />
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
// 文で芝居が変わる: 「スマホを開く」= 歩いてきて→ふとんへ→画面が点く (約4秒)
//                   「おやすみ」= スマホを伏せて置き、明かりが消えて月と星だけ残る
export const FutonPhoneScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = scene?.text ?? "";
  const mode = /開く/.test(text) ? "open" : /おやすみ/.test(text) ? "sleep" : "default";

  // open: 0-2秒 歩く → 2-2.7秒 ふとんへもぐる → 2.7秒〜 画面が点く
  const walkEnd = 2.0 * fps;
  const lieEnd = 2.7 * fps;
  const walkT = Math.min(frame / walkEnd, 1);
  const lieT = Math.max(0, Math.min((frame - walkEnd) / (lieEnd - walkEnd), 1));
  const personX = 1700 - (1700 - 1180) * walkT;
  const bob = walkT < 1 ? Math.abs(Math.sin(frame / 4.5)) * 10 : 0;

  // 画面の明かり: open=もぐり終わってから点く / sleep=最初から消えていく / default=すっと点く
  const defaultGlow = useAppear(10);
  const glow =
    mode === "open"
      ? appearAt(frame, fps, Math.round(lieEnd) + 4)
      : mode === "sleep"
        ? 1 - Math.min(frame / (1.6 * fps), 1)
        : defaultGlow;
  // open では、もぐり終わるまで ふとんの顔は見せない
  const faceIn = mode === "open" ? lieT : 1;

  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "夜、ふとんの中で"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 月 (黄色) と星 (夜) */}
        <path d="M 1610 240 a 56 56 0 1 0 50 82 a 44 44 0 0 1 -50 -82 Z" fill={KC.yellow} opacity={0.92} />
        <Sparkle x={1450} y={200} s={10} phase={1} />
        <Sparkle x={1720} y={380} s={8} phase={3} />
        {mode === "sleep" && <Sparkle x={1300} y={300} s={9} phase={5} />}
        {/* 床 */}
        <line x1={320} y1={820} x2={1620} y2={820} stroke={SP.dim} strokeWidth={4} />
        {/* ふとん一式 (元より25%小さく・床に接したまま縮小) */}
        <g transform="translate(960 820) scale(0.75) translate(-960 -820)">
          {/* まくら と 顔 */}
          <rect x={470} y={716} width={170} height={56} rx={18} fill="none" stroke={SP.line} strokeWidth={5} />
          <circle cx={556} cy={676} r={34} fill="none" stroke={SP.line} strokeWidth={5} opacity={faceIn} />
          {/* ふとん (体を覆う) */}
          <path
            d="M 610 820 L 610 740 Q 620 668 720 660 L 1420 660 Q 1500 668 1504 740 L 1504 820 Z"
            fill={SP.panel}
            stroke={SP.line}
            strokeWidth={5}
          />
          <path d="M 610 756 Q 1050 724 1504 756" fill="none" stroke={SP.dim} strokeWidth={4} />
          {/* スマホと画面の明かり (sleep では持たず、伏せて置いてある) */}
          {mode !== "sleep" && (
            <g opacity={glow}>
              <polygon points="590,560 700,560 760,660 530,660" fill={SP.ink} opacity={0.1} />
              <rect
                x={596}
                y={470}
                width={96}
                height={150}
                rx={16}
                transform="rotate(14 644 545)"
                fill={SP.panel}
                stroke={SP.line}
                strokeWidth={5}
              />
              <Sparkle x={700} y={450} s={13} phase={0} />
              <Sparkle x={590} y={414} s={10} phase={2} />
            </g>
          )}
        </g>
        {/* sleep: スマホは枕元に伏せて置く。明かりの名残がすっと消える */}
        {mode === "sleep" && (
          <g>
            <rect x={620} y={796} width={130} height={16} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
            <ellipse cx={685} cy={790} rx={90} ry={26} fill={SP.ink} opacity={0.12 * glow} />
          </g>
        )}
        {/* open: 右から歩いてきて、ふとんへもぐる */}
        {mode === "open" && lieT < 1 && (
          <g opacity={1 - lieT}>
            <Person x={personX} y={620 - bob + lieT * 90} scale={1.6} />
          </g>
        )}
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
              <FeedCard x={730} y={248 + i * 180} w={280} h={160} kind={k} colored />
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
// kirakira_feed (静止した3枚) との違い: 縦長の画面を、カラフルなカードが
// 下から上へ無限に流れ続ける (ループアニメ)。「終わらない」が主役の絵
export const ScrollForeverScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const kinds: CardKind[] = ["travel", "win", "food", "pass", "travel", "food", "pass", "win"];
  const step = 164;
  const offset = (frame * 4.4) % step;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "スクロールしても、きらきら"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="scrollClip">
            <rect x={778} y={244} width={364} height={540} rx={20} />
          </clipPath>
        </defs>
        {/* 縦に長いスマホ (画面いっぱいのフィード) — タイトルにかからない高さから */}
        <Phone x={760} y={190} w={400} h={620} />
        <g clipPath="url(#scrollClip)">
          {kinds.map((k, i) => (
            <FeedCard key={i} x={800} y={220 + i * step - offset} w={320} h={144} kind={k} colored />
          ))}
        </g>
        {/* 画面の外の流れ線 (上へ上へ) */}
        <g stroke={SP.dim} strokeWidth={4} strokeLinecap="round">
          {[700, 724, 1196, 1220].map((x, i) => {
            const t = ((frame * 5 + i * 60) % 240) / 240;
            const y = 760 - t * 520;
            return <line key={x} x1={x} y1={y} x2={x} y2={y + 54} opacity={(1 - t) * 0.8} />;
          })}
        </g>
        {/* 指のスワイプ軌跡 */}
        <g stroke={SP.faint} strokeWidth={5} strokeLinecap="round" fill="none">
          <path d="M 1300 640 Q 1340 500 1300 360" strokeDasharray="2 16" />
          <path d="M 1286 390 L 1300 352 L 1316 390" />
        </g>
        {/* まわりのきらきら (またたく) */}
        <Sparkle x={640} y={240} s={15} phase={0} />
        <Sparkle x={1340} y={220} s={18} phase={2} />
        <Sparkle x={1400} y={700} s={12} phase={4} />
        <Sparkle x={600} y={640} s={12} phase={1} />
        <Sparkle x={560} y={420} s={9} phase={3} />
        <Sparkle x={1450} y={460} s={10} phase={5} />
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
        {/* 左: 世界 (地球・海は青、大陸は緑) */}
        <defs>
          <clipPath id="earthClip">
            <circle cx={560} cy={490} r={167} />
          </clipPath>
        </defs>
        <circle cx={560} cy={490} r={170} fill={KC.blue} opacity={0.85} />
        <g clipPath="url(#earthClip)" fill={KC.green}>
          {/* 大陸 (ざっくりした形) */}
          <path d="M 455 360 q 60 -16 96 8 q 30 22 10 54 q -36 24 -76 12 q -48 -16 -44 -46 q 2 -20 14 -28 Z" />
          <path d="M 560 520 q 44 -18 78 4 q 28 22 12 60 q -20 40 -58 34 q -42 -8 -50 -48 q -4 -32 18 -50 Z" />
          <path d="M 410 540 q 30 -8 44 12 q 12 20 -4 40 q -22 18 -42 4 q -18 -16 -12 -36 q 4 -14 14 -20 Z" />
          <path d="M 660 380 q 26 -10 42 6 q 14 16 2 34 q -16 16 -36 8 q -18 -10 -16 -28 q 2 -12 8 -20 Z" />
        </g>
        <g stroke={SP.line} strokeWidth={5} fill="none">
          <circle cx={560} cy={490} r={170} />
          <ellipse cx={560} cy={490} rx={75} ry={170} opacity={0.5} />
          <line x1={398} y1={440} x2={722} y2={440} opacity={0.5} />
          <line x1={398} y1={545} x2={722} y2={545} opacity={0.5} />
        </g>
        <SmallLabel x={560} y={752} text="世界" color={SP.ink} size={38} weight={700} />
        {/* 世界ではありません → 赤の斜線 */}
        {!pickScreen && (
          <g opacity={ring} stroke={SP.accent} strokeWidth={10} strokeLinecap="round">
            <line x1={430} y1={360} x2={690} y2={620} />
            <line x1={690} y1={360} x2={430} y2={620} />
          </g>
        )}
        {/* 右: あなたの画面 (中はカラフル) */}
        <Phone x={1200} y={250} w={300} h={480}>
          <FeedCard x={1232} y={300} w={236} h={130} kind="travel" colored />
          <FeedCard x={1232} y={450} w={236} h={130} kind="win" colored />
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
  const gates = [820, 1130, 1440];
  const gateLabels = ["投稿される", "よく流れる", "上に出る"];
  // 世界のできごと (黄色い粒) が左から右へ流れ、関門ごとに数が減っていく。
  // 最後の1粒だけが赤になって、右端のスマホに届く
  const speed = 12;
  const dots = Array.from({ length: 24 }, (_, i) => {
    const x0 = 250 + (i % 4) * 90 + (i % 3) * 14;
    const y0 = 330 + Math.floor(i / 4) * 68 + (i % 2) * 16;
    // どの関門で止まるか: 8粒が第1関門を抜け、3粒が第2を抜け、1粒だけ最後まで
    const stopX =
      i === 9 ? 1700 : i % 9 === 0 ? gates[2] - 26 : i % 3 === 0 ? gates[1] - 26 : gates[0] - 26;
    return { x0, y0, stopX, final: i === 9 };
  });
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "画面に届くまでに、何回も選ばれる"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <SmallLabel x={430} y={820} text="世界のできごと ぜんぶ" color={SP.faint} size={30} />
        {/* 3つの関門 */}
        {gates.map((gx, gi) => (
          <g key={gx} opacity={appearAt(frame, fps, 10 + gi * 8)}>
            <line x1={gx} y1={270} x2={gx} y2={468} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
            <line x1={gx} y1={548} x2={gx} y2={746} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
            <SmallLabel x={gx} y={820} text={gateLabels[gi]} color={SP.ink} size={28} weight={700} />
          </g>
        ))}
        {/* 流れる粒: 止まった粒は薄くなって残る */}
        {dots.map(({ x0, y0, stopX, final: isFinal }, i) => {
          const raw = x0 + Math.max(0, frame - 10 - (i % 5) * 3) * speed;
          const x = Math.min(raw, stopX);
          const stopped = raw >= stopX && !isFinal;
          // 進むほど中央の高さ (508) に集まっていく
          const prog = Math.min(Math.max((x - x0) / 900, 0), 1);
          const y = y0 + (508 - y0) * prog + (stopped ? 0 : Math.sin(frame / 7 + i) * 6);
          const arrived = isFinal && raw >= stopX;
          return (
            <circle
              key={i}
              cx={x}
              cy={isFinal ? y0 + (504 - y0) * prog : y}
              r={isFinal ? 11 : 9}
              fill={isFinal && x > gates[2] ? SP.accent : KC.yellow}
              opacity={stopped ? 0.25 : arrived ? 1 : 0.95}
            />
          );
        })}
        {/* 右端のスマホ (あなたの画面) */}
        <g>
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
        {/* 打球 (赤い縫い目つきの野球ボール) */}
        <path d="M 560 480 Q 980 220 1430 330" fill="none" stroke={SP.faint} strokeWidth={4} strokeDasharray="4 14" opacity={fly} />
        {(() => {
          const bx = 560 + 870 * fly;
          const by = 480 - (1 - (2 * fly - 1) ** 2) * 220 - 150 * fly;
          return (
            <g opacity={fly}>
              <circle cx={bx} cy={by} r={13} fill={SP.ink} />
              <path d={`M ${bx - 8} ${by - 10} q 5 10 0 20`} fill="none" stroke={SP.accent} strokeWidth={2.5} />
              <path d={`M ${bx + 8} ${by - 10} q -5 10 0 20`} fill="none" stroke={SP.accent} strokeWidth={2.5} />
            </g>
          );
        })()}
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
              {/* ボールの縫い目 (赤・短いステッチつき) */}
              <g stroke={SP.accent} strokeWidth={3} strokeLinecap="round" opacity={hit ? 1 : 0.55}>
                <path d={`M ${x - 28} ${y - 32} q 14 32 0 64`} fill="none" />
                <path d={`M ${x + 28} ${y - 32} q -14 32 0 64`} fill="none" />
                {[-16, 0, 16].map((dy) => {
                  const bend = 7 - Math.abs(dy) * 0.11; // 弧のふくらみに合わせる
                  return (
                    <g key={dy}>
                      <line x1={x - 28 + bend - 5} y1={y + dy - 3} x2={x - 28 + bend + 5} y2={y + dy + 3} />
                      <line x1={x + 28 - bend - 5} y1={y + dy + 3} x2={x + 28 - bend + 5} y2={y + dy - 3} />
                    </g>
                  );
                })}
              </g>
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
        {/* 15打席のうち1つだけ光る (ホームランの球は黄色) */}
        <g opacity={appearAt(frame, fps, 34)}>
          {Array.from({ length: 15 }).map((_, i) => {
            const x = 420 + i * 78;
            const hr = i === 14;
            return (
              <circle
                key={i}
                cx={x}
                cy={680}
                r={17}
                fill={hr ? KC.yellow : "none"}
                stroke={hr ? KC.yellow : SP.dim}
                strokeWidth={4}
              />
            );
          })}
          {/* 黄色い球から放射する光 */}
          <g stroke={KC.yellow} strokeWidth={4} strokeLinecap="round">
            {[-150, -105, -60, -15, 30, 75, 120, 165].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const hx = 420 + 14 * 78;
              return (
                <line
                  key={deg}
                  x1={hx + Math.cos(rad) * 26}
                  y1={680 + Math.sin(rad) * 26}
                  x2={hx + Math.cos(rad) * 42}
                  y2={680 + Math.sin(rad) * 42}
                />
              );
            })}
          </g>
          <Sparkle x={420 + 14 * 78} y={626} s={14} phase={0} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== juice: 濃縮ジュース (15分の1 → 7200倍の原液) =====
export const JuiceScene: React.FC<SceneProps> = ({ scene }) => {
  const text = scene?.text ?? "";
  const genEki = /7200|原液|むせる/.test(text); // 原液モード
  const showFruits = /原液|ベスト盤/.test(text); // 色とりどりの果物を散らす
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // グラスのまわりに散る果物 (丸+へた)。カラフルの約束どおり KC の色
  const fruitColors = [KC.orange, KC.yellow, KC.pink, KC.green, KC.lime, KC.skyBlue, KC.blue, KC.sea];
  const renderFruits = (gx: number, gy: number, spread: number) =>
    Array.from({ length: 16 }).map((_, i) => {
      const ang = (i / 16) * Math.PI * 2 + 0.3;
      const rad = (240 + (i % 3) * 55) * spread;
      const fx = gx + Math.cos(ang) * rad * 1.35;
      const fy = gy + Math.sin(ang) * rad * 0.6; // 下の説明文 (y740〜) にかからない高さに抑える
      const r = 15 + (i % 4) * 5;
      return (
        <g key={i} opacity={appearAt(frame, fps, 14 + i * 2)}>
          <circle cx={fx} cy={fy} r={r} fill={fruitColors[i % 8]} />
          <line
            x1={fx}
            y1={fy - r}
            x2={fx + 6}
            y2={fy - r - 12}
            stroke={SP.line}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      );
    });
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
            {showFruits && renderFruits(1400, 500, 0.55)}
          </>
        )}
        {genEki && (
          <>
            {showFruits && renderFruits(960, 490, 1)}
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
          {/* カプセル (上=黄・下=ピンクのカラフル) */}
          <path d="M 500 480 a 120 120 0 0 1 240 0 Z" fill={KC.yellow} stroke={SP.line} strokeWidth={6} transform={`rotate(${-14 * burst} 620 480)`} />
          <path d="M 500 492 a 120 120 0 0 0 240 0 Z" fill={KC.pink} stroke={SP.line} strokeWidth={6} />
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
            <FeedCard x={1182} y={320} w={236} h={150} kind="win" colored />
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
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 14);
  // スマホがくるくる回りながら放物線で飛んでいく (コミカル)
  const throwT = Math.min(Math.max((frame - 1.0 * fps) / (1.5 * fps), 0), 1);
  const px = 1240 + throwT * 820;
  const py = 700 - Math.sin(throwT * Math.PI) * 300 + throwT * 140;
  const rot = throwT * 540;
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
        {/* スマホがくるくる回りながら飛んでいく */}
        <g transform={`translate(${px}, ${py}) rotate(${rot})`} opacity={a}>
          <rect x={-45} y={-80} width={90} height={160} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <line x1={-18} y1={62} x2={18} y2={62} stroke={SP.dim} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* 投げた軌道の名残り */}
        {throwT > 0.1 && throwT < 1 && (
          <path
            d="M 1250 690 Q 1500 420 1880 560"
            fill="none"
            stroke={SP.faint}
            strokeWidth={4}
            strokeDasharray="4 16"
            opacity={0.6 * (1 - throwT)}
          />
        )}
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
              <FeedCard x={740} y={246 + i * 186} w={280} h={166} kind="win" colored />
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
    "blur", "face", "food", "finger",
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
              {/* 写真らしさのための淡い色味 (彩度ひかえめ) */}
              {(k === "blur" || k === "face" || k === "food") && (
                <rect
                  x={x}
                  y={y}
                  width={cw}
                  height={ch}
                  rx={10}
                  fill={k === "blur" ? KC.skyBlue : k === "face" ? KC.yellow : KC.orange}
                  opacity={k === "food" ? 0.16 : 0.1}
                />
              )}
              {k === "food" && (
                <g strokeLinecap="round">
                  {/* ラーメンの器 */}
                  <path
                    d={`M ${x + 55} ${y + 72} Q ${x + 100} ${y + 126} ${x + 145} ${y + 72} Z`}
                    fill={SP.panel}
                    stroke={KC.orange}
                    strokeWidth={4}
                  />
                  <ellipse cx={x + 100} cy={y + 72} rx={45} ry={10} fill="none" stroke={KC.orange} strokeWidth={4} />
                  {/* 湯気 */}
                  <g stroke={SP.faint} strokeWidth={3} fill="none">
                    <path d={`M ${x + 84} ${y + 52} q 6 -12 0 -22`} />
                    <path d={`M ${x + 100} ${y + 48} q 6 -12 0 -22`} />
                    <path d={`M ${x + 116} ${y + 52} q 6 -12 0 -22`} />
                  </g>
                </g>
              )}
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
          {/* 奇跡の1枚だけカラー (空=水色・山=緑・太陽=黄) */}
          <rect x={1170} y={300} width={300} height={400} rx={12} fill={KC.skyBlue} opacity={0.92} stroke={SP.line} strokeWidth={6} />
          <g stroke={SP.line} strokeWidth={5}>
            <path d="M 1210 620 L 1300 440 L 1390 620 Z" fill={KC.green} />
            <path d="M 1340 620 L 1402 500 L 1446 620 Z" fill={KC.green} />
            <circle cx={1414} cy={380} r={22} fill={KC.yellow} />
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
          <g opacity={appearAt(frame, fps, 26)}>
            {/* 赤い ×2 バッジ */}
            <circle cx={1540} cy={445} r={76} fill="none" stroke={SP.accent} strokeWidth={8} />
            <text
              x={1540}
              y={472}
              textAnchor="middle"
              fontSize={66}
              fontWeight={800}
              fill={SP.accent}
              fontFamily={SUURI_FONT}
            >
              ×2
            </text>
          </g>
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
  const tints = [KC.skyBlue, KC.lime, KC.pink, KC.orange]; // コマごとの淡い色味
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
              <rect x={x} y={444} width={280} height={152} rx={6} fill={tints[i]} opacity={0.1} />
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
  // 「勝てません」の文で、左 (自分) が画面の下へ沈んでいく
  const lose = /勝てません/.test(scene?.text ?? "");
  const sinkY = lose ? appearAt(frame, fps, Math.round(1.0 * fps)) * 560 : 0;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "これは、勝てない勝負"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 自分 (モノクロのNG集こみ・等倍) */}
        <g opacity={appearAt(frame, fps, 6)} transform={`translate(0, ${sinkY})`}>
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
        {/* 右: 7200倍濃縮の原液ジュース (カラフル) */}
        <g opacity={appearAt(frame, fps, 24)}>
          <g transform="translate(1400, 470) scale(1.35)">
            {/* 中身 (濃いオレンジの原液) */}
            <path d="M -62 -58 L 62 -58 L 52 80 Q 0 96 -52 80 Z" fill={KC.orange} opacity={0.92} />
            {/* グラス */}
            <path d="M -70 -95 L 70 -95 L 52 80 Q 0 96 -52 80 Z" fill="none" stroke={SP.line} strokeWidth={5} />
            {/* ストロー */}
            <line x1={26} y1={-130} x2={48} y2={-40} stroke={KC.pink} strokeWidth={9} strokeLinecap="round" />
          </g>
          <Sparkle x={1600} y={300} s={15} phase={1} />
          <Sparkle x={1230} y={420} s={12} phase={4} />
          <SmallLabel x={1400} y={760} text="7200倍濃縮の原液" color={SP.accent} size={34} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== nothing_tuesday: 誰にでもある「何もない火曜日」 =====
export const NothingTuesdayScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 「想像」の文では、うらやんでいた人が相手の火曜日を思い浮かべる絵にする
  const imagine = /想像/.test(scene?.text ?? "");
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "誰にでもある、何もない火曜日"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {imagine ? (
          <>
            {/* 右: うらやんでいた人 (スマホを手に、ふと考える) */}
            <Person x={1480} y={540} scale={1.8} />
            <rect x={1340} y={590} width={95} height={150} rx={13} fill={SP.panel} stroke={SP.line} strokeWidth={5} transform="rotate(-12 1388 665)" />
            <SmallLabel x={1480} y={800} text="想像してみる" color={SP.faint} size={28} />
            {/* 思考の泡 */}
            <circle cx={1360} cy={480} r={10} fill="none" stroke={SP.line} strokeWidth={4} opacity={appearAt(frame, fps, 8)} />
            <circle cx={1290} cy={420} r={16} fill="none" stroke={SP.line} strokeWidth={4} opacity={appearAt(frame, fps, 12)} />
            {/* 泡の中: あの人にも、何もない火曜日 */}
            <g opacity={appearAt(frame, fps, 16)}>
              <ellipse cx={740} cy={400} rx={470} ry={235} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
              <g transform="translate(740, 420) scale(0.62) translate(-960, -500)">
                {/* ミニ火曜日: カレンダー */}
                <rect x={560} y={320} width={210} height={230} rx={14} fill={SP.background} stroke={SP.line} strokeWidth={6} />
                <rect x={560} y={320} width={210} height={56} rx={14} fill={SP.dim} />
                <text x={665} y={500} textAnchor="middle" fontSize={90} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>
                  火
                </text>
                {/* ミニ火曜日: ソファでだらだら */}
                <rect x={900} y={520} width={520} height={130} rx={24} fill={SP.background} stroke={SP.line} strokeWidth={6} />
                <g transform="rotate(10 1120 540)">
                  <Person x={1120} y={490} scale={1.5} />
                </g>
                <path d="M 1285 638 L 1302 566 L 1356 566 L 1373 638 Z" fill="none" stroke={SP.faint} strokeWidth={5} strokeLinejoin="round" />
              </g>
              <SmallLabel x={740} y={676} text="あの人にも、何もない火曜日" color={SP.ink} size={30} weight={700} />
            </g>
            {/* 月 (黄色) */}
            <path d="M 1740 200 a 60 60 0 1 0 46 98 a 60 60 0 0 1 -46 -98 Z" fill={KC.yellow} opacity={0.9} />
          </>
        ) : (
          <>
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
                {/* 月 (黄色) */}
                <path d="M 1620 250 a 70 70 0 1 0 54 114 a 70 70 0 0 1 -54 -114 Z" fill={KC.yellow} opacity={0.9} />
                <text x={1480} y={330} fontSize={44} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT}>
                  z z…
                </text>
              </g>
            )}
          </>
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
        {/* 水面 (海の青) */}
        <path
          d="M 60 430 Q 160 408 260 430 T 460 430 T 660 430 T 860 430 T 1060 430 T 1260 430 T 1460 430 T 1660 430 T 1860 430"
          fill="none"
          stroke={KC.sea}
          strokeWidth={6}
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
  // 「撃ち落とされ」の文だけ、下からの対空砲火と落ちる1機を見せる
  const shot = /撃ち落とされ/.test(scene?.text ?? "");
  const fall = Math.min(Math.max(frame - 0.6 * fps, 0) * 1.1, 130);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "80年前・第二次世界大戦"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 編隊 */}
        <g transform={`translate(${drift}, 0)`}>
          <PlaneSilhouette x={700} y={300} scale={0.75} />
          <PlaneSilhouette x={1180} y={290} scale={0.75} />
          {!shot && <PlaneSilhouette x={950} y={390} scale={0.75} />}
        </g>
        {shot && (
          <>
            {/* 下からの対空砲火 (曳光弾が昇っていく) */}
            <g stroke={SP.faint} strokeWidth={5} strokeLinecap="round">
              {[0, 1, 2].map((i) => {
                const t = ((frame * 3 + i * 34) % 100) / 100;
                const x0 = 640 + i * 240;
                const y0 = 832;
                const tx = 930 + i * 24;
                const ty = 450;
                const px = x0 + (tx - x0) * t;
                const py = y0 + (ty - y0) * t;
                return (
                  <line
                    key={i}
                    x1={px}
                    y1={py}
                    x2={px + (tx - x0) * 0.07}
                    y2={py + (ty - y0) * 0.07}
                    opacity={0.9 - t * 0.3}
                  />
                );
              })}
            </g>
            {/* 被弾の閃光 (バースト) */}
            <g opacity={appearAt(frame, fps, 12) * (1 - Math.min(fall / 130, 1) * 0.6)}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={960 + Math.cos(rad) * 28}
                    y1={430 + Math.sin(rad) * 28}
                    x2={960 + Math.cos(rad) * 62}
                    y2={430 + Math.sin(rad) * 62}
                    stroke={SP.ink}
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
            {/* 撃たれて落ちる1機 (画面中央) */}
            <g transform={`translate(0, ${fall})`} opacity={appearAt(frame, fps, 12)}>
              <path d="M 1080 340 Q 1030 400 990 440" fill="none" stroke={SP.faint} strokeWidth={5} strokeDasharray="14 12" />
              <PlaneSilhouette x={940} y={480} scale={0.78} rotate={38} />
              <circle cx={932} cy={462} r={10} fill={SP.accent} />
            </g>
            <SmallLabel x={960} y={790} text="飛行機が、次々と撃ち落とされてしまう" color={SP.ink} size={32} weight={700} />
          </>
        )}
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
        {/* 星条旗 (和紙の反転を見越した塗り: 白→#000 / 赤→SP.accent / カントン→KC.blue) */}
        <g>
          <line x1={225} y1={250} x2={225} y2={700} stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
          <circle cx={225} cy={244} r={10} fill={SP.line} />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect
              key={i}
              x={233}
              y={262 + i * 20}
              width={230}
              height={20}
              fill={i % 2 === 0 ? SP.accent : "#000000"}
            />
          ))}
          <rect x={233} y={262} width={100} height={80} fill={KC.blue} />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle
              key={i}
              cx={253 + (i % 3) * 30}
              cy={282 + Math.floor(i / 3) * 36}
              r={5}
              fill="#000000"
            />
          ))}
          <rect x={233} y={262} width={230} height={140} fill="none" stroke={SP.line} strokeWidth={4} />
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
  const text = scene?.text ?? "";
  // 文の内容で絵を選び直す (§9-3):
  //   mode 0 = 待ったをかける (大きな手のひら)
  //   mode 1 = 答えは正反対 (矢印が翼・しっぽからエンジンへ入れ替わる)
  //   mode 2 = 命を救った (帰ってくる飛行機と出迎える人たち)
  const mode = /命を救った/.test(text) ? 2 : /正反対/.test(text) ? 1 : 0;
  const matta = /待った/.test(text);
  const flip = appearAt(frame, fps, Math.round(1.0 * fps)); // mode1: 矢印の入れ替わり
  const arrive = appearAt(frame, fps, 10); // mode2: 帰還
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ひとりの数学者が、待ったをかけた"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {mode === 0 && (
          <>
            {/* 左: 軍の人たち */}
            <CapPerson x={460} y={500} scale={1.6} />
            <CapPerson x={640} y={530} scale={1.45} />
            <SmallLabel x={550} y={790} text="軍の偉い人たち" color={SP.faint} size={28} />
            {/* 右: ウォールド (大きな手のひらを向ける) */}
            <g opacity={appearAt(frame, fps, 8)}>
              <Person x={1340} y={490} scale={1.7} />
              <path d="M 1300 600 Q 1230 545 1180 500" fill="none" stroke={SP.line} strokeWidth={9} strokeLinecap="round" />
              {/* 大きな手のひら (指4本+親指) */}
              <g transform="translate(1130, 450)" stroke={SP.line} strokeWidth={6} fill={SP.background}>
                <rect x={-42} y={-18} width={84} height={88} rx={24} />
                {[-31, -10, 11, 32].map((dx) => (
                  <rect key={dx} x={dx - 9} y={-66} width={19} height={56} rx={9} />
                ))}
                <rect x={36} y={0} width={46} height={19} rx={9} transform="rotate(32 36 0)" />
              </g>
              <SmallLabel x={1380} y={790} text="数学者 エイブラハム・ウォールド" color={SP.ink} size={30} weight={700} />
            </g>
            {/* 吹き出し */}
            <g opacity={appearAt(frame, fps, 18)}>
              <Bubble x={1130} y={230} w={460} h={110} tailTo={[1340, 400]}>
                <text x={1360} y={300} textAnchor="middle" fontSize={matta ? 44 : 36} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={3}>
                  {matta ? "待った！" : "お待ちください"}
                </text>
              </Bubble>
            </g>
          </>
        )}
        {mode === 1 && (
          <>
            {/* 上から見た飛行機 (簡略) */}
            <g stroke={SP.line} strokeWidth={5}>
              <ellipse cx={960} cy={500} rx={34} ry={160} fill={SP.background} />
              <rect x={660} y={478} width={600} height={40} rx={18} fill={SP.background} />
              <rect x={890} y={616} width={140} height={26} rx={12} fill={SP.background} />
              {/* エンジン2基 */}
              <circle cx={810} cy={498} r={28} fill={SP.background} />
              <circle cx={1110} cy={498} r={28} fill={SP.background} />
            </g>
            {/* 矢印: 翼・しっぽ → エンジンへ入れ替わる */}
            {[
              { from: [560, 300], wing: [688, 462], engine: [796, 462] },
              { from: [1360, 300], wing: [1232, 462], engine: [1124, 462] },
              { from: [960, 800], wing: [965, 660], engine: [838, 536] },
            ].map((ar, i) => {
              const tx = ar.wing[0] + (ar.engine[0] - ar.wing[0]) * flip;
              const ty = ar.wing[1] + (ar.engine[1] - ar.wing[1]) * flip;
              const ang = Math.atan2(ty - ar.from[1], tx - ar.from[0]);
              const col = flip > 0.5 ? SP.accent : SP.line;
              return (
                <g key={i} stroke={col} strokeWidth={8} strokeLinecap="round">
                  <line x1={ar.from[0]} y1={ar.from[1]} x2={tx} y2={ty} />
                  <line x1={tx} y1={ty} x2={tx - Math.cos(ang - 0.5) * 30} y2={ty - Math.sin(ang - 0.5) * 30} />
                  <line x1={tx} y1={ty} x2={tx - Math.cos(ang + 0.5) * 30} y2={ty - Math.sin(ang + 0.5) * 30} />
                </g>
              );
            })}
            {/* ラベル (入れ替わり) */}
            <g opacity={1 - flip}>
              <SmallLabel x={620} y={246} text="翼やしっぽに鉄板?" color={SP.faint} size={30} />
            </g>
            <g opacity={flip}>
              <SmallLabel x={1290} y={246} text="守るべきはエンジン" color={SP.accent} size={32} weight={800} />
            </g>
            <SmallLabel x={960} y={760} text="答えは、正反対" color={SP.ink} size={32} weight={700} />
          </>
        )}
        {mode === 2 && (
          <>
            {/* 帰ってくる飛行機 (右から) */}
            <g opacity={arrive}>
              <PlaneSilhouette x={620 + (1 - arrive) * 420} y={300} scale={0.7} rotate={4} />
              <PlaneSilhouette x={1060 + (1 - arrive) * 420} y={370} scale={0.6} rotate={2} />
              <PlaneSilhouette x={1460 + (1 - arrive) * 420} y={280} scale={0.55} rotate={6} />
            </g>
            {/* 地面と出迎える人たち (手をあげて) */}
            <line x1={240} y1={740} x2={1680} y2={740} stroke={SP.dim} strokeWidth={4} />
            {[640, 880, 1120].map((px, i) => (
              <g key={px} opacity={appearAt(frame, fps, 16 + i * 6)}>
                <Person x={px} y={600} scale={1.3} />
                <path
                  d={`M ${px - 20} ${626} Q ${px - 44} ${596} ${px - 54} ${566}`}
                  fill="none"
                  stroke={SP.line}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${px + 20} ${626} Q ${px + 44} ${596} ${px + 54} ${566}`}
                  fill="none"
                  stroke={SP.line}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
              </g>
            ))}
            <SmallLabel x={960} y={790} text="多くのパイロットの命を救った" color={SP.ink} size={32} weight={700} />
          </>
        )}
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
        {/* 右: ウォールドの頭の上に、点線の幽霊飛行機が浮かぶ */}
        <Person x={1560} y={560} scale={1.6} />
        <SmallLabel x={1560} y={790} text="ウォールド" color={SP.faint} size={28} />
        <g opacity={appearAt(frame, fps, 22)}>
          <circle cx={1520} cy={480} r={9} fill="none" stroke={SP.line} strokeWidth={4} />
          <circle cx={1490} cy={424} r={14} fill="none" stroke={SP.line} strokeWidth={4} />
          <GhostPlane x={1540} y={320} scale={0.6} opacity={0.85} />
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
        {/* 仕切り (海面・青い波線) */}
        <path
          d="M 700 500 Q 760 486 820 500 T 940 500 T 1060 500 T 1180 500 T 1300 500 T 1420 500 T 1540 500 T 1660 500 T 1760 500"
          fill="none"
          stroke={KC.sea}
          strokeWidth={5}
        />
        {/* 下: 数えられない影 (点線の幽霊飛行機) */}
        <g opacity={appearAt(frame, fps, 22)}>
          {Array.from({ length: 3 }).map((_, i) => (
            <GhostPlane key={i} x={900 + i * 300} y={620} scale={0.42} opacity={0.75} />
          ))}
          <text x={900} y={566} textAnchor="middle" fontSize={44} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>?</text>
          <text x={1200} y={566} textAnchor="middle" fontSize={44} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>?</text>
          <text x={1500} y={566} textAnchor="middle" fontSize={44} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>?</text>
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
          {/* 画面の中だけカラフル */}
          <rect x={634} y={546} width={102} height={92} rx={8} fill={KC.skyBlue} opacity={0.9} />
          <rect x={634} y={650} width={102} height={94} rx={8} fill={KC.pink} opacity={0.85} />
          <Sparkle x={765} y={530} s={14} phase={1} />
        </g>
        <g opacity={appearAt(frame, fps, 16)}>
          <rect x={1130} y={440} width={92} height={160} rx={12} fill={SP.background} stroke={SP.line} strokeWidth={5} />
          <rect x={1140} y={452} width={72} height={64} rx={6} fill={KC.orange} opacity={0.9} />
          <rect x={1140} y={524} width={72} height={64} rx={6} fill={KC.green} opacity={0.85} />
          <Sparkle x={1238} y={444} s={11} phase={3} />
        </g>
        <g opacity={appearAt(frame, fps, 24)}>
          <rect x={890} y={344} width={56} height={100} rx={8} fill={SP.background} stroke={SP.line} strokeWidth={4} />
          <rect x={897} y={352} width={42} height={84} rx={5} fill={KC.yellow} opacity={0.85} />
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
          {/* 相手の画面の中だけカラフル (あなたの投稿は、誰かの画面ではキラキラ) */}
          <Phone x={1170} y={380} w={190} h={330}>
            <FeedCard x={1188} y={430} w={154} h={100} kind="pass" colored />
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

// ============================================================
// ===== 専用イラスト追加分 (2026-10 検品での指示9種) =====
// ============================================================

// ===== not_consolation: なぐさめでも根性論でもなく、数字の話 =====
export const NotConsolationScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panels: { label: string; cx: number }[] = [
    { label: "なぐさめ", cx: 480 },
    { label: "根性論", cx: 960 },
    { label: "数字", cx: 1440 },
  ];
  const py = 470;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "なぐさめではなく、数字の話"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {panels.map(({ label, cx }, i) => {
          const a = appearAt(frame, fps, 10 + i * 10);
          const mark = appearAt(frame, fps, 44 + i * 8);
          return (
            <g key={label} opacity={a}>
              <rect x={cx - 150} y={py - 150} width={300} height={300} rx={20} fill={SP.panel} stroke={SP.dim} strokeWidth={4} />
              {i === 0 && (
                // ハート (なぐさめ)
                <path
                  d={`M ${cx} ${py + 74} C ${cx - 96} ${py - 20} ${cx - 40} ${py - 92} ${cx} ${py - 22} C ${cx + 40} ${py - 92} ${cx + 96} ${py - 20} ${cx} ${py + 74} Z`}
                  fill="none"
                  stroke={SP.line}
                  strokeWidth={6}
                />
              )}
              {i === 1 && (
                // 炎 (根性論): 先端が右に流れ、左に小さな二つ目の舌がある炎形 + 内炎
                <>
                  <path
                    d={`M ${cx + 16} ${py - 90}
                        C ${cx + 18} ${py - 60} ${cx + 40} ${py - 44} ${cx + 52} ${py - 16}
                        C ${cx + 64} ${py + 14} ${cx + 56} ${py + 50} ${cx + 32} ${py + 70}
                        C ${cx + 14} ${py + 84} ${cx - 14} ${py + 84} ${cx - 32} ${py + 70}
                        C ${cx - 56} ${py + 50} ${cx - 64} ${py + 12} ${cx - 50} ${py - 16}
                        C ${cx - 44} ${py - 28} ${cx - 36} ${py - 36} ${cx - 34} ${py - 48}
                        C ${cx - 22} ${py - 36} ${cx - 10} ${py - 38} ${cx - 6} ${py - 54}
                        C ${cx - 2} ${py - 68} ${cx + 6} ${py - 78} ${cx + 16} ${py - 90} Z`}
                    fill="none"
                    stroke={SP.line}
                    strokeWidth={6}
                    strokeLinejoin="round"
                  />
                  <path
                    d={`M ${cx + 2} ${py - 4}
                        C ${cx + 18} ${py + 14} ${cx + 26} ${py + 34} ${cx + 22} ${py + 52}
                        C ${cx + 18} ${py + 68} ${cx + 8} ${py + 76} ${cx - 2} ${py + 74}
                        C ${cx - 14} ${py + 72} ${cx - 22} ${py + 60} ${cx - 22} ${py + 44}
                        C ${cx - 22} ${py + 24} ${cx - 10} ${py + 12} ${cx + 2} ${py - 4} Z`}
                    fill="none"
                    stroke={SP.line}
                    strokeWidth={5}
                    strokeLinejoin="round"
                  />
                </>
              )}
              {i === 2 && (
                // 数式 (数字で確かめられる)。パネル幅300に収まる字サイズにする
                <text
                  x={cx}
                  y={py + 18}
                  textAnchor="middle"
                  fontSize={48}
                  fontWeight={800}
                  fill={SP.ink}
                  fontFamily={SUURI_FONT}
                >
                  600 ÷ 40
                </text>
              )}
              <SmallLabel x={cx} y={py + 220} text={label} color={SP.ink} size={34} weight={700} />
              {/* なぐさめ・根性論には赤い× / 数字には赤い丸 */}
              {i < 2 ? (
                <g opacity={mark} stroke={SP.accent} strokeWidth={10} strokeLinecap="round">
                  <line x1={cx - 120} y1={py - 120} x2={cx + 120} y2={py + 120} />
                  <line x1={cx + 120} y1={py - 120} x2={cx - 120} y2={py + 120} />
                </g>
              ) : (
                <circle
                  cx={cx}
                  cy={py}
                  r={132 * (0.75 + 0.25 * mark)}
                  fill="none"
                  stroke={SP.accent}
                  strokeWidth={9}
                  opacity={mark}
                />
              )}
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// ===== batter_rally: 打った瞬間だけが、次々と映し出される =====
// 左に並んだバッターが順番にスイングし、ボールが右へ飛び続ける
export const BatterRallyScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const batters = [300, 430, 560, 690]; // y 座標 (4人縦に並ぶ)
  const bx = 400;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "打った瞬間だけが、次々と"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {batters.map((by, i) => {
          // 1人ずつ順番にスイング (24フレーム周期・位相ずらし)
          const t = ((frame + i * 6) % 24) / 24;
          const swing = Math.sin(t * Math.PI) * 95; // 0→95→0 度
          return (
            <g key={by}>
              <Person x={bx} y={by - 40} scale={1.15} />
              {/* バット (構え -50度 → 振り抜き) */}
              <line
                x1={bx + 20}
                y1={by + 10}
                x2={bx + 20 + Math.cos(((-60 + swing) * Math.PI) / 180) * 95}
                y2={by + 10 + Math.sin(((-60 + swing) * Math.PI) / 180) * 95}
                stroke={SP.line}
                strokeWidth={9}
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {/* 飛んでいくボール (12球・軌跡つき) */}
        {Array.from({ length: 12 }, (_, j) => {
          const by = batters[j % 4];
          const f0 = 6 + j * 7;
          const t = (frame - f0) / 46;
          if (t < 0) return null;
          const tt = t % 1; // 画面を抜けたら次の球として再登場 (打ち続ける)
          const x = bx + 90 + tt * 1500;
          const y = by - 10 - Math.sin(tt * Math.PI) * (120 + (j % 3) * 40);
          return (
            <g key={j}>
              {/* 軌跡 */}
              {[1, 2, 3].map((k) => (
                <circle key={k} cx={x - k * 34} cy={y + k * 7} r={7 - k * 1.6} fill={SP.faint} opacity={0.5 - k * 0.13} />
              ))}
              <circle cx={x} cy={y} r={11} fill={SP.ink} />
            </g>
          );
        })}
        <SmallLabel x={400} y={820} text="打った瞬間だけ" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// ===== orz: 四つんばいで落ち込む人 =====
// 「必要もありません」の文では、立ち上がって小さくきらっとする
export const OrzScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = scene?.text ?? "";
  const standUp = /必要もありません/.test(text);
  // standUp: 1.2秒までorz → 2秒かけて立ち上がる
  const up = standUp ? appearAt(frame, fps, Math.round(1.2 * fps)) : 0;
  const groundY = 760;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "落ち込む必要は、ありません"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={480} y1={groundY} x2={1440} y2={groundY} stroke={SP.dim} strokeWidth={4} />
        {/* 四つんばい (orz) の姿勢 */}
        <g opacity={1 - up} stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round">
          {/* 頭 (うなだれて低い) */}
          <circle cx={800} cy={700} r={36} />
          {/* 腕 (頭の下に) */}
          <line x1={816} y1={726} x2={820} y2={760} />
          <line x1={784} y1={728} x2={778} y2={760} />
          {/* 背中 (弧) */}
          <path d="M 834 690 Q 950 596 1072 648" />
          {/* 脚 (ひざ立ち) */}
          <path d="M 1072 648 L 1096 736 L 1060 760" />
          <path d="M 1086 672 L 1130 744 L 1098 760" />
          {/* どんより線 (頭の上) */}
          <g stroke={SP.faint} strokeWidth={5}>
            <line x1={760} y1={610} x2={752} y2={646} />
            <line x1={800} y1={598} x2={798} y2={636} />
            <line x1={842} y1={610} x2={848} y2={646} />
          </g>
        </g>
        {/* 立ち上がった姿 (+小さなきらめき) */}
        {standUp && (
          <g opacity={up}>
            <Person x={950} y={560 + (1 - up) * 90} scale={2.2} />
            <Sparkle x={1120} y={500} s={14} phase={0} />
            <Sparkle x={830} y={460} s={10} phase={2} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== orange_press / lemon_press / lime_press: くだものをぎゅっとしぼる =====
// 1つの部品で fruit だけ差し替える (オレンジ=橙 / レモン=黄 / ライム=黄緑)
export const FruitPressScene: React.FC<SceneProps & { fruit: "orange" | "lemon" | "lime" }> = ({
  scene,
  fruit,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = fruit === "orange" ? KC.orange : fruit === "lemon" ? KC.yellow : KC.lime;
  const fruitName = fruit === "orange" ? "オレンジ" : fruit === "lemon" ? "レモン" : "ライム";
  // プレス板が下りる (0→1)
  const press = appearAt(frame, fps, 20);
  const plateY = 270 + press * 130;
  // 果汁: プレスが進むとしたたり、グラスにたまる
  const drip = Math.max(0, press - 0.3) / 0.7;
  const fill = Math.min(drip * (0.4 + frame / (3 * fps)), 1);
  // くだもの (2段にぎっしり) : プレスでつぶれる (縦につぶす)
  const fruits: [number, number, number][] = [
    [700, 470, 46], [790, 462, 50], [884, 472, 44], [976, 460, 50], [1068, 470, 46], [1160, 464, 48],
    [746, 548, 48], [840, 554, 46], [934, 548, 50], [1028, 554, 46], [1120, 548, 48],
  ];
  const squashY = 1 - press * 0.45;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? `${fruitName}を、ぎゅっとしぼる`} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* プレス機の枠 */}
        <g stroke={SP.line} strokeWidth={6} fill="none">
          <line x1={620} y1={200} x2={620} y2={640} />
          <line x1={1240} y1={200} x2={1240} y2={640} />
          <line x1={620} y1={640} x2={1240} y2={640} />
        </g>
        {/* くだもの (つぶれていく) */}
        {fruits.map(([fx, fy, r], i) => {
          const cy = 640 - (640 - fy) * squashY;
          const ry = r * squashY;
          return (
            <g key={i}>
              {fruit === "lemon" ? (
                <ellipse cx={fx} cy={cy} rx={r * 1.12} ry={ry * 0.8} fill={color} stroke={SP.background} strokeWidth={3} />
              ) : (
                <ellipse cx={fx} cy={cy} rx={r} ry={ry} fill={color} stroke={SP.background} strokeWidth={3} />
              )}
              {/* へた (小さな葉) */}
              <path d={`M ${fx} ${cy - ry} q 10 -14 24 -12`} fill="none" stroke={SP.dim} strokeWidth={4} />
            </g>
          );
        })}
        {/* プレス板 (下りてくる) */}
        <g>
          <rect x={632} y={plateY} width={596} height={36} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <line x1={930} y1={150} x2={930} y2={plateY} stroke={SP.line} strokeWidth={10} />
          <path d={`M 900 ${plateY - 34} h 60 v 14 h -60 Z`} fill={SP.line} />
        </g>
        {/* したたる果汁 */}
        {drip > 0 &&
          [0, 1, 2].map((i) => {
            const t = ((frame * 2.4 + i * 34) % 100) / 100;
            return (
              <circle
                key={i}
                cx={930 + (i - 1) * 14}
                cy={648 + t * 90}
                r={7}
                fill={color}
                opacity={drip * (1 - t)}
              />
            );
          })}
        {/* グラス (果汁がたまる) */}
        <g>
          <path d="M 870 744 L 990 744 L 976 850 L 884 850 Z" fill="none" stroke={SP.line} strokeWidth={6} strokeLinejoin="round" />
          <path
            d={`M ${874 + 10 * fill} ${844 - fill * 88} L ${986 - 10 * fill} ${844 - fill * 88} L ${975} ${846} L ${885} ${846} Z`}
            fill={color}
            opacity={0.95}
          />
        </g>
        <SmallLabel x={1430} y={520} text={`たくさんの${fruitName}が`} color={SP.faint} size={30} />
        <SmallLabel x={1430} y={562} text="ひとしぼりに" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// ===== drink_fall: 原液をそのまま飲んだら、むせてひっくり返る =====
export const DrinkFallScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 0〜1.2秒: ごくごく飲む → 1.2秒〜: 後ろへひっくり返る (コミカルに)
  const fall = appearAt(frame, fps, Math.round(1.2 * fps));
  const tilt = -fall * 100; // 後ろへ100度
  const gulp = Math.sin(frame / 5) * 4 * (1 - fall);
  const groundY = 750;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "そのまま飲んだら、むせる"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={480} y1={groundY} x2={1440} y2={groundY} stroke={SP.dim} strokeWidth={4} />
        {/* 人 (足もとを軸に後ろへ倒れる) */}
        <g transform={`rotate(${tilt} 900 ${groundY})`}>
          <g stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round">
            {/* 頭 (上を向いて飲む) */}
            <circle cx={900} cy={470 + gulp} r={40} />
            {/* 体 */}
            <line x1={900} y1={510} x2={900} y2={650} />
            {/* 脚 */}
            <line x1={900} y1={650} x2={862} y2={groundY} />
            <line x1={900} y1={650} x2={938} y2={groundY} />
            {/* 腕 (グラスを口へ) */}
            <line x1={900} y1={556} x2={964} y2={470 + gulp} />
          </g>
          {/* グラス (オレンジの原液) */}
          <g transform={`rotate(${-40 - gulp * 2} 1000 ${440 + gulp})`}>
            <path d={`M 972 ${404 + gulp} L 1028 ${404 + gulp} L 1020 ${472 + gulp} L 980 ${472 + gulp} Z`} fill="none" stroke={SP.line} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M 976 ${424 + gulp} L 1024 ${424 + gulp} L 1019 ${470 + gulp} L 981 ${470 + gulp} Z`} fill={KC.orange} opacity={0.95} />
          </g>
        </g>
        {/* むせた飛まつ と 勢い線 */}
        {fall > 0.15 && (
          <g opacity={Math.min(fall * 1.6, 1)}>
            <g stroke={SP.faint} strokeWidth={5} strokeLinecap="round">
              <line x1={1010} y1={420} x2={1070} y2={380} />
              <line x1={1030} y1={470} x2={1100} y2={450} />
              <line x1={1020} y1={520} x2={1086} y2={520} />
            </g>
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={1060 + i * 36} cy={400 - (i % 2) * 40} r={8 - i} fill={KC.orange} opacity={0.8} />
            ))}
            <SmallLabel x={1240} y={340} text="ゲホッ…!" color={SP.ink} size={40} weight={700} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== boxer_champ: 世界チャンピオンでも、勝てない =====
export const BoxerChampScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(10);
  const cx = 900;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "世界チャンピオンでも、勝てない"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          {/* 王冠 (金色) */}
          <path
            d={`M ${cx - 64} 268 L ${cx - 70} 216 L ${cx - 32} 244 L ${cx} 204 L ${cx + 32} 244 L ${cx + 70} 216 L ${cx + 64} 268 Z`}
            fill={KC.yellow}
            stroke={SP.background}
            strokeWidth={3}
          />
          {/* 頭 (困り顔) */}
          <circle cx={cx} cy={330} r={62} fill="none" stroke={SP.line} strokeWidth={6} />
          {/* 困りまゆ・目・への字口 */}
          <g stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
            <path d={`M ${cx - 36} 312 q 12 -10 24 -4`} />
            <path d={`M ${cx + 12} 308 q 12 -6 24 4`} />
            <circle cx={cx - 22} cy={330} r={4} fill={SP.line} />
            <circle cx={cx + 22} cy={330} r={4} fill={SP.line} />
            <path d={`M ${cx - 20} 362 q 20 -12 40 0`} />
          </g>
          {/* 汗 (たらり) */}
          <path
            d={`M ${cx + 66} ${300 + (frame % 40) * 1.2} q 10 14 0 24 q -10 -10 0 -24 Z`}
            fill={KC.skyBlue}
            opacity={0.9}
          />
          {/* 筋肉質な上半身 */}
          <g stroke={SP.line} strokeWidth={6} fill="none" strokeLinejoin="round">
            <path
              d={`M ${cx - 36} 384 Q ${cx - 150} 400 ${cx - 168} 470 Q ${cx - 176} 530 ${cx - 150} 584 L ${cx + 150} 584 Q ${cx + 176} 530 ${cx + 168} 470 Q ${cx + 150} 400 ${cx + 36} 384`}
            />
            {/* 胸筋の線 */}
            <path d={`M ${cx} 420 L ${cx} 540`} opacity={0.6} />
            <path d={`M ${cx - 70} 470 q 30 18 70 0`} opacity={0.6} />
            <path d={`M ${cx} 470 q 40 18 70 0`} opacity={0.6} />
            {/* 腕 (力こぶ) */}
            <path d={`M ${cx - 168} 470 Q ${cx - 250} 450 ${cx - 266} 380 Q ${cx - 270} 350 ${cx - 246} 344`} />
            <path d={`M ${cx + 168} 470 Q ${cx + 250} 450 ${cx + 266} 380 Q ${cx + 270} 350 ${cx + 246} 344`} />
          </g>
          {/* グローブ */}
          <circle cx={cx - 252} cy={318} r={40} fill={SP.ink} />
          <circle cx={cx + 252} cy={318} r={40} fill={SP.ink} />
          {/* チャンピオンベルト (金) */}
          <rect x={cx - 150} y={584} width={300} height={52} rx={10} fill={KC.yellow} stroke={SP.background} strokeWidth={3} />
          <circle cx={cx} cy={610} r={34} fill={KC.yellow} stroke={SP.dim} strokeWidth={5} />
          <Sparkle x={cx + 44} y={596} s={9} phase={1} />
        </g>
        {/* それでも勝てない */}
        <g opacity={appearAt(frame, fps, 30)}>
          <SmallLabel x={1480} y={420} text="それでも" color={SP.ink} size={36} weight={700} />
          <SmallLabel x={1480} y={472} text="勝てません" color={SP.accent} size={40} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== sofa_clock: ソファーでだらだら夜ふかし (時計が速回り) =====
export const SofaClockScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  // 時計の針がぐるぐる速回り (夜ふかしで時間が溶ける)
  const minuteDeg = frame * 14;
  const hourDeg = frame * 1.6;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "だらだらと、夜ふかし"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 月 (黄色) と星 */}
        <path d="M 360 230 a 48 48 0 1 0 44 70 a 38 38 0 0 1 -44 -70 Z" fill={KC.yellow} opacity={0.92} />
        <Sparkle x={500} y={200} s={9} phase={2} />
        {/* 壁の時計 (針が速回り) */}
        <g>
          <circle cx={1430} cy={300} r={110} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={1430 + Math.cos((i * Math.PI) / 2) * 92}
              y1={300 + Math.sin((i * Math.PI) / 2) * 92}
              x2={1430 + Math.cos((i * Math.PI) / 2) * 76}
              y2={300 + Math.sin((i * Math.PI) / 2) * 76}
              stroke={SP.faint}
              strokeWidth={5}
            />
          ))}
          <line
            x1={1430}
            y1={300}
            x2={1430 + Math.cos(((minuteDeg - 90) * Math.PI) / 180) * 84}
            y2={300 + Math.sin(((minuteDeg - 90) * Math.PI) / 180) * 84}
            stroke={SP.line}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <line
            x1={1430}
            y1={300}
            x2={1430 + Math.cos(((hourDeg - 90) * Math.PI) / 180) * 54}
            y2={300 + Math.sin(((hourDeg - 90) * Math.PI) / 180) * 54}
            stroke={SP.line}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <circle cx={1430} cy={300} r={8} fill={SP.line} />
          {/* 速回りの風切り線 */}
          <path d="M 1560 250 q 24 50 0 100" fill="none" stroke={SP.faint} strokeWidth={4} />
          <path d="M 1592 234 q 34 66 0 132" fill="none" stroke={SP.faint} strokeWidth={4} opacity={0.6} />
        </g>
        {/* ソファー */}
        <g stroke={SP.line} strokeWidth={6} fill={SP.panel} strokeLinejoin="round">
          <rect x={560} y={560} width={760} height={150} rx={28} />
          <rect x={520} y={480} width={110} height={230} rx={30} />
          <rect x={1250} y={480} width={110} height={230} rx={30} />
        </g>
        {/* だらだら寝そべる人 */}
        <g stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round">
          <circle cx={700} cy={480} r={40} />
          {/* 半目 */}
          <line x1={684} y1={482} x2={700} y2={482} stroke={SP.line} strokeWidth={4} />
          <line x1={712} y1={482} x2={726} y2={482} stroke={SP.line} strokeWidth={4} />
          {/* 体 (ソファーにだらり) */}
          <path d="M 736 500 Q 860 540 980 540 L 1140 540" />
          {/* 脚 (ひじかけに乗せる) */}
          <path d="M 1140 540 L 1250 500 L 1330 512" />
          {/* 腕 (だらん) */}
          <path d="M 800 520 L 820 600" />
        </g>
        {/* ポテチの袋 と こぼれたチップス */}
        <g>
          <path d="M 880 640 L 980 628 L 996 700 L 896 712 Z" fill={SP.panel} stroke={SP.line} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 880 640 L 980 628" stroke={SP.line} strokeWidth={8} />
          {[[1030, 686], [1075, 706], [1115, 684], [1060, 660]].map(([x, y], i) => (
            <path
              key={i}
              d={`M ${x} ${y} q 14 -16 28 0 q -14 12 -28 0 Z`}
              fill={KC.yellow}
              opacity={0.85}
              transform={`rotate(${i * 40} ${x} ${y})`}
            />
          ))}
        </g>
        <SmallLabel x={940} y={810} text="気づけば、こんな時間" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// ===== ww2_year: 時は、第二次世界大戦 (和紙・資料の扉絵) =====
export const Ww2YearScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(8);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "時は、第二次世界大戦"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* サーチライト (下から夜空を照らす) */}
        <g opacity={0.14}>
          <polygon points="300,870 180,870 760,180 840,180" fill={SP.ink} />
          <polygon points="1620,870 1740,870 1160,180 1080,180" fill={SP.ink} />
        </g>
        {/* 爆撃機の編隊 (右上へ向かう) */}
        {[
          { x: 1180, y: 300, s: 0.62 },
          { x: 1370, y: 360, s: 0.56 },
          { x: 1280, y: 440, s: 0.5 },
          { x: 1460, y: 500, s: 0.44 },
          { x: 1180, y: 520, s: 0.4 },
        ].map(({ x, y, s }, i) => (
          <PlaneSilhouette
            key={i}
            x={x + Math.sin(frame / 30 + i) * 6}
            y={y}
            scale={s}
            opacity={appearAt(frame, fps, 10 + i * 5)}
          />
        ))}
        {/* 対空砲火の炸裂 (小さな十字の閃光) */}
        {[
          [1100, 250], [1420, 260], [1250, 560], [1530, 420],
        ].map(([x, y], i) => {
          const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / 8 + i * 1.7));
          return (
            <g key={i} stroke={SP.line} strokeWidth={4} opacity={tw * appearAt(frame, fps, 24)}>
              <line x1={x - 16} y1={y} x2={x + 16} y2={y} />
              <line x1={x} y1={y - 16} x2={x} y2={y + 16} />
              <line x1={x - 10} y1={y - 10} x2={x + 10} y2={y + 10} opacity={0.6} />
              <line x1={x + 10} y1={y - 10} x2={x - 10} y2={y + 10} opacity={0.6} />
            </g>
          );
        })}
        {/* 大きな年号 */}
        <text
          x={620}
          y={560}
          textAnchor="middle"
          fontSize={230}
          fontWeight={800}
          fill={SP.ink}
          fontFamily={SUURI_FONT}
          letterSpacing={10}
          opacity={a}
        >
          1943
        </text>
        <SmallLabel x={620} y={660} text="第二次世界大戦のさなか" color={SP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// ===== wald_profile: 数学者エイブラハム・ウォールドの紹介 (和紙) =====
export const WaldProfileScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(8);
  const items = [
    { year: "1902", label: "ルーマニアに生まれる" },
    { year: "1938", label: "アメリカへ" },
    { year: "1943", label: "軍の研究グループへ" },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "数学者、エイブラハム・ウォールド"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 肖像 (めがねの学者) */}
        <g opacity={a}>
          <rect x={360} y={280} width={380} height={440} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          {/* 顔 */}
          <circle cx={550} cy={420} r={70} fill="none" stroke={SP.line} strokeWidth={6} />
          {/* 髪 (七三) */}
          <path d="M 486 400 Q 500 344 560 348 Q 612 352 618 404" fill="none" stroke={SP.line} strokeWidth={6} />
          {/* めがね */}
          <g stroke={SP.line} strokeWidth={5} fill="none">
            <circle cx={522} cy={424} r={22} />
            <circle cx={578} cy={424} r={22} />
            <line x1={544} y1={424} x2={556} y2={424} />
          </g>
          {/* 口もと (穏やか) */}
          <path d="M 532 468 q 18 10 36 0" fill="none" stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
          {/* スーツの肩 と ネクタイ */}
          <path d="M 440 720 Q 450 580 550 566 Q 650 580 660 720" fill="none" stroke={SP.line} strokeWidth={6} />
          <path d="M 550 566 L 536 600 L 550 660 L 564 600 Z" fill={SP.line} />
          <SmallLabel x={550} y={766} text="エイブラハム・ウォールド" color={SP.ink} size={30} weight={700} />
        </g>
        {/* 右: 年表 */}
        <line x1={980} y1={320} x2={980} y2={700} stroke={SP.dim} strokeWidth={5} />
        {items.map(({ year, label }, i) => {
          const p = appearAt(frame, fps, 16 + i * 12);
          const y = 360 + i * 150;
          return (
            <g key={year} opacity={p}>
              <circle cx={980} cy={y} r={12} fill={i === 2 ? SP.accent : SP.line} />
              <SmallLabel x={1060} y={y - 16} text={year} anchor="start" color={SP.ink} size={42} weight={800} />
              <SmallLabel x={1210} y={y - 12} text={label} anchor="start" color={SP.faint} size={32} />
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};
