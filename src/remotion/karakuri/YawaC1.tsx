// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#38〜#49 (12文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-2.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L1a。
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
  // 夕方のアルタイ
  duskTop: "#7E86A8", duskMid: "#E7A47A", duskLow: "#F6D59A",
  mtFar: "#9A93AE", mtMid: "#7A7494", snow: "#F4F1EE", snowShade: "#C9C6D6",
  forest: "#3F5A45", forestDark: "#2C4234", grass: "#A9B36A", grassDark: "#7F8B4C",
  stone: "#A39C90", stoneDark: "#7C7569", river: "#9DB9C9",
  // 発掘
  soil: "#6E5640", soilDark: "#4C3A2A", soilLight: "#8F7458",
  log: "#8A6440", logDark: "#5E4329", logEnd: "#C79E6E",
  ice: "#CFE7F2", iceDeep: "#8CC3DC", iceCore: "#F2FBFF",
  parka: "#C2562F", parkaDark: "#8E3B1F", glove: "#7B6A4A", gloveDark: "#5A4C33",
  // 白鳥
  felt: "#F5F0E4", feltShade: "#DCD3C0", featherBlack: "#2E2A27", rust: "#A2543A",
  deerHair: "#9A6B43",
  // 博物館
  museumDark: "#2A2622", museumWall: "#3A332D", velvet: "#1F1C1A", velvetFold: "#35302B",
  wallWarm: "#D9CBB0", wallWainscot: "#A88F6E", panelGreen: "#7E8B7A",
  hallWall: "#C9D6C4", hallWallDark: "#A9B9A3", column: "#EFEBE0", gilt: "#C9A548",
  parquet: "#B58A5C", parquetDark: "#8C6640",
  marble: "#E9E4DA", marbleVein: "#B9B2A6", caseGlass: "#D7E6EA",
  coat: "#F4F1EA", coatDark: "#D4CFC4",
  plush: "#FBF8F1", plushShade: "#E4DED0", beak: "#F0A33A",
  // 地図
  parch: "#E8D3A6", parchDark: "#C9AD78", parchBurn: "#8E6A3C", sea: "#A9C4C0", seaDeep: "#7FA3A0",
  // エジプト
  skyHot: "#F5E6B8", skyHot2: "#EBD69C", sand: "#E2C58E", sandDark: "#C8A56B", sandLight: "#EED9AE",
  mudbrick: "#B98A5E", mudbrickDark: "#8E6644", nile: "#6FA3B5", palm: "#5E7D3E", palmTrunk: "#8A6A44",
  papyrus: "#E6D3A0",
  // 布人形
  linen: "#DCCDAE", linenShade: "#BFAE8A", linenDark: "#9C8A68", woolRed: "#B0675A", woolBrown: "#7E5A48",
  bead: "#3E7FB8", beadDeep: "#22588A", board: "#56616B", boardDark: "#434C54", tableWood: "#8E6A48",
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

// -------------------------------------------------------------------
// L1aSwan — パジリクのフェルトの白鳥 (横向き・右を向く)
//   x,y: 脚の下端 / s=1 で高さ約380px・幅約390px
//   turn: 台座ごと回る見かけ (1=真横, 0.3=斜め) / section: 断面図にする
//   glow: 後ろの光 0〜1 / clipId: section のときの毛のクリップ id
// -------------------------------------------------------------------
const SWAN_BODY = "M -195 -205 Q -150 -185 -120 -182 Q -40 -205 60 -195 Q 140 -185 145 -140 Q 140 -95 70 -82 Q -30 -68 -110 -92 Q -160 -110 -175 -150 Q -185 -180 -195 -205 Z";
const SWAN_NECK = "M 96 -168 Q 150 -228 122 -268 Q 92 -308 114 -344";
const L1aSwan: React.FC<{
  x: number; y: number; s?: number; f: number; turn?: number; section?: boolean; glow?: number; clipId?: string;
}> = ({ x, y, s = 1, f, turn = 1, section = false, glow = 0, clipId = "l1a-swan-clip" }) => {
  const sway = Math.sin(f / 16) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * turn} ${s})`}>
      {glow > 0.01 && (
        <g opacity={glow}>
          <ellipse cx={-10} cy={-190} rx={260} ry={220} fill={YP.glow} opacity={0.28} />
          <ellipse cx={-10} cy={-170} rx={190} ry={130} fill={YP.glowCore} opacity={0.4} />
        </g>
      )}
      {/* 木の棒の脚 */}
      {[-34, 16].map((lx, i) => (
        <g key={i}>
          <rect x={lx} y={section ? -150 : -96} width={16} height={section ? 150 : 96} rx={5}
            fill={YP.wood} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={lx + 8} y1={-80} x2={lx + 8} y2={-6} stroke={YP.woodDark} strokeWidth={3} opacity={0.6} />
        </g>
      ))}
      <g transform={`rotate(${sway} 0 -140)`}>
        {/* 体 */}
        <path d={SWAN_BODY} fill={C.felt} stroke={KRP.ink} strokeWidth={6.5} strokeLinejoin="round" />
        {/* 首 (墨の太線の上にフェルトの線) */}
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
              {[-34, 16].map((lx, i) => (
                <rect key={i} x={lx} y={-150} width={16} height={80} rx={5} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
              ))}
            </g>
            <path d={SWAN_NECK} fill="none" stroke={C.deerHair} strokeWidth={16} strokeLinecap="round" />
            <path d={SWAN_NECK} fill="none" stroke={YP.furDark} strokeWidth={3} strokeDasharray="6 8" />
            <circle cx={122} cy={-350} r={15} fill={C.deerHair} />
          </>
        ) : (
          <>
            {/* 翼 */}
            <path d="M -110 -172 Q -10 -194 78 -150 Q 20 -116 -96 -122 Q -130 -142 -110 -172 Z"
              fill={C.feltShade} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
            {/* 縫い目 */}
            <path d="M -96 -160 Q -10 -176 58 -146" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="8 7" opacity={0.55} />
            <path d="M -150 -112 Q -40 -80 100 -98" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="8 7" opacity={0.5} />
            {/* 赤茶の模様 (翼のふちと尾) */}
            {Array.from({ length: 6 }, (_, i) => (
              <path key={i} d={`M ${-90 + i * 26} -128 l 10 -16 l 10 16 Z`} fill={C.rust} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
            <path d="M -190 -200 Q -168 -186 -150 -184 L -160 -170 Q -176 -178 -186 -190 Z" fill={C.rust} opacity={0.85} />
            {/* 毛羽立ち */}
            {Array.from({ length: 30 }, (_, i) => {
              const a = (i / 30) * Math.PI * 2;
              const px = -25 + Math.cos(a) * 168, py = -140 + Math.sin(a) * 60;
              return <line key={i} x1={px} y1={py} x2={px + Math.cos(a) * 9} y2={py + Math.sin(a) * 9}
                stroke={KRP.ink} strokeWidth={3} opacity={0.3} strokeLinecap="round" />;
            })}
            {[[-250], [-290], [-320]].map(([ny], i) => (
              <line key={i} x1={i === 1 ? 96 : 140} y1={ny} x2={i === 1 ? 88 : 149} y2={ny - 6}
                stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
            ))}
          </>
        )}
        {/* くちばしと目 */}
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
// L1aDuck — 今の白いアヒルのぬいぐるみ (右を向く)。x,y: 底 / s=1 で高さ約270px
// -------------------------------------------------------------------
const L1aDuck: React.FC<{ x: number; y: number; s?: number; f: number; squash?: number }> = ({ x, y, s = 1, f, squash = 0 }) => {
  const jig = Math.sin(f / 4.5) * 0.015;
  const sx = 1 + squash * 0.16 + jig, sy = 1 - squash * 0.14 - jig;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sx} ${s * sy})`}>
      <ellipse cx={0} cy={4} rx={130} ry={14} fill={KRP.ink} opacity={0.15} />
      {/* 足 */}
      <ellipse cx={-30} cy={-6} rx={34} ry={13} fill={C.beak} stroke={KRP.ink} strokeWidth={4.5} />
      <ellipse cx={40} cy={-6} rx={34} ry={13} fill={C.beak} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 体 */}
      <path d="M -132 -110 Q -150 -150 -122 -150 Q -110 -130 -90 -150 Q 0 -190 90 -150 Q 140 -110 112 -40 Q 80 0 0 -2 Q -90 0 -120 -50 Q -136 -80 -132 -110 Z"
        fill={C.plush} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 縫い目 */}
      <path d="M -100 -60 Q 0 -30 100 -70" fill="none" stroke={C.plushShade} strokeWidth={4} strokeDasharray="8 7" />
      {/* 翼 */}
      <path d="M -70 -120 Q 0 -140 40 -100 Q 0 -66 -60 -80 Q -84 -100 -70 -120 Z" fill={C.plushShade} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 布のタグ */}
      <rect x={-130} y={-70} width={26} height={38} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-14 -117 -51)" />
      <line x1={-124} y1={-58} x2={-110} y2={-61} stroke={KRP.red} strokeWidth={3} />
      {/* 頭 */}
      <circle cx={56} cy={-206} r={66} fill={C.plush} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 40 -270 q 6 -20 18 -4 q 8 -16 14 2" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      <path d="M 104 -200 Q 150 -204 160 -186 Q 140 -170 104 -178 Z" fill={C.beak} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={70} cy={-218} r={8} fill={KRP.ink} />
      <circle cx={72} cy={-221} r={3} fill={KRP.white} />
      <ellipse cx={72} cy={-186} rx={14} ry={8} fill={KRP.red} opacity={0.25} />
    </g>
  );
};

// -------------------------------------------------------------------
// L1aDoll — オクシュリンコスの麻の布人形。x,y: 底 / s=1 で高さ約380px
//   light: 光の位置 (-1〜1、布の上をすべる) / buried: 描くのは上だけでよい場面用ではなく、埋めるのはシーン側
// -------------------------------------------------------------------
const DOLL_BODY = "M -60 -238 Q -84 -226 -84 -190 L -96 -24 Q -98 0 -70 2 L 70 2 Q 98 0 96 -24 L 84 -190 Q 84 -226 60 -238 Q 30 -250 0 -250 Q -30 -250 -60 -238 Z";
const L1aDoll: React.FC<{ x: number; y: number; s?: number; f: number; light?: number; rot?: number; clipId: string }> = ({
  x, y, s = 1, f, light = -2, rot = 0, clipId,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <clipPath id={clipId}>
      <path d={DOLL_BODY} />
      <ellipse cx={0} cy={-312} rx={64} ry={68} />
      <rect x={-162} y={-232} width={324} height={44} rx={22} />
    </clipPath>
    {/* 腕 = 丸めた布の帯 (背中を回って左右に出る) */}
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
    {/* 首 */}
    <rect x={-26} y={-262} width={52} height={30} fill={C.linen} stroke={KRP.ink} strokeWidth={4.5} />
    {/* 体 */}
    <path d={DOLL_BODY} fill={C.linen} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
    {/* 頭 */}
    <ellipse cx={0} cy={-312} rx={64} ry={68} fill={C.linen} stroke={KRP.ink} strokeWidth={6} />
    {/* 織り目 (細かい格子) と光 */}
    <g clipPath={`url(#${clipId})`}>
      <g stroke={C.linenDark} strokeWidth={2} opacity={0.32}>
        {Array.from({ length: 34 }, (_, i) => <line key={`v${i}`} x1={-170 + i * 10} y1={-390} x2={-170 + i * 10} y2={10} />)}
        {Array.from({ length: 40 }, (_, i) => <line key={`h${i}`} x1={-170} y1={-390 + i * 10} x2={170} y2={-390 + i * 10} />)}
      </g>
      {/* ほつれ・しみ */}
      <ellipse cx={46} cy={-90} rx={30} ry={18} fill={C.linenDark} opacity={0.22} />
      <ellipse cx={-50} cy={-150} rx={18} ry={26} fill={C.linenDark} opacity={0.18} />
      {/* すべる光 */}
      <ellipse cx={light * 140} cy={-200} rx={70} ry={260} fill={KRP.white} opacity={0.32}
        transform={`rotate(14 ${light * 140} -200)`} />
    </g>
    {/* 縫い目 */}
    <path d="M -88 -180 L -94 -20" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="7 7" opacity={0.6} />
    <path d="M 88 -180 L 94 -20" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="7 7" opacity={0.6} />
    <path d="M -60 -370 Q 0 -390 60 -370" fill="none" stroke={KRP.ink} strokeWidth={3} strokeDasharray="7 7" opacity={0.5} />
    {/* 顔の毛糸 (色あせ) */}
    <g stroke={C.woolBrown} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.8}>
      <path d="M -36 -332 q 12 -8 24 0" /><path d="M 12 -332 q 12 -8 24 0" />
      <line x1={-24} y1={-316} x2={-24} y2={-308} /><line x1={24} y1={-316} x2={24} y2={-308} />
      <path d="M 0 -310 L -4 -288 L 4 -286" />
    </g>
    <path d="M -18 -270 Q 0 -262 18 -270" fill="none" stroke={C.woolRed} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
    {/* 体の毛糸 (縦の線とジグザグの帯) */}
    <g stroke={C.woolRed} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7}>
      <line x1={-30} y1={-232} x2={-36} y2={-10} />
      <line x1={30} y1={-232} x2={36} y2={-10} />
      <path d="M -82 -120 l 20 -14 l 20 14 l 20 -14 l 20 14 l 20 -14 l 20 14 l 20 -14 l 20 14" />
    </g>
    <path d="M -86 -60 L 88 -60" stroke={C.woolBrown} strokeWidth={4.5} opacity={0.6} />
    {/* 頭の左の青いガラス玉 (糸で留める) */}
    <path d="M -54 -340 Q -70 -346 -76 -334" fill="none" stroke={C.woolBrown} strokeWidth={3} />
    <circle cx={-78} cy={-326} r={13} fill={C.bead} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={-78} cy={-326} r={6} fill={C.beadDeep} />
    <circle cx={-82} cy={-331} r={3.5} fill={KRP.white} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9))} />
  </g>
);

// -------------------------------------------------------------------
// L1aGlove — 作業手袋の手 (右から差し込む)。x,y: 手首 / rot / s
// -------------------------------------------------------------------
const L1aGlove: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string; dark?: string; children?: React.ReactNode }> = ({
  x, y, s = 1, rot = 0, color = C.glove, dark = C.gloveDark, children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {/* 袖 */}
    <rect x={0} y={-56} width={420} height={112} rx={30} fill={C.parka} stroke={KRP.ink} strokeWidth={7} />
    <path d="M 60 -50 Q 70 0 60 50 M 160 -54 Q 172 0 160 54" fill="none" stroke={C.parkaDark} strokeWidth={5} />
    <rect x={-30} y={-50} width={60} height={100} rx={14} fill={dark} stroke={KRP.ink} strokeWidth={6} />
    {children}
    {/* 手 */}
    <path d="M -30 -46 Q -110 -60 -150 -30 Q -176 -10 -160 10 Q -130 28 -110 22 Q -120 50 -90 54 Q -40 56 -30 44 Z"
      fill={color} stroke={KRP.ink} strokeWidth={6.5} strokeLinejoin="round" />
    <path d="M -150 -6 Q -120 -10 -100 0 M -140 18 Q -110 12 -92 22" fill="none" stroke={dark} strokeWidth={4.5} strokeLinecap="round" />
    {/* 親指 */}
    <path d="M -60 -46 Q -96 -86 -128 -74 Q -140 -60 -110 -46" fill={color} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

// -------------------------------------------------------------------
// L1aPalm — ヤシの木。x,y: 根元 / s=1 で高さ約200px
// -------------------------------------------------------------------
const L1aPalm: React.FC<{ x: number; y: number; s?: number; f: number; ph?: number }> = ({ x, y, s = 1, f, ph = 0 }) => {
  const w = Math.sin(f / 14 + ph) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -6 0 Q -2 -100 ${10 + w * 0.5} -190 L ${22 + w * 0.5} -190 Q 10 -100 8 0 Z`} fill={C.palmTrunk} stroke={KRP.ink} strokeWidth={4} />
      {[-150, -110, -60, -20, 20, 70, 120, 160].map((a, i) => {
        const r = (a + w) * Math.PI / 180;
        const ex = 16 + Math.sin(r) * 90, ey = -190 - Math.cos(r) * 60 + Math.abs(Math.sin(r)) * 40;
        const d = `M 16 -190 Q ${16 + Math.sin(r) * 50} ${-216 - Math.cos(r) * 30} ${ex} ${ey}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={KRP.ink} strokeWidth={19} strokeLinecap="round" />
            <path d={d} fill="none" stroke={C.palm} strokeWidth={12} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#38 【山】 第2章、2000年前の、ぬいぐるみ。
// 設計: 章扉。シベリアのアルタイの山並み (雪をかぶった峰・針葉樹林・草原の谷)。谷の草原に、石を積んだ円い古墳 (クルガン) がいくつも並ぶ。夕方の光。`ChapterDoor` (num=2)。題字の後ろには第1章と同じ薄いクリームの帯 (読みやすさ)
// どこ: 夕方のアルタイ山中の草原の谷。雪の峰・カラマツの森・川。谷底に石積みの円い古墳が並ぶ
// 演出: 古墳群を画面の左に大きく。右下に章題。夕日が峰に沈みかけ、谷を金色に染める
// 動き: カメラがゆっくり谷へ寄る / 夕日が沈む / 鳥の列が横切る / 草がそよぐ / 古墳の石に光が走る
const L1aRidge = (seed: number, base: number, amp: number, n: number) => {
  const pts: string[] = [`M -40 ${H + 40}`, `L -40 ${base}`];
  for (let i = 0; i <= n; i++) {
    const x = -40 + (i / n) * (W + 80);
    const y = base - (i % 2 === 0 ? rnd(seed, i) * amp * 0.45 : amp * (0.6 + rnd(seed + 1, i) * 0.4));
    pts.push(`L ${x} ${y}`);
  }
  pts.push(`L ${W + 40} ${H + 40} Z`);
  return pts.join(" ");
};
const L1aKurgan: React.FC<{ x: number; y: number; rx: number; seed: number; lit: number }> = ({ x, y, rx, seed, lit }) => {
  const ry = rx * 0.3;
  return (
    <g>
      <ellipse cx={x} cy={y + ry * 0.4} rx={rx * 1.05} ry={ry * 0.9} fill={C.grassDark} opacity={0.5} />
      <path d={`M ${x - rx} ${y} Q ${x - rx * 0.8} ${y - ry * 1.5} ${x} ${y - ry * 1.6} Q ${x + rx * 0.8} ${y - ry * 1.5} ${x + rx} ${y} Q ${x} ${y + ry * 0.9} ${x - rx} ${y} Z`}
        fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: Math.round(rx / 7) }, (_, i) => {
        const a = rnd(seed, i) * Math.PI;
        const rr = Math.sqrt(rnd(seed + 3, i));
        const sx = x + Math.cos(a) * rx * 0.9 * rr * (rnd(seed + 5, i) > 0.5 ? 1 : -1);
        const sy = y - Math.sin(a) * ry * 1.2 * rr + ry * 0.15;
        const sz = rx * 0.05 + rnd(seed + 7, i) * rx * 0.04;
        return <ellipse key={i} cx={sx} cy={sy} rx={sz} ry={sz * 0.65} fill={rnd(seed + 9, i) > 0.5 ? C.stoneDark : KRP.silver}
          stroke={KRP.ink} strokeWidth={3} />;
      })}
      {/* 夕日のふち光 */}
      <path d={`M ${x - rx * 0.55} ${y - ry * 1.4} Q ${x} ${y - ry * 1.75} ${x + rx * 0.7} ${y - ry * 1.3}`}
        fill="none" stroke={C.duskLow} strokeWidth={rx * 0.06} strokeLinecap="round" opacity={0.55 + lit * 0.4} />
    </g>
  );
};
const Yw038: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = lerp(1, 1.06, cam);
  const door = seg(f, 4, 20);
  const sunY = lerp(250, 300, seg(f, 0, 42));
  const shine = seg(f, 14, 34);
  return (
    <Frame f={f} seed={3038} bg={C.duskMid}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={2} title="2000年前の、ぬいぐるみ" t={door} left={1000} top={560} />
      </>}>
      <defs>
        <linearGradient id="l1a38-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.duskTop} />
          <stop offset="0.55" stopColor={C.duskMid} />
          <stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
        <clipPath id="l1a38-snow">
          <path d={`M -40 -40 L ${W + 40} -40 L ${W + 40} 250 ${Array.from({ length: 24 }, (_, i) => `L ${W + 40 - (i + 1) * 83} ${235 + (i % 2) * 38}`).join(" ")} Z`} />
        </clipPath>
      </defs>
      <g transform={`translate(560 640) scale(${sc}) translate(-560 -640)`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill="url(#l1a38-sky)" />
        {/* 夕日 */}
        <circle cx={1480} cy={sunY} r={120} fill={C.duskLow} opacity={0.5} />
        <circle cx={1480} cy={sunY} r={70} fill={KRP.white} opacity={0.85} stroke={C.duskMid} strokeWidth={6} />
        {/* 雲 */}
        {[[300, 140, 1], [900, 90, 0.8], [1700, 160, 0.9]].map(([cx, cy, k], i) => (
          <g key={i} transform={`translate(${cx + f * 0.6} ${cy}) scale(${k})`} opacity={0.75}>
            <path d="M -140 0 Q -120 -40 -70 -30 Q -40 -70 20 -50 Q 80 -70 110 -30 Q 160 -26 150 0 Z" fill={C.duskLow} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 遠い雪の峰 */}
        <path d={L1aRidge(381, 420, 300, 22)} fill={C.mtFar} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={L1aRidge(381, 420, 300, 22)} fill={C.snow} clipPath="url(#l1a38-snow)" />
        <path d={L1aRidge(381, 420, 300, 22)} fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 峰のかげ (夕日と反対側) */}
        <path d={L1aRidge(382, 470, 200, 16)} fill={C.mtMid} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* カラマツの森 */}
        {Array.from({ length: 64 }, (_, i) => {
          const tx = -20 + i * 31 + rnd(383, i) * 14;
          const ty = 548 + rnd(384, i) * 30;
          const th = 70 + rnd(385, i) * 46;
          return (
            <path key={i} d={`M ${tx} ${ty - th} L ${tx - th * 0.28} ${ty} L ${tx + th * 0.28} ${ty} Z`}
              fill={i % 3 ? C.forest : C.forestDark} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
          );
        })}
        {/* 草原の谷 */}
        <path d={`M -40 560 Q 500 530 960 560 Q 1500 590 1960 550 L 1960 1120 L -40 1120 Z`} fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
        {/* 川 */}
        <path d="M 1960 600 Q 1500 640 1200 620 Q 900 600 820 680 Q 760 760 980 860 Q 1200 960 1100 1120 L 1240 1120 Q 1320 960 1080 850 Q 880 760 920 690 Q 980 640 1250 650 Q 1600 660 1960 630 Z"
          fill={C.river} stroke={KRP.ink} strokeWidth={4.5} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={1000 + i * 150 + ((f * 2) % 60)} y1={640 + (i % 2) * 6} x2={1040 + i * 150 + ((f * 2) % 60)} y2={640 + (i % 2) * 6}
            stroke={KRP.white} strokeWidth={4} opacity={0.6} strokeLinecap="round" />
        ))}
        {/* 古墳 (クルガン) の列 */}
        <L1aKurgan x={860} y={600} rx={70} seed={386} lit={shine} />
        <L1aKurgan x={660} y={640} rx={110} seed={387} lit={shine} />
        <L1aKurgan x={190} y={660} rx={120} seed={388} lit={shine} />
        <L1aKurgan x={430} y={780} rx={260} seed={389} lit={shine} />
        {/* 古墳を走る夕日の光 */}
        <ellipse cx={lerp(200, 700, shine)} cy={730} rx={120} ry={30} fill={C.duskLow} opacity={0.35 * Math.sin(shine * Math.PI)} />
        {/* 草のそよぎ */}
        {Array.from({ length: 40 }, (_, i) => {
          const gx = rnd(390, i) * 960, gy = 820 + rnd(391, i) * 220;
          const w = Math.sin(f / 9 + i) * 6;
          return <path key={i} d={`M ${gx} ${gy} q ${w} -20 ${w * 2} -34 M ${gx + 8} ${gy} q ${w} -16 ${w * 2 + 6} -26`}
            fill="none" stroke={C.grassDark} strokeWidth={4} strokeLinecap="round" />;
        })}
        {/* 鳥の列 */}
        {Array.from({ length: 5 }, (_, i) => {
          const bx = -100 + f * 14 + i * 50, by = 200 + i * 18 + Math.sin(f / 5 + i) * 6;
          const flap = Math.sin(f / 3 + i) * 8;
          return <path key={i} d={`M ${bx - 18} ${by - flap} Q ${bx - 8} ${by - 6} ${bx} ${by} Q ${bx + 8} ${by - 6} ${bx + 18} ${by - flap}`}
            fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />;
        })}
      </g>
    </Frame>
  );
};

// ---- 文#39 【山】 まずは、シベリアの山の中にある、古いお墓です。
// 設計: 古墳の発掘現場に寄る。石を取り除いた円い古墳の中央に、丸太で組んだ墓室が見える。永久凍土の氷 (青白い塊) が光る。防寒着の発掘者 Person。左上の隅に `AgeDial` (s≈0.55、label「2000年以上前」)
// どこ: 山あいの草原の発掘現場。石を取りのけた円い古墳の真ん中に、丸太の墓室が口を開けている
// 演出: 墓室を画面の中央に大きく。周りに取りのけた石の山・測量の糸・道具。防寒着の発掘者が身を乗り出して墓室を指す
// 動き: カメラが墓室へ寄る / 年代ダイヤルが回って止まる / 永久凍土の氷がきらっと光る / 発掘者の白い息 / 小雪
const Yw039: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const sc = lerp(1, 1.08, cam);
  const spin = 320 * (1 - easeOut(seg(f, 0, 26)));
  const glint = seg(f, 20, 34);
  const breath = (f % 40) / 40;
  // 墓室 (斜め上から見た丸太の箱)
  const cx = 900, cy = 640;
  return (
    <Frame f={f} seed={3039} bg={C.grass}>
      <g transform={`translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* 空と峰 */}
        <rect x={-40} y={-40} width={W + 80} height={420} fill={KRP.blueSoft} />
        <path d={L1aRidge(391, 300, 200, 18)} fill={C.mtFar} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={L1aRidge(392, 350, 90, 26)} fill={C.forest} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        {/* 地面 */}
        <path d="M -40 330 Q 960 300 1960 340 L 1960 1120 L -40 1120 Z" fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
        {[[260, 420, 120], [1500, 400, 160], [1720, 520, 90], [120, 560, 80]].map(([sx, sy, r], i) => (
          <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * 0.22} fill={C.snow} stroke={KRP.ink} strokeWidth={3.5} opacity={0.9} />
        ))}
        {/* 調査のテント */}
        <g transform="translate(1560 360)">
          <path d="M -120 0 L 0 -110 L 120 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -20 0 L 0 -110 L 20 0 Z" fill={C.feltShade} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-110} x2={0} y2={-140} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -140 l 30 8 l -30 8 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 古墳の外の石の輪 */}
        <ellipse cx={cx} cy={cy} rx={600} ry={230} fill={C.grassDark} opacity={0.4} />
        {Array.from({ length: 54 }, (_, i) => {
          const a = (i / 54) * Math.PI * 2;
          const r = 1 + rnd(393, i) * 0.12;
          const sx = cx + Math.cos(a) * 560 * r, sy = cy + Math.sin(a) * 210 * r;
          const sz = 22 + rnd(394, i) * 16;
          return <ellipse key={i} cx={sx} cy={sy} rx={sz} ry={sz * 0.62} fill={i % 3 ? C.stone : KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />;
        })}
        {/* 掘り下げた穴 */}
        <ellipse cx={cx} cy={cy} rx={470} ry={170} fill={C.soilLight} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={cx} cy={cy + 14} rx={400} ry={140} fill={C.soil} stroke={KRP.ink} strokeWidth={5} />
        {/* 測量の糸と杭 */}
        {[-300, -100, 100, 300].map((dx) => (
          <line key={dx} x1={cx + dx} y1={cy - 160} x2={cx + dx} y2={cy + 160} stroke={KRP.white} strokeWidth={3} opacity={0.75} />
        ))}
        <line x1={cx - 470} y1={cy} x2={cx + 470} y2={cy} stroke={KRP.white} strokeWidth={3} opacity={0.75} />
        {/* 丸太の墓室 (外枠) */}
        <path d={`M ${cx - 250} ${cy - 50} L ${cx + 190} ${cy - 70} L ${cx + 260} ${cy + 60} L ${cx - 190} ${cy + 86} Z`} fill={C.soilDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 奥の壁 (丸太を重ねる) */}
        {[0, 1, 2].map((k) => (
          <rect key={`b${k}`} x={cx - 250} y={cy - 50 - k * 24 - 24} width={440} height={26} rx={12}
            fill={k % 2 ? C.log : C.logDark} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(-2.6 ${cx - 30} ${cy - 60})`} />
        ))}
        {/* 手前の壁 */}
        {[0, 1].map((k) => (
          <rect key={`n${k}`} x={cx - 200} y={cy + 66 - k * 24} width={470} height={28} rx={13}
            fill={k ? C.log : C.logDark} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(-3.3 ${cx + 30} ${cy + 76})`} />
        ))}
        {/* 丸太の木口 */}
        {[[cx - 252, cy - 64], [cx - 252, cy - 88], [cx + 266, cy + 52], [cx + 266, cy + 28]].map(([lx, ly], i) => (
          <g key={i}>
            <circle cx={lx} cy={ly} r={14} fill={C.logEnd} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lx} cy={ly} r={6} fill="none" stroke={C.logDark} strokeWidth={2.5} />
          </g>
        ))}
        {/* 墓室の中の永久凍土の氷 */}
        {[[cx - 120, cy + 10, 70], [cx + 60, cy + 24, 90], [cx + 170, cy - 10, 50], [cx - 200, cy + 40, 40]].map(([ix, iy, r], i) => (
          <g key={i}>
            <path d={`M ${ix - r} ${iy} L ${ix - r * 0.5} ${iy - r * 0.5} L ${ix + r * 0.4} ${iy - r * 0.55} L ${ix + r} ${iy - r * 0.05} L ${ix + r * 0.6} ${iy + r * 0.35} L ${ix - r * 0.6} ${iy + r * 0.35} Z`}
              fill={C.ice} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M ${ix - r * 0.5} ${iy - r * 0.2} L ${ix + r * 0.3} ${iy - r * 0.3}`} stroke={C.iceCore} strokeWidth={6} strokeLinecap="round" />
            <ellipse cx={ix} cy={iy} rx={r * 0.4} ry={r * 0.16} fill={C.iceDeep} opacity={0.5} />
          </g>
        ))}
        {/* 氷のきらめき */}
        {[[cx + 60, cy - 8], [cx - 130, cy - 20], [cx + 180, cy - 34]].map(([gx, gy], i) => {
          const k = Math.max(0, Math.sin((glint * 2 + i * 0.3) * Math.PI)) * (0.6 + 0.4 * Math.abs(Math.sin(f / 5 + i)));
          return (
            <g key={i} transform={`translate(${gx} ${gy}) scale(${0.4 + k * 0.9})`} opacity={0.2 + k * 0.8}>
              <path d="M 0 -30 L 6 -6 L 30 0 L 6 6 L 0 30 L -6 6 L -30 0 L -6 -6 Z" fill={C.iceCore} stroke={C.iceDeep} strokeWidth={3} />
            </g>
          );
        })}
        <ellipse cx={cx} cy={cy + 10} rx={260} ry={70} fill={C.iceCore} opacity={0.12 + 0.12 * glint} />
        {/* 道具: バケツ・スコップ・ふるい・土の山 */}
        <path d="M 260 760 Q 330 640 420 760 Z" fill={C.soilLight} stroke={KRP.ink} strokeWidth={5} />
        <g transform="translate(230 760)">
          <path d="M -40 -70 L 40 -70 L 30 0 L -30 0 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -40 -70 Q 0 -120 40 -70" fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform="rotate(18 420 680)">
          <rect x={414} y={540} width={12} height={150} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 396 690 L 444 690 L 438 740 Q 420 756 402 740 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 発掘者 (防寒着・毛糸の帽子) */}
        <g>
          <Person x={1460} y={830} s={1.25} f={f} face="surprised" pose="point" pointDir={-1} lean={-8}
            cloth={C.parka} clothDark={C.parkaDark} hair="none" gaze={[-6, 4]} />
          <g transform={`translate(1460 ${830 + Math.sin(f / 13) * 3}) scale(1.25) rotate(-8)`}>
            <path d="M -66 -248 Q -66 -300 0 -304 Q 66 -300 66 -248 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-70} y={-256} width={140} height={20} rx={8} fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={0} cy={-312} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 白い息 */}
        <g opacity={(1 - breath) * 0.8}>
          <circle cx={1330 - breath * 70} cy={520 - breath * 30} r={14 + breath * 22} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={3} />
          <circle cx={1300 - breath * 90} cy={500 - breath * 40} r={8 + breath * 14} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={3} />
        </g>
        {/* 小雪 */}
        {Array.from({ length: 26 }, (_, i) => {
          const sx = rnd(395, i) * W, sy = ((rnd(396, i) * H + f * (3 + rnd(397, i) * 2)) % 900);
          return <circle key={i} cx={sx + Math.sin(f / 10 + i) * 10} cy={sy} r={4 + rnd(398, i) * 3} fill={KRP.white} opacity={0.85} />;
        })}
      </g>
      {/* 年代ダイヤル (カメラの外。隅に固定) */}
      <AgeDial x={215} y={300} s={0.55} spin={spin} label="2000年以上前" handle={spin * 2} />
    </Frame>
  );
};

// ---- 文#40 【並】 2000年以上前のお墓から、こんなものが出てきました。
// 設計: 墓室の中を覗き込む構図。丸太の壁、氷、土の中から白い何かが半分のぞく (まだ白鳥の全形は見せない)。発掘者の手袋の手が土を払う。光の筋
// どこ: 墓室の中 (丸太の壁の内側)。上から光の筋が差し込み、床の凍った土に氷の塊が埋まる
// 演出: 土の中から白いフェルトの丸い背中と首の付け根だけが半分のぞく (全形は見せない)。右から手袋の手がハケで土を払う
// 動き: ハケが左右に動き、土くれが飛ぶ / 土が払われて白い部分が少しずつ広がる / 光の筋にちりが舞う / カメラがじわっと寄る
const Yw040: React.FC<{ f: number }> = ({ f }) => {
  const sweep = Math.sin(f / 3.2);
  const reveal = easeOut(seg(f, 4, 40));
  const sc = lerp(1.0, 1.07, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={3040} bg={C.soilDark}>
      <defs>
        <linearGradient id="l1a40-beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={YP.glowCore} stopOpacity={0.75} />
          <stop offset="1" stopColor={YP.glowCore} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={`translate(900 600) scale(${sc}) translate(-900 -600)`}>
        {/* 奥の丸太の壁 */}
        <rect x={-40} y={-40} width={W + 80} height={620} fill={C.logDark} />
        {Array.from({ length: 6 }, (_, k) => (
          <g key={k}>
            <rect x={-60} y={-30 + k * 96} width={W + 120} height={92} rx={44} fill={k % 2 ? C.log : C.logDark} stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 7 }, (_, j) => (
              <path key={j} d={`M ${60 + j * 280 + rnd(401, k * 7 + j) * 80} ${-6 + k * 96} q 60 ${10 + rnd(402, j) * 10} 140 0`}
                fill="none" stroke={C.logDark} strokeWidth={4} opacity={0.7} />
            ))}
          </g>
        ))}
        {/* 丸太のすき間の氷 */}
        {[[220, 160], [1320, 250], [700, 350], [1700, 450], [380, 440]].map(([ix, iy], i) => (
          <g key={i}>
            <path d={`M ${ix - 60} ${iy} L ${ix - 20} ${iy - 26} L ${ix + 50} ${iy - 20} L ${ix + 70} ${iy + 6} L ${ix + 20} ${iy + 24} L ${ix - 40} ${iy + 20} Z`}
              fill={C.ice} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <line x1={ix - 30} y1={iy - 8} x2={ix + 30} y2={iy - 12} stroke={C.iceCore} strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
        {/* 床の凍った土 */}
        <path d="M -40 520 Q 400 490 900 510 Q 1400 530 1960 500 L 1960 1120 L -40 1120 Z" fill={C.soil} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 34 }, (_, i) => (
          <ellipse key={i} cx={rnd(403, i) * W} cy={560 + rnd(404, i) * 480} rx={10 + rnd(405, i) * 20} ry={6 + rnd(406, i) * 9}
            fill={i % 2 ? C.soilDark : C.soilLight} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 大きな氷の塊 (左) */}
        <path d="M 60 760 L 140 620 L 330 600 L 420 700 L 360 820 L 120 840 Z" fill={C.ice} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 150 650 L 300 640 M 140 700 L 340 690" stroke={C.iceCore} strokeWidth={8} strokeLinecap="round" />
        <path d="M 200 760 L 380 730" stroke={C.iceDeep} strokeWidth={5} />
        {/* 土から半分のぞく白いフェルト (丸い背中と首の付け根) */}
        <g>
          <path d={`M 560 ${700 - reveal * 20} Q 640 ${520 - reveal * 30} 880 ${500 - reveal * 30} Q 1080 ${510 - reveal * 30} 1160 ${640 - reveal * 20} L 1160 720 L 560 720 Z`}
            fill={C.felt} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          {/* 首の付け根 (右上へ持ち上がる) */}
          <path d={`M 1080 ${560 - reveal * 30} Q 1140 ${470 - reveal * 40} 1120 ${420 - reveal * 50}`} fill="none" stroke={KRP.ink} strokeWidth={62} strokeLinecap="round" />
          <path d={`M 1080 ${560 - reveal * 30} Q 1140 ${470 - reveal * 40} 1120 ${420 - reveal * 50}`} fill="none" stroke={C.felt} strokeWidth={48} strokeLinecap="round" />
          {/* 毛羽立ちと縫い目 */}
          <path d={`M 640 ${640 - reveal * 20} Q 860 ${560 - reveal * 30} 1080 ${610 - reveal * 20}`} fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeDasharray="10 9" opacity={0.5} />
          {Array.from({ length: 16 }, (_, i) => {
            const t = i / 15;
            const px = lerp(600, 1140, t), py = 600 - Math.sin(t * Math.PI) * (100 + reveal * 30) - reveal * 10;
            return <line key={i} x1={px} y1={py} x2={px + 4} y2={py - 10} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />;
          })}
          {/* まだかぶっている土 */}
          <path d={`M 520 740 Q 600 ${640 + reveal * 50} 700 ${660 + reveal * 40} Q 820 ${600 + reveal * 80} 960 ${640 + reveal * 60} Q 1080 ${600 + reveal * 70} 1200 740 Z`}
            fill={C.soil} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse key={i} cx={560 + i * 64} cy={700 + rnd(407, i) * 30} rx={14} ry={8} fill={C.soilDark} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 飛ぶ土くれ */}
        {Array.from({ length: 8 }, (_, i) => {
          const ph = ((f * 0.07 + rnd(408, i)) % 1);
          const sx = 1000 + sweep * 60 - ph * (120 + i * 18);
          const sy = 560 - Math.sin(ph * Math.PI) * (70 + i * 10) + ph * 60;
          return <ellipse key={i} cx={sx} cy={sy} rx={7} ry={5} fill={C.soilDark} stroke={KRP.ink} strokeWidth={2.5} opacity={1 - ph} />;
        })}
        {/* 手袋の手とハケ */}
        <L1aGlove x={1260 + sweep * 50} y={520} s={1.1} rot={-18 + sweep * 6}>
          <rect x={-250} y={-12} width={140} height={24} rx={10} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -250 -22 L -320 -34 L -320 34 L -250 22 Z" fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={-320} y1={-30 + i * 12} x2={-368} y2={-34 + i * 13} stroke={C.logDark} strokeWidth={5} strokeLinecap="round" />
          ))}
        </L1aGlove>
        {/* 光の筋 */}
        <path d="M 260 -40 L 560 -40 L 1180 760 L 640 780 Z" fill="url(#l1a40-beam)" />
        {Array.from({ length: 16 }, (_, i) => {
          const t = rnd(409, i);
          const dx = Math.sin(f / 13 + i) * 16;
          return <circle key={i} cx={lerp(400, 900, t) + rnd(410, i) * 200 + dx} cy={lerp(40, 720, t) - ((f * 1.2 + i * 30) % 60)} r={3 + rnd(411, i) * 3}
            fill={KRP.white} opacity={0.7} />;
        })}
      </g>
    </Frame>
  );
};

// ---- 文#41 【山】 フェルトでできた、白い白鳥です。
// 設計: ★白鳥の見せ場。白いフェルトの白鳥 (高さ約30cm の物を画面の高さの6割で大きく) が、黒い布の展示台の上にスポットライトを浴びて立つ。フェルトの毛羽立ち・縫い目・黒い くちばしと目・赤茶の模様・木の棒の脚まで描く。f で光が差し、白鳥がゆっくり回る (台座ごと)
// どこ: 暗い博物館の一室。ガラスケースの中、黒い布をかけた円い展示台
// 演出: フェルトの白鳥を画面の高さの6割で大きく、スポットライトの真下に。左の暗がりで見学者が息をのむ
// 動き: スポットライトがぱっと点く / 台座ごと白鳥がゆっくり回って真横を向く / 光の中のちりが舞う / ガラスの映り込みが動く / カメラが少し下から寄る
const Yw041: React.FC<{ f: number }> = ({ f }) => {
  const spot = easeOut(seg(f, 2, 16));
  const turnT = easeInOut(seg(f, 8, 40));
  const ang = lerp(68, 0, turnT);
  const turn = Math.max(0.3, Math.cos((ang * Math.PI) / 180));
  const sc = lerp(1.04, 1, easeInOut(seg(f, 0, 42)));
  const px = 960, py = 806;
  return (
    <Frame f={f} seed={3041} bg={C.museumDark} dark>
      <defs>
        <linearGradient id="l1a41-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={YP.glowCore} stopOpacity={0.7} />
          <stop offset="1" stopColor={YP.glowCore} stopOpacity={0.15} />
        </linearGradient>
        <radialGradient id="l1a41-pool">
          <stop offset="0" stopColor={YP.glowCore} stopOpacity={0.6} />
          <stop offset="1" stopColor={YP.glowCore} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(960 600) scale(${sc}) translate(-960 -600)`}>
        {/* 壁の羽目板 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.museumWall} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-20 + i * 230} y={120} width={200} height={600} rx={8} fill="none" stroke={C.museumDark} strokeWidth={6} />
        ))}
        <rect x={-40} y={760} width={W + 80} height={360} fill={C.museumDark} />
        {/* ガラスケースの枠 */}
        <rect x={560} y={30} width={800} height={880} fill="none" stroke={KRP.grayDark} strokeWidth={6} opacity={0.7} />
        {/* スポットライト本体と光の円錐 */}
        <g>
          <rect x={920} y={-30} width={80} height={60} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 930 30 L 990 30 L 1006 56 L 914 56 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <path d={`M 916 56 L 1004 56 L ${px + 360} ${py} L ${px - 360} ${py} Z`} fill="url(#l1a41-cone)" opacity={spot * 0.55} />
        <ellipse cx={px} cy={py} rx={420} ry={90} fill="url(#l1a41-pool)" opacity={spot} />
        {/* 黒い布の展示台 */}
        <path d={`M ${px - 330} ${py} L ${px - 350} ${H + 40} L ${px + 350} ${H + 40} L ${px + 330} ${py} Z`} fill={C.velvet} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${px - 290 + i * 82} ${py + 40} Q ${px - 300 + i * 82} ${py + 160} ${px - 296 + i * 84} ${H + 40}`} fill="none" stroke={C.velvetFold} strokeWidth={8} />
        ))}
        <ellipse cx={px} cy={py} rx={330} ry={58} fill={C.velvetFold} stroke={KRP.ink} strokeWidth={6} />
        {/* 回転台の目印 (真鍮の鋲が回る) */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + (ang * Math.PI) / 180;
          const front = Math.sin(a) > 0;
          return <circle key={i} cx={px + Math.cos(a) * 300} cy={py + Math.sin(a) * 48} r={front ? 9 : 6}
            fill={YP.brass} stroke={KRP.ink} strokeWidth={3} opacity={front ? 1 : 0.5} />;
        })}
        {/* 白鳥 */}
        <ellipse cx={px} cy={py + 4} rx={200 * turn + 60} ry={18} fill={KRP.ink} opacity={0.45} />
        <L1aSwan x={px} y={py} s={1.9} f={f} turn={turn} glow={spot * 0.3} />
        {/* 光の当たる縁取り (右上から) */}
        {/* ちり */}
        {Array.from({ length: 22 }, (_, i) => {
          const t = rnd(412, i);
          const yy = ((t * 760 + f * (1.2 + rnd(413, i))) % 760) + 60;
          const span = lerp(46, 360, (yy - 56) / (py - 56));
          return <circle key={i} cx={px + (rnd(414, i) - 0.5) * 2 * span + Math.sin(f / 11 + i) * 8} cy={yy} r={2.5 + rnd(415, i) * 2.5}
            fill={YP.glowCore} opacity={spot * 0.8} />;
        })}
        {/* ガラスの映り込み */}
        {[0, 1].map((i) => {
          const gx = 600 + ((f * 6 + i * 380) % 760);
          return <path key={i} d={`M ${gx} 60 L ${gx + 40} 60 L ${gx - 160} 880 L ${gx - 200} 880 Z`} fill={KRP.white} opacity={0.06} />;
        })}
        {/* 見学者 (左の暗がり、光でふちが浮く) */}
        <g>
          <Person x={250} y={930} s={1.2} f={f} face="surprised" gaze={[6, -2]} lean={4} pose="hold"
            cloth={KRP.blueDeep} clothDark="#34558A" />
        </g>
        {/* 名札 */}
        <TagPlate x={1590} y={640} text="フェルトの白鳥" size={40} t={seg(f, 24, 36)} />
      </g>
    </Frame>
  );
};

// ---- 文#42 【図】 高さは、およそ30センチ。中には、シカの毛が詰められていたとされます。
// 設計: 白鳥の**断面図** (博物館の解説パネルの上=世界)。外側のフェルトの層、中に詰まった茶色の毛のもじゃもじゃ、脚の木の棒。左に高さの目盛り「約30cm」。札「フェルト」「シカの毛 (とされる)」
// どこ: 博物館の壁にかかった解説パネル (緑の壁・ピン留めのクリーム色の板)
// 演出: パネルいっぱいに白鳥の断面図。外のフェルトの層・中の茶色い毛・脚の木の棒。左に高さの目盛り
// 動き: 光の刃が左から右へ走って白鳥を「切る」と中身が現れる / 毛がもじゃもじゃ揺れる / 目盛りが下から伸びる / 札が順に出る
const Yw042: React.FC<{ f: number }> = ({ f }) => {
  const cut = easeInOut(seg(f, 4, 24));
  const cutX = lerp(560, 1500, cut);
  const rule = easeOut(seg(f, 18, 32));
  const sx = 1040, sy = 790, ss = 1.62;
  const top = sy - 378 * ss;
  return (
    <Frame f={f} seed={3042} bg={C.panelGreen}>
      {/* 壁 */}
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.panelGreen} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={-20 + i * 170} y1={-20} x2={-20 + i * 170} y2={H + 20} stroke={KRP.ink} strokeWidth={3} opacity={0.12} />
      ))}
      {/* パネル */}
      <rect x={150} y={70} width={1620} height={900} rx={14} fill={KRP.ink} opacity={0.25} transform="translate(10 12)" />
      <rect x={150} y={70} width={1620} height={900} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
      <rect x={150} y={70} width={1620} height={56} rx={14} fill={C.rust} stroke={KRP.ink} strokeWidth={6} />
      <text x={960} y={112} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>断面</text>
      {[[180, 150], [1740, 150], [180, 940], [1740, 940]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={11} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 方眼の地紋 */}
      <g stroke={KRP.blueSoft} strokeWidth={2}>
        {Array.from({ length: 32 }, (_, i) => <line key={`v${i}`} x1={180 + i * 50} y1={140} x2={180 + i * 50} y2={950} />)}
        {Array.from({ length: 17 }, (_, i) => <line key={`h${i}`} x1={170} y1={150 + i * 50} x2={1750} y2={150 + i * 50} />)}
      </g>
      {/* 床の線 */}
      <line x1={600} y1={sy} x2={1500} y2={sy} stroke={KRP.ink} strokeWidth={5} />
      {/* 断面前の白鳥 (切り口の右側) */}
      <clipPath id="l1a42-right"><rect x={cutX} y={0} width={W} height={H} /></clipPath>
      <clipPath id="l1a42-left"><rect x={0} y={0} width={cutX} height={H} /></clipPath>
      <g clipPath="url(#l1a42-right)">
        <L1aSwan x={sx} y={sy} s={ss} f={f} />
      </g>
      <g clipPath="url(#l1a42-left)">
        <L1aSwan x={sx} y={sy} s={ss} f={f} section clipId="l1a42-hair" />
      </g>
      {/* 光の刃 */}
      {cut > 0 && cut < 1 && (
        <g>
          <line x1={cutX} y1={top - 40} x2={cutX} y2={sy + 20} stroke={YP.glow} strokeWidth={14} opacity={0.6} />
          <line x1={cutX} y1={top - 40} x2={cutX} y2={sy + 20} stroke={KRP.white} strokeWidth={4} />
        </g>
      )}
      {/* 高さの目盛り */}
      <g>
        <rect x={470} y={sy - (sy - top) * rule} width={44} height={(sy - top) * rule} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 7 }, (_, i) => {
          const yy = sy - ((sy - top) * i) / 6;
          if (yy < sy - (sy - top) * rule - 1) return null;
          return <line key={i} x1={470} y1={yy} x2={i % 2 ? 494 : 514} y2={yy} stroke={KRP.ink} strokeWidth={4} />;
        })}
        <line x1={514} y1={top} x2={sx + 100} y2={top} stroke={KRP.ink} strokeWidth={3} strokeDasharray="10 8" opacity={rule} />
        <TagPlate x={340} y={480} text="約30cm" size={42} t={seg(f, 28, 38)} />
      </g>
      {/* 引き出し線と札 */}
      <g opacity={seg(f, 24, 30)}>
        <line x1={sx + 140 * ss} y1={sy - 170 * ss} x2={1500} y2={300} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={sx + 140 * ss} cy={sy - 170 * ss} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <TagPlate x={1560} y={290} text="フェルト" size={42} t={seg(f, 26, 34)} />
      <g opacity={seg(f, 30, 36)}>
        <line x1={sx - 60} y1={sy - 140 * ss} x2={1380} y2={640} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={sx - 60} cy={sy - 140 * ss} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <TagPlate x={1500} y={650} text="シカの毛 (とされる)" size={34} t={seg(f, 32, 40)} />
      <g opacity={seg(f, 34, 40)}>
        <line x1={sx + 24 * ss} y1={sy - 40 * ss} x2={1230} y2={760} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={1310} y={770} text="木の棒" size={32} t={seg(f, 36, 42)} />
    </Frame>
  );
};

// ---- 文#43 【並】 見た目は、まるでぬいぐるみです。
// 設計: 白鳥の横に、今のぬいぐるみ (白いアヒルのぬいぐるみ) を並べて「≒」。2つがそっくり。並べた台の上で両方が f でぽよんと揺れる。背景は博物館の展示室の壁
// どこ: 博物館の展示室。羽目板の壁・天井のレールのスポット・布をかけた長い展示台 (#44 と同じ場所・同じ時間の続き)
// 演出: 左に2000年前の白鳥、右に今のアヒルのぬいぐるみ。間に大きな「≒」。2つの大きさ・白さ・丸みがそっくり
// 動き: 2つが同時にぽよんと跳ねて着地でつぶれる / 「≒」がぽんと出て脈打つ / カメラが少し引く
const L1aExhibitRoom: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wallWarm} />
    {/* 天井のレールとスポット */}
    <rect x={-40} y={-40} width={W + 80} height={90} fill={C.wallWainscot} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-40} y={46} width={W + 80} height={16} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
    {[420, 960, 1500].map((lx, i) => (
      <g key={i}>
        <rect x={lx - 26} y={60} width={52} height={60} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${i === 1 ? 0 : i ? 14 : -14} ${lx} 62)`} />
        <path d={`M ${lx - 30} 120 L ${lx + 30} 120 L ${lx + 230} 720 L ${lx - 230} 720 Z`} fill={YP.glowCore} opacity={0.22 + Math.sin(f / 20 + i) * 0.03} />
      </g>
    ))}
    {/* 壁の額 (地図と古い織物) */}
    <g transform="translate(160 180)">
      <rect width={200} height={150} fill={C.parch} stroke={KRP.ink} strokeWidth={6} />
      <rect x={14} y={14} width={172} height={122} fill="none" stroke={C.gilt} strokeWidth={4} />
      <path d="M 30 110 Q 80 50 120 80 Q 150 100 170 50" fill="none" stroke={C.seaDeep} strokeWidth={5} />
    </g>
    <g transform="translate(1580 170)">
      <rect width={180} height={210} fill={C.rust} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M 20 ${30 + i * 36} l 35 -18 l 35 18 l 35 -18 l 35 18`} fill="none" stroke={C.felt} strokeWidth={5} />)}
    </g>
    {/* 腰板 */}
    <rect x={-40} y={600} width={W + 80} height={500} fill={C.wallWainscot} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={20 + i * 240} y={630} width={200} height={140} rx={6} fill="none" stroke={C.parquetDark} strokeWidth={5} />)}
    {/* 長い展示台 */}
    <rect x={200} y={720} width={1520} height={40} rx={8} fill={C.feltShade} stroke={KRP.ink} strokeWidth={6} />
    <path d="M 210 760 L 1710 760 L 1690 1100 L 230 1100 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={6} />
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${290 + i * 150} 770 Q ${280 + i * 150} 900 ${296 + i * 150} 1100`} fill="none" stroke="#34558A" strokeWidth={6} />)}
  </g>
);
const Yw043: React.FC<{ f: number }> = ({ f }) => {
  const hopT = seg(f, 14, 28);
  const hop = Math.sin(hopT * Math.PI) * 70;
  const land = seg(f, 28, 40);
  const squash = land > 0 && land < 1 ? Math.sin(land * Math.PI) * (1 - land) * 1.6 : 0;
  const eq = pop(seg(f, 22, 34)) * (1 + Math.sin(f / 6) * 0.03);
  const sc = lerp(1.08, 1, easeOut(seg(f, 0, 30)));
  return (
    <Frame f={f} seed={3043} bg={C.wallWarm}>
      <g transform={`translate(960 600) scale(${sc}) translate(-960 -600)`}>
        <L1aExhibitRoom f={f} />
        {/* 白鳥 */}
        <ellipse cx={600} cy={724} rx={200} ry={14} fill={KRP.ink} opacity={0.2 * (1 - hop / 120)} />
        <g transform={`translate(600 ${720 - hop}) scale(${1 + squash * 0.12} ${1 - squash * 0.1}) translate(-600 ${-720})`}>
          <L1aSwan x={600} y={720} s={1.18} f={f} />
        </g>
        {/* アヒルのぬいぐるみ */}
        <g transform={`translate(0 ${-hop})`}>
          <L1aDuck x={1330} y={720} s={1.7} f={f} squash={squash} />
        </g>
        {/* 跳ねの線 */}
        {hopT > 0 && hopT < 1 && [600, 1330].map((bx) => (
          <g key={bx} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
            <line x1={bx - 60} y1={740} x2={bx - 80} y2={770} />
            <line x1={bx + 60} y1={740} x2={bx + 80} y2={770} />
          </g>
        ))}
        {/* ≒ */}
        <g transform={`translate(965 470) scale(${eq})`}>
          <circle r={96} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <text y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill={KRP.red}>≒</text>
        </g>
        {/* ラベル */}
        <TagPlate x={600} y={786} text="2000年以上前" size={32} t={seg(f, 4, 14)} />
        <TagPlate x={1330} y={786} text="今" size={32} t={seg(f, 8, 18)} />
      </g>
    </Frame>
  );
};

// ---- 文#44 【並】 ところが、これはおもちゃではありません。
// 設計: #43 の並びのまま、ぬいぐるみの方に赤い `XMark`、「おもちゃ」の札に赤い斜線。白鳥は静かに立っている。学芸員の Person (白衣・glasses) が人差し指を立てて「ちがう」の顔 (pose="point")
// どこ: #43 と同じ展示室・同じ台 (続き)
// 演出: 白鳥は左で静かに立つ。真ん中のアヒルに赤い×、頭上の「おもちゃ」札に赤い斜線。右から白衣の学芸員が指を立てて「ちがう」
// 動き: 学芸員がすっと入ってきて指さす / ×がぽんと付く / 斜線がシュッと引かれる / アヒルがしょんぼり傾く / 白鳥に光がそっと当たる
const Yw044: React.FC<{ f: number }> = ({ f }) => {
  const enter = easeOut(seg(f, 0, 14));
  const xm = seg(f, 14, 24);
  const slash = easeOut(seg(f, 24, 34));
  const droop = easeOut(seg(f, 20, 36)) * 8;
  const swanLight = seg(f, 26, 42);
  const wag = Math.sin(f / 2.6) * 6 * seg(f, 12, 18);
  return (
    <Frame f={f} seed={3044} bg={C.wallWarm}>
      <L1aExhibitRoom f={f} />
      {/* 白鳥 (静か・光が当たる) */}
      <ellipse cx={560} cy={500} rx={260} ry={300} fill={YP.glowCore} opacity={0.3 * swanLight} />
      <L1aSwan x={560} y={720} s={1.18} f={f} glow={swanLight * 0.5} />
      {/* アヒル (しょんぼり) */}
      <g transform={`rotate(${-droop} 1060 720)`}>
        <L1aDuck x={1060} y={720} s={1.45} f={f} />
      </g>
      <XMark x={1080} y={500} s={1.7} t={xm} />
      {/* 「おもちゃ」の札と赤い斜線 */}
      <TagPlate x={1070} y={200} text="おもちゃ" size={52} t={seg(f, 6, 14)} />
      {slash > 0 && (
        <line x1={920} y1={250} x2={920 + 300 * slash} y2={250 - 100 * slash} stroke={KRP.red} strokeWidth={16} strokeLinecap="round" opacity={0.92} />
      )}
      {/* 学芸員 (白衣・めがね) */}
      <g transform={`translate(${lerp(260, 0, enter)} 0)`}>
        <Person x={1560} y={900} s={1.32} f={f} face="normal" pose="point" pointDir={-1} glasses lean={-5}
          cloth={C.coat} clothDark={C.coatDark} gaze={[-6, 0]} />
        {/* 白衣のえり・ポケットのペン */}
        <g transform={`translate(1560 ${900 + Math.sin(f / 13) * 3}) scale(1.32) rotate(-5)`}>
          <path d="M -24 -160 L 0 -120 L 24 -160" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <rect x={24} y={-136} width={22} height={26} fill={C.coatDark} stroke={KRP.ink} strokeWidth={3.5} />
          <line x1={32} y1={-146} x2={32} y2={-126} stroke={KRP.blueDeep} strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* 「ちがう」の指ふり線 */}
        <g transform={`translate(${1560 - 120 + wag} 690)`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={seg(f, 12, 18)}>
          <path d="M -40 -40 q -14 18 0 36" fill="none" />
          <path d="M -60 -54 q -22 30 0 62" fill="none" />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#45 【山】 お墓に納められた、馬車の飾りだったのです。
// 設計: 墓に納められた**四輪の儀礼用の馬車**の復元図 (木の大きな車輪4つ・フェルトで覆った屋根の骨組み)。屋根の上の角に白鳥が4か所とまっている (数は「いくつか」でよい。札では数を言わない)。f で白鳥が1羽ずつ光る。背景は博物館の大展示室の高い天井。札「馬車の飾り」
// どこ: 博物館の大展示室。高い天井の天窓・白い柱と金の柱頭・寄木の床・ロープの柵
// 演出: 中央に四輪の儀礼用の馬車の復元。大きな木の車輪・フェルトで覆った屋根の骨組み。屋根の角に白鳥がとまる。右上の虫めがねの丸で白鳥を拡大
// 動き: カメラが天井から下へ振り下ろす / 白鳥が1羽ずつ光る / 虫めがねの丸がぽんと開く / 見上げる見学者 / 天窓の光がゆれる
const L1aWheel: React.FC<{ x: number; y: number; r: number; far?: boolean }> = ({ x, y, r, far }) => (
  <g opacity={far ? 0.75 : 1}>
    <circle cx={x} cy={y} r={r} fill="none" stroke={KRP.ink} strokeWidth={far ? 20 : 26} />
    <circle cx={x} cy={y} r={r} fill="none" stroke={far ? YP.woodDark : YP.wood} strokeWidth={far ? 12 : 16} />
    {Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2;
      return <line key={i} x1={x + Math.cos(a) * 30} y1={y + Math.sin(a) * 30} x2={x + Math.cos(a) * (r - 8)} y2={y + Math.sin(a) * (r - 8)}
        stroke={far ? YP.woodDark : YP.wood} strokeWidth={7} />;
    })}
    {Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2;
      return <line key={`o${i}`} x1={x + Math.cos(a) * 30} y1={y + Math.sin(a) * 30} x2={x + Math.cos(a) * (r - 8)} y2={y + Math.sin(a) * (r - 8)}
        stroke={KRP.ink} strokeWidth={2} opacity={0.5} />;
    })}
    <circle cx={x} cy={y} r={36} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={x} cy={y} r={12} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const Yw045: React.FC<{ f: number }> = ({ f }) => {
  const tilt = easeInOut(seg(f, 0, 22));
  const dy = lerp(300, 0, tilt);
  const swans: [number, number, number][] = [[488, 236, 0.3], [1308, 236, 0.3], [440, 268, 0.34], [1262, 268, 0.34]];
  const lens = pop(seg(f, 30, 40));
  return (
    <Frame f={f} seed={3045} bg={C.hallWall}>
      <g transform={`translate(0 ${dy})`}>
        {/* 天井 (上に高く) */}
        <rect x={-40} y={-360} width={W + 80} height={460} fill={C.hallWallDark} />
        {[300, 960, 1620].map((ax, i) => (
          <g key={i}>
            <path d={`M ${ax - 180} 60 L ${ax - 180} -180 Q ${ax} -340 ${ax + 180} -180 L ${ax + 180} 60 Z`} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
            {[-90, 0, 90].map((gx) => <line key={gx} x1={ax + gx} y1={-250 + Math.abs(gx)} x2={ax + gx} y2={60} stroke={KRP.ink} strokeWidth={4} />)}
            <line x1={ax - 180} y1={-80} x2={ax + 180} y2={-80} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${ax - 160} 60 L ${ax + 160} 60 L ${ax + 260} 900 L ${ax - 260} 900 Z`} fill={KRP.white} opacity={0.12 + Math.sin(f / 15 + i) * 0.03} />
          </g>
        ))}
        <rect x={-40} y={90} width={W + 80} height={30} fill={C.gilt} stroke={KRP.ink} strokeWidth={5} />
        {/* 壁と柱 */}
        <rect x={-40} y={120} width={W + 80} height={700} fill={C.hallWall} />
        {[60, 760, 1160, 1860].map((cx) => (
          <g key={cx}>
            <rect x={cx - 40} y={150} width={80} height={680} fill={C.column} stroke={KRP.ink} strokeWidth={5} />
            {[-20, 0, 20].map((g) => <line key={g} x1={cx + g} y1={170} x2={cx + g} y2={820} stroke={KRP.gray} strokeWidth={3} />)}
            <rect x={cx - 56} y={120} width={112} height={36} rx={6} fill={C.gilt} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 寄木の床 */}
        <rect x={-40} y={810} width={W + 80} height={320} fill={C.parquet} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-40 + i * 150} y1={810} x2={-200 + i * 150} y2={1100} stroke={C.parquetDark} strokeWidth={4} />)}
        {/* 馬車 */}
        <g>
          {/* 奥の車輪 */}
          <L1aWheel x={610} y={604} r={170} far />
          <L1aWheel x={1210} y={604} r={170} far />
          {/* 奥の柱 */}
          <rect x={482} y={236} width={14} height={240} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1302} y={236} width={14} height={240} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 引き棒 (馬をつなぐ) */}
          <path d="M 420 560 L 110 610 L 110 630 L 420 590 Z" fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={90} y={596} width={50} height={46} rx={10} fill={YP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 車台 */}
          <path d="M 400 470 L 1320 470 L 1300 560 L 420 560 Z" fill={YP.wood} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={480 + i * 100} y1={474} x2={480 + i * 100} y2={556} stroke={YP.woodDark} strokeWidth={4} />)}
          {/* 手前の柱 */}
          <rect x={434} y={268} width={16} height={206} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1254} y={268} width={16} height={206} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
          {/* フェルトで覆った屋根 */}
          <path d="M 420 276 Q 860 150 1280 276 L 1330 240 Q 900 110 470 240 Z" fill={C.feltShade} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 420 276 Q 860 150 1280 276 L 1280 312 Q 860 186 420 312 Z" fill={C.felt} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: 14 }, (_, i) => {
            const t = (i + 0.5) / 14;
            const bx = lerp(430, 1270, t);
            const by = 294 - Math.sin(t * Math.PI) * 63;
            return <path key={i} d={`M ${bx - 18} ${by + 12} l 18 -20 l 18 20 Z`} fill={C.rust} stroke={KRP.ink} strokeWidth={2.5} />;
          })}
          {/* 垂れ幕 */}
          <path d="M 450 312 Q 470 400 452 470 M 1256 312 Q 1240 400 1256 470" fill="none" stroke={C.rust} strokeWidth={10} strokeLinecap="round" />
          {/* 手前の車輪 */}
          <L1aWheel x={560} y={640} r={170} />
          <L1aWheel x={1160} y={640} r={170} />
        </g>
        {/* 屋根の角の白鳥 (1羽ずつ光る) */}
        {swans.map(([wx, wy, ws], i) => (
          <L1aSwan key={i} x={wx} y={wy} s={ws} f={f + i * 7} glow={seg(f, 14 + i * 5, 20 + i * 5)} turn={i % 2 ? -1 : 1} />
        ))}
        {/* ロープの柵 */}
        {[250, 960, 1670].map((sx) => (
          <g key={sx}>
            <rect x={sx - 8} y={790} width={16} height={110} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={sx} cy={786} r={14} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 250 800 Q 605 860 960 800 Q 1315 860 1670 800" fill="none" stroke={KRP.red} strokeWidth={10} />
        {/* 見学者 */}
        <Person x={1680} y={920} s={1.08} f={f} face="surprised" pose="hold" gaze={[-6, -6]} lean={6}
          cloth={KRP.green} clothDark="#5A9A56" phase={2} />
      </g>
      {/* 虫めがねの丸 (カメラの外) */}
      {lens > 0 && (
        <g>
          <line x1={1430} y1={330} x2={1300} y2={236} stroke={KRP.ink} strokeWidth={5} strokeDasharray="12 9" opacity={seg(f, 30, 36)} />
          <g transform={`translate(1590 250) scale(${lens})`}>
            <clipPath id="l1a45-lens"><circle r={170} /></clipPath>
            <circle r={170} fill={C.hallWallDark} />
            <g clipPath="url(#l1a45-lens)">
              <path d="M -200 124 Q 0 96 200 124 L 200 200 L -200 200 Z" fill={C.felt} stroke={KRP.ink} strokeWidth={5} />
              {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-170 + i * 66} 150 l 22 -26 l 22 26 Z`} fill={C.rust} stroke={KRP.ink} strokeWidth={3} />)}
              <L1aSwan x={-20} y={130} s={0.62} f={f} turn={-1} glow={0.6} />
            </g>
            <circle r={170} fill="none" stroke={KRP.ink} strokeWidth={12} />
            <circle r={170} fill="none" stroke={YP.brass} strokeWidth={6} />
          </g>
        </g>
      )}
      <TagPlate x={1590} y={480} text="馬車の飾り" size={44} t={seg(f, 34, 42)} />
    </Frame>
  );
};

// ---- 文#46 【並】 では、本物のぬいぐるみの祖先は、どこにあるのでしょうか。
// 設計: 博物館の廊下。案内板の矢印が f でくるくる回り、行き先の札に `QMark`。Person (学芸員) が首をかしげる。床の大理石・展示ケースの列
// どこ: 博物館の長い廊下 (一点透視)。大理石の床・両側に並ぶ展示ケース・天井の灯り・奥の明るい出口
// 演出: 廊下の真ん中に立つ案内板。矢印の板がくるくる回って行き先が定まらず、下の行き先札は「？」。学芸員が首をかしげて見上げる
// 動き: 矢印がくるくる回る (残像つき) / 「？」がゆれる / 学芸員が首をかしげて傾く / カメラが奥へじわっと進む / 灯りがまたたく
const Yw046: React.FC<{ f: number }> = ({ f }) => {
  const vx = 960, vy = 420;
  const ang = f * 19 + Math.sin(f / 5) * 20;
  const tiltHead = easeOut(seg(f, 10, 28)) * 12;
  const sc = lerp(1, 1.05, easeInOut(seg(f, 0, 42)));
  const P = (x: number, y: number, d: number) => [lerp(x, vx, d), lerp(y, vy, d)] as const;
  return (
    <Frame f={f} seed={3046} bg={C.wallWarm}>
      <g transform={`translate(${vx} ${vy}) scale(${sc}) translate(${-vx} ${-vy})`}>
        {/* 天井 */}
        <path d={`M -40 -40 L ${W + 40} -40 L ${vx + 140} ${vy - 90} L ${vx - 140} ${vy - 90} Z`} fill={C.wallWainscot} stroke={KRP.ink} strokeWidth={5} />
        {/* 左右の壁 */}
        <path d={`M -40 -40 L ${vx - 140} ${vy - 90} L ${vx - 140} ${vy + 80} L -40 ${H + 40} Z`} fill={C.wallWarm} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${W + 40} -40 L ${vx + 140} ${vy - 90} L ${vx + 140} ${vy + 80} L ${W + 40} ${H + 40} Z`} fill={C.wallWarm} stroke={KRP.ink} strokeWidth={5} />
        {/* 奥の明るい出口 */}
        <rect x={vx - 140} y={vy - 90} width={280} height={170} fill={YP.glowCore} stroke={KRP.ink} strokeWidth={5} />
        <rect x={vx - 50} y={vy - 50} width={100} height={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 大理石の床 */}
        <path d={`M -40 ${H + 40} L ${vx - 140} ${vy + 80} L ${vx + 140} ${vy + 80} L ${W + 40} ${H + 40} Z`} fill={C.marble} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 11 }, (_, i) => {
          const bx = -400 + i * 272;
          return <line key={i} x1={bx} y1={H + 40} x2={lerp(vx - 140, vx + 140, i / 10)} y2={vy + 80} stroke={C.marbleVein} strokeWidth={4} />;
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const d = 1 - Math.pow(0.62, i + 1);
          const yy = lerp(H + 40, vy + 80, d);
          const u = (H + 40 - yy) / (H + 40 - (vy + 80));
          return <line key={i} x1={lerp(-40, vx - 140, u)} y1={yy} x2={lerp(W + 40, vx + 140, u)} y2={yy} stroke={C.marbleVein} strokeWidth={4} />;
        })}
        {[[400, 900], [1300, 760], [760, 640]].map(([mx, my], i) => (
          <path key={i} d={`M ${mx} ${my} q 40 -20 80 4 q 30 14 70 -8`} fill="none" stroke={C.marbleVein} strokeWidth={3} opacity={0.8} />
        ))}
        {/* 天井の灯り */}
        {[0.15, 0.42, 0.64, 0.8].map((d, i) => {
          const [lx, ly] = P(960, -10, d);
          const r = lerp(90, 20, d);
          return <ellipse key={i} cx={lx} cy={ly} rx={r} ry={r * 0.3} fill={YP.glowCore} stroke={KRP.ink} strokeWidth={3.5}
            opacity={0.8 + Math.sin(f / 4 + i * 2) * 0.15} />;
        })}
        {/* 両側の展示ケース (奥へ小さく) */}
        {[0.08, 0.38, 0.6, 0.76].map((d, i) => (
          [-1, 1].map((side) => {
            const [x0, y0] = P(side < 0 ? 20 : 1900, 520, d);
            const [x1] = P(side < 0 ? 340 : 1580, 520, d + 0.16);
            const k = 1 - d;
            const hgt = 360 * k, base = y0 + 260 * k;
            const left = Math.min(x0, x1), wid = Math.abs(x1 - x0);
            return (
              <g key={`${i}${side}`}>
                <rect x={left} y={base - hgt * 0.36} width={wid} height={hgt * 0.36} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
                <rect x={left} y={base - hgt} width={wid} height={hgt * 0.64} fill={C.caseGlass} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
                <ellipse cx={left + wid / 2} cy={base - hgt * 0.5} rx={wid * 0.16} ry={hgt * 0.16} fill={i % 2 ? C.rust : C.stone} stroke={KRP.ink} strokeWidth={3} />
                <line x1={left + wid * 0.2} y1={base - hgt * 0.95} x2={left + wid * 0.05} y2={base - hgt * 0.45} stroke={KRP.white} strokeWidth={4} opacity={0.6} />
              </g>
            );
          })
        ))}
        {/* 案内板 */}
        <g>
          <ellipse cx={1180} cy={836} rx={90} ry={18} fill={KRP.ink} opacity={0.2} />
          <rect x={1140} y={812} width={80} height={26} rx={8} fill={YP.brassDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1168} y={300} width={24} height={520} fill={YP.brass} stroke={KRP.ink} strokeWidth={5} />
          {/* 行き先札 (？) */}
          <rect x={1030} y={480} width={300} height={120} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1046} y={494} width={268} height={92} rx={8} fill="none" stroke={C.gilt} strokeWidth={4} />
          <QMark x={1180} y={578} s={0.8} f={f} />
          {/* 回る矢印 (残像) */}
          {[2, 1].map((k) => (
            <g key={k} transform={`translate(1180 300) rotate(${ang - k * 24})`} opacity={0.18 * (3 - k)}>
              <path d="M -150 -34 L 90 -34 L 90 -60 L 170 0 L 90 60 L 90 34 L -150 34 Z" fill={KRP.red} />
            </g>
          ))}
          <g transform={`translate(1180 300) rotate(${ang})`}>
            <path d="M -150 -34 L 90 -34 L 90 -60 L 170 0 L 90 60 L 90 34 L -150 34 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          </g>
          <circle cx={1180} cy={300} r={16} fill={YP.brass} stroke={KRP.ink} strokeWidth={5} />
          {/* 回転の線 */}
          <path d="M 1000 200 A 200 200 0 0 1 1360 220" fill="none" stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 12" opacity={0.5} />
        </g>
        {/* 学芸員 (首をかしげる) */}
        <Person x={660} y={900} s={1.32} f={f} face="worried" pose="armsFolded" glasses lean={tiltHead}
          cloth={C.coat} clothDark={C.coatDark} gaze={[6, -6]} />
        <g transform={`translate(660 ${900 + Math.sin(f / 13) * 3}) scale(1.32) rotate(${tiltHead})`}>
          <path d="M -24 -160 L 0 -120 L 24 -160" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        </g>
        {/* 汗のしずく */}
        <path d={`M ${760 + tiltHead * 2} ${560 + Math.sin(f / 6) * 4} q -12 20 0 26 q 12 -6 0 -26 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3.5} opacity={seg(f, 20, 30)} />
      </g>
    </Frame>
  );
};

// ---- 文#47 【山】 場所は変わって、エジプトです。
// 設計: 地中海とナイル川を上から見る地図風の絵 (世界=古い羊皮紙の地図)。シベリアから赤い点線の矢印が南西へ飛び、エジプトのナイル川沿いに赤いピンが刺さる。ピラミッドとヤシの小さな絵。エジプトの国旗は現代のものなので置かず、札「エジプト」
// どこ: 机に広げた古い羊皮紙の地図 (地中海・黒海・カスピ海・ナイル川・アルタイの山)
// 演出: シベリアの山から赤い点線が南西へ弧を描いて飛び、ナイル川沿いに赤いピンが刺さる。ピラミッドとヤシ
// 動き: カメラがシベリアの寄りから引いて地図全体へ / 点線が伸びる / ピンが落ちて刺さり波紋 / 地中海の船が進む / 羅針盤の針がゆれる
const L1aGeo = (lon: number, lat: number) => [100 + lon * 17.5, 960 - (lat - 15) * 20] as const;
const L1aPoly = (pts: number[][]) => pts.map(([lo, la], i) => { const [x, y] = L1aGeo(lo, la); return `${i ? "L" : "M"} ${x} ${y}`; }).join(" ") + " Z";
const L1aMED = [[-5, 36.2], [-1, 37.5], [0, 39.5], [3, 42.3], [6.5, 43.2], [9, 44.3], [12, 42], [15.5, 40], [16, 38.5], [17.5, 40.5], [18.5, 40], [16, 41.8], [13.5, 44.5], [12.3, 45.4], [14, 45], [19.5, 42], [20, 39.5], [22, 37], [23, 38], [24, 40.5], [26, 40.8], [27, 37.5], [29, 36.6], [32, 36.2], [36, 36.8], [35.8, 34.5], [34.5, 31.5], [32.3, 31.2], [30, 31.5], [25, 31.8], [20, 30.5], [19, 30.3], [15.5, 31.5], [11, 33.5], [10, 37], [5, 36.8], [0, 35.8], [-5, 35.8]];
const L1aBLACK = [[28, 41.5], [28.5, 43.5], [30, 45.5], [33, 46], [37, 47], [39, 47], [38, 45], [41, 42], [36, 41.7], [31, 41.2]];
const L1aCASP = [[47, 45], [50, 46.5], [53, 45], [51, 42], [53, 40], [54, 37], [51, 36.6], [49, 38], [49.5, 40.5], [47, 43]];
const L1aRED = [[32.5, 29.9], [34, 27.5], [38, 20], [40, 15], [43, 13], [42, 15], [39.5, 20], [35.5, 27.5], [34.6, 28.5]];
const L1aGULF = [[48, 30], [50, 26.5], [56, 24], [56.4, 26.5], [52, 27.8], [49, 30]];
const Yw047: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 40));
  const sc = lerp(1.32, 1, k);
  const fx = lerp(1500, 960, k), fy = lerp(330, 540, k);
  const [ax, ay] = L1aGeo(87, 50);
  const [ex, ey] = L1aGeo(30.65, 28.5);
  const cxq = 1180, cyq = 120;
  const line = easeOut(seg(f, 8, 32));
  const drop = seg(f, 30, 38);
  const pinY = ey - (1 - easeOut(drop)) * 220;
  const ripple = seg(f, 36, 42);
  const bez = (t: number) => [(1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cxq + t * t * ex, (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cyq + t * t * ey];
  const nile = [[31, 31.4], [31.2, 30], [30.8, 28.5], [31.5, 27], [32.8, 25.6], [32.9, 24.1], [33, 21], [32.5, 18], [33.5, 15]]
    .map(([lo, la], i) => { const [x, y] = L1aGeo(lo, la); return `${i ? "L" : "M"} ${x} ${y}`; }).join(" ");
  const [shx, shy] = L1aGeo(lerp(8, 22, seg(f, 0, 42)), 35 + Math.sin(f / 10) * 0.3);
  return (
    <Frame f={f} seed={3047} bg={C.tableWood}>
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.tableWood} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-fx} ${-fy})`}>
        {/* 羊皮紙 */}
        <path d="M 20 30 Q 400 10 960 26 Q 1500 12 1900 34 Q 1912 500 1896 1050 Q 960 1070 24 1052 Q 6 540 20 30 Z" fill={C.parch} stroke={C.parchBurn} strokeWidth={14} />
        <path d="M 20 30 Q 400 10 960 26 Q 1500 12 1900 34 Q 1912 500 1896 1050 Q 960 1070 24 1052 Q 6 540 20 30 Z" fill="none" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={rnd(470, i) * 1800 + 60} cy={rnd(471, i) * 960 + 60} rx={40 + rnd(472, i) * 80} ry={20 + rnd(473, i) * 40} fill={C.parchDark} opacity={0.3} />
        ))}
        {/* 経緯線 */}
        <g stroke={C.parchDark} strokeWidth={3} opacity={0.7}>
          {[20, 30, 40, 50, 60].map((la) => { const [, y] = L1aGeo(0, la); return <line key={la} x1={30} y1={y} x2={1890} y2={y} />; })}
          {[0, 20, 40, 60, 80, 100].map((lo) => { const [x] = L1aGeo(lo, 0); return <line key={lo} x1={x} y1={30} x2={x} y2={1050} />; })}
        </g>
        {/* 海 */}
        {[L1aMED, L1aBLACK, L1aCASP, L1aRED, L1aGULF].map((pts, i) => (
          <path key={i} d={L1aPoly(pts)} fill={C.sea} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        ))}
        {/* 海の波線 */}
        {[[18, 34], [5, 39], [33, 43.5], [26, 34]].map(([lo, la], i) => {
          const [x, y] = L1aGeo(lo, la);
          return <path key={i} d={`M ${x - 30} ${y} q 15 -10 30 0 q 15 10 30 0`} fill="none" stroke={C.seaDeep} strokeWidth={4} />;
        })}
        {/* ナイル川 */}
        <path d={nile} fill="none" stroke={KRP.ink} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
        <path d={nile} fill="none" stroke={C.sea} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
        {/* 山の記号 (アルタイ・カフカス・ザグロス) */}
        {[[84, 50, 1.4], [88, 49, 1.2], [91, 51, 1.1], [44, 42.5, 0.9], [48, 34, 0.8], [75, 37, 1], [70, 35, 0.9]].map(([lo, la, s], i) => {
          const [x, y] = L1aGeo(lo, la);
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <path d="M -40 20 L -6 -36 L 30 20 Z" fill={C.parchDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d="M -16 -20 L -6 -36 L 6 -18 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 出発点の白鳥の印 */}
        <circle cx={ax} cy={ay} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={ax} cy={ay} r={7} fill={KRP.red} />
        <TagPlate x={ax} y={ay - 70} text="シベリア" size={38} t={seg(f, 0, 8)} />
        {/* ピラミッドとヤシ */}
        {[[0, 0, 1], [44, 10, 0.7], [-36, 14, 0.55]].map(([dx, dy, s], i) => (
          <g key={i} transform={`translate(${ex - 74 + dx} ${ey - 34 + dy}) scale(${s})`}>
            <path d="M -50 0 L 0 -62 L 50 0 Z" fill={C.sand} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 0 -62 L 50 0 L 14 0 Z" fill={C.sandDark} />
          </g>
        ))}
        <L1aPalm x={ex + 58} y={ey + 8} s={0.34} f={f} />
        <L1aPalm x={ex + 84} y={ey + 26} s={0.26} f={f} ph={2} />
        {/* 地中海の船 */}
        <g transform={`translate(${shx} ${shy})`}>
          <path d="M -34 0 L 34 0 L 22 16 L -22 16 Z" fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={0} x2={0} y2={-44} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 2 -42 Q 28 -24 2 -6 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
        {/* 赤い点線の矢印 */}
        {Array.from({ length: 34 }, (_, i) => {
          const t = i / 34;
          if (t > line) return null;
          const [px, py] = bez(t);
          return <circle key={i} cx={px} cy={py} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} />;
        })}
        {line > 0.02 && line < 1 && (() => {
          const [hx, hy] = bez(line);
          const [qx, qy] = bez(Math.max(0, line - 0.02));
          const a = (Math.atan2(hy - qy, hx - qx) * 180) / Math.PI;
          return <Arrow x={hx} y={hy} s={0.5} rot={a} />;
        })()}
        {/* ピン */}
        {drop > 0 && (
          <g>
            {ripple > 0 && <ellipse cx={ex} cy={ey} rx={20 + ripple * 60} ry={8 + ripple * 22} fill="none" stroke={KRP.red} strokeWidth={5} opacity={1 - ripple} />}
            <ellipse cx={ex} cy={ey + 2} rx={14} ry={5} fill={KRP.ink} opacity={0.3} />
            <line x1={ex} y1={pinY} x2={ex} y2={pinY - 60} stroke={KRP.grayDark} strokeWidth={6} />
            <circle cx={ex} cy={pinY - 72} r={24} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={ex - 8} cy={pinY - 80} r={7} fill={KRP.white} opacity={0.7} />
          </g>
        )}
        <TagPlate x={ex - 200} y={ey + 70} text="エジプト" size={44} t={seg(f, 34, 42)} />
        {/* 羅針盤 */}
        <g transform="translate(1700 860)">
          <circle r={90} fill={C.parch} stroke={KRP.ink} strokeWidth={5} />
          <circle r={70} fill="none" stroke={C.parchBurn} strokeWidth={3} />
          <g transform={`rotate(${Math.sin(f / 7) * 8})`}>
            <path d="M 0 -80 L 14 0 L 0 80 L -14 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 0 0 L 14 0 L 0 80 L -14 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <text y={-96} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>N</text>
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#48 【山】 ローマ時代のエジプトの町から、小さな人形が見つかっています。
// 設計: ローマ時代のエジプトの町オクシュリンコスの遺跡 (日干しれんがの壁の残骸・ゴミ捨て場の土の山・パピルスの切れ端が散らばる)。砂地に半分埋まった小さな布の人形を、発掘者の手が掘り出す (f で砂が流れ落ちる)。遠くにナイル川とヤシ。札「ローマ時代のエジプト」
// どこ: ローマ時代のエジプトの町オクシュリンコスの遺跡。日干しれんがの壁の残骸・ゴミ捨て場の土の山・散らばるパピルスの切れ端。遠くにナイル川とヤシ
// 演出: 手前の砂地に半分埋まった小さな布の人形を、右から発掘者の手がそっと引き上げる。土の山の上の発掘者が驚いてかごを置く
// 動き: 人形がじわっと持ち上がる / 体から砂がさらさら流れ落ちる / パピルスの切れ端が風でめくれる / かげろう / カメラが人形へ寄る
const Yw048: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 6, 38));
  const sc = lerp(1, 1.06, easeInOut(seg(f, 0, 42)));
  const dx = 880, dy = 850 - rise * 60;
  return (
    <Frame f={f} seed={3048} bg={C.skyHot}>
      <defs>
        <linearGradient id="l1a48-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={KRP.blueSoft} />
          <stop offset="1" stopColor={C.skyHot} />
        </linearGradient>
      </defs>
      <g transform={`translate(880 620) scale(${sc}) translate(-880 -620)`}>
        <rect x={-40} y={-40} width={W + 80} height={420} fill="url(#l1a48-sky)" />
        <circle cx={1700} cy={110} r={60} fill={KRP.white} opacity={0.9} />
        <circle cx={1700} cy={110} r={100} fill={KRP.yellow} opacity={0.25} />
        {/* 遠くの崖・ナイル・ヤシ */}
        <path d="M -40 330 Q 300 290 700 310 Q 1200 280 1960 300 L 1960 380 L -40 380 Z" fill={C.sandDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-40} y={360} width={W + 80} height={26} fill={C.nile} stroke={KRP.ink} strokeWidth={4} />
        {[120, 220, 300, 1240, 1330, 1460, 1560, 1800].map((px, i) => (
          <L1aPalm key={i} x={px} y={366} s={0.5 + (i % 3) * 0.08} f={f} ph={i} />
        ))}
        {/* 遺跡の地面 */}
        <path d="M -40 380 L 1960 380 L 1960 1120 L -40 1120 Z" fill={C.sand} />
        {/* 日干しれんがの壁の残骸 (左) */}
        <path d="M 60 600 L 60 330 L 140 300 L 190 340 L 260 280 L 360 330 L 420 410 L 520 400 L 560 600 Z" fill={C.mudbrick} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 10 }, (_, r) => (
          <g key={r}>
            <line x1={60} y1={580 - r * 28} x2={560} y2={580 - r * 28} stroke={C.mudbrickDark} strokeWidth={3} />
            {Array.from({ length: 9 }, (_, c) => (
              <line key={c} x1={80 + c * 56 + (r % 2) * 28} y1={580 - r * 28} x2={80 + c * 56 + (r % 2) * 28} y2={552 - r * 28} stroke={C.mudbrickDark} strokeWidth={3} />
            ))}
          </g>
        ))}
        <path d="M 60 330 L 140 300 L 190 340 L 260 280 L 360 330 L 420 410 L 520 400 L 560 600 L 60 600 Z" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={250} y={460} width={70} height={140} fill={C.mudbrickDark} stroke={KRP.ink} strokeWidth={5} />
        {/* ゴミ捨て場の土の山 (右) */}
        <path d="M 980 640 Q 1150 400 1400 420 Q 1600 380 1760 470 Q 1900 540 1960 640 Z" fill={C.sandDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 20 }, (_, i) => {
          const px = 1080 + rnd(481, i) * 820, py = 470 + rnd(482, i) * 150;
          const flip = Math.sin(f / 6 + i) * 8;
          return (
            <g key={i} transform={`translate(${px} ${py}) rotate(${rnd(483, i) * 60 - 30 + (i % 4 === 0 ? flip : 0)})`}>
              <rect x={-22} y={-14} width={44} height={28} fill={C.papyrus} stroke={KRP.ink} strokeWidth={3} />
              <path d="M -14 -6 h 26 M -14 2 h 20 M -14 9 h 24" stroke={C.woolBrown} strokeWidth={2.5} />
            </g>
          );
        })}
        {/* 山の上の発掘者 (かごを置いて驚く) */}
        <Person x={1760} y={500} s={0.78} f={f} face="surprised" pose="raise" hair="none" cloth={KRP.white} clothDark={C.feltShade} gaze={[-6, 4]} phase={3} />
        <path d="M 1756 282 Q 1760 252 1810 260 Q 1840 278 1810 292 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <g transform="translate(1640 500)">
          <path d="M -40 -50 L 40 -50 L 30 0 L -30 0 Z" fill={C.palmTrunk} stroke={KRP.ink} strokeWidth={4.5} />
          {[-24, -8, 8, 24].map((gx) => <line key={gx} x1={gx} y1={-48} x2={gx * 0.8} y2={-2} stroke={C.palmTrunk} strokeWidth={3} />)}
        </g>
        {/* 手前の砂の起伏 */}
        <path d="M -40 640 Q 400 600 900 640 Q 1400 690 1960 640 L 1960 1120 L -40 1120 Z" fill={C.sandLight} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${100 + i * 230} ${880 + (i % 2) * 40} q 50 -14 100 0`} fill="none" stroke={C.sandDark} strokeWidth={4} />
        ))}
        {/* 道具: こて・ふるい */}
        <g transform="rotate(-30 420 820)">
          <path d="M 380 820 L 460 800 L 470 830 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={460} y={808} width={90} height={18} rx={8} fill={YP.wood} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <ellipse cx={1500} cy={800} rx={130} ry={36} fill={YP.wood} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1500} cy={796} rx={110} ry={26} fill={C.sandDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 人形 */}
        <ellipse cx={dx} cy={790} rx={160} ry={26} fill={C.sandDark} opacity={0.6} />
        <L1aDoll x={dx} y={dy} s={0.95} f={f} rot={-6 + rise * 4} clipId="l1a48-doll" />
        {/* 人形の下をまだ覆う砂 */}
        <path d={`M ${dx - 300} 840 Q ${dx - 180} ${640 + rise * 20} ${dx - 40} ${660 + rise * 16} Q ${dx + 70} ${630 + rise * 24} ${dx + 220} ${680 + rise * 10} Q ${dx + 300} 760 ${dx + 320} 850 Z`}
          fill={C.sand} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* さらさら落ちる砂 */}
        {Array.from({ length: 26 }, (_, i) => {
          const ph = (f * 0.05 + rnd(484, i)) % 1;
          const sx = dx - 80 + rnd(485, i) * 160;
          const sy = dy - 220 * 0.95 + rnd(486, i) * 140 + ph * 110;
          return <circle key={i} cx={sx} cy={sy} r={3 + rnd(487, i) * 2.5} fill={C.sandDark} opacity={(1 - ph) * rise} />;
        })}
        {/* 引き上げる手 (人形の右腕の端をつまむ) */}
        <L1aGlove x={dx + 300} y={dy - 205} s={0.85} rot={-12} color={C.sandLight} dark={C.sandDark} />
        {/* かげろう */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${400 + i * 500} ${400 + Math.sin(f / 5 + i) * 6} q 40 -8 80 0 q 40 8 80 0`} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.5} />
        ))}
      </g>
      <TagPlate x={340} y={150} text="ローマ時代のエジプト" size={38} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// ---- 文#49 【山】 高さは、およそ19センチ。麻の布でできています。
// 設計: ★布人形の見せ場。**布人形を画面いっぱいに** (高さ約19cm の物を画面の高さの7割で)。生成りの麻布 (織り目の細かい格子)、縫い目、腕は丸めた布の帯を背中で留めた形、顔と体に色あせた毛糸、頭の左側に小さな青いガラス玉。横に定規「約19cm」。f で人形がほんの少し揺れ、光が布の上をすべる
// どこ: 博物館の調査室。灰青の台紙を立てた作業台の上、透明な支え棒に立てた布人形
// 演出: 布人形を画面の高さの7割で大きく。麻の織り目・縫い目・腕の布の帯・色あせた毛糸・頭の左の青いガラス玉。右に定規。左から白手袋の手が虫めがねでガラス玉を見る
// 動き: 光の帯が布の上を左から右へすべる / 人形がほんの少し揺れる / 定規の目盛りが下から点る / 虫めがねが寄ってきてガラス玉がきらっと光る
const Yw049: React.FC<{ f: number }> = ({ f }) => {
  const lightPos = lerp(-1.4, 1.2, easeInOut(seg(f, 4, 42)));
  const sway = Math.sin(f / 14) * 1.4;
  const rule = easeOut(seg(f, 10, 30));
  const glass = easeOut(seg(f, 16, 34));
  const dx = 880, dy = 822, ds = 2.0;
  const top = dy - 380 * ds;
  const bx = dx - 78 * ds, by = dy - 326 * ds;
  const lx = lerp(260, bx, glass), ly = lerp(120, by, glass);
  return (
    <Frame f={f} seed={3049} bg={C.board}>
      <defs>
        <radialGradient id="l1a49-spot" cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor={YP.glowCore} stopOpacity={0.35} />
          <stop offset="1" stopColor={YP.glowCore} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 灰青の台紙 (布目) */}
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.board} />
      <g fill={C.boardDark} opacity={0.5}>
        {Array.from({ length: 300 }, (_, i) => (
          <rect key={i} x={rnd(491, i) * W} y={rnd(492, i) * 860} width={6} height={3} />
        ))}
      </g>
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill="url(#l1a49-spot)" />
      {/* 作業台 */}
      <rect x={-40} y={830} width={W + 80} height={300} fill={C.tableWood} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M -40 ${870 + i * 44} q 960 ${(i % 2) * 20 - 10} 2000 0`} fill="none" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />)}
      {/* 中性紙の敷き紙とラベルカード */}
      <path d="M 520 840 L 1240 840 L 1280 900 L 480 900 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* 透明な支え棒 */}
      <rect x={dx - 14} y={dy - 300} width={28} height={300} fill={KRP.white} opacity={0.35} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={dx} cy={dy + 6} rx={120} ry={16} fill={KRP.ink} opacity={0.3} />
      {/* 布人形 */}
      <L1aDoll x={dx} y={dy} s={ds} f={f} rot={sway} light={lightPos} clipId="l1a49-doll" />
      {/* 定規 */}
      <g transform={`translate(1360 ${dy})`}>
        <rect x={0} y={-(dy - top) - 20} width={90} height={(dy - top) + 20} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 20 }, (_, i) => {
          const yy = -((dy - top) * i) / 19;
          const on = i / 19 <= rule;
          return <line key={i} x1={0} y1={yy} x2={i % 5 === 0 ? 50 : 28} y2={yy} stroke={KRP.ink} strokeWidth={i % 5 === 0 ? 5 : 3.5} opacity={on ? 1 : 0.25} />;
        })}
        {[0, 5, 10, 15].map((n) => (
          <text key={n} x={58} y={-((dy - top) * n) / 19 + 10} fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.ink} opacity={n / 19 <= rule ? 1 : 0.25}>{n}</text>
        ))}
        <rect x={-6} y={-(dy - top) * rule - 4} width={102} height={8} fill={KRP.red} />
      </g>
      <line x1={dx + 100} y1={top} x2={1360} y2={top} stroke={KRP.ink} strokeWidth={3.5} strokeDasharray="10 8" opacity={rule} />
      <TagPlate x={1640} y={420} text="約19cm" size={48} t={seg(f, 28, 38)} />
      <TagPlate x={1640} y={560} text="麻の布" size={44} t={seg(f, 32, 42)} />
      {/* 虫めがねと白手袋 */}
      <g>
        <line x1={lx - 60} y1={ly + 60} x2={lx - 260} y2={ly + 260} stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
        <line x1={lx - 60} y1={ly + 60} x2={lx - 260} y2={ly + 260} stroke={YP.wood} strokeWidth={20} strokeLinecap="round" />
        <g transform={`translate(${lx - 190} ${ly + 190}) rotate(-45)`}>
          <path d="M -40 -34 Q -60 -40 -70 -14 Q -76 20 -50 36 L 40 36 L 40 -34 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -40 -34 Q -30 -60 -6 -50 L -10 -30" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={40} y={-40} width={60} height={82} rx={10} fill={C.coatDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <clipPath id="l1a49-lens"><circle cx={lx} cy={ly} r={78} /></clipPath>
        <circle cx={lx} cy={ly} r={78} fill={C.board} opacity={0.4} />
        <g clipPath="url(#l1a49-lens)" opacity={glass}>
          <g transform={`translate(${bx} ${by}) scale(2) translate(${-bx} ${-by})`}>
            <circle cx={bx} cy={by} r={13 * ds} fill={C.bead} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={bx} cy={by} r={6 * ds} fill={C.beadDeep} />
            <circle cx={bx - 4 * ds} cy={by - 5 * ds} r={3.5 * ds} fill={KRP.white} opacity={0.8} />
          </g>
        </g>
        <circle cx={lx} cy={ly} r={78} fill="none" stroke={KRP.ink} strokeWidth={10} />
        <circle cx={lx} cy={ly} r={78} fill="none" stroke={YP.brass} strokeWidth={5} />
        <path d={`M ${lx - 46} ${ly - 30} q 20 -30 50 -32`} fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.7} strokeLinecap="round" />
      </g>
      {/* ガラス玉のきらめき */}
      {glass > 0.9 && (
        <g transform={`translate(${bx - 30} ${by - 40}) scale(${0.6 + Math.abs(Math.sin(f / 4)) * 0.6})`}>
          <path d="M 0 -24 L 5 -5 L 24 0 L 5 5 L 0 24 L -5 5 L -24 0 L -5 -5 Z" fill={KRP.white} stroke={C.bead} strokeWidth={3} />
        </g>
      )}
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_038: (f) => <Yw038 f={f} />,
  yw_039: (f) => <Yw039 f={f} />,
  yw_040: (f) => <Yw040 f={f} />,
  yw_041: (f) => <Yw041 f={f} />,
  yw_042: (f) => <Yw042 f={f} />,
  yw_043: (f) => <Yw043 f={f} />,
  yw_044: (f) => <Yw044 f={f} />,
  yw_045: (f) => <Yw045 f={f} />,
  yw_046: (f) => <Yw046 f={f} />,
  yw_047: (f) => <Yw047 f={f} />,
  yw_048: (f) => <Yw048 f={f} />,
  yw_049: (f) => <Yw049 f={f} />,
};

export const YW_C1_MOTIFS: string[] = [
  "yw_038",
  "yw_039",
  "yw_040",
  "yw_041",
  "yw_042",
  "yw_043",
  "yw_044",
  "yw_045",
  "yw_046",
  "yw_047",
  "yw_048",
  "yw_049",
];

export const yawaC1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
