// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#197〜#208 (12文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-6.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L5b。
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
  // 研究室
  labWall: "#E2E9E6",
  labTile: "#CCD7D3",
  labTileLine: "#B4C2BD",
  viewer: "#5E676E",
  viewerFace: "#EEF5F3",
  sleeve: "#8FB0A0",
  sleeveDark: "#6E8F80",
  // 工具
  steel: "#B9C2C9",
  steelDark: "#7F8A93",
  hard: "#D9A441",
  hardDark: "#B07F26",
  hardShine: "#F5D78C",
  rubber: "#5F9A7C",
  rubberDark: "#457A5F",
  rubberLight: "#86BBA0",
  bench: "#C99A63",
  benchDark: "#A27443",
  peg: "#DCC79E",
  pegHole: "#B59E72",
  participant: "#8C7BB0",
  participantDark: "#6D5E91",
  coatDark: "#9AA4AC",
  // 黒板
  board: "#3E5A4B",
  boardDark: "#30483B",
  chalk: "#F1EFE6",
  chalkPink: "#F2B8B0",
  chalkYellow: "#F3E3A0",
  // 道しるべ (#172 の L4cSignpost と同じ色)
  sky: "#BFDCEA",
  hill: "#A9C98F",
  meadow: "#9CC47F",
  meadowDark: "#6F9A58",
  path: "#E2CFA4",
  pathDark: "#C4AE80",
  wallWarm: "#F1DDB8",
  warmGlow: "#FFD98A",
  cloud: "#FDFBF7",
  // 夕方
  dusk: "#F2A66A",
  duskDeep: "#C9735A",
  sun: "#FFCF7A",
  // 図書館
  libWall: "#E6D5B6",
  libWallDark: "#CDB894",
  shelf: "#8C5E3A",
  shelfDark: "#6B4528",
  lamp: "#5E8A6B",
  sheet: "#FBF8F0",
  sheetEdge: "#DCD3C0",
  report: "#3C5A7A",
  reportDark: "#2C445E",
  gold: "#D9B45A",
  // 居間
  roomWall: "#F0E2C8",
  roomWallDark: "#DDCBA8",
  couch: "#B9805E",
  couchDark: "#946247",
  rug: "#C9A77E",
  mom: "#C9A3B5",
  momDark: "#A98196",
  son: "#6E9B8A",
  sonDark: "#527A6B",
  tea: "#E9D6B4",
  leaf: "#7BAF6E",
  leafDark: "#5A8D52",
  // 夜の部屋
  night: "#2E3550",
  nightWall: "#454E6E",
  nightWallLit: "#7A6F7C",
  nightFloor: "#3A3F58",
  moon: "#F6EBC2",
  bedFrame: "#7A5A44",
  sheetBlue: "#C9D3E6",
  blanket: "#7F95C2",
  blanketDark: "#61779F",
  pj: "#9FB6C9",
  pjDark: "#7D96AB",
  bear: "#B98A5E",
  bearDark: "#8F6540",
  bearMuzzle: "#E8D2B0",
  bodyPillow: "#E7DCEB",
  bodyPillowDark: "#C6B5CE",
  lampLight: "#FFE2A6",
  shadow: "#2A2638",
  // 夜の机
  deskNight: "#6E4D35",
  deskNightDark: "#553926",
  grid: "#AFC6DA",
  pencil: "#F2C14E",
  pencilDark: "#C99A2E",
  graphite: "#5A5560",
  // 夕方の机
  deskEve: "#B88B5C",
  deskEveDark: "#946A40",
  eveWall: "#D9C7B0",
  blind: "#EAD9BC",
} as const;
void PersonMini; void Stamp; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void DameSofa; void AgeDial; void KaradaChizu; void FONT; void easeOut;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
// (cx,cy) を中心に z 倍に寄るカメラ
const cam = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;

// 太い腕・脚 (輪郭つきの太線)
const L5bLimb: React.FC<{ d: string; w: number; fill: string }> = ({ d, w, fill }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={KRP.ink} strokeWidth={w + 10} />
    <path d={d} stroke={fill} strokeWidth={w} />
  </g>
);

// 痛みの点 (赤い丸+放射線)。a: 0〜1 の強さ
const L5bPain: React.FC<{ x: number; y: number; r: number; a: number; rays?: boolean }> = ({ x, y, r, a, rays = true }) => {
  if (a <= 0.01) return null;
  return (
    <g opacity={clamp01(a)}>
      <circle cx={x} cy={y} r={r * 1.7} fill={KRP.red} opacity={0.22} />
      <circle cx={x} cy={y} r={r} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.25} fill={KRP.white} opacity={0.6} />
      {rays && [0, 60, 120, 180, 240, 300].map((deg) => {
        const ra = (deg * Math.PI) / 180;
        return (
          <line key={deg} x1={x + Math.cos(ra) * r * 1.35} y1={y + Math.sin(ra) * r * 1.35}
            x2={x + Math.cos(ra) * r * 2.0} y2={y + Math.sin(ra) * r * 2.0}
            stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

// ドライバー (横向き。原点=持ち手と軸のつなぎ目。持ち手は左、先端は右)
const L5bDriver: React.FC<{ x: number; y: number; s?: number; rot?: number; soft?: boolean; shadow?: boolean }> = ({
  x, y, s = 1, rot = 0, soft = false, shadow = true,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {shadow && <ellipse cx={60} cy={62} rx={420} ry={14} fill={KRP.ink} opacity={0.13} />}
    {/* 軸 */}
    <rect x={0} y={-12} width={400} height={24} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
    <line x1={10} y1={-4} x2={392} y2={-4} stroke={KRP.white} strokeWidth={5} opacity={0.75} />
    {/* 先端 (プラス) */}
    <path d="M 400 -12 L 452 -6 L 452 6 L 400 12 Z" fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <line x1={408} y1={0} x2={450} y2={0} stroke={KRP.ink} strokeWidth={3} />
    {/* 口金 */}
    <rect x={-34} y={-26} width={40} height={52} rx={6} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
    <line x1={-20} y1={-22} x2={-20} y2={22} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
    {soft ? (
      <g>
        {/* ゴムを巻いた、ふくらんだ持ち手 */}
        <path d="M -30 -44 Q -110 -62 -190 -54 Q -290 -66 -332 -42 Q -352 0 -332 42 Q -290 66 -190 54 Q -110 62 -30 44 Z"
          fill={C.rubber} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -60 -30 Q -190 -46 -310 -28" fill="none" stroke={C.rubberLight} strokeWidth={10} strokeLinecap="round" opacity={0.8} />
        {Array.from({ length: 21 }, (_, i) => {
          const cx2 = -70 - (i % 7) * 38;
          const cy2 = -22 + Math.floor(i / 7) * 22 + ((i % 2) ? 6 : 0);
          return <ellipse key={i} cx={cx2} cy={cy2 + 6} rx={7} ry={5} fill={C.rubberDark} opacity={0.75} />;
        })}
        <path d="M -312 -36 Q -330 0 -312 36" fill="none" stroke={C.rubberDark} strokeWidth={5} />
      </g>
    ) : (
      <g>
        {/* 硬い樹脂の持ち手 (角ばった溝) */}
        <rect x={-330} y={-46} width={300} height={92} rx={18} fill={C.hard} stroke={KRP.ink} strokeWidth={6} />
        {[-24, 0, 24].map((yy) => (
          <line key={yy} x1={-316} y1={yy} x2={-44} y2={yy} stroke={C.hardDark} strokeWidth={6} strokeLinecap="round" />
        ))}
        <rect x={-310} y={-38} width={250} height={9} rx={4} fill={C.hardShine} opacity={0.85} />
        <rect x={-342} y={-34} width={20} height={68} rx={8} fill={C.hardDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
    )}
  </g>
);

// くまのぬいぐるみ (中心 x,y。s=1 で高さ約 260)。sq: 0〜1 抱きしめて潰れる
const L5bBear: React.FC<{ x: number; y: number; s?: number; sq?: number; rot?: number }> = ({ x, y, s = 1, sq = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1 + sq * 0.1)} ${s * (1 - sq * 0.08)})`}>
    {/* 体 */}
    <ellipse cx={0} cy={44} rx={72} ry={66} fill={C.bear} stroke={KRP.ink} strokeWidth={5.5} />
    <ellipse cx={0} cy={52} rx={40} ry={36} fill={C.bearMuzzle} opacity={0.8} />
    {/* 足 */}
    <ellipse cx={-44} cy={102} rx={30} ry={22} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={44} cy={102} rx={30} ry={22} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={-44} cy={104} rx={15} ry={11} fill={C.bearMuzzle} />
    <ellipse cx={44} cy={104} rx={15} ry={11} fill={C.bearMuzzle} />
    {/* 耳 */}
    <circle cx={-50} cy={-104} r={24} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={50} cy={-104} r={24} fill={C.bear} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={-50} cy={-104} r={11} fill={C.bearDark} />
    <circle cx={50} cy={-104} r={11} fill={C.bearDark} />
    {/* 頭 */}
    <circle cx={0} cy={-62} r={62} fill={C.bear} stroke={KRP.ink} strokeWidth={5.5} />
    <ellipse cx={0} cy={-40} rx={30} ry={22} fill={C.bearMuzzle} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={0} cy={-50} rx={10} ry={7} fill={KRP.ink} />
    <path d="M 0 -43 L 0 -32 M -10 -30 Q 0 -24 10 -30" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
    <circle cx={-24} cy={-74} r={6} fill={KRP.ink} />
    <circle cx={24} cy={-74} r={6} fill={KRP.ink} />
    {/* 縫い目 */}
    <path d="M 0 -124 L 0 -112 M 0 -10 L 0 6" stroke={C.bearDark} strokeWidth={3} strokeDasharray="4 5" />
    {/* 首のリボン */}
    <path d="M -34 -6 Q 0 8 34 -6" fill="none" stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
    <path d="M 0 0 L -18 -14 L -18 14 Z M 0 0 L 18 -14 L 18 14 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
  </g>
);

// 手のひらを下にして左へ伸びる手 (原点=手の甲の中心)。curl: 指の曲がり 0〜1
const L5bReachHand: React.FC<{ x: number; y: number; s?: number; rot?: number; curl?: number; cloth: string; clothDark: string }> = ({
  x, y, s = 1, rot = 0, curl = 0, cloth, clothDark,
}) => {
  const lens = [128, 146, 138, 112];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* 袖 */}
      <path d="M 70 -78 L 1100 -110 L 1100 110 L 70 84 Z" fill={cloth} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 300 -84 Q 340 0 300 90" fill="none" stroke={clothDark} strokeWidth={5} />
      <rect x={70} y={-82} width={44} height={168} rx={10} fill={clothDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 親指 (手前の下) */}
      <g transform={`rotate(${28 + curl * 10} -10 50)`}>
        <rect x={-120} y={34} width={120} height={40} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 手の甲 */}
      <rect x={-96} y={-74} width={180} height={148} rx={54} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 指 4本 */}
      {lens.map((L, i) => {
        const yy = -52 + i * 33;
        return (
          <g key={i} transform={`rotate(${-6 + i * 4 - curl * (16 + i * 3)} -80 ${yy})`}>
            <rect x={-80 - L} y={yy - 17} width={L + 16} height={34} rx={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${-80 - L * 0.5} ${yy - 13} q -6 13 0 26`} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.45} />
          </g>
        );
      })}
      {/* 関節のしわ */}
      {[-52, -19, 14, 47].map((yy, i) => (
        <path key={i} d={`M -70 ${yy - 10} q 8 10 0 20`} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      ))}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#197 【並】 太くて柔らかいペンのほうが、指から肩までの痛みが、小さくなりました。
// 設計: 2本の腕を並べた図: 細いペンを握る腕には指→手首→肘→肩に赤い痛みの点、太くて柔らかいペンを握る腕は点が小さく少ない。f で痛みの点が比べて点滅
// どこ: 研究室の壁に並んだ2枚のシャウカステン (光る観察板)。手前に実験机と2本のペン・書きかけの紙。
// 演出: 左の板=細いペンで書く腕。指→手首→ひじ→肩に大きな痛みの点が順に灯る。右の板=太く柔らかいペンの腕。点は小さく、肩には出ない。
// 動き: f6〜22 左の点が指から肩へ順に灯る・f22〜34 右の小さな点が灯る・以後 左右が交互に点滅・カメラはゆっくり寄る。
const L5bArmPanel: React.FC<{ x0: number; y0: number; f: number; thick: boolean; id: string }> = ({ x0, y0, f, thick, id }) => {
  const pw = 760, ph = 640;
  const pts: [number, number, string][] = [[606, 476, "指"], [512, 436, "手首"], [300, 424, "ひじ"], [150, 176, "肩"]];
  const pulse = thick ? 0.55 + 0.25 * Math.sin(f / 3 + Math.PI) : 0.7 + 0.3 * Math.sin(f / 3);
  return (
    <g transform={`translate(${x0} ${y0})`}>
      <defs>
        <clipPath id={id}><rect x={20} y={20} width={pw - 40} height={ph - 40} rx={10} /></clipPath>
      </defs>
      {/* 板の枠 */}
      <rect x={0} y={0} width={pw} height={ph} rx={20} fill={C.viewer} stroke={KRP.ink} strokeWidth={8} />
      <rect x={20} y={20} width={pw - 40} height={ph - 40} rx={10} fill={C.viewerFace} stroke={KRP.ink} strokeWidth={4} />
      <g clipPath={`url(#${id})`}>
        {/* 方眼 */}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={20 + i * 64} y1={20} x2={20 + i * 64} y2={ph} stroke={C.labTile} strokeWidth={2} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={20 + i * 64} x2={pw} y2={20 + i * 64} stroke={C.labTile} strokeWidth={2} />
        ))}
        {/* 胴 (左端から) */}
        <rect x={-60} y={110} width={190} height={520} rx={40} fill={C.sleeve} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={-10} cy={40} r={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 机の面 */}
        <rect x={0} y={540} width={pw} height={120} fill={KRP.floor} stroke={KRP.ink} strokeWidth={5} />
        <rect x={440} y={520} width={260} height={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(-3 570 540)" />
        <path d="M 470 538 q 30 -10 60 0 t 60 0 t 60 0" fill="none" stroke={C.graphite} strokeWidth={3} />
        {/* 上腕・前腕 */}
        <L5bLimb d="M 150 176 L 300 424 L 512 436" w={64} fill={C.sleeve} />
        <path d="M 300 380 q 14 44 0 88" fill="none" stroke={C.sleeveDark} strokeWidth={4} />
        {/* 手 */}
        <ellipse cx={560} cy={446} rx={58} ry={46} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        {/* ペン */}
        {thick ? (
          <g transform="rotate(22 600 470)">
            <rect x={578} y={340} width={46} height={200} rx={20} fill={KRP.blue} stroke={KRP.ink} strokeWidth={5} />
            <rect x={574} y={430} width={54} height={88} rx={22} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
            {[444, 462, 480, 498].map((yy) => <line key={yy} x1={580} y1={yy} x2={622} y2={yy} stroke={KRP.blue} strokeWidth={3} />)}
            <path d="M 584 540 L 601 572 L 618 540 Z" fill={C.sheetEdge} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          </g>
        ) : (
          <g transform="rotate(22 600 470)">
            <rect x={592} y={340} width={16} height={210} rx={6} fill={C.graphite} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 592 550 L 600 574 L 608 550 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
          </g>
        )}
        {/* 指 (ペンの上から握る) */}
        <ellipse cx={600} cy={470} rx={26} ry={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 痛みの点 */}
        {pts.map(([px, py, lab], i) => {
          if (thick && i === 3) return null; // 太いペンは肩に出ない
          const on = thick ? seg(f, 22 + i * 3, 28 + i * 3) : seg(f, 6 + i * 4, 12 + i * 4);
          const r = thick ? [16, 13, 10, 0][i] : [36, 34, 32, 34][i];
          return (
            <g key={lab}>
              <L5bPain x={px} y={py} r={r * pop(on)} a={on * pulse} rays={!thick} />
              {!thick && on > 0.5 && (
                <TagPlate x={px + (i === 3 ? 120 : i === 2 ? -10 : 10)} y={py + (i === 3 ? -40 : 74)} text={lab} size={30} t={on} />
              )}
            </g>
          );
        })}
      </g>
    </g>
  );
};
const Yw197: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.045, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={3197} bg={C.labWall}>
      <g transform={cam(960, 420, z)}>
        {/* 研究室の壁とタイル */}
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.labWall} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-100 + i * 160} y1={-100} x2={-100 + i * 160} y2={800} stroke={C.labTileLine} strokeWidth={2} opacity={0.5} />
        ))}
        <rect x={-100} y={760} width={W + 200} height={30} fill={C.labTile} stroke={KRP.ink} strokeWidth={4} />
        {/* 観察板 2枚 */}
        <L5bArmPanel x0={140} y0={70} f={f} thick={false} id="l5b197a" />
        <L5bArmPanel x0={1020} y0={70} f={f} thick={true} id="l5b197b" />
        {/* 板の下の名札 */}
        <TagPlate x={520} y={760} text="細いペン" size={46} t={seg(f, 2, 10)} />
        <TagPlate x={1400} y={760} text="太く柔らかいペン" size={46} t={seg(f, 18, 26)} />
        {/* 実験机 (手前) */}
        <rect x={-100} y={812} width={W + 200} height={400} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
        <line x1={-100} y1={840} x2={W + 100} y2={840} stroke={C.benchDark} strokeWidth={5} />
        <g transform="rotate(-6 360 900)">
          <rect x={250} y={872} width={230} height={14} rx={5} fill={C.graphite} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="rotate(4 1520 900)">
          <rect x={1390} y={862} width={260} height={40} rx={18} fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1420} y={858} width={100} height={48} rx={20} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <rect x={820} y={860} width={280} height={160} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(-2 960 900)" />
      </g>
    </Frame>
  );
};

// ---- 文#198 【並】 ところが、道具の持ち手を調べた研究では、意外な結果が出ています。
// 設計: 作業台の上に、硬い持ち手と柔らかい (ゴムを巻いた) 持ち手の工具 (ドライバー) が並ぶ。`QMark`
// どこ: 研究室の作業台。奥の壁は有孔ボードで、工具の形の白線 (シャドーボード) が描いてある。
// 演出: 台の上に硬い持ち手と柔らかい持ち手のドライバーが大きく並ぶ。虫めがねが硬い方から柔らかい方へ調べていき、最後に大きな？が跳ねる。
// 動き: f4〜20 虫めがねが移動・f20〜30 ？がぽん・カメラは台へ寄る・ホコリ。
const Yw198: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  const mg = easeInOut(seg(f, 4, 22));
  const mx = lerp(460, 640, mg), my = lerp(520, 690, mg);
  return (
    <Frame f={f} seed={3198} bg={C.peg}>
      <g transform={cam(960, 640, z)}>
        {/* 有孔ボード */}
        <rect x={-100} y={-100} width={W + 200} height={660} fill={C.peg} />
        {Array.from({ length: 13 * 7 }, (_, i) => (
          <circle key={i} cx={-40 + (i % 13) * 160} cy={-20 + Math.floor(i / 13) * 80} r={7} fill={C.pegHole} />
        ))}
        {/* シャドーボードの白線 (かなづち・スパナ・のこぎり) と、掛かった工具 */}
        <g fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.9}>
          <path d="M 260 120 L 300 120 L 300 160 L 380 160 L 380 120 L 400 120 L 400 220 L 300 220 L 300 420 L 260 420 Z" />
          <path d="M 1500 110 L 1560 110 L 1560 140 L 1680 140 L 1680 110 L 1720 110 L 1720 200 L 1560 200 L 1560 420 L 1500 420 Z" />
        </g>
        <g transform="rotate(-8 1100 260)">
          <rect x={1060} y={90} width={40} height={300} rx={10} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1080} cy={90} r={46} fill="none" stroke={KRP.ink} strokeWidth={22} />
          <circle cx={1080} cy={90} r={46} fill="none" stroke={C.steel} strokeWidth={12} />
          <circle cx={1080} cy={90} r={8} fill={C.pegHole} />
        </g>
        <path d="M 700 120 L 900 120 L 900 160 L 720 400 L 680 380 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={660} y={92} width={60} height={110} rx={14} fill={C.benchDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 作業台 */}
        <path d="M -100 560 L 2020 560 L 2020 1200 L -100 1200 Z" fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
        {[640, 740, 860, 990].map((yy, i) => (
          <path key={i} d={`M -100 ${yy} q 600 ${i % 2 ? 10 : -10} 1100 0 t 1100 0`} fill="none" stroke={C.benchDark} strokeWidth={4} opacity={0.55} />
        ))}
        <rect x={-100} y={548} width={W + 200} height={22} fill={C.benchDark} stroke={KRP.ink} strokeWidth={5} />
        {/* ネジとワッシャー (小物) */}
        {[[1580, 900], [1630, 930], [1690, 905], [160, 920]].map(([sx, sy], i) => (
          <g key={i}><circle cx={sx} cy={sy} r={14} fill={C.steel} stroke={KRP.ink} strokeWidth={3} />
            <line x1={sx - 7} y1={sy} x2={sx + 7} y2={sy} stroke={KRP.ink} strokeWidth={3} /></g>
        ))}
        {/* 2本のドライバー (主役) */}
        <L5bDriver x={700} y={630} s={1.25} rot={-1.5} />
        <L5bDriver x={700} y={770} s={1.25} rot={1} soft />
        <TagPlate x={1640} y={630} text="硬い持ち手" size={44} t={seg(f, 2, 10)} />
        <TagPlate x={1640} y={770} text="柔らかい持ち手" size={44} t={seg(f, 8, 16)} />
        {/* 虫めがね (調べる) */}
        <g transform={`translate(${mx} ${my}) rotate(-30)`}>
          <circle r={110} fill={KRP.white} opacity={0.28} />
          <circle r={110} fill="none" stroke={KRP.ink} strokeWidth={16} />
          <circle r={110} fill="none" stroke={C.shelf} strokeWidth={8} />
          <path d="M -60 -60 Q -80 -10 -60 30" fill="none" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.8} />
          <rect x={-20} y={118} width={40} height={190} rx={16} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
        </g>
        {/* 意外な結果の ？ */}
        <QMark x={1290} y={300} s={1.5} f={f} t={seg(f, 20, 30)} />
        {seg(f, 22, 32) > 0 && seg(f, 22, 32) < 1 && (
          <g opacity={1 - seg(f, 22, 32)} stroke={KRP.red} strokeWidth={6} strokeLinecap="round">
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const a = (k / 6) * Math.PI * 2, r1 = 130 + seg(f, 22, 32) * 40;
              return <line key={k} x1={1290 + Math.cos(a) * r1} y1={270 + Math.sin(a) * r1} x2={1290 + Math.cos(a) * (r1 + 30)} y2={270 + Math.sin(a) * (r1 + 30)} />;
            })}
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- 文#199 【山】 持ち手を柔らかくすると、握る力は、むしろ強くなったのです。
// 設計: 握力計のような測定器つきの持ち手を握る手の超アップ。柔らかい持ち手の方の針が f でぐいっと大きく振れる。札「握る力」の矢印が太い。意外さの表情 (研究者の surprised)
// どこ: 清潔な研究室の実験台。奥にブラインドの窓・薬品棚。握力計 (文字盤つき) を大写し。
// 演出: ゴムの持ち手を握る手のアップ。文字盤には「硬い」の灰色の針 (前回の記録) が残り、赤い針が f12〜 ぐいっと振り切れて追い越す。赤い太矢印「握る力」が伸びる。右の研究者が眼鏡ごとのけぞって驚く。
// 動き: f6〜14 手が握り込む (しわ線)・f12〜24 針がはね上がって行きすぎ、戻る・f20〜34 矢印が伸びる・f22〜 研究者 surprised・針の着地でカメラが小さく揺れる。
const Yw199: React.FC<{ f: number }> = ({ f }) => {
  const grip = easeOut(seg(f, 6, 14));
  const nv = 0.04 + 0.82 * pop(seg(f, 12, 24)) + (f > 24 ? Math.sin(f * 1.7) * 0.006 : 0);
  const ang = (v: number) => ((150 + 240 * v) * Math.PI) / 180;
  const dcx = 700, dcy = 300;
  const shake = f > 22 && f < 30 ? Math.sin(f * 3.1) * 6 * (1 - seg(f, 22, 30)) : 0;
  const z = lerp(1.0, 1.07, easeInOut(seg(f, 0, 40)));
  const arr = easeOut(seg(f, 20, 34));
  const shocked = f >= 22;
  return (
    <Frame f={f} seed={3199} bg={C.labWall}>
      <g transform={cam(760, 420, z, shake, 0)}>
        {/* 研究室の壁・タイル・窓 */}
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.labWall} />
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={-100 + (i % 15) * 140} y={560 + Math.floor(i / 15) * 140} width={140} height={140} fill="none" stroke={C.labTileLine} strokeWidth={3} />
        ))}
        <g transform="translate(1240 60)">
          <rect x={0} y={0} width={560} height={330} fill={C.sky} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={6} y={8 + i * 29} width={548} height={18} fill={KRP.white} stroke={C.labTileLine} strokeWidth={2} opacity={0.92} />
          ))}
          <line x1={520} y1={0} x2={520} y2={360} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 薬品棚 (左上) */}
        <rect x={-40} y={110} width={300} height={16} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        {[[30, 50, KRP.blueSoft], [110, 70, C.labTile], [190, 44, KRP.yellow]].map(([bx, bh, col], i) => (
          <g key={i}>
            <rect x={(bx as number) - 26} y={110 - (bh as number)} width={52} height={bh as number} rx={8} fill={col as string} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            <rect x={(bx as number) - 12} y={100 - (bh as number)} width={24} height={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 実験台 */}
        <rect x={-100} y={830} width={W + 200} height={300} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-100} y={830} width={W + 200} height={22} fill={KRP.white} opacity={0.5} />
        {/* 研究者 (右) */}
        <g>
          <Person x={1580} y={930} s={2.0} f={f} face={shocked ? "surprised" : "normal"} cloth={KRP.white} clothDark={C.coatDark}
            glasses pose="hold" lean={shocked ? -7 : 0} gaze={[-6, 0]} />
          {/* 胸のクリップボード */}
          <g transform={`rotate(${shocked ? -12 : -4} 1580 700)`}>
            <rect x={1500} y={640} width={160} height={200} rx={8} fill={C.shelf} stroke={KRP.ink} strokeWidth={5} />
            <rect x={1514} y={662} width={132} height={166} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            <rect x={1550} y={630} width={60} height={24} rx={6} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
            {[690, 720, 750].map((yy) => <line key={yy} x1={1528} y1={yy} x2={1630} y2={yy} stroke={C.labTileLine} strokeWidth={4} />)}
          </g>
          {shocked && (
            <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={seg(f, 22, 26)}>
              <line x1={1420} y1={360} x2={1390} y2={320} />
              <line x1={1470} y1={330} x2={1462} y2={286} />
              <line x1={1530} y1={318} x2={1534} y2={274} />
            </g>
          )}
        </g>
        {/* 太い矢印「握る力」 */}
        <g transform={`translate(1250 650) scale(${0.6 + arr * 0.5} ${arr})`}>
          {arr > 0.01 && (
            <polygon points="-70,0 -70,-300 -130,-300 0,-460 130,-300 70,-300 70,0" fill={KRP.red} stroke={KRP.ink} strokeWidth={8} strokeLinejoin="round" />
          )}
        </g>
        <TagPlate x={1250} y={760} text="握る力" size={52} t={seg(f, 22, 30)} />
        {/* 握力計の本体: 文字盤 */}
        <circle cx={dcx} cy={dcy} r={226} fill={C.steel} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={dcx} cy={dcy} r={196} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 25 }, (_, i) => {
          const a = ang(i / 24), big = i % 4 === 0;
          return <line key={i} x1={dcx + Math.cos(a) * (big ? 150 : 166)} y1={dcy + Math.sin(a) * (big ? 150 : 166)}
            x2={dcx + Math.cos(a) * 184} y2={dcy + Math.sin(a) * 184} stroke={KRP.ink} strokeWidth={big ? 7 : 4} />;
        })}
        {/* 目盛りの赤い帯 (強い側) */}
        <path d={`M ${dcx + Math.cos(ang(0.75)) * 186} ${dcy + Math.sin(ang(0.75)) * 186} A 186 186 0 0 1 ${dcx + Math.cos(ang(1)) * 186} ${dcy + Math.sin(ang(1)) * 186}`}
          fill="none" stroke={KRP.red} strokeWidth={10} opacity={0.5} />
        {/* 灰色の針 (硬い持ち手の記録) */}
        <line x1={dcx} y1={dcy} x2={dcx + Math.cos(ang(0.42)) * 150} y2={dcy + Math.sin(ang(0.42)) * 150} stroke={KRP.grayDark} strokeWidth={10} strokeLinecap="round" opacity={0.8} />
        <TagPlate x={622} y={176} text="硬い" size={30} t={seg(f, 2, 8)} color={KRP.grayDark} />
        {/* 赤い針 (柔らかい持ち手) */}
        <line x1={dcx} y1={dcy} x2={dcx + Math.cos(ang(nv)) * 172} y2={dcy + Math.sin(ang(nv)) * 172} stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
        <circle cx={dcx} cy={dcy} r={22} fill={KRP.ink} />
        <circle cx={dcx} cy={dcy} r={9} fill={C.steel} />
        <TagPlate x={792} y={392} text="柔らかい" size={30} t={seg(f, 24, 30)} color={KRP.red} />
        {/* 振り切れの衝撃線 */}
        {seg(f, 20, 30) > 0 && seg(f, 20, 30) < 1 && (
          <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 20, 30)}>
            {[-20, 0, 20].map((d) => {
              const a = ang(0.9) + (d * Math.PI) / 180;
              return <line key={d} x1={dcx + Math.cos(a) * 240} y1={dcy + Math.sin(a) * 240} x2={dcx + Math.cos(a) * 290} y2={dcy + Math.sin(a) * 290} />;
            })}
          </g>
        )}
        {/* 首と上のバー */}
        <rect x={676} y={520} width={48} height={70} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={470} y={580} width={500} height={40} rx={14} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        {/* 下のバー (柔らかいゴムの持ち手) */}
        <g transform={`translate(0 ${-grip * 8})`}>
          <rect x={460} y={662} width={520} height={78} rx={36} fill={C.rubber} stroke={KRP.ink} strokeWidth={6} />
          {[540, 630, 720, 810].map((bx, i) => (
            <ellipse key={i} cx={bx + 45} cy={700} rx={10 + grip * 6} ry={30} fill={C.rubberLight} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
          ))}
        </g>
        {/* 手: 手首と手の甲 (右下へ抜ける) */}
        <path d="M 520 610 Q 760 560 960 610 Q 1060 660 1120 800 L 1180 1100 L 820 1100 L 860 820 Q 700 800 540 760 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 880 1100 L 880 900 M 1150 950 L 1200 1100" stroke={KRP.ink} strokeWidth={4} opacity={0.3} />
        <rect x={820} y={930} width={420} height={170} fill={C.sleeve} stroke={KRP.ink} strokeWidth={6} transform="rotate(-14 1030 1000)" />
        {/* 指 4本 (持ち手に巻きつく) */}
        {[548, 640, 732, 822].map((fx, i) => {
          const dy = grip * 10;
          return (
            <g key={i}>
              <rect x={fx} y={612 + dy} width={84} height={170 - i * 6} rx={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
              <path d={`M ${fx + 18} ${664 + dy} q 24 10 48 0 M ${fx + 18} ${724 + dy} q 24 10 48 0`} fill="none" stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
              <ellipse cx={fx + 42} cy={760 + dy - i * 6} rx={22} ry={12} fill={C.sheetEdge} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 親指 */}
        <rect x={440} y={600} width={150} height={66} rx={33} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} transform="rotate(-24 520 630)" />
        {/* 握り込みの線 */}
        {grip > 0.3 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
            <path d="M 430 700 l -40 -10 M 430 740 l -44 6 M 1010 680 l 40 -12" />
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- 文#200 【並】 それでも人は、柔らかい持ち手のほうを、好みました。
// 設計: 参加者が2本の工具のうち、柔らかい方を迷わず手に取り、にっこり (smile)。硬い方は置いてけぼり
// どこ: 実験室のテーブル。奥にホワイトボード (2本の持ち手の絵と ◯)・時計・窓。
// 演出: 参加者 (紫のセーター) が柔らかい方を高く持ち上げてにっこり。机には置かれたままの硬いドライバー、柔らかい方があった場所の点線の跡。
// 動き: f12〜20 ドライバーが机から手へ弧を描いて上がる (軌跡線)・f16〜 smile・きらきら・硬い方はころんと少し転がる・カメラは軽く横へ。
const Yw200: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 12, 20));
  const held = f >= 16;
  const pan = lerp(-20, 20, easeInOut(seg(f, 0, 42)));
  const roll = Math.sin(seg(f, 18, 34) * Math.PI * 2) * 4 * (1 - seg(f, 18, 34));
  const px = 960, py = 720, ps = 1.75;
  const hx = px + 67 * ps, hy = py - 232 * ps;
  const dx = lerp(1350, hx + 43, up), dy = lerp(700, hy - 128, up);
  return (
    <Frame f={f} seed={3200} bg={C.labWall}>
      <g transform={`translate(${pan} 0)`}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.labWall} />
        <rect x={-100} y={560} width={W + 200} height={14} fill={C.labTile} />
        {/* ホワイトボード */}
        <rect x={130} y={110} width={600} height={360} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <rect x={130} y={470} width={600} height={18} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        <g opacity={0.85}>
          <rect x={190} y={190} width={180} height={50} rx={14} fill="none" stroke={C.hardDark} strokeWidth={6} />
          <path d="M 190 340 Q 280 310 370 340 Q 380 365 370 390 Q 280 420 190 390 Q 180 365 190 340 Z" fill="none" stroke={C.rubberDark} strokeWidth={6} />
          <circle cx={560} cy={365} r={58} fill="none" stroke={KRP.red} strokeWidth={9} />
          <path d="M 520 205 l 70 0" stroke={KRP.grayDark} strokeWidth={6} />
        </g>
        {/* 時計 */}
        <circle cx={1500} cy={170} r={76} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1500} y1={170} x2={1500} y2={118} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        <line x1={1500} y1={170} x2={1500 + Math.cos(f / 20) * 50} y2={170 + Math.sin(f / 20) * 50} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" />
        {/* 窓 */}
        <rect x={1640} y={90} width={300} height={400} fill={C.sky} stroke={KRP.ink} strokeWidth={7} />
        <line x1={1790} y1={90} x2={1790} y2={490} stroke={KRP.ink} strokeWidth={5} />
        {/* 参加者 */}
        <Person x={px} y={py} s={ps} f={f} face={held ? "smile" : "normal"} cloth={C.participant} clothDark={C.participantDark}
          pose={held ? "raise" : "stand"} gaze={held ? [4, -4] : [6, 6]} lean={held ? 3 : 0} />
        {/* 持ち上げた柔らかいドライバー */}
        {up > 0 && up < 1 && (
          <path d={`M 1350 700 Q ${(1350 + hx) / 2 + 140} ${hy - 40} ${dx} ${dy}`} fill="none" stroke={C.rubberDark} strokeWidth={6} strokeDasharray="14 12" opacity={0.6} />
        )}
        <L5bDriver x={dx} y={dy} s={0.72} rot={lerp(0, -80, up)} soft shadow={false} />
        {held && <circle cx={hx} cy={hy} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />}
        {held && [0, 1, 2, 3].map((k) => {
          const a = (k / 4) * Math.PI * 2 + f / 10;
          const r = 190 + Math.sin(f / 4 + k) * 10;
          const sx2 = hx + 120 + Math.cos(a) * r, sy2 = hy - 140 + Math.sin(a) * r * 0.6;
          return <path key={k} d={`M ${sx2} ${sy2 - 18} L ${sx2 + 5} ${sy2 - 5} L ${sx2 + 18} ${sy2} L ${sx2 + 5} ${sy2 + 5} L ${sx2} ${sy2 + 18} L ${sx2 - 5} ${sy2 + 5} L ${sx2 - 18} ${sy2} L ${sx2 - 5} ${sy2 - 5} Z`}
            fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />;
        })}
        <TagPlate x={1400} y={250} text="柔らかい" size={46} t={seg(f, 18, 26)} />
        {/* テーブル (脚を隠す) */}
        <rect x={-100} y={650} width={W + 200} height={120} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-100} y={770} width={W + 200} height={400} fill={C.benchDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 柔らかい方があった跡 */}
        <rect x={1080} y={690} width={560} height={70} rx={30} fill="none" stroke={C.benchDark} strokeWidth={5} strokeDasharray="16 12" opacity={up} />
        {/* 置いてけぼりの硬いドライバー (少し転がる) */}
        <g transform={`rotate(${roll} 560 720)`}>
          <L5bDriver x={500} y={716} s={0.72} rot={2} />
        </g>
        <TagPlate x={560} y={772} text="硬い" size={40} t={seg(f, 4, 12)} color={KRP.grayDark} />
        {/* 置いてけぼりのホコリ */}
        {f > 26 && (
          <g fill={KRP.grayDark} opacity={0.4}>
            {[0, 1, 2].map((k) => <circle key={k} cx={420 + k * 60 + Math.sin(f / 6 + k) * 6} cy={660 - ((f - 26 + k * 7) % 24) * 2} r={4} />)}
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- 文#201 【図】 柔らかさが減らしてくれるのは、力ではなく、痛みのほうなのかもしれません。
// 設計: 天秤の図 (世界=研究室の黒板)。「力」の皿は減らない (そのまま)、「痛み」の皿が f で軽くなって上がる。札「力」「痛み」
// どこ: 研究室の大きな黒板。木の枠、下にチョーク受けと黒板消し。前の授業の消し跡が薄く残る。
// 演出: チョークで描いた大きな天秤。左の皿に「力」の重り (変わらない)、右の皿に「痛み」のとげとげの塊。痛みの塊がチョークの粉になって縮み、右の皿が上がる。
// 動き: f4〜14 天秤が描かれる・f14〜32 痛みが縮み、粉が舞い、竿が傾く・カメラはわずかに寄る。
const Yw201: React.FC<{ f: number }> = ({ f }) => {
  const draw = easeOut(seg(f, 2, 14));
  const shrink = easeInOut(seg(f, 14, 32));
  const th = lerp(0, 9, shrink);
  const rad = (th * Math.PI) / 180;
  const pvx = 960, pvy = 300, half = 470, hang = 250;
  const lx = pvx - half * Math.cos(rad), ly = pvy + half * Math.sin(rad);
  const rx = pvx + half * Math.cos(rad), ry = pvy - half * Math.sin(rad);
  const ps = lerp(1, 0.45, shrink);
  const z = lerp(1.0, 1.03, seg(f, 0, 42));
  const spike = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2;
      const rr = i % 2 ? r * 0.62 : r;
      return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr * 0.85}`;
    });
    return pts.join(" ");
  };
  return (
    <Frame f={f} seed={3201} bg={C.shelf}>
      <g transform={cam(960, 480, z)}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.libWallDark} />
        {/* 黒板 */}
        <rect x={50} y={40} width={1820} height={860} rx={10} fill={C.shelf} stroke={KRP.ink} strokeWidth={8} />
        <rect x={80} y={70} width={1760} height={800} fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {/* 消し跡 */}
        {[[300, 200, 260], [1500, 640, 320], [1300, 160, 200]].map(([ex, ey, ew], i) => (
          <ellipse key={i} cx={ex} cy={ey} rx={ew} ry={60} fill={C.chalk} opacity={0.06} />
        ))}
        <path d="M 1520 140 q 40 -20 80 0 t 80 0 M 1530 190 q 50 -14 100 0" fill="none" stroke={C.chalk} strokeWidth={4} opacity={0.18} />
        <g opacity={draw} fill="none" stroke={C.chalk} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
          {/* 支柱と台 */}
          <path d={`M ${pvx} ${pvy} L ${pvx} 760 M 820 780 L 1100 780 L 1060 740 L 860 740 Z`} />
          <path d={`M ${pvx - 40} ${pvy - 10} L ${pvx} ${pvy - 70} L ${pvx + 40} ${pvy - 10}`} />
          {/* 竿 */}
          <line x1={lx} y1={ly} x2={rx} y2={ry} strokeWidth={12} />
          <circle cx={pvx} cy={pvy} r={16} fill={C.board} />
          {/* 吊りひも */}
          <path d={`M ${lx} ${ly} L ${lx - 110} ${ly + hang} M ${lx} ${ly} L ${lx + 110} ${ly + hang}`} strokeWidth={5} />
          <path d={`M ${rx} ${ry} L ${rx - 110} ${ry + hang} M ${rx} ${ry} L ${rx + 110} ${ry + hang}`} strokeWidth={5} />
          {/* 皿 */}
          <path d={`M ${lx - 150} ${ly + hang} Q ${lx} ${ly + hang + 70} ${lx + 150} ${ly + hang} Z`} />
          <path d={`M ${rx - 150} ${ry + hang} Q ${rx} ${ry + hang + 70} ${rx + 150} ${ry + hang} Z`} />
        </g>
        {/* 「力」の重り (そのまま) */}
        <g opacity={draw}>
          <path d={`M ${lx - 90} ${ly + hang} L ${lx - 70} ${ly + hang - 150} L ${lx + 70} ${ly + hang - 150} L ${lx + 90} ${ly + hang} Z`}
            fill={C.chalk} opacity={0.85} stroke={C.chalk} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${lx - 30} ${ly + hang - 150} Q ${lx} ${ly + hang - 200} ${lx + 30} ${ly + hang - 150}`} fill="none" stroke={C.chalk} strokeWidth={8} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={lx - 60 + i * 24} y1={ly + hang - 130} x2={lx - 80 + i * 24} y2={ly + hang - 20} stroke={C.boardDark} strokeWidth={4} opacity={0.5} />
          ))}
        </g>
        {/* 「痛み」の塊 (縮む) */}
        <g opacity={draw}>
          <polygon points={spike(rx, ry + hang - 85 * ps, 110 * ps)} fill={C.chalkPink} opacity={0.9} stroke={C.chalkPink} strokeWidth={5} strokeLinejoin="round" />
        </g>
        {/* チョークの粉 */}
        {shrink > 0 && shrink < 1 && Array.from({ length: 10 }, (_, i) => {
          const a = rnd(3201, i) * Math.PI * 2;
          const d = 60 + shrink * 160 * rnd(3202, i);
          return <circle key={i} cx={rx + Math.cos(a) * d} cy={ry + hang - 90 + Math.sin(a) * d * 0.7 - shrink * 40} r={6 + rnd(3203, i) * 6}
            fill={C.chalkPink} opacity={0.6 * (1 - shrink)} />;
        })}
        {/* チョークの注記 */}
        <g fill="none" stroke={C.chalkYellow} strokeWidth={6} strokeLinecap="round" opacity={seg(f, 28, 36)}>
          <path d={`M ${rx + 200} ${ry + hang + 40} L ${rx + 200} ${ry + hang - 100} M ${rx + 176} ${ry + hang - 72} L ${rx + 200} ${ry + hang - 100} L ${rx + 224} ${ry + hang - 72}`} />
          <path d={`M ${lx - 220} ${ly + hang - 90} L ${lx - 180} ${ly + hang - 90} M ${lx - 220} ${ly + hang - 70} L ${lx - 180} ${ly + hang - 70}`} />
        </g>
        <TagPlate x={lx} y={ly + hang + 80} text="力" size={56} t={seg(f, 8, 16)} />
        <TagPlate x={rx} y={ry + hang + 80} text="痛み" size={56} t={seg(f, 10, 18)} color={KRP.red} />
        {/* チョーク受け */}
        <rect x={60} y={880} width={1800} height={34} fill={C.shelfDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={300} y={862} width={90} height={22} rx={10} fill={C.chalk} stroke={KRP.ink} strokeWidth={3} />
        <rect x={420} y={866} width={60} height={18} rx={8} fill={C.chalkPink} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1400} y={846} width={180} height={40} rx={6} fill={C.reportDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1400} y={872} width={180} height={14} fill={C.chalk} opacity={0.7} />
      </g>
    </Frame>
  );
};

// ---- 文#202 【並】 では、心のほうはどうでしょうか。
// 設計: 道しるべの看板の「心を落ち着かせる」の矢印が光る。夕方の光に変わる (真面目の谷の入口)。BGM を落とす場面
// どこ: #172 と同じ春の野原の分かれ道 (YawaF3 の L4cSignpost を写したもの)。3本の矢印がある道しるべ。
// 演出: 昼の空がゆっくり夕方の色に変わり、太陽が丘へ沈んでいく。「心を落ち着かせる」の矢印だけが灯る。旅の人が立ち止まって見上げる。柱の影が長く伸びる。
// 動き: f0〜40 空が夕焼けに・太陽が下がる・f8〜26 下の矢印が灯る・カメラはその矢印へゆっくり寄る・雲と草がゆれる。
const L5bCloud: React.FC<{ x: number; y: number; s?: number; tint?: number }> = ({ x, y, s = 1, tint = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 30 Q -120 -10 -70 -14 Q -60 -60 -10 -50 Q 20 -84 64 -50 Q 120 -50 116 0 Q 140 30 100 34 Z"
      fill={C.cloud} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -110 30 Q -120 -10 -70 -14 Q -60 -60 -10 -50 Q 20 -84 64 -50 Q 120 -50 116 0 Q 140 30 100 34 Z"
      fill={C.dusk} opacity={tint * 0.55} />
  </g>
);
// 道しるべの野原 (YawaF3 の L4cSignpost の写し。dusk: 夕方への変化 0→1 を足した)
const L5bSignpost: React.FC<{ f: number; top?: number; bot?: number; hand?: number; dusk?: number; children?: React.ReactNode }> = ({
  f, top = 0, bot = 0, hand = 0, dusk = 0, children,
}) => {
  const pulse = 0.85 + Math.sin(f / 4) * 0.15;
  const hp = pop(clamp01(hand));
  return (
    <g>
      <rect x={-400} y={-150} width={W + 800} height={800} fill={C.sky} />
      {/* 夕焼けの層 (この巻で足した物) */}
      <rect x={-400} y={-150} width={W + 800} height={800} fill={C.dusk} opacity={dusk * 0.7} />
      <rect x={-400} y={-150} width={W + 800} height={300} fill={C.duskDeep} opacity={dusk * 0.35} />
      <circle cx={1500} cy={lerp(260, 470, dusk)} r={90} fill={C.sun} opacity={0.5 + dusk * 0.5} />
      <circle cx={1500} cy={lerp(260, 470, dusk)} r={150} fill={C.sun} opacity={0.25 * dusk} />
      {[[300, 120, 1], [1100, 90, 1.3], [1650, 170, 0.9], [2150, 110, 1]].map(([cx2, cy2, s2], i) => (
        <L5bCloud key={i} x={cx2 + f * (0.6 + i * 0.3)} y={cy2} s={s2} tint={dusk} />
      ))}
      <path transform={`translate(${1300 - f * 6} ${250 + Math.sin(f / 4) * 8})`}
        d={`M -24 0 Q -12 ${-12 + Math.sin(f / 2) * 6} 0 0 Q 12 ${-12 + Math.sin(f / 2) * 6} 24 0`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <path d="M -400 560 Q 300 440 700 530 Q 1100 450 1500 520 Q 1800 470 2070 540 Q 2250 500 2400 540 L 2400 700 L -400 700 Z" fill={C.hill} stroke={C.ink} strokeWidth={5} />
      <g transform="translate(250 520)">
        <rect x={-90} y={-110} width={180} height={110} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <rect x={-14} y={-96} width={28} height={70} fill={KRP.red} />
        <rect x={-35} y={-75} width={70} height={28} fill={KRP.red} />
        <rect x={-24} y={-36} width={48} height={36} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
      </g>
      <g transform="translate(1720 520)">
        <rect x={40} y={-150} width={28} height={60} fill={YP.woodDark} stroke={C.ink} strokeWidth={4} />
        {[0, 1].map((k) => {
          const tt = ((f + k * 16) % 32) / 32;
          return <circle key={k} cx={54 + tt * 30} cy={-160 - tt * 60} r={10 + tt * 14} fill={KRP.white} opacity={0.85 * (1 - tt)} />;
        })}
        <path d="M -100 -80 L 0 -160 L 100 -80 Z" fill={KRP.red} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-80} y={-80} width={160} height={80} fill={C.wallWarm} stroke={C.ink} strokeWidth={5} />
        <rect x={-50} y={-62} width={40} height={34} fill={C.warmGlow} stroke={C.ink} strokeWidth={3} />
        <rect x={20} y={-50} width={32} height={50} fill={YP.woodDark} stroke={C.ink} strokeWidth={3} />
      </g>
      <rect x={-400} y={600} width={W + 800} height={600} fill={C.meadow} />
      <path d="M -400 600 Q 900 570 2400 610" fill="none" stroke={C.meadowDark} strokeWidth={5} />
      <polygon points="820,1200 1100,1200 1000,700 930,700" fill={C.path} stroke={C.ink} strokeWidth={5} />
      <polygon points="962,688 962,738 330,600 330,574" fill={C.path} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <polygon points="962,688 962,738 1620,600 1620,574" fill={C.path} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <polygon points="930,700 994,700 1010,760 916,760" fill={C.path} />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={960 + (i - 2.5) * 30} cy={800 + i * 50} rx={14} ry={6} fill={C.pathDark} />
      ))}
      {Array.from({ length: 28 }, (_, i) => {
        const gx = rnd(1671, i) * 2500 - 260;
        const gy = 640 + rnd(1672, i) * 300;
        if (gx > 800 && gx < 1120 && gy > 700) return null;
        const sw = Math.sin(f / 7 + i) * 4;
        return (
          <path key={i} d={`M ${gx - 14} ${gy} q ${sw} -26 ${-6 + sw} -40 M ${gx} ${gy} q ${sw} -30 ${4 + sw} -50 M ${gx + 14} ${gy} q ${sw} -24 ${12 + sw} -36`}
            fill="none" stroke={C.meadowDark} strokeWidth={5} strokeLinecap="round" />
        );
      })}
      {/* 夕方の長い柱の影 (この巻で足した物) */}
      <polygon points="938,850 990,850 460,1000 330,1000" fill={KRP.ink} opacity={0.16 * dusk} />
      {/* 柱 */}
      <rect x={938} y={190} width={52} height={660} rx={6} fill={YP.wood} stroke={C.ink} strokeWidth={7} />
      <path d="M 930 190 L 964 160 L 998 190 Z" fill={YP.woodDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <line x1={956} y1={240} x2={952} y2={820} stroke={YP.woodDark} strokeWidth={4} opacity={0.7} />
      {/* 上の矢印「体を守る」 */}
      <ellipse cx={760} cy={290} rx={360} ry={130} fill={YP.glow} opacity={0.5 * top * pulse} />
      <polygon points="1010,220 560,220 486,290 560,360 1010,360" fill={YP.wood} stroke={top > 0.05 ? YP.brassDark : C.ink} strokeWidth={7} strokeLinejoin="round" />
      <polygon points="1010,220 560,220 486,290 560,360 1010,360" fill={YP.glowCore} opacity={0.45 * top} />
      <path d="M 580 246 L 990 244 M 590 336 L 990 338" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
      {[[580, 290], [990, 290]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={7} fill={C.ink} />)}
      <TagPlate x={770} y={290} text="体を守る" size={64} t={1} />
      {/* 下の矢印「心を落ち着かせる」 */}
      <ellipse cx={1218} cy={456} rx={380} ry={120} fill={YP.glow} opacity={0.55 * bot * pulse} />
      {bot > 0.05 && (
        <g stroke={YP.glow} strokeWidth={8} strokeLinecap="round" opacity={bot}>
          {[-160, -125, -55, -20, 20, 55, 125, 160].map((a, i) => {
            const ra = (a * Math.PI) / 180;
            const r1 = 250, r2 = 290 + Math.sin(f / 3 + i) * 14;
            return <line key={a} x1={1218 + Math.cos(ra) * r1 * 1.3} y1={456 + Math.sin(ra) * r1 * 0.5} x2={1218 + Math.cos(ra) * r2 * 1.3} y2={456 + Math.sin(ra) * r2 * 0.5} />;
          })}
        </g>
      )}
      <polygon points="920,400 1450,400 1516,456 1450,512 920,512" fill={YP.wood} stroke={bot > 0.05 ? YP.brassDark : C.ink} strokeWidth={7} strokeLinejoin="round" />
      <polygon points="920,400 1450,400 1516,456 1450,512 920,512" fill={YP.glowCore} opacity={0.45 * bot} />
      <path d="M 940 424 L 1430 422 M 940 490 L 1430 492" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
      <TagPlate x={1190} y={456} text="心を落ち着かせる" size={48} t={1} />
      {/* 3本目の小さな矢印「手を守る」 (柱から生える) */}
      {hp > 0 && (
        <g transform={`translate(990 615) scale(${hp}) translate(-990 -615)`}>
          <polygon points="996,572 712,572 662,615 712,658 996,658" fill={YP.wood} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M 724 590 L 980 589 M 728 642 L 980 643" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
          <circle cx={976} cy={615} r={7} fill={C.ink} />
          <TagPlate x={830} y={615} text="手を守る" size={42} t={1} />
        </g>
      )}
      {children}
    </g>
  );
};
const Yw202: React.FC<{ f: number }> = ({ f }) => {
  const dusk = easeInOut(seg(f, 0, 40));
  const bot = seg(f, 8, 26);
  const z = lerp(1.0, 1.12, easeInOut(seg(f, 4, 42)));
  return (
    <Frame f={f} seed={3202} bg={C.sky}>
      <g transform={cam(1100, 500, z)}>
        <L5bSignpost f={f} bot={bot} hand={1} dusk={dusk}>
          {/* 立ち止まって見上げる旅の人 */}
          <ellipse cx={1500} cy={884} rx={90} ry={14} fill={KRP.ink} opacity={0.15} />
          <polygon points="1470,884 1530,884 1260,960 1180,960" fill={KRP.ink} opacity={0.12 * dusk} />
          <Person x={1500} y={880} s={1.25} f={f} face="normal" cloth={C.son} clothDark={C.sonDark} gaze={[-7, -5]} lean={-3} />
          {/* 背負い袋のひも */}
          <path d="M 1452 690 L 1530 820" stroke={YP.woodDark} strokeWidth={8} strokeLinecap="round" />
        </L5bSignpost>
        {/* 全体にかかる夕方の色 (静かな画面へ) */}
        <rect x={-400} y={-200} width={W + 800} height={H + 400} fill={C.duskDeep} opacity={dusk * 0.14} />
      </g>
    </Frame>
  );
};

// ---- 文#203 【山】 2024年、137の研究、およそ1万3千人分のデータをまとめた報告が出ました。
// 設計: 静かな図書館の閲覧室。机の上に137冊の論文の束が山になり (f で積み上がる)、それが1冊の報告書にまとまる。窓の夕日。札「2024年」「137の研究」「約1万3千人」
// どこ: 夕方の図書館の閲覧室。アーチ窓3つから夕日が斜めに差し込む。窓の間に本棚。長い閲覧机に緑の読書灯。
// 演出: 左に論文の束が高く積み上がり、そこから紙が1枚ずつ右の報告書へ吸い込まれる。報告書の表紙には小さな人の点がびっしり (=約1万3千人)。奥で研究者が静かに読んでいる。
// 動き: f2〜24 紙が積み上がる・f24〜34 報告書がぽんと現れ光る・f24〜 紙が弧を描いて流れ込む (続く)・光の筋のホコリ・カメラはゆっくり寄る。
const Yw203: React.FC<{ f: number }> = ({ f }) => {
  const stackN = Math.round(lerp(4, 40, easeOut(seg(f, 2, 24))));
  const rep = pop(seg(f, 24, 34));
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  const sx0 = 600, sy0 = 730;
  const topY = sy0 - stackN * 7;
  return (
    <Frame f={f} seed={3203} bg={C.libWall}>
      <g transform={cam(900, 480, z)}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.libWall} />
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.dusk} opacity={0.18} />
        {/* アーチ窓 3つ (夕日) */}
        {[330, 960, 1590].map((wx, i) => (
          <g key={i}>
            <path d={`M ${wx - 150} 560 L ${wx - 150} 200 Q ${wx - 150} 60 ${wx} 60 Q ${wx + 150} 60 ${wx + 150} 200 L ${wx + 150} 560 Z`}
              fill={C.dusk} stroke={KRP.ink} strokeWidth={8} />
            <path d={`M ${wx - 150} 560 L ${wx - 150} 380 L ${wx + 150} 380 L ${wx + 150} 560 Z`} fill={C.sun} opacity={0.6} />
            <circle cx={wx + 40} cy={400} r={50} fill={C.sun} opacity={i === 1 ? 0.95 : 0} />
            <path d={`M ${wx} 60 L ${wx} 560 M ${wx - 150} 300 L ${wx + 150} 300`} stroke={KRP.ink} strokeWidth={6} />
            <rect x={wx - 170} y={556} width={340} height={20} fill={C.shelf} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 窓の間の本棚 */}
        {[645, 1275].map((bx, i) => (
          <g key={i}>
            <rect x={bx - 120} y={80} width={240} height={540} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2, 3].map((r) => (
              <g key={r}>
                {Array.from({ length: 9 }, (_, k) => (
                  <rect key={k} x={bx - 108 + k * 24} y={100 + r * 130 + (rnd(3203 + i, r * 9 + k) * 20)} width={20} height={110 - rnd(3203 + i, r * 9 + k) * 20}
                    fill={[C.report, KRP.red, C.lamp, C.gold, C.sheetEdge][(k + r + i) % 5]} stroke={KRP.ink} strokeWidth={2.5} />
                ))}
                <rect x={bx - 116} y={210 + r * 130} width={232} height={10} fill={C.shelfDark} />
              </g>
            ))}
          </g>
        ))}
        {/* 差し込む夕日の筋 */}
        {[330, 960, 1590].map((wx, i) => (
          <polygon key={i} points={`${wx - 150},380 ${wx + 150},380 ${wx + 420},900 ${wx + 60},900`} fill={C.sun} opacity={0.14 + Math.sin(f / 12 + i) * 0.02} />
        ))}
        {/* 奥で読む研究者 */}
        <Person x={1600} y={760} s={1.35} f={f} face="normal" cloth={KRP.white} clothDark={C.coatDark} glasses pose="hold" gaze={[0, 6]} still />
        <rect x={1540} y={570} width={120} height={80} fill={C.sheet} stroke={KRP.ink} strokeWidth={4} transform="rotate(-8 1600 610)" />
        {/* 閲覧机 */}
        <rect x={-100} y={640} width={W + 200} height={150} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-100} y={790} width={W + 200} height={420} fill={C.shelfDark} stroke={KRP.ink} strokeWidth={6} />
        {[300, 960, 1620].map((dx2, i) => (
          <g key={i}>
            <rect x={dx2 - 220} y={830} width={440} height={180} rx={8} fill="none" stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
            <rect x={dx2 - 40} y={900} width={80} height={18} rx={9} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <line x1={-100} y1={660} x2={W + 100} y2={660} stroke={C.shelfDark} strokeWidth={4} opacity={0.5} />
        {/* 緑の読書灯 */}
        <g transform="translate(260 720)">
          <rect x={-8} y={-150} width={16} height={150} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-4} rx={60} ry={14} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -110 -150 Q -100 -210 0 -214 Q 100 -210 110 -150 Z" fill={C.lamp} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-148} rx={100} ry={12} fill={C.lampLight} opacity={0.9} />
          <polygon points="-100,-146 100,-146 180,0 -180,0" fill={C.lampLight} opacity={0.22} />
        </g>
        {/* 論文の束 (積み上がる) */}
        {Array.from({ length: stackN }, (_, i) => (
          <rect key={i} x={sx0 - 130 + (rnd(3204, i) - 0.5) * 16} y={sy0 - (i + 1) * 7} width={260} height={8}
            fill={i % 5 === 4 ? C.sheetEdge : C.sheet} stroke={KRP.ink} strokeWidth={2.5} />
        ))}
        {Array.from({ length: Math.floor(stackN / 8) }, (_, i) => (
          <rect key={i} x={sx0 + 118} y={sy0 - i * 56 - 40} width={22} height={10} fill={[KRP.red, C.lamp, KRP.blue][i % 3]} stroke={KRP.ink} strokeWidth={2} />
        ))}
        {/* 紙が報告書へ流れ込む */}
        {f > 24 && Array.from({ length: 5 }, (_, i) => {
          const t = ((f - 24) * 1.4 + i * 8) % 40 / 40;
          const qx = lerp(sx0 + 140, 1200, t), qy = lerp(topY + 40, 520, t) - Math.sin(t * Math.PI) * 90;
          return <rect key={i} x={qx - 40} y={qy - 26} width={80} height={52} fill={C.sheet} stroke={KRP.ink} strokeWidth={3}
            transform={`rotate(${t * 220 - 30} ${qx} ${qy})`} opacity={1 - t * 0.3} />;
        })}
        <TagPlate x={sx0} y={topY - 50} text="137の研究" size={44} t={seg(f, 10, 18)} />
        {/* 1冊の報告書 */}
        {rep > 0 && (
          <g transform={`translate(1200 720) scale(${rep}) translate(-1200 -640)`}>
            <circle cx={1200} cy={430} r={260} fill={C.sun} opacity={0.25 + Math.sin(f / 5) * 0.05} />
            <rect x={1040} y={240} width={330} height={400} rx={8} fill={C.reportDark} stroke={KRP.ink} strokeWidth={7} transform="rotate(-4 1200 640)" />
            <g transform="rotate(-4 1200 640)">
              <rect x={1050} y={230} width={320} height={400} rx={8} fill={C.report} stroke={KRP.ink} strokeWidth={7} />
              <rect x={1050} y={230} width={28} height={400} fill={C.reportDark} stroke={KRP.ink} strokeWidth={4} />
              <rect x={1100} y={258} width={240} height={10} fill={C.gold} />
              {/* 人の点がびっしり */}
              {Array.from({ length: 70 }, (_, i) => {
                const cx2 = 1112 + (i % 10) * 23, cy2 = 400 + Math.floor(i / 10) * 26;
                return <g key={i}><circle cx={cx2} cy={cy2 - 6} r={5} fill={C.chalk} /><rect x={cx2 - 6} y={cy2} width={12} height={9} rx={4} fill={C.chalk} /></g>;
              })}
            </g>
            <TagPlate x={1210} y={330} text="2024年" size={46} t={seg(f, 28, 34)} />
            <TagPlate x={1215} y={700} text="約1万3千人" size={38} t={seg(f, 32, 40)} />
          </g>
        )}
        {/* 光の筋のホコリ */}
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={900 + rnd(3205, i) * 700 + Math.sin(f / 14 + i) * 20} cy={400 + rnd(3206, i) * 260 - (f * 0.5) % 40} r={3} fill={KRP.white} opacity={0.6} />
        ))}
      </g>
    </Frame>
  );
};

// 白髪のおだんご (年配の人の頭に重ねる。Person と同じ x,y,s で、still を付けた Person に使う)
const L5bGrayHair: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -64 -232 Q -68 -296 0 -298 Q 68 -296 64 -232 Q 44 -266 0 -266 Q -44 -266 -64 -232 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={30} cy={-298} r={28} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -30 -284 Q 0 -276 34 -286" fill="none" stroke={KRP.grayDark} strokeWidth={3} />
  </g>
);

// ---- 文#204 【山】 人に触れてもらうと、心の健康に、はっきりした良い効果がありました。
// 設計: 温かい場面。老いた母の肩に、大人になった子が手を置く (ソファで並んで座る)。2人とも穏やかな笑顔。窓の光
// どこ: 午後の居間。レースのカーテン越しの光、壁に家族写真、横に湯気の立つ湯のみ、観葉植物、ラグ。
// 演出: ソファに並んで座る年配の母 (白髪) と大人の息子。息子の手が母の肩にそっと乗ると、手のところから温かい光の輪が広がり、母がほほえむ。
// 動き: f8〜 息子の腕が肩へ・f12〜30 光の輪が広がる・f18〜 母 smile・湯気がゆれる・カメラはゆっくり寄る。
const Yw204: React.FC<{ f: number }> = ({ f }) => {
  const s = 1.7, by = 820;
  const cx = 760, mx = cx + 200 * s;
  const touch = f >= 10;
  const glow = easeOut(seg(f, 12, 32));
  const momSmile = f >= 18;
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  const hx = cx + 165 * s, hy = by - 134 * s;
  return (
    <Frame f={f} seed={3204} bg={C.roomWall}>
      <g transform={cam(1000, 460, z)}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.roomWall} />
        <rect x={-100} y={600} width={W + 200} height={30} fill={C.roomWallDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓とレースのカーテン */}
        <rect x={1460} y={80} width={420} height={500} fill={C.sky} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 1670 80 L 1670 580 M 1460 330 L 1880 330" stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 1440 70 Q ${1500 + Math.sin(f / 10) * 10} 330 1470 600 L 1600 600 Q ${1560 + Math.sin(f / 10) * 10} 330 1590 70 Z`} fill={KRP.white} opacity={0.75} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="1460,330 1880,330 1500,1000 900,1000" fill={C.warmGlow} opacity={0.18} />
        {/* 家族写真 */}
        <g transform="rotate(-3 420 250)">
          <rect x={290} y={150} width={260} height={200} fill={C.shelf} stroke={KRP.ink} strokeWidth={6} />
          <rect x={308} y={168} width={224} height={164} fill={C.sky} />
          <circle cx={390} cy={240} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={362} y={272} width={56} height={60} rx={10} fill={C.mom} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={460} cy={270} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={442} y={290} width={36} height={42} rx={8} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="rotate(2 700 200)">
          <rect x={630} y={130} width={150} height={150} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
          <rect x={646} y={146} width={118} height={118} fill={C.leaf} opacity={0.7} />
          <path d="M 646 264 L 690 200 L 720 240 L 740 214 L 764 264 Z" fill={C.leafDark} />
        </g>
        {/* 観葉植物 */}
        <g transform="translate(160 820)">
          <path d="M -60 0 L -46 -120 L 46 -120 L 60 0 Z" fill={C.shelf} stroke={KRP.ink} strokeWidth={5} />
          {[-50, -20, 10, 40].map((a, i) => (
            <path key={i} d={`M 0 -120 Q ${a * 2 + Math.sin(f / 14 + i) * 6} -240 ${a * 3.4} ${-330 + i * 20}`} fill="none" stroke={C.leafDark} strokeWidth={6} />
          ))}
          {[[-150, -300], [-60, -380], [40, -350], [130, -270]].map(([lx2, ly2], i) => (
            <ellipse key={i} cx={lx2 + Math.sin(f / 14 + i) * 6} cy={ly2} rx={50} ry={24} fill={C.leaf} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${-30 + i * 20} ${lx2} ${ly2})`} />
          ))}
        </g>
        {/* ラグ */}
        <ellipse cx={1000} cy={1000} rx={900} ry={120} fill={C.rug} stroke={KRP.ink} strokeWidth={5} />
        {/* ソファの背もたれ */}
        <rect x={440} y={380} width={1120} height={330} rx={60} fill={C.couch} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 1000 400 L 1000 700" stroke={C.couchDark} strokeWidth={5} />
        {/* 母 */}
        <Person x={mx} y={by} s={s} f={f} face={momSmile ? "smile" : "normal"} cloth={C.mom} clothDark={C.momDark} hair="none" still gaze={momSmile ? [-5, 2] : [0, 0]} />
        <L5bGrayHair x={mx} y={by} s={s} />
        {/* カーディガンのボタン */}
        {[0, 1, 2].map((k) => <circle key={k} cx={mx} cy={by - (150 - k * 30) * s} r={6} fill={C.momDark} stroke={KRP.ink} strokeWidth={2} />)}
        {/* 息子 (手を肩へ) */}
        <Person x={cx} y={by} s={s} f={f} face="smile" cloth={C.son} clothDark={C.sonDark} pose={touch ? "point" : "stand"} pointDir={1}
          lean={touch ? 5 : 0} gaze={[6, 2]} phase={2} still />
        {/* 手から広がる温かい光 */}
        {glow > 0 && [0, 1, 2].map((k) => {
          const t = clamp01(glow * 1.4 - k * 0.2);
          return <circle key={k} cx={hx} cy={hy} r={30 + t * 150} fill="none" stroke={YP.glow} strokeWidth={8 - k * 2} opacity={(1 - t * 0.7) * 0.8} />;
        })}
        {touch && <circle cx={hx} cy={hy} r={34} fill={YP.glowCore} opacity={0.5 * glow} />}
        {/* ソファの座面 (脚を隠す) とひじかけ */}
        <rect x={420} y={by - 70} width={1160} height={150} rx={30} fill={C.couch} stroke={KRP.ink} strokeWidth={7} />
        <path d={`M 1000 ${by - 60} L 1000 ${by + 70}`} stroke={C.couchDark} strokeWidth={5} />
        <rect x={360} y={520} width={140} height={330} rx={50} fill={C.couchDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1500} y={520} width={140} height={330} rx={50} fill={C.couchDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={440} y={by + 80} width={30} height={60} fill={C.shelfDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1530} y={by + 80} width={30} height={60} fill={C.shelfDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 横の小机と湯のみ */}
        <rect x={1680} y={640} width={200} height={24} fill={C.shelf} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1700} y={664} width={20} height={240} fill={C.shelf} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1840} y={664} width={20} height={240} fill={C.shelf} stroke={KRP.ink} strokeWidth={4} />
        {[1730, 1820].map((tx, i) => (
          <g key={i}>
            <path d={`M ${tx - 30} 580 L ${tx + 30} 580 L ${tx + 24} 640 L ${tx - 24} 640 Z`} fill={C.tea} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${tx} 570 q ${8 + Math.sin(f / 6 + i) * 8} -30 0 -60 q ${-8 - Math.sin(f / 6 + i) * 8} -30 0 -60`} fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#205 【山】 そして、ぬいぐるみや抱き枕のような、モノに触れても、効果があったのです。
// 設計: 一人暮らしの部屋の夜。大人の Person が、くまのぬいぐるみを抱えてベッドに座り、穏やかな顔。枕元に抱き枕。窓の月
// どこ: 一人暮らしのワンルームの夜。左に月の見える窓 (遠くのビルの灯り)、右にベッドの頭板と枕・抱き枕。床に脱いだスリッパ。棚に小さな時計と本。
// 演出: パジャマの人がベッドのふちに座り、くまのぬいぐるみをぎゅっと抱く。抱くと胸のあたりに小さな温かい光の輪がふわりと広がり、顔がゆるむ。
// 動き: f12〜22 ぎゅっ (くまが潰れる)・f16〜34 光の輪・f20〜 smile・月のまわりの星がまたたく・カーテンがゆれる・カメラはゆっくり寄る。
const Yw205: React.FC<{ f: number }> = ({ f }) => {
  const px = 860, py = 800, ps = 1.7;
  const hug = Math.sin(seg(f, 12, 22) * Math.PI) * 0.6 + seg(f, 18, 26) * 0.25;
  const glow = easeOut(seg(f, 16, 34));
  const calm = f >= 20;
  const z = lerp(1.0, 1.05, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={3205} bg={C.night} dark>
      <g transform={cam(900, 500, z)}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.nightWall} />
        <rect x={-100} y={780} width={W + 200} height={400} fill={C.nightFloor} />
        {/* 窓と月 */}
        <rect x={150} y={110} width={440} height={400} fill={C.night} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={470} cy={210} r={56} fill={C.moon} />
        <circle cx={495} cy={196} r={50} fill={C.night} opacity={0.0} />
        <circle cx={470} cy={210} r={90} fill={C.moon} opacity={0.12} />
        {[[230, 170], [300, 250], [540, 330], [210, 300]].map(([sx2, sy2], i) => (
          <circle key={i} cx={sx2} cy={sy2} r={4 + Math.sin(f / 5 + i * 2) * 2} fill={C.moon} />
        ))}
        {[[160, 420, 90, 90], [260, 380, 70, 130], [340, 440, 110, 70], [460, 400, 80, 110], [530, 430, 60, 80]].map(([bx, bt, bw, bh], i) => (
          <g key={i}>
            <rect x={bx} y={bt} width={bw} height={bh} fill={C.nightFloor} />
            {Array.from({ length: 4 }, (_, k) => (
              <rect key={k} x={bx + 10 + (k % 2) * (bw / 2 - 4)} y={bt + 14 + Math.floor(k / 2) * 30} width={10} height={12} fill={C.lampLight} opacity={rnd(3205, i * 4 + k) > 0.4 ? 0.85 : 0.15} />
            ))}
          </g>
        ))}
        <path d="M 370 110 L 370 510 M 150 310 L 590 310" stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 120 90 Q ${170 + Math.sin(f / 12) * 12} 300 140 540 L 210 540 Q ${200 + Math.sin(f / 12) * 12} 300 220 90 Z`} fill={C.blanketDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 棚: 時計と本 */}
        <rect x={1660} y={300} width={240} height={18} fill={C.bedFrame} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1720} cy={262} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1720} y1={262} x2={1720} y2={238} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1720} y1={262} x2={1738} y2={270} stroke={KRP.ink} strokeWidth={4} />
        {[1790, 1814, 1838, 1862].map((bx, i) => <rect key={i} x={bx} y={230 + i * 4} width={22} height={70 - i * 4} fill={[C.report, KRP.red, C.lamp, C.gold][i]} stroke={KRP.ink} strokeWidth={2.5} />)}
        {/* ベッド: 頭板 */}
        <rect x={1640} y={400} width={110} height={420} rx={20} fill={C.bedFrame} stroke={KRP.ink} strokeWidth={7} />
        {/* 枕と抱き枕 */}
        <rect x={1470} y={540} width={180} height={90} rx={40} fill={C.sheetBlue} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1080} y={600} width={520} height={96} rx={48} fill={C.bodyPillow} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={1130 + i * 70} cy={648 + (i % 2 ? 14 : -14)} r={9} fill={C.bodyPillowDark} />
        ))}
        <path d="M 1150 616 Q 1340 604 1540 616" fill="none" stroke={KRP.white} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
        <TagPlate x={1340} y={560} text="抱き枕" size={38} t={seg(f, 24, 32)} />
        {/* パジャマの人 */}
        <Person x={px} y={py} s={ps} f={f} face={calm ? "smile" : "normal"} cloth={C.pj} clothDark={C.pjDark} pose="hold" gaze={[2, 5]} lean={calm ? -2 : 0} />
        {/* 胸の温かい光 */}
        {glow > 0 && [0, 1].map((k) => {
          const t = clamp01(glow * 1.3 - k * 0.3);
          return <ellipse key={k} cx={px} cy={py - 200} rx={60 + t * 170} ry={50 + t * 130} fill="none" stroke={YP.glow} strokeWidth={6} opacity={(1 - t * 0.6) * 0.7} />;
        })}
        <ellipse cx={px} cy={py - 200} rx={150} ry={130} fill={YP.glow} opacity={0.18 * glow} />
        {/* くまのぬいぐるみ (抱えている) */}
        <L5bBear x={px} y={py - 165} s={0.86} sq={hug} />
        {/* くまを抱く両手 */}
        <circle cx={px - 70} cy={py - 150} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={px + 70} cy={py - 150} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <TagPlate x={560} y={560} text="ぬいぐるみ" size={38} t={seg(f, 22, 30)} />
        {/* マットレスの前面と掛け布団 (脚を隠す) */}
        <rect x={300} y={690} width={1460} height={110} rx={16} fill={C.sheetBlue} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1000 690 Q 1200 670 1640 690 L 1640 800 L 1060 800 Q 1020 740 1000 690 Z" fill={C.blanket} stroke={KRP.ink} strokeWidth={5} />
        <rect x={300} y={800} width={1460} height={60} fill={C.bedFrame} stroke={KRP.ink} strokeWidth={6} />
        {/* スリッパ */}
        <ellipse cx={720} cy={930} rx={60} ry={20} fill={C.blanketDark} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={850} cy={940} rx={60} ry={20} fill={C.blanketDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(10 850 940)" />
      </g>
    </Frame>
  );
};

// ---- 文#206 【図】 ただし、その効果は、人に触れてもらうほどでは、ありませんでした。
// 設計: 2本の棒グラフ (世界=夜の机のノートの方眼紙に鉛筆で)。「人」の棒が高く、「モノ」の棒は低いがゼロではない。数字は書かない
// どこ: 夜の机を真上から。読書灯の光の輪の中に方眼ノートが開いている。マグカップ・消しゴムとそのカス・鉛筆の削りかす。
// 演出: 鉛筆が自分で棒を描いていく。左の「人」は高く、右の「モノ」は低いけれど、底からちゃんと立ち上がっている (点線の目盛りで「ゼロではない」を示す)。右ページには手を置く絵とくまの落書き。
// 動き: f4〜20 「人」の棒が斜線で塗られて伸びる・f22〜36 「モノ」の棒・鉛筆の先が棒の上を往復・マグの湯気・カメラはほんの少し回る。
const Yw206: React.FC<{ f: number }> = ({ f }) => {
  const b1 = easeOut(seg(f, 4, 20));
  const b2 = easeOut(seg(f, 22, 36));
  const base = 640;
  const h1 = 420 * b1, h2 = 150 * b2;
  const drawing2 = f >= 22;
  const tipX = drawing2 ? 755 + Math.sin(f / 1.5) * 50 : 525 + Math.sin(f / 1.5) * 50;
  const tipY = drawing2 ? base - h2 : base - h1;
  const rot = lerp(-1, 1, seg(f, 0, 42));
  return (
    <Frame f={f} seed={3206} bg={C.deskNight} dark>
      <defs>
        <radialGradient id="l5b206lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.lampLight} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.lampLight} stopOpacity={0} />
        </radialGradient>
        <clipPath id="l5b206c1"><rect x={450} y={base - h1} width={150} height={h1} /></clipPath>
        <clipPath id="l5b206c2"><rect x={680} y={base - h2} width={150} height={h2} /></clipPath>
      </defs>
      <g transform={`rotate(${rot} 960 480)`}>
        {/* 夜の机 */}
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.deskNight} />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M -100 ${40 + i * 170} q 500 ${rnd(3206, i) * 30 - 15} 1000 0 t 1000 0`} fill="none" stroke={C.deskNightDark} strokeWidth={5} opacity={0.6} />
        ))}
        <ellipse cx={960} cy={460} rx={1000} ry={620} fill="url(#l5b206lamp)" />
        {/* ノート (見開き) */}
        <rect x={252} y={92} width={1416} height={716} rx={10} fill={C.sheetEdge} stroke={KRP.ink} strokeWidth={6} />
        <rect x={260} y={80} width={700} height={716} rx={8} fill={C.sheet} stroke={KRP.ink} strokeWidth={5} />
        <rect x={960} y={80} width={700} height={716} rx={8} fill={C.sheet} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.grid} strokeWidth={2}>
          {Array.from({ length: 28 }, (_, i) => <line key={`v${i}`} x1={285 + i * 50} y1={100} x2={285 + i * 50} y2={780} />)}
          {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={270} y1={110 + i * 50} x2={1650} y2={110 + i * 50} />)}
        </g>
        <rect x={944} y={80} width={32} height={716} fill={C.sheetEdge} opacity={0.6} />
        {/* リングの穴の代わりの綴じ糸 */}
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={960} y1={130 + i * 120} x2={960} y2={160 + i * 120} stroke={C.graphite} strokeWidth={4} />)}
        {/* 軸 (鉛筆線) */}
        <path d={`M 400 160 L 400 ${base} L 900 ${base}`} fill="none" stroke={C.graphite} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 386 180 L 400 156 L 414 180" fill="none" stroke={C.graphite} strokeWidth={6} strokeLinecap="round" />
        {/* 棒 (輪郭+斜線) */}
        {h1 > 2 && <rect x={450} y={base - h1} width={150} height={h1} fill="none" stroke={C.graphite} strokeWidth={6} />}
        <g clipPath="url(#l5b206c1)" stroke={C.graphite} strokeWidth={4} opacity={0.75}>
          {Array.from({ length: 24 }, (_, i) => <line key={i} x1={430} y1={base - i * 24} x2={630} y2={base - i * 24 - 120} />)}
        </g>
        {h2 > 2 && <rect x={680} y={base - h2} width={150} height={h2} fill="none" stroke={C.graphite} strokeWidth={6} />}
        <g clipPath="url(#l5b206c2)" stroke={C.graphite} strokeWidth={4} opacity={0.75}>
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={660} y1={base - i * 24} x2={860} y2={base - i * 24 - 120} />)}
        </g>
        {/* ゼロではない、を示す点線の目盛り */}
        <g opacity={seg(f, 34, 42)} stroke={KRP.red} strokeWidth={4} strokeLinecap="round">
          <line x1={400} y1={base - 150} x2={680} y2={base - 150} strokeDasharray="10 10" />
          <path d={`M 870 ${base - 8} L 870 ${base - 142} M 858 ${base - 128} L 870 ${base - 146} L 882 ${base - 128} M 858 ${base - 22} L 870 ${base - 4} L 882 ${base - 22}`} fill="none" />
        </g>
        <TagPlate x={525} y={700} text="人" size={50} t={seg(f, 2, 10)} />
        <TagPlate x={755} y={700} text="モノ" size={50} t={seg(f, 20, 28)} />
        {/* 右ページの落書き: 肩に手を置く2人 / くま */}
        <g fill="none" stroke={C.graphite} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={1110} cy={250} r={44} />
          <circle cx={1250} cy={260} r={40} />
          <path d="M 1060 400 Q 1060 310 1110 300 Q 1160 310 1160 400 M 1200 400 Q 1200 320 1250 306 Q 1300 320 1300 400" />
          <path d="M 1150 330 Q 1190 312 1214 318" />
          <circle cx={1214} cy={320} r={10} />
          <circle cx={1460} cy={280} r={50} />
          <circle cx={1420} cy={232} r={18} /><circle cx={1500} cy={232} r={18} />
          <ellipse cx={1460} cy={380} rx={56} ry={50} />
          <circle cx={1444} cy={272} r={4} fill={C.graphite} /><circle cx={1476} cy={272} r={4} fill={C.graphite} />
          <path d="M 1040 520 q 60 -14 120 0 t 120 0 t 120 0 t 120 0 M 1040 580 q 60 -14 120 0 t 120 0 t 120 0" opacity={0.5} />
        </g>
        {/* 鉛筆 (描いている) */}
        <g transform={`translate(${tipX} ${tipY}) rotate(-35)`}>
          <polygon points="0,0 24,-60 -24,-60" fill={C.tea} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <polygon points="0,0 8,-20 -8,-20" fill={C.graphite} />
          <rect x={-24} y={-420} width={48} height={360} fill={C.pencil} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-8} y1={-420} x2={-8} y2={-60} stroke={C.pencilDark} strokeWidth={4} />
          <rect x={-26} y={-470} width={52} height={50} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-24} y={-520} width={48} height={52} rx={10} fill={C.chalkPink} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* マグカップ (右上) と湯気 */}
        <g transform="translate(1790 200)">
          <circle r={90} fill={C.report} stroke={KRP.ink} strokeWidth={7} />
          <circle r={68} fill={C.shelfDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={84} y={-20} width={50} height={40} rx={18} fill={C.report} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M -20 -10 q ${10 + Math.sin(f / 6) * 10} -40 0 -80 q ${-10 - Math.sin(f / 6) * 10} -40 0 -80`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        </g>
        {/* 消しゴムとカス */}
        <rect x={120} y={860} width={130} height={60} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(-14 185 890)" />
        <rect x={120} y={860} width={50} height={60} fill={KRP.blue} stroke={KRP.ink} strokeWidth={5} transform="rotate(-14 185 890)" />
        {[[300, 880], [330, 900], [280, 920]].map(([ex, ey], i) => <ellipse key={i} cx={ex} cy={ey} rx={12} ry={5} fill={C.sheetEdge} stroke={KRP.ink} strokeWidth={2} />)}
      </g>
    </Frame>
  );
};

// ---- 文#207 【山】 モノは、人の代わりになる。でも、人ほどではない。
// 設計: ★この章の核心。夜の部屋。ぬいぐるみを抱えた人 (#205 と同じ人) の後ろの壁に、ぬいぐるみの影が「人の形」に少しだけ似て映る。でも本当の人ではない。静かな画面
// どこ: #205 と同じ部屋を、左のスタンドの灯りの側から。ベッドに座る人の右後ろに広い壁。灯りが壁に大きな影を落とす。
// 演出: 壁には本人の大きな影。その胸から、抱いたくまの影がゆっくり大きくなり、本人の影の肩にもたれる「もう1人」のような形になる。でも頭には小さな耳の出っぱりが残り、輪郭はぼんやり。本物の人ではない。本人はその影を静かに見る。
// 動き: f6〜36 くまの影が育って人の形に寄る (耳は薄く残る)・スタンドの灯りがかすかにゆらぐ・カメラはゆっくり壁へパン。
const Yw207: React.FC<{ f: number }> = ({ f }) => {
  const px = 700, py = 800, ps = 1.7;
  const g = easeInOut(seg(f, 6, 36));
  const flick = 1 + Math.sin(f / 3.3) * 0.02;
  const pan = lerp(0, -60, easeInOut(seg(f, 0, 42)));
  // 本人の影 (壁) と、くまの影
  const shx = 1300;
  const bx = lerp(1300, 1490, g), byy = lerp(560, 410, g), bs = lerp(0.9, 1.5, g);
  return (
    <Frame f={f} seed={3207} bg={C.night} dark>
      <defs>
        <radialGradient id="l5b207lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.lampLight} stopOpacity={0.7} />
          <stop offset="0.6" stopColor={C.nightWallLit} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.nightWall} stopOpacity={0} />
        </radialGradient>
        <filter id="l5b207blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <g transform={`translate(${pan} 0)`}>
        <rect x={-100} y={-100} width={W + 300} height={H + 200} fill={C.nightWall} />
        <ellipse cx={1000} cy={420} rx={1100 * flick} ry={640 * flick} fill="url(#l5b207lamp)" />
        <rect x={-100} y={800} width={W + 300} height={400} fill={C.nightFloor} />
        {/* 壁の影 */}
        <g filter="url(#l5b207blur)">
          <g fill={C.shadow} opacity={0.55}>
            <circle cx={shx} cy={300} r={118} />
            <path d={`M ${shx - 200} 760 Q ${shx - 210} 470 ${shx - 120} 440 L ${shx + 120} 440 Q ${shx + 210} 470 ${shx + 200} 760 Z`} />
          </g>
          {/* くまの影: 初めはくまの形 → 人に似た形へ */}
          <g transform={`translate(${bx} ${byy}) scale(${bs}) rotate(${lerp(0, -14, g)})`} fill={C.shadow}>
            {/* くまの耳 (薄く残る) */}
            <circle cx={-46} cy={-112} r={lerp(24, 19, g)} opacity={lerp(0.55, 0.42, g)} />
            <circle cx={46} cy={-112} r={lerp(24, 19, g)} opacity={lerp(0.55, 0.42, g)} />
            <circle cx={0} cy={-62} r={lerp(60, 70, g)} opacity={0.5} />
            {/* くまの丸い体 → 人の肩 */}
            <ellipse cx={0} cy={44} rx={70} ry={64} opacity={0.5 * (1 - g)} />
            <path d="M -120 160 Q -128 40 -60 14 L 60 14 Q 128 40 120 160 Z" opacity={0.48 * g} />
          </g>
        </g>
        {/* 壁の額 (2人の写真の跡。中は空) */}
        <rect x={1660} y={150} width={180} height={140} fill="none" stroke={KRP.ink} strokeWidth={6} opacity={0.6} />
        <rect x={1676} y={166} width={148} height={108} fill={C.night} opacity={0.4} />
        {/* スタンドと小机 */}
        <rect x={60} y={620} width={300} height={24} fill={C.bedFrame} stroke={KRP.ink} strokeWidth={5} />
        <rect x={80} y={644} width={22} height={200} fill={C.bedFrame} stroke={KRP.ink} strokeWidth={4} />
        <rect x={318} y={644} width={22} height={200} fill={C.bedFrame} stroke={KRP.ink} strokeWidth={4} />
        <rect x={198} y={460} width={20} height={160} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={208} cy={616} rx={60} ry={12} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 130 470 L 160 340 L 256 340 L 286 470 Z" fill={C.lampLight} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={208} cy={420} r={110 * flick} fill={C.lampLight} opacity={0.25} />
        {/* ベッド */}
        <rect x={300} y={690} width={1300} height={110} rx={16} fill={C.sheetBlue} stroke={KRP.ink} strokeWidth={6} />
        {/* 本人 (くまを抱えて影を見る) */}
        <Person x={px} y={py} s={ps} f={f} face="normal" cloth={C.pj} clothDark={C.pjDark} pose="hold" gaze={[8, -4]} lean={3} still />
        <L5bBear x={px} y={py - 165} s={0.86} sq={0.2} rot={4} />
        <circle cx={px - 70} cy={py - 150} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={px + 70} cy={py - 150} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {/* 前の布団 */}
        <path d="M 300 720 Q 700 700 1600 720 L 1600 800 L 300 800 Z" fill={C.blanket} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 400 740 Q 800 730 1500 744" fill="none" stroke={C.blanketDark} strokeWidth={4} />
        <rect x={300} y={800} width={1300} height={60} fill={C.bedFrame} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={560} cy={940} rx={60} ry={20} fill={C.blanketDark} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={690} cy={950} rx={60} ry={20} fill={C.blanketDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(10 690 950)" />
        <ellipse cx={1100} cy={1000} rx={700} ry={70} fill={C.blanketDark} opacity={0.35} />
      </g>
    </Frame>
  );
};

// ---- 文#208 【並】 では、スクイーズを握ると、心は落ち着くのでしょうか。
// 設計: 机の上の `Squishy` を、手がそっと握ろうとして止まる。`QMark`。静かな画面
// どこ: 夕方の書斎の机。奥にブラインドの窓 (夕方の光の縞)、机にマグと閉じたノート。
// 演出: 机の真ん中のスクイーズ (2026年の半透明のねこ) へ、右上から手がそっと伸びて、指を開いたまま手前で止まる。？がふわりと浮かぶ。
// 動き: f4〜24 手が近づく・f24〜 止まってかすかにためらう (指が少し閉じて、開く)・f26〜34 ？・スクイーズがぷるっと揺れる・カメラは少し寄る。
const Yw208: React.FC<{ f: number }> = ({ f }) => {
  const reach = easeInOut(seg(f, 4, 24));
  const hesitate = f > 24 ? Math.sin((f - 24) / 4) * 0.12 : 0;
  const hx = lerp(1720, 1300, reach), hy = lerp(80, 320, reach) + (f > 24 ? Math.sin(f / 5) * 3 : 0);
  const z = lerp(1.0, 1.05, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={3208} bg={C.eveWall}>
      <g transform={cam(960, 560, z)}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.eveWall} />
        {/* ブラインドの窓 */}
        <rect x={160} y={60} width={540} height={420} fill={C.dusk} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={166} y={66 + i * 29} width={528} height={17} fill={C.blind} stroke={C.libWallDark} strokeWidth={2} />
        ))}
        {/* 壁に落ちる光の縞 */}
        {Array.from({ length: 6 }, (_, i) => (
          <polygon key={i} points={`${1000 + i * 30},${120 + i * 48} ${1300 + i * 30},${120 + i * 48} ${1340 + i * 30},${140 + i * 48} ${1040 + i * 30},${140 + i * 48}`} fill={C.sun} opacity={0.3 + Math.sin(f / 15) * 0.04} />
        ))}
        {/* 机 */}
        <path d="M -100 540 L 2020 540 L 2020 1200 L -100 1200 Z" fill={C.deskEve} stroke={KRP.ink} strokeWidth={6} />
        {[620, 740, 900].map((yy, i) => (
          <path key={i} d={`M -100 ${yy} q 520 ${i % 2 ? 8 : -8} 1050 0 t 1050 0`} fill="none" stroke={C.deskEveDark} strokeWidth={4} opacity={0.55} />
        ))}
        <rect x={-100} y={530} width={W + 200} height={20} fill={C.deskEveDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 閉じたノートとペン */}
        <g transform="rotate(-6 320 700)">
          <rect x={150} y={620} width={340} height={230} rx={8} fill={C.report} stroke={KRP.ink} strokeWidth={6} />
          <rect x={150} y={620} width={30} height={230} fill={C.reportDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={210} y={780} width={260} height={16} rx={6} fill={C.graphite} stroke={KRP.ink} strokeWidth={3} transform="rotate(-10 340 788)" />
        </g>
        {/* マグ */}
        <g transform="translate(1640 700)">
          <rect x={-70} y={-150} width={140} height={150} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 70 -120 q 54 0 54 44 q 0 44 -54 44" fill="none" stroke={KRP.ink} strokeWidth={10} />
          <ellipse cx={0} cy={-150} rx={70} ry={14} fill={C.shelfDark} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M -10 -170 q ${10 + Math.sin(f / 6) * 8} -36 0 -72 q ${-10 - Math.sin(f / 6) * 8} -36 0 -72`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          <ellipse cx={0} cy={6} rx={84} ry={14} fill={KRP.ink} opacity={0.12} />
        </g>
        {/* 主役: スクイーズ */}
        <Squishy x={900} y={760} s={1.6} f={f} squeeze={0} />
        {/* 手の影 (机の上) */}
        <ellipse cx={hx - 120} cy={772} rx={150 * (0.6 + reach * 0.4)} ry={20} fill={KRP.ink} opacity={0.1 * reach} />
        {/* そっと伸びる手 */}
        <L5bReachHand x={hx} y={hy} s={1.3} rot={-28} curl={0.25 + hesitate} cloth={C.participant} clothDark={C.participantDark} />
        {/* ？ */}
        <QMark x={830} y={230} s={1.3} f={f} t={seg(f, 26, 34)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_197: (f) => <Yw197 f={f} />,
  yw_198: (f) => <Yw198 f={f} />,
  yw_199: (f) => <Yw199 f={f} />,
  yw_200: (f) => <Yw200 f={f} />,
  yw_201: (f) => <Yw201 f={f} />,
  yw_202: (f) => <Yw202 f={f} />,
  yw_203: (f) => <Yw203 f={f} />,
  yw_204: (f) => <Yw204 f={f} />,
  yw_205: (f) => <Yw205 f={f} />,
  yw_206: (f) => <Yw206 f={f} />,
  yw_207: (f) => <Yw207 f={f} />,
  yw_208: (f) => <Yw208 f={f} />,
};

export const YW_G2_MOTIFS: string[] = [
  "yw_197",
  "yw_198",
  "yw_199",
  "yw_200",
  "yw_201",
  "yw_202",
  "yw_203",
  "yw_204",
  "yw_205",
  "yw_206",
  "yw_207",
  "yw_208",
];

export const yawaG2Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
