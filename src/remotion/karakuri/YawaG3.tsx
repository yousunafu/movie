// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#209〜#220 (12文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-6.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L5c。
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
  // 序と同じ色 (YawaA.tsx の C から写した。呼び返しで同じ部屋・同じ人に見せる)
  kidA: "#E49A6B", kidADark: "#B8714A",
  kidB: "#7BAFC9", kidBDark: "#56899F",
  rando: "#B8433A", randoDark: "#8E2F28",
  skin: "#F2C9A8", skinDark: "#D9A47F", nail: "#F8E3D6",
  nightWall: "#47507A", nightWallDark: "#353D63", nightSky: "#1F2547",
  nightFloor: "#6A5A4E", lamp: "#FFC977", lampCore: "#FFE9B8",
  phone: "#2B2A33", screen: "#F6F2EA", screenBar: "#3A3946",
  deskWood: "#B88A5A", deskWoodDark: "#8E643C",
  genkanWall: "#EFE3CB", hallFloor: "#C79B63", kamachi: "#7E5530",
  tile: "#B9B2A6", tileLine: "#9C958A", frost: "#DCE6E8",
  box: "#D2A56B", boxDark: "#A97C45", boxTop: "#DDB57F", tape: "#E6C88A",
  kraft: "#B98B57", kraftDark: "#93683B",
  officeWall: "#59617A", officeNight: "#232947", building: "#353C5C", winLit: "#F5D57A",
  shirt: "#F4F3EE", shirtDark: "#D5D3CB", tie: "#C0504D",
  pcBody: "#C9CDD2", paper: "#FBF8F0", mug: "#E9E2D2", sticky: "#F7E37A",
  tvBlack: "#2E2E36", pot: "#C77A4E", plant: "#6FA15A",
  // #211 夕暮れ
  duskWall: "#6A5F86", duskWallDark: "#564C72", duskFloor: "#7A6454",
  duskTop: "#7E6AA2", duskMid: "#E79A86", duskLow: "#F6C77E", duskRoof: "#5A4A72",
  beam: "#FFD9A0",
  // #209-210 研究室
  labWall: "#E4EBEA", labTile: "#CBD6D4", labFloor: "#C4CCC8",
  shelf: "#D8B88A", shelfDark: "#A9875A", shelfBack: "#EFE4CC",
  stickyPink: "#F5B8C4", chartPaper: "#F5EEDC", chartSkin: "#F6DCC6", nerve: "#F2B93B",
  benchTop: "#F1F3F2", benchBody: "#9AA6A8",
  // #213 ゲームセンター
  gcWall: "#3A3156", gcNeon: "#7FD6E0", gcNeonPink: "#F08FB6", carpet: "#2F3F66", carpetDot: "#E3B84E",
  crane: "#E77FA0", craneDark: "#B85A79", glassBack: "#F7DCE4", player: "#9C7BC0", playerDark: "#775B98",
  // ウレタン製スクイーズ (2017年ごろ。不透明・クリーム〜薄茶・気泡の点・つや弱め)
  uCream: "#F3E3C3", uTan: "#DDB984", uBrown: "#B98550", uBrownDark: "#8E6236", uDot: "#C2A274",
  cakeCream: "#FBF4E6",
  // #215 玩具店
  shopWall: "#E9D9BC", felt: "#4F7E6A", feltDark: "#3A6252", fringe: "#D9B23C",
  // #216・#218
  warmBg: "#E9D3B2", knit: "#C9785A", knitDark: "#A65E43", grip: "#8FB0C9", gripDark: "#6E8FA8",
  penBody: "#E8923A", ruled: "#B9D0E2",
};
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

// カメラ: (cx,cy) を中心に z 倍、(dx,dy) だけずらす (YawaA と同じ式)
const cam = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;

const starPath = (cx: number, cy: number, r: number, a0 = 0) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + a0 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

// 国旗 (左上が x,y)
const L5cFlagJP: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 96 }) => (
  <g>
    <rect x={x} y={y} width={w} height={w * 2 / 3} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
    <circle cx={x + w / 2} cy={y + w / 3} r={w * 0.2} fill={KRP.red} />
  </g>
);
const L5cFlagCN: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 96 }) => (
  <g>
    <rect x={x} y={y} width={w} height={w * 2 / 3} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
    <path d={starPath(x + w * 0.17, y + w * 0.17, w * 0.1)} fill={KRP.yellow} />
    {[[0.33, 0.07], [0.4, 0.14], [0.4, 0.24], [0.33, 0.3]].map(([a, b], i) => (
      <path key={i} d={starPath(x + w * a, y + w * b, w * 0.034, i * 0.4)} fill={KRP.yellow} />
    ))}
  </g>
);

// 白衣の上着 (Person に重ねる。体のゆれは Person と同じ式)
const L5cCoat: React.FC<{ x: number; y: number; s: number; f: number; lean?: number; phase?: number }> = ({
  x, y, s, f, lean = 0, phase = 0,
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <polygon points="-16,-160 16,-160 0,-128" fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3} />
      <path d="M -30 -160 L -6 -112 L -22 -104" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M 30 -160 L 6 -112 L 22 -104" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <line x1={0} y1={-112} x2={0} y2={-52} stroke={C.ink} strokeWidth={3} />
      {[-96, -76].map((by) => <circle key={by} cx={7} cy={by} r={3.5} fill={C.ink} />)}
      <rect x={20} y={-140} width={26} height={22} rx={3} fill="none" stroke={C.ink} strokeWidth={3} />
      <rect x={26} y={-152} width={6} height={18} rx={2} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={2} />
      <rect x={35} y={-150} width={6} height={16} rx={2} fill={KRP.red} stroke={C.ink} strokeWidth={2} />
    </g>
  );
};

// 序 #6 の会社員のネクタイとえり (YawaA #6 から写した)
const L5cTie: React.FC<{ px: number; py: number; ps: number; f: number; blush?: number }> = ({ px, py, ps, f, blush = 0 }) => (
  <g transform={`translate(${px} ${py + Math.sin(f / 13) * 3}) scale(${ps})`}>
    <polygon points="-14,-160 14,-160 8,-146 -8,-146" fill={C.tie} stroke={C.ink} strokeWidth={3} />
    <polygon points="-8,-146 8,-146 14,-92 0,-78 -14,-92" fill={C.tie} stroke={C.ink} strokeWidth={3.5} />
    <polygon points="-26,-160 -4,-160 -14,-140" fill={C.shirtDark} stroke={C.ink} strokeWidth={3} />
    <polygon points="26,-160 4,-160 14,-140" fill={C.shirtDark} stroke={C.ink} strokeWidth={3} />
    <ellipse cx={-40} cy={-198} rx={14} ry={8} fill={KRP.red} opacity={0.35 * blush} />
    <ellipse cx={40} cy={-198} rx={14} ry={8} fill={KRP.red} opacity={0.35 * blush} />
  </g>
);

// ウレタン製スクイーズ (2017年ごろ)。Squishy とはっきり描き分ける: 不透明・パン/ケーキ/ドーナツ形・気泡の点・つや弱め
const L5cUretan: React.FC<{
  x: number; y: number; s?: number; kind?: "bread" | "cake" | "donut"; squeeze?: number; rot?: number;
  face?: boolean; seed?: number;
}> = ({ x, y, s = 1, kind = "bread", squeeze = 0, rot = 0, face = true, seed = 1 }) => {
  const q = clamp01(squeeze);
  const sx = 1 + q * 0.3, sy = 1 - q * 0.25;
  const dots = Array.from({ length: 30 }, (_, i) => ({
    x: (rnd(seed, i) - 0.5) * 170,
    y: kind === "donut" ? -30 - rnd(seed + 1, i) * 70 : -16 - rnd(seed + 1, i) * 130,
    r: 1.8 + rnd(seed + 2, i) * 2.2,
  }));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s * sy})`}>
      <ellipse cx={0} cy={4} rx={118} ry={14} fill={C.ink} opacity={0.16} />
      {kind === "bread" && (
        <g>
          <path d="M -112 0 L -112 -112 Q -128 -172 -62 -176 Q 0 -200 62 -176 Q 128 -172 112 -112 L 112 0 Q 0 8 -112 0 Z"
            fill={C.uTan} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -94 -10 L -94 -110 Q -104 -154 -54 -156 Q 0 -176 54 -156 Q 104 -154 94 -110 L 94 -10 Q 0 -4 -94 -10 Z"
            fill={C.uCream} />
          <path d="M -112 -112 Q -128 -172 -62 -176 Q 0 -200 62 -176 Q 128 -172 112 -112" fill="none" stroke={C.uBrown} strokeWidth={10} opacity={0.6} />
        </g>
      )}
      {kind === "cake" && (
        <g>
          <path d="M -108 0 L -108 -108 L 108 -108 L 108 0 Q 0 6 -108 0 Z" fill={KRP.yellow} fillOpacity={0.55} stroke={C.ink} strokeWidth={6} />
          <rect x={-108} y={-108} width={216} height={108} fill={C.uCream} opacity={0.7} />
          <rect x={-108} y={-66} width={216} height={20} fill={C.cakeCream} stroke={C.ink} strokeWidth={3} />
          {[-70, -10, 50].map((sx2) => <path key={sx2} d={`M ${sx2} -46 a 14 12 0 0 1 28 0 Z`} fill={KRP.red} opacity={0.75} />)}
          <path d="M -116 -104 Q -100 -150 -60 -134 Q -30 -160 0 -140 Q 30 -160 60 -134 Q 100 -150 116 -104 Z"
            fill={C.cakeCream} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -22 -150 Q 0 -196 22 -150 Q 0 -134 -22 -150 Z" fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <path d="M -12 -172 L 0 -184 L 12 -172" fill="none" stroke={KRP.green} strokeWidth={5} strokeLinecap="round" />
        </g>
      )}
      {kind === "donut" && (
        <g>
          <ellipse cx={0} cy={-56} rx={114} ry={58} fill={C.uTan} stroke={C.ink} strokeWidth={6} />
          <path d="M -100 -66 Q -110 -112 -40 -118 Q 0 -124 40 -118 Q 110 -112 100 -66 Q 80 -46 50 -58 Q 20 -40 -10 -56 Q -40 -42 -70 -58 Q -92 -50 -100 -66 Z"
            fill={C.uBrownDark} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={0} cy={-84} rx={30} ry={13} fill={C.uBrown} stroke={C.ink} strokeWidth={4} />
          {[[-60, -96, KRP.yellow], [40, -100, KRP.white], [70, -78, KRP.green], [-30, -70, KRP.red]].map(([a, b, c], i) => (
            <rect key={i} x={a as number} y={b as number} width={14} height={5} rx={2} fill={c as string} transform={`rotate(${i * 40} ${a} ${b})`} />
          ))}
        </g>
      )}
      {/* 気泡の点 (ウレタンの目印) */}
      {dots.map((d, i) => <circle key={i} cx={d.x * (kind === "donut" ? 0.9 : 1)} cy={d.y} r={d.r} fill={C.uDot} opacity={0.55} />)}
      {/* つやは弱く */}
      <path d={kind === "donut" ? "M -80 -36 Q -60 -24 -30 -20" : "M -86 -124 Q -76 -146 -50 -150"} fill="none" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.3} />
      {face && kind !== "donut" && (
        <g>
          <circle cx={-30} cy={-70} r={6} fill={C.ink} />
          <circle cx={30} cy={-70} r={6} fill={C.ink} />
          <path d="M -10 -54 Q 0 -46 10 -54" fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
          <ellipse cx={-54} cy={-54} rx={13} ry={7} fill={KRP.red} opacity={0.3} />
          <ellipse cx={54} cy={-54} rx={13} ry={7} fill={KRP.red} opacity={0.3} />
        </g>
      )}
    </g>
  );
};

// ---- 序 #2 の子ども部屋 (YawaA #2 から写した。dusk で夕暮れの色にする) ----
const L5cKidsRoom: React.FC<{ f: number; dusk?: boolean }> = ({ f, dusk }) => {
  const wall = dusk ? C.duskWall : C.nightWall;
  const wallD = dusk ? C.duskWallDark : C.nightWallDark;
  const sky = dusk ? "url(#l5cDuskSky)" : C.nightSky;
  return (
    <g>
      <defs>
        <linearGradient id="l5cDuskSky" gradientUnits="userSpaceOnUse" x1={0} y1={80} x2={0} y2={400}>
          <stop offset="0" stopColor={C.duskTop} />
          <stop offset="0.6" stopColor={C.duskMid} />
          <stop offset="1" stopColor={C.duskLow} />
        </linearGradient>
        <clipPath id="l5cWin"><rect x={100} y={80} width={340} height={320} /></clipPath>
      </defs>
      <rect x={-40} y={-40} width={W + 80} height={820} fill={wall} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={i * 170} y1={-40} x2={i * 170} y2={780} stroke={wallD} strokeWidth={4} opacity={0.5} />
      ))}
      <rect x={-40} y={760} width={W + 80} height={360} fill={dusk ? C.duskFloor : C.nightFloor} />
      {!dusk && [520, 380, 240].map((r, i) => (
        <circle key={i} cx={330} cy={600} r={r} fill={C.lamp} opacity={0.07 + i * 0.05} />
      ))}
      {/* 窓: 月と星 (夕暮れは沈む夕日と屋根も) */}
      <rect x={100} y={80} width={340} height={320} fill={sky} stroke={C.ink} strokeWidth={8} />
      <g clipPath="url(#l5cWin)">
        {dusk && (
          <g>
            <circle cx={190} cy={386 + seg(f, 0, 42) * 14} r={58} fill={KRP.orange} opacity={0.9} />
            <path d="M 96 404 L 96 340 L 150 310 L 204 340 L 204 360 L 250 360 L 250 330 L 310 300 L 370 330 L 370 350 L 444 350 L 444 404 Z" fill={C.duskRoof} />
            {[[130, 352], [280, 342], [400, 366]].map(([wx, wy], i) => (
              <rect key={i} x={wx} y={wy} width={16} height={14} fill={C.winLit} opacity={0.5 + 0.4 * Math.abs(Math.sin(f / 9 + i))} />
            ))}
          </g>
        )}
      </g>
      <circle cx={330} cy={170} r={50} fill={dusk ? "#FFF1C9" : KRP.yellow} opacity={dusk ? 0.75 : 1} />
      <circle cx={352} cy={154} r={46} fill={sky} />
      {Array.from({ length: dusk ? 3 : 9 }, (_, i) => {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 7 + i * 1.7));
        return <circle key={i} cx={130 + rnd(21, i) * 280} cy={110 + rnd(22, i) * (dusk ? 90 : 260)} r={3 + rnd(23, i) * 4} fill={KRP.white} opacity={tw * (dusk ? 0.6 : 1)} />;
      })}
      <line x1={270} y1={80} x2={270} y2={400} stroke={C.ink} strokeWidth={8} />
      <line x1={100} y1={240} x2={440} y2={240} stroke={C.ink} strokeWidth={8} />
      <path d={`M 70 70 Q ${110 + Math.sin(f / 14) * 6} 240 80 420 L 40 420 L 40 70 Z`} fill={C.kidB} stroke={C.ink} strokeWidth={5} />
      <path d={`M 470 70 Q ${430 + Math.sin(f / 14) * 6} 240 460 420 L 500 420 L 500 70 Z`} fill={C.kidB} stroke={C.ink} strokeWidth={5} />
      {/* カレンダー */}
      <g transform="rotate(2 1560 170)">
        <rect x={1470} y={70} width={180} height={210} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <rect x={1470} y={70} width={180} height={50} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        <text x={1560} y={108} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>11</text>
        {Array.from({ length: 20 }, (_, k) => (
          <rect key={k} x={1484 + (k % 5) * 32} y={132 + Math.floor(k / 5) * 34} width={24} height={24} fill={KRP.paperCool} stroke={C.ink} strokeWidth={1.5} />
        ))}
        <circle cx={1580} cy={212} r={17} fill="none" stroke={KRP.red} strokeWidth={5} />
      </g>
      {/* 二段ベッド (右端) */}
      <rect x={1700} y={200} width={34} height={900} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
      <rect x={1700} y={330} width={260} height={40} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
      <path d="M 1734 330 Q 1760 280 1840 290 Q 1920 300 1960 300 L 1960 330 Z" fill={C.kidA} stroke={C.ink} strokeWidth={5} />
      <rect x={1700} y={660} width={260} height={40} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
      <path d="M 1734 660 Q 1780 610 1900 620 L 1960 620 L 1960 660 Z" fill={C.kidB} stroke={C.ink} strokeWidth={5} />
      {[420, 500, 580].map((ly) => <rect key={ly} x={1734} y={ly} width={60} height={14} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={3} />)}
    </g>
  );
};

// 序 #2 の勉強机 (手前)・ランドセル・常夜灯・鉛筆立て
const L5cKidsDesk: React.FC<{ lampOn?: boolean }> = ({ lampOn = true }) => (
  <g>
    <rect x={220} y={690} width={1480} height={44} rx={6} fill={C.deskWood} stroke={C.ink} strokeWidth={7} />
    <rect x={250} y={734} width={1420} height={380} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={7} />
    <rect x={700} y={770} width={520} height={110} rx={8} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
    <rect x={920} y={812} width={80} height={20} rx={10} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
    <line x1={1560} y1={740} x2={1560} y2={780} stroke={C.ink} strokeWidth={6} />
    <rect x={1490} y={780} width={140} height={150} rx={26} fill={C.rando} stroke={C.ink} strokeWidth={5} />
    <path d="M 1490 830 Q 1560 860 1630 830" fill={C.randoDark} stroke={C.ink} strokeWidth={4} />
    <rect x={1550} y={850} width={20} height={16} rx={3} fill={KRP.brass} stroke={C.ink} strokeWidth={2.5} />
    <rect x={300} y={662} width={60} height={30} rx={8} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={4} />
    <path d="M 290 664 Q 330 560 370 664 Z" fill={lampOn ? C.lamp : C.shirtDark} stroke={C.ink} strokeWidth={5} />
    {lampOn && <circle cx={330} cy={630} r={16} fill={C.lampCore} />}
    <rect x={1220} y={610} width={56} height={82} rx={6} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} />
    {[0, 1, 2].map((i) => <rect key={i} x={1226 + i * 16} y={560 + i * 8} width={10} height={60} fill={[KRP.yellow, KRP.red, KRP.green][i]} stroke={C.ink} strokeWidth={2.5} />)}
  </g>
);

// ---- 序 #4 の玄関 (YawaA の YaGenkan から写した) ----
const L5cGenkan: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-40} y={-40} width={W + 80} height={620} fill={C.genkanWall} />
    <rect x={-40} y={480} width={W + 80} height={20} fill={C.kamachi} opacity={0.5} />
    <rect x={560} y={-40} width={30} height={520} fill={C.kamachi} stroke={C.ink} strokeWidth={4} />
    <rect x={1330} y={-40} width={30} height={520} fill={C.kamachi} stroke={C.ink} strokeWidth={4} />
    <g transform={`rotate(${Math.sin(f / 10) * 4} 1460 60)`}>
      <line x1={1460} y1={40} x2={1460} y2={150} stroke={C.ink} strokeWidth={4} />
      <rect x={1410} y={60} width={100} height={150} rx={10} fill={C.kamachi} stroke={C.ink} strokeWidth={5} />
      <circle cx={1460} cy={110} r={34} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
      <line x1={1460} y1={110} x2={1460} y2={88} stroke={C.ink} strokeWidth={4} />
      <line x1={1460} y1={110} x2={1476} y2={118} stroke={C.ink} strokeWidth={4} />
      <line x1={1460} y1={150} x2={1460 + Math.sin(f / 6) * 14} y2={190} stroke={KRP.brass} strokeWidth={5} />
    </g>
    <rect x={-40} y={560} width={W + 80} height={80} fill={C.hallFloor} stroke={C.ink} strokeWidth={6} />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240} y1={562} x2={i * 240 - 40} y2={638} stroke={C.kamachi} strokeWidth={3} opacity={0.5} />)}
    <rect x={-40} y={640} width={W + 80} height={64} fill={C.kamachi} stroke={C.ink} strokeWidth={7} />
    <line x1={-40} y1={654} x2={W + 40} y2={654} stroke={KRP.white} strokeWidth={4} opacity={0.3} />
    <rect x={-40} y={704} width={W + 80} height={420} fill={C.tile} />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-40} y1={760 + i * 80} x2={W + 40} y2={760 + i * 80} stroke={C.tileLine} strokeWidth={4} />)}
    {Array.from({ length: 13 }, (_, i) => <line key={i} x1={i * 160} y1={704} x2={i * 160 - 120} y2={1080} stroke={C.tileLine} strokeWidth={4} />)}
    <rect x={20} y={40} width={360} height={1000} fill={C.kamachi} stroke={C.ink} strokeWidth={7} />
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={44 + i * 166} y={64} width={146} height={952} fill={C.frost} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={44 + i * 166} y1={240 + k * 160} x2={190 + i * 166} y2={240 + k * 160} stroke={C.kamachi} strokeWidth={6} />)}
        <rect x={60 + i * 166} y={80} width={40} height={900} fill={KRP.white} opacity={0.35 + Math.sin(f / 15 + i) * 0.08} />
      </g>
    ))}
    <rect x={1520} y={300} width={380} height={720} fill={C.deskWood} stroke={C.ink} strokeWidth={7} />
    <rect x={1500} y={286} width={420} height={30} rx={4} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={5} />
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={1540 + i * 180} y={330} width={160} height={660} fill={C.deskWood} stroke={C.ink} strokeWidth={4} />
        <rect x={i ? 1730 : 1680} y={620} width={10} height={60} rx={5} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    <rect x={1560} y={236} width={60} height={52} rx={6} fill={C.pot} stroke={C.ink} strokeWidth={4} />
    {[-30, 0, 30].map((a) => (
      <ellipse key={a} cx={1590 + a * 0.6} cy={210} rx={14} ry={34} fill={C.plant} stroke={C.ink} strokeWidth={3.5}
        transform={`rotate(${a + Math.sin(f / 12) * 3} 1590 236)`} />
    ))}
    <ellipse cx={1800} cy={280} rx={50} ry={10} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
    <rect x={1782} y={262} width={24} height={14} rx={4} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${500 + i * 70} ${880 + i * 10}) rotate(${-8 + i * 12})`}>
        <path d="M -40 0 Q -42 -30 -10 -32 Q 20 -30 40 -8 Q 44 6 30 8 L -36 8 Z" fill={C.kidB} stroke={C.ink} strokeWidth={4.5} />
        <rect x={-40} y={2} width={82} height={10} rx={5} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
      </g>
    ))}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${1300 + i * 90} ${920 - i * 6}) rotate(${4 - i * 8})`}>
        <path d="M -50 0 Q -52 -26 -16 -28 Q 30 -26 52 -6 Q 56 8 40 10 L -46 10 Z" fill={C.tvBlack} stroke={C.ink} strokeWidth={4.5} />
        <ellipse cx={-20} cy={-18} rx={10} ry={4} fill={KRP.white} opacity={0.4} />
      </g>
    ))}
  </g>
);

// ---- 序 #6 の夜のオフィス (YawaA #6 から写した) ----
// 奥: 壁・窓の夜景・時計・椅子
const L5cOfficeBack: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.officeWall} />
    <rect x={80} y={60} width={1060} height={480} fill={C.officeNight} stroke={C.ink} strokeWidth={8} />
    {Array.from({ length: 9 }, (_, i) => {
      const bx = 90 + i * 118, bh = 160 + rnd(51, i) * 230;
      return (
        <g key={i}>
          <rect x={bx} y={540 - bh} width={104} height={bh} fill={C.building} />
          {Array.from({ length: 12 }, (_, k) => (
            rnd(52, i * 20 + k) > 0.45 ? (
              <rect key={k} x={bx + 12 + (k % 3) * 30} y={556 - bh + Math.floor(k / 3) * 36} width={18} height={20}
                fill={C.winLit} opacity={0.5 + 0.4 * Math.abs(Math.sin(f / 20 + k + i))} />
            ) : null
          ))}
        </g>
      );
    })}
    <circle cx={1040} cy={130} r={30} fill={KRP.yellow} opacity={0.9} />
    <line x1={610} y1={60} x2={610} y2={540} stroke={C.ink} strokeWidth={8} />
    <line x1={1120} y1={60} x2={1120 + Math.sin(f / 9) * 6} y2={300} stroke={KRP.gray} strokeWidth={4} />
    <g transform="translate(1520 180)">
      <circle r={92} fill={KRP.white} stroke={C.ink} strokeWidth={8} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-76} x2={0} y2={i % 3 ? -68 : -60} stroke={C.ink} strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={0} x2={0} y2={-44} stroke={C.ink} strokeWidth={9} strokeLinecap="round" transform="rotate(-60)" />
      <line x1={0} y1={0} x2={0} y2={-66} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 0.4})`} />
      <line x1={0} y1={8} x2={0} y2={-70} stroke={KRP.red} strokeWidth={3} transform={`rotate(${f * 6})`} />
      <circle r={8} fill={C.ink} />
    </g>
    <TagPlate x={1520} y={326} text="22:00" size={40} t={1} />
    <rect x={760} y={470} width={280} height={190} rx={30} fill={C.tvBlack} stroke={C.ink} strokeWidth={6} />
    <rect x={740} y={800} width={320} height={34} rx={14} fill={C.tvBlack} stroke={C.ink} strokeWidth={5} />
    <rect x={886} y={834} width={28} height={130} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
    {[-1, 0, 1].map((d) => (
      <g key={d}>
        <line x1={900} y1={960} x2={900 + d * 130} y2={990} stroke={KRP.grayDark} strokeWidth={14} strokeLinecap="round" />
        <circle cx={900 + d * 130} cy={1000} r={14} fill={C.tvBlack} stroke={C.ink} strokeWidth={4} />
      </g>
    ))}
  </g>
);
// 机: see=true は序と同じ「机の下は断面 (半透明)」、false はふつうの机の前板
const L5cOfficeDesk: React.FC<{ f: number; see?: boolean }> = ({ f, see = true }) => (
  <g>
    <rect x={140} y={630} width={1640} height={34} rx={6} fill={C.deskWood} stroke={C.ink} strokeWidth={7} />
    {see ? (
      <g>
        <rect x={180} y={664} width={1560} height={420} fill={KRP.white} opacity={0.18} />
        <rect x={180} y={664} width={1560} height={420} fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="22 14" />
        <rect x={180} y={664} width={40} height={420} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={5} />
        <path d="M 1380 900 L 1520 900 L 1500 1060 L 1400 1060 Z" fill={KRP.gray} stroke={C.ink} strokeWidth={5} />
        <path d="M 1420 900 q 20 -26 40 -4 q 14 -20 30 2" fill={C.paper} stroke={C.ink} strokeWidth={3.5} />
        <rect x={330} y={880} width={230} height={170} rx={20} fill={C.tvBlack} stroke={C.ink} strokeWidth={5} />
        <path d="M 380 880 q 65 -70 130 0" fill="none" stroke={C.ink} strokeWidth={9} />
        <rect x={420} y={920} width={50} height={14} rx={5} fill={KRP.brass} />
        <path d="M 600 664 q -20 140 60 200 q 80 60 40 196" fill="none" stroke={C.ink} strokeWidth={5} />
        <rect x={1150} y={900} width={140} height={150} rx={14} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => <rect key={i} x={1170} y={926 + i * 34} width={100} height={14} rx={6} fill={KRP.orange} opacity={0.6 + 0.3 * Math.sin(f / 4 + i)} />)}
        <rect x={1700} y={664} width={40} height={420} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={5} />
      </g>
    ) : (
      <g>
        <rect x={180} y={664} width={1560} height={420} fill={C.deskWoodDark} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={240 + i * 500} y={700} width={440} height={130} rx={8} fill={C.deskWood} stroke={C.ink} strokeWidth={5} />
            <rect x={420 + i * 500} y={756} width={80} height={18} rx={9} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
    )}
  </g>
);
// 机の上: ノートPC (mode で画面が変わる)・付箋・書類の山・マグ
const L5cOfficeTop: React.FC<{ f: number; mode?: "bars" | "calm"; pileX?: number }> = ({ f, mode = "bars", pileX = 1170 }) => {
  const amp = lerp(46, 7, easeOut(seg(f, 8, 40)));
  const calmCol = seg(f, 24, 36) > 0.5 ? KRP.green : KRP.red;
  return (
    <g>
      <polygon points="300,632 640,632 610,612 330,612" fill={C.pcBody} stroke={C.ink} strokeWidth={5} />
      <polygon points="330,612 610,612 650,380 360,390" fill={C.pcBody} stroke={C.ink} strokeWidth={6} />
      <polygon points="350,596 596,596 630,398 376,406" fill={C.screen} />
      {mode === "bars" ? [0, 1, 2, 3].map((i) => {
        const bh = (40 + i * 34) * (0.6 + 0.4 * seg(f, 4 + i * 6, 20 + i * 6));
        return <rect key={i} x={400 + i * 50} y={570 - bh} width={34} height={bh} fill={i === 3 ? KRP.red : KRP.blueDeep} stroke={C.ink} strokeWidth={2.5} />;
      }) : (
        <g>
          <path d={`M 378 500 ${Array.from({ length: 11 }, (_, k) => `L ${392 + k * 20} ${500 + (k % 2 ? -1 : 1) * amp * (0.5 + 0.5 * Math.abs(Math.sin(f / 3 + k)))}`).join(" ")} L 606 500`}
            fill="none" stroke={calmCol} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 400 430 c -10 -14 -30 -4 -18 12 l 18 16 l 18 -16 c 12 -16 -8 -26 -18 -12 z" fill={KRP.red} stroke={C.ink} strokeWidth={2.5}
            transform={`translate(400 440) scale(${1 + 0.08 * Math.sin(f / 4)}) translate(-400 -440)`} />
        </g>
      )}
      <rect x={604} y={420} width={50} height={46} fill={C.sticky} stroke={C.ink} strokeWidth={3} transform={`rotate(${8 + Math.sin(f / 8) * 2} 630 440)`} />
      <rect x={340} y={400} width={46} height={42} fill={KRP.green} stroke={C.ink} strokeWidth={3} transform="rotate(-10 360 420)" />
      {[0, 1, 2].map((s) => (
        <g key={s}>
          {Array.from({ length: 6 }, (_, k) => (
            <rect key={k} x={pileX + s * 140 + (k % 2) * 6 - 3} y={612 - k * 22 - s * 18} width={120} height={20}
              fill={C.paper} stroke={C.ink} strokeWidth={3} transform={`rotate(${(rnd(61, s * 9 + k) - 0.5) * 6} ${pileX + 60 + s * 140} ${620 - k * 22})`} />
          ))}
        </g>
      ))}
      <rect x={1610} y={556} width={72} height={76} rx={8} fill={C.mug} stroke={C.ink} strokeWidth={5} />
      <path d="M 1682 574 q 26 0 26 22 q 0 22 -26 22" fill="none" stroke={C.ink} strokeWidth={5} />
      {[0, 1].map((i) => (
        <path key={i} d={`M ${1630 + i * 30} 540 q ${12 * Math.sin(f / 5 + i)} -24 0 -48 q ${-12 * Math.sin(f / 5 + i)} -24 0 -48`}
          fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
      ))}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#209 【並】 じつは、ストレスボールの効果を調べた研究は少なく、結果もはっきりしていません。
// 設計: 研究室の棚に、ストレスボールの研究の資料がほんの数冊だけ (棚はがらがら)。その資料の上に「?」の付箋がいっぱい
// どこ: 清潔な研究室の壁一面の木の本棚。4段とも、ほぼ空っぽ (ほこりの線・倒れたブックエンド・すみのクモの巣)
// 演出: 真ん中の段にだけ、細いファイルが3冊 (棚札「ストレスボール」・横にオレンジのストレスボール)。その上に「?」の付箋が次々に貼られていく
// 動き: f6〜36 付箋が1枚ずつぽん / f34〜 最後の1枚がはがれてひらひら落ちる / クモの巣がゆれる / カメラはファイルへゆっくり寄る
const Yw209: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.14, easeInOut(seg(f, 0, 42)));
  const notes: [number, number, number, boolean][] = [
    [872, 360, -14, false], [930, 336, 8, true], [990, 352, -6, false], [852, 420, 12, true],
    [1024, 410, -10, false], [900, 452, 4, false], [960, 430, -16, true], [1040, 470, 10, true],
    [870, 488, -4, false], [980, 494, 14, false], [920, 300, -8, true], [1060, 330, 18, true],
  ];
  const fall = seg(f, 34, 50);
  return (
    <Frame f={f} seed={3209} bg={C.labWall}>
      <g transform={cam(960, 430, z)}>
        {/* 研究室の壁 (白いタイル) */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.labWall} />
        {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={-40} y1={i * 80} x2={W + 40} y2={i * 80} stroke={C.labTile} strokeWidth={3} />)}
        {Array.from({ length: 26 }, (_, i) => <line key={`v${i}`} x1={i * 80} y1={-40} x2={i * 80} y2={H + 40} stroke={C.labTile} strokeWidth={3} />)}
        {/* 右: フックの白衣 / 左: 分子模型のポスター */}
        <circle cx={1780} cy={250} r={10} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        <g transform={`rotate(${Math.sin(f / 16) * 1.5} 1780 250)`}>
          <path d="M 1700 300 L 1780 256 L 1860 300 L 1880 640 L 1680 640 Z" fill={KRP.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 1760 270 L 1780 360 L 1800 270" fill="none" stroke={C.ink} strokeWidth={4} />
          <line x1={1780} y1={360} x2={1780} y2={640} stroke={C.ink} strokeWidth={3} />
          <rect x={1808} y={420} width={44} height={36} rx={4} fill="none" stroke={C.ink} strokeWidth={3.5} />
        </g>
        <g transform="rotate(-2 140 300)">
          <rect x={40} y={160} width={200} height={260} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          {[[90, 230], [180, 250], [140, 320], [80, 370], [190, 370]].map(([a, b], i, arr) => (
            <g key={i}>
              {i > 0 && <line x1={arr[i - 1][0]} y1={arr[i - 1][1]} x2={a} y2={b} stroke={C.ink} strokeWidth={4} />}
            </g>
          ))}
          {[[90, 230], [180, 250], [140, 320], [80, 370], [190, 370]].map(([a, b], i) => (
            <circle key={i} cx={a} cy={b} r={16} fill={[KRP.red, KRP.blue, KRP.green, KRP.yellow, KRP.blue][i]} stroke={C.ink} strokeWidth={3.5} />
          ))}
        </g>
        {/* 木の本棚 (4段) */}
        <rect x={300} y={56} width={1320} height={850} rx={6} fill={C.shelf} stroke={C.ink} strokeWidth={8} />
        <rect x={330} y={80} width={1260} height={800} fill={C.shelfBack} stroke={C.ink} strokeWidth={5} />
        {[300, 520, 740].map((by) => (
          <g key={by}>
            <rect x={330} y={by} width={1260} height={24} fill={C.shelf} stroke={C.ink} strokeWidth={5} />
            <rect x={330} y={by + 24} width={1260} height={10} fill={C.shelfDark} opacity={0.5} />
            {/* ほこりの線 */}
            <line x1={360} y1={by - 4} x2={1560} y2={by - 4} stroke={KRP.gray} strokeWidth={3} strokeDasharray="6 22" opacity={0.7} />
          </g>
        ))}
        {/* 1段目: 倒れたブックエンドだけ + すみのクモの巣 */}
        <g transform="rotate(-90 1300 300)">
          <path d="M 1270 300 L 1270 220 L 1282 220 L 1282 288 L 1330 288 L 1330 300 Z" fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        </g>
        <g transform={`rotate(${Math.sin(f / 9) * 2} 330 80)`} stroke={KRP.gray} strokeWidth={2.5} fill="none" opacity={0.9}>
          {[0, 25, 50, 75].map((a) => (
            <line key={a} x1={330} y1={80} x2={330 + Math.cos((a * Math.PI) / 180) * 150} y2={80 + Math.sin((a * Math.PI) / 180) * 150} />
          ))}
          {[50, 90, 130].map((r) => (
            <path key={r} d={`M ${330 + r} 80 Q ${330 + r * 0.8} ${80 + r * 0.5} ${330 + r * 0.7} ${80 + r * 0.7} Q ${330 + r * 0.45} ${80 + r * 0.85} 330 ${80 + r}`} />
          ))}
        </g>
        {/* 3段目: 空の箱がひとつ / 4段目: フラスコがひとつ */}
        <rect x={480} y={640} width={150} height={100} fill={C.kraft} stroke={C.ink} strokeWidth={5} />
        <path d="M 480 640 L 456 610 M 630 640 L 656 612" stroke={C.ink} strokeWidth={5} fill="none" />
        <path d="M 1380 880 L 1380 830 L 1360 830 L 1360 812 L 1420 812 L 1420 830 L 1400 830 L 1400 880 Z" fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} opacity={0.9} />
        {/* 2段目: ストレスボールの研究の資料、3冊だけ */}
        {[0, 1, 2].map((i) => {
          const bx = 880 + i * 62;
          const lean = i === 2 ? 9 : 0;
          return (
            <g key={i} transform={`rotate(${lean} ${bx + 54} 520)`}>
              <rect x={bx} y={330} width={54} height={190} rx={4} fill={[KRP.blueDeep, KRP.green, C.kidA][i]} stroke={C.ink} strokeWidth={5} />
              <rect x={bx + 10} y={360} width={34} height={56} rx={3} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
              {[372, 384, 396].map((ly) => <line key={ly} x1={bx + 16} y1={ly} x2={bx + 38} y2={ly} stroke={KRP.gray} strokeWidth={2.5} />)}
              <circle cx={bx + 27} cy={470} r={9} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* となりにストレスボール */}
        <g transform={`translate(1150 520) scale(${1 + 0.03 * Math.sin(f / 6)} ${1 - 0.03 * Math.sin(f / 6)})`}>
          <ellipse cx={0} cy={0} rx={50} ry={8} fill={C.ink} opacity={0.15} />
          <path d="M -48 0 Q -54 -92 0 -94 Q 54 -92 48 0 Q 0 6 -48 0 Z" fill={KRP.orange} stroke={C.ink} strokeWidth={5} />
          <path d="M -26 -62 Q -14 -78 6 -80" fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        </g>
        {/* 「?」の付箋 */}
        {notes.map(([nx, ny, r, pink], i) => {
          const t = seg(f, 6 + i * 2.5, 11 + i * 2.5);
          if (t <= 0) return null;
          const last = i === notes.length - 1;
          const fy = last ? 380 * fall * fall : 0;
          const fx = last ? Math.sin(fall * 9) * 60 : 0;
          const fr = last ? fall * 140 : 0;
          return (
            <g key={i} transform={`translate(${nx + fx} ${ny + fy}) rotate(${r + fr}) scale(${pop(t)})`}>
              <rect x={-26} y={-26} width={52} height={52} fill={pink ? C.stickyPink : C.sticky} stroke={C.ink} strokeWidth={3.5} />
              <path d="M 26 14 L 14 26 L 26 26 Z" fill={C.ink} opacity={0.15} />
              <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.red}>?</text>
            </g>
          );
        })}
        {/* 棚札 */}
        <TagPlate x={1000} y={556} text="ストレスボール" size={30} t={seg(f, 2, 10)} />
        {/* 手前: 実験台のふち */}
        <rect x={-40} y={900} width={W + 80} height={40} fill={C.benchTop} stroke={C.ink} strokeWidth={6} />
        <rect x={-40} y={940} width={W + 80} height={200} fill={C.benchBody} stroke={C.ink} strokeWidth={6} />
      </g>
    </Frame>
  );
};

// ---- 文#210 【山】 握る気持ちよさのしくみも、まだよくわかっていないのです。
// 設計: 手のひらの断面図ではなく、手の中の神経の地図 (世界=大きな解剖図の掛け図) の手のひらの部分に、まだ白い空白の領域があり「?」が浮かぶ。研究者が首をかしげる。正直な「わからない」
// どこ: 研究室の壁に吊るした大きな解剖図の掛け図 (木の軸・ひも)。右に実験台と顕微鏡
// 演出: 掛け図は「手の神経」。手首から指先まで神経が枝分かれして走るが、手のひらの真ん中だけ白い空白 (点線の縁)。そこに「?」。白衣の研究者が指し棒で空白を指して、首をかしげる
// 動き: 神経の上を信号の光が手首から上ってきて、空白の縁で消える (くり返し) / f8〜20 空白の点線が描かれる / f22〜32 ? がぽん / f18〜40 研究者がかしげる / カメラは掛け図へ寄る
const Yw210: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.08, easeInOut(seg(f, 0, 42)));
  const tilt = lerp(0, -9, easeInOut(seg(f, 18, 40)));
  const dashT = seg(f, 8, 20);
  const hx = 760, hy = 520;
  const nerves = [
    // 橈骨側 → 親指・人さし指
    "M -90 380 L -96 200 Q -110 120 -150 40 Q -200 -20 -270 -70",
    "M -96 200 Q -126 60 -125 -130 L -125 -340",
    // 正中 → 中指 (空白に吸い込まれる)
    "M 0 380 L 0 200 Q -20 100 -42 -130 L -42 -370",
    "M 0 200 Q 30 120 42 -130 L 42 -350",
    // 尺骨 → 薬指・小指
    "M 92 380 L 96 160 Q 120 0 122 -130 L 122 -290",
  ];
  const sig = (f % 24) / 24;
  return (
    <Frame f={f} seed={3210} bg={C.labWall}>
      <g transform={cam(760, 500, z)}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.labWall} />
        {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={-40} y1={i * 80} x2={W + 40} y2={i * 80} stroke={C.labTile} strokeWidth={3} />)}
        {Array.from({ length: 26 }, (_, i) => <line key={`v${i}`} x1={i * 80} y1={-40} x2={i * 80} y2={H + 40} stroke={C.labTile} strokeWidth={3} />)}
        <rect x={-40} y={930} width={W + 80} height={200} fill={C.labFloor} stroke={C.ink} strokeWidth={5} />
        {/* 掛け図: ひもと木の軸 */}
        <circle cx={760} cy={22} r={10} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        <path d="M 330 70 L 760 22 L 1190 70" fill="none" stroke={C.ink} strokeWidth={4} />
        <g transform={`rotate(${Math.sin(f / 20) * 0.6} 760 22)`}>
          <rect x={300} y={84} width={920} height={830} fill={C.chartPaper} stroke={C.ink} strokeWidth={7} />
          <path d="M 300 84 L 300 914" stroke={C.shelfDark} strokeWidth={4} opacity={0.4} />
          <rect x={276} y={60} width={968} height={34} rx={14} fill={YP.wood} stroke={C.ink} strokeWidth={6} />
          <rect x={276} y={900} width={968} height={30} rx={14} fill={YP.wood} stroke={C.ink} strokeWidth={6} />
          {/* 見出しと凡例 (ラベルだけ) */}
          <text x={990} y={170} fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.ink}>手の神経</text>
          <line x1={990} y1={188} x2={1190} y2={188} stroke={C.ink} strokeWidth={4} />
          <g transform="translate(350 770)">
            <rect x={-20} y={-40} width={200} height={120} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
            <line x1={0} y1={-10} x2={50} y2={-10} stroke={C.nerve} strokeWidth={9} strokeLinecap="round" />
            <text x={64} y={0} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.ink}>神経</text>
            <ellipse cx={25} cy={44} rx={24} ry={14} fill={KRP.white} stroke={C.ink} strokeWidth={3} strokeDasharray="6 5" />
            <text x={64} y={54} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.ink}>未解明</text>
          </g>
          {/* 手 (手のひら側) */}
          <g transform={`translate(${hx} ${hy})`}>
            {[[-125, 230], [-42, 260], [42, 245], [122, 190]].map(([fx, len], i) => (
              <rect key={i} x={fx - 36} y={-130 - len} width={72} height={len + 60} rx={36} fill={C.chartSkin} stroke={C.ink} strokeWidth={6} />
            ))}
            <line x1={-140} y1={90} x2={-272} y2={-70} stroke={C.ink} strokeWidth={84} strokeLinecap="round" />
            <line x1={-140} y1={90} x2={-272} y2={-70} stroke={C.chartSkin} strokeWidth={72} strokeLinecap="round" />
            <path d="M -165 -130 L 160 -130 Q 178 60 150 200 L 120 380 L -120 380 L -150 200 Q -182 60 -165 -130 Z"
              fill={C.chartSkin} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            {/* 指の関節のしわ */}
            {[[-125, -230], [-125, -290], [-42, -250], [-42, -320], [42, -240], [42, -305], [122, -205], [122, -255]].map(([a, b], i) => (
              <line key={i} x1={a - 18} y1={b} x2={a + 18} y2={b} stroke={C.skinDark} strokeWidth={3} />
            ))}
            {/* 神経 */}
            {nerves.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke={C.ink} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
                <path d={d} fill="none" stroke={C.nerve} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ))}
            {/* 指先の細い枝と受容体の点 */}
            {[[-125, -340], [-42, -370], [42, -350], [122, -290], [-270, -70]].map(([a, b], i) => (
              <g key={i} stroke={C.nerve} strokeWidth={4} strokeLinecap="round">
                <line x1={a} y1={b} x2={a - 16} y2={b - 22} />
                <line x1={a} y1={b} x2={a + 16} y2={b - 22} />
                <circle cx={a - 16} cy={b - 24} r={5} fill={C.nerve} stroke={C.ink} strokeWidth={2} />
                <circle cx={a + 16} cy={b - 24} r={5} fill={C.nerve} stroke={C.ink} strokeWidth={2} />
              </g>
            ))}
            {/* 手首から上る信号の光 */}
            {[-90, 0, 92].map((nx, i) => {
              const u = (sig + i * 0.33) % 1;
              const yy = lerp(380, 170, u);
              return <circle key={i} cx={nx + (i === 2 ? 4 * u : 0)} cy={yy} r={13} fill={KRP.white} opacity={(1 - u) * 0.95} stroke={C.nerve} strokeWidth={4} />;
            })}
            {/* まだわからない空白 (神経の線がここで消える) */}
            <ellipse cx={0} cy={60} rx={130} ry={118} fill={KRP.white} />
            <ellipse cx={0} cy={60} rx={130} ry={118} fill="none" stroke={C.ink} strokeWidth={5}
              strokeDasharray="18 12" strokeDashoffset={-f * 1.2} opacity={dashT} />
            {[[-60, 150], [60, 150], [0, 178]].map(([a, b], i) => (
              <g key={i} opacity={dashT}>
                {[0, 1, 2].map((k) => <circle key={k} cx={a * (1 - k * 0.14)} cy={b - k * 16} r={4} fill={C.nerve} stroke={C.ink} strokeWidth={1.5} />)}
              </g>
            ))}
            <QMark x={0} y={100} s={1.25} f={f} t={seg(f, 22, 32)} />
          </g>
        </g>
        {/* 右: 実験台と顕微鏡 */}
        <rect x={1660} y={700} width={300} height={30} fill={C.benchTop} stroke={C.ink} strokeWidth={6} />
        <rect x={1680} y={730} width={280} height={230} fill={C.benchBody} stroke={C.ink} strokeWidth={6} />
        <g transform="translate(1780 700)">
          <rect x={-50} y={-20} width={110} height={20} rx={6} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
          <path d="M 30 -20 L 30 -150 Q 30 -170 10 -170" fill="none" stroke={KRP.grayDark} strokeWidth={18} strokeLinecap="round" />
          <rect x={-26} y={-200} width={30} height={110} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={4} transform="rotate(-18 -11 -145)" />
          <rect x={-50} y={-80} width={80} height={12} fill={KRP.gray} stroke={C.ink} strokeWidth={3} />
        </g>
        <path d="M 1890 700 L 1890 640 L 1872 600 L 1928 600 L 1910 640 L 1910 700 Z" fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} />
        {/* 研究者 (白衣・眼鏡)。指し棒で空白を指して首をかしげる */}
        <line x1={1500 - 150 * 1.45} y1={960 - 148 * 1.45} x2={900} y2={590} stroke={YP.woodDark} strokeWidth={9} strokeLinecap="round"
          transform={`rotate(${tilt} 1500 960)`} />
        <circle cx={900} cy={590} r={7} fill={KRP.red} stroke={C.ink} strokeWidth={3} transform={`rotate(${tilt} 1500 960)`} />
        <ellipse cx={1500} cy={962} rx={110} ry={16} fill={C.ink} opacity={0.16} />
        <Person x={1500} y={960} s={1.45} f={f} cloth={KRP.white} clothDark={KRP.gray} glasses pose="point" pointDir={-1}
          face={f > 24 ? "worried" : "normal"} gaze={[-7, 2]} lean={tilt} />
        <L5cCoat x={1500} y={960} s={1.45} f={f} lean={tilt} />
        {f > 28 && (
          <path d={`M ${1588} ${640 + seg(f, 28, 42) * 18} q 10 16 0 26 q -10 -10 0 -26 Z`} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
        )}
      </g>
    </Frame>
  );
};

// ---- 文#211 【山】 結び、手のひらサイズの、抱っこ。
// 設計: 章扉 (結び)。夕暮れの子ども部屋 (序 #2 の部屋と同じ。二段ベッド・窓の月)。机の上に `Squishy` が1つ、窓の光に照らされる。`ChapterDoor` (num=0 で「第N章」の行を出さない。title="結び　手のひらサイズの、抱っこ。")。題字の後ろに薄いクリームの帯
// どこ: 序 #2 と同じ子ども部屋 (窓・月・カーテン・カレンダー・二段ベッド・勉強机)。ただし夕暮れで、子どもはいない。常夜灯は消えている
// 演出: 窓から斜めに差す夕日の光の帯が、机の上の Squishy をひとつだけ照らす。光の中にほこりがきらきら。章扉の題字
// 動き: 光の帯が f で少しずつ伸びて強まる / f14〜32 Squishy がぷるんと揺れる / f20〜 きらりと光る / 夕日が沈む / カメラは Squishy へ寄る / f4〜20 題字
const Yw211: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.12, easeInOut(seg(f, 0, 42)));
  const door = seg(f, 4, 20);
  const beam = 0.5 + 0.5 * easeOut(seg(f, 0, 30));
  const wob = Math.sin(f / 2.2) * 0.12 * seg(f, 12, 16) * (1 - seg(f, 18, 34));
  const glint = seg(f, 20, 30);
  const sx = 640, sy = 694;
  return (
    <Frame f={f} seed={3211} bg={C.duskWall} dark
      over={<>
        <div style={{ position: "absolute", left: 970, top: 540, width: 900, height: 122, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={0} title="結び　手のひらサイズの、抱っこ。" t={door} left={980} top={556} width={884} />
      </>}>
      <g transform={cam(sx, 560, z)}>
        <L5cKidsRoom f={f} dusk />
        {/* 夕日の光の帯 (窓から机へ) */}
        <polygon points={`440,90 440,400 ${lerp(700, 860, beam)},694 ${lerp(840, 1000, beam)},694`} fill={C.beam} opacity={0.16 * beam} />
        <polygon points={`270,110 440,250 ${lerp(560, 740, beam)},694 ${lerp(480, 520, beam)},694`} fill={C.beam} opacity={0.22 * beam} />
        <polygon points="440,240 440,400 800,694 520,694" fill={C.beam} opacity={0.3 * beam} />
        {/* 窓枠の影が床に落ちる */}
        <path d="M 980 780 L 1300 780 L 1360 1000 L 1000 1000 Z" fill={C.beam} opacity={0.14} />
        {/* 光の中のほこり */}
        {Array.from({ length: 12 }, (_, i) => {
          const u = ((f * (0.4 + rnd(71, i) * 0.4) + rnd(72, i) * 100) % 100) / 100;
          const px = lerp(460, 760, rnd(73, i)) + Math.sin(f / 8 + i) * 12;
          const py = lerp(260, 660, u);
          return <circle key={i} cx={px + (py - 260) * 0.25} cy={py} r={2.5 + rnd(74, i) * 3} fill={KRP.white} opacity={0.5 + 0.4 * Math.sin(f / 5 + i)} />;
        })}
        <L5cKidsDesk lampOn={false} />
        {/* 机の上: 閉じたノートと鉛筆 (子どもが出かけたあと) */}
        <g transform="rotate(-6 1000 690)">
          <rect x={900} y={672} width={210} height={20} rx={4} fill={C.kidB} stroke={C.ink} strokeWidth={4} />
          <rect x={904} y={664} width={202} height={10} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        </g>
        <rect x={1130} y={680} width={70} height={10} rx={4} fill={KRP.yellow} stroke={C.ink} strokeWidth={2.5} transform="rotate(8 1160 685)" />
        {/* 主役: 夕日に照らされた Squishy */}
        <ellipse cx={sx} cy={sy + 2} rx={190} ry={20} fill={C.beam} opacity={0.35} />
        <Squishy x={sx} y={sy} s={1.15} squeeze={Math.max(0, wob)} f={f} rot={wob * 20} face="smile" />
        {/* 光が当たる側のつや */}
        <path d={`M ${sx - 120} ${sy - 140} Q ${sx - 140} ${sy - 60} ${sx - 120} ${sy - 20}`} fill="none" stroke={C.beam} strokeWidth={12} strokeLinecap="round" opacity={0.6} />
        {/* きらり */}
        {glint > 0 && (() => {
          const k = Math.abs(Math.sin(f / 4));
          const r = (16 + 22 * k) * pop(glint);
          const gx = sx - 70, gy = sy - 190;
          return <path d={`M ${gx} ${gy - r} L ${gx + 6} ${gy - 6} L ${gx + r} ${gy} L ${gx + 6} ${gy + 6} L ${gx} ${gy + r} L ${gx - 6} ${gy + 6} L ${gx - r} ${gy} L ${gx - 6} ${gy - 6} Z`}
            fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />;
        })()}
      </g>
    </Frame>
  );
};

// ---- 文#212 【並】 最後に、冒頭のスクイーズに、戻りましょう。
// 設計: 序 #4 と同じ玄関の段ボール箱から `Squishy` がぽよんと顔を出す (呼び返し)。序の子ども2人がのぞき込む
// どこ: 序 #3・#4 と同じ玄関 (すりガラスの引き戸・上がり框・タイルの土間・靴箱・振り子時計)。框の上の同じ段ボール箱 (同じ伝票)
// 演出: 箱のふたが少し開いて、Squishy が目から上だけぽよんと顔を出す。左右から序の子ども2人が身を乗り出してのぞき込む
// 動き: f2〜10 ふたが開く / f8〜18 顔が上がる / f20・f30 ぽよんと弾む / 子どもは f14 で驚き → f24 で笑顔 / カメラは箱へ寄る
const Yw212: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.12, easeInOut(seg(f, 0, 40)));
  const open = easeOut(seg(f, 2, 10));
  const rise = easeOut(seg(f, 8, 18));
  const bounces: [number, number][] = [[20, 0.4], [30, 0.25], [38, 0.12]];
  const sq = Math.max(0, ...bounces.map(([t, a]) => a * Math.max(0, 1 - Math.abs(f - t) / 3)));
  const hop = Math.max(0, ...bounces.map(([t, a]) => (f > t && f < t + 8 ? Math.sin(((f - t) / 8) * Math.PI) * a * 60 : 0)));
  const sy = lerp(640, 452, rise) - hop;
  const happy = f > 24;
  return (
    <Frame f={f} seed={3212} bg={C.genkanWall}>
      <g transform={cam(960, 480, z)}>
        <L5cGenkan f={f} />
        <ellipse cx={960} cy={640} rx={300} ry={18} fill={C.ink} opacity={0.2} />
        {/* 箱の中 (奥の暗がり) */}
        <polygon points="700,380 780,330 1290,330 1220,380" fill={C.boxDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <polygon points="760,372 820,340 1250,340 1200,372" fill={KRP.yellow} opacity={0.5 * open} />
        <Squishy x={960} y={sy} s={1.4} squeeze={sq} f={f} rot={Math.sin(f / 4) * 4} face={sq > 0.25 ? "squish" : "smile"} />
        {/* 箱の前と横 (序 #4 と同じ伝票) */}
        <polygon points="1220,380 1290,330 1290,590 1220,640" fill={C.boxDark} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={700} y={380} width={520} height={260} fill={C.box} stroke={C.ink} strokeWidth={7} />
        <g transform="rotate(-2 860 510)">
          <rect x={748} y={428} width={250} height={160} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <rect x={748} y={428} width={250} height={34} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={3} />
          {[480, 512, 544].map((ly) => <line key={ly} x1={760} y1={ly + 14} x2={986} y2={ly + 14} stroke={KRP.gray} strokeWidth={3} />)}
          <text x={762} y={570} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.ink}>品名 おもちゃ</text>
        </g>
        <rect x={940} y={380} width={40} height={260} fill={C.tape} opacity={0.85} />
        {/* ふた (少しだけ開いて、すき間から顔) */}
        <polygon points={`700,380 ${lerp(780, 610, open)},${lerp(330, 270, open)} ${lerp(1035, 700, open)},${lerp(330, 236, open)} ${lerp(960, 760, open)},380`}
          fill={C.boxTop} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <polygon points={`1220,380 ${lerp(1290, 1400, open)},${lerp(330, 270, open)} ${lerp(1035, 1300, open)},${lerp(330, 236, open)} ${lerp(960, 1160, open)},380`}
          fill={C.boxTop} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* ぽよん の弾み線 */}
        {sq > 0.05 && (
          <g stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={sq * 2}>
            {[-1, 1].map((d) => (
              <g key={d}>
                <line x1={960 + d * 210} y1={300} x2={960 + d * 260} y2={270} />
                <line x1={960 + d * 200} y1={350} x2={960 + d * 262} y2={346} />
              </g>
            ))}
          </g>
        )}
        {/* 子ども2人 (序と同じ色)。身を乗り出してのぞき込む */}
        <ellipse cx={560} cy={940} rx={90} ry={15} fill={C.ink} opacity={0.18} />
        <ellipse cx={1360} cy={940} rx={90} ry={15} fill={C.ink} opacity={0.18} />
        <Person x={560} y={940} s={1.05} f={f} cloth={C.kidA} clothDark={C.kidADark}
          face={happy ? "joy" : f > 12 ? "surprised" : "normal"} pose="hold" lean={lerp(4, 14, easeOut(seg(f, 6, 20)))} gaze={[8, -4]} />
        <Person x={1360} y={940} s={1.05} f={f} phase={2} cloth={C.kidB} clothDark={C.kidBDark}
          face={happy ? "smile" : f > 14 ? "surprised" : "normal"} pose="hold" lean={lerp(-4, -14, easeOut(seg(f, 8, 22)))} gaze={[-8, -4]} />
        {/* びっくりの小さな線 */}
        {f > 12 && f < 26 && [[650, 640], [1270, 640]].map(([a, b], i) => (
          <g key={i} stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 20, 26)}>
            <line x1={a} y1={b} x2={a + (i ? -12 : 12)} y2={b - 30} />
            <line x1={a + (i ? -24 : 24)} y1={b + 10} x2={a + (i ? -44 : 44)} y2={b - 12} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#213 【山】 2017年ごろ、日本で流行ったスクイーズは、日本のメーカーが作った、ウレタンのものでした。
// 設計: 2017年ごろのゲームセンターのクレーンゲーム。ガラスの中に、ウレタン製のスクイーズ (パン形・ケーキ形・不透明・クリーム色〜薄茶・細かい気泡の点) がいっぱい。アームがひとつつかむ。札「2017年ごろ」「ウレタン」
// どこ: 2017年ごろのゲームセンター。紫の壁にネオン管・柄のカーペット・左右に別の台。真ん中にピンクのクレーンゲーム (電飾の看板・100円の投入口・レバー)
// 演出: ガラスの中に、ウレタン製のスクイーズ (食パン・ショートケーキ・ドーナツ。不透明・気泡の点) がぎっしり。アームが下りて食パンをひとつつかみ、持ち上げる。右の客がばんざい
// 動き: f0〜6 アームがゆれる / f6〜20 下りる / f20〜26 爪が閉じてパンがむにっ / f26〜40 持ち上がる / 電飾が点滅 / カメラはガラスへ寄る
const Yw213: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.1, easeInOut(seg(f, 0, 42)));
  const down = easeInOut(seg(f, 6, 20));
  const lift = easeInOut(seg(f, 26, 40));
  const clawY = lerp(250, 500, down) - lift * 210;
  const grip = easeOut(seg(f, 20, 26));
  const spread = lerp(92, 56, grip);
  const swing = Math.sin(f / 5) * (f < 6 ? 5 : 2);
  const ax = 1020;
  const grabbed = f >= 22;
  const pile: [number, number, "bread" | "cake" | "donut", number][] = [
    [660, 690, "cake", 0.5], [770, 676, "donut", 0.52], [880, 690, "bread", 0.5], [1130, 684, "cake", 0.52], [1240, 690, "donut", 0.5],
    [700, 748, "bread", 0.55], [820, 752, "cake", 0.55], [940, 748, "donut", 0.55], [1060, 752, "bread", 0.55], [1180, 748, "cake", 0.55], [1290, 752, "bread", 0.5],
  ];
  const happy = f > 30;
  return (
    <Frame f={f} seed={3213} bg={C.gcWall} dark>
      <g transform={cam(960, 480, z)}>
        {/* 壁とネオン管 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.gcWall} />
        {[[C.gcNeon, 120], [C.gcNeonPink, 200]].map(([c, yy], i) => (
          <g key={i} opacity={0.7 + 0.3 * Math.abs(Math.sin(f / (5 + i * 2)))}>
            <path d={`M -40 ${yy} ${Array.from({ length: 12 }, (_, k) => `L ${k * 180 + 90} ${(yy as number) + (k % 2 ? -26 : 26)}`).join(" ")}`}
              fill="none" stroke={c as string} strokeWidth={16} opacity={0.3} strokeLinejoin="round" />
            <path d={`M -40 ${yy} ${Array.from({ length: 12 }, (_, k) => `L ${k * 180 + 90} ${(yy as number) + (k % 2 ? -26 : 26)}`).join(" ")}`}
              fill="none" stroke={c as string} strokeWidth={6} strokeLinejoin="round" />
          </g>
        ))}
        {/* カーペット */}
        <rect x={-40} y={880} width={W + 80} height={240} fill={C.carpet} />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={(i % 10) * 200 + (Math.floor(i / 10) % 2) * 100} cy={910 + Math.floor(i / 10) * 60} r={10} fill={C.carpetDot} opacity={0.6} />
        ))}
        {/* 左右の別の台 */}
        <g>
          <rect x={-40} y={240} width={440} height={680} rx={16} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={7} />
          <rect x={20} y={320} width={320} height={380} fill={C.officeNight} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={70 + (i % 3) * 110} cy={420 + Math.floor(i / 3) * 140} r={34} fill={[KRP.yellow, KRP.green, KRP.red][i % 3]} stroke={C.ink} strokeWidth={4} opacity={0.75} />)}
          <rect x={1520} y={240} width={440} height={680} rx={16} fill={KRP.yellow} stroke={C.ink} strokeWidth={7} />
          <rect x={1580} y={320} width={360} height={380} fill={C.officeNight} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 4 }, (_, i) => <rect key={i} x={1610 + i * 80} y={560} width={60} height={120} rx={20} fill={KRP.blue} stroke={C.ink} strokeWidth={4} opacity={0.7} />)}
        </g>
        {/* クレーンゲームの台 */}
        <rect x={540} y={170} width={840} height={600} rx={10} fill={C.crane} stroke={C.ink} strokeWidth={8} />
        {/* ガラスの中 */}
        <rect x={600} y={196} width={720} height={560} fill={C.glassBack} stroke={C.ink} strokeWidth={6} />
        <rect x={600} y={196} width={720} height={30} fill={C.craneDark} opacity={0.5} />
        {/* 景品口 (アクリルの囲い) */}
        <rect x={612} y={560} width={150} height={196} fill={KRP.white} opacity={0.35} stroke={C.ink} strokeWidth={4} />
        {/* ウレタン製スクイーズがぎっしり */}
        {pile.map(([px, py, kind, s], i) => (
          <L5cUretan key={i} x={px} y={py} s={s} kind={kind} seed={30 + i} rot={(rnd(81, i) - 0.5) * 16}
            squeeze={0.04 * Math.abs(Math.sin(f / 6 + i))} face={i % 3 !== 1} />
        ))}
        {/* アームのレールと台車 */}
        <rect x={610} y={226} width={700} height={18} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        <rect x={ax - 50} y={218} width={100} height={36} rx={6} fill={KRP.silver} stroke={C.ink} strokeWidth={5} />
        <g transform={`rotate(${swing} ${ax} 250)`}>
          <line x1={ax} y1={254} x2={ax} y2={clawY} stroke={C.ink} strokeWidth={5} />
          {/* つかまれた食パン (爪の間で少し潰れる) */}
          {grabbed && <L5cUretan x={ax} y={clawY + 150} s={0.62} kind="bread" seed={99} squeeze={0.28 * grip} />}
          {/* 爪 3本 */}
          {[-1, 0, 1].map((d) => (
            <path key={d} d={`M ${ax + d * 30} ${clawY + 24} Q ${ax + d * (spread + 20)} ${clawY + 70} ${ax + d * spread} ${clawY + 130} L ${ax + d * (spread - 18)} ${clawY + 140}`}
              fill="none" stroke={C.ink} strokeWidth={d === 0 ? 9 : 13} strokeLinecap="round" strokeLinejoin="round" opacity={d === 0 ? 0.5 : 1} />
          ))}
          {[-1, 1].map((d) => (
            <path key={d} d={`M ${ax + d * 30} ${clawY + 24} Q ${ax + d * (spread + 20)} ${clawY + 70} ${ax + d * spread} ${clawY + 130} L ${ax + d * (spread - 18)} ${clawY + 140}`}
              fill="none" stroke={KRP.silver} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          <rect x={ax - 42} y={clawY - 6} width={84} height={40} rx={14} fill={KRP.silver} stroke={C.ink} strokeWidth={5} />
          <circle cx={ax} cy={clawY + 14} r={8} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 地面のパンはつかまれたら消える */}
        {!grabbed && <L5cUretan x={ax} y={650} s={0.62} kind="bread" seed={99} />}
        {/* ガラスの映り込み */}
        <path d="M 640 196 L 720 196 L 610 420 L 600 420 L 600 280 Z" fill={KRP.white} opacity={0.22} />
        <path d="M 1180 196 L 1230 196 L 1060 756 L 1010 756 Z" fill={KRP.white} opacity={0.12} />
        {/* 看板 (電飾つき) */}
        <rect x={540} y={60} width={840} height={124} rx={20} fill={C.craneDark} stroke={C.ink} strokeWidth={8} />
        <text x={960} y={146} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={KRP.white} stroke={C.ink} strokeWidth={4} paintOrder="stroke">スクイーズ</text>
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={566 + i * 46} cy={72} r={8} fill={(i + Math.floor(f / 4)) % 2 ? KRP.yellow : KRP.white} stroke={C.ink} strokeWidth={2.5} />
        ))}
        {/* 操作盤 */}
        <path d="M 540 770 L 1380 770 L 1400 860 L 520 860 Z" fill={C.crane} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={540} y={860} width={840} height={260} fill={C.craneDark} stroke={C.ink} strokeWidth={7} />
        <line x1={800} y1={812} x2={800 + Math.sin(f / 3) * 10} y2={760} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <circle cx={800 + Math.sin(f / 3) * 10} cy={756} r={20} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={1060} cy={812} rx={36} ry={16} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} />
        <rect x={1220} y={790} width={90} height={44} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <text x={1265} y={822} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>100円</text>
        {/* 札 */}
        <TagPlate x={300} y={260} text="2017年ごろ" size={48} t={seg(f, 2, 12)} rot={-3} />
        <TagPlate x={1640} y={560} text="ウレタン" size={52} t={seg(f, 24, 34)} rot={3} />
        <Arrow x={1350} y={570} s={0.8} rot={180} t={seg(f, 28, 36)} />
        {/* 右の客 (2017年の若者)。つかんだ瞬間にばんざい */}
        <Person x={1620} y={1000} s={1.25} f={f} cloth={C.player} clothDark={C.playerDark}
          face={happy ? "joy" : f > 20 ? "surprised" : "normal"} pose={happy ? "banzai" : "hold"} gaze={[-8, -4]} lean={-6} />
      </g>
    </Frame>
  );
};

// ---- 文#214 【山】 そして2026年の今、流行っているのは、中国のSNSから広まった、シリコンのものです。
// 設計: 序 #2 と同じ夜の子ども部屋・同じスマホのライブ配信画面。画面の中に半透明のシリコン製 `Squishy`。札「2026年」「シリコン」
// どこ: 序 #2 と同じ夜の子ども部屋・同じ机・同じ子ども2人・机に立てた同じスマホ
// 演出: ライブ配信の画面に、半透明シリコンの Squishy。配信者の両手がむにゅっと握る。LIVE の横に中国の国旗アイコン、コメントは「好可爱」とハート。カレンダーの横に「2026年」
// 動き: f8〜20 両手で握る / f20〜32 離すとゆっくり戻る / ハートが湧き上がる / 視聴者数が増える / 子どもが身を乗り出す / カメラは #2 と同じく寄る
const Yw214: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1, 1.08, easeInOut(seg(f, 0, 42)));
  const grab = f < 40 ? easeOut(seg(f, 10, 24)) : 1 - easeOut(seg(f, 40, 56));
  const q = 0.75 * grab;
  const dent = grab;
  const comments = ["好可爱", "♡", "!!", "♡♡", "好可爱", "♡"];
  const sqx = 890, sqy = 594, sqs = 0.92;
  const handX = (d: number) => sqx + d * lerp(210, 150, grab);
  return (
    <Frame f={f} seed={3214} bg={C.nightWall} dark>
      <g transform={cam(960, 460, zoom)}>
        <L5cKidsRoom f={f} />
        <Person x={540} y={790} s={1.15} f={f} cloth={C.kidA} clothDark={C.kidADark}
          face={grab > 0.4 ? "joy" : "smile"} pose="hold" lean={lerp(4, 10, seg(f, 6, 20))} gaze={[6, 2]} />
        <Person x={1380} y={790} s={1.15} f={f} phase={2} cloth={C.kidB} clothDark={C.kidBDark}
          face={grab > 0.4 ? "surprised" : "smile"} pose="hold" lean={lerp(-5, -11, seg(f, 8, 22))} gaze={[-6, 2]} />
        {[540, 1380].map((px, j) => (
          <g key={px} transform={`translate(${px} 790) scale(1.15) rotate(${j ? lerp(-5, -11, seg(f, 8, 22)) : lerp(4, 10, seg(f, 6, 20))})`}>
            {[[-34, -140], [10, -120], [-20, -86], [32, -80], [36, -146]].map(([dx, dy], i) => (
              <circle key={i} cx={dx} cy={dy} r={5} fill={KRP.white} opacity={0.75} />
            ))}
          </g>
        ))}
        <L5cKidsDesk lampOn />
        {/* スマホ (序 #2 と同じ位置・同じ形) */}
        <polygon points="900,690 960,620 1020,690" fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
        <rect x={650} y={262} width={620} height={384} rx={36} fill={C.phone} stroke={C.ink} strokeWidth={8} />
        <defs><clipPath id="l5c214scr"><rect x={680} y={290} width={560} height={328} rx={14} /></clipPath></defs>
        <g clipPath="url(#l5c214scr)">
          <rect x={680} y={290} width={560} height={328} fill={C.screen} />
          {/* 配信のテーブル (淡いピンクの布) */}
          <rect x={680} y={560} width={420} height={60} fill={YP.sqShine} />
          <line x1={680} y1={560} x2={1100} y2={560} stroke={YP.sqDeep} strokeWidth={3} opacity={0.6} />
          {/* 主役: 半透明シリコンの Squishy と、配信者の両手 */}
          <Squishy x={sqx} y={sqy} s={sqs} squeeze={q} dent={dent} f={f} />
          {[-1, 1].map((d) => (
            <g key={d} transform={`translate(${handX(d)} ${sqy - 92}) scale(${d} 1)`}>
              <rect x={20} y={-34} width={160} height={68} rx={26} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} />
              <path d="M -46 -30 Q -60 0 -46 30 L 26 30 L 26 -30 Z" fill={C.skin} stroke={C.ink} strokeWidth={4} />
              {[-22, -6, 10, 26].map((fy, i) => (
                <rect key={i} x={-62} y={fy - 8} width={36} height={16} rx={8} fill={C.skin} stroke={C.ink} strokeWidth={3} />
              ))}
            </g>
          ))}
          {/* むにゅっ の線 */}
          {grab > 0.5 && (
            <g stroke={YP.sqDeep} strokeWidth={4} strokeLinecap="round" fill="none" opacity={grab}>
              <path d={`M ${sqx - 40} ${sqy - 230} q 10 -14 0 -26`} />
              <path d={`M ${sqx + 40} ${sqy - 230} q -10 -14 0 -26`} />
            </g>
          )}
          {/* 上の帯: LIVE と中国の国旗アイコン */}
          <rect x={680} y={290} width={560} height={56} fill={C.screenBar} />
          <rect x={696} y={302} width={112} height={34} rx={6} fill={KRP.red} />
          <circle cx={712} cy={319} r={6} fill={KRP.white} opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 4))} />
          <text x={766} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white}>LIVE</text>
          <L5cFlagCN x={820} y={304} w={46} />
          <text x={880} y={330} fontFamily={FONT} fontWeight={800} fontSize={24} fill={KRP.gray}>{`${(12.4 + f * 0.11).toFixed(1)}万人`}</text>
          {/* 湧き上がるハート */}
          {Array.from({ length: 7 }, (_, i) => {
            const u = ((f * 1.3 + i * 17) % 60) / 60;
            const hx = 1030 + Math.sin(u * 6 + i) * 24 + (i % 3) * 18;
            const hy = 600 - u * 250;
            return (
              <path key={i} d="M 0 4 c -10 -14 -30 -4 -18 12 l 18 16 l 18 -16 c 12 -16 -8 -26 -18 -12 z"
                transform={`translate(${hx} ${hy}) scale(${0.6 + 0.4 * (1 - u)})`} fill={i % 2 ? KRP.red : YP.sqDeep} opacity={1 - u} />
            );
          })}
          {/* 右のコメント欄 */}
          <rect x={1100} y={346} width={140} height={272} fill={C.screenBar} opacity={0.12} />
          {comments.map((c, i) => {
            const cy = 610 - (((f * 5 + i * 52) % 300));
            return (
              <g key={i}>
                <rect x={1110} y={cy - 30} width={120} height={38} rx={19} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />
                <text x={1170} y={cy - 3} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={i % 2 ? KRP.red : C.ink}>{c}</text>
              </g>
            );
          })}
        </g>
        <circle cx={960} cy={276} r={6} fill={KRP.grayDark} />
        {/* 札 */}
        <TagPlate x={960} y={200} text="シリコン" size={48} t={seg(f, 14, 24)} />
        <TagPlate x={1560} y={340} text="2026年" size={44} t={seg(f, 4, 14)} rot={3} />
      </g>
    </Frame>
  );
};

// ---- 文#215 【図】 素材も、生まれた国も変わったのに、スクイーズは、また流行りました。
// 設計: 2つを並べる図 (世界=玩具店の展示台)。左にウレタン製 (2017年・日本)、右にシリコン製 `Squishy` (2026年・中国発)。間に矢印。両方とも f でむにっと潰れて戻る
// どこ: 玩具店の展示台。奥の棚におもちゃの箱、天井のスポットライト、緑のフェルトの台に金のふさ
// 演出: 左のアクリル台にウレタン製の食パン (日本の旗・2017年)、右にシリコン製の Squishy (中国の旗・2026年)。間に矢印。上から指がおりて、両方を順番にむにっ → 最後は同時にむにっ
// 動き: f6〜22 左を押す / f18〜34 右を押す / f34〜42 両方同時に押す (f45 で両方つぶれている) / スポットの光がゆれる / カメラは少し寄る
const Yw215: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.05, easeInOut(seg(f, 0, 42)));
  const pressK = (a: number, b: number, c: number, d: number) =>
    f < a ? 0 : f < b ? easeOut(seg(f, a, b)) : f < c ? 1 : 1 - easeOut(seg(f, c, d));
  const near = (a: number, d: number) => seg(f, a - 6, a) * (1 - seg(f, d, d + 6));
  const qL = 0.5 * Math.max(pressK(6, 12, 16, 22), pressK(34, 40, 70, 76));
  const qR = 0.5 * Math.max(pressK(18, 24, 28, 34), pressK(34, 40, 70, 76));
  const nL = Math.max(near(6, 22), near(34, 76));
  const nR = Math.max(near(18, 34), near(34, 76));
  const base = 540;
  const lx = 560, rx = 1360;
  const topL = base - 187 * 1.45 * (1 - 0.25 * qL);
  const topR = base - 186 * 1.2 * (1 - 0.3 * qR);
  const finger = (x: number, tip: number, n: number) => {
    const ty = lerp(-80, tip + 6, n);
    return (
      <g>
        <rect x={x - 38} y={ty - 420} width={76} height={420} rx={36} fill={C.skin} stroke={C.ink} strokeWidth={6} />
        <ellipse cx={x} cy={ty - 34} rx={24} ry={20} fill={C.nail} stroke={C.ink} strokeWidth={3} />
        <path d={`M ${x - 22} ${ty - 120} q 22 10 44 0`} fill="none" stroke={C.skinDark} strokeWidth={3.5} />
        <rect x={x - 54} y={ty - 520} width={108} height={130} rx={18} fill={C.knit} stroke={C.ink} strokeWidth={6} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={3215} bg={C.shopWall}>
      <g transform={cam(960, 500, z)}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.shopWall} />
        {/* 奥の棚とおもちゃの箱 (少しぼかした色) */}
        {[160, 400].map((sy) => (
          <g key={sy}>
            <rect x={-40} y={sy + 150} width={W + 80} height={18} fill={C.shelfDark} stroke={C.ink} strokeWidth={4} opacity={0.6} />
            {Array.from({ length: 12 }, (_, i) => {
              const bw = 90 + rnd(sy, i) * 60, bh = 90 + rnd(sy + 1, i) * 60;
              return <rect key={i} x={i * 168 + 10} y={sy + 150 - bh} width={bw} height={bh} rx={6}
                fill={[KRP.blue, KRP.yellow, KRP.green, C.kidA, KRP.red][i % 5]} stroke={C.ink} strokeWidth={4} opacity={0.4} />;
            })}
          </g>
        ))}
        {/* スポットライト */}
        {[lx, rx].map((sx, i) => (
          <g key={sx}>
            <rect x={sx - 40} y={-10} width={80} height={40} rx={8} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
            <polygon points={`${sx - 30},30 ${sx + 30},30 ${sx + 230},620 ${sx - 230},620`} fill={KRP.yellow} opacity={0.14 + 0.04 * Math.sin(f / 7 + i)} />
          </g>
        ))}
        {/* 展示台 */}
        <rect x={-40} y={620} width={W + 80} height={44} fill={YP.wood} stroke={C.ink} strokeWidth={6} />
        <rect x={-40} y={664} width={W + 80} height={460} fill={C.felt} stroke={C.ink} strokeWidth={6} />
        <path d={`M -40 690 ${Array.from({ length: 40 }, (_, i) => `L ${i * 50} ${690 + (i % 2) * 14}`).join(" ")}`} fill="none" stroke={C.fringe} strokeWidth={5} />
        {/* 矢印 */}
        <Arrow x={1040} y={420} s={1.35} t={seg(f, 2, 12)} />
        {[lx, rx].map((cx, i) => (
          <g key={cx}>
            <ellipse cx={cx} cy={622} rx={200} ry={14} fill={C.ink} opacity={0.18} />
            {/* アクリルの台 */}
            <rect x={cx - 170} y={base} width={340} height={80} rx={6} fill={KRP.white} opacity={0.45} stroke={C.ink} strokeWidth={5} />
            <line x1={cx - 150} y1={base + 12} x2={cx + 150} y2={base + 12} stroke={KRP.white} strokeWidth={4} opacity={0.8} />
            <TagPlate x={cx} y={base + 44} text={i ? "シリコン" : "ウレタン"} size={30} t={seg(f, 4 + i * 4, 12 + i * 4)} />
          </g>
        ))}
        {/* 旗の小さなスタンド */}
        {[[lx - 340, 0], [rx + 210, 1]].map(([fx, k]) => (
          <g key={k} transform={`rotate(${Math.sin(f / 10 + k) * 2} ${fx} 620)`}>
            <line x1={fx} y1={620} x2={fx} y2={430} stroke={C.ink} strokeWidth={6} />
            {k ? <L5cFlagCN x={fx} y={430} w={110} /> : <L5cFlagJP x={fx} y={430} w={110} />}
          </g>
        ))}
        {/* 主役2つ */}
        <L5cUretan x={lx} y={base} s={1.45} kind="bread" seed={7} squeeze={qL} />
        <Squishy x={rx} y={base} s={1.2} squeeze={qR} dent={qR * 1.6} f={f} />
        {/* むにっ の線 */}
        {[[lx, qL], [rx, qR]].map(([cx, q], i) => q > 0.15 ? (
          <g key={i} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={q * 1.6}>
            <line x1={cx - 200} y1={base - 100} x2={cx - 240} y2={base - 110} />
            <line x1={cx - 196} y1={base - 50} x2={cx - 240} y2={base - 44} />
            <line x1={cx + 200} y1={base - 100} x2={cx + 240} y2={base - 110} />
            <line x1={cx + 196} y1={base - 50} x2={cx + 240} y2={base - 44} />
          </g>
        ) : null)}
        {finger(lx, topL, nL)}
        {finger(rx, topR, nR)}
        {/* 値札の札 */}
        <TagPlate x={lx} y={752} text="2017年・日本" size={40} t={seg(f, 2, 12)} rot={-2} />
        <TagPlate x={rx} y={752} text="2026年・中国発" size={40} t={seg(f, 8, 18)} rot={2} />
      </g>
    </Frame>
  );
};

// ---- 文#216 【並】 人が柔らかいものを握りたくなる理由。それは、2つあります。
// 設計: 大きな手のひらが画面の下から開く (手の超アップ。顔のある絵ではない)。手のひらの上に「2」の札がぽん
// どこ: 夕方の部屋の中 (ぼけた窓の光・本棚の色・ランプの玉ボケ)。その手前に、画面いっぱいの手のひら (ニットの袖)
// 演出: 下から握りこぶしがせり上がり、ぱっと開く。開いた手のひらに「2」の木札が上から落ちてきて、ぽんと乗る。手のひらが受け止めて少し沈む
// 動き: f0〜14 せり上がる / f6〜22 指が開く / f22〜30 札が落ちて乗る (着地で手が沈み、光の線) / 玉ボケがただよう / カメラはわずかに寄る
const Yw216: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.05, easeInOut(seg(f, 0, 42)));
  const rise = lerp(320, 0, easeOut(seg(f, 0, 14)));
  const open = easeOut(seg(f, 6, 22));
  const drop = seg(f, 22, 30);
  const landed = f >= 30;
  const dip = landed ? Math.sin(seg(f, 30, 40) * Math.PI) * 18 : 0;
  const plateY = landed ? 0 : lerp(-620, 0, drop * drop);
  const hx = 960, hy = 960 + rise + dip;
  const fingers: [number, number][] = [[-170, 250], [-58, 292], [58, 276], [168, 214]];
  return (
    <Frame f={f} seed={3216} bg={C.warmBg}>
      <g transform={cam(960, 600, z)}>
        {/* 奥の部屋 (ぼけた色の面) */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.warmBg} />
        <rect x={120} y={60} width={420} height={520} rx={30} fill={KRP.white} opacity={0.5} />
        <rect x={150} y={90} width={170} height={460} rx={20} fill={C.beam} opacity={0.5} />
        <rect x={350} y={90} width={170} height={460} rx={20} fill={C.beam} opacity={0.5} />
        <rect x={1380} y={80} width={460} height={700} rx={24} fill={YP.wood} opacity={0.35} />
        {[0, 1, 2].map((r) => Array.from({ length: 5 }, (_, i) => (
          <rect key={`${r}-${i}`} x={1410 + i * 84} y={110 + r * 220} width={60} height={170} rx={12}
            fill={[KRP.blue, C.kidA, KRP.green, KRP.yellow, KRP.red][(i + r) % 5]} opacity={0.3} />
        )))}
        <rect x={-40} y={800} width={W + 80} height={320} fill={C.deskWood} opacity={0.55} />
        {/* 玉ボケ */}
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={rnd(91, i) * 1920 + Math.sin(f / 20 + i) * 20} cy={rnd(92, i) * 700 + Math.cos(f / 24 + i) * 14}
            r={30 + rnd(93, i) * 50} fill={[KRP.yellow, KRP.white, C.lamp][i % 3]} opacity={0.22} />
        ))}
        {/* 手 (手のひら側・超アップ) */}
        <g transform={`translate(${hx} ${hy})`}>
          {/* 指4本 (曲がっているときは短く、開くと伸びる) */}
          {fingers.map(([fx, len], i) => {
            const L = len * lerp(0.28, 1, open);
            const tiltA = (i - 1.5) * lerp(2, 7, open);
            return (
              <g key={i} transform={`rotate(${tiltA} ${fx} -400)`}>
                <rect x={fx - 50} y={-400 - L} width={100} height={L + 80} rx={50} fill={C.skin} stroke={C.ink} strokeWidth={7} />
                {open > 0.5 && [0.36, 0.68].map((k) => (
                  <path key={k} d={`M ${fx - 30} ${-400 - L * k} q 30 10 60 0`} fill="none" stroke={C.skinDark} strokeWidth={4} opacity={open} />
                ))}
                <ellipse cx={fx} cy={-400 - L + 36} rx={26} ry={20} fill={C.nail} opacity={0.35 * open} />
              </g>
            );
          })}
          {/* 親指 */}
          <g transform={`rotate(${lerp(30, -40, open)} -220 -170)`}>
            <rect x={-270} y={-400} width={104} height={250} rx={52} fill={C.skin} stroke={C.ink} strokeWidth={7} />
            <path d="M -250 -300 q 32 10 64 0" fill="none" stroke={C.skinDark} strokeWidth={4} />
          </g>
          {/* 手のひら */}
          <path d="M -236 40 L -246 -250 Q -254 -390 -200 -420 L 210 -420 Q 254 -390 246 -250 L 236 40 Z"
            fill={C.skin} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <path d="M -200 -420 Q 0 -440 210 -420" fill="none" stroke={C.skinDark} strokeWidth={4} />
          {/* 手相のしわ */}
          <path d="M -200 -300 Q -40 -330 180 -250" fill="none" stroke={C.skinDark} strokeWidth={5} strokeLinecap="round" />
          <path d="M -210 -220 Q -60 -240 120 -170" fill="none" stroke={C.skinDark} strokeWidth={5} strokeLinecap="round" />
          <path d="M -150 -320 Q -60 -160 -100 0" fill="none" stroke={C.skinDark} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={-120} cy={-110} rx={90} ry={80} fill={C.skinDark} opacity={0.18} />
          {/* ニットの袖 */}
          <rect x={-280} y={20} width={560} height={200} rx={30} fill={C.knit} stroke={C.ink} strokeWidth={7} />
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={-260 + i * 42} y1={34} x2={-260 + i * 42} y2={200} stroke={C.knitDark} strokeWidth={6} />)}
          {/* 「2」の木札 */}
          <g transform={`translate(0 ${-250 + plateY}) rotate(${landed ? Math.sin(f / 6) * 1.5 : lerp(-18, 0, drop)})`}>
            <ellipse cx={0} cy={118} rx={140} ry={16} fill={C.ink} opacity={landed ? 0.22 : 0.08} />
            <rect x={-130} y={-120} width={260} height={230} rx={22} fill={KRP.white} stroke={C.ink} strokeWidth={8} />
            <rect x={-114} y={-104} width={228} height={198} rx={14} fill="none" stroke={YP.wood} strokeWidth={4} opacity={0.6} />
            <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={200} fill={KRP.red} stroke={C.ink} strokeWidth={5} paintOrder="stroke">2</text>
          </g>
          {/* 着地の光の線 */}
          {f >= 30 && f < 42 && (
            <g stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round" opacity={1 - seg(f, 30, 42)}>
              {[-1, 1].map((d) => (
                <g key={d}>
                  <line x1={d * 160} y1={-150} x2={d * (200 + 40 * seg(f, 30, 42))} y2={-170} />
                  <line x1={d * 150} y1={-340} x2={d * (190 + 50 * seg(f, 30, 42))} y2={-380} />
                </g>
              ))}
            </g>
          )}
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#217 【山】 ひとつは、手を守るためです。
// 設計: 序 #6 の夜のオフィス、同じ眼鏡の会社員。ただし今度は、太くて柔らかいペンで書類に書いていて、手が痛くない顔 (smile)。札「手を守る」
// どこ: 序 #6 と同じ夜22時のオフィス (窓の夜景・壁の時計・黒い椅子・ノートPC・書類の山・マグ)。今回は机の前板はふつうの板
// 演出: 同じ眼鏡の会社員が、太くて柔らかいグリップのペンで書類にさらさら書く。にこにこ顔で鼻歌の音符。机の端には細いペンが置き去り
// 動き: ペンが f で左右に動き、インクの線がのびる / グリップがふにっとたわむ線 / 音符がのぼる / f8〜18 札 / カメラは顔と手元へ寄る
const Yw217: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.16, easeInOut(seg(f, 0, 42)));
  const px = 900, py = 780, ps = 1.3;
  const prog = seg(f, 2, 42);
  const wig = Math.sin(f / 1.6) * 9;
  const tipX = 1040 + prog * 150 + wig;
  const tipY = 622 + Math.cos(f / 1.6) * 2;
  const sh = { x: px + 67 * ps, y: py - 148 * ps + Math.sin(f / 13) * 3 };
  const hand = { x: tipX + 26, y: tipY - 34 };
  const ink = Array.from({ length: Math.max(2, Math.floor(prog * 30)) }, (_, k) => `${1030 + k * 5.2},${620 + Math.sin(k * 1.7) * 3}`).join(" ");
  return (
    <Frame f={f} seed={3217} bg={C.officeWall} dark>
      <g transform={cam(1020, 560, z)}>
        <L5cOfficeBack f={f} />
        <Person x={px} y={py} s={ps} f={f} cloth={C.shirt} clothDark={C.officeNight} face="smile" gaze={[8, 6]} glasses />
        <L5cTie px={px} py={py} ps={ps} f={f} blush={0.7} />
        <L5cOfficeDesk f={f} see={false} />
        <L5cOfficeTop f={f} pileX={1300} />
        {/* 書類 (机の上に置いた紙) */}
        <polygon points="1000,632 1260,632 1240,606 1020,606" fill={C.paper} stroke={C.ink} strokeWidth={4} />
        {[612, 620].map((ly) => <line key={ly} x1={1030} y1={ly} x2={1230} y2={ly} stroke={C.ruled} strokeWidth={2} />)}
        <polyline points={ink} fill="none" stroke={KRP.blueDeep} strokeWidth={3.5} strokeLinejoin="round" />
        {/* 置き去りの細いペン */}
        <rect x={1180} y={636} width={120} height={8} rx={4} fill={KRP.grayDark} stroke={C.ink} strokeWidth={2} transform="rotate(-4 1240 640)" />
        {/* 書く腕 (肩から手元へ) */}
        <line x1={sh.x} y1={sh.y} x2={hand.x} y2={hand.y} stroke={C.ink} strokeWidth={36} strokeLinecap="round" />
        <line x1={sh.x} y1={sh.y} x2={hand.x} y2={hand.y} stroke={C.shirt} strokeWidth={27} strokeLinecap="round" />
        {/* 太くて柔らかいペン */}
        <g transform={`translate(${tipX} ${tipY}) rotate(-62)`}>
          <polygon points="0,0 22,-10 22,10" fill={KRP.grayDark} stroke={C.ink} strokeWidth={3} />
          <rect x={20} y={-17} width={72} height={34} rx={14} fill={C.grip} stroke={C.ink} strokeWidth={4} />
          {[32, 46, 60, 74].map((gx) => <circle key={gx} cx={gx} cy={(gx % 28) - 8} r={3} fill={C.gripDark} />)}
          <rect x={90} y={-12} width={90} height={24} rx={10} fill={C.penBody} stroke={C.ink} strokeWidth={4} />
          <rect x={176} y={-13} width={16} height={26} rx={5} fill={KRP.grayDark} stroke={C.ink} strokeWidth={3} />
        </g>
        <circle cx={hand.x} cy={hand.y} r={15} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        {/* ふにっ (グリップがたわむ) */}
        <g stroke={C.grip} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.6 + 0.4 * Math.abs(Math.sin(f / 3))}>
          <path d={`M ${hand.x - 34} ${hand.y - 10} q -10 10 0 20`} />
          <path d={`M ${hand.x + 34} ${hand.y - 10} q 10 10 0 20`} />
        </g>
        {/* 鼻歌の音符 */}
        {[0, 1, 2].map((i) => {
          const u = ((f + i * 14) % 42) / 42;
          return (
            <text key={i} x={px - 90 - u * 60 + Math.sin(u * 7) * 10} y={py - 300 - u * 140} fontFamily={FONT} fontWeight={900}
              fontSize={44} fill={KRP.yellow} stroke={C.ink} strokeWidth={2.5} paintOrder="stroke" opacity={Math.sin(u * Math.PI)}>♪</text>
          );
        })}
        {/* 札 */}
        <TagPlate x={1430} y={450} text="手を守る" size={52} t={seg(f, 8, 18)} rot={-2} />
      </g>
    </Frame>
  );
};

// ---- 文#218 【並】 痛くない、負担が少ない。こちらは、かなり確かです。
// 設計: 太軸のペンを握る手のアップ。痛みの赤い線が出ない。横に大きな `Maru`。札「かなり確か」
// どこ: #217 の書類の上 (手元の超アップ)。罫線の紙・前の行の書きあと・机の木目のふち・クリップ
// 演出: 太軸の柔らかいペンを握る手。指の関節のまわりに「痛みの線が出る場所」の点線の輪があるが、赤い線は出ないまま。左上の痛みメーターも 0 のまま。右に大きな Maru
// 動き: ペン先が f で右へ進み、インクの線がのびる / メーターの針は 0 付近でかすかにゆれるだけ / f20〜30 Maru がぽん / f26〜36 札 / カメラはペン先を追って少しパン
const Yw218: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(0, -40, easeInOut(seg(f, 0, 42)));
  const prog = seg(f, 0, 42);
  const tipX = 560 + prog * 160 + Math.sin(f / 1.8) * 8;
  const tipY = 660 + Math.cos(f / 1.8) * 5;
  const inkPts = Array.from({ length: Math.max(2, Math.floor(prog * 40) + 2) }, (_, k) => {
    const x = 300 + k * ((tipX - 300) / Math.max(1, Math.floor(prog * 40) + 1));
    return `${x.toFixed(1)},${(660 + Math.sin(k * 1.3) * 10 - (k % 4 === 0 ? 12 : 0)).toFixed(1)}`;
  }).join(" ");
  const needle = -80 + Math.sin(f / 5) * 3;
  return (
    <Frame f={f} seed={3218} bg={C.deskWood}>
      <g transform={`translate(${pan} 0)`}>
        <rect x={-80} y={-40} width={W + 160} height={H + 80} fill={C.deskWood} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -80 ${80 + i * 190} q 520 ${rnd(95, i) * 30 - 15} 1040 0 q 520 ${rnd(96, i) * 30 - 15} 1040 0`} fill="none" stroke={C.deskWoodDark} strokeWidth={5} opacity={0.4} />
        ))}
        {/* 紙 (罫線) */}
        <g transform="rotate(-3 960 560)">
          <rect x={140} y={110} width={1720} height={1000} fill={C.paper} stroke={C.ink} strokeWidth={7} />
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={140} y1={220 + i * 92} x2={1860} y2={220 + i * 92} stroke={C.ruled} strokeWidth={3} />)}
          <line x1={260} y1={110} x2={260} y2={1110} stroke={KRP.red} strokeWidth={3} opacity={0.5} />
          {/* 前の行の書きあと */}
          {[300, 392, 484, 576].map((ly, r) => (
            <polyline key={ly} points={Array.from({ length: 40 }, (_, k) => `${300 + k * (r === 3 ? 0 : 30)},${ly - 6 + Math.sin(k * 1.3 + r) * 9}`).join(" ")}
              fill="none" stroke={KRP.blueDeep} strokeWidth={4} strokeLinejoin="round" opacity={r === 3 ? 0 : 0.75} />
          ))}
        </g>
        <polyline points={inkPts} fill="none" stroke={KRP.blueDeep} strokeWidth={5} strokeLinejoin="round" />
        {/* 痛みメーター (0 のまま) */}
        <g transform="translate(330 230)">
          <rect x={-130} y={-90} width={260} height={150} rx={16} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d="M -90 30 A 90 90 0 0 1 90 30" fill="none" stroke={KRP.gray} strokeWidth={14} />
          <path d="M 40 -52 A 90 90 0 0 1 90 30" fill="none" stroke={KRP.red} strokeWidth={14} />
          <line x1={0} y1={30} x2={0} y2={-60} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${needle} 0 30)`} />
          <circle cx={0} cy={30} r={10} fill={C.ink} />
          <text x={-86} y={-56} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>痛み</text>
          <text x={-100} y={56} fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.green}>0</text>
        </g>
        {/* ワイシャツの袖 (手首から右下の画面外へ) */}
        <line x1={tipX + 430} y1={tipY - 110} x2={tipX + 1500} y2={tipY + 640} stroke={C.ink} strokeWidth={232} strokeLinecap="round" />
        <line x1={tipX + 430} y1={tipY - 110} x2={tipX + 1500} y2={tipY + 640} stroke={C.shirt} strokeWidth={218} strokeLinecap="round" />
        <line x1={tipX + 500} y1={tipY - 60} x2={tipX + 1500} y2={tipY + 640} stroke={C.shirtDark} strokeWidth={60} strokeLinecap="round" opacity={0.6} />
        <path d={`M ${tipX + 420} ${tipY - 230} L ${tipX + 330} ${tipY + 0}`} stroke={C.ink} strokeWidth={5} />
        <circle cx={tipX + 470} cy={tipY - 90} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        {/* 手とペン (ペン先を原点に、ペンの軸を右上へ) */}
        <g transform={`translate(${tipX} ${tipY}) rotate(-38)`}>
          {/* 袖 (ワイシャツのカフス) */}
          {/* ペン先・柔らかいグリップ・軸 */}
          <polygon points="0,0 50,-22 50,22" fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={46} y={-46} width={230} height={92} rx={40} fill={C.grip} stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={70 + (i % 7) * 30} cy={i < 7 ? -18 : 18} r={5} fill={C.gripDark} />)}
          <rect x={270} y={-34} width={300} height={68} rx={20} fill={C.penBody} stroke={C.ink} strokeWidth={6} />
          <rect x={560} y={-36} width={44} height={72} rx={12} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
          {/* 手の甲とにぎる指 (グリップがやわらかくたわむ) */}
          <path d="M 120 50 Q 170 200 330 230 Q 430 220 420 110 Q 400 30 300 40 Q 220 44 160 40 Z" fill={C.skin} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={140 + i * 52} cy={64 + i * 18} rx={36} ry={30} fill={C.skin} stroke={C.ink} strokeWidth={6} />
          ))}
          {/* 人さし指 (軸の上) */}
          <rect x={80} y={-74} width={240} height={52} rx={26} fill={C.skin} stroke={C.ink} strokeWidth={6} />
          <ellipse cx={104} cy={-48} rx={16} ry={14} fill={C.nail} stroke={C.ink} strokeWidth={3} />
          {/* 親指 (手前) */}
          <rect x={110} y={14} width={200} height={50} rx={25} fill={C.skin} stroke={C.ink} strokeWidth={6} />
          <ellipse cx={132} cy={39} rx={15} ry={13} fill={C.nail} stroke={C.ink} strokeWidth={3} />
          {/* 痛みの線が出るはずの場所 (点線の輪のまま、赤い線は出ない) */}
          {[[210, -48], [200, 39], [290, 150]].map(([a, b], i) => (
            <circle key={i} cx={a} cy={b} r={40} fill="none" stroke={KRP.gray} strokeWidth={4} strokeDasharray="8 8"
              strokeDashoffset={f} opacity={0.8} />
          ))}
          {/* ふにっ */}
          <g stroke={C.gripDark} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 4))}>
            <path d="M 60 -62 q -14 -10 -26 4" />
            <path d="M 60 62 q -14 10 -26 -4" />
          </g>
        </g>
        <Maru x={1560} y={300} s={1.7} t={seg(f, 20, 30)} />
        <TagPlate x={1560} y={540} text="かなり確か" size={56} t={seg(f, 26, 36)} rot={2} />
      </g>
    </Frame>
  );
};

// ---- 文#219 【山】 もうひとつは、心を落ち着かせるためです。
// 設計: 序 #6 と同じ会社員が、机の下でこっそり `Squishy` を握って、ほっと息をつく (序と同じ構図の呼び返し)。札「心を落ち着かせる」
// どこ: 序 #6 とまったく同じ構図 (夜22時のオフィス・机の下は半透明の断面・椅子・PC・書類の山・マグ)
// 演出: 同じ会社員が机の下でこっそり Squishy をもみもみ。今度は目を閉じて「ふう」と息をつく (白い息のもや)。肩が下がる。PCの画面は心拍の波で、ぎざぎざが静まっていく。Squishy からやわらかな輪が広がる
// 動き: もみもみ (f) / f16〜 目を閉じる / f18〜40 息のもやがのびて薄れる / f16〜30 肩が下がる / 心拍の波が小さくなり赤→緑 / f10〜20 札 / カメラは #6 と同じく少し下がる
const Yw219: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1, 1.06, easeInOut(seg(f, 0, 42)));
  const dy = lerp(0, -30, easeInOut(seg(f, 10, 42)));
  const knead = 0.35 + 0.3 * Math.abs(Math.sin(f / 5));
  const relax = easeOut(seg(f, 16, 30));
  const px = 900, py = 840 + relax * 8, ps = 1.3;
  const puff = seg(f, 18, 40);
  return (
    <Frame f={f} seed={3219} bg={C.officeWall} dark>
      <g transform={cam(960, 540, z, 0, dy)}>
        <L5cOfficeBack f={f} />
        <Person x={px} y={py} s={ps} f={f} cloth={C.shirt} clothDark={C.officeNight}
          face={f > 16 ? "joy" : "normal"} gaze={[-8, 2]} glasses />
        <L5cTie px={px} py={py} ps={ps} f={f} blush={relax} />
        <L5cOfficeDesk f={f} />
        {/* 机の下のスクイーズ (両手でもみもみ) とやわらかな輪 */}
        {[0, 1, 2].map((i) => {
          const u = ((f + i * 14) % 42) / 42;
          return <ellipse key={i} cx={px} cy={py - 110} rx={90 + u * 220} ry={50 + u * 110} fill="none" stroke={YP.sqBody} strokeWidth={6} opacity={(1 - u) * 0.6 * relax} />;
        })}
        <Squishy x={px} y={py - 50} s={0.6} squeeze={knead} dent={knead} f={f} />
        {[-1, 1].map((d) => (
          <circle key={d} cx={px + d * (82 + knead * 18)} cy={py - 92} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        ))}
        <L5cOfficeTop f={f} mode="calm" />
        {/* ふう (白い息のもや) */}
        {puff > 0 && (
          <g opacity={1 - puff * 0.4}>
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={px - 30 - puff * (60 + i * 50)} cy={py - 190 * ps - puff * (20 + i * 26)} rx={(18 + i * 10) * (0.6 + puff)} ry={(12 + i * 6) * (0.6 + puff)}
                fill={KRP.white} stroke={C.ink} strokeWidth={3} opacity={0.85} />
            ))}
          </g>
        )}
        {/* 下がった肩の線 */}
        {relax > 0.2 && [-1, 1].map((d) => (
          <path key={d} d={`M ${px + d * 110} ${py - 230 * ps} q ${d * 14} 12 ${d * 6} 26`} fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={relax * 0.8} />
        ))}
        <TagPlate x={1430} y={420} text="心を落ち着かせる" size={46} t={seg(f, 10, 20)} rot={-2} />
      </g>
    </Frame>
  );
};

// ---- 文#220 【並】 こちらは、まだ科学では、説明しきれません。
// 設計: #219 の会社員の頭上に、科学の道具 (顕微鏡・グラフ) が浮かび、そこに大きな `QMark`。正直な「わからない」
// どこ: #219 の続き (同じオフィス・同じ会社員。机の下でまだもみもみ)。カメラは頭の上へ上がる
// 演出: 会社員の頭上に考えごとの雲。中に顕微鏡 (台にスクイーズの切片) と、ばらばらの点に長い誤差の棒がついたグラフ。グラフの線は傾きが決まらずふらふら。その真ん中に大きな「?」。本人は見上げて、にこっとしたまま
// 動き: f2〜14 雲がふくらむ / f6〜20 道具が浮かび上がる / グラフの線が f で上下にふらつく / 顕微鏡のレンズがきょろきょろ / f22〜32 ? がぽん / カメラは上へパンして寄る
const Yw220: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.02, 1.12, easeInOut(seg(f, 0, 42)));
  const dy = lerp(0, 50, easeInOut(seg(f, 0, 30)));
  const knead = 0.35 + 0.3 * Math.abs(Math.sin(f / 5));
  const px = 900, py = 848, ps = 1.3;
  const cloud = pop(seg(f, 2, 14));
  const tools = easeOut(seg(f, 6, 20));
  const sway = Math.sin(f / 6) * 14;
  const bubbles: [number, number, number][] = [[600, 210, 110], [760, 160, 120], [960, 140, 130], [1160, 160, 120], [1320, 210, 110], [1380, 320, 90], [1200, 370, 100], [960, 390, 110], [720, 370, 100], [540, 320, 90]];
  return (
    <Frame f={f} seed={3220} bg={C.officeWall} dark>
      <g transform={cam(960, 420, z, 0, dy)}>
        <L5cOfficeBack f={f} />
        <Person x={px} y={py} s={ps} f={f} cloth={C.shirt} clothDark={C.officeNight} face="smile" gaze={[2, -8]} glasses />
        <L5cTie px={px} py={py} ps={ps} f={f} blush={1} />
        <L5cOfficeDesk f={f} />
        <Squishy x={px} y={py - 50} s={0.6} squeeze={knead} dent={knead} f={f} />
        {[-1, 1].map((d) => (
          <circle key={d} cx={px + d * (82 + knead * 18)} cy={py - 92} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        ))}
        <L5cOfficeTop f={f} mode="calm" />
        {/* 考えごとの雲 (頭の上) */}
        <g transform={`translate(960 270) scale(${cloud}) translate(-960 -270)`}>
          {[[930, 470, 14], [948, 430, 20]].map(([a, b, r], i) => (
            <circle key={i} cx={a} cy={b} r={r} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          ))}
          {bubbles.map(([a, b, r], i) => <circle key={`o${i}`} cx={a} cy={b} r={r + 6} fill={C.ink} />)}
          {bubbles.map(([a, b, r], i) => <circle key={`w${i}`} cx={a} cy={b} r={r} fill={KRP.white} />)}
          <ellipse cx={960} cy={270} rx={420} ry={130} fill={KRP.white} />
        </g>
        <g opacity={tools} transform={`translate(0 ${(1 - tools) * 40})`}>
          {/* 顕微鏡 */}
          <g transform={`translate(660 ${300 + Math.sin(f / 9) * 6})`}>
            <rect x={-80} y={70} width={160} height={26} rx={8} fill={KRP.grayDark} stroke={C.ink} strokeWidth={5} />
            <path d="M 40 70 L 40 -40 Q 40 -70 10 -80" fill="none" stroke={C.ink} strokeWidth={30} strokeLinecap="round" />
            <path d="M 40 70 L 40 -40 Q 40 -70 10 -80" fill="none" stroke={KRP.grayDark} strokeWidth={20} strokeLinecap="round" />
            <g transform={`rotate(${-20 + Math.sin(f / 5) * 6} -10 -60)`}>
              <rect x={-30} y={-150} width={40} height={130} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
              <rect x={-34} y={-160} width={48} height={20} rx={6} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
            </g>
            <rect x={-70} y={10} width={110} height={14} fill={KRP.gray} stroke={C.ink} strokeWidth={4} />
            <rect x={-46} y={0} width={60} height={10} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={2.5} />
            <ellipse cx={-16} cy={4} rx={12} ry={5} fill={YP.sqBody} stroke={C.ink} strokeWidth={2} />
          </g>
          {/* グラフ (誤差の棒が長い。線の傾きが決まらない) */}
          <g transform={`translate(1240 ${290 + Math.sin(f / 8 + 1) * 6})`}>
            <rect x={-130} y={-110} width={260} height={210} rx={10} fill={KRP.paperCool} stroke={C.ink} strokeWidth={5} />
            <line x1={-100} y1={70} x2={110} y2={70} stroke={C.ink} strokeWidth={4} />
            <line x1={-100} y1={70} x2={-100} y2={-90} stroke={C.ink} strokeWidth={4} />
            {[[-70, 10, 50], [-30, -20, 60], [10, 20, 55], [50, -30, 65], [85, 0, 60]].map(([a, b, e], i) => (
              <g key={i} stroke={C.ink} strokeWidth={3}>
                <line x1={a} y1={b - e} x2={a} y2={b + e} />
                <line x1={a - 8} y1={b - e} x2={a + 8} y2={b - e} />
                <line x1={a - 8} y1={b + e} x2={a + 8} y2={b + e} />
                <circle cx={a} cy={b} r={7} fill={KRP.blueDeep} />
              </g>
            ))}
            <line x1={-90} y1={-sway} x2={100} y2={sway} stroke={KRP.red} strokeWidth={5} strokeDasharray="12 8" strokeLinecap="round" />
          </g>
        </g>
        <QMark x={960} y={330} s={2.1} f={f} t={seg(f, 22, 32)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_209: (f) => <Yw209 f={f} />,
  yw_210: (f) => <Yw210 f={f} />,
  yw_211: (f) => <Yw211 f={f} />,
  yw_212: (f) => <Yw212 f={f} />,
  yw_213: (f) => <Yw213 f={f} />,
  yw_214: (f) => <Yw214 f={f} />,
  yw_215: (f) => <Yw215 f={f} />,
  yw_216: (f) => <Yw216 f={f} />,
  yw_217: (f) => <Yw217 f={f} />,
  yw_218: (f) => <Yw218 f={f} />,
  yw_219: (f) => <Yw219 f={f} />,
  yw_220: (f) => <Yw220 f={f} />,
};

export const YW_G3_MOTIFS: string[] = [
  "yw_209",
  "yw_210",
  "yw_211",
  "yw_212",
  "yw_213",
  "yw_214",
  "yw_215",
  "yw_216",
  "yw_217",
  "yw_218",
  "yw_219",
  "yw_220",
];

export const yawaG3Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
