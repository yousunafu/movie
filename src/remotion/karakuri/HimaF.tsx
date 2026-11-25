// 人は、なぜ暇をつぶすのか: 文#104〜#115 (12文)
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
  // 駅 (19世紀)
  brick: "#B5644A", brickDark: "#8E4A36", mortar: "#D8B9A0",
  iron: "#3F4A48", ironDark: "#2A3230", glass: "#D9E6E2", glassShade: "#BFD2CC",
  stone: "#CFC4B0", stoneDark: "#A89C86", platform: "#BDB2A0", platformDark: "#9E937F",
  stall: "#A87444", stallDark: "#7A5230", awnA: "#4F8A6A", awnB: "#F3E9D2",
  newsprint: "#E8E2D2", pillar: "#2F4A3E", pillarLight: "#4A6A5A",
  // 汽車
  loco: "#3F6B4E", locoDark: "#284434", locoBlack: "#2E3332", teak: "#8A5A3A", teakDark: "#64402A",
  // 田舎道
  horse: "#9A6A42", horseDark: "#6A4428", mane: "#3A2A1E",
  sheep: "#F4F1E8", sheepShade: "#DCD6C6",
  grass: "#8DB46A", grassDark: "#6E9450", hedge: "#5E8A4C", hedgeDark: "#466B38",
  road: "#C8AE84", roadDark: "#A88E64", sky: "#C9D2D6", skyLight: "#E3E8E6", cloudGray: "#AEB8BD",
  thatch: "#C9A460", thatchDark: "#A08040",
  coat: "#7A3B2E", coatDark: "#5A2A20", wig: "#2E2622", hat: "#2A2624", puddle: "#8FA9B8",
  // 絵巻
  washi: "#F1E6CC", washiFiber: "#E2D3B0", goldMist: "#E3C77A", goldMistDark: "#C9A956", table: "#5A4030", tableDark: "#46301F",
  water: "#7FB0C8", waterDark: "#5A8FA8",
  // 馬車
  coachRed: "#7A2E2A", coachRedDark: "#5A1E1A", trim: "#D9B23C",
  velvet: "#3F6B5A", velvetDark: "#2E5244", cabin: "#7A5238", cabinDark: "#5A3A26", curtain: "#9A4A3E",
  timber: "#4A3628", plaster: "#EFE6D0", cobble: "#B3A58E", cobbleDark: "#958770",
  // 牛・犬
  cow: "#F4F1E8", cowSpot: "#3B332C", dog: "#C8925A", dogDark: "#9A6A3A",
  // 工場
  factory: "#8E7A68", factoryDark: "#6A5A4C", belt: "#4A4A50", gear: "#9AA0A6", gearDark: "#6E747A",
  // 服
  suitBrown: "#7A5A42", suitBrownDark: "#5A3E2C", suitGray: "#6E747E", suitGrayDark: "#50565E",
  dressBlue: "#5A6E9A", dressRose: "#B0626A", dressGreen: "#5E8A6A", peasant: "#9A8A6A", peasantDark: "#766848",
  apron: "#E8E2D2",
} as const;
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

type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";
type Hat = "none" | "bowler" | "top" | "tricorne" | "bonnet" | "flat";

// 人 (Person) + 帽子・スカート・寝顔/あくび。Person と同じ座標変換で重ねる
const HmFFolk: React.FC<{
  x: number; y: number; s?: number; f: number; face?: Face; pose?: Pose;
  cloth?: string; clothDark?: string; hat?: Hat; hatColor?: string; skirt?: string;
  lean?: number; phase?: number; gaze?: [number, number]; mod?: "sleep" | "yawn"; still?: boolean;
}> = ({ x, y, s = 1, f, face = "normal", pose = "stand", cloth = C.suitBrown, clothDark = C.suitBrownDark,
  hat = "none", hatColor, skirt, lean = 0, phase = 0, gaze = [0, 0], mod, still = false }) => {
  const hc = hatColor ?? (hat === "bonnet" ? KRP.cream : C.hat);
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} cloth={cloth} clothDark={clothDark}
        lean={lean} phase={phase} gaze={gaze} still={still} hair="cap" />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        {skirt && <path d="M -60 -96 L -88 -4 Q 0 8 88 -4 L 60 -96 Z" fill={skirt} stroke={KRP.ink} strokeWidth={5} />}
        {skirt && <path d="M -40 -60 L -52 -8 M 0 -60 L 0 -4 M 40 -60 L 52 -8" stroke={KRP.ink} strokeWidth={3} opacity={0.35} />}
        {mod === "sleep" && (
          <g>
            <ellipse cx={-24} cy={-222} rx={17} ry={22} fill={KRP.white} />
            <ellipse cx={24} cy={-222} rx={17} ry={22} fill={KRP.white} />
            <path d="M -36 -218 Q -24 -210 -12 -218 M 12 -218 Q 24 -210 36 -218" stroke={KRP.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          </g>
        )}
        {mod === "yawn" && (
          <g>
            <rect x={-20} y={-198} width={40} height={24} fill={KRP.white} />
            <ellipse cx={0} cy={-184} rx={13} ry={17 + Math.sin(f / 6) * 3} fill={KRP.ink} />
            <ellipse cx={0} cy={-176} rx={7} ry={4} fill="#E06A5A" />
            <ellipse cx={-24} cy={-222} rx={17} ry={22} fill={KRP.white} />
            <ellipse cx={24} cy={-222} rx={17} ry={22} fill={KRP.white} />
            <path d="M -36 -222 L -12 -218 M 12 -218 L 36 -222" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
            <path d="M -40 -206 q -4 6 0 10" stroke="#7FA8C9" strokeWidth={4} fill="none" />
          </g>
        )}
        {hat === "bowler" && (
          <g>
            <path d="M -58 -262 Q -60 -336 0 -338 Q 60 -336 58 -262 Z" fill={hc} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={0} cy={-262} rx={86} ry={15} fill={hc} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -56 -276 Q 0 -268 56 -276" stroke={KRP.white} strokeWidth={4} opacity={0.3} fill="none" />
          </g>
        )}
        {hat === "top" && (
          <g>
            <rect x={-50} y={-382} width={100} height={122} rx={6} fill={hc} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-50} y={-292} width={100} height={18} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <ellipse cx={0} cy={-262} rx={88} ry={15} fill={hc} stroke={KRP.ink} strokeWidth={5} />
          </g>
        )}
        {hat === "tricorne" && (
          <g>
            <path d="M -60 -262 Q -58 -320 0 -324 Q 58 -320 60 -262 Z" fill={hc} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -104 -276 Q 0 -232 104 -276 Q 70 -250 0 -248 Q -70 -250 -104 -276 Z" fill={hc} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -104 -276 Q -80 -312 -40 -300 M 104 -276 Q 80 -312 40 -300" stroke={KRP.ink} strokeWidth={5} fill="none" />
            <circle cx={-96} cy={-276} r={7} fill={C.trim} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {hat === "bonnet" && (
          <g>
            <path d="M -80 -200 Q -92 -318 0 -322 Q 92 -318 80 -200 Q 66 -270 0 -274 Q -66 -270 -80 -200 Z" fill={hc} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -78 -206 Q -40 -150 -10 -160 M 78 -206 Q 40 -150 10 -160" stroke={KRP.red} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M -50 -300 Q 0 -310 50 -300" stroke={KRP.white} strokeWidth={4} opacity={0.4} fill="none" />
          </g>
        )}
        {hat === "flat" && (
          <g>
            <path d="M -64 -258 Q -60 -314 0 -316 Q 60 -314 66 -258 Z" fill={hc} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -66 -258 Q 0 -246 92 -256 Q 100 -244 88 -238 Q 0 -234 -66 -246 Z" fill={hc} stroke={KRP.ink} strokeWidth={5} />
          </g>
        )}
      </g>
    </g>
  );
};

// 「暇」の雲 (橙のふわふわ)。外周を太い墨の円で先に描いてから塗りで内側の線を消す
const HmFCloud: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; t?: number; mark?: boolean }> = ({
  x, y, s = 1, f, phase = 0, t = 1, mark = false,
}) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0.001) return null;
  const w = Math.sin((f + phase * 13) / 8) * 0.05;
  const cs: [number, number, number][] = [[-38, 8, 30], [-6, -14, 38], [32, -2, 32], [6, 16, 30], [50, 16, 22], [-56, 20, 20]];
  return (
    <g transform={`translate(${x} ${y + Math.sin((f + phase * 11) / 10) * 4}) scale(${sc * (1 + w)} ${sc * (1 - w)})`}>
      {cs.map(([cx, cy, r], i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r + 5} fill={KRP.ink} />)}
      {cs.map(([cx, cy, r], i) => <circle key={`i${i}`} cx={cx} cy={cy} r={r} fill={HP.hi} />)}
      <path d="M -30 -6 q 8 -18 26 -24" stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
      <ellipse cx={8} cy={26} rx={50} ry={10} fill={HP.hiDark} opacity={0.35} />
      {mark && (
        <g transform="rotate(-12 26 10)">
          <circle cx={26} cy={10} r={20} fill="none" stroke={KRP.red} strokeWidth={5} />
          <path d="M 16 10 l 7 8 l 14 -16" stroke={KRP.red} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// 硬貨のマーク (字は描かない)
const HmFCoin: React.FC<{ x: number; y: number; s?: number; t?: number; rot?: number }> = ({ x, y, s = 1, t = 1, rot = 0 }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${rot})`}>
      <ellipse cx={4} cy={6} rx={40} ry={40} fill={KRP.ink} opacity={0.25} />
      <circle r={40} fill={KRP.gold} stroke={KRP.ink} strokeWidth={6} />
      <circle r={28} fill="none" stroke={KRP.brass} strokeWidth={5} />
      <path d="M 0 -16 L 5 -5 L 16 -4 L 8 4 L 10 15 L 0 9 L -10 15 L -8 4 L -16 -4 L -5 -5 Z" fill="#A8862A" />
      <path d="M -22 -20 q 8 -10 18 -12" stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" />
    </g>
  );
};

// ガス灯 (x,y = 柱の根元)
const HmFGasLamp: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number }> = ({ x, y, s = 1, f, phase = 0 }) => {
  const fl = 0.8 + 0.12 * Math.sin((f + phase * 7) / 3) + 0.08 * Math.sin((f + phase) * 1.9);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-330} r={90 * fl} fill={HP.spark} opacity={0.22} />
      <rect x={-28} y={-24} width={56} height={24} rx={4} fill={C.ironDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-11} y={-290} width={22} height={270} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-18} y={-120} width={36} height={18} rx={4} fill={C.ironDark} stroke={KRP.ink} strokeWidth={4} />
      <line x1={-40} y1={-280} x2={40} y2={-280} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
      <path d="M -34 -296 L 34 -296 L 26 -372 L -26 -372 Z" fill="#FFF0B0" stroke={KRP.ink} strokeWidth={6} />
      <path d="M 0 -296 L 0 -372" stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={0} cy={-326} rx={12 * fl} ry={18 * fl} fill={HP.spark} />
      <ellipse cx={0} cy={-322} rx={5} ry={9} fill={KRP.white} />
      <path d="M -36 -372 L 0 -404 L 36 -372 Z" fill={C.ironDark} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={-410} r={7} fill={C.ironDark} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

// 湯気・蒸気のかたまり (x,y から上へ流れる)
const HmFSteam: React.FC<{ x: number; y: number; f: number; s?: number; dx?: number; n?: number; speed?: number; gray?: boolean }> = ({
  x, y, f, s = 1, dx = 60, n = 6, speed = 1, gray = false,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const age = ((f * speed * 0.025 + i / n) % 1);
      const cx = x + dx * age * s + Math.sin(age * 6 + i) * 14 * s;
      const cy = y - age * 280 * s;
      const r = (22 + age * 70) * s;
      return <circle key={i} cx={cx} cy={cy} r={r} fill={gray ? KRP.gray : KRP.white}
        stroke={KRP.ink} strokeWidth={3} strokeOpacity={0.35} opacity={(1 - age) * 0.85} />;
    })}
  </g>
);

// 蒸気機関車 (横から・右向き)。x,y = 車体の真ん中の線路の高さ
const HmFLocoSide: React.FC<{ x: number; y: number; s?: number; f: number; roll?: number; flip?: boolean }> = ({
  x, y, s = 1, f, roll = 0, flip = false,
}) => {
  const wheel = (cx: number, cy: number, r: number, k: number) => (
    <g key={k} transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
      <circle r={r - 12} fill={C.locoBlack} />
      <g transform={`rotate(${roll})`}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 4) * (r - 12)} y2={Math.sin((i * Math.PI) / 4) * (r - 12)}
            stroke={KRP.red} strokeWidth={5} />
        ))}
      </g>
      <circle r={12} fill={C.trim} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  const rodY = Math.sin((roll * Math.PI) / 180) * 30;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* 炭水車 */}
      <rect x={-470} y={-250} width={240} height={190} rx={10} fill={C.loco} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-460} y={-280} width={220} height={36} rx={6} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-450} y={-210} width={200} height={10} fill={C.trim} />
      {/* 運転室 */}
      <rect x={-230} y={-330} width={170} height={270} rx={8} fill={C.loco} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-250} y={-352} width={210} height={30} rx={8} fill={C.locoDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-200} y={-300} width={80} height={80} rx={10} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
      {/* ボイラー */}
      <rect x={-70} y={-270} width={420} height={150} rx={60} fill={C.loco} stroke={KRP.ink} strokeWidth={7} />
      {[30, 150, 270].map((bx) => <rect key={bx} x={bx} y={-270} width={12} height={150} fill={C.trim} stroke={KRP.ink} strokeWidth={3} />)}
      <path d="M -40 -250 Q 140 -262 320 -250" stroke={KRP.white} strokeWidth={6} opacity={0.3} fill="none" />
      {/* ドーム・汽笛・煙突 */}
      <path d="M 100 -268 Q 100 -320 140 -322 Q 180 -320 180 -268 Z" fill={C.trim} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-20} y={-310} width={14} height={42} fill={C.trim} stroke={KRP.ink} strokeWidth={4} />
      <rect x={300} y={-380} width={50} height={112} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={6} />
      <rect x={288} y={-402} width={74} height={28} rx={6} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={6} />
      {/* 煙室の前 */}
      <rect x={340} y={-262} width={50} height={140} rx={16} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={6} />
      <rect x={380} y={-120} width={40} height={50} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={430} cy={-96} r={14} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={4} />
      {/* 台枠 */}
      <rect x={-470} y={-80} width={890} height={26} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={5} />
      {/* 車輪 */}
      {wheel(-410, -50, 44, 1)}{wheel(-290, -50, 44, 2)}
      {wheel(-120, -86, 86, 3)}{wheel(90, -86, 86, 4)}{wheel(310, -46, 46, 5)}
      {/* 連結棒 */}
      <rect x={-130} y={-96 + rodY} width={230} height={18} rx={9} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// 馬 (横から・右向き)。x,y = 腹の下の地面。stumble 0〜1 で前のめり。rider に鞍の上の物 (鞍の上面 = (-10,-330))
const HmFHorse: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; stumble?: number; walk?: number; rider?: React.ReactNode; color?: string; dark?: string }> = ({
  x, y, s = 1, f, phase = 0, stumble = 0, walk = 1, rider, color = C.horse, dark = C.horseDark,
}) => {
  const sw = (k: number) => Math.sin((f + phase * 9) / 5 + k) * 16 * walk;
  const leg = (lx: number, rot: number, back: boolean, k: number) => (
    <g key={k} transform={`rotate(${rot} ${lx} -200)`}>
      <rect x={lx - 17} y={-210} width={34} height={186} rx={14} fill={back ? dark : color} stroke={KRP.ink} strokeWidth={6} />
      <rect x={lx - 20} y={-30} width={40} height={30} rx={6} fill={KRP.ink} />
    </g>
  );
  const st = clamp01(stumble);
  const bob = Math.abs(Math.sin((f + phase * 9) / 5)) * 6 * walk;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={230} ry={20} fill={KRP.ink} opacity={0.18} />
      <g transform={`rotate(${st * 11} -120 0) translate(0 ${-bob})`}>
        {leg(-100, -sw(0) * 0.8, true, 1)}{leg(150, sw(1.3) + st * 10, true, 2)}
        {/* しっぽ */}
        <path d={`M -180 -290 Q ${-262 + Math.sin(f / 7) * 10} -220 ${-232 + Math.sin(f / 7) * 16} -110`} stroke={C.mane} strokeWidth={34} fill="none" strokeLinecap="round" />
        {/* 胴 */}
        <ellipse cx={0} cy={-260} rx={196} ry={86} fill={color} stroke={KRP.ink} strokeWidth={7} />
        {/* 首と頭 */}
        <path d="M 110 -310 Q 160 -410 226 -452 L 296 -404 Q 236 -340 196 -222 Z" fill={color} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
        <g transform="rotate(38 300 -404)">
          <ellipse cx={312} cy={-404} rx={86} ry={40} fill={color} stroke={KRP.ink} strokeWidth={7} />
          <ellipse cx={384} cy={-404} rx={22} ry={28} fill={dark} opacity={0.5} />
          <circle cx={380} cy={-414} r={5} fill={KRP.ink} />
        </g>
        <path d="M 226 -456 l -6 -46 l 30 34 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={278} cy={-430} r={7} fill={KRP.ink} />
        <circle cx={280} cy={-432} r={2.5} fill={KRP.white} />
        {/* たてがみ */}
        <path d="M 120 -322 Q 150 -400 218 -458 L 230 -446 Q 176 -392 150 -300 Z" fill={C.mane} stroke={KRP.ink} strokeWidth={4} />
        {/* 手綱・鞍 */}
        <path d="M 250 -380 Q 300 -350 330 -360" stroke={KRP.ink} strokeWidth={5} fill="none" />
        <path d="M -90 -336 Q -10 -350 70 -336 L 60 -260 Q -10 -250 -80 -260 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -70 -346 Q -10 -362 50 -346 L 46 -326 Q -10 -334 -66 -326 Z" fill={C.stallDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={-10} y1={-260} x2={-10} y2={-200} stroke={KRP.ink} strokeWidth={4} />
        {leg(-140, sw(0.5) * 0.8, false, 3)}{leg(110, -sw(1.8) + st * 46, false, 4)}
        {rider && <g transform="translate(-10 -330)">{rider}</g>}
      </g>
    </g>
  );
};

// 羊 (横から・右向き)。x,y = 足元
const HmFSheep: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; wide?: number; look?: number; flip?: boolean }> = ({
  x, y, s = 1, f, phase = 0, wide = 0, look = 0, flip = false,
}) => {
  const chew = Math.sin((f + phase * 5) / 2.5) * 3 * (1 - wide);
  const wool: [number, number, number][] = [[-60, -120, 40], [-20, -140, 44], [26, -136, 42], [62, -116, 36], [-40, -88, 38], [10, -90, 42], [52, -86, 34]];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={2} rx={100} ry={12} fill={KRP.ink} opacity={0.18} />
      {[-50, -20, 30, 60].map((lx) => <rect key={lx} x={lx - 8} y={-70} width={16} height={70} rx={6} fill={KRP.ink} />)}
      {wool.map(([cx, cy, r], i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r + 5} fill={KRP.ink} />)}
      {wool.map(([cx, cy, r], i) => <circle key={`i${i}`} cx={cx} cy={cy} r={r} fill={C.sheep} />)}
      {wool.slice(0, 3).map(([cx, cy], i) => <path key={`c${i}`} d={`M ${cx - 14} ${cy} q 8 -10 16 0`} stroke={C.sheepShade} strokeWidth={4} fill="none" />)}
      <g transform={`rotate(${-look * 30} 90 -120)`}>
        <ellipse cx={110} cy={-120 + chew * 0.3} rx={34} ry={44} fill={KRP.ink} transform="rotate(-20 110 -120)" />
        <ellipse cx={82} cy={-152} rx={22} ry={10} fill={KRP.ink} transform="rotate(-30 82 -152)" />
        <ellipse cx={118} cy={-96 + chew} rx={14} ry={8} fill="#5A4E44" />
        <circle cx={112} cy={-132} r={7 + wide * 9} fill={KRP.white} />
        <circle cx={114} cy={-132} r={3 + wide * 2} fill={KRP.ink} />
      </g>
    </g>
  );
};

// 乗合馬車 (横から・右向き)。x,y = 地面の真ん中。win にはめこむ窓の中身
const HmFCoachSide: React.FC<{ x: number; y: number; s?: number; roll?: number; win?: React.ReactNode }> = ({ x, y, s = 1, roll = 0, win }) => {
  const wheel = (cx: number, cy: number, r: number) => (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="none" stroke={KRP.ink} strokeWidth={16} />
      <circle r={r} fill="none" stroke={C.trim} strokeWidth={9} />
      <g transform={`rotate(${roll})`}>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 5) * r} y2={Math.sin((i * Math.PI) / 5) * r} stroke={KRP.ink} strokeWidth={6} />
        ))}
      </g>
      <circle r={14} fill={C.trim} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={240} ry={18} fill={KRP.ink} opacity={0.18} />
      {/* 屋根の荷物 */}
      <rect x={-150} y={-392} width={120} height={50} rx={6} fill={C.stall} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-20} y={-382} width={90} height={40} rx={6} fill={C.teakDark} stroke={KRP.ink} strokeWidth={5} />
      <line x1={-180} y1={-344} x2={160} y2={-344} stroke={KRP.ink} strokeWidth={6} />
      {/* 車体 */}
      <path d="M -200 -340 L 170 -340 L 190 -230 Q 170 -120 120 -120 L -150 -120 Q -200 -130 -210 -230 Z" fill={C.coachRed} stroke={KRP.ink} strokeWidth={7} />
      <path d="M -196 -250 L 186 -250" stroke={C.trim} strokeWidth={6} />
      {/* 窓 */}
      <rect x={-170} y={-318} width={96} height={80} rx={8} fill={C.skyLight} stroke={KRP.ink} strokeWidth={5} />
      <rect x={70} y={-318} width={90} height={80} rx={8} fill={C.skyLight} stroke={KRP.ink} strokeWidth={5} />
      {win}
      {/* ドア */}
      <rect x={-50} y={-330} width={100} height={200} rx={8} fill={C.coachRedDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-36} y={-316} width={72} height={70} rx={6} fill={C.skyLight} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={34} cy={-200} r={6} fill={C.trim} />
      {/* 御者台 */}
      <rect x={170} y={-300} width={80} height={22} rx={6} fill={C.teakDark} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 180 -278 L 230 -140" stroke={KRP.ink} strokeWidth={8} />
      {/* ばね・車輪 */}
      <path d="M -190 -120 Q -150 -96 -110 -120 M 80 -120 Q 120 -96 160 -120" stroke={KRP.ink} strokeWidth={6} fill="none" />
      {wheel(-150, -82, 82)}{wheel(130, -62, 62)}
      <line x1={190} y1={-90} x2={300} y2={-150} stroke={C.teakDark} strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #104 第5章、駅で、暇が売られた。
// 格: 山 / seed 5104
// 絵: 章扉。どこ: 19世紀の駅のホーム (鉄骨のアーチ屋根・ガス灯・蒸気機関車・ホームの売店)。演出: ホームの売店に本と新聞がずらりと並び、店先の棚に、**値札のついた「暇」の雲** (#15 の雲。橙) が瓶に詰められて並んでいる (比喩のユーモア)。客が瓶を手に取る。ChapterDoor num=5 title="駅で、暇が売られた。" を右に。動き: 機関車の蒸気 / 瓶の中で雲がふわふわ / ガス灯
// どこ: 19世紀の駅のホーム。上はガラスと鉄骨のアーチ屋根、左は煉瓦の壁を背にした売店、右奥に蒸気機関車
// 演出: 売店の棚に新聞と本がぎっしり。店先の段に「暇」の雲を詰めた瓶が値札つきで並ぶ。店員が瓶を掲げて売り込み、紳士の客が1つ取って目を丸くする
// 動き: カメラがゆっくり売店へ寄る / 瓶の中で雲がふわふわ / 客の手へ瓶が移る / 機関車の蒸気 / ガス灯のゆらぎ
const HmFJar: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; tag?: boolean; coins?: number }> = ({
  x, y, s = 1, f, phase = 0, tag = true, coins = 1,
}) => {
  const sw = Math.sin((f + phase * 9) / 11) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={58} ry={9} fill={KRP.ink} opacity={0.2} />
      <rect x={-50} y={-150} width={100} height={150} rx={22} fill={HP.screenCore} opacity={0.55} />
      <HmFCloud x={0} y={-72} s={0.62} f={f} phase={phase} />
      <rect x={-50} y={-150} width={100} height={150} rx={22} fill="none" stroke={KRP.ink} strokeWidth={6} />
      <path d="M -34 -128 L -34 -30" stroke={KRP.white} strokeWidth={8} opacity={0.6} strokeLinecap="round" />
      <rect x={-40} y={-176} width={80} height={30} rx={6} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
      <line x1={-36} y1={-161} x2={36} y2={-161} stroke={HP.brassDark} strokeWidth={4} />
      {/* 瓶の貼り札 */}
      <rect x={-30} y={-60} width={60} height={40} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>暇</text>
      {tag && (
        <g transform={`rotate(${sw} 36 -166)`}>
          <path d="M 36 -166 Q 60 -150 66 -120" stroke={KRP.ink} strokeWidth={3} fill="none" />
          <path d="M 44 -120 L 88 -120 L 100 -96 L 88 -72 L 44 -72 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={56} cy={-96} r={4} fill={KRP.ink} />
          {Array.from({ length: coins }, (_, i) => (
            <circle key={i} cx={76 + (i % 2) * 6} cy={-96 - i * 5} r={11} fill={KRP.gold} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
      )}
    </g>
  );
};

const Hm104: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = 1 + 0.045 * easeOut(seg(f, 0, 42));
  const grab = easeOut(seg(f, 12, 30));
  const jx = lerp(780, 914, grab), jy = lerp(556, 568, grab) - Math.sin(grab * Math.PI) * 90;
  const surprise = seg(f, 24, 30);
  return (
    <Frame f={f} seed={5104} bg={C.brick} over={<>
      <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
        background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
      <ChapterDoor num={5} title="駅で、暇が売られた。" t={door} left={1000} top={560} />
    </>}>
      <g transform={`translate(520 600) scale(${cam}) translate(-520 -600)`}>
        {/* ガラスの屋根と鉄骨のアーチ */}
        <rect x={-60} y={-60} width={2040} height={420} fill={C.glass} />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={-60 + i * 132} y1={-60} x2={-60 + i * 132 + (i - 8) * 18} y2={330} stroke={C.glassShade} strokeWidth={6} />
        ))}
        {[60, 160, 250].map((ly) => <line key={ly} x1={-60} y1={ly} x2={1980} y2={ly} stroke={C.glassShade} strokeWidth={5} />)}
        <path d="M -80 360 Q 960 -240 2000 360" stroke={C.ironDark} strokeWidth={30} fill="none" />
        <path d="M -80 360 Q 960 -240 2000 360" stroke={C.iron} strokeWidth={14} fill="none" />
        {/* 右奥: 線路と機関車 (題字の上に出る高さ) */}
        <rect x={900} y={330} width={1100} height={200} fill={C.stoneDark} />
        <rect x={900} y={500} width={1100} height={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        <HmFSteam x={1418} y={300} f={f} s={0.9} dx={-120} speed={1.2} />
        <HmFLocoSide x={1500} y={508} s={0.5} f={f} roll={f * 1.5} flip />
        {/* 左: 煉瓦の壁 */}
        <rect x={-60} y={300} width={1000} height={400} fill={C.brick} />
        {Array.from({ length: 10 }, (_, r) => (
          <g key={r}>
            <line x1={-60} y1={310 + r * 40} x2={940} y2={310 + r * 40} stroke={C.mortar} strokeWidth={4} opacity={0.7} />
            {Array.from({ length: 12 }, (_, c) => (
              <line key={c} x1={-40 + c * 90 + (r % 2) * 45} y1={310 + r * 40} x2={-40 + c * 90 + (r % 2) * 45} y2={350 + r * 40}
                stroke={C.mortar} strokeWidth={4} opacity={0.7} />
            ))}
          </g>
        ))}
        {/* ホームの床 */}
        <rect x={-60} y={690} width={2040} height={450} fill={C.platform} />
        <g stroke={C.platformDark} strokeWidth={4}>
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220 - 40} y1={690} x2={i * 260 - 200} y2={1120} />)}
          <line x1={-60} y1={800} x2={1980} y2={800} />
        </g>
        <rect x={900} y={524} width={1100} height={20} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        <rect x={900} y={544} width={1100} height={150} fill={C.platform} />
        {/* 売店 */}
        <g>
          {/* 屋根とひだ飾り */}
          <rect x={90} y={196} width={800} height={40} rx={6} fill={C.stallDark} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M ${100 + i * 78} 236 q 39 46 78 0 Z`} fill={i % 2 ? C.awnA : C.awnB} stroke={KRP.ink} strokeWidth={4} />
          ))}
          <rect x={110} y={236} width={760} height={330} fill={C.stallDark} stroke={KRP.ink} strokeWidth={6} />
          {/* 奥の棚: 上段=新聞の束 / 中段=本 */}
          {[0, 1].map((r) => <rect key={r} x={120} y={370 + r * 120} width={740} height={12} fill={C.stall} stroke={KRP.ink} strokeWidth={4} />)}
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i} transform={`rotate(${(rnd(5104, i) - 0.5) * 6} ${160 + i * 80} 340)`}>
              <rect x={128 + i * 80} y={300} width={68} height={70} fill={C.newsprint} stroke={KRP.ink} strokeWidth={4} />
              {[0, 1, 2, 3].map((k) => <line key={k} x1={136 + i * 80} y1={316 + k * 13} x2={188 + i * 80} y2={316 + k * 13} stroke={KRP.gray} strokeWidth={4} />)}
              <rect x={136 + i * 80} y={306} width={52} height={6} fill={KRP.ink} opacity={0.5} />
            </g>
          ))}
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={128 + i * 33} y={398 + (i % 4) * 6} width={26} height={92 - (i % 4) * 6} rx={3}
              fill={[C.coachRed, KRP.blueDeep, KRP.yellow, C.awnA, C.stall, KRP.red][i % 6]} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {/* 店員 (一般の人)。瓶を掲げて売り込む */}
          <HmFFolk x={420} y={640} s={0.95} f={f} face="joy" pose="raise" cloth={C.awnA} clothDark={C.velvetDark} hat="flat" hatColor={C.suitGrayDark} phase={2} />
          <HmFJar x={482} y={372 + Math.sin(f / 6) * 6} s={0.8} f={f} phase={4} coins={3} />
          {/* カウンター (前板) */}
          <rect x={90} y={566} width={800} height={200} fill={C.stall} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={120 + k * 192} y={600} width={160} height={140} rx={6} fill="none" stroke={C.stallDark} strokeWidth={5} />)}
          <rect x={80} y={552} width={820} height={22} rx={4} fill={C.stallDark} stroke={KRP.ink} strokeWidth={6} />
          {/* 店先の段の瓶 */}
          {[160, 290, 530, 660].map((jxx, i) => <HmFJar key={jxx} x={jxx} y={556} s={0.82} f={f} phase={i} coins={1 + (i % 3)} />)}
          {/* 取られた瓶の跡 (ほこりの丸) */}
          <ellipse cx={780} cy={556} rx={44} ry={7} fill={KRP.ink} opacity={0.15 * grab} />
        </g>
        {/* ガス灯 */}
        <HmFGasLamp x={980} y={700} s={0.95} f={f} />
        {/* 客 (紳士)。瓶を取って、のぞきこむ */}
        <HmFFolk x={840} y={862} s={1.05} f={f} face={surprise > 0.5 ? "joy" : "surprised"} pose="raise" cloth={C.suitGray} clothDark={C.suitGrayDark}
          hat="top" gaze={[7, -6]} lean={-3} phase={1} />
        <HmFJar x={jx} y={jy} s={0.82} f={f} phase={7} tag coins={2} />
        {surprise > 0 && [0, 1, 2].map((k) => (
          <line key={k} x1={840 + (k - 1) * 50} y1={436 - (k === 1 ? 10 : 0)} x2={840 + (k - 1) * 66} y2={404 - (k === 1 ? 20 : 0)}
            stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={surprise} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #105 乗り物の中で暇をつぶす人は、昔からいました。
// 格: 並 / seed 5105
// 絵: どこ: 古い絵巻物風に横へ流れる「乗り物の歴史」の帯 (和紙の上)。演出: 帯の上を、馬・駕籠・帆船・乗合馬車が左から右へ順に進む。どの乗り物の上にも、小さく本を読む・あくびをする・外をぼんやり見る人がいる。帯が f で横にスクロール。動き: 帯がスクロール / 乗り物が揺れる / あくび
// どこ: 黒い文机の上に広げた絵巻物。両端に軸、和紙の帯の上下に金の霞
// 演出: 帯の上を、馬・駕籠・帆船・乗合馬車が順に進む。馬の人はぼんやり外を見、駕籠の人は大あくび、船と馬車の人は本を読む
// 動き: 絵巻が右から左へ巻き取られてスクロール / 乗り物がそれぞれ揺れる / あくびの口がのびる / 波が動く
const Hm105: React.FC<{ f: number }> = ({ f }) => {
  const off = 150 - f * 3.4;
  const gy = 650;
  const kago = Math.sin(f / 4) * 5;
  const ship = Math.sin(f / 9) * 3;
  return (
    <Frame f={f} seed={5105} bg={C.table}>
      {/* 文机 */}
      <rect x={-40} y={-40} width={2000} height={1160} fill={C.table} />
      <g stroke={C.tableDark} strokeWidth={5} opacity={0.7}>
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M -40 ${40 + i * 130} q 500 ${rnd(5105, i) * 30 - 15} 1000 0 q 500 ${rnd(5106, i) * 30 - 15} 1000 0`} fill="none" />)}
      </g>
      {/* 和紙の帯 */}
      <defs>
        <clipPath id="hmf105band"><rect x={70} y={200} width={1780} height={610} /></clipPath>
      </defs>
      <rect x={78} y={214} width={1780} height={610} fill={KRP.ink} opacity={0.3} />
      <rect x={70} y={200} width={1780} height={610} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
      <g clipPath="url(#hmf105band)">
        {Array.from({ length: 40 }, (_, i) => (
          <path key={i} d={`M ${70 + rnd(51, i) * 1780} ${210 + rnd(52, i) * 590} q 14 ${rnd(53, i) * 20 - 10} 30 4`}
            stroke={C.washiFiber} strokeWidth={3} fill="none" />
        ))}
        <g transform={`translate(${off} 0)`}>
          {/* 金の霞 (上下) */}
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x={-100 + i * 330} y={196 + (i % 2) * 20} width={260} height={56} rx={28} fill={C.goldMist} stroke={C.goldMistDark} strokeWidth={4} />
              <rect x={60 + i * 330} y={740 - (i % 2) * 16} width={280} height={60} rx={30} fill={C.goldMist} stroke={C.goldMistDark} strokeWidth={4} />
            </g>
          ))}
          {/* 地面の墨の線・草 */}
          <path d={`M -100 ${gy} Q 300 ${gy - 14} 700 ${gy} T 1500 ${gy}`} stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.5} />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M ${-40 + i * 80} ${gy + 6} l 6 -22 M ${-30 + i * 80} ${gy + 6} l -6 -18`} stroke={C.grassDark} strokeWidth={4} />
          ))}
          {/* 遠くの山 */}
          <path d="M -80 560 Q 80 420 220 520 Q 360 400 520 540 Q 640 470 760 560" fill={C.washiFiber} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />

          {/* ① 馬: 乗り手はぼんやり遠くを見る */}
          <HmFHorse x={250} y={gy} s={0.5} f={f} phase={1} walk={0.8}
            rider={<g transform="scale(2)"><HmFFolk x={0} y={29} s={0.5} f={f} pose="sit" face="normal" gaze={[8, -5]} cloth={C.peasant} clothDark={C.peasantDark} phase={3} /></g>} />
          {/* 「ぼんやり」の視線の点線 */}
          <path d="M 300 420 q 60 -40 120 -30" stroke={KRP.ink} strokeWidth={4} strokeDasharray="6 10" fill="none" opacity={0.6} />
          <TagPlate x={250} y={770} text="馬" size={30} />

          {/* ② 駕籠: 中の人が大あくび */}
          <g transform={`translate(0 ${kago})`}>
            <HmFFolk x={620} y={gy} s={0.5} f={f} pose="raise" face="worried" cloth={KRP.blueDeep} clothDark={KRP.ink} phase={1} />
            <HmFFolk x={900} y={gy} s={0.5} f={f} pose="raise" face="normal" cloth={KRP.blueDeep} clothDark={KRP.ink} phase={4} />
            <HmFFolk x={760} y={628} s={0.45} f={f} pose="sit" mod="yawn" cloth={C.curtain} clothDark={C.coatDark} phase={2} />
            <path d="M 680 470 L 840 470 L 860 492 L 660 492 Z" fill={C.timber} stroke={KRP.ink} strokeWidth={5} />
            <path fillRule="evenodd" d="M 676 492 L 844 492 L 844 634 L 676 634 Z M 712 506 L 808 506 L 808 580 L 712 580 Z"
              fill={C.stall} stroke={KRP.ink} strokeWidth={5} />
            <rect x={560} y={478} width={400} height={16} rx={8} fill={C.stallDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <TagPlate x={760} y={770} text="駕籠" size={30} />

          {/* ③ 帆船: 甲板で本を読む */}
          <g transform={`translate(0 ${ship}) rotate(${Math.sin(f / 9) * 2} 1130 640)`}>
            <line x1={1130} y1={640} x2={1130} y2={300} stroke={C.timber} strokeWidth={10} />
            <path d={`M 1050 320 Q ${1130 + Math.sin(f / 7) * 8} 300 1210 320 L 1220 520 Q 1130 ${505 + Math.sin(f / 7) * 8} 1040 520 Z`} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 1060 380 L 1200 380 M 1056 450 L 1212 450" stroke={C.washiFiber} strokeWidth={4} />
            <HmFFolk x={1060} y={612} s={0.45} f={f} pose="hold" face="smile" gaze={[0, 6]} cloth={C.awnA} clothDark={C.velvetDark} phase={5} />
            <rect x={1034} y={548} width={52} height={34} rx={3} fill={C.coachRed} stroke={KRP.ink} strokeWidth={3} transform="rotate(-8 1060 565)" />
            <path d="M 960 610 L 1300 610 L 1250 680 L 1010 680 Z" fill={C.cabin} stroke={KRP.ink} strokeWidth={6} />
            <line x1={980} y1={636} x2={1280} y2={636} stroke={C.cabinDark} strokeWidth={4} />
          </g>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M ${900 + i * 70 + ((f * 2) % 70)} 690 q 18 -22 36 0 q 18 -22 36 0`} stroke={C.waterDark} strokeWidth={5} fill="none" />
          ))}
          <rect x={900} y={694} width={500} height={36} fill={C.water} opacity={0.5} />
          <TagPlate x={1140} y={770} text="帆船" size={30} />

          {/* ④ 乗合馬車: 窓の中で本を読む */}
          <HmFCoachSide x={1520} y={gy + Math.abs(Math.sin(f / 5)) * -3} s={0.55} roll={f * 4}
            win={<g>
              <circle cx={-122} cy={-268} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -146 -276 Q -122 -306 -98 -276 Z" fill={KRP.ink} />
              <rect x={-150} y={-262} width={50} height={22} rx={3} fill={C.awnA} stroke={KRP.ink} strokeWidth={3} />
            </g>} />
          <HmFHorse x={1755} y={gy} s={0.4} f={f} phase={2} walk={0.8} />
          <TagPlate x={1580} y={770} text="乗合馬車" size={30} />
        </g>
      </g>
      {/* 軸 (左は巻き取る側・右は巻物の残り) */}
      <rect x={30} y={180} width={50} height={650} rx={12} fill={C.cabin} stroke={KRP.ink} strokeWidth={6} />
      <rect x={24} y={166} width={62} height={26} rx={8} fill={C.goldMist} stroke={KRP.ink} strokeWidth={5} />
      <rect x={24} y={818} width={62} height={26} rx={8} fill={C.goldMist} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1836} y={190} width={80} height={630} rx={30} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((k) => <line key={k} x1={1850 + k * 18} y1={200} x2={1850 + k * 18} y2={810} stroke={C.washiFiber} strokeWidth={4} />)}
      <rect x={1860} y={166} width={40} height={26} rx={8} fill={C.goldMist} stroke={KRP.ink} strokeWidth={5} />
      <rect x={1860} y={818} width={40} height={26} rx={8} fill={C.goldMist} stroke={KRP.ink} strokeWidth={5} />    </Frame>
  );
};

// -------------------------------------------------------------------
// #106 1665年、イギリスの役人ピープスは、馬に揺られながら、片手で本を読んでいます。
// 格: 山 / seed 5106
// 絵: どこ: 1665年のイギリスの田舎道 (生け垣・羊・石造りの農家・曇り空)。年代札「1665年」、地名札「イギリス」。演出: **顔は見せない**。黒いかつらとつば広の帽子の男が、ぽくぽく歩く馬の上で、片手に手綱・片手に開いた本。カメラは斜め後ろから。羊が見上げる。動き: 馬の歩みに合わせて上下に揺れる / ページがめくれる / 羊がもぐもぐ
// どこ: 1665年のイギリスの田舎道。曇り空・なだらかな丘・石造りでわら屋根の農家・生け垣・羊
// 演出: 黒い長いかつらとつば広の帽子の男を、斜め後ろから。顔は見せず、かつらの後頭部だけ。片手に手綱、片手に開いた本。羊が見上げてもぐもぐ
// 動き: 馬の歩みで上下にゆれる / 背景が左へ流れる (カメラが馬について行く) / ページがめくれる / 羊のあご
// 乗り手 (鞍の上面が原点・馬と同じ縮尺)。顔は描かない (かつらの後頭部と帽子だけ)
const HmFPepys: React.FC<{ f: number; flip?: number; hatUp?: number; bookFly?: number; clutch?: number }> = ({
  f, flip = 0, hatUp = 0, bookFly = 0, clutch = 0,
}) => {
  const bookOn = bookFly <= 0;
  return (
    <g>
      {/* 脚と長靴 */}
      <g transform="rotate(-8 20 -10)">
        <rect x={0} y={-20} width={42} height={120} rx={16} fill={C.coatDark} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 2 90 L 46 90 L 50 170 L 80 176 L 78 196 L 0 196 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* 上着 (長い) */}
      <path d="M -70 -6 L -56 -196 Q 0 -218 56 -196 L 76 -6 Q 86 50 50 74 L -96 66 Q -110 30 -70 -6 Z" fill={C.coat} stroke={KRP.ink} strokeWidth={7} />
      <path d="M -40 -150 L -50 40 M 30 -160 L 40 50" stroke={C.coatDark} strokeWidth={5} opacity={0.6} />
      {/* 左手: 手綱 (しがみつくときは首へ) */}
      <line x1={40} y1={-160} x2={lerp(150, 220, clutch)} y2={lerp(-90, -70, clutch)} stroke={KRP.ink} strokeWidth={34} strokeLinecap="round" />
      <line x1={40} y1={-160} x2={lerp(150, 220, clutch)} y2={lerp(-90, -70, clutch)} stroke={C.coat} strokeWidth={24} strokeLinecap="round" />
      <circle cx={lerp(156, 226, clutch)} cy={lerp(-88, -68, clutch)} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <path d={`M ${lerp(156, 226, clutch)} -88 Q 220 -40 268 -56`} stroke={KRP.ink} strokeWidth={5} fill="none" />
      {/* 右手: 本を掲げる (慌てると前へ伸ばす) */}
      <line x1={20} y1={-176} x2={lerp(118, 190, clutch)} y2={lerp(-236, -120, clutch)} stroke={KRP.ink} strokeWidth={34} strokeLinecap="round" />
      <line x1={20} y1={-176} x2={lerp(118, 190, clutch)} y2={lerp(-236, -120, clutch)} stroke={C.coat} strokeWidth={24} strokeLinecap="round" />
      <circle cx={lerp(124, 196, clutch)} cy={lerp(-242, -116, clutch)} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {bookOn && (
        <g transform="translate(150 -262)">
          <path d="M -34 -46 L 30 -60 L 44 30 L -24 40 Z" fill={C.coatDark} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 30 -60 L 44 30 L 52 26 L 38 -62 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -24 -38 L 22 -48 L 34 22 L -14 30 Z" fill="none" stroke={C.trim} strokeWidth={4} />
          {flip > 0 && flip < 1 && (
            <path d={`M 4 -48 Q ${lerp(40, -40, flip)} ${-70 + Math.sin(flip * Math.PI) * -20} ${lerp(30, -30, flip)} 28`}
              stroke={KRP.ink} strokeWidth={4} fill={KRP.white} />
          )}
        </g>
      )}
      {/* 頭: 黒い長いかつら (後頭部)。顔は見えない */}
      {[[-60, -170, 26], [-40, -146, 24], [44, -160, 24], [58, -184, 22], [-66, -206, 24], [0, -160, 26]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={C.wig} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <ellipse cx={0} cy={-250} rx={68} ry={72} fill={C.wig} stroke={KRP.ink} strokeWidth={6} />
      {[-36, -8, 20, 44].map((cx, i) => <path key={i} d={`M ${cx} -300 q -10 30 0 60 q 10 24 -2 50`} stroke="#4A3E36" strokeWidth={5} fill="none" />)}
      {/* つば広の帽子 */}
      <g transform={`translate(${hatUp * 70} ${-hatUp * 140}) rotate(${-8 + hatUp * 28} 0 -300)`}>
        <ellipse cx={0} cy={-300} rx={124} ry={26} fill={C.hat} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -60 -302 Q -56 -370 0 -372 Q 56 -370 60 -302 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={-326} width={120} height={14} fill={C.coatDark} />
      </g>
    </g>
  );
};

const Hm106: React.FC<{ f: number }> = ({ f }) => {
  const pan = -f * 2.2;
  const flip = seg(f, 18, 30);
  return (
    <Frame f={f} seed={5106} bg={C.skyLight}>
      {/* 曇り空 */}
      <rect x={-40} y={-40} width={2000} height={620} fill={C.sky} />
      <rect x={-40} y={300} width={2000} height={280} fill={C.skyLight} opacity={0.6} />
      {[[200, 120, 1], [760, 90, 1.3], [1380, 150, 1.1], [1800, 80, 0.9]].map(([cx, cy, k], i) => (
        <g key={i} transform={`translate(${cx + pan * 0.2 + ((f * 0.6) % 40)} ${cy}) scale(${k})`}>
          {[[-60, 10, 50], [0, -10, 64], [70, 6, 48], [20, 26, 50]].map(([x0, y0, r], j) => <circle key={j} cx={x0} cy={y0} r={r} fill={C.cloudGray} />)}
          {[[-60, 0, 44], [0, -20, 56], [70, -4, 40]].map(([x0, y0, r], j) => <circle key={`h${j}`} cx={x0} cy={y0} r={r} fill={C.skyLight} opacity={0.6} />)}
        </g>
      ))}
      <g transform={`translate(${pan * 0.5} 0)`}>
        {/* 遠くの丘 */}
        <path d="M -200 520 Q 200 380 600 480 Q 1000 380 1400 470 Q 1800 390 2300 480 L 2300 700 L -200 700 Z" fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
        {/* 石造りの農家 (わら屋根) */}
        <g>
          <rect x={180} y={390} width={320} height={170} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={190 + (i % 6) * 52 + (Math.floor(i / 6) % 2) * 20} y={400 + Math.floor(i / 6) * 50} width={40} height={30} rx={8}
              fill="none" stroke={C.stoneDark} strokeWidth={4} />
          ))}
          <path d="M 150 400 Q 340 270 530 400 Z" fill={C.thatch} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M ${200 + k * 64} 392 q 10 -40 30 -76`} stroke={C.thatchDark} strokeWidth={4} fill="none" />)}
          <rect x={430} y={300} width={40} height={70} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
          <HmFSteam x={450} y={290} f={f} s={0.5} dx={80} gray n={4} />
          <rect x={300} y={470} width={56} height={90} fill={C.cabin} stroke={KRP.ink} strokeWidth={5} />
          <rect x={210} y={430} width={56} height={46} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
          <rect x={400} y={430} width={56} height={46} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 遠くの木 */}
        {[760, 1500, 2000].map((tx, i) => (
          <g key={i}>
            <rect x={tx - 12} y={420} width={24} height={110} fill={C.timber} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={tx} cy={400} r={70} fill={C.hedgeDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={tx - 20} cy={380} r={36} fill={C.hedge} />
          </g>
        ))}
      </g>
      <g transform={`translate(${pan} 0)`}>
        {/* 野原 */}
        <rect x={-200} y={560} width={2600} height={600} fill={C.grassDark} />
        {/* 奥の生け垣 */}
        <path d="M -200 600 Q -100 540 0 590 Q 100 530 200 590 Q 300 540 400 590 Q 500 530 600 590 Q 700 540 800 590 Q 900 530 1000 590 Q 1100 540 1200 590 Q 1300 530 1400 590 Q 1500 540 1600 590 Q 1700 530 1800 590 Q 1900 540 2000 590 Q 2100 530 2200 590 L 2200 640 L -200 640 Z"
          fill={C.hedge} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={-160 + i * 120} cy={604} r={6} fill={KRP.red} opacity={0.7} />)}
        {/* 道 */}
        <path d="M -200 900 Q 600 760 1300 760 Q 1900 760 2300 700 L 2300 820 Q 1900 860 1300 860 Q 600 880 -200 1120 Z" fill={C.road} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={100 + i * 160} cy={810 + (i % 3) * 14} rx={12} ry={6} fill={C.roadDark} />)}
        {/* 草むら */}
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M ${-150 + i * 110} 690 l 8 -26 M ${-140 + i * 110} 690 l -6 -20 M ${-130 + i * 110} 690 l 12 -18`} stroke={C.grass} strokeWidth={5} />
        ))}
      </g>
      {/* 馬とピープス (斜め後ろから) */}
      <HmFHorse x={1000} y={800} s={0.92} f={f} phase={0}
        rider={<HmFPepys f={f} flip={flip} />} />
      {/* ページがめくれた印 */}
      {flip > 0 && flip < 1 && (
        <path d="M 1190 330 q 20 -20 40 -10" stroke={KRP.ink} strokeWidth={5} fill="none" opacity={1 - flip} />
      )}
      {/* 羊 (見上げてもぐもぐ) */}
      <HmFSheep x={380} y={880} s={0.95} f={f} look={0.7} />
      <HmFSheep x={1650} y={870} s={0.8} f={f} phase={3} flip look={0.4} />
      {/* 年と場所 */}
      <TagPlate x={540} y={92} text="1665年" size={44} t={seg(f, 2, 12)} />
      <TagPlate x={830} y={92} text="イギリス" size={44} t={seg(f, 6, 16)} />
      <g transform={`translate(962 52) scale(${pop(seg(f, 10, 20))})`}>
        <line x1={0} y1={0} x2={0} y2={90} stroke={KRP.ink} strokeWidth={6} />
        <rect x={0} y={0} width={90} height={58} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={38} y={0} width={14} height={58} fill={KRP.red} />
        <rect x={0} y={22} width={90} height={14} fill={KRP.red} />
        <rect x={0} y={0} width={90} height={58} fill="none" stroke={KRP.ink} strokeWidth={5} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #107 危ないので、まねしないでください。
// 格: 山 / seed 5107
// 絵: どこ: #106 の田舎道 (続き)。演出: 馬が道の水たまりで**ちょっとつまずき**、乗っている男の帽子が浮き上がり、本が宙を舞う (男は落ちない・慌ててしがみつくだけ)。画面の隅に交通安全の「×」のマーク (赤い丸に斜線) と、読みながら乗るアイコン。羊が目を丸くする。動き: 馬がつまずく / 帽子と本が舞う / ×のマークがぽん
// どこ: #106 と同じ田舎道の続き (生け垣・農家・羊)。少し寄ったカメラ。道に水たまり
// 演出: 馬が水たまりで前のめりにつまずく。帽子が浮き上がり、本が宙を舞う。男は落ちずに首にしがみつく (顔は見せない)。羊が目を丸くする。右上に「読みながら乗らない」の標識がぽん
// 動き: f8-16 つまずき・水しぶき / 帽子と本が舞い上がって宙で止まる / 汗が飛ぶ / f26-34 標識がぽん / カメラが小さく揺れる
const Hm107: React.FC<{ f: number }> = ({ f }) => {
  const st = easeOut(seg(f, 8, 16));
  const hatUp = easeOut(seg(f, 10, 28));
  const clutch = seg(f, 10, 18);
  const fly = easeOut(seg(f, 10, 34));
  const bx = lerp(1050, 1330, fly), by = lerp(270, 160, fly) - Math.sin(fly * Math.PI) * 80 + Math.sin(f / 5) * 4 * fly;
  const shake = f > 9 && f < 20 ? Math.sin(f * 3.1) * 8 * (1 - seg(f, 9, 20)) : 0;
  const splash = seg(f, 10, 26);
  const wide = seg(f, 12, 20);
  const sign = seg(f, 26, 34);
  return (
    <Frame f={f} seed={5107} bg={C.skyLight}>
      <g transform={`translate(${shake} ${shake * 0.5}) translate(960 560) scale(1.08) translate(-960 -560)`}>
        <rect x={-60} y={-60} width={2040} height={640} fill={C.sky} />
        {[[300, 110], [1100, 80], [1700, 140]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx - 100 + ((f * 0.5) % 30)} ${cy})`}>
            {[[-60, 10, 50], [0, -10, 64], [70, 6, 48]].map(([x0, y0, r], j) => <circle key={j} cx={x0} cy={y0} r={r} fill={C.cloudGray} />)}
          </g>
        ))}
        <path d="M -200 520 Q 200 400 600 480 Q 1000 390 1400 470 Q 1800 400 2300 480 L 2300 700 L -200 700 Z" fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
        {/* 農家 (遠く・#106 と同じ家) */}
        <g transform="translate(-60 40) scale(0.8)">
          <rect x={180} y={390} width={320} height={170} fill={C.stone} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 150 400 Q 340 270 530 400 Z" fill={C.thatch} stroke={KRP.ink} strokeWidth={6} />
          <rect x={430} y={300} width={40} height={70} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={300} y={470} width={56} height={90} fill={C.cabin} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <rect x={-200} y={560} width={2400} height={620} fill={C.grassDark} />
        <path d="M -200 600 Q -100 540 0 590 Q 100 530 200 590 Q 300 540 400 590 Q 500 530 600 590 Q 700 540 800 590 Q 900 530 1000 590 Q 1100 540 1200 590 Q 1300 530 1400 590 Q 1500 540 1600 590 Q 1700 530 1800 590 Q 1900 540 2000 590 Q 2100 530 2200 590 L 2200 640 L -200 640 Z"
          fill={C.hedge} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -200 900 Q 600 760 1300 760 Q 1900 760 2300 700 L 2300 820 Q 1900 860 1300 860 Q 600 880 -200 1120 Z" fill={C.road} stroke={KRP.ink} strokeWidth={5} />
        {/* 水たまり */}
        <ellipse cx={1040} cy={816} rx={150} ry={26} fill={C.puddle} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 940 812 q 30 -8 60 0" stroke={KRP.white} strokeWidth={4} opacity={0.7} fill="none" />
        {splash > 0 && splash < 1 && Array.from({ length: 9 }, (_, i) => {
          const a = (-160 + i * 17.5) * Math.PI / 180;
          const r = 40 + splash * 150;
          return <circle key={i} cx={1040 + Math.cos(a) * r} cy={800 + Math.sin(a) * r * 0.9 + splash * splash * 140} r={10 * (1 - splash) + 4}
            fill={C.puddle} stroke={KRP.ink} strokeWidth={3} />;
        })}
        {/* 馬 (つまずく) と男 (しがみつく) */}
        <HmFHorse x={880} y={800} s={0.92} f={f} phase={0} walk={1 - st} stumble={st}
          rider={<HmFPepys f={f} hatUp={hatUp} bookFly={fly} clutch={clutch} />} />
        {/* 汗としぶきの線 */}
        {clutch > 0 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${760 + k * 40} ${250 - k * 16} q -10 -18 0 -30 q 10 12 0 30 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={3}
            transform={`translate(${-k * 10 * clutch} ${-20 * clutch})`} opacity={clutch} />
        ))}
        {st > 0.2 && [0, 1, 2].map((k) => (
          <line key={k} x1={1240 + k * 10} y1={420 + k * 50} x2={1300 + k * 10} y2={440 + k * 50} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        ))}
        {/* 宙を舞う本 */}
        {fly > 0 && (
          <g transform={`translate(${bx} ${by}) rotate(${fly * 300 + Math.sin(f / 3) * 8})`}>
            <path d={`M 0 0 L -66 ${-20 + Math.sin(f / 2) * 14} L -70 46 L 0 60 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M 0 0 L 66 ${-20 - Math.sin(f / 2) * 14} L 70 46 L 0 60 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <line x1={0} y1={0} x2={0} y2={60} stroke={C.coatDark} strokeWidth={8} />
            {[0, 1, 2].map((k) => <line key={k} x1={-56} y1={4 + k * 14} x2={-14} y2={12 + k * 14} stroke={KRP.gray} strokeWidth={4} />)}
            {[0, 1, 2].map((k) => <line key={`r${k}`} x1={14} y1={12 + k * 14} x2={56} y2={4 + k * 14} stroke={KRP.gray} strokeWidth={4} />)}
          </g>
        )}
        {fly > 0.2 && [0, 1].map((k) => (
          <path key={k} d={`M ${bx - 110 - k * 30} ${by + 40 + k * 26} q 30 -20 60 -10`} stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.6} />
        ))}
        {/* 羊 (目を丸くする) */}
        <HmFSheep x={330} y={880} s={1.0} f={f} look={0.6} wide={wide} />
        {wide > 0 && <path d="M 470 690 l 10 -30 M 500 700 l 26 -22 M 446 686 l -4 -32" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={wide} />}
        <HmFSheep x={1660} y={870} s={0.82} f={f} phase={3} flip look={0.3} wide={wide} />
      </g>
      {/* 標識: 読みながら乗らない (赤い丸に斜線) */}
      <g transform={`translate(1700 230) scale(${pop(sign)}) rotate(${(1 - sign) * -20})`}>
        <circle r={140} fill={KRP.ink} opacity={0.2} transform="translate(8 10)" />
        <circle r={140} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        {/* 馬に乗って本を読む人 (シルエット) */}
        <g fill={KRP.ink}>
          <ellipse cx={-6} cy={30} rx={70} ry={30} />
          <path d="M 44 20 L 78 -30 L 98 -14 L 66 34 Z" />
          {[-56, -26, 20, 44].map((lx) => <rect key={lx} x={lx - 6} y={40} width={12} height={46} rx={4} />)}
          <rect x={-24} y={-40} width={28} height={56} rx={10} />
          <circle cx={-10} cy={-58} r={18} />
          <path d="M 10 -52 L 44 -62 L 48 -30 L 14 -22 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        <circle r={124} fill="none" stroke={KRP.red} strokeWidth={26} />
        <line x1={-88} y1={-88} x2={88} y2={88} stroke={KRP.red} strokeWidth={26} strokeLinecap="round" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #108 1796年には、乗合馬車の中で、小説を読んで退屈をしのいだ人もいました。
// 格: 山 / seed 5108
// 絵: どこ: 1796年のイギリスの乗合馬車の車内 (向かい合わせの座席・小さな窓・揺れるランプ)。年代札「1796年」。演出: 窓際の客が**本で顔を隠すように**読んでいる (顔は本で隠れる)。向かいの客2人は退屈そうに外を見る・居眠り。窓の外を景色が流れる。本の表紙は無地。動き: 車内全体が揺れる / ランプが揺れる / 居眠りの頭がかくん
// どこ: 1796年のイギリスの乗合馬車の車内 (断面)。木の羽目板・まんなかの小さな窓・天井から下がるランプ・向かい合わせのビロードの座席
// 演出: 左の窓ぎわの客は、本を顔の前に立てて読みふける (顔は本で隠れる・表紙は無地)。向かいの2人は、ひとりが居眠り (鼻ちょうちん)、ひとりがほおづえで窓の外をぼんやり
// 動き: 車内ぜんたいがゆれる / ランプが振り子のようにゆれる / 窓の外の木が流れる / 居眠りの頭がかくん
const HmFCabin: React.FC<{ f: number; lampLevel?: number }> = ({ f, lampLevel = 1 }) => {
  const lampRot = Math.sin(f / 6) * 9;
  return (
    <g>
      <rect x={-60} y={-60} width={2040} height={1200} fill={C.cabin} />
      {/* 羽目板 */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={-30 + i * 230} y={150} width={200} height={460} rx={10} fill="none" stroke={C.cabinDark} strokeWidth={6} />
      ))}
      {/* 天井 */}
      <path d="M -60 -60 L 1980 -60 L 1980 140 Q 960 40 -60 140 Z" fill={C.cabinDark} stroke={KRP.ink} strokeWidth={6} />
      {[200, 600, 1320, 1720].map((rx) => <line key={rx} x1={rx} y1={-60} x2={rx} y2={90} stroke={C.timber} strokeWidth={10} />)}
      {/* まんなかの窓 (外の景色が流れる) */}
      <defs><clipPath id="hmfCabWin"><rect x={780} y={220} width={360} height={250} rx={18} /></clipPath></defs>
      <g clipPath="url(#hmfCabWin)">
        <rect x={780} y={220} width={360} height={250} fill={C.sky} />
        <path d="M 760 400 Q 900 340 1040 390 Q 1120 360 1180 380 L 1180 480 L 760 480 Z" fill={C.grass} />
        {Array.from({ length: 5 }, (_, i) => {
          const tx = 1260 - ((f * 14 + i * 150) % 640);
          return (
            <g key={i}>
              <rect x={tx - 8} y={360} width={16} height={80} fill={C.timber} />
              <circle cx={tx} cy={346} r={44} fill={C.hedgeDark} stroke={KRP.ink} strokeWidth={4} />
            </g>
          );
        })}
        <rect x={760} y={440} width={400} height={40} fill={C.hedge} />
      </g>
      <rect x={780} y={220} width={360} height={250} rx={18} fill="none" stroke={KRP.ink} strokeWidth={10} />
      <rect x={770} y={210} width={380} height={270} rx={22} fill="none" stroke={C.trim} strokeWidth={5} />
      {/* カーテン */}
      <path d="M 760 200 L 840 200 Q 820 300 860 380 Q 800 400 760 400 Z" fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
      <path d="M 1160 200 L 1080 200 Q 1100 300 1060 380 Q 1120 400 1160 400 Z" fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
      {/* 座席 (左右・向かい合わせ) */}
      {[[200, 700], [1220, 1720]].map(([x0, x1], i) => (
        <g key={i}>
          <rect x={x0} y={330} width={x1 - x0} height={320} rx={30} fill={C.velvet} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={x0 + 50 + (k % 4) * ((x1 - x0 - 100) / 3)} cy={400 + Math.floor(k / 4) * 120} r={7} fill={C.velvetDark} />)}
          <rect x={x0 - 20} y={630} width={x1 - x0 + 40} height={60} rx={20} fill={C.velvetDark} stroke={KRP.ink} strokeWidth={7} />
          <rect x={x0 - 20} y={690} width={x1 - x0 + 40} height={110} fill={C.cabinDark} stroke={KRP.ink} strokeWidth={6} />
        </g>
      ))}
      {/* 床 */}
      <rect x={-60} y={790} width={2040} height={360} fill={C.timber} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-60} y1={820 + i * 50} x2={1980} y2={820 + i * 50} stroke={C.cabinDark} strokeWidth={4} />)}
      {/* ランプ (天井から振り子) */}
      <g transform={`rotate(${lampRot} 960 70)`}>
        <line x1={960} y1={70} x2={960} y2={150} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={960} cy={196} r={110 * lampLevel} fill={HP.spark} opacity={0.2 * lampLevel} />
        <path d="M 930 150 L 990 150 L 980 160 L 940 160 Z" fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
        <rect x={934} y={160} width={52} height={66} rx={10} fill="#FFF0B0" stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={960} cy={196} rx={9 * Math.max(lampLevel, 0.15)} ry={16 * Math.max(lampLevel, 0.15)} fill={KRP.orange} />
        <rect x={928} y={224} width={64} height={14} rx={5} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

// 本で顔を隠して読む人 (x,y = 足元)。腕は肩から本のふちへ
const HmFHiddenReader: React.FC<{ x: number; y: number; s: number; f: number; jitter?: number; tag?: number }> = ({ x, y, s, f, jitter = 0, tag = 0 }) => {
  const bob = Math.sin(f / 13) * 3;
  const hx = x, hy = y + bob - 228 * s;
  const jx = Math.sin(f * 2.7) * jitter, jy = Math.cos(f * 3.3) * jitter;
  const bw = 210 * s, bh = 160 * s;
  return (
    <g>
      <HmFFolk x={x} y={y} s={s} f={f} pose="hold" cloth={C.awnA} clothDark={C.velvetDark} hat="tricorne" />
      <rect x={x - 50 * s} y={y + bob - 142 * s} width={100 * s} height={50 * s} rx={8} fill={C.awnA} />
      <line x1={x} y1={y + bob - 150 * s} x2={x} y2={y + bob - 60 * s} stroke={C.velvetDark} strokeWidth={4} opacity={0.5} />
      <g transform={`translate(${jx} ${jy})`}>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <line x1={x + sd * 60 * s} y1={y + bob - 150 * s} x2={hx + sd * (bw / 2 + 6)} y2={hy + 30 * s} stroke={KRP.ink} strokeWidth={30 * s} strokeLinecap="round" />
            <line x1={x + sd * 60 * s} y1={y + bob - 150 * s} x2={hx + sd * (bw / 2 + 6)} y2={hy + 30 * s} stroke={C.awnA} strokeWidth={21 * s} strokeLinecap="round" />
          </g>
        ))}
        {/* 本 (表紙は無地)。顔をすっかり隠す */}
        <rect x={hx - bw / 2} y={hy - bh / 2 + 6 * s} width={bw} height={bh} rx={8} fill={C.coachRedDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={hx - 10 * s} y={hy - bh / 2 + 6 * s} width={20 * s} height={bh} fill={C.coachRed} stroke={KRP.ink} strokeWidth={4} />
        <rect x={hx - bw / 2 + 16 * s} y={hy - bh / 2 + 24 * s} width={bw / 2 - 34 * s} height={bh - 40 * s} rx={4} fill="none" stroke={C.trim} strokeWidth={4} />
        <rect x={hx + 18 * s} y={hy - bh / 2 + 24 * s} width={bw / 2 - 34 * s} height={bh - 40 * s} rx={4} fill="none" stroke={C.trim} strokeWidth={4} />
        <path d={`M ${hx - bw / 2 + 4} ${hy + bh / 2 + 6 * s} L ${hx + bw / 2 - 4} ${hy + bh / 2 + 6 * s}`} stroke={KRP.white} strokeWidth={6} />
        {[-1, 1].map((sd) => <circle key={sd} cx={hx + sd * (bw / 2 + 4)} cy={hy + 20 * s} r={15 * s} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />)}
        {tag > 0 && (
          <g transform={`translate(${hx} ${hy + bh / 2}) rotate(${Math.sin(f / 5) * 8 * tag})`}>
            <line x1={0} y1={0} x2={0} y2={70 * tag} stroke={KRP.ink} strokeWidth={5} />
          </g>
        )}
      </g>
    </g>
  );
};

const Hm108: React.FC<{ f: number }> = ({ f }) => {
  const sway = Math.sin(f / 7) * 1.4;
  const cyc = (f % 40) / 40;
  const nod = cyc < 0.8 ? 18 * (cyc / 0.8) * (cyc / 0.8) : 18 * (1 - (cyc - 0.8) / 0.2);
  const bubble = cyc < 0.8 ? 6 + cyc * 26 : 4;
  return (
    <Frame f={f} seed={5108} bg={C.cabin}>
      <g transform={`rotate(${sway} 960 1100) translate(0 ${Math.abs(Math.sin(f / 4)) * -5})`}>
        <HmFCabin f={f} />
        {/* 左: 本で顔を隠して読む客 */}
        <HmFHiddenReader x={560} y={712} s={1.12} f={f} />
        {/* 右: 居眠りの客 (帽子の婦人) */}
        <HmFFolk x={1340} y={712} s={1.08} f={f} pose="sit" mod="sleep" cloth={C.dressRose} clothDark={C.coatDark} hat="bonnet" hatColor={KRP.cream}
          skirt={C.dressRose} lean={nod} phase={2} />
        <g transform={`rotate(${nod} 1340 712)`}>
          <circle cx={1372} cy={712 - 200 * 1.08} r={bubble} fill={HP.screenCore} stroke={KRP.ink} strokeWidth={3} opacity={0.85} />
        </g>
        {/* 右: ほおづえで窓の外をぼんやり */}
        {/* 腕は2本: ほおづえの左腕は下で描くので、元の左腕 (胴の外側) を clip で消す */}
        <defs>
          <clipPath id="hmf108arm">
            {([[-61, -600, 800, 900], [-400, -600, 800, 447], [-400, -54, 800, 400]] as const).map(([rx, ry, rw, rh], k) => (
              <rect key={k} x={rx} y={ry} width={rw} height={rh}
                transform={`translate(1610 ${712 + Math.sin((f + 5 * 17) / 13) * 3}) scale(1.08)`} />
            ))}
          </clipPath>
        </defs>
        <g clipPath="url(#hmf108arm)">
          <HmFFolk x={1610} y={712} s={1.08} f={f} pose="sit" face="normal" gaze={[-8, -3]} cloth={C.suitBrown} clothDark={C.suitBrownDark} hat="tricorne" phase={5} />
        </g>
        {/* ほおづえの左腕: 肩 → ひざに乗せたひじ → ほおに当てた手 */}
        {(() => {
          const b = Math.sin((f + 5 * 17) / 13) * 3;
          const sh: [number, number] = [1610 - 67 * 1.08, 712 + b - 146 * 1.08];
          const el: [number, number] = [1610 - 70 * 1.08, 712 + b - 74 * 1.08];
          const hd: [number, number] = [1610 - 26, 712 + b - 206];
          const d = `M ${sh[0]} ${sh[1]} L ${el[0]} ${el[1]} L ${hd[0]} ${hd[1] + 14}`;
          return (
            <g>
              <path d={d} stroke={KRP.ink} strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d={d} stroke={C.suitBrown} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx={hd[0]} cy={hd[1]} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
          );
        })()}
        {/* 床の荷物 */}
        <rect x={880} y={720} width={160} height={90} rx={10} fill={C.stall} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 920 720 q 40 -40 80 0" stroke={KRP.ink} strokeWidth={6} fill="none" />
        <rect x={880} y={752} width={160} height={12} fill={C.stallDark} />
      </g>
      <TagPlate x={540} y={92} text="1796年" size={44} t={seg(f, 2, 12)} />
      <TagPlate x={830} y={92} text="イギリス" size={44} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #109 ただ、馬車は揺れるし、暗いし、本は高い。
// 格: 山 / seed 5109
// 絵: どこ: #108 の馬車の車内 (続き)。演出: 3つの困りごとが順に起こる: ①ガタン!と大きく揺れて本の文字 (の模様) がぶれる ②ランプが消えかけて車内が暗くなる ③本の背表紙に、大きな値札 (硬貨のマークがいっぱい) がぶら下がる。客が困り顔 (face="worried")。動き: f0-12 大揺れ / 12-24 暗くなる / 24-36 値札がぽん
// どこ: #108 と同じ馬車の車内。カメラを読む客の肩ごしに回し、開いた本のページと、向かいの座席の2人を見る (読む客は後頭部だけ)
// 演出: 困りごとが順に起こる。①ガタン!と大揺れで本の文字がぶれて二重に ②ランプが消えかけて車内が暗くなる ③本の背から硬貨だらけの大きな値札がぶら下がる。向かいの2人が困り顔
// 動き: f0-12 大揺れ / f12-24 暗くなる / f24-36 値札がぽんと落ちてぶらぶら
const Hm109: React.FC<{ f: number }> = ({ f }) => {
  const jolt = 1 - seg(f, 0, 12);
  const jx = Math.sin(f * 2.9) * (22 * jolt + 3), jy = Math.cos(f * 3.7) * (16 * jolt + 2);
  const dark = easeOut(seg(f, 12, 24));
  const lamp = 1 - 0.8 * dark + (dark > 0.5 ? 0.06 * Math.sin(f * 1.7) : 0);
  const tagT = seg(f, 24, 36);
  const tagRot = Math.sin(f / 5) * 10 * (1 - seg(f, 30, 42) * 0.5);
  const ghost = 0.35 + 0.45 * jolt;
  const bx = 1110, byy = 520, bw = 480, bh = 300;
  const lines = (dx: number, dy: number, op: number, k: string) => (
    <g key={k} opacity={op} transform={`translate(${dx} ${dy})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1={bx - bw / 2 + 36} y1={byy - bh / 2 + 50 + i * 28} x2={bx - 30 - (i % 3) * 14} y2={byy - bh / 2 + 50 + i * 28} stroke={KRP.grayDark} strokeWidth={6} />
          <line x1={bx + 30} y1={byy - bh / 2 + 50 + i * 28} x2={bx + bw / 2 - 36 - (i % 2) * 20} y2={byy - bh / 2 + 50 + i * 28} stroke={KRP.grayDark} strokeWidth={6} />
        </g>
      ))}
    </g>
  );
  return (
    <Frame f={f} seed={5109} bg={C.cabin}>
      <g transform={`translate(${jx} ${jy}) rotate(${jx * 0.08} 960 540)`}>
        {/* 向かいの壁と座席 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.cabin} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-30 + i * 230} y={120} width={200} height={200} rx={10} fill="none" stroke={C.cabinDark} strokeWidth={6} />)}
        <path d="M -60 -60 L 1980 -60 L 1980 90 Q 960 20 -60 90 Z" fill={C.cabinDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={140} y={300} width={1640} height={360} rx={34} fill={C.velvet} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, k) => <circle key={k} cx={220 + (k % 6) * 296} cy={380 + Math.floor(k / 6) * 140} r={8} fill={C.velvetDark} />)}
        <rect x={110} y={640} width={1700} height={70} rx={22} fill={C.velvetDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={110} y={710} width={1700} height={420} fill={C.cabinDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 向かいの2人 (困り顔) */}
        <HmFFolk x={330} y={720} s={1.0} f={f} pose="sit" face="worried" cloth={C.suitBrown} clothDark={C.suitBrownDark} hat="tricorne" phase={5} gaze={[6, 0]} />
        <HmFFolk x={1560} y={720} s={1.0} f={f} pose="sit" face="worried" cloth={C.dressRose} clothDark={C.coatDark} hat="bonnet" hatColor={KRP.cream} skirt={C.dressRose} phase={2} gaze={[-6, 0]} />
        {/* ランプ */}
        <g transform={`rotate(${Math.sin(f / 4) * 14 * (0.4 + jolt)} 960 -20)`}>
          <line x1={960} y1={-20} x2={960} y2={90} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 926 90 L 994 90 L 982 102 L 938 102 Z" fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={930} y={102} width={60} height={76} rx={10} fill={dark > 0.5 ? "#C9B98A" : "#FFF0B0"} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={960} cy={142} rx={10 * lamp} ry={18 * lamp} fill={KRP.orange} />
          <rect x={924} y={176} width={72} height={14} rx={5} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 開いた本 (肩ごしに見えるページ) */}
        <g transform={`rotate(-4 ${bx} ${byy})`}>
          <path d={`M ${bx - bw / 2 - 14} ${byy - bh / 2 + 10} L ${bx} ${byy - bh / 2 + 24} L ${bx + bw / 2 + 14} ${byy - bh / 2 + 10} L ${bx + bw / 2 + 14} ${byy + bh / 2 + 14} L ${bx} ${byy + bh / 2 + 26} L ${bx - bw / 2 - 14} ${byy + bh / 2 + 14} Z`}
            fill={C.coachRedDark} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${bx - bw / 2} ${byy - bh / 2} Q ${bx - bw / 4} ${byy - bh / 2 - 16} ${bx} ${byy - bh / 2 + 14} Q ${bx + bw / 4} ${byy - bh / 2 - 16} ${bx + bw / 2} ${byy - bh / 2} L ${bx + bw / 2} ${byy + bh / 2} Q ${bx + bw / 4} ${byy + bh / 2 - 14} ${bx} ${byy + bh / 2 + 14} Q ${bx - bw / 4} ${byy + bh / 2 - 14} ${bx - bw / 2} ${byy + bh / 2} Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <line x1={bx} y1={byy - bh / 2 + 14} x2={bx} y2={byy + bh / 2 + 14} stroke={KRP.gray} strokeWidth={4} />
          {/* ① 文字がぶれる (二重) */}
          {lines(12 + jx * 0.6, -8 + jy * 0.5, ghost, "g")}
          {lines(0, 0, 1, "m")}
          {/* 読む客の手 */}
          <circle cx={bx - bw / 2 + 10} cy={byy + bh / 2 - 6} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={bx + bw / 2 - 10} cy={byy + bh / 2 - 6} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {jolt > 0.05 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${bx + bw / 2 + 40 + k * 18} ${byy - 120 + k * 80} l 40 -10`} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" opacity={jolt} />
        ))}
        {/* 手前: 読む客の後頭部と肩 (顔は見えない) */}
        <path d="M 180 1140 Q 200 820 420 770 L 900 760 Q 1080 800 1120 1140 Z" fill={C.awnA} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 880 770 Q 1000 700 1110 680" stroke={KRP.ink} strokeWidth={46} strokeLinecap="round" />
        <path d="M 880 770 Q 1000 700 1110 680" stroke={C.awnA} strokeWidth={34} strokeLinecap="round" />
        <circle cx={660} cy={620} r={140} fill={C.wig} stroke={KRP.ink} strokeWidth={8} />
        {[-60, -10, 40, 80].map((dx, i) => <path key={i} d={`M ${640 + dx} 540 q 14 50 4 110`} stroke="#4A3E36" strokeWidth={6} fill="none" />)}
        <path d="M 640 740 q 20 30 0 60" stroke={KRP.ink} strokeWidth={14} strokeLinecap="round" fill="none" />
        <path d="M 620 752 l 40 -14 l -6 36 Z" fill={KRP.ink} />
        {/* 三角帽 (後ろから) */}
        <path d="M 470 540 Q 660 470 850 540 Q 820 440 660 420 Q 500 440 470 540 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 480 538 Q 660 500 842 538" stroke={C.trim} strokeWidth={6} fill="none" />
      </g>
      {/* ② 暗くなる */}
      <rect x={0} y={0} width={1920} height={1080} fill="#1E1812" opacity={0.55 * dark} />
      <circle cx={960 + jx} cy={142 + jy} r={60 + 60 * lamp} fill={HP.spark} opacity={0.12 * lamp + 0.06} />
      {/* ③ 値札 (硬貨だらけ)。本の背からぶら下がる */}
      {tagT > 0 && (
        <g transform={`translate(${bx + jx} ${byy + bh / 2 + 18 + jy}) rotate(${tagRot}) scale(${pop(tagT)})`}>
          <line x1={0} y1={0} x2={0} y2={34} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -150 34 L 150 34 L 150 140 L -150 140 L -176 87 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={-148} cy={87} r={8} fill={KRP.ink} />
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i} transform={`translate(${-100 + (i % 5) * 58} ${62 + Math.floor(i / 5) * 50})`}>
              <circle r={21} fill={KRP.gold} stroke={KRP.ink} strokeWidth={4} />
              <circle r={13} fill="none" stroke={HP.brassDark} strokeWidth={3} />
            </g>
          ))}
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #110 乗り物の暇は、一部の人の、たまのお楽しみでした。
// 格: 並 / seed 5110
// 絵: どこ: 18世紀の町の宿場 (馬車の乗り場・宿屋の看板 (絵だけ))。演出: 立派な馬車に乗りこむ身なりのよい少数の客と、その横を歩いて通り過ぎていく大勢の人々 (荷物を背負う・徒歩)。乗りこむ客の手に本。札「たまに」「一部の人」。動き: 馬車が出発 / 歩く人々の列 / 犬が吠える
// どこ: 18世紀の町の宿場。木組みの宿屋 (鐘の絵の吊り看板・字はなし)・石畳・遠くの家並み
// 演出: 立派な馬車に、身なりのよい2人だけが本を手に乗りこむ (窓の中にも1人)。その手前の道を、荷物を背負った大勢が歩いて通り過ぎる。宿屋の壁の運行表は7つのますのうち1つだけに馬車の絵 (=たまに)。犬が馬車に吠える
// 動き: 御者がむちを振って馬車が動き出す (車輪が回る) / 歩く人の列が左へ / 犬が吠える
const HmFDog: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const bark = ((f % 14) < 6) ? 1 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={70} ry={10} fill={KRP.ink} opacity={0.18} />
      {[-40, -20, 24, 44].map((lx) => <rect key={lx} x={lx - 8} y={-50} width={16} height={50} rx={6} fill={C.dogDark} stroke={KRP.ink} strokeWidth={4} />)}
      <path d={`M -56 -70 q -30 ${-30 + Math.sin(f) * 10} -10 -60`} stroke={C.dog} strokeWidth={14} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-66} rx={62} ry={30} fill={C.dog} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`rotate(${bark ? -12 : 0} 60 -90)`}>
        <ellipse cx={70} cy={-100} rx={34} ry={28} fill={C.dog} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 52 -122 l -16 -26 l 30 12 Z" fill={C.dogDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={80} cy={-108} r={5} fill={KRP.ink} />
        <ellipse cx={104} cy={-100} rx={8} ry={6} fill={KRP.ink} />
        <path d={`M 86 -84 L 106 -84 L ${100} ${-84 + bark * 16} Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {bark > 0 && [0, 1, 2].map((k) => (
        <path key={k} d={`M ${130 + k * 18} ${-130 + k * 6} q 14 22 0 44`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

const Hm110: React.FC<{ f: number }> = ({ f }) => {
  const go = easeOut(seg(f, 24, 42));
  const whip = Math.sin(f / 4) * 20;
  const walk = f * 1.3;
  return (
    <Frame f={f} seed={5110} bg={C.skyLight}>
      <rect x={-40} y={-40} width={2000} height={700} fill={C.skyLight} />
      {/* 遠くの家並み */}
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={820 + i * 150} y={360 - (i % 3) * 40} width={140} height={300} fill={i % 2 ? C.plaster : C.stone} stroke={KRP.ink} strokeWidth={5} />
            <path d={`M ${810 + i * 150} ${362 - (i % 3) * 40} L ${890 + i * 150} ${290 - (i % 3) * 40} L ${970 + i * 150} ${362 - (i % 3) * 40} Z`} fill={C.cabinDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={850 + i * 150} y={400 - (i % 3) * 40} width={36} height={40} fill={C.glass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
      </g>
      {/* 宿屋 (木組み) */}
      <g>
        <rect x={-40} y={170} width={800} height={500} fill={C.plaster} stroke={KRP.ink} strokeWidth={7} />
        <path d="M -60 180 L 360 40 L 780 180 Z" fill={C.cabinDark} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-40 + i * 160} y1={170} x2={-40 + i * 160} y2={670} stroke={C.timber} strokeWidth={16} />)}
        <line x1={-40} y1={420} x2={760} y2={420} stroke={C.timber} strokeWidth={16} />
        {[[40, 230], [520, 230], [200, 470], [600, 470]].map(([wx, wy], i) => (
          <g key={i}>
            <rect x={wx} y={wy} width={100} height={110} fill={C.glass} stroke={KRP.ink} strokeWidth={6} />
            <line x1={wx + 50} y1={wy} x2={wx + 50} y2={wy + 110} stroke={KRP.ink} strokeWidth={4} />
            <line x1={wx} y1={wy + 55} x2={wx + 100} y2={wy + 55} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        <path d="M 360 670 L 360 520 Q 420 470 480 520 L 480 670 Z" fill={C.cabin} stroke={KRP.ink} strokeWidth={6} />
        {/* 運行表: 7つのますのうち1つだけ馬車 */}
        <rect x={190} y={280} width={300} height={110} rx={6} fill={C.cabin} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={202 + i * 40} y={300} width={34} height={70} rx={4} fill={i === 4 ? KRP.yellow : KRP.cream} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <g transform="translate(359 340) scale(0.12)">
          <rect x={-150} y={-120} width={300} height={170} rx={20} fill={C.coachRed} stroke={KRP.ink} strokeWidth={24} />
          <circle cx={-90} cy={80} r={60} fill={KRP.ink} /><circle cx={90} cy={80} r={60} fill={KRP.ink} />
        </g>
        {/* 吊り看板 (鐘の絵) */}
        <line x1={760} y1={250} x2={860} y2={250} stroke={KRP.ink} strokeWidth={10} />
        <g transform={`rotate(${Math.sin(f / 9) * 4} 820 250)`}>
          <line x1={786} y1={250} x2={786} y2={280} stroke={KRP.ink} strokeWidth={4} />
          <line x1={854} y1={250} x2={854} y2={280} stroke={KRP.ink} strokeWidth={4} />
          <rect x={770} y={280} width={100} height={110} rx={8} fill={C.awnA} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 820 296 Q 796 300 794 340 L 786 360 L 854 360 L 846 340 Q 844 300 820 296 Z" fill={C.trim} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={820} cy={368} r={7} fill={C.trim} stroke={KRP.ink} strokeWidth={3} />
        </g>
      </g>
      {/* 石畳 */}
      <rect x={-40} y={660} width={2000} height={500} fill={C.cobble} />
      {Array.from({ length: 60 }, (_, i) => (
        <ellipse key={i} cx={(i % 15) * 136 + (Math.floor(i / 15) % 2) * 68} cy={690 + Math.floor(i / 15) * 60} rx={56} ry={18}
          fill="none" stroke={C.cobbleDark} strokeWidth={4} />
      ))}
      {/* 馬車と2頭の馬 (出発) */}
      <g transform={`translate(${go * 60} 0)`}>
        <HmFHorse x={1570} y={740} s={0.66} f={f} phase={3} walk={0.2 + go * 0.8} color={C.horseDark} dark={C.mane} />
        <HmFCoachSide x={1060} y={770} s={1.0} roll={go * 120}
          win={<g>
            <circle cx={-122} cy={-262} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -152 -270 Q -122 -306 -92 -270 Z" fill={C.hat} />
            <circle cx={-132} cy={-262} r={4} fill={KRP.ink} /><circle cx={-112} cy={-262} r={4} fill={KRP.ink} />
            <rect x={-156} y={-248} width={60} height={14} rx={3} fill={C.awnA} stroke={KRP.ink} strokeWidth={3} />
          </g>} />
        <HmFHorse x={1530} y={770} s={0.7} f={f} phase={0} walk={0.2 + go * 0.8} />
        {/* 御者とむち */}
        <HmFFolk x={1270} y={500} s={0.55} f={f} pose="raise" face="smile" cloth={C.coatDark} clothDark={KRP.ink} hat="tricorne" phase={4} />
        <path d={`M 1307 330 Q ${1380 + whip} ${250 - whip} ${1460 + whip * 1.5} 300`} stroke={KRP.ink} strokeWidth={5} fill="none" />
        {/* 乗りこむ2人 (本を手に) */}
        <HmFFolk x={1060} y={790} s={0.82} f={f} pose="hold" face="smile" cloth={C.coachRed} clothDark={C.coatDark} hat="tricorne" phase={1} gaze={[0, 4]} />
        <rect x={1032} y={668} width={56} height={40} rx={4} fill={C.velvetDark} stroke={KRP.ink} strokeWidth={4} />
        <HmFFolk x={900} y={800} s={0.82} f={f} pose="hold" face="smile" cloth={C.dressBlue} clothDark={KRP.blueDeep} hat="bonnet" hatColor={KRP.white} skirt={C.dressBlue} phase={2} gaze={[4, 0]} />
        <rect x={872} y={676} width={56} height={40} rx={4} fill={C.coachRedDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 歩いて通り過ぎる大勢 (荷物を背負う) */}
      {Array.from({ length: 7 }, (_, i) => {
        const px = 120 + i * 105 - walk;
        const py = 742 + (i % 2) * 14;
        return (
          <g key={i}>
            <ellipse cx={px - 34} cy={py - 120} rx={34} ry={40} fill={[C.peasant, C.stall, C.thatch][i % 3]} stroke={KRP.ink} strokeWidth={4} />
            <HmFFolk x={px} y={py} s={0.55} f={f} pose="stand" face={i % 3 === 1 ? "worried" : "normal"} cloth={[C.peasant, C.suitGray, C.dressGreen][i % 3]}
              clothDark={C.peasantDark} hat={i % 2 ? "flat" : "none"} hatColor={C.peasantDark} skirt={i % 3 === 2 ? C.dressGreen : undefined} phase={i} gaze={[-6, 0]} />
            <line x1={px - 50} y1={py - 30} x2={px - 70} y2={py - 160} stroke={C.timber} strokeWidth={6} />
          </g>
        );
      })}
      <HmFDog x={700} y={832} s={0.95} f={f} />
      {/* 札 (同じ高さ) */}
      <TagPlate x={340} y={200} text="たまに" size={44} t={seg(f, 8, 18)} />
      <TagPlate x={980} y={200} text="一部の人" size={44} t={seg(f, 14, 24)} />
      <Arrow x={980} y={470} s={0.8} rot={90} t={seg(f, 18, 26)} />
      <Arrow x={340} y={286} s={0.5} rot={90} t={seg(f, 12, 20)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #111 そこに、鉄道がやってきます。
// 格: 山 / seed 5111
// 絵: どこ: 19世紀のイギリスの田園の線路 (丘・鉄橋・牛)。演出: 遠くの丘の向こうから、蒸気機関車が煙を上げて**ぐんぐん近づいてくる** (カメラに向かって大きくなる)。牛がびっくり。汽笛の音の波線。動き: 機関車が手前へ (拡大) / 煙 / 牛が跳ねる
// どこ: 19世紀のイギリスの田園。なだらかな丘・小川にかかる鉄橋・遠くまで続く線路 (遠近法)・牛の群れ
// 演出: 丘の向こうから蒸気機関車が煙を噴き上げ、鉄橋を渡って、カメラに向かってぐんぐん大きくなる。汽笛の波線。手前の牛が跳び上がってびっくり
// 動き: f0-40 機関車が手前へ (拡大・加速) / 煙が後ろへたなびく / 牛が跳ねる / 汽笛の波線
const HmFLocoFront: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 車輪 (下の端だけ見える) */}
    {[-150, 150].map((wx) => <rect key={wx} x={wx - 26} y={-120} width={52} height={120} rx={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />)}
    {/* 台枠 */}
    <rect x={-200} y={-170} width={400} height={60} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={7} />
    {/* 緩衝器の板 (赤) と緩衝器 */}
    <rect x={-230} y={-200} width={460} height={60} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={7} />
    {[-170, 170].map((bx) => (
      <g key={bx}>
        <rect x={bx - 16} y={-186} width={32} height={30} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={bx} cy={-172} r={28} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
      </g>
    ))}
    {/* ボイラーの前 */}
    <circle cx={0} cy={-340} r={150} fill={C.loco} stroke={KRP.ink} strokeWidth={8} />
    <circle cx={0} cy={-340} r={150} fill="none" stroke={C.trim} strokeWidth={6} opacity={0.8} />
    <circle cx={0} cy={-340} r={118} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={7} />
    <circle cx={0} cy={-340} r={20} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
      <circle key={k} cx={Math.cos((k * Math.PI) / 4) * 104} cy={-340 + Math.sin((k * Math.PI) / 4) * 104} r={6} fill={KRP.silver} />
    ))}
    <path d="M -80 -420 Q -20 -460 60 -440" stroke={KRP.white} strokeWidth={8} opacity={0.3} fill="none" />
    {/* 煙突 */}
    <rect x={-36} y={-560} width={72} height={80} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-54} y={-590} width={108} height={36} rx={8} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={7} />
    {/* 前照灯 */}
    <circle cx={0} cy={-232} r={30 + Math.sin(f / 2) * 2} fill={HP.spark} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={0} cy={-232} r={70} fill={HP.spark} opacity={0.25} />
    {/* 運転室の屋根 (奥) */}
    {[-1, 1].map((sd) => <rect key={sd} x={sd > 0 ? 150 : -210} y={-500} width={60} height={240} rx={8} fill={C.loco} stroke={KRP.ink} strokeWidth={6} />)}
  </g>
);

const Hm111: React.FC<{ f: number }> = ({ f }) => {
  const p = Math.pow(seg(f, 0, 40), 1.5);
  const gy = lerp(452, 770, p);
  const gap = 40 + (gy - 430) * 1.48;
  const ls = gap / 540;
  const jump = easeOut(seg(f, 22, 30)) * (1 + Math.sin(f / 3) * 0.04);
  const scared = seg(f, 20, 26);
  const whistle = seg(f, 6, 42);
  return (
    <Frame f={f} seed={5111} bg={C.skyLight}>
      <rect x={-40} y={-40} width={2000} height={520} fill={C.sky} />
      <rect x={-40} y={250} width={2000} height={230} fill={C.skyLight} opacity={0.7} />
      {/* 丘 */}
      <path d="M -40 470 Q 300 330 700 420 Q 1000 360 1300 420 Q 1600 340 1960 430 L 1960 600 L -40 600 Z" fill={C.grass} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -40 520 Q 400 440 900 500 Q 1400 450 1960 520 L 1960 1120 L -40 1120 Z" fill={C.grassDark} />
      {/* 生け垣の区画 */}
      {[[-40, 560, 700, 520], [1300, 520, 1960, 580], [200, 640, 820, 600]].map(([x0, y0, x1, y1], i) => (
        <path key={i} d={`M ${x0} ${y0} Q ${(x0 + x1) / 2} ${Math.min(y0, y1) - 30} ${x1} ${y1}`} stroke={C.hedgeDark} strokeWidth={20} fill="none" strokeLinecap="round" />
      ))}
      {/* 小川と鉄橋 */}
      <path d="M -40 610 Q 500 560 1000 520 Q 1500 500 1960 540 L 1960 580 Q 1500 545 1000 560 Q 500 600 -40 660 Z" fill={C.water} stroke={KRP.ink} strokeWidth={4} />
      <g>
        <rect x={980} y={500} width={140} height={16} fill={C.iron} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 980 500 L 1000 470 L 1100 470 L 1120 500 M 1000 470 L 1030 500 L 1050 470 L 1070 500 L 1100 470" stroke={C.ironDark} strokeWidth={5} fill="none" />
        <rect x={990} y={516} width={14} height={40} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1096} y={516} width={14} height={40} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 線路 (遠近) */}
      <path d="M 1030 430 L 1070 430 L 1560 1120 L 540 1120 Z" fill={C.roadDark} opacity={0.75} />
      {Array.from({ length: 14 }, (_, i) => {
        const yy = 430 + Math.pow(i / 13, 2) * 690;
        const g = 40 + (yy - 430) * 1.48;
        return <rect key={i} x={1050 - g * 0.62} y={yy} width={g * 1.24} height={4 + (yy - 430) * 0.04} fill={C.cabinDark} />;
      })}
      <line x1={1030} y1={430} x2={680} y2={1120} stroke={KRP.silver} strokeWidth={10} />
      <line x1={1070} y1={430} x2={1420} y2={1120} stroke={KRP.silver} strokeWidth={10} />
      <line x1={1030} y1={430} x2={680} y2={1120} stroke={KRP.ink} strokeWidth={3} />
      <line x1={1070} y1={430} x2={1420} y2={1120} stroke={KRP.ink} strokeWidth={3} />
      {/* 煙 (後ろへたなびく) */}
      {Array.from({ length: 10 }, (_, i) => {
        const age = ((f * 0.03 + i / 10) % 1);
        const cx = 1050 + age * 700 + Math.sin(i * 2) * 40;
        const cy = gy - 590 * ls - age * 220 * (0.4 + ls);
        const r = (40 + age * 160) * (0.4 + ls * 0.6);
        return <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? KRP.white : KRP.gray} stroke={KRP.ink} strokeWidth={3} strokeOpacity={0.3} opacity={(1 - age) * 0.85} />;
      })}
      {/* 機関車 (手前へ) */}
      <g transform={`translate(${1050} ${gy}) scale(${ls})`}>
        <HmFLocoFront f={f} />
      </g>
      {/* 汽笛の波線 */}
      {whistle > 0 && [0, 1, 2].map((k) => {
        const r = (60 + k * 50 + ((f * 4) % 50)) * (0.5 + ls);
        return <path key={k} d={`M ${1050 + r * 0.7} ${gy - 600 * ls - r * 0.7} A ${r} ${r} 0 0 1 ${1050 + r} ${gy - 600 * ls}`}
          stroke={KRP.ink} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />;
      })}
      {/* 牛 (びっくりして跳ねる) */}
      {[[200, 820, 1.0, 1], [560, 760, 0.78, 0], [1680, 780, 0.9, 2]].map(([cx, cy, cs, k]) => {
        const j = k === 1 ? jump : jump * 0.5;
        const flip = cx > 960;
        return (
          <g key={k} transform={`translate(${cx} ${cy - j * 120}) rotate(${(flip ? 1 : -1) * j * 12}) scale(${flip ? -cs : cs} ${cs})`}>
            <ellipse cx={0} cy={j * 120 + 4} rx={120} ry={14} fill={KRP.ink} opacity={0.15} />
            {[-70, -40, 40, 70].map((lx) => <rect key={lx} x={lx - 10} y={-80} width={20} height={80} rx={6} fill={C.cow} stroke={KRP.ink} strokeWidth={5} />)}
            <ellipse cx={0} cy={-120} rx={120} ry={66} fill={C.cow} stroke={KRP.ink} strokeWidth={6} />
            <path d="M -60 -170 q 30 20 10 60 q -30 6 -40 -30 Z M 30 -110 q 40 -10 50 30 q -30 20 -60 0 Z" fill={C.cowSpot} />
            <path d="M -118 -130 q -40 30 -30 80" stroke={KRP.ink} strokeWidth={5} fill="none" />
            <g transform="translate(130 -150)">
              <ellipse cx={0} cy={0} rx={50} ry={44} fill={C.cow} stroke={KRP.ink} strokeWidth={6} />
              <ellipse cx={22} cy={22} rx={30} ry={20} fill="#F2B8B0" stroke={KRP.ink} strokeWidth={4} />
              <path d="M -30 -36 l -14 -20 M 26 -40 l 14 -20" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
              <circle cx={-8} cy={-10} r={8 + scared * 6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={-8} cy={-10} r={4} fill={KRP.ink} />
              <circle cx={18} cy={-12} r={8 + scared * 6} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={18} cy={-12} r={4} fill={KRP.ink} />
            </g>
          </g>
        );
      })}
      {jump > 0.2 && [0, 1, 2].map((k) => (
        <line key={k} x1={340 + k * 40} y1={520 - k * 10} x2={350 + k * 50} y2={480 - k * 14} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #112 鉄道は、乗っている時間を、毎日、決まった時刻に、何万人もの人にくばりました。
// 格: 山 / seed 5112
// 絵: どこ: 19世紀の大きな駅の朝 (ホーム・大時計・群衆)。演出: 大時計が8時を指すと、汽車が着き、ドアから降りる大勢の通勤客。それぞれの手に、さっきの「暇」の橙の雲が**1人1つずつ**ふわっと渡されている (配られた感じ)。時刻表の数字がぱたぱた。動き: 大時計の針 / 群衆の流れ / 雲がぽんぽん配られる
// どこ: 19世紀の大きな駅の朝。ガラスと鉄骨の屋根・吊り下がった大時計・左に着いたばかりの客車・右の壁にぱたぱた式の時刻表
// 演出: 大時計の針が8時を指すと、客車のドアが開いて通勤客がどっと降りる。開いたドアから「暇」の雲がひとつずつ飛び出し、1人に1つずつ胸に収まる (配給のように)
// 動き: 長針が12へ (f0-14) / 時刻表の札がぱたぱためくれる / 群衆が右へ流れる / 雲がぽんぽん順に配られる / 蒸気
const Hm112: React.FC<{ f: number }> = ({ f }) => {
  const mt = easeOut(seg(f, 0, 14));
  const minAng = lerp(-60, 0, mt) + (mt >= 1 ? Math.sin(seg(f, 14, 20) * Math.PI) * 4 : 0);
  const flap = seg(f, 6, 16);
  const doors = [170, 470, 770];
  const folk: { x0: number; y: number; s: number; d: number; hat: Hat; cloth: string; dark: string; skirt?: string }[] = [
    { x0: 980, y: 722, s: 0.6, d: 2, hat: "bowler", cloth: C.suitGray, dark: C.suitGrayDark },
    { x0: 1160, y: 716, s: 0.6, d: 1, hat: "bonnet", cloth: C.dressBlue, dark: KRP.blueDeep, skirt: C.dressBlue },
    { x0: 1340, y: 724, s: 0.6, d: 2, hat: "top", cloth: C.suitBrown, dark: C.suitBrownDark },
    { x0: 1520, y: 718, s: 0.6, d: 0, hat: "bowler", cloth: C.coatDark, dark: KRP.ink },
    { x0: 1700, y: 722, s: 0.6, d: 1, hat: "flat", cloth: C.peasant, dark: C.peasantDark },
    { x0: 900, y: 840, s: 0.78, d: 2, hat: "top", cloth: C.suitGrayDark, dark: KRP.ink },
    { x0: 1130, y: 846, s: 0.78, d: 1, hat: "bonnet", cloth: C.dressRose, dark: C.coatDark, skirt: C.dressRose },
    { x0: 1380, y: 842, s: 0.78, d: 0, hat: "bowler", cloth: C.suitBrown, dark: C.suitBrownDark },
    { x0: 1640, y: 846, s: 0.78, d: 2, hat: "bowler", cloth: C.awnA, dark: C.velvetDark },
    { x0: 560, y: 690, s: 0.56, d: 1, hat: "top", cloth: C.suitGray, dark: C.suitGrayDark },
    { x0: 260, y: 690, s: 0.56, d: 0, hat: "bonnet", cloth: C.dressGreen, dark: C.velvetDark, skirt: C.dressGreen },
  ];
  return (
    <Frame f={f} seed={5112} bg={C.glass}>
      {/* 屋根 */}
      <rect x={-40} y={-40} width={2000} height={420} fill={C.glass} />
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-40 + i * 104} y1={-40} x2={-40 + i * 104} y2={300} stroke={C.glassShade} strokeWidth={5} />)}
      {[0, 1].map((k) => (
        <path key={k} d={`M ${-200 + k * 1100} 360 Q ${350 + k * 1100} -120 ${900 + k * 1100} 360`} stroke={C.ironDark} strokeWidth={22} fill="none" />
      ))}
      <rect x={-40} y={290} width={2000} height={26} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
      {/* 奥の壁 */}
      <rect x={900} y={316} width={1100} height={340} fill={C.brick} />
      {Array.from({ length: 8 }, (_, r) => <line key={r} x1={900} y1={340 + r * 40} x2={1960} y2={340 + r * 40} stroke={C.mortar} strokeWidth={4} opacity={0.6} />)}
      {/* ぱたぱた式の時刻表 */}
      <g transform="translate(1560 420)">
        <rect x={-210} y={-80} width={420} height={160} rx={10} fill={C.ironDark} stroke={KRP.ink} strokeWidth={7} />
        {["8", ":", "0", "0"].map((d, i) => {
          const cx = -150 + i * 100;
          const isColon = d === ":";
          const fl = isColon ? 1 : clamp01(flap * 1.6 - i * 0.2);
          return isColon ? (
            <text key={i} x={cx} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill={KRP.white}>:</text>
          ) : (
            <g key={i}>
              <rect x={cx - 40} y={-60} width={80} height={120} rx={8} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={4} />
              <text x={cx} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={KRP.white}>{fl >= 1 ? d : String((Math.floor(f / 2) + i) % 10)}</text>
              <line x1={cx - 40} y1={0} x2={cx + 40} y2={0} stroke={KRP.ink} strokeWidth={4} />
              {fl > 0 && fl < 1 && <rect x={cx - 40} y={-60} width={80} height={60 * (1 - fl)} fill={C.iron} stroke={KRP.ink} strokeWidth={3} />}
            </g>
          );
        })}
      </g>
      {/* 大時計 (吊り下げ) */}
      <line x1={930} y1={-40} x2={930} y2={80} stroke={KRP.ink} strokeWidth={8} />
      <line x1={990} y1={-40} x2={990} y2={80} stroke={KRP.ink} strokeWidth={8} />
      <g transform="translate(960 190)">
        <circle r={124} fill={C.ironDark} stroke={KRP.ink} strokeWidth={8} />
        <circle r={104} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={Math.sin(a) * 84} y1={-Math.cos(a) * 84} x2={Math.sin(a) * 98} y2={-Math.cos(a) * 98} stroke={KRP.ink} strokeWidth={i % 3 ? 4 : 8} />;
        })}
        <line x1={0} y1={0} x2={0} y2={-52} stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" transform={`rotate(${240 + minAng / 12})`} />
        <line x1={0} y1={0} x2={0} y2={-84} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${minAng})`} />
        <circle r={10} fill={HP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {mt >= 1 && seg(f, 14, 26) < 1 && [0, 1, 2].map((k) => (
        <path key={k} d={`M ${960 + 140 + k * 26} ${150 + k * 30} q 16 10 0 26`} stroke={KRP.ink} strokeWidth={6} fill="none" opacity={1 - seg(f, 14, 26)} />
      ))}
      {/* 客車 (左・着いたところ) */}
      <HmFSteam x={60} y={330} f={f} s={1} dx={140} />
      <rect x={-40} y={330} width={940} height={300} rx={20} fill={C.teak} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-40} y={310} width={940} height={32} rx={14} fill={C.teakDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-40} y={560} width={940} height={18} fill={C.trim} />
      {doors.map((dx, i) => (
        <g key={i}>
          <rect x={dx - 60} y={350} width={120} height={270} fill={C.ironDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={dx - 46} y={366} width={92} height={60} fill={KRP.cream} opacity={0.5} />
          {/* 開いた扉 */}
          <path d={`M ${dx + 60} 350 L ${dx + 120} 330 L ${dx + 120} 640 L ${dx + 60} 620 Z`} fill={C.teakDark} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${dx + 70} 370 L ${dx + 110} 358 L ${dx + 110} 420 L ${dx + 70} 430 Z`} fill={C.glass} stroke={KRP.ink} strokeWidth={3} />
          <rect x={dx - 200 + 60} y={380} width={70} height={90} rx={8} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={60 + i * 200} cy={640} r={40} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={5} />)}
      {/* ホーム */}
      <rect x={-40} y={640} width={2000} height={500} fill={C.platform} />
      <rect x={-40} y={640} width={2000} height={16} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
      <g stroke={C.platformDark} strokeWidth={4}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={656} x2={i * 260 - 200} y2={1120} />)}</g>
      {/* 降りてきた通勤客。雲が1人に1つずつ */}
      {folk.map((p, i) => {
        const t = seg(f, 8 + i * 2.6, 16 + i * 2.6);
        const px = lerp(doors[p.d] + 40, p.x0, easeOut(seg(f, 2, 30))) + f * 0.8;
        const chestX = px, chestY = p.y - 128 * p.s;
        const sx = doors[p.d], sy = 470;
        const cx = lerp(sx, chestX, easeOut(t)), cy = lerp(sy, chestY, easeOut(t)) - Math.sin(t * Math.PI) * 160;
        return (
          <g key={i}>
            <HmFFolk x={px} y={p.y} s={p.s} f={f} pose="hold" face={t >= 1 ? "smile" : t > 0 ? "surprised" : "normal"} cloth={p.cloth} clothDark={p.dark}
              hat={p.hat} skirt={p.skirt} phase={i} gaze={t > 0 && t < 1 ? [-6, -4] : [0, 4]} />
            {t > 0 && <HmFCloud x={cx} y={cy} s={0.42 * p.s / 0.6} f={f} phase={i} t={Math.min(1, t * 3)} />}
          </g>
        );
      })}
      {/* 雲の飛んだあと (ぽんの星) */}
      {folk.map((p, i) => {
        const t = seg(f, 16 + i * 2.6, 22 + i * 2.6);
        if (t <= 0 || t >= 1) return null;
        const px = lerp(doors[p.d] + 40, p.x0, easeOut(seg(f, 2, 30))) + f * 0.8;
        return <circle key={`s${i}`} cx={px} cy={p.y - 128 * p.s} r={40 + t * 50} fill="none" stroke={HP.spark} strokeWidth={6} opacity={1 - t} />;
      })}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #113 いわば、暇の大量生産です。
// 格: 山 / seed 5113
// 絵: どこ: 工場のベルトコンベア (比喩の工場・歯車・煙突)。演出: ベルトコンベアの上を、汽車の客車の形をした型から押し出された「暇」の橙の雲が、**次々と同じ形で**流れていく。検品係 (捜索係ではなく一般の工員) がハンコをぽんぽん押す。札「大量生産」。動き: コンベアが流れる / 雲が押し出される / ハンコ
// どこ: たとえ話の工場。煉瓦の壁に大きな歯車・高窓の外に煙突と煙・床にベルトコンベア
// 演出: 左の「客車の形をした型」がプレスでがしゃんと押すたび、その出口から「暇」の雲がまったく同じ形で押し出され、コンベアで右へ流れる。検品の工員がハンコをぽんぽん押す (押された雲には赤い丸)
// 動き: コンベアと雲が右へ流れる / プレスが上下 (約12コマに1回) / 歯車が回る / ハンコを押す腕が上下 / 煙突の煙
const Hm113: React.FC<{ f: number }> = ({ f }) => {
  const period = 12;
  const ph = (f % period) / period;
  const press = ph < 0.25 ? ph / 0.25 : ph < 0.5 ? 1 : 1 - (ph - 0.5) / 0.5;
  const stampPh = ((f + 6) % period) / period;
  const stampDown = stampPh < 0.3 ? stampPh / 0.3 : stampPh < 0.45 ? 1 : 1 - (stampPh - 0.45) / 0.55;
  const beltY = 640;
  const outX = 700, stampX = 1240;
  const spacing = 220;
  const move = (f / period) * spacing;
  const gear = (cx: number, cy: number, r: number, rot: number, n: number) => (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={-r * 0.16} y={-r - 22} width={r * 0.32} height={44} rx={6} fill={C.gear} stroke={KRP.ink} strokeWidth={5}
          transform={`rotate(${(i * 360) / n})`} />
      ))}
      <circle r={r} fill={C.gear} stroke={KRP.ink} strokeWidth={7} />
      <circle r={r * 0.62} fill={C.gearDark} stroke={KRP.ink} strokeWidth={5} />
      <circle r={r * 0.18} fill={HP.brass} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
  return (
    <Frame f={f} seed={5113} bg={C.factory}>
      {/* 壁 */}
      <rect x={-40} y={-40} width={2000} height={760} fill={C.brick} />
      {Array.from({ length: 18 }, (_, r) => (
        <g key={r}>
          <line x1={-40} y1={r * 42} x2={1960} y2={r * 42} stroke={C.mortar} strokeWidth={4} opacity={0.5} />
          {Array.from({ length: 22 }, (_, c) => <line key={c} x1={c * 96 + (r % 2) * 48} y1={r * 42} x2={c * 96 + (r % 2) * 48} y2={r * 42 + 42} stroke={C.mortar} strokeWidth={4} opacity={0.5} />)}
        </g>
      ))}
      {/* 高窓と外の煙突 */}
      {[1100, 1500].map((wx, i) => (
        <g key={wx}>
          <rect x={wx} y={70} width={300} height={200} rx={8} fill={C.sky} stroke={KRP.ink} strokeWidth={7} />
          <rect x={wx + 60 + i * 80} y={130} width={50} height={140} fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 4 }, (_, k) => {
            const age = ((f * 0.03 + k / 4) % 1);
            return <circle key={k} cx={wx + 85 + i * 80 + age * 90} cy={124 - age * 60} r={14 + age * 26} fill={KRP.gray} opacity={(1 - age) * 0.9} />;
          })}
          <line x1={wx + 150} y1={70} x2={wx + 150} y2={270} stroke={KRP.ink} strokeWidth={6} />
          <line x1={wx} y1={170} x2={wx + 300} y2={170} stroke={KRP.ink} strokeWidth={6} />
        </g>
      ))}
      {/* 歯車 */}
      {gear(560, 170, 110, f * 3, 10)}
      {gear(790, 120, 70, -f * 4.7 + 18, 8)}
      {gear(380, 330, 64, -f * 5.1, 8)}
      {/* 床 */}
      <rect x={-40} y={720} width={2000} height={420} fill={C.factoryDark} />
      <g stroke={C.factory} strokeWidth={4}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={720} x2={i * 250 - 160} y2={1120} />)}</g>
      {/* 出来上がりの木箱 (雲がぎっしり) */}
      <rect x={70} y={700} width={330} height={120} rx={8} fill={C.stall} stroke={KRP.ink} strokeWidth={6} />
      {[0, 1, 2].map((k) => <HmFCloud key={k} x={140 + k * 100} y={694 - (k % 2) * 10} s={0.55} f={0} />)}
      <rect x={70} y={720} width={330} height={100} rx={8} fill={C.stall} stroke={KRP.ink} strokeWidth={6} />
      <line x1={80} y1={770} x2={390} y2={770} stroke={C.stallDark} strokeWidth={5} />
      {/* 札 */}
      <TagPlate x={960} y={110} text="大量生産" size={60} t={seg(f, 4, 14)} fill={KRP.cream} />
      {/* 検品の工員 (コンベアの奥に立つ) */}
      <rect x={stampX + 10} y={690} width={180} height={50} rx={6} fill={C.stallDark} stroke={KRP.ink} strokeWidth={5} />
      <HmFFolk x={stampX + 100} y={694} s={1.1} f={f} face={stampDown > 0.8 ? "joy" : "smile"} pose="stand" cloth={C.suitGray} clothDark={C.suitGrayDark}
        hat="flat" hatColor={C.awnA} phase={2} gaze={[-6, 6]} />
      <path d="M 1280 540 L 1400 540 L 1410 660 L 1270 660 Z" fill={C.apron} stroke={KRP.ink} strokeWidth={5} />
      {/* ハンコを持つ腕 */}
      {(() => {
        const hx = stampX, hy = lerp(410, 500, stampDown);
        return (
          <g>
            <line x1={stampX + 26} y1={530} x2={hx} y2={hy + 30} stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
            <line x1={stampX + 26} y1={530} x2={hx} y2={hy + 30} stroke={C.suitGray} strokeWidth={21} strokeLinecap="round" />
            <rect x={hx - 16} y={hy - 50} width={32} height={60} rx={10} fill={C.stall} stroke={KRP.ink} strokeWidth={5} />
            <rect x={hx - 36} y={hy + 8} width={72} height={22} rx={5} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={hx + 14} cy={hy + 32} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {stampDown > 0.9 && [0, 1, 2].map((k) => (
              <line key={k} x1={hx - 60 + k * 60} y1={hy + 70} x2={hx - 80 + k * 80} y2={hy + 96} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
            ))}
          </g>
        );
      })()}
      {/* コンベア */}
      <rect x={620} y={beltY} width={1340} height={40} rx={20} fill={C.belt} stroke={KRP.ink} strokeWidth={7} />
      {Array.from({ length: 30 }, (_, i) => {
        const lx = 640 + ((i * 50 + move) % 1320);
        return <line key={i} x1={lx} y1={beltY + 6} x2={lx} y2={beltY + 34} stroke={KRP.grayDark} strokeWidth={4} />;
      })}
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`translate(${660 + i * 114} ${beltY + 64})`}>
          <circle r={22} fill={C.gear} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-16} y1={0} x2={16} y2={0} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${f * 12})`} />
        </g>
      ))}
      <rect x={620} y={beltY + 40} width={1340} height={14} fill={C.ironDark} />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={680 + i * 300} y={beltY + 90} width={22} height={90} fill={C.ironDark} stroke={KRP.ink} strokeWidth={4} />)}
      {/* 流れる雲 (同じ形) */}
      {Array.from({ length: 7 }, (_, i) => {
        const cx = outX + ((move + i * spacing) % (spacing * 7)) - 20;
        const grow = clamp01((cx - outX + 20) / 110);
        if (cx > 1990) return null;
        return <HmFCloud key={i} x={cx} y={beltY - 52} s={0.78 * (0.35 + 0.65 * grow)} f={0} t={1} mark={cx > stampX + 4} />;
      })}
      {/* 客車の形の型 + プレス */}
      <g>
        <rect x={320} y={260 - 0} width={30} height={260} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
        <rect x={620} y={260} width={30} height={260} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
        <rect x={300} y={240} width={370} height={40} rx={8} fill={C.ironDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={470} y={280} width={30} height={60 + press * 70} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <rect x={390} y={330 + press * 70} width={190} height={30} rx={6} fill={C.gearDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 型 (客車) */}
        <g transform={`translate(0 ${press * 10})`}>
          <rect x={250} y={420} width={470} height={210} rx={24} fill={C.teak} stroke={KRP.ink} strokeWidth={7} />
          <rect x={240} y={404} width={490} height={28} rx={12} fill={C.teakDark} stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2].map((k) => <rect key={k} x={280 + k * 130} y={450} width={100} height={80} rx={10} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />)}
          {[0, 1, 2].map((k) => <HmFCloud key={k} x={330 + k * 130} y={492} s={0.32} f={f} phase={k} />)}
          <rect x={250} y={560} width={470} height={14} fill={C.trim} />
          {[320, 650].map((wx) => <circle key={wx} cx={wx} cy={636} r={34} fill={C.locoBlack} stroke={KRP.ink} strokeWidth={5} />)}
          {/* 出口 */}
          <rect x={690} y={520} width={50} height={90} rx={8} fill={C.ironDark} stroke={KRP.ink} strokeWidth={5} />
        </g>
        {press > 0.9 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${560 + k * 40} 340 l 20 -24`} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
        ))}
        <HmFSteam x={510} y={250} f={f} s={0.5} dx={40} n={4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #114 すると、すかさず、それを商売にする人が現れます。
// 格: 山 / seed 5114
// 絵: どこ: 19世紀の駅のホームの片隅。演出: 柱の陰から、新聞の束を抱えた商人 (顔は描いてよい一般の商人・山高帽) が**にゅっと**顔を出し、群衆の持つ「暇」の雲を見て、目を輝かせる (face="joy")。頭上に電球ではなく硬貨のマーク。動き: 柱の陰から出る / 目がきらり / 硬貨がぽん
// どこ: 19世紀の駅のホームの片隅。飾りのついた鋳鉄の柱・煉瓦の壁に字のない貼り紙・ガス灯・奥を歩く群衆
// 演出: 柱の陰から、新聞の束を抱えた山高帽の商人がにゅっと顔を出す。群衆が胸に抱える「暇」の雲を見つけて、目を丸く→大喜び。頭の上に硬貨がぽんぽん
// 動き: f4-16 柱の陰から出る / f20 目がきらり / f26-38 硬貨が3つぽん / 群衆が右へ / カメラが商人へ寄る
const Hm114: React.FC<{ f: number }> = ({ f }) => {
  const out = easeOut(seg(f, 4, 16));
  const mx = lerp(540, 604, out);
  const lean = lerp(0, 16, out);
  const sees = f >= 20;
  const spark = seg(f, 18, 28);
  const cam = 1 + 0.08 * easeOut(seg(f, 10, 42));
  const crowd = [
    { x: 1080, y: 720, s: 0.62, hat: "top" as Hat, c: C.suitGray, d: C.suitGrayDark },
    { x: 1260, y: 730, s: 0.66, hat: "bonnet" as Hat, c: C.dressGreen, d: C.velvetDark, sk: C.dressGreen },
    { x: 1440, y: 716, s: 0.6, hat: "bowler" as Hat, c: C.suitBrown, d: C.suitBrownDark },
    { x: 1620, y: 728, s: 0.64, hat: "bowler" as Hat, c: C.coatDark, d: KRP.ink },
    { x: 1800, y: 720, s: 0.62, hat: "bonnet" as Hat, c: C.dressBlue, d: KRP.blueDeep, sk: C.dressBlue },
  ];
  return (
    <Frame f={f} seed={5114} bg={C.brick}>
      <g transform={`translate(700 520) scale(${cam}) translate(-700 -520)`}>
        {/* 壁と屋根 */}
        <rect x={-60} y={-60} width={2040} height={760} fill={C.brick} />
        {Array.from({ length: 18 }, (_, r) => (
          <g key={r}>
            <line x1={-60} y1={r * 42} x2={1980} y2={r * 42} stroke={C.mortar} strokeWidth={4} opacity={0.55} />
            {Array.from({ length: 22 }, (_, c) => <line key={c} x1={c * 96 + (r % 2) * 48} y1={r * 42} x2={c * 96 + (r % 2) * 48} y2={r * 42 + 42} stroke={C.mortar} strokeWidth={4} opacity={0.55} />)}
          </g>
        ))}
        <rect x={-60} y={-60} width={2040} height={130} fill={C.glass} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${i * 180 - 60} 70 L ${i * 180 + 30} -60`} stroke={C.iron} strokeWidth={10} />)}
        <rect x={-60} y={60} width={2040} height={24} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
        {/* 字のない貼り紙 */}
        {[[200, 220, -3, KRP.cream], [1000, 200, 2, C.awnB], [1500, 240, -2, KRP.yellow]].map(([px, py, r, c], i) => (
          <g key={i} transform={`rotate(${r} ${px} ${py})`}>
            <rect x={(px as number) - 110} y={(py as number) - 80} width={220} height={260} fill={c as string} stroke={KRP.ink} strokeWidth={5} />
            <rect x={(px as number) - 80} y={(py as number) - 50} width={160} height={70} fill={[C.coachRed, C.awnA, KRP.blueDeep][i]} opacity={0.7} />
            {[0, 1, 2].map((k) => <line key={k} x1={(px as number) - 80} y1={(py as number) + 50 + k * 34} x2={(px as number) + 80 - k * 20} y2={(py as number) + 50 + k * 34} stroke={KRP.grayDark} strokeWidth={6} />)}
          </g>
        ))}
        {/* ホームの床 */}
        <rect x={-60} y={690} width={2040} height={450} fill={C.platform} />
        <g stroke={C.platformDark} strokeWidth={4}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={690} x2={i * 260 - 220} y2={1120} />)}</g>
        <HmFGasLamp x={900} y={720} s={0.9} f={f} />
        {/* 奥を歩く群衆 (雲を抱えている) */}
        {crowd.map((p, i) => {
          const px = p.x + f * 1.2 - 40;
          return (
            <g key={i}>
              <HmFFolk x={px} y={p.y} s={p.s} f={f} pose="hold" face="smile" cloth={p.c} clothDark={p.d} hat={p.hat} skirt={p.sk} phase={i} gaze={[0, 5]} />
              <HmFCloud x={px} y={p.y - 128 * p.s} s={0.42 * p.s / 0.6} f={f} phase={i} />
            </g>
          );
        })}
        {/* 視線の点線 */}
        {sees && (
          <path d={`M ${mx + 90} 470 Q 900 400 1060 560`} stroke={KRP.ink} strokeWidth={5} strokeDasharray="8 12" fill="none" opacity={0.6 * spark} />
        )}
        {/* 商人 (柱の後ろ) */}
        <ellipse cx={mx + 60} cy={850} rx={90} ry={16} fill={KRP.ink} opacity={0.15} />
        <HmFFolk x={mx} y={850} s={1.15} f={f} face={sees ? "joy" : "surprised"} pose="hold" cloth={C.suitBrown} clothDark={C.suitBrownDark}
          hat="bowler" lean={lean} phase={3} gaze={[8, 2]} />
        {/* 抱えた新聞の束 (ひもでしばってある) */}
        <g transform={`rotate(${lean * 0.6} ${mx} 850)`}>
          <rect x={mx + 30} y={640} width={150} height={100} rx={6} fill={C.newsprint} stroke={KRP.ink} strokeWidth={6} transform={`rotate(-10 ${mx + 105} 690)`} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={mx + 44} y1={664 + k * 18} x2={mx + 166} y2={644 + k * 18} stroke={KRP.gray} strokeWidth={4} />)}
          <line x1={mx + 104} y1={640} x2={mx + 114} y2={738} stroke={C.stallDark} strokeWidth={6} />
        </g>
        {/* 目のきらり */}
        {spark > 0 && [[-26, 0], [26, 0]].map(([dx], k) => {
          const hx = mx + Math.sin((lean * Math.PI) / 180) * 222 * 1.15 + dx * 2.6;
          const hy = 850 - Math.cos((lean * Math.PI) / 180) * 222 * 1.15 + dx * 0.25 - 6;
          const r = 16 * pop(spark);
          return <path key={k} d={`M ${hx} ${hy - r} L ${hx + r * 0.3} ${hy - r * 0.3} L ${hx + r} ${hy} L ${hx + r * 0.3} ${hy + r * 0.3} L ${hx} ${hy + r} L ${hx - r * 0.3} ${hy + r * 0.3} L ${hx - r} ${hy} L ${hx - r * 0.3} ${hy - r * 0.3} Z`}
            fill={HP.spark} stroke={KRP.ink} strokeWidth={3} />;
        })}
        {/* 鋳鉄の柱 (手前) */}
        <g>
          <rect x={480} y={60} width={130} height={800} fill={C.pillar} stroke={KRP.ink} strokeWidth={8} />
          <rect x={500} y={80} width={20} height={760} fill={C.pillarLight} opacity={0.7} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={545 + k * 18 - 18} y1={140} x2={545 + k * 18 - 18} y2={780} stroke={C.ironDark} strokeWidth={4} />)}
          <path d="M 450 140 Q 545 90 640 140 L 620 170 L 470 170 Z" fill={C.pillar} stroke={KRP.ink} strokeWidth={7} />
          <path d="M 470 140 q 20 -40 40 0 M 580 140 q 20 -40 40 0" stroke={HP.brass} strokeWidth={5} fill="none" />
          <rect x={450} y={790} width={190} height={70} rx={8} fill={C.pillar} stroke={KRP.ink} strokeWidth={7} />
          <rect x={466} y={780} width={158} height={20} fill={C.ironDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 手が柱をつかむ */}
        <circle cx={616} cy={lerp(720, 700, out)} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      </g>
      {/* 頭の上の硬貨 (電球のかわり) */}
      {[0, 1, 2].map((k) => (
        <HmFCoin key={k} x={720 + (k - 1) * 100 + out * 30} y={190 - (k === 1 ? 40 : 0) + Math.sin(f / 5 + k) * 6} s={k === 1 ? 1.2 : 0.95} t={seg(f, 26 + k * 4, 34 + k * 4)} rot={(k - 1) * 14} />
      ))}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #115 1848年11月1日。ロンドンのユーストン駅に、駅の本屋が開きます。
// 格: 山 / seed 5115
// 絵: どこ: 1848年のロンドンのユーストン駅 (石造りの大きな門・鉄骨の屋根・ガス灯)。年代札「1848年」、地名札「ロンドン」。演出: ホームの一角に、木の屋台の本屋が開店。屋台の棚に新聞・本がぎっしり。開店の日除けがくるくると下りて、客が集まる。札「駅の本屋」。動き: 日除けが下りる / 客が集まる / 蒸気
// どこ: 1848年のロンドンのユーストン駅。奥に石造りの大きな門 (太い円柱4本と三角の屋根)・鉄骨の屋根・ガス灯・右に停車中の機関車
// 演出: ホームの一角に、木の屋台の本屋が開店。棚に新聞と本がぎっしり。縞の日除けがくるくると下りて、左右から客が集まってくる。開店の小旗
// 動き: f4-20 日除けが巻きをほどいて下りる / f8-36 客が左右から集まる / 機関車の蒸気 / ガス灯のゆらぎ / 小旗がゆれる
const Hm115: React.FC<{ f: number }> = ({ f }) => {
  const awn = easeOut(seg(f, 4, 20));
  const gather = easeOut(seg(f, 8, 36));
  const sx0 = 640, sx1 = 1300;
  const awnH = 46 * awn;
  const custs = [
    { from: -120, to: 520, y: 860, s: 0.78, hat: "top" as Hat, c: C.suitGrayDark, d: KRP.ink, face: "smile" as Face },
    { from: -260, to: 380, y: 820, s: 0.7, hat: "bonnet" as Hat, c: C.dressRose, d: C.coatDark, sk: C.dressRose, face: "joy" as Face },
    { from: 2100, to: 1440, y: 860, s: 0.78, hat: "bowler" as Hat, c: C.suitBrown, d: C.suitBrownDark, face: "surprised" as Face },
    { from: 2250, to: 1590, y: 820, s: 0.7, hat: "flat" as Hat, c: C.peasant, d: C.peasantDark, face: "smile" as Face },
    { from: 2350, to: 1740, y: 850, s: 0.74, hat: "bonnet" as Hat, c: C.dressGreen, d: C.velvetDark, sk: C.dressGreen, face: "smile" as Face },
  ];
  return (
    <Frame f={f} seed={5115} bg={C.glass}>
      {/* 鉄骨の屋根 */}
      <rect x={-40} y={-40} width={2000} height={520} fill={C.glass} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M ${i * 240 - 100} 300 L ${i * 240 + 20} 0 L ${i * 240 + 140} 300`} stroke={C.iron} strokeWidth={10} fill="none" />
      ))}
      <rect x={-40} y={-40} width={2000} height={50} fill={C.ironDark} />
      <rect x={-40} y={290} width={2000} height={22} fill={C.iron} stroke={KRP.ink} strokeWidth={5} />
      {/* 石造りの大きな門 (奥) */}
      <g>
        <rect x={160} y={312} width={1600} height={360} fill={C.stone} opacity={0.6} />
        <path d="M 420 210 L 960 120 L 1500 210 Z" fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
        <rect x={420} y={210} width={1080} height={60} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
        <line x1={430} y1={240} x2={1490} y2={240} stroke={C.stoneDark} strokeWidth={5} />
        {[480, 760, 1160, 1440].map((cx) => (
          <g key={cx}>
            <rect x={cx - 50} y={270} width={100} height={400} fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
            {[-26, 0, 26].map((dx) => <line key={dx} x1={cx + dx} y1={280} x2={cx + dx} y2={660} stroke={C.stoneDark} strokeWidth={4} />)}
            <rect x={cx - 64} y={270} width={128} height={24} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 門の上の国旗 (英国旗) */}
        <line x1={960} y1={120} x2={960} y2={40} stroke={KRP.ink} strokeWidth={6} />
        <g transform={`translate(960 40) skewY(${Math.sin(f / 6) * 4})`}>
          <rect x={0} y={0} width={110} height={66} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 0 0 L 110 66 M 110 0 L 0 66" stroke={KRP.white} strokeWidth={14} />
          <path d="M 0 0 L 110 66 M 110 0 L 0 66" stroke={KRP.red} strokeWidth={5} />
          <path d="M 55 0 L 55 66 M 0 33 L 110 33" stroke={KRP.white} strokeWidth={20} />
          <path d="M 55 0 L 55 66 M 0 33 L 110 33" stroke={KRP.red} strokeWidth={11} />
          <rect x={0} y={0} width={110} height={66} fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
      </g>
      {/* 右: 機関車と蒸気 */}
      <HmFSteam x={1880} y={360} f={f} s={1.1} dx={-160} speed={1.2} />
      <HmFLocoSide x={2070} y={660} s={0.62} f={f} roll={0} flip />
      {/* ホーム */}
      <rect x={-40} y={660} width={2000} height={480} fill={C.platform} />
      <g stroke={C.platformDark} strokeWidth={4}>{Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 220} y1={660} x2={i * 260 - 220} y2={1120} />)}</g>
      <HmFGasLamp x={250} y={700} s={1.0} f={f} />
      <HmFGasLamp x={1700} y={700} s={1.0} f={f} phase={3} />
      {/* 屋台の本屋 */}
      <g>
        <rect x={sx0 - 20} y={240} width={sx1 - sx0 + 40} height={46} rx={8} fill={C.stallDark} stroke={KRP.ink} strokeWidth={7} />
        {[sx0, sx1 - 24].map((px) => <rect key={px} x={px} y={286} width={24} height={500} fill={C.stallDark} stroke={KRP.ink} strokeWidth={6} />)}
        <rect x={sx0 + 24} y={286} width={sx1 - sx0 - 48} height={290} fill={C.stall} stroke={KRP.ink} strokeWidth={6} />
        {/* 棚: 上段=新聞 / 中段=本 */}
        {[0, 1].map((r) => <rect key={r} x={sx0 + 24} y={400 + r * 110} width={sx1 - sx0 - 48} height={12} fill={C.stallDark} stroke={KRP.ink} strokeWidth={4} />)}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} transform={`rotate(${(rnd(5115, i) - 0.5) * 8} ${sx0 + 70 + i * 66} 360)`}>
            <rect x={sx0 + 40 + i * 66} y={320} width={58} height={80} fill={C.newsprint} stroke={KRP.ink} strokeWidth={4} />
            <rect x={sx0 + 46 + i * 66} y={328} width={46} height={8} fill={KRP.ink} opacity={0.5} />
            {[0, 1, 2, 3].map((k) => <line key={k} x1={sx0 + 46 + i * 66} y1={348 + k * 12} x2={sx0 + 92 + i * 66} y2={348 + k * 12} stroke={KRP.gray} strokeWidth={4} />)}
          </g>
        ))}
        {Array.from({ length: 19 }, (_, i) => (
          <rect key={i} x={sx0 + 34 + i * 31} y={420 + (i % 3) * 8} width={25} height={90 - (i % 3) * 8} rx={3}
            fill={[C.coachRed, KRP.blueDeep, C.awnA, KRP.yellow, C.stall][i % 5]} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 本の山と台 */}
        <rect x={sx0 - 30} y={576} width={sx1 - sx0 + 60} height={30} rx={6} fill={C.stallDark} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            {[0, 1, 2].map((k) => (
              <rect key={k} x={sx0 + 20 + i * 130 + k * 4} y={556 - k * 18} width={100} height={20} rx={3}
                fill={[C.awnA, C.coachRed, KRP.cream][(i + k) % 3]} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        <rect x={sx0} y={606} width={sx1 - sx0} height={180} fill={C.stall} stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2].map((k) => <rect key={k} x={sx0 + 30 + k * 210} y={630} width={180} height={130} rx={6} fill="none" stroke={C.stallDark} strokeWidth={5} />)}
        {/* 日除け (巻きがほどけて下りる) */}
        <g>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={sx0 - 20 + i * ((sx1 - sx0 + 40) / 8)} y={286} width={(sx1 - sx0 + 40) / 8} height={awnH}
              fill={i % 2 ? C.awnA : C.awnB} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {awn > 0.2 && Array.from({ length: 8 }, (_, i) => (
            <path key={`s${i}`} d={`M ${sx0 - 20 + i * ((sx1 - sx0 + 40) / 8)} ${286 + awnH} q ${(sx1 - sx0 + 40) / 16} 30 ${(sx1 - sx0 + 40) / 8} 0`}
              fill={i % 2 ? C.awnA : C.awnB} stroke={KRP.ink} strokeWidth={4} />
          ))}
          {/* 巻き (まだ巻いている間) */}
          <rect x={sx0 - 26} y={278 + awnH} width={sx1 - sx0 + 52} height={awn < 1 ? 30 : 12} rx={14} fill={C.awnA} stroke={KRP.ink} strokeWidth={5} opacity={awn < 1 ? 1 : 0} />
        </g>
        {/* 開店の小旗 */}
        <path d={`M ${sx0 - 20} 246 Q 970 ${300 + Math.sin(f / 7) * 8} ${sx1 + 20} 246`} stroke={KRP.ink} strokeWidth={4} fill="none" />
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 0.5) / 9;
          const fx = lerp(sx0 - 20, sx1 + 20, t), fy = 246 + 4 * t * (1 - t) * (54 + Math.sin(f / 7) * 8) * 0.9;
          return <path key={i} d={`M ${fx - 18} ${fy} L ${fx + 18} ${fy} L ${fx} ${fy + 36} Z`} fill={[KRP.red, KRP.white, KRP.blueDeep][i % 3]} stroke={KRP.ink} strokeWidth={3} />;
        })}
      </g>
      {/* 集まる客 */}
      {custs.map((p, i) => {
        const px = lerp(p.from, p.to, gather);
        const walking = gather < 1;
        return (
          <HmFFolk key={i} x={px} y={p.y} s={p.s} f={f} face={walking ? "normal" : p.face} pose={walking ? "run" : i % 2 ? "raise" : "stand"}
            cloth={p.c} clothDark={p.d} hat={p.hat} skirt={p.sk} phase={i} gaze={[p.to < 960 ? 8 : -8, 0]} />
        );
      })}
      {/* 札 */}
      <TagPlate x={540} y={92} text="1848年" size={44} t={seg(f, 2, 12)} />
      <TagPlate x={830} y={92} text="ロンドン" size={44} t={seg(f, 6, 16)} />
      <TagPlate x={970} y={190} text="駅の本屋" size={48} t={seg(f, 18, 28)} fill={KRP.cream} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_104: (f) => <Hm104 f={f} />,
  hm_105: (f) => <Hm105 f={f} />,
  hm_106: (f) => <Hm106 f={f} />,
  hm_107: (f) => <Hm107 f={f} />,
  hm_108: (f) => <Hm108 f={f} />,
  hm_109: (f) => <Hm109 f={f} />,
  hm_110: (f) => <Hm110 f={f} />,
  hm_111: (f) => <Hm111 f={f} />,
  hm_112: (f) => <Hm112 f={f} />,
  hm_113: (f) => <Hm113 f={f} />,
  hm_114: (f) => <Hm114 f={f} />,
  hm_115: (f) => <Hm115 f={f} />,
};

export const HM_F_MOTIFS: string[] = [
  "hm_104", // #104
  "hm_105", // #105
  "hm_106", // #106
  "hm_107", // #107
  "hm_108", // #108
  "hm_109", // #109
  "hm_110", // #110
  "hm_111", // #111
  "hm_112", // #112
  "hm_113", // #113
  "hm_114", // #114
  "hm_115", // #115
];

export const himaFScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
