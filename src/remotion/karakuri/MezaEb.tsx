// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#109〜#120 (12文)
// 台本: docs/mezamashi-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は mz_文番号3桁。seed は 6000+文番号。
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
} from "./MezaShared";
import {
  MP, Shinshitsu, SumahoAlarm, TainaiDokei, Kobito, Shudouin, TokiNoKane, BanninTou, KoujouMon,
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, mixColor, Flame,
} from "./MezaParts";
const mixC = mixColor;

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  hairBrown: "#8A5A36",
  hairDark: "#3B332C",
  whiteHair: "#EEEBE4",
  tweed: "#8C7356",
  tweedDark: "#6A5640",
  hatBlack: "#2B2826",
  hatBand: "#4A3F38",
  hatBrown: "#6E5440",
  navy: "#2F3E66",
  navyDark: "#222D4C",
  bonnet: "#E9D8B4",
  ribbon: "#B8475A",
  workerGray: "#6F7680",
  workerGrayDark: "#545A63",
  vestBrown: "#7A5A3E",
  femRed: "#B5484A",
  femRedDark: "#8A3336",
  femPink: "#D98A9A",
  femWine: "#8E3A4E",
  bossBlack: "#2E2B2F",
  bossBlackDark: "#1F1D21",
  chalk: "#F4F1E8",
  chalkOrange: "#F09A4A",
  ironWall: "#2C2A2B",
  ironWallLight: "#3E3A39",
  furnace: "#E8622C",
  furnaceGlow: "#FFB25A",
  parchment: "#E8D6AE",
  parchmentDark: "#C8B084",
  sea: "#A9C6CC",
  seaDark: "#7FA3AB",
  land: "#D9C79A",
  grass: "#9DBE72",
  grassDark: "#7A9E55",
  field: "#C9B26A",
  river: "#86B6D6",
  sky: "#9CCBEA",
  skyLight: "#D6ECF7",
  woodWhite: "#F1ECE0",
  dirt: "#C9A877",
  dirtDark: "#A9875A",
  tin: "#B9C0C6",
  tinDark: "#8D959C",
  bread: "#E2B46A",
  steam: "#F4F4F2",
  loco: "#2A2C30",
  glass: "#CFE3EC",
  zoneOrange: "#F0A050",
  zoneYellow: "#F2D35A",
  zoneGreen: "#93C57A",
  zoneBlue: "#7FB0DA",
  gold: "#F6C94A",
  pottery: "#C98A5A",
  potteryLight: "#E3B98E",
  plateWhite: "#F3EFE6",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void MP; void Shinshitsu; void SumahoAlarm; void TainaiDokei; void Kobito; void Shudouin; void TokiNoKane;
void BanninTou; void KoujouMon; void MachiNami; void KnockerUp; void BellClock; void Clocky; void NazoBell;
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

// 腕1本の手先の位置 (Person と同じ肩 (±67,-148) まわりの回転)
const handPos = (side: -1 | 1, rot: number, len = 82): [number, number] => {
  const r = (rot * Math.PI) / 180;
  return [side * 67 - len * Math.sin(r), -148 + len * Math.cos(r)];
};

type MzArm = { side: -1 | 1; rot: number; len?: number; front?: boolean; roll?: boolean; hand?: boolean };

// -------------------------------------------------------------------
// MzEbFig — Person (共通部品) に、この巻の時代の服・帽子・髪を描き足す人物。
//   x,y=足元。arms を渡すと Person の腕を mask で消して、自分で腕を描く (腕は必ず2本)。
//   arms を渡さないときは Person の pose をそのまま使う。
// -------------------------------------------------------------------
type Hat = "none" | "hunting" | "bowler" | "top" | "kerchief" | "bonnet" | "station" | "derby";
const MzEbFig: React.FC<{
  id: string; x: number; y: number; s?: number; f: number; phase?: number;
  face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  gaze?: [number, number]; lean?: number; cloth?: string; clothDark?: string;
  pose?: "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
  pointDir?: 1 | -1;
  arms?: MzArm[];
  hat?: Hat; hatColor?: string;
  longHair?: boolean; bun?: boolean; hairColor?: string; whiteHair?: boolean;
  skirt?: "none" | "knee" | "long"; skirtColor?: string; apron?: boolean;
  vest?: string; fat?: boolean; mustache?: boolean; beard?: boolean; chain?: boolean;
  buttons?: boolean; tie?: string; sweat?: boolean; sx?: number; back?: boolean;
}> = ({
  id, x, y, s = 1, f, phase = 0, face = "normal", gaze, lean = 0,
  cloth = "#3E4B66", clothDark = "#2E3850", pose = "stand", pointDir, arms,
  hat = "none", hatColor, longHair, bun, hairColor = C.hairBrown, whiteHair,
  skirt = "none", skirtColor, apron, vest, fat, mustache, beard, chain, buttons, tie, sweat, sx = 1, back,
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const fem = longHair || bun || hat === "bonnet" || hat === "kerchief";
  const useHair: "cap" | "none" = fem || whiteHair ? "none" : "cap";
  const wide = (fat ? 1.2 : 1) * sx;
  const armEl = (a: MzArm, i: number) => {
    const len = a.len ?? 82;
    const [hx, hy] = handPos(a.side, a.rot, len);
    return (
      <g key={i}>
        <rect x={a.side === -1 ? -78 : 56} y={-148} width={22} height={len} rx={11}
          fill={cloth} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${a.rot} ${a.side * 67} -148)`} />
        {a.roll && (
          <g transform={`rotate(${a.rot} ${a.side * 67} -148)`}>
            <rect x={a.side === -1 ? -77 : 57} y={-148 + len * 0.5} width={20} height={len * 0.5} rx={10}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={a.side === -1 ? -80 : 54} y={-148 + len * 0.45} width={26} height={12} rx={5}
              fill={clothDark} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        )}
        {a.hand !== false && <circle cx={hx} cy={hy} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />}
      </g>
    );
  };
  const mid = `mzebm-${id}`;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s * wide} ${s}) rotate(${lean})`}>
      {arms && (
        <defs>
          <mask id={mid} maskUnits="userSpaceOnUse" x={-200} y={-400} width={400} height={420}>
            <rect x={-200} y={-400} width={400} height={420} fill="white" />
            <rect x={-200} y={-163} width={139} height={112} fill="black" />
            <rect x={61} y={-163} width={139} height={112} fill="black" />
          </mask>
        </defs>
      )}
      {arms && arms.filter((a) => !a.front).map(armEl)}
      <g mask={arms ? `url(#${mid})` : undefined}>
        <Person x={0} y={0} s={1} f={f} phase={phase} face={face} gaze={gaze} cloth={cloth} clothDark={clothDark}
          hair={useHair} pose={arms ? (pose === "sit" ? "sit" : "stand") : pose} pointDir={pointDir} still />
      </g>
      {/* ベスト */}
      {vest && (
        <g>
          <path d="M -56 -156 L -20 -156 L 0 -110 L 20 -156 L 56 -156 L 56 -60 L -56 -60 Z" fill={vest} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -20 -156 L 0 -110 L 20 -156" fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          {[-96, -80, -66].map((by) => <circle key={by} cx={0} cy={by} r={3.5} fill={KRP.ink} />)}
        </g>
      )}
      {tie && <path d="M -7 -158 L 7 -158 L 10 -112 L 0 -100 L -10 -112 Z" fill={tie} stroke={KRP.ink} strokeWidth={3} />}
      {buttons && [-140, -118, -96, -74].map((by) => <circle key={by} cx={0} cy={by} r={4.5} fill={MP.brass} stroke={KRP.ink} strokeWidth={2} />)}
      {chain && (
        <g>
          <path d="M -40 -104 Q -10 -82 22 -100" fill="none" stroke={MP.brass} strokeWidth={4.5} />
          <circle cx={24} cy={-100} r={7} fill={MP.brass} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      )}
      {/* スカート (腰からひざ下 / くるぶし) */}
      {skirt !== "none" && (
        <path d={skirt === "long" ? "M -54 -66 L 54 -66 L 82 -8 Q 0 2 -82 -8 Z" : "M -54 -66 L 54 -66 L 76 -24 Q 0 -16 -76 -24 Z"}
          fill={skirtColor ?? cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {apron && (
        <g>
          <path d="M -34 -122 L 34 -122 L 38 -66 L 44 -14 Q 0 -8 -44 -14 L -38 -66 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -38 -70 L 38 -70" stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {arms && arms.filter((a) => a.front).map(armEl)}
      {/* 髪 (女性: 茶色。肩まで / 後ろで結ぶ) */}
      {fem && hat !== "bonnet" && hat !== "kerchief" && (
        <path d="M -62 -236 Q -64 -294 0 -296 Q 64 -294 62 -236 Q 30 -262 0 -258 Q -30 -262 -62 -236 Z" fill={hairColor} stroke={KRP.ink} strokeWidth={3} />
      )}
      {longHair && (
        <g fill={hairColor} stroke={KRP.ink} strokeWidth={3.5}>
          <path d="M -60 -250 Q -78 -200 -70 -150 L -46 -152 Q -52 -200 -50 -236 Z" />
          <path d="M 60 -250 Q 78 -200 70 -150 L 46 -152 Q 52 -200 50 -236 Z" />
        </g>
      )}
      {bun && <circle cx={52} cy={-276} r={22} fill={hairColor} stroke={KRP.ink} strokeWidth={3.5} />}
      {whiteHair && (
        <g fill={C.whiteHair} stroke={KRP.ink} strokeWidth={3}>
          <path d="M -64 -228 Q -70 -262 -46 -270 Q -40 -248 -56 -224 Z" />
          <path d="M 64 -228 Q 70 -262 46 -270 Q 40 -248 56 -224 Z" />
        </g>
      )}
      {mustache && <path d="M -26 -196 Q -14 -206 0 -198 Q 14 -206 26 -196 Q 14 -190 0 -194 Q -14 -190 -26 -196 Z" fill={whiteHair ? C.whiteHair : C.hairDark} stroke={KRP.ink} strokeWidth={2.5} />}
      {beard && <path d="M -48 -206 Q -40 -160 0 -156 Q 40 -160 48 -206 Q 30 -176 0 -174 Q -30 -176 -48 -206 Z" fill={whiteHair ? C.whiteHair : C.hairDark} stroke={KRP.ink} strokeWidth={3} />}
      {/* 後ろ姿 (顔を髪でおおう) */}
      {back && (
        <g>
          <circle cx={0} cy={-228} r={64} fill={whiteHair ? C.whiteHair : C.hairDark} stroke={KRP.ink} strokeWidth={5.5} />
          <ellipse cx={-64} cy={-222} rx={8} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          <ellipse cx={64} cy={-222} rx={8} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={-20} y={-168} width={40} height={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {/* 帽子 */}
      {hat === "hunting" && (
        <g>
          <path d="M -64 -258 Q -60 -304 6 -304 Q 62 -300 64 -262 Z" fill={hatColor ?? C.tweed} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -66 -262 Q 0 -250 86 -258 Q 64 -246 -60 -252 Z" fill={hatColor ? hatColor : C.tweedDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-302} r={5} fill={C.tweedDark} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      )}
      {hat === "bowler" && (
        <g>
          <path d="M -50 -270 Q -52 -336 0 -338 Q 52 -336 50 -270 Z" fill={hatColor ?? C.hatBlack} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={-270} rx={82} ry={13} fill={hatColor ?? C.hatBlack} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-50} y={-286} width={100} height={10} fill={C.hatBand} />
        </g>
      )}
      {hat === "top" && (
        <g>
          <rect x={-44} y={-370} width={88} height={102} rx={6} fill={hatColor ?? C.hatBlack} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={-268} rx={78} ry={12} fill={hatColor ?? C.hatBlack} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-44} y={-292} width={88} height={12} fill={C.hatBand} />
        </g>
      )}
      {hat === "derby" && (
        <g>
          <path d="M -46 -272 L -40 -330 L 40 -330 L 46 -272 Z" fill={hatColor ?? C.hatBrown} stroke={KRP.ink} strokeWidth={4.5} />
          <ellipse cx={0} cy={-272} rx={80} ry={12} fill={hatColor ?? C.hatBrown} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-44} y={-290} width={88} height={10} fill={KRP.ink} opacity={0.6} />
        </g>
      )}
      {hat === "station" && (
        <g>
          <path d="M -60 -262 L -66 -312 L 66 -312 L 60 -262 Z" fill={hatColor ?? C.navy} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -50 -264 Q 30 -258 78 -244 Q 20 -238 -50 -252 Z" fill={KRP.ink} />
          <rect x={-60} y={-280} width={120} height={10} fill={MP.brass} stroke={KRP.ink} strokeWidth={2} />
          <circle cx={0} cy={-296} r={8} fill={MP.brass} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      )}
      {hat === "kerchief" && (
        <g>
          <path d="M -70 -226 Q -74 -302 0 -304 Q 74 -302 70 -226 Q 50 -264 0 -266 Q -50 -264 -70 -226 Z" fill={hatColor ?? KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M 62 -244 L 86 -222 L 70 -214 Z" fill={hatColor ?? KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      )}
      {hat === "bonnet" && (
        <g>
          <path d="M -60 -250 Q -60 -296 0 -298 Q 60 -296 60 -250 Q 30 -264 0 -262 Q -30 -264 -60 -250 Z" fill={hairColor} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -84 -200 Q -96 -320 0 -326 Q 96 -320 84 -200 Q 72 -196 66 -206 Q 70 -296 0 -298 Q -70 -296 -66 -206 Q -72 -196 -84 -200 Z"
            fill={hatColor ?? C.bonnet} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -66 -196 Q -40 -170 -20 -164 M 66 -196 Q 40 -170 20 -164" stroke={C.ribbon} strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={-160} r={7} fill={C.ribbon} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      )}
      {sweat && (
        <g fill="#9CC9E6" stroke={KRP.ink} strokeWidth={2.5}>
          <path d={`M 70 ${-250 + (f % 24)} q -8 12 0 18 q 8 -6 0 -18 Z`} />
          <path d={`M -74 ${-236 + ((f + 11) % 24)} q -7 11 0 16 q 7 -5 0 -16 Z`} />
        </g>
      )}
    </g>
  );
};

// れんが壁 (x,y,w,h)。目地と色むら
const MzEbBricks: React.FC<{ x: number; y: number; w: number; h: number; seed?: number; base?: string; dark?: string; light?: string }> = ({
  x, y, w, h, seed = 1, base = MP.brick, dark = MP.brickDark, light = MP.brickLight,
}) => {
  const bw = 90, bh = 40;
  const rows = Math.ceil(h / bh), cols = Math.ceil(w / bw) + 1;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={MP.mortar} />
      {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
        const bx = x + c * bw - (r % 2 ? bw / 2 : 0);
        const v = rnd(seed + r, c);
        const fw = Math.min(bw - 6, x + w - bx - 3);
        if (fw <= 4 || bx + bw < x) return null;
        const lx = Math.max(bx + 3, x);
        return <rect key={`${r}-${c}`} x={lx} y={y + r * bh + 3} width={Math.min(fw, bx + bw - 3 - lx)} height={Math.min(bh - 6, y + h - (y + r * bh + 3))}
          fill={v < 0.2 ? dark : v > 0.85 ? light : base} />;
      }))}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// ユニオンジャック (イギリスの旗)。x,y=左上
const MzEbUK: React.FC<{ x: number; y: number; w?: number; f: number }> = ({ x, y, w = 150, f }) => {
  const h = w * 0.55;
  const wave = Math.sin(f / 6) * 4;
  return (
    <g transform={`translate(${x} ${y}) skewY(${wave * 0.6})`}>
      <rect width={w} height={h} fill="#2F4C8F" stroke={KRP.ink} strokeWidth={4} />
      <path d={`M 0 0 L ${w} ${h} M ${w} 0 L 0 ${h}`} stroke={KRP.white} strokeWidth={h * 0.2} />
      <path d={`M 0 0 L ${w} ${h} M ${w} 0 L 0 ${h}`} stroke={KRP.red} strokeWidth={h * 0.07} />
      <path d={`M ${w / 2} 0 L ${w / 2} ${h} M 0 ${h / 2} L ${w} ${h / 2}`} stroke={KRP.white} strokeWidth={h * 0.32} />
      <path d={`M ${w / 2} 0 L ${w / 2} ${h} M 0 ${h / 2} L ${w} ${h / 2}`} stroke={KRP.red} strokeWidth={h * 0.18} />
      <rect width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 蒸気機関車+客車1両 (左向き)。x=先頭, y=レール
const MzEbLoco: React.FC<{ x: number; y: number; s?: number; f: number; moving?: number; whistle?: number }> = ({ x, y, s = 1, f, moving = 0, whistle = 0 }) => {
  const rot = f * 9 * moving;
  const wheel = (cx: number, r: number, k: string) => (
    <g key={k} transform={`translate(${cx} ${-r}) rotate(${-rot})`}>
      <circle r={r} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
      <circle r={r * 0.78} fill="none" stroke={MP.bellDark} strokeWidth={4} />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 45})`} />)}
      <circle r={r * 0.2} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 客車 */}
      <g transform="translate(780 0)">
        <rect x={0} y={-380} width={700} height={290} rx={18} fill="#7E2F36" stroke={KRP.ink} strokeWidth={6} />
        <path d="M -6 -380 Q 350 -440 706 -380 Z" fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={40 + i * 130} y={-340} width={90} height={110} rx={14} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
            <line x1={40 + i * 130} y1={-290} x2={130 + i * 130} y2={-290} stroke={MP.woodDark} strokeWidth={3} />
          </g>
        ))}
        <rect x={0} y={-200} width={700} height={10} fill={MP.brass} />
        {[110, 260, 450, 600].map((cx, i) => wheel(cx, 44, `c${i}`))}
      </g>
      {/* 連結器 */}
      <rect x={720} y={-130} width={70} height={16} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
      {/* 機関車の台枠 */}
      <rect x={20} y={-160} width={710} height={44} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      {/* 緩衝器 (赤いバッファー) */}
      <rect x={-20} y={-170} width={44} height={64} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      {[-150, -124].map((by) => <rect key={by} x={-46} y={by} width={28} height={16} rx={4} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />)}
      {/* ボイラー */}
      <rect x={40} y={-360} width={500} height={200} rx={30} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      {[160, 300, 440].map((bx) => <rect key={bx} x={bx} y={-360} width={14} height={200} fill={MP.brass} stroke={KRP.ink} strokeWidth={2.5} />)}
      <circle cx={60} cy={-260} r={70} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={60} cy={-260} r={16} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={3} />
      {/* 煙突・ドーム */}
      <path d="M 70 -360 L 80 -470 L 60 -500 L 160 -500 L 140 -470 L 150 -360 Z" fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 280 -360 Q 280 -430 320 -430 Q 360 -430 360 -360 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* 汽笛 */}
      <rect x={450} y={-410} width={20} height={50} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
      {/* 運転室 */}
      <rect x={540} y={-470} width={190} height={310} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />
      <path d="M 520 -470 L 750 -470 L 740 -500 L 530 -500 Z" fill={C.loco} stroke={KRP.ink} strokeWidth={5} />
      <rect x={580} y={-440} width={110} height={90} rx={10} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
      {/* 車輪 */}
      {wheel(130, 48, "f")}
      {wheel(330, 84, "d1")}
      {wheel(520, 84, "d2")}
      {/* 連結棒 */}
      <line x1={330 + Math.cos((rot * Math.PI) / 180) * 50} y1={-84 + Math.sin((rot * Math.PI) / 180) * 50} x2={520 + Math.cos((rot * Math.PI) / 180) * 50} y2={-84 + Math.sin((rot * Math.PI) / 180) * 50}
        stroke={MP.ironLight} strokeWidth={14} strokeLinecap="round" />
      {/* 汽笛の湯気 */}
      {whistle > 0 && Array.from({ length: 4 }, (_, i) => (
        <circle key={i} cx={460 + i * 30} cy={-430 - i * 40 * whistle} r={(18 + i * 12) * whistle} fill={C.steam} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
      ))}
    </g>
  );
};

// 丸い時計の文字盤 (minutes = 0時からの分)。roman=ローマ数字
const ROMAN = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const MzEbDial: React.FC<{ x: number; y: number; r: number; minutes: number; roman?: boolean; face?: string; rim?: string; hourMin?: number }> = ({
  x, y, r, minutes, roman, face = "#FBF6E8", rim = MP.brass, hourMin,
}) => {
  const mAng = (minutes % 60) * 6;
  const hAng = (((hourMin ?? minutes) / 60) % 12) * 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 1.1} fill={rim} stroke={KRP.ink} strokeWidth={Math.max(4, r * 0.05)} />
      <circle r={r} fill={face} stroke={KRP.ink} strokeWidth={Math.max(3, r * 0.035)} />
      {Array.from({ length: 60 }, (_, i) => (
        <line key={i} x1={0} y1={-r * 0.95} x2={0} y2={-r * (i % 5 ? 0.9 : 0.82)} stroke={KRP.ink}
          strokeWidth={i % 5 ? Math.max(1.5, r * 0.012) : Math.max(3, r * 0.03)} transform={`rotate(${i * 6})`} />
      ))}
      {r >= 50 && Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const rr = r * 0.68;
        return (
          <text key={i} x={Math.sin(a) * rr} y={-Math.cos(a) * rr + r * 0.07} textAnchor="middle" fontFamily={roman ? "serif" : FONT}
            fontWeight={800} fontSize={r * (roman ? 0.16 : 0.2)} fill={KRP.ink}>{roman ? ROMAN[i] : i === 0 ? 12 : i}</text>
        );
      })}
      <line x1={0} y1={r * 0.08} x2={0} y2={-r * 0.5} stroke={KRP.ink} strokeWidth={Math.max(4, r * 0.07)} strokeLinecap="round" transform={`rotate(${hAng})`} />
      <line x1={0} y1={r * 0.12} x2={0} y2={-r * 0.8} stroke={KRP.ink} strokeWidth={Math.max(3, r * 0.045)} strokeLinecap="round" transform={`rotate(${mAng})`} />
      <circle r={Math.max(4, r * 0.06)} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={2} />
    </g>
  );
};

// 鐘の音の線 (x,y を中心に左右へ広がる弧)
const MzEbRing: React.FC<{ x: number; y: number; r?: number; amt: number; f: number; color?: string }> = ({ x, y, r = 60, amt, f, color = KRP.ink }) => {
  if (amt <= 0.01) return null;
  return (
    <g opacity={amt} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
      {[0, 1, 2].map((i) => {
        const k = r + i * 26 + ((f * 2) % 26);
        return (
          <g key={i}>
            <path d={`M ${x + k * 0.7} ${y - k * 0.7} A ${k} ${k} 0 0 1 ${x + k * 0.7} ${y + k * 0.7}`} />
            <path d={`M ${x - k * 0.7} ${y - k * 0.7} A ${k} ${k} 0 0 0 ${x - k * 0.7} ${y + k * 0.7}`} />
          </g>
        );
      })}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #109 1日の仕事は、13時間半です。
// 格: 図 / seed 6109
// 絵: どこ: #108 の製鉄所の中の、すすけた黒い鉄の壁 (炉の赤い光が照らす)。壁にチョークで大きく描かれた1日の帯。演出: 図の主役は壁の1日の帯 (24の目盛りの横長の帯)。帯の上を、チョークの線が「仕事」の色 (橙) でぐいぐい塗られていき、帯の半分を超えてもまだ止まらず、ついに大きな数字札「13時間半」が帯の上にどんと乗る。残った帯の短い部分には、小さなベッドとご飯の茶わんの絵がぎゅうぎゅうに押し込まれる。壁の前で、鉄を打つハンマーを持った男 (腕まくり・汗) が、帯を見上げてがくっと肩を落とし、ハンマーを持ったままへたりこむ (腕は2本)。カメラは帯の左から右へパン。動き: f0-100 塗られていく / f100 札 / f110-150 へたりこむ
// どこ: 製鉄所の中。リベット留めのすすけた鉄の壁。左から炉の赤い光がゆらぐ。床は鉄板、火の粉が舞う
// 演出: 壁にチョークの1日の帯 (24目盛り)。橙のチョークが左からぐいぐい塗り進み、半分を越えて13.5まで。
//       「13時間半」の札がどんと乗る。残りの短い区画にベッドと茶わんの落書きがぎゅうぎゅうに押し込まれる。
//       手前のハンマーの男 (腕まくり・汗) が帯を見上げて、がくっと鉄の塊に座りこむ
// 動き: f4-36 塗る (カメラは左→右へパン) / f34-42 札 / f26-40 ベッドと茶わんが押し込まれる / f38-56 へたりこむ / 以後 火の粉・汗
const Mz109: React.FC<{ f: number }> = ({ f }) => {
  const BX = 170, BW = 1580, BY = 300, BHt = 150;
  const fillT = easeOut(seg(f, 4, 36));
  const workEnd = BX + BW * (13.5 / 24) * fillT;
  const plate = seg(f, 34, 42);
  const squeeze = easeOut(seg(f, 26, 40));
  const slump = easeInOut(seg(f, 28, 40));
  const pan = lerp(0, 150, easeInOut(seg(f, 0, 60)));
  const flick = 0.75 + 0.25 * Math.sin(f / 3.1) * Math.sin(f / 7.3);
  const sitting = slump > 0.5;
  const manY = sitting ? 978 : lerp(992, 1000, slump * 2);
  const chalkX = workEnd + Math.sin(f / 1.6) * 6;
  return (
    <Frame f={f} seed={6109} bg={C.ironWall}>
      <g transform={`translate(${-pan + 60} 0) scale(1.04)`}>
        {/* 鉄の壁 (リベット留めの鉄板) */}
        <rect x={-200} y={-60} width={2400} height={1200} fill={C.ironWall} />
        {Array.from({ length: 6 }, (_, c) => Array.from({ length: 3 }, (_, r) => (
          <g key={`${c}-${r}`}>
            <rect x={-200 + c * 400} y={-40 + r * 300} width={396} height={296} fill={(c + r) % 2 ? C.ironWallLight : C.ironWall} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 6 }, (_, k) => (
              <g key={k}>
                <circle cx={-180 + c * 400 + k * 70} cy={-24 + r * 300} r={6} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={2} />
                <circle cx={-180 + c * 400 + k * 70} cy={240 + r * 300} r={6} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={2} />
              </g>
            ))}
          </g>
        )))}
        {/* すすの汚れ */}
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={rnd(61, i) * 2200 - 150} cy={rnd(62, i) * 700 + 40} rx={80 + rnd(63, i) * 120} ry={30 + rnd(64, i) * 40} fill="#1C1A1B" opacity={0.35} />
        ))}
        {/* 炉の光 (左から当たる) */}
        {[520, 380, 240].map((r, i) => (
          <circle key={r} cx={-120} cy={560} r={r + flick * 30} fill={C.furnace} opacity={0.09 + i * 0.05} />
        ))}
        {/* 炉の口 (画面左端) */}
        <path d="M -200 420 L 40 420 Q 90 420 90 480 L 90 760 L -200 760 Z" fill={MP.soot} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -150 500 L 0 500 Q 30 500 30 530 L 30 720 L -150 720 Z" fill={C.furnace} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M -150 720 Q -100 ${600 - flick * 40} -60 700 Q -20 ${590 - flick * 50} 20 720 Z`} fill={C.furnaceGlow} />
        <path d={`M -120 720 Q -90 ${650 - flick * 30} -60 720 Z`} fill={MP.flameCore} />
        {/* チョークの1日の帯 */}
        <rect x={BX} y={BY} width={BW} height={BHt} fill="none" stroke={C.chalk} strokeWidth={7} strokeDasharray="60 6" opacity={0.95} />
        {Array.from({ length: 25 }, (_, i) => (
          <line key={i} x1={BX + (BW / 24) * i} y1={BY + BHt} x2={BX + (BW / 24) * i} y2={BY + BHt + (i % 6 === 0 ? 34 : 18)}
            stroke={C.chalk} strokeWidth={i % 6 === 0 ? 6 : 4} strokeLinecap="round" />
        ))}
        {[0, 6, 12, 18, 24].map((h) => (
          <text key={h} x={BX + (BW / 24) * h} y={BY + BHt + 82} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.chalk} opacity={0.92}>{h}</text>
        ))}
        {/* 塗られていく仕事の時間 (チョークのぐりぐり線) */}
        <g>
          <rect x={BX + 6} y={BY + 6} width={Math.max(0, workEnd - BX - 6)} height={BHt - 12} fill={C.chalkOrange} opacity={0.55} />
          {Array.from({ length: 46 }, (_, i) => {
            const x0 = BX + 10 + i * 20;
            if (x0 > workEnd - 8) return null;
            return <path key={i} d={`M ${x0} ${BY + 14} L ${x0 + 30} ${BY + BHt - 14}`} stroke={C.chalkOrange} strokeWidth={11} strokeLinecap="round" opacity={0.9} />;
          })}
          {/* チョークの棒 (塗っている最中) */}
          {fillT < 1 && (
            <g transform={`translate(${chalkX} ${BY + 70 + Math.sin(f / 1.2) * 40}) rotate(-35)`}>
              <rect x={-12} y={-60} width={24} height={70} rx={5} fill={C.chalkOrange} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-12} y={-60} width={24} height={20} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            </g>
          )}
          {/* 粉 */}
          {fillT < 1 && Array.from({ length: 6 }, (_, i) => (
            <circle key={i} cx={chalkX + rnd(65, i + f) * 30 - 15} cy={BY + BHt + rnd(66, i + f) * 60} r={4} fill={C.chalkOrange} opacity={0.7} />
          ))}
        </g>
        {/* 13.5 の区切り線 */}
        {fillT > 0.98 && <line x1={workEnd} y1={BY - 20} x2={workEnd} y2={BY + BHt + 20} stroke={C.chalk} strokeWidth={8} strokeLinecap="round" />}
        {/* 残りの区画: ベッドと茶わんがぎゅうぎゅう */}
        {squeeze > 0 && (
          <g opacity={squeeze}>
            <g transform={`translate(${BX + BW * 0.575 + 8} ${BY + 66}) scale(${lerp(2.2, 1.95, squeeze)} ${lerp(0.9, 1.2, squeeze)}) rotate(-3)`}>
              {/* ベッド (チョーク線) */}
              <rect x={0} y={-10} width={210} height={44} rx={6} fill="none" stroke={C.chalk} strokeWidth={6} />
              <line x1={0} y1={-46} x2={0} y2={56} stroke={C.chalk} strokeWidth={7} strokeLinecap="round" />
              <line x1={210} y1={-20} x2={210} y2={56} stroke={C.chalk} strokeWidth={7} strokeLinecap="round" />
              <rect x={10} y={-34} width={54} height={26} rx={12} fill="none" stroke={C.chalk} strokeWidth={5} />
              <path d="M 80 -10 Q 140 -36 200 -10" fill="none" stroke={C.chalk} strokeWidth={5} />
              <text x={150} y={-46} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.chalk}>z</text>
            </g>
            <g transform={`translate(${BX + BW * 0.575 + 560 + lerp(120, 0, squeeze)} ${BY + 78}) scale(${lerp(1.0, 1.05, squeeze)}) rotate(8)`}>
              {/* 茶わん (ご飯山盛り) */}
              <path d="M -60 0 Q -56 54 0 58 Q 56 54 60 0 Z" fill="none" stroke={C.chalk} strokeWidth={6} />
              <path d="M -54 0 Q -40 -40 0 -44 Q 40 -40 54 0" fill="none" stroke={C.chalk} strokeWidth={5} />
              <line x1={-20} y1={64} x2={20} y2={64} stroke={C.chalk} strokeWidth={6} strokeLinecap="round" />
              <line x1={40} y1={-60} x2={90} y2={-20} stroke={C.chalk} strokeWidth={5} strokeLinecap="round" />
              <line x1={52} y1={-66} x2={98} y2={-28} stroke={C.chalk} strokeWidth={5} strokeLinecap="round" />
            </g>
            {/* 押し込まれた線 (ぎゅう) */}
            {[0, 1].map((i) => (
              <path key={i} d={`M ${BX + BW * 0.6 - 6 + i * 6} ${BY + 30 + i * 70} l 18 12 l -18 12`} stroke={C.chalk} strokeWidth={4} fill="none" opacity={0.7} />
            ))}
          </g>
        )}
        {/* 床の鉄板 */}
        <rect x={-200} y={890} width={2400} height={260} fill="#242122" />
        <path d="M -200 890 L 2200 890" stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-200 + i * 220} y1={890} x2={-260 + i * 220} y2={1100} stroke="#3A3536" strokeWidth={4} />)}
        <ellipse cx={200} cy={900} rx={420} ry={30} fill={C.furnace} opacity={0.18 * flick} />
        {/* 金床 */}
        <g transform="translate(820 900)">
          <path d="M -120 -110 L 130 -110 Q 190 -108 210 -84 L 120 -80 L 90 -40 L 110 0 L -110 0 L -90 -40 L -120 -80 Z" fill={MP.iron} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-60} y={-130} width={110} height={22} rx={4} fill={C.furnace} stroke={KRP.ink} strokeWidth={4} opacity={0.95} />
          <rect x={-60} y={-130} width={110} height={8} fill={C.furnaceGlow} opacity={0.8} />
        </g>
      </g>
      {/* 手前: ハンマーの男 (カメラの外のレイヤー。パンで流れない) */}
      <g transform={`translate(${-pan * 0.3} 0)`}>
        {/* 座りこむ鉄の塊 */}
        <g transform="translate(1440 990)">
          <path d="M -110 0 L -100 -64 L 100 -64 L 112 0 Z" fill={MP.iron} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -100 -64 L -80 -84 L 116 -84 L 100 -64 Z" fill={MP.ironLight} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {sitting && seg(f, 35, 58) < 1 && (
          <g opacity={1 - seg(f, 35, 58)}>
            {[-1, 1].map((d) => <circle key={d} cx={1440 + d * (120 + seg(f, 35, 58) * 90)} cy={960} r={22 + seg(f, 35, 58) * 26} fill="#8A817C" opacity={0.6} />)}
          </g>
        )}
        <MzEbFig id="109a" x={1440} y={manY} s={1.25} f={f} phase={2}
          pose={sitting ? "sit" : "stand"}
          face={f < 20 ? "normal" : sitting ? "sad" : "worried"} gaze={sitting ? [0, 6] : [-6, -8]}
          lean={sitting ? 3 : -slump * 6} cloth={C.workerGray} clothDark={C.workerGrayDark} hat="hunting" vest={C.vestBrown} sweat
          arms={[{ side: -1, rot: sitting ? 24 : 8, roll: true }, { side: 1, rot: sitting ? -30 : -6, roll: true }]} />
        {/* ハンマー (右手に持ったまま。頭は床へ) */}
        {(() => {
          const [hx, hy] = handPos(1, sitting ? -30 : -6);
          const k = 1.25;
          const px = 1440 + hx * k, py = manY + hy * k + Math.sin((f + 34) / 13) * 3;
          const ang = sitting ? -28 : -8;
          return (
            <g transform={`translate(${px} ${py}) rotate(${ang})`}>
              <rect x={-7} y={-6} width={14} height={sitting ? 100 : 120} rx={5} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-36} y={sitting ? 92 : 112} width={72} height={40} rx={6} fill={MP.iron} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={0} cy={0} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })()}
        {/* がくっ の線 */}
        {sitting && (
          <g stroke={C.chalk} strokeWidth={5} strokeLinecap="round" opacity={0.8}>
            {[-1, 0, 1].map((i) => <line key={i} x1={1440 + i * 60} y1={560 - Math.abs(i) * 14} x2={1440 + i * 60} y2={604 - Math.abs(i) * 14} />)}
          </g>
        )}
      </g>
      {/* 火の粉 */}
      {Array.from({ length: 14 }, (_, i) => {
        const t = ((f / 60 + rnd(67, i)) % 1);
        return <circle key={i} cx={120 + rnd(68, i) * 500 + t * 200} cy={760 - t * 600} r={3 + rnd(69, i) * 4} fill={C.furnaceGlow} opacity={(1 - t) * 0.9} />;
      })}
      <TagPlate x={680} y={226} text="13時間半" size={68} t={plate} color={KRP.ink} fill={KRP.white} rot={-3} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #110 ある陶器の工場では、閉まった門を押し通って入ると、罰金でした。
// 格: 山 / seed 6110
// 絵: どこ: 18世紀イギリスの陶器工場の門 (KoujouMon gate=0, hands=6時5分。門の向こうに陶器の窯の丸い屋根と、棚にずらりと並んだつぼや皿)。演出: 閉まった鉄の門に、遅れてきた男 (ハンチング帽・ベスト) が肩から体当たりして、門のすき間をむりやりぎゅうぎゅう押し通る (腕は2本、pose で両手で門の格子をつかむ)。すり抜けた瞬間、門の内側で待ち構えていた監督 (黒い上着・山高帽・太った体) が、罰金の紙切れをぴしっと男の鼻先に突き出す。紙には数字札「2シリング」だけ。男は紙を見て目を白黒させ、その拍子に門の脇の棚の皿が1枚ぐらぐら揺れて、落ちる寸前で止まる。門の外では、頭巾とエプロンの女性の同僚が口に手を当てて目を丸くする。カメラは門の寄りから監督へパン。動き: f0-50 押し通る / f50 紙を突き出す / f60-100 目を白黒・皿がぐらぐら
// どこ: KoujouMon (門は閉、時計は6時5分)。屋根の向こうに陶器の窯 (とっくり形のれんが窯) が2基。門の右の塀の前に、つぼと皿をずらりと並べた木の棚
// 演出: 遅れてきた男 (ハンチング帽・ベスト) が門のすき間に体をねじこみ、門をたわませてぎゅうぎゅう押し通る (両手で格子をつかむ)。
//       すぽんと抜けた瞬間、待ち構えていた太った監督 (山高帽) が「2シリング」の紙をぴしっと鼻先へ。男は目を白黒。
//       その拍子に棚のいちばん上の皿が1枚ぐらぐら揺れ、棚の縁から半分はみ出して止まる。門の外 (向こう側) では頭巾の女性の同僚が口に手を当てる
// 動き: f0-26 ねじこむ (門が少し開いてたわむ) / f26-32 すぽん / f30-38 紙を突き出す / f32-70 皿がぐらぐら→止まる / カメラは門の寄り→監督へパン
const Mz110: React.FC<{ f: number }> = ({ f }) => {
  const squeeze = seg(f, 0, 26);
  const popT = easeOut(seg(f, 26, 32));
  const through = popT > 0;
  const gateOpen = through ? 0.1 * Math.max(0, 1 - seg(f, 28, 36)) * Math.cos(seg(f, 28, 44) * 9) : 0.1 * easeOut(squeeze) + Math.sin(f / 1.5) * 0.008 * squeeze;
  const paperT = seg(f, 30, 38);
  const wob = seg(f, 32, 76);
  const plateRot = wob > 0 ? Math.sin(wob * 22) * 26 * (1 - wob) + 8 * easeOut(wob) : 0;
  const cam = easeInOut(seg(f, 8, 40));
  const cx = lerp(960, 1080, cam), cy = lerp(700, 640, cam), sc = lerp(1.32, 1.12, cam);
  // 男の位置: 門の面 (y=905) → すぽんと手前 (y=990)
  const manX = lerp(960, 740, popT);
  const manY = lerp(905, 992, popT);
  const manS = lerp(0.9, 1.05, popT);
  const shake = through ? 0 : Math.sin(f * 1.7) * 4 * squeeze;
  const dizzy = seg(f, 34, 42);
  return (
    <Frame f={f} seed={6110}>
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <KoujouMon f={f} gate={Math.max(0, gateOpen)} hands={6 * 60 + 5} smoke={0.8} sky={1.5} />
        {/* 陶器の窯 (とっくり形) 屋根の向こう */}
        {[480, 1440].map((kx, i) => (
          <g key={kx}>
            <path d={`M ${kx - 120} 290 Q ${kx - 130} 190 ${kx - 40} 140 L ${kx - 30} 90 L ${kx + 30} 90 L ${kx + 40} 140 Q ${kx + 130} 190 ${kx + 120} 290 Z`}
              fill={MP.brickLight} stroke={KRP.ink} strokeWidth={6} />
            {[180, 220, 260].map((ly) => <path key={ly} d={`M ${kx - 118 + (ly - 180) * 0.0} ${ly} Q ${kx} ${ly + 10} ${kx + 118} ${ly}`} stroke={MP.mortar} strokeWidth={3} fill="none" opacity={0.7} />)}
            <rect x={kx - 36} y={82} width={72} height={14} fill={MP.brickDark} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 4 }, (_, j) => {
              const t = ((f / 120 + j / 4 + i * 0.3) % 1);
              return <circle key={j} cx={kx + t * 120} cy={70 - t * 150} r={20 + t * 50} fill="#8E8682" opacity={(1 - t) * 0.5} />;
            })}
          </g>
        ))}
        {/* 門の外 (向こう側) の女性の同僚。格子ごしに見える */}
        {/* 塀の上から顔を出してのぞく (塀の向こう側に立っている) */}
        <defs>
          <clipPath id="mzeb110clip"><rect x={-40} y={-40} width={2000} height={688} /></clipPath>
        </defs>
        <g clipPath="url(#mzeb110clip)">
          <MzEbFig id="110w" x={470} y={772} s={0.78} f={f} phase={5} face={f > 30 ? "surprised" : "worried"} gaze={[8, 2]}
            cloth={C.femRed} clothDark={C.femRedDark} hat="kerchief" skirt="long" skirtColor={C.femWine} apron
            arms={[{ side: -1, rot: 6 }, { side: 1, rot: 125, len: 70, front: true }]} />
        </g>
        {/* 塀にかけた両手 */}
        {[-1, 1].map((d) => <circle key={d} cx={470 + d * 70} cy={648} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 門の右の棚 (つぼと皿) */}
        <g transform="translate(1330 0)">
          <rect x={0} y={560} width={16} height={430} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={420} y={560} width={16} height={430} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {[640, 780, 920].map((sy, r) => (
            <g key={sy}>
              <rect x={-10} y={sy} width={456} height={18} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
              {r > 0 && Array.from({ length: 5 }, (_, j) => {
                const px = 40 + j * 86;
                return j % 2 === 0 ? (
                  <g key={j}>
                    <path d={`M ${px - 22} ${sy} Q ${px - 40} ${sy - 50} ${px - 16} ${sy - 80} L ${px + 16} ${sy - 80} Q ${px + 40} ${sy - 50} ${px + 22} ${sy} Z`} fill={j % 4 ? C.pottery : C.potteryLight} stroke={KRP.ink} strokeWidth={4} />
                    <path d={`M ${px - 30} ${sy - 44} Q ${px} ${sy - 36} ${px + 30} ${sy - 44}`} stroke={MP.brickDark} strokeWidth={4} fill="none" />
                  </g>
                ) : (
                  <g key={j}>
                    <ellipse cx={px} cy={sy - 40} rx={14} ry={40} fill={C.plateWhite} stroke={KRP.ink} strokeWidth={4} />
                    <ellipse cx={px} cy={sy - 40} rx={7} ry={24} fill="none" stroke={KRP.blueDeep} strokeWidth={3} />
                  </g>
                );
              })}
            </g>
          ))}
          {/* いちばん上: 立てて並べた皿。左端の1枚がぐらぐら */}
          {[0, 1, 2, 3].map((j) => (
            <g key={j} transform={j === 0 ? `rotate(${plateRot} ${-6} 640)` : undefined}>
              <circle cx={j === 0 ? 30 : 110 + j * 90} cy={j === 0 ? 590 : 592} r={j === 0 ? 46 : 44} fill={C.plateWhite} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={j === 0 ? 30 : 110 + j * 90} cy={j === 0 ? 590 : 592} r={30} fill="none" stroke={KRP.blueDeep} strokeWidth={4} />
              <circle cx={j === 0 ? 30 : 110 + j * 90} cy={j === 0 ? 590 : 592} r={10} fill={KRP.blueSoft} stroke={KRP.blueDeep} strokeWidth={3} />
            </g>
          ))}
          {wob > 0 && wob < 0.8 && (
            <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={1 - wob}>
              <path d="M -40 548 l -16 -10 M -44 590 l -20 0 M 90 540 l 14 -12" />
            </g>
          )}
        </g>
        {/* 監督 (太った体・黒い上着・山高帽)。片手で紙を突き出す */}
        <MzEbFig id="110b" x={1170} y={990} s={1.12} f={f} phase={1} fat face={through ? "angry" : "normal"} gaze={[-8, 0]}
          cloth={C.bossBlack} clothDark={C.bossBlackDark} hat="bowler" mustache chain vest="#5C4A3E"
          arms={[{ side: -1, rot: lerp(20, 125, easeOut(paperT)), len: 96, front: true }, { side: 1, rot: -14 }]} />
        {/* 罰金の紙 */}
        {paperT > 0 && (() => {
          const [hx, hy] = handPos(-1, lerp(20, 125, easeOut(paperT)), 96);
          const px = 1170 + hx * 1.12 * 1.2, py = 990 + hy * 1.12;
          return (
            <g>
              {paperT >= 1 && f < 50 && <path d={`M ${px + 20} ${py - 110} l 24 -26 M ${px + 40} ${py - 70} l 34 -6`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />}
            </g>
          );
        })()}
        <TagPlate x={960} y={720} text="2シリング" size={42} t={paperT} fill={C.plateWhite} rot={-6} />
        {/* 押し通る男 */}
        <g transform={`translate(${shake} 0)`}>
          <MzEbFig id="110m" x={manX} y={manY} s={manS} sx={lerp(0.68, 1, popT)} f={f} phase={3}
            face={through ? "surprised" : "worried"} gaze={through ? [Math.sin(f / 2) * 7, 0] : [4, 0]} lean={through ? -4 : 8 * Math.sin(f / 3) * squeeze}
            cloth={C.workerGray} clothDark={C.workerGrayDark} hat="hunting" vest={C.vestBrown} sweat
            arms={through
              ? [{ side: -1, rot: 30, roll: true }, { side: 1, rot: -30, roll: true }]
              : [{ side: -1, rot: 118, roll: true, front: true }, { side: 1, rot: -118, roll: true, front: true }]} />
        </g>
        {/* ねじこみ中: 男の両脇にかかる門の格子 (手前の2本) */}
        {!through && [-1, 1].map((d) => (
          <g key={d}>
            <path d={`M ${960 + d * 62} 470 Q ${960 + d * (82 + 16 * squeeze)} 720 ${960 + d * 62} 874`} stroke={MP.iron} strokeWidth={12} fill="none" />
            <path d={`M ${960 + d * 62} 470 Q ${960 + d * (82 + 16 * squeeze)} 720 ${960 + d * 62} 874`} stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.6} />
          </g>
        ))}
        {/* すぽん の線と、目を白黒のくるくる */}
        {through && seg(f, 26, 40) < 1 && (
          <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 30, 40)}>
            {[-2, -1, 0, 1, 2].map((i) => <line key={i} x1={960 + i * 40} y1={880} x2={960 + i * 70} y2={930} />)}
          </g>
        )}
        {dizzy > 0 && [-1, 1].map((d) => (
          <g key={d} transform={`translate(${manX + d * 92} ${manY - 300}) rotate(${f * 14 * d})`} opacity={dizzy}>
            <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #111 さらに、こんな証言も残っています。
// 格: 並 / seed 6111
// 絵: どこ: 19世紀イギリスの工場の門の脇、KoujouMon (gate=0, hands=480, smoke=0.6) の門の前の石畳。門は閉まったまま、上の大時計は8時。演出: 門の横のれんが壁の陰で、ハンチング帽・ベスト・腕まくりの男性工員と、長いスカートにエプロン・頭巾の女性工員が、口に手を当ててひそひそ話をしている (内緒話の吹き出しの中は小さな時計の絵と「シーッ」の指だけ。字は書かない)。二人の目線は門の上の大時計へちらり。腕は2本 (男性 pose="whisper" で片手を口元、もう片手は帽子のつば / 女性は両手で前かけを握る)。カメラは門全景から二人の顔の高さへ寄る。動き: f0-30 寄る / f30-60 男性がささやく・女性が目を丸くする (face="surprised") / 二人の視線がそろって時計へ / 煙突の煙がゆっくり流れる
// どこ: KoujouMon (門は閉、時計は8時、煙は少なめ)。門の左の塀の陰の石畳。塀にはびらの跡とひび
// 演出: 塀の陰で、男性工員 (ハンチング帽・ベスト・腕まくり) が片手を口元に、片手で帽子のつばを下げて、女性工員 (頭巾・エプロン・長いスカート) に耳打ち。
//       内緒の吹き出しの中は小さな時計の絵と「シーッ」の指。女性が目を丸くし、二人の目がそろって門の上の大時計へちらり
// 動き: f0-30 門全景から二人へ寄る / f22-34 吹き出し / f30-38 女性が驚く / f34- 二人の視線が時計へ / 煙がゆっくり流れる
const Mz111: React.FC<{ f: number }> = ({ f }) => {
  const zoom = easeInOut(seg(f, 0, 30));
  const sc = lerp(1, 1.55, zoom);
  const cx = lerp(960, 600, zoom), cy = lerp(540, 640, zoom);
  const bub = seg(f, 22, 34);
  const look = seg(f, 34, 40);
  const surprised = f >= 30;
  const whisperBob = Math.sin(f / 5) * 3;
  return (
    <Frame f={f} seed={6111}>
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <KoujouMon f={f} gate={0} hands={480} smoke={0.6} sky={1.4} />
        {/* 塀の古いびら (はがれかけ) とひび */}
        <g transform="rotate(-4 250 760)">
          <rect x={180} y={700} width={130} height={110} fill={C.parchment} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
          <path d="M 180 700 L 214 700 L 180 736 Z" fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={3} />
          {[730, 752, 774].map((ly) => <line key={ly} x1={200} y1={ly} x2={290} y2={ly} stroke={KRP.grayDark} strokeWidth={5} opacity={0.5} />)}
        </g>
        <path d="M 560 670 l -14 40 l 18 26 l -12 40" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.6} />
        {/* 塀の陰 */}
        <path d="M -40 666 L 650 666 L 650 1120 L -40 1120 Z" fill={MP.nightDeep} opacity={0.22} />
        {/* 足元のバケツ (職場の小物) */}
        <g transform="translate(150 960)">
          <path d="M -40 -80 L 40 -80 L 32 0 L -32 0 Z" fill={MP.ironLight} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -40 -80 Q 0 -130 40 -80" stroke={KRP.ink} strokeWidth={4} fill="none" />
        </g>
        {/* 男性工員 (耳打ち) */}
        <MzEbFig id="111m" x={380} y={962} s={1} f={f} phase={2} lean={6} face={look > 0.5 ? "worried" : "normal"}
          gaze={look > 0.5 ? [6, -8] : [9, 0]}
          cloth={C.workerGray} clothDark={C.workerGrayDark} hat="hunting" vest={C.vestBrown}
          arms={[{ side: -1, rot: 193, len: 112, front: true, roll: true }, { side: 1, rot: 125, len: 70, front: true, roll: true }]} />
        {/* 女性工員 */}
        <MzEbFig id="111w" x={560} y={962} s={0.96} f={f} phase={9} lean={-5} face={surprised ? "surprised" : "normal"}
          gaze={look > 0.5 ? [6, -8] : [-8, 0]}
          cloth={C.femRed} clothDark={C.femRedDark} hat="kerchief" skirt="long" skirtColor={C.femWine} apron
          arms={[{ side: -1, rot: -32, len: 70, front: true }, { side: 1, rot: 32, len: 70, front: true }]} />
        {/* ひそひそ の線 */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${410 + i * 14} ${780 - i * 12 + whisperBob} q 20 -8 34 0`} stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round"
            opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i))} />
        ))}
        {/* 内緒の吹き出し (小さな時計と、シーッの指) */}
        {bub > 0 && (
          <g transform={`translate(470 ${560 + whisperBob}) scale(${pop(bub)})`}>
            <path d="M -110 -60 Q -110 -90 -80 -90 L 80 -90 Q 110 -90 110 -60 L 110 40 Q 110 70 80 70 L -40 70 L -70 104 L -60 70 L -80 70 Q -110 70 -110 40 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 8" />
            <MzEbDial x={-42} y={-10} r={44} minutes={480} />
            {/* 人さし指を立てた手 */}
            <g transform="translate(56 -6)">
              <rect x={-8} y={-62} width={16} height={56} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-24} y={-14} width={48} height={50} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -24 4 L 24 4 M -24 20 L 24 20" stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
              <rect x={-18} y={34} width={36} height={22} fill={C.workerGray} stroke={KRP.ink} strokeWidth={4} />
            </g>
          </g>
        )}
        {/* ちらり の視線 */}
        {look > 0 && (
          <g opacity={look * 0.8} stroke={KRP.yellow} strokeWidth={5} strokeDasharray="12 12" strokeLinecap="round">
            <line x1={420} y1={720} x2={840} y2={360} />
            <line x1={590} y1={730} x2={860} y2={390} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #112 工場の時計に細工をして、30分の昼休みを、27分に縮めていた。
// 格: 山 / seed 6112
// 絵: どこ: KoujouMon の門の上の大時計の裏側 (時計室の中)。歯車・振り子・油差し・梁の上のほこり。小窓の外に工場の煙突。演出: 黒い上着・山高帽・太った工場主 (懐中時計の鎖。実在の人物ではない一般の工場主なので顔あり、ただしずるい横目) がこっそり振り子の重りをずらす。カメラが時計の表側へ回り込むと、文字盤の上に昼休みの区画が赤い扇形で描かれ、「30分」の扇形がしゅっと縮んで「27分」になる (欠けた3分ぶんが小さなかけらになってぽろぽろ床へ落ちる)。下の中庭で弁当を食べていた工員たち (男女混ぜて3人) が、まだ半分残ったパンを持ったまま「え?」と顔を上げる。腕は2本 (工場主 pose="reach" で両手を振り子へ)。動き: f0-40 時計室で細工 / f40-60 カメラが表へパン / f60-90 扇形が30→27に縮み、3分のかけらが落ちる / f90-120 工員がパンを持ったまま見上げる (face="surprised")
// どこ: 左半分=門の上の大時計の裏 (時計室)。梁・歯車・振り子・油差し・ほこり・小窓の外に煙突。右半分=同じ時計の表と、門の内側で昼休みの工員
// 演出: 太った工場主 (山高帽・懐中時計の鎖) が横目でにやりとしながら、両手で振り子の重りをずりっとずらす。
//       カメラが表へ回り込むと、文字盤の昼休みの赤い扇形 (12時から30分) がしゅっと27分に縮み、欠けた3分のかけらがぽろぽろ落ちる。
//       下で半分かじったパンを持った工員3人 (男・女・男) が「え?」と見上げる。時計の横の小さな点検口から、工場主の目がのぞく
// 動き: f0-20 時計室で細工 / f18-30 表へパン / f28-38 扇形が縮む / f34-70 かけらが落ちる / f34-42 工員が見上げる / のぞく目
const Mz112: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 18, 30));
  const slide = easeOut(seg(f, 6, 18));
  const shrink = easeInOut(seg(f, 28, 38));
  const lunchMin = lerp(30, 27, shrink);
  const look = seg(f, 34, 40);
  const swing = Math.sin(f / 9) * 7;
  const sector = (r: number, m: number) => {
    const a = (m * 6 * Math.PI) / 180;
    return `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${m > 30 ? 1 : 0} 1 ${r * Math.sin(a)} ${-r * Math.cos(a)} Z`;
  };
  const CS = 1.2; // 表パネルのスケール (時計 960,300 を中心)
  return (
    <Frame f={f} seed={6112}>
      <g transform={`translate(${-1920 * pan} 0)`}>
        {/* ===== 左: 時計室 (裏側) ===== */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={MP.woodDark} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-40 + i * 170} y={-40} width={166} height={1160} fill={i % 2 ? MP.wood : "#A4744A"} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
        ))}
        {/* 小窓と煙突 */}
        <g>
          <rect x={120} y={140} width={240} height={200} fill={C.sky} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 220 340 L 232 200 L 268 200 L 280 340 Z" fill={MP.brick} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((j) => {
            const t = ((f / 90 + j / 3) % 1);
            return <circle key={j} cx={250 + t * 70} cy={196 - t * 50} r={12 + t * 22} fill="#8E8682" opacity={(1 - t) * 0.8} />;
          })}
          <path d="M 120 240 L 360 240 M 240 140 L 240 340" stroke={MP.woodDark} strokeWidth={8} />
          {/* 窓から差しこむ光と、ほこり */}
          <path d="M 360 160 L 900 520 L 900 900 L 360 340 Z" fill={MP.glow} opacity={0.16} />
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={420 + rnd(71, i) * 420 + Math.sin(f / 20 + i) * 10} cy={300 + rnd(72, i) * 400 + Math.cos(f / 17 + i) * 8} r={3} fill={KRP.white} opacity={0.7} />
          ))}
        </g>
        {/* 梁とほこり */}
        <rect x={-40} y={60} width={2000} height={46} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 200 60 q 30 -12 60 0 M 700 60 q 40 -14 80 0 M 1300 60 q 30 -10 70 0" stroke="#CFC6B6" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* 時計の裏 (文字盤の裏の大きな円) */}
        <circle cx={1450} cy={430} r={300} fill="#E9DFC8" stroke={KRP.ink} strokeWidth={8} />
        <circle cx={1450} cy={430} r={260} fill="none" stroke={MP.brassDark} strokeWidth={6} opacity={0.5} />
        {/* 歯車列 */}
        {([[1450, 430, 90, 16, 1], [1290, 300, 60, 12, -1.5], [1600, 290, 54, 10, -1.7], [1330, 560, 46, 10, 2]] as const).map(([gx, gy, gr, n, sp], i) => (
          <g key={i} transform={`translate(${gx} ${gy}) rotate(${f * sp})`}>
            {Array.from({ length: n }, (_, k) => (
              <rect key={k} x={-9} y={-gr - 14} width={18} height={20} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${(360 / n) * k})`} />
            ))}
            <circle r={gr} fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
            <circle r={gr * 0.6} fill="none" stroke={MP.brassDark} strokeWidth={5} />
            {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-gr * 0.6} x2={0} y2={gr * 0.6} stroke={MP.brassDark} strokeWidth={6} transform={`rotate(${a})`} />)}
            <circle r={10} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 振り子 (重りがずりっと下がる) */}
        <g transform={`rotate(${swing} 1100 300)`}>
          <rect x={1094} y={300} width={12} height={520} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={1100} cy={300} r={16} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(1100 ${lerp(720, 790, slide)})`}>
            <circle r={58} fill={MP.brass} stroke={KRP.ink} strokeWidth={6} />
            <circle r={36} fill="none" stroke={MP.brassLight} strokeWidth={6} />
            <path d="M -30 -28 Q -10 -44 14 -42" stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.6} />
          </g>
          {slide > 0 && slide < 1 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              <line x1={1180} y1={700} x2={1180} y2={760} />
              <line x1={1200} y1={720} x2={1200} y2={780} />
            </g>
          )}
        </g>
        {/* 油差しと工具の棚 */}
        <rect x={1700} y={760} width={240} height={18} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
        <g transform="translate(1760 760)">
          <path d="M -30 0 L -26 -50 L 26 -50 L 30 0 Z" fill={MP.ironLight} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 24 -40 L 80 -84" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={0} cy={-50} rx={26} ry={8} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <rect x={1860} y={720} width={14} height={40} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
        {/* 床 */}
        <rect x={-40} y={980} width={2000} height={140} fill="#6A4A2E" stroke={KRP.ink} strokeWidth={6} />
        {/* 工場主 (横目でにやり) */}
        <MzEbFig id="112b" x={790} y={966} s={1.12} f={f} phase={1} fat face="smile" gaze={[-10, 0]} lean={4}
          cloth={C.bossBlack} clothDark={C.bossBlackDark} hat="top" mustache chain vest="#5C4A3E"
          arms={[{ side: -1, rot: -80, len: 150, front: true }, { side: 1, rot: lerp(-96, -82, slide), len: 100, front: true }]} />
        {/* こっそり の汗と星 */}
        <path d={`M 700 ${560 + Math.sin(f / 4) * 4} q -10 14 0 22 q 10 -8 0 -22 Z`} fill="#9CC9E6" stroke={KRP.ink} strokeWidth={3} />

        {/* ===== 右: 時計の表と中庭 ===== */}
        <g transform="translate(1920 0)">
          <g transform={`translate(960 300) scale(${CS}) translate(-960 -300)`}>
            <KoujouMon f={f} gate={0} hands={720} smoke={0.7} sky={1.6} />
            {/* 昼休みの扇形 (文字盤の上) */}
            <g transform="translate(960 300)">
              <circle r={108} fill="#FBF6E8" />
              <path d={sector(104, lunchMin)} fill={KRP.red} opacity={0.5} stroke={KRP.red} strokeWidth={4} />
              <path d={sector(104, lunchMin)} fill="none" stroke={KRP.ink} strokeWidth={4} />
              {Array.from({ length: 12 }, (_, i) => (
                <text key={i} x={Math.sin((i * Math.PI) / 6) * 76} y={-Math.cos((i * Math.PI) / 6) * 76 + 7} textAnchor="middle" fontFamily="serif" fontWeight={800} fontSize={18} fill={KRP.ink}>{ROMAN[i]}</text>
              ))}
              <line x1={0} y1={8} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
              <line x1={0} y1={10} x2={0} y2={-88} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${(f % 60) * 0.1})`} />
              <circle r={7} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={2} />
            </g>
            {/* 欠けた3分のかけら (ぽろぽろ落ちる) */}
            {[0, 1, 2].map((i) => {
              const t = seg(f, 34 + i * 4, 60 + i * 6);
              if (t <= 0) return null;
              const a = ((28.5 - i) * 6 * Math.PI) / 180;
              const sx0 = 960 + 70 * Math.sin(a), sy0 = 300 - 70 * Math.cos(a);
              const yy = sy0 + t * t * (560 - i * 10);
              const bounce = t >= 1 ? Math.abs(Math.sin(f / 3 + i)) * 0 : 0;
              return (
                <g key={i} transform={`translate(${sx0 + t * (i - 1) * 50} ${Math.min(yy, 860) - bounce}) rotate(${t * 400 * (i % 2 ? 1 : -1)})`}>
                  <path d="M 0 0 L -12 -32 Q 0 -36 12 -32 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
                </g>
              );
            })}
            {/* 点検口からのぞく工場主の目 */}
            <g transform="translate(1130 210)">
              <rect x={-34} y={-24} width={68} height={48} rx={6} fill={MP.nightDeep} stroke={KRP.ink} strokeWidth={5} />
              <ellipse cx={-12} cy={0} rx={9} ry={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
              <ellipse cx={12} cy={0} rx={9} ry={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
              <circle cx={-12 + Math.sin(f / 12) * 4} cy={2} r={4} fill={KRP.ink} />
              <circle cx={12 + Math.sin(f / 12) * 4} cy={2} r={4} fill={KRP.ink} />
              <path d="M -24 -12 L 0 -6 M 24 -12 L 0 -6" stroke={KRP.ink} strokeWidth={3} />
            </g>
          </g>
          {/* 中庭で昼休みの工員 (木箱に腰かけ、半分のパン) */}
          {([[560, "m"], [960, "w"], [1360, "m2"]] as const).map(([wx, kind], i) => {
            const fem = kind === "w";
            return (
              <g key={i}>
                <rect x={wx - 80} y={898} width={160} height={84} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
                <path d={`M ${wx - 80} 940 L ${wx + 80} 940 M ${wx - 40} 898 L ${wx - 40} 982 M ${wx + 40} 898 L ${wx + 40} 982`} stroke={MP.woodDark} strokeWidth={4} />
                <MzEbFig id={`112w${i}`} x={wx} y={958} s={0.95} f={f} phase={i * 3 + 2} pose="sit"
                  face={look > 0.5 ? "surprised" : "smile"} gaze={look > 0.5 ? [i === 0 ? 6 : i === 2 ? -6 : 0, -9] : [0, 4]}
                  cloth={fem ? C.femRed : i === 0 ? C.workerGray : C.navy} clothDark={fem ? C.femRedDark : i === 0 ? C.workerGrayDark : C.navyDark}
                  hat={fem ? "kerchief" : "hunting"} skirt={fem ? "long" : "none"} skirtColor={C.femWine} apron={fem}
                  vest={!fem && i === 0 ? C.vestBrown : undefined}
                  arms={[{ side: -1, rot: -58, len: 64, front: true, roll: !fem }, { side: 1, rot: 58, len: 64, front: true, roll: !fem }]} />
                {/* 半分かじったパン */}
                <g transform={`translate(${wx} ${958 - 120 * 0.95 - 4 - look * 10})`}>
                  <path d="M -34 0 Q -36 -26 -6 -28 Q 14 -30 22 -18 Q 12 -14 18 -6 Q 10 -2 20 6 Q 0 14 -30 10 Z" fill={C.bread} stroke={KRP.ink} strokeWidth={4} />
                  <path d="M -20 -14 l 10 -6 M -8 -8 l 10 -6" stroke={MP.woodDark} strokeWidth={3} />
                </g>
                {look > 0 && <text x={wx + 70} y={640} fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.ink} opacity={look}>?</text>}
              </g>
            );
          })}
        </g>
      </g>
      <TagPlate x={1400} y={150} text="30分" size={50} t={seg(f, 24, 30)} />
      <XMark x={1400} y={150} s={0.9} t={seg(f, 34, 40)} />
      <TagPlate x={1400} y={270} text="27分" size={50} t={seg(f, 34, 40)} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #113 時計の針まで、他人のものでした。
// 格: 山 / seed 6113
// 絵: どこ: KoujouMon の門の上の大時計を、真正面から画面いっぱいに大写し (文字盤が短辺の2/3)。背景はくもった空と煙突の煙。演出: ★笑いどころ。文字盤の上から、工場主の巨大な手 (黒い袖・太い指・指輪・懐中時計の鎖がぶら下がる) がにゅっと下りてきて、長針を指でつまんで、ぐいっと勝手に動かす。下の門の前では、工員の男女が自分の懐中時計 (男性) と手首の小さな時計 (女性) を見比べて、針が合わずに首をかしげる。工員の時計の針も、上の巨大な手の動きにつられて勝手にくるっと回ってしまう (いちばんの事件)。腕は2本 (工員 pose="look" で両手で時計を持つ)。動き: f0-20 手が下りてくる / f20-60 長針をつまんでぐいっ (カメラが小さく揺れる) / f60-90 工員の時計の針もつられて回る / f90-120 工員二人が顔を見合わせる (face="worried")
// どこ: 門の上の大時計 (石の縁・真鍮の輪・ローマ数字) を真正面から大写し。後ろはくもり空と煙突の煙、門の鉄のアーチ
// 演出: ★笑いどころ。上から工場主の巨大な手 (黒い袖・白いカフス・太い指・金の指輪・袖から懐中時計の鎖) がにゅっと下り、
//       長針をつまんで 7時55分→8時10分 へぐいっと進める (カメラが揺れる)。下の左右で男女の工員が自分の時計
//       (男=懐中時計 / 女=手首の時計。頭上の丸い拡大窓に大写し) を見ていると、その針までつられてくるっと回る。二人は顔を見合わせる
// 動き: f0-12 手が下りる / f12-32 長針をぐいっ (揺れ) / f20-36 工員の時計もつられて回る / f34-42 顔を見合わせる / 以後 手が満足げに指をとんとん
const Mz113: React.FC<{ f: number }> = ({ f }) => {
  const CX = 960, CY = 410, R = 320;
  const down = easeOut(seg(f, 0, 12));
  const drag = easeInOut(seg(f, 12, 32));
  const mins = lerp(7 * 60 + 55, 8 * 60 + 10, drag);
  const follow = easeInOut(seg(f, 20, 36));
  const wMins = lerp(7 * 60 + 55, 8 * 60 + 10, follow);
  const shake = drag > 0 && drag < 1 ? Math.sin(f * 2.3) * 6 : 0;
  const lookEach = seg(f, 34, 40) > 0.5;
  const ma = ((mins % 60) * 6 * Math.PI) / 180;
  const tipX = CX + R * 0.78 * Math.sin(ma), tipY = CY - R * 0.78 * Math.cos(ma);
  const tap = f > 50 ? Math.max(0, Math.sin(f / 4)) * 8 : 0;
  const hy = lerp(-420, tipY, down);
  return (
    <Frame f={f} seed={6113}>
      <g transform={`translate(${shake} ${shake * 0.5})`}>
        {/* くもり空 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill="#B9BCC2" />
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={((i * 330 + f * 0.8) % 2300) - 200} cy={80 + (i % 3) * 120} rx={240} ry={70} fill="#A7AAB1" opacity={0.7} />
        ))}
        {/* 煙突と煙 (遠く) */}
        {[220, 1720].map((chx, i) => (
          <g key={chx}>
            <rect x={chx - 40} y={300} width={80} height={600} fill={MP.brickDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 5 }, (_, j) => {
              const t = ((f / 100 + j / 5 + i * 0.4) % 1);
              return <circle key={j} cx={chx + t * 200} cy={290 - t * 240} r={30 + t * 70} fill="#7D7672" opacity={(1 - t) * 0.6} />;
            })}
          </g>
        ))}
        {/* れんがの壁と門のアーチ */}
        <rect x={-40} y={640} width={2000} height={480} fill={MP.brick} />
        {Array.from({ length: 12 }, (_, r) => (
          <line key={r} x1={-40} y1={660 + r * 34} x2={1960} y2={660 + r * 34} stroke={MP.mortar} strokeWidth={3} opacity={0.7} />
        ))}
        <path d="M 400 900 Q 960 520 1520 900" stroke={MP.iron} strokeWidth={30} fill="none" />
        <path d="M 400 960 Q 960 600 1520 960" stroke={MP.iron} strokeWidth={14} fill="none" />
        {/* 大時計 */}
        <circle cx={CX} cy={CY} r={R * 1.24} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={10} />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={CX} y1={CY - R * 1.12} x2={CX} y2={CY - R * 1.24} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 15} ${CX} ${CY})`} />)}
        <MzEbDial x={CX} y={CY} r={R} minutes={mins} roman />
        <path d={`M ${CX - 220} ${CY - 180} Q ${CX - 120} ${CY - 290} ${CX} ${CY - 300}`} stroke={KRP.white} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.45} />
        {/* ぐいっ の動きの線 */}
        {drag > 0.05 && drag < 1 && (
          <path d={`M ${CX + R * 0.86 * Math.sin(ma - 0.5)} ${CY - R * 0.86 * Math.cos(ma - 0.5)} A ${R * 0.86} ${R * 0.86} 0 0 1 ${CX + R * 0.86 * Math.sin(ma - 0.08)} ${CY - R * 0.86 * Math.cos(ma - 0.08)}`}
            stroke={KRP.red} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
        )}
        {/* 工場主の巨大な手 (上から) */}
        <g transform={`translate(${tipX} ${hy - tap})`}>
          <path d="M -70 -150 L -90 -1200 L 90 -1200 L 70 -150 Z" fill={C.bossBlack} stroke={KRP.ink} strokeWidth={8} />
          <path d="M -40 -400 L -50 -1100" stroke={C.bossBlackDark} strokeWidth={10} />
          <rect x={-82} y={-178} width={164} height={42} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={50} cy={-158} r={9} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
          {/* 袖からぶら下がる懐中時計の鎖 */}
          <path d={`M 70 -200 Q ${110 + Math.sin(f / 6) * 10} -110 ${96 + Math.sin(f / 6) * 16} -40`} stroke={MP.brass} strokeWidth={6} fill="none" strokeDasharray="10 4" />
          <g transform={`translate(${96 + Math.sin(f / 6) * 16} -14)`}>
            <circle r={26} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
          {/* 手のひら・太い指 */}
          <path d="M -76 -140 Q -96 -60 -60 -24 L 50 -24 Q 90 -60 76 -140 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {[-46, -14, 18].map((fx) => <rect key={fx} x={fx} y={-44} width={30} height={46} rx={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />)}
          {/* つまむ親指と人さし指 (先が長針の先) */}
          <path d="M -66 -60 Q -70 -10 -18 4 L -6 -6 Q -40 -26 -40 -66 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 60 -40 Q 50 0 10 6 L 0 -6 Q 30 -14 32 -44 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-6} y={-38} width={30} height={14} rx={5} fill={MP.brass} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={9} cy={-31} r={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
        </g>
        {/* 下の工員 (左=男性・懐中時計 / 右=女性・手首の時計) */}
        <MzEbFig id="113m" x={300} y={1000} s={1.05} f={f} phase={2} face={follow > 0.4 ? "worried" : "normal"}
          gaze={lookEach ? [10, 0] : [0, 8]} lean={lookEach ? 6 : 0}
          cloth={C.workerGray} clothDark={C.workerGrayDark} hat="hunting" vest={C.vestBrown}
          arms={[{ side: -1, rot: -58, len: 66, front: true, roll: true }, { side: 1, rot: 58, len: 66, front: true, roll: true }]} />
        <g transform={`translate(300 ${1000 - 122 * 1.05})`}>
          <circle r={20} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -20 Q -30 -40 -50 -10" stroke={MP.brass} strokeWidth={4} fill="none" />
        </g>
        <MzEbFig id="113w" x={1620} y={1000} s={1.02} f={f} phase={5} face={follow > 0.4 ? "worried" : "normal"}
          gaze={lookEach ? [-10, 0] : [0, 8]} lean={lookEach ? -6 : 0}
          cloth={C.femRed} clothDark={C.femRedDark} hat="bonnet" skirt="long" skirtColor={C.femWine}
          arms={[{ side: -1, rot: -60, len: 70, front: true }, { side: 1, rot: 10 }]} />
        <rect x={1620 - 22} y={1000 - 140} width={40} height={20} rx={5} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
        {/* 拡大窓 (自分の時計がつられて回る) */}
        {([[300, 560, 1], [1620, 560, -1]] as const).map(([wx, wy, d], i) => (
          <g key={i}>
            <path d={`M ${wx - 20} ${wy + 80} L ${wx} ${wy + 110} L ${wx + 20} ${wy + 80}`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={wx} cy={wy} r={96} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <MzEbDial x={wx} y={wy} r={70} minutes={wMins} rim={i === 0 ? MP.brass : MP.brassLight} />
            {follow > 0 && follow < 1 && (
              <path d={`M ${wx + 84 * d} ${wy - 60} A 104 104 0 0 ${d === 1 ? 1 : 0} ${wx + 100 * d} ${wy + 20}`} stroke={KRP.red} strokeWidth={8} fill="none" strokeLinecap="round" />
            )}
            {i === 0 && <rect x={wx - 10} y={wy - 120} width={20} height={20} rx={4} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />}
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #114 次に、みんなの時刻をそろえたのは、鉄道です。
// 格: 山 / seed 6114
// 絵: どこ: 19世紀イギリスの駅のホーム。鉄骨とガラスの屋根・れんがの駅舎・ホームの柱に吊られた丸い駅の時計・ガス灯・線路。演出: 蒸気機関車 (黒い車体・赤い車輪・煙突から白い煙) が右から汽笛の白い湯気を上げてホームへ入ってくる。駅長 (紺の制服と帽子・男性) が懐中時計を高く掲げ、ホームの時計と見比べてうなずく。ホームの客 (男性はシルクハットと外套、女性はボンネット帽とくるぶしまでのスカート) が機関車に振り向く。カメラはホームの奥から手前へ、機関車と一緒に流れるように横パン。腕は2本 (駅長 pose="raise" で片手に懐中時計、片手は腰)。動き: f0-60 機関車が入ってくる・カメラが横パン / f40 煙がもくもく / f60-90 駅長が懐中時計を掲げる / f90-120 客が振り向く (face="surprised")
// どこ: 19世紀イギリスの駅のホーム。鉄骨のアーチとガラスの屋根・れんがの駅舎の壁 (アーチ窓)・屋根から吊った丸い駅の時計・ガス灯・ユニオンジャック
// 演出: 蒸気機関車 (黒い車体・赤い車輪・煙突の煙) と客車が右から汽笛の湯気を上げて入ってくる。駅長 (紺の制服と帽子) が懐中時計を高く掲げ、
//       吊り時計と見比べてうなずく。ホームの客 (シルクハットと外套の男性 / ボンネット帽とくるぶしまでのスカートの女性) が機関車へ振り向いて驚く
// 動き: f0-36 機関車が入って止まる (カメラも一緒に横パン) / f20-44 煙と汽笛の湯気がもくもく / f22-32 懐中時計を掲げる / f34-60 うなずく / f30-38 客が振り向く
const Mz114: React.FC<{ f: number }> = ({ f }) => {
  const arrive = easeOut(seg(f, 0, 36));
  const trainX = lerp(2500, 1180, arrive);
  const moving = 1 - arrive;
  const cam = easeInOut(seg(f, 0, 40));
  const camX = lerp(0, -330, cam);
  const raise = easeOut(seg(f, 22, 32));
  const nod = f > 34 && f < 70 ? Math.sin((f - 34) / 3) * 5 : 0;
  const turn = seg(f, 30, 38) > 0.5;
  const whistle = seg(f, 18, 30);
  const smokeAmt = 0.5 + 0.5 * seg(f, 20, 40);
  return (
    <Frame f={f} seed={6114}>
      <g transform={`translate(${camX} 0)`}>
        {/* 空 (屋根のガラスごし) */}
        <rect x={-100} y={-40} width={2900} height={600} fill={C.skyLight} />
        {/* 駅舎のれんが壁とアーチ窓 */}
        <MzEbBricks x={-100} y={180} w={2900} h={660} seed={14} />
        {Array.from({ length: 8 }, (_, i) => {
          const wx = 40 + i * 340;
          return (
            <g key={i}>
              <path d={`M ${wx} 560 L ${wx} 330 A 90 90 0 0 1 ${wx + 180} 330 L ${wx + 180} 560 Z`} fill={i % 3 === 1 ? "#E9C77A" : "#566079"} stroke={KRP.ink} strokeWidth={6} />
              <path d={`M ${wx + 90} 240 L ${wx + 90} 560 M ${wx} 420 L ${wx + 180} 420`} stroke={MP.woodDark} strokeWidth={5} />
              <rect x={wx - 14} y={556} width={208} height={18} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${wx - 10} 330 A 100 100 0 0 1 ${wx + 190} 330`} stroke={MP.stoneLight} strokeWidth={14} fill="none" />
            </g>
          );
        })}
        {/* 鉄骨とガラスの屋根 */}
        <rect x={-100} y={-40} width={2900} height={200} fill={C.glass} opacity={0.7} />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <path d={`M ${-100 + i * 320} 190 Q ${60 + i * 320} 40 ${220 + i * 320} 190`} stroke={MP.iron} strokeWidth={14} fill="none" />
            <line x1={60 + i * 320} y1={-40} x2={60 + i * 320} y2={115} stroke={MP.iron} strokeWidth={8} />
            {[0, 1, 2].map((k) => <line key={k} x1={-100 + i * 320 + k * 107} y1={-40} x2={-100 + i * 320 + k * 107} y2={150} stroke={MP.ironLight} strokeWidth={3} />)}
          </g>
        ))}
        <rect x={-100} y={170} width={2900} height={26} fill={MP.iron} stroke={KRP.ink} strokeWidth={5} />
        <MzEbUK x={1360} y={60} w={140} f={f} />
        <line x1={1360} y1={60} x2={1360} y2={175} stroke={KRP.ink} strokeWidth={6} />
        {/* 線路 (ホームの向こう) */}
        <rect x={-100} y={790} width={2900} height={60} fill="#5C534C" />
        {/* 機関車 */}
        <MzEbLoco x={trainX} y={880} f={f} moving={moving} whistle={whistle} />
        {/* 煙突の煙 (上へもくもく。走っている間は後ろへ流れる) */}
        {Array.from({ length: 8 }, (_, i) => {
          const t = ((f / 40 + i / 8) % 1);
          return (
            <circle key={i} cx={trainX + 110 + t * (60 + moving * 500)} cy={380 - t * 300} r={(30 + t * 70) * smokeAmt}
              fill={mixC(C.steam, "#B8B4B0", t)} stroke={KRP.ink} strokeWidth={3} strokeOpacity={0.5} opacity={(1 - t * 0.7)} />
          );
        })}
        {/* 屋根から吊った丸い駅の時計 */}
        <g transform={`rotate(${Math.sin(f / 18) * 1.5} 900 196)`}>
          <line x1={880} y1={196} x2={880} y2={250} stroke={MP.iron} strokeWidth={6} />
          <line x1={920} y1={196} x2={920} y2={250} stroke={MP.iron} strokeWidth={6} />
          <MzEbDial x={900} y={320} r={70} minutes={10 * 60 + Math.floor(f / 30)} rim={MP.iron} />
        </g>
        {/* ホーム (石の縁と板石) */}
        <rect x={-100} y={800} width={2900} height={300} fill="#B7AC9B" />
        <rect x={-100} y={800} width={2900} height={26} fill={MP.stoneLight} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-100 + i * 130} y1={826} x2={-160 + i * 130} y2={1100} stroke={MP.stoneDark} strokeWidth={3} />)}
        <line x1={-100} y1={940} x2={2800} y2={940} stroke={MP.stoneDark} strokeWidth={3} />
        {/* ガス灯 */}
        <g transform="translate(1500 0)">
          <rect x={286} y={420} width={16} height={560} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 254 380 L 334 380 L 322 444 L 266 444 Z" fill="#F7E2A8" stroke={KRP.ink} strokeWidth={5} />
          <path d="M 246 380 L 294 346 L 342 380 Z" fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
          <Flame x={294} y={430} s={0.7} f={f} />
        </g>
        {/* 客 (男性: シルクハットと外套 / 女性: ボンネット帽と長いスカート) */}
        <MzEbFig id="114p1" x={480} y={1000} s={1.0} f={f} phase={4} face={turn ? "surprised" : "normal"} gaze={turn ? [10, -2] : [-8, 0]} lean={turn ? 5 : 0}
          cloth="#4B4F5C" clothDark="#353842" hat="top" mustache tie={KRP.red}
          arms={[{ side: -1, rot: 8 }, { side: 1, rot: turn ? -40 : -6 }]} />
        <MzEbFig id="114p2" x={660} y={1000} s={0.95} f={f} phase={7} face={turn ? "surprised" : "smile"} gaze={turn ? [10, -2] : [-8, 0]} lean={turn ? 4 : 0}
          cloth={C.femPink} clothDark={C.femRed} hat="bonnet" skirt="long" skirtColor={C.femWine}
          arms={[{ side: -1, rot: -58, len: 64, front: true }, { side: 1, rot: 58, len: 64, front: true }]} />
        {/* 女性の手さげかばん */}
        <rect x={642} y={1000 - 118 * 0.95 - 4} width={36} height={30} rx={6} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 駅長 (懐中時計を掲げる) */}
        <g transform={`rotate(${nod} 1000 800)`}>
          <MzEbFig id="114s" x={1000} y={1000} s={1.08} f={f} phase={1} face={raise > 0.9 ? "smile" : "normal"} gaze={raise > 0.5 ? [-4, -9] : [6, 0]}
            cloth={C.navy} clothDark={C.navyDark} hat="station" buttons mustache
            arms={[{ side: -1, rot: 14 }, { side: 1, rot: lerp(0, -155, raise), len: 100 }]} />
        </g>
        {(() => {
          const [hx, hy] = handPos(1, lerp(0, -155, raise), 100);
          const px = 1000 + hx * 1.08, py = 1000 + hy * 1.08;
          return (
            <g transform={`rotate(${nod} 1000 800)`}>
              <path d={`M ${px} ${py} Q ${px - 30} ${py + 40} ${px - 50} ${py + 70}`} stroke={MP.brass} strokeWidth={4} fill="none" />
              <MzEbDial x={px} y={py - 30} r={24} minutes={600} />
              {raise > 0.9 && <path d={`M ${px + 40} ${py - 60} l 20 -14 M ${px + 44} ${py - 30} l 24 0`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />}
            </g>
          );
        })()}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #115 昔は、町ごとに、太陽に合わせた、ばらばらの時刻を使っていました。
// 格: 山 / seed 6115
// 絵: どこ: 19世紀前半のイギリスの田園を高い空から見下ろす俯瞰。丘・畑・川・3つの町 (左=東の町、中=真ん中の町、右=西の町)。それぞれの町の広場に教会の塔の時計。空の太陽が左から右へ動く。演出: 太陽が真上に来た町の塔の時計だけが12時を指し、ほかの町は11時50分台・12時10分台とずれている。3つの町の塔の時計が画面下にコマで大写しになり、針の位置がわざと全部ちがう。各町の広場で、町の人 (男女) が自分の町の塔を見上げて、それぞれ昼の鐘で手を止める (タイミングがばらばら)。札は町の時計の下に時刻の数字だけ「12:00」「11:50」「12:10」。カメラは俯瞰からゆっくり左→右にパンして太陽を追う。動き: f0-120 太陽が左から右へ移動 / 太陽が真上に来た町からぽん、ぽん、ぽんと鐘の音の線 / 町の人が順にお昼の手を止める
// どこ: 19世紀前半のイギリスの田園を高い空から見下ろす。丘・畑のつぎはぎ・曲がる川・道。左=東の町、中=真ん中の町、右=西の町。各町の広場に教会の塔の時計
// 演出: 太陽が左 (東) から右 (西) へ動き、真上に来た町の塔だけが12時になって鐘が鳴る (ぽん、ぽん、ぽん)。
//       画面下に3つの町の塔の時計を丸いコマで大写し。f45 の瞬間 (太陽が真ん中の町の真上) で「12:10」「12:00」「11:50」と針が全部ちがう。
//       各町の広場の男女が、自分の町の鐘でそれぞれ手を止めて塔を見上げる (タイミングがばらばら)
// 動き: f0-42 太陽が東の町→真ん中の町へ (f15 東の鐘 / f42 真ん中の鐘) / f45-80 太陽は真ん中の上 / f80- 西へ進み f110 西の鐘 / カメラは太陽を追って左→右
const Mz115: React.FC<{ f: number }> = ({ f }) => {
  const t = f < 42 ? (f - 42) / 2.7 : f < 80 ? 0 : (f - 80) / 3; // 真ん中の町の正午からの分
  const TOWNS = [
    { x: 520, off: 10, roof: "#B0543E" },
    { x: 1200, off: 0, roof: "#8C6A5A" },
    { x: 1880, off: -10, roof: "#9A5048" },
  ];
  const sunX = 1200 + t * 68;
  const camX = Math.max(-500, Math.min(0, 960 - sunX));
  const plateT = seg(f, 36, 42) * (1 - seg(f, 80, 88));
  const BELL = (i: number) => (i === 0 ? 15 : i === 1 ? 42 : 110);
  return (
    <Frame f={f} seed={6115}>
      <g transform={`translate(${camX} 0)`}>
        {/* 空 */}
        <rect x={-100} y={-40} width={2700} height={260} fill={C.sky} />
        {Array.from({ length: 5 }, (_, i) => (
          <ellipse key={i} cx={((i * 560 + f * 1.2) % 2800) - 150} cy={70 + (i % 2) * 60} rx={150} ry={36} fill={KRP.white} opacity={0.85} />
        ))}
        {/* 太陽 */}
        <g transform={`translate(${sunX} 90)`}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-70} x2={0} y2={-96} stroke={MP.brass} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 30 + f})`} />
          ))}
          <circle r={58} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={6} />
          <path d="M -24 -10 Q -16 -18 -8 -10 M 8 -10 Q 16 -18 24 -10 M -14 14 Q 0 26 14 14" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
        {/* 真上の光の柱 */}
        <path d={`M ${sunX - 30} 150 L ${sunX - 120} 470 L ${sunX + 120} 470 L ${sunX + 30} 150 Z`} fill={MP.glow} opacity={0.3} />
        {/* 大地 (遠くの丘 → 手前の畑) */}
        <rect x={-100} y={200} width={2700} height={900} fill={C.grass} />
        {[[-50, 230, 500], [700, 220, 600], [1500, 235, 520], [2200, 225, 500]].map(([hx, hy, hw], i) => (
          <ellipse key={i} cx={hx + hw / 2} cy={hy + 20} rx={hw / 1.6} ry={60} fill={C.grassDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {Array.from({ length: 16 }, (_, i) => {
          const fx = -100 + (i % 8) * 340 + (Math.floor(i / 8) ? 140 : 0);
          const fy = 300 + Math.floor(i / 8) * 150;
          return <path key={i} d={`M ${fx} ${fy} l 300 -10 l 20 120 l -310 14 Z`} fill={i % 3 === 0 ? C.field : i % 3 === 1 ? C.grass : "#B8C96E"} stroke={C.grassDark} strokeWidth={4} opacity={0.9} />;
        })}
        {/* 畝の線 */}
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-100 + i * 90} y1={310} x2={-60 + i * 90} y2={420} stroke={C.grassDark} strokeWidth={2} opacity={0.4} />)}
        {/* 川と道 */}
        <path d="M -100 520 C 300 440 500 600 900 520 S 1500 440 1800 540 S 2400 500 2700 470" stroke={C.river} strokeWidth={34} fill="none" />
        <path d="M -100 520 C 300 440 500 600 900 520 S 1500 440 1800 540 S 2400 500 2700 470" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.4} />
        <path d="M -100 390 L 2700 380" stroke={C.dirt} strokeWidth={14} strokeDasharray="40 10" />
        {/* 3つの町 */}
        {TOWNS.map((tw, i) => {
          const rang = f >= BELL(i);
          const ring = rang ? clamp01(1 - (f - BELL(i)) / 30) : 0;
          const clockMin = 12 * 60 + tw.off + t;
          return (
            <g key={i}>
              {/* 家々 */}
              {Array.from({ length: 7 }, (_, k) => {
                const hx = tw.x - 200 + (k % 4) * 110 + (k >= 4 ? 50 : 0);
                const hy = k >= 4 ? 470 : 410;
                return (
                  <g key={k}>
                    <rect x={hx} y={hy - 50} width={80} height={50} fill={k % 2 ? MP.mortar : KRP.white} stroke={KRP.ink} strokeWidth={4} />
                    <path d={`M ${hx - 8} ${hy - 50} L ${hx + 40} ${hy - 86} L ${hx + 88} ${hy - 50} Z`} fill={tw.roof} stroke={KRP.ink} strokeWidth={4} />
                    <rect x={hx + 30} y={hy - 30} width={18} height={30} fill={MP.woodDark} />
                  </g>
                );
              })}
              {/* 広場の教会の塔 */}
              <rect x={tw.x - 34} y={240} width={68} height={190} fill={MP.stone} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${tw.x - 42} 240 L ${tw.x} 150 L ${tw.x + 42} 240 Z`} fill={MP.stoneDark} stroke={KRP.ink} strokeWidth={5} />
              <MzEbDial x={tw.x} y={290} r={24} minutes={clockMin} rim={MP.brass} />
              <MzEbRing x={tw.x} y={290} r={44} amt={ring} f={f} />
              {/* 広場の男女 (自分の町の鐘で手を止める) */}
              {[-1, 1].map((d) => (
                <MzEbFig key={d} id={`115-${i}-${d}`} x={tw.x + d * 70} y={478} s={0.3} f={f} phase={i * 2 + d}
                  face={rang ? "smile" : "normal"} gaze={rang ? [0, -9] : [0, 6]} lean={rang ? 0 : 14 * d * Math.sin(f / 5)}
                  cloth={d < 0 ? C.workerGray : C.femRed} clothDark={d < 0 ? C.workerGrayDark : C.femRedDark}
                  hat={d < 0 ? "hunting" : "bonnet"} skirt={d < 0 ? "none" : "long"} skirtColor={C.femWine}
                  arms={rang ? [{ side: -1, rot: 0 }, { side: 1, rot: 165 }] : [{ side: -1, rot: -40 }, { side: 1, rot: 40 }]} />
              ))}
              {/* 下の丸いコマ (塔の時計の大写し) */}
              <line x1={tw.x} y1={330} x2={tw.x} y2={556} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 8" opacity={0.6} />
              <circle cx={tw.x} cy={656} r={112} fill={rang && ring > 0 ? MP.glow : KRP.white} stroke={KRP.ink} strokeWidth={7} />
              <MzEbDial x={tw.x} y={656} r={88} minutes={clockMin} rim={MP.stone} />
              <MzEbRing x={tw.x} y={656} r={118} amt={ring} f={f} />
            </g>
          );
        })}
        {/* 東と西の向き (方角の矢印) */}
        <g opacity={0.9}>
          <Arrow x={160} y={200} s={0.6} rot={180} color={KRP.white} />
          <Arrow x={2500} y={200} s={0.6} rot={0} color={KRP.white} />
          <text x={210} y={180} fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>東</text>
          <text x={2380} y={180} fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>西</text>
        </g>
      </g>
      <TagPlate x={280} y={784} text="12:10" size={38} t={plateT} />
      <TagPlate x={960} y={784} text="12:00" size={38} t={plateT} color={KRP.red} />
      <TagPlate x={1640} y={784} text="11:50" size={38} t={plateT} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #116 でも、それでは、時刻表が作れません。
// 格: 山 / seed 6116
// 絵: どこ: #114 の駅の駅長室。木の机・インク壺・羽根ペン・壁に3つの町の時計 (#115 のばらばらの時刻のまま)・窓の外にホームと機関車。演出: 駅長 (紺の制服) が大きな時刻表の紙に時刻を書き込もうとするが、壁の3つの時計がそれぞれ違う時刻を指しているので、書いては消し、書いては消し。時刻表の紙はインクの消し跡と×でぐちゃぐちゃ、丸めた紙くずが床に山になる。最後に駅長が頭を抱える (face="sad")。窓の外では機関車の機関士が「まだ?」と懐中時計を振る。腕は2本 (駅長 pose="write" で片手に羽根ペン、もう片手で頭をかく)。カメラは時刻表の紙に寄ってから、駅長の顔へ引く。動き: f0-40 書いて×を付ける (3回) / f40-80 紙くずが床に落ちて山になる / f80-120 頭を抱える・窓の外の機関士が時計を振る
// どこ: #114 の駅の駅長室。しま模様の壁紙と腰板・壁に3つの町の時計 (#115 と同じ 12:10 / 12:00 / 11:50 のばらばら)・
//       木の机 (インク壺・羽根ペン・ランプ)・窓の外にホームと機関車 (運転室の機関士)。机の脇にくずかご
// 演出: 駅長が大きな時刻表の紙に書こうとしては壁の3つの時計を見比べ、×を付ける (3回)。丸めた紙くずがくずかごからあふれて床に山になる。
//       駅長は片手でペン、片手で頭をかき、最後は頭を抱えて泣き顔。窓の外の機関士が「まだ?」と懐中時計を振る
// 動き: f0-34 書いて×を付ける (f8/f20/f32) / f14-42 紙くずが飛んで山になる / f0-40 カメラは紙の寄り→駅長の顔へ引く / f34- 頭を抱える・機関士が時計を振る
const Mz116: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeInOut(seg(f, 4, 40));
  const sc = lerp(1.7, 1, pull);
  const cx = lerp(930, 960, pull), cy = lerp(820, 540, pull);
  const despair = f >= 34;
  const PX = 840, PY = 990, PS = 1.45;
  const bob = Math.sin((f + 1 * 17) / 13) * 3;
  const writing = f < 34;
  const scrib = writing ? Math.sin(f * 1.4) * 8 : 0;
  const balls = Math.floor(seg(f, 14, 42) * 9);
  const shakeW = Math.sin(f / 2) * 22;
  const clocks = [[330, 12 * 60 + 10], [620, 12 * 60], [910, 11 * 60 + 50]] as const;
  return (
    <Frame f={f} seed={6116}>
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* 壁紙 (しま) と腰板 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill="#E6D9B8" />
        {Array.from({ length: 34 }, (_, i) => <rect key={i} x={-40 + i * 60} y={-40} width={26} height={700} fill="#D7C59C" />)}
        <rect x={-40} y={600} width={2000} height={500} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200} y={630} width={170} height={140} rx={6} fill="none" stroke={MP.woodDark} strokeWidth={5} />)}
        {/* 壁の3つの時計 (ばらばら) */}
        {clocks.map(([x, m], i) => (
          <g key={i}>
            <line x1={x} y1={20} x2={x} y2={80} stroke={MP.woodDark} strokeWidth={5} />
            <rect x={x - 100} y={70} width={200} height={230} rx={20} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
            <MzEbDial x={x} y={180} r={78} minutes={m + Math.floor(f / 30)} rim={MP.brass} />
          </g>
        ))}
        {/* 時計を見比べる目線 (書く前に) */}
        {writing && (
          <path d={`M ${PX - 10} 600 Q ${clocks[Math.floor(f / 6) % 3][0]} 380 ${clocks[Math.floor(f / 6) % 3][0]} 270`} stroke={KRP.yellow} strokeWidth={5} strokeDasharray="10 10" fill="none" opacity={0.85} />
        )}
        {/* 窓の外: ホームと機関車 */}
        <defs><clipPath id="mzeb116win"><rect x={1220} y={90} width={620} height={470} /></clipPath></defs>
        <rect x={1220} y={90} width={620} height={470} fill={C.skyLight} stroke={KRP.ink} strokeWidth={8} />
        <g clipPath="url(#mzeb116win)">
          <rect x={1220} y={420} width={620} height={140} fill="#B7AC9B" />
          <g transform="translate(1260 520) scale(0.42)">
            <MzEbLoco x={0} y={0} f={f} />
          </g>
        </g>
        {/* 運転室の機関士 (懐中時計を振る) */}
        <MzEbFig id="116d" x={1530} y={460} s={0.36} f={f} phase={4} face="angry" gaze={[-8, 0]}
          cloth={C.navy} clothDark={C.navyDark} hat="derby" hatColor={MP.iron}
          arms={[{ side: -1, rot: 8 }, { side: 1, rot: 150 + shakeW * 0.6 }]} />
        {(() => {
          const [hx, hy] = handPos(1, 150 + shakeW * 0.6);
          return <circle cx={1530 + hx * 0.36} cy={460 + hy * 0.36 - 8} r={11} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />;
        })()}
        {f > 30 && <text x={1590} y={340} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.red}>?</text>}
        <path d="M 1530 90 L 1530 560 M 1220 300 L 1840 300" stroke={MP.woodDark} strokeWidth={9} />
        {/* 駅長 (机の向こうに座る) */}
        <MzEbFig id="116s" x={PX} y={PY} s={PS} f={f} phase={1} face={despair ? "sad" : f % 12 < 6 ? "worried" : "normal"}
          gaze={writing ? [(Math.floor(f / 6) % 3 - 1) * 9, -8] : [0, 6]} lean={despair ? -4 : 0}
          cloth={C.navy} clothDark={C.navyDark} hat="station" buttons mustache sweat arms={[]} />
        {/* 机 */}
        <path d="M 120 800 L 1500 800 L 1560 890 L 60 890 Z" fill={MP.woodLight} stroke={KRP.ink} strokeWidth={7} />
        <rect x={60} y={890} width={1500} height={220} fill={MP.wood} stroke={KRP.ink} strokeWidth={7} />
        {[300, 800, 1300].map((dx) => <rect key={dx} x={dx - 90} y={920} width={180} height={70} rx={6} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 時刻表の紙 (ぐちゃぐちゃ) */}
        <path d="M 640 808 L 1100 808 L 1120 882 L 620 882 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2, 3].map((r) => <line key={r} x1={634 - r * 4} y1={822 + r * 17} x2={1106 + r * 4} y2={822 + r * 17} stroke={KRP.blueSoft} strokeWidth={3} />)}
        {[0, 1, 2].map((k) => {
          const on = seg(f, 4 + k * 12, 10 + k * 12);
          const x0 = 700 + k * 140;
          return (
            <g key={k}>
              <path d={`M ${x0} 840 q 10 -14 20 0 t 20 0 t 20 0 M ${x0} 862 q 10 -12 20 0 t 20 0`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={seg(f, k * 12, 4 + k * 12)} />
              {on > 0 && <XMark x={x0 + 30} y={850} s={0.42 * on} t={on} color={KRP.ink} />}
            </g>
          );
        })}
        {/* インク壺・ランプ */}
        <g transform="translate(1260 830)">
          <path d="M -30 0 L -26 -40 L 26 -40 L 30 0 Z" fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-52} width={32} height={14} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="translate(470 830)">
          <rect x={-36} y={-20} width={72} height={20} rx={6} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -26 -20 Q -40 -80 0 -110 Q 40 -80 26 -20 Z" fill="#F7E2A8" stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          <Flame x={0} y={-50} s={0.5} f={f} />
        </g>
        {/* 駅長の腕 (机の上に出る層) */}
        <g transform={`translate(${PX} ${PY + bob}) scale(${PS})`}>
          {(() => {
            const rr = despair ? 176.5 : -10 + scrib * 0.6;
            const len = despair ? 114 : 52;
            const lr = 183.5;
            const ll = 114;
            const [rx, ry] = handPos(1, rr, len);
            const [lx, ly] = handPos(-1, lr, ll);
            return (
              <g>
                <rect x={56} y={-148} width={22} height={len} rx={11} fill={C.navy} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${rr} 67 -148)`} />
                <rect x={-78} y={-148} width={22} height={ll} rx={11} fill={C.navy} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${lr} -67 -148)`} />
                <circle cx={rx} cy={ry} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={lx} cy={ly} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                {/* 羽根ペン */}
                {!despair && (
                  <g transform={`translate(${rx} ${ry}) rotate(30)`}>
                    <path d="M 0 0 L 4 -70 Q 20 -110 10 -150 Q -14 -100 -4 -70 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                    <line x1={0} y1={0} x2={2} y2={14} stroke={KRP.ink} strokeWidth={4} />
                  </g>
                )}
                {/* 頭をかく線 */}
                {!despair && <path d={`M ${lx - 30} ${ly - 20} l -12 -10 M ${lx - 34} ${ly} l -16 0`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={Math.abs(Math.sin(f / 2))} />}
              </g>
            );
          })()}
        </g>
        {/* 床の紙くずの山 (机の左手前) */}
        <g>
          <path d="M 80 1000 L 100 1080 L 220 1080 L 240 1000 Z" fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: balls }, (_, i) => {
            const bx = 160 + (i % 4 - 1.5) * 44 + (i >= 4 ? 20 : 0);
            const by = 990 - Math.floor(i / 4) * 34;
            return <circle key={i} cx={bx} cy={by} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />;
          })}
          {/* 飛んでいく最中の紙くず */}
          {f >= 14 && f < 44 && (() => {
            const k = ((f - 14) % 4) / 4;
            return <circle cx={lerp(800, 170, k)} cy={lerp(800, 960, k) - Math.sin(k * Math.PI) * 220} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />;
          })()}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #117 1840年代、イギリスの鉄道は、ロンドンの時刻にそろえはじめます。
// 格: 山 / seed 6117
// 絵: どこ: 1840年代のイギリスの地図を描いた駅舎の大きな壁画 (古い羊皮紙色の地図・海の波の模様・線路が黒い線で伸びる)。右下にロンドン。手前に年代札「1840年代」。演出: ロンドンの駅の時計から、線路に沿って光の波 (金色の線) が西や北の町へ走っていく。光が届いた町の小さな駅の時計の針が、くるっと回ってロンドンと同じ時刻にカチッとそろう。そろうたびに、その駅の駅長 (小さな紺の制服の人) が懐中時計を合わせる。カメラはロンドンから光の波を追って地図の上を左上へパン。動き: f0-20 年代札 / f20-120 光が線路を走る (3本) / 光が届いた駅の針がくるっ・カチッ (4か所) / 駅長が順に時計を合わせる
// どこ: 駅舎の大きな壁画 = 1840年代のイギリスの地図 (古い羊皮紙色・海の波の模様・方位の飾り・額縁)。ブリテン島とアイルランドの形。右下にロンドン
// 演出: ロンドンの駅の時計から、線路 (黒い線と枕木) に沿って金色の光が3本、西 (ブリストル方面)・北西 (バーミンガム→リバプール方面)・北 (ヨーク方面) へ走る。
//       光が届いた4つの駅の小さな時計が、くるっと回ってロンドンと同じ10時にカチッとそろい、その駅の小さな駅長 (紺の制服) が懐中時計を合わせてにっこり
// 動き: f0-10 年代札 / f10-37 光が線路を走る (速さ一定) / 届いた駅から順に針がくるっ・カチッ (f25〜f37) / カメラはロンドンの寄りから左上へパン / 以後 光が脈打つ
type MzEbPt = [number, number];
const mzebLen = (pts: MzEbPt[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const mzebPartial = (pts: MzEbPt[], d: number): MzEbPt[] => {
  const out: MzEbPt[] = [pts[0]];
  let left = d;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const l = Math.hypot(bx - ax, by - ay);
    if (left >= l) { out.push(pts[i]); left -= l; continue; }
    if (left > 0) out.push([ax + ((bx - ax) * left) / l, ay + ((by - ay) * left) / l]);
    break;
  }
  return out;
};
const mzebD = (pts: MzEbPt[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
// 経度・緯度 → 地図の座標
const mzebGeo = (lon: number, lat: number): MzEbPt => [1164 + lon * 51, 5049.5 - lat * 85];
const MZEB_GB: MzEbPt[] = ([
  [-5.0, 58.6], [-3.0, 58.65], [-3.1, 58.4], [-4.0, 57.9], [-3.6, 57.65], [-2.0, 57.7], [-2.1, 57.1], [-2.6, 56.5], [-3.0, 56.4],
  [-2.6, 56.05], [-3.2, 56.0], [-2.0, 55.8], [-1.6, 55.3], [-1.4, 54.9], [-1.2, 54.6], [-0.5, 54.4], [-0.1, 54.1], [0.1, 53.6],
  [-0.3, 53.5], [0.3, 53.1], [0.0, 52.9], [0.9, 52.95], [1.7, 52.6], [1.6, 52.1], [0.9, 51.8], [0.6, 51.5], [1.4, 51.35],
  [1.3, 51.1], [0.3, 50.75], [-0.8, 50.75], [-1.5, 50.7], [-2.5, 50.6], [-3.5, 50.6], [-4.2, 50.35], [-5.7, 50.05], [-5.0, 50.5],
  [-4.2, 51.0], [-3.0, 51.2], [-2.7, 51.5], [-3.2, 51.45], [-4.2, 51.6], [-5.2, 51.75], [-4.4, 52.2], [-4.1, 52.8], [-4.7, 52.8],
  [-4.4, 53.3], [-3.3, 53.35], [-3.0, 53.5], [-3.0, 54.0], [-3.6, 54.5], [-3.3, 54.95], [-4.4, 54.7], [-5.1, 54.8], [-4.9, 55.5],
  [-4.8, 55.95], [-5.6, 55.3], [-5.7, 56.5], [-6.2, 56.8], [-5.7, 57.3], [-5.8, 57.9],
] as const).map(([a, b]) => mzebGeo(a, b));
const MZEB_IE: MzEbPt[] = ([
  [-6.0, 55.2], [-7.3, 55.4], [-8.5, 54.7], [-10.0, 54.2], [-9.9, 53.4], [-9.6, 52.6], [-10.3, 52.1], [-9.5, 51.6], [-8.0, 51.8],
  [-6.4, 52.2], [-6.0, 53.0], [-6.2, 53.6], [-5.5, 54.4],
] as const).map(([a, b]) => mzebGeo(a, b));

const Mz117: React.FC<{ f: number }> = ({ f }) => {
  const LON = mzebGeo(-0.12, 51.5);
  const BRI = mzebGeo(-2.6, 51.45), BIR = mzebGeo(-1.9, 52.48), LIV = mzebGeo(-2.98, 53.4), YOR = mzebGeo(-1.08, 53.96);
  const LINES: MzEbPt[][] = [
    [LON, mzebGeo(-1.0, 51.45), BRI],
    [LON, mzebGeo(-0.8, 52.0), BIR, mzebGeo(-2.3, 53.0), LIV],
    [LON, mzebGeo(-0.3, 52.6), mzebGeo(-1.2, 53.0), YOR],
  ];
  const SPEED = 8;
  const dist = Math.max(0, (f - 10) * SPEED);
  const STATIONS: { p: MzEbPt; line: number; at: number; off: number; side: 1 | -1 }[] = [
    { p: BRI, line: 0, at: mzebLen(LINES[0]), off: -10, side: -1 },
    { p: BIR, line: 1, at: mzebLen(LINES[1].slice(0, 3)), off: -7, side: -1 },
    { p: LIV, line: 1, at: mzebLen(LINES[1]), off: -12, side: -1 },
    { p: YOR, line: 2, at: mzebLen(LINES[2]), off: -4, side: 1 },
  ];
  const cam = easeInOut(seg(f, 0, 40));
  const sc = lerp(1.6, 1.25, cam);
  const cx = lerp(LON[0], 1080, cam), cy = lerp(LON[1], 520, cam);
  const pulse = 0.7 + 0.3 * Math.sin(f / 4);
  return (
    <Frame f={f} seed={6117} bg={MP.brickDark}>
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* 駅舎の壁 (れんが) と額縁 */}
        <MzEbBricks x={-300} y={-300} w={2600} h={1700} seed={17} />
        <rect x={250} y={10} width={1420} height={860} rx={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={274} y={34} width={1372} height={812} fill={C.sea} stroke={KRP.ink} strokeWidth={5} />
        {/* 海の波の模様 */}
        {Array.from({ length: 13 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
          <path key={`${r}-${c}`} d={`M ${300 + c * 115 + (r % 2) * 55} ${70 + r * 60} q 14 -12 28 0 q 14 -12 28 0`} stroke={C.seaDark} strokeWidth={4} fill="none" opacity={0.8} />
        )))}
        {/* 古い紙のしみ */}
        {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={360 + rnd(171, i) * 1200} cy={80 + rnd(172, i) * 700} rx={60 + rnd(173, i) * 60} ry={40} fill={C.parchmentDark} opacity={0.25} />)}
        {/* 陸 */}
        <path d={mzebD(MZEB_IE) + " Z"} fill={C.land} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={mzebD(MZEB_GB) + " Z"} fill={C.parchment} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* 山の模様 (北と西) */}
        {([[-4.5, 57.0], [-3.8, 56.8], [-4.2, 56.3], [-3.6, 52.6], [-3.1, 54.4], [-2.1, 54.2]] as const).map(([lo, la], i) => {
          const [mx, my] = mzebGeo(lo, la);
          return <path key={i} d={`M ${mx - 18} ${my + 10} L ${mx} ${my - 14} L ${mx + 18} ${my + 10}`} fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={3} />;
        })}
        {/* 方位の飾り */}
        <g transform="translate(1500 180)">
          <circle r={62} fill={C.parchment} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 -56 L 12 0 L 0 56 L -12 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -56 0 L 0 12 L 56 0 L 0 -12 Z" fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={3} />
          <text x={0} y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>N</text>
        </g>
        {/* 線路 (黒い線と枕木) */}
        {LINES.map((pts, i) => (
          <g key={i}>
            <path d={mzebD(pts)} stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinejoin="round" />
            <path d={mzebD(pts)} stroke={KRP.ink} strokeWidth={16} fill="none" strokeDasharray="3 12" strokeLinejoin="round" />
          </g>
        ))}
        {/* 金色の光の波 */}
        {LINES.map((pts, i) => {
          const part = mzebPartial(pts, dist);
          if (part.length < 2) return null;
          const head = part[part.length - 1];
          const done = dist >= mzebLen(pts);
          return (
            <g key={i}>
              <path d={mzebD(part)} stroke={C.gold} strokeWidth={done ? 9 * pulse : 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {!done && (
                <g>
                  <circle cx={head[0]} cy={head[1]} r={18} fill={MP.glow} opacity={0.7} />
                  <circle cx={head[0]} cy={head[1]} r={9} fill={KRP.white} stroke={C.gold} strokeWidth={3} />
                </g>
              )}
            </g>
          );
        })}
        {/* ロンドンの駅の時計 */}
        <circle cx={LON[0]} cy={LON[1]} r={50 + 10 * pulse} fill={MP.glow} opacity={0.35} />
        <MzEbDial x={LON[0]} y={LON[1]} r={38} minutes={600} rim={KRP.red} />
        {/* 4つの駅: 小さな時計と駅長 */}
        {STATIONS.map((st, i) => {
          const arrived = dist >= st.at;
          const tA = 10 + st.at / SPEED;
          const spin = easeOut(seg(f, tA, tA + 5));
          const m = arrived ? lerp(600 + st.off - 60, 600, spin) : 600 + st.off;
          const click = arrived ? clamp01(1 - (f - tA - 5) / 10) : 0;
          const [sx, sy] = st.p;
          const mx = sx + st.side * 54;
          return (
            <g key={i}>
              <circle cx={sx} cy={sy} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <MzEbDial x={sx} y={sy - 44} r={24} minutes={m} rim={arrived && spin >= 1 ? C.gold : MP.iron} />
              {click > 0 && (
                <g stroke={C.gold} strokeWidth={5} strokeLinecap="round" opacity={click}>
                  {Array.from({ length: 8 }, (_, k) => {
                    const a = (k * Math.PI) / 4;
                    return <line key={k} x1={sx + Math.cos(a) * 34} y1={sy - 44 + Math.sin(a) * 34} x2={sx + Math.cos(a) * 46} y2={sy - 44 + Math.sin(a) * 46} />;
                  })}
                </g>
              )}
              <MzEbFig id={`117s${i}`} x={mx} y={sy + 26} s={0.22} f={f} phase={i * 3}
                face={arrived && spin >= 1 ? "smile" : "normal"} gaze={[0, 6]}
                cloth={C.navy} clothDark={C.navyDark} hat="station" pose="hold" />
              <circle cx={mx} cy={sy + 26 - 118 * 0.22 - 2} r={5} fill={MP.brass} stroke={KRP.ink} strokeWidth={1.5} />
            </g>
          );
        })}
        <TagPlate x={1300} y={700} text="ロンドン" size={34} t={1} rot={-2} />
      </g>
      <TagPlate x={300} y={190} text="1840年代" size={52} t={seg(f, 0, 10)} rot={-3} />
    </Frame>
  );
};


// -------------------------------------------------------------------
// #118 アメリカでは、1883年11月18日、鉄道会社が、国の時刻を、いくつかの帯にまとめました。
// 格: 図 / seed 6118
// 絵: どこ: 1883年のアメリカの鉄道会社の会議室の壁に貼られた大きな北アメリカ大陸の地図 (古い紙・西に山脈の模様・東に大西洋)。手前に木の長机とランプ。年代札「1883年11月18日」。演出: 地図の上に、上から縦に色の帯が4本、ペンキのローラーで塗るように順に下りてくる (東から橙・黄・緑・青)。帯の境目でぎざぎざしていた町ごとの小さな時計の群れ (帯が来る前は30個ほどの針がばらばら) が、帯が通ると帯ごとに同じ向きにそろう。机の前で、鉄道会社の男性 (黒い上着・顔は普通の一般人、後ろ姿寄り) が長い指し棒で帯を指す。腕は2本 (pose="point")。カメラは地図全景から東の帯へ寄る。動き: f0-20 年代札 / f20-100 帯が1本ずつ下りる / 帯が通るたび時計の針がそろう / f100-150 東の帯へ寄る
// どこ: 1883年のアメリカの鉄道会社の会議室。板張りの壁に、額に入った大きな北アメリカの地図 (古い紙・西の山脈の模様・東に大西洋・五大湖・メキシコ湾)。手前に木の長机とランプ
// 演出: 地図の上に、上からペンキのローラーで塗るように色の帯が4本、東から順に下りてくる (橙・黄・緑・青)。
//       帯が来る前は町ごとの小さな時計30個の針がばらばら。帯のローラーが通ると、その帯の時計の針がぴたっと同じ向きにそろう (分針は全部12、時針は帯ごとに1時間ずつ)。
//       机の前で、鉄道会社の男性 (黒い上着・後ろ姿) が長い指し棒で東の帯を指す
// 動き: f0-10 年代札 / f8-42 帯が1本ずつ下りる (橙 f8 / 黄 f16 / 緑 f24 / 青 f32) / ローラーが通った時計がそろう / f60-120 東の帯へ寄る / 以後 そろった時計が一緒に進む
const mzebUS = (lon: number, lat: number): MzEbPt => [960 + (lon + 96) * 25, 60 + (52 - lat) * 27];
const MZEB_US: MzEbPt[] = ([
  [-124.7, 48.4], [-124.1, 46.2], [-124.0, 43.0], [-124.2, 41.8], [-123.8, 39.8], [-122.5, 37.8], [-121.9, 36.6], [-120.6, 34.6], [-118.4, 34.0], [-117.1, 32.5],
  [-114.7, 32.7], [-111.1, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6], [-103.2, 29.0], [-101.4, 29.8], [-99.5, 27.5], [-97.4, 25.9],
  [-97.4, 27.8], [-95.0, 29.3], [-93.8, 29.7], [-91.0, 29.2], [-89.4, 29.0], [-89.6, 30.2], [-88.0, 30.6], [-85.4, 29.7], [-84.0, 30.1], [-82.7, 28.0], [-81.8, 26.1], [-80.4, 25.2],
  [-80.0, 26.8], [-80.6, 28.4], [-81.4, 30.6], [-80.9, 32.1], [-79.0, 33.6], [-76.5, 34.7], [-75.5, 35.5], [-76.0, 37.0], [-75.2, 38.0], [-74.0, 39.6], [-74.0, 40.6],
  [-72.0, 41.0], [-70.0, 41.6], [-70.5, 42.6], [-70.6, 43.1], [-69.0, 44.1], [-67.0, 44.8],
  [-67.8, 47.1], [-69.2, 47.4], [-70.9, 45.3], [-74.7, 45.0], [-76.5, 44.2], [-79.0, 43.3], [-79.2, 42.5], [-82.5, 41.7], [-83.1, 42.3], [-82.4, 43.0], [-84.0, 46.5],
  [-88.0, 48.0], [-89.6, 48.0], [-95.2, 49.0], [-123.0, 49.0],
] as const).map(([a, b]) => mzebUS(a, b));
const MZEB_CA: MzEbPt[] = ([
  [-123.0, 49.0], [-95.2, 49.0], [-89.6, 48.0], [-88.0, 48.0], [-84.0, 46.5], [-82.4, 43.0], [-83.1, 42.3], [-82.5, 41.7], [-79.2, 42.5], [-79.0, 43.3],
  [-76.5, 44.2], [-74.7, 45.0], [-70.9, 45.3], [-69.2, 47.4], [-67.8, 47.1], [-67.0, 44.8], [-64.5, 45.5], [-61.0, 45.5], [-60.0, 47.0], [-64.0, 49.0], [-66.0, 50.2], [-60.0, 50.5], [-56.0, 52.0], [-56.0, 54.0],
  [-131.0, 54.0], [-130.0, 52.5], [-127.5, 50.5], [-124.7, 48.4],
] as const).map(([a, b]) => mzebUS(a, b));
const MZEB_MX: MzEbPt[] = ([
  [-117.1, 32.5], [-115.5, 28.5], [-112.5, 25.5], [-110.0, 22.0], [-97.7, 22.0], [-97.4, 25.9], [-99.5, 27.5], [-101.4, 29.8], [-103.2, 29.0], [-104.5, 29.6],
  [-106.5, 31.8], [-108.2, 31.3], [-111.1, 31.3], [-114.7, 32.7],
] as const).map(([a, b]) => mzebUS(a, b));
const MZEB_LAKES: MzEbPt[][] = [
  [[-92.0, 46.7], [-89.0, 46.8], [-84.6, 46.5], [-85.0, 47.4], [-89.0, 48.2]],
  [[-87.8, 42.0], [-86.6, 42.2], [-85.8, 45.6], [-87.4, 45.4], [-87.9, 43.5]],
  [[-84.0, 43.8], [-82.5, 43.2], [-81.2, 45.4], [-83.6, 46.0]],
  [[-83.4, 41.6], [-81.0, 41.8], [-79.0, 42.7], [-81.5, 42.4]],
].map((l) => (l as [number, number][]).map(([a, b]) => mzebUS(a, b)));
// 帯の境 (経度)。東から: 橙 / 黄 / 緑 / 青
const MZEB_ZONES = [
  { from: -87.5, to: -60, color: C.zoneOrange, hour: 12, at: 8 },
  { from: -102, to: -87.5, color: C.zoneYellow, hour: 11, at: 16 },
  { from: -114.5, to: -102, color: C.zoneGreen, hour: 10, at: 24 },
  { from: -132, to: -114.5, color: C.zoneBlue, hour: 9, at: 32 },
];

const Mz118: React.FC<{ f: number }> = ({ f }) => {
  const zoom = easeInOut(seg(f, 60, 120));
  const sc = lerp(1, 1.55, zoom);
  const cx = lerp(960, 1420, zoom), cy = lerp(540, 450, zoom);
  const MAPT = 60, MAPB = 800;
  // 町の小さな時計 (30個)
  const towns = Array.from({ length: 30 }, (_, i) => {
    const lon = -122 + rnd(181, i) * 50;
    const lat = 30.5 + rnd(182, i) * 16.5;
    return { lon, lat, rand: Math.floor(rnd(183, i) * 720) };
  }).filter((t) => !(t.lon < -118 && t.lat < 35) && !(t.lon > -80 && t.lat < 33));
  const drop = (z: typeof MZEB_ZONES[number]) => easeInOut(seg(f, z.at, z.at + 10));
  const tick = f > 60 ? (f - 60) * 0.25 : 0;
  return (
    <Frame f={f} seed={6118} bg={MP.woodDark}>
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* 板張りの壁 */}
        <rect x={-300} y={-300} width={2600} height={1700} fill={MP.wood} />
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-300 + i * 140} y1={-300} x2={-300 + i * 140} y2={1400} stroke={MP.woodDark} strokeWidth={5} />)}
        {/* 額縁と地図 */}
        <rect x={160} y={30} width={1600} height={800} rx={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={8} />
        <defs><clipPath id="mzeb118map"><rect x={186} y={MAPT} width={1548} height={MAPB - MAPT} /></clipPath></defs>
        <g clipPath="url(#mzeb118map)">
          <rect x={186} y={MAPT} width={1548} height={MAPB - MAPT} fill={C.sea} />
          {Array.from({ length: 12 }, (_, r) => Array.from({ length: 14 }, (_, c) => (
            <path key={`${r}-${c}`} d={`M ${200 + c * 112 + (r % 2) * 56} ${90 + r * 62} q 12 -10 24 0 q 12 -10 24 0`} stroke={C.seaDark} strokeWidth={4} fill="none" opacity={0.7} />
          )))}
          <path d={mzebD(MZEB_CA) + " Z"} fill={C.land} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d={mzebD(MZEB_MX) + " Z"} fill={C.land} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d={mzebD(MZEB_US) + " Z"} fill={C.parchment} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* 色の帯 (アメリカの上だけ) */}
          <defs><clipPath id="mzeb118us"><path d={mzebD(MZEB_US) + " Z"} /></clipPath></defs>
          <g clipPath="url(#mzeb118us)">
            {MZEB_ZONES.map((z, i) => {
              const d = drop(z);
              if (d <= 0) return null;
              const x0 = mzebUS(z.from, 40)[0], x1 = mzebUS(z.to, 40)[0];
              const yb = lerp(MAPT, MAPB, d);
              return <rect key={i} x={x0} y={MAPT} width={x1 - x0} height={yb - MAPT} fill={z.color} opacity={0.62} />;
            })}
          </g>
          {/* 西の山脈の模様 */}
          {Array.from({ length: 14 }, (_, i) => {
            const [mx, my] = mzebUS(-121 + (i % 7) * 2.4 + (i >= 7 ? 1.2 : 0), 46 - (i % 7) * 1.9 - (i >= 7 ? 3 : 0));
            return <path key={i} d={`M ${mx - 20} ${my + 12} L ${mx} ${my - 16} L ${mx + 20} ${my + 12}`} fill={C.parchmentDark} stroke={KRP.ink} strokeWidth={3} />;
          })}
          {MZEB_LAKES.map((l, i) => <path key={i} d={mzebD(l) + " Z"} fill={C.sea} stroke={KRP.ink} strokeWidth={3} />)}
          {/* 帯の境の線 */}
          {MZEB_ZONES.slice(0, 3).map((z, i) => {
            const d = drop(z);
            const x = mzebUS(z.from, 40)[0];
            return d > 0 && <line key={i} x1={x} y1={MAPT} x2={x} y2={lerp(MAPT, MAPB, d)} stroke={KRP.ink} strokeWidth={4} strokeDasharray="14 8" />;
          })}
          {/* 町の時計 */}
          {towns.map((t, i) => {
            const z = MZEB_ZONES.find((zz) => t.lon >= zz.from && t.lon < zz.to)!;
            const [tx, ty] = mzebUS(t.lon, t.lat);
            const yb = lerp(MAPT, MAPB, drop(z));
            const set = yb >= ty;
            const snap = set ? clamp01((yb - ty) / 60) : 0;
            const target = z.hour * 60;
            const m = set ? lerp(target + (t.rand % 60) - 60, target, easeOut(snap)) + tick : t.rand + Math.sin(f / 7 + i) * 4;
            return (
              <g key={i}>
                <MzEbDial x={tx} y={ty} r={17} minutes={m} hourMin={set ? lerp(t.rand, target, easeOut(snap)) + tick : t.rand} rim={set ? MP.brass : MP.ironLight} />
                {set && snap < 1 && <circle cx={tx} cy={ty} r={26} fill="none" stroke={KRP.white} strokeWidth={4} opacity={1 - snap} />}
              </g>
            );
          })}
          {/* ペンキのローラー (帯の下の端) */}
          {MZEB_ZONES.map((z, i) => {
            const d = drop(z);
            if (d <= 0 || d >= 1) return null;
            const x0 = mzebUS(z.from, 40)[0], x1 = mzebUS(z.to, 40)[0];
            const xa = Math.max(x0, 186), xb = Math.min(x1, 1734);
            const yb = lerp(MAPT, MAPB, d);
            return (
              <g key={i}>
                <line x1={(xa + xb) / 2} y1={yb - 10} x2={(xa + xb) / 2} y2={yb - 120} stroke={MP.woodDark} strokeWidth={14} strokeLinecap="round" />
                <path d={`M ${xa + 10} ${yb - 30} L ${(xa + xb) / 2} ${yb - 60} L ${xb - 10} ${yb - 30}`} stroke={MP.iron} strokeWidth={6} fill="none" />
                <rect x={xa} y={yb - 28} width={xb - xa} height={36} rx={18} fill={z.color} stroke={KRP.ink} strokeWidth={5} />
              </g>
            );
          })}
          {/* 東の大西洋・西の太平洋の波の印 */}
        </g>
        {/* 手前の長机とランプ */}
        <rect x={-300} y={930} width={2600} height={60} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-300} y={990} width={2600} height={300} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
        <g transform="translate(380 930)">
          <rect x={-40} y={-16} width={80} height={16} rx={5} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-8} y={-110} width={16} height={96} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -60 -110 L 60 -110 L 34 -170 L -34 -170 Z" fill={C.zoneGreen} stroke={KRP.ink} strokeWidth={5} />
          <Flame x={0} y={-100} s={0.45} f={f} />
        </g>
        {Array.from({ length: 4 }, (_, i) => <rect key={i} x={560 + i * 30} y={914 - i * 8} width={150} height={10} fill={i % 2 ? KRP.white : C.parchment} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 鉄道会社の男性 (後ろ姿・指し棒) */}
        <MzEbFig id="118m" x={1560} y={1000} s={1.0} f={f} phase={2} back cloth={C.bossBlack} clothDark={C.bossBlackDark}
          arms={[{ side: -1, rot: 8 }, { side: 1, rot: lerp(-10, -128, easeOut(seg(f, 4, 16))), len: 90 }]} />
        {(() => {
          const r = lerp(-10, -128, easeOut(seg(f, 4, 16)));
          const [hx, hy] = handPos(1, r, 90);
          const px = 1560 + hx, py = 1000 + hy + Math.sin((f + 34) / 13) * 3;
          const tx = 1420 + Math.sin(f / 10) * 30, ty = 420 + Math.cos(f / 13) * 20;
          const L = Math.hypot(tx - px, ty - py);
          const k = Math.min(1, 380 / L);
          return (
            <g>
              <line x1={px} y1={py} x2={px + (tx - px) * k} y2={py + (ty - py) * k} stroke={MP.woodDark} strokeWidth={9} strokeLinecap="round" />
              <circle cx={px + (tx - px) * k} cy={py + (ty - py) * k} r={7} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })()}
      </g>
      <TagPlate x={820} y={150} text="1883年11月18日" size={46} t={seg(f, 0, 10)} rot={-2} />
    </Frame>
  );
};


// -------------------------------------------------------------------
// #119 時計の針を戻した町では、その日、正午が2回、来ました。
// 格: 山 / seed 6119
// 絵: どこ: 1883年のアメリカの町の広場。時計台のある役場 (白い木造・とんがり屋根)・雑貨店・馬車・土の道。空は昼の青。演出: 時計台が12時を指して鐘が鳴る (鐘の音の線)。町の人 (男性: 帽子とベスト / 女性: ボンネット帽とくるぶしまでのスカート) が昼休みに入る。そこへはしごに登った役場の係 (男性) が時計の長針をぐいっと逆に戻す (くるっと数分ぶん)。そして時計がもう一度12時を指し、鐘がもう一度鳴る。2回目の鐘で町の人たちが「また?」とずっこける (face="surprised")。時計の文字盤の横に「1回目」「2回目」の小さな数字札「①」「②」。腕は2本 (係 pose="reach" で片手ではしご、片手で針)。カメラは時計台に寄って、2回目の鐘で町の広場へ引く。動き: f0-30 1回目の鐘 / f30-70 針を戻す / f70-100 2回目の鐘 / f100-140 町の人がずっこける・馬がいななく
// どこ: 1883年のアメリカの町の広場。時計台のある白い木造の役場 (とんがり屋根・星条旗)・雑貨店 (たると木箱)・馬と馬車・土の道・昼の青空
// 演出: 時計台が12時を指して鐘が鳴る (①)。町の人 (帽子とベストの男性 / ボンネット帽と長いスカートの女性) が昼休みに入る。
//       はしごに登った役場の係 (男性) が長針をぐいっと逆に戻し、針がもう一度12時に来て鐘がもう一度 (②)。
//       2回目の鐘で町の人たちが「また?」とずっこけ、馬が前足を上げていななく
// 動き: f0-8 1回目の鐘 / f10-24 針を戻す / f24-33 針がまた進む / f33 2回目の鐘 / f34-42 ずっこける・馬が立ち上がる / カメラは時計台の寄り→f28-40 広場へ引く
const MzEbHorse: React.FC<{ x: number; y: number; s?: number; f: number; rear?: number }> = ({ x, y, s = 1, f, rear = 0 }) => {
  const r = -26 * rear;
  const step = Math.sin(f / 6) * 4 * (1 - rear);
  const brown = "#9A6440", dark = "#6E4329";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`rotate(${r} 60 -60)`}>
        {/* 後ろ足 */}
        <rect x={40} y={-130} width={22} height={130} rx={8} fill={dark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={74} y={-130} width={22} height={128} rx={8} fill={brown} stroke={KRP.ink} strokeWidth={5} />
        {/* 前足 (立ち上がると曲がる) */}
        <g transform={`rotate(${rear * 60 + step} -110 -130)`}>
          <rect x={-122} y={-130} width={22} height={128} rx={8} fill={dark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <g transform={`rotate(${rear * 80 - step} -84 -130)`}>
          <rect x={-96} y={-130} width={22} height={130} rx={8} fill={brown} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 胴 */}
        <ellipse cx={-20} cy={-170} rx={140} ry={62} fill={brown} stroke={KRP.ink} strokeWidth={6} />
        {/* 尾 */}
        <path d={`M 112 -190 Q ${150 + Math.sin(f / 5) * 10} -150 ${140 + Math.sin(f / 5) * 14} -80`} stroke={KRP.ink} strokeWidth={16} fill="none" strokeLinecap="round" />
        {/* 首と頭 */}
        <path d="M -120 -200 L -190 -300 L -150 -320 L -90 -220 Z" fill={brown} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -200 -330 Q -250 -310 -262 -270 Q -250 -254 -226 -262 L -160 -300 Z" fill={brown} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -150 -320 L -186 -350 L -176 -318" fill={brown} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -150 -310 Q -120 -270 -96 -226" stroke={KRP.ink} strokeWidth={12} fill="none" strokeLinecap="round" />
        <circle cx={-206} cy={-312} r={6} fill={KRP.ink} />
        {rear > 0.3 && <ellipse cx={-252} cy={-268} rx={8} ry={6} fill={KRP.ink} />}
        {/* 馬具 */}
        <path d="M -60 -230 L -60 -110" stroke={KRP.red} strokeWidth={10} />
      </g>
    </g>
  );
};

const Mz119: React.FC<{ f: number }> = ({ f }) => {
  // 時計の分 (12時 = 720)
  const back = easeInOut(seg(f, 10, 24));
  const fwd = easeInOut(seg(f, 24, 33));
  const mins = f < 10 ? 720 - 2 + seg(f, 0, 4) * 2 : f < 24 ? 720 - back * 8 : 712 + fwd * 8;
  const ring1 = f >= 3 ? clamp01(1 - (f - 3) / 24) : 0;
  const ring2 = f >= 33 ? clamp01(1 - (f - 33) / 40) : 0;
  const fall = easeOut(seg(f, 34, 41));
  const pull = easeInOut(seg(f, 28, 40));
  const sc = lerp(1.45, 1, pull);
  const cx = lerp(960, 960, pull), cy = lerp(380, 540, pull);
  const rear = easeOut(seg(f, 35, 41)) * (0.85 + 0.15 * Math.sin(f / 4));
  const shake = ring2 > 0.6 ? Math.sin(f * 2.1) * 4 : 0;
  return (
    <Frame f={f} seed={6119}>
      <g transform={`translate(${960 + shake} 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        {/* 昼の青空と雲 */}
        <rect x={-300} y={-300} width={2600} height={1200} fill={C.sky} />
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} transform={`translate(${((i * 520 + f * 0.7) % 2600) - 300} ${90 + (i % 2) * 70})`}>
            <ellipse cx={0} cy={0} rx={120} ry={34} fill={KRP.white} />
            <ellipse cx={-50} cy={-18} rx={60} ry={30} fill={KRP.white} />
          </g>
        ))}
        {/* 遠くの山並み */}
        <path d="M -300 640 L 0 520 L 220 600 L 520 500 L 820 620 L 1300 520 L 1600 600 L 1900 510 L 2300 620 L 2300 700 L -300 700 Z" fill="#A9B7C9" stroke={KRP.ink} strokeWidth={4} />
        {/* 土の道 */}
        <rect x={-300} y={840} width={2600} height={400} fill={C.dirt} />
        <path d="M -300 840 L 2300 840" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 22 }, (_, i) => <ellipse key={i} cx={-200 + rnd(191, i) * 2400} cy={880 + rnd(192, i) * 160} rx={18} ry={5} fill={C.dirtDark} opacity={0.6} />)}
        <path d="M -300 1000 Q 960 960 2300 1010" stroke={C.dirtDark} strokeWidth={6} fill="none" opacity={0.6} />
        {/* 雑貨店 (左・見せかけの正面) */}
        <g>
          <path d="M 120 400 L 560 400 L 560 440 L 600 440 L 600 840 L 80 840 L 80 440 L 120 440 Z" fill="#C9A06E" stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={80} y1={470 + i * 38} x2={600} y2={470 + i * 38} stroke={MP.woodDark} strokeWidth={3} opacity={0.6} />)}
          <rect x={150} y={420} width={380} height={60} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
          {/* 看板の絵 (たる) */}
          <g transform="translate(340 450)">
            <ellipse cx={0} cy={0} rx={22} ry={24} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -20 -10 L 20 -10 M -20 10 L 20 10" stroke={KRP.ink} strokeWidth={3} />
          </g>
          <rect x={130} y={560} width={150} height={150} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={400} y={560} width={150} height={150} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={300} y={640} width={80} height={200} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 60 540 L 620 540 L 640 580 L 40 580 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={80 + i * 100} y1={540} x2={70 + i * 100} y2={580} stroke={KRP.white} strokeWidth={10} />)}
          {/* たると木箱 */}
          <g transform="translate(560 840)">
            <path d="M -36 0 Q -46 -50 -36 -100 L 36 -100 Q 46 -50 36 0 Z" fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -42 -30 L 42 -30 M -42 -70 L 42 -70" stroke={MP.iron} strokeWidth={5} />
          </g>
        </g>
        {/* 役場と時計台 */}
        <g>
          <rect x={700} y={480} width={520} height={360} fill={C.woodWhite} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={700} y1={510 + i * 36} x2={1220} y2={510 + i * 36} stroke={KRP.gray} strokeWidth={3} />)}
          <path d="M 680 480 L 960 380 L 1240 480 Z" fill={C.woodWhite} stroke={KRP.ink} strokeWidth={6} />
          {[760, 1100].map((wx) => (
            <g key={wx}>
              <rect x={wx} y={560} width={70} height={110} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
              <rect x={wx - 12} y={560} width={12} height={110} fill={C.navy} stroke={KRP.ink} strokeWidth={3} />
              <rect x={wx + 70} y={560} width={12} height={110} fill={C.navy} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          <rect x={910} y={690} width={100} height={150} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 880 840 L 1040 840 L 1050 860 L 870 860 Z" fill={MP.stone} stroke={KRP.ink} strokeWidth={4} />
          {/* 塔 */}
          <rect x={870} y={200} width={180} height={240} fill={C.woodWhite} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 856 200 L 960 40 L 1064 200 Z" fill={C.navy} stroke={KRP.ink} strokeWidth={6} />
          {/* 鐘 (塔の上の窓) */}
          <g transform={`rotate(${(ring1 + ring2) * Math.sin(f / 1.5) * 18} 960 150)`}>
            <path d="M 936 190 Q 936 150 960 148 Q 984 150 984 190 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <MzEbDial x={960} y={300} r={66} minutes={mins} rim={MP.brass} />
          <MzEbRing x={960} y={170} r={50} amt={Math.max(ring1, ring2)} f={f} />
          {/* 星条旗 */}
          <line x1={1180} y1={480} x2={1180} y2={300} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`translate(1180 300) skewY(${Math.sin(f / 6) * 3})`}>
            {Array.from({ length: 7 }, (_, i) => <rect key={i} x={0} y={i * 13} width={130} height={13} fill={i % 2 ? KRP.white : KRP.red} />)}
            <rect x={0} y={0} width={56} height={46} fill="#2F4C8F" />
            {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={8 + (i % 4) * 13} cy={9 + Math.floor(i / 4) * 14} r={2.6} fill={KRP.white} />)}
            <rect x={0} y={0} width={130} height={91} fill="none" stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* はしごと役場の係 */}
        <g>
          <line x1={1060} y1={250} x2={1160} y2={840} stroke={MP.woodDark} strokeWidth={10} />
          <line x1={1110} y1={240} x2={1210} y2={830} stroke={MP.woodDark} strokeWidth={10} />
          {Array.from({ length: 11 }, (_, i) => <line key={i} x1={1068 + i * 9} y1={290 + i * 52} x2={1118 + i * 9} y2={282 + i * 52} stroke={MP.woodDark} strokeWidth={7} />)}
        </g>
        <MzEbFig id="119c" x={1140} y={470} s={0.72} f={f} phase={3}
          face={f < 24 ? "angry" : f < 34 ? "smile" : "surprised"} gaze={[-9, -6]} lean={-8}
          cloth={C.navy} clothDark={C.navyDark} hat="derby" vest="#8C3B3B"
          arms={[{ side: -1, rot: f < 33 ? 135 : 60, len: 130, front: true }, { side: 1, rot: -8 }]} />
        {/* 針を戻す矢印 */}
        {f >= 10 && f < 24 && (
          <path d="M 1010 238 A 72 72 0 0 0 930 232" stroke={KRP.red} strokeWidth={8} fill="none" strokeLinecap="round"/>
        )}
        {/* 馬と馬車 (右) */}
        <g>
          <g transform="translate(1760 0)">
            <rect x={-60} y={640} width={260} height={130} rx={12} fill="#2E3A55" stroke={KRP.ink} strokeWidth={6} />
            <path d="M -70 640 Q 70 560 210 640 Z" fill="#20283D" stroke={KRP.ink} strokeWidth={5} />
            {[0, 170].map((wx) => (
              <g key={wx} transform={`translate(${wx} 800)`}>
                <circle r={56} fill="none" stroke={KRP.ink} strokeWidth={8} />
                {Array.from({ length: 8 }, (_, k) => <line key={k} x1={0} y1={0} x2={0} y2={-56} stroke={MP.woodDark} strokeWidth={4} transform={`rotate(${k * 45})`} />)}
              </g>
            ))}
            <line x1={-60} y1={720} x2={-260} y2={720} stroke={MP.woodDark} strokeWidth={8} />
          </g>
          <MzEbHorse x={1560} y={860} s={0.85} f={f} rear={rear} />
          {rear > 0.5 && (
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              <path d="M 1290 560 l -30 -10 M 1290 590 l -36 6 M 1300 530 l -20 -24" />
            </g>
          )}
        </g>
        {/* 町の人 (昼休み → 2回目の鐘でずっこける) */}
        {[
          { x: 470, fem: false, dir: -1 },
          { x: 680, fem: true, dir: 1 },
          { x: 1340, fem: false, dir: 1 },
        ].map((p, i) => (
          <g key={i}>
            <MzEbFig id={`119p${i}`} x={p.x} y={968} s={0.95} f={f} phase={i * 4 + 1}
              face={f < 33 ? "smile" : "surprised"} gaze={f < 33 ? [0, 0] : [0, -9]} lean={p.dir * fall * 30}
              cloth={p.fem ? C.femPink : i === 0 ? C.workerGray : C.tweed} clothDark={p.fem ? C.femRed : i === 0 ? C.workerGrayDark : C.tweedDark}
              hat={p.fem ? "bonnet" : i === 0 ? "bowler" : "derby"} hatColor={i === 0 ? C.hatBrown : undefined}
              skirt={p.fem ? "long" : "none"} skirtColor={C.femWine} vest={p.fem ? undefined : C.vestBrown} mustache={i === 2}
              arms={f < 33
                ? [{ side: -1, rot: -58, len: 64, front: true }, { side: 1, rot: 58, len: 64, front: true }]
                : [{ side: -1, rot: 140 + p.dir * 10 }, { side: 1, rot: -140 + p.dir * 10 }]} />
            {/* 昼ごはんの包み (飛ぶ) */}
            <g transform={`translate(${p.x + fall * p.dir * -60} ${968 - 118 * 0.95 - fall * 260}) rotate(${fall * 200 * p.dir})`}>
              <rect x={-22} y={-16} width={44} height={30} rx={5} fill={i === 1 ? KRP.white : C.bread} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -22 -2 L 22 -2" stroke={KRP.red} strokeWidth={4} />
            </g>
          </g>
        ))}
        {/* ずっこけの土ぼこり */}
        {fall > 0 && fall < 1 && [470, 680, 1340].map((px, i) => (
          <g key={i} opacity={1 - fall}>
            <circle cx={px - 50} cy={990} r={20 + fall * 20} fill={C.dirtDark} opacity={0.6} />
            <circle cx={px + 50} cy={990} r={20 + fall * 20} fill={C.dirtDark} opacity={0.6} />
          </g>
        ))}
        <TagPlate x={800} y={250} text="①" size={50} t={seg(f, 2, 8)} />
        <TagPlate x={800} y={340} text="②" size={50} t={seg(f, 33, 39)} color={KRP.red} />
      </g>
    </Frame>
  );
};


// -------------------------------------------------------------------
// #120 お昼ごはんを2回食べた人がいたかどうかは、記録にありません。
// 格: 山 / seed 6120
// 絵: どこ: #119 の町の広場の、時計台の前のベンチ (同じ町の続き)。背景に時計台の12時。演出: ★笑いどころ。ベンチの男性 (帽子・ベスト・ひげ) が1回目の鐘で弁当箱 (ブリキの四角い箱) を開けて食べ終え、ふたを閉めて満足そうに腹をなでる。そこへ2回目の鐘。男性は時計台を見上げ、弁当箱を見下ろし、もう一度ふたを開ける (中はからっぽ)…と、隣の女性 (ボンネット帽・スカート) のサンドイッチをじっと見る。男性の頭上に大きな「?」マーク。古い記録帳 (帳面) が画面の端に開いて、そのページは白紙 (記録にない、の事件)。腕は2本 (pose="hold" で両手で弁当箱)。動き: f0-30 食べ終える / f30-50 2回目の鐘 / f50-90 もう一度ふたを開ける・からっぽ / f90-130 隣のサンドイッチを見る・「?」がぽん / 隣の女性がそっとサンドイッチを遠ざける
// どこ: #119 と同じ町の広場。時計台 (12時) と役場を背に、手前の木のベンチ。右奥に雑貨店。画面の右に古い記録帳が開く
// 演出: ★笑いどころ。ベンチの男性 (帽子・ベスト・ひげ) が1回目の昼ごはんを食べ終え、ブリキの弁当箱のふたを閉めて満足げに腹をなでる。
//       そこへ2回目の鐘。男性は時計台を見上げ、弁当箱を見下ろし、もう一度ふたを開ける (からっぽ) …と、隣の女性 (ボンネット帽・スカート) のサンドイッチをじっと見る。
//       頭の上に大きな「?」。女性はそっとサンドイッチを遠ざける。画面の右で古い記録帳のページがぱらぱらめくれ、止まったページは白紙
// 動き: f0-12 食べ終える / f12-22 ふたを閉めて腹をなでる / f22 2回目の鐘・見上げる / f28 見下ろす / f30-36 ふたを開ける (からっぽ) / f36- 隣を見る・f38「?」 / f40-60 女性が遠ざける / f24-40 記録帳がめくれて白紙
const Mz120: React.FC<{ f: number }> = ({ f }) => {
  const MX = 820, WX = 1180, PY = 904, PS = 1.1;
  const ring = f >= 22 ? clamp01(1 - (f - 22) / 26) : 0;
  const phase = f < 12 ? "eat" : f < 22 ? "pat" : f < 28 ? "up" : f < 36 ? "down" : "stare";
  const lidOpen = phase === "eat" ? 1 : phase === "down" ? easeOut(seg(f, 30, 35)) : phase === "stare" ? 1 : 0;
  const holding = phase === "eat" || phase === "down" || phase === "stare";
  const boxX = MX, boxY = holding ? PY - 118 * PS + 6 : PY - 70 * PS;
  const away = easeInOut(seg(f, 40, 58));
  const flip = seg(f, 24, 40);
  const zoom = easeInOut(seg(f, 0, 60));
  const sc = lerp(1, 1.08, zoom);
  const manFace = phase === "eat" ? "smile" : phase === "pat" ? "joy" : phase === "up" ? "surprised" : phase === "down" ? "worried" : "normal";
  const manGaze: [number, number] = phase === "up" ? [-8, -9] : phase === "down" ? [0, 9] : phase === "stare" ? [11, 3] : [0, 4];
  return (
    <Frame f={f} seed={6120}>
      <g transform={`translate(960 540) scale(${sc}) translate(-960 ${-540 + zoom * 10})`}>
        <rect x={-100} y={-100} width={2200} height={1300} fill={C.sky} />
        {Array.from({ length: 4 }, (_, i) => (
          <ellipse key={i} cx={((i * 600 + f * 0.6) % 2400) - 200} cy={80 + (i % 2) * 50} rx={130} ry={34} fill={KRP.white} />
        ))}
        {/* 背景: 役場と時計台 (#119 と同じ白い木造・紺のとんがり屋根) */}
        <g transform="translate(-560 60) scale(0.95)">
          <rect x={700} y={480} width={520} height={360} fill={C.woodWhite} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={700} y1={510 + i * 36} x2={1220} y2={510 + i * 36} stroke={KRP.gray} strokeWidth={3} />)}
          <path d="M 680 480 L 960 380 L 1240 480 Z" fill={C.woodWhite} stroke={KRP.ink} strokeWidth={6} />
          <rect x={870} y={200} width={180} height={240} fill={C.woodWhite} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 856 200 L 960 40 L 1064 200 Z" fill={C.navy} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`rotate(${ring * Math.sin(f / 1.5) * 18} 960 150)`}>
            <path d="M 936 190 Q 936 150 960 148 Q 984 150 984 190 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <MzEbDial x={960} y={300} r={66} minutes={720 + Math.floor(seg(f, 60, 130) * 2)} rim={MP.brass} />
          <MzEbRing x={960} y={170} r={50} amt={ring} f={f} />
          {[760, 1100].map((wx) => <rect key={wx} x={wx} y={560} width={70} height={110} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />)}
        </g>
        {/* 背景: 雑貨店 */}
        <g transform="translate(1260 120)">
          <path d="M 0 300 L 520 300 L 520 740 L 0 740 Z" fill="#C9A06E" stroke={KRP.ink} strokeWidth={6} />
          <path d="M -20 440 L 540 440 L 560 480 L -40 480 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <rect x={60} y={520} width={130} height={130} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={330} y={520} width={130} height={130} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 地面 */}
        <rect x={-100} y={820} width={2200} height={400} fill={C.dirt} />
        <path d="M -100 820 L 2100 820" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={rnd(201, i) * 2000} cy={860 + rnd(202, i) * 200} rx={16} ry={5} fill={C.dirtDark} opacity={0.6} />)}
        {/* ベンチの背もたれ */}
        <rect x={600} y={650} width={820} height={28} rx={6} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={600} y={700} width={820} height={28} rx={6} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        {[640, 1380].map((bx) => <rect key={bx} x={bx - 10} y={640} width={20} height={200} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 男性 */}
        <MzEbFig id="120m" x={MX} y={PY} s={PS} f={f} phase={2} pose="sit" face={manFace} gaze={manGaze} lean={phase === "stare" ? 6 : 0}
          cloth={C.workerGray} clothDark={C.workerGrayDark} hat="derby" vest={C.vestBrown} mustache
          arms={holding
            ? [{ side: -1, rot: -58, len: 64, front: true }, { side: 1, rot: 58, len: 64, front: true }]
            : phase === "pat"
              ? [{ side: -1, rot: -30, len: 76, front: true }, { side: 1, rot: 36 + Math.sin(f / 1.6) * 10, len: 66, front: true }]
              : [{ side: -1, rot: -30, len: 76, front: true }, { side: 1, rot: 30, len: 76, front: true }]} />
        {/* ブリキの弁当箱 */}
        <g transform={`translate(${boxX} ${boxY})`}>
          <rect x={-56} y={-30} width={112} height={56} rx={6} fill={C.tin} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-46} y={-22} width={92} height={40} rx={4} fill={lidOpen > 0.3 ? "#D8DCE0" : C.tinDark} stroke={KRP.ink} strokeWidth={3} />
          {/* 中身: 1回目の最中はパンくず、2回目はからっぽ */}
          {phase === "eat" && (
            <g>
              <path d={`M -30 4 Q -20 ${-12 + seg(f, 0, 12) * 10} 0 0 Q 18 -8 26 4 Z`} fill={C.bread} stroke={KRP.ink} strokeWidth={3} opacity={1 - seg(f, 6, 12)} />
              {[-20, 4, 22].map((cx) => <circle key={cx} cx={cx} cy={10} r={3} fill={C.bread} />)}
            </g>
          )}
          {phase !== "eat" && lidOpen > 0.5 && (
            <g>
              {[-20, 10].map((cx) => <circle key={cx} cx={cx} cy={8} r={3} fill={C.bread} />)}
              <path d="M -40 -26 L -48 -40 M 0 -30 L 0 -46 M 40 -26 L 48 -40" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={phase === "down" ? seg(f, 33, 36) : 1} />
            </g>
          )}
          {/* ふた (蝶番で上に開く) */}
          <g transform={`rotate(${-lidOpen * 110} -56 -30)`}>
            <rect x={-58} y={-40} width={116} height={14} rx={5} fill={C.tin} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-12} y={-46} width={24} height={8} rx={3} fill={C.tinDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* 腹をなでる満足の印 */}
        {phase === "pat" && <path d={`M ${MX + 100} ${PY - 140} q 10 -16 20 0 q 10 -16 20 0`} stroke={KRP.red} strokeWidth={5} fill="none" />}
        {/* 女性 (サンドイッチ) */}
        <MzEbFig id="120w" x={WX} y={PY} s={PS} f={f} phase={7} pose="sit" face={away > 0.1 ? "worried" : "smile"} gaze={away > 0.1 ? [-10, 0] : [0, 6]} lean={-away * 6}
          cloth={C.femPink} clothDark={C.femRed} hat="bonnet" skirt="long" skirtColor={C.femWine}
          arms={[{ side: -1, rot: lerp(-58, -20, away), len: lerp(64, 74, away), front: true }, { side: 1, rot: lerp(58, -70, away), len: lerp(64, 96, away), front: true }]} />
        {(() => {
          const [hx, hy] = handPos(1, lerp(58, -70, away), lerp(64, 96, away));
          const sx = WX + hx * PS - lerp(14, 0, away) * PS, sy = PY + hy * PS;
          return (
            <g transform={`translate(${sx} ${sy - 8}) rotate(${away * 10})`}>
              <path d="M -34 -6 L 34 -6 L 30 8 L -30 8 Z" fill={C.bread} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-34} y={-12} width={68} height={8} fill={KRP.green} stroke={KRP.ink} strokeWidth={2.5} />
              <rect x={-32} y={-20} width={64} height={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} opacity={0.85} />
              <path d="M -34 -20 L 34 -20 L 30 -34 L -30 -34 Z" fill={C.bread} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })()}
        {/* じっと見る視線と「?」 */}
        {phase === "stare" && (
          <path d={`M ${MX + 50} ${PY - 250} Q ${(MX + WX) / 2} ${PY - 300} ${WX + 40} ${PY - 150}`} stroke={KRP.yellow} strokeWidth={5} strokeDasharray="10 10" fill="none" opacity={0.9} />
        )}
        <QMark x={MX + 20} y={PY - 384} s={1.15} f={f} t={seg(f, 36, 42)} />
        {/* ベンチの座面と脚 */}
        <rect x={590} y={838} width={840} height={26} rx={6} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {[650, 1370].map((bx) => <rect key={bx} x={bx - 10} y={864} width={20} height={70} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 古い記録帳 (画面の右。ページがめくれて白紙で止まる) */}
        <g transform="translate(1650 560) rotate(-6)">
          <rect x={-200} y={-120} width={400} height={250} rx={8} fill="#6E3A2A" stroke={KRP.ink} strokeWidth={6} />
          <rect x={-188} y={-112} width={186} height={232} fill={C.parchment} stroke={KRP.ink} strokeWidth={4} />
          <rect x={2} y={-112} width={186} height={232} fill={C.parchment} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <line x1={-176} y1={-80 + i * 26} x2={-14} y2={-80 + i * 26} stroke={C.parchmentDark} strokeWidth={2.5} />
              <line x1={14} y1={-80 + i * 26} x2={176} y2={-80 + i * 26} stroke={C.parchmentDark} strokeWidth={2.5} />
            </g>
          ))}
          {/* めくれていくページ */}
          {flip < 1 && [0, 1, 2].map((k) => {
            const p = clamp01(flip * 3 - k);
            if (p <= 0 || p >= 1) return null;
            const w = 186 * Math.cos(p * Math.PI);
            return <path key={k} d={`M 0 -112 L ${w} ${-112 - Math.sin(p * Math.PI) * 30} L ${w} ${120 - Math.sin(p * Math.PI) * 30} L 0 120 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />;
          })}
          {/* しおりのひも */}
          <path d="M 0 120 Q 10 150 -6 180" stroke={KRP.red} strokeWidth={6} fill="none" />
          {/* 白紙を照らすきらり */}
          {flip >= 1 && <path d={`M 100 0 l 0 -24 M 100 0 l 0 24 M 100 0 l -24 0 M 100 0 l 24 0`} stroke={MP.brass} strokeWidth={5} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f / 4)} />}
        </g>
      </g>
    </Frame>
  );
};


// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_109: (f) => <Mz109 f={f} />,
  mz_110: (f) => <Mz110 f={f} />,
  mz_111: (f) => <Mz111 f={f} />,
  mz_112: (f) => <Mz112 f={f} />,
  mz_113: (f) => <Mz113 f={f} />,
  mz_114: (f) => <Mz114 f={f} />,
  mz_115: (f) => <Mz115 f={f} />,
  mz_116: (f) => <Mz116 f={f} />,
  mz_117: (f) => <Mz117 f={f} />,
  mz_118: (f) => <Mz118 f={f} />,
  mz_119: (f) => <Mz119 f={f} />,
  mz_120: (f) => <Mz120 f={f} />,
};

export const MZ_EB_MOTIFS: string[] = [
  "mz_109", // #109
  "mz_110", // #110
  "mz_111", // #111
  "mz_112", // #112
  "mz_113", // #113
  "mz_114", // #114
  "mz_115", // #115
  "mz_116", // #116
  "mz_117", // #117
  "mz_118", // #118
  "mz_119", // #119
  "mz_120", // #120
];

export const mezaEbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
