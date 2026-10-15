// 恋愛版ドレイク回 (「運命の人は、東京に40人しかいない」) の専用シーン集。
// 設計表: docs/renai-drake-motifs.md (1文=1絵=1色)
//
// 背景は2モード:
// - 恋愛モード (love_*): つかみ (行1〜19)。白地 #FDF9FA に RNP 配色で「直接」描く (反転しない)
// - 黒モード (それ以外): いつもの黒地に白線+赤。差し色は KC + ピンク (恋愛要素)
//
// 色の約束ごと (§9-4 原則11):
// - 恋愛モードの最強調 = 濃ピンク RNP.pinkDeep (1画面1要素)
// - 黒モードの最強調 = 赤 SP.accent (1画面1要素)。ピンクは「恋愛の差し色」で強調とは役割分担
// - 消える人・点は グレーで退場 / 残る人・点は 中ピンク

import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill, Easing } from "remotion";
import type { Scene } from "../../types";
import {
  SP,
  RNP,
  SUURI_FONT,
  SUURI_SERIF,
  W,
  H,
  Frame,
  DiagramTitle,
  SmallLabel,
  Person,
  appearAt,
  useAppear,
  splitPunchline,
} from "./parts";
import { KC } from "./KirakiraScenes";
import { wrapJa } from "../wrapJa";

type SceneProps = { scene?: Scene; variant?: number };

// ===== 背景モードの場面分類 (computeSuuriRenai が参照する) =====
// つかみ (白地+ピンクの恋愛モード)。love_to_black は「白から黒への暗転」を自前で描くので恋愛側
export const RENAI_PINK_MOTIFS = [
  "love_stat_7wari",
  "love_no_date",
  "love_minority",
  "love_app_couple",
  "love_like_rain",
  "love_iihito",
  "love_twist",
  "love_act_only",
  "love_math",
  "love_alien_hint",
  "love_tokyo",
  "love_count_serious",
  "love_roadmap",
  "love_preview_ch12",
  "love_preview_ch34",
  "love_to_black",
] as const;
// 黒モード (第1章〜結論)
export const RENAI_DARK_MOTIFS = [
  "drake_blackboard",
  "drake_galaxy",
  "drake_meeting",
  "drake_decompose",
  "drake_terms",
  "drake_donburi",
  "drake_order",
  "fermi_name",
  "fermi_question",
  "fermi_piano",
  "fermi_four",
  "fermi_phonebook",
  "drake_legacy",
  "drake_to_love",
  "backus_writing",
  "backus_paper",
  "backus_swap",
  "tokyo_dots_start",
  "countdown_gender",
  "countdown_yoyu",
  "countdown_age",
  "countdown_single",
  "countdown_tottori",
  "countdown_daijobu",
  "countdown_honban",
  "countdown_values",
  "countdown_looks",
  "countdown_mutual",
  "countdown_rhythm",
  "answer_40",
  "street_chance",
  "tokyo_dome",
  "no_deai_proof",
  "hope_slit",
  "formula_seven",
  "slider_up",
  "jouken_vanish",
  "gyakumodori",
  "hensu_card",
  "backus_26",
  "backus_proud",
  "alien_scale",
  "tsuzuku",
  "zero_prob",
  "pitfall",
  "fade_words",
  "takarakuji",
  "sofa_family",
  "bunbo_grow",
  "commute_10",
  "work_talk_half",
  "fraction_stuck",
  "deai_x10",
  "fraction_x10",
  "dice_many",
  "backus_wedding",
  "renai_matome",
  "final_tool",
  "yurumeru",
] as const;

// 黒地用のピンク (濃ピンクは黒地では少し沈むので、特大表示には glow を添える)
const PINK = RNP.pink; // 中ピンク (差し色)
const PINK_DEEP = "#D6487A"; // 濃ピンク (恋愛の強調)

// ===== 小さな共通部品 =====

// ハート。(x, y) はハートの中心あたり。幅 ≈ 72 * scale
export const Heart: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  fill?: boolean;
  opacity?: number;
  strokeWidth?: number;
}> = ({ x, y, scale = 1, color = PINK, fill = true, opacity = 1, strokeWidth = 5 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    <path
      d="M 0 -8 C -12 -26 -36 -22 -36 -2 C -36 14 -16 28 0 42 C 16 28 36 14 36 -2 C 36 -22 12 -26 0 -8 Z"
      fill={fill ? color : "none"}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </g>
);

// かわいい宇宙人 (丸頭+触角2本)。全編のマスコット。(x, y) は頭の中心
// face: smile=にっこり / eh=「え、俺?」/ sorry=すまなそう / clap=拍手で祝福 / peek=ひょっこり(頭だけ)
export const Alien: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  face?: "smile" | "eh" | "sorry" | "clap" | "peek";
  opacity?: number;
}> = ({ x, y, scale = 1, color = SP.line, face = "smile", opacity = 1 }) => {
  const frame = useCurrentFrame();
  const clapT = Math.sin(frame / 4) * 14; // 拍手の揺れ
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity} stroke={color} fill="none" strokeWidth={5} strokeLinecap="round">
      {/* 触角 2本 (先に小さな丸) */}
      <path d="M -22 -40 Q -30 -62 -40 -70" />
      <circle cx={-42} cy={-74} r={7} />
      <path d="M 22 -40 Q 30 -62 40 -70" />
      <circle cx={42} cy={-74} r={7} />
      {/* 丸頭 */}
      <ellipse cx={0} cy={0} rx={52} ry={46} />
      {/* 目 (大きなたて長の目) */}
      {face === "sorry" ? (
        <>
          {/* すまなそう: 下がり眉 + とじ目 */}
          <path d="M -32 -18 L -14 -10" />
          <path d="M 32 -18 L 14 -10" />
          <path d="M -28 6 Q -21 12 -14 6" />
          <path d="M 14 6 Q 21 12 28 6" />
        </>
      ) : (
        <>
          <ellipse cx={-20} cy={-2} rx={9} ry={14} fill={color} stroke="none" />
          <ellipse cx={20} cy={-2} rx={9} ry={14} fill={color} stroke="none" />
        </>
      )}
      {/* 口 */}
      {face === "eh" ? (
        <ellipse cx={0} cy={22} rx={9} ry={11} /> // ぽかん
      ) : face === "sorry" ? (
        <path d="M -10 26 Q 0 20 10 26" /> // への字
      ) : (
        <path d="M -12 20 Q 0 30 12 20" /> // にっこり
      )}
      {/* 体 (peek のときは頭だけ) */}
      {face !== "peek" && (
        <>
          <path d="M -26 42 Q -30 86 -16 92 L 16 92 Q 30 86 26 42" />
          {face === "clap" ? (
            <>
              {/* 拍手: 両手を上げてパチパチ */}
              <path d={`M -26 54 Q -56 ${34 + clapT} -66 ${20 + clapT}`} />
              <path d={`M 26 54 Q 56 ${34 - clapT} 66 ${20 - clapT}`} />
              <path d="M -4 -96 l 6 -12 M 10 -92 l 10 -8 M -16 -94 l -8 -10" opacity={0.0} />
            </>
          ) : (
            <>
              <path d="M -26 56 Q -48 66 -54 80" />
              <path d="M 26 56 Q 48 66 54 80" />
            </>
          )}
          {/* 足 */}
          <path d="M -10 92 L -12 104 M 10 92 L 12 104" />
        </>
      )}
    </g>
  );
};

// 傍観者の棒人間 (第2章カウントダウンの進行役)。mood で表情が育つ:
// easy=余裕の笑顔 / sweat=汗 / shock=目が点 / white=真っ白 (燃え尽き)
export const Watcher: React.FC<{
  x: number;
  y: number; // 頭の中心
  scale?: number;
  mood?: "easy" | "sweat" | "shock" | "white";
  opacity?: number;
}> = ({ x, y, scale = 1, mood = "easy", opacity = 1 }) => {
  const c = mood === "white" ? SP.faint : SP.line;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity} stroke={c} fill="none" strokeWidth={5} strokeLinecap="round">
      {/* 頭 */}
      <circle r={26} />
      {/* 表情 */}
      {mood === "easy" && (
        <>
          <path d="M -12 -4 Q -8 -8 -4 -4 M 4 -4 Q 8 -8 12 -4" />
          <path d="M -9 8 Q 0 15 9 8" />
        </>
      )}
      {mood === "sweat" && (
        <>
          <circle cx={-8} cy={-3} r={2.5} fill={c} stroke="none" />
          <circle cx={8} cy={-3} r={2.5} fill={c} stroke="none" />
          <path d="M -7 10 L 7 10" />
          <path d="M 30 -16 Q 36 -6 30 0 Q 24 -6 30 -16" strokeWidth={4} />
        </>
      )}
      {mood === "shock" && (
        <>
          <circle cx={-9} cy={-3} r={5} />
          <circle cx={9} cy={-3} r={5} />
          <ellipse cx={0} cy={11} rx={5} ry={7} />
        </>
      )}
      {mood === "white" && (
        <>
          <circle cx={-9} cy={-3} r={4} opacity={0.6} />
          <circle cx={9} cy={-3} r={4} opacity={0.6} />
          <path d="M -8 11 Q -4 8 0 11 Q 4 14 8 11" opacity={0.7} />
        </>
      )}
      {/* 体・手足 (棒人間) */}
      <path d="M 0 26 L 0 78" />
      {mood === "white" ? (
        // 真っ白: 両腕だらん
        <path d="M 0 40 L -20 70 M 0 40 L 20 70" />
      ) : mood === "shock" ? (
        // 目が点: 両手を頬へ
        <path d="M 0 44 Q -18 36 -22 16 M 0 44 Q 18 36 22 16" />
      ) : (
        <path d="M 0 42 L -26 56 M 0 42 L 26 56" />
      )}
      <path d="M 0 78 L -18 108 M 0 78 L 18 108" />
    </g>
  );
};

// 乱数っぽい散らばり (インデックスから決める。レンダリングごとに揺れない)
const jitter = (i: number, salt: number) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v); // 0..1
};

// ===== つかみ (恋愛モード・白地) =====
// 白地なので RNP の色で直接描く。人の線 = チャコール、装飾 = ピンク3段階

// 恋愛モードの人 (チャコール線)
const RPerson: React.FC<{ x: number; y: number; scale?: number; color?: string; fill?: boolean; opacity?: number }> = ({
  x,
  y,
  scale = 1,
  color = RNP.ink,
  fill = false,
  opacity = 1,
}) => (
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

// love_stat_7wari (行1-2):
// variant0 = 調査資料の絵 (書類の束+虫めがね+グラフ) / variant1 = 「7割」の特大強調+10人アイコン
export const LoveStatScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = appearAt(frame, fps, 8);
  const colored = variant >= 1; // 行2 (7割に恋人がいません)
  if (!colored) {
    // 行1: 調査・研究を表すイラスト
    const glass = appearAt(frame, fps, 30);
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "最近の調査に、こんな数字が"} />
        <svg width={W} height={H}>
          {/* うしろに重なった書類の束 */}
          <g opacity={card * 0.8}>
            <rect x={590} y={300} width={560} height={420} rx={14} fill="#FFFFFF" stroke={RNP.dim} strokeWidth={4} transform="rotate(-5 870 510)" />
            <rect x={640} y={290} width={560} height={420} rx={14} fill="#FFFFFF" stroke={RNP.dim} strokeWidth={4} transform="rotate(3 920 500)" />
          </g>
          {/* いちばん上の調査資料 */}
          <g opacity={card}>
            <rect x={620} y={270} width={580} height={450} rx={14} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={5} />
            <text x={910} y={340} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={36} fontWeight={800} fill={RNP.ink}>
              恋愛・結婚に関する調査
            </text>
            <line x1={670} y1={368} x2={1150} y2={368} stroke={RNP.pinkSoft} strokeWidth={4} />
            {/* 棒グラフ */}
            {[150, 100, 190, 70].map((h, i) => (
              <rect key={i} x={700 + i * 110} y={620 - h * appearAt(frame, fps, 20 + i * 5)} width={64} height={h * appearAt(frame, fps, 20 + i * 5)} rx={6} fill={i === 2 ? RNP.pink : RNP.dim} opacity={0.9} />
            ))}
            <line x1={680} y1={622} x2={1140} y2={622} stroke={RNP.ink} strokeWidth={4} />
            <text x={910} y={688} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={26} fill={RNP.faint}>
              こんな数字があります
            </text>
          </g>
          {/* 虫めがね */}
          <g opacity={glass} stroke={RNP.ink} strokeWidth={8} fill="none" strokeLinecap="round">
            <circle cx={1210} cy={590} r={90} fill="rgba(242, 196, 208, 0.18)" />
            <path d="M 1276 652 L 1370 746" strokeWidth={14} />
          </g>
        </svg>
      </Frame>
    );
  }
  // 行2: 「7割」を特大で強調
  const don = appearAt(frame, fps, 14);
  const ray = appearAt(frame, fps, 26);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "20代男性の7割に、恋人がいない"} />
      <svg width={W} height={H}>
        {/* 特大の7割 (集中線つき) */}
        <g opacity={don} transform={`translate(960, 400) scale(${0.8 + don * 0.2})`}>
          <text x={0} y={60} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={190} fontWeight={800} fill={RNP.pinkDeep}>
            約7割
          </text>
          <text x={0} y={140} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={44} fontWeight={700} fill={RNP.ink}>
            恋人が、いない
          </text>
        </g>
        <g opacity={ray} stroke={RNP.pinkSoft} strokeWidth={6} strokeLinecap="round">
          {[-160, -140, -120, -60, -40, -20].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line key={i} x1={960 + Math.cos(rad) * 330} y1={400 + Math.sin(rad) * 230} x2={960 + Math.cos(rad) * 400} y2={400 + Math.sin(rad) * 290} />
            );
          })}
        </g>
        {/* 10人のアイコン (7グレー・3ピンク) */}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = 420 + i * 120;
          const pop = appearAt(frame, fps, 26 + i * 3);
          const isPink = i >= 7;
          const c = isPink ? RNP.pink : RNP.dim;
          return (
            <g key={i} opacity={pop} transform={`translate(0, ${(1 - pop) * 24})`}>
              <RPerson x={x} y={640} scale={1.05} color={c} fill={isPink} />
              {isPink && <Heart x={x + 32} y={584} scale={0.38} color={RNP.pink} />}
            </g>
          );
        })}
        <g opacity={appearAt(frame, fps, 56)}>
          <path d="M 400 756 L 400 776 L 1220 776 L 1220 756" fill="none" stroke={RNP.pinkDeep} strokeWidth={5} />
          <SmallLabel x={810} y={830} text="恋人なし 7人" color={RNP.pinkDeep} size={34} weight={800} />
          <SmallLabel x={1560} y={830} text="恋人あり 3人" color={RNP.faint} size={30} />
        </g>
      </svg>
    </Frame>
  );
};

// love_no_date (行3): 人混みをラブラブで歩くカップル (男=青・女=ピンク)
// → 片方がふっと消滅 → 残った方がびっくり
export const LoveNoDateScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const BLUE = "#5B8DD9";
  const walk = Math.sin(frame / 5) * 5; // 歩きの上下ゆれ
  // 女性はゆっくり薄くなって消えていく (スローフェード・跡は残さない)
  const fadeT = interpolate(frame, [fps * 1.6, fps * 3.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shock = appearAt(frame, fps, Math.round(fps * 2.8));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "デート経験なし、約4割"} />
      <svg width={W} height={H}>
        {/* 人混み (グレーの通行人) */}
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 240 + i * 190 + (jitter(i, 41) - 0.5) * 70;
          const y = 430 + jitter(i, 42) * 220;
          if (Math.abs(x - 960) < 265) return null; // 主役の場所は空ける
          return <RPerson key={i} x={x} y={y} scale={1.0 + jitter(i, 43) * 0.3} color={RNP.dim} opacity={a * 0.75} />;
        })}
        {/* 主役カップル (中央・ふたりとも大きく) */}
        <g opacity={a}>
          {/* 男 (青) */}
          <g transform={`translate(0, ${walk})`}>
            <RPerson x={865} y={500} scale={2.1} color={BLUE} />
          </g>
          {/* 女 (ピンク) → ゆっくり薄くなって消える (跡は残さない) */}
          {fadeT < 1 && (
            <g transform={`translate(0, ${-walk})`} opacity={1 - fadeT}>
              <RPerson x={1065} y={500} scale={2.1} color={RNP.pink} />
            </g>
          )}
          {/* ラブラブのハート (消えるのに合わせて落ちながら薄れる) */}
          <Heart x={965} y={385 + fadeT * 180} scale={0.6} color={RNP.pink} opacity={1 - fadeT} />
          {/* つないだ手 (消えかけたらほどける) */}
          {fadeT < 0.5 && (
            <path d="M 910 600 Q 965 626 1020 600" stroke={RNP.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={1 - fadeT * 2} />
          )}
          {/* 残った方のびっくり */}
          {fadeT > 0.6 && (
            <g opacity={shock}>
              <text x={865} y={400} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={64} fontWeight={800} fill={RNP.pinkDeep}>
                !?
              </text>
            </g>
          )}
        </g>
        <SmallLabel x={960} y={800} text="デートをしたことが一度もない人も、約4割" color={RNP.faint} size={34} />
      </svg>
    </Frame>
  );
};

// love_minority (行4): 円グラフ「しない派」が多数
export const LoveMinorityScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = appearAt(frame, fps, 10);
  const label = appearAt(frame, fps, 40);
  // しない派 72% の扇形 (上から時計回り)
  const cx = 960;
  const cy = 540;
  const r = 250;
  const frac = 0.72 * grow;
  const ang = frac * Math.PI * 2 - Math.PI / 2;
  const large = frac > 0.5 ? 1 : 0;
  const ex = cx + Math.cos(ang) * r;
  const ey = cy + Math.sin(ang) * r;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "恋愛は「しない人が多数派」に"} />
      <svg width={W} height={H}>
        <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={RNP.pinkSoft} strokeWidth={5} />
        {/* しない派 (グレー・多数)。少し外へ飛び出して強調 */}
        <g transform={`translate(${-14 * label}, ${6 * label})`}>
          <path d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`} fill={RNP.dim} opacity={0.9} />
          <path
            d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`}
            fill="none"
            stroke={RNP.ink}
            strokeWidth={6 + Math.sin(frame / 6) * 1.5}
          />
        </g>
        <g opacity={label}>
          {/* しない派 (グレーの扇のまんなかに収める) */}
          <text x={cx + 85} y={cy + 36} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={52} fontWeight={800} fill={RNP.ink}>
            しない派
          </text>
          <text x={cx + 85} y={cy + 102} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={46} fontWeight={800} fill={RNP.pinkDeep}>
            約7割
          </text>
          {/* する派 (白い扇のまんなかに収める) */}
          <text x={cx - 105} y={cy - 92} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={700} fill={RNP.faint}>
            する派
          </text>
          <Heart x={cx - 105} y={cy - 66} scale={0.28} color={RNP.pinkSoft} />
          {/* 「多数派」スタンプ (右上からグレーの扇を指す) */}
          <g transform={`rotate(8 ${cx + 385} 300)`}>
            <rect x={cx + 255} y={254} width={260} height={92} rx={14} fill="none" stroke={RNP.pinkDeep} strokeWidth={6} />
            <text x={cx + 385} y={318} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={48} fontWeight={800} fill={RNP.pinkDeep}>
              多数派
            </text>
          </g>
          <path d={`M ${cx + 290} 362 Q ${cx + 230} 400 ${cx + 180} 436`} fill="none" stroke={RNP.pinkDeep} strokeWidth={5} strokeLinecap="round" />
        </g>
      </svg>
    </Frame>
  );
};

// love_app_couple (行5): スマホの中から手をつなぐカップル、4組に1組
export const LoveAppCoupleScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const b = appearAt(frame, fps, 34);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "結婚した4組に1組は、アプリでの出会い"} />
      <svg width={W} height={H}>
        {/* スマホ */}
        <g opacity={a}>
          <rect x={500} y={260} width={300} height={520} rx={36} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={6} />
          <line x1={600} y1={300} x2={700} y2={300} stroke={RNP.ink} strokeWidth={5} strokeLinecap="round" />
          {/* 画面から出てくるカップル */}
          <RPerson x={590} y={450} scale={1.1} />
          <RPerson x={710} y={450} scale={1.1} />
          {/* つないだ手 */}
          <path d="M 622 540 Q 650 560 678 540" stroke={RNP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Heart x={650} y={360} scale={0.55} color={RNP.pink} />
        </g>
        {/* 4組の指輪 (1組だけピンク) */}
        <g opacity={b}>
          {Array.from({ length: 4 }).map((_, i) => {
            const x = 1030 + i * 190;
            const pink = i === 0;
            const c = pink ? RNP.pink : RNP.dim;
            return (
              <g key={i} stroke={c} strokeWidth={6} fill="none">
                <circle cx={x} cy={520} r={44} />
                <circle cx={x + 52} cy={520} r={44} />
                {pink && <Heart x={x + 26} y={430} scale={0.45} color={RNP.pink} />}
              </g>
            );
          })}
          <SmallLabel x={1340} y={660} text="結婚した 4組に 1組" color={RNP.faint} size={34} />
        </g>
      </svg>
    </Frame>
  );
};

// love_like_rain (行6): 複数スマホでいいね連打 → 史実の婚姻数減少グラフに変わる
export const LoveLikeRainScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const swap = appearAt(frame, fps, Math.round(fps * 1.9)); // スマホ → グラフ
  const draw = appearAt(frame, fps, Math.round(fps * 2.2));
  // 婚姻数の折れ線 (1972年 約110万組 → 2023年 約47.5万組)
  const pts: Array<[number, number]> = [
    [500, 380], // 1972 ピーク 110万
    [700, 440],
    [900, 500],
    [1100, 540],
    [1300, 600],
    [1480, 660], // 2023 47.5万
  ];
  const seg = draw * (pts.length - 1);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (swap > 0.5 ? "婚姻数は、戦後最少を更新中" : "画面の中は「いいね」であふれている")} />
      <svg width={W} height={H}>
        {/* 前半: 3台のスマホからいいねが連打で飛び出す */}
        <g opacity={1 - swap}>
          {[620, 960, 1300].map((px, pi) => (
            <g key={pi}>
              <rect x={px - 110} y={360} width={220} height={390} rx={28} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={6} />
              <line x1={px - 44} y1={396} x2={px + 44} y2={396} stroke={RNP.ink} strokeWidth={5} strokeLinecap="round" />
              {/* いいね連打 (ハート+♥カウンタが跳ねる) */}
              {Array.from({ length: 6 }).map((_, i) => {
                const t = ((frame * (2 + jitter(i + pi * 7, 51)) + jitter(i + pi * 7, 52) * 90) % 90) / 90;
                return (
                  <Heart
                    key={i}
                    x={px - 60 + jitter(i + pi * 7, 53) * 120}
                    y={700 - t * 330}
                    scale={0.3 + jitter(i + pi * 7, 54) * 0.3}
                    color={i % 2 === 0 ? RNP.pink : RNP.pinkSoft}
                    opacity={a * (1 - t) * 1.2}
                  />
                );
              })}
              <text x={px} y={590} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={38} fontWeight={800} fill={RNP.pink}>
                +いいね
              </text>
            </g>
          ))}
        </g>
        {/* 後半: 史実の婚姻数グラフ */}
        <g opacity={swap}>
          <line x1={440} y1={300} x2={440} y2={700} stroke={RNP.ink} strokeWidth={5} />
          <line x1={440} y1={700} x2={1560} y2={700} stroke={RNP.ink} strokeWidth={5} />
          {pts.map(([x, y], i) => {
            if (i === 0) return null;
            const show = Math.max(0, Math.min(1, seg - (i - 1)));
            const [px, py] = pts[i - 1];
            return <line key={i} x1={px} y1={py} x2={px + (x - px) * show} y2={py + (y - py) * show} stroke={RNP.pinkDeep} strokeWidth={8} strokeLinecap="round" />;
          })}
          <circle cx={500} cy={380} r={10} fill={RNP.pink} opacity={draw} />
          <circle cx={1480} cy={660} r={11} fill={RNP.pinkDeep} opacity={seg >= 4.9 ? 1 : 0} />
          <g opacity={draw}>
            <text x={640} y={340} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={700} fill={RNP.ink}>
              1972年 約110万組
            </text>
          </g>
          <g opacity={seg >= 4.9 ? 1 : 0}>
            <text x={1280} y={528} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={800} fill={RNP.pinkDeep}>
              2023年 約47.5万組
            </text>
            <text x={1420} y={760} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={800} fill={RNP.pinkDeep}>
              戦後最少
            </text>
          </g>
          <SmallLabel x={700} y={780} text="婚姻数のうつりかわり" color={RNP.faint} size={30} />
        </g>
      </svg>
    </Frame>
  );
};

// love_iihito (行7): いいねは来るのに、いい人は来ない
// 左: スマホにいいねが飛び込む / 右: 玄関のドアの前はからっぽ (点線の人)
export const LoveIihitoScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const b = appearAt(frame, fps, Math.round(fps * 1.2));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "いいねは来る。いい人は来ない"} />
      <svg width={W} height={H}>
        {/* まんなかの仕切り */}
        <line x1={960} y1={300} x2={960} y2={760} stroke={RNP.dim} strokeWidth={4} strokeDasharray="6 14" opacity={a} />
        {/* 左: スマホを持つ人 + 飛び込むいいね */}
        <g opacity={a}>
          <RPerson x={560} y={520} scale={1.8} />
          <rect x={620} y={530} width={110} height={180} rx={18} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={5} transform="rotate(8 675 620)" />
          {Array.from({ length: 5 }).map((_, i) => {
            const t = ((frame * 2.4 + i * 26) % 80) / 80;
            return <Heart key={i} x={250 + t * 380} y={420 + jitter(i, 61) * 160 + t * 60} scale={0.35 + jitter(i, 62) * 0.2} color={RNP.pink} opacity={(1 - t) * 1.1} />;
          })}
          <SmallLabel x={540} y={800} text="いいね → 来る" color={RNP.pink} size={38} weight={800} />
        </g>
        {/* 右: ドアの前にだれも来ない (点線の人) */}
        <g opacity={b}>
          {/* ドア */}
          <rect x={1420} y={340} width={200} height={360} rx={10} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={6} />
          <circle cx={1452} cy={530} r={9} fill={RNP.ink} />
          {/* 点線の「いい人」silhouette */}
          <g stroke={RNP.dim} strokeWidth={5} fill="none" strokeDasharray="10 10">
            <circle cx={1180} cy={480} r={28} />
            <path d="M 1134 596 q 3 -60 46 -63 q 43 3 46 63 Z" />
          </g>
          <text x={1180} y={660} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fill={RNP.faint}>
            いい人 (まだ見ぬ)
          </text>
          <SmallLabel x={1380} y={800} text="いい人 → 来ない" color={RNP.faint} size={38} weight={800} />
        </g>
      </svg>
    </Frame>
  );
};

// love_twist (行8-9): 道具↑と出会い↓のねじれ矢印。下がる矢印=濃ピンク (強調)
export const LoveTwistScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = appearAt(frame, fps, 10);
  const down = appearAt(frame, fps, 26);
  const seishin = variant >= 1; // 行9「精神論では解けません」
  if (seishin) {
    // 気合で引っぱっても、ガチガチのねじれはほどけない
    const a2 = appearAt(frame, fps, 10);
    const b = appearAt(frame, fps, Math.round(fps * 0.9));
    const c = appearAt(frame, fps, Math.round(fps * 1.8));
    const tug = c > 0.5 ? Math.sin(frame / 4) * 4 : 0; // 引っぱってもビクともしない震え
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "このねじれは、精神論では解けない"} />
        <svg width={W} height={H}>
          {/* ガチガチにねじれたひも */}
          <g opacity={a2} fill="none" strokeLinecap="round" transform={`translate(${tug}, 0)`}>
            <path
              d="M 820 380 Q 1010 430 950 520 Q 890 610 1070 570 Q 1210 530 1130 440 Q 1060 360 960 440 Q 860 520 1010 640"
              stroke={RNP.pinkDeep}
              strokeWidth={13}
            />
            <path
              d="M 1120 660 Q 940 610 1000 510 Q 1060 410 880 470 Q 740 510 830 610"
              stroke={RNP.dim}
              strokeWidth={13}
            />
            <SmallLabel x={980} y={760} text="奇妙なねじれ" color={RNP.faint} size={30} />
          </g>
          {/* 気合の人 (鉢巻で叫ぶ) */}
          <g opacity={b}>
            <RPerson x={480} y={520} scale={1.9} color={RNP.ink} />
            {/* 鉢巻 */}
            <path d="M 448 504 L 512 504 M 512 504 l 26 -12 M 512 504 l 24 12" stroke={RNP.pinkDeep} strokeWidth={7} fill="none" strokeLinecap="round" />
            {/* 吹き出し */}
            <ellipse cx={430} cy={330} rx={160} ry={66} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={5} />
            <path d="M 452 388 L 470 432 L 492 390" fill="#FFFFFF" stroke={RNP.ink} strokeWidth={5} />
            <text x={430} y={346} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={42} fontWeight={800} fill={RNP.pinkDeep}>
              気合だー!
            </text>
          </g>
          {/* それでも、ほどけない */}
          <g opacity={c}>
            <path d="M 1320 390 L 1470 540 M 1470 390 L 1320 540" stroke={RNP.pinkDeep} strokeWidth={12} strokeLinecap="round" />
            <SmallLabel x={1395} y={620} text="ほどけない" color={RNP.pinkDeep} size={34} weight={800} />
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (seishin ? "このねじれは、精神論では解けない" : "道具は増えた。出会いは減った")} />
      <svg width={W} height={H}>
        {/* 上がる矢印 (道具 = グレー) */}
        <g opacity={up}>
          <path d="M 480 660 Q 900 620 1380 330" fill="none" stroke={RNP.dim} strokeWidth={10} strokeLinecap="round" />
          <path d="M 1380 330 l -56 4 M 1380 330 l -14 54" stroke={RNP.dim} strokeWidth={10} fill="none" strokeLinecap="round" />
          {/* スマホアイコン */}
          <rect x={430} y={580} width={70} height={116} rx={12} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={5} />
          <SmallLabel x={620} y={740} text="道具 (アプリ) は増えた" color={RNP.faint} size={32} />
        </g>
        {/* 下がる矢印 (出会い = 濃ピンク・強調) */}
        <g opacity={down}>
          <path d="M 480 330 Q 900 380 1380 660" fill="none" stroke={RNP.pinkDeep} strokeWidth={10} strokeLinecap="round" />
          <path d="M 1380 660 l -54 -12 M 1380 660 l -22 -50" stroke={RNP.pinkDeep} strokeWidth={10} fill="none" strokeLinecap="round" />
          <Heart x={462} y={290} scale={0.6} color={RNP.pink} />
          <SmallLabel x={1300} y={740} text="出会いは減った" color={RNP.pinkDeep} size={34} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// love_act_only (行10): メタ演出。再生画面風の枠の中で、見ているあなたがうなずく
export const LoveActOnlyScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const b = appearAt(frame, fps, Math.round(fps * 1.1));
  const nod = Math.max(0, Math.sin(frame / 7)) * 10; // うなずき (頭が下がる)
  const barT = Math.min(0.92, 0.2 + frame / (fps * 10)); // 再生バーがじわじわ進む
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "行動できる人は、この動画を見ていない"} />
      <svg width={W} height={H}>
        {/* 再生画面風の枠 */}
        <g opacity={a}>
          <rect x={460} y={260} width={1000} height={520} rx={22} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={7} />
          {/* 画面内のタイトルっぽい帯 */}
          <rect x={500} y={296} width={430} height={34} rx={8} fill={RNP.pinkSoft} opacity={0.6} />
          {/* 中の人 (この動画を見ているあなた) がうなずく */}
          <g stroke={RNP.ink} strokeWidth={6} fill="none" strokeLinecap="round">
            <g transform={`translate(0, ${nod}) rotate(${nod * 0.7} 960 470)`}>
              <circle cx={960} cy={470} r={52} />
              {/* 共感の目 (閉じ目) と口 */}
              <path d="M 930 462 Q 938 470 946 462 M 974 462 Q 982 470 990 462" strokeWidth={5} />
              <path d="M 944 496 Q 960 506 976 496" strokeWidth={5} />
            </g>
            <path d="M 884 700 q 8 -140 76 -148 q 68 8 76 148 Z" strokeLinejoin="round" />
          </g>
          {/* うなずきの共感マーク */}
          <g opacity={b}>
            <text x={1120} y={420} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={42} fontWeight={800} fill={RNP.pinkDeep}>
              わかる…
            </text>
          </g>
          {/* プレイヤーUI: 再生バー + ボタン */}
          <rect x={500} y={726} width={920} height={10} rx={5} fill="#E8E2E4" />
          <rect x={500} y={726} width={920 * barT} height={10} rx={5} fill={RNP.pinkDeep} />
          <circle cx={500 + 920 * barT} cy={731} r={11} fill={RNP.pinkDeep} />
          <path d="M 510 688 l 0 -26 l 24 13 Z" fill={RNP.ink} />
        </g>
        {/* 枠の外から: いま見ているあなた */}
        <g opacity={b}>
          <path d="M 1530 540 Q 1490 500 1472 470" fill="none" stroke={RNP.pinkDeep} strokeWidth={5} strokeLinecap="round" />
          <path d="M 1472 470 l 0 36 M 1472 470 l 34 10" fill="none" stroke={RNP.pinkDeep} strokeWidth={5} strokeLinecap="round" />
          <text x={1620} y={590} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={32} fontWeight={700} fill={RNP.ink}>
            いま見ている
          </text>
          <text x={1620} y={634} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={32} fontWeight={700} fill={RNP.ink}>
            あなた
          </text>
        </g>
        <SmallLabel x={960} y={850} text="「行動あるのみ」で動ける人は、そもそもここにいない" color={RNP.faint} size={30} />
      </svg>
    </Frame>
  );
};

// love_math (行11): 魔法陣から運命の人を数学で召喚する
export const LoveMathScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const summon = appearAt(frame, fps, Math.round(fps * 1.5)); // 運命の人が現れる
  const cx = 960;
  const cy = 560;
  const runes = ["×", "÷", "Σ", "π", "√", "%", "=", "∞"];
  const formulas = [
    { t: "N = R × fp × ne", x: 360, y: 320, s: 36 },
    { t: "1/20 × 1/20", x: 1560, y: 340, s: 32 },
    { t: "× 1/7", x: 300, y: 640, s: 34 },
    { t: "P = 1/350000", x: 1600, y: 660, s: 30 },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "運命の人を、数学で召喚する"} />
      <svg width={W} height={H}>
        {/* まわりに浮かぶ数式 */}
        {formulas.map((f, i) => (
          <text
            key={i}
            x={f.x}
            y={f.y + Math.sin(frame / 14 + i * 2) * 8}
            textAnchor="middle"
            fontFamily={SUURI_SERIF}
            fontSize={f.s}
            fontStyle="italic"
            fill={RNP.pink}
            opacity={a * 0.75}
          >
            {f.t}
          </text>
        ))}
        {/* 魔法陣 (位置は固定。破線が流れて、その場で回って見える) */}
        <g opacity={a}>
          <ellipse cx={cx} cy={cy + 160} rx={330} ry={100} fill="none" stroke={RNP.pinkDeep} strokeWidth={5} strokeDasharray="30 16" strokeDashoffset={-frame * 1.4} />
          <ellipse cx={cx} cy={cy + 160} rx={270} ry={78} fill="none" stroke={RNP.pink} strokeWidth={4} strokeDasharray="18 12" strokeDashoffset={frame * 1.1} />
        </g>
        {/* ルーン文字 (数学記号) が円周をまわる */}
        {runes.map((r, i) => {
          const ang = (i / runes.length) * Math.PI * 2 + frame / 40;
          return (
            <text
              key={i}
              x={cx + Math.cos(ang) * 300}
              y={cy + 170 + Math.sin(ang) * 86}
              textAnchor="middle"
              fontFamily={SUURI_SERIF}
              fontSize={34}
              fill={RNP.pinkDeep}
              opacity={a * 0.9}
            >
              {r}
            </text>
          );
        })}
        {/* 光の柱 */}
        <g opacity={summon * 0.6}>
          <path d={`M ${cx - 170} ${cy + 150} L ${cx - 70} 240 L ${cx + 70} 240 L ${cx + 170} ${cy + 150} Z`} fill="url(#summonGrad)" />
          <defs>
            <linearGradient id="summonGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={RNP.pinkSoft} stopOpacity="0.9" />
              <stop offset="100%" stopColor={RNP.pinkSoft} stopOpacity="0" />
            </linearGradient>
          </defs>
        </g>
        {/* 召喚される運命の人 (下からふわっと) */}
        <g opacity={summon} transform={`translate(0, ${(1 - summon) * 90})`}>
          <RPerson x={cx} y={cy - 100} scale={2.0} color={RNP.pinkDeep} />
          <Heart x={cx} y={cy - 230 + Math.sin(frame / 8) * 6} scale={0.65} color={RNP.pinkDeep} />
        </g>
        {/* 召喚のきらめき */}
        {summon > 0.3 &&
          Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={i}
              cx={cx + (jitter(i, 71) - 0.5) * 460}
              cy={cy - 60 + (jitter(i, 72) - 0.5) * 340}
              r={3 + jitter(i, 73) * 3}
              fill={RNP.pink}
              opacity={summon * (0.4 + Math.sin(frame / 6 + i * 2) * 0.4)}
            />
          ))}
      </svg>
    </Frame>
  );
};

// love_alien_hint (行12): ピンクの世界の端から宇宙人がひょっこり (初チラ見せ)
export const LoveAlienHintScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const peek = appearAt(frame, fps, 26);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ??"宇宙人を探すために作られた数式"} />
      <svg width={W} height={H}>
        {/* 数式の紙 */}
        <g opacity={a}>
          <rect x={560} y={360} width={700} height={280} rx={20} fill="#FFFFFF" stroke={RNP.pinkSoft} strokeWidth={5} />
          <text x={910} y={480} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={60} fontWeight={700} fill={RNP.ink} fontStyle="italic">
            N = R × fp × ne …
          </text>
          <text x={910} y={560} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fill={RNP.faint}>
            ドレイク方程式 (1961)
          </text>
        </g>
        {/* 左: UFO がふわふわ */}
        <g opacity={peek} transform={`translate(0, ${Math.sin(frame / 10) * 10})`}>
          <g stroke={RNP.ink} strokeWidth={5} fill="none" strokeLinecap="round">
            <ellipse cx={300} cy={360} rx={130} ry={40} fill="#FFFFFF" />
            <path d="M 230 338 Q 240 280 300 280 Q 360 280 370 338" fill="#FFFFFF" />
          </g>
          {[-80, -30, 20, 70].map((dx, i) => (
            <circle key={i} cx={300 + dx} cy={362} r={7} fill={i % 2 === 0 ? RNP.pink : RNP.pinkSoft} />
          ))}
          {/* 下向きの光 */}
          <path d="M 250 400 L 210 520 L 390 520 L 350 400 Z" fill={RNP.pinkSoft} opacity={0.35} />
        </g>
        {/* 画面の右端からひょっこり宇宙人 (チャコール線画) + 「呼んだ?」 */}
        <g opacity={peek} transform={`translate(${interpolate(peek, [0, 1], [120, 0])}, 0)`}>
          <Alien x={1620} y={560} scale={1.4} color={RNP.ink} face="peek" />
          <g>
            <rect x={1430} y={300} width={250} height={86} rx={20} fill="#FFFFFF" stroke={RNP.pinkDeep} strokeWidth={4} />
            <path d="M 1560 386 L 1580 426 L 1602 386 Z" fill="#FFFFFF" stroke={RNP.pinkDeep} strokeWidth={4} />
            <text x={1555} y={358} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={38} fontWeight={800} fill={RNP.pinkDeep}>
              呼んだ?
            </text>
          </g>
        </g>
      </svg>
    </Frame>
  );
};

// love_tokyo (行13-15): 日本地図 → 東京がドンと光る、1400万
export const LoveTokyoScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const map = appearAt(frame, fps, 8);
  const don = appearAt(frame, fps, variant === 0 ? 26 : 12);
  const arrows = variant >= 1 ? appearAt(frame, fps, 26) : 0;
  const tx = 1150;
  const ty = 560;
  return (
    <Frame>
      <DiagramTitle
        text={
          scene?.title ??
          (variant === 0 ? "舞台は、東京都 1400万人" : variant === 1 ? "日本中の若者が集まる街" : "この街で、本気で数える")
        }
      />
      <svg width={W} height={H}>
        {/* 日本列島 (チャコールの線) */}
        <g opacity={map * 0.9} stroke={RNP.ink} strokeWidth={4} fill="none">
          <path d="M 540 860 Q 500 800 580 760 Q 660 730 720 760 Q 760 800 700 850 Q 620 890 540 860 Z" />
          <path d="M 760 780 Q 740 700 840 640 Q 980 560 1120 480 Q 1240 410 1300 360 Q 1360 320 1380 360 Q 1360 440 1240 520 Q 1080 630 920 720 Q 820 770 760 780 Z" />
          <path d="M 1380 240 Q 1360 180 1440 160 Q 1520 170 1500 250 Q 1450 300 1400 280 Z" />
          <path d="M 880 760 Q 920 740 980 760 Q 960 800 900 800 Z" />
        </g>
        {/* 東京がドン (濃ピンク・最強調) */}
        <g opacity={don}>
          <circle cx={tx} cy={ty} r={26 + don * 10} fill={RNP.pinkDeep} />
          <circle cx={tx} cy={ty} r={54 + Math.sin(frame / 6) * 6} fill="none" stroke={RNP.pinkDeep} strokeWidth={4} opacity={0.6} />
          <text x={tx + 180} y={ty - 60} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={44} fontWeight={800} fill={RNP.ink}>
            東京都
          </text>
          <text x={tx + 180} y={ty} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={54} fontWeight={800} fill={RNP.pinkDeep}>
            1400万人
          </text>
        </g>
        {/* variant1: 日本中から矢印が集まる */}
        {variant >= 1 && (
          <g opacity={arrows} stroke={RNP.pink} strokeWidth={5} fill="none" strokeLinecap="round">
            <path d="M 620 800 Q 860 740 1090 600" />
            <path d="M 1430 220 Q 1330 400 1190 520" />
            <path d="M 820 680 Q 980 650 1100 580" />
            <path d="M 1090 600 l 24 -28 M 1090 600 l 36 8" />
            <path d="M 1190 520 l 2 -38 M 1190 520 l 34 -14" />
          </g>
        )}
        {/* variant2: 虫めがねで本気で数える */}
        {variant >= 2 && (
          <g opacity={appearAt(frame, fps, 30)} stroke={RNP.ink} strokeWidth={6} fill="none">
            <circle cx={tx - 160} cy={ty + 120} r={70} />
            <path d="M 1040 730 L 980 790" strokeWidth={10} strokeLinecap="round" />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// love_count_serious (行15): 「本気で数えます」。腕まくりでカウンター連打+正の字
export const LoveCountSeriousScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // カチカチに合わせて、数字がどんどん増えていく
  const count = Math.floor(
    interpolate(frame, [fps * 0.5, fps * 6], [0, 1398642], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }),
  );
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "これを、本気で数える"} />
      <svg width={W} height={H}>
        {/* 数えられる人の列 (上を流れる) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = ((i * 240 - frame * 2.2) % 1920 + 1920) % 1920;
          return <RPerson key={i} x={x} y={330} scale={0.9} color={RNP.dim} opacity={a * 0.7} />;
        })}
        {/* カウンターボード (数字がどんどん増える) */}
        <g opacity={a}>
          <rect x={420} y={420} width={760} height={320} rx={18} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={6} />
          <text x={800} y={600} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={92} fontWeight={700} fill={RNP.pinkDeep}>
            {count.toLocaleString("ja-JP")}
          </text>
          <text x={1130} y={650} textAnchor="end" fontFamily={SUURI_FONT} fontSize={32} fontWeight={700} fill={RNP.ink}>
            人
          </text>
          <text x={800} y={700} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={28} fill={RNP.faint}>
            ガチのカウント中
          </text>
        </g>
        {/* 腕まくりで数える人 (カウンター連打) */}
        <g opacity={a}>
          <g stroke={RNP.ink} strokeWidth={6} fill="none" strokeLinecap="round">
            <circle cx={1420} cy={520} r={46} />
            {/* 真剣な目 (キリッ) */}
            <path d="M 1394 510 L 1414 516 M 1446 516 L 1466 510" strokeWidth={5} />
            <path d="M 1408 544 L 1434 544" strokeWidth={5} />
            <path d="M 1352 740 q 8 -124 68 -132 q 60 8 68 132 Z" strokeLinejoin="round" />
            {/* カウンターを押す腕 (カチカチ揺れ) */}
            <path d={`M 1372 630 Q 1300 ${600 + Math.sin(frame / 3) * 10} 1262 ${586 + Math.sin(frame / 3) * 14}`} />
          </g>
          {/* 手元のカウンター */}
          <g transform={`translate(0, ${Math.sin(frame / 3) * 4})`}>
            <rect x={1198} y={556} width={78} height={60} rx={14} fill="#FFFFFF" stroke={RNP.ink} strokeWidth={5} />
            <circle cx={1237} cy={548} r={12} fill={RNP.pinkDeep} />
          </g>
          <text x={1300} y={470} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={800} fill={RNP.pinkDeep}>
            カチ カチ
          </text>
        </g>
        <SmallLabel x={960} y={840} text="精神論ではなく、数える" color={RNP.faint} size={32} />
      </svg>
    </Frame>
  );
};

// love_roadmap (行16): 4章ロードマップ (ハートの道標)
export const LoveRoadmapScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chapters = [
    { n: "第1章", t: "宇宙人の数え方" },
    { n: "第2章", t: "運命の人を数える" },
    { n: "第3章", t: "掛け算の抜け道" },
    { n: "第4章", t: "確率は動かせる" },
  ];
  // variant0 = 全体 / 1 = 前半を強調 / 2 = 後半を強調
  const hot = (i: number) => (variant === 1 ? i < 2 : variant === 2 ? i >= 2 : true);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日の流れは、4つの章"} />
      <svg width={W} height={H}>
        {/* 道 (ゆるい曲線) */}
        <path d="M 240 700 Q 640 560 960 600 Q 1280 640 1680 440" fill="none" stroke={RNP.dim} strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" opacity={appearAt(frame, fps, 8)} />
        {chapters.map((c, i) => {
          const x = 350 + i * 410;
          const y = [640, 560, 590, 470][i];
          const pop = appearAt(frame, fps, 16 + i * 10);
          const on = hot(i);
          return (
            <g key={i} opacity={pop} transform={`translate(0, ${(1 - pop) * 20})`}>
              {/* ハートの道標 */}
              <Heart x={x} y={y - 120} scale={on ? 1.15 : 0.95} color={on ? RNP.pinkSoft : "#EDE6E8"} />
              <line x1={x} y1={y - 72} x2={x} y2={y} stroke={RNP.ink} strokeWidth={5} />
              <text x={x} y={y - 108} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={26} fontWeight={800} fill={on ? RNP.pinkDeep : RNP.faint}>
                {c.n}
              </text>
              <text x={x} y={y + 46} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={31} fontWeight={700} fill={on ? RNP.ink : RNP.faint}>
                {c.t}
              </text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// love_preview_ch12 (行17): 斜め2分割で第1章・第2章のプレビュー (キラキラ回の予告スタイルの恋愛版)
export const LovePreviewCh12Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const left = appearAt(frame, fps, 10);
  const right = appearAt(frame, fps, 26);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日の流れ・前半"} />
      <svg width={W} height={H}>
        {/* 斜めの仕切り */}
        <line x1={1040} y1={240} x2={880} y2={880} stroke={RNP.pinkDeep} strokeWidth={6} opacity={Math.min(left, 1)} />
        {/* 左パネル: 第1章 宇宙人を数える式 */}
        <g opacity={left}>
          <text x={530} y={330} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={800} fill={RNP.pinkDeep}>
            第1章
          </text>
          <text x={530} y={386} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={700} fill={RNP.ink}>
            宇宙人を数える式を手に入れる
          </text>
          <Alien x={380} y={560} scale={1.3} color={RNP.ink} />
          <rect x={500} y={500} width={380} height={130} rx={16} fill="#FFFFFF" stroke={RNP.pinkSoft} strokeWidth={5} />
          <text x={690} y={580} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={40} fontStyle="italic" fill={RNP.ink}>
            N = R × fp …
          </text>
        </g>
        {/* 右パネル: 第2章 運命の人を数える */}
        <g opacity={right}>
          <text x={1390} y={330} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={800} fill={RNP.pinkDeep}>
            第2章
          </text>
          <text x={1390} y={386} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={700} fill={RNP.ink}>
            その式で、運命の人を数える
          </text>
          {/* 人が掛け算で減っていくミニ図 */}
          {[1400, 700, 105, 40].map((n, i) => {
            const x = 1130 + i * 180;
            return (
              <g key={i}>
                <RPerson x={x} y={540} scale={1.2 - i * 0.22} color={i === 3 ? RNP.pinkDeep : RNP.dim} fill={i === 3} />
                {i < 3 && (
                  <text x={x + 90} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={36} fill={RNP.pink}>
                    ×
                  </text>
                )}
              </g>
            );
          })}
          <Heart x={1670} y={470} scale={0.4} color={RNP.pinkDeep} />
          <text x={1390} y={680} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={28} fill={RNP.faint}>
            1400万人 → ?人
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// love_preview_ch34 (行18): 斜め2分割で第3章・第4章のプレビュー
export const LovePreviewCh34Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const left = appearAt(frame, fps, 10);
  const right = appearAt(frame, fps, 26);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日の流れ・後半"} />
      <svg width={W} height={H}>
        <line x1={1040} y1={240} x2={880} y2={880} stroke={RNP.pinkDeep} strokeWidth={6} opacity={Math.min(left, 1)} />
        {/* 左パネル: 第3章 掛け算の抜け道 */}
        <g opacity={left}>
          <text x={530} y={330} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={800} fill={RNP.pinkDeep}>
            第3章
          </text>
          <text x={530} y={386} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={700} fill={RNP.ink}>
            答えをひっくり返す掛け算の性質
          </text>
          {/* ×2 で数字が倍になるミニ図 */}
          <rect x={300} y={480} width={150} height={120} rx={14} fill="#FFFFFF" stroke={RNP.pink} strokeWidth={5} />
          <text x={375} y={558} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={48} fontWeight={800} fill={RNP.ink}>
            40
          </text>
          <text x={530} y={556} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fill={RNP.pinkDeep}>
            ×2 →
          </text>
          <rect x={620} y={462} width={170} height={150} rx={14} fill="#FFFFFF" stroke={RNP.pinkDeep} strokeWidth={6} />
          <text x={705} y={560} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={60} fontWeight={800} fill={RNP.pinkDeep}>
            80
          </text>
        </g>
        {/* 右パネル: 第4章 確率を自分で動かす */}
        <g opacity={right}>
          <text x={1390} y={330} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={800} fill={RNP.pinkDeep}>
            第4章
          </text>
          <text x={1390} y={386} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={700} fill={RNP.ink}>
            確率を自分で動かす方法
          </text>
          {/* 上がる矢印とサイコロ */}
          <path d="M 1180 640 Q 1360 600 1580 470" fill="none" stroke={RNP.pinkDeep} strokeWidth={9} strokeLinecap="round" />
          <path d="M 1580 470 l -52 6 M 1580 470 l -14 50" fill="none" stroke={RNP.pinkDeep} strokeWidth={9} strokeLinecap="round" />
          <g stroke={RNP.ink} strokeWidth={5} fill="#FFFFFF">
            <rect x={1170} y={520} width={90} height={90} rx={16} transform="rotate(-8 1215 565)" />
          </g>
          <circle cx={1200} cy={550} r={7} fill={RNP.pinkDeep} />
          <circle cx={1236} cy={586} r={7} fill={RNP.pinkDeep} />
          <text x={1390} y={700} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={28} fill={RNP.faint}>
            確率は、動かせる
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// love_to_black (行19): 「それでは、まいりましょう。」白いピンクの世界が中央から黒に暗転
export const LoveToBlackScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 早めに黒い円が画面を飲み込む → 星が灯る (字幕は白なので早く黒地にする)
  const r = interpolate(frame, [Math.round(fps * 0.25), Math.round(fps * 1.1)], [0, 2300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stars = appearAt(frame, fps, Math.round(fps * 1.3));
  return (
    <Frame>
      <svg width={W} height={H}>
        {/* 中央のハートがひと呼吸 */}
        <Heart x={960} y={470} scale={1.6 + Math.sin(frame / 7) * 0.08} color={RNP.pink} opacity={r > 1200 ? 0 : 1} />
        {/* 黒い円 (暗転) */}
        <circle cx={960} cy={540} r={r} fill={SP.background} />
        {/* 暗転のあと、星がぽつぽつ (第1章=宇宙への橋渡し) */}
        {r > 1600 &&
          Array.from({ length: 26 }).map((_, i) => {
            const x = 140 + jitter(i, 5) * 1640;
            const y = 120 + jitter(i, 6) * 660;
            return <circle key={i} cx={x} cy={y} r={2.5 + jitter(i, 7) * 2.5} fill={SP.ink} opacity={stars * (0.4 + jitter(i, 8) * 0.6)} />;
          })}
      </svg>
    </Frame>
  );
};

// ===== 第1章 宇宙人の数え方 (黒モード) =====

// drake_blackboard (行21): 学者ドレイクが黒板に式を一文字ずつ書いていく
export const DrakeBlackboardScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const board = appearAt(frame, fps, 8);
  // 黒板からはみ出さないよう、式は2行に分けて書く
  const line1 = "N = R*・fp・ne・fl";
  const line2 = "・fi・fc・L";
  const total = line1.length + line2.length;
  const chars = Math.max(0, Math.min(total, Math.floor((frame - fps * 0.7) / 2.4)));
  const chars1 = Math.min(chars, line1.length);
  const chars2 = Math.max(0, chars - line1.length);
  const writing = chars > 0 && chars < total;
  const armSwing = writing ? Math.sin(frame / 2.5) * 10 : 0;
  // 書き進みに合わせてチョーク位置が右へ (2行目は下の行を追う)
  const onLine2 = chars > line1.length;
  const tipX = onLine2 ? 395 + (chars2 / line2.length) * 400 : 395 + (chars1 / line1.length) * 600;
  const tipY = onLine2 ? 540 : 452;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "1961年、ドレイクの黒板"} />
      <svg width={W} height={H}>
        {/* 窓の外の星空 */}
        <g opacity={board}>
          <rect x={1400} y={270} width={330} height={290} rx={10} fill="none" stroke={SP.line} strokeWidth={5} />
          <path d="M 1565 270 L 1565 560 M 1400 415 L 1730 415" stroke={SP.line} strokeWidth={4} />
          {Array.from({ length: 14 }).map((_, i) => (
            <circle
              key={i}
              cx={1416 + jitter(i, 11) * 298}
              cy={288 + jitter(i, 12) * 254}
              r={2.5 + jitter(i, 13) * 2.5}
              fill={KC.yellow}
              opacity={board * (0.5 + jitter(i, 14) * 0.5)}
            />
          ))}
        </g>
        {/* 黒板 */}
        <g opacity={board}>
          <rect x={280} y={250} width={940} height={420} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <text x={750} y={340} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={32} fill={SP.faint}>
            1961年・ある会議室
          </text>
          {/* 式が一文字ずつ書かれていく (2行) */}
          <text x={395} y={460} textAnchor="start" fontFamily={SUURI_SERIF} fontSize={58} fill={SP.ink}>
            {line1.slice(0, chars1)}
          </text>
          <text x={395} y={560} textAnchor="start" fontFamily={SUURI_SERIF} fontSize={58} fill={SP.ink}>
            {line2.slice(0, chars2)}
          </text>
          {/* 書いている最中のチョーク粉 */}
          {writing && (
            <g opacity={0.8}>
              <circle cx={tipX + 10} cy={tipY} r={3.5} fill={SP.faint} />
              <circle cx={tipX + 22} cy={tipY + 14} r={2.5} fill={SP.faint} opacity={0.6} />
            </g>
          )}
        </g>
        {/* ドレイク (眼鏡の学者。腕が黒板へ伸びて動く) */}
        <g opacity={board}>
          <g stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
            <circle cx={1300} cy={560} r={26} />
            <path d="M 1300 586 L 1300 700 M 1300 700 L 1278 780 M 1300 700 L 1322 780" />
            {/* 右腕: 黒板に向かって書く動き */}
            <path d={`M 1300 612 L ${1238 + armSwing * 0.4} ${560 + armSwing}`} />
            {/* 左腕: 後ろ手 (学者風) */}
            <path d="M 1300 622 L 1344 660" />
          </g>
          {/* 眼鏡 */}
          <g stroke={SP.line} strokeWidth={3.5} fill="none">
            <circle cx={1290} cy={558} r={8} />
            <circle cx={1312} cy={558} r={8} />
            <path d="M 1298 558 L 1304 558" />
          </g>
          {/* チョーク */}
          <rect x={1226 + armSwing * 0.4} y={552 + armSwing} width={16} height={7} rx={3} fill={KC.yellow} transform={`rotate(-30 ${1234 + armSwing * 0.4} ${556 + armSwing})`} />
        </g>
        <SmallLabel x={750} y={752} text="黒板に、一本の式" />
      </svg>
    </Frame>
  );
};

// drake_galaxy (行22): 銀河+宇宙人たち+UFO。議題が中央に大きくフェードイン
export const DrakeGalaxyScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = appearAt(frame, fps, 8);
  const agenda = appearAt(frame, fps, Math.round(fps * 1.2));
  const float = Math.sin(frame / 11) * 8;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "議題: 交信できる文明はいくつ?"} />
      <svg width={W} height={H}>
        {/* 銀河 (渦巻き) と星 */}
        <g opacity={bg * 0.85} transform="translate(960, 540)">
          <path
            d="M 0 0 C 90 -30 160 30 130 100 C 100 175 -60 190 -160 115 C -280 30 -235 -160 -90 -220 C 90 -280 320 -190 380 -30"
            fill="none"
            stroke={KC.skyBlue}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.7}
          />
          <path
            d="M 0 0 C -90 30 -160 -30 -130 -100 C -100 -175 60 -190 160 -115 C 280 -30 235 160 90 220 C -90 280 -320 190 -380 30"
            fill="none"
            stroke={KC.skyBlue}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.5}
          />
        </g>
        {Array.from({ length: 26 }).map((_, i) => (
          <circle
            key={i}
            cx={200 + jitter(i, 61) * 1520}
            cy={240 + jitter(i, 62) * 660}
            r={2 + jitter(i, 63) * 3}
            fill={KC.yellow}
            opacity={bg * (0.3 + jitter(i, 64) * 0.6)}
          />
        ))}
        {/* いろんな宇宙人 */}
        <g opacity={bg}>
          <Alien x={380} y={330 + float} scale={0.55} color={KC.green} face="smile" />
          <Alien x={1540} y={360 - float} scale={0.5} color={KC.pink} face="eh" />
          <Alien x={480} y={760 - float * 0.6} scale={0.46} color={KC.orange} face="peek" />
          <Alien x={1460} y={770 + float * 0.6} scale={0.52} color={KC.lime} face="smile" />
        </g>
        {/* UFO */}
        <g opacity={bg} transform={`translate(960, ${270 + float * 0.8})`}>
          <ellipse cx={0} cy={0} rx={90} ry={26} fill="none" stroke={SP.line} strokeWidth={5} />
          <path d="M -40 -14 Q 0 -52 40 -14" fill="none" stroke={SP.line} strokeWidth={5} />
          {[-54, -18, 18, 54].map((dx, i) => (
            <circle key={i} cx={dx} cy={4} r={6} fill={[KC.yellow, KC.pink, KC.skyBlue, KC.lime][i]} opacity={0.5 + 0.5 * Math.sin(frame / 5 + i)} />
          ))}
        </g>
        {/* 議題が中央に大きくフェードイン (下字幕は消して、この文字で読ませる) */}
        <g opacity={agenda}>
          <rect x={230} y={440} width={1460} height={230} rx={18} fill={SP.panel} opacity={0.94} stroke={SP.accent} strokeWidth={6} />
          <text x={960} y={540} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={60} fontWeight={700} fill={SP.ink}>
            「この銀河に、電波で交信できる
          </text>
          <text x={960} y={626} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={60} fontWeight={700} fill={SP.ink}>
            宇宙人の文明はいくつあるか」
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// drake_meeting (行23-24): 小さな会議室に10人、頭上に巨大な銀河
export const DrakeMeetingScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const galaxy = appearAt(frame, fps, 8);
  const people = appearAt(frame, fps, 24);
  const joke = variant >= 1; // 行24: 地球側の人数が少なすぎる
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (joke ? "宇宙人を数える側、10人" : "出席者は、わずか10人")} />
      <svg width={W} height={H}>
        {/* 巨大な銀河 (渦巻き)。タイトルに被らないよう下げる */}
        <g opacity={galaxy * 0.9} transform="translate(960, 430)">
          <path
            d="M 0 0 C 60 -20 110 20 90 70 C 70 120 -40 130 -110 80 C -190 20 -160 -110 -60 -150 C 60 -190 220 -130 260 -20"
            fill="none"
            stroke={KC.skyBlue}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d="M 0 0 C -60 20 -110 -20 -90 -70 C -70 -120 40 -130 110 -80 C 190 -20 160 110 60 150 C -60 190 -220 130 -260 20"
            fill="none"
            stroke={KC.skyBlue}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.7}
          />
          {Array.from({ length: 16 }).map((_, i) => (
            <circle key={i} cx={(jitter(i, 21) - 0.5) * 520} cy={(jitter(i, 22) - 0.5) * 300} r={2 + jitter(i, 23) * 3} fill={SP.ink} opacity={0.6} />
          ))}
        </g>
        {joke && <SmallLabel x={960} y={222} text="数えられる側: 銀河まるごと" color={KC.skyBlue} size={32} weight={700} />}
        {/* 小さな会議室 */}
        <g opacity={people}>
          <rect x={620} y={620} width={680} height={190} rx={12} fill="none" stroke={SP.line} strokeWidth={5} />
          <path d="M 680 740 L 1240 740" stroke={SP.faint} strokeWidth={5} />
          {Array.from({ length: 10 }).map((_, i) => {
            const x = 690 + i * 60;
            return (
              <g key={i} stroke={SP.line} strokeWidth={4} fill="none">
                <circle cx={x} cy={690} r={13} />
                <path d={`M ${x} 703 L ${x} 736`} />
              </g>
            );
          })}
        </g>
        <SmallLabel x={960} y={860} text={joke ? "数える側: 地球人 10人 (少なすぎる)" : "小さな会議室に、10人ほど"} size={32} />
      </svg>
    </Frame>
  );
};

// drake_decompose (行25-26): 大きな「?」が小さな掛け算のブロックに割れる
export const DrakeDecomposeScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const broken = variant >= 1; // 行26: 「小さな掛け算に分解すればいい」
  const crack = appearAt(frame, fps, 24);
  const blockColors = [KC.yellow, KC.orange, KC.green, KC.sea, KC.skyBlue, KC.pink, KC.lime];
  // v1: 大きな箱を刃物でスパッと分解する
  const chop = appearAt(frame, fps, 10);
  const sliceT = interpolate(frame, [fps * 0.4, fps * 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const split = interpolate(frame, [fps * 0.9, fps * 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (broken ? "小さな掛け算に、分解する" : "ドレイクの発想")} />
      <svg width={W} height={H}>
        {!broken && (
          <>
            {/* 大きな ? にヒビが入りはじめる */}
            <text x={960} y={620} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={360} fontWeight={700} fill={SP.ink}>
              ?
            </text>
            <g opacity={crack} stroke={SP.accent} strokeWidth={6} fill="none" strokeLinecap="round">
              <path d="M 870 380 l 40 50 l -26 44 l 44 56" />
              <path d="M 1050 460 l -30 40 l 36 50" />
            </g>
            <SmallLabel x={960} y={790} text="わからない大問題" />
          </>
        )}
        {broken && (
          <>
            {/* 大きな問題の箱 (刃物でスパッと割れて左右に開く) */}
            <g transform={`translate(${-split * 80}, ${split * 16}) rotate(${-split * 8} 850 340)`}>
              <path d="M 740 240 L 958 240 L 958 450 L 740 450 Z" fill="none" stroke={SP.ink} strokeWidth={6} strokeLinejoin="round" />
              <text x={860} y={382} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={92} fill={SP.ink}>
                ?
              </text>
            </g>
            <g transform={`translate(${split * 80}, ${split * 16}) rotate(${split * 8} 1070 340)`}>
              <path d="M 962 240 L 1180 240 L 1180 450 L 962 450 Z" fill="none" stroke={SP.ink} strokeWidth={6} strokeLinejoin="round" />
            </g>
            <SmallLabel x={520} y={300} text="わからない大問題" size={28} />
            {/* 刃物が振り下ろされる */}
            <g opacity={chop * (1 - split)} transform={`rotate(${(1 - sliceT) * -46} 1270 140) translate(0, ${sliceT * 70})`}>
              <path d="M 930 110 L 1130 110 L 1130 184 Q 1020 224 930 184 Z" fill={SP.panel} stroke={SP.ink} strokeWidth={5} strokeLinejoin="round" />
              <rect x={1130} y={126} width={104} height={34} rx={14} fill="none" stroke={SP.ink} strokeWidth={5} />
            </g>
            {/* 切れ込みの光 */}
            {sliceT > 0.6 && split < 0.7 && (
              <path d="M 960 226 L 960 462" stroke={SP.accent} strokeWidth={7} strokeLinecap="round" strokeDasharray="20 12" opacity={1 - split} />
            )}
            {/* 小さな掛け算ブロック (KC 7色)。中は小さな「?」、ブロックの間に × */}
            {blockColors.map((c, i) => {
              const pop = appearAt(frame, fps, Math.round(fps * 1.2) + i * 5);
              const x = 400 + i * 165;
              return (
                <g key={i} opacity={pop} transform={`translate(0, ${(1 - pop) * -40})`}>
                  <rect x={x} y={540} width={130} height={130} rx={16} fill="none" stroke={c} strokeWidth={6} />
                  <text x={x + 65} y={622} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={46} fill={c}>
                    ?
                  </text>
                  {i < 6 && (
                    <text x={x + 148} y={620} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={30} fill={SP.faint}>
                      ×
                    </text>
                  )}
                </g>
              );
            })}
            <SmallLabel x={960} y={770} text="ひとつひとつなら、議論できる" size={34} color={SP.ink} weight={700} />
          </>
        )}
      </svg>
    </Frame>
  );
};

// drake_terms (行27-34): 式の7項目チップが1個ずつ点灯して積み上がる (variant 0=枠だけ, 1..7=点灯数)
const DRAKE_TERMS = [
  { label: "生まれる星", sub: "1年あたり", color: KC.yellow },
  { label: "惑星を持つ", sub: "割合", color: KC.orange },
  { label: "住める環境", sub: "割合", color: KC.green },
  { label: "生命が生まれる", sub: "割合", color: KC.sea },
  { label: "知的な文明へ", sub: "割合", color: KC.skyBlue },
  { label: "電波を使う", sub: "割合", color: KC.pink },
  { label: "滅びずに続く", sub: "年数", color: KC.lime },
];
export const DrakeTermsScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lit = Math.max(0, Math.min(7, variant)); // 点灯済みの個数
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (lit === 0 ? "式の中身を、ざっくり" : `${lit}個目: ${DRAKE_TERMS[lit - 1].label}`)} />
      <svg width={W} height={H}>
        {DRAKE_TERMS.map((t, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 330 + col * 330 + (row === 1 ? 165 : 0);
          const y = 300 + row * 240;
          const on = i < lit;
          const isNew = i === lit - 1;
          const pop = isNew ? appearAt(frame, fps, 14) : 1;
          return (
            <g key={i} opacity={on ? pop : 0.9}>
              <rect
                x={x}
                y={y}
                width={290}
                height={170}
                rx={18}
                fill={on ? SP.panel : "none"}
                stroke={on ? t.color : SP.dim}
                strokeWidth={on ? 7 : 4}
                strokeDasharray={on ? "none" : "10 10"}
              />
              <text x={x + 145} y={y + 76} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={700} fill={on ? SP.ink : SP.dim}>
                {t.label}
              </text>
              <text x={x + 145} y={y + 126} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={26} fontWeight={on ? 700 : 400} fill={on ? t.color : SP.dim}>
                {on ? t.sub : "?"}
              </text>
              {/* チップの間の × */}
              {i < 6 && (
                <text
                  x={col === 3 ? 960 : x + 310}
                  y={col === 3 ? y + 215 : y + 100}
                  textAnchor="middle"
                  fontFamily={SUURI_SERIF}
                  fontSize={40}
                  fill={i < lit - 1 ? SP.ink : SP.dim}
                >
                  ×
                </text>
              )}
            </g>
          );
        })}
        <SmallLabel x={960} y={820} text={lit === 0 ? "7つの掛け算" : `7つのうち、${lit}個`} />
      </svg>
    </Frame>
  );
};

// drake_donburi (行35): どんぶりに星が山盛り「どんぶり勘定」
export const DrakeDonburiScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bowl = appearAt(frame, fps, 8);
  const label = appearAt(frame, fps, 48);
  const starPath = "M 0 -16 L 4.6 -5 L 16 -5 L 7 2.5 L 10 14 L 0 7 L -10 14 L -7 2.5 L -16 -5 L -4.6 -5 Z";
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "壮大な、どんぶり勘定"} />
      <svg width={W} height={H}>
        {/* どんぶり */}
        <g opacity={bowl}>
          <path d="M 660 560 Q 700 780 960 780 Q 1220 780 1260 560" fill="none" stroke={SP.line} strokeWidth={7} />
          <ellipse cx={960} cy={560} rx={300} ry={56} fill="none" stroke={SP.line} strokeWidth={7} />
          <path d="M 880 800 L 1040 800" stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* 山盛りの星 */}
        {Array.from({ length: 18 }).map((_, i) => {
          const pop = appearAt(frame, fps, 16 + i * 2.4);
          const ang = jitter(i, 31) * Math.PI;
          const rad = jitter(i, 32) * 230;
          const x = 960 + Math.cos(ang) * rad * 0.95;
          const y = 520 - Math.sin(ang) * 120 - jitter(i, 33) * 40;
          const s = 0.9 + jitter(i, 34) * 0.9;
          return (
            <g key={i} opacity={pop} transform={`translate(${x}, ${y + (1 - pop) * -30}) scale(${s}) rotate(${(jitter(i, 35) - 0.5) * 40})`}>
              <path d={starPath} fill={KC.yellow} />
            </g>
          );
        })}
        <g opacity={label}>
          <SmallLabel x={960} y={880} text="ひとつひとつは、どんぶり勘定" size={34} color={SP.ink} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// drake_order (行36-37): 「?」が「桁」メーターに変わる / フェルミ推定の命名
export const DrakeOrderScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const named = variant >= 1; // 行37: フェルミ推定と呼ぶ
  const sweep = interpolate(frame, [Math.round(fps * 0.5), Math.round(fps * 1.8)], [-80, 35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const meterIn = appearAt(frame, fps, 10);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (named ? "フェルミ推定" : "「見当もつかない」→「桁なら議論できる」")} />
      <svg width={W} height={H}>
        {/* 左: 見当もつかない ? */}
        <g opacity={0.8}>
          <text x={520} y={580} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={200} fill={SP.dim}>
            ?
          </text>
          <SmallLabel x={520} y={700} text="見当もつかない" color={SP.dim} />
        </g>
        {/* 矢印 */}
        <g opacity={meterIn} stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round">
          <path d="M 740 520 L 980 520 M 980 520 l -26 -18 M 980 520 l -26 18" />
        </g>
        {/* 右: 桁メーター */}
        <g opacity={meterIn}>
          <path d="M 1130 600 A 220 220 0 0 1 1570 600" fill="none" stroke={SP.line} strokeWidth={7} />
          {["10", "100", "1000"].map((t, i) => {
            const a = (-150 + i * 60) * (Math.PI / 180);
            const x = 1350 + Math.cos(a) * 250;
            const y = 600 + Math.sin(a) * 250;
            return <SmallLabel key={i} x={x} y={y} text={t} size={28} />;
          })}
          {/* 針 (赤) */}
          <g transform={`rotate(${sweep} 1350 600)`}>
            <path d="M 1350 600 L 1350 420" stroke={SP.accent} strokeWidth={9} strokeLinecap="round" />
          </g>
          <circle cx={1350} cy={600} r={14} fill={SP.accent} />
          <SmallLabel x={1350} y={700} text="桁なら、議論できる" color={SP.ink} size={32} weight={700} />
        </g>
        {named && (
          <g opacity={appearAt(frame, fps, 40)}>
            <rect x={760} y={760} width={400} height={92} rx={14} fill="none" stroke={SP.accent} strokeWidth={5} />
            <text x={960} y={820} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={800} fill={SP.ink}>
              フェルミ推定
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// fermi_name (行37): 「フェルミ推定」を大きく命名+下に小さな解説
export const FermiNameScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 10);
  const b = appearAt(frame, fps, Math.round(fps * 1.0));
  const glow = 0.5 + 0.5 * Math.sin(frame / 9);
  return (
    <Frame>
      <svg width={W} height={H}>
        {/* 背景のうすい数式 */}
        <g opacity={0.14}>
          <text x={340} y={300} fontFamily={SUURI_SERIF} fontSize={44} fill={SP.faint}>×</text>
          <text x={1540} y={340} fontFamily={SUURI_SERIF} fontSize={52} fill={SP.faint}>?</text>
          <text x={420} y={830} fontFamily={SUURI_SERIF} fontSize={48} fill={SP.faint}>≒</text>
          <text x={1480} y={850} fontFamily={SUURI_SERIF} fontSize={44} fill={SP.faint}>×</text>
        </g>
        {/* メイン: 大きな命名 */}
        <g opacity={a}>
          <text x={960} y={520} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={130} fontWeight={800} fill={SP.ink}>
            フェルミ推定
          </text>
          <path d="M 440 570 L 1480 570" stroke={SP.accent} strokeWidth={7} strokeLinecap="round" opacity={0.6 + glow * 0.4} />
        </g>
        {/* 下に小さな解説 */}
        <g opacity={b}>
          <text x={960} y={670} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fill={SP.faint}>
            わからない大問題を、ざっくりの掛け算に分解して
          </text>
          <text x={960} y={722} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fill={SP.faint}>
            「桁」を見積もる考え方
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// fermi_question (行38): 「練習問題」のスライド
export const FermiQuestionScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const q = appearAt(frame, fps, Math.round(fps * 0.9));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "有名な、練習問題"} />
      <svg width={W} height={H}>
        {/* 問題用紙 */}
        <g opacity={a}>
          <rect x={520} y={260} width={880} height={560} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <rect x={520} y={260} width={880} height={96} rx={16} fill="none" stroke={SP.line} strokeWidth={5} />
          <text x={960} y={326} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={800} fill={SP.ink}>
            練習問題
          </text>
        </g>
        {/* 大きな Q. */}
        <g opacity={q}>
          <text x={640} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={150} fontWeight={700} fill={SP.accent}>
            Q.
          </text>
          <path d="M 760 450 L 1330 450 M 760 530 L 1330 530 M 760 610 L 1180 610" stroke={SP.faint} strokeWidth={5} opacity={0.7} />
          <text x={960} y={740} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={32} fill={SP.faint}>
            フェルミ推定の入門として、あまりにも有名
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// fermi_piano (行38-41): シカゴのピアノ調律師。v0=余談入り, v1=問題, v2=掛け算の項目, v3=およそ100人
export const FermiPianoScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const items = ["人口", "ピアノのある家", "調律の頻度", "1日の件数"];
  return (
    <Frame>
      <DiagramTitle
        text={
          scene?.title ??
          (variant >= 3 ? "答えは、およそ100人" : variant >= 2 ? "4つの掛け算で" : "シカゴに、調律師は何人?")
        }
      />
      <svg width={W} height={H}>
        {/* シカゴの地図 (ミシガン湖岸のかんたんな形) */}
        <g opacity={a}>
          <path
            d="M 420 300 L 760 290 Q 820 420 790 560 Q 770 680 820 780 L 430 790 Q 400 540 420 300 Z"
            fill="none"
            stroke={SP.line}
            strokeWidth={5}
          />
          <path d="M 760 290 Q 830 430 800 570 Q 778 690 820 780" fill="none" stroke={KC.skyBlue} strokeWidth={6} />
          <SmallLabel x={600} y={850} text="シカゴ" size={30} />
          <SmallLabel x={880} y={420} text="湖" size={26} color={KC.skyBlue} />
        </g>
        {/* アメリカ国旗 (ここはアメリカの街、の目印) */}
        <g opacity={a} transform="translate(430, 212)">
          <path d="M 0 0 L 0 120" stroke={SP.line} strokeWidth={5} strokeLinecap="round" />
          <g transform={`skewY(${Math.sin(frame / 12) * 2})`}>
            <rect x={4} y={0} width={110} height={66} rx={4} fill={SP.panel} stroke={SP.line} strokeWidth={3} />
            {[10, 22, 34, 46, 58].map((y, i) => (
              <path key={i} d={`M 8 ${y} L 110 ${y}`} stroke={SP.accent} strokeWidth={5} opacity={0.85} />
            ))}
            <rect x={4} y={0} width={48} height={34} fill={KC.skyBlue} opacity={0.9} />
            {Array.from({ length: 6 }).map((_, i) => (
              <circle key={i} cx={12 + (i % 3) * 15} cy={10 + Math.floor(i / 3) * 14} r={2.4} fill="#FFFFFF" />
            ))}
          </g>
          <SmallLabel x={60} y={160} text="アメリカ" size={24} />
        </g>
        {/* ピアノ (グランドピアノの線画・木の茶) */}
        <g opacity={a} transform="translate(1180, 420)">
          <path
            d="M 0 120 L 0 30 Q 0 0 40 -6 Q 150 -22 230 10 Q 290 34 290 90 L 290 120 Z"
            fill="none"
            stroke={KC.orange}
            strokeWidth={7}
            strokeLinejoin="round"
          />
          <path d="M 0 120 L 290 120" stroke={KC.orange} strokeWidth={7} />
          <path d="M 30 120 L 30 190 M 260 120 L 260 190 M 150 120 L 150 185" stroke={KC.orange} strokeWidth={6} strokeLinecap="round" />
          <path d="M 20 96 L 270 96" stroke={SP.ink} strokeWidth={5} />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M ${36 + i * 26} 96 L ${36 + i * 26} 118`} stroke={SP.ink} strokeWidth={3} />
          ))}
        </g>
        {/* v1+: 調律師がポコポコ出現 */}
        {variant >= 1 &&
          Array.from({ length: variant >= 3 ? 10 : 5 }).map((_, i) => {
            const pop = appearAt(frame, fps, 20 + i * 5);
            const x = 470 + jitter(i, 41) * 300;
            const y = 340 + jitter(i, 42) * 380;
            return (
              <g key={i} opacity={pop}>
                <circle cx={x} cy={y} r={9} fill={KC.lime} />
                <path d={`M ${x - 14} ${y - 14} l -8 -8 M ${x + 14} ${y - 14} l 8 -8`} stroke={KC.lime} strokeWidth={4} strokeLinecap="round" opacity={pop} />
              </g>
            );
          })}
        {/* v2: 掛け算の項目 */}
        {variant >= 2 && (
          <g opacity={appearAt(frame, fps, 24)}>
            {items.map((t, i) => (
              <g key={i}>
                <rect x={1080 + (i % 2) * 260} y={640 + Math.floor(i / 2) * 86} width={240} height={66} rx={12} fill="none" stroke={SP.line} strokeWidth={4} />
                <text
                  x={1200 + (i % 2) * 260}
                  y={684 + Math.floor(i / 2) * 86}
                  textAnchor="middle"
                  fontFamily={SUURI_FONT}
                  fontSize={28}
                  fill={SP.ink}
                >
                  {t}
                </text>
              </g>
            ))}
          </g>
        )}
        {/* v3: およそ100人 */}
        {variant >= 3 && (
          <g opacity={appearAt(frame, fps, 36)}>
            <text x={1340} y={360} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={110} fontWeight={700} fill={SP.accent}>
              約100人
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// fermi_four (行40-41): 4つの掛け算要素だけのスライド。v0=要素が順に輝く, v1=×でつないで約100人
const FERMI_FOUR = [
  { label: "人口", sub: "シカゴの人数", color: KC.yellow },
  { label: "ピアノのある家", sub: "割合", color: KC.green },
  { label: "調律の頻度", sub: "年に何回", color: KC.skyBlue },
  { label: "1日の件数", sub: "1人がこなせる数", color: KC.orange },
];
export const FermiFourScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const answer = variant >= 1; // 行41: 掛け算すると約100人
  const ansIn = appearAt(frame, fps, Math.round(fps * 1.1));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (answer ? "掛け算すると、約100人" : "調べるのは、この4つだけ")} />
      <svg width={W} height={H}>
        {FERMI_FOUR.map((t, i) => {
          const pop = answer ? 1 : appearAt(frame, fps, 14 + i * Math.round(fps * 0.55));
          const justIn = !answer && frame >= 14 + i * fps * 0.55 && frame < 14 + i * fps * 0.55 + fps * 0.5;
          const glow = justIn ? 0.5 + 0.5 * Math.sin(frame / 3) : 0;
          const x = 250 + i * 370;
          const y = answer ? 400 : 420;
          return (
            <g key={i} opacity={pop} transform={`translate(0, ${(1 - pop) * 30})`}>
              {/* 紹介時の輝き */}
              {justIn && (
                <rect x={x - 12} y={y - 12} width={344} height={204} rx={24} fill="none" stroke={t.color} strokeWidth={4} opacity={glow * 0.7} />
              )}
              <rect x={x} y={y} width={320} height={180} rx={18} fill={SP.panel} stroke={t.color} strokeWidth={7} />
              <text x={x + 160} y={y + 80} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={36} fontWeight={800} fill={SP.ink}>
                {t.label}
              </text>
              <text x={x + 160} y={y + 134} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={26} fill={t.color} fontWeight={700}>
                {t.sub}
              </text>
              {/* v1: 間に × */}
              {answer && i < 3 && (
                <text x={x + 345} y={y + 104} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fill={SP.ink} opacity={ansIn}>
                  ×
                </text>
              )}
            </g>
          );
        })}
        {!answer && <SmallLabel x={960} y={700} text="たった4つの、どんぶり勘定" size={32} />}
        {answer && (
          <g opacity={ansIn}>
            <path d="M 960 630 L 960 690 M 960 690 l -18 -22 M 960 690 l 18 -22" stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round" />
            <text x={960} y={810} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={100} fontWeight={800} fill={SP.accent}>
              約100人
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// fermi_phonebook (行42-43): 電話帳と計算用紙の競走。計算用紙が先にゴール
export const FermiPhonebookScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const paperX = interpolate(frame, [fps * 0.4, fps * 1.6], [480, 1430], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bookX = interpolate(frame, [fps * 0.4, fps * 2.6], [480, 1180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const match = variant >= 1; // 行43: 物理学者は電話帳より先に答えを出す
  if (!match) {
    // 行42: 大勢の人が机で電話帳をペラペラめくって、実際に数える
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "電話帳で、答え合わせ"} />
        <svg width={W} height={H}>
          {[0, 1, 2].map((i) => {
            const x = 480 + i * 480;
            const pop = appearAt(frame, fps, 10 + i * 8);
            const flip = Math.cos((frame / fps) * Math.PI * (2.0 + i * 0.45) + i * 2.1);
            return (
              <g key={i} opacity={pop}>
                {/* 数える人 (机に前のめり) */}
                <g stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
                  <circle cx={x} cy={430} r={34} />
                  <path d={`M ${x} 464 L ${x} 556 M ${x} 498 L ${x - 54} 578 M ${x} 498 L ${x + 54} 578`} />
                </g>
                {/* 机 */}
                <path d={`M ${x - 170} 650 L ${x + 170} 650 M ${x - 136} 650 L ${x - 136} 760 M ${x + 136} 650 L ${x + 136} 760`} stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round" />
                {/* 机の上の電話帳 (ページがパタパタめくれる) */}
                <g transform={`translate(${x}, 612)`}>
                  <path d="M -82 -38 Q 0 -64 82 -38 L 82 34 Q 0 8 -82 34 Z" fill="none" stroke={KC.sea} strokeWidth={6} strokeLinejoin="round" />
                  <path d="M 0 -54 L 0 16" stroke={KC.sea} strokeWidth={5} />
                  <g transform={`scale(${flip}, 1)`} opacity={0.85}>
                    <path d="M 2 -50 Q 44 -62 78 -36 L 78 26 Q 44 4 2 12 Z" fill={SP.panel} stroke={KC.sea} strokeWidth={4} strokeLinejoin="round" />
                  </g>
                  {/* めくりの風 */}
                  <path d="M 96 -56 q 16 -10 30 -2 M 100 -34 q 14 -8 26 -2" stroke={SP.faint} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(frame / 4 + i)} />
                </g>
                <SmallLabel x={x} y={810} text={["12人目…", "41人目…", "96人目…"][i]} size={26} color={SP.faint} />
              </g>
            );
          })}
          {/* 数え終わると: 計算とほぼ一致 */}
          <g opacity={appearAt(frame, fps, Math.round(fps * 2.2))}>
            <text x={960} y={330} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={58} fontWeight={700} fill={SP.accent}>
              計算と、ほぼ一致
            </text>
          </g>
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (match ? "物理学者は、計算が先" : "電話帳で答え合わせ")} />
      <svg width={W} height={H}>
        {/* ゴールライン */}
        <g opacity={a}>
          <path d="M 1530 300 L 1530 820" stroke={SP.faint} strokeWidth={5} strokeDasharray="16 12" />
          <SmallLabel x={1530} y={270} text="答え" size={30} />
        </g>
        {/* 計算用紙 (先にゴール) */}
        <g opacity={a} transform={`translate(${paperX}, 400)`}>
          <rect x={-70} y={-90} width={140} height={180} rx={8} fill="none" stroke={SP.ink} strokeWidth={5} />
          <path d="M -44 -52 L 44 -52 M -44 -16 L 44 -16 M -44 20 L 20 20" stroke={SP.faint} strokeWidth={4} />
          <text x={0} y={66} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={36} fill={SP.ink}>
            ×
          </text>
        </g>
        <SmallLabel x={paperX} y={560} text="計算 (フェルミ推定)" size={28} color={SP.ink} />
        {/* 電話帳 (あとから)。ページをペラペラめくっている */}
        <g opacity={a} transform={`translate(${bookX}, 700)`}>
          <path d="M -80 -60 Q 0 -86 80 -60 L 80 54 Q 0 28 -80 54 Z" fill="none" stroke={KC.sea} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 0 -76 L 0 36" stroke={KC.sea} strokeWidth={5} />
          <path d="M -58 -40 L -16 -48 M 16 -48 L 58 -40 M -58 -14 L -16 -22 M 16 -22 L 58 -14" stroke={KC.sea} strokeWidth={3.5} opacity={0.7} />
          {/* めくれるページ: 右→左へパタパタ */}
          {(() => {
            const flip = Math.cos((frame / fps) * Math.PI * 2.4);
            return (
              <g transform={`scale(${flip}, 1)`} opacity={0.85}>
                <path d="M 2 -72 Q 44 -84 78 -58 L 78 46 Q 44 24 2 32 Z" fill={SP.panel} stroke={KC.sea} strokeWidth={4} strokeLinejoin="round" />
              </g>
            );
          })()}
          {/* めくりの風 */}
          <path d="M 96 -78 q 16 -10 30 -2 M 102 -56 q 14 -8 26 -2" stroke={SP.faint} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(frame / 4)} />
        </g>
        <SmallLabel x={bookX} y={810} text="電話帳 (実際に数える)" size={28} color={KC.sea} />
        {/* 結果: ほぼ一致 */}
        <g opacity={appearAt(frame, fps, Math.round(fps * 2.2))}>
          <text x={1700} y={420} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={54} fontWeight={700} fill={match ? SP.accent : SP.ink}>
            ほぼ一致
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// drake_legacy (行47): 式から「調べるものリスト」が垂れ下がる
export const DrakeLegacyScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const listItems = [
    { t: "星の生まれる数", c: KC.yellow },
    { t: "惑星の割合", c: KC.green },
    { t: "生命の割合", c: KC.skyBlue },
    { t: "文明の寿命", c: KC.pink },
  ];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "「何を調べればいいか」がわかった"} />
      <svg width={W} height={H}>
        {/* 上: 式 */}
        <g opacity={a}>
          <rect x={460} y={250} width={1000} height={120} rx={14} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
          <text x={960} y={330} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={52} fill={SP.ink}>
            N = R*・fp・ne・fl・fi・fc・L
          </text>
        </g>
        {/* 垂れ下がるリスト (要素ごとに色分け) */}
        {listItems.map(({ t, c }, i) => {
          const pop = appearAt(frame, fps, 24 + i * 8);
          const x = 530 + i * 240;
          return (
            <g key={i} opacity={pop}>
              <path d={`M ${x + 90} 370 L ${x + 90} ${430}`} stroke={c} strokeWidth={4} />
              <rect x={x} y={430} width={180} height={300} rx={10} fill={SP.panel} stroke={c} strokeWidth={5} />
              <text x={x + 90} y={480} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={26} fontWeight={700} fill={c}>
                調べるもの
              </text>
              <text x={x + 90} y={560} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={24} fill={SP.ink}>
                {t}
              </text>
              {/* チェックボックス */}
              <rect x={x + 30} y={610} width={30} height={30} rx={6} fill="none" stroke={c} strokeWidth={4} />
              <rect x={x + 30} y={666} width={30} height={30} rx={6} fill="none" stroke={c} strokeWidth={4} />
            </g>
          );
        })}
        <SmallLabel x={960} y={820} text="答えはまだ出ない。でも、宿題リストが手に入った" size={32} color={SP.ink} />
      </svg>
    </Frame>
  );
};

// drake_to_love (行48-49): 式の中の宇宙人がハートに置き換わる → 決めゼリフ
export const DrakeToLoveScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const serif = variant >= 1; // 行49: 「なぜ、僕に彼女ができないのか」(字幕を消して中央に)
  const swap = appearAt(frame, fps, Math.round(fps * 1.2));
  if (serif) {
    const a = appearAt(frame, fps, 12);
    const b = appearAt(frame, fps, Math.round(fps * 1.1));
    return (
      <Frame>
        <svg width={W} height={H}>
          <g opacity={a}>
            <SmallLabel x={960} y={360} text="その問いとは ——" size={38} />
          </g>
          <g opacity={b}>
            <text x={960} y={580} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={76} fontWeight={700} fill={SP.ink}>
              「なぜ、僕に彼女ができないのか」
            </text>
            <Heart x={960} y={700} scale={0.8} color={PINK_DEEP} />
          </g>
        </svg>
      </Frame>
    );
  }
  // v0 (行48): 半世紀のタイムライン 1961 → 2010
  const lineGrow = interpolate(frame, [Math.round(fps * 0.4), Math.round(fps * 1.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "半世紀後、式は別の問いへ"} />
      <svg width={W} height={H}>
        {/* タイムラインの軸 */}
        <path d={`M 360 560 L ${360 + lineGrow * 1200} 560`} stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
        {lineGrow >= 1 && <path d="M 1560 560 l -30 -20 M 1560 560 l -30 20" stroke={SP.line} strokeWidth={7} fill="none" strokeLinecap="round" />}
        {/* 左端: 1961 ドレイク+宇宙人 */}
        <g>
          <circle cx={430} cy={560} r={14} fill={KC.skyBlue} />
          <text x={430} y={640} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={56} fontWeight={700} fill={KC.skyBlue}>
            1961
          </text>
          <Alien x={430} y={420} scale={0.55} color={KC.skyBlue} face="smile" />
          <SmallLabel x={430} y={700} text="宇宙人を数える式" size={28} color={KC.skyBlue} />
        </g>
        {/* 中央: 半世紀 */}
        <g opacity={appearAt(frame, fps, Math.round(fps * 0.9))}>
          <text x={960} y={438} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={44} fontWeight={800} fill={SP.ink}>
            半世紀
          </text>
          <path d="M 620 530 Q 960 420 1300 530" fill="none" stroke={SP.faint} strokeWidth={4} strokeDasharray="12 10" />
        </g>
        {/* 右端: 2010 ハート */}
        <g opacity={swap}>
          <circle cx={1490} cy={560} r={14} fill={PINK_DEEP} />
          <text x={1490} y={640} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={56} fontWeight={700} fill={PINK_DEEP}>
            2010
          </text>
          <Heart x={1490} y={430} scale={0.9} color={PINK_DEEP} />
          <SmallLabel x={1490} y={700} text="まったく別の問いへ" size={28} color={PINK_DEEP} />
        </g>
        <SmallLabel x={960} y={820} text="人類の英知、まさかの転用" size={32} />
      </svg>
    </Frame>
  );
};

// ===== 第2章 運命の人を数える (黒モード+ピンク差し色) =====

// backus_writing (行51): 「2010年」ドン+机で論文を書く経済学者バッカス
export const BackusWritingScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const yearIn = appearAt(frame, fps, 4);
  // 書く手の動き (細かく往復)
  const penSwing = Math.sin(frame / 2.2) * 9;
  // 書いた線がだんだん伸びる
  const written = interpolate(frame, [fps * 0.6, fps * 3.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "2010年、イギリス"} />
      <svg width={W} height={H}>
        {/* 人物紹介 (大きな年号は出さない) */}
        <g opacity={yearIn}>
          <SmallLabel x={700} y={330} text="イギリスの経済学者、ピーター・バッカス" size={36} weight={700} />
        </g>
        {/* 机 */}
        <g opacity={a}>
          <path d="M 560 720 L 1360 720 M 620 720 L 620 840 M 1300 720 L 1300 840" stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
          {/* 机の上の論文 */}
          <g transform="rotate(-4 840 660)">
            <rect x={700} y={600} width={280} height={120} rx={6} fill="#FFFFFF" opacity={0.08} />
            <rect x={700} y={600} width={280} height={120} rx={6} fill="none" stroke={SP.line} strokeWidth={4} />
            {/* 書き進む行 */}
            <path d={`M 730 640 L ${730 + 220 * Math.min(1, written * 2)} 640`} stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
            <path d={`M 730 672 L ${730 + 220 * Math.max(0, Math.min(1, written * 2 - 0.7))} 672`} stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
            <path d={`M 730 702 L ${730 + 160 * Math.max(0, Math.min(1, written * 2 - 1.3))} 702`} stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
          </g>
        </g>
        {/* 眼鏡のバッカス (座って執筆) */}
        <g opacity={a} stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
          <circle cx={1160} cy={520} r={46} />
          {/* 眼鏡 */}
          <circle cx={1142} cy={514} r={13} />
          <circle cx={1178} cy={514} r={13} />
          <path d="M 1155 514 L 1165 514" />
          <path d="M 1148 552 Q 1160 557 1172 552" />
          {/* 体 (前かがみ) */}
          <path d="M 1128 680 q -2 -80 32 -114" />
          {/* 書く腕 (ペン先が机の論文へ) */}
          <g transform={`rotate(${penSwing} 1130 600)`}>
            <path d="M 1130 600 L 1000 660" />
            <path d="M 1000 660 L 972 674" strokeWidth={4} />
          </g>
        </g>
        <SmallLabel x={1160} y={760} text="一本の論文を、発表" size={30} />
        {/* 書き上がった瞬間の「できた!」 */}
        <g opacity={appearAt(frame, fps, Math.round(fps * 3.0))}>
          <ellipse cx={1430} cy={400} rx={135} ry={66} fill="none" stroke={SP.ink} strokeWidth={5} />
          <path d="M 1330 446 L 1252 496 L 1352 462" fill="none" stroke={SP.ink} strokeWidth={5} strokeLinejoin="round" />
          <text x={1430} y={416} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={46} fontWeight={800} fill={SP.accent}>
            できた!
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// backus_paper (行52-53): 論文表紙「Why don't I have a girlfriend?」+眼鏡の経済学者
export const BackusPaperScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const titleIn = appearAt(frame, fps, 14);
  // v1: れっきとした論文のハンコが上から落ちてくる
  const stampAt = Math.round(fps * 0.9);
  const sealDrop =
    variant >= 1 ? interpolate(frame, [stampAt, stampAt + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (variant >= 1 ? "れっきとした、研究論文" : "タイトルが、すごい")} />
      <svg width={W} height={H}>
        {/* 論文表紙 */}
        <g opacity={a}>
          <rect x={560} y={230} width={560} height={620} rx={10} fill="#FFFFFF" opacity={0.08} />
          <rect x={560} y={230} width={560} height={620} rx={10} fill="none" stroke={SP.line} strokeWidth={5} />
          <g opacity={titleIn}>
            <text x={840} y={360} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fontWeight={700} fill={SP.accent}>
              Why don't I have
            </text>
            <text x={840} y={420} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fontWeight={700} fill={SP.accent}>
              a girlfriend?
            </text>
            <text x={840} y={486} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={28} fill={SP.faint}>
              なぜ僕に彼女ができないのか
            </text>
          </g>
          <path d="M 640 560 L 1040 560 M 640 610 L 1040 610 M 640 660 L 900 660" stroke={SP.faint} strokeWidth={4} opacity={0.7} />
          <text x={840} y={790} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={26} fill={SP.faint}>
            P. Backus, 2010
          </text>
        </g>
        {/* 眼鏡の経済学者 */}
        <g opacity={a} stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
          <circle cx={1360} cy={470} r={54} />
          {/* 眼鏡 */}
          <circle cx={1338} cy={462} r={16} />
          <circle cx={1382} cy={462} r={16} />
          <path d="M 1354 462 L 1366 462 M 1322 462 l -14 -4 M 1398 462 l 14 -4" />
          <path d="M 1348 506 Q 1360 512 1372 506" />
          {/* 体 */}
          <path d="M 1310 620 q 4 -70 50 -72 q 46 2 50 72" strokeLinejoin="round" />
          <path d="M 1322 580 L 1270 640 M 1398 580 L 1450 640" />
        </g>
        <SmallLabel x={1360} y={700} text="経済学者バッカス" size={28} />
        {/* v1: れっきとした論文の印 (丸いハンコが上から落ちてドン) */}
        {variant >= 1 && (
          <g opacity={sealDrop} transform={`translate(0, ${(1 - sealDrop) * -140})`}>
            <g transform="rotate(-10 1310 790)">
              <circle cx={1310} cy={790} r={86} fill="none" stroke={SP.accent} strokeWidth={7} />
              <text x={1310} y={774} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={32} fontWeight={800} fill={SP.accent}>
                研究
              </text>
              <text x={1310} y={820} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={32} fontWeight={800} fill={SP.accent}>
                論文
              </text>
            </g>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// backus_swap (行54-55): 式の上で宇宙人⇔ハートが入れ替わる。宇宙人は「え、俺?」の顔
export const BackusSwapScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const t = interpolate(frame, [fps * 0.6, fps * 1.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rude = variant >= 1; // 行55: 史上まれに見る失礼な研究
  if (rude) {
    // ドレイク本人と宇宙人が「自分の研究を変に使われた」と大きく驚くリアクション
    const sh = appearAt(frame, fps, Math.round(fps * 0.6));
    const wob = Math.sin(frame / 5) * 3;
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "史上まれに見る、失礼な研究"} />
        <svg width={W} height={H}>
          {/* 下: ハートが収まってしまった式 */}
          <g opacity={a}>
            <rect x={560} y={660} width={800} height={150} rx={16} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
            <text x={770} y={755} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={54} fill={SP.ink}>
              N =
            </text>
            <Heart x={910} y={735} scale={0.6} color={PINK_DEEP} />
            <text x={1170} y={752} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fill={SP.ink}>
              の掛け算
            </text>
          </g>
          {/* 左: 本人ドレイク (大きく驚く) */}
          <g opacity={sh} transform={`translate(0, ${wob})`}>
            <g stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round">
              <circle cx={520} cy={430} r={105} />
              {/* 眼鏡 */}
              <circle cx={480} cy={426} r={29} />
              <circle cx={560} cy={426} r={29} />
              <path d="M 509 426 L 531 426 M 451 426 l -28 -8 M 589 426 l 28 -8" />
              {/* まんまる驚き目 + あんぐり口 */}
              <circle cx={480} cy={424} r={6} fill={SP.ink} />
              <circle cx={560} cy={424} r={6} fill={SP.ink} />
              <ellipse cx={520} cy={494} rx={19} ry={26} />
            </g>
            {/* 驚きの飛び線 */}
            <path d="M 420 318 l -24 -32 M 520 308 l 0 -34 M 620 318 l 24 -32" stroke={SP.accent} strokeWidth={6} fill="none" strokeLinecap="round" />
            {/* 吹き出し (タイトル帯に被らない高さまで下げる) */}
            <ellipse cx={530} cy={216} rx={210} ry={48} fill="none" stroke={SP.ink} strokeWidth={5} />
            <text x={530} y={228} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={800} fill={SP.accent}>
              「俺の式を、そう使う!?」
            </text>
            <SmallLabel x={520} y={600} text="本人 (ドレイク)" size={28} />
          </g>
          {/* 右: 宇宙人 (大きく驚く) */}
          <g opacity={sh} transform={`translate(0, ${-wob})`}>
            <Alien x={1390} y={440} scale={1.5} color={SP.line} face="eh" />
            <path d="M 1290 318 l -24 -32 M 1390 308 l 0 -34 M 1490 318 l 24 -32" stroke={SP.accent} strokeWidth={6} fill="none" strokeLinecap="round" />
            <ellipse cx={1390} cy={216} rx={200} ry={48} fill="none" stroke={SP.ink} strokeWidth={5} />
            <text x={1390} y={228} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={800} fill={SP.accent}>
              「恋人と、同じ扱い!?」
            </text>
            <SmallLabel x={1390} y={650} text="宇宙人" size={28} />
          </g>
        </svg>
      </Frame>
    );
  }
  // 宇宙人は式の席 (960, 530) から外 (560, 300) へ。ハートは逆向き
  const ax = 960 + (560 - 960) * t;
  const ay = 530 + (300 - 530) * t;
  const hx = 560 + (960 - 560) * t;
  const hy = 300 + (505 - 300) * t;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "「宇宙人」→「恋人の候補」"} />
      <svg width={W} height={H}>
        <g opacity={a}>
          <rect x={360} y={420} width={1200} height={240} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <text x={640} y={565} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={72} fill={SP.ink}>
            N =
          </text>
          <text x={1280} y={565} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={60} fill={SP.ink}>
            の掛け算
          </text>
          {/* 入れ替わりの矢印 */}
          <path d="M 700 360 Q 760 300 830 330" fill="none" stroke={SP.faint} strokeWidth={4} strokeDasharray="10 8" opacity={1 - t} />
          {/* 宇宙人 (え、俺?) が席を外れる */}
          <Alien x={ax} y={ay} scale={0.62} color={SP.line} face="eh" />
          {/* ハートが式の席へ */}
          <Heart x={hx} y={hy} scale={1.0} color={PINK_DEEP} />
        </g>
        <SmallLabel x={960} y={760} text="置き換えは、たった1か所" size={32} />
      </svg>
    </Frame>
  );
};

// ---- カウントダウン共通の描画 (点の群れ+条件カード+残数カウンター+watcher) ----
const CD_COLS = 24;
const CD_ROWS = 10;
const CD_TOTAL = CD_COLS * CD_ROWS;
const CountdownField: React.FC<{
  frac: number; // この段で残る割合 (見た目)
  vanish: boolean; // 消える演出を再生するか
  mood: "easy" | "sweat" | "shock" | "white";
  startFrac?: number; // 前の段までに減った状態から始める (グラフの連続性)
  cond?: string; // 条件カードの文字
  condSub?: string; // 条件カードの2行目
  counter?: string; // 残数 (赤)
  children?: React.ReactNode;
}> = ({ frac, vanish, mood, startFrac = 1, cond, condSub, counter, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 6);
  const counterIn = appearAt(frame, fps, Math.round(fps * 1.3));
  return (
    <svg width={W} height={H}>
      {/* 条件カード */}
      {cond && (
        <g opacity={a}>
          <rect x={560} y={196} width={800} height={condSub ? 118 : 86} rx={14} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <text x={960} y={252} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={36} fontWeight={700} fill={SP.ink}>
            {cond}
          </text>
          {condSub && (
            <text x={960} y={298} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={28} fill={SP.faint}>
              {condSub}
            </text>
          )}
        </g>
      )}
      {/* 点の群れ */}
      {Array.from({ length: CD_TOTAL }).map((_, i) => {
        const col = i % CD_COLS;
        const row = Math.floor(i / CD_COLS);
        const x = 350 + col * 48 + (jitter(i, 51) - 0.5) * 10;
        const y = 370 + row * 40 + (jitter(i, 52) - 0.5) * 8;
        const u = jitter(i, 55);
        // 前の段ですでに消えた点は、最初から描かない (グラフの連続性)
        if (u >= startFrac) {
          return null;
        }
        if (!vanish) {
          // この段ではまだ消えない: 残っている点がそろっている
          return <circle key={i} cx={x} cy={y} r={8} fill={SP.ink} opacity={a * 0.85} />;
        }
        if (u < frac) {
          return <circle key={i} cx={x} cy={y} r={8.5} fill={PINK} opacity={a} />;
        }
        // 消える点: ポポポンッと順に退場
        const delay = Math.round(fps * 0.5 + jitter(i, 56) * fps * 1.1);
        const gone = interpolate(frame, [delay, delay + 9], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <circle key={i} cx={x} cy={y} r={8 * gone} fill={SP.faint} opacity={a * 0.7 * gone} />;
      })}
      {/* watcher (傍観者) = あなた */}
      <g opacity={a}>
        <Watcher x={1700} y={480} scale={1.3} mood={mood} />
        <SmallLabel x={1700} y={668} text="あなた" size={26} color={SP.ink} />
      </g>
      {/* 残数カウンター (赤) */}
      {counter && (
        <g opacity={vanish ? counterIn : a}>
          <text x={960} y={830} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={62} fontWeight={700} fill={SP.accent}>
            {counter}
          </text>
        </g>
      )}
      {children}
    </svg>
  );
};

// tokyo_dots_start (行56-58): 1400万の点の群れ+余裕の watcher
export const TokyoDotsStartScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const you = appearAt(frame, fps, 20);
  return (
    <Frame>
      <DiagramTitle
        text={scene?.title ?? (variant >= 2 ? "スタート: 東京都 1400万人" : variant >= 1 ? "恋人を探している、あなた" : "東京版で、計算開始")}
      />
      <CountdownField frac={1} vanish={false} mood="easy" counter={variant >= 2 ? "1400万人" : undefined}>
        {variant === 1 && (
          // 右の watcher (あなた) に脈動リングで注目させる
          <circle
            cx={1700}
            cy={530}
            r={120 + Math.sin(frame / 7) * 10}
            fill="none"
            stroke={SP.accent}
            strokeWidth={5}
            opacity={you * (0.55 + Math.sin(frame / 7) * 0.2)}
          />
        )}
        {variant >= 2 && (
          // 東京都のシルエット (左に小さく)
          <g opacity={you}>
            <path
              d="M 120 480 Q 150 430 210 440 Q 266 420 300 456 Q 330 490 310 530 Q 322 560 296 582 Q 250 606 206 590 Q 150 600 126 560 Q 100 520 120 480 Z"
              fill="none"
              stroke={SP.line}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <SmallLabel x={212} y={660} text="東京都" size={26} />
          </g>
        )}
      </CountdownField>
    </Frame>
  );
};

// countdown_gender (行59-60): 性別で半分 → 700万
export const CountdownGenderScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = appearAt(frame, fps, 16);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "条件1: 恋愛対象の性別"} />
      <CountdownField
        frac={0.5}
        vanish={variant >= 1}
        mood="easy"
        cond="恋愛対象の性別"
        condSub={variant >= 1 ? "ここで半分に" : undefined}
        counter={variant >= 1 ? "残り 700万人" : undefined}
      >
        {variant === 0 && (
          // ♂と♀の記号で「半分」を予告
          <g opacity={mark} fill="none" strokeWidth={7} strokeLinecap="round">
            <g stroke="#5B8DD9">
              <circle cx={640} cy={560} r={44} />
              <path d="M 672 528 L 716 484 M 716 484 l -30 2 M 716 484 l -2 30" />
            </g>
            <g stroke={PINK}>
              <circle cx={1280} cy={540} r={44} />
              <path d="M 1280 584 L 1280 652 M 1252 622 L 1308 622" />
            </g>
          </g>
        )}
      </CountdownField>
    </Frame>
  );
};

// countdown_yoyu (行61): まだ余裕の表情。笑顔のアップ+「まだ余裕っしょ!」
export const CountdownYoyuScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const talk = appearAt(frame, fps, 22);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "まだ余裕の表情"} />
      <svg width={W} height={H}>
        {/* あなたの顔 (大アップ、にこにこ) */}
        <g opacity={a} stroke={SP.line} strokeWidth={7} fill="none" strokeLinecap="round">
          <circle cx={820} cy={560} r={170} />
          {/* ゆるんだ目 (にっこり閉じ目) */}
          <path d="M 740 520 q 24 -22 48 0" />
          <path d="M 852 520 q 24 -22 48 0" />
          {/* 笑った口 */}
          <path d="M 756 622 Q 820 668 884 622" />
        </g>
        <SmallLabel x={820} y={820} text="あなた" size={30} color={SP.ink} />
        {/* 吹き出し */}
        <g opacity={talk}>
          <rect x={1080} y={330} width={520} height={130} rx={24} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <path d="M 1120 460 L 1046 528 L 1170 460 Z" fill={SP.panel} stroke={SP.line} strokeWidth={5} strokeLinejoin="round" />
          <text x={1340} y={412} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={44} fontWeight={800} fill={SP.ink}>
            まだ余裕っしょ!
          </text>
        </g>
        {/* 横に700万人の名残 */}
        <g opacity={a}>
          <text x={1340} y={660} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={54} fill={SP.faint}>
            残り 700万人
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// countdown_age (行62-64): 年齢±5歳 (15%) → 105万
export const CountdownAgeScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const axis = appearAt(frame, fps, 16);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "条件2: 年齢"} />
      <CountdownField
        frac={0.26}
        startFrac={0.5}
        vanish={variant >= 2}
        mood="easy"
        cond={variant >= 1 ? "年齢: 上下5歳まで" : "年齢の条件"}
        condSub={variant >= 1 ? "およそ15パーセント" : undefined}
        counter={variant >= 2 ? "残り 105万人" : undefined}
      >
        {variant === 1 && (
          // 年齢幅の軸: -5歳 ← あなた → +5歳
          <g opacity={axis}>
            <path d="M 560 560 L 1360 560 M 560 560 l 26 -16 M 560 560 l 26 16 M 1360 560 l -26 -16 M 1360 560 l -26 16" stroke={SP.accent} strokeWidth={6} fill="none" strokeLinecap="round" />
            <circle cx={960} cy={560} r={30} fill={SP.background} stroke={SP.ink} strokeWidth={5} />
            <circle cx={960} cy={552} r={8} fill={SP.ink} />
            <path d="M 948 574 q 12 -10 24 0" stroke={SP.ink} strokeWidth={4} fill="none" />
            <SmallLabel x={960} y={640} text="あなたの年齢" size={26} color={SP.ink} />
            <SmallLabel x={600} y={520} text="-5歳" size={30} color={SP.accent} weight={700} />
            <SmallLabel x={1320} y={520} text="+5歳" size={30} color={SP.accent} weight={700} />
          </g>
        )}
      </CountdownField>
    </Frame>
  );
};

// countdown_single (行65-67): 独身かどうか。先約のハートに「予約済」の札
export const CountdownSingleScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tag = appearAt(frame, fps, 18);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (variant === 1 ? "素敵な人には、先約がある" : "条件3: 独身かどうか")} />
      <CountdownField
        frac={0.16}
        startFrac={0.26}
        vanish={variant >= 2}
        mood="easy"
        cond="独身かどうか"
        condSub={variant >= 2 ? "半分として" : undefined}
        counter={variant >= 2 ? "残り 52万人" : undefined}
      >
        {variant === 1 && (
          <g opacity={tag}>
            <Heart x={960} y={520} scale={1.7} color={PINK} />
            <g transform="rotate(-8 960 560)">
              <rect x={850} y={530} width={220} height={66} rx={8} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
              <text x={960} y={575} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={800} fill={SP.accent}>
                予約済
              </text>
            </g>
            <path d="M 1046 540 L 1010 512" stroke={SP.faint} strokeWidth={4} />
          </g>
        )}
      </CountdownField>
    </Frame>
  );
};

// countdown_tottori (行68): 52万人 ≒ 鳥取県の人口
export const CountdownTottoriScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const b = appearAt(frame, fps, 28);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "52万人 ≒ 鳥取県"} />
      <svg width={W} height={H}>
        {/* 左: 残りの点 (52万) */}
        <g opacity={a}>
          {Array.from({ length: 60 }).map((_, i) => (
            <circle key={i} cx={430 + (i % 10) * 40} cy={400 + Math.floor(i / 10) * 44} r={9} fill={PINK} />
          ))}
          <SmallLabel x={610} y={720} text="残り 52万人" size={32} color={PINK} weight={700} />
        </g>
        <g opacity={b}>
          <text x={960} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={64} fill={SP.ink}>
            ≒
          </text>
        </g>
        {/* 右: 鳥取県のシルエット (横長の県形) */}
        <g opacity={b}>
          <path
            d="M 1130 520 Q 1180 470 1260 480 Q 1340 456 1420 472 Q 1510 462 1560 500 Q 1590 540 1560 572 Q 1500 600 1430 588 Q 1350 606 1270 590 Q 1180 600 1140 566 Q 1110 544 1130 520 Z"
            fill="none"
            stroke={SP.line}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <SmallLabel x={1350} y={690} text="鳥取県の人口と、だいたい同じ" size={30} />
        </g>
      </svg>
    </Frame>
  );
};

// countdown_daijobu (行69): 気分が悪そうなあなたのアップ+汗
export const CountdownDaijobuScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const talk = appearAt(frame, fps, 24);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "・・・・・・大丈夫ですか?"} />
      <svg width={W} height={H}>
        {/* あなたの顔 (大アップ、顔色が悪い) */}
        <g opacity={a} stroke={SP.line} strokeWidth={7} fill="none" strokeLinecap="round">
          <circle cx={820} cy={560} r={170} />
          {/* うつろな目 */}
          <circle cx={764} cy={520} r={9} fill={SP.line} />
          <circle cx={876} cy={520} r={9} fill={SP.line} />
          {/* ゆがんだ口 */}
          <path d="M 756 640 q 22 -18 42 0 q 22 18 42 0 q 22 -18 42 0" strokeWidth={6} />
          {/* 青ざめの縦線 (おでこ) */}
          <path d="M 760 420 L 752 470 M 790 408 L 784 462 M 820 404 L 818 458" stroke="#5B8DD9" strokeWidth={5} opacity={0.8} />
        </g>
        {/* 汗 */}
        <g opacity={a} fill={KC.skyBlue}>
          <path d={`M 1010 ${470 + (frame % 26) * 2} q 12 -26 24 0 q -2 18 -12 18 q -10 0 -12 -18 Z`} opacity={0.9} />
          <path d={`M 640 ${500 + ((frame + 13) % 26) * 2} q 10 -22 20 0 q -2 16 -10 16 q -8 0 -10 -16 Z`} opacity={0.7} />
        </g>
        <SmallLabel x={820} y={820} text="あなた" size={30} color={SP.ink} />
        {/* 問いかけ */}
        <g opacity={talk}>
          <text x={1340} y={540} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={44} fill={SP.faint}>
            大丈夫ですか?
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// countdown_honban (行70): 「ここからが本番」。watcher が汗をかきはじめる
export const CountdownHonbanScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flash = appearAt(frame, fps, 14);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ここからが、本番"} />
      <CountdownField frac={0.16} startFrac={0.16} vanish={false} mood="sweat">
        <g opacity={flash}>
          <rect x={620} y={196} width={680} height={90} rx={14} fill="none" stroke={SP.accent} strokeWidth={6} />
          <text x={960} y={256} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={800} fill={SP.accent}>
            ここからが本番
          </text>
        </g>
      </CountdownField>
    </Frame>
  );
};

// countdown_values (行70-71): 価値観が合いそう 3割 → 16万
export const CountdownValuesScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => (
  <Frame>
    <DiagramTitle text={scene?.title ?? "条件4: 話や価値観"} />
    <CountdownField
      frac={0.09}
      startFrac={0.16}
      vanish={variant >= 1}
      mood="sweat"
      cond="話や価値観が合いそう"
      condSub="3割として"
      counter={variant >= 1 ? "残り 16万人" : undefined}
    />
  </Frame>
);

// countdown_looks (行72-74): 外見が好み 20人に1人。「面食いではない」の小ネタ
export const CountdownLooksScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const joke = appearAt(frame, fps, 16);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (variant === 1 ? "「面食いではない」(目がハート)" : "条件5: 外見や雰囲気")} />
      <CountdownField
        frac={0.045}
        startFrac={0.09}
        vanish={variant >= 2}
        mood={variant >= 2 ? "shock" : "sweat"}
        cond="外見や雰囲気が好み"
        condSub="正直に、20人に1人"
        counter={variant >= 2 ? "残り 8000人" : undefined}
      >
        {variant === 1 && (
          <g opacity={joke}>
            {/* 目がハートの顔 */}
            <circle cx={960} cy={540} r={86} fill="none" stroke={SP.line} strokeWidth={6} />
            <Heart x={928} y={514} scale={0.34} color={PINK_DEEP} />
            <Heart x={992} y={514} scale={0.34} color={PINK_DEEP} />
            <path d="M 934 586 Q 960 600 986 586" stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round" />
            {/* セリフ */}
            <path d="M 1060 470 q 20 -40 70 -44" stroke={SP.faint} strokeWidth={4} fill="none" />
            <text x={1270} y={420} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={32} fill={SP.ink}>
              「面食いでは、ない」
            </text>
          </g>
        )}
      </CountdownField>
    </Frame>
  );
};

// countdown_mutual (行75-79): 向こうも好きになってくれるか。両矢印の片方が「?」
export const CountdownMutualScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrow = appearAt(frame, fps, 16);
  const showArrow = variant >= 1 && variant <= 3;
  return (
    <Frame>
      <DiagramTitle
        text={
          scene?.title ??
          (variant >= 4
            ? "こちらも、20人に1人"
            : variant >= 2
              ? "ここだけは、自分で決められない"
              : variant >= 1
                ? "向こうも、好きになってくれるか"
                : "いちばん大事な掛け算")
        }
      />
      <CountdownField
        frac={0.02}
        startFrac={0.045}
        vanish={variant >= 4}
        mood="shock"
        cond={variant >= 3 ? "相思相愛: 20人に1人" : "向こうも、あなたを好きか"}
        counter={variant >= 4 ? "残り 400人" : undefined}
      >
        {showArrow && (
          <g opacity={arrow}>
            {/* 自分 → 相手 (実線ハート) / 相手 → 自分 (?) */}
            <circle cx={700} cy={540} r={34} fill="none" stroke={SP.ink} strokeWidth={5} />
            <SmallLabel x={700} y={630} text="あなた" size={28} color={SP.ink} />
            <circle cx={1220} cy={540} r={34} fill="none" stroke={PINK} strokeWidth={5} />
            <SmallLabel x={1220} y={630} text="相手" size={28} color={PINK} />
            <path d="M 760 516 L 1160 516 M 1160 516 l -24 -16 M 1160 516 l -24 16" stroke={PINK_DEEP} strokeWidth={6} fill="none" strokeLinecap="round" />
            <Heart x={960} y={470} scale={0.4} color={PINK_DEEP} />
            <path
              d="M 1160 576 L 760 576 M 760 576 l 24 -16 M 760 576 l 24 16"
              stroke={variant >= 2 ? SP.accent : SP.faint}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="14 10"
            />
            <text x={960} y={660} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={54} fontWeight={700} fill={variant >= 2 ? SP.accent : SP.faint}>
              ?
            </text>
          </g>
        )}
      </CountdownField>
    </Frame>
  );
};

// countdown_rhythm (行80): 最後の条件 10人に1人。残数は「?」でネタバレ禁止
export const CountdownRhythmScene: React.FC<SceneProps> = ({ scene }) => (
  <Frame>
    <DiagramTitle text={scene?.title ?? "最後の条件: 深く合う人"} />
    <CountdownField frac={0.008} startFrac={0.02} vanish mood="white" cond="性格や生活のリズムまで合う" condSub="10人に1人として" counter="残り ?人" />
  </Frame>
);

// answer_40 (行81-83): 「?」で引っぱり → 40人がドン → 1400万との対比
export const Answer40Scene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  if (variant === 1) {
    // 行82: splitPunchline と同期して「40人」をドン (字幕のオチ隠しと同じ瞬間)
    const sp = splitPunchline(scene);
    const atFrame = sp ? Math.round(sp.ratio * (scene?.durationSec ?? 5) * fps) : Math.round(fps * 2.4);
    const boom = appearAt(frame, fps, atFrame);
    const scalePop = 1 + (1 - Math.min(1, (frame - atFrame) / 8)) * 0.25;
    return (
      <Frame>
        <svg width={W} height={H}>
          <g opacity={a}>
            <SmallLabel x={960} y={300} text="東京に、あなたの運命の人は" size={40} color={SP.ink} />
          </g>
          {frame < atFrame && (
            <text x={960} y={620} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={220} fill={SP.faint}>
              ?
            </text>
          )}
          <g opacity={boom} transform={frame >= atFrame ? `translate(960, 600) scale(${scalePop}) translate(-960, -600)` : undefined}>
            <text x={960} y={660} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={250} fontWeight={800} fill={PINK_DEEP}>
              40人
            </text>
            <text x={960} y={660} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={250} fontWeight={800} fill="none" stroke={PINK} strokeWidth={2} opacity={0.6}>
              40人
            </text>
            <SmallLabel x={960} y={760} text="およそ" size={36} />
          </g>
        </svg>
      </Frame>
    );
  }
  if (variant >= 2) {
    // 行83: 1400万 vs 40 の対比
    const b = appearAt(frame, fps, 24);
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "1400万人の中の、40人"} />
        <svg width={W} height={H}>
          <g opacity={a}>
            <text x={600} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={120} fill={SP.ink}>
              1400万
            </text>
            <SmallLabel x={600} y={650} text="東京都の人口" />
          </g>
          <g opacity={b}>
            <text x={1100} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={66} fill={SP.faint}>
              の中の
            </text>
            <text x={1480} y={575} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={150} fontWeight={800} fill={PINK_DEEP}>
              40
            </text>
            <SmallLabel x={1480} y={660} text="運命の人" color={PINK} />
          </g>
        </svg>
      </Frame>
    );
  }
  // 行81: 答えが出ました (まだ「?」)
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "さあ、答えが出ました"} />
      <svg width={W} height={H}>
        <g opacity={a}>
          <rect x={660} y={320} width={600} height={400} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <text x={960} y={600} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={200} fill={SP.ink} opacity={0.5 + Math.sin(frame / 6) * 0.2}>
            ?
          </text>
        </g>
        <SmallLabel x={960} y={810} text="7つの掛け算の、答えは" size={34} />
      </svg>
    </Frame>
  );
};

// street_chance (行84): 街で偶然すれちがって出会える確率、35万分の1
export const StreetChanceScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const walk = interpolate(frame, [0, fps * 3], [0, 240], { extrapolateRight: "clamp" });
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "偶然の出会いは、35万分の1"} />
      <svg width={W} height={H}>
        {/* 横断歩道 */}
        <g opacity={a * 0.8}>
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={420 + i * 115} y={600} width={60} height={160} fill={SP.dim} />
          ))}
        </g>
        {/* すれちがう2人 */}
        <g opacity={a}>
          <g transform={`translate(${640 + walk}, 500)`}>
            <circle r={22} fill="none" stroke={SP.ink} strokeWidth={5} />
            <path d="M 0 22 L 0 90 M 0 44 L -20 66 M 0 44 L 22 60 M 0 90 L -16 140 M 0 90 L 18 140" stroke={SP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
          <g transform={`translate(${1300 - walk}, 500) scale(-1, 1)`}>
            <circle r={22} fill="none" stroke={PINK} strokeWidth={5} />
            <path d="M 0 22 L 0 90 M 0 44 L -20 66 M 0 44 L 22 60 M 0 90 L -16 140 M 0 90 L 18 140" stroke={PINK} strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        </g>
        {/* 確率 */}
        <g opacity={appearAt(frame, fps, 36)}>
          <text x={960} y={330} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={92} fontWeight={700} fill={SP.accent}>
            1 / 350,000
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// tokyo_dome (行85-86): 東京ドーム6個、最後のドームの外野席に1人
export const TokyoDomeScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const far = variant >= 1; // 行87: たぶん反対側の外野席
  const unseen = variant >= 2; // 行88: 存在すら気づかれない
  const mark = appearAt(frame, fps, Math.round(fps * 1.2));
  if (far) {
    // v1 (行87) / v2 (行88): 1つの大きなドームを画面いっぱいに
    const a = appearAt(frame, fps, 8);
    const shout = appearAt(frame, fps, Math.round(fps * 1.1));
    const wob = Math.sin(frame / 5) * 2;
    // 内野スタンドの観客ドット (弧に沿って並べる)
    const seats: Array<{ x: number; y: number }> = [];
    for (let row = 0; row < 3; row++) {
      const baseY = 600 + row * 48;
      const halfW = 520 - row * 90;
      const n = 22 - row * 4;
      for (let k = 0; k < n; k++) {
        seats.push({ x: 960 - halfW + (k * (halfW * 2)) / (n - 1), y: baseY + Math.sin((k / (n - 1)) * Math.PI) * -26 });
      }
    }
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? (unseen ? "存在すら、気づかれない" : "しかも、反対側の外野席")} />
        <svg width={W} height={H}>
          <g opacity={a}>
            {/* 大きなドーム */}
            <path d="M 330 740 Q 960 180 1590 740 Z" fill="none" stroke={SP.line} strokeWidth={7} strokeLinejoin="round" />
            <path d="M 330 740 L 1590 740" stroke={SP.line} strokeWidth={7} />
            {/* グラウンド */}
            <ellipse cx={960} cy={700} rx={330} ry={46} fill="none" stroke={SP.faint} strokeWidth={4} />
            {/* 満員の観客 */}
            {seats.map((s, j) => (
              <circle key={j} cx={s.x} cy={s.y} r={5} fill={SP.faint} />
            ))}
          </g>
          {/* あなた (左端の席・赤) */}
          <g opacity={a}>
            <circle cx={470} cy={656} r={11} fill={SP.accent} />
            <SmallLabel x={470} y={796} text="あなた" size={30} color={SP.accent} weight={700} />
          </g>
          {/* 運命の人 (反対側の外野席・ピンク) */}
          <g opacity={mark} transform={unseen ? `translate(${wob}, 0)` : undefined}>
            <circle cx={1452} cy={652} r={24} fill="none" stroke={SP.accent} strokeWidth={5} />
            <circle cx={1452} cy={652} r={9} fill={PINK} />
            <SmallLabel x={1452} y={796} text="運命の人" size={30} color={PINK} weight={700} />
          </g>
          {unseen ? (
            <g opacity={shout}>
              {/* あなたの叫び: 好きだー! */}
              <g>
                <ellipse cx={560} cy={470} rx={158} ry={62} fill="none" stroke={SP.accent} strokeWidth={5} />
                <path d="M 505 522 L 480 620 L 560 530" fill="none" stroke={SP.accent} strokeWidth={5} strokeLinejoin="round" />
                <text x={560} y={486} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={44} fontWeight={800} fill={SP.accent}>
                  好きだー!
                </text>
                {/* 叫び飛び線 */}
                <path d="M 710 420 L 760 396" stroke={SP.accent} strokeWidth={5} strokeLinecap="round" />
                <path d="M 724 462 L 782 456" stroke={SP.accent} strokeWidth={5} strokeLinecap="round" />
              </g>
              {/* 向こうは気づかない: … */}
              <g opacity={appearAt(frame, fps, Math.round(fps * 1.9))}>
                <text x={1452} y={560} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={56} fontWeight={800} fill={SP.faint}>
                  …
                </text>
              </g>
            </g>
          ) : (
            <g opacity={shout}>
              {/* 遠さを示す点線 */}
              <path d="M 500 630 Q 960 360 1424 628" fill="none" stroke={SP.faint} strokeWidth={5} strokeDasharray="4 18" strokeLinecap="round" />
            </g>
          )}
          <SmallLabel
            x={960}
            y={880}
            text={unseen ? "声はおろか、視界にも入らない" : "見渡しても、たぶん届かない距離"}
            size={32}
          />
        </svg>
      </Frame>
    );
  }
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "満員の東京ドーム、6回ぶん"} />
      <svg width={W} height={H}>
        {Array.from({ length: 6 }).map((_, i) => {
          const pop = appearAt(frame, fps, 10 + i * 6);
          const x = 430 + (i % 3) * 380;
          const y = 380 + Math.floor(i / 3) * 280;
          const last = i === 5;
          return (
            <g key={i} opacity={pop}>
              {/* ドーム */}
              <path d={`M ${x - 130} ${y + 60} Q ${x} ${y - 90} ${x + 130} ${y + 60} Z`} fill="none" stroke={SP.line} strokeWidth={6} strokeLinejoin="round" />
              <path d={`M ${x - 130} ${y + 60} L ${x + 130} ${y + 60}`} stroke={SP.line} strokeWidth={6} />
              {/* 満員の点々 */}
              {Array.from({ length: 12 }).map((_, j) => (
                <circle key={j} cx={x - 90 + j * 16} cy={y + 40} r={3.5} fill={SP.faint} />
              ))}
              {last && (
                <g opacity={mark}>
                  <circle cx={x} cy={y + 30} r={26} fill="none" stroke={SP.accent} strokeWidth={6} />
                  <circle cx={x} cy={y + 30} r={5} fill={PINK} />
                </g>
              )}
            </g>
          );
        })}
        <SmallLabel x={960} y={830} text="6回見渡して、ようやく1人" size={32} />
      </svg>
    </Frame>
  );
};

// no_deai_proof (行87-88): 「出会いがない」に「数学的に正しい」の判子
export const NoDeaiProofScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const stampAt = Math.round(fps * 1.0);
  const drop = interpolate(frame, [stampAt, stampAt + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const settled = frame >= stampAt + 6;
  const hard = variant >= 1; // 行88: 数字として、本当にない
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (hard ? "数字として、本当にない" : "「出会いがない」は気のせいじゃない")} />
      <svg width={W} height={H}>
        {/* 書類 */}
        <g opacity={a}>
          <rect x={560} y={280} width={800} height={460} rx={12} fill="#FFFFFF" opacity={0.07} />
          <rect x={560} y={280} width={800} height={460} rx={12} fill="none" stroke={SP.line} strokeWidth={5} />
          <text x={960} y={420} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={62} fontWeight={700} fill={SP.ink}>
            「出会いがない」
          </text>
          <path d="M 640 500 L 1280 500" stroke={SP.faint} strokeWidth={4} />
        </g>
        {/* 判子 (上から落ちてドン) */}
        <g opacity={a} transform={`translate(0, ${(1 - drop) * -160})`}>
          <g transform="rotate(-9 960 620)">
            <circle cx={960} cy={620} r={92} fill="none" stroke={SP.accent} strokeWidth={7} opacity={drop} />
            <text x={960} y={602} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={800} fill={SP.accent} opacity={drop}>
              数学的に
            </text>
            <text x={960} y={650} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={800} fill={SP.accent} opacity={drop}>
              正しい
            </text>
          </g>
        </g>
        {settled && hard && (
          <g opacity={appearAt(frame, fps, stampAt + 14)}>
            <SmallLabel x={960} y={810} text="慰めではなく、計算の結果" size={32} color={SP.ink} weight={700} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// hope_slit (行91-93): 閉じた扉が横にすーっと開き、光の道が差しこむ (章末の引き)
export const HopeSlitScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // v0: 閉じた扉 (絶望?) / v1: 扉が開きはじめる / v2: 大きく開いて光の道
  const openEase = interpolate(frame, [fps * 0.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const open = variant === 0 ? 0 : variant === 1 ? openEase * 90 : 90 + openEase * 150; // 扉のスライド量 (px)
  const lightT = variant === 0 ? 0 : variant === 1 ? openEase * 0.55 : 0.55 + openEase * 0.45;
  const gapHalf = 10 + open; // 中央からの開き幅
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (variant >= 2 ? "美しい抜け道が、あります" : variant >= 1 ? "絶望は、まだ早い" : "絶望するしかない?")} />
      <svg width={W} height={H}>
        {/* 奥から差す光と、床にのびる光の道 */}
        {lightT > 0 && (
          <g>
            {/* 扉のすき間の光 */}
            <rect x={960 - gapHalf} y={240} width={gapHalf * 2} height={560} fill={KC.yellow} opacity={lightT * 0.55} />
            {/* 床に広がる光の道 (手前へ台形に) */}
            <path
              d={`M ${960 - gapHalf} 800 L ${960 + gapHalf} 800 L ${960 + gapHalf * 3.2} 1000 L ${960 - gapHalf * 3.2} 1000 Z`}
              fill={KC.yellow}
              opacity={lightT * 0.35}
            />
            {/* 放射の光線 */}
            <path
              d={`M 960 520 L ${700 - open} 300 M 960 520 L ${1220 + open} 300 M 960 520 L ${640 - open} 540 M 960 520 L ${1280 + open} 540`}
              stroke={KC.yellow}
              strokeWidth={5}
              opacity={lightT * 0.6}
              strokeLinecap="round"
            />
          </g>
        )}
        {/* 横開きの扉 (2枚が左右にスライド) */}
        <g opacity={a}>
          {/* 扉の枠 */}
          <rect x={430} y={230} width={1060} height={580} fill="none" stroke={SP.line} strokeWidth={6} />
          {/* 左の扉 */}
          <g transform={`translate(${-open}, 0)`}>
            <rect x={440} y={240} width={510 - 10} height={560} fill={SP.panel} stroke={SP.dim} strokeWidth={4} />
            <circle cx={900} cy={530} r={10} fill="none" stroke={SP.dim} strokeWidth={4} />
          </g>
          {/* 右の扉 */}
          <g transform={`translate(${open}, 0)`}>
            <rect x={970} y={240} width={510} height={560} fill={SP.panel} stroke={SP.dim} strokeWidth={4} />
            <circle cx={1020} cy={530} r={10} fill="none" stroke={SP.dim} strokeWidth={4} />
          </g>
          {variant === 0 && (
            <text x={960} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={110} fill={SP.faint}>
              ……
            </text>
          )}
        </g>
        {/* 扉の前に立つ人 */}
        <g opacity={a}>
          <circle cx={700} cy={860} r={22} fill="none" stroke={SP.line} strokeWidth={5} />
          <path
            d="M 700 882 L 700 950 M 700 904 L 682 930 M 700 904 L 718 930 M 700 950 L 686 1000 M 700 950 L 714 1000"
            stroke={SP.line}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </g>
        {variant >= 2 && <SmallLabel x={960} y={880} text="次章: 掛け算の抜け道" size={30} color={KC.yellow} />}
      </svg>
    </Frame>
  );
};

// ===== 第3章 掛け算の抜け道 (黒モード) =====

// formula_seven の7要素 (要素名+数値+色)。第2章のカウントダウンと同じ順
const FS_TERMS = [
  { name: "性別", num: "1/2", color: "#5B8DD9" },
  { name: "年齢", num: "1/7", color: KC.yellow },
  { name: "独身", num: "1/2", color: PINK },
  { name: "価値観", num: "1/3", color: KC.green },
  { name: "外見", num: "1/20", color: "#B48CDB" },
  { name: "両想い", num: "1/20", color: SP.accentSoft },
  { name: "相性", num: "1/10", color: KC.orange },
] as const;

// formula_seven (行95-98, 101): 7枚の2段カード (要素名+数値)。
// v0 もう一度式を見る / v1 40人=7つの掛け算 / v2 強力な性質 /
// v3 1個を×2するとドミノ状に伝わり答えも×2 (80は見せない=クイズのネタバレ防止) / v4 答えは80人 (40→80カウントアップ)
export const FormulaSevenScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const domino = variant === 3; // 行98: どれかひとつを2倍に (抽象)
  const answer80 = variant === 4; // 行101: 答えは、80人
  const hotIndex = answer80 ? 1 : domino ? 3 : -1; // v4は年齢 (クイズの答え)、v3は価値観で抽象的に
  const hotAt = Math.round(fps * 0.7);
  const hotIn = appearAt(frame, fps, hotAt);
  // v4: 40→80 のカウントアップ
  const countUp = Math.round(interpolate(frame, [fps * 0.9, fps * 1.9], [40, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Frame>
      <DiagramTitle
        text={
          scene?.title ??
          (answer80
            ? "答えは、80人"
            : domino
              ? "1個を×2 → 答えもまるごと×2"
              : variant >= 2
                ? "掛け算の、強力な性質"
                : variant >= 1
                  ? "40人 = 7つの数字の掛け算"
                  : "もう一度、式を見る")
        }
      />
      <svg width={W} height={H}>
        {/* 7枚の2段カード */}
        {FS_TERMS.map((t, i) => {
          const x = 285 + i * 200;
          const popIn = appearAt(frame, fps, variant === 0 ? 8 + i * 5 : 8);
          const hot = i === hotIndex;
          // v3: ドミノの光が hotIndex から左右の隣へ順に伝わる
          const dominoDelay = hotAt + 10 + Math.abs(i - 3) * 6;
          const dominoPulse = domino && !hot ? appearAt(frame, fps, dominoDelay) : 0;
          const stroke = hot ? SP.accent : t.color;
          return (
            <g key={i} opacity={popIn}>
              <rect
                x={x}
                y={400}
                width={168}
                height={160}
                rx={14}
                fill={hot && hotIn > 0.5 ? SP.panel : "none"}
                stroke={stroke}
                strokeWidth={hot ? 7 : dominoPulse > 0.3 ? 6 : 4}
                opacity={hot ? Math.max(0.4, hotIn) : 0.55 + dominoPulse * 0.45 + (domino ? 0 : 0.45)}
              />
              {/* 上段: 要素名 */}
              <text x={x + 84} y={448} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={27} fontWeight={700} fill={t.color}>
                {t.name}
              </text>
              <path d={`M ${x + 24} 468 L ${x + 144} 468`} stroke={t.color} strokeWidth={2.5} opacity={0.5} />
              {/* 下段: 数値 (hotなら×2) */}
              <text
                x={x + 84}
                y={530}
                textAnchor="middle"
                fontFamily={SUURI_SERIF}
                fontSize={40}
                fontWeight={hot ? 800 : 400}
                fill={hot && hotIn > 0.5 ? SP.accent : SP.ink}
              >
                {hot && hotIn > 0.5 ? "×2" : t.num}
              </text>
              {/* ドミノの波紋 */}
              {domino && !hot && dominoPulse > 0 && dominoPulse < 1 && (
                <rect x={x - 8} y={392} width={184} height={176} rx={18} fill="none" stroke={KC.yellow} strokeWidth={4} opacity={(1 - dominoPulse) * 0.8} />
              )}
              {i < 6 && (
                <text x={x + 184} y={492} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={34} fill={SP.faint}>
                  ×
                </text>
              )}
            </g>
          );
        })}
        {/* 答え */}
        <g opacity={a}>
          <path d="M 960 600 L 960 660 M 960 660 l -18 -24 M 960 660 l 18 -24" stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round" />
          {answer80 ? (
            <text x={960} y={790} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={110} fontWeight={800} fill={countUp >= 80 ? SP.accent : SP.ink}>
              {countUp}人
            </text>
          ) : domino ? (
            <g opacity={appearAt(frame, fps, hotAt + 34)}>
              <text x={860} y={780} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={84} fontWeight={700} fill={SP.ink}>
                答え
              </text>
              <text x={1090} y={780} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={84} fontWeight={800} fill={SP.accent}>
                ×2
              </text>
            </g>
          ) : (
            <text x={960} y={780} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={96} fontWeight={700} fill={SP.ink}>
              40人
            </text>
          )}
          {answer80 && countUp >= 80 && (
            <SmallLabel x={1300} y={770} text="(まるごと2倍)" size={32} />
          )}
        </g>
        {variant === 2 && <SmallLabel x={960} y={860} text="どれかひとつを動かすと……?" size={32} />}
      </svg>
    </Frame>
  );
};

// slider_up (行100-102): 条件スライダーを緩める → 点が倍々に増える (80→160→300)
export const SliderUpScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const stage = Math.min(2, variant); // 0: 80人 / 1: 160人 / 2: 300人超 (関東へ)
  const counts = [80, 160, 300];
  const prevCounts = [40, 80, 160]; // 前のシーンの人数から増える (グラフの連続性)
  const labels = ["年齢を 上下10歳 に", "「話してみたら好きかも」まで", "通える関東圏まで"];
  // 緩めている要素の名前と色 (式のカードと同じ色)
  const terms = [
    { name: "年齢", color: KC.yellow },
    { name: "外見", color: "#B48CDB" },
    { name: "地域", color: KC.skyBlue },
  ];
  const knobT = interpolate(frame, [fps * 0.3, fps * 1.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const knobX = 620 + (stage + knobT) * 220;
  const dotN = Math.round((counts[stage] / 300) * 150);
  const prevN = Math.round((prevCounts[stage] / 300) * 150);
  // stage 2: 東京から関東へグワッと広がる円
  const spread = stage === 2 ? interpolate(frame, [fps * 0.5, fps * 1.8], [40, 330], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 0;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? `緩めると: ${counts[stage]}人${stage === 2 ? "超" : ""}`} />
      <svg width={W} height={H}>
        {/* スライダー+要素名チップ */}
        <g opacity={a}>
          <g>
            <rect x={380} y={262} width={150} height={76} rx={12} fill="none" stroke={terms[stage].color} strokeWidth={5} />
            <text x={455} y={312} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={34} fontWeight={800} fill={terms[stage].color}>
              {terms[stage].name}
            </text>
          </g>
          <path d="M 600 300 L 1360 300" stroke={SP.dim} strokeWidth={10} strokeLinecap="round" />
          <path d={`M 600 300 L ${Math.min(knobX, 1360)} 300`} stroke={terms[stage].color} strokeWidth={10} strokeLinecap="round" />
          <circle cx={Math.min(knobX, 1360)} cy={300} r={26} fill={SP.background} stroke={terms[stage].color} strokeWidth={7} />
          <SmallLabel x={620} y={250} text="きつい" size={26} />
          <SmallLabel x={1360} y={250} text="ゆるい" size={26} />
          <SmallLabel x={960} y={380} text={labels[stage]} size={32} color={SP.ink} weight={700} />
        </g>
        {/* 関東地図 (stage 2 のみ): 東京の点から円がグワッと広がる */}
        {stage === 2 && (
          <g opacity={a * 0.85}>
            <path
              d="M 760 460 Q 900 420 1050 450 Q 1180 430 1240 520 Q 1280 610 1190 680 Q 1080 740 950 710 Q 820 740 740 660 Q 680 570 760 460 Z"
              fill="none"
              stroke={SP.line}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            {/* 東京の点 (地図の見た目の中心に合わせる) */}
            <circle cx={960} cy={585} r={10} fill={KC.skyBlue} />
            <SmallLabel x={960} y={641} text="東京" size={24} />
            {/* 広がる円 */}
            <circle cx={960} cy={585} r={spread} fill={KC.skyBlue} opacity={0.12} />
            <circle cx={960} cy={585} r={spread} fill="none" stroke={KC.skyBlue} strokeWidth={5} opacity={0.8} />
            <SmallLabel x={1300} y={740} text="関東圏" size={28} />
          </g>
        )}
        {/* 増える点: 前の人数ぶんは最初から、増えたぶんがポポポン */}
        {Array.from({ length: dotN }).map((_, i) => {
          const isOld = i < prevN;
          const pop = isOld ? a : appearAt(frame, fps, 14 + jitter(i, 61) * fps * 1.2);
          const x = 700 + jitter(i, 62) * 520;
          const y = 460 + jitter(i, 63) * 260;
          return <circle key={i} cx={x} cy={y} r={8} fill={PINK} opacity={pop} />;
        })}
        {/* カウンター */}
        <g opacity={appearAt(frame, fps, Math.round(fps * 1.2))}>
          <text x={1560} y={620} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={92} fontWeight={700} fill={SP.accent}>
            {counts[stage]}人{stage === 2 ? "超" : ""}
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// jouken_vanish (行103-107): 理想の吹き出し → 群衆がゴソッと消える「はい、消えました」
export const JoukenVanishScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // v0: 逆のことも言えます / v1: 年収の吹き出し / v2: ゴソッと消える / v3: 身長の吹き出し / v4: また消える
  const bubble = variant === 1 || variant === 3 ? "appear" : variant === 2 || variant === 4 ? "stay" : "none";
  const bubbleText = variant <= 2 ? "年収は、1000万円以上" : "身長は、180センチ以上";
  const vanishing = variant === 2 || variant === 4;
  const keepFrac = variant === 2 ? 0.25 : variant === 4 ? 0.12 : 1;
  // 常設の人数カウンタ (右上): 300 → 120 (v2で減る) → 50 (v4で減る)
  const counterNow =
    variant <= 1
      ? 300
      : variant === 2
        ? Math.round(interpolate(frame, [fps * 0.5, fps * 1.6], [300, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
        : variant === 3
          ? 120
          : Math.round(interpolate(frame, [fps * 0.5, fps * 1.6], [120, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Frame>
      <DiagramTitle
        text={scene?.title ?? (vanishing ? "はい、消えました" : bubble === "appear" ? "理想を、ひとこと" : "逆のことも、言えます")}
      />
      <svg width={W} height={H}>
        {/* 常設カウンタ (右上) */}
        <g opacity={a}>
          <rect x={1460} y={200} width={340} height={110} rx={14} fill={SP.panel} stroke={vanishing ? SP.accent : SP.line} strokeWidth={5} />
          <text x={1630} y={254} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={24} fill={SP.faint}>
            いまの候補
          </text>
          <text x={1630} y={296} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={40} fontWeight={800} fill={vanishing ? SP.accent : SP.ink}>
            {counterNow}人
          </text>
        </g>
        {/* 吹き出し */}
        {bubble !== "none" && (
          <g opacity={a}>
            <rect x={530} y={210} width={760} height={100} rx={50} fill="#FFFFFF" opacity={0.1} />
            <rect x={530} y={210} width={760} height={100} rx={50} fill="none" stroke={SP.ink} strokeWidth={5} />
            <path d="M 830 310 L 810 360 L 890 316" fill={SP.background} stroke={SP.ink} strokeWidth={5} strokeLinejoin="round" />
            <text x={930} y={275} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={38} fontWeight={700} fill={SP.ink}>
              「{bubbleText}」
            </text>
            {variant <= 2 ? (
              // 札束アイコン (年収)
              <g transform="translate(440, 260)" stroke={KC.green} strokeWidth={4} fill="none">
                <rect x={-36} y={-20} width={72} height={40} rx={5} />
                <circle cx={0} cy={0} r={11} />
                <path d="M -36 -10 h 72 M -36 10 h 72" opacity={0.5} />
              </g>
            ) : (
              // 身長計アイコン (身長)
              <g transform="translate(440, 260)" stroke={KC.skyBlue} strokeWidth={4} fill="none">
                <path d="M -10 -28 L -10 28 M -10 -22 h 14 M -10 -10 h 10 M -10 2 h 14 M -10 14 h 10 M -10 26 h 14" />
                <path d="M 20 28 L 20 6 M 20 6 a 8 8 0 1 1 0.01 0" strokeWidth={3.5} />
              </g>
            )}
          </g>
        )}
        {variant === 0 && (
          <g opacity={a}>
            <path d="M 960 260 L 960 330 M 960 260 l -20 26 M 960 260 l 20 26" stroke={SP.accent} strokeWidth={7} fill="none" strokeLinecap="round" transform="rotate(180 960 295)" />
            <SmallLabel x={960} y={240} text="条件を足すと、どうなる?" size={34} color={SP.ink} weight={700} />
          </g>
        )}
        {/* 群衆 */}
        {Array.from({ length: 120 }).map((_, i) => {
          const col = i % 20;
          const row = Math.floor(i / 20);
          const x = 430 + col * 56 + (jitter(i, 71) - 0.5) * 12;
          const y = 440 + row * 62 + (jitter(i, 72) - 0.5) * 10;
          const survive = jitter(i, 73) < keepFrac;
          if (!vanishing || survive) {
            return (
              <g key={i} opacity={a} stroke={vanishing ? PINK : SP.line} strokeWidth={3.5} fill="none">
                <circle cx={x} cy={y} r={10} />
                <path d={`M ${x} ${y + 10} L ${x} ${y + 34}`} />
              </g>
            );
          }
          const delay = Math.round(fps * 0.4 + jitter(i, 74) * fps * 0.8);
          const gone = interpolate(frame, [delay, delay + 7], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={i} opacity={a * 0.6 * gone} stroke={SP.faint} strokeWidth={3.5} fill="none" transform={`translate(0, ${(1 - gone) * 30})`}>
              <circle cx={x} cy={y} r={10 * gone} />
              <path d={`M ${x} ${y + 10} L ${x} ${y + 34 * gone}`} />
            </g>
          );
        })}
        {vanishing && (
          <g opacity={appearAt(frame, fps, Math.round(fps * 1.3))}>
            <SmallLabel x={960} y={860} text={variant === 2 ? "数十万人が、消えました" : "また大勢、消えました"} size={32} color={SP.accent} weight={700} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// gyakumodori (行108-109): メーターが300→40に逆回転
export const GyakumodoriScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const back = variant >= 1; // 行111: 理想3つで300人は40人に逆戻り
  // v1: 理想タグが1枚貼られるたびに、針がガクンと落ちる (300→160→80→40)
  const tagTimes = [Math.round(fps * 0.5), Math.round(fps * 1.3), Math.round(fps * 2.1)];
  const drop = 8; // 落ちるのにかかるフレーム
  const num = back
    ? Math.round(
        interpolate(
          frame,
          [tagTimes[0], tagTimes[0] + drop, tagTimes[1], tagTimes[1] + drop, tagTimes[2], tagTimes[2] + drop],
          [300, 160, 160, 80, 80, 40],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      )
    : 300;
  const angle = -80 + ((num - 40) / 260) * 160; // 40側 (左) 〜 300側 (右)
  const tagLabels = ["理想①", "理想②", "理想③"];
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (back ? "理想3つで、40人に逆戻り" : "掛け算は、容赦なく削る")} />
      <svg width={W} height={H}>
        <g opacity={a}>
          {/* 半円メーター */}
          <path d="M 560 660 A 400 400 0 0 1 1360 660" fill="none" stroke={SP.line} strokeWidth={8} />
          <SmallLabel x={540} y={720} text="40人" size={36} color={SP.ink} weight={700} />
          <SmallLabel x={1380} y={720} text="300人" size={36} color={PINK} weight={700} />
          {/* 針 (赤) がガクンガクンと逆回転 */}
          <g transform={`rotate(${angle} 960 660)`}>
            <path d="M 960 660 L 960 310" stroke={SP.accent} strokeWidth={10} strokeLinecap="round" />
          </g>
          <circle cx={960} cy={660} r={18} fill={SP.accent} />
          <text x={960} y={800} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={76} fontWeight={700} fill={SP.accent}>
            {num}人
          </text>
        </g>
        {/* v1: 理想タグがペタ、ペタ、ペタと貼られる */}
        {back &&
          tagLabels.map((label, k) => {
            const tagIn = appearAt(frame, fps, tagTimes[k]);
            const x = 430 + k * 360;
            const rot = [-7, 5, -4][k];
            const pop = 1 + (1 - Math.min(1, Math.max(0, (frame - tagTimes[k]) / 6))) * 0.3;
            return (
              <g key={k} opacity={tagIn} transform={`rotate(${rot} ${x + 110} 250) translate(${x + 110} 250) scale(${pop}) translate(${-(x + 110)} -250)`}>
                <rect x={x} y={210} width={220} height={80} rx={10} fill={SP.panel} stroke={SP.accent} strokeWidth={5} />
                <text x={x + 110} y={264} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={36} fontWeight={800} fill={SP.accent}>
                  {label}
                </text>
              </g>
            );
          })}
      </svg>
    </Frame>
  );
};

// hensu_card (行110-111): 「定数ではなく変数」。数字がくるくる変わる
export const HensuCardScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const vals = [26, 40, 80, 300]; // この動画に出てきた数字がスロットのように回る
  const cur = vals[Math.floor(frame / Math.round(fps * 0.5)) % vals.length];
  const isX = variant >= 1; // 行113: あなたの設定が決める変数
  const stampAt = Math.round(fps * 1.1);
  const stampIn = interpolate(frame, [stampAt, stampAt + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (isX ? "あなたの設定が決める、変数" : "天が決めた定数では、ない")} />
      <svg width={W} height={H}>
        <g opacity={a}>
          <rect x={560} y={300} width={800} height={420} rx={20} fill={SP.panel} stroke={SP.line} strokeWidth={6} />
          <text x={960} y={400} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={38} fill={SP.faint}>
            運命の人の数 =
          </text>
          {isX ? (
            <>
              <text x={960} y={580} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={170} fontWeight={700} fill={SP.accent}>
                x
              </text>
              <SmallLabel x={960} y={670} text="(変数)" size={32} />
            </>
          ) : (
            <>
              <text x={960} y={590} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={140} fontWeight={700} fill={SP.ink}>
                {cur}人
              </text>
              {/* くるくる矢印 */}
              <path d="M 1270 480 a 60 60 0 1 1 -18 -44 M 1252 436 l 22 -4 M 1252 436 l 0 24" stroke={SP.faint} strokeWidth={5} fill="none" strokeLinecap="round" />
            </>
          )}
        </g>
        {/* v0: 「定数」に赤い× / v1: 「変数」の丸スタンプがドン */}
        {!isX ? (
          <g opacity={appearAt(frame, fps, stampAt)}>
            <text x={1540} y={520} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={54} fontWeight={700} fill={SP.faint}>
              定数
            </text>
            <path d="M 1468 460 L 1612 548 M 1612 460 L 1468 548" stroke={SP.accent} strokeWidth={9} strokeLinecap="round" />
          </g>
        ) : (
          <g opacity={stampIn} transform={`translate(0, ${(1 - stampIn) * -120})`}>
            <g transform="rotate(-10 1540 520)">
              <circle cx={1540} cy={520} r={96} fill="none" stroke={SP.accent} strokeWidth={7} />
              <text x={1540} y={540} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={48} fontWeight={800} fill={SP.accent}>
                変数
              </text>
            </g>
          </g>
        )}
        <SmallLabel x={960} y={810} text={isX ? "設定しだいで、増えも減りもする" : "数字は、固定ではない"} size={32} />
      </svg>
    </Frame>
  );
};

// backus_26 (行112-113): イギリス地図にぽつんと26人
export const Backus26Scene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const showNum = variant >= 1; // 行113: イギリス全土で、わずか26人
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (showNum ? "イギリス全土で、26人" : "ちなみに、本人はもっと厳しい")} />
      <svg width={W} height={H}>
        {/* イギリス (ブリテン島) のゆるい形 */}
        <g opacity={a}>
          <path
            d="M 900 240 Q 960 220 990 270 Q 1030 300 1010 360 Q 1050 400 1030 460 Q 1080 520 1050 590 Q 1090 660 1040 720 Q 980 780 910 750 Q 850 770 820 710 Q 780 660 810 600 Q 770 540 810 480 Q 790 420 830 370 Q 820 300 870 270 Q 880 250 900 240 Z"
            fill="none"
            stroke={SP.line}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          {/* アイルランドの端 */}
          <path d="M 720 480 Q 760 450 780 500 Q 790 560 740 590 Q 700 570 700 520 Q 700 490 720 480 Z" fill="none" stroke={SP.dim} strokeWidth={4} />
          <SmallLabel x={930} y={850} text="イギリス" size={30} />
          {/* ユニオンジャック (左側の目印) */}
          <g>
            <path d="M 408 296 L 408 560" stroke={SP.line} strokeWidth={6} strokeLinecap="round" />
            <g transform="translate(414, 300)">
              <rect x={0} y={0} width={250} height={150} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
              {/* 斜め十字 */}
              <path d="M 4 4 L 246 146 M 246 4 L 4 146" stroke="#E8E8E8" strokeWidth={18} opacity={0.9} />
              <path d="M 4 4 L 246 146 M 246 4 L 4 146" stroke={SP.accent} strokeWidth={7} />
              {/* 十字 */}
              <path d="M 125 0 L 125 150 M 0 75 L 250 75" stroke="#E8E8E8" strokeWidth={28} opacity={0.9} />
              <path d="M 125 0 L 125 150 M 0 75 L 250 75" stroke={SP.accent} strokeWidth={15} />
              <rect x={0} y={0} width={250} height={150} fill="none" stroke={SP.line} strokeWidth={5} />
            </g>
          </g>
        </g>
        {/* ぽつんと26人 */}
        {showNum &&
          Array.from({ length: 26 }).map((_, i) => {
            const pop = appearAt(frame, fps, 16 + i * 2.5);
            const x = 840 + jitter(i, 81) * 170;
            const y = 320 + jitter(i, 82) * 380;
            return <circle key={i} cx={x} cy={y} r={6.5} fill={PINK} opacity={pop} />;
          })}
        {showNum && (
          <g opacity={appearAt(frame, fps, Math.round(fps * 1.4))}>
            <text x={1420} y={540} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={130} fontWeight={700} fill={PINK}>
              26人
            </text>
            <SmallLabel x={1420} y={620} text="彼の彼女候補" size={30} />
          </g>
        )}
        {!showNum && (
          <g opacity={appearAt(frame, fps, 24)}>
            <SmallLabel x={1420} y={520} text="バッカス本人の条件は" size={32} />
            <SmallLabel x={1420} y={580} text="もっと、きびしい" size={36} color={SP.ink} weight={700} />
          </g>
        )}
      </svg>
    </Frame>
  );
};

// alien_scale (行114-116): 天秤。宇宙人の文明1万 vs 彼女候補26人。宇宙人がすまなそう
export const AlienScaleScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const tilt = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const compare = variant >= 1; // 行117: 400倍近く多い
  const publish = variant >= 2; // 行118: 堂々と発表
  if (compare) {
    // v1以降: 天秤をやめて「宇宙人 > 彼女候補」の不等号でシンプルに
    const gtIn = appearAt(frame, fps, Math.round(fps * 0.8));
    const timesIn = appearAt(frame, fps, Math.round(fps * 1.4));
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? (publish ? "この結果を、堂々と発表" : "宇宙人のほうが、400倍多い")} />
        <svg width={W} height={H}>
          {/* 左: 宇宙人の文明 (たくさん) */}
          <g opacity={a}>
            {Array.from({ length: 9 }).map((_, i) => (
              <Alien key={i} x={400 + (i % 3) * 115} y={330 + Math.floor(i / 3) * 105} scale={0.42} color={KC.lime} face="smile" />
            ))}
            <text x={515} y={690} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={74} fontWeight={800} fill={KC.lime}>
              1万個
            </text>
            <SmallLabel x={515} y={752} text="宇宙人の文明" size={30} color={KC.lime} weight={700} />
          </g>
          {/* 中央: 不等号 */}
          <g opacity={gtIn}>
            <text x={960} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={190} fontWeight={800} fill={SP.accent}>
              &gt;
            </text>
          </g>
          {/* 右: 彼女候補 26人 (ぽつぽつ) */}
          <g opacity={a}>
            {Array.from({ length: 26 }).map((_, i) => {
              const x = 1310 + jitter(i, 83) * 230;
              const y = 320 + jitter(i, 84) * 250;
              return <circle key={i} cx={x} cy={y} r={7} fill={PINK} />;
            })}
            <text x={1425} y={690} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={74} fontWeight={800} fill={PINK}>
              26人
            </text>
            <SmallLabel x={1425} y={752} text="彼の彼女候補" size={30} color={PINK} weight={700} />
          </g>
          {/* 下: 約400倍 */}
          <g opacity={timesIn}>
            <text x={960} y={810} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={64} fontWeight={700} fill={SP.accent}>
              約400倍
            </text>
          </g>
          {/* すまなそうな宇宙人 */}
          <g opacity={appearAt(frame, fps, 24)}>
            <Alien x={190} y={680} scale={0.6} color={KC.lime} face="sorry" />
            {publish && (
              <text x={190} y={800} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={26} fill={SP.faint}>
                「なんか、ごめん」
              </text>
            )}
          </g>
        </svg>
      </Frame>
    );
  }
  // 皿のカーブ (M x0 450 Q x0+100 530 x0+200 450) 上の y 座標
  const panY = (x: number, x0: number) => {
    const t = (x - x0) / 200;
    return 450 + 160 * t * (1 - t);
  };
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "宇宙人の文明: 1万個"} />
      <svg width={W} height={H}>
        <g opacity={a}>
          {/* 支柱 */}
          <path d="M 960 700 L 960 360 M 860 700 L 1060 700" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
          {/* 竿 (宇宙人側が下がる) */}
          <g transform={`rotate(${tilt} 960 380)`}>
            <path d="M 560 380 L 1360 380" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
            {/* 左皿: 宇宙人ぎっしり (皿のカーブに載せる) */}
            <path d="M 560 380 L 560 450" stroke={SP.line} strokeWidth={5} />
            <path d="M 460 450 Q 560 530 660 450" fill="none" stroke={SP.line} strokeWidth={6} />
            {Array.from({ length: 11 }).map((_, i) => {
              const row = i < 6 ? 0 : 1;
              const k = row === 0 ? i : i - 6;
              const x = row === 0 ? 485 + k * 30 : 503 + k * 30;
              const y = panY(x, 460) - 11 - row * 22;
              return (
                <g key={i} transform={`translate(${x}, ${y}) scale(0.22)`}>
                  <ellipse rx={52} ry={46} fill="none" stroke={KC.lime} strokeWidth={14} />
                  <path d="M -22 -40 Q -34 -66 -44 -74 M 22 -40 Q 34 -66 44 -74" stroke={KC.lime} strokeWidth={12} fill="none" strokeLinecap="round" />
                </g>
              );
            })}
            {/* 右皿: 26人ぽつぽつ (皿のカーブに載せる) */}
            <path d="M 1360 380 L 1360 450" stroke={SP.line} strokeWidth={5} />
            <path d="M 1260 450 Q 1360 530 1460 450" fill="none" stroke={SP.line} strokeWidth={6} />
            {Array.from({ length: 5 }).map((_, i) => {
              const x = 1310 + i * 25;
              return <circle key={i} cx={x} cy={panY(x, 1260) - 8} r={7} fill={PINK} />;
            })}
          </g>
          <SmallLabel x={560} y={620} text="宇宙人の文明 1万個" size={30} color={KC.lime} weight={700} />
          <SmallLabel x={1380} y={620} text="彼女候補 26人" size={30} color={PINK} weight={700} />
        </g>
        {/* すまなそうな宇宙人 */}
        <g opacity={appearAt(frame, fps, 24)}>
          <Alien x={300} y={760} scale={0.8} color={KC.lime} face="sorry" />
        </g>
      </svg>
    </Frame>
  );
};

// backus_proud (行118): 切ない結果を、堂々と世界に発表。論文を高く掲げるバッカス+苦笑いの学者たち
export const BackusProudScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const raise = interpolate(frame, [fps * 0.4, fps * 1.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const crowd = appearAt(frame, fps, Math.round(fps * 1.2));
  const lift = raise * 90; // 論文を持ち上げる量
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "この結果を、堂々と発表"} />
      <svg width={W} height={H}>
        {/* 演台 */}
        <g opacity={a}>
          <path d="M 560 760 L 900 760 L 880 900 L 580 900 Z" fill={SP.panel} stroke={SP.line} strokeWidth={5} strokeLinejoin="round" />
        </g>
        {/* バッカス (眼鏡、胸を張って論文を高く掲げる) */}
        <g opacity={a} stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
          <circle cx={730} cy={520} r={50} />
          <circle cx={712} cy={512} r={14} />
          <circle cx={748} cy={512} r={14} />
          <path d="M 726 512 L 734 512" />
          {/* 誇らしげな口 (にっこり) */}
          <path d="M 714 552 Q 730 564 746 552" />
          {/* 胸を張った体 */}
          <path d="M 700 760 q -6 -140 30 -190 q 36 50 30 190" strokeLinejoin="round" />
          {/* 左腕は腰、右腕は論文を高く */}
          <path d="M 706 620 L 664 680" />
          <path d={`M 754 620 L ${800} ${560 - lift}`} />
        </g>
        {/* 掲げた論文 */}
        <g opacity={a} transform={`translate(0, ${-lift}) rotate(${8 - raise * 8} 850 540)`}>
          <rect x={790} y={480} width={130} height={150} rx={6} fill="#FFFFFF" opacity={0.1} />
          <rect x={790} y={480} width={130} height={150} rx={6} fill="none" stroke={SP.accent} strokeWidth={5} />
          <path d="M 808 516 h 94 M 808 548 h 94 M 808 580 h 64" stroke={SP.faint} strokeWidth={4} />
        </g>
        <SmallLabel x={1100} y={520} text="バッカス、堂々の発表" size={28} />
        {/* 苦笑いの学者たち */}
        <g opacity={crowd} stroke={SP.faint} strokeWidth={4.5} fill="none" strokeLinecap="round">
          {[1240, 1420, 1600].map((x, i) => {
            const y = 640 + (i % 2) * 24;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={38} />
                {/* 困り眉+苦笑い */}
                <path d={`M ${x - 22} ${y - 14} q 10 -8 18 -2 M ${x + 4} ${y - 16} q 10 -6 18 2`} />
                <path d={`M ${x - 16} ${y + 16} q 16 ${i === 1 ? 2 : 10} 32 2`} />
                {/* 汗 */}
                <path d={`M ${x + 44} ${y - 28} q 8 10 0 18`} stroke={KC.skyBlue} />
                <path d={`M ${x - 24} ${y + 50} q 4 -40 24 -46 q 20 6 24 46`} />
              </g>
            );
          })}
        </g>
        <SmallLabel x={1420} y={800} text="学者たち「・・・・・・」" size={26} />
      </svg>
    </Frame>
  );
};

// tsuzuku (行119-120): 「この話には続きがある」→「続きは第4章で」
export const TsuzukuScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 10);
  const next = variant >= 1; // 行118
  return (
    <Frame>
      <svg width={W} height={H}>
        <g opacity={a}>
          <text x={960} y={520} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={72} fontWeight={700} fill={SP.ink}>
            {next ? "つづきは、第4章で" : "この話には、続きがあります"}
          </text>
          <path d="M 760 600 L 1160 600" stroke={next ? SP.accent : SP.faint} strokeWidth={5} strokeLinecap="round" />
          {next && <Heart x={960} y={680} scale={0.5} color={PINK_DEEP} opacity={appearAt(frame, fps, 30)} />}
        </g>
      </svg>
    </Frame>
  );
};

// ===== 第4章 確率は動かせる (黒モード) =====

// zero_prob (行120-122): 300人がいても、間に「出会い0回」の溝
export const ZeroProbScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const trench = variant >= 1; // 行121: 落とし穴
  const zero = variant >= 2; // 行122: 確率はゼロのまま
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (zero ? "出会わなければ、確率ゼロ" : trench ? "ただし、落とし穴" : "40人 → 見直せば300人")} />
      <svg width={W} height={H}>
        {/* 左: あなた */}
        <g opacity={a}>
          <circle cx={430} cy={520} r={26} fill="none" stroke={SP.ink} strokeWidth={5} />
          <path d="M 430 546 L 430 640 M 430 570 L 404 600 M 430 570 L 456 600 M 430 640 L 410 700 M 430 640 L 450 700" stroke={SP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          <SmallLabel x={430} y={760} text="あなた" size={28} color={SP.ink} />
        </g>
        {/* 右: 300人の点 */}
        <g opacity={a}>
          {Array.from({ length: 70 }).map((_, i) => (
            <circle key={i} cx={1240 + jitter(i, 91) * 420} cy={400 + jitter(i, 92) * 320} r={7} fill={PINK} />
          ))}
          <SmallLabel x={1450} y={790} text="300人 (確実にいる)" size={28} color={PINK} />
        </g>
        {/* 間の溝 */}
        {trench && (
          <g opacity={appearAt(frame, fps, 16)}>
            <path d="M 700 360 L 820 360 L 860 820 L 660 820 Z" fill={SP.background} stroke={SP.accent} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 730 420 l 20 60 l -26 54 l 24 60 M 790 420 l -16 64 l 22 58" stroke={SP.dim} strokeWidth={4} fill="none" strokeLinecap="round" />
            <SmallLabel x={760} y={880} text="出会い 0回の溝" size={30} color={SP.accent} weight={700} />
          </g>
        )}
        {zero && (
          <g opacity={appearAt(frame, fps, 28)}>
            <text x={960} y={300} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={84} fontWeight={700} fill={SP.accent}>
              確率 0
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// pitfall (行123): 深い落とし穴に、あなたが落ちる
export const PitfallScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // 歩いてきて、穴に落ちる
  const walkX = interpolate(frame, [fps * 0.3, fps * 1.2], [500, 950], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fall = interpolate(frame, [fps * 1.2, fps * 1.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const fallY = fall * 280;
  const rot = fall * 26;
  const alert = appearAt(frame, fps, Math.round(fps * 1.35));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "ただし、落とし穴"} />
      <svg width={W} height={H}>
        {/* 地面と深い穴 */}
        <g opacity={a}>
          <path d="M 240 590 L 840 590" stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
          <path d="M 1080 590 L 1680 590" stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
          <path d="M 840 590 L 880 880 L 1040 880 L 1080 590" fill={SP.panel} stroke={SP.line} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 905 640 l 16 54 l -20 50 l 18 54 M 1000 640 l -14 58 l 18 52" stroke={SP.dim} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
        {/* 落ちるあなた */}
        <g opacity={a} transform={`translate(${walkX}, ${444 + fallY}) rotate(${rot})`}>
          <circle r={26} fill="none" stroke={SP.ink} strokeWidth={5} />
          <path d="M 0 26 L 0 100 M 0 52 L -26 80 M 0 52 L 26 76 M 0 100 L -22 146 M 0 100 L 24 142" stroke={SP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        {/* ! */}
        <g opacity={alert}>
          <text x={1180} y={440} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={120} fontWeight={800} fill={SP.accent}>
            !
          </text>
          <SmallLabel x={1400} y={530} text="足元に、落とし穴" size={30} color={SP.accent} weight={700} />
        </g>
      </svg>
    </Frame>
  );
};

// fade_words: 言葉が一文字ずつ浮かび上がる (v0=行124「確率はゼロのまま」 / v1=行150「分解すれば見えてくる」)
export const FadeWordsScene: React.FC<SceneProps> = ({ variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = variant >= 1 ? "わからないものは、分解すれば見えてくる" : "出会わなければ、確率はゼロのまま";
  const sub = variant >= 1 ? "宇宙人を探す式がくれた、人生の道具" : "300人が、どこかに確実にいても";
  const chars = Array.from(text);
  const subIn = appearAt(frame, fps, 10);
  const lineIn = appearAt(frame, fps, 16 + chars.length * 3);
  return (
    <Frame>
      <svg width={W} height={H}>
        <g opacity={subIn}>
          <SmallLabel x={960} y={390} text={sub} size={34} color={SP.faint} />
        </g>
        <text x={960} y={580} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={variant >= 1 ? 76 : 82} fontWeight={700}>
          {chars.map((c, i) => (
            <tspan key={i} fill={SP.ink} fillOpacity={appearAt(frame, fps, 16 + i * 3)}>
              {c}
            </tspan>
          ))}
        </text>
        <path d="M 560 646 L 1360 646" stroke={SP.accent} strokeWidth={5} strokeLinecap="round" opacity={lineIn} />
      </svg>
    </Frame>
  );
};

// takarakuji (行125): 売り場の手前で立ち止まり「やっぱやめた」と引き返す人
export const TakarakujiScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // ①右から売り場へ近づく → ②手前で停止「やっぱ、やめた」 → ③引き返す
  const approach = interpolate(frame, [fps * 0.3, fps * 1.3], [1560, 980], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const retreat = interpolate(frame, [fps * 2.5, fps * 3.6], [0, 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const walk = approach + retreat;
  const bubble = interpolate(frame, [fps * 1.4, fps * 1.7, fps * 2.5, fps * 2.8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "買わなければ、当たらない"} />
      <svg width={W} height={H}>
        {/* 売り場 */}
        <g opacity={a}>
          <rect x={360} y={360} width={420} height={360} rx={12} fill="none" stroke={SP.line} strokeWidth={6} />
          <rect x={420} y={450} width={300} height={130} rx={8} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
          <text x={570} y={530} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={800} fill={SP.ink}>
            宝くじ
          </text>
          {/* のぼり (黄色) */}
          <path d="M 330 720 L 330 300" stroke={SP.line} strokeWidth={5} />
          <rect x={250} y={310} width={80} height={260} fill={KC.yellow} opacity={0.9} />
          <text x={290} y={360} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={30} fontWeight={800} fill={SP.background} writingMode="vertical-rl" style={{ writingMode: "vertical-rl" } as React.CSSProperties}>
            大当り
          </text>
        </g>
        {/* 立ち止まって引き返す人 */}
        <g opacity={a} transform={`translate(${walk}, 520)`}>
          <circle r={24} fill="none" stroke={SP.ink} strokeWidth={5} />
          <path d="M 0 24 L 0 110 M 0 50 L -24 76 M 0 50 L 24 70 M 0 110 L -22 170 M 0 110 L 24 166" stroke={SP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        {/* 吹き出し「やっぱ、やめた」 */}
        <g opacity={bubble}>
          <rect x={860} y={330} width={400} height={104} rx={18} fill={SP.panel} stroke={SP.line} strokeWidth={4} />
          <path d="M 970 434 L 988 482 L 1030 434" fill={SP.panel} stroke={SP.line} strokeWidth={4} strokeLinejoin="round" />
          <text x={1060} y={398} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={40} fontWeight={700} fill={SP.ink}>
            やっぱ、やめた
          </text>
        </g>
        <SmallLabel x={960} y={820} text="買わない宝くじの当選確率は、きっかりゼロ" size={32} />
      </svg>
    </Frame>
  );
};

// sofa_family (行124-125): ソファにどっかり座る「家族」。主人公は気まずい顔
export const SofaFamilyScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const family = variant >= 1; // 行125: もし座っていたら、それはもう家族
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (family ? "座っていたら、それは家族" : "運命の人は、ソファにいない")} />
      <svg width={W} height={H}>
        {/* ソファ (オレンジ) */}
        <g opacity={a}>
          <path
            d="M 560 560 L 560 440 Q 560 400 600 400 L 1320 400 Q 1360 400 1360 440 L 1360 560"
            fill="none"
            stroke={KC.orange}
            strokeWidth={8}
            strokeLinejoin="round"
          />
          <rect x={500} y={560} width={920} height={130} rx={26} fill="none" stroke={KC.orange} strokeWidth={8} />
          <path d="M 540 690 L 540 740 M 1380 690 L 1380 740" stroke={KC.orange} strokeWidth={8} strokeLinecap="round" />
        </g>
        {family && (
          <>
            {/* どっかり座る「家族」(お母さん感: おだんご頭+湯のみ)。ソファの真ん中にどっかり */}
            <g opacity={appearAt(frame, fps, 14)} transform="translate(260, 0)" stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
              <circle cx={700} cy={430} r={42} />
              <circle cx={700} cy={376} r={16} />
              <path d="M 680 424 q 6 -8 14 0 M 706 424 q 6 -8 14 0" />
              <path d="M 684 452 Q 700 460 716 452" />
              <path d="M 660 472 Q 630 520 640 560 L 760 560 Q 772 520 740 472" strokeLinejoin="round" />
              <path d="M 740 500 L 800 520" />
              <ellipse cx={820} cy={524} rx={20} ry={14} />
              <path d="M 806 508 q 6 -10 0 -18 M 826 508 q 6 -10 0 -18" opacity={0.6} />
            </g>
            <SmallLabel x={960} y={640} text="家族" size={30} color={SP.ink} weight={700} />
            {/* 気まずい主人公 */}
            <g opacity={appearAt(frame, fps, 30)} stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
              <circle cx={1560} cy={500} r={26} />
              <path d="M 1550 494 L 1558 494 M 1570 494 L 1578 494" strokeWidth={4} />
              <path d="M 1550 516 L 1572 516" strokeWidth={4} />
              <path d="M 1560 526 L 1560 620 M 1560 550 L 1536 580 M 1560 550 L 1584 580 M 1560 620 L 1544 680 M 1560 620 L 1576 680" />
            </g>
          </>
        )}
        <SmallLabel x={960} y={830} text={family ? "それはもう、運命ではなく日常" : "家のソファには、座っていない"} size={32} />
      </svg>
    </Frame>
  );
};

// bunbo_grow (行128-129): 大きな分数。分母「出会う人の数」に赤丸
export const BunboGrowScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // v0: 効いてくるのは分母 (赤丸がグルッ) / v1: 1年に新しく知り合う人の数は?
  const ask = variant >= 1;
  const ringIn = appearAt(frame, fps, ask ? 12 : Math.round(fps * 0.9));
  const askIn = appearAt(frame, fps, Math.round(fps * 1.0));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (ask ? "1年に、何人と知り合う?" : "効いてくるのは、分母")} />
      <svg width={W} height={H}>
        {/* 大きな分数 */}
        <g opacity={a}>
          <text x={430} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={70} fill={SP.ink}>
            当たる確率 =
          </text>
          <text x={1160} y={460} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={66} fill={SP.ink}>
            出会えた運命の人
          </text>
          <path d="M 740 520 L 1580 520" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
          <text x={1160} y={650} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={76} fontWeight={700} fill={SP.ink}>
            出会う人の数
          </text>
        </g>
        {/* 分母に赤丸 */}
        <g opacity={ringIn}>
          <ellipse cx={1160} cy={622} rx={330} ry={86} fill="none" stroke={SP.accent} strokeWidth={7} transform="rotate(-2 1160 622)" />
          <path d="M 1500 680 Q 1580 712 1640 700" stroke={SP.accent} strokeWidth={4} fill="none" />
          <SmallLabel x={1720} y={706} text="分母" size={36} color={SP.accent} weight={700} />
        </g>
        {ask && (
          <g opacity={askIn}>
            <text x={960} y={810} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={44} fontWeight={700} fill={SP.ink}>
              あなたが1年に、新しく知り合うのは
              <tspan fill={SP.accent}> ? </tspan>人
            </text>
          </g>
        )}
        {!ask && <SmallLabel x={960} y={850} text="答えを動かすのは、下の数" size={32} />}
      </svg>
    </Frame>
  );
};

// commute_10 (行130): 職場⇄家を高速で往復する人 + 年10人
export const CommuteTenScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // 三角波で高速往復
  const period = Math.max(1, Math.round(fps * 1.1));
  const ph = (frame % period) / period;
  const tri = ph < 0.5 ? ph * 2 : (1 - ph) * 2;
  const px = 680 + tri * 580;
  const goingRight = ph < 0.5;
  const ten = appearAt(frame, fps, Math.round(fps * 1.2));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "職場と家の、往復だけなら"} />
      <svg width={W} height={H}>
        {/* 職場ビル (左) */}
        <g opacity={a} stroke={SP.line} strokeWidth={6} fill="none" strokeLinejoin="round">
          <rect x={370} y={330} width={240} height={370} />
          {[0, 1, 2].map((r) =>
            [0, 1].map((c) => (
              <rect key={`${r}-${c}`} x={410 + c * 90} y={370 + r * 100} width={70} height={60} stroke={SP.faint} strokeWidth={4} />
            ))
          )}
        </g>
        <SmallLabel x={490} y={770} text="職場" size={32} color={SP.ink} weight={700} />
        {/* 家 (右) */}
        <g opacity={a} stroke={SP.line} strokeWidth={6} fill="none" strokeLinejoin="round">
          <path d="M 1320 520 L 1440 410 L 1560 520 L 1560 700 L 1320 700 Z" />
          <rect x={1412} y={596} width={56} height={104} stroke={SP.faint} strokeWidth={4} />
        </g>
        <SmallLabel x={1440} y={770} text="家" size={32} color={SP.ink} weight={700} />
        {/* 高速で往復する人 */}
        <g opacity={a} transform={`translate(${px}, 580)`} stroke={SP.ink} strokeWidth={5} fill="none" strokeLinecap="round">
          <circle r={20} />
          <path d="M 0 20 L 0 78 M 0 40 L -20 62 M 0 40 L 20 58 M 0 78 L -18 120 M 0 78 L 20 116" />
          {/* スピード線 */}
          <path d={goingRight ? "M -44 0 l -40 0 M -44 34 l -30 0" : "M 44 0 l 40 0 M 44 34 l 30 0"} stroke={SP.faint} strokeWidth={4} />
        </g>
        {/* 往復矢印 */}
        <path
          d="M 680 790 L 1260 790 M 680 790 l 28 -15 M 680 790 l 28 15 M 1260 790 l -28 -15 M 1260 790 l -28 15"
          stroke={SP.dim}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          opacity={a}
        />
        <g opacity={ten}>
          <text x={960} y={880} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={60} fontWeight={700} fill={SP.accent}>
            新しい知り合い、年に約10人
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// work_talk_half (行131): 10人のうち左5人は「仕事の話しか、しない」
export const WorkTalkHalfScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const tagIn = appearAt(frame, fps, Math.round(fps * 1.0));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "半分は、仕事の話だけ"} />
      <svg width={W} height={H}>
        {Array.from({ length: 10 }).map((_, i) => {
          const pop = appearAt(frame, fps, 12 + i * 3);
          const x = 420 + i * 120;
          const isWork = i < 5;
          return (
            <g key={i} opacity={pop} stroke={isWork ? SP.faint : SP.line} strokeWidth={5} fill="none">
              <circle cx={x} cy={520} r={24} />
              <path d={`M ${x - 30} 622 q 4 -46 30 -48 q 26 2 30 48 Z`} strokeLinejoin="round" />
              {isWork && <rect x={x - 20} y={630} width={40} height={30} rx={4} strokeWidth={4} />}
            </g>
          );
        })}
        {/* 左5人を点線で囲んでタグ */}
        <g opacity={tagIn}>
          <rect x={356} y={440} width={610} height={262} rx={18} fill="none" stroke={SP.dim} strokeWidth={5} strokeDasharray="14 10" />
          <rect x={430} y={330} width={460} height={76} rx={12} fill={SP.panel} stroke={SP.accent} strokeWidth={4} />
          <text x={660} y={382} textAnchor="middle" fontFamily={SUURI_FONT} fontSize={38} fontWeight={700} fill={SP.accent}>
            仕事の話しか、しない
          </text>
        </g>
        <SmallLabel x={960} y={800} text="知り合い10人、実質は5人" size={32} />
      </svg>
    </Frame>
  );
};

// fraction_stuck (行132): 35万分の1が、ピクリとも動かない
export const FractionStuckScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // 一瞬だけ震えるが、動かない
  const shaking = frame > fps * 1.0 && frame < fps * 1.7;
  const shake = shaking ? Math.sin(frame / 1.6) * 3 : 0;
  const stuckIn = appearAt(frame, fps, Math.round(fps * 1.7));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "これでは、ほとんど動かない"} />
      <svg width={W} height={H}>
        {/* 35万の出どころ: 東京1400万人 ÷ 運命の人40人 */}
        <g opacity={a}>
          <text x={600} y={330} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fill={SP.ink}>
            1400万人
          </text>
          <SmallLabel x={600} y={378} text="東京の人口" size={24} />
          <text x={790} y={330} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fill={SP.faint}>
            ÷
          </text>
          <text x={930} y={330} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fill={SP.ink}>
            40人
          </text>
          <SmallLabel x={930} y={378} text="運命の人" size={24} />
          <text x={1070} y={330} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fill={SP.faint}>
            =
          </text>
          <text x={1230} y={330} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fontWeight={700} fill={SP.accent}>
            35万
          </text>
        </g>
        <g opacity={a} transform={`translate(${shake}, 0)`}>
          <text x={820} y={470} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={92} fill={SP.ink}>
            1
          </text>
          <path d="M 560 520 L 1080 520" stroke={SP.line} strokeWidth={8} strokeLinecap="round" />
          <text x={820} y={650} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={86} fontWeight={700} fill={SP.ink}>
            350,000
          </text>
        </g>
        {/* 動かそうとする矢印に× */}
        <g opacity={stuckIn}>
          <path d="M 1180 540 Q 1300 516 1390 540" stroke={SP.dim} strokeWidth={6} fill="none" strokeDasharray="14 10" strokeLinecap="round" />
          <path d="M 1390 540 l -28 -12 M 1390 540 l -18 24" stroke={SP.dim} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 1440 470 L 1560 600 M 1560 470 L 1440 600" stroke={SP.accent} strokeWidth={9} strokeLinecap="round" />
          <SmallLabel x={1370} y={680} text="ピクリとも、しない" size={30} color={SP.accent} weight={700} />
        </g>
        <SmallLabel x={960} y={820} text="35万分の1は、そのまま" size={32} />
      </svg>
    </Frame>
  );
};

// deai_x10 (行133): 出会いの輪 (趣味・紹介・再会) が順に広がり、分母が膨らむ
export const DeaiX10Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const rings = [
    { r: 150, label: "趣味の集まり", color: KC.yellow },
    { r: 250, label: "友人の紹介", color: KC.skyBlue },
    { r: 350, label: "昔の友達と再会", color: KC.lime },
  ];
  // 輪が増えるたび、分母が膨らむ
  const bunbo = Math.round(interpolate(frame, [fps * 0.6, fps * 2.4], [10, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const counterIn = appearAt(frame, fps, Math.round(fps * 0.5));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "出会いの輪を、広げる"} />
      <svg width={W} height={H}>
        {/* 中心: あなた */}
        <g opacity={a}>
          <circle cx={860} cy={560} r={28} fill="none" stroke={SP.ink} strokeWidth={5} />
          <path d="M 860 588 q -20 32 -24 56 M 860 588 q 20 32 24 56" stroke={SP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        {/* 同心円 (順出し) */}
        {rings.map((ring, i) => {
          const grow = appearAt(frame, fps, 16 + i * 16);
          return (
            <g key={i} opacity={grow}>
              <circle cx={860} cy={560} r={ring.r * (0.7 + grow * 0.3)} fill="none" stroke={ring.color} strokeWidth={6} />
              <SmallLabel x={860 + ring.r * 0.72} y={560 - ring.r * 0.72} text={ring.label} size={28} color={ring.color} weight={700} />
              {/* 輪の上の人の点 */}
              {Array.from({ length: 5 + i * 3 }).map((_, j) => {
                const ang = jitter(j, 95 + i) * Math.PI * 2;
                return <circle key={j} cx={860 + Math.cos(ang) * ring.r} cy={560 + Math.sin(ang) * ring.r} r={7} fill={PINK} opacity={grow} />;
              })}
            </g>
          );
        })}
        {/* 膨らむ分母カウンタ */}
        <g opacity={counterIn}>
          <SmallLabel x={1600} y={450} text="出会う人の数" size={30} color={SP.faint} />
          <text x={1600} y={580} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={104} fontWeight={700} fill={PINK}>
            {bunbo}
          </text>
          <SmallLabel x={1600} y={650} text="人 / 年" size={28} color={SP.faint} />
        </g>
      </svg>
    </Frame>
  );
};

// fraction_x10 (行134): 分数が再登場。分母×10 → 確率も×10
export const FractionX10Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const x10In = appearAt(frame, fps, Math.round(fps * 0.8));
  const resultIn = appearAt(frame, fps, Math.round(fps * 1.7));
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "出会い10倍 → 確率も10倍"} />
      <svg width={W} height={H}>
        {/* 分数 */}
        <g opacity={a}>
          <text x={380} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={62} fill={SP.ink}>
            当たる確率 =
          </text>
          <text x={940} y={470} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={56} fill={SP.ink}>
            出会えた運命の人
          </text>
          <path d="M 640 520 L 1240 520" stroke={SP.line} strokeWidth={7} strokeLinecap="round" />
          <text x={940} y={630} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={60} fontWeight={700} fill={SP.ink}>
            出会う人の数
          </text>
        </g>
        {/* 分母に ×10 スタンプ */}
        <g opacity={x10In}>
          <text x={1340} y={636} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={76} fontWeight={800} fill={SP.accent} transform="rotate(-6 1340 612)">
            ×10
          </text>
          <ellipse cx={940} cy={604} rx={310} ry={78} fill="none" stroke={SP.accent} strokeWidth={6} transform="rotate(-2 940 604)" />
        </g>
        {/* 結果: 確率も×10 */}
        <g opacity={resultIn}>
          <path d="M 960 700 L 960 745 M 960 745 l -16 -24 M 960 745 l 16 -24" stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round" />
          <text x={960} y={815} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={72} fontWeight={700} fill={PINK}>
            当たる確率も、ちょうど ×10
          </text>
        </g>
      </svg>
    </Frame>
  );
};

// dice_many (行133-134): サイコロを何度も振る手「試行回数」
export const DiceManyScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const rule = variant >= 1; // 行134: 確率の世界のただひとつのルール
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (rule ? "確率の世界、ただひとつのルール" : "試行回数は、自分で増やせる")} />
      <svg width={W} height={H}>
        {/* 振る手 */}
        <g opacity={a} stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 440 360 Q 520 300 620 330 Q 700 350 700 420 Q 700 480 630 500 Q 540 520 480 480" />
          <path d="M 480 480 L 420 560 M 540 512 L 520 580 M 610 505 L 620 575" />
          <path d="M 640 300 q 20 -30 8 -56 M 700 330 q 30 -20 34 -50 M 740 390 q 36 -4 54 -28" strokeWidth={4} opacity={0.7} />
        </g>
        {/* 転がるサイコロたち (1の目だけ赤、ほかは黒) */}
        {Array.from({ length: 6 }).map((_, i) => {
          const pop = appearAt(frame, fps, 14 + i * 7);
          const x = 820 + (i % 3) * 260 + jitter(i, 97) * 60;
          const y = 420 + Math.floor(i / 3) * 240 + jitter(i, 98) * 40;
          const rot = (jitter(i, 99) - 0.5) * 40;
          const pips = [1, 3, 5, 2, 6, 4][i];
          const pipPos: Record<number, [number, number][]> = {
            1: [[0, 0]],
            2: [[-18, -18], [18, 18]],
            3: [[-20, -20], [0, 0], [20, 20]],
            4: [[-18, -18], [18, -18], [-18, 18], [18, 18]],
            5: [[-20, -20], [20, -20], [0, 0], [-20, 20], [20, 20]],
            6: [[-18, -22], [18, -22], [-18, 0], [18, 0], [-18, 22], [18, 22]],
          };
          return (
            <g key={i} opacity={pop} transform={`translate(${x}, ${y}) rotate(${rot})`}>
              <rect x={-44} y={-44} width={88} height={88} rx={16} fill="#FFFFFF" opacity={0.95} />
              <rect x={-44} y={-44} width={88} height={88} rx={16} fill="none" stroke={SP.faint} strokeWidth={3} />
              {pipPos[pips].map(([px, py], j) => (
                <circle key={j} cx={px} cy={py} r={7.5} fill={pips === 1 ? SP.accent : "#26262B"} />
              ))}
            </g>
          );
        })}
        <SmallLabel x={960} y={830} text={rule ? "振った数だけ、チャンスがある" : "運は上げられない。回数は増やせる"} size={32} color={SP.ink} weight={700} />
      </svg>
    </Frame>
  );
};

// backus_wedding (行135-140): バッカスのその後 → 結婚式。宇宙人が拍手で祝福 (マスコット回収)
export const BackusWeddingScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // v0: さて、その後 / v1: 26人と計算した経済学者 / v2: 論文の結びは悲観していない
  // v3: 決めゼリフ「確率は低い、でも、ゼロではない」(字幕消し) / v4: 結婚 (チャペル) / v5: 26人のうちの1人+宇宙人の拍手
  if (variant === 3) {
    const b = appearAt(frame, fps, Math.round(fps * 0.8));
    return (
      <Frame>
        <svg width={W} height={H}>
          <g opacity={a}>
            <SmallLabel x={960} y={360} text="論文の結びに、彼はこう書きました" size={36} />
          </g>
          <g opacity={b}>
            <text x={960} y={560} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={82} fontWeight={700} fill={SP.ink}>
              確率は低い。でも、ゼロではない。
            </text>
            <path d="M 660 640 L 1260 640" stroke={SP.accent} strokeWidth={5} strokeLinecap="round" />
          </g>
        </svg>
      </Frame>
    );
  }
  if (variant >= 4) {
    const married = variant >= 5; // 行140: 26人のうちの1人と
    const bells = appearAt(frame, fps, 20);
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? (married ? "26人のうちの、1人と" : "数年後、彼は結婚しました")} />
        <svg width={W} height={H}>
          {/* チャペル */}
          <g opacity={a} stroke={SP.line} strokeWidth={6} fill="none" strokeLinejoin="round">
            <path d="M 660 820 L 660 520 L 960 360 L 1260 520 L 1260 820 Z" />
            <path d="M 960 360 L 960 280 M 920 310 L 1000 310" strokeLinecap="round" />
            <rect x={880} y={620} width={160} height={200} rx={8} />
          </g>
          {/* 鐘とハート */}
          <g opacity={bells}>
            <Heart x={960} y={180} scale={0.56} color={PINK} />
            <Heart x={860} y={230} scale={0.34} color={RNP.pinkSoft} />
            <Heart x={1060} y={230} scale={0.34} color={RNP.pinkSoft} />
          </g>
          {/* 新郎新婦 */}
          <g opacity={a} stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
            <circle cx={920} cy={700} r={20} />
            <path d="M 920 720 L 920 790 M 920 740 L 900 764 M 920 740 L 944 752" />
            <circle cx={1000} cy={700} r={20} />
            <path d="M 984 720 L 980 800 Q 1000 812 1020 800 L 1016 720" />
            <path d="M 1000 740 L 976 752" />
          </g>
          {/* ブーケ (中ピンク) */}
          <g opacity={bells}>
            <circle cx={962} cy={748} r={14} fill={PINK} />
            <circle cx={950} cy={740} r={8} fill={RNP.pinkSoft} />
            <circle cx={974} cy={740} r={8} fill={RNP.pinkSoft} />
          </g>
          {/* 宇宙人が拍手で祝福 (マスコット回収) */}
          {married && (
            <g opacity={appearAt(frame, fps, 26)}>
              <Alien x={1480} y={640} scale={0.9} color={KC.lime} face="clap" />
              <SmallLabel x={1480} y={830} text="宇宙人も、祝福" size={28} color={KC.lime} />
            </g>
          )}
          <SmallLabel x={660} y={880} text={married ? "宇宙人より見つけにくい1人に、出会えた" : "これは、確認できる事実です"} size={30} anchor="start" />
        </svg>
      </Frame>
    );
  }
  if (variant === 1) {
    // v1 (行138): イギリスに26人と計算した、あの経済学者 → 地図と26点の回想
    const dotsIn = appearAt(frame, fps, Math.round(fps * 0.5));
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "26人と計算した、あの人"} />
        <svg width={W} height={H}>
          {/* 回想の枠 (点線) */}
          <g opacity={a}>
            <rect x={420} y={260} width={1080} height={560} rx={26} fill="none" stroke={SP.dim} strokeWidth={5} strokeDasharray="18 14" />
            <SmallLabel x={520} y={310} text="回想" size={28} color={SP.faint} />
          </g>
          {/* イギリス地図 (回想なので控えめの線) */}
          <g opacity={a * 0.9} transform="translate(-90, 40) scale(0.82) translate(180, 60)">
            <path
              d="M 900 240 Q 960 220 990 270 Q 1030 300 1010 360 Q 1050 400 1030 460 Q 1080 520 1050 590 Q 1090 660 1040 720 Q 980 780 910 750 Q 850 770 820 710 Q 780 660 810 600 Q 770 540 810 480 Q 790 420 830 370 Q 820 300 870 270 Q 880 250 900 240 Z"
              fill="none"
              stroke={SP.dim}
              strokeWidth={6}
              strokeLinejoin="round"
            />
            {Array.from({ length: 26 }).map((_, i) => {
              const x = 840 + jitter(i, 81) * 170;
              const y = 320 + jitter(i, 82) * 380;
              return <circle key={i} cx={x} cy={y} r={7} fill={PINK} opacity={dotsIn} />;
            })}
          </g>
          {/* 右: 26人 */}
          <g opacity={appearAt(frame, fps, Math.round(fps * 0.9))}>
            <text x={1230} y={540} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={110} fontWeight={700} fill={PINK}>
              26人
            </text>
            <SmallLabel x={1230} y={620} text="イギリス全土で" size={30} />
          </g>
          <SmallLabel x={960} y={880} text="あの切ない経済学者の、続報" size={30} />
        </svg>
      </Frame>
    );
  }
  if (variant >= 2) {
    // v2 (行139): 論文の結びページのクローズアップ (中身は v3 の決めゼリフまで見せない)
    const markIn = appearAt(frame, fps, Math.round(fps * 1.0));
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "彼は、悲観していなかった"} />
        <svg width={W} height={H}>
          {/* 論文の最終ページ */}
          <g opacity={a}>
            <rect x={600} y={250} width={720} height={540} rx={10} fill="#FFFFFF" opacity={0.08} />
            <rect x={600} y={250} width={720} height={540} rx={10} fill="none" stroke={SP.line} strokeWidth={6} />
            <text x={680} y={330} textAnchor="start" fontFamily={SUURI_SERIF} fontSize={38} fontWeight={700} fill={SP.ink}>
              結び (Conclusion)
            </text>
            <path d="M 680 360 L 1240 360" stroke={SP.faint} strokeWidth={3} />
            {/* 本文 (ぼかした線) */}
            {Array.from({ length: 6 }).map((_, i) => (
              <path key={i} d={`M 680 ${410 + i * 44} L ${i === 5 ? 1000 : 1240} ${410 + i * 44}`} stroke={SP.faint} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
            ))}
            {/* 結びの一文 (ここだけ強調。中身は次のシーンで) */}
            <g opacity={markIn}>
              <rect x={660} y={682} width={600} height={64} rx={10} fill={SP.accent} opacity={0.16} />
              <path d="M 680 714 L 1240 714" stroke={SP.accent} strokeWidth={7} strokeLinecap="round" />
            </g>
          </g>
          {/* 虫めがね */}
          <g opacity={markIn} stroke={SP.line} strokeWidth={7} fill="none">
            <circle cx={1300} cy={720} r={62} />
            <path d="M 1344 764 L 1420 840" strokeLinecap="round" />
          </g>
          <SmallLabel x={430} y={520} text="最後の段落に" size={32} />
          <SmallLabel x={430} y={572} text="彼の答えが" size={32} />
          <SmallLabel x={960} y={880} text="切ない計算の、その先へ" size={30} />
        </svg>
      </Frame>
    );
  }
  // v0 (行137): さて、バッカスのその後 (経済学者の再登場+26人の回想吹き出し)
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "さて、バッカスのその後"} />
      <svg width={W} height={H}>
        {/* 経済学者 (眼鏡) と論文 */}
        <g opacity={a} stroke={SP.line} strokeWidth={5} fill="none" strokeLinecap="round">
          <circle cx={760} cy={470} r={54} />
          <circle cx={738} cy={462} r={16} />
          <circle cx={782} cy={462} r={16} />
          <path d="M 754 462 L 766 462 M 722 462 l -14 -4 M 798 462 l 14 -4" />
          <path d="M 748 510 L 772 510" />
          <path d="M 710 620 q 4 -70 50 -72 q 46 2 50 72" strokeLinejoin="round" />
          <path d="M 722 580 L 680 640 M 798 580 L 850 600" />
        </g>
        {/* 手元の論文 */}
        <g opacity={a}>
          <rect x={860} y={560} width={220} height={150} rx={8} fill="none" stroke={SP.line} strokeWidth={5} transform="rotate(6 970 635)" />
          <path d="M 892 606 L 1044 622 M 888 642 L 1040 658" stroke={SP.faint} strokeWidth={4} />
        </g>
        {/* 26人回想の思い出し吹き出し (小さく) */}
        <g opacity={appearAt(frame, fps, 22)}>
          <circle cx={842} cy={398} r={5} fill={SP.dim} />
          <circle cx={874} cy={354} r={8} fill={SP.dim} />
          <ellipse cx={990} cy={288} rx={124} ry={66} fill="none" stroke={SP.dim} strokeWidth={4} />
          <text x={990} y={302} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={40} fill={SP.faint}>
            26人…
          </text>
        </g>
        <SmallLabel x={960} y={830} text="あの切ない経済学者の、続報" size={30} />
      </svg>
    </Frame>
  );
};

// ===== 結論 (黒モード) =====

// renai_matome (行141-144): 3行まとめが順に点灯する
export const RenaiMatomeScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const lines = [
    { text: "運命の人は、東京におよそ40人", color: PINK },
    { text: "その数は、条件の掛け算で増えも減りもする", color: SP.ink },
    { text: "確率は、分母 (出会う数) で自分で動かせる", color: SP.ink },
  ];
  const lit = Math.max(0, Math.min(3, variant)); // 0=見出しのみ, 1..3=点灯数
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? "今日のまとめ"} />
      <svg width={W} height={H}>
        {lines.map((l, i) => {
          const on = i < lit;
          const isNew = i === lit - 1;
          const pop = isNew ? appearAt(frame, fps, 14) : 1;
          const y = 330 + i * 170;
          return (
            <g key={i} opacity={on ? pop * a : a * 0.35}>
              <rect x={360} y={y} width={1200} height={120} rx={16} fill={on ? SP.panel : "none"} stroke={on ? (i === 0 ? PINK : SP.line) : SP.dim} strokeWidth={on ? 6 : 4} strokeDasharray={on ? "none" : "12 10"} />
              <circle cx={440} cy={y + 60} r={22} fill="none" stroke={on ? SP.accent : SP.dim} strokeWidth={5} />
              <text x={440} y={y + 72} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={32} fill={on ? SP.accent : SP.dim}>
                {i + 1}
              </text>
              <text x={520} y={y + 74} fontFamily={SUURI_FONT} fontSize={38} fontWeight={on ? 700 : 400} fill={on ? (i === 0 ? PINK : SP.ink) : SP.dim}>
                {l.text}
              </text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
};

// final_tool (行145-148): 奇跡ではなく計算問題 → 式が「人生の道具箱」に収まる
export const FinalToolScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  // v0: 空から降る奇跡に× / v1: 一本の計算問題 / v2: 式が教えてくれたのは / v3: 人生の道具箱へ
  if (variant <= 1) {
    const isCalc = variant === 1;
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? (isCalc ? "条件と分母を選べる、計算問題" : "空から降る奇跡では、ない")} />
        <svg width={W} height={H}>
          {/* 流れ星 (奇跡) に×印 */}
          <g opacity={a * (isCalc ? 0.35 : 1)}>
            <path d="M 500 260 L 760 420" stroke={KC.yellow} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
            <path d="M 770 430 l 6 16 l 17 2 l -13 12 l 4 17 l -14 -9 l -15 9 l 4 -17 l -13 -12 l 17 -2 Z" fill={KC.yellow} />
            {!isCalc && (
              <g opacity={appearAt(frame, fps, 24)}>
                <path d="M 690 350 L 850 510 M 850 350 L 690 510" stroke={SP.accent} strokeWidth={9} strokeLinecap="round" />
              </g>
            )}
            <SmallLabel x={770} y={580} text="空から降る奇跡" size={30} />
          </g>
          {/* 計算問題のノート */}
          <g opacity={isCalc ? appearAt(frame, fps, 16) : a * 0.4}>
            <rect x={1060} y={300} width={520} height={360} rx={12} fill="none" stroke={isCalc ? SP.ink : SP.dim} strokeWidth={6} />
            <path d="M 1120 380 L 1520 380 M 1120 450 L 1520 450 M 1120 520 L 1400 520" stroke={SP.faint} strokeWidth={4} />
            <text x={1320} y={620} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={42} fill={isCalc ? SP.accent : SP.dim}>
              条件 × 分母 = 答え
            </text>
            <SmallLabel x={1320} y={720} text="自分で選べる計算問題" size={30} color={isCalc ? SP.ink : SP.dim} weight={700} />
          </g>
        </svg>
      </Frame>
    );
  }
  // v2-v3: 式が道具箱に収まる
  const dropT = variant >= 3 ? interpolate(frame, [fps * 0.4, fps * 1.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const fy = 330 + dropT * 230;
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (variant >= 3 ? "「分解すれば、見えてくる」" : "式が教えてくれたのは")} />
      <svg width={W} height={H}>
        {/* 式のカード (道具箱へ降りていく) */}
        <g opacity={a} transform={`translate(0, ${fy - 330})`}>
          <rect x={620} y={280} width={680} height={100} rx={12} fill={SP.panel} stroke={SP.line} strokeWidth={5} />
          <text x={960} y={346} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={44} fill={SP.ink}>
            N = 条件の掛け算
          </text>
        </g>
        {/* 道具箱 (白) */}
        <g opacity={a} stroke={SP.line} strokeWidth={7} fill="none" strokeLinejoin="round">
          <path d="M 620 620 L 1300 620 L 1270 840 L 650 840 Z" />
          <path d="M 620 620 L 700 560 L 1220 560 L 1300 620" />
          <path d="M 900 560 Q 960 500 1020 560" strokeLinecap="round" />
        </g>
        {/* 箱の中の他の道具 (これまでの回の数理) */}
        <g opacity={a * 0.7}>
          <circle cx={780} cy={740} r={24} fill="none" stroke={SP.faint} strokeWidth={4} />
          <path d="M 1100 710 L 1160 770 M 1160 710 L 1100 770" stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
          <path d="M 920 760 l 30 0 l 0 -30" fill="none" stroke={SP.faint} strokeWidth={4} strokeLinecap="round" />
        </g>
        <SmallLabel x={960} y={900} text={variant >= 3 ? "わからないものは、分解すればいい" : "宇宙の広さでは、なかった"} size={32} color={SP.ink} weight={700} />
      </svg>
    </Frame>
  );
};

// yurumeru (行149-150): スライダーをひとつ緩める指 + 40→80
// v2 (最終行): 動きだして分母を増やせば、運命の人にきっと出会える
export const YurumeruScene: React.FC<SceneProps> = ({ scene, variant = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = appearAt(frame, fps, 8);
  const show80 = variant >= 1; // 行150: 明日、80人になる
  if (variant >= 2) {
    const ring1 = appearAt(frame, fps, Math.round(fps * 0.5));
    const ring2 = appearAt(frame, fps, Math.round(fps * 1.0));
    const meet = appearAt(frame, fps, Math.round(fps * 1.7));
    const step = Math.min(1, frame / (fps * 1.2));
    const px = 430 + step * 60; // 一歩ふみ出す
    return (
      <Frame>
        <DiagramTitle text={scene?.title ?? "動きだせば、きっと出会える"} />
        <svg width={W} height={H}>
          {/* 歩き出すあなた */}
          <g opacity={a}>
            <g stroke={SP.ink} strokeWidth={6} fill="none" strokeLinecap="round">
              <circle cx={px} cy={430} r={34} />
              <path d={`M ${px} 464 L ${px} 580 M ${px} 500 L ${px - 46} 540 M ${px} 500 L ${px + 56} 528 M ${px} 580 L ${px - 50} 668 M ${px} 580 L ${px + 62} 664`} />
            </g>
            {/* 進む勢いの線 */}
            <path d={`M ${px - 110} 470 L ${px - 162} 470 M ${px - 100} 530 L ${px - 144} 530 M ${px - 114} 590 L ${px - 158} 590`} stroke={SP.faint} strokeWidth={5} strokeLinecap="round" />
            <SmallLabel x={px} y={740} text="あなた" size={28} />
          </g>
          {/* 広がる出会いの輪 */}
          <g opacity={ring1}>
            <circle cx={1150} cy={520} r={150 * (0.7 + ring1 * 0.3)} fill="none" stroke={KC.skyBlue} strokeWidth={6} />
            {Array.from({ length: 6 }).map((_, i) => {
              const ang = jitter(i, 71) * Math.PI * 2;
              return <circle key={i} cx={1150 + Math.cos(ang) * 150} cy={520 + Math.sin(ang) * 150} r={8} fill={SP.faint} />;
            })}
          </g>
          <g opacity={ring2}>
            <circle cx={1150} cy={520} r={260 * (0.7 + ring2 * 0.3)} fill="none" stroke={KC.yellow} strokeWidth={6} />
            {Array.from({ length: 9 }).map((_, i) => {
              const ang = jitter(i, 72) * Math.PI * 2;
              return <circle key={i} cx={1150 + Math.cos(ang) * 260} cy={520 + Math.sin(ang) * 260} r={8} fill={SP.faint} />;
            })}
            <SmallLabel x={1150} y={330} text="出会う数 (分母) を増やす" size={28} color={KC.yellow} weight={700} />
          </g>
          {/* 輪の中の、運命の人 */}
          <g opacity={meet}>
            <circle cx={1330} cy={470} r={26} fill="none" stroke={PINK} strokeWidth={6} />
            <circle cx={1330} cy={470} r={10} fill={PINK} />
            <Heart x={1330} y={398} scale={0.42} color={PINK} />
            <SmallLabel x={1330} y={548} text="運命の人" size={28} color={PINK} weight={700} />
          </g>
          <SmallLabel x={960} y={830} text="増やした分母の、その先に" size={32} color={SP.ink} weight={700} />
        </svg>
      </Frame>
    );
  }
  const t = interpolate(frame, [fps * 0.5, fps * 1.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const knobX = 760 + t * 400;
  const num = Math.round(40 + t * 40);
  return (
    <Frame>
      <DiagramTitle text={scene?.title ?? (show80 ? "40人は、明日80人になる" : "今夜、ひとつだけ緩めてみる")} />
      <svg width={W} height={H}>
        {/* スライダー */}
        <g opacity={a}>
          <path d="M 560 480 L 1360 480" stroke={SP.dim} strokeWidth={12} strokeLinecap="round" />
          <path d={`M 560 480 L ${knobX} 480`} stroke={PINK} strokeWidth={12} strokeLinecap="round" />
          <circle cx={knobX} cy={480} r={30} fill={SP.background} stroke={PINK} strokeWidth={8} />
        </g>
        {/* 緩める指 */}
        <g opacity={a} transform={`translate(${knobX}, 480)`} stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 10 -36 Q 10 -90 24 -120 Q 34 -140 48 -132 Q 58 -124 52 -100 Q 44 -70 44 -40" />
          <path d="M 44 -40 Q 90 -46 104 -20 Q 112 4 92 24 Q 60 50 24 40 Q 2 34 -6 10" />
        </g>
        {/* カウンター 40→80 */}
        <g opacity={appearAt(frame, fps, 20)}>
          <text x={760} y={740} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={90} fill={SP.faint}>
            40人
          </text>
          <path d="M 900 710 L 1060 710 M 1060 710 l -24 -16 M 1060 710 l -24 16" stroke={SP.line} strokeWidth={6} fill="none" strokeLinecap="round" />
          {show80 ? (
            <>
              <text x={1230} y={752} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={120} fontWeight={800} fill={PINK_DEEP}>
                80人
              </text>
              <text x={1230} y={752} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={120} fontWeight={800} fill="none" stroke={PINK} strokeWidth={2} opacity={0.6}>
                80人
              </text>
            </>
          ) : (
            <text x={1200} y={745} textAnchor="middle" fontFamily={SUURI_SERIF} fontSize={96} fill={SP.ink}>
              {num}人
            </text>
          )}
        </g>
      </svg>
    </Frame>
  );
};
