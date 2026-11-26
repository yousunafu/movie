// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#121〜#132 (12文)
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, mixColor, SHIN,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  skyTop: "#8FC4E8",
  skyBot: "#E4F2F6",
  cloud: "#FFFFFF",
  pine: "#3E6B4A",
  pineDark: "#2B4F37",
  grass: "#8DB46A",
  grassDark: "#6A9150",
  earth: "#CDB68A",
  earthDark: "#A8916A",
  water: "#79AECB",
  waterDark: "#5B8EAD",
  kawara: "#56606E",
  kawaraDark: "#3E4652",
  kawaraLight: "#77818F",
  plaster: "#F1EBDD",
  plasterShade: "#D9CFBD",
  noren: "#2F4A7A",
  stucco: "#EFE7D6",
  hatBlack: "#2A2626",
  hatBand: "#5A4A3E",
  indigo: "#34467A",
  indigoDark: "#253360",
  graySuit: "#6B6F78",
  graySuitDark: "#4E525A",
  red: "#C8504A",
  redDark: "#963A36",
  pink: "#E48FA6",
  pinkDark: "#B86A80",
  enji: "#9A3446",
  enjiDark: "#6E2433",
  obi: "#E3B04B",
  obiDark: "#B8862E",
  hair: "#2A2420",
  brownHair: "#7A4A2A",
  soldier: "#2C3550",
  soldierDark: "#1E2640",
  cannon: "#2E3034",
  cannonHi: "#55595F",
  sandbag: "#C9B07C",
  sandbagDark: "#9E8656",
  smoke: "#F4F2EE",
  smokeShade: "#D6D2CA",
  flash: "#FFD54A",
  washi: "#EFE3C6",
  washiDark: "#D9C9A4",
  washiFiber: "#C9B78E",
  deskWood: "#8A5A3A",
  deskWoodDark: "#6B4329",
  fusuma: "#E9DFC6",
  fusumaFrame: "#3A2E26",
  dayCell: "#F6DFA0",
  nightCell: "#5A6390",
  nightCellLight: "#7A83AE",
  shu: "#C43A2C",
  sea: "#A9C4C8",
  seaLine: "#7FA3A8",
  land: "#E8D9B0",
  landDark: "#C9B585",
  light: "#FFF0A8",
  pole: "#6E5A48",
  tram: "#3F7A5A",
  tramDark: "#2C5A40",
  tramWin: "#F3E6B8",
  poster: "#FBF4E2",
  happi: "#2F4A7A",
  gakuran: "#23252B",
  bread: "#E2A95A",
  breadDark: "#B67C35",
  dust: "#D8C9A8",
  cat: "#E8A04E",
  catDark: "#B87530",
  sun: "#FFD45E",
  sunRay: "#F5B53C",
  cart: "#B5814F",
  cartDark: "#7B5331",
  furoshiki: "#D8432F",
  furoshikiDark: "#A12D1E",
  brainWall: "#F2B8C0",
  brainWallDark: "#DE939F",
  brainWallLight: "#F8D4D8",
  tube: "#E79AA6",
  tubeDark: "#C77482",
  beam: "#FFF3B8",
  rift: "#C2321F",
  riftDeep: "#5E140C",
  townNight: "#2A3152",
  roofNight: "#3B4360",
  roofNightLight: "#525B7C",
  wallNight: "#5B3E3A",
  wallNightLight: "#714D46",
  winDark: "#1C2036",
  zzz: "#C9D4F2",
  shadow: "#10142A",
  wire: "#8A8F99",
} as const;
void W; void H; void PersonMini; void Stamp; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void SumahoAlarm; void Shudouin; void TokiNoKane;
void BanninTou; void KnockerUp; void BellClock; void Clocky; void NazoBell;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
const INK = KRP.ink;
type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "hang" | "sit";

// Person と同じ体ゆれ
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;
// Person のローカル座標 (足元が原点・頭の中心が (0,-228)) で小物を重ねる
const MzFOn: React.FC<{ x: number; y: number; s: number; f: number; phase?: number; lean?: number; still?: boolean; children?: React.ReactNode }> = ({ x, y, s, f, phase = 0, lean = 0, still, children }) => (
  <g transform={`translate(${x} ${y + (still ? 0 : bobOf(f, phase))}) scale(${s}) rotate(${lean})`}>{children}</g>
);

// ----- 帽子・髪 (Person のローカル座標) -----
type Hat = "none" | "bowler" | "kepi" | "gakusei" | "hachimaki" | "tophat";
const MzFHat: React.FC<{ kind: Hat }> = ({ kind }) => {
  if (kind === "bowler") return (
    <g>
      <path d="M -50 -270 Q -52 -336 0 -338 Q 52 -336 50 -270 Z" fill={C.hatBlack} stroke={INK} strokeWidth={5} />
      <rect x={-50} y={-288} width={100} height={12} fill={C.hatBand} />
      <ellipse cx={0} cy={-268} rx={80} ry={13} fill={C.hatBlack} stroke={INK} strokeWidth={5} />
      <path d="M -30 -322 Q -14 -332 4 -330" stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.35} />
    </g>
  );
  if (kind === "tophat") return (
    <g>
      <rect x={-46} y={-372} width={92} height={104} rx={6} fill={C.hatBlack} stroke={INK} strokeWidth={5} />
      <rect x={-46} y={-292} width={92} height={14} fill={C.hatBand} />
      <ellipse cx={0} cy={-268} rx={78} ry={12} fill={C.hatBlack} stroke={INK} strokeWidth={5} />
    </g>
  );
  if (kind === "kepi") return (
    <g>
      <path d="M -50 -262 L -44 -330 L 44 -330 L 50 -262 Z" fill={C.soldier} stroke={INK} strokeWidth={5} />
      <rect x={-50} y={-284} width={100} height={16} fill={KRP.red} stroke={INK} strokeWidth={3} />
      <circle cx={0} cy={-306} r={9} fill={KRP.yellow} stroke={INK} strokeWidth={3} />
      <path d="M -54 -264 Q 0 -246 66 -262 L 62 -270 Q 0 -258 -54 -270 Z" fill={INK} />
    </g>
  );
  if (kind === "gakusei") return (
    <g>
      <path d="M -60 -258 Q -62 -300 0 -304 Q 62 -300 60 -258 Z" fill={C.gakuran} stroke={INK} strokeWidth={5} />
      <rect x={-68} y={-316} width={136} height={16} rx={5} fill={C.gakuran} stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={-282} r={8} fill={KRP.brass} stroke={INK} strokeWidth={3} />
      <path d="M -50 -262 Q 0 -242 62 -258 L 58 -266 Q 0 -254 -50 -268 Z" fill={INK} />
    </g>
  );
  if (kind === "hachimaki") return (
    <g>
      <rect x={-66} y={-266} width={132} height={16} rx={6} fill={KRP.white} stroke={INK} strokeWidth={4} />
      <path d="M 60 -262 l 22 -14 l 2 12 z M 60 -258 l 26 6 l -6 10 z" fill={KRP.white} stroke={INK} strokeWidth={3} />
    </g>
  );
  return null;
};
// 日本髪 (結った髪のかたまり。Person の hair="none" の上に描く)
const MzFNihongami: React.FC = () => (
  <g>
    <path d="M -62 -236 Q -66 -292 0 -296 Q 66 -292 62 -236 Q 30 -258 0 -258 Q -30 -258 -62 -236 Z" fill={C.hair} />
    <ellipse cx={-64} cy={-240} rx={15} ry={26} fill={C.hair} stroke={INK} strokeWidth={3} />
    <ellipse cx={64} cy={-240} rx={15} ry={26} fill={C.hair} stroke={INK} strokeWidth={3} />
    <ellipse cx={0} cy={-288} rx={58} ry={18} fill={C.hair} stroke={INK} strokeWidth={3} />
    <ellipse cx={0} cy={-316} rx={46} ry={26} fill={C.hair} stroke={INK} strokeWidth={4} />
    <path d="M -46 -316 Q 0 -330 46 -316" stroke="#4A3E36" strokeWidth={4} fill="none" />
    {/* くし・かんざし */}
    <path d="M -34 -300 Q 0 -312 34 -300" stroke={C.obi} strokeWidth={8} fill="none" strokeLinecap="round" />
    <line x1={22} y1={-322} x2={72} y2={-346} stroke={C.obiDark} strokeWidth={4} strokeLinecap="round" />
    <circle cx={74} cy={-347} r={8} fill={KRP.red} stroke={INK} strokeWidth={3} />
  </g>
);
// 後ろで結んだ茶色の髪の房 (作業着の女性)
const MzFPonytail: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <path d="M -62 -236 Q -66 -294 0 -298 Q 66 -294 62 -236 Q 30 -260 0 -260 Q -30 -260 -62 -236 Z" fill={C.brownHair} />
    <path d={`M 50 -270 Q 96 ${-262 + Math.sin(f / 6) * 4} 92 ${-212 + Math.sin(f / 6) * 6} Q 80 -226 58 -246 Z`} fill={C.brownHair} stroke={INK} strokeWidth={3.5} />
    <circle cx={56} cy={-262} r={7} fill={KRP.red} stroke={INK} strokeWidth={2.5} />
  </g>
);
// 着物のえり・帯・すそ (Person のローカル座標)。long=くるぶしまで (女性)
const MzFKimono: React.FC<{ cloth: string; dark: string; obi?: string; long?: boolean; hem?: number }> = ({ cloth, dark, obi = C.obi, long = false, hem }) => {
  const bottom = hem ?? (long ? -8 : -34);
  const wB = long ? 72 : 62;
  return (
    <g>
      <path d={`M -56 -98 L 56 -98 L ${wB} ${bottom} L ${-wB} ${bottom} Z`} fill={cloth} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M 18 -98 L ${wB * 0.42} ${bottom}`} stroke={dark} strokeWidth={4} />
      <path d="M -30 -160 L 4 -108 M 30 -160 L -2 -112" stroke={KRP.white} strokeWidth={9} strokeLinecap="round" />
      <path d="M -30 -160 L 4 -108 M 30 -160 L -2 -112" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      <rect x={-58} y={long ? -122 : -108} width={116} height={long ? 30 : 18} fill={obi} stroke={INK} strokeWidth={4} />
      {long && <rect x={-20} y={-126} width={40} height={38} rx={6} fill={obi} stroke={INK} strokeWidth={3.5} transform="translate(46 0)" />}
    </g>
  );
};

// 明治・大正の町の男の人 (着物+帽子)
const MzFMan: React.FC<{
  x: number; y: number; s: number; f: number; face?: Face; pose?: Pose; phase?: number; gaze?: [number, number]; lean?: number;
  cloth?: string; dark?: string; hat?: Hat; kimono?: boolean; pointDir?: 1 | -1; mustache?: boolean; glasses?: boolean;
}> = ({ x, y, s, f, face = "normal", pose = "stand", phase = 0, gaze = [0, 0], lean = 0, cloth = C.indigo, dark = C.indigoDark, hat = "bowler", kimono = true, pointDir = 1, mustache, glasses }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} face={face} pose={pose} phase={phase} gaze={gaze} lean={lean} cloth={cloth} clothDark={dark} hair="cap" pointDir={pointDir} glasses={glasses} />
    <MzFOn x={x} y={y} s={s} f={f} phase={phase} lean={lean}>
      {kimono && <MzFKimono cloth={cloth} dark={dark} obi={C.hatBand} hem={pose === "run" ? -62 : -34} />}
      {mustache && <path d="M -22 -198 Q -10 -206 0 -198 Q 10 -206 22 -198 Q 12 -190 0 -196 Q -12 -190 -22 -198 Z" fill={C.hair} />}
      <MzFHat kind={hat} />
    </MzFOn>
  </g>
);
// 明治・大正の町の女の人 (着物と日本髪・くるぶしまでの着物)
const MzFWoman: React.FC<{
  x: number; y: number; s: number; f: number; face?: Face; pose?: Pose; phase?: number; gaze?: [number, number]; lean?: number;
  cloth?: string; dark?: string; hem?: number;
}> = ({ x, y, s, f, face = "normal", pose = "stand", phase = 0, gaze = [0, 0], lean = 0, cloth = C.red, dark = C.redDark, hem }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} face={face} pose={pose} phase={phase} gaze={gaze} lean={lean} cloth={cloth} clothDark={dark} hair="none" />
    <MzFOn x={x} y={y} s={s} f={f} phase={phase} lean={lean}>
      <MzFKimono cloth={cloth} dark={dark} long hem={hem} />
      <MzFNihongami />
    </MzFOn>
  </g>
);

// 丸い時計の文字盤 (h: 時 0〜12, m: 分)。sec があれば赤い秒針
const MzFClock: React.FC<{ x: number; y: number; r: number; h: number; m: number; sec?: number; face?: string; rim?: string; roman?: boolean }> = ({ x, y, r, h, m, sec, face = KRP.white, rim = MP.brass, roman = false }) => {
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  const R = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + r * 0.14} fill={rim} stroke={INK} strokeWidth={Math.max(3, r * 0.07)} />
      <circle r={r} fill={face} stroke={INK} strokeWidth={Math.max(2.5, r * 0.05)} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-r * 0.92} x2={0} y2={-r * (i % 3 === 0 ? 0.74 : 0.82)} stroke={INK} strokeWidth={Math.max(2, r * (i % 3 === 0 ? 0.06 : 0.035))} strokeLinecap="round" transform={`rotate(${i * 30})`} />
      ))}
      {roman && r > 40 && R.map((t, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <text key={i} x={Math.sin(a) * r * 0.6} y={-Math.cos(a) * r * 0.6 + r * 0.07} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={r * 0.2} fill={INK}>{t}</text>;
      })}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={INK} strokeWidth={Math.max(3, r * 0.09)} strokeLinecap="round" transform={`rotate(${ha})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={INK} strokeWidth={Math.max(2.5, r * 0.06)} strokeLinecap="round" transform={`rotate(${ma})`} />
      {sec !== undefined && <line x1={0} y1={r * 0.15} x2={0} y2={-r * 0.85} stroke={KRP.red} strokeWidth={Math.max(1.5, r * 0.03)} strokeLinecap="round" transform={`rotate(${sec * 6})`} />}
      <circle r={Math.max(3, r * 0.08)} fill={INK} />
    </g>
  );
};

// 空 (横じまの帯)
const MzFSky: React.FC<{ top: string; bot: string; h?: number; n?: number }> = ({ top, bot, h = 900, n = 12 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={-400} y={-60 + ((h + 60) / n) * i - 0.5} width={2800} height={(h + 60) / n + 1} fill={mixColor(top, bot, i / (n - 1))} />
    ))}
  </g>
);
// 雲 (丸の集まり)
const MzFCloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 30 Q -130 -10 -84 -18 Q -70 -62 -20 -50 Q 10 -86 56 -52 Q 104 -60 106 -14 Q 140 0 116 30 Z" fill={C.cloud} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -80 18 Q -20 26 60 18" stroke={KRP.blueSoft} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
// 瓦屋根の町家 (x0: 左端, y: 軒の高さ, w: 幅)
const MzFMachiya: React.FC<{ x: number; y: number; w: number; f: number; seed: number; noren?: string; two?: boolean }> = ({ x, y, w, f, seed, noren = C.noren, two = true }) => {
  const h1 = 170;
  const top = two ? y - 110 : y;
  return (
    <g>
      {/* 壁 */}
      <rect x={x} y={top} width={w} height={y + h1 - top} fill={C.plaster} stroke={INK} strokeWidth={5} />
      {two && (
        <g>
          {/* 2階の虫籠窓 */}
          <rect x={x + w * 0.2} y={top + 26} width={w * 0.6} height={50} fill={C.plasterShade} stroke={INK} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x + w * 0.2 + ((i + 1) * w * 0.6) / 7} y1={top + 26} x2={x + w * 0.2 + ((i + 1) * w * 0.6) / 7} y2={top + 76} stroke={INK} strokeWidth={3} />)}
          {/* 2階の屋根 */}
          <path d={`M ${x - 14} ${top} L ${x + w * 0.5} ${top - 46} L ${x + w + 14} ${top} Z`} fill={C.kawara} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <line x1={x + w * 0.5 - 40} y1={top - 40} x2={x + w * 0.5 + 40} y2={top - 40} stroke={C.kawaraDark} strokeWidth={9} strokeLinecap="round" />
        </g>
      )}
      {/* 1階のひさし (瓦) */}
      <path d={`M ${x - 20} ${y + 26} L ${x + w + 20} ${y + 26} L ${x + w + 6} ${y - 14} L ${x - 6} ${y - 14} Z`} fill={C.kawara} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {Array.from({ length: Math.floor(w / 22) }, (_, i) => <line key={i} x1={x - 4 + i * 22} y1={y - 12} x2={x - 12 + i * 22} y2={y + 24} stroke={C.kawaraLight} strokeWidth={3} />)}
      {/* 格子戸と のれん */}
      <rect x={x + 12} y={y + 36} width={w - 24} height={h1 - 40} fill={C.deskWood} stroke={INK} strokeWidth={4} />
      {Array.from({ length: Math.floor((w - 24) / 16) }, (_, i) => <line key={i} x1={x + 20 + i * 16} y1={y + 36} x2={x + 20 + i * 16} y2={y + h1 - 4} stroke={C.deskWoodDark} strokeWidth={3} />)}
      <g transform={`translate(${x + w / 2} ${y + 30})`}>
        {[-1, 0, 1].map((k) => (
          <path key={k} d={`M ${k * w * 0.18 - w * 0.09} 0 L ${k * w * 0.18 + w * 0.09} 0 L ${k * w * 0.18 + w * 0.09 + Math.sin(f / 14 + seed + k) * 3} 64 L ${k * w * 0.18 - w * 0.09 + Math.sin(f / 14 + seed + k) * 3} 64 Z`} fill={noren} stroke={INK} strokeWidth={3.5} />
        ))}
        <circle cx={0} cy={30} r={12} fill="none" stroke={KRP.white} strokeWidth={4} />
      </g>
    </g>
  );
};
// 石垣 (x0〜x1, 上端 y)
const MzFIshigaki: React.FC<{ x0: number; x1: number; y: number; h: number; seed: number }> = ({ x0, x1, y, h, seed }) => {
  const rows = Math.ceil(h / 34);
  return (
    <g>
      <path d={`M ${x0} ${y} L ${x1} ${y} L ${x1 + h * 0.18} ${y + h} L ${x0 - h * 0.18} ${y + h} Z`} fill={MP.stone} stroke={INK} strokeWidth={5} />
      {Array.from({ length: rows }, (_, r) => {
        const yy = y + r * 34;
        const sx0 = x0 - (r * 34 * 0.18), sx1 = x1 + r * 34 * 0.18;
        const n = Math.floor((sx1 - sx0) / 52);
        return Array.from({ length: n }, (_, c) => (
          <rect key={`${r}-${c}`} x={sx0 + c * ((sx1 - sx0) / n) + (r % 2) * 10 + 3} y={yy + 3} width={(sx1 - sx0) / n - 6} height={28} rx={8}
            fill={(r + c + seed) % 3 === 0 ? MP.stoneLight : (r + c) % 3 === 1 ? MP.stone : MP.stoneDark} stroke={INK} strokeWidth={2.5} opacity={0.95} />
        ));
      })}
    </g>
  );
};
// 松の木 (x: 根元, y: 地面)
const MzFPine: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const sw = Math.sin(f / 30) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -14 0 Q -26 -90 6 -160 Q 30 -210 -10 -270 L 8 -276 Q 52 -210 26 -150 Q 4 -90 16 0 Z" fill={C.deskWood} stroke={INK} strokeWidth={5} />
      {([[-60, -170, 90], [50, -230, 80], [-30, -290, 70], [70, -130, 60]] as const).map(([cx, cy, rw], i) => (
        <g key={i} transform={`rotate(${sw * (i % 2 ? 1 : -1)} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rw} ry={rw * 0.38} fill={C.pine} stroke={INK} strokeWidth={5} />
          <path d={`M ${cx - rw * 0.6} ${cy - 4} Q ${cx} ${cy - rw * 0.3} ${cx + rw * 0.6} ${cy - 4}`} stroke={C.pineDark} strokeWidth={4} fill="none" />
        </g>
      ))}
    </g>
  );
};
// 驚きの線 (頭のまわり)
const MzFShock: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * pop(clamp01(t))})`} stroke={INK} strokeWidth={6} strokeLinecap="round">
      <line x1={-70} y1={-40} x2={-96} y2={-64} />
      <line x1={0} y1={-76} x2={0} y2={-108} />
      <line x1={70} y1={-40} x2={96} y2={-64} />
    </g>
  );
};
// 汗のしずく
const MzFSweat: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => (
  t <= 0 ? null : (
    <path transform={`translate(${x} ${y}) scale(${s * pop(clamp01(t))})`} d="M 0 -22 Q 14 0 0 10 Q -14 0 0 -22 Z" fill="#8EC3E6" stroke={INK} strokeWidth={3.5} />
  )
);
void rnd; void easeOut;

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #121 日本でも、明治のはじめに、時刻がそろいます。
// 格: 並 / seed 6121
// どこ: 明治はじめの東京の大通り。奥に石垣と堀と松 (外堀)、両側に瓦屋根の町家、右にれんがの洋館とガス灯。晴れ。
// 演出: 通りの真ん中に洋風の時計塔。文字盤がぴかっと光り、町の人 (男: 着物に山高帽 / 女: 着物に日本髪) が寄ってきて見上げる。人力車が横切る。
// 動き: f0-30 屋根の上を横パン / f26-40 文字盤がぴかっ / f0-36 人が寄ってきて見上げる / f40- 時計塔へ寄る / f8- 人力車が左から右へ
const MzFRickshaw: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const rot = x * 0.9;
  return (
    <g>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* かじ棒 (前の車夫まで) */}
        <path d="M 40 -150 L 250 -118" stroke={C.deskWoodDark} strokeWidth={12} strokeLinecap="round" />
        <path d="M 40 -150 L 250 -118" stroke={C.cart} strokeWidth={6} strokeLinecap="round" />
        {/* 座席と幌 */}
        <path d="M -110 -150 L 60 -150 L 50 -100 L -100 -100 Z" fill={C.indigoDark} stroke={INK} strokeWidth={5} />
        <path d="M -120 -150 Q -150 -300 -40 -310 L -20 -300 Q -110 -280 -96 -150 Z" fill={C.hatBlack} stroke={INK} strokeWidth={5} />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${-128 + i * 10} -170 Q ${-130 + i * 22} -270 ${-50 + i * 8} -300`} stroke="#4A4446" strokeWidth={3} fill="none" />)}
        <rect x={-100} y={-214} width={120} height={66} rx={10} fill={C.red} stroke={INK} strokeWidth={4} />
      </g>
      {/* 乗っている女の人 (座る) */}
      <MzFWoman x={x - 30 * s} y={y - 92 * s} s={s * 0.62} f={f} pose="sit" face="smile" phase={3} cloth={C.pink} dark={C.pinkDark} hem={-60} />
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* 大きな車輪 */}
        <g transform={`translate(-10 -70) rotate(${rot})`}>
          <circle r={70} fill="none" stroke={INK} strokeWidth={9} />
          <circle r={70} fill="none" stroke={C.cartDark} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={0} x2={0} y2={-68} stroke={INK} strokeWidth={3} transform={`rotate(${i * 30})`} />)}
          <circle r={12} fill={C.cart} stroke={INK} strokeWidth={4} />
        </g>
      </g>
      {/* 車夫 (半纏・はちまき・走る) */}
      <MzFMan x={x + 250 * s} y={y} s={s * 0.78} f={f} pose="run" face="smile" phase={5} cloth={C.happi} dark={C.indigoDark} hat="hachimaki" kimono={false} lean={8} />
    </g>
  );
};
const MzFClockTower: React.FC<{ x: number; y: number; f: number; glint: number }> = ({ x, y, f, glint }) => (
  <g transform={`translate(${x} 0)`}>
    {/* 胴 (しっくい+石の角) */}
    <rect x={-70} y={170} width={140} height={y - 170} fill={C.stucco} stroke={INK} strokeWidth={6} />
    {Array.from({ length: Math.floor((y - 170) / 40) }, (_, i) => (
      <g key={i}>
        <rect x={-70} y={170 + i * 40} width={i % 2 ? 22 : 32} height={40} fill={MP.stoneLight} stroke={INK} strokeWidth={3} />
        <rect x={i % 2 ? 48 : 38} y={170 + i * 40} width={i % 2 ? 22 : 32} height={40} fill={MP.stoneLight} stroke={INK} strokeWidth={3} />
      </g>
    ))}
    {/* 細長い窓とアーチの入口 */}
    {[430, 560].map((wy) => <path key={wy} d={`M -18 ${wy + 60} L -18 ${wy} Q 0 ${wy - 22} 18 ${wy} L 18 ${wy + 60} Z`} fill={C.kawaraDark} stroke={INK} strokeWidth={4} />)}
    <path d={`M -40 ${y} L -40 ${y - 90} Q 0 ${y - 140} 40 ${y - 90} L 40 ${y} Z`} fill={C.deskWood} stroke={INK} strokeWidth={5} />
    {/* 台座の段 */}
    <rect x={-96} y={y - 26} width={192} height={30} fill={MP.stone} stroke={INK} strokeWidth={5} />
    <rect x={-84} y={330} width={168} height={22} fill={MP.stone} stroke={INK} strokeWidth={4} />
    {/* 時計の部屋と屋根 (とんがり) */}
    <rect x={-86} y={170} width={172} height={170} fill={C.stucco} stroke={INK} strokeWidth={6} />
    <path d="M -100 172 L 0 40 L 100 172 Z" fill={C.waterDark} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -60 120 L 60 120" stroke={C.water} strokeWidth={4} />
    <line x1={0} y1={40} x2={0} y2={6} stroke={INK} strokeWidth={5} />
    <path d={`M 0 10 L ${26 + Math.sin(f / 9) * 4} 18 L 0 26 Z`} fill={KRP.red} stroke={INK} strokeWidth={3} />
    <MzFClock x={0} y={256} r={62} h={12} m={0} sec={Math.floor(f / 3) % 60} face={KRP.white} rim={MP.brass} roman />
    {/* ぴかっ */}
    {glint > 0 && (
      <g transform={`translate(-30 228) scale(${pop(clamp01(glint)) * (1 + 0.08 * Math.sin(f / 4))})`}>
        <circle r={120} fill={C.light} opacity={0.3} />
        <path d="M 0 -90 L 14 -14 L 90 0 L 14 14 L 0 90 L -14 14 L -90 0 L -14 -14 Z" fill={KRP.white} stroke={C.obi} strokeWidth={5} strokeLinejoin="round" />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={-110} x2={0} y2={-150} stroke={C.obi} strokeWidth={7} strokeLinecap="round" transform={`rotate(${i * 45 + 22})`} />)}
      </g>
    )}
  </g>
);
const Mz121: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 30));
  const zoom = easeInOut(seg(f, 40, 118));
  const tx = lerp(-240, 0, pan);
  const sc = 1 + 0.2 * zoom;
  const glint = seg(f, 26, 36);
  const walk = easeOut(seg(f, 0, 34));
  const look = f >= 24;
  const rx = lerp(-200, 2600, seg(f, 0, 123));
  const people: { x0: number; x1: number; kind: "m" | "w"; cloth: string; dark: string; phase: number; dir: 1 | -1 }[] = [
    { x0: 40, x1: 250, kind: "m", cloth: C.indigo, dark: C.indigoDark, phase: 1, dir: 1 },
    { x0: 160, x1: 470, kind: "w", cloth: C.red, dark: C.redDark, phase: 2, dir: 1 },
    { x0: 1900, x1: 1460, kind: "w", cloth: C.pink, dark: C.pinkDark, phase: 4, dir: -1 },
    { x0: 2100, x1: 1690, kind: "m", cloth: C.graySuit, dark: C.graySuitDark, phase: 6, dir: -1 },
  ];
  return (
    <Frame f={f} seed={6121} bg={C.skyBot}>
      <g transform={`translate(960 300) scale(${sc}) translate(-960 -300) translate(${tx} 0)`}>
        <MzFSky top={C.skyTop} bot={C.skyBot} h={560} />
        {[[200, 120, 1], [820, 80, 0.8], [1500, 140, 1.1], [2100, 90, 0.9]].map(([cx, cy, s], i) => <MzFCloud key={i} x={cx + ((f * 0.4) % 200) - 100} y={cy} s={s} />)}
        {/* 奥: 外堀の石垣・松・やぐら */}
        <MzFIshigaki x0={-300} x1={2400} y={410} h={90} seed={3} />
        {Array.from({ length: 11 }, (_, i) => <MzFPine key={i} x={-260 + i * 250 + (i % 2) * 60} y={416} s={0.5 + (i % 3) * 0.08} f={f + i * 9} />)}
        <g transform="translate(1720 410)">
          <rect x={-80} y={-90} width={160} height={90} fill={C.plaster} stroke={INK} strokeWidth={5} />
          <path d="M -104 -88 L 0 -150 L 104 -88 Z" fill={C.kawara} stroke={INK} strokeWidth={5} />
          {[-40, 0, 40].map((wx) => <rect key={wx} x={wx - 10} y={-64} width={20} height={26} fill={C.kawaraDark} stroke={INK} strokeWidth={3} />)}
        </g>
        <rect x={-400} y={500} width={2800} height={40} fill={C.water} stroke={INK} strokeWidth={4} />
        {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-380 + i * 96 + ((f * 0.8) % 96)} 520 q 12 -8 24 0`} stroke={KRP.white} strokeWidth={3} fill="none" opacity={0.7} />)}
        {/* 両側の町家 */}
        {[-300, -60, 180, 420, 620].map((mx, i) => <MzFMachiya key={mx} x={mx} y={600} w={i === 4 ? 180 : 220} f={f} seed={i} noren={i % 2 ? C.noren : C.enji} />)}
        {[1180].map((mx) => <MzFMachiya key={mx} x={mx} y={600} w={190} f={f} seed={7} noren={C.enji} />)}
        {/* れんがの洋館 */}
        <g>
          <rect x={1400} y={420} width={420} height={360} fill={MP.brick} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 18 }, (_, r) => <line key={r} x1={1400} y1={440 + r * 20} x2={1820} y2={440 + r * 20} stroke={MP.brickDark} strokeWidth={2} opacity={0.5} />)}
          <rect x={1386} y={404} width={448} height={24} fill={C.stucco} stroke={INK} strokeWidth={5} />
          {[1440, 1540, 1640, 1740].map((wx) => (
            <g key={wx}>
              <path d={`M ${wx} 560 L ${wx} 490 Q ${wx + 25} 462 ${wx + 50} 490 L ${wx + 50} 560 Z`} fill={C.stucco} stroke={INK} strokeWidth={4} />
              <path d={`M ${wx + 8} 556 L ${wx + 8} 494 Q ${wx + 25} 474 ${wx + 42} 494 L ${wx + 42} 556 Z`} fill={C.waterDark} />
              <rect x={wx} y={640} width={50} height={80} fill={C.waterDark} stroke={INK} strokeWidth={4} />
            </g>
          ))}
          <rect x={1560} y={700} width={100} height={80} fill={C.deskWoodDark} stroke={INK} strokeWidth={4} />
        </g>
        {/* 2400 側の町家 */}
        {[1860, 2100].map((mx, i) => <MzFMachiya key={mx} x={mx} y={600} w={220} f={f} seed={9 + i} />)}
        {/* 通り (土) */}
        <rect x={-400} y={780} width={2800} height={400} fill={C.earth} />
        <path d="M -400 780 L 2400 780" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 40 }, (_, i) => <ellipse key={i} cx={-380 + rnd(121, i) * 2780} cy={800 + rnd(122, i) * 260} rx={10 + rnd(123, i) * 14} ry={4} fill={C.earthDark} opacity={0.6} />)}
        {/* ガス灯 */}
        <g transform="translate(1280 0)">
          <rect x={-8} y={560} width={16} height={240} fill={MP.iron} stroke={INK} strokeWidth={4} />
          <path d="M -26 560 L 26 560 L 20 510 L -20 510 Z" fill={C.light} stroke={INK} strokeWidth={4} opacity={0.95} />
          <path d="M -30 512 L 0 488 L 30 512 Z" fill={MP.iron} stroke={INK} strokeWidth={4} />
          <rect x={-22} y={792} width={44} height={14} fill={MP.iron} stroke={INK} strokeWidth={4} />
        </g>
        {/* 時計塔 */}
        <MzFClockTower x={960} y={820} f={f} glint={glint} />
        {/* 人力車 (時計塔の手前を横切る) */}
        <MzFRickshaw x={rx} y={850} s={0.82} f={f} />
        {/* 町の人が寄ってきて見上げる */}
        {people.map((p, i) => {
          const px = lerp(p.x0, p.x1, walk);
          const face: Face = look ? (i === 3 ? "joy" : "surprised") : "normal";
          const gaze: [number, number] = look ? [p.dir * 4, -6] : [p.dir * 5, 0];
          const pose: Pose = look && i === 0 ? "raise" : walk < 1 ? "run" : "stand";
          return p.kind === "m"
            ? <MzFMan key={i} x={px} y={968} s={0.95} f={f} face={face} gaze={gaze} pose={pose} pointDir={1} phase={p.phase} cloth={p.cloth} dark={p.dark} lean={look ? -p.dir * 4 : 0} />
            : <MzFWoman key={i} x={px} y={968} s={0.95} f={f} face={face} gaze={gaze} pose={walk < 1 ? "run" : "stand"} phase={p.phase} cloth={p.cloth} dark={p.dark} lean={look ? -p.dir * 4 : 0} />;
        })}
        {people.map((p, i) => <MzFShock key={i} x={lerp(p.x0, p.x1, walk)} y={968 - 300 * 0.95} s={0.6} t={seg(f, 28 + i * 2, 36 + i * 2)} />)}
      </g>
      <TagPlate x={1700} y={200} text="明治・東京" size={40} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #122 1871年、東京で、正午に大砲を1発撃って、時刻を知らせはじめます。音から、「ドン」と呼ばれました。
// 格: 山 / seed 6122
// どこ: 1871年の東京。左はお城の石垣の上の砲台 (黒い大砲・木の車輪・土のう・松)、右下に町の瓦屋根が広がる。
// 演出: 兵士 (男・軍服と帽子) が懐中時計を見て、正午に縄を引く。大砲が「ドン!」と煙と衝撃の輪。画面がどんと揺れる。
//       輪が町に届くと、そば屋が手を止め、日本髪の女の人が飛び上がり、子どもが耳をふさぎ、猫が屋根から跳ねる。
// 動き: f0-24 時計を見る / f26 発射・揺れ / f26-60 輪が町へ / f30-44 町の人が順に反応 / f44- 遠くの町の人もぴょんぴょん・煙が流れる
const MzFRoofRow: React.FC<{ y: number; x0: number; n: number; w: number; s: number; seed: number }> = ({ y, x0, n, w, s, seed }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = x0 + i * w + (rnd(seed, i) - 0.5) * 20;
      const hh = 60 * s;
      return (
        <g key={i}>
          <rect x={x + 6} y={y} width={w - 12} height={70 * s} fill={i % 3 ? C.plaster : C.plasterShade} stroke={INK} strokeWidth={4} />
          <rect x={x + w * 0.35} y={y + 18 * s} width={w * 0.3} height={36 * s} fill={C.deskWoodDark} stroke={INK} strokeWidth={3} />
          <path d={`M ${x - 8} ${y + 4} L ${x + w * 0.5} ${y - hh} L ${x + w + 8} ${y + 4} Z`} fill={i % 2 ? C.kawara : C.kawaraLight} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <line x1={x + w * 0.5 - 30 * s} y1={y - hh + 6} x2={x + w * 0.5 + 30 * s} y2={y - hh + 6} stroke={C.kawaraDark} strokeWidth={8} strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);
const MzFCat: React.FC<{ x: number; y: number; s?: number; f: number; jump: number }> = ({ x, y, s = 1, f, jump }) => {
  const up = Math.sin(Math.PI * clamp01(jump)) * 90;
  const spiky = jump > 0 && jump < 1;
  return (
    <g transform={`translate(${x} ${y - up}) scale(${s})`}>
      <path d={`M 34 -20 Q 70 ${-50 + Math.sin(f / 5) * 8} 60 -80`} stroke={C.catDark} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={spiky ? "M -40 0 Q -44 -60 0 -62 Q 44 -60 40 0 Z" : "M -40 0 Q -40 -34 0 -36 Q 40 -34 40 0 Z"} fill={C.cat} stroke={INK} strokeWidth={4} />
      {spiky && Array.from({ length: 7 }, (_, i) => <line key={i} x1={-30 + i * 10} y1={-56} x2={-34 + i * 11} y2={-72} stroke={INK} strokeWidth={3} />)}
      <circle cx={-34} cy={-40} r={22} fill={C.cat} stroke={INK} strokeWidth={4} />
      <path d="M -52 -54 L -50 -76 L -38 -60 Z M -28 -60 L -18 -78 L -14 -56 Z" fill={C.cat} stroke={INK} strokeWidth={3} />
      <circle cx={-42} cy={-42} r={spiky ? 5 : 3} fill={INK} /><circle cx={-28} cy={-42} r={spiky ? 5 : 3} fill={INK} />
      {[-30, -10, 10, 30].map((lx) => <rect key={lx} x={lx - 5} y={-6} width={10} height={spiky ? 22 : 8} rx={4} fill={C.cat} stroke={INK} strokeWidth={3} />)}
    </g>
  );
};
const Mz122: React.FC<{ f: number }> = ({ f }) => {
  const FIRE = 26;
  const fired = f >= FIRE;
  const shakeK = 1 - seg(f, FIRE, FIRE + 18);
  const dx = fired ? Math.sin(f * 2.3) * 20 * shakeK : 0;
  const dy = fired ? Math.cos(f * 3.1) * 14 * shakeK : 0;
  const recoil = fired ? -34 * (1 - seg(f, FIRE + 2, FIRE + 16)) : 0;
  const flash = seg(f, FIRE, FIRE + 6);
  const don = seg(f, FIRE, FIRE + 8);
  const sx = 330, sy = 650, ss = 1.0; // 兵士
  const hand: [number, number] = [sx + 153 * ss, sy - 148 * ss];
  const muzzle: [number, number] = [870 + recoil, 486];
  const woman = seg(f, 33, 45);
  const catJ = seg(f, 35, 50);
  return (
    <Frame f={f} seed={6122} bg={C.skyBot}>
      <g transform={`translate(${dx} ${dy})`}>
        <MzFSky top={C.skyTop} bot={C.skyBot} h={700} />
        <circle cx={1500} cy={120} r={60} fill={C.sun} opacity={0.85} />
        {[[640, 110, 0.9], [1700, 230, 0.7]].map(([cx, cy, s], i) => <MzFCloud key={i} x={cx + f * 0.2} y={cy} s={s} />)}
        {/* 町の瓦屋根 (右下に広がる) */}
        <MzFRoofRow y={600} x0={760} n={10} w={130} s={0.7} seed={1} />
        <MzFRoofRow y={690} x0={700} n={9} w={150} s={0.85} seed={2} />
        <MzFRoofRow y={780} x0={640} n={8} w={180} s={1} seed={3} />
        {/* 火の見やぐら */}
        <g transform="translate(1810 600)">
          <path d="M -30 0 L -10 -160 L 10 -160 L 30 0" stroke={C.deskWoodDark} strokeWidth={8} fill="none" />
          <path d="M -24 -40 L 24 -40 M -18 -90 L 18 -90" stroke={C.deskWoodDark} strokeWidth={6} />
          <path d="M -34 -160 L 0 -196 L 34 -160 Z" fill={C.kawara} stroke={INK} strokeWidth={4} />
        </g>
        {/* 通り */}
        <rect x={600} y={850} width={1400} height={260} fill={C.earth} />
        <path d="M 600 850 L 1960 850" stroke={INK} strokeWidth={4} />
        {/* 遠くの町の人 (順にぴょん) */}
        {Array.from({ length: 6 }, (_, i) => {
          const hop = Math.max(0, Math.sin(Math.PI * seg(f, 40 + i * 12, 52 + i * 12))) * 26 + (f > 44 ? Math.max(0, Math.sin((f - 44 - i * 9) / 5)) * 6 : 0);
          return <PersonMini key={i} x={820 + i * 170} y={672 + (i % 2) * 90 - hop} s={0.28} f={f} phase={i} color={i % 2 ? C.red : C.indigo} arms={hop > 3 ? "up" : "down"} />;
        })}
        {/* 屋台のそば屋 */}
        <g transform="translate(1020 900)">
          <rect x={-120} y={-150} width={240} height={150} fill={C.cart} stroke={INK} strokeWidth={5} />
          <path d="M -140 -150 L 140 -150 L 120 -200 L -120 -200 Z" fill={C.kawara} stroke={INK} strokeWidth={5} />
          {[-80, 0, 80].map((k) => <rect key={k} x={k - 38} y={-150} width={76} height={42} fill={C.noren} stroke={INK} strokeWidth={3} />)}
          <circle cx={-90} cy={-40} r={26} fill={C.cartDark} stroke={INK} strokeWidth={4} />
          <circle cx={90} cy={-40} r={26} fill={C.cartDark} stroke={INK} strokeWidth={4} />
        </g>
        <MzFMan x={1180} y={905} s={0.55} f={f} pose="hold" face={f >= 31 ? "surprised" : "smile"} gaze={f >= 31 ? [-5, -3] : [0, 3]} phase={1} cloth={C.indigo} dark={C.indigoDark} hat="hachimaki" />
        {/* どんぶりとそば (手が止まると麺が垂れたまま) */}
        <g transform={`translate(1180 ${905 - 118 * 0.55})`}>
          <path d="M -24 0 Q 0 28 24 0 Z" fill={C.red} stroke={INK} strokeWidth={3.5} />
          <path d={f >= 31 ? "M -4 0 L -6 -40 M 4 0 L 6 -40" : `M -4 0 Q ${-8 + Math.sin(f / 2) * 4} -20 -4 -40 M 4 0 Q ${8 + Math.sin(f / 2) * 4} -20 4 -40`} stroke={C.dayCell} strokeWidth={4} fill="none" />
          <line x1={10} y1={-44} x2={30} y2={-70} stroke={C.deskWoodDark} strokeWidth={4} />
        </g>
        <MzFShock x={1180} y={905 - 300 * 0.55} s={0.4} t={seg(f, 31, 37)} />
        {/* 日本髪の女の人が飛び上がる */}
        <MzFWoman x={1380} y={905 - Math.sin(Math.PI * woman) * 90} s={0.55} f={f} pose={woman > 0 ? "banzai" : "stand"} face={woman > 0 ? "surprised" : "normal"} phase={2} cloth={C.enji} dark={C.enjiDark} />
        <MzFShock x={1380} y={905 - Math.sin(Math.PI * woman) * 90 - 310 * 0.55} s={0.4} t={seg(f, 33, 39)} />
        {/* 子どもが耳をふさぐ */}
        <Person x={1560} y={905} s={0.42} f={f} pose={f >= 34 ? "banzai" : "stand"} face={f >= 34 ? "worried" : "smile"} cloth={C.pink} clothDark={C.pinkDark} phase={4} />
        {f >= 34 && [-1, 1].map((sd) => <circle key={sd} cx={1560 + sd * 125 * 0.42} cy={905 - 206 * 0.42} r={7} fill={KRP.white} stroke={INK} strokeWidth={3} />)}
        {f >= 34 && [0, 1].map((k) => <path key={k} d={`M ${1530 + k * 60} ${905 - 290 * 0.42 - 6} l ${k ? 8 : -8} -14`} stroke={INK} strokeWidth={4} strokeLinecap="round" />)}
        {/* 屋根の猫が跳ねる */}
        <MzFCat x={1700} y={782 - 60} s={0.8} f={f} jump={catJ} />
        {/* 衝撃の輪 */}
        {fired && [0, 1, 2].map((k) => {
          const t = seg(f, FIRE + k * 6, FIRE + 40 + k * 6);
          if (t <= 0 || t >= 1) return null;
          return <ellipse key={k} cx={muzzle[0]} cy={muzzle[1]} rx={60 + t * 1300} ry={40 + t * 700} fill="none" stroke={KRP.white} strokeWidth={14 * (1 - t) + 2} opacity={0.85 * (1 - t)} />;
        })}
        {/* 左: 石垣と砲台 */}
        <MzFIshigaki x0={-80} x1={760} y={650} h={460} seed={5} />
        <path d="M -60 600 Q 300 584 780 610 L 780 660 L -60 660 Z" fill={C.grass} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${-30 + i * 58} 614 l 6 -16 l 6 16`} stroke={C.grassDark} strokeWidth={3} fill="none" />)}
        <MzFPine x={110} y={620} s={1.25} f={f} />
        {/* 土のう */}
        {[[600, 640], [680, 640], [760, 642], [640, 604], [720, 606]].map(([bx, by], i) => (
          <g key={i}>
            <ellipse cx={bx} cy={by} rx={46} ry={24} fill={C.sandbag} stroke={INK} strokeWidth={4} />
            <path d={`M ${bx - 30} ${by - 6} Q ${bx} ${by + 6} ${bx + 30} ${by - 6}`} stroke={C.sandbagDark} strokeWidth={3} fill="none" />
          </g>
        ))}
        {/* 大砲 (車輪つきの木の台) */}
        <g transform={`translate(${recoil} 0)`}>
          <g transform="rotate(-12 560 540)">
            <path d="M 470 520 L 880 528 L 880 556 L 470 572 Z" fill={C.cannon} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <circle cx={466} cy={546} r={30} fill={C.cannon} stroke={INK} strokeWidth={6} />
            <rect x={866} y={518} width={24} height={48} rx={6} fill={C.cannon} stroke={INK} strokeWidth={5} />
            {[560, 680].map((rx) => <rect key={rx} x={rx} y={520} width={16} height={50} fill={C.cannonHi} stroke={INK} strokeWidth={3} />)}
            <path d="M 500 530 L 840 534" stroke={C.cannonHi} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
          </g>
          <path d="M 470 580 L 660 560 L 660 610 L 460 620 Z" fill={C.cart} stroke={INK} strokeWidth={5} />
          <g transform={`translate(560 600) rotate(${recoil * 2})`}>
            <circle r={58} fill="none" stroke={C.cartDark} strokeWidth={14} />
            <circle r={58} fill="none" stroke={INK} strokeWidth={4} />
            {Array.from({ length: 10 }, (_, i) => <line key={i} y2={-54} stroke={C.cartDark} strokeWidth={6} transform={`rotate(${i * 36})`} />)}
            <circle r={14} fill={C.cart} stroke={INK} strokeWidth={4} />
          </g>
        </g>
        {/* 引き縄 (兵士の手 → 大砲の尾) */}
        {fired
          ? <line x1={hand[0]} y1={hand[1]} x2={470 + recoil} y2={548} stroke={C.hatBand} strokeWidth={5} />
          : <path d={`M ${sx + 20} ${sy - 110} Q 420 600 470 548`} stroke={C.hatBand} strokeWidth={5} fill="none" />}
        {/* 兵士 (軍服と帽子)。f<26 両手で懐中時計 / 発射後は右手で縄・左手に時計 */}
        <Person x={sx} y={sy} s={ss} f={f} pose={fired ? "point" : "hold"} pointDir={1} face={!fired ? "normal" : f < FIRE + 16 ? "surprised" : "smile"} gaze={fired ? [4, -2] : [0, 5]} cloth={C.soldier} clothDark={C.soldierDark} hair="cap" phase={3} lean={fired ? -6 * shakeK : 0} />
        <MzFOn x={sx} y={sy} s={ss} f={f} phase={3} lean={fired ? -6 * shakeK : 0}>
          {/* 胸のボタンとベルト */}
          {[-140, -116, -92].map((by) => <circle key={by} cx={-4} cy={by} r={5} fill={KRP.yellow} stroke={INK} strokeWidth={2} />)}
          <rect x={-58} y={-74} width={116} height={12} fill={C.hatBlack} />
          <MzFHat kind="kepi" />
          {/* 懐中時計 */}
          <g transform={fired ? "translate(-67 -56)" : "translate(0 -124)"}>
            <path d={fired ? "M 0 -18 Q 30 -40 50 -70" : "M 0 -18 Q 26 -10 40 20"} stroke={KRP.brass} strokeWidth={3} fill="none" />
            <MzFClock x={0} y={0} r={fired ? 16 : 22} h={12} m={0} sec={fired ? 0 : 52 + Math.floor(f / 3)} rim={KRP.brass} />
          </g>
        </MzFOn>
        {/* 発射の閃光と煙 */}
        {flash > 0 && flash < 1 && (
          <g transform={`translate(${muzzle[0] + 30} ${muzzle[1] - 4}) scale(${0.6 + flash})`} opacity={1 - flash}>
            <path d="M 0 -60 L 30 -16 L 100 -10 L 34 14 L 50 70 L 0 30 L -40 64 L -20 10 Z" fill={C.flash} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {fired && (() => {
          const t = easeOut(seg(f, FIRE, FIRE + 16));
          const drift = (f - FIRE) * 0.8;
          const cx = 1080 + drift, cy = 330 - drift * 0.2;
          const puffs: [number, number, number][] = [[-250, 40, 90], [-160, -60, 110], [-20, -110, 120], [140, -80, 115], [250, 20, 100], [150, 110, 105], [-30, 120, 110], [-200, 120, 85]];
          return (
            <g opacity={1 - seg(f, 220, 272) * 0.6}>
              {/* 砲口から雲までの煙の道 */}
              {[0, 1, 2, 3].map((k) => <circle key={k} cx={lerp(muzzle[0] + 40, cx - 240, k / 3)} cy={lerp(muzzle[1], cy + 40, k / 3)} r={(40 + k * 18) * t} fill={C.smoke} stroke={INK} strokeWidth={4} />)}
              <g transform={`translate(${cx} ${cy}) scale(${pop(don)})`}>
                {puffs.map(([px, py, r], i) => <circle key={i} cx={px} cy={py} r={r + Math.sin(f / 9 + i) * 4} fill={C.smoke} stroke={INK} strokeWidth={6} />)}
                {puffs.map(([px, py, r], i) => <circle key={`i${i}`} cx={px} cy={py} r={r - 8} fill={C.smoke} />)}
                <circle cx={0} cy={10} r={150} fill={C.smoke} />
                {puffs.slice(0, 4).map(([px, py, r], i) => <path key={`s${i}`} d={`M ${px - r * 0.5} ${py + r * 0.5} q ${r * 0.5} ${r * 0.3} ${r} 0`} stroke={C.smokeShade} strokeWidth={6} fill="none" />)}
                <text x={0} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={190} fill={INK} stroke={KRP.white} strokeWidth={6} paintOrder="stroke">ドン!</text>
              </g>
            </g>
          );
        })()}
      </g>
      <TagPlate x={1560} y={300} text="1871年" size={42} t={seg(f, 2, 12)} />
      <TagPlate x={1790} y={300} text="東京" size={42} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #123 1873年からは、季節で伸び縮みする時刻をやめて、1日を24時間に、きっちり分けました。
// 格: 図 / seed 6123
// どこ: 明治の役所。奥にふすまと行灯、手前の机に和紙の大きな巻物 (墨の線・朱の印)。
// 演出: 巻物の上の時刻の帯 (昼=黄・夜=紺の12区切り) が季節でゴムのように伸び縮み。洋服の役人が長い定規をぱしっと押さえると、
//       うにょうにょが止まり、24の目盛りが左から一気に入って、下に 1〜24 の数字が並ぶ。役人は汗をぬぐってひと息。
// 動き: f0-28 帯がうにょうにょ / f28-32 定規がぱしっ / f32-42 24の目盛りと数字が左から / f50- 汗・行灯のゆらぎ・ゆっくり寄る
const Mz123: React.FC<{ f: number }> = ({ f }) => {
  const SLAP = 30;
  const slap = seg(f, SLAP - 4, SLAP);
  const settle = easeOut(seg(f, SLAP, SLAP + 6));
  const amp = 1 - settle;
  const dayFrac = lerp(0.5 + 0.17 * Math.sin(f / 6), 0.5, settle);
  const BX0 = 180, BX1 = 1500, BY0 = 500, BY1 = 650;
  const BW = BX1 - BX0;
  // 12の区切り (夜3・昼6・夜3)
  const nightL = (1 - dayFrac) / 2;
  const bounds: number[] = [0];
  for (let i = 1; i <= 3; i++) bounds.push((nightL * i) / 3);
  for (let i = 1; i <= 6; i++) bounds.push(nightL + (dayFrac * i) / 6);
  for (let i = 1; i <= 3; i++) bounds.push(nightL + dayFrac + (nightL * i) / 3);
  const wav = (i: number) => amp * Math.sin(f / 4 + i * 1.3) * 16;
  const bx = (v: number, i: number) => BX0 + v * BW + (i > 0 && i < 12 ? wav(i) : 0);
  const zoom = 1 + 0.07 * easeInOut(seg(f, 0, 250));
  const ox = 1680, oy = 640, os = 1.35; // 役人
  const rulerLift = 1 - slap;
  const sweat = seg(f, 46, 56);
  const andon = 0.8 + 0.2 * Math.sin(f / 3.3) * Math.sin(f / 7.1);
  return (
    <Frame f={f} seed={6123} bg={C.fusuma}>
      <g transform={`translate(960 580) scale(${zoom}) translate(-960 -580)`}>
        {/* ふすま */}
        <rect x={-60} y={-60} width={2040} height={540} fill={C.fusuma} />
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <rect x={-40 + i * 400} y={-40} width={400} height={500} fill={C.fusuma} stroke={C.fusumaFrame} strokeWidth={12} />
            <path d={`M ${-20 + i * 400} 330 Q ${60 + i * 400} 230 ${140 + i * 400} 300 Q ${220 + i * 400} 200 ${340 + i * 400} 320`} stroke={C.washiDark} strokeWidth={10} fill="none" opacity={0.8} />
            <circle cx={i % 2 ? -10 + i * 400 : 330 + i * 400} cy={260} r={16} fill={C.fusumaFrame} />
          </g>
        ))}
        <rect x={-60} y={-60} width={2040} height={40} fill={C.deskWoodDark} />
        {/* 行灯 */}
        <g transform="translate(150 0)">
          <circle cx={0} cy={300} r={150} fill={C.light} opacity={0.25 * andon} />
          <rect x={-60} y={200} width={120} height={200} fill={C.light} stroke={C.deskWoodDark} strokeWidth={10} opacity={0.95} />
          <line x1={0} y1={200} x2={0} y2={400} stroke={C.deskWoodDark} strokeWidth={5} />
          <line x1={-60} y1={300} x2={60} y2={300} stroke={C.deskWoodDark} strokeWidth={5} />
          <rect x={-70} y={396} width={140} height={20} fill={C.deskWoodDark} stroke={INK} strokeWidth={4} />
        </g>
        {/* 机 */}
        <rect x={-60} y={440} width={2040} height={700} fill={C.deskWood} />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M -60 ${480 + i * 90} q 500 ${(rnd(12, i) - 0.5) * 30} 1000 0 q 500 ${(rnd(13, i) - 0.5) * 30} 1060 0`} stroke={C.deskWoodDark} strokeWidth={4} fill="none" opacity={0.5} />)}
        <path d="M -60 440 L 1980 440" stroke={INK} strokeWidth={6} />
        {/* 和紙の巻物 */}
        <rect x={140} y={450} width={1640} height={350} fill={C.washi} stroke={INK} strokeWidth={6} />
        {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${160 + rnd(31, i) * 1580} ${470 + rnd(32, i) * 310} q 14 ${(rnd(33, i) - 0.5) * 16} 30 4`} stroke={C.washiFiber} strokeWidth={2} fill="none" />)}
        {[120, 1780].map((rx) => (
          <g key={rx}>
            <rect x={rx - 22} y={436} width={44} height={378} rx={14} fill={C.washiDark} stroke={INK} strokeWidth={5} />
            <rect x={rx - 14} y={420} width={28} height={410} rx={8} fill={C.deskWoodDark} stroke={INK} strokeWidth={4} />
          </g>
        ))}
        {/* 朱の印 */}
        <g transform="translate(1660 740) rotate(-6)">
          <rect x={-40} y={-40} width={80} height={80} rx={6} fill="none" stroke={C.shu} strokeWidth={7} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={C.shu}>時</text>
        </g>
        {/* 時刻の帯: 12の区切り (伸び縮み) */}
        {bounds.slice(0, 12).map((b, i) => {
          const night = i < 3 || i >= 9;
          const x0 = bx(b, i), x1 = bx(bounds[i + 1], i + 1);
          const w0 = wav(i), w1 = wav(i + 1);
          return (
            <path key={i} d={`M ${x0} ${BY0} Q ${x0 - w0 * 1.6} ${(BY0 + BY1) / 2} ${x0} ${BY1} L ${x1} ${BY1} Q ${x1 - w1 * 1.6} ${(BY0 + BY1) / 2} ${x1} ${BY0} Z`}
              fill={night ? (i % 2 ? C.nightCell : C.nightCellLight) : (i % 2 ? C.dayCell : KRP.yellow)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          );
        })}
        <rect x={BX0} y={BY0} width={BW} height={BY1 - BY0} fill="none" stroke={INK} strokeWidth={7} />
        {/* 太陽と月の印 */}
        <circle cx={BX0 + BW / 2} cy={BY0 + 75} r={26} fill={KRP.orange} stroke={INK} strokeWidth={4} />
        <g transform={`translate(${BX0 + 90} ${BY0 + 75})`}><circle r={22} fill="#F3E3A0" stroke={INK} strokeWidth={4} /><circle cx={10} cy={-6} r={18} fill={C.nightCellLight} /></g>
        {/* ゴムの伸び縮みの印 (止まる前だけ) */}
        {amp > 0.05 && [-1, 1].map((sd) => (
          <g key={sd} opacity={amp} transform={`translate(${BX0 + BW / 2 + sd * (BW * dayFrac) / 2} ${BY0 - 30})`}>
            <path d={`M ${-sd * 30} 0 L ${sd * 30} 0 M ${sd * 30} 0 l ${-sd * 14} -10 M ${sd * 30} 0 l ${-sd * 14} 10`} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" fill="none" />
          </g>
        ))}
        {/* 24の目盛りと数字 (左から順に入る) */}
        {Array.from({ length: 24 }, (_, i) => {
          const t = seg(f, 32 + i * 0.4, 33 + i * 0.4);
          if (t <= 0) return null;
          const x = BX0 + ((i + 1) * BW) / 24;
          return (
            <g key={i}>
              {i < 23 && <line x1={x} y1={BY0} x2={x} y2={lerp(BY0, BY1, t)} stroke={INK} strokeWidth={4} />}
              <text x={x - BW / 48} y={BY1 + 50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={INK} opacity={t}>{i + 1}</text>
            </g>
          );
        })}
        {/* 長い定規 (ぱしっ) */}
        <g transform={`rotate(${-7 * rulerLift} ${ox - 20} ${BY0 - 16})`}>
          <rect x={BX0 - 40} y={BY0 - 34} width={ox - BX0 + 30} height={30} rx={4} fill={MP.woodLight} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 48 }, (_, i) => <line key={i} x1={BX0 + i * (BW / 48)} y1={BY0 - 34} x2={BX0 + i * (BW / 48)} y2={BY0 - (i % 2 ? 24 : 16)} stroke={INK} strokeWidth={2.5} />)}
        </g>
        <defs><clipPath id="mzf123cut"><rect x={-100} y={-100} width={2200} height={672} /></clipPath></defs>
        {/* 役人 (机の向こうに立つ。洋服・口ひげ・眼鏡) */}
        <g clipPath="url(#mzf123cut)">
          <Person x={ox} y={oy} s={os} f={f} pose="hold" face={f < SLAP ? "angry" : sweat > 0 ? "smile" : "surprised"} gaze={[-5, 4]} cloth={C.hatBlack} clothDark={C.hatBlack} hair="cap" glasses phase={2} lean={-6 * (1 - rulerLift * 0.5)} />
          <MzFOn x={ox} y={oy} s={os} f={f} phase={2} lean={-6 * (1 - rulerLift * 0.5)}>
            <path d="M -16 -160 L 0 -120 L 16 -160 Z" fill={KRP.white} stroke={INK} strokeWidth={3} />
            <path d="M -6 -150 L 6 -150 L 4 -116 L -4 -116 Z" fill={KRP.red} />
            <path d="M -24 -198 Q -10 -208 0 -198 Q 10 -208 24 -198 Q 12 -188 0 -194 Q -12 -188 -24 -198 Z" fill={C.hair} />
          </MzFOn>
          <MzFSweat x={ox + 70} y={oy - 290 + sweat * 20} s={1.1} t={sweat} />
        </g>
        {/* ぱしっの線 */}
        {f >= SLAP && f < SLAP + 14 && (
          <g stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, SLAP, SLAP + 14)}>
            {[300, 700, 1100].map((px) => <g key={px}><line x1={px} y1={BY0 - 50} x2={px - 20} y2={BY0 - 90} /><line x1={px + 30} y1={BY0 - 50} x2={px + 40} y2={BY0 - 96} /></g>)}
          </g>
        )}
        {/* 筆と硯 */}
        <g transform="translate(300 900)">
          <rect x={-80} y={-30} width={160} height={70} rx={14} fill={C.hatBlack} stroke={INK} strokeWidth={5} />
          <ellipse cx={-20} cy={4} rx={44} ry={18} fill={INK} />
        </g>
      </g>
      <TagPlate x={960} y={250} text={f < SLAP ? "不定時法" : "24時間"} size={44} t={f < SLAP ? 1 - seg(f, SLAP - 3, SLAP) : seg(f, SLAP + 4, SLAP + 12)} />
      <TagPlate x={560} y={250} text="1873年" size={44} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #124 そして1888年、日本じゅうが、同じ時刻になります。
// 格: 山 / seed 6124
// どこ: 1888年の日本列島を描いた古い和紙の地図 (青海波の海・墨の山)。北海道・本州・四国・九州を実際の形に近く。
// 演出: 明石の子午線 (細い縦の線) から光の線が東西へ広がり、届いた町の時計 (時計塔・寺の鐘・役場の時計) の針がくるっと回って
//       全部が同じ時刻でカチッとそろう。そろうと各地の小さな人 (男女・着物) が見上げてうなずく。最後に全部の秒針が同時にチクッ。
// 動き: f0-10 年代札 / f10-38 光が東西へ・針がそろう (10か所) / f42- 秒針が同時にチクッ (15コマごと) / 人がうなずく / カメラはゆっくり寄りつつ北へ
const JP_ISLANDS: [number, number][][] = [
  // 北海道
  [[140.0, 41.5], [140.6, 41.75], [141.1, 41.8], [140.9, 42.5], [141.7, 42.6], [142.5, 42.2], [143.3, 41.9], [143.9, 42.6], [144.6, 42.9], [145.5, 43.2], [145.8, 43.4], [145.1, 43.6], [145.3, 44.1], [144.3, 44.0], [143.0, 44.5], [142.0, 45.4], [141.6, 45.3], [141.7, 44.3], [141.4, 43.7], [141.3, 43.2], [140.5, 43.2], [140.4, 42.6], [139.9, 42.3], [140.1, 41.9]],
  // 本州
  [[130.9, 34.0], [131.5, 34.6], [132.5, 35.3], [133.3, 35.5], [134.3, 35.6], [135.2, 35.7], [135.9, 35.6], [136.1, 36.0], [136.7, 36.9], [136.8, 37.4], [137.3, 37.5], [137.0, 36.8], [137.6, 36.9], [138.5, 37.4], [139.4, 38.3], [139.8, 39.0], [140.0, 39.9], [139.7, 40.0], [140.0, 40.6], [140.3, 41.2], [140.6, 41.3], [141.2, 41.2], [141.4, 41.4], [141.5, 40.6], [141.9, 40.0], [142.0, 39.3], [141.6, 38.6], [141.0, 38.3], [141.0, 37.5], [140.9, 36.9], [140.6, 36.2], [140.9, 35.7], [140.4, 35.2], [139.9, 34.9], [140.0, 35.6], [139.7, 35.5], [139.6, 35.2], [139.2, 35.2], [139.1, 34.7], [138.8, 34.6], [138.7, 35.1], [138.3, 34.6], [137.4, 34.6], [137.0, 34.7], [136.9, 34.3], [136.5, 34.2], [136.0, 33.5], [135.7, 33.45], [135.1, 33.9], [135.2, 34.3], [135.4, 34.6], [135.0, 34.7], [134.2, 34.7], [133.3, 34.4], [132.5, 34.3], [132.0, 33.9], [131.2, 33.95]],
  // 四国
  [[132.0, 33.35], [132.7, 33.9], [133.6, 34.3], [134.3, 34.3], [134.6, 34.2], [134.7, 33.8], [134.2, 33.25], [133.6, 33.5], [133.0, 32.7], [132.5, 33.0]],
  // 九州
  [[130.2, 33.9], [130.9, 34.0], [131.7, 33.3], [131.6, 32.6], [131.4, 31.4], [130.7, 31.0], [130.5, 31.6], [130.2, 31.3], [130.1, 32.2], [129.8, 32.7], [129.6, 33.2], [129.9, 33.5], [130.4, 33.6]],
];
const jpX = (lon: number) => 960 + (lon - 137.6) * 56;
const jpY = (lat: number) => 20 + (45.6 - lat) * 64;
const JP_TOWNS: { lon: number; lat: number; kind: "tower" | "kane" | "yakuba"; w: boolean; start: number }[] = [
  { lon: 139.05, lat: 37.9, kind: "kane", w: true, start: 2.3 },
  { lon: 130.4, lat: 33.55, kind: "yakuba", w: false, start: 7.5 },
  { lon: 132.45, lat: 34.45, kind: "tower", w: true, start: 4.2 },
  { lon: 140.75, lat: 40.8, kind: "kane", w: false, start: 9.1 },
  { lon: 135.5, lat: 34.75, kind: "yakuba", w: true, start: 1.4 },
  { lon: 136.9, lat: 35.2, kind: "tower", w: false, start: 10.6 },
  { lon: 136.65, lat: 36.6, kind: "kane", w: true, start: 5.8 },
  { lon: 139.7, lat: 35.75, kind: "tower", w: false, start: 3.1 },
  { lon: 140.9, lat: 38.3, kind: "yakuba", w: true, start: 8.4 },
  { lon: 141.35, lat: 43.1, kind: "tower", w: false, start: 6.6 },
];
const MzFMapTown: React.FC<{ x: number; y: number; f: number; kind: "tower" | "kane" | "yakuba"; h: number; flash: number; sec: number; nod: number; woman: boolean; phase: number; tick?: number }> = ({ x, y, f, kind, h, flash, sec, nod, woman, phase, tick = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(0.78)`}>
    <ellipse cx={0} cy={4} rx={46} ry={10} fill={C.landDark} opacity={0.7} />
    {kind === "tower" && (
      <g>
        <rect x={-16} y={-96} width={32} height={96} fill={C.stucco} stroke={INK} strokeWidth={4} />
        <path d="M -22 -94 L 0 -126 L 22 -94 Z" fill={C.waterDark} stroke={INK} strokeWidth={4} />
      </g>
    )}
    {kind === "kane" && (
      <g>
        <path d="M -26 0 L -22 -90 M 26 0 L 22 -90" stroke={C.deskWoodDark} strokeWidth={7} />
        <path d="M -34 -88 L 0 -112 L 34 -88 Z" fill={C.kawara} stroke={INK} strokeWidth={4} />
        <path d="M -12 -84 L 12 -84 L 15 -54 L -15 -54 Z" fill={KRP.bronze} stroke={INK} strokeWidth={3} />
      </g>
    )}
    {kind === "yakuba" && (
      <g>
        <rect x={-34} y={-56} width={68} height={56} fill={C.plaster} stroke={INK} strokeWidth={4} />
        <path d="M -40 -54 L 0 -80 L 40 -54 Z" fill={C.kawara} stroke={INK} strokeWidth={4} />
        <rect x={-8} y={-26} width={16} height={26} fill={C.deskWoodDark} />
      </g>
    )}
    {/* 時計 (時計塔・役場は建物に、寺の鐘は横の柱に) */}
    {(() => {
      const cy = kind === "tower" ? -66 : kind === "yakuba" ? -100 : -128;
      const cx = kind === "kane" ? 0 : 0;
      return (
        <g>
          {kind === "yakuba" && <rect x={-4} y={-90} width={8} height={36} fill={MP.iron} />}
          {flash > 0 && flash < 1 && <circle cx={cx} cy={cy} r={20 + flash * 40} fill="none" stroke={C.light} strokeWidth={10 * (1 - flash)} />}
          {tick > 0 && <circle cx={cx} cy={cy} r={34 + (1 - tick) * 16} fill="none" stroke={KRP.red} strokeWidth={5 * tick} />}
          <MzFClock x={cx} y={cy} r={24} h={Math.floor(h)} m={(h % 1) * 60} sec={sec} rim={MP.brass} />
        </g>
      );
    })()}
    {/* 見上げてうなずく人 */}
    {woman
      ? <MzFWoman x={44} y={2} s={0.2} f={f} face={nod > 0 ? "smile" : "normal"} gaze={[-3, -4]} lean={-Math.max(0, Math.sin(nod * Math.PI * 2)) * 14} phase={phase} cloth={phase % 2 ? C.red : C.pink} dark={phase % 2 ? C.redDark : C.pinkDark} />
      : <MzFMan x={44} y={2} s={0.2} f={f} face={nod > 0 ? "smile" : "normal"} gaze={[-3, -4]} lean={-Math.max(0, Math.sin(nod * Math.PI * 2)) * 14} phase={phase} cloth={phase % 2 ? C.indigo : C.graySuit} dark={phase % 2 ? C.indigoDark : C.graySuitDark} />}
  </g>
);
const Mz124: React.FC<{ f: number }> = ({ f }) => {
  const mx = jpX(135.0);
  const reach = easeInOut(seg(f, 10, 38)) * 620;
  const cam = easeInOut(seg(f, 0, 162));
  const sc = 1 + 0.1 * cam;
  const panY = 60 * cam;
  const tickN = f >= 42 ? Math.floor((f - 42) / 15) + 1 : 0;
  const tickPop = f >= 42 ? 1 - seg((f - 42) % 15, 0, 5) : 0;
  return (
    <Frame f={f} seed={6124} bg={C.washi}>
      <g transform={`translate(960 400) scale(${sc}) translate(-960 ${-400 + panY})`}>
        {/* 和紙の地 (海) */}
        <rect x={-200} y={-200} width={2320} height={1500} fill={C.sea} />
        {/* 青海波 */}
        {Array.from({ length: 17 }, (_, r) => Array.from({ length: 22 }, (_, c) => {
          const x = -100 + c * 100 + (r % 2) * 50, y = -100 + r * 70;
          return <g key={`${r}-${c}`} fill="none" stroke={C.seaLine} strokeWidth={3} opacity={0.75}>
            <path d={`M ${x - 46} ${y} A 46 46 0 0 1 ${x + 46} ${y}`} />
            <path d={`M ${x - 30} ${y} A 30 30 0 0 1 ${x + 30} ${y}`} />
            <path d={`M ${x - 14} ${y} A 14 14 0 0 1 ${x + 14} ${y}`} />
          </g>;
        }))}
        {/* 陸 */}
        {JP_ISLANDS.map((pts, i) => (
          <g key={i}>
            <path d={"M " + pts.map(([lo, la]) => `${jpX(lo) + 6} ${jpY(la) + 8}`).join(" L ") + " Z"} fill={C.landDark} />
            <path d={"M " + pts.map(([lo, la]) => `${jpX(lo)} ${jpY(la)}`).join(" L ") + " Z"} fill={C.land} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          </g>
        ))}
        {/* 墨の山 */}
        {[[137.6, 36.2], [138.5, 36.4], [139.8, 37.4], [140.6, 39.5], [142.9, 43.6], [133.0, 35.1], [131.1, 32.8], [133.5, 33.8], [136.4, 35.9], [141.0, 40.5]].map(([lo, la], i) => (
          <path key={i} d={`M ${jpX(lo) - 26} ${jpY(la) + 10} L ${jpX(lo) - 6} ${jpY(la) - 16} L ${jpX(lo) + 4} ${jpY(la) - 4} L ${jpX(lo) + 14} ${jpY(la) - 20} L ${jpX(lo) + 30} ${jpY(la) + 10}`} stroke={INK} strokeWidth={4} fill={C.washiDark} strokeLinejoin="round" />
        ))}
        {/* 子午線 (明石) */}
        <line x1={mx} y1={-200} x2={mx} y2={1300} stroke={KRP.red} strokeWidth={5} strokeDasharray="18 12" />
        {/* 光が東西へ広がる */}
        {reach > 0 && (
          <g>
            <rect x={mx - reach} y={-200} width={reach * 2} height={1500} fill={C.light} opacity={0.22 * (1 - seg(f, 60, 120) * 0.6)} />
            {[-1, 1].map((sd) => (
              <g key={sd} opacity={1 - seg(f, 38, 60)}>
                <line x1={mx + sd * reach} y1={-200} x2={mx + sd * reach} y2={1300} stroke={C.light} strokeWidth={22} />
                <line x1={mx + sd * reach} y1={-200} x2={mx + sd * reach} y2={1300} stroke={KRP.white} strokeWidth={6} />
              </g>
            ))}
          </g>
        )}
        {/* 各地の町と時計 */}
        {JP_TOWNS.map((t, i) => {
          const x = jpX(t.lon), y = jpY(t.lat);
          const d = Math.abs(x - mx);
          const hitF = 10 + (d / 620) * 28;
          const k = clamp01(easeOut(seg(f, hitF, hitF + 5)));
          const hh = lerp(t.start, 12, k);
          const sec = k >= 1 ? (tickN % 60) : Math.floor(f * 1.7 + i * 13) % 60;
          return (
            <g key={i}>
              <MzFMapTown x={x} y={y} f={f} kind={t.kind} h={hh} flash={seg(f, hitF + 4, hitF + 16)} sec={sec} nod={seg(f, hitF + 6, hitF + 20)} woman={t.w} phase={i} tick={k >= 1 ? tickPop : 0} />
            </g>
          );
        })}
      </g>
      <TagPlate x={260} y={250} text="1888年" size={46} t={seg(f, 0, 10)} />
      <TagPlate x={960 + (mx - 960) * sc - 110} y={420} text="明石" size={34} t={seg(f, 6, 14)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #125 1920年には、時間を守ろうと呼びかける、時の記念日まで、できました。
// 格: 並 / seed 6125
// どこ: 1920年 (大正) の東京の街角。右から奥まで大きなれんがの建物、左に電柱と電線、奥へ続く通りに路面電車の線路と瓦屋根。
// 演出: れんがの壁に「時の記念日」のポスター (大きな丸い時計=9時・朱の日の丸・「6月10日」の札) がばさっと広がって貼られる。
//       はしごの男 (半纏・はちまき) が片手でポスターの端を押さえ、もう片手の刷毛でなでつける。通りの男女が立ち止まって見上げる。
// 動き: f0-22 ポスターがばさっ / f22- 刷毛でなでつける (ゆっくり) / f0-30 男女が歩いてきて立ち止まる / f40- ポスターへ寄る / 奥を路面電車がチンと通る
// (#126 は同じ街角の続き。舞台 MzFCorner を共有する)
const MzFTokiPoster: React.FC<{ x: number; y: number; f: number; open?: number; sad?: number }> = ({ x, y, f, open = 1, sad = 0 }) => {
  const k = pop(clamp01(open));
  const sway = (1 - clamp01(open)) * Math.sin(f / 2) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${Math.max(0.02, k)}) rotate(${sway})`}>
      <rect x={-176} y={6} width={352} height={484} fill={C.washiDark} opacity={0.5} />
      <rect x={-170} y={0} width={340} height={480} fill={C.poster} stroke={INK} strokeWidth={6} />
      <rect x={-156} y={14} width={312} height={452} fill="none" stroke={KRP.red} strokeWidth={4} />
      <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.red}>時の記念日</text>
      {/* 朱の日の丸の太陽 */}
      <circle cx={70} cy={180} r={78} fill={C.shu} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={70} y1={180 - 92} x2={70} y2={180 - 112} stroke={C.shu} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 30} 70 180)`} />)}
      {/* 大きな丸い時計 (9時) */}
      <MzFClock x={-20} y={250} r={106} h={9} m={0} rim={MP.brass} face={KRP.white} />
      {/* しょんぼり顔 (#126) */}
      {sad > 0 && (
        <g opacity={clamp01(sad * 2)}>
          <ellipse cx={-56} cy={226} rx={10} ry={14} fill={INK} />
          <ellipse cx={16} cy={226} rx={10} ry={14} fill={INK} />
          <path d="M -74 210 L -46 196 M 0 196 L 28 210" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d="M -48 306 Q -20 286 8 306" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <MzFSweat x={80 + 0} y={200 + Math.sin(f / 6) * 3} s={1.5} t={sad} />
        </g>
      )}
      {/* 6月10日 の札 */}
      <rect x={-110} y={384} width={220} height={66} rx={10} fill={KRP.white} stroke={INK} strokeWidth={5} />
      <text x={0} y={432} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={INK}>6月10日</text>
    </g>
  );
};
const MzFCorner: React.FC<{ f: number; tram: number; pan?: number }> = ({ f, tram, pan = 0 }) => (
  <g>
    <MzFSky top={C.skyTop} bot={C.skyBot} h={620} />
    <MzFCloud x={300 - pan * 0.3} y={110} s={0.8} />
    {/* 奥の通り (瓦屋根と洋館) */}
    <g transform={`translate(${-pan * 0.4} 0)`}>
      {[-80, 120, 300, 460].map((bx, i) => (
        <g key={bx}>
          <rect x={bx} y={420 + i * 20} width={170 - i * 10} height={240 - i * 20} fill={i % 2 ? C.plaster : MP.brickLight} stroke={INK} strokeWidth={4} />
          <path d={`M ${bx - 10} ${422 + i * 20} L ${bx + 85 - i * 5} ${380 + i * 20} L ${bx + 180 - i * 10} ${422 + i * 20} Z`} fill={C.kawara} stroke={INK} strokeWidth={4} />
          {[0, 1].map((w) => <rect key={w} x={bx + 24 + w * 70 - i * 4} y={470 + i * 20} width={36} height={44} fill={C.waterDark} stroke={INK} strokeWidth={3} />)}
        </g>
      ))}
      {/* 路面電車 (奥を横切る) */}
      {tram > 0 && tram < 1 && (
        <g transform={`translate(${lerp(-400, 900, tram)} 640)`}>
          <line x1={60} y1={-150} x2={90} y2={-200} stroke={INK} strokeWidth={4} />
          <rect x={-10} y={-150} width={260} height={120} rx={14} fill={C.tram} stroke={INK} strokeWidth={5} />
          <rect x={-10} y={-62} width={260} height={18} fill={C.tramDark} />
          {[10, 70, 130, 190].map((wx) => <rect key={wx} x={wx} y={-134} width={44} height={50} rx={6} fill={C.tramWin} stroke={INK} strokeWidth={3} />)}
          <circle cx={40} cy={-24} r={16} fill={INK} /><circle cx={200} cy={-24} r={16} fill={INK} />
          {tram > 0.15 && tram < 0.4 && <text x={260} y={-160} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.obiDark} stroke={KRP.white} strokeWidth={5} paintOrder="stroke">チン</text>}
        </g>
      )}
      <rect x={-100} y={640} width={800} height={30} fill={C.earthDark} />
    </g>
    {/* 電柱と電線 */}
    <g transform={`translate(${-pan * 0.7} 0)`}>
      <rect x={240} y={60} width={26} height={800} fill={C.pole} stroke={INK} strokeWidth={5} />
      <rect x={180} y={120} width={146} height={16} fill={C.pole} stroke={INK} strokeWidth={4} />
      {[190, 316].map((ix) => <circle key={ix} cx={ix} cy={112} r={8} fill={KRP.white} stroke={INK} strokeWidth={3} />)}
      <path d="M -100 150 Q 100 170 190 112 M 316 112 Q 700 160 1100 70" stroke={INK} strokeWidth={3} fill="none" />
      <path d="M -100 200 Q 120 210 190 112 M 316 112 Q 700 230 1200 150" stroke={INK} strokeWidth={3} fill="none" />
    </g>
    {/* れんがの建物の壁 */}
    <g transform={`translate(${-pan} 0)`}>
      <rect x={660} y={60} width={1700} height={760} fill={MP.brick} stroke={INK} strokeWidth={6} />
      {Array.from({ length: 37 }, (_, r) => <line key={r} x1={660} y1={80 + r * 20} x2={2360} y2={80 + r * 20} stroke={MP.brickDark} strokeWidth={2} opacity={0.45} />)}
      {Array.from({ length: 37 }, (_, r) => Array.from({ length: 28 }, (_, c) => <line key={`${r}-${c}`} x1={670 + c * 62 + (r % 2) * 31} y1={60 + r * 20} x2={670 + c * 62 + (r % 2) * 31} y2={80 + r * 20} stroke={MP.brickDark} strokeWidth={2} opacity={0.35} />))}
      <rect x={640} y={40} width={1740} height={30} fill={C.stucco} stroke={INK} strokeWidth={5} />
      {[1420, 1640, 1860, 2080].map((wx) => (
        <g key={wx}>
          <rect x={wx} y={140} width={120} height={180} fill={C.waterDark} stroke={INK} strokeWidth={5} />
          <line x1={wx + 60} y1={140} x2={wx + 60} y2={320} stroke={INK} strokeWidth={4} />
          <rect x={wx - 12} y={320} width={144} height={16} fill={C.stucco} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      {/* 1階の店 (日よけ) */}
      <rect x={1400} y={540} width={760} height={280} fill={C.deskWood} stroke={INK} strokeWidth={5} />
      <path d="M 1380 540 L 2180 540 L 2160 600 L 1400 600 Z" fill={C.stucco} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={1400 + i * 76} y={541} width={38} height={58} fill={KRP.red} opacity={0.75} />)}
      {[1460, 1700, 1940].map((wx) => <rect key={wx} x={wx} y={630} width={160} height={150} fill={C.waterDark} stroke={INK} strokeWidth={4} />)}
    </g>
    {/* 歩道と車道と線路 */}
    <rect x={-100} y={810} width={2200} height={70} fill={MP.stoneLight} stroke={INK} strokeWidth={5} />
    {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-100 + i * 100 - (pan % 100)} y1={812} x2={-120 + i * 100 - (pan % 100)} y2={878} stroke={INK} strokeWidth={2.5} opacity={0.4} />)}
    <rect x={-100} y={880} width={2200} height={300} fill={C.earth} />
    {[960, 1020].map((ry) => <rect key={ry} x={-100} y={ry} width={2200} height={10} fill={MP.ironLight} stroke={INK} strokeWidth={3} />)}
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-100 + i * 80 - (pan % 80)} y={950} width={18} height={90} fill={C.deskWoodDark} opacity={0.5} />)}
  </g>
);
const Mz125: React.FC<{ f: number }> = ({ f }) => {
  const open = seg(f, 0, 18);
  const zoom = easeInOut(seg(f, 40, 190));
  const sc = 1 + 0.12 * zoom;
  const brush = f >= 18 ? Math.sin((f - 18) / 7) : 0;
  const lean = -4 + brush * 6;
  const mx = 1300, my = 722, ms = 0.95; // はしごの男
  const walk = easeOut(seg(f, 0, 30));
  return (
    <Frame f={f} seed={6125} bg={C.skyBot}>
      <g transform={`translate(1000 420) scale(${sc}) translate(-1000 -420)`}>
        <MzFCorner f={f} tram={seg(f, 14, 150)} />
        {/* ポスター (糊のつや) */}
        <MzFTokiPoster x={1000} y={170} f={f} open={open} />
        {f >= 22 && <path d={`M 880 ${200 + ((f - 22) * 9) % 420} l 240 0`} stroke={KRP.white} strokeWidth={8} opacity={0.35} strokeLinecap="round" />}
        {/* はしご */}
        <g>
          {[-1, 1].map((sd) => <line key={sd} x1={1250 + sd * 50} y1={880} x2={1220 + sd * 50} y2={300} stroke={C.cartDark} strokeWidth={14} strokeLinecap="round" />)}
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={1198 - i * 3.4 + 0} y1={850 - i * 64} x2={1302 - i * 3.4} y2={850 - i * 64} stroke={C.cart} strokeWidth={10} />)}
        </g>
        {/* 糊のバケツ (はしごに掛ける) */}
        <g transform="translate(1214 790)">
          <path d="M -26 -40 Q 0 -70 26 -40" stroke={MP.iron} strokeWidth={4} fill="none" />
          <path d="M -30 -40 L 30 -40 L 24 20 L -24 20 Z" fill={MP.ironLight} stroke={INK} strokeWidth={4} />
        </g>
        {/* はしごの男: 左手 (point) でポスターの端を押さえ、刷毛をなでつける */}
        <MzFMan x={mx} y={my} s={ms} f={f} pose="point" pointDir={-1} face={open < 1 ? "surprised" : "smile"} gaze={[-5, -2]} cloth={C.happi} dark={C.indigoDark} hat="hachimaki" kimono={false} lean={lean} phase={2} />
        <MzFOn x={mx} y={my} s={ms} f={f} phase={2} lean={lean}>
          <path d="M -58 -160 L -40 -60 M 58 -160 L 40 -60" stroke={KRP.white} strokeWidth={8} />
          <g transform="translate(-160 -148) rotate(-20)">
            <rect x={-10} y={-70} width={20} height={70} rx={4} fill={C.cart} stroke={INK} strokeWidth={4} />
            <rect x={-30} y={-110} width={60} height={44} rx={6} fill={C.washiDark} stroke={INK} strokeWidth={4} />
          </g>
        </MzFOn>
        {/* 立ち止まって見上げる男女 */}
        <MzFWoman x={lerp(-60, 430, walk)} y={950} s={0.85} f={f} pose={walk < 1 ? "run" : "stand"} face={walk < 1 ? "normal" : "surprised"} gaze={walk < 1 ? [5, 0] : [5, -6]} lean={walk < 1 ? 0 : -5} cloth={C.pink} dark={C.pinkDark} phase={1} />
        <MzFMan x={lerp(80, 640, walk)} y={950} s={0.85} f={f} pose={walk < 1 ? "run" : "raise"} face={walk < 1 ? "normal" : "joy"} gaze={walk < 1 ? [5, 0] : [5, -6]} lean={walk < 1 ? 0 : -5} cloth={C.indigo} dark={C.indigoDark} hat="bowler" phase={4} />
        <MzFShock x={lerp(-60, 430, walk)} y={950 - 330 * 0.85} s={0.6} t={seg(f, 30, 38)} />
      </g>
      <TagPlate x={180} y={250} text="1920年" size={42} t={seg(f, 2, 12)} />
      <TagPlate x={420} y={250} text="東京" size={42} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #126 わざわざ記念日を作るほど、守られていなかった、とも言えます。
// 格: 山 / seed 6126
// どこ: #125 と同じ街角 (続き)。貼られたばかりの「時の記念日」ポスター (時計はちょうど9時) の前。
// 演出: ★笑いどころ。ポスターの前を遅刻者が次々に走り抜ける: 書類を抱えた会社員 (帽子が飛ぶ)、裾をからげた日本髪の女の人、
//       パンをくわえた学生。だれもポスターを見ない。最後にポスターを貼った男まで、はしごを担いで走っていく。
//       ポスターの時計に目と口が付いて、しょんぼり (汗)。足元に砂煙。カメラは走る人を追って横に流れる。
// 動き: f0- 会社員 / f10- 女の人 / f20- 学生 / f32- はしごの男 (30px/コマで右へ) / f18-34 ポスターがしょんぼり / ずっと横パン
const MzFDust: React.FC<{ x: number; y: number; f: number; phase: number }> = ({ x, y, f, phase }) => (
  <g>
    {[0, 1, 2].map((k) => {
      const t = ((f + phase * 5 + k * 4) % 12) / 12;
      return <circle key={k} cx={x - 40 - t * 90 - k * 20} cy={y - 14 - t * 20} r={14 + t * 18} fill={C.dust} stroke={INK} strokeWidth={3} opacity={1 - t} />;
    })}
  </g>
);
const Mz126: React.FC<{ f: number }> = ({ f }) => {
  const pan = f * 1.6;
  const sad = seg(f, 18, 34);
  const RY = 960, RS = 0.8;
  const run = (start: number) => -220 + (f - start) * 30;
  const xB = run(0), xW = run(10), xS = run(20), xL = run(32);
  const hatT = Math.max(0, f - 6);
  return (
    <Frame f={f} seed={6126} bg={C.skyBot}>
      <MzFCorner f={f} tram={0} pan={pan} />
      <g transform={`translate(${-pan} 0)`}>
        <MzFTokiPoster x={1000} y={170} f={f} sad={sad} />
      </g>
      {/* 流し撮りの線 */}
      {Array.from({ length: 10 }, (_, i) => {
        const y = 640 + i * 34;
        const x = 1960 - ((f * 46 + i * 377) % 2400);
        return <line key={i} x1={x} y1={y} x2={x + 160 + (i % 3) * 60} y2={y} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.6} />;
      })}
      {/* 会社員 (書類を抱える。帽子が飛ぶ) */}
      {xB > -300 && xB < 2200 && (
        <g>
          <MzFDust x={xB} y={RY} f={f} phase={0} />
          <Person x={xB} y={RY} s={RS} f={f} pose="run" face="worried" gaze={[6, 0]} cloth={C.graySuit} clothDark={C.graySuitDark} hair="cap" lean={10} phase={1} />
          <MzFOn x={xB} y={RY} s={RS} f={f} phase={1} lean={10}>
            <path d="M -16 -160 L 0 -128 L 16 -160 Z" fill={KRP.white} stroke={INK} strokeWidth={3} />
            <g transform="translate(20 -112) rotate(-8)">
              <rect x={-40} y={-34} width={80} height={60} fill={KRP.white} stroke={INK} strokeWidth={4} />
              <rect x={-34} y={-42} width={80} height={60} fill={C.poster} stroke={INK} strokeWidth={4} />
              {[0, 1, 2].map((l) => <line key={l} x1={-24} y1={-28 + l * 14} x2={30} y2={-28 + l * 14} stroke={KRP.grayDark} strokeWidth={3} />)}
            </g>
          </MzFOn>
          {/* 飛んでいく山高帽 */}
          <g transform={`translate(${xB - 40 - hatT * 3} ${RY - 300 * RS - 170 * (1 - Math.exp(-hatT / 10))}) rotate(${-hatT * 11}) scale(${RS})`}>
            <g transform="translate(0 300)"><MzFHat kind="bowler" /></g>
          </g>
          <MzFSweat x={xB - 70} y={RY - 250 * RS} s={1} t={1} />
        </g>
      )}
      {/* 女の人 (裾をからげて走る・日本髪がゆれる) */}
      {xW > -300 && xW < 2200 && (
        <g>
          <MzFDust x={xW} y={RY} f={f} phase={1} />
          <MzFWoman x={xW} y={RY} s={RS} f={f} pose="run" face="worried" gaze={[6, 0]} cloth={C.enji} dark={C.enjiDark} hem={-52} lean={8 + Math.sin(f / 3) * 3} phase={2} />
          <MzFSweat x={xW - 76} y={RY - 240 * RS} s={1} t={1} />
        </g>
      )}
      {/* 学生 (学生帽・パンをくわえる) */}
      {xS > -300 && xS < 2200 && (
        <g>
          <MzFDust x={xS} y={RY} f={f} phase={2} />
          <Person x={xS} y={RY} s={RS} f={f} pose="run" face="surprised" gaze={[6, 0]} cloth={C.gakuran} clothDark={C.gakuran} hair="cap" lean={12} phase={3} />
          <MzFOn x={xS} y={RY} s={RS} f={f} phase={3} lean={12}>
            {[-140, -116, -92].map((by) => <circle key={by} cx={0} cy={by} r={5} fill={KRP.brass} stroke={INK} strokeWidth={2} />)}
            <MzFHat kind="gakusei" />
            <g transform="translate(24 -186) rotate(-10)">
              <rect x={0} y={-24} width={60} height={50} rx={14} fill={C.bread} stroke={INK} strokeWidth={4} />
              <rect x={8} y={-16} width={44} height={34} rx={8} fill={C.poster} />
            </g>
          </MzFOn>
        </g>
      )}
      {/* ポスターを貼った男まで (はしごを担いで) */}
      {xL > -400 && xL < 2300 && (
        <g>
          <MzFDust x={xL} y={RY} f={f} phase={3} />
          <MzFMan x={xL} y={RY} s={RS} f={f} pose="run" face="surprised" gaze={[6, -2]} cloth={C.happi} dark={C.indigoDark} hat="hachimaki" kimono={false} lean={10} phase={4} />
          <MzFOn x={xL} y={RY} s={RS} f={f} phase={4} lean={10}>
            <g transform="translate(0 -168) rotate(-6)">
              {[-14, 14].map((ry) => <line key={ry} x1={-300} y1={ry} x2={150} y2={ry} stroke={C.cartDark} strokeWidth={12} strokeLinecap="round" />)}
              {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-280 + i * 66} y1={-14} x2={-280 + i * 66} y2={14} stroke={C.cart} strokeWidth={9} />)}
            </g>
          </MzFOn>
          <MzFSweat x={xL - 60} y={RY - 260 * RS} s={1.1} t={1} />
          <MzFSweat x={xL + 70} y={RY - 280 * RS} s={0.9} t={1} />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #127 こうして、起きる時刻は、太陽から、時計と他人のもとへ、引っ越しました。
// 格: 山 / seed 6127
// どこ: 夜明けのイギリスの工業の町を見下ろす丘。左の空に昇りかけの太陽 (小さな顔)、右に工場の門と門の上の大時計 (KoujouMon)。
// 演出: 太陽からひもで降ろした「起きる時刻」の荷物 (目覚ましベルの形の赤いふろしき包み) を、引っ越し屋の小人ふたり
//       (男: はちまき・紺の作業着 / 女: 赤い作業着・スカート・後ろで結んだ茶色の髪) が大八車でえっちらおっちら運ぶ。
//       太陽は荷物を持っていかれて「え?」としょんぼり。工場の門の前では工場主 (黒い上着・山高帽・太っちょ・時計の鎖) が受け取りの判子をぽん。
// 動き: f0-16 荷物を降ろす / f16-118 大八車で丘を越える (カメラは左→右へパン) / f18-34 太陽がしょんぼり・? / f122-136 判子をぽん
const hill127 = (x: number) =>
  x < 760 ? 720 - 150 * Math.sin((Math.max(0, x) / 760) * Math.PI / 2)
    : x < 1150 ? 570 + 80 * (1 - Math.cos(((x - 760) / 390) * Math.PI)) / 2
      : 650;
const MzFBundle: React.FC<{ s?: number; stamp?: number }> = ({ s = 1, stamp = 0 }) => (
  <g transform={`scale(${s})`}>
    {/* ベルの形のふろしき包み (底が y=0) */}
    <path d="M -64 0 Q -66 -40 -48 -66 Q -40 -104 0 -106 Q 40 -104 48 -66 Q 66 -40 64 0 Z" fill={C.furoshiki} stroke={INK} strokeWidth={5} />
    {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={-40 + i * 20} cy={-30 - (i % 2) * 30} r={6} fill={KRP.white} opacity={0.85} />)}
    <rect x={-68} y={-8} width={136} height={14} rx={6} fill={C.furoshikiDark} stroke={INK} strokeWidth={4} />
    {/* 結び目 */}
    <path d="M 0 -104 Q -30 -140 -14 -146 Q 0 -130 0 -112 Q 0 -130 14 -146 Q 30 -140 0 -104 Z" fill={C.furoshiki} stroke={INK} strokeWidth={4} />
    <path d="M -64 -40 Q 0 -20 64 -40" stroke={C.hatBand} strokeWidth={5} fill="none" />
    <path d="M -10 -104 L -10 -4 M 10 -104 L 10 -4" stroke={C.hatBand} strokeWidth={5} />
    {/* 荷札 */}
    <g transform="translate(70 -70) rotate(10)">
      <line x1={-20} y1={0} x2={0} y2={0} stroke={C.hatBand} strokeWidth={3} />
      <rect x={0} y={-24} width={130} height={48} rx={6} fill={C.poster} stroke={INK} strokeWidth={4} />
      <text x={65} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK}>起きる時刻</text>
      {stamp > 0 && (
        <g transform={`translate(110 -16) scale(${pop(clamp01(stamp))}) rotate(-12)`}>
          <circle r={22} fill={KRP.white} stroke={KRP.red} strokeWidth={5} />
          <text y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.red}>受</text>
        </g>
      )}
    </g>
  </g>
);
const MzFMoverWoman: React.FC<{ x: number; y: number; s: number; f: number; lean: number; face: Face; phase: number }> = ({ x, y, s, f, lean, face, phase }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} pose="hold" face={face} gaze={[5, 0]} cloth={C.red} clothDark={C.redDark} hair="none" lean={lean} phase={phase} />
    <MzFOn x={x} y={y} s={s} f={f} phase={phase} lean={lean}>
      <path d="M -58 -98 L 58 -98 L 74 -22 L -74 -22 Z" fill={C.red} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -40 -98 L -46 -26 M 40 -98 L 46 -26" stroke={C.redDark} strokeWidth={4} />
      <MzFPonytail f={f} />
    </MzFOn>
  </g>
);
const Mz127: React.FC<{ f: number }> = ({ f }) => {
  const [st, sb] = [mixColor("#5A5890", "#83BDE6", 0.15), mixColor("#F2A363", "#DDF0F8", 0.2)];
  const tx = -260 * easeInOut(seg(f, 10, 130));
  const lower = easeOut(seg(f, 0, 14));
  const p = easeInOut(seg(f, 16, 118));
  const cx = lerp(430, 1170, p);
  const cy = hill127(cx);
  const slope = Math.atan2(hill127(cx + 20) - hill127(cx - 20), 40) * 180 / Math.PI;
  const step = Math.sin(f / 3.2);
  const sad = seg(f, 18, 30);
  const stampT = seg(f, 124, 132);
  const sunY = 360 - f * 0.25;
  const ox = 1340, oy = 652, os = 0.62;
  return (
    <Frame f={f} seed={6127} bg={sb}>
      <g transform={`translate(${tx * 1.25 - 120} -60) scale(1.25)`}>
        <MzFSky top={st} bot={sb} h={720} />
        {/* 太陽 (小さな顔) */}
        <g transform={`translate(270 ${sunY})`}>
          <circle r={180} fill={C.sun} opacity={0.22} />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M -12 -122 L 0 -160 L 12 -122 Z" fill={C.sunRay} stroke={INK} strokeWidth={3.5} transform={`rotate(${i * 30 + Math.sin(f / 14) * 4})`} />)}
          <circle r={110} fill={C.sun} stroke={INK} strokeWidth={6} />
          {/* 顔 */}
          {sad > 0.5
            ? <g><ellipse cx={-36} cy={-6} rx={9} ry={12} fill={INK} /><ellipse cx={36} cy={-6} rx={9} ry={12} fill={INK} />
                <path d="M -56 -24 L -26 -36 M 56 -24 L 26 -36" stroke={INK} strokeWidth={5} strokeLinecap="round" />
                <path d="M -24 44 Q 0 26 24 44" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /></g>
            : <g><path d="M -48 -6 Q -36 -18 -24 -6 M 24 -6 Q 36 -18 48 -6" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
                <path d="M -24 30 Q 0 52 24 30" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /></g>}
          <ellipse cx={-62} cy={22} rx={14} ry={8} fill={C.sunRay} opacity={0.7} /><ellipse cx={62} cy={22} rx={14} ry={8} fill={C.sunRay} opacity={0.7} />
          <MzFSweat x={84} y={-50} s={1.3} t={sad} />
          {/* 荷物をつるしていたひも (降ろすと空になる) */}
          <path d={`M 60 90 Q ${110 + lower * 30} ${160 + lower * 60} ${140 + lower * 20} ${lerp(200, 280, lower)}`} stroke={C.hatBand} strokeWidth={4} fill="none" opacity={1 - seg(f, 16, 26)} />
        </g>
        <QMark x={460} y={250} s={0.9} f={f} t={seg(f, 22, 32)} />
        {/* 工場の門 (左はしを空に溶かす) */}
        <defs>
          <linearGradient id="mzf127g" x1={680} y1={0} x2={920} y2={0} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#FFF" />
          </linearGradient>
          <mask id="mzf127m" maskUnits="userSpaceOnUse" x={-200} y={-200} width={3000} height={1600}>
            <rect x={-200} y={-200} width={3000} height={1600} fill="url(#mzf127g)" />
          </mask>
        </defs>
        <g mask="url(#mzf127m)">
          <g transform="translate(700 -30) scale(0.75)">
            <KoujouMon f={f} gate={1} hands={360} smoke={0.8} />
          </g>
        </g>
        {/* 遠くの町の屋根 (丘のふもと) */}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} transform={`translate(${-40 + i * 90} ${600 + (i % 3) * 14})`}>
            <rect x={0} y={0} width={80} height={60} fill={MP.brickDark} stroke={INK} strokeWidth={3} />
            <path d="M -6 2 L 40 -26 L 86 2 Z" fill={C.kawaraDark} stroke={INK} strokeWidth={3} />
            <rect x={56} y={-30} width={12} height={22} fill={MP.brickDark} stroke={INK} strokeWidth={2.5} />
            <rect x={14} y={16} width={16} height={18} fill={C.light} opacity={(i % 3) === 1 ? 0.9 : 0.3} />
          </g>
        ))}
        {/* 丘 */}
        <path d={"M -200 1200 L -200 " + hill127(0) + " " + Array.from({ length: 51 }, (_, i) => { const x = i * 50; return `L ${x} ${hill127(x)}`; }).join(" ") + " L 2600 650 L 2600 1200 Z"} fill={C.grass} stroke={INK} strokeWidth={6} />
        {/* 道のわだち */}
        <path d={"M 300 " + (hill127(300) + 40) + " " + Array.from({ length: 26 }, (_, i) => { const x = 300 + i * 40; return `L ${x} ${hill127(x) + 40}`; }).join(" ")} stroke={C.earthDark} strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.55} />
        {Array.from({ length: 30 }, (_, i) => { const x = rnd(127, i) * 2200 - 100; return <path key={i} d={`M ${x} ${hill127(x) + 80 + rnd(128, i) * 300} l 6 -16 l 6 16`} stroke={C.grassDark} strokeWidth={4} fill="none" />; })}
        {[[200, 110], [610, 160], [1500, 90], [1900, 140]].map(([fx, fy], i) => (
          <g key={i} transform={`translate(${fx} ${hill127(fx) + fy})`}>
            {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos(a * Math.PI / 180) * 9} cy={Math.sin(a * Math.PI / 180) * 9} r={7} fill={i % 2 ? KRP.white : KRP.yellow} stroke={INK} strokeWidth={2} />)}
            <circle r={5} fill={KRP.orange} />
          </g>
        ))}
        {/* 工場主 (門の前で待つ。太っちょ・山高帽・時計の鎖・判子) */}
        <Person x={ox} y={oy} s={os} f={f} pose={stampT > 0 ? "point" : "hold"} pointDir={-1} face={stampT > 0 ? "joy" : "smile"} gaze={[-5, 2]} cloth={C.hatBlack} clothDark={C.hatBlack} hair="cap" phase={5} />
        <MzFOn x={ox} y={oy} s={os} f={f} phase={5}>
          <ellipse cx={0} cy={-108} rx={74} ry={58} fill={C.hatBlack} stroke={INK} strokeWidth={5} />
          <path d="M -30 -150 L 0 -116 L 30 -150" stroke={KRP.white} strokeWidth={8} fill="none" />
          <path d="M -40 -100 Q -10 -76 30 -100" stroke={KRP.brass} strokeWidth={4} fill="none" />
          <circle cx={32} cy={-100} r={8} fill={KRP.brass} stroke={INK} strokeWidth={3} />
          <path d="M -22 -198 Q -10 -206 0 -198 Q 10 -206 22 -198 Q 12 -190 0 -196 Q -12 -190 -22 -198 Z" fill={C.hair} />
          <MzFHat kind="bowler" />
          {/* 判子 */}
          <g transform={stampT > 0 ? `translate(-160 ${-150 + Math.sin(Math.PI * stampT) * -30})` : "translate(0 -136)"}>
            <rect x={-10} y={-34} width={20} height={34} rx={6} fill={C.cartDark} stroke={INK} strokeWidth={3.5} />
            <rect x={-16} y={-4} width={32} height={14} rx={3} fill={KRP.red} stroke={INK} strokeWidth={3.5} />
          </g>
        </MzFOn>
        {/* 大八車と荷物と小人ふたり */}
        <g transform={`translate(${cx} ${cy}) rotate(${slope}) scale(1.15)`}>
          {/* 台 */}
          <rect x={-120} y={-86} width={240} height={20} fill={C.cart} stroke={INK} strokeWidth={5} />
          {[-100, -40, 20, 80].map((bx) => <line key={bx} x1={bx} y1={-86} x2={bx} y2={-66} stroke={C.cartDark} strokeWidth={3} />)}
          <path d="M 120 -78 L 230 -70" stroke={C.cartDark} strokeWidth={10} strokeLinecap="round" />
          <path d="M 120 -78 L 230 -70" stroke={C.cart} strokeWidth={5} strokeLinecap="round" />
          {/* 荷物 */}
          <g transform={`translate(0 ${-86 - (1 - lower) * 40})`}><MzFBundle s={0.72} stamp={stampT} /></g>
          {/* 大きな車輪 */}
          <g transform={`translate(0 -34) rotate(${p * 900})`}>
            <circle r={34} fill="none" stroke={C.cartDark} strokeWidth={9} />
            <circle r={34} fill="none" stroke={INK} strokeWidth={3} />
            {Array.from({ length: 8 }, (_, i) => <line key={i} y2={-32} stroke={C.cartDark} strokeWidth={4} transform={`rotate(${i * 45})`} />)}
            <circle r={8} fill={C.cart} stroke={INK} strokeWidth={3} />
          </g>
        </g>
          {/* 後ろで押す女の人 */}
          <MzFMoverWoman x={cx - 150} y={hill127(cx - 150) + 4} s={0.5} f={f} lean={14 + step * 2} face={p > 0.05 && p < 0.55 ? "worried" : "smile"} phase={1} />
          {/* 前で引く男の人 */}
          <MzFMan x={cx + 260} y={hill127(cx + 260) + 4} s={0.5} f={f} pose="hold" face={p > 0.05 && p < 0.55 ? "worried" : "smile"} gaze={[5, 0]} lean={12 + step * 2} cloth={C.indigo} dark={C.indigoDark} hat="hachimaki" kimono={false} phase={2} />
          {p > 0.03 && p < 0.97 && <MzFSweat x={cx + 310} y={hill127(cx + 260) - 170} s={0.8} t={1} />}
          {p > 0.03 && p < 0.97 && <MzFSweat x={cx - 100} y={hill127(cx - 150) - 165} s={0.8} t={1} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #128 でも、体の時計は、相変わらず、太陽を見ています。
// 格: 山 / seed 6128
// どこ: あなたの体の中、脳の奥の小部屋 (柔らかいピンクの壁・管・天井近くの丸い小窓=目の奥の窓)。真ん中に大きな体内時計。
// 演出: 小窓から外の太陽の光が細く差し込む。Kobito 3人が、左の壁に貼られた工場の時計のポスターには背を向け、
//       望遠鏡で太陽をのぞき、大きなハンドルを回して針を光の方へじわっと寄せる。1人がポスターをちらっと見て首を振り、太陽に向き直る。
// 動き: f0-16 光が差し込む / f10-40 ハンドルが回り針が光の方へ / f52-92 ポスターをちらっと→首を振る (ゆっくり) / ゆっくり寄る
const Mz128: React.FC<{ f: number }> = ({ f }) => {
  const beam = easeOut(seg(f, 0, 16));
  const zoom = 1 + 0.08 * easeInOut(seg(f, 0, 143));
  const lagDeg = 50 * 0.6;
  const target = 40 / (360 + lagDeg);
  const hand = lerp(0.85, 1 + target, easeInOut(seg(f, 10, 40))) % 1;
  const crank = f * 4;
  const glance = f >= 52 && f < 68;
  const shake = f >= 68 && f < 92 ? Math.sin((f - 68) / 2.2) * 10 : 0;
  const CX = 960, CY = 500, CS = 1.42;
  const winX = 1740, winY = 150;
  return (
    <Frame f={f} seed={6128} bg={C.brainWall}>
      <g transform={`translate(960 480) scale(${zoom}) translate(-960 -480)`}>
        {/* ピンクの壁 (ぷにぷにの模様) */}
        <rect x={-100} y={-100} width={2120} height={1300} fill={C.brainWall} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -100 ${40 + i * 120} Q 200 ${10 + i * 120 + Math.sin(f / 30 + i) * 8} 480 ${50 + i * 120} T 1060 ${40 + i * 120} T 1640 ${50 + i * 120} T 2220 ${40 + i * 120}`} stroke={C.brainWallDark} strokeWidth={6} fill="none" opacity={0.5} />
        ))}
        {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={rnd(128, i) * 1920} cy={rnd(129, i) * 1080} r={10 + rnd(130, i) * 16} fill={C.brainWallLight} opacity={0.7} />)}
        {/* 管 (天井と壁を這う) */}
        {[[-100, 60, 700, 30, 900, -100], [2020, 300, 1800, 420, 1500, 1200], [-100, 760, 200, 700, 300, 1200]].map(([a, b, c, d, e, g], i) => (
          <g key={i}>
            <path d={`M ${a} ${b} Q ${c} ${d} ${e} ${g}`} stroke={INK} strokeWidth={46} fill="none" />
            <path d={`M ${a} ${b} Q ${c} ${d} ${e} ${g}`} stroke={C.tube} strokeWidth={36} fill="none" />
            <path d={`M ${a} ${b} Q ${c} ${d} ${e} ${g}`} stroke={C.tubeDark} strokeWidth={6} fill="none" strokeDasharray="4 40" />
            {/* 管の中を流れるつぶ */}
            <circle cx={lerp(lerp(a, c, ((f / 60 + i / 3) % 1)), lerp(c, e, ((f / 60 + i / 3) % 1)), ((f / 60 + i / 3) % 1))} cy={lerp(lerp(b, d, ((f / 60 + i / 3) % 1)), lerp(d, g, ((f / 60 + i / 3) % 1)), ((f / 60 + i / 3) % 1))} r={10} fill={KRP.white} opacity={0.7} />
          </g>
        ))}
        {/* 床 */}
        <path d="M -100 860 Q 960 820 2020 860 L 2020 1200 L -100 1200 Z" fill={C.brainWallDark} stroke={INK} strokeWidth={6} />
        {/* 工場の時計のポスター (左の壁に小さく) */}
        <g transform="translate(250 360) rotate(-4)">
          <rect x={-110} y={-140} width={220} height={260} fill={C.poster} stroke={INK} strokeWidth={5} />
          <rect x={-100} y={20} width={200} height={90} fill={MP.brick} stroke={INK} strokeWidth={3} />
          <rect x={50} y={-40} width={26} height={70} fill={MP.brickDark} stroke={INK} strokeWidth={3} />
          <MzFClock x={-20} y={-50} r={56} h={6} m={0} roman rim={MP.ironLight} />
          <circle cx={0} cy={-150} r={9} fill={KRP.red} stroke={INK} strokeWidth={3} />
        </g>
        {/* 丸い小窓 (目の奥) と外の太陽 */}
        <g>
          <circle cx={winX} cy={winY} r={112} fill={MP.dawnSoft} stroke={INK} strokeWidth={10} />
          <circle cx={winX} cy={winY} r={112} fill="none" stroke={C.tubeDark} strokeWidth={22} opacity={0.5} />
          <circle cx={winX + 30} cy={winY - 10} r={44} fill={C.sun} stroke={INK} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={winX + 30} y1={winY - 66} x2={winX + 30} y2={winY - 80} stroke={C.sunRay} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45 + f} ${winX + 30} ${winY - 10})`} />)}
          <path d={`M ${winX - 112} ${winY + 40} Q ${winX} ${winY + 20} ${winX + 112} ${winY + 50}`} stroke={MP.brickDark} strokeWidth={6} fill="none" opacity={0.6} />
          <path d={`M ${winX - 80} ${winY - 60} A 100 100 0 0 1 ${winX - 20} ${winY - 98}`} stroke={KRP.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
        {/* 差し込む光 */}
        <polygon points={`${winX - 60},${winY + 70} ${winX + 40},${winY + 100} ${lerp(winX, CX + 120, beam)},${lerp(winY, CY + 40, beam)} ${lerp(winX, CX - 20, beam)},${lerp(winY, CY - 80, beam)}`} fill={C.beam} opacity={0.55 + 0.08 * Math.sin(f / 5)} />
        {Array.from({ length: 6 }, (_, i) => { const t = ((f / 50 + i / 6) % 1) * beam; return <circle key={i} cx={lerp(winX - 20, CX + 40, t)} cy={lerp(winY + 80, CY - 20, t)} r={4} fill={KRP.white} opacity={0.8} />; })}
        {/* 体内時計 (大きく) */}
        <TainaiDokei x={CX} y={CY} s={CS} f={f} lag={0.6} reset={0} hand={hand} label={false} />
        {/* 大きなハンドル (時計の右下の軸) */}
        <g transform={`translate(${CX + 300} ${CY + 250})`}>
          <rect x={-14} y={0} width={28} height={110} fill={MP.brassDark} stroke={INK} strokeWidth={5} />
          <g transform={`rotate(${crank})`}>
            <circle r={44} fill={MP.brass} stroke={INK} strokeWidth={6} />
            {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-7} y={-56} width={14} height={16} fill={MP.brass} stroke={INK} strokeWidth={3} transform={`rotate(${i * 36})`} />)}
            <line x1={0} y1={0} x2={0} y2={-80} stroke={INK} strokeWidth={10} strokeLinecap="round" />
            <circle cx={0} cy={-80} r={12} fill={KRP.red} stroke={INK} strokeWidth={4} />
          </g>
          <circle r={10} fill={INK} />
          <path d={`M -60 -80 A 90 90 0 0 1 60 -80`} stroke={KRP.white} strokeWidth={5} fill="none" strokeDasharray="10 10" opacity={0.8} />
        </g>
        {/* Kobito 1: ハンドルを回す */}
        <Kobito x={CX + 300 + Math.cos(crank * Math.PI / 180) * 6 - 70} y={CY + 370} s={0.55} f={f} pose="hold" face="smile" gaze={[5, -3]} lean={6} phase={1} />
        {/* Kobito 2: 望遠鏡で太陽をのぞく (時計の上の足場) */}
        <g>
          <rect x={1330} y={420} width={260} height={18} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
          {[1350, 1570].map((lx) => <line key={lx} x1={lx} y1={438} x2={lx} y2={860} stroke={MP.woodDark} strokeWidth={8} />)}
          <Kobito x={1460} y={422} s={0.5} f={f} pose="hold" face="normal" gaze={[5, -5]} phase={2} />
          <g transform={`translate(${1460 + 20} ${422 - 228 * 0.5}) rotate(-44)`}>
            <rect x={0} y={-12} width={120} height={24} rx={6} fill={MP.brass} stroke={INK} strokeWidth={4} />
            <rect x={96} y={-17} width={34} height={34} rx={6} fill={MP.brassDark} stroke={INK} strokeWidth={4} />
            <rect x={-10} y={-8} width={16} height={16} rx={4} fill={MP.brassDark} stroke={INK} strokeWidth={3} />
          </g>
        </g>
        {/* Kobito 3: ポスターをちらっと見て、首を振って太陽に向き直る */}
        <Kobito x={560} y={830} s={0.6} f={f} pose={glance ? "point" : "hold"} pointDir={-1} face={glance ? "normal" : f >= 68 ? "smile" : "normal"} gaze={glance ? [-6, -2] : [6, -5]} lean={shake} phase={3} />
        {f >= 68 && f < 92 && <g stroke={INK} strokeWidth={5} strokeLinecap="round"><path d="M 470 610 q -16 10 0 20" fill="none" /><path d="M 650 610 q 16 10 0 20" fill="none" /></g>}
        {f >= 92 && <path d="M 600 650 l 30 -34" stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #129 体は太陽の時刻で。仕事は、他人の時刻で。
// 格: 図 / seed 6129
// どこ: 画面を左右に割る。左=あなたの体の中の小部屋 (ピンクの壁) の体内時計。右=工場の門の上の大時計 (KoujouMon)。境目に細いれんがの壁。
// 演出: 左は Kobito が朝の光に合わせて針を回し (夜明け前を指す)、右は工場主の手が大時計の針を6時に押さえる。両方の針の先から点線が伸び、
//       壁のところですれ違う (×)。壁の上のパジャマのあなたは、左の手首を Kobito に、右の手首を工場主の手につかまれ、腕がびよーんと伸びる。
// 動き: f0-16 左右の針が動く / f12-26 点線が伸びてすれ違う / f24-42 左右に引っぱられて腕が伸びる / その後もぐいぐい綱引き
const Mz129: React.FC<{ f: number }> = ({ f }) => {
  const rs = easeOut(0.3);
  const lagDeg = 30 * (1 - rs);
  const lap = 360 + lagDeg;
  const targetDeg = 67.5; // 夜明け前 (4時半)
  const lHand = (targetDeg * easeInOut(seg(f, 0, 16))) / (lap * (1 - rs));
  const rMin = lerp(320, 360, easeInOut(seg(f, 0, 16)));
  const dots = seg(f, 12, 26);
  const tug = f > 42 ? Math.sin(f / 6) * 12 : 0;
  const e = 80 * easeOut(seg(f, 24, 42)) + tug;
  const ys = 0.9, yx = 960, yy = 860;
  const armY = yy - 148 * ys;
  const LX = 470, LY = 450, LS = 0.95;
  const lTip: [number, number] = [LX + Math.sin(targetDeg * Math.PI / 180) * 180 * 0.94 * LS, LY - Math.cos(targetDeg * Math.PI / 180) * 180 * 0.94 * LS];
  const rTip: [number, number] = [1440, 340 + 54];
  const half = (side: 1 | -1) => (
    <g clipPath={`url(#mzf129${side === 1 ? "R" : "L"})`}>
      <Person x={yx} y={yy} s={ys} f={f} pose="point" pointDir={side} face="worried" gaze={[0, 2]} cloth={MP.you} clothDark={MP.youDark} hair="cap" phase={2} still />
    </g>
  );
  return (
    <Frame f={f} seed={6129} bg={C.brainWall}>
      <defs>
        <clipPath id="mzf129L"><rect x={-100} y={-100} width={1060} height={1300} /></clipPath>
        <clipPath id="mzf129R"><rect x={960} y={-100} width={1100} height={1300} /></clipPath>
        <clipPath id="mzf129K"><rect x={990} y={-100} width={1100} height={1300} /></clipPath>
      </defs>
      {/* 左: 体の中の小部屋 */}
      <rect x={-100} y={-100} width={1080} height={1300} fill={C.brainWall} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M -100 ${60 + i * 120} Q 200 ${30 + i * 120 + Math.sin(f / 30 + i) * 8} 480 ${70 + i * 120} T 1060 ${60 + i * 120}`} stroke={C.brainWallDark} strokeWidth={6} fill="none" opacity={0.5} />)}
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={rnd(129, i) * 900} cy={rnd(130, i) * 1000} r={10 + rnd(131, i) * 14} fill={C.brainWallLight} opacity={0.7} />)}
      <path d="M -100 880 Q 400 850 960 880 L 960 1200 L -100 1200 Z" fill={C.brainWallDark} stroke={INK} strokeWidth={6} />
      <path d="M -100 120 Q 300 60 520 -100" stroke={INK} strokeWidth={44} fill="none" />
      <path d="M -100 120 Q 300 60 520 -100" stroke={C.tube} strokeWidth={34} fill="none" />
      <TainaiDokei x={LX} y={LY} s={LS} f={f} lag={0.6} reset={0.3} hand={lHand} label={false} />
      {/* 右: 工場の門の大時計 */}
      <g clipPath="url(#mzf129K)">
        <g transform="translate(480 40)">
          <KoujouMon f={f} gate={1} hands={rMin} smoke={0.7} />
        </g>
        {/* 工場主の手 (針を押さえる) */}
        <path d="M 2000 200 L 1530 300" stroke={INK} strokeWidth={50} strokeLinecap="round" />
        <path d="M 2000 200 L 1530 300" stroke={C.hatBlack} strokeWidth={40} strokeLinecap="round" />
        <rect x={1540} y={270} width={24} height={62} rx={6} fill={KRP.white} stroke={INK} strokeWidth={4} transform="rotate(-12 1552 300)" />
        <g transform="translate(1478 318) rotate(-12)">
          <ellipse rx={34} ry={26} fill={KRP.white} stroke={INK} strokeWidth={5} />
          <rect x={-58} y={-12} width={40} height={20} rx={10} fill={KRP.white} stroke={INK} strokeWidth={4} />
        </g>
      </g>
      {/* 境目のれんがの壁 */}
      <rect x={930} y={860} width={60} height={300} fill={MP.brick} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 6 }, (_, r) => <g key={r}><line x1={930} y1={880 + r * 30} x2={990} y2={880 + r * 30} stroke={MP.brickDark} strokeWidth={3} /><line x1={960 + (r % 2) * 15 - 8} y1={860 + r * 30} x2={960 + (r % 2) * 15 - 8} y2={880 + r * 30} stroke={MP.brickDark} strokeWidth={3} /></g>)}
      <rect x={920} y={846} width={80} height={18} fill={MP.stone} stroke={INK} strokeWidth={4} />
      <line x1={960} y1={-40} x2={960} y2={560} stroke={INK} strokeWidth={6} strokeDasharray="20 14" opacity={0.5} />
      {/* 点線 (すれ違う) */}
      {dots > 0 && (
        <g fill="none" strokeWidth={7} strokeLinecap="round" strokeDasharray="4 18">
          <path d={`M ${lTip[0]} ${lTip[1]} L ${lerp(lTip[0], 1120, dots)} ${lerp(lTip[1], 260, dots)}`} stroke={MP.dawn} />
          <path d={`M ${rTip[0] - 30} ${rTip[1] + 20} L ${lerp(rTip[0] - 30, 800, dots)} ${lerp(rTip[1] + 20, 560, dots)}`} stroke={MP.night} />
        </g>
      )}
      <XMark x={960} y={420} s={0.8} t={seg(f, 24, 32)} />
      {/* 左の Kobito (管の足場の上で手首をつかむ) */}
      <rect x={560} y={yy - 148 * ys + 74} width={220} height={20} rx={10} fill={C.tube} stroke={INK} strokeWidth={5} />
      <Kobito x={yx - 153 * ys - e - 153 * 0.5 + 6} y={armY + 148 * 0.5} s={0.5} f={f} pose="point" pointDir={1} face="angry" gaze={[6, 0]} lean={-8} phase={1} />
      {/* 右の工場主の手 (手首をつかむ) */}
      <path d={`M 2000 ${armY + 60} L ${yx + 153 * ys + e + 40} ${armY + 6}`} stroke={INK} strokeWidth={46} strokeLinecap="round" />
      <path d={`M 2000 ${armY + 60} L ${yx + 153 * ys + e + 40} ${armY + 6}`} stroke={C.hatBlack} strokeWidth={36} strokeLinecap="round" />
      {/* あなた (左右に引っぱられて腕が伸びる) */}
      {half(-1)}
      {half(1)}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd === 1 ? yx + 140 * ys : yx - 153 * ys - e - 2} y={armY - 11 * ys} width={13 * ys + e + 2} height={22 * ys} rx={10} fill={MP.you} stroke={INK} strokeWidth={4} />
          <circle cx={yx + sd * (153 * ys + e)} cy={armY} r={11} fill={KRP.white} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <ellipse cx={yx + 153 * ys + e + 24} cy={armY + 2} rx={28} ry={22} fill={KRP.white} stroke={INK} strokeWidth={5} />
      <MzFSweat x={yx - 80} y={yy - 300 * ys} s={1.1} t={seg(f, 30, 38)} />
      <MzFSweat x={yx + 84} y={yy - 280 * ys} s={0.9} t={seg(f, 34, 42)} />
      <TagPlate x={130} y={220} text="体" size={50} t={seg(f, 2, 12)} />
      <TagPlate x={1790} y={220} text="仕事" size={50} t={seg(f, 4, 14)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #130 起きられない理由は、このずれにあります。
// 格: 山 / seed 6130
// どこ: あなたの寝室 (Shinshitsu: sky=0.4, sleeper=1, alarms=1)。夜明け前、窓の外はまだ紺。
// 演出: 寝ているあなたの頭の上に、体の中の体内時計が泡のように透けて見える。針はまだ夜。その前で Kobito が毛布にくるまって寝ている。
//       ナイトテーブルのスマホは6時でアラームが鳴る。体の時計とスマホの間に赤い扇形の「ずれ」が開き、
//       ベッドの下にも赤い裂け目が開いて、あなたは掛け布団ごとずぶずぶ沈んでいく。目は開かず、片腕だけが宙をつかむ。
// 動き: f0- アラームが鳴る / f6-24 赤い扇形が開く / f20-42 体が沈む・腕が宙をつかむ / f50 Kobito が寝返り / カメラは全景から隙間へ寄る
const SINK_SHAPE = "M 200 700 Q 200 560 420 560 L 1060 560 Q 1270 560 1270 700 L 1270 790 Q 1270 880 1080 880 L 400 880 Q 200 880 200 790 Z";
const Mz130: React.FC<{ f: number }> = ({ f }) => {
  const fan = easeOut(seg(f, 6, 24));
  const sinkLv = easeInOut(seg(f, 20, 42));
  const sink = sinkLv * 30;
  const goo = lerp(860, 706, sinkLv) - Math.max(0, f - 42) * 0.25;
  const zoom = 1 + 0.14 * easeInOut(seg(f, 0, 94));
  const arm = f < 20 ? 0 : 0.42 + 0.06 * Math.sin(f / 5);
  const AX = 740, AY = 640, AR = 600;
  const a0 = -77 * Math.PI / 180;
  const a1 = lerp(-77, -2, fan) * Math.PI / 180;
  const BX = 800, BY = 290;
  const roll = f >= 50 ? 1 : 0;
  return (
    <Frame f={f} seed={6130} dark bg={MP.nightDeep}>
      <defs>
        <clipPath id="mzf130pit"><path d={SINK_SHAPE} /></clipPath>
      </defs>
      <g transform={`translate(760 600) scale(${zoom}) translate(-760 -600)`}>
        <Shinshitsu f={f} sky={0.4} sleeper={1} alarms={1} arm={arm} />
        {/* 赤い扇形の「ずれ」(体の時計 ↔ スマホ) */}
        {fan > 0 && (
          <g>
            <path d={`M ${AX} ${AY} L ${AX + Math.cos(a0) * AR} ${AY + Math.sin(a0) * AR} A ${AR} ${AR} 0 0 1 ${AX + Math.cos(a1) * AR} ${AY + Math.sin(a1) * AR} Z`} fill={C.rift} opacity={0.28 + 0.05 * Math.sin(f / 4)} />
            <line x1={AX} y1={AY} x2={AX + Math.cos(a0) * AR} y2={AY + Math.sin(a0) * AR} stroke={MP.night} strokeWidth={10} strokeLinecap="round" />
            <line x1={AX} y1={AY} x2={AX + Math.cos(a1) * AR} y2={AY + Math.sin(a1) * AR} stroke={MP.bell} strokeWidth={10} strokeLinecap="round" />
            <path d={`M ${AX + Math.cos(a0) * 200} ${AY + Math.sin(a0) * 200} A 200 200 0 0 1 ${AX + Math.cos(a1) * 200} ${AY + Math.sin(a1) * 200}`} stroke={KRP.white} strokeWidth={6} fill="none" strokeDasharray="12 10" />
          </g>
        )}
        {/* ずれの裂け目に、ベッドごと沈んでいく (赤い沼の面がせり上がる) */}
        <g clipPath="url(#mzf130pit)">
          {sinkLv > 0 && (
            <g>
              <path d={`M 150 ${goo} ${Array.from({ length: 23 }, (_, i) => `Q ${170 + i * 50} ${goo - 14 * Math.sin(f / 4 + i)} ${200 + i * 50} ${goo}`).join(" ")} L 1300 900 L 150 900 Z`} fill={C.rift} stroke={MP.bell} strokeWidth={6} opacity={0.93} />
              {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={260 + i * 140} cy={goo + 40 + (i % 2) * 40} rx={50} ry={10} fill={C.riftDeep} opacity={0.5} />)}
              {Array.from({ length: 5 }, (_, i) => { const t = ((f + i * 9) % 30) / 30; return <circle key={i} cx={320 + i * 170} cy={goo - t * 30} r={8 + t * 6} fill="none" stroke={MP.bell} strokeWidth={3} opacity={1 - t} />; })}
            </g>
          )}
        </g>
        {/* 宙をつかむ手の印 */}
        {arm > 0 && <g stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
          <line x1={1150} y1={560 + sink * 0.3} x2={1166} y2={536 + sink * 0.3} /><line x1={1176} y1={572 + sink * 0.3} x2={1200} y2={560 + sink * 0.3} />
        </g>}
        {/* 体内時計の泡 (透けて見える) */}
        {[[1040, 540, 14], [1000, 490, 20], [950, 440, 26]].map(([bx, by, r], i) => <circle key={i} cx={bx} cy={by} r={r} fill={MP.you} opacity={0.35} stroke={KRP.white} strokeWidth={3} />)}
        <circle cx={BX} cy={BY} r={170} fill={MP.you} opacity={0.28} />
        <circle cx={BX} cy={BY} r={170} fill="none" stroke={KRP.white} strokeWidth={6} strokeDasharray="16 10" opacity={0.85} />
        <TainaiDokei x={BX} y={BY - 10} s={0.52} f={f} lag={0.6} hand={0.06} kobito={false} label={false} />
        {/* 毛布にくるまって寝ている Kobito (寝返り) */}
        <g transform={`translate(${BX + 20} ${BY + 128}) scale(${roll ? -1 : 1} 1) translate(40 0)`}>
          <g transform="rotate(-90)">
            <Kobito x={0} y={0} s={0.42} f={0} face="normal" phase={4} />
          </g>
          {[-10, 10].map((ey) => <g key={ey}><ellipse cx={-93} cy={ey} rx={8} ry={7} fill={KRP.white} /><path d={`M -89 ${ey - 5} Q -85 ${ey} -89 ${ey + 5}`} stroke={INK} strokeWidth={3} fill="none" /></g>)}
          <path d="M -66 -36 Q -14 -54 40 -32 L 42 22 L -66 22 Z" fill={MP.dawnSoft} stroke={INK} strokeWidth={4} />
          <path d="M -56 -18 L 34 -14 M -56 4 L 34 6" stroke={MP.dawn} strokeWidth={4} />
        </g>
        <text x={BX + 100} y={BY + 60 - (f % 40)} fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.white} opacity={0.9 - (f % 40) / 50}>z</text>
      </g>
      <TagPlate x={1240} y={250} text="ずれ" size={46} t={seg(f, 14, 24)} color={KRP.red} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #131 では、他人の時刻に、たくさんの人を、どうやって起こしたのか。
// 格: 並 / seed 6131
// どこ: 午前4時ごろのイギリスの工業の町を高い空から見下ろす。れんがの長屋が何列も段々に並び、窓は真っ暗。奥に工場の門の大時計だけがぼんやり光る。
// 演出: 窓ごとに「Zzz」の小さな泡が何十個もぷかぷか (町じゅうが寝ている)。大時計の長針が6時に向かって少しずつ進み、横に大きな「?」が揺れる。
//       野良猫が1匹、屋根の棟を歩く。カメラは「どの窓が先に起きるか」探すように町の上をゆっくり横パン。
// 動き: f0-166 横パン / Zzz がぷかぷか / 大時計の針が進む / 「?」が揺れる / 猫が屋根を歩く
const Mz131: React.FC<{ f: number }> = ({ f }) => {
  const tx = -320 * (f / 166);
  const rows = [
    { y: 420, n: 14, w: 170, s: 0.62 },
    { y: 610, n: 12, w: 205, s: 0.78 },
    { y: 830, n: 10, w: 250, s: 0.95 },
  ];
  const catX = 300 + f * 5;
  return (
    <Frame f={f} seed={6131} dark bg={C.townNight}>
      <g transform={`translate(${tx * 0.4} 0)`}>
        {/* 奥の工場の門 (左はしと下を夜に溶かす) */}
        <defs>
          <radialGradient id="mzf131g" cx={1283} cy={140} r={430} gradientUnits="userSpaceOnUse">
            <stop offset="0.45" stopColor="#FFF" /><stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="mzf131m" maskUnits="userSpaceOnUse" x={-400} y={-200} width={3000} height={1600}>
            <rect x={-400} y={-200} width={3000} height={1600} fill="url(#mzf131g)" />
          </mask>
        </defs>
        <MzFSky top={MP.nightDeep} bot={C.townNight} h={400} />
        <g mask="url(#mzf131m)">
          <g transform="translate(880 -20) scale(0.42)">
            <KoujouMon f={f} gate={0} hands={300 + f * 0.12} smoke={0.5} sky={0.15} />
          </g>
        </g>
        {/* 大時計のぼんやりした光と「?」 */}
        <circle cx={880 + 960 * 0.42} cy={-20 + 300 * 0.42} r={110} fill={MP.glow} opacity={0.16 + 0.04 * Math.sin(f / 8)} />
        <g transform={`rotate(${Math.sin(f / 12) * 10} 1400 30)`}>
          <line x1={1400} y1={30} x2={1400} y2={70} stroke={INK} strokeWidth={4} />
          <QMark x={1400} y={130} s={0.9} f={f} t={seg(f, 4, 14)} />
        </g>
      </g>
      <g transform={`translate(${tx} 0)`}>
        {/* 長屋の列 (奥から手前へ) */}
        {rows.map((r, ri) => (
          <g key={ri}>
            {/* 屋根 (上から見た斜めの面) */}
            <path d={`M -200 ${r.y - 150 * r.s} L 2600 ${r.y - 150 * r.s} L 2600 ${r.y} L -200 ${r.y} Z`} fill={ri % 2 ? C.roofNight : C.roofNightLight} stroke={INK} strokeWidth={5} />
            {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-200 + i * 70} y1={r.y - 150 * r.s} x2={-220 + i * 70} y2={r.y} stroke={INK} strokeWidth={2} opacity={0.35} />)}
            {/* 煙突 */}
            {Array.from({ length: r.n }, (_, i) => (
              <g key={i}>
                <rect x={-150 + i * r.w + r.w * 0.7} y={r.y - 120 * r.s} width={34 * r.s} height={60 * r.s} fill={C.wallNight} stroke={INK} strokeWidth={4} />
                <rect x={-156 + i * r.w + r.w * 0.7} y={r.y - 128 * r.s} width={46 * r.s} height={12 * r.s} fill={C.wallNightLight} stroke={INK} strokeWidth={3} />
              </g>
            ))}
            {/* 正面の壁と窓 */}
            <rect x={-200} y={r.y} width={2800} height={130 * r.s} fill={C.wallNight} stroke={INK} strokeWidth={5} />
            {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-200} y1={r.y + 10 + i * 12 * r.s} x2={2600} y2={r.y + 10 + i * 12 * r.s} stroke={C.wallNightLight} strokeWidth={2} opacity={i * 12 < 120 ? 0.35 : 0} />)}
            {Array.from({ length: r.n }, (_, i) => {
              const wx = -150 + i * r.w + r.w * 0.2;
              const wy = r.y + 30 * r.s;
              return (
                <g key={i}>
                  <rect x={wx} y={wy} width={56 * r.s} height={70 * r.s} fill={C.winDark} stroke={INK} strokeWidth={4} />
                  <line x1={wx + 28 * r.s} y1={wy} x2={wx + 28 * r.s} y2={wy + 70 * r.s} stroke={INK} strokeWidth={3} />
                  <rect x={wx + r.w * 0.45} y={wy + 10 * r.s} width={40 * r.s} height={90 * r.s} fill={C.deskWoodDark} stroke={INK} strokeWidth={3} />
                  {/* Zzz の泡 */}
                  {[0, 1].map((k) => {
                    const t = ((f + i * 17 + ri * 29 + k * 30) % 60) / 60;
                    return (
                      <g key={k} transform={`translate(${wx + 50 * r.s + Math.sin(t * 6 + i) * 10} ${wy - t * 80 * r.s})`} opacity={Math.sin(t * Math.PI)}>
                        <circle r={22 * r.s} fill={C.zzz} opacity={0.35} stroke={C.zzz} strokeWidth={2} />
                        <text y={9 * r.s} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24 * r.s} fill={C.zzz}>{k ? "z" : "Z"}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
            {/* 路地とガス灯の小さな光 */}
            <rect x={-200} y={r.y + 130 * r.s} width={2800} height={ri === 2 ? 400 : 40 * r.s} fill={C.shadow} opacity={0.7} />
            {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-60 + i * 450 + ri * 120} cy={r.y + 150 * r.s} r={8 * r.s} fill={MP.glow} opacity={0.85} />)}
          </g>
        ))}
        {/* 屋根の棟を歩く野良猫 */}
        <g transform={`translate(${catX} ${rows[1].y - 150 * 0.78 + 4}) scale(0.75)`}>
          <path d={`M -40 -24 Q -80 ${-60 + Math.sin(f / 5) * 10} -70 -90`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M -50 0 Q -50 -40 0 -42 Q 46 -40 46 0 Z" fill={C.catDark} stroke={INK} strokeWidth={4} />
          <circle cx={52} cy={-44} r={22} fill={C.catDark} stroke={INK} strokeWidth={4} />
          <path d="M 36 -58 L 40 -80 L 52 -64 Z M 60 -64 L 72 -80 L 72 -56 Z" fill={C.catDark} stroke={INK} strokeWidth={3} />
          <circle cx={48} cy={-46} r={4} fill={MP.glow} /><circle cx={62} cy={-46} r={4} fill={MP.glow} />
          {[-36, -14, 12, 34].map((lx, i) => <rect key={lx} x={lx - 5} y={-6 + (i % 2 ? Math.sin(f / 2) * 3 : -Math.sin(f / 2) * 3)} width={10} height={14} rx={4} fill={C.catDark} stroke={INK} strokeWidth={3} />)}
        </g>
      </g>
      <TagPlate x={1720} y={250} text="午前4時" size={44} t={seg(f, 2, 12)} />
      <TagPlate x={1720} y={350} text="イギリス" size={44} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #132 イギリスの工業の町には、ちょっと変わった仕事が、生まれていました。
// 格: 山 / seed 6132
// どこ: MachiNami (窓は全部暗い・sky=0) の通り。2階建てのれんがの長屋・2階の寝室の窓・石畳・ガス灯・遠くの工場の煙突。夜明け前の紺。
// 演出: 霧の向こう (画面の右の外) から、石畳をこつこつ歩く足音 (音の線と「コツ」) と、長い棒の影がガス灯の光の中へすーっと伸びてくる。
//       人の姿はまだ見せず、影と、2階の窓の高さに差し出される棒の先 (針金の房) だけ。窓の中の人は気づかずに Zzz。ガス灯がゆらっと揺れる。
// 動き: f0-30 足音の線 / f8-40 影が伸びてくる / f24-42 棒の先の房がガス灯の光に入る / ずっと霧が流れる / カメラは低い位置から影の方へゆっくり寄る
const Mz132: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.12 * easeInOut(seg(f, 0, 150));
  const shadowK = easeOut(seg(f, 8, 40));
  const tipK = easeOut(seg(f, 24, 42));
  const step = Math.floor(f / 11);
  const walk = Math.sin(f / 5.5) * 6;
  // 影の根元 (画面の右の外) → ガス灯の光の中へ
  const sx0 = 2100, sx1 = lerp(2100, 1060, shadowK);
  const tipX = lerp(2150, 1250, tipK) + Math.sin(f / 9) * 6;
  const tipY = 330 + Math.sin(f / 7) * 5;
  const sway = Math.sin(f / 10) * 1.6;
  return (
    <Frame f={f} seed={6132} dark bg={MP.nightDeep}>
      <g transform={`translate(1150 760) scale(${zoom}) translate(-1150 -760)`}>
        <MachiNami f={f} windows={[0, 0, 0, 0, 0, 0]} sky={0} />
        {/* ガス灯のゆれる光 (追加のゆらぎ) */}
        <g transform={`rotate(${sway} 990 380)`}>
          <ellipse cx={990} cy={900} rx={300 + Math.sin(f / 4) * 10} ry={56} fill={MP.glow} opacity={0.16} />
          <circle cx={990} cy={470} r={150} fill={MP.glow} opacity={0.08 + 0.03 * Math.sin(f / 3)} />
        </g>
        {/* 長い影 (右の外の明かりが、まだ見えない人の影を壁に大きく映す)。右からすーっと入ってくる */}
        <g transform={`translate(${lerp(760, 0, shadowK) + walk * 0.5} 0)`} opacity={0.62 * clamp01(shadowK * 1.5)}>
          {/* 足もとの影 (石畳) */}
          <path d="M 1560 925 L 2200 905 L 2200 950 L 1560 940 Z" fill={C.shadow} />
          {/* 脚 */}
          <path d={`M 1500 925 L ${1520 + walk} 760 L 1560 760 L ${1590 - walk} 925 Z`} fill={C.shadow} />
          {/* 長いコート */}
          <path d="M 1450 780 Q 1440 640 1480 560 L 1620 560 Q 1660 640 1650 780 Z" fill={C.shadow} />
          {/* 頭と山高帽 */}
          <circle cx={1550} cy={505} r={52} fill={C.shadow} />
          <ellipse cx={1550} cy={470} rx={84} ry={14} fill={C.shadow} />
          <path d="M 1500 472 Q 1500 400 1550 398 Q 1600 400 1600 472 Z" fill={C.shadow} />
          {/* 棒の影 (肩から2階の窓の方へ) */}
          <path d={`M 1500 600 L ${lerp(1420, 1210, shadowK)} ${lerp(500, 300, shadowK)}`} stroke={C.shadow} strokeWidth={16} strokeLinecap="round" />
          <path d={`M ${lerp(1420, 1210, shadowK)} ${lerp(500, 300, shadowK)} l -50 -30 M ${lerp(1420, 1210, shadowK)} ${lerp(500, 300, shadowK)} l -56 -4 M ${lerp(1420, 1210, shadowK)} ${lerp(500, 300, shadowK)} l -40 -46`} stroke={C.shadow} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* 霧 (流れる) */}
        {Array.from({ length: 5 }, (_, i) => (
          <ellipse key={i} cx={((i * 520 - f * (2 + i * 0.4)) % 2600 + 2600) % 2600 - 300} cy={760 + i * 40} rx={420} ry={60} fill={MP.mist} opacity={0.14} />
        ))}
        {/* 棒の先 (針金の房) が右から差し出される */}
        <g>
          <line x1={2200} y1={480} x2={tipX + 40} y2={tipY + 10} stroke={C.deskWoodDark} strokeWidth={14} strokeLinecap="round" />
          <line x1={2200} y1={480} x2={tipX + 40} y2={tipY + 10} stroke={C.cart} strokeWidth={7} strokeLinecap="round" />
          <g transform={`translate(${tipX} ${tipY}) rotate(${-8 + Math.sin(f / 6) * 4})`}>
            <rect x={30} y={-8} width={26} height={22} rx={4} fill={MP.iron} stroke={INK} strokeWidth={3} />
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M 34 3 Q ${10 - i * 2} ${-26 + i * 7} ${-22 + (i % 3) * 4} ${-34 + i * 8.5}`} stroke={C.wire} strokeWidth={4} fill="none" strokeLinecap="round" />
            ))}
            {tipK > 0.6 && <circle cx={0} cy={0} r={46} fill={MP.glow} opacity={0.18} />}
          </g>
        </g>
        {/* 足音の線と「コツ」 */}
        {[0, 1].map((k) => {
          const t = ((f + k * 11) % 22) / 22;
          const x = 1680 - (step % 2) * 60 + k * 30;
          return (
            <g key={k} opacity={1 - t} transform={`translate(${x} ${925 + walk * 0})`}>
              <path d={`M -30 0 q -16 -20 0 -40 M 30 0 q 16 -20 0 -40`} stroke={KRP.white} strokeWidth={5} fill="none" strokeLinecap="round" transform={`scale(${1 + t})`} />
              <text x={0} y={-60 - t * 30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white}>コツ</text>
            </g>
          );
        })}
        {/* 窓の中の人は気づかない (Zzz) */}
        {[0, 1, 2, 3].map((i) => {
          const t = ((f + i * 13) % 50) / 50;
          return <text key={i} x={[165, 495, 825, 1155][i] + 30 + t * 20} y={330 - t * 50} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.zzz} opacity={Math.sin(t * Math.PI)}>Z</text>;
        })}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_121: (f) => <Mz121 f={f} />,
  mz_122: (f) => <Mz122 f={f} />,
  mz_123: (f) => <Mz123 f={f} />,
  mz_124: (f) => <Mz124 f={f} />,
  mz_125: (f) => <Mz125 f={f} />,
  mz_126: (f) => <Mz126 f={f} />,
  mz_127: (f) => <Mz127 f={f} />,
  mz_128: (f) => <Mz128 f={f} />,
  mz_129: (f) => <Mz129 f={f} />,
  mz_130: (f) => <Mz130 f={f} />,
  mz_131: (f) => <Mz131 f={f} />,
  mz_132: (f) => <Mz132 f={f} />,
};

export const MZ_F_MOTIFS: string[] = [
  "mz_121", // #121
  "mz_122", // #122
  "mz_123", // #123
  "mz_124", // #124
  "mz_125", // #125
  "mz_126", // #126
  "mz_127", // #127
  "mz_128", // #128
  "mz_129", // #129
  "mz_130", // #130
  "mz_131", // #131
  "mz_132", // #132
];

export const mezaFScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
