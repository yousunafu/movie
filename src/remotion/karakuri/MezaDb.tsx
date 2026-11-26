// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#85〜#96 (12文)
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, Flame,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 塔の番人
  cloak: "#7A5236",
  cloakDark: "#5A3A22",
  hat: "#5E3E24",
  hatBand: "#3E2A1A",
  // 女性の髪・服
  hairBrown: "#8A5A32",
  hairBrownDark: "#6A4224",
  rose: "#C9484E",
  roseDark: "#9A3036",
  pink: "#E79AA6",
  pinkDark: "#C27080",
  wine: "#8E3A4A",
  wineDark: "#6A2836",
  // 男性の服
  navy: "#3E4B66",
  navyDark: "#2E3850",
  grayCloth: "#7E868E",
  grayClothDark: "#5E666E",
  vest: "#5A6A4A",
  vestDark: "#45523A",
  // 羊皮紙・地図・古書
  parch: "#E8D5A8",
  parchDark: "#C8AE76",
  parchEdge: "#9C7A48",
  sepia: "#6E4E30",
  sea: "#C9D6C2",
  leather: "#7A3E2A",
  leatherDark: "#55291C",
  pageEdge: "#EFE3C6",
  // 工房・木
  bench: "#A8743F",
  benchDark: "#7A5028",
  wall18: "#C79A66",
  wall18Dark: "#9A7048",
  tarnish: "#A2843E",
  tarnishDark: "#76602E",
  spring: "#B8BCC2",
  // 博物館
  museumWall: "#4E6A63",
  museumWallDark: "#3C534D",
  museumFloor: "#9A6B43",
  glass: "#D6ECF2",
  guard: "#2E3440",
  guardDark: "#1E232C",
  coatRed: "#C23B3B",
  coatRedDark: "#932A2A",
  sweaterBlue: "#4A78B8",
  sweaterBlueDark: "#355A8E",
  kidYellow: "#F2CE4C",
  kidYellowDark: "#C9A630",
  // 夜の部屋
  roomNight: "#2C3354",
  roomNightDark: "#20263F",
  sofa: "#A85C48",
  sofaDark: "#7E4234",
  plant: "#4F8A55",
  plantDark: "#36643C",
  phone: "#2B2F36",
  screen: "#F7F4EC",
  heart: "#E2506A",
  // 図書館
  libWall: "#5A3E2C",
  libWallDark: "#422C1E",
  lampGreen: "#3E7A4E",
  lampGreenDark: "#2C5A38",
  // 焚き火の広場
  fire: "#F08A2E",
  fireCore: "#FFE08A",
  plazaNight: "#1E2546",
  cobble: "#5A5560",
  cobbleDark: "#45414B",
  log: "#7A5232",
  smoke: "#B8B4C2",
  sticker: "#FFF7DE",
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

// カメラ: 画面の中心に (cx, cy) が来るように sc 倍
const cam = (cx: number, cy: number, sc: number) =>
  `translate(${W / 2 - cx * sc} ${H / 2 - cy * sc}) scale(${sc})`;
// 2点のあいだのカメラ (t: 0→1)
const camLerp = (a: [number, number, number], b: [number, number, number], t: number) =>
  cam(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));

// 歯車 (x,y 中心・r 半径・rot 回転)
const MzDbGear: React.FC<{ x: number; y: number; r: number; rot?: number; fill?: string; teeth?: number; sw?: number }> = ({
  x, y, r, rot = 0, fill = MP.brass, teeth = 10, sw = 4,
}) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2;
    const a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.8;
    pts.push(`${Math.cos(a0) * rr},${Math.sin(a0) * rr}`, `${Math.cos(a1) * rr},${Math.sin(a1) * rr}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={KRP.ink} strokeWidth={sw} strokeLinejoin="round" />
      <circle r={r * 0.32} fill={KRP.white} stroke={KRP.ink} strokeWidth={sw * 0.8} />
    </g>
  );
};

// 音の線 「))」 (side: 1=右 -1=左 0=両側)
const MzDbRing: React.FC<{ x: number; y: number; r?: number; amt: number; f: number; color?: string; w?: number; side?: number }> = ({
  x, y, r = 40, amt, f, color = KRP.ink, w = 6, side = 0,
}) => {
  if (amt <= 0.02) return null;
  const sides = side === 0 ? [-1, 1] : [side];
  const pulse = (Math.floor(f / 3) % 2) * 6;
  return (
    <g opacity={clamp01(amt * 1.4)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round">
      {sides.map((sd) => [0, 1, 2].map((k) => {
        const rr = r + k * 20 + pulse;
        const a = (38 * Math.PI) / 180;
        return (
          <path key={`${sd}${k}`}
            d={`M ${x + sd * Math.cos(a) * rr} ${y - Math.sin(a) * rr} A ${rr} ${rr} 0 0 ${sd === 1 ? 1 : 0} ${x + sd * Math.cos(a) * rr} ${y + Math.sin(a) * rr}`} />
        );
      }))}
    </g>
  );
};

// 目と口の描き替え (Person の座標系。s=1 の頭の中心 (0,-228))
//   mode: sleep = とじ目 / oneEye = 右目だけ半分開く / grimace = ぎゅっとつぶる
const MzDbEyes: React.FC<{ mode: "sleep" | "oneEye" | "grimace"; mouth?: "snore" | "flat" | "wavy" | "none"; snore?: number }> = ({
  mode, mouth = "none", snore = 0,
}) => (
  <g>
    <ellipse cx={0} cy={-226} rx={48} ry={30} fill={KRP.white} />
    {mode === "grimace" ? (
      <g fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M -38 -230 L -20 -222 L -38 -214" />
        <path d="M 38 -230 L 20 -222 L 38 -214" />
        <path d="M -38 -248 L -16 -240 M 38 -248 L 16 -240" />
      </g>
    ) : (
      <g fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
        <path d="M -36 -220 Q -24 -210 -12 -220" />
        {mode === "oneEye" ? (
          <g>
            <path d="M 10 -224 Q 24 -238 38 -224 Z" fill={KRP.white} />
            <circle cx={26} cy={-226} r={5.5} fill={KRP.ink} stroke="none" />
            <path d="M 10 -224 L 38 -224" />
            <path d="M 12 -246 L 36 -250" />
          </g>
        ) : (
          <path d="M 12 -220 Q 24 -210 36 -220" />
        )}
        <path d="M -36 -244 L -14 -246" />
        {mode === "sleep" && <path d="M 14 -246 L 36 -244" />}
      </g>
    )}
    {mouth !== "none" && <ellipse cx={0} cy={-186} rx={20} ry={14} fill={KRP.white} />}
    {mouth === "snore" && <ellipse cx={0} cy={-186} rx={8 + snore * 6} ry={6 + snore * 8} fill={KRP.ink} />}
    {mouth === "flat" && <line x1={-12} y1={-186} x2={12} y2={-186} stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />}
    {mouth === "wavy" && <path d="M -16 -186 q 5 -6 10 0 q 5 6 10 0 q 4 -5 8 0" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />}
  </g>
);

// 番人の帽子 (Person の座標系。down で目深に)
const MzDbWatchHat: React.FC<{ down?: number }> = ({ down = 0 }) => (
  <g transform={`translate(0 ${down * 26})`}>
    <path d="M -50 -270 Q -52 -330 0 -334 Q 52 -330 50 -270 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-50} y={-286} width={100} height={14} fill={C.hatBand} stroke={KRP.ink} strokeWidth={3.5} />
    <ellipse cx={0} cy={-268} rx={86} ry={16} fill={C.hat} stroke={KRP.ink} strokeWidth={5} />
    <path d="M -30 -320 Q -12 -328 8 -326" stroke="#8A6444" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// 番人のマント (肩にかかる茶色の短いマント。Person の座標系)
const MzDbCape: React.FC = () => (
  <g>
    <path d="M -66 -164 Q 0 -178 66 -164 L 80 -92 Q 0 -78 -80 -92 Z" fill={C.cloak} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={0} cy={-160} r={8} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
    <path d="M -40 -150 L -50 -100 M 40 -150 L 50 -100" stroke={C.cloakDark} strokeWidth={4} />
  </g>
);

// 立った番人 (茶色のマントを背中に・帽子)。x,y 足元。マントは体の後ろで左右に広がる
const MzDbWatchman: React.FC<{
  x: number; y: number; s: number; f: number; face?: "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
  pose?: "stand" | "hold" | "raise" | "banzai"; lean?: number; hatDown?: number; gaze?: [number, number];
}> = ({ x, y, s, f, face = "normal", pose = "stand", lean = 0, hatDown = 0, gaze = [0, 0] }) => {
  const bob = Math.sin(f / 13) * 3;
  return (
    <g>
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        <path d={`M -60 -166 Q 0 -180 60 -166 Q 96 -100 ${92 + Math.sin(f / 11) * 4} -20 Q 0 -6 ${-92 + Math.sin(f / 11) * 4} -20 Q -96 -100 -60 -166 Z`}
          fill={C.cloakDark} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      </g>
      <Person x={x} y={y} s={s} f={f} face={face} pose={pose} lean={lean} cloth={C.cloak} clothDark={C.cloakDark} gaze={gaze} />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        <path d="M -44 -164 Q 0 -150 44 -164 L 30 -150 Q 0 -140 -30 -150 Z" fill={C.cloakDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={-156} r={7} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
        <MzDbWatchHat down={hatDown} />
      </g>
    </g>
  );
};

// 女性の髪 (Person の座標系。long=肩まで左右に垂らす / bun=後ろで結んだ房)
const MzDbHair: React.FC<{ kind?: "long" | "bun"; color?: string }> = ({ kind = "long", color = C.hairBrown }) => (
  <g>
    {kind === "long" && (
      <g>
        <path d="M -60 -250 Q -84 -190 -74 -140 L -46 -140 Q -56 -190 -50 -232 Z" fill={color} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 60 -250 Q 84 -190 74 -140 L 46 -140 Q 56 -190 50 -232 Z" fill={color} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
    )}
    {kind === "bun" && <circle cx={58} cy={-262} r={22} fill={color} stroke={KRP.ink} strokeWidth={4} />}
    <path d="M -64 -236 Q -66 -294 0 -296 Q 66 -294 64 -236 Q 40 -266 0 -264 Q -40 -266 -64 -236 Z" fill={color} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

// スカート (Person の座標系。腰 -70 から long ならくるぶし、short なら膝下)
const MzDbSkirt: React.FC<{ color: string; dark: string; long?: boolean; apron?: boolean }> = ({ color, dark, long = false, apron = false }) => {
  const bot = long ? -6 : -24;
  return (
    <g>
      <path d={`M -56 -74 L 56 -74 L ${long ? 84 : 76} ${bot} Q 0 ${bot + 10} ${long ? -84 : -76} ${bot} Z`} fill={color} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M -20 -70 L -30 ${bot + 2} M 20 -70 L 30 ${bot + 2}`} stroke={dark} strokeWidth={4} />
      {apron && <path d={`M -34 -72 L 34 -72 L 40 ${bot - 6} L -40 ${bot - 6} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />}
    </g>
  );
};

// ボンネット帽 / 頭巾 (Person の座標系)
const MzDbBonnet: React.FC<{ color?: string }> = ({ color = KRP.white }) => (
  <g>
    <path d="M -74 -200 Q -84 -306 0 -310 Q 84 -306 74 -200 Q 70 -258 0 -262 Q -70 -258 -74 -200 Z" fill={color} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-72} cy={-214} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 男性の帽子 (つば付きのフェルト帽 / ハンチング)
const MzDbManHat: React.FC<{ color?: string }> = ({ color = "#4A4038" }) => (
  <g>
    <path d="M -54 -262 Q -56 -318 0 -320 Q 56 -318 54 -262 Z" fill={color} stroke={KRP.ink} strokeWidth={5} />
    <ellipse cx={0} cy={-262} rx={78} ry={13} fill={color} stroke={KRP.ink} strokeWidth={5} />
  </g>
);

// 白いひげと白髪 (年配。Person の座標系)
const MzDbBeard: React.FC = () => (
  <g>
    <path d="M -64 -238 Q -64 -290 0 -292 Q 64 -290 64 -238 Q 40 -258 0 -258 Q -40 -258 -64 -238 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -46 -200 Q -50 -140 0 -128 Q 50 -140 46 -200 Q 30 -176 0 -176 Q -30 -176 -46 -200 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -26 -196 Q 0 -206 26 -196" fill="none" stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// 後ろ姿の人 (実在の人物用。顔なし)。体ごと後ろ向き: 18世紀の三角帽子の後ろ・後ろで結んだ灰茶色の髪・ひざ丈の上着の背中。
//   x,y = 足元。armL / armR = 肩まわりの腕の角度 (0 = 下にたらす、+ で前=上へ)
const MzDbBack: React.FC<{ x: number; y: number; s?: number; f?: number; lean?: number; armL?: number; armR?: number; coat?: string; coatDark?: string }> = ({
  x, y, s = 1, f = 0, lean = 0, armL = 0, armR = 0, coat = "#5A4A6E", coatDark = "#433656",
}) => {
  const bob = Math.sin(f / 13) * 2;
  const HAIR = "#8C7A66";
  const HAIR_DARK = "#6A5A48";
  const SKIN = "#E8C4A0";
  const arm = (side: -1 | 1, rot: number) => (
    <g transform={`rotate(${side * rot} ${side * 62} -150)`}>
      <rect x={side * 62 - 13} y={-154} width={26} height={88} rx={13} fill={coat} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 折り返した袖口とレース */}
      <rect x={side * 62 - 15} y={-86} width={30} height={16} rx={5} fill={coatDark} stroke={KRP.ink} strokeWidth={3.5} />
      <path d={`M ${side * 62 - 13} -70 q 6 8 13 0 q 7 8 13 0`} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      {/* 手 (手の甲側) */}
      <ellipse cx={side * 62} cy={-56} rx={11} ry={12} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 脚 (後ろから: 白い靴下のふくらはぎと黒い靴のかかと) */}
      <rect x={-30} y={-62} width={24} height={56} fill="#EDE6D6" stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={6} y={-62} width={24} height={56} fill="#EDE6D6" stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={-31} y={-14} width={26} height={12} rx={3} fill={KRP.ink} />
      <rect x={5} y={-14} width={26} height={12} rx={3} fill={KRP.ink} />
      {arm(-1, armL)}
      {arm(1, armR)}
      {/* ひざ丈の上着の背中 (肩・背中の縫い目・すその切れ込み・ひだ・腰のボタン) */}
      <path d="M -64 -152 Q -66 -170 -40 -170 Q 0 -176 40 -170 Q 66 -170 64 -152 L 76 -54 L -76 -54 Z" fill={coat} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <line x1={0} y1={-166} x2={0} y2={-104} stroke={coatDark} strokeWidth={4} />
      <path d="M -6 -104 L -10 -55 M 6 -104 L 10 -55" stroke={KRP.ink} strokeWidth={3.5} />
      <path d="M -2 -100 L 2 -100 L 6 -55 L -6 -55 Z" fill={coatDark} />
      <path d="M -40 -100 Q -46 -78 -50 -56 M 40 -100 Q 46 -78 50 -56" stroke={coatDark} strokeWidth={4} fill="none" />
      <circle cx={-16} cy={-106} r={5.5} fill={MP.brass} stroke={KRP.ink} strokeWidth={2.5} />
      <circle cx={16} cy={-106} r={5.5} fill={MP.brass} stroke={KRP.ink} strokeWidth={2.5} />
      {/* 立ったえり */}
      <path d="M -36 -170 Q 0 -178 36 -170 L 34 -156 Q 0 -162 -34 -156 Z" fill={coatDark} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      {/* うなじ (首の後ろ) */}
      <rect x={-18} y={-188} width={36} height={22} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
      {/* 耳 (後ろから少しだけ見える) */}
      <ellipse cx={-56} cy={-222} rx={10} ry={16} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={56} cy={-222} rx={10} ry={16} fill={SKIN} stroke={KRP.ink} strokeWidth={4} />
      {/* 後頭部 (灰茶色の髪で全部おおう。毛はうなじの結び目へ集まる) */}
      <path d="M -56 -226 Q -58 -284 0 -288 Q 58 -284 56 -226 Q 52 -194 22 -184 Q 0 -180 -22 -184 Q -52 -194 -56 -226 Z" fill={HAIR} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -40 -258 Q -34 -214 -8 -188 M 40 -258 Q 34 -214 8 -188 M -18 -272 Q -14 -224 -3 -190 M 18 -272 Q 14 -224 3 -190" stroke={HAIR_DARK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {/* 後ろで結んだ髪 (背中に垂れる) と黒いリボン */}
      <path d="M -9 -186 Q -12 -150 -6 -118 Q 0 -110 6 -118 Q 12 -150 9 -186 Z" fill={HAIR} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 0 -170 L 0 -122" stroke={HAIR_DARK} strokeWidth={3} />
      <path d="M 0 -186 L -26 -198 L -24 -172 Z M 0 -186 L 26 -198 L 24 -172 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
      <path d="M -4 -184 L -14 -158 M 4 -184 L 14 -158" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
      <circle cx={0} cy={-186} r={7} fill={KRP.ink} />
      {/* 三角帽子 (後ろから: 山の上と、手前に向いた角) */}
      <path d="M -46 -276 Q -44 -326 0 -330 Q 44 -326 46 -276 Z" fill="#2E2A30" stroke={KRP.ink} strokeWidth={5} />
      <path d="M -96 -284 Q -58 -268 0 -246 Q 58 -268 96 -284 Q 86 -302 62 -318 Q 30 -300 0 -298 Q -30 -300 -62 -318 Q -86 -302 -96 -284 Z" fill="#2E2A30" stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -88 -284 Q -54 -270 0 -252 Q 54 -270 88 -284" stroke={MP.brass} strokeWidth={4} fill="none" />
    </g>
  );
};

// ドイツのゼンマイ式の置き時計 (太鼓形の真鍮の筒・上に文字盤・横に小さなベル・つまみ)
//   x,y = 底の中心。old=くすみ (0〜1) / ring = ベル / knob = つまみの回転 / open = ふたが開いて中のゼンマイが見える
const MzDbDrumClock: React.FC<{ x: number; y: number; s?: number; f: number; old?: number; ring?: number; knob?: number; open?: number; lean?: number }> = ({
  x, y, s = 1, f, old = 0, ring = 0, knob = 0, open = 0, lean = 0,
}) => {
  const body = old > 0 ? C.tarnish : MP.brass;
  const bodyDark = old > 0 ? C.tarnishDark : MP.brassDark;
  const hi = old > 0 ? "#C9B070" : MP.brassLight;
  const shake = ring > 0.02 ? Math.sin(f * 3.1) * 2 * ring : 0;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s}) rotate(${lean})`}>
      {/* 3つの小さな足 */}
      {[-70, 0, 70].map((fx) => <path key={fx} d={`M ${fx - 12} -6 L ${fx + 12} -6 L ${fx + 8} 0 L ${fx - 8} 0 Z`} fill={bodyDark} stroke={KRP.ink} strokeWidth={3.5} />)}
      {/* 筒 (側面) */}
      <path d="M -100 -110 L -100 -12 Q 0 12 100 -12 L 100 -110 Z" fill={body} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* 側面の彫り模様 (つる草) */}
      <path d="M -86 -60 q 20 -22 40 0 q 20 22 40 0 q 20 -22 40 0 q 20 22 40 0" fill="none" stroke={bodyDark} strokeWidth={4} />
      <path d="M -100 -88 Q 0 -66 100 -88 M -100 -30 Q 0 -8 100 -30" fill="none" stroke={bodyDark} strokeWidth={3.5} />
      <path d="M -84 -98 L -84 -20" stroke={hi} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      {/* 上面 (文字盤のある円) */}
      <ellipse cx={0} cy={-110} rx={100} ry={30} fill={hi} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-110} rx={76} ry={22} fill={old > 0 ? "#E3D6B0" : "#F6EDD2"} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 64} cy={-110 + Math.sin(a) * 18} r={3.2} fill={KRP.ink} />;
      })}
      <line x1={0} y1={-110} x2={36} y2={-118} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
      <circle cx={0} cy={-110} r={6} fill={bodyDark} stroke={KRP.ink} strokeWidth={2.5} />
      {/* 中のゼンマイ (ふたが開いているとき、側面の窓から見える) */}
      {open > 0.02 && (
        <g opacity={open}>
          <ellipse cx={0} cy={-60} rx={56} ry={34} fill="#3E3A36" stroke={KRP.ink} strokeWidth={4} />
          <path d={Array.from({ length: 30 }, (_, i) => {
            const a = i * 0.62 + f * 0.05;
            const rr = 4 + i * 1.6;
            return `${i === 0 ? "M" : "L"} ${Math.cos(a) * rr} ${-60 + Math.sin(a) * rr * 0.6}`;
          }).join(" ")} fill="none" stroke={C.spring} strokeWidth={3.5} />
        </g>
      )}
      {/* 横の小さなベル (右側の腕の先) */}
      <path d="M 100 -100 L 132 -132" stroke={bodyDark} strokeWidth={7} strokeLinecap="round" />
      <g transform={`rotate(${ring > 0.02 ? Math.sin(f * 2.4) * 14 * ring : 0} 140 -140)`}>
        <path d="M 116 -126 Q 114 -164 140 -166 Q 166 -164 164 -126 Z" fill={body} stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={140} cy={-170} r={6} fill={bodyDark} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
      {/* 横のつまみ (左側) */}
      <g transform={`rotate(${knob} -118 -62)`}>
        <rect x={-112} y={-68} width={14} height={12} fill={bodyDark} stroke={KRP.ink} strokeWidth={3} />
        <path d="M -118 -84 L -126 -62 L -118 -40 L -110 -62 Z" fill={hi} stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={-118} cy={-62} r={10} fill={body} stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {ring > 0.02 && <MzDbRing x={140} y={-146} r={36} amt={ring} f={f} color={MP.bell} w={5} />}
    </g>
  );
};

// 15世紀の鉄の壁掛け時計 (四隅の柱・針1本・てっぺんのベル・てんぷ)。番人の塔の時計と同じ系統
//   x,y = 底の中心
const MzDbIronClock: React.FC<{ x: number; y: number; s?: number; f: number; ring?: number; lean?: number }> = ({ x, y, s = 1, f, ring = 0, lean = 0 }) => {
  const foliot = Math.sin(f / 7) * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
      <rect x={-70} y={-150} width={140} height={136} fill="#4E535B" stroke={KRP.ink} strokeWidth={5} />
      {[-70, 70].map((px) => (
        <g key={px}>
          <rect x={px - 8} y={-166} width={16} height={156} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M ${px - 10} -166 L ${px} -190 L ${px + 10} -166 Z`} fill={MP.iron} stroke={KRP.ink} strokeWidth={3.5} />
        </g>
      ))}
      <rect x={-82} y={-18} width={164} height={14} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-80} y={-164} width={160} height={12} fill={MP.iron} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={-92} r={50} fill="#E9E2CF" stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <line key={i} x1={Math.sin(a) * 38} y1={-92 - Math.cos(a) * 38} x2={Math.sin(a) * 46} y2={-92 - Math.cos(a) * 46} stroke={KRP.ink} strokeWidth={i % 3 ? 2.5 : 4.5} />;
      })}
      <path d="M -3 -88 L 0 -128 L 3 -88 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} transform="rotate(150 0 -92)" />
      <line x1={0} y1={-164} x2={0} y2={-204} stroke={MP.iron} strokeWidth={6} />
      <g transform={`rotate(${foliot} 0 -194)`}>
        <rect x={-66} y={-198} width={132} height={8} rx={3} fill={MP.iron} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-66} y={-204} width={14} height={20} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={3} />
        <rect x={52} y={-204} width={14} height={20} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <line x1={0} y1={-204} x2={0} y2={-222} stroke={MP.iron} strokeWidth={6} />
      <path d="M -34 -226 Q -32 -264 0 -266 Q 32 -264 34 -226 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={5} />
      {ring > 0.02 && <MzDbRing x={0} y={-246} r={44} amt={ring} f={f} color={MP.bell} w={5} />}
    </g>
  );
};

// 小さな足 (歩く時計用。x,y = 足元の中心, ph = 歩きの位相)
const MzDbFeet: React.FC<{ x: number; y: number; s?: number; ph: number; walking: boolean }> = ({ x, y, s = 1, ph, walking }) => {
  const a = walking ? Math.sin(ph) * 16 : 0;
  const lift = (k: number) => (walking ? Math.max(0, Math.sin(ph + k * Math.PI)) * 10 : 0);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-1, 1].map((k) => (
        <g key={k} transform={`translate(${k * 30 + (k === -1 ? a : -a)} ${-lift(k === -1 ? 0 : 1)})`}>
          <line x1={0} y1={-30} x2={0} y2={-6} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={8} cy={-4} rx={16} ry={7} fill={KRP.ink} />
        </g>
      ))}
    </g>
  );
};

// うわさの雲 (点線のふちのもくもく)。cx,cy 中心, rx,ry, t = 広がり, f でちらちら
const cloudPath = (cx: number, cy: number, rx: number, ry: number, f: number, n = 14) => {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const px = cx + Math.cos(a) * rx;
    const py = cy + Math.sin(a) * ry;
    if (i === 0) d += `M ${px} ${py}`;
    else {
      const am = ((i - 0.5) / n) * Math.PI * 2;
      const bulge = 1.16 + Math.sin(f / 7 + i * 1.3) * 0.015;
      d += ` Q ${cx + Math.cos(am) * rx * bulge} ${cy + Math.sin(am) * ry * bulge} ${px} ${py}`;
    }
  }
  return d + " Z";
};

// 18世紀の背の高い木の時計 (Hutchins の時計。文字盤は「4」だけ)
//   x,y = 底の中心 / hand = 針の角度 (度。4時の位置 = 120) / ring = ベル / build = 組み立て (0〜1。上の飾りが付く)
const MzDbTallClock: React.FC<{ x: number; y: number; s?: number; f: number; hand?: number; ring?: number; build?: number; blank?: boolean }> = ({
  x, y, s = 1, f, hand = 120, ring = 0, build = 1, blank = false,
}) => {
  const shake = ring > 0.02 ? Math.sin(f * 3) * 2 * ring : 0;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`}>
      {/* 台座 */}
      <rect x={-90} y={-90} width={180} height={90} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-60} y={-74} width={120} height={58} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
      {/* 胴 (振り子の窓) */}
      <rect x={-66} y={-400} width={132} height={310} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -40 -370 L 40 -370 L 40 -130 L -40 -130 Z" fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
      <g transform={`rotate(${Math.sin(f / 9) * 8} 0 -370)`}>
        <line x1={0} y1={-370} x2={0} y2={-180} stroke={MP.brassDark} strokeWidth={4} />
        <circle cx={0} cy={-170} r={22} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {[-52, 52].map((gx) => <line key={gx} x1={gx} y1={-390} x2={gx} y2={-100} stroke={MP.woodLight} strokeWidth={4} opacity={0.6} />)}
      {/* 頭 (文字盤の箱) */}
      <rect x={-96} y={-610} width={192} height={210} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={-505} r={80} fill="#F6EDD2" stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={-505} r={66} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
      {!blank && (
        <text x={Math.sin((120 * Math.PI) / 180) * 50} y={-505 - Math.cos((120 * Math.PI) / 180) * 50 + 18}
          textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.ink}>4</text>
      )}
      <g transform={`rotate(${hand} 0 -505)`}>
        <path d="M -5 -500 L 0 -566 L 5 -500 Z" fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} strokeLinejoin="round" />
      </g>
      <circle cx={0} cy={-505} r={8} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
      {/* 上の飾り (組み立てで付く) */}
      {build > 0.02 && (
        <g transform={`translate(0 ${(1 - easeOut(build)) * -60})`} opacity={clamp01(build * 2)}>
          <path d="M -106 -610 Q -60 -660 0 -640 Q 60 -660 106 -610 Z" fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={0} cy={-660} r={14} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* 横の小さなベル */}
      <g transform={`rotate(${ring > 0.02 ? Math.sin(f * 2.5) * 14 * ring : 0} 120 -580)`}>
        <path d="M 96 -560 L 96 -600 Q 96 -620 120 -622 Q 144 -620 144 -600 L 144 -560 Z" fill={MP.brass} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <rect x={96} y={-560} width={48} height={10} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
      {ring > 0.02 && <MzDbRing x={120} y={-596} r={44} amt={ring} f={f} color={MP.bell} w={6} />}
    </g>
  );
};

// 王冠
const MzDbCrown: React.FC<{ x: number; y: number; s?: number; rot?: number; f?: number }> = ({ x, y, s = 1, rot = 0, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <path d="M -50 20 L -56 -30 L -26 -4 L 0 -40 L 26 -4 L 56 -30 L 50 20 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-50} y={14} width={100} height={14} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={4} />
    {[-30, 0, 30].map((jx, i) => <circle key={jx} cx={jx} cy={2} r={6} fill={i === 1 ? KRP.red : KRP.blueDeep} stroke={KRP.ink} strokeWidth={2.5} />)}
    {[-56, 0, 56].map((jx, i) => (
      <path key={jx} d={`M ${jx} ${-46 - (i === 1 ? 10 : 0)} l 3 -9 l 3 9 l 9 3 l -9 3 l -3 9 l -3 -9 l -9 -3 Z`} fill={KRP.white}
        opacity={0.5 + 0.5 * Math.sin(f / 4 + i * 2)} />
    ))}
  </g>
);

// きらきら (x,y, s, 点滅)
const MzDbSpark: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = KRP.white }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z"
    fill={color} stroke={KRP.ink} strokeWidth={2} opacity={o} />
);

// ハート
const MzDbHeart: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 14 C -30 -6 -22 -30 0 -16 C 22 -30 30 -6 0 14 Z"
    fill={C.heart} stroke={KRP.ink} strokeWidth={3} opacity={o} />
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #85 塔の番人を起こすための、ベル付きの時計です。
// 格: 山 / seed 6085
// 絵: どこ: BanninTou (ring=0→1, wake=0→0.3) の部屋。石の壁・わら布団・大きな鐘・ランタン。演出: わら布団で番人 (男性・茶色のマントと帽子・眠そうな顔) が、マントにくるまって大いびき (いびきの「z」が大きな鐘に当たって跳ね返る)。壁の小さなベル付きの鉄の時計が、f60 でジリリと鳴る (ring=1)。番人は顔をしかめて、帽子を目深にかぶり直して寝返りを打とうとするが、ベルが鳴り続けるので、ついに片目を開ける (wake=0.3、face="sleepy")。カメラは時計のベルの寄りから、番人の顔へ横にパン。動き: f0-60 いびき / f60-120 ベル (ハンマーが高速) / f90 帽子をかぶり直す / f130 片目が開く
// どこ: BanninTou の部屋 (共有の舞台)。石の壁・アーチ窓の夜の町・天井の大きな鐘・右下のわら布団・木箱の上の鉄の時計・ランタン
// 演出: 番人がマントにくるまって大いびき。「Z」が天井の大きな鐘に当たってコツンと跳ね返る。f12 で鉄の時計がジリリ。
//       番人は鳴っていてもいびきのまま顔をしかめ、マントから手を出して帽子を目深に引き下げ、寝返りしかけて、ついに片目が開く
// 動き: f0-14 時計の寄り / f12 ベル / f14-40 番人の顔へ横パン / f24 しかめ顔 / f46-60 帽子を引き下げ / f60-68 寝返り未遂 / f72 片目
const MzDbLying: React.FC<{
  hx: number; hy: number; s: number; f: number;
  eyes: "sleep" | "oneEye" | "grimace"; mouth: "snore" | "flat" | "wavy"; snore: number; hatDown: number; roll?: number;
}> = ({ hx, hy, s, f, eyes, mouth, snore, hatDown, roll = 0 }) => {
  const fx = hx + 228 * s;
  const breathe = Math.sin(f / 9) * 3 * s;
  return (
    <g transform={`rotate(${roll} ${fx - 80 * s} ${hy + 50 * s})`}>
      <g transform={`translate(${fx} ${hy}) rotate(-90) scale(${s})`}>
        <Person x={0} y={0} s={1} f={f} cloth={C.cloak} clothDark={C.cloakDark} still />
        <MzDbEyes mode={eyes} mouth={mouth} snore={snore} />
        <MzDbWatchHat down={hatDown} />
      </g>
      {/* マント (体にぐるぐる巻いた茶色の布)。息で上下 */}
      <path d={`M ${hx + 70 * s} ${hy - 58 * s - breathe} Q ${hx + 160 * s} ${hy - 80 * s - breathe} ${fx + 30 * s} ${hy - 48 * s}
        L ${fx + 40 * s} ${hy + 50 * s} L ${hx + 64 * s} ${hy + 58 * s} Q ${hx + 54 * s} ${hy} ${hx + 70 * s} ${hy - 58 * s - breathe} Z`}
        fill={C.cloak} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${hx + 130 * s} ${hy - 62 * s - breathe} Q ${hx + 150 * s} ${hy} ${hx + 128 * s} ${hy + 56 * s}
        M ${hx + 210 * s} ${hy - 60 * s} Q ${hx + 226 * s} ${hy} ${hx + 206 * s} ${hy + 54 * s}`}
        fill="none" stroke={C.cloakDark} strokeWidth={4} />
      <rect x={hx + 170 * s} y={hy - 30 * s} width={46 * s} height={34 * s} fill="#946A48" stroke={KRP.ink} strokeWidth={3} strokeDasharray="5 4" />
      {/* 足先 (マントのすそから靴) */}
      <ellipse cx={fx + 48 * s} cy={hy - 14 * s} rx={12 * s} ry={20 * s} fill={KRP.ink} />
      <ellipse cx={fx + 48 * s} cy={hy + 22 * s} rx={12 * s} ry={20 * s} fill={KRP.ink} />
    </g>
  );
};

const Mz085: React.FC<{ f: number }> = ({ f }) => {
  const ring = seg(f, 12, 18);
  const wake = 0.3 * seg(f, 70, 80);
  const pan = easeInOut(seg(f, 14, 40));
  const drift = seg(f, 40, 112);
  const camT = f < 40 ? camLerp([1150, 560, 1.9], [1220, 660, 1.32], pan) : camLerp([1220, 660, 1.32], [1250, 680, 1.42], drift);
  const s = 0.9;
  const hx = 1356, hy = 794;
  const eyes = f < 24 ? "sleep" : f < 72 ? "grimace" : "oneEye";
  const hatDown = easeOut(seg(f, 50, 58));
  const handOut = seg(f, 44, 50) * (1 - seg(f, 62, 68));
  const roll = f > 60 && f < 70 ? Math.sin(((f - 60) / 10) * Math.PI) * -5 : 0;
  // いびきの Z (口元から天井の鐘へ。当たって跳ね返る)
  const mouthX = hx + 42 * s, mouthY = hy - 10;
  const zs = Array.from({ length: 5 }, (_, i) => {
    const t0 = i * 13 - 4;
    const life = 34;
    const u = (f - t0) / life;
    if (u < 0 || u > 1 || f > 72) return null;
    const hit = 0.62;
    const bx = 1270, by = 470;
    let zx: number, zy: number;
    if (u < hit) {
      const k = u / hit;
      zx = lerp(mouthX, bx, k) + Math.sin(k * 6) * 14;
      zy = lerp(mouthY - 40, by + 20, k);
    } else {
      const k = (u - hit) / (1 - hit);
      zx = bx + k * 120;
      zy = by + 20 + k * 90 - Math.sin(k * Math.PI) * 60;
    }
    const sz = 36 + u * 40;
    return (
      <g key={i} opacity={u > 0.85 ? (1 - u) / 0.15 : 1}>
        <text x={zx} y={zy} fontFamily={FONT} fontWeight={900} fontSize={sz} fill={MP.mist} stroke={KRP.ink} strokeWidth={4}
          paintOrder="stroke" transform={`rotate(${u < hit ? -12 : 24} ${zx} ${zy})`}>Z</text>
        {u > hit && u < hit + 0.12 && (
          <g stroke={MP.glow} strokeWidth={5} strokeLinecap="round">
            <line x1={bx - 20} y1={by + 4} x2={bx - 40} y2={by - 16} />
            <line x1={bx + 6} y1={by} x2={bx + 10} y2={by - 26} />
            <line x1={bx + 30} y1={by + 6} x2={bx + 52} y2={by - 12} />
          </g>
        )}
      </g>
    );
  });
  return (
    <Frame f={f} seed={6085} dark bg={MP.nightDeep}>
      <g transform={camT}>
        <BanninTou f={f} ring={ring} wake={wake} />
        {/* 枕元の水差しと、脱いだ靴 (暮らしの小物) */}
        <g>
          <path d="M 1262 878 L 1258 840 Q 1270 826 1290 840 L 1286 878 Z" fill="#9AA8A0" stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1288 846 Q 1304 852 1290 866" fill="none" stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={1880} cy={874} rx={26} ry={10} fill={KRP.ink} />
          <ellipse cx={1900} cy={868} rx={22} ry={9} fill="#2A2420" transform="rotate(-14 1900 868)" />
        </g>
        <MzDbLying hx={hx} hy={hy} s={s} f={f} eyes={eyes} mouth={f < 72 ? "snore" : "flat"}
          snore={0.5 + 0.5 * Math.sin(f / 4)} hatDown={hatDown} roll={roll} />
        {/* マントから出てきて帽子を引き下げる手 */}
        {handOut > 0.02 && (
          <g opacity={clamp01(handOut * 3)}>
            <path d={`M ${hx + 90} ${hy - 40} Q ${hx + 30} ${hy - 110} ${hx - 28 + hatDown * 23} ${hy - 72}`}
              fill="none" stroke={KRP.ink} strokeWidth={30} strokeLinecap="round" />
            <path d={`M ${hx + 90} ${hy - 40} Q ${hx + 30} ${hy - 110} ${hx - 28 + hatDown * 23} ${hy - 72}`}
              fill="none" stroke={C.cloak} strokeWidth={21} strokeLinecap="round" />
            <circle cx={hx - 28 + hatDown * 23} cy={hy - 72} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        )}
        {zs}
        {/* 鳴り始めの「!」の閃き (時計のまわり) */}
        {ring > 0.5 && (
          <g opacity={0.5 + 0.5 * Math.sin(f / 2)}>
            <MzDbSpark x={1060} y={470} s={1.1} color={MP.glow} />
            <MzDbSpark x={1240} y={500} s={0.9} color={MP.glow} />
          </g>
        )}
        {/* 片目が開いた瞬間の汗 */}
        {f > 74 && (
          <path d={`M ${hx - 50} ${hy - 70 + seg(f, 74, 100) * 20} q -10 16 0 22 q 10 -6 0 -22 Z`} fill="#9CCAE8" stroke={KRP.ink} strokeWidth={3} />
        )}
      </g>
      <TagPlate x={330} y={186} text="ウィーン" size={40} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #86 番人は、鐘を打って、町じゅうに時刻を知らせる係です。
// 格: 山 / seed 6086
// 絵: どこ: BanninTou (ring=0, wake=1) の部屋の大きな鐘の前。窓の外にウィーンの町の屋根が広がる。演出: 起きた番人 (男性) が、大きな木づちを両手で振りかぶり (腕は2本、pose="swing")、大きな鐘を**ゴーン**と打つ。鐘から出た音の輪が窓から町へ広がる。カメラは鐘の寄りから、窓の外へ引いていき、町の屋根の下で、輪が届いた家々の窓が次々に明かりがつく (パン屋の煙突の煙が立つ、荷馬車が動きだす)。番人は打ち終わって、ひたいの汗をぬぐう。動き: f0-30 振りかぶる / f30 ゴーン / f35-140 引き・音の輪・窓の明かりが順に
// どこ: BanninTou の部屋 (起きたあと)。大きな鐘の前。左のアーチ窓の外にウィーンの町の屋根 (シーン側で家と窓を描き足す)
// 演出: 番人が大きな木づちを両手で振りかぶり、鐘をゴーン。音の輪が部屋を横切り窓から町へ。
//       町の窓が手前から順に灯り、パン屋の煙突から煙、荷馬車が動きだす。番人は木づちを下ろしてひたいの汗をぬぐう (汗が飛ぶ)
// 動き: f0-18 振りかぶる / f20 ゴーン / f24-60 鐘から窓の外へ引く / f30〜 音の輪・窓が順に灯る / f70〜 煙と荷馬車 / f96 汗
const MzDbTown: React.FC<{ f: number; t0: number }> = ({ f, t0 }) => {
  // 窓の外の町 (アーチの中だけ)。家ごとの窓が t0 + i*9 で灯る
  const houses = [
    { x: 150, w: 120, h: 150, roof: 70 }, { x: 262, w: 110, h: 190, roof: 80 }, { x: 364, w: 70, h: 130, roof: 60 },
    { x: 500, w: 100, h: 170, roof: 76 }, { x: 592, w: 96, h: 140, roof: 64 }, { x: 680, w: 100, h: 180, roof: 72 },
  ];
  const base = 770;
  const cartX = 170 + seg(f, 70, 140) * 220;
  return (
    <g>
      {/* 大聖堂の尖塔 (遠く) */}
      <path d="M 434 560 L 456 330 L 478 560 Z" fill="#2A3150" stroke={KRP.ink} strokeWidth={3} />
      <rect x={428} y={560} width={56} height={210} fill="#2A3150" stroke={KRP.ink} strokeWidth={3} />
      {houses.map((hs, i) => {
        const lit = seg(f, t0 + i * 9, t0 + i * 9 + 4);
        const top = base - hs.h;
        return (
          <g key={i}>
            <rect x={hs.x} y={top} width={hs.w} height={hs.h} fill={mixC("#3A3E58", "#C9A880", lit * 0.35)} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${hs.x - 8} ${top} L ${hs.x + hs.w / 2} ${top - hs.roof} L ${hs.x + hs.w + 8} ${top} Z`} fill="#5A2E2A" stroke={KRP.ink} strokeWidth={3} />
            {[0, 1].map((r) => [0, 1].map((c) => (
              <g key={`${r}${c}`}>
                <rect x={hs.x + 16 + c * (hs.w - 52)} y={top + 24 + r * 54} width={20} height={28} fill={lit > 0 && (r + c + i) % 3 !== 2 ? MP.flame : "#1A1F36"}
                  opacity={lit > 0 && (r + c + i) % 3 !== 2 ? 0.4 + 0.6 * lit : 1} stroke={KRP.ink} strokeWidth={2.5} />
                {lit > 0.5 && (r + c + i) % 3 !== 2 && <rect x={hs.x + 10 + c * (hs.w - 52)} y={top + 18 + r * 54} width={32} height={40} fill={MP.glow} opacity={0.25} />}
              </g>
            )))}
            {/* パン屋 (3番目の家) の煙突と煙 */}
            {i === 3 && (
              <g>
                <rect x={hs.x + 64} y={top - 60} width={18} height={44} fill="#4A3A38" stroke={KRP.ink} strokeWidth={3} />
                {Array.from({ length: 4 }, (_, k) => {
                  const u = ((f - 60 - k * 9) % 36) / 36;
                  if (f < 60 + k * 9) return null;
                  return <circle key={k} cx={hs.x + 73 + u * 30 + Math.sin(u * 6) * 6} cy={top - 66 - u * 120} r={10 + u * 18} fill={MP.mist} opacity={0.75 * (1 - u)} />;
                })}
              </g>
            )}
          </g>
        );
      })}
      {/* 石畳の通りと荷馬車 */}
      <rect x={150} y={base - 10} width={620} height={20} fill="#3E3A48" />
      <g transform={`translate(${cartX} ${base - 12})`}>
        <ellipse cx={-34} cy={-16} rx={22} ry={14} fill="#6A4A34" stroke={KRP.ink} strokeWidth={2.5} />
        <rect x={-14} y={-26} width={10} height={8} fill="#6A4A34" />
        <path d="M -20 -24 L -10 -30" stroke="#6A4A34" strokeWidth={6} />
        <rect x={0} y={-32} width={50} height={22} fill={MP.wood} stroke={KRP.ink} strokeWidth={2.5} />
        <circle cx={14} cy={-6} r={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={2.5} transform={`rotate(${f * 6} 14 -6)`} />
        <circle cx={40} cy={-6} r={8} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
    </g>
  );
};
const mixC = (a: string, b: string, t: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * clamp01(t)).toString(16).padStart(2, "0")).join("");
};

const Mz086: React.FC<{ f: number }> = ({ f }) => {
  const wind = easeOut(seg(f, 0, 18));
  const strike = seg(f, 18, 22);
  const rebound = seg(f, 22, 40);
  const lower = easeOut(seg(f, 84, 100));
  // 木づちの角度 (真上=0。+ で鐘のほうへ)
  const rot = f < 18 ? lerp(0, -55, wind) : f < 22 ? lerp(-55, 39, strike) : f < 84 ? 39 - Math.sin(rebound * Math.PI * 3) * 4 * (1 - rebound) - 3 * easeOut(rebound) : lerp(36, 150, lower);
  const hitAmt = f >= 21 ? Math.max(0, 1 - (f - 21) / 70) : 0;
  const pull = easeInOut(seg(f, 24, 60));
  const camT = camLerp([1170, 470, 1.45], [960, 540, 1.0], pull);
  const px = 900, py = 884, ps = 1.18;
  const hx = px, hy = py - 142 * ps; // 手元
  const L = 373;
  const head = [hx + Math.sin((rot * Math.PI) / 180) * L, hy - Math.cos((rot * Math.PI) / 180) * L];
  const face = f < 22 ? "angry" : f < 90 ? "surprised" : "smile";
  const bellSwing = hitAmt * Math.sin((f - 21) / 5) * 4;
  // 音の輪 (鐘から左の窓へ広がる)
  const rings = Array.from({ length: 5 }, (_, i) => {
    const u = (f - 21 - i * 12) / 60;
    if (u < 0 || u > 1) return null;
    const r = 80 + u * 900;
    return <circle key={i} cx={1240} cy={330} r={r} fill="none" stroke={MP.glow} strokeWidth={14 - u * 8} opacity={(1 - u) * 0.85} />;
  });
  return (
    <Frame f={f} seed={6086} dark bg={MP.nightDeep}>
      <g transform={camT}>
        <BanninTou f={f} ring={0} wake={1} sky={0.3} />
        {/* 鐘のふるえ (左右のぶれ線) */}
        {hitAmt > 0.05 && (
          <g stroke={MP.glow} strokeWidth={6} strokeLinecap="round" opacity={hitAmt} transform={`translate(${bellSwing} 0)`}>
            <path d="M 1080 250 q -14 60 0 120 M 1056 270 q -12 50 0 90 M 1400 250 q 14 60 0 120 M 1424 270 q 12 50 0 90" fill="none" />
          </g>
        )}
        {/* 窓の外の町を描き足す (アーチの中だけ) */}
        <defs><clipPath id="mzdb86win"><path d="M 160 760 L 160 420 A 300 300 0 0 1 760 420 L 760 760 Z" /></clipPath></defs>
        <g clipPath="url(#mzdb86win)">
          <MzDbTown f={f} t0={32} />
          {/* 町の上を渡っていく音の輪 */}
          {Array.from({ length: 3 }, (_, i) => {
            const u = (f - 30 - i * 14) / 50;
            if (u < 0 || u > 1) return null;
            return <path key={i} d={`M ${760 - u * 640} 560 q -40 80 0 200`} fill="none" stroke={MP.glow} strokeWidth={8} opacity={1 - u} />;
          })}
        </g>
        <path d="M 310 180 L 310 760 M 460 120 L 460 760 M 610 180 L 610 760 M 160 560 L 760 560" stroke={MP.iron} strokeWidth={7} opacity={0.9} />
        {rings}
        {/* 打った瞬間の火花 */}
        {f >= 20 && f < 32 && (
          <g>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const k = seg(f, 20, 32);
              return <line key={i} x1={1130 + Math.cos(a) * 20} y1={400 + Math.sin(a) * 20} x2={1130 + Math.cos(a) * (40 + k * 60)} y2={400 + Math.sin(a) * (40 + k * 60)}
                stroke={MP.flame} strokeWidth={7} strokeLinecap="round" opacity={1 - k} />;
            })}
          </g>
        )}
        {/* 木づち (柄と頭)。両手で握る */}
        <g>
          <line x1={hx} y1={hy + 20} x2={head[0]} y2={head[1]} stroke={MP.woodDark} strokeWidth={16} strokeLinecap="round" />
          <line x1={hx} y1={hy + 20} x2={head[0]} y2={head[1]} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          <g transform={`translate(${head[0]} ${head[1]}) rotate(${rot})`}>
            <rect x={-58} y={-30} width={116} height={60} rx={12} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-58} y={-30} width={22} height={60} rx={6} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={36} y={-30} width={22} height={60} rx={6} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        <MzDbWatchman x={px} y={py} s={ps} f={f} face={face} pose="hold" lean={f < 22 ? -4 * wind : 3} gaze={[6, -4]} />
        {/* 汗をぬぐったあとの汗の粒 */}
        {f > 96 && [0, 1, 2].map((k) => {
          const u = seg(f, 96 + k * 6, 120 + k * 6);
          return <path key={k} d={`M ${px - 70 - u * 60 - k * 20} ${py - 300 * ps + u * 40} q -9 14 0 20 q 9 -6 0 -20 Z`} fill="#9CCAE8" stroke={KRP.ink} strokeWidth={3} opacity={1 - u * 0.6} />;
        })}
      </g>
      <TagPlate x={330} y={186} text="ウィーン" size={40} t={1} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #87 つまり、町を起こす番人を、機械が起こしていました。
// 格: 図 / seed 6087
// 絵: どこ: 夜明け前のウィーンの町の断面図 (塔の断面と、その下の家々の断面を、古い羊皮紙の版画のような絵柄で一枚に)。演出: 図の主役は、上から下へ流れる「起こす順番」。①塔の最上階の鉄の時計がジリリ → ②その音の線がわら布団の番人に届き番人が跳ね起きる → ③番人が鐘を打ち、音の輪が下の家々へ → ④家々の人 (男女を混ぜる。男: 帽子とチュニック / 女: 頭巾と長いスカート) が順に起き上がる。各段に番号札「1」「2」「3」だけ。いちばん上の時計の上は空っぽ (誰も時計を起こしていない) で、そこに小さな歯車がひとりでに回っている。カメラは上から下へスクロール。動き: f0-40 ① / f40-80 ② / f80-120 ③ / f120-160 ④
// どこ: 古い羊皮紙に刷った版画ふうの「夜明け前のウィーンの断面図」。中央に塔の断面 (屋根裏に鉄の時計 / 番人の部屋に大きな鐘とわら布団 / 下は階段)、
//       左右の下に家々の断面 (寝室) とパン屋。紙の焼け・ふちの二重線・斜線のハッチング
// 演出: ① 屋根裏の鉄の時計がジリリ → 点線の音が番人の耳へ、番人が跳ね起きる → ② 番人が鐘を打つ → ③ 音の輪が左右の家へ、
//       男女の町の人 (男=帽子とチュニック / 女=頭巾と赤い服・長い髪) が近い家から順に起き上がる。時計の上は空っぽで、歯車がひとりで回るだけ
// 動き: f0-10 ① / f10-20 跳ね起きる / f20-30 鐘 / f30-42 町の人が順に / f0-131 カメラが上から下へゆっくりスクロール
const MzDbTownsfolk: React.FC<{ x: number; y: number; s: number; f: number; up: number; female: boolean; phase: number }> = ({ x, y, s, f, up, female, phase }) => {
  const hipY = y - 58 * s;
  const ang = lerp(-82, 0, easeOut(up));
  return (
    <g>
      <g transform={`rotate(${ang} ${x} ${hipY})`}>
        <Person x={x} y={y} s={s} f={f} phase={phase} pose={up > 0.6 ? "banzai" : "sit"} hair={female ? "none" : "cap"}
          face={up > 0.5 ? "surprised" : "normal"}
          cloth={female ? C.rose : C.vest} clothDark={female ? C.roseDark : C.vestDark} />
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          {up < 0.5 && <MzDbEyes mode="sleep" />}
          {female ? (<g><MzDbHair kind="long" /><MzDbBonnet /></g>) : <MzDbManHat color="#5A4A3A" />}
        </g>
      </g>
      {/* 掛け布団 (脚の上) */}
      <path d={`M ${x - 30 * s} ${y - 70 * s} Q ${x + 60 * s} ${y - 96 * s} ${x + 170 * s} ${y - 70 * s} L ${x + 176 * s} ${y} L ${x - 34 * s} ${y} Z`}
        fill={female ? "#D9A0A0" : "#A8B890"} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

const Mz087: React.FC<{ f: number }> = ({ f }) => {
  const s1 = seg(f, 0, 6);
  const sound1 = seg(f, 4, 12);
  const jump = seg(f, 12, 18);
  const walk = easeInOut(seg(f, 18, 25));
  const strike = seg(f, 25, 28);
  const rings = seg(f, 28, 60);
  const scroll = easeInOut(seg(f, 0, 131));
  const camT = camLerp([960, 470, 1.0], [960, 590, 1.0], scroll);
  const ink = C.sepia;
  // 番人 (塔の中の部屋)
  const wx = lerp(900, 830, walk);
  const malletRot = f < 25 ? lerp(0, -50, seg(f, 18, 25)) : lerp(-50, 30, strike);
  const folk = [
    { x: 440, female: true, t: 30 },
    { x: 1150, female: false, t: 33 },
    { x: 250, female: false, t: 36 },
    { x: 1390, female: true, t: 39 },
  ];
  return (
    <Frame f={f} seed={6087} bg={C.parch}>
      <g transform={camT}>
        {/* 羊皮紙 */}
        <rect x={-60} y={-80} width={2040} height={1260} fill={C.parch} />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={rnd(87, i) * 1900} cy={rnd(88, i) * 1000} r={40 + rnd(89, i) * 90} fill={C.parchDark} opacity={0.18} />
        ))}
        <rect x={40} y={-20} width={1840} height={950} fill="none" stroke={ink} strokeWidth={8} />
        <rect x={58} y={-2} width={1804} height={914} fill="none" stroke={ink} strokeWidth={3} />
        {/* 地面 (夜明け前の土・石畳の断面) */}
        <rect x={58} y={800} width={1804} height={112} fill="#BFA06E" />
        <g stroke={ink} strokeWidth={2.5} opacity={0.6}>
          {Array.from({ length: 46 }, (_, i) => <line key={i} x1={70 + i * 40} y1={812} x2={50 + i * 40} y2={900} />)}
        </g>
        <line x1={58} y1={800} x2={1862} y2={800} stroke={ink} strokeWidth={5} />
        {/* 夜明け前の空 (版画の横線)・星 */}
        <g stroke={ink} strokeWidth={2} opacity={0.22}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={70} y1={20 + i * 34} x2={1850} y2={20 + i * 34} />)}
        </g>
        {[[220, 80], [420, 140], [1300, 70], [1560, 150], [1760, 60], [1120, 200]].map(([sx, sy], i) => (
          <MzDbSpark key={i} x={sx} y={sy} s={0.7} o={0.6 + 0.4 * Math.sin(f / 6 + i)} color={C.parch} />
        ))}
        {/* ===== 塔の断面 ===== */}
        <path d="M 600 160 L 800 10 L 1000 160 Z" fill="#B88A5A" stroke={ink} strokeWidth={6} strokeLinejoin="round" />
        <g stroke={ink} strokeWidth={2.5} opacity={0.5}>
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={650 + i * 44} y1={150} x2={680 + i * 44} y2={120 - (i < 4 ? i : 7 - i) * 18} />)}
        </g>
        <rect x={620} y={160} width={360} height={640} fill="#D9C49A" stroke={ink} strokeWidth={6} />
        {/* 石積みの線 */}
        <g stroke={ink} strokeWidth={2.5} opacity={0.45}>
          {Array.from({ length: 15 }, (_, i) => <line key={i} x1={620} y1={200 + i * 42} x2={640} y2={200 + i * 42} />)}
          {Array.from({ length: 15 }, (_, i) => <line key={`r${i}`} x1={960} y1={200 + i * 42} x2={980} y2={200 + i * 42} />)}
        </g>
        <rect x={620} y={160} width={22} height={640} fill="#B8A078" stroke={ink} strokeWidth={3} />
        <rect x={958} y={160} width={22} height={640} fill="#B8A078" stroke={ink} strokeWidth={3} />
        {/* 床 */}
        <rect x={620} y={300} width={360} height={16} fill="#A87C50" stroke={ink} strokeWidth={4} />
        <rect x={620} y={560} width={360} height={16} fill="#A87C50" stroke={ink} strokeWidth={4} />
        {/* 下の階段 */}
        <path d="M 660 800 L 660 770 L 700 770 L 700 740 L 740 740 L 740 710 L 780 710 L 780 680 L 820 680 L 820 650 L 860 650 L 860 620 L 900 620 L 900 590 L 940 590 L 940 800 Z"
          fill="#C4A878" stroke={ink} strokeWidth={4} strokeLinejoin="round" />
        {/* 屋根裏: 鉄の時計 と、その上の空っぽ (歯車がひとりで回るだけ) */}
        <rect x={660} y={286} width={140} height={14} fill="#8A6A44" stroke={ink} strokeWidth={3} />
        <MzDbIronClock x={730} y={288} s={0.5} f={f} ring={s1 * (f < 70 ? 1 : 0.4)} />
        <MzDbGear x={760} y={110} r={24} rot={f * 3} fill={MP.brass} sw={3} />
        <MzDbGear x={790} y={84} r={14} rot={-f * 5} fill={MP.brassDark} sw={2.5} />
        {/* ① → ② 点線の音 (時計から番人の耳へ) */}
        {sound1 > 0 && (
          <path d={`M 770 170 Q 900 180 ${lerp(770, 880, sound1)} ${lerp(170, 430, sound1)}`} fill="none" stroke={KRP.red} strokeWidth={5}
            strokeDasharray="12 10" strokeDashoffset={-f * 3} />
        )}
        {/* 番人の部屋: わら布団と大きな鐘 */}
        <rect x={830} y={530} width={130} height={30} rx={8} fill="#D8BC72" stroke={ink} strokeWidth={4} />
        <g transform={`rotate(${f >= 28 ? Math.sin((f - 28) / 4) * 4 * (1 - rings) : 0} 700 330)`}>
          <line x1={700} y1={316} x2={700} y2={350} stroke={ink} strokeWidth={6} />
          <path d="M 660 380 Q 660 350 700 348 Q 740 350 740 380 L 750 470 Q 752 486 770 494 L 630 494 Q 648 486 650 470 Z" fill="#B08A48" stroke={ink} strokeWidth={5} />
          <path d="M 668 390 Q 664 440 658 480" stroke="#D8B878" strokeWidth={6} fill="none" opacity={0.7} />
        </g>
        {jump < 0.5 ? (
          <MzDbLying hx={850} hy={516} s={0.4} f={f} eyes={f < 4 ? "sleep" : "grimace"} mouth="snore" snore={0.5} hatDown={0} />
        ) : (
          <g transform={`translate(0 ${-Math.sin(clamp01((jump - 0.5) * 2) * Math.PI) * 40})`}>
            <line x1={wx - 8} y1={500} x2={wx - 8 + Math.sin((malletRot * Math.PI) / 180) * 120} y2={500 - Math.cos((malletRot * Math.PI) / 180) * 120}
              stroke={MP.woodDark} strokeWidth={9} strokeLinecap="round" />
            <circle cx={wx - 8 + Math.sin((malletRot * Math.PI) / 180) * 120} cy={500 - Math.cos((malletRot * Math.PI) / 180) * 120} r={16} fill={MP.wood} stroke={ink} strokeWidth={4} />
            <MzDbWatchman x={wx} y={558} s={0.42} f={f} pose="hold" face={f < 28 ? "surprised" : "angry"} />
          </g>
        )}
        {/* ③ 鐘の音の輪 (左右の家へ) */}
        {rings > 0 && rings < 1 && [0, 1, 2].map((k) => {
          const u = clamp01(rings * 1.3 - k * 0.15);
          if (u <= 0 || u >= 1) return null;
          const r = 120 + u * 760;
          return <circle key={k} cx={700} cy={440} r={r} fill="none" stroke={KRP.red} strokeWidth={7} opacity={(1 - u) * 0.8} strokeDasharray="22 14" />;
        })}
        {/* ===== 家々の断面 (左に2軒・右に2軒とパン屋) ===== */}
        {[[170, 580], [1020, 1290], [1300, 1560]].map(([x0, x1], i) => (
          <g key={i}>
            <path d={`M ${x0 - 14} 620 L ${(x0 + x1) / 2} 540 L ${x1 + 14} 620 Z`} fill="#B5643E" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
            <rect x={x0} y={620} width={x1 - x0} height={180} fill="#E6D2A6" stroke={ink} strokeWidth={5} />
            <g stroke={ink} strokeWidth={2} opacity={0.35}>
              {Array.from({ length: Math.floor((x1 - x0) / 30) }, (_, k) => <line key={k} x1={x0 + 10 + k * 30} y1={630} x2={x0 + 30 + k * 30} y2={650} />)}
            </g>
            {i === 0 && <line x1={385} y1={620} x2={385} y2={800} stroke={ink} strokeWidth={5} />}
          </g>
        ))}
        {/* パン屋 (かまどの火) */}
        <rect x={1580} y={640} width={260} height={160} fill="#DCC49A" stroke={ink} strokeWidth={5} />
        <path d="M 1566 640 L 1710 570 L 1854 640 Z" fill="#B5643E" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 1640 800 L 1640 730 Q 1700 680 1760 730 L 1760 800 Z" fill="#8A5A3A" stroke={ink} strokeWidth={4} />
        <path d="M 1662 800 L 1662 744 Q 1700 712 1738 744 L 1738 800 Z" fill={f > 40 ? C.fire : "#3A2A20"} stroke={ink} strokeWidth={3} />
        <rect x={1780} y={540} width={26} height={60} fill="#8A5A3A" stroke={ink} strokeWidth={4} />
        {f > 40 && [0, 1, 2].map((k) => {
          const u = ((f - 40 + k * 12) % 36) / 36;
          return <circle key={k} cx={1793 + u * 20} cy={530 - u * 90} r={10 + u * 14} fill={C.parchDark} stroke={ink} strokeWidth={2} opacity={1 - u} />;
        })}
        {/* ベッドと町の人 (近い家から順に起き上がる) */}
        {folk.map((p, i) => (
          <g key={i}>
            <rect x={p.x - 50} y={772} width={180} height={28} rx={6} fill="#9A7048" stroke={ink} strokeWidth={4} />
            <MzDbTownsfolk x={p.x} y={782} s={0.42} f={f} up={seg(f, p.t, p.t + 5)} female={p.female} phase={i} />
            {seg(f, p.t, p.t + 5) > 0.5 && <MzDbRing x={p.x} y={782 - 96} r={60} amt={1 - seg(f, p.t + 8, p.t + 40)} f={f} color={KRP.red} w={4} />}
          </g>
        ))}
        {/* 起こす順番の矢印 (赤い点線) */}
        <path d="M 600 220 Q 520 330 590 440" fill="none" stroke={KRP.red} strokeWidth={6} strokeDasharray="14 10" opacity={seg(f, 8, 14)} />
        <path d="M 600 470 Q 520 560 560 680" fill="none" stroke={KRP.red} strokeWidth={6} strokeDasharray="14 10" opacity={seg(f, 26, 32)} />
        {/* 段の番号札 (左端をそろえる) */}
        <TagPlate x={110} y={230} text="1" size={46} t={seg(f, 0, 8)} />
        <TagPlate x={110} y={440} text="2" size={46} t={seg(f, 14, 22)} />
        <TagPlate x={110} y={660} text="3" size={46} t={seg(f, 28, 36)} />
        <TagPlate x={1620} y={130} text="ウィーン" size={40} t={seg(f, 0, 10)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #88 起こす人を、誰が起こすのか。最初の答えは、機械でした。
// 格: 山 / seed 6088
// 絵: どこ: BanninTou (ring=1, wake=1) の部屋。夜明けの光が窓から差し込みはじめる。演出: 番人が、自分を起こした小さなベル付きの鉄の時計を、両手でそっと持ち上げて (腕は2本、pose で両手で時計を捧げ持つ)、「おまえか」という顔で見つめる (face="surprised"→"smile")。時計の真上に NazoBell (x=時計の上, s=0.8, solved=false) がぽんと出てきて、その「?」がくるっと一回転して、横に小さな歯車のマークが1つくっつく (答えの1つめ。ただし「?」は外れない)。カメラは番人と時計へぐっと寄る。動き: f0-40 時計を持ち上げる / f40 NazoBell が出る / f60-90 「?」が回る・歯車がくっつく / f90-150 番人の顔がほころぶ・朝の光
// どこ: BanninTou の部屋 (夜明け)。窓の空が橙に、朝の光の筋が床まで差し込む
// 演出: 番人が木箱の前に立ち、自分を起こしたベル付きの鉄の時計を両手で頭の上へ捧げ持って「おまえか」と見上げる。
//       時計の上にナゾベルがぽんと出て、くるっと一回転し、横に小さな歯車のマークがカチッとくっつく (答えの1つめ。「?」は外れない)。番人の顔がほころぶ
// 動き: f0-14 持ち上げる / f14 ナゾベル / f20-32 一回転 / f30-36 歯車 / f36 笑顔 / f20-148 朝の光が強まる・カメラがぐっと寄る
const Mz088: React.FC<{ f: number }> = ({ f }) => {
  const lift = easeOut(seg(f, 0, 14));
  const nb = seg(f, 14, 20);
  const spin = easeInOut(seg(f, 20, 32)) * 360;
  const gear = seg(f, 30, 36);
  const light = seg(f, 10, 60);
  const zoom = easeInOut(seg(f, 0, 148));
  const camT = camLerp([1000, 500, 1.05], [1140, 470, 1.28], zoom);
  const px = 1150, py = 884, ps = 1.25;
  const handY = py - 313 * ps;
  const clockY = handY + 40 * (1 - lift) + Math.sin(f / 10) * 3;
  const nx = 1150, ny = clockY - 4 - 266 * 0.9 - 62;
  const ringAmt = 1 - seg(f, 0, 30);
  return (
    <Frame f={f} seed={6088} bg={MP.nightDeep}>
      <g transform={camT}>
        <BanninTou f={f} ring={0} wake={1} sky={0.75 + light * 0.25} />
        {/* 窓から差し込む朝の光の筋 */}
        <g opacity={0.1 + light * 0.25}>
          <path d="M 560 260 L 760 330 L 1420 880 L 980 880 Z" fill={MP.dawnSoft} />
        </g>
        {/* 番人の帽子は壁の釘に掛けてある */}
        <line x1={1830} y1={420} x2={1850} y2={432} stroke={MP.iron} strokeWidth={6} strokeLinecap="round" />
        <g transform="translate(1846 676) scale(0.8)"><MzDbWatchHat /></g>
        {/* 時計のうしろの、ひらめきの光 */}
        <circle cx={1150} cy={360} r={170} fill={MP.glow} opacity={0.25 + 0.25 * seg(f, 14, 30) + 0.05 * Math.sin(f / 5)} />
        {/* 光の中のホコリ */}
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={500 + rnd(880, i) * 800 + Math.sin(f / 20 + i) * 16} cy={400 + rnd(881, i) * 440 - (f * 0.4) % 60}
            r={3 + rnd(882, i) * 3} fill={MP.glow} opacity={light * 0.8} />
        ))}
        {/* 捧げ持つ時計 (塔の時計と同じ物。番人が前に立って木箱の上は空く) */}
        <MzDbIronClock x={px} y={clockY - 4} s={0.9} f={f} ring={ringAmt} />
        <Person x={px} y={py} s={ps} f={f} pose="hang" cloth={C.cloak} clothDark={C.cloakDark}
          face={f < 36 ? "surprised" : "smile"} gaze={[0, -9]} />
        <g transform={`translate(${px} ${py + Math.sin(f / 13) * 3}) scale(${ps})`}>
          <path d="M -44 -164 Q 0 -150 44 -164 L 30 -150 Q 0 -140 -30 -150 Z" fill={C.cloakDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-156} r={7} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
          {f >= 36 && <ellipse cx={-40} cy={-196} rx={12} ry={7} fill={KRP.red} opacity={0.35} />}
          {f >= 36 && <ellipse cx={40} cy={-196} rx={12} ry={7} fill={KRP.red} opacity={0.35} />}
        </g>
        {/* ナゾベルと、くっつく歯車 */}
        {nb > 0 && (
          <g transform={`rotate(${spin} ${nx} ${ny}) translate(${nx} ${ny}) scale(${pop(nb)}) translate(${-nx} ${-ny})`}>
            <NazoBell x={nx} y={ny} s={0.8} f={f} />
          </g>
        )}
        {gear > 0 && (
          <g transform={`translate(${nx - 74} ${ny + 6}) scale(${pop(gear)})`}>
            <MzDbGear x={0} y={0} r={26} rot={f * 2} fill={MP.ironLight} sw={4} />
          </g>
        )}
        {gear > 0.5 && gear < 1 && (
          <g stroke={MP.glow} strokeWidth={5} strokeLinecap="round">
            <line x1={nx - 108} y1={ny - 30} x2={nx - 124} y2={ny - 46} />
            <line x1={nx - 112} y1={ny + 40} x2={nx - 128} y2={ny + 56} />
          </g>
        )}
        {/* 窓辺の鳩 (朝の気配) */}
        <g transform={`translate(${640 - seg(f, 60, 100) * 40} 728)`}>
          <ellipse cx={0} cy={0} rx={26} ry={16} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={-22} cy={-12} r={11} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={-25} cy={-14} r={2.5} fill={KRP.ink} />
          <path d="M -33 -12 L -40 -9 L -33 -7 Z" fill={KRP.orange} />
          <line x1={-4} y1={14} x2={-6} y2={22} stroke={KRP.orange} strokeWidth={3} />
          <line x1={6} y1={14} x2={6} y2={22} stroke={KRP.orange} strokeWidth={3} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #89 いまから約470年前には、机に置ける、ゼンマイ式の目覚まし時計も、作られます。
// 格: 山 / seed 6089
// 絵: どこ: 16世紀ドイツの時計職人の工房 (木の作業台・万力・やすり・ろうそく・棚に部品の箱・窓の外に木組みの家)。演出: 主役は机の上の小さな時計 (真鍮色の太鼓のような丸い筒形・上に文字盤・横に小さなベル・つまみ)。職人 (一般の人・男性・ベレー帽・革の前かけ・顔あり) が、ゼンマイ (くるくる巻いた金属の帯) を時計の中に入れ、つまみをキリキリ巻く (腕は2本、pose で左手に時計、右手でつまみ)。巻き終わってそっと机に置くと、ゼンマイの力でチリリンと小さくベルが鳴り、職人の飼い猫が跳び上がる。年代札「約470年前」。カメラは工房の引きから机の上の時計へ寄る。#82 の壁の時計 (大きい) を棚の上に小さく置いて大きさを比べさせる。動き: f0-50 ゼンマイを入れる / f50-90 巻く / f100 チリリン / f105 猫
// どこ: 16世紀ドイツの時計職人の工房。木組みのしっくい壁・左の窓の外に木組みの家々・壁に掛けた道具 (やすり・ペンチ・のこぎり)・
//       棚に部品の箱と、大きさ比べの鉄の壁掛け時計 (15世紀の物)・作業台に万力・ろうそく・ネジの小皿
// 演出: 職人 (男性・ベレー帽・革の前かけ) が、くるくる巻いた金属の帯 (ゼンマイ) を太鼓形の真鍮の時計へ落とし込み、つまみをキリキリ巻く。
//       巻き終えて手を離すとチリリン。台の端で丸まっていた飼い猫が毛を逆立てて跳び上がり、棚の上へ逃げる
// 動き: f0-12 ゼンマイを入れる / f12-30 巻く / f31 チリリン / f33-52 猫が跳ぶ / f0-60 工房の引きから時計へ寄る / 以後ベルの余韻・職人がにっこり
const MzDbCat: React.FC<{ x: number; y: number; s?: number; f: number; mode: "sleep" | "jump" | "sit" }> = ({ x, y, s = 1, f, mode }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {mode === "sleep" ? (
      <g>
        <ellipse cx={0} cy={-28} rx={62} ry={30} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 50 -20 Q 80 -10 60 6 Q 20 10 -20 4" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={-48} cy={-38} r={26} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -66 -56 L -62 -76 L -48 -62 M -40 -62 L -28 -76 L -26 -54" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -60 -38 q 5 4 10 0 M -42 -38 q 5 4 10 0" fill="none" stroke={KRP.ink} strokeWidth={3} />
        <path d="M -20 -44 q 10 -6 20 0 M 10 -46 q 10 -6 20 0" fill="none" stroke="#C26E22" strokeWidth={4} />
      </g>
    ) : (
      <g>
        {/* 毛を逆立てた弓なりの猫 */}
        <path d={`M -60 -20 Q -60 -90 0 -96 Q 60 -90 60 -20`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI + (i / 8) * Math.PI;
          return <line key={i} x1={Math.cos(a) * 60} y1={-30 + Math.sin(a) * 66} x2={Math.cos(a) * 76} y2={-30 + Math.sin(a) * 82} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />;
        })}
        {[-52, -30, 30, 52].map((lx) => <rect key={lx} x={lx - 7} y={-26} width={14} height={34} rx={6} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />)}
        <path d={`M 56 -50 Q 96 -100 ${84 + Math.sin(f / 2) * 6} -140`} fill="none" stroke={KRP.orange} strokeWidth={14} strokeLinecap="round" />
        <path d={`M 56 -50 Q 96 -100 ${84 + Math.sin(f / 2) * 6} -140`} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
        <circle cx={-70} cy={-74} r={30} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
        <path d="M -92 -94 L -90 -120 L -74 -102 M -64 -104 L -50 -122 L -46 -96" fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={-80} cy={-78} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={-60} cy={-78} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={-80} cy={-78} r={3} fill={KRP.ink} />
        <circle cx={-60} cy={-78} r={3} fill={KRP.ink} />
        <ellipse cx={-70} cy={-58} rx={6} ry={8} fill={KRP.ink} />
      </g>
    )}
  </g>
);

const Mz089: React.FC<{ f: number }> = ({ f }) => {
  const zoom = easeInOut(seg(f, 0, 60));
  const camT = camLerp([960, 520, 1.0], [960, 470, 1.22], zoom);
  const drop = easeOut(seg(f, 0, 12));
  const winding = f >= 12 && f < 30;
  const knob = f < 12 ? 0 : f < 30 ? (f - 12) * 24 : 18 * 24;
  const ring = f >= 31 ? Math.max(0, 1 - (f - 31) / 60) : 0;
  const catU = seg(f, 33, 52);
  const benchY = 650;
  const cx = 965;
  // 猫: 台の右端 (1360) から棚の上 (1540, 330) へ放物線
  const catX = lerp(1380, 1430, catU);
  const catY = lerp(benchY, 336, catU) - Math.sin(catU * Math.PI) * 160;
  const px = 800, py = 720, ps = 1.3;
  return (
    <Frame f={f} seed={6089} bg={C.wall18}>
      <g transform={camT}>
        {/* しっくいの壁と木組み */}
        <rect x={-40} y={-40} width={2000} height={1160} fill="#E8D9BC" />
        <g fill={MP.woodDark} stroke={KRP.ink} strokeWidth={5}>
          <rect x={-40} y={60} width={2000} height={30} />
          <rect x={-40} y={600} width={2000} height={26} />
          {[120, 700, 1240, 1820].map((bx) => <rect key={bx} x={bx} y={90} width={34} height={510} />)}
          <path d="M 154 100 L 700 590 L 700 556 L 188 96 Z" />
          <path d="M 1274 100 L 1820 590 L 1820 556 L 1308 96 Z" />
        </g>
        {/* 窓 (外に木組みの家々) */}
        <rect x={250} y={150} width={330} height={300} fill="#BFE1F3" stroke={KRP.ink} strokeWidth={6} />
        <g>
          <rect x={270} y={290} width={120} height={160} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 258 290 L 330 214 L 402 290 Z" fill={MP.brick} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 270 340 L 390 340 M 330 290 L 330 450 M 270 290 L 330 340 L 390 290" stroke={MP.woodDark} strokeWidth={6} fill="none" />
          <rect x={410} y={260} width={150} height={190} fill="#F3E6C8" stroke={KRP.ink} strokeWidth={4} />
          <path d="M 400 260 L 485 180 L 570 260 Z" fill={MP.brickDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 410 320 L 560 320 M 485 260 L 485 450 M 410 260 L 485 320 L 560 260 M 410 380 L 485 320" stroke={MP.woodDark} strokeWidth={6} fill="none" />
        </g>
        <path d="M 415 150 L 415 450 M 250 300 L 580 300" stroke={MP.woodDark} strokeWidth={10} />
        <rect x={236} y={446} width={358} height={22} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
        {/* 壁の道具掛け */}
        <rect x={780} y={150} width={400} height={24} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
        <g transform={`rotate(${Math.sin(f / 30) * 2} 830 174)`}>
          <rect x={822} y={174} width={16} height={140} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <rect x={818} y={290} width={24} height={50} rx={6} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <path d="M 920 176 L 900 300 M 940 176 L 960 300" stroke={MP.iron} strokeWidth={10} strokeLinecap="round" />
        <circle cx={930} cy={186} r={10} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={3} />
        <g>
          <path d="M 1020 180 L 1140 180 L 1140 230 L 1020 260 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 1020 260 l 10 -8 l 10 6 l 10 -8 l 10 6 l 10 -8 l 10 6 l 10 -8 l 10 6" fill="none" stroke={KRP.ink} strokeWidth={3} />
          <rect x={1140} y={172} width={40} height={64} rx={8} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 右の棚: 部品の箱と、大きさ比べの鉄の壁掛け時計 */}
        <rect x={1360} y={336} width={520} height={22} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1400 358 L 1420 410 L 1440 358 M 1820 358 L 1800 410 L 1780 358" fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
        <MzDbIronClock x={1580} y={336} s={0.62} f={f} />
        {[1690, 1760].map((bx, i) => (
          <g key={bx}>
            <rect x={bx} y={286} width={60} height={50} fill={i ? MP.woodLight : MP.wood} stroke={KRP.ink} strokeWidth={4} />
            <MzDbGear x={bx + 30} y={290} r={12} fill={MP.brass} sw={2.5} rot={i * 20} />
          </g>
        ))}
        {/* 職人 (台の向こうに立つ) */}
        <Person x={px} y={py} s={ps} f={f} pose="hold" cloth="#7C8A5A" clothDark="#5E6A42" hair="cap"
          face={f < 31 ? "normal" : f < 50 ? "surprised" : "smile"} gaze={[8, 6]} />
        <g transform={`translate(${px} ${py + Math.sin(f / 13) * 3}) scale(${ps})`}>
          {/* 革の前かけ */}
          <path d="M -40 -150 L 40 -150 L 46 -62 L -46 -62 Z" fill="#8A5A34" stroke={KRP.ink} strokeWidth={4} />
          <path d="M -40 -150 L -54 -168 M 40 -150 L 54 -168" stroke="#6A4224" strokeWidth={5} />
          {/* ベレー帽 */}
          <ellipse cx={-6} cy={-282} rx={78} ry={22} fill="#3E3A5E" stroke={KRP.ink} strokeWidth={5} transform="rotate(-8 -6 -282)" />
          <circle cx={-10} cy={-302} r={6} fill="#3E3A5E" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 作業台 */}
        <rect x={-40} y={benchY} width={2000} height={34} fill={C.bench} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-40} y={benchY + 34} width={2000} height={420} fill={C.benchDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#5A3A1E" strokeWidth={4} opacity={0.6}>
          {[740, 800, 860].map((ly) => <line key={ly} x1={-40} y1={ly} x2={1960} y2={ly} />)}
        </g>
        {/* 万力・やすり・ネジの小皿・ろうそく */}
        <g>
          <rect x={300} y={560} width={120} height={90} fill={MP.iron} stroke={KRP.ink} strokeWidth={5} />
          <rect x={286} y={540} width={60} height={30} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={4} />
          <rect x={374} y={540} width={60} height={30} fill={MP.ironLight} stroke={KRP.ink} strokeWidth={4} />
          <line x1={430} y1={610} x2={500} y2={610} stroke={MP.ironLight} strokeWidth={10} strokeLinecap="round" />
          <rect x={540} y={632} width={160} height={14} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-6 620 640)" />
          <ellipse cx={1240} cy={646} rx={46} ry={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3.5} />
          {[1222, 1240, 1256].map((sx) => <circle key={sx} cx={sx} cy={640} r={4} fill={MP.brassDark} />)}
          <rect x={150} y={560} width={30} height={90} fill="#F3E6C8" stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={165} cy={650} rx={44} ry={10} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <Flame x={165} y={560} s={1.1} f={f} phase={2} />
        </g>
        {/* ゼンマイの帯 (上から時計の中へ落とし込む) */}
        {f < 14 && (
          <g transform={`translate(${cx} ${lerp(420, 560, drop)}) scale(${lerp(1.2, 0.5, drop)})`} opacity={1 - seg(f, 11, 14)}>
            <path d={Array.from({ length: 34 }, (_, i) => {
              const a = i * 0.55;
              const rr = 6 + i * 2.2;
              return `${i === 0 ? "M" : "L"} ${Math.cos(a) * rr} ${Math.sin(a) * rr * 0.6}`;
            }).join(" ")} fill="none" stroke={C.spring} strokeWidth={7} strokeLinecap="round" />
            <path d="M 76 0 L 110 -10" stroke={C.spring} strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {/* 主役: 太鼓形のゼンマイ時計 */}
        <MzDbDrumClock x={cx} y={benchY + 4} s={1.2} f={f} ring={ring} knob={knob} open={1 - seg(f, 10, 14)} />
        {/* キリキリの線 */}
        {winding && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={(Math.floor(f / 3) % 2) ? 1 : 0.5}>
            <path d={`M ${cx - 180} ${benchY - 130} l -14 -8 l 6 -10 l -14 -8`} fill="none" />
            <path d={`M ${cx - 175} ${benchY - 30} l -14 8 l 6 10 l -14 8`} fill="none" />
          </g>
        )}
        {/* チリリンのきらきら */}
        {ring > 0.05 && [0, 1, 2, 3].map((k) => (
          <MzDbSpark key={k} x={cx + 170 + Math.cos(k * 1.6 + f / 6) * 70} y={benchY - 200 + Math.sin(k * 1.6 + f / 6) * 50} s={0.9}
            o={ring} color={MP.brassLight} />
        ))}
        {/* 猫 */}
        {f < 33 ? (
          <MzDbCat x={1380} y={benchY} s={1} f={f} mode="sleep" />
        ) : (
          <MzDbCat x={catX} y={catY} s={0.95} f={f} mode="jump" />
        )}
        {f >= 33 && f < 40 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
            <line x1={1330} y1={benchY - 40} x2={1300} y2={benchY - 70} />
            <line x1={1380} y1={benchY - 50} x2={1380} y2={benchY - 90} />
            <line x1={1430} y1={benchY - 40} x2={1460} y2={benchY - 70} />
          </g>
        )}
      </g>
      <TagPlate x={1060} y={56} text="約470年前" size={40} t={seg(f, 2, 12)} />
      <TagPlate x={1310} y={56} text="ドイツ" size={40} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #90 ドイツ製のものが、いまも、イギリスの博物館に残っています。
// 格: 並 / seed 6090
// 絵: どこ: 現代のイギリスの博物館の展示室 (木の床・ガラスの展示ケース・柔らかい照明・壁に額。館名やロゴは描かない)。演出: 主役はガラスケースの中の #89 の時計 (少し古びて、真鍮が茶色くくすむ)。ケースの小札「1545-55年」「ドイツ製」。ケースの前で、見学の家族 (お父さん: 青いセーター・短髪 / お母さん: 赤いコート・肩までの茶色の髪・スカート / 子ども) が顔を近づける。子どもがガラスにおでこをくっつけ、時計の小さなベルがかすかにチリッと鳴った気がして、家族がそろってびくっとのけぞる (face="surprised")。警備員が「さわらないで」と手を上げる。カメラはケースの寄りから家族を入れて少し引く。動き: f0-40 子どもが近づく / f60 チリッ / f65 のけぞる / f80 警備員
// どこ: 現代のイギリスの博物館の展示室。深緑の壁に金の額縁の絵、天井のスポットライト、木の床、真ん中にガラスの展示ケース (館名・ロゴなし)
// 演出: ケースの中の赤いビロードの台に、#89 の太鼓形のゼンマイ時計 (真鍮が茶色くくすむ)。台の前に小札「1545-55年」「ドイツ製」。
//       踏み台に乗った子どもがガラスにおでこをくっつけた瞬間、時計の小さなベルがかすかにチリッ。家族 (お父さん=青いセーター・短髪 /
//       お母さん=赤いコート・肩までの茶色の髪・スカート) と子どもがそろってびくっとのけぞり、右の警備員が「さわらないで」と手を上げる
// 動き: f0-14 子どもが近づいておでこをつける / f18 チリッ / f20-26 のけぞる / f28-34 警備員が手を上げる / f0-40 ケースの寄りから引く / 以後ゆっくり寄り戻す
const Mz090: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeInOut(seg(f, 0, 40));
  const back = seg(f, 60, 145);
  const camT = f < 40 ? camLerp([960, 520, 1.4], [960, 540, 1.0], pull) : camLerp([960, 540, 1.0], [960, 530, 1.06], back);
  const near = easeOut(seg(f, 0, 14));
  const chirp = f >= 18 ? Math.max(0, 1 - (f - 18) / 40) : 0;
  const jolt = easeOut(seg(f, 20, 26)) * (1 - 0.5 * seg(f, 70, 110));
  const guard = easeOut(seg(f, 28, 34));
  const shocked = f >= 20 && f < 100;
  const floorY = 880;
  return (
    <Frame f={f} seed={6090} bg={C.museumWall}>
      <g transform={camT}>
        {/* 壁と腰板 */}
        <rect x={-60} y={-60} width={2040} height={1000} fill={C.museumWall} />
        <rect x={-60} y={700} width={2040} height={180} fill={C.museumWallDark} />
        <line x1={-60} y1={700} x2={1980} y2={700} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-60} y={690} width={2040} height={14} fill={MP.woodLight} stroke={KRP.ink} strokeWidth={4} />
        {/* 額縁の絵 (風景と肖像ふう。顔は描かない) */}
        {[[110, 170, 300, 220], [1520, 230, 280, 300]].map(([fx, fy, fw, fh], i) => (
          <g key={i}>
            <rect x={fx - 18} y={fy - 18} width={fw + 36} height={fh + 36} fill={KRP.gold} stroke={KRP.ink} strokeWidth={5} />
            <rect x={fx} y={fy} width={fw} height={fh} fill={i ? "#5E5040" : "#BFD8C8"} stroke={KRP.ink} strokeWidth={4} />
            {i === 0 ? (
              <g>
                <path d={`M ${fx} ${fy + 150} Q ${fx + 80} ${fy + 90} ${fx + 160} ${fy + 140} Q ${fx + 230} ${fy + 100} ${fx + fw} ${fy + 130} L ${fx + fw} ${fy + fh} L ${fx} ${fy + fh} Z`} fill="#7FA86A" />
                <circle cx={fx + 230} cy={fy + 60} r={26} fill={KRP.yellow} />
              </g>
            ) : (
              <g>
                <path d={`M ${fx + 100} ${fy + fh - 20} L ${fx + 110} ${fy + 170} L ${fx + 170} ${fy + 170} L ${fx + 180} ${fy + fh - 20} Z`} fill="#7FA8C9" stroke={KRP.ink} strokeWidth={3} />
                {[[110, 120, KRP.red], [150, 100, KRP.yellow], [190, 126, KRP.orange], [130, 150, C.pink], [170, 146, KRP.red]].map(([dx, dy, c], k) => (
                  <circle key={k} cx={fx + (dx as number)} cy={fy + (dy as number)} r={20} fill={c as string} stroke={KRP.ink} strokeWidth={3} />
                ))}
                <rect x={fx + 40} y={fy + fh - 24} width={fw - 80} height={10} fill="#3E3428" />
              </g>
            )}
            <line x1={fx + fw / 2} y1={fy - 18} x2={fx + fw / 2} y2={20} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 天井のスポットライト */}
        <rect x={880} y={-20} width={160} height={30} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 920 10 L 1000 10 L 1010 50 L 910 50 Z" fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 910 50 L 1010 50 L 1240 640 L 680 640 Z" fill={MP.glow} opacity={0.16 + 0.03 * Math.sin(f / 8)} />
        {/* 木の床 */}
        <rect x={-60} y={floorY} width={2040} height={260} fill={C.museumFloor} />
        <g stroke="#7A5232" strokeWidth={4}>
          {[930, 990, 1060].map((ly) => <line key={ly} x1={-60} y1={ly} x2={1980} y2={ly} />)}
        </g>
        <line x1={-60} y1={floorY} x2={1980} y2={floorY} stroke={KRP.ink} strokeWidth={5} />
        {/* 展示ケース: 台座 */}
        <rect x={700} y={640} width={520} height={240} fill="#3A2E26" stroke={KRP.ink} strokeWidth={6} />
        <rect x={720} y={656} width={480} height={208} fill="#4A3A30" stroke={KRP.ink} strokeWidth={3} />
        {/* ガラスの箱 (うしろの面) */}
        <rect x={700} y={340} width={520} height={300} fill={C.glass} opacity={0.35} stroke={KRP.ink} strokeWidth={6} />
        {/* ビロードの台と時計 (くすんだ真鍮) */}
        <path d="M 830 640 L 850 590 L 1070 590 L 1090 640 Z" fill="#A8323A" stroke={KRP.ink} strokeWidth={5} />
        <MzDbDrumClock x={940} y={594} s={1.32} f={f} old={1} ring={chirp * 0.7} />
        {chirp > 0.05 && [0, 1, 2].map((k) => (
          <MzDbSpark key={k} x={1150 + k * 34} y={390 - k * 26 + Math.sin(f / 3 + k) * 6} s={0.7 + k * 0.15} o={chirp} color={MP.brassLight} />
        ))}
        {/* ガラスの前の面 (反射の斜線) */}
        <rect x={700} y={340} width={520} height={300} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <g stroke={KRP.white} strokeWidth={10} opacity={0.45} strokeLinecap="round">
          <line x1={740} y1={480} x2={820} y2={380} />
          <line x1={770} y1={500} x2={860} y2={390} />
          <line x1={1120} y1={620} x2={1190} y2={530} />
        </g>
        {/* 小札 (左端をそろえる) */}
        <TagPlate x={960} y={714} text="1545-55年" size={30} t={seg(f, 4, 14)} />
        <TagPlate x={900} y={790} text="ドイツ製" size={30} t={seg(f, 8, 18)} />
        {/* おでこの跡 (ガラスのくもり) */}
        {f > 14 && <ellipse cx={706} cy={612} rx={16} ry={22} fill={KRP.white} opacity={0.45 * (1 - seg(f, 60, 140))} />}
        {/* 踏み台と子ども */}
        <rect x={590} y={824} width={110} height={56} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        <line x1={600} y1={850} x2={690} y2={850} stroke={MP.woodDark} strokeWidth={4} />
        <Person x={lerp(630, 652, near) - jolt * 8} y={826} s={0.74} f={f} phase={2} cloth={C.kidYellow} clothDark={C.kidYellowDark}
          lean={lerp(4, 14, near) - jolt * 22} face={shocked ? "surprised" : "smile"} gaze={[8, -2]} />
        {/* お父さん (青いセーター・短髪) */}
        <Person x={420 - jolt * 20} y={floorY} s={1.0} f={f} phase={1} cloth={C.sweaterBlue} clothDark={C.sweaterBlueDark}
          lean={lerp(6, 10, near) - jolt * 22} face={shocked ? "surprised" : "smile"} gaze={[10, 0]} pose={shocked ? "banzai" : "stand"} />
        {/* お母さん (赤いコート・肩までの茶色の髪・スカート) */}
        <g>
          <g transform={`rotate(${lerp(-6, -10, near) + jolt * 22} 1370 ${floorY})`}>
            <Person x={1370} y={floorY} s={1.0} f={f} phase={3} hair="none" cloth={C.coatRed} clothDark={C.coatRedDark}
              face={shocked ? "surprised" : "smile"} gaze={[-10, 0]} pose={shocked ? "raise" : "hold"} />
            <g transform={`translate(1370 ${floorY + Math.sin((f + 51) / 13) * 3})`}>
              <MzDbHair kind="long" />
              <MzDbSkirt color={C.coatRed} dark={C.coatRedDark} />
            </g>
          </g>
        </g>
        {/* 警備員 (紺の制服と帽子)。手を上げて止める */}
        <g transform={`translate(${lerp(1900, 1690, easeOut(seg(f, 20, 32)))} 0)`}>
          <Person x={0} y={floorY} s={1.02} f={f} phase={4} cloth={C.guard} clothDark={C.guardDark} pose={guard > 0.3 ? "raise" : "stand"}
            face={guard > 0.3 ? "worried" : "normal"} gaze={[-10, 0]} />
          <g transform={`translate(0 ${floorY + Math.sin((f + 68) / 13) * 3}) scale(1.02)`}>
            <path d="M -60 -262 Q -58 -310 0 -312 Q 58 -310 60 -262 Z" fill={C.guard} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -66 -262 L 70 -262 L 90 -248 L -66 -250 Z" fill={KRP.ink} />
            <circle cx={0} cy={-290} r={9} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-46} y={-140} width={22} height={16} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {guard > 0.3 && (
            <g transform={`translate(${70} ${floorY - 300}) rotate(${Math.sin(f / 4) * 8})`} opacity={guard}>
              <circle r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -10 -14 L -10 -32 M 0 -16 L 0 -36 M 10 -14 L 10 -32" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
            </g>
          )}
        </g>
        {/* びくっの線 */}
        {jolt > 0.2 && f < 70 && [[560, 560], [420, 590], [1370, 590]].map(([jx, jy], i) => (
          <g key={i} stroke={KRP.white} strokeWidth={5} strokeLinecap="round" opacity={0.9}>
            <line x1={jx - 70} y1={jy - 40} x2={jx - 96} y2={jy - 70} />
            <line x1={jx} y1={jy - 66} x2={jx} y2={jy - 100} />
            <line x1={jx + 70} y1={jy - 40} x2={jx + 96} y2={jy - 70} />
          </g>
        ))}
        {/* 床の立ち入り禁止ロープ */}
        <g>
          {[620, 1300].map((sx) => (
            <g key={sx}>
              <rect x={sx - 8} y={800} width={16} height={80} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
              <ellipse cx={sx} cy={880} rx={30} ry={8} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          <path d="M 628 812 Q 960 870 1292 812" fill="none" stroke="#A8323A" strokeWidth={10} />
        </g>
      </g>
      <TagPlate x={1640} y={124} text="イギリス" size={40} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #91 ところで、ネットでよく見る、こんな話があります。
// 格: 並 / seed 6091
// 絵: どこ: 夜のあなたの部屋のソファ (クッション・ローテーブル・観葉植物。寝室とは別の部屋)。演出: 主役はスマホの画面。水色のパジャマのあなた (hair="cap") がソファに寝ころんでスマホを見ている (腕は2本、両手でスマホを持つ pose)。カメラがスマホの画面に寄ると、画面いっぱいに「豆知識」風の記事: 古い木の時計のイラスト・大きな「1787」の数字・王冠マーク・ハートが次々に増える (いいねの数がぱらぱら増える)。あなたは「へえ」と眉を上げる (face="surprised")。字幕と同じ文は画面に書かない。動き: f0-40 寄り / f40-120 ハートが増える / f60 あなたの眉
// どこ: 夜のあなたの部屋 (寝室とは別の居間)。紺の壁・窓の外の夜の町と月・フロアランプの暖かい光・ソファ (クッション)・ローテーブル (マグカップ・お菓子)・観葉植物
// 演出: 水色のパジャマのあなたがソファに寝ころび、両手でスマホ。カメラが寄ると、スマホの画面が大きく飛び出して「豆知識」ふうの記事:
//       古い木の時計の絵・大きな「1787」・王冠・ハートがぽこぽこ増え、いいねの数がぱらぱら上がる。あなたは「へえ」と眉を上げる
// 動き: f0-30 カメラがあなたへ寄る / f14-34 画面が飛び出す / f24〜 ハートが増える・数が上がる / f30 眉が上がる / 以後ハートが流れ続ける
const Mz091: React.FC<{ f: number }> = ({ f }) => {
  const push = easeInOut(seg(f, 0, 30));
  const camT = camLerp([960, 540, 1.0], [880, 560, 1.22], push) ;
  const zoomOut = easeOut(seg(f, 14, 34));
  const feetX = 1010, feetY = 690, ps = 1.1, ang = -78;
  // 手元 (スマホ) の位置 = 人の座標 (0,-130*ps) を回す
  const rad = (ang * Math.PI) / 180;
  const pxw = feetX - (-130 * ps) * Math.sin(rad);
  const pyw = feetY + (-130 * ps) * Math.cos(rad);
  // 飛び出した画面 (画面座標)
  const bigX = lerp(960 + (pxw - 880) * 1.22, 1390, zoomOut);
  const bigY = lerp(540 + (pyw - 560) * 1.22, 450, zoomOut);
  const bigS = lerp(0.12, 1, zoomOut);
  const likes = Math.floor(Math.pow(Math.max(0, f - 24), 2) * 7.3 + Math.max(0, f - 24) * 41);
  const surprised = f >= 30;
  return (
    <Frame f={f} seed={6091} dark bg={C.roomNight}>
      <g transform={camT}>
        {/* 壁 */}
        <rect x={-60} y={-60} width={2040} height={820} fill={C.roomNight} />
        <g stroke={C.roomNightDark} strokeWidth={6} opacity={0.6}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={-60} x2={i * 150} y2={760} />)}
        </g>
        {/* 窓 (夜の町と月) */}
        <rect x={140} y={140} width={340} height={340} fill={MP.nightDeep} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={400} cy={220} r={34} fill="#FFF3C8" />
        <path d="M 140 480 L 140 380 L 200 380 L 200 340 L 260 340 L 260 400 L 330 400 L 330 310 L 390 310 L 390 420 L 480 420 L 480 480 Z" fill="#141A30" />
        {[[160, 400], [220, 360], [350, 330], [350, 370], [420, 440]].map(([wx, wy], i) => (
          <rect key={i} x={wx} y={wy} width={12} height={14} fill="#FFD27A" opacity={0.7 + 0.3 * Math.sin(f / 10 + i)} />
        ))}
        <path d="M 310 140 L 310 480 M 140 310 L 480 310" stroke={MP.woodDark} strokeWidth={10} />
        <rect x={120} y={120} width={380} height={380} fill="none" stroke={MP.woodDark} strokeWidth={14} />
        <path d="M 100 110 Q 130 300 112 520 L 160 520 Q 150 300 170 110 Z" fill="#8A6AA8" stroke={KRP.ink} strokeWidth={4} />
        {/* フロアランプ */}
        <line x1={1530} y1={330} x2={1530} y2={880} stroke={MP.iron} strokeWidth={10} />
        <ellipse cx={1530} cy={880} rx={60} ry={14} fill={MP.iron} />
        <path d="M 1460 330 L 1600 330 L 1570 230 L 1490 230 Z" fill="#F3DCA0" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1530} cy={330} r={300} fill={MP.glow} opacity={0.12 + 0.02 * Math.sin(f / 7)} />
        {/* 床 */}
        <rect x={-60} y={760} width={2040} height={400} fill="#5A4A6A" />
        <line x1={-60} y1={760} x2={1980} y2={760} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={900} cy={900} rx={560} ry={70} fill="#7A6A8E" stroke={KRP.ink} strokeWidth={4} />
        {/* 観葉植物 */}
        <g transform={`rotate(${Math.sin(f / 40) * 1.5} 1760 880)`}>
          {[-50, -20, 10, 40, 60].map((lx, i) => (
            <path key={i} d={`M 1760 760 Q ${1760 + lx} ${640 - i * 10} ${1760 + lx * 2} ${560 + (i % 2) * 40}`} fill="none" stroke={C.plant} strokeWidth={22} strokeLinecap="round" />
          ))}
          <path d="M 1700 760 L 1820 760 L 1800 880 L 1720 880 Z" fill="#C97A52" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* ソファ */}
        <rect x={500} y={520} width={640} height={190} rx={30} fill={C.sofaDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={520} y={660} width={600} height={110} rx={20} fill={C.sofa} stroke={KRP.ink} strokeWidth={6} />
        <rect x={460} y={590} width={100} height={210} rx={30} fill={C.sofa} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1090} y={590} width={100} height={210} rx={30} fill={C.sofa} stroke={KRP.ink} strokeWidth={6} />
        <rect x={500} y={800} width={20} height={30} fill={MP.woodDark} />
        <rect x={1130} y={800} width={20} height={30} fill={MP.woodDark} />
        {/* クッション (頭の下) */}
        <rect x={540} y={560} width={150} height={110} rx={30} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} transform="rotate(-14 615 615)" />
        {/* あなた (寝ころんで両手でスマホ) */}
        <g transform={`translate(${feetX} ${feetY}) rotate(${ang})`}>
          <Person x={0} y={0} s={ps} f={f} pose="hold" cloth={MP.you} clothDark={MP.youDark} hair="cap" still
            face={surprised ? "surprised" : "normal"} gaze={[6, -2]} />
          {/* スマホ (手の中。画面が光る) */}
          <g transform={`translate(0 ${-134 * ps})`}>
            <rect x={-22} y={-40} width={44} height={74} rx={8} fill={C.phone} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-17} y={-34} width={34} height={60} rx={4} fill={C.screen} />
          </g>
        </g>
        {/* 画面の光が顔を照らす */}
        <circle cx={pxw - 40} cy={pyw - 20} r={110} fill={MP.morning} opacity={0.07 + 0.03 * Math.sin(f / 3)} />
        {/* ローテーブル (マグとお菓子) */}
        <rect x={720} y={800} width={420} height={26} rx={6} fill={MP.wood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={750} y={826} width={18} height={60} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1092} y={826} width={18} height={60} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={3} />
        <rect x={800} y={748} width={50} height={54} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 850 760 Q 872 772 850 790" fill="none" stroke={KRP.ink} strokeWidth={4} />
        {[0, 1].map((k) => (
          <path key={k} d={`M ${814 + k * 18} 740 q 8 -16 0 -30 q -8 -14 0 -28`} fill="none" stroke={KRP.white} strokeWidth={3}
            opacity={0.5 + 0.3 * Math.sin(f / 8 + k)} transform={`translate(${Math.sin(f / 12 + k) * 4} 0)`} />
        ))}
        <ellipse cx={980} cy={796} rx={70} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {[950, 980, 1010].map((cx) => <circle key={cx} cx={cx} cy={786} r={14} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />)}
      </g>
      {/* 飛び出した画面への吹き出しの線 */}
      {zoomOut > 0.05 && (
        <path d={`M ${960 + (pxw - 880) * 1.22} ${540 + (pyw - 560) * 1.22} L ${bigX - 230 * bigS} ${bigY - 200 * bigS} L ${bigX - 230 * bigS} ${bigY + 200 * bigS} Z`}
          fill={C.screen} opacity={0.35 * zoomOut} stroke={KRP.ink} strokeWidth={3} />
      )}
      {/* 大きく飛び出したスマホの画面 (記事) */}
      <g transform={`translate(${bigX} ${bigY}) scale(${bigS})`}>
        <rect x={-250} y={-390} width={500} height={780} rx={46} fill={C.phone} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-224} y={-360} width={448} height={720} rx={24} fill={C.screen} />
        <rect x={-60} y={-376} width={120} height={14} rx={7} fill="#1A1C20" />
        {/* 見出しの帯 */}
        <rect x={-224} y={-330} width={448} height={60} fill={KRP.orange} />
        <text x={-200} y={-288} fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>豆知識</text>
        <circle cx={180} cy={-300} r={18} fill={KRP.white} opacity={0.7} />
        {/* 古い木の時計のイラスト */}
        <rect x={-200} y={-250} width={400} height={290} rx={14} fill="#F3E6C8" stroke={KRP.ink} strokeWidth={4} />
        <MzDbTallClock x={-130} y={26} s={0.4} f={f} build={1} />
        <MzDbCrown x={80} y={-180} s={0.9} f={f} rot={Math.sin(f / 8) * 6} />
        <text x={84} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={KRP.red}
          stroke={KRP.ink} strokeWidth={4} paintOrder="stroke">1787</text>
        {/* 本文の行 (ぼかした線) */}
        {[80, 116, 152].map((ly, i) => <rect key={ly} x={-200} y={ly} width={i === 2 ? 240 : 400} height={16} rx={8} fill={KRP.gray} />)}
        {/* いいね */}
        <g transform="translate(-200 230)">
          <MzDbHeart x={24} y={0} s={1.3 + (Math.floor(f / 4) % 2) * 0.12} />
          <text x={64} y={14} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.heart}>{likes.toLocaleString("en-US")}</text>
        </g>
        <rect x={-224} y={290} width={448} height={70} fill="#ECE6DA" />
      </g>
      {/* ぽこぽこ増えるハート */}
      {Array.from({ length: 12 }, (_, i) => {
        const t0 = 22 + i * 6;
        const u = (f - t0) / 40;
        if (u < 0 || u > 1 || zoomOut < 0.9) return null;
        return <MzDbHeart key={i} x={1180 + rnd(91, i) * 440 + Math.sin(u * 8 + i) * 16} y={700 - u * 520} s={0.9 + rnd(92, i) * 0.8} o={1 - u} />;
      })}
      {/* 「へえ」の眉の上のきらり */}
      {surprised && f < 90 && (
        <g stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 60, 90)}>
          <line x1={700} y1={500} x2={672} y2={462} />
          <line x1={750} y1={478} x2={750} y2={434} />
          <line x1={800} y1={500} x2={828} y2={462} />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #92 1787年、アメリカの時計職人、レヴィ・ハッチンズが、世界初の目覚まし時計を作った。しかもそれは、朝4時にしか鳴らなかった。
// 格: 山 / seed 6092
// 絵: どこ: #91 のスマホの画面から**点線のふちの大きな吹き出し (うわさの雲)** がもくもく広がり、その中に18世紀アメリカの時計職人の工房 (木の壁・ろうそく・作業台・窓の外に雪)。演出: 雲の中で、ハッチンズ (実在の人物なので**顔を描かない**。三角帽子・ひざ丈の上着の背中) が、背の高い木の時計を組み立てている。時計の文字盤には数字が「4」の1つだけ大きく描かれている。雲のふちに王冠と「世界初」の小札がきらきら。時計の「4」の位置で針が止まると、ベルがジリリと鳴る。雲の全体が点線でちらちら揺れて (うわさ)、ところどころに小さな「?」が混ざる。年代札「1787年」。カメラはスマホの画面から雲の中へ入っていくように寄る。動き: f0-40 雲が広がる / f40-120 組み立て・王冠のきらきら / f130 「4」でジリリ
// どこ: #91 のスマホ (左下にあなたの手とスマホ) の画面から、点線のふちの大きなうわさの雲がもくもく広がり、その中に18世紀アメリカの時計職人の工房
//       (板壁・雪の降る窓・作業台・ろうそく・道具・木くず)
// 演出: 雲の中でハッチンズ (実在の人物なので背中だけ。三角帽子・ひざ丈の上着・束ねた髪) が、背の高い木の時計を組み立てる。
//       文字盤には「4」の数字ひとつだけ。雲のふちで王冠と「世界初」の札がきらきら。針が「4」に来たときだけベルがジリリ。
//       雲全体が点線でちらちら揺れ、あちこちに小さな「?」が浮いては消える (うわさ)。年代札「1787年」
// 動き: f0-24 雲が広がる / f10-40 組み立て (上の飾りがはまる)・王冠がきらきら / f20-38 針が「4」へ / f38 ジリリ / f80-260 針がもう1周して f260 にまた「4」でジリリ / カメラがゆっくり雲の中へ寄る
const Mz092: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeOut(seg(f, 0, 24));
  const push = easeInOut(seg(f, 20, 341));
  const camT = camLerp([960, 540, 1.0], [1000, 500, 1.1], push);
  const build = seg(f, 14, 30);
  const hand = f < 20 ? 30 : f < 38 ? lerp(30, 120, easeInOut(seg(f, 20, 38))) : f < 80 ? 120 : lerp(120, 480, seg(f, 80, 260));
  const ring = (f >= 38 && f < 74 ? 1 - seg(f, 60, 74) : 0) + (f >= 260 && f < 300 ? 1 - seg(f, 286, 300) : 0);
  const ph = [300, 730];
  const cl = { cx: 1040, cy: 440, rx: 740, ry: 340 };
  const floorY = 790;
  const work = Math.sin(f / 6);
  return (
    <Frame f={f} seed={6092} dark bg={C.roomNight}>
      <g transform={camT}>
        {/* 夜の部屋 (#91 のつづき。暗く) */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.roomNightDark} />
        <g stroke={C.roomNight} strokeWidth={6}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={-60} x2={i * 150} y2={1100} />)}
        </g>
        {/* 雲へつながる小さな泡 */}
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={lerp(ph[0] + 20, 460, k / 2)} cy={lerp(ph[1] - 80, 700, k / 2) - k * 30} r={(14 + k * 10) * seg(f, k * 3, k * 3 + 8)}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeDasharray="8 6" />
        ))}
        {/* うわさの雲 */}
        <g transform={`translate(${ph[0]} ${ph[1]}) scale(${grow}) translate(${-ph[0]} ${-ph[1]})`}>
          <defs><clipPath id="mzdb92cloud"><path d={cloudPath(cl.cx, cl.cy, cl.rx, cl.ry, f)} /></clipPath></defs>
          <path d={cloudPath(cl.cx, cl.cy, cl.rx + 16, cl.ry + 16, f)} fill={KRP.white} opacity={0.85} />
          <g clipPath="url(#mzdb92cloud)">
            {/* 板壁 */}
            <rect x={200} y={0} width={1700} height={900} fill={C.wall18} />
            <g stroke={C.wall18Dark} strokeWidth={4}>
              {Array.from({ length: 14 }, (_, i) => <line key={i} x1={260 + i * 120} y1={0} x2={260 + i * 120} y2={floorY} />)}
            </g>
            {/* 雪の窓 */}
            <rect x={1400} y={260} width={240} height={250} fill="#9FB8D8" stroke={KRP.ink} strokeWidth={6} />
            <path d="M 1400 470 Q 1460 440 1520 466 Q 1580 440 1640 462 L 1640 510 L 1400 510 Z" fill={KRP.white} />
            {Array.from({ length: 10 }, (_, i) => (
              <circle key={i} cx={1410 + rnd(921, i) * 220 + Math.sin(f / 15 + i) * 8} cy={270 + ((rnd(922, i) * 240 + f * (1 + rnd(923, i))) % 240)} r={4 + rnd(924, i) * 3} fill={KRP.white} />
            ))}
            <path d="M 1520 260 L 1520 510 M 1400 385 L 1640 385" stroke={MP.woodDark} strokeWidth={10} />
            <rect x={1388} y={506} width={264} height={18} fill={MP.wood} stroke={KRP.ink} strokeWidth={4} />
            {/* 床 (木くず) */}
            <rect x={200} y={floorY} width={1700} height={120} fill={MP.woodDark} />
            <line x1={200} y1={floorY} x2={1900} y2={floorY} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d={`M ${700 + i * 70} ${floorY + 10 + (i % 3) * 10} q 10 -8 20 0`} fill="none" stroke={MP.woodLight} strokeWidth={4} />
            ))}
            {/* 作業台 (左) と道具・ろうそく */}
            <rect x={300} y={560} width={420} height={30} fill={C.bench} stroke={KRP.ink} strokeWidth={5} />
            <rect x={320} y={590} width={24} height={200} fill={C.benchDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={676} y={590} width={24} height={200} fill={C.benchDark} stroke={KRP.ink} strokeWidth={4} />
            <MzDbGear x={420} y={548} r={22} rot={f} fill={MP.brass} sw={3} />
            <MzDbGear x={466} y={552} r={14} rot={-f * 1.5} fill={MP.brassDark} sw={2.5} />
            <rect x={530} y={540} width={110} height={16} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
            <rect x={600} y={490} width={22} height={70} fill="#F3E6C8" stroke={KRP.ink} strokeWidth={4} />
            <Flame x={611} y={490} s={1} f={f} phase={4} />
            {/* 主役: 背の高い木の時計 (数字は「4」だけ) */}
            <MzDbTallClock x={1110} y={floorY} s={0.86} f={f} hand={hand} ring={clamp01(ring)} build={build} />
            {/* ハッチンズ (背中だけ・顔は描かない) */}
            <MzDbBack x={880} y={floorY} s={1.12} f={f} armR={-100 + work * 10} armL={-40 - work * 6} lean={4} />
            {/* 金づちを打つたびの火花 */}
            {f < 40 && Math.floor(f / 6) % 2 === 0 && (
              <g stroke={MP.flame} strokeWidth={5} strokeLinecap="round">
                <line x1={1010} y1={520} x2={990} y2={500} />
                <line x1={1018} y1={510} x2={1018} y2={484} />
              </g>
            )}
          </g>
          {/* 点線のふち (ちらちら) */}
          <path d={cloudPath(cl.cx, cl.cy, cl.rx, cl.ry, f)} fill="none" stroke={KRP.ink} strokeWidth={7}
            strokeDasharray="22 14" strokeDashoffset={-f * 1.5} />
          {/* 王冠と「世界初」の札 (雲のふち) */}
          <MzDbCrown x={1460} y={150} s={1.25} f={f} rot={Math.sin(f / 10) * 5} />
          {[0, 1, 2, 3].map((k) => (
            <MzDbSpark key={k} x={1460 + Math.cos(f / 9 + k * 1.57) * 110} y={150 + Math.sin(f / 9 + k * 1.57) * 60} s={0.9}
              o={0.5 + 0.5 * Math.sin(f / 3 + k)} color={KRP.yellow} />
          ))}
          <TagPlate x={1460} y={230} text="世界初" size={40} t={seg(f, 12, 22)} fill={KRP.yellow} />
          <TagPlate x={560} y={230} text="1787年" size={42} t={seg(f, 8, 18)} />
          {/* うわさの「?」 */}
          {[[420, 380], [1720, 420], [760, 140], [1300, 720], [1820, 250]].map(([qx, qy], i) => {
            const v = 0.5 + 0.5 * Math.sin(f / 14 + i * 1.9);
            return <QMark key={i} x={qx} y={qy} s={0.42} f={f} t={v} color={KRP.gray} />;
          })}
        </g>
        {/* 手前: あなたの手とスマホ */}
        <g transform={`translate(${ph[0]} ${ph[1]})`}>
          <path d="M -260 380 L -110 140 L -40 170 L -170 400 Z" fill={MP.you} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-60} y={-90} width={120} height={200} rx={18} fill={C.phone} stroke={KRP.ink} strokeWidth={6} transform="rotate(14)" />
          <rect x={-48} y={-76} width={96} height={170} rx={10} fill={C.screen} transform="rotate(14)" />
          <circle cx={-46} cy={120} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-40} cy={-20} r={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #93 まず、世界初では、ありません。いま見たとおり、200年以上前から、あります。
// 格: 山 / seed 6093
// 絵: どこ: #92 のうわさの雲の続き (18世紀の工房)。演出: 雲の中の「世界初」の札と王冠に、画面の左から**ドスン**と大きな赤い「×」のはんこが押される。続いて、雲の左のふちを押し破って、#82 の鉄の壁掛け時計 (「15世紀」の札) と、#89 のドイツのゼンマイ時計 (「約470年前」の札) が、小さな足でとことこ歩いて入ってきて、ハッチンズの時計の横に並び、「先輩です」と胸を張る (時計に小さな顔は付けず、体を反らす動きだけで)。ハッチンズの背中が少しのけぞる。王冠がころころ転がって床に落ちる。年代札を古い順に左から「15世紀」「約470年前」「1787年」と並べる。カメラは「×」の寄りから引いて3台を並べる。動き: f0-20 はんこ / f20-90 2台が歩いて入る / f90 胸を張る / 王冠が転がる
// どこ: #92 のうわさの雲のつづき (18世紀の工房・板壁・雪の窓・作業台)
// 演出: 雲のふちの王冠と「世界初」の札に、左から大きな赤い「×」のはんこがドスン。王冠が落ちて床をころころ転がる。
//       雲の左のふちが破れて、15世紀の鉄の壁掛け時計と、約470年前のドイツのゼンマイ時計が小さな足でとことこ入ってきて、
//       ハッチンズの時計の左に並び、体を反らして胸を張る (顔は付けない)。ハッチンズの背中がのけぞる。
//       足元の年代札は古い順に左から「15世紀」「約470年前」「1787年」
// 動き: f0-8 はんこ / f8-40 王冠が落ちて転がる / f6-32 2台が歩いて入る / f32-38 胸を張る / f8-36 「×」の寄りから引いて3台を並べる / 以後、ときどき胸を張り直す
const Mz093: React.FC<{ f: number }> = ({ f }) => {
  const stamp = seg(f, 0, 6);
  const pull = easeInOut(seg(f, 8, 36));
  const camT = camLerp([1420, 260, 1.55], [1000, 515, 1.0], pull);
  const shake = f >= 5 && f < 12 ? Math.sin(f * 3) * 8 * (1 - seg(f, 5, 12)) : 0;
  const cl = { cx: 1040, cy: 440, rx: 760, ry: 350 };
  const floorY = 690;
  // 王冠: 落ちて (f8-20) はねて転がる (f20-44)
  const fall = seg(f, 8, 20);
  const roll = seg(f, 20, 44);
  const crownX = f < 20 ? 1460 - fall * 40 : 1420 - easeOut(roll) * 110;
  const crownY = f < 20 ? lerp(150, floorY - 30, fall * fall) : floorY - 30 - Math.abs(Math.sin(roll * Math.PI * 2)) * 50 * (1 - roll);
  const crownRot = f < 20 ? fall * 60 : 60 - roll * 400;
  // 歩いて入ってくる 2台
  const walk = easeInOut(seg(f, 6, 32));
  const ironX = lerp(150, 520, walk);
  const drumX = lerp(-60, 820, walk);
  const walking = f >= 6 && f < 32;
  const proud = seg(f, 32, 38) * (1 - 0.6 * seg(f, 60, 70)) + (f > 100 ? 0.6 * Math.max(0, Math.sin((f - 100) / 10)) : 0);
  const bobI = walking ? Math.abs(Math.sin(f / 2.2)) * -10 : 0;
  const bobD = walking ? Math.abs(Math.sin(f / 2.2 + 1)) * -10 : 0;
  const tear = seg(f, 6, 14);
  const hutLean = 8 * easeOut(seg(f, 30, 38));
  const PLATE_Y = 730;
  return (
    <Frame f={f} seed={6093} dark bg={C.roomNightDark}>
      <g transform={`translate(${shake} 0) ${camT}`}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.roomNightDark} />
        <defs><clipPath id="mzdb93cloud"><path d={cloudPath(cl.cx, cl.cy, cl.rx, cl.ry, f)} /></clipPath></defs>
        <path d={cloudPath(cl.cx, cl.cy, cl.rx + 16, cl.ry + 16, f)} fill={KRP.white} opacity={0.85} />
        <g clipPath="url(#mzdb93cloud)">
          <rect x={200} y={0} width={1800} height={900} fill={C.wall18} />
          <g stroke={C.wall18Dark} strokeWidth={4}>
            {Array.from({ length: 14 }, (_, i) => <line key={i} x1={260 + i * 120} y1={0} x2={260 + i * 120} y2={floorY} />)}
          </g>
          <rect x={1600} y={260} width={200} height={230} fill="#9FB8D8" stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={1610 + rnd(931, i) * 180} cy={270 + ((rnd(932, i) * 210 + f * 1.4) % 210)} r={4} fill={KRP.white} />
          ))}
          <path d="M 1700 260 L 1700 490 M 1600 375 L 1800 375" stroke={MP.woodDark} strokeWidth={10} />
          <rect x={200} y={floorY} width={1800} height={120} fill={MP.woodDark} />
          <line x1={200} y1={floorY} x2={2000} y2={floorY} stroke={KRP.ink} strokeWidth={5} />
          {/* ハッチンズの時計とハッチンズ (背中) */}
          <MzDbTallClock x={1180} y={floorY} s={0.86} f={f} hand={120} />
          <MzDbBack x={1440} y={floorY} s={1.08} f={f} lean={hutLean} armL={-30 - hutLean * 4} armR={-20 - hutLean * 3} />
          {hutLean > 4 && (
            <path d={`M 1520 ${480 + seg(f, 38, 70) * 30} q -10 16 0 22 q 10 -6 0 -22 Z`} fill="#9CCAE8" stroke={KRP.ink} strokeWidth={3} />
          )}
          {/* 先輩の2台 (歩いてくる → 胸を張る) */}
          <g transform={`translate(0 ${bobI}) rotate(${-10 * proud} ${ironX} ${floorY - 20})`}>
            <MzDbIronClock x={ironX} y={floorY - 34} s={0.88} f={f} />
          </g>
          <MzDbFeet x={ironX} y={floorY} s={1.1} ph={f / 2.2} walking={walking} />
          <g transform={`translate(0 ${bobD}) rotate(${-10 * proud} ${drumX} ${floorY - 20})`}>
            <MzDbDrumClock x={drumX} y={floorY - 34} s={1.0} f={f} />
          </g>
          <MzDbFeet x={drumX} y={floorY} s={1.1} ph={f / 2.2 + 1} walking={walking} />
          {/* 胸を張る「えっへん」のきらきら */}
          {proud > 0.3 && [ironX, drumX].map((cx, i) => (
            <g key={i} opacity={proud}>
              <MzDbSpark x={cx - 90} y={floorY - 300 + i * 60} s={1} color={KRP.yellow} />
              <MzDbSpark x={cx + 90} y={floorY - 330 + i * 60} s={0.8} color={KRP.yellow} />
            </g>
          ))}
        </g>
        {/* 雲の点線のふち。左のふちは破れて、ちぎれた切れはしが舞う */}
        <path d={cloudPath(cl.cx, cl.cy, cl.rx, cl.ry, f)} fill="none" stroke={KRP.ink} strokeWidth={7}
          strokeDasharray="22 14" strokeDashoffset={-f * 1.5} />
        {tear > 0 && (
          <g>
            <path d="M 300 470 L 330 520 L 296 570 L 336 620 L 300 670" fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" opacity={tear} />
            <path d="M 260 500 L 300 520 M 262 600 L 300 590" stroke={KRP.ink} strokeWidth={4} opacity={tear} />
            {[0, 1, 2, 3].map((k) => {
              const u = seg(f, 8 + k * 2, 40 + k * 2);
              return <path key={k} d="M 0 0 q 14 -10 28 0 q -6 14 -28 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3}
                transform={`translate(${280 - u * (80 + k * 30)} ${480 + k * 50 - u * 120}) rotate(${u * 200 + k * 40})`} opacity={1 - u} />;
            })}
          </g>
        )}
        {/* 床を転がる王冠 */}
        {f >= 8 && <MzDbCrown x={crownX} y={crownY} s={1.0} rot={crownRot} f={f} />}
        {/* 「世界初」の札と、×のはんこ */}
        <TagPlate x={1460} y={258} text="世界初" size={40} t={1} fill={KRP.yellow} rot={stamp > 0.5 ? -8 : 0} />
        {f < 8 && <MzDbCrown x={1460} y={150} s={1.25} f={f} />}
        {stamp > 0 && (
          <g transform={`translate(1460 220) scale(${lerp(2.2, 1, easeOut(stamp))}) rotate(-8)`} opacity={stamp}>
            <circle r={130} fill="none" stroke={KRP.red} strokeWidth={12} opacity={0.85} />
            <XMark x={0} y={0} s={2.1} t={1} />
          </g>
        )}
        {f >= 4 && f < 14 && (
          <g stroke={KRP.red} strokeWidth={8} strokeLinecap="round" opacity={1 - seg(f, 4, 14)}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={1460 + Math.cos(a) * 150} y1={220 + Math.sin(a) * 150} x2={1460 + Math.cos(a) * 200} y2={220 + Math.sin(a) * 200} />;
            })}
          </g>
        )}
        {/* 年代札 (古い順に左から・同じ高さ) */}
        <TagPlate x={520} y={PLATE_Y} text="15世紀" size={34} t={seg(f, 26, 34)} />
        <TagPlate x={820} y={PLATE_Y} text="約470年前" size={34} t={seg(f, 28, 36)} />
        <TagPlate x={1180} y={PLATE_Y} text="1787年" size={34} t={seg(f, 30, 38)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #94 アメリカで最初の1台、とは、言われています。
// 格: 並 / seed 6094
// 絵: どこ: 18世紀の古い手描きの北アメリカの地図 (茶色く焼けた紙・羽ペンの線・コンパスの飾り) を、工房の壁に貼ったもの。演出: 主役は地図。ハッチンズの手元だけ (顔は描かない) が、小さな時計の形のピンを地図の東の海岸のあたりにそっと刺す。刺した場所から、小さな光が広がり、そのピンに「アメリカ初?」の小札がぶら下がる (B判定なので「?」と点線の丸)。地図のヨーロッパ側の端には、#93 の2台の先輩時計が小さく描かれて、こっちを見ている。カメラは地図の全体からピンへ寄る。動き: f0-40 手がピンを刺す / f40-80 光が広がる / f80-120 寄り・札が揺れる
// どこ: 18世紀の工房の板壁に、四隅を鋲で留めた古い手描きの地図 (茶色く焼けた紙・羽ペンの線)。北アメリカ (アラスカ・ハドソン湾・五大湖・
//       フロリダ半島・メキシコ湾・カリフォルニア半島) と、右の端に大西洋の向こうのヨーロッパ (イギリスの島・イベリア半島)。コンパスの飾り・帆船
// 演出: ハッチンズの手元だけ (レースの袖口。顔は描かない) が、小さな時計の形のピンを東の海岸 (ニューイングランドのあたり) にそっと刺す。
//       刺した所から光の輪が広がり、ピンに「アメリカ初?」の小札がぶら下がる (点線の丸で囲む = 言われているだけ)。
//       ヨーロッパの端では、#93 の先輩の2台が小さく描かれて、体をこちらへ傾けてのぞきこむ
// 動き: f0-16 手がピンを運ぶ / f16-20 刺す / f20-40 光が広がる・札がぶら下がる / f20-60 ピンへ寄る / 以後、札がゆらゆら・先輩がのぞきこむ
const NA_PTS: [number, number][] = [
  [0, 170], [60, 120], [140, 100], [240, 110], [330, 90], [420, 110], [470, 160], [520, 150], [560, 200], [575, 270], [640, 268],
  [660, 210], [650, 150], [700, 110], [760, 170], [800, 230], [830, 290], [780, 318], [805, 352], [745, 372], [722, 410], [700, 440],
  [692, 482], [662, 540], [632, 580], [646, 640], [622, 652], [600, 592], [560, 582], [500, 592], [452, 610], [432, 660], [452, 704],
  [488, 700], [506, 676], [500, 724], [440, 760], [404, 772], [362, 722], [300, 642], [262, 584], [282, 640], [232, 560], [202, 480],
  [182, 400], [172, 330], [122, 262], [62, 232], [20, 222],
];
const Mz094: React.FC<{ f: number }> = ({ f }) => {
  const ox = 250, oy = 130, K = 0.86;
  const naD = NA_PTS.map(([x, y], i) => `${i ? "L" : "M"} ${ox + x * K} ${oy + y * K}`).join(" ") + " Z";
  const pin: [number, number] = [ox + 726 * K, oy + 404 * K];
  const carry = easeInOut(seg(f, 0, 16));
  const push = seg(f, 16, 20);
  const retract = easeInOut(seg(f, 22, 38));
  const handX = f < 20 ? lerp(1500, pin[0] + 30, carry) : lerp(pin[0] + 30, 1560, retract);
  const handY = f < 20 ? lerp(980, pin[1] + 40 - push * 8, carry) : lerp(pin[1] + 32, 1000, retract);
  const stuck = f >= 18;
  const glow = seg(f, 20, 44);
  const tag = seg(f, 24, 34);
  const zoom = easeInOut(seg(f, 20, 60));
  const camT = camLerp([960, 470, 1.0], [pin[0] + 60, 520, 1.16], zoom);
  const sway = Math.sin(f / 9) * 7 * tag;
  const peek = seg(f, 30, 42);
  const ink = C.sepia;
  return (
    <Frame f={f} seed={6094} bg={C.wall18}>
      <g transform={camT}>
        {/* 工房の板壁 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.wall18} />
        <g stroke={C.wall18Dark} strokeWidth={5}>
          {Array.from({ length: 18 }, (_, i) => <line key={i} x1={i * 120} y1={-60} x2={i * 120} y2={1140} />)}
        </g>
        {/* 地図の紙 (焼けたふち) */}
        <g transform="rotate(-1.2 960 470)">
          <rect x={160} y={40} width={1600} height={820} fill={C.parch} stroke={C.parchEdge} strokeWidth={10} />
          <rect x={160} y={40} width={1600} height={820} fill="none" stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx={200 + rnd(941, i) * 1520} cy={80 + rnd(942, i) * 740} r={50 + rnd(943, i) * 70} fill={C.parchDark} opacity={0.22} />
          ))}
          <rect x={186} y={66} width={1548} height={768} fill="none" stroke={ink} strokeWidth={3} strokeDasharray="2 0" />
          {/* 経緯線 */}
          <g stroke={ink} strokeWidth={2} opacity={0.3}>
            {[220, 400, 580, 760].map((ly) => <line key={ly} x1={186} y1={ly} x2={1734} y2={ly} />)}
            {[420, 720, 1020, 1320, 1620].map((lx) => <line key={lx} x1={lx} y1={66} x2={lx} y2={834} />)}
          </g>
          {/* 海の羽ペンのさざなみ */}
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M ${1080 + (i % 3) * 140} ${200 + i * 60} q 12 -10 24 0 q 12 10 24 0`} fill="none" stroke={ink} strokeWidth={2.5} opacity={0.5} />
          ))}
          {/* 北アメリカ */}
          <path d={naD} fill="#D9C08A" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={naD} fill="none" stroke={ink} strokeWidth={14} opacity={0.12} strokeLinejoin="round" />
          {/* 五大湖 */}
          {[[ox + 560 * K, oy + 392 * K, 22, 10], [ox + 600 * K, oy + 408 * K, 19, 9], [ox + 640 * K, oy + 400 * K, 16, 8], [ox + 580 * K, oy + 420 * K, 12, 15]].map(([lx, ly, rx, ry], i) => (
            <ellipse key={i} cx={lx} cy={ly} rx={rx} ry={ry} fill={C.sea} stroke={ink} strokeWidth={3} />
          ))}
          {/* 山脈の羽ペン記号 */}
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M ${ox + (250 + i * 18) * K} ${oy + (300 + i * 34) * K} l 12 -20 l 12 20`} fill="none" stroke={ink} strokeWidth={3} />
          ))}
          {/* ヨーロッパの端 (イギリスの島とイベリア半島) */}
          <path d="M 1560 250 L 1600 220 L 1630 260 L 1612 330 L 1640 370 L 1590 380 L 1572 330 Z" fill="#D9C08A" stroke={ink} strokeWidth={4} />
          <path d="M 1534 300 L 1556 290 L 1560 330 L 1536 330 Z" fill="#D9C08A" stroke={ink} strokeWidth={4} />
          <path d="M 1734 330 L 1670 360 L 1690 420 L 1640 440 L 1620 500 L 1640 580 L 1720 600 L 1734 600 Z" fill="#D9C08A" stroke={ink} strokeWidth={4} />
          {/* 帆船 */}
          <g transform={`translate(${1260 + Math.sin(f / 30) * 10} ${520 + Math.sin(f / 12) * 4})`}>
            <path d="M -50 0 L 50 0 L 36 22 L -36 22 Z" fill={MP.woodDark} stroke={ink} strokeWidth={3} />
            <line x1={0} y1={0} x2={0} y2={-70} stroke={ink} strokeWidth={3} />
            <path d="M 4 -64 Q 40 -40 4 -12 Z" fill={KRP.white} stroke={ink} strokeWidth={3} />
            <path d="M -4 -60 Q -34 -36 -4 -14 Z" fill={KRP.white} stroke={ink} strokeWidth={3} />
          </g>
          {/* コンパスの飾り (太平洋) */}
          <g transform={`translate(360 700) rotate(${Math.sin(f / 40) * 3})`}>
            <circle r={70} fill="none" stroke={ink} strokeWidth={4} />
            <circle r={54} fill="none" stroke={ink} strokeWidth={2} />
            <path d="M 0 -90 L 14 0 L 0 90 L -14 0 Z" fill={KRP.red} stroke={ink} strokeWidth={3} opacity={0.8} />
            <path d="M -90 0 L 0 14 L 90 0 L 0 -14 Z" fill={C.parchDark} stroke={ink} strokeWidth={3} />
            <text x={0} y={-100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={ink}>N</text>
          </g>
          {/* ヨーロッパの先輩の2台 (小さく・こちらへ傾いてのぞく) */}
          <g transform={`rotate(${-14 * peek} 1650 700)`}>
            <MzDbIronClock x={1620} y={700} s={0.36} f={f} />
          </g>
          <g transform={`rotate(${-18 * peek} 1700 700)`}>
            <MzDbDrumClock x={1700} y={700} s={0.4} f={f} />
          </g>
          {peek > 0.5 && (
            <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.8}>
              <path d="M 1560 560 l -20 -10 M 1570 540 l -18 -18" />
            </g>
          )}
          {/* 地図を留める鋲 */}
          {[[180, 60], [1740, 60], [180, 840], [1740, 840]].map(([tx, ty], i) => (
            <circle key={i} cx={tx} cy={ty} r={14} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          ))}
        </g>
        {/* 刺した所から広がる光の輪 */}
        {glow > 0 && glow < 1 && [0, 1].map((k) => {
          const u = clamp01(glow * 1.4 - k * 0.3);
          return <circle key={k} cx={pin[0]} cy={pin[1]} r={20 + u * 140} fill="none" stroke={KRP.yellow} strokeWidth={8 - u * 5} opacity={1 - u} />;
        })}
        {stuck && <circle cx={pin[0]} cy={pin[1]} r={40} fill={MP.glow} opacity={0.35 + 0.1 * Math.sin(f / 4)} />}
        {/* 「アメリカ初?」の小札 (点線の丸で囲む) */}
        {tag > 0 && (
          <g transform={`rotate(${sway} ${pin[0]} ${pin[1]})`}>
            <line x1={pin[0]} y1={pin[1]} x2={pin[0]} y2={pin[1] + 100} stroke={KRP.ink} strokeWidth={3} />
            <ellipse cx={pin[0]} cy={pin[1] + 146} rx={170 * pop(tag)} ry={60 * pop(tag)} fill="none" stroke={KRP.red} strokeWidth={5} strokeDasharray="14 10" />
            <TagPlate x={pin[0]} y={pin[1] + 146} text="アメリカ初?" size={32} t={tag} />
          </g>
        )}
        {/* 時計の形のピン */}
        {stuck && (
          <g transform={`translate(${pin[0]} ${pin[1]})`}>
            <circle r={22} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
            <circle r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
            <line x1={0} y1={0} x2={7} y2={5} stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" />
            <path d="M -14 -18 Q -12 -30 0 -30 Q 12 -30 14 -18 Z" fill={MP.brassDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        )}
        {/* ハッチンズの手元 (レースの袖口・紫の上着の袖。顔は描かない) */}
        <g transform={`translate(${handX} ${handY})`}>
          <path d="M 40 30 L 300 320 L 400 240 L 110 -20 Z" fill="#5A4A6E" stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 30 10 Q 70 -40 120 0 Q 96 30 80 60 Q 50 40 30 10 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={14} cy={-6} rx={36} ry={28} fill="#ECE2CC" stroke={KRP.ink} strokeWidth={5} />
          <path d="M -10 -24 Q -26 -34 -30 -22" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          {!stuck && (
            <g transform="translate(-30 -40)">
              <line x1={0} y1={0} x2={0} y2={30} stroke={KRP.silver} strokeWidth={4} />
              <circle r={22} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
              <circle r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          )}
        </g>
      </g>
      <TagPlate x={1640} y={124} text="1787年" size={40} t={seg(f, 2, 12)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #95 そして、ハッチンズ本人の自伝を読むと、目覚まし時計の話が、1行も出てきません。
// 格: 山 / seed 6095
// 絵: どこ: 図書館の閲覧机 (古い木の机・緑のランプ・積まれた古書)。演出: 主役は分厚い古い自伝の本 (表紙に名前は書かない、革の装丁)。調べ係 (一般の現代の人・男性・眼鏡・紺のセーター) が、虫めがねを片手にページをばらばらばらと高速でめくる (腕は2本、pose で左手でページ、右手に虫めがね)。ページの上に「時計」「ベル」の小さなアイコンを探すレーダーの輪が走るが、どのページでも何も光らない。最後のページまでめくり終えると、空っぽの吹き出しに大きな「0行」の札、調べ係はぽかんと口を開ける (face="surprised")。カメラは本に寄って、最後に調べ係の顔へ。動き: f0-100 ページがめくれる / レーダーの輪 / f100 最後のページ / f110 「0行」
// どこ: 図書館の閲覧机。うしろは古書がぎっしりの本棚、机の上に緑のかさのランプ・積まれた古書・インク壺・しおりの束
// 演出: 主役は分厚い革装丁の古い自伝 (表紙に名前は書かない)。調べ係 (現代の男性・眼鏡・紺のセーター) が左手でページをばらばらばらと高速でめくり、
//       右手の虫めがねから「時計」「ベル」のアイコンを探すレーダーの輪がページの上を走る。どのページでも何も光らない (アイコンは灰色のまま)。
//       最後のページまでめくり終えると、本から空っぽの吹き出しがぽんと出て、大きな「0行」の札。調べ係はぽかんと口を開ける
// 動き: f0-34 ページがめくれる・レーダーの輪 / f34 最後のページ / f36 「0行」 / f0-42 本の寄りから調べ係の顔へ引く / f60〜 もう一度めくり直して、やっぱり0行 (札が跳ねる)
const MzDbBookPage: React.FC<{ x0: number; y0: number; w: number; h: number; side: -1 | 1; lines?: boolean; fill?: string }> = ({ x0, y0, w, h, side, lines = true, fill = C.pageEdge }) => (
  <g>
    <path d={`M ${x0} ${y0} Q ${x0 + side * w * 0.5} ${y0 - 22} ${x0 + side * w} ${y0 - 6} L ${x0 + side * w} ${y0 + h} Q ${x0 + side * w * 0.5} ${y0 + h - 16} ${x0} ${y0 + h} Z`}
      fill={fill} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
    {lines && Array.from({ length: 7 }, (_, i) => (
      <line key={i} x1={x0 + side * 34} y1={y0 + 26 + i * 22} x2={x0 + side * (w - 30 - (i === 6 ? 80 : 0))} y2={y0 + 24 + i * 22} stroke={KRP.gray} strokeWidth={7} strokeLinecap="round" />
    ))}
  </g>
);
const Mz095: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeInOut(seg(f, 0, 42));
  const camT = camLerp([960, 610, 1.45], [990, 480, 1.1], pull);
  const spine = 960, top = 530, pw = 300, ph = 150;
  const flipping = (f < 34) || (f >= 70 && f < 100);
  const flipT = f < 34 ? f : f - 70;
  const flipU = flipping ? (flipT % 4) / 4 : 0;
  const pageW = Math.cos(flipU * Math.PI) * pw; // 右から左へ
  const done = (f >= 34 && f < 70) || f >= 100;
  const zero = f < 70 ? seg(f, 34, 40) : seg(f, 100, 106);
  const radar = flipping ? ((f % 10) / 10) : 0;
  const face = f >= 35 && f < 70 ? "surprised" : f >= 100 ? "surprised" : "worried";
  const px = 990, py = 700, ps = 1.22;
  const magX = 1080 + Math.sin(f / 3) * (flipping ? 40 : 6);
  const magY = 600 + Math.cos(f / 4) * (flipping ? 18 : 4);
  return (
    <Frame f={f} seed={6095} bg={C.libWall}>
      <g transform={camT}>
        {/* 本棚の壁 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.libWallDark} />
        {[60, 280, 500].map((sy, r) => (
          <g key={sy}>
            {Array.from({ length: 30 }, (_, i) => {
              const bw = 34 + rnd(950 + r, i) * 30;
              const bh = 150 + rnd(960 + r, i) * 40;
              const bx = -40 + i * 68;
              const cols = [KRP.red, C.lampGreen, KRP.blueDeep, MP.wood, C.wine, "#7A6A3A"];
              return <rect key={i} x={bx} y={sy + 200 - bh} width={bw} height={bh} fill={cols[(i + r) % cols.length]} stroke={KRP.ink} strokeWidth={3} opacity={0.85} />;
            })}
            <rect x={-60} y={sy + 200} width={2040} height={20} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 調べ係 (机の向こう) */}
        <Person x={px} y={py} s={ps} f={f} pose="hold" cloth={C.navy} clothDark={C.navyDark} glasses face={face} gaze={f < 34 ? [4, 10] : [0, 0]} />
        {/* 机 */}
        <rect x={-60} y={690} width={2040} height={40} fill={MP.wood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={730} width={2040} height={500} fill={MP.woodDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke="#5A3A20" strokeWidth={4} opacity={0.5}>
          {[790, 860, 930].map((ly) => <line key={ly} x1={-60} y1={ly} x2={1980} y2={ly} />)}
        </g>
        {/* 緑のランプ */}
        <g transform="translate(0 90)">
          <ellipse cx={518} cy={560} rx={190} ry={60} fill={MP.glow} opacity={0.22 + 0.03 * Math.sin(f / 6)} />
          <rect x={508} y={470} width={20} height={130} fill={MP.brass} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={518} cy={600} rx={60} ry={12} fill={MP.brassDark} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 420 470 Q 420 420 518 416 Q 616 420 616 470 Z" fill={C.lampGreen} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 440 450 Q 470 430 520 428" fill="none" stroke="#7FBF8A" strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* 積まれた古書・インク壺 */}
        <g transform="translate(0 90)">
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={1380 + (k % 2) * 10} y={560 - k * 40} width={220} height={40} rx={4} fill={[C.leather, "#5A4A3A", C.wine, "#3E5A4A"][k]} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <path d="M 1660 600 L 1650 560 L 1700 560 L 1690 600 Z" fill="#2E2A40" stroke={KRP.ink} strokeWidth={4} />
        <line x1={1676} y1={562} x2={1720} y2={470} stroke={KRP.white} strokeWidth={5} />
        <path d="M 1720 470 Q 1760 480 1740 520 Q 1724 500 1716 476 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 主役: 革装丁の分厚い自伝 */}
        <path d={`M ${spine - pw - 30} ${top + ph + 10} L ${spine + pw + 30} ${top + ph + 10} L ${spine + pw + 40} ${top + ph + 50} L ${spine - pw - 40} ${top + ph + 50} Z`}
          fill={C.leather} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 4 }, (_, i) => (
          <line key={i} x1={spine - pw - 20} y1={top + ph + 14 + i * 8} x2={spine + pw + 20} y2={top + ph + 14 + i * 8} stroke={C.pageEdge} strokeWidth={4} />
        ))}
        <MzDbBookPage x0={spine} y0={top} w={pw} h={ph} side={-1} lines={!done || f >= 34} />
        <MzDbBookPage x0={spine} y0={top} w={pw} h={ph} side={1} lines={!done} fill={done ? C.leather : C.pageEdge} />
        {done && (
          <g>
            <rect x={spine + 60} y={top + 40} width={180} height={100} fill="none" stroke={MP.brass} strokeWidth={4} strokeDasharray="6 6" />
          </g>
        )}
        {/* めくれているページ */}
        {flipping && (
          <path d={`M ${spine} ${top} Q ${spine + pageW * 0.5} ${top - 40 - Math.sin(flipU * Math.PI) * 40} ${spine + pageW} ${top - 10 - Math.sin(flipU * Math.PI) * 30} L ${spine + pageW} ${top + ph - Math.sin(flipU * Math.PI) * 30} Q ${spine + pageW * 0.5} ${top + ph - 10} ${spine} ${top + ph} Z`}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
        )}
        {flipping && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${spine + 120 + k * 50} ${top - 70 - k * 10} q 20 -14 40 0`} fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round"
            opacity={(Math.floor(f / 2) + k) % 2 ? 0.9 : 0.3} />
        ))}
        {/* 虫めがねのレーダー */}
        {flipping && (
          <g>
            <circle cx={magX} cy={magY} r={30 + radar * 150} fill="none" stroke={C.lampGreen} strokeWidth={6} opacity={1 - radar} />
            <circle cx={magX} cy={magY} r={10 + ((radar + 0.5) % 1) * 150} fill="none" stroke={C.lampGreen} strokeWidth={4} opacity={1 - ((radar + 0.5) % 1)} />
          </g>
        )}
        {/* さがしもののアイコン (時計・ベル)。メモ用紙に並べる。光らない灰色のまま */}
        <rect x={570} y={282} width={100} height={190} rx={8} fill={C.parch} stroke={KRP.ink} strokeWidth={4} transform="rotate(-4 620 377)" />
        <circle cx={620} cy={290} r={9} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        <g transform="translate(620 330)" opacity={f < 40 || (f >= 70 && f < 106) ? 1 : 0.5}>
          <circle r={34} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          <circle r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 0 -14 L 0 0 L 10 6" stroke={KRP.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(620 420)" opacity={f < 40 || (f >= 70 && f < 106) ? 1 : 0.5}>
          <circle r={34} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -16 12 Q -18 -18 0 -20 Q 18 -18 16 12 L 22 18 L -22 18 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 虫めがね (右手) */}
        <line x1={px + 20} y1={py - 144} x2={magX + 50} y2={magY + 50} stroke={MP.woodDark} strokeWidth={14} strokeLinecap="round" />
        <circle cx={magX} cy={magY} r={58} fill={C.glass} opacity={0.5} />
        <circle cx={magX} cy={magY} r={58} fill="none" stroke={MP.brass} strokeWidth={10} />
        <circle cx={magX} cy={magY} r={58} fill="none" stroke={KRP.ink} strokeWidth={3} />
        <path d={`M ${magX - 30} ${magY - 24} Q ${magX - 20} ${magY - 40} ${magX} ${magY - 42}`} fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" />
        {/* 空っぽの吹き出しと「0行」 */}
        {zero > 0 && (
          <g transform={`translate(1330 300) scale(${pop(zero)})`}>
            <path d="M -200 -110 Q -210 -130 -180 -130 L 180 -130 Q 210 -130 200 -100 L 200 90 Q 200 120 170 120 L -60 120 L -150 190 L -110 120 L -170 120 Q -200 120 -200 90 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          </g>
        )}
        <TagPlate x={1330} y={300} text="0行" size={84} color={KRP.red} t={zero} rot={Math.sin(f / 7) * 3} />
        {/* ぽかんの汗 */}
        {zero > 0.5 && (
          <path d={`M ${px + 92} ${py - 330 + seg(f, 40, 70) * 24} q -10 16 0 22 q 10 -6 0 -22 Z`} fill="#9CCAE8" stroke={KRP.ink} strokeWidth={3} />
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #96 4時にしか鳴らない時計は、後の時代の、言い伝えです。
// 格: 山 / seed 6096
// 絵: どこ: 夜の古い町の広場の、語り部の焚き火のまわり (19世紀ふうの町の人たちが丸太に座る。男女を混ぜる: 男は帽子とベスト、女はボンネット帽とくるぶしまでのスカート)。演出: 語り部のおじいさん (白いひげ・顔あり・一般の人) が、両手を広げて大げさに話す (腕は2本)。焚き火の煙の中に、「4」だけの時計の絵が浮かぶ。ところが、時計の「4」の数字は**紙のシール**で、夜風が吹くと端からぺろっとめくれて、ひらひら飛んでいき、下からは何も書いていないのっぺらぼうの文字盤が出てくる。聞いていた人たちが目を丸くして、子どもが飛んでいくシールを追いかける。カメラは焚き火の輪から時計の絵へ寄る。動き: f0-50 語る / f50-90 シールがめくれる / f90-140 飛んでいく・子どもが追う
// どこ: 夜の古い町の広場 (19世紀ふう)。石畳・切妻屋根の家並みと灯った窓・教会の塔・ガス灯・星と月。真ん中に語り部の焚き火、まわりに丸太の腰かけ
// 演出: 語り部のおじいさん (白いひげ・白髪) が両手を広げて大げさに話す。焚き火の煙の中に「4」だけの時計の絵が浮かぶ。
//       ところが「4」は紙のシールで、夜風が吹くと端からぺろっとめくれて、ひらひら飛んでいき、下からはのっぺらぼうの文字盤。
//       丸太の町の人たち (男=帽子とベスト / 女=ボンネット帽とくるぶしまでのスカート) が目を丸くし、子どもが飛んでいくシールを追いかける
// 動き: f0-12 語る / f10-40 夜風の線 / f12-26 シールがめくれる / f26〜 ひらひら飛ぶ / f30〜 子どもが追う / f0-30 焚き火の輪から時計の絵へ寄る / 以後、語り部が「あれっ」と頭をかく
const MzDbSitter: React.FC<{ x: number; y: number; s?: number; f: number; female: boolean; face: "normal" | "surprised" | "smile"; phase: number; gaze?: [number, number] }> = ({
  x, y, s = 1, f, female, face, phase, gaze = [0, 0],
}) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={phase} pose="sit" hair={female ? "none" : "cap"} face={face} gaze={gaze}
        cloth={female ? C.wine : C.vest} clothDark={female ? C.wineDark : C.vestDark} />
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        {female ? (
          <g>
            <path d="M -58 -74 L 58 -74 L 96 6 Q 10 16 -76 6 Z" fill={C.wine} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -20 -70 L -30 4 M 24 -70 L 40 4" stroke={C.wineDark} strokeWidth={4} />
            <MzDbHair kind="long" />
            <MzDbBonnet color="#F3E6C8" />
          </g>
        ) : (
          <g>
            <path d="M -48 -160 L -20 -160 L -6 -60 L -48 -60 Z M 48 -160 L 20 -160 L 6 -60 L 48 -60 Z" fill={C.vestDark} stroke={KRP.ink} strokeWidth={4} />
            <MzDbManHat color="#3E3A44" />
          </g>
        )}
      </g>
    </g>
  );
};
const Mz096: React.FC<{ f: number }> = ({ f }) => {
  const push = easeInOut(seg(f, 0, 30));
  const camT = camLerp([960, 540, 1.0], [960, 470, 1.12], push);
  const peel = easeOut(seg(f, 12, 26));
  const fly = seg(f, 26, 134);
  const wind = seg(f, 8, 40);
  const shocked = f >= 24;
  const clk: [number, number] = [960, 330];
  const R = 150;
  const a4 = (120 * Math.PI) / 180;
  const sx0 = clk[0] + Math.sin(a4) * R * 0.66, sy0 = clk[1] - Math.cos(a4) * R * 0.66;
  // シールの飛ぶ道 (右上へひらひら)
  const stX = f < 26 ? sx0 : sx0 + fly * 820 + Math.sin(fly * 14) * 40;
  const stY = f < 26 ? sy0 : sy0 - Math.sin(fly * Math.PI * 0.8) * 160 + fly * 120 + Math.cos(fly * 11) * 20;
  const stR = f < 26 ? -peel * 30 : -30 + Math.sin(f / 4) * 50 + fly * 300;
  const kidX = f < 30 ? 1700 : lerp(1700, 1850, easeInOut(seg(f, 30, 134)));
  const fireY = 760;
  const smoke = Array.from({ length: 9 }, (_, i) => {
    const u = ((f * 0.6 + i * 18) % 160) / 160;
    return <circle key={i} cx={960 + Math.sin(u * 6 + i) * 60 - u * 40 * wind} cy={fireY - 60 - u * 620} r={40 + u * 90} fill={C.smoke} opacity={0.35 * (1 - u)} />;
  });
  return (
    <Frame f={f} seed={6096} dark bg={C.plazaNight}>
      <g transform={camT}>
        {/* 夜空 */}
        <rect x={-60} y={-60} width={2040} height={700} fill={C.plazaNight} />
        {[[120, 90], [380, 160], [700, 70], [1240, 110], [1500, 60], [1780, 150], [1640, 260], [260, 280]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 9 + i * 1.7)} />
        ))}
        <circle cx={1660} cy={150} r={46} fill="#FFF3C8" />
        <circle cx={1680} cy={138} r={42} fill={C.plazaNight} />
        {/* 家並みと教会の塔 */}
        <path d="M -60 640 L -60 380 L 60 300 L 180 380 L 180 330 L 300 250 L 420 330 L 420 640 Z" fill="#3A3550" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1500 640 L 1500 360 L 1620 280 L 1740 360 L 1740 320 L 1860 240 L 1980 320 L 1980 640 Z" fill="#3A3550" stroke={KRP.ink} strokeWidth={5} />
        <rect x={500} y={220} width={120} height={420} fill="#443E5C" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 490 220 L 560 90 L 630 220 Z" fill="#2E2A44" stroke={KRP.ink} strokeWidth={5} />
        {[[0, 450], [100, 450], [230, 400], [330, 400], [1540, 420], [1640, 420], [1780, 380], [1880, 380], [545, 300]].map(([wx, wy], i) => (
          <rect key={i} x={wx} y={wy} width={36} height={50} fill={MP.flame} opacity={0.55 + 0.3 * Math.sin(f / 13 + i)} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* ガス灯 */}
        <line x1={1420} y1={420} x2={1420} y2={700} stroke={MP.iron} strokeWidth={12} />
        <path d="M 1390 420 L 1450 420 L 1440 360 L 1400 360 Z" fill="#F3E2A0" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1420} cy={395} r={70} fill={MP.glow} opacity={0.25} />
        {/* 石畳 */}
        <rect x={-60} y={640} width={2040} height={500} fill={C.cobble} />
        {Array.from({ length: 40 }, (_, i) => (
          <ellipse key={i} cx={(i * 131) % 2000} cy={670 + (i % 6) * 70} rx={44} ry={16} fill={C.cobbleDark} stroke={KRP.ink} strokeWidth={2} opacity={0.7} />
        ))}
        <line x1={-60} y1={640} x2={1980} y2={640} stroke={KRP.ink} strokeWidth={5} />
        {/* 焚き火の光 */}
        {[700, 480, 280].map((r, i) => (
          <circle key={r} cx={960} cy={fireY - 40} r={r} fill={C.fire} opacity={0.05 + i * 0.03 + 0.01 * Math.sin(f / 3)} />
        ))}
        {/* 煙と、煙の中の時計の絵 */}
        {smoke}
        <g opacity={0.92} transform={`translate(0 ${Math.sin(f / 16) * 6})`}>
          <circle cx={clk[0]} cy={clk[1]} r={R + 26} fill={C.smoke} opacity={0.5} />
          <circle cx={clk[0]} cy={clk[1]} r={R} fill="#F3EEE2" stroke={KRP.ink} strokeWidth={7} />
          <circle cx={clk[0]} cy={clk[1]} r={R - 18} fill="none" stroke={KRP.ink} strokeWidth={2.5} opacity={0.4} />
          <line x1={clk[0]} y1={clk[1]} x2={clk[0] + Math.sin(a4) * 92} y2={clk[1] - Math.cos(a4) * 92} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
          <circle cx={clk[0]} cy={clk[1]} r={10} fill={MP.brass} stroke={KRP.ink} strokeWidth={3} />
          {/* シールがはがれた跡 (のっぺらぼう) */}
          {f >= 20 && <rect x={sx0 - 34} y={sy0 - 34} width={68} height={68} rx={6} fill="none" stroke={KRP.gray} strokeWidth={3} strokeDasharray="6 5" />}
        </g>
        {/* 「4」の紙のシール */}
        <g transform={`translate(${stX} ${stY + Math.sin(f / 16) * 6}) rotate(${stR})`}>
          <rect x={-34} y={-34} width={68} height={68} rx={6} fill={C.sticker} stroke={KRP.ink} strokeWidth={4} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={KRP.ink}>4</text>
          {peel > 0.05 && (
            <path d={`M 34 ${34 - 40 * peel} L 34 34 L ${34 - 40 * peel} 34 Z`} fill="#E6DCC0" stroke={KRP.ink} strokeWidth={3} />
          )}
        </g>
        {/* 夜風の線 */}
        {wind > 0 && wind < 1 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${lerp(300, 900, wind) + k * 40} ${260 + k * 60} q 80 -30 160 0 q 50 20 90 -10`} fill="none" stroke={KRP.white} strokeWidth={5}
            strokeLinecap="round" opacity={(1 - wind) * 0.9} />
        ))}
        {/* 丸太の腰かけ */}
        {[[160, 420], [1180, 1540]].map(([x0, x1], i) => (
          <g key={i}>
            <rect x={x0} y={760} width={x1 - x0} height={50} rx={24} fill={C.log} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={x1} cy={785} rx={16} ry={25} fill="#A87C50" stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 聞き手 (男女) */}
        <MzDbSitter x={290} y={818} f={f} female phase={1} face={shocked ? "surprised" : "smile"} gaze={shocked ? [6, -8] : [8, 0]} />
        <MzDbSitter x={1260} y={818} f={f} female={false} phase={2} face={shocked ? "surprised" : "smile"} gaze={shocked ? [-4, -8] : [-8, 0]} />
        <MzDbSitter x={1470} y={818} f={f} female phase={3} face={shocked ? "surprised" : "smile"} gaze={shocked ? [-4, -8] : [-8, 0]} />
        {/* 子ども (シールを追いかける) */}
        <Person x={kidX} y={850} s={0.72} f={f} phase={5} cloth={KRP.yellow} clothDark={C.kidYellowDark}
          pose={f >= 30 ? "run" : "stand"} face={f >= 30 ? "joy" : shocked ? "surprised" : "smile"} gaze={[6, -8]} />
        {/* 焚き火 */}
        <g>
          {[[-70, 20], [70, -20], [0, 0]].map(([dx, r], i) => (
            <rect key={i} x={900 + dx} y={fireY - 6} width={140} height={26} rx={12} fill={C.log} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${r} ${960 + dx} ${fireY + 6})`} />
          ))}
          <path d={`M 900 ${fireY} Q 890 ${fireY - 80} ${930 + Math.sin(f / 3) * 8} ${fireY - 150} Q 950 ${fireY - 100} 960 ${fireY - 180 + Math.sin(f / 2) * 10} Q 975 ${fireY - 110} ${1000 + Math.sin(f / 4) * 8} ${fireY - 140} Q 1030 ${fireY - 70} 1020 ${fireY} Z`}
            fill={C.fire} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M 930 ${fireY} Q 930 ${fireY - 60} 960 ${fireY - 110 + Math.sin(f / 3) * 8} Q 990 ${fireY - 60} 990 ${fireY} Z`} fill={C.fireCore} />
          {Array.from({ length: 4 }, (_, i) => {
            const u = ((f + i * 9) % 30) / 30;
            return <circle key={i} cx={960 + Math.sin(i * 2 + u * 5) * 50} cy={fireY - 150 - u * 160} r={4} fill={MP.flame} opacity={1 - u} />;
          })}
        </g>
        {/* 語り部のおじいさん (白いひげ・両手を広げる) */}
        <Person x={600} y={850} s={1.05} f={f} pose={f < 60 ? "banzai" : "stand"} cloth="#6A5A7E" clothDark="#4E4260" hair="none"
          face={f < 24 ? "joy" : f < 60 ? "surprised" : "worried"} gaze={[8, -8]} />
        <g transform={`translate(600 ${850 + Math.sin(f / 13) * 3}) scale(1.05)`}>
          <MzDbBeard />
        </g>
        {f >= 60 && (
          <path d={`M ${600 + 70} ${850 - 330 + Math.sin(f / 5) * 4} q -10 14 0 20 q 10 -6 0 -20 Z`} fill="#9CCAE8" stroke={KRP.ink} strokeWidth={3} />
        )}
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_085: (f) => <Mz085 f={f} />,
  mz_086: (f) => <Mz086 f={f} />,
  mz_087: (f) => <Mz087 f={f} />,
  mz_088: (f) => <Mz088 f={f} />,
  mz_089: (f) => <Mz089 f={f} />,
  mz_090: (f) => <Mz090 f={f} />,
  mz_091: (f) => <Mz091 f={f} />,
  mz_092: (f) => <Mz092 f={f} />,
  mz_093: (f) => <Mz093 f={f} />,
  mz_094: (f) => <Mz094 f={f} />,
  mz_095: (f) => <Mz095 f={f} />,
  mz_096: (f) => <Mz096 f={f} />,
};

export const MZ_DB_MOTIFS: string[] = [
  "mz_085", // #85
  "mz_086", // #86
  "mz_087", // #87
  "mz_088", // #88
  "mz_089", // #89
  "mz_090", // #90
  "mz_091", // #91
  "mz_092", // #92
  "mz_093", // #93
  "mz_094", // #94
  "mz_095", // #95
  "mz_096", // #96
];

export const mezaDbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
