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
  "pitfall_people",
  "count_only_hand",
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
  "sparkle_overflow",
  "futon_think",
  "declare_finger",
  "lets_go",
  "unmask",
  "preview_ch12",
  "preview_ch34",
  "photo_flood",
  "camera_roll_sleep",
  "troubles_rain",
  "vanish_posts",
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

// 上から見た飛行機 (機首が上)。bullet_map の山場の絵と同じ機体。
// 他のシーンで「上から見た飛行機」を描くときは必ずこれを流用する (機体の形がブレるのを防ぐ)
const PlaneTopView: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g opacity={opacity}>
    <g stroke={SP.line} strokeWidth={5} strokeLinejoin="round">
      {/* 主翼 (後退角つき) */}
      <path d="M 912 470 L 420 570 L 420 622 L 912 556 Z" fill={SP.background} />
      <path d="M 1008 470 L 1500 570 L 1500 622 L 1008 556 Z" fill={SP.background} />
      {/* 水平尾翼 */}
      <path d="M 920 706 L 706 766 L 706 800 L 920 752 Z" fill={SP.background} />
      <path d="M 1000 706 L 1214 766 L 1214 800 L 1000 752 Z" fill={SP.background} />
      {/* 胴体 (機首 → 尾部) */}
      <path
        d="M 960 206 Q 1014 258 1008 420 L 1008 660 Q 1004 744 982 806 L 938 806 Q 916 744 912 660 L 912 420 Q 906 258 960 206 Z"
        fill={SP.background}
      />
      {/* コックピットの窓 */}
      <path d="M 936 300 Q 960 286 984 300" fill="none" strokeWidth={4} />
    </g>
    {/* エンジン2基 (翼の上・プロペラつき)。穴はひとつもない */}
    {[742, 1178].map((ex) => (
      <g key={ex} stroke={SP.line} strokeWidth={5}>
        <rect x={ex - 36} y={474} width={72} height={104} rx={18} fill={SP.background} />
        <circle cx={ex} cy={468} r={10} fill={SP.line} />
        <line x1={ex - 34} y1={444} x2={ex + 34} y2={492} strokeWidth={4} />
        <line x1={ex + 34} y1={444} x2={ex - 34} y2={492} strokeWidth={4} />
      </g>
    ))}
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

  return (
    <Frame>
      {/* mode0 は下ラベルに情報があるので上タイトルは出さない (文字が3段になりうるさい) */}
      {mode !== 0 && <DiagramTitle text={title} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 全体を少し縮めて下げ、上のラベル (y180) と機首が重ならないようにする */}
        <g transform="translate(960 524) scale(0.9) translate(-960 -506)">
        {/* 機体 (共通部品。84の虫眼鏡シーンと同じ絵) */}
        <PlaneTopView />
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
      {/* 「守るべきは〜エンジンです」の瞬間は答えの説明をまだ出さない (次の文で種明かしするため) */}
      {mode === 2 && !/守るべき/.test(text) && (
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

// きらきら (4点星・またたく)。赤は使わない約束 (§9-4)
// 基本は白。「画面の中のキラキラ」ではcolorにKCの色を渡してカラフルにできる
const Sparkle: React.FC<{ x: number; y: number; s?: number; phase?: number; color?: string }> = ({
  x,
  y,
  s = 16,
  phase = 0,
  color = SP.ink,
}) => {
  const frame = useCurrentFrame();
  const tw = 0.55 + 0.45 * Math.sin(frame / 9 + phase);
  const p = s * 0.18;
  return (
    <path
      d={`M ${x} ${y - s} Q ${x + p} ${y - p} ${x + s} ${y} Q ${x + p} ${y + p} ${x} ${y + s} Q ${x - p} ${y + p} ${x - s} ${y} Q ${x - p} ${y - p} ${x} ${y - s} Z`}
      fill={color}
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
          {/* ガチャカプセル (上=黄・下=ピンク) — gacha_shine と同じ配色で統一 */}
          <path
            d={`M ${px + ps / 2 - ps * 0.3} ${py + ps / 2} a ${ps * 0.3} ${ps * 0.3} 0 0 1 ${ps * 0.6} 0 Z`}
            fill={colored ? KC.yellow : "none"}
            stroke={SP.line}
            strokeWidth={4}
          />
          <path
            d={`M ${px + ps / 2 - ps * 0.3} ${py + ps / 2} a ${ps * 0.3} ${ps * 0.3} 0 0 0 ${ps * 0.6} 0 Z`}
            fill={colored ? KC.pink : "none"}
            stroke={SP.line}
            strokeWidth={4}
          />
          <Sparkle x={px + ps - 12} y={py + 14} s={10} color={colored ? KC.yellow : SP.ink} />
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

// ===== テレビ画面の中のバッター (カラー版) =====
// 「テレビの中 = 画面の世界 = カラフル」の約束に合わせて、
// ユニフォーム=水色 / 肌=はだ色 / 帽子=青 / バット=木の茶色 でそろえる
const BATTER_SKIN = "#E7BD92"; // はだ色
const BATTER_WOOD = "#A9744F"; // 木のバット
const ColorBatter: React.FC<{
  x: number;
  y: number;
  scale?: number;
  bat?: [number, number, number, number]; // バットの絶対座標 [x1,y1,x2,y2]
}> = ({ x, y, scale = 1, bat }) => (
  <g>
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 体 (ユニフォーム=水色) */}
      <path
        d="M -26 66 q 2 -34 26 -36 q 24 2 26 36 Z"
        fill={KC.skyBlue}
        stroke={SP.line}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* 顔 (はだ色) */}
      <circle r={16} fill={BATTER_SKIN} stroke={SP.line} strokeWidth={5} />
      {/* 帽子 (青) : 頭の上半分 + つば */}
      <path d="M -16 -5 A 16 16 0 0 1 16 -5 Z" fill={KC.blue} stroke={SP.line} strokeWidth={4} strokeLinejoin="round" />
      <line x1={-24} y1={-5} x2={16} y2={-5} stroke={KC.blue} strokeWidth={6} strokeLinecap="round" />
    </g>
    {/* バット (木の茶色) */}
    {bat && (
      <line x1={bat[0]} y1={bat[1]} x2={bat[2]} y2={bat[3]} stroke={BATTER_WOOD} strokeWidth={9} strokeLinecap="round" />
    )}
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

  // open: 0-1.1秒 少しだけ歩く (ベッドのすぐそばから) → 1.1-1.9秒 ふとんへもぐる
  //       → 1.9-2.7秒 スマホを顔の上へかかげる → 2.8秒〜 画面が点く (芝居を長めに)
  const walkEnd = 1.1 * fps;
  const lieEnd = 1.9 * fps;
  const liftEnd = 2.7 * fps;
  const walkT = Math.min(frame / walkEnd, 1);
  const lieT = Math.max(0, Math.min((frame - walkEnd) / (lieEnd - walkEnd), 1));
  // スマホをかかげる動き (0→1): ふとんの中から顔の上へすっと持ち上げる
  const liftT = Math.max(0, Math.min((frame - lieEnd) / (liftEnd - lieEnd), 1));
  const personX = 1440 - (1440 - 1180) * walkT;
  const bob = walkT < 1 ? Math.abs(Math.sin(frame / 4.5)) * 10 : 0;

  // 画面の明かり: open=かかげ終わってから点く / sleep=最初から消えていく / default=すっと点く
  const defaultGlow = useAppear(10);
  const glow =
    mode === "open"
      ? appearAt(frame, fps, Math.round(liftEnd) + 4)
      : mode === "sleep"
        ? 1 - Math.min(frame / (1.6 * fps), 1)
        : defaultGlow;
  // open では、もぐり終わるまで ふとんの顔は見せない
  const faceIn = mode === "open" ? lieT : 1;
  // open では、スマホはふとんの中 (低い位置) から顔の上へ上がってくる
  const phoneRise = mode === "open" ? liftT : 1;

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
            <g opacity={mode === "open" ? Math.max(faceIn, phoneRise) : 1}>
              {/* スマホ本体: ふとんの中 (低い位置) から顔の上へかかげる */}
              <g transform={`translate(0 ${(1 - phoneRise) * 110})`}>
                {/* 画面の明かり (点いてから) */}
                <g opacity={glow}>
                  <polygon points="590,560 700,560 760,660 530,660" fill={SP.ink} opacity={0.1} />
                </g>
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
                {/* 腕 (ふとんから出てスマホを支える) */}
                <path d="M 640 640 Q 630 600 640 566" fill="none" stroke={SP.line} strokeWidth={5} strokeLinecap="round" opacity={faceIn} />
              </g>
              <g opacity={glow}>
                <Sparkle x={700} y={450} s={13} phase={0} />
                <Sparkle x={590} y={414} s={10} phase={2} />
              </g>
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
              r={isFinal ? 14 : 9}
              fill={isFinal && x > gates[2] ? SP.accent : KC.yellow}
              opacity={stopped ? 0.25 : arrived ? 1 : 0.95}
            />
          );
        })}
        {/* 右端のスマホ (あなたの画面): 最後の1粒が届いた瞬間、画面がカラフルに「点く」 */}
        {(() => {
          // 最後の粒 (i=9) の到着フレームを逆算して、点灯のきっかけにする
          const fx0 = 250 + (9 % 4) * 90 + (9 % 3) * 14;
          const popFrame = 10 + (9 % 5) * 3 + Math.ceil((1700 - fx0) / speed);
          const pop = appearAt(frame, fps, popFrame);
          return (
            <g>
              <g transform={`translate(1710 504) scale(${1 + 0.06 * Math.sin(Math.min(pop, 1) * Math.PI)}) translate(-1710 -504)`}>
                <rect x={1650} y={400} width={120} height={208} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
                {/* 点いた画面の中身 (ミニのカラフルなフィード) */}
                <g opacity={pop}>
                  <rect x={1664} y={428} width={92} height={42} rx={6} fill={KC.skyBlue} opacity={0.9} />
                  <rect x={1664} y={478} width={92} height={42} rx={6} fill={KC.orange} opacity={0.9} />
                  <rect x={1664} y={528} width={92} height={42} rx={6} fill={KC.yellow} opacity={0.9} />
                </g>
              </g>
              {/* 点いた瞬間の放射線ときらめき */}
              <g opacity={pop}>
                <g stroke={SP.line} strokeWidth={4} strokeLinecap="round">
                  {[-150, -120, -90, -60, -30].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    return (
                      <line
                        key={deg}
                        x1={1710 + Math.cos(rad) * 120}
                        y1={504 + Math.sin(rad) * 130}
                        x2={1710 + Math.cos(rad) * (120 + 34 * pop)}
                        y2={504 + Math.sin(rad) * (130 + 36 * pop)}
                      />
                    );
                  })}
                </g>
                <Sparkle x={1630} y={370} s={13} phase={1} color={KC.yellow} />
              </g>
              <SmallLabel x={1710} y={660} text="あなたの画面" color={SP.ink} size={26} weight={700} />
            </g>
          );
        })()}
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
        {/* 画面の中: 打った瞬間 (テレビの中=カラー) */}
        <g>
          <ColorBatter x={790} y={520} scale={1.5} bat={[810, 540, 880, 460]} />
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
        {/* テロップ (打球の軌道と重ならないよう、画面の右下へ) */}
        <text x={1272} y={652} textAnchor="end" fontSize={30} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={2}>
          ホームラン集
        </text>
        <Sparkle x={700} y={310} s={13} phase={0} color={KC.yellow} />
        <Sparkle x={680} y={620} s={12} phase={3} color={KC.pink} />
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
        {/* バッター (帽子・ユニフォーム・木のバットのカラー版) */}
        <ColorBatter x={430} y={560} scale={2.1} bat={[460, 590, 560, 470]} />
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
        {/* テレビ (小): 画面の中はカラーのバッター */}
        <rect x={380} y={370} width={420} height={290} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        <line x1={540} y1={665} x2={515} y2={720} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
        <line x1={660} y1={665} x2={685} y2={720} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
        <ColorBatter x={500} y={520} scale={1.0} bat={[515, 535, 560, 482]} />
        <Sparkle x={700} y={440} s={11} phase={1} color={KC.yellow} />
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
          <FeedCard x={466} y={266} w={268} h={150} kind="travel" colored />
          <FeedCard x={466} y={436} w={268} h={150} kind="food" colored />
          <FeedCard x={466} y={606} w={268} h={150} kind="pass" colored />
        </Phone>
        <Sparkle x={400} y={260} s={13} phase={0} />
        <Sparkle x={820} y={320} s={15} phase={2} />
        <Sparkle x={810} y={700} s={11} phase={4} />
        {/* = */}
        <g stroke={SP.line} strokeWidth={10} strokeLinecap="round" opacity={appearAt(frame, fps, 16)}>
          <line x1={930} y1={470} x2={1030} y2={470} />
          <line x1={930} y1={520} x2={1030} y2={520} />
        </g>
        {/* 右: ベスト盤 (ホームラン集のジャケット) — テレビの中と同じカラーのバッター */}
        <g opacity={appearAt(frame, fps, 24)}>
          <rect x={1130} y={300} width={400} height={400} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <ColorBatter x={1270} y={500} scale={1.3} bat={[1288, 518, 1350, 448]} />
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
        {/* 外れカプセル (gacha_shine と同じ 上=黄・下=ピンク。現実側なので彩度ひかえめに薄く) */}
        <g opacity={0.55}>
          <path d="M 465 560 a 95 95 0 0 1 190 0 Z" fill={KC.yellow} stroke={SP.dim} strokeWidth={6} />
          <path d="M 465 570 a 95 95 0 0 0 190 0 Z" fill={KC.pink} stroke={SP.dim} strokeWidth={6} />
          <g stroke={SP.faint} strokeWidth={7} strokeLinecap="round">
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

// ===== カメラロールの12コマグリッド (camera_roll と camera_roll_sleep で共用) =====
const CameraRollGrid: React.FC<{ idPrefix?: string }> = ({ idPrefix = "cam" }) => {
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
    <g>
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
                  <clipPath id={`camcell-${idPrefix}-${i}`}>
                    <rect x={x} y={y} width={cw} height={ch} rx={10} />
                  </clipPath>
                  <g clipPath={`url(#camcell-${idPrefix}-${i})`}>
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
    </g>
  );
};

// ===== camera_roll: あなたのカメラロール (NGだらけ) =====
export const CameraRollScene: React.FC<SceneProps> = ({ scene }) => (
  <Frame>
    <DiagramTitle text={scene?.title ?? "あなたのカメラロール"} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <CameraRollGrid />
      <SmallLabel x={960} y={768} text="ブレ・ゆび・変な顔が、ぎっしり" color={SP.faint} size={30} />
    </svg>
  </Frame>
);

// ===== camera_roll_sleep: 99枚のダメ写真は、底で眠ったまま =====
// 写真のグリッドがゆっくりフェードアウトして「眠り」につく
export const CameraRollSleepScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 1.2秒後から約2.5秒かけて、ゆっくり暗くなる (完全には消さない・下限0.18)
  const sleepT = Math.min(Math.max((frame - 1.2 * fps) / (2.5 * fps), 0), 1);
  const fade = 1 - 0.82 * sleepT;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "カメラロールの底で、眠ったまま"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g opacity={fade}>
          <CameraRollGrid idPrefix="sleep" />
        </g>
        {/* 眠りの z z z (暗くなるのに合わせて浮かぶ) */}
        <g opacity={appearAt(frame, fps, Math.round(1.8 * fps))}>
          <text x={1420} y={330} fontSize={44} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT}>
            z
          </text>
          <text x={1466} y={278} fontSize={56} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT}>
            z
          </text>
          <text x={1520} y={222} fontSize={70} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT}>
            z
          </text>
        </g>
        <SmallLabel x={960} y={768} text="99枚のダメ写真は、眠ったまま" color={SP.faint} size={30} />
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
            fill={KC.orange}
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
          <text x={960} y={706} textAnchor="middle" fontSize={44} fontWeight={800} fill={has36 ? KC.yellow : SP.faint} fontFamily={SUURI_FONT} letterSpacing={3}>
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
        {/* 上: 人気投稿 (画面の中のキラキラ=カラー) */}
        <g opacity={appearAt(frame, fps, 8)}>
          <FeedCard x={760} y={220} w={400} h={170} kind="travel" colored />
          <Sparkle x={1190} y={250} s={15} phase={1} color={KC.yellow} />
          <Sparkle x={730} y={300} s={12} phase={3} color={KC.yellow} />
          <Heart x={1310} y={308} s={13} color={KC.pink} />
          <SmallLabel x={1345} y={320} text="いいね 1200" color={SP.ink} size={34} weight={700} anchor="start" />
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
            {/* ×2 バッジ (2の色=ライム。赤は上向き矢印1要素だけに) */}
            <circle cx={1540} cy={445} r={76} fill="none" stroke={KC.lime} strokeWidth={8} />
            <text
              x={1540}
              y={472}
              textAnchor="middle"
              fontSize={66}
              fontWeight={800}
              fill={KC.lime}
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
  // 数字の色は濃縮ジュースのフルーツと同じ (100=オレンジ / 36=レモン / 2=ライム)
  const factors = [
    { v: "100", cap: "奇跡の1枚", cx: 350, color: KC.orange },
    { v: "36", cap: "特別な10日", cx: 690, color: KC.yellow },
    { v: "2", cap: "上に表示", cx: 1030, color: KC.lime },
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
            <text x={f.cx} y={478} textAnchor="middle" fontSize={64} fontWeight={800} fill={f.color} fontFamily={SUURI_FONT}>
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
            {/* 泡の中: あの人にも、何もない火曜日 (タイトル帯と重ならない高さに) */}
            <g opacity={appearAt(frame, fps, 16)}>
              <ellipse cx={740} cy={450} rx={470} ry={225} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
              <g transform="translate(740, 470) scale(0.62) translate(-960, -500)">
                {/* ミニ火曜日: 上が赤・下が白地の一般的なカレンダー */}
                <rect x={560} y={320} width={210} height={230} rx={14} fill="#F4F0E6" stroke={SP.line} strokeWidth={6} />
                <path d="M 560 334 q 0 -14 14 -14 h 182 q 14 0 14 14 v 42 h -210 Z" fill={SP.accent} />
                <text x={665} y={500} textAnchor="middle" fontSize={90} fontWeight={800} fill="#2A2A30" fontFamily={SUURI_FONT}>
                  火
                </text>
                {/* ミニ火曜日: ソファでだらだら */}
                <rect x={900} y={520} width={520} height={130} rx={24} fill={SP.background} stroke={SP.line} strokeWidth={6} />
                <g transform="rotate(10 1120 540)">
                  <Person x={1120} y={490} scale={1.5} />
                </g>
                <path d="M 1285 638 L 1302 566 L 1356 566 L 1373 638 Z" fill="none" stroke={SP.faint} strokeWidth={5} strokeLinejoin="round" />
              </g>
              <SmallLabel x={740} y={740} text="あの人にも、何もない火曜日" color={SP.ink} size={30} weight={700} />
            </g>
            {/* 月 (黄色) */}
            <path d="M 1740 200 a 60 60 0 1 0 46 98 a 60 60 0 0 1 -46 -98 Z" fill={KC.yellow} opacity={0.9} />
          </>
        ) : (
          <>
            {/* カレンダーの一枚 (上が赤・下が白地の一般的なカレンダー) */}
            <g opacity={appearAt(frame, fps, 6)}>
              <rect x={400} y={280} width={240} height={270} rx={14} fill="#F4F0E6" stroke={SP.line} strokeWidth={5} />
              <path d="M 400 294 q 0 -14 14 -14 h 212 q 14 0 14 14 v 50 h -240 Z" fill={SP.accent} />
              <circle cx={460} cy={280} r={9} fill={SP.background} stroke={SP.line} strokeWidth={4} />
              <circle cx={580} cy={280} r={9} fill={SP.background} stroke={SP.line} strokeWidth={4} />
              <text x={520} y={490} textAnchor="middle" fontSize={96} fontWeight={800} fill="#2A2A30" fontFamily={SUURI_FONT}>
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
        {/* 水面より上: 投稿された1枚 (画面に出る投稿=カラフル) */}
        <g opacity={appearAt(frame, fps, 6)}>
          <FeedCard x={820} y={220} w={280} h={150} kind="travel" colored />
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
        {/* 水面より下: 沈んでいく投稿たち (色はあるのに、沈んで見えなくなる) */}
        <g opacity={0.45} transform={`translate(0, ${sink})`}>
          <g transform="rotate(-14 600 560)">
            <FeedCard x={460} y={490} w={280} h={150} kind="food" colored />
          </g>
          <g transform="rotate(10 1040 630)">
            <FeedCard x={900} y={555} w={280} h={150} kind="win" colored />
          </g>
          <g transform="rotate(-7 1460 550)">
            <FeedCard x={1320} y={480} w={280} h={150} kind="travel" colored />
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
// 文で見せ方が変わる (絵が育つ):
// - 「だから画面を見るときは…」 → スマホを見る人 + 思考の泡 (導入の絵)
// - 「ここに届いていないものは、なんだろう?」 → つぶやきの言葉が画面中央に
//   大きくゆっくり浮かび上がる (このときは字幕を消す: Video.tsx 側で抑制)
export const WhisperQuestionScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const centerMode = /ここに届いていない/.test(scene?.text ?? "");

  if (centerMode) {
    // ゆっくりフェードイン (約2.5秒)
    const slowFade = Math.min(frame / (2.5 * fps), 1);
    const drift = (1 - slowFade) * 18; // すこしだけ下から浮かび上がる
    return (
      <Frame>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {/* 背景にうっすら飛行機 (第3章の余韻) */}
          <PlaneSilhouette x={320} y={240} scale={0.7} opacity={0.14 * slowFade} />
          <PlaneSilhouette x={1620} y={720} scale={0.55} rotate={6} opacity={0.12 * slowFade} />
          {/* 右下: 小さくつぶやく人 */}
          <g opacity={Math.min(slowFade * 1.6, 1)}>
            <Person x={1600} y={760} scale={1.1} />
            <circle cx={1530} cy={720} r={7} fill="none" stroke={SP.line} strokeWidth={3} opacity={0.7} />
            <circle cx={1486} cy={688} r={11} fill="none" stroke={SP.line} strokeWidth={3} opacity={0.7} />
          </g>
        </svg>
        {/* つぶやきの言葉: 中央に大きく、ゆっくり浮かび上がる */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: slowFade,
            transform: `translateY(${drift}px)`,
          }}
        >
          <div
            style={{
              fontFamily: SUURI_FONT,
              fontSize: 62,
              fontWeight: 800,
              color: SP.ink,
              letterSpacing: 4,
              textAlign: "center",
              lineHeight: 1.9,
            }}
          >
            「ここに届いていないものは、
            <br />
            なんだろう<span style={{ color: SP.accent }}>?</span>」
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ウォールドさんのつぶやき"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 右下: スマホを見る人 */}
        <Person x={1480} y={560} scale={1.7} />
        <rect x={1330} y={600} width={100} height={160} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={5} transform="rotate(-12 1380 680)" />
        {/* 思考の泡 */}
        <circle cx={1350} cy={545} r={10} fill="none" stroke={SP.line} strokeWidth={4} opacity={appearAt(frame, fps, 8)} />
        <circle cx={1280} cy={500} r={17} fill="none" stroke={SP.line} strokeWidth={4} opacity={appearAt(frame, fps, 12)} />
        {/* 泡 (タイトル帯と重ならない高さに) */}
        <g opacity={appearAt(frame, fps, 16)}>
          <ellipse cx={810} cy={405} rx={440} ry={180} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <PlaneSilhouette x={680} y={415} scale={0.75} opacity={0.3} />
          <text x={1020} y={450} textAnchor="middle" fontSize={88} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>
            ?
          </text>
        </g>
        <SmallLabel x={810} y={730} text="ここに届いていないものは、なんだろう?" color={SP.ink} size={34} weight={700} />
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
        {/* 行き交う矢印: スマホとスマホの間に水平の「⇄」。
            上段=あなたの画面→誰かの画面 (右向き)、下段=誰かの画面→あなたの画面 (左向き)。
            矢じりは相手のスマホの手前20pxで止めて、本体には触れない */}
        <g opacity={appearAt(frame, fps, 18)} stroke={SP.faint} strokeWidth={6} strokeLinecap="round">
          <line x1={800} y1={470} x2={1110} y2={470} />
          <path d="M 1150 470 l -40 -20 l 0 40 Z" fill={SP.faint} stroke="none" />
          <line x1={1120} y1={560} x2={810} y2={560} />
          <path d="M 770 560 l 40 -20 l 0 40 Z" fill={SP.faint} stroke="none" />
        </g>
        {/* 下段矢印 (y=560) と重ならないよう、文字は y=680 に置く */}
        <text x={960} y={680} textAnchor="middle" fontSize={60} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT} letterSpacing={4} opacity={appearAt(frame, fps, 26)}>
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
        {/* 炎のグラデーション (下=オレンジ → 上=赤)。根性論の熱血感を出す */}
        <defs>
          <linearGradient id="kirakiraFlameGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={KC.orange} />
            <stop offset="100%" stopColor={SP.accent} />
          </linearGradient>
        </defs>
        {panels.map(({ label, cx }, i) => {
          const a = appearAt(frame, fps, 10 + i * 10);
          const mark = appearAt(frame, fps, 44 + i * 8);
          return (
            <g key={label} opacity={a}>
              <rect x={cx - 150} y={py - 150} width={300} height={300} rx={20} fill={SP.panel} stroke={SP.dim} strokeWidth={4} />
              {i === 0 && (
                // ハート (なぐさめ): ピンクで塗る (線は残す)
                <path
                  d={`M ${cx} ${py + 74} C ${cx - 96} ${py - 20} ${cx - 40} ${py - 92} ${cx} ${py - 22} C ${cx + 40} ${py - 92} ${cx + 96} ${py - 20} ${cx} ${py + 74} Z`}
                  fill={KC.pink}
                  stroke={SP.line}
                  strokeWidth={6}
                />
              )}
              {i === 1 && (
                // 炎 (根性論): オレンジ→赤のグラデーションで塗る (線は残す)
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
                    fill="url(#kirakiraFlameGrad)"
                    stroke={SP.line}
                    strokeWidth={6}
                    strokeLinejoin="round"
                  />
                  {/* 内炎 (明るい芯): 黄色で中心を照らす */}
                  <path
                    d={`M ${cx + 2} ${py - 4}
                        C ${cx + 18} ${py + 14} ${cx + 26} ${py + 34} ${cx + 22} ${py + 52}
                        C ${cx + 18} ${py + 68} ${cx + 8} ${py + 76} ${cx - 2} ${py + 74}
                        C ${cx - 14} ${py + 72} ${cx - 22} ${py + 60} ${cx - 22} ${py + 44}
                        C ${cx - 22} ${py + 24} ${cx - 10} ${py + 12} ${cx + 2} ${py - 4} Z`}
                    fill={KC.yellow}
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
              {/* テレビの中=カラーのバッター。バット (構え -60度 → 振り抜き) は木の色 */}
              <ColorBatter
                x={bx}
                y={by - 40}
                scale={1.15}
                bat={[
                  bx + 20,
                  by + 10,
                  bx + 20 + Math.cos(((-60 + swing) * Math.PI) / 180) * 95,
                  by + 10 + Math.sin(((-60 + swing) * Math.PI) / 180) * 95,
                ]}
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
        {/* 四つんばい (orz) の姿勢: 頭を落とし、背中を丸め、ひざと手を床について落ち込む */}
        <g opacity={1 - up}>
          {/* 床の影 (落ち込みの重さ) */}
          <ellipse cx={960} cy={groundY + 6} rx={260} ry={14} fill={SP.ink} opacity={0.08} />
          <g stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* 頭 (床近くまでうなだれる) */}
            <circle cx={792} cy={694} r={32} />
            {/* 腕 2本 (肩から床へ、手をつく) */}
            <path d="M 824 712 Q 828 736 822 756" />
            <path d="M 798 722 Q 792 742 784 756" />
            {/* 背中 (首から腰まで、丸い一本の弧) */}
            <path d="M 818 680 Q 900 606 990 616 Q 1056 624 1072 672" />
            {/* もも (腰からひざへ) と すね (ひざから後ろへ床沿い) */}
            <path d="M 1072 672 Q 1082 716 1046 752 L 1172 752" />
            <path d="M 1086 692 Q 1096 726 1068 756 L 1186 744" />
          </g>
          {/* どんより (頭上から垂れる縦線) */}
          <g stroke={SP.faint} strokeWidth={5} strokeLinecap="round">
            <line x1={742} y1={586} x2={742} y2={634} />
            <line x1={782} y1={570} x2={782} y2={626} />
            <line x1={822} y1={580} x2={822} y2={630} />
            <line x1={860} y1={598} x2={860} y2={638} />
          </g>
          {/* ため息のもや */}
          {[0, 1, 2].map((i) => {
            const t = ((frame * 0.8 + i * 34) % 100) / 100;
            return (
              <circle
                key={i}
                cx={716 - t * 70 - i * 12}
                cy={668 - t * 90}
                r={6 + i * 4}
                fill="none"
                stroke={SP.faint}
                strokeWidth={4}
                opacity={(1 - t) * 0.7}
              />
            );
          })}
          <SmallLabel x={620} y={520} text="はぁ…" color={SP.faint} size={38} />
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
  // プレス板が下りる (0→1)。「しぼる」が主役なので、ほぼ最初から
  // ゆっくり下り始め、しっかり押しつぶすまで約2秒かける
  const press = Math.min(Math.max((frame - 4) / (2.0 * fps), 0), 1);
  // イージング (はじめゆっくり→ぐっと押し込む)
  const pressE = press * press * (3 - 2 * press);
  const plateY = 250 + pressE * 230;
  // 果汁: プレスが進むとしたたり、グラスにたまる
  const drip = Math.max(0, pressE - 0.25) / 0.75;
  const fill = Math.min(drip * (0.4 + frame / (3 * fps)), 1);
  // くだもの (2段にぎっしり) : プレスでつぶれる (縦につぶす)
  const fruits: [number, number, number][] = [
    [700, 470, 46], [790, 462, 50], [884, 472, 44], [976, 460, 50], [1068, 470, 46], [1160, 464, 48],
    [746, 548, 48], [840, 554, 46], [934, 548, 50], [1028, 554, 46], [1120, 548, 48],
  ];
  const squashY = 1 - pressE * 0.5;
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
        {/* ぎゅっと押した勢いの線 (プレス板の左右) */}
        {pressE > 0.5 && (
          <g stroke={SP.faint} strokeWidth={5} strokeLinecap="round" opacity={(pressE - 0.5) * 2}>
            <line x1={596} y1={plateY + 2} x2={566} y2={plateY - 24} />
            <line x1={596} y1={plateY + 30} x2={560} y2={plateY + 30} />
            <line x1={1264} y1={plateY + 2} x2={1294} y2={plateY - 24} />
            <line x1={1264} y1={plateY + 30} x2={1300} y2={plateY + 30} />
          </g>
        )}
        {/* したたる果汁 (しぼりが進むと、ひと筋の流れになる) */}
        {drip > 0.55 && (
          <rect x={926} y={648} width={8} height={92} rx={4} fill={color} opacity={(drip - 0.55) * 2} />
        )}
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
        {/* 側注: 右側の勢いの線 (x〜1300) に触れないよう、少し右に離して置く */}
        <SmallLabel x={1480} y={520} text={`たくさんの${fruitName}が`} color={SP.faint} size={30} />
        <SmallLabel x={1480} y={562} text="ひとしぼりに" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// ===== drink_fall: 原液をそのまま飲んだら、むせてひっくり返る =====
// 「むせているかも」の文 (第4章) では左右を反転して、
// 「あなたの濃縮ジュースで、画面のむこうの誰かがむせている」絵に変わる
export const DrinkFallScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mirror = /むせているかも/.test(scene?.text ?? "");
  // 0〜1.2秒: ごくごく飲む → 1.2秒〜: 後ろへひっくり返る (コミカルに)
  const fall = appearAt(frame, fps, Math.round(1.2 * fps));
  const tilt = -fall * 100; // 後ろへ100度
  const gulp = Math.sin(frame / 5) * 4 * (1 - fall);
  const groundY = 750;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (mirror ? "誰かが、あなたのジュースでむせる" : "そのまま飲んだら、むせる")} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={480} y1={groundY} x2={1440} y2={groundY} stroke={SP.dim} strokeWidth={4} />
        {/* 絵の部分だけ左右反転 (文字は反転しないよう外に出す) */}
        <g transform={mirror ? `translate(${W} 0) scale(-1 1)` : undefined}>
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
            </g>
          )}
        </g>
        {/* 文字 (反転させない) */}
        {fall > 0.15 && (
          <g opacity={Math.min(fall * 1.6, 1)}>
            <SmallLabel x={mirror ? 680 : 1240} y={340} text="ゲホッ…!" color={SP.ink} size={40} weight={700} />
          </g>
        )}
        {mirror && (
          <>
            <SmallLabel x={1020} y={810} text="画面のむこうの、誰か" color={SP.faint} size={30} />
            <SmallLabel x={1560} y={560} text="あなたの濃縮ジュース" color={SP.faint} size={28} />
          </>
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

// ===== sparkle_overflow: スマホからきらきらがあふれ出す (「きらきら、きらきら。」) =====
export const SparkleOverflowScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(6);
  // あふれるきらきら: 色・出発位置・ゆらぎを変えてループで立ちのぼる
  const sparks = [
    { dx: -90, color: KC.yellow, s: 18, speed: 1.0, sway: 36, phase: 0 },
    { dx: -30, color: KC.pink, s: 14, speed: 1.3, sway: -30, phase: 2 },
    { dx: 40, color: KC.skyBlue, s: 16, speed: 0.9, sway: 44, phase: 4 },
    { dx: 100, color: KC.green, s: 12, speed: 1.2, sway: -40, phase: 1 },
    { dx: -60, color: KC.orange, s: 13, speed: 1.1, sway: 26, phase: 3 },
    { dx: 70, color: KC.yellow, s: 11, speed: 1.4, sway: -22, phase: 5 },
    { dx: 0, color: KC.pink, s: 20, speed: 0.8, sway: 18, phase: 2 },
    { dx: -110, color: KC.skyBlue, s: 10, speed: 1.25, sway: -34, phase: 0 },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "きらきら、きらきら"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          {/* 中央のスマホ (画面の中はカラフルな投稿) */}
          <Phone x={790} y={330} w={340} h={560}>
            <g opacity={appearAt(frame, fps, 8)}>
              <FeedCard x={828} y={386} w={264} h={150} kind="travel" colored />
            </g>
            <g opacity={appearAt(frame, fps, 16)}>
              <FeedCard x={828} y={556} w={264} h={150} kind="food" colored />
            </g>
            <g opacity={appearAt(frame, fps, 24)}>
              <FeedCard x={828} y={726} w={264} h={150} kind="win" colored />
            </g>
          </Phone>
          {/* 画面の光があふれるイメージ */}
          <polygon points="800,336 1120,336 1310,150 610,150" fill={SP.ink} opacity={0.07} />
        </g>
        {/* あふれ出すきらきら: 画面の上端からループで立ちのぼる */}
        {sparks.map(({ dx, color, s, speed, sway, phase }, i) => {
          const loop = 2.4 * fps; // 1本あたり2.4秒で1周
          const t = ((frame * speed + i * 23) % loop) / loop; // 0→1
          const x = 960 + dx + Math.sin(t * Math.PI * 2 + i) * sway;
          const y = 360 - t * 300; // 画面上端 (約360) から上へ
          const fade = t < 0.15 ? t / 0.15 : t > 0.75 ? (1 - t) / 0.25 : 1; // 出現→消滅
          return (
            <g key={i} opacity={fade * a}>
              <Sparkle x={x} y={y} s={s * (0.7 + 0.3 * fade)} phase={phase} color={color} />
            </g>
          );
        })}
        {/* 画面のふち付近にも常駐のきらめき */}
        <Sparkle x={760} y={430} s={12} phase={1} color={KC.yellow} />
        <Sparkle x={1170} y={520} s={14} phase={3} color={KC.pink} />
        <Sparkle x={740} y={700} s={10} phase={5} color={KC.skyBlue} />
        <Sparkle x={1180} y={790} s={11} phase={0} color={KC.green} />
      </svg>
    </Frame>
  );
};

// ===== futon_think: ふとんの中、画面の明かりに照らされて ふと思う =====
export const FutonThinkScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(6);
  const glow = useAppear(10);
  // 「…」が1文字ずつ浮かぶ
  const dots = [0, 1, 2].map((i) => appearAt(frame, fps, 26 + i * 10));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ふと、思う"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 月と星 (夜) */}
        <path d="M 1610 240 a 56 56 0 1 0 50 82 a 44 44 0 0 1 -50 -82 Z" fill={KC.yellow} opacity={0.92} />
        <Sparkle x={1450} y={200} s={10} phase={1} />
        <Sparkle x={1720} y={380} s={8} phase={3} />
        {/* 床 */}
        <line x1={320} y1={820} x2={1620} y2={820} stroke={SP.dim} strokeWidth={4} />
        {/* ふとん一式 (futon_phone と同じ構図) */}
        <g transform="translate(960 820) scale(0.75) translate(-960 -820)" opacity={a}>
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
          {/* スマホ (顔の上にかかげたまま) と 画面の明かりが顔を照らす */}
          <g opacity={glow}>
            <polygon points="590,560 700,560 760,660 530,660" fill={SP.ink} opacity={0.14} />
          </g>
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
          <path d="M 640 640 Q 630 600 640 566" fill="none" stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* 考えごとの泡 → 「…」のふきだし (顔の上あたり) */}
        <circle cx={520} cy={560} r={9} fill="none" stroke={SP.line} strokeWidth={4} opacity={appearAt(frame, fps, 14)} />
        <circle cx={480} cy={500} r={14} fill="none" stroke={SP.line} strokeWidth={4} opacity={appearAt(frame, fps, 20)} />
        <g opacity={appearAt(frame, fps, 26)}>
          <ellipse cx={420} cy={390} rx={130} ry={80} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        </g>
        {dots.map((d, i) => (
          <circle key={i} cx={370 + i * 50} cy={398} r={10} fill={SP.ink} opacity={d} />
        ))}
      </svg>
    </Frame>
  );
};

// ===== declare_finger: 正面向きの人が人さし指を立てて宣言 (「先に、結論を言います。」) =====
export const DeclareFingerScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(6);
  // 指を立てる動き: 0.5秒かけてすっと上がる
  const raise = appearAt(frame, fps, 10);
  const lines = appearAt(frame, fps, 20);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "先に、結論"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 床 */}
        <line x1={520} y1={850} x2={1400} y2={850} stroke={SP.dim} strokeWidth={4} />
        <g opacity={a}>
          {/* 正面向きの人 (大きめ) */}
          <g transform="translate(960 560) scale(2.4)">
            {/* 体 */}
            <path d="M -26 120 q 2 -56 26 -58 q 24 2 26 58 Z" fill="none" stroke={SP.line} strokeWidth={5} strokeLinejoin="round" />
            {/* 頭 */}
            <circle cy={40} r={17} fill="none" stroke={SP.line} strokeWidth={5} />
            {/* 目 (まっすぐこちらを見る) */}
            <circle cx={-6} cy={38} r={2} fill={SP.ink} />
            <circle cx={6} cy={38} r={2} fill={SP.ink} />
            {/* 口 (きゅっと結ぶ) */}
            <path d="M -5 48 q 5 3 10 0" fill="none" stroke={SP.line} strokeWidth={3} strokeLinecap="round" />
          </g>
          {/* 腕 と 人さし指: raise で上がる */}
          <g opacity={raise}>
            {/* 腕 (体の右側から上へ) */}
            <path
              d={`M 1016 760 Q 1070 ${700 - raise * 110} 1082 ${640 - raise * 160}`}
              fill="none"
              stroke={SP.line}
              strokeWidth={11}
              strokeLinecap="round"
            />
            {/* こぶし */}
            <circle cx={1082} cy={640 - raise * 160} r={17} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
            {/* 人さし指 (1本だけ立てる) */}
            <line
              x1={1082}
              y1={628 - raise * 160}
              x2={1082}
              y2={586 - raise * 160}
              stroke={SP.line}
              strokeWidth={9}
              strokeLinecap="round"
            />
          </g>
          {/* 強調の放射線 (指先のまわり) */}
          <g opacity={lines} stroke={SP.line} strokeWidth={5} strokeLinecap="round">
            {[-150, -115, -80, -45, -10].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cx = 1082;
              const cy = 420;
              return (
                <line
                  key={deg}
                  x1={cx + Math.cos(rad) * 58}
                  y1={cy + Math.sin(rad) * 58}
                  x2={cx + Math.cos(rad) * 100}
                  y2={cy + Math.sin(rad) * 100}
                />
              );
            })}
          </g>
          {/* 「結論」を指す赤い点 */}
          <circle cx={1082} cy={420} r={8} fill={SP.accent} opacity={lines} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== lets_go: 腕を突き上げて出発 (「それでは、まいりましょう。」) =====
export const LetsGoScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(6);
  // 歩き出し: ばねで一歩前へふみ出す (007の「指差し宣言」とは別の絵にする)
  const step = appearAt(frame, fps, 12);
  const lines = appearAt(frame, fps, 18);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "それでは、まいりましょう"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 床 */}
        <line x1={420} y1={850} x2={1500} y2={850} stroke={SP.dim} strokeWidth={4} />
        {/* 目的地の旗 (赤ワンポイント) */}
        <g opacity={lines}>
          <line x1={1380} y1={850} x2={1380} y2={730} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
          <path d="M 1380 730 l 76 24 l -76 24 Z" fill={SP.accent} />
        </g>
        <g opacity={a}>
          {/* 人 (前のめりで、旗へ向かって歩き出す) */}
          <g transform={`translate(${820 + step * 70} 622) scale(2.3) rotate(${8 * step})`}>
            <path d="M -26 100 q 2 -50 26 -52 q 24 2 26 52 Z" fill="none" stroke={SP.line} strokeWidth={5} strokeLinejoin="round" />
            <circle cy={26} r={17} fill="none" stroke={SP.line} strokeWidth={5} />
            {/* 口 (元気よく開く) */}
            <path d="M -4 32 q 4 7 10 2" fill="none" stroke={SP.line} strokeWidth={3} strokeLinecap="round" />
            {/* 前へ差し出す腕 (旗の方向へ、水平ぎみ) */}
            <path d="M 16 62 Q 48 46 86 40" fill="none" stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
            <circle cx={86} cy={40} r={8} fill={SP.panel} stroke={SP.line} strokeWidth={3} />
          </g>
          {/* 勢いの流線 (体の左うしろ、強め) */}
          <g opacity={lines} stroke={SP.faint} strokeWidth={5} strokeLinecap="round">
            <line x1={560} y1={600} x2={740} y2={580} />
            <line x1={530} y1={680} x2={720} y2={668} />
            <line x1={560} y1={760} x2={730} y2={752} />
            <line x1={600} y1={828} x2={760} y2={824} />
          </g>
        </g>
      </svg>
    </Frame>
  );
};

// ============================================================
// ===== 修正第三弾で追加した専用イラスト =====
// ============================================================

// ===== unmask: 選ばれ方を、虫めがねで見破る =====
// キラキラ投稿の後ろに隠れた「選ばれなかったもの」を、レンズの中にだけ映す
export const UnmaskScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 虫めがねが右からすっと入ってくる
  const slide = appearAt(frame, fps, 10);
  const lensX = 1130 - (1 - slide) * 260;
  const lensY = 505;
  const lensR = 215;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "選ばれ方を、見破る"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="unmask-lens">
            <circle cx={lensX} cy={lensY} r={lensR - 8} />
          </clipPath>
        </defs>
        {/* 表の顔: キラキラの投稿 (カラー) */}
        <FeedCard x={540} y={330} w={400} h={200} kind="travel" colored />
        <Sparkle x={980} y={330} s={15} phase={1} color={KC.yellow} />
        <Sparkle x={510} y={420} s={11} phase={3} color={KC.yellow} />
        <SmallLabel x={740} y={620} text="キラキラの投稿" color={SP.faint} size={28} />
        {/* レンズの中: 隠れていた「選ばれなかった99枚」(点線のゴースト) */}
        <g clipPath="url(#unmask-lens)" opacity={slide}>
          <rect x={lensX - lensR} y={lensY - lensR} width={lensR * 2} height={lensR * 2} fill={SP.panel} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const gx = lensX - 165 + (i % 3) * 115;
            const gy = lensY - 125 + Math.floor(i / 3) * 125;
            return (
              <g key={i} opacity={appearAt(frame, fps, 18 + i * 4)}>
                <rect
                  x={gx}
                  y={gy}
                  width={95}
                  height={100}
                  rx={8}
                  fill="none"
                  stroke={SP.faint}
                  strokeWidth={4}
                  strokeDasharray="10 8"
                />
                <path
                  d={`M ${gx + 16} ${gy + 56} q 16 -12 32 0 q 16 12 32 0`}
                  fill="none"
                  stroke={SP.dim}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
          <text
            x={lensX}
            y={lensY + 165}
            textAnchor="middle"
            fontSize={34}
            fontWeight={700}
            fill={SP.ink}
            fontFamily={SUURI_FONT}
            opacity={appearAt(frame, fps, 40)}
          >
            隠れた99枚
          </text>
        </g>
        {/* 虫めがね本体 (枠と柄) */}
        <g opacity={Math.min(slide * 2, 1)}>
          <circle cx={lensX} cy={lensY} r={lensR} fill="none" stroke={SP.line} strokeWidth={11} />
          <line
            x1={lensX + lensR * 0.72}
            y1={lensY + lensR * 0.72}
            x2={lensX + lensR * 0.72 + 150}
            y2={lensY + lensR * 0.72 + 150}
            stroke={SP.line}
            strokeWidth={22}
            strokeLinecap="round"
          />
        </g>
        <SmallLabel x={960} y={810} text="かんたんな計算で、カラクリが見える" color={SP.ink} size={30} weight={700} />
      </svg>
    </Frame>
  );
};

// ===== preview_ch12: 章予告・前半 (第1章=ホームラン / 第2章=濃縮ジュース) =====
// 斜めの線で画面を2分割して、左右に章の顔を置く (カラー)
export const PreviewCh12Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const right = appearAt(frame, fps, Math.round(1.6 * fps));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日の流れ・前半"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 斜めの仕切り線 */}
        <line x1={1075} y1={195} x2={845} y2={880} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
        {/* 左: 第1章 ホームラン集 */}
        <g opacity={appearAt(frame, fps, 6)}>
          <SmallLabel x={520} y={280} text="第1章" color={SP.ink} size={40} weight={800} />
          <ColorBatter x={450} y={520} scale={1.8} bat={[476, 545, 560, 445]} />
          {/* 打球 */}
          <circle cx={700} cy={360} r={11} fill={SP.ink} />
          <path d="M 560 450 Q 630 390 694 364" fill="none" stroke={SP.faint} strokeWidth={4} strokeDasharray="4 12" />
          <SmallLabel x={520} y={700} text="ホームラン集のひみつ" color={SP.ink} size={32} weight={700} />
        </g>
        {/* 右: 第2章 何倍濃縮かを計算 */}
        <g opacity={right}>
          <SmallLabel x={1400} y={280} text="第2章" color={SP.ink} size={40} weight={800} />
          {/* 濃縮ジュースのグラス (オレンジの原液) */}
          <g transform="translate(1400, 470) scale(1.2)">
            <path d="M -62 -58 L 62 -58 L 52 80 Q 0 96 -52 80 Z" fill={KC.orange} opacity={0.92} />
            <path d="M -70 -95 L 70 -95 L 52 80 Q 0 96 -52 80 Z" fill="none" stroke={SP.line} strokeWidth={5} />
            <line x1={26} y1={-130} x2={48} y2={-40} stroke={KC.pink} strokeWidth={9} strokeLinecap="round" />
          </g>
          <Sparkle x={1560} y={300} s={13} phase={2} color={KC.yellow} />
          <text x={1400} y={660} textAnchor="middle" fontSize={44} fontWeight={800} fill={KC.orange} fontFamily={SUURI_FONT}>
            何倍濃縮?
          </text>
          <SmallLabel x={1400} y={714} text="あなたの画面を計算" color={SP.ink} size={32} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== preview_ch34: 章予告・後半 (第3章=飛行機 / 第4章=付き合い方) =====
export const PreviewCh34Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const right = appearAt(frame, fps, Math.round(1.6 * fps));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日の流れ・後半"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 斜めの仕切り線 */}
        <line x1={1075} y1={195} x2={845} y2={880} stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
        {/* 左: 第3章 飛行機の名推理 */}
        <g opacity={appearAt(frame, fps, 6)}>
          <SmallLabel x={520} y={280} text="第3章" color={SP.ink} size={40} weight={800} />
          <PlaneSilhouette x={500} y={470} scale={0.95} rotate={-8} />
          {/* 飛行機雲 */}
          <path d="M 700 530 Q 820 570 900 640" fill="none" stroke={SP.faint} strokeWidth={5} strokeDasharray="4 14" />
          <SmallLabel x={520} y={700} text="80年前の飛行機の名推理" color={SP.ink} size={32} weight={700} />
        </g>
        {/* 右: 第4章 キラキラ画面との付き合い方 */}
        <g opacity={right}>
          <SmallLabel x={1400} y={280} text="第4章" color={SP.ink} size={40} weight={800} />
          {/* スマホ (画面の中はカラー) と、となりに立つ人 (なかよし) */}
          <rect x={1270} y={370} width={150} height={260} rx={18} fill={SP.background} stroke={SP.line} strokeWidth={6} />
          <rect x={1286} y={390} width={118} height={100} rx={8} fill={KC.skyBlue} opacity={0.9} />
          <rect x={1286} y={502} width={118} height={100} rx={8} fill={KC.pink} opacity={0.85} />
          <Sparkle x={1438} y={376} s={12} phase={1} color={KC.yellow} />
          <Person x={1545} y={460} scale={1.5} />
          {/* 握手がわりの線 (スマホと人がなかよくつながる) */}
          <path d="M 1424 520 Q 1472 540 1512 530" fill="none" stroke={SP.faint} strokeWidth={5} strokeLinecap="round" />
          <SmallLabel x={1420} y={714} text="キラキラ画面との付き合い方" color={SP.ink} size={32} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== photo_flood: スクロールしても次々あふれるダメ写真 =====
// カメラロールを開くと、ブレ・ゆび・変な顔が延々と流れてくる
export const PhotoFloodScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  // 5段×2列 = 10コマがループして、延々と上へ流れていく
  const kinds = ["blur", "finger", "face", "blur", "face", "blur", "finger", "blur", "face", "finger"] as const;
  const step = 150;
  const band = 5 * step; // ループ1周ぶんの高さ
  const cw = 170;
  const ch = 130;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ダメ写真が、ぎっしり"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="floodClip">
            <rect x={768} y={244} width={384} height={540} rx={20} />
          </clipPath>
        </defs>
        {/* 縦に長いスマホ (カメラロール画面) */}
        <Phone x={750} y={190} w={420} h={620} />
        <g clipPath="url(#floodClip)">
          {kinds.map((k, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const x = 782 + col * (cw + 16);
            // 下から次々わいてくる (正のループ: 負の剰余にならないよう2回足す)
            const y = 244 - step + ((((row * step - frame * 3.0) % band) + band) % band);
            return (
              <g key={i}>
                <rect x={x} y={y} width={cw} height={ch} rx={10} fill={SP.panel} stroke={SP.dim} strokeWidth={3} />
                {k === "blur" && (
                  <g stroke={SP.faint} strokeWidth={5} fill="none" strokeLinecap="round">
                    <path d={`M ${x + 24} ${y + 50} q 30 -18 60 0 q 30 18 60 0`} />
                    <path d={`M ${x + 24} ${y + 84} q 30 -18 60 0 q 30 18 60 0`} />
                  </g>
                )}
                {k === "finger" && (
                  <g>
                    <circle cx={x + cw / 2 - 20} cy={y + ch / 2} r={20} fill="none" stroke={SP.faint} strokeWidth={4} />
                    <ellipse cx={x + cw - 26} cy={y + ch - 20} rx={52} ry={38} fill={SP.dim} />
                  </g>
                )}
                {k === "face" && (
                  <g stroke={SP.faint} strokeWidth={4} fill="none">
                    <circle cx={x + cw / 2} cy={y + ch / 2 - 4} r={28} />
                    <line x1={x + cw / 2 - 12} y1={y + ch / 2 - 12} x2={x + cw / 2 - 4} y2={y + ch / 2 - 7} />
                    <line x1={x + cw / 2 + 12} y1={y + ch / 2 - 12} x2={x + cw / 2 + 4} y2={y + ch / 2 - 7} />
                    <path d={`M ${x + cw / 2 - 12} ${y + ch / 2 + 12} q 6 -8 12 0 q 6 8 12 0`} />
                  </g>
                )}
              </g>
            );
          })}
        </g>
        {/* 画面の外の流れ線 (上へ) */}
        <g stroke={SP.dim} strokeWidth={4} strokeLinecap="round">
          {[690, 714, 1206, 1230].map((x, i) => {
            const t = ((frame * 5 + i * 60) % 240) / 240;
            const y = 760 - t * 520;
            return <line key={x} x1={x} y1={y} x2={x} y2={y + 54} opacity={(1 - t) * 0.8} />;
          })}
        </g>
        {/* 指のスワイプ軌跡 */}
        <g stroke={SP.faint} strokeWidth={5} strokeLinecap="round" fill="none">
          <path d="M 1310 640 Q 1350 500 1310 360" strokeDasharray="2 16" />
          <path d="M 1296 390 L 1310 352 L 1326 390" />
        </g>
        <SmallLabel x={520} y={480} text="ブレ・ゆび・変な顔が" color={SP.faint} size={30} />
        <SmallLabel x={520} y={522} text="延々と出てくる" color={SP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// ===== troubles_rain: 道に迷った1時間も、無言の電車も (困りごとが降る) =====
// 中央の人のまわりに、傾いた困りごとアイコンがゆっくりランダムに降りつもる
export const TroublesRainScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  // 降りもの: [x, 開始オフセット, 傾き, 種類, 大きさ]
  const drops: [number, number, number, "maze" | "train" | "clock" | "photo", number][] = [
    [430, 0, -14, "maze", 1.0],
    [700, 260, 10, "train", 0.9],
    [1240, 120, -8, "clock", 1.0],
    [1520, 330, 14, "photo", 0.9],
    [560, 480, 8, "clock", 0.8],
    [1390, 560, -12, "train", 0.8],
    [820, 640, 12, "photo", 0.75],
    [1100, 420, -10, "maze", 0.8],
  ];
  const fallSpan = 1050;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "道に迷った1時間も、ぜんぶ"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={420} y1={820} x2={1500} y2={820} stroke={SP.dim} strokeWidth={4} />
        {/* 降る困りごと (ゆっくり・ループ) */}
        {drops.map(([dx, d0, rot, kind, s], i) => {
          const y = ((frame * 2.1 + d0) % fallSpan) - 120;
          const fadeIn = Math.min(Math.max((y + 80) / 120, 0), 1);
          const fadeOut = Math.min(Math.max((860 - y) / 120, 0), 1);
          return (
            <g
              key={i}
              transform={`translate(${dx} ${y}) rotate(${rot}) scale(${s})`}
              opacity={0.85 * fadeIn * fadeOut}
            >
              {kind === "maze" && (
                <g stroke={SP.faint} strokeWidth={4} fill="none">
                  {/* 迷い道 (ぐるぐるの矢印) */}
                  <path d="M -34 10 Q -34 -34 0 -34 Q 34 -34 34 0 Q 34 24 6 24" />
                  <path d="M 14 14 L 4 26 L 18 32" />
                </g>
              )}
              {kind === "train" && (
                <g stroke={SP.faint} strokeWidth={4} fill="none">
                  <rect x={-46} y={-28} width={92} height={56} rx={10} />
                  <line x1={-14} y1={-28} x2={-14} y2={28} />
                  <line x1={16} y1={-28} x2={16} y2={28} />
                  <circle cx={-30} cy={-8} r={7} />
                </g>
              )}
              {kind === "clock" && (
                <g stroke={SP.faint} strokeWidth={4} fill="none">
                  <circle r={30} />
                  <line x1={0} y1={0} x2={0} y2={-18} />
                  <line x1={0} y1={0} x2={13} y2={7} />
                </g>
              )}
              {kind === "photo" && (
                <g stroke={SP.faint} strokeWidth={4} fill="none" strokeLinecap="round">
                  <rect x={-36} y={-28} width={72} height={56} rx={6} />
                  <path d="M -22 4 q 11 -9 22 0 q 11 9 22 0" />
                </g>
              )}
            </g>
          );
        })}
        {/* 中央の人 (ぜんぶ知っている本人) */}
        <Person x={960} y={600} scale={2.2} />
        <SmallLabel x={960} y={790} text="ぜんぶ、あなたは知っている" color={SP.ink} size={30} weight={700} />
      </svg>
    </Frame>
  );
};

// ===== vanish_posts: 投稿されないものは、存在しないように見える =====
// カラーの投稿はそのまま、投稿されなかった2枚がすーっと消えて点線だけ残る
export const VanishPostsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 1秒後からゆっくり消えていく
  const vanish = Math.min(Math.max((frame - 1.0 * fps) / (2.2 * fps), 0), 1);
  const ghosts = [
    { x: 820, y: 430, kind: "plain" as const },
    { x: 1190, y: 530, kind: "plain" as const },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "存在しないように、見えてしまう"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 残る1枚: 投稿されたキラキラ (カラー) */}
        <g opacity={appearAt(frame, fps, 6)}>
          <FeedCard x={430} y={300} w={330} h={170} kind="travel" colored />
          <Sparkle x={790} y={310} s={14} phase={1} color={KC.yellow} />
          <SmallLabel x={595} y={540} text="投稿された1枚" color={SP.ink} size={28} weight={700} />
        </g>
        {/* 消えていく2枚: 投稿されなかった日々 */}
        {ghosts.map((gc, i) => (
          <g key={i}>
            <FeedCard x={gc.x} y={gc.y} w={330} h={170} kind={gc.kind} opacity={(1 - vanish) * 0.9} />
            {/* 消えたあとに残る点線の輪郭と ? */}
            <g opacity={vanish}>
              <rect
                x={gc.x}
                y={gc.y}
                width={330}
                height={170}
                rx={12}
                fill="none"
                stroke={SP.dim}
                strokeWidth={4}
                strokeDasharray="12 10"
              />
              <text
                x={gc.x + 165}
                y={gc.y + 102}
                textAnchor="middle"
                fontSize={54}
                fontWeight={800}
                fill={SP.faint}
                fontFamily={SUURI_FONT}
              >
                ?
              </text>
            </g>
          </g>
        ))}
        <SmallLabel x={960} y={790} text="投稿されない日々は、ないことになってしまう" color={SP.ink} size={30} weight={700} />
      </svg>
    </Frame>
  );
};

// ===== pitfall_people: 落とし穴に、人が次々落ちていく (和紙) =====
export const PitfallPeopleScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const groundY = 560;
  const pitL = 880;
  const pitR = 1100;
  const pitDepth = 380; // 深い穴
  // 5人が0.75秒間隔でテンポよく歩いてきて、次々落ちる
  const walkers = [0, 0.75, 1.5, 2.25, 3.0].map((delay) => {
    const t = Math.max(0, (frame - delay * fps) / fps); // 経過秒
    const walkDur = 0.85;
    const fallDur = 0.6;
    const walkT = Math.min(t / walkDur, 1);
    const fallT = Math.min(Math.max((t - walkDur) / fallDur, 0), 1);
    return { walkT, fallT, started: t > 0 };
  });
  const someoneFalling = walkers.some((w) => w.fallT > 0.05 && w.fallT < 0.95);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "落とし穴に、名前をつけるなら"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 地面 (穴の左右) */}
        <line x1={320} y1={groundY} x2={pitL} y2={groundY} stroke={SP.line} strokeWidth={6} />
        <line x1={pitR} y1={groundY} x2={1620} y2={groundY} stroke={SP.line} strokeWidth={6} />
        {/* 深い落とし穴 (縦の壁と底) */}
        <line x1={pitL} y1={groundY} x2={pitL} y2={groundY + pitDepth} stroke={SP.line} strokeWidth={6} />
        <line x1={pitR} y1={groundY} x2={pitR} y2={groundY + pitDepth} stroke={SP.line} strokeWidth={6} />
        <line x1={pitL} y1={groundY + pitDepth} x2={pitR} y2={groundY + pitDepth} stroke={SP.line} strokeWidth={6} />
        {/* 穴の中の暗がり (深いほど濃い) */}
        <rect x={pitL + 4} y={groundY + 6} width={pitR - pitL - 8} height={pitDepth * 0.45} fill={SP.ink} opacity={0.1} />
        <rect x={pitL + 4} y={groundY + pitDepth * 0.45} width={pitR - pitL - 8} height={pitDepth * 0.55 - 6} fill={SP.ink} opacity={0.22} />
        {/* 歩いてきて、次々落ちる人たち */}
        {walkers.map(({ walkT, fallT, started }, i) => {
          if (!started) return null;
          const x = 430 + walkT * (980 - 430) + (i % 3) * 14;
          const y = groundY - 78 + fallT * fallT * (pitDepth + 40);
          const rot = fallT * 150;
          const bob = fallT === 0 ? Math.abs(Math.sin((frame + i * 20) / 4)) * 8 : 0;
          return (
            <g key={i} opacity={1 - fallT * 0.55}>
              <g transform={`translate(${x} ${y - bob}) rotate(${rot})`}>
                <Person x={0} y={0} scale={1.35} />
              </g>
            </g>
          );
        })}
        {/* 「!」(落ちる瞬間の声) */}
        <text
          x={990}
          y={470}
          textAnchor="middle"
          fontSize={52}
          fontWeight={800}
          fill={SP.accent}
          fontFamily={SUURI_FONT}
          opacity={someoneFalling ? 0.9 : 0}
        >
          !
        </text>
        <SmallLabel x={1370} y={660} text="人類みんなが落ちる、考え方の穴" color={SP.ink} size={30} weight={700} />
      </svg>
    </Frame>
  );
};

// ===== count_only_hand: 手元に残ったものだけ数えて、沈んだぶんを忘れる (和紙) =====
export const CountOnlyHandScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "人類共通のクセ"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 数える人と、手元に残ったもの (カラー) */}
        <Person x={430} y={370} scale={1.7} />
        <g opacity={appearAt(frame, fps, 8)}>
          {/* 机 */}
          <line x1={280} y1={610} x2={760} y2={610} stroke={SP.line} strokeWidth={5} />
          {/* 手元に残ったもの: 色つきの3つ */}
          <circle cx={380} cy={578} r={26} fill={KC.yellow} stroke={SP.line} strokeWidth={4} />
          <rect x={460} y={552} width={56} height={52} rx={8} fill={KC.skyBlue} stroke={SP.line} strokeWidth={4} />
          <circle cx={600} cy={578} r={26} fill={KC.orange} stroke={SP.line} strokeWidth={4} />
          <text x={430} y={700} textAnchor="middle" fontSize={40} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={6}>
            正 一
          </text>
          <SmallLabel x={430} y={756} text="手元に残ったものだけ、数える" color={SP.faint} size={27} />
        </g>
        {/* 右: 海面と、沈んで忘れられるもの */}
        <path
          d="M 880 480 Q 940 466 1000 480 T 1120 480 T 1240 480 T 1360 480 T 1480 480 T 1600 480 T 1700 480"
          fill="none"
          stroke={KC.sea}
          strokeWidth={5}
        />
        <g opacity={appearAt(frame, fps, 20)}>
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={0.7}>
              <rect
                x={960 + i * 210}
                y={570 + (i % 2) * 70}
                width={120}
                height={90}
                rx={10}
                fill="none"
                stroke={SP.faint}
                strokeWidth={4}
                strokeDasharray="10 8"
                transform={`rotate(${-8 + i * 7} ${1020 + i * 210} ${615 + (i % 2) * 70})`}
              />
            </g>
          ))}
          <SmallLabel x={1280} y={790} text="沈んだぶんは、忘れてしまう" color={SP.ink} size={30} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// =====================================================================
// 2026-10 最終調整: thinking (棒人間+?吹き出し) の使い回し13シーンを
// それぞれ専用のイラスト+演出に差し替える。
// モチーフ名はすべて kira_ 接頭辞 (resolveSuuriMotif が名前そのまま通す)。
// 背景分類はどれにも登録しない = thinking と同じく前のシーンを引き継ぐ。
// =====================================================================

// 0〜1 に収める進み (線形)。spring を使わないゆっくりした動き用
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ===== kira_math_rescue: ため息の雲を、数学のレスキュー隊が吸い取る =====
// 「今日は、その夜のため息──SNS時代の生きづらさから、数学があなたを救います。」
export const KiraMathRescueScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(4);
  const ladder = appearAt(frame, fps, 16);
  const walk = clamp01((frame - 34) / 40); // 隊員がはしごを降りる
  const suck = clamp01((frame - 86) / 34); // 雲が吸われて小さくなる
  const star = appearAt(frame, fps, 126);
  const bob = Math.sin(frame / 16) * 6;
  // はしご (右上から雲のそばへ)
  const lx1 = 1560, ly1 = 210, lx2 = 1030, ly2 = 560;
  const rx = lx1 + (lx2 - lx1) * walk;
  const ry = ly1 + (ly2 - ly1) * walk;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "夜のため息"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 月 (futon_phone と同じ三日月。夜のしるし) */}
        <path d="M 290 250 a 56 56 0 1 0 50 82 a 44 44 0 0 1 -50 -82 Z" fill={KC.yellow} opacity={0.92} />
        {/* 床とふとんの人 (左下) */}
        <line x1={260} y1={820} x2={900} y2={820} stroke={SP.dim} strokeWidth={4} />
        <g opacity={a}>
          <rect x={330} y={726} width={150} height={50} rx={16} fill="none" stroke={SP.line} strokeWidth={5} />
          <circle cx={405} cy={692} r={30} fill="none" stroke={SP.line} strokeWidth={5} />
          <path d="M 450 820 L 450 752 Q 458 690 540 684 L 790 684 Q 854 690 858 752 L 858 820 Z" fill={SP.panel} stroke={SP.line} strokeWidth={5} />
        </g>
        {/* ため息の雲 (吸われて縮む) */}
        <g transform={`translate(560 ${440 + bob}) scale(${(1 - suck * 0.82) * a})`} opacity={1 - suck * 0.75}>
          <ellipse rx={150} ry={86} fill={SP.panel} stroke={SP.faint} strokeWidth={5} />
          <text y={16} textAnchor="middle" fontSize={52} fill={SP.faint} fontFamily={SUURI_FONT}>はぁ…</text>
        </g>
        {/* 雲が消えた場所に小さな星 */}
        <g opacity={star} transform={`translate(560 430) scale(${star})`}>
          <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" fill={KC.yellow} />
        </g>
        {/* √ のはしご (右上から降りてくる) */}
        <g opacity={ladder}>
          <line x1={lx1 - 18} y1={ly1} x2={lx2 - 18} y2={ly2} stroke={SP.line} strokeWidth={5} />
          <line x1={lx1 + 18} y1={ly1} x2={lx2 + 18} y2={ly2} stroke={SP.line} strokeWidth={5} />
          {[0.12, 0.3, 0.48, 0.66, 0.84].map((t) => (
            <line
              key={t}
              x1={lx1 - 18 + (lx2 - lx1) * t}
              y1={ly1 + (ly2 - ly1) * t}
              x2={lx1 + 18 + (lx2 - lx1) * t}
              y2={ly1 + (ly2 - ly1) * t}
              stroke={SP.line}
              strokeWidth={4}
            />
          ))}
          <SmallLabel x={lx1 + 60} y={ly1 - 10} text="√" color={SP.ink} size={64} weight={700} />
        </g>
        {/* レスキュー隊員 Σ (はしごを降りて、雲にホースを向ける)。隊員バッジは金色 */}
        <g opacity={ladder} transform={`translate(${rx} ${ry})`}>
          <circle r={44} fill={KC.yellow} stroke={SP.line} strokeWidth={5} />
          <text y={18} textAnchor="middle" fontSize={52} fontWeight={700} fill={SP.background} fontFamily={SUURI_FONT}>Σ</text>
          <line x1={-14} y1={44} x2={-22} y2={78} stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
          <line x1={14} y1={44} x2={22} y2={78} stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* 2人目 π (少し遅れて降りる) */}
        <g
          opacity={ladder}
          transform={`translate(${lx1 + (lx2 - lx1) * clamp01(walk - 0.28)} ${ly1 + (ly2 - ly1) * clamp01(walk - 0.28)}) scale(0.82) translate(60 -40)`}
        >
          <circle r={44} fill={KC.pink} stroke={SP.line} strokeWidth={5} />
          <text y={16} textAnchor="middle" fontSize={48} fontWeight={700} fill={SP.background} fontFamily={SUURI_FONT}>π</text>
        </g>
        {/* 吸い取りホース (Σ から雲へ)。吸引中は点線が流れる */}
        {walk >= 1 && (
          <g>
            <path
              d={`M ${lx2 - 40} ${ly2 + 10} Q 820 600 ${660 + suck * 40} ${470}`}
              fill="none"
              stroke={SP.line}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray="18 14"
              strokeDashoffset={-frame * 3}
            />
            <SmallLabel x={1200} y={700} text="数学レスキュー隊、到着" color={SP.ink} size={30} weight={700} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// ===== kira_imagine_tv: 想像の雲の中にテレビが点灯する (次のシーンへのつなぎ) =====
// 「想像してください。」(1.5秒しかないので全部すぐ出す)
export const KiraImagineTvScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(2);
  const cloud = appearAt(frame, fps, 6);
  const tvOn = appearAt(frame, fps, 14);
  const flash = Math.max(0, 1 - Math.abs(frame - 18) / 6); // 点灯の一瞬のまぶしさ
  const ballT = clamp01((frame - 20) / 22); // 画面の中をボールが飛ぶ
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "想像の中へ"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左下: 考える人の横顔シルエット */}
        <g opacity={a}>
          <circle cx={470} cy={640} r={120} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <path d="M 350 840 q 10 -120 120 -124 q 110 4 120 124" fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          {/* 閉じた目 (想像に集中) */}
          <path d="M 430 630 q 14 10 28 0" fill="none" stroke={SP.line} strokeWidth={4} strokeLinecap="round" />
          <path d="M 500 630 q 14 10 28 0" fill="none" stroke={SP.line} strokeWidth={4} strokeLinecap="round" />
        </g>
        {/* 考えの泡 → 大きな想像の雲 */}
        <circle cx={620} cy={520} r={12} fill="none" stroke={SP.line} strokeWidth={4} opacity={cloud} />
        <circle cx={690} cy={450} r={18} fill="none" stroke={SP.line} strokeWidth={4} opacity={cloud} />
        <g opacity={cloud} transform={`translate(1160 430) scale(${0.7 + cloud * 0.3})`}>
          <path
            d="M -380 60 q -60 -10 -56 -70 q 4 -78 90 -74 q 20 -84 116 -80 q 76 2 104 54 q 40 -40 110 -30 q 86 12 88 86 q 70 10 64 76 q -6 64 -84 64 L -330 86 q -44 -2 -50 -26 Z"
            fill={SP.panel}
            stroke={SP.line}
            strokeWidth={6}
          />
          {/* 雲の中のテレビ */}
          <g opacity={tvOn}>
            <line x1={-60} y1={-120} x2={-20} y2={-72} stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
            <line x1={40} y1={-124} x2={10} y2={-72} stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
            <rect x={-150} y={-72} width={300} height={176} rx={18} fill={SP.background} stroke={SP.line} strokeWidth={6} />
            {/* 画面: 点灯の光 (暖色でパッと点く) */}
            <rect x={-132} y={-54} width={264} height={140} rx={10} fill={KC.yellow} opacity={0.42 + flash * 0.35} />
            {/* 画面の中: 小さなボールが飛ぶ */}
            <circle
              cx={-100 + ballT * 190}
              cy={60 - Math.sin(ballT * Math.PI) * 86}
              r={9}
              fill={SP.ink}
              opacity={tvOn}
            />
            <line x1={-100} y1={66} x2={-66} y2={46} stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
          </g>
        </g>
        {/* 想像の雲のまわりのきらきら (homerun_tv と同じ色使い) */}
        <g opacity={tvOn}>
          <Sparkle x={1560} y={290} s={12} phase={1} color={KC.yellow} />
          <Sparkle x={800} y={330} s={10} phase={4} color={KC.pink} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_best_count: ベスト盤のパッケージを「正」の字で数え始める =====
// 「では、どれくらい『ベスト』なのか、数えてみましょう。」
export const KiraBestCountScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(4);
  const shineT = clamp01((frame - 12) / 26); // パッケージを光が走る
  // 「正」の5画を順に書く
  const strokes = [0, 1, 2, 3, 4].map((i) => appearAt(frame, fps, 40 + i * 12));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ベスト盤を、数えてみる"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: ベスト盤のパッケージ */}
        <g opacity={a}>
          <rect x={330} y={300} width={400} height={470} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <rect x={366} y={344} width={328} height={230} rx={10} fill="none" stroke={SP.faint} strokeWidth={4} />
          {/* ジャケット: 打球の軌道 */}
          <path d="M 400 540 Q 520 360 668 400" fill="none" stroke={SP.line} strokeWidth={5} />
          <circle cx={668} cy={400} r={10} fill={SP.ink} />
          <text x={530} y={650} textAnchor="middle" fontSize={44} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT}>ホームラン集</text>
          <text x={530} y={710} textAnchor="middle" fontSize={30} fill={SP.faint} fontFamily={SUURI_FONT} letterSpacing={4}>永久保存版</text>
          {/* きらーんと走る金の光の帯 (ベスト盤の豪華さ) */}
          <g clipPath="url(#bestcase)">
            <rect
              x={160 + shineT * 700}
              y={240}
              width={70}
              height={600}
              fill={KC.yellow}
              opacity={0.3}
              transform={`rotate(18 ${195 + shineT * 700} 540)`}
            />
          </g>
          <clipPath id="bestcase">
            <rect x={330} y={300} width={400} height={470} rx={16} />
          </clipPath>
          <Sparkle x={330} y={300} s={13} phase={1} color={KC.yellow} />
          <Sparkle x={736} y={360} s={10} phase={4} color={KC.pink} />
        </g>
        {/* 右: 「正」の字を1画ずつ書いて数える */}
        <g strokeLinecap="round">
          {/* 1画目: 上の横棒 */}
          <line x1={1060} y1={380} x2={1060 + 320 * Math.min(strokes[0], 1)} y2={380} stroke={SP.ink} strokeWidth={16} opacity={strokes[0] > 0.02 ? 1 : 0} />
          {/* 2画目: 中央のたて棒 */}
          <line x1={1220} y1={380} x2={1220} y2={380 + 300 * Math.min(strokes[1], 1)} stroke={SP.ink} strokeWidth={16} opacity={strokes[1] > 0.02 ? 1 : 0} />
          {/* 3画目: 中段の横棒 (右半分) */}
          <line x1={1220} y1={530} x2={1220 + 160 * Math.min(strokes[2], 1)} y2={530} stroke={SP.ink} strokeWidth={16} opacity={strokes[2] > 0.02 ? 1 : 0} />
          {/* 4画目: 左のたて棒 */}
          <line x1={1110} y1={470} x2={1110} y2={470 + 210 * Math.min(strokes[3], 1)} stroke={SP.ink} strokeWidth={16} opacity={strokes[3] > 0.02 ? 1 : 0} />
          {/* 5画目: 下の横棒 */}
          <line x1={1060} y1={680} x2={1060 + 320 * Math.min(strokes[4], 1)} y2={680} stroke={SP.ink} strokeWidth={16} opacity={strokes[4] > 0.02 ? 1 : 0} />
        </g>
        {/* 数え上げのラベル */}
        <g opacity={strokes[0]}>
          <SmallLabel x={1220} y={780} text="1本、2本…と数えてみる" color={SP.faint} size={30} />
        </g>
        {/* 鉛筆 (最後の画の先で止まる) */}
        <g opacity={strokes[0]} transform={`translate(${1395 + 20}, ${strokes[4] > 0 ? 680 : strokes[3] > 0 ? 600 : strokes[2] > 0 ? 530 : strokes[1] > 0 ? 500 : 380}) rotate(40)`}>
          <rect x={-8} y={-110} width={16} height={92} rx={4} fill={KC.yellow} stroke={SP.line} strokeWidth={3} />
          <path d="M -8 -18 L 0 6 L 8 -18 Z" fill={SP.ink} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_bats600: 600打席のドットの海に、40本だけ金色が灯る =====
// 「1年に600回打席に立って、ホームランが40本」
export const KiraBats600Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const COLS = 30;
  const ROWS = 20;
  const x0 = 390, y0 = 260, dx = 39, dy = 27;
  // 40本のホームラン: 600 を 40 で割って均等+少し散らす (毎回同じ並び)
  const golds = new Set<number>();
  for (let k = 0; k < 40; k++) golds.add((k * 15 + (k * 7) % 11) % 600);
  const goldPop = appearAt(frame, fps, 58);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "一流バッターの1年"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <SmallLabel x={620} y={224} text="打席 600回" color={SP.faint} size={29} />
        <g opacity={goldPop}>
          <SmallLabel x={1300} y={224} text="ホームラン 40本" color={KC.yellow} size={29} weight={700} />
        </g>
        {Array.from({ length: 600 }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const show = appearAt(frame, fps, 6 + r * 1.6);
          const isGold = golds.has(i);
          return (
            <g key={i}>
              <circle cx={x0 + c * dx} cy={y0 + r * dy} r={6.5} fill={SP.dim} opacity={show} />
              {isGold && (
                <circle
                  cx={x0 + c * dx}
                  cy={y0 + r * dy}
                  r={6.5 + goldPop * 3.5}
                  fill={KC.yellow}
                  opacity={goldPop}
                />
              )}
            </g>
          );
        })}
        {/* 下の注釈 */}
        <g opacity={goldPop}>
          <SmallLabel x={960} y={836} text="600個のうち、光るのは40個だけ" color={SP.ink} size={31} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_gacha_juicer: ジューサーにガチャカプセルが投入されて、しぼられる =====
// 「ちなみにこの濃縮ジュース、ゲームの世界でも毎日しぼられています。」
export const KiraGachaJuicerScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(4);
  // カプセル3個が順に落ちる
  const drops = [0, 1, 2].map((i) => clamp01((frame - 14 - i * 22) / 20));
  const juice = clamp01((frame - 50) / 60); // ジュースがたまる
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ゲームの世界でも、濃縮"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          {/* じょうご (投入口) */}
          <path d="M 760 330 L 1160 330 L 1030 470 L 890 470 Z" fill="none" stroke={SP.line} strokeWidth={6} strokeLinejoin="round" />
          {/* 本体 (プレス機) */}
          <rect x={850} y={470} width={220} height={150} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <circle cx={884} cy={590} r={9} fill="none" stroke={SP.faint} strokeWidth={4} />
          <circle cx={1036} cy={590} r={9} fill="none" stroke={SP.faint} strokeWidth={4} />
          <SmallLabel x={960} y={540} text="濃縮" color={SP.ink} size={34} weight={700} />
          {/* 注ぎ口 */}
          <path d="M 940 620 L 940 650 L 980 650 L 980 620" fill="none" stroke={SP.line} strokeWidth={5} />
          {/* コップ */}
          <path d="M 880 700 L 902 830 L 1018 830 L 1040 700" fill="none" stroke={SP.line} strokeWidth={6} strokeLinejoin="round" />
          {/* たまっていくジュース (虹色っぽく3層) */}
          <g clipPath="url(#gjglass)">
            <rect x={880} y={830 - juice * 110} width={160} height={juice * 110} fill={KC.orange} opacity={0.85} />
            <rect x={880} y={830 - juice * 110} width={160} height={juice * 34} fill={KC.pink} opacity={0.8} />
          </g>
          <clipPath id="gjglass">
            <path d="M 880 700 L 902 830 L 1018 830 L 1040 700 Z" />
          </clipPath>
          {/* しずく */}
          {juice > 0.04 && (
            <circle cx={960} cy={660 + ((frame * 7) % 60)} r={7} fill={KC.orange} opacity={0.9} />
          )}
        </g>
        {/* 落ちてくるガチャカプセル (2色) */}
        {drops.map((t, i) => {
          const cx = 900 + i * 60;
          const cy = 140 + t * 230; // じょうごの口まで落ちる
          const fade = t >= 1 ? 0 : 1;
          return (
            <g key={i} opacity={a * fade} transform={`translate(${cx} ${cy}) rotate(${t * 70 * (i % 2 === 0 ? 1 : -1)})`}>
              <path d="M -30 0 A 30 30 0 0 1 30 0 Z" fill={i === 1 ? KC.pink : KC.yellow} stroke={SP.line} strokeWidth={4} />
              <path d="M -30 0 A 30 30 0 0 0 30 0 Z" fill={SP.ink} opacity={0.9} stroke={SP.line} strokeWidth={4} />
              {/* 2個目のカプセルはびっくり顔 */}
              {i === 1 && (
                <g>
                  <circle cx={-9} cy={-10} r={3.5} fill={SP.background} />
                  <circle cx={9} cy={-10} r={3.5} fill={SP.background} />
                  <circle cx={0} cy={9} r={5} fill="none" stroke={SP.background} strokeWidth={3} />
                </g>
              )}
            </g>
          );
        })}
        {/* 「えっ」の吹き出し (2個目が落ちる瞬間) */}
        <g opacity={drops[1] > 0.05 && drops[1] < 0.9 ? 1 : 0}>
          <SmallLabel x={1120} y={210} text="えっ!?" color={SP.ink} size={36} weight={700} />
        </g>
        <g opacity={juice}>
          <SmallLabel x={1320} y={780} text="当たりだけが、しぼり出される" color={SP.ink} size={30} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_prob_meter: 確率メーターの針が振り切れて壊れる =====
// 「ベスト盤だけを見せられると、確率の感覚まで狂ってしまうのです。」
export const KiraProbMeterScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(4);
  const cx = 960, cy = 660, R = 320;
  // 針: 1% の位置から始まり、キラキラ投稿が流れるたびに跳ね上がり、最後は振り切れて壊れる
  const bump1 = appearAt(frame, fps, 24);
  const bump2 = appearAt(frame, fps, 48);
  const bump3 = appearAt(frame, fps, 72);
  const broken = frame > 100;
  const wobble = broken ? Math.sin(frame / 2.2) * 5 * Math.exp(-(frame - 100) / 50) : 0;
  // 角度: -176° (左端=0%) → -4° (右端=100%)
  const deg = -176 + bump1 * 50 + bump2 * 60 + bump3 * 62 + wobble;
  const rad = (deg * Math.PI) / 180;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "確率の感覚が、狂う"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a}>
          {/* メーターの弧と目盛り */}
          <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke={SP.line} strokeWidth={7} />
          {[0, 25, 50, 75, 100].map((p) => {
            const d2 = (-180 + (p / 100) * 180) * (Math.PI / 180);
            return (
              <g key={p}>
                <line
                  x1={cx + Math.cos(d2) * (R - 24)}
                  y1={cy + Math.sin(d2) * (R - 24)}
                  x2={cx + Math.cos(d2) * (R + 2)}
                  y2={cy + Math.sin(d2) * (R + 2)}
                  stroke={SP.faint}
                  strokeWidth={4}
                />
                <SmallLabel
                  x={cx + Math.cos(d2) * (R + 52)}
                  y={cy + Math.sin(d2) * (R + 52) + 10}
                  text={`${p}`}
                  color={SP.faint}
                  size={26}
                />
              </g>
            );
          })}
          {/* ほんとうの値: 1% の赤い目盛り */}
          {(() => {
            const d1 = (-180 + 1.8) * (Math.PI / 180);
            return (
              <g>
                <line
                  x1={cx + Math.cos(d1) * (R - 30)}
                  y1={cy + Math.sin(d1) * (R - 30)}
                  x2={cx + Math.cos(d1) * (R + 6)}
                  y2={cy + Math.sin(d1) * (R + 6)}
                  stroke={SP.accent}
                  strokeWidth={6}
                />
                <SmallLabel x={cx - R + 10} y={cy - 70} text="ほんとは 1%" color={SP.accent} size={28} weight={700} anchor="start" />
              </g>
            );
          })()}
          {/* 流れてくるキラキラ投稿 (針を押し上げる犯人) */}
          {[bump1, bump2, bump3].map((b, i) => {
            const t = clamp01(b);
            const px = 1700 - t * (520 + i * 120);
            const py = 280 + i * 10;
            return (
              <g key={i} opacity={t > 0.02 && t < 0.98 ? 0.9 : 0} transform={`translate(${px} ${py})`}>
                <rect x={-52} y={-38} width={104} height={76} rx={10} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
                <Sparkle x={0} y={-6} s={10} phase={i * 2} />
              </g>
            );
          })}
          {/* 針 */}
          <line
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(rad) * (R - 60)}
            y2={cy + Math.sin(rad) * (R - 60)}
            stroke={SP.ink}
            strokeWidth={10}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={22} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          {/* 壊れた演出: 軸から飛び出たバネと、ひび */}
          {broken && (
            <g>
              <path
                d="M 985 640 q 18 -12 8 -26 q -16 -10 -6 -26 q 14 -10 6 -26 q -12 -12 2 -24"
                fill="none"
                stroke={SP.faint}
                strokeWidth={5}
                strokeLinecap="round"
              />
              <g stroke={SP.line} strokeWidth={4} strokeLinecap="round">
                <line x1={930} y1={636} x2={906} y2={616} />
                <line x1={936} y1={648} x2={908} y2={646} />
              </g>
            </g>
          )}
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_cal_vanish: 365マスのうち10マスだけ残り、355マスが消えていく =====
// 「投稿したくなる日が10日だとすると、何もない355日は最初から画面に存在しません。」
export const KiraCalVanishScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const COLS = 27;
  const ROWS = 14;
  const x0 = 430, y0 = 250, step = 40, size = 30;
  // 投稿される10日 (毎回同じ並びになるよう固定)
  const posts = [23, 61, 97, 133, 170, 204, 241, 277, 314, 350];
  const postColor = [KC.skyBlue, KC.orange, KC.yellow, KC.pink, KC.green, KC.skyBlue, KC.orange, KC.yellow, KC.pink, KC.green];
  const fadeT = clamp01((frame - 64) / 90); // 左から波のように消えていく
  const labels = appearAt(frame, fps, 130);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "投稿したくなる日は、1年に10日"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <SmallLabel x={620} y={224} text="1年 365日" color={SP.faint} size={28} />
        {Array.from({ length: 365 }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const show = appearAt(frame, fps, 4 + r * 1.8);
          const pi = posts.indexOf(i);
          if (pi >= 0) {
            return (
              <g key={i} opacity={show}>
                <rect x={x0 + c * step} y={y0 + r * step} width={size} height={size} rx={6} fill={postColor[pi]} opacity={0.92} />
                <circle cx={x0 + c * step + 8} cy={y0 + r * step + 8} r={3} fill={SP.ink} opacity={0.9} />
              </g>
            );
          }
          // 消える355マス: 列ごとに時間差で薄くなっていく
          const localFade = clamp01(fadeT * 1.6 - c / COLS / 1.4);
          return (
            <rect
              key={i}
              x={x0 + c * step}
              y={y0 + r * step}
              width={size}
              height={size}
              rx={6}
              fill="none"
              stroke={SP.faint}
              strokeWidth={2.5}
              opacity={show * (0.75 - localFade * 0.68)}
            />
          );
        })}
        <g opacity={labels}>
          <SmallLabel x={660} y={850} text="355日は、画面に存在しない" color={SP.ink} size={31} weight={700} />
          <SmallLabel x={1330} y={850} text="残るのは、この10日だけ" color={SP.faint} size={29} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_stamp_x2: ダイヤルを2に合わせて「×2」のハンコを押す =====
// 「これを、ひかえめに2倍としましょう。」(2.6秒なので全部すぐ出す)
export const KiraStampX2Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(2);
  const turn = appearAt(frame, fps, 6); // ダイヤルが2へ回る
  const slam = appearAt(frame, fps, 24); // ハンコがドン
  const lines = appearAt(frame, fps, 34);
  // ダイヤル: 10 (上) から 2 の位置へ。目盛り1〜10 を円周に
  const dialDeg = -90 + 36 * 10 - turn * 36 * 8; // 10の位置から2の位置へ回転
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ひかえめに、2倍"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: ダイヤル */}
        <g opacity={a}>
          <circle cx={600} cy={560} r={170} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          {Array.from({ length: 10 }, (_, i) => {
            const d2 = ((-90 + (i + 1) * 36) * Math.PI) / 180;
            return (
              <SmallLabel
                key={i}
                x={600 + Math.cos(d2) * 212}
                y={560 + Math.sin(d2) * 212 + 10}
                text={`${i + 1}`}
                color={i + 1 === 2 ? SP.ink : SP.faint}
                size={i + 1 === 2 ? 34 : 26}
                weight={i + 1 === 2 ? 700 : 400}
              />
            );
          })}
          {/* つまみ */}
          <g transform={`rotate(${dialDeg} 600 560)`}>
            <line x1={600} y1={560} x2={600 + 128} y2={560} stroke={SP.ink} strokeWidth={12} strokeLinecap="round" />
          </g>
          <circle cx={600} cy={560} r={26} fill={SP.background} stroke={SP.line} strokeWidth={6} />
          <SmallLabel x={600} y={810} text="ひかえめ設定" color={SP.faint} size={30} />
        </g>
        {/* 右: 紙に「×2」のハンコがドン */}
        <g opacity={a}>
          <rect x={1080} y={360} width={440} height={400} rx={14} fill={SP.panel} stroke={SP.faint} strokeWidth={4} />
          <line x1={1130} y1={460} x2={1470} y2={460} stroke={SP.dim} strokeWidth={4} />
          <line x1={1130} y1={530} x2={1470} y2={530} stroke={SP.dim} strokeWidth={4} />
        </g>
        <g transform={`translate(1300 600) scale(${slam > 0 ? 2.4 - 1.4 * Math.min(slam, 1) : 0}) rotate(-8)`} opacity={slam}>
          <circle r={110} fill="none" stroke={SP.accent} strokeWidth={10} />
          <text y={34} textAnchor="middle" fontSize={100} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT}>×2</text>
        </g>
        {/* 着地の衝撃線 */}
        <g opacity={lines} stroke={SP.line} strokeWidth={5} strokeLinecap="round">
          {[-35, -75, -115, 215, 255].map((deg) => {
            const rd = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={1300 + Math.cos(rd) * 140}
                y1={600 + Math.sin(rd) * 140}
                x2={1300 + Math.cos(rd) * 180}
                y2={600 + Math.sin(rd) * 180}
              />
            );
          })}
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_vs_match: 格闘ゲーム風の対戦画面。等倍の自分 vs 巨大な7200倍パック =====
// 「自分の『NG集こみの等倍の毎日』と、他人の『7200倍濃縮』をくらべる勝負。」
export const KiraVsMatchScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(4);
  const packIn = appearAt(frame, fps, 18); // 巨大パックが右からスライドイン
  const vsPop = appearAt(frame, fps, 40);
  const shake = frame > 34 && frame < 52 ? Math.sin(frame * 2.4) * 7 * ((52 - frame) / 18) : 0;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "これは、勝てない勝負"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(0 ${shake})`}>
          {/* 床 */}
          <line x1={240} y1={830} x2={1680} y2={830} stroke={SP.dim} strokeWidth={4} />
          {/* 左: 等倍の自分 (小さい) + NGフィルムが巻きつく */}
          <g opacity={a}>
            <Person x={480} y={600} scale={2.1} />
            {/* 巻きつくフィルム帯 */}
            <g transform="rotate(-14 480 700)">
              <rect x={330} y={678} width={300} height={56} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <rect key={i} x={344 + i * 40} y={690} width={22} height={32} rx={4} fill="none" stroke={SP.faint} strokeWidth={3} />
              ))}
              <SmallLabel x={480} y={760} text="" />
            </g>
            <SmallLabel x={480} y={800} text="等倍の毎日 (NG集こみ)" color={SP.ink} size={29} />
          </g>
          {/* 右: 7200倍濃縮の巨大ジュースパック (画面からはみ出す) */}
          <g transform={`translate(${(1 - packIn) * 560} 0)`} opacity={packIn}>
            <path d="M 1190 300 L 1270 190 L 1610 190 L 1680 300 Z" fill={SP.panel} stroke={SP.line} strokeWidth={6} />
            <rect x={1190} y={300} width={490} height={530} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
            {/* ストロー */}
            <line x1={1600} y1={200} x2={1660} y2={120} stroke={SP.line} strokeWidth={10} strokeLinecap="round" />
            {/* パッケージのしずくマークと表記 */}
            <path d="M 1340 420 q 30 -52 60 0 a 30 30 0 1 1 -60 0 Z" fill={KC.orange} opacity={0.9} />
            <text x={1435} y={560} textAnchor="middle" fontSize={64} fontWeight={800} fill={SP.ink} fontFamily={SUURI_FONT}>7200倍</text>
            <text x={1435} y={630} textAnchor="middle" fontSize={38} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT}>濃縮</text>
            <SmallLabel x={1435} y={800} text="他人のハイライト" color={SP.ink} size={29} />
          </g>
          {/* 中央: VS の稲妻 */}
          <g opacity={vsPop} transform={`translate(880 480) scale(${0.6 + vsPop * 0.4})`}>
            <path d="M 18 -170 L -34 -20 L 6 -20 L -22 130 L 52 -46 L 10 -46 Z" fill={KC.yellow} stroke={SP.line} strokeWidth={4} strokeLinejoin="round" />
            <text x={10} y={230} textAnchor="middle" fontSize={94} fontWeight={800} fill={SP.accent} fontFamily={SUURI_FONT} letterSpacing={6}>VS</text>
          </g>
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_curtain: スポットライトと垂れ幕。「今日一番大事な言葉」の前フリ =====
// 「ここで、今日一番大事な言葉が出てきます。」(中身は次のシーンまで見せない)
export const KiraCurtainScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const light = appearAt(frame, fps, 6);
  const drop = appearAt(frame, fps, 22); // 垂れ幕が降りてくる
  const seal = appearAt(frame, fps, 54);
  const bannerH = 420 * Math.min(drop, 1);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日、一番大事な言葉"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* スポットライトの光条 */}
        <g opacity={light}>
          <polygon points="960,170 640,830 1280,830" fill={SP.ink} opacity={0.08} />
          <ellipse cx={960} cy={830} rx={330} ry={26} fill={SP.ink} opacity={0.1} />
        </g>
        {/* 吊り棒 */}
        <line x1={700} y1={230} x2={1220} y2={230} stroke={SP.line} strokeWidth={7} strokeLinecap="round" opacity={drop} />
        <circle cx={700} cy={230} r={10} fill={SP.ink} opacity={drop} />
        <circle cx={1220} cy={230} r={10} fill={SP.ink} opacity={drop} />
        {/* 垂れ幕 (降りてくる)。中身はまだ伏せる */}
        <g opacity={drop}>
          <rect x={790} y={236} width={340} height={bannerH} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          {/* 伏せ字 (文字はまだ見えない) */}
          {bannerH > 300 && (
            <g opacity={clamp01((bannerH - 300) / 120)}>
              <rect x={850} y={320} width={220} height={40} rx={8} fill={SP.dim} />
              <rect x={850} y={400} width={220} height={40} rx={8} fill={SP.dim} />
              <rect x={850} y={480} width={150} height={40} rx={8} fill={SP.dim} />
            </g>
          )}
          {/* 下端のふさ */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={820 + i * 94}
              y1={236 + bannerH}
              x2={820 + i * 94 + (i % 2 === 0 ? -6 : 6)}
              y2={236 + bannerH + 34}
              stroke={SP.faint}
              strokeWidth={5}
              strokeLinecap="round"
            />
          ))}
        </g>
        {/* 赤い封印 (大事な言葉のしるし) */}
        <g opacity={seal} transform={`translate(1100 610) scale(${seal})`}>
          <circle r={38} fill="none" stroke={SP.accent} strokeWidth={6} />
          <text y={14} textAnchor="middle" fontSize={36} fontWeight={700} fill={SP.accent} fontFamily={SUURI_FONT}>要</text>
        </g>
        <Sparkle x={640} y={330} s={11} phase={1} />
        <Sparkle x={1300} y={420} s={9} phase={3} />
        <g opacity={seal}>
          <SmallLabel x={960} y={780} text="この後すぐ" color={SP.faint} size={30} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_magnify_holes: 虫眼鏡が飛行機の上を進み、通った所に弾痕が見つかる =====
// 「すると、翼やしっぽに、穴がたくさん見つかりました。」(和紙の章)
export const KiraMagnifyHolesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(4);
  // 虫眼鏡の旅: 左翼 → 右翼 → しっぽ (座標は bullet_map と同じ機体のもの)
  const t = clamp01((frame - 16) / 86);
  const path = [
    { x: 560, y: 596 },
    { x: 1340, y: 596 },
    { x: 960, y: 750 },
  ];
  const seg = t < 0.62 ? 0 : 1;
  const lt = seg === 0 ? t / 0.62 : (t - 0.62) / 0.38;
  const gx = path[seg].x + (path[seg + 1].x - path[seg].x) * lt;
  const gy = path[seg].y + (path[seg + 1].y - path[seg].y) * lt;
  // 弾痕: bullet_map と同じ位置 (直後に出る弾痕の図とつながるように)。
  // d は出現の遅れ (虫眼鏡の通過に同期)
  const holes: [number, number, number][] = [
    // 左翼
    [490, 586, 4], [545, 564, 6], [600, 556, 9], [650, 575, 12], [848, 516, 24], [884, 540, 27],
    // 右翼
    [1036, 540, 34], [1072, 516, 36], [1270, 580, 48], [1320, 556, 51], [1375, 590, 54], [1430, 586, 57],
    // 後部胴体 → 水平尾翼
    [942, 660, 64], [978, 700, 67], [952, 730, 70], [860, 744, 73], [790, 762, 76], [1060, 744, 79], [1130, 762, 82],
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "穴は、どこに?"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* bullet_map と同じ配置 (同じ機体・同じ弾痕位置で、次の弾痕の図へ自然につなぐ) */}
        <g transform="translate(960 524) scale(0.9) translate(-960 -506)">
          <PlaneTopView opacity={a} />
          {/* 見つかった弾痕 (bullet_map と同じ見た目) */}
          {holes.map(([hx, hy, d], i) => (
            <BulletHole key={i} x={hx} y={hy} appear={appearAt(frame, fps, 16 + d)} />
          ))}
          {/* 虫眼鏡 */}
          <g opacity={a} transform={`translate(${gx} ${gy})`}>
            <circle r={105} fill={SP.background} opacity={0.35} />
            <circle r={105} fill="none" stroke={SP.ink} strokeWidth={11} />
            <line x1={75} y1={75} x2={162} y2={162} stroke={SP.ink} strokeWidth={18} strokeLinecap="round" />
            {/* レンズの中: 拡大された穴 */}
            <circle cx={-22} cy={-9} r={19} fill={SP.accent} opacity={0.95} />
            <circle cx={33} cy={20} r={14} fill={SP.accent} opacity={0.8} />
          </g>
        </g>
        <g opacity={appearAt(frame, fps, 104)}>
          <SmallLabel x={1500} y={820} text="翼としっぽに、たくさん" color={SP.ink} size={30} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_flip_q: 大きな「?」が裏返りかけて「!」が見えかける =====
// 「よく考えてみてください。」(1.8秒。逆転の発想の予告)
export const KiraFlipQScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(2);
  // 裏返り: 0° → 148° まで回って止まる (裏の「!」がちらりと見える)
  const flip = appearAt(frame, fps, 10);
  const deg = flip * 148;
  const rad = (deg * Math.PI) / 180;
  const sx = Math.cos(rad); // 横方向のつぶれ = 回転して見える仕掛け
  const showBack = sx < 0;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "逆から、考える"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={620} y1={820} x2={1300} y2={820} stroke={SP.dim} strokeWidth={4} opacity={a} />
        {/* 回転を示す矢印 */}
        <g opacity={a * 0.9} stroke={SP.faint} strokeWidth={5} fill="none">
          <path d="M 640 540 A 330 330 0 0 1 960 240" />
          <path d="M 940 252 L 964 236 L 948 214" strokeLinejoin="round" />
          <path d="M 1280 540 A 330 330 0 0 1 960 840" opacity={0.5} />
        </g>
        {/* 裏返るカード */}
        <g transform={`translate(960 540) scale(${sx} 1)`} opacity={a}>
          <circle r={210} fill={SP.panel} stroke={SP.line} strokeWidth={7} />
          {!showBack ? (
            <text y={76} textAnchor="middle" fontSize={230} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT}>?</text>
          ) : (
            // 裏面: まだ答えじゃない。薄い「!」だけちらりと (scale(-1,1) で鏡写しを戻す)
            <g transform="scale(-1 1)">
              <text y={76} textAnchor="middle" fontSize={230} fontWeight={700} fill={SP.faint} fontFamily={SUURI_FONT}>!</text>
            </g>
          )}
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_plane_unrecorded: 帳簿に載らない1機が、海へ沈んでいく =====
// 「エンジンを撃たれた飛行機は帰ってこられないから、記録のどこにも残らなかったのです。」(和紙の章)
export const KiraPlaneUnrecordedScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(4);
  const sink = clamp01((frame - 60) / 70); // 幽霊機が沈んでいく
  const label = appearAt(frame, fps, 96);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "帰ってこなかった飛行機のゆくえ"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 帳簿 */}
        <g opacity={a}>
          <rect x={430} y={250} width={880} height={430} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <line x1={470} y1={330} x2={1270} y2={330} stroke={SP.faint} strokeWidth={4} />
          <SmallLabel x={560} y={308} text="帰還機 記録簿" color={SP.ink} size={32} weight={700} />
        </g>
        {/* 記録された8機 + チェック */}
        {Array.from({ length: 8 }, (_, i) => {
          const r = Math.floor(i / 3);
          const c = i % 3;
          const pop = appearAt(frame, fps, 10 + i * 7);
          return (
            <g key={i} opacity={pop} transform={`translate(${560 + c * 270} ${410 + r * 110}) scale(${0.7 + pop * 0.3})`}>
              {/* 他シーンと同じ横向きシルエット (絵のブレ防止で部品を流用) */}
              <PlaneSilhouette x={-10} y={0} scale={0.3} />
              <path d="M 62 -6 L 74 8 L 98 -22" fill="none" stroke={SP.line} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
        {/* 9機目の欄: 空白 (赤い点線 = 記録されなかった場所) */}
        <g opacity={appearAt(frame, fps, 70)}>
          <rect x={1095} y={585} width={170} height={70} rx={10} fill="none" stroke={SP.accent} strokeWidth={4} strokeDasharray="12 10" />
        </g>
        {/* 海 (右下) */}
        <g opacity={a}>
          <path
            d="M 1180 800 Q 1240 786 1300 800 T 1420 800 T 1540 800 T 1660 800"
            fill="none"
            stroke={KC.sea}
            strokeWidth={5}
          />
        </g>
        {/* 帳簿に載らない1機: 空欄から海へ沈んでいく (点線の幽霊機 = 記録に残らない機の共通部品)。
            scale(-1 1) で右向きにし、機首を下げながら海へ */}
        <g
          opacity={a * (1 - sink * 0.5)}
          transform={`translate(${1180 + sink * 250} ${615 + sink * 175}) scale(-1 1)`}
        >
          <GhostPlane x={0} y={0} scale={0.5} rotate={-(16 + sink * 26)} />
        </g>
        {/* 沈んだ跡の泡 */}
        {sink > 0.8 && (
          <g opacity={(sink - 0.8) * 5}>
            <circle cx={1452} cy={792} r={6} fill="none" stroke={SP.faint} strokeWidth={3} />
            <circle cx={1478} cy={780} r={4} fill="none" stroke={SP.faint} strokeWidth={3} />
          </g>
        )}
        <g opacity={label}>
          <SmallLabel x={780} y={790} text="撃たれた機は、ここに戻れない = 記録に残らない" color={SP.ink} size={30} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_same_q: 投稿とホームラン集のあいだで「？」が揺れる =====
// 「何かちがいが、あるでしょうか。」(直前の life_homerun と同じ絵で、= が ? に変わる)
export const KiraSameQScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(2);
  const qIn = appearAt(frame, fps, 12);
  // ？が首をかしげるようにゆらゆら
  const tilt = Math.sin(frame / 11) * 9 * qIn;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ちがいは、ある？"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* 左: 友達の投稿 (life_homerun と同じ絵。ブレ防止で同じ部品・同じ座標) */}
        <g opacity={a}>
          <Phone x={430} y={210} w={340} h={580}>
            <FeedCard x={466} y={266} w={268} h={150} kind="travel" colored />
            <FeedCard x={466} y={436} w={268} h={150} kind="food" colored />
            <FeedCard x={466} y={606} w={268} h={150} kind="pass" colored />
          </Phone>
          <Sparkle x={400} y={260} s={13} phase={0} />
          <Sparkle x={820} y={320} s={15} phase={2} />
        </g>
        {/* 右: ホームラン集のジャケット (これも life_homerun と同じ絵) */}
        <g opacity={a}>
          <rect x={1130} y={300} width={400} height={400} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <ColorBatter x={1270} y={500} scale={1.3} bat={[1288, 518, 1350, 448]} />
          <path d="M 1350 455 Q 1420 390 1480 380" fill="none" stroke={SP.faint} strokeWidth={4} strokeDasharray="4 12" />
          <circle cx={1472} cy={382} r={9} fill={SP.ink} />
          <text x={1330} y={660} textAnchor="middle" fontSize={34} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT} letterSpacing={2}>
            人生の<tspan fill={SP.accent}>ホームラン集</tspan>
          </text>
        </g>
        {/* まんなか: 「=」が点線になり、上で「？」が首をかしげる */}
        <g stroke={SP.line} strokeWidth={10} strokeLinecap="round" strokeDasharray="20 18" opacity={a}>
          <line x1={930} y1={530} x2={1030} y2={530} />
          <line x1={930} y1={580} x2={1030} y2={580} />
        </g>
        <g opacity={qIn} transform={`translate(980 420) rotate(${tilt})`}>
          <text y={0} textAnchor="middle" fontSize={150} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT}>?</text>
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_engine_q: 穴ゼロのエンジンの上で「？」がはてなと浮かぶ =====
// 「どういうことでしょうか。」(直前の bullet_map mode2 と同じ機体・同じ赤丸)
export const KiraEngineQScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(2);
  // bullet_map と同じ弾痕位置 (薄く残す = 前のシーンの続きだと分かる)
  const holes: [number, number][] = [
    [490, 586], [545, 564], [600, 556], [650, 575], [848, 516], [884, 540],
    [1036, 540], [1072, 516], [1270, 580], [1320, 556], [1375, 590], [1430, 586],
    [790, 762], [860, 744], [1060, 744], [1130, 762],
    [942, 660], [978, 700], [952, 730],
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "どういうこと？"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* bullet_map と同じラッパー (同じ絵の続きに見せる) */}
        <g transform="translate(960 524) scale(0.9) translate(-960 -506)">
          <PlaneTopView opacity={a * 0.45} />
          {holes.map(([hx, hy], i) => (
            <BulletHole key={i} x={hx} y={hy} appear={a * 0.3} />
          ))}
          {/* エンジンを守る赤丸 (bullet_map mode2 と同じ位置・同じ太さ) */}
          {[742, 1178].map((ex, i) => {
            const bob = Math.sin(frame / 9 + i * 2) * 10;
            const q = appearAt(frame, fps, 10 + i * 8);
            return (
              <g key={ex}>
                <circle cx={ex} cy={514} r={86} fill="none" stroke={SP.accent} strokeWidth={9} opacity={a} />
                {/* 穴ゼロの場所の上に「？」がぽかんと浮かぶ */}
                <g opacity={q} transform={`translate(${ex} ${360 + bob})`}>
                  <text textAnchor="middle" fontSize={130} fontWeight={700} fill={SP.ink} fontFamily={SUURI_FONT}>?</text>
                </g>
              </g>
            );
          })}
        </g>
        <g opacity={appearAt(frame, fps, 30)}>
          <SmallLabel x={960} y={880} text="穴が ひとつもない 場所を、守る…？" color={SP.ink} size={34} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// ===== kira_notice_eye: ハッと見開く目。ひとみに小さなきらきらが映っている =====
// 「そして、お気づきでしょうか。」(答えの滑走路はまだ見せない。ひとみの反射だけで匂わせる)
export const KiraNoticeEyeScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = useAppear(2);
  const open = appearAt(frame, fps, 14); // 半目 → ぱちっと見開く
  const spark = appearAt(frame, fps, 42); // ひとみに映るきらきら
  const topY = 520 - (90 + open * 120);
  const botY = 520 + (70 + open * 90);
  const eyePath = `M 640 520 Q 960 ${topY} 1280 520 Q 960 ${botY} 640 520 Z`;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ふと、気がつく"} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="kiraNoticeEye">
            <path d={eyePath} />
          </clipPath>
        </defs>
        {/* ハッと気づいた放射線 (見開いた瞬間に出る) */}
        <g stroke={SP.line} strokeWidth={5} strokeLinecap="round" opacity={Math.max(0, open - 0.6) * 2.2}>
          {[-150, -115, -65, -30, 30, 65, 115, 150].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={960 + Math.cos(rad) * 390}
                y1={520 + Math.sin(rad) * 290}
                x2={960 + Math.cos(rad) * 450}
                y2={520 + Math.sin(rad) * 340}
              />
            );
          })}
        </g>
        {/* 目 (まぶたが開く) */}
        <g opacity={a}>
          <path d={eyePath} fill={SP.background} stroke={SP.line} strokeWidth={7} />
          <g clipPath="url(#kiraNoticeEye)">
            {/* 虹彩とひとみ */}
            <circle cx={960} cy={520} r={118} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
            <circle cx={960} cy={520} r={58} fill={SP.ink} />
            {/* ひとみに映る、小さなキラキラ画面の反射 */}
            <g opacity={spark}>
              <Sparkle x={944} y={506} s={13} phase={0} color={KC.yellow} />
              <Sparkle x={982} y={534} s={9} phase={3} color={KC.pink} />
            </g>
            <circle cx={922} cy={488} r={12} fill={SP.background} opacity={0.9} />
          </g>
        </g>
      </svg>
    </Frame>
  );
};
