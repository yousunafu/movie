// 「『2位』は、120年前に発明された」: 第2章「一番槍は、書類仕事。」
// 担当範囲: 台本 docs/ichiban-script-v1.txt の 37〜48行目 (文#36〜#47・12文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は必ず ib2_ で始める。WobbleDefs の seed はこのファイルでは 935〜946 を使う。
// 設計書: docs/briefs/IchiB2.md (1文ごとの「格」と絵の中身が決まっている)
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
// ★連番ペアは絵を複製しない。1つの部品に phase prop を持たせて切り替える:
//   #41/#43 = 軍忠状の書面 (phase 1/2)、#45/#46 = 戦場の絵図 (phase 1/2)。
//   #47 だけは本物の日本列島 (IchiB2JapanMap.tsx) に差し替えてある。

import React from "react";
import { useCurrentFrame } from "remotion";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow,
} from "./IchiShared";
import { lerp, zoomAt, GridPaper, ForceArrow } from "./KosoB2Parts";
import { IchiB2JapanMap, IB2_VILLAGE_XY } from "./IchiB2JapanMap";

// ===================================================================
// このファイルだけで使う色 (第2章 = 戦国の戦場 + 軍忠状の和紙)
// ===================================================================
const C = {
  bannerRed: "#B5452F",   // 旗指物の赤
  jinmakuNavy: "#3C4A66", // 陣幕の紺
  armor: "#4A4A42",       // 甲冑の黒鉄
  armorDark: "#32322C",
  dust: "#C2B193",        // 土煙
  field: "#A89A6E",       // 戦場の野
  washi: "#EFE7D4",       // 軍忠状の和紙
  washiDark: "#D8CBB0",
  sumi: "#2E2A26",        // 墨
  kinri: "#B8933E",       // 金 (名誉のきらめき)
  mapPaper: "#E7DCC2",    // 地図の紙
  mapLine: "#A08A62",
  sky: "#DCE4DA",         // 戦場の空 (薄い霞)
  eveSky: "#E6BE8E",      // 陣中の夕空
  mountain: "#8E9A88",    // 遠山
  wood: "#9B7B4F",        // 文机・床几の木
  sea: "#C8D2C6",         // 地図の海
  // ↓ 第16条「作り込みの床の法」で足した質感の色 (どれも彩度低め。主役より前に出さない)
  fieldDark: "#8C7F55",   // 土の斑・わだち・足あと
  stone: "#BFB49A",       // 小石
  grass: "#858D5E",       // 草
  tatami: "#CFCCA8",      // 陣屋の畳
  tatamiDark: "#AEAA82",
  fuchi: "#4E4F3E",       // 畳縁
  floor: "#7A6242",       // 板床
  floorDark: "#5F4B31",
} as const;
void Bolt; void Stamp; void Arrow; void zoomAt;

// ===================================================================
// この章だけのローカル部品
// ===================================================================

// --- 槍。(x,y)=石突 (持ち手の下端)。rot 0 = 真上、90 = 右向き。 ---
const Yari: React.FC<{
  x: number; y: number; len?: number; rot?: number; s?: number;
}> = ({ x, y, len = 300, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {/* 柄 */}
    <rect x={-6} y={-len} width={12} height={len} rx={5}
      fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
    {/* 血止めの房 (赤) */}
    <path d={`M -14 ${-len + 4} Q 0 ${-len + 26} 14 ${-len + 4} L 10 ${-len - 2} L -10 ${-len - 2} Z`}
      fill={C.bannerRed} stroke={KRP.ink} strokeWidth={3.5} />
    {/* 穂先 (笹の葉型) */}
    <path d={`M 0 ${-len - 86} Q 13 ${-len - 46} 9 ${-len - 6} L -9 ${-len - 6} Q -13 ${-len - 46} 0 ${-len - 86} Z`}
      fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
    <line x1={0} y1={-len - 76} x2={0} y2={-len - 10} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
  </g>
);

// --- 旗指物 (幟)。(x,y)=竿の根元。布が f で波打つ。 ---
const Nobori: React.FC<{
  x: number; y: number; h?: number; color?: string;
  pattern?: "maru" | "shima"; f: number; phase?: number; s?: number;
}> = ({ x, y, h = 420, color = C.bannerRed, pattern = "maru", f, phase = 0, s = 1 }) => {
  const wv = Math.sin(f / 8 + phase * 1.7) * 12;
  const wv2 = Math.sin(f / 8 + phase * 1.7 + 1.4) * 14;
  const fw = 96, fh = h * 0.62, ty = -h;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 竿と横棒 */}
      <rect x={-5} y={-h - 26} width={10} height={h + 26} rx={4}
        fill={C.wood} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-5} y={ty - 24} width={fw + 10} height={9} rx={4}
        fill={C.wood} stroke={KRP.ink} strokeWidth={3} />
      {/* 布 (下辺が風で揺れる) */}
      <path d={`M 6 ${ty - 14} L ${fw} ${ty - 14}
        Q ${fw + wv} ${ty + fh * 0.5} ${fw + wv2} ${ty + fh}
        L ${6 + wv2 * 0.4} ${ty + fh} Q ${6 + wv * 0.3} ${ty + fh * 0.5} 6 ${ty - 14} Z`}
        fill={color} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 紋 (抽象柄。実在の家紋は使わない) */}
      {pattern === "maru" ? (
        <circle cx={fw * 0.52 + wv * 0.4} cy={ty + fh * 0.4} r={fw * 0.26}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      ) : (
        <g fill={KRP.white} stroke={KRP.ink} strokeWidth={3}>
          <rect x={14} y={ty + fh * 0.3} width={fw - 20} height={16} rx={6} />
          <rect x={14 + wv * 0.3} y={ty + fh * 0.58} width={fw - 20} height={16} rx={6} />
        </g>
      )}
    </g>
  );
};

// --- 陣幕。(x,y)=左上。縦の継ぎ目+白帯、裾が f で揺れる。 ---
const Jinmaku: React.FC<{
  x: number; y: number; w: number; h: number; f: number; color?: string;
}> = ({ x, y, w, h, f, color = C.jinmakuNavy }) => {
  const sway = (i: number) => Math.sin(f / 10 + i * 1.3) * 5;
  const nPanel = Math.max(2, Math.round(w / 260));
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 張り綱 */}
      <line x1={-30} y1={-18} x2={w + 30} y2={-18} stroke={KRP.ink} strokeWidth={5} />
      {/* 幕本体 (裾が波) */}
      <path d={`M 0 0 L ${w} 0 L ${w} ${h - 10}
        ${Array.from({ length: nPanel * 2 }, (_, i) => {
          const px = w - ((i + 1) * w) / (nPanel * 2);
          return `Q ${px + w / (nPanel * 4)} ${h + 12 + sway(i)} ${px} ${h - 6}`;
        }).join(" ")} Z`}
        fill={color} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 白帯と継ぎ目 */}
      <rect x={0} y={h * 0.2} width={w} height={h * 0.14} fill={KRP.white}
        stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
      {Array.from({ length: nPanel - 1 }, (_, i) => (
        <line key={i} x1={((i + 1) * w) / nPanel} y1={4} x2={((i + 1) * w) / nPanel} y2={h - 12}
          stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      ))}
      {/* 吊り紐 */}
      {Array.from({ length: nPanel + 1 }, (_, i) => (
        <line key={`r${i}`} x1={(i * w) / nPanel} y1={-18} x2={(i * w) / nPanel} y2={2}
          stroke={KRP.ink} strokeWidth={4} />
      ))}
    </g>
  );
};

// --- 甲冑武士。(x,y)=足元 (sitは座り底)。#37/#38/#40/#42 で使い回す。 ---
// pose: raise=槍を天に掲げる / run=前傾で疾走 / sit=正座して筆をとる
const Bushi: React.FC<{
  x: number; y: number; s?: number; pose: "raise" | "run" | "sit";
  f: number; phase?: number; dir?: 1 | -1; brow?: "hot" | "calm";
}> = ({ x, y, s = 1, pose, f, phase = 0, dir = 1, brow = "hot" }) => {
  const bob = pose === "run" ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  const run = pose === "run" ? Math.sin(f / 3 + phase) : 0; // 走りの脚さばき
  const brush = Math.sin(f / 6 + phase) * 4;                 // 筆先のゆれ
  const Head: React.FC<{ hx: number; hy: number; tilt?: number }> = ({ hx, hy, tilt = 0 }) => (
    <g transform={`translate(${hx} ${hy}) rotate(${tilt})`}>
      {/* 顔 */}
      <circle cx={0} cy={0} r={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 兜鉢 + 吹き返し + 鍬形 (金) */}
      <path d="M -56 -14 Q -56 -66 0 -68 Q 56 -66 56 -14 Z" fill={C.armor} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-66} y={-20} width={132} height={13} rx={6} fill={C.armor} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -12 -62 Q -30 -108 -40 -116 Q -16 -104 -6 -66 Z" fill={C.kinri} stroke={KRP.ink} strokeWidth={3.5} />
      <path d="M 12 -62 Q 30 -108 40 -116 Q 16 -104 6 -66 Z" fill={C.kinri} stroke={KRP.ink} strokeWidth={3.5} />
      <circle cx={0} cy={-56} r={9} fill={C.kinri} stroke={KRP.ink} strokeWidth={3} />
      {/* しころ (首の後ろの段) */}
      <path d="M 40 -16 Q 62 2 58 26 L 44 20 Q 50 2 36 -10 Z" fill={C.armor} stroke={KRP.ink} strokeWidth={3.5} />
      {/* 目・眉・口 (きりっと。間抜けに描かない) */}
      <ellipse cx={-14} cy={6} rx={10} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      <ellipse cx={22} cy={6} rx={10} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      <circle cx={-11} cy={8} r={5} fill={KRP.ink} />
      <circle cx={25} cy={8} r={5} fill={KRP.ink} />
      <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
        {brow === "hot" ? (
          <>
            <line x1={-26} y1={-12} x2={-6} y2={-6} />
            <line x1={12} y1={-6} x2={32} y2={-12} />
          </>
        ) : (
          <>
            <line x1={-26} y1={-8} x2={-6} y2={-9} />
            <line x1={12} y1={-9} x2={32} y2={-8} />
          </>
        )}
      </g>
      <line x1={-2} y1={34} x2={16} y2={34} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
    </g>
  );
  // 胴丸 (胴+草摺)。(0,0)=胴の下端中央
  const Dou: React.FC<{ w?: number }> = ({ w = 112 }) => (
    <g>
      <rect x={-w / 2} y={-104} width={w} height={104} rx={14}
        fill={C.armor} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 札板の横段 (威し糸) */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={-w / 2 + 8} y1={-82 + i * 26} x2={w / 2 - 8} y2={-82 + i * 26}
          stroke={C.kinri} strokeWidth={3.5} opacity={0.8} />
      ))}
      {/* 草摺 (台形の垂れ x3) */}
      {[-1, 0, 1].map((i) => (
        <path key={i} d={`M ${i * 36 - 20} 0 L ${i * 36 + 20} 0 L ${i * 36 + 26} 40 L ${i * 36 - 26} 40 Z`}
          fill={C.armorDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
    </g>
  );
  // 肩の袖 (大袖)
  const Sode: React.FC<{ sx: number; rot?: number }> = ({ sx, rot = 0 }) => (
    <g transform={`translate(${sx} -96) rotate(${rot})`}>
      <path d="M -22 -10 L 22 -10 L 26 44 Q 0 56 -26 44 Z" fill={C.armor} stroke={KRP.ink} strokeWidth={4.5} />
      <line x1={-20} y1={12} x2={20} y2={12} stroke={C.kinri} strokeWidth={3} opacity={0.8} />
      <line x1={-22} y1={30} x2={22} y2={30} stroke={C.kinri} strokeWidth={3} opacity={0.8} />
    </g>
  );
  const Arm: React.FC<{ ax: number; ay: number; rot: number; len?: number }> = ({ ax, ay, rot, len = 78 }) => (
    <g transform={`translate(${ax} ${ay}) rotate(${rot})`}>
      <rect x={-11} y={0} width={22} height={len} rx={11} fill={C.armorDark} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={0} cy={len + 4} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  const Leg: React.FC<{ lx: number; rot?: number }> = ({ lx, rot = 0 }) => (
    <g transform={`translate(${lx} -58) rotate(${rot})`}>
      <rect x={-12} y={0} width={24} height={52} fill={C.armorDark} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={2} cy={54} rx={20} ry={9} fill={KRP.ink} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${dir * s} ${s})`}>
      {pose === "raise" && (
        <g>
          <Leg lx={-24} /> <Leg lx={24} />
          <g transform="translate(0 -58)"><Dou /></g>
          {/* 左腕は腰、右腕は天へ */}
          <Arm ax={-52} ay={-156} rot={24} />
          <Arm ax={54} ay={-150} rot={196} len={86} />
          <Sode sx={-56} rot={-8} />
          {/* 掲げた槍 (握りこぶしの位置から上へ) */}
          <Yari x={74} y={-184} len={260} />
          <Head hx={0} hy={-226} />
        </g>
      )}
      {pose === "run" && (
        <g transform="rotate(16)">
          {/* 前傾。脚は走りで前後に振れる */}
          <Leg lx={-26} rot={34 + run * 16} />
          <Leg lx={22} rot={-30 - run * 16} />
          <g transform="translate(0 -58)"><Dou /></g>
          {/* 両腕とも前へ。槍は進行方向へ水平 */}
          <Arm ax={-48} ay={-140} rot={-74} />
          <Arm ax={50} ay={-134} rot={-80} len={86} />
          <Sode sx={-54} rot={14} />
          <Yari x={-28} y={-36} len={250} rot={78} />
          <Head hx={6} hy={-224} tilt={-6} />
        </g>
      )}
      {pose === "sit" && (
        <g>
          {/* 正座 (折った脚の塊) */}
          <path d="M -58 0 Q -62 -36 -30 -44 L 46 -44 Q 66 -30 62 0 Z"
            fill={C.armorDark} stroke={KRP.ink} strokeWidth={4.5} />
          <g transform="translate(0 -40)"><Dou w={104} /></g>
          {/* 左手は紙を押さえ、右手は筆 */}
          <Arm ax={-46} ay={-120} rot={-48} len={64} />
          <g transform={`translate(52 -116) rotate(${-64 + brush * 0.6})`}>
            <rect x={-11} y={0} width={22} height={68} rx={11} fill={C.armorDark} stroke={KRP.ink} strokeWidth={4.5} />
            <circle cx={0} cy={72} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {/* 筆 (穂先が小さく動く) */}
            <g transform={`translate(0 72) rotate(${brush})`}>
              <rect x={-4} y={-52} width={8} height={62} rx={4} fill={C.wood} stroke={KRP.ink} strokeWidth={3} />
              <path d="M -6 10 Q 0 30 6 10 Z" fill={C.sumi} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          </g>
          <Sode sx={-50} rot={-6} />
          <Head hx={-2} hy={-192} tilt={8} />
        </g>
      )}
    </g>
  );
};

// --- 武士の影絵 (章扉の隊列用)。槍を立てて立つ黒シルエット ---
const BushiSil: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number }> = ({
  x, y, s = 1, f, phase = 0,
}) => {
  const bob = Math.sin((f + phase * 19) / 14) * 2.5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`} fill={C.armorDark}>
      <rect x={30} y={-250} width={7} height={250} rx={3} />
      <path d="M 33.5 -294 Q 41 -268 38 -248 L 29 -248 Q 26 -268 33.5 -294 Z" />
      <path d="M -40 0 L -34 -96 Q -36 -120 -8 -126 L 18 -126 Q 42 -118 40 -96 L 46 0 Z" />
      <circle cx={2} cy={-152} r={26} />
      <path d="M -30 -158 Q -30 -186 2 -188 Q 34 -186 34 -158 Z" />
      <rect x={-36} y={-162} width={74} height={7} rx={3} />
    </g>
  );
};

// ===================================================================
// 第16条「作り込みの床の法」用の下地部品
//   地面・壁が素のベタ1色で広く残っていたら未完成なので、ここで一段敷く。
//   どれも彩度低め・線細め・opacity 控えめ。主役より前に出さないのが条件。
// ===================================================================

// --- seed 固定の擬似乱数 (毎フレーム同じ場所に出る。小石が踊らない) ---
const prand = (seed: number) => {
  let v = Math.abs(Math.round(seed)) % 233280 || 7;
  return () => {
    v = (v * 9301 + 49297) % 233280;
    return v / 233280;
  };
};

// --- 戦場の地面の質感。top = 地面の上端 y。土の斑・かすれ・足あと・小石・草 ---
const GroundTexture: React.FC<{ top: number; f: number; seed: number }> = ({ top, f, seed }) => {
  const r = prand(seed);
  const band = Math.max(120, H - top);
  const px = () => -60 + r() * (W + 120);
  const py = () => top + 26 + r() * (band - 26);
  const patch = Array.from({ length: 7 }, () => [px(), py(), 90 + r() * 180, 20 + r() * 30] as const);
  const grit = Array.from({ length: 9 }, () => [px(), py()] as const);
  const stone = Array.from({ length: 14 }, () => [px(), py(), 7 + r() * 13] as const);
  const tuft = Array.from({ length: 11 }, () => [px(), py(), 0.62 + r() * 0.6, r() * 6] as const);
  const print = Array.from({ length: 6 }, (_, i) =>
    [150 + i * 162 + r() * 40, H - 46 - i * 16 - r() * 26] as const);
  return (
    <g>
      {/* 土の斑 (乾いた所と湿った所) */}
      <g fill={C.fieldDark} opacity={0.15}>
        {patch.map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} />)}
      </g>
      {/* 土の目 (踏み固められた筋) */}
      <g stroke={C.fieldDark} strokeWidth={3} opacity={0.26} fill="none" strokeLinecap="round">
        {grit.map(([x, y], i) => (
          <path key={i} d={`M ${x} ${y} q 62 ${i % 2 ? 8 : -8} 134 0`} />
        ))}
      </g>
      {/* 足あと (奥へ向かって小さくなる列) */}
      <g fill={C.fieldDark} opacity={0.38}>
        {print.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(-15) scale(${1 - i * 0.07})`}>
            <ellipse cx={0} cy={-10} rx={13} ry={7} />
            <ellipse cx={42} cy={10} rx={13} ry={7} />
          </g>
        ))}
      </g>
      {/* 小石 */}
      <g fill={C.stone} stroke={KRP.ink} strokeWidth={2.5} opacity={0.72}>
        {stone.map(([x, y, s], i) => <ellipse key={i} cx={x} cy={y} rx={s} ry={s * 0.6} />)}
      </g>
      {/* 草 (風でゆれる) */}
      <g fill="none" stroke={C.grass} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
        {tuft.map(([x, y, s, ph], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d={`M 0 0 Q ${-4 + Math.sin(f / 9 + ph) * 6} -22 ${-10 + Math.sin(f / 9 + ph) * 9} -40`} />
            <path d={`M 13 0 Q ${13 + Math.sin(f / 9 + ph + 1) * 6} -20 ${21 + Math.sin(f / 9 + ph + 1) * 9} -35`} />
            <path d={`M 25 0 Q ${27 + Math.sin(f / 9 + ph + 2) * 5} -17 ${33 + Math.sin(f / 9 + ph + 2) * 8} -30`} />
          </g>
        ))}
      </g>
    </g>
  );
};

// --- 遠景の山。y = 裾のライン。h で高さ、op で霞み具合 ---
const FarMountains: React.FC<{ y: number; op?: number; h?: number; color?: string }> = ({
  y, op = 0.55, h = 1, color = C.mountain,
}) => {
  const p = (d: number) => y - d * h;
  return (
    <path d={`M -40 ${p(60)} L 300 ${p(240)} L 540 ${p(90)} L 830 ${p(268)} L 1130 ${p(70)}
      L 1420 ${p(214)} L 1720 ${p(100)} L 1960 ${p(184)} L 1960 ${y + 180} L -40 ${y + 180} Z`}
      fill={color} stroke={KRP.ink} strokeWidth={5} opacity={op} />
  );
};

// --- 空のもや (薄い霞の帯) ---
const SkyMist: React.FC<{ spots: readonly (readonly [number, number, number, number])[] }> = ({ spots }) => (
  <g fill={KRP.white} opacity={0.42}>
    {spots.map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} />)}
  </g>
);

// --- 篝火 (陣中の夕景に置く灯り)。(x,y)=三脚の足元 ---
const Kagaribi: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const fl = 1 + Math.sin(f / 4) * 0.11;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={72} ry={14} fill={C.fieldDark} opacity={0.32} />
      <g stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round">
        <line x1={-48} y1={0} x2={-14} y2={-152} />
        <line x1={48} y1={0} x2={14} y2={-152} />
        <line x1={8} y1={0} x2={0} y2={-152} />
      </g>
      <path d="M -52 -212 L 52 -212 L 40 -150 L -40 -150 Z"
        fill={C.armorDark} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={C.kinri} strokeWidth={3.5} opacity={0.65}>
        <line x1={-46} y1={-188} x2={46} y2={-188} />
        <line x1={-20} y1={-210} x2={-15} y2={-152} />
        <line x1={20} y1={-210} x2={15} y2={-152} />
      </g>
      <g transform={`translate(0 -214) scale(${fl})`}>
        <path d="M 0 -98 Q 31 -52 25 -16 Q 12 6 0 4 Q -12 6 -25 -16 Q -31 -52 0 -98 Z"
          fill={C.bannerRed} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 0 -58 Q 15 -32 11 -12 Q 5 1 0 1 Q -5 1 -11 -12 Q -15 -32 0 -58 Z" fill={C.kinri} />
      </g>
      {/* 火の粉 */}
      <g fill={C.kinri}>
        {[0, 1, 2].map((i) => {
          const t = ((f * 2.2 + i * 41) % 118) / 118;
          return (
            <circle key={i} cx={(i - 1) * 24 + Math.sin(f / 7 + i) * 11}
              cy={-312 - t * 110} r={5.5 - t * 3.4} opacity={0.9 * (1 - t)} />
          );
        })}
      </g>
    </g>
  );
};

// ===================================================================
// 各シーン
// ===================================================================

// #36 山: 章扉。
// どこ: 戦国の戦場。霞んだ空・遠山・野原・陣幕・隊列。
// 演出: 旗指物が風にはためき、武士の隊列が槍を立てて並ぶ。左に章扉の題字。
// 動き: 旗4本が f で波打つ / 隊列がわずかに上下 / 土煙が流れる / 題字が seg で立ち上がる。
const S36: React.FC<{ f: number }> = ({ f }) => {
  const drift = (f % 120) * 2.2; // 土煙の流れ
  return (
    <Frame f={f} seed={935} bg={C.sky}
      over={<ChapterDoor num={2} title="一番槍は書類仕事。" t={seg(f, 8, 26)} left={110} top={240} width={760} />}>
      {/* 空のもや */}
      <ellipse cx={520} cy={180} rx={420} ry={70} fill={KRP.white} opacity={0.5} />
      <ellipse cx={1450} cy={120} rx={380} ry={60} fill={KRP.white} opacity={0.4} />
      {/* 遠山 (二重) */}
      <path d="M -40 640 L 320 350 L 560 560 L 820 300 L 1120 600 L 1400 380 L 1700 580 L 1960 430 L 1960 700 L -40 700 Z"
        fill={C.mountain} stroke={KRP.ink} strokeWidth={5} opacity={0.55} />
      <path d="M -40 680 L 240 480 L 520 650 L 900 460 L 1280 670 L 1620 500 L 1960 660 L 1960 760 L -40 760 Z"
        fill={C.mountain} stroke={KRP.ink} strokeWidth={5} opacity={0.8} />
      {/* 野 (素のベタ1色で終わらせない。土の斑・足あと・小石・草を一段敷く) */}
      <rect x={-20} y={640} width={W + 40} height={H - 620} fill={C.field} stroke={KRP.ink} strokeWidth={5} />
      <GroundTexture top={640} f={f} seed={9360} />
      {/* わだち (隊列が通った跡) */}
      <g stroke={C.fieldDark} strokeWidth={8} opacity={0.3} fill="none" strokeLinecap="round">
        <path d="M -20 1030 Q 520 940 1180 884 Q 1560 852 1960 842" />
        <path d="M -20 1076 Q 540 982 1200 922 Q 1580 890 1960 878" />
      </g>
      {/* 本陣の陣幕 (右) */}
      <Jinmaku x={1240} y={560} w={700} h={180} f={f} />
      {/* 旗指物 4本 (抽象柄) */}
      <Nobori x={1310} y={660} h={430} color={C.bannerRed} pattern="maru" f={f} phase={0} />
      <Nobori x={1620} y={650} h={400} color={C.jinmakuNavy} pattern="shima" f={f} phase={1} />
      <Nobori x={240} y={760} h={430} color={C.bannerRed} pattern="shima" f={f} phase={2} s={0.9} />
      <Nobori x={430} y={780} h={400} color={C.bannerRed} pattern="maru" f={f} phase={3} s={0.84} />
      {/* 槍をかまえる隊列 (影絵) */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <BushiSil key={i} x={620 + i * 196} y={866 + (i % 2) * 14} s={1.05 - (i % 2) * 0.1} f={f} phase={i} />
      ))}
      {/* 土煙 (隊列の足元から湧いて右へ流れる。縁取りなしのもくもく) */}
      <g fill={C.dust} opacity={0.8}>
        {[[640, 880, 0.4], [1000, 896, 0.6], [1420, 884, 0.5], [320, 904, 0.45]].map(([dx, dy, sp], i) => (
          <g key={i} transform={`translate(${(dx as number) + drift * (sp as number)} ${dy})`}>
            <ellipse cx={0} cy={0} rx={96} ry={34} />
            <ellipse cx={70} cy={-16} rx={62} ry={26} opacity={0.85} />
            <ellipse cx={-64} cy={10} rx={56} ry={22} opacity={0.7} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// #37 並: 一番槍の名誉。
// どこ: 陣地の前。陣幕・旗1本・地面の3要素。
// 演出: 甲冑武士が1人、槍を天に掲げて誇らしげに立つ。穂先が金色に光る。
// 動き: 穂先の光芒が seg で pop / 旗が波打つ / 武士が呼吸で上下 / 札「一番槍」。
const S37: React.FC<{ f: number }> = ({ f }) => {
  const g = pop(seg(f, 16, 28)); // 穂先のきらめき
  return (
    <Frame f={f} seed={936} bg={C.sky}>
      <SkyMist spots={[[500, 150, 400, 44], [1500, 108, 330, 36], [980, 232, 240, 26]] as const} />
      <FarMountains y={702} op={0.5} h={0.85} />
      <rect x={-20} y={700} width={W + 40} height={H - 680} fill={C.field} stroke={KRP.ink} strokeWidth={5} />
      <GroundTexture top={700} f={f} seed={4517} />
      <Jinmaku x={180} y={420} w={760} h={200} f={f} />
      {/* 遠くの隊列 (ここが戦場のどこかだと分かる) */}
      <BushiSil x={1178} y={706} s={0.42} f={f} phase={1} />
      <BushiSil x={1268} y={712} s={0.38} f={f} phase={4} />
      <Nobori x={1560} y={740} h={470} color={C.bannerRed} pattern="maru" f={f} phase={0} />
      {/* 主役: 槍を掲げる武士 */}
      <Bushi x={820} y={890} s={1.7} pose="raise" f={f} />
      {/* 穂先の光芒 (名誉の金) */}
      <g transform={`translate(946 150) scale(${g})`} opacity={g}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1={0} y1={-46} x2={0} y2={-108} transform={`rotate(${a})`}
            stroke={C.kinri} strokeWidth={10} strokeLinecap="round" />
        ))}
        <circle cx={0} cy={0} r={34} fill={KRP.white} opacity={0.85} />
        <circle cx={0} cy={0} r={18} fill={C.kinri} />
      </g>
      <TagPlate x={1400} y={330} text="一番槍" size={64} t={seg(f, 26, 38)} color={C.kinri} />
    </Frame>
  );
};

// #38 山: 敵陣へ突入。
// どこ: 開けた野。右奥に敵の陣幕と柵。
// 演出: 先頭の武士が槍を前に全力疾走し、ぐんと前へ出る。後ろに追う武士2人が小さい。
// 動き: 先頭の x が seg で進む / スピード線が流れる / 土煙が湧く / 脚が走りで回る。血は描かない。
const S38: React.FC<{ f: number }> = ({ f }) => {
  const adv = easeOut(seg(f, 4, 30));            // 先頭の前進
  const lx = lerp(520, 1120, adv);               // 先頭の位置
  const flow = (f % 60) * 9;                     // スピード線の流れ
  return (
    <Frame f={f} seed={937} bg={C.sky}>
      <SkyMist spots={[[420, 128, 360, 40], [1320, 96, 320, 34]] as const} />
      <path d="M -40 660 L 360 470 L 760 640 L 1200 480 L 1680 640 L 1960 540 L 1960 720 L -40 720 Z"
        fill={C.mountain} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
      <rect x={-20} y={640} width={W + 40} height={H - 620} fill={C.field} stroke={KRP.ink} strokeWidth={5} />
      <GroundTexture top={640} f={f} seed={7703} />
      {/* 敵陣: 陣幕 + 柵 + 旗 */}
      <Jinmaku x={1500} y={400} w={440} h={190} f={f} />
      <Nobori x={1560} y={520} h={330} color={C.jinmakuNavy} pattern="shima" f={f} phase={1} s={0.9} />
      <g stroke={KRP.ink} strokeWidth={6} fill={C.wood}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={1530 + i * 96} y={620} width={16} height={180} rx={6} />
        ))}
        <rect x={1500} y={650} width={420} height={14} rx={6} transform="rotate(-3 1500 650)" />
        <rect x={1500} y={730} width={420} height={14} rx={6} transform="rotate(2 1500 730)" />
      </g>
      {/* スピード線 (先頭の後ろを左へ流れる) */}
      <g stroke={KRP.grayDark} strokeWidth={7} strokeLinecap="round" opacity={0.6}>
        {[300, 380, 470, 560].map((yy, i) => {
          const sx = lx - 180 - ((flow + i * 140) % 560);
          return <line key={i} x1={sx} y1={yy} x2={sx - 170 - i * 24} y2={yy} />;
        })}
      </g>
      {/* 追う武士 (小さく2人) */}
      <Bushi x={lerp(130, 320, adv)} y={830} s={0.92} pose="run" f={f} phase={2} />
      <Bushi x={lerp(10, 170, adv)} y={870} s={0.84} pose="run" f={f} phase={5} />
      {/* 先頭: ぐんと前へ */}
      <Bushi x={lx} y={880} s={1.65} pose="run" f={f} />
      {/* 土煙 (先頭の足元から湧く) */}
      <g fill={C.dust} stroke={KRP.ink} strokeWidth={4}>
        <ellipse cx={lx - 190} cy={905} rx={120 + adv * 60} ry={44} opacity={0.9} />
        <ellipse cx={lx - 330} cy={930} rx={90 + adv * 80} ry={36} opacity={0.7} />
        <ellipse cx={lx - 470} cy={950} rx={70 + adv * 90} ry={30} opacity={0.5} />
        <circle cx={lx - 150} cy={850} r={26 + Math.sin(f / 4) * 5} opacity={0.8} />
      </g>
    </Frame>
  );
};

// #39 図: 数える人がいない。
// どこ: ★第16条。クリーム地+素の方眼をやめ、陣中の土間に置いた文机の上。
//       方眼は「大帳面の罫」としてだけ存在する (帳面の形に clip して載せる)。
// 演出: まっさらの大帳面と、いるはずの記録係 (点線の人型) の不在。
// 動き: 帳面が pop / 点線の人型の破線が f で流れる (幽霊感) / XMark と QMark が pop。
const LEDGER_D =
  "M -480 -230 Q -240 -270 0 -238 Q 240 -270 480 -230 L 480 210 Q 240 180 0 216 Q -240 180 -480 210 Z";
const S39: React.FC<{ f: number }> = ({ f }) => {
  const bp = pop(seg(f, 2, 12));
  return (
    <Frame f={f} seed={938} bg={C.sky}>
      <SkyMist spots={[[480, 118, 380, 42], [1540, 172, 300, 34]] as const} />
      <FarMountains y={592} op={0.45} h={0.78} />
      {/* 陣中の土間 */}
      <rect x={-20} y={578} width={W + 40} height={H - 558} fill={C.field} stroke={KRP.ink} strokeWidth={5} />
      <GroundTexture top={578} f={f} seed={2246} />
      {/* 奥に立てた旗指物 (ここが陣中だと分かる) */}
      <Nobori x={96} y={624} h={360} color={C.bannerRed} pattern="shima" f={f} phase={2} s={0.78} />
      {/* 右手前に置かれた兜と、立てかけた槍 */}
      <g transform="translate(1770 912) scale(0.72)">
        <ellipse cx={0} cy={18} rx={86} ry={18} fill={C.fieldDark} opacity={0.32} />
        <path d="M -78 0 Q -78 -76 0 -80 Q 78 -76 78 0 Z" fill={C.armor} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-92} y={-8} width={184} height={18} rx={8} fill={C.armor} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -16 -72 Q -38 -124 -50 -134 Q -22 -120 -8 -76 Z" fill={C.kinri} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 16 -72 Q 38 -124 50 -134 Q 22 -120 8 -76 Z" fill={C.kinri} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <Yari x={1876} y={1010} len={430} rot={9} s={0.82} />
      {/* 文机 (大帳面を載せる台) */}
      <ellipse cx={680} cy={952} rx={530} ry={24} fill={C.fieldDark} opacity={0.3} />
      <g>
        <rect x={150} y={786} width={1060} height={34} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={192} y={820} width={28} height={134} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1140} y={820} width={28} height={134} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.floorDark} strokeWidth={3} opacity={0.4}>
          <line x1={176} y1={802} x2={1184} y2={802} />
        </g>
      </g>
      {/* 開いた大帳面 (まっさら)。折り目・綴じ紐・紙の反りまで描く */}
      <g transform={`translate(660 520) scale(${bp})`}>
        <defs>
          <clipPath id="ib2_choumen" clipPathUnits="userSpaceOnUse">
            <path d={LEDGER_D} />
          </clipPath>
        </defs>
        <path d={LEDGER_D} fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        {/* ★方眼は帳面の罫としてだけ。紙の形に clip して載せる (素の方眼を地に敷かない) */}
        <g clipPath="url(#ib2_choumen)">
          <g transform="translate(-524 -298)">
            <GridPaper pitch={48} opacity={0.15} tombo={false} />
          </g>
        </g>
        <path d="M 0 -238 Q 10 -10 0 216" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -460 -214 Q -240 -250 -16 -222" fill="none" stroke={C.washiDark} strokeWidth={4} />
        <path d="M 16 -222 Q 240 -250 460 -214" fill="none" stroke={C.washiDark} strokeWidth={4} />
        <path d="M -460 192 Q -240 164 -16 198" fill="none" stroke={C.washiDark} strokeWidth={4} />
        <path d="M 16 198 Q 240 164 460 192" fill="none" stroke={C.washiDark} strokeWidth={4} />
        {/* 綴じ紐 */}
        <g stroke={C.sumi} strokeWidth={5}>
          <line x1={-14} y1={-150} x2={14} y2={-130} />
          <line x1={14} y1={-150} x2={-14} y2={-130} />
          <line x1={-14} y1={120} x2={14} y2={140} />
          <line x1={14} y1={120} x2={-14} y2={140} />
        </g>
        {/* 罫線だけあって、何も書かれていない */}
        <g stroke={C.washiDark} strokeWidth={3} opacity={0.9}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={-420} y1={-140 + i * 86} x2={-60} y2={-130 + i * 86} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <line key={`r${i}`} x1={60} y1={-130 + i * 86} x2={420} y2={-140 + i * 86} />
          ))}
        </g>
      </g>
      {/* いるはずの記録係 = 点線の人型 (破線が流れて「いない」) */}
      <g transform="translate(1480 790)" fill="none" stroke={KRP.grayDark} strokeWidth={6}
        strokeDasharray="18 14" strokeDashoffset={-f * 1.6} opacity={0.9}>
        <circle cx={0} cy={-330} r={64} />
        <path d="M -70 0 L -58 -170 Q -62 -266 0 -262 Q 62 -266 58 -170 L 70 0" />
        <path d="M -58 -230 Q -120 -190 -108 -110" />
        <path d="M 58 -230 Q 120 -190 108 -110" />
      </g>
      <XMark x={1480} y={610} s={1.3} t={seg(f, 18, 26)} />
      <QMark x={1480} y={262} s={1.25} f={f} t={seg(f, 12, 22)} />
      {/* 札は点線の人型 (頭の上端 y≈396) の上。人にもイラストにも重ねない */}
      <TagPlate x={1480} y={338} text="記録係ふざい" size={40} t={seg(f, 28, 40)} color={KRP.red} />
    </Frame>
  );
};

// #40 並: 軍忠状を書く。
// どこ: 夕空の陣中。陣幕・夕日・地面の背景3要素+文机。
// 演出: 甲冑のまま正座して書き物をする武士 (命がけの人が事務をしている落差)。脇に槍。
// 動き: 筆先が f で小さく動く / 陣幕の裾が揺れる / 札が pop。
const S40: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={939} bg={C.eveSky}>
    {/* 夕日 */}
    <circle cx={1620} cy={240} r={110} fill={C.bannerRed} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
    {/* 夕暮れの雲 (札の場所は空けてある) */}
    <SkyMist spots={[[900, 110, 300, 30], [1420, 170, 240, 26], [230, 330, 200, 24]] as const} />
    <FarMountains y={662} op={0.5} h={0.72} />
    <rect x={-20} y={660} width={W + 40} height={H - 640} fill={C.field} stroke={KRP.ink} strokeWidth={5} />
    <GroundTexture top={660} f={f} seed={6134} />
    <Jinmaku x={140} y={380} w={1100} h={240} f={f} />
    {/* 陣中の灯り (日が落ちてなお書類を書いている) */}
    <Kagaribi x={1620} y={980} s={0.9} f={f} />
    {/* 陣幕に立てかけた槍 */}
    <Yari x={300} y={940} len={500} rot={-10} />
    {/* 文机 + 巻紙 + 硯 */}
    <g>
      <rect x={770} y={760} width={560} height={34} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={800} y={794} width={26} height={130} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1280} y={794} width={26} height={130} fill={C.wood} stroke={KRP.ink} strokeWidth={5} />
      {/* 巻紙 (左端が巻いてある) */}
      <rect x={790} y={722} width={330} height={42} rx={6} fill={C.washi} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={798} cy={743} r={26} fill={C.washiDark} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 書きかけの波線 */}
      <path d={`M 850 744 q 14 -8 28 0 q 14 8 28 0 q 14 -8 ${Math.min(28, 8 + f * 0.5)} 0`}
        fill="none" stroke={C.sumi} strokeWidth={3.5} />
      {/* 硯と墨 */}
      <rect x={1180} y={730} width={88} height={32} rx={8} fill={C.sumi} stroke={KRP.ink} strokeWidth={4} />
      <rect x={1196} y={706} width={34} height={22} rx={4} fill={C.armorDark} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
    {/* 主役: 甲冑のまま正座で書き物 (筆先が巻紙の上にくる) */}
    <Bushi x={700} y={930} s={1.6} pose="sit" f={f} brow="calm" />
    {/* 札は夕日にも陣幕にも武士にも重ねない空の位置へ */}
    <TagPlate x={520} y={230} text="じむ作業中" size={52} t={seg(f, 26, 40)} />
  </Frame>
);

// #42 並: 証人の署名。
// どこ: 陣中。陣幕・床几・地面+遠山+旗指物。
// 演出: 筆をとって署名する仲間の武士が主役。本人は横から見た立ち姿で、腰を折って巻紙を差し出す。
// ★作り直し: 以前は後ろ姿の黒い影絵に腕を手描きで足していて「アヒル」に見えた。
//   共通部品 Person の pose="hold" (体の前で両腕を出す姿勢) に置き換え、
//   腕は部品まかせ・巻紙だけをシーン側で手の上に載せる。立ち位置と大きさは据え置き。
// 動き: 仲間の筆先が動く / 本人のおじぎが seg で深くなり、小さく上下する / 札が pop。
const S42: React.FC<{ f: number }> = ({ f }) => {
  const bow = easeOut(seg(f, 8, 24)) * 13 + Math.sin(f / 16) * 1.6; // 腰を折る深さ
  return (
    <Frame f={f} seed={941} bg={C.sky}>
      <SkyMist spots={[[560, 124, 360, 40], [1320, 150, 300, 32]] as const} />
      <FarMountains y={682} op={0.45} h={0.76} />
      <rect x={-20} y={680} width={W + 40} height={H - 660} fill={C.field} stroke={KRP.ink} strokeWidth={5} />
      <GroundTexture top={680} f={f} seed={5522} />
      {/* 陣幕の奥に立つ旗指物 (幕の上だけ見える) */}
      <Nobori x={1700} y={760} h={520} color={C.bannerRed} pattern="maru" f={f} phase={1} s={0.9} />
      <Jinmaku x={820} y={400} w={1060} h={220} f={f} />
      {/* 床几 (仲間の腰掛け) */}
      <g stroke={KRP.ink} strokeWidth={5} fill={C.wood}>
        <line x1={1190} y1={800} x2={1300} y2={930} />
        <line x1={1300} y1={800} x2={1190} y2={930} />
        <rect x={1160} y={786} width={180} height={22} rx={8} />
      </g>
      {/* 主役: 署名する仲間 (左向きに座って筆をとる) */}
      <Bushi x={1230} y={800} s={1.5} pose="sit" f={f} dir={-1} brow="calm" />
      {/* 本人: 立ち位置 (640,920) は据え置き。腰を折って巻紙を両手で差し出す */}
      <g transform="translate(640 920) scale(1.52)">
        <ellipse cx={10} cy={6} rx={78} ry={15} fill={C.fieldDark} opacity={0.32} />
        <g transform={`rotate(${bow})`}>
          <Person x={0} y={0} s={1} pose="hold" f={f} phase={3}
            cloth={C.armorDark} clothDark={C.armor} hair="cap"
            face="normal" gaze={[8, 3]} />
          {/* 陣笠 (戦国の人だと一目で分かる。腕は足さない) */}
          <g transform="translate(0 -252)">
            <path d="M -84 10 Q -70 -74 0 -78 Q 70 -74 84 10 Z"
              fill={C.armor} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M -98 10 Q 0 32 98 10 Q 0 24 -98 10 Z"
              fill={C.armor} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={-62} r={8} fill={C.kinri} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* 巻紙 (手の先に置く。体に重ねない・仲間の筆先まで届かせる) */}
        <g transform="translate(100 -126) rotate(-2.5)">
          <rect x={-28} y={-20} width={218} height={40} rx={8}
            fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-30} cy={0} r={25} fill={C.washiDark} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-30} cy={0} r={9} fill={C.washi} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 28 2 q 11 -7 22 0 q 11 7 22 0 q 11 -7 22 0 q 11 7 22 0"
            fill="none" stroke={C.sumi} strokeWidth={3} />
        </g>
      </g>
      <TagPlate x={430} y={300} text="サインたのむ" size={50} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// --- 陣屋の床 (軍忠状を置く世界)。畳・畳縁・陣幕の裾・陣中の小物 ---
// ★第16条。図の下にも世界を敷く。札の通る左の帯 (x 370〜570) には物を置かない。
const JinyaFloor: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.tatami} />
    {/* 畳の目 */}
    <g stroke={C.tatamiDark} strokeWidth={3} opacity={0.3}>
      {Array.from({ length: 23 }, (_, i) => (
        <line key={i} x1={-20} y1={i * 50 + 12} x2={W + 20} y2={i * 50 + 12} />
      ))}
    </g>
    {/* 畳縁 */}
    <g fill={C.fuchi} opacity={0.7}>
      <rect x={-20} y={152} width={W + 40} height={24} />
      <rect x={-20} y={902} width={W + 40} height={24} />
    </g>
    {/* 奥の陣幕の裾 (上辺にだけ見える) */}
    <Jinmaku x={-60} y={-156} w={2040} h={196} f={f} />
    {/* 左下: 硯と墨と筆 */}
    <g transform="translate(196 926)">
      <rect x={-96} y={-26} width={192} height={56} rx={10} fill={C.sumi} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-74} y={-16} width={96} height={34} rx={6} fill={C.armorDark} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={34} y={-52} width={34} height={30} rx={5} fill={C.armorDark} stroke={KRP.ink} strokeWidth={4} />
      <g transform="translate(-30 -58) rotate(-18)">
        <rect x={-9} y={-104} width={18} height={116} rx={9} fill={C.wood} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -10 12 Q 0 56 10 12 Z" fill={C.sumi} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    </g>
    {/* 左上: 文箱 */}
    <g transform="translate(180 96)">
      <rect x={-104} y={-28} width={208} height={76} rx={8} fill={C.wood} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-104} y={-44} width={208} height={24} rx={8} fill={C.washiDark} stroke={KRP.ink} strokeWidth={5} />
      <line x1={-70} y1={6} x2={70} y2={6} stroke={C.kinri} strokeWidth={4} opacity={0.85} />
    </g>
    {/* 右上: 置かれた兜 */}
    <g transform="translate(1696 150) scale(0.78)">
      <ellipse cx={0} cy={22} rx={92} ry={18} fill={C.tatamiDark} opacity={0.6} />
      <path d="M -78 0 Q -78 -76 0 -80 Q 78 -76 78 0 Z" fill={C.armor} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-92} y={-8} width={184} height={18} rx={8} fill={C.armor} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -16 -72 Q -38 -124 -50 -134 Q -22 -120 -8 -76 Z" fill={C.kinri} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 16 -72 Q 38 -124 50 -134 Q 22 -120 8 -76 Z" fill={C.kinri} stroke={KRP.ink} strokeWidth={4} />
    </g>
    {/* 右下: 立てかけた槍 */}
    <Yari x={1748} y={1010} len={470} rot={7} s={0.86} />
  </g>
);

// --- 軍忠状の書面 (#41/#43 で共用。複製しない)。phase 1=自己申告 / 2=証人+確定 ---
// どこ: ★第16条。陣屋の畳の上に置いた縦の大和紙。方眼は和紙の形に clip して載せる。
// 演出: 「どこで」「一番に」「てがら」の3欄が順に灯る。phase2 で証人欄・花押・確定の判子が加わる。
// 動き: phase1=欄が seg で順に点灯+印が pop / phase2=花押が描かれ、判子がドン。
const InkLines: React.FC<{ x: number; y: number; w: number; n: number; t?: number }> = ({ x, y, w, n, t = 1 }) => (
  <g stroke={C.sumi} strokeWidth={4} fill="none" opacity={0.85}>
    {Array.from({ length: n }, (_, i) => {
      const lw = w * (i === n - 1 ? 0.6 : 1) * clamp01(t * n - i);
      if (lw <= 0) return null;
      return (
        <path key={i} d={`M ${x} ${y + i * 34} ${Array.from({ length: Math.ceil(lw / 44) },
          (_, k) => `q 11 ${k % 2 ? 7 : -7} 22 0 q 11 ${k % 2 ? -7 : 7} 22 0`).join(" ")}`}
          strokeDasharray={`${lw} 2000`} />
      );
    })}
  </g>
);

const Gunchujo: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => {
  // phase2 では3欄は点灯済み (t=1)
  const t1 = phase === 1 ? seg(f, 4, 14) : 1;
  const t2 = phase === 1 ? seg(f, 14, 24) : 1;
  const t3 = phase === 1 ? seg(f, 24, 34) : 1;
  const seal = phase === 1 ? seg(f, 32, 42) : 1;      // 自己申告の印
  const sign = phase === 2 ? seg(f, 6, 20) : 0;       // 花押
  const kaku = phase === 2 ? pop(seg(f, 26, 36)) : 0; // 確定の判子
  const fields: [string, number, number][] = [["どこで", 200, t1], ["一番に", 390, t2], ["てがら", 580, t3]];
  return (
    <g>
      <JinyaFloor f={f} />
      {/* 大和紙 (上下に巻き・折り目・端の影まで) */}
      <g transform={`translate(960 520) scale(${pop(seg(f, 0, 8))})`} >
        <defs>
          <clipPath id="ib2_gunchujo_washi" clipPathUnits="userSpaceOnUse">
            <rect x={-400} y={-440} width={800} height={880} rx={6} />
          </clipPath>
        </defs>
        {/* 畳に落ちる紙の影 */}
        <rect x={-382} y={-422} width={800} height={880} rx={6} fill={KRP.ink} opacity={0.12} />
        <rect x={-400} y={-440} width={800} height={880} rx={6}
          fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
        {/* ★方眼は和紙の罫としてだけ。紙の形に clip して載せる (素の方眼を地に敷かない) */}
        <g clipPath="url(#ib2_gunchujo_washi)">
          <g transform="translate(-444 -482)">
            <GridPaper pitch={56} opacity={0.16} tombo={false} />
          </g>
        </g>
        {/* 巻きの軸 (上下) */}
        <rect x={-424} y={-466} width={848} height={44} rx={22} fill={C.washiDark} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-424} y={422} width={848} height={44} rx={22} fill={C.washiDark} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 折り目と紙の濃淡 */}
        <g stroke={C.washiDark} strokeWidth={3} opacity={0.8}>
          <line x1={-400} y1={-220} x2={400} y2={-214} />
          <line x1={-400} y1={66} x2={400} y2={72} />
          <line x1={-400} y1={300} x2={400} y2={294} />
        </g>
        <rect x={-396} y={-436} width={30} height={872} fill={C.washiDark} opacity={0.35} />
      </g>
      {/* 3つの欄 (灯ると金がさす) */}
      {fields.map(([label, fy, ft], i) => (
        <g key={i}>
          <rect x={620} y={fy} width={680} height={150} rx={8}
            fill={C.kinri} opacity={0.22 * clamp01(ft)} />
          <rect x={620} y={fy} width={680} height={150} rx={8}
            fill="none" stroke={C.sumi} strokeWidth={4} opacity={0.65} />
          <InkLines x={660} y={fy + 50} w={580} n={3} t={ft} />
          <TagPlate x={470} y={fy + 75} text={label} size={48} t={ft}
            fill={C.washi} color={C.sumi} />
        </g>
      ))}
      {/* 自己申告のスタンプ風の印 (右上) */}
      <g transform={`translate(1210 150) rotate(-9) scale(${pop(clamp01(seal))})`} opacity={0.9}>
        <rect x={-104} y={-38} width={208} height={76} rx={8}
          fill="none" stroke={KRP.red} strokeWidth={6} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={42} fill={KRP.red} letterSpacing={4}>自己申告</text>
      </g>
      {phase === 2 && (
        <g>
          {/* 証人の欄 + 花押 (ぐるっとした墨の署名が描かれていく) */}
          <rect x={620} y={766} width={680} height={128} rx={8}
            fill={C.kinri} opacity={0.22 * clamp01(sign * 2)} />
          <rect x={620} y={766} width={680} height={128} rx={8}
            fill="none" stroke={C.sumi} strokeWidth={4} opacity={0.65} />
          <TagPlate x={470} y={785} text="証人" size={48} t={seg(f, 4, 12)}
            fill={C.washi} color={C.sumi} />
          <path d="M 760 846 q 30 -44 70 -22 q 44 24 10 48 q -36 24 -4 -18 q 40 -50 96 -24 q 52 26 110 2"
            fill="none" stroke={C.sumi} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={420} strokeDashoffset={420 * (1 - easeOut(sign))} />
          {/* 確定の判子がドン */}
          <g transform={`translate(960 480) rotate(-10) scale(${kaku})`} opacity={0.88}>
            <rect x={-196} y={-116} width={392} height={232} rx={14}
              fill="none" stroke={KRP.red} strokeWidth={13} />
            <rect x={-178} y={-98} width={356} height={196} rx={10}
              fill="none" stroke={KRP.red} strokeWidth={5} />
            <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={150} fill={KRP.red} letterSpacing={14}>確定</text>
          </g>
        </g>
      )}
    </g>
  );
};

// #41 図: 軍忠状の書面 (phase1)。
const S41: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={940} bg={C.tatami}>
    <Gunchujo f={f} phase={1} />
  </Frame>
);

// #43 図: 同じ書面に証人欄と確定の判子 (phase2)。
const S43: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={942} bg={C.tatami}>
    <Gunchujo f={f} phase={2} />
  </Frame>
);

// #44 図: 順位 = 記録。
// どこ: ★第16条。板床に広げた絵巻の上。方眼は絵巻の罫として clip して載せる。
// 演出: 左に「順位」(槍)、右に「記録」(筆+巻物)、間に大きな「=」。下に続いていく帯年表。
// 動き: 「=」の2本が seg で左から引かれる / 槍と筆がゆっくり上下 / 年表の矢印が伸びる。
const S44: React.FC<{ f: number }> = ({ f }) => {
  const bob1 = Math.sin(f / 13) * 5, bob2 = Math.sin(f / 13 + 2) * 5;
  const e1 = easeOut(seg(f, 14, 26)), e2 = easeOut(seg(f, 20, 32));
  return (
    <Frame f={f} seed={943} bg={C.floor}>
      {/* 板床 (板目とつなぎ目) */}
      <g stroke={C.floorDark} strokeWidth={4} opacity={0.5}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={-20} y1={i * 170 + 40} x2={W + 20} y2={i * 170 + 40} />
        ))}
      </g>
      <g stroke={C.floorDark} strokeWidth={2.5} opacity={0.3} fill="none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M ${-20 + i * 330} ${i * 170 + 96} q 160 ${i % 2 ? 10 : -10} 330 0`} />
        ))}
      </g>
      {/* 広げた絵巻 (軸・影・折り目つき) */}
      <defs>
        <clipPath id="ib2_emaki" clipPathUnits="userSpaceOnUse">
          <rect x={90} y={100} width={1740} height={860} rx={4} />
        </clipPath>
      </defs>
      <rect x={104} y={116} width={1740} height={860} rx={4} fill={KRP.ink} opacity={0.16} />
      <rect x={90} y={100} width={1740} height={860} rx={4}
        fill={C.washi} stroke={KRP.ink} strokeWidth={7} />
      {/* ★方眼は絵巻の罫としてだけ。紙の形に clip して載せる (素の方眼を地に敷かない) */}
      <g clipPath="url(#ib2_emaki)">
        <g transform="translate(70 80)">
          <GridPaper pitch={58} opacity={0.15} tombo={false} />
        </g>
        {/* 紙の折り目と端の濃淡 */}
        <g stroke={C.washiDark} strokeWidth={4} opacity={0.75}>
          <line x1={520} y1={100} x2={516} y2={960} />
          <line x1={1030} y1={100} x2={1034} y2={960} />
          <line x1={1540} y1={100} x2={1536} y2={960} />
        </g>
        <rect x={90} y={100} width={34} height={860} fill={C.washiDark} opacity={0.3} />
        <rect x={1796} y={100} width={34} height={860} fill={C.washiDark} opacity={0.3} />
      </g>
      {/* 巻きの軸 (左右) */}
      <rect x={42} y={74} width={48} height={912} rx={24} fill={C.washiDark} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={1830} y={74} width={48} height={912} rx={24} fill={C.washiDark} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 文鎮 (絵巻を押さえている) */}
      <g fill={C.armorDark} stroke={KRP.ink} strokeWidth={4.5}>
        <rect x={150} y={928} width={150} height={22} rx={10} />
        <rect x={1620} y={928} width={150} height={22} rx={10} />
      </g>
      {/* 左: 順位 = 一番槍の槍 (高さ500) */}
      <g transform={`translate(0 ${bob1})`}>
        <Yari x={520} y={800} len={280} s={1.45} />
        {/* 札は穂先 (y≈269) より上。槍に重ねない */}
        <TagPlate x={520} y={160} text="順位" size={60} t={seg(f, 4, 14)} />
      </g>
      {/* 右: 記録 = 筆 + 巻物 (高さ460) */}
      <g transform={`translate(0 ${bob2})`}>
        {/* 筆 (大) */}
        <g transform="translate(1310 480) rotate(24)">
          <rect x={-16} y={-260} width={32} height={320} rx={14} fill={C.wood} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-18} y={52} width={36} height={26} rx={8} fill={C.kinri} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -20 76 Q 0 160 20 76 Z" fill={C.sumi} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 巻物 (大) */}
        <g transform="translate(1400 700)">
          <rect x={-230} y={-60} width={460} height={120} rx={10} fill={C.washi} stroke={KRP.ink} strokeWidth={6.5} />
          <circle cx={-228} cy={0} r={66} fill={C.washiDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={-228} cy={0} r={24} fill={C.washi} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={228} cy={0} r={66} fill={C.washiDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={228} cy={0} r={24} fill={C.washi} stroke={KRP.ink} strokeWidth={4.5} />
          <InkLines x={-140} y={-26} w={280} n={2} t={1} />
        </g>
        {/* 札は筆の軸頭 (y≈236) より上。筆に重ねない */}
        <TagPlate x={1400} y={160} text="記録" size={60} t={seg(f, 8, 18)} />
      </g>
      {/* 大きな「=」(左から引かれる) */}
      <rect x={830} y={470} width={260 * e1} height={40} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      <rect x={830} y={560} width={260 * e2} height={40} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      {/* 帯年表 (ここから先へ続く) */}
      <rect x={160} y={818} width={1430} height={12} rx={6} fill={C.mapLine} opacity={0.9} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={300 + i * 330} y1={804} x2={300 + i * 330} y2={844}
          stroke={C.mapLine} strokeWidth={8} strokeLinecap="round" />
      ))}
      <ForceArrow x={1420} y={824} len={240} rot={0} w={20} color={C.kinri} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// --- 戦場の地図 (#45/#46 で共用。複製しない)。 ---
// どこ: 地図の紙いっぱいに本州中部ふうの地形 (海岸線・山記号・街道線・国境)。
// 演出: phase1=合戦場1か所に小さな赤い土俵の輪+槍 / phase2=隣の国に点線の輪と「?」、間に物差し+×。
// 動き: 輪の pop / ？のゆれ / 輪の呼吸 (ゆっくり脈打つ)。
// ※赤い輪は全編で育つ図の2回目: 正円・KRP.red・strokeWidth 7。
// ※#47 はこの絵図ではなく、本物の日本列島 (IchiB2JapanMap.tsx) を使う。
const SenjoMap: React.FC<{ f: number; phase: 1 | 2 }> = ({ f, phase }) => {
  const AX = 820, AY = 500;   // 合戦場 (赤い輪の中心)
  const BX = 1340, BY = 430;  // 隣の国
  const R = 88;
  const ring = phase === 1 ? pop(seg(f, 8, 18)) : 1;
  const breathe = 1 + Math.sin(f / 9) * 0.025; // 輪の呼吸 (静止禁止)
  return (
    <g>
      {/* 海 (素のベタ1色にしない。波の筋を一面に薄く入れる) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.sea} />
      <g stroke={C.mapLine} strokeWidth={3} opacity={0.42} fill="none" strokeLinecap="round">
        {([[160, 62], [470, 92], [760, 58], [1040, 96], [1330, 60], [1620, 94], [1840, 58],
          [120, 150], [300, 1004], [640, 990], [1000, 958], [1300, 918], [1560, 876], [1810, 856],
          [96, 1012], [480, 1046], [860, 1038], [1180, 1008], [1700, 962]] as const).map(([wx, wy], i) => (
          <path key={i} d={`M ${wx} ${wy} q 28 -16 56 0 q 28 16 56 0`} />
        ))}
      </g>
      {/* 絵図の紙の折り目 (赤い輪の上は通さない) */}
      <g stroke={C.mapLine} strokeWidth={3} opacity={0.14}>
        {[300, 640, 1180, 1520, 1760].map((cx) => (
          <line key={cx} x1={cx} y1={-20} x2={cx + 6} y2={H + 20} />
        ))}
        <line x1={-20} y1={352} x2={W + 20} y2={344} />
        <line x1={-20} y1={880} x2={W + 20} y2={888} />
      </g>
      {/* 本州中部ふうの陸地 (海岸線は入り江と岬まで) */}
      <path d="M -40 340 Q 180 260 360 300 Q 470 320 540 270 Q 700 160 920 210 Q 1060 240 1180 190
        Q 1380 120 1580 200 Q 1760 270 1960 240 L 1960 700 Q 1800 760 1660 730 Q 1520 700 1430 780
        Q 1340 860 1180 820 Q 1060 790 980 850 Q 880 920 720 880 Q 560 840 460 900 Q 330 970 160 910
        Q 40 870 -40 900 Z"
        fill={C.mapPaper} stroke={KRP.ink} strokeWidth={7} />
      {/* 紙の斑 (絵図の地の濃淡) */}
      <g fill={C.mapLine} opacity={0.07}>
        {([[260, 400, 220, 70], [900, 290, 260, 60], [1600, 330, 230, 64],
          [520, 820, 240, 56], [1420, 680, 210, 52]] as const).map(([mx, my, rx, ry], i) => (
          <ellipse key={i} cx={mx} cy={my} rx={rx} ry={ry} />
        ))}
      </g>
      {/* 川 (山から海へ) */}
      <g stroke={C.sea} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.9}>
        <path d="M 300 440 Q 372 606 430 764 Q 462 852 492 898" />
        <path d="M 1654 440 Q 1702 568 1714 712 Q 1720 760 1726 742" />
      </g>
      <g stroke={C.mapLine} strokeWidth={2.5} fill="none" opacity={0.5}>
        <path d="M 300 440 Q 372 606 430 764 Q 462 852 492 898" />
      </g>
      {/* 森の記号 (領地に木が生えている) */}
      <g stroke={C.mapLine} strokeWidth={4} fill="none" strokeLinecap="round">
        {([[168, 474], [252, 502], [452, 372], [622, 466], [1128, 430],
          [1492, 322], [1578, 356], [1762, 562], [1824, 604]] as const).map(([tx, ty], i) => (
          <g key={i}>
            <path d={`M ${tx} ${ty} L ${tx} ${ty - 14}`} />
            <path d={`M ${tx - 18} ${ty - 14} L ${tx} ${ty - 44} L ${tx + 18} ${ty - 14} Z`} />
          </g>
        ))}
      </g>
      {/* 国境 (点線) で領地が分かれている */}
      <g stroke={C.mapLine} strokeWidth={5} strokeDasharray="22 16" fill="none" opacity={0.9}>
        <path d="M 600 230 Q 640 420 560 620 Q 520 740 540 880" />
        <path d="M 1090 200 Q 1120 400 1060 560 Q 1010 700 1070 830" />
        <path d="M 1500 170 Q 1540 380 1480 560 Q 1440 680 1470 760" />
      </g>
      {/* 山の記号 */}
      <g stroke={C.mapLine} strokeWidth={5} fill="none" strokeLinecap="round">
        {[[300, 420], [390, 470], [250, 540], [760, 300], [860, 340], [1240, 300],
          [1320, 620], [1650, 420], [1730, 480], [680, 720]].map(([mx, my], i) => (
          <path key={i} d={`M ${mx - 34} ${my} L ${mx} ${my - 44} L ${mx + 34} ${my}`} />
        ))}
      </g>
      {/* 街道線 (宿場の点つき) */}
      <g stroke={C.mapLine} strokeWidth={4.5} fill="none" opacity={0.95}>
        <path d="M 60 760 Q 400 640 820 620 Q 1240 600 1560 500 Q 1760 440 1920 430" />
        <path d="M 820 620 Q 800 480 900 330" />
      </g>
      <g fill={C.mapLine}>
        {[[290, 690], [560, 640], [820, 620], [1100, 598], [1400, 540], [1700, 462]].map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={9} />
        ))}
      </g>
      {/* 合戦場: 小さな赤い土俵の輪 (正円・strokeWidth 7) + 槍 */}
      <g transform={`translate(${AX} ${AY}) scale(${ring * breathe})`}>
        <circle cx={0} cy={0} r={R} fill={KRP.red} opacity={0.12} />
        <circle cx={0} cy={0} r={R} fill="none" stroke={KRP.red} strokeWidth={7} />
        <g opacity={phase === 1 ? pop(seg(f, 16, 26)) : 1}>
          <Yari x={-6} y={58} len={74} rot={16} s={0.62} />
        </g>
      </g>
      {/* 交わった槍の印 (合戦場のしるし) */}
      <g stroke={C.mapLine} strokeWidth={4} opacity={0.8}>
        <line x1={AX + R + 14} y1={AY - 30} x2={AX + R + 54} y2={AY + 10} />
        <line x1={AX + R + 54} y1={AY - 30} x2={AX + R + 14} y2={AY + 10} />
      </g>
      {phase === 1 && (
        <TagPlate x={AX} y={720} text="ここだけ" size={54} t={seg(f, 24, 36)} color={KRP.red} />
      )}
      {phase === 2 && (
        <g>
          {/* 隣の国: 点線の輪 + ？ */}
          <g transform={`translate(${BX} ${BY}) scale(${pop(seg(f, 6, 16))})`}>
            <circle cx={0} cy={0} r={R} fill="none" stroke={KRP.grayDark} strokeWidth={7}
              strokeDasharray="20 16" />
          </g>
          <QMark x={BX} y={BY - 140} s={1.1} f={f} t={seg(f, 12, 20)} />
          {/* 2つの輪の間: 物差し + × (比べる道具がない) */}
          <g transform={`translate(${(AX + BX) / 2} ${(AY + BY) / 2 + 160}) rotate(-8)`}
            opacity={clamp01(seg(f, 18, 28))}>
            <rect x={-160} y={-26} width={320} height={52} rx={8}
              fill={C.washi} stroke={KRP.ink} strokeWidth={5.5} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line key={i} x1={-130 + i * 44} y1={-26} x2={-130 + i * 44} y2={i % 2 ? -4 : 4}
                stroke={KRP.ink} strokeWidth={4} />
            ))}
          </g>
          <XMark x={(AX + BX) / 2} y={(AY + BY) / 2 + 160} s={1.25} t={seg(f, 26, 34)} />
          <TagPlate x={1080} y={760} text="くらべられない" size={50} t={seg(f, 30, 42)} color={KRP.red} />
        </g>
      )}
    </g>
  );
};

// #45 図: 地図 phase1 (ここだけ)。
const S45: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={944} bg={C.sea}>
    <SenjoMap f={f} phase={1} />
  </Frame>
);

// #46 図: 地図 phase2 (くらべられない)。
const S46: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={945} bg={C.sea}>
    <SenjoMap f={f} phase={2} />
  </Frame>
);

// #47 山: 本物の日本列島の絵図 (IchiB2JapanMap)。
// どこ: 一面が絵図。北海道・本州・四国・九州 + 佐渡・淡路・対馬・隠岐。山・森・川・街道・国境つき。
// 演出: f=0 では「わが村」の中にいる (家4軒・鳥居・田・旗・交わった槍・赤い土俵の輪)。
//       f=3〜30 で 6.8倍 → 0.96倍まで一気に引く。村は点になり、絵図の紙の縁まで見えてくる。
//       引ききったあとは村の点から波紋が静かに広がりつづけ、目が点の位置を見失わない。
// 動き: カメラの引き / 国境と街道が引かれていく / 波のゆれ・木のそよぎ・山のゆらぎ /
//       土俵の輪の呼吸 / 村の点から出る波紋 / 札の引き出し線がのびる。
// ※線の太さは地図側で k=1/z を掛けて打ち消しているので、どの倍率でも線の見え方は変わらない。
const S47: React.FC<{ f: number }> = ({ f }) => {
  const e = easeOut(seg(f, 3, 30));                 // 引きのカメラ
  const z = lerp(6.8, 0.96, e) * (1 + Math.sin(f / 23) * 0.004); // 最後も止まらない
  const [vx, vy] = IB2_VILLAGE_XY;                  // わが村 (絵図の上の座標)
  const cx = lerp(vx, 960, e);                      // 画面の中心に来る絵図の点
  const cy = lerp(vy, 540, e);
  const sx = 960 + (vx - cx) * z;                   // わが村の画面上の位置
  const sy = 540 + (vy - cy) * z;
  const ripT = f > 26 ? ((f - 26) % 34) / 34 : 0;   // 点から広がる波紋 (くりかえす)
  const lead = easeOut(seg(f, 30, 40));             // 札からのびる引き出し線
  return (
    <Frame f={f} seed={946} bg={C.sea}>
      <g transform={`translate(${960 - cx * z} ${540 - cy * z}) scale(${z})`}>
        <IchiB2JapanMap f={f} k={1 / z} />
      </g>
      {/* 村の点から広がる波紋 (画面座標。引きが終わっても止まらない) */}
      <circle cx={sx} cy={sy} r={15 + ripT * 150} fill="none" stroke={KRP.red}
        strokeWidth={6} opacity={0.5 * (1 - ripT) * clamp01(seg(f, 26, 32))} />
      {/* 札からわが村の点へのびる引き出し線 */}
      <path d={`M 838 513 L ${lerp(838, 878, lead)} ${lerp(513, 586, lead)}`}
        fill="none" stroke={KRP.red} strokeWidth={5} strokeDasharray="12 9"
        strokeLinecap="round" opacity={lead} />
      <TagPlate x={790} y={486} text="わが村" size={32} t={seg(f, 28, 38)} color={KRP.red} />
      <TagPlate x={1400} y={760} text="土俵 = 戦場1つ" size={48} t={seg(f, 26, 40)} color={KRP.red} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  ib2_shou_tobira:       (f) => <S36 f={f} />,
  ib2_ichibanyari_meiyo: (f) => <S37 f={f} />,
  ib2_tekijin_totsunyu:  (f) => <S38 f={f} />,
  ib2_kazoete_kurenai:   (f) => <S39 f={f} />,
  ib2_gunchujo_kaku:     (f) => <S40 f={f} />,
  ib2_jiko_shinkoku:     (f) => <S41 f={f} />,
  ib2_shonin_shomei:     (f) => <S42 f={f} />,
  ib2_shorui_de_kakutei: (f) => <S43 f={f} />,
  ib2_kiroku_no_rekishi: (f) => <S44 f={f} />,
  ib2_hitotsu_no_senjo:  (f) => <S45 f={f} />,
  ib2_monosashi_nai:     (f) => <S46 f={f} />,
  ib2_dohyo_chiisai:     (f) => <S47 f={f} />,
};

export const I_B2_MOTIFS: string[] = [
  "ib2_shou_tobira",       // #36 第2章、一番槍は、書類仕事。
  "ib2_ichibanyari_meiyo", // #37 日本の戦場です。武士の世界には「一番槍」という最高の名誉がありました。
  "ib2_tekijin_totsunyu",  // #38 敵陣に真っ先に突っ込んだ者が、一番。わかりやすいですね。
  "ib2_kazoete_kurenai",   // #39 ところがこの名誉、黙っていても誰かが数えてくれるわけではありません。
  "ib2_gunchujo_kaku",     // #40 武士は戦いが終わると、「軍忠状」という書類を書きました。
  "ib2_jiko_shinkoku",     // #41 私はどこそこで一番に突入し、これこれの手柄を立てました、という自己申告書です。
  "ib2_shonin_shomei",     // #42 しかも、証人つき。見ていた仲間に、署名をもらうのです。
  "ib2_shorui_de_kakutei", // #43 命がけの武勇も、最後は書類と証人で確定する。
  "ib2_kiroku_no_rekishi", // #44 順位の歴史は、記録の歴史でもありました。
  "ib2_hitotsu_no_senjo",  // #45 ただし、この「一番」が通じる範囲は、たった一つの戦場だけ。
  "ib2_monosashi_nai",     // #46 隣の国の武士と比べる物差しは、まだどこにもありません。
  "ib2_dohyo_chiisai",     // #47 土俵は、まだこんなに小さかったのです。
];

export const ichiB2Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;

// ===== 検品用プレビュー: 1フレーム = 1シーン (f=45 の瞬間を描く) =====
export const ICHI_B2_PREVIEW_FRAMES = Math.max(I_B2_MOTIFS.length, 1);
export const IchiB2Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(frame, I_B2_MOTIFS.length - 1);
  return <>{ichiB2Scene(I_B2_MOTIFS[i] ?? "", 45)}</>;
};
