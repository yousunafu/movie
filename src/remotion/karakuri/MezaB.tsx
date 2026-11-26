// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#24〜#35 (12文)
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, mixColor,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  hairBrown: "#8A5A3A",
  hairBrownDark: "#5E3B24",
  red: "#C9453A",
  redDark: "#9C3029",
  pink: "#E68FA6",
  pinkDark: "#C56A84",
  enji: "#8E2F3F",
  enjiDark: "#6A2030",
  navy: "#34466E",
  navyDark: "#243252",
  blue2: "#4F78B0",
  blue2Dark: "#3A5D8C",
  grayC: "#7C838C",
  grayCDark: "#5C626A",
  tights: "#4A3A44",
  pine: "#2F5E45",
  pineDark: "#22453A",
  pineLight: "#3F7757",
  rock: "#8E8A84",
  rockDark: "#6C6862",
  rockLight: "#AAA59D",
  snow: "#F4F6F8",
  grass: "#7FA25A",
  grassDark: "#5D8040",
  dirt: "#B59670",
  dirtDark: "#8F7452",
  water: "#7FB6D6",
  waterLight: "#CDE8F4",
  tentO: "#E07A3C",
  tentY: "#E8B840",
  tentG: "#5E9A6A",
  tentB: "#4F86C0",
  tentR: "#C9503C",
  stage: "#2E4F8E",
  stageDark: "#1F3766",
  stageFold: "#4369AE",
  gold: "#E6C04E",
  goldDark: "#B08E2C",
  floorDark: "#3E3029",
  floorShine: "#6A5546",
  tail: "#2A2A30",
  shirt: "#F4F1EA",
  flower: "#F2A9B8",
  flowerY: "#F6E08A",
  leaf: "#6E9E5C",
  bldg: "#4A5577",
  bldgDark: "#333C5A",
  bldgLight: "#5D6A90",
  win: "#FFE28A",
  winOff: "#2B3150",
  sleepBag1: "#D9663E",
  sleepBag2: "#3F8E8A",
  sleepBag3: "#7A6AB8",
  sleepBag4: "#C9A23A",
  tentIn: "#E9B77A",
  tentInDark: "#C98F52",
  owl: "#9A6E48",
  owlLight: "#D8B88A",
  squirrel: "#B8683A",
  squirrelLight: "#E8B88A",
  savanna: "#C9A65A",
  savannaDark: "#A6843E",
  hut: "#B58A55",
  thatch: "#D2AE62",
  thatchDark: "#A9873E",
  paperOld: "#F3E6C4",
  chalk: "#556B4A",
  wallPink: "#E8BDB2",
  wallPinkDark: "#C9938A",
  vein: "#D7A097",
  plank: "#C49464",
  plankDark: "#9C7048",
  roofA: "#6A5276",
  roofB: "#7E6486",
  roofDark: "#45384F",
  sunCore: "#FFE27A",
  ring: "#FFF4C8",
  bird: "#3E3350",
  hill: "#2E3A4E",
  hillDark: "#222B3A",
  pole: "#6B5A4A",
  switchPlate: "#F4F1EA",
  milky: "#C9C4F0",
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

type Pt = [number, number];
type MzBFace = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type MzBPose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";

// 腕1本 (肩→ひじ→手)。人の足元を原点、s=1 の座標で描く
const MzBArm: React.FC<{ s: Pt; e: Pt; h: Pt; cloth: string; hand?: boolean }> = ({ s, e, h, cloth, hand = true }) => {
  const pts = `${s[0]},${s[1]} ${e[0]},${e[1]} ${h[0]},${h[1]}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={pts} stroke={KRP.ink} strokeWidth={31} />
      <polyline points={pts} stroke={cloth} strokeWidth={22} />
      {hand && <circle cx={h[0]} cy={h[1]} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />}
    </g>
  );
};

// Person の腕だけを消す切り抜き (頭・胴・脚は残す)。中身は足元=原点・s=1 で描く
const MzBNoArms: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const id = "mzbna" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <g>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={-400} y={-700} width={800} height={549} />
          <rect x={-61} y={-160} width={122} height={220} />
          <rect x={-400} y={-61} width={800} height={140} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </g>
  );
};

// この巻の人。Person に「女性の髪とスカート」「後ろ姿」「自分で描く腕」を足す
//   female: 茶色の髪 (long=左右に垂らす / tail=後ろで結んだ房) + スカート (脚は clothDark=タイツ色)
//   back: 後ろ姿 (顔を描かない)。arms: 自分で描く腕 { l: [ひじ, 手], r: [ひじ, 手] } (Person の腕は消す)
const MzBHito: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; face?: MzBFace; gaze?: [number, number];
  cloth: string; clothDark: string; female?: boolean; hairStyle?: "long" | "tail"; longSkirt?: boolean;
  back?: boolean; arms?: { l?: [Pt, Pt]; r?: [Pt, Pt] }; armsBehind?: boolean; pose?: MzBPose; lean?: number;
  pack?: string; hairColor?: string; still?: boolean;
}> = ({ x, y, s = 1, f, phase = 0, face = "normal", gaze, cloth, clothDark, female = false, hairStyle = "long",
  longSkirt = false, back = false, arms, armsBehind = false, pose = "stand", lean = 0, pack, hairColor, still = false }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  const hc = hairColor ?? (female ? C.hairBrown : KRP.ink);
  const body = (
    <Person x={0} y={0} s={1} f={f} phase={phase} face={face} gaze={gaze} cloth={cloth} clothDark={clothDark}
      hair={female || hairColor ? "none" : "cap"} pose={arms ? (pose === "sit" ? "sit" : "stand") : pose} still />
  );
  const armEls = arms ? (
    <g>
      {arms.l && <MzBArm s={[-67, -146]} e={arms.l[0]} h={arms.l[1]} cloth={cloth} />}
      {arms.r && <MzBArm s={[67, -146]} e={arms.r[0]} h={arms.r[1]} cloth={cloth} />}
    </g>
  ) : null;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 背中のリュック (前向きのときは肩ひもだけ見える・後ろ向きは本体が見える) */}
      {pack && !back && (
        <rect x={-70} y={-170} width={140} height={110} rx={22} fill={pack} stroke={KRP.ink} strokeWidth={5} />
      )}
      {/* 後ろ髪 (女性・長い髪) */}
      {female && hairStyle === "long" && (
        <path d="M -76 -236 Q -84 -150 -66 -132 L 66 -132 Q 84 -150 76 -236 Q 72 -302 0 -302 Q -72 -302 -76 -236 Z"
          fill={hc} stroke={KRP.ink} strokeWidth={5} />
      )}
      {/* 結んだ房 (女性・tail) */}
      {female && hairStyle === "tail" && !back && (
        <g>
          <path d="M 44 -276 Q 104 -270 100 -206 Q 98 -168 82 -150 Q 76 -188 62 -226 Z" fill={hc} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={56} cy={-272} r={12} fill={C.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {armsBehind && armEls}
      {arms ? <MzBNoArms>{body}</MzBNoArms> : body}
      {/* 肩ひも */}
      {pack && !back && (
        <g stroke={KRP.ink} strokeWidth={4}>
          <rect x={-46} y={-160} width={14} height={90} fill={pack} />
          <rect x={32} y={-160} width={14} height={90} fill={pack} />
        </g>
      )}
      {/* スカート */}
      {female && (
        longSkirt
          ? <path d="M -56 -84 L 56 -84 L 86 -2 L -86 -2 Z" fill={cloth} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          : <path d="M -56 -84 L 56 -84 L 78 -22 L -78 -22 Z" fill={cloth} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      )}
      {female && (
        <path d={longSkirt ? "M -30 -76 L -40 -10 M 0 -76 L 0 -8 M 30 -76 L 40 -10" : "M -30 -76 L -38 -28 M 0 -76 L 0 -26 M 30 -76 L 38 -28"}
          stroke={KRP.ink} strokeWidth={3} opacity={0.35} />
      )}
      {/* 後ろ姿: 頭を髪でおおう */}
      {back && (
        <g>
          <circle cx={-64} cy={-224} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={64} cy={-224} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-22} y={-178} width={44} height={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-228} r={64} fill={hc} stroke={KRP.ink} strokeWidth={5.5} />
          <path d="M -40 -176 Q 0 -168 40 -176" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.5} />
          <path d="M -20 -276 Q 0 -284 22 -272" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.25} strokeLinecap="round" />
          {pack && <rect x={-62} y={-168} width={124} height={118} rx={22} fill={pack} stroke={KRP.ink} strokeWidth={5} />}
          {pack && <rect x={-40} y={-132} width={80} height={40} rx={10} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.6} />}
        </g>
      )}
      {/* 前髪・垂らした髪 (前向きの女性) */}
      {female && !back && (
        <g>
          <path d="M -62 -238 Q -64 -294 0 -296 Q 64 -294 62 -238 Q 40 -262 10 -252 Q -24 -270 -62 -238 Z" fill={hc} stroke={KRP.ink} strokeWidth={4} />
          {hairStyle === "long" && (
            <g fill={hc} stroke={KRP.ink} strokeWidth={4}>
              <path d="M -60 -246 Q -80 -190 -70 -134 Q -58 -128 -48 -138 Q -58 -190 -46 -232 Z" />
              <path d="M 60 -246 Q 80 -190 70 -134 Q 58 -128 48 -138 Q 58 -190 46 -232 Z" />
            </g>
          )}
        </g>
      )}
      {!female && hairColor && !back && (
        <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z" fill={hc} />
      )}
      {!armsBehind && armEls}
    </g>
  );
};

// 針葉樹 (x,y=根元, h=高さ)
const MzBPine: React.FC<{ x: number; y: number; h: number; c?: string; d?: string; sway?: number }> = ({ x, y, h, c = C.pine, d = C.pineDark, sway = 0 }) => {
  const w = h * 0.42;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway} 0 0)`}>
      <rect x={-h * 0.03} y={-h * 0.18} width={h * 0.06} height={h * 0.2} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
      {[0, 1, 2].map((k) => {
        const top = -h + k * h * 0.26, bot = -h * 0.42 + k * h * 0.26;
        const ww = w * (0.55 + k * 0.25);
        return <path key={k} d={`M 0 ${top} L ${ww} ${bot} Q 0 ${bot - h * 0.05} ${-ww} ${bot} Z`} fill={k % 2 ? d : c} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />;
      })}
    </g>
  );
};

// テント (x,y=地面の中心, w=幅, up=立ち上がり 0〜1)
const MzBTent: React.FC<{ x: number; y: number; w: number; c: string; up?: number }> = ({ x, y, w, c, up = 1 }) => {
  const u = clamp01(up);
  if (u <= 0.01) return <rect x={x - w / 2} y={y - 10} width={w} height={12} rx={4} fill={c} stroke={KRP.ink} strokeWidth={3.5} />;
  const h = w * 0.62 * easeOut(u);
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={w * 0.58} ry={10} fill={KRP.ink} opacity={0.18} />
      <path d={`M ${x - w / 2} ${y} L ${x} ${y - h} L ${x + w / 2} ${y} Z`} fill={c} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${x} ${y - h} L ${x - w * 0.12} ${y} L ${x + w * 0.12} ${y} Z`} fill={KRP.ink} opacity={0.55} />
      <line x1={x} y1={y - h} x2={x} y2={y - h - 14 * u} stroke={KRP.ink} strokeWidth={4} />
      <line x1={x - w / 2} y1={y} x2={x - w * 0.66} y2={y + 4} stroke={KRP.ink} strokeWidth={2} />
      <line x1={x + w / 2} y1={y} x2={x + w * 0.66} y2={y + 4} stroke={KRP.ink} strokeWidth={2} />
    </g>
  );
};

// フクロウ (x,y=足元, s, tilt=首のかしげ, eye=目の光)
const MzBOwl: React.FC<{ x: number; y: number; s?: number; f: number; tilt?: number; eye?: number }> = ({ x, y, s = 1, f, tilt = 0, eye = 0 }) => {
  const blink = (f % 83) < 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={-46} rx={38} ry={48} fill={C.owl} stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-36} rx={24} ry={30} fill={C.owlLight} stroke={KRP.ink} strokeWidth={3} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${-12 + k * 12} ${-44 + (k % 2) * 8} q 4 5 8 0`} stroke={C.owl} strokeWidth={3} fill="none" />)}
      <path d="M -34 -60 Q -46 -30 -30 -6" stroke={KRP.ink} strokeWidth={4} fill="none" />
      <path d="M 34 -60 Q 46 -30 30 -6" stroke={KRP.ink} strokeWidth={4} fill="none" />
      <path d="M -12 0 l -6 8 M -6 0 l 0 9 M 6 0 l 0 9 M 12 0 l 6 8" stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
      <g transform={`rotate(${tilt} 0 -96)`}>
        <ellipse cx={0} cy={-100} rx={40} ry={34} fill={C.owl} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -36 -122 L -30 -146 L -14 -128 Z M 36 -122 L 30 -146 L 14 -128 Z" fill={C.owl} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        {eye > 0 && <circle cx={-16} cy={-102} r={22} fill={C.win} opacity={0.35 * eye} />}
        {eye > 0 && <circle cx={16} cy={-102} r={22} fill={C.win} opacity={0.35 * eye} />}
        {[-16, 16].map((ex) => (
          <g key={ex}>
            <circle cx={ex} cy={-102} r={14} fill={eye > 0 ? C.win : KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {blink ? <line x1={ex - 10} y1={-102} x2={ex + 10} y2={-102} stroke={KRP.ink} strokeWidth={4} />
              : <circle cx={ex} cy={-102} r={6} fill={KRP.ink} />}
          </g>
        ))}
        <path d="M -6 -92 L 6 -92 L 0 -80 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
      </g>
    </g>
  );
};

// フクロウの刺しゅうワッペン (夜型の目印)
const MzBOwlPatch: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={26} fill={C.navyDark} stroke={C.gold} strokeWidth={5} />
    <ellipse cx={0} cy={4} rx={13} ry={15} fill={C.owl} />
    <circle cx={-6} cy={-4} r={5} fill={C.win} />
    <circle cx={6} cy={-4} r={5} fill={C.win} />
    <circle cx={-6} cy={-4} r={2} fill={KRP.ink} />
    <circle cx={6} cy={-4} r={2} fill={KRP.ink} />
    <path d="M -10 -14 L -8 -20 L -3 -14 M 10 -14 L 8 -20 L 3 -14" stroke={C.owl} strokeWidth={3} fill="none" />
    <path d="M 14 -16 a 6 6 0 1 0 6 8 a 5 5 0 1 1 -6 -8 Z" fill={C.flowerY} />
  </g>
);

// たき火 (x,y=薪の中心, s)
const MzBFire: React.FC<{ x: number; y: number; s?: number; f: number; lit?: number }> = ({ x, y, s = 1, f, lit = 1 }) => {
  const L = clamp01(lit);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 石の輪 */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return <ellipse key={i} cx={Math.cos(a) * 92} cy={Math.sin(a) * 26 + 8} rx={22} ry={14} fill={i % 2 ? C.rock : C.rockLight} stroke={KRP.ink} strokeWidth={3.5} />;
      })}
      {/* 薪 */}
      <rect x={-80} y={-10} width={160} height={22} rx={10} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(14)" />
      <rect x={-80} y={-10} width={160} height={22} rx={10} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} transform="rotate(-14)" />
      <ellipse cx={-76} cy={-8} rx={7} ry={11} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={2.5} transform="rotate(-14)" />
      {L > 0.01 && (
        <g transform={`scale(${0.3 + 0.7 * L})`}>
          <circle cx={0} cy={-60} r={150} fill={MP.glow} opacity={0.18} />
          {[-34, 0, 30].map((dx, i) => {
            const hh = 120 + Math.sin(f / 3.3 + i * 2) * 16 - Math.abs(dx);
            const sw = Math.sin(f / 4.1 + i) * 10;
            return (
              <g key={i}>
                <path d={`M ${dx - 34} 0 Q ${dx - 40} ${-hh * 0.5} ${dx + sw} ${-hh} Q ${dx + 40} ${-hh * 0.5} ${dx + 34} 0 Z`} fill={KRP.orange} stroke="#C86A22" strokeWidth={3} />
                <path d={`M ${dx - 18} 0 Q ${dx - 20} ${-hh * 0.35} ${dx + sw * 0.6} ${-hh * 0.65} Q ${dx + 20} ${-hh * 0.35} ${dx + 18} 0 Z`} fill={MP.flame} />
              </g>
            );
          })}
          <path d="M -14 0 Q -10 -40 0 -54 Q 10 -40 14 0 Z" fill={MP.flameCore} />
        </g>
      )}
    </g>
  );
};

// 火の粉 (x,y=根元)
const MzBSparks: React.FC<{ x: number; y: number; f: number; n?: number; amt?: number; spread?: number; seed?: number }> = ({ x, y, f, n = 12, amt = 1, spread = 1, seed = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const life = ((f * (1.2 + rnd(seed, i)) + i * 23) % 70) / 70;
      const sx = x + (rnd(seed + 1, i) - 0.5) * 120 * spread + Math.sin(f / 7 + i) * 14;
      const sy = y - life * 300 * spread;
      return <circle key={i} cx={sx} cy={sy} r={3 + rnd(seed + 2, i) * 4} fill={i % 2 ? MP.flame : KRP.orange} opacity={amt * (1 - life)} />;
    })}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #24 朝日は、体の時計の、時報です。
// 格: 山 / seed 6024
// 絵: どこ: 画面を左右に分けず、1枚の中で手前と奥を重ねる: 奥は寝室の窓の外の夜明けの町 (屋根の向こうから朝日がのぞく・空は dawn の橙)、手前は体の中の小部屋の TainaiDokei (lag=0, reset=1, s=1.3)。演出: 朝日の縁が屋根の上に出た瞬間、太陽から「ピッ・ピッ・ピッ・ポーン」の時報の音の輪が4つ、波紋のように広がる (短い3つと長い1つ。字は書かない)。その輪が窓を通って手前の時計に届くたびに、Kobito が時計の横で敬礼し、最後の長い「ポーン」で針の位置をぴたりと合わせて、ネジを1回ぎゅっと締める。腕は2本 (pose="salute"→"twist")。動き: f0-40 カメラが窓の外の朝日から手前の時計へ引く / f40-130 音の輪が4つ (3つは短く速く、最後はゆっくり大きく) / f130 ネジを締める / 屋根の上の鳥が飛ぶ
// どこ: 体の中の小部屋 (桃色の壁・板の床・道具棚・つり下げランプ)。右上の大きな窓の向こうに夜明けの町の屋根と朝日
//       (体内時計に付いている朝日が、ちょうど窓の中の屋根の上に来るように時計を置く)
// 演出: 朝日から時報の音の輪が4つ (短い3つ + 長い1つ) 広がり、窓を抜けて時計へ。届くたびに小人が敬礼。
//       長い輪が届くと時計の針の先が「ピタッ」と光り、小人がはしごの上でスパナを回してボルトを締める。屋根の鳥が飛び立つ
// 動き: f0-26 朝日の寄りから全体へ引く / f14,20,26 短い輪 / f30-54 長い輪 (f45 で大きな輪が部屋を横切る) / f54 ピタッ / f60-74 締める / f50- 鳥
const Mz024: React.FC<{ f: number }> = ({ f }) => {
  const SUN: Pt = [1142, 91];
  const CK: Pt = [700, 520];
  const cam = easeInOut(seg(f, 0, 26));
  const k = lerp(1.9, 1, cam);
  const rings = [
    { a: 14, d: 10, w: 9, c: C.ring },
    { a: 20, d: 10, w: 9, c: C.ring },
    { a: 26, d: 10, w: 9, c: C.ring },
    { a: 30, d: 24, w: 20, c: C.sunCore },
  ];
  const DIST = 640;
  // 輪が時計に届いた瞬間 (敬礼のはずみ)
  const hits = rings.map((r) => seg(f, r.a + r.d * 0.82, r.a + r.d * 0.82 + 6));
  const hitPulse = hits.reduce((m, h) => Math.max(m, h > 0 && h < 1 ? Math.sin(h * Math.PI) : 0), 0);
  const snap = seg(f, 54, 62);
  const twist = easeInOut(seg(f, 60, 72));
  const twisting = f >= 57;
  // スパナ: ボルト中心から伸びる。twist で 35 度回る
  const BOLT: Pt = [988, 600];
  const wa = ((40 + twist * 35) * Math.PI) / 180;
  const WE: Pt = [BOLT[0] + Math.cos(wa) * 96, BOLT[1] + Math.sin(wa) * 96];
  const KB: Pt = [1112, 716];
  const ks = 0.62;
  const toL = (p: Pt): Pt => [(p[0] - KB[0]) / ks, (p[1] - KB[1]) / ks];
  const hand1 = toL(WE);
  const hand2 = toL([lerp(BOLT[0], WE[0], 0.7), lerp(BOLT[1], WE[1], 0.7)]);
  const kArms: { l: [Pt, Pt]; r: [Pt, Pt] } = twisting
    ? { l: [[-118, -150], hand2], r: [[-20, -96], hand1] }
    : { l: [[-80, -104], [-80, -64]], r: [[124, -200 - hitPulse * 8], [52, -262 - hitPulse * 6]] };
  const bob = Math.sin(f / 13) * 3;
  const fly = seg(f, 50, 100);
  return (
    <Frame f={f} seed={6024} bg={C.wallPink}>
      <g transform={`translate(${SUN[0]} ${SUN[1]}) scale(${k}) translate(${-SUN[0] + (1 - cam) * 0} ${-SUN[1]})`}>
        {/* 部屋の壁 (体の中なので、やわらかい桃色の壁に血管のすじ) */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.wallPink} />
        <g stroke={C.vein} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.8}>
          <path d="M -20 160 Q 160 120 260 220 Q 340 300 300 420" />
          <path d="M 260 220 Q 380 190 440 110" />
          <path d="M 1700 460 Q 1780 560 1900 540" />
          <path d="M 1780 520 Q 1790 640 1720 720" />
          <path d="M 40 660 Q 120 600 200 640" />
        </g>
        {/* 窓 (外は夜明けの町) */}
        <rect x={880} y={20} width={780} height={400} fill={MP.wood} stroke={KRP.ink} strokeWidth={8} />
        <g>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={904} y={44 + i * 35.2} width={732} height={36} fill={mixColor("#6A5A92", MP.dawn, Math.pow(i / 9, 1.1))} />
          ))}
          <rect x={904} y={44} width={732} height={352} fill={MP.dawnSoft} opacity={0.15} />
          {/* 遠くの屋根並み */}
          <path d="M 904 250 L 960 214 L 1010 250 L 1010 230 L 1080 190 L 1150 230 L 1230 196 L 1300 236 L 1360 206 L 1420 236 L 1500 186 L 1580 230 L 1636 210 L 1636 396 L 904 396 Z"
            fill={C.roofB} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          {/* 手前の屋根 (瓦のすじ・煙突・窓の明かり) */}
          <path d="M 904 300 L 1010 250 L 1120 300 Z" fill={C.roofA} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 1180 320 L 1330 236 L 1480 320 Z" fill={C.roofA} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 1430 300 L 1540 248 L 1636 290 L 1636 310 Z" fill={C.roofA} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <rect x={1380} y={250} width={26} height={44} fill={C.roofDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={904} y={300} width={732} height={96} fill={C.roofDark} />
          {[[960, 330], [1060, 340], [1240, 340], [1400, 336], [1520, 330]].map(([wx, wy], i) => (
            <rect key={i} x={wx} y={wy} width={34} height={30} fill={C.win} stroke={KRP.ink} strokeWidth={3} opacity={0.4 + 0.5 * seg(f, 10 + i * 8, 30 + i * 8)} />
          ))}
          {/* 屋根の上の鳥 (f50 から飛び立つ) */}
          {[0, 1, 2].map((i) => {
            const bx = 1300 + i * 34 + fly * (180 + i * 60);
            const by = 236 - fly * (150 + i * 30) - (fly > 0 ? 0 : 0);
            const flap = fly > 0 ? Math.sin(f / 2 + i) * 10 : 0;
            return fly <= 0 ? (
              <g key={i}>
                <ellipse cx={1300 + i * 34} cy={226 + i * 6} rx={12} ry={9} fill={C.bird} />
                <circle cx={1310 + i * 34} cy={218 + i * 6} r={6} fill={C.bird} />
              </g>
            ) : (
              <path key={i} d={`M ${bx - 16} ${by - flap} Q ${bx - 6} ${by - 4} ${bx} ${by} Q ${bx + 6} ${by - 4} ${bx + 16} ${by - flap}`}
                stroke={C.bird} strokeWidth={5} fill="none" strokeLinecap="round" />
            );
          })}
        </g>
        {/* 窓わくの十字・カーテン */}
        <rect x={1262} y={44} width={16} height={352} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={904} y={212} width={732} height={14} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} opacity={0} />
        <path d="M 860 6 L 960 6 Q 940 200 966 436 L 860 436 Z" fill={MP.youDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1680 6 L 1580 6 Q 1600 200 1574 436 L 1680 436 Z" fill={MP.youDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 892 40 Q 906 220 900 420 M 1648 40 Q 1634 220 1640 420" stroke={MP.you} strokeWidth={6} fill="none" />
        <rect x={840} y={-6} width={860} height={22} rx={10} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 窓台 */}
        <rect x={860} y={420} width={820} height={26} rx={6} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        {/* 窓から差しこむ朝の光の帯 */}
        <path d="M 930 446 L 1630 446 L 1340 860 L 520 860 Z" fill="#FFF1B8" opacity={0.18 + 0.12 * seg(f, 26, 42)} />
        {/* 床 (板張り) */}
        <rect x={-40} y={840} width={2000} height={280} fill={C.plank} />
        <g stroke={C.plankDark} strokeWidth={4}>
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 240 - 40} y1={840} x2={i * 240 - 120} y2={1100} />)}
          <line x1={-40} y1={840} x2={1960} y2={840} stroke={KRP.ink} strokeWidth={6} />
          <line x1={-40} y1={930} x2={1960} y2={930} />
        </g>
        {/* 道具棚 (左の壁) */}
        <rect x={90} y={260} width={250} height={18} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={110} y={186} width={40} height={74} rx={6} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={200} cy={236} r={24} fill={MP.brassLight} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={200} cy={236} r={8} fill={KRP.ink} />
        <rect x={250} y={210} width={70} height={50} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <rect x={262} y={198} width={46} height={14} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        {/* つり下げランプ */}
        <line x1={560} y1={-10} x2={560} y2={110} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${Math.sin(f / 16) * 3} 560 0)`}>
          <path d="M 520 110 L 600 110 L 584 150 L 536 150 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={560} cy={160} r={14} fill={MP.glow} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 時計を壁に留める金具とボルト */}
        <rect x={930} y={566} width={110} height={70} rx={10} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={662} y={790} width={76} height={56} rx={6} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={5} />
        {/* 主役: 体内時計 (朝日つき・はみ出しなし) */}
        <TainaiDokei x={CK[0]} y={CK[1]} s={1.3} f={f} lag={0} reset={1} />
        {/* ピタッ (長い輪が届いて針の先が光る) */}
        {snap > 0 && snap < 1 && (
          <g opacity={1 - snap}>
            <circle cx={CK[0]} cy={CK[1] - 222} r={20 + snap * 60} fill="none" stroke={C.sunCore} strokeWidth={10} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1={CK[0]} y1={CK[1] - 222 - 40 - snap * 30} x2={CK[0]} y2={CK[1] - 222 - 70 - snap * 40} stroke={C.sunCore} strokeWidth={8} strokeLinecap="round"
                transform={`rotate(${i * 60} ${CK[0]} ${CK[1] - 222})`} />
            ))}
          </g>
        )}
        {/* 時計が輪を受けるたびに、ふちがきらっと光る */}
        {hitPulse > 0 && <circle cx={CK[0]} cy={CK[1]} r={268} fill="none" stroke={C.sunCore} strokeWidth={12 * hitPulse} opacity={0.8} />}
        {/* ボルト */}
        <polygon points={Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 + twist * 35) * Math.PI / 180;
          return `${BOLT[0] + Math.cos(a) * 22},${BOLT[1] + Math.sin(a) * 22}`;
        }).join(" ")} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={BOLT[0]} cy={BOLT[1]} r={8} fill={MP.brassLight} stroke={KRP.ink} strokeWidth={3} />
        {/* はしご */}
        <g stroke={KRP.ink} strokeWidth={5}>
          <rect x={1060} y={716} width={16} height={136} fill={MP.wood} />
          <rect x={1150} y={716} width={16} height={136} fill={MP.wood} />
          {[740, 780, 820].map((ry) => <rect key={ry} x={1068} y={ry} width={90} height={10} fill={MP.woodLight} />)}
          <rect x={1046} y={706} width={134} height={16} rx={5} fill={MP.woodLight} />
        </g>
        {/* スパナ (締めるときだけ手に持つ。それまでは はしごの上に置いてある) */}
        {twisting ? (
          <g>
            <line x1={BOLT[0]} y1={BOLT[1]} x2={WE[0]} y2={WE[1]} stroke={KRP.ink} strokeWidth={22} strokeLinecap="round" />
            <line x1={BOLT[0]} y1={BOLT[1]} x2={WE[0]} y2={WE[1]} stroke={KRP.silver} strokeWidth={13} strokeLinecap="round" />
            <circle cx={BOLT[0]} cy={BOLT[1]} r={30} fill="none" stroke={KRP.ink} strokeWidth={14} />
            <circle cx={BOLT[0]} cy={BOLT[1]} r={30} fill="none" stroke={KRP.silver} strokeWidth={7} />
          </g>
        ) : (
          <g>
            <line x1={1150} y1={700} x2={1200} y2={700} stroke={KRP.ink} strokeWidth={18} strokeLinecap="round" />
            <line x1={1150} y1={700} x2={1200} y2={700} stroke={KRP.silver} strokeWidth={10} strokeLinecap="round" />
          </g>
        )}
        {/* 小人 (敬礼 → スパナで締める)。腕は2本 */}
        <g transform={`translate(${KB[0]} ${KB[1] + bob}) scale(${ks})`}>
          <MzBNoArms>
            <Kobito x={0} y={0} s={1} f={f} face={twisting ? "joy" : hitPulse > 0.2 ? "surprised" : "smile"} lean={twisting ? -6 : 0} />
          </MzBNoArms>
          <MzBArm s={[-67, -146]} e={kArms.l[0]} h={kArms.l[1]} cloth={MP.kobitoCloth} />
          <MzBArm s={[67, -146]} e={kArms.r[0]} h={kArms.r[1]} cloth={MP.kobitoCloth} />
        </g>
        {/* ぎゅっ (締めた印) */}
        {twist > 0.6 && (
          <g opacity={seg(f, 66, 72) * (1 - seg(f, 88, 98))}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${BOLT[0] - 30 + i * 26} ${BOLT[1] - 50} l 6 -20`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
            ))}
          </g>
        )}
        {/* 時報の音の輪 (短い3つ + 長い1つ。朝日から広がる) */}
        {rings.map((r, i) => {
          const t = seg(f, r.a, r.a + r.d);
          if (t <= 0 || t >= 1) return null;
          return (
            <g key={i} opacity={1 - t * 0.7}>
              <circle cx={SUN[0]} cy={SUN[1]} r={40 + t * DIST} fill="none" stroke={KRP.ink} strokeWidth={r.w + 6} opacity={0.25} />
              <circle cx={SUN[0]} cy={SUN[1]} r={40 + t * DIST} fill="none" stroke={r.c} strokeWidth={r.w} />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #25 この時計の仕組みを解いた3人の研究者は、2017年に、ノーベル賞をもらいました。
// 格: 山 / seed 6025
// 絵: どこ: ノーベル賞の授賞式のステージ (青い幕・花の飾り・磨いた床・客席のシャンデリア)。ステージ奥の大きな幕に、細胞の中の「たまっては消える」たんぱく質の振り子の映像 (丸い細胞の中で、粒がだんだん集まって山になり、やがて溶けて消え、また集まる)。演出: 3人の研究者 (実在の人物なので顔を描かない。燕尾服の男性3人の後ろ姿) がステージ中央へ歩み出て、金色のメダルを受け取る (メダルに顔の浮き彫りやロゴは描かず、札「2017年」だけ)。客席の手が一斉に拍手。奥の幕の振り子は、拍手のリズムに合わせて粒が集まり→消え→集まる。札は「2017年」と「3人」。腕は2本 (研究者の後ろ姿は pose="receive" で両手でメダルの箱を受ける)。動き: f0-40 カメラが客席の後ろからステージへ寄る / f40-90 3人が歩み出る・メダル / f60-150 拍手・振り子の粒の増減 / シャンデリアのきらめき
// どこ: 授賞式のホール。青い幕のステージ・磨いた床の映りこみ・ステージの縁の花・左右のシャンデリア・手前に客席の後ろ頭
// 演出: 3人の研究者 (燕尾服の後ろ姿・顔なし) が中央へ歩み出て、金のメダルの青い箱を両手で頭の上へ掲げる。
//       奥の幕のスクリーンで、丸い細胞の中の粒が集まって山になり→溶けて消え→また集まる。客席の手が拍手 (12コマに1回)
// 動き: f0-40 カメラが客席の後ろからステージへ寄る / f4-32 3人が歩み出る / f32-40 箱を掲げる / 拍手と粒の増減は f で続く / シャンデリアのきらめき
const Mz025: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const k = lerp(1, 1.16, cam);
  const walk = easeOut(seg(f, 4, 32));
  const lift = easeOut(seg(f, 32, 40));
  const clap = (f % 12) < 3;
  // 細胞の中の粒 (48コマで 集まる→消える)
  const p = ((f + 21) % 48) / 48;
  const amt = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
  const dots = Array.from({ length: 34 }, (_, i) => {
    const row = Math.floor(Math.sqrt(i * 2));
    const ang = rnd(25, i) * Math.PI;
    const r = row * 14;
    return [960 + Math.cos(ang) * r * 1.4, 300 - Math.sin(ang) * r * 0.9 + 30] as Pt;
  });
  const shown = amt * dots.length;
  const researchers = [
    { x: 800, hc: KRP.grayDark, ph: 1 },
    { x: 960, hc: KRP.gray, ph: 2 },
    { x: 1120, hc: KRP.ink, ph: 3 },
  ];
  return (
    <Frame f={f} seed={6025} bg={C.stageDark}>
      <g transform={`translate(960 480) scale(${k}) translate(-960 -480)`}>
        {/* ホールの奥の壁と青い幕 (ひだ) */}
        <rect x={-40} y={-40} width={2000} height={760} fill={C.stage} />
        {Array.from({ length: 21 }, (_, i) => (
          <path key={i} d={`M ${i * 96 - 20} -40 Q ${i * 96 + 10} 300 ${i * 96 - 14} 700`} stroke={i % 2 ? C.stageFold : C.stageDark} strokeWidth={14} fill="none" opacity={0.7} />
        ))}
        {/* 上の飾り幕 (ふさ付き) */}
        <path d="M -40 -40 L 1960 -40 L 1960 60 Q 1760 130 1560 60 Q 1360 130 1160 60 Q 960 130 760 60 Q 560 130 360 60 Q 160 130 -40 60 Z" fill={C.stageDark} stroke={KRP.ink} strokeWidth={5} />
        {[360, 760, 1160, 1560].map((tx) => (
          <g key={tx}>
            <line x1={tx} y1={60} x2={tx} y2={110} stroke={C.gold} strokeWidth={5} />
            <path d={`M ${tx - 10} 110 L ${tx + 10} 110 L ${tx + 14} 140 L ${tx - 14} 140 Z`} fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 幕のスクリーン: 細胞の中の「たまっては消える」粒 */}
        <rect x={690} y={110} width={540} height={330} rx={10} fill={C.gold} stroke={KRP.ink} strokeWidth={6} />
        <rect x={706} y={126} width={508} height={298} rx={6} fill="#20294A" />
        <ellipse cx={960} cy={275} rx={220} ry={130} fill="#EDE3F2" stroke={KRP.ink} strokeWidth={5} opacity={0.95} />
        <ellipse cx={960} cy={275} rx={200} ry={114} fill="none" stroke="#C9B8D8" strokeWidth={4} />
        {/* 細胞の中の小さな器官 */}
        <ellipse cx={810} cy={230} rx={26} ry={14} fill="#C9E2B8" stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={1110} cy={320} rx={30} ry={14} fill="#C9E2B8" stroke={KRP.ink} strokeWidth={3} transform="rotate(20 1110 320)" />
        <ellipse cx={960} cy={292} rx={92} ry={60} fill="#D8C2E4" stroke={KRP.ink} strokeWidth={4} />
        {dots.map(([dx, dy], i) => {
          const o = clamp01(shown - i);
          if (o <= 0) return null;
          return <circle key={i} cx={dx} cy={dy} r={9 * (0.6 + 0.4 * o)} fill={MP.bell} stroke={KRP.ink} strokeWidth={2} opacity={o} />;
        })}
        {/* ステージの床 (磨いた木。映りこみ) */}
        <rect x={-40} y={640} width={2000} height={140} fill={C.floorShine} />
        <g stroke={C.floorDark} strokeWidth={3} opacity={0.7}>
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 130 - 40} y1={640} x2={i * 160 - 260} y2={780} />)}
        </g>
        <rect x={640} y={650} width={640} height={30} fill={C.gold} opacity={0.18} />
        <rect x={-40} y={636} width={2000} height={8} fill={KRP.ink} />
        <rect x={-40} y={772} width={2000} height={60} fill={C.floorDark} stroke={KRP.ink} strokeWidth={5} />
        {/* ステージの縁の花 */}
        {[120, 420, 1500, 1800].map((fx, j) => (
          <g key={fx}>
            <path d={`M ${fx - 50} 776 L ${fx + 50} 776 L ${fx + 38} 720 L ${fx - 38} 720 Z`} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i / 8) * Math.PI;
              const fx2 = fx - Math.cos(a) * 70, fy2 = 700 - Math.sin(a) * 60;
              return (
                <g key={i}>
                  <ellipse cx={fx2} cy={fy2 + 14} rx={16} ry={8} fill={C.leaf} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${i * 20} ${fx2} ${fy2 + 14})`} />
                  <circle cx={fx2} cy={fy2} r={20} fill={(i + j) % 3 ? C.flower : C.flowerY} stroke={KRP.ink} strokeWidth={3} />
                  <circle cx={fx2} cy={fy2} r={6} fill={C.gold} />
                </g>
              );
            })}
            <circle cx={fx} cy={660} r={22} fill={C.flower} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* シャンデリア */}
        {[260, 1660].map((cx, j) => (
          <g key={cx} transform={`rotate(${Math.sin(f / 30 + j) * 1.5} ${cx} -40)`}>
            <line x1={cx} y1={-40} x2={cx} y2={150} stroke={C.gold} strokeWidth={5} />
            <path d={`M ${cx - 130} 170 Q ${cx} 240 ${cx + 130} 170`} stroke={C.gold} strokeWidth={8} fill="none" />
            <path d={`M ${cx - 80} 130 Q ${cx} 180 ${cx + 80} 130`} stroke={C.gold} strokeWidth={7} fill="none" />
            {[-130, -65, 0, 65, 130].map((dx, i) => (
              <g key={i}>
                <path d={`M ${cx + dx} ${190 + (i % 2) * 14} l -8 18 l 8 22 l 8 -22 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} opacity={0.9} />
                <circle cx={cx + dx} cy={170 + Math.abs(dx) * -0.1} r={9} fill={MP.glow} stroke={KRP.ink} strokeWidth={2.5} />
              </g>
            ))}
            <circle cx={cx} cy={150} r={20} fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
            {/* きらめき */}
            {[0, 1, 2].map((i) => {
              const tw = Math.max(0, Math.sin(f / 6 + i * 2.1 + j));
              const sx = cx - 90 + i * 90, sy = 240 + (i % 2) * 20;
              return <path key={i} d={`M ${sx} ${sy - 18 * tw} L ${sx + 4} ${sy - 4} L ${sx + 18 * tw} ${sy} L ${sx + 4} ${sy + 4} L ${sx} ${sy + 18 * tw} L ${sx - 4} ${sy + 4} L ${sx - 18 * tw} ${sy} L ${sx - 4} ${sy - 4} Z`} fill={KRP.white} opacity={tw} />;
            })}
          </g>
        ))}
        {/* スポットライトの光 */}
        <path d={`M 900 -40 L 1020 -40 L 1260 720 L 660 720 Z`} fill="#FFF6D0" opacity={0.12 + 0.08 * lift} />
        <ellipse cx={960} cy={712} rx={300} ry={26} fill="#FFF6D0" opacity={0.25} />
        {/* 3人の研究者 (後ろ姿・燕尾服。箱を頭の上へ) */}
        {researchers.map((r, i) => {
          const x = lerp(r.x - 560, r.x, walk);
          const step = walk < 1 ? Math.abs(Math.sin(f / 4 + i)) * 8 : 0;
          const L: [Pt, Pt] = [[lerp(-78, -70, lift), lerp(-90, -230, lift)], [lerp(-74, -30, lift), lerp(-60, -326, lift)]];
          const R: [Pt, Pt] = [[lerp(78, 70, lift), lerp(-90, -230, lift)], [lerp(74, 30, lift), lerp(-60, -326, lift)]];
          return (
            <g key={i}>
              <ellipse cx={x} cy={712} rx={56} ry={10} fill={KRP.ink} opacity={0.25} />
              <g transform={`translate(${x} ${712 - step}) scale(0.8)`}>
                <MzBHito x={0} y={0} f={f} phase={r.ph} cloth={C.tail} clothDark={C.tail} back hairColor={r.hc} arms={{ l: L, r: R }} />
                {/* 燕尾 (上着のしっぽ) と白い襟 */}
                <path d="M -56 -66 L -4 -66 L -14 0 L -44 -14 Z" fill={C.tail} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
                <path d="M 56 -66 L 4 -66 L 14 0 L 44 -14 Z" fill={C.tail} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
                <path d="M -30 -162 L 0 -150 L 30 -162 L 26 -170 L -26 -170 Z" fill={C.shirt} stroke={KRP.ink} strokeWidth={3} />
                {/* メダルの箱 (青い箱・金の丸。浮き彫りなし) */}
                <g transform={`translate(0 ${lerp(-60, -350, lift)})`} opacity={seg(f, 30, 34)}>
                  <rect x={-50} y={-28} width={100} height={56} rx={8} fill={C.blue2Dark} stroke={KRP.ink} strokeWidth={5} />
                  <circle cx={0} cy={0} r={22} fill={C.gold} stroke={C.goldDark} strokeWidth={5} />
                  <circle cx={0} cy={0} r={12} fill="none" stroke={C.goldDark} strokeWidth={2} opacity={0.6} />
                  <path d="M -10 -12 Q -4 -16 2 -14" stroke={KRP.white} strokeWidth={3} fill="none" />
                </g>
              </g>
              {/* きらり */}
              {lift > 0.5 && (
                <g opacity={0.5 + 0.5 * Math.sin(f / 4 + i)}>
                  {[0, 1, 2, 3].map((q) => (
                    <line key={q} x1={x} y1={712 - 280 - 40} x2={x} y2={712 - 280 - 64} stroke={C.gold} strokeWidth={5} strokeLinecap="round"
                      transform={`rotate(${q * 90 + 45} ${x} ${712 - 280})`} />
                  ))}
                </g>
              )}
            </g>
          );
        })}
        {/* 客席 (手前。後ろ頭の列と拍手の手) */}
        {[0, 1].map((row) => (
          <g key={row}>
            {Array.from({ length: 10 }, (_, i) => {
              const hx = (row ? 50 : 140) + i * 200 + (row ? 0 : 0);
              const hy = row ? 1010 : 900;
              const hs = row ? 1.25 : 1;
              const hcol = [KRP.ink, C.hairBrown, KRP.grayDark, C.hairBrownDark][(i + row) % 4];
              const ph = (i + row * 3) % 2 === 0;
              const cl = clap === ph || (f % 12 < 3 && i % 3 === 0);
              return (
                <g key={i} transform={`translate(${hx} ${hy}) scale(${hs})`}>
                  <rect x={-80} y={0} width={160} height={120} rx={30} fill={(i + row) % 3 === 0 ? C.navy : (i + row) % 3 === 1 ? C.enji : C.grayCDark} stroke={KRP.ink} strokeWidth={5} />
                  <circle cx={0} cy={-30} r={52} fill={hcol} stroke={KRP.ink} strokeWidth={5} />
                  {/* 拍手の手 (頭の横で) */}
                  <circle cx={cl ? 62 : 48} cy={-70} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                  <circle cx={cl ? 84 : 98} cy={-70} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                  {cl && <path d="M 64 -104 l -6 -14 M 74 -108 l 0 -16 M 84 -104 l 6 -14" stroke={C.gold} strokeWidth={4} strokeLinecap="round" />}
                </g>
              );
            })}
          </g>
        ))}
      </g>
      <TagPlate x={330} y={520} text="2017年" size={52} t={seg(f, 26, 36)} />
      <TagPlate x={1600} y={520} text="3人" size={52} t={seg(f, 30, 40)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #26 では、電気がなかったら、どうなるのか。
// 格: 並 / seed 6026
// 絵: どこ: 現代の夜の町を見下ろす丘 (手前に電柱と電線、奥にビル・マンション・街灯・信号)。演出: 画面手前に巨大な壁のスイッチ (白いプレート・つまみ) が地面から生えたように立っていて、その上から大きな手がつまみをパチン!と下ろす。すると町の明かりが手前の家から奥のビルへと、ブロックごとに順番にふっ・ふっと消えていく。最後のビルの赤い航空灯が消えると、空いっぱいに星があらわれ、天の川がうっすら浮かぶ。電線の上のフクロウだけが目を光らせて「ほう」と首をかしげる。動き: f0-30 カメラが町の全景 / f30 スイッチが下りる (パチン) / f35-110 明かりが順番に消える / f110-150 星があらわれる・フクロウが首をかしげる / カメラは少しずつ上へパンして空へ
// どこ: 夜の町を見下ろす丘。手前に電柱と電線、奥に家・マンション・ビル・街灯・信号。右の手前に地面から生えた巨大な壁スイッチ
// 演出: 上から大きな手がスイッチのつまみをパチンと下ろす → 手前の家から奥のビルへ、ブロックごとに明かりが消えていく →
//       最後のビルの赤い航空灯が消えると、空いっぱいの星と天の川。電線のフクロウだけが目を光らせて首をかしげる
// 動き: f8-20 手が下りる / f22 パチン / f26-62 明かりが順に消える (f45 で町の半分が暗い) / f66 航空灯が消える / f66-90 星 / f80- フクロウ / カメラは f20 からゆっくり上へパン
const Mz026: React.FC<{ f: number }> = ({ f }) => {
  const handIn = easeOut(seg(f, 6, 20));
  const flip = easeInOut(seg(f, 20, 24));
  const burst = seg(f, 22, 32);
  const offAt = (b: number) => 26 + b * 4;
  const isOn = (b: number) => f < offAt(b);
  const dark = seg(f, 26, 66);
  const towerOff = f >= 66;
  const stars = easeOut(seg(f, 64, 92));
  const pan = easeInOut(seg(f, 20, 114)) * 110;
  const sky1 = mixColor("#3A3566", MP.nightDeep, dark);
  const sky2 = mixColor("#7A5A7E", MP.night, dark);
  // 奥のビル (左から。ブロック番号 6〜8)
  const far = Array.from({ length: 16 }, (_, i) => {
    const w = 90 + rnd(261, i) * 70;
    const x = i * 124 - 30 + rnd(262, i) * 20;
    const h = 170 + rnd(263, i) * 190;
    return { x, w, h, b: 6 + Math.floor(rnd(264, i) * 3) };
  });
  const mid = [
    { x: 120, w: 220, h: 200 }, { x: 470, w: 260, h: 240 }, { x: 860, w: 200, h: 190 }, { x: 1180, w: 250, h: 230 }, { x: 1600, w: 230, h: 210 },
  ];
  const houses = [80, 330, 600, 860, 1110, 1380, 1650];
  const W1: Pt = [260, 300], W2: Pt = [2000, 280], WC: Pt = [1100, 430];
  const bz = (t: number): Pt => [
    (1 - t) ** 2 * W1[0] + 2 * t * (1 - t) * WC[0] + t * t * W2[0],
    (1 - t) ** 2 * W1[1] + 2 * t * (1 - t) * WC[1] + t * t * W2[1],
  ];
  const owlP = bz(0.32);
  const lever = lerp(-1, 1, flip); // -1=上(入) 1=下(切)
  const SW: Pt = [1500, 540];
  const fingerY = SW[1] + lever * 56 - 40;
  return (
    <Frame f={f} seed={6026} bg={MP.nightDeep} dark>
      <g transform={`translate(0 ${pan})`}>
        {/* 夜空 (町明かりで赤らんだ空 → 真っ暗) */}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-40} y={-200 + i * 70} width={2000} height={72} fill={mixColor(sky1, sky2, i / 11)} />
        ))}
        {/* 天の川と星 */}
        {stars > 0 && (
          <g opacity={stars}>
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={200 + i * 200} cy={-120 + i * 52} rx={200} ry={60} fill={C.milky} opacity={0.12} transform={`rotate(22 ${200 + i * 200} ${-120 + i * 52})`} />
            ))}
            {Array.from({ length: 90 }, (_, i) => {
              const sx = rnd(266, i) * 1920, sy = -190 + rnd(267, i) * 640;
              const tw = 0.55 + 0.45 * Math.sin(f / 7 + i * 1.3);
              const r = i % 7 === 0 ? 4.5 : i % 3 === 0 ? 3 : 2;
              return <circle key={i} cx={sx} cy={sy} r={r} fill="#FFF6D8" opacity={tw * clamp01(stars * 1.5 - (i % 5) * 0.1)} />;
            })}
          </g>
        )}
        {/* 奥のビル */}
        {far.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={640 - b.h} width={b.w} height={b.h + 20} fill={i % 2 ? C.bldg : C.bldgDark} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: Math.floor(b.h / 40) }, (_, r) => Array.from({ length: Math.floor(b.w / 34) }, (_, c) => {
              const lit = isOn(b.b) && rnd(268 + i, r * 9 + c) > 0.3;
              return <rect key={`${r}-${c}`} x={b.x + 12 + c * 34} y={640 - b.h + 16 + r * 40} width={18} height={22} fill={lit ? C.win : C.winOff} />;
            }))}
          </g>
        ))}
        {/* いちばん高いビル (航空灯つき) */}
        <rect x={1290} y={180} width={150} height={480} fill={C.bldgLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1356} y={130} width={18} height={52} fill={C.bldgDark} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 11 }, (_, r) => [0, 1, 2].map((c) => (
          <rect key={`${r}-${c}`} x={1306 + c * 44} y={204 + r * 40} width={26} height={24} fill={isOn(8.5) && (r + c) % 4 ? C.win : C.winOff} />
        )))}
        <circle cx={1365} cy={126} r={12} fill={towerOff ? "#5A2A2A" : MP.bell} stroke={KRP.ink} strokeWidth={3} />
        {!towerOff && <circle cx={1365} cy={126} r={30} fill={MP.bell} opacity={0.3 + 0.2 * Math.sin(f / 3)} />}
        {/* 中ほどのマンション (ベランダの線) */}
        {mid.map((m, i) => (
          <g key={i}>
            <rect x={m.x} y={700 - m.h} width={m.w} height={m.h + 10} fill={i % 2 ? "#5B5470" : "#4B4560"} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.floor(m.h / 46) }, (_, r) => (
              <g key={r}>
                {Array.from({ length: Math.floor(m.w / 52) }, (_, c) => (
                  <rect key={c} x={m.x + 14 + c * 52} y={700 - m.h + 14 + r * 46} width={32} height={26} fill={isOn(3 + (i % 3)) && rnd(270 + i, r * 7 + c) > 0.25 ? C.win : C.winOff} />
                ))}
                <line x1={m.x} y1={700 - m.h + 44 + r * 46} x2={m.x + m.w} y2={700 - m.h + 44 + r * 46} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
              </g>
            ))}
          </g>
        ))}
        {/* 通り: 街灯と信号 */}
        <rect x={-40} y={700} width={2000} height={60} fill="#3A3650" />
        {[200, 760, 1320, 1860].map((lx, i) => (
          <g key={lx}>
            <rect x={lx - 4} y={620} width={8} height={90} fill={MP.iron} />
            <path d={`M ${lx} 622 q 0 -14 22 -14`} stroke={MP.iron} strokeWidth={6} fill="none" />
            <ellipse cx={lx + 24} cy={612} rx={12} ry={6} fill={isOn(i < 2 ? 0 : 1) ? C.win : C.winOff} stroke={KRP.ink} strokeWidth={2} />
            {isOn(i < 2 ? 0 : 1) && <path d={`M ${lx + 14} 616 L ${lx - 10} 704 L ${lx + 58} 704 L ${lx + 34} 616 Z`} fill={C.win} opacity={0.22} />}
          </g>
        ))}
        <g>
          <rect x={1046} y={612} width={8} height={96} fill={MP.iron} />
          <rect x={1020} y={584} width={60} height={30} rx={8} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={1034} cy={599} r={8} fill={isOn(2) ? C.grass : C.winOff} />
          <circle cx={1050} cy={599} r={8} fill={C.winOff} />
          <circle cx={1066} cy={599} r={8} fill={C.winOff} />
        </g>
        {/* 手前の家 (三角屋根) */}
        {houses.map((hx, i) => (
          <g key={hx}>
            <rect x={hx} y={690} width={170} height={90} fill={i % 2 ? "#6A5A6E" : "#5E5064"} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${hx - 14} 694 L ${hx + 85} 640 L ${hx + 184} 694 Z`} fill={C.roofDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <rect x={hx + 24} y={712} width={40} height={36} fill={isOn(Math.floor(i / 3)) ? C.win : C.winOff} stroke={KRP.ink} strokeWidth={3} />
            <rect x={hx + 104} y={712} width={40} height={36} fill={isOn(Math.floor(i / 3)) && i % 2 ? C.win : C.winOff} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 手前の丘 */}
        <path d="M -40 790 Q 400 740 900 770 Q 1400 800 1960 750 L 1960 1200 L -40 1200 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -40 860 Q 600 830 1960 850" stroke={C.hillDark} strokeWidth={10} fill="none" />
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M ${i * 90 + 10} ${790 + Math.sin(i) * 12} l 6 -18 l 6 18`} stroke={C.hillDark} strokeWidth={4} fill="none" />
        ))}
        {/* 電柱と電線 */}
        <rect x={244} y={250} width={32} height={620} fill={C.pole} stroke={KRP.ink} strokeWidth={5} />
        <rect x={190} y={290} width={140} height={18} fill={C.pole} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={204} cy={286} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={316} cy={286} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <path d={`M ${W1[0]} ${W1[1]} Q ${WC[0]} ${WC[1]} ${W2[0]} ${W2[1]}`} stroke={KRP.ink} strokeWidth={5} fill="none" />
        <path d="M 204 286 Q 1000 420 2000 250" stroke={KRP.ink} strokeWidth={4} fill="none" />
        <path d="M 316 286 Q -100 380 -60 320" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {/* フクロウ (電線の上。暗くなると目が光り、首をかしげる) */}
        <MzBOwl x={owlP[0]} y={owlP[1] + 4} s={0.95} f={f} eye={seg(f, 56, 70)} tilt={-20 * easeOut(seg(f, 78, 92)) + Math.sin(f / 20) * 2} />
        {/* 地面から生えた巨大スイッチ */}
        <rect x={SW[0] - 30} y={SW[1] + 180} width={60} height={110} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={SW[0] - 130} y={SW[1] - 180} width={260} height={360} rx={22} fill={C.switchPlate} stroke={KRP.ink} strokeWidth={7} />
        <rect x={SW[0] - 112} y={SW[1] - 162} width={224} height={324} rx={16} fill="none" stroke={KRP.gray} strokeWidth={4} />
        <circle cx={SW[0]} cy={SW[1] - 140} r={9} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={SW[0]} cy={SW[1] + 140} r={9} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
        <rect x={SW[0] - 42} y={SW[1] - 90} width={84} height={180} rx={12} fill="#DCD8CE" stroke={KRP.ink} strokeWidth={5} />
        <rect x={SW[0] - 34} y={SW[1] + lever * 44 - 46} width={68} height={92} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <line x1={SW[0] - 20} y1={SW[1] + lever * 44 + (lever < 0 ? -30 : 30)} x2={SW[0] + 20} y2={SW[1] + lever * 44 + (lever < 0 ? -30 : 30)} stroke={KRP.gray} strokeWidth={5} strokeLinecap="round" />
        {/* パチン! (はじける線) */}
        {burst > 0 && burst < 1 && (
          <g opacity={1 - burst}>
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={SW[0]} y1={SW[1] + 40 - 70 - burst * 30} x2={SW[0]} y2={SW[1] + 40 - 110 - burst * 50} stroke={KRP.yellow} strokeWidth={9} strokeLinecap="round"
                transform={`rotate(${i * 45 + 22} ${SW[0]} ${SW[1] + 40})`} />
            ))}
          </g>
        )}
        {/* 上から来る大きな手 (そで + 人さし指) */}
        <g transform={`translate(0 ${lerp(-520, 0, handIn) - 700 * easeInOut(seg(f, 70, 92))})`}>
          <rect x={SW[0] - 40} y={fingerY - 520} width={150} height={360} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={SW[0] - 48} y={fingerY - 180} width={166} height={34} rx={8} fill={KRP.gray} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${SW[0] - 34} ${fingerY - 146} L ${SW[0] + 108} ${fingerY - 146} Q ${SW[0] + 128} ${fingerY - 60} ${SW[0] + 80} ${fingerY - 30} L ${SW[0] + 24} ${fingerY - 36} Q ${SW[0] - 40} ${fingerY - 60} ${SW[0] - 34} ${fingerY - 146} Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={SW[0] - 14} y={fingerY - 70} width={34} height={84} rx={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${SW[0] + 34} ${fingerY - 70} q 20 6 40 -2 M ${SW[0] + 40} ${fingerY - 96} q 20 6 40 -2`} stroke={KRP.ink} strokeWidth={4} fill="none" />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #27 2013年、アメリカの研究者が、8人を連れて、1週間のキャンプに出かけました。
// 格: 山 / seed 6027
// 絵: どこ: 2013年のアメリカのロッキー山脈のキャンプ場。雪の残る岩山・針葉樹の森・小川・木のテーブル・テント8張り。札は「2013年」「ロッキー山脈」。演出: アメリカの研究者 (実在の人物なので顔を描かない。後ろ姿で地図を広げて先頭を歩く) のあとに、リュックを背負った8人が一列で山道を歩いてくる。8人は男女を混ぜてどちらもひと目で分かる姿: 男性は短い黒髪 (hair="cap")・紺/青/灰の服・ズボン、女性は Person に肩まで届く茶色の長い髪 (左右に垂らす) か後ろで結んだ髪の房を描き足し、服は赤・ピンク・えんじ系、スカート (腰から膝下まで広がる台形) を足す (山歩きなのでスカートの下にタイツの線を足してよい)。途中で1人が木の根につまずき、前の人のリュックにぶつかって、2人とも笑う (face="smile")。キャンプ場に着いた人からテントを広げ始める。札「8人」。腕は2本 (研究者 pose="map" で両手で地図)。動き: f0-120 カメラが山道の列を追って右へパン / f60 つまずき / f120-160 テントが立つ / 小川のきらめき
// どこ: 2013年のロッキー山脈。雪の残る岩山・針葉樹の森・草地の山道・手前の小川・奥にキャンプ場 (木のテーブルとテント8張り)
// 演出: 研究者 (後ろ姿・顔なし) が地図を掲げて先頭を歩き、リュックの8人 (男4・女4、ひと目で分かる姿) が一列で続く。
//       5人目 (灰の服の男性) が木の根につまずいて前の女性のリュックにぶつかり、2人で笑う。着いたらテントが次々に立つ
// 動き: f0-120 カメラが列を追って右へパン / f54-62 つまずき / f120-170 テントが立つ・みんなばんざい / 小川のきらめき
const MZB_HIKERS: { female: boolean; cloth: string; dark: string; pack: string; hs?: "long" | "tail" }[] = [
  { female: false, cloth: C.navy, dark: C.navyDark, pack: KRP.orange },
  { female: true, cloth: C.red, dark: C.tights, pack: C.tentG, hs: "long" },
  { female: false, cloth: C.blue2, dark: C.navyDark, pack: KRP.yellow },
  { female: true, cloth: C.pink, dark: C.tights, pack: C.tentB, hs: "tail" },
  { female: false, cloth: C.grayC, dark: C.navyDark, pack: C.tentR },
  { female: true, cloth: C.enji, dark: C.tights, pack: KRP.yellow, hs: "long" },
  { female: false, cloth: C.navy, dark: C.grayCDark, pack: C.tentG },
  { female: true, cloth: C.red, dark: C.tights, pack: C.tentB, hs: "tail" },
];
const Mz027: React.FC<{ f: number }> = ({ f }) => {
  const camX = -650 * easeInOut(seg(f, 0, 120));
  const walkT = Math.min(f, 120);
  const walking = f < 120;
  const W0 = walkT * 5;
  const trip = seg(f, 54, 62);
  const tripBack = seg(f, 66, 76);
  const GY = 724;
  const sp = 128;
  const hs = 0.58;
  const lead = 1100 + W0;
  const arrived = seg(f, 122, 132);
  return (
    <Frame f={f} seed={6027} bg={C.waterLight}>
      {/* 空 */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-40} y={-40 + i * 70} width={2000} height={72} fill={mixColor("#9FCDEB", "#E4F2F8", i / 7)} />
      ))}
      <g transform={`translate(${camX} 0)`}>
        {/* 遠くの岩山 (雪の残る峰) - 少し遅れてパン */}
        <g transform={`translate(${-camX * 0.45} 0)`}>
          {[[-100, 520, 300, 170], [380, 520, 640, 90], [900, 520, 1100, 150], [1300, 520, 1560, 70], [1800, 520, 2040, 130], [2200, 520, 2450, 100]].map(([x0, y0, px, py], i) => (
            <g key={i}>
              <path d={`M ${x0} ${y0} L ${px} ${py} L ${px + (px - x0) * 1.1} ${y0} Z`} fill={i % 2 ? C.rock : C.rockDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
              <path d={`M ${px - (px - x0) * 0.28} ${py + (y0 - py) * 0.28} L ${px} ${py} L ${px + (px - x0) * 0.3} ${py + (y0 - py) * 0.27} L ${px + 20} ${py + (y0 - py) * 0.2} L ${px - 10} ${py + (y0 - py) * 0.3} Z`}
                fill={C.snow} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d={`M ${px} ${py + 40} L ${px - 40} ${y0}`} stroke={C.rockDark} strokeWidth={5} opacity={0.5} />
            </g>
          ))}
        </g>
        {/* 針葉樹の森 */}
        {Array.from({ length: 30 }, (_, i) => (
          <MzBPine key={i} x={-80 + i * 100 + rnd(271, i) * 40} y={580 + rnd(272, i) * 20} h={170 + rnd(273, i) * 90} sway={Math.sin(f / 25 + i) * 1.2}
            c={i % 3 ? C.pine : C.pineLight} />
        ))}
        {/* 草地 */}
        <rect x={-40} y={570} width={3000} height={560} fill={C.grass} />
        <path d="M -40 570 Q 700 548 1400 572 Q 2100 590 2960 566" stroke={KRP.ink} strokeWidth={5} fill={C.grass} />
        {/* 山道 */}
        <path d={`M -40 ${GY - 30} Q 800 ${GY - 46} 1500 ${GY - 30} Q 2200 ${GY - 16} 2900 ${GY - 40} L 2900 ${GY + 30} Q 2200 ${GY + 44} 1500 ${GY + 30} Q 800 ${GY + 16} -40 ${GY + 34} Z`}
          fill={C.dirt} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 30 }, (_, i) => <ellipse key={i} cx={i * 96 + 20} cy={GY + (i % 3) * 12 - 10} rx={8} ry={4} fill={C.dirtDark} />)}
        {/* 木の根 (つまずく所) */}
        <path d={`M 700 ${GY + 4} q 40 -26 80 0 q 20 -14 40 4`} stroke={MP.woodDark} strokeWidth={12} fill="none" strokeLinecap="round" />
        {/* キャンプ場: 木のテーブルとテント8張り */}
        <g>
          <rect x={1880} y={606} width={180} height={18} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1894} y={624} width={14} height={40} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={2032} y={624} width={14} height={40} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
          <rect x={1870} y={642} width={200} height={10} fill={MP.wood} stroke={KRP.ink} strokeWidth={3} />
          {[C.tentO, C.tentY, C.tentG, C.tentB, C.tentR, C.tentO, C.tentB, C.tentG].map((c, i) => (
            <MzBTent key={i} x={2140 + (i % 4) * 150 + (i >= 4 ? 70 : 0)} y={i >= 4 ? 676 : 612} w={128} c={c} up={easeOut(seg(f, 122 + i * 5, 134 + i * 5))} />
          ))}
        </g>
        {/* 研究者 (先頭。後ろ姿で地図を掲げる) */}
        <g>
          <ellipse cx={lead} cy={GY + 4} rx={40} ry={8} fill={KRP.ink} opacity={0.2} />
          <g transform={`translate(${lead} ${GY - (walking ? Math.abs(Math.sin(f / 4)) * 6 : 0)}) scale(${hs})`}>
            <MzBHito x={0} y={0} f={f} cloth={C.pineLight} clothDark={C.navyDark} back hairColor={C.hairBrownDark} pack={C.dirtDark}
              arms={{ l: [[-60, -220], [40, -262]], r: [[120, -200], [170, -264]] }} />
            {/* 広げた地図 */}
            <g transform="rotate(-6 100 -300)">
              <rect x={20} y={-360} width={170} height={110} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
              <line x1={76} y1={-360} x2={76} y2={-250} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
              <line x1={134} y1={-360} x2={134} y2={-250} stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
              <path d="M 34 -270 Q 80 -330 120 -300 Q 150 -280 176 -340" stroke={KRP.red} strokeWidth={4} strokeDasharray="8 6" fill="none" />
              <path d="M 60 -340 l 14 -18 l 14 18 Z M 96 -336 l 12 -16 l 12 16 Z" fill={C.rock} stroke={KRP.ink} strokeWidth={2} />
              <path d="M 168 -350 l 14 14 M 182 -350 l -14 14" stroke={KRP.red} strokeWidth={4} />
            </g>
          </g>
        </g>
        {/* 8人の列 */}
        {MZB_HIKERS.map((p, i) => {
          const x = lead - sp * (i + 1);
          const isTripper = i === 4, isBumped = i === 3;
          const tripLean = isTripper ? 24 * Math.sin(trip * Math.PI * 0.5) * (1 - tripBack) : 0;
          const shove = isBumped ? 14 * Math.sin(seg(f, 58, 70) * Math.PI) : 0;
          const step = walking ? Math.abs(Math.sin(f / 4 + i * 0.9)) * 6 : 0;
          const face: MzBFace = (isTripper || isBumped) && f >= 56 && f < 66 ? "surprised"
            : (isTripper || isBumped) && f >= 66 ? "joy" : arrived > 0 ? "joy" : "smile";
          return (
            <g key={i}>
              <ellipse cx={x} cy={GY + 4} rx={40} ry={8} fill={KRP.ink} opacity={0.2} />
              <MzBHito x={x + shove + (isTripper ? tripLean * 1.2 : 0)} y={GY - step} s={hs} f={f} phase={i} face={face} cloth={p.cloth} clothDark={p.dark}
                female={p.female} hairStyle={p.hs} pack={p.pack} lean={tripLean + (isBumped ? shove * 0.6 : 0)}
                pose={arrived > 0 ? "banzai" : "stand"} />
            </g>
          );
        })}
        {/* ぶつかった「ぽすっ」 */}
        {trip > 0.6 && f < 72 && (
          <g opacity={1 - seg(f, 62, 72)}>
            {[0, 1, 2].map((q) => (
              <line key={q} x1={lead - sp * 4 - 50} y1={GY - 120 + q * 22} x2={lead - sp * 4 - 74} y2={GY - 126 + q * 26} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
            ))}
          </g>
        )}
        {/* 草地の花とやぶ */}
        {Array.from({ length: 26 }, (_, i) => {
          const gx = i * 110 + rnd(275, i) * 60, gy = 790 + rnd(276, i) * 70;
          return i % 3 === 0 ? (
            <g key={i}>
              <ellipse cx={gx} cy={gy} rx={46} ry={26} fill={C.grassDark} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={gx - 18} cy={gy - 12} rx={22} ry={16} fill={C.leaf} />
            </g>
          ) : (
            <g key={i}>
              <line x1={gx} y1={gy} x2={gx} y2={gy - 22} stroke={C.grassDark} strokeWidth={4} />
              <circle cx={gx} cy={gy - 26} r={8} fill={i % 2 ? C.flowerY : KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          );
        })}
        {/* 手前の小川 (きらめき) */}
        <path d="M -40 900 Q 600 860 1300 900 Q 2000 940 2960 890 L 2960 1000 Q 2000 1040 1300 1000 Q 600 960 -40 1010 Z" fill={C.water} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 24 }, (_, i) => {
          const sx = ((i * 130 + f * 3) % 2900) - 40;
          return <path key={i} d={`M ${sx} ${940 + (i % 3) * 16} q 20 -8 40 0`} stroke={C.waterLight} strokeWidth={5} fill="none" opacity={0.5 + 0.5 * Math.sin(f / 5 + i)} strokeLinecap="round" />;
        })}
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx={i * 250 + 60} cy={900 + (i % 2) * 90} rx={34} ry={16} fill={C.rockLight} stroke={KRP.ink} strokeWidth={3} />
        ))}
      </g>
      <TagPlate x={330} y={215} text="2013年" size={50} t={seg(f, 4, 14)} />
      <TagPlate x={960} y={215} text="ロッキー山脈" size={50} t={seg(f, 8, 18)} />
      <TagPlate x={1600} y={215} text="8人" size={50} t={seg(f, 20, 30)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #28 懐中電灯も、スマホも、なし。明かりは、たき火と、太陽だけです。
// 格: 山 / seed 6028
// 絵: どこ: #27 のキャンプ場の入口の木のテーブル → 夕暮れのキャンプ場。演出: テーブルの上に置いた木箱へ、8人 (男女を混ぜる。#27 と同じ8人の姿) が順番に懐中電灯とスマホを入れていく (どちらも細部を描く: 懐中電灯のスイッチ、スマホの黒い画面)。研究者の後ろ姿の手が木箱のふたをぱたんと閉め、小さな錠前をかちり。とたんに日が沈み、あたりが一気に暗くなって、8人が「うわ」と互いに寄り添う (face="surprised")。次の瞬間、1人がたき火に火を点け、ぱっと8人の顔が橙に照らされる。札は「なし」ではなく、木箱に入れた2つの道具の上に赤い✕が付くだけ。腕は2本 (pose="drop" で片手で入れる)。動き: f0-60 道具を箱へ (8人が順に) / f65 ふたが閉まる・錠前 / f70-100 日が沈む・暗くなる / f100 たき火点火 / f100-150 火の粉・顔に火の光
// どこ: #27 のキャンプ場の入口。夕方の空・岩山・森・奥のテント。中央に木のテーブルと木箱、手前に石を組んだたき火の跡
// 演出: 左右に4人ずつ並んだ8人 (#27 と同じ姿) が、順に懐中電灯とスマホを箱へぽいっと入れる。手前の研究者 (後ろ姿) の手が
//       ふたをぱたんと閉め、錠前をかちり → 箱の上に懐中電灯とスマホの絵と赤い✕。とたんに日が沈んで真っ暗、8人は「うわ」と身を寄せる →
//       ひとりがたき火に火を点け、みんなの顔が橙に照らされる
// 動き: f2-34 8人が順に入れる / f34-40 ふた・錠前 / f36-44 ✕ / f48-90 日が沈み暗くなる・寄り添う / f100 点火 / 火の粉
const Mz028: React.FC<{ f: number }> = ({ f }) => {
  const BOX = { x: 830, y: 500, w: 260, h: 110 };
  const close = easeInOut(seg(f, 34, 40));
  const lock = seg(f, 39, 43);
  const xm = seg(f, 38, 44);
  const sunset = easeInOut(seg(f, 48, 84));
  const huddle = easeOut(seg(f, 62, 86));
  const fire = easeOut(seg(f, 100, 108));
  const darkA = 0.62 * sunset * (1 - 0.45 * fire);
  const FIRE: Pt = [960, 846];
  const GY = 750;
  const ps = 0.6;
  const xs = [120, 260, 400, 540, 1380, 1520, 1660, 1800];
  const surprised = f >= 70 && f < 102;
  const camK = lerp(1, 1.08, easeInOut(seg(f, 60, 150)));
  const item = (kind: number, x: number, y: number, sc = 1, rot = 0) => kind === 0 ? (
    // 懐中電灯 (赤い胴・銀の頭・スイッチ)
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
      <rect x={-30} y={-9} width={46} height={18} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
      <path d="M 14 -12 L 34 -16 L 34 16 L 14 12 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <ellipse cx={34} cy={0} rx={4} ry={15} fill={C.win} stroke={KRP.ink} strokeWidth={2.5} />
      <rect x={-12} y={-14} width={12} height={6} rx={2} fill={KRP.ink} />
      <line x1={-26} y1={-3} x2={6} y2={-3} stroke={KRP.white} strokeWidth={2.5} opacity={0.5} />
    </g>
  ) : (
    // スマホ (黒い画面)
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
      <rect x={-15} y={-26} width={30} height={52} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-11} y={-20} width={22} height={38} rx={2} fill="#1D2230" />
      <path d="M -8 -16 L 0 -16 L -8 -4 Z" fill={KRP.white} opacity={0.25} />
      <circle cx={0} cy={22} r={2} fill={KRP.ink} />
    </g>
  );
  return (
    <Frame f={f} seed={6028} bg={MP.dawnSoft}>
      <g transform={`translate(960 600) scale(${camK}) translate(-960 -600)`}>
        {/* 夕方の空 → 夜 */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-40} y={-40 + i * 66} width={2000} height={68}
            fill={mixColor(mixColor("#8FB7DA", "#F3B36A", i / 8), mixColor(MP.nightDeep, MP.night, i / 8), sunset)} />
        ))}
        {/* 沈む太陽 */}
        <circle cx={1500} cy={lerp(250, 520, sunset)} r={70} fill={MP.dawn} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1500} cy={lerp(250, 520, sunset)} r={110} fill={MP.dawnSoft} opacity={0.3 * (1 - sunset)} />
        {/* 岩山と森 */}
        <path d="M -40 470 L 220 230 L 420 400 L 640 180 L 900 420 L 1160 260 L 1420 430 L 1700 240 L 1960 420 L 1960 560 L -40 560 Z" fill={C.rockDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 640 180 L 590 230 L 620 236 L 660 210 L 700 240 L 690 220 Z M 1700 240 L 1650 290 L 1700 280 L 1750 300 Z M 220 230 L 180 266 L 230 262 L 260 276 Z" fill={C.snow} stroke={KRP.ink} strokeWidth={3} />
        {Array.from({ length: 22 }, (_, i) => (
          <MzBPine key={i} x={-40 + i * 92 + rnd(281, i) * 30} y={560} h={150 + rnd(282, i) * 70} sway={Math.sin(f / 25 + i)} c={i % 3 ? C.pine : C.pineLight} />
        ))}
        <rect x={-40} y={555} width={2000} height={560} fill={C.grass} />
        <line x1={-40} y1={556} x2={1960} y2={556} stroke={KRP.ink} strokeWidth={5} />
        {/* 奥のテント (#27 で立てたもの) */}
        {[C.tentO, C.tentY, C.tentG, C.tentB].map((c, i) => <MzBTent key={i} x={260 + i * 460} y={590} w={110} c={c} />)}
        {/* 木のテーブル */}
        <rect x={700} y={610} width={520} height={24} rx={4} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        <line x1={700} y1={622} x2={1220} y2={622} stroke={MP.woodDark} strokeWidth={3} />
        <rect x={730} y={634} width={22} height={120} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1168} y={634} width={22} height={120} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={700} y={690} width={520} height={14} fill={MP.wood} stroke={KRP.ink} strokeWidth={3} />
        {/* 木箱 (ふたはうしろの縁で開く) */}
        <rect x={BOX.x} y={lerp(BOX.y - 100, BOX.y - 14, close)} width={BOX.w} height={lerp(100, 14, close)} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={BOX.x + 10} y={BOX.y + 4} width={BOX.w - 20} height={22} fill={close < 1 ? "#3A2A1E" : MP.wood} />
        <line x1={BOX.x} y1={BOX.y + 56} x2={BOX.x + BOX.w} y2={BOX.y + 56} stroke={MP.woodDark} strokeWidth={4} />
        <rect x={BOX.x + 6} y={BOX.y} width={12} height={BOX.h} fill={MP.woodDark} opacity={0.6} />
        <rect x={BOX.x + BOX.w - 18} y={BOX.y} width={12} height={BOX.h} fill={MP.woodDark} opacity={0.6} />
        {/* 箱の中に入った道具 (ふたが閉まるまで頭がのぞく) */}
        {close < 0.6 && xs.map((_, i) => f >= 8 + i * 4 && (
          <g key={i}>{item(i % 2, BOX.x + 36 + i * 27, BOX.y + 6, 0.8, -20 + i * 7)}</g>
        ))}
        {/* 錠前 */}
        <g transform={`translate(${BOX.x + BOX.w / 2} ${BOX.y + 22})`} opacity={seg(f, 37, 40)}>
          <path d={`M -14 0 L -14 ${-18 + lock * 8} Q -14 ${-34 + lock * 8} 0 ${-34 + lock * 8} Q 14 ${-34 + lock * 8} 14 ${-18 + lock * 8} L 14 0`} fill="none" stroke={KRP.silver} strokeWidth={6} />
          <rect x={-22} y={-4} width={44} height={36} rx={6} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={10} r={5} fill={KRP.ink} />
          <rect x={-2} y={10} width={4} height={10} fill={KRP.ink} />
        </g>
        {lock > 0.6 && f < 52 && (
          <g opacity={1 - seg(f, 44, 52)}>
            {[0, 1, 2, 3].map((q) => <line key={q} x1={BOX.x + 130} y1={BOX.y - 20} x2={BOX.x + 130} y2={BOX.y - 44} stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" transform={`rotate(${q * 40 - 60} ${BOX.x + 130} ${BOX.y + 30})`} />)}
          </g>
        )}
        {/* 8人 (左に4人・右に4人)。順に道具を箱へ放る → 暗くなると寄り添う */}
        {MZB_HIKERS.map((p, i) => {
          const left = i < 4;
          const t0 = 2 + i * 4;
          const toss = seg(f, t0, t0 + 6);
          const holding = f < t0;
          const tossed = toss >= 1;
          const x0 = xs[i] + (left ? 1 : -1) * huddle * 70;
          const hx = x0 + (left ? 40 : -40), hy = GY - 232 * ps;
          const tx = lerp(hx, BOX.x + 36 + i * 27, toss), ty = lerp(hy, BOX.y + 6, toss) - Math.sin(toss * Math.PI) * 120;
          const face: MzBFace = fire > 0.3 ? "joy" : surprised ? "surprised" : f < 34 ? "smile" : "worried";
          const armUp = !tossed || f < t0 + 8;
          return (
            <g key={i}>
              <ellipse cx={x0} cy={GY + 4} rx={44} ry={9} fill={KRP.ink} opacity={0.2} />
              <MzBHito x={x0} y={GY} s={ps} f={f} phase={i} face={face} cloth={p.cloth} clothDark={p.dark} female={p.female} hairStyle={p.hs}
                lean={(left ? 1 : -1) * 6 * huddle} gaze={surprised ? [0, -4] : [left ? 4 : -4, 0]}
                arms={armUp
                  ? (left ? { l: [[-76, -104], [-78, -66]], r: [[110, -190], [118, -246]] } : { l: [[-110, -190], [-118, -246]], r: [[76, -104], [78, -66]] })
                  : surprised ? { l: [[-96, -150], [-40, -200]], r: [[96, -150], [40, -200]] }
                    : { l: [[-76, -104], [-78, -66]], r: [[76, -104], [78, -66]] }} />
              {/* 投げる道具 */}
              {!tossed && item(i % 2, holding ? x0 + (left ? 70 : -70) : tx, holding ? GY - 250 * ps : ty, 1.1, holding ? 0 : toss * 360)}
            </g>
          );
        })}
        {/* 箱の上の「懐中電灯・スマホ」に赤い✕ */}
        {xm > 0 && (
          <g transform={`translate(960 ${BOX.y - 80}) scale(${pop(xm)})`} opacity={1 - seg(f, 90, 100)}>
            <rect x={-150} y={-54} width={300} height={108} rx={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            {item(0, -70, 0, 1.6)}
            {item(1, 70, 0, 1.4)}
            <g stroke={KRP.red} strokeWidth={14} strokeLinecap="round">
              <line x1={-120} y1={-40} x2={-20} y2={40} /><line x1={-20} y1={-40} x2={-120} y2={40} />
              <line x1={30} y1={-40} x2={110} y2={40} /><line x1={110} y1={-40} x2={30} y2={40} />
            </g>
          </g>
        )}
        {/* たき火 (石の輪) */}
        <MzBFire x={FIRE[0]} y={FIRE[1]} s={1.05} f={f} lit={fire} />
        {/* マッチの火花 (点火の瞬間) */}
        {f >= 96 && f < 104 && <circle cx={FIRE[0] - 30} cy={FIRE[1] - 30} r={10 + (f - 96) * 4} fill={MP.flameCore} opacity={0.8} />}
        {/* 研究者 (手前・後ろ姿)。左手でふたを押さえる */}
        <g>
          <ellipse cx={1210} cy={806} rx={70} ry={12} fill={KRP.ink} opacity={0.2} />
          <MzBHito x={1210} y={800} s={1} f={f} cloth={C.pineLight} clothDark={C.navyDark} back hairColor={C.hairBrownDark}
            arms={f < 30 ? { l: [[-80, -104], [-82, -66]], r: [[80, -104], [82, -66]] }
              : { l: [[-140, -250], [-130, lerp(-400, -312, close)]], r: [[80, -104], [82, -66]] }} />
        </g>
        {/* 暗さ */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={MP.nightDeep} opacity={darkA} />
        {/* 火の明かり (顔が橙に) */}
        {fire > 0 && (
          <g>
            <circle cx={FIRE[0]} cy={FIRE[1] - 120} r={760} fill={MP.dawn} opacity={0.12 * fire} />
            <circle cx={FIRE[0]} cy={FIRE[1] - 80} r={420} fill={MP.glow} opacity={0.14 * fire} />
            <MzBFire x={FIRE[0]} y={FIRE[1]} s={1.05} f={f} lit={fire} />
            <MzBSparks x={FIRE[0]} y={FIRE[1] - 60} f={f} n={16} amt={fire} seed={28} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #29 すると、体の時計が、約2時間、朝のほうへ戻りました。
// 格: 図 / seed 6029
// 絵: どこ: キャンプ場の夜明けのテントの中 (テントの布の縫い目・寝袋・テントの入口から朝の光)。寝袋で眠る1人 (#27 の8人のうちの男性) の頭の上に、透けて見える体の中の小部屋と TainaiDokei (lag=0.5, reset=0, s=1.2)。演出: テントの外で、まだ暗いうちに朝の光がじわっと増える。すると TainaiDokei の中の Kobito が2人、長い針に肩を入れて「よいしょ」と押し、針を反対回りにぐぐぐっと戻していく。文字盤の外周に、戻った分の弧が橙の矢印で描かれ、札「約2時間」。寝袋の人は、テントの入口が明るくなると同時に、ぱちっと目を開けて自分から起き上がる (face="smile")。腕は2本 (Kobito pose="push")。動き: f0-40 テントの外が明るくなる / f40-120 針が反対回りに戻る (矢印が伸びる) / f120 寝袋の人が起き上がる / カメラは時計に寄ってから、少し引いて寝袋の人も入れる
// どこ: キャンプの夜明けのテントの中 (布の縫い目・張り綱・右の入口から朝の光・寝袋・丸めた上着の枕・ランタン)
// 演出: 寝袋の男性 (#27 の紺の服の男性) の頭から泡がのび、透けて見える体の中の小部屋に体内時計。
//       入口が明るくなると、小人2人が長い針の下に入って「よいしょ」と押し上げ、針が反対回りに2時間ぶん戻る。
//       外周に橙の戻り矢印と札「約2時間」。入口がすっかり明るくなると、男性はぱちっと目を開けて自分から起き上がる
// 動き: f0-30 入口が明るくなる / f14-42 針が反対回り (f45 で戻りきる) / f100-114 起き上がる / カメラは時計に寄ってから f90-140 で少し引く
const Mz029: React.FC<{ f: number }> = ({ f }) => {
  const light = easeOut(seg(f, 0, 30));
  const back = easeInOut(seg(f, 14, 42));
  const wake = easeInOut(seg(f, 100, 114));
  const cam = lerp(1.08, 1, easeInOut(seg(f, 90, 140)));
  const CK: Pt = [1110, 380];
  const cs = 1.2;
  const a0 = 104, a1 = 74;
  const ang = lerp(a0, a1, back) + (back > 0 && back < 1 ? Math.sin(f * 1.3) * 0.8 : 0);
  const lap = 360 + 25;
  const toP = (deg: number, r: number): Pt => [CK[0] + Math.sin((deg * Math.PI) / 180) * r * cs, CK[1] - Math.cos((deg * Math.PI) / 180) * r * cs];
  const Ro = 268;
  const arcEnd = toP(ang, Ro);
  const arcStart = toP(a0, Ro);
  const tang = ((ang - 90) * Math.PI) / 180; // 反時計回りの向き
  const tipDir: Pt = [-Math.cos((ang * Math.PI) / 180), -Math.sin((ang * Math.PI) / 180)];
  void tang;
  const HIP: Pt = [850, 742];
  const ps = 0.9;
  return (
    <Frame f={f} seed={6029} bg={C.tentInDark}>
      <g transform={`translate(1000 450) scale(${cam}) translate(-1000 -450)`}>
        {/* テントの布 (内側)。縫い目が上の一点に集まる */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={mixColor(C.tentInDark, C.tentIn, light * 0.8)} />
        {[-200, 200, 600, 1000, 1400, 1800, 2200].map((bx, i) => (
          <path key={i} d={`M 960 -80 L ${bx} 1100`} stroke={mixColor("#9A6A3A", C.tentInDark, light * 0.4)} strokeWidth={6} strokeDasharray="18 10" fill="none" />
        ))}
        <path d="M -60 120 Q 960 40 1980 120" stroke={C.tentInDark} strokeWidth={10} fill="none" opacity={0.6} />
        {/* つり下げたランタン (消えている) と物干しひも */}
        <line x1={200} y1={110} x2={700} y2={80} stroke={KRP.ink} strokeWidth={3} />
        <path d="M 300 104 l 0 60 l 70 0 l 0 -64" fill={C.redDark} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${Math.sin(f / 20) * 2} 300 104)`} />
        <line x1={460} y1={95} x2={460} y2={150} stroke={KRP.ink} strokeWidth={3} />
        <rect x={438} y={150} width={44} height={60} rx={8} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={4} />
        <rect x={446} y={160} width={28} height={40} rx={4} fill={C.winOff} opacity={0.7} />
        {/* 右の入口 (朝の光) */}
        <path d="M 1560 1100 L 1760 300 L 1980 1100 Z" fill={mixColor("#5A5890", "#FFE9B8", light)} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1560 1100 L 1760 300 L 1700 1100 Z" fill={C.tentO} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1780} cy={300} r={10} fill={KRP.ink} />
        {light > 0 && <path d="M 1640 900 L 1900 900 L 1100 1100 L 300 1100 Z" fill="#FFF1B8" opacity={0.3 * light} />}
        {light > 0 && <circle cx={1800} cy={640} r={240} fill="#FFF1B8" opacity={0.25 * light} />}
        {/* 床 */}
        <path d="M -60 800 L 1980 800 L 1980 1100 L -60 1100 Z" fill={mixColor("#6E5A4A", "#9E8466", light)} />
        <line x1={-60} y1={800} x2={1980} y2={800} stroke={KRP.ink} strokeWidth={5} />
        {/* 丸めた上着の枕・靴 */}
        <ellipse cx={640} cy={770} rx={80} ry={30} fill={C.navy} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1360 790 q 20 -40 70 -30 l 20 30 Z M 1440 796 q 20 -40 70 -30 l 20 30 Z" fill={C.dirtDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 寝袋の男性 (#27 の紺の男性)。腰を軸に起き上がる */}
        <g transform={`translate(${HIP[0]} ${HIP[1]}) rotate(${lerp(-88, -4, wake)})`}>
          <MzBHito x={0} y={58 * ps} s={ps} f={f} phase={0} cloth={C.navy} clothDark={C.navyDark}
            face={wake > 0.2 ? "smile" : f >= 96 ? "surprised" : "joy"} pose={wake > 0.6 ? "banzai" : "stand"} />
        </g>
        {/* 寝袋 */}
        <path d="M 740 716 Q 736 690 790 690 L 1270 690 Q 1320 700 1320 746 Q 1320 800 1270 800 L 790 800 Q 736 800 740 760 Z"
          fill={C.sleepBag1} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 780 700 L 1300 700" stroke={MP.bellDark} strokeWidth={4} />
        {[880, 980, 1080, 1180].map((qx) => <line key={qx} x1={qx} y1={694} x2={qx + 6} y2={796} stroke={MP.bellDark} strokeWidth={4} />)}
        <path d="M 760 750 L 1300 750" stroke={KRP.silver} strokeWidth={5} strokeDasharray="6 4" />
        {/* ねむりの「z」→ 起きたら消える */}
        {wake < 0.1 && [0, 1, 2].map((i) => {
          const t = ((f + i * 14) % 42) / 42;
          return <text key={i} x={600 - t * 40 + i * 10} y={640 - t * 90} fontFamily={FONT} fontWeight={900} fontSize={30 + i * 6}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={3} paintOrder="stroke" opacity={1 - t}>z</text>;
        })}
        {/* 頭から体の中の小部屋への泡 */}
        {[[700, 600, 16], [740, 540, 22], [790, 480, 28]].map(([bx, by, br], i) => (
          <circle key={i} cx={bx} cy={by} r={br} fill={KRP.white} opacity={0.75} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 透けて見える小部屋 */}
        <rect x={780} y={40} width={660} height={680} rx={60} fill={C.wallPink} opacity={0.88} stroke={KRP.ink} strokeWidth={5} strokeDasharray="20 10" />
        <path d="M 800 200 Q 860 170 900 230 M 1420 520 Q 1360 560 1380 640" stroke={C.vein} strokeWidth={6} fill="none" />
        {/* 体内時計 (はみ出しあり。針は手で戻す) */}
        <TainaiDokei x={CK[0]} y={CK[1]} s={cs} f={f} lag={0.5} reset={0} hand={ang / lap} label={false} />
        {/* 戻った分の橙の弧と矢印 */}
        {back > 0.02 && (
          <g>
            <path d={`M ${arcStart[0]} ${arcStart[1]} A ${Ro * cs} ${Ro * cs} 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`} stroke={KRP.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d={`M ${arcStart[0]} ${arcStart[1]} A ${Ro * cs} ${Ro * cs} 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`} stroke={KRP.orange} strokeWidth={13} fill="none" strokeLinecap="round" />
            <polygon points={`${arcEnd[0] + tipDir[0] * 34},${arcEnd[1] + tipDir[1] * 34} ${arcEnd[0] - tipDir[1] * 22},${arcEnd[1] + tipDir[0] * 22} ${arcEnd[0] + tipDir[1] * 22},${arcEnd[1] - tipDir[0] * 22}`}
              fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}
        {/* 小人2人が針の下に入って押し上げる */}
        {[96, 150].map((r, i) => {
          const P = toP(ang, r);
          const ks = 0.3;
          return (
            <g key={i}>
              <Kobito x={P[0] - 8} y={P[1] + 313 * ks - 4} s={ks} f={f} pose="hang" lean={-8}
                face={back > 0 && back < 1 ? "worried" : back >= 1 ? "joy" : "normal"} phase={i + 2} />
              {back > 0 && back < 1 && (
                <path d={`M ${P[0] + 46} ${P[1] + 50} q 10 -6 18 0 M ${P[0] + 46} ${P[1] + 66} q 10 -6 18 0`} stroke={KRP.ink} strokeWidth={4} fill="none" />
              )}
            </g>
          );
        })}
      </g>
      <TagPlate x={1660} y={170} text="約2時間" size={54} t={seg(f, 28, 38)} color={KRP.orange} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #30 しかも、夜型の人ほど、大きく戻りました。
// 格: 図 / seed 6030
// 絵: どこ: キャンプ場の大きなテントの中を、天井から見下ろす俯瞰。8つの寝袋が並ぶ (8人は男女を混ぜる: 男性は短い黒髪、女性は茶色の長い髪が寝袋から広がっている)。演出: それぞれの寝袋の上に小さな時計 (TainaiDokei と同じ形のミニ版、s=0.35) が浮かび、全部の針が反対回りに戻り始める。8人のうち3人の寝袋には「夜型」の目印としてフクロウの刺しゅうのワッペンが付いていて、その3人の時計の戻りの矢印だけが、ぐいーんとほかの倍の長さに伸びていく。いちばん大きく戻った人は、寝袋の中でごろんと寝返り。札は数字を出さず、矢印の長さで見せる。動き: f0-40 カメラが天井から寝袋の列を見下ろす / f40-120 8つの矢印が伸びる (夜型の3つだけ長く) / f125 寝返り / カメラはフクロウのワッペンの人へ寄る
// どこ: キャンプの大きなテントを天井から見下ろす。床布・縫い目・すみの荷物 (靴・水筒・本・カップ)。寝袋8つが2列
// 演出: 8人 (男4・女4。女性は茶色の長い髪が枕に広がる) の寝袋の上に小さな体内時計。全部の針が反対回りに戻る。
//       フクロウのワッペンの3人 (夜型) だけ、戻りの矢印がほかの倍以上ぐいーんと伸びる。いちばん大きく戻った人がごろんと寝返り
// 動き: f0-12 見下ろし / f10-40 矢印が伸びる (f45 で全部伸びきって長短がはっきり) / f56-70 寝返り / f50-100 カメラがその人へ寄る
const Mz030: React.FC<{ f: number }> = ({ f }) => {
  const cols = [300, 740, 1180, 1620];
  const bags = MZB_HIKERS.map((p, i) => ({ ...p, x: cols[i % 4], y: i < 4 ? 120 : 520, owl: i === 1 || i === 4 || i === 6, big: i === 6 }));
  const grow = easeInOut(seg(f, 10, 40));
  const roll = easeInOut(seg(f, 56, 70));
  const zoom = easeInOut(seg(f, 50, 100));
  const tgt = bags[6];
  const k = lerp(1, 1.3, zoom);
  const fx = lerp(960, tgt.x, zoom), fy = lerp(470, tgt.y + 200, zoom);
  const bagCols = [C.sleepBag1, C.sleepBag2, C.sleepBag3, C.sleepBag4];
  return (
    <Frame f={f} seed={6030} bg={C.grass}>
      <g transform={`translate(${fx} ${fy}) scale(${k}) translate(${-fx} ${-fy})`}>
        {/* テントの外の草 */}
        <rect x={-100} y={-100} width={2120} height={1280} fill={C.grass} />
        {Array.from({ length: 40 }, (_, i) => (
          <path key={i} d={`M ${rnd(301, i) * 1920} ${rnd(302, i) * 1080} l 5 -14 l 5 14`} stroke={C.grassDark} strokeWidth={4} fill="none" />
        ))}
        {/* テントの床 (八角形) と縫い目 */}
        <path d="M 160 -40 L 1760 -40 L 1940 160 L 1940 900 L 1760 1100 L 160 1100 L -20 900 L -20 160 Z" fill={C.tentIn} stroke={KRP.ink} strokeWidth={8} />
        {[[-20, 160], [1940, 160], [-20, 900], [1940, 900], [960, -40], [960, 1100]].map(([sx, sy], i) => (
          <line key={i} x1={960} y1={500} x2={sx} y2={sy} stroke={C.tentInDark} strokeWidth={5} strokeDasharray="16 10" />
        ))}
        <circle cx={960} cy={500} r={22} fill={C.tentInDark} stroke={KRP.ink} strokeWidth={4} />
        {/* すみの荷物 */}
        <rect x={60} y={460} width={90} height={60} rx={10} fill={C.blue2} stroke={KRP.ink} strokeWidth={4} transform="rotate(-12 105 490)" />
        <path d="M 1830 450 q 30 -40 60 0 l 0 70 l -60 0 Z" fill={C.dirtDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1860} cy={600} r={24} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1860} cy={600} r={10} fill={KRP.grayDark} />
        <rect x={50} y={940} width={80} height={56} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} transform="rotate(14 90 968)" />
        {/* 寝袋8つ */}
        {bags.map((b, i) => {
          const rr = b.big ? roll : 0;
          const bx = b.x + rr * 30;
          const by = b.y;
          const hairC = b.female ? C.hairBrown : KRP.ink;
          return (
            <g key={i}>
              <g transform={`rotate(${rr * 14} ${bx} ${by + 180})`}>
                {/* 枕 */}
                <rect x={bx - 80} y={by - 10} width={160} height={70} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                {/* 寝袋 */}
                <path d={`M ${bx - 86} ${by + 60} Q ${bx - 90} ${by + 30} ${bx - 60} ${by + 30} L ${bx + 60} ${by + 30} Q ${bx + 90} ${by + 30} ${bx + 86} ${by + 60} L ${bx + 70} ${by + 320} Q ${bx} ${by + 350} ${bx - 70} ${by + 320} Z`}
                  fill={bagCols[i % 4]} stroke={KRP.ink} strokeWidth={6} />
                {[90, 150, 210, 270].map((qy) => <path key={qy} d={`M ${bx - 80} ${by + qy} Q ${bx} ${by + qy + 12} ${bx + 80} ${by + qy}`} stroke={KRP.ink} strokeWidth={3} opacity={0.3} fill="none" />)}
                <path d={`M ${bx - 50} ${by + 74} Q ${bx} ${by + 92} ${bx + 50} ${by + 74}`} stroke={KRP.ink} strokeWidth={5} fill="none" />
                {/* 頭 (上から見た寝顔) */}
                <g transform={`translate(${bx} ${by + 34}) rotate(${rr * 70})`}>
                  {b.female && <path d="M -70 -10 Q -84 -60 -40 -66 Q 0 -80 40 -66 Q 84 -60 70 -10 Q 86 30 60 40 L -60 40 Q -86 30 -70 -10 Z" fill={hairC} stroke={KRP.ink} strokeWidth={4} />}
                  <circle r={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
                  <path d={b.female ? "M -42 -12 Q -40 -48 0 -48 Q 40 -48 42 -12 Q 20 -30 0 -24 Q -20 -32 -42 -12 Z" : "M -42 -8 Q -42 -48 0 -48 Q 42 -48 42 -8 Q 20 -28 0 -26 Q -20 -28 -42 -8 Z"} fill={hairC} />
                  <path d="M -24 4 q 8 6 16 0 M 8 4 q 8 6 16 0" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
                  <path d="M -6 22 q 6 4 12 0" stroke={KRP.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                </g>
                {/* フクロウのワッペン (夜型) */}
                {b.owl && <MzBOwlPatch x={bx + 44} y={by + 284} s={1.1} />}
              </g>
            </g>
          );
        })}
        {/* 寝袋の上の小さな体内時計と、戻りの矢印 */}
        {bags.map((b, i) => {
          const cx = b.x + (b.big ? roll * 30 : 0), cy = b.y + 180;
          const span = b.big ? 120 : b.owl ? 96 : 42;
          const a0 = 130;
          const ang = a0 - span * grow;
          const R = 108;
          const pt = (d: number): Pt => [cx + Math.sin((d * Math.PI) / 180) * R, cy - Math.cos((d * Math.PI) / 180) * R];
          const s0 = pt(a0), s1 = pt(ang);
          const td: Pt = [-Math.cos((ang * Math.PI) / 180), -Math.sin((ang * Math.PI) / 180)];
          const col = b.owl ? MP.bell : KRP.orange;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={92} fill={KRP.white} opacity={0.35} />
              <TainaiDokei x={cx} y={cy} s={0.35} f={f} lag={0.5} reset={0} hand={ang / 385} kobito={false} label={false} />
              {grow > 0.02 && (
                <g>
                  <path d={`M ${s0[0]} ${s0[1]} A ${R} ${R} 0 ${span * grow > 180 ? 1 : 0} 0 ${s1[0]} ${s1[1]}`} stroke={KRP.ink} strokeWidth={20} fill="none" strokeLinecap="round" />
                  <path d={`M ${s0[0]} ${s0[1]} A ${R} ${R} 0 ${span * grow > 180 ? 1 : 0} 0 ${s1[0]} ${s1[1]}`} stroke={col} strokeWidth={12} fill="none" strokeLinecap="round" />
                  <polygon points={`${s1[0] + td[0] * 30},${s1[1] + td[1] * 30} ${s1[0] - td[1] * 20},${s1[1] + td[0] * 20} ${s1[0] + td[1] * 20},${s1[1] - td[0] * 20}`}
                    fill={col} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
                </g>
              )}
            </g>
          );
        })}
        {/* ごろん (寝返りの線) */}
        {roll > 0 && roll < 1 && (
          <g opacity={Math.sin(roll * Math.PI)}>
            <path d={`M ${tgt.x - 130} ${tgt.y + 120} q -30 60 0 120`} stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d={`M ${tgt.x - 154} ${tgt.y + 110} q -36 76 0 150`} stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #31 夜型の人、じつは電気のせいだった説、浮上です。
// 格: 山 / seed 6031
// 絵: どこ: 夜のキャンプ場のたき火のそば (針葉樹・星空・テント・切り株の椅子)。演出: ★笑いどころ。フクロウのワッペンの夜型の男性 (短い黒髪・紺の上着・ズボン) の頭の上に、ひもで「夜型」の木の札がぶら下がっている。山の風がひゅうっと吹いて札がくるりと裏返ると、札の裏側から電球が1個ぶら下がっていて、そこからコードがにょろにょろ伸びている。カメラがコードを追って右へパンすると、コードは森の中の1本の木の幹に付いたコンセントに差さっている。リスがそのプラグを両手で引っこ抜き、電球がふっと消える。男性は札を見上げて、口をあんぐり (face="surprised")。腕は2本 (男性 pose="point" で札を指さす)。動き: f0-30 札が揺れる / f30 くるり / f30-60 電球とコード / f60-120 カメラがコードを追ってパン / f120 リスがプラグを抜く / f130-160 カメラが戻って男性のあんぐり顔
// どこ: 夜のキャンプ場。星空・針葉樹・奥のテント・左手前のたき火・切り株の椅子。左の松の枝が男性の頭の上まで張り出す
// 演出: ★笑いどころ。フクロウのワッペンの夜型の男性 (紺の上着・短い黒髪) の頭上に、枝からひもで「夜型」の木の札。
//       山の風で札がくるりと1回転すると、札の裏から明るい電球が出てきてぶら下がり (札は表の「夜型」に戻る)、コードが地面をにょろにょろ右の木まで伸びて、幹のコンセントに刺さっている。
//       リスがプラグを両手で引っこ抜き、電球がふっと消える。札を指さしていた男性は口をあんぐり
// 動き: f0-12 男性と札に寄り / f8-16 風 / f12-36 くるりと1回転 / f18-38 カメラが引いてコードの先 (木のコンセント) まで見せる / f48-56 リスが抜く・消灯 / f64-92 カメラが男性のあんぐり顔へ戻る
const Mz031: React.FC<{ f: number }> = ({ f }) => {
  const wind = seg(f, 6, 18);
  const flip = easeInOut(seg(f, 12, 20)) + easeInOut(seg(f, 28, 36));
  const revealed = f >= 16;
  const sx = Math.cos(flip * Math.PI);
  const backSide = sx < 0;
  const pull = easeOut(seg(f, 48, 56));
  const lit = revealed && pull < 0.5;
  const swing = Math.sin(f / 9) * (2 + 6 * (1 - seg(f, 20, 60))) + wind * (1 - wind) * 30;
  const out = easeInOut(seg(f, 18, 38));
  const back = easeInOut(seg(f, 64, 92));
  const k = lerp(lerp(1.35, 1, out), 1.32, back);
  const cx = lerp(lerp(660, 960, out), 660, back), cy = lerp(lerp(430, 540, out), 520, back);
  const MAN: Pt = [660, 770];
  const SIGN: Pt = [660, 282];
  const OUT: Pt = [1520, 610];
  const shocked = f >= 54;
  // 電球の位置 (札の下にぶら下がる・揺れる)
  const bulbX = SIGN[0] + Math.sin((swing * Math.PI) / 180) * 120;
  const bulbY = SIGN[1] + 120;
  return (
    <Frame f={f} seed={6031} bg={MP.nightDeep} dark>
      <g transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>
        {/* 夜空と星・月 */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={-60} y={-60 + i * 80} width={2040} height={82} fill={mixColor(MP.nightDeep, MP.night, i / 9)} />
        ))}
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={rnd(311, i) * 1920} cy={rnd(312, i) * 480} r={i % 5 ? 2.2 : 3.6} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 8 + i)} />
        ))}
        <circle cx={1700} cy={140} r={50} fill="#F3E3A0" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1722} cy={126} r={44} fill={MP.nightDeep} opacity={0.0} />
        {/* 奥の森とテント */}
        {Array.from({ length: 22 }, (_, i) => (
          <MzBPine key={i} x={-60 + i * 95 + rnd(313, i) * 30} y={640} h={200 + rnd(314, i) * 90} c={C.pineDark} d="#1A3328" sway={Math.sin(f / 20 + i) * 1.5 + wind * (1 - wind) * 8} />
        ))}
        <rect x={-60} y={636} width={2040} height={500} fill="#3E4A3A" />
        <line x1={-60} y1={637} x2={1980} y2={637} stroke={KRP.ink} strokeWidth={5} />
        <MzBTent x={1060} y={660} w={180} c={C.tentB} />
        <MzBTent x={1260} y={650} w={140} c={C.tentO} />
        {/* たき火の明かり (地面) */}
        <ellipse cx={300} cy={830} rx={420} ry={120} fill={MP.dawn} opacity={0.22} />
        {/* 左の松と、張り出した枝 */}
        <rect x={150} y={60} width={60} height={720} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 200 200 Q 450 180 ${SIGN[0] + 160} 214`} stroke={MP.woodDark} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d={`M 200 200 Q 450 180 ${SIGN[0] + 160} 214`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5} />
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={260 + i * 110} cy={190 - (i % 2) * 20} rx={70} ry={28} fill={C.pineDark} stroke={KRP.ink} strokeWidth={3} />)}
        <path d="M 60 120 L 180 -20 L 300 120 Z M 40 260 L 180 90 L 320 260 Z" fill={C.pineDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 電球のコード (札の下 → 男性の後ろを下りて → 地面をにょろにょろ → 右の木のコンセント) */}
        {revealed && (
          <path d={`M ${bulbX} ${bulbY - 40} Q ${bulbX + 60} ${bulbY + 60} 780 640 Q 820 760 900 740 Q 1000 700 1080 760 Q 1180 820 1280 740 Q 1380 680 ${OUT[0] - 70 - pull * 40} ${OUT[1] + 10}`}
            stroke={KRP.ink} strokeWidth={7} fill="none" strokeLinecap="round" opacity={seg(f, 16, 20)} />
        )}
        {/* 右の木とコンセント */}
        <rect x={OUT[0] - 10} y={180} width={120} height={600} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${OUT[0] + 20} 260 q 10 60 0 120 M ${OUT[0] + 80} 420 q -10 60 0 120`} stroke={MP.woodDark} strokeWidth={5} fill="none" />
        <path d={`M ${OUT[0] - 160} 260 L ${OUT[0] + 50} -40 L ${OUT[0] + 260} 260 Z M ${OUT[0] - 120} 110 L ${OUT[0] + 50} -120 L ${OUT[0] + 220} 110 Z`} fill={C.pine} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={OUT[0] - 4} y={OUT[1] - 40} width={64} height={84} rx={8} fill={C.switchPlate} stroke={KRP.ink} strokeWidth={5} />
        <rect x={OUT[0] + 16} y={OUT[1] - 16} width={6} height={18} fill={KRP.ink} />
        <rect x={OUT[0] + 34} y={OUT[1] - 16} width={6} height={18} fill={KRP.ink} />
        {/* プラグ (抜ける) */}
        <g transform={`translate(${-pull * 60} ${pull * 20}) rotate(${-pull * 25} ${OUT[0]} ${OUT[1]})`} opacity={revealed ? 1 : 0}>
          <rect x={OUT[0] - 40} y={OUT[1] - 22} width={56} height={40} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={OUT[0] - 70} y1={OUT[1] + 10} x2={OUT[0] - 40} y2={OUT[1]} stroke={KRP.ink} strokeWidth={7} />
        </g>
        {/* リス (幹にとまって、プラグを両手で引っこ抜く) */}
        <g transform={`translate(${OUT[0] - 46 - pull * 50} ${OUT[1] - 54 + pull * 14}) rotate(${-pull * 20})`}>
          <path d="M 30 10 Q 90 -10 80 -80 Q 70 -120 40 -100 Q 64 -60 30 -20 Z" fill={C.squirrel} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 40 -10 Q 70 -40 60 -80" stroke={C.squirrelLight} strokeWidth={8} fill="none" opacity={0.7} />
          <ellipse cx={14} cy={8} rx={26} ry={32} fill={C.squirrel} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={8} cy={14} rx={14} ry={20} fill={C.squirrelLight} />
          <circle cx={4} cy={-34} r={20} fill={C.squirrel} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 8 -52 L 14 -66 L 18 -50 Z" fill={C.squirrel} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={-4} cy={-36} r={4} fill={KRP.ink} />
          <circle cx={-18} cy={-28} r={4} fill={KRP.ink} />
          <circle cx={-4} cy={20} r={7} fill={C.squirrelLight} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={-10} cy={30} r={7} fill={C.squirrelLight} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {pull > 0 && pull < 1 && (
          <g opacity={1 - pull}>
            {[0, 1, 2].map((q) => <line key={q} x1={OUT[0] - 10} y1={OUT[1] - 50 + q * 30} x2={OUT[0] + 20 + q * 6} y2={OUT[1] - 70 + q * 34} stroke={KRP.yellow} strokeWidth={5} strokeLinecap="round" />)}
          </g>
        )}
        {/* 切り株の椅子 */}
        <rect x={420} y={700} width={110} height={70} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={475} cy={700} rx={55} ry={16} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={475} cy={700} rx={30} ry={8} fill="none" stroke={MP.woodDark} strokeWidth={3} />
        {/* 電球の明かり */}
        {lit && <circle cx={bulbX} cy={bulbY + 20} r={300} fill={MP.glow} opacity={0.18 + 0.03 * Math.sin(f / 3)} />}
        {/* 男性 (夜型・フクロウのワッペン)。札を指さす */}
        <ellipse cx={MAN[0]} cy={MAN[1] + 4} rx={60} ry={12} fill={KRP.ink} opacity={0.3} />
        <MzBHito x={MAN[0]} y={MAN[1]} s={0.88} f={f} phase={7} cloth={C.navy} clothDark={C.navyDark}
          face={shocked ? "surprised" : "normal"} gaze={[0, -6]}
          arms={{ l: [[-80, -104], [-82, -66]], r: [[120, -220], [118, -316 - (shocked ? 6 : 0)]] }} lean={shocked ? -4 : 0} />
        <MzBOwlPatch x={MAN[0] - 26 * 0.88 - 4} y={MAN[1] - 126 * 0.88} s={0.8} />
        {shocked && (
          <g opacity={seg(f, 54, 60)}>
            <path d={`M ${MAN[0] - 90} ${MAN[1] - 290} l -20 -24 M ${MAN[0] + 90} ${MAN[1] - 290} l 20 -24 M ${MAN[0]} ${MAN[1] - 300} l 0 -26`} stroke={KRP.white} strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {/* 札 (ひもで枝からぶら下がる。くるりと裏返る) */}
        <g transform={`rotate(${swing} ${SIGN[0]} 214)`}>
          <line x1={SIGN[0] - 70} y1={214} x2={SIGN[0] - 70} y2={SIGN[1] - 40} stroke={KRP.ink} strokeWidth={4} />
          <line x1={SIGN[0] + 70} y1={214} x2={SIGN[0] + 70} y2={SIGN[1] - 40} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`translate(${SIGN[0]} ${SIGN[1]}) scale(${Math.max(0.04, Math.abs(sx))} 1)`}>
            <rect x={-110} y={-44} width={220} height={88} rx={10} fill={backSide ? MP.woodDark : MP.woodLight} stroke={KRP.ink} strokeWidth={6} />
            <line x1={-96} y1={-14} x2={96} y2={-18} stroke={MP.wood} strokeWidth={3} />
            <line x1={-96} y1={20} x2={96} y2={16} stroke={MP.wood} strokeWidth={3} />
            {!backSide && <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.ink}>夜型</text>}
          </g>
        </g>
        {/* 札の裏からぶら下がる電球 */}
        {revealed && (
          <g transform={`rotate(${swing} ${SIGN[0]} 214)`} opacity={seg(f, 16, 20)}>
            <line x1={SIGN[0]} y1={SIGN[1] + 44} x2={SIGN[0]} y2={SIGN[1] + 76} stroke={KRP.ink} strokeWidth={6} />
            <rect x={SIGN[0] - 16} y={SIGN[1] + 76} width={32} height={30} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${SIGN[0] - 16} ${SIGN[1] + 84} h 32 M ${SIGN[0] - 16} ${SIGN[1] + 94} h 32`} stroke={KRP.ink} strokeWidth={2} />
            <path d={`M ${SIGN[0] - 16} ${SIGN[1] + 106} Q ${SIGN[0] - 52} ${SIGN[1] + 140} ${SIGN[0] - 30} ${SIGN[1] + 176} Q ${SIGN[0]} ${SIGN[1] + 200} ${SIGN[0] + 30} ${SIGN[1] + 176} Q ${SIGN[0] + 52} ${SIGN[1] + 140} ${SIGN[0] + 16} ${SIGN[1] + 106} Z`}
              fill={lit ? C.win : "#E8E4D8"} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${SIGN[0] - 8} ${SIGN[1] + 110} l 0 30 l 8 -10 l 8 10 l 0 -30`} stroke={lit ? KRP.orange : KRP.grayDark} strokeWidth={3} fill="none" />
            {lit && [0, 1, 2, 3, 4, 5].map((q) => (
              <line key={q} x1={SIGN[0]} y1={SIGN[1] + 150 - 64} x2={SIGN[0]} y2={SIGN[1] + 150 - 86} stroke={C.win} strokeWidth={6} strokeLinecap="round"
                transform={`rotate(${q * 60 + 30} ${SIGN[0]} ${SIGN[1] + 150})`} />
            ))}
          </g>
        )}
        {/* 山の風 */}
        {wind > 0 && wind < 1 && (
          <g opacity={Math.sin(wind * Math.PI)} stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round">
            <path d={`M ${200 + wind * 500} 300 q 80 -30 160 0 q 40 14 20 40`} />
            <path d={`M ${120 + wind * 500} 380 q 100 -24 200 0`} />
          </g>
        )}
        {/* 左手前のたき火 */}
        <MzBFire x={260} y={850} s={0.9} f={f} />
        <MzBSparks x={260} y={790} f={f} n={10} seed={31} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #32 ちなみに、昔の人は、日の出とともに起きて、日の入りとともに寝た、とよく言われます。
// 格: 並 / seed 6032
// 絵: どこ: 町かどの古い紙芝居の木の舞台 (自転車の荷台に載った引き出し付きの枠・拍子木)。舞台の絵は昔の村の素朴な挿絵。絵の外枠全体を点線で囲み、隅に「?」の判子を押して「言い伝え」であることを示す。演出: 紙芝居の1枚目: 日の出と同時に、村の男性 (短い黒髪・灰の服・ズボン) がぱっと飛び起きる。2枚目: 日が沈んだ瞬間、同じ男性がスイッチを切ったようにばたんと寝る (あまりにきっちりしすぎていて、少しおかしい)。紙芝居屋の手 (顔は描かず腕だけ) が絵をすっと引き抜く。前に座った子どもたち (男の子と女の子。女の子は茶色の髪の房とスカート) が、首をかしげて顔を見合わせる。腕は2本 (紙芝居屋は pose="pull")。動き: f0-60 1枚目 (飛び起きる) / f60 絵を引き抜く / f60-120 2枚目 (ばたん) / f120-150 子どもが首をかしげる / カメラは舞台へ寄る
// どこ: 町かどの夕方。板べいの古い家並み・電柱・石畳。自転車の荷台に載った紙芝居の木の舞台 (観音開きの扉・引き出し・拍子木)
// 演出: 舞台の絵 (点線で囲み、隅に「?」の判子 = 言い伝え) の1枚目: 日の出と同時に村の男性 (短い黒髪・灰の服) がぱっと飛び起きる。
//       紙芝居屋の手 (そでと手だけ) が1枚目をすっと右へ引き抜くと、2枚目: 日の入りの瞬間、同じ男性が棒のようにばたんと寝る。
//       左に座る子ども (男の子と女の子) が、首をかしげて顔を見合わせる
// 動き: f6-14 飛び起きる / f24-34 1枚目を引き抜く / f34-40 ばたん (f45 で引き抜いた1枚目と2枚目が並んで見える) / f110-140 子どもが首をかしげる / カメラはゆっくり舞台へ寄る
const MZB_PIC = { x: 760, y: 230, w: 680, h: 460 };
// 紙芝居の村の絵 (kind 0 = 日の出に飛び起きる / 1 = 日の入りにばたん)。x,y = 絵の左上
const MzBKamiCard: React.FC<{ x: number; y: number; kind: 0 | 1; f: number; t: number }> = ({ x, y, kind, f, t }) => {
  const P = MZB_PIC;
  const morning = kind === 0;
  const jump = morning ? Math.sin(clamp01(t) * Math.PI) * 60 : 0;
  const flop = morning ? 0 : easeOut(clamp01(t));
  const sunX = morning ? 150 : 170;
  const manX = morning ? 330 : 280;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={P.w} height={P.h} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={8} y={8 + i * 46} width={P.w - 16} height={47}
          fill={morning ? mixColor("#9CC8E8", "#F6D8A0", i / 5) : mixColor("#6A5A92", "#F08A4E", i / 5)} />
      ))}
      {/* 太陽 (地平線の半分) */}
      <circle cx={sunX} cy={290} r={60} fill={morning ? MP.dawn : KRP.red} stroke={KRP.ink} strokeWidth={4} />
      {morning && Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={sunX} y1={210} x2={sunX} y2={186} stroke={MP.dawn} strokeWidth={7} strokeLinecap="round" transform={`rotate(${i * 30 - 90} ${sunX} 290)`} />
      ))}
      {/* 山と畑 */}
      <path d={`M 8 300 Q 160 230 300 290 Q 460 220 ${P.w - 8} 280 L ${P.w - 8} ${P.h - 8} L 8 ${P.h - 8} Z`} fill={morning ? C.grass : C.grassDark} stroke={KRP.ink} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M 20 ${330 + i * 30} Q 300 ${320 + i * 30} ${P.w - 20} ${336 + i * 30}`} stroke={morning ? C.grassDark : "#4A6A34"} strokeWidth={3} fill="none" />)}
      {/* わらぶきの家 */}
      <rect x={480} y={230} width={150} height={100} fill={C.hut} stroke={KRP.ink} strokeWidth={4} />
      <path d="M 460 240 L 555 160 L 650 240 Z" fill={C.thatch} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <rect x={540} y={270} width={36} height={60} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
      {/* ふとん */}
      <rect x={manX - 90} y={392} width={190} height={34} rx={8} fill={C.flower} stroke={KRP.ink} strokeWidth={4} />
      <rect x={manX - 100} y={386} width={46} height={26} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      {/* 村の男性 */}
      {morning ? (
        <g>
          <MzBHito x={manX} y={400 - jump} s={0.5} f={f} cloth={C.grayC} clothDark={C.grayCDark} face={t > 0.15 ? "surprised" : "joy"} pose={t > 0.15 ? "banzai" : "stand"} />
          {t > 0.15 && <path d={`M ${manX - 70} ${250 - jump} l -16 -16 M ${manX + 70} ${250 - jump} l 16 -16 M ${manX} ${236 - jump} l 0 -22`} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />}
        </g>
      ) : (
        <g>
          <g transform={`rotate(${-90 * flop} ${manX + 60} 410)`}>
            <MzBHito x={manX + 60} y={410} s={0.5} f={f} cloth={C.grayC} clothDark={C.grayCDark} face={flop > 0.9 ? "joy" : "normal"} still />
          </g>
          {flop > 0.9 && (
            <g>
              <path d={`M ${manX - 80} 430 l -14 8 M ${manX - 40} 436 l -6 12`} stroke={KRP.ink} strokeWidth={4} />
              <text x={manX - 40} y={330} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} paintOrder="stroke">Zz</text>
            </g>
          )}
        </g>
      )}
      {/* 言い伝えの印: 点線のわくと「?」の判子 */}
      <rect x={20} y={20} width={P.w - 40} height={P.h - 40} fill="none" stroke={KRP.red} strokeWidth={5} strokeDasharray="16 12" />
      <g transform={`translate(${70} 70) rotate(-12)`}>
        <circle r={40} fill={KRP.white} opacity={0.6} />
        <circle r={40} fill="none" stroke={KRP.red} strokeWidth={6} />
        <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.red}>?</text>
      </g>
    </g>
  );
};
// #32・#33 で共有する町かどの紙芝居の舞台 (同じ場所の続き)。絵の窓は MZB_PIC
const MzBKamiStage: React.FC<{ f: number }> = ({ f }) => (
  <g>
        {/* 夕方の空と家並み (板べい・瓦屋根) */}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={-60} y={-60 + i * 60} width={2040} height={62} fill={mixColor("#BFD9EA", "#F4D7AE", i / 5)} />
        ))}
        {[[-60, 150, 520], [460, 110, 380], [1540, 140, 460]].map(([hx, hy, hw], i) => (
          <g key={i}>
            <rect x={hx} y={hy + 60} width={hw} height={600} fill={i % 2 ? "#8A6A4A" : "#7A5A3E"} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.floor(hw / 40) }, (_, j) => <line key={j} x1={hx + j * 40 + 20} y1={hy + 60} x2={hx + j * 40 + 20} y2={hy + 660} stroke={KRP.ink} strokeWidth={2} opacity={0.35} />)}
            <path d={`M ${hx - 30} ${hy + 70} L ${hx + hw / 2} ${hy - 10} L ${hx + hw + 30} ${hy + 70} Z`} fill="#4E5A6A" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            {Array.from({ length: 8 }, (_, j) => <line key={j} x1={hx + j * hw / 8} y1={hy + 66} x2={hx + hw / 2} y2={hy} stroke="#3A4452" strokeWidth={2} />)}
            <rect x={hx + hw * 0.2} y={hy + 160} width={hw * 0.3} height={120} fill={C.paperOld} stroke={KRP.ink} strokeWidth={4} />
            {[1, 2].map((j) => <line key={j} x1={hx + hw * 0.2 + j * hw * 0.1} y1={hy + 160} x2={hx + hw * 0.2 + j * hw * 0.1} y2={hy + 280} stroke={KRP.ink} strokeWidth={2} />)}
          </g>
        ))}
        <rect x={1460} y={40} width={26} height={760} fill={C.pole} stroke={KRP.ink} strokeWidth={4} />
        <line x1={-60} y1={90} x2={1980} y2={60} stroke={KRP.ink} strokeWidth={3} />
        {/* 石畳の道 */}
        <rect x={-60} y={740} width={2040} height={400} fill={C.dirt} />
        <line x1={-60} y1={740} x2={1980} y2={740} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 36 }, (_, i) => (
          <rect key={i} x={(i % 12) * 170 - 40 + (Math.floor(i / 12) % 2) * 85} y={760 + Math.floor(i / 12) * 60} width={150} height={48} rx={10} fill="none" stroke={C.dirtDark} strokeWidth={3} />
        ))}
        {/* 自転車 (後ろの車輪と荷台) */}
        {[880, 1340].map((wx) => (
          <g key={wx}>
            <circle cx={wx} cy={820} r={90} fill="none" stroke={KRP.ink} strokeWidth={12} />
            <circle cx={wx} cy={820} r={90} fill="none" stroke={KRP.grayDark} strokeWidth={5} />
            {Array.from({ length: 8 }, (_, j) => <line key={j} x1={wx} y1={820} x2={wx + Math.cos(j * 0.785) * 86} y2={820 + Math.sin(j * 0.785) * 86} stroke={KRP.gray} strokeWidth={3} />)}
            <circle cx={wx} cy={820} r={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <path d="M 880 820 L 1060 740 L 1340 820 M 1060 740 L 1200 740" stroke={KRP.red} strokeWidth={14} fill="none" strokeLinecap="round" />
        {/* 舞台の台 (引き出し) */}
        <rect x={720} y={700} width={760} height={50} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={740} y={610} width={720} height={92} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        {[0, 1, 2].map((j) => (
          <g key={j}>
            <rect x={760 + j * 236} y={624} width={210} height={64} rx={4} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={865 + j * 236} cy={656} r={8} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 舞台のわく (観音開きの扉) */}
        <rect x={720} y={170} width={760} height={440} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 700 172 L 1500 172 L 1470 120 L 730 120 Z" fill={MP.wood} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 720 190 L 560 150 L 560 640 L 720 600 Z" fill={MP.wood} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 1480 190 L 1640 150 L 1640 640 L 1480 600 Z" fill={MP.wood} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 590 200 L 690 214 L 690 576 L 590 590 Z M 1610 200 L 1510 214 L 1510 576 L 1610 590 Z" fill="none" stroke={MP.woodDark} strokeWidth={4} />
        {/* 拍子木 (ひもでつるす) */}
        <line x1={1640} y1={300} x2={1680} y2={360} stroke={KRP.ink} strokeWidth={3} />
        <g transform={`rotate(${Math.sin(f / 14) * 4} 1680 360)`}>
          <rect x={1664} y={360} width={20} height={120} rx={4} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1688} y={360} width={20} height={120} rx={4} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
        </g>
  </g>
);
const Mz032: React.FC<{ f: number }> = ({ f }) => {
  const P = MZB_PIC;
  const pull = easeInOut(seg(f, 24, 34));
  const c1x = P.x + pull * 460;
  const tilt = easeInOut(seg(f, 110, 126));
  const k = lerp(1, 1.08, easeInOut(seg(f, 0, 190)));
  const handX = c1x + 600, handY = P.y + 40;
  return (
    <Frame f={f} seed={6032} bg={C.dirt}>
      <g transform={`translate(1000 480) scale(${k}) translate(-1000 -480)`}>
        <MzBKamiStage f={f} />
        {/* 2枚目 (下にある) → 1枚目 (引き抜かれる) */}
        <MzBKamiCard x={P.x} y={P.y} kind={1} f={f} t={seg(f, 34, 40)} />
        <MzBKamiCard x={c1x} y={P.y} kind={0} f={f} t={seg(f, 6, 14)} />
        {/* 紙芝居屋の手 (そでと手だけ。顔は描かない) */}
        <g transform={`translate(${f < 20 ? lerp(300, 0, seg(f, 10, 20)) : 0} 0)`}>
          <path d={`M 2000 ${handY - 30} L ${handX + 40} ${handY - 34} L ${handX + 40} ${handY + 40} L 2000 ${handY + 50} Z`} fill={C.navy} stroke={KRP.ink} strokeWidth={6} />
          <rect x={handX + 24} y={handY - 40} width={30} height={86} rx={8} fill={C.navyDark} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={handX} cy={handY} rx={34} ry={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${handX - 30} ${handY - 4} q -10 10 0 20`} stroke={KRP.ink} strokeWidth={4} fill="none" />
        </g>
        {/* 子ども (男の子と女の子)。座って見ている → 首をかしげて顔を見合わせる */}
        <MzBHito x={250} y={820} s={0.56} f={f} phase={2} cloth={C.blue2} clothDark={C.navyDark} pose="sit"
          face={tilt > 0.3 ? "worried" : "smile"} gaze={tilt > 0.3 ? [7, 0] : [6, -3]} lean={12 * tilt} />
        <MzBHito x={450} y={820} s={0.56} f={f} phase={5} cloth={C.pink} clothDark={C.tights} female hairStyle="tail" pose="sit"
          face={tilt > 0.3 ? "worried" : "joy"} gaze={tilt > 0.3 ? [-7, 0] : [6, -3]} lean={-12 * tilt} />
        <QMark x={250} y={600} s={0.55} f={f} t={seg(f, 120, 130)} />
        <QMark x={460} y={590} s={0.55} f={f} t={seg(f, 124, 134)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #33 これは、半分だけ正解です。
// 格: 図 / seed 6033
// 絵: どこ: #32 の紙芝居の木の舞台の続き。演出: 舞台の絵が左右半分に分かれている: 左半分 = 朝 (日の出のころに起きる)、右半分 = 夜 (日の入りに寝る)。上から先生の赤ペンを持った手が降りてきて、左半分に大きな赤い〇をぐるりと描く。右半分には赤い✕を描くと、右半分の紙がぺらりとめくれて舞台から落ち、その裏から「まだ起きている村の人たち」の絵がちらっとのぞく (#34 への橋渡し)。札は「〇」「✕」の記号だけ。子どもたちが「おお」と口を開ける。腕は2本 (赤ペンの手は片腕だけ画面上から。もう片方は画面外)。動き: f0-30 カメラが舞台の正面へ寄る / f30-70 左に〇 / f70-100 右に✕ / f100-140 右半分がめくれて落ちる / 子どもの反応
// どこ: #32 の町かどの紙芝居の舞台の続き (同じ舞台部品 MzBKamiStage)。カメラは舞台の正面に寄る
// 演出: 絵が左右半分: 左 = 朝 (日の出に飛び起きる) / 右 = 夜 (日の入りに寝る)。上から赤ペンを持った先生の手 (片腕だけ) が降りてきて、
//       左半分に大きな赤い〇、右半分に赤い✕。すると右半分の紙がぺらりとめくれて舞台から落ち、裏から「まだ起きている村の人たち」の絵がのぞく。
//       子どもたちが「おお」と口を開ける
// 動き: f0-14 カメラが正面へ寄る / f8-24 左に〇 / f24-34 右に✕ (f45 で〇と✕が両方見える) / f40-62 右半分がめくれて落ちる / f46- 子どもの反応
const Mz033: React.FC<{ f: number }> = ({ f }) => {
  const P = MZB_PIC;
  const cam = easeInOut(seg(f, 0, 14));
  const k = lerp(1.08, 1.32, cam);
  const circ = seg(f, 8, 24);
  const x1 = seg(f, 24, 29), x2 = seg(f, 29, 34);
  const fall = easeInOut(seg(f, 40, 62));
  const oo = f >= 42;
  const half = P.w / 2;
  const LC: Pt = [P.x + half / 2, P.y + 230], RC: Pt = [P.x + half * 1.5, P.y + 230];
  // ペン先の位置
  let pen: Pt = [LC[0] + 150, LC[1] - 260];
  if (f >= 4 && f < 24) {
    const a = -Math.PI / 2 + circ * Math.PI * 2.1;
    pen = circ > 0 ? [LC[0] + Math.cos(a) * 130, LC[1] + Math.sin(a) * 130] : [lerp(LC[0] + 150, LC[0], seg(f, 4, 8)), lerp(LC[1] - 260, LC[1] - 130, seg(f, 4, 8))];
  } else if (f >= 24 && f < 29) pen = [lerp(RC[0] - 90, RC[0] + 90, x1), lerp(RC[1] - 90, RC[1] + 90, x1)];
  else if (f >= 29 && f < 34) pen = [lerp(RC[0] + 90, RC[0] - 90, x2), lerp(RC[1] - 90, RC[1] + 90, x2)];
  else if (f >= 34) pen = [lerp(RC[0] - 90, RC[0] + 200, seg(f, 34, 44)), lerp(RC[1] + 90, RC[1] - 400, seg(f, 34, 44))];
  const halfCard = (night: boolean) => (
    <g>
      <rect x={0} y={0} width={half} height={P.h} fill={C.paperOld} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={8} y={8 + i * 46} width={half - 16} height={47} fill={night ? mixColor("#2A3358", "#6A5A92", i / 5) : mixColor("#9CC8E8", "#F6D8A0", i / 5)} />
      ))}
      <path d={`M 8 290 Q 120 250 ${half - 8} 280 L ${half - 8} ${P.h - 8} L 8 ${P.h - 8} Z`} fill={night ? "#3E5A34" : C.grass} stroke={KRP.ink} strokeWidth={4} />
      {night ? (
        <g>
          <circle cx={250} cy={90} r={34} fill="#F3E3A0" stroke={KRP.ink} strokeWidth={4} />
          {[[60, 60], [140, 120], [300, 170], [90, 180]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={4} fill="#FFF6D8" />)}
          <rect x={60} y={380} width={190} height={30} rx={8} fill={C.flower} stroke={KRP.ink} strokeWidth={4} />
          <g transform="rotate(-90 220 396)"><MzBHito x={220} y={396} s={0.42} f={f} cloth={C.grayC} clothDark={C.grayCDark} face="joy" still /></g>
        </g>
      ) : (
        <g>
          <circle cx={90} cy={280} r={50} fill={MP.dawn} stroke={KRP.ink} strokeWidth={4} />
          <rect x={120} y={390} width={170} height={30} rx={8} fill={C.flower} stroke={KRP.ink} strokeWidth={4} />
          <MzBHito x={210} y={392 - Math.abs(Math.sin(f / 6)) * 10} s={0.42} f={f} cloth={C.grayC} clothDark={C.grayCDark} face="surprised" pose="banzai" />
        </g>
      )}
      <rect x={16} y={16} width={half - 32} height={P.h - 32} fill="none" stroke={KRP.red} strokeWidth={5} strokeDasharray="16 12" />
    </g>
  );
  return (
    <Frame f={f} seed={6033} bg={C.dirt}>
      <g transform={`translate(1100 470) scale(${k}) translate(-1100 -470)`}>
        <MzBKamiStage f={f} />
        {/* 裏の絵: まだ起きている村の人たち (たき火を囲む夜) */}
        <g transform={`translate(${P.x + half} ${P.y})`}>
          <rect x={0} y={0} width={half} height={P.h} fill={MP.nightDeep} stroke={KRP.ink} strokeWidth={5} />
          {[[40, 50], [120, 90], [220, 40], [300, 110], [180, 150]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={4} fill="#FFF6D8" opacity={0.6 + 0.4 * Math.sin(f / 6 + i)} />)}
          <circle cx={280} cy={70} r={28} fill="#F3E3A0" stroke={KRP.ink} strokeWidth={3} />
          <rect x={8} y={330} width={half - 16} height={P.h - 338} fill="#3E4A3A" />
          <ellipse cx={170} cy={360} rx={150} ry={60} fill={MP.dawn} opacity={0.3} />
          <MzBFire x={170} y={370} s={0.4} f={f} />
          <MzBHito x={70} y={380} s={0.36} f={f} cloth={C.blue2} clothDark={C.navyDark} face="joy" pose="banzai" />
          <MzBHito x={270} y={380} s={0.36} f={f} phase={3} cloth={C.red} clothDark={C.tights} female face="smile" />
          <MzBHito x={170} y={440} s={0.36} f={f} phase={5} cloth={C.grayC} clothDark={C.grayCDark} face="smile" />
        </g>
        {/* 左半分 = 朝 */}
        <g transform={`translate(${P.x} ${P.y})`}>{halfCard(false)}</g>
        {/* 右半分 = 夜 (ぺらりとめくれて落ちる) */}
        {fall < 1 && (
          <g transform={`translate(${P.x + half} ${P.y + P.h}) translate(${fall * 60} ${fall * 420}) rotate(${fall * 28}) scale(1 ${1 - fall * 0.55}) translate(0 ${-P.h})`} opacity={1 - seg(f, 54, 62)}>
            {halfCard(true)}
            {/* ✕ (紙といっしょに落ちる) */}
            <g stroke={KRP.red} strokeWidth={16} strokeLinecap="round">
              {x1 > 0 && <line x1={half / 2 - 90} y1={140} x2={half / 2 - 90 + 180 * x1} y2={140 + 180 * x1} />}
              {x2 > 0 && <line x1={half / 2 + 90} y1={140} x2={half / 2 + 90 - 180 * x2} y2={140 + 180 * x2} />}
            </g>
            {/* めくれの影 */}
            {fall > 0 && <path d={`M 0 ${P.h} L ${half} ${P.h} L ${half} ${P.h - 60 * fall} Q ${half / 2} ${P.h - 20} 0 ${P.h - 40 * fall} Z`} fill={KRP.ink} opacity={0.25} />}
          </g>
        )}
        {/* 左の〇 */}
        {circ > 0 && (
          <path d={`M ${LC[0]} ${LC[1] - 130} A 130 130 0 1 1 ${LC[0] - 0.1} ${LC[1] - 130}`} fill="none" stroke={KRP.red} strokeWidth={18} strokeLinecap="round"
            pathLength={100} strokeDasharray={`${circ * 100} 100`} />
        )}
        {/* 先生の手 (上から片腕だけ。赤ペン) */}
        <g>
          <path d={`M ${pen[0] + 140} -200 L ${pen[0] + 60} ${pen[1] - 70} L ${pen[0] + 110} ${pen[1] - 50} L ${pen[0] + 220} -200 Z`} fill={C.enji} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={pen[0] + 54} y={pen[1] - 86} width={66} height={22} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform={`rotate(20 ${pen[0] + 86} ${pen[1] - 76})`} />
          <g transform={`rotate(35 ${pen[0]} ${pen[1]})`}>
            <rect x={pen[0] - 9} y={pen[1] - 110} width={18} height={100} rx={4} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${pen[0] - 9} ${pen[1] - 12} L ${pen[0]} ${pen[1]} L ${pen[0] + 9} ${pen[1] - 12} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
          <ellipse cx={pen[0] + 60} cy={pen[1] - 48} rx={32} ry={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 子ども (「おお」) */}
        <MzBHito x={400} y={800} s={0.5} f={f} phase={2} cloth={C.blue2} clothDark={C.navyDark} pose={oo ? "banzai" : "sit"} face={oo ? "surprised" : "smile"} gaze={[6, -4]} />
        <MzBHito x={560} y={800} s={0.5} f={f} phase={5} cloth={C.pink} clothDark={C.tights} female hairStyle="tail" pose="sit" face={oo ? "surprised" : "smile"} gaze={[6, -4]} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #34 電気のない暮らしの人たちを見ると、寝るのは、日が沈んでから、3時間ほどあとでした。
// 格: 図 / seed 6034
// 絵: どこ: 電気のない暮らしの村 (#6 のサバンナの小屋とたき火) の夕方→夜。画面の下に、地面に置いた長い木の板の「時間のものさし」(左端に沈む太陽の絵、目盛り1つ=1時間)。演出: 左の地平線に太陽が沈むと (f20)、ものさしの上を小さな火の玉の印が右へ1目盛りずつ進んでいく。その間、村の人たち (男女を混ぜる: 男性は短い黒髪 (hair="cap")・紺/青/灰の服・ズボン。女性は肩まで届く茶色の長い髪か後ろで結んだ髪の房、赤・ピンク・えんじ系の服、スカート) は、たき火のまわりで料理をしたり、話したり、子どもをあやしたりしている。月が昇る。火の玉が3目盛り目に届いたところで (札「約3時間」)、ようやく人々が立ち上がり、伸びをして小屋へ入っていく。腕は2本 (pose="stretch")。動き: f0-20 日没 / f20-130 印が3目盛り進む・人々の暮らし / f130-160 小屋へ入る / カメラはものさしに沿って右へパン
// どこ: 電気のない暮らしの村 (サバンナ・アカシアの木・わらぶきの丸い小屋2つ・たき火となべ・丸太のベンチ) の夕方→夜。
//       地面に長い木の板の「時間のものさし」(左端に沈む太陽の絵、目盛り1つ=1時間)
// 演出: 左の地平線に日が沈むと、ものさしの上を火の玉の印が1目盛りずつぴょんと進む。その間、村の人たち (男女) は料理・おしゃべり・赤ちゃんをあやす。
//       月が昇る。火の玉が3目盛り目に着くと札「約3時間」→ ようやくみんな立ち上がって伸びをし、小屋へ入っていく
// 動き: f0-12 日没 / f14-38 印が3目盛り進む (空は夜へ) / f38-44 札 / f40-52 伸び / f54-100 小屋へ / カメラはものさしに沿って右へ
const Mz034: React.FC<{ f: number }> = ({ f }) => {
  const sunset = easeInOut(seg(f, 0, 12));
  const night = easeInOut(seg(f, 8, 40));
  const tick = [260, 620, 980, 1340, 1700];
  const hopT = [seg(f, 14, 20), seg(f, 24, 30), seg(f, 33, 39)];
  const hops = hopT.reduce((a, b) => a + b, 0);
  const curHop = hopT.findIndex((t) => t > 0 && t < 1);
  const mx = tick[0] + hops * 360;
  const my = 742 - (curHop >= 0 ? Math.sin(hopT[curHop] * Math.PI) * 60 : 0);
  const stretch = seg(f, 40, 52);
  const go = easeInOut(seg(f, 54, 100));
  const cam = easeInOut(seg(f, 0, 60));
  const fx = lerp(560, 1200, cam);
  const k = 1.08;
  const moonY = lerp(520, 150, easeOut(seg(f, 14, 120)));
  const GY = 650;
  // 人: [x, 入る小屋のx]
  const huts = [330, 1560];
  const ppl = [
    { x: 820, hut: 0, female: false, cloth: C.navy, dark: C.navyDark, act: "stir" },
    { x: 600, hut: 0, female: true, cloth: C.red, dark: C.tights, act: "baby", hs: "long" as const },
    { x: 1180, hut: 1, female: false, cloth: C.blue2, dark: C.navyDark, act: "talk" },
    { x: 1340, hut: 1, female: true, cloth: C.enji, dark: C.tights, act: "listen", hs: "tail" as const },
  ];
  const inside = (i: number) => go > 0.25 + i * 0.1;
  return (
    <Frame f={f} seed={6034} bg={MP.nightDeep}>
      <g transform={`translate(${fx} 540) scale(${k}) translate(${-fx} -540)`}>
        {/* 空 (夕焼け → 夜) */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={-100} y={-100 + i * 80} width={2120} height={82}
            fill={mixColor(mixColor("#7A86C0", "#F49A5A", i / 7), mixColor(MP.nightDeep, MP.night, i / 7), night)} />
        ))}
        {Array.from({ length: 50 }, (_, i) => (
          <circle key={i} cx={rnd(341, i) * 2000} cy={rnd(342, i) * 420} r={i % 6 ? 2.2 : 3.6} fill="#FFF6D8" opacity={night * (0.5 + 0.5 * Math.sin(f / 8 + i))} />
        ))}
        {/* 沈む太陽 (左の地平線) と昇る月 (右) */}
        <circle cx={240} cy={lerp(420, 540, sunset)} r={64} fill={MP.dawn} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1760} cy={moonY} r={52} fill="#F3E3A0" stroke={KRP.ink} strokeWidth={5} opacity={seg(f, 10, 20)} />
        <circle cx={1742} cy={moonY - 12} r={10} fill="#E2CF80" opacity={seg(f, 10, 20)} />
        {/* サバンナの地面と遠くの丘 */}
        <path d="M -100 520 Q 400 490 900 512 Q 1400 530 2020 500 L 2020 1200 L -100 1200 Z" fill={mixColor(C.savanna, "#4A4434", night * 0.8)} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M ${rnd(343, i) * 2000} ${540 + rnd(344, i) * 140} l 6 -18 l 6 18 l 6 -12`} stroke={mixColor(C.savannaDark, "#2E2A20", night)} strokeWidth={4} fill="none" />
        ))}
        {/* アカシアの木 */}
        <g>
          <path d="M 1840 600 L 1850 420 Q 1800 380 1760 360 M 1850 420 Q 1900 380 1940 350" stroke={mixColor(MP.woodDark, "#2A2018", night)} strokeWidth={22} fill="none" strokeLinecap="round" />
          <ellipse cx={1850} cy={340} rx={190} ry={44} fill={mixColor(C.grassDark, "#22301E", night)} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 小屋 (わらぶきの丸い屋根) */}
        {huts.map((hx, i) => (
          <g key={i}>
            <rect x={hx - 130} y={470} width={260} height={190} fill={mixColor(C.hut, "#4E3E2A", night * 0.7)} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2, 3].map((j) => <line key={j} x1={hx - 130} y1={500 + j * 40} x2={hx + 130} y2={500 + j * 40} stroke={KRP.ink} strokeWidth={2} opacity={0.3} />)}
            <path d={`M ${hx - 170} 490 L ${hx} 320 L ${hx + 170} 490 Q ${hx} 510 ${hx - 170} 490 Z`} fill={mixColor(C.thatch, "#6A5530", night * 0.7)} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            {Array.from({ length: 7 }, (_, j) => <line key={j} x1={hx} y1={330} x2={hx - 150 + j * 50} y2={494} stroke={C.thatchDark} strokeWidth={3} />)}
            <path d={`M ${hx - 44} 660 L ${hx - 44} 570 Q ${hx} 530 ${hx + 44} 570 L ${hx + 44} 660 Z`} fill="#2A2018" stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* たき火・なべ・丸太のベンチ */}
        <rect x={1100} y={640} width={320} height={34} rx={16} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={1100} cy={657} rx={10} ry={16} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={3} />
        <ellipse cx={960} cy={650} rx={300} ry={80} fill={MP.dawn} opacity={0.12 + 0.12 * night} />
        <MzBFire x={960} y={660} s={0.75} f={f} />
        <path d="M 880 520 L 960 500 L 1040 520" stroke={KRP.ink} strokeWidth={5} fill="none" />
        <line x1={890} y1={520} x2={880} y2={670} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1030} y1={520} x2={1040} y2={670} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 912 536 L 1008 536 Q 1004 600 960 604 Q 916 600 912 536 Z" fill={MP.iron} stroke={KRP.ink} strokeWidth={5} />
        <line x1={960} y1={500} x2={960} y2={536} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1].map((q) => <path key={q} d={`M ${940 + q * 30} ${520 - ((f + q * 10) % 30)} q 8 -10 0 -20`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.6 * (1 - ((f + q * 10) % 30) / 30)} />)}
        <MzBSparks x={960} y={620} f={f} n={8} seed={34} spread={0.6} />
        {/* 村の人たち */}
        {ppl.map((p, i) => {
          const hx = huts[p.hut];
          const tIn = clamp01((go - i * 0.1) / 0.5);
          const x = lerp(p.x, hx, easeInOut(tIn));
          if (inside(i) && tIn >= 1) return null;
          const st = stretch > 0 && stretch < 1;
          const sitting = (p.act === "talk" || p.act === "listen") && f < 40;
          const face: MzBFace = st ? "joy" : f < 40 ? (p.act === "talk" ? "joy" : "smile") : "smile";
          let arms: { l?: [Pt, Pt]; r?: [Pt, Pt] } | undefined;
          if (st) arms = { l: [[-96, -230], [-80, -320]], r: [[96, -230], [80, -320]] };
          else if (f < 40 && p.act === "stir") {
            const sa = f / 5;
            arms = { l: [[-80, -104], [-82, -66]], r: [[120, -120], [170 + Math.cos(sa) * 14, -150 + Math.sin(sa) * 8]] };
          } else if (f < 40 && p.act === "baby") arms = { l: [[-70, -96], [-10, -110]], r: [[70, -96], [10, -100]] };
          else if (f < 40 && p.act === "talk") {
            const g = Math.sin(f / 6) * 20;
            arms = { l: [[-80, -104], [-82, -66]], r: [[120, -170], [150 + g, -230]] };
          }
          const rock = p.act === "baby" && f < 40 ? Math.sin(f / 8) * 5 : 0;
          return (
            <g key={i} opacity={1 - clamp01((tIn - 0.85) / 0.15)}>
              <ellipse cx={x} cy={(sitting ? 662 : GY) + 4} rx={40} ry={8} fill={KRP.ink} opacity={0.25} />
              <MzBHito x={x} y={sitting ? 700 : GY} s={0.62} f={f} phase={i} face={face} cloth={p.cloth} clothDark={p.dark}
                female={p.female} hairStyle={p.hs} arms={arms} pose={sitting ? "sit" : "stand"} lean={rock} />
              {/* 赤ちゃん */}
              {p.act === "baby" && f < 40 && (
                <g transform={`translate(${x} ${GY - 0.62 * 112}) rotate(${rock * 2})`}>
                  <ellipse cx={0} cy={0} rx={40} ry={22} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
                  <circle cx={-26} cy={-6} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
                  <path d="M -32 -6 q 3 3 6 0 M -24 -6 q 3 3 6 0" stroke={KRP.ink} strokeWidth={2} fill="none" />
                </g>
              )}
              {/* 料理のおたま */}
              {p.act === "stir" && f < 40 && (
                <line x1={x + 0.62 * (170 + Math.cos(f / 5) * 14)} y1={GY + 0.62 * (-150 + Math.sin(f / 5) * 8)} x2={x + 0.62 * 210} y2={GY - 0.62 * 60} stroke={MP.woodDark} strokeWidth={7} strokeLinecap="round" />
              )}
              {/* 伸びのあくび */}
              {st && <path d={`M ${x + 40} ${GY - 0.62 * 300} q 14 -10 28 0`} stroke={KRP.white} strokeWidth={5} fill="none" />}
            </g>
          );
        })}
        {/* おしゃべりの吹き出し (話し声の記号だけ) */}
        {f < 40 && (
          <g opacity={0.9}>
            <ellipse cx={1240} cy={420 + Math.sin(f / 6) * 4} rx={46} ry={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 1214 420 h 52 M 1220 408 h 40 M 1224 432 h 30" stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
        {/* 時間のものさし (地面に置いた木の板) */}
        <rect x={140} y={752} width={1680} height={50} rx={8} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={6} />
        <line x1={150} y1={790} x2={1810} y2={790} stroke={MP.wood} strokeWidth={4} />
        {tick.map((tx, i) => (
          <g key={i}>
            <line x1={tx} y1={752} x2={tx} y2={784} stroke={KRP.ink} strokeWidth={6} />
            {i > 0 && <line x1={tx - 180} y1={752} x2={tx - 180} y2={770} stroke={KRP.ink} strokeWidth={3} />}
            {i > 0 && <text x={tx + 12} y={786} fontFamily={FONT} fontWeight={900} fontSize={26} fill={MP.woodDark}>{i}</text>}
          </g>
        ))}
        {/* 左端: 沈む太陽の絵 */}
        <g transform="translate(196 776)">
          <path d="M -34 6 A 34 34 0 0 1 34 6 Z" fill={MP.dawn} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-40} y1={8} x2={40} y2={8} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 火の玉の印 */}
        <g transform={`translate(${mx} ${my})`}>
          <circle cx={0} cy={-6} r={30} fill={MP.glow} opacity={0.4} />
          <path d={`M -18 0 Q -22 -30 ${Math.sin(f / 3) * 4} -46 Q 22 -30 18 0 Q 0 10 -18 0 Z`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -8 -2 Q -10 -18 0 -28 Q 10 -18 8 -2 Z" fill={MP.flame} />
        </g>
        {/* 進んだ分 (橙の帯) */}
        <rect x={tick[0]} y={796} width={Math.max(0, mx - tick[0])} height={8} fill={KRP.orange} />
        <TagPlate x={1580} y={690} text="約3時間" size={44} t={seg(f, 38, 44)} color={KRP.orange} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #35 夜ふかしは、電気より先に、ありました。
// 格: 山 / seed 6035
// 絵: どこ: #34 の村の、深い夜のたき火のまわり (星空・高く昇った月・小屋の影・燃える薪の束)。演出: ★笑いどころ。たき火を囲んで、男女の大人たち (男性は短い黒髪・紺/灰の服・ズボン、女性は茶色の長い髪の房・えんじや赤の服・スカート) が、まだまだ寝ない。1人の男性が大きな身ぶりで話をしていて、オチのところで全員がどっと笑い、火の粉がぱっと舞い上がる。子どもはもうこっくりこっくり舟をこいでいるのに、大人は誰も寝ない。眠そうに立ち上がりかけた女性が、隣の人に袖を引かれて「もう1話」と座り直す。月が頭の上を越えていく。カメラはゆっくり引いて、真っ暗な大地の中でここだけが明るいことを見せる。腕は2本 (話し手 pose="gesture")。動き: f0-60 話し手の身ぶり / f60 どっと笑う・火の粉 / f70-110 座り直し / f80-160 カメラが引く・月が動く
// どこ: #34 の村の深い夜。星空・頭上の月・小屋の影・燃える薪の束。たき火を丸太のベンチが囲む
// 演出: ★笑いどころ。立った男性が大きな身ぶりで話し、オチで全員どっと笑って火の粉がぱっと舞う。
//       子どもはこっくりこっくり舟をこいでいるのに、大人は誰も寝ない。眠そうに立ちかけた女性は、隣の男性に袖を引かれ
//       (もう片方の手は人さし指1本 =「もう1話」) 座り直す。月が頭上を越え、カメラが引くと、真っ暗な大地でここだけが明るい
// 動き: f0-28 話し手の身ぶり / f28 どっと笑う・火の粉 / f34-58 立ちかけ→袖を引かれて座り直す (f45 で引かれている) / f56-105 カメラが引く・月が動く
const Mz035: React.FC<{ f: number }> = ({ f }) => {
  const laugh = f >= 28 && f < 48;
  const burst = seg(f, 28, 44);
  const up = easeInOut(seg(f, 34, 42)) * (1 - easeInOut(seg(f, 48, 58)));
  const tug = seg(f, 40, 46) * (1 - seg(f, 56, 62));
  const k = lerp(1.22, 0.78, easeInOut(seg(f, 56, 105)));
  const FIRE: Pt = [960, 740];
  const moonA = lerp(-0.5, 0.6, f / 105);
  const MO: Pt = [960 + Math.sin(moonA) * 760, 250 - Math.cos(moonA) * 120];
  const g = Math.sin(f / 4);
  const SEAT = 760;
  const s = 0.7;
  const nod = Math.max(0, Math.sin(f / 14)) ** 3;
  return (
    <Frame f={f} seed={6035} bg={MP.nightDeep} dark>
      <g transform={`translate(960 600) scale(${k}) translate(-960 -600)`}>
        {/* 夜空 (引いても切れないように広く) */}
        <rect x={-800} y={-600} width={3520} height={1300} fill={MP.nightDeep} />
        <rect x={-800} y={300} width={3520} height={300} fill={MP.night} opacity={0.5} />
        {Array.from({ length: 120 }, (_, i) => (
          <circle key={i} cx={-700 + rnd(351, i) * 3320} cy={-560 + rnd(352, i) * 1060} r={i % 7 ? 2.2 : 3.8} fill="#FFF6D8" opacity={0.45 + 0.55 * Math.sin(f / 7 + i * 1.7)} />
        ))}
        {/* 頭上を越えていく月 */}
        <circle cx={MO[0]} cy={MO[1]} r={56} fill="#F3E3A0" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={MO[0] - 16} cy={MO[1] - 10} r={12} fill="#E2CF80" />
        <circle cx={MO[0] + 18} cy={MO[1] + 14} r={8} fill="#E2CF80" />
        {/* 真っ暗な大地 (遠くの丘の影) */}
        <path d="M -800 620 Q -200 560 400 600 Q 1000 640 1600 590 Q 2200 560 2720 610 L 2720 1900 L -800 1900 Z" fill="#14182A" stroke={KRP.ink} strokeWidth={5} />
        {/* 火の明かり */}
        <ellipse cx={FIRE[0]} cy={FIRE[1]} rx={760} ry={300} fill={MP.dawn} opacity={0.12} />
        <ellipse cx={FIRE[0]} cy={FIRE[1]} rx={520} ry={200} fill={MP.dawn} opacity={0.16} />
        <circle cx={FIRE[0]} cy={FIRE[1] - 140} r={420} fill={MP.glow} opacity={0.08 + 0.04 * Math.sin(f / 3)} />
        {/* 小屋の影 (火に照らされて少しだけ見える) */}
        {[[300, 610], [1640, 600]].map(([hx, hy], i) => (
          <g key={i}>
            <rect x={hx - 120} y={hy - 150} width={240} height={150} fill="#4A3A2A" stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${hx - 160} ${hy - 130} L ${hx} ${hy - 290} L ${hx + 160} ${hy - 130} Z`} fill="#5E4A2C" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M ${hx - 36} ${hy} L ${hx - 36} ${hy - 80} Q ${hx} ${hy - 110} ${hx + 36} ${hy - 80} L ${hx + 36} ${hy} Z`} fill="#1A1410" />
          </g>
        ))}
        {/* 薪の束 */}
        <g>
          {[0, 1, 2, 3].map((j) => <rect key={j} x={1450} y={700 + j * 14} width={150} height={16} rx={8} fill={j % 2 ? MP.wood : MP.woodDark} stroke={KRP.ink} strokeWidth={3} />)}
          <line x1={1490} y1={696} x2={1490} y2={760} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1560} y1={696} x2={1560} y2={760} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 丸太のベンチ */}
        <rect x={340} y={SEAT - 50} width={330} height={40} rx={20} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1100} y={SEAT - 50} width={400} height={40} rx={20} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        {/* 左: 女性 (結んだ髪・えんじ) と、舟をこぐ子ども */}
        <MzBHito x={430} y={SEAT} s={s} f={f} phase={1} cloth={C.enji} clothDark={C.tights} female hairStyle="tail" pose="sit"
          face={laugh ? "joy" : "smile"} lean={laugh ? -8 : 0} gaze={[6, -2]} />
        <g transform={`rotate(${nod * 22} 590 ${SEAT - 40})`}>
          <MzBHito x={590} y={SEAT} s={0.46} f={f} phase={4} cloth={C.blue2} clothDark={C.navyDark} pose="sit" face="joy" still />
        </g>
        {nod > 0.5 && <text x={620} y={SEAT - 170} fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} paintOrder="stroke">z</text>}
        {/* 話し手 (立って大きな身ぶり) */}
        <ellipse cx={760} cy={SEAT + 6} rx={50} ry={10} fill={KRP.ink} opacity={0.3} />
        <MzBHito x={760} y={SEAT + 4} s={0.76} f={f} phase={2} cloth={C.navy} clothDark={C.navyDark}
          face={laugh ? "joy" : f % 40 < 20 ? "surprised" : "joy"} lean={laugh ? -10 : Math.sin(f / 8) * 5}
          arms={f < 28
            ? { l: [[-130, -190 + g * 30], [-180, -260 + g * 40]], r: [[130, -190 - g * 30], [190, -250 - g * 40]] }
            : { l: [[-110, -230], [-90, -320]], r: [[110, -230], [90, -320]] }} />
        {/* 右: 立ちかけて袖を引かれる女性 (長い髪・赤) と、引きとめる男性 */}
        <MzBHito x={1190} y={SEAT - up * 40} s={s} f={f} phase={3} cloth={C.red} clothDark={C.tights} female hairStyle="long"
          pose={up > 0.3 ? "stand" : "sit"} face={up > 0.4 ? "worried" : laugh ? "joy" : "smile"} gaze={tug > 0.5 ? [6, 0] : [-6, -2]}
          arms={up > 0.1 ? { l: [[-90, -110], [-60, -190]], r: [[84, -100], [100, -62]] } : undefined} />
        {up > 0.4 && <path d={`M ${1190 - 40} ${SEAT - 210 - up * 40} q 14 -10 28 0`} stroke={KRP.white} strokeWidth={5} fill="none" />}
        <MzBHito x={1380} y={SEAT} s={s} f={f} phase={5} cloth={C.grayC} clothDark={C.grayCDark} pose="sit"
          face={laugh ? "joy" : tug > 0 ? "smile" : "smile"} gaze={[-6, 0]} lean={laugh ? 8 : -tug * 6}
          arms={tug > 0 ? { l: [[-120, -120], [-200, -100 - up * 40]], r: [[110, -200], [100, -290]] } : { l: [[-74, -100], [-80, -64]], r: [[74, -100], [80, -64]] }} />
        {/* 「もう1話」の人さし指 */}
        {tug > 0 && <rect x={1380 + 0.7 * 92} y={SEAT - 0.7 * 340} width={10} height={26} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />}
        {/* たき火 */}
        <MzBFire x={FIRE[0]} y={FIRE[1]} s={1.1} f={f} />
        <MzBSparks x={FIRE[0]} y={FIRE[1] - 80} f={f} n={14} seed={35} />
        {/* どっと笑った瞬間の火の粉 */}
        {burst > 0 && burst < 1 && (
          <g>
            {Array.from({ length: 22 }, (_, i) => {
              const a = -Math.PI / 2 + (rnd(353, i) - 0.5) * 2.2;
              const d = easeOut(burst) * (200 + rnd(354, i) * 220);
              return <circle key={i} cx={FIRE[0] + Math.cos(a) * d} cy={FIRE[1] - 100 + Math.sin(a) * d} r={4 + rnd(355, i) * 6} fill={i % 2 ? MP.flame : KRP.orange} opacity={1 - burst} />;
            })}
          </g>
        )}
        {/* 笑い声の線 */}
        {laugh && [[430, 540], [760, 480], [1190, 540], [1380, 540]].map(([lx, ly], i) => (
          <g key={i} opacity={0.6 + 0.4 * Math.sin(f / 2 + i)}>
            <path d={`M ${lx - 70} ${ly} l -18 -16 M ${lx + 70} ${ly} l 18 -16 M ${lx - 50} ${ly - 30} l -10 -20 M ${lx + 50} ${ly - 30} l 10 -20`} stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_024: (f) => <Mz024 f={f} />,
  mz_025: (f) => <Mz025 f={f} />,
  mz_026: (f) => <Mz026 f={f} />,
  mz_027: (f) => <Mz027 f={f} />,
  mz_028: (f) => <Mz028 f={f} />,
  mz_029: (f) => <Mz029 f={f} />,
  mz_030: (f) => <Mz030 f={f} />,
  mz_031: (f) => <Mz031 f={f} />,
  mz_032: (f) => <Mz032 f={f} />,
  mz_033: (f) => <Mz033 f={f} />,
  mz_034: (f) => <Mz034 f={f} />,
  mz_035: (f) => <Mz035 f={f} />,
};

export const MZ_B_MOTIFS: string[] = [
  "mz_024", // #24
  "mz_025", // #25
  "mz_026", // #26
  "mz_027", // #27
  "mz_028", // #28
  "mz_029", // #29
  "mz_030", // #30
  "mz_031", // #31
  "mz_032", // #32
  "mz_033", // #33
  "mz_034", // #34
  "mz_035", // #35
];

export const mezaBScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
