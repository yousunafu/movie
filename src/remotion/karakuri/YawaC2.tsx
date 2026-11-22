// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#50〜#61 (12文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-2.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L1b。
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
  // 白鳥・布人形 (YawaC1 と同じ色)
  felt: "#F5F0E4", feltShade: "#DCD3C0", featherBlack: "#2E2A27", rust: "#A2543A", deerHair: "#9A6B43",
  linen: "#DCCDAE", linenShade: "#BFAE8A", linenDark: "#9C8A68", woolRed: "#B0675A", woolBrown: "#7E5A48",
  bead: "#3E7FB8", beadDeep: "#22588A",
  // 断面の詰め物
  cavity: "#6B5642", ragIndigo: "#4F6A8E", ragOchre: "#C9963E", ragGreen: "#7E9467", ragRose: "#C98C8C",
  ragUmber: "#8B6A52", papyrus: "#D4B06A", papyrusDark: "#A9843F", papyrusGreen: "#6F8E4A", papyrusGreenDark: "#4E6B33",
  // 博物館
  museumDark: "#2A2622", museumWall: "#3A332D", wallWarm: "#D9CBB0", wallWainscot: "#A88F6E",
  panelPaper: "#F3EBD8", panelGrid: "#CBBF9F", frameWood: "#6E4E36", frameWoodDark: "#4E3524",
  storeWall: "#5B6468", storeGray: "#9AA3A8", storeDark: "#6F777C", tissue: "#F4F0E6", acrylic: "#DCEBEF",
  coat: "#F4F1EA", coatDark: "#D4CFC4", plinthTop: "#8A6446",
  // エジプトの砂
  skyHot: "#F5E6B8", skyHot2: "#EBD69C", sand: "#E2C58E", sandDark: "#C8A56B", sandLight: "#EED9AE",
  sandDeep: "#B8955E", sandMid: "#D4B47D", mudbrick: "#B98A5E", mudbrickDark: "#8E6644",
  palm: "#5E7D3E", palmTrunk: "#8A6A44", shard: "#C0703F", rainCloud: "#8D949C", rainCloudDark: "#6E757D", rain: "#8FB8D8",
  // ロンドン
  skyGray: "#BFC5CA", skyGray2: "#A9B0B6", cloudGray: "#D7DBDE", portland: "#E6E0D2", portlandShade: "#C8C0AE",
  portico: "#8F877A", busRed: "#C8312A", busRedDark: "#93231E", ujBlue: "#25407A", railBlack: "#3E3A36", road: "#8E9196",
  // ぬいぐるみ
  bearFur: "#B9874F", bearDark: "#8E6238", bearMuzzle: "#E3C79C", spot: "#FFF4D2",
  // 机・金貨
  deskWood: "#9C6E45", deskWoodDark: "#76502F", plaster: "#E2D3B4", plasterShade: "#C4B08C",
  // ローマ
  romeSky: "#F3D9A8", romeSky2: "#E9B98A", roofTile: "#C2593A", roofTileDark: "#8F3D26",
  travertine: "#E8DCC2", travertineShade: "#CDBD9C", stucco: "#EAD7B3", stuccoShade: "#CDB48A",
  cypress: "#4B6A3E", cypressDark: "#34502C", hillFar: "#C9A98A", pave: "#CFC3A8", paveDark: "#AE9F82",
  tunicRed: "#B8382B", tunicRedDark: "#8A2A20", bronzeHelm: "#C1924D", bronzeHelmDark: "#8E6A35",
  toga: "#EDE6D6", togaDark: "#CFC6B0", water: "#9DC3D2", loaf: "#C98A45", loafDark: "#9A6330",
  // 寝室
  pompRed: "#A8392C", pompRedDark: "#7E2A20", pompBlack: "#2F2A26", pompOchre: "#D9A746",
  mosaicW: "#EDE5D3", mosaicB: "#3A332D", garden: "#8DAE6A", gardenDark: "#5E7E45",
  cushion: "#8E5C86", cushionDark: "#6A4064", mattress: "#D8C8A8", goldTrim: "#D9B23C",
  // 書斎
  shelfWood: "#7E5A3A", scroll: "#EADBB5", scrollEdge: "#B99E6C", scrollRod: "#6B4A2E",
  lampBronze: "#B9863F", flame: "#FFB648", flameCore: "#FFF0B0", vesuvius: "#8C8A9A", vesuviusDark: "#6E6B7C", bay: "#8FB4C4",
  elderHair: "#D8D4CC",
  // 地図
  parch: "#E8D3A6", parchDark: "#C9AD78", parchBurn: "#8E6A3C", sea: "#A9C4C0", seaDeep: "#7FA3A0",
  forest: "#5B7A4A", forestDark: "#3F5A35", romeRed: "#C9634F", river: "#7FA3B0", alp: "#B9A98C",
  // 市場
  awningA: "#C8553D", awningB: "#F1E3C6", counter: "#D8CFC0", marbleVein: "#B9B2A6",
  sack: "#CDB78E", sackDark: "#A68F65", silverDark: "#8E959B", amphora: "#B9714A", amphoraDark: "#8C5234",
  goose: "#FBFAF6", gooseShade: "#E2DED4", bill: "#E8923A",
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
const cam = (cx: number, cy: number, k: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${k}) translate(${-cx} ${-cy})`;

// Person と同じ揺れで重ねる (兜・トーガ・白髪を Person の座標で描く)
const L1bOver: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; lean?: number; children?: React.ReactNode }> = ({
  x, y, s, f, phase = 0, lean = 0, children,
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

// ローマ兵の兜 (Person 座標)
const L1bHelmet: React.FC = () => (
  <g>
    <path d="M -14 -318 Q -20 -384 0 -388 Q 20 -384 14 -318 Z" fill={C.tunicRed} stroke={KRP.ink} strokeWidth={4.5} />
    {[-8, 0, 8].map((dx) => <line key={dx} x1={dx} y1={-326} x2={dx * 1.3} y2={-376} stroke={C.tunicRedDark} strokeWidth={3} />)}
    <rect x={-7} y={-326} width={14} height={14} fill={C.bronzeHelmDark} stroke={KRP.ink} strokeWidth={3} />
    <path d="M -68 -238 Q -72 -314 0 -318 Q 72 -314 68 -238 Z" fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -40 -296 Q 0 -312 40 -296" fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.45} strokeLinecap="round" />
    <rect x={-74} y={-250} width={148} height={14} rx={7} fill={C.bronzeHelmDark} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -72 -244 L -50 -244 L -46 -192 Q -58 -178 -72 -194 Z" fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 72 -244 L 50 -244 L 46 -192 Q 58 -178 72 -194 Z" fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={4} />
    {[-60, 60].map((cx) => <circle key={cx} cx={cx} cy={-226} r={4} fill={C.bronzeHelmDark} />)}
  </g>
);

// トーガ (Person 座標。cloth も toga 色にして使う)
const L1bToga: React.FC<{ c?: string; d?: string }> = ({ c = C.toga, d = C.togaDark }) => (
  <g>
    <path d="M -60 -62 L 60 -62 L 68 -10 L -68 -10 Z" fill={c} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    {[-36, -10, 18, 42].map((fx) => <path key={fx} d={`M ${fx} -58 Q ${fx + 4} -34 ${fx - 2} -14`} fill="none" stroke={d} strokeWidth={3.5} />)}
    <path d="M -58 -162 Q -30 -168 -14 -160 L 60 -82 L 60 -56 L 34 -56 L -58 -144 Z" fill={d} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -40 -150 L 40 -70" stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
  </g>
);

// 年配の白髪とひたいのしわ (Person 座標。hair="none" と使う)
const L1bElder: React.FC = () => (
  <g>
    <path d="M -64 -214 Q -74 -248 -56 -268 Q -50 -250 -48 -232 Q -56 -222 -64 -214 Z" fill={C.elderHair} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M 64 -214 Q 74 -248 56 -268 Q 50 -250 48 -232 Q 56 -222 64 -214 Z" fill={C.elderHair} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -22 -262 Q 0 -268 22 -262" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
    <path d="M -16 -252 Q 0 -257 16 -252" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
    <path d="M -40 -204 q 6 4 12 0" fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.45} />
    <path d="M 28 -204 q 6 4 12 0" fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.45} />
  </g>
);

// ガチョウの羽根 1枚 (上向き。s=1 で長さ約170px)
const L1bFeather: React.FC<{ x: number; y: number; s?: number; rot?: number; op?: number }> = ({ x, y, s = 1, rot = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <path d="M 0 8 Q -30 -40 -22 -110 Q -14 -150 2 -162 Q 22 -132 24 -80 Q 26 -22 0 8 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
    {[-130, -105, -80, -55, -30].map((by, i) => (
      <g key={i} stroke={C.gooseShade} strokeWidth={2.5}>
        <line x1={1} y1={by} x2={-18} y2={by + 16} /><line x1={2} y1={by} x2={19} y2={by + 18} />
      </g>
    ))}
    <path d="M 0 30 Q 2 -60 2 -158" fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" />
    {[-1, 1].map((d) => <path key={d} d={`M 0 4 q ${d * 12} -4 ${d * 16} 6`} fill="none" stroke={C.gooseShade} strokeWidth={3} />)}
  </g>
);

// 白いガチョウ (横向き)。x,y: 足元 / dir 1=右向き / s=1 で高さ約190px
const L1bGoose: React.FC<{ x: number; y: number; s?: number; f: number; dir?: 1 | -1; phase?: number; peck?: number }> = ({
  x, y, s = 1, f, dir = 1, phase = 0, peck = 0,
}) => {
  const step = Math.sin((f + phase * 9) / 3.2);
  const bob = Math.abs(step) * 4;
  const neckP = peck > 0 ? `M 40 -96 Q 90 -100 96 -50` : "M 40 -96 Q 62 -130 52 -160";
  const head: [number, number] = peck > 0 ? [100, -44] : [58, -166];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      <ellipse cx={0} cy={0} rx={70} ry={8} fill={KRP.ink} opacity={0.14} />
      <g stroke={C.bill} strokeWidth={6} strokeLinecap="round">
        <line x1={-6} y1={-36} x2={-8 + step * 8} y2={-6} /><line x1={14} y1={-36} x2={16 - step * 8} y2={-6} />
      </g>
      <path d={`M ${-22 + step * 8} -4 l 18 0 l -6 -6 Z`} fill={C.bill} stroke={KRP.ink} strokeWidth={2.5} />
      <path d={`M ${2 - step * 8} -4 l 18 0 l -6 -6 Z`} fill={C.bill} stroke={KRP.ink} strokeWidth={2.5} />
      <g transform={`translate(0 ${-bob})`}>
        <path d="M -72 -76 L -104 -96 L -80 -56 Z" fill={C.goose} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -72 -62 Q -82 -112 -20 -114 Q 40 -116 60 -86 Q 70 -60 40 -40 Q 0 -26 -50 -36 Q -86 -44 -72 -62 Z"
          fill={C.goose} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -44 -92 Q 10 -106 40 -80 Q 0 -58 -48 -66 Z" fill={C.gooseShade} stroke={KRP.ink} strokeWidth={3.5} />
        <path d="M -30 -84 Q 0 -90 24 -78" fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
        <path d={neckP} fill="none" stroke={KRP.ink} strokeWidth={28} strokeLinecap="round" />
        <path d={neckP} fill="none" stroke={C.goose} strokeWidth={19} strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={17} fill={C.goose} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={neckP} fill="none" stroke={C.goose} strokeWidth={18} strokeLinecap="round" opacity={0.95} />
        <path d={`M ${head[0] + 12} ${head[1] - 6} L ${head[0] + 40} ${head[1] + 2} L ${head[0] + 12} ${head[1] + 8} Z`}
          fill={C.bill} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
        <circle cx={head[0] + 4} cy={head[1] - 4} r={3.5} fill={KRP.ink} />
      </g>
    </g>
  );
};

// デナリウス銀貨 (真上から)。s=1 で直径60px
const L1bDenarius: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle r={30} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
    <circle r={24} fill="none" stroke={C.silverDark} strokeWidth={2} strokeDasharray="3 3" />
    <path d="M -6 -16 Q 8 -18 10 -6 Q 14 -2 10 2 Q 12 10 4 12 L 2 18 L -10 18 Q -14 4 -12 -6 Q -12 -14 -6 -16 Z" fill={C.silverDark} />
    <path d="M -16 -12 q 6 -10 16 -8" fill="none" stroke={C.silverDark} strokeWidth={2} />
  </g>
);

// 銀貨・金貨の横向き (積むとき)。y は下面
const L1bCoinSide: React.FC<{ x: number; y: number; w?: number; fill?: string; dark?: string }> = ({ x, y, w = 60, fill = KRP.silver, dark = C.silverDark }) => (
  <g>
    <rect x={x - w / 2} y={y - 12} width={w} height={12} fill={dark} stroke={KRP.ink} strokeWidth={3} />
    {Array.from({ length: 7 }, (_, i) => <line key={i} x1={x - w / 2 + 6 + i * (w - 12) / 6} y1={y - 11} x2={x - w / 2 + 6 + i * (w - 12) / 6} y2={y - 1} stroke={KRP.ink} strokeWidth={1.5} opacity={0.4} />)}
    <ellipse cx={x} cy={y - 12} rx={w / 2} ry={7} fill={fill} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 巻物 (丸めた状態・横から見た円筒)。x,y: 中心 / len: 長さ
const L1bScroll: React.FC<{ x: number; y: number; len?: number; r?: number; rot?: number; tag?: string }> = ({ x, y, len = 140, r = 16, rot = 0, tag }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-len / 2} y={-r} width={len} height={r * 2} fill={C.scroll} stroke={KRP.ink} strokeWidth={3.5} />
    <line x1={-len / 2 + 10} y1={-r * 0.3} x2={len / 2 - 10} y2={-r * 0.3} stroke={C.scrollEdge} strokeWidth={2.5} />
    <ellipse cx={len / 2} cy={0} rx={r * 0.45} ry={r} fill={C.scrollEdge} stroke={KRP.ink} strokeWidth={3} />
    <circle cx={len / 2} cy={0} r={r * 0.3} fill={C.scrollRod} />
    {tag && (
      <g>
        <line x1={len / 2} y1={r * 0.6} x2={len / 2 + 6} y2={r + 14} stroke={KRP.ink} strokeWidth={2} />
        <rect x={len / 2 - 14} y={r + 14} width={40} height={22} rx={3} fill={C.parch} stroke={KRP.ink} strokeWidth={2.5} />
        <text x={len / 2 + 6} y={r + 31} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={14} fill={KRP.ink}>{tag}</text>
      </g>
    )}
  </g>
);

// -------------------------------------------------------------------
// L1bSwan — パジリクのフェルトの白鳥 (YawaC1 の L1aSwan の写し。見た目をそろえる)
// -------------------------------------------------------------------
const SWAN_BODY = "M -195 -205 Q -150 -185 -120 -182 Q -40 -205 60 -195 Q 140 -185 145 -140 Q 140 -95 70 -82 Q -30 -68 -110 -92 Q -160 -110 -175 -150 Q -185 -180 -195 -205 Z";
const SWAN_NECK = "M 96 -168 Q 150 -228 122 -268 Q 92 -308 114 -344";
const L1bSwan: React.FC<{
  x: number; y: number; s?: number; f: number; turn?: number; section?: boolean; clipId?: string;
}> = ({ x, y, s = 1, f, turn = 1, section = false, clipId = "l1b-swan-clip" }) => {
  const sway = Math.sin(f / 16) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * turn} ${s})`}>
      {[-34, 16].map((lx, i) => (
        <g key={i}>
          <rect x={lx} y={section ? -150 : -96} width={16} height={section ? 150 : 96} rx={5}
            fill={YP.wood} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={lx + 8} y1={-80} x2={lx + 8} y2={-6} stroke={YP.woodDark} strokeWidth={3} opacity={0.6} />
        </g>
      ))}
      <g transform={`rotate(${sway} 0 -140)`}>
        <path d={SWAN_BODY} fill={C.felt} stroke={KRP.ink} strokeWidth={6.5} strokeLinejoin="round" />
        <path d={SWAN_NECK} fill="none" stroke={KRP.ink} strokeWidth={48} strokeLinecap="round" />
        <path d={SWAN_NECK} fill="none" stroke={C.felt} strokeWidth={36} strokeLinecap="round" />
        <circle cx={122} cy={-350} r={30} fill={C.felt} stroke={KRP.ink} strokeWidth={6} />
        <path d={SWAN_NECK} fill="none" stroke={C.felt} strokeWidth={34} strokeLinecap="round" opacity={0.95} />
        {section ? (
          <>
            <clipPath id={clipId}>
              <path d={SWAN_BODY} transform="translate(-20 -140) scale(0.82) translate(20 140)" />
            </clipPath>
            <path d={SWAN_BODY} transform="translate(-20 -140) scale(0.82) translate(20 140)" fill={C.deerHair} stroke={KRP.ink} strokeWidth={4} />
            <g clipPath={`url(#${clipId})`}>
              {Array.from({ length: 46 }, (_, i) => {
                const cx = -180 + rnd(42, i) * 320;
                const cy = -200 + rnd(43, i) * 130;
                const w = Math.sin(f / 7 + i) * 2;
                return (
                  <path key={i} d={`M ${cx} ${cy} q 9 ${-11 + w} 18 0 q 9 ${11 - w} 18 0`}
                    fill="none" stroke={YP.furDark} strokeWidth={3.5} strokeLinecap="round" />
                );
              })}
            </g>
            <path d={SWAN_NECK} fill="none" stroke={C.deerHair} strokeWidth={16} strokeLinecap="round" />
            <path d={SWAN_NECK} fill="none" stroke={YP.furDark} strokeWidth={3} strokeDasharray="6 8" />
            <circle cx={122} cy={-350} r={15} fill={C.deerHair} />
          </>
        ) : (
          <>
            <path d="M -110 -172 Q -10 -194 78 -150 Q 20 -116 -96 -122 Q -130 -142 -110 -172 Z"
              fill={C.feltShade} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            <path d="M -96 -160 Q -10 -176 58 -146" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="8 7" opacity={0.55} />
            <path d="M -150 -112 Q -40 -80 100 -98" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="8 7" opacity={0.5} />
            {Array.from({ length: 6 }, (_, i) => (
              <path key={i} d={`M ${-90 + i * 26} -128 l 10 -16 l 10 16 Z`} fill={C.rust} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
            <path d="M -190 -200 Q -168 -186 -150 -184 L -160 -170 Q -176 -178 -186 -190 Z" fill={C.rust} opacity={0.85} />
          </>
        )}
        <path d="M 146 -360 Q 176 -356 196 -344 Q 172 -334 146 -338 Z" fill={C.featherBlack} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        {!section && <>
          <circle cx={130} cy={-358} r={6} fill={C.featherBlack} />
          <circle cx={132} cy={-360} r={2} fill={KRP.white} />
        </>}
      </g>
    </g>
  );
};

// -------------------------------------------------------------------
// L1bDoll — オクシュリンコスの麻の布人形 (YawaC1 の L1aDoll の写し)。x,y: 底 / s=1 で高さ約380px
//   detail: ルーペで見る用 (毛糸の毛羽・縫い穴) / glint: ガラス玉のきらめき 0〜1
// -------------------------------------------------------------------
const DOLL_BODY = "M -60 -238 Q -84 -226 -84 -190 L -96 -24 Q -98 0 -70 2 L 70 2 Q 98 0 96 -24 L 84 -190 Q 84 -226 60 -238 Q 30 -250 0 -250 Q -30 -250 -60 -238 Z";
const L1bDoll: React.FC<{ x: number; y: number; s?: number; f: number; light?: number; rot?: number; clipId: string; detail?: boolean; glint?: number }> = ({
  x, y, s = 1, f, light = -2, rot = 0, clipId, detail = false, glint = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <clipPath id={clipId}>
      <path d={DOLL_BODY} />
      <ellipse cx={0} cy={-312} rx={64} ry={68} />
      <rect x={-162} y={-232} width={324} height={44} rx={22} />
    </clipPath>
    <rect x={-162} y={-232} width={324} height={44} rx={22} fill={C.linenShade} stroke={KRP.ink} strokeWidth={5} />
    {[-162, 162].map((ex, i) => (
      <g key={i}>
        <ellipse cx={ex + (i ? -6 : 6)} cy={-210} rx={12} ry={22} fill={C.linen} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${ex + (i ? -6 : 6)} -222 q ${i ? 6 : -6} 12 0 20`} fill="none" stroke={C.linenDark} strokeWidth={3} />
      </g>
    ))}
    {[-130, -100, 100, 130].map((bx) => (
      <line key={bx} x1={bx} y1={-230} x2={bx + 6} y2={-190} stroke={C.linenDark} strokeWidth={3} opacity={0.7} />
    ))}
    <rect x={-26} y={-262} width={52} height={30} fill={C.linen} stroke={KRP.ink} strokeWidth={4.5} />
    <path d={DOLL_BODY} fill={C.linen} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={0} cy={-312} rx={64} ry={68} fill={C.linen} stroke={KRP.ink} strokeWidth={6} />
    <g clipPath={`url(#${clipId})`}>
      <g stroke={C.linenDark} strokeWidth={2} opacity={0.32}>
        {Array.from({ length: 34 }, (_, i) => <line key={`v${i}`} x1={-170 + i * 10} y1={-390} x2={-170 + i * 10} y2={10} />)}
        {Array.from({ length: 40 }, (_, i) => <line key={`h${i}`} x1={-170} y1={-390 + i * 10} x2={170} y2={-390 + i * 10} />)}
      </g>
      <ellipse cx={46} cy={-90} rx={30} ry={18} fill={C.linenDark} opacity={0.22} />
      <ellipse cx={-50} cy={-150} rx={18} ry={26} fill={C.linenDark} opacity={0.18} />
      {detail && <>
        <ellipse cx={30} cy={-350} rx={22} ry={12} fill={C.linenDark} opacity={0.2} />
        <ellipse cx={-30} cy={-290} rx={14} ry={10} fill={C.linenDark} opacity={0.16} />
      </>}
      <ellipse cx={light * 140} cy={-200} rx={70} ry={260} fill={KRP.white} opacity={0.32}
        transform={`rotate(14 ${light * 140} -200)`} />
    </g>
    <path d="M -88 -180 L -94 -20" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="7 7" opacity={0.6} />
    <path d="M 88 -180 L 94 -20" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="7 7" opacity={0.6} />
    <path d="M -60 -370 Q 0 -390 60 -370" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="7 7" opacity={0.5} />
    <g stroke={C.woolBrown} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.8}>
      <path d="M -36 -332 q 12 -8 24 0" /><path d="M 12 -332 q 12 -8 24 0" />
      <line x1={-24} y1={-316} x2={-24} y2={-308} /><line x1={24} y1={-316} x2={24} y2={-308} />
      <path d="M 0 -310 L -4 -288 L 4 -286" />
    </g>
    <path d="M -18 -270 Q 0 -262 18 -270" fill="none" stroke={C.woolRed} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
    {detail && (
      <g>
        {/* 毛糸の毛羽 (ルーペで初めて見える) */}
        {Array.from({ length: 26 }, (_, i) => {
          const pts: [number, number][] = [[-30, -336], [-18, -336], [18, -336], [30, -336], [-24, -312], [24, -312], [-2, -298], [-10, -268], [0, -265], [10, -268]];
          const [px, py] = pts[i % pts.length];
          const a = rnd(5101, i) * Math.PI * 2;
          const w = Math.sin(f / 6 + i) * 0.6;
          return <path key={i} d={`M ${px} ${py} q ${Math.cos(a) * 5 + w} ${Math.sin(a) * 5} ${Math.cos(a) * 9} ${Math.sin(a) * 9 - 2}`}
            fill="none" stroke={i % 3 === 0 ? C.woolRed : C.woolBrown} strokeWidth={1.4} opacity={0.75} />;
        })}
        {/* 縫い穴 */}
        {[[-38, -330], [-12, -330], [10, -330], [36, -330], [-24, -320], [24, -320], [-20, -268], [20, -268], [0, -313]].map(([hx, hy], i) => (
          <circle key={i} cx={hx} cy={hy} r={1.8} fill={KRP.ink} opacity={0.55} />
        ))}
        {/* 頭の輪郭の麻のけば */}
        {Array.from({ length: 30 }, (_, i) => {
          const a = Math.PI * (0.9 + rnd(5102, i) * 1.2);
          const px = Math.cos(a) * 64, py = -312 + Math.sin(a) * 68;
          return <line key={i} x1={px} y1={py} x2={px + Math.cos(a) * 6} y2={py + Math.sin(a) * 6} stroke={C.linenDark} strokeWidth={1.3} />;
        })}
        {/* ほどけた糸の端 */}
        <path d={`M -60 -342 q -6 -14 4 -22 q ${8 + Math.sin(f / 8) * 2} -6 6 -16`} fill="none" stroke={C.woolBrown} strokeWidth={1.8} />
      </g>
    )}
    <g stroke={C.woolRed} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7}>
      <line x1={-30} y1={-232} x2={-36} y2={-10} />
      <line x1={30} y1={-232} x2={36} y2={-10} />
      <path d="M -82 -120 l 20 -14 l 20 14 l 20 -14 l 20 14 l 20 -14 l 20 14 l 20 -14 l 20 14" />
    </g>
    <path d="M -86 -60 L 88 -60" stroke={C.woolBrown} strokeWidth={4.5} opacity={0.6} />
    <path d="M -54 -340 Q -70 -346 -76 -334" fill="none" stroke={C.woolBrown} strokeWidth={3} />
    <circle cx={-78} cy={-326} r={13} fill={C.bead} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={-78} cy={-326} r={6} fill={C.beadDeep} />
    <circle cx={-82} cy={-331} r={3.5} fill={KRP.white} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9))} />
    {glint > 0.01 && (
      <g transform={`translate(-82 -331) scale(${glint * (0.85 + 0.15 * Math.sin(f / 2.2))}) rotate(${f * 2})`}>
        <path d="M 0 -16 L 3 -3 L 16 0 L 3 3 L 0 16 L -3 3 L -16 0 L -3 -3 Z" fill={KRP.white} />
      </g>
    )}
  </g>
);

// 布人形の断面 (中のぼろ布とパピルス)。a〜b のあいだに下から順に詰まっていく
type L1bPiece = { px: number; py: number; kind: 0 | 1; col: string; w: number; h: number; r: number; i: number };
const RAG_COLS = [C.ragIndigo, C.ragOchre, C.ragGreen, C.ragRose, C.ragUmber, C.woolRed, C.linenShade];
const L1B_PIECES: L1bPiece[] = Array.from({ length: 96 }, (_, i) => ({
  px: -92 + rnd(501, i) * 184, py: -378 + rnd(502, i) * 376,
  kind: (rnd(503, i) < 0.34 ? 1 : 0) as 0 | 1,
  col: RAG_COLS[Math.floor(rnd(504, i) * RAG_COLS.length)],
  w: 34 + rnd(505, i) * 24, h: 22 + rnd(506, i) * 16, r: rnd(507, i) * 180 - 90, i,
})).sort((p, q) => q.py - p.py);
const INNER_T = "translate(0 -125) scale(0.86) translate(0 125)";
const L1bDollSection: React.FC<{ x: number; y: number; s?: number; f: number; a: number; b: number; clipId: string; op?: number }> = ({
  x, y, s = 1, f, a, b, clipId, op = 1,
}) => {
  const N = L1B_PIECES.length;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <clipPath id={clipId}>
        <path d={DOLL_BODY} transform={INNER_T} />
        <ellipse cx={0} cy={-312} rx={52} ry={56} />
        <rect x={-16} y={-268} width={32} height={44} />
      </clipPath>
      <rect x={-162} y={-232} width={324} height={44} rx={22} fill={C.linenShade} stroke={KRP.ink} strokeWidth={5} />
      {[-156, 156].map((ex) => <ellipse key={ex} cx={ex} cy={-210} rx={12} ry={22} fill={C.linen} stroke={KRP.ink} strokeWidth={4} />)}
      <rect x={-26} y={-262} width={52} height={30} fill={C.linen} stroke={KRP.ink} strokeWidth={4.5} />
      <path d={DOLL_BODY} fill={C.linen} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={0} cy={-312} rx={64} ry={68} fill={C.linen} stroke={KRP.ink} strokeWidth={6} />
      <g clipPath={`url(#${clipId})`}>
        <rect x={-120} y={-400} width={240} height={420} fill={C.cavity} />
        {L1B_PIECES.map((p, rank) => {
          const st = a + (b - a - 6) * (rank / N);
          const t = seg(f, st, st + 6);
          if (t <= 0) return null;
          const dy = -(1 - easeOut(t)) * 90;
          return (
            <g key={p.i} transform={`translate(${p.px} ${p.py + dy}) rotate(${p.r})`} opacity={t}>
              {p.kind === 1 ? (
                <g>
                  <rect x={-34} y={-7} width={68} height={14} rx={2} fill={C.papyrus} stroke={KRP.ink} strokeWidth={2.5} />
                  <line x1={-30} y1={-2} x2={30} y2={-2} stroke={C.papyrusDark} strokeWidth={1.8} />
                  <line x1={-28} y1={3} x2={26} y2={3} stroke={C.papyrusDark} strokeWidth={1.8} />
                </g>
              ) : (
                <g>
                  <path d={`M ${-p.w / 2} ${-p.h / 2} L ${p.w / 2 - 4} ${-p.h / 2 + 3} L ${p.w / 2} ${p.h / 2} L ${-p.w / 2 + 5} ${p.h / 2 - 2} Z`}
                    fill={p.col} stroke={KRP.ink} strokeWidth={2.5} strokeLinejoin="round" />
                  <path d={`M ${p.w / 2 - 2} ${-p.h / 4} l 6 2 M ${p.w / 2} ${p.h / 6} l 6 1`} stroke={p.col} strokeWidth={2} />
                  <line x1={-p.w / 3} y1={0} x2={p.w / 3} y2={1} stroke={KRP.ink} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.45} />
                </g>
              )}
            </g>
          );
        })}
      </g>
      <path d={DOLL_BODY} transform={INNER_T} fill="none" stroke={C.linenDark} strokeWidth={4} />
      <ellipse cx={0} cy={-312} rx={52} ry={56} fill="none" stroke={C.linenDark} strokeWidth={4} />
      <path d="M -60 -370 Q 0 -390 60 -370" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="7 7" opacity={0.5} />
      <path d="M -54 -340 Q -70 -346 -76 -334" fill="none" stroke={C.woolBrown} strokeWidth={3} />
      <circle cx={-78} cy={-326} r={13} fill={C.bead} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 今のくまのぬいぐるみ。x,y: 底 / s=1 で高さ約300px / inside: 中の綿が透ける 0〜1
const L1bBear: React.FC<{ x: number; y: number; s?: number; f: number; inside?: number; clipId: string }> = ({ x, y, s = 1, f, inside = 0, clipId }) => {
  const tilt = Math.sin(f / 14) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt} 0 -120)`}>
      <ellipse cx={0} cy={4} rx={120} ry={14} fill={KRP.ink} opacity={0.15} />
      <ellipse cx={-56} cy={-34} rx={44} ry={36} fill={C.bearFur} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={56} cy={-34} rx={44} ry={36} fill={C.bearFur} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={-62} cy={-30} rx={20} ry={18} fill={C.bearMuzzle} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={62} cy={-30} rx={20} ry={18} fill={C.bearMuzzle} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={-94} cy={-118} rx={28} ry={56} fill={C.bearFur} stroke={KRP.ink} strokeWidth={5} transform="rotate(24 -94 -118)" />
      <ellipse cx={94} cy={-118} rx={28} ry={56} fill={C.bearFur} stroke={KRP.ink} strokeWidth={5} transform="rotate(-24 94 -118)" />
      <ellipse cx={0} cy={-104} rx={86} ry={88} fill={C.bearFur} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-96} rx={50} ry={56} fill={C.bearMuzzle} opacity={0.7} />
      <line x1={0} y1={-170} x2={0} y2={-30} stroke={C.bearDark} strokeWidth={3} strokeDasharray="7 6" />
      {[-58, 58].map((ex) => (
        <g key={ex}>
          <circle cx={ex} cy={-282} r={28} fill={C.bearFur} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={ex} cy={-280} r={14} fill={C.bearMuzzle} />
        </g>
      ))}
      <circle cx={0} cy={-226} r={76} fill={C.bearFur} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-200} rx={34} ry={26} fill={C.bearMuzzle} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={0} cy={-212} rx={12} ry={8} fill={KRP.ink} />
      <path d="M 0 -204 L 0 -192 M -12 -186 Q 0 -180 12 -186" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={-28} cy={-240} r={7} fill={KRP.ink} /><circle cx={28} cy={-240} r={7} fill={KRP.ink} />
      <circle cx={-26} cy={-242} r={2.5} fill={KRP.white} /><circle cx={30} cy={-242} r={2.5} fill={KRP.white} />
      <path d="M -40 -160 L -6 -150 L -40 -138 Z M 40 -160 L 6 -150 L 40 -138 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <circle cx={0} cy={-150} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
      {inside > 0.01 && (
        <g opacity={inside}>
          <clipPath id={clipId}>
            <ellipse cx={0} cy={-104} rx={74} ry={76} />
            <circle cx={0} cy={-226} r={64} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <rect x={-90} y={-300} width={180} height={300} fill={C.bearMuzzle} opacity={0.6} />
            {Array.from({ length: 34 }, (_, i) => {
              const cx = -70 + rnd(5401, i) * 140, cy = -290 + rnd(5402, i) * 270;
              const r = 15 + rnd(5403, i) * 10 + Math.sin(f / 6 + i) * 1.5;
              return <circle key={i} cx={cx} cy={cy} r={r} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={2.5} />;
            })}
          </g>
        </g>
      )}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#50 【図】 中に詰められていたのは、ぼろ布と、紙のもとになるパピルスです。
// 設計: 布人形の断面図 (世界=博物館の解説パネル)。外側の麻布、中にぎゅっと詰まったぼろ布の切れ端 (色とりどり) と、パピルスの繊維 (黄土色の短冊)。脇にパピルスの草の小さな絵。札「ぼろ布」「パピルス」
// どこ: 博物館の壁にかかった解説パネル (木の額・方眼の台紙・スポットライト)
// 演出: 人形を縦に切った断面図を大きく。下から順に、色とりどりのぼろ布とパピルスの短冊が詰まっていく。右にパピルスの草
// 動き: 詰め物が f3〜36 で下から積もる → f34〜42 で人形がぷくっとふくらむ。札が順に出る。草がそよぐ。カメラがゆっくり寄る
const Yw050: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.04, easeInOut(seg(f, 0, 40)));
  const puff = Math.sin(Math.PI * seg(f, 34, 42));
  const ds = 1.85 * (1 + 0.025 * puff);
  const t1 = seg(f, 20, 28), t2 = seg(f, 28, 36), tp = seg(f, 8, 30);
  const sway = Math.sin(f / 12) * 3;
  const DX = 700, DY = 800;
  const P = (lx: number, ly: number) => [DX + lx * 1.85, DY + ly * 1.85] as const;
  const rag = P(36, -150), pap = P(-14, -64);
  return (
    <Frame f={f} seed={3050} bg={C.wallWarm}>
      <g transform={cam(860, 480, k)}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wallWarm} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={-40} x2={i * 150} y2={900} stroke={C.wallWainscot} strokeWidth={3} opacity={0.18} />)}
        <rect x={-40} y={900} width={W + 80} height={220} fill={C.wallWainscot} />
        <line x1={-40} y1={904} x2={W + 40} y2={904} stroke={KRP.ink} strokeWidth={5} />
        {/* スポットライトの光だまり */}
        <ellipse cx={860} cy={420} rx={980} ry={520} fill={C.spot} opacity={0.28} />
        {/* 解説パネル */}
        <rect x={92} y={48} width={1736} height={848} rx={12} fill={C.frameWood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={116} y={72} width={1688} height={800} fill={C.panelPaper} stroke={C.frameWoodDark} strokeWidth={4} />
        <g stroke={C.panelGrid} strokeWidth={2} opacity={0.5}>
          {Array.from({ length: 34 }, (_, i) => <line key={`v${i}`} x1={116 + i * 50} y1={72} x2={116 + i * 50} y2={872} />)}
          {Array.from({ length: 16 }, (_, i) => <line key={`h${i}`} x1={116} y1={72 + i * 50} x2={1804} y2={72 + i * 50} />)}
        </g>
        {[[136, 92], [1784, 92], [136, 852], [1784, 852]].map(([sx, sy], i) => (
          <g key={i}><circle cx={sx} cy={sy} r={9} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} /><line x1={sx - 5} y1={sy} x2={sx + 5} y2={sy} stroke={KRP.ink} strokeWidth={2} /></g>
        ))}
        {/* 寸法線 (高さ19cm) */}
        <g stroke={KRP.ink} strokeWidth={3.5}>
          <line x1={330} y1={DY - 380 * 1.85} x2={330} y2={DY} />
          <line x1={312} y1={DY - 380 * 1.85} x2={348} y2={DY - 380 * 1.85} />
          <line x1={312} y1={DY} x2={348} y2={DY} />
        </g>
        <rect x={282} y={430} width={96} height={46} rx={8} fill={C.panelPaper} stroke={KRP.ink} strokeWidth={3} />
        <text x={330} y={464} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>19cm</text>
        {/* 切断線 (はさみ) */}
        <line x1={DX} y1={DY - 395 * 1.85 - 8} x2={DX} y2={DY - 380 * 1.85 + 6} stroke={KRP.red} strokeWidth={4} strokeDasharray="10 8" />
        {/* 主役: 断面 */}
        <ellipse cx={DX} cy={DY + 8} rx={260} ry={22} fill={KRP.ink} opacity={0.13} />
        <L1bDollSection x={DX} y={DY} s={ds} f={f} a={3} b={36} clipId="l1b50-sec" />
        {/* ぎゅっと詰まった合図 */}
        {puff > 0.05 && [-1, 1].map((d) => (
          <g key={d} opacity={puff} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round">
            <line x1={DX + d * 210} y1={600} x2={DX + d * 250} y2={590} />
            <line x1={DX + d * 214} y1={650} x2={DX + d * 258} y2={652} />
            <line x1={DX + d * 206} y1={700} x2={DX + d * 246} y2={712} />
          </g>
        ))}
        {/* 引き出し線 */}
        <g opacity={t1}>
          <line x1={1060} y1={430} x2={rag[0]} y2={rag[1]} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={rag[0]} cy={rag[1]} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g opacity={t2}>
          <line x1={1054} y1={640} x2={pap[0]} y2={pap[1]} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={pap[0]} cy={pap[1]} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 見本の切れ端 (札の横) */}
        <g opacity={t1}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${1290 + i * 52} ${410 + (i % 2) * 14} l 40 4 l 4 30 l -42 -4 Z`} fill={RAG_COLS[i]} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
        <g opacity={t2}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={1308} y={616 + i * 20} width={130} height={14} rx={2} fill={C.papyrus} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${(i - 1) * 4} 1373 ${623 + i * 20})`} />
          ))}
        </g>
        {/* パピルスの草 (水辺) */}
        <g opacity={0.4 + 0.6 * tp}>
          <ellipse cx={1610} cy={808} rx={170} ry={26} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3.5} />
          <path d={`M 1480 806 q 20 ${-6 + Math.sin(f / 5) * 2} 40 0 M 1660 812 q 20 -6 40 0`} fill="none" stroke={KRP.blue} strokeWidth={3} />
          {[[-70, 360, -8], [-30, 300, -3], [10, 270, 2], [50, 320, 6], [86, 380, 10]].map(([ox, top, lean], i) => {
            const hx = 1610 + ox + lean * 6 + sway * (1 + i * 0.3), hy = top;
            return (
              <g key={i}>
                <path d={`M ${1600 + ox * 0.3} 806 Q ${1605 + ox * 0.6} ${(806 + hy) / 2} ${hx} ${hy}`} fill="none" stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
                <path d={`M ${1600 + ox * 0.3} 806 Q ${1605 + ox * 0.6} ${(806 + hy) / 2} ${hx} ${hy}`} fill="none" stroke={C.papyrusGreen} strokeWidth={6} strokeLinecap="round" />
                {Array.from({ length: 13 }, (_, j) => {
                  const a = -Math.PI / 2 + (j / 12 - 0.5) * 2.6 + sway * 0.01;
                  const L = 52 + (j % 3) * 10;
                  return <line key={j} x1={hx} y1={hy} x2={hx + Math.cos(a) * L} y2={hy + Math.sin(a) * L * 0.8} stroke={C.papyrusGreenDark} strokeWidth={3} strokeLinecap="round" />;
                })}
              </g>
            );
          })}
          <Arrow x={1470} y={700} s={0.55} rot={200} t={t2} />
        </g>
        <TagPlate x={1150} y={430} text="ぼろ布" size={48} t={t1} />
        <TagPlate x={1170} y={640} text="パピルス" size={48} t={t2} />
      </g>
    </Frame>
  );
};

// ---- 文#51 【並】 顔には毛糸が縫いつけられ、頭には小さな青いガラス玉の飾りがついていました。
// 設計: 人形の顔に寄る (超アップ)。色あせた毛糸の縫い目、頭の青いガラス玉が f でキラッと光る。ルーペの丸い枠の中に見せる
// どこ: 博物館の調査室。透明な台に立てた布人形、奥に保存箱の棚とアームライト
// 演出: 白手袋の手が大きなルーペを差し出す。レンズの中だけ顔が超アップ (毛糸の毛羽・縫い穴まで)。外側は暗く沈める
// 動き: ルーペが右下から滑り込み (f0〜22)、ピントが寄る (倍率 f6〜26)。f30〜38 で青いガラス玉がキラッ。札が順に出る
const Yw051: React.FC<{ f: number }> = ({ f }) => {
  const mv = easeOut(seg(f, 0, 22));
  const lx = lerp(1320, 880, mv), ly = lerp(620, 500, mv);
  const mag = lerp(1.5, 2.3, easeInOut(seg(f, 6, 26)));
  const R = 350;
  const glint = seg(f, 30, 38);
  const DX = 900, DY = 1010, DS = 1.5;
  const M = (lx0: number, ly0: number) => {
    const sx = DX + lx0 * DS, sy = DY + ly0 * DS;
    return [lx + (sx - lx) * mag, ly + (sy - ly) * mag] as const;
  };
  const beadM = M(-78, -326), browM = M(26, -334);
  const tB = seg(f, 26, 34), tW = seg(f, 32, 40);
  const world = (detail: boolean, id: string) => (
    <g>
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.storeWall} />
      {/* 保存箱の棚 */}
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={-20} y={90 + r * 220} width={W + 40} height={16} fill={C.storeDark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <rect x={20 + i * 215} y={-60 + r * 220 + 20} width={190} height={130} rx={4} fill={i % 3 === 1 ? C.coatDark : C.tissue} stroke={KRP.ink} strokeWidth={3.5} opacity={0.85} />
              <rect x={70 + i * 215} y={r * 220 + 10} width={90} height={30} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} opacity={0.8} />
            </g>
          ))}
        </g>
      ))}
      {/* アームライトの光 */}
      <path d="M 260 -20 L 520 -20 L 1300 760 L 380 760 Z" fill={C.spot} opacity={0.2} />
      {/* 作業台 */}
      <rect x={-40} y={820} width={W + 80} height={300} fill={C.museumDark} />
      <rect x={-40} y={820} width={W + 80} height={16} fill={C.museumWall} />
      {/* 透明な台 */}
      <rect x={DX - 90} y={DY - 230} width={20} height={240} fill={C.acrylic} opacity={0.55} stroke={KRP.ink} strokeWidth={3} />
      <L1bDoll x={DX} y={DY} s={DS} f={f} clipId={id} detail={detail} light={-0.3 + Math.sin(f / 20) * 0.2} glint={detail ? glint : 0} />
    </g>
  );
  return (
    <Frame f={f} seed={3051} bg={C.storeWall}>
      {world(false, "l1b51-doll-a")}
      <rect x={0} y={0} width={W} height={H} fill={C.museumDark} opacity={0.5} />
      <clipPath id="l1b51-lens"><circle cx={lx} cy={ly} r={R} /></clipPath>
      <g clipPath="url(#l1b51-lens)">
        <g transform={cam(lx, ly, mag)}>{world(true, "l1b51-doll-b")}</g>
        <circle cx={lx} cy={ly} r={R} fill={KRP.blueSoft} opacity={0.08} />
        <path d={`M ${lx - R * 0.75} ${ly - R * 0.35} A ${R * 0.85} ${R * 0.85} 0 0 1 ${lx - R * 0.2} ${ly - R * 0.8}`}
          fill="none" stroke={KRP.white} strokeWidth={22} strokeLinecap="round" opacity={0.35} />
      </g>
      {/* 柄と手袋 */}
      <g transform={`translate(${lx + R * 0.72} ${ly + R * 0.72}) rotate(45)`}>
        <rect x={0} y={-30} width={140} height={60} rx={10} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={120} y={-34} width={460} height={68} rx={30} fill={YP.wood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={150} y1={-14} x2={560} y2={-14} stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
        <ellipse cx={330} cy={0} rx={90} ry={66} fill={C.coat} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={262 + i * 34} y={-82} width={32} height={58} rx={16} fill={C.coat} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={232} y={-10} width={70} height={34} rx={17} fill={C.coat} stroke={KRP.ink} strokeWidth={5} transform="rotate(-30 266 6)" />
        <rect x={410} y={-60} width={90} height={120} rx={14} fill={C.coatDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* ルーペの縁 */}
      <circle cx={lx} cy={ly} r={R + 14} fill="none" stroke={KRP.ink} strokeWidth={36} />
      <circle cx={lx} cy={ly} r={R + 14} fill="none" stroke={YP.brass} strokeWidth={24} />
      <circle cx={lx} cy={ly} r={R + 6} fill="none" stroke={YP.brassDark} strokeWidth={4} />
      {/* 外のガラス玉の光の粒 */}
      {glint > 0 && Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + f / 10;
        const d = 40 + glint * 40;
        return <circle key={i} cx={beadM[0] + Math.cos(a) * d} cy={beadM[1] + Math.sin(a) * d} r={5} fill={KRP.white} opacity={glint * 0.9} />;
      })}
      {/* 引き出し線と札 */}
      <g opacity={tB}>
        <line x1={420} y1={300} x2={beadM[0] - 30} y2={beadM[1] - 20} stroke={KRP.white} strokeWidth={9} />
        <line x1={420} y1={300} x2={beadM[0] - 30} y2={beadM[1] - 20} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <g opacity={tW}>
        <line x1={1420} y1={560} x2={browM[0] + 20} y2={browM[1]} stroke={KRP.white} strokeWidth={9} />
        <line x1={1420} y1={560} x2={browM[0] + 20} y2={browM[1]} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={320} y={290} text="ガラス玉" size={46} t={tB} fill={KRP.white} color={C.beadDeep} />
      <TagPlate x={1530} y={560} text="毛糸" size={46} t={tW} />
    </Frame>
  );
};

// ---- 文#52 【山】 エジプトの乾いた空気のおかげで、1500年以上たった今も、形が残っています。
// 設計: 砂漠の地層の断面 (世界=乾いた砂の地層)。上を太陽が f で何度も昇り沈む (時の流れ)。地中の人形は変わらずそのまま。脇に「雨」の雲が近づくが砂漠の上で消える。札「乾いた空気」
// どこ: エジプトの砂漠 (オクシュリンコスのごみ山跡) の地面を縦に切った断面。上は灼けた空、地表に日干しれんがの壁とヤシ
// 演出: 太陽が何度も昇っては沈む (=年月)。年数の札がどんどん増える。地中の人形は少しも変わらない。右から雨雲が来るが、雨粒は砂に届く前に乾いて消える
// 動き: 太陽 f/16 周期で弧を描く / 年数 0→1500 (f0〜40) / 雨雲 f4〜22 で入り f22〜40 でしぼむ / 雨粒は落ちる途中で湯気になる / カメラがゆっくり寄る
const Yw052: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.05, easeInOut(seg(f, 0, 40)));
  const p = ((f + 8) / 16) % 1;
  const sunX = 140 + p * 1640, sunY = 470 - Math.sin(p * Math.PI) * 330;
  const dusk = 1 - Math.sin(p * Math.PI);
  const years = Math.round(easeInOut(seg(f, 0, 40)) * 1500);
  const cx = lerp(2100, 1380, easeOut(seg(f, 4, 22)));
  const cs = 1 - 0.28 * seg(f, 22, 40);
  const cop = 1 - 0.3 * seg(f, 26, 42);
  const GY = 470;
  const surf = (x: number) => GY + Math.sin(x / 210) * 16 + Math.sin(x / 77) * 5;
  const surfPath = `M -40 ${surf(-40)} ` + Array.from({ length: 41 }, (_, i) => `L ${-40 + i * 50} ${surf(-40 + i * 50)}`).join(" ") + ` L ${W + 40} ${H + 40} L -40 ${H + 40} Z`;
  const layers = [
    { y: 540, c: C.sandMid }, { y: 620, c: C.sandDark }, { y: 700, c: C.sand }, { y: 790, c: C.sandDeep }, { y: 880, c: C.sandMid }, { y: 970, c: C.sandDeep },
  ];
  const band = (y: number, seed: number) => `M -40 ${y} ` + Array.from({ length: 21 }, (_, i) => `Q ${-40 + i * 100 + 50} ${y + (rnd(seed, i) - 0.5) * 30} ${-40 + (i + 1) * 100} ${y}`).join(" ") + ` L ${W + 40} ${H + 40} L -40 ${H + 40} Z`;
  return (
    <Frame f={f} seed={3052} bg={C.skyHot}>
      <g transform={cam(960, 620, k)}>
        <rect x={-40} y={-40} width={W + 80} height={600} fill={C.skyHot} />
        <rect x={-40} y={240} width={W + 80} height={300} fill={C.skyHot2} opacity={0.7} />
        {/* 夕方の色 (太陽が低いほど) */}
        <rect x={-40} y={-40} width={W + 80} height={600} fill={C.romeSky2} opacity={dusk * 0.35} />
        {/* 前の日の太陽の通り道 */}
        <path d={`M 140 470 Q 960 -190 1780 470`} fill="none" stroke={KRP.orange} strokeWidth={4} strokeDasharray="4 18" opacity={0.5} />
        {/* 太陽 */}
        <g transform={`translate(${sunX} ${sunY})`}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-70} x2={0} y2={-98} stroke={KRP.orange} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 30 + f * 3})`} />
          ))}
          <circle r={56} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
          <circle r={36} fill={C.flameCore} opacity={0.7} />
        </g>
        {/* 雨雲 (乾いた空気で雨が消える) */}
        <g opacity={cop} transform={`translate(${cx} 170) scale(${cs})`}>
          {Array.from({ length: 12 }, (_, i) => {
            const dx = -150 + (i % 6) * 60, yoff = ((f * 9 + i * 37) % 150);
            const op = clamp01(1 - yoff / 100);
            if (f < 12) return null;
            return (
              <g key={i}>
                <line x1={dx} y1={70 + yoff} x2={dx - 6} y2={96 + yoff} stroke={C.ujBlue} strokeWidth={7} strokeLinecap="round" opacity={op * 0.8} />
                {yoff > 80 && <path d={`M ${dx - 10} ${170 + (yoff - 80) * 0.2} q 8 -12 0 -24 q -8 -12 0 -24`} fill="none" stroke={KRP.white} strokeWidth={4} opacity={(1 - op) * 0.8 * clamp01((150 - yoff) / 40)} />}
              </g>
            );
          })}
          <path d="M -220 60 Q -250 0 -180 -10 Q -170 -80 -90 -70 Q -50 -130 30 -100 Q 100 -140 150 -70 Q 240 -70 230 10 Q 260 60 200 70 Z"
            fill={C.rainCloud} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -170 40 Q -40 70 180 40" fill="none" stroke={C.rainCloudDark} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* かげろう */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${300 + i * 500} ${430 - i * 4} q 30 ${-10 + Math.sin(f / 4 + i) * 6} 60 0 q 30 ${10 - Math.sin(f / 4 + i) * 6} 60 0 q 30 -10 60 0`}
            fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.5} />
        ))}
        {/* 地表のもの: 日干しれんがの壁・ヤシ・道しるべ */}
        <g>
          {[[110, 5], [210, 3], [300, 4]].map(([wx, n], i) => (
            <g key={i}>
              {Array.from({ length: n }, (_, r) => (
                <rect key={r} x={wx + (r % 2) * 10} y={surf(wx) - 34 - r * 30} width={80} height={30} fill={C.mudbrick} stroke={KRP.ink} strokeWidth={3.5} />
              ))}
            </g>
          ))}
          <path d={`M 450 ${surf(450)} Q 440 ${surf(450) - 130} 470 ${surf(450) - 250}`} fill="none" stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
          <path d={`M 450 ${surf(450)} Q 440 ${surf(450) - 130} 470 ${surf(450) - 250}`} fill="none" stroke={C.palmTrunk} strokeWidth={14} strokeLinecap="round" />
          {Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI * (1.05 + i * 0.15) + Math.sin(f / 10) * 0.05;
            const tx = 470, ty = surf(450) - 250;
            return <path key={i} d={`M ${tx} ${ty} Q ${tx + Math.cos(a) * 70} ${ty + Math.sin(a) * 70 - 30} ${tx + Math.cos(a) * 140} ${ty + Math.sin(a) * 140 + 20}`}
              fill="none" stroke={C.palm} strokeWidth={14} strokeLinecap="round" />;
          })}
          <rect x={640} y={surf(650) - 120} width={12} height={124} fill={YP.wood} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M 600 ${surf(650) - 120} L 760 ${surf(650) - 120} L 784 ${surf(650) - 96} L 760 ${surf(650) - 72} L 600 ${surf(650) - 72} Z`} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
          <text x={684} y={surf(650) - 85} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={KRP.white}>エジプト</text>
        </g>
        {/* 地層 */}
        <path d={surfPath} fill={C.sandLight} stroke={KRP.ink} strokeWidth={6} />
        {layers.map((l, i) => <path key={i} d={band(l.y, 5200 + i)} fill={l.c} stroke={KRP.ink} strokeWidth={3} strokeOpacity={0.5} />)}
        {Array.from({ length: 140 }, (_, i) => (
          <circle key={i} cx={rnd(5210, i) * W} cy={500 + rnd(5211, i) * 560} r={2 + rnd(5212, i) * 3} fill={KRP.ink} opacity={0.18} />
        ))}
        {/* 地中のかけら: 土器・パピルスの切れ端・小石 */}
        {Array.from({ length: 16 }, (_, i) => {
          const x = 80 + rnd(5220, i) * 1760, y = 540 + rnd(5221, i) * 420;
          if (Math.abs(x - 960) < 380 && Math.abs(y - 660) < 190) return null;
          const kind = i % 3;
          return kind === 0 ? (
            <path key={i} d={`M ${x} ${y} l 40 -10 l 10 26 l -44 6 Z`} fill={C.shard} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${rnd(5222, i) * 60 - 30} ${x} ${y})`} />
          ) : kind === 1 ? (
            <g key={i} transform={`rotate(${rnd(5223, i) * 40 - 20} ${x} ${y})`}>
              <rect x={x - 34} y={y - 18} width={68} height={36} fill={C.papyrus} stroke={KRP.ink} strokeWidth={3} />
              {[0, 1, 2].map((j) => <line key={j} x1={x - 26} y1={y - 8 + j * 9} x2={x + 22 - j * 6} y2={y - 8 + j * 9} stroke={C.ragUmber} strokeWidth={2} />)}
            </g>
          ) : (
            <ellipse key={i} cx={x} cy={y} rx={16} ry={11} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
          );
        })}
        {/* 人形の眠る穴 */}
        <ellipse cx={960} cy={660} rx={330} ry={168} fill={C.sandDeep} stroke={KRP.ink} strokeWidth={4} strokeDasharray="12 9" />
        <ellipse cx={960} cy={664} rx={300} ry={146} fill={C.sandDark} opacity={0.6} />
        <L1bDoll x={790} y={660} s={0.85} rot={90} f={f} clipId="l1b52-doll" light={-1.4} />
        {/* こぼれる砂粒 */}
        {Array.from({ length: 6 }, (_, i) => {
          const yy = (f * 3 + i * 23) % 80;
          return <circle key={i} cx={700 + i * 110} cy={500 + yy} r={3} fill={C.sandDeep} opacity={1 - yy / 80} />;
        })}
        <TagPlate x={560} y={600} text={`${years}年`} size={42} t={seg(f, 0, 6)} fill={C.panelPaper} />
        <TagPlate x={1360} y={410} text="乾いた空気" size={46} t={seg(f, 16, 26)} />
      </g>
    </Frame>
  );
};

// ---- 文#53 【山】 いまはロンドンの、大英博物館に収められています。
// 設計: 大英博物館の正面 (ギリシャ神殿風の円柱の列・三角屋根)。曇り空のロンドン、赤い2階建てバス。f で建物の中へカメラが寄り、収蔵庫の引き出しの中で人形が眠っている。イギリスの国旗、札「大英博物館」
// どこ: 小雨のロンドン。大英博物館の正面 (イオニア式の円柱8本・三角屋根の破風彫刻・石段・鉄柵)
// 演出: 傘の見学者、赤い2階建てバスが通る、手前にユニオンジャック。カメラが入口へ寄ると、丸窓が開いて収蔵庫の引き出しの中で眠る人形が見える
// 動き: カメラ寄り f2〜30 / バス左から / 雨 / 旗がはためく / 丸窓 f20〜38 / 引き出しが f26〜40 で手前に出る
const L1bUnionJack: React.FC<{ x: number; y: number; w: number; f: number; id: string }> = ({ x, y, w, f, id }) => {
  const h = w / 2;
  return (
    <g transform={`translate(${x} ${y}) skewY(${Math.sin(f / 6) * 4})`}>
      <clipPath id={id}><rect x={0} y={0} width={w} height={h} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={0} y={0} width={w} height={h} fill={C.ujBlue} />
        <line x1={0} y1={0} x2={w} y2={h} stroke={KRP.white} strokeWidth={h * 0.2} />
        <line x1={0} y1={h} x2={w} y2={0} stroke={KRP.white} strokeWidth={h * 0.2} />
        <line x1={0} y1={0} x2={w} y2={h} stroke={KRP.red} strokeWidth={h * 0.07} />
        <line x1={0} y1={h} x2={w} y2={0} stroke={KRP.red} strokeWidth={h * 0.07} />
        <rect x={0} y={h / 3} width={w} height={h / 3} fill={KRP.white} />
        <rect x={w / 2 - h / 6} y={0} width={h / 3} height={h} fill={KRP.white} />
        <rect x={0} y={h * 0.4} width={w} height={h * 0.2} fill={KRP.red} />
        <rect x={w / 2 - h * 0.1} y={0} width={h * 0.2} height={h} fill={KRP.red} />
      </g>
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};
const L1bColumn: React.FC<{ x: number; top: number; bot: number; w: number; fill?: string; shade?: string; ionic?: boolean }> = ({
  x, top, bot, w, fill = C.portland, shade = C.portlandShade, ionic = true,
}) => (
  <g>
    <rect x={x - w / 2} y={top + 18} width={w} height={bot - top - 36} fill={fill} stroke={KRP.ink} strokeWidth={4} />
    {[-0.28, 0, 0.28].map((d) => <line key={d} x1={x + d * w} y1={top + 24} x2={x + d * w} y2={bot - 22} stroke={shade} strokeWidth={3} />)}
    <rect x={x + w * 0.22} y={top + 18} width={w * 0.28} height={bot - top - 36} fill={shade} opacity={0.5} />
    {ionic ? (
      <g>
        <rect x={x - w * 0.75} y={top + 4} width={w * 1.5} height={16} rx={6} fill={fill} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={x - w * 0.62} cy={top + 18} r={w * 0.17} fill={fill} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={x + w * 0.62} cy={top + 18} r={w * 0.17} fill={fill} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ) : (
      <g>
        <path d={`M ${x - w * 0.5} ${top + 22} Q ${x - w * 0.9} ${top + 4} ${x - w * 0.8} ${top} L ${x + w * 0.8} ${top} Q ${x + w * 0.9} ${top + 4} ${x + w * 0.5} ${top + 22} Z`} fill={fill} stroke={KRP.ink} strokeWidth={3.5} />
        {[-0.4, 0, 0.4].map((d) => <path key={d} d={`M ${x + d * w} ${top + 20} q -6 -8 0 -16`} fill="none" stroke={shade} strokeWidth={3} />)}
      </g>
    )}
    <rect x={x - w * 0.66} y={bot - 20} width={w * 1.32} height={20} rx={4} fill={fill} stroke={KRP.ink} strokeWidth={3.5} />
  </g>
);
const Yw053: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.2, easeInOut(seg(f, 2, 30)));
  const iris = 340 * easeOut(seg(f, 20, 38));
  const open = easeOut(seg(f, 26, 40));
  const bx = lerp(-760, 80, seg(f, 0, 40));
  const IX = 960, IY = 560;
  return (
    <Frame f={f} seed={3053} bg={C.skyGray}>
      <g transform={cam(960, 560, k)}>
        <rect x={-40} y={-40} width={W + 80} height={760} fill={C.skyGray} />
        <rect x={-40} y={300} width={W + 80} height={420} fill={C.skyGray2} opacity={0.5} />
        {[[200, 120, 1], [760, 70, 0.8], [1400, 110, 1.1], [1800, 60, 0.9]].map(([cx0, cy, cs], i) => (
          <g key={i} transform={`translate(${((cx0 + f * 1.6) % 2200) - 140} ${cy}) scale(${cs})`}>
            <ellipse cx={0} cy={0} rx={170} ry={46} fill={C.cloudGray} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            <ellipse cx={-60} cy={-24} rx={80} ry={40} fill={C.cloudGray} />
            <ellipse cx={50} cy={-30} rx={90} ry={44} fill={C.cloudGray} />
          </g>
        ))}
        {/* 両翼の列柱 */}
        {[0, 1].map((side) => (
          <g key={side}>
            <rect x={side ? 1500 : 0} y={330} width={420} height={370} fill={C.portico} stroke={KRP.ink} strokeWidth={4} />
            <rect x={side ? 1490 : -10} y={300} width={440} height={40} fill={C.portland} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 4 }, (_, i) => <L1bColumn key={i} x={(side ? 1550 : 50) + i * 110} top={340} bot={700} w={52} />)}
          </g>
        ))}
        {/* 中央の破風 */}
        <rect x={420} y={360} width={1080} height={340} fill={C.portico} stroke={KRP.ink} strokeWidth={4} />
        <rect x={900} y={460} width={120} height={240} fill={C.museumDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={888} y={448} width={144} height={16} fill={C.portland} stroke={KRP.ink} strokeWidth={3} />
        {[560, 700, 1220, 1360].map((wx) => <rect key={wx} x={wx - 30} y={480} width={60} height={110} fill={C.museumWall} stroke={KRP.ink} strokeWidth={3.5} />)}
        <path d="M 400 300 L 960 150 L 1520 300 Z" fill={C.portland} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 470 290 L 960 168 L 1450 290 Z" fill={C.portlandShade} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 15 }, (_, i) => {
          const x = 560 + i * 57;
          const hgt = 100 - Math.abs(i - 7) * 13;
          return (
            <g key={i}>
              <rect x={x - 12} y={290 - hgt * 0.8} width={24} height={hgt * 0.8} rx={8} fill={C.portland} stroke={KRP.ink} strokeWidth={2.5} />
              <circle cx={x} cy={290 - hgt * 0.8 - 10} r={10} fill={C.portland} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          );
        })}
        <rect x={400} y={300} width={1120} height={60} fill={C.portland} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 37 }, (_, i) => <rect key={i} x={410 + i * 30} y={346} width={16} height={12} fill={C.portlandShade} />)}
        {Array.from({ length: 8 }, (_, i) => <L1bColumn key={i} x={470 + i * 140} top={360} bot={700} w={66} />)}
        {/* 石段 */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={380 - i * 30} y={700 + i * 22} width={1160 + i * 60} height={24} fill={i % 2 ? C.portlandShade : C.portland} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 傘の見学者 */}
        {[[520, 0, "#4A78B8"], [610, 1, KRP.red], [1340, 2, KRP.green], [1430, 3, KRP.ink]].map(([px, ph, uc]) => {
          const x = px as number, s = 0.42;
          return (
            <g key={x}>
              <Person x={x} y={784} s={s} f={f} phase={ph as number} face={ph === 2 ? "smile" : "normal"} cloth={ph === 1 ? "#5E6A7A" : "#7A6A58"} clothDark="#3E4450" gaze={[0, -1]} />
              <line x1={x + 28} y1={784 - 60} x2={x + 28} y2={784 - 160} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${x - 52} ${784 - 150} Q ${x + 28} ${784 - 230} ${x + 108} ${784 - 150} Z`} fill={uc as string} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${Math.sin(f / 8 + x) * 3} ${x + 28} ${784 - 160})`} />
            </g>
          );
        })}
        {/* 鉄柵 */}
        <rect x={-40} y={800} width={W + 80} height={80} fill={C.pave} />
        {Array.from({ length: 50 }, (_, i) => (
          <g key={i}>
            <line x1={i * 40} y1={808} x2={i * 40} y2={880} stroke={C.railBlack} strokeWidth={5} />
            <path d={`M ${i * 40 - 6} 810 L ${i * 40} 796 L ${i * 40 + 6} 810 Z`} fill={YP.brass} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ))}
        <line x1={-40} y1={830} x2={W + 40} y2={830} stroke={C.railBlack} strokeWidth={5} />
        <rect x={-40} y={880} width={W + 80} height={240} fill={C.road} />
        {/* 街灯 */}
        {[300, 1640].map((lx0) => (
          <g key={lx0}>
            <rect x={lx0 - 6} y={600} width={12} height={280} fill={C.railBlack} />
            <path d={`M ${lx0 - 24} 600 L ${lx0 + 24} 600 L ${lx0 + 16} 560 L ${lx0 - 16} 560 Z`} fill={YP.glowCore} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 旗 */}
        <rect x={196} y={200} width={8} height={680} fill={C.railBlack} />
        <circle cx={200} cy={196} r={8} fill={YP.brass} stroke={KRP.ink} strokeWidth={2.5} />
        <L1bUnionJack x={204} y={206} w={210} f={f} id="l1b53-uj" />
        {/* 2階建てバス */}
        <g transform={`translate(${bx} 960)`}>
          <rect x={0} y={-310} width={540} height={290} rx={24} fill={C.busRed} stroke={KRP.ink} strokeWidth={6} />
          <rect x={0} y={-188} width={540} height={18} fill={C.awningB} stroke={KRP.ink} strokeWidth={3} />
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <rect x={24 + i * 100} y={-290} width={82} height={70} rx={8} fill={C.skyGray} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={56 + i * 100} cy={-246} r={14} fill={C.busRedDark} opacity={i % 2 ? 0.8 : 0} />
              <rect x={24 + i * 100} y={-156} width={82} height={64} rx={8} fill={C.skyGray} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ))}
          <rect x={500} y={-156} width={30} height={40} rx={4} fill={C.railBlack} />
          <circle cx={530} cy={-60} r={11} fill={YP.glowCore} stroke={KRP.ink} strokeWidth={3} />
          {[100, 430].map((wx) => (
            <g key={wx}><circle cx={wx} cy={-20} r={40} fill={C.railBlack} stroke={KRP.ink} strokeWidth={5} /><circle cx={wx} cy={-20} r={16} fill={KRP.gray} /></g>
          ))}
        </g>
        {/* 雨 */}
        {Array.from({ length: 60 }, (_, i) => {
          const x = (rnd(5301, i) * 2100 + f * 6) % 2100 - 90;
          const y = (rnd(5302, i) * 1100 + f * 26) % 1100 - 40;
          return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 30} stroke={C.storeGray} strokeWidth={3} opacity={0.55} />;
        })}
      </g>
      {/* 丸窓: 収蔵庫の引き出し */}
      {iris > 2 && (
        <g>
          <clipPath id="l1b53-iris"><circle cx={IX} cy={IY} r={iris} /></clipPath>
          <g clipPath="url(#l1b53-iris)">
            <rect x={IX - 360} y={IY - 360} width={720} height={720} fill={C.storeGray} />
            <rect x={IX - 340} y={IY - 320} width={680} height={560} fill={C.storeDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 6 }, (_, c) => Array.from({ length: 7 }, (_, r) => (
              <g key={`${c}-${r}`}>
                <rect x={IX - 334 + c * 112} y={IY - 314 + r * 79} width={104} height={72} fill={C.storeGray} stroke={KRP.ink} strokeWidth={3} />
                <rect x={IX - 300 + c * 112} y={IY - 284 + r * 79} width={36} height={10} rx={4} fill={YP.brass} stroke={KRP.ink} strokeWidth={2} />
                <rect x={IX - 324 + c * 112} y={IY - 308 + r * 79} width={30} height={18} fill={KRP.white} opacity={0.8} />
              </g>
            )))}
            <path d={`M ${IX - 90} ${IY - 360} L ${IX + 90} ${IY - 360} L ${IX + 300} ${IY + 200} L ${IX - 300} ${IY + 200} Z`} fill={C.spot} opacity={0.3} />
            {/* 引き出し */}
            <g transform={`translate(0 ${open * 90})`}>
              <path d={`M ${IX - 230} ${IY - 70} L ${IX + 230} ${IY - 70} L ${IX + 260} ${IY + 80} L ${IX - 260} ${IY + 80} Z`} fill={C.tissue} stroke={KRP.ink} strokeWidth={5} />
              {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${IX - 220 + i * 80} ${IY - 60} q 20 ${30 + i * 4} 10 ${120}`} fill="none" stroke={C.coatDark} strokeWidth={3} />)}
              <L1bDoll x={IX - 170} y={IY + 6} s={0.58} rot={90} f={f} clipId="l1b53-doll" light={Math.sin(f / 12) * 0.5} />
              <rect x={IX - 270} y={IY + 80} width={540} height={70} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
              <rect x={IX - 50} y={IY + 104} width={100} height={18} rx={8} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
              <rect x={IX - 190} y={IY + 96} width={90} height={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          </g>
          <circle cx={IX} cy={IY} r={iris} fill="none" stroke={KRP.ink} strokeWidth={16} />
          <circle cx={IX} cy={IY} r={iris} fill="none" stroke={KRP.white} strokeWidth={8} />
        </g>
      )}
      <TagPlate x={960} y={96} text="大英博物館" size={52} t={seg(f, 10, 20)} />
      <TagPlate x={200} y={440} text="ロンドン" size={40} t={seg(f, 4, 14)} />
    </Frame>
  );
};

// ---- 文#54 【山】 中に何かを詰めて、ふくらませる。この発想は、ずいぶん昔からあったのです。
// 設計: 左から右へ並べる「詰めてふくらませる物」の行列: 白鳥 (2000年以上前) → 布人形 (1500年以上前) → 今のくまのぬいぐるみ → `Squishy`。下に時代の矢印。f で順に中身が透けて見える (毛・ぼろ布・綿・ジェル)。世界=長い展示台
// どこ: 博物館の特別展示室。暗い壁、長い木の展示台に4つが左から年代順に並ぶ
// 演出: 白鳥 → 布人形 → くまのぬいぐるみ → スクイーズ。光の帯が左から右へ走り、当たった物の中身が順に透ける (毛・ぼろ布・綿・ジェル)。台の前面に時代の矢印。右端の学芸員が驚いて指さす
// 動き: 光の帯 f4〜38 / 中身 f6〜37 で順に / カメラが右へパン / 学芸員まばたき
const Yw054: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(50, -30, easeInOut(seg(f, 0, 40)));
  const r = [0, 1, 2, 3].map((i) => easeOut(seg(f, 6 + 8 * i, 13 + 8 * i)));
  const beam = lerp(120, 1700, seg(f, 4, 38));
  const TY = 660;
  const items = [
    { x: 300, name: "毛" }, { x: 700, name: "ぼろ布" }, { x: 1100, name: "綿" }, { x: 1480, name: "ジェル" },
  ];
  return (
    <Frame f={f} seed={3054} bg={C.museumWall}>
      <g transform={`translate(${pan} 0)`}>
        <rect x={-120} y={-40} width={W + 240} height={H + 80} fill={C.museumWall} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-80 + i * 250} y={80} width={210} height={360} rx={6} fill="none" stroke={C.museumDark} strokeWidth={6} opacity={0.7} />
        ))}
        <rect x={-120} y={40} width={W + 240} height={14} fill={C.frameWoodDark} />
        {/* 天井のスポット */}
        {items.map((it, i) => (
          <g key={i}>
            <rect x={it.x - 22} y={40} width={44} height={36} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3.5} />
            <path d={`M ${it.x - 18} 76 L ${it.x + 18} 76 L ${it.x + 190} ${TY} L ${it.x - 190} ${TY} Z`} fill={C.spot} opacity={0.1 + 0.18 * r[i]} />
          </g>
        ))}
        {/* 学芸員 (台の奥) */}
        <Person x={1790} y={760} s={1.05} f={f} face="surprised" pose="point" pointDir={-1} cloth={C.coat} clothDark={C.coatDark} gaze={[-1, 0]} phase={2} />
        <rect x={-120} y={TY - 10} width={W + 240} height={40} fill={C.plinthTop} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-120} y={TY + 30} width={W + 240} height={420} fill={C.frameWood} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={`b${i}`} x1={-120} y1={TY + 60 + i * 60} x2={W + 120} y2={TY + 60 + i * 60} stroke={C.frameWoodDark} strokeWidth={3} opacity={0.5} />)}
        {/* 4つの「詰めてふくらませる物」 */}
        <L1bSwan x={290} y={TY} s={0.74} f={f} clipId="l1b54-swan-a" />
        {r[0] > 0.01 && <g opacity={r[0]}><L1bSwan x={290} y={TY} s={0.74} f={f} section clipId="l1b54-swan-b" /></g>}
        <L1bDoll x={700} y={TY} s={0.72} f={f} clipId="l1b54-doll" light={Math.sin(f / 10)} />
        {r[1] > 0.01 && <L1bDollSection x={700} y={TY} s={0.72} f={60} a={0} b={10} clipId="l1b54-sec" op={r[1]} />}
        <L1bBear x={1100} y={TY} s={0.98} f={f} inside={r[2]} clipId="l1b54-bear" />
        <Squishy x={1480} y={TY} s={1.0} f={f} squeeze={0.08 * Math.sin(f / 5) + 0.08} />
        {r[3] > 0.01 && (
          <g opacity={r[3]}>
            <ellipse cx={1480} cy={TY - 82} rx={96} ry={62} fill={YP.sqDeep} opacity={0.55} />
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={1420 + rnd(5404, i) * 120} cy={TY - 130 + rnd(5405, i) * 100 - ((f * 2 + i * 13) % 30)} r={5 + rnd(5406, i) * 7}
                fill={YP.sqShine} stroke={YP.sqDent} strokeWidth={2} />
            ))}
          </g>
        )}
        {/* 光の帯 */}
        <rect x={beam - 70} y={80} width={140} height={TY - 80} fill={YP.glow} opacity={0.16} />
        <rect x={beam - 20} y={80} width={40} height={TY - 80} fill={YP.glowCore} opacity={0.22} />
        {/* 中身の札 */}
        {items.map((it, i) => <TagPlate key={i} x={it.x} y={300} text={it.name} size={36} t={r[i]} fill={YP.glowCore} />)}
        {/* 時代の矢印 */}
        <line x1={120} y1={TY + 62} x2={1640} y2={TY + 62} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
        <line x1={120} y1={TY + 62} x2={1640} y2={TY + 62} stroke={YP.brass} strokeWidth={8} strokeLinecap="round" />
        <path d={`M 1640 ${TY + 38} L 1690 ${TY + 62} L 1640 ${TY + 86} Z`} fill={YP.brass} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {items.map((it, i) => <circle key={i} cx={it.x} cy={TY + 62} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
        <TagPlate x={300} y={770} text="2000年以上前" size={32} t={seg(f, 2, 10)} />
        <TagPlate x={700} y={770} text="1500年以上前" size={32} t={seg(f, 10, 18)} />
        <path d="M 1060 735 L 1060 745 L 1520 745 L 1520 735" fill="none" stroke={KRP.white} strokeWidth={4} opacity={seg(f, 24, 30)} />
        <TagPlate x={1290} y={770} text="いま" size={32} t={seg(f, 24, 32)} />
      </g>
    </Frame>
  );
};

// ---- 文#55 【並】 次は、柔らかいものに、値段がつく話です。
// 設計: 白いガチョウの羽根が1枚ふわりと落ちてきて、天秤の皿に乗る。反対の皿に金貨。天秤が f でかたん。背景は木の机
// どこ: 古い商人の木の机 (しっくいの壁・窓からの光)。油ランプ・ろう板と尖筆・こぼれた金貨の袋
// 演出: 真鍮の天秤。左の皿には金貨3枚で傾いている。白いガチョウの羽根が1枚ふわふわ落ちてきて右の皿へ。天秤がかたんと水平に = 羽根に値段がつく
// 動き: 羽根が f0〜30 で揺れながら落ちる (カメラも下へ追う) → f30 着地の衝撃線 → 天秤が水平へ振れて止まる → f36〜42 で「=」
const Yw055: React.FC<{ f: number }> = ({ f }) => {
  const camY = lerp(-70, 0, easeInOut(seg(f, 0, 30)));
  const land = seg(f, 30, 42);
  const th = f < 30 ? -12 : -12 * (1 - land) + Math.sin(land * Math.PI * 3) * 5 * (1 - land);
  const BX = 960, BY = 330, L = 330, HANG = 230;
  const rad = (th * Math.PI) / 180;
  const lEnd = [BX - L * Math.cos(rad), BY - L * Math.sin(rad)] as const;
  const rEnd = [BX + L * Math.cos(rad), BY + L * Math.sin(rad)] as const;
  const lPan = [lEnd[0], lEnd[1] + HANG] as const, rPan = [rEnd[0], rEnd[1] + HANG] as const;
  const t = seg(f, 0, 30);
  const fx = f < 30 ? lerp(1500, rPan[0], t) + Math.sin(t * Math.PI * 3) * 90 * (1 - t) : rPan[0];
  const fy = f < 30 ? lerp(-140, rPan[1] - 14, easeInOut(t)) : rPan[1] - 14;
  const frot = f < 30 ? Math.sin(t * 11) * 35 * (1 - t) + 80 * t : 80;
  const hit = seg(f, 30, 36);
  const eq = pop(seg(f, 36, 42));
  const pan = (px: number, py: number, children?: React.ReactNode) => (
    <g>
      <line x1={px} y1={py - HANG} x2={px - 110} y2={py} stroke={KRP.ink} strokeWidth={4} />
      <line x1={px} y1={py - HANG} x2={px + 110} y2={py} stroke={KRP.ink} strokeWidth={4} />
      <line x1={px} y1={py - HANG} x2={px} y2={py} stroke={KRP.ink} strokeWidth={3} strokeDasharray="6 6" />
      {children}
      <path d={`M ${px - 130} ${py} Q ${px} ${py + 70} ${px + 130} ${py} Z`} fill={YP.brass} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${px - 90} ${py + 14} Q ${px} ${py + 40} ${px + 60} ${py + 22}`} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.5} />
    </g>
  );
  return (
    <Frame f={f} seed={3055} bg={C.plaster}>
      <g transform={`translate(0 ${camY})`}>
        <rect x={-40} y={-200} width={W + 80} height={760} fill={C.plaster} />
        {Array.from({ length: 20 }, (_, i) => (
          <path key={i} d={`M ${rnd(5501, i) * W} ${-150 + rnd(5502, i) * 640} q 30 -6 60 0`} fill="none" stroke={C.plasterShade} strokeWidth={3} opacity={0.6} />
        ))}
        {/* 窓の光 */}
        <rect x={120} y={-120} width={300} height={360} fill={C.skyHot} stroke={KRP.ink} strokeWidth={6} />
        <line x1={270} y1={-120} x2={270} y2={240} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 120 240 L 420 240 L 980 560 L 260 560 Z" fill={C.spot} opacity={0.3} />
        {/* 机 */}
        <rect x={-40} y={540} width={W + 80} height={600} fill={C.deskWood} />
        <rect x={-40} y={540} width={W + 80} height={20} fill={C.deskWoodDark} />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M -40 ${600 + i * 70} q 480 ${rnd(5503, i) * 30 - 15} 980 0 q 480 ${rnd(5504, i) * 30 - 15} 1020 0`} fill="none" stroke={C.deskWoodDark} strokeWidth={4} opacity={0.45} />
        ))}
        {/* 油ランプ */}
        <g transform="translate(260 640)">
          <ellipse cx={0} cy={10} rx={90} ry={14} fill={KRP.ink} opacity={0.15} />
          <path d="M -80 0 Q -70 -46 0 -48 Q 60 -46 84 -20 L 120 -26 Q 128 -14 116 -6 L 80 -2 Q 40 10 -80 0 Z" fill={C.lampBronze} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 118 -24 Q ${108 + Math.sin(f / 2) * 4} -70 ${122 + Math.sin(f / 3) * 3} -96 Q 140 -60 124 -24 Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={122} cy={-50} rx={8} ry={16} fill={C.flameCore} />
          <circle cx={122} cy={-60} r={90} fill={C.flame} opacity={0.1 + Math.sin(f / 3) * 0.03} />
        </g>
        {/* ろう板と尖筆 */}
        <g transform="rotate(-6 1560 700)">
          <rect x={1420} y={630} width={300} height={190} rx={8} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1444} y={652} width={252} height={146} fill={C.pompBlack} opacity={0.75} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M 1462 ${680 + i * 32} q 40 -8 80 0 q 40 8 120 -2`} fill="none" stroke={C.travertineShade} strokeWidth={3} />)}
          <line x1={1360} y1={800} x2={1600} y2={860} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          <line x1={1360} y1={800} x2={1600} y2={860} stroke={KRP.silver} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* こぼれた金貨の袋 */}
        <path d="M 460 790 Q 420 720 470 690 L 440 660 L 520 668 L 498 694 Q 560 720 540 790 Z" fill={C.sack} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {[[580, 790], [640, 806], [600, 820]].map(([cx, cy], i) => (
          <g key={i}><ellipse cx={cx} cy={cy} rx={28} ry={10} fill={KRP.gold} stroke={KRP.ink} strokeWidth={3} /></g>
        ))}
        {/* 天秤 */}
        <ellipse cx={BX} cy={772} rx={170} ry={22} fill={KRP.ink} opacity={0.16} />
        <path d={`M ${BX - 150} 770 L ${BX + 150} 770 L ${BX + 110} 720 L ${BX - 110} 720 Z`} fill={YP.wood} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={BX - 16} y={BY} width={32} height={392} fill={YP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={BX - 30} y={700} width={60} height={24} rx={6} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        {pan(lPan[0], lPan[1], (
          <g>
            {[0, 1, 2].map((i) => <L1bCoinSide key={i} x={lPan[0] - 6 + (i % 2) * 8} y={lPan[1] + 6 - i * 13} w={74} fill={KRP.gold} dark={YP.brassDark} />)}
            <circle cx={lPan[0] + 20} cy={lPan[1] - 40} r={6} fill={KRP.white} opacity={0.6 + 0.4 * Math.sin(f / 4)} />
          </g>
        ))}
        {pan(rPan[0], rPan[1])}
        <g transform={`rotate(${th} ${BX} ${BY})`}>
          <rect x={BX - L - 10} y={BY - 12} width={2 * L + 20} height={24} rx={12} fill={YP.brass} stroke={KRP.ink} strokeWidth={6} />
          {[-L, L].map((d) => <circle key={d} cx={BX + d} cy={BY} r={14} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />)}
          <path d={`M ${BX - 10} ${BY - 12} L ${BX} ${BY - 70} L ${BX + 10} ${BY - 12} Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle cx={BX} cy={BY} r={22} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 目盛り (水平の位置) */}
        <path d={`M ${BX - 50} ${BY - 110} A 60 60 0 0 1 ${BX + 50} ${BY - 110}`} fill="none" stroke={KRP.ink} strokeWidth={4} />
        <line x1={BX} y1={BY - 128} x2={BX} y2={BY - 112} stroke={KRP.ink} strokeWidth={5} />
        {/* 羽根 */}
        <L1bFeather x={fx} y={fy} s={1.15} rot={frot} />
        {/* 着地の衝撃 */}
        {hit > 0 && hit < 1 && (
          <g opacity={1 - hit} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
            {[-60, -20, 20, 60].map((d) => (
              <line key={d} x1={rPan[0] + d * (1 + hit)} y1={rPan[1] - 30 - hit * 30} x2={rPan[0] + d * (1.4 + hit)} y2={rPan[1] - 60 - hit * 40} />
            ))}
          </g>
        )}
        {/* = */}
        {eq > 0 && (
          <g transform={`translate(${BX} ${BY - 190}) scale(${eq})`}>
            <circle r={54} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-28} y={-18} width={56} height={12} rx={6} fill={KRP.red} />
            <rect x={-28} y={6} width={56} height={12} rx={6} fill={KRP.red} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- 文#56 【山】 第3章、羽毛のために、持ち場を離れた男。
// 設計: 章扉。ローマの街並み (赤い瓦屋根・円柱・コロッセウムの遠景)、空から白い羽根がたくさん舞い降りる。`ChapterDoor` (num=3)
// どこ: 古代ローマの街 (遠くにコロッセウムと水道橋・赤い瓦屋根の家並み・糸杉・神殿の円柱・石畳)
// 演出: 空から白い羽根がたくさん舞い降りる。左手前で見張りのローマ兵が、詰所に槍と盾を置いたまま羽根に手を伸ばして持ち場を離れかけている。右に章の題字
// 動き: 羽根が f で降り続ける / 兵がじりじり右へ (足元に砂ぼこり) / 題字 f4〜20 / カメラが少し上へ振る
const Yw056: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const camY = lerp(30, 0, easeInOut(seg(f, 0, 40)));
  const k = lerp(1.04, 1.0, easeInOut(seg(f, 0, 40)));
  const sx = lerp(560, 640, easeInOut(seg(f, 8, 40)));
  return (
    <Frame f={f} seed={3056} bg={C.romeSky}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={3} title="羽毛のために、持ち場を離れた男" t={door} left={1000} top={560} />
      </>}>
      <g transform={cam(960, 540, k, 0, camY)}>
        <rect x={-40} y={-80} width={W + 80} height={700} fill={C.romeSky} />
        <rect x={-40} y={260} width={W + 80} height={360} fill={C.romeSky2} opacity={0.45} />
        <circle cx={1580} cy={140} r={70} fill={C.flameCore} opacity={0.8} />
        {/* 遠くの丘 */}
        <path d="M -40 470 Q 200 380 420 440 Q 700 360 980 430 Q 1300 350 1600 420 Q 1800 380 1960 430 L 1960 620 L -40 620 Z" fill={C.hillFar} opacity={0.8} />
        {/* コロッセウム */}
        <g transform="translate(1420 470)">
          <path d="M -290 0 L -290 -200 Q 0 -240 290 -200 L 290 0 Z" fill={C.travertine} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <line x1={-290} y1={-60 - r * 50} x2={290} y2={-60 - r * 50} stroke={KRP.ink} strokeWidth={3.5} />
              {Array.from({ length: 11 }, (_, i) => (
                <path key={i} d={`M ${-262 + i * 50} ${-6 - r * 50} L ${-262 + i * 50} ${-34 - r * 50} Q ${-250 + i * 50} ${-48 - r * 50} ${-238 + i * 50} ${-34 - r * 50} L ${-238 + i * 50} ${-6 - r * 50} Z`}
                  fill={C.travertineShade} stroke={KRP.ink} strokeWidth={2.5} />
              ))}
            </g>
          ))}
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-276 + i * 40} y={-196} width={14} height={20} fill={C.travertineShade} />)}
        </g>
        {/* 水道橋 */}
        <g>
          <rect x={1700} y={420} width={260} height={18} fill={C.travertine} stroke={KRP.ink} strokeWidth={3.5} />
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d={`M ${1704 + i * 52} 438 L ${1704 + i * 52} 560 L ${1716 + i * 52} 560 Q ${1730 + i * 52} 470 ${1744 + i * 52} 560 L ${1756 + i * 52} 560 L ${1756 + i * 52} 438`}
              fill={C.travertine} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 家並み (赤い瓦屋根) */}
        {Array.from({ length: 13 }, (_, i) => {
          const x = -60 + i * 160 + (i % 2) * 20, w = 150 + (i % 3) * 20, top = 480 + ((i * 37) % 70);
          return (
            <g key={i}>
              <rect x={x} y={top} width={w} height={700 - top} fill={i % 2 ? C.stucco : C.stuccoShade} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${x - 14} ${top} L ${x + w / 2} ${top - 46} L ${x + w + 14} ${top} Z`} fill={C.roofTile} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
              {[0.25, 0.5, 0.75].map((q) => <line key={q} x1={x + w * q} y1={top - 46 * (1 - Math.abs(q - 0.5) * 2) + 4} x2={x + w * q} y2={top} stroke={C.roofTileDark} strokeWidth={3} />)}
              {[0, 1].map((j) => <rect key={j} x={x + 24 + j * (w - 74)} y={top + 40} width={26} height={36} fill={C.museumWall} stroke={KRP.ink} strokeWidth={3} />)}
            </g>
          );
        })}
        {/* 糸杉 */}
        {[180, 760, 1210, 1650].map((cx, i) => (
          <g key={i}>
            <path d={`M ${cx} ${420 - i * 10} Q ${cx + 34} 520 ${cx + 22} 640 L ${cx - 22} 640 Q ${cx - 34} 520 ${cx} ${420 - i * 10} Z`} fill={C.cypress} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${cx} ${450 - i * 10} Q ${cx + 10} 540 ${cx + 4} 630`} fill="none" stroke={C.cypressDark} strokeWidth={4} />
          </g>
        ))}
        {/* 手前の神殿の円柱 */}
        <rect x={-40} y={210} width={420} height={50} fill={C.travertine} stroke={KRP.ink} strokeWidth={5} />
        {[30, 150, 270].map((cx) => <L1bColumn key={cx} x={cx} top={260} bot={790} w={74} fill={C.travertine} shade={C.travertineShade} ionic={false} />)}
        {/* 石畳 */}
        <rect x={-40} y={760} width={W + 80} height={400} fill={C.pave} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 48 }, (_, i) => (
          <path key={i} d={`M ${(i % 12) * 170 - 20 + (Math.floor(i / 12) % 2) * 80} ${780 + Math.floor(i / 12) * 70} q 60 -10 130 0 q 10 30 -10 56 q -60 10 -120 0 Z`}
            fill={i % 3 ? C.pave : C.paveDark} stroke={KRP.ink} strokeWidth={2.5} opacity={0.8} />
        ))}
        {/* 詰所: 置いていった槍と盾 */}
        <rect x={300} y={560} width={150} height={240} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 286 560 L 375 510 L 464 560 Z" fill={C.roofTile} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={322} y={600} width={106} height={190} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={3.5} />
        <line x1={300} y1={830} x2={360} y2={420} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={300} y1={830} x2={360} y2={420} stroke={YP.wood} strokeWidth={6} strokeLinecap="round" />
        <path d="M 360 420 L 350 380 L 372 418 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
        <g transform="rotate(-8 400 700)">
          <rect x={340} y={600} width={120} height={200} rx={16} fill={C.tunicRed} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={400} cy={700} r={22} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 400 620 L 390 670 L 410 670 L 396 730" fill="none" stroke={YP.brass} strokeWidth={6} />
        </g>
        {/* 歩き出した足元の砂ぼこり */}
        {[0, 1, 2].map((i) => {
          const a = ((f + i * 9) % 27) / 27;
          return <circle key={i} cx={sx - 60 - a * 60} cy={920 - a * 20} r={10 + a * 22} fill="none" stroke={C.paveDark} strokeWidth={4} opacity={(1 - a) * 0.7} />;
        })}
        {/* ローマ兵 */}
        <Person x={sx} y={930} s={1.55} f={f} face="surprised" pose="raise" cloth={C.tunicRed} clothDark={C.tunicRedDark} hair="none" gaze={[1, -1]} lean={6} phase={1} />
        <L1bOver x={sx} y={930} s={1.55} f={f} phase={1} lean={6}><L1bHelmet /></L1bOver>
        {/* 羽根 (たくさん) */}
        {Array.from({ length: 44 }, (_, i) => {
          const spd = 5 + rnd(5601, i) * 6;
          const y = ((f * spd + rnd(5602, i) * 1250) % 1250) - 140;
          const x = rnd(5603, i) * 2000 - 40 + Math.sin((f + i * 7) / 9) * 34;
          return <L1bFeather key={i} x={x} y={y} s={0.32 + rnd(5604, i) * 0.3} rot={Math.sin((f + i * 5) / 11) * 50 + rnd(5605, i) * 120 - 60} op={0.95} />;
        })}
        {/* 兵がつかもうとする1枚 */}
        <L1bFeather x={sx + 140 + Math.sin(f / 7) * 20} y={lerp(300, 410, seg(f, 0, 40))} s={0.75} rot={30 + Math.sin(f / 6) * 20} />
      </g>
    </Frame>
  );
};

// ---- 文#57 【山】 舞台は、およそ2000年前の、ローマ帝国です。
// 設計: ローマの広場 (フォルム)。神殿の円柱・石畳・トーガの市民たち・パン屋・噴水。隅に `AgeDial` (s≈0.55、label「約2000年前」)。札「ローマ帝国」
// どこ: ローマのフォルム (広場)。正面に円柱6本の神殿、左右に列柱のバシリカ、手前に石畳と噴水、左にパン屋の屋台
// 演出: トーガの市民たちが行き交う。SPQR の軍旗。噴水の前をガチョウがよちよち横切り、市民の1人が足元を見て驚く (=次の主役の予告)。隅に年代ダイヤル
// 動き: ダイヤルが回って「約2000年前」で止まる (f0〜26) / 噴水の水 / ガチョウが右から左へ / 市民が歩く / カメラが少し寄る
const L1bLoaf: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={36} ry={22} fill={C.loaf} stroke={KRP.ink} strokeWidth={3.5} />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <line key={i} x1={Math.cos(a) * 6} y1={Math.sin(a) * 4} x2={Math.cos(a) * 30} y2={Math.sin(a) * 18} stroke={C.loafDark} strokeWidth={2.5} />;
    })}
    <ellipse cx={0} cy={-2} rx={8} ry={5} fill={C.loafDark} />
  </g>
);
const Yw057: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.05, easeInOut(seg(f, 0, 40)));
  const spin = lerp(-420, 0, easeOut(seg(f, 0, 26)));
  const gx = lerp(1480, 1385, seg(f, 0, 42));
  const walk = (base: number, sp: number) => base + Math.sin(f / 30) * 0 + f * sp;
  return (
    <Frame f={f} seed={3057} bg={KRP.blueSoft}>
      <g transform={cam(960, 520, k)}>
        <rect x={-40} y={-40} width={W + 80} height={640} fill={KRP.blueSoft} />
        {[[300, 90], [1500, 60]].map(([cx, cy], i) => (
          <ellipse key={i} cx={cx + f * 1.2} cy={cy} rx={150} ry={34} fill={KRP.white} opacity={0.8} />
        ))}
        {/* 左右のバシリカ (アーチの列) */}
        {[0, 1].map((side) => (
          <g key={side}>
            <rect x={side ? 1340 : -40} y={300} width={620} height={300} fill={C.travertine} stroke={KRP.ink} strokeWidth={5} />
            <rect x={side ? 1330 : -50} y={280} width={640} height={30} fill={C.travertineShade} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1].map((r) => Array.from({ length: 6 }, (_, i) => (
              <path key={`${r}-${i}`} d={`M ${(side ? 1360 : -20) + i * 100} ${440 + r * 150} L ${(side ? 1360 : -20) + i * 100} ${370 + r * 150} Q ${(side ? 1395 : 15) + i * 100} ${330 + r * 150} ${(side ? 1430 : 50) + i * 100} ${370 + r * 150} L ${(side ? 1430 : 50) + i * 100} ${440 + r * 150} Z`}
                fill={C.museumWall} opacity={0.75} stroke={KRP.ink} strokeWidth={3} />
            )))}
          </g>
        ))}
        {/* 神殿 */}
        <rect x={600} y={520} width={720} height={80} fill={C.travertineShade} stroke={KRP.ink} strokeWidth={5} />
        <rect x={610} y={260} width={700} height={260} fill={C.portico} stroke={KRP.ink} strokeWidth={4} />
        <rect x={890} y={330} width={140} height={190} fill={C.museumDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 590 210 L 960 110 L 1330 210 Z" fill={C.travertine} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 650 202 L 960 126 L 1270 202 Z" fill={C.travertineShade} />
        <circle cx={960} cy={172} r={22} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
        <rect x={590} y={210} width={740} height={50} fill={C.travertine} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <L1bColumn key={i} x={650 + i * 124} top={260} bot={520} w={64} fill={C.travertine} shade={C.travertineShade} ionic={false} />)}
        {[0, 1, 2].map((i) => <rect key={i} x={640 + i * 20} y={560 + i * 14} width={640 - i * 40} height={14} fill={C.travertine} stroke={KRP.ink} strokeWidth={2.5} />)}
        {/* 軍旗 SPQR */}
        <rect x={1396} y={150} width={8} height={460} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={2} />
        <path d="M 1360 170 L 1440 170" stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1400} cy={140} r={16} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`skewX(${Math.sin(f / 7) * 3})`}>
          <path d="M 1362 172 L 1438 172 L 1438 300 L 1400 284 L 1362 300 Z" fill={C.tunicRed} stroke={KRP.ink} strokeWidth={4} />
          <text x={1400} y={238} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={YP.brass}>SPQR</text>
        </g>
        {/* 石畳 (遠近) */}
        <path d="M -40 600 L 1960 600 L 1960 1120 L -40 1120 Z" fill={C.pave} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => <line key={`r${i}`} x1={-40} y1={620 + i * i * 7 + i * 20} x2={1960} y2={620 + i * i * 7 + i * 20} stroke={C.paveDark} strokeWidth={3} />)}
        {Array.from({ length: 15 }, (_, i) => <line key={`c${i}`} x1={960 + (i - 7) * 90} y1={600} x2={960 + (i - 7) * 330} y2={1100} stroke={C.paveDark} strokeWidth={3} />)}
        {/* パン屋の屋台 */}
        <g>
          <rect x={60} y={430} width={400} height={30} fill={C.awningA} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${60 + i * 50} 460 q 25 30 50 0`} fill={i % 2 ? C.awningB : C.awningA} stroke={KRP.ink} strokeWidth={3} />)}
          {[70, 450].map((px) => <rect key={px} x={px - 6} y={460} width={12} height={250} fill={YP.wood} stroke={KRP.ink} strokeWidth={3} />)}
          <Person x={250} y={760} s={0.95} f={f} face="smile" pose="hold" cloth={C.awningB} clothDark={C.sackDark} phase={3} gaze={[1, 0]} />
          <L1bLoaf x={250} y={648} s={0.9} />
          <rect x={60} y={660} width={400} height={120} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
          {[110, 180, 250, 320, 390].map((lx0, i) => <L1bLoaf key={i} x={lx0} y={652 - (i % 2) * 6} s={0.8} />)}
          <path d={`M 230 610 q -6 -20 4 -36 M 270 606 q 8 -18 -2 -34`} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.5 + 0.3 * Math.sin(f / 5)} />
        </g>
        {/* 噴水 */}
        <ellipse cx={960} cy={780} rx={240} ry={52} fill={C.travertine} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={960} cy={770} rx={206} ry={36} fill={C.water} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1, 2].map((i) => {
          const a = ((f / 14 + i / 3) % 1);
          return <ellipse key={i} cx={960} cy={770} rx={40 + a * 150} ry={8 + a * 24} fill="none" stroke={KRP.white} strokeWidth={3} opacity={1 - a} />;
        })}
        <rect x={944} y={640} width={32} height={130} fill={C.travertine} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 900 640 Q 960 672 1020 640 Z" fill={C.travertine} stroke={KRP.ink} strokeWidth={4} />
        {[-1, 1].map((d) => (
          <path key={d} d={`M 960 630 Q ${960 + d * 70} ${560 + Math.sin(f / 3) * 6} ${960 + d * 120} 760`} fill="none" stroke={C.water} strokeWidth={8} strokeLinecap="round" strokeDasharray="20 10" strokeDashoffset={-f * 4} />
        ))}
        {/* 市民たち */}
        {[[walk(520, 0.6), 860, 0, "normal"], [walk(1500, -0.5), 880, 2, "smile"]].map(([px, py, ph, fc], i) => (
          <g key={i}>
            <Person x={px as number} y={py as number} s={0.95} f={f} face={fc as "normal"} cloth={C.toga} clothDark={C.togaDark} phase={ph as number} gaze={[i ? -1 : 1, 0]} />
            <L1bOver x={px as number} y={py as number} s={0.95} f={f} phase={ph as number}><L1bToga /></L1bOver>
          </g>
        ))}
        <Person x={1290} y={850} s={0.95} f={f} face="surprised" cloth="#9FB4C9" clothDark="#7E95AC" phase={4} gaze={[1, 1]} lean={5} />
        <L1bGoose x={gx} y={846} s={0.62} f={f} dir={-1} phase={1} />
        {/* ハト */}
        {[0, 1].map((i) => <path key={i} d={`M ${400 + i * 1100 + f * 3} ${150 + i * 40} q 14 -14 28 0 q 14 -14 28 0`} fill="none" stroke={KRP.ink} strokeWidth={4} />)}
      </g>
      <AgeDial x={250} y={300} s={0.5} spin={spin} label="約2000年前" handle={spin * 3} />
      <TagPlate x={1600} y={96} text="ローマ帝国" size={50} t={seg(f, 12, 22)} />
    </Frame>
  );
};

// ---- 文#58 【山】 この時代、柔らかいものの代表といえば、ガチョウの羽毛でした。
// 設計: 裕福なローマの家の寝室。寝椅子の上に、ふくらんだ羽毛のクッション。窓の外の中庭にガチョウが3羽。召使いの Person がクッションをぽんぽん叩くと羽毛が舞う
// どこ: 裕福なローマの家の寝室 (ポンペイ風の赤い壁画・白黒モザイクの床)。奥の開口部から列柱の中庭が見え、ガチョウが3羽
// 演出: 脚に彫刻のある寝椅子に、紫の布のふくらんだ羽毛クッション。召使いが身をかがめてぽんぽん叩くと、羽毛がふわっと舞い上がる
// 動き: 叩く f12/20/28/36 でクッションがへこみ、羽毛が舞う (f45 に空中に何枚も) / 中庭のガチョウが歩きついばむ / カメラが少し右へ
const Yw058: React.FC<{ f: number }> = ({ f }) => {
  const pats = [12, 20, 28, 36];
  const bump = (a: number) => (a >= 0 && a <= 5 ? Math.sin((a / 5) * Math.PI) : 0);
  const pp = Math.max(...pats.map((p) => bump(f - p + 2)));
  const lean = -20 - 8 * pp;
  const sq = pp * 0.12;
  const pan = lerp(30, -20, easeInOut(seg(f, 0, 40)));
  const CX = 1200, CY = 712;
  return (
    <Frame f={f} seed={3058} bg={C.pompRed}>
      <g transform={`translate(${pan} 0)`}>
        {/* 壁画の壁 */}
        <rect x={-80} y={-40} width={W + 160} height={760} fill={C.pompRed} />
        <rect x={-80} y={-40} width={W + 160} height={70} fill={C.pompBlack} />
        <rect x={-80} y={560} width={W + 160} height={160} fill={C.pompBlack} />
        {[1000, 1420, 1780].map((px, i) => (
          <g key={i}>
            <rect x={px - 150} y={80} width={300} height={440} fill="none" stroke={C.pompOchre} strokeWidth={6} />
            <rect x={px - 132} y={98} width={264} height={404} fill="none" stroke={C.pompRedDark} strokeWidth={3} />
            <path d={`M ${px - 40} 300 q 40 -40 80 0 q -40 40 -80 0`} fill="none" stroke={C.pompOchre} strokeWidth={4} />
            <path d={`M ${px - 60} 180 q 60 30 120 0`} fill="none" stroke={C.gardenDark} strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-80 + i * 70} y={600} width={40} height={10} fill={C.pompOchre} opacity={0.7} />)}
        {/* 中庭への開口部 */}
        <rect x={140} y={110} width={560} height={450} fill={C.garden} stroke={KRP.ink} strokeWidth={6} />
        <rect x={140} y={110} width={560} height={150} fill={KRP.blueSoft} />
        {[200, 420, 640].map((cx) => <L1bColumn key={cx} x={cx} top={160} bot={470} w={40} fill={C.stucco} shade={C.stuccoShade} ionic={false} />)}
        <rect x={140} y={140} width={560} height={24} fill={C.roofTile} stroke={KRP.ink} strokeWidth={3} />
        <rect x={140} y={470} width={560} height={90} fill={C.gardenDark} />
        <ellipse cx={420} cy={515} rx={110} ry={18} fill={C.water} stroke={KRP.ink} strokeWidth={3} />
        {[[260, 1], [470, 2], [600, 3]].map(([gx0, ph], i) => (
          <L1bGoose key={i} x={gx0 + Math.sin((f + ph * 20) / 20) * 20} y={548} s={0.42} f={f} dir={i === 1 ? -1 : 1} phase={ph} peck={i === 2 && Math.sin(f / 8) > 0 ? 1 : 0} />
        ))}
        {[170, 680].map((bx) => <ellipse key={bx} cx={bx} cy={470} rx={46} ry={36} fill={C.gardenDark} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={140} y={110} width={560} height={450} fill="none" stroke={KRP.ink} strokeWidth={8} />
        {/* モザイクの床 */}
        <rect x={-80} y={720} width={W + 160} height={400} fill={C.mosaicW} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-60 + i * 52} y={740} width={26} height={26} fill={C.mosaicB} transform={`rotate(45 ${-47 + i * 52} 753)`} />)}
        <line x1={-80} y1={790} x2={W + 80} y2={790} stroke={C.mosaicB} strokeWidth={6} />
        {/* 召使い (寝椅子の奥) */}
        <Person x={1400} y={707} s={1.32} f={f} face="smile" pose="hold" cloth={C.awningB} clothDark={C.sackDark} lean={lean} phase={2} gaze={[-1, 1]} />
        {/* 寝椅子 */}
        <rect x={560} y={720} width={840} height={60} rx={10} fill={YP.wood} stroke={KRP.ink} strokeWidth={6} />
        {[600, 960, 1360].map((lx0) => (
          <g key={lx0}>
            <path d={`M ${lx0 - 14} 780 L ${lx0 + 14} 780 L ${lx0 + 20} 810 L ${lx0 + 10} 830 L ${lx0 + 18} 870 L ${lx0 - 18} 870 L ${lx0 - 10} 830 L ${lx0 - 20} 810 Z`} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lx0} cy={812} r={8} fill={YP.brass} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
        <path d="M 570 720 Q 520 640 560 580 Q 600 560 620 600 Q 600 650 640 720 Z" fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={566} cy={598} r={16} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
        <rect x={600} y={690} width={780} height={40} rx={18} fill={C.mattress} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={630 + i * 62} y1={694} x2={630 + i * 62} y2={726} stroke={C.sackDark} strokeWidth={4} />)}
        {/* 羽毛クッション */}
        <g transform={`translate(${CX} ${CY}) scale(${1 + sq * 0.6} ${1 - sq})`}>
          <path d="M -170 -10 Q -190 -110 -140 -150 Q 0 -176 140 -150 Q 190 -110 170 -10 Q 0 6 -170 -10 Z" fill={C.cushion} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -150 -30 Q 0 -10 150 -30" fill="none" stroke={C.goldTrim} strokeWidth={6} />
          <path d="M -120 -120 Q -40 -150 40 -146" fill="none" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.25} />
          <path d={`M -40 -150 Q 0 ${-120 + pp * 26} 40 -150`} fill="none" stroke={C.cushionDark} strokeWidth={5} />
          {[[-170, -10], [170, -10], [-140, -150], [140, -150]].map(([tx, ty], i) => (
            <g key={i}><circle cx={tx} cy={ty} r={10} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${tx} ${ty + 8} l -6 22 l 12 0 Z`} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={2.5} /></g>
          ))}
          <path d="M -60 -100 q 6 -10 14 -4" fill="none" stroke={KRP.white} strokeWidth={3} />
        </g>
        {/* 叩いた衝撃 */}
        {pp > 0.2 && [-1, 0, 1].map((d) => (
          <line key={d} x1={CX + 40 + d * 40} y1={CY - 190} x2={CX + 50 + d * 56} y2={CY - 226} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={pp} />
        ))}
        {/* 舞う羽毛 */}
        {pats.flatMap((p, pi) => Array.from({ length: 6 }, (_, i) => {
          const a = f - p;
          if (a <= 0 || a > 40) return null;
          const vx = (rnd(5801, pi * 10 + i) - 0.7) * 14, vy = 5 + rnd(5802, pi * 10 + i) * 6;
          const x = CX - 60 + (rnd(5803, pi * 10 + i) - 0.5) * 240 + vx * a + Math.sin((a + i * 5) / 5) * 16;
          const y = CY - 150 - vy * a * (1 - a / 60) ;
          return <L1bFeather key={`${pi}-${i}`} x={x} y={y} s={0.28 + rnd(5804, pi * 10 + i) * 0.14} rot={Math.sin((a + i) / 4) * 60} op={clamp01((40 - a) / 12)} />;
        }))}
        {/* 小机と油ランプ */}
        <rect x={1560} y={640} width={160} height={20} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
        {[1580, 1700].map((lx0) => <rect key={lx0} x={lx0 - 5} y={660} width={10} height={160} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={3} />)}
        <path d="M 1590 640 Q 1600 610 1640 608 Q 1680 610 1690 630 L 1712 626 L 1708 640 Z" fill={C.lampBronze} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 1708 626 Q ${1704 + Math.sin(f / 2) * 3} 596 1714 580 Q 1726 600 1714 626 Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
      <TagPlate x={1500} y={130} text="ガチョウの羽毛" size={42} t={seg(f, 14, 24)} />
    </Frame>
  );
};

// ---- 文#59 【山】 博物学者のプリニウスは、『博物誌』という大きな本に、羽毛のことを書き残しています。
// 設計: プリニウスの書斎。山積みの巻物、ランプ、窓の外にヴェスヴィオ山。プリニウス (トーガ・年配) が羽ペンで巻物に書いている。巻物にガチョウの絵。札「プリニウス」「博物誌」
// どこ: プリニウスの書斎。しっくい壁、巻物がぎっしり詰まった棚 (巻ごとに番号札)、窓の外にナポリ湾とヴェスヴィオ山
// 演出: 年配のプリニウス (白いトーガ・白髪) が机に広げた巻物に、ペンでガチョウの絵を描いている。机の端には37巻ぶんの巻物の山。油ランプが揺れる
// 動き: ペン先がガチョウの輪郭をなぞって絵が描き上がる (f6〜38) / ランプの炎 / 窓の雲 / カメラが机へ寄る
const GOOSE_PTS: [number, number][] = [[-60, 10], [-46, -6], [-10, -14], [26, -14], [34, -36], [40, -54], [50, -60], [66, -54], [50, -46], [44, -32], [48, -8], [34, 12], [-10, 18], [-60, 10]];
const Yw059: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.07, easeInOut(seg(f, 0, 40)));
  const draw = easeInOut(seg(f, 6, 38));
  const GX = 905, GY = 716, GS = 1.25;
  const segs = GOOSE_PTS.length - 1;
  const pos = draw * segs;
  const n = Math.floor(pos);
  const fr = pos - n;
  const done = GOOSE_PTS.slice(0, n + 1).map(([x, y]) => [GX + x * GS, GY + y * GS] as const);
  const cur = n < segs
    ? [GX + lerp(GOOSE_PTS[n][0], GOOSE_PTS[n + 1][0], fr) * GS, GY + lerp(GOOSE_PTS[n][1], GOOSE_PTS[n + 1][1], fr) * GS] as const
    : [GX + GOOSE_PTS[segs][0] * GS, GY + GOOSE_PTS[segs][1] * GS] as const;
  const line = [...done, cur].map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const PX = 800, PY = 815, PS = 1.45;
  const hand = [PX + 14 * PS, PY - 118 * PS] as const;
  const flick = Math.sin(f / 2.3) * 4;
  return (
    <Frame f={f} seed={3059} bg={C.plaster}>
      <g transform={cam(880, 620, k)}>
        <rect x={-40} y={-40} width={W + 80} height={720} fill={C.plaster} />
        <rect x={-40} y={560} width={W + 80} height={100} fill={C.pompRed} opacity={0.75} />
        {/* 巻物の棚 */}
        <rect x={40} y={90} width={540} height={480} fill={C.shelfWood} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (
          <g key={`${r}-${c}`}>
            <rect x={60 + c * 128} y={108 + r * 114} width={116} height={102} fill={C.museumWall} stroke={KRP.ink} strokeWidth={3.5} />
            {Array.from({ length: 6 }, (_, i) => {
              const cx = 82 + c * 128 + (i % 3) * 36, cy = 178 + r * 114 - Math.floor(i / 3) * 34;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={15} fill={C.scroll} stroke={KRP.ink} strokeWidth={3} />
                  <circle cx={cx} cy={cy} r={5} fill={C.scrollRod} />
                </g>
              );
            })}
            <rect x={96 + c * 128} y={196 + r * 114} width={30} height={14} fill={C.parch} stroke={KRP.ink} strokeWidth={2} transform={`rotate(${Math.sin(f / 10 + r + c) * 6} ${111 + c * 128} ${196 + r * 114})`} />
          </g>
        )))}
        {/* 窓とヴェスヴィオ山 */}
        <rect x={1330} y={110} width={470} height={410} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={1450 + f * 1.4} cy={170} rx={80} ry={22} fill={KRP.white} opacity={0.9} />
        <path d="M 1330 400 L 1480 260 Q 1530 236 1580 262 L 1800 420 L 1800 440 L 1330 440 Z" fill={C.vesuvius} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1480 260 Q 1530 236 1580 262 L 1560 300 Q 1530 280 1500 300 Z" fill={C.vesuviusDark} />
        <rect x={1330} y={430} width={470} height={90} fill={C.bay} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1].map((i) => <path key={i} d={`M ${1380 + i * 200 + Math.sin(f / 6) * 10} ${466 + i * 20} q 20 -8 40 0 q 20 8 40 0`} fill="none" stroke={KRP.white} strokeWidth={3} />)}
        <path d={`M ${1620 + f * 2} 470 l 40 0 l -10 14 l -24 0 Z M ${1640 + f * 2} 470 l 0 -34 l 18 26 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
        <line x1={1565} y1={110} x2={1565} y2={520} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1300} y={510} width={530} height={26} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
        {/* プリニウス */}
        <Person x={PX} y={PY} s={PS} f={f} face="normal" pose="hold" cloth={C.toga} clothDark={C.togaDark} hair="none" gaze={[1, 1]} phase={1} lean={4} />
        <L1bOver x={PX} y={PY} s={PS} f={f} phase={1} lean={4}>
          <L1bElder />
          <path d="M -58 -162 Q -30 -168 -14 -160 L 60 -82 L 60 -56 L 34 -56 L -58 -144 Z" fill={C.togaDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={-14} cy={-118} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={14} cy={-118} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </L1bOver>
        {/* 机 */}
        <path d="M 300 650 L 1640 650 L 1700 800 L 240 800 Z" fill={YP.wood} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={300 + i * 4} y1={680 + i * 24} x2={1640 + i * 12} y2={680 + i * 24} stroke={YP.woodDark} strokeWidth={3} opacity={0.5} />)}
        <rect x={240} y={800} width={1460} height={90} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 広げた巻物 */}
        <path d="M 700 664 L 1250 664 L 1268 780 L 684 780 Z" fill={C.scroll} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <rect x={666} y={658} width={30} height={128} rx={14} fill={C.scrollEdge} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1252} y={658} width={30} height={128} rx={14} fill={C.scrollEdge} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M 1010 ${690 + i * 24} q 20 -6 40 0 q 20 6 40 0 q 20 -6 40 0 q 20 6 40 0 q 20 -6 40 0`} fill="none" stroke={KRP.grayDark} strokeWidth={3} />
        ))}
        {Array.from({ length: 4 }, (_, i) => <path key={`l${i}`} d={`M 718 ${690 + i * 24} q 20 -6 40 0 q 10 4 22 0`} fill="none" stroke={KRP.grayDark} strokeWidth={3} />)}
        {/* 描いている途中のガチョウの絵 */}
        <path d={line} fill="none" stroke={C.featherBlack} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" />
        {draw > 0.98 && (
          <g stroke={C.featherBlack} strokeWidth={3.5} strokeLinecap="round">
            <line x1={GX - 6} y1={GY + 20} x2={GX - 8} y2={GY + 40} /><line x1={GX + 12} y1={GY + 20} x2={GX + 14} y2={GY + 40} />
            <circle cx={GX + 52} cy={GY - 66} r={2.5} fill={C.featherBlack} />
          </g>
        )}
        {/* ペン (葦ペン) */}
        <line x1={hand[0]} y1={hand[1] - 40} x2={cur[0]} y2={cur[1]} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        <line x1={hand[0]} y1={hand[1] - 40} x2={cur[0]} y2={cur[1]} stroke={C.ragOchre} strokeWidth={5} strokeLinecap="round" />
        <circle cx={hand[0]} cy={hand[1]} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* インク壺 */}
        <rect x={1100} y={600} width={46} height={50} rx={10} fill={C.pompBlack} stroke={KRP.ink} strokeWidth={4} />
        {/* 博物誌の巻物の山 */}
        {Array.from({ length: 13 }, (_, i) => {
          const row = i < 5 ? 0 : i < 9 ? 1 : i < 12 ? 2 : 3;
          const idx = row === 0 ? i : row === 1 ? i - 5 : row === 2 ? i - 9 : 0;
          const cnt = [5, 4, 3, 1][row];
          return <L1bScroll key={i} x={1460 + (idx - (cnt - 1) / 2) * 44} y={636 - row * 30} len={190} r={15} rot={0} />;
        })}
        {[["I", 1370, 660], ["XII", 1460, 660], ["XXXVII", 1550, 660]].map(([t, x, y]) => (
          <g key={t as string}>
            <line x1={x as number} y1={652} x2={x as number} y2={668} stroke={KRP.ink} strokeWidth={2} />
            <rect x={(x as number) - 32} y={y as number} width={64} height={24} rx={3} fill={C.parch} stroke={KRP.ink} strokeWidth={2.5} />
            <text x={x as number} y={(y as number) + 18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={16} fill={KRP.ink}>{t}</text>
          </g>
        ))}
        {/* 油ランプ */}
        <g transform="translate(470 668)">
          <circle cx={60} cy={-70} r={110 + Math.sin(f / 3) * 6} fill={C.flame} opacity={0.12} />
          <path d="M -60 0 Q -50 -40 0 -42 Q 40 -40 60 -20 L 86 -24 Q 92 -12 84 -6 L 56 -2 Q 30 8 -60 0 Z" fill={C.lampBronze} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 84 -22 Q ${74 + flick} -66 ${88 + flick * 0.5} -94 Q 106 -58 90 -22 Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={88} cy={-46} rx={7} ry={15} fill={C.flameCore} />
        </g>
        <TagPlate x={480} y={760} text="プリニウス" size={44} t={seg(f, 8, 18)} />
        <TagPlate x={1470} y={470} text="博物誌" size={46} t={seg(f, 16, 26)} />
      </g>
    </Frame>
  );
};

// ---- 文#60 【山】 いちばん評判がよかったのは、ゲルマニア、いまのドイツのあたりの、白い小さなガチョウの羽毛でした。
// 設計: ヨーロッパの地図 (世界=古い羊皮紙)。北のゲルマニアの森と川、そこに白い小さなガチョウの群れ。南のローマへ羽毛の袋を運ぶ荷車の点線。札「ゲルマニア」「いまのドイツ」
// どこ: 木の机に広げた古い羊皮紙のヨーロッパ地図 (焦げたふち・羅針図・帆船)。ローマの領土は薄赤、国境はライン川とドナウ川
// 演出: 国境の北、ゲルマニアの森と川に白い小さなガチョウの群れ。そこから羽毛の袋を積んだ牛車が、アルプスを越えて南のローマへ点線をたどる。いまのドイツの輪郭が点線で重なる
// 動き: カメラがゲルマニアの寄りから引く (f0〜30) / ガチョウが首を振る / 荷車が f10〜40 でローマに着く / いまのドイツの輪郭 f22〜34
const L1bG = (lon: number, lat: number) => [80 + (lon + 10) * 44, 60 + (58 - lat) * 40] as const;
const L1bPath = (pts: number[][], close = true) =>
  pts.map(([lo, la], i) => { const [x, y] = L1bG(lo, la); return `${i ? "L" : "M"} ${x} ${y}`; }).join(" ") + (close ? " Z" : "");
const MAP_MED = [[-5.5, 36.2], [-1, 37.5], [0, 39.5], [3, 42.3], [6.5, 43.2], [9, 44.3], [12, 42], [15.5, 40], [16, 38.5], [17.5, 40.5], [18.5, 40], [16, 41.8], [13.5, 44.5], [12.3, 45.4], [14, 45], [19.5, 42], [20, 39.5], [22, 37], [23, 38], [24, 40.5], [26, 40.8], [27, 37.5], [31, 36.6], [31, 34], [-6, 34]];
const MAP_ATL = [[-14, 59], [-14, 34], [-6, 34], [-6, 36.2], [-9, 37], [-8.8, 42], [-9, 43.2], [-8, 43.7], [-2, 43.4], [-1.3, 46], [-2.5, 47.5], [-4.7, 48.3], [-1.5, 48.7], [1, 49.8], [2, 51], [4, 51.5], [5, 53], [8, 53.8], [8.5, 55.5], [8, 57], [10.5, 57.6], [11.5, 58], [12, 59]];
const MAP_BAL = [[10.5, 54.4], [14, 53.9], [18, 54.8], [21.2, 55.2], [21, 56.8], [23.5, 57.2], [24.3, 59], [17, 59], [16.6, 57.5], [16, 56.2], [14.4, 55.5], [12.9, 55.4], [12.5, 56.2], [11.8, 57.6], [10.5, 57.6], [10.8, 55.5]];
const MAP_BRIT = [[-5.7, 50], [1.4, 51.2], [1.7, 52.7], [0, 53.5], [-1.5, 55], [-2, 57], [-3.5, 58.5], [-5, 58.6], [-6, 56.5], [-5, 55], [-3, 54.5], [-4.5, 53.3], [-4.6, 52], [-5.3, 51.7], [-3, 51.4]];
const MAP_IRE = [[-6, 52.2], [-6, 54], [-7, 55.3], [-9.5, 54], [-10, 51.6], [-8, 51.6]];
const MAP_EMPIRE = [[-14, 34], [-14, 48], [-5, 48.5], [1, 50], [4.5, 51.9], [6.5, 51.8], [7, 50.5], [8, 49.5], [8.2, 48], [9.5, 47.8], [11, 48.8], [13.5, 48.5], [16.4, 48.2], [19, 47.8], [19, 45.5], [22.5, 44.6], [25, 43.7], [28.5, 44.8], [32, 45], [32, 34]];
const MAP_LIMES = [[4.5, 51.9], [6.5, 51.8], [7, 50.5], [8, 49.5], [8.2, 48], [9.5, 47.8], [11, 48.8], [13.5, 48.5], [16.4, 48.2], [19, 47.8], [19, 45.5], [22.5, 44.6], [25, 43.7], [28.5, 44.8]];
const MAP_ELBE = [[8.7, 53.9], [10, 53.5], [12, 52.8], [13, 52], [14.2, 51]];
const MAP_WESER = [[8.5, 53.5], [9, 52.6], [9.6, 51.6]];
const MAP_DE = [[6, 51], [6.1, 53.4], [8.5, 54.9], [10, 54.8], [14.2, 53.9], [14.6, 52.8], [15, 51], [12.2, 50.3], [13.8, 48.7], [13, 47.5], [10, 47.5], [7.6, 47.6], [8.2, 49], [6.4, 49.5]];
const ROUTE = [[10.5, 51.6], [10, 49.5], [10.6, 47.8], [11.3, 46.6], [11.1, 44.6], [12.5, 41.9]];
const Yw060: React.FC<{ f: number }> = ({ f }) => {
  const [gcx, gcy] = L1bG(10.5, 51.8);
  const k = lerp(1.32, 1.0, easeInOut(seg(f, 0, 30)));
  const camX = lerp(960 - gcx, 0, easeInOut(seg(f, 0, 30))) * 0;
  const u = easeInOut(seg(f, 10, 40));
  const rp = ROUTE.map(([lo, la]) => L1bG(lo, la));
  const lens = rp.slice(1).map((p, i) => Math.hypot(p[0] - rp[i][0], p[1] - rp[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let dist = u * total, ci = 0;
  while (ci < lens.length - 1 && dist > lens[ci]) { dist -= lens[ci]; ci++; }
  const ft = clamp01(dist / lens[ci]);
  const cart = [lerp(rp[ci][0], rp[ci + 1][0], ft), lerp(rp[ci][1], rp[ci + 1][1], ft)] as const;
  const routeD = rp.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const deT = seg(f, 22, 34);
  const [rx, ry] = L1bG(12.5, 41.9);
  const arrive = seg(f, 38, 42);
  return (
    <Frame f={f} seed={3060} bg={C.deskWood}>
      <rect x={0} y={0} width={W} height={H} fill={C.deskWood} />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M 0 ${80 + i * 150} q 960 ${rnd(6001, i) * 30 - 15} 1920 0`} fill="none" stroke={C.deskWoodDark} strokeWidth={4} opacity={0.5} />)}
      <g transform={cam(gcx, gcy, k, camX)}>
        <path d="M 46 40 Q 400 22 960 34 Q 1500 24 1874 44 Q 1890 500 1880 1050 Q 1400 1066 960 1056 Q 400 1068 40 1050 Q 30 500 46 40 Z" fill={C.parch} stroke={C.parchBurn} strokeWidth={10} />
        <clipPath id="l1b60-map"><path d="M 56 50 Q 400 32 960 44 Q 1500 34 1864 54 Q 1880 500 1870 1040 Q 1400 1056 960 1046 Q 400 1058 50 1040 Q 40 500 56 50 Z" /></clipPath>
        <g clipPath="url(#l1b60-map)">
          <path d={L1bPath(MAP_EMPIRE)} fill={C.romeRed} opacity={0.16} />
          <path d={L1bPath(MAP_ATL)} fill={C.sea} stroke={KRP.ink} strokeWidth={4} />
          <path d={L1bPath(MAP_MED)} fill={C.sea} stroke={KRP.ink} strokeWidth={4} />
          <path d={L1bPath(MAP_BAL)} fill={C.sea} stroke={KRP.ink} strokeWidth={4} />
          <path d={L1bPath(MAP_BRIT)} fill={C.parch} stroke={KRP.ink} strokeWidth={4} />
          <path d={L1bPath(MAP_BRIT)} fill={C.romeRed} opacity={0.12} />
          <path d={L1bPath(MAP_IRE)} fill={C.parch} stroke={KRP.ink} strokeWidth={4} />
          {/* 波線 */}
          {Array.from({ length: 12 }, (_, i) => {
            const [x, y] = L1bG(-12 + (i % 3) * 2.4, 52 - Math.floor(i / 3) * 4);
            return <path key={i} d={`M ${x} ${y} q 12 -8 24 0 q 12 8 24 0`} fill="none" stroke={C.seaDeep} strokeWidth={3} />;
          })}
          {/* 川 */}
          <path d={L1bPath(MAP_ELBE, false)} fill="none" stroke={C.river} strokeWidth={6} strokeLinecap="round" />
          <path d={L1bPath(MAP_WESER, false)} fill="none" stroke={C.river} strokeWidth={5} strokeLinecap="round" />
          <path d={L1bPath(MAP_LIMES, false)} fill="none" stroke={C.river} strokeWidth={7} strokeLinecap="round" />
          <path d={L1bPath(MAP_LIMES, false)} fill="none" stroke={C.romeRed} strokeWidth={4} strokeDasharray="14 10" />
          {/* アルプス */}
          {Array.from({ length: 9 }, (_, i) => {
            const [x, y] = L1bG(6.5 + i * 1.1, 46.4 + (i % 2) * 0.6);
            return (
              <g key={i}>
                <path d={`M ${x - 26} ${y + 14} L ${x} ${y - 24} L ${x + 26} ${y + 14} Z`} fill={C.alp} stroke={KRP.ink} strokeWidth={3} />
                <path d={`M ${x - 8} ${y - 12} L ${x} ${y - 24} L ${x + 8} ${y - 12} Z`} fill={KRP.white} />
              </g>
            );
          })}
          {/* ゲルマニアの森 */}
          {Array.from({ length: 30 }, (_, i) => {
            const lo = 6 + rnd(6002, i) * 10, la = 49.6 + rnd(6003, i) * 4.2;
            if (Math.abs(lo - 10.4) < 1.8 && Math.abs(la - 51.8) < 0.9) return null;
            const [x, y] = L1bG(lo, la);
            return (
              <g key={i}>
                <rect x={x - 3} y={y} width={6} height={12} fill={YP.woodDark} />
                <path d={`M ${x - 16} ${y + 2} L ${x} ${y - 30} L ${x + 16} ${y + 2} Z`} fill={i % 3 ? C.forest : C.forestDark} stroke={KRP.ink} strokeWidth={2.5} />
              </g>
            );
          })}
          {/* いまのドイツ (点線) */}
          <path d={L1bPath(MAP_DE)} fill={YP.glow} fillOpacity={0.12 * deT} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 8" opacity={deT} />
          {/* ガチョウの群れ */}
          {Array.from({ length: 8 }, (_, i) => {
            const [x, y] = L1bG(8.6 + (i % 4) * 1.1 + (Math.floor(i / 4) % 2) * 0.5, 52.4 - Math.floor(i / 4) * 0.9);
            return <L1bGoose key={i} x={x} y={y} s={0.27} f={f} dir={i % 3 ? 1 : -1} phase={i} peck={Math.sin(f / 7 + i) > 0.6 ? 1 : 0} />;
          })}
          {/* 運ぶ道 */}
          <path d={routeD} fill="none" stroke={KRP.ink} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
          <path d={routeD} fill="none" stroke={KRP.red} strokeWidth={6} strokeDasharray={`${u * total} 9999`} opacity={0.6} />
          {/* ローマ */}
          <g transform={`translate(${rx} ${ry})`}>
            <circle r={26 + arrive * 10} fill={YP.glow} opacity={0.3 + arrive * 0.3} />
            <path d="M -22 -6 L 0 -24 L 22 -6 Z" fill={C.travertine} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-20} y={-6} width={40} height={20} fill={C.travertine} stroke={KRP.ink} strokeWidth={3} />
            {[-12, 0, 12].map((d) => <line key={d} x1={d} y1={-4} x2={d} y2={12} stroke={KRP.ink} strokeWidth={2.5} />)}
          </g>
          {/* 牛車と羽毛の袋 */}
          <g transform={`translate(${cart[0]} ${cart[1] - 10})`}>
            <ellipse cx={0} cy={22} rx={50} ry={8} fill={KRP.ink} opacity={0.15} />
            <rect x={-30} y={-8} width={52} height={22} fill={YP.wood} stroke={KRP.ink} strokeWidth={3} />
            {[-20, -2, 14].map((sx0, i) => <ellipse key={i} cx={sx0} cy={-16} rx={11} ry={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />)}
            <circle cx={-14} cy={18} r={9} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={2.5} />
            <circle cx={12} cy={18} r={9} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={2.5} />
            <ellipse cx={42} cy={2} rx={18} ry={11} fill={C.ragUmber} stroke={KRP.ink} strokeWidth={2.5} />
            <circle cx={58} cy={-4} r={8} fill={C.ragUmber} stroke={KRP.ink} strokeWidth={2.5} />
            {[34, 48].map((lx0) => <line key={lx0} x1={lx0} y1={10} x2={lx0 + Math.sin(f / 2) * 3} y2={20} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
          {/* 羅針図と帆船 */}
          <g transform="translate(220 860)">
            <circle r={70} fill="none" stroke={C.parchBurn} strokeWidth={4} />
            <path d="M 0 -84 L 14 0 L 0 84 L -14 0 Z" fill={C.parchBurn} />
            <path d="M -84 0 L 0 14 L 84 0 L 0 -14 Z" fill={C.parchDark} />
          </g>
          <g transform={`translate(${L1bG(-6.5, 46)[0]} ${L1bG(-6.5, 46)[1] + Math.sin(f / 6) * 4})`}>
            <path d="M -30 0 L 30 0 L 20 14 L -20 14 Z" fill={YP.wood} stroke={KRP.ink} strokeWidth={3} />
            <path d="M 0 0 L 0 -46 L 24 -8 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        <TagPlate x={L1bG(10.5, 54.9)[0]} y={L1bG(10.5, 54.9)[1]} text="ゲルマニア" size={44} t={seg(f, 2, 12)} fill={C.parch} />
        <line x1={1240} y1={470} x2={L1bG(14, 51)[0]} y2={L1bG(14, 51)[1]} stroke={KRP.ink} strokeWidth={4} opacity={deT} />
        <TagPlate x={1360} y={470} text="いまのドイツ" size={36} t={deT} />
        <TagPlate x={rx + 150} y={ry + 20} text="ローマ" size={38} t={seg(f, 24, 32)} fill={C.parch} />
      </g>
    </Frame>
  );
};

// ---- 文#61 【並】 その値段は、1ポンドあたり、5デナリウス。北の土地の羽毛は、ありがたがられる高級品でした。
// 設計: 市場の羽毛屋の店先。秤に羽毛の袋 (1ポンド)、反対側にデナリウス銀貨が5枚、1枚ずつ f でチャリンと積まれる。店主の Person が得意顔。札「1ポンド = 5デナリウス」。円換算は書かない
// どこ: ローマの市場の羽毛屋の店先。しま模様の日よけ、ガチョウの看板、棚にふくらんだ羽毛の袋、大理石の売り台、奥にアンフォラと通り
// 演出: 売り台の青銅の天秤。左の皿に「1ポンド」の羽毛の袋、右の皿にデナリウス銀貨が1枚ずつ落ちて積もる。5枚目で天秤が水平に。店主が腕組みで得意顔
// 動き: 銀貨 f8/14/20/26/32 で落ちてチャリン (光の輪) / 天秤が少しずつ水平へ / 袋から羽毛がちらちら / 日よけが揺れる / カメラが少し寄る
const Yw061: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1, 1.04, easeInOut(seg(f, 0, 40)));
  const drops = [8, 14, 20, 26, 32];
  const landed = drops.map((d) => easeInOut(seg(f, d, d + 5)));
  const nLand = landed.reduce((a, b) => a + b, 0);
  const th = -10 * (1 - nLand / 5);
  const BX = 900, BY = 300, L = 300, HANG = 230;
  const rad = (th * Math.PI) / 180;
  const lPan = [BX - L * Math.cos(rad), BY - L * Math.sin(rad) + HANG] as const;
  const rPan = [BX + L * Math.cos(rad), BY + L * Math.sin(rad) + HANG] as const;
  const pan = (px: number, py: number) => (
    <g>
      <line x1={px} y1={py - HANG} x2={px - 120} y2={py} stroke={KRP.ink} strokeWidth={4} />
      <line x1={px} y1={py - HANG} x2={px + 120} y2={py} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${px - 140} ${py} Q ${px} ${py + 70} ${px + 140} ${py} Z`} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${px - 100} ${py + 14} Q ${px} ${py + 38} ${px + 60} ${py + 22}`} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.4} />
    </g>
  );
  return (
    <Frame f={f} seed={3061} bg={C.stucco}>
      <g transform={cam(900, 480, k)}>
        <rect x={-40} y={-40} width={W + 80} height={760} fill={C.stucco} />
        {/* 奥の通り (右) */}
        <rect x={1640} y={160} width={320} height={560} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1640} y={420} width={320} height={300} fill={C.stuccoShade} />
        <path d="M 1640 420 L 1800 340 L 1960 420 Z" fill={C.roofTile} stroke={KRP.ink} strokeWidth={3} />
        {[1700, 1860].map((px, i) => <Person key={px} x={px} y={700} s={0.5} f={f} cloth={i ? C.toga : "#9FB4C9"} clothDark={i ? C.togaDark : "#7E95AC"} phase={i + 5} />)}
        {/* 棚と羽毛の袋 */}
        <rect x={40} y={210} width={1560} height={20} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={40} y={420} width={1560} height={20} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
        {[[120, 210], [260, 210], [400, 210], [150, 420], [1360, 420], [1500, 420]].map(([sx0, sy], i) => (
          <g key={i}>
            <path d={`M ${sx0 - 56} ${sy} Q ${sx0 - 70} ${sy - 90} ${sx0 - 30} ${sy - 120} L ${sx0 - 40} ${sy - 140} L ${sx0 + 40} ${sy - 140} L ${sx0 + 30} ${sy - 120} Q ${sx0 + 70} ${sy - 90} ${sx0 + 56} ${sy} Z`}
              fill={C.sack} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M ${sx0 - 30} ${sy - 120} L ${sx0 + 30} ${sy - 120}`} stroke={C.sackDark} strokeWidth={5} />
            {[0, 1, 2].map((j) => <L1bFeather key={j} x={sx0 - 20 + j * 20} y={sy - 136} s={0.22} rot={(j - 1) * 25 + Math.sin(f / 9 + i + j) * 6} />)}
          </g>
        ))}
        {/* ガチョウの看板 */}
        <g transform="translate(800 0)">
          <line x1={560} y1={30} x2={560} y2={70} stroke={KRP.ink} strokeWidth={4} />
          <line x1={760} y1={30} x2={760} y2={70} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${Math.sin(f / 10) * 2} 660 70)`}>
            <rect x={520} y={70} width={280} height={130} rx={10} fill={YP.wood} stroke={KRP.ink} strokeWidth={6} />
            <rect x={536} y={86} width={248} height={98} rx={6} fill={C.parch} />
            <L1bGoose x={660} y={176} s={0.42} f={0} dir={1} />
          </g>
        </g>
        {/* アンフォラ */}
        {[380, 470].map((ax, i) => (
          <g key={ax} transform={`rotate(${i ? 8 : -4} ${ax} 700)`}>
            <path d={`M ${ax - 14} 470 L ${ax + 14} 470 L ${ax + 12} 500 Q ${ax + 50} 540 ${ax + 30} 640 L ${ax} 700 L ${ax - 30} 640 Q ${ax - 50} 540 ${ax - 12} 500 Z`}
              fill={C.amphora} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M ${ax - 12} 486 q -24 6 -20 30 M ${ax + 12} 486 q 24 6 20 30`} fill="none" stroke={C.amphoraDark} strokeWidth={5} />
          </g>
        ))}
        {/* 店主 (売り台の奥) */}
        <Person x={1440} y={820} s={1.25} f={f} face="smile" pose="armsFolded" cloth={C.tunicRed} clothDark={C.tunicRedDark} lean={-5} gaze={[-1, 0]} phase={2} />
        <L1bOver x={1440} y={820} s={1.25} f={f} phase={2} lean={-5}>
          <path d="M -30 -252 q 10 -8 22 -2 M 8 -254 q 12 -6 22 2" fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        </L1bOver>
        {[0, 1, 2].map((i) => {
          const a = ((f + i * 6) % 18) / 18;
          return <path key={i} d={`M ${1330 - a * 20} ${470 - i * 24 - a * 20} l -16 -8 M ${1330 - a * 20} ${470 - i * 24 - a * 20} l -4 -18`} stroke={YP.glow} strokeWidth={5} strokeLinecap="round" opacity={1 - a} />;
        })}
        {/* 売り台 (大理石) */}
        <rect x={-40} y={690} width={W + 80} height={30} fill={C.counter} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={720} width={W + 80} height={400} fill={C.counter} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${i * 250} 740 q 40 60 10 120 q -20 60 30 140`} fill="none" stroke={C.marbleVein} strokeWidth={3} />)}
        {/* 売り台の前面の飾り (色大理石の板と、ガチョウの壁画) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={`pn${i}`}>
            <rect x={60 + i * 380} y={750} width={300} height={170} rx={6} fill={i % 2 ? C.pompRed : C.ragGreen} stroke={KRP.ink} strokeWidth={5} />
            <rect x={78 + i * 380} y={768} width={264} height={134} rx={4} fill="none" stroke={C.goldTrim} strokeWidth={4} />
            {i % 2 === 0
              ? <L1bGoose x={210 + i * 380} y={880} s={0.5} f={f} dir={i === 2 ? -1 : 1} phase={i} peck={i === 4 ? 1 : 0} />
              : <path d={`M ${110 + i * 380} 830 q 50 -40 100 0 q 50 40 100 0`} fill="none" stroke={C.goldTrim} strokeWidth={6} />}
          </g>
        ))}
        {/* 天秤 */}
        <path d={`M ${BX - 130} 700 L ${BX + 130} 700 L ${BX + 90} 660 L ${BX - 90} 660 Z`} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={BX - 15} y={BY} width={30} height={370} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
        {pan(lPan[0], lPan[1])}
        {/* 1ポンドの袋 */}
        <g transform={`translate(${lPan[0]} ${lPan[1] + 8})`}>
          <path d="M -70 0 Q -90 -80 -40 -110 L -50 -126 L 50 -126 L 40 -110 Q 90 -80 70 0 Z" fill={C.sack} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -40 -110 L 40 -110" stroke={C.sackDark} strokeWidth={6} />
          {[-1, 0, 1].map((j) => <L1bFeather key={j} x={j * 22} y={-122} s={0.26} rot={j * 28 + Math.sin(f / 7 + j) * 8} />)}
          <rect x={-46} y={-70} width={92} height={40} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <text x={0} y={-42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.ink}>1ポンド</text>
        </g>
        {pan(rPan[0], rPan[1])}
        {/* 銀貨 */}
        {drops.map((d, i) => {
          const t = landed[i];
          if (f < d) return null;
          const ty = rPan[1] + 4 - i * 13;
          const y = lerp(rPan[1] - 300, ty, t);
          const ring = seg(f, d + 5, d + 11);
          return (
            <g key={i}>
              {t < 1 ? (
                <g transform={`translate(${rPan[0]} ${y}) scale(1 ${0.3 + 0.7 * Math.abs(Math.cos(f * 0.9))})`}><L1bDenarius x={0} y={0} s={0.9} /></g>
              ) : (
                <L1bCoinSide x={rPan[0] + ((i * 7) % 3 - 1) * 4} y={ty} w={60} />
              )}
              {ring > 0 && ring < 1 && (
                <g opacity={1 - ring}>
                  <ellipse cx={rPan[0]} cy={ty - 6} rx={40 + ring * 70} ry={12 + ring * 20} fill="none" stroke={YP.glow} strokeWidth={6} />
                  {[-1, 1].map((s0) => <line key={s0} x1={rPan[0] + s0 * 60} y1={ty - 40} x2={rPan[0] + s0 * (80 + ring * 30)} y2={ty - 70 - ring * 20} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />)}
                </g>
              )}
            </g>
          );
        })}
        <g transform={`rotate(${th} ${BX} ${BY})`}>
          <rect x={BX - L - 10} y={BY - 12} width={2 * L + 20} height={24} rx={12} fill={KRP.bronze} stroke={KRP.ink} strokeWidth={6} />
          {[-L, L].map((d) => <circle key={d} cx={BX + d} cy={BY} r={14} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />)}
          <path d={`M ${BX - 10} ${BY - 12} L ${BX} ${BY - 66} L ${BX + 10} ${BY - 12} Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <circle cx={BX} cy={BY} r={22} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 枚数の点 */}
        {drops.map((_, i) => (
          <circle key={i} cx={rPan[0] - 80 + i * 40} cy={rPan[1] + 74} r={11} fill={landed[i] >= 1 ? KRP.silver : "none"} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {/* 台の上の財布 */}
        <path d="M 160 690 Q 120 640 170 616 L 150 596 L 230 600 L 212 620 Q 260 640 240 690 Z" fill={C.ragUmber} stroke={KRP.ink} strokeWidth={4} />
        <L1bDenarius x={290} y={676} s={0.7} rot={20} />
        {/* 日よけ */}
        <rect x={-40} y={-40} width={W + 80} height={60} fill={C.awningA} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 21 }, (_, i) => (
          <path key={i} d={`M ${-40 + i * 100} 20 q 50 ${34 + Math.sin(f / 6 + i) * 4} 100 0`} fill={i % 2 ? C.awningB : C.awningA} stroke={KRP.ink} strokeWidth={4} />
        ))}
      </g>
      <TagPlate x={900} y={150} text="1ポンド = 5デナリウス" size={46} t={seg(f, 34, 42)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_050: (f) => <Yw050 f={f} />,
  yw_051: (f) => <Yw051 f={f} />,
  yw_052: (f) => <Yw052 f={f} />,
  yw_053: (f) => <Yw053 f={f} />,
  yw_054: (f) => <Yw054 f={f} />,
  yw_055: (f) => <Yw055 f={f} />,
  yw_056: (f) => <Yw056 f={f} />,
  yw_057: (f) => <Yw057 f={f} />,
  yw_058: (f) => <Yw058 f={f} />,
  yw_059: (f) => <Yw059 f={f} />,
  yw_060: (f) => <Yw060 f={f} />,
  yw_061: (f) => <Yw061 f={f} />,
};

export const YW_C2_MOTIFS: string[] = [
  "yw_050",
  "yw_051",
  "yw_052",
  "yw_053",
  "yw_054",
  "yw_055",
  "yw_056",
  "yw_057",
  "yw_058",
  "yw_059",
  "yw_060",
  "yw_061",
];

export const yawaC2Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
