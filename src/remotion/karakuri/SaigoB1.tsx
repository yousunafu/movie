// 「人類は、昔から飛ばして観ていた」: 文#26〜#37 (12文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1025〜1036。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 共有装置 (Danmen/Tehaisho/SaiseiBar/NenpyoEmaki/Fuda3) は設計書で指定された文でだけ使う

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor,
} from "./SaigoShared";
import { Danmen, Tehaisho, SaiseiBar, NenpyoEmaki, Fuda3, SGP } from "./SaigoParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/SGP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 空
  yoakeUe: "#242B47",     // 夜明け前の空 (上)
  yoakeShita: "#4E4E70",  // 夜明け前の空 (下)
  akatsuki: "#D98A5C",    // 地平の暁の帯
  asaSora: "#CFE0EA",     // 朝の空
  yuSora: "#E08A4E",      // 夕焼けの空
  yuFukai: "#A8543A",     // 夕焼けの深い所
  yuKumo: "#F2C27A",      // 夕焼けの雲
  // 建物・素材
  kawara: "#5E6670",      // 瓦
  kawaraHi: "#8B93A0",    // 瓦の光る面
  kiji: "#C89B62",        // 白木
  kijiDark: "#A87F4C",    // 白木の陰
  kijiFukai: "#7E5E38",   // 古い木
  hinoki: "#E6D3A8",      // 舞台の床
  tatami: "#C9C083",      // 畳
  tatamiFuchi: "#44506A", // 畳の縁
  noren: "#3E4E6E",       // 紺のれん
  shoji: "#F6EFDC",       // 障子紙
  kabe: "#E8DEC2",        // 土壁
  // 定式幕
  makuKuro: "#36342E",
  makuKaki: "#C06A3A",
  makuMoegi: "#5E7A4A",
  // 食べ物
  meshi: "#FAF6EA",       // 酢飯
  maguro: "#C85A48",
  tamago: "#EBC95C",
  kyuri: "#79A050",
  mikan: "#E89A3C",
  kuri: "#9A6A3E",        // 栗菓子・茶
  anko: "#6E4A52",        // 餡
  urushi: "#50342E",      // 漆の弁当箱
  // 光
  hikari: "#F6DE9C",      // 日の光の帯
  akari: "#F2DCA0",       // 提灯の明かり
  honoo: "#E8B05C",       // 炎
  // 役者の扮装 (歌舞伎)
  shu: "#C2402E",         // 濃い朱 (衣装・隈取)
  shuFukai: "#9A2E22",
  ai: "#2F4A74",          // 藍
  aiFukai: "#1F3454",
  kincha: "#C08A32",      // 金茶 (帯・扇)
  // 江戸の芝居町 (#37)
  hiruSora: "#A9CCE3",    // 昼の空
  hiruSoraShita: "#CFE3EF", // 地平ぎわの薄い空
  kumo: "#F7F4EC",        // 薄い雲
  tsuchi: "#C2A477",      // 土の道
  tsuchiAkari: "#D2B789",  // 日の当たる土
  tsuchiKage: "#A4855A",  // わだちの影
  tsuchiNure: "#8E7549",  // 打ち水で濡れた土
  mizu: "#9EB4B8",        // 水たまり
  sugikawa: "#6E5B42",    // 杉皮葺きの屋根
  sugikawaHi: "#8A7354",
  itakabe: "#C49C6C",     // 縦板張りの壁
  itakabeKage: "#A57E4E",
  midori: "#6E8E5E",      // 庭木の緑
  midoriHi: "#8CA874",
  toomi: "#9AA8A0",       // 遠景の町 (空気遠近)
} as const;
void useCurrentFrame;
void Stamp; void QMark;
void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;

// ===== 小さな数学ヘルパー =====
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 決まった見た目にするための擬似乱数 (レンダのたびに変わらない)
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
// 極座標 (和時計・太陽の弧に使う)。deg=0 が真上、時計回り
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

// ===== この巻だけの小道具 (江戸の芝居町セット) ==========================

// 提灯。lit で光る。f でゆらゆら+明かりの揺れ
const Chochin: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number; lit?: boolean;
}> = ({ x, y, s = 1, f = 0, phase = 0, lit = true }) => {
  const sway = Math.sin((f + phase * 23) / 16) * 3;
  const glow = lit ? 0.5 + 0.22 * Math.sin((f + phase * 31) / 7) : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${s})`}>
      {lit && <circle cx={0} cy={56} r={74} fill={C.akari} opacity={glow * 0.5} />}
      <line x1={0} y1={0} x2={0} y2={14} stroke={C.ink} strokeWidth={5} />
      <rect x={-20} y={10} width={40} height={10} rx={4} fill={C.kijiDark} stroke={C.ink} strokeWidth={4} />
      <ellipse cx={0} cy={56} rx={34} ry={40} fill={lit ? C.akari : C.shoji} stroke={C.ink} strokeWidth={5} />
      <g stroke={C.ink} strokeWidth={2.5} fill="none" opacity={0.55}>
        <path d="M -33 40 q 33 -10 66 0" />
        <path d="M -34 56 q 34 -10 68 0" />
        <path d="M -33 72 q 33 -10 66 0" />
      </g>
      <rect x={-20} y={92} width={40} height={10} rx={4} fill={C.kijiDark} stroke={C.ink} strokeWidth={4} />
      <circle cx={0} cy={56} r={9} fill={C.maguro} opacity={0.8} />
    </g>
  );
};

// 幟 (のぼり)。f ではためく。紋は丸
const Nobori: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number; color?: string;
}> = ({ x, y, s = 1, f = 0, phase = 0, color = "#B8543E" }) => {
  const w1 = Math.sin((f + phase * 19) / 9) * 10;
  const w2 = Math.sin((f + phase * 19) / 9 + 1.4) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1={0} y1={0} x2={0} y2={-430} stroke={C.kijiFukai} strokeWidth={10} />
      <line x1={0} y1={-430} x2={96} y2={-430} stroke={C.kijiFukai} strokeWidth={8} />
      <path d={`M 10 -424 L 92 -424 Q ${94 + w1} -300 ${90 + w2} -180 L ${86 + w2} -70
               Q ${50 + w2 / 2} -84 ${12 + w1 / 2} -70 Z`}
        fill={color} stroke={C.ink} strokeWidth={5} />
      <circle cx={51 + w1 * 0.6} cy={-350} r={26} fill={KRP.white} stroke={C.ink} strokeWidth={4} opacity={0.92} />
      <circle cx={51 + w2 * 0.6} cy={-210} r={18} fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.85} />
    </g>
  );
};

// 櫓 (やぐら)。小屋の屋根の上の四角い箱+梯子紋様
const Yagura: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-150} width={140} height={150} fill={C.kijiDark} stroke={C.ink} strokeWidth={6} />
    <g stroke={C.ink} strokeWidth={4} opacity={0.65}>
      <line x1={-70} y1={-112} x2={70} y2={-112} />
      <line x1={-70} y1={-74} x2={70} y2={-74} />
      <line x1={-70} y1={-36} x2={70} y2={-36} />
      <line x1={-35} y1={-150} x2={-35} y2={0} />
      <line x1={35} y1={-150} x2={35} y2={0} />
    </g>
    <rect x={-84} y={-166} width={168} height={20} rx={5} fill={C.kawara} stroke={C.ink} strokeWidth={5} />
    {/* 梵天 (両脇の飾り槍) */}
    <line x1={-56} y1={-166} x2={-56} y2={-226} stroke={C.ink} strokeWidth={5} />
    <line x1={56} y1={-166} x2={56} y2={-226} stroke={C.ink} strokeWidth={5} />
    <circle cx={-56} cy={-232} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
    <circle cx={56} cy={-232} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
  </g>
);

// 寿司桶。中に酢飯+ねたの扇形盛り
const SushiOke: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={96} ry={34} fill={C.kiji} stroke={C.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-10} rx={96} ry={32} fill={C.kijiDark} stroke={C.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-10} rx={80} ry={24} fill={C.meshi} stroke={C.ink} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => {
        const a = -150 + i * 60;
        const [px, py] = polar(0, -10, 44, a + 90);
        const neta = [C.maguro, C.tamago, C.kyuri, C.maguro, C.meshi, C.tamago][i];
        return (
          <g key={i} transform={`translate(${px} ${py * 0.42 - 6}) rotate(${a * 0.2})`}>
            <ellipse cx={0} cy={5} rx={20} ry={9} fill={C.meshi} stroke={C.ink} strokeWidth={3} />
            <rect x={-19} y={-7} width={38} height={12} rx={5} fill={neta} stroke={C.ink} strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );

// 弁当箱 (漆の重。開いていて中身が見える)
const BentoBox: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-64} y={-26} width={128} height={44} rx={8} fill={C.urushi} stroke={C.ink} strokeWidth={5} />
      <rect x={-58} y={-34} width={112} height={18} rx={6} fill="#6E4A40" stroke={C.ink} strokeWidth={4} />
      {/* 中身 */}
      <ellipse cx={-30} cy={-30} rx={14} ry={8} fill={C.meshi} stroke={C.ink} strokeWidth={3} />
      <ellipse cx={-6} cy={-32} rx={12} ry={7} fill={C.meshi} stroke={C.ink} strokeWidth={3} />
      <rect x={10} y={-38} width={20} height={12} rx={3} fill={C.tamago} stroke={C.ink} strokeWidth={3} />
      <circle cx={42} cy={-31} r={8} fill={C.kyuri} stroke={C.ink} strokeWidth={3} />
      <circle cx={-44} cy={-36} r={5} fill={C.anko} stroke={C.ink} strokeWidth={2.5} />
    </g>
  );

// 菓子箱 (紐かけ)。積める
const KashiBako: React.FC<{ x: number; y: number; s?: number; color?: string; rot?: number }> =
  ({ x, y, s = 1, color = "#D98A94", rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-52} y={-40} width={104} height={40} rx={6} fill={color} stroke={C.ink} strokeWidth={5} />
      <line x1={0} y1={-40} x2={0} y2={0} stroke={C.ink} strokeWidth={4} opacity={0.8} />
      <line x1={-52} y1={-20} x2={52} y2={-20} stroke={C.ink} strokeWidth={4} opacity={0.8} />
      <circle cx={0} cy={-20} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
    </g>
  );

// 徳利とお猪口
const Tokkuri: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -16 0 Q -24 -14 -17 -30 Q -8 -42 -8 -52 L 8 -52 Q 8 -42 17 -30 Q 24 -14 16 0 Z"
      fill={C.shoji} stroke={C.ink} strokeWidth={4.5} />
    <rect x={-9} y={-60} width={18} height={10} rx={3} fill={C.shoji} stroke={C.ink} strokeWidth={4} />
    <path d="M 28 0 L 24 -14 L 48 -14 L 44 0 Z" fill={C.shoji} stroke={C.ink} strokeWidth={4} />
  </g>
);

// 下駄 (1足。横から)
const Geta: React.FC<{ x: number; y: number; s?: number; rot?: number }> =
  ({ x, y, s = 1, rot = 0 }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-34} y={-12} width={68} height={12} rx={4} fill={C.kiji} stroke={C.ink} strokeWidth={4} />
      <rect x={-26} y={0} width={10} height={12} fill={C.kijiDark} stroke={C.ink} strokeWidth={3.5} />
      <rect x={16} y={0} width={10} height={12} fill={C.kijiDark} stroke={C.ink} strokeWidth={3.5} />
      <path d="M -6 -12 Q -6 -22 -18 -24 M -6 -12 Q -6 -22 8 -24"
        fill="none" stroke={C.ink} strokeWidth={3.5} />
    </g>
  );

// 和時計の文字盤 (丸盤+刻み+芝居の帯+針)。#30/#31/#32/#33 で使い回す
// needleDeg: 針の向き (0=真上)。band で「芝居」の帯 (明け六つ→暮れ七つ半) を出す
const WadokeiFace: React.FC<{
  x: number; y: number; r: number; needleDeg: number; band?: boolean; bandT?: number;
}> = ({ x, y, r, needleDeg, band = false, bandT = 1 }) => {
  // 24時間=360°、真下が九つ (夜中)。明け六つ(朝6時)=左、暮れ七つ半(夕5時)=右上寄り
  const a0 = 270; // 朝6時
  const a1 = 270 + 165 * clamp01(bandT); // 夕5時 (11時間ぶん)
  const [nx, ny] = polar(0, 0, r * 0.62, needleDeg);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 1.14} fill={C.kijiFukai} stroke={C.ink} strokeWidth={6} />
      <circle r={r} fill={C.shoji} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => {
        const [x0, y0] = polar(0, 0, r * 0.88, i * 30);
        const [x1, y1] = polar(0, 0, r, i * 30);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.ink} strokeWidth={i % 3 === 0 ? 5 : 3} />;
      })}
      {band && bandT > 0.01 && (
        <path d={arcPath(0, 0, r * 0.72, a0, a1)} fill="none"
          stroke={KRP.orange} strokeWidth={r * 0.2} strokeLinecap="round" opacity={0.9} />
      )}
      <line x1={0} y1={0} x2={nx} y2={ny} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <circle r={r * 0.08} fill={C.ink} />
    </g>
  );
};

// 湯気 (弁当・茶から)
const Yuge: React.FC<{ x: number; y: number; f: number; s?: number; n?: number }> =
  ({ x, y, f, s = 1, n = 2 }) => (
    <g opacity={0.6}>
      {Array.from({ length: n }, (_, i) => {
        const p = ((f + i * 16) % 36) / 36;
        return (
          <path key={i}
            d={`M ${x + i * 20 - 10} ${y - p * 50 * s} q ${8 * s} ${-9 * s} 0 ${-18 * s} q ${-8 * s} ${-9 * s} 0 ${-18 * s}`}
            fill="none" stroke={KRP.grayDark} strokeWidth={4 * s} strokeLinecap="round"
            opacity={(1 - p) * 0.8} />
        );
      })}
    </g>
  );

// ===== 人物に重ねる物の入れ物 ========================================
// Person とまったく同じ変換をかけた <g>。この中では「頭の丸 cx=0 cy=-228 r=64」
// 「肩 (±67,-148)」「胴体 -58..58 / -160..-52」が人物ローカル座標でそのまま使える。
// f / phase / still / lean は人物に渡したものと同じ値を渡すこと (傾いても外れない)。
const PersonRig: React.FC<{
  x: number; y: number; s?: number; lean?: number;
  f?: number; phase?: number; still?: boolean; children?: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f = 0, phase = 0, still = false, children }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

// ===== 歌舞伎の役者 (舞台に立つ人はこれを使う) ========================
// 共通部品の Person をそのまま芯にして、袖・裾・隈取・鬘だけを足す。
// 層は3枚: ①袖と裾 (人物より奥) → ②Person → ③帯・隈取・鬘・扇 (人物より前)。
// 腕は Person のものがそのまま前に出る (袖に隠れない)。
type YakushaPose = "stand" | "banzai" | "raise" | "point" | "hold";
const KabukiYakusha: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; still?: boolean; lean?: number;
  pose?: YakushaPose; pointDir?: 1 | -1;
  face?: "normal" | "angry" | "surprised" | "smile";
  gaze?: [number, number];
  iro?: string; iroDark?: string;      // 衣装の色 (濃い朱・藍・金茶)
  gara?: "koushi" | "shima";           // 大きな格子 / 太い縞
  mie?: boolean;                       // 見得 (片足を踏み出す)
  ogi?: boolean;                       // 扇を持つ
  mieDir?: 1 | -1;                     // 踏み出す足の向き
}> = ({
  x, y, s = 1, f, phase = 0, still = false, lean = 0,
  pose = "stand", pointDir = 1, face = "angry", gaze = [0, 0],
  iro = C.shu, iroDark = C.shuFukai, gara = "koushi",
  mie = false, ogi = false, mieDir = 1,
}) => {
  const rig = { x, y, s, lean, f, phase, still };
  const sway = Math.sin((f + phase * 13) / 11) * 4;   // 布のゆれ
  const armUp = pose === "banzai";
  // 模様 (袖と裾に同じものを1種類だけ)
  const gLine = (x1: number, y1: number, x2: number, y2: number, k: number) => (
    <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.white} strokeWidth={7} opacity={0.5} />
  );
  return (
    <>
      {/* ① 人物より奥: 袖と裾 */}
      <PersonRig {...rig}>
        {/* 裾 (ゆったり広がる長着の下半分) */}
        <path d={`M -62 -108 L 62 -108 Q ${86 + sway * 0.4} -56 ${94 + sway} -14
                  Q 0 2 ${-94 + sway} -14 Q ${-86 + sway * 0.4} -56 -62 -108 Z`}
          fill={iro} stroke={C.ink} strokeWidth={6} />
        <g>
          {gara === "koushi" ? (
            <>
              {gLine(-70, -74, 72, -74, 0)}
              {gLine(-84 + sway * 0.6, -36, 86 + sway * 0.6, -36, 1)}
              {gLine(-24, -108, -34 + sway * 0.8, -10, 2)}
              {gLine(26, -108, 38 + sway * 0.8, -10, 3)}
            </>
          ) : (
            <>
              {gLine(-34, -108, -46 + sway * 0.8, -10, 0)}
              {gLine(0, -108, 2 + sway * 0.8, -10, 1)}
              {gLine(34, -108, 50 + sway * 0.8, -10, 2)}
            </>
          )}
        </g>
        {/* 袖 (肩から大きく垂れる。腕を上げたポーズでは手から垂らす) */}
        {([-1, 1] as const).map((side) => {
          // 腕を上げたとき (banzai) の手の位置は肩から (∓58,-58)
          const hx = armUp ? side * 125 : side * 92;
          const hy = armUp ? -206 : -158;
          const w = armUp ? 34 : 46;
          const dropTo = armUp ? -86 : -30;
          return (
            <g key={side}>
              <path d={`M ${side * 58} ${armUp ? -176 : -164}
                        L ${hx - side * w * 0.2} ${hy - 10}
                        L ${hx + side * w} ${hy + 6}
                        Q ${hx + side * (w + 8) + sway} ${(hy + dropTo) / 2} ${hx + side * (w + 4) + sway * 1.6} ${dropTo}
                        Q ${hx - side * 4 + sway} ${dropTo + 22} ${hx - side * (w - 6) + sway * 0.6} ${dropTo + 4}
                        L ${side * 50} ${armUp ? -150 : -104} Z`}
                fill={iro} stroke={C.ink} strokeWidth={6} />
              {/* 袖の模様 */}
              <line x1={hx - side * w * 0.3} y1={(hy + dropTo) / 2 - 6}
                x2={hx + side * (w + 4) + sway * 0.8} y2={(hy + dropTo) / 2 + 2}
                stroke={KRP.white} strokeWidth={7} opacity={0.5} />
              {/* 袖口の濃い縁 */}
              <path d={`M ${hx - side * (w - 6) + sway * 0.6} ${dropTo + 4}
                        Q ${hx - side * 4 + sway} ${dropTo + 22} ${hx + side * (w + 4) + sway * 1.6} ${dropTo}`}
                fill="none" stroke={iroDark} strokeWidth={9} />
            </g>
          );
        })}
      </PersonRig>

      {/* ② 芯の人物 (画風はいじらない) */}
      <Person x={x} y={y} s={s} lean={lean} f={f} phase={phase} still={still}
        cloth={iro} clothDark={iroDark} face={face} gaze={gaze}
        pose={pose} pointDir={pointDir} />

      {/* ③ 人物より前: 帯・踏み出した足・隈取・鬘・扇 */}
      <PersonRig {...rig}>
        {/* 帯 (金茶。胴体の下ぎわ) */}
        <rect x={-60} y={-98} width={120} height={28} rx={6}
          fill={C.kincha} stroke={C.ink} strokeWidth={5} />
        <rect x={-18} y={-104} width={38} height={40} rx={7}
          fill={C.kincha} stroke={C.ink} strokeWidth={5} />
        {/* 見得: 片足を踏み出し、足袋がのぞく */}
        {mie && (
          <g>
            <path d={`M ${mieDir * 10} -96 L ${mieDir * 96} -40 L ${mieDir * 120} -4 L ${mieDir * 40} -6 Z`}
              fill={iroDark} stroke={C.ink} strokeWidth={6} />
            <ellipse cx={mieDir * 126} cy={-6} rx={32} ry={14}
              fill={C.shoji} stroke={C.ink} strokeWidth={5} />
            <line x1={mieDir * 112} y1={-14} x2={mieDir * 112} y2={2} stroke={C.ink} strokeWidth={4} />
          </g>
        )}
        {/* 隈取 (くまどり): 朱の太い筋。目と口にはかからない */}
        <g fill="none" stroke={C.shu} strokeWidth={5} strokeLinecap="round">
          <path d="M -52 -268 q 12 24 2 50" />
          <path d="M 52 -268 q -12 24 -2 50" />
          <path d="M -50 -200 q 14 -8 22 -18" />
          <path d="M 50 -200 q -14 -8 -22 -18" />
        </g>
        {/* 鬘 (かつら): 生え際をはっきり・鬢を張らせ・髷を高く */}
        <g fill={C.ink}>
          <path d="M -63 -244 Q -88 -250 -83 -220 Q -70 -214 -57 -228 Z" />
          <path d="M 63 -244 Q 88 -250 83 -220 Q 70 -214 57 -228 Z" />
          <path d="M -64 -240 Q -68 -300 0 -302 Q 68 -300 64 -240 Q 32 -266 0 -266 Q -32 -266 -64 -240 Z" />
          <rect x={-12} y={-316} width={24} height={18} rx={6} />
          <path d="M -4 -310 Q 44 -328 68 -308 Q 46 -294 -2 -298 Z" stroke={C.ink} strokeWidth={4} />
        </g>
        <line x1={-10} y1={-310} x2={14} y2={-304} stroke={C.shu} strokeWidth={5} strokeLinecap="round" />
        {/* 扇 (持たせるとき。手元は hold の y≈-118) */}
        {ogi && (
          <g transform={`translate(26 -126) rotate(${-24 + sway})`}>
            <path d="M 0 0 L 96 -40 A 104 104 0 0 1 104 24 Z"
              fill={C.kincha} stroke={C.ink} strokeWidth={5} />
            <g stroke={C.ink} strokeWidth={3.5} opacity={0.7}>
              <line x1={6} y1={-2} x2={96} y2={-28} />
              <line x1={8} y1={6} x2={102} y2={2} />
            </g>
            <circle cx={2} cy={2} r={8} fill={C.ink} />
          </g>
        )}
      </PersonRig>
    </>
  );
};

// ===== #37 の芝居町の建物に使う物 ====================================

// 櫓 (やぐら) を正面から。木の枠に幕が張られ、定紋 (丸と菱) が入る
const YaguraB: React.FC<{ x: number; y: number; s?: number; f?: number }> =
  ({ x, y, s = 1, f = 0 }) => {
    const w = Math.sin(f / 10) * 3;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* 組んだ木の枠 */}
        <g stroke={C.ink} strokeWidth={8} fill={C.kijiFukai}>
          <rect x={-96} y={-140} width={14} height={140} />
          <rect x={82} y={-140} width={14} height={140} />
        </g>
        <rect x={-108} y={-156} width={216} height={20} rx={5}
          fill={C.sugikawaHi} stroke={C.ink} strokeWidth={6} />
        {/* 張られた幕 (風でわずかに波打つ) */}
        <path d={`M -84 -136 L 84 -136 L ${84 + w} -16 L ${-84 + w} -16 Z`}
          fill={C.makuKuro} stroke={C.ink} strokeWidth={6} />
        {/* 定紋 (丸に菱。実在の座の紋ではない抽象形) */}
        <circle cx={-42 + w * 0.5} cy={-78} r={28} fill={C.shoji} stroke={C.ink} strokeWidth={5} />
        <path d={`M ${-42 + w * 0.5} -98 L ${-26 + w * 0.5} -78 L ${-42 + w * 0.5} -58 L ${-58 + w * 0.5} -78 Z`}
          fill={C.ink} />
        <circle cx={44 + w * 0.5} cy={-78} r={28} fill={C.shoji} stroke={C.ink} strokeWidth={5} />
        <circle cx={44 + w * 0.5} cy={-78} r={13} fill="none" stroke={C.ink} strokeWidth={7} />
        {/* 梵天 (両脇の飾り) */}
        <line x1={-78} y1={-156} x2={-78} y2={-212} stroke={C.ink} strokeWidth={6} />
        <line x1={78} y1={-156} x2={78} y2={-212} stroke={C.ink} strokeWidth={6} />
        <circle cx={-78} cy={-220} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <circle cx={78} cy={-220} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      </g>
    );
  };

// 軒行灯 (のきあんどん)。四角い箱の明かり。印は丸だけ (屋号の字は書かない)
const NokiAndon: React.FC<{ x: number; y: number; s?: number; f?: number; phase?: number }> =
  ({ x, y, s = 1, f = 0, phase = 0 }) => {
    const glow = 0.5 + 0.18 * Math.sin((f + phase * 29) / 8);
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <circle cx={0} cy={38} r={58} fill={C.akari} opacity={glow * 0.4} />
        <line x1={0} y1={0} x2={0} y2={10} stroke={C.ink} strokeWidth={5} />
        <rect x={-30} y={10} width={60} height={72} rx={5}
          fill={C.akari} stroke={C.ink} strokeWidth={6} />
        <rect x={-36} y={4} width={72} height={12} rx={4}
          fill={C.kijiFukai} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={46} r={15} fill="none" stroke={C.ink} strokeWidth={5} opacity={0.8} />
      </g>
    );
  };

// 羽織と刀。身分の高い客の Person に重ねる (PersonRig の中で使う)
const HaoriKatana: React.FC<{ iro?: string; iroDark?: string; katana?: boolean }> =
  ({ iro = "#3A4A62", iroDark = "#283548", katana = true }) => (
    <g>
      {/* 羽織 (肩から膝まで。前が開いている) */}
      <path d="M -62 -166 L -104 -148 L -112 -40 L -66 -36 L -58 -120 Z"
        fill={iro} stroke={C.ink} strokeWidth={6} />
      <path d="M 62 -166 L 104 -148 L 112 -40 L 66 -36 L 58 -120 Z"
        fill={iro} stroke={C.ink} strokeWidth={6} />
      <path d="M -58 -166 L 58 -166 L 46 -132 L 0 -118 L -46 -132 Z"
        fill={iroDark} stroke={C.ink} strokeWidth={5} />
      {/* 背の紋 (丸) */}
      <circle cx={-86} cy={-108} r={13} fill={KRP.white} stroke={C.ink} strokeWidth={4} opacity={0.9} />
      {/* 刀 (腰に差す。柄が前へ) */}
      {katana && (
        <g transform="rotate(-16)">
          <path d="M -86 -86 L 70 -104 L 74 -92 L -86 -74 Z" fill={C.shoji} stroke={C.ink} strokeWidth={5} />
          <rect x={-130} y={-92} width={48} height={16} rx={6} fill={C.ink} />
          <circle cx={-78} cy={-84} r={11} fill={C.kincha} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #26 第1章、芝居は、朝六時から。
// 格: 山 / seed 1025
// 絵: 章扉。夜明け前の江戸の芝居町。櫓、幟、提灯、木戸口に並ぶ客の息が白い
// どこ: 夜明け前の江戸の芝居町の通り。右に小屋の正面、左に章の題字
// 演出: 空は藍→暁の帯。櫓と幟が黒く立ち、木戸口の提灯だけが灯る。並ぶ客の息が白い
// 動き: 星の瞬き・提灯の明かりの揺れ・幟のはためき・白い息が繰り返し立ちのぼる
const Sg026: React.FC<{ f: number }> = ({ f }) => {
  const doorT = seg(f, 10, 30);
  return (
    <Frame f={f} seed={1025} dark bg={C.yoakeUe}
      over={<ChapterDoor num={1} title="芝居は 朝六時から" t={doorT} left={110} top={260} width={620} />}>
      {/* 空: 藍から暁へ */}
      <rect x={-20} y={-20} width={W + 40} height={520} fill={C.yoakeUe} />
      <rect x={-20} y={440} width={W + 40} height={260} fill={C.yoakeShita} />
      <rect x={-20} y={620} width={W + 40} height={130} fill={C.akatsuki} opacity={0.75} />
      <ellipse cx={1050} cy={740} rx={900} ry={150} fill={C.akatsuki} opacity={0.4} />
      {/* 残る星 */}
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={rnd(1, i) * 1900} cy={rnd(2, i) * 420}
          r={1.6 + rnd(3, i) * 2.2} fill={KRP.white}
          opacity={(0.25 + 0.55 * Math.sin(f / 11 + i * 2.1)) * (1 - rnd(2, i) * 0.6)} />
      ))}
      {/* 細い月 */}
      <g transform="translate(330 150)">
        <circle r={44} fill="#F0E6C0" opacity={0.9} />
        <circle cx={-20} cy={-10} r={40} fill={C.yoakeUe} />
      </g>
      {/* 遠景: 江戸の低い瓦屋根の連なり (影) */}
      <g opacity={0.85}>
        {Array.from({ length: 14 }, (_, i) => {
          const x = i * 150 - 80;
          const h = 60 + rnd(4, i) * 70;
          return (
            <g key={i}>
              <rect x={x} y={746 - h} width={140} height={h} fill="#333A52" stroke={C.ink} strokeWidth={3} />
              <path d={`M ${x - 12} ${746 - h} L ${x + 70} ${746 - h - 34} L ${x + 152} ${746 - h} Z`}
                fill="#2A3048" stroke={C.ink} strokeWidth={3} />
            </g>
          );
        })}
      </g>
      {/* 通り (地面) */}
      <rect x={-20} y={746} width={W + 40} height={360} fill="#4A4458" />
      <ellipse cx={1250} cy={930} rx={720} ry={110} fill="#565064" opacity={0.8} />
      <g stroke="#3A3448" strokeWidth={4} opacity={0.7}>
        <path d="M 540 1080 Q 900 880 1920 820" fill="none" />
        <path d="M 300 1080 Q 820 900 1920 870" fill="none" />
      </g>
      {/* 小屋の正面 (右)。まだ夜色に沈む */}
      <g>
        <rect x={1050} y={330} width={880} height={430} fill="#3E4258" stroke={C.ink} strokeWidth={8} />
        <path d="M 1010 330 L 1490 212 L 1950 330 Z" fill="#32364A" stroke={C.ink} strokeWidth={8} />
        <Yagura x={1490} y={238} s={0.9} />
        {/* 絵看板の列 (影) */}
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={1096 + i * 210} y={370} width={180} height={120} rx={6}
            fill="#4E5268" stroke={C.ink} strokeWidth={5} />
        ))}
        {/* 木戸口: ここだけ提灯で明るい */}
        <rect x={1270} y={540} width={300} height={220} fill="#2E3246" stroke={C.ink} strokeWidth={7} />
        <ellipse cx={1420} cy={660} rx={230} ry={120} fill={C.akari} opacity={0.14 + 0.05 * Math.sin(f / 8)} />
        <rect x={1270} y={540} width={300} height={64} fill={C.noren} stroke={C.ink} strokeWidth={5} />
        <g stroke={C.ink} strokeWidth={4}>
          <line x1={1345} y1={540} x2={1345} y2={604} />
          <line x1={1420} y1={540} x2={1420} y2={604} />
          <line x1={1495} y1={540} x2={1495} y2={604} />
        </g>
        <Chochin x={1240} y={500} s={0.9} f={f} phase={0} />
        <Chochin x={1600} y={500} s={0.9} f={f} phase={1} />
        <Chochin x={1420} y={470} s={1.05} f={f} phase={2} />
      </g>
      {/* 幟の列 (左寄り。暁を背に黒く) */}
      <Nobori x={880} y={760} s={1.05} f={f} phase={0} color="#8E4438" />
      <Nobori x={1000} y={756} s={0.92} f={f} phase={1} color="#3E5E7E" />
      <Nobori x={760} y={764} s={0.8} f={f} phase={2} color="#8E4438" />
      {/* 木戸口に並ぶ客の列。息が白い */}
      {Array.from({ length: 7 }, (_, i) => {
        const px = 1340 - i * 118;
        const py = 806 + i * 26;
        const sc = 0.78 + i * 0.045;
        const breath = ((f + i * 14) % 44) / 44;
        return (
          <g key={i}>
            <PersonMini x={px} y={py} s={sc}
              color={["#5E6680", "#6E5E70", "#566072", "#6A6678"][i % 4]}
              f={f} phase={i} face={i < 2 ? "smile" : "dot"} />
            {/* 白い息 */}
            <ellipse cx={px + 40 + breath * 36} cy={py - 150 * sc - breath * 26}
              rx={14 + breath * 16} ry={9 + breath * 9}
              fill={KRP.white} opacity={(1 - breath) * 0.55} />
          </g>
        );
      })}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #27 最初の現場は、江戸の芝居小屋です。
// 格: 並 / seed 1026
// 絵: 小屋の正面に寄る。絵看板、積まれた下駄、木戸番が札を数える
// どこ: 朝の芝居小屋の正面。木戸口の前
// 演出: 絵看板がずらり、軒に提灯、足元に客が脱いだ下駄の山。木戸番が木札を数えている
// 動き: 木札が1枚ずつ手から台へ落ちる・提灯のゆれ・のれんのはためき
const Sg027: React.FC<{ f: number }> = ({ f }) => {
  const fudaN = 3 + Math.floor(seg(f, 4, 40) * 5); // 数え終えた札が増える
  return (
    <Frame f={f} seed={1026} bg={C.asaSora}>
      {/* 朝の空と淡い日 */}
      <rect x={-20} y={-20} width={W + 40} height={420} fill={C.asaSora} />
      <circle cx={260} cy={150} r={80} fill={C.hikari} opacity={0.8} />
      <circle cx={260} cy={150} r={120} fill={C.hikari} opacity={0.25 + 0.08 * Math.sin(f / 10)} />
      {/* 小屋の正面が画面の主面積 */}
      <rect x={120} y={210} width={1760} height={600} fill={C.kabe} stroke={C.ink} strokeWidth={9} />
      <path d="M 60 212 L 1000 90 L 1940 212 Z" fill={C.kawara} stroke={C.ink} strokeWidth={8} />
      <path d="M 60 212 L 1000 96 L 1940 212" fill="none" stroke={C.kawaraHi} strokeWidth={10} opacity={0.5} />
      <Yagura x={1000} y={116} s={0.84} />
      {/* 柱 */}
      <g fill={C.kijiDark} stroke={C.ink} strokeWidth={6}>
        <rect x={150} y={210} width={40} height={600} />
        <rect x={700} y={210} width={40} height={600} />
        <rect x={1180} y={210} width={40} height={600} />
        <rect x={1830} y={210} width={40} height={600} />
      </g>
      {/* 絵看板の列 (役者の見得の絵) */}
      {Array.from({ length: 3 }, (_, i) => {
        const bx = 240 + i * 460;
        return (
          <g key={i}>
            <rect x={bx} y={250} width={380} height={210} rx={8}
              fill={C.shoji} stroke={C.ink} strokeWidth={7} />
            <rect x={bx + 12} y={262} width={356} height={186} rx={6}
              fill="none" stroke={C.kijiFukai} strokeWidth={5} />
            {/* 中の役者絵: 隈取の顔と見得のポーズ (板絵なので動かない) */}
            <circle cx={bx + 120} cy={330} r={44} fill="#F2E0C8" stroke={C.ink} strokeWidth={5} />
            <g stroke={C.maguro} strokeWidth={6} fill="none">
              <path d={`M ${bx + 88} 306 q 16 14 8 30`} />
              <path d={`M ${bx + 152} 306 q -16 14 -8 30`} />
            </g>
            <circle cx={bx + 104} cy={326} r={5} fill={C.ink} />
            <circle cx={bx + 136} cy={326} r={5} fill={C.ink} />
            <path d={`M ${bx + 96} 374 L ${bx + 220} 346 L ${bx + 320} 390 L ${bx + 250} 430 L ${bx + 120} 420 Z`}
              fill={[C.makuKaki, "#3E5E7E", C.makuMoegi][i]} stroke={C.ink} strokeWidth={5} />
            <line x1={bx + 300} y1={300} x2={bx + 340} y2={400} stroke={C.ink} strokeWidth={6} />
          </g>
        );
      })}
      {/* 軒の提灯 */}
      <Chochin x={320} y={480} s={0.78} f={f} phase={0} />
      <Chochin x={960} y={480} s={0.78} f={f} phase={1} />
      <Chochin x={1560} y={480} s={0.78} f={f} phase={2} />
      {/* 木戸口: のれんと鼠木戸 */}
      <rect x={1270} y={520} width={430} height={290} fill="#5A5048" stroke={C.ink} strokeWidth={7} />
      <g>
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i}
            d={`M ${1300 + i * 86} 540 q ${Math.sin(f / 9 + i) * 7} 110 0 230`}
            fill={C.noren} stroke={C.ink} strokeWidth={5} opacity={0.96} />
        ))}
        <rect x={1270} y={520} width={430} height={30} fill={C.noren} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 地面と下駄の山 */}
      <rect x={-20} y={810} width={W + 40} height={300} fill={KRP.floor} />
      <line x1={-20} y1={810} x2={W + 20} y2={810} stroke={C.ink} strokeWidth={7} />
      <g>
        <ellipse cx={420} cy={960} rx={240} ry={46} fill={C.kijiDark} opacity={0.3} />
        <Geta x={330} y={940} rot={-8} />
        <Geta x={430} y={952} rot={5} />
        <Geta x={520} y={936} rot={-3} />
        <Geta x={380} y={902} rot={12} s={0.95} />
        <Geta x={470} y={898} rot={-10} s={0.9} />
        <Geta x={425} y={866} rot={4} s={0.88} />
      </g>
      {/* 木戸番: 台の前で木札を数える */}
      <ellipse cx={1080} cy={1012} rx={120} ry={26} fill={C.ink} opacity={0.14} />
      <Person x={1080} y={1004} s={1.25} cloth="#4E5E50" clothDark="#3A4A3E"
        face="normal" gaze={[0.3, 0.5]} pose="hold" f={f} />
      {/* 勘定台と木札 */}
      <rect x={1200} y={870} width={330} height={28} rx={8} fill={C.kiji} stroke={C.ink} strokeWidth={6} />
      <rect x={1230} y={898} width={26} height={110} fill={C.kijiDark} stroke={C.ink} strokeWidth={5} />
      <rect x={1470} y={898} width={26} height={110} fill={C.kijiDark} stroke={C.ink} strokeWidth={5} />
      {/* 数え終えた札の山 (fで増える) */}
      {Array.from({ length: fudaN }, (_, i) => (
        <rect key={i} x={1290 + (i % 2) * 8 + rnd(7, i) * 6} y={846 - i * 12}
          width={90} height={16} rx={4}
          fill={C.shoji} stroke={C.ink} strokeWidth={4} />
      ))}
      {/* 手元の札 (落ちていく1枚) */}
      <rect x={1075} y={848 + ((f * 4) % 36)} width={70} height={14} rx={4}
        fill={C.shoji} stroke={C.ink} strokeWidth={4}
        opacity={1 - ((f * 4) % 36) / 40} transform={`rotate(${((f * 4) % 36) - 10} 1110 855)`} />
      <TagPlate x={860} y={690} text="木戸番" size={34} t={seg(f, 12, 26)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #28 江戸の歌舞伎は、明け六つ、いまの朝6時ごろに幕を開けました。
// 格: 並 / seed 1027
// 絵: 明け六つの鐘。朝日が屋根の隙間から差し、定式幕がするすると開く
// どこ: 小屋の中。舞台の正面。開演の瞬間
// 演出: 上手の釣鐘が鳴り、屋根の隙間から朝日の帯。三色の定式幕がするすると横に開く
// 動き: 幕が f で開く・鐘が揺れ音の輪が広がる・光の帯がゆらめく・客の頭がそわそわ
const Sg028: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 8, 40)); // 幕の開き
  const bell = Math.sin(f / 6) * 9;
  const ring = ((f % 26) / 26);
  return (
    <Frame f={f} seed={1027} bg="#4A4440">
      {/* 小屋の内側: 木組みの壁と梁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#57504A" />
      <g stroke={C.ink} strokeWidth={7} opacity={0.75}>
        <line x1={-20} y1={120} x2={W + 20} y2={120} />
        <line x1={240} y1={-20} x2={240} y2={760} />
        <line x1={1680} y1={-20} x2={1680} y2={760} />
      </g>
      <rect x={-20} y={-20} width={W + 40} height={140} fill="#423C38" stroke={C.ink} strokeWidth={6} />
      {/* 舞台: 桧の床と額縁 */}
      <rect x={240} y={240} width={1440} height={520} fill={C.hinoki} stroke={C.ink} strokeWidth={9} />
      <g stroke={C.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={240} y1={300 + i * 66} x2={1680} y2={300 + i * 66} />
        ))}
      </g>
      {/* 奥の松羽目 (開いた幕の奥に見える) */}
      <rect x={240} y={240} width={1440} height={330} fill="#E8E0C4" stroke={C.ink} strokeWidth={6} />
      <g transform="translate(580 430)">
        <path d="M 0 130 L 0 10" stroke={C.kijiFukai} strokeWidth={26} />
        <ellipse cx={-110} cy={-10} rx={120} ry={56} fill={C.makuMoegi} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={120} cy={-40} rx={140} ry={62} fill="#4E6A3E" stroke={C.ink} strokeWidth={6} />
        <ellipse cx={0} cy={-100} rx={110} ry={50} fill={C.makuMoegi} stroke={C.ink} strokeWidth={6} />
      </g>
      <g transform="translate(1360 450)">
        <path d="M 0 110 L 0 14" stroke={C.kijiFukai} strokeWidth={20} />
        <ellipse cx={-70} cy={-16} rx={96} ry={44} fill="#4E6A3E" stroke={C.ink} strokeWidth={6} />
        <ellipse cx={70} cy={-50} rx={104} ry={46} fill={C.makuMoegi} stroke={C.ink} strokeWidth={6} />
      </g>
      {/* 役者: 幕が開くと中央で見得 (袖の広い着物・隈取・鬘) */}
      <g opacity={clamp01(open * 1.6 - 0.3)}>
        {/* 舞台の上だけ明るく (足元の光だまり) */}
        <ellipse cx={960} cy={716} rx={300} ry={62} fill={C.hikari} opacity={0.3} />
        <ellipse cx={960} cy={720} rx={110} ry={22} fill={C.ink} opacity={0.16} />
        <KabukiYakusha x={960} y={712} s={1.35} f={f} lean={-3}
          pose="banzai" face="angry" gaze={[0.4, 0]}
          iro={C.shu} iroDark={C.shuFukai} gara="koushi" mie mieDir={1} />
      </g>
      {/* 定式幕: 黒・柿・萌葱の縦縞。左右に開く */}
      {([-1, 1] as const).map((side) => (
        <g key={side} transform={`translate(${side * open * 760} 0)`}>
          <g clipPath="none">
            {Array.from({ length: 9 }, (_, i) => {
              const x0 = side === -1 ? 232 + i * 82 : 960 + i * 82;
              const colors = [C.makuKuro, C.makuKaki, C.makuMoegi];
              return (
                <path key={i}
                  d={`M ${x0} 232 L ${x0 + 82} 232 L ${x0 + 82 + Math.sin(f / 8 + i) * 5} 764 L ${x0 + Math.sin(f / 8 + i + 1) * 5} 764 Z`}
                  fill={colors[i % 3]} stroke={C.ink} strokeWidth={4} />
              );
            })}
          </g>
        </g>
      ))}
      {/* 幕の上の梁 */}
      <rect x={200} y={204} width={1520} height={44} rx={8} fill={C.kijiFukai} stroke={C.ink} strokeWidth={7} />
      {/* 屋根の隙間からの朝日の帯 */}
      <g opacity={0.5 + 0.12 * Math.sin(f / 9)}>
        <polygon points="330,120 470,120 760,760 560,760" fill={C.hikari} opacity={0.55} />
        <polygon points="1300,120 1400,120 1660,760 1500,760" fill={C.hikari} opacity={0.4} />
      </g>
      {/* 明け六つの鐘 (上手の隅。バッジに隠れない位置) */}
      <g transform={`translate(330 110)`}>
        <line x1={0} y1={-60} x2={0} y2={0} stroke={C.ink} strokeWidth={7} />
        <g transform={`rotate(${bell})`}>
          <path d="M -36 0 Q -40 60 -46 76 L 46 76 Q 40 60 36 0 Z"
            fill={C.kuri} stroke={C.ink} strokeWidth={6} />
          <line x1={-46} y1={58} x2={46} y2={58} stroke={C.ink} strokeWidth={4} opacity={0.7} />
          <circle cx={0} cy={92} r={10} fill={C.ink} />
        </g>
        {/* 音の輪 */}
        <circle cx={0} cy={50} r={60 + ring * 80} fill="none" stroke={C.tamago}
          strokeWidth={7} opacity={(1 - ring) * 0.8} />
        <circle cx={0} cy={50} r={60 + ((ring + 0.5) % 1) * 80} fill="none" stroke={C.tamago}
          strokeWidth={5} opacity={(1 - ((ring + 0.5) % 1)) * 0.6} />
      </g>
      <TagPlate x={640} y={56} text="明け六つ" size={38} t={seg(f, 14, 28)} />
      {/* 手前: 客の後ろ頭がそわそわ */}
      <rect x={-20} y={880} width={W + 40} height={220} fill="#3A3530" />
      {Array.from({ length: 9 }, (_, i) => (
        <PersonMini key={i} x={110 + i * 220 + (i % 2) * 60} y={1066 + (i % 3) * 14}
          s={1.0 + (i % 3) * 0.1} color={["#5E5A66", "#6A5E58", "#565E6A"][i % 3]}
          f={f} phase={i} face="none" />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #29 終わるのは、暮れ七つ半、夕方5時ごろ。
// 格: 並 / seed 1028
// 絵: 夕焼け。はねた客がぞろぞろ。#28と対の構図 (朝⇄夕)
// どこ: 夕方の小屋の外。木戸口から通りへ (#28 の鐘と札を夕方版で反復=朝⇄夕の対)
// 演出: 夕焼けの空に沈む日。はねた客がぞろぞろと通りへ流れ出る。影が長い
// 動き: 客の列が f で右へ進む・日がゆっくり沈む・鐘の音の輪・カラスが横切る
const Sg029: React.FC<{ f: number }> = ({ f }) => {
  const sunDown = seg(f, 0, 42) * 26; // 日が沈んでいく
  const ring = (f % 26) / 26;
  return (
    <Frame f={f} seed={1028} bg={C.yuSora}>
      {/* 夕焼けの空 */}
      <rect x={-20} y={-20} width={W + 40} height={430} fill={C.yuSora} />
      <rect x={-20} y={360} width={W + 40} height={200} fill="#E8A05E" />
      <rect x={-20} y={520} width={W + 40} height={160} fill={C.yuFukai} opacity={0.6} />
      {/* 沈む日 */}
      <circle cx={360} cy={520 + sunDown} r={86} fill="#F2B45C" stroke={C.ink} strokeWidth={5} />
      <circle cx={360} cy={520 + sunDown} r={130} fill="#F2B45C" opacity={0.25 + 0.08 * Math.sin(f / 9)} />
      {/* 夕焼け雲 */}
      <g fill={C.yuKumo} stroke={C.ink} strokeWidth={4} opacity={0.85}>
        <ellipse cx={820 - f * 0.4} cy={180} rx={170} ry={30} />
        <ellipse cx={1480 - f * 0.25} cy={84} rx={130} ry={24} />
        <ellipse cx={1200 - f * 0.3} cy={300} rx={210} ry={26} opacity={0.7} />
      </g>
      {/* カラス */}
      <g stroke={C.ink} strokeWidth={5} fill="none">
        <path d={`M ${1700 - f * 7} ${300 + Math.sin(f / 6) * 10} q 14 -14 28 0 q 14 -14 28 0`} />
        <path d={`M ${1860 - f * 6} ${352 + Math.sin(f / 7 + 2) * 10} q 12 -12 24 0 q 12 -12 24 0`} />
      </g>
      {/* 小屋 (左に正面。#27 と同じ建物を夕色で) */}
      <g>
        <rect x={-40} y={300} width={900} height={440} fill="#8A6E58" stroke={C.ink} strokeWidth={8} />
        <path d="M -80 302 L 420 180 L 920 302 Z" fill="#6E5648" stroke={C.ink} strokeWidth={8} />
        <Yagura x={420} y={204} s={0.78} />
        {Array.from({ length: 3 }, (_, i) => (
          <rect key={i} x={30 + i * 250} y={340} width={200} height={120} rx={6}
            fill="#A8886A" stroke={C.ink} strokeWidth={5} />
        ))}
        {/* 木戸口: 中は暗い (芝居がはねた) */}
        <rect x={250} y={500} width={320} height={240} fill="#38302C" stroke={C.ink} strokeWidth={7} />
        <Chochin x={230} y={450} s={0.8} f={f} phase={0} />
        <Chochin x={590} y={450} s={0.8} f={f} phase={1} />
      </g>
      <Nobori x={880} y={742} s={0.95} f={f} phase={0} color="#8E4438" />
      {/* 暮れ七つ半の鐘 (#28 と同じ鐘を右上に=対) */}
      <g transform="translate(1760 90)">
        <line x1={0} y1={-60} x2={0} y2={0} stroke={C.ink} strokeWidth={7} />
        <g transform={`rotate(${Math.sin(f / 6) * 9})`}>
          <path d="M -36 0 Q -40 60 -46 76 L 46 76 Q 40 60 36 0 Z"
            fill={C.kuri} stroke={C.ink} strokeWidth={6} />
          <line x1={-46} y1={58} x2={46} y2={58} stroke={C.ink} strokeWidth={4} opacity={0.7} />
          <circle cx={0} cy={92} r={10} fill={C.ink} />
        </g>
        <circle cx={0} cy={50} r={60 + ring * 110} fill="none" stroke={C.tamago}
          strokeWidth={6} opacity={(1 - ring) * 0.8} />
      </g>
      <TagPlate x={1440} y={160} text="暮れ七つ半" size={38} t={seg(f, 14, 28)} />
      {/* 通り */}
      <rect x={-20} y={740} width={W + 40} height={360} fill="#B88E62" />
      <line x1={-20} y1={740} x2={W + 20} y2={740} stroke={C.ink} strokeWidth={7} />
      <ellipse cx={1100} cy={940} rx={800} ry={120} fill="#C49A6C" opacity={0.6} />
      {/* はねた客がぞろぞろ右へ。足元に長い影 */}
      {Array.from({ length: 8 }, (_, i) => {
        const base = 620 + i * 160;
        const px = (base + f * (3 + (i % 3))) % 2100 - 90;
        const py = 850 + (i % 4) * 46;
        const sc = 0.9 + (i % 4) * 0.08;
        return (
          <g key={i}>
            <ellipse cx={px + 120 * sc} cy={py + 6} rx={130 * sc} ry={14}
              fill={C.ink} opacity={0.18} />
            <PersonMini x={px} y={py} s={sc}
              color={["#6E5E70", "#5E6680", "#7A6A58", "#566072"][i % 4]}
              f={f} phase={i} face={i % 3 === 0 ? "smile" : "dot"} />
          </g>
        );
      })}
      {/* 手前の親子: 満足げに帰る */}
      <ellipse cx={1560} cy={1038} rx={150} ry={26} fill={C.ink} opacity={0.2} />
      <Person x={1520} y={1030} s={1.2} cloth="#6E4E58" clothDark="#543A44"
        face="joy" f={f} gaze={[0.5, 0]} />
      <PersonMini x={1680} y={1030} s={0.88} color={C.mikan} f={f} phase={3} face="smile" arms="up" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #30 照明は自然の光だけですから、日のあるうちが勝負なのです。
// 格: 図 / seed 1029
// 絵: 小屋の断面に天窓からの光の帯。太陽の弧と「営業時間」が重なる図
// どこ: 板壁に画鋲ならぬ竹釘で留めた大きな和紙の絵図面
// 演出: 紙の中に小屋の断面。天窓から光の帯が客席まで差す。紙の上部に太陽の弧
// 動き: 太陽が弧をじわじわ進む・光の帯の角度と明るさが太陽に合わせて動く
const Sg030: React.FC<{ f: number }> = ({ f }) => {
  const sunT = 0.18 + seg(f, 0, 42) * 0.5; // 弧の上の太陽の位置
  const sunA = lerp(-72, 72, sunT);        // -72°(朝)→72°(夕)
  const [sx, sy] = polar(930, 430, 330, sunA);
  const lightOp = 0.55 - Math.abs(sunT - 0.5) * 0.3;
  return (
    <Frame f={f} seed={1029} bg="#8A7458">
      {/* 板壁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#8A7458" />
      <g stroke={C.ink} strokeWidth={4} opacity={0.4}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={-20} y1={i * 150 - 10} x2={W + 20} y2={i * 150 - 10} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={rnd(9, i) * 1880} cy={rnd(10, i) * 1040} r={7} fill={C.kijiFukai} />
        ))}
      </g>
      {/* 和紙の絵図面 */}
      <rect x={160} y={90} width={1600} height={880} rx={10}
        fill={SGP.paper} stroke={C.ink} strokeWidth={9} />
      <rect x={180} y={110} width={1560} height={840} rx={8}
        fill="none" stroke={C.kijiFukai} strokeWidth={3} opacity={0.5} />
      {/* 竹釘 */}
      {([[200, 130], [1720, 130], [200, 930], [1720, 930]] as const).map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={12} fill={C.kijiFukai} stroke={C.ink} strokeWidth={4} />
      ))}
      {/* --- 紙の中: 太陽の弧 --- */}
      <path d={arcPath(930, 430, 330, -78, 78)} fill="none"
        stroke={KRP.orange} strokeWidth={6} strokeDasharray="16 14" opacity={0.85} />
      {/* 弧の両端の印 */}
      <circle cx={polar(930, 430, 330, -78)[0]} cy={polar(930, 430, 330, -78)[1]} r={9} fill={KRP.orange} stroke={C.ink} strokeWidth={3} />
      <circle cx={polar(930, 430, 330, 78)[0]} cy={polar(930, 430, 330, 78)[1]} r={9} fill={KRP.orange} stroke={C.ink} strokeWidth={3} />
      {/* 太陽 (弧の上を進む) */}
      <g transform={`translate(${sx} ${sy})`}>
        <circle r={38} fill={C.tamago} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => {
          const [rx0, ry0] = polar(0, 0, 46, i * 45);
          const [rx1, ry1] = polar(0, 0, 62, i * 45);
          return <line key={i} x1={rx0} y1={ry0} x2={rx1} y2={ry1}
            stroke={C.tamago} strokeWidth={6} strokeLinecap="round" />;
        })}
      </g>
      {/* --- 紙の中: 小屋の断面 --- */}
      <g>
        {/* 屋根 (左右) と天窓 (真ん中の切れ目) */}
        <path d="M 360 470 L 820 380 L 820 410 L 360 500 Z" fill={C.kawara} stroke={C.ink} strokeWidth={6} />
        <path d="M 1040 380 L 1500 470 L 1500 500 L 1040 410 Z" fill={C.kawara} stroke={C.ink} strokeWidth={6} />
        {/* 壁 */}
        <rect x={360} y={490} width={28} height={330} fill={C.kijiDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1472} y={490} width={28} height={330} fill={C.kijiDark} stroke={C.ink} strokeWidth={5} />
        {/* 床 */}
        <rect x={360} y={800} width={1140} height={24} fill={C.kijiFukai} stroke={C.ink} strokeWidth={5} />
        {/* 舞台 (左) */}
        <rect x={400} y={740} width={300} height={62} fill={C.hinoki} stroke={C.ink} strokeWidth={5} />
        <PersonMini x={540} y={740} s={0.62} color={C.makuKaki} f={f} phase={0} face="dot" arms="up" />
        {/* 客席 (右。桟敷の段) */}
        {Array.from({ length: 3 }, (_, i) => (
          <rect key={i} x={790 + i * 230} y={800 - (i + 1) * 34} width={220} height={(i + 1) * 34 + 2}
            fill={C.tatami} stroke={C.ink} strokeWidth={5} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <PersonMini key={i} x={850 + i * 112} y={800 - (Math.floor(i / 2) + 1) * 34}
            s={0.4} color={["#6E5E70", "#566072", "#7A6A58"][i % 3]} f={f} phase={i} face="dot" />
        ))}
        {/* 天窓からの光の帯 (太陽の位置に応じて傾く) */}
        <polygon
          points={`830,392 1030,392 ${1180 - (sunT - 0.5) * 520},800 ${880 - (sunT - 0.5) * 520},800`}
          fill={C.hikari} opacity={lightOp} />
        <polygon
          points={`860,392 1000,392 ${1120 - (sunT - 0.5) * 520},800 ${950 - (sunT - 0.5) * 520},800`}
          fill={KRP.white} opacity={lightOp * 0.5} />
      </g>
      {/* 「営業時間」の帯: 弧の下に重なる */}
      <g>
        <path d={arcPath(930, 430, 268, lerp(-72, 72, 0.04), lerp(-72, 72, clamp01(seg(f, 10, 38))))}
          fill="none" stroke={KRP.green} strokeWidth={22} strokeLinecap="round" opacity={0.8} />
      </g>
      <TagPlate x={400} y={330} text="明け六つ" size={32} t={seg(f, 8, 20)} rot={-3} />
      <TagPlate x={1480} y={330} text="暮れ七つ半" size={32} t={seg(f, 12, 24)} rot={3} />
      <TagPlate x={560} y={140} text="営業時間" size={38} t={seg(f, 24, 38)} color={KRP.ink} fill="#DFF0D8" />
      <Arrow x={770} y={250} s={0.85} rot={35} t={seg(f, 28, 40)} color={KRP.green} />
      <TagPlate x={1310} y={248} text="天窓" size={30} t={seg(f, 16, 28)} />
      <Arrow x={1100} y={330} s={0.8} rot={150} t={seg(f, 18, 30)} color={KRP.orange} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #31 つまり観劇は、丸一日がかりの行事でした。
// 格: 図 / seed 1030
// 絵: 和時計風の一日円盤。明け六つ〜暮れ七つ半まで「芝居」の帯がぐるり約11時間
// どこ: 茶屋の帳場の壁。大きな和時計が掛かる
// 演出: 一日円盤。明け六つ→暮れ七つ半まで「芝居」の帯がぐるりと伸びる
// 動き: 帯が f で伸びきる・針がじりじり進む・分銅の鎖が揺れる・蝋燭の炎
const Sg031: React.FC<{ f: number }> = ({ f }) => {
  const bandT = seg(f, 8, 36);
  const needle = 270 + seg(f, 4, 42) * 40; // 明け六つから じりじり進む針
  const swing = Math.sin(f / 14) * 4;
  return (
    <Frame f={f} seed={1030} bg="#6E5A44">
      {/* 帳場の壁: 板目 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#6E5A44" />
      <g stroke={C.ink} strokeWidth={4} opacity={0.35}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={i * 300 - 40} y1={-20} x2={i * 300 - 80} y2={H + 20} />
        ))}
      </g>
      {/* 鴨居と棚 */}
      <rect x={-20} y={120} width={W + 40} height={30} fill={C.kijiFukai} stroke={C.ink} strokeWidth={6} />
      <rect x={1480} y={560} width={420} height={26} fill={C.kijiFukai} stroke={C.ink} strokeWidth={6} />
      {/* 棚の上: 帳面と算盤と湯のみ */}
      <rect x={1520} y={498} width={150} height={62} rx={6} fill={C.shoji} stroke={C.ink} strokeWidth={5} />
      <line x1={1595} y1={498} x2={1595} y2={560} stroke={C.ink} strokeWidth={4} opacity={0.6} />
      <rect x={1700} y={514} width={160} height={46} rx={8} fill={C.kiji} stroke={C.ink} strokeWidth={5} />
      <g stroke={C.ink} strokeWidth={3}>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <line x1={1716 + i * 24} y1={514} x2={1716 + i * 24} y2={560} />
            <circle cx={1716 + i * 24} cy={530 + rnd(11, i) * 16} r={6} fill={C.kuri} />
          </g>
        ))}
      </g>
      <Yuge x={1660} y={500} f={f} s={0.7} />
      {/* 蝋燭 (左下の燭台) */}
      <g transform="translate(250 900)">
        <path d="M -60 80 L 60 80 L 36 40 L -36 40 Z" fill={C.kijiFukai} stroke={C.ink} strokeWidth={6} />
        <rect x={-18} y={-90} width={36} height={130} rx={8} fill={C.shoji} stroke={C.ink} strokeWidth={5} />
        <line x1={0} y1={-90} x2={0} y2={-104} stroke={C.ink} strokeWidth={4} />
        <path d={`M 0 -104 q ${10 + Math.sin(f / 5) * 5} -22 0 -44 q ${-10 + Math.sin(f / 5 + 1) * 5} 22 0 44`}
          fill={C.honoo} stroke={C.ink} strokeWidth={3.5} />
        <circle cx={0} cy={-128} r={46} fill={C.honoo} opacity={0.16 + 0.05 * Math.sin(f / 5)} />
      </g>
      {/* 和時計本体 (壁掛けの櫓時計風) */}
      <g transform="translate(900 470)">
        {/* 掛け紐 */}
        <path d="M -120 -330 L 0 -430 L 120 -330" fill="none" stroke={C.ink} strokeWidth={7} />
        <circle cx={0} cy={-436} r={13} fill={C.kijiFukai} stroke={C.ink} strokeWidth={5} />
        {/* 文字盤 */}
        <WadokeiFace x={0} y={0} r={300} needleDeg={needle} band bandT={bandT} />
        {/* 分銅の鎖 (左右で揺れる) */}
        <g transform={`rotate(${swing} 0 340)`}>
          <line x1={-180} y1={322} x2={-180} y2={470} stroke={C.ink} strokeWidth={5} />
          <rect x={-204} y={470} width={48} height={74} rx={8} fill={C.kuri} stroke={C.ink} strokeWidth={5} />
        </g>
        <g transform={`rotate(${-swing} 0 340)`}>
          <line x1={180} y1={322} x2={180} y2={430} stroke={C.ink} strokeWidth={5} />
          <rect x={156} y={430} width={48} height={74} rx={8} fill={C.kuri} stroke={C.ink} strokeWidth={5} />
        </g>
      </g>
      {/* 帯の両端の印と札 */}
      <TagPlate x={400} y={480} text="明け六つ" size={34} t={seg(f, 10, 22)} rot={-3} />
      <TagPlate x={1400} y={300} text="暮れ七つ半" size={34} t={seg(f, 26, 38)} rot={3} />
      <TagPlate x={270} y={210} text="芝居" size={44} t={seg(f, 30, 42)} color={KRP.ink} fill="#FBE3C8" />
      {/* 「芝居」の札から帯へ矢印 */}
      <Arrow x={620} y={300} s={0.9} rot={20} t={seg(f, 32, 42)} color={KRP.orange} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #32 朝6時から夕方5時まで、ずっと舞台を見つめていられるでしょうか。
// 格: 並 / seed 1031
// 絵: 正座でカッと目を見開き舞台を凝視する客。背後の時計がじりじり進む
// どこ: 桟敷席の中。左に舞台の端 (芝居は続いている)、柱に小さな和時計
// 演出: #32=正座でカッと目を見開き凝視+背後の時計がじりじり / #33=同じ客がぐんにゃり
// 動き: 針がコチコチ進む・視線の集中線・(#33) 隣の客の弁当の湯気
// ※#32 と #33 は同じ絵。複製せず KanshuBako の phase で切り替える (掟 §3)
const KanshuBako: React.FC<{ f: number; phase: 0 | 1 }> = ({ f, phase }) => {
  const tick = Math.floor(f / 10) * 4 + (f % 10 > 7 ? 2 : 0); // じりじり動く針
  const needle = (phase === 0 ? 295 : 355) + tick;
  const dashOff = -f * 6;
  return (
    <>
      {/* 小屋の中の壁と梁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#57504A" />
      <g stroke={C.ink} strokeWidth={6} opacity={0.6}>
        <line x1={-20} y1={150} x2={W + 20} y2={150} />
        <line x1={-20} y1={520} x2={620} y2={520} />
      </g>
      {/* 左: 舞台の端。芝居は続いている */}
      <rect x={-20} y={520} width={640} height={320} fill={C.hinoki} stroke={C.ink} strokeWidth={8} />
      <rect x={-20} y={150} width={640} height={380} fill="#E8E0C4" stroke={C.ink} strokeWidth={6} />
      <ellipse cx={220} cy={330} rx={150} ry={64} fill={C.makuMoegi} stroke={C.ink} strokeWidth={6} />
      <path d="M 220 520 L 220 390" stroke={C.kijiFukai} strokeWidth={20} />
      {/* 役者: 大立ち回りの途中 (#28 とは姿勢を変える。扇を持った藍の扮装) */}
      <ellipse cx={360} cy={524} rx={240} ry={48} fill={C.hikari} opacity={0.28} />
      <ellipse cx={360} cy={528} rx={90} ry={18} fill={C.ink} opacity={0.16} />
      <KabukiYakusha x={360} y={520} s={1.1} f={f}
        pose={phase === 0 ? "hold" : "banzai"} face="angry" gaze={[2, 0]}
        iro={C.ai} iroDark={C.aiFukai} gara="shima" ogi={phase === 0} />
      {/* 舞台明かり (天窓の光) */}
      <polygon points="40,150 240,150 420,840 140,840" fill={C.hikari} opacity={0.3 + 0.08 * Math.sin(f / 9)} />
      {/* 柱と小さな和時計 (背後でじりじり) */}
      <rect x={640} y={-20} width={56} height={880} fill={C.kijiDark} stroke={C.ink} strokeWidth={7} />
      <WadokeiFace x={668} y={300} r={92} needleDeg={needle} />
      {/* 桟敷: 畳の床・座布団・手すり */}
      <rect x={640} y={790} width={1300} height={310} fill={C.tatami} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.tatamiFuchi} strokeWidth={8} opacity={0.75}>
        <line x1={1140} y1={790} x2={1220} y2={1100} />
        <line x1={700} y1={880} x2={1940} y2={880} />
      </g>
      {/* 後ろの壁: 障子窓 */}
      <rect x={760} y={210} width={1120} height={420} fill={C.shoji} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.kijiDark} strokeWidth={5} opacity={0.85}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={760 + (i + 1) * 160} y1={210} x2={760 + (i + 1) * 160} y2={630} />
        ))}
        <line x1={760} y1={350} x2={1880} y2={350} />
        <line x1={760} y1={490} x2={1880} y2={490} />
      </g>
      <rect x={760} y={630} width={1120} height={26} fill={C.kijiFukai} stroke={C.ink} strokeWidth={5} />
      {/* 座布団 */}
      <ellipse cx={1060} cy={1004} rx={150} ry={40} fill="#A8505A" stroke={C.ink} strokeWidth={6} />
      <ellipse cx={1560} cy={1016} rx={150} ry={40} fill="#4E6A8E" stroke={C.ink} strokeWidth={6} />
      {/* 客A: #32 凝視 / #33 ぐんにゃり崩れて伸びる */}
      {phase === 0 ? (
        <g>
          <Person x={1060} y={990} s={1.35} cloth="#6E5E70" clothDark="#544656"
            face="surprised" gaze={[-8, 2]} still f={f} />
          {/* 視線の集中線 (舞台へ) */}
          <g stroke={KRP.blueDeep} strokeWidth={5} strokeDasharray="18 14" opacity={0.75} fill="none">
            <line x1={980} y1={690} x2={560} y2={520} strokeDashoffset={dashOff} />
            <line x1={990} y1={720} x2={580} y2={580} strokeDashoffset={dashOff - 9} />
          </g>
        </g>
      ) : (
        <g>
          {/* 崩れた体: 後ろへぐんにゃり倒れる */}
          <g transform="rotate(-62 1060 990)">
            <Person x={1060} y={990} s={1.35} cloth="#6E5E70" clothDark="#544656"
              face="worried" gaze={[0, 8]} f={f} lean={6} />
          </g>
          {/* 脱ぎ捨てた扇子 */}
          <g transform="translate(930 1020) rotate(-18)">
            <path d="M 0 0 L 52 -36 A 64 64 0 0 1 64 10 Z" fill={C.mikan} stroke={C.ink} strokeWidth={4} />
          </g>
        </g>
      )}
      {/* 客B: #32 は普通に観ている / #33 は最初から弁当を開けて涼しい顔 */}
      {phase === 0 ? (
        <Person x={1560} y={1000} s={1.3} cloth="#4E6A8E" clothDark="#3A5270"
          face="normal" gaze={[-8, 2]} f={f} phase={3} />
      ) : (
        <g>
          <Person x={1560} y={1000} s={1.3} cloth="#4E6A8E" clothDark="#3A5270"
            face="smile" gaze={[0, 6]} pose="hold" f={f} phase={3} />
          <BentoBox x={1560} y={858} s={1.15} />
          <Yuge x={1545} y={810} f={f} />
          {/* 箸 */}
          <line x1={1646} y1={812} x2={1700} y2={776} stroke={C.ink} strokeWidth={5} />
          <line x1={1652} y1={818} x2={1708} y2={786} stroke={C.ink} strokeWidth={5} />
        </g>
      )}
      {/* 手すり (人物の足元を隠して正座に見せる) */}
      <rect x={620} y={884} width={1320} height={30} rx={8} fill={C.kijiDark} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={680 + i * 148} y={908} width={22} height={160}
          fill={C.kijiDark} stroke={C.ink} strokeWidth={5} />
      ))}
      <rect x={620} y={1052} width={1320} height={26} rx={8} fill={C.kijiDark} stroke={C.ink} strokeWidth={6} />
    </>
  );
};
const Sg032: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={1031}>
    <KanshuBako f={f} phase={0} />
    <QMark x={1320} y={620} s={1.0} f={f} t={seg(f, 24, 36)} />
  </Frame>
);

// -------------------------------------------------------------------
// #33 無理です。お客のほうも、最初からそのつもりがありません。
// 格: 並 / seed 1032
// 絵: 同じ客がぐんにゃり崩れて伸びている。隣の客は最初から弁当を開けて涼しい顔 (#32と連番)
// どこ: 同じ桟敷だがカメラを畳すれすれに下ろし、寝そべった客Aへ横から寄る (#32 の正面引きと別構図)
// 演出: 客Aが座布団を枕に大の字。時計と障子は奥で薄く。右端で客Bが弁当。手前に手すりをなめる
// 動き: ×印がポン・弁当の湯気・針はコチコチ・落とした扇子がゆれる・明かりのまたたき
const Sg033: React.FC<{ f: number }> = ({ f }) => {
  const tick = Math.floor(f / 10) * 4 + (f % 10 > 7 ? 2 : 0);
  const fanRock = Math.sin(f / 9) * 7;
  return (
    <Frame f={f} seed={1032}>
      {/* 小屋の中の壁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#57504A" />
      <line x1={-20} y1={104} x2={W + 20} y2={104} stroke={C.ink} strokeWidth={6} opacity={0.5} />
      {/* 奥: 障子窓 (遠いので薄く=ボケ気味) */}
      <g opacity={0.72}>
        <rect x={430} y={110} width={1510} height={470} fill={C.shoji} stroke={C.ink} strokeWidth={5} />
        <g stroke={C.kijiDark} strokeWidth={4} opacity={0.6}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={430 + (i + 1) * 168} y1={110} x2={430 + (i + 1) * 168} y2={580} />
          ))}
          <line x1={430} y1={268} x2={1940} y2={268} />
          <line x1={430} y1={424} x2={1940} y2={424} />
        </g>
        <rect x={430} y={580} width={1510} height={22} fill={C.kijiFukai} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 左の柱と和時計 (奥の壁ぎわ。針はコチコチ進む) */}
      <rect x={228} y={-20} width={74} height={1100} fill={C.kijiDark} stroke={C.ink} strokeWidth={7} />
      <g opacity={0.9}>
        <WadokeiFace x={265} y={268} r={84} needleDeg={355 + tick} />
      </g>
      {/* 舞台明かりのこぼれ (左から射す) */}
      <polygon points="-20,200 250,170 430,1100 -20,1100"
        fill={C.hikari} opacity={0.16 + 0.05 * Math.sin(f / 9)} />
      {/* 畳: 低いカメラなので手前いっぱいに広がる */}
      <rect x={-20} y={600} width={W + 40} height={500} fill={C.tatami} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.tatamiFuchi} strokeWidth={8} opacity={0.75}>
        <line x1={620} y1={600} x2={330} y2={1100} />
        <line x1={1500} y1={600} x2={1720} y2={1100} />
        <line x1={-20} y1={830} x2={1940} y2={830} />
      </g>
      <g stroke={C.ink} strokeWidth={2} opacity={0.12}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={-20} y1={646 + i * 62} x2={1940} y2={646 + i * 62} />
        ))}
      </g>
      {/* 枕がわりの座布団 */}
      <ellipse cx={1000} cy={858} rx={175} ry={48} fill="#A8505A" stroke={C.ink} strokeWidth={6} />
      {/* 客A: 座布団を枕に大の字で伸びている (横から大きく) */}
      <g transform="rotate(-80 1430 895)">
        <Person x={1430} y={895} s={1.9} cloth="#6E5E70" clothDark="#544656"
          face="worried" gaze={[0, 8]} f={f} lean={4} />
      </g>
      {/* 脱げた下駄と、落とした扇子がゆれる */}
      <Geta x={1600} y={1010} s={1.1} rot={14} />
      <Geta x={1706} y={1028} s={1.1} rot={-28} />
      <g transform={`translate(856 962) rotate(${-16 + fanRock})`}>
        <path d="M 0 0 L 68 -46 A 84 84 0 0 1 84 14 Z"
          fill={C.mikan} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 「ずっと見つめるのは無理」の× */}
      <XMark x={1170} y={540} s={1.3} t={seg(f, 10, 22)} />
      {/* 右端: 客Bは最初から弁当を開けて涼しい顔 (画面の端をなめる) */}
      <Person x={1800} y={1055} s={1.5} cloth="#4E6A8E" clothDark="#3A5270"
        face="smile" gaze={[-7, 4]} pose="hold" f={f} phase={3} />
      <BentoBox x={1800} y={905} s={1.35} />
      <Yuge x={1784} y={852} f={f} s={1.2} />
      <line x1={1896} y1={856} x2={1944} y2={822} stroke={C.ink} strokeWidth={5} />
      <line x1={1902} y1={862} x2={1950} y2={832} stroke={C.ink} strokeWidth={5} />
      {/* 手前: 桟敷の手すりをなめる (低いカメラの証拠) */}
      <rect x={-20} y={1038} width={W + 40} height={46} rx={8}
        fill={C.kijiDark} stroke={C.ink} strokeWidth={6} />
      <line x1={-20} y1={1050} x2={1940} y2={1050} stroke={C.ink} strokeWidth={2.5} opacity={0.4} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #34 観劇のお供は「かべす」。菓子の、か。弁当の、べ。寿司の、す。
// 格: 図 / seed 1033
// 絵: 土産物屋の棚。「か」「べ」「す」の木札の下に菓子箱・弁当・寿司桶が順に並ぶ
// どこ: 芝居町の土産物屋の店先。のれんの下の大きな棚
// 演出: 「か」「べ」「す」の木札が順にトンと下り、下に菓子箱・弁当・寿司桶が並ぶ
// 動き: 木札が1枚ずつ縄で下りてくる・売り子が指で順に差す・湯気
const Sg034: React.FC<{ f: number }> = ({ f }) => {
  const kabes = [
    { ch: "か", t: seg(f, 6, 16), x: 470 },
    { ch: "べ", t: seg(f, 14, 24), x: 960 },
    { ch: "す", t: seg(f, 22, 32), x: 1450 },
  ];
  return (
    <Frame f={f} seed={1033} bg={C.kabe}>
      {/* 店の中の壁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.kabe} />
      <g stroke={C.ink} strokeWidth={4} opacity={0.25}>
        <line x1={-20} y1={260} x2={W + 20} y2={260} />
        <line x1={-20} y1={830} x2={W + 20} y2={830} />
      </g>
      {/* のれん (上端) */}
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i}
            d={`M ${i * 250 - 30} -20 q ${Math.sin(f / 10 + i) * 9} 90 0 190`}
            fill={C.noren} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={-20} y={-20} width={W + 40} height={70} fill={C.noren} stroke={C.ink} strokeWidth={6} />
        <circle cx={960} cy={92} r={34} fill="none" stroke={KRP.white} strokeWidth={7} opacity={0.9} />
      </g>
      {/* 棚本体 (3間) */}
      <rect x={180} y={380} width={1560} height={450} rx={10} fill={C.kiji} stroke={C.ink} strokeWidth={9} />
      <g fill={C.kijiDark} stroke={C.ink} strokeWidth={6}>
        <rect x={180} y={380} width={1560} height={26} />
        <rect x={180} y={620} width={1560} height={22} />
        <rect x={180} y={804} width={1560} height={26} />
        <rect x={180} y={380} width={26} height={450} />
        <rect x={694} y={380} width={22} height={450} />
        <rect x={1204} y={380} width={22} height={450} />
        <rect x={1714} y={380} width={26} height={450} />
      </g>
      {/* 吊り木札 か・べ・す (縄で下りてくる) */}
      {kabes.map(({ ch, t, x }, i) => {
        const drop = easeOut(clamp01(t));
        const y = lerp(120, 300, drop);
        return (
          <g key={i} opacity={clamp01(t * 3)}>
            <line x1={x} y1={66} x2={x} y2={y - 56} stroke={C.kijiFukai} strokeWidth={6} />
            <g transform={`translate(${x} ${y}) rotate(${(1 - drop) * 10})`}>
              <rect x={-62} y={-62} width={124} height={124} rx={12}
                fill={C.kiji} stroke={C.ink} strokeWidth={7} />
              <rect x={-50} y={-50} width={100} height={100} rx={8}
                fill="none" stroke={C.kijiFukai} strokeWidth={4} opacity={0.7} />
              <circle cx={0} cy={-52} r={7} fill={C.kijiFukai} stroke={C.ink} strokeWidth={3} />
              <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={78} fill={C.ink}>{ch}</text>
            </g>
          </g>
        );
      })}
      {/* 間1: 菓子箱の山 */}
      <g opacity={clamp01(kabes[0].t * 2)}>
        <KashiBako x={400} y={618} s={1.1} color="#D98A94" />
        <KashiBako x={520} y={618} s={1.0} color="#8EA8C8" rot={1} />
        <KashiBako x={460} y={572} s={0.95} color="#A8C89A" rot={-2} />
        {/* 盆の上の団子と饅頭 */}
        <ellipse cx={420} cy={790} rx={120} ry={22} fill={C.urushi} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 3 }, (_, i) => (
          <circle key={i} cx={360 + i * 42} cy={768} r={17} fill={C.anko} stroke={C.ink} strokeWidth={4} />
        ))}
        <line x1={330} y1={780} x2={480} y2={752} stroke={C.ink} strokeWidth={4} />
        <circle cx={560} cy={766} r={22} fill={C.shoji} stroke={C.ink} strokeWidth={4} />
        <circle cx={606} cy={772} r={22} fill={C.tamago} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 間2: 弁当 (重箱の段と開けた一段) */}
      <g opacity={clamp01(kabes[1].t * 2)}>
        <g transform="translate(960 600)">
          <rect x={-90} y={-110} width={180} height={34} rx={6} fill={C.urushi} stroke={C.ink} strokeWidth={5} />
          <rect x={-90} y={-72} width={180} height={34} rx={6} fill="#5E3E36" stroke={C.ink} strokeWidth={5} />
          <rect x={-90} y={-34} width={180} height={34} rx={6} fill={C.urushi} stroke={C.ink} strokeWidth={5} />
          <path d="M -90 -110 Q 0 -150 90 -110" fill="none" stroke="#B89A4E" strokeWidth={7} />
        </g>
        <BentoBox x={960} y={796} s={1.35} />
        <Yuge x={945} y={740} f={f} s={0.9} />
      </g>
      {/* 間3: 寿司桶 */}
      <g opacity={clamp01(kabes[2].t * 2)}>
        <SushiOke x={1460} y={590} s={1.05} />
        <SushiOke x={1460} y={780} s={1.2} />
      </g>
      {/* 店の土間と売り子 */}
      <rect x={-20} y={830} width={W + 40} height={270} fill={KRP.floor} />
      <line x1={-20} y1={830} x2={W + 20} y2={830} stroke={C.ink} strokeWidth={7} />
      <ellipse cx={170} cy={1032} rx={110} ry={24} fill={C.ink} opacity={0.15} />
      <Person x={170} y={1024} s={1.2} cloth="#8E6E4E" clothDark="#6E5438"
        face="smile" pose="point" pointDir={1} gaze={[6, -4]} f={f} tasuki="売" />
      <TagPlate x={250} y={270} text="かべす" size={46} t={seg(f, 30, 42)} fill="#FBE3C8" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #35 桟敷席には、寿司や菓子や果物が、次々と運ばれてきました。
// 格: 山 / seed 1034
// 絵: 桟敷の宴。出方が寿司桶を掲げて廊下を走り、果物が回り、子どもが菓子に手を伸ばす。舞台そっちのけ
// どこ: 桟敷の二段を横から。左奥に舞台 (芝居は続いているのに誰も見ていない)
// 演出: 出方が寿司桶を掲げて廊下を走り、上の段へ菓子箱が手渡しされ、果物が転がる
// 動き: 出方が f で走り進む・みかんが転がる・子どもが腕を振る・提灯のゆれ
const Sg035: React.FC<{ f: number }> = ({ f }) => {
  const runX = 640 + seg(f, 0, 42) * 420; // 出方が廊下を走る
  const mikanX = 1180 + seg(f, 6, 42) * 480; // 転がるみかん
  return (
    <Frame f={f} seed={1034} bg="#57504A">
      {/* 小屋の中 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#57504A" />
      <rect x={-20} y={-20} width={W + 40} height={120} fill="#423C38" stroke={C.ink} strokeWidth={6} />
      {/* 奥: 舞台 (小さく)。芝居は続いている */}
      <rect x={-20} y={300} width={460} height={340} fill="#E8E0C4" stroke={C.ink} strokeWidth={7} />
      <rect x={-20} y={620} width={460} height={110} fill={C.hinoki} stroke={C.ink} strokeWidth={7} />
      <ellipse cx={130} cy={430} rx={110} ry={48} fill={C.makuMoegi} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={240} cy={644} rx={200} ry={40} fill={C.hikari} opacity={0.26} />
      <KabukiYakusha x={240} y={640} s={0.95} f={f} phase={1}
        pose="banzai" face="angry" iro={C.shu} iroDark={C.shuFukai} gara="koushi" />
      <polygon points="20,120 160,120 300,730 80,730" fill={C.hikari} opacity={0.26 + 0.07 * Math.sin(f / 9)} />
      {/* 提灯の列 (梁の下) */}
      <Chochin x={600} y={110} s={0.72} f={f} phase={0} />
      <Chochin x={1000} y={110} s={0.72} f={f} phase={1} />
      <Chochin x={1400} y={110} s={0.72} f={f} phase={2} />
      <Chochin x={1760} y={110} s={0.72} f={f} phase={3} />
      {/* 上の桟敷 (2階) */}
      <rect x={480} y={180} width={1460} height={300} fill={C.tatami} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.tatamiFuchi} strokeWidth={6} opacity={0.7}>
        <line x1={980} y1={180} x2={980} y2={480} />
        <line x1={1480} y1={180} x2={1480} y2={480} />
      </g>
      {/* 上段の宴: 家族が食べて飲んでいる */}
      <PersonMini x={640} y={470} s={0.95} color="#6E5E70" f={f} phase={0} face="smile" />
      <PersonMini x={810} y={474} s={0.9} color="#A8505A" f={f} phase={1} face="smile" arms="up" />
      <SushiOke x={730} y={470} s={0.6} />
      <PersonMini x={1120} y={470} s={0.95} color="#566072" f={f} phase={2} face="smile" />
      <PersonMini x={1340} y={474} s={0.88} color="#7A6A58" f={f} phase={3} face="dot" />
      <Tokkuri x={1230} y={476} s={1.1} />
      <BentoBox x={1250} y={470} s={0.8} rot={-3} />
      {/* 子ども: 菓子箱に手を伸ばす */}
      <PersonMini x={1600} y={468} s={0.62} color={C.mikan} f={f} phase={4} face="smile" arms="up" />
      <PersonMini x={1800} y={474} s={0.92} color="#4E6A8E" f={f} phase={5} face="smile" />
      <KashiBako x={1724} y={370 + Math.sin(f / 8) * 8} s={0.8} color="#D98A94" rot={-6} />
      <Yuge x={1240} y={420} f={f} s={0.7} />
      {/* 上段の手すり */}
      <rect x={460} y={474} width={1480} height={26} rx={8} fill={C.kijiDark} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={500 + i * 150} y={496} width={20} height={96}
          fill={C.kijiDark} stroke={C.ink} strokeWidth={5} />
      ))}
      <rect x={460} y={588} width={1480} height={22} rx={8} fill={C.kijiDark} stroke={C.ink} strokeWidth={6} />
      {/* 下の桟敷 (1階): 宴たけなわ */}
      <rect x={480} y={610} width={1460} height={260} fill="#BDB278" stroke={C.ink} strokeWidth={7} />
      <g stroke={C.tatamiFuchi} strokeWidth={6} opacity={0.6}>
        <line x1={1180} y1={610} x2={1180} y2={870} />
      </g>
      <PersonMini x={760} y={856} s={1.0} color="#8E6E4E" f={f} phase={6} face="smile" arms="up" />
      <PersonMini x={940} y={860} s={0.95} color="#6E5E70" f={f} phase={7} face="smile" />
      <SushiOke x={860} y={862} s={0.7} />
      <KashiBako x={1050} y={850} s={0.9} color="#A8C89A" rot={3} />
      <PersonMini x={1420} y={856} s={1.0} color="#A8505A" f={f} phase={8} face="smile" />
      <PersonMini x={1620} y={860} s={0.95} color="#566072" f={f} phase={9} face="smile" arms="up" />
      <Tokkuri x={1520} y={862} s={1.2} />
      {/* 転がるみかん */}
      <g transform={`translate(${mikanX} 866) rotate(${f * 9})`}>
        <circle r={22} fill={C.mikan} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={0} cy={-14} r={4} fill={C.kyuri} stroke={C.ink} strokeWidth={2.5} />
      </g>
      <circle cx={mikanX - 70} cy={872} r={18} fill={C.mikan} stroke={C.ink} strokeWidth={4} opacity={0.5} />
      {/* 廊下 (手前) と走る出方 */}
      <rect x={-20} y={870} width={W + 40} height={240} fill={C.kijiDark} />
      <line x1={-20} y1={870} x2={W + 20} y2={870} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.ink} strokeWidth={3.5} opacity={0.35}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={i * 360 - 60} y1={870} x2={i * 360 - 170} y2={1100} />
        ))}
      </g>
      {/* 出方: 寿司桶を頭上に掲げて走る */}
      <g>
        <ellipse cx={runX} cy={1056} rx={130} ry={24} fill={C.ink} opacity={0.22} />
        <Person x={runX} y={1048} s={1.45} cloth="#4E5E50" clothDark="#3A4A3E"
          face="smile" pose="raise" f={f} tasuki="出" />
        {/* 頭上の寿司桶 (腕の上) */}
        <SushiOke x={runX + 10} y={1048 - 452} s={0.95} rot={Math.sin(f / 7) * 4} />
        {/* 走りの勢いの線 */}
        <g stroke={KRP.white} strokeWidth={6} opacity={0.6} strokeLinecap="round">
          <line x1={runX - 190} y1={900} x2={runX - 310} y2={900} />
          <line x1={runX - 170} y1={960} x2={runX - 330} y2={960} />
          <line x1={runX - 190} y1={1020} x2={runX - 300} y2={1020} />
        </g>
      </g>
      {/* もうひとりの出方: 奥で菓子箱を抱えて続く */}
      <Person x={runX - 560} y={1020} s={1.1} cloth="#5E5A66" clothDark="#484552"
        face="normal" pose="hold" f={f} phase={2} />
      <KashiBako x={runX - 560} y={884} s={0.85} color="#8EA8C8" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #36 当時のお嬢さまの回想録には、その賑やかな食べっぷりが残っています。
// 格: 並 / seed 1035
// 絵: 開いた回想録の帳面。ページの中に挿絵として小さな桟敷の宴。筆文字がさらさら増える
// どこ: 行灯のともる部屋。文机の上に開いた回想録の帳面
// 演出: 右ページに挿絵 (小さな桟敷の宴)、左ページに筆文字の行がさらさら増える
// 動き: 行が1本ずつ伸びる・筆が行を追って下りる・行灯の明かり・茶の湯気
const Sg036: React.FC<{ f: number }> = ({ f }) => {
  const lines = 6; // 筆文字の行数
  const prog = seg(f, 4, 40) * lines; // いま何行目まで書けたか
  const curLine = Math.min(Math.floor(prog), lines - 1);
  const curT = clamp01(prog - curLine);
  // 左ページの紙の内側は x=560〜890 / y=340〜700。行がここからはみ出すと紙の外に字が出る
  const brushX = 890 - curLine * 66;
  const brushY = 378 + curT * 288;
  return (
    <Frame f={f} seed={1035} bg="#4E4238">
      {/* 夜の部屋: 畳と壁 */}
      <rect x={-20} y={-20} width={W + 40} height={560} fill="#5E5244" />
      <rect x={-20} y={540} width={W + 40} height={560} fill={C.tatami} />
      <line x1={-20} y1={540} x2={W + 20} y2={540} stroke={C.ink} strokeWidth={7} />
      <g stroke={C.tatamiFuchi} strokeWidth={7} opacity={0.6}>
        <line x1={420} y1={540} x2={200} y2={1100} />
        <line x1={1500} y1={540} x2={1720} y2={1100} />
      </g>
      {/* 行灯 (左) */}
      <g transform="translate(220 560)">
        <rect x={-80} y={-320} width={160} height={320} rx={10}
          fill={C.shoji} stroke={C.ink} strokeWidth={7} opacity={0.96} />
        <g stroke={C.kijiFukai} strokeWidth={5}>
          <line x1={-80} y1={-214} x2={80} y2={-214} />
          <line x1={-80} y1={-108} x2={80} y2={-108} />
          <line x1={0} y1={-320} x2={0} y2={0} />
        </g>
        <rect x={-92} y={-336} width={184} height={20} rx={6} fill={C.kijiFukai} stroke={C.ink} strokeWidth={5} />
        <rect x={-92} y={-4} width={184} height={20} rx={6} fill={C.kijiFukai} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={-160} r={56} fill={C.honoo} opacity={0.3 + 0.08 * Math.sin(f / 6)} />
      </g>
      <circle cx={220} cy={400} r={330} fill={C.honoo} opacity={0.07 + 0.02 * Math.sin(f / 6)} />
      {/* 文机 */}
      <rect x={360} y={760} width={1240} height={40} rx={10} fill={C.kijiFukai} stroke={C.ink} strokeWidth={8} />
      <rect x={420} y={800} width={44} height={180} fill={C.kijiFukai} stroke={C.ink} strokeWidth={6} />
      <rect x={1500} y={800} width={44} height={180} fill={C.kijiFukai} stroke={C.ink} strokeWidth={6} />
      {/* 開いた帳面 (和綴じ)。机の上に大きく */}
      <g>
        <path d="M 500 300 L 950 280 L 960 740 L 520 760 Z" fill={SGP.paper} stroke={C.ink} strokeWidth={8} />
        <path d="M 970 280 L 1420 300 L 1400 760 L 960 740 Z" fill={SGP.paper} stroke={C.ink} strokeWidth={8} />
        <line x1={955} y1={280} x2={962} y2={742} stroke={C.ink} strokeWidth={6} opacity={0.7} />
        {/* 綴じ糸 */}
        <g stroke={C.kijiFukai} strokeWidth={4} opacity={0.8}>
          {Array.from({ length: 4 }, (_, i) => (
            <circle key={i} cx={958} cy={330 + i * 110} r={9} fill="none" />
          ))}
        </g>
        {/* 左ページ: 筆文字の行 (右の行から順に、上から下へさらさら) */}
        {Array.from({ length: lines }, (_, i) => {
          const t = clamp01(prog - i);
          if (t <= 0) return null;
          const x = 890 - i * 66;
          return (
            <path key={i}
              d={`M ${x} 378 q 12 50 -5 98 q -12 46 7 92 q 10 46 -3 98`}
              fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round"
              strokeDasharray={320} strokeDashoffset={320 * (1 - t)} opacity={0.82} />
          );
        })}
        {/* 左ページの頭の朱点 (段落の印) */}
        <circle cx={890} cy={338} r={9} fill={SGP.shuin} opacity={clamp01(prog)} />
        {/* 右ページ: 挿絵 — 小さな桟敷の宴 */}
        <g>
          <rect x={1020} y={340} width={330} height={300} rx={8}
            fill="#F8F2E0" stroke={C.ink} strokeWidth={5} />
          {/* 挿絵の中身 (細い線の小さな絵) */}
          <rect x={1040} y={510} width={290} height={24} fill={C.tatami} stroke={C.ink} strokeWidth={3.5} />
          <PersonMini x={1100} y={510} s={0.42} color="#A8505A" f={f} phase={0} face="smile" arms="up" />
          <PersonMini x={1180} y={512} s={0.4} color="#566072" f={f} phase={1} face="smile" />
          <PersonMini x={1290} y={512} s={0.42} color="#6E5E70" f={f} phase={2} face="smile" />
          <SushiOke x={1238} y={512} s={0.3} />
          <Tokkuri x={1130} y={514} s={0.6} />
          {/* 挿絵の中の手すり */}
          <rect x={1040} y={534} width={290} height={10} fill={C.kijiDark} stroke={C.ink} strokeWidth={3} />
          <g stroke={C.kijiDark} strokeWidth={3}>
            {Array.from({ length: 5 }, (_, i) => (
              <line key={i} x1={1065 + i * 60} y1={544} x2={1065 + i * 60} y2={590} />
            ))}
          </g>
          {/* 挿絵の下の添え書き (読めない崩し字) */}
          <path d="M 1060 614 q 40 -12 80 0 q 40 10 80 -2 q 36 -8 70 2"
            fill="none" stroke={C.ink} strokeWidth={5} opacity={0.6} />
        </g>
      </g>
      {/* 筆 (いま書いている行の先) */}
      <g transform={`translate(${brushX} ${brushY}) rotate(24)`}>
        <line x1={0} y1={0} x2={0} y2={-150} stroke={C.kijiFukai} strokeWidth={11} />
        <path d="M -8 0 Q 0 26 8 0 Z" fill={C.ink} />
        <line x1={0} y1={-150} x2={0} y2={-176} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 硯と墨と文鎮 */}
      <g transform="translate(1540 700)">
        <rect x={-90} y={-26} width={180} height={52} rx={10} fill="#3A3632" stroke={C.ink} strokeWidth={6} />
        <ellipse cx={-20} cy={-2} rx={46} ry={14} fill={C.ink} />
        <rect x={34} y={-50} width={34} height={44} rx={4} fill="#2E2A28" stroke={C.ink} strokeWidth={5} />
      </g>
      <rect x={560} y={310} width={150} height={22} rx={10} fill={KRP.brass} stroke={C.ink} strokeWidth={5} />
      {/* 湯のみ */}
      <g transform="translate(1680 560)">
        <path d="M -34 0 L -28 -56 L 28 -56 L 34 0 Z" fill="#7A8E6E" stroke={C.ink} strokeWidth={5} />
        <Yuge x={0} y={-62} f={f} s={0.8} />
      </g>
      <TagPlate x={330} y={150} text="回想録" size={40} t={seg(f, 10, 24)} fill="#FBE3C8" />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #37 身分の高いお客は、幕間のたびに、芝居茶屋という別の建物へ引き上げます。
// 格: 山 / seed 1036
// 絵: 江戸の芝居町 (猿若町あたり) の2軒。左に芝居小屋、右に芝居茶屋。間は土の道
// どこ: 昼の芝居町の通り。引きの絵。小屋は櫓・木戸・看板・幟・提灯、茶屋は二階座敷と暖簾
// 演出: 幕間。身分の高い客が小屋の木戸から出て、土の道をわたって茶屋へ引き上げる
// 動き: 客の列が小屋→茶屋へ歩く・点線の矢印が伸びる・幟がはためく・雲が流れる・水たまりが光る
const Sg037: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 4, 38));       // 客が小屋 → 茶屋へ歩く
  const wx = lerp(630, 1180, walk);          // 先頭の客のx
  const arrowT = easeOut(seg(f, 10, 34));    // 点線の矢印が伸びる
  // 小屋の屋根 (板葺き) の左右の縁。y から x を出す
  const roofL = (y: number) => 40 + (400 - y) * 1.25;
  const roofR = (y: number) => 870 - (400 - y) * 1.25;
  return (
    <Frame f={f} seed={1036} bg={C.hiruSora}>
      {/* ===== 昼の空 ===== */}
      <rect x={-20} y={-20} width={W + 40} height={480} fill={C.hiruSora} />
      <rect x={-20} y={250} width={W + 40} height={210} fill={C.hiruSoraShita} opacity={0.75} />
      {/* 薄い雲 (ゆっくり流れる) */}
      {Array.from({ length: 5 }, (_, i) => {
        const cx = ((i * 430 + f * 1.6 + rnd(21, i) * 200) % 2300) - 180;
        const cy = 70 + rnd(22, i) * 170;
        const sc = 0.7 + rnd(23, i) * 0.6;
        return (
          <g key={i} opacity={0.72} transform={`translate(${cx} ${cy}) scale(${sc})`}>
            <ellipse cx={0} cy={0} rx={120} ry={34} fill={C.kumo} />
            <ellipse cx={-62} cy={10} rx={74} ry={26} fill={C.kumo} />
            <ellipse cx={58} cy={12} rx={88} ry={24} fill={C.kumo} />
            <ellipse cx={-10} cy={-22} rx={66} ry={28} fill={C.kumo} />
          </g>
        );
      })}
      {/* ===== 遠景の町 (空気遠近。薄く) ===== */}
      <g opacity={0.6}>
        {Array.from({ length: 13 }, (_, i) => {
          const x = i * 160 - 60;
          const h = 34 + rnd(24, i) * 34;
          return (
            <g key={i}>
              <polygon points={`${x},${448 - h} ${x + 40},${448 - h - 22} ${x + 112},${448 - h - 22} ${x + 152},${448 - h}`}
                fill={C.toomi} />
              <rect x={x + 16} y={448 - h} width={120} height={h} fill={C.toomi} />
            </g>
          );
        })}
      </g>
      {/* ===== 地面 (土) ===== */}
      <rect x={-20} y={440} width={W + 40} height={H - 420} fill={C.tsuchi} />
      <line x1={-20} y1={440} x2={W + 20} y2={440} stroke={C.ink} strokeWidth={5} opacity={0.5} />
      {/* 奥の板塀 (芝居町が続いている) */}
      <g>
        <rect x={660} y={474} width={700} height={96} fill={C.itakabeKage} stroke={C.ink} strokeWidth={6} />
        <g stroke={C.ink} strokeWidth={3.5} opacity={0.5}>
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1={678 + i * 43} y1={474} x2={678 + i * 43} y2={570} />
          ))}
        </g>
        <rect x={650} y={462} width={720} height={18} rx={5} fill={C.sugikawa} stroke={C.ink} strokeWidth={5} />
      </g>
      {/* 奥の町家 (2軒のあいだの奥。芝居町の続き) */}
      <g>
        <polygon points="846,620 930,562 1116,562 1200,620" fill={C.sugikawa} stroke={C.ink} strokeWidth={7} />
        <rect x={924} y={552} width={198} height={16} rx={5} fill={C.sugikawaHi} stroke={C.ink} strokeWidth={5} />
        <rect x={874} y={620} width={300} height={88} fill={C.itakabe} stroke={C.ink} strokeWidth={7} />
        <g stroke={C.itakabeKage} strokeWidth={4} opacity={0.8}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={894 + i * 36} y1={620} x2={894 + i * 36} y2={708} />
          ))}
        </g>
        <rect x={900} y={648} width={100} height={60} fill={C.noren} stroke={C.ink} strokeWidth={5} />
        <circle cx={950} cy={676} r={13} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.8} />
        <rect x={1046} y={640} width={104} height={68} fill={C.shoji} stroke={C.ink} strokeWidth={5} />
        <g stroke={C.kijiDark} strokeWidth={4} opacity={0.8}>
          <line x1={1080} y1={640} x2={1080} y2={708} />
          <line x1={1114} y1={640} x2={1114} y2={708} />
          <line x1={1046} y1={674} x2={1150} y2={674} />
        </g>
        <PersonMini x={1198} y={706} s={0.44} color="#7A6A58" f={f} phase={5} face="dot" />
        <PersonMini x={848} y={704} s={0.4} color="#566072" f={f} phase={2} face="dot" />
      </g>
      {/* ===== 土の道 (石ではなく土)。わだちと水たまり ===== */}
      <path d="M -20 1080 L 1940 1080 L 1940 850 L 1240 808 L 1180 706 L 880 706 L 700 816 L -20 864 Z"
        fill={C.tsuchiAkari} stroke={C.ink} strokeWidth={6} />
      {/* わだち (車輪の跡) */}
      <g fill="none" stroke={C.tsuchiKage} strokeWidth={13} opacity={0.75}>
        <path d="M 946 712 Q 860 880 560 1080" />
        <path d="M 1086 712 Q 1120 880 1240 1080" />
        <path d="M 1010 712 Q 980 880 900 1080" strokeWidth={9} opacity={0.5} />
      </g>
      {/* 水たまり (日が映ってゆれる) */}
      {([[480, 1004, 1.25], [1420, 962, 0.9], [860, 916, 0.65]] as const).map(([px, py, ps], i) => (
        <g key={i}>
          <ellipse cx={px} cy={py} rx={120 * ps} ry={30 * ps} fill={C.mizu} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={px - 20 * ps + Math.sin((f + i * 11) / 9) * 10} cy={py - 6 * ps}
            rx={52 * ps} ry={10 * ps} fill={KRP.white} opacity={0.5} />
        </g>
      ))}
      {/* 小石とくぼみ */}
      <g opacity={0.5}>
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse key={i} cx={rnd(25, i) * 1960 - 20} cy={880 + rnd(26, i) * 200}
            rx={5 + rnd(27, i) * 9} ry={3 + rnd(28, i) * 5} fill={C.tsuchiKage} />
        ))}
      </g>

      {/* ===================== 芝居小屋 (左。大きく) ===================== */}
      <g>
        {/* 板葺き (杉皮) の屋根 */}
        <polygon points="40,400 170,296 740,296 870,400" fill={C.sugikawa} stroke={C.ink} strokeWidth={9} />
        <g stroke={C.sugikawaHi} strokeWidth={5} opacity={0.55}>
          {[318, 338, 358, 378].map((y) => (
            <line key={y} x1={roofL(y)} y1={y} x2={roofR(y)} y2={y} />
          ))}
        </g>
        <g stroke={C.ink} strokeWidth={3.5} opacity={0.35}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={190 + i * 54} y1={300} x2={150 + i * 62} y2={398} />
          ))}
        </g>
        <rect x={160} y={284} width={590} height={20} rx={6} fill={C.sugikawaHi} stroke={C.ink} strokeWidth={6} />
        {/* 櫓 (official な劇場の印) */}
        <YaguraB x={452} y={296} s={0.92} f={f} />
        {/* 縦板張りの壁 */}
        <rect x={108} y={398} width={690} height={414} fill={C.itakabe} stroke={C.ink} strokeWidth={9} />
        <g stroke={C.itakabeKage} strokeWidth={5} opacity={0.85}>
          {Array.from({ length: 19 }, (_, i) => (
            <line key={i} x1={132 + i * 36} y1={400} x2={132 + i * 36} y2={810} />
          ))}
        </g>
        {/* 板の木目 */}
        <g fill="none" stroke={C.kijiFukai} strokeWidth={3} opacity={0.4}>
          {Array.from({ length: 10 }, (_, i) => {
            const bx = 150 + Math.floor(rnd(31, i) * 18) * 36;
            const by = 430 + rnd(32, i) * 330;
            return <path key={i} d={`M ${bx} ${by} q 9 ${22 + rnd(33, i) * 20} 0 ${44 + rnd(33, i) * 40}`} />;
          })}
        </g>
        {/* 軒桁 */}
        <rect x={86} y={392} width={734} height={28} rx={7} fill={C.kijiFukai} stroke={C.ink} strokeWidth={7} />
        {/* 軒下の丸提灯 (横一列) */}
        {Array.from({ length: 7 }, (_, i) => (
          <Chochin key={i} x={142 + i * 104} y={426} s={0.58} f={f} phase={i} />
        ))}
        {/* 芝居看板 (絵看板2枚。文字は書かず墨の筋だけ) */}
        {Array.from({ length: 2 }, (_, i) => {
          const bx = 136 + i * 236;
          return (
            <g key={i}>
              <rect x={bx} y={508} width={216} height={140} rx={6}
                fill={C.shoji} stroke={C.ink} strokeWidth={7} />
              <rect x={bx + 10} y={518} width={196} height={120} rx={4}
                fill="none" stroke={C.kijiFukai} strokeWidth={4} />
              {/* 中の役者絵 (板絵。隈取の顔と広い袖) */}
              <circle cx={bx + 70} cy={556} r={24} fill="#F2E0C8" stroke={C.ink} strokeWidth={4} />
              <g stroke={C.shu} strokeWidth={4} fill="none">
                <path d={`M ${bx + 52} 542 q 8 8 4 17`} />
                <path d={`M ${bx + 88} 542 q -8 8 -4 17`} />
              </g>
              <circle cx={bx + 62} cy={554} r={3.5} fill={C.ink} />
              <circle cx={bx + 78} cy={554} r={3.5} fill={C.ink} />
              <path d={`M ${bx + 46} 582 L ${bx + 128} 566 L ${bx + 192} 596 L ${bx + 150} 626 L ${bx + 66} 622 Z`}
                fill={[C.shu, C.ai][i]} stroke={C.ink} strokeWidth={5} />
              <g stroke={KRP.white} strokeWidth={5} opacity={0.5}>
                <line x1={bx + 60} y1={600} x2={bx + 180} y2={592} />
              </g>
              {/* 墨の筋 (文字のかわり) */}
              <g stroke={C.ink} strokeWidth={5} opacity={0.75} strokeLinecap="round">
                <line x1={bx + 176} y1={524} x2={bx + 176} y2={556} />
                <line x1={bx + 196} y1={524} x2={bx + 196} y2={548} />
              </g>
            </g>
          );
        })}
        {/* 名前の書かれた木札の列 (字は書かず墨の筋) */}
        {Array.from({ length: 4 }, (_, i) => (
          <g key={i}>
            <rect x={616 + i * 46} y={508} width={38} height={104} rx={4}
              fill={C.kiji} stroke={C.ink} strokeWidth={5} />
            <g stroke={C.ink} strokeWidth={4.5} opacity={0.7} strokeLinecap="round">
              <line x1={635 + i * 46} y1={522} x2={635 + i * 46} y2={560} />
              <line x1={635 + i * 46} y1={572} x2={635 + i * 46} y2={598} />
            </g>
          </g>
        ))}
        {/* 木戸 (正面の低い入口) */}
        <rect x={286} y={652} width={280} height={26} rx={6} fill={C.kijiFukai} stroke={C.ink} strokeWidth={7} />
        <rect x={306} y={676} width={240} height={136} fill="#3A332B" stroke={C.ink} strokeWidth={8} />
        <g stroke={C.kijiDark} strokeWidth={9}>
          <line x1={306} y1={700} x2={546} y2={700} />
          <line x1={386} y1={676} x2={386} y2={812} />
          <line x1={466} y1={676} x2={466} y2={812} />
        </g>
        {/* 木戸から出てくる人の気配 (奥の明かり) */}
        <ellipse cx={426} cy={790} rx={88} ry={24} fill={C.akari} opacity={0.22} />
      </g>
      {/* 幟 (入口の両側。風で揺れる) */}
      <Nobori x={62} y={814} s={0.92} f={f} phase={0} color={C.shu} />
      <Nobori x={792} y={810} s={0.86} f={f} phase={2} color={C.ai} />

      {/* ===================== 芝居茶屋 (右。小屋より小さく上等な構え) ===== */}
      <g>
        {/* 瓦屋根 (小屋より上等) */}
        <polygon points="1172,348 1268,272 1696,272 1792,348" fill={C.kawara} stroke={C.ink} strokeWidth={8} />
        <g stroke={C.kawaraHi} strokeWidth={5} opacity={0.6}>
          <line x1={1210} y1={316} x2={1754} y2={316} />
          <line x1={1190} y1={334} x2={1774} y2={334} />
        </g>
        <rect x={1260} y={262} width={444} height={18} rx={6} fill="#4A525C" stroke={C.ink} strokeWidth={6} />
        {/* 二階の座敷 (障子) */}
        <rect x={1208} y={346} width={548} height={158} fill={C.shoji} stroke={C.ink} strokeWidth={8} />
        <g stroke={C.kijiDark} strokeWidth={5} opacity={0.85}>
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={1208 + (i + 1) * 91} y1={346} x2={1208 + (i + 1) * 91} y2={504} />
          ))}
          <line x1={1208} y1={400} x2={1756} y2={400} />
          <line x1={1208} y1={452} x2={1756} y2={452} />
        </g>
        {/* 二階の座敷の中 (幕間の客が上がっている) */}
        <rect x={1300} y={372} width={360} height={132} fill="#6E5E4A" stroke={C.ink} strokeWidth={6} />
        <rect x={1300} y={462} width={360} height={42} fill={C.tatami} stroke={C.ink} strokeWidth={5} />
        {/* 欄干から芝居小屋のほうを見ている客 */}
        <PersonMini x={1356} y={512} s={0.86} color="#A8505A" f={f} phase={1} face="dot" />
        <PersonMini x={1476} y={514} s={0.82} color="#4E6A8E" f={f} phase={3} face="dot" />
        <PersonMini x={1596} y={510} s={0.8} color="#6E5E70" f={f} phase={6} face="dot" arms="up" />
        {/* 欄干 (らんかん) */}
        <rect x={1188} y={494} width={588} height={18} rx={6} fill={C.kijiFukai} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={1206 + i * 44} y={510} width={14} height={42}
            fill={C.kijiDark} stroke={C.ink} strokeWidth={4.5} />
        ))}
        <rect x={1188} y={548} width={588} height={16} rx={6} fill={C.kijiFukai} stroke={C.ink} strokeWidth={6} />
        {/* 一階 (土間と暖簾) */}
        <rect x={1208} y={562} width={548} height={246} fill={C.itakabe} stroke={C.ink} strokeWidth={8} />
        <g stroke={C.itakabeKage} strokeWidth={5} opacity={0.8}>
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={1226 + i * 92} y1={562} x2={1226 + i * 92} y2={806} />
          ))}
        </g>
        {/* 土間の口 */}
        <rect x={1296} y={620} width={372} height={188} fill="#3E372E" stroke={C.ink} strokeWidth={8} />
        <rect x={1312} y={700} width={340} height={108} fill="#58503F" opacity={0.9} />
        {/* 暖簾 (無地と簡単な縞。屋号の字は書かない。印は丸と菱) */}
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i}
            d={`M ${1308 + i * 72} 626 q ${Math.sin(f / 9 + i) * 6} 48 0 96 l 60 0 q ${-Math.sin(f / 9 + i) * 6} -48 0 -96 Z`}
            fill={C.noren} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={1300} y={616} width={364} height={22} fill="#2E3A54" stroke={C.ink} strokeWidth={5} />
        <circle cx={1414} cy={672} r={18} fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.85} />
        <path d="M 1552 654 L 1570 672 L 1552 690 L 1534 672 Z" fill={KRP.white} opacity={0.85} />
        {/* 軒行灯 (のきあんどん) */}
        <NokiAndon x={1252} y={580} s={0.92} f={f} phase={0} />
        <NokiAndon x={1712} y={580} s={0.92} f={f} phase={3} />
        {/* 庭木 (建物の脇) */}
        <g>
          <rect x={1836} y={660} width={26} height={150} fill={C.kijiFukai} stroke={C.ink} strokeWidth={5} />
          <circle cx={1850} cy={620} r={72} fill={C.midori} stroke={C.ink} strokeWidth={7} />
          <circle cx={1790} cy={664} r={46} fill={C.midoriHi} stroke={C.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 茶屋の前: 打ち水で濡れた地面と下駄 */}
      <g>
        <ellipse cx={1468} cy={848} rx={330} ry={48} fill={C.tsuchiNure} opacity={0.72} />
        <ellipse cx={1330} cy={866} rx={120} ry={24} fill={C.tsuchiNure} opacity={0.6} />
        <ellipse cx={1620} cy={862} rx={140} ry={26} fill={C.tsuchiNure} opacity={0.55} />
        <ellipse cx={1500 + Math.sin(f / 10) * 14} cy={842} rx={90} ry={13}
          fill={KRP.white} opacity={0.26} />
        <Geta x={1312} y={862} rot={-7} s={0.9} />
        <Geta x={1396} y={870} rot={4} s={0.9} />
        <Geta x={1482} y={860} rot={-3} s={0.9} />
        <Geta x={1566} y={870} rot={8} s={0.9} />
        <Geta x={1652} y={858} rot={-5} s={0.9} />
      </g>
      {/* 木戸番 (入口に座って銭を受け取る人) と銭箱 */}
      <g>
        <ellipse cx={646} cy={892} rx={96} ry={22} fill={C.ink} opacity={0.16} />
        <Person x={646} y={886} s={0.86} cloth="#4E5E50" clothDark="#3A4A3E"
          face="normal" gaze={[-5, 2]} pose="hold" f={f} phase={4} />
        <rect x={576} y={822} width={142} height={74} rx={7} fill={C.kijiDark} stroke={C.ink} strokeWidth={7} />
        <rect x={596} y={810} width={102} height={16} rx={5} fill={C.kiji} stroke={C.ink} strokeWidth={5} />
        <line x1={647} y1={822} x2={647} y2={896} stroke={C.ink} strokeWidth={4} opacity={0.6} />
        {/* 受け取った銭 */}
        <circle cx={610} cy={800} r={12} fill={C.kincha} stroke={C.ink} strokeWidth={4} />
        <circle cx={684} cy={802} r={12} fill={C.kincha} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* ===== 道の上の点線の矢印 (小屋 → 茶屋) ===== */}
      <g opacity={0.9}>
        <path d={`M 700 1016 Q 960 1000 ${lerp(700, 1232, arrowT)} ${lerp(1016, 968, arrowT)}`}
          fill="none" stroke={KRP.orange} strokeWidth={22} strokeLinecap="round"
          strokeDasharray="30 22" strokeDashoffset={-f * 4} />
        {arrowT > 0.9 && (
          <polygon points="1296,966 1226,936 1232,1000" fill={KRP.orange} stroke={C.ink} strokeWidth={5} />
        )}
      </g>
      {/* ===== 身分の高い客の列 (小屋 → 茶屋) ===== */}
      <g>
        {/* お付き (先に立って案内する) */}
        <PersonMini x={wx + 112} y={930} s={0.72} color="#5E5A66" f={f} phase={7} face="dot" />
        {/* 侍 (羽織・刀) */}
        <ellipse cx={wx} cy={906} rx={86} ry={20} fill={C.ink} opacity={0.18} />
        <Person x={wx} y={900} s={0.84} cloth="#4A5A72" clothDark="#36445C"
          face="normal" gaze={[5, 0]} f={f} phase={1} />
        <PersonRig x={wx} y={900} s={0.84} f={f} phase={1}>
          <HaoriKatana iro="#3A4A62" iroDark="#283548" katana />
        </PersonRig>
        {/* 商家の主人 (刀は差さない) */}
        <ellipse cx={wx - 168} cy={918} rx={78} ry={18} fill={C.ink} opacity={0.16} />
        <Person x={wx - 168} y={912} s={0.78} cloth="#6E5A4A" clothDark="#54433A"
          face="normal" gaze={[5, 1]} f={f} phase={5} />
        <PersonRig x={wx - 168} y={912} s={0.78} f={f} phase={5}>
          <HaoriKatana iro="#5A4A3E" iroDark="#42352C" katana={false} />
        </PersonRig>
        {/* 後ろのお付き */}
        <PersonMini x={wx - 290} y={926} s={0.68} color="#6A5E58" f={f} phase={9} face="dot" />
      </g>
      <TagPlate x={238} y={190} text="芝居小屋" size={40} t={seg(f, 6, 18)} />
      <TagPlate x={1472} y={190} text="芝居茶屋" size={40} t={seg(f, 14, 26)} fill="#FBE3C8" />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_026: (f) => <Sg026 f={f} />,
  sg_027: (f) => <Sg027 f={f} />,
  sg_028: (f) => <Sg028 f={f} />,
  sg_029: (f) => <Sg029 f={f} />,
  sg_030: (f) => <Sg030 f={f} />,
  sg_031: (f) => <Sg031 f={f} />,
  sg_032: (f) => <Sg032 f={f} />,
  sg_033: (f) => <Sg033 f={f} />,
  sg_034: (f) => <Sg034 f={f} />,
  sg_035: (f) => <Sg035 f={f} />,
  sg_036: (f) => <Sg036 f={f} />,
  sg_037: (f) => <Sg037 f={f} />,
};

export const S_B1_MOTIFS: string[] = [
  "sg_026", // #26
  "sg_027", // #27
  "sg_028", // #28
  "sg_029", // #29
  "sg_030", // #30
  "sg_031", // #31
  "sg_032", // #32
  "sg_033", // #33
  "sg_034", // #34
  "sg_035", // #35
  "sg_036", // #36
  "sg_037", // #37
];

export const saigoB1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
