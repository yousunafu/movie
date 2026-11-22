// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#62〜#71 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-2.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L1c。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//
// ★人物と部屋の見た目は YawaC2.tsx (文#56 ローマ兵 / 文#59 プリニウスの書斎) から L1c 接頭辞で写してそろえた。
//   プリニウスのペンは葦のペン (羽ペンではない)。

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
  // 羽根・ガチョウ (YawaC2 と同じ)
  featherBlack: "#2E2A27", goose: "#FBFAF6", gooseShade: "#E2DED4", bill: "#E8923A",
  // ローマ兵・トーガ (YawaC2 と同じ)
  tunicRed: "#B8382B", tunicRedDark: "#8A2A20", bronzeHelm: "#C1924D", bronzeHelmDark: "#8E6A35",
  toga: "#EDE6D6", togaDark: "#CFC6B0", elderHair: "#D8D4CC", togaStripe: "#7A3A6E",
  // ローマの街・石 (YawaC2 と同じ)
  romeSky: "#F3D9A8", romeSky2: "#E9B98A", roofTile: "#C2593A", roofTileDark: "#8F3D26",
  travertine: "#E8DCC2", travertineShade: "#CDBD9C", stucco: "#EAD7B3", stuccoShade: "#CDB48A",
  cypress: "#4B6A3E", cypressDark: "#34502C", hillFar: "#C9A98A", pave: "#CFC3A8", paveDark: "#AE9F82",
  // 寝室 (YawaC2 と同じ)
  pompRed: "#A8392C", pompRedDark: "#7E2A20", pompBlack: "#2F2A26", pompOchre: "#D9A746",
  mosaicW: "#EDE5D3", mosaicB: "#3A332D", garden: "#8DAE6A", gardenDark: "#5E7E45",
  cushion: "#8E5C86", cushionDark: "#6A4064", mattress: "#D8C8A8", goldTrim: "#D9B23C",
  // 書斎 (YawaC2 と同じ)
  plaster: "#E2D3B4", plasterShade: "#C4B08C", museumWall: "#3A332D",
  shelfWood: "#7E5A3A", scroll: "#EADBB5", scrollEdge: "#B99E6C", scrollRod: "#6B4A2E",
  lampBronze: "#B9863F", flame: "#FFB648", flameCore: "#FFF0B0", vesuvius: "#8C8A9A", vesuviusDark: "#6E6B7C", bay: "#8FB4C4",
  parch: "#E8D3A6", reedPen: "#C9963E",
  // 大理石 (#62 石板・#70 凡例の板)
  marble: "#F1EDE4", marbleShade: "#D9D2C4", marbleVein: "#B9B2A6", marbleDeep: "#A39B8C",
  laurel: "#6F8E4A", laurelDark: "#4E6B33",
  // 北の砦と湿原 (#63 #64)
  northSky: "#D3DAD4", northSky2: "#B9C6C2", pineFar: "#7F9488", pineNear: "#5C7468",
  palisade: "#9A7448", palisadeDark: "#6E5130", mud: "#8A7354", mudDark: "#6A563E",
  marsh: "#9FAF74", marshDark: "#788A52", reed: "#B7A35E", reedDark: "#8C7A3E", pool: "#9DB9BE", poolDeep: "#7B9EA5",
  cattail: "#6B4A2E", shieldGold: "#E2B64A",
  // 港 (#69)
  sea: "#7FA9B8", seaDeep: "#5F8B9B", seaFoam: "#D9ECEF", hull: "#8A5A34", hullDark: "#5E3C22", sail: "#EFE3C6",
  sack: "#CDB78E", sackDark: "#A68F65", gold: "#E9BE3E", goldDark: "#A8822A", rope: "#A88A5A", quay: "#C7BBA2", quayDark: "#A29579",
  amphora: "#B9714A", amphoraDark: "#8C5234", purse: "#6F4A8A", porter: "#9C8466", porterDark: "#7A6449",
  linen: "#F4EEDF", linenShade: "#DCD2BC", frescoGround: "#E9CF96", frescoEdge: "#C9A766",
  // 中世の修道院 (#71)
  cloisterSky: "#2A3140", stoneCold: "#6E6E78", stoneMid: "#55555F", stoneDark: "#3A3A44", stoneDeep: "#24242C",
  moonLight: "#C9D3E6", candle: "#FFD98A", hoodShadow: "#0E0D12", linenCold: "#D6D2C6",
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
// 点 (px,py) を (cx,cy) のまわりに deg 度まわす
const L1cRot = (px: number, py: number, cx: number, cy: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  const dx = px - cx, dy = py - cy;
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
};
// Person の banzai の腕の先 (ひじ) の位置。Person と同じ揺れの式
const L1cBanzaiElbow = (side: -1 | 1, f: number, phase = 0): [number, number] => {
  const sway = f ? Math.sin((f + phase * 17) / 9) * 3 : 0;
  const rot = side === -1 ? 135 + sway : -135 - sway;
  return L1cRot(side * 67, -74, side * 67, -148, rot);
};

// Person と同じ揺れで重ねる (兜・トーガ・白髪を Person の座標で描く) — YawaC2 の L1bOver と同じ
const L1cOver: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; lean?: number; children?: React.ReactNode }> = ({
  x, y, s, f, phase = 0, lean = 0, children,
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};

// ローマ兵の兜 (Person 座標) — YawaC2 の L1bHelmet と同じ絵
const L1cHelmet: React.FC = () => (
  <g>
    <path d="M -14 -318 Q -20 -384 0 -388 Q 20 -384 14 -318 Z" fill={C.tunicRed} stroke={KRP.ink} strokeWidth={4.5} />
    {[-8, 0, 8].map((dx) => <line key={dx} x1={dx} y1={-326} x2={dx * 1.3} y2={-376} stroke={C.tunicRedDark} strokeWidth={3} />)}
    <rect x={-7} y={-326} width={14} height={14} fill={C.bronzeHelmDark} stroke={KRP.ink} strokeWidth={3} />
    <L1cHelmetShell />
  </g>
);
const L1cHelmetShell: React.FC = () => (
  <g>
    <path d="M -68 -238 Q -72 -314 0 -318 Q 72 -314 68 -238 Z" fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -40 -296 Q 0 -312 40 -296" fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.45} strokeLinecap="round" />
    <rect x={-74} y={-250} width={148} height={14} rx={7} fill={C.bronzeHelmDark} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -72 -244 L -50 -244 L -46 -192 Q -58 -178 -72 -194 Z" fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={4} />
    <path d="M 72 -244 L 50 -244 L 46 -192 Q 58 -178 72 -194 Z" fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={4} />
    {[-60, 60].map((cx) => <circle key={cx} cx={cx} cy={-226} r={4} fill={C.bronzeHelmDark} />)}
  </g>
);
// 指揮官の兜: 横に大きく張った羽飾り (Person 座標)。droop 0〜1 で羽飾りがしおれる
const L1cCommanderHelmet: React.FC<{ droop?: number; flut?: number }> = ({ droop = 0, flut = 0 }) => {
  const d = clamp01(droop);
  const tipY = lerp(-356, -250, d);
  const tipX = lerp(96, 100, d);
  return (
    <g>
      <path d={`M ${-tipX} ${tipY + flut} Q -60 ${-386 + d * 40} 0 ${-384 + d * 46} Q 60 ${-386 + d * 40} ${tipX} ${tipY - flut} Q 70 ${-334 + d * 30} 0 -326 Q -70 ${-334 + d * 30} ${-tipX} ${tipY + flut} Z`}
        fill={C.tunicRed} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
      {[-70, -46, -22, 0, 22, 46, 70].map((dx) => (
        <line key={dx} x1={dx * 0.9} y1={-332} x2={dx * 1.25} y2={-370 + d * 50 + Math.abs(dx) * 0.2} stroke={KRP.white} strokeWidth={3} opacity={0.55} />
      ))}
      <rect x={-12} y={-330} width={24} height={16} rx={3} fill={C.bronzeHelmDark} stroke={KRP.ink} strokeWidth={3} />
      <L1cHelmetShell />
    </g>
  );
};

// トーガ (Person 座標) — YawaC2 の L1bToga と同じ
const L1cToga: React.FC<{ c?: string; d?: string }> = ({ c = C.toga, d = C.togaDark }) => (
  <g>
    <path d="M -60 -62 L 60 -62 L 68 -10 L -68 -10 Z" fill={c} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    {[-36, -10, 18, 42].map((fx) => <path key={fx} d={`M ${fx} -58 Q ${fx + 4} -34 ${fx - 2} -14`} fill="none" stroke={d} strokeWidth={3.5} />)}
    <path d="M -58 -162 Q -30 -168 -14 -160 L 60 -82 L 60 -56 L 34 -56 L -58 -144 Z" fill={d} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -40 -150 L 40 -70" stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
  </g>
);

// 年配の白髪とひたいのしわ (Person 座標) — YawaC2 の L1bElder と同じ
const L1cElder: React.FC = () => (
  <g>
    <path d="M -64 -214 Q -74 -248 -56 -268 Q -50 -250 -48 -232 Q -56 -222 -64 -214 Z" fill={C.elderHair} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M 64 -214 Q 74 -248 56 -268 Q 50 -250 48 -232 Q 56 -222 64 -214 Z" fill={C.elderHair} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -22 -262 Q 0 -268 22 -262" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
    <path d="M -16 -252 Q 0 -257 16 -252" fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
    <path d="M -40 -204 q 6 4 12 0" fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.45} />
    <path d="M 28 -204 q 6 4 12 0" fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.45} />
  </g>
);

// ガチョウの羽根 1枚 (上向き。s=1 で長さ約170px) — YawaC2 の L1bFeather と同じ
const L1cFeather: React.FC<{ x: number; y: number; s?: number; rot?: number; op?: number; wilt?: number }> = ({ x, y, s = 1, rot = 0, op = 1, wilt = 0 }) => {
  const w = clamp01(wilt);
  // wilt: 先がしおれて垂れる (#71)
  const tip = `Q ${-14 + w * 30} ${-150 + w * 40} ${2 + w * 60} ${-162 + w * 70}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <path d={`M 0 8 Q -30 -40 -22 -110 ${tip} Q ${22 + w * 20} ${-132 + w * 40} 24 -80 Q 26 -22 0 8 Z`}
        fill={w > 0.01 ? C.linenCold : KRP.white} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      {[-130, -105, -80, -55, -30].map((by, i) => (
        <g key={i} stroke={C.gooseShade} strokeWidth={2.5}>
          <line x1={1} y1={by} x2={-18} y2={by + 16} /><line x1={2} y1={by} x2={19} y2={by + 18} />
        </g>
      ))}
      <path d={`M 0 30 Q 2 -60 ${2 + w * 34} ${-158 + w * 64}`} fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" />
      {[-1, 1].map((d) => <path key={d} d={`M 0 4 q ${d * 12} -4 ${d * 16} 6`} fill="none" stroke={C.gooseShade} strokeWidth={3} />)}
    </g>
  );
};

// 白いガチョウ (横向き)。x,y: 足元 / dir 1=右向き / s=1 で高さ約190px — YawaC2 の L1bGoose に「首を前へ伸ばす」「羽ばたく」を足した
const L1cGoose: React.FC<{ x: number; y: number; s?: number; f: number; dir?: 1 | -1; phase?: number; fwd?: boolean; flap?: number }> = ({
  x, y, s = 1, f, dir = 1, phase = 0, fwd = false, flap = 0,
}) => {
  const step = Math.sin((f + phase * 9) / (fwd ? 1.8 : 3.2));
  const bob = Math.abs(step) * (fwd ? 8 : 4);
  const neckP = fwd ? "M 40 -90 Q 84 -112 122 -104" : "M 40 -96 Q 62 -130 52 -160";
  const head: [number, number] = fwd ? [128, -104] : [58, -166];
  const wing = flap > 0 ? 18 + (Math.sin((f + phase * 5) / 1.4) * 0.5 + 0.5) * 70 * flap : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      <ellipse cx={0} cy={0} rx={70} ry={8} fill={KRP.ink} opacity={0.14} />
      <g stroke={C.bill} strokeWidth={6} strokeLinecap="round">
        <line x1={-6} y1={-36} x2={-8 + step * 14} y2={-6} /><line x1={14} y1={-36} x2={16 - step * 14} y2={-6} />
      </g>
      <path d={`M ${-22 + step * 14} -4 l 18 0 l -6 -6 Z`} fill={C.bill} stroke={KRP.ink} strokeWidth={2.5} />
      <path d={`M ${2 - step * 14} -4 l 18 0 l -6 -6 Z`} fill={C.bill} stroke={KRP.ink} strokeWidth={2.5} />
      <g transform={`translate(0 ${-bob}) rotate(${fwd ? -8 : 0})`}>
        {/* 奥の翼 (羽ばたき) */}
        {flap > 0 && (
          <path transform={`rotate(${wing * 0.8} -6 -96)`} d="M -6 -96 Q -50 -170 -130 -176 Q -100 -140 -84 -124 Q -60 -104 -6 -96 Z"
            fill={C.gooseShade} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        )}
        <path d="M -72 -76 L -104 -96 L -80 -56 Z" fill={C.goose} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -72 -62 Q -82 -112 -20 -114 Q 40 -116 60 -86 Q 70 -60 40 -40 Q 0 -26 -50 -36 Q -86 -44 -72 -62 Z"
          fill={C.goose} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {flap > 0 ? (
          <g transform={`rotate(${wing} 0 -92)`}>
            <path d="M 0 -92 Q -40 -180 -140 -196 Q -110 -160 -96 -140 Q -120 -136 -128 -124 Q -70 -110 0 -92 Z"
              fill={C.goose} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            {[0, 1, 2].map((i) => <path key={i} d={`M ${-30 - i * 30} ${-112 - i * 18} q -10 -14 -24 -20`} fill="none" stroke={C.gooseShade} strokeWidth={3} />)}
          </g>
        ) : (
          <>
            <path d="M -44 -92 Q 10 -106 40 -80 Q 0 -58 -48 -66 Z" fill={C.gooseShade} stroke={KRP.ink} strokeWidth={3.5} />
            <path d="M -30 -84 Q 0 -90 24 -78" fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
          </>
        )}
        <path d={neckP} fill="none" stroke={KRP.ink} strokeWidth={28} strokeLinecap="round" />
        <path d={neckP} fill="none" stroke={C.goose} strokeWidth={19} strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={17} fill={C.goose} stroke={KRP.ink} strokeWidth={4.5} />
        <path d={neckP} fill="none" stroke={C.goose} strokeWidth={18} strokeLinecap="round" opacity={0.95} />
        <path d={`M ${head[0] + 12} ${head[1] - 6} L ${head[0] + 40} ${head[1] + (fwd ? -4 : 2)} L ${head[0] + 12} ${head[1] + 8} Z`}
          fill={C.bill} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
        {fwd && <path d={`M ${head[0] + 12} ${head[1] + 2} L ${head[0] + 34} ${head[1] + 10}`} stroke={KRP.ink} strokeWidth={3} />}
        <circle cx={head[0] + 4} cy={head[1] - 4} r={3.5} fill={KRP.ink} />
      </g>
    </g>
  );
};

// 巻物 (丸めた状態・横から見た円筒) — YawaC2 の L1bScroll と同じ
const L1cScroll: React.FC<{ x: number; y: number; len?: number; r?: number; rot?: number }> = ({ x, y, len = 140, r = 16, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-len / 2} y={-r} width={len} height={r * 2} fill={C.scroll} stroke={KRP.ink} strokeWidth={3.5} />
    <line x1={-len / 2 + 10} y1={-r * 0.3} x2={len / 2 - 10} y2={-r * 0.3} stroke={C.scrollEdge} strokeWidth={2.5} />
    <ellipse cx={len / 2} cy={0} rx={r * 0.45} ry={r} fill={C.scrollEdge} stroke={KRP.ink} strokeWidth={3} />
    <circle cx={len / 2} cy={0} r={r * 0.3} fill={C.scrollRod} />
  </g>
);

// 円柱 — YawaC2 の L1bColumn と同じ
const L1cColumn: React.FC<{ x: number; top: number; bot: number; w: number; fill?: string; shade?: string; ionic?: boolean }> = ({
  x, top, bot, w, fill = C.travertine, shade = C.travertineShade, ionic = true,
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

// 油ランプ (横から)。x,y: 底 / lean: 炎のなびき (度) — YawaC2 #59 のランプと同じ形
const L1cLamp: React.FC<{ x: number; y: number; s?: number; f: number; lean?: number; glow?: number }> = ({ x, y, s = 1, f, lean = 0, glow = 1 }) => {
  const flick = Math.sin(f / 2.3) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={88} cy={-60} r={110 + Math.sin(f / 3) * 6} fill={C.flame} opacity={0.13 * glow} />
      <path d="M -60 0 Q -50 -40 0 -42 Q 40 -40 60 -20 L 86 -24 Q 92 -12 84 -6 L 56 -2 Q 30 8 -60 0 Z" fill={C.lampBronze} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -70 -14 Q -92 -30 -78 -44" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      <circle cx={-8} cy={-30} r={9} fill={C.pompBlack} stroke={KRP.ink} strokeWidth={3} />
      <g transform={`rotate(${lean} 88 -22)`}>
        <path d={`M 84 -22 Q ${74 + flick} -66 ${88 + flick * 0.5} -94 Q 106 -58 90 -22 Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={88} cy={-46} rx={7} ry={15} fill={C.flameCore} />
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#62 【図】 さて、ここで問題です。
// 設計: クイズ。ローマの石板 (大理石の板に彫った枠) の上に `QuizQ` がぽん。板の縁の装飾。人は置かない
// どこ: ローマの石積みの壁 (トラバーチンの切り石・赤い帯) に打ちつけた、取っ手形の耳 (ansa) つきの大理石の銘板。下に石の棚
// 演出: 銘板の真ん中で、ノミの音とともに石の粉が飛び、月桂冠の輪の中に赤いQがぽんと出る。縁は卵鏃模様・四隅にロゼット・耳に青銅の鋲
// 動き: カメラ 1.07→1.0 に引く / ノミと槌が叩く (f2〜14) / 石の粉が散る / 月桂冠の葉が1枚ずつ出る (f10〜34) / Q が f8〜18 でぽん
const Yw062: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.07, 1.0, easeInOut(seg(f, 0, 40)));
  const qT = seg(f, 8, 18);
  const tap = f < 16 ? Math.abs(Math.sin(f / 1.3)) : 0;
  const dust = seg(f, 6, 30);
  const leafT = seg(f, 10, 34);
  const CX = 960, CY = 470;
  return (
    <Frame f={f} seed={3062} bg={C.travertine}>
      <g transform={cam(960, 500, k)}>
        {/* 石積みの壁 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.travertine} />
        {Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => {
          const bw = 260, bh = 128;
          const x = -60 + c * bw + (r % 2) * 130;
          const y = -30 + r * bh;
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={bw - 8} height={bh - 8} rx={6} fill={(r + c) % 3 ? C.travertine : C.stucco} stroke={C.travertineShade} strokeWidth={5} />
              {Array.from({ length: 3 }, (_, i) => (
                <circle key={i} cx={x + 30 + rnd(620 + r, c * 3 + i) * (bw - 60)} cy={y + 20 + rnd(621 + c, r * 3 + i) * (bh - 40)} r={3 + rnd(622, r * 9 + c + i) * 4} fill={C.travertineShade} />
              ))}
            </g>
          );
        }))}
        <rect x={-40} y={70} width={W + 80} height={26} fill={C.pompRed} opacity={0.85} />
        <rect x={-40} y={96} width={W + 80} height={8} fill={C.pompRedDark} opacity={0.7} />
        {/* 石板の影 */}
        <path d="M 404 188 L 1556 188 L 1556 812 L 404 812 Z" fill={KRP.ink} opacity={0.14} transform="translate(14 16)" />
        {/* 耳 (ansa) */}
        {[-1, 1].map((d) => (
          <g key={d}>
            <path d={`M ${CX + d * 590} 300 L ${CX + d * 760} 220 L ${CX + d * 760} 720 L ${CX + d * 590} 640 Z`} fill={C.marble} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
            <path d={`M ${CX + d * 610} 330 L ${CX + d * 730} 270 L ${CX + d * 730} 670 L ${CX + d * 610} 610 Z`} fill="none" stroke={C.marbleShade} strokeWidth={5} />
            <circle cx={CX + d * 692} cy={470} r={20} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={CX + d * 688} cy={465} r={6} fill={YP.brass} />
          </g>
        ))}
        {/* 本体の大理石 */}
        <rect x={CX - 590} y={180} width={1180} height={620} rx={10} fill={C.marble} stroke={KRP.ink} strokeWidth={8} />
        {/* 大理石の筋 */}
        <g fill="none" stroke={C.marbleVein} strokeWidth={3} opacity={0.75}>
          <path d="M 400 260 Q 520 300 600 280 Q 700 250 760 330 Q 800 380 900 370" />
          <path d="M 1300 210 Q 1260 300 1340 360 Q 1420 420 1390 520" />
          <path d="M 1500 640 Q 1400 700 1300 690 Q 1200 680 1150 760" />
          <path d="M 420 640 Q 500 600 560 650 Q 620 700 700 690" />
          <path d="M 640 520 q 30 -20 60 6" />
        </g>
        {/* 段の彫り (面取りの二重枠) */}
        <rect x={CX - 560} y={210} width={1120} height={560} rx={6} fill="none" stroke={C.marbleDeep} strokeWidth={5} />
        <rect x={CX - 540} y={230} width={1080} height={520} rx={4} fill={C.marbleShade} opacity={0.45} stroke={KRP.ink} strokeWidth={4} />
        <rect x={CX - 500} y={270} width={1000} height={440} rx={4} fill={C.marble} stroke={C.marbleDeep} strokeWidth={4} />
        {/* 卵鏃模様の縁 */}
        {Array.from({ length: 24 }, (_, i) => (
          <g key={`t${i}`}>
            <ellipse cx={CX - 480 + i * 41.7} cy={250} rx={13} ry={10} fill={C.marbleShade} stroke={KRP.ink} strokeWidth={2.5} />
            <ellipse cx={CX - 480 + i * 41.7} cy={730} rx={13} ry={10} fill={C.marbleShade} stroke={KRP.ink} strokeWidth={2.5} />
            {i < 23 && <path d={`M ${CX - 459 + i * 41.7} 242 l 0 16 M ${CX - 459 + i * 41.7} 722 l 0 16`} stroke={C.marbleDeep} strokeWidth={3} />}
          </g>
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <g key={`s${i}`}>
            <ellipse cx={CX - 520} cy={290 + i * 40} rx={9} ry={13} fill={C.marbleShade} stroke={KRP.ink} strokeWidth={2.5} />
            <ellipse cx={CX + 520} cy={290 + i * 40} rx={9} ry={13} fill={C.marbleShade} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
        {/* 四隅のロゼット */}
        {([[CX - 520, 250], [CX + 520, 250], [CX - 520, 730], [CX + 520, 730]] as const).map(([rx, ry], i) => (
          <g key={`r${i}`} transform={`translate(${rx} ${ry})`}>
            {Array.from({ length: 6 }, (_, j) => (
              <ellipse key={j} cx={0} cy={-14} rx={8} ry={13} fill={C.marble} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${j * 60})`} />
            ))}
            <circle r={7} fill={C.marbleDeep} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        ))}
        {/* 月桂冠の輪 (葉が1枚ずつ彫り出される) */}
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${CX} ${CY}) scale(${d} 1)`}>
            <path d={`M ${Math.cos(1.92) * 205} ${Math.sin(1.92) * 205} A 205 205 0 0 1 ${Math.cos(4.36) * 205} ${Math.sin(4.36) * 205}`}
              fill="none" stroke={C.laurelDark} strokeWidth={5} opacity={leafT} />
            {Array.from({ length: 11 }, (_, i) => {
              const th = 110 + i * 14;
              const a = (th * Math.PI) / 180;
              const on = clamp01(leafT * 12 - i);
              if (on <= 0) return null;
              return (
                <g key={i} transform={`translate(${Math.cos(a) * 205} ${Math.sin(a) * 205}) rotate(${th + 90}) scale(${pop(on)})`}>
                  <ellipse cx={-6} cy={-16} rx={24} ry={10} fill={C.laurel} stroke={KRP.ink} strokeWidth={3} transform="rotate(-62 -6 -16)" />
                  <ellipse cx={6} cy={-16} rx={24} ry={10} fill={C.laurelDark} stroke={KRP.ink} strokeWidth={3} transform="rotate(62 6 -16)" />
                </g>
              );
            })}
          </g>
        ))}
        {/* 冠の結び目のリボン */}
        <g opacity={leafT}>
          <path d={`M ${CX - 30} ${CY + 196} q -40 30 -70 80 l 30 -6 l 10 28 q 20 -50 50 -80 Z`} fill={C.pompRed} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${CX + 30} ${CY + 196} q 40 30 70 80 l -30 -6 l -10 28 q -20 -50 -50 -80 Z`} fill={C.pompRed} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={CX} cy={CY + 196} r={18} fill={C.pompRedDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* Q の彫り跡 (くぼみ) */}
        <circle cx={CX} cy={CY} r={178 * qT} fill={C.marbleShade} stroke={C.marbleDeep} strokeWidth={5} opacity={0.8} />
        <QuizQ f={f} x={CX} y={CY - 4} s={1.5} t={qT} />
        {/* 飛び散る石の粉 */}
        {dust > 0 && dust < 1 && Array.from({ length: 14 }, (_, i) => {
          const a = rnd(6201, i) * Math.PI * 2;
          const dd = 150 + dust * (120 + rnd(6202, i) * 160);
          return <rect key={i} x={CX + Math.cos(a) * dd} y={CY + Math.sin(a) * dd * 0.8} width={8 + rnd(6203, i) * 10} height={6 + rnd(6204, i) * 8}
            fill={C.marbleShade} stroke={KRP.ink} strokeWidth={2} opacity={1 - dust} transform={`rotate(${i * 37} ${CX + Math.cos(a) * dd} ${CY + Math.sin(a) * dd * 0.8})`} />;
        })}
        {/* ノミと槌 (右上で叩く) */}
        <g transform={`translate(${CX + 250} ${CY - 250}) rotate(${-38 + tap * 10})`} opacity={1 - seg(f, 16, 24)}>
          <rect x={-10} y={-10} width={20} height={150} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-14} y={-60} width={28} height={60} rx={6} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(0 ${-90 - tap * 40})`}>
            <rect x={-44} y={-30} width={88} height={44} rx={10} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={36} y={-14} width={150} height={16} rx={8} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 石の棚と、置いたノミ・はけ */}
        <rect x={180} y={808} width={1560} height={40} rx={6} fill={C.travertineShade} stroke={KRP.ink} strokeWidth={6} />
        <rect x={180} y={848} width={1560} height={60} fill={C.stuccoShade} stroke={KRP.ink} strokeWidth={5} />
        <g opacity={seg(f, 18, 28)}>
          <g transform="translate(1340 800) rotate(-4)">
            <rect x={0} y={-16} width={150} height={16} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
            <rect x={-60} y={-20} width={64} height={24} rx={6} fill={YP.wood} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
          <g transform="translate(1560 800) rotate(-20)">
            <rect x={-70} y={-30} width={90} height={30} rx={8} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={14} y={-20} width={110} height={12} rx={6} fill={YP.wood} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        </g>
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={420 + i * 120 + rnd(6205, i) * 50} cy={802 - rnd(6206, i) * 6} r={4 + rnd(6207, i) * 5} fill={C.marbleShade} stroke={KRP.ink} strokeWidth={1.5} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#63 【並】 この羽毛をめぐって、ローマの軍隊で、ある事件が起きました。何でしょうか。
// 設計: ローマ軍の砦 (木の柵・見張り台・軍旗)。見張り台が**空っぽ**で、`QMark` が浮かぶ。地面に羽根が1枚落ちている (ヒント)
// どこ: 北の国境の曇り空。針葉樹の森の手前に、丸太を尖らせた柵と、門と、高い見張り台。赤い軍旗 (ウェクシルム) と鷲の竿
// 演出: 見張り台の上は空っぽ。槍が柱に立てかけたまま・松明だけ燃えている。門が半開き。泥の地面に、ガチョウの足あとと兵のサンダルの足あとが右へ続き、その途中に白い羽根が1枚
// 動き: カメラが見張り台から足元へ下がる / 門が風できしんで開く / 軍旗がはためく / 羽根がふるえる / ？が f12〜22 でぽん
const Yw063: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.06, 1.0, easeInOut(seg(f, 0, 40)));
  const camY = lerp(40, -10, easeInOut(seg(f, 0, 40)));
  const gate = lerp(6, 34, easeInOut(seg(f, 4, 32))) + Math.sin(f / 5) * 2;
  const wave = (i: number) => Math.sin(f / 4 + i * 0.9) * 12;
  const TX = 1000; // 見張り台の中心
  return (
    <Frame f={f} seed={3063} bg={C.northSky}>
      <g transform={cam(960, 540, k, 0, camY)}>
        <rect x={-40} y={-80} width={W + 80} height={760} fill={C.northSky} />
        <rect x={-40} y={300} width={W + 80} height={300} fill={C.northSky2} opacity={0.6} />
        {/* 低い雲 */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={((200 + i * 520 + f * (1.2 + i * 0.3)) % 2200) - 140} cy={110 + (i % 2) * 70} rx={220} ry={40} fill={KRP.white} opacity={0.55} />
        ))}
        {/* 針葉樹の森 (遠・近) */}
        {Array.from({ length: 26 }, (_, i) => {
          const x = -40 + i * 80, h = 140 + rnd(6301, i) * 90;
          return <path key={`a${i}`} d={`M ${x} 520 L ${x + 40} ${520 - h} L ${x + 80} 520 Z`} fill={C.pineFar} stroke={KRP.ink} strokeWidth={2.5} opacity={0.85} />;
        })}
        {Array.from({ length: 18 }, (_, i) => {
          const x = -60 + i * 118, h = 200 + rnd(6302, i) * 80;
          return (
            <g key={`b${i}`}>
              <path d={`M ${x} 560 L ${x + 30} ${560 - h * 0.55} L ${x + 18} ${560 - h * 0.55} L ${x + 56} ${560 - h} L ${x + 94} ${560 - h * 0.55} L ${x + 82} ${560 - h * 0.55} L ${x + 112} 560 Z`} fill={C.pineNear} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 泥の地面 */}
        <rect x={-40} y={600} width={W + 80} height={560} fill={C.mud} stroke={KRP.ink} strokeWidth={4} />
        <path d="M -40 640 Q 400 620 900 650 Q 1400 676 1960 640" fill="none" stroke={C.mudDark} strokeWidth={5} opacity={0.6} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${rnd(6303, i) * 1900} ${700 + rnd(6304, i) * 300} q 14 -18 28 0`} fill="none" stroke={C.marshDark} strokeWidth={4} />
        ))}
        {/* 柵 (尖った丸太) */}
        {Array.from({ length: 40 }, (_, i) => {
          const x = -40 + i * 50;
          if (x > 300 && x < 520) return null; // 門
          if (x > TX - 160 && x < TX + 160) return null; // 見張り台の脚の前
          const top = 400 + (i % 3) * 8;
          return (
            <g key={i}>
              <path d={`M ${x} 640 L ${x} ${top} L ${x + 23} ${top - 34} L ${x + 46} ${top} L ${x + 46} 640 Z`} fill={i % 2 ? C.palisade : YP.wood} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
              <line x1={x + 14} y1={top + 20} x2={x + 16} y2={620} stroke={C.palisadeDark} strokeWidth={3} opacity={0.6} />
            </g>
          );
        })}
        <rect x={-40} y={470} width={340} height={18} fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={520} y={470} width={TX - 680} height={18} fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={TX + 160} y={470} width={W - TX} height={18} fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 門 (半開き) */}
        <rect x={290} y={360} width={30} height={290} fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={510} y={360} width={30} height={290} fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={280} y={340} width={270} height={30} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={320} y={370} width={190} height={270} fill={C.pineNear} opacity={0.6} />
        <g transform={`translate(320 640) skewY(${gate * 0.3}) scale(${Math.cos((gate * Math.PI) / 180)} 1)`}>
          <rect x={0} y={-270} width={190} height={270} fill={C.palisade} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={i * 47 + 24} y1={-266} x2={i * 47 + 24} y2={-4} stroke={C.palisadeDark} strokeWidth={4} />)}
          <path d="M 6 -230 L 184 -40" stroke={C.palisadeDark} strokeWidth={10} />
          <circle cx={168} cy={-140} r={8} fill={KRP.ink} />
        </g>
        {/* 見張り台 */}
        {[-130, 130].map((dx) => (
          <rect key={dx} x={TX + dx - 14} y={300} width={28} height={360} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i} stroke={C.palisadeDark} strokeWidth={8}>
            <line x1={TX - 120} y1={360 + i * 100} x2={TX + 120} y2={440 + i * 100} />
            <line x1={TX + 120} y1={360 + i * 100} x2={TX - 120} y2={440 + i * 100} />
          </g>
        ))}
        {/* はしご */}
        <g>
          <line x1={TX + 160} y1={660} x2={TX + 210} y2={300} stroke={KRP.ink} strokeWidth={12} />
          <line x1={TX + 160} y1={660} x2={TX + 210} y2={300} stroke={YP.wood} strokeWidth={7} />
          <line x1={TX + 210} y1={660} x2={TX + 260} y2={300} stroke={KRP.ink} strokeWidth={12} />
          <line x1={TX + 210} y1={660} x2={TX + 260} y2={300} stroke={YP.wood} strokeWidth={7} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={TX + 165 + i * 6} y1={620 - i * 44} x2={TX + 215 + i * 6} y2={620 - i * 44} stroke={KRP.ink} strokeWidth={6} />)}
        </g>
        {/* 台の床と手すり (誰もいない) */}
        <rect x={TX - 170} y={290} width={340} height={26} fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={TX - 170} y={190} width={340} height={100} fill="none" stroke={KRP.ink} strokeWidth={0} />
        {[-160, -80, 0, 80, 160].map((dx) => <rect key={dx} x={TX + dx - 8} y={200} width={16} height={92} fill={YP.wood} stroke={KRP.ink} strokeWidth={3.5} />)}
        <rect x={TX - 176} y={196} width={352} height={16} rx={4} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
        {/* 屋根 */}
        <path d={`M ${TX - 200} 120 L ${TX} 40 L ${TX + 200} 120 Z`} fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {[-150, 150].map((dx) => <rect key={dx} x={TX + dx - 8} y={110} width={16} height={90} fill={YP.wood} stroke={KRP.ink} strokeWidth={3.5} />)}
        {/* 置き去りの槍と、杭に掛けた盾 */}
        <line x1={TX - 110} y1={292} x2={TX - 60} y2={60} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={TX - 110} y1={292} x2={TX - 60} y2={60} stroke={YP.wood} strokeWidth={5} strokeLinecap="round" />
        <path d={`M ${TX - 60} 60 L ${TX - 66} 26 L ${TX - 48} 58 Z`} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        <g transform={`translate(${TX - 150} 520) rotate(-4)`}>
          <rect x={-46} y={-70} width={92} height={140} rx={14} fill={C.tunicRed} stroke={KRP.ink} strokeWidth={5} />
          <circle r={16} fill={C.shieldGold} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -56 L -8 -20 M 0 20 L 8 56" stroke={C.shieldGold} strokeWidth={6} />
        </g>
        {/* 燃えたままの松明 */}
        <g transform={`translate(${TX + 150} 200)`}>
          <circle cx={0} cy={-50} r={56 + Math.sin(f / 3) * 5} fill={C.flame} opacity={0.18} />
          <rect x={-7} y={-40} width={14} height={60} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M -12 -40 Q ${-16 + Math.sin(f / 2) * 4} -80 ${Math.sin(f / 2.6) * 6} -104 Q 18 -76 12 -40 Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 軍旗 (ウェクシルム) と鷲 */}
        <g transform="translate(700 660)">
          <line x1={0} y1={0} x2={0} y2={-500} stroke={KRP.ink} strokeWidth={12} />
          <line x1={0} y1={0} x2={0} y2={-500} stroke={YP.woodDark} strokeWidth={7} />
          <rect x={-80} y={-450} width={160} height={10} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
          <path d={`M -76 -440 L 76 -440 L ${76 + wave(1) * 0.4} -310 Q 40 ${-300 + wave(2)} 0 -310 Q -40 ${-320 + wave(3)} ${-76 + wave(4) * 0.4} -310 Z`}
            fill={C.tunicRed} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={0} cy={-380} r={24} fill="none" stroke={C.shieldGold} strokeWidth={6} />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-66 + i * 22} y1={-310 + wave(i) * 0.2} x2={-66 + i * 22} y2={-290 + wave(i) * 0.3} stroke={C.shieldGold} strokeWidth={5} />)}
          <g transform="translate(0 -520)">
            <path d="M -46 0 Q -30 -40 0 -26 Q 30 -40 46 0 Q 20 -8 0 6 Q -20 -8 -46 0 Z" fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={0} cy={-30} r={12} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 足あと: ガチョウ (水かき) と兵のサンダルが右へ */}
        {Array.from({ length: 7 }, (_, i) => {
          const x = 1220 + i * 100, y = 700 + (i % 2) * 22;
          return (
            <g key={`g${i}`}>
              <path d={`M ${x} ${y} L ${x + 22} ${y - 16} Q ${x + 24} ${y} ${x + 22} ${y + 16} Z`} fill={C.mudDark} opacity={0.45} />
              <path d={`M ${x} ${y} l 22 -16 M ${x} ${y} l 26 0 M ${x} ${y} l 22 16 M ${x} ${y} l -9 0`} stroke={C.mudDark} strokeWidth={5} strokeLinecap="round" />
            </g>
          );
        })}
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={`s${i}`} cx={1120 + i * 130} cy={760 + (i % 2) * 26} rx={26} ry={11} fill={C.mudDark} opacity={0.75} />
        ))}
        {/* 落ちている羽根 1枚 (ヒント) */}
        <ellipse cx={1180} cy={752} rx={90} ry={12} fill={KRP.ink} opacity={0.16} />
        <L1cFeather x={1120} y={748} s={0.95} rot={-78 + Math.sin(f / 3.5) * 6} />
        <g opacity={0.5 + Math.sin(f / 4) * 0.3}>
          {[0, 1, 2].map((i) => <path key={i} d={`M ${1000 + i * 10} ${720 - i * 18} q 30 -6 60 0`} fill="none" stroke={KRP.white} strokeWidth={4} strokeLinecap="round" />)}
        </g>
        {/* 空っぽの見張り台に ？ */}
        <QMark x={TX} y={286} s={1.3} f={f} t={seg(f, 12, 22)} />
      </g>
    </Frame>
  );
};
// ---- 文#64 【山】 答えは、指揮官が、ガチョウを捕まえるために、部隊ごと持ち場を離れてしまった、です。
// 設計: ★笑いの山①。北の湿原。赤いチュニックのローマ兵たち (4〜5人) と兜の羽飾りの指揮官が、槍を放り出して白いガチョウを追いかけ回す (pose="run")。ガチョウは逃げ、羽根が舞う。遠くの丘の上に空っぽの砦。札「持ち場」に矢印
// どこ: 北の湿原。霧の曇り空、遠くの丘の上に小さな空っぽの砦 (札「持ち場」と下向き矢印)。手前は水たまりと葦とガマの穂
// 演出: 横に張った羽飾りの指揮官が、両手を広げてガチョウに飛びかかる。兵4人が槍を放り出して追う (1人は泥ですべってひっくり返る)。ガチョウ3羽は羽ばたいて逃げ、羽根が舞う。左の地面に放り出した槍と盾
// 動き: 全員が右へ走り、カメラも右へ流れる (丘は遅く動く=奥行き) / 水しぶき / 宙を回る槍 / 羽根が舞う / 札 f10〜20・矢印 f14〜24
const Yw064: React.FC<{ f: number }> = ({ f }) => {
  const camDx = -f * 2.5;
  const k = lerp(1.0, 1.04, easeInOut(seg(f, 0, 40)));
  const P = (base: number) => base + f * 4;
  const G = (base: number) => base + f * 5;
  const leap = Math.abs(Math.sin(f / 6)) * 24;
  const splash = (cx: number, cy: number, ph: number, sc = 1) => {
    const a = ((f + ph * 7) % 14) / 14;
    return (
      <g key={`sp${cx}`} opacity={1 - a}>
        <ellipse cx={cx} cy={cy} rx={(30 + a * 70) * sc} ry={(8 + a * 14) * sc} fill="none" stroke={C.seaFoam} strokeWidth={5} />
        {[-1, 0, 1].map((d) => <circle key={d} cx={cx + d * (20 + a * 40) * sc} cy={cy - (30 + d * d * -10) * a * sc - 10} r={6 * sc} fill={C.pool} stroke={KRP.ink} strokeWidth={2} />)}
      </g>
    );
  };
  const soldiers: { b: number; y: number; s: number; face: "joy" | "surprised" | "angry"; lean: number; ph: number }[] = [
    { b: 300, y: 870, s: 1.15, face: "joy", lean: 12, ph: 1 },
    { b: 600, y: 790, s: 1.0, face: "surprised", lean: 10, ph: 2 },
    { b: 1300, y: 650, s: 0.85, face: "angry", lean: 14, ph: 3 },
  ];
  const CMX = P(860), CMY = 860 - leap;
  return (
    <Frame f={f} seed={3064} bg={C.northSky}>
      <g transform={cam(960, 540, k)}>
        <rect x={-60} y={-80} width={W + 120} height={700} fill={C.northSky} />
        <rect x={-60} y={240} width={W + 120} height={260} fill={C.northSky2} opacity={0.55} />
        {/* 遠くの丘と空っぽの砦 (ゆっくり動く) */}
        <g transform={`translate(${camDx * 0.3} 0)`}>
          <path d="M -120 470 Q 200 420 500 350 Q 760 290 1000 340 Q 1200 400 1400 430 Q 1700 380 2100 450 L 2100 560 L -120 560 Z" fill={C.pineFar} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          <g transform="translate(780 312)">
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M ${-100 + i * 22} 6 L ${-100 + i * 22} -26 L ${-89 + i * 22} -40 L ${-78 + i * 22} -26 L ${-78 + i * 22} 6 Z`} fill={C.palisade} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
            {[-26, 26].map((dx) => <rect key={dx} x={dx - 4} y={-110} width={8} height={110} fill={YP.wood} stroke={KRP.ink} strokeWidth={2.5} />)}
            <rect x={-40} y={-116} width={80} height={10} fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={2.5} />
            <path d="M -50 -150 L 0 -176 L 50 -150 Z" fill={C.palisadeDark} stroke={KRP.ink} strokeWidth={2.5} />
            {[-34, 34].map((dx) => <line key={dx} x1={dx} y1={-152} x2={dx} y2={-116} stroke={KRP.ink} strokeWidth={4} />)}
            <line x1={70} y1={0} x2={70} y2={-130} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M 70 -130 L 110 ${-124 + Math.sin(f / 4) * 4} L 70 -104 Z`} fill={C.tunicRed} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
          <TagPlate x={780} y={84} text="持ち場" size={46} t={seg(f, 10, 20)} />
          <Arrow x={780} y={196} s={0.6} rot={90} t={seg(f, 14, 24)} />
        </g>
        {/* 霧の帯 */}
        <rect x={-60} y={470} width={W + 120} height={60} fill={KRP.white} opacity={0.35} />
        {/* 湿原 */}
        <rect x={-60} y={500} width={W + 120} height={640} fill={C.marsh} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`translate(${camDx} 0)`}>
          {/* 水たまり */}
          {([[200, 640, 260], [900, 600, 200], [1500, 650, 300], [2000, 610, 220], [600, 900, 320], [1300, 930, 380], [1900, 900, 260]] as const).map(([cx, cy, rx], i) => (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.16} fill={C.pool} stroke={KRP.ink} strokeWidth={3.5} />
              <ellipse cx={cx - rx * 0.2} cy={cy - rx * 0.03} rx={rx * 0.4} ry={rx * 0.04} fill={C.seaFoam} opacity={0.7} />
            </g>
          ))}
          {/* 葦の茂み (奥) */}
          {Array.from({ length: 22 }, (_, i) => {
            const x = -40 + i * 105 + rnd(6401, i) * 40, y = 560 + rnd(6402, i) * 40;
            return (
              <g key={i} stroke={i % 2 ? C.reed : C.reedDark} strokeWidth={5} strokeLinecap="round" fill="none">
                {[-14, -4, 6, 16].map((d, j) => <path key={j} d={`M ${x + d} ${y} q ${d * 0.6 + Math.sin(f / 7 + i + j) * 4} -50 ${d * 1.2} -${80 + j * 12}`} />)}
              </g>
            );
          })}
          {/* 放り出した槍と盾 */}
          <g>
            <line x1={60} y1={820} x2={520} y2={760} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
            <line x1={60} y1={820} x2={520} y2={760} stroke={YP.wood} strokeWidth={6} strokeLinecap="round" />
            <path d="M 520 760 L 570 752 L 522 772 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
            <line x1={120} y1={720} x2={500} y2={830} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
            <line x1={120} y1={720} x2={500} y2={830} stroke={YP.wood} strokeWidth={6} strokeLinecap="round" />
            <path d="M 500 830 L 548 846 L 498 846 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
            <g transform="translate(250 790) rotate(-70) scale(1 0.5)">
              <rect x={-60} y={-90} width={120} height={180} rx={16} fill={C.tunicRed} stroke={KRP.ink} strokeWidth={6} />
              <circle r={20} fill={C.shieldGold} stroke={KRP.ink} strokeWidth={5} />
            </g>
            {/* 宙で回っている槍 (いま放り出したところ) */}
            <g transform={`translate(${P(240)} ${520 - Math.sin(f / 10) * 30}) rotate(${f * 9})`}>
              <line x1={-150} y1={0} x2={150} y2={0} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" />
              <line x1={-150} y1={0} x2={150} y2={0} stroke={YP.wood} strokeWidth={5} strokeLinecap="round" />
              <path d="M 150 -8 L 196 0 L 150 8 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
            </g>
          </g>
          {/* すべってひっくり返った兵 */}
          {splash(P(130) + 40, 905, 3, 1.4)}
          <Person x={P(130)} y={900} s={1.0} f={f} face="surprised" pose="banzai" cloth={C.tunicRed} clothDark={C.tunicRedDark} hair="none" lean={-34} phase={4} />
          <L1cOver x={P(130)} y={900} s={1.0} f={f} phase={4} lean={-34}><L1cHelmet /></L1cOver>
          {/* ガチョウ (逃げる) */}
          {([[1180, 820, 1.05, 0, 1], [1440, 716, 0.9, 2, 1], [1620, 870, 1.0, 4, 0.8]] as const).map(([b, y, s, ph, fl], i) => (
            <g key={`g${i}`}>
              {splash(G(b) - 30, y + 4, ph, 0.8)}
              <L1cGoose x={G(b)} y={y - Math.abs(Math.sin((f + ph * 4) / 3)) * 26} s={s} f={f} fwd flap={fl} phase={ph} />
            </g>
          ))}
          {/* 兵 (走る) */}
          {soldiers.map((sd, i) => (
            <g key={`s${i}`}>
              {splash(P(sd.b) - 20, sd.y + 6, sd.ph)}
              <Person x={P(sd.b)} y={sd.y} s={sd.s} f={f} face={sd.face} pose="run" cloth={C.tunicRed} clothDark={C.tunicRedDark} hair="none" lean={sd.lean} phase={sd.ph} gaze={[4, 0]} />
              <L1cOver x={P(sd.b)} y={sd.y} s={sd.s} f={f} phase={sd.ph} lean={sd.lean}><L1cHelmet /></L1cOver>
            </g>
          ))}
          {/* 指揮官 (羽飾りの兜で、両手を広げて飛びかかる) */}
          {splash(CMX - 30, 866, 5, 1.2)}
          <Person x={CMX} y={CMY} s={1.25} f={f} face="joy" pose="banzai" cloth={C.tunicRed} clothDark={C.tunicRedDark} hair="none" lean={28} phase={5} />
          <L1cOver x={CMX} y={CMY} s={1.25} f={f} phase={5} lean={28}>
            <L1cCommanderHelmet flut={Math.sin(f / 2) * 8} />
            {/* 指揮官の赤いマント */}
            <path d={`M -58 -150 Q -120 -110 ${-150 + Math.sin(f / 3) * 14} -40 L -60 -60 Z`} fill={C.tunicRedDark} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            {/* 金の飾り帯 */}
            <rect x={-58} y={-78} width={116} height={14} fill={C.shieldGold} stroke={KRP.ink} strokeWidth={3.5} />
          </L1cOver>
          {/* 舞う羽根 */}
          {Array.from({ length: 22 }, (_, i) => {
            const src = i % 3 === 0 ? G(1180) : i % 3 === 1 ? G(1440) : G(1620);
            const life = ((f * (1.2 + rnd(6403, i)) + rnd(6404, i) * 60) % 60) / 60;
            const x = src - 40 - life * (40 + rnd(6405, i) * 130) + Math.sin((f + i * 9) / 6) * 26;
            const y = 690 - life * (140 + rnd(6406, i) * 240) + rnd(6407, i) * 60;
            return <L1cFeather key={i} x={x} y={y} s={0.28 + rnd(6408, i) * 0.25} rot={f * (4 + i % 5) + i * 40} op={1 - life * 0.6} />;
          })}
          {/* 手前の葦とガマの穂 */}
          {Array.from({ length: 12 }, (_, i) => {
            const x = -40 + i * 190 + rnd(6409, i) * 60;
            return (
              <g key={`f${i}`}>
                {[-12, 0, 12].map((d, j) => (
                  <path key={j} d={`M ${x + d} 1100 q ${d + Math.sin(f / 6 + i) * 6} -120 ${d * 2} -${190 + j * 30}`} fill="none" stroke={C.reedDark} strokeWidth={7} strokeLinecap="round" />
                ))}
                {i % 2 === 0 && <rect x={x - 9} y={880 - (i % 3) * 20} width={18} height={56} rx={9} fill={C.cattail} stroke={KRP.ink} strokeWidth={3} />}
              </g>
            );
          })}
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#65 【並】 プリニウスによれば、そうして告発された指揮官たちが、いたそうです。
// 設計: ローマの法廷 (円柱・石の壇)。指揮官が肩を落として立ち (face="sad")、手にはまだガチョウの羽根。裁く側の役人が巻物を読み上げる。札「告発」
// どこ: バシリカ (ローマの法廷) の中。イオニア式の円柱と梁、高窓から差す光の筋、右に石の壇と束桿 (ファスケス=権威の印)
// 演出: 光の筋の真ん中で、羽飾りのしおれた指揮官が、ガチョウの羽根を両手に持ったまま、しょんぼり立つ。壇の上で紫の縁取りのトーガの役人が、罪状の巻物を読み上げる。巻物はどんどん伸びて壇の下まで垂れる
// 動き: 巻物が f4〜34 で伸びる / 羽飾りがしおれる f6〜36 / 手の羽根がうなだれる / 汗がたれる / カメラが指揮官へ寄る / 札 f14〜24
const Yw065: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.0, 1.06, easeInOut(seg(f, 0, 40)));
  const roll = easeInOut(seg(f, 4, 34));
  const droop = easeInOut(seg(f, 6, 36));
  const MX = 1490, MY = 566, MS = 1.15; // 役人
  const sheetTop = MY - 136 * MS + 8;
  const sheetLen = lerp(40, 420, roll);
  const CX = 720, CY = 846, CS = 1.55; // 指揮官
  const sweat = ((f % 18) / 18);
  return (
    <Frame f={f} seed={3065} bg={C.stucco}>
      <g transform={cam(900, 560, k)}>
        {/* 奥の壁 */}
        <rect x={-40} y={-40} width={W + 80} height={880} fill={C.stucco} />
        <rect x={-40} y={520} width={W + 80} height={300} fill={C.pompRed} opacity={0.8} />
        <rect x={-40} y={508} width={W + 80} height={14} fill={C.pompOchre} stroke={KRP.ink} strokeWidth={3} />
        {[200, 560, 920].map((x) => <rect key={x} x={x} y={560} width={260} height={220} fill="none" stroke={C.pompOchre} strokeWidth={5} />)}
        {/* 高窓と光の筋 */}
        <rect x={640} y={150} width={180} height={150} rx={6} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        <line x1={730} y1={150} x2={730} y2={300} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 640 300 L 820 300 L 960 880 L 460 880 Z" fill={C.flameCore} opacity={0.3 + Math.sin(f / 9) * 0.04} />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={560 + rnd(6501, i) * 320 + Math.sin((f + i * 11) / 13) * 16} cy={360 + ((f * 0.8 + rnd(6502, i) * 440) % 440)} r={3} fill={KRP.white} opacity={0.8} />
        ))}
        {/* 梁と円柱 */}
        <rect x={-40} y={70} width={W + 80} height={60} fill={C.travertine} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-30 + i * 50} y={130} width={26} height={16} fill={C.travertineShade} stroke={KRP.ink} strokeWidth={2.5} />)}
        {[110, 360].map((x) => <L1cColumn key={x} x={x} top={146} bot={840} w={92} />)}
        <L1cColumn x={1850} top={146} bot={560} w={80} />
        {/* 床 */}
        <rect x={-40} y={820} width={W + 80} height={300} fill={C.pave} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-40 + i * 180} y1={820} x2={-200 + i * 220} y2={1100} stroke={C.paveDark} strokeWidth={4} />)}
        <line x1={-40} y1={900} x2={W + 40} y2={900} stroke={C.paveDark} strokeWidth={4} />
        {/* 石の壇 */}
        <rect x={1130} y={560} width={790} height={40} fill={C.travertine} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1150} y={600} width={770} height={225} fill={C.travertineShade} stroke={KRP.ink} strokeWidth={6} />
        {[1190, 1420, 1650].map((x) => <rect key={x} x={x} y={630} width={190} height={160} fill="none" stroke={C.marbleDeep} strokeWidth={4} />)}
        {[0, 1, 2].map((i) => <rect key={i} x={1060 - i * 40 + 40} y={600 + i * 75} width={100 + i * 40} height={75} fill={C.travertine} stroke={KRP.ink} strokeWidth={4} opacity={0.98} transform="translate(-40 0)" />)}
        {/* 束桿 (ファスケス) */}
        <g transform="translate(1230 560)">
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-36 + i * 10} y={-300} width={10} height={300} rx={4} fill={YP.wood} stroke={KRP.ink} strokeWidth={2.5} />)}
          {[-250, -150, -50].map((y) => <path key={y} d={`M -40 ${y} L 40 ${y + 20}`} stroke={C.tunicRed} strokeWidth={8} />)}
          <path d="M 30 -280 Q 80 -300 84 -250 Q 80 -210 30 -226 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 象牙の椅子 (X字の脚) */}
        <g stroke={KRP.ink} strokeWidth={5}>
          <line x1={MX - 70} y1={MY - 70} x2={MX + 70} y2={MY} />
          <line x1={MX + 70} y1={MY - 70} x2={MX - 70} y2={MY} />
        </g>
        <rect x={MX - 84} y={MY - 84} width={168} height={18} rx={8} fill={C.toga} stroke={KRP.ink} strokeWidth={4} />
        {/* 役人 (紫の縁のトーガ) */}
        <Person x={MX} y={MY} s={MS} f={f} face="angry" pose="hold" cloth={C.toga} clothDark={C.togaDark} hair="cap" gaze={[0, 3]} phase={2} />
        <L1cOver x={MX} y={MY} s={MS} f={f} phase={2}>
          <path d="M -58 -162 Q -30 -168 -14 -160 L 60 -82 L 60 -56 L 34 -56 L -58 -144 Z" fill={C.togaDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -50 -152 L 52 -66" stroke={C.togaStripe} strokeWidth={7} />
        </L1cOver>
        {/* 罪状の巻物 (伸びて垂れる) */}
        <g>
          <path d={`M ${MX - 78} ${sheetTop} L ${MX + 78} ${sheetTop} L ${MX + 80 + Math.sin(f / 6) * 3} ${sheetTop + sheetLen} L ${MX - 76 + Math.sin(f / 6) * 3} ${sheetTop + sheetLen} Z`}
            fill={C.scroll} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
          {Array.from({ length: Math.floor(sheetLen / 26) }, (_, i) => (
            <path key={i} d={`M ${MX - 56} ${sheetTop + 26 + i * 26} q 18 -5 36 0 q 18 5 36 0 q 18 -5 36 0`} fill="none" stroke={KRP.grayDark} strokeWidth={3} />
          ))}
          <rect x={MX - 96} y={sheetTop - 14} width={192} height={24} rx={12} fill={C.scrollEdge} stroke={KRP.ink} strokeWidth={4} />
          <rect x={MX - 92} y={sheetTop + sheetLen - 12} width={184} height={28} rx={14} fill={C.scrollEdge} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={MX - 16} cy={sheetTop - 2} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={MX + 16} cy={sheetTop - 2} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 指揮官 (しょんぼり) */}
        <ellipse cx={CX} cy={CY + 4} rx={120} ry={18} fill={KRP.ink} opacity={0.18} />
        <Person x={CX} y={CY} s={CS} f={f} face="sad" pose="hold" cloth={C.tunicRed} clothDark={C.tunicRedDark} hair="none" lean={-3} gaze={[0, 4]} phase={1} />
        <L1cOver x={CX} y={CY} s={CS} f={f} phase={1} lean={-3}>
          <L1cCommanderHelmet droop={droop} />
          <rect x={-58} y={-78} width={116} height={14} fill={C.shieldGold} stroke={KRP.ink} strokeWidth={3.5} />
          {/* 汗 */}
          <path d={`M 70 ${-250 + sweat * 50} q -8 14 0 20 q 8 -6 0 -20 Z`} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2.5} opacity={1 - sweat} />
          {/* しょんぼり線 */}
          {[-1, 1].map((d) => <path key={d} d={`M ${d * 96} -170 q ${d * 10} 20 0 40`} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />)}
        </L1cOver>
        {/* 手にまだ持っている羽根 (うなだれる) */}
        <L1cFeather x={CX} y={CY - 118 * CS} s={0.8} rot={lerp(-20, -64, droop) + Math.sin(f / 5) * 3} />
        {/* 落ちる綿毛 */}
        <circle cx={CX - 60 - seg(f, 20, 42) * 40} cy={lerp(640, 800, seg(f, 20, 42))} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} opacity={seg(f, 20, 24)} />
        <TagPlate x={1680} y={360} text="告発" size={52} t={seg(f, 14, 24)} />
      </g>
    </Frame>
  );
};

// ---- 文#66 【並】 そしてプリニウスは、こう嘆いています。
// 設計: 書斎のプリニウスが頭を抱えてため息 (face="worried")。ため息の煙のような線。机の巻物
// どこ: #59 と同じプリニウスの書斎 (巻物の棚・ヴェスヴィオ山の見える窓・ポンペイ赤の帯)。夕方で窓の空が橙
// 演出: 机に広げた巻物 (#59 で描いたガチョウの絵) の前で、プリニウスが両手で頭を抱えて、深いため息。ため息の煙がもくもく右へ流れ、ランプの炎がなびき、机の羽根がふわりと飛ばされる
// 動き: 頭を抱える腕 / ため息の煙 f10〜40 / 炎がなびく f20〜32 / 羽根が飛ぶ f22〜42 / カメラが顔へ寄る
const Yw066: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.0, 1.07, easeInOut(seg(f, 0, 40)));
  const PX = 960, PY = 830, PS = 1.5;
  const sigh = seg(f, 10, 40);
  const hit = seg(f, 20, 32);
  const fly = easeOut(seg(f, 22, 42));
  const eL = L1cBanzaiElbow(-1, f, 1), eR = L1cBanzaiElbow(1, f, 1);
  const goose = "M -60 10 L -46 -6 L -10 -14 L 26 -14 L 34 -36 L 40 -54 L 50 -60 L 66 -54 L 50 -46 L 44 -32 L 48 -8 L 34 12 L -10 18 Z";
  return (
    <Frame f={f} seed={3066} bg={C.plaster}>
      <g transform={cam(960, 500, k)}>
        <rect x={-40} y={-40} width={W + 80} height={720} fill={C.plaster} />
        <rect x={-40} y={560} width={W + 80} height={100} fill={C.pompRed} opacity={0.75} />
        {/* 巻物の棚 (#59 と同じ) */}
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
        {/* 窓とヴェスヴィオ山 (夕方) */}
        <rect x={1330} y={110} width={470} height={410} fill={C.romeSky2} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1700} cy={300} r={46} fill={C.flame} opacity={0.85} />
        <ellipse cx={1450 + f * 1.2} cy={180} rx={80} ry={20} fill={C.romeSky} opacity={0.9} />
        <path d="M 1330 400 L 1480 260 Q 1530 236 1580 262 L 1800 420 L 1800 440 L 1330 440 Z" fill={C.vesuvius} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1480 260 Q 1530 236 1580 262 L 1560 300 Q 1530 280 1500 300 Z" fill={C.vesuviusDark} />
        <rect x={1330} y={430} width={470} height={90} fill={C.bay} stroke={KRP.ink} strokeWidth={3} />
        {[0, 1].map((i) => <path key={i} d={`M ${1380 + i * 200 + Math.sin(f / 6) * 10} ${466 + i * 20} q 20 -8 40 0 q 20 8 40 0`} fill="none" stroke={KRP.white} strokeWidth={3} />)}
        <line x1={1565} y1={110} x2={1565} y2={520} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1300} y={510} width={530} height={26} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
        {/* プリニウス (頭を抱える) */}
        <Person x={PX} y={PY} s={PS} f={f} face="worried" pose="banzai" cloth={C.toga} clothDark={C.togaDark} hair="none" gaze={[0, 4]} phase={1} />
        <L1cOver x={PX} y={PY} s={PS} f={f} phase={1}>
          <L1cElder />
          <path d="M -58 -162 Q -30 -168 -14 -160 L 60 -82 L 60 -56 L 34 -56 L -58 -144 Z" fill={C.togaDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          {/* 前腕: ひじからこめかみへ */}
          {([[eL, -60], [eR, 60]] as const).map(([e, hx], i) => (
            <g key={i}>
              <path d={`M ${e[0]} ${e[1]} L ${hx} -238`} stroke={KRP.ink} strokeWidth={26} strokeLinecap="round" />
              <path d={`M ${e[0]} ${e[1]} L ${hx} -238`} stroke={C.toga} strokeWidth={17} strokeLinecap="round" />
              <circle cx={hx} cy={-240} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${hx - 6} -252 l 0 18 M ${hx + 2} -254 l 0 20`} stroke={KRP.ink} strokeWidth={2} opacity={0.5} />
            </g>
          ))}
          {/* 縦線 (がっくり) */}
          {[-24, -8, 8, 24].map((dx) => <line key={dx} x1={dx} y1={-286} x2={dx} y2={-262} stroke={KRP.ink} strokeWidth={3} opacity={0.45} />)}
        </L1cOver>
        {/* ため息の煙 */}
        {Array.from({ length: 6 }, (_, i) => {
          const t = clamp01(sigh * 1.6 - i * 0.12);
          if (t <= 0) return null;
          const x = PX + 40 + t * (120 + i * 70);
          const y = PY - 184 * PS + 10 - t * (20 + i * 18) + Math.sin(f / 5 + i) * 8;
          return (
            <g key={i} opacity={0.85 * (1 - t * 0.5)}>
              <path d={`M ${x - 30} ${y} q 15 -22 30 0 q 15 22 30 0 q 15 -22 30 0`} fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeLinecap="round" />
              <circle cx={x + 20} cy={y - 26} r={12 + t * 18} fill={KRP.white} stroke={KRP.gray} strokeWidth={4} opacity={0.8} />
            </g>
          );
        })}
        {/* 机 */}
        <path d="M 300 650 L 1640 650 L 1700 800 L 240 800 Z" fill={YP.wood} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={300 + i * 4} y1={680 + i * 24} x2={1640 + i * 12} y2={680 + i * 24} stroke={YP.woodDark} strokeWidth={3} opacity={0.5} />)}
        <rect x={240} y={800} width={1460} height={90} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 広げた巻物 (#59 のガチョウの絵) */}
        <path d="M 640 664 L 1280 664 L 1298 780 L 624 780 Z" fill={C.scroll} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <rect x={606} y={658} width={30} height={128} rx={14} fill={C.scrollEdge} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1282} y={658} width={30} height={128} rx={14} fill={C.scrollEdge} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M 1060 ${690 + i * 24} q 20 -6 40 0 q 20 6 40 0 q 20 -6 40 0 q 20 6 40 0`} fill="none" stroke={KRP.grayDark} strokeWidth={3} />
        ))}
        <g transform="translate(800 724) scale(1.1)">
          <path d={goose} fill={C.goose} stroke={C.featherBlack} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -40 0 Q -10 -8 20 -4" fill="none" stroke={C.featherBlack} strokeWidth={2.5} />
          <g stroke={C.featherBlack} strokeWidth={3.5} strokeLinecap="round">
            <line x1={-6} y1={16} x2={-8} y2={34} /><line x1={12} y1={16} x2={14} y2={34} />
          </g>
          <circle cx={52} cy={-54} r={2.5} fill={C.featherBlack} />
        </g>
        {/* 置いた葦のペンとインク壺 */}
        <line x1={980} y1={760} x2={1120} y2={700} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        <line x1={980} y1={760} x2={1120} y2={700} stroke={C.reedPen} strokeWidth={5} strokeLinecap="round" />
        <rect x={1340} y={604} width={46} height={50} rx={10} fill={C.pompBlack} stroke={KRP.ink} strokeWidth={4} />
        {/* 巻物の山 */}
        {Array.from({ length: 6 }, (_, i) => (
          <L1cScroll key={i} x={420 + (i % 3) * 46 - (i >= 3 ? -23 : 0)} y={i < 3 ? 640 : 610} len={170} r={15} />
        ))}
        {/* 油ランプ (ため息で炎がなびく) */}
        <L1cLamp x={1490} y={668} f={f} lean={lerp(0, 58, hit) - lerp(0, 30, seg(f, 34, 42))} glow={1 - hit * 0.4} />
        {/* 飛ばされる羽根 */}
        <L1cFeather x={lerp(1200, 1560, fly)} y={lerp(652, 380, fly) + Math.sin(f / 3) * 10 * fly} s={0.55} rot={lerp(-80, 40, fly) + Math.sin(f / 4) * 20 * fly} />
      </g>
    </Frame>
  );
};
// ---- 文#67 【山】 「今では男でさえ、これがないと、首を休められない」。
// 設計: ローマの屈強な兵士 (筋骨たくましく描く) が、寝床で羽毛の首枕を抱えて、うっとり眠る (face="joy")。兜と剣は床に転がる。対比の笑い。言葉そのものは字幕に出るので絵には書かない
// どこ: 夜のローマ兵の寝室を真上から見下ろす。白黒のモザイクの床、木の寝台 (lectus) に紫の掛け布
// 演出: 傷あと・無精ひげ・太い腕の大男が、ふかふかの羽毛の首枕 (房飾りつきの筒) を両腕でぎゅっと抱え込み、とろけた顔で眠る。床には脱ぎ捨てた兜 (まだ揺れている)・剣・盾・サンダル
// 動き: 寝息で掛け布がふくらむ / 枕から羽毛がふわふわ立つ / Z が昇る / 兜がころころ揺れる / カメラがゆっくり回りながら顔へ寄る
const Yw067: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.0, 1.08, easeInOut(seg(f, 0, 40)));
  const rot = lerp(-2, 1.5, easeInOut(seg(f, 0, 40)));
  const BX = 1400, BY = 540, S = 1.7; // 足元 (横たわる) / 体の向きは左が頭
  const breath = Math.sin(f / 7) * 0.5 + 0.5;
  const eL = L1cBanzaiElbow(-1, f, 0), eR = L1cBanzaiElbow(1, f, 0);
  const sh: [number, number][] = [[-67, -148], [67, -148]];
  const els = [eL, eR];
  const hands: [number, number][] = [[-150, -192], [150, -192]];
  const helmRock = Math.sin(f / 5) * 9 * (1 - seg(f, 20, 42) * 0.6);
  return (
    <Frame f={f} seed={3067} bg={C.mosaicW} dark>
      <g transform={`${cam(1060, 540, k)} rotate(${rot} 1060 540)`}>
        {/* モザイクの床 */}
        <rect x={-120} y={-120} width={W + 240} height={H + 240} fill={C.mosaicW} />
        {Array.from({ length: 30 }, (_, r) => Array.from({ length: 50 }, (_, c) => (
          (r + c) % 2 === 0 ? null : <rect key={`${r}-${c}`} x={-120 + c * 44} y={-120 + r * 44} width={40} height={40} fill={C.mosaicW} stroke={C.linenShade} strokeWidth={1.5} opacity={0.6} />
        )))}
        <rect x={80} y={60} width={1760} height={960} fill="none" stroke={C.mosaicB} strokeWidth={34} />
        <rect x={130} y={110} width={1660} height={860} fill="none" stroke={C.mosaicB} strokeWidth={8} />
        {Array.from({ length: 34 }, (_, i) => (
          <path key={`w${i}`} d={`M ${120 + i * 50} 150 q 25 -26 50 0`} fill="none" stroke={C.mosaicB} strokeWidth={8} />
        ))}
        {/* 夜の月明かり (窓の形の光が床に落ちる) */}
        <path d="M 160 160 L 520 160 L 640 520 L 280 520 Z" fill={C.moonLight} opacity={0.35} />
        {/* 床の兜 (転がって揺れている) */}
        <g transform={`translate(470 560) rotate(${-30 + helmRock})`}>
          <ellipse cx={8} cy={10} rx={112} ry={100} fill={KRP.ink} opacity={0.18} />
          <circle r={100} fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={7} />
          <circle r={70} fill="none" stroke={C.bronzeHelmDark} strokeWidth={5} />
          <path d="M -40 -60 Q 0 -84 40 -60" fill="none" stroke={KRP.white} strokeWidth={8} opacity={0.5} strokeLinecap="round" />
          <rect x={-14} y={-130} width={28} height={260} rx={12} fill={C.tunicRed} stroke={KRP.ink} strokeWidth={5} />
          {[-100, -60, -20, 20, 60, 100].map((y) => <line key={y} x1={-10} y1={y} x2={10} y2={y + 10} stroke={C.tunicRedDark} strokeWidth={3} />)}
          <path d="M 96 -40 L 150 -46 L 150 40 L 96 34 Z" fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -96 -40 L -136 -60 L -140 50 L -96 40 Z" fill={C.bronzeHelm} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 剣 (鞘ごと) */}
        <g transform="translate(560 830) rotate(-18)">
          <rect x={-170} y={-18} width={260} height={36} rx={10} fill={C.pompBlack} stroke={KRP.ink} strokeWidth={5} />
          {[-120, -40, 40].map((x) => <rect key={x} x={x} y={-20} width={16} height={40} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />)}
          <rect x={90} y={-34} width={22} height={68} rx={6} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={112} y={-12} width={70} height={24} rx={8} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={194} cy={0} r={18} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* サンダル */}
        {[[250, 330, -20], [330, 300, 10]].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <ellipse rx={30} ry={70} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            {[-30, 0, 30].map((dy) => <line key={dy} x1={-30} y1={dy} x2={30} y2={dy + 10} stroke={YP.wood} strokeWidth={6} />)}
          </g>
        ))}
        {/* 盾 (床に寝かせてある) */}
        <g transform="translate(1720 600) rotate(8)">
          <rect x={-110} y={-190} width={220} height={380} rx={26} fill={C.tunicRed} stroke={KRP.ink} strokeWidth={7} />
          <rect x={-90} y={-170} width={40} height={340} rx={12} fill={C.tunicRedDark} opacity={0.5} />
          <circle r={36} fill={C.shieldGold} stroke={KRP.ink} strokeWidth={6} />
          {[-1, 1].map((d) => <path key={d} d={`M ${d * 20} ${d * -60} L ${d * 60} ${d * -160} M ${d * -20} ${d * 60} L ${d * -60} ${d * 160}`} stroke={C.shieldGold} strokeWidth={10} />)}
        </g>
        {/* 寝台 (木の枠) */}
        <rect x={830} y={238} width={730} height={612} rx={20} fill={KRP.ink} opacity={0.2} transform="translate(16 18)" />
        <rect x={830} y={238} width={730} height={612} rx={20} fill={YP.wood} stroke={KRP.ink} strokeWidth={8} />
        {([[850, 258], [1540, 258], [850, 830], [1540, 830]] as const).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={20} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={5} />)}
        <rect x={860} y={268} width={670} height={552} rx={30} fill={C.mattress} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${900 + i * 110} 290 q 20 250 0 500`} fill="none" stroke={C.linenShade} strokeWidth={4} />)}
        {/* 羽毛の首枕 (筒形・房飾り) — 体より先に描く */}
        <g>
          <rect x={1000} y={BY - 262} width={150} height={524} rx={70} fill={KRP.ink} opacity={0.18} transform="translate(10 12)" />
          <rect x={1000} y={BY - 262 - breath * 4} width={150} height={524 + breath * 8} rx={70} fill={C.linen} stroke={KRP.ink} strokeWidth={6} />
          {[-200, -120, -40, 40, 120, 200].map((d) => <path key={d} d={`M 1006 ${BY + d} q 69 ${12 + breath * 4} 138 0`} fill="none" stroke={C.linenShade} strokeWidth={4} />)}
          <rect x={1040} y={BY - 262} width={18} height={524} fill={C.goldTrim} opacity={0.6} />
          {[-1, 1].map((d) => (
            <g key={d}>
              <rect x={1060} y={BY + d * 268 - 10} width={30} height={20} rx={6} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={3.5} />
              {[-8, 0, 8].map((dx) => <line key={dx} x1={1075 + dx} y1={BY + d * 278} x2={1075 + dx * 1.6 + Math.sin(f / 5 + dx) * 3} y2={BY + d * 318} stroke={C.goldTrim} strokeWidth={5} strokeLinecap="round" />)}
            </g>
          ))}
          <ellipse cx={1075} cy={BY} rx={110} ry={300} fill={YP.glow} opacity={0.12 + breath * 0.06} />
        </g>
        {/* 眠る大男 (仰向け・頭が左) */}
        <g transform={`translate(${BX} ${BY}) rotate(-90)`}>
          <Person x={0} y={0} s={S} f={f} face="joy" pose="banzai" cloth={C.tunicRed} clothDark={C.tunicRedDark} hair="none" />
          <L1cOver x={0} y={0} s={S} f={f}>
            {/* 太い首と、肩幅の広い胴 */}
            <rect x={-34} y={-180} width={68} height={30} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -88 -162 Q 0 -176 88 -162 L 66 -60 L -66 -60 Z" fill={C.tunicRed} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -46 -144 q 23 18 46 0 q 23 18 46 0" fill="none" stroke={C.tunicRedDark} strokeWidth={4} />
            <path d="M 0 -132 L 0 -84 M -26 -104 q 26 8 52 0" fill="none" stroke={C.tunicRedDark} strokeWidth={3.5} />
            <rect x={-70} y={-76} width={140} height={18} rx={4} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            {[-48, -24, 0, 24, 48].map((x) => <circle key={x} cx={x} cy={-67} r={5} fill={YP.brass} stroke={KRP.ink} strokeWidth={2} />)}
            {/* 太い腕 (力こぶ) */}
            {[0, 1].map((i) => {
              const [sx, sy] = sh[i], [ex, ey] = els[i], [hx, hy] = hands[i];
              const ang = (Math.atan2(ey - sy, ex - sx) * 180) / Math.PI;
              const mx = (sx + ex) / 2, my = (sy + ey) / 2;
              return (
                <g key={i}>
                  <ellipse cx={mx} cy={my} rx={58} ry={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${ang} ${mx} ${my})`} />
                  <path d={`M ${mx - 20} ${my} q 20 ${i ? 12 : -12} 40 0`} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} transform={`rotate(${ang} ${mx} ${my})`} />
                  <ellipse cx={sx} cy={sy} rx={28} ry={24} fill={C.tunicRed} stroke={KRP.ink} strokeWidth={4.5} />
                  <path d={`M ${ex} ${ey} L ${hx} ${hy}`} stroke={KRP.ink} strokeWidth={40} strokeLinecap="round" />
                  <path d={`M ${ex} ${ey} L ${hx} ${hy}`} stroke={KRP.white} strokeWidth={30} strokeLinecap="round" />
                  <circle cx={hx} cy={hy} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
                  <path d={`M ${hx - 10} ${hy - 10} l 0 20 M ${hx} ${hy - 12} l 0 24 M ${hx + 10} ${hy - 10} l 0 20`} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
                </g>
              );
            })}
            {/* いかつい顔の印: 太い眉・ほおの傷・無精ひげ・ほっぺの赤み・よだれ */}
            <path d="M 34 -214 L 52 -196 M 40 -212 l -6 6 M 46 -206 l -6 6" stroke={C.tunicRedDark} strokeWidth={3.5} strokeLinecap="round" />
            {Array.from({ length: 14 }, (_, i) => (
              <circle key={i} cx={-30 + (i % 7) * 10} cy={-180 + Math.floor(i / 7) * 9 - Math.abs((i % 7) - 3) * 2} r={2} fill={KRP.ink} opacity={0.45} />
            ))}
            <ellipse cx={-42} cy={-202} rx={13} ry={8} fill={KRP.red} opacity={0.35} />
            <ellipse cx={42} cy={-202} rx={13} ry={8} fill={KRP.red} opacity={0.35} />
            <path d="M -12 -194 Q 0 -184 12 -194" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
            <path d={`M 10 -190 q 4 ${10 + breath * 6} 0 ${16 + breath * 8}`} fill="none" stroke={KRP.blueSoft} strokeWidth={4} strokeLinecap="round" />
          </L1cOver>
        </g>
        {/* 掛け布 (寝息でふくらむ) */}
        <g transform={`translate(1540 ${BY}) scale(0.77 ${1 + breath * 0.025}) translate(-1540 ${-BY})`}>
          <path d={`M 1200 ${BY - 190} Q 1260 ${BY - 210} 1540 ${BY - 200} L 1540 ${BY + 200} Q 1260 ${BY + 214} 1200 ${BY + 190} Q 1176 ${BY} 1200 ${BY - 190} Z`}
            fill={C.cushion} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {[-120, -40, 40, 120].map((d) => <path key={d} d={`M 1220 ${BY + d} q 140 ${d * 0.1 + 14} 300 ${d * 0.05}`} fill="none" stroke={C.cushionDark} strokeWidth={4} />)}
          <path d={`M 1200 ${BY - 190} Q 1176 ${BY} 1200 ${BY + 190}`} fill="none" stroke={C.goldTrim} strokeWidth={8} />
        </g>
        {/* 枕から立つ羽毛 */}
        {Array.from({ length: 8 }, (_, i) => {
          const life = ((f * 0.9 + i * 11) % 44) / 44;
          return <L1cFeather key={i} x={1000 + rnd(6701, i) * 160 - life * 60} y={BY - 220 + rnd(6702, i) * 440 - life * 60} s={0.22 + rnd(6703, i) * 0.12} rot={f * 3 + i * 45} op={(1 - life) * 0.95} />;
        })}
        {/* Z (寝息) */}
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 14) % 42) / 42;
          return (
            <text key={i} x={880 - t * 160 - i * 10} y={420 - t * 220} fontFamily={FONT} fontWeight={900} fontSize={44 + i * 14}
              fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} paintOrder="stroke" opacity={1 - t} transform={`rotate(-12 ${880 - t * 160} ${420 - t * 220})`}>Z</text>
          );
        })}
        {/* 寝台の脇の油ランプの灯り */}
        <circle cx={1640} cy={210} r={140 + Math.sin(f / 3) * 8} fill={C.flame} opacity={0.14} />
        <circle cx={1640} cy={210} r={34} fill={C.lampBronze} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1640} cy={210} r={14} fill={C.flameCore} stroke={C.flame} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// ---- 文#68 【図】 ここでいう「これ」は、羽毛を詰めて首を支える寝具のことだと、読まれています。
// 設計: 首を支える寝具の図解 (世界=石の壁に描かれたフレスコ画風)。横向きに寝た人の首の下に、羽毛を詰めた筒形の寝具。断面に羽毛。札「羽毛」「首を支える」
// どこ: 石積みの壁に描かれたフレスコ画 (ポンペイ赤の太い縁・黄土の地・角のしっくいが欠けて石がのぞく)。下の棚に油ランプ
// 演出: 画の中で、人が寝椅子に横たわり、首の下に筒形の寝具。手前に出た筒の切り口が断面図になっていて、中に羽毛がぎっしり。札で「羽毛」「首を支える」
// 動き: 頭が f8〜30 で枕に沈み、筒がふわっとつぶれる / 断面の羽毛がそよぐ / 羽毛が1〜2枚ふわりと出る / 札 f14〜24・f22〜32 / カメラがゆっくり断面へ寄る
const Yw068: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.0, 1.06, easeInOut(seg(f, 0, 40)));
  const settle = easeInOut(seg(f, 8, 30));
  const BX = 1320, BY = 470 + settle * 10, S = 1.5;
  const PCX = 1078, PCY = 556, PR = 90;
  const squash = 1 - settle * 0.1;
  return (
    <Frame f={f} seed={3068} bg={C.stuccoShade}>
      <g transform={cam(1040, 520, k)}>
        {/* 石の壁 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.stuccoShade} />
        {Array.from({ length: 10 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-80 + c * 280 + (r % 2) * 140} y={-40 + r * 118} width={272} height={110} rx={10}
            fill={(r * 3 + c) % 4 ? C.travertineShade : C.paveDark} stroke={KRP.ink} strokeWidth={3} opacity={0.75} />
        )))}
        {/* フレスコ画の縁 (ポンペイ赤) */}
        <rect x={180} y={90} width={1560} height={710} rx={8} fill={C.pompRed} stroke={KRP.ink} strokeWidth={7} />
        <rect x={220} y={130} width={1480} height={630} fill={C.frescoGround} stroke={C.pompBlack} strokeWidth={8} />
        <rect x={244} y={154} width={1432} height={582} fill="none" stroke={C.pompOchre} strokeWidth={4} />
        {/* しっくいの欠け (左下) とひび */}
        <path d="M 180 800 L 180 640 Q 230 650 250 700 Q 300 720 320 800 Z" fill={C.travertineShade} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1500 130 L 1530 210 L 1500 260 L 1540 330" fill="none" stroke={C.frescoEdge} strokeWidth={4} />
        <path d="M 400 760 L 440 700 L 420 650" fill="none" stroke={C.frescoEdge} strokeWidth={4} />
        {/* 画の背景: 壁の帯と植木鉢 (ポンペイ風) */}
        <rect x={244} y={600} width={1432} height={136} fill={C.pompOchre} opacity={0.5} />
        {[340, 1580].map((x) => (
          <g key={x}>
            <path d={`M ${x - 40} 600 L ${x + 40} 600 L ${x + 28} 660 L ${x - 28} 660 Z`} fill={C.amphora} stroke={KRP.ink} strokeWidth={4} />
            {[-1, 0, 1].map((d) => <path key={d} d={`M ${x} 600 q ${d * 40} -80 ${d * 60 + Math.sin(f / 9 + d) * 4} -200`} fill="none" stroke={C.gardenDark} strokeWidth={6} />)}
            {[-1, 0, 1].map((d) => <ellipse key={`l${d}`} cx={x + d * 56} cy={410} rx={22} ry={12} fill={C.garden} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
        ))}
        {/* 寝椅子 */}
        <rect x={820} y={BY + 84 - settle * 10} width={640} height={50} rx={18} fill={C.mattress} stroke={KRP.ink} strokeWidth={5} />
        <rect x={810} y={BY + 130 - settle * 10} width={660} height={34} rx={6} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
        {[840, 1440].map((x) => <path key={x} d={`M ${x - 14} ${BY + 160} L ${x + 14} ${BY + 160} L ${x + 8} ${BY + 260} L ${x - 8} ${BY + 260} Z`} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 筒の奥側 (体の向こうへ伸びる) */}
        <path d={`M ${PCX - PR} ${PCY} L ${PCX - PR + 60} ${PCY - 70} L ${PCX + PR + 60} ${PCY - 70} L ${PCX + PR} ${PCY} Z`} fill={C.linenShade} stroke={KRP.ink} strokeWidth={4} />
        {/* 横になった人 (フレスコの色) */}
        <g transform={`translate(${BX} ${BY}) rotate(-90)`}>
          <Person x={0} y={0} s={S} f={f} face="joy" pose="hold" cloth={C.pompOchre} clothDark={C.frescoEdge} hair="cap" />
        </g>
        {/* 筒の手前の切り口 (断面図) */}
        <g transform={`translate(${PCX} ${PCY}) scale(1 ${squash})`}>
          <path d={`M ${-PR} 0 L ${-PR} 0 A ${PR} ${PR} 0 0 0 ${PR} 0`} fill="none" />
          <circle r={PR + 10} fill={C.linen} stroke={KRP.ink} strokeWidth={7} />
          <circle r={PR - 6} fill={C.linenShade} stroke={KRP.ink} strokeWidth={3} />
          {Array.from({ length: 26 }, (_, i) => {
            const a = rnd(6801, i) * Math.PI * 2;
            const rr = Math.sqrt(rnd(6802, i)) * (PR - 26);
            const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rnd(6803, i) * 360 + Math.sin(f / 6 + i) * 10}) scale(0.24)`}>
                <path d="M 0 8 Q -30 -40 -22 -110 Q -14 -150 2 -162 Q 22 -132 24 -80 Q 26 -22 0 8 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
                <path d="M 0 20 Q 2 -60 2 -150" fill="none" stroke={KRP.grayDark} strokeWidth={7} />
              </g>
            );
          })}
          <circle r={PR + 10} fill="none" stroke={C.goldTrim} strokeWidth={5} strokeDasharray="10 8" opacity={0.8} />
        </g>
        {/* 出てくる羽毛 */}
        {[0, 1].map((i) => {
          const t = seg(f, 16 + i * 8, 42);
          return t > 0 ? <L1cFeather key={i} x={PCX - 40 + i * 70 - t * 90} y={PCY - 40 - t * 200} s={0.38} rot={-30 + i * 50 + Math.sin(f / 4 + i) * 20} op={1 - t * 0.3} /> : null;
        })}
        {/* 札と矢印 */}
        <TagPlate x={700} y={690} text="羽毛" size={54} t={seg(f, 14, 24)} />
        <Arrow x={1000} y={600} s={0.9} rot={-18} t={seg(f, 16, 26)} />
        <TagPlate x={1076} y={236} text="首を支える" size={50} t={seg(f, 22, 32)} />
        <Arrow x={1076} y={384} s={0.8} rot={90} t={seg(f, 24, 34)} />
        {/* 下の石の棚と油ランプ */}
        <rect x={160} y={820} width={1600} height={36} rx={6} fill={C.travertine} stroke={KRP.ink} strokeWidth={5} />
        <L1cLamp x={1600} y={822} s={0.9} f={f} />
      </g>
    </Frame>
  );
};
// 羽毛の袋 (金貨の印つき)。x,y: 底の中心 / s=1 で幅約124px・高さ約140px
const L1cSack: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={64} ry={10} fill={KRP.ink} opacity={0.16} />
    <path d="M -60 -6 Q -74 -70 -40 -96 L -22 -104 Q 0 -96 22 -104 L 40 -96 Q 74 -70 60 -6 Q 0 8 -60 -6 Z" fill={C.sack} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -44 -20 Q -54 -60 -30 -84" fill="none" stroke={C.sackDark} strokeWidth={4} />
    <path d="M 40 -16 Q 50 -50 34 -80" fill="none" stroke={C.sackDark} strokeWidth={4} />
    <path d="M -22 -104 Q 0 -112 22 -104 L 14 -126 Q 0 -120 -14 -126 Z" fill={C.sackDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-26} y={-112} width={52} height={10} rx={5} fill={C.rope} stroke={KRP.ink} strokeWidth={3} />
    {[[-8, -134, 9], [8, -138, 8], [0, -146, 7]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />)}
    <circle cx={0} cy={-50} r={24} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={0} cy={-50} r={15} fill="none" stroke={C.goldDark} strokeWidth={3} />
    <path d="M -6 -58 q 10 -4 12 6 q -2 8 -10 8" fill="none" stroke={C.goldDark} strokeWidth={3} />
  </g>
);

// ---- 文#69 【山】 柔らかさは、取り寄せるほどの、ぜいたく品になっていました。
// 設計: ローマの港。北から来た船から、羽毛の袋が次々と荷揚げされる。袋に金貨のマーク。裕福な客が待ちかまえる。f で袋が積み上がる
// どこ: ローマの港 (オスティア)。夕方の空、遠くに灯台と倉庫の列。左に北から着いた商船 (船尾がガチョウの首の形)、真ん中に踏み車のクレーン、右の石の岸壁に袋の山
// 演出: 商船から羽毛の袋がクレーンで吊り上げられ、山のてっぺんに降りる。袋には金貨の印、口から羽毛がのぞく。右で紫の縁のトーガの金持ちが財布を高く掲げ、もう一人は金貨の箱を抱えて待ちかまえる
// 動き: 袋が f4〜28 で次々ぽんと積み上がる (羽毛が舞う) / クレーンの袋が f14〜32 で降りる / 踏み車が回る / 船がゆれる / カメラが右へ少しパン
const Yw069: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.0, 1.04, easeInOut(seg(f, 0, 40)));
  const pan = lerp(30, -20, easeInOut(seg(f, 0, 40)));
  const bob = Math.sin(f / 8) * 5;
  const PILE: [number, number][] = [
    [1040, 812], [1164, 812], [1288, 812], [1412, 812],
    [1102, 716], [1226, 716], [1350, 716],
    [1164, 620], [1288, 620],
    [1226, 524],
  ];
  const grow = seg(f, 4, 28) * 3;
  const drop = easeInOut(seg(f, 14, 32));
  const craneY = lerp(250, 524, drop);
  const landed = f >= 32;
  return (
    <Frame f={f} seed={3069} bg={C.romeSky}>
      <g transform={cam(960, 540, k, pan, 0)}>
        {/* 空と遠景 */}
        <rect x={-80} y={-60} width={W + 160} height={700} fill={C.romeSky} />
        <rect x={-80} y={300} width={W + 160} height={300} fill={C.romeSky2} opacity={0.5} />
        <circle cx={1500} cy={150} r={60} fill={C.flameCore} opacity={0.85} />
        <path d="M -80 520 Q 300 470 700 500 Q 1100 460 1500 490 Q 1800 470 2000 500 L 2000 600 L -80 600 Z" fill={C.hillFar} opacity={0.7} />
        {/* 遠くの灯台 */}
        <g transform="translate(980 520)">
          {[0, 1, 2].map((i) => <rect key={i} x={-46 + i * 10} y={-80 - i * 70} width={92 - i * 20} height={72} fill={C.travertine} stroke={KRP.ink} strokeWidth={3.5} />)}
          <circle cx={0} cy={-246} r={20 + Math.sin(f / 3) * 3} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-246} r={50} fill={C.flame} opacity={0.2} />
        </g>
        {/* 倉庫 (赤い瓦の列) */}
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={1100 + i * 150} y={420} width={146} height={220} fill={i % 2 ? C.stucco : C.stuccoShade} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${1092 + i * 150} 420 L ${1173 + i * 150} 382 L ${1254 + i * 150} 420 Z`} fill={C.roofTile} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M ${1140 + i * 150} 640 L ${1140 + i * 150} 520 Q ${1173 + i * 150} 486 ${1206 + i * 150} 520 L ${1206 + i * 150} 640 Z`} fill={C.museumWall} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 海 */}
        <rect x={-80} y={590} width={940} height={560} fill={C.sea} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${-60 + (i % 4) * 230 + Math.sin(f / 6 + i) * 14} ${640 + Math.floor(i / 4) * 80} q 25 -12 50 0 q 25 12 50 0`} fill="none" stroke={C.seaFoam} strokeWidth={4} />
        ))}
        {/* 商船 (北から着いた) */}
        <g transform={`translate(70 ${bob}) rotate(${Math.sin(f / 9) * 1.2} 400 600)`}>
          <path d="M 40 560 Q 60 676 200 690 L 640 690 Q 740 676 770 560 Z" fill={C.hull} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          {[590, 620, 650].map((y) => <path key={y} d={`M ${60 + (y - 560) * 0.4} ${y} L ${750 - (y - 560) * 0.3} ${y}`} stroke={C.hullDark} strokeWidth={4} />)}
          <rect x={30} y={548} width={750} height={18} rx={6} fill={C.hullDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 船尾のガチョウの首 */}
          <path d="M 70 556 Q 20 500 40 440 Q 60 380 30 340" fill="none" stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
          <path d="M 70 556 Q 20 500 40 440 Q 60 380 30 340" fill="none" stroke={C.hull} strokeWidth={20} strokeLinecap="round" />
          <circle cx={36} cy={330} r={22} fill={C.hull} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 54 324 L 88 334 L 54 342 Z" fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={40} cy={324} r={4} fill={KRP.ink} />
          {/* 帆柱・帆桁・たたんだ帆・索 */}
          <rect x={392} y={150} width={16} height={410} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={200} y={180} width={400} height={14} rx={6} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M 210 194 Q 300 ${232 + Math.sin(f / 5) * 4} 400 206 Q 500 ${232 + Math.sin(f / 5 + 1) * 4} 590 194 Z`} fill={C.sail} stroke={KRP.ink} strokeWidth={4} />
          <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.7}>
            <line x1={400} y1={160} x2={70} y2={548} /><line x1={400} y1={160} x2={760} y2={548} />
            <line x1={210} y1={190} x2={160} y2={548} /><line x1={590} y1={190} x2={660} y2={548} />
          </g>
          <path d={`M 408 150 L ${470 + Math.sin(f / 3) * 6} ${160 + Math.sin(f / 4) * 4} L 408 176 Z`} fill={C.tunicRed} stroke={KRP.ink} strokeWidth={3} />
          <line x1={740} y1={548} x2={840} y2={430} stroke={YP.woodDark} strokeWidth={10} />
          {/* 甲板の荷 */}
          {[250, 340, 520, 610].map((x, i) => <L1cSack key={x} x={x} y={552} s={0.8} rot={(i % 2 ? 4 : -5)} />)}
          <g transform="translate(150 548)">
            <path d="M -24 0 Q -34 -50 -16 -80 L 16 -80 Q 34 -50 24 0 Z" fill={C.amphora} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-12} y={-98} width={24} height={20} fill={C.amphoraDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        <TagPlate x={640} y={96} text="北から" size={46} t={seg(f, 6, 16)} />
        <Arrow x={850} y={96} s={0.7} t={seg(f, 10, 20)} />
        {/* 石の岸壁 */}
        <rect x={800} y={640} width={1240} height={480} fill={C.quay} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
          <rect key={`${r}-${c}`} x={800 + c * 160 + (r % 2) * 80} y={660 + r * 70} width={156} height={66} fill="none" stroke={C.quayDark} strokeWidth={3} />
        )))}
        <rect x={790} y={630} width={1260} height={22} fill={C.quayDark} stroke={KRP.ink} strokeWidth={4} />
        {[860, 1500].map((x) => <rect key={x} x={x - 18} y={600} width={36} height={40} rx={8} fill={C.stoneMid} stroke={KRP.ink} strokeWidth={4} />)}
        <path d="M 760 560 Q 800 600 842 606" fill="none" stroke={C.rope} strokeWidth={6} />
        {/* 踏み車のクレーン */}
        <g>
          <line x1={900} y1={640} x2={940} y2={110} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
          <line x1={900} y1={640} x2={940} y2={110} stroke={YP.wood} strokeWidth={14} strokeLinecap="round" />
          <line x1={940} y1={120} x2={1240} y2={100} stroke={KRP.ink} strokeWidth={18} strokeLinecap="round" />
          <line x1={940} y1={120} x2={1240} y2={100} stroke={YP.wood} strokeWidth={11} strokeLinecap="round" />
          <line x1={940} y1={130} x2={880} y2={560} stroke={C.rope} strokeWidth={4} />
          <circle cx={1232} cy={104} r={12} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(880 560) rotate(${f * 4})`}>
            <circle r={88} fill="none" stroke={KRP.ink} strokeWidth={16} />
            <circle r={88} fill="none" stroke={YP.wood} strokeWidth={9} />
            {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 4) * 84} y2={Math.sin((i * Math.PI) / 4) * 84} stroke={YP.woodDark} strokeWidth={6} />)}
            <circle r={14} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 吊り綱と、吊られた袋 */}
          <line x1={1230} y1={112} x2={1226 + Math.sin(f / 5) * 6 * (1 - drop)} y2={craneY - 150} stroke={C.rope} strokeWidth={5} />
          {!landed && <path d={`M ${1226 + Math.sin(f / 5) * 6 * (1 - drop)} ${craneY - 150} l -20 26 m 20 -26 l 20 26`} stroke={KRP.ink} strokeWidth={4} fill="none" />}
        </g>
        {/* 袋の山 (次々と積み上がる) */}
        {PILE.map(([x, y], i) => {
          if (i === 9) return null;
          const t = i < 6 ? 1 : clamp01(grow - (i - 6));
          if (t <= 0) return null;
          const dropY = (1 - easeOut(t)) * -120;
          return <L1cSack key={i} x={x} y={y + dropY} s={1} rot={((i * 37) % 9) - 4} />;
        })}
        <L1cSack x={1226 + Math.sin(f / 5) * 6 * (1 - drop)} y={craneY} s={1} rot={Math.sin(f / 5) * 6 * (1 - drop)} />
        {/* 着地で舞う羽毛 */}
        {Array.from({ length: 12 }, (_, i) => {
          const src = i % 4;
          const t0 = src === 3 ? 32 : 4 + src * 8 + 6;
          const t = seg(f, t0, t0 + 14);
          if (t <= 0 || t >= 1) return null;
          const [px, py] = src === 3 ? PILE[9] : PILE[6 + src];
          return <L1cFeather key={i} x={px + (rnd(6901, i) - 0.5) * 160 * t} y={py - 60 - t * (80 + rnd(6902, i) * 80)} s={0.26} rot={rnd(6903, i) * 360 + f * 6} op={1 - t} />;
        })}
        {/* 金貨の台 */}
        <g transform="translate(1530 740)">
          <rect x={-70} y={0} width={140} height={16} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {[-50, 50].map((x) => <rect key={x} x={x - 6} y={16} width={12} height={70} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={3} />)}
          {[-36, 0, 36].map((x, j) => Array.from({ length: 3 + j }, (_, n) => (
            <g key={`${x}-${n}`}>
              <rect x={x - 16} y={-12 - n * 10} width={32} height={10} fill={C.goldDark} stroke={KRP.ink} strokeWidth={2.5} />
              <ellipse cx={x} cy={-12 - n * 10} rx={16} ry={4} fill={C.gold} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          )))}
        </g>
        {/* 金持ちの客1 (財布を掲げる) */}
        <g transform="translate(3280 0) scale(-1 1)">
        <Person x={1640} y={820} s={1.3} f={f} face="joy" pose="raise" cloth={C.toga} clothDark={C.togaDark} hair="cap" gaze={[5, -2]} phase={2} />
        <L1cOver x={1640} y={820} s={1.3} f={f} phase={2}>
          <path d="M -58 -162 Q -30 -168 -14 -160 L 60 -82 L 60 -56 L 34 -56 L -58 -144 Z" fill={C.togaDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -50 -152 L 52 -66" stroke={C.togaStripe} strokeWidth={7} />
          <g transform={`translate(67 -246) rotate(${Math.sin(f / 4) * 10})`}>
            <path d="M -26 0 Q -36 -40 -12 -50 L 12 -50 Q 36 -40 26 0 Q 0 10 -26 0 Z" fill={C.purse} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -14 -50 Q 0 -60 14 -50" fill="none" stroke={C.gold} strokeWidth={5} />
            <circle cx={0} cy={-22} r={8} fill={C.gold} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
          <circle cx={67} cy={-232} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </L1cOver>
        </g>
        {/* 金持ちの客2 (金貨の箱を抱えて待つ) */}
        <Person x={1815} y={800} s={1.15} f={f} face="smile" pose="hold" cloth={C.cushion} clothDark={C.cushionDark} hair="cap" gaze={[-5, 0]} phase={3} lean={-4} />
        <L1cOver x={1815} y={800} s={1.15} f={f} phase={3} lean={-4}>
          <path d="M -40 -164 Q 0 -140 40 -164" fill="none" stroke={C.gold} strokeWidth={5} />
          <circle cx={0} cy={-148} r={6} fill={C.gold} stroke={KRP.ink} strokeWidth={2} />
          <rect x={-46} y={-132} width={92} height={56} rx={6} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-46} y={-132} width={92} height={14} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
          {[-24, 0, 24].map((x) => <ellipse key={x} cx={x} cy={-136} rx={12} ry={5} fill={C.gold} stroke={KRP.ink} strokeWidth={2} />)}
          <circle cx={-14} cy={-118} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={14} cy={-118} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </L1cOver>
        {/* きらり (金貨) */}
        {[[1530, 690], [1556, 520]].map(([x, y], i) => {
          const tw = (Math.sin(f / 3 + i * 2) * 0.5 + 0.5);
          return <path key={i} d={`M ${x} ${y - 18 * tw} L ${x + 5} ${y - 5} L ${x + 18 * tw} ${y} L ${x + 5} ${y + 5} L ${x} ${y + 18 * tw} L ${x - 5} ${y + 5} L ${x - 18 * tw} ${y} L ${x - 5} ${y - 5} Z`} fill={KRP.white} stroke={C.goldDark} strokeWidth={2} />;
        })}
      </g>
    </Frame>
  );
};

// ---- 文#70 【山】 柔らかさは、こんどは、首の下にやってきました。
// 設計: ★リキャップ②。`KaradaChizu` (lit={{ back: 1, neck: L }}、L は f6〜26 で 0→1、slots)。首の座が灯り、凡例の「首」が点灯。背景はローマの寝室の壁 (フレスコ画・寝椅子)。首の後ろに羽毛の枕の柔らかい曲線を光と重ねる
// どこ: ローマの寝室。ポンペイ赤の壁に庭のフレスコ画、黒い腰壁、モザイクの床、背後に寝椅子 (頭のせの曲がった肘掛けつき)。右に青銅の燭台
// 演出: からだの地図の人の首の後ろに、房飾りつきの羽毛の首枕の曲線。首の光が灯ると枕も光り、羽毛がふわりと立つ。凡例の下には大理石の板 (ローマの時代の素材)
// 動き: neck が f6〜26 で 0→1 / 枕の光が首と一緒に強まる / 羽毛が立ちのぼる / 燭台の炎 / カメラがわずかに寄る
const Yw070: React.FC<{ f: number }> = ({ f }) => {
  const L = seg(f, 6, 26);
  const k = lerp(1.0, 1.03, easeInOut(seg(f, 0, 40)));
  const NY = 920 - 162 * 2.3; // 首の高さ
  return (
    <Frame f={f} seed={3070} bg={C.pompRed}>
      <g transform={cam(900, 480, k)}>
        {/* 壁 */}
        <rect x={-40} y={-40} width={W + 80} height={760} fill={C.pompRed} />
        <rect x={-40} y={-40} width={W + 80} height={110} fill={C.pompBlack} />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M ${-40 + i * 210} 70 Q ${65 + i * 210} 130 ${170 + i * 210} 70`} fill="none" stroke={C.garden} strokeWidth={8} />
        ))}
        {Array.from({ length: 10 }, (_, i) => <circle key={`b${i}`} cx={65 + i * 210} cy={112} r={9} fill={C.pompOchre} stroke={KRP.ink} strokeWidth={2.5} />)}
        <rect x={40} y={150} width={330} height={520} fill="none" stroke={C.pompOchre} strokeWidth={6} />
        <rect x={60} y={170} width={290} height={480} fill="none" stroke={C.pompRedDark} strokeWidth={4} />
        {/* 真ん中の庭のフレスコ画 */}
        <rect x={420} y={150} width={700} height={520} fill={C.garden} stroke={C.pompOchre} strokeWidth={10} />
        <rect x={430} y={160} width={680} height={240} fill={KRP.blueSoft} opacity={0.55} />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <path d={`M ${470 + i * 100} 670 q ${Math.sin(f / 10 + i) * 6} -160 ${(i % 2 ? 20 : -20)} -260`} fill="none" stroke={C.gardenDark} strokeWidth={7} />
            {[0, 1, 2].map((j) => <ellipse key={j} cx={470 + i * 100 + (j - 1) * 30} cy={430 - j * 40 + (i % 2) * 20} rx={30} ry={16} fill={j % 2 ? C.gardenDark : C.garden} stroke={KRP.ink} strokeWidth={2.5} />)}
          </g>
        ))}
        <g transform={`translate(${560 + Math.sin(f / 7) * 10} 230)`}>
          <path d="M -20 0 Q 0 -14 20 0 Q 0 6 -20 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -4 -4 L -18 -18 M 4 -4 L 18 -18" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 腰壁と床 */}
        <rect x={-40} y={700} width={W + 80} height={170} fill={C.pompBlack} />
        <line x1={-40} y1={720} x2={W + 40} y2={720} stroke={C.pompOchre} strokeWidth={5} />
        <rect x={-40} y={860} width={W + 80} height={260} fill={C.mosaicW} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-40 + i * 84} y={880} width={42} height={42} fill={C.mosaicB} opacity={0.8} />)}
        {/* 寝椅子 (頭のせの肘掛けつき) */}
        <g>
          <rect x={280} y={640} width={940} height={70} rx={24} fill={C.mattress} stroke={KRP.ink} strokeWidth={6} />
          <rect x={270} y={704} width={960} height={36} rx={8} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 300 650 Q 230 600 250 520 Q 270 480 320 500 Q 290 540 320 600 Z" fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={278} cy={508} r={18} fill={C.goldTrim} stroke={KRP.ink} strokeWidth={4} />
          {[320, 1180].map((x) => <path key={x} d={`M ${x - 18} 740 L ${x + 18} 740 L ${x + 10} 860 L ${x - 10} 860 Z`} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />)}
          <rect x={1000} y={600} width={180} height={60} rx={26} fill={C.cushion} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 凡例の下に敷く大理石の板 */}
        <rect x={1188} y={14} width={414} height={724} rx={12} fill={KRP.ink} opacity={0.2} transform="translate(10 12)" />
        <rect x={1188} y={14} width={414} height={724} rx={12} fill={C.marble} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1206} y={32} width={378} height={688} rx={6} fill="none" stroke={C.marbleShade} strokeWidth={5} />
        <g fill="none" stroke={C.marbleVein} strokeWidth={3} opacity={0.6}>
          <path d="M 1210 120 Q 1300 160 1360 140 Q 1440 120 1500 200" />
          <path d="M 1580 400 Q 1500 460 1520 560 Q 1540 640 1460 700" />
        </g>
        {([[1214, 40], [1576, 40], [1214, 712], [1576, 712]] as const).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 右の青銅の燭台 */}
        <g transform="translate(1760 860)">
          <rect x={-60} y={-16} width={120} height={16} rx={6} fill={C.lampBronze} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-8} y={-520} width={16} height={506} fill={C.lampBronze} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-50} y={-534} width={100} height={18} rx={8} fill={C.lampBronze} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-590} r={80 + Math.sin(f / 3) * 6} fill={C.flame} opacity={0.18} />
          <path d={`M -8 -534 Q ${-12 + Math.sin(f / 2.3) * 4} -580 ${Math.sin(f / 2.3) * 3} -606 Q 14 -574 8 -534 Z`} fill={C.flame} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 首の後ろの羽毛の首枕 (光と重なる) */}
        <ellipse cx={760} cy={NY + 6} rx={300} ry={90} fill={YP.glow} opacity={0.35 * L} />
        <g>
          <path d={`M 520 ${NY - 46} Q 760 ${NY - 76 + L * 10} 1000 ${NY - 46} Q 1040 ${NY + 6} 1000 ${NY + 58} Q 760 ${NY + 84 - L * 6} 520 ${NY + 58} Q 480 ${NY + 6} 520 ${NY - 46} Z`}
            fill={C.linen} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {[-1, 1].map((d) => (
            <g key={d}>
              <path d={`M ${760 + d * 200} ${NY - 50} Q ${760 + d * 214} ${NY + 6} ${760 + d * 200} ${NY + 62}`} fill="none" stroke={C.goldTrim} strokeWidth={7} />
              {[-14, 0, 14].map((dy) => <line key={dy} x1={760 + d * 250} y1={NY + dy} x2={760 + d * (280 + Math.sin(f / 5 + dy) * 4)} y2={NY + dy * 1.6} stroke={C.goldTrim} strokeWidth={5} strokeLinecap="round" />)}
            </g>
          ))}
          <path d={`M 540 ${NY - 20} Q 760 ${NY - 44} 980 ${NY - 20}`} fill="none" stroke={C.linenShade} strokeWidth={4} />
          <path d={`M 540 ${NY + 30} Q 760 ${NY + 50} 980 ${NY + 30}`} fill="none" stroke={C.linenShade} strokeWidth={4} />
          <path d={`M 520 ${NY - 46} Q 760 ${NY - 76} 1000 ${NY - 46}`} fill="none" stroke={YP.glowCore} strokeWidth={8} opacity={0.8 * L} />
        </g>
        {/* からだの地図 (首が灯る) */}
        <KaradaChizu x={760} y={920} s={2.3} f={f} lit={{ back: 1, neck: L }} slots />
        {/* 立ちのぼる羽毛 */}
        {Array.from({ length: 7 }, (_, i) => {
          const life = ((f * 0.8 + i * 13) % 50) / 50;
          const side = i % 2 ? 1 : -1;
          return <L1cFeather key={i} x={760 + side * (170 + rnd(7001, i) * 100) + Math.sin(f / 6 + i) * 14} y={NY - 30 - life * 220} s={0.26 + rnd(7002, i) * 0.1} rot={f * 2 + i * 50} op={L * (1 - life)} />;
        })}
      </g>
    </Frame>
  );
};

// ---- 文#71 【並】 ところが、この柔らかさを、心から嫌った人たちがいました。
// 設計: 中世の修道院の石の廊下の暗がり。羽毛の枕に、黒い影が伸びてくる (修道服のフードをかぶった人の影)。羽根が1枚、f でしおれて落ちる。第4章への引き
// どこ: 夜の中世の修道院。アーチが奥へ連なる石の回廊、右の柱廊から月明かりが斜めに差す。左の壁に木の十字架。札「中世の修道院」
// 演出: 石の長椅子の上に、月明かりを浴びた白い羽毛の枕。右の外から、フードをかぶった修道士の長い影が床を這って枕へ伸び、枕の半分を黒く覆う。枕の上の羽根がしおれて落ちる
// 動き: 影が f0〜38 で伸びる / 羽根が f6〜30 でしおれ、f24〜42 で落ちる / ろうそくの灯がゆらぐ (影のふち もゆらぐ) / カメラがゆっくり枕へ寄る
const Yw071: React.FC<{ f: number }> = ({ f }) => {
  const k = lerp(1.0, 1.08, easeInOut(seg(f, 0, 40)));
  const VX = 1120, VY = 420;
  const grow = lerp(0.35, 1, easeInOut(seg(f, 0, 38)));
  const wilt = easeInOut(seg(f, 6, 30));
  const fall = easeInOut(seg(f, 24, 42));
  const flick = Math.sin(f / 2.2) * 1.5;
  return (
    <Frame f={f} seed={3071} bg={C.stoneDeep} dark>
      <g transform={cam(960, 600, k)}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.stoneDark} />
        {/* 床 (奥へすぼまる石畳) */}
        <path d={`M -40 1120 L ${VX - 120} ${VY + 120} L ${VX + 120} ${VY + 120} L 1960 1120 Z`} fill={C.stoneMid} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-40 + i * 250} y1={1120} x2={VX - 120 + i * 30} y2={VY + 120} stroke={C.stoneDeep} strokeWidth={4} />
        ))}
        {[0.12, 0.25, 0.42, 0.65].map((t, i) => (
          <line key={`h${i}`} x1={lerp(VX - 120, -40, t)} y1={lerp(VY + 120, 1120, t)} x2={lerp(VX + 120, 1960, t)} y2={lerp(VY + 120, 1120, t)} stroke={C.stoneDeep} strokeWidth={4} />
        ))}
        {/* 奥へ連なるアーチ */}
        {[0.16, 0.26, 0.4, 0.6, 0.9, 1.3].map((sc, i) => {
          const w = 1400 * sc, h = 980 * sc, bot = VY + 120 + 600 * (sc - 0.16) / 1.14 * 1.0;
          const lx = VX - w / 2, rx = VX + w / 2, spring = bot - h * 0.62;
          return (
            <g key={i}>
              <path d={`M ${lx} ${bot} L ${lx} ${spring} A ${w / 2} ${w / 2.6} 0 0 1 ${rx} ${spring} L ${rx} ${bot}`}
                fill="none" stroke={C.stoneCold} strokeWidth={Math.max(8, 60 * sc)} strokeLinejoin="round" />
              <path d={`M ${lx} ${bot} L ${lx} ${spring} A ${w / 2} ${w / 2.6} 0 0 1 ${rx} ${spring} L ${rx} ${bot}`}
                fill="none" stroke={C.stoneDeep} strokeWidth={3} />
            </g>
          );
        })}
        <rect x={VX - 60} y={VY - 30} width={120} height={150} rx={4} fill={C.cloisterSky} />
        <path d={`M ${VX - 60} ${VY - 30} A 60 60 0 0 1 ${VX + 60} ${VY - 30}`} fill={C.cloisterSky} />
        {/* 右の柱廊から差す月明かり */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${1500 + i * 160} ${180 + i * 30} L ${1600 + i * 170} ${170 + i * 30} L ${1180 + i * 140} 1000 L ${920 + i * 130} 1000 Z`} fill={C.moonLight} opacity={0.1 + (i === 0 ? 0.08 : 0)} />
        ))}
        {[1560, 1740, 1900].map((x, i) => <rect key={x} x={x - 30} y={120 + i * 20} width={60} height={760} fill={C.stoneCold} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 左の壁の木の十字架と扉 */}
        <g transform="translate(260 330)">
          <rect x={-12} y={-90} width={24} height={200} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-60} y={-46} width={120} height={22} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <path d="M 470 900 L 470 520 Q 560 440 650 520 L 650 900 Z" fill={YP.woodDark} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
        {[520, 600].map((x) => <line key={x} x1={x} y1={500} x2={x} y2={900} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />)}
        {/* 石の長椅子 */}
        <rect x={600} y={690} width={720} height={44} rx={6} fill={C.stoneCold} stroke={KRP.ink} strokeWidth={6} />
        <rect x={620} y={734} width={680} height={120} fill={C.stoneMid} stroke={KRP.ink} strokeWidth={5} />
        {[700, 1220].map((x) => <rect key={x} x={x - 30} y={734} width={60} height={120} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 羽毛の枕 (月明かりを浴びる) */}
        <ellipse cx={960} cy={698} rx={290} ry={22} fill={KRP.ink} opacity={0.35} />
        <path d="M 680 690 Q 660 600 700 540 Q 960 500 1220 540 Q 1260 600 1240 690 Q 960 712 680 690 Z" fill={C.linenCold} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 720 560 Q 960 530 1200 560" fill="none" stroke={KRP.white} strokeWidth={10} opacity={0.6} strokeLinecap="round" />
        <path d="M 700 620 Q 960 600 1220 620" fill="none" stroke={C.linenShade} strokeWidth={4} />
        {[[690, 548], [1230, 548], [676, 686], [1244, 686]].map(([x, y], i) => <path key={i} d={`M ${x} ${y} l ${i % 2 ? 18 : -18} ${i < 2 ? -14 : 12}`} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />)}
        <path d="M 700 540 Q 960 500 1220 540 Q 1240 600 1240 690" fill="none" stroke={C.moonLight} strokeWidth={6} opacity={0.7} />
        {/* しおれて落ちる羽根 */}
        <L1cFeather x={lerp(900, 770, fall)} y={lerp(560, 702, fall)} s={0.75} rot={lerp(-60, -100, fall) + Math.sin(f / 4) * 6 * fall} wilt={wilt} op={1 - fall * 0.15} />
        {/* フードの修道士の影 (右の外のろうそくに照らされ、奥の壁と枕の上に大きく伸び上がる) */}
        <g transform={`translate(1500 ${1060 + flick}) skewX(30) scale(${1.3 + flick * 0.01} ${grow * 1.09})`} opacity={0.86}>
          {/* 修道服の体とフード (とがった頭巾) */}
          <path d="M -190 0 L -150 -320 Q -160 -390 -118 -430 Q -96 -462 -86 -496 Q -74 -578 -16 -620 Q 14 -646 34 -644 Q 34 -612 62 -590 Q 112 -540 104 -470 Q 126 -440 146 -400 Q 166 -340 156 -300 L 200 0 Z" fill={C.hoodShadow} />
          {/* 前へ伸ばした腕と指 */}
          <path d="M -110 -430 Q -200 -440 -280 -470 L -300 -486 L -306 -470 L -322 -478 L -316 -458 L -330 -452 L -300 -446 Q -220 -410 -120 -390 Z" fill={C.hoodShadow} />
        </g>
        {/* 影の奥の、ろうそくの灯 (右下の外) */}
        <circle cx={2000} cy={960} r={260 + flick * 10} fill={C.candle} opacity={0.12} />
        <TagPlate x={780} y={110} text="中世の修道院" size={42} t={seg(f, 4, 14)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_062: (f) => <Yw062 f={f} />,
  yw_063: (f) => <Yw063 f={f} />,
  yw_064: (f) => <Yw064 f={f} />,
  yw_065: (f) => <Yw065 f={f} />,
  yw_066: (f) => <Yw066 f={f} />,
  yw_067: (f) => <Yw067 f={f} />,
  yw_068: (f) => <Yw068 f={f} />,
  yw_069: (f) => <Yw069 f={f} />,
  yw_070: (f) => <Yw070 f={f} />,
  yw_071: (f) => <Yw071 f={f} />,
};

export const YW_C3_MOTIFS: string[] = [
  "yw_062",
  "yw_063",
  "yw_064",
  "yw_065",
  "yw_066",
  "yw_067",
  "yw_068",
  "yw_069",
  "yw_070",
  "yw_071",
];

export const yawaC3Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
