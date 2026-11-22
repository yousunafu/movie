// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#141〜#147 (7文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで7枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L3d。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./YawaShared";
import { YP, Squishy, DameSofa, AgeDial, KaradaChizu } from "./YawaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/YP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // YawaE3 とそろえる (お母さん・子ザル・研究所)
  wire: "#8C9298", wireDark: "#5E6369", towel: "#EFE3C8", towelDark: "#D6C3A0", bulb: "#FFE07A",
  monkey: "#9A6A45", monkeyDark: "#6E4A2E", monkeyFace: "#F2B7A8", coatWhite: "#D8D8D8",
  bedWood: "#8A5A36", bedWoodDark: "#653F24", flagBlue: "#2D3F78",
  tile: "#E4EEEB", tileLine: "#BFD2CD", tileTrim: "#5E9A8C",
  lino: "#A9B9B4", linoLine: "#7F928C",
  monkeyBelly: "#C79B74", blush: "#F28F8F",
  sky: "#BFE0F0", skyNight: "#2C3A5C", moon: "#F7EDC4",
  shaving: "#E3C98F", shavingDark: "#BE9F5E",
  // YawaAb の #16 とそろえる (博物館)
  museumWall: "#2F5552", museumDark: "#244240", marbleFloor: "#E6E0D4", marbleVein: "#C9C0AF",
  velvet: "#7E2F3A", velvetDark: "#5E222B", caseWood: "#5B3A24", glass: "#DCEFF2", spot: "#FFF4CF",
  bear: "#C08A55", cushion: "#7FA6C9", cushionDark: "#5D86AB", blanket: "#D98C7A", blanketDark: "#B56D5C",
  pillow: "#F6F2EA", signWood: "#C99A5E", signBack: "#B58A50", rope: "#A8323A", peg: "#D8BC8E",
  apronDark: "#3A5068", chairDark: "#835733",
  // #141 設計図の青焼き
  bp: "#2D5B8C", bpDark: "#21466E", bpLine: "#DCEBF7", bpGrid: "#4E7AA8",
  draft: "#B98B57", draftDark: "#8E6638", heat: "#FF9A4A",
  // #143 温かい光
  warmWash: "#FFF1D2", warmDeep: "#F7C88A",
  // #145 #146 暗い研究所
  dark: "#1C2326", dark2: "#283135", darkLine: "#36424A", steel: "#56626C", steelDark: "#3B444C",
  news: "#E6DFCC", newsDark: "#C9C0A8", newsLine: "#8F8A7C", lampDim: "#E8C877",
  // #147 夜の子ども部屋
  night: "#1F2A47", nightWall: "#2B3860", nightWall2: "#34437A", crib: "#C9A574", cribDark: "#9C7A4E",
  mattress: "#E7EEF3", babyCloth: "#F2C4CC", babyBlanket: "#BFD6EA", babyBlanketDark: "#97B6D2",
  bunny: "#F3EADF", curtain: "#5B6FA8", curtainDark: "#46578A", scrap: "#A8D0B4", scrapDark: "#7FAE8E",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void YP; void Squishy; void DameSofa; void AgeDial; void KaradaChizu;
void seg; void easeOut; void clamp01; void TagPlate;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
void lerp; void easeInOut; void rnd;
const camT = (cx: number, cy: number, sc: number, dx = 0, dy = 0) =>
  `translate(${cx * (1 - sc) + dx} ${cy * (1 - sc) + dy}) scale(${sc})`;
const bz = (a: number, b: number, c: number, d: number, t: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
const heart = "M 0 8 C -16 -4 -14 -20 0 -10 C 14 -20 16 -4 0 8 Z";

/* タイルの壁 (YawaE3 の L3cTiles と同じ) */
const L3dTiles: React.FC<{ x: number; y: number; w: number; h: number; sz: number; fill: string; line: string }> = ({ x, y, w, h, sz, fill, line }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={fill} />
    <g stroke={line} strokeWidth={3}>
      {Array.from({ length: Math.ceil(w / sz) + 1 }, (_, i) => <line key={`v${i}`} x1={x + i * sz} y1={y} x2={x + i * sz} y2={y + h} />)}
      {Array.from({ length: Math.ceil(h / sz) + 1 }, (_, i) => <line key={`h${i}`} x1={x} y1={y + i * sz} x2={x + w} y2={y + i * sz} />)}
    </g>
  </g>
);

/* 布のお母さん (YawaE3 の L3cClothMom と同じ形。tilt=頭の傾き / blushOn=ほっぺ) */
const L3dClothMom: React.FC<{ s?: number; f?: number; fluff?: number; bulb?: boolean; tilt?: number; blushOn?: number }> = ({
  s = 1, f = 0, fluff = 1, bulb = true, tilt = 0, blushOn = 0,
}) => (
  <g transform={`scale(${s})`}>
    <circle cx={30} cy={-150} r={70} fill={C.bulb} opacity={0.25 + Math.sin(f / 8) * 0.05} />
    {bulb && (
      <g>
        <rect x={52} y={-176} width={22} height={18} rx={3} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={82} cy={-167} r={14} fill={C.bulb} stroke={KRP.ink} strokeWidth={3} />
      </g>
    )}
    <rect x={-80} y={-24} width={160} height={24} rx={4} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-62} y={-240} width={124} height={220} rx={40} fill={C.towel} stroke={KRP.ink} strokeWidth={4.5} />
    {Array.from({ length: 22 }, (_, i) => (
      <circle key={i} cx={-62 + (i % 2) * 124 + Math.sin(f / 6 + i) * 2.2 * fluff} cy={-226 + Math.floor(i / 2) * 19 + Math.cos(f / 7 + i) * 1.2 * fluff} r={6 + Math.sin(f / 5 + i * 2) * 0.8 * fluff}
        fill={C.towel} stroke={KRP.ink} strokeWidth={2.5} />
    ))}
    {Array.from({ length: 18 }, (_, i) => (
      <path key={i} d={`M ${-40 + (i % 6) * 16} ${-210 + Math.floor(i / 6) * 60} q ${5 + Math.sin(f / 6 + i) * 2 * fluff} -6 10 0`} fill="none" stroke={C.towelDark} strokeWidth={3} />
    ))}
    {Array.from({ length: 12 }, (_, i) => (
      <path key={`l${i}`} d={`M ${-48 + (i % 4) * 30} ${-186 + Math.floor(i / 4) * 60} l ${3 + Math.sin(f / 5 + i) * 2 * fluff} -7`} stroke={C.towelDark} strokeWidth={2.5} strokeLinecap="round" />
    ))}
    <g transform={`rotate(${tilt} 0 -240)`}>
      <circle cx={0} cy={-292} r={50} fill={C.towel} stroke={KRP.ink} strokeWidth={4.5} />
      <path d="M -30 -310 q 3 -5 6 0 M 22 -318 q 3 -5 6 0 M -6 -330 q 3 -5 6 0 M 26 -270 q 3 -5 6 0" fill="none" stroke={C.towelDark} strokeWidth={2.5} />
      <circle cx={-17} cy={-298} r={9} fill={KRP.ink} />
      <circle cx={17} cy={-298} r={9} fill={KRP.ink} />
      {blushOn > 0 && [-30, 30].map((bx) => <ellipse key={bx} cx={bx} cy={-280} rx={10} ry={6} fill={C.blush} opacity={0.6 * blushOn} />)}
      <path d="M -10 -272 Q 0 -264 10 -272" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M -36 -332 l -8 -18 M 36 -332 l 8 -18" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
    </g>
  </g>
);

/* 子ザル: 手足 (YawaE3 と同じ) */
const L3dLimb: React.FC<{ d: string; w?: number; col?: string }> = ({ d, w = 20, col = C.monkey }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={KRP.ink} strokeWidth={w + 9} />
    <path d={d} stroke={col} strokeWidth={w} />
  </g>
);
const L3dPaw: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 11, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {[-0.9, 0, 0.9].map((a, i) => <circle key={i} cx={Math.sin(a) * r * 0.95} cy={-Math.cos(a) * r * 0.95} r={r * 0.42} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={2.5} />)}
    <circle r={r} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
/* 子ザルの頭 (YawaE3 と同じ。★大きな丸い目は変えない) */
const L3dMonkeyHead: React.FC<{ look?: number; closed?: boolean; mouth?: "smile" | "o" | "suck" }> = ({ look = 0, closed = false, mouth = "smile" }) => (
  <g>
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <circle cx={sd * 50 - look * 6} cy={-2} r={17} fill={C.monkey} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={sd * 50 - look * 6} cy={-2} r={9} fill={C.monkeyFace} />
      </g>
    ))}
    <circle r={52} fill={C.monkey} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -14 -50 q 4 -18 12 -4 q 6 -16 14 2" fill={C.monkey} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -36 -30 q 4 -6 8 0 M 28 -30 q 4 -6 8 0" fill="none" stroke={C.monkeyDark} strokeWidth={2.5} />
    <g transform={`translate(${look * 9} 0)`}>
      <path d="M -40 -6 Q -40 -34 -16 -30 Q 0 -26 16 -30 Q 40 -34 40 -6 Q 40 18 24 30 Q 0 44 -24 30 Q -40 18 -40 -6 Z" fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={-27} cy={14} rx={8} ry={5} fill={C.blush} opacity={0.55} />
      <ellipse cx={27} cy={14} rx={8} ry={5} fill={C.blush} opacity={0.55} />
      {closed ? (
        <g fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round">
          <path d="M -26 -8 Q -15 2 -4 -8" />
          <path d="M 4 -8 Q 15 2 26 -8" />
        </g>
      ) : (
        <g>
          {[-15, 15].map((ex) => (
            <g key={ex}>
              <circle cx={ex} cy={-8} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={ex + look * 4} cy={-7} r={9.5} fill={KRP.ink} />
              <circle cx={ex + look * 4 - 3.5} cy={-11} r={3.5} fill={KRP.white} />
            </g>
          ))}
        </g>
      )}
      <circle cx={-4} cy={12} r={2.6} fill={KRP.ink} />
      <circle cx={4} cy={12} r={2.6} fill={KRP.ink} />
      {mouth === "smile" && <path d="M -8 23 Q 0 30 8 23" fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" />}
      {mouth === "o" && <ellipse cx={0} cy={25} rx={4.5} ry={5.5} fill={KRP.ink} />}
      {mouth === "suck" && <ellipse cx={-6 + look * 14} cy={23} rx={7} ry={6} fill={KRP.ink} />}
    </g>
  </g>
);
/* 座った子ザル (YawaE3 と同じ。closed=目を閉じる を足した)。原点は床 (お尻の下)。高さ約210 */
const L3dMonkeySit: React.FC<{ s?: number; f: number; look?: number; closed?: boolean; mouth?: "smile" | "o" | "suck" }> = ({ s = 1, f, look = 0, closed = false, mouth = "smile" }) => {
  const br = 1 + Math.sin(f / 7) * 0.015;
  return (
    <g transform={`scale(${s})`}>
      <L3dLimb d="M 30 -24 C 90 -20 124 -44 112 -92 C 106 -118 84 -116 88 -100" w={13} />
      <g transform={`translate(0 -78) scale(1 ${br}) translate(0 78)`}>
        <ellipse cx={0} cy={-78} rx={50} ry={58} fill={C.monkey} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={-68} rx={31} ry={40} fill={C.monkeyBelly} />
        <path d="M -44 -96 q 6 -4 10 2 M 36 -104 q 6 -4 10 2 M -46 -60 q 6 -4 10 2 M 38 -64 q 6 -4 10 2" fill="none" stroke={C.monkeyDark} strokeWidth={2.5} />
      </g>
      <ellipse cx={-34} cy={-28} rx={28} ry={21} fill={C.monkey} stroke={KRP.ink} strokeWidth={4} transform="rotate(-18 -34 -28)" />
      <ellipse cx={34} cy={-28} rx={28} ry={21} fill={C.monkey} stroke={KRP.ink} strokeWidth={4} transform="rotate(18 34 -28)" />
      <ellipse cx={-46} cy={-8} rx={25} ry={11} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3.5} />
      <ellipse cx={46} cy={-8} rx={25} ry={11} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3.5} />
      <L3dLimb d="M -40 -112 Q -60 -74 -26 -48" w={17} />
      <L3dLimb d="M 40 -112 Q 60 -74 26 -48" w={17} />
      <L3dPaw x={-24} y={-46} r={10} rot={150} />
      <L3dPaw x={24} y={-46} r={10} rot={-150} />
      <g transform={`translate(${look * 5} -160) rotate(${look * 9})`}>
        <L3dMonkeyHead look={look} closed={closed} mouth={mouth} />
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#141 【図】 ちなみに、どちらのお母さんも、中から温められていました。
// 設計: 2体のお母さんの断面図 (世界=研究所の設計図の青焼き)。どちらの胴の中にも電球 (温め)。温かさの波線。札「温め」
// どこ: 研究所の製図台の上。木の製図台に青焼きの設計図が画びょうで留めてある。三角定規・鉛筆・消しゴムのかす
// 演出: 青焼きの上で、2体の断面が上から下へ「切られて」中身が見える。胴の中の電球が左→右の順にぽっと灯り、温かさの輪が広がり、横の温度計の赤い柱がのぼる
// 動き: カメラはゆっくり寄る。f2〜14で断面の走査線が下りる、f10と16で電球が灯る、f18〜38で温度計がのぼる。温かさの波線は常にゆらゆらのぼる
const L3dBpMom: React.FC<{ kind: "wire" | "cloth"; on: number; f: number }> = ({ kind, on, f }) => {
  const L = C.bpLine;
  const by = -150;
  return (
    <g>
      {/* 台 (断面のハッチ) */}
      <rect x={-80} y={-24} width={160} height={24} fill="none" stroke={L} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-76 + i * 18} y1={-2} x2={-62 + i * 18} y2={-22} stroke={L} strokeWidth={2} opacity={0.7} />)}
      {kind === "wire" ? (
        <g>
          <rect x={-56} y={-236} width={112} height={212} rx={10} fill="none" stroke={L} strokeWidth={4.5} />
          {/* 針金の巻き (断面なので左右に丸い切り口) */}
          {Array.from({ length: 16 }, (_, i) => (
            <g key={i}>
              <circle cx={-56} cy={-36 - i * 12.5} r={4.5} fill={L} />
              <circle cx={56} cy={-36 - i * 12.5} r={4.5} fill={L} />
            </g>
          ))}
          <path d="M -40 -40 L 40 -220 M -40 -220 L 40 -40" stroke={L} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.6} />
          <rect x={-6} y={-262} width={12} height={28} fill="none" stroke={L} strokeWidth={3} />
          <rect x={-46} y={-334} width={92} height={76} rx={6} fill="none" stroke={L} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-42 + i * 16} y1={-262} x2={-30 + i * 16} y2={-330} stroke={L} strokeWidth={1.6} opacity={0.6} />)}
          <circle cx={-18} cy={-302} r={7} fill="none" stroke={L} strokeWidth={3} />
          <circle cx={18} cy={-302} r={7} fill="none" stroke={L} strokeWidth={3} />
        </g>
      ) : (
        <g>
          {/* 外のタオル地 (毛羽のでこぼこ) */}
          <rect x={-62} y={-240} width={124} height={220} rx={40} fill={L} opacity={0.14} stroke={L} strokeWidth={4.5} />
          {Array.from({ length: 20 }, (_, i) => (
            <circle key={i} cx={i % 2 ? 66 : -66} cy={-222 + Math.floor(i / 2) * 20} r={6} fill="none" stroke={L} strokeWidth={2.5} />
          ))}
          {/* 中の層 (スポンジ) と芯 (木) */}
          <rect x={-46} y={-224} width={92} height={190} rx={28} fill="none" stroke={L} strokeWidth={2.5} strokeDasharray="10 7" />
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={-30 + (i % 4) * 20} cy={-210 + Math.floor(i / 4) * 50} r={3} fill={L} opacity={0.5} />)}
          <rect x={-30} y={-210} width={60} height={160} rx={14} fill="none" stroke={L} strokeWidth={2.5} />
          <circle cx={0} cy={-292} r={50} fill={L} opacity={0.14} stroke={L} strokeWidth={4} />
          <circle cx={-17} cy={-298} r={8} fill="none" stroke={L} strokeWidth={3} />
          <circle cx={17} cy={-298} r={8} fill="none" stroke={L} strokeWidth={3} />
          <path d="M -10 -272 Q 0 -264 10 -272" fill="none" stroke={L} strokeWidth={3} />
        </g>
      )}
      {/* 温かさの輪 */}
      {on > 0 && (
        <g opacity={on}>
          <circle cx={0} cy={by} r={60 + Math.sin(f / 4) * 4} fill={C.heat} opacity={0.22} />
          {[0, 1, 2].map((k) => {
            const p = ((f * 2.2 + k * 30) % 90) / 90;
            return <circle key={k} cx={0} cy={by} r={28 + p * 90} fill="none" stroke={C.heat} strokeWidth={4} opacity={(1 - p) * 0.9} />;
          })}
        </g>
      )}
      {/* 電球 (胴の中) */}
      <rect x={-12} y={by + 18} width={24} height={20} fill="none" stroke={L} strokeWidth={3} />
      <circle cx={0} cy={by} r={22} fill={on > 0.5 ? C.bulb : "none"} stroke={on > 0.5 ? KRP.ink : L} strokeWidth={3.5} />
      <path d={`M -8 ${by + 6} q 4 -14 8 0 q 4 -14 8 0`} fill="none" stroke={on > 0.5 ? KRP.orange : L} strokeWidth={2.5} />
      {/* コード */}
      <path d={`M 0 ${by + 38} L 0 -12 Q 0 10 30 14 L 120 14`} fill="none" stroke={L} strokeWidth={3} strokeDasharray="12 6" />
      {/* 温かさの波線 (上へのぼる) */}
      {on > 0 && [-1, 0, 1].map((k) => {
        const ph = f / 3 + k * 2;
        const x0 = k * 34;
        return (
          <path key={k} d={`M ${x0} ${by - 34} q ${8 * Math.sin(ph)} -14 0 -28 q ${-8 * Math.sin(ph)} -14 0 -28 q ${8 * Math.sin(ph)} -14 0 -28`}
            fill="none" stroke={C.heat} strokeWidth={5} strokeLinecap="round" opacity={on * 0.95} />
        );
      })}
    </g>
  );
};
const L3dThermo: React.FC<{ x: number; y: number; v: number }> = ({ x, y, v }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-14} y={-260} width={28} height={250} rx={14} fill={C.bpDark} stroke={C.bpLine} strokeWidth={4} />
    <rect x={-6} y={-30 - 200 * v} width={12} height={200 * v + 30} rx={6} fill={KRP.red} />
    <circle cx={0} cy={0} r={26} fill={KRP.red} stroke={C.bpLine} strokeWidth={4} />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={18} y1={-40 - i * 24} x2={i % 2 ? 30 : 40} y2={-40 - i * 24} stroke={C.bpLine} strokeWidth={3} />)}
  </g>
);
const Yw141: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.07 * easeInOut(seg(f, 0, 42));
  const cut = easeOut(seg(f, 2, 14));
  const onL = easeOut(seg(f, 10, 15));
  const onR = easeOut(seg(f, 16, 21));
  const mL = easeOut(seg(f, 16, 36)) * 0.75;
  const mR = easeOut(seg(f, 20, 38)) * 0.75;
  const scanY = lerp(120, 830, cut);
  return (
    <Frame f={f} seed={3141} bg={C.draft}>
      <g transform={camT(900, 480, cam)}>
        {/* 製図台の木 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.draft} />
        <g stroke={C.draftDark} strokeWidth={5} opacity={0.45} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -60 ${30 + i * 150} q 480 ${rnd(141, i) * 40 - 20} 1000 0 q 480 ${rnd(142, i) * 40 - 20} 1000 0`} />
          ))}
        </g>
        {/* 青焼き */}
        <g transform="rotate(-0.8 960 480)">
          <rect x={130} y={60} width={1660} height={820} fill={C.bp} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.bpGrid} strokeWidth={1.5} opacity={0.7}>
            {Array.from({ length: 42 }, (_, i) => <line key={`v${i}`} x1={130 + i * 40} y1={60} x2={130 + i * 40} y2={880} />)}
            {Array.from({ length: 21 }, (_, i) => <line key={`h${i}`} x1={130} y1={60 + i * 40} x2={1790} y2={60 + i * 40} />)}
          </g>
          <rect x={160} y={90} width={1600} height={760} fill="none" stroke={C.bpLine} strokeWidth={3} />
          {/* 表題欄 */}
          <g transform="translate(1440 720)">
            <rect width={320} height={130} fill={C.bpDark} stroke={C.bpLine} strokeWidth={3} />
            <line x1={0} y1={44} x2={320} y2={44} stroke={C.bpLine} strokeWidth={2} />
            <line x1={170} y1={44} x2={170} y2={130} stroke={C.bpLine} strokeWidth={2} />
            <text x={160} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.bpLine}>断面 A-A</text>
            <text x={85} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.bpLine}>1958</text>
            {[64, 84, 104].map((ly) => <line key={ly} x1={190} y1={ly} x2={300} y2={ly} stroke={C.bpLine} strokeWidth={2} opacity={0.7} />)}
          </g>
          {/* 床の線 */}
          <line x1={200} y1={800} x2={1400} y2={800} stroke={C.bpLine} strokeWidth={4} />
          {Array.from({ length: 30 }, (_, i) => <line key={i} x1={210 + i * 40} y1={812} x2={226 + i * 40} y2={800} stroke={C.bpLine} strokeWidth={2} opacity={0.6} />)}
          {/* 高さの寸法線 */}
          <g stroke={C.bpLine} strokeWidth={2.5}>
            <line x1={300} y1={800} x2={300} y2={215} />
            <line x1={286} y1={215} x2={314} y2={215} />
            <line x1={286} y1={800} x2={314} y2={800} />
            <path d="M 300 215 l -8 18 l 16 0 Z M 300 800 l -8 -18 l 16 0 Z" fill={C.bpLine} />
          </g>
          {/* 2体の断面 (走査線より上だけ中が見える) */}
          <clipPath id="l3d141cut"><rect x={130} y={60} width={1660} height={scanY - 60} /></clipPath>
          {/* 切る前の外形 (点線) */}
          <g opacity={1 - cut} stroke={C.bpLine} strokeWidth={3} strokeDasharray="10 8" fill="none">
            <rect x={560 - 98} y={800 - 413} width={196} height={371} rx={16} />
            <rect x={1120 - 108} y={800 - 420} width={216} height={385} rx={60} />
          </g>
          <g clipPath="url(#l3d141cut)">
            <g transform="translate(560 800) scale(1.75)"><L3dBpMom kind="wire" on={onL} f={f} /></g>
            <g transform="translate(1120 800) scale(1.75)"><L3dBpMom kind="cloth" on={onR} f={f} /></g>
          </g>
          {cut < 1 && <line x1={150} y1={scanY} x2={1770} y2={scanY} stroke={KRP.red} strokeWidth={4} strokeDasharray="30 8 6 8" />}
          {/* 引き出し線のラベル */}
          <g stroke={C.bpLine} strokeWidth={2.5} fill="none">
            <path d="M 560 537 L 420 470 L 360 470" />
            <path d="M 1120 537 L 1270 470 L 1340 470" />
            <path d="M 1006 400 L 940 330 L 880 330" />
          </g>
          {[[330, 478, "電球"], [1380, 478, "電球"], [840, 338, "タオル地"]].map(([lx, ly, tx], i) => (
            <text key={i} x={lx as number} y={ly as number} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.bpLine}>{tx as string}</text>
          ))}
          <text x={560} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.bpLine}>針金</text>
          <text x={1120} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.bpLine}>布</text>
          {/* 温度計 */}
          <L3dThermo x={760} y={760} v={mL} />
          <L3dThermo x={1340} y={760} v={mR} />
        </g>
        {/* 画びょう */}
        {[[150, 80], [1770, 80], [152, 858], [1768, 858]].map(([px, py], i) => (
          <g key={i}>
            <circle cx={px} cy={py + 4} r={18} fill={KRP.ink} opacity={0.25} />
            <circle cx={px} cy={py} r={17} fill={i % 2 ? KRP.red : KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={px - 5} cy={py - 5} r={5} fill={KRP.white} opacity={0.8} />
          </g>
        ))}
        {/* 三角定規と鉛筆と消しゴム */}
        <g transform="translate(1560 300) rotate(12)">
          <path d="M 0 0 L 260 0 L 0 -200 Z" fill={C.glass} opacity={0.55} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 50 -24 L 160 -24 L 50 -110 Z" fill={C.bp} opacity={0.6} stroke={KRP.ink} strokeWidth={3} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={14 + i * 20} y1={0} x2={14 + i * 20} y2={-12} stroke={KRP.ink} strokeWidth={2.5} />)}
        </g>
        <g transform={`translate(${1500 + Math.sin(f / 9) * 6} 940) rotate(-8)`}>
          <rect x={-180} y={-14} width={300} height={28} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 120 -14 L 170 0 L 120 14 Z" fill={C.peg} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 156 -4 L 170 0 L 156 4 Z" fill={KRP.ink} />
          <rect x={-210} y={-14} width={30} height={28} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <rect x={60} y={920} width={110} height={56} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(10 115 948)" />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={200 + rnd(1411, i) * 120} cy={930 + rnd(1412, i) * 40} r={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />)}
      </g>
      <TagPlate x={840} y={650} text="温め" size={62} t={seg(f, 22, 30)} color={KRP.red} />
    </Frame>
  );
};

// ---- 文#142 【並】 子ザルが求めていたのは、触り心地と、温かさ。
// 設計: 子ザルが布のお母さんに頬をすり寄せる超アップ。タオル地の毛羽、温かいオレンジの光。札「触り心地」「温かさ」
// どこ: 飼育室の布のお母さんの胴の真横。画面の右半分はタオル地の壁のようなお母さんの胴。奥はぼけた温かい光
// 演出: 大きな丸い頭の子ザルが目を閉じて、頬をタオル地にぎゅっと押しあててすりすりする。小さな手がタオルの毛をつかむ。胴の奥の電球が透けて温かく光り、湯気のような波線と光の粒がのぼる
// 動き: f2〜14で頭が寄っていって頬がつく、そのあと上下にすりすり (頬がつぶれ、毛羽がなびく)。光は脈打ちながら強まる。カメラはゆっくり寄る
const Yw142: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.07 * easeInOut(seg(f, 0, 42));
  const near = easeOut(seg(f, 2, 14));
  const rub = near * Math.sin(f / 4);
  const glow = 0.55 + 0.45 * seg(f, 6, 24) + Math.sin(f / 6) * 0.05;
  const hx = lerp(700, 770, near), hy = 470 + rub * 14;
  const edgeX = (y: number) => 960 + Math.pow((y - 470) / 610, 2) * 160;
  return (
    <Frame f={f} seed={3142} bg={C.bedWood}>
      <g transform={camT(960, 480, cam)}>
        {/* 奥: ぼけた飼育室 (温かい光に染まったタイル) */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.warmDeep} />
        <g stroke={C.shavingDark} strokeWidth={10} opacity={0.35}>
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-60 + i * 150} y1={-60} x2={-60 + i * 150} y2={1140} />)}
          {Array.from({ length: 8 }, (_, i) => <line key={`h${i}`} x1={-60} y1={-40 + i * 150} x2={1000} y2={-40 + i * 150} />)}
        </g>
        {[520, 380, 250].map((r, i) => <circle key={i} cx={1380} cy={420} r={r * (0.9 + 0.1 * glow)} fill={C.bulb} opacity={(0.12 + i * 0.08) * glow} />)}
        {/* 布のお母さんの胴 (超アップのタオル地) */}
        <path d={`M ${edgeX(-60)} -60 ${Array.from({ length: 13 }, (_, i) => { const y = -60 + i * 100; return `L ${edgeX(y)} ${y}`; }).join(" ")} L 2000 1140 L 2000 -60 Z`}
          fill={C.towel} stroke={KRP.ink} strokeWidth={7} />
        {/* 中の電球が透ける (タオル全体がオレンジに温まる) */}
        <rect x={900} y={-60} width={1100} height={1200} fill={C.heat} opacity={0.14 * glow} />
        <circle cx={1450} cy={430} r={360} fill={C.heat} opacity={0.16 * glow} />
        <circle cx={1450} cy={430} r={230} fill={C.bulb} opacity={0.35 * glow} />
        <circle cx={1450} cy={430} r={120} fill={C.bulb} opacity={0.45 * glow} />
        {/* タオルのループ (パイル) */}
        {Array.from({ length: 70 }, (_, i) => {
          const col = i % 7, row = Math.floor(i / 7);
          const x = 1080 + col * 125 + (row % 2) * 60;
          const y = -20 + row * 112;
          const sw = Math.sin(f / 5 + i) * 4;
          return <path key={i} d={`M ${x} ${y} q ${10 + sw} -26 24 0 M ${x + 30} ${y + 34} q ${10 + sw} -26 24 0`} fill="none" stroke={C.towelDark} strokeWidth={5} strokeLinecap="round" />;
        })}
        {/* ふちの毛羽 (なびく) */}
        {Array.from({ length: 26 }, (_, i) => {
          const y = -40 + i * 46;
          const x = edgeX(y);
          const press = Math.abs(y - hy) < 150 ? near : 0;
          return <circle key={i} cx={x + Math.sin(f / 4 + i) * 3 - press * 10} cy={y + rub * press * 6} r={30 - press * 8} fill={C.towel} stroke={KRP.ink} strokeWidth={4} />;
        })}
        {/* 子ザルの体と肩 (下は画面の外) */}
        <ellipse cx={hx - 110} cy={980} rx={300} ry={260} fill={C.monkey} stroke={KRP.ink} strokeWidth={8} />
        <path d={`M ${hx - 300} 860 q 30 -20 50 4 M ${hx - 120} 800 q 30 -20 50 4 M ${hx + 40} 880 q 30 -20 50 4`} fill="none" stroke={C.monkeyDark} strokeWidth={5} />
        {/* 頭 (目を閉じて頬をすり寄せる) */}
        <g transform={`translate(${hx} ${hy}) rotate(${12 + rub * 2}) scale(${4.1 * (1 - near * 0.03)} 4.1)`}>
          <L3dMonkeyHead look={0.6} closed mouth="smile" />
        </g>
        {/* 頬の前に毛羽が少しかかる = 押しあてている */}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${edgeX(hy) - 6} ${hy - 90 + i * 34} q ${-22 - Math.sin(f / 3 + i) * 6} 6 -30 ${-10 + rub * 6}`}
            fill="none" stroke={C.towelDark} strokeWidth={5} strokeLinecap="round" opacity={near} />
        ))}
        {/* 手: タオルの毛をきゅっとつかむ */}
        <L3dLimb d={`M ${hx - 120} 800 Q ${hx + 60} 760 ${edgeX(700) + 30} 690`} w={60} />
        <g transform={`translate(${edgeX(690) + 40} ${686 + rub * 4})`}>
          <L3dPaw x={0} y={0} r={40} rot={70} />
        </g>
        {/* 温かさ: 波線と光の粒 */}
        {[0, 1, 2].map((k) => {
          const ph = f / 3 + k;
          const x0 = 1300 + k * 110;
          return <path key={k} d={`M ${x0} 330 q ${14 * Math.sin(ph)} -24 0 -48 q ${-14 * Math.sin(ph)} -24 0 -48 q ${14 * Math.sin(ph)} -24 0 -48`}
            fill="none" stroke={C.heat} strokeWidth={8} strokeLinecap="round" opacity={0.85 * glow} />;
        })}
        {Array.from({ length: 10 }, (_, i) => {
          const p = ((f * 1.2 + i * 9) % 60) / 60;
          return <circle key={i} cx={980 + rnd(1421, i) * 700} cy={700 - p * 600} r={6 + rnd(1422, i) * 6} fill={KRP.white} opacity={(1 - p) * 0.8} />;
        })}
        {/* すりすりの線 */}
        {near > 0.5 && [0, 1].map((k) => (
          <path key={k} d={`M ${edgeX(hy) - 40} ${hy - 260 - k * 30} q 20 ${-12 + rub * 8} 40 0`} fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        ))}
      </g>
      <TagPlate x={1330} y={770} text="触り心地" size={52} t={seg(f, 16, 24)} rot={-3} />
      <TagPlate x={1560} y={160} text="温かさ" size={52} t={seg(f, 24, 32)} color={KRP.red} rot={3} />
    </Frame>
  );
};

// ---- 文#143 【山】 つまり、抱っこされている感じ、だったのです。
// 設計: ★答えの初出。子ザルを、布のお母さんが包み込むように抱いている構図 (お母さんの腕を自分で描き足してもよい)。温かい光がふたりを包み、画面全体がやわらかく明るくなる。札「抱っこ」(大きく)
// どこ: 同じ飼育室 (タイル壁・緑の目地帯・木くずの床・左に窓とカーテン・右の壁にカルテ板)。最初はほの暗い
// 演出: 布のお母さんの前に子ザルがちょこんと座り、背中をお母さんのお腹にあずける。お母さんのタオル地の腕が左右から閉じて、子ザルのお腹の前でそっと重なる (= 抱っこ)。子ザルは目を閉じて小さな手でその腕をつかみ、お母さんは頭を傾けて見下ろす。閉じた瞬間に「ぎゅっ」の線、ハートがのぼる
// 動き: f4〜22で腕が閉じる。f14〜34で後光と光の筋が広がり、画面全体がほの暗→やわらかい明るさへ。カメラはふたりへゆっくり寄る。f26〜34で大きな「抱っこ」の札がぽんと出る
const Yw143: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.1 * easeInOut(seg(f, 0, 42));
  const wrap = easeInOut(seg(f, 4, 22));
  const bright = easeOut(seg(f, 14, 34));
  const squeeze = seg(f, 20, 28);
  const mx = 960, mb = 900, ms = 2.1;
  // 腕 (左)。右は x を鏡写し
  const arm = (sd: -1 | 1) => {
    const X = (x: number) => (sd === -1 ? x : 1920 - x);
    const P = [
      [835, 452], [lerp(760, 700, wrap), lerp(470, 520, wrap)],
      [lerp(650, 690, wrap), lerp(560, 712, wrap)], [lerp(640, 922, wrap), lerp(660, 728, wrap)],
    ].map(([x, y]) => [X(x), y]) as [number, number][];
    const d = `M ${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]} ${P[3][0]} ${P[3][1]}`;
    return { d, P };
  };
  const arms = [arm(-1), arm(1)];
  return (
    <Frame f={f} seed={3143} bg={C.tile}>
      <g transform={camT(960, 520, cam)}>
        {/* 飼育室 */}
        <L3dTiles x={-60} y={-60} w={W + 120} h={900} sz={72} fill={C.tile} line={C.tileLine} />
        <rect x={-60} y={600} width={W + 120} height={30} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={3} />
        {/* 窓とカーテン (左) */}
        <rect x={110} y={130} width={330} height={320} fill={C.sky} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 110 400 q 60 -40 120 -10 q 60 -40 120 -6 q 50 -20 90 6 L 440 450 L 110 450 Z" fill={C.tileTrim} />
        <line x1={275} y1={130} x2={275} y2={450} stroke={KRP.ink} strokeWidth={5} />
        <line x1={110} y1={290} x2={440} y2={290} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 90 110 L 200 110 Q ${170 + Math.sin(f / 10) * 8} 300 ${190 + Math.sin(f / 10) * 10} 480 L 90 480 Z`} fill={C.blanket} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 460 110 L 380 110 Q ${400 + Math.sin(f / 11) * 8} 300 ${384 + Math.sin(f / 11) * 10} 480 L 460 480 Z`} fill={C.blanket} stroke={KRP.ink} strokeWidth={5} />
        <rect x={70} y={96} width={410} height={18} rx={8} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="110,450 440,450 760,900 260,900" fill={C.sky} opacity={0.18 + bright * 0.12} />
        {/* カルテ板 (右の壁) */}
        <g transform={`translate(1640 640) rotate(${Math.sin(f / 14) * 1.5})`}>
          <rect x={-90} y={-130} width={180} height={240} rx={10} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-74} y={-110} width={148} height={204} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-34} y={-142} width={68} height={28} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          {[-80, -50, -20, 10, 40, 70].map((ly, i) => <line key={ly} x1={-60} y1={ly} x2={i % 2 ? 30 : 56} y2={ly} stroke={KRP.gray} strokeWidth={4} />)}
        </g>
        {/* 床 (木くず) */}
        <rect x={-60} y={630} width={W + 120} height={520} fill={C.shaving} />
        <line x1={-60} y1={630} x2={W + 60} y2={630} stroke={C.shavingDark} strokeWidth={6} />
        {Array.from({ length: 50 }, (_, i) => <path key={i} d={`M ${rnd(1431, i) * 1960} ${650 + rnd(1432, i) * 420} q 10 -12 24 0`} fill="none" stroke={C.shavingDark} strokeWidth={3} />)}
        {/* ほの暗さ (最初) */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.skyNight} opacity={0.28 * (1 - bright)} />
        {/* 光の筋 (ゆっくり回る) と後光 */}
        <g opacity={bright} transform={`rotate(${f * 0.4} 960 560)`}>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const a2 = a + 0.12;
            return <polygon key={i} points={`960,560 ${960 + Math.cos(a) * 1300},${560 + Math.sin(a) * 1300} ${960 + Math.cos(a2) * 1300},${560 + Math.sin(a2) * 1300}`} fill={C.bulb} opacity={0.22} />;
          })}
        </g>
        {[560, 440, 330, 230].map((r, i) => <circle key={i} cx={960} cy={560} r={r * (0.6 + 0.4 * bright)} fill={C.bulb} opacity={(0.08 + i * 0.06) * (0.3 + 0.7 * bright)} />)}
        <ellipse cx={mx} cy={mb + 4} rx={230} ry={20} fill={KRP.ink} opacity={0.18} />
        {/* 布のお母さん */}
        <g transform={`translate(${mx} ${mb})`}>
          <L3dClothMom s={ms} f={f} tilt={lerp(0, -9, wrap)} blushOn={bright} />
        </g>
        {/* 座る子ザル (背中をお母さんにあずける) */}
        <g transform={`translate(${mx} ${800 - squeeze * 4}) rotate(${-4 + Math.sin(f / 12) * 1})`}>
          <L3dMonkeySit s={1.55} f={f} closed={wrap > 0.6} look={wrap > 0.6 ? -0.2 : 0.3} mouth="smile" />
        </g>
        {/* お母さんの腕 (タオル地) */}
        {arms.map(({ d, P }, k) => (
          <g key={k}>
            <path d={d} fill="none" stroke={KRP.ink} strokeWidth={74} strokeLinecap="round" />
            <path d={d} fill="none" stroke={C.towel} strokeWidth={62} strokeLinecap="round" />
            {Array.from({ length: 9 }, (_, i) => {
              const t = 0.12 + i * 0.1;
              const x = bz(P[0][0], P[1][0], P[2][0], P[3][0], t);
              const y = bz(P[0][1], P[1][1], P[2][1], P[3][1], t);
              return <path key={i} d={`M ${x - 10} ${y + 4} q ${5 + Math.sin(f / 5 + i) * 2} -8 12 0`} fill="none" stroke={C.towelDark} strokeWidth={4} />;
            })}
            <circle cx={P[3][0]} cy={P[3][1]} r={40} fill={C.towel} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 子ザルの小さな手が、お母さんの腕をつかむ */}
        {wrap > 0.7 && (
          <g>
            <L3dPaw x={900} y={704} r={16} rot={10} />
            <L3dPaw x={1022} y={706} r={16} rot={-10} />
          </g>
        )}
        {/* ぎゅっ の線 */}
        {squeeze > 0 && squeeze < 1 && [-1, 1].map((sd) => (
          <g key={sd} opacity={1 - squeeze} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round">
            {[0, 1, 2].map((i) => (
              <line key={i} x1={960 + sd * (300 + i * 6)} y1={600 + i * 60} x2={960 + sd * (350 + squeeze * 30)} y2={590 + i * 66} />
            ))}
          </g>
        ))}
        {/* ハートがのぼる */}
        {[0, 1, 2, 3].map((k) => {
          const p = ((f + k * 11) % 44) / 44;
          return (
            <path key={k} d={heart} fill={KRP.red} stroke={KRP.ink} strokeWidth={2}
              transform={`translate(${960 + (k < 2 ? -1 : 1) * (330 + (k % 2) * 90) + Math.sin(p * 6 + k) * 20} ${520 - p * 300}) scale(${1.6 + k * 0.2})`}
              opacity={(1 - p) * seg(f, 20, 28)} />
          );
        })}
        {/* 部屋じゅうがやわらかく明るくなる */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.warmWash} opacity={0.26 * bright} />
      </g>
      <TagPlate x={1540} y={340} text="抱っこ" size={104} t={seg(f, 26, 34)} color={KRP.red} rot={-4} />
    </Frame>
  );
};

// ---- 文#144 【山】 冒頭の問いに、戻りましょう。人類が本当に欲しかったのは、柔らかさではなく、抱っこだったのかもしれません。
// 設計: ★序の #16 の博物館の展示ケースと同じ絵柄を呼び返す。裏返った「?」の木札が f でもう一度くるりと返って「抱っこ」になる。ケースの前の Person (#16 と同じ人) がはっとした顔 (surprised→smile)
// どこ: 序の #16 と同じ博物館 (緑の壁・天井のスポット・大理石の床・ビロードの展示ケース・5つの展示物と番号札・真鍮のロープ柵)
// 演出: 「？」のまま吊られていた木札が、くるりと回って「抱っこ」に変わる。札から温かい光が広がり、クッション・くま・スクイーズ・枕・毛布がひとつずつ温かく照らされる (= ぜんぶ同じ答えだった)。ケースの前の人 (#16 と同じ服・眼鏡) がはっとのけぞり、それから胸に手を当ててにっこりする
// 動き: f0〜10で札へ寄る、f10〜22で札が回る (止まったあと少し揺れる)、f22〜38でカメラが引いて人を見せる。光は f20〜36 で左右へ広がる
const L3dCam: React.FC<{ cx: number; cy: number; z: number; children?: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <g transform={`translate(960 540) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);
const L3dFeather: React.FC<{ x: number; y: number; s: number; rot: number }> = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 60 Q -34 0 0 -70 Q 34 0 0 60 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 0 80 L 0 -60" stroke={KRP.ink} strokeWidth={4} />
    {[-30, -6, 18].map((yy) => <path key={yy} d={`M 0 ${yy} l -16 -12 M 0 ${yy} l 16 -12`} stroke={KRP.gray} strokeWidth={3} />)}
  </g>
);
const Yw144: React.FC<{ f: number }> = ({ f }) => {
  const flip = easeInOut(seg(f, 10, 22));
  const c = Math.cos(Math.PI * flip);
  const swing = f >= 22 ? Math.sin((f - 22) / 2.2) * 7 * (1 - seg(f, 22, 40)) : 0;
  const zin = easeInOut(seg(f, 0, 10)), zout = easeOut(seg(f, 22, 38));
  const z = 1 + 0.12 * zin - 0.12 * zout;
  const cx = lerp(lerp(960, 900, zin), 960, zout);
  const cy = lerp(lerp(540, 420, zin), 540, zout);
  const SX = 900;
  const glow = easeOut(seg(f, 20, 36));
  const surprised = f >= 22 && f < 31;
  const happy = f >= 31;
  const items = [420, 640, 900, 1150, 1380];
  return (
    <Frame f={f} seed={3144} bg={C.museumWall}>
      <L3dCam cx={cx} cy={cy} z={z}>
        {/* 壁と腰壁 */}
        <rect x={-300} y={-200} width={2500} height={980} fill={C.museumWall} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-300 + i * 220} y={-200} width={8} height={980} fill={C.museumDark} />)}
        <rect x={-300} y={650} width={2500} height={130} fill={C.museumDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 天井の照明 */}
        <rect x={-300} y={-200} width={2500} height={250} fill={C.museumDark} />
        {[600, 900, 1200].map((lx, i) => (
          <g key={lx}>
            <polygon points={`${lx - 22},60 ${lx + 22},60 ${lx + 180 - i * 60 + 60},700 ${lx - 180 - i * 60 + 60},700`} fill={C.spot} opacity={0.13 + 0.03 * Math.sin(f / 8 + i)} />
            <rect x={lx - 30} y={30} width={60} height={36} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 大理石の床 */}
        <rect x={-300} y={780} width={2500} height={500} fill={C.marbleFloor} stroke={KRP.ink} strokeWidth={5} />
        {[830, 900, 1000].map((ly) => <line key={ly} x1={-300} y1={ly} x2={2200} y2={ly} stroke={C.marbleVein} strokeWidth={4} />)}
        {Array.from({ length: 15 }, (_, i) => <line key={i} x1={960 + (i - 7) * 160} y1={780} x2={960 + (i - 7) * 420} y2={1280} stroke={C.marbleVein} strokeWidth={4} />)}
        {/* ケースの台 */}
        <rect x={260} y={690} width={1280} height={150} rx={6} fill={C.caseWood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={290} y={720} width={1220} height={90} rx={4} fill="none" stroke={C.chairDark} strokeWidth={5} />
        {/* ケースの中 */}
        <rect x={280} y={150} width={1240} height={540} fill={C.velvet} stroke={KRP.ink} strokeWidth={7} />
        <rect x={280} y={590} width={1240} height={100} fill={C.velvetDark} />
        {/* 札から広がる温かい光 (展示物を順に照らす) */}
        <clipPath id="l3d144case"><rect x={280} y={150} width={1240} height={540} /></clipPath>
        <g clipPath="url(#l3d144case)">
          {[700, 520, 340].map((r, i) => <ellipse key={i} cx={SX} cy={400} rx={r * glow} ry={r * 0.6 * glow} fill={C.bulb} opacity={0.1 + i * 0.05} />)}
          {items.map((nx, i) => {
            const t = seg(f, 22 + Math.abs(nx - SX) / 60, 30 + Math.abs(nx - SX) / 60);
            return <ellipse key={nx} cx={nx} cy={600} rx={120} ry={50} fill={C.bulb} opacity={0.4 * t * (0.85 + 0.15 * Math.sin(f / 5 + i))} />;
          })}
        </g>
        {/* クッション */}
        <g transform="translate(420 680)">
          <path d="M -100 0 Q -112 -90 -96 -180 Q 0 -196 96 -180 Q 112 -90 100 0 Q 0 12 -100 0 Z" fill={C.cushion} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={-92} r={9} fill={C.cushionDark} stroke={KRP.ink} strokeWidth={3} />
          {[[-40, -130], [40, -130], [-40, -50], [40, -50]].map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r={6} fill={C.cushionDark} />)}
          <path d="M -60 -150 Q 0 -100 60 -150 M -60 -30 Q 0 -80 60 -30" stroke={C.cushionDark} strokeWidth={4} fill="none" />
        </g>
        {/* くまのぬいぐるみ */}
        <g transform={`translate(640 680) rotate(${Math.sin(f / 15) * 1.5})`}>
          <ellipse cx={0} cy={-70} rx={70} ry={74} fill={C.bear} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-62} rx={40} ry={44} fill={C.peg} />
          <ellipse cx={-62} cy={-20} rx={30} ry={22} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={62} cy={-20} rx={30} ry={22} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-70} cy={-250} r={26} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={70} cy={-250} r={26} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-200} r={74} fill={C.bear} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-178} rx={32} ry={24} fill={C.peg} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-26} cy={-214} r={8} fill={KRP.ink} />
          <circle cx={26} cy={-214} r={8} fill={KRP.ink} />
          <ellipse cx={0} cy={-186} rx={10} ry={7} fill={KRP.ink} />
          <path d="M -60 -110 Q -94 -100 -80 -70 M 60 -110 Q 94 -100 80 -70" stroke={KRP.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M -60 -110 Q -94 -100 -80 -70 M 60 -110 Q 94 -100 80 -70" stroke={C.bear} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M -30 -136 L 0 -124 L 30 -136 L 30 -112 L 0 -124 L -30 -112 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* スクイーズ (真ん中) */}
        <Squishy x={SX} y={680} s={0.62} f={f} />
        {/* 羽毛枕 */}
        <g transform="translate(1150 680)">
          <path d="M -120 0 Q -134 -60 -112 -110 Q 0 -128 112 -110 Q 134 -60 120 0 Q 0 14 -120 0 Z" fill={C.pillow} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -112 -110 l -16 -10 M 112 -110 l 16 -10 M -120 0 l -16 8 M 120 0 l 16 8" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -80 -60 Q 0 -40 80 -60" stroke={KRP.gray} strokeWidth={4} fill="none" />
          <L3dFeather x={60} y={-150 - Math.sin(f / 9) * 8} s={0.5} rot={30 + Math.sin(f / 7) * 20} />
        </g>
        {/* たたんだ毛布 */}
        <g transform="translate(1380 680)">
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-110 + i * 4} y={-50 - i * 50} width={220 - i * 8} height={50} rx={20} fill={i % 2 ? C.blanketDark : C.blanket} stroke={KRP.ink} strokeWidth={6} />
          ))}
          {[-80, -40, 0, 40, 80].map((lx) => <line key={lx} x1={lx} y1={-150} x2={lx} y2={-160} stroke={KRP.ink} strokeWidth={4} />)}
        </g>
        {/* 番号札 */}
        {items.map((nx, i) => (
          <g key={nx} transform={`translate(${nx} 712)`}>
            <polygon points="-40,-18 40,-18 46,18 -46,18" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>{`0${i + 1}`}</text>
          </g>
        ))}
        {/* 吊られた木札「?」→ くるりと返って「抱っこ」 */}
        <g transform={`rotate(${swing} ${SX} 150)`}>
          <line x1={SX - 130} y1={150} x2={SX - 130} y2={300} stroke={KRP.ink} strokeWidth={4} />
          <line x1={SX + 130} y1={150} x2={SX + 130} y2={300} stroke={KRP.ink} strokeWidth={4} />
          {glow > 0 && <ellipse cx={SX} cy={360} rx={260 + Math.sin(f / 4) * 8} ry={120} fill={C.bulb} opacity={0.35 * glow} />}
          <g transform={`translate(${SX} 360) scale(${Math.max(0.03, Math.abs(c))} 1)`}>
            <rect x={-190} y={-62} width={380} height={124} rx={12} fill={c >= 0 ? C.signBack : C.signWood} stroke={KRP.ink} strokeWidth={7} />
            <path d="M -170 -30 q 170 14 340 0 M -170 30 q 170 -12 340 0" stroke={C.chairDark} strokeWidth={4} fill="none" opacity={0.5} />
            {[-160, 160].map((hx) => <circle key={hx} cx={hx} cy={-40} r={8} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />)}
            {c >= 0 ? (
              <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} paintOrder="stroke">？</text>
            ) : (
              <text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} paintOrder="stroke">抱っこ</text>
            )}
          </g>
          {/* 返った瞬間のきらめき */}
          {f >= 22 && f < 34 && Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const p = seg(f, 22, 34);
            return <line key={i} x1={SX + Math.cos(a) * (210 + p * 40)} y1={360 + Math.sin(a) * (90 + p * 30)} x2={SX + Math.cos(a) * (240 + p * 70)} y2={360 + Math.sin(a) * (110 + p * 50)}
              stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={1 - p} />;
          })}
        </g>
        {/* ガラスの映り込み */}
        <g clipPath="url(#l3d144case)">
          {[0, 1].map((i) => {
            const gx = 200 + ((f * 9 + i * 700) % 1600);
            return <polygon key={i} points={`${gx},150 ${gx + 70},150 ${gx - 160},690 ${gx - 230},690`} fill={C.glass} opacity={0.18} />;
          })}
        </g>
        <rect x={280} y={150} width={1240} height={540} fill="none" stroke={C.glass} strokeWidth={10} opacity={0.6} />
        <rect x={280} y={150} width={1240} height={540} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <rect x={270} y={136} width={1260} height={20} rx={4} fill={C.caseWood} stroke={KRP.ink} strokeWidth={5} />
        {/* ロープ柵 */}
        {[200, 900, 1600].map((sx2) => (
          <g key={sx2}>
            <rect x={sx2 - 10} y={800} width={20} height={150} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={sx2} cy={796} r={16} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={sx2} cy={952} rx={40} ry={12} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 210 810 Q 550 880 890 810 M 910 810 Q 1250 880 1590 810" stroke={C.rope} strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* #16 と同じ人: はっとして → 胸に手を当ててにっこり */}
        {happy && <ellipse cx={1650} cy={700} rx={170} ry={260} fill={C.bulb} opacity={0.14 * seg(f, 31, 38)} />}
        <Person x={1650} y={980} s={1.6} f={f} cloth={C.cushionDark} clothDark={C.apronDark} glasses
          face={happy ? "smile" : surprised ? "surprised" : "normal"} gaze={[-1, -0.6]}
          pose={happy ? "hold" : surprised ? "banzai" : "armsFolded"} lean={surprised ? 6 * pop(seg(f, 22, 28)) : happy ? -3 : 0} />
        {surprised && [0, 1, 2].map((i) => (
          <line key={i} x1={1560 + i * 70} y1={560 - i * 40} x2={1520 + i * 60} y2={520 - i * 60}
            stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={seg(f, 22, 26)} />
        ))}
        {happy && [0, 1].map((k) => {
          const p = ((f - 31 + k * 9) % 18) / 18;
          return <path key={k} d={heart} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} transform={`translate(${1760 + k * 40} ${560 - p * 80}) scale(1.4)`} opacity={1 - p} />;
        })}
      </L3dCam>
    </Frame>
  );
};

// ---- 文#145 【並】 ただ、この研究には、影の部分もあります。
// 設計: 研究所の廊下。明るかった照明が f でひとつずつ落ち、長い影が伸びる。BGM が落ちる場面。人は後ろ姿のハーロウ1人
// どこ: 1950年代の研究所の長い廊下 (一点透視)。タイルの壁と緑の帯、左右の扉、リノリウムの床、天井の蛍光灯、奥の扉の上に「PRIMATE LAB」の標識
// 演出: 廊下の真ん中に白衣のハーロウの後ろ姿。奥の照明から順にチカチカして消えていき、手前の1灯だけが残る。その光で、彼の影が奥へ長く長く伸びる
// 動き: f6〜30で奥から1灯ずつ消える (消える前に2〜3コマまたたく)。暗さが一段ずつ増す。影は灯が消えるたびに伸びる。カメラはわずかに奥へ進む
const Yw145: React.FC<{ f: number }> = ({ f }) => {
  const P = (X: number, Y: number, z: number): [number, number] => [960 + (X * 960) / z, 430 + (Y * 650) / z];
  const pts = (a: [number, number][]) => a.map((p) => p.join(",")).join(" ");
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const lamps = [1.35, 2.0, 2.8, 3.8, 5.0];
  const offAt = [999, 30, 23, 16, 9];
  const lit = (i: number) => {
    const t = offAt[i];
    if (f < t - 3) return 1;
    if (f < t) return f % 2 ? 0.25 : 1;
    return 0;
  };
  const offCount = [1, 2, 3, 4].reduce((s, i) => s + (1 - lit(i)), 0);
  const dark = 0.5 * (offCount / 4);
  const grow = easeOut(seg(f, 8, 36));
  const zH = 1.7;
  const [hx, hy] = P(0, 1, zH);
  const shL = 40 + 190 * grow;
  const doorQ = (X: number, z1: number, z2: number) => pts([P(X, -0.35, z1), P(X, -0.35, z2), P(X, 1, z2), P(X, 1, z1)]);
  return (
    <Frame f={f} seed={3145} bg={C.dark} dark>
      <g transform={camT(960, 430, cam)}>
        {/* 天井・床・左右の壁・奥の壁 */}
        <polygon points={pts([P(-1, -1, 0.9), P(1, -1, 0.9), P(1, -1, 6), P(-1, -1, 6)])} fill={C.tileLine} />
        <polygon points={pts([P(-1, 1, 0.9), P(1, 1, 0.9), P(1, 1, 6), P(-1, 1, 6)])} fill={C.lino} />
        {[-1, 1].map((X) => (
          <g key={X}>
            <polygon points={pts([P(X, -1, 0.9), P(X, -1, 6), P(X, 1, 6), P(X, 1, 0.9)])} fill={C.tile} />
            {Array.from({ length: 12 }, (_, i) => {
              const Y = -0.8 + i * 0.16;
              const [x1, y1] = P(X, Y, 0.9), [x2, y2] = P(X, Y, 6);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.tileLine} strokeWidth={2.5} />;
            })}
            {Array.from({ length: 16 }, (_, i) => {
              const z = 1 * Math.pow(1.12, i);
              const [x1, y1] = P(X, -1, z), [x2, y2] = P(X, 1, z);
              return <line key={`v${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.tileLine} strokeWidth={2.5} />;
            })}
            <polygon points={pts([P(X, 0.12, 0.9), P(X, 0.12, 6), P(X, 0.22, 6), P(X, 0.22, 0.9)])} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ))}
        {/* 床の目地 */}
        {Array.from({ length: 9 }, (_, k) => {
          const X = -1 + k * 0.25;
          const [x1, y1] = P(X, 1, 0.9), [x2, y2] = P(X, 1, 6);
          return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.linoLine} strokeWidth={3} />;
        })}
        {Array.from({ length: 10 }, (_, i) => {
          const z = Math.pow(1.2, i);
          const [x1, y1] = P(-1, 1, z), [x2] = P(1, 1, z);
          return <line key={`h${i}`} x1={x1} y1={y1} x2={x2} y2={y1} stroke={C.linoLine} strokeWidth={3} />;
        })}
        {/* 扉 (左右) */}
        {([[-1, 1.5, 1.85], [1, 2.5, 2.9], [-1, 3.4, 3.8], [1, 4.4, 4.8]] as const).map(([X, z1, z2], i) => {
          const [wx1, wy1] = P(X, -0.15, z1 + 0.08), [wx2, wy2] = P(X, 0.1, z2 - 0.08);
          return (
            <g key={i}>
              <polygon points={doorQ(X, z1, z2)} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
              <polygon points={pts([[wx1, wy1], [wx2, wy1 + (wy2 - wy1) * 0.2], [wx2, wy2], [wx1, wy2 - (wy2 - wy1) * 0.2]])} fill={C.glass} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 奥の壁と扉と標識 */}
        <polygon points={pts([P(-1, -1, 6), P(1, -1, 6), P(1, 1, 6), P(-1, 1, 6)])} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={4} />
        <polygon points={pts([P(-0.35, -0.3, 6), P(0.35, -0.3, 6), P(0.35, 1, 6), P(-0.35, 1, 6)])} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={880} y={318} width={160} height={30} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <text x={960} y={340} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={19} fill={KRP.ink}>PRIMATE LAB</text>
        {/* 蛍光灯と光だまり */}
        {lamps.map((z, i) => {
          const L = lit(i);
          const [px, py] = P(0, 1, z);
          return (
            <g key={i}>
              <polygon points={pts([P(-0.22, -1, z - 0.1), P(0.22, -1, z - 0.1), P(0.22, -1, z + 0.1), P(-0.22, -1, z + 0.1)])}
                fill={L > 0.5 ? KRP.white : C.steel} stroke={KRP.ink} strokeWidth={3} />
              {L > 0 && (
                <g opacity={L}>
                  <polygon points={pts([P(-0.22, -1, z), P(0.22, -1, z), P(0.7, 1, z), P(-0.7, 1, z)])} fill={C.spot} opacity={0.12} />
                  <ellipse cx={px} cy={py} rx={(0.7 * 960) / z} ry={(0.18 * 650) / z} fill={C.spot} opacity={0.4} />
                </g>
              )}
            </g>
          );
        })}
        {/* 暗くなる */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.dark} opacity={dark} />
        {/* 手前の1灯だけが残る光 (ハーロウを後ろから照らす) */}
        <ellipse cx={960} cy={900} rx={560} ry={150} fill={C.spot} opacity={0.12 + 0.06 * Math.sin(f / 3)} />
        {/* 長く伸びる影 (奥へ) */}
        {(() => {
          // 手前左の灯りに照らされて、影は右奥へ。床の奥まで届くと、奥の壁を這いのぼる
          const tipY = Math.max(546, hy - shL);
          const tipX = hx + (hy - tipY) * 0.55;
          const climb = Math.max(0, (hy - shL) < 546 ? (546 - (hy - shL)) : 0) + 170 * seg(f, 26, 40);
          return (
            <g fill={KRP.ink} opacity={0.6}>
              <polygon points={`${hx - 44},${hy} ${hx + 44},${hy} ${tipX + 26},${tipY} ${tipX - 26},${tipY}`} />
              {climb > 0 && <rect x={tipX - 26} y={tipY - climb} width={52} height={climb} />}
              {climb > 0 && <ellipse cx={tipX} cy={tipY - climb} rx={34} ry={30} />}
            </g>
          );
        })()}
        {/* ハーロウ (後ろ姿) */}
        <Person x={hx} y={hy} s={1.5} f={f} phase={2} face="normal" cloth={KRP.white} clothDark={C.coatWhite} glasses hair="cap" still />
        <g transform={`translate(${hx} ${hy}) scale(1.5)`}>
          <circle cx={-62} cy={-222} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={62} cy={-222} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-230} r={64} fill={KRP.ink} />
          <path d="M -30 -270 q 30 -14 60 0" fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />
          <line x1={0} y1={-150} x2={0} y2={-60} stroke={C.coatWhite} strokeWidth={4} />
          <line x1={-40} y1={-96} x2={40} y2={-96} stroke={C.coatWhite} strokeWidth={5} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#146 【並】 ハーロウはその後、子ザルを親から引き離して孤立させる実験へと進み、強い批判を受けました。
// 設計: ★残酷な絵は描かない。暗い研究所の閉じた扉 (扉だけ)。扉の前に新聞が積まれ、見出しの位置に「批判」の札 (新聞の他の文字は線)。抗議の人々の影は描かない。静かで重い画面
// どこ: 夜の研究所の、閉ざされた鉄の扉の前。暗いタイル壁・暗い床。扉の上に網つきの小さな灯りがひとつ
// 演出: 扉は固く閉じ、網入りガラスの小窓の奥は暗い。扉の前の床には新聞が束になって積まれ、いちばん上の1部が扉に立てかけられて一面がこちらを向く。その見出しの位置に「批判」。上から新聞がまた1部、ばさりと落ちてくる
// 動き: f8〜18で新聞が1部落ちて束の上で跳ね、ほこりが立つ。扉の下のすき間の光が f16〜32 で消える。扉の上の灯りがかすかに揺れてまたたく。カメラは新聞へゆっくり寄る
const Yw146: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const drop = seg(f, 8, 16);
  const land = f >= 16;
  const bounce = land ? Math.sin(seg(f, 16, 22) * Math.PI) * 10 * (1 - seg(f, 16, 22)) : 0;
  const puff = seg(f, 16, 28);
  const crack = 1 - easeOut(seg(f, 16, 32));
  const lampSw = Math.sin(f / 9) * 3;
  const flick = (f % 23) < 2 ? 0.5 : 1;
  const DX = 1060;
  return (
    <Frame f={f} seed={3146} bg={C.dark} dark>
      <g transform={camT(860, 560, cam)}>
        {/* 暗いタイル壁 */}
        <L3dTiles x={-60} y={-60} w={W + 120} h={880} sz={80} fill={C.dark2} line={C.darkLine} />
        <rect x={-60} y={560} width={W + 120} height={24} fill={C.steelDark} />
        {/* 灯りの光 (扉の上から) */}
        <g transform={`rotate(${lampSw} ${DX} 70)`}>
          <polygon points={`${DX - 30},100 ${DX + 30},100 ${DX + 360},830 ${DX - 360},830`} fill={C.lampDim} opacity={0.1 * flick} />
          <line x1={DX} y1={-60} x2={DX} y2={70} stroke={KRP.ink} strokeWidth={5} />
          <rect x={DX - 30} y={66} width={60} height={14} fill={C.steelDark} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={DX} cy={100} r={24} fill={C.lampDim} opacity={flick} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M ${DX - 26} 84 Q ${DX} 140 ${DX + 26} 84 M ${DX} 80 L ${DX} 126 M ${DX - 18} 86 Q ${DX} 120 ${DX + 18} 86`} fill="none" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 床 */}
        <rect x={-60} y={820} width={W + 120} height={320} fill={C.steelDark} />
        <line x1={-60} y1={820} x2={W + 60} y2={820} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-200 + i * 280} y1={820} x2={-600 + i * 380} y2={1140} stroke={C.darkLine} strokeWidth={3} />)}
        {/* 扉の枠と鉄の扉 */}
        <rect x={DX - 300} y={150} width={600} height={680} fill={C.steelDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={DX - 260} y={186} width={520} height={636} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <rect x={DX - 220} y={500} width={440} height={260} rx={6} fill="none" stroke={C.steelDark} strokeWidth={5} />
        {/* 網入りガラスの小窓 (奥は真っ暗) */}
        <rect x={DX - 90} y={240} width={180} height={150} fill={C.dark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.darkLine} strokeWidth={2}>
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={DX - 90 + i * 36} y1={240} x2={DX - 90 + i * 36} y2={390} />)}
          {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1={DX - 90} y1={240 + i * 37} x2={DX + 90} y2={240 + i * 37} />)}
        </g>
        <line x1={DX - 70} y1={260} x2={DX - 30} y2={300} stroke={C.steel} strokeWidth={4} opacity={0.5} />
        {/* 名札と取っ手と鍵 */}
        <rect x={DX - 80} y={420} width={160} height={46} rx={6} fill={C.newsDark} stroke={KRP.ink} strokeWidth={4} />
        <text x={DX} y={453} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.ink}>研究室</text>
        <rect x={DX + 190} y={500} width={24} height={60} rx={6} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={DX + 120} y={512} width={92} height={20} rx={10} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={DX + 202} cy={590} r={9} fill={KRP.ink} />
        {[200, 800].map((hy) => <rect key={hy} x={DX - 276} y={hy} width={20} height={44} fill={C.steelDark} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 扉の下のすき間の光 (消えていく) */}
        <rect x={DX - 250} y={816} width={500} height={6} fill={C.lampDim} opacity={crack} />
        {/* 積まれた新聞の束 */}
        <g transform="translate(700 830)">
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={`translate(${(rnd(146, i) - 0.5) * 30} ${-i * 26}) rotate(${(rnd(147, i) - 0.5) * 5})`}>
              <rect x={-180} y={-26} width={360} height={26} rx={3} fill={i % 2 ? C.newsDark : C.news} stroke={KRP.ink} strokeWidth={4} />
              <line x1={-160} y1={-13} x2={150} y2={-13} stroke={C.newsLine} strokeWidth={2.5} />
            </g>
          ))}
          <path d="M -60 0 L -60 -182 M 60 0 L 60 -182" stroke={C.shavingDark} strokeWidth={5} />
        </g>
        {/* 扉に立てかけた1部 (一面がこちらを向く) */}
        <g transform="translate(720 648) rotate(-7)">
          <rect x={-190} y={-430} width={380} height={440} fill={C.news} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-170} y={-412} width={340} height={44} fill="none" stroke={KRP.ink} strokeWidth={3} />
          <line x1={-150} y1={-390} x2={150} y2={-390} stroke={KRP.ink} strokeWidth={8} />
          <line x1={-170} y1={-358} x2={170} y2={-358} stroke={KRP.ink} strokeWidth={3} />
          {/* 見出しの位置 (札が乗る) */}
          <rect x={-150} y={-344} width={300} height={90} fill={C.newsDark} opacity={0.6} />
          {/* 写真の枠 (中身は描かない) */}
          <rect x={-170} y={-236} width={160} height={130} fill={C.newsDark} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -170 -236 L -10 -106 M -10 -236 L -170 -106" stroke={C.newsLine} strokeWidth={2} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={10} y1={-228 + i * 16} x2={i % 3 === 2 ? 120 : 170} y2={-228 + i * 16} stroke={C.newsLine} strokeWidth={3} />)}
          {Array.from({ length: 6 }, (_, i) => (
            <g key={`c${i}`}>
              <line x1={-170} y1={-86 + i * 16} x2={-14} y2={-86 + i * 16} stroke={C.newsLine} strokeWidth={3} />
              <line x1={10} y1={-86 + i * 16} x2={170} y2={-86 + i * 16} stroke={C.newsLine} strokeWidth={3} />
            </g>
          ))}
          <line x1={0} y1={-236} x2={0} y2={0} stroke={C.newsLine} strokeWidth={2} />
        </g>
        {/* 落ちてくる1部 */}
        <g transform={`translate(${lerp(560, 740, drop)} ${land ? 640 - bounce : lerp(-120, 640, drop * drop)}) rotate(${land ? 4 : lerp(-40, 4, drop)})`}>
          <rect x={-170} y={-26} width={340} height={26} rx={3} fill={C.news} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-150} y1={-13} x2={150} y2={-13} stroke={C.newsLine} strokeWidth={2.5} />
          {!land && <path d="M -170 -26 q 40 -40 100 -20" fill={C.newsDark} stroke={KRP.ink} strokeWidth={3} />}
        </g>
        {/* ほこり */}
        {puff > 0 && puff < 1 && Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={740 + (i - 3) * 60 * (0.4 + puff)} cy={630 - puff * 40 - (i % 2) * 20} r={10 + puff * 18}
            fill="none" stroke={C.newsDark} strokeWidth={4} opacity={(1 - puff) * 0.8} />
        ))}
        {/* 床に散った1部 */}
        <g transform="translate(1420 812) rotate(6)">
          <rect x={-150} y={-18} width={300} height={22} rx={3} fill={C.newsDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 全体の重い暗さ */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.dark} opacity={0.18 + 0.1 * seg(f, 16, 36)} />
      </g>
      <TagPlate x={670} y={334} text="批判" size={64} t={seg(f, 24, 32)} color={KRP.red} rot={-7} />
    </Frame>
  );
};

// ---- 文#147 【並】 では、人間の赤ちゃんにとって、柔らかいものとは、何なのでしょうか。
// 設計: 夜の子ども部屋のベビーベッド。眠る赤ちゃん (小さな Person を寝かせる) の横に、毛布の切れはしと小さなぬいぐるみ。月明かり。`QMark`。第8章への引き
// どこ: 今の家の、夜の子ども部屋。星柄の壁紙・カーテンの窓と三日月・木のベビーベッド・頭上のモビール・床のラグ
// 演出: 月明かりの筋がベビーベッドに落ち、赤ちゃんがすやすや眠る。顔のそばには、端のほつれた毛布の切れはしと、小さなうさぎのぬいぐるみ。モビールがゆっくり回り、ベッドの上に「？」がふわりと浮かぶ (= 次の章の問い)
// 動き: モビールが回る・カーテンがゆれる・寝息で掛け布団がふくらむ・星がまたたく。f10〜34で月明かりがぬいぐるみと切れはしへ寄って明るくなる。f26〜34で「？」。カメラはゆっくり寄る
const Yw147: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const beam = 0.6 + 0.4 * easeOut(seg(f, 10, 34));
  const br = Math.sin(f / 8) * 5;
  const fx = 1210, fy = 652;
  return (
    <Frame f={f} seed={3147} bg={C.night} dark>
      <g transform={camT(980, 560, cam)}>
        {/* 星柄の壁 */}
        <rect x={-60} y={-60} width={W + 120} height={900} fill={C.nightWall} />
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i % 8) * 260 + (Math.floor(i / 8) % 2) * 130 - 20;
          const y = 40 + Math.floor(i / 8) * 160;
          const tw = 0.4 + 0.4 * Math.sin(f / 6 + i * 1.7);
          return <path key={i} d={`M ${x} ${y - 12} L ${x + 4} ${y - 4} L ${x + 12} ${y} L ${x + 4} ${y + 4} L ${x} ${y + 12} L ${x - 4} ${y + 4} L ${x - 12} ${y} L ${x - 4} ${y - 4} Z`} fill={C.nightWall2} opacity={tw + 0.3} />;
        })}
        <rect x={-60} y={760} width={W + 120} height={20} fill={C.cribDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 窓と三日月 */}
        <rect x={120} y={120} width={360} height={360} fill={C.skyNight} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={150 + rnd(1471, i) * 300} cy={150 + rnd(1472, i) * 300} r={3 + (Math.sin(f / 4 + i) > 0.6 ? 2 : 0)} fill={C.moon} />)}
        <circle cx={360} cy={220} r={52} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={384} cy={204} r={46} fill={C.skyNight} />
        <line x1={300} y1={120} x2={300} y2={480} stroke={KRP.ink} strokeWidth={5} />
        <line x1={120} y1={300} x2={480} y2={300} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 90 100 L 210 100 Q ${180 + Math.sin(f / 10) * 10} 300 ${200 + Math.sin(f / 10) * 14} 520 L 90 520 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 510 100 L 420 100 Q ${440 + Math.sin(f / 11) * 10} 300 ${424 + Math.sin(f / 11) * 14} 520 L 510 520 Z`} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        {[130, 160, 190].map((lx) => <line key={lx} x1={lx} y1={110} x2={lx + 8} y2={500} stroke={C.curtainDark} strokeWidth={4} />)}
        <rect x={70} y={86} width={460} height={18} rx={8} fill={C.cribDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 床とラグ */}
        <rect x={-60} y={780} width={W + 120} height={360} fill={C.cribDark} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-60} y1={800 + i * 40} x2={W + 60} y2={800 + i * 40} stroke={C.bedWoodDark} strokeWidth={3} />)}
        <ellipse cx={980} cy={900} rx={620} ry={110} fill={C.curtainDark} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={980} cy={900} rx={520} ry={80} fill="none" stroke={C.curtain} strokeWidth={6} strokeDasharray="20 12" />
        {/* 月明かりの筋 */}
        <polygon points="200,480 480,140 1420,600 1100,860" fill={C.moon} opacity={0.12 * beam} />
        {/* ベビーベッド: 奥の柵 */}
        <rect x={590} y={350} width={800} height={24} rx={10} fill={C.crib} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={618 + i * 48} y={372} width={14} height={232} fill={C.crib} stroke={KRP.ink} strokeWidth={3} />)}
        {[590, 1366].map((px) => <rect key={px} x={px - 6} y={330} width={36} height={300} rx={8} fill={C.crib} stroke={KRP.ink} strokeWidth={5} />)}
        {/* マットレス */}
        <polygon points="600,600 1380,600 1340,712 560,712" fill={C.mattress} stroke={KRP.ink} strokeWidth={5} />
        <rect x={560} y={712} width={780} height={30} fill={C.babyBlanketDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 月明かりの当たるところ */}
        <ellipse cx={980} cy={656} rx={300 * beam} ry={60} fill={C.moon} opacity={0.3 * beam} />
        {/* まくら */}
        <ellipse cx={1030} cy={664} rx={92} ry={38} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* うさぎのぬいぐるみ */}
        <g transform={`translate(840 ${676}) rotate(${-6 + Math.sin(f / 16) * 1.5})`}>
          <ellipse cx={-22} cy={-118} rx={14} ry={40} fill={C.bunny} stroke={KRP.ink} strokeWidth={4} transform="rotate(-10 -22 -118)" />
          <ellipse cx={22} cy={-118} rx={14} ry={40} fill={C.bunny} stroke={KRP.ink} strokeWidth={4} transform="rotate(12 22 -118)" />
          <ellipse cx={-22} cy={-116} rx={6} ry={26} fill={C.babyCloth} transform="rotate(-10 -22 -116)" />
          <ellipse cx={22} cy={-116} rx={6} ry={26} fill={C.babyCloth} transform="rotate(12 22 -116)" />
          <ellipse cx={0} cy={-30} rx={46} ry={40} fill={C.bunny} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-80} r={40} fill={C.bunny} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-14} cy={-84} r={5} fill={KRP.ink} />
          <circle cx={14} cy={-84} r={5} fill={KRP.ink} />
          <path d="M -6 -70 Q 0 -64 6 -70" fill="none" stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={-24} cy={-70} rx={7} ry={4} fill={C.blush} opacity={0.6} />
          <ellipse cx={24} cy={-70} rx={7} ry={4} fill={C.blush} opacity={0.6} />
          <path d="M -30 -10 q 30 10 60 0" fill="none" stroke={C.towelDark} strokeWidth={3} />
        </g>
        {/* 毛布の切れはし (端がほつれている) */}
        <g transform={`translate(950 690) rotate(${-14 + Math.sin(f / 12) * 1})`}>
          <path d="M -60 -30 L 50 -38 Q 64 -6 56 26 L -54 32 Q -66 0 -60 -30 Z" fill={C.scrap} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -40 -20 L 36 -26 M -42 0 L 40 -4 M -40 18 L 38 14" stroke={C.scrapDark} strokeWidth={3} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={56 - i * 2} y1={-30 + i * 10} x2={70 + Math.sin(f / 5 + i) * 3} y2={-32 + i * 11} stroke={C.scrapDark} strokeWidth={3} strokeLinecap="round" />)}
        </g>
        {/* 眠る赤ちゃん (Person を寝かせる) */}
        <g transform={`translate(${fx} ${fy}) rotate(-90)`}>
          <Person x={0} y={0} s={0.75} f={f} face="joy" cloth={C.babyCloth} clothDark={C.blush} hair="none" still />
        </g>
        {/* 掛け布団 (寝息でふくらむ) */}
        <path d={`M 1090 ${708} Q 1080 ${600 - br} 1150 ${596 - br} L 1270 ${598 - br * 0.6} Q 1320 ${610} 1316 ${708} Z`} fill={C.babyBlanket} stroke={KRP.ink} strokeWidth={5} />
        {[1140, 1190, 1240].map((lx) => <path key={lx} d={`M ${lx} ${610 - br * 0.8} q 10 40 0 90`} fill="none" stroke={C.babyBlanketDark} strokeWidth={4} />)}
        <path d={`M 1092 ${640 - br * 0.5} q 110 -14 222 0`} fill="none" stroke={KRP.white} strokeWidth={6} strokeDasharray="10 10" />
        {/* 手前の柵 */}
        <rect x={550} y={716} width={800} height={22} rx={10} fill={C.crib} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={576 + i * 48} y={736} width={14} height={90} fill={C.crib} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={550} y={820} width={800} height={22} rx={8} fill={C.crib} stroke={KRP.ink} strokeWidth={5} />
        {[550, 1326].map((px) => <rect key={px} x={px - 6} y={690} width={36} height={200} rx={8} fill={C.crib} stroke={KRP.ink} strokeWidth={5} />)}
        {/* モビール */}
        <path d="M 1384 340 L 1384 120 L 1040 120" fill="none" stroke={C.cribDark} strokeWidth={10} strokeLinecap="round" />
        <path d="M 1384 340 L 1384 120 L 1040 120" fill="none" stroke={KRP.ink} strokeWidth={3} />
        <line x1={1040} y1={120} x2={1040} y2={170} stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={1040} cy={176} rx={150} ry={16} fill="none" stroke={C.crib} strokeWidth={5} />
        {[0, 1, 2, 3].map((k) => {
          const a = f / 14 + (k * Math.PI) / 2;
          const x = 1040 + Math.cos(a) * 150, y = 176 + Math.sin(a) * 16;
          const front = Math.sin(a) > 0;
          const fill = [KRP.yellow, C.moon, KRP.white, C.babyCloth][k];
          return (
            <g key={k} opacity={front ? 1 : 0.75}>
              <line x1={x} y1={y} x2={x} y2={y + 70} stroke={KRP.ink} strokeWidth={2.5} />
              <g transform={`translate(${x} ${y + 96}) rotate(${Math.sin(f / 6 + k) * 10})`}>
                {k === 0 && <path d="M 0 -26 L 8 -8 L 26 -6 L 12 8 L 16 26 L 0 16 L -16 26 L -12 8 L -26 -6 L -8 -8 Z" fill={fill} stroke={KRP.ink} strokeWidth={3} />}
                {k === 1 && <path d="M 6 -26 A 26 26 0 1 0 6 26 A 20 20 0 1 1 6 -26 Z" fill={fill} stroke={KRP.ink} strokeWidth={3} />}
                {k === 2 && <path d="M -26 10 q -4 -20 14 -18 q 6 -16 22 -6 q 18 -4 16 14 q 6 10 -6 10 Z" fill={fill} stroke={KRP.ink} strokeWidth={3} />}
                {k === 3 && <path d={heart} transform="scale(1.6)" fill={fill} stroke={KRP.ink} strokeWidth={2} />}
              </g>
            </g>
          );
        })}
        {/* 寝息 */}
        {[0, 1].map((k) => {
          const p = ((f + k * 20) % 40) / 40;
          return <circle key={k} cx={1000 - p * 40} cy={570 - p * 90} r={6 + p * 8} fill="none" stroke={C.moon} strokeWidth={3} opacity={(1 - p) * 0.8} />;
        })}
      </g>
      <QMark x={1580} y={460} s={1.4} f={f} t={seg(f, 26, 34)} color={C.moon} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_141: (f) => <Yw141 f={f} />,
  yw_142: (f) => <Yw142 f={f} />,
  yw_143: (f) => <Yw143 f={f} />,
  yw_144: (f) => <Yw144 f={f} />,
  yw_145: (f) => <Yw145 f={f} />,
  yw_146: (f) => <Yw146 f={f} />,
  yw_147: (f) => <Yw147 f={f} />,
};

export const YW_E4_MOTIFS: string[] = [
  "yw_141",
  "yw_142",
  "yw_143",
  "yw_144",
  "yw_145",
  "yw_146",
  "yw_147",
];

export const yawaE4Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
