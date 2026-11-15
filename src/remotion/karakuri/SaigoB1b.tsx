// 「人類は、昔から飛ばして観ていた」: 文#38〜#44 (7文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-1.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで7枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1037〜1043。
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
  tatami: "#B8B273",      // 畳の表
  tatamiDark: "#9A9460",  // 畳の縁側の影
  tatamiHeri: "#4A5568",  // 畳縁 (紺)
  doma: "#B09468",        // 土間の土
  domaDark: "#96794E",    // 土間の影
  wall: "#EFE3C8",        // 茶屋の砂壁
  wood2: "#A67C44",       // 柱・木戸の木
  wood2Dark: "#7E5C30",   // 木の影
  noren: "#39557E",       // 暖簾の藍
  kimono: "#C2563C",      // 衣桁の着物 (朱)
  kimono2: "#7A9E7E",     // 着物の裏地
  aozora: "#BBD6EE",      // 窓の外の空
  yuyake: "#E8B06A",      // 夕焼け
  asa: "#CFE3EE",         // 朝の空
  hiru: "#A6C9E8",        // 昼の空
  aoz: "#5B6E8C",         // 藍の敷き布 (絵巻の下)
  zabuton: "#8E5B7A",     // 座布団
  blueprint: "#EAF2EE",   // 設計図の紙 (薄青緑)
  bpLine: "#3E6B8C",      // 設計図の線
  star: "#E8B93A",        // レビューの星
  lantern: "#E8D9A8",     // 提灯の灯
  // 役者の扮装 (歌舞伎)
  shu: "#C2402E",         // 濃い朱 (衣装・隈取)
  shuFukai: "#9A2E22",
  ai: "#2F4A74",          // 藍
  aiFukai: "#1F3454",
  kincha: "#C08A32",      // 金茶 (帯・扇)
  shoji: "#F6EFDC",       // 足袋・障子紙
} as const;
void useCurrentFrame; void Stamp; void QMark; void ChapterDoor;
void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3; void SGP;

// ===== このファイルだけの小道具 ======================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 決まった見た目にするための擬似乱数 (レンダのたびに変わらない)
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

// 幟 (のぼり)。f ではためく。縦長の布に縦書きふうの模様線だけ (文字は書かない)
const Nobori: React.FC<{
  x: number; y: number; s?: number; f: number; color?: string; phase?: number;
}> = ({ x, y, s = 1, f, color = C.noren, phase = 0 }) => {
  const w1 = Math.sin((f + phase * 13) / 8) * 10;
  const w2 = Math.sin((f + phase * 13) / 8 + 1.4) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1={0} y1={0} x2={0} y2={-300} stroke={C.wood2Dark} strokeWidth={9} />
      <line x1={-6} y1={-296} x2={70} y2={-296} stroke={C.wood2Dark} strokeWidth={8} />
      <path d={`M 8 -290 L 64 -290 Q ${66 + w1} -200 ${64 + w2} -120 L ${58 + w2} -60
                Q ${30 + w1} -66 ${10 + w1} -58 Q ${6} -180 8 -290 Z`}
        fill={color} stroke={KRP.ink} strokeWidth={5} />
      <g stroke={KRP.white} strokeWidth={5} opacity={0.85} fill="none">
        <circle cx={36 + w1 * 0.5} cy={-250} r={16} />
        <line x1={34 + w1 * 0.6} y1={-214} x2={38 + w2 * 0.7} y2={-110} />
      </g>
    </g>
  );
};

// 半畳 (薄い畳。#41 と #42 で同じ物)。rot で回転
const Hanjo: React.FC<{
  x: number; y: number; s?: number; rot?: number;
}> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-110} y={-74} width={220} height={148} rx={6}
      fill={C.tatami} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-110} y={-74} width={220} height={20} fill={C.tatamiHeri} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-110} y={54} width={220} height={20} fill={C.tatamiHeri} stroke={KRP.ink} strokeWidth={4} />
    <g stroke={C.tatamiDark} strokeWidth={3} opacity={0.7}>
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={-96 + i * 38} y1={-50} x2={-96 + i * 38} y2={50} />
      ))}
    </g>
  </g>
);

// 膳 (脚つきの小さな食卓)。#38 と #44 で使う
const Zen: React.FC<{ x: number; y: number; s?: number; f?: number }> =
  ({ x, y, s = 1, f = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-120} y={-26} width={240} height={18} rx={6}
        fill={C.kimono} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-104} y={-8} width={16} height={34} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={88} y={-8} width={16} height={34} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={4} />
      {/* ご飯茶碗 */}
      <path d="M -88 -26 q 4 -30 30 -30 q 26 0 30 30 z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={-58} cy={-56} rx={22} ry={9} fill="#F6F1E3" stroke={KRP.ink} strokeWidth={4} />
      {/* 焼き魚の皿 */}
      <ellipse cx={14} cy={-32} rx={44} ry={13} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -16 -38 q 28 -14 56 0 q -10 8 -26 8 q -20 0 -30 -8 z"
        fill={C.wood2} stroke={KRP.ink} strokeWidth={4} />
      {/* 徳利とお猪口 */}
      <path d="M 78 -26 l 4 -26 q -10 -8 -10 -20 q 0 -12 14 -12 q 14 0 14 12 q 0 12 -10 20 l 4 26 z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* 湯気 */}
      {f > 0 && (
        <g stroke={KRP.grayDark} strokeWidth={4} opacity={0.5} fill="none">
          <path d={`M -58 -72 q ${Math.sin(f / 10) * 8} -16 2 -34`} />
          <path d={`M 14 -48 q ${Math.sin(f / 10 + 1.2) * 8} -14 0 -28`} />
        </g>
      )}
    </g>
  );

// 芝居小屋の正面 (櫓つき)。mode="emaki"=彩色 / "line"=設計図の線画
const Koya: React.FC<{
  x: number; y: number; s?: number; mode?: "emaki" | "line"; f?: number;
}> = ({ x, y, s = 1, mode = "emaki", f = 0 }) => {
  const line = mode === "line";
  const body = line ? "none" : C.wall;
  const roof = line ? "none" : C.wood2Dark;
  const stroke = line ? C.bpLine : KRP.ink;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 本体 */}
      <rect x={-180} y={-160} width={360} height={160} fill={body} stroke={stroke} strokeWidth={line ? 5 : 7} />
      {/* 屋根 */}
      <path d="M -204 -160 L 0 -216 L 204 -160 Z" fill={roof} stroke={stroke} strokeWidth={line ? 5 : 7} />
      {/* 櫓 (やぐら) — 興行の印 */}
      <rect x={-52} y={-286} width={104} height={76} fill={line ? "none" : C.wood2}
        stroke={stroke} strokeWidth={line ? 5 : 6} />
      <path d="M -64 -286 L 0 -312 L 64 -286 Z" fill={line ? "none" : C.wood2Dark}
        stroke={stroke} strokeWidth={line ? 5 : 6} />
      <g stroke={stroke} strokeWidth={line ? 3.5 : 4} opacity={line ? 1 : 0.8}>
        <line x1={-30} y1={-282} x2={-30} y2={-214} />
        <line x1={0} y1={-282} x2={0} y2={-214} />
        <line x1={30} y1={-282} x2={30} y2={-214} />
      </g>
      {/* 木戸口 */}
      <rect x={-44} y={-104} width={88} height={104} fill={line ? "none" : C.wood2Dark}
        stroke={stroke} strokeWidth={line ? 4.5 : 6} />
      {/* 掛け看板 (文字なしの絵看板) */}
      {!line && (
        <g>
          <rect x={-160} y={-140} width={80} height={56} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={80} y={-140} width={80} height={56} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-120} cy={-112} r={16} fill={C.kimono} opacity={0.8} />
          <path d="M 96 -100 l 22 -28 l 20 14 l 22 -22" fill="none" stroke={C.noren} strokeWidth={5} />
        </g>
      )}
      {/* 櫓の幕がはためく */}
      {!line && f > 0 && (
        <path d={`M -52 -282 q 20 ${6 + Math.sin(f / 9) * 5} 52 ${4 + Math.sin(f / 9 + 1) * 4} q 32 2 52 -6 l 0 10 l -104 2 z`}
          fill={C.noren} opacity={0.9} />
      )}
    </g>
  );
};

// ざわめき・やいのやいのの飛び言葉マーク (文字なし。線の勢いだけ)
const Zawa: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> =
  ({ x, y, s = 1, f, phase = 0, color = KRP.orange }) => {
    const p = 0.75 + 0.25 * Math.sin((f + phase * 23) / 6);
    return (
      <g transform={`translate(${x} ${y}) scale(${s * p})`} stroke={color}
        strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.9}>
        <line x1={-26} y1={10} x2={-40} y2={-14} />
        <line x1={0} y1={6} x2={0} y2={-22} />
        <line x1={26} y1={10} x2={40} y2={-14} />
      </g>
    );
  };

// ===== 人物に重ねる物の入れ物 ========================================
// Person とまったく同じ変換をかけた <g>。この中では「頭の丸 cx=0 cy=-228 r=64」
// 「肩 (±67,-148)」「胴体 -58..58 / -160..-52」が人物ローカル座標でそのまま使える。
// f / phase / still / lean は人物に渡したものと同じ値を渡すこと (傾いても外れない)。
// ※SaigoB1.tsx にも同じものがある (ファイル間で部品は共有できないので2回書く)
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
  face?: "normal" | "angry" | "surprised" | "smile" | "worried";
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
  const gLine = (x1: number, y1: number, x2: number, y2: number, k: number) => (
    <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.white} strokeWidth={7} opacity={0.5} />
  );
  return (
    <>
      {/* ① 人物より奥: 袖と裾 */}
      <PersonRig {...rig}>
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
        {([-1, 1] as const).map((side) => {
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
              <line x1={hx - side * w * 0.3} y1={(hy + dropTo) / 2 - 6}
                x2={hx + side * (w + 4) + sway * 0.8} y2={(hy + dropTo) / 2 + 2}
                stroke={KRP.white} strokeWidth={7} opacity={0.5} />
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
        <rect x={-60} y={-98} width={120} height={28} rx={6}
          fill={C.kincha} stroke={C.ink} strokeWidth={5} />
        <rect x={-18} y={-104} width={38} height={40} rx={7}
          fill={C.kincha} stroke={C.ink} strokeWidth={5} />
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

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #38 そこで食事をして、着替えて、休んで、また戻ってくる。
// 格: 並 / seed 1037
// 絵: 茶屋の座敷。膳、衣桁の着物、ごろ寝。窓の外に小屋の幟が見える
// どこ: 芝居茶屋の二階座敷。右の窓の外に小屋の櫓と幟
// 演出: 「食う・着替える・休む」を1部屋に同居させる。主役はごろ寝の客
// 動き: 湯気・幟のはためき・寝息の弧・衣桁の着物の裾ゆれ・行灯の明滅
const Sg038: React.FC<{ f: number }> = ({ f }) => {
  const su = seg(f, 10, 30); // 寝息の出現
  return (
    <Frame f={f} seed={1037}>
      {/* 砂壁と鴨居 */}
      <rect x={-20} y={-20} width={W + 40} height={700} fill={C.wall} />
      <rect x={-20} y={120} width={W + 40} height={16} fill={C.wood2} stroke={KRP.ink} strokeWidth={4} />
      <g stroke={C.wood2Dark} strokeWidth={3} opacity={0.25}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={rnd(1, i) * W} y1={150} x2={rnd(1, i) * W + 30} y2={640} />
        ))}
      </g>
      {/* 畳の床 (縁つき) */}
      <rect x={-20} y={660} width={W + 40} height={H - 640} fill={C.tatami} />
      <line x1={-20} y1={660} x2={W + 20} y2={660} stroke={KRP.ink} strokeWidth={7} />
      {[820, 990].map((yy, i) => (
        <g key={i}>
          <rect x={-20} y={yy} width={W + 40} height={14} fill={C.tatamiHeri} opacity={0.9} />
          <line x1={-20} y1={yy} x2={W + 20} y2={yy} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        </g>
      ))}
      <g stroke={C.tatamiDark} strokeWidth={2.5} opacity={0.45}>
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={i * 85} y1={674} x2={i * 85 - 60} y2={1080} />
        ))}
      </g>
      {/* 左の柱 */}
      <rect x={30} y={-20} width={46} height={700} fill={C.wood2} stroke={KRP.ink} strokeWidth={6} />
      {/* 右の窓: 外に小屋の櫓と幟 */}
      <g>
        <rect x={1370} y={180} width={430} height={420} fill={C.aozora} stroke={KRP.ink} strokeWidth={9} />
        <g>
          <defs><clipPath id="sg38win"><rect x={1370} y={180} width={430} height={420} /></clipPath></defs>
          <g clipPath="url(#sg38win)">
            <rect x={1370} y={470} width={430} height={130} fill="#C9BB8E" />
            <Koya x={1600} y={560} s={0.9} f={f} />
            <Nobori x={1420} y={590} s={1.1} f={f} phase={0} color={C.kimono} />
            <Nobori x={1760} y={596} s={1.0} f={f} phase={2} />
            {/* 通りを行く人影 */}
            <PersonMini x={1480 + ((f * 2.2) % 420)} y={606} s={0.38} color={KRP.grayDark} f={f} phase={4} face="none" />
          </g>
        </g>
        <line x1={1585} y1={180} x2={1585} y2={600} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1370} y1={390} x2={1800} y2={390} stroke={KRP.ink} strokeWidth={7} />
        {/* 障子 (半開き) */}
        <rect x={1240} y={170} width={140} height={440} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} opacity={0.96} />
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.6}>
          <line x1={1240} y1={280} x2={1380} y2={280} />
          <line x1={1240} y1={390} x2={1380} y2={390} />
          <line x1={1240} y1={500} x2={1380} y2={500} />
          <line x1={1310} y1={170} x2={1310} y2={610} />
        </g>
      </g>
      {/* 衣桁 (いこう) と掛かった着物 = 着替え */}
      <g>
        <rect x={190} y={200} width={18} height={480} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={560} y={200} width={18} height={480} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={150} y={192} width={470} height={20} rx={8} fill={C.wood2} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 230 212 q -14 160 ${Math.sin(f / 14) * 6 - 10} 330 l 120 0 q 12 -90 8 -180 l 60 0
                  q -6 90 8 180 l 120 0 q 10 -170 -10 -330 z`}
          fill={C.kimono} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 356 212 l 0 150 l 60 0 l 0 -150 z" fill={C.kimono2} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 330 212 q 56 44 112 0" fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* 畳んだ着替え */}
        <rect x={250} y={700} width={180} height={40} rx={8} fill={C.kimono2} stroke={KRP.ink} strokeWidth={5} />
        <rect x={270} y={668} width={140} height={36} rx={8} fill={C.noren} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* ごろ寝の客 (主役) — 座布団を枕に */}
      <g>
        <ellipse cx={960} cy={920} rx={330} ry={46} fill={C.tatamiDark} opacity={0.4} />
        <ellipse cx={1210} cy={880} rx={95} ry={34} fill={C.zabuton} stroke={KRP.ink} strokeWidth={6} />
        <Person x={820} y={906} s={1.55} lean={87} cloth="#4E6E55" clothDark="#3A5440"
          face="smile" f={f} phase={3} />
        {/* 寝息 (すう、の弧。文字は書かない) */}
        <g stroke={KRP.blueDeep} strokeWidth={6} fill="none" strokeLinecap="round" opacity={su * 0.85}>
          <path d={`M 1300 760 q 24 ${-18 - Math.sin(f / 11) * 6} 48 0`} />
          <path d={`M 1330 700 q 30 ${-24 - Math.sin(f / 11 + 1) * 8} 60 0`} opacity={0.7} />
        </g>
      </g>
      {/* 膳 = 食事 (食べかけのまま置いてある) */}
      <Zen x={700} y={760} s={1.25} f={f} />
      {/* 行灯 */}
      <g>
        <rect x={1660} y={760} width={150} height={210} rx={10} fill={KRP.white}
          stroke={KRP.ink} strokeWidth={7} opacity={0.95} />
        <rect x={1660} y={750} width={150} height={16} rx={6} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1735} cy={865} r={34 + Math.sin(f / 7) * 3} fill={C.lantern} opacity={0.85} />
        <line x1={1735} y1={760} x2={1735} y2={970} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
      </g>
      {/* 土瓶と湯呑み */}
      <g>
        <path d="M 1130 1012 q -2 -44 36 -44 q 38 0 36 44 z" fill={C.noren} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1128 990 q -24 -4 -28 14" fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={1230} y={984} width={44} height={30} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #39 つまり「席を立って出入りする」ことが、仕組みとして用意されていたのです。
// 格: 図 / seed 1038
// 絵: 小屋⇄茶屋の矢印に「公式」の朱印。設計図の体裁で出入りが描き込まれている
// どこ: 普請場の製図台の上。設計図 (薄青緑の紙) に小屋⇄茶屋が線画で描かれている
// 演出: 「出入り」が最初から図面に描き込まれている=仕組み。朱印「公式」がドン
// 動き: ⇄の破線が流れる・朱印が f=22 でドンと押される・筆が揺れる
const Sg039: React.FC<{ f: number }> = ({ f }) => {
  const stampT = pop(seg(f, 22, 32));
  const dash = -f * 3;
  return (
    <Frame f={f} seed={1038}>
      {/* 製図台 (木の机) = 世界 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#8E6B3E" />
      <g stroke="#6E5330" strokeWidth={5} opacity={0.5}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={0} y1={i * 130 + 20} x2={W} y2={i * 130 - 18} />
        ))}
      </g>
      {/* 道具: 定規・筆・硯 (紙のまわり) */}
      <g transform="rotate(8 1760 190)">
        <rect x={1700} y={60} width={44} height={420} rx={6} fill="#D9C9A6" stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.6}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={1700} y1={100 + i * 42} x2={1718} y2={100 + i * 42} />
          ))}
        </g>
      </g>
      <g transform={`rotate(${-24 + Math.sin(f / 16) * 2} 190 920)`}>
        <rect x={160} y={820} width={22} height={200} rx={10} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 160 1020 l 22 0 l -4 46 q -7 10 -14 0 z" fill={KRP.ink} />
      </g>
      <ellipse cx={330} cy={1000} rx={90} ry={34} fill="#3A3732" stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={330} cy={994} rx={66} ry={20} fill="#191714" />
      {/* 設計図の紙 (方眼はこの紙の中だけ) */}
      <g transform="rotate(-1.2 960 560)">
        <rect x={180} y={120} width={1560} height={840} rx={8} fill={C.blueprint}
          stroke={KRP.ink} strokeWidth={9} />
        <defs><clipPath id="sg39paper"><rect x={180} y={120} width={1560} height={840} rx={8} /></clipPath></defs>
        <g clipPath="url(#sg39paper)">
          <g stroke={C.bpLine} strokeWidth={1.6} opacity={0.3}>
            {Array.from({ length: 20 }, (_, i) => (
              <line key={`h${i}`} x1={180} y1={120 + i * 46} x2={1740} y2={120 + i * 46} />
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <line key={`v${i}`} x1={180 + i * 46} y1={120} x2={180 + i * 46} y2={960} />
            ))}
          </g>
          {/* 紙の四隅の折れ・押さえ石 */}
          <path d="M 1740 120 l -90 0 l 90 76 z" fill="#D7E2DA" stroke={C.bpLine} strokeWidth={3} />
          {/* 左: 小屋の線画 */}
          <Koya x={560} y={800} s={1.45} mode="line" />
          <TagPlate x={560} y={300} text="小屋" size={44} t={seg(f, 4, 14)} />
          {/* 右: 茶屋の線画 (二階建て) */}
          <g stroke={C.bpLine} strokeWidth={5} fill="none">
            <rect x={1230} y={560} width={340} height={240} />
            <rect x={1270} y={430} width={260} height={130} />
            <path d="M 1246 430 L 1400 372 L 1554 430 Z" />
            <rect x={1330} y={690} width={90} height={110} strokeWidth={4.5} />
            <rect x={1286} y={600} width={70} height={56} strokeWidth={4} />
            <rect x={1446} y={600} width={70} height={56} strokeWidth={4} />
            <rect x={1310} y={462} width={180} height={60} strokeWidth={4} />
          </g>
          <TagPlate x={1400} y={300} text="茶屋" size={44} t={seg(f, 8, 18)} />
          {/* 中央: 出入りの道 (破線が流れる) */}
          <g strokeLinecap="round" fill="none">
            <path d="M 760 680 Q 960 630 1210 672" stroke={C.bpLine} strokeWidth={9}
              strokeDasharray="26 20" strokeDashoffset={dash} />
            <path d="M 1210 760 Q 960 810 760 766" stroke={C.bpLine} strokeWidth={9}
              strokeDasharray="26 20" strokeDashoffset={dash} />
          </g>
          <Arrow x={1224} y={672} s={1.1} rot={8} t={1} color={C.bpLine} />
          <Arrow x={746} y={766} s={1.1} rot={188} t={1} color={C.bpLine} />
          {/* 寸法線ふうの飾り (数字は書かない) */}
          <g stroke={C.bpLine} strokeWidth={3} opacity={0.65}>
            <line x1={400} y1={900} x2={1540} y2={900} />
            <line x1={400} y1={888} x2={400} y2={912} />
            <line x1={1540} y1={888} x2={1540} y2={912} />
          </g>
        </g>
        {/* 朱印「公式」(自前のSVG判子。ドンと押される) */}
        {stampT > 0 && (
          <g transform={`translate(985 712) rotate(-8) scale(${lerp(1.7, 1, clamp01(stampT))})`}
            opacity={clamp01(stampT)}>
            <rect x={-104} y={-78} width={208} height={156} rx={14} fill="none"
              stroke={SGP.shuin} strokeWidth={12} />
            <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={76} fill={SGP.shuin} letterSpacing={6}>公式</text>
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #40 土間のお客は、もっと直接的でした。
// 格: 並 / seed 1039
// 絵: 土間の群衆。ぎっしり、立て膝、首を伸ばし、やいのやいの
// どこ: 小屋の中、舞台の上手から土間を見下ろす。上に舞台の縁と足、下いっぱいに群衆
// 演出: 「ぎっしり・首を伸ばす・やいのやいの」の圧。主役は群衆そのもの
// 動き: 全員が f でゆれる・腕が上がる・ざわめきマークが明滅・役者の足が動く
const Sg040: React.FC<{ f: number }> = ({ f }) => {
  const palette = ["#5B7FA6", "#B06A4C", "#6E8E5E", "#8E5B7A", "#C2985C", "#607086", "#A6584E", "#7E9E8E"];
  return (
    <Frame f={f} seed={1039}>
      {/* 小屋の中の薄暗い壁と梁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#E3D4AE" />
      <rect x={-20} y={-20} width={W + 40} height={250} fill="#C9B88E" />
      <line x1={-20} y1={230} x2={W + 20} y2={230} stroke={KRP.ink} strokeWidth={6} opacity={0.6} />
      {/* 上: 舞台の縁 (役者は足だけ見切れる = 視線の先) */}
      <g>
        <rect x={-20} y={96} width={W + 40} height={140} fill={SGP.stage} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.4}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={i * 170 - 20} y1={110} x2={i * 170 + 10} y2={226} />
          ))}
        </g>
        {/* 役者の袴の裾と足袋 (上手で見得を切っている体。広い袖の先が見切れる) */}
        <g transform={`translate(${620 + Math.sin(f / 15) * 14} 0)`}>
          {/* 広袖の先 (両脇から垂れて見切れる) */}
          <path d={`M -268 -20 L -158 -20 L ${-150 + Math.sin(f / 13) * 8} 64
                    Q ${-212 + Math.sin(f / 13) * 6} 86 ${-274 + Math.sin(f / 13) * 4} 62 Z`}
            fill={C.shu} stroke={KRP.ink} strokeWidth={7} />
          <path d={`M 182 -20 L 292 -20 L ${300 + Math.sin(f / 13 + 1) * 8} 56
                    Q ${240 + Math.sin(f / 13 + 1) * 6} 80 ${176 + Math.sin(f / 13 + 1) * 4} 54 Z`}
            fill={C.shu} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={KRP.white} strokeWidth={7} opacity={0.5}>
            <line x1={-266} y1={18} x2={-152} y2={20} />
            <line x1={180} y1={14} x2={296} y2={12} />
          </g>
          {/* 袖口の濃い縁 */}
          <g stroke={C.shuFukai} strokeWidth={9} fill="none">
            <path d={`M ${-274 + Math.sin(f / 13) * 4} 62 Q ${-212 + Math.sin(f / 13) * 6} 86 ${-150 + Math.sin(f / 13) * 8} 64`} />
            <path d={`M ${176 + Math.sin(f / 13 + 1) * 4} 54 Q ${240 + Math.sin(f / 13 + 1) * 6} 80 ${300 + Math.sin(f / 13 + 1) * 8} 56`} />
          </g>
          {/* 袴 (大きな格子) */}
          <path d="M -90 -20 L -120 108 L -10 108 L 6 -20 Z" fill={C.shu} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 30 -20 L 20 108 L 130 108 L 94 -20 Z" fill={C.shu} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={KRP.white} strokeWidth={8} opacity={0.5}>
            <line x1={-114} y1={82} x2={-14} y2={82} />
            <line x1={-100} y1={26} x2={-2} y2={26} />
            <line x1={-54} y1={-20} x2={-66} y2={108} />
            <line x1={24} y1={82} x2={126} y2={82} />
            <line x1={27} y1={26} x2={110} y2={26} />
            <line x1={62} y1={-20} x2={74} y2={108} />
          </g>
          <ellipse cx={-66} cy={112} rx={44} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={76} cy={112} rx={44} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 蝋燭の明かり (舞台の縁) */}
        {[160, 1060, 1480, 1800].map((x, i) => (
          <g key={i}>
            <rect x={x - 8} y={180} width={16} height={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={x} cy={168} r={12 + Math.sin(f / 6 + i * 2) * 3} fill={C.lantern} opacity={0.9} />
          </g>
        ))}
      </g>
      {/* 土間の床 (奥) */}
      <rect x={-20} y={236} width={W + 40} height={844} fill={C.doma} />
      <g fill={C.domaDark} opacity={0.5}>
        {Array.from({ length: 26 }, (_, i) => (
          <ellipse key={i} cx={rnd(40, i) * W} cy={260 + rnd(40, i + 50) * 800}
            rx={30 + rnd(40, i + 90) * 50} ry={8} />
        ))}
      </g>
      {/* 群衆: 奥 (小さい) → 手前 (大きい) の4列。ぎっしり */}
      {Array.from({ length: 4 }, (_, row) => {
        const n = [13, 11, 9, 7][row];
        const y = [430, 580, 780, 1030][row];
        const s = [0.62, 0.82, 1.1, 1.5][row];
        return (
          <g key={row}>
            {Array.from({ length: n }, (_, i) => {
              const x = (i + 0.5) * (W / n) + (rnd(41, row * 20 + i) - 0.5) * 60;
              const up = rnd(42, row * 20 + i) < 0.3;
              return (
                <PersonMini key={i} x={x} y={y} s={s * (0.92 + rnd(43, i + row) * 0.16)}
                  color={palette[(i * 3 + row * 5) % palette.length]} f={f}
                  phase={row * 20 + i} face={row >= 2 ? "smile" : "dot"}
                  arms={up ? "up" : "down"} />
              );
            })}
          </g>
        );
      })}
      {/* 首を伸ばす人 (主役級に1人大きく): つま先立ちで頭ひとつ抜ける */}
      <g transform={`translate(0 ${-Math.abs(Math.sin(f / 9)) * 16})`}>
        <Person x={1430} y={800} s={1.25} cloth="#B06A4C" clothDark="#8E5038"
          face="surprised" gaze={[-0.5, -0.6]} pose="raise" f={f} phase={7} />
      </g>
      {/* やいのやいの (ざわめきマークが群衆から立つ) */}
      <Zawa x={320} y={360} s={1.1} f={f} phase={0} />
      <Zawa x={860} y={330} s={0.9} f={f} phase={3} color={KRP.red} />
      <Zawa x={1250} y={370} s={1.2} f={f} phase={5} />
      <Zawa x={1690} y={340} s={0.9} f={f} phase={8} color={KRP.red} />
      {/* 手前: 弁当と徳利が回っている (土間の自由) */}
      <g transform="rotate(-6 260 1040)">
        <rect x={180} y={1000} width={160} height={70} rx={8} fill={C.wood2} stroke={KRP.ink} strokeWidth={6} />
        <line x1={260} y1={1000} x2={260} y2={1070} stroke={KRP.ink} strokeWidth={4} />
        <line x1={180} y1={1035} x2={340} y2={1035} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <path d="M 1740 1076 l 6 -40 q -14 -10 -14 -26 q 0 -16 18 -16 q 18 0 18 16 q 0 16 -14 26 l 6 40 z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #41 芝居が気に入らないと、敷いていた薄い畳、半畳を、舞台へ放り投げました。
// 格: 山 / seed 1040
// 絵: 半畳が宙を舞う瞬間。投げた客の腕、軌道線、よける役者、ざわつく場内。事件
// どこ: 小屋の中の引き。左=松羽目の舞台と役者、右下=土間の群衆。半畳が宙を舞う
// 演出: 事件の瞬間。軌道線・速度線・よける役者・振り抜いた腕・ざわつく場内を全部入れる
// 動き: 半畳が f で弧を描いて飛ぶ+回転、役者がのけぞる、群衆の腕が上がる
const Sg041: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 6, 40) * 0.75;       // 飛行の進み (f=45 でも舞台手前の空中で止める)
  const hx = lerp(1560, 560, t);        // 右の客 → 左の舞台へ
  const hy = 700 - Math.sin(t * Math.PI) * 420 + t * 40; // 放物線
  const rot = -20 - t * 340;            // くるくる回る
  const dodge = easeOut(seg(f, 20, 36)); // 役者ののけぞり
  const palette = ["#5B7FA6", "#B06A4C", "#6E8E5E", "#8E5B7A", "#C2985C", "#607086"];
  return (
    <Frame f={f} seed={1040}>
      {/* 小屋の壁と梁 */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#E3D4AE" />
      <g stroke={C.wood2Dark} strokeWidth={10} opacity={0.5}>
        <line x1={-20} y1={110} x2={W + 20} y2={110} />
        <line x1={420} y1={-20} x2={420} y2={110} />
        <line x1={1420} y1={-20} x2={1420} y2={110} />
      </g>
      {/* 左: 舞台 (松羽目) */}
      <g>
        <rect x={-20} y={560} width={880} height={110} fill={SGP.stage} stroke={KRP.ink} strokeWidth={8} />
        <rect x={-20} y={140} width={860} height={420} fill="#F0E6C0" stroke={KRP.ink} strokeWidth={8} />
        {/* 松 */}
        <g>
          <path d="M 300 560 q -30 -140 20 -230 q -80 10 -120 -50" fill="none"
            stroke="#6E5330" strokeWidth={26} strokeLinecap="round" />
          <ellipse cx={150} cy={250} rx={130} ry={56} fill="#5E7E4E" stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={330} cy={200} rx={150} ry={62} fill="#6E8E5E" stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={420} cy={300} rx={110} ry={48} fill="#5E7E4E" stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 定式幕 (左端に寄せた縞) */}
        <g>
          <rect x={-20} y={130} width={120} height={440} fill="#2E4E3E" stroke={KRP.ink} strokeWidth={6} />
          <rect x={56} y={130} width={44} height={440} fill={C.kimono} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* よける役者 (のけぞり+驚き。袖を上げて身をかわす) */}
        <g transform={`rotate(${-dodge * 17} 560 660) translate(${-dodge * 40} 0)`}>
          <ellipse cx={560} cy={664} rx={110} ry={22} fill={KRP.ink} opacity={0.18} />
          <KabukiYakusha x={560} y={656} s={1.9} f={f} phase={1}
            pose="banzai" face="surprised" gaze={[0.7, -0.3]}
            iro={C.shu} iroDark={C.shuFukai} gara="koushi" />
        </g>
        {/* 役者の焦りの汗 */}
        <g stroke={KRP.blueDeep} strokeWidth={6} strokeLinecap="round" opacity={dodge}>
          <line x1={640} y1={300} x2={660} y2={270} />
          <line x1={668} y1={330} x2={692} y2={306} />
        </g>
      </g>
      {/* 右下: 土間の群衆 (ざわつく) */}
      <rect x={760} y={820} width={1180} height={280} fill={C.doma} />
      <line x1={760} y1={820} x2={1940} y2={820} stroke={KRP.ink} strokeWidth={6} opacity={0.6} />
      {Array.from({ length: 8 }, (_, i) => (
        <PersonMini key={i} x={850 + i * 140 + (rnd(50, i) - 0.5) * 40} y={1010 + rnd(50, i + 30) * 50}
          s={0.9 + rnd(50, i + 60) * 0.25} color={palette[i % palette.length]} f={f}
          phase={i * 3} face={i % 2 ? "smile" : "dot"} arms={rnd(50, i + 90) < 0.45 ? "up" : "down"} />
      ))}
      {/* 投げた客 (主役の一角): 振り抜いた腕・怒り顔・立て膝から立ち上がった勢い */}
      <g transform={`rotate(${lerp(14, -6, easeOut(seg(f, 6, 20)))} 1600 1010)`}>
        <ellipse cx={1600} cy={1014} rx={120} ry={24} fill={KRP.ink} opacity={0.2} />
        <Person x={1600} y={1006} s={2.0} cloth="#607086" clothDark="#49525F"
          face="angry" pose="raise" gaze={[-0.7, -0.5]} f={f} phase={9} />
      </g>
      {/* 投げの勢いの弧 */}
      <g stroke={KRP.orange} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9}>
        <path d={`M 1700 ${640} q -60 -90 -150 -110`} opacity={seg(f, 4, 10) * 0.9} />
        <path d={`M 1740 ${700} q -80 -120 -190 -150`} opacity={seg(f, 6, 12) * 0.7} />
      </g>
      {/* 半畳: 軌道線 (破線の弧) + 本体 + 速度線 */}
      <path d="M 1560 700 Q 1060 180 560 560" fill="none" stroke={KRP.red}
        strokeWidth={7} strokeDasharray="20 18" strokeDashoffset={-f * 4}
        opacity={seg(f, 8, 16) * 0.75} />
      <g opacity={seg(f, 6, 9)}>
        <Hanjo x={hx} y={hy} s={1.15} rot={rot} />
        {/* 速度線 */}
        <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
          <line x1={hx + 150} y1={hy - 50} x2={hx + 260} y2={hy - 86} />
          <line x1={hx + 160} y1={hy + 10} x2={hx + 280} y2={hy - 10} />
          <line x1={hx + 140} y1={hy + 66} x2={hx + 250} y2={hy + 70} />
        </g>
      </g>
      {/* 場内のざわめき */}
      <Zawa x={1000} y={880} s={1.2} f={f} phase={2} color={KRP.red} />
      <Zawa x={1330} y={900} s={1.0} f={f} phase={6} />
      <Zawa x={1860} y={830} s={0.9} f={f} phase={11} color={KRP.red} />
      {/* 事件の印: 衝撃マーク (半畳の出発点) */}
      <g transform={`translate(1640 620) scale(${pop(seg(f, 6, 14))})`} opacity={1 - t * 0.6}>
        <g stroke={KRP.yellow} strokeWidth={8} strokeLinecap="round">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 36} y1={Math.sin(a) * 36}
              x2={Math.cos(a) * 70} y2={Math.sin(a) * 70} />;
          })}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #42 不満をその場で投げ返す、いわばレビュー機能つきの客席です。
// 格: 図 / seed 1041
// 絵: 飛んでいく半畳に星1つの札「★☆☆☆☆」。配達矢印が舞台へ。世界=土間の床
// どこ: 土間の床の上空を図解として使う。左=舞台の縁、右=客、中央=荷札つきの半畳
// 演出: 半畳に星1つの荷札「★☆☆☆☆」を結び、配達の破線矢印が舞台へ向かう
// 動き: 半畳がゆっくり進む・荷札がぶらぶら・星が左から順に点く・破線が流れる
const Sg042: React.FC<{ f: number }> = ({ f }) => {
  const t = seg(f, 8, 40);
  const hx = lerp(1250, 830, t);        // 右 → 左へ配達中
  const hy = 460 + Math.sin(f / 12) * 14;
  const swing = Math.sin(f / 10) * 7;   // 荷札のゆれ
  const palette = ["#5B7FA6", "#B06A4C", "#8E5B7A"];
  return (
    <Frame f={f} seed={1041}>
      {/* 世界 = 土間。上は小屋の薄暗がり */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill="#E8DBB8" />
      <rect x={-20} y={700} width={W + 40} height={400} fill={C.doma} />
      <line x1={-20} y1={700} x2={W + 20} y2={700} stroke={KRP.ink} strokeWidth={7} opacity={0.7} />
      <g fill={C.domaDark} opacity={0.5}>
        {Array.from({ length: 18 }, (_, i) => (
          <ellipse key={i} cx={rnd(60, i) * W} cy={730 + rnd(60, i + 40) * 330}
            rx={26 + rnd(60, i + 80) * 44} ry={7} />
        ))}
      </g>
      <g stroke={C.wood2Dark} strokeWidth={9} opacity={0.35}>
        <line x1={-20} y1={90} x2={W + 20} y2={90} />
        <line x1={960} y1={-20} x2={960} y2={90} />
      </g>
      {/* 左: 舞台の縁 (届け先) */}
      <g>
        <rect x={-20} y={330} width={360} height={500} fill={SGP.stage} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.4}>
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i} x1={40 + i * 80} y1={340} x2={30 + i * 80} y2={820} />
          ))}
        </g>
        <rect x={-20} y={318} width={360} height={26} fill={C.wood2} stroke={KRP.ink} strokeWidth={6} />
        {/* 舞台の上の役者 (受け取る側。袖を上げて身をかわす) */}
        <ellipse cx={170} cy={330} rx={62} ry={14} fill={KRP.ink} opacity={0.15} />
        <KabukiYakusha x={170} y={326} s={0.8} f={f} phase={2}
          pose="raise" face="surprised" gaze={[0.7, 0.2]}
          iro={C.ai} iroDark={C.aiFukai} gara="shima" />
        <TagPlate x={170} y={760} text="舞台へ" size={40} t={seg(f, 20, 30)} />
      </g>
      {/* 右: 差出人の客 (立て膝ふうにしゃがみ気味の群衆の前列) */}
      <g>
        <ellipse cx={1660} cy={960} rx={120} ry={24} fill={KRP.ink} opacity={0.2} />
        <Person x={1660} y={952} s={1.7} cloth="#607086" clothDark="#49525F"
          face="angry" pose="point" pointDir={-1} gaze={[-0.7, -0.3]} f={f} phase={5} />
        {Array.from({ length: 3 }, (_, i) => (
          <PersonMini key={i} x={1430 + i * 170} y={1066} s={0.85}
            color={palette[i]} f={f} phase={i * 4} face="dot" />
        ))}
      </g>
      {/* 配達の破線矢印 (客 → 舞台) */}
      <path d="M 1540 760 Q 1050 560 390 540" fill="none" stroke={KRP.red}
        strokeWidth={8} strokeDasharray="24 20" strokeDashoffset={-f * 3.5}
        opacity={seg(f, 10, 18) * 0.85} />
      <Arrow x={374} y={540} s={1.3} rot={182} t={seg(f, 14, 22)} />
      {/* 主役: 配達中の半畳 + 星1つの荷札 */}
      <g opacity={seg(f, 4, 8)}>
        <Hanjo x={hx} y={hy} s={1.5} rot={-12 + Math.sin(f / 14) * 4} />
        {/* 荷札の紐 (半畳の右上に結ぶ。配達矢印と被らない高さ) */}
        <path d={`M ${hx + 150} ${hy - 60} q ${30 + swing} -40 ${44 + swing} -96`}
          fill="none" stroke={C.wood2Dark} strokeWidth={5} />
        {/* 荷札 (★☆☆☆☆) */}
        <g transform={`translate(${hx + 194 + swing} ${hy - 160}) rotate(${swing})`}>
          <path d="M -40 -46 l 220 0 q 12 0 12 12 l 0 68 q 0 12 -12 12 l -220 0 l -34 -46 z"
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={-48} cy={0} r={7} fill="none" stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 5 }, (_, i) => {
            const on = i === 0;
            const st = pop(seg(f, 18 + i * 3, 24 + i * 3));
            const sx = -16 + i * 44;
            return (
              <g key={i} transform={`translate(${sx} 0) scale(${st})`}>
                <path d="M 0 -17 L 5 -5 L 18 -5 L 8 3 L 12 16 L 0 8 L -12 16 L -8 3 L -18 -5 L -5 -5 Z"
                  fill={on ? C.star : KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
              </g>
            );
          })}
        </g>
      </g>
      {/* 差出の勢い (客の手元から出る小さな風) */}
      <g stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.8}>
        <path d={`M 1500 770 q -40 -30 -90 -36`} opacity={seg(f, 8, 14) * 0.8} />
        <path d={`M 1520 820 q -60 -36 -120 -40`} opacity={seg(f, 10, 16) * 0.6} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #43 安い席で一幕だけ観て帰る、という楽しみ方もありました。
// 格: 並 / seed 1042
// 絵: 木戸で指を1本立てる客。「一幕だけ」。番人がうなずいて銭を受ける
// どこ: 小屋の木戸口の前。夕方前の通り。幟・提灯・銭箱のある入口
// 演出: 指1本=「一幕だけ」。銭が弧を描いて箱へ、番人がうなずく
// 動き: 銭が f で飛ぶ・番人の首がこくり・提灯がゆれる・幟がはためく
const Sg043: React.FC<{ f: number }> = ({ f }) => {
  const coinT = seg(f, 14, 30);
  const cx = lerp(640, 1150, coinT);
  const cy = 560 - Math.sin(coinT * Math.PI) * 180 + coinT * 130;
  const nod = Math.sin(seg(f, 26, 38) * Math.PI) * 10; // 番人のうなずき
  return (
    <Frame f={f} seed={1042}>
      {/* 夕方前の空と通り */}
      <rect x={-20} y={-20} width={W + 40} height={840} fill={C.hiru} />
      <rect x={-20} y={-20} width={W + 40} height={300} fill={C.asa} opacity={0.6} />
      <rect x={-20} y={820} width={W + 40} height={280} fill={C.doma} />
      <line x1={-20} y1={820} x2={W + 20} y2={820} stroke={KRP.ink} strokeWidth={6} opacity={0.6} />
      <g fill={C.domaDark} opacity={0.4}>
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={i} cx={rnd(70, i) * W} cy={850 + rnd(70, i + 30) * 200}
            rx={30 + rnd(70, i + 60) * 40} ry={7} />
        ))}
      </g>
      {/* 小屋の木戸口 (右半分を占める) */}
      <g>
        <rect x={900} y={60} width={1040} height={760} fill={C.wall} stroke={KRP.ink} strokeWidth={9} />
        <g stroke={C.wood2Dark} strokeWidth={4} opacity={0.3}>
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={940 + i * 170} y1={80} x2={930 + i * 170} y2={800} />
          ))}
        </g>
        {/* 屋根霧除け */}
        <rect x={870} y={30} width={1090} height={46} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={7} />
        {/* 木戸 (入口) と鼠木戸の低い枠 */}
        <rect x={1240} y={300} width={360} height={520} fill="#3A3226" stroke={KRP.ink} strokeWidth={9} />
        <rect x={1240} y={560} width={360} height={260} fill="#2A2419" />
        <rect x={1270} y={330} width={300} height={200} fill="none" stroke={C.wood2} strokeWidth={8} />
        <line x1={1420} y1={300} x2={1420} y2={820} stroke={C.wood2} strokeWidth={8} />
        {/* 中の明かりがもれる */}
        <rect x={1240} y={300} width={360} height={520} fill={C.lantern}
          opacity={0.1 + Math.sin(f / 9) * 0.03} />
        {/* 絵看板2枚 (文字なし) */}
        <g>
          <rect x={960} y={130} width={220} height={130} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 990 230 q 40 -70 80 -20 q 30 -44 80 -6" fill="none" stroke={C.kimono} strokeWidth={7} />
          <rect x={1660} y={130} width={220} height={130} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={1740} cy={195} r={38} fill={C.noren} opacity={0.75} />
          <circle cx={1812} cy={185} r={24} fill={C.kimono} opacity={0.75} />
        </g>
        {/* 提灯 (ゆれる) */}
        {[1210, 1630].map((x, i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 12 + i * 2) * 5} ${x} 280)`}>
            <line x1={x} y1={280} x2={x} y2={330} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={x} cy={392} rx={52} ry={62} fill={C.lantern} stroke={KRP.ink} strokeWidth={6} />
            <g stroke={KRP.ink} strokeWidth={3} opacity={0.55}>
              {Array.from({ length: 4 }, (_, k) => (
                <ellipse key={k} cx={x} cy={392} rx={52} ry={14 + k * 15} fill="none" />
              ))}
            </g>
          </g>
        ))}
      </g>
      {/* 幟 (左の通り沿い) */}
      <Nobori x={150} y={830} s={2.2} f={f} phase={1} color={C.kimono} />
      <Nobori x={330} y={840} s={1.9} f={f} phase={4} />
      {/* 番台と番人 (木戸銭の受け取り) */}
      <g>
        <rect x={1020} y={640} width={230} height={180} rx={8} fill={C.wood2} stroke={KRP.ink} strokeWidth={8} />
        <rect x={1000} y={620} width={270} height={30} rx={6} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={6} />
        {/* 銭箱 */}
        <rect x={1080} y={560} width={120} height={64} rx={6} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1080} y1={586} x2={1200} y2={586} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1124} y={572} width={32} height={8} rx={4} fill={KRP.ink} />
        {/* 番人 (うなずく) */}
        <g transform={`rotate(${nod} 1330 700)`}>
          <Person x={1330} y={742} s={1.35} cloth={C.noren} clothDark="#2A3E5E"
            face="smile" gaze={[-0.6, 0.3]} f={f} phase={6} still />
        </g>
      </g>
      {/* 客 (主役): 指を1本立てる */}
      <ellipse cx={560} cy={1010} rx={130} ry={26} fill={KRP.ink} opacity={0.2} />
      <Person x={560} y={1000} s={2.1} cloth="#6E8E5E" clothDark="#54724A"
        face="smile" pose="raise" gaze={[0.6, -0.2]} f={f} phase={0} />
      {/* 立てた指の強調輪 (挙げた手の先 = 指1本) */}
      <g transform={`translate(${560 + 2.1 * 67} ${1000 - 2.1 * 238})`}>
        <circle r={34 + Math.sin(f / 8) * 4} fill="none" stroke={KRP.yellow}
          strokeWidth={7} opacity={0.9 * seg(f, 6, 14)} />
      </g>
      <TagPlate x={690} y={190} text="一幕だけ" size={46} t={seg(f, 10, 20)} rot={-3} />
      {/* 銭 (1枚が弧を描いて銭箱へ) */}
      <g opacity={coinT > 0 && coinT < 1 ? 1 : 0}>
        <g transform={`translate(${cx} ${cy}) rotate(${f * 14})`}>
          <circle r={26} fill={KRP.copper} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-8} y={-8} width={16} height={16} fill={KRP.paper} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        <path d="M 640 560 Q 900 360 1150 560" fill="none" stroke={KRP.copper}
          strokeWidth={5} strokeDasharray="4 16" opacity={0.6} />
      </g>
      {/* 銭箱に入った合図 (コインが届いた後) */}
      <g transform={`translate(1140 540) scale(${pop(seg(f, 30, 38))})`}>
        <g stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
          <line x1={-24} y1={-12} x2={-38} y2={-30} />
          <line x1={0} y1={-18} x2={0} y2={-42} />
          <line x1={24} y1={-12} x2={38} y2={-30} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #44 一日のうち、好きな場面だけをつまむ。江戸のお客は、自由でした。
// 格: 山 / seed 1043
// 絵: 章結び。朝・昼・夕の小屋を横長に並べた絵巻。客が入り、食べ、出て、また入る。自由の見取り図
// どこ: 藍の敷き布の上に広げた一巻の絵巻。中に朝・昼・夕の小屋が3景並ぶ
// 演出: 1章の結び=「一日を自由につまむ」見取り図。入る・食べる・出る・また入る
// 動き: 絵巻が f で開く・豆人が通りを歩く・空の色が3景で変わる・金雲が流れる
const Sg044: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 2, 26));         // 巻物が開く
  const half = 830 * open;                     // 中心から左右へ
  const skies = [C.asa, C.hiru, C.yuyake];     // 朝・昼・夕
  const labels = ["朝", "昼", "夕"];
  const px = (k: number) => 960 + (k - 1) * 553; // 3景の中心x
  return (
    <Frame f={f} seed={1043}>
      {/* 藍の敷き布 (結びの格調) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.aoz} />
      <g fill={KRP.white} opacity={0.14}>
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={rnd(80, i) * W} cy={rnd(80, i + 50) * H}
            r={3 + rnd(80, i + 90) * 4} />
        ))}
      </g>
      <g stroke="#49596E" strokeWidth={4} opacity={0.5}>
        <line x1={-20} y1={120} x2={W + 20} y2={108} />
        <line x1={-20} y1={990} x2={W + 20} y2={1002} />
      </g>
      {/* 絵巻の紙 (中心から開く) */}
      <g>
        <rect x={960 - half} y={300} width={half * 2} height={520}
          fill={SGP.paper} stroke={KRP.ink} strokeWidth={9} />
        <defs><clipPath id="sg44emaki"><rect x={960 - half} y={300} width={half * 2} height={520} /></clipPath></defs>
        <g clipPath="url(#sg44emaki)">
          {/* 3景: 空の色だけ変えて同じ小屋を並べる (同じ一日の同じ小屋) */}
          {Array.from({ length: 3 }, (_, k) => (
            <g key={k}>
              <rect x={130 + k * 553.3} y={300} width={554} height={520} fill={skies[k]} />
              <rect x={130 + k * 553.3} y={690} width={554} height={130} fill="#C9BB8E" />
              {/* 夕景だけ夕陽 */}
              {k === 2 && <circle cx={px(k) - 200} cy={430} r={54} fill="#E07840" opacity={0.85} />}
              {k === 0 && <circle cx={px(k) - 190} cy={400} r={44} fill="#F6E7A8" opacity={0.9} />}
              <Koya x={px(k)} y={690} s={1.05} f={f + k * 7} />
              <Nobori x={px(k) - 220} y={700} s={1.15} f={f} phase={k * 3} color={k === 1 ? C.kimono : C.noren} />
              {/* 豆人の流れ: 朝=入る / 昼=茶屋で食べる / 夕=出て、また入る */}
              {k === 0 && (
                <g>
                  <PersonMini x={px(k) - 120 + (f % 42) * 2.4} y={790} s={0.5}
                    color="#6E8E5E" f={f} phase={1} face="smile" />
                  <PersonMini x={px(k) - 40 + (f % 42) * 2.0} y={800} s={0.46}
                    color="#B06A4C" f={f} phase={5} face="dot" />
                </g>
              )}
              {k === 1 && (
                <g>
                  {/* 小屋の脇の茶屋の縁台で膳 */}
                  <rect x={px(k) + 110} y={762} width={190} height={16} rx={6}
                    fill={C.wood2} stroke={KRP.ink} strokeWidth={5} />
                  <rect x={px(k) + 126} y={778} width={14} height={30} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={3.5} />
                  <rect x={px(k) + 268} y={778} width={14} height={30} fill={C.wood2Dark} stroke={KRP.ink} strokeWidth={3.5} />
                  <PersonMini x={px(k) + 160} y={800} s={0.5} color="#8E5B7A" f={f} phase={8} face="smile" />
                  <Zen x={px(k) + 240} y={762} s={0.52} f={f} />
                </g>
              )}
              {k === 2 && (
                <g>
                  <PersonMini x={px(k) + 150 - (f % 42) * 1.6} y={790} s={0.5}
                    color="#607086" f={f} phase={11} face="smile" />
                  {/* また入る人 (入口へ向き直る矢印) */}
                  <PersonMini x={px(k) - 150 + (f % 42) * 1.3} y={804} s={0.46}
                    color="#C2985C" f={f} phase={13} face="dot" arms="up" />
                  <path d={`M ${px(k) + 120} 730 q -60 -50 -150 -20`} fill="none"
                    stroke={KRP.green} strokeWidth={7} strokeDasharray="14 12"
                    strokeDashoffset={-f * 2} opacity={0.9} />
                </g>
              )}
              {/* 景の間の金の雲 (絵巻の決まりごと) */}
              <path d={`M ${px(k) - 356} ${330 + Math.sin(f / 20 + k) * 8}
                        q 60 -26 130 -6 q 70 18 120 -8 l 0 44 q -80 24 -150 8 q -60 -14 -100 6 z`}
                fill="#D9C06A" stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
            </g>
          ))}
          {/* 下辺の金雲 (巻物の帯) */}
          <path d={`M 130 800 q 140 -30 300 -8 q 180 24 360 -6 q 200 -30 420 0 q 180 24 440 -10 l 0 60 l -1520 0 z`}
            fill="#D9C06A" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
          {/* 朝・昼・夕の札 (絵巻の中、上辺) */}
          {labels.map((tx, k) => (
            <TagPlate key={k} x={px(k) + 150} y={352} text={tx} size={44}
              t={seg(f, 24 + k * 4, 32 + k * 4)} />
          ))}
        </g>
        {/* 軸木 (左右の端。開くのに合わせて外へ) */}
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${960 + d * (half + 26)} 560)`}>
            <rect x={-26} y={-290} width={52} height={580} rx={18}
              fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={7} />
            <circle cx={0} cy={-300} r={20} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={300} r={20} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
          </g>
        ))}
      </g>
      {/* 絵巻を押さえる文鎮 (手前) */}
      <ellipse cx={330} cy={838} rx={70} ry={20} fill="#3A3732" stroke={KRP.ink} strokeWidth={6} opacity={open} />
      <ellipse cx={1590} cy={838} rx={70} ry={20} fill="#3A3732" stroke={KRP.ink} strokeWidth={6} opacity={open} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_038: (f) => <Sg038 f={f} />,
  sg_039: (f) => <Sg039 f={f} />,
  sg_040: (f) => <Sg040 f={f} />,
  sg_041: (f) => <Sg041 f={f} />,
  sg_042: (f) => <Sg042 f={f} />,
  sg_043: (f) => <Sg043 f={f} />,
  sg_044: (f) => <Sg044 f={f} />,
};

export const S_B1B_MOTIFS: string[] = [
  "sg_038", // #38
  "sg_039", // #39
  "sg_040", // #40
  "sg_041", // #41
  "sg_042", // #42
  "sg_043", // #43
  "sg_044", // #44
];

export const saigoB1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
