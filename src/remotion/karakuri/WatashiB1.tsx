// 「私は何者?」4000年史: ブロック1 = 導入 + 第1〜3章。
// 担当範囲: 台本 docs/watashi-script-v1.txt の 2〜70行目 (文#1〜#69・69文)。
// 作業ルール: docs/watashi-motifs-rules.md を必ず読んでから作ること。
// WobbleDefs の seed はこのファイルでは 300〜399 を使う (実際は 300〜357)。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, abs, WBadge, ChapterTitle, PUR, RouteMap, ShindanSho, UranaiMachine,
} from "./WatashiShared";
import { AncientPerson } from "./Jihanki2000Scenes";

const SKIN = "#F6D7B8"; // 肌色 (ルール固定)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Person / AncientPerson と同じゆれ式 (かぶせ物を同期させる)
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ===== シーンの共通ガワ: クリーム紙地 + ゆらぎ + バッジ + 質感 =====
// purple = 導入の診断の紫照明 (PUR)。over = Stamp などの div を重ねる口。
const Frame: React.FC<{
  f: number; seed: number; caption?: string; purple?: boolean;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, purple, over, children }) => (
  <AbsoluteFill style={{ background: purple ? PUR.deep : KRP.cream }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      {purple && (
        <g>
          <rect x={0} y={0} width={W} height={H} fill={PUR.mid} opacity={0.4} />
          <ellipse cx={960} cy={540} rx={820} ry={560} fill={PUR.glow} opacity={0.26} />
          <ellipse cx={960} cy={540} rx={520} ry={380} fill={PUR.glow} opacity={0.24} />
        </g>
      )}
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={960} y={170} centerX text={caption} />}
    <WBadge />
    <Atmosphere f={f} dark={purple} />
  </AbsoluteFill>
);

// ===== 小物キット =====
// 木札風ラベル (svg内。中央寄せ)
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number; color?: string; fill?: string;
}> = ({ x, y, text, size = 34, t = 1, color = KRP.ink, fill = KRP.white }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  const w = text.length * size + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={10}
        fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ふきだし (svg内)
const Bubble: React.FC<{
  x: number; y: number; w: number; h: number; tailTo?: [number, number];
  text?: string; size?: number; t?: number; color?: string;
}> = ({ x, y, w, h, tailTo, text, size = 38, t = 1, color = KRP.ink }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      {tailTo && (
        <polygon points={`-14,${h / 2 - 8} 14,${h / 2 - 8} ${tailTo[0] - x},${tailTo[1] - y}`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.6}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {tailTo && (
        <polygon points={`-13,${h / 2 - 10} 13,${h / 2 - 10} ${(tailTo[0] - x) * 0.96},${(tailTo[1] - y) * 0.92}`}
          fill={KRP.white} />
      )}
      {text && (
        <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={size} fill={color}>{text}</text>
      )}
    </g>
  );
};

// びっくり放射線
const Burst: React.FC<{ x: number; y: number; r?: number; color?: string; t?: number; n?: number }> =
  ({ x, y, r = 60, color = KRP.orange, t = 1, n = 10 }) => {
    const tt = clamp01(t);
    if (tt <= 0) return null;
    return (
      <g transform={`translate(${x} ${y})`} opacity={tt}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + 0.25;
          return (
            <line key={i} x1={Math.cos(a) * r * 0.62} y1={Math.sin(a) * r * 0.62}
              x2={Math.cos(a) * r * (0.62 + 0.38 * tt)} y2={Math.sin(a) * r * (0.62 + 0.38 * tt)}
              stroke={color} strokeWidth={7} strokeLinecap="round" />
          );
        })}
      </g>
    );
  };

// 神様のあかり (抽象的な光+放射。特定の宗教の絵にしない。RouteMapの神アイコンと同系)
const GodLight: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const pulse = 1 + Math.sin(f / 11) * 0.05;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * pulse})`}>
      <circle cx={0} cy={0} r={46} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={0} cy={0} r={26} fill={KRP.white} opacity={0.55} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + f / 90;
        return (
          <line key={i} x1={Math.cos(a) * 62} y1={Math.sin(a) * 62}
            x2={Math.cos(a) * 92} y2={Math.sin(a) * 92}
            stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

// ○と✕ (判定マーク)
const Maru: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  return sc <= 0 ? null : (
    <circle cx={x} cy={y} r={34 * s * sc} fill="none" stroke={KRP.red} strokeWidth={10 * s} />
  );
};
const Batsu: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const sc = pop(clamp01(t));
  return sc <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}
      stroke={KRP.blueDeep} strokeWidth={11} strokeLinecap="round">
      <line x1={-30} y1={-30} x2={30} y2={30} />
      <line x1={30} y1={-30} x2={-30} y2={30} />
    </g>
  );
};

// 別描きの腕 (肩から回す。hideArm とセットで使う)
const ArmX: React.FC<{ x: number; y: number; rot: number; len?: number; color: string }> =
  ({ x, y, rot, len = 84, color }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-11} y={-8} width={22} height={len} rx={11} fill={color} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={0} cy={len - 2} r={13} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );

// ===== この回の登場人物 (使い回し) =====
// 殷の王さま: AncientPerson(pilgrim) + 冕冠 (玉すだれの冠) + あごひげ
const ShangKing: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "worried" | "surprised" | "smile"; gaze?: [number, number]; lean?: number;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0], lean = 0 }) => {
  const bob = bobOf(f, phase);
  return (
    <g>
      <AncientPerson x={x} y={y} s={s} role="pilgrim" f={f} phase={phase} face={face} gaze={gaze} lean={lean} />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 冠の台 + 上板 */}
        <rect x={-46} y={-304} width={92} height={26} rx={6} fill={KRP.ink} />
        <rect x={-80} y={-318} width={160} height={18} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 玉すだれ */}
        {[-70, -52, 52, 70].map((bx) => (
          <g key={bx}>
            <line x1={bx} y1={-300} x2={bx} y2={-262} stroke={KRP.ink} strokeWidth={3.5} />
            <circle cx={bx} cy={-256} r={7} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
        {/* あごひげ */}
        <path d="M -20 -176 Q -10 -136 0 -132 Q 10 -136 20 -176 Q 10 -168 0 -168 Q -10 -168 -20 -176 Z"
          fill={KRP.ink} />
      </g>
    </g>
  );
};

// (陰陽師は KariginuMan / Seimei に置きかえ済み。⑲⑳)

// ㉗ ケプラー (17世紀の装い)。スーツは19世紀の服なので使わない。
// ひだ襟 (ラフ) + ダブレット (ボタンの列つきの胴衣) + 学者のガウン (暗色の長衣)
// + 膝丈ズボン + ストッキング + バックル靴、短髪に口ひげ・あごひげ。
// 第3章でケプラーが出るシーンは必ずこの1つを使い回す (顔も装いも同じ)。
const KEP_GOWN = KRP.grayDark; // 学者のガウン (暗色の長衣)
const KEP_DOUB = KRP.blueDeep; // ダブレットと膝丈ズボン
const KEP_HAIR = KRP.bronze; // 髪とひげ

// 片腕 (肩を原点に下へ伸ばす形で描き、左腕は scale(-1,1) で反転)
const KeplerArm: React.FC<{ m: 1 | -1; rot: number }> = ({ m, rot }) => (
  <g transform={`translate(${m * 58} -178) scale(${m} 1) rotate(${rot})`}>
    {/* ガウンの垂れ袖 (外側・布が重なる) */}
    <path d="M -20 -14 Q 28 -10 33 30 Q 40 66 20 80 L -24 74 Q -11 30 -20 -14 Z"
      fill={KEP_GOWN} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    {/* 袖のひだ (布の重なりの線) */}
    <path d="M 0 -2 Q 12 34 5 72" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
    <path d="M 18 2 Q 27 34 21 70" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.22} />
    {/* ダブレットの前腕 (袖の切り替え) */}
    <rect x={-8} y={58} width={28} height={42} rx={13} fill={KEP_DOUB} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 切り替えの帯 */}
    <rect x={-10} y={54} width={32} height={11} rx={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
    <line x1={6} y1={70} x2={6} y2={95} stroke={KRP.ink} strokeWidth={2.5} opacity={0.3} />
    {/* 手首の小さなひだ (カフス) */}
    {[-3, 7, 17].map((cx2) => (
      <circle key={cx2} cx={cx2} cy={100} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    ))}
    {/* 手 */}
    <circle cx={7} cy={115} r={14} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

const Kepler: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "worried" | "surprised" | "smile"; gaze?: [number, number]; lean?: number;
  armR?: number; armL?: number; // 肩から振る角度 (省略時はゆっくりゆれる)
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0], lean = 0, armR, armL }) => {
  const bob = bobOf(f, phase);
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  const sw = Math.sin((f + phase * 11) / 17) * 2.8;
  const rR = armR === undefined ? sw : armR + Math.sin((f + phase * 7) / 15) * 1.6;
  const rL = armL === undefined ? -sw : armL + Math.sin((f + phase * 9) / 16) * 1.6;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 靴 (バックルつき) */}
      <ellipse cx={-20} cy={-9} rx={26} ry={12} fill={KRP.ink} />
      <ellipse cx={20} cy={-9} rx={26} ry={12} fill={KRP.ink} />
      <rect x={-28} y={-22} width={15} height={9} rx={2} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
      <rect x={13} y={-22} width={15} height={9} rx={2} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
      {/* ストッキング */}
      <rect x={-33} y={-68} width={26} height={58} rx={9} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
      <rect x={7} y={-68} width={26} height={58} rx={9} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
      {/* 膝丈のズボン (ふくらみのある形) */}
      <path d="M -48 -134 L 48 -134 Q 65 -98 50 -62 Q 25 -52 0 -52 Q -25 -52 -50 -62 Q -65 -98 -48 -134 Z"
        fill={KEP_DOUB} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -50 -64 Q 0 -51 50 -64" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.32} />
      <line x1={0} y1={-130} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={3} opacity={0.22} />
      {/* ===== 学者のガウン (暗色の長衣) ===== */}
      <path d="M -60 -190 Q -84 -126 -99 -56 L 99 -56 Q 84 -126 60 -190 Z"
        fill={KEP_GOWN} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      {/* ガウンの縦ひだ */}
      {[-74, 74].map((bx) => (
        <path key={bx} d={`M ${bx * 0.76} -168 Q ${bx * 0.95} -118 ${bx} -62`} fill="none"
          stroke={KRP.ink} strokeWidth={3.2} opacity={0.3} />
      ))}
      {/* ===== ダブレット (ボタンの列つきの胴衣) ===== */}
      <path d="M -42 -186 L 42 -186 L 49 -106 L -49 -106 Z"
        fill={KEP_DOUB} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* 腰のタブ (ペプラム) */}
      <path d="M -51 -108 L 51 -108 L 55 -76 L -55 -76 Z"
        fill={KEP_DOUB} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {[-26, 0, 26].map((bx) => (
        <line key={bx} x1={bx} y1={-104} x2={bx + bx * 0.08} y2={-78}
          stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      ))}
      {/* 胴衣の切り替え (脇の縦線) */}
      {[-27, 27].map((bx) => (
        <line key={bx} x1={bx} y1={-182} x2={bx + bx * 0.1} y2={-110}
          stroke={KRP.ink} strokeWidth={3} opacity={0.26} />
      ))}
      {/* ボタンの列 (まんなか) */}
      <line x1={0} y1={-182} x2={0} y2={-108} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={0} cy={-178 + i * 9} r={4.6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.2} />
      ))}
      {/* 帯 (ウエスト) */}
      <rect x={-50} y={-114} width={100} height={11} rx={5} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3.5} />
      {/* ガウンの前立て (ダブレットの両わきに重なる) */}
      <path d="M -42 -188 Q -56 -126 -64 -58 L -99 -56 Q -84 -126 -60 -190 Z"
        fill={KEP_GOWN} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 42 -188 Q 56 -126 64 -58 L 99 -56 Q 84 -126 60 -190 Z"
        fill={KEP_GOWN} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* 腕 (ガウンの袖 → 切り替え → ダブレットの前腕 → カフス) */}
      <KeplerArm m={-1} rot={rL} />
      <KeplerArm m={1} rot={rR} />
      {/* 首 */}
      <rect x={-21} y={-202} width={42} height={30} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
      {/* ===== ひだ襟 (ラフ) ===== */}
      {Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <ellipse key={i} cx={Math.cos(a) * 82} cy={-172 + Math.sin(a) * 25}
            rx={16} ry={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.2}
            transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 82} ${-172 + Math.sin(a) * 25})`} />
        );
      })}
      <ellipse cx={0} cy={-172} rx={84} ry={27} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      {/* ひだ (放射状の折り) */}
      {Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <line key={i} x1={Math.cos(a) * 30} y1={-172 + Math.sin(a) * 10}
            x2={Math.cos(a) * 80} y2={-172 + Math.sin(a) * 25}
            stroke={KRP.ink} strokeWidth={3} opacity={0.38} />
        );
      })}
      <ellipse cx={0} cy={-174} rx={29} ry={11} fill={SKIN} stroke={KRP.ink} strokeWidth={3.5} />
      {/* ===== 顔 ===== */}
      <circle cx={0} cy={-248} r={58} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 髪 (短髪) */}
      <path d="M -58 -256 Q -61 -310 0 -313 Q 61 -310 58 -256 Q 32 -284 0 -282 Q -32 -284 -58 -256 Z"
        fill={KEP_HAIR} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -58 -258 Q -66 -236 -58 -220" fill="none" stroke={KEP_HAIR} strokeWidth={11} strokeLinecap="round" />
      <path d="M 58 -258 Q 66 -236 58 -220" fill="none" stroke={KEP_HAIR} strokeWidth={11} strokeLinecap="round" />
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-34} y1={-250} x2={-12} y2={-250} />
          <line x1={12} y1={-250} x2={34} y2={-250} />
        </g>
      ) : (
        <g>
          <ellipse cx={-23} cy={-251} rx={12} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={23} cy={-251} rx={12} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-23 + gx} cy={-251 + gy} r={face === "surprised" ? 4.5 : 6} fill={KRP.ink} />
          <circle cx={23 + gx} cy={-251 + gy} r={face === "surprised" ? 4.5 : 6} fill={KRP.ink} />
        </g>
      )}
      {/* 眉 */}
      {face === "worried" ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-36} y1={-279} x2={-13} y2={-272} />
          <line x1={13} y1={-272} x2={36} y2={-279} />
        </g>
      ) : (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-36} y1={-275} x2={-13} y2={-279} />
          <line x1={13} y1={-279} x2={36} y2={-275} />
        </g>
      )}
      {/* 鼻 */}
      <path d="M 0 -246 Q 7 -232 -3 -230" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
      {/* 口 (口ひげの下) */}
      {face === "smile" ? (
        <path d="M -15 -214 Q 0 -202 15 -214" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "worried" ? (
        <path d="M -15 -206 Q 0 -218 15 -206" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "surprised" ? (
        <ellipse cx={0} cy={-211} rx={10} ry={12} fill={KRP.ink} />
      ) : (
        <line x1={-14} y1={-211} x2={14} y2={-211} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
      {/* 口ひげ */}
      <path d="M -30 -228 Q -16 -236 0 -226 Q 16 -236 30 -228 Q 16 -218 0 -222 Q -16 -218 -30 -228 Z"
        fill={KEP_HAIR} stroke={KRP.ink} strokeWidth={3.2} strokeLinejoin="round" />
      {/* あごひげ (短く刈りそろえた形) */}
      <path d="M -22 -205 Q -16 -176 0 -172 Q 16 -176 22 -205 Q 11 -196 0 -196 Q -11 -196 -22 -205 Z"
        fill={KEP_HAIR} stroke={KRP.ink} strokeWidth={3.2} strokeLinejoin="round" />
    </g>
  );
};

// ㉙ たとえ話の「母 (天文学)」と「娘 (占星術)」。17世紀の女性の装い。
const LadyArm: React.FC<{ m: 1 | -1; rot: number; cloth: string }> = ({ m, rot, cloth }) => (
  <g transform={`translate(${m * 48} -170) scale(${m} 1) rotate(${rot})`}>
    <path d="M -13 -10 Q 20 -8 23 26 Q 26 50 16 58 L -16 54 Q -7 24 -13 -10 Z"
      fill={cloth} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <rect x={-7} y={46} width={23} height={34} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-10} y={76} width={29} height={13} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={5} cy={102} r={13} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

const Lady: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  cloth?: string; skirt?: string;
  face?: "normal" | "worried" | "surprised" | "smile"; gaze?: [number, number]; lean?: number;
  gaunt?: boolean; armR?: number; armL?: number;
}> = ({
  x, y, s = 1, f = 0, phase = 0, cloth = KRP.blueDeep, skirt = KRP.blueSoft,
  face = "normal", gaze = [0, 0], lean = 0, gaunt = false, armR, armL,
}) => {
    const bob = bobOf(f, phase);
    const blink = ((f + phase * 41) % 97) < 5 && f > 2;
    const [gx, gy] = gaze;
    const sw = Math.sin((f + phase * 11) / 17) * 2.6;
    const rR = armR === undefined ? sw : armR + Math.sin((f + phase * 7) / 15) * 1.5;
    const rL = armL === undefined ? -sw : armL + Math.sin((f + phase * 9) / 16) * 1.5;
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 靴の先 (すそからのぞく) */}
        <ellipse cx={-22} cy={-8} rx={20} ry={9} fill={KRP.ink} />
        <ellipse cx={22} cy={-8} rx={20} ry={9} fill={KRP.ink} />
        {/* 長いスカート */}
        <path d="M -46 -128 L 46 -128 Q 82 -76 92 -14 L -92 -14 Q -82 -76 -46 -128 Z"
          fill={skirt} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {[-58, -28, 28, 58].map((bx) => (
          <path key={bx} d={`M ${bx * 0.55} -118 Q ${bx * 0.85} -66 ${bx} -20`} fill="none"
            stroke={KRP.ink} strokeWidth={3.2} opacity={0.3} />
        ))}
        {/* 前かけ (エプロン) */}
        <path d="M -30 -126 L 30 -126 Q 40 -78 44 -22 L -44 -22 Q -40 -78 -30 -126 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        {/* 胴着 (先のとがった腰) */}
        <path d="M -44 -182 L 44 -182 L 48 -126 L 0 -112 L -48 -126 Z"
          fill={cloth} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 胴着の編み上げ */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} stroke={KRP.brass} strokeWidth={3.5} strokeLinecap="round">
            <line x1={-17} y1={-176 + i * 15} x2={17} y2={-168 + i * 15} />
            <line x1={17} y1={-176 + i * 15} x2={-17} y2={-168 + i * 15} />
          </g>
        ))}
        {/* 腕 */}
        <LadyArm m={-1} rot={rL} cloth={cloth} />
        <LadyArm m={1} rot={rR} cloth={cloth} />
        {/* 白い襟 */}
        <path d="M -44 -184 Q 0 -150 44 -184 Q 24 -196 0 -196 Q -24 -196 -44 -184 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        {/* 首 */}
        <rect x={-17} y={-206} width={34} height={22} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
        {/* 顔 */}
        <ellipse cx={0} cy={-242} rx={gaunt ? 48 : 53} ry={55} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 白いかぶりもの (コイフ) */}
        <path d="M -54 -248 Q -56 -300 0 -303 Q 56 -300 54 -248 Q 52 -268 0 -270 Q -52 -268 -54 -248 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -54 -250 Q -30 -268 0 -268 Q 30 -268 54 -250" fill="none"
          stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        {/* 目 */}
        {blink ? (
          <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
            <line x1={-31} y1={-244} x2={-11} y2={-244} />
            <line x1={11} y1={-244} x2={31} y2={-244} />
          </g>
        ) : (
          <g>
            <ellipse cx={-21} cy={-245} rx={11} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={21} cy={-245} rx={11} ry={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-21 + gx} cy={-245 + gy} r={5.5} fill={KRP.ink} />
            <circle cx={21 + gx} cy={-245 + gy} r={5.5} fill={KRP.ink} />
          </g>
        )}
        {/* 眉 */}
        {face === "worried" ? (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
            <line x1={-32} y1={-272} x2={-12} y2={-266} />
            <line x1={12} y1={-266} x2={32} y2={-272} />
          </g>
        ) : (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
            <line x1={-32} y1={-269} x2={-12} y2={-273} />
            <line x1={12} y1={-273} x2={32} y2={-269} />
          </g>
        )}
        {/* こけたほお (痩せている母) */}
        {gaunt && (
          <g stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" opacity={0.45}>
            <path d="M -36 -232 Q -32 -220 -36 -210" fill="none" />
            <path d="M 36 -232 Q 32 -220 36 -210" fill="none" />
          </g>
        )}
        {/* 口 */}
        {face === "smile"
          ? <path d="M -14 -216 Q 0 -204 14 -216" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
          : face === "worried"
            ? <path d="M -14 -208 Q 0 -220 14 -208" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
            : face === "surprised"
              ? <ellipse cx={0} cy={-213} rx={9} ry={12} fill={KRP.ink} />
              : <line x1={-12} y1={-213} x2={12} y2={-213} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />}
      </g>
    );
  };

// ローマの将軍 (赤い軍装 + 銀かぶと + 赤い前立て + マント)
// armUp: 右腕を高く上げる。Person には hideArm が無いので、右肩マントで体側の腕を隠してから描く
const RomanGeneral: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "worried" | "surprised" | "smile"; gaze?: [number, number]; lean?: number;
  armUp?: boolean;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0], lean = 0, armUp = false }) => {
  const bob = bobOf(f, phase);
  return (
    <g>
      {/* マント (体の後ろ) */}
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        <path d="M -56 -156 Q -96 -80 -78 -8 L -40 -16 Q -62 -84 -44 -150 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <Person x={x} y={y} s={s} cloth={KRP.red} clothDark={KRP.grayDark}
        f={f} phase={phase} face={face} gaze={gaze} lean={lean} hair="none" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {armUp && (
          <g>
            {/* 右肩のマント (ぶら下がった右腕を隠す) */}
            <path d="M 34 -158 Q 98 -120 88 -34 L 42 -40 Q 62 -108 28 -152 Z"
              fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            {/* 上げた右腕 */}
            <ArmX x={56} y={-152} rot={-140} len={112} color={KRP.red} />
          </g>
        )}
        {/* 胸あて */}
        <rect x={-46} y={-150} width={92} height={46} rx={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 前立て */}
        <path d="M -54 -296 Q 0 -388 54 -296 L 36 -290 Q 0 -358 -36 -290 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {/* かぶと */}
        <path d="M -66 -244 Q -66 -306 0 -308 Q 66 -306 66 -244 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-72} y={-250} width={144} height={13} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

// ===== この回の小物 (使い回しアイコン) =====
// 甲骨 (肩甲骨風の骨板)。crack 0〜1 でヒビが走り、branch で卜の枝。glyphs 0〜1 で刻み文字
const CRACK_PTS: [number, number][] = [[0, -150], [-14, -96], [10, -42], [-10, 22], [8, 84], [-4, 146]];
const OracleBone: React.FC<{
  x: number; y: number; s?: number; rot?: number; crack?: number; glyphs?: number;
}> = ({ x, y, s = 1, rot = 0, crack = 0, glyphs = 0 }) => {
  const c = clamp01(crack);
  const gl = clamp01(glyphs);
  // ヒビの進行: 進んだ分だけ折れ線を描く
  const total = CRACK_PTS.length - 1;
  const prog = c * total;
  const full = Math.floor(prog);
  const pts: [number, number][] = CRACK_PTS.slice(0, full + 1);
  if (full < total) {
    const [ax, ay] = CRACK_PTS[full];
    const [bx, by] = CRACK_PTS[full + 1];
    const tt = prog - full;
    pts.push([lerp(ax, bx, tt), lerp(ay, by, tt)]);
  }
  const glyphCols = [
    { x: -72, ys: [-110, -40, 30] },
    { x: 64, ys: [-96, -22, 52] },
  ];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -90 -170 Q -150 -60 -120 80 Q -96 180 0 196 Q 110 176 130 60 Q 146 -40 96 -150 Q 40 -210 -90 -170 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -74 -148 Q -118 -56 -96 66" fill="none" stroke={KRP.gray} strokeWidth={4} opacity={0.5} />
      {c > 0.01 && (
        <polyline points={pts.map(([px, py]) => `${px},${py}`).join(" ")} fill="none"
          stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" strokeLinecap="round" />
      )}
      {/* 卜の枝ヒビ */}
      {c > 0.55 && (
        <line x1={10} y1={-42} x2={10 + 58 * clamp01((c - 0.55) / 0.45)} y2={-42 - 30 * clamp01((c - 0.55) / 0.45)}
          stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
      )}
      {/* 刻まれた文字 (甲骨文字風の抽象ストローク) */}
      {gl > 0.01 && glyphCols.map((col, ci) =>
        col.ys.map((gy, gi) => {
          const show = gl > (ci * 3 + gi + 1) / 6.5;
          if (!show) return null;
          return (
            <g key={`${ci}-${gi}`} transform={`translate(${col.x} ${gy})`}
              stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" fill="none">
              {gi % 3 === 0 && <><rect x={-12} y={-14} width={24} height={28} rx={3} /><line x1={-12} y1={0} x2={12} y2={0} /></>}
              {gi % 3 === 1 && <><line x1={0} y1={-16} x2={0} y2={16} /><line x1={0} y1={-4} x2={14} y2={-14} /></>}
              {gi % 3 === 2 && <><line x1={-10} y1={-14} x2={0} y2={10} /><line x1={10} y1={-14} x2={0} y2={10} /><line x1={0} y1={10} x2={0} y2={18} /></>}
            </g>
          );
        })
      )}
    </g>
  );
};

// 頭のデコボコ (横顔 + こぶ + 区分けの点線。骨相学のアイコン)
const BumpHead: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 110 L -70 30 Q -110 -20 -92 -72 Q -74 -128 -8 -134 Q 24 -158 56 -130 Q 96 -118 92 -70 Q 110 -30 84 6 Q 96 40 64 46 L 64 110 Z"
      fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} />
    {/* こぶ (デコボコ) は輪郭のふくらみ + 点線の区画 */}
    <path d="M -88 -60 Q -30 -96 30 -80" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeDasharray="8 9" opacity={0.75} />
    <path d="M -70 -14 Q -14 -44 52 -30" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeDasharray="8 9" opacity={0.75} />
    <line x1={-8} y1={-134} x2={-2} y2={-28} stroke={KRP.ink} strokeWidth={3.5} strokeDasharray="8 9" opacity={0.75} />
    {/* 耳と目 */}
    <path d="M 30 -6 Q 52 -12 46 12 Q 40 28 26 18" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} />
    <circle cx={-66} cy={-38} r={6} fill={KRP.ink} />
  </g>
);

// インクのしみ (左右対称のもよう)
const InkBlot: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-150} width={240} height={300} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
    {[1, -1].map((m) => (
      <path key={m} transform={`scale(${m} 1)`}
        d="M 0 -84 Q 34 -92 44 -58 Q 84 -62 76 -20 Q 104 6 70 30 Q 86 72 42 70 Q 30 102 6 84 L 0 86 Z"
        fill={KRP.ink} opacity={0.88} />
    ))}
  </g>
);

// 4文字タイプのタイル (実在タイプ名にしない)
const TypeTiles: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {["T", "Y", "P", "E"].map((ch, i) => {
      const sc = pop(clamp01(t * 1.6 - i * 0.14));
      if (sc <= 0) return null;
      return (
        <g key={ch} transform={`translate(${(i - 1.5) * 92} 0) scale(${sc})`}>
          <rect x={-40} y={-40} width={80} height={80} rx={12}
            fill={i % 2 ? KRP.blueSoft : KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50}
            fill={KRP.ink}>{ch}</text>
        </g>
      );
    })}
  </g>
);

// スマホ
const Smartphone: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-150} width={160} height={300} rx={26} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-66} y={-128} width={132} height={248} rx={12} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    {[0, 1, 2].map((r) => [0, 1].map((cc) => (
      <rect key={`${r}${cc}`} x={-46 + cc * 54} y={-104 + r * 56} width={38} height={38} rx={9}
        fill={[KRP.orange, KRP.green, KRP.yellow, KRP.blue, KRP.red, KRP.white][r * 2 + cc]}
        stroke={KRP.ink} strokeWidth={3.5} />
    )))}
  </g>
);

// 床 (屋内外の地面)
const Floor: React.FC<{ y?: number; color?: string }> = ({ y = 940, color = KRP.floor }) => (
  <g>
    <rect x={-20} y={y} width={W + 40} height={H - y + 20} fill={color} opacity={0.85} />
    <line x1={-20} y1={y} x2={W + 20} y2={y} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// ===== 第1章・中国ブロック共通の背景 (薄い朱 + 上端の飾り帯 + 漂う雲紋) =====
// #17〜#28 の全シーンに同じ処理で敷いて、章のメリハリを出す
const ChinaCloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.3 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={KRP.red}
    strokeWidth={5} strokeLinecap="round" opacity={o}>
    <path d="M -70 0 Q -70 -34 -36 -34 Q -40 -12 -18 -16 Q -22 -46 14 -44 Q 44 -42 40 -14 Q 66 -20 70 0 Z" />
    <path d="M -36 -34 Q -10 -30 -18 -16" />
  </g>
);
const ChinaBg: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 薄い朱の空気 */}
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.red} opacity={0.07} />
    {/* 上端の飾り帯 (雷文風のもよう) */}
    <rect x={-20} y={-20} width={W + 40} height={96} fill={KRP.red} opacity={0.88} />
    <line x1={-20} y1={78} x2={W + 20} y2={78} stroke={KRP.brass} strokeWidth={6} />
    {Array.from({ length: 16 }, (_, i) => (
      <g key={i} transform={`translate(${60 + i * 124} 30)`} stroke={KRP.yellow} strokeWidth={4.5} fill="none">
        <path d="M -22 14 L -22 -14 L 22 -14 L 22 2 L -4 2 L -4 -4" />
      </g>
    ))}
    {/* 漂う雲紋 (控えめにゆれる) */}
    <ChinaCloud x={240 + Math.sin(f / 40) * 14} y={300} s={1.1} />
    <ChinaCloud x={1680 + Math.sin(f / 34 + 2) * 14} y={260} s={0.9} />
    <ChinaCloud x={1540 + Math.sin(f / 46 + 4) * 10} y={790} s={0.8} o={0.2} />
  </g>
);

// ===== 実物の亀と牛 (甲羅・骨の「もとの持ち主」) =====
const RealTurtle: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const step = Math.sin(f / 9);
  const headBob = Math.sin(f / 14) * 3;
  const blink = (f % 97) < 5 && f > 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* あし (甲羅の下から4本。交互にちょこちょこ) */}
      {[-62, -20, 28, 66].map((lx, i) => (
        <path key={i} d={`M ${lx} -16 Q ${lx - 6 + (i % 2 ? step : -step) * 5} 4 ${lx - 4 + (i % 2 ? step : -step) * 8} 12
          L ${lx + 14 + (i % 2 ? step : -step) * 8} 12 Q ${lx + 14} -2 ${lx + 12} -16 Z`}
          fill={KRP.green} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      ))}
      {/* しっぽ */}
      <path d="M -92 -26 Q -116 -22 -112 -8 Q -98 -12 -88 -16 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
      {/* 甲羅 (ドーム + 甲板のもよう) */}
      <path d="M -92 -16 Q -100 -92 0 -100 Q 100 -92 92 -16 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -98 -16 Q 0 2 98 -16 L 92 -4 Q 0 14 -92 -4 Z" fill={KRP.copper} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 甲板 (六角風の区画) */}
      <g fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.7}>
        <path d="M -34 -92 L -42 -58 L -22 -32 L 14 -32 L 30 -60 L 18 -90" />
        <path d="M -42 -58 L -78 -52 M 30 -60 L 68 -56 M -22 -32 L -30 -16 M 14 -32 L 20 -16" />
      </g>
      {/* 首と頭 */}
      <g transform={`translate(0 ${headBob})`}>
        <path d="M 88 -44 Q 112 -52 122 -40 L 120 -22 Q 104 -18 90 -24 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={130} cy={-42} r={21} fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} />
        {blink
          ? <line x1={128} y1={-48} x2={140} y2={-48} stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
          : <circle cx={134} cy={-48} r={4.5} fill={KRP.ink} />}
        <path d="M 144 -38 Q 152 -36 148 -30" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
      </g>
    </g>
  );
};

const RealCow: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const tail = Math.sin(f / 12) * 14;
  const headBob = Math.sin(f / 15) * 3;
  const blink = ((f + 31) % 97) < 5 && f > 2;
  return (
    // 左向き (骨のとなりに添える)
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* しっぽ (ゆらゆら) */}
      <g transform={`rotate(${tail} 96 -128)`}>
        <path d="M 96 -128 Q 124 -90 116 -44" fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        <path d="M 116 -52 Q 128 -36 114 -26 Q 104 -38 110 -50 Z" fill={KRP.ink} />
      </g>
      {/* うしろ脚・まえ脚 */}
      {[[-74, 0], [-40, 1], [48, 0], [82, 1]].map(([lx, back], i) => (
        <g key={i}>
          <rect x={lx} y={-70} width={22} height={66} rx={8}
            fill={back ? "#E4DCCB" : KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={lx - 1} y={-14} width={24} height={14} rx={4} fill={KRP.ink} />
        </g>
      ))}
      {/* 胴体 (白地に斑) */}
      <path d="M -96 -70 Q -108 -150 -40 -158 L 70 -158 Q 112 -150 104 -70 Q 60 -52 0 -52 Q -60 -52 -96 -70 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M 20 -150 Q 64 -156 78 -128 Q 76 -100 42 -102 Q 14 -112 20 -150 Z" fill={KRP.ink} opacity={0.82} />
      <path d="M -70 -92 Q -52 -112 -30 -98 Q -30 -74 -58 -74 Q -74 -78 -70 -92 Z" fill={KRP.ink} opacity={0.82} />
      {/* 頭 (左向き) */}
      <g transform={`translate(-108 ${-150 + headBob})`}>
        {/* つの */}
        <path d="M -8 -34 Q -26 -56 -46 -52 Q -28 -40 -22 -24 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 26 -36 Q 36 -60 58 -60 Q 44 -42 40 -26 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
        {/* 耳 */}
        <path d="M 30 -22 Q 52 -28 56 -12 Q 42 -6 30 -12 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 顔 */}
        <path d="M -24 -34 Q 30 -42 34 -8 Q 36 24 10 34 Q -24 38 -34 12 Q -38 -16 -24 -34 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 鼻先 */}
        <path d="M -36 10 Q -38 36 -12 38 Q 8 38 8 22 Q 6 6 -14 6 Q -30 4 -36 10 Z"
          fill="#F0B8A8" stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={-22} cy={22} rx={5} ry={7} fill={KRP.ink} />
        {blink
          ? <line x1={2} y1={-12} x2={16} y2={-12} stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
          : <circle cx={9} cy={-12} r={5} fill={KRP.ink} />}
      </g>
    </g>
  );
};

// ===== メソポタミア風の人 (ひだのある段々の長衣 + 巻き毛のひげ。中国の人物と描き分け) =====
const MesoPerson: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "worried" | "surprised" | "smile"; gaze?: [number, number]; lean?: number;
  beard?: boolean; crown?: boolean;
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0], lean = 0, beard = true, crown = false }) => {
  const bob = bobOf(f, phase);
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  // ひだ (フリンジ) の波々を1段ぶん作る
  const fringe = (fy: number, half: number) => (
    <path d={Array.from({ length: Math.ceil((half * 2) / 16) }, (_, i) => `M ${-half + i * 16} ${fy} q 8 14 16 0`).join(" ")}
      fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.65} />
  );
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 段々の長衣 */}
      <path d="M -52 -160 L 52 -160 L 76 -6 L -76 -6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 肩がけの布 (ななめ) */}
      <path d="M 8 -160 L 52 -160 L -34 -6 L -76 -6 Z" fill="#E4DCCB" stroke={KRP.ink} strokeWidth={4.5} />
      {/* フリンジ3段 */}
      {fringe(-112, 58)}
      {fringe(-62, 66)}
      {fringe(-14, 74)}
      {/* 腕 */}
      <rect x={-74} y={-150} width={21} height={78} rx={10} fill="#E4DCCB" stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={53} y={-150} width={21} height={78} rx={10} fill="#E4DCCB" stroke={KRP.ink} strokeWidth={4.5} />
      {/* 足先 */}
      <ellipse cx={-26} cy={-3} rx={17} ry={7} fill={KRP.ink} />
      <ellipse cx={26} cy={-3} rx={17} ry={7} fill={KRP.ink} />
      {/* 頭 */}
      <circle cx={0} cy={-224} r={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 巻き毛の黒髪 (ふち) */}
      <path d="M -60 -236 Q -62 -288 0 -292 Q 62 -288 60 -236 Q 28 -254 0 -254 Q -28 -254 -60 -236 Z" fill={KRP.ink} />
      {[-46, -28, -10, 8, 26, 44].map((hx) => (
        <circle key={hx} cx={hx} cy={-244} r={9} fill={KRP.ink} />
      ))}
      <circle cx={-58} cy={-226} r={10} fill={KRP.ink} />
      <circle cx={58} cy={-226} r={10} fill={KRP.ink} />
      {beard ? (
        <g>
          {/* 巻き毛のあごひげ (四角く長い) */}
          <path d="M -36 -200 Q -42 -118 0 -108 Q 42 -118 36 -200 Q 18 -188 0 -188 Q -18 -188 -36 -200 Z" fill={KRP.ink} />
          <g fill="none" stroke={KRP.grayDark} strokeWidth={3} opacity={0.8}>
            {[-156, -136].map((by) => (
              <path key={by} d={`M -26 ${by} q 7 9 14 0 q 7 9 14 0 q 7 9 14 0 q 7 9 14 0`}
                transform="translate(-5 0)" />
            ))}
          </g>
        </g>
      ) : (
        // ひげなしの人は布の鉢巻き
        <path d="M -60 -252 Q 0 -268 60 -252 L 60 -238 Q 0 -254 -60 -238 Z"
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      )}
      {crown && (
        // 金の王冠 (山形の帯。宗教シンボルにしない)
        <path d="M -46 -266 L 46 -266 L 46 -292 L 26 -278 L 13 -300 L 0 -282 L -13 -300 L -26 -278 L -46 -292 Z"
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={-218} x2={-14} y2={-218} />
          <line x1={14} y1={-218} x2={32} y2={-218} />
        </g>
      ) : (
        <g>
          <circle cx={-22 + gx} cy={-218 + gy} r={6} fill={KRP.ink} />
          <circle cx={22 + gx} cy={-218 + gy} r={6} fill={KRP.ink} />
        </g>
      )}
      {/* 眉・口 */}
      <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" fill="none">
        {face === "worried" ? (
          <g><line x1={-32} y1={-246} x2={-12} y2={-240} /><line x1={12} y1={-240} x2={32} y2={-246} /></g>
        ) : face === "surprised" ? (
          <g><line x1={-32} y1={-250} x2={-12} y2={-250} /><line x1={12} y1={-250} x2={32} y2={-250} /></g>
        ) : (
          <g><line x1={-32} y1={-244} x2={-12} y2={-246} /><line x1={12} y1={-246} x2={32} y2={-244} /></g>
        )}
        {!beard && (face === "surprised" ? (
          <ellipse cx={0} cy={-184} rx={9} ry={12} fill={KRP.ink} />
        ) : face === "smile" ? (
          <path d="M -13 -190 Q 0 -177 13 -190" />
        ) : face === "worried" ? (
          <path d="M -11 -182 Q 0 -190 11 -182" />
        ) : (
          <line x1={-9} y1={-184} x2={9} y2={-184} />
        ))}
      </g>
    </g>
  );
};

// ジッグラト風の段状建築 (シルエット。宗教シンボルにしない)
const Ziggurat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.6}>
    {[[300, 0], [230, 1], [165, 2], [100, 3]].map(([half, i]) => (
      <rect key={i} x={-half} y={-80 * (i + 1)} width={half * 2} height={80}
        fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
    ))}
    {/* 正面の大階段 */}
    <polygon points="-56,0 56,0 20,-316 -20,-316" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line key={i} x1={-50 + i * 4.6} y1={-40 - i * 40} x2={50 - i * 4.6} y2={-40 - i * 40}
        stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
    ))}
  </g>
);

// ===== 導入 (#1〜#15) =====
// 導入のアタマ (#1〜#6) は「真っ暗な舞台にスポットライト一本」で通す。
// 台本が「あなた」と二人称で語りかけるので、画面のこちら側=客席=あなた、という作り。
// そのため導入には代役の人 (Person) を出さない。ウラナイ屋1号だけが光の中にいる。
// (ウラナイ屋1号は第12章のタネ明かしで再登場するので、ここで必ず顔を見せておく)
const STAGE_BLACK = "#0C0A14";

// 導入専用のガワ: 暗転した舞台 + 上から降りるスポットライト。
// spot=光の強さ / cx,cy,r=光の中心と広がり / white=白フラッシュ / fade=全体のフェードイン
const DarkStage: React.FC<{
  f: number; seed: number;
  spot?: number; cx?: number; cy?: number; r?: number;
  white?: number; fade?: number;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, spot = 1, cx = 960, cy = 640, r = 620, white = 0, fade = 1, over, children }) => (
  <AbsoluteFill style={{ background: STAGE_BLACK }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <defs>
        <radialGradient id={`spot${seed}`}>
          <stop offset="0%" stopColor={PUR.glow} stopOpacity={0.55} />
          <stop offset="45%" stopColor={PUR.glow} stopOpacity={0.26} />
          <stop offset="100%" stopColor={PUR.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g opacity={clamp01(spot) * clamp01(fade)}>
        {/* 上から降りてくる光の筋 */}
        <polygon fill={PUR.glow} opacity={0.085}
          points={`${cx - r * 0.24},-40 ${cx + r * 0.24},-40 ${cx + r},${cy + r * 0.6} ${cx - r},${cy + r * 0.6}`} />
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.02} fill={`url(#spot${seed})`} />
        {/* 床に落ちる光だまり */}
        <ellipse cx={cx} cy={1014} rx={r * 0.72} ry={64} fill={PUR.glow} opacity={0.18} />
      </g>
      <g filter="url(#wobble)" opacity={clamp01(fade)}>{children}</g>
      {white > 0.004 && (
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.white} opacity={clamp01(white)} />
      )}
    </svg>
    {over}
    <WBadge />
    <Atmosphere f={f} dark />
  </AbsoluteFill>
);

// #1 いきなり診断 (真っ暗 → 水晶玉のどアップ。中からこちらを見ている影)
const SceneShindanStart: React.FC<{ f: number }> = ({ f }) => {
  const fade = easeOut(seg(f, 0, 18)); // 暗転から浮かび上がる
  const zoom = lerp(1.12, 1.0, easeOut(seg(f, 0, 110))); // ゆっくり寄りが落ち着く
  const shade = easeOut(seg(f, 22, 54)); // 中の影がこちらを向く
  const eyeGlow = 0.55 + 0.45 * Math.sin(f / 9);
  return (
    <DarkStage f={f} seed={300} fade={fade} spot={0.5} cx={960} cy={520} r={780}>
      <g transform={`translate(960 520) scale(${zoom})`}>
        {/* 玉 */}
        <circle cx={0} cy={0} r={408} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={9} opacity={0.95} />
        <circle cx={0} cy={0} r={408} fill={PUR.glow} opacity={0.3 + 0.07 * Math.sin(f / 12)} />
        {/* 中のもや (ゆっくり渦をまく) */}
        {[0, 1, 2, 3].map((i) => {
          const a = f / 13 + i * 1.9;
          return (
            <ellipse key={i} cx={Math.cos(a) * 130} cy={Math.sin(a * 0.8) * 86}
              rx={168} ry={66} fill={KRP.white} opacity={0.13}
              transform={`rotate(${Math.sin(a) * 18} ${Math.cos(a) * 130} ${Math.sin(a * 0.8) * 86})`} />
          );
        })}
        {/* 中からこちらを見ている影 (ターバンの占い師のシルエット) */}
        <g opacity={shade}>
          <path d="M -168 330 Q -156 120 -96 52 Q -124 -36 -62 -96 Q 0 -150 62 -96 Q 124 -36 96 52 Q 156 120 168 330 Z"
            fill={PUR.deep} opacity={0.9} />
          <path d="M -92 -42 Q -76 -140 0 -148 Q 76 -140 92 -42 Q 46 -80 0 -80 Q -46 -80 -92 -42 Z"
            fill={KRP.ink} opacity={0.8} />
          {/* 目だけが光ってこちらを見る */}
          <g opacity={0.45 + 0.55 * eyeGlow}>
            <ellipse cx={-34} cy={-24} rx={17} ry={10} fill={KRP.yellow} />
            <ellipse cx={34} cy={-24} rx={17} ry={10} fill={KRP.yellow} />
            <ellipse cx={-34} cy={-24} rx={34} ry={20} fill={KRP.yellow} opacity={0.3} />
            <ellipse cx={34} cy={-24} rx={34} ry={20} fill={KRP.yellow} opacity={0.3} />
          </g>
        </g>
        {/* ガラスの照り返し */}
        <path d="M -250 -210 Q -170 -320 -40 -332" fill="none" stroke={KRP.white} strokeWidth={26}
          strokeLinecap="round" opacity={0.55} />
        <path d="M -288 -118 Q -268 -190 -224 -244" fill="none" stroke={KRP.white} strokeWidth={13}
          strokeLinecap="round" opacity={0.4} />
        {/* 玉のふち (下側の受け) */}
        <path d="M -408 0 A 408 408 0 0 0 408 0" fill="none" stroke={KRP.ink} strokeWidth={9} opacity={0.25} />
      </g>
    </DarkStage>
  );
};

// #2 うーん…… (玉から引くと、スポットの中にウラナイ屋1号。客席=あなたはこちら側)
const SceneUnun: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeOut(seg(f, 0, 30)); // どアップから引く
  const sc = lerp(2.6, 1, pull);
  const rock = Math.sin(f / 8) * 1.6; // うなりながら左右にゆれる
  const flick = 0.3 + 0.25 * Math.sin(f / 3) + 0.18 * Math.sin(f / 7 + 2); // 占い中の明滅
  // 機械の水晶玉の位置 (ここを中心に引く)
  const KX = 900, KY = 1000 - 352 * 0.9;
  return (
    <DarkStage f={f} seed={301} spot={0.92} cx={900} cy={lerp(660, 630, pull)} r={lerp(400, 660, pull)}>
      <g transform={`translate(${KX} ${KY}) scale(${sc}) translate(${-KX} ${-KY})`}>
        <ellipse cx={900} cy={1004} rx={330} ry={26} fill="#000000" opacity={0.45} />
        <g transform={`rotate(${rock} 900 1000)`}>
          <UranaiMachine x={900} y={1000} s={0.9} f={f} />
        </g>
        {/* 窓の中があやしく明滅 (考え込み中のランプ) */}
        <ellipse cx={900} cy={570} rx={215} ry={145} fill={PUR.glow} opacity={clamp01(flick) * 0.4} />
        {/* 水晶玉の中のもや */}
        {[0, 1].map((i) => {
          const a = f / 9 + i * Math.PI;
          return (
            <ellipse key={i} cx={900 + Math.cos(a) * 14} cy={KY + Math.sin(a) * 8}
              rx={24} ry={11} fill={KRP.white} opacity={0.35} />
          );
        })}
      </g>
      <Bubble x={1520} y={360} w={360} h={130} tailTo={[1030, 580]} text="うーん……" size={46}
        t={seg(f, 24, 40)} />
      {/* 考え中の点々 */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={1380 + i * 56} cy={500 - i * 34} r={10 + i * 3}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4} opacity={seg(f, 26 + i * 6, 34 + i * 6)} />
      ))}
    </DarkStage>
  );
};

// #3-4 はあっ! 見えました (スポット全開 + 白フラッシュ。回る飾りは置かない)
const SceneMieta: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 2, 13)); // 暗がり → スポット全開
  const hop = pop(seg(f, 2, 12)) * (1 - easeOut(seg(f, 14, 30))); // ハッと跳ねて戻る
  const glow = easeOut(seg(f, 3, 16));
  const puls = 0.5 + 0.5 * Math.sin(f / 5);
  const white = 0.9 * pop(seg(f, 3, 9)) * (1 - easeOut(seg(f, 8, 24))); // 一発の白フラッシュ
  const KY = 1005 - 352 * 0.9;
  return (
    <DarkStage f={f} seed={302} white={white}
      spot={lerp(0.85, 1, open)} cx={900} cy={lerp(640, 560, open)} r={lerp(560, 1020, open)}>
      <ellipse cx={900} cy={1009} rx={330} ry={26} fill="#000000" opacity={0.45 * (1 - open * 0.5)} />
      <g transform={`translate(0 ${-26 * hop})`}>
        <UranaiMachine x={900} y={1005} s={0.9} f={f} />
      </g>
      {/* 水晶玉がカッと光る */}
      <circle cx={900} cy={KY - 26 * hop} r={lerp(70, 150, puls)} fill={KRP.white} opacity={0.3 * glow} />
      <circle cx={900} cy={KY - 26 * hop} r={lerp(44, 78, puls)} fill={KRP.white} opacity={0.92 * glow} />
      {/* ハッと目が開いた瞬間のびっくり線 (頭のまわり) */}
      <Burst x={900} y={560 - 26 * hop} r={100} color={KRP.white} t={seg(f, 4, 14)} n={8} />
      <Bubble x={1480} y={370} w={330} h={132} tailTo={[1000, 600]} text="はあっ!" size={52}
        t={seg(f, 8, 22)} color={KRP.red} />
    </DarkStage>
  );
};

// 画面にベタッと貼りつく言葉 (大きいところから叩きつけるように小さくなる)
const SlapWord: React.FC<{
  x: number; y: number; text: string; size?: number; rot?: number; fill?: string; t?: number;
}> = ({ x, y, text, size = 56, rot = 0, fill = KRP.yellow, t = 1 }) => {
  const k = clamp01(t);
  if (k <= 0) return null;
  const hit = easeOut(clamp01(k * 2.2)); // 迫ってきて貼りつくまで
  const sc = lerp(2.3, 1, hit);
  const w = text.length * size + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rot})`} opacity={clamp01(k * 3)}>
      <rect x={-w / 2 + 10} y={-size * 0.86 + 12} width={w} height={size * 1.72} rx={8}
        fill={KRP.ink} opacity={0.35} />
      <rect x={-w / 2} y={-size * 0.86} width={w} height={size * 1.72} rx={8}
        fill={fill} stroke={KRP.ink} strokeWidth={6} />
      <text x={0} y={size * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={KRP.ink}>{text}</text>
    </g>
  );
};

// #5 診断書がこちらへ迫り、言葉が画面にベタッと貼られる
const SceneShindanPaper: React.FC<{ f: number }> = ({ f }) => {
  const come = easeOut(seg(f, 0, 20)); // 紙がこちらへ迫ってくる
  const sc = lerp(0.25, 2.15, come);
  const rot = lerp(26, -4, come);
  const sway = Math.sin(f / 26) * 1.2 * come;
  const words = [
    { text: "しっかりしている", x: 1300, y: 265, rot: -6, fill: KRP.yellow, at: 22, size: 62 },
    { text: "でも、心配性", x: 1380, y: 620, rot: 7, fill: KRP.blueSoft, at: 52, size: 70 },
  ];
  return (
    <DarkStage f={f} seed={303} spot={0.8} cx={700} cy={500} r={760}>
      {/* 迫ってくる診断書 */}
      <g transform={`rotate(${sway} 700 470)`}>
        <ShindanSho x={700} y={470} s={sc} rot={rot} t={1} />
      </g>
      {/* 言葉が画面に叩きつけられる */}
      {words.map((w2, i) => (
        <g key={i}>
          <Burst x={w2.x} y={w2.y} r={150} color={KRP.white}
            t={clamp01(seg(f, w2.at, w2.at + 6)) * (1 - easeOut(seg(f, w2.at + 4, w2.at + 16)))} n={10} />
          <SlapWord {...w2} t={seg(f, w2.at, w2.at + 10)} />
        </g>
      ))}
    </DarkStage>
  );
};

// 足あと (上向きの足型。rot で進む向きを変える)
const Footprint: React.FC<{
  x: number; y: number; rot?: number; s?: number; fill?: string; o?: number;
}> = ({ x, y, rot = 0, s = 1, fill = KRP.white, o = 1 }) => {
  if (o <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={clamp01(o)}>
      <path d="M 0 -42 Q 24 -42 24 -8 Q 24 14 12 28 Q 0 40 -12 28 Q -24 14 -24 -8 Q -24 -42 0 -42 Z"
        fill={fill} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={0} cy={48} rx={15} ry={11} fill={fill} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// #6 人に合わせるのは得意。でも本当は、自分のペースを乱されたくない。
// ここで明転していつもの紙の背景にもどる。
// きちっと等間隔でそろって歩く足あとの列から、ひと組だけが自分の歩幅で外れていく絵。
const SceneJibunPace: React.FC<{ f: number }> = ({ f }) => {
  const back = 1 - easeOut(seg(f, 0, 14)); // 白からパッと明転
  const row = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // そろって歩く足あと (等間隔)
  const own = [0, 1, 2, 3]; // 自分の歩幅で外れる足あと (広めの間隔)
  const leave = clamp01(seg(f, 54, 66)); // 列から外れるところ
  return (
    <Frame f={f} seed={308}
      over={back > 0.01 ? <div style={{ ...abs, background: KRP.white, opacity: back }} /> : null}>
      {/* そろって歩く足あと: 同じ大きさ・同じ向き・同じ間隔 */}
      {row.map((i) => (
        <Footprint key={i} x={130 + i * 116} y={395 + (i % 2 ? 34 : -34)} rot={92} s={0.92}
          fill={KRP.grayDark} o={0.5 * clamp01(seg(f, 2 + i * 3, 10 + i * 3))} />
      ))}
      {/* このまま進むはずだった道 (うすく消えていく) */}
      <g opacity={0.5 * (1 - leave * 0.7)}>
        <line x1={1200} y1={395} x2={1760} y2={395} stroke={KRP.grayDark} strokeWidth={5}
          strokeDasharray="16 20" strokeLinecap="round" />
        <path d="M 1730 370 L 1776 395 L 1730 420" fill="none" stroke={KRP.grayDark}
          strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* 列から外れて、自分の歩幅でゆっくり下りていく */}
      {own.map((i) => (
        <Footprint key={i} x={1215 + i * 168} y={480 + i * 92} rot={128} s={1.1}
          fill={KRP.orange} o={clamp01(seg(f, 56 + i * 10, 66 + i * 10))} />
      ))}
      {/* 外れるところの小さな矢印 */}
      <g opacity={leave}>
        <path d="M 1120 420 Q 1170 452 1196 492" fill="none" stroke={KRP.orange} strokeWidth={6}
          strokeLinecap="round" strokeDasharray="12 14" />
      </g>
      <TagPlate x={560} y={190} text="人に合わせるのは得意" size={46} t={seg(f, 24, 38)} fill={KRP.white} />
      <TagPlate x={1210} y={790} text="でも本当は、自分のペース" size={46} t={seg(f, 94, 110)} fill={KRP.yellow} />
    </Frame>
  );
};

// #7-8 明転して、いつもの紙の背景へ。手元には診断書 (我に返る)
const SceneAtariCheck: React.FC<{ f: number }> = ({ f }) => {
  const dok = Math.sin(f / 6) * 3;
  return (
    <Frame f={f} seed={304} caption="ちょっと、当たっていませんか?">
      {/* 手に持った診断書 (視点はあなた自身) */}
      <g transform={`rotate(${dok * 0.4} 880 640)`}>
        <Burst x={880} y={640} r={330} color={KRP.red} t={seg(f, 10, 26)} n={10} />
        <ShindanSho x={880} y={630} s={1.45} rot={-4} t={1} />
        {/* 紙のふちを持つ両手 */}
        {[[-186, 196, 10], [182, 212, -8]].map(([hx, hy, hr], i) => (
          <g key={i} transform={`translate(${880 + hx} ${630 + hy}) rotate(${hr})`}>
            <path d="M -74 90 L -74 -22 Q -74 -56 -42 -56 Q -10 -56 -10 -22 L -10 -40
              Q -10 -70 20 -70 Q 50 -70 50 -40 L 50 -16 Q 78 -20 78 10 L 78 90 Z"
              fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
          </g>
        ))}
      </g>
      <Bubble x={1500} y={330} w={360} h={128} tailTo={[1120, 560]} text="ドキッ……" size={46}
        t={seg(f, 16, 32)} color={KRP.red} />
    </Frame>
  );
};

// #9 タネは最後に明かします
const SceneTaneYokoku: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 6, 26);
  return (
    <Frame f={f} seed={305} caption="タネは、この動画の最後で"
      over={<Stamp x={1280} y={640} text="種明かしは最後" size={48} />}>
      <Floor y={1000} />
      <ellipse cx={430} cy={1006} rx={330} ry={24} fill={KRP.grayDark} opacity={0.3} />
      <UranaiMachine x={430} y={1000} s={0.82} f={f} />
      {/* 大きな?カード */}
      <g transform={`translate(1050 560) scale(${pop(t)})`}>
        <rect x={-200} y={-250} width={400} height={500} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={230}
          fill={KRP.blueDeep}>?</text>
      </g>
      <Burst x={1050} y={300} r={60} color={KRP.orange} t={seg(f, 20, 36)} />
    </Frame>
  );
};

// #10 星座・血液型・4文字タイプ (占いづくし。ここから紙地に戻る)
const SceneUranaiZukushi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={306} caption="毎日なにかに「診断」されている">
    {/* 星座のパネル */}
    <g transform={`translate(430 560) scale(${pop(seg(f, 0, 18))})`}>
      <rect x={-200} y={-240} width={400} height={480} rx={18} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
      {[[-120, -150], [-40, -80], [60, -130], [120, -30], [30, 50], [-90, 90]].map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={8 + (i % 2) * 3} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3}
          opacity={0.7 + 0.3 * Math.sin(f / 9 + i * 1.3)} />
      ))}
      <polyline points="-120,-150 -40,-80 60,-130 120,-30 30,50 -90,90" fill="none"
        stroke={KRP.white} strokeWidth={3.5} opacity={0.65} />
      <text x={0} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white}>星座占い</text>
    </g>
    {/* 血液型のパネル (あるある表現はしない。文字だけ) */}
    <g transform={`translate(960 560) scale(${pop(seg(f, 10, 28))})`}>
      <rect x={-200} y={-240} width={400} height={480} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={-70} r={92} fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} opacity={0.9} />
      <text x={0} y={-48} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.white}>?</text>
      <text x={0} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>血液型</text>
    </g>
    {/* 質問に答えて4文字 */}
    <g transform={`translate(1490 560) scale(${pop(seg(f, 20, 38))})`}>
      <rect x={-200} y={-240} width={400} height={480} rx={18} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${-170 + i * 62})`}>
          <rect x={-150} y={-16} width={32} height={32} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {seg(f, 26 + i * 8, 34 + i * 8) > 0.5 && (
            <path d="M -144 0 L -134 10 L -118 -12" fill="none" stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
          )}
          <line x1={-96} y1={0} x2={150} y2={0} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
        </g>
      ))}
      <TypeTiles x={0} y={90} s={0.92} t={seg(f, 36, 60)} />
      <text x={0} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>4文字タイプ</text>
    </g>
  </Frame>
);

// #11 「あなたはこういう人」(毎日どこかから貼られるラベルだらけの画面)
// 貼られているのは「あなた=画面のこちら側」。だから代役の人は出さない。
const LABELS: { x: number; y: number; text: string; rot: number; fill: string; at: number; size: number }[] = [
  { x: 400, y: 250, text: "しっかりしている", rot: -7, fill: KRP.yellow, at: 2, size: 38 },
  { x: 1520, y: 300, text: "心配性", rot: 6, fill: KRP.blueSoft, at: 10, size: 42 },
  { x: 330, y: 560, text: "◯◯座", rot: 4, fill: KRP.white, at: 18, size: 40 },
  { x: 1610, y: 610, text: "◯型", rot: -5, fill: KRP.orange, at: 26, size: 42 },
  { x: 430, y: 790, text: "自分のペース", rot: 5, fill: KRP.white, at: 34, size: 38 },
  { x: 1490, y: 800, text: "4文字タイプ", rot: -4, fill: KRP.yellow, at: 42, size: 38 },
  { x: 600, y: 680, text: "今日の運勢", rot: -3, fill: KRP.white, at: 50, size: 34 },
];
const SceneAnataLabel: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={307} caption="「あなたは、こういう人」">
    <Floor y={950} />
    {/* 主役の占い機をセンターに (ここから次々と札が飛んでくる) */}
    <UranaiMachine x={960} y={948} s={0.78} f={f} />
    {LABELS.map((l, i) => (
      <g key={i}>
        <g opacity={seg(f, l.at, l.at + 10) * 0.7}>
          <line x1={960} y1={660} x2={l.x} y2={l.y} stroke={KRP.grayDark} strokeWidth={4}
            strokeDasharray="10 12" strokeLinecap="round" />
        </g>
        <g transform={`rotate(${l.rot} ${l.x} ${l.y})`}>
          <TagPlate x={l.x} y={l.y} text={l.text} size={l.size} fill={l.fill}
            t={seg(f, l.at + 2, l.at + 16)} />
        </g>
      </g>
    ))}
  </Frame>
);

// #12 / #15 「私は何者?」の道をさかのぼる (タイムスリップ背景 + 年表の道)
const SceneToiTimeline: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 0, 90));
  const sepia = 0.12 + 0.52 * clamp01(f / 140); // 現代の青み → 過去のセピアへ色が流れる
  const streakYs = [120, 215, 310, 430, 520, 820, 870, 250];
  return (
    <Frame f={f} seed={308} caption="「私は何者?」の歴史をさかのぼる">
      {/* 時代をさかのぼる背景: 色がだんだん過去色に沈む */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.paperCool} />
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.floor} opacity={sepia} />
      {/* タイムスリップの流れる線 (むかし側から手前へ流れつづける) */}
      {streakYs.map((sy, i) => {
        const speed = 14 + (i % 4) * 5;
        const len = 150 + (i % 3) * 110;
        const sx = W + 300 - ((f * speed + i * 420) % (W + 900));
        return (
          <line key={i} x1={sx} y1={sy} x2={sx + len} y2={sy}
            stroke={i % 2 ? KRP.grayDark : KRP.orange} strokeWidth={6}
            strokeLinecap="round" opacity={0.32} />
        );
      })}
      {/* 年代の輪が「むかし」の奥から流れてくる (ループ) */}
      {[0, 1, 2].map((i) => {
        const p = ((f / 55) + i / 3) % 1;
        return (
          <circle key={i} cx={1700} cy={470} r={50 + p * 620} fill="none"
            stroke={KRP.orange} strokeWidth={9} opacity={(1 - p) * 0.3} />
        );
      })}
      {/* いま(左) → むかし(右) へ戻る道 */}
      <path d="M 120 760 Q 560 660 960 700 Q 1400 740 1800 600" fill="none"
        stroke={KRP.floor} strokeWidth={56} strokeLinecap="round" />
      <path d="M 120 760 Q 560 660 960 700 Q 1400 740 1800 600" fill="none"
        stroke={KRP.ink} strokeWidth={5} strokeDasharray="26 22" opacity={0.5} />
      {/* 大きな矢印 (さかのぼる向き) */}
      <g transform="translate(960 330)">
        <line x1={-300 + Math.sin(f / 10) * 8} y1={0} x2={280 + Math.sin(f / 10) * 8} y2={0}
          stroke={KRP.orange} strokeWidth={16} strokeLinecap="round" />
        <polygon points="350,0 266,-42 266,42" fill={KRP.orange} stroke={KRP.ink} strokeWidth={5}
          transform={`translate(${Math.sin(f / 10) * 8} 0)`} />
      </g>
      {/* 字幕帯 (2行時は上端 y≒854) を避けて、道の左はしの上に置く */}
      <TagPlate x={200} y={672} text="いま" size={38} fill={KRP.blueSoft} />
      {/* 道しるべの品々 (いま→むかし) */}
      <Smartphone x={300} y={640} s={0.42} />
      <TypeTiles x={640} y={620} s={0.55} t={1} />
      <InkBlot x={990} y={620} s={0.42} />
      <BumpHead x={1340} y={650} s={0.52} />
      <OracleBone x={1680} y={470} s={0.46} crack={1} />
      <TagPlate x={1710} y={310} text="むかし" size={38} fill={KRP.yellow} />
      {/* 歩く人 (むかしへ向かう) */}
      <Person x={lerp(360, 455, walk)} y={722 - walk * 28} s={0.78} f={f} phase={3}
        cloth={KRP.green} clothDark={KRP.green} face="smile" gaze={[6, 0]} />
    </Frame>
  );
};

// #13 最初の診断ツールは、スマホではなく骨
const SceneHoneSmartphone: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={309} caption="最初の診断ツールは……">
    <Floor y={880} color={KRP.floor} />
    {/* スマホに✕ */}
    <g transform={`translate(520 580) scale(${pop(seg(f, 0, 16))})`}>
      <Smartphone x={0} y={0} s={1.15} />
    </g>
    <Batsu x={520} y={580} s={2.2} t={seg(f, 16, 30)} />
    {/* 骨に○ */}
    <g transform={`translate(1380 560) scale(${pop(seg(f, 10, 26))})`}>
      <OracleBone x={0} y={0} s={1.05} crack={seg(f, 30, 60)} />
    </g>
    <Maru x={1380} y={560} s={3.4} t={seg(f, 30, 46)} />
    <TagPlate x={520} y={850} text="スマホ" size={36} fill={KRP.white} />
    <TagPlate x={1380} y={850} text="骨" size={36} fill={KRP.yellow} />
  </Frame>
);

// #14 骨のヒビ→頭のデコボコ→インクのしみ→4文字タイプ
const SceneYottsuTools: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={310} caption="自分探しの道具は、こう変わった">
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${505 + i * 360} 560)`} opacity={seg(f, 12 + i * 12, 22 + i * 12)}>
        <line x1={-36} y1={0} x2={30} y2={0} stroke={KRP.orange} strokeWidth={11} strokeLinecap="round" />
        <polygon points="58,0 24,-22 24,22" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    <g transform={`scale(${pop(seg(f, 0, 14))})`} style={{ transformOrigin: "330px 560px" }}>
      <OracleBone x={330} y={560} s={0.75} crack={1} />
    </g>
    <g transform={`scale(${pop(seg(f, 12, 26))})`} style={{ transformOrigin: "690px 560px" }}>
      <BumpHead x={690} y={560} s={0.95} />
    </g>
    <g transform={`scale(${pop(seg(f, 24, 38))})`} style={{ transformOrigin: "1050px 560px" }}>
      <InkBlot x={1050} y={560} s={0.72} />
    </g>
    <TypeTiles x={1500} y={560} s={1.05} t={seg(f, 36, 64)} />
    <TagPlate x={330} y={800} text="骨のヒビ" size={30} t={seg(f, 6, 18)} />
    <TagPlate x={690} y={800} text="頭のデコボコ" size={30} t={seg(f, 18, 30)} />
    <TagPlate x={1050} y={800} text="インクのしみ" size={30} t={seg(f, 30, 42)} />
    <TagPlate x={1500} y={800} text="4文字タイプ" size={30} t={seg(f, 42, 54)} />
  </Frame>
);

// #16 第1章の扉
const SceneCh1Door: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={311}
    over={<ChapterTitle num={1} title="国の運命は、骨に聞く。" t={easeOut(seg(f, 10, 32))} />}>
    <ellipse cx={480} cy={880} rx={330} ry={30} fill={KRP.floor} />
    <OracleBone x={480} y={560} s={1.5} crack={seg(f, 14, 48)} rot={-4} />
    <Burst x={500} y={400} r={80} color={KRP.orange} t={seg(f, 40, 58)} n={8} />
  </Frame>
);

// ===== 第1章 (#17〜#33) =====
// #17 約3300年前の殷 (宮殿と王さま)
const SceneInDynasty: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={312} caption="古代中国・殷という王朝"
    over={<Stamp x={1430} y={300} text="約3300年前" size={52} />}>
    <ChinaBg f={f} />
    <Floor y={900} />
    {/* 反りやねの宮殿 (お城。宗教施設ではない)。基壇+柱+反り屋根の二層づくり */}
    <g transform="translate(560 0)">
      {/* 基壇 (二段) と中央の階段 */}
      <rect x={-400} y={858} width={800} height={46} fill={KRP.gray} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-352} y={818} width={704} height={44} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
      <g>
        <path d="M -86 904 L 86 904 L 62 818 L -62 818 Z" fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={-80 + i * 7} y1={882 - i * 22} x2={80 - i * 7} y2={882 - i * 22}
            stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
        ))}
      </g>
      {/* 一階の壁と赤い柱 (柱頭の飾りつき) */}
      <rect x={-300} y={560} width={600} height={258} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
      {[-240, -120, 120, 240].map((px) => (
        <g key={px}>
          <rect x={px - 20} y={578} width={40} height={240} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} opacity={0.94} />
          <rect x={px - 30} y={564} width={60} height={20} rx={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 扉 (二枚とびら + 飾り鋲) */}
      <rect x={-78} y={660} width={156} height={158} fill={KRP.ink} opacity={0.88} />
      <line x1={0} y1={660} x2={0} y2={818} stroke={KRP.cream} strokeWidth={4} opacity={0.7} />
      {[700, 760].map((dy) => (
        <g key={dy}>
          <circle cx={-40} cy={dy} r={6} fill={KRP.brass} />
          <circle cx={40} cy={dy} r={6} fill={KRP.brass} />
        </g>
      ))}
      {/* 下層の大屋根 (反り + 軒先の反り上がり + 瓦の筋) */}
      <path d="M -416 560 Q -380 470 0 452 Q 380 470 416 560 Q 300 522 0 514 Q -300 522 -416 560 Z"
        fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -416 560 Q -452 544 -470 506 M 416 560 Q 452 544 470 506"
        fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
      {[-300, -180, -60, 60, 180, 300].map((tx) => (
        <path key={tx} d={`M ${tx} ${514 - Math.abs(tx) * 0.02} q 4 24 ${tx * 0.11} 42`}
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.55} />
      ))}
      {/* 二階 (小さめの楼) */}
      <rect x={-170} y={384} width={340} height={70} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
      {[-120, 0, 120].map((px) => (
        <rect key={px} x={px - 14} y={392} width={28} height={62} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} opacity={0.94} />
      ))}
      {/* 上層屋根 (反り + 棟飾り) */}
      <path d="M -250 388 Q -220 316 0 304 Q 220 316 250 388 Q 160 362 0 356 Q -160 362 -250 388 Z"
        fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -250 388 Q -278 376 -292 348 M 250 388 Q 278 376 292 348"
        fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      <path d="M -108 314 q -14 -26 6 -38 M 108 314 q 14 -26 -6 -38"
        fill="none" stroke={KRP.brass} strokeWidth={7} strokeLinecap="round" />
    </g>
    <ShangKing x={1300} y={895} s={1.1} f={f} face="normal" gaze={[-4, 0]} />
    <TagPlate x={560} y={240} text="殷" size={46} t={seg(f, 14, 30)} fill={KRP.yellow} />
  </Frame>
);

// #17 王さまには、知りたいことが山ほどありました
// (中身=雨・作物・戦 は次の #18 で見せるので、ここは「数の多さ」だけを描く。
//  「?」の札をピラミッドに積み上げて、文字どおり山にする)
const SceneKingManyQ: React.FC<{ f: number }> = ({ f }) => {
  const rows = [6, 5, 4, 3, 2, 1]; // 下から上へ、1段ずつ減らして山の形に
  return (
    <Frame f={f} seed={312} caption="知りたいことは、山ほど">
      <ChinaBg f={f} />
      <Floor y={940} />
      <ShangKing x={430} y={935} s={1.25} f={f} face="worried" gaze={[9, -4]} />
      {/* 「?」の札の山 (下の段から順に積み上がる) */}
      {rows.map((n, ri) =>
        Array.from({ length: n }, (_, i) => {
          const idx = ri * 6 + i;
          const t = pop(seg(f, 2 + idx * 2.4, 18 + idx * 2.4));
          if (t <= 0) return null;
          const cx = 1240 + (i - (n - 1) / 2) * 112;
          const cy = 886 - ri * 104;
          return (
            <g key={`${ri}-${i}`}
              transform={`translate(${cx} ${cy}) scale(${t}) rotate(${Math.sin(idx * 1.7) * 5})`}>
              <rect x={-52} y={-52} width={104} height={104} rx={12}
                fill={ri % 2 ? KRP.white : KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
              <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={72} fill={KRP.blueDeep}>?</text>
            </g>
          );
        }))}
      {/* 王さまの頭の上にふわふわ浮かぶ「?」(まだまだ増える、の意味)。
          ※山のてっぺん (y 314) とテロップ帯 (y 140〜200) の両方を避けるため、
            王さまの上だけを使う。x は 430 まわり / y は 520〜400 の範囲に収めること */}
      {[0, 1, 2].map((i) => {
        const t = seg(f, 20 + i * 12, 68 + i * 12);
        if (t <= 0) return null;
        return (
          <text key={i} x={430 + (i - 1) * 86} y={520 - t * 120} textAnchor="middle"
            fontFamily={FONT} fontWeight={900} fontSize={48 + i * 6} fill={KRP.blueDeep}
            opacity={Math.sin(t * Math.PI) * 0.9}>?</text>
        );
      })}
    </Frame>
  );
};

// #18-19 王さまの知りたいこと (雨・作物・戦)
const SceneKingQuestions: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={313}>
    <ChinaBg f={f} />
    <Floor y={940} />
    <ShangKing x={560} y={935} s={1.25} f={f} face="worried" gaze={[5, -4]} />
    {/* 考えごとの吹き出し3つ */}
    <Bubble x={1050} y={360} w={260} h={200} tailTo={[700, 600]} t={seg(f, 4, 20)} />
    <g opacity={pop(seg(f, 4, 20)) > 0 ? 1 : 0} transform="translate(1050 360)">
      <path d="M -50 30 Q -70 -20 -20 -24 Q -10 -56 30 -44 Q 66 -40 60 -4 Q 84 10 60 30 Z"
        fill={KRP.gray} stroke={KRP.ink} strokeWidth={5} opacity={pop(clamp01(seg(f, 4, 20)))} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-30 + i * 28} y1={46} x2={-38 + i * 28} y2={72}
          stroke={KRP.blueDeep} strokeWidth={6} strokeLinecap="round"
          opacity={seg(f, 18, 26) * (0.5 + 0.5 * Math.sin(f / 7 + i * 2))} />
      ))}
    </g>
    <Bubble x={1400} y={520} w={250} h={190} tailTo={[740, 640]} t={seg(f, 18, 34)} />
    <g transform="translate(1400 540)" opacity={clamp01(seg(f, 18, 34))}>
      <path d="M 0 40 L 0 -30 M 0 -30 Q -26 -34 -24 -62 M 0 -30 Q 26 -34 24 -62 M 0 -2 Q -22 -8 -22 -32"
        fill="none" stroke={KRP.green} strokeWidth={7} strokeLinecap="round" />
      <circle cx={-24} cy={-66} r={9} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
      <circle cx={24} cy={-66} r={9} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
    <Bubble x={1130} y={750} w={250} h={180} tailTo={[760, 700]} t={seg(f, 32, 48)} />
    <g transform="translate(1130 755)" opacity={clamp01(seg(f, 32, 48))}
      stroke={KRP.ink} strokeWidth={6} strokeLinecap="round">
      <line x1={-40} y1={34} x2={28} y2={-38} />
      <line x1={40} y1={34} x2={-28} y2={-38} />
      <line x1={-46} y1={10} x2={-22} y2={34} />
      <line x1={46} y1={10} x2={22} y2={34} />
    </g>
    <TagPlate x={1050} y={250} text="雨?" size={30} t={seg(f, 12, 24)} />
    <TagPlate x={1430} y={400} text="作物?" size={30} t={seg(f, 26, 38)} />
    <TagPlate x={1140} y={880} text="戦?" size={30} t={seg(f, 40, 52)} />
  </Frame>
);

// #20 気象予報士も新聞もない
const SceneNoYohoshi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={314} caption="予報も、新聞も、まだない">
    <ChinaBg f={f} />
    <Floor y={900} />
    {/* テレビの天気予報に✕ */}
    <g transform={`translate(520 580) scale(${pop(seg(f, 0, 16))})`}>
      <rect x={-230} y={-180} width={460} height={320} rx={20} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-204} y={-156} width={408} height={272} rx={10} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={-90} cy={-40} r={52} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return <line key={i} x1={-90 + Math.cos(a) * 66} y1={-40 + Math.sin(a) * 66}
          x2={-90 + Math.cos(a) * 84} y2={-40 + Math.sin(a) * 84} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />;
      })}
      <path d="M 30 -20 Q 20 -66 70 -62 Q 86 -92 128 -74 Q 164 -66 152 -28 Q 172 -6 146 8 L 44 8 Q 16 2 30 -20 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-150} y={170} width={300} height={28} rx={8} fill={KRP.ink} />
    </g>
    <Batsu x={520} y={560} s={3} t={seg(f, 14, 28)} />
    {/* 新聞に✕ */}
    <g transform={`translate(1390 590) scale(${pop(seg(f, 10, 26))}) rotate(-5)`}>
      <rect x={-210} y={-150} width={420} height={300} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-180} y={-120} width={200} height={44} fill={KRP.ink} opacity={0.85} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={-180} y1={-36 + i * 42} x2={i % 2 ? 60 : 180} y2={-36 + i * 42}
          stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round" opacity={0.8} />
      ))}
      <rect x={60} y={-120} width={120} height={70} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
    </g>
    <Batsu x={1390} y={570} s={3} t={seg(f, 24, 38)} />
  </Frame>
);

// #21 亀の甲羅と、牛の骨
const SceneKameUshi: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={315} caption="亀の甲羅と、牛の骨">
    <ChinaBg f={f} />
    <Floor y={880} />
    {/* 亀の腹甲 */}
    <g transform={`translate(540 560) scale(${pop(seg(f, 0, 18))})`}>
      <path d="M -130 -190 Q 0 -250 130 -190 Q 170 -60 130 120 Q 60 190 0 192 Q -60 190 -130 120 Q -170 -60 -130 -190 Z"
        fill={KRP.cream} stroke={KRP.ink} strokeWidth={6.5} />
      <line x1={0} y1={-228} x2={0} y2={190} stroke={KRP.ink} strokeWidth={4.5} opacity={0.75} />
      {[-120, -40, 50, 130].map((ly) => (
        <path key={ly} d={`M -148 ${ly} Q 0 ${ly - 26} 148 ${ly}`} fill="none" stroke={KRP.ink}
          strokeWidth={4} opacity={0.65} />
      ))}
    </g>
    <TagPlate x={540} y={850} text="亀の甲羅" size={34} t={seg(f, 14, 28)} fill={KRP.yellow} />
    {/* 牛の骨 (肩甲骨) */}
    <g transform={`scale(${pop(seg(f, 12, 30))})`} style={{ transformOrigin: "1380px 560px" }}>
      <OracleBone x={1380} y={560} s={1.1} rot={4} />
    </g>
    <TagPlate x={1380} y={850} text="牛の骨" size={34} t={seg(f, 26, 40)} fill={KRP.blueSoft} />
    {/* もとの持ち主たち (実物の亀と牛) */}
    <g opacity={easeOut(seg(f, 30, 46))}>
      <RealTurtle x={200} y={865} s={0.85} f={f} />
      <RealCow x={1715} y={875} s={0.8} f={f} />
    </g>
  </Frame>
);

// #22 熱した棒を骨に押し当てる占い官
const SceneBoneBurn: React.FC<{ f: number }> = ({ f }) => {
  const press = 0.5 + 0.5 * Math.sin(f / 16);
  return (
    <Frame f={f} seed={316} caption="熱した棒を、押し当てる">
      <ChinaBg f={f} />
      <Floor y={930} />
      {/* 火鉢 */}
      <g transform="translate(430 840)">
        <path d="M -90 0 Q -80 80 0 86 Q 80 80 90 0 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M -30 -10 Q -44 -50 -10 -66 Q -24 -30 0 -26 Q 2 -62 26 -70 Q 48 -40 30 -8 Q 10 10 -30 -10 Z`}
          fill={KRP.orange} stroke={KRP.ink} strokeWidth={5}
          transform={`scale(${1 + Math.sin(f / 6) * 0.08})`} />
        <path d="M -12 -32 Q -16 -52 2 -58 Q 10 -40 0 -26 Z" fill={KRP.yellow} />
      </g>
      {/* 骨 (台の上) */}
      <rect x={960} y={760} width={420} height={36} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <OracleBone x={1170} y={600} s={0.95} rot={-3} crack={0} />
      {/* 占い官 (別描きの腕で棒を持つ) */}
      <AncientPerson x={780} y={925} s={1.15} role="priest" f={f} face="normal" gaze={[6, -2]} hideArm="right" />
      <g transform={`translate(780 ${925 + bobOf(f)}) scale(1.15)`}>
        <ArmX x={58} y={-140} rot={lerp(-104, -92, press)} len={92} color="#E4DCCB" />
      </g>
      {/* 熱い棒 (先が赤い)。手の位置に握らせ、先端が骨の左縁に当たる */}
      <g transform={`translate(${lerp(949, 952, press)} ${lerp(738, 760, press) + bobOf(f)}) rotate(-135)`}>
        <rect x={-10} y={-40} width={20} height={210} rx={9} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={0} cy={160} r={15} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={160} r={7} fill={KRP.orange} />
      </g>
      {/* ゆらぐ熱気 */}
      {[0, 1].map((i) => (
        <path key={i} d={`M ${1010 + i * 60} 500 q ${10 * Math.sin(f / 8 + i)} -30 0 -60 q ${-10 * Math.sin(f / 8 + i)} -30 0 -60`}
          fill="none" stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      ))}
    </Frame>
  );
};

// #23 ピシッ (ヒビが走る瞬間の寄り)
const ScenePishi: React.FC<{ f: number }> = ({ f }) => {
  const c = easeOut(seg(f, 8, 34));
  return (
    <Frame f={f} seed={317}>
      <ChinaBg f={f} />
      <OracleBone x={880} y={580} s={2.1} rot={-2} crack={c} />
      <Burst x={900} y={430} r={120 + c * 40} color={KRP.orange} t={seg(f, 10, 26)} n={12} />
      <g transform={`translate(1430 380) rotate(8) scale(${pop(seg(f, 12, 26))})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130}
          fill={KRP.red} stroke={KRP.white} strokeWidth={10} paintOrder="stroke">ピシッ</text>
      </g>
    </Frame>
  );
};

// #24-25 ヒビの形を見て、王さま本人が最終判断
const SceneKingJudge: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={318} caption="最終判断は、王さま本人">
    <ChinaBg f={f} />
    <Floor y={930} />
    <rect x={430} y={760} width={420} height={36} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
    <OracleBone x={640} y={600} s={0.98} rot={2} crack={1} />
    <ShangKing x={1270} y={925} s={1.2} f={f} face="worried" gaze={[-6, 2]} lean={-5} />
    {/* 見つめる視線 */}
    <line x1={1150} y1={610} x2={800} y2={590} stroke={KRP.blueDeep} strokeWidth={4.5}
      strokeDasharray="4 16" strokeLinecap="round" opacity={0.8} />
    <Bubble x={1430} y={370} w={330} h={120} tailTo={[1300, 560]} text="ふむ……" size={44} t={seg(f, 14, 30)} />
    <TagPlate x={640} y={870} text="国の一大事を決める" size={30} t={seg(f, 26, 42)} fill={KRP.yellow} />
  </Frame>
);

// #26 結果を骨に刻む
const SceneBoneCarve: React.FC<{ f: number }> = ({ f }) => {
  const tap = Math.abs(Math.sin(f / 9));
  return (
    <Frame f={f} seed={319} caption="結果は、骨に刻まれた">
      <ChinaBg f={f} />
      <Floor y={930} />
      <rect x={880} y={760} width={460} height={36} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <OracleBone x={1110} y={600} s={1.0} rot={-2} crack={1} glyphs={seg(f, 6, 80)} />
      <AncientPerson x={700} y={925} s={1.15} role="priest" f={f} face="normal" gaze={[7, 0]} hideArm="right" />
      <g transform={`translate(700 ${925 + bobOf(f)}) scale(1.15)`}>
        <ArmX x={58} y={-140} rot={lerp(-96, -88, tap)} len={88} color="#E4DCCB" />
      </g>
      {/* 刻みのノミ (手の位置に握らせ、先端が骨の左縁へ) */}
      <g transform={`translate(${lerp(867, 868, tap)} ${lerp(753, 768, tap) + bobOf(f)}) rotate(-144)`}>
        <rect x={-8} y={-30} width={16} height={205} rx={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <Burst x={960} y={610} r={34} color={KRP.gray} t={tap} n={6} />
    </Frame>
  );
};

// #27-28 これが甲骨文字 (最古の漢字)
const SceneKoukotsuMoji: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={320} caption="甲骨文字 = 現存する最古の漢字"
    over={<Stamp x={1310} y={680} text="漢字のご先祖" size={44} />}>
    <ChinaBg f={f} />
    <ellipse cx={700} cy={890} rx={340} ry={28} fill={KRP.floor} />
    <OracleBone x={700} y={540} s={1.55} rot={-3} crack={1} glyphs={1} />
    {/* 虫めがねで寄る */}
    <g transform={`translate(${1060 + Math.sin(f / 13) * 10} ${430 + Math.cos(f / 13) * 8}) rotate(14)`}>
      <circle cx={0} cy={0} r={92} fill={KRP.blueSoft} opacity={0.4} stroke={KRP.ink} strokeWidth={7} />
      <circle cx={0} cy={0} r={92} fill="none" stroke={KRP.brass} strokeWidth={9} />
      <rect x={-14} y={86} width={28} height={110} rx={12} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    </g>
    <TagPlate x={1440} y={420} text="占いのメモ" size={36} t={seg(f, 16, 32)} fill={KRP.yellow} />
  </Frame>
);

// #29-30 メソポタミアの空を見上げる人たち (冒頭に地球儀で場所紹介→夜空へつなぐ)
const SceneMesopotamia: React.FC<{ f: number }> = ({ f }) => {
  const spin = easeOut(seg(f, 0, 46)); // 地球がまわって中東が正面へ
  const pinT = pop(seg(f, 36, 50)); // ピンがぽん
  const zoom = easeOut(seg(f, 52, 72)); // ピンへぐっと寄る
  const introOp = 1 - seg(f, 58, 72); // 地球パートが消える
  const sceneOp = seg(f, 50, 68); // 夜空パートが浮かぶ
  return (
    <Frame f={f} seed={321} caption="メソポタミアでは、空を読む">
      {/* === 冒頭: 地球儀でメソポタミアの場所 === */}
      {introOp > 0 && (
        <g opacity={introOp}>
          <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueDeep} />
          {[[200, 200], [520, 110], [1430, 170], [1700, 320], [300, 820], [1650, 860], [1100, 90]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={6} fill={KRP.yellow}
              opacity={0.5 + 0.5 * Math.sin(f / 9 + i * 2)} />
          ))}
          <g transform={`translate(960 560) scale(${1 + 1.9 * zoom}) translate(${-70 * zoom} ${70 * zoom})`}>
            {/* 台座 */}
            <path d="M -60 322 L 60 322 L 40 290 L -40 290 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 0 296 A 310 310 0 0 1 150 -272" fill="none" stroke={KRP.brass} strokeWidth={14} />
            {/* 地球 */}
            <circle cx={0} cy={0} r={296} fill={KRP.blue} stroke={KRP.ink} strokeWidth={7} />
            <clipPath id="w1MesoGlobeClip"><circle cx={0} cy={0} r={292} /></clipPath>
            <g clipPath="url(#w1MesoGlobeClip)">
              <g transform={`translate(${lerp(-430, 0, spin)} 0)`}>
                {/* 大陸 (ざっくりの形。回って中東が正面に来る) */}
                <path d="M -160 -180 Q -60 -230 40 -190 Q 90 -150 60 -90 Q 100 -60 70 -10 Q 30 20 -20 -10 Q -80 -40 -90 -100 Q -130 -130 -160 -180 Z"
                  fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
                <path d="M 30 40 Q 90 20 130 60 Q 150 130 110 190 Q 60 210 30 160 Q 10 100 30 40 Z"
                  fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
                <path d="M 150 -170 Q 260 -210 360 -150 Q 400 -80 350 -20 Q 270 10 200 -40 Q 160 -100 150 -170 Z"
                  fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
                <path d="M -420 -120 Q -340 -180 -260 -130 Q -240 -60 -300 -20 Q -380 -40 -420 -120 Z"
                  fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
                <path d="M -380 80 Q -320 50 -280 100 Q -270 170 -320 200 Q -380 170 -380 80 Z"
                  fill={KRP.green} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
              </g>
              {/* 経線・赤道 */}
              <ellipse cx={0} cy={0} rx={296} ry={70} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.4} />
              <ellipse cx={0} cy={0} rx={120} ry={292} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.4} />
              <ellipse cx={0} cy={0} rx={230} ry={292} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.3} />
            </g>
            {/* ピン (メソポタミアの位置) */}
            <g transform={`translate(70 -70) scale(${pinT})`}>
              <circle cx={0} cy={0} r={14 + 16 * ((f / 24) % 1)} fill="none" stroke={KRP.red}
                strokeWidth={4} opacity={1 - ((f / 24) % 1)} />
              <path d="M 0 0 Q -20 -32 -12 -54 Q 0 -72 12 -54 Q 20 -32 0 0 Z"
                fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={0} cy={-50} r={8} fill={KRP.white} />
              <TagPlate x={0} y={-108} text="メソポタミア" size={34} t={pinT} fill={KRP.yellow} />
            </g>
          </g>
        </g>
      )}
      {/* === 本編: 夜空を見上げる二人 === */}
      <g opacity={sceneOp}>
        {/* 夜空 */}
        <rect x={-20} y={-20} width={W + 40} height={760} fill={KRP.blueDeep} opacity={0.92} />
        <circle cx={1520} cy={250} r={86} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
        <circle cx={1488} cy={232} r={66} fill={KRP.blueDeep} opacity={0.92} />
        {[[260, 180], [480, 120], [700, 240], [980, 150], [1180, 300], [820, 420], [370, 380], [1350, 140]].map(([sx, sy], i) => (
          <g key={i} transform={`translate(${sx} ${sy})`} opacity={0.6 + 0.4 * Math.sin(f / 8 + i * 1.7)}>
            <path d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={KRP.yellow} />
          </g>
        ))}
        {/* 砂漠の丘とヤシ */}
        <path d="M -20 740 Q 400 660 900 730 Q 1400 790 1940 700 L 1940 1100 L -20 1100 Z"
          fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
        <g transform="translate(260 720)">
          <path d="M -8 0 Q -4 -90 6 -130" fill="none" stroke={KRP.bronze} strokeWidth={14} strokeLinecap="round" />
          {[-80, -30, 30, 80].map((a, i) => (
            <path key={i} d={`M 6 -130 q ${a} ${-34 - (i % 2) * 12} ${a * 1.5} ${6 + (i % 2) * 10}`}
              fill="none" stroke={KRP.green} strokeWidth={10} strokeLinecap="round" />
          ))}
        </g>
        {/* 見上げる二人 (メソポタミア風: ひだの長衣と巻きひげ) */}
        <MesoPerson x={1000} y={930} s={1.05} f={f} face="normal" gaze={[3, -7]} lean={-4} beard />
        <MesoPerson x={1260} y={945} s={1.0} f={f} phase={3} face="surprised" gaze={[-2, -7]} lean={3} beard={false} />
        {/* 視線 */}
        <line x1={1050} y1={620} x2={1250} y2={330} stroke={KRP.yellow} strokeWidth={4}
          strokeDasharray="4 18" strokeLinecap="round" opacity={0.7} />
      </g>
    </Frame>
  );
};

// #29 星や月の動きから、国の吉凶を読み取る (天体の占い)
// (#28 は「空を見上げる」まで。ここは読み取って吉凶の答えを出すところを描く)
//
// 【演出のしくみ: 画面が上へパンする】(作者の指示)
//   前半は地上 (砂漠 + 見上げる人) と夜空の対比を見せ、
//   途中から画面全体が上へ動いて、空だけになったところで星の動きを見せる。
//   実装は「世界をまるごと下へずらす」= <g transform="translate(0, camY)">。
//   camY が増えるほどカメラが上を向く。world 座標で物を置き、
//   screen = world + camY で考えること (camY は 0 → 560)。
//   夜空は world y -700 まで伸ばしてあるので、パンしても上が切れない。
const SceneTentaiUranai: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeOut(seg(f, 14, 44)); // 画面が上へ移動
  const camY = pan * 560;
  const move = easeOut(seg(f, 46, 86)); // 星が動く
  const read = seg(f, 84, 104); // 吉の札が出る
  // 星の通り道 (world 座標。camY=560 のとき screen y は 420→320 あたりに来る)
  const px = lerp(560, 1300, move);
  const py = lerp(-40, -150, move) + Math.sin(move * Math.PI) * -60;
  // 星の中心の screen y。テロップ帯 (140〜200) にかぶらないことを確認すること
  return (
    <Frame f={f} seed={321} caption="星の動きで、国の吉凶を読む">
      <g transform={`translate(0 ${camY})`}>
        {/* 夜空 (上へパンしても切れないよう、画面の上 700px ぶん多めに塗る) */}
        {/* ※半透明にしないこと。月の欠けを同じ色でくり抜くとき、下の地色が透けて
              月のうしろに青い丸が浮いて見えてしまう */}
        <rect x={-20} y={-720} width={W + 40} height={1400} fill={KRP.blueDeep} />
        {/* 星くず (上の方にも置いて、パンしたときに「空が続いている」と分かるように) */}
        {[[180, 150], [330, 320], [620, 140], [900, 110], [1180, 420], [1420, 180], [1700, 300],
        [820, 520], [240, -120], [700, -300], [1060, -160], [1480, -400], [1800, -80],
        [420, -480], [1240, -560], [1620, -240]]
          .map(([sx, sy], i) => (
            <path key={i} transform={`translate(${sx} ${sy})`} opacity={0.5 + 0.4 * Math.sin(f / 8 + i * 1.7)}
              d="M 0 -13 L 4 -4 L 13 0 L 4 4 L 0 13 L -4 4 L -13 0 L -4 -4 Z" fill={KRP.yellow} />
          ))}
        {/* 月 (満ち欠け) */}
        <g transform="translate(300 160)">
          <circle cx={0} cy={0} r={78} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
          <circle cx={-30} cy={-16} r={60} fill={KRP.blueDeep} />
        </g>
        {/* 星の通り道 (点線) ※パンが終わってから見せる */}
        <path d="M 560 -40 Q 930 -215 1300 -150" fill="none" stroke={KRP.white} strokeWidth={5}
          strokeDasharray="10 20" strokeLinecap="round" opacity={0.65 * pan} />
        {/* 動いていく星
            ※夜空なので「丸い玉＋放射線」は描かない (太陽に見えてしまう)。
              まわりの星くずと同じ四つ角の星の形を、大きく・明るくして使うこと */}
        <g transform={`translate(${px} ${py})`} opacity={pan}>
          {/* 光の玉 (半透明の丸) は置かないこと。夜空に灰色の円が浮いて見える。
              かわりに 45度ずらした小さい星を後ろに重ねて「きらめき」にする */}
          <g transform={`rotate(45) scale(${1.7 + 0.1 * Math.sin(f / 10)})`} opacity={0.8}>
            <path d="M 0 -13 L 4 -4 L 13 0 L 4 4 L 0 13 L -4 4 L -13 0 L -4 -4 Z"
              fill={KRP.yellow} />
          </g>
          {/* 星本体 (星くずと同じ形を 2.7 倍に) */}
          <g transform={`scale(${2.7 + 0.12 * Math.sin(f / 10)})`}>
            <path d="M 0 -13 L 4 -4 L 13 0 L 4 4 L 0 13 L -4 4 L -13 0 L -4 -4 Z"
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={1.8} />
          </g>
        </g>
        {/* 砂の地面 (パンすると画面の下へ消えていく) */}
        <path d="M -20 660 Q 420 610 920 660 Q 1420 710 1940 640 L 1940 1400 L -20 1400 Z"
          fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
        {/* 見上げて書きとめる人 (地面といっしょに下へ消える) */}
        <MesoPerson x={470} y={930} s={1.12} f={f} face="normal" gaze={[6, -7]} lean={-4} beard />
        <MesoPerson x={1380} y={944} s={1.0} f={f} face="normal" gaze={[4, -8]} lean={-3} />
      </g>

      {/* 読み取った答え (空の上で出す。パンし終わった右下あたり) */}
      <g transform={`translate(1480 790) rotate(-3) scale(${pop(seg(f, 72, 92))})`}>
        <rect x={-230} y={-130} width={460} height={260} rx={22} fill={KRP.copper}
          stroke={KRP.ink} strokeWidth={6.5} />
        <rect x={-198} y={-98} width={396} height={196} rx={14} fill="none"
          stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
        <text x={0} y={-48} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={42} fill={KRP.ink}>国の、うらない</text>
        <line x1={-168} y1={-22} x2={168} y2={-22} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {/* 吉 (出る) / 凶 (出ない) */}
        <g opacity={clamp01(read * 2)}>
          <text x={-82} y={74} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={80} fill={KRP.red}>吉</text>
          <text x={88} y={74} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={80} fill={KRP.grayDark} opacity={0.35}>凶</text>
          <Maru x={-82} y={44} s={1.4} t={read} />
        </g>
      </g>
    </Frame>
  );
};

// #31 / #33 占ってもらえるのは王さまだけ
const SceneKingOnly: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={322} caption="占えるのは、王さまと国家だけ">
    {/* 遠景のジッグラト (国家のしるし。段々の建物) */}
    <Ziggurat x={300} y={928} s={0.95} />
    <Floor y={930} />
    {/* 玉座のメソポタミアの王さま + ホロスコープ盤 */}
    <g transform="translate(600 0)">
      <rect x={-210} y={560} width={420} height={330} rx={16} fill={KRP.copper} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
      <rect x={-172} y={596} width={344} height={24} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
      <rect x={-250} y={850} width={500} height={44} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
    </g>
    <MesoPerson x={600} y={878} s={1.15} f={f} face="smile" beard crown />
    {/* 星占いの盤。前は宙に浮いていて中央があいていたので、
        台にのせて床まで届かせ、王さまのとなりに寄せてある (作者の指示: 配置バランス) */}
    <g transform="translate(1010 0)">
      {/* 三脚の台 */}
      <path d="M -74 926 L -12 700 L 12 700 L 74 926 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      <rect x={-96} y={916} width={192} height={22} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-34} y={686} width={68} height={28} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`translate(0 540) rotate(${f / 3}) scale(1.14)`}>
        <circle cx={0} cy={0} r={120} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={0} r={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 74} y1={Math.sin(a) * 74} x2={Math.cos(a) * 120} y2={Math.sin(a) * 120}
            stroke={KRP.ink} strokeWidth={3.5} />;
        })}
        <path d="M 0 -14 L 5 -4 L 16 0 L 5 4 L 0 14 L -5 4 L -16 0 L -5 -4 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </g>
    {/* 仕切りロープの外の庶民 (右があきすぎていたので2人に増やし、少し大きくした) */}
    <g>
      <rect x={1300} y={590} width={18} height={310} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
      <path d={`M 1309 630 Q 1520 ${694 + Math.sin(f / 11) * 8} 1731 630`} fill="none" stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
      <rect x={1722} y={590} width={18} height={310} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
    <AncientPerson x={1760} y={924} s={0.92} role="silhouette" f={f} phase={2} gaze={[-8, 0]} />
    <AncientPerson x={1540} y={936} s={1.08} role="silhouette" f={f} phase={5} gaze={[-6, 0]} />
    <TagPlate x={1520} y={470} text="王さま専用" size={34} t={seg(f, 14, 30)} fill={KRP.yellow} />
  </Frame>
);

// #32 紀元前410年・個人のホロスコープ (粘土板)
const SceneBc410: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={323} caption="個人を占った、世界最古のホロスコープ"
    over={<Stamp x={1250} y={620} text="紀元前410年" size={54} />}>
    <ellipse cx={760} cy={880} rx={330} ry={28} fill={KRP.floor} />
    {/* 粘土板 (くさび形文字) */}
    <g transform={`translate(760 540) rotate(-3) scale(${pop(seg(f, 2, 20))})`}>
      <rect x={-230} y={-290} width={460} height={580} rx={26} fill={KRP.copper} stroke={KRP.ink} strokeWidth={7} opacity={0.95} />
      <rect x={-196} y={-254} width={392} height={508} rx={16} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 4 }, (_, cc) => {
          const show = seg(f, 10 + (r * 4 + cc) * 2, 16 + (r * 4 + cc) * 2);
          if (show <= 0) return null;
          return (
            <g key={`${r}-${cc}`} transform={`translate(${-140 + cc * 94} ${-200 + r * 80}) rotate(${(r + cc) % 3 === 0 ? 90 : 0})`}
              opacity={show}>
              <path d="M 0 -18 L 10 6 L 0 0 L -10 6 Z" fill={KRP.ink} opacity={0.82} />
              <path d="M 22 -12 L 30 8 L 22 2 L 14 8 Z" fill={KRP.ink} opacity={0.82} />
            </g>
          );
        })
      )}
    </g>
    <Burst x={760} y={200} r={70} color={KRP.yellow} t={seg(f, 22, 40)} />
  </Frame>
);

// #32 「私は何者?」と聞けるのは、長いあいだ、王さまの特権でした
// #30 (占えるのは王さまと国家だけ) と同じ絵を使っていたので、こちらは別の見せ方にする。
// 「私は何者?」の問いを “鍵つきのガラスケースに入った宝物” として描き、
// 王さまだけが鍵を持ち、庶民はロープの外から手を伸ばすが届かない、という一枚。
const SceneKingTokken: React.FC<{ f: number }> = ({ f }) => {
  const caseIn = pop(seg(f, 4, 26)); // ケースが出てくる
  const reach = seg(f, 30, 58); // 庶民が手をのばす
  const shine = 0.5 + 0.5 * Math.sin(f / 11);
  return (
    // 上のテロップ (caption) は置かない。「王さまの特権」の札だけで足りる (作者の指示)
    <Frame f={f} seed={324}>
      <Ziggurat x={300} y={928} s={0.8} />
      <Floor y={930} />

      {/* ===== 中央: 鍵つきガラスケースに入った「私は何者?」の札 ===== */}
      <g transform={`translate(960 0) scale(${0.9 + 0.1 * caseIn})`} opacity={clamp01(caseIn * 2)}>
        {/* 台座 */}
        <path d="M -150 930 L -112 760 L 112 760 L 150 930 Z" fill={KRP.bronze}
          stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-168} y={916} width={336} height={26} rx={12} fill={KRP.brass}
          stroke={KRP.ink} strokeWidth={5} />
        {/* ガラスケース本体 (中身が透けるよう、うすい水色) */}
        <rect x={-150} y={400} width={300} height={364} rx={14} fill={KRP.blueSoft}
          stroke={KRP.ink} strokeWidth={7} opacity={0.5} />
        <rect x={-150} y={400} width={300} height={364} rx={14} fill="none"
          stroke={KRP.ink} strokeWidth={7} />
        {/* ガラスのハイライト */}
        <path d="M -118 736 L -10 432" stroke={KRP.white} strokeWidth={14}
          strokeLinecap="round" opacity={0.55 * shine} />
        {/* 中の札「私は何者?」 */}
        <g transform={`translate(0 ${582 + Math.sin(f / 14) * 4}) rotate(-2)`}>
          <rect x={-108} y={-74} width={216} height={148} rx={12} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5.5} />
          <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={40} fill={KRP.ink}>私は</text>
          <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={40} fill={KRP.ink}>何者?</text>
        </g>
        {/* カギ穴つきのふた */}
        <rect x={-162} y={356} width={324} height={52} rx={12} fill={KRP.brass}
          stroke={KRP.ink} strokeWidth={6} />
        <circle cx={0} cy={382} r={13} fill={KRP.ink} />
        <path d="M -5 382 L -5 400 L 5 400 L 5 382 Z" fill={KRP.ink} />
      </g>

      {/* ===== 左: 鍵をもつ王さま ===== */}
      <MesoPerson x={520} y={900} s={1.18} f={f} face="smile" beard crown gaze={[7, 0]} />
      {/* 王さまが手にした大きなカギ */}
      <g transform={`translate(690 ${700 + Math.sin(f / 9) * 4}) rotate(18)`}>
        <circle cx={0} cy={-34} r={26} fill="none" stroke={KRP.bronze} strokeWidth={13} />
        <circle cx={0} cy={-34} r={26} fill="none" stroke={KRP.ink} strokeWidth={4} />
        <rect x={-7} y={-16} width={14} height={92} rx={5} fill={KRP.bronze}
          stroke={KRP.ink} strokeWidth={4} />
        <rect x={0} y={44} width={28} height={13} rx={4} fill={KRP.bronze}
          stroke={KRP.ink} strokeWidth={4} />
        <rect x={0} y={64} width={20} height={13} rx={4} fill={KRP.bronze}
          stroke={KRP.ink} strokeWidth={4} />
      </g>

      {/* ===== 右: ロープの外から手をのばす庶民 (届かない) ===== */}
      <g>
        <rect x={1320} y={600} width={18} height={300} rx={8} fill={KRP.brass}
          stroke={KRP.ink} strokeWidth={4.5} />
        <path d={`M 1329 640 Q 1540 ${704 + Math.sin(f / 11) * 8} 1751 640`} fill="none"
          stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
        <rect x={1742} y={600} width={18} height={300} rx={8} fill={KRP.brass}
          stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <AncientPerson x={1520} y={930} s={1.08} role="silhouette" f={f} phase={2} gaze={[-9, 0]} />
      <AncientPerson x={1760} y={918} s={0.94} role="silhouette" f={f} phase={5} gaze={[-8, 0]} />
      {/* のばした手 (ロープの手前でとまる) */}
      <g opacity={clamp01(reach * 2)}>
        {/* 手は人の体 (x 1478 あたり) から生やす。宙に浮かせないこと */}
        <path d={`M 1486 764 L ${lerp(1486, 1372, reach)} ${lerp(764, 714, reach)}`}
          stroke={KRP.grayDark} strokeWidth={20} strokeLinecap="round" />
        <circle cx={lerp(1486, 1372, reach)} cy={lerp(764, 714, reach)} r={17}
          fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 届かない、のしるし */}
      <Batsu x={1270} y={700} s={1.25} t={seg(f, 58, 74)} />

      <TagPlate x={960} y={224} text="王さまの特権" size={40} t={seg(f, 16, 32)} fill={KRP.yellow} />
      <TagPlate x={1560} y={430} text="庶民は問えない" size={32} t={seg(f, 62, 78)} fill={KRP.blueSoft} />
    </Frame>
  );
};

// ===== 第2章 (#34〜#58) =====
// にわとり (flip で左向き。mood で表情)
const Chicken: React.FC<{
  x: number; y: number; s?: number; f?: number; flip?: boolean; mood?: "normal" | "pui" | "bikkuri";
}> = ({ x, y, s = 1, f = 0, flip, mood = "normal" }) => {
  const bob = Math.sin(f / 7) * 2.5;
  const headUp = mood === "pui" ? -26 : 0;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s})`}>
      {/* しっぽ */}
      <path d="M -66 -58 Q -112 -96 -96 -34 Q -108 -64 -126 -44 Q -102 -18 -64 -30 Z"
        fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 体 */}
      <path d="M -70 -36 Q -74 -84 -20 -92 Q 40 -96 54 -56 Q 64 -20 24 -4 Q -30 10 -58 -8 Q -72 -18 -70 -36 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* 羽 */}
      <path d="M -40 -56 Q -6 -70 10 -44 Q -8 -24 -40 -34 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
      {/* 首と頭 */}
      <g transform={`translate(0 ${headUp}) rotate(${mood === "pui" ? -18 : 0})`}>
        <circle cx={62} cy={-104} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* トサカ */}
        <path d="M 46 -128 Q 48 -148 60 -134 Q 62 -152 74 -136 Q 80 -150 86 -128 Z"
          fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {/* くちばし + 肉ぜん */}
        <path d="M 90 -108 L 116 -100 L 90 -92 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 86 -90 q 10 16 -2 20 q -10 -4 -2 -20" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 目 */}
        {mood === "bikkuri"
          ? <g><circle cx={68} cy={-110} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} /><circle cx={68} cy={-110} r={3.5} fill={KRP.ink} /></g>
          : <circle cx={68} cy={-110} r={5} fill={KRP.ink} />}
      </g>
      {/* 足 */}
      <g stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M -14 4 L -14 30 M -14 30 L -26 42 M -14 30 L -2 42 M -14 30 L -14 44" />
        <path d="M 16 2 L 16 30 M 16 30 L 4 42 M 16 30 L 28 42 M 16 30 L 16 44" />
      </g>
    </g>
  );
};

// ガレー船 (大敗の絵で使う)
const GalleyShip: React.FC<{ x: number; y: number; s?: number; rot?: number; sunk?: number }> =
  ({ x, y, s = 1, rot = 0, sunk = 0 }) => (
    <g transform={`translate(${x} ${y + sunk * 60}) rotate(${rot}) scale(${s})`}>
      <path d="M -150 0 Q -160 50 -110 56 L 110 56 Q 166 46 170 -14 L 130 0 Z"
        fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <line x1={0} y1={0} x2={0} y2={-150} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <path d="M 6 -148 Q 86 -110 10 -46 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      {[-110, -60, -10, 40, 90].map((ox) => (
        <line key={ox} x1={ox} y1={56} x2={ox - 24} y2={92} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
      ))}
    </g>
  );

// ===== 第2章・ローマブロック共通の背景 (#35〜#48 の全シーンに同じ処理で敷く) =====
// 中国 (朱+雷文+雲紋) / メソポタミア (夜空+砂) と描き分ける:
// 地中海の明るい空 + 上端の大理石&月桂樹の帯 + モザイクの縁取り + 遠景の神殿の列柱 + 流れる雲
const RomeCloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -100 0 Q -112 -40 -64 -46 Q -54 -82 -8 -76 Q 28 -98 60 -64 Q 108 -60 104 -22 Q 116 0 78 0 Z"
      fill={KRP.white} stroke={KRP.white} strokeWidth={12} strokeLinejoin="round" />
  </g>
);

// 遠景の神殿 (列柱のシルエット。公共建築の意匠。宗教シンボルは描かない)
const TempleFar: React.FC<{ x: number; y: number; s?: number; cols?: number }> = ({ x, y, s = 1, cols = 6 }) => {
  const half = cols * 34;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.17}>
      <polygon points={`${-half - 30},-122 ${half + 30},-122 ${half - 10},-192 ${-half + 10},-192`} fill={KRP.grayDark} />
      <rect x={-half - 38} y={-124} width={half * 2 + 76} height={20} fill={KRP.grayDark} />
      {Array.from({ length: cols }, (_, i) => (
        <rect key={i} x={-half + 10 + i * 68} y={-104} width={34} height={104} fill={KRP.grayDark} />
      ))}
      <rect x={-half - 38} y={0} width={half * 2 + 76} height={22} fill={KRP.grayDark} />
    </g>
  );
};

// floorY = モザイクの大理石床を敷く高さ (null で床なし = 海のシーン)
const RomeBg: React.FC<{ f: number; floorY?: number | null }> = ({ f, floorY = 900 }) => (
  <g>
    {/* 地中海の明るい空 */}
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueSoft} opacity={0.34} />
    <rect x={-20} y={500} width={W + 40} height={H - 480} fill={KRP.cream} opacity={0.55} />
    {/* 遠景の神殿の列柱 (画面のすみ) */}
    <TempleFar x={160} y={900} s={0.82} cols={6} />
    <TempleFar x={1800} y={900} s={0.66} cols={5} />
    {/* ゆっくり流れる雲 */}
    <RomeCloud x={((f * 0.32 + 300) % (W + 440)) - 220} y={300} s={1.15} o={0.5} />
    <RomeCloud x={((f * 0.22 + 1150) % (W + 440)) - 220} y={214} s={0.85} o={0.4} />
    <RomeCloud x={((f * 0.14 + 1760) % (W + 440)) - 220} y={404} s={0.7} o={0.3} />
    {/* モザイクの大理石床 (ローマ共通の足元) */}
    {floorY != null && (
      <g>
        <rect x={-20} y={floorY} width={W + 40} height={H - floorY + 20} fill={KRP.floor} opacity={0.88} />
        <line x1={-20} y1={floorY} x2={W + 20} y2={floorY} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={i * 48} y={floorY + 8} width={48} height={30}
            fill={i % 2 ? KRP.bronze : KRP.cream} opacity={0.5} />
        ))}
        <line x1={-20} y1={floorY + 38} x2={W + 20} y2={floorY + 38}
          stroke={KRP.ink} strokeWidth={3} opacity={0.28} />
      </g>
    )}
    {/* 上端: 大理石の帯 */}
    <rect x={-20} y={-20} width={W + 40} height={100} fill={KRP.silver} opacity={0.95} />
    <rect x={-20} y={-20} width={W + 40} height={32} fill={KRP.white} opacity={0.55} />
    {/* 月桂樹のつる */}
    <path d={`M -20 54 ${Array.from({ length: 20 }, (_, i) => `Q ${i * 100 + 30} ${i % 2 ? 32 : 74} ${i * 100 + 100} 54`).join(" ")}`}
      fill="none" stroke={KRP.green} strokeWidth={5} opacity={0.9} />
    {Array.from({ length: 20 }, (_, i) => (
      <g key={i} opacity={0.92}>
        <ellipse cx={i * 100 + 46} cy={34} rx={17} ry={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={2.5}
          transform={`rotate(-34 ${i * 100 + 46} 34)`} />
        <ellipse cx={i * 100 + 88} cy={70} rx={17} ry={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={2.5}
          transform={`rotate(34 ${i * 100 + 88} 70)`} />
      </g>
    ))}
    <line x1={-20} y1={80} x2={W + 20} y2={80} stroke={KRP.bronze} strokeWidth={6} />
    {/* モザイクの縁取り (帯の下。ローマらしい市松) */}
    {Array.from({ length: 48 }, (_, i) => (
      <rect key={i} x={i * 40} y={84} width={40} height={20} fill={i % 2 ? KRP.bronze : KRP.cream} opacity={0.8} />
    ))}
    <line x1={-20} y1={104} x2={W + 20} y2={104} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
  </g>
);

// ローマ章の小物: 申請書 (一枚) と、書類の山
const Doc: React.FC<{
  x: number; y: number; s?: number; rot?: number; lines?: number; seal?: boolean; t?: number;
}> = ({ x, y, s = 1, rot = 0, lines = 3, seal = false, t = 1 }) => {
  const tt = clamp01(t);
  if (tt <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={tt}>
      <rect x={-54} y={-70} width={108} height={140} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: lines }, (_, i) => (
        <line key={i} x1={-34} y1={-40 + i * 26} x2={i === lines - 1 ? 4 : 34} y2={-40 + i * 26}
          stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      ))}
      {seal && <circle cx={28} cy={46} r={17} fill="none" stroke={KRP.red} strokeWidth={4.5} />}
    </g>
  );
};

const DocStack: React.FC<{ x: number; y: number; n?: number; s?: number; t?: number }> =
  ({ x, y, n = 5, s = 1, t = 1 }) => (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const o = clamp01(t * n - i);
        if (o <= 0) return null;
        return (
          <g key={i}
            transform={`translate(${x + Math.sin(i * 2.3) * 8} ${y - i * 16 * s}) rotate(${Math.sin(i * 1.7) * 4}) scale(${s})`}
            opacity={o}>
            <rect x={-72} y={-10} width={144} height={20} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );

// 月桂冠 (元老院の議員にかぶせる)
const LaurelCrown: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -62 14 Q -74 -34 -22 -52 M 62 14 Q 74 -34 22 -52" fill="none"
      stroke={KRP.green} strokeWidth={8} strokeLinecap="round" />
    {[-1, 1].map((m) => [0, 1, 2].map((i) => (
      <ellipse key={`${m}${i}`} cx={m * (56 - i * 15)} cy={2 - i * 22} rx={12} ry={6.5}
        fill={KRP.green} stroke={KRP.ink} strokeWidth={2.8}
        transform={`rotate(${m * (52 - i * 22)} ${m * (56 - i * 15)} ${2 - i * 22})`} />
    )))}
  </g>
);

// #34 第2章の扉
const SceneCh2Door: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={324}
    over={<ChapterTitle num={2} title="占いが、お役所だったころ。" t={easeOut(seg(f, 10, 32))} />}>
    <Floor y={900} />
    {/* お役所の机 + 書類 + 鳥 */}
    <rect x={200} y={700} width={620} height={40} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
    <rect x={240} y={740} width={36} height={160} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <rect x={740} y={740} width={36} height={160} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <g transform="translate(400 620) rotate(-4)">
      <rect x={-110} y={-80} width={220} height={160} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-80} y1={-40 + i * 36} x2={80} y2={-40 + i * 36} stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
      ))}
      <circle cx={62} cy={44} r={26} fill="none" stroke={KRP.red} strokeWidth={5} opacity={pop(seg(f, 30, 44))} />
    </g>
    <Chicken x={660} y={700} s={0.9} f={f} flip />
  </Frame>
);

// #35 古代ローマ (列柱の公共建物)
const SceneRome: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={325} caption="時は流れて、古代ローマ">
    <RomeBg f={f} />
    <g transform="translate(640 0)">
      {/* 列柱の建物 (役所。宗教施設にしない) */}
      <polygon points="-380,520 380,520 310,400 -310,400" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-360} y={520} width={720} height={40} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
      {[-300, -150, 0, 150, 300].map((px) => (
        <g key={px}>
          <rect x={px - 28} y={560} width={56} height={300} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={px - 38} y={560} width={76} height={22} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={px - 38} y={840} width={76} height={22} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      ))}
      <rect x={-420} y={862} width={840} height={40} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
    </g>
    {/* 月桂樹の輪 */}
    <g transform={`translate(640 460) scale(${pop(seg(f, 10, 26))})`}>
      <path d="M -56 20 Q -70 -40 -16 -56 M 56 20 Q 70 -40 16 -56" fill="none" stroke={KRP.green} strokeWidth={9} strokeLinecap="round" />
      {[-1, 1].map((m) => [0, 1, 2].map((i) => (
        <ellipse key={`${m}${i}`} cx={m * (50 - i * 14)} cy={4 - i * 24} rx={13} ry={7}
          fill={KRP.green} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${m * (50 - i * 22)} ${m * (50 - i * 14)} ${4 - i * 24})`} />
      )))}
    </g>
    <RomanGeneral x={1440} y={895} s={1.1} f={f} face="normal" gaze={[-4, 0]} />
  </Frame>
);

// #36 占いは国家の正式な手続き = お役所しごと
// (⑯ ハンコ絵にしない。窓口・書類の山・順番待ちの列で「役所の事務」を描く)
const SceneTetsuzuki: React.FC<{ f: number }> = ({ f }) => {
  // 申請書が列 → 窓口 → 奥の書類棚 へ流れていく
  const hand = easeOut(seg(f, 18, 48)); // 市民が窓口に差し出す
  const file = easeOut(seg(f, 52, 86)); // 役人が棚へ運ぶ
  const pileT = seg(f, 8, 70);
  return (
    <Frame f={f} seed={326} caption="国家の、正式な手続き">
      <RomeBg f={f} />
      {/* 奥の書類棚 (巻物の整理棚。役所らしさ) */}
      <g transform="translate(330 452)">
        <rect x={-268} y={-168} width={536} height={336} rx={10} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <line x1={-268} y1={-168 + (r + 1) * 84} x2={268} y2={-168 + (r + 1) * 84}
              stroke={KRP.ink} strokeWidth={4.5} opacity={0.8} />
            {[0, 1, 2, 3, 4].map((c) => (
              <g key={c} transform={`translate(${-212 + c * 106} ${-126 + r * 84})`}>
                <circle cx={0} cy={0} r={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={0} cy={0} r={9} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3} />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* 窓口の役人 (机の後ろ。先に描いて机で下半身を隠す) */}
      <AncientPerson x={620} y={892} s={1.08} role="priest" f={f} phase={1} face="normal" gaze={[5, 2]} />
      <AncientPerson x={900} y={892} s={1.0} role="priest" f={f} phase={3} face="normal" gaze={[3, 2]} lean={-2} />
      {/* 運ばれていく申請書 (役人→棚) */}
      <Doc x={lerp(880, 400, file)} y={lerp(640, 420, file)} s={0.66} rot={lerp(-8, 10, file)} t={file > 0 ? 1 : 0} />
      {/* 長い受付カウンター */}
      <g>
        <rect x={120} y={680} width={1080} height={44} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
        <rect x={150} y={724} width={1020} height={176} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
        {[300, 520, 740, 960].map((px) => (
          <line key={px} x1={px} y1={724} x2={px} y2={900} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
        ))}
      </g>
      {/* カウンターの上の書類の山 (どんどん積まれる) */}
      <DocStack x={250} y={670} n={6} s={0.8} t={pileT} />
      <DocStack x={760} y={670} n={4} s={0.72} t={pileT} />
      <DocStack x={1090} y={670} n={5} s={0.78} t={pileT} />
      {/* 窓口の札 */}
      <TagPlate x={660} y={520} text="占い受付" size={34} t={seg(f, 2, 18)} fill={KRP.yellow} />
      {/* 順番待ちの列 (右から3人。少しずつ前へ) */}
      {[0, 1, 2].map((i) => {
        const step = easeOut(seg(f, 10 + i * 10, 46 + i * 10));
        return (
          <g key={i}>
            <AncientPerson x={lerp(1460 + i * 210, 1400 + i * 200, step)} y={900} s={0.98 - i * 0.03}
              role="pilgrim" f={f} phase={i * 2 + 1} face={i === 1 ? "worried" : "normal"} gaze={[-6, 0]} />
            {/* 手に持った申請書 */}
            <Doc x={lerp(1460 + i * 210, 1400 + i * 200, step) - 86} y={760} s={0.46} rot={-10} />
          </g>
        );
      })}
      {/* 先頭の人が窓口へ差し出す申請書 */}
      <Doc x={lerp(1330, 1120, hand)} y={lerp(750, 650, hand)} s={0.56} rot={lerp(-12, 4, hand)} />
      {/* 列の流れを示す矢印 (頭の上。字幕帯にかからない高さ) */}
      <g opacity={0.7}>
        <line x1={1860} y1={560} x2={1370} y2={560} stroke={KRP.blueDeep} strokeWidth={8}
          strokeLinecap="round" strokeDasharray="26 18" strokeDashoffset={-f * 1.6} />
        <polygon points="1330,560 1382,534 1382,586" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={1560} y={300} text="お役所しごと" size={38} t={seg(f, 36, 52)} fill={KRP.yellow} />
    </Frame>
  );
};

// #37 アウグルが鳥の飛び方を観察
const SceneAugur: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={327} caption="アウグル = 鳥占いの神官">
    <RomeBg f={f} floorY={930} />
    {/* 飛ぶ鳥たち */}
    {[0, 1, 2].map((i) => {
      const bx = ((f * (3 + i) + i * 420) % (W + 400)) - 200;
      const by = 260 + i * 90 + Math.sin(f / 9 + i * 2) * 18;
      return (
        <g key={i} transform={`translate(${bx} ${by})`}>
          <path d={`M -34 0 Q -12 ${-20 - Math.sin(f / 4 + i) * 10} 0 0 Q 12 ${-20 - Math.sin(f / 4 + i) * 10} 34 0`}
            fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    })}
    {/* アウグル (曲がった杖 lituus を持つ) */}
    <AncientPerson x={760} y={925} s={1.2} role="priest" f={f} face="normal" gaze={[4, -7]} lean={-3} hideArm="right" />
    <g transform={`translate(760 ${925 + bobOf(f)}) scale(1.2) rotate(-3)`}>
      <ArmX x={58} y={-140} rot={-150} len={86} color="#E4DCCB" />
    </g>
    <g transform={`translate(${760 + 150 * 1.2} ${925 + bobOf(f) - 190 * 1.2})`}>
      <path d="M 0 150 L 0 -60 Q 0 -110 40 -104 Q 66 -96 52 -70 Q 44 -86 28 -80 Q 12 -72 14 -48"
        fill="none" stroke={KRP.bronze} strokeWidth={11} strokeLinecap="round" />
    </g>
    {/* 観察メモ */}
    <TagPlate x={1430} y={470} text="飛び方と鳴き声を観察" size={32} t={seg(f, 16, 32)} />
    <line x1={1230} y1={520} x2={900} y2={620} stroke={KRP.blueDeep} strokeWidth={4}
      strokeDasharray="4 16" strokeLinecap="round" opacity={0.7} />
  </Frame>
);

// #38 神々が認めるかどうかを確かめる
// (⑰ ハンコ絵をやめ、開戦前の軍団と元老院が「空のOK待ち」で息をのむ緊張の絵にする)
const SceneKessai: React.FC<{ f: number }> = ({ f }) => {
  const look = easeOut(seg(f, 0, 24)); // みんなが空を見上げる
  return (
    <Frame f={f} seed={328} caption="神々が認めるか、確かめる">
      <RomeBg f={f} />
      {/* 空の高いところの光 (答えはまだ出ていない) */}
      <g opacity={0.5 + 0.5 * Math.sin(f / 13)}>
        <GodLight x={960} y={330} s={0.92} f={f} />
      </g>
      {/* 光まで立ちのぼる「?」(みんなの問い) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const t = clamp01(((f + i * 23) % 96) / 96);
        const qx = 520 + i * 230 + Math.sin(f / 11 + i) * 14;
        const qy = lerp(700, 430, easeOut(t));
        const o = Math.sin(t * Math.PI) * 0.85;
        return (
          <text key={i} x={lerp(qx, 960, t * 0.55)} y={qy} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={lerp(58, 30, t)} fill={KRP.blueDeep} opacity={o}>?</text>
        );
      })}
      {/* 左: 出陣まえの軍団 (奥から3列。かぶと+槍+盾) */}
      {[0, 1, 2].map((r) => (
        <g key={r} opacity={0.45 + r * 0.25}>
          {Array.from({ length: 6 - r }, (_, i) => {
            const px = 120 + r * 56 + i * 118;
            const py = 672 + r * 74;
            const sc = 0.72 + r * 0.12;
            return (
              <g key={i} transform={`translate(${px} ${py + Math.sin(f / 15 + i + r) * 2}) scale(${sc})`}>
                {/* 槍 */}
                <line x1={48} y1={60} x2={48} y2={-200} stroke={KRP.bronze} strokeWidth={9} strokeLinecap="round" />
                <polygon points="48,-232 60,-196 36,-196" fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
                {/* 盾 */}
                <rect x={-58} y={-18} width={84} height={110} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
                <ellipse cx={-16} cy={38} rx={16} ry={20} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
                {/* かぶと (見上げてすこし上向き) */}
                <g transform={`translate(-14 ${-56 - look * 8})`}>
                  <circle cx={0} cy={0} r={34} fill={SKIN} stroke={KRP.ink} strokeWidth={4.5} />
                  <path d="M -36 -4 Q -36 -46 0 -48 Q 36 -46 36 -4 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
                  <path d="M -30 -42 Q 0 -86 30 -42 L 18 -38 Q 0 -70 -18 -38 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
                  <circle cx={-10} cy={-2} r={4} fill={KRP.ink} />
                  <circle cx={12} cy={-2} r={4} fill={KRP.ink} />
                </g>
              </g>
            );
          })}
        </g>
      ))}
      {/* 手前の将軍 (見上げる) */}
      <RomanGeneral x={560} y={930} s={1.15} f={f} face="worried" gaze={[2, -8]} lean={-3} />
      {/* 右: 元老院の議員たち (月桂冠。同じく空を見上げる) */}
      {[0, 1, 2].map((i) => {
        const px = 1320 + i * 200;
        const sc = 1.1 - i * 0.07;
        return (
          <g key={i}>
            <AncientPerson x={px} y={928 - i * 14} s={sc} role="priest" f={f} phase={i * 3}
              face={i === 1 ? "surprised" : "worried"} gaze={[-3, -8]} armsCrossed={i === 1} />
            <LaurelCrown x={px} y={928 - i * 14 - 226 * sc} s={sc * 0.95} />
          </g>
        );
      })}
      {/* 息をのむ空気 (タテの集中線) */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={780 + i * 120} y1={470} x2={780 + i * 120} y2={400 - Math.sin(f / 7 + i) * 16}
          stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
      ))}
      <TagPlate x={960} y={478} text="開戦の前・大事な集まりの前" size={32}
        t={seg(f, 14, 30)} fill={KRP.blueSoft} />
    </Frame>
  );
};

// #39 占いというより、神様の決裁をもらう儀式 (新motif w1_kessai_girei)
// (⑰ 左=未来を当てる占い ✕ / 右=申請して許可をもらう決裁 ○ の対比)
const SceneKessaiGirei: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 34, 62)); // 申請書が上がる
  const back = easeOut(seg(f, 66, 92)); // 許可が返ってくる
  return (
    <Frame f={f} seed={353} caption="当てる占いではなく、決裁の儀式">
      <RomeBg f={f} />
      {/* 左: 未来を当てる占い (✕) */}
      <g transform={`translate(500 610) scale(${pop(seg(f, 0, 16))})`}>
        <rect x={-380} y={-340} width={760} height={660} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <TagPlate x={0} y={-272} text="未来を、当てる" size={38} fill={KRP.cream} />
        {/* 玉をのぞきこむ「あした、どうなる?」の思い */}
        <g opacity={0.9}>
          <ellipse cx={-150} cy={-150} rx={96} ry={54} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          <text x={-150} y={-134} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38}
            fill={KRP.ink}>あした</text>
          <circle cx={-56} cy={-92} r={15} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-24} cy={-62} r={9} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3.5} />
          <text x={132} y={-124} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={86}
            fill={KRP.blueDeep} opacity={0.5 + 0.5 * Math.sin(f / 9)}>?</text>
        </g>
        {/* 水晶玉と台 */}
        <g transform="translate(0 70)">
          <path d="M -96 96 Q 0 70 96 96 Q 104 126 70 136 L -70 136 Q -104 126 -96 96 Z"
            fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
          <circle cx={0} cy={0} r={104} fill={PUR.glow} stroke={KRP.ink} strokeWidth={6} opacity={0.95} />
          <circle cx={0} cy={0} r={104} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.6} />
          <path d="M -54 -44 Q -28 -70 2 -66" fill="none" stroke={KRP.white} strokeWidth={9} strokeLinecap="round" opacity={0.8} />
          {/* 玉の中にうっすら映る「あした」 */}
          <g opacity={0.45 + 0.25 * Math.sin(f / 9)}>
            <circle cx={-26} cy={16} r={17} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
            <path d="M 6 42 Q 34 4 62 42 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        <Batsu x={0} y={20} s={2.4} t={seg(f, 20, 36)} />
      </g>
      {/* 右: 申請 → 許可 (○) */}
      <g transform={`translate(1420 610) scale(${pop(seg(f, 12, 28))})`}>
        <rect x={-380} y={-340} width={760} height={660} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <TagPlate x={0} y={-272} text="やっていいか、聞く" size={34} fill={KRP.cream} />
        {/* 上の光 (神様) */}
        <GodLight x={0} y={-130} s={0.62} f={f} />
        {/* のぼる申請書 */}
        <Doc x={lerp(-168, -72, rise)} y={lerp(176, -34, rise)} s={lerp(0.9, 0.52, rise)} rot={lerp(8, 0, rise)} />
        <path d="M -170 150 Q -210 20 -96 -56" fill="none" stroke={KRP.blueDeep} strokeWidth={6}
          strokeLinecap="round" strokeDasharray="10 16" opacity={0.65} />
        {/* おりてくる許可の札 */}
        <g transform={`translate(${lerp(78, 170, back)} ${lerp(-40, 176, back)}) rotate(${lerp(0, -8, back)})`}
          opacity={back > 0 ? 1 : 0}>
          <rect x={-66} y={-54} width={132} height={108} rx={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={KRP.red}>可</text>
        </g>
        <path d="M 96 -56 Q 212 20 176 150" fill="none" stroke={KRP.red} strokeWidth={6}
          strokeLinecap="round" strokeDasharray="10 16" opacity={0.65} />
        <Maru x={170} y={176} s={2.6} t={seg(f, 94, 112)} />
      </g>
    </Frame>
  );
};

// #40 凶兆が出れば、戦争すら延期
const SceneEnki: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={329} caption="凶兆が出れば、戦争も延期"
    over={<Stamp x={1150} y={470} text="延期" size={86} />}>
    <RomeBg f={f} />
    {/* 開戦の予定書 */}
    <g transform="translate(760 560) rotate(-3)">
      <rect x={-280} y={-300} width={560} height={600} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
      {/* 交差する剣のしるし */}
      <g stroke={KRP.ink} strokeWidth={8} strokeLinecap="round">
        <line x1={-80} y1={-250} x2={80} y2={-110} />
        <line x1={80} y1={-250} x2={-80} y2={-110} />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={-210} y1={-20 + i * 64} x2={i === 3 ? 20 : 210} y2={-20 + i * 64}
          stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round" opacity={0.75} />
      ))}
    </g>
    {/* 凶兆の鳥 (とまって鳴く) */}
    <g transform={`translate(1500 ${660 + Math.sin(f / 8) * 3}) scale(1.5)`}>
      <line x1={-110} y1={120} x2={110} y2={120} stroke={KRP.bronze} strokeWidth={12} strokeLinecap="round" />
      <path d="M -26 110 Q -40 60 0 52 Q 44 56 36 100 Q 24 124 -8 120 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={34} cy={52} r={20} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 52 50 L 72 56 L 52 62 Z" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3.5} />
      <circle cx={38} cy={46} r={4} fill={KRP.white} />
      {/* 鳴き声 */}
      {[0, 1].map((i) => (
        <path key={i} d={`M ${84 + i * 30} ${30 - i * 14} q 18 -10 10 -30`} fill="none" stroke={KRP.blueDeep}
          strokeWidth={5} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 6 + i * 2)} />
      ))}
    </g>
  </Frame>
);

// #41-42 海戦前、将軍が鶏をうかがう
const SceneGeneralChicken: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={330} caption="海戦の前、将軍と鶏">
    <RomeBg f={f} floorY={null} />
    {/* 海と船べり */}
    <path d={`M -20 700 Q 240 ${680 + Math.sin(f / 10) * 10} 480 700 T 980 700 T 1480 700 T 1980 700 L 1980 1100 L -20 1100 Z`}
      fill={KRP.blue} opacity={0.85} />
    <rect x={-20} y={820} width={W + 40} height={300} rx={0} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
    <line x1={-20} y1={880} x2={W + 20} y2={880} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
    {/* マスト */}
    <rect x={240} y={200} width={26} height={640} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 266 220 Q 420 300 270 480 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    <RomanGeneral x={700} y={880} s={1.15} f={f} face="worried" gaze={[6, 4]} lean={4} />
    {/* 鶏かご + 鶏 */}
    <g transform="translate(1300 0)">
      <Chicken x={0} y={845} s={1.05} f={f} flip />
      <rect x={-170} y={620} width={340} height={230} rx={16} fill="none" stroke={KRP.bronze} strokeWidth={9} />
      {[-110, -50, 10, 70, 130].map((bx) => (
        <line key={bx} x1={bx} y1={626} x2={bx} y2={846} stroke={KRP.bronze} strokeWidth={7} />
      ))}
    </g>
    {/* 視線 */}
    <line x1={810} y1={600} x2={1210} y2={720} stroke={KRP.blueDeep} strokeWidth={4.5}
      strokeDasharray="4 16" strokeLinecap="round" opacity={0.8} />
  </Frame>
);

// #43 食べれば吉・食べなければ凶 (図解)
const SceneKitchoKyocho: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={331} caption="鶏が食べれば吉、食べなければ凶">
    <RomeBg f={f} />
    {/* 左: 食べる→吉 */}
    <g transform={`translate(500 560) scale(${pop(seg(f, 0, 16))})`}>
      <rect x={-330} y={-280} width={660} height={610} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <Chicken x={-80} y={60} s={1.0} f={f} />
      {/* 皿はからっぽ = 食べたあと (餌が残っていると意味が逆になる) */}
      <ellipse cx={120} cy={110} rx={80} ry={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      <Maru x={0} y={-160} s={1.6} t={seg(f, 14, 28)} />
      <text x={70} y={-140} fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.red}>吉</text>
    </g>
    {/* 右: 食べない→凶 */}
    <g transform={`translate(1420 560) scale(${pop(seg(f, 12, 28))})`}>
      <rect x={-330} y={-280} width={660} height={610} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <Chicken x={-80} y={60} s={1.0} f={f} mood="pui" />
      {/* 餌が手つかずで残っている = 食べなかった */}
      <ellipse cx={120} cy={110} rx={80} ry={26} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={100 + (i % 2) * 42} cy={96 + Math.floor(i / 2) * 14} r={7}
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
      ))}
      <Batsu x={0} y={-160} s={1.4} t={seg(f, 26, 40)} />
      <text x={70} y={-140} fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.blueDeep}>凶</text>
    </g>
  </Frame>
);

// #44 鶏は、食べませんでした
const SceneTabemasen: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={332} caption="鶏は、食べませんでした">
    <RomeBg f={f} floorY={null} />
    {/* 船の上 (奥に海) */}
    <path d={`M -20 740 Q 260 ${724 + Math.sin(f / 11) * 8} 540 740 T 1100 740 T 1660 740 T 2000 740 L 2000 860 L -20 860 Z`}
      fill={KRP.blue} opacity={0.85} />
    <rect x={-20} y={820} width={W + 40} height={300} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
    <Chicken x={1060} y={845} s={1.5} f={f} mood="pui" flip />
    {/* そっぽの「ぷいっ」 */}
    <g transform={`translate(810 520) rotate(-8) scale(${pop(seg(f, 8, 22))})`}>
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84}
        fill={KRP.blueDeep} stroke={KRP.white} strokeWidth={8} paintOrder="stroke">ぷいっ</text>
    </g>
    {/* 餌 */}
    <ellipse cx={1500} cy={800} rx={110} ry={32} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={1450 + (i % 3) * 48} cy={784 + Math.floor(i / 3) * 16} r={8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
    ))}
    <RomanGeneral x={420} y={880} s={1.1} f={f} face="surprised" gaze={[7, 2]} />
    <Burst x={420} y={560} r={80} color={KRP.blueDeep} t={seg(f, 18, 32)} n={8} />
  </Frame>
);

// #45 「食べないなら、飲めばいい」
// (⑱ 餌をそっぽ向いた鶏 → 怒った将軍がつかみ上げる → 視線の先は海、までを一枚で読ませる)
const SceneNomebaIi: React.FC<{ f: number }> = ({ f }) => {
  const lift = easeOut(seg(f, 10, 40)); // つかみ上げる
  const chx = lerp(880, 1010, lift);
  const chy = lerp(820, 676, lift);
  return (
    <Frame f={f} seed={333} caption="将軍、言い放つ">
      <RomeBg f={f} floorY={null} />
      {/* 奥の海 (投げ込む先。視線の行き先) */}
      <path d={`M -20 700 Q 280 ${682 + Math.sin(f / 11) * 9} 580 700 T 1180 700 T 1780 700 T 2000 700 L 2000 860 L -20 860 Z`}
        fill={KRP.blue} opacity={0.88} />
      {[1240, 1480, 1720].map((wx, i) => (
        <path key={wx} d={`M ${wx} ${748 + i * 26} q 26 ${-18 - Math.sin(f / 8 + i) * 7} 52 0`}
          fill="none" stroke={KRP.blueSoft} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
      ))}
      {/* 甲板 */}
      <rect x={-20} y={820} width={W + 40} height={300} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-20} y1={884} x2={W + 20} y2={884} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
      {/* 手つかずの餌皿 (鶏がそっぽを向いた証拠) */}
      <g transform="translate(300 0)">
        <ellipse cx={0} cy={820} rx={112} ry={32} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5.5} />
        <ellipse cx={0} cy={810} rx={92} ry={24} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={-52 + (i % 3) * 52} cy={802 + Math.floor(i / 3) * 16} r={9}
            fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <TagPlate x={0} y={690} text="手つかず" size={30} t={seg(f, 0, 14)} fill={KRP.white} />
        <Batsu x={0} y={810} s={1.5} t={seg(f, 6, 20)} />
      </g>
      {/* 将軍 (右腕で鶏をつかみ上げる) */}
      <RomanGeneral x={760} y={930} s={1.2} f={f} face="normal" gaze={[7, -2]} lean={4} armUp />
      {/* 怒りマーク (こめかみ) */}
      <g transform={`translate(640 580) scale(${1 + Math.sin(f / 7) * 0.12})`}
        stroke={KRP.red} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.95}>
        <path d="M -22 0 Q 0 -20 22 0 M 0 -22 Q 20 0 0 22" />
      </g>
      {/* つかみ上げられた鶏 (かわいいまま。海のほうを見てびっくり) */}
      <g transform={`translate(${chx} ${chy}) rotate(${lerp(4, -14, lift)})`}>
        <Chicken x={0} y={0} s={1.05} f={f} mood="bikkuri" />
        {/* じたばたの線 */}
        {[0, 1].map((i) => (
          <path key={i} d={`M ${-104 - i * 22} ${-70 + i * 36} q -26 ${-10 + i * 20} -46 ${4 + i * 6}`}
            fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round"
            opacity={0.45 + 0.45 * Math.sin(f / 5 + i * 2)} />
        ))}
      </g>
      <Burst x={1010} y={560} r={72} color={KRP.orange} t={seg(f, 30, 46)} n={9} />
      {/* 視線: 鶏 → 海 */}
      <line x1={1130} y1={596} x2={1560} y2={706} stroke={KRP.blueDeep} strokeWidth={5}
        strokeDasharray="5 18" strokeLinecap="round" opacity={0.8} />
      <Bubble x={1300} y={318} w={800} h={154} tailTo={[840, 556]} t={seg(f, 44, 60)}
        text="食べないなら、飲めばいい" size={52} color={KRP.red} />
    </Frame>
  );
};

// #46 ポチャン (鶏、海へ)
const ScenePochan: React.FC<{ f: number }> = ({ f }) => {
  const fly = easeOut(seg(f, 4, 40));
  const cx = lerp(620, 1400, fly);
  const cy = 700 - Math.sin(fly * Math.PI) * 330 + fly * 60;
  const splash = seg(f, 40, 60);
  return (
    <Frame f={f} seed={334} caption="海へ、ポチャン。">
      <RomeBg f={f} floorY={null} />
      <path d={`M -20 760 Q 240 ${740 + Math.sin(f / 10) * 10} 480 760 T 980 760 T 1480 760 T 1980 760 L 1980 1100 L -20 1100 Z`}
        fill={KRP.blue} opacity={0.9} />
      <rect x={-20} y={880} width={700} height={240} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
      <RomanGeneral x={360} y={950} s={1.05} f={f} face="normal" gaze={[8, -2]} lean={8} />
      {/* 投げられる鶏 (放物線) */}
      {fly < 1 && (
        <g transform={`translate(${cx} ${cy}) rotate(${fly * 220})`}>
          <Chicken x={0} y={0} s={0.85} f={f} mood="bikkuri" />
        </g>
      )}
      {/* 水しぶき */}
      {splash > 0 && (
        <g transform="translate(1420 760)" opacity={1 - splash * 0.3}>
          {[-60, -30, 0, 30, 60].map((sx2, i) => (
            <path key={i} d={`M ${sx2} 0 Q ${sx2 * 1.3} ${-70 - splash * 50 - (i % 2) * 24} ${sx2 * 1.7} ${-16}`}
              fill="none" stroke={KRP.blueSoft} strokeWidth={9} strokeLinecap="round" />
          ))}
          <ellipse cx={0} cy={6} rx={90 + splash * 70} ry={16} fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.9} />
        </g>
      )}
      <g transform={`translate(1420 480) rotate(6) scale(${pop(seg(f, 42, 56))})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96}
          fill={KRP.blueDeep} stroke={KRP.white} strokeWidth={9} paintOrder="stroke">ポチャン</text>
      </g>
    </Frame>
  );
};

// #47 歴史的大敗 (沈む艦隊。数は描かない)
const SceneTaihai: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={335} caption="結果は、歴史的大敗"
    over={<Stamp x={1330} y={260} text="大敗" size={76} />}>
    <RomeBg f={f} floorY={null} />
    {/* 荒れた空 (ローマの帯 y<106 は残す) */}
    <rect x={-20} y={106} width={W + 40} height={500} fill={KRP.grayDark} opacity={0.35} />
    <path d={`M -20 560 Q 300 ${530 + Math.sin(f / 9) * 12} 620 560 T 1260 560 T 1960 560 L 1960 1100 L -20 1100 Z`}
      fill={KRP.blueDeep} opacity={0.9} />
    <GalleyShip x={420} y={640} s={0.9} rot={-16} sunk={seg(f, 0, 60) * 0.7} />
    <GalleyShip x={960} y={700} s={1.05} rot={10} sunk={seg(f, 10, 70) * 0.6} />
    <GalleyShip x={1520} y={620} s={0.8} rot={-24} sunk={seg(f, 20, 80) * 0.8} />
    {/* 波しぶき */}
    {[300, 700, 1150, 1650].map((sx2, i) => (
      <path key={i} d={`M ${sx2} ${600 + (i % 2) * 70} q 30 ${-24 - Math.sin(f / 7 + i) * 8} 60 0`}
        fill="none" stroke={KRP.blueSoft} strokeWidth={7} strokeLinecap="round" opacity={0.8} />
    ))}
  </Frame>
);

// #48 神様の決裁は、省略しないほうがよさそうです (新motif w1_kessai_shoryaku)
// (⑰ 大敗のあとの教訓カット。省略した男を薄く思い出し、正しい順番を見せる)
const SceneKessaiShoryaku: React.FC<{ f: number }> = ({ f }) => {
  const memo = seg(f, 0, 18); // 回想パネルが出る
  const flow = easeOut(seg(f, 30, 70)); // 正しい手順が組み上がる
  const ok = seg(f, 74, 92);
  return (
    <Frame f={f} seed={354} caption="決裁は、省略しないほうがいい">
      <RomeBg f={f} />
      {/* 左: 回想 (手続きを省略した、あの人) */}
      <g transform={`translate(470 590) scale(${pop(memo)})`} opacity={0.92}>
        <rect x={-330} y={-280} width={660} height={560} rx={22} fill={KRP.cream}
          stroke={KRP.grayDark} strokeWidth={6} strokeDasharray="20 14" />
        <TagPlate x={0} y={-216} text="あのとき" size={32} fill={KRP.white} />
        {/* 小さく将軍と鶏 (記憶なので薄め) */}
        <g opacity={0.75}>
          <RomanGeneral x={-110} y={170} s={0.62} f={f} phase={2} face="normal" gaze={[6, -2]} lean={5} armUp />
          <g transform={`translate(30 ${-14 + Math.sin(f / 9) * 5}) rotate(-16)`}>
            <Chicken x={0} y={0} s={0.56} f={f} mood="bikkuri" />
          </g>
          {/* 海へ落ちる線 */}
          <path d="M 86 -10 Q 190 70 210 196" fill="none" stroke={KRP.blueDeep} strokeWidth={5}
            strokeDasharray="6 16" strokeLinecap="round" opacity={0.8} />
          <path d="M 120 196 Q 180 184 250 196 L 250 250 L 120 250 Z" fill={KRP.blue} opacity={0.75} />
        </g>
        {/* 省略 = ✕ */}
        <TagPlate x={0} y={214} text="手続きを、省略" size={32} fill={KRP.white} />
        <Batsu x={0} y={10} s={2.6} t={seg(f, 16, 32)} />
      </g>
      {/* 右: 正しい順番 (申請 → 神様 → 可 → 出発) */}
      <g transform="translate(1400 0)">
        <TagPlate x={0} y={250} text="ちゃんと、もらう" size={36} t={seg(f, 26, 42)} fill={KRP.yellow} />
        {/* 上の光 */}
        <GodLight x={0} y={420} s={0.92} f={f} />
        {/* 申請書 (下から上へ) */}
        <Doc x={-190} y={lerp(790, 620, flow)} s={0.9} rot={-6} t={clamp01(flow * 3)} />
        {/* 点線は申請書の外側 (右どなり) を通す。
            申請書は x -238〜-141 / y 557〜683 を占めるので、そこに入らない線にしてある */}
        <path d="M -126 648 Q -66 584 -70 500" fill="none" stroke={KRP.blueDeep} strokeWidth={6}
          strokeLinecap="round" strokeDasharray="10 16" opacity={0.7} strokeDashoffset={-f * 1.2} />
        {/* 「可」の札 (上から下へ) */}
        <g transform={`translate(190 ${lerp(500, 690, flow)}) rotate(${lerp(10, -6, flow)})`}
          opacity={clamp01(flow * 2 - 0.4)}>
          <rect x={-74} y={-58} width={148} height={116} rx={12} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
          <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={68} fill={KRP.red}>可</text>
        </g>
        {/* 「可」の札は最後 y=690 / 上端 632。点線はその手前 (y 610) で止めて重ねない */}
        <path d="M 84 486 Q 230 548 192 610" fill="none" stroke={KRP.red} strokeWidth={6}
          strokeLinecap="round" strokeDasharray="10 16" opacity={0.7} strokeDashoffset={-f * 1.2} />
        <Maru x={190} y={690} s={2.8} t={ok} />
      </g>
    </Frame>
  );
};

// 巻物 (小物。横置き)
const Makimono: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-90} y={-44} width={180} height={88} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    {[0, 1].map((i) => (
      <line key={i} x1={-62} y1={-14 + i * 26} x2={i ? 30 : 62} y2={-14 + i * 26}
        stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
    ))}
    <rect x={-110} y={-54} width={24} height={108} rx={11} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
    <rect x={86} y={-54} width={24} height={108} rx={11} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// 小さなコイン (ケプラーの家計の絵で使い回す)
const CoinS: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={0} r={26} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4.5} />
    <circle cx={0} cy={0} r={15} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
  </g>
);

// ホロスコープ盤 (12分割の円盤。紙に描いたもの)
const HoroscopePaper: React.FC<{ x: number; y: number; s?: number; f?: number; rot?: number }> =
  ({ x, y, s = 1, f = 0, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-170} y={-210} width={340} height={420} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <g transform={`rotate(${f / 4})`}>
        <circle cx={0} cy={-30} r={120} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5}
          transform="translate(0 0)" />
        <circle cx={0} cy={-30} r={72} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line key={i} x1={Math.cos(a) * 72} y1={-30 + Math.sin(a) * 72}
              x2={Math.cos(a) * 120} y2={-30 + Math.sin(a) * 120} stroke={KRP.ink} strokeWidth={3.5} />
          );
        })}
        <path d="M 0 -44 L 5 -34 L 16 -30 L 5 -26 L 0 -16 L -5 -26 L -16 -30 L -5 -34 Z"
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {[0, 1].map((i) => (
        <line key={i} x1={-110} y1={132 + i * 38} x2={i ? 40 : 110} y2={132 + i * 38}
          stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
      ))}
    </g>
  );

// 望遠鏡 (三脚つき。先が左上を向く)
const Telescope: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -32 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 三脚 */}
    <g stroke={KRP.ink} strokeWidth={9} strokeLinecap="round">
      <line x1={0} y1={-120} x2={-74} y2={0} />
      <line x1={0} y1={-120} x2={74} y2={0} />
      <line x1={0} y1={-120} x2={0} y2={-10} />
    </g>
    {/* 筒 */}
    <g transform={`translate(0 -140) rotate(${rot})`}>
      <rect x={-130} y={-30} width={200} height={60} rx={14} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-172} y={-38} width={56} height={76} rx={12} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <rect x={64} y={-20} width={40} height={40} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    </g>
  </g>
);

// 夜空の帯 (上半分。星がまたたく)
const NightSky: React.FC<{ f: number; h?: number }> = ({ f, h = 700 }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={h + 20} fill={KRP.blueDeep} opacity={0.92} />
    {[[240, 150], [520, 90], [820, 210], [1120, 120], [1420, 230], [1680, 110], [360, 330], [980, 350], [1560, 380]].map(([sx, sy], i) => (
      <g key={i} transform={`translate(${sx} ${sy})`} opacity={0.55 + 0.45 * Math.sin(f / 8 + i * 1.6)}>
        <path d="M 0 -13 L 4 -4 L 13 0 L 4 4 L 0 13 L -4 4 L -13 0 L -4 -4 Z" fill={KRP.yellow} />
      </g>
    ))}
  </g>
);

// ===== 第2章・日本ブロック共通の背景 (#49〜#54 の全シーンに同じ処理で敷く) =====
// 中国 (朱+雷文+雲紋) / ローマ (大理石+月桂樹+モザイク) と描き分ける:
// 生成り〜藤色の空気 + 上端の青海波の帯 + 遠景の寝殿造りの屋根と築地塀 + 庭の松 + 舞う花びら
const PineTree: React.FC<{ x: number; y: number; s?: number; f?: number; o?: number }> =
  ({ x, y, s = 1, f = 0, o = 0.6 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {/* 幹 (曲がった老松) */}
      <path d="M -10 0 Q 2 -96 -20 -176 Q -34 -236 6 -276" fill="none"
        stroke={KRP.bronze} strokeWidth={24} strokeLinecap="round" />
      <path d="M -18 -154 Q -74 -176 -118 -206" fill="none" stroke={KRP.bronze} strokeWidth={14} strokeLinecap="round" />
      <path d="M -22 -228 Q 42 -246 96 -270" fill="none" stroke={KRP.bronze} strokeWidth={13} strokeLinecap="round" />
      {/* 葉のかたまり */}
      {[[-126, -218, 54], [6, -312, 74], [108, -286, 50], [-48, -258, 42]].map(([lx, ly, lr], i) => (
        <ellipse key={i} cx={lx} cy={ly + Math.sin(f / 19 + i * 1.3) * 2.5}
          rx={lr * 1.28} ry={lr * 0.76} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
      ))}
    </g>
  );

// 遠景の寝殿造り (檜皮葺の大屋根 + 簀子。すみに小さく置く)
const ShindenFar: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.2}>
    <path d="M -300 0 L -150 -104 L 150 -104 L 300 0 Q 150 -22 0 -26 Q -150 -22 -300 0 Z" fill={KRP.ink} />
    <rect x={-156} y={-120} width={312} height={20} rx={6} fill={KRP.ink} />
    <rect x={-262} y={2} width={524} height={16} fill={KRP.ink} />
    <rect x={-240} y={44} width={480} height={13} fill={KRP.ink} />
    {[-200, -120, -40, 40, 120, 200].map((px) => (
      <rect key={px} x={px - 5} y={18} width={10} height={32} fill={KRP.ink} />
    ))}
  </g>
);

const JapanBg: React.FC<{ f: number; floorY?: number | null }> = ({ f, floorY = 910 }) => (
  <g>
    {/* 生成り〜藤色の空気 */}
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={PUR.glow} opacity={0.14} />
    <rect x={-20} y={540} width={W + 40} height={H - 520} fill={KRP.cream} opacity={0.6} />
    {/* 遠景の寝殿造りと築地塀 */}
    <ShindenFar x={330} y={720} s={0.78} />
    <ShindenFar x={1560} y={706} s={0.6} />
    <g opacity={0.17}>
      <rect x={-20} y={742} width={W + 40} height={92} fill={KRP.grayDark} />
      <rect x={-20} y={722} width={W + 40} height={24} fill={KRP.ink} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-20} y1={768 + i * 22} x2={W + 20} y2={768 + i * 22} stroke={KRP.white} strokeWidth={4} />
      ))}
    </g>
    {/* 庭の松 (左右のはし) */}
    <PineTree x={110} y={880} s={1.0} f={f} o={0.6} />
    <PineTree x={1856} y={866} s={0.86} f={f} o={0.55} />
    {/* 板の間 */}
    {floorY != null && (
      <g>
        <rect x={-20} y={floorY} width={W + 40} height={H - floorY + 20} fill={KRP.floor} opacity={0.9} />
        <line x1={-20} y1={floorY} x2={W + 20} y2={floorY} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 150 - 40} y1={floorY} x2={i * 150 - 130} y2={H + 20}
            stroke={KRP.ink} strokeWidth={3} opacity={0.2} />
        ))}
      </g>
    )}
    {/* ゆっくり舞う花びら */}
    {Array.from({ length: 14 }, (_, i) => {
      const t = ((f * 0.55 + i * 41) % 460) / 460;
      const px = 80 + i * 134 + Math.sin(f / 23 + i * 1.7) * 46;
      const py = lerp(130, 1040, t);
      return (
        <g key={i} transform={`translate(${px} ${py}) rotate(${f * 1.4 + i * 37})`} opacity={0.7}>
          <ellipse cx={0} cy={0} rx={13} ry={8} fill={KRP.white} stroke={KRP.red} strokeWidth={2.5} />
        </g>
      );
    })}
    {/* 上端: 青海波の帯 */}
    <rect x={-20} y={-20} width={W + 40} height={100} fill={PUR.mid} opacity={0.95} />
    {[0, 1, 2].map((row) => (
      <g key={row} fill="none" stroke={KRP.cream} strokeWidth={3.5} opacity={0.85}>
        {Array.from({ length: 26 }, (_, i) => {
          const cx = i * 80 + (row % 2 ? 40 : 0) - 20;
          const cy = 22 + row * 26;
          return (
            <g key={i}>
              <path d={`M ${cx - 42} ${cy} a 42 42 0 0 1 84 0`} />
              <path d={`M ${cx - 27} ${cy} a 27 27 0 0 1 54 0`} />
              <path d={`M ${cx - 13} ${cy} a 13 13 0 0 1 26 0`} />
            </g>
          );
        })}
      </g>
    ))}
    <line x1={-20} y1={80} x2={W + 20} y2={80} stroke={KRP.brass} strokeWidth={6} />
    <line x1={-20} y1={88} x2={W + 20} y2={88} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
  </g>
);

// 檜扇 (晴明がいつも持つ扇。上向きに開く)
const Hiogi: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => {
  const r0 = 12, r1 = 106, a0 = -118, a1 = -56;
  const pt = (deg: number, r: number): [number, number] =>
    [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r];
  const [ox0, oy0] = pt(a0, r1), [ox1, oy1] = pt(a1, r1);
  const [ix0, iy0] = pt(a0, r0), [ix1, iy1] = pt(a1, r0);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M ${ix0} ${iy0} L ${ox0} ${oy0} A ${r1} ${r1} 0 0 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${r0} ${r0} 0 0 0 ${ix0} ${iy0} Z`}
        fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {Array.from({ length: 7 }, (_, i) => {
        const d = a0 + ((i + 1) / 8) * (a1 - a0);
        const [sx2, sy2] = pt(d, r0 + 4), [ex2, ey2] = pt(d, r1 - 5);
        return <line key={i} x1={sx2} y1={sy2} x2={ex2} y2={ey2} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />;
      })}
      <circle cx={0} cy={0} r={9} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      <path d="M 0 8 q -14 24 4 42" fill="none" stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

// 平安の装束の人 (狩衣 + 指貫 + 立烏帽子)。身長は AncientPerson と同じ比率にそろえる
const KariginuMan: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  cloth?: string; clothDark?: string; pattern?: string; hakama?: string;
  face?: "normal" | "worried" | "surprised" | "smile";
  gaze?: [number, number]; lean?: number; hideSleeves?: boolean;
}> = ({
  x, y, s = 1, f = 0, phase = 0, cloth = KRP.white, clothDark = "#E8E1D2",
  pattern = KRP.blueSoft, hakama = KRP.blueDeep, face = "normal", gaze = [0, 0], lean = 0, hideSleeves = false,
}) => {
    const bob = bobOf(f, phase);
    const blink = ((f + phase * 41) % 97) < 5 && f > 2;
    const [gx, gy] = gaze;
    const sw = Math.sin((f + phase * 11) / 17) * 2.4;
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {/* 浅沓 */}
        <ellipse cx={-28} cy={-4} rx={26} ry={11} fill={KRP.ink} />
        <ellipse cx={28} cy={-4} rx={26} ry={11} fill={KRP.ink} />
        {/* 指貫 (すそをくくった袴) */}
        <path d="M -52 -128 L 52 -128 Q 86 -78 72 -34 Q 38 -12 0 -12 Q -38 -12 -72 -34 Q -86 -78 -52 -128 Z"
          fill={hakama} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -72 -34 Q 0 -18 72 -34" fill="none" stroke={KRP.white} strokeWidth={4.5} opacity={0.7} />
        {/* 狩衣の身頃 */}
        <path d="M -54 -162 L 54 -162 L 76 -44 L -76 -44 Z" fill={cloth} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 地文 (菱) */}
        {[[-34, -138], [0, -112], [34, -138], [-22, -80], [22, -80]].map(([px, py], i) => (
          <path key={i} d={`M ${px} ${py - 13} L ${px + 13} ${py} L ${px} ${py + 13} L ${px - 13} ${py} Z`}
            fill="none" stroke={pattern} strokeWidth={3.5} opacity={0.9} />
        ))}
        {/* 大きな袖 (袖括りの緒つき) */}
        {!hideSleeves && [-1, 1].map((m) => (
          <g key={m} transform={`rotate(${m * sw} ${m * 48} -156)`}>
            <rect x={m > 0 ? 44 : -130} y={-160} width={86} height={116} rx={14}
              fill={clothDark} stroke={KRP.ink} strokeWidth={5} />
            <line x1={m * 78} y1={-152} x2={m * 78} y2={-52} stroke={KRP.ink} strokeWidth={3} opacity={0.28} />
            <circle cx={m * 122} cy={-56} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
            <path d={`M ${m * 122} -47 q ${m * -7} 20 ${m * 5} 34`} fill="none"
              stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
        {/* 襟 (単がのぞく) */}
        <path d="M -28 -164 L 0 -120 L 28 -164 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -18 -164 L 0 -134 L 18 -164" fill="none" stroke={KRP.orange} strokeWidth={5} />
        {/* 顔 */}
        <circle cx={0} cy={-224} r={62} fill={SKIN} stroke={KRP.ink} strokeWidth={5.5} />
        {blink ? (
          <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
            <line x1={-40} y1={-230} x2={-14} y2={-230} />
            <line x1={14} y1={-230} x2={40} y2={-230} />
          </g>
        ) : face === "surprised" ? (
          <g>
            <circle cx={-26 + gx * 0.3} cy={-230 + gy * 0.3} r={10} fill={KRP.ink} />
            <circle cx={26 + gx * 0.3} cy={-230 + gy * 0.3} r={10} fill={KRP.ink} />
          </g>
        ) : (
          /* 切れ長の目 (品のある細面) */
          <g fill={KRP.ink}>
            <path d={`M ${-43 + gx * 0.3} ${-229 + gy * 0.2} Q ${-28 + gx * 0.3} ${-242 + gy * 0.2} ${-11 + gx * 0.3} ${-230 + gy * 0.2} Q ${-28 + gx * 0.3} ${-221 + gy * 0.2} ${-43 + gx * 0.3} ${-229 + gy * 0.2} Z`} />
            <path d={`M ${11 + gx * 0.3} ${-230 + gy * 0.2} Q ${28 + gx * 0.3} ${-242 + gy * 0.2} ${43 + gx * 0.3} ${-229 + gy * 0.2} Q ${28 + gx * 0.3} ${-221 + gy * 0.2} ${11 + gx * 0.3} ${-230 + gy * 0.2} Z`} />
          </g>
        )}
        {/* 細いまゆ */}
        <path d="M -46 -252 Q -28 -263 -10 -254" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M 10 -254 Q 28 -263 46 -252" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        {/* 口 */}
        {face === "smile"
          ? <path d="M -15 -200 Q 0 -187 15 -200" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
          : face === "worried"
            ? <path d="M -15 -191 Q 0 -203 15 -191" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
            : face === "surprised"
              ? <ellipse cx={0} cy={-196} rx={10} ry={13} fill={KRP.ink} />
              : <line x1={-13} y1={-196} x2={13} y2={-196} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />}
        {/* 立烏帽子 */}
        <path d="M -30 -278 Q -35 -360 -2 -384 Q 28 -362 30 -278 Z"
          fill={KRP.ink} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -29 -282 Q 0 -298 29 -282" fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.55} />
      </g>
    );
  };

// 安倍晴明 (⑳ #51〜#54 で顔も装束も必ず同じにする。白い狩衣 + 立烏帽子 + 檜扇)
const Seimei: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: "normal" | "worried" | "surprised" | "smile";
  gaze?: [number, number]; lean?: number; pose?: "fan" | "mudra" | "plain";
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "normal", gaze = [0, 0], lean = 0, pose = "fan" }) => {
  const bob = bobOf(f, phase);
  return (
    <g>
      <KariginuMan x={x} y={y} s={s} f={f} phase={phase} cloth={KRP.white} clothDark="#DCD2BD"
        pattern={KRP.blueSoft} hakama={KRP.blueDeep} face={face} gaze={gaze} lean={lean} />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {pose === "fan" && (
          <g>
            <circle cx={98} cy={-64} r={16} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
            <Hiogi x={104} y={-76} s={0.85} rot={10} />
          </g>
        )}
        {pose === "mudra" && (
          <g>
            {/* 刀印 (人さし指と中指を立てる) */}
            <circle cx={32} cy={-140} r={18} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
            <rect x={20} y={-212} width={11} height={74} rx={5.5} fill={SKIN} stroke={KRP.ink} strokeWidth={3.5} />
            <rect x={35} y={-206} width={11} height={68} rx={5.5} fill={SKIN} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        )}
      </g>
    </g>
  );
};

// 紙の式神 (ひとがた)
const Shikigami: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> =
  ({ x, y, s = 1, rot = 0, o = 1 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      <path d="M 0 -64 L 26 -28 L 14 -28 L 40 30 L 12 30 L 12 64 L -12 64 L -12 30 L -40 30 L -14 -28 L -26 -28 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={-7} cy={-44} r={3.5} fill={KRP.ink} />
      <circle cx={7} cy={-44} r={3.5} fill={KRP.ink} />
    </g>
  );

// ===== 第2章つづき: 日本の陰陽寮 (#48〜#54) =====
// 寝殿造りの役所「陰陽寮」の建物。#48 (引き) と #49 (寄り) で同じ物を使い回す。
// ※ここを直すと両方の絵が変わる。片方だけ変えたいときは呼び出し側の transform で調整すること。
//   建物のローカル座標: 左右 -516〜516 / 棟 312 / 軒 524 / 母屋 554〜846 / 基壇の下 906
const OnmyoryoBuilding: React.FC<{ f: number; sign?: boolean; signX?: number; signY?: number }> =
  ({ f, sign = true, signX = -250, signY = 252 }) => {
    return (
      <g>
        {/* 檜皮葺の屋根 */}
        <path d="M -512 524 Q -466 420 -322 342 L 322 342 Q 466 420 512 524 Z"
          fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6.5} strokeLinejoin="round" />
        {/* 檜皮の重なり */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${-340 - i * 44} ${400 + i * 32} Q 0 ${382 + i * 32} ${340 + i * 44} ${400 + i * 32}`}
            fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.26} />
        ))}
        {/* 棟 */}
        <rect x={-344} y={312} width={688} height={36} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 鬼板 (両端のおさえ) */}
        {[-1, 1].map((m) => (
          <path key={m} d={`M ${m * 344} 348 L ${m * 344} 300 Q ${m * 376} 304 ${m * 382} 348 Z`}
            fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        ))}
        {/* 軒 */}
        <rect x={-524} y={524} width={1048} height={30} rx={6} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 母屋 */}
        <rect x={-436} y={554} width={872} height={292} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 柱 */}
        {[-436, -232, -28, 232, 436].map((px) => (
          <rect key={px} x={px - 11} y={554} width={22} height={292} fill={KRP.bronze}
            stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
        ))}
        {/* 蔀戸 (格子の戸。1枚だけ外に跳ね上げてある) */}
        {[-390, -190, 20, 240].map((px, i) => (
          <g key={px}>
            {i === 1 ? (
              <g>
                {/* 跳ね上げた蔀戸 */}
                <g transform="translate(-130 586) rotate(-24)">
                  <rect x={-90} y={-24} width={180} height={48} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
                  {[0, 1, 2, 3].map((k) => (
                    <line key={k} x1={-90 + k * 45} y1={-24} x2={-90 + k * 45} y2={24}
                      stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
                  ))}
                </g>
                {/* 開いた中 (暗い室内) */}
                <rect x={px} y={628} width={176} height={204} fill={KRP.grayDark} stroke={KRP.ink}
                  strokeWidth={5} opacity={0.72} />
                {/* 中で机に向かう役人のシルエット */}
                <g opacity={0.5}>
                  <circle cx={px + 88} cy={726} r={26} fill={KRP.ink} />
                  <path d={`M ${px + 48} 800 Q ${px + 56} 756 ${px + 88} 756 Q ${px + 120} 756 ${px + 128} 800 Z`}
                    fill={KRP.ink} />
                </g>
              </g>
            ) : (
              <g>
                <rect x={px} y={592} width={176} height={240} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
                {[1, 2, 3].map((k) => (
                  <line key={`v${k}`} x1={px + k * 44} y1={592} x2={px + k * 44} y2={832}
                    stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
                ))}
                {[1, 2, 3, 4].map((k) => (
                  <line key={`h${k}`} x1={px} y1={592 + k * 48} x2={px + 176} y2={592 + k * 48}
                    stroke={KRP.ink} strokeWidth={3.5} opacity={0.45} />
                ))}
              </g>
            )}
          </g>
        ))}
        {/* 簀子 (縁側) */}
        <rect x={-490} y={846} width={980} height={32} fill={KRP.floor} stroke={KRP.ink} strokeWidth={5.5} />
        {Array.from({ length: 19 }, (_, i) => (
          <line key={i} x1={-490 + i * 52} y1={846} x2={-490 + i * 52} y2={878}
            stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
        ))}
        {/* 高欄 (欄干) */}
        <rect x={-490} y={760} width={980} height={16} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-490} y={820} width={980} height={12} rx={6} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-480 + i * 88} y={776} width={13} height={48} fill={KRP.bronze}
            stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {/* 基壇 (石の土台) */}
        <rect x={-516} y={878} width={1032} height={28} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 階 (きざはし) */}
        <path d="M -72 878 L 72 878 L 100 908 L -100 908 Z" fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
        {/* 看板「陰陽寮」 */}
        {sign && (
          <g transform={`translate(${signX} ${signY + Math.sin(f / 12) * 3})`}>
            <rect x={-162} y={-58} width={324} height={116} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-150} y={-46} width={300} height={92} rx={8} fill="none" stroke={KRP.bronze} strokeWidth={4} />
            <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62}
              fill={KRP.ink}>陰陽寮</text>
          </g>
        )}
      </g>
    );
  };

// 築地塀 (役所をかこむ土塀。引きの絵で左右のあきを埋める)
const TsuijiBei: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* 瓦のひさし */}
    <rect x={0} y={0} width={w} height={22} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 土の壁 */}
    <rect x={10} y={22} width={w - 20} height={96} fill="#E6D8C0" stroke={KRP.ink} strokeWidth={5} />
    {/* 横の筋 (版築の線) */}
    {[0, 1, 2].map((i) => (
      <line key={i} x1={14} y1={46 + i * 24} x2={w - 14} y2={46 + i * 24}
        stroke={KRP.bronze} strokeWidth={3.5} opacity={0.6} />
    ))}
  </g>
);

// #48 さて、日本でも占いは、お役所の仕事でした (建物を引きで見せるだけ。人は出さない)
// → 次の #49 で、この建物の中の役人に寄る
const SceneOnmyoryoTatemono: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 0, 30)); // 建物がすっと立ち上がる
  return (
    <Frame f={f} seed={336} caption="日本でも、占いはお役所の仕事">
      <JapanBg f={f} floorY={910} />
      {/* 左右の築地塀 (建物の後ろ) */}
      <TsuijiBei x={-20} y={766} w={520} />
      <TsuijiBei x={1420} y={766} w={520} />
      {/* 役所の建物を画面の真ん中に、引きで */}
      <g transform={`translate(960 ${(1 - up) * 26}) scale(1)`} opacity={clamp01(up * 2)}>
        <OnmyoryoBuilding f={f} sign signX={-300} signY={300} />
      </g>
    </Frame>
  );
};

// #49 陰陽師 = 陰陽寮に勤める役人
// ※一度「建物に寄る」構図にしたが、引きのままのほうが見やすいので元に戻した (作者の指示)。
//   #48 は同じ建物を人なしで見せ、ここで出勤する役人を足す、という流れ。
const SceneOnmyoryo: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 0, 46));
  return (
    <Frame f={f} seed={336} caption="陰陽師 = 陰陽寮に勤める役人">
      <JapanBg f={f} floorY={910} />
      <g transform="translate(680 0)">
        <OnmyoryoBuilding f={f} sign signX={-250} signY={252} />
      </g>
      {/* ===== 出勤する役人たち (狩衣の色と文様を描き分ける) ===== */}
      {/* 深緑の狩衣 (書類持ち) */}
      <KariginuMan x={lerp(1760, 1480, walk)} y={902} s={1.02} f={f} phase={1} cloth={KRP.green}
        clothDark="#6BA767" pattern={KRP.cream} hakama="#5E6F4E" face="smile" gaze={[-6, 0]} lean={-3} />
      <g transform={`translate(${lerp(1760, 1480, walk)} ${902 + bobOf(f, 1)}) scale(1.02) rotate(-3)`}>
        <rect x={-128} y={-156} width={78} height={102} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5}
          transform="rotate(-8 -89 -105)" />
        {[0, 1].map((i) => (
          <line key={i} x1={-114} y1={-126 + i * 26} x2={-66} y2={-132 + i * 26}
            stroke={KRP.grayDark} strokeWidth={4.5} strokeLinecap="round" opacity={0.75} />
        ))}
      </g>
      {/* 濃紫の狩衣 (上役) */}
      <KariginuMan x={lerp(1960, 1760, walk)} y={884} s={0.9} f={f} phase={3} cloth={PUR.mid}
        clothDark={PUR.deep} pattern={PUR.glow} hakama={KRP.ink} face="normal" gaze={[-4, 0]} lean={-2} />
      <TagPlate x={1560} y={330} text="国家公務員" size={36} t={seg(f, 20, 36)} fill={KRP.yellow} />
      <TagPlate x={1560} y={430} text="おかみの役所に出勤" size={30} t={seg(f, 40, 56)} fill={KRP.blueSoft} />
    </Frame>
  );
};

// #51 安倍晴明は実在の人物
const SceneSeimei: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={337} caption="安倍晴明は、実在の人物"
    over={<Stamp x={1270} y={400} text="実在" size={84} />}>
    <JapanBg f={f} floorY={930} />
    {/* 几帳 (背景の間仕切り) */}
    <g transform="translate(350 0)" opacity={0.95}>
      <rect x={-150} y={430} width={300} height={16} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
      {[-1, 1].map((m) => (
        <rect key={m} x={m * 132 - 8} y={446} width={16} height={484} fill={KRP.bronze}
          stroke={KRP.ink} strokeWidth={4} />
      ))}
      {[-1, 1].map((m) => (
        <g key={`c${m}`}>
          <rect x={m === -1 ? -140 : 8} y={446} width={132} height={396} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={m === -1 ? -74 : 74} cy={520 + i * 124} r={28} fill="none"
              stroke={KRP.red} strokeWidth={4.5} opacity={0.75} />
          ))}
        </g>
      ))}
    </g>
    {/* 足元の影 */}
    <ellipse cx={820} cy={938} rx={196} ry={20} fill={KRP.floor} opacity={0.75} />
    <Seimei x={820} y={925} s={1.32} f={f} face="normal" gaze={[2, 0]} pose="fan" />
    <TagPlate x={820} y={330} text="安倍晴明" size={44} t={seg(f, 6, 22)} fill={KRP.white} />
    <Burst x={1340} y={620} r={84} color={KRP.orange} t={seg(f, 20, 36)} n={9} />
  </Frame>
);

// #52 貴族の日記にも登場するエリート官僚
const SceneSeimeiCareer: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={338} caption="日記にも残る、エリート官僚">
    <JapanBg f={f} floorY={920} />
    {/* 貴族の日記 (開いた冊子) */}
    <g transform={`translate(480 580) rotate(-3) scale(${pop(seg(f, 0, 16))})`}>
      <path d="M -240 -170 Q -120 -200 0 -170 L 0 170 Q -120 140 -240 170 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 240 -170 Q 120 -200 0 -170 L 0 170 Q 120 140 240 170 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={-200} y1={-100 + i * 62} x2={-50} y2={-108 + i * 62}
            stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
          <line x1={50} y1={-108 + i * 62} x2={i === 3 ? 130 : 200} y2={-100 + i * 62}
            stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
        </g>
      ))}
      <text x={-125} y={-120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40}
        fill={KRP.ink}>日記</text>
      {/* 晴明の名の囲み */}
      <ellipse cx={125} cy={-46} rx={78} ry={34} fill="none" stroke={KRP.red} strokeWidth={5}
        opacity={pop(seg(f, 20, 36))} />
    </g>
    {/* 出世の階段 */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={1020 + i * 220} y={860 - i * 150} width={220} height={60 + i * 150}
        fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5.5} opacity={seg(f, 8 + i * 10, 18 + i * 10)} />
    ))}
    <TagPlate x={1130} y={790} text="学生" size={30} t={seg(f, 14, 26)} />
    <TagPlate x={1350} y={640} text="天文博士" size={30} t={seg(f, 24, 36)} fill={KRP.yellow} />
    <Seimei x={1570} y={558} s={0.78} f={f} phase={2} face="smile" gaze={[-3, -3]} pose="fan" />
  </Frame>
);

// #53 遅咲きの苦労人 (机の巻物の山 + ゆっくり咲く花)
const SceneOsozaki: React.FC<{ f: number }> = ({ f }) => {
  const bloom = easeOut(seg(f, 20, 70));
  return (
    <Frame f={f} seed={339} caption="史料では、遅咲きの苦労人">
      <JapanBg f={f} floorY={920} />
      {/* 文机と巻物の山 */}
      <rect x={340} y={720} width={560} height={36} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
      <rect x={380} y={756} width={34} height={160} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      <rect x={830} y={756} width={34} height={160} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      <Makimono x={530} y={670} s={0.85} rot={-4} />
      <Makimono x={710} y={676} s={0.85} rot={5} />
      <Makimono x={620} y={600} s={0.85} rot={-2} />
      <Seimei x={1150} y={915} s={1.12} f={f} face="worried" gaze={[-6, 2]} lean={-2} pose="fan" />
      {/* 汗 */}
      <path d={`M 1046 ${600 + Math.sin(f / 7) * 4} q -12 20 0 30 q 12 -10 0 -30`}
        fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
      <TagPlate x={620} y={470} text="学生身分からスタート" size={32} t={seg(f, 10, 26)} />
      {/* ゆっくり咲く花 (遅咲き) */}
      <g transform="translate(1640 900)">
        <path d={`M 0 0 Q 6 ${-70 * bloom} 0 ${-140 * bloom}`} fill="none" stroke={KRP.green}
          strokeWidth={10} strokeLinecap="round" />
        <g transform={`translate(0 ${-150 * bloom}) scale(${Math.max(bloom, 0.001)})`}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <ellipse key={i} cx={Math.cos(a) * 30} cy={Math.sin(a) * 30} rx={24} ry={15}
                fill={KRP.orange} stroke={KRP.ink} strokeWidth={4}
                transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 30} ${Math.sin(a) * 30})`} />
            );
          })}
          <circle cx={0} cy={0} r={17} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      <TagPlate x={1640} y={610} text="遅咲き" size={34} t={seg(f, 56, 72)} fill={KRP.yellow} />
    </Frame>
  );
};

// #54 式神の話は後世の伝説
// ㉑ 前半 (f=0〜120) = 式神をあやつって闇と戦う / 後半 (f≈132〜) = 画面ぜんぶに「伝説」のハンコ
const SceneShikigami: React.FC<{ f: number }> = ({ f }) => {
  const mudra = easeOut(seg(f, 0, 26)); // 印を結ぶ
  const fly = easeOut(seg(f, 26, 74)); // 式神が飛ぶ
  const clash = seg(f, 64, 92); // ぶつかる
  const stampT = seg(f, 132, 150); // 「伝説」のハンコが落ちてくる
  const stampS = 2.8 - 1.8 * easeOut(stampT);
  // 式神の飛ぶ道すじ (晴明の手 → 闇)
  const path3 = [
    { x0: 700, y0: 560, x1: 1150, y1: 430, rot: -18 },
    { x0: 700, y0: 580, x1: 1170, y1: 580, rot: 8 },
    { x0: 700, y0: 600, x1: 1140, y1: 730, rot: 26 },
  ];
  return (
    <Frame f={f} seed={340} caption="式神の話は、後の時代の伝説"
      over={
        stampT > 0 ? (
          <div style={{
            position: "absolute", inset: 0,
            transform: `scale(${stampS})`, transformOrigin: "center", opacity: clamp01(stampT * 1.6),
          }}>
            {/* 画面まんなかに落ちてくる大きなハンコ (「作り話ですよ」の締め) */}
            <Stamp x={722} y={408} text="伝説" size={200} opacity={0.94} />
          </div>
        ) : undefined
      }>
      <JapanBg f={f} floorY={920} />
      {/* 闇のかたまり (右) */}
      <g transform={`translate(1430 ${574 + Math.sin(f / 11) * 8})`}>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={Math.sin(f / 9 + i * 2) * 14} cy={Math.cos(f / 10 + i * 2) * 12}
            rx={210 - i * 46} ry={190 - i * 42} fill={PUR.deep}
            opacity={0.3 + i * 0.16 - 0.24 * easeOut(stampT)} />
        ))}
        {/* 闇の目 */}
        <g opacity={0.9 - 0.9 * easeOut(stampT)}>
          <ellipse cx={-48} cy={-24} rx={20} ry={11} fill={KRP.yellow} transform="rotate(-14 -48 -24)" />
          <ellipse cx={48} cy={-24} rx={20} ry={11} fill={KRP.yellow} transform="rotate(14 48 -24)" />
        </g>
        {/* ゆらめくもや */}
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2 + f / 42;
          return (
            <ellipse key={i} cx={Math.cos(a) * 206} cy={Math.sin(a) * 182} rx={38} ry={28}
              fill={PUR.mid} opacity={0.32} />
          );
        })}
      </g>
      {/* 晴明 (刀印を結ぶ) */}
      <Seimei x={530} y={915} s={1.16} f={f} face="normal" gaze={[7, -5]} lean={2} pose="mudra" />
      {/* 印のまわりの光 */}
      <g opacity={mudra * (1 - easeOut(stampT))}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + f / 10;
          return (
            <line key={i} x1={567 + Math.cos(a) * 58} y1={740 + Math.sin(a) * 58}
              x2={567 + Math.cos(a) * 88} y2={740 + Math.sin(a) * 88}
              stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
          );
        })}
      </g>
      {/* 式神 (3体が飛んでいく) */}
      {path3.map((p, i) => {
        const t = clamp01(fly * 1.25 - i * 0.18);
        if (t <= 0) return null;
        const bob2 = Math.sin(f / 6 + i * 2) * 16;
        return (
          <g key={i}>
            {/* 飛んだあとの点線 */}
            <line x1={p.x0} y1={p.y0} x2={lerp(p.x0, p.x1, t)} y2={lerp(p.y0, p.y1, t) + bob2}
              stroke={KRP.yellow} strokeWidth={5} strokeDasharray="8 16" strokeLinecap="round" opacity={0.6} />
            <Shikigami x={lerp(p.x0, p.x1, t)} y={lerp(p.y0, p.y1, t) + bob2} s={0.92}
              rot={p.rot + Math.sin(f / 5 + i) * 14} o={1 - 0.9 * easeOut(stampT)} />
          </g>
        );
      })}
      {/* ぶつかりの火花 */}
      <Burst x={1216} y={562} r={110} color={KRP.orange} t={clash} n={11} />
      {clash > 0 && Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={1180} y1={470 + i * 46} x2={1270 + Math.sin(f / 4 + i) * 16} y2={452 + i * 46}
          stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round"
          opacity={(0.4 + 0.6 * Math.abs(Math.sin(f / 5 + i))) * clash * (1 - easeOut(stampT))} />
      ))}
      <TagPlate x={960} y={308} text="式神をあやつって、闇と戦う" size={34}
        t={seg(f, 36, 52) * (1 - easeOut(stampT))} fill={KRP.blueSoft} />
    </Frame>
  );
};

// ===== 第2章末のリキャップ (#55〜#58) =====
// ㉒ #55 「ここまでを、ざっくりまとめましょう」= まとめ宣言の絵 (黒板に見出しが上がり、3つの印が並びはじめる)
const SceneMatomeSengen: React.FC<{ f: number }> = ({ f }) => {
  const board = pop(seg(f, 0, 16));
  const head = easeOut(seg(f, 14, 34)); // 見出しがすーっと上がる
  const chalk = seg(f, 30, 46); // 下線をひく
  const marks: { t: string; fill: string }[] = [
    { t: "中国", fill: KRP.red },
    { t: "ローマ", fill: KRP.blueSoft },
    { t: "日本", fill: KRP.green },
  ];
  return (
    <Frame f={f} seed={355} caption="ここまでを、ざっくりまとめましょう">
      {/* 黒板 */}
      <g transform={`translate(960 600) scale(${Math.max(board, 0.001)})`}>
        <rect x={-760} y={-330} width={1520} height={660} rx={18} fill={KRP.bronze}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={-730} y={-300} width={1460} height={600} rx={10} fill={KRP.grayDark}
          stroke={KRP.ink} strokeWidth={6} />
        {/* チョーク受け */}
        <rect x={-700} y={300} width={1400} height={26} rx={8} fill={KRP.bronze}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={520} y={284} width={110} height={18} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 見出し (下から上がってくる) */}
      <g opacity={head} transform={`translate(0 ${(1 - head) * 40})`}>
        <text x={960} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88}
          fill={KRP.white}>ここまでのまとめ</text>
        {/* チョークの下線 */}
        <line x1={568} y1={430} x2={lerp(568, 1352, easeOut(chalk))} y2={430}
          stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" />
      </g>
      {/* 3つの印がぽん、ぽん、ぽん、と並びはじめる (次の絵の予告) */}
      {marks.map((m, i) => {
        const t = pop(seg(f, 40 + i * 14, 58 + i * 14));
        if (t <= 0) return null;
        return (
          <g key={m.t} transform={`translate(${560 + i * 400} 660) scale(${t})`}>
            <circle cx={0} cy={0} r={78} fill={m.fill} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={0} r={60} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.6} />
            <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={m.t.length > 2 ? 34 : 44} fill={KRP.ink}>{m.t}</text>
          </g>
        );
      })}
      {/* まだ続く、の三点 */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={1536 + i * 36} cy={660} r={9} fill={KRP.white}
          opacity={0.25 + 0.6 * Math.abs(Math.sin(f / 9 - i * 0.8))} />
      ))}
      <TagPlate x={960} y={852} text="骨・星・鳥、ぜんぶ出そろいました" size={34}
        t={seg(f, 62, 78)} fill={KRP.yellow} />
    </Frame>
  );
};

// ㉓ #56 骨も星も鳥も、聞き方はバラバラ (3本の矢印がまんなかの印にきれいに集まる)
const SceneMatomeThree: React.FC<{ f: number }> = ({ f }) => {
  // 矢印: 3つの円のふちから、まんなかの印のふちまで
  const CX = 960, CY = 366, END_R = 104;
  const SRC: [number, number][] = [[440, 686], [960, 686], [1480, 686]];
  return (
    <Frame f={f} seed={341} caption="聞き方はバラバラ、でも相手はひとつ">
      {/* 3つの聞き方 */}
      <g transform={`translate(440 686) scale(${pop(seg(f, 0, 14))})`}>
        <circle cx={0} cy={0} r={118} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
        <OracleBone x={0} y={0} s={0.52} crack={1} />
      </g>
      <g transform={`translate(960 686) scale(${pop(seg(f, 10, 24))})`}>
        <circle cx={0} cy={0} r={118} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} opacity={0.94} />
        {[[-40, -30], [20, -52], [48, 10], [-14, 40]].map(([sx, sy], i) => (
          <path key={i} transform={`translate(${sx} ${sy})`} fill={KRP.yellow}
            opacity={0.6 + 0.4 * Math.sin(f / 8 + i * 1.5)}
            d="M 0 -12 L 4 -4 L 12 0 L 4 4 L 0 12 L -4 4 L -12 0 L -4 -4 Z" />
        ))}
        <polyline points="-40,-30 20,-52 48,10 -14,40" fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={0.6} />
      </g>
      <g transform={`translate(1480 686) scale(${pop(seg(f, 20, 34))})`}>
        <circle cx={0} cy={0} r={118} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M -58 10 Q -24 ${-24 - Math.sin(f / 5) * 10} 0 10 Q 24 ${-24 - Math.sin(f / 5) * 10} 58 10`}
          fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
      </g>
      <TagPlate x={440} y={858} text="骨" size={36} t={seg(f, 8, 20)} />
      <TagPlate x={960} y={858} text="星" size={36} t={seg(f, 18, 30)} />
      <TagPlate x={1480} y={858} text="鳥" size={36} t={seg(f, 28, 40)} />
      {/* 3本の矢印が、まんなかの印のふちにそろって届く */}
      {SRC.map(([sx3, sy3], i) => {
        const t = easeOut(seg(f, 36 + i * 6, 54 + i * 6));
        if (t <= 0) return null;
        const vx = CX - sx3, vy = CY - sy3;
        const len = Math.hypot(vx, vy);
        const ux = vx / len, uy = vy / len;
        // 始点 = 円のふち (r=124) / 終点 = 印のふち (END_R)
        const ax = sx3 + ux * 122, ay = sy3 + uy * 122;
        const bx = sx3 + ux * (len - END_R), by = sy3 + uy * (len - END_R);
        const hl = 44, hw = 21; // 矢じりの長さと半幅
        const nx = -uy, ny = ux;
        const tipX = lerp(ax, bx, t), tipY = lerp(ay, by, t);
        const baseX = tipX - ux * hl, baseY = tipY - uy * hl;
        return (
          <g key={i}>
            <line x1={ax} y1={ay} x2={baseX} y2={baseY}
              stroke={KRP.orange} strokeWidth={12} strokeLinecap="round" />
            <polygon
              points={`${tipX},${tipY} ${baseX + nx * hw},${baseY + ny * hw} ${baseX - nx * hw},${baseY - ny * hw}`}
              fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          </g>
        );
      })}
      {/* 集まる先の印 (まんなか。形をきれいに整える) */}
      <g transform={`translate(${CX} ${CY}) scale(${pop(seg(f, 52, 68))})`}>
        <circle cx={0} cy={0} r={104} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={0} cy={0} r={84} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={104 + 10 * (0.5 + 0.5 * Math.sin(f / 9))} fill="none"
          stroke={KRP.orange} strokeWidth={5} opacity={0.5} />
        <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104}
          fill={KRP.ink}>?</text>
      </g>
    </Frame>
  );
};

// ㉔ #57 「神様です」= 集まった先はこの方、とひと目で分かる絵 (光・雲・玉座のかげ)
const SceneRouteKami: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 0, 14));
  const seat = pop(seg(f, 4, 22));
  const ray = easeOut(seg(f, 10, 30));
  return (
    <Frame f={f} seed={342} caption="聞く相手は、ずっと「神様」">
      {/* 空 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueSoft} opacity={0.3} />
      {/* 放射状のひかり (まんなかから) */}
      <g opacity={0.55 * ray}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2 + f / 90;
          return (
            <polygon key={i} fill={KRP.yellow} opacity={0.5}
              points={`960,470 ${960 + Math.cos(a - 0.05) * 1100},${470 + Math.sin(a - 0.05) * 1100} ${960 + Math.cos(a + 0.05) * 1100},${470 + Math.sin(a + 0.05) * 1100}`} />
          );
        })}
      </g>
      {/* 雲の段 (玉座をのせる) */}
      <g transform={`translate(960 ${772 + (1 - up) * 40})`} opacity={up}>
        {[[-300, 30, 1.0], [300, 30, 1.0], [-130, -6, 0.86], [130, -6, 0.86], [0, -34, 0.78]].map(([cx2, cy2, k], i) => (
          <g key={i} transform={`translate(${cx2} ${cy2 + Math.sin(f / 15 + i) * 4}) scale(${k})`}>
            <ellipse cx={0} cy={0} rx={190} ry={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={-70} cy={-34} rx={96} ry={62} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={70} cy={-30} rx={84} ry={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
      </g>
      {/* 玉座と、そこに座っている「ひかり」(顔もすがたも描かない = 特定の宗教の絵にしない) */}
      <g transform={`translate(960 600) scale(${Math.max(seat, 0.001)})`}>
        {/* 背もたれ (肩のある形。丸い墓石に見えないように角を立てる) */}
        <path d="M -144 70 L -144 -150 L -106 -190 L 106 -190 L 144 -150 L 144 70 Z"
          fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={-100} y={-146} width={200} height={190} rx={14}
          fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
        {/* 背もたれの上かざり */}
        {[-1, 1].map((m) => (
          <circle key={m} cx={m * 124} cy={-196} r={17} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* ひじかけ (横木と前の柱) */}
        {[-1, 1].map((m) => (
          <g key={m}>
            <rect x={m > 0 ? 144 : -214} y={-26} width={70} height={28} rx={10}
              fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
            <rect x={m > 0 ? 176 : -204} y={2} width={28} height={58} rx={8}
              fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 座面 (枠と赤いしきもの) */}
        <rect x={-182} y={56} width={364} height={42} rx={10} fill={KRP.grayDark}
          stroke={KRP.ink} strokeWidth={6.5} />
        <rect x={-154} y={26} width={308} height={38} rx={12} fill={KRP.red}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 脚 (雲にうまって見える) */}
        {[-1, 1].map((m) => (
          <rect key={m} x={m > 0 ? 126 : -162} y={96} width={36} height={80} rx={8}
            fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        ))}
        {/* 座っているのは「ひかり」そのもの */}
        <g>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + f / 26;
            return (
              <line key={i} x1={Math.cos(a) * 88} y1={-62 + Math.sin(a) * 88}
                x2={Math.cos(a) * 116} y2={-62 + Math.sin(a) * 116}
                stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round" opacity={0.85 * ray} />
            );
          })}
          <path d="M -88 58 Q -80 -12 0 -12 Q 80 -12 88 58 Z"
            fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={0} cy={-62} r={50} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-62} r={76 + 7 * Math.sin(f / 7)} fill="none" stroke={KRP.yellow}
            strokeWidth={6} opacity={0.6} />
        </g>
      </g>
      <TagPlate x={960} y={300} text="答えた相手は、神様" size={46} t={seg(f, 14, 30)} fill={KRP.yellow} />
    </Frame>
  );
};

// ㉕ #58 答えは人間の外側、はるか上に (下に小さな人、上に答えの札。カメラが上へパンする)
const SceneHarukaUe: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeOut(seg(f, 10, 86)); // 上へパン
  const shiftY = lerp(0, 420, pan); // 世界が下へ流れる = カメラが上へ
  const plate = pop(seg(f, 74, 94));
  return (
    <Frame f={f} seed={356} caption="答えは、人間のはるか上にあった">
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueSoft} opacity={0.28} />
      <g transform={`translate(0 ${shiftY})`}>
        {/* いちばん下: 地面と小さな人 */}
        {/* 地面と人は、字幕帯 (1行時の上端 y≒931) より上に収める */}
        <rect x={-20} y={900} width={W + 40} height={420} fill={KRP.floor} />
        <line x1={-20} y1={900} x2={W + 20} y2={900} stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(960 896) scale(0.34)">
          <AncientPerson x={0} y={0} s={1} role="pilgrim" f={f} face="surprised" gaze={[0, -8]} />
        </g>
        <TagPlate x={1130} y={846} text="人間" size={30} t={seg(f, 0, 12)} />
        {/* 高さのものさし (上へのへだたりを強調する点線と目もり) */}
        <line x1={960} y1={780} x2={960} y2={190} stroke={KRP.grayDark} strokeWidth={5}
          strokeDasharray="10 22" strokeLinecap="round" opacity={0.6} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={906} y1={720 - i * 150} x2={1014} y2={720 - i * 150}
            stroke={KRP.grayDark} strokeWidth={4} opacity={0.4} />
        ))}
        {/* 雲の層 (へだたりの実感) */}
        {[[420, 760, 0.8], [1500, 640, 0.7], [620, 430, 0.9], [1360, 300, 0.75],
        [330, 215, 0.62], [1590, 170, 0.56]].map(([cx2, cy2, k], i) => (
          <g key={i} transform={`translate(${(cx2 as number) + Math.sin(f / 17 + i) * 10} ${cy2}) scale(${k})`}
            opacity={0.9}>
            <ellipse cx={0} cy={0} rx={160} ry={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
            <ellipse cx={-54} cy={-30} rx={86} ry={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
            <ellipse cx={60} cy={-26} rx={74} ry={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          </g>
        ))}
        {/* いちばん上: はるか上の答え */}
        <g transform="translate(960 40)">
          <GodLight x={0} y={-120} s={1.15} f={f} />
          <g transform={`scale(${Math.max(plate, 0.001)})`}>
            <rect x={-330} y={-52} width={660} height={124} rx={16} fill={KRP.yellow}
              stroke={KRP.ink} strokeWidth={7} />
            <rect x={-312} y={-36} width={624} height={92} rx={10} fill="none"
              stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
            <text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62}
              fill={KRP.ink}>私は何者?の答え</text>
          </g>
        </g>
      </g>
      {/* 「ずっと上」をしめす上向き矢印 */}
      <g opacity={0.5 + 0.5 * Math.sin(f / 8)}>
        {[0, 1, 2].map((i) => (
          <polygon key={i} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4}
            points={`300,${560 - i * 90} 254,${626 - i * 90} 346,${626 - i * 90}`} opacity={1 - i * 0.28} />
        ))}
      </g>
      <TagPlate x={300} y={700} text="人間の、外側" size={34} t={seg(f, 24, 40)} fill={KRP.blueSoft} />
      {/* 乗り換え路線図: 1駅目 (第2章末のリキャップ) */}
      <g opacity={seg(f, 100, 118)}>
        <RouteMap x={1920} y={760} s={0.64} f={Math.max(0, f - 100)} count={1} />
      </g>
    </Frame>
  );
};

// ===== 第3章 (#59〜#69) =====
// #59 第3章の扉 (望遠鏡と星空)
const SceneCh3Door: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={343}
    over={<ChapterTitle num={3} title="天文学の、愚かな娘。" t={easeOut(seg(f, 10, 32))} />}>
    <NightSky f={f} h={560} />
    <path d="M -20 540 Q 480 490 960 530 Q 1440 570 1940 520 L 1940 1100 L -20 1100 Z"
      fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <Telescope x={470} y={900} s={1.5} />
    {/* 視線の先の星 */}
    <line x1={320} y1={640} x2={190} y2={420} stroke={KRP.yellow} strokeWidth={4}
      strokeDasharray="4 16" strokeLinecap="round" opacity={0.8} />
    <g transform="translate(170 380)" opacity={0.7 + 0.3 * Math.sin(f / 7)}>
      <path d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill={KRP.yellow}
        stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  </Frame>
);

// #60 ケプラーという天文学者
const SceneKeplerTelescope: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={344} caption="天文学者、ケプラー">
    <NightSky f={f} h={620} />
    <path d="M -20 600 Q 480 560 960 590 Q 1440 620 1940 580 L 1940 1100 L -20 1100 Z"
      fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <Telescope x={700} y={930} s={1.35} />
    <Kepler x={1180} y={940} s={1.2} f={f} face="smile" gaze={[-5, -7]} lean={-4} armR={-18} />
    <TagPlate x={1560} y={700} text="ケプラー" size={40} t={seg(f, 10, 26)} fill={KRP.white} />
    {/* 視線 */}
    <line x1={560} y1={700} x2={360} y2={420} stroke={KRP.yellow} strokeWidth={4}
      strokeDasharray="4 16" strokeLinecap="round" opacity={0.8} />
  </Frame>
);

// #61 惑星の動きの法則 (だ円軌道の図解)
const SceneWakuseiHousoku: React.FC<{ f: number }> = ({ f }) => {
  const a = f / 22; // 惑星の位置 (ゆっくり公転)
  const px = Math.cos(a) * 430;
  const py = Math.sin(a) * 240;
  return (
    <Frame f={f} seed={345} caption="惑星の動きの法則を、解き明かした"
      over={<Stamp x={1430} y={200} text="科学史の大スター" size={34} />}>
      {/* 黒板風の図解パネル */}
      <rect x={260} y={300} width={1400} height={600} rx={20} fill={KRP.blueDeep} opacity={0.92}
        stroke={KRP.ink} strokeWidth={6.5} />
      <g transform="translate(960 600)">
        {/* だ円軌道 */}
        <ellipse cx={0} cy={0} rx={430} ry={240} fill="none" stroke={KRP.white} strokeWidth={5}
          strokeDasharray="18 16" opacity={0.9} />
        {/* 太陽 (焦点のひとつ) */}
        <g transform="translate(-190 0)">
          <circle cx={0} cy={0} r={46} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
          {Array.from({ length: 8 }, (_, i) => {
            const sa = (i / 8) * Math.PI * 2 + f / 60;
            return (
              <line key={i} x1={Math.cos(sa) * 54} y1={Math.sin(sa) * 54}
                x2={Math.cos(sa) * 70} y2={Math.sin(sa) * 70}
                stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" />
            );
          })}
        </g>
        {/* 太陽-惑星を結ぶ線 */}
        <line x1={-190} y1={0} x2={px} y2={py} stroke={KRP.white} strokeWidth={3.5} opacity={0.55} />
        {/* 惑星 */}
        <circle cx={px} cy={py} r={26} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* もとは y=970 で字幕帯の下に完全に隠れていた → 黒板パネルの上辺に見出しとして置く */}
      <TagPlate x={960} y={310} text="惑星はだ円をえがく" size={34} t={seg(f, 20, 36)} fill={KRP.yellow} />
      <Kepler x={155} y={1012} s={0.95} f={f} face="smile" gaze={[6, -4]} lean={3} />
    </Frame>
  );
};

// #62 大事な収入源は、占い
const SceneUranaiShunyu: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={346} caption="大事な収入源は、実は占い">
    <Floor y={930} />
    <Kepler x={500} y={925} s={1.15} f={f} face="normal" gaze={[5, 0]} lean={2} armR={-26} />
    <HoroscopePaper x={1050} y={560} s={1.0} f={f} rot={-3} />
    {/* 紙から財布へコインが流れる */}
    {[0, 1, 2].map((i) => {
      const t = ((f / 40 + i / 3) % 1);
      return (
        <CoinS key={i} x={lerp(1200, 1480, t)} y={560 + Math.sin(t * Math.PI) * -130 + t * 240}
          s={0.9} o={t < 0.08 || t > 0.92 ? 0 : 1} />
      );
    })}
    {/* 財布 (ふくろ) */}
    <g transform={`translate(1520 ${850 + Math.sin(f / 10) * 2})`}>
      <path d="M -90 10 Q -96 -70 -30 -86 L 30 -86 Q 96 -70 90 10 Q 80 80 0 84 Q -80 80 -90 10 Z"
        fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -34 -86 Q 0 -112 34 -86" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      <CoinS x={0} y={-6} s={0.8} />
    </g>
    <TagPlate x={1520} y={620} text="家計の味方" size={32} t={seg(f, 24, 40)} fill={KRP.yellow} />
  </Frame>
);

// ===== ㉘ 神聖ローマ皇帝の宮廷 (#62 用の部品) =====
// 石造りの広間: 切り石の壁 + アーチ窓 + タペストリー + 燭台 + 玉座。豪華さと威圧感を出す。
const ArchWindow: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 窓わく (石の縁) */}
    <path d="M -92 300 L -92 -74 Q -92 -176 0 -176 Q 92 -176 92 -74 L 92 300 Z"
      fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
    {/* ガラス */}
    <path d="M -70 282 L -70 -70 Q -70 -156 0 -156 Q 70 -156 70 -70 L 70 282 Z"
      fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    {/* 格子 (細い桟) */}
    <line x1={0} y1={-152} x2={0} y2={282} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
    {[-40, 36, 112, 188].map((gy) => (
      <line key={gy} x1={-70} y1={gy} x2={70} y2={gy} stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
    ))}
    {/* 差しこむ光 (ゆっくり明滅) */}
    <path d="M -64 -60 L 64 -60 L 64 270 L -64 270 Z" fill={KRP.white}
      opacity={0.12 + 0.05 * Math.sin(f / 23)} />
    {/* 要石 */}
    <path d="M -22 -176 L 22 -176 L 16 -212 L -16 -212 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

const Tapestry: React.FC<{ x: number; y: number; s?: number; f?: number; color?: string }> =
  ({ x, y, s = 1, f = 0, color = KRP.red }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* つり棒 */}
      <rect x={-118} y={-18} width={236} height={18} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
      {[-118, 118].map((bx) => (
        <circle key={bx} cx={bx} cy={-9} r={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 布 (下のへりがゆれる) */}
      <path d={`M -104 0 L 104 0 L 104 384 Q 52 ${398 + Math.sin(f / 21) * 5} 0 384 Q -52 ${370 + Math.sin(f / 21 + 1) * 5} -104 384 Z`}
        fill={color} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 縁の帯 */}
      <rect x={-104} y={14} width={208} height={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-104} y={336} width={208} height={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      {/* 織りの文様 (王冠と星。宗教のしるしは描かない) */}
      <path d="M -46 180 L -46 136 L -22 160 L 0 124 L 22 160 L 46 136 L 46 180 Z"
        fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-46} y={182} width={92} height={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      {[[-66, 256], [0, 278], [66, 256]].map(([sx2, sy2], i) => (
        <path key={i} d={`M ${sx2} ${sy2 - 17} L ${sx2 + 5} ${sy2 - 5} L ${sx2 + 17} ${sy2} L ${sx2 + 5} ${sy2 + 5} L ${sx2} ${sy2 + 17} L ${sx2 - 5} ${sy2 + 5} L ${sx2 - 17} ${sy2} L ${sx2 - 5} ${sy2 - 5} Z`}
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {/* 房 */}
      {[-78, -39, 0, 39, 78].map((bx) => (
        <line key={bx} x1={bx} y1={382} x2={bx} y2={406} stroke={KRP.brass} strokeWidth={5} strokeLinecap="round" />
      ))}
    </g>
  );

// 燭台 (シャンデリア風。ろうそくの炎がゆらぐ)
const Candelabra: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 26) * 3}) scale(${s})`}>
    {/* つりくさり */}
    <line x1={0} y1={-300} x2={0} y2={-40} stroke={KRP.ink} strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={0} cy={-260 + i * 52} r={9} fill="none" stroke={KRP.ink} strokeWidth={4} />
    ))}
    {/* 輪 */}
    <line x1={0} y1={-44} x2={0} y2={0} stroke={KRP.brass} strokeWidth={10} />
    {[-1, 1].map((m) => (
      <line key={m} x1={0} y1={-40} x2={m * 128} y2={-6} stroke={KRP.brass} strokeWidth={7} />
    ))}
    <ellipse cx={0} cy={0} rx={132} ry={32} fill="none" stroke={KRP.brass} strokeWidth={14} />
    <ellipse cx={0} cy={0} rx={132} ry={32} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
    {/* ろうそく */}
    {[-128, -66, 0, 66, 128].map((bx, i) => (
      <g key={bx} transform={`translate(${bx} ${bx === 0 ? -32 : Math.abs(bx) === 66 ? -26 : 0})`}>
        <rect x={-10} y={-56} width={20} height={58} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 0 ${-86 - Math.abs(Math.sin(f / 6 + i)) * 7} Q 11 -66 0 -58 Q -11 -66 0 ${-86 - Math.abs(Math.sin(f / 6 + i)) * 7} Z`}
          fill={KRP.yellow} stroke={KRP.orange} strokeWidth={3.5} />
      </g>
    ))}
  </g>
);

// 空の金庫 (ふたを開けて中を見せる。中身はカラ)
const EmptyChest: React.FC<{ x: number; y: number; s?: number; rot?: number; f?: number }> =
  ({ x, y, s = 1, rot = 0, f = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* ふた (開いている) */}
      <g transform="translate(-98 -54) rotate(-52)">
        <rect x={0} y={-30} width={196} height={30} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={6} y={-24} width={184} height={10} fill={KRP.brass} opacity={0.9} />
      </g>
      {/* 箱 */}
      <rect x={-98} y={-54} width={196} height={112} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
      {/* 中身なし (内側の闇) */}
      <rect x={-80} y={-44} width={160} height={46} rx={6} fill={KRP.ink} opacity={0.5} />
      {/* 帯金と錠 */}
      {[-54, 54].map((bx) => (
        <rect key={bx} x={bx - 9} y={-54} width={18} height={112} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
      <rect x={-18} y={12} width={36} height={30} rx={5} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      {/* カラッポの風 (ほこりが舞う) */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={-40 + i * 38 + Math.sin(f / 9 + i * 2) * 10}
          cy={-56 - ((f * 1.6 + i * 40) % 90)} r={6 - i * 1.2} fill={KRP.gray}
          opacity={0.55 - 0.13 * i} />
      ))}
    </g>
  );

// ㉘ #62 宮廷のお仕事は、お給料の遅配が日常茶飯事
// (神聖ローマ皇帝の宮廷。働いたのに会計係は空の金庫を見せて「また今度」)
const SceneKyuryoChihai: React.FC<{ f: number }> = ({ f }) => {
  const chest = clamp01(seg(f, 16, 32));
  return (
    <Frame f={f} seed={347} caption="宮廷のお給料は、遅配が日常茶飯事">
      {/* ===== 石造りの広間 ===== */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.silver} opacity={0.45} />
      {/* 切り石の壁 */}
      {Array.from({ length: 7 }, (_, r) => (
        <g key={r}>
          <line x1={-20} y1={126 + r * 108} x2={W + 20} y2={126 + r * 108}
            stroke={KRP.grayDark} strokeWidth={4} opacity={0.38} />
          {Array.from({ length: 10 }, (_, c) => (
            <line key={c} x1={c * 232 + (r % 2 ? 116 : 0) - 20} y1={126 + r * 108}
              x2={c * 232 + (r % 2 ? 116 : 0) - 20} y2={234 + r * 108}
              stroke={KRP.grayDark} strokeWidth={4} opacity={0.28} />
          ))}
        </g>
      ))}
      {/* 天井のアーチ (威圧感) */}
      <path d="M -20 250 Q 310 70 640 250" fill="none" stroke={KRP.grayDark} strokeWidth={16} opacity={0.45} />
      <path d="M 1280 250 Q 1610 70 1940 250" fill="none" stroke={KRP.grayDark} strokeWidth={16} opacity={0.45} />
      {/* 柱 (左右のはし) */}
      {[64, 1856].map((bx) => (
        <g key={bx}>
          <rect x={bx - 52} y={176} width={104} height={760} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={bx - 26 + i * 26} y1={200} x2={bx - 26 + i * 26} y2={910}
              stroke={KRP.grayDark} strokeWidth={4} opacity={0.45} />
          ))}
          <rect x={bx - 70} y={172} width={140} height={34} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
        </g>
      ))}
      {/* アーチ窓 */}
      <ArchWindow x={330} y={470} s={0.86} f={f} />
      <ArchWindow x={1620} y={470} s={0.86} f={f} />
      {/* タペストリー (壁かけ) */}
      <Tapestry x={640} y={262} s={0.74} f={f} color={KRP.red} />
      <Tapestry x={1300} y={262} s={0.74} f={f} color={KRP.blueDeep} />
      {/* 奥の玉座 (段の上。空席でも威圧感) */}
      <g transform="translate(970 790) scale(0.72)">
        {[0, 1].map((i) => (
          <rect key={i} x={-230 + i * 36} y={-i * 36} width={460 - i * 72} height={38}
            fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 天蓋 */}
        <path d="M -152 -300 L 152 -300 L 112 -256 L -112 -256 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -152 -300 L 0 -346 L 152 -300 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 背もたれ */}
        <path d="M -94 -72 L -94 -248 L -66 -278 L 66 -278 L 94 -248 L 94 -72 Z"
          fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-66} y={-242} width={132} height={152} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 座面とひじかけ */}
        <rect x={-112} y={-78} width={224} height={28} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        {[-1, 1].map((m) => (
          <rect key={m} x={m > 0 ? 94 : -146} y={-110} width={52} height={24} rx={8}
            fill={KRP.bronze} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
      </g>
      {/* シャンデリア風の燭台 */}
      <Candelabra x={500} y={320} s={0.66} f={f} />
      <Candelabra x={1440} y={320} s={0.66} f={f} />
      {/* 石の床 (市松) */}
      <rect x={-20} y={862} width={W + 40} height={H - 842} fill={KRP.floor} />
      <line x1={-20} y1={862} x2={W + 20} y2={862} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 16 }, (_, i) => (
        <polygon key={i} fill={i % 2 ? KRP.grayDark : KRP.cream} opacity={0.4}
          points={`${i * 120 - 20},862 ${i * 120 + 100},862 ${i * 150 + 150},${H + 20} ${i * 150 - 70},${H + 20}`} />
      ))}

      {/* ===== 会計係 (右): 空の金庫を見せて「また今度」 ===== */}
      {/* 執務机 */}
      <g transform="translate(1330 905)">
        <rect x={-210} y={-196} width={420} height={30} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-198} y={-166} width={396} height={128} rx={6} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
        {[-100, 100].map((bx) => (
          <g key={bx}>
            <rect x={bx - 82} y={-152} width={164} height={48} rx={5} fill="none"
              stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
            <circle cx={bx} cy={-128} r={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 支払い待ちの札の山 (机の上。どんどん溜まっている) */}
      <g transform="translate(1200 700)">
        <line x1={0} y1={-136} x2={0} y2={14} stroke={KRP.grayDark} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`translate(${Math.sin(i * 2.1) * 9} ${-i * 15}) rotate(${Math.sin(i * 1.6) * 5})`}>
            <rect x={-76} y={-11} width={152} height={22} rx={5} fill={KRP.white}
              stroke={KRP.ink} strokeWidth={4} />
            <line x1={-56} y1={-1} x2={30} y2={-1} stroke={KRP.grayDark} strokeWidth={4}
              strokeLinecap="round" opacity={0.6} />
          </g>
        ))}
        <circle cx={0} cy={-140} r={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      <TagPlate x={1136} y={498} text="未払い" size={30} t={seg(f, 26, 42)} fill={KRP.red} color={KRP.white} />
      {/* 会計係 (帳簿の役人) */}
      <Person x={1630} y={905} s={1.05} f={f} phase={3} face="smile" gaze={[-7, 0]}
        cloth={KRP.grayDark} clothDark={KRP.ink} hair="cap" />
      {/* 差し出された空の金庫 */}
      <g opacity={chest}>
        <EmptyChest x={1452} y={lerp(700, 672, chest) + Math.sin(f / 11) * 4} s={0.7} rot={-10} f={f} />
      </g>
      {/* 会計係のことば */}
      <Bubble x={1604} y={436} w={312} h={118} tailTo={[1630, 600]} text="また今度" size={46}
        t={seg(f, 32, 48)} color={KRP.red} />

      {/* ===== ケプラー (左): 仕事は済ませたのに、受け取るものがない =====
          ※「仕事は、すんでいる」の札と、わきの星図の巻物は置かない (作者の指示)。
            そのぶん空いた左下を埋めるため、ケプラー一式を 80px 左へ寄せてある
            (ケプラー・手のひら・汗・給料袋・ふきだしは必ず同じだけ動かすこと) */}
      <Kepler x={540} y={905} s={1.18} f={f} phase={1} face="worried" gaze={[8, 2]} lean={3}
        armR={-74} armL={-12} />
      {/* 差し出した手のひらの上 = からっぽ */}
      <g opacity={0.5 + 0.5 * Math.sin(f / 9)}>
        {[[680, 636], [706, 620], [734, 634]].map(([cx2, cy2], i) => (
          <circle key={i} cx={cx2} cy={cy2} r={6 - i * 0.6} fill={KRP.grayDark} />
        ))}
      </g>
      {/* 汗 */}
      <path d={`M 456 ${600 + Math.sin(f / 7) * 4} q -13 21 0 31 q 13 -10 0 -31`}
        fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
      {/* 空っぽの給料袋 (ケプラーの腰にぶら下がる) */}
      <g transform={`translate(620 ${800 + Math.sin(f / 10) * 2}) rotate(7)`}>
        <path d="M -40 4 Q -44 -34 -14 -42 L 14 -42 Q 44 -34 40 4 Q 36 36 0 38 Q -36 36 -40 4 Z"
          fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -16 -42 Q 0 -56 16 -42" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={-24} y1={8} x2={24} y2={8} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      </g>
      {/* ケプラーのことば */}
      <Bubble x={610} y={398} w={392} h={120} tailTo={[504, 548]} text="お給料は…?" size={46}
        t={seg(f, 12, 28)} />
      <TagPlate x={960} y={866} text="働いても、お金が来ない" size={34} t={seg(f, 48, 64)} fill={KRP.yellow} />
    </Frame>
  );
};

// #64 暦とホロスコープで家計の穴埋め
const SceneKoyomiShigoto: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={348} caption="暦とホロスコープで、穴埋め">
    <Floor y={920} />
    {/* 作業机 */}
    <rect x={300} y={700} width={900} height={38} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
    <rect x={350} y={738} width={36} height={180} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    <rect x={1120} y={738} width={36} height={180} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    {/* 暦 (こよみのグリッド) */}
    <g transform={`translate(560 540) rotate(-4) scale(${pop(seg(f, 0, 16))})`}>
      <rect x={-170} y={-190} width={340} height={380} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-170} y={-190} width={340} height={70} rx={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
      <text x={0} y={-138} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44}
        fill={KRP.white}>暦</text>
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 4 }, (_, cc) => (
          <rect key={`${r}${cc}`} x={-146 + cc * 76} y={-94 + r * 86} width={64} height={72} rx={6}
            fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.8} />
        ))
      )}
    </g>
    <HoroscopePaper x={1000} y={520} s={0.78} f={f} rot={4} />
    <Kepler x={1530} y={915} s={1.15} f={f} face="smile" gaze={[-6, -2]} lean={-2} armL={-34} />
    {/* ペン (左手の書きもの) */}
    <g transform={`translate(${1402 + Math.sin(f / 8) * 7} 752) rotate(-40)`}>
      <rect x={-8} y={-70} width={16} height={86} rx={7} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <polygon points="0,30 -9,16 9,16" fill={KRP.ink} />
    </g>
  </Frame>
);

// ---- #65 用の小物 (天文学の記号 / 占星術の記号) ----
// 星図のパネル (枠つき。星がまたたく)
const StarChart: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-96} width={240} height={192} rx={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-104} y={-82} width={208} height={142} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4.5} />
    {[-52, 0, 52].map((gx) => (
      <line key={gx} x1={gx} y1={-82} x2={gx} y2={60} stroke={KRP.white} strokeWidth={2} opacity={0.28} />
    ))}
    {[-40, 8].map((gy) => (
      <line key={gy} x1={-104} y1={gy} x2={104} y2={gy} stroke={KRP.white} strokeWidth={2} opacity={0.28} />
    ))}
    <polyline points="-72,22 -38,-28 2,-6 40,-46 78,-14" fill="none"
      stroke={KRP.yellow} strokeWidth={3.5} opacity={0.85} />
    {[[-72, 22], [-38, -28], [2, -6], [40, -46], [78, -14], [-24, 44], [58, 36]].map(([px, py], i) => (
      <path key={i} d="M 0 -11 L 3.4 -3.4 L 11 0 L 3.4 3.4 L 0 11 L -3.4 3.4 L -11 0 L -3.4 -3.4 Z"
        fill={KRP.yellow} transform={`translate(${px} ${py})`}
        opacity={0.5 + 0.5 * Math.sin(f / 7 + i * 1.4)} />
    ))}
    <text x={0} y={86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
      fill={KRP.white}>星図</text>
  </g>
);

// コンパス (ディバイダ。少し開閉する)
const Dividers: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => {
  const a = 14 + Math.sin(f / 19) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-1, 1].map((m) => (
        <g key={m} transform={`rotate(${m * a})`}>
          <rect x={-5} y={-4} width={10} height={78} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
          <polygon points="0,90 -6,74 6,74" fill={KRP.ink} />
        </g>
      ))}
      <circle cx={0} cy={0} r={10} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

// 計算ノート (開いた帳面。数字は書かず線で表す)
const CalcNote: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -84 -34 Q -42 -48 0 -34 L 0 42 Q -42 28 -84 42 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 84 -34 Q 42 -48 0 -34 L 0 42 Q 42 28 84 42 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => (
      <g key={i} stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" opacity={0.75}>
        <line x1={-70} y1={-14 + i * 20} x2={-14} y2={-18 + i * 20} />
        <line x1={14} y1={-18 + i * 20} x2={i === 2 ? 36 : 70} y2={-14 + i * 20} />
      </g>
    ))}
  </g>
);

// からっぽのうつわ
const EmptyBowl: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -46 -24 Q -40 26 0 28 Q 40 26 46 -24 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={0} cy={-24} rx={46} ry={11} fill={KRP.paper} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// ホロスコープ盤 (壁にかけた丸い盤。ゆっくり回る)
const ZodiacDial: React.FC<{ x: number; y: number; r?: number; f?: number }> = ({ x, y, r = 104, f = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={0} y1={-r - 2} x2={0} y2={-r - 70} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={0} cy={-r - 76} r={9} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={0} cy={0} r={r} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6.5} />
    <g transform={`rotate(${f / 3.5})`}>
      <circle cx={0} cy={0} r={r * 0.6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <g key={i}>
            <line x1={Math.cos(a) * r * 0.6} y1={Math.sin(a) * r * 0.6}
              x2={Math.cos(a) * r} y2={Math.sin(a) * r} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M 0 -8 L 2.5 -2.5 L 8 0 L 2.5 2.5 L 0 8 L -2.5 2.5 L -8 0 L -2.5 -2.5 Z"
              fill={KRP.ink} opacity={0.7}
              transform={`translate(${Math.cos(a + 0.26) * r * 0.8} ${Math.sin(a + 0.26) * r * 0.8})`} />
          </g>
        );
      })}
      <path d="M 0 -34 L 10 -10 L 34 0 L 10 10 L 0 34 L -10 10 L -34 0 L -10 -10 Z"
        fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
    </g>
  </g>
);

// 運勢の紙 (客に渡すもの)
const FortunePaper: React.FC<{ x: number; y: number; s?: number; rot?: number; f?: number }> =
  ({ x, y, s = 1, rot = 0, f = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot + Math.sin(f / 11) * 2.4}) scale(${s})`}>
      <rect x={-58} y={-74} width={116} height={148} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-58} y={-74} width={116} height={40} rx={9} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
      <text x={0} y={-43} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28}
        fill={KRP.white}>運勢</text>
      <path d="M 0 -22 L 7 -6 L 24 0 L 7 6 L 0 22 L -7 6 L -24 0 L -7 -6 Z"
        fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
      {[0, 1].map((i) => (
        <line key={i} x1={-38} y1={40 + i * 20} x2={i ? 14 : 38} y2={40 + i * 20}
          stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      ))}
    </g>
  );

// コインのきんちゃく袋
const CoinBag: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -52 -6 Q -60 56 0 60 Q 60 56 52 -6 Q 30 -24 0 -24 Q -30 -24 -52 -6 Z"
      fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
    <path d="M -36 -12 Q 0 -34 36 -12" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    <circle cx={-16} cy={-30} r={15} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={16} cy={-36 + Math.sin(f / 13) * 2} r={15} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// #65 天文学の愚かな娘 (= たとえ話。母=天文学 / 娘=占星術)
const SceneOrokaMusume: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={349} caption="天文学を養っていたのは、占星術">
    <Floor y={930} />

    {/* 机は画面のまんなかに置く (作者の指示)。左に母、右に娘、その間に机。 */}
    <g>
      <rect x={805} y={735} width={310} height={26} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={825} y={761} width={22} height={139} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1073} y={761} width={22} height={139} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
    </g>
    <CalcNote x={880} y={700} s={0.82} rot={-3} />
    <Dividers x={992} y={648} s={0.82} f={f} />
    <EmptyBowl x={1068} y={708} s={0.82} />

    {/* ===== 左: 母 = 天文学 ===== */}
    <TagPlate x={520} y={332} text="母 ＝ 天文学" size={40} t={seg(f, 4, 20)} fill={KRP.blueSoft} />
    <TagPlate x={520} y={402} text="正確。でも、お金にならない" size={26} t={seg(f, 10, 26)} fill={KRP.white} />
    <StarChart x={210} y={560} s={1} f={f} />
    <Telescope x={170} y={890} s={0.6} />
    <Lady x={560} y={900} s={1.15} f={f} phase={1} face="worried" gaze={[7, 1]} gaunt
      cloth={KRP.blueDeep} skirt={KRP.blueSoft} armR={-62} armL={-6} />

    {/* ===== 右: 娘 = 占星術 ===== */}
    {/* (客の緑の人・きんちゃく袋は話に関係ないので置かない。
        稼ぎは「運勢の紙を売って、母に仕送りする」だけで通じる) */}
    <TagPlate x={1430} y={332} text="娘 ＝ 占星術" size={40} t={seg(f, 16, 32)} fill={KRP.yellow} />
    <TagPlate x={1430} y={402} text="いいかげん。でも、よく稼ぐ" size={26} t={seg(f, 22, 38)} fill={KRP.white} />
    <ZodiacDial x={1706} y={512} r={104} f={f} />
    <Lady x={1430} y={900} s={1.15} f={f} phase={4} face="smile" gaze={[-5, 1]}
      cloth={KRP.orange} skirt={KRP.yellow} armR={-52} armL={-66} />
    {/* 売り物の運勢の紙 (娘の手もとに重ねて置く) */}
    <FortunePaper x={1664} y={728} s={1} rot={9} f={f} />
    <FortunePaper x={1612} y={846} s={0.82} rot={-7} f={f} />

    {/* ===== 娘 → 母 へ、かせぎが渡る (まんなかの机を越えて飛ぶ) ===== */}
    {[0, 1, 2].map((i) => {
      const t = (f / 52 + i / 3) % 1;
      return (
        <CoinS key={`m${i}`} x={lerp(1290, 720, t)} y={lerp(745, 760, t) - Math.sin(t * Math.PI) * 170}
          s={0.95} o={t < 0.06 || t > 0.94 ? 0 : 1} />
      );
    })}
    <TagPlate x={1005} y={516} text="かせぎ" size={30} t={seg(f, 34, 50)} fill={KRP.gold} />
  </Frame>
);

// (追加) 母＝天文学 / 娘＝占星術 の言いかえ
const SceneHahaMusumeToha: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={352} caption="たとえの、言いかえ">
    <Floor y={900} />
    {/* 左: 母 ＝ 天文学 */}
    <rect x={120} y={300} width={700} height={520} rx={26}
      fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <Telescope x={330} y={700} s={0.9} />
    <StarChart x={640} y={520} s={0.78} f={f} />
    <TagPlate x={470} y={300} text="母" size={48} t={seg(f, 0, 14)} fill={KRP.blueSoft} />
    <TagPlate x={470} y={782} text="＝ 天文学" size={40} t={seg(f, 8, 24)} fill={KRP.blueDeep} color={KRP.white} />
    {/* 右: 娘 ＝ 占星術 */}
    <rect x={1100} y={300} width={700} height={520} rx={26}
      fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    <ZodiacDial x={1300} y={540} r={96} f={f} />
    <FortunePaper x={1618} y={626} s={0.95} rot={8} f={f} />
    <TagPlate x={1450} y={300} text="娘" size={48} t={seg(f, 16, 30)} fill={KRP.yellow} />
    <TagPlate x={1450} y={782} text="＝ 占星術" size={40} t={seg(f, 24, 40)} fill={KRP.orange} />
  </Frame>
);

// (追加) 計算するのが母・意味をつけて売るのが娘。当時は同じ人のひとつの仕事
const SceneHitotsuNoShigoto: React.FC<{ f: number }> = ({ f }) => {
  const j = easeOut(seg(f, 28, 54));
  return (
    <Frame f={f} seed={353}>
      <Floor y={828} />
      {/* 上段ひだり: 母のしごと */}
      <rect x={150} y={232} width={660} height={200} rx={22}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <Dividers x={310} y={348} s={0.95} f={f} />
      <CalcNote x={620} y={318} s={0.9} rot={-3} />
      <TagPlate x={480} y={232} text="母のしごと" size={34} t={seg(f, 0, 12)} fill={KRP.blueSoft} />
      <TagPlate x={480} y={414} text="星の動きを、計算する" size={32} t={seg(f, 6, 20)} fill={KRP.white} />
      {/* 上段みぎ: 娘のしごと */}
      <rect x={1110} y={232} width={660} height={200} rx={22}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <ZodiacDial x={1256} y={340} r={64} f={f} />
      <FortunePaper x={1570} y={344} s={0.68} rot={7} f={f} />
      <TagPlate x={1440} y={232} text="娘のしごと" size={34} t={seg(f, 14, 26)} fill={KRP.yellow} />
      <TagPlate x={1440} y={414} text="意味をつけて、売る" size={32} t={seg(f, 20, 34)} fill={KRP.white} />
      {/* ふたつの役わりが、ひとりに合流する */}
      <g opacity={j}>
        <path d="M 480 452 Q 480 560 846 596" fill="none" stroke={KRP.ink} strokeWidth={9}
          strokeLinecap="round" />
        <polygon points="878,600 826,578 832,618" fill={KRP.ink} />
        <path d="M 1440 452 Q 1440 560 1074 596" fill="none" stroke={KRP.ink} strokeWidth={9}
          strokeLinecap="round" />
        <polygon points="1042,600 1094,578 1088,618" fill={KRP.ink} />
      </g>
      <Kepler x={960} y={822} s={0.88} f={f} face="normal" gaze={[0, 1]} armR={-28} armL={-28} />
      <TagPlate x={960} y={486} text="どちらも、同じ人の仕事" size={36} t={seg(f, 40, 58)} fill={KRP.gold} />
    </Frame>
  );
};

// #66 著書に残る正直すぎる本音
const SceneHonneBook: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={350} caption="著書に残る、正直な本音 (大意)">
    <Floor y={920} />
    {/* 開いた著書 (作者の指示でまんなかに置く。人とふきだしは左右に振り分ける) */}
    <g transform="translate(960 690)">
      <path d="M -320 -130 Q -160 -172 0 -130 L 0 130 Q -160 88 -320 130 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
      <path d="M 320 -130 Q 160 -172 0 -130 L 0 130 Q 160 88 320 130 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={-270} y1={-62 + i * 50} x2={-60} y2={-72 + i * 50}
            stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
          <line x1={60} y1={-72 + i * 50} x2={i === 3 ? 150 : 270} y2={-62 + i * 50}
            stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
        </g>
      ))}
      {/* 本音の行の囲み */}
      <ellipse cx={165} cy={-42} rx={125} ry={36} fill="none" stroke={KRP.red} strokeWidth={5}
        opacity={pop(seg(f, 14, 30))} />
    </g>
    {/* 本から立ちのぼる本音のふきだし */}
    <Bubble x={1540} y={338} w={420} h={140} tailTo={[1140, 614]} text="娘が稼がねば…" size={44}
      t={seg(f, 22, 40)} color={KRP.red} />
    <Kepler x={352} y={915} s={1.1} f={f} face="normal" gaze={[6, 0]} lean={2} armR={-30} />
  </Frame>
);

// #67 親子は別々の道へ (分かれ道)
const SceneWakareMichi: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 10, 80));
  return (
    <Frame f={f} seed={351} caption="天文学と占星術、別々の道へ">
      {/* 分かれ道 */}
      <path d="M 960 1020 Q 940 820 920 700 Q 760 520 380 420" fill="none"
        stroke={KRP.floor} strokeWidth={62} strokeLinecap="round" />
      <path d="M 960 1020 Q 980 820 1000 700 Q 1160 520 1540 420" fill="none"
        stroke={KRP.floor} strokeWidth={62} strokeLinecap="round" />
      <path d="M 960 1020 Q 940 820 920 700 Q 760 520 380 420" fill="none"
        stroke={KRP.ink} strokeWidth={4.5} strokeDasharray="22 20" opacity={0.5} />
      <path d="M 960 1020 Q 980 820 1000 700 Q 1160 520 1540 420" fill="none"
        stroke={KRP.ink} strokeWidth={4.5} strokeDasharray="22 20" opacity={0.5} />
      {/* 道しるべ */}
      <g transform="translate(960 640)">
        <rect x={-12} y={-130} width={24} height={240} rx={8} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
        <g transform="translate(-118 -150)">
          <polygon points="-110,-28 86,-28 120,0 86,28 -110,28" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5}
            transform="scale(-1 1)" />
          <text x={-10} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
            fill={KRP.ink}>天文学</text>
        </g>
        <g transform="translate(118 -62)">
          <polygon points="-110,-28 86,-28 120,0 86,28 -110,28" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          <text x={-10} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34}
            fill={KRP.ink}>占星術</text>
        </g>
      </g>
      {/* 左へ行く母 (天文学) と右へ行く娘 (占星術) */}
      <Lady x={lerp(840, 520, walk)} y={lerp(900, 570, walk)} s={lerp(1.0, 0.72, walk)} f={f} phase={1}
        face="normal" gaze={[-6, 0]} gaunt cloth={KRP.blueDeep} skirt={KRP.blueSoft} />
      <Lady x={lerp(1080, 1400, walk)} y={lerp(900, 570, walk)} s={lerp(1.0, 0.72, walk)} f={f} phase={4}
        face="smile" gaze={[6, 0]} cloth={KRP.orange} skirt={KRP.yellow} />
    </Frame>
  );
};

// #68 初めての「乗り換え」が始まる瞬間 (ずっと一本道だった線に、はじめて分岐が生える)
const SceneNorikaeHajimari: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(seg(f, 32, 80)); // 分かれ道の線が伸びる
  const sign = seg(f, 58, 76); // 「のりかえ」の看板
  // 分岐の二次曲線 P0(960,600) - P1(1360,600) - P2(1720,408) を grow の分だけ描く
  const t = Math.max(grow, 0.001);
  const q0x = lerp(960, 1360, t), q0y = lerp(600, 600, t);
  const q1x = lerp(1360, 1720, t), q1y = lerp(600, 408, t);
  const ex = lerp(q0x, q1x, t), ey = lerp(q0y, q1y, t);
  const ang = (Math.atan2(ey - q0y, ex - q0x) * 180) / Math.PI;
  const ring = 44 + ((f % 48) / 48) * 42; // 乗り換え地点の呼び出しリング
  return (
    <Frame f={f} seed={357} caption="歴史ではじめての、乗り換え">
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={KRP.blueSoft} opacity={0.18} />
      {/* ずっと歩いてきた一本道 (左端から駅まで) */}
      <line x1={-20} y1={600} x2={960} y2={600} stroke={KRP.ink} strokeWidth={16} strokeLinecap="round" />
      <line x1={-20} y1={600} x2={960} y2={600} stroke={KRP.blueDeep} strokeWidth={9} strokeLinecap="round" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={-6 + i * 86} y1={582} x2={-6 + i * 86} y2={618}
          stroke={KRP.ink} strokeWidth={4} opacity={0.22} />
      ))}
      {/* 一本道を歩いてきた人たち */}
      {[0, 1, 2].map((i) => {
        const wx = 60 + ((f * 1.5 + i * 266) % 798);
        return (
          <g key={i} transform={`translate(${wx} 584) scale(0.38)`}>
            <AncientPerson x={0} y={0} s={1} role={i === 1 ? "priest" : "pilgrim"} f={f} phase={i * 3}
              face="normal" gaze={[6, 0]} />
          </g>
        );
      })}
      <TagPlate x={330} y={790} text="ずっと、この一本道" size={32} t={seg(f, 0, 16)} fill={KRP.blueSoft} />

      {/* はじめて生える分岐 (点線 = 行き先はまだ分からない) */}
      <path d={`M 960 600 Q ${q0x} ${q0y} ${ex} ${ey}`} fill="none" stroke={KRP.ink}
        strokeWidth={15} strokeLinecap="round" strokeDasharray="26 22" opacity={0.9} />
      <path d={`M 960 600 Q ${q0x} ${q0y} ${ex} ${ey}`} fill="none" stroke={KRP.orange}
        strokeWidth={8} strokeLinecap="round" strokeDasharray="26 22" />
      <g transform={`translate(${ex} ${ey}) rotate(${ang})`} opacity={grow > 0.08 ? 1 : 0}>
        <polygon points="40,0 -14,-30 -14,30" fill={KRP.orange} stroke={KRP.ink} strokeWidth={5}
          strokeLinejoin="round" />
      </g>
      {/* 行き先はまだ「?」 */}
      <g opacity={pop(seg(f, 76, 94))}>
        <circle cx={1790} cy={330} r={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={6}
          strokeDasharray="16 13" />
        <text x={1790} y={352} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62}
          fill={KRP.ink}>?</text>
      </g>

      {/* 乗り換え地点の呼び出しリング */}
      <circle cx={960} cy={600} r={ring} fill="none" stroke={KRP.orange} strokeWidth={6}
        opacity={0.55 * (1 - ((f % 48) / 48))} />
      {/* 路線図 1駅目 (神様) を中央に: 共通部品を流用 */}
      <RouteMap x={1554} y={600} s={1.1} f={f} count={1} />
      {/* のりかえの看板 */}
      <TagPlate x={1258} y={476} text="のりかえ" size={42} t={sign} fill={KRP.orange} />
      <TagPlate x={1370} y={812} text="ここで、はじめて分かれる" size={30} t={seg(f, 70, 88)} fill={KRP.yellow} />
    </Frame>
  );
};

// #69 初めての乗り換え: 神様から体へ (路線図2駅)
const SceneRouteKarada: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={352} caption="初めての乗り換え: 神様から、体へ">
    {/* 乗り換え路線図: 2駅目が生える (共通部品) */}
    <RouteMap x={1320} y={620} s={1.25} f={f} count={2} />
    {/* 字幕帯 (y>900) に隠れないよう y=820 (実映像検品で発見) */}
    <TagPlate x={960} y={820} text="聞く相手が、変わりはじめる" size={36} t={seg(f, 60, 76)} fill={KRP.yellow} />
  </Frame>
);

// ===== motif名 → シーンの対応表 =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  // 導入
  w1_shindan_start: (f) => <SceneShindanStart f={f} />,
  w1_unun: (f) => <SceneUnun f={f} />,
  w1_mieta: (f) => <SceneMieta f={f} />,
  w1_shindan_paper: (f) => <SceneShindanPaper f={f} />,
  w1_jibun_pace: (f) => <SceneJibunPace f={f} />,
  w1_atari_check: (f) => <SceneAtariCheck f={f} />,
  w1_tane_yokoku: (f) => <SceneTaneYokoku f={f} />,
  w1_uranai_zukushi: (f) => <SceneUranaiZukushi f={f} />,
  w1_anata_label: (f) => <SceneAnataLabel f={f} />,
  w1_toi_timeline: (f) => <SceneToiTimeline f={f} />,
  w1_hone_smartphone: (f) => <SceneHoneSmartphone f={f} />,
  w1_yottsu_tools: (f) => <SceneYottsuTools f={f} />,
  // 第1章
  w1_ch1_door: (f) => <SceneCh1Door f={f} />,
  w1_in_dynasty: (f) => <SceneInDynasty f={f} />,
  w1_king_many_q: (f) => <SceneKingManyQ f={f} />,
  w1_king_questions: (f) => <SceneKingQuestions f={f} />,
  w1_no_yohoshi: (f) => <SceneNoYohoshi f={f} />,
  w1_kame_ushi: (f) => <SceneKameUshi f={f} />,
  w1_bone_burn: (f) => <SceneBoneBurn f={f} />,
  w1_pishi: (f) => <ScenePishi f={f} />,
  w1_king_judge: (f) => <SceneKingJudge f={f} />,
  w1_bone_carve: (f) => <SceneBoneCarve f={f} />,
  w1_koukotsu_moji: (f) => <SceneKoukotsuMoji f={f} />,
  w1_mesopotamia: (f) => <SceneMesopotamia f={f} />,
  w1_tentai_uranai: (f) => <SceneTentaiUranai f={f} />,
  w1_king_only: (f) => <SceneKingOnly f={f} />,
  w1_bc410: (f) => <SceneBc410 f={f} />,
  w1_king_tokken: (f) => <SceneKingTokken f={f} />,
  // 第2章
  w1_ch2_door: (f) => <SceneCh2Door f={f} />,
  w1_rome: (f) => <SceneRome f={f} />,
  w1_tetsuzuki: (f) => <SceneTetsuzuki f={f} />,
  w1_augur: (f) => <SceneAugur f={f} />,
  w1_kessai: (f) => <SceneKessai f={f} />,
  w1_kessai_girei: (f) => <SceneKessaiGirei f={f} />,
  w1_kessai_shoryaku: (f) => <SceneKessaiShoryaku f={f} />,
  w1_enki: (f) => <SceneEnki f={f} />,
  w1_general_chicken: (f) => <SceneGeneralChicken f={f} />,
  w1_kitcho_kyocho: (f) => <SceneKitchoKyocho f={f} />,
  w1_tabemasen: (f) => <SceneTabemasen f={f} />,
  w1_nomeba_ii: (f) => <SceneNomebaIi f={f} />,
  w1_pochan: (f) => <ScenePochan f={f} />,
  w1_taihai: (f) => <SceneTaihai f={f} />,
  w1_onmyoryo_tatemono: (f) => <SceneOnmyoryoTatemono f={f} />,
  w1_onmyoryo: (f) => <SceneOnmyoryo f={f} />,
  w1_seimei: (f) => <SceneSeimei f={f} />,
  w1_seimei_career: (f) => <SceneSeimeiCareer f={f} />,
  w1_osozaki: (f) => <SceneOsozaki f={f} />,
  w1_shikigami_densetsu: (f) => <SceneShikigami f={f} />,
  w1_matome_sengen: (f) => <SceneMatomeSengen f={f} />,
  w1_matome_three: (f) => <SceneMatomeThree f={f} />,
  w1_route_kami: (f) => <SceneRouteKami f={f} />,
  w1_haruka_ue: (f) => <SceneHarukaUe f={f} />,
  // 第3章
  w1_ch3_door: (f) => <SceneCh3Door f={f} />,
  w1_kepler_telescope: (f) => <SceneKeplerTelescope f={f} />,
  w1_wakusei_housoku: (f) => <SceneWakuseiHousoku f={f} />,
  w1_uranai_shunyu: (f) => <SceneUranaiShunyu f={f} />,
  w1_kyuryo_chihai: (f) => <SceneKyuryoChihai f={f} />,
  w1_koyomi_shigoto: (f) => <SceneKoyomiShigoto f={f} />,
  w1_oroka_musume: (f) => <SceneOrokaMusume f={f} />,
  w1_honne_book: (f) => <SceneHonneBook f={f} />,
  w1_haha_musume_toha: (f) => <SceneHahaMusumeToha f={f} />,
  w1_hitotsu_no_shigoto: (f) => <SceneHitotsuNoShigoto f={f} />,
  w1_wakare_michi: (f) => <SceneWakareMichi f={f} />,
  w1_norikae_hajimari: (f) => <SceneNorikaeHajimari f={f} />,
  w1_route_karada: (f) => <SceneRouteKarada f={f} />,
};

// motif を知っていれば描く / 知らなければ null (マスター出口が次のファイルに回す)
export const watashiB1Scene = (motif: string, f: number): React.ReactElement | null => {
  const S = SCENES[motif];
  return S ? S(f) : null;
};

// 文#1〜#69 に1対1で対応する motif 名の列 (長さは必ず69。再利用は同じ名前を繰り返す)
export const W_B1_MOTIFS: string[] = [
  // 導入 (#1〜#15)
  "w1_shindan_start", // #1 いきなりですが診断します
  "w1_unun", // #2 うーん……
  "w1_mieta", // #3 ……はあっ!
  "w1_mieta", // #4 見えました
  "w1_shindan_paper", // #5 しっかりしている/心配性
  "w1_jibun_pace", // #6 人に合わせるのは得意だが自分のペースを乱されたくない
  "w1_atari_check", // #7 ちょっと当たっていませんか?
  "w1_atari_check", // #8 その感覚、覚えておいて
  "w1_tane_yokoku", // #9 最後にタネを明かします
  "w1_uranai_zukushi", // #10 星座・血液型・4文字
  // (旧) "w1_anata_label" 「あなたはこういう人」の文は台本ごとカットした (作者の指示)。
  //      絵 (SceneAnataLabel) は残してあるが、どの文にも割り当てていないので出番はない。
  "w1_toi_timeline", // #11 問いは約4000年続く
  "w1_hone_smartphone", // #13 最初の診断ツールは骨
  "w1_yottsu_tools", // #14 骨→頭→インク→4文字
  "w1_toi_timeline", // #15 さかのぼってみましょう
  // 第1章 (#16〜#33)
  "w1_ch1_door", // #16 章扉
  "w1_in_dynasty", // #17 約3300年前の殷
  "w1_king_many_q", // 文#17 知りたいことが山ほど (「?」を山積みにする絵)
  "w1_king_questions", // 文#18 雨・作物・戦
  "w1_no_yohoshi", // #20 気象予報士も新聞もない
  "w1_kame_ushi", // #21 亀の甲羅と牛の骨
  "w1_bone_burn", // #22 熱した棒を押し当てる
  "w1_pishi", // #23 ピシッ
  "w1_king_judge", // #24 最終判断は王さま
  "w1_king_judge", // #25 国の一大事が骨のヒビで
  "w1_bone_carve", // #26 結果を骨に刻む
  "w1_koukotsu_moji", // #27 これが甲骨文字
  "w1_koukotsu_moji", // #28 漢字の最古の記録は占いのメモ
  "w1_mesopotamia", // 文#28 メソポタミアで空を見上げる
  "w1_tentai_uranai", // 文#29 星や月の動きから国の吉凶を読み取る
  "w1_king_only", // #31 占えるのは王さまと国家だけ
  "w1_bc410", // 文#31 紀元前410年のホロスコープ
  "w1_king_tokken", // 文#32 「私は何者?」を問えるのは王さまの特権
  // 第2章 (#34〜#58)
  "w1_ch2_door", // #34 章扉
  "w1_rome", // #35 古代ローマ
  "w1_tetsuzuki", // #36 国家の正式な手続き
  "w1_augur", // #37 アウグルが鳥を観察
  "w1_kessai", // #38 神々が認めるか確かめる
  "w1_kessai_girei", // #39 神様の決裁をもらう儀式
  "w1_enki", // #40 凶兆なら戦争も延期
  "w1_general_chicken", // #41 手続きを省略した男
  "w1_general_chicken", // #42 将軍が鶏をうかがう
  "w1_kitcho_kyocho", // #43 食べれば吉・食べねば凶
  "w1_tabemasen", // #44 鶏は食べませんでした
  "w1_nomeba_ii", // #45 「食べないなら、飲めばいい」
  "w1_pochan", // #46 海に投げ込んだと伝えられる
  "w1_taihai", // #47 歴史的大敗
  "w1_kessai_shoryaku", // #48 決裁は省略しないほうが
  "w1_onmyoryo_tatemono", // #48 日本でも占いはお役所 (建物を引きで)
  "w1_onmyoryo", // #49 陰陽寮に勤める役人 (建物に寄る)
  "w1_seimei", // #51 安倍晴明も実在
  "w1_seimei_career", // #52 天文博士を歴任したエリート
  "w1_osozaki", // #53 遅咲きの苦労人
  "w1_shikigami_densetsu", // #54 式神の話は後世の伝説
  "w1_matome_sengen", // #55 ざっくりまとめ
  "w1_matome_three", // #56 聞く相手はずっとひとつ
  "w1_route_kami", // #57 神様です
  "w1_haruka_ue", // #58 答えははるか上に
  // 第3章 (#59〜#69)
  "w1_ch3_door", // #59 章扉
  "w1_kepler_telescope", // #60 ケプラーという天文学者
  "w1_wakusei_housoku", // #61 惑星の法則の大スター
  "w1_uranai_shunyu", // #62 収入源は占い
  "w1_kyuryo_chihai", // #63 給料の遅配が日常茶飯事
  "w1_koyomi_shigoto", // #64 暦とホロスコープで家計の穴埋め
  "w1_oroka_musume", // #65 天文学の愚かな娘
  "w1_honne_book", // #66 著書に残る正直な本音
  "w1_haha_musume_toha", // #67 母＝天文学、娘＝占星術 (補足)
  "w1_hitotsu_no_shigoto", // #68 計算するのが母・意味をつけて売るのが娘 (補足)
  "w1_wakare_michi", // #69 親子は別々の道へ
  "w1_norikae_hajimari", // #70 初めての乗り換え
  "w1_route_karada", // #71 神様から人間の体へ
];

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=60 の瞬間を描く) =====
export const W_B1_PREVIEW_FRAMES = Math.max(W_B1_MOTIFS.length, 1);
export const WatashiB1Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, Math.max(W_B1_MOTIFS.length - 1, 0));
  const motif = W_B1_MOTIFS[i];
  if (!motif) return <AbsoluteFill style={{ background: KRP.cream }} />;
  return (
    <AbsoluteFill style={{ background: KRP.cream }}>
      {watashiB1Scene(motif, 60)}
      <LabelPill x={24} y={16} text={`#${i + 1} ${motif}`} size={26} />
    </AbsoluteFill>
  );
};
