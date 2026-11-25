// 人は、なぜ暇をつぶすのか: 文#24〜#35 (12文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 名前の出る実在の人物は顔を見せない (後ろ姿・手元)。ロゴは描かない

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, Maru, MaruBatsu,
} from "./HimaShared";
import {
  HP, Monosashi, monoSlot, Sousa, Sagyozukue, YoruNoHeya, YoruNoHeyaFront, EkiHome, EkiBenchFront,
  KyukeiBoard, ShockRoom, Sumaho, YasumiCalendar,
} from "./HimaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/HP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 古代の村
  mud: "#D9B98A", mudDark: "#B08A5C", mudLight: "#E8CFA4", roofTop: "#CFA772",
  road: "#C9B48C", roadDark: "#A8936C", lamp: "#FFD27A", lampCore: "#FFF2C4", dusk: "#3A3A6A",
  robeNat: "#E8DCC0", robeNatDark: "#C9B994", robeBrown: "#A87A52", robeBrownDark: "#7E5A3A",
  robeIndigo: "#4E5E8A", robeIndigoDark: "#36436A", headCloth: "#F0E6CF",
  dog: "#C98A4A", dogDark: "#9A6232",
  // 空・畑
  sky: "#BFE0F0", skyLow: "#E4F1F2", cloud: "#FDFBF7", cloudShade: "#D5DDE3", rainCloud: "#8E99A6",
  grass: "#9CC27A", grassDark: "#6E9A52", hill: "#B7CF8A", soil: "#9A6E46", soilDark: "#7A5434",
  vine: "#6EA35A", vineDark: "#4E7E3E", grape: "#7A4E8E", post: "#8A6A48", sweat: "#8FC8E8",
  // ローマ
  marble: "#EEE8DC", marbleVein: "#CFC5B5", marbleShade: "#D8CFBF", purple: "#7A3E8E", purpleDark: "#55286A",
  laurel: "#6E9A4A", laurelDark: "#4E7434", banner: "#B8352A", bannerDark: "#8A2418", gold: "#D9B23C",
  tile1: "#C98E5A", tile2: "#E8DCC0", tile3: "#6E8AA8", hairBrown: "#5A4030",
  tunic: "#F4EFE2", tunicDark: "#CFC6B0", sandal: "#8A5A34", stoneRoad: "#C2B8A6", stoneLine: "#9E9482",
  terracotta: "#C9744A", fire: "#F29A3A", fireCore: "#FFE08A", bread: "#D9A25A", smoke: "#A9A9A9",
  // 地図
  parch: "#EBD9AE", parchDark: "#C9AE78", land: "#D7BC84", landDark: "#A88A52", sea: "#E9DDB8",
  deskWood: "#8E6234", deskWoodDark: "#6E4826",
  // ソ連
  sovRed: "#C8372D", sovRedDark: "#962A22", star: "#F2CE4C", brick: "#B5643F", brickDark: "#8E4A2E",
  work: "#6F8496", workDark: "#4E6274", cap: "#56606A", concrete: "#B9B4A8", concreteDark: "#8F8A7E",
  steel: "#8E98A2", steelDark: "#5E6872", greySky: "#D5D8D6", band5: "#8A5AB0",
  wallpaper: "#E8D9B0", wallpaperLine: "#D4C08E", scarf: "#A8503A", homeDad: "#F0EAD8", homeMom: "#C98A9A",
  snow: "#F6F8FA", nightWin: "#9FB8D0", factoryWall: "#A8A294",
} as const;

// 5つの組の腕章の色 (赤・黄・緑・青・紫)
const BANDS = [KRP.red as string, KRP.yellow as string, KRP.green as string, KRP.blueDeep as string, C.band5];

// ===================================================================
// ローカル部品 (HmB…)
// ===================================================================

// 古代の人: Person の上に膝下までの衣と頭の布を重ねる (still で体ゆれを止め、重ね描きとずれないように)
const HmBRobed: React.FC<{
  x: number; y: number; s?: number; f: number; robe: string; robeDark: string;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
  gaze?: [number, number]; lean?: number; phase?: number; cloth?: string; noHead?: boolean;
}> = ({ x, y, s = 1, f, robe, robeDark, face = "normal", pose = "stand", gaze = [0, 0], lean = 0, phase = 0, noHead }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} face={face} pose={pose} gaze={gaze} lean={lean} phase={phase}
      cloth={robe} clothDark={robeDark} hair="cap" still />
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
      {pose !== "sit" && pose !== "run" && (
        <path d="M -58 -66 L 58 -66 L 70 -16 Q 0 -6 -70 -16 Z" fill={robe} stroke={KRP.ink} strokeWidth={5} />
      )}
      <rect x={-60} y={-78} width={120} height={14} rx={6} fill={robeDark} stroke={KRP.ink} strokeWidth={4} />
      {pose !== "sit" && pose !== "run" && (
        <g stroke={robeDark} strokeWidth={3.5} opacity={0.8}>
          <line x1={-30} y1={-60} x2={-36} y2={-20} /><line x1={20} y1={-60} x2={26} y2={-18} />
        </g>
      )}
      {!noHead && (
        <path d="M -70 -226 Q -72 -300 0 -304 Q 72 -300 70 -226 L 76 -170 Q 64 -176 58 -214 Q 40 -262 0 -264 Q -40 -262 -58 -214 Q -64 -176 -76 -170 Z"
          fill={C.headCloth} stroke={KRP.ink} strokeWidth={5} />
      )}
      {!noHead && <path d="M -62 -262 Q 0 -280 62 -262" stroke={robeDark} strokeWidth={5} fill="none" />}
    </g>
  </g>
);

// ローマの人 (白いトゥニカ+革のサンダル)
const HmBRoman: React.FC<{
  x: number; y: number; s?: number; f: number; tunic?: string; apron?: string; toga?: boolean;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
  gaze?: [number, number]; lean?: number; phase?: number; pointDir?: 1 | -1; noArms?: boolean;
}> = ({ x, y, s = 1, f, tunic = C.tunic, apron, toga, face = "normal", pose = "stand", gaze = [0, 0], lean = 0, phase = 0, pointDir = 1, noArms }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} face={face} pose={pose} gaze={gaze} lean={lean} phase={phase}
      cloth={tunic} clothDark={C.sandal} hair="cap" still pointDir={pointDir} />
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
      {noArms && <rect x={-58} y={-160} width={116} height={108} rx={16} fill={tunic} stroke={KRP.ink} strokeWidth={5} />}
      {pose !== "sit" && pose !== "run" && <path d="M -58 -64 L 58 -64 L 64 -36 L -64 -36 Z" fill={tunic} stroke={KRP.ink} strokeWidth={5} />}
      <rect x={-60} y={-80} width={120} height={12} rx={5} fill={C.sandal} stroke={KRP.ink} strokeWidth={4} />
      {toga && <path d="M -58 -158 L -20 -158 L 58 -70 L 58 -50 L 30 -50 Z" fill={C.purple} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />}
      {apron && <path d="M -36 -110 L 36 -110 L 42 -40 L -42 -40 Z" fill={apron} stroke={KRP.ink} strokeWidth={4} />}
    </g>
  </g>
);

// ソ連の工場の人 (作業服+作業帽+腕章)
const HmBWorker: React.FC<{
  x: number; y: number; s?: number; f: number; band?: string; cloth?: string; clothDark?: string; cap?: boolean;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
  gaze?: [number, number]; phase?: number; pointDir?: 1 | -1; scarf?: boolean;
}> = ({ x, y, s = 1, f, band, cloth = C.work, clothDark = C.workDark, cap = true, face = "normal", pose = "stand", gaze = [0, 0], phase = 0, pointDir = 1, scarf }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} face={face} pose={pose} gaze={gaze} phase={phase}
      cloth={cloth} clothDark={clothDark} hair="cap" still pointDir={pointDir} />
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 胸のポケットとボタン */}
      <line x1={0} y1={-158} x2={0} y2={-56} stroke={clothDark} strokeWidth={4} />
      {[-140, -112, -84].map((by) => <circle key={by} cx={-8} cy={by} r={4} fill={clothDark} />)}
      {band && pose !== "hold" && pose !== "armsFolded" && (
        <rect x={pose === "point" && pointDir === -1 ? 54 : -82} y={-146} width={30} height={18} rx={4}
          fill={band} stroke={KRP.ink} strokeWidth={3.5} />
      )}
      {band && (pose === "hold" || pose === "armsFolded") && (
        <rect x={-56} y={-154} width={40} height={24} rx={5} fill={band} stroke={KRP.ink} strokeWidth={4} />
      )}
      {cap && !scarf && (
        <g>
          <path d="M -64 -258 Q -60 -312 0 -314 Q 60 -312 64 -258 Z" fill={C.cap} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -66 -258 Q 10 -248 90 -256 Q 96 -244 86 -240 Q 0 -238 -66 -248 Z" fill="#3E464E" stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {scarf && (
        <path d="M -70 -230 Q -72 -304 0 -306 Q 72 -304 70 -230 L 58 -236 Q 44 -270 0 -272 Q -44 -270 -58 -236 Z M -40 -172 L -10 -168 L -30 -140 Z"
          fill={C.scarf} stroke={KRP.ink} strokeWidth={5} />
      )}
    </g>
  </g>
);

// 太陽のマーク (日曜 = 太陽の日)
const HmBSun: React.FC<{ x: number; y: number; r: number; f?: number; glow?: number; face?: boolean }> = ({ x, y, r, f = 0, glow = 0, face }) => (
  <g transform={`translate(${x} ${y})`}>
    {glow > 0 && <circle r={r * (1.9 + 0.12 * Math.sin(f / 4))} fill={C.lampCore} opacity={0.55 * glow} />}
    <g transform={`rotate(${f * 1.2})`}>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M ${-r * 0.2} ${-r * 1.15} L 0 ${-r * 1.6} L ${r * 0.2} ${-r * 1.15} Z`} fill={KRP.orange}
          stroke={KRP.ink} strokeWidth={Math.max(2, r * 0.07)} transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <circle r={r} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={Math.max(3, r * 0.1)} />
    <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.25} fill={KRP.white} opacity={0.5} />
    {face && (
      <g>
        <circle cx={-r * 0.32} cy={-r * 0.05} r={r * 0.1} fill={KRP.ink} />
        <circle cx={r * 0.32} cy={-r * 0.05} r={r * 0.1} fill={KRP.ink} />
        <path d={`M ${-r * 0.3} ${r * 0.3} Q 0 ${r * 0.55} ${r * 0.3} ${r * 0.3}`} stroke={KRP.ink} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
      </g>
    )}
  </g>
);

// 太陽マークの木札 (店先・門の上にかける)
const HmBSunPlaque: React.FC<{ x: number; y: number; s?: number; swing?: number; f?: number; t?: number }> = ({ x, y, s = 1, swing = 0, f = 0, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s * sc})`}>
      <line x1={-30} y1={-50} x2={0} y2={-80} stroke={KRP.ink} strokeWidth={4} />
      <line x1={30} y1={-50} x2={0} y2={-80} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-80} r={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
      <rect x={-60} y={-50} width={120} height={100} rx={12} fill={HP.wood} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -48 -30 q 48 8 96 0 M -48 24 q 48 -8 96 0" stroke={HP.grain} strokeWidth={3} fill="none" />
      <HmBSun x={0} y={0} r={22} f={f} />
    </g>
  );
};

// 雲 (もこもこ)
const HmBCloud: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.cloud }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -120 30 Q -150 30 -150 0 Q -150 -34 -110 -34 Q -100 -76 -50 -70 Q -20 -110 30 -86 Q 80 -100 96 -50 Q 150 -50 150 -6 Q 150 30 110 30 Z"
      fill={color} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -110 18 Q 0 30 110 18" stroke={C.cloudShade} strokeWidth={8} fill="none" opacity={0.8} />
  </g>
);

// 上から見た人 (#24 の村の通り)
const HmBTopPerson: React.FC<{ x: number; y: number; rot: number; c: string; s?: number; op?: number; step?: number }> = ({ x, y, rot, c, s = 1, op = 1, step = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <ellipse cx={4} cy={6} rx={30} ry={20} fill={KRP.ink} opacity={0.2} />
    <ellipse cx={14 + step * 8} cy={-12} rx={8} ry={6} fill={KRP.ink} />
    <ellipse cx={14 - step * 8} cy={12} rx={8} ry={6} fill={KRP.ink} />
    <ellipse cx={0} cy={0} rx={18} ry={30} fill={c} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={2} cy={0} r={14} fill={C.headCloth} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void HP; void Monosashi; void monoSlot; void Sousa; void Sagyozukue; void YoruNoHeya; void YoruNoHeyaFront;
void EkiHome; void EkiBenchFront; void KyukeiBoard; void ShockRoom; void Sumaho; void YasumiCalendar;
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

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #24 ポイントは、みんなが同じ日に休むこと。
// 格: 山 / seed 5024
// 絵: どこ: 古代の村の通りを上から見た俯瞰。家が10軒ほど。演出: 7日目、すべての家の戸口に同じ色の灯がともり、通りから人が消えていく。**全部の家が同時に**灯る (左右から波のように)。真ん中の広場にだけ、うろうろしていた犬が座りこむ。動き: 灯が波のように一斉に点く / 人が家に入る / 犬が座る
// どこ: 古代の村を真上から見下ろす。横に通り、上下に5軒ずつ (計10軒) の土の家。真ん中に丸い石の広場とオリーブの木
// 演出: 夕方、左右の端の家から真ん中へ向かって波のように戸口の灯が一斉にともる。通りの人が家へ吸いこまれ、
//       最後に広場をうろうろしていた犬だけが真ん中にちょこんと座る (f=45 = 全部の灯・人ゼロ・犬1匹)
// 動き: 灯の波 (f8〜22) / 人が戸口へ歩いて消える (f4〜34) / 犬が回って座る (f28〜) / 夕暮れが濃くなる / カメラがゆっくり寄る
const Hm024: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.1 * easeOut(seg(f, 0, 42));
  const dusk = 0.06 + 0.2 * seg(f, 0, 30);
  const XS = [190, 570, 960, 1350, 1730];
  // 家: 上の列 (戸口は下の辺 y=400)・下の列 (戸口は上の辺 y=690)
  const houses = [
    ...XS.map((x, i) => ({ x, top: true, i })),
    ...XS.map((x, i) => ({ x, top: false, i })),
  ];
  const lampT = (i: number) => 8 + (2 - Math.abs(i - 2)) * 3; // 端 (i=0,4) が先、真ん中 (i=2) が最後
  // 通りの人 (戸口へ向かう)
  const walkers = [
    { sx: 300, sy: 520, h: 0, c: C.robeBrown }, { sx: 760, sy: 600, h: 6, c: C.robeIndigo },
    { sx: 1180, sy: 470, h: 3, c: C.robeNat }, { sx: 1600, sy: 600, h: 9, c: C.robeBrown },
    { sx: 480, sy: 470, h: 1, c: C.robeNat }, { sx: 1470, sy: 480, h: 8, c: C.robeIndigo },
    { sx: 880, sy: 620, h: 7, c: C.robeNatDark }, { sx: 1820, sy: 520, h: 4, c: C.robeNat },
  ];
  // 犬
  const sitT = seg(f, 26, 34);
  const ang = Math.min(f, 28) * 0.16;
  const dx = 960 + Math.cos(ang) * 110 * (1 - sitT);
  const dy = 545 + Math.sin(ang) * 60 * (1 - sitT);
  const dRot = (ang * 180) / Math.PI + 90;
  const tail = Math.sin(f / 2.5) * 22;
  return (
    <Frame f={f} seed={5024}>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        {/* 地面 (乾いた土) と通り */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.mudLight} />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={rnd(24, i) * 1920} cy={rnd(25, i) * 1080} r={4 + rnd(26, i) * 6} fill={C.mudDark} opacity={0.35} />
        ))}
        <rect x={-60} y={410} width={2040} height={270} fill={C.road} />
        <path d="M -60 410 Q 960 396 1980 412 M -60 680 Q 960 694 1980 678" stroke={C.roadDark} strokeWidth={6} fill="none" />
        {/* 轍と石 */}
        <g stroke={C.roadDark} strokeWidth={5} fill="none" opacity={0.6}>
          <path d="M -60 500 Q 600 490 1980 506" /><path d="M -60 590 Q 700 600 1980 584" />
        </g>
        {Array.from({ length: 18 }, (_, i) => (
          <ellipse key={i} cx={60 + i * 108 + rnd(27, i) * 40} cy={430 + rnd(28, i) * 230} rx={10 + rnd(29, i) * 8} ry={7}
            fill={C.roadDark} stroke={KRP.ink} strokeWidth={2.5} opacity={0.7} />
        ))}
        {/* 広場 (丸い敷石) */}
        <circle cx={960} cy={545} r={170} fill={KRP.floor} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 10 + r * 6 }, (_, k) => {
          const a = (k / (10 + r * 6)) * Math.PI * 2;
          const rr = 50 + r * 44;
          return <line key={`${r}-${k}`} x1={960 + Math.cos(a) * (rr - 22)} y1={545 + Math.sin(a) * (rr - 22)}
            x2={960 + Math.cos(a) * (rr + 22)} y2={545 + Math.sin(a) * (rr + 22)} stroke={C.roadDark} strokeWidth={3} />;
        }))}
        {[50, 94, 138].map((rr) => <circle key={rr} cx={960} cy={545} r={rr + 22} fill="none" stroke={C.roadDark} strokeWidth={3} />)}
        {/* 家 (真上から: 平たい土の屋根・低い縁・はしご・干し物) */}
        {houses.map(({ x, top, i }) => {
          const y0 = top ? 130 : 690, hh = 270, ww = 300;
          const doorY = top ? 400 : 690;
          const lt = seg(f, lampT(i), lampT(i) + 5);
          return (
            <g key={`${x}-${top}`}>
              <rect x={x - ww / 2 + 16} y={y0 + 16} width={ww} height={hh} fill={KRP.ink} opacity={0.22} />
              <rect x={x - ww / 2} y={y0} width={ww} height={hh} rx={8} fill={C.roofTop} stroke={KRP.ink} strokeWidth={7} />
              <rect x={x - ww / 2 + 18} y={y0 + 18} width={ww - 36} height={hh - 36} rx={4} fill={C.mud} stroke={C.mudDark} strokeWidth={4} />
              {/* 屋根の梁の跡 */}
              <g stroke={C.mudDark} strokeWidth={3} opacity={0.6}>
                {[1, 2, 3, 4].map((k) => <line key={k} x1={x - ww / 2 + 22} y1={y0 + 18 + k * 47} x2={x + ww / 2 - 22} y2={y0 + 18 + k * 47} />)}
              </g>
              {/* 屋上の干し物 (ござ・つぼ) */}
              <rect x={x - 90 + (i % 2) * 70} y={y0 + 60 + (top ? 0 : 60)} width={90} height={60} rx={4}
                fill={[C.robeIndigo, C.robeBrown, KRP.red, C.robeNat, C.vine][i]} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
              <circle cx={x + 90 - (i % 2) * 150} cy={y0 + (top ? 200 : 80)} r={20} fill={C.terracotta} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={x + 90 - (i % 2) * 150} cy={y0 + (top ? 200 : 80)} r={8} fill={KRP.ink} opacity={0.6} />
              {/* はしご */}
              <g transform={`translate(${x + (i % 2 ? -120 : 110)} ${top ? y0 + 150 : y0 + 120})`}>
                <rect x={-14} y={-60} width={8} height={120} fill={C.post} stroke={KRP.ink} strokeWidth={2.5} />
                <rect x={10} y={-60} width={8} height={120} fill={C.post} stroke={KRP.ink} strokeWidth={2.5} />
                {[-40, -10, 20, 50].map((ry) => <line key={ry} x1={-10} y1={ry} x2={14} y2={ry} stroke={C.post} strokeWidth={5} />)}
              </g>
              {/* 戸口 (通り側) */}
              <rect x={x - 34} y={top ? doorY - 14 : doorY - 6} width={68} height={20} rx={4} fill={KRP.ink} />
              {/* 灯 */}
              <g transform={`translate(${x + 60} ${top ? doorY + 14 : doorY - 14})`}>
                {lt > 0 && <circle r={40 + 46 * lt + 4 * Math.sin(f / 3 + i)} fill={C.lamp} opacity={0.32 * lt} />}
                {lt > 0 && <circle r={26 * lt} fill={C.lamp} opacity={0.5 * lt} />}
                <circle r={12} fill={lt > 0 ? C.lampCore : KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
              </g>
            </g>
          );
        })}
        {/* オリーブの木 (真上から) */}
        <g transform="translate(1150 420)">
          <circle cx={14} cy={16} r={70} fill={KRP.ink} opacity={0.2} />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <circle key={k} cx={Math.cos(k) * 36} cy={Math.sin(k * 1.3) * 30} r={42} fill={k % 2 ? C.vine : C.vineDark} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={Math.cos(k * 2) * 40} cy={Math.sin(k * 2) * 34} r={6} fill={C.grape} />)}
        </g>
        {/* 夕暮れ */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.dusk} opacity={dusk} />
        {/* 灯の光を夕暮れの上にもう一度 (明るく) */}
        {houses.map(({ x, top, i }) => {
          const lt = seg(f, lampT(i), lampT(i) + 5);
          const doorY = top ? 400 : 690;
          return lt > 0 ? (
            <g key={`g${x}${top}`} transform={`translate(${x + 60} ${top ? doorY + 14 : doorY - 14})`}>
              <circle r={80 * lt} fill={C.lamp} opacity={0.3 * lt} />
              <circle r={34 * lt} fill={C.lampCore} opacity={0.6 * lt} />
              <circle r={12} fill={C.lampCore} stroke={KRP.ink} strokeWidth={4} />
              {/* 戸口からこぼれる光 */}
              <path d={top ? "M -94 -26 L -26 -26 L -6 60 L -114 60 Z" : "M -94 26 L -26 26 L -6 -60 L -114 -60 Z"} fill={C.lamp} opacity={0.3 * lt} />
            </g>
          ) : null;
        })}
        {/* 通りの人: 自分の家の戸口へ歩いて消える */}
        {walkers.map((w, k) => {
          const h = houses[w.h];
          const tx = h.x - 0, ty = h.top ? 400 : 690;
          const p = easeInOut(seg(f, 4 + k * 2.5, 16 + k * 2.5));
          const x = lerp(w.sx, tx, p), y = lerp(w.sy, ty, p);
          const rot = (Math.atan2(ty - w.sy, tx - w.sx) * 180) / Math.PI;
          const op = 1 - seg(p, 0.85, 1);
          return op > 0 ? <HmBTopPerson key={k} x={x} y={y} rot={rot} c={w.c} s={1.1} op={op} step={p > 0 && p < 1 ? Math.sin(f * 1.2 + k) : 0} /> : null;
        })}
        {/* 犬: うろうろ → 真ん中で座る */}
        <g transform={`translate(${dx} ${dy}) scale(1.6) rotate(${sitT > 0 ? lerp(dRot, 180, sitT) : dRot})`}>
          <ellipse cx={6} cy={8} rx={38 - 10 * sitT} ry={24} fill={KRP.ink} opacity={0.22} />
          {/* しっぽ */}
          <path d={`M 0 ${30 - 8 * sitT} q ${tail * 0.6} 20 ${tail} 34`} stroke={C.dogDark} strokeWidth={10} strokeLinecap="round" fill="none" />
          {/* 体 */}
          <ellipse cx={0} cy={0} rx={22 + 4 * sitT} ry={38 - 12 * sitT} fill={C.dog} stroke={KRP.ink} strokeWidth={5} />
          {sitT < 1 && [[-16, -24], [16, -24], [-16, 24], [16, 24]].map(([lx, ly], i) => (
            <ellipse key={i} cx={lx} cy={ly + (i % 2 ? 1 : -1) * Math.sin(f) * 6 * (1 - sitT)} rx={7} ry={10} fill={C.dogDark} stroke={KRP.ink} strokeWidth={3} opacity={1 - sitT} />
          ))}
          {/* 頭と耳 */}
          <circle cx={0} cy={-38 + 8 * sitT} r={20} fill={C.dog} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={-17} cy={-44 + 8 * sitT} rx={8} ry={13} fill={C.dogDark} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={17} cy={-44 + 8 * sitT} rx={8} ry={13} fill={C.dogDark} stroke={KRP.ink} strokeWidth={3} />
          <ellipse cx={0} cy={-56 + 8 * sitT} rx={8} ry={6} fill={KRP.ink} />
        </g>
        {/* 座ったとき: きょろきょろの印 */}
        {sitT >= 1 && (
          <g opacity={0.8 + 0.2 * Math.sin(f / 3)}>
            <path d="M 900 470 q -10 -20 0 -36" stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M 1020 470 q 10 -20 0 -36" stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        )}
      </g>
      <TagPlate x={960} y={70} text="7日目" size={44} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #25 休みの日に、隣の人だけ働いていると、なんだか休んだ気がしません。
// 格: 山 / seed 5025
// 絵: どこ: 隣り合う2軒の家の庭 (塀で区切られている)。演出: 左の家の人はハンモックで寝そべっている (Person を rotate)。右の家の人は汗をかいて薪を割っている (斧を振る。動きはゆっくり)。左の人が片目を開けて、右をちらっと見て、気まずそうに体を起こす (face="worried")。ハンモックがぶらぶら。動き: 斧が振り下ろされる (12コマに1回) / 薪が割れる / 寝そべる人が起き上がる
// どこ: 隣り合う2軒の土の家の庭。真ん中に低い石の塀。左の庭にイチジクの木とハンモック、右の庭に切り株と薪の山
// 演出: 左の人はハンモックで気持ちよく寝ている。右の人はにこにこ汗だくで薪割り。左の人が片目を開けてちらっと見て、
//       気まずそうに体を起こす (f=45 = 半分起き上がって右を見ている困り顔)
// 動き: ハンモックのぶらぶら / 斧が14コマに1回ゆっくり振り下ろされ、薪がぱかっと割れる / 寝る人が起き上がる / 汗が飛ぶ
const Hm025: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.05 - 0.05 * easeOut(seg(f, 0, 40));
  const sway = Math.sin(f / 10) * 3;
  const rise = easeInOut(seg(f, 24, 36));
  const lieRot = lerp(-84, -32, rise);
  const peek = f >= 14;
  const face = f < 14 ? "joy" : f < 24 ? "normal" : "worried";
  // 斧 (14コマに1回)
  const P = 14;
  const ph = (f % P) / P;
  const swing = ph < 0.6 ? easeInOut(ph / 0.6) : ph < 0.74 ? 1 - easeOut((ph - 0.6) / 0.14) : 0;
  const axeA = ((lerp(176, 262, swing)) * Math.PI) / 180;
  const hx = 1500, hy = 702;
  const ax = hx + Math.cos(axeA) * 210, ay = hy + Math.sin(axeA) * 210;
  const split = ph >= 0.72 ? easeOut((ph - 0.72) / 0.28) : 0;
  const s = 0.85;
  return (
    <Frame f={f} seed={5025}>
      <g transform={`translate(960 600) scale(${cam}) translate(-960 -600)`}>
        {/* 空と太陽 */}
        <rect x={-60} y={-60} width={2040} height={600} fill={C.sky} />
        <rect x={-60} y={300} width={2040} height={240} fill={C.skyLow} opacity={0.7} />
        <HmBSun x={1720} y={130} r={50} f={f} />
        <HmBCloud x={420} y={110} s={0.7} />
        {/* 奥の家 (土壁・平屋根・木の梁の先・窓) */}
        {[[0, 900], [1020, 1920]].map(([x0, x1], k) => (
          <g key={k}>
            <rect x={x0 - 40} y={220} width={x1 - x0 + 40} height={360} fill={C.mud} stroke={KRP.ink} strokeWidth={7} />
            <rect x={x0 - 50} y={200} width={x1 - x0 + 60} height={30} fill={C.roofTop} stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={x0 + 40 + i * 110} cy={250} r={11} fill={C.post} stroke={KRP.ink} strokeWidth={3} />)}
            <path d={`M ${x0 + (k ? 640 : 160)} 580 L ${x0 + (k ? 640 : 160)} 380 Q ${x0 + (k ? 700 : 220)} 330 ${x0 + (k ? 760 : 280)} 380 L ${x0 + (k ? 760 : 280)} 580 Z`}
              fill={KRP.ink} opacity={0.85} />
            <rect x={x0 + (k ? 260 : 560)} y={320} width={90} height={70} fill={C.mudDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d={`M ${x0 + rnd(30 + k, i) * (x1 - x0)} ${300 + rnd(31 + k, i) * 240} l 24 4`} stroke={C.mudDark} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 地面 (庭) */}
        <rect x={-60} y={560} width={2040} height={600} fill={C.road} />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M ${rnd(32, i) * 1920} ${600 + rnd(33, i) * 440} l 8 -14 l 6 14`} stroke={C.grassDark} strokeWidth={4} fill="none" />
        ))}
        {/* 真ん中の石の塀 */}
        <g>
          <rect x={920} y={470} width={90} height={420} fill={C.stoneRoad} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={920} y1={530 + i * 56} x2={1010} y2={530 + i * 56} stroke={C.stoneLine} strokeWidth={4} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`v${i}`} x1={i % 2 ? 950 : 980} y1={474 + i * 56} x2={i % 2 ? 950 : 980} y2={530 + i * 56} stroke={C.stoneLine} strokeWidth={4} />
          ))}
          <rect x={910} y={456} width={110} height={24} rx={6} fill={C.stoneLine} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 左の庭: イチジクの木 (ハンモックの片側) と柱 */}
        <rect x={150} y={300} width={50} height={560} fill={C.post} stroke={KRP.ink} strokeWidth={6} />
        {[[120, 300, 90], [210, 250, 100], [290, 320, 80], [60, 360, 70]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? C.vine : C.vineDark} stroke={KRP.ink} strokeWidth={5} />
        ))}
        {[[100, 280], [230, 300], [180, 220]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={11} fill={C.grape} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={810} y={400} width={36} height={460} fill={C.post} stroke={KRP.ink} strokeWidth={6} />
        {/* ハンモック (ぶらぶら) と、寝そべる人 */}
        <g transform={`rotate(${sway} 510 430)`}>
          <path d="M 200 430 L 300 470 M 820 430 L 720 470" stroke={C.robeNatDark} strokeWidth={6} />
          <path d="M 300 470 Q 510 700 720 470 Q 510 600 300 470 Z" fill={C.robeIndigo} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`translate(560 590) rotate(${lieRot})`}>
            <HmBRobed x={0} y={58 * s} s={s} f={f} robe={C.robeNat} robeDark={C.robeNatDark}
              face={face as "joy" | "normal" | "worried"} gaze={peek ? [7, -2] : [0, 0]} pose={rise > 0.5 ? "hold" : "stand"} />
          </g>
          {/* ハンモックの手前の縁 (体をくるむ) */}
          <path d="M 300 470 Q 510 700 720 470" stroke={KRP.ink} strokeWidth={6} fill="none" />
          <path d={`M 330 ${520 + rise * 10} Q 510 ${700 - rise * 20} 700 ${520 + rise * 10} Q 510 ${690} 330 ${520 + rise * 10} Z`} fill={C.robeIndigoDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={360 + i * 60} y1={560 + Math.abs(i - 2.5) * -14} x2={366 + i * 60} y2={650 + Math.abs(i - 2.5) * -18} stroke={C.robeIndigo} strokeWidth={4} />
          ))}
        </g>
        {/* 寝ているあいだの Zzz → 片目のちらっ → 汗 */}
        {f < 14 && <text x={420} y={440 - (f % 14) * 2} fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.robeIndigo} opacity={0.8}>Z</text>}
        {rise > 0.3 && (
          <path d="M 560 330 q -12 18 0 26 q 12 -8 0 -26 Z" fill={C.sweat} stroke={KRP.ink} strokeWidth={3}
            transform={`translate(${-30 * rise} ${10 * rise})`} />
        )}
        {peek && f < 30 && (
          <g opacity={seg(f, 14, 17) * (1 - seg(f, 26, 30))}>
            <path d="M 640 430 l 60 -12 M 640 444 l 64 6" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {/* 左の小物: 水がめ・ござ */}
        <g transform="translate(330 800)">
          <ellipse cx={0} cy={10} rx={60} ry={14} fill={KRP.ink} opacity={0.2} />
          <path d="M -40 0 Q -60 -60 -24 -100 L 24 -100 Q 60 -60 40 0 Z" fill={C.terracotta} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-28} y={-114} width={56} height={16} rx={6} fill={C.terracotta} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 右の庭: 薪の山 */}
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const row = i < 4 ? 0 : i < 7 ? 1 : 2;
            const col = i < 4 ? i : i < 7 ? i - 4 : i - 7;
            const cx = 1680 + col * 56 + row * 28, cy = 820 - row * 48;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={26} fill={C.mudLight} stroke={KRP.ink} strokeWidth={5} />
                <circle cx={cx} cy={cy} r={12} fill="none" stroke={C.mudDark} strokeWidth={3} />
              </g>
            );
          })}
        </g>
        {/* 切り株と薪 */}
        <g transform="translate(1290 760)">
          <ellipse cx={0} cy={80} rx={110} ry={20} fill={KRP.ink} opacity={0.2} />
          <rect x={-80} y={-10} width={160} height={90} fill={C.post} stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-10} rx={80} ry={20} fill={C.mudLight} stroke={KRP.ink} strokeWidth={6} />
          {split === 0 ? (
            <g>
              <rect x={-30} y={-90} width={60} height={80} fill={C.mud} stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={0} cy={-90} rx={30} ry={9} fill={C.mudLight} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ) : (
            [-1, 1].map((d) => (
              <g key={d} transform={`translate(${d * (20 + 70 * split)} ${-40 * Math.sin(split * Math.PI) + 30 * split}) rotate(${d * 70 * split} 0 -40)`}>
                <rect x={d < 0 ? -30 : 0} y={-90} width={30} height={80} fill={C.mud} stroke={KRP.ink} strokeWidth={5} />
                <rect x={d < 0 ? -4 : 0} y={-90} width={4} height={80} fill={C.mudLight} />
              </g>
            ))
          )}
          {split > 0 && split < 1 && [0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={-10 + (k - 2) * 30 * split} y={-60 - 70 * split * (1 - split) * 4 * (0.5 + rnd(34, k))} width={12} height={8}
              fill={C.mudLight} stroke={KRP.ink} strokeWidth={2} />
          ))}
        </g>
        {/* 薪を割る人 (にこにこ汗だく) と斧 */}
        <HmBRobed x={1500} y={820} s={1.0} f={f} robe={C.robeBrown} robeDark={C.robeBrownDark} face="smile" gaze={[-6, 4]} pose="hold" phase={2} />
        <line x1={hx} y1={hy} x2={ax} y2={ay} stroke={C.post} strokeWidth={14} strokeLinecap="round" />
        <line x1={hx} y1={hy} x2={ax} y2={ay} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        <g transform={`translate(${ax} ${ay}) rotate(${(axeA * 180) / Math.PI})`}>
          <path d="M -20 -10 L 10 -14 L 26 -44 L 40 -40 L 34 34 L 22 38 L 10 14 L -20 10 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5}
            transform="rotate(90)" />
        </g>
        <circle cx={hx} cy={hy} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 汗 */}
        {[0, 1, 2].map((k) => {
          const p = ((f + k * 9) % 27) / 27;
          return (
            <path key={k} d="M 0 -14 q -10 14 0 20 q 10 -6 0 -20 Z" fill={C.sweat} stroke={KRP.ink} strokeWidth={3}
              transform={`translate(${1500 + (k - 1) * 70 + (k - 1) * 40 * p} ${540 - 30 * Math.sin(p * Math.PI)}) scale(${1.2 - p * 0.4})`} opacity={1 - p} />
          );
        })}
        {/* ニワトリ (右の庭の手前) */}
        <g transform={`translate(1100 ${830 + Math.abs(Math.sin(f / 4)) * -6})`}>
          <ellipse cx={0} cy={-30} rx={34} ry={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-26} cy={-58} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -32 -72 l 6 -10 l 6 10" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -40 -58 l -12 4 l 12 4 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 30 -40 q 20 -20 10 -36" stroke={KRP.ink} strokeWidth={4} fill="none" />
          <line x1={-6} y1={-6} x2={-8} y2={8} stroke={KRP.orange} strokeWidth={4} />
          <line x1={8} y1={-6} x2={10} y2={8} stroke={KRP.orange} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #26 時代は飛んで、321年。ローマの皇帝コンスタンティヌスが、日曜日は休むように、と法律を出します。
// 格: 山 / seed 5026
// 絵: どこ: ローマの宮殿の大理石の広間 (柱・赤い垂れ幕・床のモザイク)。年代札「321年」、地名札「ローマ」。演出: **皇帝は顔を見せない**。紫のマントの背中と月桂冠の後頭部が玉座の前に立ち、書記が巻物 (法律) を高く掲げる。巻物には太陽のマークだけ (日曜=太陽の日)。カメラは広間の奥から手前へ。動き: 巻物がくるくる広がる / 垂れ幕のゆれ / 太陽のマークが光る
// どこ: ローマの宮殿の大理石の広間。奥に階段の上の玉座と半円の壁がん、左右に縦みぞの柱と赤い垂れ幕、床はモザイク、高窓から光
// 演出: 手前に皇帝の背中 (紫のマント・月桂冠の後頭部。顔は見せない)。階段の上で書記が巻物を頭上でぱっと広げ、
//       真ん中の太陽のマークが光る。左右に槍の衛兵 (f=45 = 巻物が開ききって太陽が光り、広間の全景)
// 動き: カメラが巻物の寄りから広間の全景へ引く / 巻物がくるくる広がる / 垂れ幕のゆれ / 太陽の光
const Hm026: React.FC<{ f: number }> = ({ f }) => {
  const k = easeOut(seg(f, 0, 40));
  const cam = lerp(1.24, 1, k);
  const fx = lerp(1130, 960, k), fy = lerp(380, 540, k);
  const open = easeOut(seg(f, 8, 26));
  const glow = seg(f, 24, 34);
  const sx = 1150, sy = 660, ss = 0.85;
  const hw = lerp(34, 200, open);
  const handY = sy - 340 * ss;
  return (
    <Frame f={f} seed={5026}>
      <g transform={`translate(960 540) scale(${cam}) translate(${-fx} ${-fy})`}>
        {/* 奥の壁 (大理石) と半円の壁がん */}
        <rect x={-100} y={-100} width={2120} height={720} fill={C.marble} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${rnd(35, i) * 1920} ${rnd(36, i) * 500} q 40 30 20 80 q -10 40 30 70`} stroke={C.marbleVein} strokeWidth={4} fill="none" />
        ))}
        <path d="M 700 560 L 700 230 Q 960 30 1220 230 L 1220 560 Z" fill={C.marbleShade} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 740 560 L 740 250 Q 960 80 1180 250 L 1180 560" fill="none" stroke={C.gold} strokeWidth={8} />
        {/* 高窓と光の筋 */}
        {[300, 1620].map((wx) => (
          <g key={wx}>
            <path d={`M ${wx - 60} 160 L ${wx - 60} 60 Q ${wx} 10 ${wx + 60} 60 L ${wx + 60} 160 Z`} fill={C.sky} stroke={KRP.ink} strokeWidth={6} />
            <polygon points={`${wx - 60},160 ${wx + 60},160 ${wx + (wx < 960 ? 360 : -120)},900 ${wx + (wx < 960 ? 120 : -360)},900`}
              fill={KRP.white} opacity={0.18 + 0.04 * Math.sin(f / 8)} />
          </g>
        ))}
        {/* 床のモザイク (遠近) */}
        <polygon points="-100,560 2020,560 2400,1180 -480,1180" fill={C.tile2} />
        {Array.from({ length: 8 }, (_, r) => {
          const y0 = 560 + r * r * 9 + r * 30, y1 = 560 + (r + 1) * (r + 1) * 9 + (r + 1) * 30;
          return Array.from({ length: 16 }, (_, c) => {
            const t0 = (c - 8) / 8, t1 = (c - 7) / 8;
            const w0 = 1060 + (y0 - 560) * 1.4, w1 = 1060 + (y1 - 560) * 1.4;
            if ((r + c) % 2) return null;
            return <polygon key={`${r}-${c}`} points={`${960 + t0 * w0},${y0} ${960 + t1 * w0},${y0} ${960 + t1 * w1},${y1} ${960 + t0 * w1},${y1}`}
              fill={r % 3 === 2 ? C.tile3 : C.tile1} opacity={0.85} />;
          });
        })}
        <line x1={-100} y1={560} x2={2020} y2={560} stroke={KRP.ink} strokeWidth={6} />
        {/* 玉座への階段と玉座 */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={760 - i * 60} y={480 + i * 34} width={400 + i * 120} height={36} fill={C.marble} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <g>
          <rect x={880} y={300} width={160} height={190} rx={14} fill={C.purple} stroke={KRP.ink} strokeWidth={6} />
          <rect x={860} y={420} width={200} height={66} rx={8} fill={C.gold} stroke={KRP.ink} strokeWidth={6} />
          <rect x={850} y={380} width={30} height={100} rx={8} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1040} y={380} width={30} height={100} rx={8} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={960} cy={290} r={20} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 柱と垂れ幕 */}
        {[180, 520, 1400, 1740].map((cx, i) => {
          const wv = Math.sin(f / 9 + i) * 6;
          return (
            <g key={cx}>
              <rect x={cx - 60} y={-20} width={120} height={860} fill={C.marble} stroke={KRP.ink} strokeWidth={7} />
              {[-30, 0, 30].map((d) => <line key={d} x1={cx + d} y1={10} x2={cx + d} y2={810} stroke={C.marbleVein} strokeWidth={6} />)}
              <rect x={cx - 80} y={-30} width={160} height={50} fill={C.marbleShade} stroke={KRP.ink} strokeWidth={6} />
              <rect x={cx - 84} y={800} width={168} height={50} fill={C.marbleShade} stroke={KRP.ink} strokeWidth={6} />
              {i % 2 === 1 && (
                <path d={`M ${cx + (i < 2 ? 70 : -270)} 30 L ${cx + (i < 2 ? 270 : -70)} 30 L ${cx + (i < 2 ? 266 : -74) + wv} 420 L ${cx + (i < 2 ? 170 : -170) + wv} 470 L ${cx + (i < 2 ? 74 : -266) + wv} 420 Z`}
                  fill={C.banner} stroke={KRP.ink} strokeWidth={6} />
              )}
              {i % 2 === 1 && (
                <path d={`M ${cx + (i < 2 ? 90 : -250)} 70 L ${cx + (i < 2 ? 250 : -90)} 70`} stroke={C.gold} strokeWidth={8} />
              )}
              {i % 2 === 1 && <circle cx={cx + (i < 2 ? 170 : -170) + wv * 0.6} cy={250} r={38} fill="none" stroke={C.gold} strokeWidth={8} />}
            </g>
          );
        })}
        {/* 衛兵 (槍と赤い盾) */}
        {[[360, 1], [1560, -1]].map(([gx, d], i) => (
          <g key={i}>
            <line x1={gx + d * 60} y1={300} x2={gx + d * 60} y2={800} stroke={C.post} strokeWidth={10} />
            <path d={`M ${gx + d * 60 - 14} 300 L ${gx + d * 60} 250 L ${gx + d * 60 + 14} 300 Z`} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
            <HmBRoman x={gx} y={800} s={0.72} f={f} face="normal" phase={i + 3} gaze={[d * -4, 0]} tunic={C.banner} />
            <path d={`M ${gx - 46} ${578} Q ${gx} ${560} ${gx + 46} ${578} L ${gx + 40} ${582} L ${gx - 40} ${582} Z`} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
            <rect x={gx - d * 70 - 36} y={640} width={72} height={110} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={gx - d * 70} cy={695} r={12} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 書記と巻物 */}
        <HmBRoman x={sx} y={sy} s={ss} f={f} face="smile" pose="hold" gaze={[0, -6]} phase={1} noArms />
        {[-1, 1].map((d) => (
          <path key={d} d={`M ${sx + d * 50} ${sy - 140 * ss} L ${sx + d * hw * 0.86} ${handY + 8}`} stroke={KRP.ink} strokeWidth={26} strokeLinecap="round" />
        ))}
        {[-1, 1].map((d) => (
          <path key={`i${d}`} d={`M ${sx + d * 50} ${sy - 140 * ss} L ${sx + d * hw * 0.86} ${handY + 8}`} stroke={C.tunic} strokeWidth={17} strokeLinecap="round" />
        ))}
        <g transform={`translate(${sx} ${handY})`}>
          {glow > 0 && <circle cx={0} cy={-70} r={150 + 20 * Math.sin(f / 4)} fill={C.lampCore} opacity={0.5 * glow} />}
          <rect x={-hw} y={-140} width={hw * 2} height={140} fill={C.parch} stroke={KRP.ink} strokeWidth={5} />
          {open > 0.6 && <HmBSun x={0} y={-70} r={34 * seg(open, 0.6, 1)} f={f} glow={glow} />}
          {glow > 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((j) => {
            const a = (j * 45 + f * 2) * Math.PI / 180;
            return <line key={j} x1={Math.cos(a) * 90} y1={-70 + Math.sin(a) * 60} x2={Math.cos(a) * (120 + 10 * glow)} y2={-70 + Math.sin(a) * (80 + 6 * glow)}
              stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" opacity={glow} />;
          })}
          {[-1, 1].map((d) => (
            <g key={d} transform={`translate(${d * hw} -70)`}>
              <rect x={-16} y={-86} width={32} height={172} rx={14} fill={C.parchDark} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-10} y={-102} width={20} height={20} rx={6} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-10} y={82} width={20} height={20} rx={6} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
              <circle cx={0} cy={60} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              {open < 1 && <path d={`M -10 ${-40 + (f * 9) % 80} l 20 0`} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />}
            </g>
          ))}
        </g>
        {/* 手前: 皇帝の背中 (紫のマント・月桂冠の後頭部。顔は見せない) */}
        <g transform={`translate(760 0)`}>
          <path d="M -200 1180 Q -210 820 -120 700 Q 0 640 120 700 Q 210 820 200 1180 Z" fill={C.purple} stroke={KRP.ink} strokeWidth={8} />
          <path d="M -120 700 Q -60 900 -90 1180 M 120 700 Q 60 900 90 1180 M 0 680 L 0 1180" stroke={C.purpleDark} strokeWidth={6} fill="none" />
          <path d="M -150 760 Q 0 720 150 760" stroke={C.gold} strokeWidth={10} fill="none" />
          <circle cx={-140} cy={740} r={18} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
          {/* 首と後頭部 (髪で塗りつぶす) */}
          <rect x={-34} y={640} width={68} height={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={590} r={76} fill={C.hairBrown} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -50 560 q 20 -10 30 10 M 0 550 q 20 -10 30 10 M -30 610 q 20 -10 30 10 M 20 620 q 15 -8 24 8" stroke="#3E2C20" strokeWidth={4} fill="none" />
          {/* 月桂冠 */}
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI * (1.05 + (i / 10) * 0.9);
            return <ellipse key={i} cx={Math.cos(a) * 74} cy={580 + Math.sin(a) * -20} rx={22} ry={11}
              fill={i % 2 ? C.laurel : C.laurelDark} stroke={KRP.ink} strokeWidth={3.5}
              transform={`rotate(${(a * 180) / Math.PI + 90 + (i % 2 ? 30 : -30)} ${Math.cos(a) * 74} ${580 + Math.sin(a) * -20})`} />;
          })}
          <path d="M -20 600 q 10 30 -4 50 M 20 600 q -10 30 4 50" stroke={C.banner} strokeWidth={6} fill="none" />
        </g>
      </g>
      <TagPlate x={500} y={90} text="321年" size={44} t={seg(f, 2, 10)} />
      <TagPlate x={1680} y={90} text="ローマ" size={44} t={seg(f, 5, 13)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #27 町の役人も、職人も、日曜はお休み。
// 格: 山 / seed 5027
// 絵: どこ: ローマの町の通り (石畳・アーチ・店の並び)。演出: 日曜の朝、役所の扉が閉まり、鍛冶屋の炉の火が消え、パン屋の窯にふたがされる。役人と職人が道具を置いて、広場でくつろぐ (伸びをする・談笑)。店先に太陽マークの札がかかる。動き: 扉が閉まる / 炉の火が消えて煙が細くなる / 伸びをする
// どこ: 日曜の朝のローマの町の通り。奥に水道橋のアーチ、手前に石畳。左から役所 (柱と三角屋根)・鍛冶屋・パン屋の窯
// 演出: 役所の大扉がばたんと閉まり、鍛冶屋の炉の火がしぼんで煙が細くなり、パン屋の窯にふたがされる。
//       3軒の店先に太陽の札がぶら下がる。手前で役人が大きく伸び、鍛冶屋とパン屋は道具を置いて談笑
// 動き: 扉が閉まる (f4〜14) / 火が消えて煙が細る (f8〜20) / 窯のふた (f12〜22) / 札がぽん (f18〜30) / 伸び (f24〜)
const Hm027: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.05 - 0.05 * easeOut(seg(f, 0, 40));
  const panX = lerp(30, 0, easeOut(seg(f, 0, 40)));
  const door = easeInOut(seg(f, 4, 14));
  const fire = 1 - seg(f, 8, 20);
  const lid = easeOut(seg(f, 12, 22));
  const stretch = f >= 26;
  return (
    <Frame f={f} seed={5027}>
      <g transform={`translate(${960 + panX} 560) scale(${cam}) translate(-960 -560)`}>
        <rect x={-80} y={-80} width={2080} height={700} fill={C.sky} />
        <rect x={-80} y={240} width={2080} height={200} fill={C.skyLow} opacity={0.7} />
        <HmBCloud x={1500} y={90} s={0.6} />
        {/* 遠くの水道橋 */}
        <g fill={C.marbleShade} stroke={KRP.ink} strokeWidth={4} opacity={0.9}>
          <rect x={-80} y={170} width={2080} height={36} />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M ${-60 + i * 130} 206 L ${-60 + i * 130} 360 L ${-40 + i * 130} 360 Q ${5 + i * 130} 250 ${50 + i * 130} 360 L ${70 + i * 130} 360 L ${70 + i * 130} 206 Z`} />
          ))}
        </g>
        {/* 役所 (左) */}
        <g>
          <rect x={60} y={300} width={580} height={360} fill={C.marble} stroke={KRP.ink} strokeWidth={7} />
          <polygon points="40,300 350,180 660,300" fill={C.marbleShade} stroke={KRP.ink} strokeWidth={7} />
          <circle cx={350} cy={255} r={24} fill="none" stroke={C.gold} strokeWidth={6} />
          {[110, 190, 510, 590].map((cx) => (
            <g key={cx}>
              <rect x={cx - 22} y={310} width={44} height={350} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <line x1={cx - 6} y1={320} x2={cx - 6} y2={650} stroke={C.marbleVein} strokeWidth={4} />
              <line x1={cx + 8} y1={320} x2={cx + 8} y2={650} stroke={C.marbleVein} strokeWidth={4} />
            </g>
          ))}
          {/* 扉の中 (暗い) と、閉まる2枚の扉 */}
          <rect x={250} y={380} width={200} height={280} fill={KRP.ink} />
          <rect x={250} y={380} width={lerp(18, 100, door)} height={280} fill={C.post} stroke={KRP.ink} strokeWidth={5} />
          <rect x={450 - lerp(18, 100, door)} y={380} width={lerp(18, 100, door)} height={280} fill={C.post} stroke={KRP.ink} strokeWidth={5} />
          {door > 0.95 && [330, 370].map((kx) => <circle key={kx} cx={kx} cy={520} r={9} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />)}
          {door > 0.95 && door < 1.01 && f < 20 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={1 - seg(f, 14, 20)}>
              <line x1={230} y1={420} x2={200} y2={400} /><line x1={470} y1={420} x2={500} y2={400} /><line x1={230} y1={600} x2={196} y2={610} /><line x1={470} y1={600} x2={504} y2={610} />
            </g>
          )}
          <rect x={60} y={640} width={580} height={24} fill={C.marbleShade} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 鍛冶屋 (真ん中): れんがの炉・金床・煙突 */}
        <g>
          <rect x={720} y={330} width={500} height={330} fill={C.mud} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 700 340 L 970 270 L 1240 340 Z" fill={C.terracotta} stroke={KRP.ink} strokeWidth={7} />
          <rect x={760} y={400} width={420} height={260} fill="#5A4636" stroke={KRP.ink} strokeWidth={5} />
          {/* 煙突と煙 */}
          <rect x={1080} y={180} width={60} height={130} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((k) => {
            const p = ((f + k * 10) % 30) / 30;
            const w = lerp(1, 0.25, 1 - fire);
            return <circle key={k} cx={1110 + Math.sin(p * 6 + k) * 18} cy={170 - p * 140} r={(18 + p * 30) * w} fill={C.smoke} opacity={(1 - p) * 0.7} stroke={KRP.ink} strokeWidth={3} />;
          })}
          {/* 炉 */}
          <rect x={800} y={500} width={200} height={160} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 4 }, (_, r) => <line key={r} x1={800} y1={530 + r * 34} x2={1000} y2={530 + r * 34} stroke={C.brickDark} strokeWidth={3} />)}
          <path d="M 840 600 L 840 560 Q 900 520 960 560 L 960 600 Z" fill={KRP.ink} />
          {fire > 0 && (
            <g transform={`translate(900 600) scale(${fire} ${fire * (1 + 0.1 * Math.sin(f))})`}>
              <path d="M -50 0 Q -46 -50 -14 -70 Q -20 -36 0 -40 Q 6 -80 30 -96 Q 30 -50 50 -30 Q 56 -10 50 0 Z" fill={C.fire} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -24 0 Q -20 -30 0 -40 Q 6 -20 24 -10 Q 24 0 24 0 Z" fill={C.fireCore} />
            </g>
          )}
          {fire < 0.3 && <rect x={846} y={588} width={110} height={12} rx={6} fill={KRP.grayDark} />}
          {/* 金床 */}
          <path d="M 1040 600 L 1160 600 L 1140 620 L 1120 620 L 1120 660 L 1080 660 L 1080 620 L 1060 620 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <HmBSunPlaque x={970} y={420} s={0.8} t={seg(f, 18, 26)} swing={Math.sin(f / 6) * 6} f={f} />
        </g>
        {/* パン屋 (右): 丸い窯 */}
        <g>
          <rect x={1290} y={330} width={590} height={330} fill={C.mudLight} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1270} y={310} width={630} height={36} fill={C.terracotta} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 1420 660 L 1420 520 Q 1580 360 1740 520 L 1740 660 Z" fill={C.terracotta} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 1500 660 L 1500 590 Q 1580 520 1660 590 L 1660 660 Z" fill={KRP.ink} />
          {lid < 1 && <ellipse cx={1580} cy={630} rx={60 * (1 - lid)} ry={20 * (1 - lid)} fill={C.fire} opacity={0.6} />}
          <g transform={`translate(${lerp(1800, 1580, lid)} 0)`}>
            <path d="M -86 664 L -86 590 Q 0 510 86 590 L 86 664 Z" fill={C.post} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-14} y={590} width={28} height={40} rx={8} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 棚のパン */}
          <rect x={1310} y={430} width={90} height={16} fill={C.post} stroke={KRP.ink} strokeWidth={4} />
          {[1325, 1355, 1385].map((bx) => <ellipse key={bx} cx={bx} cy={418} rx={16} ry={12} fill={C.bread} stroke={KRP.ink} strokeWidth={3} />)}
          <HmBSunPlaque x={1580} y={420} s={0.8} t={seg(f, 22, 30)} swing={Math.sin(f / 6 + 1) * 6} f={f} />
        </g>
        <HmBSunPlaque x={350} y={364} s={0.7} t={seg(f, 16, 24)} swing={Math.sin(f / 6 + 2) * 6} f={f} />
        {/* 石畳 */}
        <rect x={-80} y={660} width={2080} height={500} fill={C.stoneRoad} />
        {Array.from({ length: 7 }, (_, r) => Array.from({ length: 14 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-60 + c * 150 + (r % 2) * 75} y={672 + r * 60} width={136} height={50} rx={14}
            fill={(r + c) % 3 ? C.stoneRoad : C.marbleShade} stroke={C.stoneLine} strokeWidth={4} />
        )))}
        {/* 置いた道具: 金づち・やっとこ・パンのへら・役人の書板 */}
        <g>
          <rect x={860} y={860} width={90} height={16} rx={6} fill={C.post} stroke={KRP.ink} strokeWidth={4} transform="rotate(-8 900 868)" />
          <rect x={936} y={840} width={34} height={44} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(-8 900 868)" />
          <path d="M 1110 880 L 1180 830 M 1116 886 L 1190 846" stroke={KRP.grayDark} strokeWidth={8} strokeLinecap="round" />
          <rect x={1440} y={700} width={20} height={190} rx={6} fill={C.post} stroke={KRP.ink} strokeWidth={4} transform="rotate(14 1450 890)" />
          <ellipse cx={1420} cy={712} rx={36} ry={22} fill={C.post} stroke={KRP.ink} strokeWidth={4} transform="rotate(14 1450 890)" />
          <rect x={640} y={856} width={70} height={50} rx={4} fill={C.mudDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(10 675 880)" />
        </g>
        {/* 役人 (紫の縁のトーガ): 大きく伸び */}
        <HmBRoman x={500} y={900} s={0.92} f={f} toga face={stretch ? "joy" : "normal"} pose={stretch ? "banzai" : "stand"} phase={1} />
        {stretch && [0, 1].map((k) => (
          <path key={k} d={`M ${430 + k * 140} ${600 - k * 4} q ${k ? 20 : -20} -20 ${k ? 10 : -10} -40`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round"
            opacity={0.7} transform={`translate(0 ${-Math.sin(f / 3) * 4})`} />
        ))}
        {/* 鍛冶屋とパン屋: 談笑 */}
        <HmBRoman x={1040} y={910} s={0.92} f={f} apron={C.robeBrownDark} tunic={C.tunicDark} face="joy" pose="armsFolded" gaze={[6, 0]} phase={2} lean={Math.sin(f / 5) * 2} />
        <HmBRoman x={1300} y={910} s={0.92} f={f} apron={KRP.white} face="smile" pose="point" pointDir={-1} gaze={[-6, 0]} phase={4} />
        {/* 笑い声の印 */}
        <g opacity={0.8}>
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${1160 + k * 24} ${600 - ((f + k * 6) % 18)} l 10 -14`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #28 ただし、農家は別です。
// 格: 並 / seed 5028
// 絵: どこ: ローマの町の外の畑 (なだらかな丘・ぶどう棚)。演出: 町の門の内側ではみんな休んでいるのに、門の外の畑で農家がひとり、鍬を持って立っている。門の上の太陽マークの札から、点線で農家のほうへ「例外」の赤い矢印が出て、農家の頭上に「OK」ではなく**大きな○の札**。農家は「当然」という顔 (face="smile")。動き: 矢印が伸びる / ○がぽん / 鍬を担ぎ直す
// どこ: ローマの町の外。左に石の城壁と門 (門の奥では町の人が寝ころんで休んでいる)、右になだらかな丘とぶどう棚と耕した畑
// 演出: 門の上の太陽の札から、赤い点線の「例外」の矢印が弧を描いて畑の農家へ伸び、農家の頭上に大きな○の札がぽん。
//       農家は「当然」という顔で鍬を担ぎ直す (f=45 = 矢印・○・にっこり農家)
// 動き: 矢印が伸びる (f6〜22) / ○がぽん (f22〜30) / 鍬を担ぎ直す (f32〜40) / 門の奥の人の寝返り
const Hm028: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeOut(seg(f, 0, 42));
  const ar = seg(f, 6, 22);
  const hop = Math.sin(seg(f, 32, 40) * Math.PI) * -22;
  const P0: [number, number] = [400, 250], P1: [number, number] = [860, 40], P2: [number, number] = [1250, 330];
  const bz = (t: number): [number, number] => [
    (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0],
    (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1],
  ];
  const N = 22;
  const end = bz(ar);
  const tip = bz(Math.max(ar - 0.03, 0));
  const tipRot = (Math.atan2(end[1] - tip[1], end[0] - tip[0]) * 180) / Math.PI;
  const fx = 1340, fy = 820, fs = 1.05;
  return (
    <Frame f={f} seed={5028}>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        <rect x={-60} y={-60} width={2040} height={640} fill={C.sky} />
        <HmBSun x={1760} y={110} r={44} f={f} />
        <HmBCloud x={1180} y={130} s={0.55} />
        {/* 丘 */}
        <path d="M -60 520 Q 500 380 1000 470 Q 1500 360 1980 450 L 1980 1140 L -60 1140 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 600 560 Q 1200 470 1980 540 L 1980 1140 L 600 1140 Z" fill={C.grass} stroke={KRP.ink} strokeWidth={6} />
        {/* ぶどう棚 */}
        {[0, 1, 2].map((r) => (
          <g key={r}>
            {Array.from({ length: 7 }, (_, c) => (
              <rect key={c} x={860 + c * 160 + r * 20} y={440 + r * 50} width={12} height={90} fill={C.post} stroke={KRP.ink} strokeWidth={3} />
            ))}
            <path d={`M ${860 + r * 20} ${450 + r * 50} L ${1830 + r * 20} ${450 + r * 50}`} stroke={C.post} strokeWidth={5} />
            {Array.from({ length: 14 }, (_, c) => (
              <circle key={c} cx={880 + c * 70 + r * 20} cy={452 + r * 50 + Math.sin(c) * 6} r={20} fill={c % 2 ? C.vine : C.vineDark} stroke={KRP.ink} strokeWidth={3} />
            ))}
            {Array.from({ length: 5 }, (_, c) => (
              <circle key={`g${c}`} cx={910 + c * 200 + r * 30} cy={478 + r * 50} r={10} fill={C.grape} stroke={KRP.ink} strokeWidth={2.5} />
            ))}
          </g>
        ))}
        {/* 耕した畑 */}
        <path d="M 700 660 L 1980 620 L 1980 1140 L 520 1140 Z" fill={C.soil} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${700 - i * 22} ${690 + i * 50} L 1980 ${650 + i * 56}`} stroke={C.soilDark} strokeWidth={8} />
        ))}
        {/* 城壁と門 */}
        <g>
          <rect x={-60} y={300} width={700} height={520} fill={C.stoneRoad} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 9 }, (_, r) => Array.from({ length: 6 - (r % 2) }, (_, c) => (
            <rect key={`${r}-${c}`} x={-50 + c * 120 + (r % 2) * 60} y={310 + r * 56} width={110} height={48} rx={6} fill="none" stroke={C.stoneLine} strokeWidth={4} />
          )))}
          {Array.from({ length: 6 }, (_, c) => <rect key={c} x={-40 + c * 120} y={262} width={70} height={46} fill={C.stoneRoad} stroke={KRP.ink} strokeWidth={6} />)}
          {/* 門の中 (町の休み) */}
          <path d="M 200 820 L 200 470 Q 340 350 480 470 L 480 820 Z" fill={C.marble} stroke={KRP.ink} strokeWidth={8} />
          <rect x={204} y={720} width={272} height={100} fill={C.stoneRoad} />
          <rect x={210} y={480} width={60} height={240} fill={C.mud} stroke={KRP.ink} strokeWidth={4} />
          <rect x={410} y={500} width={64} height={220} fill={C.mudLight} stroke={KRP.ink} strokeWidth={4} />
          <g transform="translate(300 770) rotate(-90)">
            <PersonMini x={0} y={0} s={0.5} color={C.tunicDark} f={0} face="smile" />
          </g>
          <PersonMini x={420} y={780} s={0.5} color={C.banner} f={f} face="smile" />
          <text x={300 + 30} y={690 - ((f % 20) * 1.5)} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.robeIndigo} opacity={0.8}>z</text>
          <path d="M 200 820 L 200 470 Q 340 350 480 470 L 480 820" fill="none" stroke={KRP.ink} strokeWidth={8} />
          <path d="M 176 820 L 176 460 Q 340 316 504 460 L 504 820" fill="none" stroke={C.stoneLine} strokeWidth={10} />
        </g>
        <HmBSunPlaque x={340} y={240} s={0.9} swing={Math.sin(f / 7) * 4} f={f} />
        {/* 例外の赤い点線の矢印 */}
        {Array.from({ length: N }, (_, i) => {
          const t = (i + 1) / (N + 1);
          if (t > ar - 0.02) return null;
          const [px, py] = bz(t);
          return <circle key={i} cx={px} cy={py} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} />;
        })}
        {ar > 0.05 && (
          <g transform={`translate(${end[0]} ${end[1]}) rotate(${tipRot})`}>
            <polygon points="18,0 -26,-22 -16,0 -26,22" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        <TagPlate x={860} y={150} text="例外" size={40} t={seg(f, 12, 20)} color={KRP.red} />
        {/* 農家: 鍬を担いでにっこり */}
        <g transform={`translate(0 ${hop * 0.3})`}>
          <HmBRoman x={fx} y={fy} s={fs} f={f} apron={C.robeBrown} tunic={C.robeNat} face="smile" pose="hold" gaze={[-6, -4]} phase={2} />
        </g>
        <g transform={`translate(0 ${hop})`}>
          <line x1={1170} y1={778} x2={1610} y2={568} stroke={C.post} strokeWidth={16} strokeLinecap="round" />
          <line x1={1170} y1={778} x2={1610} y2={568} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          <path d="M 1596 560 L 1640 556 L 1660 650 L 1610 660 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1326} cy={697} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1356} cy={697} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 大きな○の札 */}
        {seg(f, 22, 30) > 0 && (
          <g transform={`translate(${fx} 360) scale(${pop(seg(f, 22, 30))})`}>
            <rect x={-90} y={-90} width={180} height={180} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <circle r={58} fill="none" stroke={KRP.red} strokeWidth={18} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #29 種まきや、ぶどうの植えつけにいい日は、日曜を待ってくれないからです。
// 格: 山 / seed 5029
// 絵: どこ: 畑とぶどう畑。空。演出: 空に雲の切れ間ができて、**ちょうど晴れのお天気マーク**が「今だ!」と言わんばかりに畑の上に止まる。その横で暦の板の日曜 (太陽マーク) の札が「待って」と手を伸ばすが、お天気は通り過ぎかける。農家があわてて種をまく (種が弧を描いて飛ぶ)。動き: お天気マークが流れていく / 種がまかれる / 農家が走る
// どこ: 町の外の畑とぶどうの苗の列。広い空。左に柱に打ちつけた「暦の板」(7つの区画、7つ目が太陽の日曜の札)
// 演出: 雲がぱっと割れて、にこにこの晴れのお天気マークが畑の真上に止まり光を落とす。暦の板の日曜の札が
//       困り顔で小さな手をのばして「待って」をするが、お天気はもう右へ流れかけている。農家は種袋を下げて走りながら種をまく
// 動き: 雲が割れる (f0〜12) / お天気が止まって (f10〜24) 右へ流れ出す / 日曜の手が伸びる / 農家が走る / 種が弧を描く
const Hm029: React.FC<{ f: number }> = ({ f }) => {
  const gap = easeOut(seg(f, 0, 12));
  const wIn = easeOut(seg(f, 0, 10));
  const wOut = easeInOut(seg(f, 24, 42));
  const wx = lerp(lerp(700, 960, wIn), 1240, wOut);
  const wy = 210 - 20 * wIn;
  const reach = easeOut(seg(f, 16, 34));
  const runX = lerp(640, 1120, seg(f, 0, 42));
  const fy = 860, fs = 0.95;
  return (
    <Frame f={f} seed={5029}>
      <g transform={`translate(960 540) scale(${1 + 0.04 * seg(f, 0, 42)}) translate(-960 -540)`}>
        {/* 空 */}
        <rect x={-60} y={-60} width={2040} height={680} fill={C.sky} />
        <rect x={-60} y={360} width={2040} height={260} fill={C.skyLow} opacity={0.8} />
        {/* 雲が割れる */}
        <g transform={`translate(${-260 * gap} 0)`}><HmBCloud x={820} y={200} s={1.3} color={C.cloudShade} /><HmBCloud x={620} y={110} s={0.9} /></g>
        <g transform={`translate(${280 * gap} 0)`}><HmBCloud x={1120} y={190} s={1.3} color={C.cloudShade} /><HmBCloud x={1340} y={110} s={0.9} /></g>
        {/* お天気の光 (畑へ落ちる) */}
        {wIn > 0.5 && (
          <polygon points={`${wx - 70},${wy + 60} ${wx + 70},${wy + 60} ${wx + 340},${900} ${wx - 340},${900}`}
            fill={C.lampCore} opacity={0.28 * (1 - wOut * 0.6) * seg(wIn, 0.5, 1)} />
        )}
        {/* 遠くの丘と町 */}
        <path d="M -60 560 Q 500 470 1000 540 Q 1500 460 1980 530 L 1980 1140 L -60 1140 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={6} />
        <g fill={C.marble} stroke={KRP.ink} strokeWidth={3}>
          {[1500, 1560, 1630, 1700].map((bx, i) => <rect key={bx} x={bx} y={490 - i * 6} width={50} height={50 + i * 6} />)}
          <polygon points="1555,470 1600,440 1645,470" />
        </g>
        {/* 畑 */}
        <path d="M -60 640 Q 960 600 1980 630 L 1980 1140 L -60 1140 Z" fill={C.soil} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -60 ${670 + i * 60} Q 960 ${640 + i * 62} 1980 ${664 + i * 60}`} stroke={C.soilDark} strokeWidth={9} fill="none" />
        ))}
        {/* ぶどうの苗の列 (植えたて) */}
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i} transform={`translate(${780 + i * 120} 660) rotate(${Math.sin(f / 8 + i) * 3})`}>
            <line x1={0} y1={0} x2={0} y2={-70} stroke={C.post} strokeWidth={6} />
            <path d="M 0 -50 q -24 -10 -30 -30 q 22 0 30 22 Z M 0 -64 q 24 -10 30 -30 q -22 0 -30 22 Z" fill={C.vine} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 苗のかご */}
        <g transform="translate(1600 800)">
          <path d="M -70 -60 L 70 -60 L 56 20 L -56 20 Z" fill={C.mud} stroke={KRP.ink} strokeWidth={6} />
          {[-40, -10, 20, 48].map((sx) => <line key={sx} x1={sx} y1={-60} x2={sx * 0.8} y2={20} stroke={C.mudDark} strokeWidth={4} />)}
          {[-40, 0, 40].map((sx) => (
            <path key={sx} d={`M ${sx} -60 l 0 -50 M ${sx} -90 q -20 -6 -24 -24 q 20 2 24 20 M ${sx} -100 q 20 -8 22 -26 q -18 4 -22 22`} stroke={C.vineDark} strokeWidth={5} fill={C.vine} />
          ))}
        </g>
        {/* 暦の板 (柱に打ちつけ。7つ目が太陽の日曜) */}
        <g>
          <rect x={300} y={430} width={34} height={420} fill={C.post} stroke={KRP.ink} strokeWidth={6} />
          <rect x={90} y={300} width={500} height={150} rx={10} fill={HP.wood} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={106 + i * 68} y={322} width={58} height={70} rx={6} fill={i === 6 ? C.lampCore : HP.woodMid} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={135 + i * 68} cy={357} r={6} fill={HP.woodDark} />)}
          <text x={538} y={432} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.red}>日曜</text>
          {/* 日曜の札の「待って」の手 */}
          <path d={`M 560 350 Q ${600 + 120 * reach} ${300 - 60 * reach} ${620 + 230 * reach} ${290 - 70 * reach}`}
            stroke={KRP.ink} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d={`M 560 350 Q ${600 + 120 * reach} ${300 - 60 * reach} ${620 + 230 * reach} ${290 - 70 * reach}`}
            stroke={KRP.yellow} strokeWidth={8} fill="none" strokeLinecap="round" />
          <g transform={`translate(${620 + 230 * reach} ${290 - 70 * reach})`}>
            <circle r={18} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
            {[-1, 0, 1].map((k) => <line key={k} x1={k * 8} y1={-14} x2={k * 10} y2={-30} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />)}
          </g>
          {/* 日曜の札の顔 (困り顔) */}
          <g transform="translate(538 357)">
            <HmBSun x={0} y={0} r={22} f={f} />
            <line x1={-12} y1={-8} x2={-4} y2={-4} stroke={KRP.ink} strokeWidth={3} />
            <line x1={12} y1={-8} x2={4} y2={-4} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={-7} cy={2} r={3} fill={KRP.ink} /><circle cx={7} cy={2} r={3} fill={KRP.ink} />
            <path d="M -6 12 Q 0 8 6 12" stroke={KRP.ink} strokeWidth={3} fill="none" />
          </g>
          {reach > 0.6 && (
            <path d="M 610 260 q -8 14 0 20 q 8 -6 0 -20 Z" fill={C.sweat} stroke={KRP.ink} strokeWidth={3} />
          )}
        </g>
        {/* お天気マーク (にこにこ晴れ) */}
        <g transform={`translate(${wx} ${wy + Math.sin(f / 5) * 4}) rotate(${wOut * 10})`}>
          <HmBSun x={0} y={0} r={74} f={f} glow={1} face />
        </g>
        {wOut > 0.05 && (
          <g stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.85}>
            <line x1={wx - 200} y1={wy - 30} x2={wx - 140} y2={wy - 30} />
            <line x1={wx - 220} y1={wy + 20} x2={wx - 150} y2={wy + 20} />
            <line x1={wx - 190} y1={wy + 70} x2={wx - 140} y2={wy + 70} />
          </g>
        )}
        {/* 農家: 種袋を下げて走りながらまく */}
        {[0, 1, 2].map((k) => (
          <line key={k} x1={runX - 140 - k * 20} y1={fy - 240 + k * 50} x2={runX - 90 - k * 20} y2={fy - 240 + k * 50}
            stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.5} />
        ))}
        <HmBRoman x={runX} y={fy} s={fs} f={f} tunic={C.robeNat} apron={C.robeBrown} face="surprised" pose="run" gaze={[6, -2]} phase={3} lean={8} />
        <g>
          <path d={`M ${runX - 40} ${fy - 150} L ${runX + 30} ${fy - 60}`} stroke={C.robeBrownDark} strokeWidth={7} />
          <ellipse cx={runX + 36} cy={fy - 56} rx={34} ry={30} fill={C.mud} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${runX + 10} ${fy - 80} q 26 -10 52 0`} stroke={C.mudDark} strokeWidth={4} fill="none" />
        </g>
        {Array.from({ length: 14 }, (_, k) => {
          const born = (k * 3) % 42;
          const age = ((f - born) % 18 + 18) % 18;
          const p = age / 18;
          const x0 = runX + 90, y0 = fy - 200;
          const vx = 120 + rnd(37, k) * 160;
          const px = x0 + vx * p, py = y0 - 120 * p + 300 * p * p;
          return <ellipse key={k} cx={px} cy={py} rx={7} ry={5} fill={C.mudLight} stroke={KRP.ink} strokeWidth={2.5} opacity={p < 0.95 ? 1 : 0} />;
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #30 休みの決まりは、最初から、天気に負けていました。
// 格: 並 / seed 5030
// 絵: どこ: ローマの畑の小高い丘の上 (#29 の続き・引き)。演出: 太陽マークの「日曜」の札と、雨雲・晴れのお天気が**腕相撲**をしている (擬人化した小さな札と雲に手を生やす)。お天気が勝って、日曜の札がぱたんと倒れる。審判役のカラスが羽を上げる。動き: 腕相撲の押し合い / 札が倒れる / カラスが羽を上げる
// どこ: #29 の畑を見下ろす小高い丘の上 (引き)。眼下にぱっちわーくの畑と小さな町。丘のてっぺんに平たい岩
// 演出: 岩の上で、左の「日曜」の札 (太陽のマーク・手足つき) と、右の晴れと雨のお天気 (太陽を背負った雨雲) が腕相撲。
//       ぎりぎりの押し合いのあと、お天気が一気にねじ伏せて、日曜の札はぱたんと仰向けに倒れる。審判のカラスが右の羽をばっと上げる
// 動き: 押し合いのぷるぷる (〜f24) / ねじ伏せ (f24〜32) / 札が倒れる (f30〜38) / カラスが羽を上げる (f32〜38) / 雨粒
const Hm030: React.FC<{ f: number }> = ({ f }) => {
  const win = easeInOut(seg(f, 24, 32));
  const fall = easeOut(seg(f, 30, 38));
  const wing = pop(seg(f, 32, 38));
  const th = ((lerp(Math.sin(f / 1.6) * 7 + Math.sin(f / 5) * 6, -78, win)) * Math.PI) / 180;
  const Hx = 960 + Math.sin(th) * 120, Hy = 630 - Math.cos(th) * 120;
  const cam = 1 + 0.06 * easeOut(seg(f, 0, 42));
  const thud = seg(f, 32, 40);
  return (
    <Frame f={f} seed={5030}>
      <g transform={`translate(960 560) scale(${cam}) translate(-960 -560)`}>
        <rect x={-60} y={-60} width={2040} height={600} fill={C.sky} />
        <HmBCloud x={300} y={120} s={0.6} />
        {/* 眼下の畑 (ぱっちわーく) と町 */}
        <path d="M -60 430 Q 960 380 1980 430 L 1980 1140 L -60 1140 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <polygon key={i} points={`${-60 + i * 170},${450 + (i % 3) * 6} ${110 + i * 170},${446} ${130 + i * 170},${540} ${-40 + i * 170},${546}`}
            fill={[C.grass, C.soil, C.vine, C.hill][i % 4]} stroke={KRP.ink} strokeWidth={3} opacity={0.85} />
        ))}
        <g fill={C.marble} stroke={KRP.ink} strokeWidth={3}>
          {[180, 220, 260].map((bx, i) => <rect key={bx} x={bx} y={400 - i * 8} width={36} height={40 + i * 8} />)}
        </g>
        {/* 丘のてっぺん */}
        <path d="M -60 700 Q 960 600 1980 700 L 1980 1140 L -60 1140 Z" fill={C.grass} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} d={`M ${rnd(38, i) * 1920} ${740 + rnd(39, i) * 300} l 8 -16 l 6 16`} stroke={C.grassDark} strokeWidth={4} fill="none" />
        ))}
        {/* 平たい岩 */}
        <path d="M 800 760 L 820 650 Q 960 620 1110 650 L 1130 760 Z" fill={C.stoneRoad} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 820 650 Q 960 680 1110 650" stroke={C.stoneLine} strokeWidth={5} fill="none" />
        {/* 審判のカラス (棒の上) */}
        <g>
          <rect x={950} y={330} width={20} height={300} fill={C.post} stroke={KRP.ink} strokeWidth={5} />
          <g transform="translate(960 300)">
            <ellipse cx={0} cy={0} rx={44} ry={36} fill="#3E4452" stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={-46} r={26} fill="#3E4452" stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-9} cy={-50} r={7} fill={KRP.white} /><circle cx={-9} cy={-50} r={3.5} fill={KRP.ink} />
            <circle cx={9} cy={-50} r={7} fill={KRP.white} /><circle cx={9 + win * 2} cy={-50} r={3.5} fill={KRP.ink} />
            <path d="M -10 -38 L 0 -22 L 10 -38 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
            <path d="M -44 0 q -24 20 -10 40 q 20 -10 30 -30 Z" fill="#2E3340" stroke={KRP.ink} strokeWidth={4} />
            {/* 右の羽 (勝ったほうへ上げる) */}
            <g transform={`rotate(${-140 * wing} 40 -6)`}>
              <path d="M 40 -6 q 40 10 50 46 q -40 0 -56 -26 Z" fill="#2E3340" stroke={KRP.ink} strokeWidth={4} />
            </g>
            <line x1={-10} y1={34} x2={-12} y2={46} stroke={KRP.orange} strokeWidth={5} />
            <line x1={10} y1={34} x2={12} y2={46} stroke={KRP.orange} strokeWidth={5} />
          </g>
        </g>
        {/* 右: 晴れと雨のお天気 (太陽を背負った雨雲) */}
        <g transform={`translate(${-30 * win} 0)`}>
          <HmBSun x={1420} y={330} r={62} f={f} />
          {Array.from({ length: 7 }, (_, k) => {
            const p = ((f * 1.4 + k * 7) % 20) / 20;
            return <path key={k} d="M 0 -10 q -7 12 0 16 q 7 -4 0 -16 Z" fill={C.sweat} stroke={KRP.ink} strokeWidth={2.5}
              transform={`translate(${1180 + k * 44} ${560 + p * 130})`} opacity={1 - p} />;
          })}
          <HmBCloud x={1300} y={480} s={1.35} color={C.rainCloud} />
          {/* 顔 (にやり) */}
          <g transform="translate(1290 430)">
            <path d="M -50 -6 q 14 -12 28 0" stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M 22 -6 q 14 -12 28 0" stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d={win > 0.5 ? "M -30 24 Q 0 54 30 24 Z" : "M -26 26 L 26 26"} fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          </g>
          {/* 右腕 (雲から肘、肘から手) */}
          <path d={`M 1170 520 Q 1080 560 1050 640 L ${Hx + 14} ${Hy}`} stroke={KRP.ink} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M 1170 520 Q 1080 560 1050 640 L ${Hx + 14} ${Hy}`} stroke={C.cloudShade} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* 左: 日曜の札 (倒れる) */}
        <g transform={`rotate(${-82 * fall} 560 760)`}>
          <rect x={590} y={736} width={20} height={30} fill={C.post} stroke={KRP.ink} strokeWidth={4} />
          <rect x={720} y={736} width={20} height={30} fill={C.post} stroke={KRP.ink} strokeWidth={4} />
          <rect x={560} y={420} width={220} height={320} rx={16} fill={HP.wood} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 580 470 q 90 10 180 0 M 580 690 q 90 -10 180 0" stroke={HP.grain} strokeWidth={4} fill="none" />
          <HmBSun x={670} y={540} r={56} f={fall > 0 ? 0 : f} />
          {/* 顔 (必死 → ×目) */}
          {fall < 0.3 ? (
            <g>
              <line x1={640} y1={522} x2={656} y2={530} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
              <line x1={700} y1={522} x2={684} y2={530} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
              <circle cx={650} cy={540} r={5} fill={KRP.ink} /><circle cx={690} cy={540} r={5} fill={KRP.ink} />
              <rect x={652} y={560} width={36} height={12} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            </g>
          ) : (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              <line x1={642} y1={532} x2={658} y2={548} /><line x1={658} y1={532} x2={642} y2={548} />
              <line x1={682} y1={532} x2={698} y2={548} /><line x1={698} y1={532} x2={682} y2={548} />
              <path d="M 654 570 Q 670 560 686 570" fill="none" />
            </g>
          )}
          <text x={670} y={680} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.red}>日曜</text>
          {/* 汗 */}
          {fall < 0.3 && [0, 1].map((k) => (
            <path key={k} d="M 0 -12 q -8 12 0 18 q 8 -6 0 -18 Z" fill={C.sweat} stroke={KRP.ink} strokeWidth={3}
              transform={`translate(${590 + k * 160} ${450 + ((f + k * 6) % 12) * 3})`} />
          ))}
        </g>
        {/* 左腕 (札から肘、肘から手)。倒れたら手をはなす */}
        {fall < 0.2 ? (
          <g>
            <path d={`M 770 560 Q 850 580 870 640 L ${Hx - 14} ${Hy}`} stroke={KRP.ink} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M 770 560 Q 850 580 870 640 L ${Hx - 14} ${Hy}`} stroke={KRP.yellow} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
        {/* 組んだ手 */}
        <circle cx={Hx} cy={Hy} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {win < 0.9 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
            <line x1={Hx - 50} y1={Hy - 50} x2={Hx - 64} y2={Hy - 66} /><line x1={Hx + 50} y1={Hy - 50} x2={Hx + 64} y2={Hy - 66} />
            <line x1={Hx} y1={Hy - 54} x2={Hx} y2={Hy - 74} />
          </g>
        )}
        {/* ねじ伏せた瞬間の土ぼこり */}
        {thud > 0 && thud < 1 && (
          <g opacity={1 - thud}>
            {[0, 1, 2, 3, 4].map((k) => (
              <circle key={k} cx={560 + (k - 2) * 60 * (0.5 + thud)} cy={760 - 20 * thud} r={14 + 22 * thud} fill="none" stroke={KRP.grayDark} strokeWidth={5} />
            ))}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #31 ちなみに、週を7日でなくしてみた国も、あります。
// 格: 図 / seed 5031
// 絵: どこ: 古い世界地図 (羊皮紙風・机の上)。演出: 地図の上に「7日」の輪っか (7つの玉の首飾りのような円) が置かれ、そこから1つ玉が転がり出て、地図の北のほう (ユーラシアの北東) へころころ転がっていく。玉が止まった所に赤い旗。動き: 玉が転がる / 旗がぽんと立つ / 地図の端がめくれる
// どこ: 木の机の上に広げた羊皮紙の古い世界地図 (大陸は実際の形に近く)。ろうそく・羽ペンとインク壺・コンパス・羅針図
// 演出: 大西洋の上に「7日」の7つの玉の輪っか。そこから玉が1つ外れて、ヨーロッパを越えて北東 (ユーラシアの北) へ
//       ころころ転がり、止まった所に赤い旗がぽんと立つ。地図の右上の端がふわっとめくれる
// 動き: 玉が転がり出す (f6〜30、はずみながら) / 旗がぽん (f30〜36) / 地図の端 / ろうそくの火 / カメラが少し北東へ寄る
const HmBLL = (lon: number, lat: number): [number, number] => [960 + lon * 4.0, 470 - lat * 4.6];
const HmBPoly = (pts: number[][]) => pts.map(([lo, la]) => HmBLL(lo, la).join(",")).join(" ");
const HM_B_LANDS: number[][][] = [
  // 北アメリカ
  [[-165, 65], [-140, 70], [-115, 70], [-95, 72], [-80, 66], [-62, 58], [-60, 47], [-70, 43], [-76, 35], [-80, 26], [-82, 30], [-90, 29], [-97, 26], [-97, 20],
    [-90, 21], [-87, 15], [-82, 9], [-80, 8], [-86, 12], [-92, 15], [-105, 20], [-110, 24], [-117, 32], [-124, 40], [-124, 48], [-135, 57], [-150, 60], [-160, 58], [-166, 62]],
  // グリーンランド
  [[-55, 82], [-30, 83], [-20, 72], [-42, 60], [-52, 66]],
  // 南アメリカ
  [[-80, 8], [-75, 11], [-62, 10], [-52, 4], [-50, 0], [-35, -6], [-40, -22], [-48, -27], [-57, -36], [-65, -42], [-68, -55], [-74, -48], [-72, -30], [-70, -18], [-76, -12], [-81, -5], [-79, 2]],
  // ユーラシア
  [[-9, 37], [-9, 43], [-1, 46], [-4, 48], [2, 51], [8, 54], [10, 57], [12, 55], [18, 55], [21, 57], [24, 60], [21, 63], [24, 66], [18, 63], [14, 60], [8, 58], [5, 61],
    [14, 67], [20, 70], [28, 71], [40, 68], [44, 66], [55, 68], [68, 69], [72, 72], [80, 73], [100, 77], [112, 74], [130, 71], [150, 71], [170, 70], [180, 68], [180, 64],
    [170, 60], [163, 58], [160, 52], [156, 57], [143, 59], [140, 53], [142, 47], [135, 43], [130, 42], [127, 38], [126, 35], [122, 31], [120, 25], [111, 21], [106, 18],
    [109, 12], [104, 9], [101, 3], [104, 1], [98, 8], [97, 16], [92, 21], [87, 21], [80, 15], [77, 8], [73, 19], [67, 24], [57, 25], [56, 22], [52, 17], [44, 12], [39, 20],
    [35, 28], [34, 31], [36, 36], [30, 36], [27, 37], [26, 40], [23, 38], [20, 40], [15, 41], [18, 40], [16, 38], [12, 44], [8, 44], [3, 43], [0, 39]],
  // アフリカ
  [[-17, 15], [-17, 21], [-13, 28], [-10, 30], [-6, 35], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [35, 27], [39, 18], [43, 12], [51, 11], [48, 4], [42, -2],
    [40, -11], [35, -20], [33, -27], [27, -34], [20, -35], [17, -29], [12, -17], [13, -9], [9, -1], [9, 4], [5, 5], [-4, 5], [-8, 4], [-13, 8], [-16, 12]],
  // オーストラリア
  [[114, -22], [122, -18], [130, -12], [136, -12], [137, -15], [142, -11], [146, -19], [153, -26], [151, -34], [146, -39], [140, -38], [135, -34], [131, -31], [124, -33], [115, -34]],
  // イギリス・アイルランド・日本・マダガスカル
  [[-5, 50], [1, 51], [0, 53], [-2, 56], [-4, 58], [-6, 57], [-4, 54], [-5, 52]],
  [[-10, 52], [-6, 52], [-6, 55], [-9, 54]],
  [[130, 31], [134, 33], [140, 35], [141, 38], [142, 41], [140, 41], [139, 38], [136, 36], [131, 34]],
  [[44, -14], [50, -15], [48, -25], [44, -24]],
];
const Hm031: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.08 * easeOut(seg(f, 10, 42));
  const ringC = HmBLL(-32, 26);
  const R = 74;
  const flag = HmBLL(60, 62);
  const roll = easeInOut(seg(f, 6, 30));
  const start: [number, number] = [ringC[0] + Math.cos(-0.7) * R, ringC[1] + Math.sin(-0.7) * R];
  const mid: [number, number] = [1010, 150];
  const bx = (1 - roll) * (1 - roll) * start[0] + 2 * (1 - roll) * roll * mid[0] + roll * roll * flag[0];
  const by = (1 - roll) * (1 - roll) * start[1] + 2 * (1 - roll) * roll * mid[1] + roll * roll * flag[1]
    - Math.abs(Math.sin(roll * Math.PI * 4)) * 34 * (1 - roll);
  const flagT = seg(f, 30, 36);
  const curl = 0.5 + 0.5 * Math.sin(f / 7);
  return (
    <Frame f={f} seed={5031}>
      <g transform={`translate(${lerp(960, 1040, seg(f, 10, 42))} 520) scale(${cam}) translate(-960 -520)`}>
        {/* 机 */}
        <rect x={-80} y={-80} width={2080} height={1240} fill={C.deskWood} />
        <g stroke={C.deskWoodDark} strokeWidth={5} fill="none" opacity={0.55}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -80 ${40 + i * 150} q 500 ${rnd(40, i) * 30 - 15} 1000 0 q 500 ${rnd(41, i) * 30 - 15} 1080 0`} />
          ))}
        </g>
        {/* 地図 (羊皮紙) */}
        <rect x={196} y={66} width={1540} height={780} rx={10} fill={KRP.ink} opacity={0.3} />
        <path d="M 180 50 L 1720 50 L 1720 820 Q 960 836 180 820 Z" fill={C.parch} stroke={KRP.ink} strokeWidth={8} />
        <rect x={210} y={78} width={1480} height={716} fill={C.sea} stroke={C.parchDark} strokeWidth={5} />
        {/* 経線・緯線 */}
        <g stroke={C.parchDark} strokeWidth={2.5} opacity={0.7} strokeDasharray="10 8">
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lo) => <line key={lo} x1={HmBLL(lo, 0)[0]} y1={80} x2={HmBLL(lo, 0)[0]} y2={792} />)}
          {[60, 30, 0, -30].map((la) => <line key={la} x1={212} y1={HmBLL(0, la)[1]} x2={1688} y2={HmBLL(0, la)[1]} />)}
        </g>
        {/* 海の波線 */}
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M ${260 + rnd(42, i) * 1360} ${560 + rnd(43, i) * 200} q 14 -10 28 0 q 14 10 28 0`} stroke={C.parchDark} strokeWidth={3} fill="none" />
        ))}
        {/* 大陸 */}
        {HM_B_LANDS.map((pts, i) => (
          <polygon key={i} points={HmBPoly(pts)} fill={C.land} stroke={C.landDark} strokeWidth={4.5} strokeLinejoin="round" />
        ))}
        {HM_B_LANDS.map((pts, i) => (
          <polygon key={`o${i}`} points={HmBPoly(pts)} fill="none" stroke={KRP.ink} strokeWidth={2} opacity={0.6} strokeLinejoin="round" />
        ))}
        {/* 羅針図 (太平洋) と小さな帆船 */}
        <g transform="translate(330 560)">
          <circle r={62} fill="none" stroke={C.landDark} strokeWidth={4} />
          <polygon points="0,-80 12,-12 0,0 -12,-12" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <polygon points="0,80 12,12 0,0 -12,12" fill={C.landDark} stroke={KRP.ink} strokeWidth={3} />
          <polygon points="-80,0 -12,-12 0,0 -12,12" fill={C.landDark} stroke={KRP.ink} strokeWidth={3} />
          <polygon points="80,0 12,-12 0,0 12,12" fill={C.landDark} stroke={KRP.ink} strokeWidth={3} />
          <text x={0} y={-90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>N</text>
        </g>
        <g transform={`translate(${700 + Math.sin(f / 9) * 4} 620)`}>
          <path d="M -40 0 L 40 0 L 28 18 L -28 18 Z" fill={C.post} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={0} x2={0} y2={-60} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 4 -56 Q 34 -34 4 -10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 「7日」の輪っか (7つの玉の首飾り) */}
        <circle cx={ringC[0]} cy={ringC[1]} r={R} fill="none" stroke={C.post} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => {
          const a = -0.7 + (i * Math.PI * 2) / 7;
          if (i === 0 && roll > 0) return null;
          const wob = i === 0 ? Math.sin(f * 1.5) * 3 * seg(f, 0, 6) : 0;
          return (
            <g key={i} transform={`translate(${ringC[0] + Math.cos(a) * R + wob} ${ringC[1] + Math.sin(a) * R})`}>
              <circle r={22} fill={HP.hi} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={-7} cy={-7} r={6} fill={KRP.white} opacity={0.6} />
            </g>
          );
        })}
        {/* 転がる玉 */}
        {roll > 0 && (
          <g transform={`translate(${bx} ${by}) rotate(${roll * 900})`}>
            <ellipse cx={4} cy={24} rx={18} ry={5} fill={KRP.ink} opacity={0.25} />
            <circle r={22} fill={HP.hi} stroke={KRP.ink} strokeWidth={5} />
            <line x1={-14} y1={0} x2={14} y2={0} stroke={HP.hiDark} strokeWidth={4} />
          </g>
        )}
        {roll > 0 && roll < 1 && [1, 2, 3].map((k) => (
          <circle key={k} cx={bx - k * 22} cy={by + k * 10} r={5 - k} fill={KRP.ink} opacity={0.3} />
        ))}
        {/* 赤い旗 */}
        {flagT > 0 && (
          <g transform={`translate(${flag[0] + 26} ${flag[1]}) scale(${pop(flagT)})`}>
            <line x1={0} y1={0} x2={0} y2={-110} stroke={KRP.ink} strokeWidth={6} />
            <path d={`M 0 -110 Q 40 ${-120 + Math.sin(f / 3) * 6} 80 -104 L 80 -62 Q 40 ${-76 + Math.sin(f / 3) * 6} 0 -66 Z`}
              fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={0} cy={0} rx={16} ry={5} fill={KRP.ink} opacity={0.4} />
          </g>
        )}
        {/* 地図の右上の端のめくれ */}
        <path d={`M 1720 50 L ${1720 - 120 - 40 * curl} 50 Q ${1680 - 30 * curl} ${120 + 30 * curl} 1720 ${170 + 40 * curl} Z`}
          fill={C.parchDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 机の小物: ろうそく・インク壺と羽ペン・コンパス */}
        <g transform="translate(100 330)">
          <ellipse cx={0} cy={110} rx={70} ry={20} fill={C.gold} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-22} y={0} width={44} height={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 0 -50 Q ${-16 + Math.sin(f / 2) * 3} -20 0 -2 Q ${16 + Math.sin(f / 2) * 3} -20 0 -50 Z`} fill={C.fire} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-20} r={60 + 4 * Math.sin(f / 3)} fill={C.lampCore} opacity={0.25} />
        </g>
        <g transform="translate(1830 540)">
          <rect x={-40} y={-50} width={80} height={80} rx={14} fill="#3E4452" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 0 -50 Q 40 -200 120 -330 Q 50 -210 10 -50 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g transform="translate(1600 920) rotate(-20)">
          <line x1={0} y1={-150} x2={-60} y2={0} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={-150} x2={-60} y2={0} stroke={KRP.silver} strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={-150} x2={60} y2={0} stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={-150} x2={60} y2={0} stroke={KRP.silver} strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={-150} r={14} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <TagPlate x={ringC[0]} y={ringC[1] + 150} text="7日" size={42} t={seg(f, 0, 6)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #32 1929年の、ソ連です。
// 格: 山 / seed 5032
// 絵: どこ: 1929年のソ連の工業都市。大きな煙突の工場・レンガの建物・ポスター (星のマークのみ・字なし)。年代札「1929年」、地名札「ソ連」。演出: 工場の大時計が動き、門から作業服の人が出入りする。カメラは街全体から工場の門へ。動き: 煙突の煙 / 大時計の針 / 人の出入り / 赤い旗 (星のマーク) がはためく
// どこ: 1929年のソ連の工業都市。灰色の空、奥にれんがの建物の列、真ん中にのこぎり屋根の大工場と時計塔、4本の大煙突、
//       壁には星のマークだけのポスター。手前は石畳と路面電車の線路
// 演出: 時計塔の上で星の赤い旗がはためき、大時計の針がぐるぐる進む。門から作業服の人が入っていき、別の人が出てくる。
//       カメラは街全体から工場の門へ寄っていく
// 動き: 煙突の煙 / 大時計の針 / 人の出入り / 旗がはためく / カメラの寄り
const HmBStarFlag: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const w1 = Math.sin(f / 3) * 10, w2 = Math.sin(f / 3 + 1.5) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M 0 0 Q 60 ${-10 + w1} 120 ${w2 * 0.6} Q 180 ${10 - w1} 220 ${w2} L 220 ${120 + w2} Q 180 ${130 - w1} 120 ${120 + w2 * 0.6} Q 60 ${110 + w1} 0 120 Z`}
        fill={C.sovRed} stroke={KRP.ink} strokeWidth={6} />
      {/* 星は小さく・縁取りなし (大きな星だと別の国の旗に見えるため 2026-11-25 親が修正) */}
      <polygon points="40,22 46,40 64,40 50,51 55,68 40,58 25,68 30,51 16,40 34,40" fill={C.star}
        transform={`translate(20 ${14 + w1 * 0.2}) scale(0.5)`} />
    </g>
  );
};
const HmBStar: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <polygon fill={C.star} stroke={KRP.ink} strokeWidth={4}
    points={Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.42 : r;
      return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
    }).join(" ")} />
);
const Hm032: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const cam = lerp(1, 1.12, k);
  const fx = 960, fy = lerp(540, 560, k);
  const walkers = [
    { x0: 300, v: 11, band: undefined, out: false }, { x0: 1640, v: -12, band: undefined, out: false },
    { x0: 960, v: -9, band: undefined, out: true }, { x0: 980, v: 10, band: undefined, out: true },
    { x0: 520, v: 8, band: undefined, out: false },
  ];
  return (
    <Frame f={f} seed={5032}>
      <g transform={`translate(960 540) scale(${cam}) translate(${-fx} ${-fy})`}>
        <rect x={-60} y={-60} width={2040} height={700} fill={C.greySky} />
        <HmBCloud x={300} y={150} s={0.7} color={C.cloudShade} />
        {/* 奥の建物の列 */}
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <rect x={-40 + i * 180} y={300 - (i % 3) * 40} width={170} height={360} fill={i % 2 ? C.concrete : C.brickDark} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
            {Array.from({ length: 6 }, (_, w) => (
              <rect key={w} x={-20 + i * 180 + (w % 3) * 50} y={330 - (i % 3) * 40 + Math.floor(w / 3) * 60} width={30} height={36} fill={C.nightWin} stroke={KRP.ink} strokeWidth={2} opacity={0.7} />
            ))}
          </g>
        ))}
        {/* 煙突と煙 */}
        {[460, 1300, 1420, 1540].map((cx, i) => (
          <g key={cx}>
            {[0, 1, 2, 3].map((j) => {
              const p = ((f * 0.9 + j * 11 + i * 5) % 44) / 44;
              return <circle key={j} cx={cx + p * 160 + Math.sin(p * 5 + i) * 14} cy={130 - i * 10 - p * 130} r={20 + p * 46}
                fill={C.smoke} stroke={KRP.ink} strokeWidth={3} opacity={(1 - p) * 0.75} />;
            })}
            <rect x={cx - 28} y={130 - i * 10} width={56} height={300} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2].map((b) => <rect key={b} x={cx - 32} y={160 - i * 10 + b * 80} width={64} height={12} fill={C.brickDark} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
        ))}
        {/* 大工場 (のこぎり屋根) */}
        <rect x={340} y={420} width={1240} height={400} fill={C.brick} stroke={KRP.ink} strokeWidth={8} />
        <path d={`M 340 420 ${Array.from({ length: 10 }, (_, i) => `L ${340 + i * 124} 340 L ${340 + (i + 1) * 124} 420`).join(" ")}`}
          fill={C.concreteDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={340 + i * 124} y1={340} x2={340 + i * 124} y2={420} stroke={KRP.ink} strokeWidth={5} />)}
        {Array.from({ length: 6 }, (_, r) => (
          <line key={r} x1={340} y1={470 + r * 56} x2={1580} y2={470 + r * 56} stroke={C.brickDark} strokeWidth={3} />
        ))}
        {/* 大きな窓 */}
        {[420, 560, 1260, 1400].map((wx) => (
          <g key={wx}>
            <rect x={wx} y={460} width={110} height={150} fill={C.nightWin} stroke={KRP.ink} strokeWidth={5} />
            <line x1={wx + 55} y1={460} x2={wx + 55} y2={610} stroke={KRP.ink} strokeWidth={3} />
            <line x1={wx} y1={535} x2={wx + 110} y2={535} stroke={KRP.ink} strokeWidth={3} />
            <rect x={wx} y={460} width={110} height={150} fill={HP.spark} opacity={0.15 + 0.1 * Math.sin(f / 4 + wx)} />
          </g>
        ))}
        {/* 星のポスター (字なし) */}
        {[[620, 660], [1300, 660]].map(([px, py], i) => (
          <g key={i} transform={`rotate(${i ? 2 : -2} ${px} ${py})`}>
            <rect x={px - 70} y={py - 90} width={140} height={180} fill={C.sovRed} stroke={KRP.ink} strokeWidth={5} />
            <HmBStar x={px} y={py - 20} r={44} />
            <rect x={px - 50} y={py + 44} width={100} height={14} fill={C.star} stroke={KRP.ink} strokeWidth={3} />
            <rect x={px - 36} y={py + 64} width={72} height={10} fill={C.star} opacity={0.8} />
          </g>
        ))}
        {/* 時計塔と大時計 */}
        <rect x={860} y={200} width={200} height={240} fill={C.concrete} stroke={KRP.ink} strokeWidth={7} />
        <path d="M 840 210 L 960 150 L 1080 210 Z" fill={C.concreteDark} stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(960 310)">
          <circle r={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <line key={i} x1={Math.sin(a) * 58} y1={-Math.cos(a) * 58} x2={Math.sin(a) * 68} y2={-Math.cos(a) * 68} stroke={KRP.ink} strokeWidth={i % 3 ? 3 : 6} />;
          })}
          <line x1={0} y1={0} x2={0} y2={-58} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 8})`} />
          <line x1={0} y1={0} x2={0} y2={-38} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" transform={`rotate(${200 + f * 0.67})`} />
          <circle r={8} fill={C.sovRed} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 旗 */}
        <line x1={960} y1={150} x2={960} y2={30} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={960} cy={26} r={9} fill={C.star} stroke={KRP.ink} strokeWidth={3} />
        <HmBStarFlag x={964} y={36} s={0.55} f={f} />
        {/* 屋根の上のもう1本の旗 */}
        <line x1={1200} y1={420} x2={1200} y2={250} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={1200} cy={246} r={8} fill={C.star} stroke={KRP.ink} strokeWidth={3} />
        <HmBStarFlag x={1203} y={256} s={0.5} f={f + 7} />
        <line x1={720} y1={420} x2={720} y2={250} stroke={KRP.ink} strokeWidth={7} />
        <circle cx={720} cy={246} r={8} fill={C.star} stroke={KRP.ink} strokeWidth={3} />
        <HmBStarFlag x={723} y={256} s={0.5} f={f + 3} />
        {/* 門 (開いている鉄の門) */}
        <rect x={780} y={560} width={360} height={260} fill="#3A3530" stroke={KRP.ink} strokeWidth={6} />
        <rect x={760} y={530} width={400} height={40} fill={C.concreteDark} stroke={KRP.ink} strokeWidth={6} />
        <HmBStar x={960} y={550} r={26} />
        {[[700, 780], [1140, 1220]].map(([g0, g1], i) => (
          <g key={i}>
            <rect x={g0} y={580} width={g1 - g0} height={240} fill="none" stroke={C.steelDark} strokeWidth={6} />
            {Array.from({ length: 5 }, (_, b) => <line key={b} x1={g0 + 8 + b * 16} y1={580} x2={g0 + 8 + b * 16} y2={820} stroke={C.steelDark} strokeWidth={5} />)}
          </g>
        ))}
        {/* 道 */}
        <rect x={-60} y={820} width={2040} height={340} fill={C.stoneRoad} />
        <line x1={-60} y1={820} x2={1980} y2={820} stroke={KRP.ink} strokeWidth={6} />
        {[900, 960].map((ly) => <line key={ly} x1={-60} y1={ly} x2={1980} y2={ly} stroke={C.steelDark} strokeWidth={6} />)}
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 70} y={884} width={10} height={92} fill={C.stoneLine} opacity={0.5} />)}
        {/* 出入りする人 */}
        {walkers.map((w, i) => {
          const x = w.x0 + w.v * f;
          const nearGate = Math.abs(x - 960) < 150;
          const op = w.out ? clamp01(Math.abs(x - 960) / 60) : nearGate ? clamp01((Math.abs(x - 960) - 40) / 110) : 1;
          return (
            <g key={i} opacity={op}>
              <HmBWorker x={x} y={845 + (i % 3) * 22} s={0.55 + (i % 3) * 0.04} f={f} face={i % 2 ? "normal" : "smile"} phase={i} gaze={[w.v > 0 ? 6 : -6, 0]} />
            </g>
          );
        })}
        {/* 道ばたの街灯 */}
        {[200, 1720].map((lx) => (
          <g key={lx}>
            <rect x={lx - 8} y={560} width={16} height={280} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 30} 560 L ${lx + 30} 560 L ${lx + 18} 520 L ${lx - 18} 520 Z`} fill={C.cap} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
      <TagPlate x={540} y={80} text="1929年" size={44} t={seg(f, 2, 10)} />
      <TagPlate x={1680} y={80} text="ソ連" size={44} t={seg(f, 5, 13)} color={C.sovRed} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #33 工場を1日も止めないように、国民を組に分けて、交代で休ませました。週は5日、のちに6日。
// 格: 山 / seed 5033
// 絵: どこ: 工場の壁に貼られた大きな「交代表」(5列×5行のマス目)。演出: 労働者が5色の組 (色の腕章: 赤・黄・緑・青・紫) に分けられ、マス目の中で**1日ずつずれて**休みの日 (ベッドのマーク) が斜めに並ぶ。表の右上の「5日」の札が f30 前後で「6日」にぱたっと変わる (列が1本増える)。動き: 休みのマークが斜めに順に点灯 / 札が「5日→6日」/ 表の前で監督が指さし棒
// どこ: 工場の中の壁 (コンクリートと配管・リベット)。そこに貼られた木枠の大きな「交代表」
// 演出: 縦に5つの組 (赤・黄・緑・青・紫の腕章と小さな人)、横に日付の列。休みの日のベッドのマークが1日ずつずれて斜めに点灯。
//       f30前後で右上の「5日」の札がぱたっと裏返って「6日」になり、列が1本増える。右で監督が指さし棒で得意げに指す
// 動き: ベッドが斜めに順に点灯 (f6〜26) / 札が裏返る (f28〜34) / 列が増える / 指さし棒が点灯したマスを追う / 配管の湯気
const HmBBed: React.FC<{ x: number; y: number; s?: number; c: string; t?: number }> = ({ x, y, s = 1, c, t = 1 }) => {
  const sc = pop(clamp01(t));
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * sc})`}>
      <rect x={-48} y={-34} width={12} height={58} rx={4} fill={C.post} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-40} y={0} width={88} height={18} rx={4} fill={C.post} stroke={KRP.ink} strokeWidth={4} />
      <rect x={42} y={-10} width={10} height={34} rx={4} fill={C.post} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-34} y={-16} width={26} height={16} rx={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
      <path d="M -10 -14 Q 20 -22 44 -10 L 44 2 L -10 2 Z" fill={c} stroke={KRP.ink} strokeWidth={3.5} />
      <text x={22} y={-26} fontFamily={FONT} fontWeight={900} fontSize={20} fill={C.robeIndigo}>z</text>
    </g>
  );
};
const Hm033: React.FC<{ f: number }> = ({ f }) => {
  const six = easeInOut(seg(f, 30, 36));
  const nCols = lerp(5, 6, six);
  const gx0 = 440, gx1 = 1440, gy0 = 270, rh = 100;
  const cw = (gx1 - gx0) / nCols;
  const flip = seg(f, 28, 34);
  const flipS = Math.abs(Math.cos(flip * Math.PI));
  const label = flip < 0.5 ? "5日" : "6日";
  const cur = Math.min(4, Math.floor(seg(f, 6, 26) * 5));
  const tipX = gx0 + cw * (cur + 0.5), tipY = gy0 + rh * (cur + 0.5);
  const hx = 1690 - 153 * 0.95, hy = 900 - 148 * 0.95;
  return (
    <Frame f={f} seed={5033}>
      <g transform={`translate(960 540) scale(${1.04 - 0.04 * easeOut(seg(f, 0, 40))}) translate(-960 -540)`}>
        {/* 工場の壁 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.concrete} />
        {Array.from({ length: 6 }, (_, r) => (
          <line key={r} x1={-60} y1={120 + r * 180} x2={1980} y2={120 + r * 180} stroke={C.concreteDark} strokeWidth={4} />
        ))}
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={40 + (i % 15) * 130} cy={i < 15 ? 110 : 840} r={6} fill={C.concreteDark} stroke={KRP.ink} strokeWidth={2} />
        ))}
        {/* 配管と湯気 */}
        <rect x={-60} y={40} width={2040} height={30} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1560} y={40} width={30} height={500} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        {[400, 900, 1400].map((px) => <rect key={px} x={px} y={32} width={24} height={46} rx={4} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />)}
        <circle cx={1575} cy={300} r={26} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1].map((j) => {
          const p = ((f + j * 12) % 24) / 24;
          return <circle key={j} cx={1620 + p * 40} cy={200 - p * 80} r={14 + p * 20} fill={KRP.white} opacity={(1 - p) * 0.6} />;
        })}
        <rect x={1590} y={190} width={30} height={20} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 交代表 (木の枠) */}
        <rect x={196} y={146} width={1284} height={660} rx={10} fill={KRP.ink} opacity={0.25} transform="translate(14 14)" />
        <rect x={196} y={146} width={1284} height={660} rx={10} fill={C.post} stroke={KRP.ink} strokeWidth={8} />
        <rect x={220} y={170} width={1236} height={612} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {[[240, 190], [1436, 190], [240, 762], [1436, 762]].map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 見出しの日付 */}
        {Array.from({ length: 6 }, (_, c) => {
          const op = c < 5 ? 1 : six;
          return op > 0 ? (
            <g key={c} opacity={op}>
              <rect x={gx0 + c * cw + 6} y={200} width={cw - 12} height={60} rx={8} fill={c === 5 ? HP.restSoft : KRP.cream} stroke={KRP.ink} strokeWidth={4} />
              <text x={gx0 + c * cw + cw / 2} y={244} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.ink}>{c + 1}</text>
            </g>
          ) : null;
        })}
        {/* 組の行 */}
        {BANDS.map((bc, r) => (
          <g key={r}>
            <rect x={236} y={gy0 + r * rh + 6} width={196} height={rh - 12} rx={10} fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
            <rect x={252} y={gy0 + r * rh + 34} width={58} height={34} rx={6} fill={bc} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1].map((m) => (
              <PersonMini key={m} x={354 + m * 44} y={gy0 + r * rh + 92} s={0.32} color={bc} f={f} phase={r + m} />
            ))}
            {Array.from({ length: 6 }, (_, c) => {
              const op = c < 5 ? 1 : six;
              return op > 0 ? (
                <rect key={c} x={gx0 + c * cw + 6} y={gy0 + r * rh + 6} width={cw - 12} height={rh - 12} rx={8}
                  fill={c === r && seg(f, 6 + r * 4, 10 + r * 4) > 0 ? HP.restSoft : KRP.white} stroke={KRP.gray} strokeWidth={3} opacity={op}
                  strokeDasharray={c === 5 ? "8 6" : undefined} />
              ) : null;
            })}
            {/* 働く日の小さな歯車 */}
            {Array.from({ length: 5 }, (_, c) => c !== r ? (
              <g key={`g${c}`} transform={`translate(${gx0 + c * cw + cw / 2} ${gy0 + r * rh + rh / 2}) rotate(${f * 4 + c * 20})`} opacity={0.45}>
                <circle r={16} fill="none" stroke={KRP.grayDark} strokeWidth={8} strokeDasharray="6 5" />
                <circle r={6} fill={KRP.grayDark} />
              </g>
            ) : null)}
            <HmBBed x={gx0 + r * cw + cw / 2} y={gy0 + r * rh + rh / 2 + 6} s={0.95} c={bc} t={seg(f, 6 + r * 4, 10 + r * 4)} />
          </g>
        ))}
        {/* 右上の札「5日→6日」 */}
        <g transform={`translate(0 110) scale(1 ${Math.max(flipS, 0.04)}) translate(0 -110)`}>
          <TagPlate x={1330} y={110} text={label} size={46} fill={flip < 0.5 ? KRP.white : HP.restSoft} color={flip < 0.5 ? KRP.ink : C.sovRed} />
        </g>
        {flip > 0.5 && flip < 1 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
            <line x1={1440} y1={80} x2={1470} y2={60} /><line x1={1446} y1={120} x2={1480} y2={124} />
          </g>
        )}
        {/* 監督と指さし棒 */}
        <line x1={hx} y1={hy} x2={tipX} y2={tipY} stroke={KRP.ink} strokeWidth={12} strokeLinecap="round" />
        <line x1={hx} y1={hy} x2={tipX} y2={tipY} stroke={C.post} strokeWidth={6} strokeLinecap="round" />
        <circle cx={tipX} cy={tipY} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <HmBWorker x={1690} y={900} s={0.95} f={f} cloth={C.cap} clothDark="#3E464E" face="smile" pose="point" pointDir={-1} gaze={[-8, -4]} phase={2} />
        {/* 監督の口ひげ */}
        <path d="M 1668 710 q 22 -10 44 0 q -22 8 -44 0 Z" fill={KRP.ink} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #34 工場は、毎日元気に動きます。
// 格: 山 / seed 5034
// 絵: どこ: ソ連の工場の中 (機械・ベルト・歯車・天井クレーン)。演出: 機械がフル稼働。働く人の腕章の色が日替わりで入れ替わっていく (組が交代しているのが分かる)。機械は止まらず、歯車がぐるぐる。壁のカレンダーがぱらぱらめくれる (曜日の見出しは書かない・数字だけ)。動き: 歯車 / ベルトの流れ / カレンダーがめくれる / 腕章の色が交代
// どこ: ソ連の工場の中。高窓から光の筋、天井にクレーンのレール、左に大小の歯車、真ん中に上下するプレス機、手前に流れるベルトコンベア
// 演出: 機械はフル稼働で一度も止まらない。ベルトの前の3人の腕章の色が、10コマごとにぽんと入れ替わる (組の交代)。
//       右の壁の日めくりカレンダーが数字だけぱらぱらめくれていく。クレーンが木箱を運ぶ
// 動き: 歯車 / ベルトと箱 / プレスの上下と火花 / クレーン / 日めくり / 腕章の交代
const HmBGear: React.FC<{ x: number; y: number; r: number; teeth: number; rot: number; fill: string }> = ({ x, y, r, teeth, rot, fill }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: teeth }, (_, i) => (
      <rect key={i} x={-r * 0.13} y={-r - r * 0.18} width={r * 0.26} height={r * 0.3} rx={4} fill={fill} stroke={KRP.ink} strokeWidth={5}
        transform={`rotate(${(i * 360) / teeth})`} />
    ))}
    <circle r={r} fill={fill} stroke={KRP.ink} strokeWidth={7} />
    <circle r={r * 0.62} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <circle key={k} cx={Math.cos((k * Math.PI) / 3) * r * 0.42} cy={Math.sin((k * Math.PI) / 3) * r * 0.42} r={r * 0.1} fill={KRP.ink} opacity={0.6} />
    ))}
    <circle r={r * 0.18} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
  </g>
);
const Hm034: React.FC<{ f: number }> = ({ f }) => {
  const day = Math.floor(f / 10);
  const dayP = (f % 10) / 10;
  const page = Math.floor(f / 8);
  const pageP = (f % 8) / 8;
  const press = Math.abs(Math.sin(f / 4));
  const craneX = 700 + Math.sin(f / 16) * 380;
  const cam = 1 + 0.06 * easeOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5034}>
      <g transform={`translate(960 520) scale(${cam}) translate(-960 -520)`}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.factoryWall} />
        {/* 高窓と光 */}
        {[260, 760, 1260].map((wx) => (
          <g key={wx}>
            <rect x={wx} y={150} width={240} height={150} fill={C.nightWin} stroke={KRP.ink} strokeWidth={6} />
            {[1, 2, 3].map((k) => <line key={k} x1={wx + k * 60} y1={150} x2={wx + k * 60} y2={300} stroke={KRP.ink} strokeWidth={3} />)}
            <line x1={wx} y1={225} x2={wx + 240} y2={225} stroke={KRP.ink} strokeWidth={3} />
            <polygon points={`${wx},300 ${wx + 240},300 ${wx + 420},900 ${wx + 120},900`} fill={KRP.white} opacity={0.1 + 0.03 * Math.sin(f / 7)} />
          </g>
        ))}
        {/* 天井クレーン */}
        <rect x={-60} y={90} width={2040} height={30} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={i * 110} y1={90} x2={i * 110 + 30} y2={120} stroke={KRP.ink} strokeWidth={4} />)}
        <g transform={`translate(${craneX} 0)`}>
          <rect x={-60} y={110} width={120} height={50} rx={6} fill={C.sovRed} stroke={KRP.ink} strokeWidth={5} />
          <line x1={0} y1={160} x2={0} y2={330 + Math.sin(f / 6) * 10} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M -10 ${330 + Math.sin(f / 6) * 10} q 0 24 18 20`} stroke={KRP.ink} strokeWidth={6} fill="none" />
          <g transform={`translate(0 ${350 + Math.sin(f / 6) * 10}) rotate(${Math.sin(f / 8) * 4})`}>
            <rect x={-70} y={0} width={140} height={90} fill={C.mud} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -70 0 L 70 90 M 70 0 L -70 90" stroke={C.mudDark} strokeWidth={5} />
          </g>
        </g>
        {/* 歯車 (左) */}
        <HmBGear x={230} y={480} r={170} teeth={14} rot={f * 3} fill={C.steel} />
        <HmBGear x={455} y={300} r={100} teeth={9} rot={-f * 3 * (170 / 100) + 10} fill={KRP.brass} />
        <HmBGear x={420} y={640} r={70} teeth={7} rot={-f * 3 * (170 / 70) + 5} fill={C.steelDark} />
        {/* プレス機 (真ん中) */}
        <g>
          <rect x={760} y={330} width={420} height={60} fill={C.workDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={780} y={390} width={50} height={380} fill={C.work} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1110} y={390} width={50} height={380} fill={C.work} stroke={KRP.ink} strokeWidth={6} />
          <rect x={940} y={390} width={60} height={30 + press * 110} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <rect x={880} y={420 + press * 110} width={180} height={40} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={850} y={600} width={240} height={40} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
          {/* 圧力計 */}
          {[820, 1120].map((gx, i) => (
            <g key={gx} transform={`translate(${gx} 360)`}>
              <circle r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <line x1={0} y1={0} x2={0} y2={-16} stroke={KRP.red} strokeWidth={4} transform={`rotate(${-40 + press * 80 + i * 20})`} />
            </g>
          ))}
          {press > 0.9 && [0, 1, 2, 3, 4].map((k) => {
            const a = (k * 36 + 200) * Math.PI / 180;
            return <line key={k} x1={970 + Math.cos(a) * 60} y1={590 + Math.sin(a) * 20} x2={970 + Math.cos(a) * 110} y2={590 + Math.sin(a) * 50}
              stroke={HP.spark} strokeWidth={6} strokeLinecap="round" />;
          })}
        </g>
        {/* 日めくりカレンダー (数字だけ) */}
        <g transform="translate(1620 420)">
          <rect x={-130} y={-170} width={260} height={300} rx={10} fill={C.post} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-110} y={-140} width={220} height={250} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-110} y={-140} width={220} height={50} fill={C.sovRed} stroke={KRP.ink} strokeWidth={4} />
          <HmBStar x={0} y={-115} r={18} />
          <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill={KRP.ink}>{page + 2}</text>
          {/* めくれて飛んでいく1枚 */}
          <g transform={`translate(${pageP * 340} ${-90 - pageP * 220}) rotate(${pageP * 70}) scale(${1 - pageP * 0.5})`} opacity={(1 - pageP) * (1 - pageP)}>
            <rect x={-110} y={0} width={220} height={200} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <text x={0} y={150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill={KRP.ink}>{page + 1}</text>
          </g>
        </g>
        {/* 床 */}
        <rect x={-60} y={840} width={2040} height={300} fill={C.concreteDark} opacity={0.6} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
          <rect key={k} x={k * 240 - 20} y={960} width={120} height={22} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} transform={`skewX(-30)`} opacity={0.7} />
        ))}
        {/* ベルトの前で働く3人 (腕章が日替わりで交代) */}
        {[540, 1380, 1700].map((wx, i) => {
          const band = BANDS[(i + day) % 5];
          const puff = dayP < 0.3 && f >= 10 ? 1 - dayP / 0.3 : 0;
          return (
            <g key={wx}>
              <HmBWorker x={wx} y={800} s={0.85} f={f} band={band} pose="hold" face={i === 1 ? "joy" : "smile"} phase={i * 2} gaze={[0, 4]} />
              {puff > 0 && (
                <g opacity={puff}>
                  {[0, 1, 2, 3].map((k) => (
                    <circle key={k} cx={wx - 30 + Math.cos(k * 1.6) * 40 * (1.2 - puff)} cy={800 - 146 * 0.85 + Math.sin(k * 1.6) * 30 * (1.2 - puff)} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                  ))}
                </g>
              )}
            </g>
          );
        })}
        {/* ベルトコンベア */}
        <rect x={-60} y={768} width={2040} height={70} rx={30} fill={C.workDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={760} width={2040} height={18} fill="#3E464E" stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 22 }, (_, i) => (
          <g key={i} transform={`translate(${-40 + i * 96} 804) rotate(${f * 12})`}>
            <circle r={22} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
            <line x1={-16} y1={0} x2={16} y2={0} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {Array.from({ length: 8 }, (_, i) => {
          const bx = ((i * 270 + f * 9) % 2160) - 120;
          return (
            <g key={i} transform={`translate(${bx} 760)`}>
              {i % 2 ? (
                <HmBGear x={0} y={-30} r={26} teeth={7} rot={0} fill={KRP.brass} />
              ) : (
                <g>
                  <rect x={-36} y={-60} width={72} height={60} fill={C.mud} stroke={KRP.ink} strokeWidth={4} />
                  <line x1={-36} y1={-30} x2={36} y2={-30} stroke={C.mudDark} strokeWidth={4} />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #35 ただ、お父さんとお母さんの休みが、合いません。
// 格: 山 / seed 5035
// 絵: どこ: ソ連の集合住宅の一室 (家族の部屋・テーブル・窓)。演出: 画面を左右に割る。左は「お父さんの休みの日」(お父さんが家でくつろいでいるが、お母さんは作業服で出かけていく)、右は「お母さんの休みの日」(逆)。2人がドアですれちがう (互いに手を振る・face="sad")。腕章の色がちがう (赤と緑)。動き: すれちがう / ドアが閉まる / 手を振る
// どこ: ソ連の集合住宅の一室 (しま模様の壁紙・雪の窓・テーブルとやかん・壁の日めくり)。画面を左右に割り、左右は鏡写しの同じ部屋
// 演出: 左は「父の休み」: 父がテーブルでくつろぎ、母は作業服 (緑の腕章) で出ていく。右は「母の休み」: その逆で、父 (赤の腕章) が出ていく。
//       出ていく2人は真ん中の仕切りのそばのドアで背中合わせにすれちがい、残る人と互いに手を振る。みんなしょんぼり顔
// 動き: 出ていく人がドアへ歩く (f0〜22) / 手を振る / ドアが閉まりかける (f28〜42) / やかんの湯気 / 窓の雪
const HmBApt: React.FC<{ f: number; restBand: string }> = ({ f, restBand }) => (
  <g>
    {/* 壁紙 */}
    <rect x={-40} y={-40} width={1000} height={760} fill={C.wallpaper} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 84} y={-40} width={22} height={760} fill={C.wallpaperLine} opacity={0.6} />)}
    <rect x={-40} y={600} width={1000} height={110} fill={C.robeBrown} opacity={0.35} />
    <rect x={-40} y={590} width={1000} height={14} fill={C.post} stroke={KRP.ink} strokeWidth={4} />
    {/* 窓 (雪の町) */}
    <rect x={100} y={150} width={270} height={250} fill={C.nightWin} stroke={KRP.ink} strokeWidth={7} />
    {[[120, 300, 60, 100], [190, 260, 70, 140], [270, 290, 80, 110]].map(([bx, by, bw, bh], i) => (
      <rect key={i} x={bx} y={by} width={bw} height={bh} fill={C.concreteDark} stroke={KRP.ink} strokeWidth={3} />
    ))}
    {Array.from({ length: 10 }, (_, i) => (
      <circle key={i} cx={110 + ((i * 53 + f * 1.2) % 250)} cy={160 + ((i * 37 + f * 3) % 230)} r={4} fill={C.snow} />
    ))}
    <line x1={235} y1={150} x2={235} y2={400} stroke={KRP.ink} strokeWidth={6} />
    <line x1={100} y1={270} x2={370} y2={270} stroke={KRP.ink} strokeWidth={5} />
    <rect x={84} y={398} width={302} height={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 80 140 Q 100 280 90 420 L 60 420 L 60 140 Z M 390 140 Q 370 280 380 420 L 410 420 L 410 140 Z" fill={C.scarf} stroke={KRP.ink} strokeWidth={5} />
    {/* 壁の日めくり (その人の休みの日 = ベッドの印) */}
    <g transform="translate(520 220)">
      <rect x={-70} y={-80} width={140} height={160} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-70} y={-80} width={140} height={34} fill={C.sovRed} stroke={KRP.ink} strokeWidth={4} />
      <HmBBed x={0} y={22} s={0.9} c={restBand} />
    </g>
    {/* 床 */}
    <rect x={-40} y={700} width={1000} height={420} fill="#9A7A58" />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-40} y1={730 + i * 50} x2={960} y2={730 + i * 50} stroke="#7E6244" strokeWidth={4} />)}
    <ellipse cx={360} cy={900} rx={300} ry={60} fill={C.sovRed} opacity={0.45} />
    {/* ドア枠と外の廊下 */}
    <rect x={700} y={250} width={210} height={460} fill="#4A4038" stroke={KRP.ink} strokeWidth={7} />
    <rect x={712} y={262} width={186} height={448} fill={C.concrete} />
    <rect x={712} y={560} width={186} height={150} fill={C.concreteDark} />
  </g>
);
// 手を振る腕 (Person の肩から生やす。rot は肩まわりの回転、180 でまっすぐ上)
const HmBWaveArm: React.FC<{ x: number; y: number; s: number; side: -1 | 1; rot: number; cloth: string }> = ({ x, y, s, side, rot, cloth }) => {
  const r = (rot * Math.PI) / 180;
  const ex = side * 67 - Math.sin(r) * 86, ey = -148 + Math.cos(r) * 86;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={side * 67 - 11} y={-148} width={22} height={86} rx={11} fill={cloth} stroke={KRP.ink} strokeWidth={4.5}
        transform={`rotate(${rot} ${side * 67} -148)`} />
      <circle cx={ex} cy={ey} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
      <path d={`M ${ex - 26 * side} ${ey - 20} q ${-10 * side} 16 0 34 M ${ex + 22 * side} ${ey - 24} q ${12 * side} 16 0 36`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.6} />
    </g>
  );
};
const HmBAptFront: React.FC<{ f: number; close: number }> = ({ f, close }) => (
  <g>
    {/* ドアの扉 (右の蝶番から、閉まりかける) */}
    <path d={`M 906 256 L ${906 - lerp(24, 50, close)} ${270 - 10 * close} L ${906 - lerp(24, 50, close)} ${700 + 10 * close} L 906 706 Z`}
      fill={C.robeBrown} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={906 - lerp(24, 50, close) + 14} cy={480} r={8} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
    {/* テーブル・やかん・カップ・パン */}
    <rect x={150} y={620} width={360} height={26} rx={6} fill={C.post} stroke={KRP.ink} strokeWidth={6} />
    <rect x={150} y={600} width={360} height={30} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    {[180, 480].map((lx) => <rect key={lx} x={lx - 10} y={646} width={20} height={170} fill={C.post} stroke={KRP.ink} strokeWidth={5} />)}
    <g transform="translate(200 600)">
      <path d="M -40 0 L -34 -70 Q 0 -86 34 -70 L 40 0 Z" fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={0} cy={-84} r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 34 -50 q 26 -6 30 -30" stroke={KRP.ink} strokeWidth={6} fill="none" />
      {[0, 1].map((j) => {
        const p = ((f + j * 10) % 20) / 20;
        return <path key={j} d="M 64 -84 q 10 -14 0 -28" stroke={KRP.white} strokeWidth={5} fill="none" opacity={(1 - p) * 0.8} transform={`translate(${p * 10} ${-p * 40})`} />;
      })}
    </g>
    <rect x={450} y={570} width={36} height={32} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={400} cy={590} rx={34} ry={14} fill={C.bread} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
// #35 用: ひと目で分かるお父さん・お母さん。waveSide を渡すと、その側の元の腕を clip で消して手を振る腕に差しかえる (腕は必ず2本)
const HmBParent: React.FC<{
  id: string; x: number; y: number; s: number; f: number; who: "dad" | "mom"; pose: "stand" | "sit";
  waveSide?: -1 | 1; waveRot?: number; band?: string; bundle?: boolean;
  gaze?: [number, number]; phase?: number;
}> = ({ id, x, y, s, f, who, pose, waveSide, waveRot = 0, band, bundle, gaze = [0, 0], phase = 0 }) => {
  const dad = who === "dad";
  const cloth = dad ? C.work : C.homeMom;
  const clothDark = dad ? C.workDark : C.robeBrownDark;
  // 消す範囲 = 手を振る側の、肩から下の元の腕 (胴体の外側だけ)
  const top = y - 153 * s, bot = y - 54 * s;
  const keep = waveSide === undefined ? null : waveSide === -1
    ? [[x - 61 * s, -200, 3000, 3000], [-2000, -200, 6000, top + 200], [-2000, bot, 6000, 3000]]
    : [[-2000, -200, x + 61 * s + 2000, 3000], [-2000, -200, 6000, top + 200], [-2000, bot, 6000, 3000]];
  const sit = pose === "sit";
  return (
    <g>
      {keep && (
        <clipPath id={id}>
          {keep.map(([kx, ky, kw, kh], i) => <rect key={i} x={kx} y={ky} width={kw} height={kh} />)}
        </clipPath>
      )}
      <g clipPath={keep ? `url(#${id})` : undefined}>
        <Person x={x} y={y} s={s} f={f} face="sad" pose={pose} gaze={gaze} phase={phase}
          cloth={cloth} clothDark={clothDark} hair={dad ? "cap" : "none"} still />
      </g>
      {waveSide !== undefined && <HmBWaveArm x={x} y={y} s={s} side={waveSide} rot={waveRot} cloth={cloth} />}
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {dad ? (
          <g>
            {/* 作業服: 前立て・胸ポケット2つ・ベルト */}
            <line x1={0} y1={-158} x2={0} y2={-56} stroke={clothDark} strokeWidth={4} />
            {[-140, -112, -84].map((by) => <circle key={by} cx={-8} cy={by} r={4} fill={clothDark} />)}
            <rect x={-46} y={-144} width={28} height={24} rx={4} fill="none" stroke={clothDark} strokeWidth={4} />
            <rect x={-58} y={-66} width={116} height={13} rx={4} fill={C.robeBrownDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-8} y={-66} width={16} height={13} rx={2} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
            {/* 作業帽 */}
            <path d="M -64 -258 Q -60 -314 0 -316 Q 60 -314 64 -258 Z" fill={C.cap} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -66 -258 Q 10 -248 90 -256 Q 96 -244 86 -240 Q 0 -238 -66 -248 Z" fill="#3E464E" stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -30 -296 Q 0 -304 30 -296" stroke="#3E464E" strokeWidth={4} fill="none" />
            {/* 口ひげ (八の字) */}
            <path d="M 0 -199 Q -14 -210 -32 -197 Q -24 -190 -12 -192 Q -4 -193 0 -195 Q 4 -193 12 -192 Q 24 -190 32 -197 Q 14 -210 0 -199 Z"
              fill={KRP.ink} />
          </g>
        ) : (
          <g>
            {/* スカート (すそが広がる) */}
            {sit ? (
              <path d="M -60 -74 L 60 -74 L 78 -30 Q 0 -18 -78 -30 Z" fill={C.robeIndigo} stroke={KRP.ink} strokeWidth={5} />
            ) : (
              <path d="M -60 -74 L 60 -74 L 84 -16 Q 0 -4 -84 -16 Z" fill={C.robeIndigo} stroke={KRP.ink} strokeWidth={5} />
            )}
            <g stroke={C.robeIndigoDark} strokeWidth={4}>
              <line x1={-30} y1={-68} x2={-42} y2={sit ? -30 : -16} /><line x1={30} y1={-68} x2={42} y2={sit ? -30 : -16} />
            </g>
            {/* エプロン (胸当て+ひも+ポケット) */}
            <path d={`M -36 -128 L 36 -128 L 42 ${sit ? -40 : -26} Q 0 ${sit ? -34 : -20} -42 ${sit ? -40 : -26} Z`} fill={C.headCloth} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={-24} y={-154} width={48} height={28} rx={4} fill={C.headCloth} stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -22 -152 L -40 -164 M 22 -152 L 40 -164" stroke={KRP.ink} strokeWidth={4} />
            <rect x={-20} y={-100} width={40} height={26} rx={4} fill="none" stroke={C.scarf} strokeWidth={4} />
            <line x1={-58} y1={-126} x2={58} y2={-126} stroke={C.scarf} strokeWidth={4} opacity={0.7} />
            {/* 長い髪 (スカーフの下から肩へ流れる) */}
            {[-1, 1].map((sd) => (
              <g key={sd} transform={`scale(${sd} 1)`}>
                <path d="M -64 -262 Q -94 -206 -92 -140 Q -80 -126 -64 -136 Q -66 -156 -54 -170 Q -64 -198 -62 -238 Z"
                  fill={C.hairBrown} stroke={KRP.ink} strokeWidth={4.5} />
                <path d="M -76 -224 Q -82 -184 -78 -146" stroke={C.robeBrownDark} strokeWidth={3.5} fill="none" />
              </g>
            ))}
            {/* 前髪 */}
            <path d="M -58 -244 Q -46 -278 0 -280 Q 46 -278 58 -244 Q 40 -262 20 -260 Q 6 -268 -8 -262 Q -34 -264 -58 -244 Z" fill={C.hairBrown} stroke={KRP.ink} strokeWidth={4} />
            {/* 赤茶のスカーフ (頭巾)。後ろで結んで端が垂れる */}
            <path d="M -70 -246 Q -74 -312 0 -314 Q 74 -312 70 -246 Q 52 -272 0 -278 Q -52 -272 -70 -246 Z"
              fill={C.scarf} stroke={KRP.ink} strokeWidth={5} />
            <g stroke={C.sovRedDark} strokeWidth={4} fill="none" opacity={0.8}>
              <path d="M -50 -290 Q 0 -300 50 -290" />
            </g>
            {[0, 0].map((_, i) => <circle key={i} cx={-30 + i * 60} cy={-296} r={5} fill={C.headCloth} />)}
            <g transform={`rotate(${Math.sin((f + phase * 9) / 6) * 6} 66 -262)`}>
              <circle cx={66} cy={-262} r={11} fill={C.scarf} stroke={KRP.ink} strokeWidth={4} />
              <path d="M 70 -256 L 98 -222 L 82 -216 Z M 62 -254 L 74 -208 L 58 -210 Z" fill={C.scarf} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            </g>
          </g>
        )}
        {/* 腕章 (残した側の腕) */}
        {band && (
          <rect x={(waveSide === -1 ? 67 : -67) - 15} y={-140} width={30} height={18} rx={4} fill={band} stroke={KRP.ink} strokeWidth={3.5}
            transform={sit ? `rotate(${waveSide === -1 ? -22 : 22} ${waveSide === -1 ? 67 : -67} -148)` : undefined} />
        )}
        {/* 弁当の包み (残した側の手からぶら下げる) */}
        {bundle && (
          <g transform={`translate(${waveSide === -1 ? 67 : -67} -66) rotate(${Math.sin((f + phase * 7) / 4) * 5})`}>
            <path d="M -6 0 l -8 -12 M 6 0 l 8 -12" stroke={KRP.ink} strokeWidth={4} />
            <rect x={-28} y={2} width={56} height={40} rx={9} fill={C.robeNat} stroke={KRP.ink} strokeWidth={4.5} />
            <path d="M -28 18 L 28 18" stroke={C.robeNatDark} strokeWidth={4} />
          </g>
        )}
      </g>
    </g>
  );
};
const Hm035: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeInOut(seg(f, 0, 22));
  const close = easeInOut(seg(f, 28, 42));
  const wave = Math.sin(f / 2.5) * 8;
  const lx = lerp(540, 750, walk);
  const cam = 1 + 0.04 * easeOut(seg(f, 0, 42));
  // 片側の部屋。mirror=true で右半分 (鏡写し)
  const half = (mirror: boolean) => {
    const restBand = mirror ? KRP.green : KRP.red; // 休んでいる人の組の色
    const leaveBand = mirror ? KRP.red : KRP.green;
    return (
      <g transform={mirror ? "translate(1920 0) scale(-1 1)" : undefined}>
        <HmBApt f={f} restBand={restBand} />
        {/* 出ていく人 (左の部屋=お母さん、右の部屋=お父さん。腕章・弁当の包みを右手に、左手でバイバイ) */}
        <HmBParent id={mirror ? "hmb35LeaveR" : "hmb35LeaveL"} x={lx} y={770} s={mirror ? 1.0 : 0.86} f={f}
          who={mirror ? "dad" : "mom"} pose="stand" band={leaveBand} bundle gaze={[-7, 0]} phase={mirror ? 3 : 1}
          waveSide={f > 22 ? -1 : undefined} waveRot={150 + wave} />
        {/* 休んでいる人 (座ってくつろぐ。右手でバイバイ) */}
        <rect x={250} y={690} width={140} height={20} rx={6} fill={C.post} stroke={KRP.ink} strokeWidth={5} />
        <rect x={240} y={500} width={24} height={210} rx={8} fill={C.post} stroke={KRP.ink} strokeWidth={5} />
        <HmBParent id={mirror ? "hmb35SitR" : "hmb35SitL"} x={320} y={mirror ? 752 : 748} s={mirror ? 0.9 : 1.05} f={f}
          who={mirror ? "mom" : "dad"} pose="sit" gaze={[7, 0]} phase={mirror ? 2 : 4}
          waveSide={f > 22 ? 1 : undefined} waveRot={-150 - wave} />
        <HmBAptFront f={f} close={close} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={5035}>
      <g transform={`translate(960 540) scale(${cam}) translate(-960 -540)`}>
        <clipPath id="hmb35L"><rect x={-100} y={-100} width={1060} height={1300} /></clipPath>
        <clipPath id="hmb35R"><rect x={960} y={-100} width={1060} height={1300} /></clipPath>
        <g clipPath="url(#hmb35L)">{half(false)}</g>
        <g clipPath="url(#hmb35R)">{half(true)}</g>
        {/* 真ん中の仕切り */}
        <rect x={948} y={-100} width={24} height={1300} fill={KRP.ink} />
        <rect x={954} y={-100} width={12} height={1300} fill={KRP.white} />
      </g>
      <TagPlate x={480} y={86} text="父の休み" size={40} t={seg(f, 2, 10)} />
      <TagPlate x={1440} y={86} text="母の休み" size={40} t={seg(f, 4, 12)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_024: (f) => <Hm024 f={f} />,
  hm_025: (f) => <Hm025 f={f} />,
  hm_026: (f) => <Hm026 f={f} />,
  hm_027: (f) => <Hm027 f={f} />,
  hm_028: (f) => <Hm028 f={f} />,
  hm_029: (f) => <Hm029 f={f} />,
  hm_030: (f) => <Hm030 f={f} />,
  hm_031: (f) => <Hm031 f={f} />,
  hm_032: (f) => <Hm032 f={f} />,
  hm_033: (f) => <Hm033 f={f} />,
  hm_034: (f) => <Hm034 f={f} />,
  hm_035: (f) => <Hm035 f={f} />,
};

export const HM_B_MOTIFS: string[] = [
  "hm_024", // #24
  "hm_025", // #25
  "hm_026", // #26
  "hm_027", // #27
  "hm_028", // #28
  "hm_029", // #29
  "hm_030", // #30
  "hm_031", // #31
  "hm_032", // #32
  "hm_033", // #33
  "hm_034", // #34
  "hm_035", // #35
];

export const himaBScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
