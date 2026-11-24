// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#36〜#44 (9文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
//
// ★守ること (詳しくは渡された指示文に全部書いてある):
//   - 絵の中の文字はラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)
//   - TagPlate の下端 = y + size*0.85 を 830 以下に
//   - seg(f, a, b) の b は 42 以下 (検品プレビューは f=45 の瞬間)
//   - 必ず f で動く。静止した絵は禁止
//   - 実在の人物と映画の人物は顔を見せない (後ろ姿・シルエット)

import React from "react";
import {
  KRP, Person, PersonMini, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, Frame, TagPlate, QMark, XMark, Arrow, ChapterDoor, QuizQ, Maru, MaruBatsu,
} from "./NamaeShared";
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend } from "./NamaeParts";


// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 夜の森 (#36)
  night: "#1C2630", night2: "#2B3B44", moon: "#F3E7C0", fir: "#16231F", fir2: "#21342D",
  ground: "#2E2A22", groundHi: "#3E382C", bush: "#2E4A33", bushHi: "#46684A", bushDark: "#203626",
  fire: "#F08A2C", fireMid: "#F7C04A", fireCore: "#FFF0B0", fireGlow: "#F5A54A",
  smoke: "#9C978C", smokeW: "#EEE9DC", log: "#6B4A2E", logDark: "#4A3220", stone: "#7E7A72",
  // 人物の服
  kobito: "#5E7D3E", kobitoDark: "#3F5A27", hat: "#9A4A2A", hatDark: "#6E3018", beard: "#F4F1EA",
  queen: "#B8434E", queenDark: "#8A2E37", gold: "#E2B43A",
  msg: "#8C6A3F", msgDark: "#6A4E2C", msgHat: "#5E4428",
  daiku: "#3F6E8C", daikuDark: "#2C5068",
  oni: "#B5452E", oniDark: "#8A3220", oniSkin: "#D65A40", horn: "#F1E3B8", tiger: "#E8B33A", cheek: "#F08A70",
  kyojin: "#6C7A5A", kyojinDark: "#4E5A40", kyojinHair: "#7A5A3A",
  hairBlack: "#26221F", skin: "#F2D2B6", skinDark: "#D9A988",
  // 寝室 (#37)
  stoneWall: "#CFC3AE", stoneLine: "#A99B82", tapestry: "#8E2F3A", plank: "#B98A5A", plankDark: "#8E6440",
  rug: "#9C3A3A", curtain: "#9E3445", curtainDark: "#76232F", dawn: "#BFD6E2", dawn2: "#F2D9B0",
  cradle: "#C49A62", cradleDark: "#93693C", babyCheek: "#F2A3A0", blanket: "#F3E3A8",
  // 掲示板・天秤 (#38 #39)
  boardFrame: "#6E4A2C", boardFrameHi: "#8E6440", cork: "#C8A472", corkDot: "#A9854F",
  card: "#FBF6E8", cardBack: "#3E4A6B", cardBackHi: "#56648A", plaster: "#DCD0B6",
  chessDark: "#5A4632", chessLight: "#EBDDBD", brassHi: "#F3D98A", table: "#9A6A40", tableDark: "#6E4A2C",
  // 目録棚 (#40)
  cab: "#7A4C2A", cabFront: "#A3693F", cabDark: "#5A361C", cardLine: "#9FB4D0", cardRed: "#C9564A",
  devil: "#3A2D3C", devilHi: "#5A4660", glass: "#DDEBF0",
  // 地図 (#41)
  parch: "#E9D7AC", parchDark: "#C6A970", sea: "#CBD0B5", seaLine: "#A9B096", land: "#F0E1BA", landShade: "#DCC898",
  pin: "#C8402F",
  // 絵巻 (#42)
  washi: "#EDE0C0", kinun: "#E3C46A", kinunDark: "#C9A548", river: "#6E98AA", riverDark: "#4E7A8E",
  foam: "#E8F0EE", mountain: "#9AA7A6", bank: "#8FA86A", bankDark: "#6E8A4E", rain: "#5E6E78", bridge: "#9B6E44",
  // 机 (#43)
  desk: "#8A5E3B", deskDark: "#6A4429", wallDark: "#3C2F28", bookBlue: "#3A4A6E", bookRed: "#8E3A30",
  bookGreen: "#4E6A46", bookBrown: "#7A5634", slip: "#F4ECD6", lampGlass: "#F7E9B8",
  // 書斎 (#44)
  wallpaper: "#D9C7A0", wallpaperDot: "#BFA77A", wainscot: "#6A4A30", glassR: "#C94A4A", glassB: "#4A78B8",
  glassG: "#5E9A5A", glassY: "#E8C24A", curtainG: "#3E5A46", curtainGDark: "#2C4232", eve: "#F0B77A", eve2: "#8FA8C8",
  kimono: "#4E5B6E", kimonoDark: "#36404F", lampShade: "#3F7A52", chair: "#5A3A22", genko: "#F6F0E0", genkoLine: "#D08A7A",
} as const;
void W; void H; void FONT;
void PersonMini; void Stamp; void QMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
type PFace = React.ComponentProps<typeof Person>["face"];
type PPose = React.ComponentProps<typeof Person>["pose"];
const cam = (cx: number, cy: number, s: number, dx = 0, dy = 0) =>
  `translate(${960 + dx} ${540 + dy}) scale(${s}) translate(${-cx} ${-cy})`;

// 小男: Person (小さく) + とんがり帽子 + 白い長いあごひげ
const NB1bKobito: React.FC<{
  x: number; y: number; s?: number; f: number; face?: PFace; pose?: PPose; lean?: number; red?: number; phase?: number;
}> = ({ x, y, s = 0.62, f, face = "normal", pose = "stand", lean = 0, red = 0, phase = 0 }) => {
  const flop = Math.sin((f + phase * 10) / 6) * 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      <Person x={0} y={0} s={s} f={f} still cloth={C.kobito} clothDark={C.kobitoDark} hair="none"
        face={face} pose={pose} lean={lean} phase={phase} />
      <g transform={`scale(${s}) rotate(${lean})`}>
        {red > 0 && <circle cx={0} cy={-228} r={60} fill={KRP.red} opacity={0.42 * red} />}
        {/* あごひげ */}
        <path d="M -54 -204 Q -64 -150 -26 -96 Q 0 -58 26 -96 Q 64 -150 54 -204 Q 30 -176 0 -174 Q -30 -176 -54 -204 Z"
          fill={C.beard} stroke={KRP.ink} strokeWidth={4.5} />
        <g stroke={KRP.grayDark} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7}>
          <path d="M -30 -164 Q -32 -130 -14 -104" /><path d="M 0 -166 L 0 -90" /><path d="M 30 -164 Q 32 -130 14 -104" />
        </g>
        {/* とんがり帽子 */}
        <g transform={`rotate(${flop * 0.4} 0 -276)`}>
          <path d={`M -56 -276 Q -46 -350 -12 -404 Q ${12 + flop} -440 ${46 + flop * 2} -446 Q ${24 + flop} -414 22 -384 Q 30 -330 56 -276 Z`}
            fill={C.hat} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -54 -288 Q 0 -302 54 -288 L 56 -274 Q 0 -288 -56 -274 Z" fill={C.hatDark} stroke={KRP.ink} strokeWidth={3.5} />
          <ellipse cx={0} cy={-274} rx={76} ry={12} fill={C.hat} stroke={KRP.ink} strokeWidth={4.5} />
          <path d="M -30 -330 Q -20 -370 0 -396" stroke="#FFFFFF" strokeWidth={4} opacity={0.3} fill="none" />
        </g>
      </g>
    </g>
  );
};

// お妃: Person (えんじのドレス) + 長い髪 + スカート + 金の冠
const NB1bQueen: React.FC<{
  x: number; y: number; s?: number; f: number; face?: PFace; pose?: PPose; pointDir?: 1 | -1; phase?: number;
}> = ({ x, y, s = 1, f, face = "smile", pose = "stand", pointDir = 1, phase = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      <g transform={`scale(${s})`}>
        <path d="M -66 -236 Q -82 -170 -70 -132 L 70 -132 Q 82 -170 66 -236 Z" fill={C.hairBlack} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <Person x={0} y={0} s={s} f={f} still cloth={C.queen} clothDark={C.queenDark} face={face} pose={pose} pointDir={pointDir} phase={phase} />
      <g transform={`scale(${s})`}>
        <path d="M -60 -66 L 60 -66 L 94 -4 Q 0 8 -94 -4 Z" fill={C.queen} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -90 -14 Q 0 -2 90 -14" stroke={C.gold} strokeWidth={7} fill="none" />
        <path d="M -30 -62 L -44 -8 M 30 -62 L 44 -8" stroke={C.queenDark} strokeWidth={4} />
        <polygon points="-42,-282 -48,-326 -24,-302 0,-336 24,-302 48,-326 42,-282" fill={C.gold} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <circle cx={0} cy={-298} r={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} />
        <circle cx={-26} cy={-290} r={5} fill={KRP.blueDeep} /><circle cx={26} cy={-290} r={5} fill={KRP.blueDeep} />
      </g>
    </g>
  );
};

// 鬼 / 北欧の巨人: 同じ構図・同じポーズで、色と飾りだけ違う
const NB1bBigFolk: React.FC<{
  kind: "oni" | "kyojin"; x: number; y: number; s?: number; f: number; pose?: PPose; gaze?: [number, number]; phase?: number;
}> = ({ kind, x, y, s = 1.5, f, pose = "armsFolded", gaze = [0, 0], phase = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const oni = kind === "oni";
  const [gx, gy] = gaze;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      <Person x={0} y={0} s={s} f={f} still cloth={oni ? C.oni : C.kyojin} clothDark={oni ? C.oniDark : C.kyojinDark}
        hair="none" face="smile" pose={pose} phase={phase} />
      <g transform={`scale(${s})`}>
        {oni ? (
          <g>
            {/* 虎柄の腰巻 */}
            <path d="M -40 -60 L 40 -60 L 34 -26 L 8 -34 L 0 -22 L -8 -34 L -34 -26 Z" fill={C.tiger} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              <path d="M -26 -58 L -20 -44" /><path d="M -6 -58 L 0 -42" /><path d="M 16 -58 L 22 -44" /><path d="M 30 -50 L 32 -36" />
            </g>
            {/* 赤い顔 */}
            <circle cx={0} cy={-228} r={64} fill={C.oniSkin} stroke={KRP.ink} strokeWidth={5.5} />
            {/* 角 */}
            {[-1, 1].map((sd) => (
              <g key={sd}>
                <path d={`M ${sd * 22} -284 Q ${sd * 44} -318 ${sd * 50} -356 Q ${sd * 60} -316 ${sd * 46} -278 Z`} fill={C.horn} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
                <path d={`M ${sd * 30} -300 L ${sd * 50} -304 M ${sd * 38} -318 L ${sd * 54} -320`} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
              </g>
            ))}
            {/* 縮れ毛 */}
            {Array.from({ length: 9 }, (_, i) => {
              const a = Math.PI * (1.1 + i * 0.1);
              return <circle key={i} cx={Math.cos(a) * 54} cy={-228 + Math.sin(a) * 54} r={15} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={3} />;
            })}
            {/* 眉・目・鼻・口 (愛嬌のある顔) */}
            <path d="M -42 -258 Q -26 -268 -10 -252" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" fill="none" />
            <path d="M 10 -252 Q 26 -268 42 -258" stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" fill="none" />
            <ellipse cx={-24} cy={-226} rx={15} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={24} cy={-226} rx={15} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-24 + gx} cy={-224 + gy} r={7} fill={KRP.ink} />
            <circle cx={24 + gx} cy={-224 + gy} r={7} fill={KRP.ink} />
            <ellipse cx={0} cy={-202} rx={10} ry={7} fill={C.oniDark} />
            <ellipse cx={-42} cy={-196} rx={10} ry={6} fill={C.cheek} opacity={0.7} />
            <ellipse cx={42} cy={-196} rx={10} ry={6} fill={C.cheek} opacity={0.7} />
            <path d="M -32 -190 Q 0 -158 32 -190 Q 0 -178 -32 -190 Z" fill={KRP.ink} />
            <polygon points="-26,-186 -17,-185 -24,-200" fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
            <polygon points="26,-186 17,-185 24,-200" fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
          </g>
        ) : (
          <g>
            {/* 毛皮の襟 */}
            <path d="M -58 -158 L -44 -142 L -30 -158 L -16 -142 L 0 -158 L 16 -142 L 30 -158 L 44 -142 L 58 -158" stroke={C.kyojinHair} strokeWidth={10} fill="none" strokeLinejoin="round" />
            {/* もじゃもじゃの髪 */}
            {Array.from({ length: 11 }, (_, i) => {
              const a = Math.PI * (0.92 + i * 0.116);
              return <circle key={i} cx={Math.cos(a) * 60} cy={-232 + Math.sin(a) * 60} r={22} fill={C.kyojinHair} stroke={KRP.ink} strokeWidth={3.5} />;
            })}
            {/* もじゃもじゃのひげ */}
            <path d="M -58 -208 Q -72 -140 -34 -108 Q 0 -84 34 -108 Q 72 -140 58 -208 Q 30 -178 0 -176 Q -30 -178 -58 -208 Z"
              fill={C.kyojinHair} stroke={KRP.ink} strokeWidth={4.5} />
            <g stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round">
              <path d="M -36 -160 q 8 14 0 28" /><path d="M 0 -164 q 8 16 0 34" /><path d="M 36 -160 q -8 14 0 28" />
            </g>
            <path d="M -40 -256 L -10 -250 M 10 -250 L 40 -256" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
};

// 黒い小悪魔 (トム・ティット・トット / 目録カードの「小さな悪魔」)。必ず塗る
const NB1bImp: React.FC<{ x: number; y: number; s?: number; f: number; arm?: number }> = ({ x, y, s = 1, f, arm = 0 }) => {
  const tail = Math.sin(f / 7) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M 22 -30 Q 70 -20 74 ${-60 + tail} Q 80 ${-86 + tail} 92 ${-78 + tail}`} stroke={C.devil} strokeWidth={8} fill="none" strokeLinecap="round" />
      <polygon points={`92,${-92 + tail} 104,${-70 + tail} 84,${-72 + tail}`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      <rect x={-22} y={-20} width={14} height={22} rx={6} fill={C.devil} stroke={KRP.ink} strokeWidth={3} />
      <rect x={8} y={-20} width={14} height={22} rx={6} fill={C.devil} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={0} cy={-46} rx={34} ry={34} fill={C.devil} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={0} cy={-40} rx={18} ry={20} fill={C.devilHi} />
      <rect x={24} y={-68} width={12} height={36} rx={6} fill={C.devil} stroke={KRP.ink} strokeWidth={3}
        transform={`rotate(${-70 + arm} 30 -66)`} />
      <rect x={-36} y={-68} width={12} height={36} rx={6} fill={C.devil} stroke={KRP.ink} strokeWidth={3} transform="rotate(30 -30 -66)" />
      <circle cx={0} cy={-104} r={30} fill={C.devil} stroke={KRP.ink} strokeWidth={4} />
      <polygon points="-20,-124 -30,-150 -8,-130" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      <polygon points="20,-124 30,-150 8,-130" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      <circle cx={-11} cy={-106} r={8} fill={KRP.white} /><circle cx={11} cy={-106} r={8} fill={KRP.white} />
      <circle cx={-9} cy={-105} r={3.5} fill={KRP.ink} /><circle cx={13} cy={-105} r={3.5} fill={KRP.ink} />
      <path d="M -10 -90 Q 0 -82 10 -90" stroke={KRP.white} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};

// 糸車 (車輪が f で回る)
const NB1bWheel: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const rot = f * 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -70 0 L -40 -70 M 70 0 L 40 -70 M -40 -70 L 40 -70" stroke={C.log} strokeWidth={9} strokeLinecap="round" />
      <path d="M -40 -70 L -40 -110 M 40 -70 L 40 -110" stroke={C.logDark} strokeWidth={6} />
      <g transform={`translate(0 -110) rotate(${rot})`}>
        <circle r={66} fill="none" stroke={C.log} strokeWidth={10} />
        <circle r={66} fill="none" stroke={KRP.ink} strokeWidth={2.5} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={0} y1={0} x2={Math.cos((i * Math.PI) / 4) * 62} y2={Math.sin((i * Math.PI) / 4) * 62} stroke={C.logDark} strokeWidth={4} />
        ))}
        <circle r={10} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <path d="M -60 -150 L -100 -130" stroke={C.logDark} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={-104} cy={-128} rx={8} ry={16} fill={C.tiger} stroke={KRP.ink} strokeWidth={3} />
      <path d="M -100 -128 Q -40 -190 0 -176" stroke={C.tiger} strokeWidth={2.5} fill="none" />
    </g>
  );
};

// 大工 (藍の半纏・頭を抱える)
const NB1bDaiku: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number }> = ({ x, y, s = 1, f, phase = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const shake = Math.sin(f / 3) * 2;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${shake * 0.4})`}>
      <Person x={0} y={0} s={s} f={f} still cloth={C.daiku} clothDark={C.daikuDark} face="worried" pose="banzai" phase={phase} />
      <g transform={`scale(${s})`}>
        {/* 半纏の襟 */}
        <path d="M -28 -160 L 0 -104 L 28 -160" stroke={C.daikuDark} strokeWidth={14} fill="none" />
        <path d="M -40 -96 L 40 -96" stroke={KRP.white} strokeWidth={6} opacity={0.6} />
        {/* はちまき */}
        <path d="M -64 -258 Q 0 -278 64 -258" stroke={KRP.white} strokeWidth={14} fill="none" />
        <path d="M -64 -258 Q 0 -278 64 -258" stroke={KRP.ink} strokeWidth={2.5} fill="none" opacity={0.5} />
        {/* 頭を抱える前腕 */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${sd * 125} -206 L ${sd * 66} -266`} stroke={KRP.ink} strokeWidth={31} strokeLinecap="round" />
            <path d={`M ${sd * 125} -206 L ${sd * 66} -266`} stroke={C.daiku} strokeWidth={22} strokeLinecap="round" />
            <circle cx={sd * 62} cy={-270} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 冷や汗 */}
        <path d={`M 78 ${-226 + (f % 20)} q -7 12 0 16 q 7 -4 0 -16 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2} opacity={0.9} />
      </g>
    </g>
  );
};

// 目録カードや絵の中で使う「名札の絵」(装置の Nafuda とは別の、ただの挿絵)
const NB1bTagIcon: React.FC<{ x: number; y: number; s?: number; glow?: number; text?: string }> = ({ x, y, s = 1, glow = 0, text = "なまえ" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={0} rx={170} ry={110} fill={NP.glow} opacity={0.4 * glow} />}
    <path d="M 0 -96 L -50 -56 M 0 -96 L 50 -56" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
    <circle cx={0} cy={-98} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-130} y={-60} width={260} height={124} rx={16} fill={NP.wood} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -116 -24 q 60 -10 120 0 q 60 10 110 -2" stroke={NP.grain} strokeWidth={3} fill="none" />
    <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={NP.sumi}>{text}</text>
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #36 ルンペルシュティルツキン。
// 格: 山 / seed 4036
// 絵: ★名前の見せ場。たき火の煙が、空中で大きな**文字の帯**になる (カタカナ「ルンペルシュティルツキン」を、ほどけた糸のように1文字ずつ浮かび上がらせる)。小男は気づかず歌い続ける。茂みの使いの者が目を見開く (surprised)
// どこ: 夜の森の奥の空き地。月と星、黒いもみの木、たき火 (石の輪と薪)。左手前に茂み
// 演出: たき火の煙が細い糸のようにほどけながら空へのぼり、1文字ずつ大きなカタカナの帯になる。
//       小男はたき火のそばで片足跳ねして歌い続け (目を閉じて気づかない)、茂みの使いの者が目を見開く
// 動き: 炎のゆらぎ・火の粉・煙の玉が上がる / 文字が f6〜39 で順に浮かぶ / 小男が跳ねる・音符 /
//       使いの者のまわりに驚きの線 (f20〜) / カメラは少し寄りながら上へ振る
const NB1B_NAME = Array.from("ルンペルシュティルツキン");
const Nm036: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 42));
  const fl = Math.sin(f / 2.3) * 0.5 + 0.5;
  const fx = 860, fy = 790;
  const hop = Math.abs(Math.sin(f / 5));
  const shock = seg(f, 18, 24);
  const bandT = seg(f, 6, 40);
  return (
    <Frame f={f} seed={4036} dark bg={C.night}>
      <defs>
        <linearGradient id="nb1b36sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.night} />
          <stop offset="1" stopColor={C.night2} />
        </linearGradient>
        <radialGradient id="nb1b36glow">
          <stop offset="0" stopColor={C.fireGlow} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.fireGlow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cam(960, 540, lerp(1.0, 1.06, k), 0, lerp(-10, 26, k))}>
        <rect x={-100} y={-100} width={2120} height={1300} fill="url(#nb1b36sky)" />
        {/* 星 */}
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={i} cx={rnd(36, i) * 1920} cy={rnd(37, i) * 440 - 40} r={1.5 + rnd(38, i) * 2.5}
            fill={C.moon} opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 9 + i))} />
        ))}
        {/* 月 */}
        <circle cx={1660} cy={150} r={110} fill={C.moon} opacity={0.12} />
        <circle cx={1660} cy={150} r={62} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1640} cy={136} r={12} fill={KRP.gold} opacity={0.5} />
        <circle cx={1680} cy={170} r={8} fill={KRP.gold} opacity={0.5} />
        {/* 遠いもみの木 (2列) */}
        {Array.from({ length: 16 }, (_, i) => {
          const tx = -40 + i * 130 + rnd(40, i) * 40;
          const th = 260 + rnd(41, i) * 180;
          return <path key={`a${i}`} d={`M ${tx} 700 L ${tx + 70} ${700 - th} L ${tx + 140} 700 Z`} fill={C.fir2} />;
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const tx = -80 + i * 180 + rnd(42, i) * 60;
          const th = 340 + rnd(43, i) * 160;
          if (tx > 640 && tx < 1000) return null;
          return (
            <g key={`b${i}`}>
              <path d={`M ${tx} 760 L ${tx + 50} ${760 - th * 0.55} L ${tx + 30} ${760 - th * 0.55} L ${tx + 90} ${760 - th} L ${tx + 150} ${760 - th * 0.55} L ${tx + 130} ${760 - th * 0.55} L ${tx + 180} 760 Z`}
                fill={C.fir} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
            </g>
          );
        })}
        {/* 手前の大きな幹 (左右) */}
        <rect x={-30} y={-100} width={120} height={1000} fill={C.fir} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1830} y={-100} width={120} height={1000} fill={C.fir} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.fir2} strokeWidth={5}>
          <path d="M 20 100 q 10 80 0 160 M 50 400 q -10 90 0 180" fill="none" />
          <path d="M 1880 200 q 10 80 0 160 M 1860 500 q -10 90 0 180" fill="none" />
        </g>
        {/* 地面 */}
        <path d="M -100 760 Q 400 730 960 750 Q 1500 770 2020 740 L 2020 1200 L -100 1200 Z" fill={C.ground} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 18 }, (_, i) => {
          const gx = rnd(44, i) * 1900;
          const gy = 780 + rnd(45, i) * 220;
          return <path key={i} d={`M ${gx} ${gy} l 8 -26 l 6 22 l 8 -30 l 6 34`} stroke={C.groundHi} strokeWidth={4} fill="none" />;
        })}
        {/* たき火の照り返し */}
        <ellipse cx={fx} cy={fy} rx={560 + fl * 30} ry={300} fill="url(#nb1b36glow)" />
        {/* 煙の玉 (たき火から上へ) */}
        {Array.from({ length: 9 }, (_, i) => {
          const u = ((f * 3.2 + i * 52) % 470) / 470;
          return (
            <circle key={i} cx={fx + Math.sin(u * 6 + i) * 40 * u} cy={680 - u * 420} r={22 + u * 46}
              fill={C.smoke} opacity={0.35 * (1 - u)} />
          );
        })}
        {/* 煙の帯 (文字の下地) */}
        <path d="M 150 330 C 520 220, 760 420, 980 300 S 1460 210, 1780 300" stroke={C.smoke} strokeWidth={170}
          fill="none" strokeLinecap="round" opacity={0.2 * bandT} />
        <path d="M 150 330 C 520 220, 760 420, 980 300 S 1460 210, 1780 300" stroke={C.smokeW} strokeWidth={6}
          fill="none" strokeDasharray="14 22" opacity={0.35 * bandT} strokeDashoffset={-f * 3} />
        {/* 文字: たき火の煙の糸がほどけて1文字ずつ空に浮かぶ */}
        {NB1B_NAME.map((ch, i) => {
          const t = easeOut(seg(f, 6 + i * 2.4, 13 + i * 2.4));
          if (t <= 0) return null;
          const sx = 236 + i * 132;
          const sy = 300 + Math.sin(i * 0.75) * 34 + Math.sin(f / 8 + i) * 4;
          const cx = lerp(fx, sx, t) + Math.sin(t * Math.PI) * (i < 6 ? -90 : 90);
          const cy = lerp(660, sy, t) - Math.sin(t * Math.PI) * 60;
          return (
            <g key={i}>
              {t < 1 && (
                <path d={`M ${fx} 690 Q ${(fx + cx) / 2 + Math.sin(f / 3 + i) * 40} ${(690 + cy) / 2} ${cx} ${cy + 40}`}
                  stroke={C.smokeW} strokeWidth={5} fill="none" opacity={0.7 * (1 - t)} strokeLinecap="round" />
              )}
              <text x={cx} y={cy + 44} textAnchor="middle" fontFamily={FONT} fontWeight={900}
                fontSize={lerp(40, 128, t)} fill={C.smokeW} stroke={KRP.ink} strokeWidth={6} paintOrder="stroke"
                opacity={t} transform={`rotate(${(1 - t) * (i % 2 ? 24 : -24)} ${cx} ${cy})`}>
                {ch}
              </text>
            </g>
          );
        })}
        {/* たき火: 石の輪・薪・炎・火の粉 */}
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI * (0.05 + i * 0.112);
          return <ellipse key={i} cx={fx + Math.cos(a) * 120} cy={fy + 6 + Math.sin(a) * 26} rx={30} ry={20}
            fill={C.stone} stroke={KRP.ink} strokeWidth={4} />;
        })}
        <rect x={fx - 110} y={fy - 34} width={220} height={30} rx={14} fill={C.log} stroke={KRP.ink} strokeWidth={5} transform={`rotate(-14 ${fx} ${fy})`} />
        <rect x={fx - 110} y={fy - 34} width={220} height={30} rx={14} fill={C.logDark} stroke={KRP.ink} strokeWidth={5} transform={`rotate(14 ${fx} ${fy})`} />
        <g transform={`translate(${fx} ${fy - 20}) scale(${1 + fl * 0.06} ${1 + fl * 0.1})`}>
          <path d={`M -80 0 Q -90 -80 -30 -130 Q -26 -90 0 -${200 + fl * 20} Q 30 -120 46 -150 Q 96 -70 80 0 Z`} fill={C.fire} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M -48 0 Q -54 -60 -14 -100 Q 0 -70 8 -${140 + fl * 16} Q 40 -80 50 0 Z`} fill={C.fireMid} />
          <path d="M -22 0 Q -24 -40 0 -70 Q 24 -40 22 0 Z" fill={C.fireCore} />
        </g>
        {Array.from({ length: 8 }, (_, i) => {
          const u = ((f * 2.6 + i * 37) % 160) / 160;
          return <circle key={i} cx={fx + Math.sin(i * 2 + u * 8) * 70} cy={fy - 120 - u * 300} r={4} fill={C.fireMid} opacity={1 - u} />;
        })}
        {/* 小男: 片足跳ねで歌い続ける (目を閉じて、空の文字に気づかない) */}
        <ellipse cx={1150} cy={826} rx={64 - hop * 16} ry={11} fill={KRP.ink} opacity={0.35} />
        <NB1bKobito x={1150} y={822 - hop * 40} s={0.66} f={f} face="joy" pose="banzai" lean={Math.sin(f / 5) * 9} />
        {[0, 1, 2].map((i) => {
          const u = ((f * 1.4 + i * 22) % 66) / 66;
          return (
            <text key={i} x={1230 + i * 30 + u * 60} y={600 - u * 160} fontFamily={FONT} fontWeight={900} fontSize={54}
              fill={C.fireMid} stroke={KRP.ink} strokeWidth={4} paintOrder="stroke" opacity={1 - u}>♪</text>
          );
        })}
        {/* 茂みの使いの者 (目を見開く) */}
        <g>
          <Person x={360} y={900} s={0.95} f={f} cloth={C.msg} clothDark={C.msgDark} face="surprised" gaze={[5, -5]} pose="stand" />
          <ellipse cx={360} cy={634} rx={82} ry={14} fill={C.msgHat} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 310 636 Q 312 588 360 584 Q 408 588 410 636 Z" fill={C.msgHat} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${Math.sin(f * 1.3) * 1.5 * shock} 360 900)`}>
            {[[120, 800, 110], [226, 796, 100], [360, 846, 96], [494, 796, 100], [600, 820, 100], [210, 880, 120], [510, 890, 120]].map(([bx, by, br], i) => (
              <circle key={i} cx={bx} cy={by} r={br} fill={i % 2 ? C.bush : C.bushDark} stroke={KRP.ink} strokeWidth={4} />
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <ellipse key={i} cx={130 + rnd(46, i) * 460} cy={780 + rnd(47, i) * 110} rx={18} ry={9} fill={C.bushHi}
                transform={`rotate(${rnd(48, i) * 180} ${130 + rnd(46, i) * 460} ${780 + rnd(47, i) * 110})`} />
            ))}
            {/* 葉をかき分ける両手 */}
            <circle cx={292} cy={748} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={428} cy={748} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
          {/* 驚きの線 */}
          <g stroke={C.fireMid} strokeWidth={6} strokeLinecap="round" opacity={shock}>
            {[-1, 0, 1].map((j) => {
              const a = -Math.PI / 2 + j * 0.55;
              return <line key={j} x1={360 + Math.cos(a) * 110} y1={640 + Math.sin(a) * 110} x2={360 + Math.cos(a) * (130 + 26 * shock)} y2={640 + Math.sin(a) * (130 + 26 * shock)} />;
            })}
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #37 名前を言い当てられた小男は、怒り狂って、姿を消しました。
// 格: 山 / seed 4037
// 絵: お妃の寝室に戻る。お妃が指を立てて名前を言い当てる (pose point・自信の顔)。小男は顔を真っ赤にして足を踏み鳴らし (床にひび)、f で煙とともに**消える** (変身の法: 消えたあとは影も帽子も残さない・煙の輪だけ)。ゆりかごの赤ちゃんが笑う
// どこ: お城のお妃の寝室 (石の壁・夜明けの縦長の窓・赤いタペストリー・天蓋つきの寝台・板の床と敷物)
// 演出: お妃が指を立てて言い当てる (smile で自信)。小男は顔を真っ赤にして3回足を踏み鳴らし、床にひびが走る。
//       f24 から煙がふくらみ、f28 で小男は完全に消える (帽子も影も残さない)。あとに煙の輪だけが広がる。
//       ゆりかごの赤ちゃんが手を上げて笑う
// 動き: 足踏みのたびに画面が小さく揺れ・ひびが伸びる / 煙の玉→輪 / ゆりかごが揺れる / カメラは小男へ寄ってから戻る
const Nm037: React.FC<{ f: number }> = ({ f }) => {
  const kx = 1270, ky = 852;
  const gone = f >= 34;
  const stomping = f < 30;
  const ph = (f % 8) / 8;
  const jump = stomping ? Math.sin(ph * Math.PI) * 30 : 0;
  const land = stomping && ph < 0.15 && f > 3 ? 1 : 0;
  const crack = seg(f, 4, 30);
  const puff = seg(f, 29, 35);
  const ring = clamp01((f - 33) / 14) * 0.8 + Math.max(0, f - 47) * 0.02;
  const k = easeInOut(seg(f, 0, 24));
  const back = easeInOut(seg(f, 33, 42));
  const sc = lerp(1, 1.06, k) - 0.04 * back;
  const rock = Math.sin(f / 7) * 4;
  const shakeX = land ? Math.sin(f * 5) * 5 : 0;
  return (
    <Frame f={f} seed={4037} bg={C.stoneWall}>
      <g transform={cam(lerp(960, 1040, k - back * 0.6), 540, sc, shakeX)}>
        {/* 石の壁 */}
        <rect x={-100} y={-100} width={2120} height={900} fill={C.stoneWall} />
        {Array.from({ length: 9 }, (_, r) => (
          <g key={r}>
            <line x1={-100} y1={r * 90} x2={2020} y2={r * 90} stroke={C.stoneLine} strokeWidth={4} />
            {Array.from({ length: 12 }, (_, c) => (
              <line key={c} x1={c * 190 + (r % 2) * 95} y1={r * 90} x2={c * 190 + (r % 2) * 95} y2={r * 90 + 90} stroke={C.stoneLine} strokeWidth={4} />
            ))}
          </g>
        ))}
        {/* 夜明けの窓 */}
        <path d="M 820 560 L 820 220 Q 820 110 960 110 Q 1100 110 1100 220 L 1100 560 Z" fill={C.dawn} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 828 560 L 828 400 Q 960 360 1092 400 L 1092 560 Z" fill={C.dawn2} />
        <path d="M 960 112 L 960 560 M 820 330 L 1100 330" stroke={C.cradleDark} strokeWidth={10} />
        <rect x={800} y={556} width={320} height={26} rx={6} fill={C.stoneLine} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="828,560 1092,560 1180,760 740,760" fill={C.dawn2} opacity={0.25} />
        {/* タペストリー */}
        <rect x={360} y={120} width={240} height={380} fill={C.tapestry} stroke={KRP.ink} strokeWidth={6} />
        <rect x={378} y={138} width={204} height={344} fill="none" stroke={C.gold} strokeWidth={5} />
        <path d="M 480 200 L 540 300 L 480 400 L 420 300 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={480} cy={300} r={22} fill={C.tapestry} stroke={KRP.ink} strokeWidth={3} />
        <rect x={340} y={106} width={280} height={18} rx={9} fill={C.cradleDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 天蓋つきの寝台 (右奥) */}
        <path d="M 1480 0 L 1980 0 L 1980 120 Q 1730 170 1480 120 Z" fill={C.curtain} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1500 120 Q 1540 420 1500 740 L 1580 740 Q 1600 400 1570 130 Z" fill={C.curtainDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1580} y={560} width={420} height={200} rx={20} fill={C.blanket} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1580} y={640} width={420} height={120} fill={C.curtain} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1720} cy={560} rx={100} ry={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* 板の床と敷物 */}
        <rect x={-100} y={760} width={2120} height={420} fill={C.plank} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={960 + (i - 6) * 120} y1={760} x2={960 + (i - 6) * 300} y2={1180} stroke={C.plankDark} strokeWidth={4} />
        ))}
        <ellipse cx={860} cy={880} rx={560} ry={70} fill={C.rug} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={860} cy={880} rx={500} ry={52} fill="none" stroke={C.gold} strokeWidth={5} strokeDasharray="20 12" />
        {/* 床のひび (足踏みのたびに伸びる) */}
        <g stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {[[-1, -0.3], [1, 0.2], [-0.4, 1], [0.6, 0.9], [1, -0.5]].map(([dx, dy], i) => {
            const L = 60 + 120 * clamp01(crack * 1.3 - i * 0.12);
            if (L <= 62) return null;
            return <path key={i} d={`M ${kx} ${ky + 4} l ${dx * L * 0.5} ${dy * L * 0.12 + 6} l ${dx * L * 0.2} ${-8} l ${dx * L * 0.4} ${dy * L * 0.16 + 10}`} />;
          })}
        </g>
        {/* ゆりかごと笑う赤ちゃん */}
        <g transform={`rotate(${rock} 840 846)`}>
          <path d="M 680 830 Q 840 880 1000 830" stroke={C.cradleDark} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M 700 820 Q 690 700 720 690 L 960 690 Q 990 700 980 820 Z" fill={C.cradle} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 700 820 Q 690 640 760 600 Q 790 640 790 690 Z" fill={C.cradleDark} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={810 + i * 44} y1={700} x2={810 + i * 44} y2={812} stroke={C.cradleDark} strokeWidth={5} />)}
          <path d="M 790 700 Q 880 660 976 700 L 970 730 Q 880 700 796 730 Z" fill={C.blanket} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={860} cy={660} r={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 842 652 Q 848 644 854 652 M 866 652 Q 872 644 878 652" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 846 668 Q 860 688 874 668 Z" fill={KRP.ink} />
          <circle cx={836} cy={672} r={7} fill={C.babyCheek} /><circle cx={884} cy={672} r={7} fill={C.babyCheek} />
          <path d="M 860 618 q 8 -10 0 -18" stroke={KRP.ink} strokeWidth={4} fill="none" />
          <circle cx={812 + Math.sin(f / 4) * 4} cy={640} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={908 - Math.sin(f / 4) * 4} cy={640} r={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(f / 3)}>
          <line x1={800} y1={600} x2={784} y2={584} /><line x1={860} y1={590} x2={860} y2={566} /><line x1={920} y1={600} x2={936} y2={584} />
        </g>
        {/* お妃: 指を立てて言い当てる */}
        <ellipse cx={470} cy={864} rx={110} ry={16} fill={KRP.ink} opacity={0.2} />
        <NB1bQueen x={470} y={862} s={1.02} f={f} face="smile" pose="point" pointDir={1} />
        <g opacity={seg(f, 0, 8)} stroke={C.gold} strokeWidth={5} strokeLinecap="round">
          {[0, 1, 2, 3].map((i) => {
            const a = -Math.PI / 2 + (i - 1.5) * 0.6;
            return <line key={i} x1={626 + Math.cos(a) * 24} y1={710 + Math.sin(a) * 24} x2={626 + Math.cos(a) * 44} y2={710 + Math.sin(a) * 44} />;
          })}
        </g>
        {/* 小男: 真っ赤になって足踏み → 煙とともに消える */}
        {!gone && (
          <g opacity={1 - seg(f, 31, 34)}>
            <NB1bKobito x={kx} y={ky - jump} s={0.66} f={f} face="angry" pose="banzai" red={1} lean={Math.sin(f / 2) * 3} />
            {[0, 1].map((i) => {
              const u = ((f * 2 + i * 15) % 30) / 30;
              return <circle key={i} cx={kx + (i ? 40 : -40)} cy={ky - jump - 250 - u * 60} r={10 + u * 14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} opacity={1 - u} />;
            })}
          </g>
        )}
        {land > 0 && !gone && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
            <line x1={kx - 70} y1={ky - 6} x2={kx - 110} y2={ky - 24} /><line x1={kx + 70} y1={ky - 6} x2={kx + 110} y2={ky - 24} />
          </g>
        )}
        {/* 消えるときの煙 → 煙の輪 */}
        {puff > 0 && (
          <g opacity={1 - ring * 0.2}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const R = 40 + 90 * easeOut(puff) + 40 * ring;
              return <circle key={i} cx={kx + Math.cos(a) * R * 0.9} cy={ky - 120 + Math.sin(a) * R * 0.7} r={(60 + 20 * Math.sin(i)) * (1 - ring * 0.6)}
                fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} opacity={1 - ring * 0.6} />;
            })}
            {ring > 0 && [0, 1].map((j) => (
              <ellipse key={j} cx={kx} cy={ky - 120 - j * 40 - ring * 30} rx={120 + ring * 140 + j * 50} ry={44 + ring * 40 + j * 16}
                fill="none" stroke={KRP.grayDark} strokeWidth={8 - j * 3} opacity={0.8 - j * 0.25} />
            ))}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #38 勝負の決め手は、力でも、知恵比べでもありません。
// 格: 図 / seed 4038
// 絵: 3枚の札が並ぶ「勝負の決め手」の掲示板 (木の掲示板=世界)。「力」(力こぶの絵) に赤い×、「知恵比べ」(チェス盤の絵) に赤い×、3枚目は伏せたまま (裏返しの札)。f で×が順に押される
// どこ: しっくい壁に掛かった大きな木の掲示板 (コルク地・画びょう・額縁の木目)
// 演出: 3枚の札。「力」(力こぶ) と「知恵比べ」(チェス盤) に、上から降りてくる赤いハンコが順に×を押す。
//       3枚目は伏せたまま、最後に少しだけカタカタ揺れる (次の文で返る)
// 動き: ハンコが f6〜10 で1枚目、f18〜22 で2枚目を押して上へ去る / 押された札がはね、インクが飛ぶ /
//       3枚目が f32〜42 で揺れる / カメラは左から右へゆっくりパン
const NB1bCard: React.FC<{ x: number; y: number; rot?: number; jolt?: number; children?: React.ReactNode; back?: boolean; pinColor?: string }> = ({
  x, y, rot = 0, jolt = 0, children, back = false, pinColor = KRP.red,
}) => (
  <g transform={`translate(${x} ${y + jolt * 8}) rotate(${rot + jolt * 2})`}>
    <rect x={-186} y={-224} width={380} height={460} rx={14} fill={KRP.ink} opacity={0.22} />
    <rect x={-190} y={-230} width={380} height={460} rx={14} fill={back ? C.cardBack : C.card} stroke={KRP.ink} strokeWidth={7} />
    {back ? (
      <g>
        <rect x={-164} y={-204} width={328} height={408} rx={8} fill="none" stroke={C.gold} strokeWidth={5} />
        <clipPath id="nb1bBackClip"><rect x={-164} y={-204} width={328} height={408} rx={8} /></clipPath>
        <g clipPath="url(#nb1bBackClip)" stroke={C.cardBackHi} strokeWidth={4}>
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i}>
              <line x1={-300 + i * 60} y1={-210} x2={-300 + i * 60 + 420} y2={210} />
              <line x1={300 - i * 60} y1={-210} x2={300 - i * 60 - 420} y2={210} />
            </g>
          ))}
        </g>
        <circle cx={0} cy={0} r={64} fill={C.cardBack} stroke={C.gold} strokeWidth={6} />
        <path d="M 0 -40 L 34 0 L 0 40 L -34 0 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
      </g>
    ) : children}
    <circle cx={0} cy={-200} r={18} fill={pinColor} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={-5} cy={-205} r={5} fill={KRP.white} opacity={0.7} />
  </g>
);
const NB1bHanko: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-150} rx={40} ry={36} fill={C.cradleDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-20} y={-126} width={40} height={80} fill={C.cradle} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-80} y={-50} width={160} height={36} rx={6} fill={C.cradleDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-74} y={-14} width={148} height={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const Nm038: React.FC<{ f: number }> = ({ f }) => {
  const x1 = seg(f, 9, 13), x2 = seg(f, 21, 25);
  const j1 = f >= 9 && f < 14 ? Math.sin((f - 9) * 1.2) * (1 - (f - 9) / 5) : 0;
  const j2 = f >= 21 && f < 26 ? Math.sin((f - 21) * 1.2) * (1 - (f - 21) / 5) : 0;
  const wob = seg(f, 32, 36) * (1 - seg(f, 40, 42)) * Math.sin(f * 1.6) * 2;
  // ハンコの道すじ
  let hx = 480, hy = -120;
  if (f < 6) { hx = 480; hy = lerp(-200, 260, easeOut(seg(f, 0, 6))); }
  else if (f < 10) { hx = 480; hy = lerp(260, 500, seg(f, 6, 9)); }
  else if (f < 18) { const u = easeInOut(seg(f, 10, 17)); hx = lerp(480, 960, u); hy = 500 - Math.sin(u * Math.PI) * 250; }
  else if (f < 22) { hx = 960; hy = lerp(470, 500, seg(f, 18, 21)); }
  else { const u = easeInOut(seg(f, 22, 32)); hx = lerp(960, 1300, u); hy = lerp(500, -260, u); }
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={4038} bg={C.plaster}>
      <g transform={cam(960, 540, 1.02, pan)}>
        {/* しっくいの壁と腰板 */}
        <rect x={-100} y={-100} width={2120} height={1300} fill={C.plaster} />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={rnd(380, i) * 1920} cy={rnd(381, i) * 1080} r={20 + rnd(382, i) * 40} fill={C.stoneLine} opacity={0.12} />
        ))}
        <rect x={-100} y={930} width={2120} height={300} fill={C.boardFrame} />
        <line x1={-100} y1={930} x2={2020} y2={930} stroke={KRP.ink} strokeWidth={5} />
        {/* 掲示板の額 */}
        <rect x={70} y={96} width={1780} height={820} rx={18} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={8} />
        <rect x={84} y={108} width={1752} height={20} rx={8} fill={C.boardFrameHi} opacity={0.7} />
        <rect x={120} y={146} width={1680} height={720} rx={8} fill={C.cork} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 160 }, (_, i) => (
          <circle key={i} cx={130 + rnd(383, i) * 1660} cy={156 + rnd(384, i) * 700} r={2 + rnd(385, i) * 3} fill={C.corkDot} opacity={0.7} />
        ))}
        {/* 見出しの札 (ラベル) */}
        <TagPlate x={960} y={202} text="勝負の決め手" size={50} t={1} />
        {/* 1枚目: 力 */}
        <NB1bCard x={480} y={530} rot={-2} jolt={j1}>
          <g transform="translate(0 -40)">
            <path d="M -130 60 Q -130 20 -80 14 L 10 10 Q 40 -20 30 -90 L 70 -100 Q 100 -10 60 50 Q 0 90 -130 90 Z" fill={C.skin} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            <path d="M -70 14 Q -30 -50 20 0" fill={C.skin} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={52} cy={-112} r={34} fill={C.skin} stroke={KRP.ink} strokeWidth={6} />
            <path d="M 34 -126 L 70 -126 M 34 -110 L 70 -110" stroke={C.skinDark} strokeWidth={4} />
            <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
              <line x1={-90} y1={-70} x2={-110} y2={-96} /><line x1={-50} y1={-90} x2={-56} y2={-120} /><line x1={110} y1={-60} x2={140} y2={-74} />
            </g>
          </g>
          <text x={0} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.ink}>力</text>
          <XMark x={0} y={-10} s={2.3} t={x1} />
        </NB1bCard>
        {/* 2枚目: 知恵比べ */}
        <NB1bCard x={960} y={530} rot={1.5} jolt={j2} pinColor={KRP.blueDeep}>
          <g transform="translate(0 -40) skewX(-8)">
            {Array.from({ length: 16 }, (_, i) => (
              <rect key={i} x={-120 + (i % 4) * 60} y={-120 + Math.floor(i / 4) * 60} width={60} height={60}
                fill={(i + Math.floor(i / 4)) % 2 ? C.chessDark : C.chessLight} />
            ))}
            <rect x={-120} y={-120} width={240} height={240} fill="none" stroke={KRP.ink} strokeWidth={6} />
          </g>
          <g transform="translate(-30 -60)">
            <path d="M -30 40 L 30 40 L 24 10 Q 40 -20 20 -50 Q -10 -70 -30 -40 L -20 -30 Q -40 -10 -24 0 L -10 -8 L -20 10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={6} cy={-40} r={5} fill={KRP.ink} />
          </g>
          <g transform="translate(60 0)">
            <path d="M -22 30 L 22 30 L 12 -6 Q 22 -24 0 -36 Q -22 -24 -12 -6 Z" fill={C.hairBlack} stroke={KRP.ink} strokeWidth={4} />
          </g>
          <text x={0} y={184} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={KRP.ink}>知恵比べ</text>
          <XMark x={0} y={-10} s={2.3} t={x2} />
        </NB1bCard>
        {/* 3枚目: 伏せたまま */}
        <NB1bCard x={1440} y={530} rot={-1 + wob} back pinColor={KRP.yellow} />
        {/* インクのしぶき */}
        {[[480, x1], [960, x2]].map(([cx, t], i) => t > 0 && t < 1 ? (
          <g key={i} fill={KRP.red} opacity={1 - t}>
            {Array.from({ length: 6 }, (_, j) => {
              const a = (j / 6) * Math.PI * 2;
              return <circle key={j} cx={cx + Math.cos(a) * (120 + t * 60)} cy={490 + Math.sin(a) * (120 + t * 60)} r={8} />;
            })}
          </g>
        ) : null)}
        {f < 32 && <NB1bHanko x={hx} y={hy} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #39 相手の本当の名前を知ったほうが、勝つのです。
// 格: 山 / seed 4039
// 絵: #38 の3枚目の札が f でくるりと返り、**名札の絵**が現れて金色に光る。札の下で、お妃と小男の小さな人形 (天秤の両皿) が、名札の側に天秤が傾く (名前を知ったほうが重い)。天秤は真鍮で作り込む
// どこ: #38 と同じ掲示板の前 (同じ場所・同じ時間の続き)。カメラが3枚目の札に寄り、手前の机に真鍮の天秤
// 演出: 伏せた3枚目の札がくるりと返り、名札の絵が金色に光る。光が天秤の左の皿 (名札を抱えたお妃の人形) に落ち、
//       天秤が左 (名前を知ったほう) へ、がくんと傾く。右の皿の小男の人形は持ち上げられて慌てる
// 動き: 札の裏返し f4〜16 / 金の光と光の筋 f14〜24 / 天秤の傾き f18〜32 (少し行き過ぎて戻る) /
//       カメラは札に寄った所から少し引いて天秤まで見せる
const Nm039: React.FC<{ f: number }> = ({ f }) => {
  const flip = easeInOut(seg(f, 4, 16));
  const sx = Math.cos(Math.PI * flip);
  const glow = seg(f, 14, 22);
  const tilt = seg(f, 18, 32);
  const ang = -11 * (easeOut(tilt) + Math.sin(tilt * Math.PI) * 0.25) + Math.sin(f / 9) * 0.4 * tilt;
  const a = (ang * Math.PI) / 180;
  const PX = 960, PY = 560, L = 360;
  const lx = PX - L * Math.cos(a), ly = PY - L * Math.sin(a);
  const rx = PX + L * Math.cos(a), ry = PY + L * Math.sin(a);
  const k = easeInOut(seg(f, 0, 26));
  const pan = (px: number, py: number, side: number, children: React.ReactNode) => (
    <g>
      {[-1, 1].map((d) => (
        <line key={d} x1={px} y1={py} x2={px + d * 100} y2={py + 150} stroke={NP.brassDark} strokeWidth={4} strokeDasharray="8 4" />
      ))}
      <circle cx={px} cy={py} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
      {children}
      <path d={`M ${px - 120} ${py + 150} Q ${px} ${py + 200} ${px + 120} ${py + 150} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
      <path d={`M ${px - 96} ${py + 160} Q ${px} ${py + 184} ${px + 96} ${py + 160}`} stroke={C.brassHi} strokeWidth={5} fill="none" opacity={0.8} />
      <ellipse cx={px} cy={py + 150} rx={120} ry={12} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      {void side}
    </g>
  );
  return (
    <Frame f={f} seed={4039} bg={C.cork}>
      <g transform={cam(960, lerp(330, 540, k), lerp(1.12, 1, k))}>
        {/* 掲示板のコルク地 (寄った画面いっぱい) */}
        <rect x={-200} y={-200} width={2320} height={1500} fill={C.cork} />
        {Array.from({ length: 220 }, (_, i) => (
          <circle key={i} cx={-100 + rnd(390, i) * 2120} cy={-100 + rnd(391, i) * 1000} r={2 + rnd(392, i) * 3} fill={C.corkDot} opacity={0.7} />
        ))}
        <rect x={-200} y={-120} width={2320} height={60} fill={C.boardFrame} stroke={KRP.ink} strokeWidth={6} />
        {/* 左に×のついた2枚目の札の端 */}
        <g transform="translate(250 300) rotate(1.5)">
          <rect x={-190} y={-230} width={380} height={460} rx={14} fill={C.card} stroke={KRP.ink} strokeWidth={7} />
          <XMark x={0} y={-10} s={2.3} t={1} />
        </g>
        {/* 3枚目の札: くるりと返る */}
        {glow > 0 && (
          <g opacity={glow}>
            {Array.from({ length: 12 }, (_, i) => {
              const r0 = (i / 12) * Math.PI * 2 + f / 40;
              return <path key={i} d={`M 960 300 L ${960 + Math.cos(r0) * 420} ${300 + Math.sin(r0) * 420} L ${960 + Math.cos(r0 + 0.14) * 420} ${300 + Math.sin(r0 + 0.14) * 420} Z`} fill={NP.glow} opacity={0.35} />;
            })}
            <polygon points="900,470 1020,470 720,760 480,760" fill={NP.glow} opacity={0.28 * glow} />
          </g>
        )}
        <g transform={`translate(960 300) scale(${Math.max(0.02, Math.abs(sx))} 1) rotate(-1)`}>
          <rect x={-196} y={-164} width={400} height={340} rx={14} fill={KRP.ink} opacity={0.22} />
          <rect x={-200} y={-170} width={400} height={340} rx={14} fill={sx > 0 ? C.cardBack : C.card} stroke={sx > 0 ? KRP.ink : C.gold} strokeWidth={sx > 0 ? 7 : 10} />
          {sx > 0 ? (
            <g>
              <rect x={-176} y={-146} width={352} height={292} rx={8} fill="none" stroke={C.gold} strokeWidth={5} />
              <circle r={60} fill={C.cardBack} stroke={C.gold} strokeWidth={6} />
              <path d="M 0 -38 L 32 0 L 0 38 L -32 0 Z" fill={C.gold} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ) : (
            <g>
              <rect x={-180} y={-150} width={360} height={300} rx={8} fill="none" stroke={C.gold} strokeWidth={4} strokeDasharray="12 8" />
              <NB1bTagIcon x={0} y={24} s={1.05} glow={glow} />
            </g>
          )}
          <circle cx={0} cy={-146} r={18} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 手前の机 */}
        <rect x={-200} y={880} width={2320} height={400} fill={C.table} stroke={KRP.ink} strokeWidth={6} />
        <path d="M -200 920 Q 400 905 960 925 T 2120 915" stroke={C.tableDark} strokeWidth={5} fill="none" />
        {/* 真鍮の天秤 */}
        <ellipse cx={PX} cy={900} rx={220} ry={30} fill={KRP.ink} opacity={0.25} />
        <path d="M 790 900 L 820 850 L 1100 850 L 1130 900 Z" fill={NP.brassDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={840} y={820} width={240} height={34} rx={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 930 820 L 940 600 L 980 600 L 990 820 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
        <line x1={952} y1={612} x2={948} y2={810} stroke={C.brassHi} strokeWidth={5} opacity={0.8} />
        {[700, 760].map((ry2) => <rect key={ry2} x={922} y={ry2} width={76} height={18} rx={8} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />)}
        {/* 目盛りの弧と針 */}
        <path d="M 880 640 Q 960 690 1040 640" stroke={KRP.ink} strokeWidth={4} fill="none" />
        {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
          <line key={i} x1={960 + i * 26} y1={652 + Math.abs(i) * -4 + 10} x2={960 + i * 26} y2={640 + Math.abs(i) * -4 + 10} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <line x1={PX} y1={PY} x2={PX - Math.sin(a) * 110} y2={PY + Math.cos(a) * 110} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
        {/* 竿 */}
        <g transform={`rotate(${ang} ${PX} ${PY})`}>
          <path d={`M ${PX - L} ${PY - 8} Q ${PX} ${PY - 28} ${PX + L} ${PY - 8} L ${PX + L} ${PY + 8} Q ${PX} ${PY - 6} ${PX - L} ${PY + 8} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${PX - L + 20} ${PY - 6} Q ${PX} ${PY - 22} ${PX + L - 20} ${PY - 6}`} stroke={C.brassHi} strokeWidth={4} fill="none" />
          {[-1, 1].map((d) => (
            <path key={d} d={`M ${PX + d * L} ${PY} q ${d * 30} -10 ${d * 26} -36 q ${-d * 14} 4 ${-d * 10} 16`} stroke={NP.brassDark} strokeWidth={6} fill="none" strokeLinecap="round" />
          ))}
        </g>
        <path d={`M ${PX} ${PY - 66} L ${PX + 16} ${PY - 40} L ${PX} ${PY - 24} L ${PX - 16} ${PY - 40} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={PX} cy={PY} r={20} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={PX} cy={PY} r={7} fill={C.brassHi} />
        {/* 左の皿: 名札を抱えたお妃の人形 (重い) */}
        {pan(lx, ly, -1, (
          <g>
            <NB1bQueen x={lx} y={ly + 156} s={0.4} f={f} face="smile" pose="hold" />
            <NB1bTagIcon x={lx} y={ly + 108} s={0.22} glow={glow} text="" />
          </g>
        ))}
        {/* 右の皿: 小男の人形 (持ち上げられて慌てる) */}
        {pan(rx, ry, 1, (
          <NB1bKobito x={rx} y={ry + 156} s={0.32} f={f} face={tilt > 0.3 ? "surprised" : "angry"} pose={tilt > 0.3 ? "banzai" : "armsFolded"} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #40 昔話の研究では、これをひとつの「型」として分類しています。
// 格: 図 / seed 4040
// 絵: 研究室の大きな木の引き出し棚 (目録カードの棚・真鍮の取っ手と番号札)。引き出しの1つがすっと開き、中のカードに「名前当ての型」と書かれた見出し (番号は書かない)。カードに、小男・小さな悪魔・鬼の小さな絵が並ぶ。ルーペが f でカードの上をすべる
// どこ: 昔話の研究室。壁いっぱいの木の目録カード棚 (5列×4段・真鍮の取っ手と番号札)
// 演出: まん中の引き出しがすっと手前に開き、中から1枚のカードがせり上がる。見出しは「名前当ての型」。
//       カードには小男・黒い小悪魔・赤鬼の小さな絵が3つ並ぶ。真鍮のルーペがすべってきて、絵を拡大して見せる
// 動き: 引き出し f4〜14 / カード f12〜24 / ルーペ f24〜42 (レンズの中は拡大した絵) / カメラはカードへ寄る
const NB1bCatPics: React.FC<{ f: number; top: number }> = ({ f, top }) => (
  <g>
    {[700, 960, 1220].map((cx, i) => (
      <rect key={i} x={cx - 112} y={top + 150} width={224} height={250} rx={8} fill={KRP.white} stroke={C.cardLine} strokeWidth={4} />
    ))}
    <NB1bKobito x={700} y={top + 388} s={0.42} f={f} face="angry" pose="banzai" />
    <NB1bImp x={960} y={top + 384} s={1.25} f={f} arm={Math.sin(f / 6) * 20} />
    <g transform={`translate(1220 ${top + 388}) scale(0.48) translate(-1220 ${-(top + 388)})`}>
      <NB1bBigFolk kind="oni" x={1220} y={top + 388} s={1} f={f} />
    </g>
  </g>
);
const Nm040: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeOut(seg(f, 4, 14));
  const rise = easeOut(seg(f, 12, 24));
  const mag = easeInOut(seg(f, 24, 42));
  const k = easeInOut(seg(f, 6, 40));
  const cols = [248, 604, 960, 1316, 1672];
  const rows = [182, 427, 672, 917];
  const top = lerp(700, 150, rise);
  const lensX = lerp(640, 960, mag), lensY = top + 270 + Math.sin(mag * Math.PI) * -30;
  const frontY = 562 + 200 * pull;
  return (
    <Frame f={f} seed={4040} bg={C.cabDark}>
      <defs>
        <clipPath id="nb1b40lens"><circle cx={lensX} cy={lensY} r={104} /></clipPath>
        <radialGradient id="nb1b40light">
          <stop offset="0" stopColor={NP.glowCore} stopOpacity={0.35} />
          <stop offset="1" stopColor={NP.glowCore} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cam(960, lerp(540, 470, k), lerp(1, 1.08, k))}>
        {/* 棚の本体 */}
        <rect x={-100} y={-100} width={2120} height={1300} fill={C.cabDark} />
        <rect x={50} y={40} width={1820} height={1040} rx={10} fill={C.cab} stroke={KRP.ink} strokeWidth={8} />
        {rows.map((ry, r) => cols.map((cx, c) => {
          if (r === 2 && c === 2) {
            return <rect key={`${r}${c}`} x={cx - 164} y={ry - 110} width={328} height={220} fill={KRP.ink} opacity={0.85} />;
          }
          return (
            <g key={`${r}${c}`}>
              <rect x={cx - 164} y={ry - 110} width={328} height={220} rx={6} fill={C.cabFront} stroke={KRP.ink} strokeWidth={5} />
              <path d={`M ${cx - 150} ${ry - 60} q 80 -8 150 0 q 70 8 150 -4 M ${cx - 150} ${ry + 70} q 90 8 160 0 q 70 -6 140 2`} stroke={C.cab} strokeWidth={3} fill="none" />
              <rect x={cx - 50} y={ry - 76} width={100} height={46} rx={4} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
              <rect x={cx - 40} y={ry - 68} width={80} height={30} fill={C.card} />
              <text x={cx} y={ry - 45} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={KRP.ink}>{300 + r * 50 + c * 10}</text>
              <path d={`M ${cx - 44} ${ry + 10} Q ${cx} ${ry + 62} ${cx + 44} ${ry + 10} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${cx - 30} ${ry + 18} Q ${cx} ${ry + 44} ${cx + 30} ${ry + 18}`} stroke={C.brassHi} strokeWidth={3} fill="none" />
            </g>
          );
        }))}
        {/* 開いた引き出しの中 (上から見えるカードの並び) */}
        <path d={`M 796 562 L 1124 562 L ${1124 + 30 * pull} ${frontY} L ${796 - 30 * pull} ${frontY} Z`} fill={C.cabFront} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => {
          const yy = 566 + (frontY - 566) * (i / 9);
          return yy < frontY - 6 ? <rect key={i} x={810 - 30 * pull * (i / 9)} y={yy} width={300 + 60 * pull * (i / 9)} height={12} fill={C.card} stroke={KRP.ink} strokeWidth={2} /> : null;
        })}
        {/* せり上がるカード */}
        <g>
          <rect x={556} y={top + 6} width={808} height={640} rx={10} fill={KRP.ink} opacity={0.25} />
          <rect x={550} y={top} width={820} height={640} rx={10} fill={C.card} stroke={KRP.ink} strokeWidth={7} />
          <rect x={1250} y={top - 36} width={120} height={44} rx={8} fill={C.card} stroke={KRP.ink} strokeWidth={5} />
          <text x={960} y={top + 92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={KRP.ink}>名前当ての型</text>
          <line x1={580} y1={top + 126} x2={1340} y2={top + 126} stroke={C.cardRed} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={580} y1={top + 430 + i * 44} x2={1340} y2={top + 430 + i * 44} stroke={C.cardLine} strokeWidth={3} />)}
          <circle cx={960} cy={top + 600} r={14} fill={C.cabDark} stroke={KRP.ink} strokeWidth={3} />
          <NB1bCatPics f={f} top={top} />
        </g>
        {/* 引き出しの前板 (手前に出てくる) */}
        <g transform={`translate(960 ${frontY + 110}) scale(${1 + 0.18 * pull}) translate(-960 ${-(frontY + 110)})`}>
          <rect x={796} y={frontY} width={328} height={220} rx={6} fill={C.cabFront} stroke={KRP.ink} strokeWidth={6} />
          <rect x={910} y={frontY + 34} width={100} height={46} rx={4} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <rect x={920} y={frontY + 42} width={80} height={30} fill={C.card} />
          <text x={960} y={frontY + 65} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={KRP.ink}>420</text>
          <path d={`M 916 ${frontY + 120} Q 960 ${frontY + 172} 1004 ${frontY + 120} Z`} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* ルーペ (レンズの中は拡大) */}
        {mag > 0 || f >= 24 ? (
          <g opacity={seg(f, 22, 26)}>
            <line x1={lensX + 74} y1={lensY + 74} x2={lensX + 190} y2={lensY + 190} stroke={KRP.ink} strokeWidth={34} strokeLinecap="round" />
            <line x1={lensX + 74} y1={lensY + 74} x2={lensX + 190} y2={lensY + 190} stroke={C.cradleDark} strokeWidth={24} strokeLinecap="round" />
            <g clipPath="url(#nb1b40lens)">
              <rect x={lensX - 110} y={lensY - 110} width={220} height={220} fill={C.card} />
              <g transform={`translate(${lensX} ${lensY}) scale(1.5) translate(${-lensX} ${-lensY})`}>
                <NB1bCatPics f={f} top={top} />
              </g>
              <rect x={lensX - 110} y={lensY - 110} width={220} height={220} fill={C.glass} opacity={0.18} />
            </g>
            <circle cx={lensX} cy={lensY} r={108} fill="none" stroke={NP.brass} strokeWidth={16} />
            <circle cx={lensX} cy={lensY} r={108} fill="none" stroke={KRP.ink} strokeWidth={4} />
            <circle cx={lensX} cy={lensY} r={118} fill="none" stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lensX - 70} ${lensY - 40} Q ${lensX - 60} ${lensY - 70} ${lensX - 30} ${lensY - 80}`} stroke={KRP.white} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.8} />
          </g>
        ) : null}
        <ellipse cx={960} cy={420} rx={900} ry={600} fill="url(#nb1b40light)" />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #41 イギリスの「トム・ティット・トット」など、ヨーロッパを中心に、各地に似た話があります。
// 格: 山 / seed 4041
// 絵: 古い羊皮紙のヨーロッパ地図。ドイツから点線が各地へ広がり、ピンが刺さっていく (イギリス・デンマーク・フィンランド・アイルランドなど)。イギリスのピンの横に、**黒い小悪魔が糸車を回す小さな絵** (トム・ティット・トット)。札「イギリス」「ドイツ」。※「世界中」に見えないよう、ピンはヨーロッパに集中させる
// どこ: 机に広げた古い羊皮紙のヨーロッパ地図 (海の波線・方位磁針・帆船・焼けた縁)
// 演出: ドイツの金のピンから点線が各地へ伸び、赤いピンが次々に刺さる (イギリス・アイルランド・デンマーク・
//       スウェーデン・ノルウェー・フィンランド・フランス・イタリア・ハンガリー・ポーランド・ロシア西部)。
//       イギリスのピンの横の丸い挿絵で、黒い小悪魔が糸車を回す (トム・ティット・トット)。ピンはヨーロッパだけ
// 動き: 点線とピン f4〜42 / 挿絵が f10〜18 で開き、糸車が回る / 帆船がゆれる / カメラはドイツに寄った所から引く
const MP = (lon: number, lat: number): [number, number] => [960 + (lon - 14) * 22, 1040 - (lat - 36) * 34];
const mpath = (pts: number[][]) => pts.map(([lo, la], i) => { const [x, y] = MP(lo, la); return `${i ? "L" : "M"} ${x.toFixed(0)} ${y.toFixed(0)}`; }).join(" ") + " Z";
const NB1B_LAND: number[][][] = [
  // 大陸
  [[-9, 37], [-7.4, 37.2], [-6, 36.2], [-5.3, 36.1], [-2, 36.8], [-0.4, 37.6], [0.2, 38.8], [-0.3, 39.6], [0.9, 41], [3.2, 42], [3.1, 43.1], [4.5, 43.4], [6.5, 43.1], [7.6, 43.8], [8.8, 44.4], [10.2, 43.9], [10.6, 42.9], [12.5, 41.5], [14, 40.8], [15.7, 39.9], [15.6, 38.2], [16.1, 38], [16.6, 38.9], [17.2, 39.4], [16.5, 40], [18.5, 40.2], [18, 40.7], [16, 41.6], [14, 42.8], [12.4, 44.3], [12.3, 45.3], [13.7, 45.7], [13.9, 44.8], [15.5, 43.8], [17.5, 43], [19.4, 41.8], [19.4, 40.4], [20.3, 39.4], [21.1, 38.3], [21.7, 36.8], [22.5, 36.5], [23.2, 37.9], [24, 38.2], [22.8, 39.4], [23.9, 40.4], [26, 40.8], [28.9, 41.1], [33, 42], [38, 40.9], [41.6, 41.5], [60, 41.5], [60, 61], [33, 61], [30.2, 59.9], [28, 59.5], [24.3, 59.4], [23.5, 58.6], [24.3, 57.3], [21.6, 57.3], [21, 56], [21.2, 55.2], [19.6, 54.4], [18.5, 54.8], [16, 54.3], [14.2, 53.9], [12.3, 54.2], [11, 54], [10, 54.5], [10.9, 56.4], [10.5, 57.7], [8.6, 57.1], [8.1, 56], [8.6, 54.9], [8.6, 53.6], [7, 53.4], [5, 53.2], [4.4, 52.2], [3.6, 51.5], [2.5, 51.1], [1.6, 50.2], [0.2, 49.7], [-1.3, 49.6], [-1.9, 48.7], [-4.7, 48.5], [-4.4, 47.8], [-2.3, 47.2], [-1.2, 46.2], [-1.4, 44.5], [-1.8, 43.4], [-4.5, 43.4], [-8, 43.7], [-9.3, 43.1], [-8.8, 42], [-8.7, 40.8], [-9.4, 39.4], [-8.8, 38.6], [-9, 37.9]],
  // スカンディナヴィアとフィンランド
  [[5, 58.6], [5.6, 58], [7, 58], [8.5, 58.3], [10.5, 59.3], [11.1, 59], [11.8, 58], [12.6, 56.5], [12.9, 55.4], [14.2, 55.4], [16.4, 56.6], [16.6, 57.8], [16.7, 58.6], [18.6, 59.4], [17.3, 60.6], [17.5, 62.4], [19.5, 63.6], [21.5, 64.6], [22.4, 65.8], [25.4, 65.1], [25.3, 64.1], [23.1, 63.6], [21.3, 62.8], [21.4, 61], [22.7, 60], [24.5, 60.1], [26.6, 60.4], [28.5, 60.6], [30.2, 60], [33, 60.6], [60, 60.6], [60, 72], [5, 72], [4.8, 61.5], [5, 60]],
  // グレートブリテン
  [[-5.7, 50.1], [-3, 50.6], [1.4, 51.2], [1.7, 52.7], [0.3, 53.4], [-0.2, 54.2], [-1.6, 55.6], [-2.1, 56.8], [-1.8, 57.6], [-3.3, 58.6], [-5, 58.6], [-5.6, 57.4], [-5.6, 56.3], [-4.9, 55.1], [-3.3, 54.8], [-3, 53.9], [-3.1, 53.3], [-4.6, 53.3], [-4.2, 52.3], [-5.2, 51.8], [-3.2, 51.4], [-4.2, 51.2]],
  // アイルランド
  [[-10, 51.6], [-6.3, 52.2], [-6, 53.4], [-5.5, 54.6], [-7.3, 55.4], [-8.5, 55], [-10, 54.2], [-9.9, 53.2]],
  // アナトリア・北アフリカ
  [[26.2, 40], [26.5, 38.6], [27.3, 37], [28.2, 36.7], [30.5, 36.3], [32.8, 36], [36, 36.5], [36, 34.6], [35, 32.9], [34.2, 31.4], [32.3, 31.3], [29, 30.9], [25, 31.8], [22.5, 32.8], [20.1, 32.9], [20, 31.5], [15.2, 32.3], [11.2, 33.2], [10.2, 35.2], [11.1, 36.8], [10.3, 37.3], [8.6, 36.9], [1, 36.5], [-2, 35.1], [-6.2, 35.8], [-14, 34], [-14, 28], [60, 28], [60, 42], [41.6, 42], [38, 40.8], [33, 41.8], [29, 41.1], [26.6, 40.4]],
  // 島
  [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 36.7], [14.3, 37], [12.6, 37.6]],
  [[8.4, 41], [9.8, 40.9], [9.6, 39.1], [8.4, 39], [8.5, 40]],
  [[8.6, 42.9], [9.4, 43], [9.5, 42.1], [9.2, 41.4], [8.7, 41.7]],
  [[11, 55.7], [12.6, 56], [12.4, 55.3], [11.2, 55.2]],
  [[23.5, 35.3], [26.3, 35.3], [25, 35]],
];
const NB1B_SEAS: number[][][] = [
  [[28, 41.3], [29.2, 41.2], [31.3, 41.1], [34.9, 42], [38.3, 40.9], [41.5, 41.5], [41.6, 42.6], [39.7, 43.4], [37.4, 44.7], [36.6, 45.4], [34.4, 45], [33.5, 44.5], [32.5, 45.4], [33.7, 46.1], [31.6, 46.6], [30.2, 45.8], [29.7, 45.2], [28.6, 44.2], [27.9, 42.7]],
  [[47, 44.5], [46.8, 42.8], [48.5, 41.2], [49.3, 40.2], [49, 38.4], [50.3, 37.2], [53.9, 37.3], [53, 39.5], [52.8, 41.4], [51.2, 43], [53.1, 45.2], [51.8, 46.7], [49.2, 46.6], [47.5, 45.6]],
];
const NB1B_PINS: [number, number][] = [
  [1, 52.3], [9.8, 56.2], [-8, 53.1], [15.5, 59.6], [2.5, 47], [9, 61], [25, 62.2], [12.5, 43], [19, 47.2], [20, 52], [37, 55.5],
];
const Nm041: React.FC<{ f: number }> = ({ f }) => {
  const [gx, gy] = MP(9.5, 51.3);
  const k = easeInOut(seg(f, 0, 30));
  const vig = pop(seg(f, 10, 18));
  const [ex, ey] = MP(1, 52.3);
  return (
    <Frame f={f} seed={4041} bg={C.parchDark}>
      <defs>
        <clipPath id="nb1b41clip"><rect x={44} y={34} width={1832} height={1012} rx={10} /></clipPath>
      </defs>
      <g transform={cam(lerp(gx, 960, k), lerp(gy, 540, k), lerp(1.4, 1, k))}>
        {/* 羊皮紙 */}
        <rect x={-200} y={-200} width={2320} height={1500} fill={C.parchDark} />
        <rect x={20} y={12} width={1880} height={1056} rx={30} fill={C.parch} stroke={KRP.ink} strokeWidth={6} />
        <g clipPath="url(#nb1b41clip)">
          <rect x={0} y={0} width={1920} height={1080} fill={C.sea} />
          {Array.from({ length: 40 }, (_, i) => {
            const wx = rnd(410, i) * 1900, wy = rnd(411, i) * 1060;
            return <path key={i} d={`M ${wx} ${wy} q 12 -10 24 0 q 12 10 24 0`} stroke={C.seaLine} strokeWidth={3} fill="none" />;
          })}
          {NB1B_LAND.map((pts, i) => (
            <path key={`ls${i}`} d={mpath(pts)} fill={KRP.ink} stroke={KRP.ink} strokeWidth={9} strokeLinejoin="round" />
          ))}
          {NB1B_LAND.map((pts, i) => (
            <path key={`lf${i}`} d={mpath(pts)} fill={C.land} />
          ))}
          {NB1B_SEAS.map((pts, i) => (
            <path key={i} d={mpath(pts)} fill={C.sea} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          ))}
          {/* 山の記号 (アルプス・ピレネー・カルパチア) */}
          {[[8, 46.4], [10.5, 46.6], [13, 47], [0.5, 42.7], [-1.5, 42.9], [24, 47.5], [22, 48.8]].map(([lo, la], i) => {
            const [mx, my] = MP(lo, la);
            return <path key={i} d={`M ${mx - 22} ${my + 12} L ${mx} ${my - 16} L ${mx + 22} ${my + 12}`} stroke={C.landShade} strokeWidth={5} fill="none" strokeLinejoin="round" />;
          })}
          {/* 羊皮紙のしみ */}
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={rnd(412, i) * 1900} cy={rnd(413, i) * 1060} r={40 + rnd(414, i) * 70} fill={C.parchDark} opacity={0.18} />
          ))}
          {/* 帆船 (ビスケー湾) */}
          <g transform={`translate(${MP(-8, 46)[0]} ${MP(-8, 46)[1] + Math.sin(f / 8) * 4}) rotate(${Math.sin(f / 10) * 4})`}>
            <path d="M -40 0 L 40 0 L 28 18 L -28 18 Z" fill={C.log} stroke={KRP.ink} strokeWidth={4} />
            <line x1={0} y1={0} x2={0} y2={-70} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 4 -66 Q 40 -40 4 -10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* 方位磁針 */}
          <g transform={`translate(1730 870) rotate(${Math.sin(f / 20) * 3})`}>
            <circle r={84} fill="none" stroke={KRP.ink} strokeWidth={4} />
            <circle r={70} fill="none" stroke={KRP.ink} strokeWidth={2} strokeDasharray="6 6" />
            <polygon points="0,-96 16,0 0,96 -16,0" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
            <polygon points="-96,0 0,16 96,0 0,-16" fill={C.parch} stroke={KRP.ink} strokeWidth={3} />
            <circle r={8} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* ドイツから広がる点線 */}
          {NB1B_PINS.map(([lo, la], i) => {
            const [tx, ty] = MP(lo, la);
            const t = easeOut(seg(f, 4 + i * 2.6, 11 + i * 2.6));
            const dx = tx - gx, dy = ty - gy;
            const d = Math.hypot(dx, dy);
            const cx = (gx + tx) / 2 - (dy / d) * d * 0.18 * (i % 2 ? 1 : -1);
            const cy = (gy + ty) / 2 + (dx / d) * d * 0.18 * (i % 2 ? 1 : -1);
            const n = Math.max(2, Math.floor(d / 20));
            return (
              <g key={i}>
                {Array.from({ length: n }, (_, j) => {
                  const u = j / n;
                  if (u > t) return null;
                  const px = (1 - u) * (1 - u) * gx + 2 * (1 - u) * u * cx + u * u * tx;
                  const py = (1 - u) * (1 - u) * gy + 2 * (1 - u) * u * cy + u * u * ty;
                  return <circle key={j} cx={px} cy={py} r={4.5} fill={KRP.red} />;
                })}
              </g>
            );
          })}
          {NB1B_PINS.map(([lo, la], i) => {
            const [tx, ty] = MP(lo, la);
            const p = seg(f, 10 + i * 2.6, 13 + i * 2.6);
            if (p <= 0) return null;
            const big = i === 0;
            return (
              <g key={i} transform={`translate(${tx} ${ty - (1 - easeOut(p)) * 60})`}>
                <ellipse cx={4} cy={2} rx={10} ry={4} fill={KRP.ink} opacity={0.3} />
                <line x1={0} y1={0} x2={10} y2={-34} stroke={KRP.grayDark} strokeWidth={4} />
                <circle cx={12} cy={-40} r={big ? 18 : 13} fill={C.pin} stroke={KRP.ink} strokeWidth={4} />
                <circle cx={7} cy={-45} r={4} fill={KRP.white} opacity={0.7} />
                {big && <circle cx={12} cy={-40} r={30} fill="none" stroke={C.gold} strokeWidth={5} />}
              </g>
            );
          })}
          {/* 起点ドイツの金のピン */}
          <circle cx={gx} cy={gy} r={34 + Math.sin(f / 4) * 6} fill={NP.glow} opacity={0.35} />
          <line x1={gx} y1={gy} x2={gx + 12} y2={gy - 40} stroke={KRP.grayDark} strokeWidth={5} />
          <circle cx={gx + 14} cy={gy - 48} r={20} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          {/* トム・ティット・トットの挿絵 (イギリスのピンの横) */}
          {vig > 0 && (
            <g>
              <path d={`M 370 360 Q 560 330 ${ex} ${ey - 30}`} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 8" fill="none" opacity={seg(f, 14, 18)} />
              <g transform={`translate(240 330) scale(${vig})`}>
                <circle r={146} fill={C.card} stroke={KRP.ink} strokeWidth={7} />
                <circle r={130} fill="none" stroke={C.gold} strokeWidth={5} />
                <ellipse cx={0} cy={86} rx={110} ry={22} fill={C.plankDark} opacity={0.5} />
                <NB1bWheel x={40} y={96} s={0.85} f={f} />
                <NB1bImp x={-58} y={96} s={0.95} f={f} arm={Math.sin(f / 3) * 30} />
              </g>
            </g>
          )}
        </g>
        {/* 地図の飾り枠 */}
        <rect x={44} y={34} width={1832} height={1012} rx={10} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <rect x={58} y={48} width={1804} height={984} rx={6} fill="none" stroke={C.parchDark} strokeWidth={4} />
        {/* 札 */}
        <TagPlate x={640} y={380} text="イギリス" size={34} t={seg(f, 8, 14)} />
        <TagPlate x={890} y={596} text="ドイツ" size={34} t={seg(f, 2, 8)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #42 日本にも、「大工と鬼六」という、そっくりな話があります。
// 格: 山 / seed 4042
// 絵: 日本の昔話の絵巻風。大雨の大きな川・流される橋。川岸で頭を抱える大工 (藍の半纏)。川の中から大きな赤鬼が顔を出してにやり (愛嬌のある鬼)。札「大工と鬼六」は使わず「日本」の札だけ (題名は字幕で出る)
// どこ: 日本の絵巻の一場面 (和紙の地・上下に金のすやり霞・墨の遠山)。大雨の大きな川と、流される木の橋
// 演出: 左の川岸で、藍の半纏の大工が頭を抱える (道具箱のそば)。川のまん中から大きな赤鬼がざぶりと顔を出し、
//       大工を見てにやり (角・縮れ毛・牙ののぞく笑い。怖くしすぎない)。題名は字幕に任せ、札は「日本」だけ
// 動き: 雨が斜めに降る / 川の流れの線が流れ、橋板が下流へ流されていく / 鬼が f8〜28 で浮かび上がり、波紋が広がる /
//       大工が小さく震える / カメラは絵巻を右から左へゆっくり繰る
const Nm042: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 8, 28));
  const ox = 1240;
  const headY = lerp(900, 520, up);
  const oniFeet = headY + 228 * 1.6;
  const panX = lerp(50, -40, easeInOut(seg(f, 0, 42)));
  const cloud = (x: number, y: number, w: number, key: string) => (
    <g key={key}>
      <path d={`M ${x} ${y} q ${w * 0.1} -40 ${w * 0.25} -20 q ${w * 0.12} -36 ${w * 0.28} -12 q ${w * 0.15} -34 ${w * 0.3} -4 q ${w * 0.1} 10 ${w * 0.17} 36 Z`}
        fill={C.kinun} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${x + w * 0.1} ${y - 8} q ${w * 0.3} -14 ${w * 0.7} -6`} stroke={C.kinunDark} strokeWidth={4} fill="none" />
    </g>
  );
  return (
    <Frame f={f} seed={4042} bg={C.washi}>
      <g transform={cam(960, 540, 1.04, panX)}>
        <rect x={-200} y={-200} width={2320} height={1500} fill={C.washi} />
        {/* 和紙の繊維 */}
        {Array.from({ length: 50 }, (_, i) => (
          <path key={i} d={`M ${rnd(420, i) * 2000} ${rnd(421, i) * 1080} q 14 ${rnd(422, i) * 10 - 5} 30 0`} stroke={C.kinunDark} strokeWidth={2} opacity={0.3} fill="none" />
        ))}
        {/* 雨空のくもり */}
        <rect x={-200} y={130} width={2320} height={400} fill={C.mountain} opacity={0.28} />
        {/* 墨の遠山 */}
        <path d="M -200 480 Q 100 300 360 420 Q 600 260 900 400 Q 1200 280 1500 410 Q 1760 300 2100 420 L 2100 520 L -200 520 Z" fill={C.mountain} opacity={0.75} />
        <path d="M -200 500 Q 300 410 700 470 Q 1100 400 1500 470 Q 1800 420 2100 480 L 2100 540 L -200 540 Z" fill={C.riverDark} opacity={0.35} />
        {/* 川 */}
        <path d="M 470 520 C 900 480, 1400 540, 2120 500 L 2120 1100 L 640 1100 C 560 860, 560 680, 470 520 Z" fill={C.river} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => {
          const y0 = 580 + i * 50;
          return <path key={i} d={`M ${560 + i * 20} ${y0} q 120 -24 240 0 t 240 0 t 240 0 t 240 0 t 240 0 t 240 0`} stroke={C.foam} strokeWidth={4} fill="none"
            strokeDasharray="60 40" strokeDashoffset={-f * 6 - i * 30} opacity={0.75} />;
        })}
        {/* 渦 (絵巻の波) */}
        {[[820, 640], [1560, 620], [1700, 820], [980, 860]].map(([wx, wy], i) => (
          <g key={i} transform={`rotate(${f * 4 + i * 60} ${wx} ${wy})`}>
            <path d={`M ${wx} ${wy} m -30 0 a 30 30 0 1 1 30 30 a 18 18 0 1 1 -18 -18`} stroke={C.foam} strokeWidth={5} fill="none" />
          </g>
        ))}
        {/* 壊れた橋: 杭と傾いた橋板 */}
        {[760, 900, 1480, 1620].map((px, i) => (
          <g key={i}>
            <rect x={px - 14} y={470 + (i % 2) * 20} width={28} height={200} fill={C.bridge} stroke={KRP.ink} strokeWidth={5} transform={`rotate(${(i % 2 ? 6 : -5)} ${px} 670)`} />
            <path d={`M ${px - 30} 668 q 30 -14 60 0`} stroke={C.foam} strokeWidth={5} fill="none" />
          </g>
        ))}
        <rect x={690} y={470} width={260} height={26} fill={C.bridge} stroke={KRP.ink} strokeWidth={5} transform="rotate(-9 820 483)" />
        <rect x={1460} y={470} width={200} height={26} fill={C.bridge} stroke={KRP.ink} strokeWidth={5} transform="rotate(12 1560 483)" />
        {/* 流される橋板 */}
        {[0, 1, 2].map((i) => {
          const u = ((f * 4 + i * 260) % 780) / 780;
          const bx = 980 + u * 900, by = 720 + i * 70 + Math.sin(u * 9 + i) * 10;
          return <rect key={i} x={bx - 70} y={by - 12} width={140} height={24} fill={C.bridge} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${Math.sin(u * 7 + i) * 20} ${bx} ${by})`} />;
        })}
        {/* 赤鬼: 川から顔を出してにやり */}
        <NB1bBigFolk kind="oni" x={ox} y={oniFeet} s={1.6} f={f} pose="stand" gaze={[-7, 2]} />
        {/* 鬼の手前の水面 (体を隠す) */}
        <path d={`M 900 ${700 + Math.sin(f / 5) * 4} Q 1240 ${676 - up * 10} 1580 ${700 + Math.sin(f / 5 + 1) * 4} L 1620 1100 L 860 1100 Z`} fill={C.river} />
        <path d={`M 900 ${700 + Math.sin(f / 5) * 4} Q 1240 ${676 - up * 10} 1580 ${700 + Math.sin(f / 5 + 1) * 4}`} stroke={C.foam} strokeWidth={6} fill="none" />
        {/* 波紋と水しぶき */}
        {[0, 1, 2].map((i) => {
          const u = ((f + i * 12) % 36) / 36;
          return <ellipse key={i} cx={ox} cy={700} rx={160 + u * 220} ry={22 + u * 26} fill="none" stroke={C.foam} strokeWidth={5} opacity={(1 - u) * up} />;
        })}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <circle cx={ox + sd * 190} cy={692} r={28} fill={C.oniSkin} stroke={KRP.ink} strokeWidth={5} opacity={up} />
            <path d={`M ${ox + sd * 160} 700 q ${sd * 30} -40 ${sd * 60} 0`} stroke={C.foam} strokeWidth={5} fill="none" opacity={up} />
          </g>
        ))}
        {/* 左の川岸 */}
        <path d="M -200 545 Q 200 540 470 522 Q 580 700 660 1100 L -200 1100 Z" fill={C.bank} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => {
          const tx = -40 + rnd(423, i) * 560, ty = 690 + rnd(424, i) * 300;
          return <path key={i} d={`M ${tx} ${ty} l 6 -22 l 6 20 l 6 -26 l 6 28`} stroke={C.bankDark} strokeWidth={4} fill="none" />;
        })}
        {/* 道具箱 (のこぎり・木槌) */}
        <g transform="translate(560 710)">
          <rect x={-60} y={-40} width={120} height={50} fill={C.bridge} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -50 -40 L -20 -80 L 80 -70" stroke={KRP.ink} strokeWidth={5} fill="none" />
          <path d="M -20 -80 L 70 -72 L 66 -60 L -16 -68 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
          <rect x={10} y={-70} width={16} height={40} fill={C.log} stroke={KRP.ink} strokeWidth={3} transform="rotate(30 18 -50)" />
        </g>
        {/* 頭を抱える大工 */}
        <ellipse cx={330} cy={706} rx={80} ry={12} fill={KRP.ink} opacity={0.2} />
        <NB1bDaiku x={330} y={704} s={0.95} f={f} />
        {/* 雨 */}
        <g stroke={C.rain} strokeWidth={3} strokeLinecap="round" opacity={0.55}>
          {Array.from({ length: 80 }, (_, i) => {
            const rx = ((rnd(425, i) * 2300 + f * 10) % 2300) - 200;
            const ry = ((rnd(426, i) * 1100 + f * 40) % 1100) - 20;
            return <line key={i} x1={rx} y1={ry} x2={rx - 14} y2={ry + 56} />;
          })}
        </g>
        {/* 金のすやり霞 (上と下) */}
        <rect x={-200} y={-200} width={2320} height={330} fill={C.kinun} opacity={0.55} />
        {[-160, 220, 640, 1100, 1560].map((cx, i) => cloud(cx, 140 + (i % 2) * 16, 460, `t${i}`))}
        <rect x={-200} y={960} width={2320} height={300} fill={C.kinun} opacity={0.55} />
        {[-60, 400, 860, 1320, 1780].map((cx, i) => cloud(cx, 990 + (i % 2) * 14, 460, `b${i}`))}
        <TagPlate x={1660} y={210} text="日本" size={44} t={seg(f, 2, 10)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #43 ところがこの話、実は日本古来の昔話ではありません。
// 格: 並 / seed 4043
// 絵: #42 の絵巻が f で机の上の本になり、表紙に「日本の昔話」の札 → その札に赤い斜線とスタンプ「?」。机の上には古い童話集が積まれている。ランプの光
// どこ: 夜の書きもの机 (木目の天板・奥の本棚の影)。左に古い童話集の山、右に石油ランプと湯気の立つ湯のみ
// 演出: #42 の絵巻が巻物の姿で机に置かれ、ぽんと煙が立って和綴じの本に変わる (巻物は完全に消える)。
//       表紙の題箋「日本の昔話」に赤い斜線が引かれ、赤い「？」の丸ハンコがどんと押される
// 動き: 変身の煙 f6〜16 / 本が弾んで出る f10〜18 / 斜線 f20〜27 / ハンコ f30〜36 / ランプのゆらぎ・湯気 /
//       カメラは後半、題箋へ寄る
const Nm043: React.FC<{ f: number }> = ({ f }) => {
  const puff = seg(f, 6, 16);
  const scrollOn = f < 11;
  const book = pop(seg(f, 10, 18));
  const slash = seg(f, 20, 27);
  const stamp = seg(f, 30, 35);
  const fl = Math.sin(f / 2.7) * 0.5 + 0.5;
  const k = easeInOut(seg(f, 18, 42));
  const BOOK = "日本の昔話";
  return (
    <Frame f={f} seed={4043} dark bg={C.wallDark}>
      <defs>
        <radialGradient id="nb1b43lamp">
          <stop offset="0" stopColor={NP.glow} stopOpacity={0.5} />
          <stop offset="1" stopColor={NP.glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cam(lerp(960, 860, k), lerp(540, 470, k), lerp(1, 1.12, k))}>
        {/* 奥の壁と本棚の影 */}
        <rect x={-200} y={-200} width={2320} height={560} fill={C.wallDark} />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={-100 + i * 82} y={120 + rnd(430, i) * 60} width={60 + rnd(431, i) * 14} height={240 - rnd(430, i) * 60}
            fill={[C.bookBrown, C.bookRed, C.bookGreen, C.bookBlue][i % 4]} opacity={0.35} stroke={KRP.ink} strokeWidth={3} />
        ))}
        <rect x={-200} y={352} width={2320} height={14} fill={C.deskDark} />
        {/* 机の天板 */}
        <rect x={-200} y={360} width={2320} height={900} fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -200 ${420 + i * 90} q 520 ${rnd(432, i) * 30 - 15} 1060 0 q 540 ${rnd(433, i) * 30 - 15} 1260 0`} stroke={C.deskDark} strokeWidth={4} fill="none" opacity={0.6} />
        ))}
        <ellipse cx={1520} cy={500} rx={760} ry={460} fill="url(#nb1b43lamp)" opacity={0.8 + fl * 0.2} />
        {/* 古い童話集の山 (左) */}
        {[[C.bookRed, 760, 380], [C.bookGreen, 680, 340], [C.bookBrown, 610, 360], [C.bookBlue, 540, 320], [C.bookRed, 470, 300]].map(([col, by, bw], i) => (
          <g key={i} transform={`rotate(${(i % 2 ? 2 : -2)} 300 ${by})`}>
            <rect x={300 - (bw as number) / 2} y={(by as number) - 60} width={bw as number} height={62} rx={6} fill={col as string} stroke={KRP.ink} strokeWidth={5} />
            <rect x={300 - (bw as number) / 2 + 6} y={(by as number) - 8} width={(bw as number) - 12} height={10} fill={C.slip} />
            <line x1={300 - (bw as number) / 2 + 30} y1={(by as number) - 30} x2={300 + (bw as number) / 2 - 30} y2={(by as number) - 30} stroke={C.gold} strokeWidth={4} />
          </g>
        ))}
        {/* 巻物 (変身前) */}
        {scrollOn && (
          <g opacity={1 - seg(f, 8, 11)}>
            <rect x={700} y={460} width={520} height={130} rx={10} fill={C.washi} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 720 500 q 60 -20 120 0 q 60 -20 120 0" stroke={C.kinunDark} strokeWidth={6} fill="none" />
            <path d="M 760 560 q 80 -24 180 0" stroke={C.river} strokeWidth={8} fill="none" />
            <circle cx={1060} cy={540} r={20} fill={C.oniSkin} stroke={KRP.ink} strokeWidth={3} />
            <rect x={1200} y={440} width={50} height={170} rx={20} fill={C.bridge} stroke={KRP.ink} strokeWidth={5} />
            <path d="M 1250 520 q 40 10 30 50" stroke={KRP.red} strokeWidth={6} fill="none" />
          </g>
        )}
        {/* 変身の煙 */}
        {puff > 0 && puff < 1 && (
          <g opacity={1 - puff}>
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2;
              return <circle key={i} cx={960 + Math.cos(a) * (100 + 200 * puff)} cy={520 + Math.sin(a) * (60 + 130 * puff)} r={50 + 30 * puff} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={4} />;
            })}
          </g>
        )}
        {/* 和綴じの本 */}
        {book > 0 && (
          <g transform={`translate(960 500) scale(${book}) rotate(-3) translate(-960 -500)`}>
            <rect x={712} y={196} width={500} height={640} rx={6} fill={KRP.ink} opacity={0.3} />
            <rect x={700} y={180} width={500} height={640} rx={6} fill={C.slip} stroke={KRP.ink} strokeWidth={5} />
            <rect x={704} y={176} width={496} height={640} rx={6} fill={C.bookBlue} stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 30 }, (_, i) => (
              <path key={i} d={`M ${720 + rnd(434, i) * 400} ${200 + rnd(435, i) * 600} l 18 6`} stroke={KRP.blueDeep} strokeWidth={3} opacity={0.5} />
            ))}
            {/* 綴じ糸 (右側) */}
            <line x1={1150} y1={176} x2={1150} y2={816} stroke={C.slip} strokeWidth={3} opacity={0.6} />
            {[250, 400, 590, 740].map((sy) => (
              <g key={sy}>
                <circle cx={1170} cy={sy} r={6} fill={KRP.ink} />
                <path d={`M 1170 ${sy} L 1200 ${sy} M 1170 ${sy} L 1170 ${sy - 30}`} stroke={C.slip} strokeWidth={5} />
              </g>
            ))}
            {/* 題箋「日本の昔話」 (縦書き) */}
            <rect x={740} y={216} width={110} height={420} fill={C.slip} stroke={KRP.ink} strokeWidth={5} />
            <rect x={750} y={226} width={90} height={400} fill="none" stroke={C.kinunDark} strokeWidth={2} />
            {Array.from(BOOK).map((ch, i) => (
              <text key={i} x={795} y={296 + i * 76} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={NP.sumi}>{ch}</text>
            ))}
            {/* 赤い斜線 */}
            {slash > 0 && (
              <line x1={722} y1={206} x2={722 + (146 * slash)} y2={206 + 440 * slash} stroke={KRP.red} strokeWidth={16} strokeLinecap="round" opacity={0.92} />
            )}
          </g>
        )}
        {/* 「？」の丸ハンコ */}
        {stamp > 0 && (
          <g transform={`translate(990 470) scale(${lerp(1.6, 1, easeOut(stamp))}) rotate(-12)`} opacity={0.92 * Math.min(1, stamp * 2)}>
            <circle r={96} fill="none" stroke={KRP.red} strokeWidth={10} />
            <circle r={80} fill="none" stroke={KRP.red} strokeWidth={4} />
            <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill={KRP.red}>？</text>
          </g>
        )}
        {/* ランプ (右) */}
        <g transform="translate(1560 640)">
          <ellipse cx={0} cy={20} rx={110} ry={22} fill={KRP.ink} opacity={0.3} />
          <path d="M -70 20 L -50 -60 L 50 -60 L 70 20 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-70} rx={70} ry={20} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -40 -80 Q -64 -170 -30 -260 L 30 -260 Q 64 -170 40 -80 Z" fill={C.lampGlass} opacity={0.75} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M -14 -100 Q -18 -${140 + fl * 14} 0 -${170 + fl * 16} Q 18 -${140 + fl * 14} 14 -100 Z`} fill={C.fire} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -6 -104 Q 0 -140 6 -104 Z" fill={C.fireCore} />
          <path d="M -36 -250 Q -20 -200 -30 -120" stroke={KRP.white} strokeWidth={5} opacity={0.5} fill="none" />
        </g>
        {/* 湯のみと湯気 */}
        <g transform="translate(1400 760)">
          <path d="M -46 -70 L 46 -70 L 36 0 L -36 0 Z" fill={C.slip} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -40 -40 L 40 -40" stroke={C.bookGreen} strokeWidth={8} />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${-14 + i * 26} -84 q ${10 * Math.sin(f / 6 + i)} -30 0 -60 q ${-10 * Math.sin(f / 6 + i)} -30 0 -60`} stroke={KRP.white} strokeWidth={5} fill="none" opacity={0.5} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #44 大正時代に、北欧の伝説を、日本風に書きかえたものだと分かっています。
// 格: 山 / seed 4044
// 絵: 大正時代の翻訳家の書斎 (洋館の窓・ステンドグラス・丸眼鏡と着物の Person の後ろ姿・机に洋書と原稿用紙)。洋書から北欧の絵 (巨人と教会) が光の帯になって原稿用紙に流れこみ、和紙の絵 (鬼と橋) に変わる。札「大正時代」「北欧」
// どこ: 大正時代の翻訳家の洋館の書斎 (夕方の上げ下げ窓とステンドグラス・緑のカーテン・本棚・振り子時計・緑の笠のランプ)
// 演出: 着物に丸眼鏡の翻訳家の後ろ姿 (顔は見せない)。左の書見台の洋書には北欧の巨人と教会の挿絵。
//       そのページから光の帯が立ちのぼり、頭の上を越えて右の原稿用紙へ流れこむ。原稿の上に和紙の絵 (鬼と橋) が浮かぶ。
//       巨人と鬼・教会と橋は同じ構図・同じポーズで、色と飾りだけが違う
// 動き: ページの光 f2〜10 / 光の帯が f10〜30 で伸び、光の粒が流れる / 和紙の絵が f24〜36 で浮かぶ /
//       振り子がゆれる / ペン先が動く / カメラはゆっくり寄る
const NB1bChurch: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-110} width={140} height={110} fill={C.bookBrown} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -90 -100 L 0 -180 L 90 -100 Z" fill={C.logDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -40 -170 L 0 -250 L 40 -170 Z" fill={C.logDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-24} y={-190} width={48} height={30} fill={C.bookBrown} stroke={KRP.ink} strokeWidth={4} />
    <line x1={0} y1={-250} x2={0} y2={-290} stroke={KRP.ink} strokeWidth={6} />
    <line x1={-16} y1={-276} x2={16} y2={-276} stroke={KRP.ink} strokeWidth={6} />
    <path d="M -20 0 L -20 -50 Q 0 -70 20 -50 L 20 0 Z" fill={C.wallDark} />
    {[-1, 1].map((d) => <path key={d} d={`M ${d * 90} -100 q ${d * 14} -6 ${d * 18} -24`} stroke={KRP.ink} strokeWidth={5} fill="none" />)}
  </g>
);
const NB1bBridge: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -130 40 Q 0 60 130 40 L 130 70 L -130 70 Z" fill={C.river} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -110 40 Q 0 -60 110 40" stroke={KRP.red} strokeWidth={18} fill="none" />
    <path d="M -110 40 Q 0 -60 110 40" stroke={KRP.ink} strokeWidth={4} fill="none" />
    {[-60, -20, 20, 60].map((px) => <line key={px} x1={px} y1={-6 + Math.abs(px) * 0.4} x2={px} y2={48} stroke={KRP.ink} strokeWidth={6} />)}
    <path d="M -110 -10 Q 0 -100 110 -10" stroke={KRP.red} strokeWidth={8} fill="none" />
    <path d="M -110 -10 Q 0 -100 110 -10" stroke={KRP.ink} strokeWidth={2.5} fill="none" />
  </g>
);
const Nm044: React.FC<{ f: number }> = ({ f }) => {
  const page = seg(f, 2, 10);
  const band = easeInOut(seg(f, 10, 30));
  const washi = pop(seg(f, 24, 36));
  const k = easeInOut(seg(f, 0, 42));
  const swing = Math.sin(f / 9) * 12;
  // 光の帯の道すじ (書見台のページ → 頭の上 → 原稿用紙)
  const B0: [number, number] = [520, 470], B1: [number, number] = [960, 120], B2: [number, number] = [1360, 470];
  const bz = (u: number): [number, number] => [
    (1 - u) * (1 - u) * B0[0] + 2 * (1 - u) * u * B1[0] + u * u * B2[0],
    (1 - u) * (1 - u) * B0[1] + 2 * (1 - u) * u * B1[1] + u * u * B2[1],
  ];
  const bandPath = Array.from({ length: 31 }, (_, i) => { const [x, y] = bz((i / 30) * band); return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`; }).join(" ");
  return (
    <Frame f={f} seed={4044} bg={C.wallpaper}>
      <defs>
        <linearGradient id="nb1b44sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.eve2} />
          <stop offset="1" stopColor={C.eve} />
        </linearGradient>
      </defs>
      <g transform={cam(960, 500, lerp(1, 1.05, k))}>
        {/* 壁紙と腰板 */}
        <rect x={-200} y={-200} width={2320} height={1500} fill={C.wallpaper} />
        {Array.from({ length: 14 * 9 }, (_, i) => (
          <path key={i} d={`M ${(i % 14) * 140 + ((Math.floor(i / 14) % 2) * 70)} ${Math.floor(i / 14) * 70 + 20} l 10 12 l -10 12 l -10 -12 Z`} fill={C.wallpaperDot} opacity={0.6} />
        ))}
        <rect x={-200} y={600} width={2320} height={700} fill={C.wainscot} />
        <line x1={-200} y1={600} x2={2120} y2={600} stroke={KRP.ink} strokeWidth={6} />
        {/* 窓とステンドグラス */}
        <rect x={690} y={70} width={540} height={520} fill={C.wainscot} stroke={KRP.ink} strokeWidth={7} />
        <rect x={720} y={250} width={480} height={320} fill="url(#nb1b44sky)" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1000 560 Q 1060 520 1200 530 L 1200 570 L 720 570 L 720 540 Q 860 500 1000 560 Z" fill={C.curtainGDark} opacity={0.5} />
        <path d="M 960 250 L 960 570 M 720 410 L 1200 410" stroke={C.wainscot} strokeWidth={12} />
        <path d="M 720 236 L 720 170 Q 960 60 1200 170 L 1200 236 Z" fill={C.glassY} stroke={KRP.ink} strokeWidth={5} />
        {[C.glassR, C.glassB, C.glassG, C.glassB, C.glassR].map((col, i) => {
          const a0 = Math.PI * (1 + i / 5), a1 = Math.PI * (1 + (i + 1) / 5);
          return <path key={i} d={`M 960 236 L ${960 + Math.cos(a0) * 230} ${236 + Math.sin(a0) * 150} L ${960 + Math.cos(a1) * 230} ${236 + Math.sin(a1) * 150} Z`} fill={col} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />;
        })}
        <circle cx={960} cy={236} r={36} fill={C.glassY} stroke={KRP.ink} strokeWidth={4} />
        {/* カーテン */}
        <path d="M 620 50 Q 700 330 640 600 L 740 600 Q 760 300 720 50 Z" fill={C.curtainG} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1300 50 Q 1220 330 1280 600 L 1180 600 Q 1160 300 1200 50 Z" fill={C.curtainG} stroke={KRP.ink} strokeWidth={5} />
        <rect x={600} y={40} width={720} height={20} rx={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 本棚 (左) */}
        <rect x={40} y={110} width={300} height={500} fill={C.wainscot} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={58 + i * 34} y={130 + r * 120 + rnd(440, r * 8 + i) * 20} width={28} height={96 - rnd(440, r * 8 + i) * 20}
                fill={[C.bookRed, C.bookGreen, C.bookBrown, C.bookBlue][(i + r) % 4]} stroke={KRP.ink} strokeWidth={3} />
            ))}
            <rect x={40} y={226 + r * 120} width={300} height={10} fill={C.cabDark} />
          </g>
        ))}
        {/* 振り子時計 (右) */}
        <g transform="translate(1720 100)">
          <rect x={-90} y={0} width={180} height={500} rx={10} fill={C.wainscot} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={0} cy={90} r={66} fill={C.slip} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={Math.cos((i / 12) * Math.PI * 2) * 52} cy={90 + Math.sin((i / 12) * Math.PI * 2) * 52} r={4} fill={KRP.ink} />)}
          <line x1={0} y1={90} x2={0} y2={50} stroke={KRP.ink} strokeWidth={5} /><line x1={0} y1={90} x2={34} y2={100} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-60} y={180} width={120} height={290} fill={C.cabDark} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${swing} 0 190)`}>
            <line x1={0} y1={190} x2={0} y2={420} stroke={NP.brassDark} strokeWidth={6} />
            <circle cx={0} cy={420} r={30} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {/* 机の天板 (翻訳家の向こう側) */}
        <path d="M 240 640 L 1680 640 L 1720 720 L 200 720 Z" fill={C.desk} stroke={KRP.ink} strokeWidth={6} />
        <rect x={200} y={720} width={1520} height={30} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        {/* 書見台の洋書 (北欧の挿絵) */}
        <path d="M 380 660 L 400 620 L 660 620 L 680 660 Z" fill={C.deskDark} stroke={KRP.ink} strokeWidth={4} />
        <g>
          {page > 0 && <ellipse cx={520} cy={520} rx={220 * (0.8 + 0.2 * page)} ry={140} fill={NP.glow} opacity={0.35 * page} />}
          <path d="M 360 640 L 380 420 L 520 440 L 520 650 Z" fill={C.slip} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 520 650 L 520 440 L 660 420 L 680 640 Z" fill={C.slip} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={396} y1={460 + i * 24} x2={500} y2={462 + i * 24} stroke={KRP.grayDark} strokeWidth={4} />)}
          <g transform="translate(600 610) scale(0.36)">
            <NB1bBigFolk kind="kyojin" x={-90} y={0} s={1} f={f} />
            <NB1bChurch x={110} y={0} s={0.8} />
          </g>
          <rect x={354} y={636} width={330} height={18} fill={C.bookRed} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 原稿用紙とインク壺 (右) */}
        <path d="M 1180 650 L 1210 600 L 1520 600 L 1540 650 Z" fill={C.genko} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={1220 + i * 34} y1={604} x2={1206 + i * 36} y2={646} stroke={C.genkoLine} strokeWidth={2.5} />)}
        <line x1={1200} y1={624} x2={1530} y2={624} stroke={C.genkoLine} strokeWidth={2.5} />
        <path d="M 1560 640 L 1570 600 L 1610 600 L 1620 640 Z" fill={C.hairBlack} stroke={KRP.ink} strokeWidth={4} />
        {/* 緑の笠のランプ */}
        <g transform="translate(1620 640)">
          <rect x={-8} y={-110} width={16} height={110} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -70 -110 L 70 -110 L 50 -150 L -50 -150 Z" fill={C.lampShade} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-96} rx={60} ry={14} fill={NP.glow} opacity={0.6} />
        </g>
        {/* 光の帯 (北欧の絵 → 原稿用紙) */}
        {band > 0 && (
          <g>
            <path d={bandPath} stroke={NP.glow} strokeWidth={70} fill="none" strokeLinecap="round" opacity={0.3} />
            <path d={bandPath} stroke={NP.glowCore} strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.85} />
            {Array.from({ length: 10 }, (_, i) => {
              const u = ((f * 0.025 + i / 10) % 1) * band;
              const [px, py] = bz(u);
              return <circle key={i} cx={px + Math.sin(f / 3 + i) * 10} cy={py + Math.cos(f / 3 + i) * 10} r={7} fill={KRP.white} opacity={0.9} />;
            })}
            {/* 帯の中を運ばれる巨人と教会の影 */}
            {band < 1 && (() => { const [px, py] = bz(band * 0.9); return (
              <g opacity={0.5} transform={`translate(${px} ${py}) scale(0.22)`}>
                <circle cx={-80} cy={-200} r={70} fill={C.kyojinHair} />
                <path d="M 60 0 L 140 -150 L 220 0 Z" fill={C.logDark} />
              </g>
            ); })()}
          </g>
        )}
        {/* 原稿の上に浮かぶ和紙の絵 (鬼と橋) */}
        {washi > 0 && (
          <g transform={`translate(1380 410) scale(${washi}) rotate(2)`}>
            <rect x={-170} y={-150} width={340} height={260} fill={NP.glow} opacity={0.35} rx={20} />
            <rect x={-150} y={-130} width={300} height={220} fill={C.washi} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-150} y={-130} width={300} height={34} fill={C.kinun} opacity={0.7} />
            <g transform="translate(0 76) scale(0.5)">
              <NB1bBigFolk kind="oni" x={-140} y={0} s={1} f={f} />
              <NB1bBridge x={150} y={-40} s={0.85} />
            </g>
          </g>
        )}
        {/* 翻訳家の後ろ姿 (着物・丸眼鏡のつる・右手でペン) */}
        <g transform="translate(960 830)">
          <Person x={0} y={0} s={1.15} f={f} still cloth={C.kimono} clothDark={C.kimonoDark} pose="point" pointDir={1} />
          <g transform="scale(1.15)">
            <circle cx={0} cy={-228} r={64} fill={C.hairBlack} stroke={KRP.ink} strokeWidth={5.5} />
            <path d="M -40 -270 Q 0 -290 40 -270" stroke={KRP.white} strokeWidth={5} opacity={0.2} fill="none" />
            {[-1, 1].map((d) => (
              <g key={d}>
                <ellipse cx={d * 64} cy={-222} rx={9} ry={15} fill={C.skin} stroke={KRP.ink} strokeWidth={4} />
                <path d={`M ${d * 66} -234 L ${d * 76} -226`} stroke={KRP.ink} strokeWidth={4} />
              </g>
            ))}
            <path d="M -22 -160 L 0 -128 L 22 -160" stroke={C.kimonoDark} strokeWidth={12} fill="none" />
            <line x1={0} y1={-126} x2={0} y2={-56} stroke={C.kimonoDark} strokeWidth={4} />
            <rect x={-58} y={-92} width={116} height={22} fill={C.kimonoDark} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -80 -150 L -80 -70 Q -80 -50 -100 -50 L -104 -50 Q -110 -110 -96 -150 Z" fill={C.kimono} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 160 -148 L 196 -176" stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
            <circle cx={196 + Math.sin(f / 2) * 3} cy={-176} r={4} fill={KRP.ink} />
          </g>
        </g>
        {/* 椅子の背 (手前) */}
        <path d="M 812 1100 L 822 800 Q 960 760 1098 800 L 1108 1100 Z" fill={C.chair} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 850 1100 L 856 830 Q 960 800 1064 830 L 1070 1100" stroke={C.cabDark} strokeWidth={6} fill="none" />
        <path d="M 900 860 Q 960 840 1020 860 L 1020 1000 Q 960 980 900 1000 Z" fill={C.cabDark} opacity={0.6} />
        <path d="M 820 1100 L 830 820 Q 960 780 1090 820 L 1100 1100" stroke={KRP.ink} strokeWidth={4} fill="none" />
        <TagPlate x={1560} y={120} text="大正時代" size={38} t={seg(f, 0, 8)} />
        <TagPlate x={520} y={372} text="北欧" size={36} t={seg(f, 4, 12)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_036: (f) => <Nm036 f={f} />,
  nm_037: (f) => <Nm037 f={f} />,
  nm_038: (f) => <Nm038 f={f} />,
  nm_039: (f) => <Nm039 f={f} />,
  nm_040: (f) => <Nm040 f={f} />,
  nm_041: (f) => <Nm041 f={f} />,
  nm_042: (f) => <Nm042 f={f} />,
  nm_043: (f) => <Nm043 f={f} />,
  nm_044: (f) => <Nm044 f={f} />,
};

export const NM_B1B_MOTIFS: string[] = [
  "nm_036", // #36
  "nm_037", // #37
  "nm_038", // #38
  "nm_039", // #39
  "nm_040", // #40
  "nm_041", // #41
  "nm_042", // #42
  "nm_043", // #43
  "nm_044", // #44
];

export const namaeB1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
