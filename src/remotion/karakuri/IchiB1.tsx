// 「『2位』は、120年前に発明された」: 第1章「獲物を、けなす。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の 22〜36行目 (文#21〜#35・15文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで15枚。
// motif 名は必ず ib1_ で始める。WobbleDefs の seed はこのファイルでは 920〜934 を使う。
// 設計書: docs/briefs/IchiB1.md (1文ごとの「格」と絵の中身が決まっている)
//
// ★絵の「格」(制作ガイド §7 第3層)
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = クリーム地に図と札だけ。人も背景も置かない (25〜50行)
//   ★「図」「並」も品質は落とさない。短いのは賑やかさを削ったからで、雑に描いたからではない。
//     線・色・札・フォントは山と完全に同じ。必ず f で動く。図そのものを作り込む。
//     大きく置いて画面を使い切る (「小さい物を真ん中にポツンと」が最悪の失敗)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。
//   seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間を写すため)。
//
// ★#31 と #32 は「同じストレスホルモン棒グラフ」を2文で使う。複製禁止。
//   1つのコンポーネントに phase?: 1 | 2 の prop を持たせて切り替える
//   (watashi回の教訓: 1つの絵を2文で使うときは複製せず prop で動きを分ける)。

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow,
} from "./IchiShared";
import { lerp } from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (第1章 = カラハリ砂漠の狩猟採集民 + ヒヒの岩山)
// ===================================================================
const C = {
  duskOrange: "#D08A4E",  // カラハリの夕焼け
  duskDeep: "#A65F33",
  sand: "#D6C49A",        // 砂地
  sandDark: "#B39E72",
  fire: "#C94F2E",        // たき火
  fireGlow: "#E8A24A",
  bush: "#8A8A54",        // 低木の緑茶
  rockGray: "#8E8678",    // ヒヒの岩山
  rockDark: "#6B6355",
  baboon: "#7A6A52",      // ヒヒの毛色
  baboonDark: "#55483A",
  meat: "#B9674A",        // 獲物
  graphRed: "#C0483A",    // ストレス値のグラフ
  graphBlue: "#4A6E8A",
  sun: "#F2B04E",         // 夕日の球
  treeDark: "#4A3A2A",    // アカシア・遠景シルエット
  wood: "#7A5A3A",        // たき火のまき
  thatch: "#C2A864",      // 草ぶきシェルター
  meatLight: "#D8936E",   // 獲物の腹の明るい毛
  skin: "#C98A5E",        // 人の肌 (座る人)
  baboonFace: "#C9A98A",  // ヒヒの口吻
  night: "#2A3450",       // 夜の俯瞰 (#34/#35) の青
  nightDeep: "#1E2740",   // 夜の外周
  ochre: "#A8502E",       // 洞窟壁画の赤土 (#29)
};
void Stamp; void XMark;

// ===================================================================
// この章だけのローカル部品 (絵師が書く。例: ヒヒ・たき火・獲物)
// ===================================================================

// ---- アカシアの木 (カラハリの象徴。#21/#23/#33) ----
const Acacia: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({
  x, y, s = 1, color = C.treeDark,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 幹: 根元から二股に裂けて傘を支える */}
    <path d="M -10 0 L -20 -110 L -58 -188 M -10 0 L 14 -120 L 60 -194 M 0 -64 L -34 -168"
      fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
    {/* 傘形の平たい樹冠 */}
    <path d="M -180 -188 Q -100 -252 0 -254 Q 100 -252 180 -184 Q 92 -210 0 -208 Q -92 -210 -180 -188 Z"
      fill={color} stroke={color} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

// ---- たき火 (#21/#23/#27)。炎が f で揺れ、火の粉が舞う ----
const Campfire: React.FC<{ x: number; y: number; s?: number; f: number; smoke?: boolean }> = ({
  x, y, s = 1, f, smoke,
}) => {
  const sway = Math.sin(f / 6) * 6;
  const lick = 1 + Math.sin(f / 4) * 0.08;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 砂への照り返し */}
      <ellipse cx={0} cy={8} rx={130} ry={26} fill={C.fireGlow} opacity={0.3 + Math.sin(f / 5) * 0.08} />
      {/* まき (交差した2本) */}
      <g fill={C.wood} stroke={KRP.ink} strokeWidth={4.5}>
        <rect x={-66} y={-8} width={132} height={16} rx={8} transform="rotate(9)" />
        <rect x={-66} y={-8} width={132} height={16} rx={8} transform="rotate(-11)" />
      </g>
      {/* 炎 (外・中・芯の3層) */}
      <g transform={`translate(${sway * 0.4} 0) scale(1 ${lick})`}>
        <path d={`M 0 -112 Q ${26 + sway} -64 30 -34 Q 34 -8 0 -2 Q -34 -8 -30 -34 Q ${-24 + sway} -62 0 -112 Z`}
          fill={C.fire} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={`M 0 -76 Q ${16 + sway * 0.6} -46 18 -26 Q 20 -8 0 -4 Q -20 -8 -18 -26 Q ${-14 + sway * 0.6} -44 0 -76 Z`}
          fill={C.fireGlow} />
        <path d="M 0 -46 Q 9 -28 10 -18 Q 10 -7 0 -5 Q -10 -7 -10 -18 Q -9 -28 0 -46 Z" fill={KRP.yellow} />
      </g>
      {/* 火の粉 (上へ流れて消える) */}
      {[0, 1, 2].map((i) => {
        const p = ((f * 2 + i * 33) % 90) / 90;
        return (
          <circle key={i} cx={Math.sin(f / 7 + i * 2.1) * 26} cy={-104 - p * 90}
            r={Math.max(0.5, 4 - p * 2.5)} fill={C.fireGlow} opacity={1 - p} />
        );
      })}
      {smoke && (
        <g fill="none" strokeLinecap="round">
          <path d={`M 0 -120 Q ${20 + sway} -180 ${-10 + sway} -240 Q ${-40 + sway} -300 ${10 + sway * 1.5} -360`}
            stroke={KRP.gray} strokeWidth={30} opacity={0.75} />
          <path d={`M 2 -140 Q ${16 + sway} -190 ${-6 + sway} -250 Q ${-30 + sway} -304 ${12 + sway * 1.5} -352`}
            stroke={KRP.white} strokeWidth={12} opacity={0.5} />
        </g>
      )}
    </g>
  );
};

// ---- 草ぶきのシェルター (#23/#24) ----
const Shelter: React.FC<{ x: number; y: number; s?: number; shadow?: boolean }> = ({
  x, y, s = 1, shadow,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={shadow ? 0.55 : 1}>
    <path d="M -130 0 Q -130 -150 0 -158 Q 130 -150 130 0 Z"
      fill={C.thatch} stroke={KRP.ink} strokeWidth={5} />
    {/* 草の葺き目 */}
    <g stroke={KRP.ink} strokeWidth={3} opacity={0.4} fill="none">
      <path d="M -106 -34 Q 0 -70 106 -34" />
      <path d="M -88 -78 Q 0 -112 88 -78" />
      <path d="M -56 -118 Q 0 -140 56 -118" />
    </g>
    {/* 入口 */}
    <path d="M -34 0 Q -34 -74 0 -78 Q 34 -74 34 0 Z"
      fill={C.treeDark} stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// ---- 炎のアイコン (勝ちたい気持ちの記号。#29/#33/#34/#35) ----
const FlameIcon: React.FC<{ x: number; y: number; s?: number; t?: number; f: number }> = ({
  x, y, s = 1, t = 1, f,
}) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  const sway = Math.sin(f / 5) * 4;
  const lick = 1 + Math.sin(f / 4 + 1) * 0.07;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <g transform={`scale(1 ${lick})`}>
        <path d={`M 0 -110 C ${18 + sway} -78 34 -56 34 -30 C 34 -6 18 6 0 6 C -18 6 -34 -6 -34 -30 C -34 -56 ${-18 + sway} -78 0 -110 Z`}
          fill={C.fire} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={`M 0 -70 C ${10 + sway * 0.5} -48 20 -36 20 -20 C 20 -4 10 2 0 2 C -10 2 -20 -4 -20 -20 C -20 -36 ${-10 + sway * 0.5} -48 0 -70 Z`}
          fill={C.fireGlow} />
        <path d="M 0 -38 C 6 -26 10 -20 10 -12 C 10 -3 5 0 0 0 C -5 0 -10 -3 -10 -12 C -10 -20 -6 -26 0 -38 Z"
          fill={KRP.yellow} />
      </g>
    </g>
  );
};

// ---- 骨だけのガリガリ魚 (「けなし」の記号。#25/#34) ----
const BoneFish: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({
  x, y, s = 1, t = 1,
}) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}
      stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round">
      {/* 頭 */}
      <path d="M -70 0 Q -52 -26 -22 -28 L -16 0 L -22 26 Q -52 24 -70 0 Z" fill={KRP.white} />
      <circle cx={-48} cy={-7} r={4} fill={KRP.ink} stroke="none" />
      {/* 背骨とあばら */}
      <line x1={-16} y1={0} x2={52} y2={0} />
      {[-2, 14, 30].map((rx) => (
        <g key={rx}>
          <line x1={rx} y1={0} x2={rx + 6} y2={-18} />
          <line x1={rx} y1={0} x2={rx + 6} y2={18} />
        </g>
      ))}
      {/* 尾びれ */}
      <path d="M 52 0 L 76 -20 L 70 0 L 76 20 Z" fill={KRP.white} />
    </g>
  );
};

// ---- 座る人 (たき火を囲む人々。#23) 。dir=1 で右向き ----
const Sitter: React.FC<{
  x: number; y: number; s?: number; dir?: 1 | -1; cloth?: string;
  f?: number; phase?: number; armUp?: boolean;
}> = ({ x, y, s = 1, dir = 1, cloth = "#8A5A3E", f = 0, phase = 0, armUp }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 2.5;
  const wave = Math.sin(f / 8) * 14;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s * dir} ${s})`}>
      {/* 曲げたひざと脚 */}
      <path d="M -16 -50 L 42 -56 L 58 0" fill="none" stroke={cloth} strokeWidth={17} strokeLinecap="round" />
      <ellipse cx={60} cy={-2} rx={14} ry={7} fill={KRP.ink} />
      {/* 胴体 (少し前かがみ) */}
      <rect x={-50} y={-128} width={58} height={88} rx={26} fill={cloth}
        stroke={KRP.ink} strokeWidth={4.5} transform="rotate(8 -21 -84)" />
      {/* 腕 */}
      {armUp ? (
        <g transform={`rotate(${-62 + wave} -20 -104)`}>
          {/* 夜の背景でも腕が読めるように墨の縁取りを下に敷く */}
          <line x1={-20} y1={-104} x2={44} y2={-70} stroke={KRP.ink} strokeWidth={18} strokeLinecap="round" />
          <line x1={-20} y1={-104} x2={44} y2={-70} stroke={C.skin} strokeWidth={12} strokeLinecap="round" />
          <circle cx={48} cy={-68} r={11} fill={C.skin} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ) : (
        <line x1={-20} y1={-104} x2={34} y2={-60} stroke={C.skin} strokeWidth={13} strokeLinecap="round" />
      )}
      {/* 頭 */}
      <circle cx={-12} cy={-156} r={29} fill={C.skin} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -40 -164 Q -40 -188 -12 -188 Q 16 -188 16 -164 Q -12 -176 -40 -164 Z" fill={KRP.ink} />
      <circle cx={2} cy={-158} r={3.5} fill={KRP.ink} />
    </g>
  );
};

// ---- レイヨウ (獲物。#24/#25/#26/#27)。dir=1 で右向き・足元が y=0 ----
const Antelope: React.FC<{
  x: number; y: number; s?: number; dir?: 1 | -1;
  pose?: "stand" | "lie" | "drape";
  skinny?: boolean; silhouette?: boolean; f?: number;
}> = ({ x, y, s = 1, dir = 1, pose = "stand", skinny, silhouette, f = 0 }) => {
  const body = silhouette ? KRP.ink : C.meat;
  const belly = silhouette ? KRP.ink : C.meatLight;
  const sw = silhouette ? 0 : 5;
  const breathe = 1 + Math.sin(f / 10) * 0.015;
  const horn = (mx: number) => (
    <g key={mx} fill="none" stroke={silhouette ? KRP.ink : C.treeDark}
      strokeWidth={7 - Math.abs(mx) * 2} strokeLinecap="round" transform={`translate(${mx} 0)`}>
      <path d="M 104 -256 C 96 -298 114 -330 142 -340" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      {pose === "stand" && (
        <g>
          {/* 細い4本脚 */}
          <g stroke={body} strokeWidth={13} strokeLinecap="round">
            <line x1={-74} y1={-90} x2={-82} y2={0} />
            <line x1={-40} y1={-92} x2={-36} y2={0} />
            <line x1={44} y1={-96} x2={40} y2={0} />
            <line x1={74} y1={-92} x2={84} y2={0} />
          </g>
          {/* 胴体 (skinny なら薄くあばらが出る) */}
          <ellipse cx={0} cy={-128} rx={skinny ? 82 : 112} ry={(skinny ? 38 : 64) * breathe}
            fill={body} stroke={KRP.ink} strokeWidth={sw} />
          {!skinny && <ellipse cx={-6} cy={-104} rx={86} ry={34} fill={belly} opacity={silhouette ? 1 : 0.9} />}
          {skinny && !silhouette && (
            <g fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.55}>
              <path d="M -30 -150 Q -38 -126 -30 -102" />
              <path d="M -6 -152 Q -14 -126 -6 -100" />
              <path d="M 18 -150 Q 10 -126 18 -102" />
            </g>
          )}
          {/* 首と頭 */}
          <path d={skinny ? "M 54 -140 L 92 -196 L 118 -190 L 86 -120 Z" : "M 58 -156 L 96 -234 L 126 -226 L 94 -132 Z"}
            fill={body} stroke={KRP.ink} strokeWidth={sw} />
          <g transform={skinny ? "translate(-6 56) rotate(14 104 -244)" : ""}>
            <ellipse cx={108} cy={-244} rx={30} ry={21} fill={body} stroke={KRP.ink} strokeWidth={sw} />
            <ellipse cx={132} cy={-238} rx={13} ry={9} fill={belly} stroke={KRP.ink} strokeWidth={silhouette ? 0 : 3.5} />
            {!silhouette && <circle cx={108} cy={-248} r={4.5} fill={KRP.ink} />}
            <path d="M 88 -260 Q 76 -276 90 -278 Q 100 -278 98 -264 Z"
              fill={body} stroke={KRP.ink} strokeWidth={silhouette ? 0 : 3.5} />
            {[0, 1].map((i) => horn(i * 6 - 3))}
          </g>
          {/* しっぽ */}
          <path d="M -106 -140 Q -126 -132 -122 -112" fill="none"
            stroke={silhouette ? KRP.ink : C.treeDark} strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
      {pose === "lie" && (
        <g>
          {/* 地面に伏せた胴体 */}
          <ellipse cx={0} cy={-56} rx={126} ry={52 * breathe} fill={body} stroke={KRP.ink} strokeWidth={sw} />
          <ellipse cx={-8} cy={-36} rx={96} ry={24} fill={belly} opacity={0.9} />
          {/* 折りたたんだ脚 */}
          <path d="M -60 -16 L -20 -24 L 16 -12 M 30 -16 L 66 -24 L 96 -10"
            fill="none" stroke={C.treeDark} strokeWidth={10} strokeLinecap="round" />
          {/* 地面に預けた頭 (目は閉じ線) */}
          <path d="M 96 -72 L 128 -40 L 150 -16 L 108 -10 Z" fill={body} stroke={KRP.ink} strokeWidth={sw} />
          <ellipse cx={136} cy={-20} rx={30} ry={20} fill={body} stroke={KRP.ink} strokeWidth={sw} />
          <ellipse cx={160} cy={-14} rx={12} ry={8} fill={belly} stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M 130 -26 Q 138 -22 146 -26" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M 122 -38 C 116 -78 132 -106 158 -116 M 128 -36 C 124 -74 140 -100 164 -108"
            fill="none" stroke={C.treeDark} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
      {pose === "drape" && (
        <g transform={`rotate(${-6 + Math.sin(f / 11) * 1.5})`}>
          {/* 肩に担がれた胴体。脚は手前に垂れ、頭は後ろへ垂れる */}
          <g stroke={body} strokeWidth={13} strokeLinecap="round"
            transform={`rotate(${Math.sin(f / 9) * 3} -90 20)`}>
            <line x1={-118} y1={10} x2={-124} y2={96} />
            <line x1={-88} y1={16} x2={-90} y2={104} />
            <line x1={-60} y1={16} x2={-58} y2={100} />
          </g>
          <ellipse cx={0} cy={0} rx={152} ry={56} fill={body} stroke={KRP.ink} strokeWidth={sw} />
          <ellipse cx={0} cy={16} rx={120} ry={28} fill={belly} opacity={0.9} />
          {/* 垂れた首と頭 */}
          <path d="M 128 -22 L 180 40 L 206 76 L 158 66 Z" fill={body} stroke={KRP.ink} strokeWidth={sw} />
          <ellipse cx={192} cy={86} rx={28} ry={20} fill={body} stroke={KRP.ink} strokeWidth={sw} />
          <path d="M 184 70 Q 192 74 200 70" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M 204 74 C 232 66 244 84 240 106 M 198 82 C 222 80 232 96 228 114"
            fill="none" stroke={C.treeDark} strokeWidth={6} strokeLinecap="round" />
          <path d="M -148 -14 Q -168 -4 -162 16" fill="none" stroke={C.treeDark} strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// ---- ヒヒ (#30/#31/#32/#33 で使い回す。4回別々に描かない) ----
// dir=1 で右向き・足元が y=0。座高はだいたい 170×s
const Baboon: React.FC<{
  x: number; y: number; s?: number; dir?: 1 | -1;
  pose?: "sit" | "boss" | "crouch" | "stand";
  f?: number; phase?: number; silhouette?: boolean; tint?: string;
}> = ({ x, y, s = 1, dir = 1, pose = "sit", f = 0, phase = 0, silhouette, tint }) => {
  const fur = silhouette ? (tint ?? KRP.ink) : C.baboon;
  const dark = silhouette ? (tint ?? KRP.ink) : C.baboonDark;
  const faceC = silhouette ? (tint ?? KRP.ink) : C.baboonFace;
  const sw = silhouette ? 0 : 4.5;
  const bob = Math.sin((f + phase * 17) / 12) * 2.5;
  const puff = 1 + Math.sin(f / 9) * 0.05; // boss の胸の張り
  const head = (hx: number, hy: number, ang = 0, down = false) => (
    <g transform={`translate(${hx} ${hy}) rotate(${ang})`}>
      <circle cx={0} cy={0} r={34} fill={fur} stroke={KRP.ink} strokeWidth={sw} />
      {/* 犬型の長い口吻 */}
      <path d="M 16 -10 Q 52 -8 58 8 Q 60 22 44 24 Q 24 26 12 16 Z"
        fill={faceC} stroke={KRP.ink} strokeWidth={sw} />
      {!silhouette && (
        <g>
          <circle cx={50} cy={10} r={2.8} fill={KRP.ink} />
          <circle cx={16} cy={-8} r={4.5} fill={KRP.ink} />
          <path d="M -28 -22 Q -36 -36 -22 -40 Q -12 -42 -14 -28 Z"
            fill={dark} stroke={KRP.ink} strokeWidth={3.5} />
          <path d={down ? "M 4 -24 Q 12 -20 20 -22" : "M 2 -26 Q 10 -30 18 -26"}
            fill="none" stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      )}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s * dir} ${s})`}>
      {pose === "sit" && (
        <g>
          <path d="M -56 -72 C -96 -84 -106 -128 -86 -148 C -76 -158 -64 -152 -70 -140"
            fill="none" stroke={dark} strokeWidth={10} strokeLinecap="round" />
          <path d="M -60 0 Q -80 -58 -42 -102 Q -8 -136 30 -120 Q 54 -108 56 -80 L 60 0 Z"
            fill={fur} stroke={KRP.ink} strokeWidth={sw} />
          {/* 地面につく前肢 */}
          <g stroke={dark} strokeWidth={12} strokeLinecap="round">
            <line x1={36} y1={-66} x2={50} y2={0} />
            <line x1={16} y1={-62} x2={26} y2={0} />
          </g>
          <ellipse cx={52} cy={0} rx={15} ry={7} fill={dark} />
          <ellipse cx={-34} cy={0} rx={22} ry={8} fill={dark} />
          {head(44, -130)}
        </g>
      )}
      {pose === "boss" && (
        <g>
          <path d="M -46 -110 C -80 -130 -84 -176 -60 -190 C -48 -196 -40 -186 -48 -176"
            fill="none" stroke={dark} strokeWidth={10} strokeLinecap="round" />
          {/* 立ち上がった胴 */}
          <path d="M -44 0 Q -60 -74 -34 -134 Q -12 -172 24 -164 Q 48 -154 46 -118 L 44 0 Z"
            fill={fur} stroke={KRP.ink} strokeWidth={sw} />
          {/* 張った胸 (f でふくらむ) */}
          <ellipse cx={26} cy={-108} rx={32 * puff} ry={46} fill={fur} stroke={KRP.ink} strokeWidth={sw} />
          {/* たてがみ */}
          <path d="M -36 -136 L -52 -158 L -30 -156 L -40 -180 L -16 -168 L -14 -192 L 2 -172 Z"
            fill={dark} stroke={KRP.ink} strokeWidth={silhouette ? 0 : 3.5} />
          {/* ひざに置いた腕 */}
          <g stroke={dark} strokeWidth={12} strokeLinecap="round">
            <line x1={26} y1={-92} x2={46} y2={-16} />
          </g>
          <ellipse cx={-22} cy={0} rx={24} ry={8} fill={dark} />
          <ellipse cx={46} cy={-10} rx={14} ry={7} fill={dark} />
          {head(28, -196, -10)}
        </g>
      )}
      {pose === "crouch" && (
        <g>
          {/* 地面を這うしっぽ */}
          <path d="M -62 -14 Q -100 -16 -116 -4" fill="none" stroke={dark} strokeWidth={9} strokeLinecap="round" />
          {/* 低くうずくまった胴 */}
          <path d="M -64 0 Q -78 -48 -40 -66 Q 0 -82 40 -62 Q 62 -50 58 -22 L 56 0 Z"
            fill={fur} stroke={KRP.ink} strokeWidth={sw} />
          <g stroke={dark} strokeWidth={11} strokeLinecap="round">
            <line x1={34} y1={-36} x2={44} y2={0} />
          </g>
          <ellipse cx={-30} cy={0} rx={22} ry={7} fill={dark} />
          <ellipse cx={46} cy={0} rx={13} ry={6} fill={dark} />
          {head(50, -46, 18, true)}
        </g>
      )}
      {pose === "stand" && (
        <g>
          <path d="M -64 -98 C -92 -128 -84 -158 -62 -160 C -50 -161 -48 -148 -58 -142"
            fill="none" stroke={dark} strokeWidth={9} strokeLinecap="round" />
          <g stroke={dark} strokeWidth={12} strokeLinecap="round">
            <line x1={-52} y1={-80} x2={-58} y2={0} />
            <line x1={-28} y1={-82} x2={-24} y2={0} />
            <line x1={30} y1={-84} x2={26} y2={0} />
            <line x1={52} y1={-80} x2={58} y2={0} />
          </g>
          <ellipse cx={0} cy={-98} rx={72} ry={38} fill={fur} stroke={KRP.ink} strokeWidth={sw} />
          {head(82, -118, 6)}
        </g>
      )}
    </g>
  );
};

// ---- #31/#32 の舞台 (#30 の岩山と地続きの夕景。グラフの背後に薄く敷く) ----
// 横軸 (y=710) が地平線を兼ねる。gradient id は phase で分けて2シーンの衝突を防ぐ
const StressStage: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => {
  const glow = 0.35 + Math.sin(f / 8) * 0.08;
  return (
    <g>
      <defs>
        <linearGradient id={`skyStress${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskDeep} />
          <stop offset="0.65" stopColor={C.duskOrange} />
          <stop offset="1" stopColor={C.fireGlow} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={732} fill={`url(#skyStress${phase})`} />
      {/* 沈む夕日 (左上の空き) */}
      <circle cx={190} cy={170} r={110} fill={C.sun} opacity={glow * 0.5} />
      <circle cx={190} cy={170} r={82} fill={C.sun} opacity={0.95} />
      {/* #30 と地続きの岩山シルエット (薄く・グラフの後ろ) */}
      <g opacity={0.3} fill={C.rockDark}>
        <path d="M 1050 712 L 1150 540 L 1300 470 L 1430 390 L 1560 420 L 1660 520 L 1780 580 L 1880 700 L 1940 712 Z" />
        <path d="M -20 712 L 60 600 L 180 550 L 330 600 L 440 680 L 520 712 Z" />
      </g>
      {/* 地面 = 砂地 */}
      <rect x={-20} y={710} width={W + 40} height={H - 690} fill={C.sand} />
      <path d="M -20 714 Q 480 700 960 712 T 1940 708 L 1940 760 L -20 760 Z" fill={C.sandDark} opacity={0.4} />
      {/* 地平線の低木 */}
      <g fill={C.bush} stroke={KRP.ink} strokeWidth={3} opacity={0.8}>
        <ellipse cx={130} cy={706} rx={44} ry={15} />
        <ellipse cx={1850} cy={704} rx={38} ry={13} />
      </g>
    </g>
  );
};

// ---- ストレス値の棒グラフ (#31/#32)。phase だけ変えて同じ座標で2文に出す ----
// 軸: 原点 (420,710)・右端 1660・上端 240。棒の中心 x = 620 / 1020 / 1400
const StressGraph: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => {
  const OX = 420, OY = 710, TOPY = 240, RX = 1660;
  const BARS = [620, 1020, 1400];
  const BW = 170;
  const e1 = easeOut(seg(f, 4, 20));           // 上位・中位の棒
  const e2 = easeOut(seg(f, 10, 34));          // 主役の棒 (phase で変わる)
  const hTop = phase === 1 ? 170 * e1 : lerp(170, 460, e2); // 上位
  const hMid = 250 * e1;                                     // 中位
  const hLow = phase === 1 ? 460 * e2 : 460;                 // 下位
  const topRed = phase === 2 && e2 > 0.05;
  const wob = Math.sin(f / 5) * 9; // phase2 の王冠ぐらぐら
  const bar = (cx: number, h: number, red: boolean) => (
    <g key={cx}>
      <rect x={cx - BW / 2} y={OY - h} width={BW} height={Math.max(h, 2)} rx={8}
        fill={red ? C.graphRed : C.rockGray} stroke={KRP.ink} strokeWidth={5} />
      <rect x={cx - BW / 2 + 12} y={OY - h + 10} width={26} height={Math.max(h - 20, 1)} rx={8}
        fill={KRP.white} opacity={0.22} />
    </g>
  );
  return (
    <g>
      {/* 目盛り線 (夕空の上にうすく白で) */}
      <g stroke={KRP.white} strokeWidth={3} opacity={0.4}>
        {[1, 2, 3, 4].map((i) => (
          <line key={i} x1={OX} y1={OY - i * 110} x2={RX - 40} y2={OY - i * 110} />
        ))}
      </g>
      {bar(BARS[0], hTop, topRed)}
      {bar(BARS[1], hMid, false)}
      {bar(BARS[2], hLow, true)}
      {/* 軸 (矢印つき) */}
      <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" fill="none">
        <line x1={OX} y1={OY} x2={RX} y2={OY} />
        <line x1={OX} y1={OY} x2={OX} y2={TOPY} />
        <path d={`M ${OX - 16} ${TOPY + 26} L ${OX} ${TOPY} L ${OX + 16} ${TOPY + 26}`} />
        <path d={`M ${RX - 26} ${OY - 16} L ${RX} ${OY} L ${RX - 26} ${OY + 16}`} />
      </g>
      {/* 縦軸の目盛りと数字 */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={OX - 14} y1={OY - i * 110} x2={OX} y2={OY - i * 110}
              stroke={KRP.ink} strokeWidth={5} />
            <text x={OX - 24} y={OY - i * 110 + 10} textAnchor="end" fontFamily={FONT}
              fontWeight={800} fontSize={28} fill={KRP.ink}
              stroke={KRP.white} strokeWidth={7} paintOrder="stroke">{i * 25}</text>
          </g>
        ))}
      </g>
      <text x={OX - 6} y={TOPY - 24} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={34} fill={KRP.ink} stroke={KRP.white} strokeWidth={8} paintOrder="stroke">ストレス値</text>
      {/* 横軸ラベルは軸の右下の空きへ (「下位」との被り解消) */}
      <text x={1680} y={795} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={32} fill={KRP.ink} stroke={KRP.white} strokeWidth={8} paintOrder="stroke">群れでの順位</text>
      {/* 横軸ラベル = ヒヒのアイコン (上位は大きく胸を張り、下位ほど小さくうずくまる) */}
      <Baboon x={548} y={808} s={0.42} pose="boss" f={f} phase={0} />
      <Baboon x={952} y={808} s={0.36} pose="sit" f={f} phase={1} />
      <Baboon x={1344} y={808} s={0.3} pose="crouch" f={f} phase={2} />
      <g fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink}
        stroke={KRP.white} strokeWidth={7} paintOrder="stroke" textAnchor="middle">
        <text x={672} y={782}>上位</text>
        <text x={1066} y={782}>中位</text>
        <text x={1444} y={782}>下位</text>
      </g>
      {phase === 2 && (
        <g>
          {/* ゆらぐ王冠 (上位ヒヒの頭上) */}
          <g transform={`translate(560 698) rotate(${wob})`} opacity={pop(seg(f, 6, 16))}>
            <path d="M -30 10 L -34 -18 L -16 -2 L 0 -24 L 16 -2 L 34 -18 L 30 10 Z"
              fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* ぐらぐらの揺れ線 */}
          <g stroke={C.graphRed} strokeWidth={5} fill="none" strokeLinecap="round"
            opacity={0.4 + Math.sin(f / 4) * 0.3}>
            <path d="M 486 724 Q 474 736 486 748" />
            <path d="M 630 718 Q 642 730 630 742" />
          </g>
        </g>
      )}
    </g>
  );
};

// ---- #21 山: 章扉 ----
const S21: React.FC<{ f: number }> = ({ f }) => {
  // どこ: カラハリの夕暮れ。地平線に大きな夕日、砂地と低木
  // 演出: 獲物を担いだ狩人のシルエットが野営の煙のほうへ歩く。右に章扉
  // 動き: 夕日の照り返しがゆらめき、狩人が歩き、煙と火の粉が流れる
  const glow = 0.45 + Math.sin(f / 7) * 0.14;
  const walk = easeOut(seg(f, 0, 42)) * 150;
  const step = Math.sin(f / 5) * 9;
  const hop = Math.abs(Math.sin(f / 5)) * 5;
  return (
    <Frame f={f} seed={920} dark
      over={<ChapterDoor num={1} title="獲物をけなす。" t={seg(f, 8, 26)} left={1010} top={620} />}>
      <defs>
        <linearGradient id="sky21" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskDeep} />
          <stop offset="0.55" stopColor={C.duskOrange} />
          <stop offset="1" stopColor={C.fireGlow} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={700} fill="url(#sky21)" />
      {/* 大きな夕日とにじむ光 */}
      <circle cx={560} cy={468} r={296} fill={C.sun} opacity={glow * 0.4} />
      <circle cx={560} cy={468} r={212} fill={C.sun} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={560} cy={508} rx={190} ry={44} fill={C.fireGlow} opacity={0.5} />
      {/* 地平線と砂地 */}
      <rect x={-20} y={660} width={W + 40} height={H - 640} fill={C.sand} />
      <path d="M -20 662 Q 480 640 960 660 T 1940 654 L 1940 712 L -20 712 Z" fill={C.sandDark} opacity={0.5} />
      {/* 夕日の照り返し (砂の上で f とともにゆらめく) */}
      <g opacity={glow}>
        <ellipse cx={560} cy={700} rx={300 + Math.sin(f / 6) * 24} ry={15} fill={C.fireGlow} />
        <ellipse cx={560} cy={758} rx={212 - Math.sin(f / 6) * 18} ry={12} fill={C.fireGlow} opacity={0.7} />
        <ellipse cx={560} cy={818} rx={128 + Math.sin(f / 5) * 14} ry={10} fill={C.fireGlow} opacity={0.5} />
      </g>
      {/* 地平線の低木たち */}
      <g fill={C.bush} stroke={KRP.ink} strokeWidth={3.5}>
        <ellipse cx={160} cy={652} rx={56} ry={22} />
        <ellipse cx={980} cy={648} rx={44} ry={17} />
        <ellipse cx={1260} cy={654} rx={62} ry={23} />
      </g>
      <Acacia x={1650} y={662} s={1.05} />
      {/* 野営のたき火と立ちのぼる煙 */}
      <Campfire x={250} y={810} s={1.15} f={f} smoke />
      {/* 獲物を担いで歩いて帰る狩人 (逆光のシルエット) */}
      <g transform={`translate(${640 + walk} ${798 - hop})`} fill={KRP.ink}>
        <g stroke={KRP.ink} strokeWidth={16} strokeLinecap="round">
          <line x1={0} y1={-76} x2={-22 - step} y2={0} />
          <line x1={0} y1={-76} x2={20 + step} y2={0} />
        </g>
        <path d="M -15 -76 Q -19 -150 0 -158 Q 19 -150 15 -76 Z" />
        <circle cx={7} cy={-180} r={21} />
        {/* 獲物を支える両腕 */}
        <g stroke={KRP.ink} strokeWidth={13} strokeLinecap="round">
          <line x1={-10} y1={-140} x2={-42} y2={-204} />
          <line x1={12} y1={-142} x2={44} y2={-206} />
        </g>
        {/* 肩のレイヨウのシルエット (頭・脚・角を胴から大きくはみ出させて形を読ませる) */}
        <g transform="translate(2 -240) rotate(-7)">
          <ellipse cx={0} cy={0} rx={96} ry={27} />
          {/* 手前 (左) に垂れる脚3本。空を背に見えるように体の外へ */}
          <g stroke={KRP.ink} strokeWidth={9} strokeLinecap="round">
            <line x1={-76} y1={6} x2={-88} y2={76} />
            <line x1={-48} y1={12} x2={-54} y2={84} />
            <line x1={-20} y1={14} x2={-18} y2={78} />
          </g>
          {/* 後ろ (右) へ垂れる首と頭 */}
          <path d="M 80 -8 Q 118 14 130 52 L 142 78 L 108 72 Q 98 36 84 12 Z" />
          <circle cx={132} cy={86} r={16} />
          {/* 長い角 (下向きに垂れた頭から上へ) */}
          <path d="M 142 74 C 166 58 178 72 176 96 M 130 80 C 150 70 160 82 158 102"
            fill="none" stroke={KRP.ink} strokeWidth={5.5} strokeLinecap="round" />
          {/* しっぽ */}
          <path d="M -94 -4 Q -112 4 -108 22" fill="none" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
        </g>
      </g>
      {/* 狩人の足あと */}
      <g fill={C.sandDark} opacity={0.8}>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={470 + walk - i * 72} cy={812 + (i % 2) * 14} rx={13} ry={6} />
        ))}
      </g>
    </Frame>
  );
};

// ---- #23 山: カラハリの野営の全景 ----
const S23: React.FC<{ f: number }> = ({ f }) => {
  // どこ: 夕空の下の野営。シェルター2つ・中央のたき火・アカシア
  // 演出: たき火を囲む人々。ひとりが身ぶりで話し、みんなが聞いている
  // 動き: 炎が揺れ、話し手の腕が振られ、聞き手がゆっくり揺れる。星がまたたく
  return (
    <Frame f={f} seed={922} dark>
      <defs>
        <linearGradient id="sky23" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5A3A52" />
          <stop offset="0.5" stopColor={C.duskDeep} />
          <stop offset="1" stopColor={C.duskOrange} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={660} fill="url(#sky23)" />
      {/* 沈みかけの夕日と一番星 */}
      <circle cx={280} cy={560} r={110} fill={C.sun} opacity={0.9} />
      <g fill={KRP.white}>
        {[[420, 140], [980, 90], [1500, 170], [1720, 70], [120, 220]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={4} opacity={0.4 + Math.abs(Math.sin(f / 9 + i * 2)) * 0.6} />
        ))}
      </g>
      {/* 砂地 */}
      <rect x={-20} y={620} width={W + 40} height={H - 600} fill={C.sand} />
      <path d="M -20 622 Q 500 604 1000 620 T 1940 616 L 1940 680 L -20 680 Z" fill={C.sandDark} opacity={0.45} />
      <Acacia x={1700} y={624} s={0.95} />
      <g fill={C.bush} stroke={KRP.ink} strokeWidth={3.5}>
        <ellipse cx={620} cy={612} rx={48} ry={18} />
        <ellipse cx={1420} cy={616} rx={56} ry={20} />
      </g>
      {/* 草ぶきのシェルター2つ */}
      <Shelter x={330} y={780} s={1.15} />
      <Shelter x={1560} y={800} s={0.95} />
      {/* 砂の足あと (たき火へ向かう) */}
      <g fill={C.sandDark} opacity={0.8}>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={1300 - i * 68} cy={940 - i * 22 + (i % 2) * 12} rx={14} ry={7} />
        ))}
      </g>
      {/* 中央のたき火と、それを囲む人々 */}
      <Campfire x={945} y={830} s={1.45} f={f} />
      {/* 話し手 (腕を振って語る) */}
      <Sitter x={700} y={840} s={1.08} dir={1} cloth="#8A5A3E" f={f} phase={0} armUp />
      <Sitter x={1200} y={845} s={1.05} dir={-1} cloth="#6E4A5A" f={f} phase={1} />
      <Sitter x={790} y={742} s={0.88} dir={1} cloth="#5A6A4A" f={f} phase={2} />
      <Sitter x={1110} y={738} s={0.86} dir={-1} cloth="#8A5A3E" f={f} phase={3} />
      <Sitter x={1400} y={780} s={0.92} dir={-1} cloth="#6E4A5A" f={f} phase={4} />
      {/* 話し手の身ぶりの残像の弧 */}
      <g fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round"
        opacity={0.55 + Math.abs(Math.sin(f / 8)) * 0.3}>
        <path d="M 756 668 Q 788 640 826 648" />
        <path d="M 760 696 Q 790 672 822 678" />
      </g>
      <TagPlate x={330} y={210} text="ジュホアンシ" size={50} t={seg(f, 10, 22)} rot={-2} />
    </Frame>
  );
};

// ---- #30 山: ヒヒの岩山の序列 ----
const S30: React.FC<{ f: number }> = ({ f }) => {
  // どこ: サバンナの夕景。段々になった大きな岩山
  // 演出: てっぺんのボスが胸を張り、中段に2〜3匹、下段の下位ヒヒが身を縮める
  // 動き: ボスの胸が f でふくらみ、下位ヒヒが縮こまり、草が揺れる
  const shrink = 1 - easeOut(seg(f, 18, 36)) * 0.1;
  return (
    <Frame f={f} seed={929} dark>
      <defs>
        <linearGradient id="sky30" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskDeep} />
          <stop offset="0.6" stopColor={C.duskOrange} />
          <stop offset="1" stopColor={C.fireGlow} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={700} fill="url(#sky30)" />
      <circle cx={250} cy={330} r={130} fill={C.sun} opacity={0.95} />
      {/* サバンナの地面 */}
      <rect x={-20} y={664} width={W + 40} height={H - 644} fill={C.sand} />
      <path d="M -20 666 Q 480 648 960 664 T 1940 660 L 1940 724 L -20 724 Z" fill={C.sandDark} opacity={0.5} />
      <Acacia x={180} y={680} s={0.85} />
      {/* 段々の岩山 (段差そのものが序列) */}
      <path d="M 520 1000 L 560 760 L 700 700 L 760 540 L 900 470 L 1020 380 L 1180 330
               L 1340 360 L 1420 470 L 1560 540 L 1640 700 L 1740 780 L 1780 1000 Z"
        fill={C.rockGray} stroke={KRP.ink} strokeWidth={6} />
      {/* 岩の面の影と割れ目 */}
      <g fill={C.rockDark} opacity={0.75}>
        <path d="M 760 540 L 900 470 L 940 560 L 820 620 Z" />
        <path d="M 1420 470 L 1560 540 L 1520 640 L 1400 590 Z" />
        <path d="M 560 760 L 700 700 L 740 820 L 620 860 Z" />
        <path d="M 1640 700 L 1740 780 L 1700 900 L 1600 830 Z" />
      </g>
      <g fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
        <path d="M 1060 420 L 1120 520 L 1080 640" />
        <path d="M 1320 420 L 1280 540 L 1330 660" />
        <path d="M 820 680 L 900 760 L 860 880" />
      </g>
      {/* てっぺんの張り出し岩 */}
      <path d="M 1040 384 L 1320 372 L 1360 420 L 1010 432 Z" fill={C.rockDark} stroke={KRP.ink} strokeWidth={5} />
      {/* てっぺん: 胸を張るボス */}
      <Baboon x={1150} y={386} s={1.05} pose="boss" f={f} phase={0} />
      {/* 中段の2〜3匹 */}
      <Baboon x={880} y={624} s={0.74} pose="sit" f={f} phase={1} />
      <Baboon x={1450} y={646} s={0.72} pose="sit" dir={-1} f={f} phase={2} />
      <Baboon x={1240} y={672} s={0.66} pose="stand" dir={-1} f={f} phase={3} />
      {/* 下段: 身を縮める下位ヒヒ */}
      <g transform={`translate(680 936) scale(${shrink})`}>
        <Baboon x={0} y={0} s={0.78} pose="crouch" f={f} phase={4} />
      </g>
      {/* 下位ヒヒの縮こまりの線 */}
      <g fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round"
        opacity={seg(f, 24, 34) * 0.7}>
        <path d="M 580 850 L 608 866" />
        <path d="M 566 892 L 598 898" />
        <path d="M 790 846 L 764 864" />
      </g>
      {/* 手前の草むら (揺れる) */}
      <g fill="none" stroke={C.bush} strokeWidth={7} strokeLinecap="round">
        {[120, 300, 420, 1800, 1880].map((gx, i) => (
          <g key={gx} transform={`translate(${gx} 1010)`}>
            <path d={`M 0 0 Q ${-8 + Math.sin(f / 8 + i) * 7} -46 ${-4 + Math.sin(f / 8 + i) * 10} -78`} />
            <path d={`M 16 0 Q ${14 + Math.sin(f / 8 + i + 1) * 7} -40 ${22 + Math.sin(f / 8 + i + 1) * 10} -64`} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ---- #22 並: 時計を思いきり巻き戻す ----
const S22: React.FC<{ f: number }> = ({ f }) => {
  // どこ: カラハリの夕空に浮かぶ画面いっぱいの懐中時計 (直径800)
  // 演出: 文字盤の中は大むかしのサバンナ。針が逆回転して赤い残像を引き、人がぶら下がって押し戻す
  // 動き: 針の逆回転と残像・ぶら下がる人の揺れ・過去へ流れる風・星のまたたき
  const CX = 900, CY = 570, R = 400;
  const mAng = 60 - f * 2.4;      // 長針 (反時計回り・速い)
  const hAng = 100 - f * 0.6;     // 短針
  const rad = (mAng * Math.PI) / 180;
  const tipX = CX + Math.sin(rad) * (R - 96);
  const tipY = CY - Math.cos(rad) * (R - 96);
  // 逆回転の残像 (少し前の角度に長針の影を置く)
  const ghost = (ang: number, op: number) => (
    <g key={ang} transform={`rotate(${ang} ${CX} ${CY})`} opacity={op}>
      <path d={`M ${CX - 12} ${CY + 48} L ${CX - 6} ${CY - 210} L ${CX} ${CY - R + 78} L ${CX + 6} ${CY - 210} L ${CX + 12} ${CY + 48} Z`}
        fill={C.graphRed} />
    </g>
  );
  return (
    <Frame f={f} seed={921} dark>
      <defs>
        <linearGradient id="sky22" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5A3A52" />
          <stop offset="0.55" stopColor={C.duskDeep} />
          <stop offset="1" stopColor={C.duskOrange} />
        </linearGradient>
        <linearGradient id="dial22" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.fireGlow} />
          <stop offset="0.62" stopColor={C.duskOrange} />
          <stop offset="1" stopColor={C.sand} />
        </linearGradient>
        <clipPath id="dialClip22">
          <circle cx={CX} cy={CY} r={R - 88} />
        </clipPath>
      </defs>
      {/* 外の世界 = 夕空 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="url(#sky22)" />
      <g fill={KRP.white}>
        {[[200, 130], [1700, 90], [1820, 300], [120, 420], [1660, 520]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={4} opacity={0.35 + Math.abs(Math.sin(f / 9 + i * 2)) * 0.55} />
        ))}
      </g>
      {/* 過去へ流れる風のライン */}
      <g fill="none" stroke={KRP.white} strokeWidth={9} strokeLinecap="round" opacity={0.3}
        strokeDasharray="70 50" strokeDashoffset={f * 7}>
        <path d="M 1940 150 Q 1620 100 1430 180" />
        <path d="M 1940 620 Q 1740 580 1560 640" />
        <path d="M 400 940 Q 220 980 -20 920" />
        <path d="M 420 120 Q 240 80 -20 140" />
      </g>
      {/* 竜頭 (りゅうず) と吊り輪 */}
      <g transform={`translate(${CX} ${CY - R - 40})`} fill={KRP.brass} stroke={KRP.ink}>
        <circle cx={0} cy={-80} r={34} fill="none" strokeWidth={12} />
        <rect x={-28} y={-50} width={56} height={48} rx={8} strokeWidth={5} />
        <g strokeWidth={3.5}>
          {[-15, -2, 11].map((lx) => <line key={lx} x1={lx} y1={-46} x2={lx} y2={0} />)}
        </g>
      </g>
      {/* 外ぶた */}
      <circle cx={CX} cy={CY} r={R + 36} fill={KRP.brass} stroke={KRP.ink} strokeWidth={8} />
      <circle cx={CX} cy={CY} r={R + 8} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={CX} cy={CY} r={R - 14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* 文字盤の中 = 大むかしのサバンナ */}
      <g clipPath="url(#dialClip22)">
        <rect x={CX - R} y={CY - R} width={R * 2} height={R * 2} fill="url(#dial22)" />
        <circle cx={CX - 110} cy={CY - 60} r={74} fill={C.sun} opacity={0.95} />
        <rect x={CX - R} y={CY + 120} width={R * 2} height={R} fill={C.sand} />
        <path d={`M ${CX - R} ${CY + 124} Q ${CX - 100} ${CY + 108} ${CX + 140} ${CY + 122} T ${CX + R} ${CY + 118} L ${CX + R} ${CY + 170} L ${CX - R} ${CY + 170} Z`}
          fill={C.sandDark} opacity={0.5} />
        <Acacia x={CX - 190} y={CY + 128} s={0.52} color={KRP.ink} />
        <Acacia x={CX + 210} y={CY + 126} s={0.4} color={KRP.ink} />
        <Antelope x={CX + 60} y={CY + 244} s={0.5} silhouette f={f} />
        <g fill={C.bush} opacity={0.9}>
          <ellipse cx={CX - 60} cy={CY + 126} rx={30} ry={11} />
          <ellipse cx={CX + 300} cy={CY + 130} rx={26} ry={10} />
        </g>
      </g>
      <circle cx={CX} cy={CY} r={R - 88} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      {/* 文字盤の刻み (60本。5本ごとに太く) */}
      <g stroke={KRP.ink}>
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 * Math.PI) / 180;
          const big = i % 5 === 0;
          const r1 = R - (big ? 78 : 58), r2 = R - 24;
          return (
            <line key={i} x1={CX + Math.sin(a) * r1} y1={CY - Math.cos(a) * r1}
              x2={CX + Math.sin(a) * r2} y2={CY - Math.cos(a) * r2} strokeWidth={big ? 9 : 3.5} />
          );
        })}
      </g>
      {/* 数字 (12・3・6・9)。サバンナの上でも読めるよう白フチ */}
      <g fontFamily={FONT} fontWeight={900} fontSize={68} fill={KRP.ink} textAnchor="middle"
        stroke={KRP.white} strokeWidth={10} paintOrder="stroke">
        <text x={CX} y={CY - R + 160}>12</text>
        <text x={CX + R - 136} y={CY + 24}>3</text>
        <text x={CX} y={CY + R - 116}>6</text>
        <text x={CX - R + 136} y={CY + 24}>9</text>
      </g>
      {/* 逆回転の赤い残像 (回った跡が3枚残る) */}
      {ghost(mAng + 16, 0.4)}
      {ghost(mAng + 32, 0.26)}
      {ghost(mAng + 48, 0.13)}
      {/* 短針 (菱形の飾り) */}
      <g transform={`rotate(${hAng} ${CX} ${CY})`}>
        <path d={`M ${CX - 14} ${CY + 34} L ${CX - 8} ${CY - 120} L ${CX} ${CY - 216} L ${CX + 8} ${CY - 120} L ${CX + 14} ${CY + 34} Z`}
          fill={KRP.ink} />
        <path d={`M ${CX} ${CY - 120} L ${CX + 18} ${CY - 162} L ${CX} ${CY - 204} L ${CX - 18} ${CY - 162} Z`}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 長針 (透かし穴の飾り) */}
      <g transform={`rotate(${mAng} ${CX} ${CY})`}>
        <path d={`M ${CX - 12} ${CY + 48} L ${CX - 6} ${CY - 210} L ${CX} ${CY - R + 78} L ${CX + 6} ${CY - 210} L ${CX + 12} ${CY + 48} Z`}
          fill={KRP.ink} />
        <circle cx={CX} cy={CY - 232} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <circle cx={CX} cy={CY} r={24} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* 逆回転の向きを示す大きな赤矢印 */}
      <g opacity={pop(seg(f, 10, 20))}>
        <path d={`M ${CX + 210} ${CY - 330} A 390 390 0 0 0 ${CX - 330} ${CY - 210}`}
          fill="none" stroke={KRP.red} strokeWidth={18} strokeLinecap="round" />
        <polygon points={`${CX - 330},${CY - 210} ${CX - 262},${CY - 264} ${CX - 250},${CY - 182}`}
          fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 長針の先にぶら下がって押し戻す人 (大きく) */}
      <g stroke="#2E3850" strokeWidth={15} strokeLinecap="round">
        <line x1={tipX - 10} y1={tipY + 4} x2={tipX - 42} y2={tipY + 150} />
        <line x1={tipX + 10} y1={tipY + 4} x2={tipX + 42} y2={tipY + 150} />
      </g>
      <Person x={tipX} y={tipY + 428} s={0.95} f={f} face="worried"
        lean={Math.sin(f / 9) * 5} gaze={[0, -5]} cloth="#2E3850" clothDark="#232B40" />
      <TagPlate x={300} y={210} text="大むかしへ" size={52} t={seg(f, 8, 20)} rot={-3} />
    </Frame>
  );
};

// ---- #24 並: 大きな獲物を担いだ狩人が帰ってくる ----
const S24: React.FC<{ f: number }> = ({ f }) => {
  // どこ: 夕空の野営の入口。手前に迎える仲間の後ろ姿
  // 演出: 狩人より大きなレイヨウを担いで誇らしげに歩いてくる。仲間の頭上に「…」
  // 動き: 狩人が歩み寄り、獲物の脚が揺れ、「…」が1個ずつ浮かぶ
  const tx = 1250 - easeOut(seg(f, 0, 26)) * 130;
  return (
    <Frame f={f} seed={923} dark>
      <defs>
        <linearGradient id="sky24" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskDeep} />
          <stop offset="0.6" stopColor={C.duskOrange} />
          <stop offset="1" stopColor={C.fireGlow} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={680} fill="url(#sky24)" />
      <circle cx={1700} cy={560} r={100} fill={C.sun} opacity={0.9} />
      <rect x={-20} y={640} width={W + 40} height={H - 620} fill={C.sand} />
      <path d="M -20 644 Q 500 624 1000 640 T 1940 636 L 1940 700 L -20 700 Z" fill={C.sandDark} opacity={0.5} />
      {/* 夕闇のシェルターの影 */}
      <Shelter x={240} y={760} s={1.0} shadow />
      <g fill={C.bush} stroke={KRP.ink} strokeWidth={3.5} opacity={0.85}>
        <ellipse cx={940} cy={632} rx={50} ry={18} />
      </g>
      {/* 狩人 (誇らしげ・胸を張って歩く) */}
      <g transform={`translate(${tx} 0)`}>
        <ellipse cx={0} cy={814} rx={150} ry={18} fill={C.sandDark} opacity={0.6} />
        {/* 肩の上のレイヨウ (狩人より大きい)。頭の後ろに担ぐので顔は隠れない */}
        <Antelope x={6} y={528} s={1.08} dir={-1} pose="drape" f={f} />
        <Person x={0} y={810} s={1.05} f={f} face="smile" lean={-4} pose="banzai"
          cloth="#8A5A3E" clothDark="#6E4630" gaze={[-3, -3]} />
        {/* 誇らしさのきらめき */}
        {[[-150, 480, 4], [140, 420, 20], [-90, 380, 32]].map(([kx, ky, d], i) => (
          <g key={i} transform={`translate(${kx} ${ky}) scale(${pop(seg(f, d as number, (d as number) + 10))})`}
            stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
            <line x1={-16} y1={0} x2={16} y2={0} />
            <line x1={0} y1={-16} x2={0} y2={16} />
          </g>
        ))}
      </g>
      {/* 手前: 迎える仲間の後ろ姿 (シルエット) */}
      <g transform={`translate(0 ${Math.sin(f / 13) * 3})`}>
        <path d="M 130 1100 Q 150 856 430 836 Q 710 856 730 1100 Z"
          fill={C.treeDark} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={430} cy={700} r={148} fill={C.treeDark} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 「…」の吹き出し */}
      <g opacity={pop(seg(f, 14, 22))}>
        <ellipse cx={430} cy={376} rx={134} ry={88} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="400,452 460,452 430,540" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={396} y={436} width={68} height={24} fill={KRP.white} />
      </g>
      {[370, 430, 490].map((dx, i) => (
        <circle key={dx} cx={dx} cy={380} r={15} fill={KRP.ink}
          transform={`scale(${pop(seg(f, 22 + i * 6, 30 + i * 6))})`}
          style={{ transformOrigin: `${dx}px 380px` }} />
      ))}
    </Frame>
  );
};

// ---- #25 並: 「なんだ、こんな痩せた獲物か」 ----
const S25: React.FC<{ f: number }> = ({ f }) => {
  // どこ: 丸々と立派な獲物のアップ。右に指差す仲間、左に狩人の「えっ」
  // 演出: 仲間の吹き出しの中身はガリガリの骨魚 (言葉はなし)。実物との落差が笑いの核
  // 動き: 獲物が呼吸し、指差す腕が上がり、骨魚が pop、狩人に驚きの線
  const point = easeOut(seg(f, 6, 16));
  return (
    <Frame f={f} seed={924}>
      <defs>
        <linearGradient id="sky25" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskOrange} />
          <stop offset="1" stopColor={C.sand} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={880} fill="url(#sky25)" />
      <rect x={-20} y={840} width={W + 40} height={260} fill={C.sand} />
      <ellipse cx={640} cy={856} rx={360} ry={26} fill={C.sandDark} opacity={0.55} />
      {/* 主役: 丸々と立派なレイヨウ (画面の半分を使う) */}
      <Antelope x={620} y={846} s={2.0} dir={1} pose="stand" f={f} />
      {/* つやのハイライトときらめき */}
      <g fill="none" stroke={KRP.white} strokeWidth={9} strokeLinecap="round" opacity={0.8}>
        <path d="M 480 560 Q 560 528 660 540" />
        <path d="M 470 620 Q 520 600 580 604" />
      </g>
      {[[330, 440, 8], [840, 470, 14], [600, 380, 20]].map(([kx, ky, d], i) => (
        <g key={i} transform={`translate(${kx} ${ky}) scale(${pop(seg(f, d as number, (d as number) + 10))})`}
          stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round">
          <line x1={-20} y1={0} x2={20} y2={0} />
          <line x1={0} y1={-20} x2={0} y2={20} />
        </g>
      ))}
      {/* 左: 狩人の「えっ」の顔 */}
      <Person x={180} y={860} s={1.05} f={f} face="surprised" gaze={[5, -2]}
        cloth="#8A5A3E" clothDark="#6E4630" />
      <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={pop(seg(f, 26, 34))}>
        <line x1={262} y1={470} x2={292} y2={444} />
        <line x1={278} y1={510} x2={312} y2={496} />
      </g>
      {/* 右: 指差す仲間 */}
      <Person x={1500} y={866} s={1.1} f={f} face="normal" gaze={[-5, 0]}
        cloth="#6E4A5A" clothDark="#543844" />
      {/* 指差す腕 (上がっていく) */}
      <g opacity={point} transform={`rotate(${(1 - point) * 24} 1444 700)`}>
        <line x1={1444} y1={700} x2={1130} y2={620} stroke="#6E4A5A" strokeWidth={17} strokeLinecap="round" />
        <circle cx={1130} cy={620} r={15} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1128} y1={618} x2={1086} y2={608} stroke={C.skin} strokeWidth={10} strokeLinecap="round" />
      </g>
      {/* 吹き出し: 中身はガリガリの骨魚だけ */}
      <g opacity={pop(seg(f, 12, 20))}>
        <ellipse cx={1430} cy={300} rx={170} ry={104} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <polygon points="1360,390 1430,384 1396,500" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1360} y={368} width={76} height={26} fill={KRP.white} />
      </g>
      <BoneFish x={1430} y={300} s={1.25} t={seg(f, 18, 28)} />
    </Frame>
  );
};

// ---- #26 図: 見事な獲物ほど、わざとけなす (右下がりグラフ) ----
const S26: React.FC<{ f: number }> = ({ f }) => {
  // どこ: クリーム地 + 方眼。横軸 = 獲物のりっぱさ、縦軸 = ほめ言葉の量
  // 演出: 獲物が立派になるほど吹き出しが小さくなる右下がりの赤い線
  // 動き: 線が伸び、吹き出しが大→小の順に pop する
  const e = easeOut(seg(f, 10, 30));
  const bubble = (bx: number, by: number, r: number, t: number) => (
    <g transform={`translate(${bx} ${by}) scale(${pop(clamp01(t))})`} key={bx}>
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.68} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <polygon points={`${-r * 0.2},${r * 0.56} ${r * 0.26},${r * 0.5} ${r * 0.1},${r * 1.06}`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-r * 0.24} y={r * 0.36} width={r * 0.56} height={r * 0.26} fill={KRP.white} />
      <g stroke={KRP.ink} strokeWidth={r * 0.09} strokeLinecap="round" opacity={0.8}>
        <line x1={-r * 0.5} y1={-r * 0.16} x2={r * 0.5} y2={-r * 0.16} />
        <line x1={-r * 0.5} y1={r * 0.12} x2={r * 0.2} y2={r * 0.12} />
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={925} bg={C.sand}>
      {/* 砂の風紋 (うすい縞がゆらぐ) */}
      <g fill="none" stroke={C.sandDark} strokeWidth={5} opacity={0.3} strokeLinecap="round">
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <g key={row}>
            {[0, 1, 2, 3, 4].map((col) => {
              const wx = 60 + col * 400 + (row % 2) * 180;
              const wy = 100 + row * 180;
              return <path key={col} d={`M ${wx} ${wy} q 70 ${16 + Math.sin(f / 14 + row + col) * 5} 150 0`} />;
            })}
          </g>
        ))}
      </g>
      {/* 小石と草 */}
      <g fill={C.rockGray} stroke={KRP.ink} strokeWidth={3}>
        <ellipse cx={210} cy={900} rx={26} ry={16} />
        <ellipse cx={262} cy={916} rx={16} ry={10} />
        <ellipse cx={1800} cy={260} rx={22} ry={14} />
        <ellipse cx={120} cy={140} rx={18} ry={12} />
        <ellipse cx={660} cy={84} rx={15} ry={10} />
        <ellipse cx={1736} cy={636} rx={18} ry={12} />
        <ellipse cx={1778} cy={656} rx={11} ry={7} />
        <ellipse cx={96} cy={560} rx={14} ry={9} />
        <ellipse cx={132} cy={584} rx={9} ry={6} />
      </g>
      <g fill="none" stroke={C.bush} strokeWidth={6} strokeLinecap="round">
        <path d={`M 1810 980 Q ${1802 + Math.sin(f / 8) * 7} 934 ${1806 + Math.sin(f / 8) * 10} 902`} />
        <path d={`M 1826 980 Q ${1824 + Math.sin(f / 8 + 1) * 7} 940 ${1834 + Math.sin(f / 8 + 1) * 10} 914`} />
        <path d={`M 128 1008 Q ${120 + Math.sin(f / 9 + 2) * 7} 964 ${124 + Math.sin(f / 9 + 2) * 10} 934`} />
        <path d={`M 146 1008 Q ${146 + Math.sin(f / 9 + 3) * 7} 970 ${156 + Math.sin(f / 9 + 3) * 10} 946`} />
        <path d={`M 1234 972 Q ${1226 + Math.sin(f / 8 + 4) * 6} 936 ${1230 + Math.sin(f / 8 + 4) * 9} 912`} />
        <path d={`M 1856 470 Q ${1850 + Math.sin(f / 8 + 5) * 6} 436 ${1854 + Math.sin(f / 8 + 5) * 9} 414`} />
      </g>
      {/* 砂地の足あとの列 (枝を引きずって歩いた跡) */}
      <g fill={C.sandDark} opacity={0.55}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fx = 520 + i * 108, fy = 1002 - i * 27, rot = -18;
          return (
            <g key={i} transform={`translate(${fx} ${fy}) rotate(${rot})`}>
              <ellipse cx={0} cy={-11} rx={13} ry={7} />
              <ellipse cx={46} cy={11} rx={13} ry={7} />
            </g>
          );
        })}
      </g>
      <path d="M 500 1022 Q 760 952 1020 882" fill="none" stroke={C.sandDark}
        strokeWidth={7} strokeLinecap="round" opacity={0.3} />
      {/* 砂粒の散らばり */}
      <g fill={C.sandDark} opacity={0.4}>
        {([[840, 110], [1660, 160], [240, 420], [1810, 520], [560, 950], [1420, 940], [980, 1010]] as const).map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={4.5} />
        ))}
      </g>
      {/* グラフを描いた枝 (そばに置いてある) */}
      <g transform="translate(300 964) rotate(18)">
        <rect x={-130} y={-9} width={260} height={18} rx={9} fill={C.wood} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 96 -6 L 150 -34" fill="none" stroke={C.wood} strokeWidth={11} strokeLinecap="round" />
        <path d="M -130 0 L -158 4" fill="none" stroke={C.wood} strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* 枝の引っかき跡 (軸の溝)。砂を掘った影を先に敷く */}
      <g stroke={C.sandDark} strokeWidth={16} strokeLinecap="round" fill="none" opacity={0.85}>
        <line x1={382} y1={745} x2={1700} y2={745} />
        <line x1={385} y1={740} x2={385} y2={202} />
      </g>
      {/* 引っかきの砂粒の飛び散り */}
      <g fill={C.sandDark} opacity={0.75}>
        {[480, 700, 950, 1210, 1460, 1640].map((px, i) => (
          <ellipse key={px} cx={px} cy={760 + (i % 2) * 10} rx={7} ry={4} />
        ))}
        {[300, 420, 560, 660].map((py, i) => (
          <ellipse key={py} cx={358 - (i % 2) * 10} cy={py} rx={4} ry={7} />
        ))}
      </g>
      {/* 引っかき線の脇のかすれ (枝が砂をはねた短い線) */}
      <g stroke={C.sandDark} strokeWidth={4} strokeLinecap="round" opacity={0.6} fill="none">
        {[480, 790, 900, 1160, 1300, 1580].map((kx, i) => (
          <line key={kx} x1={kx} y1={i % 2 ? 720 : 766} x2={kx + 26} y2={i % 2 ? 714 : 772} />
        ))}
        {[260, 360, 500, 620].map((ky, i) => (
          <line key={ky} x1={i % 2 ? 352 : 408} y1={ky} x2={i % 2 ? 346 : 414} y2={ky + 26} />
        ))}
        {/* 赤い線の脇のかすれ */}
        <line x1={742} y1={416} x2={770} y2={426} />
        <line x1={906} y1={456} x2={934} y2={466} />
        <line x1={1168} y1={548} x2={1194} y2={556} />
      </g>
      {/* 右下がりの赤い線 (ほめ言葉が減っていく)。砂の溝 → 赤い顔料の順に重ねる */}
      <path d="M 620 354 L 1020 464 L 1340 544" fill="none" stroke={C.sandDark} strokeWidth={22}
        strokeLinecap="round" opacity={0.8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e} />
      <path d="M 620 350 L 1020 460 L 1340 540" fill="none" stroke={KRP.red} strokeWidth={13}
        strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e} />
      <polygon points="1448,566 1390,520 1378,570" fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5}
        opacity={pop(seg(f, 28, 36))} />
      {/* ほめ言葉の吹き出し (大 → 小)。各獲物の真上。右端は間隔を空ける */}
      {bubble(620, 240, 96, seg(f, 6, 14))}
      {bubble(1020, 380, 58, seg(f, 12, 20))}
      {bubble(1480, 452, 32, seg(f, 18, 26))}
      {/* 軸 (枝で引いた線) */}
      <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" fill="none">
        <line x1={380} y1={740} x2={1700} y2={740} />
        <line x1={380} y1={740} x2={380} y2={200} />
        <path d="M 364 226 L 380 200 L 396 226" />
        <path d="M 1674 724 L 1700 740 L 1674 756" />
      </g>
      {/* 軸ラベル */}
      <text x={388} y={168} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={36} fill={KRP.ink}>ほめ言葉</text>
      <text x={1620} y={812} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={32} fill={KRP.ink}>獲物のりっぱさ</text>
      {/* 横軸 = 獲物のシルエット (小 → 大)。右端の密集を避けて 1480 まで散らす */}
      <Antelope x={620} y={736} s={0.20} silhouette f={f} />
      <Antelope x={1020} y={736} s={0.32} silhouette f={f} />
      <Antelope x={1480} y={736} s={0.46} silhouette f={f} />
      <TagPlate x={1180} y={210} text="りっぱなほどそっけない" size={46} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ---- #27 並: 狩人本人も控えめに振る舞う ----
const S27: React.FC<{ f: number }> = ({ f }) => {
  // どこ: 日が落ちた野営。足元に実物の立派な獲物
  // 演出: 頭をかいて照れる狩人。吹き出しの中は小さくしょぼい獲物 (実物との落差)
  // 動き: 頭をかく手が動き、仲間の笑いの影が揺れ、たき火がはぜる
  const scratch = Math.sin(f / 6) * 10;
  return (
    <Frame f={f} seed={926} dark>
      <defs>
        <linearGradient id="sky27" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A3050" />
          <stop offset="0.55" stopColor={C.duskDeep} />
          <stop offset="1" stopColor={C.duskOrange} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={700} fill="url(#sky27)" />
      <rect x={-20} y={660} width={W + 40} height={H - 640} fill={C.sand} />
      <path d="M -20 662 Q 500 644 1000 660 T 1940 656 L 1940 720 L -20 720 Z" fill={C.sandDark} opacity={0.5} />
      <Campfire x={230} y={850} s={1.25} f={f} />
      {/* 仲間の笑いの影 (右奥) */}
      {[[1560, 790, 0], [1760, 820, 1]].map(([sx, sy, ph], i) => (
        <g key={i} transform={`translate(${sx} ${sy + Math.sin(f / 7 + (ph as number) * 2) * 4})`}>
          <path d="M -70 0 Q -74 -84 -20 -104 Q 30 -118 48 -70 L 58 0 Z"
            fill={C.treeDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-6} cy={-134} r={34} fill={C.treeDark} stroke={KRP.ink} strokeWidth={5} />
          <g fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round"
            opacity={0.5 + Math.sin(f / 6 + (ph as number)) * 0.3}>
            <path d="M -60 -190 Q -50 -204 -36 -200" />
            <path d="M 20 -196 Q 34 -208 46 -198" />
          </g>
        </g>
      ))}
      {/* 足元の実物 (立派) */}
      <ellipse cx={560} cy={936} rx={300} ry={22} fill={C.sandDark} opacity={0.6} />
      <Antelope x={540} y={930} s={1.35} dir={1} pose="lie" f={f} />
      {/* 照れて頭をかく狩人 */}
      <Person x={920} y={830} s={1.15} f={f} face="smile" cloth="#8A5A3E" clothDark="#6E4630" gaze={[-3, 2]} />
      {/* かく腕 (f で動く) */}
      <g transform={`rotate(${-18 + scratch} 988 658)`}>
        <line x1={988} y1={658} x2={1032} y2={520} stroke="#8A5A3E" strokeWidth={18} strokeLinecap="round" />
        <circle cx={1036} cy={512} r={15} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 照れ (ほお + 汗) */}
      <ellipse cx={880} cy={580} rx={14} ry={8} fill={C.meatLight} opacity={0.9} />
      <ellipse cx={962} cy={580} rx={14} ry={8} fill={C.meatLight} opacity={0.9} />
      <path d="M 1002 440 Q 1016 462 1002 474 Q 988 462 1002 440 Z" fill={KRP.blue}
        stroke={KRP.ink} strokeWidth={3.5} opacity={pop(seg(f, 24, 32))} />
      {/* 考えの吹き出し: 中身は小さくしょぼい獲物 */}
      <g opacity={pop(seg(f, 10, 20))}>
        <circle cx={1116} cy={520} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1180} cy={452} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1380} cy={300} rx={196} ry={118} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      </g>
      <g opacity={pop(seg(f, 20, 30))}>
        <Antelope x={1350} y={366} s={0.52} dir={1} pose="stand" skinny f={f} />
      </g>
    </Frame>
  );
};

// ---- #28 図: いばり始めると群れの空気が壊れる ----
const S28: React.FC<{ f: number }> = ({ f }) => {
  // どこ: 夕方の野営を真上から。たき火の明かりの輪、外は宵闇
  // 演出: 輪になる村人の中で1人だけふんぞり返り、輪の内側を往復して歩き回る
  //       → 画面を縦に貫く裂け目が走り、輪を真っ二つに割る
  // 動き: ふんぞりが楕円の弧を往復 (奥で小さく手前で大きく)、裂け目が上から下へ seg で伸び、
  //       割れ目の両どなりの4人が身を引いて Bolt
  const crack = easeOut(seg(f, 18, 38));
  const CXR = 920, CYR = 580;
  const folkColor = ["#8A5A3E", "#6E4A5A", "#5A6A4A"];
  const folk = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
    const px = CXR + Math.cos(a) * 540;
    const py = CYR + Math.sin(a) * 280;
    return { px, py, a, i, front: Math.sin(a) > 0 };
  });
  // ヒビの通り道 (画面中央をまっすぐ下へ) の両どなりの4人が、割れ目から身を引く
  const recoil = seg(f, 30, 40);
  const tiltOf = (i: number) =>
    i === 0 ? -14 * recoil
      : i === 7 ? -16 * recoil
        : i === 1 ? 12 * recoil
          : i === 6 ? 14 * recoil
            : 0;
  const mini = (p: { px: number; py: number; a: number; i: number }, s: number) => (
    <g key={p.i}>
      {/* たき火と反対へ伸びる影 */}
      <ellipse cx={p.px + Math.cos(p.a) * 44 * s} cy={p.py + 5}
        rx={52 * s} ry={11 * s} fill={C.nightDeep} opacity={0.4} />
      <g transform={`rotate(${tiltOf(p.i)} ${p.px} ${p.py})`}>
        <PersonMini x={p.px} y={p.py} s={s} color={folkColor[p.i % 3]} f={f} phase={p.i} />
      </g>
    </g>
  );
  return (
    <Frame f={f} seed={927} dark>
      <defs>
        <radialGradient id="pool28">
          <stop offset="0" stopColor={C.fireGlow} stopOpacity={0.6} />
          <stop offset="0.6" stopColor={C.duskOrange} stopOpacity={0.3} />
          <stop offset="1" stopColor={C.duskOrange} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 真上から見た砂地。外周は日が落ちて暗い */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.sand} />
      <g fill="none" stroke={C.sandDark} strokeWidth={5} opacity={0.25} strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((row) => (
          <g key={row}>
            {[0, 1, 2, 3].map((col) => {
              const wx = 100 + col * 480 + (row % 2) * 220;
              return <path key={col} d={`M ${wx} ${90 + row * 230} q 70 14 150 0`} />;
            })}
          </g>
        ))}
      </g>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.duskDeep} opacity={0.42} />
      {/* たき火の明かりが届く範囲 (脈打つ) */}
      <ellipse cx={CXR} cy={CYR} rx={760} ry={430} fill="url(#pool28)"
        opacity={0.8 + Math.sin(f / 7) * 0.12} />
      {/* 地面の色むら (踏み固められた土) */}
      <g fill={C.sandDark} opacity={0.14}>
        <ellipse cx={540} cy={430} rx={150} ry={70} />
        <ellipse cx={1250} cy={320} rx={130} ry={60} />
        <ellipse cx={760} cy={880} rx={170} ry={60} />
        <ellipse cx={400} cy={800} rx={110} ry={50} />
        <ellipse cx={1080} cy={1000} rx={150} ry={55} />
        <ellipse cx={1700} cy={180} rx={130} ry={60} />
      </g>
      {/* 外周の小石と低木 (宵闇の中) */}
      <g fill={C.rockGray} stroke={KRP.ink} strokeWidth={3} opacity={0.8}>
        <ellipse cx={170} cy={430} rx={20} ry={13} />
        <ellipse cx={216} cy={452} rx={12} ry={8} />
        <ellipse cx={1814} cy={190} rx={18} ry={12} />
        <ellipse cx={590} cy={1016} rx={16} ry={10} />
        <ellipse cx={116} cy={906} rx={14} ry={9} />
        <ellipse cx={1740} cy={1004} rx={15} ry={10} />
      </g>
      <g fill={C.treeDark} opacity={0.5}>
        {([[90, 150, 1], [1858, 560, 0.85], [320, 1030, 0.9]] as const).map(([bx, by, bs], i) => (
          <g key={i} transform={`translate(${bx} ${by}) scale(${bs})`}>
            <ellipse cx={0} cy={0} rx={52} ry={26} />
            <ellipse cx={38} cy={14} rx={30} ry={16} />
          </g>
        ))}
      </g>
      {/* たき火のそばのまきの備え (井桁積み) */}
      <g transform="translate(520 545) rotate(-8)">
        <g fill={C.wood} stroke={KRP.ink} strokeWidth={4}>
          <rect x={-54} y={-8} width={108} height={14} rx={7} />
          <rect x={-54} y={10} width={108} height={14} rx={7} />
          <rect x={-46} y={-26} width={92} height={14} rx={7} transform="rotate(4)" />
        </g>
        <circle cx={-54} cy={-1} r={6} fill={C.sandDark} stroke={KRP.ink} strokeWidth={2.5} />
        <circle cx={54} cy={17} r={6} fill={C.sandDark} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
      {/* 敷物 (獣皮。輪の中に広げてある) */}
      <g transform="translate(830 430) rotate(-10)">
        <path d="M -96 -34 Q -56 -66 -6 -58 Q 48 -72 88 -38 Q 118 -4 86 30 Q 44 58 -2 50 Q -62 62 -94 26 Q -116 -6 -96 -34 Z"
          fill={C.meatLight} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        <g fill={C.meat} opacity={0.5}>
          <ellipse cx={-30} cy={-10} rx={16} ry={9} />
          <ellipse cx={30} cy={10} rx={13} ry={8} />
          <ellipse cx={10} cy={-28} rx={10} ry={6} />
        </g>
      </g>
      {/* 敷物のわきの水のひょうたんと椀 */}
      <g transform="translate(980 480)">
        <ellipse cx={0} cy={0} rx={22} ry={16} fill={C.thatch} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={26} cy={-14} rx={12} ry={9} fill={C.thatch} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={62} cy={10} r={14} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={62} cy={10} r={7} fill={C.sandDark} />
      </g>
      {/* 中央のたき火 (真上から: 石の輪 + 交差したまき + 炎) */}
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return (
            <ellipse key={i} cx={CXR - 250 + Math.cos(a) * 96} cy={CYR + 40 + Math.sin(a) * 54}
              rx={20} ry={13} fill={C.rockGray} stroke={KRP.ink} strokeWidth={3.5} />
          );
        })}
        <g fill={C.wood} stroke={KRP.ink} strokeWidth={4}>
          <rect x={CXR - 310} y={CYR + 32} width={120} height={14} rx={7} transform={`rotate(24 ${CXR - 250} ${CYR + 40})`} />
          <rect x={CXR - 310} y={CYR + 32} width={120} height={14} rx={7} transform={`rotate(-28 ${CXR - 250} ${CYR + 40})`} />
        </g>
        <Campfire x={CXR - 250} y={CYR + 44} s={1.0} f={f} />
      </g>
      {/* 輪に並ぶ村人 (奥 → 手前) */}
      {folk.filter((p) => !p.front).map((p) => mini(p, 0.6))}
      {folk.filter((p) => p.front).map((p) => mini(p, 0.84))}
      {/* 地面の裂け目 (岩肌がのぞく)。画面の上端から下端まで、輪を縦に真っ二つに割る。
          中央の敷物 (830,430) と水のひょうたん (980,480) と たき火 (670,624) は避けて通す。
          自慢者より奥 (下のレイヤー) なので、周回する足元はこの上を踏んでいく */}
      <g opacity={crack}>
        <path d="M 974 -20 L 1005 92 L 973 206 L 1020 316 L 1005 404 L 1095 470 L 1054 556
                 L 990 640 L 1032 740 L 982 842 L 1023 944 L 989 1046 L 1026 1124
                 L 1055 1124 L 1017 1046 L 1052 944 L 1010 842 L 1058 740 L 1021 640
                 L 1082 556 L 1123 470 L 1033 404 L 1048 316 L 1002 206 L 1035 92 L 1003 -20 Z"
          fill={C.rockDark} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
        {/* 岩肌の割れ目の質感 */}
        <g fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.6}>
          <path d="M 998 140 L 1014 158" />
          <path d="M 1018 350 L 1036 366" />
          <path d="M 1078 512 L 1092 528" />
          <path d="M 1016 690 L 1038 706" />
          <path d="M 1010 900 L 1032 916" />
          <path d="M 1012 1080 L 1032 1096" />
        </g>
      </g>
      {/* 赤いヒビの走り (画面の上端から下端へ dash で伸びる) */}
      <path d="M 990 -20 L 1018 92 L 990 206 L 1032 316 L 1020 404 L 1108 470 L 1070 556
               L 1004 640 L 1044 740 L 998 842 L 1036 944 L 1004 1046 L 1040 1124"
        fill="none" stroke={C.graphRed} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} />
      {/* 枝分かれ (輪の外へ逃げる) */}
      <path d="M 1070 556 L 986 596 L 952 660" fill="none" stroke={C.graphRed} strokeWidth={6}
        strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1}
        strokeDashoffset={1 - easeOut(seg(f, 30, 42))} />
      {/* 輪の中: ふんぞり返る1人。輪の内側を往復して歩き回る (村人より手前)。
          軌道は中心 (CXR, CYR)・半径 310×88 の楕円のうち、右半分 (-48°〜+42°) だけの弧。
          輪の中央には敷物・ひょうたん・たき火があり1周するとぶつかるので、往復にしてある。
          139フレームで1往復 = 174フレームで約1.25往復 */}
      {(() => {
        const th = (-3 - 45 * Math.cos((f / 139) * Math.PI * 2)) * (Math.PI / 180);
        const bx = CXR + Math.cos(th) * 310;
        const by = CYR + Math.sin(th) * 88;
        // 真上から見ているので、奥 (上) にいるときは小さく・手前 (下) では大きく
        const depth = 0.56 * (1 + Math.sin(th) * 0.16);
        const bsc = pop(seg(f, 2, 12)) * depth * (1 + Math.sin(f / 8) * 0.035);
        // 足元の影は、たき火 (CXR-250, CYR+44) の反対へ伸びる
        const sx = bx - (CXR - 250), sy = by - (CYR + 44);
        const sl = Math.max(1, Math.hypot(sx, sy));
        return (
          <g transform={`translate(${bx} ${by}) scale(${bsc}) rotate(-6)`}>
            {/* 足元の影 (本人と一緒に動く) */}
            <ellipse cx={(sx / sl) * 26} cy={5 + (sy / sl) * 10} rx={44} ry={12}
              fill={C.nightDeep} opacity={0.4} />
            <g stroke="#8A5A3E" strokeWidth={17} strokeLinecap="round">
              <line x1={-6} y1={-70} x2={-34} y2={0} />
              <line x1={6} y1={-70} x2={36} y2={0} />
            </g>
            {/* 反った胴と張った胸 */}
            <path d="M -34 -66 Q -56 -140 -22 -180 Q 16 -214 52 -178 Q 74 -146 50 -70 Z"
              fill="#8A5A3E" stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={24} cy={-150} rx={30} ry={42} fill="#8A5A3E" stroke={KRP.ink} strokeWidth={4.5} />
            {/* 腰に当てた腕 */}
            <path d="M -30 -160 L -72 -120 L -30 -92 M 44 -164 L 84 -122 L 44 -94"
              fill="none" stroke="#8A5A3E" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            {/* あごを上げた頭 (得意顔) */}
            <g transform="translate(20 -222) rotate(14)">
              <circle cx={0} cy={0} r={34} fill={C.skin} stroke={KRP.ink} strokeWidth={5} />
              <path d="M -32 -10 Q -32 -34 0 -34 Q 32 -34 32 -10 Q 0 -22 -32 -10 Z" fill={KRP.ink} />
              <path d="M -16 2 Q -10 -4 -4 2 M 10 0 Q 16 -6 22 0" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
              <path d="M -2 16 Q 6 20 14 14" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
            </g>
            {/* えばりの放射線 */}
            <g stroke={C.duskOrange} strokeWidth={5} strokeLinecap="round"
              opacity={0.5 + Math.sin(f / 6) * 0.3}>
              <line x1={70} y1={-250} x2={94} y2={-274} />
              <line x1={92} y1={-212} x2={122} y2={-222} />
              <line x1={-44} y1={-252} x2={-62} y2={-276} />
            </g>
          </g>
        );
      })()}
      <Bolt x={1062} y={120} s={1.25} opacity={seg(f, 34, 42)} />
      <TagPlate x={320} y={210} text="むれの空気" size={50} t={seg(f, 6, 16)} />
      <TagPlate x={1210} y={146} text="ヒビ" size={48} t={seg(f, 34, 42)} color={KRP.red} rot={4} />
    </Frame>
  );
};

// ---- #29 図: 勝ちたい気持ちは人間の発明ではない ----
const S29: React.FC<{ f: number }> = ({ f }) => {
  // どこ: 洞窟の岩壁。赤土 (オーカー) で描いた壁画のヒヒと人
  // 演出: 壁画の両方の胸に「同じ炎」だけが本物の色で灯り、間に赤土の「=」
  // 動き: 炎が同時に pop して揺れ、下からのたき火の明かりが壁をなめる
  const lit = seg(f, 14, 24);
  const pulse = 0.2 + Math.sin(f / 6) * 0.08;
  const flicker = 0.2 + Math.abs(Math.sin(f / 7)) * 0.14;
  return (
    <Frame f={f} seed={928} bg={C.rockGray}>
      <defs>
        <radialGradient id="torch29" cx="0.5" cy="1">
          <stop offset="0" stopColor={C.fireGlow} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.fireGlow} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 岩肌の質感 (濃淡のしみと割れ目) */}
      <g fill={C.rockDark} opacity={0.35}>
        <path d="M -20 -20 L 420 -20 Q 360 140 180 220 Q 40 280 -20 260 Z" />
        <path d="M 1940 -20 L 1500 -20 Q 1580 120 1760 200 Q 1880 250 1940 230 Z" />
        <ellipse cx={300} cy={700} rx={230} ry={120} />
        <ellipse cx={1680} cy={820} rx={200} ry={110} />
        <ellipse cx={1050} cy={960} rx={320} ry={90} />
      </g>
      <g fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.35} strokeLinecap="round">
        <path d="M 150 80 L 230 240 L 190 420 L 260 560" />
        <path d="M 1800 140 L 1710 320 L 1770 480" />
        <path d="M 900 40 L 980 120 L 940 210" />
        <path d="M 620 920 L 740 960 L 820 940" />
      </g>
      {/* 赤土の手形 (壁画のしるし) */}
      {[[170, 850], [1830, 420], [1760, 980]].map(([hx, hy], i) => (
        <g key={i} transform={`translate(${hx} ${hy}) scale(${i === 1 ? 0.9 : 1.1}) rotate(${i * 24 - 12})`}
          fill={C.ochre} opacity={0.75}>
          <ellipse cx={0} cy={10} rx={26} ry={30} />
          {[-28, -14, 0, 14, 28].map((fx, j) => (
            <ellipse key={j} cx={fx} cy={-26 - (j === 2 ? 10 : j === 0 || j === 4 ? -6 : 4)} rx={7} ry={20}
              transform={`rotate(${fx * 0.7} ${fx} -20)`} />
          ))}
        </g>
      ))}
      {/* 左: 赤土で描いたヒヒ (座り) */}
      <Baboon x={470} y={806} s={2.9} pose="sit" silhouette tint={C.ochre} f={f} phase={0} />
      {/* 右: 赤土で描いた人 (立ち) */}
      <g transform={`translate(1430 ${806 + Math.sin(f / 13) * 3})`} fill={C.ochre}>
        <g stroke={C.ochre} strokeWidth={30} strokeLinecap="round">
          <line x1={-24} y1={-180} x2={-40} y2={0} />
          <line x1={24} y1={-180} x2={40} y2={0} />
        </g>
        <path d="M -62 -170 Q -74 -330 -38 -384 Q 0 -414 38 -384 Q 74 -330 62 -170 Z" />
        <g stroke={C.ochre} strokeWidth={24} strokeLinecap="round">
          <line x1={-62} y1={-340} x2={-84} y2={-190} />
          <line x1={62} y1={-340} x2={84} y2={-190} />
        </g>
        <circle cx={0} cy={-446} r={56} />
      </g>
      {/* 胸に同時に灯る同じ炎 (炎だけ本物の色) */}
      <circle cx={556} cy={520} r={86} fill={C.fireGlow} opacity={lit * (pulse + 0.1)} />
      <circle cx={1430} cy={474} r={86} fill={C.fireGlow} opacity={lit * (pulse + 0.1)} />
      <FlameIcon x={556} y={568} s={1.15} t={lit} f={f} />
      <FlameIcon x={1430} y={522} s={1.15} t={lit} f={f} />
      {/* = (これも赤土で) */}
      <g transform={`translate(960 470) scale(${pop(seg(f, 26, 34))})`} fill={C.ochre}>
        <rect x={-80} y={-48} width={160} height={30} rx={8} />
        <rect x={-80} y={18} width={160} height={30} rx={8} />
      </g>
      {/* 下からのたき火の明かりが壁をなめる */}
      <ellipse cx={960} cy={1100} rx={1100} ry={420} fill="url(#torch29)"
        opacity={0.6 + Math.sin(f / 7) * 0.2} />
      <ellipse cx={960} cy={1080} rx={620} ry={200} fill={C.fireGlow} opacity={flicker * 0.5} />
      <TagPlate x={960} y={200} text="おなじ火" size={54} t={seg(f, 32, 42)} color={KRP.red} />
    </Frame>
  );
};

// ---- #31 図: 順位が低いヒヒはストレス値が高い (phase 1) ----
const S31: React.FC<{ f: number }> = ({ f }) => {
  // どこ: #30 の岩山と地続きの夕景。砂地に立つストレス値の棒グラフ (棒は岩の色味)
  // 演出: 下位の棒だけ赤く高く伸びる
  // 動き: 棒が seg で伸び、夕日が脈打ち、矢印と札が pop
  return (
    <Frame f={f} seed={930} dark>
      <StressStage f={f} phase={1} />
      <StressGraph f={f} phase={1} />
      <Arrow x={1400} y={212} s={1.2} rot={90} t={seg(f, 34, 42)} />
      <TagPlate x={1000} y={200} text="下ほどつらい" size={52} t={seg(f, 30, 40)} color={KRP.red} />
    </Frame>
  );
};

// ---- #32 図: 地位が揺らぐボスも値が高い (phase 2・#31と同じ図) ----
const S32: React.FC<{ f: number }> = ({ f }) => {
  // どこ: #31 とまったく同じ座標・同じ軸・同じ夕景のグラフ
  // 演出: 上位ヒヒに王冠+ぐらぐら線が付き、上位の棒も赤く伸び上がる
  // 動き: 棒がせり上がり、王冠が揺れる
  return (
    <Frame f={f} seed={931} dark>
      <StressStage f={f} phase={2} />
      <StressGraph f={f} phase={2} />
      <Arrow x={760} y={226} s={1.2} rot={-90} t={seg(f, 30, 40)} />
      <TagPlate x={1020} y={200} text="ゆらぐボスも" size={52} t={seg(f, 32, 42)} color={KRP.red} />
    </Frame>
  );
};

// ---- #33 並: 本能と苦しさはサバンナの時代から ----
const S33: React.FC<{ f: number }> = ({ f }) => {
  // どこ: 夕焼けのサバンナの丘。大きな夕日
  // 演出: ヒヒ1匹と人1人が並んで座り、同じ夕日を見る。胸に小さな炎
  // 動き: 夕日の光が脈打ち、炎が揺れ、草がなびき、鳥が渡る
  const glow = 0.3 + Math.sin(f / 8) * 0.1;
  return (
    <Frame f={f} seed={932} dark>
      <defs>
        <linearGradient id="sky33" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5A3A52" />
          <stop offset="0.45" stopColor={C.duskDeep} />
          <stop offset="1" stopColor={C.duskOrange} />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={820} fill="url(#sky33)" />
      {/* 大きな夕日 */}
      <circle cx={1240} cy={430} r={320} fill={C.sun} opacity={glow} />
      <circle cx={1240} cy={430} r={236} fill={C.sun} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={C.fireGlow} strokeWidth={8} strokeLinecap="round" opacity={glow + 0.2}>
        <line x1={820} y1={430} x2={900} y2={430} />
        <line x1={1580} y1={430} x2={1660} y2={430} />
        <line x1={1240} y1={90} x2={1240} y2={160} />
      </g>
      {/* 渡り鳥 */}
      <g fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round"
        transform={`translate(${-f * 2.2} ${Math.sin(f / 9) * 6})`}>
        <path d="M 1660 200 Q 1680 184 1700 200 Q 1720 184 1740 200" />
        <path d="M 1760 250 Q 1776 238 1792 250 Q 1808 238 1824 250" />
      </g>
      {/* 丘のシルエット */}
      <path d="M -20 780 Q 300 606 760 618 Q 1240 632 1940 720 L 1940 1100 L -20 1100 Z"
        fill={C.treeDark} stroke={KRP.ink} strokeWidth={5} />
      <Acacia x={270} y={668} s={0.95} color={KRP.ink} />
      {/* 並んで夕日を見るヒヒと人 (シルエット) */}
      <Baboon x={700} y={632} s={1.0} pose="sit" silhouette f={f} phase={0} />
      <g transform={`translate(950 ${632 + Math.sin(f / 13 + 2) * 2.5})`} fill={KRP.ink}>
        {/* 体育座りの人 */}
        <path d="M -44 0 Q -58 -96 -16 -124 Q 16 -142 34 -112 L 42 -66 L 58 -60 Q 72 -54 68 -34 L 62 0 Z" />
        <circle cx={-8} cy={-156} r={30} />
        <path d="M 30 -104 Q 58 -92 56 -58" fill="none" stroke={KRP.ink} strokeWidth={13} strokeLinecap="round" />
      </g>
      {/* 胸の小さな炎 (同じ火) */}
      <FlameIcon x={736} y={560} s={0.52} t={seg(f, 16, 26)} f={f} />
      <FlameIcon x={968} y={548} s={0.52} t={seg(f, 16, 26)} f={f} />
      {/* 手前の草 (なびく) */}
      <g fill="none" stroke={C.bush} strokeWidth={7} strokeLinecap="round">
        {[90, 240, 420, 1560, 1700, 1850].map((gx, i) => (
          <g key={gx} transform={`translate(${gx} 1016)`}>
            <path d={`M 0 0 Q ${-10 + Math.sin(f / 8 + i) * 8} -52 ${-4 + Math.sin(f / 8 + i) * 12} -88`} />
            <path d={`M 18 0 Q ${16 + Math.sin(f / 8 + i + 1) * 8} -44 ${26 + Math.sin(f / 8 + i + 1) * 12} -70`} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ---- #34 図: 本能を野放しにしない工夫 ----
const S34: React.FC<{ f: number }> = ({ f }) => {
  // どこ: 夜の野営を真上から。たき火の明かりが届く円だけ明るく、外は夜の青
  // 演出: 大きな炎 (本能) を村人の輪がかこい、「けなし」(骨魚) の吹き出しが炎へ向く
  // 動き: 明かりの輪が脈打ち、骨魚の吹き出しが順に pop し、輪の村人が揺れる
  const folkColor = ["#8A5A3E", "#6E4A5A", "#5A6A4A"];
  const folk = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { px: 960 + Math.cos(a) * 580, py: 646 + Math.sin(a) * 185, front: Math.sin(a) > 0, a, i };
  });
  const jab = (bx: number, by: number, rot: number, d: number) => (
    <g key={bx} transform={`translate(${bx} ${by}) scale(${pop(seg(f, d, d + 8))})`}>
      <g transform={`rotate(${rot})`}>
        <polygon points="86,0 128,-16 128,16" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <circle cx={0} cy={0} r={64} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <BoneFish x={0} y={0} s={0.62} />
    </g>
  );
  return (
    <Frame f={f} seed={933} dark>
      <defs>
        <radialGradient id="pool34">
          <stop offset="0" stopColor={C.fireGlow} stopOpacity={0.75} />
          <stop offset="0.55" stopColor={C.duskDeep} stopOpacity={0.4} />
          <stop offset="1" stopColor={C.night} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 夜の地面 (外は青い闇) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightDeep} />
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.night} opacity={0.55} />
      {/* 星 */}
      <g fill={KRP.white}>
        {[[150, 120], [420, 70], [1510, 90], [1760, 180], [1860, 60], [90, 320], [1880, 420]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={3.5} opacity={0.3 + Math.abs(Math.sin(f / 9 + i * 2)) * 0.6} />
        ))}
      </g>
      {/* たき火の明かりが届く円 (脈打つ) */}
      <ellipse cx={960} cy={640} rx={700} ry={380} fill="url(#pool34)"
        opacity={0.78 + Math.sin(f / 7) * 0.12} />
      {/* 輪のしるし (地面の円) */}
      <ellipse cx={960} cy={646} rx={580} ry={185} fill="none" stroke={C.fireGlow}
        strokeWidth={10} strokeDasharray="34 24" opacity={0.5} />
      {/* 奥側の村人 (明かりに照らされる) */}
      {folk.filter((p) => !p.front).map((p) => (
        <g key={p.i}>
          <ellipse cx={p.px + Math.cos(p.a) * 26} cy={p.py + 4} rx={40} ry={9}
            fill={C.nightDeep} opacity={0.5} />
          <PersonMini x={p.px} y={p.py} s={0.62} color={folkColor[p.i % 3]} f={f} phase={p.i} />
        </g>
      ))}
      {/* 主役: 大きな炎 (本能) */}
      <ellipse cx={960} cy={710} rx={210} ry={26} fill={C.fireGlow} opacity={0.3 + Math.sin(f / 6) * 0.1} />
      <FlameIcon x={960} y={700} s={4.3} t={seg(f, 2, 12)} f={f} />
      {/* 手前側の村人 (炎より手前・影が外へ伸びる) */}
      {folk.filter((p) => p.front).map((p) => (
        <g key={p.i}>
          <ellipse cx={p.px + Math.cos(p.a) * 42} cy={p.py + 6} rx={56} ry={12}
            fill={C.nightDeep} opacity={0.55} />
          <PersonMini x={p.px} y={p.py} s={0.85} color={folkColor[p.i % 3]} f={f} phase={p.i} />
        </g>
      ))}
      {/* けなしの吹き出し (骨魚) が炎へ向く */}
      {jab(430, 400, 30, 16)}
      {jab(1490, 410, 150, 24)}
      {jab(700, 250, 62, 32)}
      <TagPlate x={300} y={210} text="むらの知恵" size={52} t={seg(f, 8, 18)} />
      {/* 札は村人の輪の外・右下の空きへ (頭上の被り解消) */}
      <TagPlate x={1680} y={770} text="かこいこむ" size={50} t={seg(f, 30, 40)} color={KRP.red} rot={3} />
    </Frame>
  );
};

// ---- #35 図: 工夫が外れて「制度」になる瞬間は? (次章へのヒキ) ----
const S35: React.FC<{ f: number }> = ({ f }) => {
  // どこ: #34 と同じ夜の俯瞰。囲いの輪の右側が開く
  // 演出: 輪が切れ、炎が赤い矢印になって切れ目を抜け、先に小さく光る巻物と筆、大きな？
  // 動き: 輪の2人が倒れて口が開き、矢印が伸び、巻物が光り、？が揺れる
  const open = easeOut(seg(f, 6, 18));
  const arrow = easeOut(seg(f, 14, 30));
  const folkColor = ["#8A5A3E", "#6E4A5A", "#5A6A4A"];
  const folk = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { px: 760 + Math.cos(a) * 480, py: 660 + Math.sin(a) * 160, front: Math.sin(a) > 0, a, i };
  }).filter((p) => !(p.i === 0 || p.i === 1 || p.i === 11)); // 右側が欠けて輪が開く
  const mini35 = (p: { px: number; py: number; a: number; i: number }, s: number) => (
    <g key={p.i}>
      <ellipse cx={p.px + Math.cos(p.a) * 30} cy={p.py + 5} rx={44} ry={10}
        fill={C.nightDeep} opacity={0.5} />
      <PersonMini x={p.px} y={p.py} s={s} color={folkColor[p.i % 3]} f={f} phase={p.i} />
    </g>
  );
  return (
    <Frame f={f} seed={934} dark>
      <defs>
        <radialGradient id="pool35">
          <stop offset="0" stopColor={C.fireGlow} stopOpacity={0.72} />
          <stop offset="0.55" stopColor={C.duskDeep} stopOpacity={0.4} />
          <stop offset="1" stopColor={C.night} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="scrollGlow35">
          <stop offset="0" stopColor={KRP.yellow} stopOpacity={0.55} />
          <stop offset="1" stopColor={KRP.yellow} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* #34 と同じ夜の地面と星 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.nightDeep} />
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.night} opacity={0.55} />
      <g fill={KRP.white}>
        {[[180, 110], [460, 60], [980, 90], [120, 340], [360, 880], [90, 600]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={3.5} opacity={0.3 + Math.abs(Math.sin(f / 9 + i * 2)) * 0.6} />
        ))}
      </g>
      <ellipse cx={760} cy={650} rx={620} ry={340} fill="url(#pool35)"
        opacity={0.75 + Math.sin(f / 7) * 0.12} />
      {/* 開いた輪 (右が切れている) */}
      <path d="M 1230 740 A 480 160 0 1 0 1226 574" fill="none" stroke={C.fireGlow}
        strokeWidth={10} strokeDasharray="34 24" opacity={0.5} />
      {folk.filter((p) => !p.front).map((p) => mini35(p, 0.6))}
      {/* 切れ目のへりの2人は倒れて輪が開く */}
      <g transform={`rotate(${-34 * open} 1226 560)`}>{mini35({ px: 1226, py: 560, a: -0.3, i: 20 }, 0.64)}</g>
      <g transform={`rotate(${38 * open} 1230 752)`}>{mini35({ px: 1230, py: 752, a: 0.3, i: 21 }, 0.85)}</g>
      {/* 炎 (外へかしぐ) */}
      <g transform={`rotate(${10 * arrow} 760 660)`}>
        <FlameIcon x={760} y={680} s={3.1} t={seg(f, 0, 8)} f={f} />
      </g>
      {folk.filter((p) => p.front).map((p) => mini35(p, 0.82))}
      {/* 炎が矢印に変わり、倒れた2人の間 (切れ目) を抜けて外へ */}
      <path d="M 880 600 Q 1150 640 1400 530" fill="none" stroke={KRP.red} strokeWidth={26}
        strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrow} />
      <polygon points="1448,508 1396,503 1417,551" fill={KRP.red} stroke={KRP.ink} strokeWidth={5}
        opacity={pop(seg(f, 26, 34))} />
      {/* 矢印の先: 小さく光る巻物と筆 (「制度」の気配) */}
      <circle cx={1596} cy={484} r={210} fill="url(#scrollGlow35)"
        opacity={pop(seg(f, 28, 38)) * (0.8 + Math.sin(f / 6) * 0.2)} />
      <g opacity={pop(seg(f, 28, 38))}>
        <rect x={1502} y={430} width={212} height={110} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1482} y={416} width={34} height={138} rx={16} fill={C.thatch} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1700} y={416} width={34} height={138} rx={16} fill={C.thatch} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
          <line x1={1540} y1={462} x2={1676} y2={462} />
          <line x1={1540} y1={488} x2={1676} y2={488} />
          <line x1={1540} y1={514} x2={1624} y2={514} />
        </g>
        {/* 筆 */}
        <g transform="translate(1736 582) rotate(-38)">
          <rect x={-8} y={-96} width={16} height={86} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -9 -10 Q 0 24 9 -10 Z" fill={KRP.ink} />
        </g>
        {/* 巻物のまわりの小さなきらめき */}
        {[[1470, 380, 30], [1750, 360, 36], [1460, 560, 40]].map(([kx, ky, d], i) => (
          <g key={i} transform={`translate(${kx} ${ky}) scale(${pop(seg(f, d as number, (d as number) + 8))})`}
            stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
            <line x1={-14} y1={0} x2={14} y2={0} />
            <line x1={0} y1={-14} x2={0} y2={14} />
          </g>
        ))}
      </g>
      <QMark x={1620} y={250} s={1.6} f={f} t={seg(f, 34, 42)} />
      {/* 札は村人と巻物を避けて下の空きへ */}
      <TagPlate x={1540} y={680} text="せいど?" size={54} t={seg(f, 36, 42)} color={KRP.red} rot={-3} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib1_shou_tobira:      (f) => <S21 f={f} />,
  ib1_tokei_makimodoshi:(f) => <S22 f={f} />,
  ib1_juhoansi:         (f) => <S23 f={f} />,
  ib1_karyudo_kaeru:    (f) => <S24 f={f} />,
  ib1_yaseta_emono:     (f) => <S25 f={f} />,
  ib1_waza_to_kenasu:   (f) => <S26 f={f} />,
  ib1_hikaeme_sahou:    (f) => <S27 f={f} />,
  ib1_kuuki_kowareru:   (f) => <S28 f={f} />,
  ib1_hatsumei_denai:   (f) => <S29 f={f} />,
  ib1_hihi_joretsu:     (f) => <S30 f={f} />,
  ib1_stress_hikui:     (f) => <S31 f={f} />,
  ib1_stress_boss:      (f) => <S32 f={f} />,
  ib1_savanna_honnou:   (f) => <S33 f={f} />,
  ib1_kufuu:            (f) => <S34 f={f} />,
  ib1_seido_no_shunkan: (f) => <S35 f={f} />,
};

export const I_B1_MOTIFS: string[] = [
  "ib1_shou_tobira",       // #21 第1章、獲物を、けなす。
  "ib1_tokei_makimodoshi", // #22 時計を思いきり巻き戻して、狩りで暮らす人々の世界へ行きます。
  "ib1_juhoansi",          // #23 アフリカ南部の狩猟採集民、ジュホアンシの人々には、有名な習慣があります。
  "ib1_karyudo_kaeru",     // #24 大きな獲物を仕留めた狩人が帰ってくると、仲間はこう言うのです。
  "ib1_yaseta_emono",      // #25 「なんだ、こんな痩せた獲物か」。
  "ib1_waza_to_kenasu",    // #26 見事な獲物であるほど、わざと、けなします。
  "ib1_hikaeme_sahou",     // #27 狩人本人も「大したものじゃないよ」と控えめに振る舞うのが作法です。
  "ib1_kuuki_kowareru",    // #28 腕自慢がいばり始めると群れの空気が壊れることを、よく知っていたのですね。
  "ib1_hatsumei_denai",    // #29 一方で、勝ちたい気持ちそのものは、人間の発明ではありません。
  "ib1_hihi_joretsu",      // #30 ヒヒの群れには、はっきりした序列があります。
  "ib1_stress_hikui",      // #31 順位が低いヒヒは、ストレスホルモンの値が高いことがわかっています。
  "ib1_stress_boss",       // #32 ではトップは安泰かというと、地位が揺らいでいる時期のボスも、やはり値が高いのです。
  "ib1_savanna_honnou",    // #33 上を目指す本能と、その苦しさは、サバンナの時代からあったわけです。
  "ib1_kufuu",             // #34 人類は長いあいだ、その本能を野放しにしない工夫をしてきました。
  "ib1_seido_no_shunkan",  // #35 では、その工夫が外れて、順位が「制度」になった瞬間はどこでしょうか。
];

export const ichiB1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B1_PREVIEW_FRAMES = Math.max(I_B1_MOTIFS.length, 1);
export const IchiB1Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B1_MOTIFS.length - 1);
  return <>{ichiB1Scene(I_B1_MOTIFS[i] ?? "", 45)}</>;
};
