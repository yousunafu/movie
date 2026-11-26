// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#97〜#108 (12文)
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, Flame, mixColor, skyColors,
} from "./MezaParts";
const mixC = mixColor;

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  skin: KRP.white as string,
  // 髪
  hairBrown: "#8A5A36",
  hairBrownDark: "#6A4227",
  hairWhite: "#E9E6DF",
  hairPowder: "#DCD8CE",
  // 服 (男)
  navy: "#3E4B66",
  navyDark: "#2E3850",
  grayCloth: "#7D8590",
  grayClothDark: "#5E656E",
  shirt: "#EDE6D6",
  shirtDark: "#CFC6B2",
  vestBrown: "#6E5240",
  vestGray: "#55595F",
  tweed: "#8C7A62",
  tweedDark: "#6B5B47",
  coatBlack: "#2B2A2E",
  coatBlue: "#344A72",
  indigo: "#3A4F7A",
  indigoDark: "#283958",
  // 服 (女)
  enji: "#9E3B47",
  enjiDark: "#7A2A35",
  rose: "#C9606E",
  roseDark: "#A04652",
  pink: "#E39AA6",
  pinkDark: "#C27482",
  apron: "#F5F0E4",
  // 木・紙
  desk: "#7A4E2E",
  deskDark: "#5A3820",
  deskLight: "#9A6A42",
  paper: "#F4EBD3",
  paperDark: "#E2D3AE",
  sepia: "#6B4A2E",
  sepiaWash: "#C9A46E",
  plank: "#C9A273",
  plankDark: "#A47D52",
  plankLight: "#DDBB8E",
  crate: "#C79A62",
  crateDark: "#9A7144",
  // 空・景色
  snow: "#F4F6FA",
  snowShade: "#C9D2E2",
  nightHouse: "#3B3F5C",
  nightHouseDark: "#2A2D45",
  windowDark: "#1E2238",
  lampLit: "#FFD77A",
  grass: "#8FBF6A",
  grassDark: "#6E9E4E",
  field: "#B89A5E",
  fieldDark: "#97793F",
  hill: "#A8CF82",
  river: "#8EC3DE",
  riverDark: "#6AA3C4",
  sheep: "#F6F3EA",
  thatch: "#C9A45A",
  smoke: "#4E4746",
  smokeLight: "#8A8280",
  fog: "#D8D4DC",
  furnace: "#E8622A",
  furnaceGlow: "#FFB15A",
  sun: "#F7C744",
  sunDark: "#E39A2A",
  redInk: "#C8281E",
  mapSea: "#CFE3E6",
  mapPaper: "#EADDB8",
  // 地図の大陸 (明治の色刷り)
  mapAsia: "#EBCB72",
  mapEurope: "#E7A6A0",
  mapAfrica: "#A9CC8A",
  mapNA: "#E9B07A",
  mapSA: "#D9A0C0",
  mapOce: "#B9A8D8",
  ukBlue: "#2D4F9E",
  frBlue: "#2D55A8",
  web: "#D9D9DE",
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
const INK = KRP.ink;
const rad = (d: number) => (d * Math.PI) / 180;

// 手の位置 (Person のローカル座標)。rot=0 で真下、左腕(-1)は +で外上へ、右腕(+1)は -で外上へ
const mzHand = (side: -1 | 1, rot: number, len = 82): [number, number] => [
  side * 67 - Math.sin(rad(rot)) * len, -148 + Math.cos(rad(rot)) * len,
];

type MzEHat = "hunting" | "bowler" | "tricorn" | "kerchief" | "hachimaki" | "kepi" | "none";
type MzEFace = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type MzEPose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "sit";

// ===================================================================
// MzEPerson — 共通部品 Person に、この巻の人の見分け (髪・帽子・スカート・ベスト・後ろ姿) を重ねる
//   arms を渡すと Person の腕を消して (pose=hold + 胴の塗り直し)、2本の腕を自分の角度で描く (腕は必ず2本)
//   children は Person と同じローカル座標 (足元が原点・頭の中心は (0,-228)) で描かれる
// ===================================================================
const MzEPerson: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: MzEFace; gaze?: [number, number]; lean?: number; pose?: MzEPose; still?: boolean;
  cloth?: string; clothDark?: string; glasses?: boolean;
  hair?: "cap" | "none" | "white";
  fem?: "long" | "bun" | "both";
  hat?: MzEHat; hatColor?: string;
  skirt?: string; long?: boolean; apron?: boolean;
  vest?: string;
  back?: boolean; backHair?: string; queue?: boolean;
  coat?: string;
  arms?: [number, number]; armLen?: [number, number]; armCloth?: string; hands?: boolean;
  sleepy?: number; yawn?: boolean; mustache?: boolean;
  children?: React.ReactNode; behind?: React.ReactNode;
}> = (p) => {
  const {
    x, y, s = 1, f = 0, phase = 0, face = "normal", gaze, lean = 0, pose = "stand", still = false,
    cloth = C.navy, clothDark = C.navyDark, glasses = false, hair = "cap", fem, hat = "none", hatColor,
    skirt, long = true, apron = false, vest, back = false, backHair, queue = false, coat,
    arms, armLen = [82, 82], armCloth, hands = true, sleepy = 0, yawn = false, mustache = false,
  } = p;
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  const tf = `translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`;
  const brown = C.hairBrown;
  const isFem = !!fem;
  const showLong = fem === "long" || fem === "both";
  const showBun = fem === "bun" || fem === "both";
  const skirtBot = long ? -8 : -26;
  const skirtW = long ? 84 : 76;
  const arm = (side: -1 | 1, rot: number, len: number) => {
    const [hx, hy] = mzHand(side, rot, len - 6);
    return (
      <g key={side}>
        <rect x={side === -1 ? -78 : 56} y={-148} width={22} height={len} rx={11}
          fill={armCloth ?? cloth} stroke={INK} strokeWidth={4.5} transform={`rotate(${rot} ${side * 67} -148)`} />
        {hands && <circle cx={hx} cy={hy} r={10} fill={C.skin} stroke={INK} strokeWidth={4} />}
      </g>
    );
  };
  return (
    <g>
      {/* 頭の後ろに回る物 (長い髪・髪の房・弁髪のリボン) */}
      <g transform={tf}>
        {p.behind}
        {showLong && (
          <g fill={brown} stroke={INK} strokeWidth={4}>
            <path d="M -58 -262 Q -92 -206 -80 -140 Q -66 -132 -52 -142 Q -60 -196 -40 -246 Z" />
            <path d="M 58 -262 Q 92 -206 80 -140 Q 66 -132 52 -142 Q 60 -196 40 -246 Z" />
          </g>
        )}
        {showBun && !back && (
          <g>
            <circle cx={44} cy={-284} r={26} fill={brown} stroke={INK} strokeWidth={4} />
            <path d="M 30 -282 Q 44 -270 58 -282" stroke={C.hairBrownDark} strokeWidth={3} fill="none" />
          </g>
        )}
      </g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={back ? "normal" : face} gaze={gaze} lean={lean}
        pose={arms ? "hold" : pose} still={still} cloth={cloth} clothDark={clothDark} glasses={glasses && !back}
        hair={hair === "cap" && !isFem ? "cap" : "none"} />
      <g transform={tf}>
        {/* Person の前腕を消す (胴を塗り直す) */}
        {arms && (
          <g>
            <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={INK} strokeWidth={5} />
            {!back && !vest && <rect x={18} y={-138} width={26} height={20} rx={4} fill="none" stroke={INK} strokeWidth={3} opacity={0.55} />}
          </g>
        )}
        {/* ベスト */}
        {vest && (
          <g>
            <path d="M -58 -146 Q -58 -160 -44 -160 L -18 -160 L 0 -110 L 18 -160 L 44 -160 Q 58 -160 58 -146 L 58 -56 Q 0 -46 -58 -56 Z"
              fill={vest} stroke={INK} strokeWidth={4.5} />
            <circle cx={0} cy={-96} r={4} fill={INK} />
            <circle cx={0} cy={-76} r={4} fill={INK} />
          </g>
        )}
        {/* スカートとエプロン */}
        {skirt && (
          <g>
            <path d={`M -60 -72 L 60 -72 L ${skirtW} ${skirtBot} L ${-skirtW} ${skirtBot} Z`} fill={skirt} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <path d={`M -24 -66 L -34 ${skirtBot - 4} M 24 -66 L 34 ${skirtBot - 4}`} stroke={INK} strokeWidth={2.5} opacity={0.35} />
            <rect x={-60} y={-80} width={120} height={14} rx={5} fill={skirt} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {apron && (
          <g>
            <path d={`M -38 -70 L 38 -70 L 46 ${skirtBot - 8} L -46 ${skirtBot - 8} Z`} fill={C.apron} stroke={INK} strokeWidth={4} />
            <rect x={-28} y={-148} width={56} height={70} rx={6} fill={C.apron} stroke={INK} strokeWidth={4} />
            <path d="M -26 -146 L -46 -160 M 26 -146 L 46 -160" stroke={INK} strokeWidth={4} />
            <rect x={-60} y={-80} width={120} height={10} rx={4} fill={C.apron} stroke={INK} strokeWidth={3} />
          </g>
        )}
        {/* ひざ丈の上着 (後ろ姿用) */}
        {coat && (
          <g>
            <path d="M -62 -164 L 62 -164 Q 68 -160 66 -146 L 80 -22 Q 0 -14 -80 -22 L -66 -146 Q -68 -160 -62 -164 Z"
              fill={coat} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 0 -78 L 0 -20" stroke={INK} strokeWidth={4} />
            <circle cx={-14} cy={-86} r={5} fill={MP.brass} stroke={INK} strokeWidth={2} />
            <circle cx={14} cy={-86} r={5} fill={MP.brass} stroke={INK} strokeWidth={2} />
            <path d="M -62 -86 L 62 -86" stroke={INK} strokeWidth={3} opacity={0.4} />
          </g>
        )}
        {/* 後ろ姿: 顔を後頭部で隠す */}
        {back && (
          <g>
            <circle cx={0} cy={-228} r={64} fill={backHair ?? (isFem ? brown : INK)} stroke={INK} strokeWidth={5.5} />
            <path d="M -40 -270 Q -10 -250 -6 -176 M 30 -272 Q 14 -240 18 -178" stroke={isFem ? C.hairBrownDark : "#5A5048"} strokeWidth={3} fill="none" opacity={0.7} />
            {isFem && hat === "none" && <circle cx={0} cy={-258} r={22} fill={brown} stroke={INK} strokeWidth={4} />}
            {queue && (
              <g>
                <path d="M 0 -176 L -6 -136 L 6 -136 Z" fill={backHair ?? INK} stroke={INK} strokeWidth={3} />
                <path d="M 0 -172 L -20 -182 L -20 -160 Z M 0 -172 L 20 -182 L 20 -160 Z" fill={INK} stroke={INK} strokeWidth={2} />
              </g>
            )}
          </g>
        )}
        {/* 正面の髪 (女=茶、白髪) */}
        {!back && isFem && (
          <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -264 4 -258 Q -30 -264 -62 -240 Z" fill={brown} stroke={INK} strokeWidth={3} />
        )}
        {!back && hair === "white" && (
          <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 30 -262 0 -262 Q -30 -262 -62 -240 Z" fill={C.hairWhite} stroke={INK} strokeWidth={3} />
        )}
        {/* 眠そうなまぶた */}
        {!back && sleepy > 0.02 && (
          <g>
            {[-24, 24].map((ex) => {
              const lb = -242 + 22 * clamp01(sleepy);
              return (
                <g key={ex}>
                  <rect x={ex - 15} y={-243} width={30} height={lb + 243} fill={C.skin} />
                  <line x1={ex - 14} y1={lb} x2={ex + 14} y2={lb} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
                </g>
              );
            })}
          </g>
        )}
        {!back && yawn && (
          <g>
            <ellipse cx={0} cy={-184} rx={15} ry={19} fill={INK} />
            <ellipse cx={0} cy={-174} rx={8} ry={5} fill="#E06A5A" />
          </g>
        )}
        {!back && mustache && (
          <path d="M -30 -196 Q -14 -210 0 -200 Q 14 -210 30 -196 Q 14 -192 0 -196 Q -14 -192 -30 -196 Z" fill={hair === "white" ? C.hairWhite : INK} stroke={INK} strokeWidth={2.5} />
        )}
        {/* 帽子 */}
        {hat === "hunting" && (
          <g>
            <path d="M -66 -244 Q -62 -302 4 -304 Q 66 -300 70 -248 Z" fill={hatColor ?? C.tweed} stroke={INK} strokeWidth={4.5} />
            <path d="M -40 -290 Q 0 -276 50 -292" stroke={C.tweedDark} strokeWidth={3} fill="none" />
            <path d="M -62 -250 Q 4 -232 76 -254 Q 86 -244 72 -238 Q 4 -222 -64 -240 Z" fill={C.tweedDark} stroke={INK} strokeWidth={4} />
          </g>
        )}
        {hat === "bowler" && (
          <g>
            <path d="M -50 -276 Q -56 -348 0 -350 Q 56 -348 50 -276 Z" fill={hatColor ?? C.coatBlack} stroke={INK} strokeWidth={4.5} />
            <rect x={-52} y={-292} width={104} height={12} fill="#5A5560" stroke={INK} strokeWidth={3} />
            <ellipse cx={0} cy={-276} rx={84} ry={13} fill={hatColor ?? C.coatBlack} stroke={INK} strokeWidth={4.5} />
          </g>
        )}
        {hat === "tricorn" && (
          <g>
            <path d="M -104 -266 Q -50 -292 0 -262 Q 50 -292 104 -266 Q 84 -334 0 -344 Q -84 -334 -104 -266 Z" fill={hatColor ?? C.coatBlack} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -96 -270 Q -50 -294 0 -266 Q 50 -294 96 -270" stroke={MP.brass} strokeWidth={4} fill="none" />
          </g>
        )}
        {hat === "kerchief" && (
          <g>
            <path d="M -72 -232 Q -80 -310 0 -314 Q 80 -310 72 -232 Q 36 -258 0 -256 Q -36 -258 -72 -232 Z" fill={hatColor ?? C.apron} stroke={INK} strokeWidth={4.5} />
            {!back && <path d="M -72 -234 Q -63 -222 -54 -238 Q -45 -226 -36 -242 Q -27 -230 -18 -246 Q -9 -234 0 -248 Q 9 -234 18 -246 Q 27 -230 36 -242 Q 45 -226 54 -238 Q 63 -222 72 -234" fill="none" stroke={INK} strokeWidth={3} />}
            <path d="M -40 -296 Q 0 -280 40 -296" stroke={C.shirtDark} strokeWidth={3} fill="none" />
          </g>
        )}
        {hat === "hachimaki" && (
          <g>
            <rect x={-66} y={-270} width={132} height={18} rx={7} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <path d="M 60 -264 L 92 -284 L 88 -262 Z M 60 -260 L 96 -252 L 80 -244 Z" fill={KRP.white} stroke={INK} strokeWidth={3.5} />
          </g>
        )}
        {hat === "kepi" && (
          <g>
            <path d="M -60 -256 L -54 -312 L 54 -312 L 60 -256 Z" fill={hatColor ?? C.navyDark} stroke={INK} strokeWidth={4.5} />
            <circle cx={0} cy={-284} r={9} fill={MP.brass} stroke={INK} strokeWidth={3} />
            <path d="M -66 -258 Q 0 -244 66 -258 L 72 -248 Q 0 -230 -72 -248 Z" fill={INK} />
          </g>
        )}
        {/* 自分の角度の腕 (2本) */}
        {arms && (
          <g>
            {arm(-1, arms[0], armLen[0])}
            {arm(1, arms[1], armLen[1])}
          </g>
        )}
        {p.children}
      </g>
    </g>
  );
};

// 音の線「))」
const MzESound: React.FC<{ x: number; y: number; r?: number; amt: number; f: number; color?: string; w?: number; side?: 0 | 1 | -1 }> = ({ x, y, r = 40, amt, f, color = INK, w = 6, side = 0 }) => {
  if (amt <= 0.02) return null;
  const sides = side === 0 ? [-1, 1] : [side];
  const pulse = (Math.floor(f / 3) % 2) * 6;
  return (
    <g opacity={clamp01(amt * 1.4)}>
      {sides.map((sd) => [0, 1, 2].map((k) => {
        const rr = r + k * r * 0.42 + pulse;
        return <path key={`${sd}${k}`} d={`M ${x + sd * rr * 0.5} ${y - rr * 0.8} A ${rr} ${rr} 0 0 ${sd === 1 ? 1 : 0} ${x + sd * rr * 0.5} ${y + rr * 0.8}`}
          stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" opacity={1 - k * 0.25} />;
      }))}
    </g>
  );
};

// 歯車
const MzEGear: React.FC<{ x: number; y: number; r: number; n?: number; rot?: number; fill?: string; sw?: number }> = ({ x, y, r, n = 10, rot = 0, fill = MP.brass, sw = 3 }) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.8;
    pts.push(`${Math.cos(a0 - 0.12) * rr},${Math.sin(a0 - 0.12) * rr}`, `${Math.cos(a0 + 0.12) * rr},${Math.sin(a0 + 0.12) * rr}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <circle r={r * 0.45} fill="none" stroke={INK} strokeWidth={sw * 0.7} opacity={0.6} />
      <circle r={r * 0.16} fill={INK} />
    </g>
  );
};

// 明治の目覚まし時計 (#99〜#101 だけ。2本の脚・上に2つのベル・ハンマー・横のゼンマイのつまみ)
//   x,y=文字盤の中心 / r=本体の半径 / ring 0〜1 / dial 0〜1 (文字盤がはまる。0 だと中の歯車が見える) / wind=つまみの回転(度)
const MzEMeijiClock: React.FC<{ x: number; y: number; r?: number; f: number; ring?: number; dial?: number; wind?: number; gearIn?: number; minutes?: number }> = ({
  x, y, r = 60, f, ring = 0, dial = 1, wind = 0, gearIn = 1, minutes = 6 * 60,
}) => {
  const k = r / 60;
  const hit = ring > 0.05 ? (Math.floor(f / 2) % 2 ? 16 : -16) * clamp01(ring * 2) : 0;
  const shake = ring > 0.05 ? Math.sin(f * 2.1) * 2.5 * ring : 0;
  const d = clamp01(dial);
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${k})`}>
      {/* 脚 */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * 30} 48 L ${sd * 46} 82`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${sd * 30} 48 L ${sd * 46} 82`} stroke={MP.brass} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={sd * 48} cy={84} rx={12} ry={6} fill={MP.brassDark} stroke={INK} strokeWidth={3} />
        </g>
      ))}
      {/* ベル (2つ) と支柱 */}
      {[-1, 1].map((sd) => (
        <g key={`b${sd}`} transform={`rotate(${sd * 34} 0 0)`}>
          <line x1={0} y1={-58} x2={0} y2={-72} stroke={INK} strokeWidth={5} />
          <path d="M -26 -70 Q -28 -102 0 -104 Q 28 -102 26 -70 Z" fill={MP.brass} stroke={INK} strokeWidth={4.5} />
          <path d="M -16 -80 Q -14 -96 0 -98" stroke={MP.brassLight} strokeWidth={4} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={-107} r={5} fill={MP.brassDark} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}
      {/* ハンマー */}
      <g transform={`rotate(${hit} 0 -56)`}>
        <line x1={0} y1={-56} x2={0} y2={-92} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-94} r={8} fill={MP.brassDark} stroke={INK} strokeWidth={3} />
      </g>
      {/* ゼンマイのつまみ (横) */}
      <g transform={`translate(64 -6)`}>
        <rect x={-6} y={-5} width={14} height={10} fill={MP.brassDark} stroke={INK} strokeWidth={2.5} />
        <g transform={`rotate(${wind} 12 0)`}>
          <path d="M 8 -16 Q 20 -16 20 0 Q 20 16 8 16 Z" fill={MP.brass} stroke={INK} strokeWidth={3} />
        </g>
      </g>
      {/* 本体 */}
      <circle r={60} fill={MP.bell} stroke={INK} strokeWidth={6} />
      <circle r={52} fill={MP.brass} stroke={INK} strokeWidth={3.5} />
      {/* 中の歯車 (文字盤がはまる前) */}
      <g opacity={1 - d}>
        <circle r={46} fill={MP.brassDark} stroke={INK} strokeWidth={3} />
        <MzEGear x={-14} y={-10} r={22} n={12} rot={f * 3} sw={2.5} />
        <MzEGear x={20} y={10} r={15} n={9} rot={-f * 4.4} fill={MP.brassLight} sw={2.5} />
        <MzEGear x={-6} y={26} r={11} n={8} rot={f * 6} sw={2} />
        {/* 最後の小さな歯車 (gearIn: 0=上から運ばれている途中 → 1=はまった) */}
        <g transform={`translate(${lerp(10, 20, gearIn)} ${lerp(-60, -22, gearIn)})`}>
          <MzEGear x={0} y={0} r={9} n={7} rot={gearIn >= 1 ? -f * 7 : 0} fill={MP.brassLight} sw={2} />
        </g>
      </g>
      {/* 文字盤 */}
      {d > 0.01 && (
        <g transform={`scale(${0.6 + 0.4 * easeOut(d)})`} opacity={d}>
          <circle r={46} fill={KRP.white} stroke={INK} strokeWidth={3.5} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = rad(i * 30);
            return <line key={i} x1={Math.sin(a) * 36} y1={-Math.cos(a) * 36} x2={Math.sin(a) * 42} y2={-Math.cos(a) * 42} stroke={INK} strokeWidth={i % 3 === 0 ? 4 : 2} />;
          })}
          {[0, 3, 6, 9].map((i) => {
            const a = rad(i * 30);
            return <text key={i} x={Math.sin(a) * 26} y={-Math.cos(a) * 26 + 6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={16} fill={INK}>{i === 0 ? 12 : i}</text>;
          })}
          <line x1={0} y1={4} x2={0} y2={-24} stroke={INK} strokeWidth={5} strokeLinecap="round" transform={`rotate(${((minutes / 60) % 12) * 30})`} />
          <line x1={0} y1={5} x2={0} y2={-34} stroke={INK} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${(minutes % 60) * 6})`} />
          {/* 目覚ましの針 (赤) */}
          <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.red} strokeWidth={2.5} transform="rotate(180)" />
          <circle r={4} fill={INK} />
        </g>
      )}
      {/* ガラスの光 */}
      <path d="M -36 -26 Q -26 -42 -8 -46" stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
      <MzESound x={0} y={-80} r={44} amt={ring} f={f} />
    </g>
  );
};

// 英国旗 (簡略。x,y=中心・w=幅)
const MzEFlagUK: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 60, rot = 0 }) => {
  const h = w * 0.55, hw = w / 2, hh = h / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-hw} y={-hh} width={w} height={h} fill={C.ukBlue} />
      <path d={`M ${-hw} ${-hh} L ${hw} ${hh} M ${hw} ${-hh} L ${-hw} ${hh}`} stroke={KRP.white} strokeWidth={h * 0.22} />
      <path d={`M ${-hw} ${-hh} L ${hw} ${hh} M ${hw} ${-hh} L ${-hw} ${hh}`} stroke={KRP.red} strokeWidth={h * 0.08} />
      <path d={`M 0 ${-hh} L 0 ${hh} M ${-hw} 0 L ${hw} 0`} stroke={KRP.white} strokeWidth={h * 0.32} />
      <path d={`M 0 ${-hh} L 0 ${hh} M ${-hw} 0 L ${hw} 0`} stroke={KRP.red} strokeWidth={h * 0.18} />
      <rect x={-hw} y={-hh} width={w} height={h} fill="none" stroke={INK} strokeWidth={Math.max(2, w * 0.05)} />
    </g>
  );
};
// フランス国旗
const MzEFlagFR: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 60, rot = 0 }) => {
  const h = w * 0.62, hw = w / 2, hh = h / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-hw} y={-hh} width={w / 3} height={h} fill={C.frBlue} />
      <rect x={-hw + w / 3} y={-hh} width={w / 3} height={h} fill={KRP.white} />
      <rect x={-hw + (2 * w) / 3} y={-hh} width={w / 3} height={h} fill={KRP.red} />
      <rect x={-hw} y={-hh} width={w} height={h} fill="none" stroke={INK} strokeWidth={Math.max(2, w * 0.05)} />
    </g>
  );
};

// 「Zzz」
const MzEZzz: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> = ({ x, y, s = 1, f, phase = 0, color = KRP.white }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2].map((i) => {
      const t = ((f + phase * 13) / 60 + i / 3) % 1;
      return (
        <text key={i} x={t * 40} y={-t * 70} fontFamily={FONT} fontWeight={900} fontSize={22 + t * 20}
          fill={color} stroke={INK} strokeWidth={3} paintOrder="stroke" opacity={Math.sin(t * Math.PI)}>Z</text>
      );
    })}
  </g>
);

// 煙のかたまり (もくもく)
const MzEPuff: React.FC<{ x: number; y: number; r: number; color?: string; o?: number; f?: number; phase?: number }> = ({ x, y, r, color = C.smoke, o = 1, f = 0, phase = 0 }) => {
  if (o <= 0.01 || r <= 1) return null;
  const w = Math.sin((f + phase * 11) / 14) * r * 0.05;
  return (
    <g opacity={o}>
      {[[0, 0, 1], [-0.62, 0.18, 0.7], [0.6, 0.22, 0.72], [-0.3, -0.42, 0.66], [0.32, -0.38, 0.62]].map(([dx, dy, rr], i) => (
        <circle key={i} cx={x + dx * r + w} cy={y + dy * r} r={r * rr} fill={color} stroke={INK} strokeWidth={3} strokeOpacity={0.35} />
      ))}
    </g>
  );
};

// KoujouMon の右の続き (カメラを右へ振ったとき画面の端が切れないように、同じ空・れんが・石畳を足す)
const MzEMonExt: React.FC<{ sky: number; soot?: boolean }> = ({ sky, soot = false }) => (
  <g>
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={1956} y={-60 + i * 46} width={400} height={48} fill={mixC(skyColors(sky)[0], skyColors(sky)[1], i / 7)} />)}
    <rect x={1956} y={-60} width={400} height={360} fill="#6B6460" opacity={0.18} />
    <rect x={1956} y={300} width={400} height={600} fill={MP.brick} />
    {Array.from({ length: 24 }, (_, r) => <line key={r} x1={1956} y1={300 + r * 25} x2={2356} y2={300 + r * 25} stroke={MP.mortar} strokeWidth={3} opacity={0.7} />)}
    {Array.from({ length: 24 }, (_, r) => Array.from({ length: 5 }, (_, c) => <line key={`${r}-${c}`} x1={1956 + c * 80 + (r % 2) * 40} y1={300 + r * 25} x2={1956 + c * 80 + (r % 2) * 40} y2={325 + r * 25} stroke={MP.mortar} strokeWidth={2.5} opacity={0.6} />))}
    <rect x={1956} y={284} width={400} height={24} fill={MP.stoneLight} stroke={INK} strokeWidth={5} />
    <rect x={1956} y={900} width={400} height={220} fill="#7C7066" />
    {soot && <rect x={1956} y={-60} width={400} height={1180} fill={MP.soot} opacity={0.35} />}
    <rect x={1956} y={-60} width={400} height={1180} fill={MP.nightDeep} opacity={0.3 * Math.max(0, 1 - sky / 1.6)} />
  </g>
);
// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #97 ただ、ハッチンズが冬でも朝4時に起きていたことは、息子が書き残しています。
// 格: 並 / seed 6097
// 絵: どこ: 19世紀初めの家の書き物机 (ろうそく・インク壺・羽ペン・窓の外に雪)。演出: 主役は書き残す手元。息子 (顔は描かず、手元と袖だけ。ハッチンズの家族の実在の人物) の手が羽ペンで紙に書いていく。紙の上に、言葉ではなく小さな挿絵が描かれていく: 雪の夜の家・時計の針が4時 (札「4:00」)・ベッドから起き上がる三角帽子の後ろ姿。挿絵のインクが乾くと、窓の外の雪がしんしんと強くなる。ろうそくの炎が揺れ、インクのしみがぽたっと落ちる。カメラは紙に寄る。動き: f0-40 家の絵 / f40-80 時計の4時 / f80-120 起き上がる後ろ姿 / 雪
// どこ: 19世紀初めの家の書き物机。夜。奥の壁に雪の降る窓 (カーテン)、右にろうそく、インク壺・砂入れ・本の山・手紙の束
// 演出: 机いっぱいの紙に、息子の手 (茶の上着の袖とレースの袖口・顔なし) が羽ペンで3つの挿絵を描いていく
//       ①雪の夜の家 ②4時の時計 (札「4:00」) ③ベッドから起き上がる三角帽子の後ろ姿。描き終わると挿絵に薄い色がしみて乾き、
//       窓の雪が強くなる。ペンをインク壺に浸しに行き、戻ったところでインクのしずくがぽたっと紙に落ちる
// 動き: f0-14 家 / f12-26 時計 / f24-40 後ろ姿 (f45 で3枚そろう) / f40-90 色が乾く・雪が強まる / f44-64 インク壺へ / f80 しずく / 紙へ寄り続ける
const MzEInk: React.FC<{ d: string; t: number; w?: number; color?: string }> = ({ d, t, w = 5, color = C.sepia }) =>
  t <= 0 ? null : (
    <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(t)} stroke={color} strokeWidth={w}
      fill="none" strokeLinecap="round" strokeLinejoin="round" />
  );
const Mz097: React.FC<{ f: number }> = ({ f }) => {
  const t1 = seg(f, 0, 14), t2 = seg(f, 12, 26), t3 = seg(f, 24, 40);
  const wash = seg(f, 40, 70);
  const snowAmt = 0.3 + 0.7 * seg(f, 40, 95);
  const cam = 1 + 0.1 * easeInOut(seg(f, 0, 170));
  // ペン先の位置
  let tip: [number, number];
  if (f < 14) tip = [640 + 70 * Math.sin(f * 0.9), 610 + 46 * Math.cos(f * 1.3)];
  else if (f < 26) tip = [950 + 86 * Math.sin((f - 14) * 0.52), 600 - 86 * Math.cos((f - 14) * 0.52)];
  else if (f < 42) tip = [1240 + 64 * Math.sin(f * 0.8), 630 + 44 * Math.cos(f * 1.1)];
  else {
    const toPot = easeInOut(seg(f, 42, 56));
    const back = easeInOut(seg(f, 64, 78));
    const dip = Math.sin(seg(f, 56, 64) * Math.PI) * 40;
    const base: [number, number] = [lerp(1270, 1590, toPot), lerp(650, 560, toPot) + dip];
    tip = [lerp(base[0], 1330, back) + Math.sin(f / 14) * 6 * back, lerp(base[1], 690, back) + Math.cos(f / 17) * 5 * back];
  }
  const drop = seg(f, 80, 88);
  const blot = seg(f, 88, 100);
  const lift = f >= 42 && f < 80 ? 1 : 0;
  const [tx, ty] = [tip[0], tip[1] - lift * 14];
  const flakes = Math.round(18 + 42 * snowAmt);
  return (
    <Frame f={f} seed={6097} bg="#3A2C24">
      <g transform={`translate(930 600) scale(${cam}) translate(-930 -600)`}>
        {/* 壁 (しっくい・腰板) */}
        <rect x={-60} y={-60} width={2040} height={460} fill="#5A463A" />
        <rect x={-60} y={250} width={2040} height={110} fill="#4A382E" />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={-40 + i * 160} y1={250} x2={-40 + i * 160} y2={360} stroke="#3A2C24" strokeWidth={4} />)}
        <line x1={-60} y1={250} x2={1980} y2={250} stroke={INK} strokeWidth={5} />
        {/* 窓 (外は雪の夜) */}
        <g>
          <rect x={120} y={20} width={460} height={300} fill={MP.nightDeep} stroke={INK} strokeWidth={8} />
          <rect x={120} y={200} width={460} height={120} fill={MP.night} opacity={0.6} />
          {/* 外の雪の屋根 */}
          <path d="M 120 280 L 210 230 L 300 280 Z M 330 290 L 440 222 L 560 290 Z" fill={C.nightHouse} stroke={INK} strokeWidth={3} />
          <path d="M 140 270 L 210 232 L 284 270 Q 210 256 140 270 Z M 352 280 L 440 225 L 540 280 Q 440 262 352 280 Z" fill={C.snow} />
          <rect x={120} y={290} width={460} height={30} fill={C.snow} />
          <circle cx={500} cy={80} r={26} fill="#F5F0D8" opacity={0.8} />
          <circle cx={512} cy={72} r={24} fill={MP.nightDeep} />
          {Array.from({ length: flakes }, (_, i) => {
            const sx = 130 + rnd(97, i) * 440 + Math.sin(f / 12 + i) * 8;
            const sy = 24 + ((rnd(98, i) * 300 + f * (1.6 + rnd(99, i) * 1.4)) % 296);
            return <circle key={i} cx={sx} cy={sy} r={2.5 + rnd(100, i) * 3} fill={C.snow} opacity={0.9} />;
          })}
          {/* 窓枠 */}
          <path d="M 273 20 L 273 320 M 427 20 L 427 320 M 120 170 L 580 170" stroke={MP.woodDark} strokeWidth={10} />
          <rect x={120} y={20} width={460} height={300} fill="none" stroke={MP.woodDark} strokeWidth={14} />
          <rect x={120} y={20} width={460} height={300} fill="none" stroke={INK} strokeWidth={4} />
          {/* 外の窓台に積もった雪 (強まると高くなる) */}
          <path d={`M 110 ${322 - 10 * snowAmt} Q 350 ${300 - 18 * snowAmt} 590 ${322 - 10 * snowAmt} L 590 334 L 110 334 Z`} fill={C.snow} stroke={INK} strokeWidth={3} />
          {/* カーテン */}
          <path d={`M 60 0 L 150 0 Q ${140 + Math.sin(f / 30) * 4} 180 120 340 L 60 340 Z`} fill="#7A2E2E" stroke={INK} strokeWidth={5} />
          <path d={`M 640 0 L 550 0 Q ${560 + Math.sin(f / 33) * 4} 180 580 340 L 640 340 Z`} fill="#7A2E2E" stroke={INK} strokeWidth={5} />
        </g>
        {/* 机 (木目) */}
        <rect x={-60} y={350} width={2040} height={790} fill={C.desk} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -60 ${400 + i * 95} q 500 ${rnd(6, i) * 30 - 15} 1000 0 q 500 ${rnd(7, i) * 30 - 15} 1040 0`} stroke={C.deskDark} strokeWidth={4} fill="none" opacity={0.6} />
        ))}
        <rect x={-60} y={346} width={2040} height={14} fill={C.deskLight} stroke={INK} strokeWidth={4} />
        {/* ろうそくの光 (机に落ちる) */}
        <ellipse cx={1500} cy={560} rx={760} ry={420} fill={MP.glow} opacity={0.05 + 0.015 * Math.sin(f / 4)} />
        <ellipse cx={1500} cy={560} rx={420} ry={260} fill={MP.glow} opacity={0.12} />
        {/* 本の山 (左) */}
        <g transform="rotate(-4 280 470)">
          {[["#6B3A2E", 0], ["#3E5A4A", 1], ["#7A6A3A", 2]].map(([col, i]) => (
            <g key={i as number}>
              <rect x={150 + (i as number) * 8} y={500 - (i as number) * 46} width={280} height={44} rx={5} fill={col as string} stroke={INK} strokeWidth={4.5} />
              <rect x={170 + (i as number) * 8} y={510 - (i as number) * 46} width={240} height={6} fill={MP.brass} opacity={0.7} />
            </g>
          ))}
        </g>
        {/* 手紙の束 */}
        <g transform="rotate(8 260 700)">
          <rect x={150} y={650} width={230} height={150} fill={C.paperDark} stroke={INK} strokeWidth={4} />
          <rect x={166} y={638} width={230} height={150} fill={C.paper} stroke={INK} strokeWidth={4} />
          <path d="M 166 638 L 281 720 L 396 638" fill="none" stroke={INK} strokeWidth={3} />
          <circle cx={281} cy={722} r={14} fill={KRP.red} stroke={INK} strokeWidth={3} />
        </g>
        {/* 紙 (主役の台) */}
        <g transform="rotate(-2 930 595)">
          <rect x={456} y={378} width={960} height={446} fill={C.paperDark} opacity={0.6} transform="translate(10 10)" />
          <rect x={450} y={370} width={960} height={446} rx={4} fill={C.paper} stroke={INK} strokeWidth={6} />
          <path d="M 790 400 L 790 790 M 1100 400 L 1100 790" stroke={C.paperDark} strokeWidth={3} strokeDasharray="10 10" />
          {/* ①雪の夜の家 */}
          <g opacity={1}>
            <path d="M 572 604 L 640 548 L 708 604 Z" fill={C.sepiaWash} opacity={0.5 * wash} />
            <rect x={590} y={604} width={100} height={96} fill={C.sepiaWash} opacity={0.35 * wash} />
            <rect x={620} y={630} width={34} height={30} fill={C.lampLit} opacity={0.6 * wash} />
            <MzEInk t={seg(t1, 0, 0.3)} d="M 520 700 Q 640 690 770 700" />
            <MzEInk t={seg(t1, 0.2, 0.55)} d="M 590 700 L 590 604 L 690 604 L 690 700" />
            <MzEInk t={seg(t1, 0.45, 0.75)} d="M 572 606 L 640 548 L 708 606 M 660 566 L 660 540 L 676 540 L 676 580" />
            <MzEInk t={seg(t1, 0.7, 1)} d="M 616 628 L 652 628 L 652 662 L 616 662 Z M 634 628 L 634 662 M 568 600 Q 600 586 640 552 Q 680 586 712 600" w={4} />
            {t1 > 0.9 && [[540, 470], [580, 520], [720, 470], [750, 540], [530, 580], [700, 515]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={5} fill={C.sepia} />)}
            <MzEInk t={seg(t1, 0.8, 1)} d="M 735 470 a 22 22 0 1 0 22 30 a 16 16 0 1 1 -22 -30" w={4} />
          </g>
          {/* ②4時の時計 */}
          <g>
            <circle cx={950} cy={610} r={92} fill={C.sepiaWash} opacity={0.3 * wash} />
            <MzEInk t={seg(t2, 0, 0.5)} d="M 950 518 A 92 92 0 1 1 949.9 518" w={5.5} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = rad(i * 30);
              return <MzEInk key={i} t={seg(t2, 0.4 + i * 0.02, 0.5 + i * 0.02)} w={i % 3 ? 3 : 5}
                d={`M ${950 + Math.sin(a) * 72} ${610 - Math.cos(a) * 72} L ${950 + Math.sin(a) * 84} ${610 - Math.cos(a) * 84}`} />;
            })}
            <MzEInk t={seg(t2, 0.7, 0.85)} d="M 950 610 L 950 538" w={5} />
            <MzEInk t={seg(t2, 0.82, 1)} d={`M 950 610 L ${950 + Math.sin(rad(120)) * 50} ${610 - Math.cos(rad(120)) * 50}`} w={7} />
            {t2 > 0.95 && <circle cx={950} cy={610} r={7} fill={C.sepia} />}
          </g>
          {/* ③起き上がる三角帽子の後ろ姿 */}
          <g>
            <path d="M 1150 690 L 1150 640 Q 1240 610 1350 640 L 1350 690 Z" fill={C.sepiaWash} opacity={0.35 * wash} />
            <MzEInk t={seg(t3, 0, 0.25)} d="M 1130 720 L 1130 620 M 1130 690 L 1370 690 L 1370 650 M 1140 660 Q 1240 628 1360 650" />
            <MzEInk t={seg(t3, 0.22, 0.5)} d="M 1210 650 Q 1200 600 1214 570 L 1270 570 Q 1284 600 1272 650" />
            <MzEInk t={seg(t3, 0.45, 0.7)} d="M 1242 566 m -26 0 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0" />
            <MzEInk t={seg(t3, 0.65, 0.9)} d="M 1200 540 Q 1220 528 1242 540 Q 1264 528 1284 540 Q 1270 512 1242 508 Q 1214 512 1200 540 Z" w={4.5} />
            {t3 > 0.6 && <circle cx={1242} cy={566} r={25} fill={C.sepia} opacity={0.75} />}
            {t3 > 0.7 && <path d="M 1236 590 L 1242 612 L 1248 590 Z M 1242 594 l -12 -6 l 0 12 Z M 1242 594 l 12 -6 l 0 12 Z" fill={C.sepia} />}
            {t3 > 0.85 && <path d="M 1200 540 Q 1220 528 1242 540 Q 1264 528 1284 540 Q 1270 512 1242 508 Q 1214 512 1200 540 Z" fill={C.sepia} opacity={0.85} />}
            <MzEInk t={seg(t3, 0.85, 1)} d="M 1212 590 L 1180 556 M 1272 590 L 1304 556" w={4.5} />
          </g>
          {/* インクのしずくのしみ */}
          {blot > 0 && (
            <g>
              <ellipse cx={1336} cy={764} rx={10 + 22 * easeOut(blot)} ry={8 + 16 * easeOut(blot)} fill="#2E2218" />
              {[0, 1, 2, 3].map((i) => <circle key={i} cx={1336 + Math.cos(i * 1.7) * 34 * blot} cy={764 + Math.sin(i * 1.7) * 22 * blot} r={4 * blot} fill="#2E2218" />)}
            </g>
          )}
          {/* 落ちていくしずく */}
          {drop > 0 && drop < 1 && <ellipse cx={1336} cy={lerp(700, 760, drop * drop)} rx={7} ry={11} fill="#2E2218" />}
        </g>
        {/* 札 4:00 */}
        <TagPlate x={950} y={462} text="4:00" size={40} t={seg(f, 24, 32)} />
        {/* インク壺・砂入れ */}
        <g>
          <ellipse cx={1600} cy={620} rx={92} ry={26} fill="#2A1E16" opacity={0.35} />
          <path d="M 1530 610 L 1540 530 Q 1600 516 1660 530 L 1670 610 Q 1600 630 1530 610 Z" fill="#2A3A4A" stroke={INK} strokeWidth={5} />
          <ellipse cx={1600} cy={530} rx={48} ry={12} fill="#1A1410" stroke={INK} strokeWidth={4} />
          <path d="M 1546 560 Q 1552 590 1550 600" stroke={KRP.white} strokeWidth={5} opacity={0.4} fill="none" />
          <rect x={1700} y={660} width={90} height={110} rx={10} fill={MP.brass} stroke={INK} strokeWidth={4.5} />
          <ellipse cx={1745} cy={660} rx={45} ry={12} fill={MP.brassLight} stroke={INK} strokeWidth={4} />
        </g>
        {/* ろうそく */}
        <g>
          <ellipse cx={1760} cy={520} rx={80} ry={20} fill={MP.brass} stroke={INK} strokeWidth={5} />
          <rect x={1740} y={370} width={40} height={146} rx={6} fill="#F4EEDC" stroke={INK} strokeWidth={4.5} />
          <path d={`M 1748 380 Q 1744 ${410 + Math.sin(f / 20) * 2} 1750 430`} stroke="#E3D9BE" strokeWidth={6} fill="none" />
          <Flame x={1760} y={372} s={1.6} f={f} glow={1.4} />
        </g>
        {/* 息子の手と羽ペン (顔は描かない) */}
        <g>
          {/* 羽ペン */}
          <g transform={`translate(${tx} ${ty}) rotate(30)`}>
            <line x1={0} y1={0} x2={0} y2={-300} stroke={INK} strokeWidth={5} />
            <path d="M 0 -110 Q -30 -200 -8 -310 Q 4 -300 6 -290 Q 34 -200 0 -110 Z" fill={C.paper} stroke={INK} strokeWidth={4} />
            {Array.from({ length: 7 }, (_, i) => <line key={i} x1={0} y1={-130 - i * 24} x2={-18 + (i % 2) * 36} y2={-140 - i * 24 - 10} stroke={C.paperDark} strokeWidth={2.5} />)}
            <path d="M -4 0 L 4 0 L 3 -24 L -3 -24 Z" fill={INK} />
          </g>
          {/* 袖 */}
          <path d={`M ${tx + 60} ${ty + 30} L ${tx + 470} ${ty + 520} L ${tx + 620} ${ty + 380} L ${tx + 130} ${ty - 30} Z`} fill={C.vestBrown} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${tx + 50} ${ty + 34} L ${tx + 136} ${ty - 36} L ${tx + 156} ${ty - 10} L ${tx + 74} ${ty + 58} Z`} fill={C.apron} stroke={INK} strokeWidth={4} />
          {/* 手 */}
          <g transform={`translate(${tx + 36} ${ty + 6}) rotate(-34)`}>
            <ellipse cx={0} cy={0} rx={50} ry={34} fill={C.skin} stroke={INK} strokeWidth={5} />
            <path d="M -44 -6 Q -56 -10 -54 -24 Q -40 -30 -26 -22" fill={C.skin} stroke={INK} strokeWidth={4.5} />
            <path d="M -20 14 Q -6 22 12 18 M -6 26 Q 10 32 26 26" stroke={INK} strokeWidth={3.5} fill="none" />
          </g>
        </g>
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #98 目覚ましの発明者というより、ただの、ものすごい早起きでした。
// 格: 山 / seed 6098
// 絵: どこ: 18世紀アメリカの冬の村、朝4時の真っ暗な外 (雪の屋根・星・裸の木・家々の窓は全部まっ暗)。演出: 笑いどころ。村の家々は全部まっ暗で、屋根の上の雪だるまも、木の枝のフクロウも、鶏小屋の鶏たち (とさかを垂らして全員寝ている) も、ぐうぐう寝ている。その中で一軒だけ窓が明るく、窓の中でハッチンズ (顔は描かない。三角帽子とひざ丈の上着の背中) が、両腕を高く伸ばして元気いっぱいにのびをし、そのまま腕をぶんぶん回して体操をはじめる (腕は2本、pose="stretch")。フクロウが片目を開けて「え、もう?」とのけぞる。札「4:00」が窓の横に。カメラは暗い村の引きから、その窓へ寄る。動き: f0-50 寄り / f50 のび / f60-130 腕を回す体操 / f90 フクロウ
// どこ: 18世紀アメリカの冬の村、朝4時の真っ暗な外。星と月・雪の屋根・裸の木・鶏小屋。家々の窓は全部まっ暗
// 演出: 笑いどころ。左の家の屋根の雪だるま (ナイトキャップ)・木の枝のフクロウ・鶏小屋の鶏3羽 (とさかを垂らす) は全員ぐうぐう。
//       まん中の一軒だけ窓が明るく、ハッチンズ (後ろ姿・三角帽子・髪を結ったリボン・ひざ丈の青い上着) がのびをして、
//       そのまま腕をぐるぐる回す体操。フクロウが片目を開けてのけぞる「!?」。札「4:00」が窓の横
// 動き: f0-30 村の引きから窓へ寄る / f20-32 のび / f32- 腕を回す (約28コマで1周) / f36-44 フクロウ / f70 鶏が1羽だけ片目
const MzEOwl: React.FC<{ x: number; y: number; s?: number; f: number; wake: number }> = ({ x, y, s = 1, f, wake }) => {
  const lean = -20 * easeOut(wake);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean} 0 40)`}>
      <path d="M -40 10 Q -46 -50 -30 -62 L -24 -84 L -10 -64 Q 0 -66 10 -64 L 24 -84 L 30 -62 Q 46 -50 40 10 Q 34 48 0 50 Q -34 48 -40 10 Z" fill="#8A6A4A" stroke={INK} strokeWidth={4.5} />
      <ellipse cx={0} cy={16} rx={24} ry={28} fill="#D9C2A0" stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((i) => <path key={i} d={`M -12 ${6 + i * 12} q 6 6 12 0 q 6 6 12 0`} stroke="#9A7A56" strokeWidth={2.5} fill="none" />)}
      <path d="M -34 -6 Q -48 16 -38 34" stroke={INK} strokeWidth={3.5} fill="none" />
      <path d="M 34 -6 Q 48 16 38 34" stroke={INK} strokeWidth={3.5} fill="none" />
      <circle cx={-15} cy={-36} r={14} fill="#E8D7B8" stroke={INK} strokeWidth={3} />
      <circle cx={15} cy={-36} r={14} fill="#E8D7B8" stroke={INK} strokeWidth={3} />
      {/* 左目: ずっと寝ている / 右目: 起きるとまんまるに開く */}
      <path d="M -24 -36 Q -15 -30 -6 -36" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {wake > 0.3 ? (
        <g>
          <circle cx={15} cy={-36} r={11 * (0.6 + 0.4 * wake)} fill={KRP.yellow} stroke={INK} strokeWidth={3} />
          <circle cx={15} cy={-36} r={4.5} fill={INK} />
        </g>
      ) : (
        <path d="M 6 -36 Q 15 -30 24 -36" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      )}
      <path d="M -5 -26 L 5 -26 L 0 -16 Z" fill={KRP.orange} stroke={INK} strokeWidth={2.5} />
      {/* 足 (枝をつかむ) */}
      <path d="M -12 48 l -4 10 M -12 48 l 2 10 M 12 48 l -2 10 M 12 48 l 4 10" stroke={KRP.orange} strokeWidth={4} strokeLinecap="round" />
      {wake < 0.3 && <MzEZzz x={30} y={-70} s={0.8} f={f} phase={2} />}
    </g>
  );
};
const MzEHen: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; peek?: number; boss?: boolean }> = ({ x, y, s = 1, f, phase = 0, peek = 0, boss = false }) => {
  const br = Math.sin((f + phase * 20) / 16) * 2;
  const comb = boss ? 1.3 : 1;
  return (
    <g transform={`translate(${x} ${y + br}) scale(${s})`}>
      <path d="M 40 -20 Q 70 -50 64 -10 Q 62 10 40 12 Z" fill={C.sheep} stroke={INK} strokeWidth={4} />
      <ellipse cx={0} cy={0} rx={50} ry={34} fill={C.sheep} stroke={INK} strokeWidth={4.5} />
      <path d="M -8 -4 Q 10 12 30 -4" stroke={C.snowShade} strokeWidth={4} fill="none" />
      <circle cx={-40} cy={-30} r={22} fill={C.sheep} stroke={INK} strokeWidth={4} />
      {/* とさか (寝ていると横に垂れる / 起きると立つ) */}
      <g transform={`rotate(${lerp(-70, 0, peek)} -40 -48) translate(-40 -48) scale(${comb}) translate(40 48)`}>
        <path d="M -54 -46 Q -58 -66 -48 -62 Q -46 -76 -36 -66 Q -30 -78 -24 -60 Q -20 -50 -30 -46 Z" fill={KRP.red} stroke={INK} strokeWidth={3} />
      </g>
      <path d="M -60 -30 L -74 -24 L -60 -20 Z" fill={KRP.yellow} stroke={INK} strokeWidth={2.5} />
      <path d="M -56 -16 q -4 10 4 12" fill={KRP.red} stroke={INK} strokeWidth={2} />
      {peek > 0.5 ? (
        <g><circle cx={-44} cy={-34} r={6} fill={KRP.white} stroke={INK} strokeWidth={2.5} /><circle cx={-44} cy={-34} r={2.5} fill={INK} /></g>
      ) : (
        <path d="M -50 -34 Q -44 -30 -38 -34" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      )}
      {peek < 0.5 && <MzEZzz x={-30} y={-56} s={0.6} f={f} phase={phase} />}
    </g>
  );
};
const Mz098: React.FC<{ f: number }> = ({ f }) => {
  const winId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const cam = 1 + 0.3 * easeInOut(seg(f, 0, 30));
  const stretch = easeOut(seg(f, 18, 30));
  const spin = f > 46 ? (f - 46) * 12 : 0;
  const armL = f <= 46 ? lerp(8, 165, stretch) + Math.sin(f / 3) * 4 * stretch : 165 + spin;
  const armR = -armL;
  const hop = f > 46 ? -Math.abs(Math.sin((f - 46) / 4.5)) * 6 : -10 * stretch;
  const owl = seg(f, 36, 44);
  const henPeek = seg(f, 70, 76) * (1 - seg(f, 110, 116));
  return (
    <Frame f={f} seed={6098} bg={MP.nightDeep} dark>
      <defs>
        <clipPath id={winId}><rect x={860} y={470} width={280} height={270} /></clipPath>
      </defs>
      <g transform={`translate(1000 580) scale(${cam}) translate(-1000 -580)`}>
        {/* 空 */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={-60} y={-60 + i * 80} width={2040} height={82} fill={mixC(MP.nightDeep, MP.night, i / 9)} />
        ))}
        {Array.from({ length: 46 }, (_, i) => (
          <circle key={i} cx={rnd(1, i) * 1920} cy={rnd(2, i) * 420} r={i % 4 === 0 ? 3.4 : 2.2} fill="#FFF6D8" opacity={0.5 + 0.5 * Math.sin(f / 9 + i * 1.7)} />
        ))}
        <circle cx={1620} cy={150} r={56} fill="#F7F0D2" />
        <circle cx={1644} cy={134} r={50} fill={MP.nightDeep} />
        {/* 遠くの雪の丘と家 */}
        <path d="M -60 660 Q 300 560 700 640 Q 1100 700 1500 600 Q 1800 560 1980 620 L 1980 820 L -60 820 Z" fill={C.snowShade} stroke={INK} strokeWidth={4} />
        {[[90, 640], [1520, 610], [1800, 630]].map(([hx, hy], i) => (
          <g key={i}>
            <rect x={hx} y={hy - 50} width={90} height={50} fill={C.nightHouseDark} stroke={INK} strokeWidth={3} />
            <path d={`M ${hx - 10} ${hy - 48} L ${hx + 45} ${hy - 90} L ${hx + 100} ${hy - 48} Z`} fill={C.snow} stroke={INK} strokeWidth={3} />
            <rect x={hx + 34} y={hy - 36} width={20} height={20} fill={C.windowDark} />
          </g>
        ))}
        {/* 地面の雪 */}
        <path d="M -60 790 Q 500 770 1000 790 Q 1500 806 1980 784 L 1980 1140 L -60 1140 Z" fill={C.snow} stroke={INK} strokeWidth={4} />
        {/* 窓の光が雪に落ちる */}
        <path d="M 860 800 L 1140 800 L 1260 1000 L 740 1000 Z" fill={C.lampLit} opacity={0.32 + 0.04 * Math.sin(f / 5)} />
        {/* 左の家 (まっ暗) と屋根の雪だるま */}
        <g>
          <rect x={180} y={540} width={380} height={260} fill={C.nightHouse} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={180} y1={570 + i * 30} x2={560} y2={570 + i * 30} stroke={C.nightHouseDark} strokeWidth={3} />)}
          <path d="M 150 548 L 370 400 L 590 548 Z" fill={C.nightHouseDark} stroke={INK} strokeWidth={5} />
          <path d="M 156 544 L 370 404 L 584 544 Q 520 520 470 536 Q 420 516 370 530 Q 300 512 250 534 Q 200 520 156 544 Z" fill={C.snow} stroke={INK} strokeWidth={3} />
          {[[230, 600], [440, 600]].map(([wx, wy]) => (
            <g key={wx}>
              <rect x={wx} y={wy} width={80} height={90} fill={C.windowDark} stroke={INK} strokeWidth={4} />
              <path d={`M ${wx + 40} ${wy} L ${wx + 40} ${wy + 90} M ${wx} ${wy + 45} L ${wx + 80} ${wy + 45}`} stroke={MP.woodDark} strokeWidth={4} />
              <rect x={wx - 6} y={wy + 88} width={92} height={10} fill={C.snow} stroke={INK} strokeWidth={2.5} />
            </g>
          ))}
          <rect x={340} y={700} width={64} height={100} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
          {/* 雪だるま (屋根の上で寝ている) */}
          <g transform="translate(350 460) rotate(-10)">
            <circle cx={0} cy={0} r={40} fill={C.snow} stroke={INK} strokeWidth={4} />
            <circle cx={0} cy={-56} r={28} fill={C.snow} stroke={INK} strokeWidth={4} />
            <path d="M -12 -58 q 5 4 10 0 M 4 -58 q 5 4 10 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d="M 0 -50 L 22 -46 L 0 -44 Z" fill={KRP.orange} stroke={INK} strokeWidth={2} />
            <path d="M -26 -72 Q -10 -112 30 -100 Q 14 -92 26 -76 Z" fill={KRP.red} stroke={INK} strokeWidth={3} />
            <path d="M -22 -80 L 22 -84" stroke={KRP.white} strokeWidth={5} />
            <circle cx={34} cy={-100} r={8} fill={KRP.white} stroke={INK} strokeWidth={2.5} />
            <circle cx={0} cy={-8} r={4} fill={INK} /><circle cx={0} cy={10} r={4} fill={INK} />
          </g>
          <MzEZzz x={376} y={370} s={0.9} f={f} phase={1} />
        </g>
        {/* 裸の木とフクロウ */}
        <g>
          <path d="M 630 800 L 640 520 Q 642 440 620 360 M 640 560 Q 700 500 760 470 M 636 470 Q 590 420 540 400 M 628 400 Q 660 350 700 330 M 700 460 L 740 430" stroke="#4A3A30" strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M 630 800 L 640 520 Q 642 440 620 360 M 640 560 Q 700 500 760 470 M 636 470 Q 590 420 540 400" stroke={INK} strokeWidth={4} fill="none" opacity={0.5} />
          <path d="M 680 492 Q 720 474 758 470 Q 722 488 690 500 Z M 560 404 Q 590 410 610 426" stroke={C.snow} strokeWidth={8} fill="none" strokeLinecap="round" />
          <MzEOwl x={700} y={440} s={1} f={f} wake={owl} />
          {owl > 0 && (
            <text x={760} y={380} fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.red} stroke={INK} strokeWidth={4}
              paintOrder="stroke" opacity={owl} transform={`rotate(10 760 380)`}>!?</text>
          )}
        </g>
        {/* まん中の家 (1軒だけ明るい) */}
        <g>
          <rect x={940} y={300} width={50} height={110} fill={MP.brickDark} stroke={INK} strokeWidth={4} />
          <rect x={934} y={290} width={62} height={18} fill={C.snow} stroke={INK} strokeWidth={3} />
          <MzEPuff x={980 + Math.sin(f / 20) * 6} y={250 - (f % 60) * 0.6} r={22} color={C.smokeLight} o={0.6} f={f} />
          <rect x={760} y={450} width={480} height={350} fill={C.nightHouse} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 11 }, (_, i) => <line key={i} x1={760} y1={478 + i * 30} x2={1240} y2={478 + i * 30} stroke={C.nightHouseDark} strokeWidth={3} />)}
          <path d="M 720 458 L 1000 300 L 1280 458 Z" fill={C.nightHouseDark} stroke={INK} strokeWidth={5} />
          <path d="M 726 454 L 1000 304 L 1274 454 Q 1200 430 1150 446 Q 1090 424 1030 440 Q 960 420 900 442 Q 820 424 726 454 Z" fill={C.snow} stroke={INK} strokeWidth={3} />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${780 + i * 54} 458 l 6 ${18 + (i % 3) * 10} l 6 ${-18 - (i % 3) * 10} Z`} fill={KRP.blueSoft} stroke={INK} strokeWidth={2} />)}
          {/* 窓の中 */}
          <g clipPath={`url(#${winId})`}>
            <rect x={860} y={470} width={280} height={270} fill="#F2CF84" />
            <rect x={860} y={470} width={280} height={60} fill="#E9BE6E" />
            <rect x={1076} y={560} width={56} height={150} fill={MP.woodDark} opacity={0.5} />
            <Flame x={1100} y={556} s={0.8} f={f} glow={1} />
            <rect x={1092} y={556} width={16} height={40} fill="#F4EEDC" stroke={INK} strokeWidth={2.5} />
            <path d="M 860 700 Q 920 660 980 700 L 980 740 L 860 740 Z" fill="#E4E0D6" stroke={INK} strokeWidth={3} />
            <MzEPerson x={1000} y={770 + hop} s={0.75} f={f} back coat={C.coatBlue} cloth={C.coatBlue} clothDark={C.navyDark}
              backHair="#8C8478" queue hat="tricorn" arms={[armL, armR]} armCloth={C.coatBlue} />
            {f > 22 && (
              <g opacity={0.6}>
                <path d="M 900 650 A 90 90 0 0 1 930 570" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
                <path d="M 1100 650 A 90 90 0 0 0 1070 570" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
          <rect x={860} y={470} width={280} height={270} fill="none" stroke={MP.woodDark} strokeWidth={12} />
          <path d="M 1000 470 L 1000 740 M 860 605 L 1140 605" stroke={MP.woodDark} strokeWidth={6} opacity={0.75} />
          <rect x={860} y={470} width={280} height={270} fill="none" stroke={INK} strokeWidth={4} />
          <rect x={846} y={738} width={308} height={18} fill={C.snow} stroke={INK} strokeWidth={3} />
          <circle cx={1000} cy={605} r={210} fill={MP.glow} opacity={0.1 + 0.03 * Math.sin(f / 4)} />
        </g>
        <TagPlate x={1262} y={520} text="4:00" size={40} t={seg(f, 14, 22)} />
        {/* 鶏小屋 */}
        <g>
          <rect x={1340} y={620} width={300} height={180} fill={MP.woodDark} stroke={INK} strokeWidth={5} />
          <rect x={1370} y={650} width={240} height={140} fill="#2A2018" stroke={INK} strokeWidth={4} />
          <path d="M 1316 630 L 1490 540 L 1664 630 Z" fill={MP.wood} stroke={INK} strokeWidth={5} />
          <path d="M 1322 626 L 1490 544 L 1658 626 Q 1580 606 1490 614 Q 1400 604 1322 626 Z" fill={C.snow} stroke={INK} strokeWidth={3} />
          <line x1={1374} y1={736} x2={1606} y2={736} stroke={MP.woodLight} strokeWidth={8} />
          <MzEHen x={1420} y={714} s={0.6} f={f} phase={0} />
          <MzEHen x={1500} y={714} s={0.68} f={f} phase={1} boss peek={henPeek} />
          <MzEHen x={1580} y={714} s={0.6} f={f} phase={2} />
          <path d="M 1640 800 L 1640 700 L 1700 700" stroke={MP.woodDark} strokeWidth={8} fill="none" />
        </g>
        {/* 足あとと柵 */}
        {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={1100 + i * 50} cy={880 + (i % 2) * 20} rx={10} ry={6} fill={C.snowShade} />)}
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={60 + i * 34} y={790} width={14} height={70} fill={MP.woodDark} stroke={INK} strokeWidth={2.5} />)}
        {/* 降る雪 */}
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={i} cx={(rnd(3, i) * 2000 + Math.sin(f / 14 + i) * 14) - 40} cy={(rnd(4, i) * 1100 + f * (1.2 + rnd(5, i))) % 1100} r={3 + rnd(6, i) * 2.5} fill={C.snow} opacity={0.85} />
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #99 日本では、1899年、のちのセイコー、精工舎が、国産で初めての目覚まし時計を作ります。
// 格: 山 / seed 6099
// 絵: どこ: 明治の時計工場の作業場 (木の窓・長い作業台・天井の動力の革ベルト・工具・部品の木箱。看板や社名・ロゴは描かない)。演出: 主役は職人の手の上の、組み上がったばかりの丸い目覚まし時計 (2本の脚・上にベル・ゼンマイのつまみ)。精工舎の職人 (明治の男性・作業着・はちまき・丸眼鏡、名前は書かない) が、ピンセットで最後の小さな歯車をはめ込み、つまみを巻く (腕は2本、pose で左手に時計、右手にピンセット)。ジリリと初めて鳴った瞬間、作業台の仲間の職人たち (全員男性) が手を止めて一斉に振り向き、ひとりがばんざいする。年代札「1899年」と小札「国産初」。カメラは手元の超大写しから作業場へ引く。動き: f0-50 歯車をはめる / f50-70 巻く / f70 ジリリ / f75-130 引き・振り向く・ばんざい
// どこ: 明治の時計工場の作業場。板壁・格子の木の窓・天井の動力の軸と革ベルト・奥の作業台の小さな旋盤・壁の工具掛け・
//       手前の作業台 (歯車の皿・文字盤・油さし・部品の木箱・ルーペ)。看板・社名・ロゴは描かない
// 演出: 職人 (はちまき・丸眼鏡・藍の作業着) の左手の上の、組み上がる直前の目覚まし時計 (実物大)。右手のピンセットで最後の歯車をはめ、
//       文字盤がはまり、横のつまみを巻くと、ジリリと初めて鳴る。奥で背を向けていた仲間4人 (全員男性) が一斉に振り向き、ひとりがばんざい
// 動き: f0-12 歯車をはめる (超大写し) / f12-16 文字盤 / f16-26 巻く / f26 鳴る / f20-40 引き / f30 仲間が振り向く / f34- ばんざい / f70- 鳴りやんで笑顔
const Mz099: React.FC<{ f: number }> = ({ f }) => {
  const gearIn = easeOut(seg(f, 2, 12));
  const dial = seg(f, 12, 16);
  const wind = f < 16 ? 0 : Math.min(f - 16, 10) * 40;
  const ring = f < 26 ? 0 : 1 - seg(f, 72, 80);
  const pull = easeInOut(seg(f, 20, 40));
  const S = lerp(4.6, 2.2, pull);
  const cx = lerp(934, 960, pull), cy = lerp(806, 740, pull);
  const turned = f >= 30;
  const wow = f >= 30 && f < 36;
  const clockX = 922, clockY = 798;
  const ck = 32;
  // ピンセットの先 (歯車の位置へ)
  const gearPos: [number, number] = [clockX + lerp(10, 20, gearIn) * (ck / 60), clockY + lerp(-60, -22, gearIn) * (ck / 60)];
  const twTip: [number, number] = f < 14 ? gearPos : [clockX + 20, clockY - 30 - seg(f, 12, 18) * 10];
  const mates: { x: number; banzai?: boolean; ph: number }[] = [
    { x: 640, ph: 1 }, { x: 790, ph: 2 }, { x: 1140, ph: 3, banzai: true }, { x: 1290, ph: 4 },
  ];
  return (
    <Frame f={f} seed={6099} bg={C.plank}>
      <g transform={`translate(960 540) scale(${S}) translate(${-cx} ${-cy})`}>
        {/* 板壁 */}
        <rect x={380} y={440} width={1160} height={600} fill={C.plank} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={380 + i * 40} y1={440} x2={380 + i * 40} y2={860} stroke={C.plankDark} strokeWidth={2} opacity={0.6} />)}
        {/* 格子の木の窓 (朝の光) */}
        {[540, 1060].map((wx) => (
          <g key={wx}>
            <rect x={wx} y={520} width={320} height={170} fill="#EAF2F2" stroke={INK} strokeWidth={4} />
            <rect x={wx} y={520} width={320} height={60} fill="#D6E8EE" />
            {Array.from({ length: 7 }, (_, i) => <line key={i} x1={wx + 40 + i * 40} y1={520} x2={wx + 40 + i * 40} y2={690} stroke={MP.woodDark} strokeWidth={4} />)}
            {[0, 1, 2].map((i) => <line key={`h${i}`} x1={wx} y1={562 + i * 42} x2={wx + 320} y2={562 + i * 42} stroke={MP.woodDark} strokeWidth={4} />)}
            <rect x={wx - 8} y={686} width={336} height={12} fill={MP.wood} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* 光の筋 */}
        <path d="M 560 520 L 860 520 L 980 860 L 660 860 Z" fill={KRP.white} opacity={0.12} />
        {/* 工具掛け */}
        <rect x={880} y={540} width={160} height={150} fill={C.plankDark} stroke={INK} strokeWidth={3} />
        {[900, 930, 960, 990, 1020].map((tx2, i) => (
          <g key={tx2}>
            <circle cx={tx2} cy={556} r={3} fill={INK} />
            <rect x={tx2 - 3} y={560} width={6} height={50 + (i % 2) * 20} fill={i % 2 ? KRP.silver : MP.wood} stroke={INK} strokeWidth={2} />
          </g>
        ))}
        {/* 天井の動力の軸と革ベルト */}
        <rect x={380} y={496} width={1160} height={10} fill={MP.iron} stroke={INK} strokeWidth={2.5} />
        {[700, 1220].map((px) => (
          <g key={px}>
            <circle cx={px} cy={501} r={16} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
            <line x1={px - 14} y1={505} x2={px - 14} y2={752} stroke="#6A4A30" strokeWidth={6} strokeDasharray="14 8" strokeDashoffset={-f * 3} />
            <line x1={px + 14} y1={505} x2={px + 14} y2={752} stroke="#6A4A30" strokeWidth={6} strokeDasharray="14 8" strokeDashoffset={f * 3} />
            <circle cx={px} cy={756} r={18} fill={MP.ironLight} stroke={INK} strokeWidth={3} />
            <line x1={px} y1={756} x2={px + Math.cos(f / 3) * 14} y2={756 + Math.sin(f / 3) * 14} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* 奥の作業台 */}
        <rect x={380} y={770} width={1160} height={100} fill={MP.wood} stroke={INK} strokeWidth={4} />
        <rect x={380} y={764} width={1160} height={12} fill={MP.woodLight} stroke={INK} strokeWidth={3} />
        {/* 仲間の職人 (最初は背中、f30 で振り向く) */}
        {mates.map((m) => turned ? (
          <MzEPerson key={m.x} x={m.x} y={900} s={0.7} f={f} phase={m.ph} cloth={C.indigo} clothDark={C.indigoDark}
            hat={m.ph % 2 ? "hachimaki" : "none"} face={wow ? "surprised" : "joy"} pose={m.banzai && f >= 34 ? "banzai" : "stand"}
            gaze={[m.x < 960 ? 5 : -5, 3]} lean={m.x < 960 ? 4 : -4} />
        ) : (
          <MzEPerson key={m.x} x={m.x} y={900} s={0.7} f={f} phase={m.ph} cloth={C.indigo} clothDark={C.indigoDark}
            back arms={[-24, 24]} armCloth={C.indigo} hands={false} hat={m.ph % 2 ? "hachimaki" : "none"} />
        ))}
        {/* 振り向いた瞬間の線 */}
        {f >= 30 && f < 38 && mates.map((m) => (
          <g key={`w${m.x}`} opacity={1 - seg(f, 30, 38)}>
            <path d={`M ${m.x - 50} 690 Q ${m.x} 670 ${m.x + 50} 690`} stroke={INK} strokeWidth={3} fill="none" />
            <path d={`M ${m.x - 40} 676 Q ${m.x} 656 ${m.x + 40} 676`} stroke={INK} strokeWidth={3} fill="none" />
          </g>
        ))}
        {/* 主役の職人 */}
        <MzEPerson x={960} y={920} s={1} f={f} phase={0} cloth={C.indigo} clothDark={C.indigoDark} glasses hat="hachimaki"
          face={f < 26 ? "normal" : f < 34 ? "surprised" : "joy"} gaze={[-5, 6]} arms={[-30, 30]} armCloth={C.indigo} />
        {/* 時計が鳴る光 */}
        {ring > 0 && (
          <g opacity={ring}>
            <circle cx={clockX} cy={clockY} r={46 + Math.sin(f / 2) * 3} fill={MP.glow} opacity={0.45} />
            {Array.from({ length: 10 }, (_, i) => {
              const a = rad(i * 36 + f * 2);
              return <line key={i} x1={clockX + Math.cos(a) * 34} y1={clockY + Math.sin(a) * 34} x2={clockX + Math.cos(a) * 52} y2={clockY + Math.sin(a) * 52} stroke={MP.brass} strokeWidth={3} strokeLinecap="round" />;
            })}
          </g>
        )}
        <MzEMeijiClock x={clockX} y={clockY} r={ck} f={f} ring={ring} dial={dial} wind={wind} gearIn={gearIn} minutes={6 * 60} />
        {/* ピンセット (右手から時計へ) */}
        {f < 40 && (
          <g opacity={1 - seg(f, 34, 40)}>
            <path d={`M 990 846 L ${twTip[0] + 2} ${twTip[1]}`} stroke={KRP.silver} strokeWidth={3.5} strokeLinecap="round" />
            <path d={`M 994 842 L ${twTip[0] + 5} ${twTip[1] - 1}`} stroke={INK} strokeWidth={1.2} />
          </g>
        )}
        {/* 手前の作業台と小物 */}
        <rect x={380} y={860} width={1160} height={200} fill={MP.wood} stroke={INK} strokeWidth={5} />
        <rect x={380} y={852} width={1160} height={14} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        <ellipse cx={720} cy={862} rx={60} ry={12} fill={KRP.white} stroke={INK} strokeWidth={3} />
        {Array.from({ length: 6 }, (_, i) => <MzEGear key={i} x={684 + i * 14} y={860 - (i % 2) * 3} r={6} n={7} rot={i * 20} sw={1.5} />)}
        {[[812, 860], [846, 864]].map(([dx, dy], i) => (
          <g key={i} transform={`translate(${dx} ${dy}) scale(1 0.45)`}>
            <circle r={16} fill={KRP.white} stroke={INK} strokeWidth={2.5} />
            {Array.from({ length: 12 }, (_, j) => <line key={j} x1={Math.sin(rad(j * 30)) * 11} y1={-Math.cos(rad(j * 30)) * 11} x2={Math.sin(rad(j * 30)) * 14} y2={-Math.cos(rad(j * 30)) * 14} stroke={INK} strokeWidth={1.5} />)}
          </g>
        ))}
        <path d="M 1150 860 L 1158 830 L 1172 830 L 1180 860 Z M 1165 830 L 1190 806" fill={KRP.silver} stroke={INK} strokeWidth={3} />
        <rect x={1240} y={826} width={110} height={36} fill={C.crate} stroke={INK} strokeWidth={3} />
        {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={1256 + i * 20} cy={826} r={6} fill={MP.brass} stroke={INK} strokeWidth={1.5} />)}
        <circle cx={1090} cy={858} r={12} fill="#DDE8EA" stroke={INK} strokeWidth={3} />
        <line x1={1100} y1={866} x2={1124} y2={862} stroke={INK} strokeWidth={4} />
      </g>
      {/* 札 (画面に固定) */}
      <TagPlate x={1660} y={140} text="1899年" size={50} t={seg(f, 4, 12)} />
      <TagPlate x={1598} y={236} text="国産初" size={42} t={seg(f, 30, 38)} fill={KRP.yellow} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #100 1915年には、イギリスから60万個、フランスから30万個の注文が来ました。
// 格: 山 / seed 6100
// 絵: どこ: #99 の明治の時計工場の出荷場 (木の床・積み上げた木箱・荷車・窓の外に港のクレーン)。演出: 主役は木箱の山。郵便配達の男性が電報の束を持って駆け込み、職人の机に**ドサッ**と置く。電報の封筒にはイギリスとフランスの国旗の小さなマーク。そのとたん、出荷場の木箱がにょきにょき積み上がっていき、左の山 (国旗マーク・イギリス) が天井まで届き、右の山 (フランス) がその半分の高さまで伸びる。山の前に数字札「60万個」「30万個」。職人 (はちまき・眼鏡) が眼鏡をずり落として見上げる (face="surprised")。年代札「1915年」。カメラは木箱の山に合わせて下から上へスクロール。動き: f0-30 電報が届く / f30-120 箱が積み上がる / f120 眼鏡がずり落ちる
// どこ: #99 と同じ時計工場の出荷場。板壁・天井の梁・板の床・右の窓の外に港 (クレーン・蒸気船・海)・手前に荷車
// 演出: 郵便配達の男 (紺の制服・帽子・かばん) が駆け込み、電報の束 (封筒に英仏の小さな国旗) を職人の机にドサッと投げ置く。
//       とたんに木箱がにょきにょき積み上がり、左の山 (英国旗の印) は天井まで10段、右の山 (仏国旗の印) はその半分の5段。
//       山の前に「60万個」「30万個」(同じ高さ)。職人 (はちまき・眼鏡) が見上げて眼鏡がずり落ちる。配達の男も口をあんぐり
// 動き: f0-10 駆け込む / f10-13 ドサッ / f12-40 箱が積み上がる / f12-42 カメラが下から上へ引きながら上がる / f36-42 札 / f38-44 眼鏡 / 以後 山がゆらゆら
const MzECrate: React.FC<{ x: number; y: number; w?: number; h?: number; flag: "uk" | "fr" }> = ({ x, y, w = 156, h = 93, flag }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={C.crate} stroke={INK} strokeWidth={4} />
    <line x1={x} y1={y + h / 3} x2={x + w} y2={y + h / 3} stroke={C.crateDark} strokeWidth={2.5} />
    <line x1={x} y1={y + (2 * h) / 3} x2={x + w} y2={y + (2 * h) / 3} stroke={C.crateDark} strokeWidth={2.5} />
    <rect x={x} y={y} width={14} height={h} fill={C.crateDark} stroke={INK} strokeWidth={2.5} />
    <rect x={x + w - 14} y={y} width={14} height={h} fill={C.crateDark} stroke={INK} strokeWidth={2.5} />
    {flag === "uk" ? <MzEFlagUK x={x + w / 2} y={y + h / 2} w={52} /> : <MzEFlagFR x={x + w / 2} y={y + h / 2} w={46} />}
  </g>
);
const Mz100: React.FC<{ f: number }> = ({ f }) => {
  const run = easeOut(seg(f, 0, 10));
  const px = lerp(-160, 640, run);
  const throwT = seg(f, 10, 13);
  const landed = f >= 13;
  const bx = landed ? 850 : lerp(px + 70, 850, throwT);
  const by = landed ? 706 : lerp(760, 706, throwT) - Math.sin(throwT * Math.PI) * 80;
  const dosa = seg(f, 13, 24);
  const cam = easeInOut(seg(f, 12, 42));
  const S = lerp(1.15, 0.88, cam);
  const cx = lerp(880, 960, cam), cy = lerp(700, 420, cam);
  const slip = easeOut(seg(f, 38, 44));
  const sway = f > 42 ? Math.sin((f - 42) / 16) * 0.6 : 0;
  const crateT = (row: number, col: number) => seg(f, 12 + row * 2.8 + col * 0.6, 15 + row * 2.8 + col * 0.6);
  const stack = (x0: number, rows: number, flag: "uk" | "fr", rot: number) => (
    <g transform={`rotate(${rot} ${x0 + 240} 860)`}>
      {Array.from({ length: rows }, (_, r) => [0, 1, 2].map((c) => {
        const t = crateT(r, c);
        if (t <= 0) return null;
        const dy = -(1 - easeOut(t)) * 50;
        return (
          <g key={`${r}-${c}`} opacity={clamp01(t * 3)}>
            <MzECrate x={x0 + c * 160} y={860 - (r + 1) * 97 + dy} flag={flag} />
          </g>
        );
      }))}
    </g>
  );
  return (
    <Frame f={f} seed={6100} bg={C.plank}>
      <g transform={`translate(960 540) scale(${S}) translate(${-cx} ${-cy})`}>
        {/* 板壁と梁 */}
        <rect x={-200} y={-260} width={2320} height={1130} fill={C.plank} />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-200 + i * 60} y1={-110} x2={-200 + i * 60} y2={860} stroke={C.plankDark} strokeWidth={3} opacity={0.5} />)}
        <rect x={-200} y={-260} width={2320} height={150} fill={MP.woodDark} />
        <rect x={-200} y={-150} width={2320} height={40} fill={MP.wood} stroke={INK} strokeWidth={5} />
        {[60, 1000, 1880].map((bx2) => <rect key={bx2} x={bx2} y={-110} width={44} height={970} fill={MP.wood} stroke={INK} strokeWidth={4} />)}
        {/* 窓の外の港 */}
        <g>
          <rect x={1450} y={150} width={400} height={370} fill="#CFE6F0" stroke={INK} strokeWidth={6} />
          <rect x={1450} y={400} width={400} height={120} fill={C.river} />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${1470 + i * 120 + (f % 40)} ${440 + i * 24} q 14 -8 28 0`} stroke={KRP.white} strokeWidth={3} fill="none" />)}
          <path d="M 1500 400 L 1500 230 L 1640 230 M 1500 260 L 1600 230 M 1620 230 L 1620 320" stroke={MP.iron} strokeWidth={8} fill="none" />
          <rect x={1600} y={318} width={40} height={30} fill={C.crate} stroke={INK} strokeWidth={3} />
          <path d="M 1680 400 L 1700 360 L 1830 360 L 1810 400 Z" fill={C.coatBlack} stroke={INK} strokeWidth={3} />
          <rect x={1740} y={320} width={22} height={40} fill={KRP.red} stroke={INK} strokeWidth={3} />
          <MzEPuff x={1760 - (f % 80) * 0.3} y={290 - (f % 80) * 0.4} r={20} color={C.smokeLight} o={0.7} f={f} />
          <path d="M 1650 150 L 1650 520 M 1450 335 L 1850 335" stroke={MP.woodDark} strokeWidth={10} />
          <rect x={1450} y={150} width={400} height={370} fill="none" stroke={INK} strokeWidth={6} />
        </g>
        {/* 床 */}
        <rect x={-200} y={860} width={2320} height={400} fill={C.plankDark} />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-200 + i * 100} y1={860} x2={-500 + i * 130} y2={1260} stroke={MP.woodDark} strokeWidth={3} opacity={0.6} />)}
        <line x1={-200} y1={860} x2={2120} y2={860} stroke={INK} strokeWidth={5} />
        {/* 木箱の山 (左=イギリス10段・右=フランス5段) */}
        {stack(160, 10, "uk", sway)}
        {stack(1240, 5, "fr", -sway * 0.7)}
        {/* 職人と机 */}
        <MzEPerson x={1040} y={815} s={1.1} f={f} cloth={C.indigo} clothDark={C.indigoDark} hat="hachimaki"
          face={landed ? "surprised" : "normal"} gaze={landed ? [0, -9] : [-4, 5]} lean={landed ? -3 : 0}>
          {/* 眼鏡 (ずり落ちる) */}
          <g transform={`translate(0 ${26 * slip}) rotate(${8 * slip} 0 -222)`} fill="none" stroke={INK} strokeWidth={4.5}>
            <circle cx={-24} cy={-222} r={22} />
            <circle cx={24} cy={-222} r={22} />
            <line x1={-2} y1={-226} x2={2} y2={-226} />
            <line x1={-46} y1={-228} x2={-60} y2={-234} />
            <line x1={46} y1={-228} x2={60} y2={-234} />
          </g>
          {slip > 0.5 && <path d="M 58 -250 q 8 12 0 18 q -8 -6 0 -18 Z" fill="#8EC6E6" stroke={INK} strokeWidth={2} />}
        </MzEPerson>
        <rect x={740} y={716} width={440} height={144} fill={MP.wood} stroke={INK} strokeWidth={5} />
        <rect x={726} y={704} width={468} height={18} fill={MP.woodLight} stroke={INK} strokeWidth={4} />
        <rect x={1100} y={672} width={70} height={34} fill={KRP.white} stroke={INK} strokeWidth={3} />
        <rect x={1140} y={656} width={14} height={50} fill={INK} transform="rotate(20 1147 681)" />
        {/* 電報の束 */}
        <g transform={`translate(${bx} ${by}) rotate(${landed ? -6 : throwT * 200})`}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 6 - 6} ${-i * 9})`}>
              <rect x={-60} y={-22} width={120} height={36} fill={C.paper} stroke={INK} strokeWidth={3.5} />
              <path d="M -60 -22 L 0 2 L 60 -22" stroke={INK} strokeWidth={2.5} fill="none" />
            </g>
          ))}
          <MzEFlagUK x={-36} y={-30} w={26} />
          <MzEFlagFR x={34} y={-30} w={24} />
          <path d="M -8 -44 L -8 14 M 8 -44 L 8 14" stroke={KRP.red} strokeWidth={3} />
        </g>
        {/* ドサッ (衝撃の線と土ぼこり) */}
        {dosa > 0 && dosa < 1 && (
          <g opacity={1 - dosa}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = rad(180 + i * 25.7);
              return <line key={i} x1={850 + Math.cos(a) * 80} y1={700 + Math.sin(a) * 50} x2={850 + Math.cos(a) * (110 + 40 * dosa)} y2={700 + Math.sin(a) * (70 + 30 * dosa)} stroke={INK} strokeWidth={5} strokeLinecap="round" />;
            })}
            {[-1, 1].map((sd) => <circle key={sd} cx={850 + sd * (70 + 40 * dosa)} cy={700} r={16 + 14 * dosa} fill={C.paperDark} stroke={INK} strokeWidth={2} />)}
          </g>
        )}
        {/* 郵便配達の男 */}
        <MzEPerson x={px} y={880} s={0.95} f={f} phase={2} cloth={C.navy} clothDark={C.navyDark} hat="kepi"
          pose={f < 12 ? "run" : "stand"} lean={f < 12 ? 10 : -4} face={f < 13 ? "normal" : "surprised"} gaze={f < 13 ? [5, 0] : [-3, -9]}>
          <path d="M -50 -156 L 50 -70" stroke={MP.woodDark} strokeWidth={8} />
          <rect x={30} y={-90} width={56} height={46} rx={6} fill={MP.wood} stroke={INK} strokeWidth={4} />
          {[0, 1, 2].map((i) => <circle key={i} cx={-30} cy={-140 + i * 26} r={5} fill={MP.brass} stroke={INK} strokeWidth={2} />)}
          {f >= 13 && <path d="M -82 -268 q -10 14 0 22 q 10 -8 0 -22 Z" fill="#8EC6E6" stroke={INK} strokeWidth={2.5} />}
        </MzEPerson>
        {f < 10 && [0, 1, 2].map((i) => <line key={i} x1={px - 90 - i * 30} y1={760 + i * 30} x2={px - 170 - i * 30} y2={760 + i * 30} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.6} />)}
        {/* 荷車 */}
        <g>
          <rect x={1700} y={850} width={300} height={34} fill={MP.wood} stroke={INK} strokeWidth={4} />
          <MzECrate x={1720} y={757} flag="fr" />
          <circle cx={1760} cy={900} r={40} fill={MP.woodLight} stroke={INK} strokeWidth={5} />
          <circle cx={1760} cy={900} r={8} fill={INK} />
          <path d="M 2000 866 L 2120 820" stroke={MP.woodDark} strokeWidth={10} />
        </g>
        {/* 札 (見くらべる2枚は同じ高さ) と国旗 */}
        <g opacity={seg(f, 32, 38)}>
          <MzEFlagUK x={400} y={500} w={110} />
          <MzEFlagFR x={1480} y={500} w={96} />
        </g>
        <TagPlate x={400} y={600} text="60万個" size={60} t={seg(f, 34, 40)} />
        <TagPlate x={1480} y={600} text="30万個" size={60} t={seg(f, 36, 42)} />
      </g>
      <TagPlate x={1650} y={130} text="1915年" size={50} t={seg(f, 2, 10)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #101 世界じゅうで、起こしたい人と、起こされたい人が、増えていたのです。
// 格: 図 / seed 6101
// 絵: どこ: #100 の出荷場の壁に掛かった、大きな古い世界地図 (明治の色刷りの地図・角が丸まる・画びょう)。演出: 図の主役は地図。地図の上のあちこちの町に、小さな目覚まし時計のマークが、ぽんぽんぽんと次々に咲いていく (ヨーロッパから始まって、世界に広がる)。マークひとつひとつから、ちっちゃな2人が出てくる: 時計を掲げて「起きろ」と腕を振る人 (帽子の男) と、布団で「起こして」と手を上げる人 (日本髪の女・ボンネットの女などを混ぜる)。地図の前で、#99 の職人が腕を組んでうんうんとうなずく。カメラは地図全体を見せながらゆっくり寄る。動き: f0-120 マークが咲いていく (10fごと) / 2人の小人が出てくる / f120 職人がうなずく
// どこ: #100 の出荷場の板壁に画びょうで留めた、明治の色刷りの世界地図 (大陸ごとに色・経緯線・飾り枠・方位の印・右下の角がめくれる)
// 演出: 町に小さな目覚まし時計の印がぽんぽん咲く。ロンドン・パリ・ベルリンから始まり、ニューヨーク・東京・ボンベイ・シドニー…と世界へ。
//       大きな町の印からは、ちっちゃな2人が出る: 時計を掲げる帽子の男と、布団から手を上げる女 (頭巾+茶色の髪)。
//       右下で #99 の職人が腕を組んでうんうんとうなずく。床ぎわに木箱
// 動き: f0-40 印が咲く (約3コマごと) / f45-140 さらに小さな町にも咲き続ける / f30- 職人がうなずく / ゆっくり寄る
const MZE_MAP = {
  eurasia: [[-9, 37], [-9, 43], [-2, 43.5], [-4.5, 48], [-1, 49.5], [2, 51], [5, 53], [8, 54], [8, 57], [10, 57.5], [8, 58], [5, 59], [5, 62], [10, 64], [14, 68], [19, 70], [25, 71], [30, 70], [33, 69], [41, 67], [44, 68], [60, 69], [70, 73], [80, 73], [100, 77], [113, 74], [130, 71], [140, 72], [160, 70], [170, 70], [180, 66], [172, 62], [163, 60], [162, 56], [156, 51], [156, 57], [152, 59], [143, 59], [137, 54], [141, 52], [140, 48], [135, 43], [130, 42.5], [129, 35], [126, 35], [126, 38], [121, 39], [121, 41], [118, 39], [122, 37], [120, 35], [121, 31], [122, 29], [119, 25], [114, 22], [109, 21], [106, 18], [109, 12], [106, 9], [103, 10], [100, 13], [99, 9], [100, 6], [103, 1.5], [101, 3], [98, 8], [98, 16], [94, 17], [92, 22], [87, 22], [80, 15], [80, 10], [77, 8], [73, 16], [72, 21], [67, 25], [62, 25], [57, 26], [56, 24.5], [59, 22.5], [52, 17], [45, 13], [43, 13], [39, 21], [35, 28], [32.5, 30], [35, 33], [36, 36.5], [30, 36.5], [27, 37], [26, 40], [23, 40], [23, 37], [20, 40], [19, 42], [13, 45.5], [12, 44], [16, 41], [18, 40], [16, 38], [12, 42], [10, 44], [8, 44], [3, 43], [0, 39], [-1, 37], [-5, 36], [-9, 37]],
  africa: [[-17, 21], [-17, 15], [-15, 11], [-8, 4.5], [-2, 5], [5, 6], [9, 4], [10, 1], [13, -6], [12, -17], [15, -27], [18, -34.5], [20, -35], [26, -34], [33, -26], [35, -24], [35, -20], [40, -16], [40, -10], [39, -5], [42, -1], [48, 5], [51, 11.5], [44, 11], [43, 12.5], [39, 17], [35, 24], [33, 28], [32.5, 30], [29, 31], [20, 31], [20, 32.5], [15, 32], [10, 35], [11, 37], [3, 36.8], [-2, 35], [-6, 36], [-10, 30], [-13, 27.5]],
  na: [[-168, 66], [-162, 70], [-156, 71.3], [-140, 69.5], [-128, 70], [-115, 68], [-100, 68], [-95, 72], [-85, 69], [-82, 66], [-90, 63], [-94, 59], [-92, 57], [-85, 55], [-80, 52], [-79, 55], [-77, 60], [-78, 62.5], [-73, 62], [-70, 59], [-65, 60], [-60, 55], [-56, 52], [-60, 47], [-65, 45], [-70, 43], [-70, 41.5], [-74, 40.5], [-76, 37], [-75.5, 35.2], [-81, 31], [-80, 27], [-80.5, 25], [-82, 27], [-83, 29.5], [-89, 30], [-94, 29.5], [-97, 26], [-97.5, 22], [-95, 18.5], [-91, 19], [-90, 21.4], [-87, 21.5], [-88, 16], [-84, 15.5], [-83.5, 11], [-79.5, 9], [-77.5, 8.3], [-80, 7.5], [-82, 8], [-86, 12], [-92, 14.5], [-96, 15.7], [-105, 19.5], [-105.5, 23], [-109, 26], [-112, 31], [-114.5, 31], [-110, 23], [-112, 24.5], [-114, 28], [-117, 32.5], [-120.5, 34.5], [-124, 40], [-124, 46.5], [-123, 49], [-127, 51], [-130, 54.5], [-135, 58], [-140, 60], [-147, 61], [-152, 59], [-158, 57], [-164, 55], [-158, 58.5], [-162, 60], [-165, 62.5], [-164.5, 64.5]],
  sa: [[-77.5, 8.3], [-75, 11], [-72, 12], [-71.5, 10.5], [-64, 10.5], [-61, 10], [-57, 6], [-52, 5], [-50, 1.5], [-48, -1], [-44, -2.5], [-38, -4], [-35, -7], [-35, -9], [-37, -12], [-39, -17.5], [-40, -21.5], [-44, -23], [-48, -25.5], [-48.5, -28], [-52, -31.5], [-53.5, -34], [-58, -34.5], [-57, -36.5], [-58, -38.5], [-62, -39], [-62, -41], [-65, -41], [-65, -45], [-67.5, -46.5], [-66, -48], [-69, -51], [-68.5, -52.5], [-70, -55], [-74, -52], [-75.5, -48], [-74, -44], [-73.5, -38], [-71.5, -30], [-70.3, -18], [-75, -15.5], [-76.5, -13], [-79, -8], [-81, -6], [-80, -2.5], [-80, 0], [-79, 1.5], [-77.5, 4]],
  greenland: [[-73, 78], [-60, 80], [-30, 80], [-20, 79], [-18, 76], [-22, 70], [-32, 68], [-40, 65], [-43, 60], [-48, 61], [-52, 65], [-54, 70], [-58, 75], [-66, 76.5]],
  baffin: [[-62, 66.5], [-66, 62], [-75, 65], [-80, 70], [-90, 73], [-78, 73], [-68, 70]],
  australia: [[114, -22], [114, -34], [117, -35], [124, -33.5], [131, -31.5], [135, -34.7], [138, -35], [140, -38], [146, -39], [150, -37.5], [153, -31], [153, -25], [146, -19], [142.5, -10.7], [141.5, -13], [140.5, -17.5], [136, -15], [137, -12], [131, -11.2], [129, -15], [126, -14], [122, -17], [119, -20]],
  gb: [[-5, 50], [1.5, 51], [1.7, 52.8], [0, 53.5], [-2, 55.5], [-2, 57.6], [-3, 58.6], [-5, 58.6], [-6, 57], [-5, 55], [-3, 54.5], [-3, 53.4], [-4.7, 52.8], [-4, 51.5], [-5.7, 50]],
  ireland: [[-6, 52], [-6, 54], [-7.5, 55.3], [-10, 54], [-10, 51.6]],
  iceland: [[-24, 65.5], [-22, 66.5], [-15, 66.5], [-13.5, 65], [-18, 63.4], [-22, 63.8]],
  japan: [[130, 31], [131, 33.8], [135, 34], [137, 34.6], [140, 35], [141, 38], [141.5, 41], [140, 40.5], [139.5, 38], [136.8, 37], [133, 35.5], [130.9, 34]],
  hokkaido: [[140, 41.5], [143, 42], [145.5, 43.3], [142, 45.5], [141, 43]],
  madagascar: [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  borneo: [[109, 1.5], [117, 7], [119, 5], [118, 1], [116, -4], [111, -3], [109, -1]],
  sumatra: [[95, 5.5], [98, 4], [106, -6], [102, -4], [97, 1]],
  java: [[105.5, -6], [114, -7], [114, -8.6], [106, -7.5]],
  guinea: [[131, -1], [141, -2.6], [150, -10.5], [143, -9], [138, -8], [132, -4]],
  phil: [[120, 18], [122, 18], [126, 7], [122, 7], [120, 14]],
  nz: [[172.7, -34.5], [178.5, -37.7], [177, -39.5], [175, -41.5], [173, -41], [171, -44], [167, -46.2], [169, -46.6], [173, -43.8], [174.5, -41.5], [173, -39], [174.5, -36.5]],
  cuba: [[-85, 22], [-78, 22.5], [-74, 20], [-77.5, 20], [-82, 22.5]],
  blackSea: [[28, 41], [28, 44], [30, 46], [33, 46], [36, 45], [41, 41.5], [36, 41.5], [30, 41]],
  caspian: [[47, 44], [49, 46.5], [53, 47], [53, 41], [54, 37], [50, 37], [49, 40], [47, 42]],
  baltic: [[10, 54], [14, 54], [20, 55], [21, 57], [24, 57.5], [24, 59.5], [30, 60], [22, 60.5], [21, 63], [25, 65.5], [21, 65], [17, 61], [19, 59], [16, 56], [12, 56]],
} as const;
const mzMapX = (lon: number) => 960 + lon * 3.88;
const mzMapY = (lat: number) => 140 + (80 - lat) * 4.14;
const mzPoly = (pts: readonly (readonly [number, number])[]) => "M " + pts.map(([lo, la]) => `${mzMapX(lo).toFixed(1)} ${mzMapY(la).toFixed(1)}`).join(" L ") + " Z";
const MZE_CITIES: { lon: number; lat: number; t: number; ox: number; oy: number; pair?: boolean }[] = [
  { lon: -0.1, lat: 51.5, t: 2, ox: -26, oy: -36 },
  { lon: 2.3, lat: 48.9, t: 5, ox: 10, oy: 34 },
  { lon: 13.4, lat: 52.5, t: 8, ox: 24, oy: -34 },
  { lon: -74, lat: 40.7, t: 11, ox: 0, oy: -34, pair: true },
  { lon: 139.7, lat: 35.7, t: 14, ox: 6, oy: -34, pair: true },
  { lon: 72.8, lat: 19, t: 17, ox: 0, oy: -34, pair: true },
  { lon: 31.2, lat: 30, t: 20, ox: 0, oy: -34 },
  { lon: 151.2, lat: -33.9, t: 23, ox: 0, oy: -34, pair: true },
  { lon: -58.4, lat: -34.6, t: 26, ox: 0, oy: -34, pair: true },
  { lon: -122.4, lat: 37.8, t: 29, ox: 0, oy: -34 },
  { lon: 121.5, lat: 31.2, t: 32, ox: -8, oy: -34 },
  { lon: 18.4, lat: -33.9, t: 35, ox: 0, oy: -34, pair: true },
  { lon: 37.6, lat: 55.8, t: 38, ox: 10, oy: -34 },
  { lon: -87.6, lat: 41.9, t: 40, ox: -10, oy: -34 },
  { lon: -43.2, lat: -22.9, t: 52, ox: 0, oy: -34 },
  { lon: -99, lat: 19.4, t: 62, ox: 0, oy: -34 },
  { lon: 88.4, lat: 22.6, t: 72, ox: 10, oy: -34 },
  { lon: 103.8, lat: 1.3, t: 82, ox: 0, oy: -34 },
  { lon: -77, lat: -12, t: 92, ox: 0, oy: -34 },
  { lon: -73.6, lat: 45.5, t: 102, ox: 26, oy: -40 },
  { lon: -3.7, lat: 40.4, t: 112, ox: -30, oy: 20 },
  { lon: 18, lat: 59.3, t: 122, ox: -6, oy: -34 },
  { lon: 145, lat: -37.8, t: 132, ox: -30, oy: 20 },
];
const MzEMapClock: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number }> = ({ x, y, s = 1, f, phase = 0 }) => {
  const w = Math.sin((f + phase * 9) / 2.2) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${w})`}>
      {[-1, 1].map((sd) => <circle key={sd} cx={sd * 9} cy={-14} r={7} fill={MP.brass} stroke={INK} strokeWidth={2.5} />)}
      <line x1={-8} y1={14} x2={-12} y2={20} stroke={INK} strokeWidth={3} />
      <line x1={8} y1={14} x2={12} y2={20} stroke={INK} strokeWidth={3} />
      <circle r={15} fill={MP.bell} stroke={INK} strokeWidth={3} />
      <circle r={10} fill={KRP.white} stroke={INK} strokeWidth={1.5} />
      <path d="M 0 0 L 0 -7 M 0 0 L 5 2" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
};
const Mz101: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.08 * easeInOut(seg(f, 0, 150));
  const nod = f > 30 ? Math.max(0, Math.sin((f - 30) / 4)) * 8 : 0;
  const lands: [keyof typeof MZE_MAP, string][] = [
    ["eurasia", C.mapAsia], ["africa", C.mapAfrica], ["na", C.mapNA], ["sa", C.mapSA], ["greenland", C.mapNA], ["baffin", C.mapNA],
    ["australia", C.mapOce], ["gb", C.mapEurope], ["ireland", C.mapEurope], ["iceland", C.mapEurope], ["japan", C.mapAsia], ["hokkaido", C.mapAsia],
    ["madagascar", C.mapAfrica], ["borneo", C.mapOce], ["sumatra", C.mapOce], ["java", C.mapOce], ["guinea", C.mapOce], ["phil", C.mapOce],
    ["nz", C.mapOce], ["cuba", C.mapNA],
  ];
  return (
    <Frame f={f} seed={6101} bg={C.plank}>
      <g transform={`translate(960 430) scale(${cam}) translate(-960 -430)`}>
        {/* 板壁 */}
        <rect x={-100} y={-100} width={2120} height={1300} fill={C.plank} />
        {Array.from({ length: 36 }, (_, i) => <line key={i} x1={-100 + i * 60} y1={-100} x2={-100 + i * 60} y2={1200} stroke={C.plankDark} strokeWidth={3} opacity={0.5} />)}
        {/* 地図の紙 */}
        <path d="M 200 86 L 1724 86 L 1724 700 L 1660 770 L 200 770 Z" fill="#B58F5E" opacity={0.5} transform="translate(12 12)" />
        <path d="M 196 80 L 1724 80 L 1724 700 L 1654 770 L 196 770 Z" fill={C.mapPaper} stroke={INK} strokeWidth={6} />
        {/* めくれた右下の角 */}
        <path d="M 1724 700 L 1654 770 Q 1676 716 1724 700 Z" fill="#CDB98A" stroke={INK} strokeWidth={4} />
        <rect x={226} y={110} width={1468} height={636} fill="none" stroke={INK} strokeWidth={3} />
        <rect x={240} y={124} width={1440} height={608} fill="none" stroke={C.enji} strokeWidth={5} />
        {/* 海と経緯線 */}
        <rect x={260} y={140} width={1400} height={580} fill={C.mapSea} />
        <g stroke={C.riverDark} strokeWidth={1.5} opacity={0.6}>
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lo) => <line key={lo} x1={mzMapX(lo)} y1={140} x2={mzMapX(lo)} y2={720} />)}
          {[60, 30, 0, -30].map((la) => <line key={la} x1={260} y1={mzMapY(la)} x2={1660} y2={mzMapY(la)} strokeWidth={la === 0 ? 3 : 1.5} />)}
        </g>
        {/* 大陸 */}
        {lands.map(([k, col]) => <path key={k} d={mzPoly(MZE_MAP[k])} fill={col} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />)}
        {(["blackSea", "caspian", "baltic"] as const).map((k) => <path key={k} d={mzPoly(MZE_MAP[k])} fill={C.mapSea} stroke={INK} strokeWidth={2} />)}
        {/* 方位の印 */}
        <g transform="translate(500 620)">
          <circle r={44} fill={C.mapPaper} stroke={INK} strokeWidth={3} />
          <path d="M 0 -56 L 10 0 L 0 56 L -10 0 Z" fill={C.enji} stroke={INK} strokeWidth={2.5} />
          <path d="M -56 0 L 0 -10 L 56 0 L 0 10 Z" fill={C.mapPaper} stroke={INK} strokeWidth={2.5} />
          <text y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK}>北</text>
        </g>
        {/* 画びょう */}
        {[[214, 98], [1706, 98], [214, 752]].map(([qx, qy], i) => (
          <g key={i}><circle cx={qx} cy={qy} r={13} fill={KRP.red} stroke={INK} strokeWidth={3} /><circle cx={qx - 4} cy={qy - 4} r={4} fill={KRP.white} opacity={0.7} /></g>
        ))}
        {/* 目覚ましの印が咲く */}
        {MZE_CITIES.map((c, i) => {
          const t = seg(f, c.t, c.t + 5);
          if (t <= 0) return null;
          const X = mzMapX(c.lon), Y = mzMapY(c.lat);
          const ix = X + c.ox, iy = Y + c.oy;
          const pp = seg(f, c.t + 4, c.t + 12);
          return (
            <g key={i}>
              <line x1={X} y1={Y} x2={ix} y2={iy} stroke={INK} strokeWidth={2.5} opacity={t} />
              <circle cx={X} cy={Y} r={5} fill={KRP.red} stroke={INK} strokeWidth={2} />
              {/* ぽんと咲く花びらの光 */}
              {t < 1 && <circle cx={ix} cy={iy} r={18 + 26 * t} fill="none" stroke={MP.brass} strokeWidth={4} opacity={1 - t} />}
              <MzEMapClock x={ix} y={iy} s={pop(t)} f={f} phase={i} />
              {c.pair && pp > 0 && (
                <g opacity={clamp01(pp * 2)}>
                  {/* 起こしたい人 (帽子の男・時計を掲げる) */}
                  <MzEPerson x={ix - 34 - 12 * easeOut(pp)} y={iy + 36} s={0.17} f={f} phase={i} pose="raise" hat="bowler" cloth={C.navy} clothDark={C.navyDark} face="joy">
                    <g transform="translate(67 -250) scale(2.2)"><MzEMapClock x={0} y={0} s={1} f={f} phase={i + 3} /></g>
                  </MzEPerson>
                  {/* 起こされたい人 (布団から手を上げる女) */}
                  <MzEPerson x={ix + 36 + 12 * easeOut(pp)} y={iy + 36} s={0.17} f={f} phase={i + 1} pose="raise" fem="long" hat={i % 2 ? "kerchief" : "none"} cloth={C.rose} clothDark={C.roseDark} face="smile">
                    <rect x={-110} y={-120} width={220} height={124} rx={30} fill={i % 2 ? C.pink : KRP.blueSoft} stroke={INK} strokeWidth={14} />
                  </MzEPerson>
                </g>
              )}
            </g>
          );
        })}
        {/* 床ぎわの木箱 */}
        <MzECrate x={-20} y={860} flag="uk" />
        <MzECrate x={150} y={880} flag="fr" />
      </g>
      {/* 職人 (腕を組んでうなずく) */}
      <MzEPerson x={1810} y={942 + nod} s={0.8} f={f} cloth={C.indigo} clothDark={C.indigoDark} hat="hachimaki" glasses pose="armsFolded" face="smile" />
      {f > 30 && (
        <g opacity={0.7}>
          <path d={`M 1720 ${700 + nod} q -14 10 0 20`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M 1900 ${700 + nod} q 14 10 0 20`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #102 では、そんなにたくさんの人を、決まった時刻に起こしたかったのは、誰だったのか。
// 格: 山 / seed 6102
// 絵: どこ: 19世紀の夜明け前の、れんがの町の石畳の通り (ガス灯・霧・遠くに高い煙突)。演出: 通りの家の窓という窓から、目覚まし時計のジリリという音の線が飛び出し、寝ぼけまなこの人たち (男女を混ぜる: 男はハンチング帽・ベスト、女は長いスカートとエプロン・頭巾) が家から出てきて、みな同じ方向へぞろぞろ歩きだす。人の流れが向かう先の霧の奥から、大きな手 (黒い上着の袖・太い指) が画面の端からにゅっと伸び、金の懐中時計を鎖でぶら下げてちらつかせる。懐中時計の文字盤が霧の中でぎらりと光り、その上に大きな「?」。カメラは人の流れを追って奥へ寄る。動き: f0-40 ジリリと人が出る / f40-120 ぞろぞろ歩く / f100 手と懐中時計が伸びる / f130 「?」
// どこ: 19世紀の夜明け前、れんがの長屋が両側に並ぶ石畳の通り (一点透視)。ガス灯・霧・奥の霧の中に高い煙突
// 演出: 2階の窓という窓で目覚ましが鳴り (音の線)、戸口から寝ぼけまなこの女 (頭巾・茶色の髪・長いスカート・エプロン) と男 (ハンチング帽・ベスト) が出てくる。
//       男女まじりの人の列が、みな同じ奥の霧へぞろぞろ歩く (後ろ姿)。その先の霧の奥から、黒い上着の袖の大きな手がにゅっと伸び、
//       金の懐中時計を鎖でぶら下げてちらつかせる。文字盤がぎらりと光り、その横に大きな「？」
// 動き: f0-14 窓が鳴る・戸口から出る / 人の列はずっと奥へ流れる / f16-32 手が伸びる / f32- 時計が光る・揺れる / f36-42「？」/ 全体を奥へゆっくり寄る
const MZE_VP: [number, number] = [1250, 500];
const Mz102: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.12 * easeInOut(seg(f, 0, 194));
  const ringAmt = f < 40 ? 1 : 0.45 + 0.35 * Math.sin(f / 6);
  const handIn = easeOut(seg(f, 16, 32));
  const hx = lerp(1900, 1470, handIn), hy = lerp(-120, 300, handIn);
  const swing = Math.sin(f / 13) * 12;
  const glint = seg(f, 30, 36);
  // 左の長屋 (上端と下端の直線を消失点へ)
  const lTop = (x: number) => lerp(80, 430, (x + 40) / 1220);
  const lBot = (x: number) => lerp(910, 540, (x + 40) / 1220);
  const rTop = (x: number) => lerp(150, 430, (1960 - x) / 620);
  const rBot = (x: number) => lerp(910, 540, (1960 - x) / 620);
  const lHouses = [-40, 360, 640, 830, 960, 1050, 1110, 1150, 1180];
  const walkers = Array.from({ length: 9 }, (_, i) => {
    const p = ((i / 9) + f * 0.0026) % 1;
    const e = Math.pow(p, 0.75);
    const x0 = [760, 1080, 900, 1200, 820, 1010, 1150, 880, 960][i];
    return { i, p, x: lerp(x0, MZE_VP[0], e), y: lerp(905, MZE_VP[1] + 50, e), s: lerp(0.55, 0.07, e), fem: i % 2 === 0 };
  }).sort((a, b) => b.p - a.p);
  return (
    <Frame f={f} seed={6102} bg={MP.night}>
      <g transform={`translate(${MZE_VP[0]} ${MZE_VP[1]}) scale(${cam}) translate(${-MZE_VP[0]} ${-MZE_VP[1]})`}>
        {/* 空 (夜明け前) */}
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-100} y={-100 + i * 80} width={2120} height={82} fill={mixC(MP.nightDeep, "#6A6480", i / 7)} />)}
        {/* 奥の煙突 (霧の中) */}
        {[[1170, 160, 40], [1300, 120, 46], [1400, 220, 34]].map(([cx2, top, w], i) => (
          <g key={i} opacity={0.55}>
            <rect x={cx2 - w / 2} y={top} width={w} height={480 - top} fill="#4A4858" />
            <MzEPuff x={cx2 + 30 + (f % 100) * 0.4} y={top - 40 - (f % 100) * 0.3} r={34} color="#6A6878" o={0.7} f={f} phase={i} />
          </g>
        ))}
        {/* 歩道 */}
        <rect x={-100} y={500} width={2120} height={600} fill="#857A72" />
        {/* 石畳の通り */}
        <path d={`M -100 1100 L 2020 1100 L 1330 530 L 1180 530 Z`} fill="#6E6460" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => {
          const t = Math.pow(i / 11, 1.6);
          const y = lerp(540, 1100, t);
          const xl = lerp(1180, -100, t), xr = lerp(1330, 2020, t);
          return <line key={i} x1={xl} y1={y} x2={xr} y2={y} stroke="#4E4644" strokeWidth={2 + t * 4} />;
        })}
        {Array.from({ length: 14 }, (_, i) => <line key={`v${i}`} x1={lerp(1190, 1320, i / 13)} y1={532} x2={lerp(-100, 2020, i / 13)} y2={1100} stroke="#4E4644" strokeWidth={3} />)}
        {/* 左の長屋 */}
        {lHouses.slice(0, -1).map((x0, i) => {
          const x1 = lHouses[i + 1];
          const t0 = lTop(x0), b0 = lBot(x0), t1 = lTop(x1), b1 = lBot(x1);
          const P = (u: number, v: number): [number, number] => [lerp(x0, x1, u), lerp(lerp(t0, b0, v), lerp(t1, b1, v), u)];
          const quad = (u0: number, v0: number, u1: number, v1: number) => {
            const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1);
            return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]} L ${d[0]} ${d[1]} Z`;
          };
          const lit = (i + Math.floor(f / 50)) % 3 !== 1 || f < 60;
          const wc = P(0.3, 0.33);
          return (
            <g key={i}>
              <path d={quad(0, 0, 1, 1)} fill={i % 2 ? MP.brick : MP.brickDark} stroke={INK} strokeWidth={4} />
              {[0.2, 0.4, 0.6, 0.8].map((v) => { const a = P(0, v), b = P(1, v); return <line key={v} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={MP.mortar} strokeWidth={2} opacity={0.35} />; })}
              {/* 2階の窓 2つ */}
              <path d={quad(0.14, 0.2, 0.42, 0.46)} fill={lit ? C.lampLit : C.windowDark} stroke={INK} strokeWidth={3} />
              <path d={quad(0.58, 0.2, 0.86, 0.46)} fill={i % 2 ? C.lampLit : C.windowDark} stroke={INK} strokeWidth={3} />
              {/* 戸口 */}
              <path d={quad(0.55, 0.62, 0.8, 1)} fill={i < 2 ? "#2A2018" : MP.woodDark} stroke={INK} strokeWidth={3} />
              {/* 目覚ましの音 */}
              {lit && i < 6 && <MzESound x={wc[0]} y={wc[1]} r={30 * (1 - i * 0.13)} amt={ringAmt} f={f + i * 2} color={MP.glow} w={5 - i * 0.5} />}
              {lit && i < 4 && <MzEMapClock x={wc[0]} y={wc[1] + 6} s={1.2 - i * 0.25} f={f} phase={i} />}
            </g>
          );
        })}
        {/* 右の長屋 */}
        {[1960, 1700, 1520, 1420, 1360, 1330].slice(0, -1).map((x0, i, arr) => {
          const x1 = [1960, 1700, 1520, 1420, 1360, 1330][i + 1];
          void arr;
          const P = (u: number, v: number): [number, number] => [lerp(x0, x1, u), lerp(lerp(rTop(x0), rBot(x0), v), lerp(rTop(x1), rBot(x1), v), u)];
          const quad = (u0: number, v0: number, u1: number, v1: number) => {
            const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1);
            return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]} L ${d[0]} ${d[1]} Z`;
          };
          const wc = P(0.5, 0.33);
          return (
            <g key={i}>
              <path d={quad(0, 0, 1, 1)} fill={i % 2 ? MP.brickDark : MP.brick} stroke={INK} strokeWidth={4} />
              <path d={quad(0.2, 0.2, 0.7, 0.46)} fill={i % 2 ? C.windowDark : C.lampLit} stroke={INK} strokeWidth={3} />
              <path d={quad(0.3, 0.62, 0.6, 1)} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
              {i % 2 === 0 && <MzESound x={wc[0]} y={wc[1]} r={24} amt={ringAmt} f={f + 5} color={MP.glow} w={4} />}
            </g>
          );
        })}
        {/* ガス灯 */}
        {[[300, 900, 1], [760, 720, 0.62], [1010, 610, 0.36]].map(([lx, ly, ls], i) => (
          <g key={i}>
            <rect x={lx - 7 * ls} y={ly - 380 * ls} width={14 * ls} height={380 * ls} fill={MP.iron} stroke={INK} strokeWidth={3} />
            <path d={`M ${lx - 30 * ls} ${ly - 440 * ls} L ${lx + 30 * ls} ${ly - 440 * ls} L ${lx + 22 * ls} ${ly - 380 * ls} L ${lx - 22 * ls} ${ly - 380 * ls} Z`} fill="#F7E2A8" stroke={INK} strokeWidth={3} />
            <Flame x={lx} y={ly - 392 * ls} s={0.8 * ls} f={f} phase={i} glow={1.5} />
          </g>
        ))}
        {/* 霧 */}
        {[[400, 220, 0.12], [440, 150, 0.12], [470, 90, 0.14]].map(([fy, fh, fo], i) => (
          <ellipse key={i} cx={1255} cy={fy + fh / 2} rx={1400} ry={fh / 2} fill={C.fog} opacity={fo} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={((i * 380 + f * 0.8) % 2300) - 200} cy={470 + (i % 3) * 40} rx={260} ry={46} fill={C.fog} opacity={0.35} />
        ))}
        {/* 歩く人の列 (後ろ姿・男女まじり) */}
        {walkers.map((w) => (
          <g key={w.i} opacity={clamp01((1 - w.p) * 6) * clamp01(f / 6 + 0.4)}>
            {w.fem ? (
              <MzEPerson x={w.x} y={w.y} s={w.s} f={f} phase={w.i} back fem="long" hat="kerchief" cloth={C.enji} clothDark={C.enjiDark} skirt={C.enji} long />
            ) : (
              <MzEPerson x={w.x} y={w.y} s={w.s} f={f} phase={w.i} back hat="hunting" cloth={C.vestGray} clothDark={C.grayClothDark} />
            )}
          </g>
        ))}
        {/* 戸口から出てくる寝ぼけた2人 (正面) */}
        <MzEPerson x={lerp(250, 360, easeOut(seg(f, 0, 14)))} y={905} s={0.6} f={f} phase={3} fem="long" hat="kerchief" cloth={C.rose} clothDark={C.roseDark}
          skirt={C.rose} long apron sleepy={0.7} yawn={f % 60 < 36} gaze={[6, 0]} />
        <MzEPerson x={lerp(560, 640, easeOut(seg(f, 4, 18)))} y={850} s={0.48} f={f} phase={5} hat="hunting" cloth={C.shirt} clothDark={C.grayClothDark}
          vest={C.vestBrown} sleepy={0.8} gaze={[8, 0]} lean={4} />
        {/* 霧の奥から伸びる手と金の懐中時計 */}
        <g>
          <path d={`M ${hx + 40} ${hy - 40} L 2100 ${hy - 520} L 2100 ${hy - 260} L ${hx + 70} ${hy + 40} Z`} fill={C.coatBlack} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${hx + 20} ${hy - 50} L ${hx + 70} ${hy - 76} L ${hx + 110} ${hy + 20} L ${hx + 62} ${hy + 46} Z`} fill={KRP.white} stroke={INK} strokeWidth={4} />
          {/* 太い指の手 */}
          <g transform={`translate(${hx} ${hy}) rotate(-20)`}>
            <ellipse cx={0} cy={0} rx={62} ry={50} fill={C.skin} stroke={INK} strokeWidth={5} />
            {[-34, -12, 10, 32].map((fx, i) => <ellipse key={i} cx={fx} cy={44} rx={13} ry={22} fill={C.skin} stroke={INK} strokeWidth={4} />)}
            <ellipse cx={-56} cy={14} rx={18} ry={26} fill={C.skin} stroke={INK} strokeWidth={4} transform="rotate(30 -56 14)" />
          </g>
          <g transform={`rotate(${swing} ${hx - 10} ${hy + 56})`}>
            <path d={`M ${hx - 10} ${hy + 56} L ${hx - 10} ${hy + 150}`} stroke={MP.brass} strokeWidth={6} strokeDasharray="8 5" />
            <g transform={`translate(${hx - 10} ${hy + 214})`}>
              {glint > 0 && <circle r={120 + Math.sin(f / 3) * 8} fill={MP.glow} opacity={0.35 * glint} />}
              <circle cx={0} cy={-62} r={12} fill="none" stroke={MP.brass} strokeWidth={7} />
              <rect x={-9} y={-56} width={18} height={14} fill={MP.brassDark} stroke={INK} strokeWidth={3} />
              <circle r={62} fill={MP.brass} stroke={INK} strokeWidth={6} />
              <circle r={50} fill="#FBF6E8" stroke={INK} strokeWidth={4} />
              {Array.from({ length: 12 }, (_, i) => <line key={i} x1={Math.sin(rad(i * 30)) * 40} y1={-Math.cos(rad(i * 30)) * 40} x2={Math.sin(rad(i * 30)) * 46} y2={-Math.cos(rad(i * 30)) * 46} stroke={INK} strokeWidth={i % 3 ? 2 : 4} />)}
              <line x1={0} y1={0} x2={0} y2={-34} stroke={INK} strokeWidth={4} strokeLinecap="round" />
              <line x1={0} y1={0} x2={0} y2={22} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              <circle r={5} fill={INK} />
              <path d="M -34 -20 Q -26 -36 -10 -40" stroke={KRP.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
              {/* ぎらりの光 */}
              {glint > 0 && (
                <g transform={`translate(40 -40) scale(${glint * (0.8 + 0.3 * Math.sin(f / 2.5))})`}>
                  <path d="M 0 -40 L 8 -8 L 40 0 L 8 8 L 0 40 L -8 8 L -40 0 L -8 -8 Z" fill={KRP.white} stroke={MP.brass} strokeWidth={3} />
                </g>
              )}
            </g>
          </g>
        </g>
        <QMark x={1200} y={330} s={1.4} f={f} t={seg(f, 36, 42)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #103 第4章、工場が、起きる時刻を決めた。
// 格: 山 / seed 6103
// 絵: 章扉。どこ: KoujouMon (gate=1, hands=6時ちょうど, smoke=1) の夜明け前の全景。れんがの工場・高い煙突から黒い煙・鉄の門・門の上の大きな時計。演出: 門の上の時計の長い針が「カチッ」と12に届いた瞬間、煙突の煙がもくもく太くなり、鉄の門が左右にギギーッと開く。門の前には、男女の工場の人たち (男: ハンチング帽・ベスト・腕まくり / 女: 長いスカートとエプロン・頭巾) が、あくびをしながら並んでいる。ChapterDoor num=4 title="工場が、起きる時刻を決めた。" を画面の右寄りに置き、門と時計は左寄り。カメラは門の上の時計からゆっくり引く。動き: f0-30 針が動く / f30 カチッ / f30-90 煙が太くなる・門が開く / 人があくび
// どこ: 共有の舞台 KoujouMon (イギリスの工場の門) の夜明け前。門と時計は画面の左寄り、右に章の題字
// 演出: 門の上の大きな時計の長い針が、じりじり進んで「カチッ」と12に届く (6:00)。その瞬間、煙突の煙がもくもく太くなり、鉄の門がギギーッと開く。
//       門の前には男女の工場の人4人 (男=ハンチング帽・ベスト・腕まくり / 女=頭巾・茶色の髪・長いスカート・エプロン) があくびをしながら並ぶ
// 動き: f0-22 針が進む (時計の大写し) / f22 カチッ / f0-36 カメラが時計から引く / f22-40 煙が太る / f24-42 門が開く / あくびはずっと交代で
const Mz103: React.FC<{ f: number }> = ({ f }) => {
  const pull = easeInOut(seg(f, 0, 36));
  const S = lerp(2.4, 1.15, pull);
  const cx = lerp(960, 1125, pull), cy = lerp(300, 520, pull);
  const minutes = f < 22 ? 357 + f * (2.8 / 22) : 360;
  const click = seg(f, 22, 30);
  const gate = easeInOut(seg(f, 24, 42));
  const smoke = lerp(0.45, 1, seg(f, 22, 40));
  const fat = seg(f, 22, 44);
  const door = seg(f, 6, 22);
  const crowd = [
    { x: 560, fem: false, ph: 1 }, { x: 760, fem: true, ph: 2 }, { x: 930, fem: false, ph: 3 }, { x: 1090, fem: true, ph: 4 },
  ];
  return (
    <Frame f={f} seed={6103} bg={MP.night} over={<>
      <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
        background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
      <ChapterDoor num={4} title="工場が、起きる時刻を決めた。" t={door} left={1000} top={560} />
    </>}>
      <g transform={`translate(960 540) scale(${S}) translate(${-cx} ${-cy})`}>
        <KoujouMon f={f} gate={gate} hands={minutes} smoke={smoke} sky={0.75} />
        <MzEMonExt sky={0.75} />
        {/* 太っていく煙 (右の煙突) */}
        {Array.from({ length: 5 }, (_, j) => {
          const t = ((f / 90 + j / 5) % 1);
          return (
            <g key={j}>
              <MzEPuff x={1610 - t * 380} y={70 + t * 100} r={(40 + t * 70) * fat} color={mixC(C.smoke, C.smokeLight, t)} o={fat * (1 - t) * 0.85} f={f} phase={j} />
              <MzEPuff x={320 + t * 300} y={70 + t * 90} r={(36 + t * 60) * fat} color={mixC(C.smoke, C.smokeLight, t)} o={fat * (1 - t) * 0.8} f={f} phase={j + 3} />
            </g>
          );
        })}
        {/* カチッ */}
        {click > 0 && click < 1 && (
          <g opacity={1 - click}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = rad(i * 30);
              return <line key={i} x1={960 + Math.sin(a) * (150 + 10 * click)} y1={300 - Math.cos(a) * (150 + 10 * click)} x2={960 + Math.sin(a) * (180 + 40 * click)} y2={300 - Math.cos(a) * (180 + 40 * click)} stroke={MP.glow} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* ギギーッ (蝶番のきしみ) */}
        {gate > 0.02 && gate < 0.98 && [700, 1220].map((gx) => (
          <g key={gx} opacity={0.8}>
            {[0, 1].map((k) => <path key={k} d={`M ${gx + (gx < 960 ? -1 : 1) * (20 + k * 16)} ${600 + k * 8} q ${gx < 960 ? -10 : 10} 14 0 28`} stroke={MP.glow} strokeWidth={4} fill="none" strokeLinecap="round" />)}
          </g>
        ))}
        {/* 門の前で並ぶ人たち (あくび) */}
        {crowd.map((p, i) => {
          const yawning = ((f + p.ph * 23) % 64) < 30;
          return p.fem ? (
            <MzEPerson key={i} x={p.x} y={900} s={0.85} f={f} phase={p.ph} fem="long" hat="kerchief" cloth={i % 4 === 1 ? C.enji : C.rose} clothDark={i % 4 === 1 ? C.enjiDark : C.roseDark}
              skirt={i % 4 === 1 ? C.enji : C.rose} long apron sleepy={0.65} yawn={yawning} gaze={[0, -3]} />
          ) : (
            <MzEPerson key={i} x={p.x} y={900} s={0.85} f={f} phase={p.ph} hat="hunting" cloth={C.shirt} clothDark={C.grayClothDark} vest={i === 0 ? C.vestBrown : C.vestGray}
              sleepy={0.7} yawn={yawning} pose={i === 0 && yawning ? "banzai" : "stand"} gaze={[0, -3]} />
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #104 18世紀、イギリスで、工場が増えはじめます。
// 格: 山 / seed 6104
// 絵: どこ: 18世紀イギリスの田園の丘と川を見下ろす広い景色 (この章の全体像の1枚)。緑の畑・羊・石垣・川の水車・小さな村。演出: 丘のあちこちの地面から、れんがの工場と煙突が**にょきっ、にょきっ**と、きのこのように次々に生えてくる (KoujouMon と同じれんがの色と形を小さく)。煙突が生えるたびに黒い煙がぽっと出て、空が少しずつ灰色になる。牧草地の羊が驚いて逃げ、畑の農夫 (男性) が鍬を持ったまま振り向く (face="surprised")。年代札「18世紀」と地名札「イギリス」。カメラは丘の上から全体を見下ろして、ゆっくり右へパン。動き: f0-150 煙突が順に生える (15fごと) / 空が灰色になる / 羊が逃げる
// どこ: 18世紀イギリスの田園を丘から見下ろす広い景色。継ぎはぎの畑と石垣・曲がりくねる川・川の水車小屋・わら屋根の村と教会の塔・羊の牧草地
// 演出: 丘や畑のあちこちから、れんがの工場と煙突 (KoujouMon と同じれんがの色を小さく) がきのこのようににょきっと生え、生えるたびに黒い煙がぽっと出る。
//       空がだんだん灰色に。羊たちがあわてて逃げ、手前の農夫 (男・灰色の上着・鍬) が鍬を持ったまま振り向いて驚く
// 動き: f4-40 工場が順に生える (4コマごと・10棟) / 空が灰色に / f14- 羊が逃げる / f16 農夫が驚く / 全体をゆっくり右へパン
const MzEMiniFactory: React.FC<{ x: number; y: number; s?: number; t: number; f: number; phase?: number }> = ({ x, y, s = 1, t, f, phase = 0 }) => {
  if (t <= 0) return null;
  const g = pop(clamp01(t));
  const done = t >= 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 土が盛り上がる */}
      {!done && Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={(i - 2.5) * 26 + Math.sin(i * 3) * 6} cy={-10 - Math.abs(Math.sin(t * 6 + i)) * 26} r={7} fill={C.fieldDark} stroke={INK} strokeWidth={2} />
      ))}
      <g transform={`scale(1 ${g})`}>
        <rect x={-74} y={-76} width={148} height={76} fill={MP.brick} stroke={INK} strokeWidth={4} />
        <path d="M -82 -74 L -74 -96 L 74 -96 L 82 -74 Z" fill={MP.iron} stroke={INK} strokeWidth={4} />
        {[-50, -16, 18, 52].map((wx) => <rect key={wx} x={wx - 10} y={-60} width={20} height={26} fill="#E9C77A" stroke={INK} strokeWidth={2.5} />)}
        <path d="M 30 -96 L 36 -250 L 64 -250 L 70 -96 Z" fill={MP.brickDark} stroke={INK} strokeWidth={4} />
        <rect x={32} y={-262} width={36} height={14} fill={MP.soot} stroke={INK} strokeWidth={3} />
      </g>
      {/* 生えた瞬間のぽっ、と続く煙 */}
      {done && Array.from({ length: 4 }, (_, j) => {
        const k = ((f + phase * 17) / 70 + j / 4) % 1;
        return <MzEPuff key={j} x={50 + k * 120} y={-280 - k * 150} r={18 + k * 40} color={mixC(C.smoke, C.smokeLight, k)} o={(1 - k) * 0.85} f={f} phase={j} />;
      })}
      {t > 0.85 && t < 1 && <MzEPuff x={50} y={-290} r={40} color={C.smoke} o={0.9} f={f} />}
    </g>
  );
};
const MzESheep: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; flee: number }> = ({ x, y, s = 1, f, phase = 0, flee }) => {
  const hop = flee > 0 ? -Math.abs(Math.sin((f + phase * 7) / 3)) * 18 : 0;
  return (
    <g transform={`translate(${x} ${y + hop}) scale(${s})`}>
      {[-24, -8, 10, 26].map((lx, i) => <rect key={i} x={lx - 4} y={10} width={8} height={30} fill={INK} transform={flee > 0 ? `rotate(${(i % 2 ? 1 : -1) * 20} ${lx} 10)` : undefined} />)}
      {[[-26, -6], [-6, -16], [16, -12], [28, 2], [6, 6], [-16, 8]].map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r={20} fill={C.sheep} stroke={INK} strokeWidth={3.5} />)}
      <ellipse cx={-44} cy={-12} rx={15} ry={19} fill={INK} />
      <circle cx={-48} cy={-16} r={5} fill={KRP.white} />
      <circle cx={-48} cy={-16} r={2.2} fill={INK} />
      {flee > 0 && <path d="M 40 -30 q 10 -10 20 0 M 46 -10 q 12 -8 22 2" stroke={INK} strokeWidth={3} fill="none" opacity={0.7} />}
      {flee > 0 && <path d="M -40 -46 q -6 10 0 16 q 6 -6 0 -16 Z" fill="#8EC6E6" stroke={INK} strokeWidth={2} />}
    </g>
  );
};
const MZE_FACTORIES: [number, number, number][] = [
  [380, 520, 0.8], [780, 470, 0.7], [1100, 520, 0.8], [1420, 470, 0.7], [1720, 520, 0.8], [1980, 480, 0.7], [580, 610, 0.95], [1280, 610, 0.95], [1580, 620, 0.95], [2080, 610, 0.9],
];
const Mz104: React.FC<{ f: number }> = ({ f }) => {
  const pan = -200 * easeInOut(seg(f, 0, 126));
  const born = MZE_FACTORIES.filter((_, i) => f >= 4 + i * 4 + 6).length;
  const gray = Math.min(0.42, born * 0.045);
  const flee = seg(f, 14, 16);
  const fleeX = Math.max(0, f - 14) * 5;
  const wheel = f * 2.5;
  const shock = f >= 16;
  return (
    <Frame f={f} seed={6104} bg={KRP.blueSoft}>
      <g transform={`translate(${pan} 0)`}>
        {/* 空 (だんだん灰色に) */}
        <rect x={-100} y={-100} width={2500} height={620} fill="#BFE1F3" />
        <rect x={-100} y={-100} width={2500} height={620} fill="#7A7470" opacity={gray} />
        {[[300, 120], [900, 80], [1500, 140], [2000, 90]].map(([cx2, cy2], i) => (
          <MzEPuff key={i} x={cx2 + Math.sin(f / 40 + i) * 10} y={cy2} r={50} color={mixC("#FFFFFF", "#9A9490", gray * 2)} o={0.85} f={f} />
        ))}
        {/* 遠くの丘 */}
        <path d="M -100 470 Q 300 360 700 430 Q 1100 500 1500 400 Q 1900 330 2400 430 L 2400 700 L -100 700 Z" fill={C.hill} stroke={INK} strokeWidth={4} />
        {/* 継ぎはぎの畑 (石垣で区切る) */}
        {Array.from({ length: 9 }, (_, i) => {
          const x0 = -100 + i * 280;
          const cols = [C.grass, C.field, C.grassDark, C.hill, C.field];
          return <path key={i} d={`M ${x0} ${470 + (i % 2) * 20} L ${x0 + 280} ${460 + ((i + 1) % 2) * 20} L ${x0 + 300} 640 L ${x0 - 20} 650 Z`} fill={cols[i % 5]} stroke={MP.stoneDark} strokeWidth={5} strokeDasharray="10 6" />;
        })}
        {Array.from({ length: 8 }, (_, i) => <path key={`r${i}`} d={`M ${-60 + i * 300} 520 l 200 -8 M ${-40 + i * 300} 560 l 220 -6 M ${-20 + i * 300} 600 l 230 -4`} stroke={C.fieldDark} strokeWidth={3} opacity={0.4} />)}
        {/* 村 (わら屋根の家と教会) */}
        {[[200, 520], [270, 530], [340, 515]].map(([vx, vy], i) => (
          <g key={i}>
            <rect x={vx - 28} y={vy - 30} width={56} height={30} fill={KRP.cream} stroke={INK} strokeWidth={3} />
            <path d={`M ${vx - 36} ${vy - 28} L ${vx} ${vy - 58} L ${vx + 36} ${vy - 28} Z`} fill={C.thatch} stroke={INK} strokeWidth={3} />
            <rect x={vx - 6} y={vy - 18} width={12} height={18} fill={MP.woodDark} />
          </g>
        ))}
        <rect x={130} y={450} width={34} height={70} fill={MP.stoneLight} stroke={INK} strokeWidth={3} />
        <path d="M 124 452 L 147 396 L 170 452 Z" fill={MP.stoneDark} stroke={INK} strokeWidth={3} />
        <rect x={-100} y={630} width={2500} height={200} fill={C.grass} />
        {/* 川と水車小屋 */}
        <path d="M -100 640 Q 300 600 600 680 Q 900 760 1300 730 Q 1800 690 2400 760" stroke={C.riverDark} strokeWidth={70} fill="none" />
        <path d="M -100 640 Q 300 600 600 680 Q 900 760 1300 730 Q 1800 690 2400 760" stroke={C.river} strokeWidth={54} fill="none" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${((i * 500 + f * 3) % 2400) - 100} ${680 + (i % 2) * 30} q 16 -6 32 0`} stroke={KRP.white} strokeWidth={3} fill="none" />)}
        <g>
          <rect x={880} y={650} width={120} height={80} fill={MP.stoneLight} stroke={INK} strokeWidth={4} />
          <path d="M 868 652 L 940 604 L 1012 652 Z" fill={C.thatch} stroke={INK} strokeWidth={4} />
          <g transform={`translate(860 712) rotate(${wheel})`}>
            <circle r={44} fill="none" stroke={MP.woodDark} strokeWidth={8} />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-5} y={-48} width={10} height={20} fill={MP.wood} stroke={INK} strokeWidth={2} transform={`rotate(${i * 45})`} />)}
            <circle r={8} fill={INK} />
          </g>
        </g>
        {/* 生えてくる工場 */}
        {MZE_FACTORIES.map(([fx, fy, fs], i) => (
          <MzEMiniFactory key={i} x={fx} y={fy} s={fs} t={seg(f, 4 + i * 4, 10 + i * 4)} f={f} phase={i} />
        ))}
        {/* 手前の牧草地 */}
        <path d="M -100 780 Q 600 740 1200 790 Q 1800 830 2400 780 L 2400 1200 L -100 1200 Z" fill={C.grass} stroke={INK} strokeWidth={4} />
        <path d="M -100 830 L 2400 850" stroke={MP.stoneDark} strokeWidth={10} strokeDasharray="22 8" />
        {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${i * 84} ${900 + (i % 3) * 40} l 6 -16 l 6 16`} stroke={C.grassDark} strokeWidth={3} fill="none" />)}
        {/* 羊 (逃げる) */}
        {[[260, 880], [400, 900], [520, 870], [330, 960], [470, 950]].map(([sx, sy], i) => (
          <MzESheep key={i} x={sx - fleeX * (1 + i * 0.15)} y={sy} s={0.9} f={f} phase={i} flee={flee} />
        ))}
        {/* 農夫 (鍬を持ったまま振り向く) */}
        <MzEPerson x={1260} y={935} s={0.75} f={f} phase={2} cloth={C.grayCloth} clothDark={C.grayClothDark}
          face={shock ? "surprised" : "normal"} gaze={shock ? [-8, -6] : [0, 4]} lean={shock ? -6 : 3} arms={[-40, 40]}>
          <line x1={46} y1={-210} x2={-62} y2={-6} stroke={MP.woodDark} strokeWidth={10} strokeLinecap="round" />
          <path d="M -62 -6 L -96 -10 L -92 10 L -60 8 Z" fill={KRP.silver} stroke={INK} strokeWidth={4} />
          {shock && <text x={60} y={-300} fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.red} stroke={INK} strokeWidth={4} paintOrder="stroke">!</text>}
        </MzEPerson>
      </g>
      {/* 札 (画面に固定。同じ幅なので左端もそろう) */}
      <TagPlate x={1680} y={130} text="18世紀" size={46} t={seg(f, 2, 10)} />
      <TagPlate x={1680} y={222} text="イギリス" size={46} t={seg(f, 6, 14)} />
      <g opacity={seg(f, 8, 14)}><MzEFlagUK x={1480} y={222} w={70} /></g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #105 畑の仕事なら、日が昇ったら始めて、暗くなったら終わり。
// 格: 並 / seed 6105
// 絵: どこ: #104 の工場が生える前の、イギリスの畑 (石垣・木の柵・遠くの村・空が大きく見える)。演出: 主役は空の太陽の動きと、畑の夫婦。夫 (短い黒髪・灰色の上着とズボン) と妻 (肩までの茶色の髪を後ろで結ぶ・えんじの服・くるぶしまでのスカートと頭巾) が、太陽が地平線から顔を出すと同時に鍬を振りはじめ (腕は2本、pose="hoe")、太陽が空を弧を描いて渡る間ずっと働き、太陽が沈むと同時に鍬を肩にかついで、手をつないで家へ帰る。太陽の弧に点線の軌跡が残る。カメラは空の太陽を追って左から右へパン。動き: f0-30 日の出・働きはじめる / f30-120 太陽が渡る / f120-160 日の入り・帰る
// どこ: #104 の工場が生える前の、イギリスの畑。うね・石垣・木の柵・遠くの村と教会・木・右の端にわら屋根の家。空が大きい
// 演出: 太陽が地平線から顔を出すと夫婦 (夫=短い黒髪・灰色の上着とズボン / 妻=茶色の髪・頭巾・えんじの服・くるぶしまでのスカート) が鍬を振りはじめ、
//       太陽が空を弧を描いて渡るあいだ働き (弧に点線の軌跡が残る)、太陽が沈むと鍬を外の手に立てて持ち (肩の形は顔にかかるので)、手をつないで家へ帰る。夜になり家の窓に明かり
// 動き: f0-6 日の出・構える / f6-40 太陽が渡る・鍬を振る (12コマに1回) / f40-44 日の入り・かつぐ / f44- 手をつないで帰る・夜・星・家の明かり / カメラは太陽を追って右へ
const Mz105: React.FC<{ f: number }> = ({ f }) => {
  const sp = seg(f, 2, 42);
  const sunX = lerp(260, 1980, sp);
  const sunY = 700 - Math.sin(sp * Math.PI) * 540;
  const camX = Math.min(580, Math.max(0, sunX - 960));
  const night = seg(f, 42, 76);
  const skyV = f <= 42 ? 1 + Math.sin(sp * Math.PI) : 1 - night;
  const [skyT, skyB] = skyColors(skyV);
  const working = f >= 6 && f < 41;
  const home = f >= 41;
  const swing = working ? Math.sin(((f - 6) / 12) * Math.PI * 2) : 0;
  const walk = home ? Math.min(Math.max(0, f - 46) * 5.2, 560) : 0;
  const hx = 1150 + walk;
  const trail = Array.from({ length: 41 }, (_, i) => {
    const q = (i / 40) * sp;
    return `${lerp(260, 1980, q).toFixed(1)} ${(700 - Math.sin(q * Math.PI) * 540).toFixed(1)}`;
  });
  const winLit = seg(f, 56, 66);
  return (
    <Frame f={f} seed={6105} bg={skyT}>
      <g transform={`translate(${-camX} 0)`}>
        {/* 空 */}
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-100} y={-100 + i * 82} width={2800} height={84} fill={mixC(skyT, skyB, i / 9)} />)}
        {night > 0.3 && Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={rnd(11, i) * 2600} cy={rnd(12, i) * 520} r={i % 4 ? 2.2 : 3.4} fill="#FFF6D8" opacity={(night - 0.3) * (0.6 + 0.4 * Math.sin(f / 8 + i))} />
        ))}
        {f > 70 && <g opacity={seg(f, 70, 90)}><circle cx={900} cy={lerp(520, 300, seg(f, 70, 141))} r={46} fill="#F7F0D2" stroke={INK} strokeWidth={3} /></g>}
        {/* 太陽の点線の軌跡 */}
        {sp > 0.02 && <path d={"M " + trail.join(" L ")} stroke={KRP.white} strokeWidth={8} strokeDasharray="2 22" strokeLinecap="round" fill="none" opacity={0.9} />}
        {/* 太陽 */}
        {f < 92 && (
          <g transform={`translate(${sunX} ${sunY + seg(f, 42, 90) * 110})`}>
            <circle r={84} fill={C.sun} opacity={0.3} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-70} x2={0} y2={-92} stroke={C.sunDark} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 30 + f})`} />)}
            <circle r={58} fill={C.sun} stroke={INK} strokeWidth={5} />
          </g>
        )}
        {/* 遠くの丘・村・教会・木 */}
        <path d="M -100 700 Q 400 640 900 680 Q 1500 720 2000 660 Q 2400 630 2700 690 L 2700 760 L -100 760 Z" fill={C.hill} stroke={INK} strokeWidth={4} />
        {[[420, 676], [480, 682], [540, 674]].map(([vx, vy], i) => (
          <g key={i}>
            <rect x={vx - 22} y={vy - 22} width={44} height={22} fill={KRP.cream} stroke={INK} strokeWidth={3} />
            <path d={`M ${vx - 28} ${vy - 20} L ${vx} ${vy - 44} L ${vx + 28} ${vy - 20} Z`} fill={C.thatch} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        <rect x={600} y={610} width={26} height={60} fill={MP.stoneLight} stroke={INK} strokeWidth={3} />
        <path d="M 594 612 L 613 566 L 632 612 Z" fill={MP.stoneDark} stroke={INK} strokeWidth={3} />
        {[[1700, 690], [1780, 680], [300, 700]].map(([tx2, ty2], i) => (
          <g key={i}>
            <rect x={tx2 - 8} y={ty2 - 60} width={16} height={60} fill={MP.woodDark} stroke={INK} strokeWidth={3} />
            <circle cx={tx2} cy={ty2 - 80} r={40} fill={C.grassDark} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* 畑 (うね) */}
        <rect x={-100} y={740} width={2800} height={460} fill={C.field} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M -100 ${770 + i * 34 + i * i * 2} Q 1300 ${750 + i * 34 + i * i * 2} 2700 ${770 + i * 34 + i * i * 2}`} stroke={C.fieldDark} strokeWidth={5} fill="none" />)}
        {/* 石垣と木の柵 */}
        <path d="M -100 744 L 2700 744" stroke={MP.stoneDark} strokeWidth={16} strokeDasharray="26 6" />
        <path d="M -100 744 L 2700 744" stroke={INK} strokeWidth={2} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={1900 + i * 60} y={790} width={12} height={70} fill={MP.wood} stroke={INK} strokeWidth={3} />)}
        <path d="M 1900 806 L 2620 806 M 1900 836 L 2620 836" stroke={MP.wood} strokeWidth={8} />
        {/* 夜の暗さ (地面) */}
        <rect x={-100} y={640} width={2800} height={560} fill={MP.nightDeep} opacity={0.45 * night} />
        {/* わら屋根の家 (帰る先) */}
        <g>
          <rect x={2080} y={700} width={260} height={180} fill={KRP.cream} stroke={INK} strokeWidth={5} />
          <path d="M 2050 708 Q 2210 560 2370 708 Z" fill={C.thatch} stroke={INK} strokeWidth={5} />
          <rect x={2290} y={600} width={30} height={70} fill={MP.stoneDark} stroke={INK} strokeWidth={4} />
          {winLit > 0 && <MzEPuff x={2310 + (f % 60) * 0.5} y={560 - (f % 60) * 0.6} r={18} color={C.smokeLight} o={0.6} f={f} />}
          <rect x={2120} y={760} width={70} height={60} fill={mixC(C.windowDark, C.lampLit, winLit)} stroke={INK} strokeWidth={4} />
          <path d="M 2155 760 L 2155 820 M 2120 790 L 2190 790" stroke={MP.woodDark} strokeWidth={4} />
          <rect x={2230} y={780} width={64} height={100} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
          {winLit > 0 && <circle cx={2155} cy={790} r={90} fill={MP.glow} opacity={0.25 * winLit} />}
        </g>
        {/* 夫婦 */}
        {!home ? (
          <g>
            <MzEPerson x={hx} y={950} s={0.75} f={f} phase={1} cloth={C.grayCloth} clothDark={C.grayClothDark} lean={swing * 6}
              arms={[-40, 40]} face={working ? "smile" : "normal"} gaze={[-4, 4]}>
              <g transform={`rotate(${swing * 14} 0 -85)`}>
                <line x1={46} y1={-210} x2={-62} y2={-6} stroke={MP.woodDark} strokeWidth={10} strokeLinecap="round" />
                <path d="M -62 -6 L -96 -10 L -92 10 L -60 8 Z" fill={KRP.silver} stroke={INK} strokeWidth={4} />
              </g>
            </MzEPerson>
            <MzEPerson x={hx + 190} y={950} s={0.75} f={f} phase={2} fem="long" hat="kerchief" cloth={C.enji} clothDark={C.enjiDark} skirt={C.enji} long
              lean={-swing * 6} arms={[-40, 40]} face={working ? "smile" : "normal"} gaze={[4, 4]}>
              <g transform={`rotate(${-swing * 14} 0 -85)`}>
                <line x1={-46} y1={-210} x2={62} y2={-6} stroke={MP.woodDark} strokeWidth={10} strokeLinecap="round" />
                <path d="M 62 -6 L 96 -10 L 92 10 L 60 8 Z" fill={KRP.silver} stroke={INK} strokeWidth={4} />
              </g>
            </MzEPerson>
          </g>
        ) : (
          <g>
            {/* 鍬をかつぎ、まん中で手をつなぐ */}
            <MzEPerson x={hx} y={950} s={0.75} f={f} phase={1} cloth={C.grayCloth} clothDark={C.grayClothDark} arms={[10, -35]} face="smile" gaze={[5, 0]}>
              <line x1={-84} y1={-8} x2={-84} y2={-290} stroke={MP.woodDark} strokeWidth={10} strokeLinecap="round" />
              <path d="M -84 -290 L -128 -282 L -124 -264 L -84 -272 Z" fill={KRP.silver} stroke={INK} strokeWidth={4} />
            </MzEPerson>
            <MzEPerson x={hx + 171} y={950} s={0.75} f={f} phase={2} fem="long" hat="kerchief" cloth={C.enji} clothDark={C.enjiDark} skirt={C.enji} long
              arms={[35, -10]} face="smile" gaze={[-5, 0]}>
              <line x1={84} y1={-8} x2={84} y2={-290} stroke={MP.woodDark} strokeWidth={10} strokeLinecap="round" />
              <path d="M 84 -290 L 128 -282 L 124 -264 L 84 -272 Z" fill={KRP.silver} stroke={INK} strokeWidth={4} />
            </MzEPerson>
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #106 でも工場は、全員がそろわないと、機械が動きません。
// 格: 山 / seed 6106
// 絵: どこ: 18世紀イギリスの工場の中 (れんがの壁・天井の長い軸と革ベルト・ずらりと並んだ紡績機・高い窓)。演出: 男女の工場の人たち (男: ハンチング帽・ベスト・腕まくり / 女: 長いスカートとエプロン・頭巾) が紡績機の前に1人ずつ立って並ぶ。列の真ん中に1か所だけ空いた持ち場があり、そこの機械だけでなく、ベルトでつながった全部の機械がぴたりと止まって、歯車にくもの巣がかかる。全員がその空いた場所を振り返って、じっとにらむ。そこへ、帽子をあたふた押さえた若い男が息を切らして駆け込み、持ち場に立った瞬間、全部の歯車がガラガラッと一斉に回りだす。カメラは列を横にパンして空いた持ち場で止まる。動き: f0-40 パン / f40-80 止まった機械・にらむ / f80-110 駆け込む / f110 一斉に回る
// どこ: 18世紀イギリスの工場の中。れんがの壁・高いアーチの窓・天井の長い軸と滑車・革ベルト・ずらりと並んだ紡績機 (糸巻きの列・はずみ車・歯車)・板の床
// 演出: 男女の工場の人 (男=ハンチング帽・ベスト・腕まくり / 女=頭巾・茶色の髪・長いスカート・エプロン) が機械の前に1人ずつ並ぶ。
//       列のまん中に1か所だけ空いた持ち場があり、ベルトでつながった全部の機械が止まって歯車にくもの巣。全員が空いた場所をジト目でにらむ。
//       そこへ帽子が飛びそうな若い男が汗だくで駆け込み、持ち場に立った瞬間、全部の歯車がガラガラッと一斉に回りだし、みんな笑顔に
// 動き: f0-18 列を横にパンして空いた持ち場で止まる / f8-22 くもの巣 / f16- にらむ / f30-58 駆け込む / f60 一斉に回る
const MzESpinner: React.FC<{ x: number; f: number; run: number; web: number; empty?: boolean }> = ({ x, f, run, web, empty = false }) => {
  const rot = run > 0 ? f * 9 : 0;
  return (
    <g>
      {/* ベルト (天井の滑車からはずみ車へ) */}
      <line x1={x - 94} y1={156} x2={x - 94} y2={690} stroke="#6A4A30" strokeWidth={9} strokeDasharray={run > 0 ? "18 8" : undefined} strokeDashoffset={-f * 6} />
      <line x1={x - 66} y1={156} x2={x - 66} y2={690} stroke="#6A4A30" strokeWidth={9} strokeDasharray={run > 0 ? "18 8" : undefined} strokeDashoffset={f * 6} />
      <circle cx={x - 80} cy={148} r={22} fill={MP.ironLight} stroke={INK} strokeWidth={4} />
      {/* 木の枠 */}
      <rect x={x - 120} y={520} width={240} height={20} fill={MP.wood} stroke={INK} strokeWidth={4} />
      <rect x={x - 120} y={620} width={240} height={16} fill={MP.wood} stroke={INK} strokeWidth={4} />
      <rect x={x - 116} y={520} width={18} height={380} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
      <rect x={x + 98} y={520} width={18} height={380} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
      {/* 糸巻きの列 */}
      {Array.from({ length: 8 }, (_, i) => {
        const bx = x - 84 + i * 24;
        return (
          <g key={i}>
            <line x1={bx} y1={540} x2={bx} y2={620} stroke={INK} strokeWidth={3} />
            <rect x={bx - 8} y={556} width={16} height={36} rx={6} fill={KRP.cream} stroke={INK} strokeWidth={2.5} />
            <line x1={bx - 7} y1={566 + ((f * run * 2 + i * 3) % 20)} x2={bx + 7} y2={562 + ((f * run * 2 + i * 3) % 20)} stroke={KRP.grayDark} strokeWidth={2} />
          </g>
        );
      })}
      {/* はずみ車と歯車 */}
      <g transform={`translate(${x - 80} 720) rotate(${rot})`}>
        <circle r={64} fill="none" stroke={MP.woodDark} strokeWidth={10} />
        <circle r={64} fill="none" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} y1={0} x2={0} y2={-60} stroke={MP.woodDark} strokeWidth={7} transform={`rotate(${i * 60})`} />)}
        <circle r={10} fill={INK} />
      </g>
      <MzEGear x={x + 40} y={680} r={34} n={12} rot={-rot * 1.3} fill={MP.ironLight} />
      <MzEGear x={x + 60} y={740} r={22} n={9} rot={rot * 2} fill={MP.brass} />
      {/* くもの巣 */}
      {web > 0 && (
        <g opacity={web} stroke={C.web} strokeWidth={2} fill="none">
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={x + 40} y1={680} x2={x + 40 + Math.cos(rad(i * 45)) * 52} y2={680 + Math.sin(rad(i * 45)) * 52} />)}
          {[18, 32, 46].map((r) => <circle key={r} cx={x + 40} cy={680} r={r} />)}
          {Array.from({ length: 6 }, (_, i) => <line key={`w${i}`} x1={x - 80} y1={720} x2={x - 80 + Math.cos(rad(i * 60 + 20)) * 60} y2={720 + Math.sin(rad(i * 60 + 20)) * 60} />)}
          {[22, 42].map((r) => <circle key={`c${r}`} cx={x - 80} cy={720} r={r} />)}
          {empty && <circle cx={x + 52} cy={640 + Math.sin(f / 9) * 4} r={6} fill={INK} stroke="none" />}
        </g>
      )}
      {/* ガラガラッ (回りだした線) */}
      {run > 0 && run < 1 && (
        <g opacity={1 - run}>
          {[0, 1, 2].map((i) => <path key={i} d={`M ${x - 160 - i * 10} ${640 + i * 40} q -20 20 0 40`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
          {[0, 1, 2].map((i) => <path key={`r${i}`} d={`M ${x + 130 + i * 10} ${640 + i * 40} q 20 20 0 40`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
        </g>
      )}
    </g>
  );
};
const Mz106: React.FC<{ f: number }> = ({ f }) => {
  const pan = -420 * easeInOut(seg(f, 0, 18));
  const web = seg(f, 8, 22) * (1 - seg(f, 60, 66));
  const running = f >= 60;
  const runT = seg(f, 60, 74);
  const glare = f >= 16 && f < 60;
  const GAP = 1380;
  const rp = seg(f, 26, 58);
  const lx = lerp(2560, GAP, rp);
  const ly = f < 58 ? 960 : 930;
  const arrived = f >= 58;
  const slots = [180, 480, 780, 1080, GAP, 1680, 1980, 2280];
  const crew: { x: number; fem: boolean; ph: number }[] = [
    { x: 180, fem: true, ph: 1 }, { x: 480, fem: false, ph: 2 }, { x: 780, fem: true, ph: 3 }, { x: 1080, fem: false, ph: 4 },
    { x: 1680, fem: true, ph: 5 }, { x: 1980, fem: false, ph: 6 }, { x: 2280, fem: true, ph: 7 },
  ];
  return (
    <Frame f={f} seed={6106} bg={MP.brick}>
      <g transform={`translate(${pan} 0)`}>
        {/* れんがの壁 */}
        <rect x={-100} y={-100} width={2600} height={1000} fill={MP.brick} />
        {Array.from({ length: 36 }, (_, r) => (
          <g key={r}>
            <line x1={-100} y1={-100 + r * 28} x2={2500} y2={-100 + r * 28} stroke={MP.mortar} strokeWidth={3} opacity={0.6} />
            {Array.from({ length: 33 }, (_, c) => <line key={c} x1={-100 + c * 80 + (r % 2) * 40} y1={-100 + r * 28} x2={-100 + c * 80 + (r % 2) * 40} y2={-72 + r * 28} stroke={MP.mortar} strokeWidth={2.5} opacity={0.5} />)}
          </g>
        ))}
        {/* 高いアーチの窓 */}
        {[30, 330, 630, 930, 1230, 1530, 1830, 2130, 2430].map((wx) => (
          <g key={wx}>
            <path d={`M ${wx - 60} 470 L ${wx - 60} 250 A 60 60 0 0 1 ${wx + 60} 250 L ${wx + 60} 470 Z`} fill="#E2ECEE" stroke={INK} strokeWidth={5} />
            <path d={`M ${wx} 190 L ${wx} 470 M ${wx - 60} 330 L ${wx + 60} 330 M ${wx - 60} 400 L ${wx + 60} 400`} stroke={MP.woodDark} strokeWidth={4} />
            <rect x={wx - 70} y={468} width={140} height={14} fill={MP.stoneLight} stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* 天井の長い軸 */}
        <rect x={-100} y={140} width={2600} height={16} fill={MP.iron} stroke={INK} strokeWidth={3} />
        {[100, 700, 1300, 1900, 2400].map((hx2) => <path key={hx2} d={`M ${hx2} 60 L ${hx2} 140 M ${hx2 - 20} 140 L ${hx2 + 20} 140`} stroke={MP.iron} strokeWidth={8} />)}
        {/* 板の床 */}
        <rect x={-100} y={890} width={2600} height={300} fill={C.plankDark} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-100} y1={910 + i * 26} x2={2500} y2={910 + i * 26} stroke={MP.woodDark} strokeWidth={3} opacity={0.6} />)}
        {/* 紡績機の列 (全部ベルトでつながっている) */}
        {slots.map((sx) => <MzESpinner key={sx} x={sx} f={f} run={running ? Math.max(0.01, runT) : 0} web={web} empty={sx === GAP} />)}
        {/* 空いた持ち場 (窓からの光が床を照らす・足あと) */}
        {!arrived && (
          <g>
            <path d={`M ${GAP - 60} 470 L ${GAP + 60} 470 L ${GAP + 130} 940 L ${GAP - 130} 940 Z`} fill={KRP.white} opacity={0.16 + 0.04 * Math.sin(f / 6)} />
            <ellipse cx={GAP} cy={935} rx={120} ry={22} fill={KRP.white} opacity={0.25} />
            <ellipse cx={GAP - 18} cy={930} rx={20} ry={8} fill="none" stroke={KRP.white} strokeWidth={4} strokeDasharray="6 5" />
            <ellipse cx={GAP + 18} cy={930} rx={20} ry={8} fill="none" stroke={KRP.white} strokeWidth={4} strokeDasharray="6 5" />
          </g>
        )}
        {/* 並ぶ人たち */}
        {crew.map((p) => {
          const g: [number, number] = [p.x < GAP ? 8 : -8, 0];
          const face = glare ? "angry" : running ? "joy" : "normal";
          const sl = glare ? 0.45 : 0;
          return p.fem ? (
            <MzEPerson key={p.x} x={p.x} y={930} s={0.72} f={f} phase={p.ph} fem="long" hat="kerchief" cloth={p.ph % 4 === 1 ? C.enji : C.rose} clothDark={p.ph % 4 === 1 ? C.enjiDark : C.roseDark}
              skirt={p.ph % 4 === 1 ? C.enji : C.rose} long apron face={face} sleepy={sl} gaze={glare ? g : [0, 0]} lean={glare ? (p.x < GAP ? 5 : -5) : 0} />
          ) : (
            <MzEPerson key={p.x} x={p.x} y={930} s={0.72} f={f} phase={p.ph} hat="hunting" cloth={C.shirt} clothDark={C.grayClothDark} vest={p.ph % 4 === 2 ? C.vestBrown : C.vestGray}
              face={face} sleepy={sl} gaze={glare ? g : [0, 0]} lean={glare ? (p.x < GAP ? 5 : -5) : 0} pose={running && p.ph === 4 ? "banzai" : "stand"} />
          );
        })}
        {/* 駆け込む若い男 (帽子が飛びそう) */}
        <MzEPerson x={lx} y={ly} s={f < 58 ? 0.78 : 0.72} f={f} phase={9} cloth={C.shirt} clothDark={C.grayClothDark} vest={C.vestGray} hair="cap"
          pose={arrived ? "stand" : "run"} lean={arrived ? 0 : -12} face={arrived && running ? "smile" : "worried"} gaze={[-6, 0]}>
          <g transform={`translate(${arrived ? 0 : -6} ${arrived ? 0 : -18 - Math.abs(Math.sin(f / 2.5)) * 18}) rotate(${arrived ? 0 : 14 + Math.sin(f / 2) * 8} 0 -280)`}>
            <path d="M -66 -244 Q -62 -302 4 -304 Q 66 -300 70 -248 Z" fill={C.tweed} stroke={INK} strokeWidth={4.5} />
            <path d="M -62 -250 Q 4 -232 76 -254 Q 86 -244 72 -238 Q 4 -222 -64 -240 Z" fill={C.tweedDark} stroke={INK} strokeWidth={4} />
          </g>
          {[0, 1, 2].map((i) => <path key={i} d={`M ${70 + i * 18} ${-250 + i * 26} q 8 12 0 18 q -8 -6 0 -18 Z`} fill="#8EC6E6" stroke={INK} strokeWidth={2.5} opacity={0.6 + 0.4 * Math.sin(f / 3 + i)} />)}
          {arrived && [0, 1].map((i) => <MzEPuff key={i} x={-40 - i * 26} y={-190 - ((f - 58 + i * 8) % 16) * 2} r={10} color={KRP.white} o={0.8} f={f} />)}
        </MzEPerson>
        {!arrived && f >= 26 && [0, 1, 2].map((i) => <line key={i} x1={lx + 80 + i * 26} y1={830 + i * 30} x2={lx + 170 + i * 26} y2={830 + i * 30} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.5} />)}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #107 起きる時刻を、工場が決めるようになりました。
// 格: 山 / seed 6107
// 絵: どこ: KoujouMon (gate=0→1, hands=5時45分, smoke=1) の前の夜明け前の通り。工場の奥に、空の地平線。演出: 地平線から、#71〜#72 と同じ顔のある太陽が、いつものようにのんびり昇ろうとする。ところが、門の上の大きな時計の針がひとりでにカチカチ進み、時計が太陽より先に**ジリリ**と鳴ると、煙突の煙が太陽の前にもくもくと覆いかぶさって、太陽は「えっ」という顔で煙のうしろに隠れてしまう。通りでは、時計の音に合わせて工場の人たち (男女) がいっせいに門へ走り出す。時計の文字盤の光が太陽よりまぶしく光る。カメラは太陽から工場の時計へ横にパン。動き: f0-40 太陽が昇りかける / f40-60 時計が鳴る / f60-110 煙が覆う・太陽が隠れる / 人が走る
// どこ: 共有の舞台 KoujouMon の前の、夜明け前の通り。工場の屋根の向こうが地平線
// 演出: 工場の屋根の向こうから、顔のある太陽がいつものようにのんびり (目を閉じてにっこり) 昇ろうとする。ところが門の上の大きな時計の針がひとりでに
//       カチカチ進み (5:45→6:00)、太陽より先にジリリと鳴って文字盤がまぶしく光る。煙突の煙がもくもく太陽の前に覆いかぶさり、
//       太陽は「えっ」という顔で煙のうしろに隠れる (目だけのぞく)。通りでは男女の工場の人が時計の音に合わせて一斉に門へ走る。門が開く
// 動き: f0-14 太陽が昇りかける (太陽に寄った絵) / f6-22 針がカチカチ進む / f12-34 時計へ横にパン / f22- 鳴る・光る / f24-40 煙が覆う・太陽「えっ」 / f22- 人が走る・門が開く
const MzESunFace: React.FC<{ x: number; y: number; r?: number; f: number; shock: number }> = ({ x, y, r = 80, f, shock }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.5} fill={C.sun} opacity={0.25 * (1 - shock * 0.6)} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-r - 8} x2={0} y2={-r - 34} stroke={C.sunDark} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 30 + f * 0.6})`} />)}
    <circle r={r} fill={C.sun} stroke={INK} strokeWidth={6} />
    <ellipse cx={-r * 0.5} cy={r * 0.15} rx={14} ry={9} fill={KRP.orange} opacity={0.6} />
    <ellipse cx={r * 0.5} cy={r * 0.15} rx={14} ry={9} fill={KRP.orange} opacity={0.6} />
    {shock < 0.5 ? (
      <g stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round">
        <path d={`M ${-r * 0.48} ${-r * 0.18} q 12 10 24 0`} />
        <path d={`M ${r * 0.24} ${-r * 0.18} q 12 10 24 0`} />
        <path d={`M -18 ${r * 0.3} q 18 16 36 0`} />
      </g>
    ) : (
      <g>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <ellipse cx={sd * r * 0.34} cy={-r * 0.2} rx={14} ry={18} fill={KRP.white} stroke={INK} strokeWidth={4} />
            <circle cx={sd * r * 0.34} cy={-r * 0.2} r={4.5} fill={INK} />
          </g>
        ))}
        <ellipse cx={0} cy={r * 0.36} rx={10} ry={13} fill={INK} />
        <path d={`M ${r * 0.8} ${-r * 0.7} q -12 18 0 28 q 12 -10 0 -28 Z`} fill="#8EC6E6" stroke={INK} strokeWidth={3} />
      </g>
    )}
  </g>
);
const Mz107: React.FC<{ f: number }> = ({ f }) => {
  const clipId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const pan = easeInOut(seg(f, 12, 34));
  const S = lerp(1.4, 1.08, pan);
  const cx = lerp(1450, 1000, pan), cy = lerp(330, 520, pan);
  const sunY = lerp(380, 210, easeOut(seg(f, 0, 30)));
  const minutes = 345 + Math.floor(seg(f, 6, 22) * 15);
  const ring = f >= 22 ? 1 : 0;
  const cover = easeOut(seg(f, 24, 40));
  const shock = seg(f, 26, 28);
  const gate = easeInOut(seg(f, 24, 40));
  const runners = [
    { from: -120, ph: 1, fem: false, d: 0 }, { from: 2100, ph: 2, fem: true, d: 2 }, { from: -260, ph: 3, fem: true, d: 5 },
    { from: 2240, ph: 4, fem: false, d: 7 }, { from: -400, ph: 5, fem: false, d: 10 }, { from: 2380, ph: 6, fem: true, d: 12 },
  ];
  return (
    <Frame f={f} seed={6107} bg={MP.night}>
      <defs><clipPath id={clipId}><rect x={-100} y={-200} width={2600} height={486} /></clipPath></defs>
      <g transform={`translate(960 540) scale(${S}) translate(${-cx} ${-cy})`}>
        <KoujouMon f={f} gate={gate} hands={minutes} smoke={1} sky={0.7} />
        <MzEMonExt sky={0.7} />
        {/* 屋根の向こうから昇る太陽 */}
        <g clipPath={`url(#${clipId})`}>
          <MzESunFace x={1440} y={sunY} r={80} f={f} shock={shock} />
        </g>
        {/* 太陽の前に覆いかぶさる煙 */}
        {[[1530, 275, 66, 0], [1430, 310, 80, 0.15], [1340, 270, 58, 0.3], [1500, 320, 70, 0.2], [1440, 262, 46, 0.45]].map(([px, py, pr, dl], i) => {
          const t = seg(cover, dl, 1);
          return <MzEPuff key={i} x={lerp(1610, px, t)} y={lerp(40, py, t)} r={pr * t} color={C.smoke} o={0.95 * t} f={f} phase={i} />;
        })}
        {/* ジリリ: 時計の光は太陽よりまぶしく */}
        {ring > 0 && (
          <g>
            <circle cx={960} cy={300} r={210 + Math.sin(f / 2) * 10} fill={MP.glow} opacity={0.35} />
            {Array.from({ length: 16 }, (_, i) => {
              const a = rad(i * 22.5 + f * 1.5);
              return <line key={i} x1={960 + Math.cos(a) * 160} y1={300 + Math.sin(a) * 160} x2={960 + Math.cos(a) * 250} y2={300 + Math.sin(a) * 250} stroke={MP.glow} strokeWidth={10} strokeLinecap="round" opacity={0.8} />;
            })}
            <MzESound x={960} y={300} r={170} amt={1} f={f} color={MP.glow} w={9} />
          </g>
        )}
        {/* 一斉に門へ走る人たち */}
        {runners.map((p, i) => {
          const t = easeInOut(seg(f, 22 + p.d, 58 + p.d));
          const x = lerp(p.from, 960 + (p.from < 960 ? -60 : 60) * (1 - t), t);
          const vanish = seg(t, 0.85, 1);
          if (vanish >= 1) return null;
          const dir = p.from < 960 ? 1 : -1;
          return (
            <g key={i} opacity={1 - vanish} transform={dir === -1 ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
              {p.fem ? (
                <MzEPerson x={x} y={905} s={0.7} f={f} phase={p.ph} fem="long" hat="kerchief" cloth={C.rose} clothDark={C.roseDark} skirt={C.rose} long apron
                  pose={t > 0 && t < 0.99 ? "run" : "stand"} lean={8} face="surprised" gaze={[6, -4]} />
              ) : (
                <MzEPerson key={i} x={x} y={905} s={0.7} f={f} phase={p.ph} hat="hunting" cloth={C.shirt} clothDark={C.grayClothDark} vest={C.vestGray}
                  pose={t > 0 && t < 0.99 ? "run" : "stand"} lean={8} face="surprised" gaze={[6, -4]} />
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #108 イギリスのある製鉄所では、働く人の、出勤と退勤の時刻を記録していました。
// 格: 山 / seed 6108
// 絵: どこ: 18世紀イギリスの製鉄所の門の脇の詰め所 (炉の赤い光・れんが・鉄くず・木の小窓)。KoujouMon の門の形を製鉄所の色 (すすけた黒) にして使う (gate=1, hands=6時)。演出: 主役は詰め所の小窓の中の分厚い帳面。門番の記録係 (男性・眼鏡・黒い上着) が、門を通る1人ごとに羽ペンで時刻を書き込む (腕は2本、pose で右手にペン、左手で帳面を押さえる)。働く人の列 (男: ハンチング帽・腕まくり / 女: 頭巾とエプロンと長いスカート) が、門の上の時計をちらっと見上げて通っていく。少し遅れた男が通ると、記録係のペンが**赤いインク**に変わり、ぐりっと太く書く。遅れた男はびくっと首をすくめる。カメラは帳面の寄りから列へ引く。動き: f0-90 1人ずつ書く / f90 遅れた男 / f100 赤インク
// どこ: 18世紀イギリスの製鉄所の門 (KoujouMon をすすけた黒にして使う・門の奥に炉の赤い光と火の粉・鉄くずの山) と、門の脇の詰め所 (れんが・スレート屋根・木の小窓・ランプ)
// 演出: 主役は詰め所の小窓の中の分厚い帳面 (欄の見出し「出勤」「退勤」)。記録係 (男・眼鏡・黒い上着) が左手で帳面を押さえ、右手の羽ペンで、
//       門を通る1人ごとに時刻を書き込む。男女の働く人は門の上の時計をちらっと見上げて通る。少し遅れて走ってきた男が通ると、
//       ペン先が赤いインクに変わってぐりっと太く書き、男はびくっと首をすくめる。そのあと時計が早回しで夕方になり、出てくる人を「退勤」の欄に書く
// 動き: f0-28 帳面の寄りから列へ引く / f4・14・24 1人ずつ書く / f36 遅れた男 / f38-44 赤いインク・びくっ / f100-130 時計の早回し・夕方 / f130- 退勤を書く
const MZE_IN = [4, 14, 24, 70];
const MZE_LATE = 38;
const MZE_OUT = [138, 152, 166, 178];
const Mz108: React.FC<{ f: number }> = ({ f }) => {
  const winClip = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const pull = easeInOut(seg(f, 6, 28));
  const S = lerp(2.0, 1.25, pull);
  const cx = lerp(390, 700, pull), cy = lerp(660, 600, pull);
  const eve = seg(f, 100, 130);
  const hands = 6 * 60 + eve * 12 * 60;
  const sky = lerp(0.85, 0.25, eve);
  // 書いている最中か
  const writes = [...MZE_IN.map((t) => ({ t, col: 0, red: false })), { t: MZE_LATE + 2, col: 0, red: true }, ...MZE_OUT.map((t) => ({ t, col: 1, red: false }))].sort((a, b) => a.t - b.t);
  const cur = writes.filter((w) => f >= w.t && f < w.t + 8).pop();
  const redPen = f >= MZE_LATE && f < MZE_LATE + 24;
  const nib = cur ? [Math.sin(f * 1.7) * 10, Math.cos(f * 2.3) * 2] : [0, 0];
  const curRow = cur ? (cur.col === 0 ? writes.filter((w) => w.col === 0 && w.t <= cur.t).length - 1 : writes.filter((w) => w.col === 1 && w.t <= cur.t).length - 1) : 2;
  const penX = (cur && cur.col === 1 ? 410 : 220) + 40 + nib[0];
  const penY = 680 + curRow * 8 + nib[1] - (cur ? 0 : 20);
  const handR: [number, number] = [penX + 14, penY - 24];
  const handL: [number, number] = [250, 690];
  const armTo = (sx: number, sy: number, h: [number, number]) => {
    const dx = h[0] - sx, dy = h[1] - sy;
    return { rot: (Math.atan2(-dx, dy) * 180) / Math.PI, len: Math.hypot(dx, dy) + 6 };
  };
  const aL = armTo(303, 622, handL), aR = armTo(437, 622, handR);
  const inRows = writes.filter((w) => w.col === 0).sort((a, b) => a.t - b.t);
  const outRows = writes.filter((w) => w.col === 1);
  const flinch = seg(f, MZE_LATE + 2, MZE_LATE + 5) * (1 - seg(f, MZE_LATE + 20, MZE_LATE + 26));
  const walkers = [
    ...MZE_IN.map((t, i) => ({ t, ph: i, fem: i % 2 === 1, out: false, late: false })),
    { t: MZE_LATE, ph: 7, fem: false, out: false, late: true },
    ...MZE_OUT.map((t, i) => ({ t, ph: 10 + i, fem: i % 2 === 0, out: true, late: false })),
  ];
  return (
    <Frame f={f} seed={6108} bg={MP.night}>
      <g transform={`translate(960 540) scale(${S}) translate(${-cx} ${-cy})`}>
        <KoujouMon f={f} gate={1} hands={hands} smoke={1} sky={sky} />
        {/* 製鉄所のすす (建物と門を黒く) */}
        <rect x={-60} y={440} width={2080} height={460} fill={MP.soot} opacity={0.45} />
        <rect x={-60} y={280} width={880} height={160} fill={MP.soot} opacity={0.45} />
        <rect x={1100} y={280} width={920} height={160} fill={MP.soot} opacity={0.45} />
        {/* 門の奥の炉の光と火の粉 */}
        <ellipse cx={960} cy={840} rx={210} ry={70} fill={C.furnace} opacity={0.3 + 0.06 * Math.sin(f / 3)} />
        <ellipse cx={960} cy={850} rx={120} ry={34} fill={C.furnaceGlow} opacity={0.45} />
        {Array.from({ length: 14 }, (_, i) => {
          const t = ((f / 40) + rnd(21, i)) % 1;
          return <circle key={i} cx={860 + rnd(22, i) * 200 + Math.sin(t * 6 + i) * 20} cy={840 - t * 380} r={3 + rnd(23, i) * 3} fill={C.furnaceGlow} opacity={1 - t} />;
        })}
        {/* 鉄くずの山 */}
        <g>
          <path d="M 1290 905 Q 1320 820 1380 840 Q 1440 800 1500 850 Q 1560 840 1580 905 Z" fill={MP.iron} stroke={INK} strokeWidth={4} />
          <MzEGear x={1400} y={850} r={26} n={10} rot={20} fill={MP.ironLight} />
          <path d="M 1320 880 L 1470 820 M 1450 890 L 1560 860" stroke={MP.ironLight} strokeWidth={10} strokeLinecap="round" />
          <path d="M 1320 880 L 1470 820 M 1450 890 L 1560 860" stroke={INK} strokeWidth={2} />
        </g>
        {/* 通る人たち */}
        {walkers.map((w, i) => {
          const dur = w.late ? 22 : 40;
          const hold = w.late ? 18 : 0;
          const t = w.out ? seg(f, w.t - 6, w.t - 6 + 40) : seg(f, w.t - dur, w.t + hold + 6);
          if (t <= 0 || t >= 1) return null;
          const gateX = w.late ? 1010 : 960;
          const tot = dur + hold + 6;
          const x = w.out ? lerp(960, 2100, t) : lerp(2100, gateX, Math.min(1, (t * tot) / dur));
          const inside = w.out ? seg(t, 0, 0.1) : seg(t, (dur + hold) / tot, 1);
          const op = w.out ? inside : 1 - inside;
          const look = x > 1080 && x < 1500;
          const isLate = w.late;
          const sq = isLate ? 1 - 0.1 * flinch : 1;
          const dir = w.out ? 1 : -1;
          const body = w.fem ? (
            <MzEPerson x={x} y={905} s={0.7} f={f} phase={w.ph} fem="long" hat="kerchief" cloth={C.enji} clothDark={C.enjiDark} skirt={C.enji} long apron
              gaze={look ? [0, -9] : [-5, 0]} face={look ? "normal" : "normal"} />
          ) : (
            <MzEPerson x={x} y={905} s={0.7} f={f} phase={w.ph} hat="hunting" cloth={C.shirt} clothDark={C.grayClothDark} vest={w.ph % 2 ? C.vestBrown : C.vestGray}
              pose={isLate && f < MZE_LATE + 1 ? "run" : "stand"} lean={isLate && f < MZE_LATE + 1 ? -10 : 0}
              face={isLate ? (f >= MZE_LATE + 2 ? "worried" : "surprised") : "normal"} gaze={isLate ? [8, 0] : look ? [0, -9] : [-5, 0]} />
          );
          return (
            <g key={i} opacity={op} transform={dir === 1 ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
              <g transform={`translate(${x} 905) scale(1 ${sq}) translate(${-x} -905)`}>{body}</g>
              {isLate && flinch > 0 && (
                <g opacity={flinch}>
                  {[-1, 1].map((sd) => <path key={sd} d={`M ${x + sd * 70} 720 l ${sd * 20} -14 M ${x + sd * 76} 750 l ${sd * 24} 0`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
                  <path d={`M ${x + 50} 690 q -8 12 0 18 q 8 -6 0 -18 Z`} fill="#8EC6E6" stroke={INK} strokeWidth={2.5} />
                </g>
              )}
            </g>
          );
        })}
        {/* 詰め所 (左の手前) */}
        <g>
          <rect x={20} y={260} width={680} height={860} fill={MP.brickDark} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 34 }, (_, r) => <line key={r} x1={20} y1={286 + r * 26} x2={700} y2={286 + r * 26} stroke={MP.mortar} strokeWidth={2.5} opacity={0.4} />)}
          <rect x={20} y={260} width={680} height={860} fill={MP.soot} opacity={0.3} />
          <path d="M -10 270 L 360 180 L 730 270 Z" fill="#4A4E58" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 4 }, (_, i) => <line key={i} x1={40 + i * 40} y1={262 - i * 20} x2={680 - i * 40} y2={262 - i * 20} stroke={INK} strokeWidth={2} opacity={0.4} />)}
          {/* 小窓の中 */}
          <rect x={100} y={370} width={540} height={340} fill="#7A6250" />
          <rect x={100} y={370} width={540} height={120} fill="#6A5444" />
          <circle cx={560} cy={440} r={110} fill={MP.glow} opacity={0.25} />
          <line x1={560} y1={370} x2={560} y2={420} stroke={INK} strokeWidth={3} />
          <rect x={545} y={420} width={30} height={34} fill="#F7E2A8" stroke={INK} strokeWidth={3} />
          <Flame x={560} y={448} s={0.6} f={f} glow={1} />
          {/* 棚の帳面の背 */}
          {[0, 1, 2, 3].map((i) => <rect key={i} x={130 + i * 30} y={400} width={24} height={70} fill={[C.enji, C.vestBrown, C.indigo, C.tweedDark][i]} stroke={INK} strokeWidth={2.5} />)}
          {/* 記録係 (小窓の中だけに見える) */}
          <defs><clipPath id={winClip}><rect x={100} y={370} width={540} height={332} /></clipPath></defs>
          <g clipPath={`url(#${winClip})`}>
          <MzEPerson x={370} y={770} s={1} f={f} phase={3} still cloth={C.coatBlack} clothDark={INK} glasses mustache
            face={redPen ? "angry" : "normal"} gaze={cur ? [0, 8] : [8, 2]} arms={[aL.rot, aR.rot]} armLen={[aL.len, aR.len]} armCloth={C.coatBlack} hands={false} />
          </g>
          {/* 窓台と帳面 */}
          <rect x={80} y={700} width={580} height={30} fill={MP.wood} stroke={INK} strokeWidth={5} />
          <rect x={80} y={730} width={580} height={20} fill={MP.woodDark} stroke={INK} strokeWidth={4} />
          <g>
            <path d="M 170 712 L 370 700 L 370 722 L 170 730 Z" fill={C.paperDark} stroke={INK} strokeWidth={3} />
            <path d="M 370 700 L 570 712 L 570 730 L 370 722 Z" fill={C.paperDark} stroke={INK} strokeWidth={3} />
            <path d="M 178 652 L 370 644 L 370 712 L 178 720 Z" fill={C.paper} stroke={INK} strokeWidth={4} />
            <path d="M 370 644 L 562 652 L 562 720 L 370 712 Z" fill={C.paper} stroke={INK} strokeWidth={4} />
            <text x={274} y={664} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={17} fill={INK}>出勤</text>
            <text x={466} y={664} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={17} fill={INK}>退勤</text>
            <line x1={190} y1={670} x2={360} y2={664} stroke={INK} strokeWidth={2} />
            <line x1={380} y1={664} x2={550} y2={670} stroke={INK} strokeWidth={2} />
            {inRows.map((w, i) => {
              const t = seg(f, w.t, w.t + 6);
              if (t <= 0) return null;
              const ry = 680 + i * 8;
              return (
                <g key={i}>
                  <path d={`M 196 ${ry} q 10 -6 20 0 t 20 0 t 20 0`} stroke={w.red ? C.redInk : INK} strokeWidth={w.red ? 5 : 2.5} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} />
                  <circle cx={300} cy={ry - 2} r={6} fill="none" stroke={w.red ? C.redInk : INK} strokeWidth={w.red ? 3.5 : 2} opacity={t} />
                  <path d={`M 300 ${ry - 2} l 0 -4 M 300 ${ry - 2} l 3 1`} stroke={w.red ? C.redInk : INK} strokeWidth={1.5} opacity={t} />
                  {w.red && <path d={`M 190 ${ry + 6} L 350 ${ry + 3}`} stroke={C.redInk} strokeWidth={5} opacity={t} strokeLinecap="round" />}
                  {!w.red && <path d={`M 330 ${ry - 4} l 5 5 l 10 -10`} stroke={INK} strokeWidth={2.5} fill="none" opacity={t} />}
                </g>
              );
            })}
            {outRows.map((w, i) => {
              const t = seg(f, w.t, w.t + 6);
              if (t <= 0) return null;
              const ry = 680 + i * 8;
              return (
                <g key={i}>
                  <path d={`M 388 ${ry} q 10 -6 20 0 t 20 0 t 20 0`} stroke={INK} strokeWidth={2.5} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} />
                  <circle cx={492} cy={ry - 2} r={6} fill="none" stroke={INK} strokeWidth={2} opacity={t} />
                  <path d={`M 492 ${ry - 2} l 0 -4 M 492 ${ry - 2} l -3 1`} stroke={INK} strokeWidth={1.5} opacity={t} />
                </g>
              );
            })}
          </g>
          {/* 左手 (帳面を押さえる) と右手の羽ペン (腕は記録係の2本だけ) */}
          <circle cx={handL[0]} cy={handL[1]} r={13} fill={C.skin} stroke={INK} strokeWidth={4} />
          <g transform={`translate(${penX} ${penY}) rotate(28)`}>
            <line x1={0} y1={0} x2={0} y2={-110} stroke={INK} strokeWidth={3.5} />
            <path d="M 0 -40 Q -16 -80 -4 -120 Q 14 -80 0 -40 Z" fill={C.paper} stroke={INK} strokeWidth={3} />
            <path d="M -3 0 L 3 0 L 2 -14 L -2 -14 Z" fill={redPen ? C.redInk : INK} />
            {redPen && <circle cx={0} cy={2} r={5} fill={C.redInk} opacity={0.8} />}
          </g>
          <circle cx={handR[0]} cy={handR[1]} r={13} fill={C.skin} stroke={INK} strokeWidth={4} />
          {/* 赤インクの壺 */}
          <path d="M 590 700 L 594 672 L 626 672 L 630 700 Z" fill={C.redInk} stroke={INK} strokeWidth={3} />
          <rect x={600} y={662} width={20} height={12} fill={INK} />
          {/* 窓枠 */}
          <rect x={100} y={370} width={540} height={340} fill="none" stroke={MP.woodDark} strokeWidth={16} />
          <rect x={100} y={370} width={540} height={340} fill="none" stroke={INK} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_097: (f) => <Mz097 f={f} />,
  mz_098: (f) => <Mz098 f={f} />,
  mz_099: (f) => <Mz099 f={f} />,
  mz_100: (f) => <Mz100 f={f} />,
  mz_101: (f) => <Mz101 f={f} />,
  mz_102: (f) => <Mz102 f={f} />,
  mz_103: (f) => <Mz103 f={f} />,
  mz_104: (f) => <Mz104 f={f} />,
  mz_105: (f) => <Mz105 f={f} />,
  mz_106: (f) => <Mz106 f={f} />,
  mz_107: (f) => <Mz107 f={f} />,
  mz_108: (f) => <Mz108 f={f} />,
};

export const MZ_E_MOTIFS: string[] = [
  "mz_097", // #97
  "mz_098", // #98
  "mz_099", // #99
  "mz_100", // #100
  "mz_101", // #101
  "mz_102", // #102
  "mz_103", // #103
  "mz_104", // #104
  "mz_105", // #105
  "mz_106", // #106
  "mz_107", // #107
  "mz_108", // #108
];

export const mezaEScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
