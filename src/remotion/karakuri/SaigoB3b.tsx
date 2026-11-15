// 「人類は、昔から飛ばして観ていた」: 文#77〜#86 (10文)
// 台本: docs/saigomade-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/saigomade-design-2.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は sg_文番号3桁。WobbleDefs の seed はこのファイルでは 1112〜1121。
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
  // #77 社交の場と美術館
  salonWall: "#E9D9B6",
  salonStripe: "#CBA86C",
  salonFloor: "#C89B62",
  museumWall: "#D8DCD6",
  museumFloor: "#C5CBC6",
  brassDark: "#B8923A",
  // #78 展示ホール
  hallWall: "#E4D6B4",
  tileA: "#D9CDAA",
  velvet: "#8E3B4E",
  glass: "#D7E9F2",
  // #79 パリの地図
  desk: "#A87E50",
  orangePale: "#E2A86A",
  // #81 夕暮れの掲示板
  dusk: "#4A5570",
  boardBack: "#6E5A42",
  // #82 バイロイトの丘
  sky82: "#B8D6EC",
  hillDark: "#69A862",
  brick: "#C07B5E",
  brickLight: "#CE937A",
  windowDark: "#5A4A3E",
  horse: "#7A5A40",
  // #83 駅
  sky83: "#C4DCEA",
  // #84 書斎
  studyWall: "#DCCEB0",
  blueprint: "#3E5E8E",
  wagCoat: "#4E3F5E",
  // #85/#86 暗い場内
  dim85: "#454C5F",
  coat: "#3A4059",
  beret: "#243052",
  darkVeil: "#1C2330",
  seatMute1: "#5E6678",
  seatMute2: "#6B5E6E",
  seatMute3: "#596577",
  // 演者の扮装
  hatInk: "#2E2A33",     // #80 山高帽
  toga: "#EFE6D2",       // #86 神話劇の長衣
  togaShade: "#D6C9AC",  // #86 長衣のひだの影
  bronze: "#B08A3E",     // #86 兜・槍・盾の青銅
};
void C; void W; void H; void FONT; void useCurrentFrame;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Danmen; void Tehaisho; void SaiseiBar; void NenpyoEmaki; void Fuda3;
void SGP; void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけのヘルパー・ローカル部品
// ===================================================================
const rnd = (seed: number, i: number) => {
  const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 浮き沈みする音符 (おしゃべり・歌の印)
const SgNote: React.FC<{ x: number; y: number; f: number; i: number; s?: number; o?: number }> =
  ({ x, y, f, i, s = 1, o = 1 }) => (
    <g transform={`translate(${x} ${y + Math.sin(f / 8 + i * 1.3) * 6}) scale(${s})`} opacity={o}>
      <ellipse cx={0} cy={0} rx={8} ry={6} fill={KRP.ink} transform="rotate(-18)" />
      <path d="M 7 -2 L 7 -28 Q 15 -26 19 -19" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
    </g>
  );

// 壁付けのガス灯 (笠つきの球形ガラス + 炎)。flameT: 1=点灯 0=消灯
const SgGasLamp: React.FC<{ x: number; y: number; f: number; i: number; s?: number; flameT?: number }> =
  ({ x, y, f, i, s = 1, flameT = 1 }) => {
    const fl = Math.sin(f / 5 + i * 1.7) * 2;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {flameT > 0.02 && (
          <>
            <circle cx={0} cy={0} r={86} fill={SGP.lampGold} opacity={0.22 * flameT} />
            <circle cx={0} cy={0} r={52} fill={SGP.lampGold} opacity={0.34 * flameT} />
          </>
        )}
        {/* 腕金具 (壁から) */}
        <path d="M 64 36 Q 36 44 10 34" fill="none" stroke={KRP.brass} strokeWidth={10} />
        <path d="M 64 36 Q 36 44 10 34" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        {/* ガラス球 */}
        <circle cx={0} cy={0} r={34} fill={C.glass} opacity={0.4} />
        <circle cx={0} cy={0} r={34} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <path d="M -20 -18 A 26 26 0 0 1 -6 -28" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.8} />
        {/* 口金 */}
        <rect x={-12} y={28} width={24} height={12} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 炎 (flameT で縮む) */}
        {flameT > 0.02 ? (
          <path
            d={`M 0 ${16 + fl * flameT} C ${-8 * flameT} ${8 + fl} ${-6 * flameT} -8 0 -14 C ${6 * flameT} -8 ${8 * flameT} ${8 + fl} 0 ${16 + fl * flameT}`}
            fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3} opacity={Math.min(flameT * 2, 1)}
            transform={`scale(${0.4 + 0.6 * flameT})`} />
        ) : (
          <line x1={-8} y1={8} x2={8} y2={-8} stroke={SGP.lampOff} strokeWidth={4} />
        )}
      </g>
    );
  };

// ふわっとした雲 (ひとかたまり)
const SgCloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}
    fill={KRP.white} stroke={KRP.ink} strokeWidth={4}>
    <ellipse cx={0} cy={0} rx={70} ry={30} />
    <ellipse cx={-48} cy={10} rx={40} ry={20} />
    <ellipse cx={52} cy={8} rx={44} ry={22} />
  </g>
);

// 馬車 (馬1頭+箱馬車)。s で遠近。f で車輪が回る
const SgCarriage: React.FC<{ x: number; y: number; f: number; s?: number; phase?: number }> =
  ({ x, y, f, s = 1, phase = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 馬 */}
      <g fill={C.horse} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round">
        <ellipse cx={128} cy={-52} rx={56} ry={30} />
        <path d="M 168 -66 Q 192 -92 196 -116 L 216 -112 Q 216 -84 196 -62 Z" />
        <ellipse cx={210} cy={-116} rx={20} ry={13} transform="rotate(-18 210 -116)" />
        <path d="M 196 -130 L 190 -144 M 206 -132 L 204 -146" strokeWidth={4} fill="none" />
        {[92, 116, 144, 164].map((lx, i) => (
          <line key={lx} x1={lx} y1={-30} x2={lx + Math.sin(f / 7 + i + phase) * 3} y2={0}
            stroke={KRP.ink} strokeWidth={6} />
        ))}
        <path d="M 76 -58 Q 58 -40 62 -16" fill="none" strokeWidth={5} />
      </g>
      {/* 引き具 */}
      <line x1={-18} y1={-58} x2={86} y2={-56} stroke={KRP.ink} strokeWidth={4} />
      {/* 箱馬車 */}
      <rect x={-118} y={-116} width={128} height={86} rx={10}
        fill={C.coat} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-96} y={-100} width={42} height={34} rx={5} fill={C.glass} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-124} y={-132} width={140} height={18} rx={8} fill={KRP.ink} />
      {/* 車輪2つ (スポーク回転) */}
      {[-88, -16].map((wx) => (
        <g key={wx} transform={`translate(${wx} 0)`}>
          <circle r={30} fill="none" stroke={KRP.ink} strokeWidth={7} />
          <g transform={`rotate(${(f * 4 + phase * 40) % 360})`} stroke={KRP.ink} strokeWidth={4}>
            <line x1={-26} y1={0} x2={26} y2={0} />
            <line x1={0} y1={-26} x2={0} y2={26} />
          </g>
          <circle r={6} fill={KRP.ink} />
        </g>
      ))}
    </g>
  );

// ===================================================================
// 演者の扮装キット (舞台の上の人を「演者」に見せるための重ね着)
// ★Person とまったく同じ変換をかけた入れ物。中は「頭の丸 (cx=0 cy=-228 r=64)」基準の
//   人物ローカル座標。f/phase/still/lean は人物と同じ値を渡すこと (座標のごまかし禁止)
// -------------------------------------------------------------------
const AtamaNo: React.FC<{
  x: number; y: number; s?: number; lean?: number;
  f?: number; phase?: number; still?: boolean; children?: React.ReactNode;
}> = ({ x, y, s = 1, lean = 0, f = 0, phase = 0, still = false, children }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

// PersonMini とまったく同じ変換の入れ物 (暗い客席のリムライト用)
const MiniNo: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number; children?: React.ReactNode;
}> = ({ x, y, s = 1, f = 0, phase = 0, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s})`}>{children}</g>;
};

// pose="banzai" の手首の位置 (人物ローカル座標)。
// Person の armRect は肩 (sd*67, -148) を軸に rot 回転した長さ82の腕。
// SVG の rotate(a) は (0,82) を (-82 sin a, 82 cos a) に写すので手首はこうなる。
// banzai の rot は 左 = 135+sway / 右 = -135-sway (armSway は人物と同じ式)
const banzaiHand = (sd: 1 | -1, sway: number) => {
  const a = ((sd === -1 ? 135 + sway : -135 - sway) * Math.PI) / 180;
  return { x: sd * 67 - 82 * Math.sin(a), y: -148 + 82 * Math.cos(a) };
};

// 大衆劇場の演者 (#80)。水玉の上着・縞ズボン・蝶ネクタイ・山高帽・ステッキ。
// pose="banzai" (両腕を上げる) の人物に重ねる
const TaishuIsho: React.FC<{ f: number; phase?: number }> = ({ f, phase = 0 }) => {
  const sway = Math.sin((f + phase * 17) / 9) * 3; // banzai の腕ゆれと同じ式
  const hr = banzaiHand(1, sway);
  const hl = banzaiHand(-1, sway);
  return (
    <g>
      {/* 縞ズボン (太い白縞) */}
      {[-24, -12, 12, 24].map((lx) => (
        <rect key={lx} x={lx - 3} y={-56} width={7} height={48} fill={KRP.white} opacity={0.9} />
      ))}
      {/* 水玉の上着 (胴の上に重ねる) */}
      <rect x={-58} y={-160} width={116} height={108} rx={16}
        fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={`dot${i}`} cx={-32 + (i % 3) * 32} cy={-140 + Math.floor(i / 3) * 30} r={9}
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
      ))}
      {/* 白い襟 */}
      <path d="M -30 -162 L 0 -140 L 30 -162 L 16 -166 L 0 -152 L -16 -166 Z"
        fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      {/* 蝶ネクタイ */}
      <g transform={`translate(0 -158) rotate(${sway * 1.6})`}>
        <path d="M -34 -14 L -6 0 L -34 14 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 34 -14 L 6 0 L 34 14 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <rect x={-8} y={-9} width={16} height={18} rx={5} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* ステッキ (右手に。握りはくるり)。手袋より先に描いて、手が柄を握って見えるようにする */}
      <g transform={`translate(${hr.x} ${hr.y}) rotate(${26 + sway})`}>
        <line x1={0} y1={22} x2={0} y2={-118} stroke={SGP.woodDark} strokeWidth={9} strokeLinecap="round" />
        <path d="M 0 -118 q 26 -4 24 22" fill="none" stroke={C.brassDark} strokeWidth={10} strokeLinecap="round" />
      </g>
      {/* 白い手袋 (上げた両手) */}
      <circle cx={hl.x} cy={hl.y} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={hr.x} cy={hr.y} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 柄を握る指 (手袋の上に。ステッキの傾きに合わせる) */}
      <g transform={`translate(${hr.x} ${hr.y}) rotate(${26 + sway})`}>
        <path d="M -9 -5 L 9 -5 M -9 4 L 9 4" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" />
      </g>
      {/* 山高帽 (つばは広く 山は低く) */}
      <ellipse cx={0} cy={-258} rx={92} ry={15} fill={C.hatInk} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -54 -258 Q -58 -298 0 -300 Q 58 -298 54 -258 Z"
        fill={C.hatInk} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -54 -266 Q 0 -256 54 -266" fill="none" stroke={KRP.red} strokeWidth={7} />
      <path d="M -36 -288 q 18 -8 34 -6" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.45} />
    </g>
  );
};

// 神話劇の扮装 (#86)。トーガ風の白い長衣・青銅の兜・槍・丸い盾。
// pose="banzai" の人物に重ねる。実在人物の似顔ではなく「役の扮装」
const ShinwaIsho: React.FC<{ f: number; phase?: number }> = ({ f, phase = 0 }) => {
  const sway = Math.sin((f + phase * 17) / 9) * 3;
  const hr = banzaiHand(1, sway);
  const hl = banzaiHand(-1, sway);
  return (
    <g>
      {/* 長衣 (肩から足元まで。裾が広がる) */}
      <path d="M -62 -164 L 62 -164 L 74 -96 Q 92 -56 96 -18 L -96 -18 Q -92 -56 -74 -96 Z"
        fill={C.toga} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* ひだ */}
      <path d="M -52 -150 Q -46 -86 -56 -24 M -18 -146 Q -14 -84 -20 -24 M 18 -146 Q 22 -84 18 -24 M 52 -150 Q 58 -86 56 -24"
        fill="none" stroke={C.togaShade} strokeWidth={6} />
      <path d="M -88 -26 Q 0 -40 88 -26" fill="none" stroke={C.bronze} strokeWidth={6} />
      {/* 肩の留め金と腰の帯 */}
      <circle cx={-46} cy={-158} r={11} fill={C.bronze} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={46} cy={-158} r={11} fill={C.bronze} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-62} y={-100} width={124} height={20} rx={7} fill={C.bronze} stroke={KRP.ink} strokeWidth={5} />
      {/* 槍 (右手が柄を握る。穂先は上) */}
      <g>
        <line x1={128} y1={-56} x2={118} y2={-346} stroke={SGP.woodDark} strokeWidth={11} strokeLinecap="round" />
        <path d="M 118 -346 Q 134 -376 118 -402 Q 102 -376 118 -346 Z"
          fill={C.bronze} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={110} y={-352} width={17} height={12} rx={4} fill={C.bronze} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 丸い盾 (左腕に) */}
      <g transform={`translate(-132 -198) rotate(${sway * 0.6})`}>
        <circle r={46} fill={C.bronze} stroke={KRP.ink} strokeWidth={6} />
        <circle r={30} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        <circle r={11} fill={C.toga} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -30 -22 A 40 40 0 0 1 -8 -40" fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.6} />
      </g>
      {/* 手 */}
      <circle cx={hl.x} cy={hl.y} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={hr.x} cy={hr.y} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 青銅の兜 (鉢・頬当て・鶏冠の飾り) */}
      <path d="M -68 -242 Q -72 -306 0 -310 Q 72 -306 68 -242 Z"
        fill={C.bronze} stroke={KRP.ink} strokeWidth={5.5} strokeLinejoin="round" />
      <rect x={-76} y={-250} width={152} height={15} rx={7} fill={C.bronze} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -62 -236 L -62 -192 Q -50 -186 -44 -196 L -44 -238 Z"
        fill={C.bronze} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 62 -236 L 62 -192 Q 50 -186 44 -196 L 44 -238 Z"
        fill={C.bronze} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* 鶏冠 (前から後ろへ立つ飾り。f でそよぐ) */}
      <path d={`M -40 -296 Q 0 ${-352 - sway * 1.5} 40 -296 Q 0 -322 -40 -296 Z`}
        fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -34 -282 q 18 -10 36 -8" fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.45} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #77 音楽は社交の背景から、黙って拝聴する芸術へ、格上げされました。
// 格: 図 / seed 1112
// 絵: 「BGM」の札が壁から外され、金の額縁に入れられて美術館の壁へ掛け替えられる図
// どこ: 左=サロンの壁 (縞壁紙・燭台・おしゃべり) / 右=美術館の壁 (ピクチャーレール・金縁・ロープ)
// 演出: 「BGM」の木札が左の壁からふわりと外れ、弧を描いて右の金の額縁に収まる
// 動き: 札の飛行 (f4-30)・額のきらめき (f30-40)・音符の浮き沈み・燭台の炎
const Sg077: React.FC<{ f: number }> = ({ f }) => {
  const lift = seg(f, 4, 12);
  const t2 = easeOut(seg(f, 12, 30));
  const tx = lerp(470, 1430, t2);
  const ty = lerp(330, 428, t2) - Math.sin(t2 * Math.PI) * 210 - lift * 14;
  const rot = Math.sin(t2 * Math.PI) * 12;
  const glint = pop(seg(f, 30, 40));
  return (
    <Frame f={f} seed={1112}>
      {/* ===== 左: サロン ===== */}
      <rect x={-20} y={-20} width={975} height={1120} fill={C.salonWall} />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={30 + i * 118} y={-20} width={36} height={660} fill={C.salonStripe} opacity={0.22} />
      ))}
      <line x1={-20} y1={96} x2={952} y2={96} stroke={C.salonStripe} strokeWidth={8} opacity={0.6} />
      <rect x={-20} y={620} width={972} height={70} fill={C.salonStripe} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-20} y={690} width={972} height={410} fill={C.salonFloor} />
      {[760, 850, 950, 1040].map((fy) => (
        <line key={fy} x1={-20} y1={fy} x2={950} y2={fy} stroke={KRP.ink} strokeWidth={3} opacity={0.18} />
      ))}
      {/* 燭台 (天井から) */}
      <g>
        <line x1={470} y1={-10} x2={470} y2={56} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 380 100 Q 380 56 470 56 Q 560 56 560 100" fill="none" stroke={KRP.brass} strokeWidth={9} />
        <path d="M 380 100 Q 380 56 470 56 Q 560 56 560 100" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        {[380, 470, 560].map((cx, i) => (
          <g key={cx}>
            <rect x={cx - 7} y={i === 1 ? 46 : 90} width={14} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
            <ellipse cx={cx} cy={(i === 1 ? 36 : 80) + Math.sin(f / 6 + i) * 2} rx={6} ry={11}
              fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 釘と、札が外れた跡 */}
      <circle cx={470} cy={290} r={6} fill={KRP.ink} />
      {lift > 0 && lift < 1 && (
        <g stroke={KRP.grayDark} strokeWidth={3.5} opacity={(1 - lift) * 0.8} fill="none">
          <path d="M 420 320 L 404 306 M 520 320 L 536 306 M 470 350 L 470 370" />
        </g>
      )}
      {/* 丸テーブルとお茶 */}
      <g>
        <ellipse cx={262} cy={716} rx={128} ry={30} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={244} y={722} width={14} height={160} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={270} y={722} width={14} height={160} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <g transform="translate(222 690)">
          <path d="M -20 0 Q -24 -26 -8 -30 L 14 -30 Q 28 -26 24 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 24 -22 q 16 8 0 18" fill="none" stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 0 -36 q ${Math.sin(f / 10) * 6} -14 2 -26`} fill="none" stroke={KRP.grayDark} strokeWidth={3.5} opacity={0.6} />
        </g>
        <ellipse cx={318} cy={698} rx={26} ry={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* おしゃべりする2人 */}
      <PersonMini x={150} y={1012} s={1.05} color={C.brick} f={f} phase={1} face="smile" />
      <PersonMini x={398} y={1024} s={1.0} color={KRP.blueDeep} f={f} phase={4} face="smile" />
      <SgNote x={262} y={742} f={f} i={0} />
      <SgNote x={330} y={790} f={f} i={2} s={0.8} o={0.8} />
      {/* ===== 右: 美術館 ===== */}
      <rect x={952} y={-20} width={990} height={1120} fill={C.museumWall} />
      <line x1={952} y1={-20} x2={952} y2={1100} stroke={KRP.ink} strokeWidth={6} />
      <rect x={952} y={144} width={988} height={14} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={952} y={690} width={988} height={410} fill={C.museumFloor} />
      {[1100, 1400, 1700].map((fx) => (
        <line key={fx} x1={fx - 60} y1={690} x2={fx - 160} y2={1100} stroke={KRP.ink} strokeWidth={3} opacity={0.15} />
      ))}
      {/* 吊りワイヤー */}
      <circle cx={1430} cy={160} r={7} fill={KRP.ink} />
      <line x1={1430} y1={160} x2={1322} y2={312} stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
      <line x1={1430} y1={160} x2={1538} y2={312} stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
      {/* 金の額縁 */}
      <g>
        <rect x={1270} y={300} width={320} height={280} rx={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1296} y={326} width={268} height={228} rx={6} fill="none" stroke={C.brassDark} strokeWidth={8} />
        <rect x={1310} y={340} width={240} height={200} fill={C.museumWall} stroke={KRP.ink} strokeWidth={4.5} />
        {[[1270, 300], [1590, 300], [1270, 580], [1590, 580]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={14} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <path d="M 1398 300 Q 1430 280 1462 300" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 額の下の真鍮プレート */}
      <rect x={1352} y={606} width={156} height={44} rx={6} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
      <text x={1430} y={638} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={28} fill={C.ink}>芸術</text>
      {/* ビロードのロープ */}
      <g>
        {[1150, 1710].map((px) => (
          <g key={px}>
            <ellipse cx={px} cy={846} rx={40} ry={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={px - 7} y={716} width={14} height={126} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={px} cy={708} r={13} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ))}
        <path d={`M 1150 716 Q 1430 ${796 + Math.sin(f / 16) * 3} 1710 716`}
          fill="none" stroke={C.velvet} strokeWidth={12} />
        <path d={`M 1150 716 Q 1430 ${796 + Math.sin(f / 16) * 3} 1710 716`}
          fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      </g>
      {/* 鑑賞する人 */}
      <ellipse cx={1066} cy={1024} rx={78} ry={18} fill={KRP.ink} opacity={0.14} />
      <Person x={1066} y={1016} s={1.15} cloth="#5A6B5E" clothDark="#46544A"
        face="normal" gaze={[4, -5]} f={f} phase={2} />
      <PersonMini x={1820} y={1016} s={1.0} color={C.seatMute3} f={f} phase={6} />
      {/* 飛んでいく「BGM」の木札 (点線の軌跡つき) */}
      <path d="M 470 330 Q 950 120 1430 428" fill="none" stroke={KRP.grayDark}
        strokeWidth={4} strokeDasharray="4 16" opacity={0.35 * seg(f, 12, 30)} />
      <g transform={`translate(${tx} ${ty}) rotate(${rot})`}>
        <path d="M -24 -46 L 0 -72 L 24 -46" fill="none" stroke={SGP.woodDark} strokeWidth={5} />
        <rect x={-85} y={-45} width={170} height={90} rx={8}
          fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -70 -24 Q 0 -30 70 -22" fill="none" stroke={SGP.woodDark} strokeWidth={3} />
        <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={1.5}
          paintOrder="stroke" letterSpacing={3}>BGM</text>
      </g>
      {/* 収まった瞬間のきらめき */}
      {glint > 0 && (
        <g transform={`translate(1545 322) scale(${glint})`} fill={KRP.yellow}
          stroke={KRP.ink} strokeWidth={3}>
          <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" />
          <path d="M -46 24 L -42 34 L -32 38 L -42 42 L -46 52 L -50 42 L -60 38 L -50 34 Z" />
        </g>
      )}
      {/* ラベル */}
      <TagPlate x={230} y={210} text="社交の場" size={34} t={seg(f, 2, 10)} />
      <TagPlate x={1700} y={210} text="美術館" size={34} t={seg(f, 6, 14)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #78 つまり静けさは、自然に生まれたのではなく、マナーとして発明されたものでした。
// 格: 山 / seed 1113
// 絵: 「発明品」としての静けさ: ビロードの台座に「沈黙」のガラス鐘。特許証の但し書き「1830-50年頃 パリ」。見物人が感心して眺める
// どこ: 博覧会ふうの展示ホール。柱飾りの壁・菱形タイルの床・天井からの光の帯
// 演出: ビロードの台座に「沈黙」のガラス鐘が上から降りてくる。右に発明品の証書の画架
// 動き: ガラス鐘の降下 (f4-22)・鐘の中のきらめきの脈動・見物人の体ゆれと指差し
const Sg078: React.FC<{ f: number }> = ({ f }) => {
  const down = easeOut(seg(f, 4, 22));
  const bellY = lerp(-360, 0, down);
  const tw = 0.6 + 0.4 * Math.sin(f / 7);
  return (
    <Frame f={f} seed={1113}>
      {/* 壁と柱飾り */}
      <rect x={-20} y={-20} width={1960} height={680} fill={C.hallWall} />
      {[150, 670, 1230, 1770].map((px) => (
        <g key={px}>
          <rect x={px - 34} y={60} width={68} height={580} fill={KRP.white} opacity={0.5} />
          <rect x={px - 34} y={60} width={68} height={580} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
          <rect x={px - 46} y={44} width={92} height={24} fill={C.salonStripe} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
        </g>
      ))}
      {/* 上辺の飾り幕 (赤いスワッグ) */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${-20 + i * 490} 20 Q ${225 + i * 490} 150 ${470 + i * 490} 20 L ${470 + i * 490} -20 L ${-20 + i * 490} -20 Z`}
          fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
      ))}
      {[225, 715, 1205, 1695].map((tx) => (
        <circle key={tx} cx={tx} cy={118 + Math.sin(f / 11 + tx) * 2} r={13} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 床 (菱形タイル) */}
      <rect x={-20} y={640} width={1960} height={460} fill={C.tileA} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.2}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`a${i}`} x1={-200 + i * 220} y1={640} x2={200 + i * 220} y2={1100} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`b${i}`} x1={200 + i * 220} y1={640} x2={-200 + i * 220} y2={1100} />
        ))}
      </g>
      {/* 天井からの光の帯 */}
      <polygon points="960,-20 660,660 1260,660" fill={SGP.lampGold} opacity={0.12 + 0.03 * Math.sin(f / 9)} />
      {/* ===== 台座 ===== */}
      <g>
        <rect x={742} y={790} width={436} height={46} rx={8} fill={C.tileA} stroke={KRP.ink} strokeWidth={7} />
        <rect x={776} y={724} width={368} height={68} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
        {/* ビロードの掛け布 */}
        <path d="M 800 724 L 800 584 Q 800 566 820 566 L 1100 566 Q 1120 566 1120 584 L 1120 724 Z"
          fill={C.velvet} stroke={KRP.ink} strokeWidth={6.5} />
        <path d="M 836 580 Q 832 650 840 716 M 960 576 Q 956 650 962 716 M 1084 580 Q 1088 650 1080 716"
          fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
        {[820, 912, 1004, 1096].map((tx) => (
          <g key={tx}>
            <line x1={tx} y1={724} x2={tx} y2={744} stroke={KRP.yellow} strokeWidth={5} />
            <circle cx={tx} cy={750} r={8} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
        <rect x={788} y={546} width={344} height={24} rx={6} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        {/* 「沈黙」の銘板 */}
        <rect x={880} y={620} width={160} height={66} rx={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5.5} />
        <text x={960} y={668} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={44} fill={C.ink} letterSpacing={6}>沈黙</text>
      </g>
      {/* ===== ガラス鐘 (降りてくる。中身は見えない=沈黙) ===== */}
      <g transform={`translate(0 ${bellY})`}>
        <path d="M 824 546 C 824 332 1096 332 1096 546 Z"
          fill={C.glass} opacity={0.4} />
        <path d="M 824 546 C 824 332 1096 332 1096 546"
          fill="none" stroke={KRP.ink} strokeWidth={6.5} />
        <line x1={818} y1={546} x2={1102} y2={546} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 852 480 C 852 400 900 368 936 360" fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.85} />
        <circle cx={960} cy={344} r={16} fill={C.glass} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 中のきらめき (音のない空気) */}
        <g opacity={tw}>
          <path d="M 930 450 L 934 462 L 946 466 L 934 470 L 930 482 L 926 470 L 914 466 L 926 462 Z" fill={KRP.white} />
          <path d="M 1006 416 L 1009 425 L 1018 428 L 1009 431 L 1006 440 L 1003 431 L 994 428 L 1003 425 Z" fill={KRP.white} />
        </g>
      </g>
      {/* ===== 画架の特許証 ===== */}
      <g>
        <line x1={1452} y1={916} x2={1562} y2={474} stroke={SGP.woodDark} strokeWidth={10} />
        <line x1={1692} y1={916} x2={1582} y2={474} stroke={SGP.woodDark} strokeWidth={10} />
        <line x1={1572} y1={560} x2={1572} y2={880} stroke={SGP.woodDark} strokeWidth={8} />
        <line x1={1472} y1={836} x2={1672} y2={836} stroke={SGP.woodDark} strokeWidth={8} />
        <g transform={`rotate(${Math.sin(f / 13) * 0.6} 1572 690)`}>
          <rect x={1442} y={520} width={260} height={330} fill={SGP.paper} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1456} y={534} width={232} height={302} fill="none" stroke={C.brassDark} strokeWidth={4} />
          <rect x={1496} y={556} width={152} height={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <text x={1572} y={589} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={30} fill={C.ink}>発明品</text>
          {[632, 664, 696, 728].map((ly) => (
            <line key={ly} x1={1488} y1={ly} x2={1656} y2={ly} stroke={KRP.grayDark} strokeWidth={4} opacity={0.55} />
          ))}
          <text x={1572} y={786} textAnchor="middle" fontFamily={FONT} fontWeight={800}
            fontSize={26} fill={C.ink}>1830-50年頃 パリ</text>
          <circle cx={1486} cy={812} r={17} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1478 824 L 1470 848 M 1494 824 L 1500 848" stroke={KRP.red} strokeWidth={6} />
        </g>
      </g>
      {/* ===== 見物人 ===== */}
      <ellipse cx={480} cy={1006} rx={92} ry={20} fill={KRP.ink} opacity={0.14} />
      <Person x={480} y={998} s={1.3} cloth={KRP.blueDeep} clothDark="#2F5590"
        face="smile" pose="point" pointDir={1} gaze={[5, -4]} f={f} phase={1} />
      <ellipse cx={1310} cy={1018} rx={88} ry={20} fill={KRP.ink} opacity={0.14} />
      <Person x={1310} y={1010} s={1.25} cloth="#5A6B5E" clothDark="#46544A"
        face="surprised" gaze={[-5, -4]} f={f} phase={4} />
      <PersonMini x={636} y={700} s={0.62} color={C.brick} f={f} phase={2} />
      <PersonMini x={1196} y={692} s={0.58} color={C.seatMute1} f={f} phase={7} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #79 ただし、これはまだ、都会の、限られた世界の話です。
// 格: 並 / seed 1114
// 絵: パリの地図。静かな青はホールのある一角だけ。まわりはまだ賑やかな橙
// どこ: 机の上に広げたパリの古地図。角はピン留め、右端に虫めがねと燭台
// 演出: セーヌ川が斜めに流れ、橙の街区に音符。ホールの一角だけ青い静けさの輪
// 動き: 青い輪の波紋 (くり返し)・音符の浮き沈み・蝋燭の炎・青ゾーンの点灯 (f6-20)
const Sg079: React.FC<{ f: number }> = ({ f }) => {
  const riverY = (x: number) => 740 - (x - 230) * 0.32;
  const quiet = (x: number, y: number) => {
    const dx = x - 850, dy = y - 370;
    return dx * dx / (190 * 190) + dy * dy / (150 * 150) < 1;
  };
  const zt = easeOut(seg(f, 6, 20));
  const ring = (f % 44) / 44;
  const blocks = Array.from({ length: 64 }).map((_, i) => {
    const bx = 280 + rnd(1114, i) * 1340;
    const by = 210 + rnd(1114, i + 100) * 610;
    return { bx, by, w: 36 + rnd(1114, i + 200) * 46, h: 28 + rnd(1114, i + 300) * 34 };
  }).filter((b) => Math.abs(b.by - riverY(b.bx)) > 72 && b.bx < 1620 && b.by < 850);
  return (
    <Frame f={f} seed={1114}>
      {/* 机 */}
      <rect x={-20} y={-20} width={1960} height={1120} fill={C.desk} />
      {[130, 420, 710, 1000].map((py) => (
        <path key={py} d={`M -20 ${py} Q 960 ${py + 14} 1940 ${py}`} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.2} />
      ))}
      {/* 地図の紙 */}
      <rect x={210} y={130} width={1500} height={770} fill={SGP.paper} stroke={KRP.ink} strokeWidth={7} />
      <rect x={236} y={156} width={1448} height={718} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      <path d="M 1710 820 Q 1660 846 1668 900 L 1710 900 Z" fill={SGP.paperOld} stroke={KRP.ink} strokeWidth={5} />
      {[[232, 152], [1688, 152], [232, 878]].map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={px - 3} cy={py - 3} r={3} fill={KRP.white} />
        </g>
      ))}
      {/* セーヌ川 */}
      <path d="M 230 768 C 620 680 1040 520 1690 282" fill="none" stroke={KRP.blue} strokeWidth={46} opacity={0.9} />
      <path d="M 230 768 C 620 680 1040 520 1690 282" fill="none" stroke={KRP.blueDeep} strokeWidth={4} opacity={0.5} />
      <ellipse cx={1000} cy={530} rx={64} ry={22} fill={SGP.paper} stroke={KRP.blueDeep} strokeWidth={4} transform="rotate(-16 1000 530)" />
      {/* 街区 (橙=賑やか / 青ゾーン内=静か) */}
      {blocks.map((b, i) => (
        <rect key={i} x={b.bx - b.w / 2} y={b.by - b.h / 2} width={b.w} height={b.h} rx={4}
          fill={quiet(b.bx, b.by) ? KRP.blueSoft : (i % 2 ? KRP.orange : C.orangePale)}
          opacity={quiet(b.bx, b.by) ? 0.55 + zt * 0.4 : 0.8}
          stroke={KRP.ink} strokeWidth={3} />
      ))}
      {/* 賑やかの音符 */}
      {[[420, 300], [560, 560], [1240, 700], [1460, 480], [1300, 240]].map(([nx, ny], i) => (
        <SgNote key={i} x={nx} y={ny} f={f} i={i} s={0.85} o={0.85} />
      ))}
      {/* 静けさの青い一角 */}
      <g opacity={zt}>
        <ellipse cx={850} cy={370} rx={190} ry={150} fill={SGP.aoshizuka} opacity={0.34} />
        <ellipse cx={850} cy={370} rx={190} ry={150} fill="none" stroke={KRP.blueDeep} strokeWidth={6} />
        <ellipse cx={850} cy={370} rx={150 + ring * 90} ry={118 + ring * 72}
          fill="none" stroke={KRP.blueDeep} strokeWidth={4} opacity={(1 - ring) * 0.7} />
        {/* ホールの絵 (柱とペディメント) */}
        {/* ホール (白抜きだと地図の抜けに見えるので、石の壁・スレートの屋根・扉まで塗る) */}
        <g transform="translate(850 356)">
          <rect x={-72} y={32} width={144} height={12} fill="#9C8C6C" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-64} y={-26} width={128} height={62} fill="#E0D2B2" stroke={KRP.ink} strokeWidth={5} />
          {[-42, -14, 14, 42].map((cx) => (
            <rect key={cx} x={cx - 7} y={-22} width={14} height={56} rx={4}
              fill="#F0E6CE" stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={-10} y={2} width={20} height={34} rx={3} fill="#5A4632" stroke={KRP.ink} strokeWidth={3.5} />
          <polygon points="-76,-26 0,-70 76,-26" fill="#5E6E7A" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-38} r={9} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        <TagPlate x={850} y={476} text="ホール" size={28} t={zt} />
      </g>
      {/* 凡例 */}
      <g transform="translate(300 788)">
        <rect x={0} y={0} width={34} height={34} rx={6} fill={SGP.aoshizuka} stroke={KRP.ink} strokeWidth={4} />
        <text x={48} y={28} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.ink}>静か</text>
        <rect x={190} y={0} width={34} height={34} rx={6} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
        <text x={238} y={28} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.ink}>賑やか</text>
      </g>
      <TagPlate x={340} y={218} text="パリ" size={38} t={seg(f, 2, 10)} />
      {/* 方位 (星形) */}
      <g transform="translate(1580 240)" fill={KRP.white} stroke={KRP.ink} strokeWidth={4}>
        <circle r={38} />
        <polygon points="0,-30 8,0 0,30 -8,0" fill={KRP.red} />
        <polygon points="-30,0 0,-8 30,0 0,8" />
      </g>
      {/* 虫めがねと燭台 (机の上・紙の外) */}
      <g transform={`translate(1800 ${560 + Math.sin(f / 18) * 3})`}>
        <circle r={62} fill={C.glass} opacity={0.5} />
        <circle r={62} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <line x1={44} y1={44} x2={104} y2={110} stroke={SGP.woodDark} strokeWidth={16} strokeLinecap="round" />
      </g>
      <g transform="translate(90 560)">
        <ellipse cx={0} cy={56} rx={52} ry={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-12} y={-50} width={24} height={100} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-66 + Math.sin(f / 6) * 2} rx={9} ry={17} fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #80 同じころの大衆劇場は、あいかわらず賑やかなまま。
// 格: 並 / seed 1115
// 絵: 大衆劇場の場内。飲んで歌って笑って。1巻の空気がまだここにある
// どこ: 大衆劇場の場内。奥に小さな舞台と描き割り、手前へベンチ3列の満員の客
// 演出: 提灯の灯の下で飲む・歌う・笑う。1巻の賑わいの空気をそのまま残す
// 動き: 役者の見得の揺れ・客の体ゆれと挙げた腕・音符の浮き沈み・提灯の明滅
const Sg080: React.FC<{ f: number }> = ({ f }) => {
  const rows: { y: number; s: number; xs: number[]; ph: number }[] = [
    { y: 668, s: 0.8, xs: [210, 470, 730, 1180, 1440, 1700], ph: 0 },
    { y: 828, s: 0.95, xs: [330, 620, 960, 1300, 1590], ph: 3 },
    { y: 995, s: 1.1, xs: [180, 480, 780, 1130, 1430, 1730], ph: 6 },
  ];
  const warm = [C.brick, KRP.blueDeep, "#5A6B5E", C.velvet, KRP.orange, "#8A6B9E"];
  return (
    <Frame f={f} seed={1115}>
      {/* 壁 (板張り) */}
      <rect x={-20} y={-20} width={1960} height={1120} fill={SGP.wood} />
      {[180, 420, 660, 900, 1140, 1380, 1620, 1860].map((px) => (
        <line key={px} x1={px} y1={-20} x2={px} y2={440} stroke={SGP.woodDark} strokeWidth={4} opacity={0.5} />
      ))}
      {/* 舞台 (奥) */}
      <g>
        <rect x={470} y={60} width={980} height={266} fill={KRP.paperCool} stroke={KRP.ink} strokeWidth={7} />
        {/* 描き割り: 山と太陽 */}
        <path d="M 470 326 L 700 170 L 900 326 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 820 326 L 1080 140 L 1340 326 Z" fill={C.hillDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1320} cy={140} r={44} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        {/* 袖幕 */}
        <path d="M 470 60 L 560 60 Q 574 200 552 326 L 470 326 Z" fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1450 60 L 1360 60 Q 1346 200 1368 326 L 1450 326 Z" fill={SGP.curtain} stroke={KRP.ink} strokeWidth={5} />
        {/* 舞台の床と前板 */}
        <rect x={440} y={326} width={1040} height={28} fill={SGP.stage} stroke={KRP.ink} strokeWidth={6} />
        <rect x={440} y={354} width={1040} height={54} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 役者 (大衆劇場の演者。水玉と縞の派手な扮装・山高帽・蝶ネクタイ・ステッキ) */}
        <g transform={`rotate(${Math.sin(f / 9) * 2} 960 326)`}>
          <Person x={960} y={326} s={0.92} cloth={KRP.red} clothDark="#A33224"
            face="joy" pose="banzai" f={f} phase={2} />
          <AtamaNo x={960} y={326} s={0.92} f={f} phase={2}>
            <TaishuIsho f={f} phase={2} />
          </AtamaNo>
        </g>
        <SgNote x={1060} y={160} f={f} i={1} />
        <SgNote x={880} y={120} f={f} i={4} s={0.8} />
        {/* ガス灯のフットライト (舞台の前縁に並ぶ) */}
        {[540, 660, 780, 900, 1020, 1140, 1260, 1380].map((fx, i) => (
          <g key={`fl${fx}`}>
            <polygon points={`${fx - 13},322 ${fx + 13},322 ${fx + 56},136 ${fx - 56},136`}
              fill={SGP.lampGold} opacity={0.06 + 0.022 * Math.sin(f / 6 + i * 1.3)} />
            <path d={`M ${fx - 15} 326 A 15 15 0 0 1 ${fx + 15} 326 Z`}
              fill={C.brassDark} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={fx} cy={314 + Math.sin(f / 5 + i * 1.7) * 1.6} r={7}
              fill={SGP.lampGold} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 提灯の列 */}
      {[260, 720, 1180, 1640].map((lx, i) => (
        <g key={lx}>
          <line x1={lx} y1={-10} x2={lx} y2={44} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={lx} cy={100} r={64} fill={SGP.lampGold} opacity={0.25 + 0.08 * Math.sin(f / 6 + i * 2)} />
          <ellipse cx={lx} cy={92} rx={36} ry={48} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${lx - 34} 76 Q ${lx} 68 ${lx + 34} 76 M ${lx - 36} 96 Q ${lx} 90 ${lx + 36} 96 M ${lx - 32} 116 Q ${lx} 112 ${lx + 32} 116`}
            fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          <rect x={lx - 14} y={38} width={28} height={10} fill={KRP.ink} />
        </g>
      ))}
      {/* 床 */}
      <rect x={-20} y={408} width={1960} height={700} fill={KRP.floor} />
      {/* 客席: 奥から 客→ベンチ の順に重ねる */}
      {rows.map((row, ri) => (
        <g key={ri}>
          {row.xs.map((px, i) => {
            const up = rnd(1115, ri * 10 + i) < 0.4;
            return (
              <g key={px}>
                <PersonMini x={px} y={row.y + 26} s={row.s} color={warm[(ri + i) % warm.length]}
                  f={f} phase={row.ph + i * 2} face={rnd(1115, ri * 20 + i) < 0.7 ? "smile" : "dot"}
                  arms={up ? "up" : "down"} />
                {up && (
                  <g transform={`translate(${px + 52 * row.s} ${row.y + 26 - 182 * row.s + Math.sin((f + (row.ph + i * 2) * 19) / 7) * 10}) rotate(14)`}>
                    <path d={`M ${-11 * row.s} 0 L ${-8 * row.s} ${26 * row.s} L ${8 * row.s} ${26 * row.s} L ${11 * row.s} 0 Z`}
                      fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                  </g>
                )}
              </g>
            );
          })}
          {/* ベンチ板 (客の足元を隠す) */}
          <rect x={60} y={row.y} width={1800} height={26 * row.s} rx={8}
            fill={SGP.wood} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={90} y1={row.y + 8 * row.s} x2={1830} y2={row.y + 8 * row.s}
            stroke={KRP.white} strokeWidth={3} opacity={0.4} />
        </g>
      ))}
      {/* ベンチの上の徳利と弁当 */}
      <g transform="translate(940 668)">
        <path d="M -12 0 L -12 -18 Q -20 -30 -9 -40 L 9 -40 Q 20 -30 12 -18 L 12 0 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <g transform="translate(1180 828)">
        <rect x={-30} y={-26} width={60} height={26} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={-30} y1={-16} x2={30} y2={-16} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 場内に漂う音符 */}
      <SgNote x={300} y={500} f={f} i={2} />
      <SgNote x={700} y={540} f={f} i={5} s={0.85} />
      <SgNote x={1520} y={520} f={f} i={3} />
      <SgNote x={1720} y={620} f={f} i={7} s={0.8} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #81 この静けさを決定的にした犯人が、次に登場します。
// 格: 山 / seed 1116
// 絵: 章結び。掲示板で手配書①「静けさ」に「御用」の朱印。隣の手配書② (ベレー帽の男) にランプの光が当たる
// どこ: 夕暮れの往来。屋根つきの掲示板 (高札場ふう)・石畳・三日月と星
// 演出: 手配書①「静けさ」に御用の朱印。隣の手配書② (ベレー帽) に提灯の光が当たる
// 動き: 御用印 (f8-18)・提灯のスイング・②への光の点灯 (f24-40)・見物人の指差し
const Sg081: React.FC<{ f: number }> = ({ f }) => {
  const lT = seg(f, 24, 40);
  const swing = Math.sin(f / 9) * 5;
  return (
    <Frame f={f} seed={1116} bg={C.dusk} dark>
      {/* 空: 星と三日月 */}
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={rnd(1116, i) * 1920} cy={rnd(1116, i + 40) * 300}
          r={2 + rnd(1116, i + 80) * 2.4} fill={KRP.white}
          opacity={0.4 + 0.5 * Math.sin(f / 11 + i * 2)} />
      ))}
      <g transform="translate(1720 130)">
        <circle r={46} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-22} cy={-10} r={40} fill={C.dusk} />
      </g>
      {/* 遠景の家並み */}
      {[60, 300, 1560, 1790].map((hx, i) => (
        <g key={hx}>
          <rect x={hx} y={560 - (i % 2) * 40} width={180} height={320} fill={C.coat} stroke={KRP.ink} strokeWidth={5} />
          <polygon points={`${hx - 16},${560 - (i % 2) * 40} ${hx + 90},${480 - (i % 2) * 40} ${hx + 196},${560 - (i % 2) * 40}`}
            fill={KRP.ink} stroke={KRP.ink} strokeWidth={5} />
          <rect x={hx + 58} y={620 - (i % 2) * 40} width={56} height={66}
            fill={SGP.lampGold} opacity={0.65 + 0.1 * Math.sin(f / 8 + i)} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 地面と石畳 */}
      <rect x={-20} y={860} width={1960} height={240} fill="#3C4458" />
      <g stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.3}>
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={i} d={`M ${(i % 8) * 250 - 60 + (i > 7 ? 120 : 0)} ${900 + Math.floor(i / 8) * 70} a 55 20 0 0 1 110 0`} />
        ))}
      </g>
      {/* ===== 高札場 ===== */}
      <g>
        <rect x={590} y={240} width={34} height={660} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1296} y={240} width={34} height={660} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 500 244 L 960 158 L 1420 244 L 1372 244 L 960 186 L 548 244 Z"
          fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={6.5} />
        <rect x={540} y={236} width={840} height={24} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={640} y={282} width={640} height={478} fill={C.boardBack} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 660 320 Q 860 314 1080 322 M 700 700 Q 960 706 1240 698"
          fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      </g>
      {/* 手配書① 静けさ → 御用 */}
      <Tehaisho f={f} who={1} x={810} y={516} s={0.92} t={1} goyoT={seg(f, 8, 18)} />
      {/* 手配書② ワーグナー (まだ印なし) */}
      <Tehaisho f={f} who={2} x={1122} y={516} s={0.92} t={1} />
      {/* ②に当たる提灯の光 */}
      <ellipse cx={1122} cy={500} rx={210} ry={268}
        fill={SGP.lampGold} opacity={lT * (0.24 + 0.05 * Math.sin(f / 6))} />
      {/* 提灯 (右の柱の腕木から吊る) */}
      <g>
        <line x1={1330} y1={310} x2={1430} y2={296} stroke={SGP.woodDark} strokeWidth={10} />
        <g transform={`rotate(${swing} 1424 298)`}>
          <line x1={1424} y1={298} x2={1424} y2={338} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1424} cy={396} r={92} fill={SGP.lampGold} opacity={0.3 + 0.08 * Math.sin(f / 6)} />
          <ellipse cx={1424} cy={392} rx={40} ry={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 1388 374 Q 1424 366 1460 374 M 1386 396 Q 1424 390 1462 396 M 1390 416 Q 1424 412 1458 416"
            fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          <rect x={1408} y={332} width={32} height={10} fill={KRP.ink} />
          <rect x={1408} y={440} width={32} height={10} fill={KRP.ink} />
          <ellipse cx={1424} cy={394 + Math.sin(f / 5) * 2} rx={8} ry={14}
            fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
      {/* 見物人 (左手前) */}
      <ellipse cx={310} cy={1042} rx={86} ry={18} fill={KRP.ink} opacity={0.25} />
      <Person x={310} y={1034} s={1.15} cloth={C.coat} clothDark={C.beret}
        face="surprised" pose="point" pointDir={1} gaze={[5, -5]} f={f} phase={1} />
      <PersonMini x={140} y={1046} s={0.95} color={C.seatMute2} f={f} phase={5} />
      <PersonMini x={452} y={1052} s={0.72} color={C.brick} f={f} phase={8} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #82 第4章、ワーグナー、明かりを消す。
// 格: 山 / seed 1117
// 絵: 章扉。丘の上のバイロイト祝祭劇場の外観。1876の祝祭の旗、馬車の列
// どこ: 緑の丘の上のバイロイト祝祭劇場。坂道に馬車の列、祝祭の旗と万国旗
// 演出: 章扉。1876の旗がはためき、客が丘を登っていく晴れの日
// 動き: 旗のはためき・雲の流れ・馬車の車輪と馬の脚・章扉の題字 (f10-26)
const Sg082: React.FC<{ f: number }> = ({ f }) => {
  const wave = Math.sin(f / 7) * 8;
  return (
    <Frame f={f} seed={1117}
      over={<ChapterDoor num={4} title="ワーグナー 明かりを消す" t={seg(f, 10, 26)}
        left={90} top={560} width={760} />}>
      {/* 空と雲 */}
      <rect x={-20} y={-20} width={1960} height={700} fill={C.sky82} />
      <SgCloud x={260 + (f * 0.3) % 80} y={150} s={1.0} o={0.9} />
      <SgCloud x={1700 - (f * 0.22) % 70} y={100} s={0.8} o={0.8} />
      <SgCloud x={900 + (f * 0.18) % 60} y={220} s={0.6} o={0.7} />
      <g stroke={KRP.ink} strokeWidth={3.5} fill="none" opacity={0.7}>
        <path d={`M 420 ${230 + Math.sin(f / 15) * 6} q 13 -11 26 0 q 13 -11 26 0`} />
        <path d={`M 560 ${190 + Math.sin(f / 13) * 6} q 11 -9 22 0 q 11 -9 22 0`} />
      </g>
      {/* 遠景の家 (劇場の右手前) */}
      <g>
        <rect x={1760} y={724} width={110} height={120} fill={C.brickLight} stroke={KRP.ink} strokeWidth={4.5} />
        <polygon points="1750,724 1815,674 1880,724" fill={C.brick} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={1782} y={752} width={30} height={34} fill={C.windowDark} stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={1828} y={776} width={28} height={68} fill={C.windowDark} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 丘 */}
      <path d="M -40 1100 Q 380 780 900 650 Q 1300 560 1600 556 Q 1820 556 1960 620 L 1960 1100 Z"
        fill={KRP.green} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 300 960 Q 560 870 820 810 M 1000 740 Q 1300 672 1660 650"
        fill="none" stroke={C.hillDark} strokeWidth={5} opacity={0.6} />
      {/* 坂道 */}
      <path d="M 240 1100 Q 620 940 1000 820 Q 1300 730 1428 646"
        fill="none" stroke={KRP.ink} strokeWidth={82} opacity={0.5} />
      <path d="M 240 1100 Q 620 940 1000 820 Q 1300 730 1428 646"
        fill="none" stroke={SGP.barCraft} strokeWidth={70} />
      <path d="M 240 1100 Q 620 940 1000 820 Q 1300 730 1428 646"
        fill="none" stroke={KRP.ink} strokeWidth={4} strokeDasharray="26 30" opacity={0.4} />
      {/* ふもとの村 (左下の草地) */}
      {[
        { hx: 26, hy: 968, s: 1.0 }, { hx: 150, hy: 996, s: 0.92 },
      ].map(({ hx, hy, s }, i) => (
        <g key={`vh${i}`} transform={`translate(${hx} ${hy}) scale(${s})`}>
          <rect x={0} y={0} width={104} height={104} fill={C.brickLight} stroke={KRP.ink} strokeWidth={4.5} />
          <polygon points="-10,0 52,-46 114,0" fill={C.brick} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={16} y={24} width={28} height={30} fill={C.windowDark} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={62} y={44} width={28} height={60} fill={C.windowDark} stroke={KRP.ink} strokeWidth={3.5} />
          <path d={`M 104 -30 q ${4 + Math.sin(f / 9 + i) * 3} -18 ${12 + Math.sin(f / 9 + i) * 4} -30`}
            stroke={KRP.ink} strokeWidth={3.5} fill="none" opacity={0.45} />
        </g>
      ))}
      {/* ===== 祝祭劇場 ===== */}
      <g transform="translate(1440 620)">
        {/* 両翼 */}
        <rect x={-342} y={-180} width={176} height={180} fill={C.brickLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={166} y={-200} width={190} height={200} fill={C.brickLight} stroke={KRP.ink} strokeWidth={6} />
        {[-310, -254, 206, 276].map((wx) => (
          <rect key={wx} x={wx} y={-150} width={38} height={62} fill={C.windowDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 中央棟と切妻 */}
        <rect x={-170} y={-262} width={340} height={262} fill={C.brick} stroke={KRP.ink} strokeWidth={7} />
        <polygon points="-192,-262 0,-404 192,-262" fill={C.brick} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -150 -280 L 0 -390 L 150 -280" fill="none" stroke={C.windowDark} strokeWidth={5} opacity={0.7} />
        <circle cx={0} cy={-320} r={26} fill={C.windowDark} stroke={KRP.ink} strokeWidth={5} />
        {/* アーチ窓3つ */}
        {[-108, -25, 58].map((ax) => (
          <path key={ax} d={`M ${ax} -60 L ${ax} -180 A 25 25 0 0 1 ${ax + 50} -180 L ${ax + 50} -60 Z`}
            fill={C.windowDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {/* 入口の階段 */}
        <rect x={-120} y={-10} width={240} height={10} fill={C.tileA} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-140} y={0} width={280} height={12} fill={C.tileA} stroke={KRP.ink} strokeWidth={4} />
        {/* 祝祭の旗 (1876) 2本 */}
        {[[-60, -404], [250, -200]].map(([px, py], i) => (
          <g key={i} transform={`translate(${px} ${py})`}>
            <line x1={0} y1={0} x2={0} y2={-120} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M 0 -120 Q 55 ${-126 + wave * (i ? -0.6 : 1)} 110 -118 L 110 -62 Q 55 ${-56 + wave * (i ? -0.6 : 1)} 0 -64 Z`}
              fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
            <text x={54} y={-78} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={30} fill={KRP.white}>1876</text>
          </g>
        ))}
        {/* 万国旗ふうの飾り紐 */}
        <path d="M -342 -190 Q -80 -120 166 -210" fill="none" stroke={KRP.ink} strokeWidth={3.5} />
        {Array.from({ length: 8 }).map((_, i) => {
          const t = (i + 0.5) / 8;
          const bx = lerp(-342, 166, t);
          const by = -190 + Math.sin(Math.PI * t) * 66 - t * 14;
          return (
            <polygon key={i} points={`${bx - 12},${by} ${bx + 12},${by} ${bx},${by + 26 + Math.sin(f / 8 + i) * 2}`}
              fill={i % 2 ? KRP.yellow : KRP.red} stroke={KRP.ink} strokeWidth={3} />
          );
        })}
      </g>
      {/* 馬車の列と登っていく客 */}
      <SgCarriage x={600} y={1010} f={f} s={1} phase={0} />
      <SgCarriage x={900} y={898} f={f} s={0.82} phase={3} />
      <SgCarriage x={1130} y={800} f={f} s={0.66} phase={6} />
      <PersonMini x={790} y={966} s={0.52} color={C.coat} f={f} phase={2} />
      <PersonMini x={1060} y={856} s={0.46} color={C.velvet} f={f} phase={5} />
      <PersonMini x={1280} y={742} s={0.4} color={KRP.blueDeep} f={f} phase={9} />
      {/* 右端の木 */}
      <g transform="translate(1830 780)">
        <rect x={-12} y={-60} width={24} height={110} fill={SGP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={-120} r={74} fill={C.hillDark} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-48} cy={-86} r={44} fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #83 1876年8月13日。ドイツの小さな町、バイロイト。
// 格: 並 / seed 1118
// 絵: 日付札。小さな町の駅に列車が着き、着飾った客が降り立つ
// どこ: 小さな町の駅。奥に駅舎 (バイロイトの看板)・丘と家並み、手前のホームに着飾った客
// 演出: 蒸気機関車が左から滑り込み、日付の札。客はトランクを提げて降り立ったところ
// 動き: 列車の入線 (f0-24)・車輪の回転・煙の立ちのぼり・客の体ゆれ
const Sg083: React.FC<{ f: number }> = ({ f }) => {
  const xoff = (1 - easeOut(seg(f, 0, 24))) * -900;
  const rot = xoff * 1.1;
  return (
    <Frame f={f} seed={1118}>
      {/* 空と丘と町 */}
      <rect x={-20} y={-20} width={1960} height={640} fill={C.sky83} />
      <SgCloud x={300} y={120} s={0.8} o={0.85} />
      <SgCloud x={1100} y={80} s={0.6} o={0.75} />
      <path d="M -40 620 Q 360 440 820 560 L 820 640 L -40 640 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 700 620 Q 1100 470 1500 590 L 1500 640 L 700 640 Z" fill={C.hillDark} stroke={KRP.ink} strokeWidth={5} />
      {[180, 360, 540].map((hx, i) => (
        <g key={hx}>
          <rect x={hx} y={560 - (i % 2) * 20} width={88} height={78} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <polygon points={`${hx - 8},${560 - (i % 2) * 20} ${hx + 44},${522 - (i % 2) * 20} ${hx + 96},${560 - (i % 2) * 20}`}
            fill={C.brick} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* 駅舎 */}
      <g>
        <rect x={1400} y={330} width={460} height={490} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <polygon points="1360,330 1630,210 1900,330" fill={C.brick} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={SGP.woodDark} strokeWidth={6} opacity={0.8}>
          <line x1={1430} y1={360} x2={1560} y2={520} />
          <line x1={1560} y1={360} x2={1430} y2={520} />
          <line x1={1700} y1={360} x2={1830} y2={520} />
          <line x1={1830} y1={360} x2={1700} y2={520} />
          <line x1={1400} y1={540} x2={1860} y2={540} />
        </g>
        <path d="M 1570 820 L 1570 620 A 60 60 0 0 1 1690 620 L 1690 820 Z"
          fill={C.windowDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 吊り看板 */}
        <g transform={`rotate(${Math.sin(f / 11) * 1.4} 1630 556)`}>
          <line x1={1498} y1={556} x2={1510} y2={586} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1762} y1={556} x2={1750} y2={586} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1480} y={584} width={300} height={62} rx={8} fill={SGP.wood} stroke={KRP.ink} strokeWidth={6} />
          <text x={1630} y={630} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={1.5}
            paintOrder="stroke" letterSpacing={4}>バイロイト</text>
        </g>
      </g>
      {/* 線路帯 */}
      <rect x={-20} y={640} width={1960} height={180} fill={C.windowDark} opacity={0.5} />
      <line x1={-20} y1={796} x2={1940} y2={796} stroke={KRP.ink} strokeWidth={7} />
      {/* ===== 列車 (左から入線) ===== */}
      <g transform={`translate(${1060 + xoff} 790)`}>
        {/* 客車 */}
        <rect x={-760} y={-196} width={310} height={152} rx={10} fill={C.coat} stroke={KRP.ink} strokeWidth={6.5} />
        {[-730, -640, -550].map((wx) => (
          <rect key={wx} x={wx} y={-168} width={66} height={62} rx={6} fill={C.glass} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        <rect x={-766} y={-214} width={322} height={20} rx={8} fill={KRP.ink} />
        {[-690, -520].map((wx) => (
          <g key={wx} transform={`translate(${wx} -34)`}>
            <circle r={32} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
            <g transform={`rotate(${rot})`} stroke={KRP.ink} strokeWidth={4}>
              <line x1={-26} y1={0} x2={26} y2={0} />
              <line x1={0} y1={-26} x2={0} y2={26} />
            </g>
          </g>
        ))}
        <line x1={-450} y1={-80} x2={-400} y2={-80} stroke={KRP.ink} strokeWidth={8} />
        {/* 機関車: 運転室 */}
        <rect x={-400} y={-250} width={140} height={206} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6.5} />
        <rect x={-376} y={-224} width={66} height={62} rx={6} fill={C.glass} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-408} y={-268} width={156} height={22} rx={8} fill={KRP.ink} />
        {/* ボイラー */}
        <rect x={-266} y={-170} width={238} height={110} rx={40} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6.5} />
        <circle cx={-32} cy={-116} r={52} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6.5} />
        <circle cx={-32} cy={-116} r={30} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        {/* 煙突とドーム */}
        <path d="M -226 -170 L 226 -170" display="none" />
        <rect x={-230} y={-242} width={40} height={76} fill={KRP.ink} />
        <path d="M -240 -242 L -180 -242 L -192 -262 L -228 -262 Z" fill={KRP.ink} />
        <path d="M -140 -170 A 30 30 0 0 1 -80 -170 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
        {/* 台枠と車輪 */}
        <rect x={-416} y={-60} width={400} height={26} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
        {[-320, -200].map((wx) => (
          <g key={wx} transform={`translate(${wx} -30)`}>
            <circle r={48} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
            <g transform={`rotate(${rot})`} stroke={KRP.ink} strokeWidth={5}>
              <line x1={-40} y1={0} x2={40} y2={0} />
              <line x1={0} y1={-40} x2={0} y2={40} />
            </g>
            <circle r={9} fill={KRP.ink} />
          </g>
        ))}
        <circle cx={-80} cy={-26} r={30} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 先頭の排障器 */}
        <path d="M -16 -60 L 36 -4 L -16 -4 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5.5} />
        {/* 煙 (煙突から) */}
        {[0, 1, 2, 3].map((i) => {
          const t = ((f * 1.4 + i * 16) % 60) / 60;
          return (
            <circle key={i} cx={-210 + Math.sin(t * 5 + i) * 18 + t * 40}
              cy={-282 - t * 230} r={16 + t * 30}
              fill={KRP.white} opacity={(1 - t) * 0.65} />
          );
        })}
      </g>
      {/* ホーム */}
      <rect x={-20} y={820} width={1960} height={60} fill={SGP.stage} stroke={KRP.ink} strokeWidth={6} />
      <line x1={-20} y1={838} x2={1940} y2={838} stroke={KRP.white} strokeWidth={5} strokeDasharray="60 36" opacity={0.8} />
      <rect x={-20} y={880} width={1960} height={220} fill={C.tileA} />
      {/* 降り立った客 */}
      <ellipse cx={700} cy={1038} rx={82} ry={18} fill={KRP.ink} opacity={0.14} />
      <Person x={700} y={1030} s={1.15} cloth={C.velvet} clothDark="#703040"
        face="smile" gaze={[4, -3]} f={f} phase={1} />
      {/* シルクハット */}
      <g transform={`translate(700 ${1030 + Math.sin((f + 17) / 13) * 3})`}>
        <rect x={-44} y={-394} width={88} height={64} rx={6} fill={KRP.ink} />
        <rect x={-66} y={-336} width={132} height={12} rx={6} fill={KRP.ink} />
      </g>
      <ellipse cx={950} cy={1046} rx={78} ry={18} fill={KRP.ink} opacity={0.14} />
      <Person x={950} y={1038} s={1.1} cloth={KRP.blueDeep} clothDark="#2F5590"
        face="normal" glasses pose="hold" gaze={[-4, -2]} f={f} phase={4} />
      {/* 手提げトランク (hold の手元) */}
      <g transform={`translate(950 ${1038 + Math.sin((f + 68) / 13) * 3})`}>
        <rect x={-58} y={-120} width={116} height={78} rx={10} fill={C.brick} stroke={KRP.ink} strokeWidth={5.5} />
        <line x1={-58} y1={-86} x2={58} y2={-86} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-10} y={-94} width={20} height={16} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* 駅前の荷物と駅員 */}
      <PersonMini x={1300} y={1044} s={0.95} color={C.seatMute1} f={f} phase={7} />
      <g transform="translate(1420 1040)">
        <rect x={0} y={-56} width={140} height={56} rx={8} fill={SGP.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={14} y={-104} width={112} height={48} rx={8} fill={C.boardBack} stroke={KRP.ink} strokeWidth={5} />
        <line x1={70} y1={-104} x2={70} y2={-56} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 日付の札 */}
      <TagPlate x={330} y={160} text="1876年8月13日" size={38} t={seg(f, 4, 14)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #84 作曲家ワーグナーが、自分の作品のためだけの劇場を開きます。
// 格: 並 / seed 1119
// 絵: 図面を広げるワーグナー (ベレー帽)。図面の隅に「上演するのは私の作品のみ」の但し書き
// どこ: 書斎。本棚とランプの灯る机の上で、劇場の図面がするすると広がる
// 演出: 図面には扇形の客席と舞台。隅の但し書きがぽんと現れる。ワーグナー(ベレー帽)が図面を指す
// 動き: 図面が f で左から右へ広がる / 但し書きがポップ / ろうそくの炎が揺れる
const Sg084: React.FC<{ f: number }> = ({ f }) => {
  const uw = Math.max(90, 1000 * easeOut(seg(f, 2, 18)));
  const noteT = pop(seg(f, 20, 30));
  const flick = 1 + 0.08 * Math.sin(f / 3.2);
  return (
    <Frame f={f} seed={1119}>
      {/* 壁と床 */}
      <rect x={-20} y={-20} width={1960} height={760} fill={C.studyWall} />
      <rect x={-20} y={740} width={1960} height={380} fill={C.salonFloor} />
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`fl${i}`} x1={-20} y1={790 + i * 46} x2={1940} y2={790 + i * 46} stroke={C.desk} strokeWidth={3} opacity={0.3} />
      ))}
      {/* 壁の羽目板と絵 */}
      <line x1={-20} y1={560} x2={1940} y2={560} stroke={C.desk} strokeWidth={5} opacity={0.4} />
      <rect x={860} y={160} width={220} height={170} fill={SGP.paperOld} stroke={SGP.woodDark} strokeWidth={7} opacity={0.75} />
      <path d="M 880 300 L 950 220 L 1010 272 L 1050 236 L 1062 300 Z" fill={C.hillDark} opacity={0.5} />
      <circle cx={1020} cy={206} r={16} fill={C.orangePale} opacity={0.6} />
      {/* 本棚 (左) */}
      <g>
        <rect x={60} y={120} width={300} height={560} fill={SGP.woodDark} />
        <rect x={76} y={136} width={268} height={528} fill={SGP.wood} />
        {[0, 1, 2].map((r) => (
          <g key={`shelf${r}`}>
            <rect x={76} y={300 + r * 176} width={268} height={14} fill={SGP.woodDark} />
            {Array.from({ length: 7 }).map((_, i) => {
              const h = 98 + rnd(1119, r * 7 + i) * 42;
              const cols = [C.velvet, C.blueprint, C.hillDark, C.orangePale, C.beret];
              return (
                <rect key={`bk${r}${i}`} x={92 + i * 34} y={300 + r * 176 - h} width={28} height={h}
                  fill={cols[(r * 7 + i) % 5]} stroke={C.ink} strokeWidth={3} opacity={0.85} />
              );
            })}
          </g>
        ))}
      </g>
      {/* 巻物棚 (右端) */}
      <g opacity={0.8}>
        <rect x={1760} y={240} width={150} height={420} fill={SGP.wood} stroke={SGP.woodDark} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <g key={`sc${i}`}>
            <rect x={1776} y={286 + i * 130} width={118} height={26} rx={13} fill={SGP.paperOld} stroke={C.ink} strokeWidth={3} />
            <circle cx={1776} cy={299 + i * 130} r={13} fill={C.desk} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 机 */}
      <polygon points="300,660 1500,660 1560,960 240,960" fill={SGP.wood} stroke={SGP.woodDark} strokeWidth={7} />
      <rect x={240} y={960} width={1320} height={60} fill={SGP.woodDark} />
      {/* インク壺と羽根ペン */}
      <g transform="translate(320 760)">
        <rect x={0} y={0} width={44} height={36} rx={6} fill={C.ink} />
        <path d={`M 36 -4 C ${54 + Math.sin(f / 5) * 3} -50 70 -66 84 -86`} stroke={SGP.paper} strokeWidth={8} fill="none" />
      </g>
      {/* ろうそく */}
      <g transform="translate(1300 652)">
        <rect x={-10} y={-56} width={20} height={56} fill={SGP.paper} stroke={C.ink} strokeWidth={3} />
        <ellipse cx={0} cy={-66} rx={9 * flick} ry={16 * flick} fill={SGP.lampGold} />
        <ellipse cx={0} cy={-62} rx={4} ry={8} fill="#FFF6D8" />
        <rect x={-26} y={0} width={52} height={10} rx={5} fill={C.brassDark} />
      </g>
      {/* 図面 (広がる) */}
      <g>
        <rect x={380} y={690} width={uw} height={240} fill={C.blueprint} stroke={C.ink} strokeWidth={6} />
        <clipPath id="sg84plan">
          <rect x={380} y={690} width={uw} height={240} />
        </clipPath>
        <g clipPath="url(#sg84plan)" stroke="#E8F0FA" fill="none" strokeWidth={3.5} opacity={0.9}>
          {/* 舞台 */}
          <rect x={420} y={740} width={120} height={140} />
          <line x1={420} y1={810} x2={540} y2={810} />
          {/* 扇形の客席 */}
          {[620, 760, 900, 1040, 1180].map((r, i) => (
            <path key={`arc${i}`} d={`M ${560 + i * 150} 724 C ${600 + i * 150} 800 ${600 + i * 150} 820 ${560 + i * 150} 896`} />
          ))}
          {/* 座席の列 */}
          {[0, 1, 2].map((row) => (
            <line key={`st${row}`} x1={580} y1={770 + row * 40} x2={1340} y2={770 + row * 40} strokeDasharray="10 12" strokeWidth={2.5} />
          ))}
        </g>
        {/* 巻き芯 */}
        <g transform={`translate(${380 + uw} 690)`}>
          <rect x={-8} y={-10} width={26} height={260} rx={12} fill={SGP.paper} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={5} cy={-10} rx={13} ry={9} fill={SGP.paperOld} stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
      {/* 但し書きの紙 */}
      <g transform={`translate(1048 726) rotate(5) scale(${Math.max(0.01, noteT)})`} opacity={Math.min(1, noteT)}>
        <rect x={-10} y={-12} width={248} height={92} fill={SGP.paper} stroke={C.ink} strokeWidth={4} />
        <text x={114} y={24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.ink}>上演するのは</text>
        <text x={114} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.ink}>私の作品のみ</text>
      </g>
      {/* ワーグナー (ベレー帽) */}
      <Person x={1640} y={1030} s={1.45} f={f} cloth={C.wagCoat} pose="point" pointDir={-1} face="smile" />
      <g transform="translate(1636 606) rotate(-10)">
        <ellipse cx={0} cy={0} rx={96} ry={30} fill={C.beret} stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={-22} r={9} fill={C.beret} stroke={C.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #85 そしてこの日、彼は決定的なことをしました。
// 格: 並 / seed 1120
// 絵: 客席のガス灯のバルブに手をかける後ろ姿。場内がざわ、と静まる。溜め
// どこ: 薄暗い場内の壁ぎわ。ガス灯の配管とバルブに、後ろ姿の男が歩み寄る
// 演出: 大きなガス灯が強く灯る中、手がゆっくりバルブへ伸びる。音符が消えて静まる「溜め」
// 動き: 腕が f でバルブへ / 炎と光がゆらめく / 音符がすっと消える
const Sg085: React.FC<{ f: number }> = ({ f }) => {
  const reach = easeOut(seg(f, 6, 28));
  const hx = lerp(1210, 1252, reach);
  const hy = lerp(830, 512, reach);
  const glow = 0.9 + 0.1 * Math.sin(f / 6);
  const hushO = 1 - seg(f, 8, 26);
  return (
    <Frame f={f} seed={1120} bg={C.dim85} dark>
      {/* 壁の羽目板 */}
      <rect x={-20} y={-20} width={1960} height={1140} fill={C.dim85} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`pn${i}`} x={30 + i * 380} y={90} width={310} height={520} rx={10}
          fill="none" stroke={C.coat} strokeWidth={6} opacity={0.5} />
      ))}
      <line x1={-20} y1={660} x2={1940} y2={660} stroke={C.coat} strokeWidth={9} opacity={0.65} />
      <rect x={-20} y={660} width={1960} height={240} fill={C.coat} opacity={0.3} />
      {/* 床 */}
      <rect x={-20} y={900} width={1960} height={240} fill={C.darkVeil} opacity={0.55} />
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`fl${i}`} x1={-20} y1={936 + i * 36} x2={1940} y2={936 + i * 36}
          stroke={C.coat} strokeWidth={3} opacity={0.4} />
      ))}
      {/* ガスの配管 */}
      <rect x={1242} y={-20} width={16} height={540} fill={C.brassDark} stroke={C.ink} strokeWidth={4} />
      <rect x={1226} y={160} width={48} height={22} rx={8} fill={C.brassDark} stroke={C.ink} strokeWidth={4} />
      {/* 大きなガス灯 (まだ灯っている) */}
      <g opacity={glow}>
        <circle cx={1050} cy={300} r={210} fill={SGP.lampGold} opacity={0.14} />
        <circle cx={1050} cy={300} r={120} fill={SGP.lampGold} opacity={0.2} />
      </g>
      <SgGasLamp x={1050} y={300} f={f} i={0} s={1.5} flameT={1} />
      <path d={`M 1110 300 L 1242 300`} stroke={C.brassDark} strokeWidth={10} fill="none" />
      {/* 奥の小さな灯 (左右) */}
      <SgGasLamp x={330} y={330} f={f} i={1} s={0.85} flameT={1} />
      <SgGasLamp x={1760} y={330} f={f} i={2} s={0.85} flameT={1} />
      {/* バルブのハンドル */}
      <g transform={`translate(1250 480) rotate(${Math.sin(f / 10) * 2})`}>
        <line x1={0} y1={0} x2={-8} y2={40} stroke={C.brassDark} strokeWidth={10} />
        <circle cx={0} cy={0} r={46} fill="none" stroke={C.brassDark} strokeWidth={11} />
        <circle cx={0} cy={0} r={12} fill={C.brassDark} stroke={C.ink} strokeWidth={4} />
        {[0, 45, 90, 135].map((a) => (
          <line key={`sp${a}`} x1={-44 * Math.cos((a * Math.PI) / 180)} y1={-44 * Math.sin((a * Math.PI) / 180)}
            x2={44 * Math.cos((a * Math.PI) / 180)} y2={44 * Math.sin((a * Math.PI) / 180)}
            stroke={C.brassDark} strokeWidth={8} />
        ))}
      </g>
      {/* 後ろ姿の男 (コートとベレー帽) */}
      <g>
        {/* コート */}
        <path d="M 1245 1060 L 1258 760 Q 1262 712 1330 706 Q 1398 712 1402 760 L 1425 1060 Z"
          fill={C.coat} stroke={C.ink} strokeWidth={7} />
        <line x1={1332} y1={742} x2={1336} y2={1050} stroke={C.ink} strokeWidth={4} opacity={0.6} />
        {/* 頭 (後頭部) */}
        <circle cx={1330} cy={660} r={59} fill="#E8C9A8" stroke={C.ink} strokeWidth={6} />
        <path d="M 1274 652 Q 1288 702 1330 712 Q 1374 702 1386 650 Q 1368 676 1330 680 Q 1294 676 1274 652 Z"
          fill={C.ink} />
        <g transform="translate(1330 622) rotate(-6)">
          <ellipse cx={0} cy={0} rx={66} ry={22} fill={C.beret} stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={-16} r={7} fill={C.beret} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 伸びる腕 */}
        <path d={`M 1282 772 Q ${lerp(1230, 1268, reach)} ${lerp(820, 620, reach)} ${hx} ${hy}`}
          fill="none" stroke={C.ink} strokeWidth={42} strokeLinecap="round" />
        <path d={`M 1282 772 Q ${lerp(1230, 1268, reach)} ${lerp(820, 620, reach)} ${hx} ${hy}`}
          fill="none" stroke={C.coat} strokeWidth={32} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={15} fill="#E8C9A8" stroke={C.ink} strokeWidth={5} />
      </g>
      {/* ざわめきが静まる客席 (影) */}
      {[120, 270, 420, 570, 720].map((x, i) => (
        <PersonMini key={`au${i}`} x={x} y={1056} s={0.7} f={f} phase={i}
          color={[C.seatMute1, C.seatMute2, C.seatMute3, C.seatMute1, C.seatMute2][i]} face="none" arms="down" />
      ))}
      {/* 消えゆく音符 (ざわ、が静まる) */}
      <SgNote x={420} y={880} f={f} i={0} s={1.1} o={hushO} />
      <SgNote x={600} y={840} f={f} i={1} s={0.9} o={hushO * 0.8} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #86 客席の明かりを、消したのです。
// 格: 山 / seed 1121
// 絵: **事件**。客席がすうっと暗転する瞬間。光が舞台だけに残り、客の顔が闇に沈む。ここから動画全体の色調が一段暗くなる
// どこ: 劇場の場内全景。左が舞台、右が客席。客席のガス灯が順に消えていく
// 演出: 事件。闇のベールが客席に降り、光は舞台だけに残る。客の顔が闇に沈む
// 動き: ガス灯の炎が f で1つずつ縮んで消える / 闇の幕がじわっと濃くなる / 舞台の光芒は残る
const Sg086: React.FC<{ f: number }> = ({ f }) => {
  const dk = seg(f, 10, 40);
  return (
    <Frame f={f} seed={1121} bg={SGP.nightInk} dark>
      <rect x={-20} y={-20} width={1960} height={1140} fill={SGP.nightInk} />
      {/* ===== 舞台 (左) : 光が残る側 ===== */}
      {/* 舞台の光だまり */}
      <circle cx={330} cy={560} r={430} fill={SGP.lampGold} opacity={0.1 + 0.03 * Math.sin(f / 7)} />
      <circle cx={330} cy={560} r={270} fill={SGP.lampGold} opacity={0.14} />
      {/* 上からの光芒 */}
      <polygon points="230,40 430,40 560,780 100,780" fill={SGP.lampGold} opacity={0.2} />
      <ellipse cx={330} cy={790} rx={420 * (1 - 0.45 * dk)} ry={54} fill={SGP.lampGold} opacity={0.26} />
      {/* プロセニアム (額縁) */}
      <rect x={70} y={120} width={38} height={660} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
      <rect x={566} y={120} width={38} height={660} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
      <path d="M 70 150 Q 337 60 604 150 L 604 104 Q 337 20 70 104 Z" fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
      {/* 幕 (左右にたくし上げ) */}
      <path d="M 108 140 Q 180 420 128 760 L 108 760 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={5} />
      <path d="M 566 140 Q 494 420 546 760 L 566 760 Z" fill={SGP.curtain} stroke={C.ink} strokeWidth={5} />
      {/* 舞台の床と前板 */}
      <rect x={70} y={760} width={534} height={34} fill={SGP.stage} stroke={C.ink} strokeWidth={5} />
      <rect x={70} y={794} width={534} height={120} fill={SGP.woodDark} stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <line key={`bd${i}`} x1={110 + i * 130} y1={800} x2={110 + i * 130} y2={908} stroke={C.ink} strokeWidth={3} opacity={0.5} />
      ))}
      {/* 背景の書割 (山と城) */}
      <g opacity={0.8}>
        <path d="M 140 700 L 260 520 L 350 640 L 440 500 L 560 700 Z" fill={C.hillDark} opacity={0.5} />
        <rect x={380} y={430} width={70} height={110} fill={SGP.paperOld} stroke={C.ink} strokeWidth={4} opacity={0.7} />
        <polygon points="380,430 415,386 450,430" fill={SGP.curtain} opacity={0.7} />
      </g>
      {/* 演者 (神話劇の扮装のまま歌い続けている。役の扮装であって実在の人の似顔ではない) */}
      <Person x={330} y={758} s={1.05} f={f} cloth={C.velvet} pose="banzai" face="joy" />
      <AtamaNo x={330} y={758} s={1.05} f={f}>
        <ShinwaIsho f={f} />
      </AtamaNo>
      <SgNote x={430} y={470} f={f} i={3} s={1.1} o={0.9} />
      {/* ===== 客席 (右) : 闇に沈む側 ===== */}
      {/* 客席の床の段 */}
      <polygon points="640,760 1940,700 1940,1120 640,1120" fill={C.coat} opacity={0.5} />
      {/* 客の列 (奥→手前) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <PersonMini key={`r1${i}`} x={760 + i * 150} y={806} s={0.66} f={f} phase={i}
          color={[C.seatMute1, C.seatMute2, C.seatMute3][i % 3]} face="none" arms="down" />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <PersonMini key={`r2${i}`} x={820 + i * 160} y={930} s={0.8} f={f} phase={i + 3}
          color={[C.seatMute2, C.seatMute3, C.seatMute1][i % 3]} face="none" arms="down" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <PersonMini key={`r3${i}`} x={740 + i * 155} y={1062} s={0.95} f={f} phase={i + 6}
          color={[C.seatMute3, C.seatMute1, C.seatMute2][i % 3]} face={dk < 0.55 && i % 2 === 0 ? "dot" : "none"} arms="down" />
      ))}
      {/* 座席の背もたれ (列の手前) */}
      {[866, 996].map((y, r) => (
        <g key={`bk${r}`}>
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={`b${r}${i}`} x={700 + i * 142} y={y} width={112} height={56} rx={12}
              fill={C.darkVeil} stroke={C.ink} strokeWidth={4} opacity={0.9} />
          ))}
        </g>
      ))}
      {/* 闇のベール (客席側だけ) */}
      <rect x={640} y={-20} width={1300} height={1140} fill={C.darkVeil} opacity={dk * 0.68} />
      {/* 暗い客席の人を舞台側からのリムライトで分離する (真っ黒のシルエットにしない) */}
      {([
        { n: 8, x0: 760, dx: 150, y: 806, s: 0.66, ph: 0 },
        { n: 7, x0: 820, dx: 160, y: 930, s: 0.8, ph: 3 },
        { n: 8, x0: 740, dx: 155, y: 1062, s: 0.95, ph: 6 },
      ] as const).map((row, ri) =>
        Array.from({ length: row.n }).map((_, i) => (
          <MiniNo key={`rim${ri}${i}`} x={row.x0 + i * row.dx} y={row.y} s={row.s}
            f={f} phase={row.ph + i}>
            <path d="M -22 -186 Q -40 -160 -22 -134" fill="none"
              stroke={SGP.lampGold} strokeWidth={6} strokeLinecap="round"
              opacity={0.3 + 0.28 * dk} />
            <path d="M -38 -118 Q -44 -62 -38 -6" fill="none"
              stroke={SGP.lampGold} strokeWidth={6} strokeLinecap="round"
              opacity={0.22 + 0.24 * dk} />
          </MiniNo>
        )),
      )}
      {/* 客席のガス灯 (1つずつ消えていく) — ベールの上に描く */}
      {[
        { x: 840, y: 250 }, { x: 1180, y: 230 }, { x: 1520, y: 250 }, { x: 1840, y: 270 },
      ].map((p, i) => {
        const flameT = 1 - seg(f, 6 + i * 8, 15 + i * 8);
        return (
          <g key={`gl${i}`} opacity={1 - dk * 0.45}>
            <rect x={p.x - 5} y={-20} width={10} height={p.y - 60} fill={C.brassDark} opacity={0.8} />
            <SgGasLamp x={p.x} y={p.y} f={f} i={i + 4} s={1.0} flameT={flameT} />
            {flameT > 0.05 && (
              <circle cx={p.x} cy={p.y} r={110 * flameT} fill={SGP.lampGold} opacity={0.12 * flameT} />
            )}
          </g>
        );
      })}
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  sg_077: (f) => <Sg077 f={f} />,
  sg_078: (f) => <Sg078 f={f} />,
  sg_079: (f) => <Sg079 f={f} />,
  sg_080: (f) => <Sg080 f={f} />,
  sg_081: (f) => <Sg081 f={f} />,
  sg_082: (f) => <Sg082 f={f} />,
  sg_083: (f) => <Sg083 f={f} />,
  sg_084: (f) => <Sg084 f={f} />,
  sg_085: (f) => <Sg085 f={f} />,
  sg_086: (f) => <Sg086 f={f} />,
};

export const S_B3B_MOTIFS: string[] = [
  "sg_077", // #77
  "sg_078", // #78
  "sg_079", // #79
  "sg_080", // #80
  "sg_081", // #81
  "sg_082", // #82
  "sg_083", // #83
  "sg_084", // #84
  "sg_085", // #85
  "sg_086", // #86
];

export const saigoB3bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
