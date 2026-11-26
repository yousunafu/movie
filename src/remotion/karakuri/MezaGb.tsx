// 目覚まし回「人はなぜ、自力で起きられないのか」: 文#145〜#156 (12文)
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
  MachiNami, KnockerUp, BellClock, Clocky, NazoBell, MACHI_WIN, SHIN, Flame, mixColor,
} from "./MezaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/MP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  shopGreen: "#2F5A4A",
  shopGreenDark: "#1F3F33",
  shopGreenLight: "#4E7D69",
  gilt: "#C9A548",
  shopWall: "#E6C58C",
  shopWallStripe: "#D9B577",
  velvet: "#8C2F3A",
  velvetDark: "#651F29",
  velvetLight: "#B04A55",
  glass: "#BFDCEB",
  paper: "#EADBB2",
  paperDark: "#CDB98A",
  paperLight: "#F5EBCF",
  newsInk: "#4A4036",
  sepia: "#7A5A3A",
  coat: "#7D828B",
  coatDark: "#4A4E57",
  scarf: "#C8372B",
  plaster: "#D9CBAA",
  plasterDark: "#B9A985",
  beam: "#6B4A2E",
  quilt: "#8E6FA8",
  quiltDark: "#6B5085",
  quilt2: "#C9A04A",
  tin: "#A9B0B5",
  tinDark: "#7A8288",
  coin: "#C9A43A",
  coinDark: "#8E7224",
  capRed: "#C8413A",
  flatCap: "#6B6158",
  flatCapDark: "#4A433D",
  vest: "#3E4B66",
  vestDark: "#2E3850",
  dress: "#9C3B4A",
  dressDark: "#76293A",
  hairBrown: "#7A4A2A",
  apron: "#F2EBDD",
  nightshirt: "#E6DCC8",
  nightshirtDark: "#C9BCA2",
  cork: "#C9A36A",
  corkDark: "#A9844E",
  board: "#8A6038",
  boardDark: "#5E3F22",
  pin: "#D8432F",
  drum: "#C8413A",
  horn: "#E0B64A",
  balanceWood: "#9A6A3C",
} as const;
void W; void H; void FONT;
void PersonMini; void Stamp; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void SumahoAlarm; void TainaiDokei; void Kobito; void Shudouin; void TokiNoKane;
void BanninTou; void KoujouMon; void Clocky; void NazoBell; void TagPlate;

type Face = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type Pose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold" | "hang" | "sit";
type P = [number, number];

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
const useSafeId = (p: string) => p + React.useId().replace(/[^a-zA-Z0-9]/g, "");
/** カメラ: 世界の (cx, cy) を画面の中心に、sc 倍で */
const cam = (cx: number, cy: number, sc: number) => `translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`;
const bump = (f: number, a: number, b: number) => Math.sin(Math.PI * seg(f, a, b));

// ===== BellClock を「足の裏 (x,y)・全体の高さ h」で置く =====
//   部品の実寸 (s=1): 文字盤の中心から足の裏まで 162・ベルのてっぺんまで 184 → 高さ 346
const BC_H = 346;
const BC_FOOT = 162;
const MzGbBC: React.FC<{
  x: number; y: number; h: number; f: number; ring?: number; time?: number; alarm?: number; rot?: number; snooze?: boolean;
}> = ({ x, y, h, f, ring = 0, time, alarm, rot = 0, snooze }) => {
  const s = h / BC_H;
  return <BellClock x={x} y={y - BC_FOOT * s} s={s} f={f} ring={ring} time={time} alarm={alarm} rot={rot} snooze={snooze} />;
};
/** BellClock の文字盤の中心 */
const bcDial = (x: number, y: number, h: number): P => [x, y - (BC_FOOT * h) / BC_H];

// ===== KnockerUp を「足元 (x,y)・帽子のてっぺんまでの高さ h」で置く (s=1 で高さ 334) =====
const KU_H = 334;
const kuS = (h: number) => h / KU_H;

// ===== れんが =====
const MzGbBricks: React.FC<{ x: number; y: number; w: number; h: number; bw?: number; bh?: number; seed?: number }> = ({
  x, y, w, h, bw = 64, bh = 26, seed = 1,
}) => {
  const id = useSafeId("mzgbBr");
  const rows = Math.ceil(h / bh) + 1, cols = Math.ceil(w / bw) + 2;
  return (
    <g>
      <defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={MP.mortar} />
        {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
          const v = rnd(seed + r * 3, c);
          return <rect key={`${r}-${c}`} x={x + c * bw - (r % 2) * (bw / 2) - bw / 2} y={y + r * bh} width={bw - 5} height={bh - 5} rx={2}
            fill={v < 0.2 ? MP.brickDark : v > 0.82 ? MP.brickLight : MP.brick} />;
        }))}
      </g>
    </g>
  );
};

// ===== 木目 =====
const MzGbGrain: React.FC<{ x: number; y: number; w: number; h: number; n?: number; seed?: number; color?: string; vertical?: boolean }> = ({
  x, y, w, h, n = 3, seed = 1, color = MP.woodDark, vertical = false,
}) => (
  <g stroke={color} strokeWidth={3} opacity={0.45} fill="none" strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const k = (i + 0.5) / n;
      const j = (rnd(seed, i) - 0.5) * 10;
      return vertical
        ? <path key={i} d={`M ${x + w * k} ${y + 6} q ${j} ${h * 0.3} 0 ${h * 0.5} q ${-j} ${h * 0.2} 0 ${h * 0.5 - 12}`} />
        : <path key={i} d={`M ${x + 6} ${y + h * k} q ${w * 0.3} ${j} ${w * 0.5} 0 q ${w * 0.2} ${-j} ${w * 0.5 - 12} 0`} />;
    })}
  </g>
);

// ===== 腕 (肩 a → ひじ b → 手 c)。Person と同じ太さ・同じ手 =====
const MzGbArm: React.FC<{ a: P; b: P; c: P; cloth: string; w?: number; hand?: boolean; palm?: boolean }> = ({
  a, b, c, cloth, w = 22, hand = true, palm = false,
}) => (
  <g>
    <path d={`M ${a[0]} ${a[1]} Q ${b[0]} ${b[1]} ${c[0]} ${c[1]}`} stroke={C.ink} strokeWidth={w + 9} fill="none" strokeLinecap="round" />
    <path d={`M ${a[0]} ${a[1]} Q ${b[0]} ${b[1]} ${c[0]} ${c[1]}`} stroke={cloth} strokeWidth={w} fill="none" strokeLinecap="round" />
    {hand && (palm
      ? <ellipse cx={c[0]} cy={c[1]} rx={w * 0.85} ry={w * 0.55} fill={KRP.white} stroke={C.ink} strokeWidth={w * 0.2} />
      : <circle cx={c[0]} cy={c[1]} r={w * 0.62} fill={KRP.white} stroke={C.ink} strokeWidth={w * 0.2} />)}
  </g>
);

// ===== 町の人 (Person + 帽子・髪・スカート)。座標は Person と同じ (x,y=足元)
//   part: "full" ふつう / "armless" 腕を消す (腕は arms に自分で描く) / "head" 頭だけ
type Wear = "none" | "nightcap" | "flatcap" | "bun" | "messy" | "bunNight";
const MzGbFolk: React.FC<{
  x: number; y: number; s?: number; rot?: number; f?: number; phase?: number;
  face?: Face; cloth?: string; clothDark?: string; wear?: Wear; woman?: boolean; skirt?: boolean; apron?: boolean;
  part?: "full" | "armless" | "head"; pose?: Pose; gaze?: [number, number]; eyesShut?: boolean;
  arms?: React.ReactNode; behind?: React.ReactNode; over?: React.ReactNode;
}> = ({
  x, y, s = 1, rot = 0, f = 0, phase = 0, face = "normal", cloth = C.vest, clothDark = C.vestDark,
  wear = "none", woman = false, skirt = false, apron = false, part = "full", pose = "stand", gaze, eyesShut = false,
  arms, behind, over,
}) => {
  const id = useSafeId("mzgbFolk");
  const clip = part !== "full";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {clip && (
        <defs>
          <clipPath id={id}>
            <rect x={-300} y={-460} width={600} height={298} />
            {part === "armless" && <rect x={-61} y={-170} width={122} height={200} />}
          </clipPath>
        </defs>
      )}
      {behind}
      {/* 女性: 後ろで結んだ髪の房 (頭のうしろ) と肩までの髪 */}
      {woman && (
        <g>
          <circle cx={50} cy={-282} r={26} fill={C.hairBrown} stroke={C.ink} strokeWidth={4.5} />
          <path d="M 62 -296 q 18 -6 22 10" stroke={mixColor(C.hairBrown, "#000000", 0.3)} strokeWidth={4} fill="none" />
          <path d="M -64 -236 Q -78 -196 -66 -160 L -48 -164 Q -56 -200 -52 -232 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
          <path d="M 64 -236 Q 78 -196 66 -160 L 48 -164 Q 56 -200 52 -232 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
      <g clipPath={clip ? `url(#${id})` : undefined}>
        <Person x={0} y={0} s={1} f={f} phase={phase} face={face} pose={clip ? "stand" : pose} still
          cloth={cloth} clothDark={clothDark} hair={woman ? "none" : "cap"} gaze={gaze} />
      </g>
      {/* 女性の前髪 (茶色) */}
      {woman && <path d="M -62 -240 Q -64 -292 0 -294 Q 64 -292 62 -240 Q 40 -270 -4 -266 Q -30 -262 -62 -240 Z" fill={C.hairBrown} stroke={C.ink} strokeWidth={3} />}
      {/* 長いスカート (くるぶしまで) とエプロン */}
      {skirt && part !== "head" && (
        <g>
          <path d="M -60 -70 L 60 -70 L 94 -10 Q 0 2 -94 -10 Z" fill={cloth} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -30 -66 L -46 -10 M 0 -66 L 0 -6 M 30 -66 L 46 -10" stroke={clothDark} strokeWidth={4} opacity={0.7} />
          <ellipse cx={-22} cy={-3} rx={18} ry={7} fill={C.ink} />
          <ellipse cx={22} cy={-3} rx={18} ry={7} fill={C.ink} />
        </g>
      )}
      {apron && part !== "head" && (
        <g>
          <path d="M -42 -72 L 42 -72 L 54 -18 Q 0 -10 -54 -18 Z" fill={C.apron} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <rect x={-28} y={-144} width={56} height={74} rx={6} fill={C.apron} stroke={C.ink} strokeWidth={4} />
          <path d="M -58 -74 L 58 -74" stroke={C.apron} strokeWidth={6} />
        </g>
      )}
      {/* 眠った目 */}
      {eyesShut && (
        <g>
          <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
          <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
          <path d="M -36 -220 Q -24 -210 -12 -220 M 12 -220 Q 24 -210 36 -220" stroke={C.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* 帽子・髪 */}
      {(wear === "nightcap" || wear === "bunNight") && (
        <g>
          <path d={`M -64 -252 Q -66 -318 4 -322 Q 78 -324 ${116 + Math.sin(f / 11 + phase) * 4} -268 Q 88 -290 64 -252 Z`} fill={C.capRed} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <path d="M -40 -300 Q 10 -290 40 -312 M -52 -278 Q 20 -268 70 -292" stroke={KRP.white} strokeWidth={6} fill="none" />
          <path d="M -66 -250 Q 0 -284 66 -250 L 64 -238 Q 0 -270 -64 -238 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <circle cx={118 + Math.sin(f / 11 + phase) * 4} cy={-262} r={15} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
      {wear === "flatcap" && (
        <g>
          <path d="M -66 -250 Q -64 -308 2 -308 Q 66 -306 68 -252 Q 0 -272 -66 -250 Z" fill={C.flatCap} stroke={C.ink} strokeWidth={4.5} />
          <path d="M 6 -262 Q 72 -274 100 -252 Q 66 -240 4 -250 Z" fill={C.flatCapDark} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -40 -290 Q 0 -298 40 -290" stroke={C.flatCapDark} strokeWidth={3} fill="none" />
        </g>
      )}
      {wear === "messy" && (
        <g stroke={C.ink} strokeWidth={7} strokeLinecap="round">
          {[-50, -28, -6, 16, 38, 56].map((hx, i) => (
            <line key={i} x1={hx} y1={-284} x2={hx + (i % 2 ? 16 : -14)} y2={-318 - (i % 3) * 8} />
          ))}
        </g>
      )}
      {arms}
      {over}
    </g>
  );
};

// ===== 擬音の文字 (白抜き・ぽんと出る) =====
const MzGbOno: React.FC<{ x: number; y: number; text: string; size?: number; rot?: number; t?: number; color?: string; opacity?: number }> = ({
  x, y, text, size = 60, rot = 0, t = 1, color = KRP.white, opacity = 1,
}) => {
  const sc = pop(clamp01(t));
  if (sc <= 0.01 || opacity <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={opacity}>
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size}
        fill={color} stroke={C.ink} strokeWidth={size * 0.12} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};

// ===== 衝撃の星 (バン!) =====
const MzGbBurst: React.FC<{ x: number; y: number; r: number; t: number; color?: string }> = ({ x, y, r, t, color = KRP.yellow }) => {
  if (t <= 0.01) return null;
  const n = 12;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = (i % 2 ? r * 0.55 : r) * (0.7 + 0.3 * t);
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
  }).join(" ");
  return <polygon points={pts} fill={color} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" opacity={clamp01(t * 1.5)} />;
};

// ===== 小さな顔 (目覚まし時計の上に浮かぶ吹き出しの顔) =====
const MzGbClockFace: React.FC<{ x: number; y: number; s?: number; mood: "smile" | "bow" | "meh"; t?: number; f: number }> = ({ x, y, s = 1, mood, t = 1, f }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0.01) return null;
  const bob = Math.sin(f / 10) * 4;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${sc})`}>
      <path d="M -54 -40 Q -60 -78 0 -80 Q 60 -78 56 -40 Q 54 -6 10 -4 L 0 14 L -8 -4 Q -52 -6 -54 -40 Z" fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      {mood === "meh" ? (
        <g stroke={C.ink} strokeWidth={5} strokeLinecap="round">
          <line x1={-26} y1={-48} x2={-10} y2={-48} />
          <line x1={10} y1={-48} x2={26} y2={-48} />
          <line x1={-10} y1={-24} x2={10} y2={-24} />
        </g>
      ) : (
        <g>
          <path d="M -26 -46 Q -18 -56 -10 -46 M 10 -46 Q 18 -56 26 -46" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M -14 -30 Q 0 -16 14 -30" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={-32} cy={-30} rx={7} ry={4} fill="#F2A7A0" />
          <ellipse cx={32} cy={-30} rx={7} ry={4} fill="#F2A7A0" />
        </g>
      )}
    </g>
  );
};

// ===== くしゃくしゃの新聞 (#146・#147) =====
const MzGbPaperBall: React.FC<{ x: number; y: number; r: number; rot?: number }> = ({ x, y, r, rot = 0 }) => {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const rr = r * (0.82 + rnd(47, i) * 0.3);
    return `${Math.cos(a) * rr},${Math.sin(a) * rr * 0.86}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts} fill={C.paper} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${-r * 0.6} ${-r * 0.2} L ${-r * 0.1} ${r * 0.1} L ${r * 0.3} ${-r * 0.4} M ${-r * 0.2} ${r * 0.5} L ${r * 0.2} ${r * 0.05} L ${r * 0.65} ${r * 0.25}`}
        stroke={C.paperDark} strokeWidth={3.5} fill="none" strokeLinejoin="round" />
      {[-0.4, -0.15, 0.15].map((k, i) => (
        <line key={i} x1={-r * 0.45} y1={r * k} x2={r * (0.1 + i * 0.12)} y2={r * k + 6} stroke={C.newsInk} strokeWidth={3} opacity={0.55} />
      ))}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #145 19世紀には、もう目覚まし時計は、ありました。
// 格: 山 / seed 6145
// どこ: 19世紀イギリスの夜の時計店。緑の木の店構え・大きな1枚ガラスのショーウィンドウ・中はガス灯の明かりと壁の時計。
//       ガラスには通りの長屋 (MachiNami) がうっすら左右反転で映る。
// 演出: ビロードの段の上に BellClock が大小5つ。真ん中は画面の短辺の半分以上。値札は数字なし。
//       ガラスに、通りかかるノッカー・アップが映り込み、時計を見て立ち止まり、むっとする。
//       真ん中の時計がチリッと一瞬鳴って、からかう。
// 動き: f0-34 ウィンドウ全景から真ん中へ寄る / f8-28 映り込みが歩いてきて止まる / f32-42 チリッ /
//       f36- むっとする (ムッ) / f92-100 もう一度チリッ / 壁の振り子・ガス灯のゆらぎ
const Mz145: React.FC<{ f: number }> = ({ f }) => {
  const id = useSafeId("mz145");
  const zoom = easeInOut(seg(f, 0, 34));
  const sc = lerp(1, 1.3, zoom);
  const cy = lerp(540, 520, zoom);
  const walk = easeOut(seg(f, 8, 28));
  const kuX = lerp(2050, 1255, walk);
  const chirp = Math.max(bump(f, 32, 42), bump(f, 92, 100));
  const grumpy = f >= 36;
  const pend = Math.sin(f / 9) * 14;
  const GX = 170, GY = 150, GW = 1580, GH = 640;
  const wallClocks: [number, number, number, number][] = [[420, 250, 52, 130], [700, 226, 44, 400], [1230, 226, 44, 615], [1500, 250, 52, 75]];
  return (
    <Frame f={f} seed={6145} dark bg={C.shopGreenDark}>
      <g transform={cam(960, cy, sc)}>
        {/* 店構え (緑の木・金の飾り線。文字は書かない) */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.shopGreen} />
        <rect x={-40} y={-40} width={2000} height={150} fill={C.shopGreenDark} stroke={C.ink} strokeWidth={6} />
        <rect x={120} y={22} width={1680} height={70} rx={8} fill={C.shopGreen} stroke={C.gilt} strokeWidth={5} />
        <rect x={136} y={36} width={1648} height={42} rx={4} fill="none" stroke={C.gilt} strokeWidth={2.5} opacity={0.7} />
        {[0, 1].map((k) => {
          const px = k ? 1770 : 0;
          return (
            <g key={k}>
              <rect x={px} y={110} width={150} height={970} fill={C.shopGreenLight} stroke={C.ink} strokeWidth={6} />
              <rect x={px + 24} y={150} width={102} height={620} rx={6} fill="none" stroke={C.shopGreenDark} strokeWidth={5} />
              <rect x={px + 14} y={110} width={122} height={30} fill={C.shopGreen} stroke={C.ink} strokeWidth={4} />
              <path d={`M ${px + 40} 190 L ${px + 40} 730 M ${px + 110} 190 L ${px + 110} 730`} stroke={C.gilt} strokeWidth={3} opacity={0.6} />
            </g>
          );
        })}
        {/* 店の中: 壁紙・腰板・壁の時計 */}
        <defs><clipPath id={id}><rect x={GX} y={GY} width={GW} height={GH} /></clipPath></defs>
        <g clipPath={`url(#${id})`}>
          <rect x={GX} y={GY} width={GW} height={GH} fill={C.shopWall} />
          {Array.from({ length: 27 }, (_, i) => <rect key={i} x={GX + i * 60} y={GY} width={18} height={GH} fill={C.shopWallStripe} opacity={0.7} />)}
          <rect x={GX} y={470} width={GW} height={330} fill={MP.woodDark} />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={GX + 20 + i * 176} y={490} width={150} height={120} rx={6} fill="none" stroke={MP.wood} strokeWidth={4} />)}
          {/* 壁の棚 */}
          <rect x={GX} y={330} width={GW} height={18} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
          {wallClocks.map(([wx, wy, r, mins], i) => (
            <g key={i}>
              <circle cx={wx} cy={wy} r={r + 10} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
              <circle cx={wx} cy={wy} r={r} fill={C.paperLight} stroke={C.ink} strokeWidth={3} />
              {Array.from({ length: 12 }, (_, k) => (
                <line key={k} x1={wx} y1={wy - r + 4} x2={wx} y2={wy - r + 10} stroke={C.ink} strokeWidth={3} transform={`rotate(${k * 30} ${wx} ${wy})`} />
              ))}
              <line x1={wx} y1={wy} x2={wx} y2={wy - r * 0.5} stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${(mins / 720) * 360} ${wx} ${wy})`} />
              <line x1={wx} y1={wy} x2={wx} y2={wy - r * 0.8} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${(mins % 60) * 6} ${wx} ${wy})`} />
            </g>
          ))}
          {/* 振り子の柱時計 (奥の真ん中・ゆっくり振れる) */}
          <g>
            <rect x={900} y={170} width={120} height={300} rx={10} fill={MP.woodDark} stroke={C.ink} strokeWidth={5} />
            <circle cx={960} cy={220} r={40} fill={C.paperLight} stroke={C.ink} strokeWidth={4} />
            <rect x={918} y={280} width={84} height={170} fill="#3A2A1C" stroke={C.ink} strokeWidth={3} />
            <g transform={`rotate(${pend} 960 284)`}>
              <line x1={960} y1={284} x2={960} y2={420} stroke={MP.brassDark} strokeWidth={4} />
              <circle cx={960} cy={424} r={18} fill={MP.brass} stroke={C.ink} strokeWidth={3.5} />
            </g>
          </g>
          {/* ガス灯 (店の中の壁付き) */}
          {[300, 1620].map((lx, i) => (
            <g key={lx}>
              <circle cx={lx} cy={232} r={150} fill={MP.glow} opacity={0.22} />
              <path d={`M ${lx} 300 L ${lx} 270 Q ${lx} 250 ${lx + (i ? -30 : 30)} 250`} stroke={MP.brassDark} strokeWidth={8} fill="none" />
              <ellipse cx={lx} cy={240} rx={30} ry={36} fill="#FFF1C4" stroke={C.ink} strokeWidth={4} opacity={0.9} />
              <Flame x={lx} y={258} s={0.75} f={f} phase={i * 3} glow={1.2} />
            </g>
          ))}
          {/* ビロードの段 */}
          {[[300, 700, 560], [1220, 1620, 560]].map(([x0, x1, ty], i) => (
            <g key={i}>
              <rect x={x0} y={ty} width={x1 - x0} height={140} fill={C.velvetDark} stroke={C.ink} strokeWidth={5} />
              <rect x={x0} y={ty} width={x1 - x0} height={16} fill={C.velvetLight} stroke={C.ink} strokeWidth={3} />
              {[0.25, 0.5, 0.75].map((k) => <path key={k} d={`M ${lerp(x0, x1, k)} ${ty + 20} q 6 60 0 120`} stroke={C.velvet} strokeWidth={6} fill="none" />)}
            </g>
          ))}
          <rect x={GX} y={690} width={GW} height={110} fill={C.velvet} stroke={C.ink} strokeWidth={5} />
          <path d={`M ${GX} 698 L ${GX + GW} 698`} stroke={C.velvetLight} strokeWidth={8} />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${GX + 60 + i * 130} 706 q 8 40 0 90`} stroke={C.velvetDark} strokeWidth={6} fill="none" />)}
          {/* 真ん中の台 (木の丸台) */}
          <rect x={790} y={650} width={340} height={60} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={960} cy={650} rx={170} ry={24} fill={MP.woodLight} stroke={C.ink} strokeWidth={5} />
          <MzGbGrain x={800} y={664} w={320} h={40} n={2} seed={4} />
          {/* 目覚まし時計 大小5つ (値札は数字なし) */}
          <MzGbBC x={220} y={752} h={150} f={f} time={7 * 60 + 10} />
          <MzGbBC x={1700} y={752} h={150} f={f} time={4 * 60 + 50} />
          <MzGbBC x={420} y={572} h={250} f={f} time={10 * 60 + 8} />
          <MzGbBC x={1500} y={572} h={250} f={f} time={1 * 60 + 52} />
          <MzGbBC x={960} y={656} h={480} f={f} ring={0.3 * chirp} time={6 * 60} />
          {[[520, 520, -12], [1400, 520, 10], [300, 720, -8], [1620, 722, 8]].map(([tx, ty, r], i) => (
            <g key={i} transform={`rotate(${r + Math.sin(f / 23 + i) * 2} ${tx} ${ty - 30})`}>
              <line x1={tx} y1={ty - 30} x2={tx} y2={ty} stroke={C.ink} strokeWidth={2.5} />
              <rect x={tx - 26} y={ty} width={52} height={34} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
              <circle cx={tx} cy={ty + 7} r={3.5} fill={C.ink} />
              <line x1={tx - 14} y1={ty + 22} x2={tx + 14} y2={ty + 22} stroke={C.gilt} strokeWidth={3} />
            </g>
          ))}
          {/* チリッ (真ん中の時計) */}
          {chirp > 0.05 && <MzGbOno x={1210} y={260} text="チリッ" size={56} rot={10} t={chirp * 1.4} color={MP.brassLight} opacity={chirp} />}
          {/* ガラス: 通りの映り込み (長屋を左右反転でうっすら) */}
          <g opacity={0.14} transform="translate(1920 0) scale(-1 1)">
            <MachiNami f={f} sky={0} windows={[0, 1, 0, 0, 1, 0]} />
          </g>
          {/* ガラスに映るノッカー・アップ */}
          <g opacity={0.5}>
            <KnockerUp x={kuX} y={1000} s={kuS(600)} f={f} pose="walk" dir={-1} face={grumpy ? "worried" : "normal"} phase={2} />
            {grumpy && (
              <g opacity={seg(f, 36, 42)}>
                {[0, 1, 2].map((k) => {
                  const t = ((f / 14 + k / 3) % 1);
                  return <circle key={k} cx={kuX + 130 + t * 50} cy={440 - t * 70} r={12 + t * 18} fill={KRP.white} stroke={C.ink} strokeWidth={3} opacity={1 - t} />;
                })}
              </g>
            )}
          </g>
          {grumpy && <MzGbOno x={kuX + 150} y={330} text="ムッ" size={64} rot={-8} t={seg(f, 36, 42)} color="#F6C9C0" />}
          {/* ガラスのつや */}
          <rect x={GX} y={GY} width={GW} height={GH} fill={C.glass} opacity={0.08} />
          {[[260, 0], [520, 60], [1340, 0]].map(([gx, d], i) => (
            <path key={i} d={`M ${gx} ${GY} L ${gx + 140} ${GY} L ${gx - 160 + d} ${GY + GH} L ${gx - 300 + d} ${GY + GH} Z`} fill={KRP.white} opacity={0.07 + (i % 2) * 0.04} />
          ))}
        </g>
        {/* 窓わく・欄間の横木 */}
        <rect x={GX - 14} y={GY - 14} width={GW + 28} height={GH + 28} fill="none" stroke={C.ink} strokeWidth={10} />
        <rect x={GX - 8} y={GY - 8} width={GW + 16} height={GH + 16} fill="none" stroke={C.gilt} strokeWidth={4} />
        {/* 下の腰板と歩道 */}
        <rect x={150} y={800} width={1620} height={260} fill={C.shopGreen} stroke={C.ink} strokeWidth={6} />
        <rect x={130} y={790} width={1660} height={24} fill={C.shopGreenLight} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={190 + i * 312} y={840} width={260} height={150} rx={6} fill="none" stroke={C.shopGreenDark} strokeWidth={6} />)}
        <rect x={-40} y={1000} width={2000} height={120} fill="#857B73" />
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-40 + i * 96} y1={1000} x2={-60 + i * 96} y2={1120} stroke={C.ink} strokeWidth={2.5} opacity={0.5} />)}
      </g>
      <TagPlate x={1640} y={110} text="19世紀 イギリス" size={40} t={seg(f, 2, 14)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #146 1896年には、「もうノッカー・アップにお金を払わなくていい」という、目覚まし時計の広告まで出ています。
// 格: 山 / seed 6146
// どこ: 朝の長屋の玄関先 (MachiNami を大きく寄せて、ぼかした背景)。戸口に棒が立てかけてある。
//       手前に、配達された1896年の新聞 (黄ばんだ紙・細かい活字の段組み・インクのかすれ) を両手で広げる。
// 演出: 広告欄に銅版画風 (セピア) の BellClock と、赤いバツで消された銅版画のノッカー・アップ。字は書かない。
//       バツが赤く光り、広告の時計が色つきで紙から飛び出してジリリ。紙には時計の形の白い抜けあと。
//       新聞を持つ灰色のコートの両手 (本人) がぷるぷる震え、新聞がくしゃっと握られる。
// 動き: f0-14 年代札 / f8-30 広告欄へ寄る / f22-32 バツが赤く光る / f28-40 時計が飛び出して鳴る /
//       f34- 手が震える / f80-130 新聞がしわくちゃに縮む
const Mz146: React.FC<{ f: number }> = ({ f }) => {
  const id = useSafeId("mz146");
  const zoom = easeInOut(seg(f, 8, 30));
  const sc = lerp(1, 1.38, zoom) - 0.12 * easeInOut(seg(f, 150, 200));
  const cx = lerp(960, 880, zoom), cy = lerp(540, 500, zoom);
  const xg = seg(f, 22, 32);
  const glow = xg * (0.7 + 0.3 * Math.sin(f / 3));
  const jump = easeOut(seg(f, 28, 40));
  const ringA = f >= 34 ? 1 : 0;
  const shake = seg(f, 34, 60) * (1 + seg(f, 80, 120));
  const jx = Math.sin(f * 2.1) * 5 * shake, jy = Math.cos(f * 2.7) * 4 * shake;
  const crum = easeInOut(seg(f, 80, 130));
  const PW = 1180, PH = 760, PX = 370, PY = 110;
  // 紙のふち (しわくちゃになるほどギザギザ)
  const edge = (): string => {
    const pts: string[] = [];
    const N = 14;
    for (let i = 0; i < N; i++) pts.push(`${PX + (PW * i) / N},${PY + (rnd(3, i) - 0.5) * 50 * crum}`);
    for (let i = 0; i < N; i++) pts.push(`${PX + PW + (rnd(5, i) - 0.5) * 50 * crum},${PY + (PH * i) / N}`);
    for (let i = N; i > 0; i--) pts.push(`${PX + (PW * i) / N},${PY + PH + (rnd(7, i) - 0.5) * 50 * crum}`);
    for (let i = N; i > 0; i--) pts.push(`${PX + (rnd(9, i) - 0.5) * 50 * crum},${PY + (PH * i) / N}`);
    return pts.join(" ");
  };
  const AX = PX + 250, AY = PY + 170, AW = 680, AH = 450;
  const clockP: P = [AX + 190, AY + 390];
  const kuP: P = [AX + 500, AY + 400];
  return (
    <Frame f={f} seed={6146} bg={MP.dawnSoft}>
      {/* 背景: 朝の長屋の戸口 (大きく寄せてぼかす) */}
      <g transform={cam(380, 640, 1.9)}>
        <MachiNami f={f} sky={1.3} windows={[0, 1, 0, 0, 0, 0]} />
        {/* 戸口に立てかけた棒 */}
        <line x1={448} y1={858} x2={520} y2={420} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
        <line x1={448} y1={858} x2={520} y2={420} stroke={MP.woodLight} strokeWidth={6} strokeLinecap="round" />
        {[-30, -10, 10, 30].map((d) => <path key={d} d={`M 520 420 l ${d * 0.6} -26`} stroke={MP.ironLight} strokeWidth={2.5} />)}
      </g>
      <rect x={-40} y={-40} width={2000} height={1160} fill={KRP.white} opacity={0.32} />
      <g transform={`${cam(cx, cy, sc)} translate(${jx} ${jy})`}>
        <g transform={`translate(960 490) scale(${1 - 0.2 * crum} ${1 - 0.1 * crum}) rotate(${-2 + crum * 5}) translate(-960 -490)`}>
          {/* 新聞の紙 */}
          <polygon points={edge()} fill={C.paper} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <defs><clipPath id={id}><polygon points={edge()} /></clipPath>
            <clipPath id={`${id}ad`}><rect x={AX + 14} y={AY + 14} width={AW - 28} height={AH - 28} /></clipPath>
            <filter id={`${id}sep`}><feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0" /></filter></defs>
          <g clipPath={`url(#${id})`}>
            <rect x={PX} y={PY} width={PW} height={PH} fill={C.paperLight} opacity={0.35} />
            {/* 題字の帯 (字は書かず、飾りの線だけ) */}
            <rect x={PX + 40} y={PY + 24} width={PW - 80} height={80} fill="none" stroke={C.newsInk} strokeWidth={3} />
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M ${PX + 300 + i * 66} ${PY + 44} q 10 -6 20 0 l 0 40 q -10 6 -20 0 Z`} fill={C.newsInk} opacity={0.75} />
            ))}
            <line x1={PX + 40} y1={PY + 120} x2={PX + PW - 40} y2={PY + 120} stroke={C.newsInk} strokeWidth={4} />
            <line x1={PX + 40} y1={PY + 148} x2={PX + PW - 40} y2={PY + 148} stroke={C.newsInk} strokeWidth={2} />
            <text x={PX + PW / 2} y={PY + 142} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={20} fill={C.newsInk}>1896</text>
            {/* 段組みの活字 (細い線) */}
            {Array.from({ length: 5 }, (_, c) => {
              const x0 = PX + 40 + c * 222;
              return Array.from({ length: 40 }, (_, r) => {
                const ly = PY + 172 + r * 14;
                const inAd = x0 + 200 > AX && x0 < AX + AW && ly > AY - 10 && ly < AY + AH + 10;
                if (inAd) return null;
                const w = 190 - (r % 7 === 6 ? 80 : rnd(c * 11, r) * 26);
                return <rect key={`${c}-${r}`} x={x0} y={ly} width={w} height={6} fill={C.newsInk} opacity={0.38 + rnd(c, r) * 0.25} />;
              });
            })}
            {[1, 2, 3, 4].map((c) => <line key={c} x1={PX + 34 + c * 222 - 10} y1={PY + 166} x2={PX + 34 + c * 222 - 10} y2={PY + PH - 20} stroke={C.newsInk} strokeWidth={2} opacity={0.5} />)}
            {/* 黄ばみ・しみ */}
            <ellipse cx={PX + 1050} cy={PY + 640} rx={120} ry={70} fill={C.paperDark} opacity={0.35} />
            <ellipse cx={PX + 120} cy={PY + 90} rx={90} ry={40} fill={C.paperDark} opacity={0.3} />
            {/* 広告欄 (二重のわく) */}
            <rect x={AX} y={AY} width={AW} height={AH} fill={C.paperLight} stroke={C.newsInk} strokeWidth={6} />
            <rect x={AX + 12} y={AY + 12} width={AW - 24} height={AH - 24} fill="none" stroke={C.newsInk} strokeWidth={2.5} />
            {/* 銅版画の飾り (かけ線) */}
            <g stroke={C.sepia} strokeWidth={2} opacity={0.3}>
              {Array.from({ length: 30 }, (_, i) => <line key={i} x1={AX + 20 + i * 22} y1={AY + 20} x2={AX + 20 + i * 22 - 60} y2={AY + AH - 20} />)}
            </g>
            {/* 銅版画の BellClock (飛び出すと、紙に白い抜けあとが残る) */}
            <g opacity={1 - jump}>
              <g filter={`url(#${id}sep)`}>
                <MzGbBC x={clockP[0]} y={clockP[1]} h={330} f={f} />
              </g>
            </g>
            {jump > 0 && (
              <circle cx={clockP[0]} cy={bcDial(clockP[0], clockP[1], 330)[1]} r={106 * jump} fill={C.paperLight} stroke={C.newsInk} strokeWidth={4} strokeDasharray="12 10" />
            )}
            {/* 銅版画のノッカー・アップ と 赤いバツ */}
            <g filter={`url(#${id}sep)`} opacity={0.9} clipPath={`url(#${id}ad)`}>
              <KnockerUp x={kuP[0]} y={kuP[1]} s={kuS(330)} f={0} pose="walk" dir={-1} />
            </g>
            <circle cx={kuP[0]} cy={kuP[1] - 170} r={150} fill={MP.bell} opacity={0.18 * glow} />
            <XMark x={kuP[0]} y={kuP[1] - 170} s={1.9} t={xg} />
            {/* インクのかすれ */}
            {Array.from({ length: 14 }, (_, i) => (
              <circle key={i} cx={PX + rnd(21, i) * PW} cy={PY + rnd(22, i) * PH} r={2 + rnd(23, i) * 4} fill={C.newsInk} opacity={0.3} />
            ))}
            {/* しわの線 */}
            {crum > 0.02 && (
              <g stroke={C.paperDark} strokeWidth={5} fill="none" opacity={crum} strokeLinejoin="round">
                <path d={`M ${PX} ${PY + 220} L ${PX + 300} ${PY + 300} L ${PX + 520} ${PY + 180} L ${PX + 860} ${PY + 340} L ${PX + PW} ${PY + 260}`} />
                <path d={`M ${PX + 200} ${PY} L ${PX + 330} ${PY + 380} L ${PX + 250} ${PY + PH}`} />
                <path d={`M ${PX + 900} ${PY} L ${PX + 760} ${PY + 420} L ${PX + 940} ${PY + PH}`} />
                <path d={`M ${PX} ${PY + 560} L ${PX + 420} ${PY + 500} L ${PX + 700} ${PY + 620} L ${PX + PW} ${PY + 540}`} />
              </g>
            )}
          </g>
          {/* 飛び出した BellClock (色つき・ジリリ) */}
          {jump > 0 && (
            <g transform={`translate(${clockP[0]} ${clockP[1] - 60 * jump}) scale(${lerp(1, 1.35, jump)}) translate(${-clockP[0]} ${-clockP[1]})`}>
              <ellipse cx={clockP[0]} cy={clockP[1] + 8} rx={120} ry={18} fill={C.ink} opacity={0.15 * jump} />
              <MzGbBC x={clockP[0]} y={clockP[1]} h={330} f={f} ring={ringA} />
            </g>
          )}
          {ringA > 0 && <MzGbOno x={clockP[0] + 330} y={AY + 10} text="ジリリリ" size={58} rot={-6} t={seg(f, 34, 42)} color={MP.brassLight} />}
        </g>
        {/* 新聞を持つ両手 (灰色のコートの袖・本人) */}
        {[-1, 1].map((sd) => {
          const hx = sd === -1 ? 400 + 120 * crum : 1520 - 120 * crum;
          const hy = 560 + 20 * crum;
          const sx = sd === -1 ? -80 : 2000;
          return (
            <g key={sd}>
              <path d={`M ${sx} 1180 Q ${sd === -1 ? 180 : 1740} 820 ${hx + sd * 40} ${hy + 40}`} stroke={C.ink} strokeWidth={118} fill="none" strokeLinecap="round" />
              <path d={`M ${sx} 1180 Q ${sd === -1 ? 180 : 1740} 820 ${hx + sd * 40} ${hy + 40}`} stroke={C.coat} strokeWidth={104} fill="none" strokeLinecap="round" />
              <path d={`M ${sx} 1180 Q ${sd === -1 ? 180 : 1740} 820 ${hx + sd * 40} ${hy + 40}`} stroke={C.coatDark} strokeWidth={10} fill="none" strokeDasharray="0 60 40 2000" opacity={0.6} />
              {/* そで口 */}
              <circle cx={hx + sd * 40} cy={hy + 40} r={58} fill={C.coatDark} stroke={C.ink} strokeWidth={6} />
              {/* 手 (指が紙の表にかかる) */}
              <ellipse cx={hx} cy={hy} rx={50} ry={58} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
              {[-30, -10, 10, 30].map((d) => (
                <ellipse key={d} cx={hx - sd * 40} cy={hy + d} rx={22} ry={11} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
              ))}
            </g>
          );
        })}
        {/* ぷるぷるの線 */}
        {shake > 0.1 && [-1, 1].map((sd) => (
          <g key={sd} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={clamp01(shake)}>
            <path d={`M ${sd === -1 ? 300 : 1620} 470 l ${sd * -14} -20 M ${sd === -1 ? 280 : 1640} 520 l ${sd * -20} -6 M ${sd === -1 ? 290 : 1630} 610 l ${sd * -18} 10`} />
          </g>
        ))}
        {/* マフラーのはし (本人のしるし) */}
        <path d={`M 900 1100 Q ${920 + Math.sin(f / 5) * 10} 980 ${940 + Math.sin(f / 4) * 14} 900 L 1000 904 Q ${990 + Math.sin(f / 5) * 10} 990 980 1100 Z`} fill={C.scarf} stroke={C.ink} strokeWidth={5} />
      </g>
      <TagPlate x={1700} y={110} text="1896年" size={48} t={seg(f, 0, 14)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #147 それなのに、ノッカー・アップは、なくなりませんでした。
// 格: 山 / seed 6147
// どこ: 翌朝の夜明け前の長屋の通り (MachiNami sky=0.1)。歩道に #146 のくしゃくしゃの新聞。
// 演出: 新聞が風で転がってくる。それを飛びこえて、ノッカー・アップが今朝も棒をかついで歩いてくる。
//       3軒目の2階の窓をコンコン。明かりがつき、ナイトキャップの男性がちゃんと起きて手を振る。
//       窓辺の目覚まし時計はほこりと蜘蛛の巣をかぶって止まったまま。最後に「ふふん」と得意顔。
// 動き: f0-22 新聞が転がる / f8-32 歩いてきて新聞を飛びこえる / f0-34 上へスクロール /
//       f32- 窓をたたく・f34 明かり・男性が手を振る / f52-72 窓へ寄ってほこりの時計 / f84-110 引いて「ふふん」
const Mz147: React.FC<{ f: number }> = ({ f }) => {
  const id = useSafeId("mz147");
  const [wx, wy] = MACHI_WIN[2];
  const roll = easeOut(seg(f, 0, 22));
  const px = lerp(-60, 330, roll);
  const walk = easeOut(seg(f, 8, 32));
  const kx = lerp(40, 480, walk);
  const hop = Math.abs(kx - px) < 60 && f < 34 ? Math.cos(((kx - px) / 60) * (Math.PI / 2)) * 30 : 0;
  const knocking = f >= 32;
  const lit = seg(f, 33, 37);
  const up = easeInOut(seg(f, 0, 34));
  const zin = easeInOut(seg(f, 52, 72));
  const zout = easeInOut(seg(f, 84, 110));
  let ccx = lerp(400, 620, up), ccy = lerp(760, 520, up), sc = 1.6;
  ccx = lerp(ccx, wx - 10, zin); ccy = lerp(ccy, wy + 20, zin); sc = lerp(sc, 2.8, zin);
  ccx = lerp(ccx, 560, zout); ccy = lerp(ccy, 640, zout); sc = lerp(sc, 1.35, zout);
  const wave = Math.sin(f / 4) * 22;
  const s = 0.42;
  return (
    <Frame f={f} seed={6147} dark bg={MP.nightDeep}>
      <g transform={cam(ccx, ccy, sc)}>
        <MachiNami f={f} sky={0.1} windows={[0, 0, lit, 0, 0, 0]} />
        {/* 窓の中: 起きた男性 (ナイトキャップ) とほこりの目覚まし */}
        <defs><clipPath id={id}><rect x={wx - 60} y={wy - 80} width={120} height={160} /></clipPath></defs>
        {lit > 0.05 && (
          <g clipPath={`url(#${id})`} opacity={lit}>
            <MzGbFolk x={wx + 22} y={wy + 96} s={s} f={f} phase={3} face={f > 38 ? "smile" : "surprised"} part="armless"
              cloth={C.nightshirt} clothDark={C.nightshirtDark} wear="nightcap"
              arms={<g>
                <MzGbArm a={[-56, -148]} b={[-74, -110]} c={[-70, -70]} cloth={C.nightshirt} />
                <MzGbArm a={[56, -148]} b={[120, -190]} c={[96 + wave, -282]} cloth={C.nightshirt} />
              </g>} />
            {/* 窓辺の目覚まし (止まったまま・ほこり・蜘蛛の巣) */}
            <rect x={wx - 60} y={wy + 66} width={120} height={14} fill={MP.woodLight} stroke={C.ink} strokeWidth={2.5} />
            <MzGbBC x={wx - 30} y={wy + 68} h={56} f={f} time={3 * 60 + 17} />
            <g fill="#A8A29A" opacity={0.75}>
              <ellipse cx={wx - 30} cy={wy + 28} rx={18} ry={6} />
              <ellipse cx={wx - 38} cy={wy + 44} rx={8} ry={4} />
              <ellipse cx={wx - 20} cy={wy + 54} rx={10} ry={3} />
            </g>
            <g stroke="#E8E4DC" strokeWidth={1.4} fill="none" opacity={0.9}>
              {[0, 20, 45, 70, 90].map((a) => {
                const r = (a * Math.PI) / 180;
                return <line key={a} x1={wx - 58} y1={wy + 64} x2={wx - 58 + Math.cos(r) * 34} y2={wy + 64 - Math.sin(r) * 34} />;
              })}
              {[12, 22, 32].map((r) => <path key={r} d={`M ${wx - 58 + r} ${wy + 64} Q ${wx - 58 + r * 0.8} ${wy + 64 - r * 0.8} ${wx - 58} ${wy + 64 - r}`} />)}
            </g>
            {/* ほこりの粒 */}
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={wx - 46 + rnd(9, i) * 40} cy={wy + 10 + ((f * 0.4 + i * 9) % 50)} r={1.6} fill="#E8E4DC" opacity={0.8} />
            ))}
          </g>
        )}
        {/* 転がる新聞 (#146 のくしゃくしゃ) と風の線 */}
        <MzGbPaperBall x={px} y={862} r={30} rot={roll * 600 + (f > 22 ? Math.sin(f / 6) * 8 : 0)} />
        {f < 30 && [0, 1, 2].map((k) => (
          <path key={k} d={`M ${px - 60 - k * 30} ${836 + k * 14} q 30 -10 60 0`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.6 * (1 - roll * 0.6)} strokeLinecap="round" />
        ))}
        {/* ノッカー・アップ */}
        <KnockerUp x={kx} y={880 - hop} s={kuS(420)} f={f} pose={knocking ? "knock" : "walk"} tip={[wx - 34, wy - 36]}
          face={f > 40 ? "smile" : "normal"} phase={1} />
        {f > 84 && <MzGbOno x={kx - 150} y={500} text="ふふん" size={52} rot={-8} t={seg(f, 86, 96)} color="#FFE7A0" />}
        {f > 84 && (
          <g opacity={seg(f, 86, 96)} stroke={KRP.white} strokeWidth={4} strokeLinecap="round">
            <path d={`M ${kx + 10} ${880 - 230} l -30 8 M ${kx + 10} ${880 - 222} l -26 18`} />
          </g>
        )}
        {knocking && <MzGbOno x={wx - 140} y={wy - 40} text="コン" size={40} rot={-12} t={seg(f, 32, 38)} opacity={0.6 + 0.4 * Math.sin(f / 3)} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #148 1950年代までにはほとんど姿を消しますが、1970年代のはじめまで残った町も、あったとされます。
// 格: 図 / seed 6148
// どこ: 長屋の通り (MachiNami、もやの奥) に立つ、古い木の町の掲示板 (屋根つき・コルク・画鋲・ちぎれた貼り紙)。
// 演出: 掲示板の年表。年代の目盛り「1900」「1950」「1970」。10年ごとの列に、小さなノッカー・アップの紙人形が
//       棚に並んで留めてある。右の年代ほど、ひとり、またひとりと会釈して、ふっと消える (1950年代で1人、1960年代は0人)。
//       1970年代には1人だけ、点線の輪郭と「？」つき (「とされる」)。その1人がぽつんと棒を振る。
// 動き: f0-38 左→右へパン・人形が順に会釈して消える / f40- 最後の1人が棒を振る / 貼り紙がぱたぱた /
//       f60-200 ゆっくり引いて掲示板の全体
const Mz148: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 38));
  const back = easeInOut(seg(f, 60, 200));
  const ccx = lerp(lerp(700, 1220, pan), 960, back);
  const ccy = lerp(470, 500, back);
  const sc = lerp(1.3, 1.0, back);
  const xy = (yr: number) => 240 + (yr - 1900) * 19;
  const counts = [6, 6, 5, 4, 3, 1, 0, 1];
  const rows = [470, 380, 290];
  const AX = 530;
  const flap = Math.sin(f / 5) * 10;
  return (
    <Frame f={f} seed={6148} bg={MP.mist}>
      <g transform={cam(ccx, ccy, sc)}>
        <MachiNami f={f} sky={0.7} windows={[1, 0, 1, 1, 0, 1]} />
        <rect x={-40} y={-40} width={2000} height={1160} fill={MP.mist} opacity={0.42} />
        {/* 掲示板の脚と屋根 */}
        {[150, 1770].map((lx) => <rect key={lx} x={lx - 22} y={140} width={44} height={900} fill={C.boardDark} stroke={C.ink} strokeWidth={6} />)}
        <path d="M 60 140 L 960 70 L 1860 140 L 1840 168 L 960 100 L 80 168 Z" fill={MP.soot} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {/* 板のわく */}
        <rect x={110} y={160} width={1700} height={560} rx={10} fill={C.board} stroke={C.ink} strokeWidth={7} />
        <MzGbGrain x={110} y={160} w={1700} h={30} n={1} seed={2} />
        <rect x={140} y={190} width={1640} height={500} fill={C.cork} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 90 }, (_, i) => (
          <circle key={i} cx={150 + rnd(31, i) * 1620} cy={200 + rnd(32, i) * 480} r={2 + rnd(33, i) * 2.5} fill={C.corkDark} opacity={0.7} />
        ))}
        {/* ちぎれた古い貼り紙 (1枚は端がぱたぱた) */}
        <g>
          <path d="M 160 210 L 300 206 L 296 250 L 270 258 L 240 246 L 200 262 L 162 254 Z" fill={C.paperLight} stroke={C.ink} strokeWidth={3.5} />
          <path d="M 1620 204 L 1764 210 L 1760 300 L 1700 292 L 1660 306 L 1622 296 Z" fill={C.paper} stroke={C.ink} strokeWidth={3.5} />
          <path d={`M 1700 292 L 1760 300 L ${1740 + flap} ${338 - Math.abs(flap) * 0.5} Z`} fill={C.paperLight} stroke={C.ink} strokeWidth={3} />
          {[220, 1690].map((cx) => <circle key={cx} cx={cx} cy={cx < 500 ? 216 : 214} r={7} fill={C.pin} stroke={C.ink} strokeWidth={2.5} />)}
          {[0, 1, 2].map((k) => <line key={k} x1={1640} y1={232 + k * 18} x2={1740 - k * 20} y2={232 + k * 18} stroke={C.newsInk} strokeWidth={4} opacity={0.4} />)}
        </g>
        {/* 年表の紙の帯 */}
        <rect x={190} y={508} width={1560} height={70} fill={C.paperLight} stroke={C.ink} strokeWidth={4} transform="rotate(-0.4 960 540)" />
        <line x1={220} y1={AX} x2={1740} y2={AX} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {Array.from({ length: 9 }, (_, i) => {
          const yr = 1900 + i * 10;
          const big = yr === 1900 || yr === 1950 || yr === 1970;
          return (
            <g key={yr}>
              <line x1={xy(yr)} y1={AX - (big ? 16 : 10)} x2={xy(yr)} y2={AX + (big ? 16 : 10)} stroke={C.ink} strokeWidth={big ? 6 : 4} />
              {big && <text x={xy(yr)} y={AX + 44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>{yr}</text>}
            </g>
          );
        })}
        {[[193, 196], [1743, 196], [193, 504], [1748, 572]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={8} fill={C.pin} stroke={C.ink} strokeWidth={3} />)}
        {/* 10年ごとの列: 紙人形の棚 */}
        {counts.map((cnt, c) => {
          const cx = xy(1900 + c * 10) + 95;
          if (c === 7) return null;
          return (
            <g key={c}>
              {rows.map((ry) => <rect key={ry} x={cx - 84} y={ry} width={168} height={9} rx={3} fill={C.boardDark} stroke={C.ink} strokeWidth={2.5} />)}
              {Array.from({ length: 6 }, (_, k) => {
                const ry = rows[Math.floor(k / 2)];
                const fx = cx + (k % 2 ? 42 : -42);
                const extra = k >= cnt ? 5 - k : -1;
                if (extra < 0) {
                  return <KnockerUp key={k} x={fx} y={ry} s={kuS(80)} f={f} pose="walk" phase={c * 3 + k} />;
                }
                const t0 = 2 + c * 4 + extra * 1.0;
                const bow = easeOut(seg(f, t0, t0 + 4));
                const fade = seg(f, t0 + 3, t0 + 7);
                if (fade >= 1) return null;
                return (
                  <g key={k}>
                    <g opacity={1 - fade} transform={`rotate(${bow * 28} ${fx} ${ry})`}>
                      <KnockerUp x={fx} y={ry} s={kuS(80)} f={f} pose="walk" face="smile" phase={c * 3 + k} />
                    </g>
                    {fade > 0 && [0, 1, 2].map((p) => (
                      <circle key={p} cx={fx + (p - 1) * 16 * fade} cy={ry - 40 - fade * 30} r={6 + fade * 12} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} opacity={1 - fade} />
                    ))}
                  </g>
                );
              })}
            </g>
          );
        })}
        {/* 1970年代: 1人だけ・点線の輪郭と ？ */}
        {(() => {
          const cx = xy(1970) + 95;
          const swing = f > 40 ? Math.sin((f - 40) / 7) * 26 : 0;
          return (
            <g>
              <rect x={cx - 84} y={rows[0]} width={168} height={9} rx={3} fill={C.boardDark} stroke={C.ink} strokeWidth={2.5} />
              <rect x={cx - 70} y={rows[0] - 150} width={140} height={150} rx={16} fill={KRP.white} opacity={0.3}
                stroke={C.ink} strokeWidth={4} strokeDasharray="12 9" />
              <g opacity={0.85}>
                <KnockerUp x={cx - 14} y={rows[0]} s={kuS(96)} f={f} pose="knock" phase={5}
                  tip={[cx + 30 + swing, rows[0] - 150 - Math.abs(swing) * 0.3]} />
              </g>
              <QMark x={cx - 112} y={rows[0] - 50} s={0.75} f={f} t={seg(f, 30, 40)} />
            </g>
          );
        })()}
        <TagPlate x={xy(1950) + 95} y={630} text="1950年代" size={36} t={seg(f, 22, 32)} />
        <TagPlate x={xy(1970) + 95} y={630} text="1970年代" size={36} t={seg(f, 30, 40)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #149 目覚ましと人間が、何十年も、並んで働いていたのです。
// 格: 山 / seed 6149
// どこ: 長屋 (MachiNami sky=0.2) の3軒目の2階の窓の大写し。窓辺の内側に BellClock、外からノッカー・アップの棒。
// 演出: 時計のジリリと棒のコンコンが、同僚のように交代で鳴る。カメラが引くと下に本人。
//       時計の上に小さな顔が浮かび、時計 (ベルを傾けて) とノッカー・アップ (体を傾けて) が会釈し合う。
//       窓の中の男性は両手で耳をふさいで起き上がる。
// 動き: f0-24 窓の大写しでジリリ/コンコンが交互 / f22-38 引いて本人も入れる / f32-46 会釈し合う /
//       f50- 交互の音が続き、カメラが窓と本人を左右にゆっくりパン
const Mz149: React.FC<{ f: number }> = ({ f }) => {
  const id = useSafeId("mz149");
  const [wx, wy] = MACHI_WIN[2];
  const pull = easeInOut(seg(f, 22, 38));
  const sway = f > 50 ? Math.sin((f - 50) / 22) * 120 : 0;
  const ccx = lerp(wx, 720 + sway, pull), ccy = lerp(wy + 10, 520, pull), sc = lerp(3.0, 1.75, pull);
  const turn = Math.floor(f / 8) % 2;
  const ring = turn === 0 ? 1 : 0;
  const bow = bump(f, 32, 48);
  const ears = seg(f, 6, 16);
  return (
    <Frame f={f} seed={6149} dark bg={MP.nightDeep}>
      <g transform={cam(ccx, ccy, sc)}>
        <MachiNami f={f} sky={0.2} windows={[0, 0, 1, 0, 1, 0]} />
        <defs><clipPath id={id}><rect x={wx - 60} y={wy - 80} width={120} height={160} /></clipPath></defs>
        <g clipPath={`url(#${id})`}>
          {/* ベッドの頭板 */}
          <rect x={wx - 60} y={wy + 20} width={120} height={70} fill={MP.wood} stroke={C.ink} strokeWidth={2.5} />
          {/* 男性: 起き上がって両手で耳 */}
          <MzGbFolk x={wx + 22} y={wy + 92 - ears * 8} s={0.4} f={f} phase={2} face="surprised" part="armless"
            cloth={C.nightshirt} clothDark={C.nightshirtDark} wear="nightcap"
            arms={ears > 0.5 ? (
              <g>
                <MzGbArm a={[-56, -148]} b={[-112, -186]} c={[-66, -226]} cloth={C.nightshirt} />
                <MzGbArm a={[56, -148]} b={[112, -186]} c={[66, -226]} cloth={C.nightshirt} />
              </g>
            ) : (
              <g>
                <MzGbArm a={[-56, -148]} b={[-74, -110]} c={[-70, -70]} cloth={C.nightshirt} />
                <MzGbArm a={[56, -148]} b={[74, -110]} c={[70, -70]} cloth={C.nightshirt} />
              </g>
            )} />
          {/* 窓辺の板と目覚まし時計 (会釈で傾く) */}
          <rect x={wx - 60} y={wy + 66} width={120} height={14} fill={MP.woodLight} stroke={C.ink} strokeWidth={2.5} />
          <MzGbBC x={wx - 30} y={wy + 68} h={64} f={f} ring={ring} rot={-18 * bow} />
        </g>
        {/* ガラスのつや */}
        <path d={`M ${wx - 54} ${wy - 20} L ${wx - 20} ${wy - 76} M ${wx + 10} ${wy + 70} L ${wx + 50} ${wy + 10}`} stroke={KRP.white} strokeWidth={4} opacity={0.35} strokeLinecap="round" />
        {/* 時計の上に浮かぶ小さな顔 (会釈) */}
        <MzGbClockFace x={wx - 34} y={wy - 6} s={0.36} mood="smile" t={seg(f, 28, 36)} f={f} />
        {/* ノッカー・アップ (会釈で体を傾ける) */}
        <g transform={`rotate(${bow * 10} 480 880)`}>
          <KnockerUp x={480} y={880} s={kuS(420)} f={f} pose="knock" tip={[wx + 30, wy + 46]} face={bow > 0.2 ? "smile" : "normal"} phase={4} />
        </g>
        {/* 交代の音 */}
        {ring ? (
          <MzGbOno x={wx - 30} y={wy - 96} text="ジリリ" size={pull > 0.5 ? 40 : 26} rot={-6} color={MP.brassLight} />
        ) : (
          <MzGbOno x={wx + 70} y={wy + 120} text="コンコン" size={pull > 0.5 ? 40 : 24} rot={8} />
        )}
        {bow > 0.2 && <MzGbOno x={600} y={430} text="ぺこ" size={40} rot={-10} t={bow * 1.5} color="#FFE7A0" />}
      </g>
    </Frame>
  );
};

// ===== 19世紀の工員の家 (1部屋に台所とベッド。#150・#151 で同じ部屋) =====
//   世界の幅 0〜3040。台所のテーブル 500〜1450 (天板 y=690)、窓 1560〜1760、ベッド 2140〜2940 (頭が左)、
//   ベッドの頭の横の丸いすが夜のナイトテーブル (x=2060, 天板 y=700)
const COT_STOOL: P = [2060, 700];
const MzGbCottage: React.FC<{ f: number; sky?: number }> = ({ f, sky = 0.1 }) => {
  const id = useSafeId("mzgbCot");
  return (
    <g>
      {/* しっくいの壁と梁 */}
      <rect x={-40} y={-40} width={3120} height={900} fill={C.plaster} />
      {Array.from({ length: 40 }, (_, i) => (
        <ellipse key={i} cx={rnd(41, i) * 3040} cy={60 + rnd(42, i) * 740} rx={20 + rnd(43, i) * 40} ry={8 + rnd(44, i) * 12} fill={C.plasterDark} opacity={0.35} />
      ))}
      <rect x={-40} y={-40} width={3120} height={70} fill={C.beam} stroke={C.ink} strokeWidth={6} />
      {[380, 1500, 2080, 2980].map((bx) => <rect key={bx} x={bx} y={20} width={56} height={820} fill={C.beam} stroke={C.ink} strokeWidth={5} />)}
      {/* かまど (左) */}
      <rect x={20} y={480} width={300} height={360} fill={MP.brickDark} stroke={C.ink} strokeWidth={6} />
      <MzGbBricks x={26} y={486} w={288} h={350} bw={48} bh={22} seed={5} />
      <path d="M 90 840 L 90 700 Q 170 640 250 700 L 250 840 Z" fill={MP.soot} stroke={C.ink} strokeWidth={5} />
      <rect x={0} y={460} width={340} height={26} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
      {/* 壁のフライパンと棚の皿 */}
      <g transform={`rotate(${Math.sin(f / 30) * 2} 540 250)`}>
        <line x1={540} y1={236} x2={540} y2={262} stroke={C.ink} strokeWidth={4} />
        <rect x={530} y={262} width={20} height={110} rx={8} fill={MP.iron} stroke={C.ink} strokeWidth={4} />
        <circle cx={540} cy={440} r={74} fill={MP.iron} stroke={C.ink} strokeWidth={6} />
        <circle cx={540} cy={440} r={56} fill={MP.soot} />
        <path d="M 500 410 Q 520 390 550 388" stroke={MP.ironLight} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      <rect x={700} y={300} width={560} height={20} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
      {[760, 860, 960, 1060].map((px, i) => (
        <g key={px}>
          <ellipse cx={px} cy={262} rx={40} ry={40} fill={i % 2 ? "#E9E3D4" : "#D8E2E8"} stroke={C.ink} strokeWidth={4} />
          <circle cx={px} cy={262} r={24} fill="none" stroke="#7FA0C0" strokeWidth={3} />
        </g>
      ))}
      <path d="M 1140 300 L 1150 240 L 1210 240 L 1220 300 Z" fill={C.tin} stroke={C.ink} strokeWidth={4} />
      {/* 窓 (外は夜) */}
      <rect x={1560} y={240} width={220} height={240} fill="#F1EADF" stroke={C.ink} strokeWidth={6} />
      <defs><clipPath id={id}><rect x={1574} y={254} width={192} height={212} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={1574} y={254} width={192} height={212} fill={mixColor(MP.nightDeep, MP.dawn, sky / 2)} />
        <circle cx={1700} cy={310} r={26} fill="#FFF3C8" />
        <circle cx={1712} cy={302} r={22} fill={mixColor(MP.nightDeep, MP.dawn, sky / 2)} />
        <path d="M 1574 466 L 1574 420 L 1620 400 L 1660 420 L 1700 390 L 1766 410 L 1766 466 Z" fill="#232A48" />
      </g>
      <path d="M 1670 254 L 1670 466 M 1574 360 L 1766 360" stroke="#F1EADF" strokeWidth={8} />
      <rect x={1550} y={476} width={240} height={18} fill={MP.wood} stroke={C.ink} strokeWidth={4} />
      {/* 床板 */}
      <rect x={-40} y={840} width={3120} height={300} fill={MP.woodDark} />
      {[880, 950, 1030].map((ly) => <line key={ly} x1={-40} y1={ly} x2={3080} y2={ly} stroke={C.ink} strokeWidth={3} opacity={0.4} />)}
      <rect x={-40} y={832} width={3120} height={14} fill={C.beam} stroke={C.ink} strokeWidth={4} />
      {/* 丸いす (夜はベッドの横のナイトテーブル) */}
      <ellipse cx={COT_STOOL[0]} cy={COT_STOOL[1]} rx={84} ry={16} fill={MP.woodLight} stroke={C.ink} strokeWidth={5} />
      {[-56, 0, 56].map((dx) => <line key={dx} x1={COT_STOOL[0] + dx * 0.8} y1={COT_STOOL[1] + 10} x2={COT_STOOL[0] + dx} y2={840} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />)}
      {[-56, 0, 56].map((dx) => <line key={dx} x1={COT_STOOL[0] + dx * 0.8} y1={COT_STOOL[1] + 10} x2={COT_STOOL[0] + dx} y2={840} stroke={MP.wood} strokeWidth={8} strokeLinecap="round" />)}
      {/* ベッド: 頭板 (左)・足板 (右)・わら布団 */}
      <rect x={2140} y={470} width={64} height={370} rx={10} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
      <MzGbGrain x={2140} y={470} w={64} h={370} n={2} seed={8} vertical />
      <rect x={2880} y={600} width={56} height={240} rx={10} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
      <rect x={2190} y={690} width={700} height={60} rx={14} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
      <rect x={2190} y={746} width={700} height={44} fill={MP.woodLight} stroke={C.ink} strokeWidth={5} />
      {[2210, 2850].map((lx) => <rect key={lx} x={lx} y={788} width={26} height={52} fill={MP.woodDark} stroke={C.ink} strokeWidth={4} />)}
      <ellipse cx={2430} cy={668} rx={92} ry={30} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={2290} cy={684} rx={92} ry={30} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
    </g>
  );
};
/** つぎはぎの掛け布団 (人の上にかける) */
const MzGbQuilt: React.FC<{ top: number; x0?: number }> = ({ top, x0 = 2340 }) => (
  <g>
    <path d={`M ${x0} 720 Q ${x0 + 10} ${top} ${x0 + 120} ${top - 6} Q ${x0 + 330} ${top - 16} 2900 ${top + 20} L 2910 780 L ${x0 - 10} 790 Z`}
      fill={C.quilt} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    {Array.from({ length: 5 }, (_, i) => (
      <rect key={i} x={x0 + 40 + i * 110} y={top + 40 + (i % 2) * 20} width={70} height={50} rx={6}
        fill={i % 2 ? C.quilt2 : C.quiltDark} stroke={C.ink} strokeWidth={3} opacity={0.8} transform={`rotate(${(i % 3 - 1) * 6} ${x0 + 75 + i * 110} ${top + 65})`} />
    ))}
    <path d={`M ${x0} 720 Q ${x0 + 10} ${top} ${x0 + 120} ${top - 6}`} stroke={KRP.white} strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

// -------------------------------------------------------------------
// #150 理由のひとつは、値段です。はじめのころの目覚まし時計は高く、しかも、よく狂いました。
// 格: 山 / seed 6150
// どこ: 19世紀の工員の家 (台所とベッドが1部屋)。木のテーブル・ろうそく・ブリキのカップ・壁のフライパン・かまど。
// 演出: 前半: 夫 (ハンチング帽・ベスト・ズボン) が財布を逆さにして硬貨をじゃらじゃら。妻 (えんじの長いスカート・
//       エプロン・後ろで結んだ茶色の髪) は両手で頬。時計の横の大きな値札 (数字なし) は硬貨の山よりずっと大きい。ため息。
//       買った時計の針が勝手にくるくる回る (狂う)。
//       後半: 夜になり、ベッドの横の丸いすに置いた時計が、夜中の2時にジリリ。寝ていた夫婦が飛び起きる。
// 動き: f0-24 硬貨が落ちる / f14-30 値札 / f24-40 ため息 / f30-46 針がくるくる / f56-76 夜になる /
//       f60-92 ベッドへパン / f100- 2時にジリリ・f104 飛び起きる
const Mz150: React.FC<{ f: number }> = ({ f }) => {
  const zoomA = easeInOut(seg(f, 0, 40));
  const panB = easeInOut(seg(f, 60, 92));
  const ccx = lerp(lerp(960, 960, zoomA), 2180, panB);
  const ccy = lerp(540, 520, zoomA);
  const sc = lerp(1, 1.12, zoomA);
  const night = f >= 66;
  const dim = seg(f, 56, 66) * 0.85 - seg(f, 66, 76) * 0.35;
  const spinT = seg(f, 30, 46);
  const time = night ? 2 * 60 : 6 * 60 + spinT * spinT * 1500 + (f > 46 ? Math.floor(f / 6) % 2 * -40 : 0);
  const ringing = f >= 100;
  const awake = f >= 104;
  const tagT = seg(f, 14, 30);
  const sigh = seg(f, 24, 40);
  const clockX = night ? COT_STOOL[0] : 1250;
  const clockY = night ? COT_STOOL[1] : 690;
  const nCoins = Math.floor(seg(f, 2, 24) * 9);
  const coinPile: P[] = [[840, 680], [870, 680], [900, 680], [855, 668], [885, 668], [870, 656], [815, 682], [925, 682], [870, 644]];
  return (
    <Frame f={f} seed={6150} dark={night} bg={C.plaster}>
      <g transform={cam(ccx, ccy, sc)}>
        <MzGbCottage f={f} sky={0.1} />
        {/* 夫婦 (前半: テーブルの向こうに立つ) */}
        {!night && (
          <g>
            <MzGbFolk x={620} y={900} s={2.0} f={f} phase={1} face={sigh > 0.3 ? "sad" : "worried"} part="armless"
              cloth={C.vest} clothDark={C.vestDark} wear="flatcap"
              arms={<g>
                <MzGbArm a={[-56, -148]} b={[30, -120]} c={[104, -200]} cloth={C.vest} />
                <MzGbArm a={[56, -148]} b={[130, -150]} c={[146, -206]} cloth={C.vest} />
                {/* 逆さの財布 */}
                <g transform={`translate(126 -222) rotate(${180 + Math.sin(f / 2) * 8 * (1 - seg(f, 20, 28))})`}>
                  <path d="M -30 -14 Q -32 22 0 24 Q 32 22 30 -14 Z" fill={MP.woodDark} stroke={C.ink} strokeWidth={4} />
                  <rect x={-32} y={-22} width={64} height={12} rx={4} fill={MP.brass} stroke={C.ink} strokeWidth={3} />
                </g>
              </g>} />
            <MzGbFolk x={1060} y={900} s={1.95} f={f} phase={4} face={sigh > 0.3 ? "sad" : "surprised"} part="armless"
              cloth={C.dress} clothDark={C.dressDark} woman skirt apron
              arms={<g>
                <MzGbArm a={[-56, -148]} b={[-96, -186]} c={[-52, -202]} cloth={C.dress} />
                <MzGbArm a={[56, -148]} b={[96, -186]} c={[52, -202]} cloth={C.dress} />
              </g>} />
            {/* ため息 */}
            {sigh > 0 && [[620, 900 - 2.0 * 190, -1], [1060, 900 - 1.95 * 190, 1]].map(([hx, hy, sd], i) => (
              <g key={i} opacity={1 - sigh * 0.5}>
                <path d={`M ${hx + sd * 20} ${hy} q ${sd * 40} ${-10 - sigh * 30} ${sd * (70 + sigh * 40)} ${-sigh * 40}`} stroke={KRP.white} strokeWidth={10} fill="none" strokeLinecap="round" />
                <circle cx={hx + sd * (100 + sigh * 50)} cy={hy - sigh * 50} r={14 + sigh * 10} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
              </g>
            ))}
          </g>
        )}
        {/* テーブル */}
        <rect x={480} y={690} width={990} height={34} rx={6} fill={MP.woodLight} stroke={C.ink} strokeWidth={6} />
        <MzGbGrain x={490} y={692} w={970} h={30} n={1} seed={3} />
        <rect x={500} y={722} width={950} height={40} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
        {[520, 1410].map((lx) => <rect key={lx} x={lx} y={760} width={30} height={84} fill={MP.wood} stroke={C.ink} strokeWidth={5} />)}
        {/* ろうそく・ブリキのカップ・パンくず */}
        <rect x={499} y={630} width={22} height={60} fill="#F3EBD6" stroke={C.ink} strokeWidth={4} />
        <ellipse cx={510} cy={690} rx={34} ry={8} fill={C.tin} stroke={C.ink} strokeWidth={4} />
        <Flame x={510} y={628} s={0.9} f={f} glow={1.4} />
        <path d="M 1360 690 L 1356 640 L 1404 640 L 1400 690 Z" fill={C.tin} stroke={C.ink} strokeWidth={4} />
        <path d="M 1404 650 q 20 4 0 28" stroke={C.ink} strokeWidth={4} fill="none" />
        {/* 硬貨 (じゃらじゃら) */}
        {!night && coinPile.slice(0, nCoins).map(([cx, cy], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={16} ry={7} fill={C.coin} stroke={C.ink} strokeWidth={3} />
            <ellipse cx={cx - 3} cy={cy - 1} rx={6} ry={2.5} fill={MP.brassLight} />
          </g>
        ))}
        {!night && f < 26 && [0, 1, 2].map((k) => {
          const t = ((f / 7 + k / 3) % 1);
          return <ellipse key={k} cx={872 + k * 6} cy={lerp(480, 660, t)} rx={12} ry={6} fill={C.coin} stroke={C.ink} strokeWidth={3} transform={`rotate(${t * 300} ${872 + k * 6} ${lerp(480, 660, t)})`} />;
        })}
        {!night && f < 28 && <MzGbOno x={760} y={600} text="ジャラ" size={44} rot={-8} t={seg(f, 2, 8)} color={MP.brassLight} />}
        {/* 目覚まし時計 (夜はベッド横の丸いすへ) */}
        <MzGbBC x={clockX} y={clockY} h={190} f={f} ring={ringing ? 1 : 0} time={time} alarm={2 * 60} />
        {/* 針がくるくる (狂う) */}
        {!night && spinT > 0 && spinT < 1 && (() => {
          const [dx, dy] = bcDial(clockX, clockY, 190);
          return <g stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8}>
            <path d={`M ${dx - 80} ${dy - 40} A 90 90 0 0 1 ${dx + 30} ${dy - 92}`} />
            <path d={`M ${dx + 80} ${dy + 40} A 90 90 0 0 1 ${dx - 30} ${dy + 92}`} />
            <path d={`M ${dx + 30} ${dy - 92} l -16 -6 M ${dx + 30} ${dy - 92} l -6 14`} />
          </g>;
        })()}
        {!night && f > 30 && <MzGbOno x={clockX + 20} y={440} text="クルクル" size={42} rot={8} t={seg(f, 30, 36)} />}
        {/* 値札 (数字なし・硬貨の山よりずっと大きい) */}
        {!night && tagT > 0 && (
          <g transform={`rotate(${lerp(-40, 8, easeOut(tagT)) + Math.sin(f / 9) * 3} 1300 680)`}>
            <line x1={1300} y1={680} x2={1350} y2={712} stroke={C.ink} strokeWidth={3} />
            <path d="M 1330 700 L 1560 700 L 1560 850 L 1330 850 L 1300 775 Z" fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={1334} cy={775} r={8} fill={C.plaster} stroke={C.ink} strokeWidth={3} />
            <path d="M 1380 740 L 1520 740 M 1380 780 L 1500 780 M 1380 818 L 1460 818" stroke={MP.bell} strokeWidth={8} strokeLinecap="round" opacity={0.75} />
          </g>
        )}
        {/* 夜の暗さ */}
        {dim > 0.01 && <rect x={-40} y={-40} width={3120} height={1160} fill={MP.nightDeep} opacity={dim} />}
        {/* 後半: ベッドの夫婦 */}
        {night && (
          <g>
            {!awake ? (
              <g>
                <MzGbFolk x={2656} y={652} s={1.05} rot={-80} f={f} phase={4} part="head" woman eyesShut cloth={C.dress} clothDark={C.dressDark} />
                <MzGbFolk x={2540} y={690} s={1.1} rot={-80} f={f} phase={1} part="head" eyesShut wear="nightcap" cloth={C.nightshirt} clothDark={C.nightshirtDark} />
                <MzGbQuilt top={640} />
              </g>
            ) : (
              <g transform={`translate(0 ${-Math.abs(Math.sin((f - 104) / 3)) * 14 * (1 - seg(f, 104, 130))})`}>
                <MzGbFolk x={2500} y={762} s={1.0} f={f} phase={4} face="surprised" part="armless" woman wear="messy"
                  cloth={C.dress} clothDark={C.dressDark}
                  arms={<g>
                    <MzGbArm a={[-56, -148]} b={[-96, -186]} c={[-52, -202]} cloth={C.dress} />
                    <MzGbArm a={[56, -148]} b={[96, -186]} c={[52, -202]} cloth={C.dress} />
                  </g>} />
                <MzGbFolk x={2330} y={770} s={1.1} f={f} phase={1} face="surprised" part="armless" wear="nightcap"
                  cloth={C.nightshirt} clothDark={C.nightshirtDark}
                  arms={<g>
                    <MzGbArm a={[-56, -148]} b={[-130, -200]} c={[-120, -290]} cloth={C.nightshirt} />
                    <MzGbArm a={[56, -148]} b={[130, -200]} c={[120, -290]} cloth={C.nightshirt} />
                  </g>} />
                <MzGbQuilt top={700} x0={2230} />
                <MzGbOno x={2330} y={380} text="!!" size={80} rot={-6} />
                <MzGbOno x={2500} y={420} text="!" size={70} rot={8} />
              </g>
            )}
            <Flame x={COT_STOOL[0] + 60} y={688} s={0.6} f={f} glow={1.2} />
            {ringing && <MzGbOno x={COT_STOOL[0]} y={440} text="ジリリリ" size={54} rot={-8} t={seg(f, 100, 106)} color={MP.brassLight} />}
          </g>
        )}
        {night && <TagPlate x={1660} y={560} text="2:00" size={40} t={seg(f, 96, 104)} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #151 でも、もうひとつ、大事な理由があります。
// 格: 並 / seed 6151
// どこ: #150 の工員の家のベッドの横 (続き・夜)。丸いすの上の目覚まし時計・ろうそく・ベッドの夫婦。
// 演出: 鳴りやんだ時計がまだ少し震えて静まる。その上に、画面の外からあなた (水色のパジャマの袖) の手が入ってきて、
//       人差し指を1本ぴんと立てる。指先に「!」がきらっ。夫婦は寝ころんだまま目を丸くして指を見る。
// 動き: f0-14 時計の震えがおさまる / f10-28 手が入る / f28-38 「!」がきらっ / 夫婦がまばたき / f40- ゆっくり寄る
const Mz151: React.FC<{ f: number }> = ({ f }) => {
  const sc = lerp(1.8, 2.0, easeInOut(seg(f, 40, 105)));
  const settle = (1 - seg(f, 0, 14)) * Math.sin(f * 2.4) * 6;
  const inT = easeOut(seg(f, 10, 28));
  const hand: P = [lerp(2600, 2130, inT), lerp(200, 470, inT)];
  const spark = seg(f, 28, 38);
  return (
    <Frame f={f} seed={6151} dark bg={MP.nightDeep}>
      <g transform={cam(2180, 560, sc)}>
        <MzGbCottage f={f} sky={0.1} />
        <MzGbBC x={COT_STOOL[0]} y={COT_STOOL[1]} h={190} f={f} rot={settle} time={2 * 60 + 1} alarm={2 * 60} />
        <Flame x={COT_STOOL[0] + 60} y={688} s={0.6} f={f} glow={1.2} />
        <rect x={COT_STOOL[0] + 50} y={688} width={20} height={14} fill="#F3EBD6" stroke={C.ink} strokeWidth={3} />
        {/* 夫婦 (寝ころんだまま指を見る) */}
        <MzGbFolk x={2656} y={652} s={1.05} rot={-80} f={f} phase={4} part="head" woman face="surprised" gaze={[-4, -6]} cloth={C.dress} clothDark={C.dressDark} />
        <MzGbFolk x={2540} y={690} s={1.1} rot={-80} f={f + 20} phase={1} part="head" face="surprised" gaze={[-4, -6]} wear="nightcap" cloth={C.nightshirt} clothDark={C.nightshirtDark} />
        <MzGbQuilt top={640} />
        <rect x={-40} y={-40} width={3120} height={1160} fill={MP.nightDeep} opacity={0.42} />
        {/* 時計とあたりのろうそくの明かり (暗さの上) */}
        <circle cx={COT_STOOL[0] + 40} cy={600} r={260} fill={MP.glow} opacity={0.12} />
        {/* あなたの手 (水色のそで・人差し指を立てる) */}
        <g>
          <path d={`M 2700 -60 Q ${hand[0] + 260} ${hand[1] - 200} ${hand[0] + 30} ${hand[1] + 20}`} stroke={C.ink} strokeWidth={78} fill="none" strokeLinecap="round" />
          <path d={`M 2700 -60 Q ${hand[0] + 260} ${hand[1] - 200} ${hand[0] + 30} ${hand[1] + 20}`} stroke={MP.you} strokeWidth={66} fill="none" strokeLinecap="round" />
          <path d={`M 2700 -60 Q ${hand[0] + 260} ${hand[1] - 200} ${hand[0] + 30} ${hand[1] + 20}`} stroke={MP.youDark} strokeWidth={6} fill="none" strokeDasharray="0 80 60 3000" />
          <circle cx={hand[0] + 30} cy={hand[1] + 20} r={38} fill={MP.youDark} stroke={C.ink} strokeWidth={5} />
          <rect x={hand[0] - 40} y={hand[1] - 20} width={70} height={64} rx={26} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={hand[0] - 30} y={hand[1] - 92} width={26} height={84} rx={13} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d={`M ${hand[0] - 36} ${hand[1] + 4} L ${hand[0] + 20} ${hand[1] + 4} M ${hand[0] - 36} ${hand[1] + 22} L ${hand[0] + 20} ${hand[1] + 22}`} stroke={C.ink} strokeWidth={3} opacity={0.5} />
        </g>
        {spark > 0 && (
          <g>
            <MzGbBurst x={hand[0] - 17} y={hand[1] - 150} r={40 + Math.sin(f / 3) * 4} t={spark} color={KRP.yellow} />
            <MzGbOno x={hand[0] - 17} y={hand[1] - 128} text="!" size={66} t={spark} color={MP.bell} />
            {[0, 1, 2, 3].map((k) => {
              const a = (k / 4) * Math.PI * 2 + f / 10;
              return <path key={k} d={`M ${hand[0] - 17 + Math.cos(a) * 70} ${hand[1] - 150 + Math.sin(a) * 70} l 0 -12 l 4 12 l 12 0 l -12 4 l 0 12 l -4 -12 l -12 0 Z`} fill={KRP.white} stroke={C.ink} strokeWidth={2} />;
            })}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #152 目覚まし時計は、止められます。
// 格: 山 / seed 6152
// どこ: あなたの寝室 (Shinshitsu sky=1・夜明け) のナイトテーブルの大写し。スマホの隣に BellClock。
// 演出: BellClock がジリリと激しく鳴る。布団から、目を閉じたままのあなた (水色のパジャマ) の腕がにゅっと伸び、
//       時計のてっぺんを手のひらでバン! ハンマーがぴたっと止まり、音の線が消える。腕は満足そうに布団へ戻る。
//       もう片方の腕は布団の中 (見えない)。
// 動き: f0-26 鳴る / f10-26 腕が伸びる / f26 バン!・画面が揺れる・時計がつぶれる / f30-50 ぴたっと静か /
//       f50-74 腕が戻る
const Mz152: React.FC<{ f: number }> = ({ f }) => {
  const CX = 1395, CY = 646, CH = 190;
  const ext = easeOut(seg(f, 10, 26)) * (1 - easeInOut(seg(f, 50, 74)));
  const ring = f < 26 ? 1 : 0;
  const hit = f >= 26 ? 1 - seg(f, 26, 50) : 0;
  const quake = f >= 26 && f < 34 ? (34 - f) / 8 : 0;
  const shx = Math.sin(f * 3.3) * 14 * quake, shy = Math.cos(f * 2.9) * 10 * quake;
  const squash = f >= 26 ? 1 - 0.1 * bump(f, 26, 34) : 1;
  const hand: P = [lerp(1000, CX, ext), lerp(612, CY - CH + 6, ext)];
  const elbow: P = [lerp(1000, 1215, ext), lerp(605, 360, ext)];
  return (
    <Frame f={f} seed={6152} bg="#E9DAC2">
      <g transform={`translate(${shx} ${shy}) ${cam(1240, 575, 2.3)}`}>
        <Shinshitsu f={f} sky={1} sleeper={0.7} alarms={0} head={false} time={6 * 60} />
        {/* 寝ている顔 (目は閉じたまま。カーテンの手前に描く) */}
        <MzGbFolk x={882} y={632} s={0.8} rot={80} f={f} part="head" face={f >= 30 ? "smile" : "normal"} eyesShut />
        <g transform={`translate(${CX} ${CY}) scale(1 ${squash}) translate(${-CX} ${-CY})`}>
          <MzGbBC x={CX} y={CY} h={CH} f={f} ring={ring} time={6 * 60} alarm={6 * 60} />
        </g>
        {ring > 0 && <MzGbOno x={CX + 20} y={CY - CH - 30} text="ジリリリ" size={34} rot={-6} color={MP.brassLight} opacity={0.6 + 0.4 * Math.sin(f / 2)} />}
        {/* 布団から伸びる腕 (水色のパジャマ) */}
        {ext > 0.02 && (
          <g>
            <MzGbArm a={[990, 616]} b={elbow} c={hand} cloth={MP.you} w={22} hand={false} />
            <ellipse cx={hand[0]} cy={hand[1] - 4} rx={26} ry={13} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
            <path d={`M ${hand[0] + 10} ${hand[1] - 10} l 22 -2 M ${hand[0] + 10} ${hand[1] - 2} l 24 2`} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
            <path d="M 990 600 Q 1000 620 996 636" stroke="#EFC46A" strokeWidth={14} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* バン! と ぴたっ */}
        <MzGbBurst x={CX + 10} y={CY - CH - 4} r={56} t={hit} />
        {f >= 26 && <MzGbOno x={CX + 80} y={CY - CH - 50} text="バン!" size={44} rot={10} t={seg(f, 26, 31)} opacity={1 - seg(f, 46, 58)} color={MP.bell} />}
        {f >= 30 && <MzGbOno x={CX - 90} y={CY - 70} text="ぴたっ" size={26} rot={-8} t={seg(f, 30, 36)} opacity={1 - seg(f, 60, 74)} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #153 止めて、二度寝ができます。
// 格: 山 / seed 6153
// どこ: あなたの寝室 (Shinshitsu) のベッドの全景 (#152 の続き)。窓の外はどんどん明るくなる (sky 1→1.3)。
// 演出: 止まった BellClock の横で、あなたが掛け布団を頭までかぶり直し、もぞもぞ寝返り。
//       布団から出た顔は幸せそうにとろける (閉じた目・にっこり・よだれのしずく・ほっぺ)。Zzz がまたぷかぷか。
//       壁の時計の針がするすると進む。止められた時計の上の小さな顔は「…」とあきれている。
// 動き: f0-10 布団をかぶる / f10-24 もぞもぞ寝返り / f24-32 顔が出てとろける / f0-68 空が明るく・壁の時計が進む・
//       カメラは全景から顔へゆっくり寄る
const Mz153: React.FC<{ f: number }> = ({ f }) => {
  const k = easeInOut(seg(f, 0, 68));
  const sky = lerp(1, 1.3, seg(f, 0, 68));
  const cover = seg(f, 0, 10) - seg(f, 24, 32);
  const wig = f > 10 && f < 24 ? Math.sin(f / 1.6) * 8 : 0;
  const face = f >= 28;
  const HX = 882, HY = 632;
  return (
    <Frame f={f} seed={6153} bg="#E9DAC2">
      <g transform={cam(lerp(960, 1120, k), lerp(540, 580, k), lerp(1, 1.45, k))}>
        <Shinshitsu f={f} sky={sky} sleeper={1} alarms={0} head={false} time={6 * 60 + 5 + Math.floor(seg(f, 0, 68) * 50)} />
        {/* とろけた寝顔 */}
        <MzGbFolk x={HX} y={HY} s={0.8} rot={80} f={f} part="head" face="smile" eyesShut
          over={face ? (
            <g>
              <ellipse cx={-38} cy={-202} rx={14} ry={8} fill="#F2A7A0" opacity={0.8} />
              <ellipse cx={38} cy={-202} rx={14} ry={8} fill="#F2A7A0" opacity={0.8} />
              <path d="M -30 -260 q 10 -8 20 0 M 10 -260 q 10 -8 20 0" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.5} />
            </g>
          ) : undefined} />
        {face && (
          <g>
            <path d={`M 1036 610 q -4 ${10 + Math.sin(f / 6) * 3} 2 ${18 + Math.sin(f / 6) * 3} q 8 -6 2 -18 Z`} fill="#9FD3F0" stroke={C.ink} strokeWidth={2.5} />
            {[0, 1, 2].map((i) => {
              const t = ((f / 40 + i / 3) % 1);
              return <text key={i} x={1000 - t * 50 + Math.sin(t * 6 + i) * 10} y={520 - t * 160} fontFamily={FONT} fontWeight={900}
                fontSize={30 + t * 26} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} opacity={Math.sin(t * Math.PI)}>Z</text>;
            })}
            <path d="M 1120 560 q 10 -10 0 -20 q -10 -10 0 -20 M 1140 600 q 10 -10 0 -20" stroke="#F2A7A0" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
          </g>
        )}
        {/* 頭までかぶった布団 (もぞもぞ) */}
        {cover > 0.02 && (
          <g transform={`rotate(${wig} 1060 640)`}>
            <path d={`M 940 660 Q ${950} ${640 - 110 * cover} 1060 ${630 - 120 * cover} Q ${1170} ${640 - 100 * cover} 1180 662 Z`} fill="#EFC46A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <path d={`M 980 650 L 984 ${640 - 70 * cover} M 1060 650 L 1060 ${636 - 100 * cover} M 1140 652 L 1136 ${640 - 70 * cover}`} stroke="#C99A3E" strokeWidth={4} opacity={0.6} />
          </g>
        )}
        {f > 10 && f < 26 && <MzGbOno x={1060} y={470} text="もぞもぞ" size={34} rot={-6} t={seg(f, 10, 14)} />}
        {/* 止められた時計 (あきれ顔) */}
        <MzGbBC x={1395} y={646} h={190} f={f} time={6 * 60} />
        <MzGbClockFace x={1430} y={430} s={0.85} mood="meh" t={seg(f, 14, 24)} f={f} />
        {f > 20 && <MzGbOno x={1500} y={340} text="…" size={52} t={seg(f, 20, 28)} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #154 ノッカー・アップは、止められません。
// 格: 山 / seed 6154
// どこ: 長屋の2階の寝室の中 (窓の内側から見る・夜明け前)。窓の向こうに向かいの長屋 (MachiNami)。
//       窓辺にろうそく・木のベッドにナイトキャップの男性。
// 演出: 窓の外から棒の房がコンコン。男性は寝たまま腕を伸ばし窓をバン!(#152 と同じ「止める」しぐさ)。
//       ところが棒は止まらず、さっきより速くコンコンコンコン。窓の外にノッカー・アップの顔がにゅっ
//       (にっこり・ガラスに鼻がぺたっ)。男性は両手で枕を頭にかぶせるが、コンコンの文字が枕を貫く。
// 動き: f0-10 コンコン / f10-20 男性が窓をバン / f20- コンコンが加速 / f22-32 顔がのぞく /
//       f32-40 枕をかぶる・文字が枕を貫く / f40-78 顔へゆっくり寄る
const Mz154: React.FC<{ f: number }> = ({ f }) => {
  const id = useSafeId("mz154");
  const fk = f < 20 ? f : 20 + (f - 20) * 2.4;
  const slap = bump(f, 10, 22);
  const peek = easeOut(seg(f, 22, 32));
  const pil = easeInOut(seg(f, 32, 40));
  const k = easeInOut(seg(f, 40, 78));
  const wall = mixColor(C.plaster, MP.nightDeep, 0.45);
  const WX0 = 640, WX1 = 1280, WY0 = 140, WY1 = 600;
  const kuY = lerp(1330, 1040, peek);
  const tipP: P = [1180, 520];
  return (
    <Frame f={f} seed={6154} dark bg={MP.nightDeep}>
      <g transform={cam(lerp(960, 1050, k), lerp(540, 480, k), lerp(1, 1.2, k))}>
        {/* 部屋の壁と梁 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={wall} />
        {Array.from({ length: 24 }, (_, i) => (
          <ellipse key={i} cx={rnd(61, i) * 1920} cy={rnd(62, i) * 800} rx={30} ry={10} fill={mixColor(C.plasterDark, MP.nightDeep, 0.45)} opacity={0.4} />
        ))}
        <rect x={-40} y={-40} width={2000} height={60} fill={C.beam} stroke={C.ink} strokeWidth={6} />
        {/* 窓の外: 向かいの長屋とノッカー・アップ */}
        <defs><clipPath id={id}><rect x={WX0} y={WY0} width={WX1 - WX0} height={WY1 - WY0} /></clipPath></defs>
        <g clipPath={`url(#${id})`}>
          <rect x={WX0} y={WY0} width={WX1 - WX0} height={WY1 - WY0} fill="#3A3F66" />
          <g transform="translate(600 180) scale(0.38)">
            <MachiNami f={f} sky={0.2} windows={[0, 1, 0, 0, 1, 0]} />
          </g>
          <KnockerUp x={1115} y={kuY} s={kuS(900)} f={fk} pose="knock" tip={tipP} face="smile" phase={3} />
          {peek > 0.6 && (
            <g opacity={seg(f, 28, 34)}>
              <ellipse cx={1115} cy={kuY - 900 * 0.68 + 30} rx={22} ry={14} fill="#F6E1DA" stroke={C.ink} strokeWidth={3} />
              <ellipse cx={1115} cy={kuY - 615 + 30} rx={70} ry={40} fill={KRP.white} opacity={0.22} />
            </g>
          )}
        </g>
        {/* 窓わく (上げ下げ窓) */}
        <rect x={WX0 - 20} y={WY0 - 20} width={WX1 - WX0 + 40} height={WY1 - WY0 + 40} fill="none" stroke={MP.woodDark} strokeWidth={24} />
        <rect x={WX0 - 32} y={WY0 - 32} width={WX1 - WX0 + 64} height={WY1 - WY0 + 64} fill="none" stroke={C.ink} strokeWidth={5} />
        <path d={`M 960 ${WY0} L 960 ${WY1} M ${WX0} 370 L ${WX1} 370`} stroke={MP.woodDark} strokeWidth={14} />
        <path d={`M ${WX0 + 30} ${WY0 + 40} L ${WX0 + 100} ${WY0 + 10} M ${WX1 - 120} ${WY1 - 30} L ${WX1 - 40} ${WY1 - 70}`} stroke={KRP.white} strokeWidth={5} opacity={0.3} strokeLinecap="round" />
        <rect x={WX0 - 60} y={WY1 + 12} width={WX1 - WX0 + 120} height={26} fill={MP.wood} stroke={C.ink} strokeWidth={5} />
        {/* カーテン */}
        {[-1, 1].map((sd) => {
          const x0 = sd === -1 ? WX0 - 110 : WX1 + 110, x1 = sd === -1 ? WX0 + 20 : WX1 - 20;
          return <path key={sd} d={`M ${x0} 100 L ${x1} 100 Q ${x1 - sd * 30 + Math.sin(f / 20) * 4} 380 ${x1 - sd * 70} 640 L ${x0} 640 Z`} fill="#6F4F5E" stroke={C.ink} strokeWidth={5} />;
        })}
        {/* 窓辺のろうそく */}
        <rect x={714} y={570} width={20} height={44} fill="#F3EBD6" stroke={C.ink} strokeWidth={3.5} />
        <ellipse cx={724} cy={614} rx={30} ry={7} fill={C.tin} stroke={C.ink} strokeWidth={3.5} />
        <Flame x={724} y={568} s={0.8} f={f} glow={1.5} />
        {/* ベッド */}
        <rect x={1560} y={560} width={60} height={420} rx={10} fill={MP.wood} stroke={C.ink} strokeWidth={6} />
        <rect x={260} y={740} width={1320} height={70} rx={16} fill={C.paperLight} stroke={C.ink} strokeWidth={5} />
        <rect x={250} y={806} width={1340} height={60} fill={MP.woodLight} stroke={C.ink} strokeWidth={5} />
        {/* 枕 (寝ているとき) */}
        {pil < 0.5 && <ellipse cx={1460} cy={740} rx={120} ry={36} fill={KRP.white} stroke={C.ink} strokeWidth={5} />}
        {/* 男性 (頭が右) */}
        <MzGbFolk x={1160} y={744} s={1.25} rot={80} f={f} part="head" face="worried" eyesShut={f < 10} wear="nightcap"
          cloth={C.nightshirt} clothDark={C.nightshirtDark} />
        <path d="M 300 760 Q 320 680 520 690 Q 900 670 1250 700 Q 1320 720 1330 760 L 1330 820 L 290 820 Z" fill={C.quilt} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={380 + i * 150} y={720 + (i % 2) * 20} width={90} height={60} rx={6} fill={i % 2 ? C.quilt2 : C.quiltDark} stroke={C.ink} strokeWidth={3} opacity={0.8} />
        ))}
        {/* バン! (窓をたたく腕) */}
        {slap > 0.02 && (
          <g>
            <MzGbArm a={[1290, 720]} b={[1260, lerp(700, 640, slap)]} c={[lerp(1280, 1150, slap), lerp(720, 588, slap)]} cloth={C.nightshirt} palm />
            {f > 15 && <MzGbBurst x={1150} y={582} r={50} t={slap} />}
            {f > 15 && <MzGbOno x={1100} y={540} text="バン!" size={50} rot={-10} t={seg(f, 15, 19)} color={MP.bell} />}
          </g>
        )}
        {/* 枕をかぶる (両手) */}
        {pil >= 0.5 && (
          <g>
            <g transform={`rotate(-80 1440 690)`}>
              <ellipse cx={1440} cy={690} rx={130} ry={48} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
              <path d="M 1370 680 Q 1400 694 1430 686" stroke="#CFC6B8" strokeWidth={3.5} fill="none" />
            </g>
            <MzGbArm a={[1320, 730]} b={[1320, 610]} c={[1400, 572]} cloth={C.nightshirt} />
            <MzGbArm a={[1320, 760]} b={[1350, 806]} c={[1405, 802]} cloth={C.nightshirt} />
          </g>
        )}
        {/* コンコン (速くなる・枕を貫く) */}
        {f < 20 ? (
          <MzGbOno x={1210} y={470} text="コン" size={44} rot={8} opacity={0.5 + 0.5 * Math.sin(f / 2)} />
        ) : (
          <g>
            <MzGbOno x={1190} y={300} text="コンコンコンコン!" size={46} rot={6} t={seg(f, 20, 24)} />
            {pil >= 0.5 && (
              <g>
                <path d="M 1180 700 L 1560 640" stroke={KRP.white} strokeWidth={8} strokeDasharray="20 14" strokeLinecap="round" opacity={0.9} />
                <MzGbOno x={1420} y={690} text="コンコン" size={50} rot={-10} t={seg(f, 36, 42)} color={KRP.yellow} />
              </g>
            )}
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #155 起きるまで、帰ってくれないのです。
// 格: 山 / seed 6155
// どこ: 長屋 (MachiNami sky=0.3) を通りから見上げる。4軒目の2階の窓に男性の影。
// 演出: ノッカー・アップが4軒目の玄関の石段に腰を下ろし、カップの紅茶を手に、棒で窓をのんびりコンコン (居座る)。
//       窓の影は布団にもぐる→コンコン→もぐる。足元には魔法瓶・新聞・パン・座布団と、居座りの道具がどんどん増える。
//       ついに窓が開き、ぼさぼさ頭の男性がしぶしぶ顔を出す (「起きたよ!」)。ノッカー・アップはすっと立ち、
//       次の家へ去っていく。
// 動き: f0-26 道具が増える・影がもぐる / f26-36 窓が開いて男性 / f0-40 窓へ寄る /
//       f52- 立ち上がって右へ去る・道具は片づく
const Mz155: React.FC<{ f: number }> = ({ f }) => {
  const id = useSafeId("mz155");
  const [wx, wy] = MACHI_WIN[3];
  const zoom = easeInOut(seg(f, 0, 40));
  const opened = f >= 28;
  const leave = f >= 52;
  const go = easeInOut(seg(f, 54, 86));
  const s = kuS(380);
  const KX = 1050, STEP = 856;
  const yv = STEP + 58 * s;
  const duck = Math.max(0, Math.sin(f / 4.5)) * (1 - seg(f, 24, 28));
  const props = [seg(f, 0, 6), seg(f, 6, 12), seg(f, 12, 18), seg(f, 18, 24)];
  const packed = 1 - seg(f, 52, 58);
  return (
    <Frame f={f} seed={6155} dark bg={MP.nightDeep}>
      <g transform={cam(lerp(1000, 1100, zoom), lerp(600, 560, zoom), lerp(1.2, 1.45, zoom))}>
        <MachiNami f={f} sky={0.3} windows={[0, 0, 0, opened ? "open" : 1, 0, 0]} />
        <defs><clipPath id={id}><rect x={wx - 60} y={wy - 80} width={120} height={160} /></clipPath></defs>
        <g clipPath={`url(#${id})`}>
          {!opened ? (
            /* もぐったり出たりする影 */
            <g transform={`translate(0 ${duck * 70})`} opacity={0.75}>
              <circle cx={wx} cy={wy - 6} r={30} fill={MP.soot} />
              <rect x={wx - 46} y={wy + 20} width={92} height={80} rx={20} fill={MP.soot} />
            </g>
          ) : (
            <MzGbFolk x={wx} y={wy + 120} s={0.5} f={f} phase={2} face="sad" part="armless" wear="messy"
              cloth={C.nightshirt} clothDark={C.nightshirtDark} />
          )}
        </g>
        {opened && (
          <g>
            {/* 窓わくにのせた両腕 */}
            <MzGbArm a={[wx - 30, wy + 60]} b={[wx - 50, wy + 82]} c={[wx - 20, wy + 88]} cloth={C.nightshirt} w={11} />
            <MzGbArm a={[wx + 30, wy + 60]} b={[wx + 50, wy + 82]} c={[wx + 20, wy + 88]} cloth={C.nightshirt} w={11} />
            {/* 吹き出し */}
            <g transform={`translate(${wx + 190} ${wy - 40}) scale(${pop(seg(f, 30, 38))})`}>
              <path d="M -110 -40 Q -110 -66 -84 -66 L 84 -66 Q 110 -66 110 -40 L 110 10 Q 110 36 84 36 L -40 36 L -80 70 L -66 36 L -84 36 Q -110 36 -110 10 Z" fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              <text x={0} y={-2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink}>起きたよ!</text>
            </g>
          </g>
        )}
        {!leave ? (
          <g>
            {/* 座布団と居座りの道具 */}
            <g transform={`translate(${KX - 30} ${STEP + 2}) scale(${pop(props[3])})`}>
              <ellipse cx={0} cy={0} rx={70} ry={12} fill={C.quilt} stroke={C.ink} strokeWidth={4} />
            </g>
            {/* 腰を下ろしたノッカー・アップ (上半身は部品・脚は前へ) */}
            {(() => {
              const cid = id + "s";
              return (
                <g>
                  <defs><clipPath id={cid}><rect x={KX - 400} y={yv - 900} width={800} height={900 - 46 * s} /></clipPath></defs>
                  {[-1, 1].map((sd) => (
                    <g key={sd}>
                      <rect x={KX + sd * 24 - 13} y={STEP - 6} width={26} height={62} fill={C.coatDark} stroke={C.ink} strokeWidth={4.5} />
                      <ellipse cx={KX + sd * 28} cy={STEP + 58} rx={22} ry={10} fill={C.ink} />
                    </g>
                  ))}
                  <g clipPath={`url(#${cid})`}>
                    <KnockerUp x={KX} y={yv} s={s} f={f * 0.6} pose="knock" tip={[wx - 54, wy + 78]} face="smile" phase={2} />
                  </g>
                  <path d={`M ${KX - 70 * s} ${STEP - 30} L ${KX + 70 * s} ${STEP - 30} L ${KX + 76 * s} ${STEP + 2} L ${KX - 76 * s} ${STEP + 2} Z`} fill={C.coat} stroke={C.ink} strokeWidth={4.5} />
                </g>
              );
            })()}
            {/* 左手の紅茶のカップ (湯気) */}
            <g transform={`translate(${KX - 76 * s} ${yv - 70 * s}) scale(${pop(props[1])})`}>
              <path d="M -16 -20 L 16 -20 L 12 10 L -12 10 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
              <path d="M 16 -12 q 12 2 0 16" stroke={C.ink} strokeWidth={3.5} fill="none" />
              {[0, 1].map((i) => {
                const t = ((f / 24 + i / 2) % 1);
                return <path key={i} d={`M ${-4 + i * 8} ${-26 - t * 40} q 8 -10 0 -20`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={1 - t} strokeLinecap="round" />;
              })}
            </g>
            <g opacity={packed}>
              {/* 魔法瓶 */}
              <g transform={`translate(${KX - 170} ${STEP + 40}) scale(${pop(props[0])})`}>
                <rect x={-20} y={-90} width={40} height={90} rx={10} fill={MP.ironLight} stroke={C.ink} strokeWidth={4} />
                <rect x={-24} y={-104} width={48} height={20} rx={5} fill={C.scarf} stroke={C.ink} strokeWidth={4} />
                <line x1={-10} y1={-70} x2={-10} y2={-20} stroke={KRP.white} strokeWidth={4} opacity={0.5} />
              </g>
              {/* 新聞 */}
              <g transform={`translate(${KX + 170} ${STEP + 44}) rotate(-8) scale(${pop(props[2])})`}>
                <rect x={-60} y={-24} width={120} height={36} fill={C.paper} stroke={C.ink} strokeWidth={4} />
                {[0, 1, 2].map((i) => <line key={i} x1={-50} y1={-14 + i * 9} x2={40 - i * 10} y2={-14 + i * 9} stroke={C.newsInk} strokeWidth={3} opacity={0.6} />)}
              </g>
              {/* パン */}
              <g transform={`translate(${KX - 250} ${STEP + 50}) scale(${pop(props[3])})`}>
                <ellipse cx={0} cy={-16} rx={44} ry={22} fill={MP.woodLight} stroke={C.ink} strokeWidth={4} />
                <path d="M -22 -26 l 8 14 M 0 -30 l 8 14 M 22 -26 l 8 14" stroke={MP.woodDark} strokeWidth={4} />
              </g>
            </g>
            {f < 28 && <MzGbOno x={wx - 140} y={wy + 150} text="コン…コン…" size={34} rot={-6} opacity={0.7 + 0.3 * Math.sin(f / 3)} />}
          </g>
        ) : (
          <g>
            {/* すっと立って、帽子をちょいと上げて次の家へ */}
            <KnockerUp x={lerp(KX, KX + 560, go)} y={880} s={s} f={f} pose="walk" face="smile" phase={2} />
            <MzGbOno x={lerp(KX, KX + 560, go)} y={880 - 400} text="では" size={34} rot={-6} t={seg(f, 54, 60)} opacity={1 - seg(f, 76, 86)} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #156 人を起こすのにいちばん効いたのは、音の大きさではなく、止められないこと、でした。
// 格: 図 / seed 6156
// どこ: 夜明けの長屋の前 (MachiNami sky=0.9・朝もや) の石畳に置かれた、古い木と真鍮の天秤ばかり。
// 演出: 左の皿に巨大なラッパと大太鼓 (音の大きさ) がどさっ。右の皿には小さなノッカー・アップの人形が、
//       皿の上の小さな窓をコンコンし続け、横に「∞」の輪 (止まらない)。最初は左がずしっと下がるが、
//       コンコンのたびに右がじわじわ重くなり、最後に右がどすんと下がって、ラッパと太鼓が宙に跳ねる。
//       札は皿の下の「大きさ」「止められない」の2語だけ (同じ y)。
// 動き: f0-12 左がずしっ / f12-34 コンコンのたびに右が重くなる / f34-38 どすん・ラッパと太鼓が跳ねる /
//       f40-150 右の皿へゆっくり寄る
const Mz156: React.FC<{ f: number }> = ({ f }) => {
  const kk = seg(f, 12, 34) * 4;
  const step = Math.min(Math.floor(kk), 4) + (kk >= 4 ? 0 : easeOut(kk - Math.floor(kk)));
  let th = lerp(0, -14, easeOut(seg(f, 0, 12))) + 4 * step * (f >= 12 ? 1 : 0);
  if (f >= 34) th = lerp(2, 12, pop(seg(f, 34, 40))) + Math.sin(f / 3) * 2 * (1 - seg(f, 40, 70));
  const r = (th * Math.PI) / 180;
  const PV: P = [960, 300];
  const L = 560;
  const endL: P = [PV[0] - L * Math.cos(r), PV[1] - L * Math.sin(r)];
  const endR: P = [PV[0] + L * Math.cos(r), PV[1] + L * Math.sin(r)];
  const CH = 200;
  const panL: P = [endL[0], endL[1] + CH];
  const panR: P = [endR[0], endR[1] + CH];
  const fly = bump(f, 34, 64);
  const z = easeInOut(seg(f, 40, 150));
  const LABEL_Y = 776;
  const pan = (p: P) => (
    <g>
      {[-1, 1].map((sd) => <line key={sd} x1={p[0] + sd * 8} y1={p[1] - CH} x2={p[0] + sd * 140} y2={p[1]} stroke={MP.brassDark} strokeWidth={5} strokeDasharray="10 6" />)}
      <path d={`M ${p[0] - 160} ${p[1]} Q ${p[0]} ${p[1] + 60} ${p[0] + 160} ${p[1]} Z`} fill={MP.brass} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${p[0] - 120} ${p[1] + 10} Q ${p[0] - 40} ${p[1] + 30} ${p[0] + 20} ${p[1] + 30}`} stroke={MP.brassLight} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <Frame f={f} seed={6156} bg={MP.mist}>
      <g transform={cam(lerp(960, 1050, z), lerp(560, 600, z), lerp(1, 1.12, z))}>
        <MachiNami f={f} sky={0.9} windows={[1, 1, 0, 1, 1, 1]} />
        <rect x={-40} y={-40} width={2000} height={1160} fill={MP.mist} opacity={0.45} />
        {/* 天秤の台と柱 */}
        <path d="M 800 1000 L 1120 1000 L 1080 940 L 840 940 Z" fill={C.balanceWood} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <MzGbGrain x={840} y={946} w={240} h={50} n={2} seed={6} />
        <rect x={938} y={300} width={44} height={640} fill={C.balanceWood} stroke={C.ink} strokeWidth={6} />
        <MzGbGrain x={938} y={300} w={44} h={640} n={1} seed={9} vertical />
        <path d={`M 960 ${PV[1] - 70} L 948 ${PV[1] - 10} L 972 ${PV[1] - 10} Z`} fill={MP.brass} stroke={C.ink} strokeWidth={4} />
        {/* 竿 */}
        <line x1={endL[0]} y1={endL[1]} x2={endR[0]} y2={endR[1]} stroke={C.ink} strokeWidth={26} strokeLinecap="round" />
        <line x1={endL[0]} y1={endL[1]} x2={endR[0]} y2={endR[1]} stroke={MP.brass} strokeWidth={16} strokeLinecap="round" />
        <circle cx={PV[0]} cy={PV[1]} r={20} fill={MP.brassDark} stroke={C.ink} strokeWidth={5} />
        {[endL, endR].map((e, i) => <circle key={i} cx={e[0]} cy={e[1]} r={12} fill={MP.brassDark} stroke={C.ink} strokeWidth={4} />)}
        {pan(panL)}
        {pan(panR)}
        {/* 左の皿: 大太鼓とラッパ (どすんで宙へ) */}
        <g transform={`translate(0 ${-fly * 110}) rotate(${fly * -14} ${panL[0]} ${panL[1]})`}>
          <g transform={`translate(${panL[0] - 50} ${panL[1] - 6})`}>
            <rect x={-80} y={-130} width={160} height={124} fill={C.drum} stroke={C.ink} strokeWidth={6} />
            <ellipse cx={0} cy={-130} rx={80} ry={24} fill={C.paperLight} stroke={C.ink} strokeWidth={6} />
            <path d="M -80 -110 L -40 -20 L 0 -110 L 40 -20 L 80 -110" stroke={KRP.white} strokeWidth={5} fill="none" />
            <ellipse cx={0} cy={-6} rx={80} ry={16} fill={C.drum} stroke={C.ink} strokeWidth={5} />
          </g>
          <g transform={`translate(${panL[0] + 40} ${panL[1] - 150}) rotate(-24)`}>
            <path d="M -110 -10 L 40 -16 Q 80 -60 110 -70 L 110 70 Q 80 60 40 16 L -110 10 Z" fill={C.horn} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <ellipse cx={110} cy={0} rx={18} ry={70} fill={MP.brassDark} stroke={C.ink} strokeWidth={5} />
            <rect x={-130} y={-8} width={24} height={16} rx={4} fill={MP.brassDark} stroke={C.ink} strokeWidth={4} />
            <path d="M -60 -12 q 20 -30 50 0" stroke={C.ink} strokeWidth={5} fill="none" />
          </g>
        </g>
        {fly > 0.05 && <MzGbOno x={panL[0]} y={panL[1] - 330 - fly * 120} text="ポーン" size={44} rot={-10} opacity={fly} />}
        {/* 右の皿: 小さなノッカー・アップと窓・∞ */}
        <g>
          <g transform={`translate(${panR[0] + 80} ${panR[1] + 4})`}>
            <MzGbBricks x={-60} y={-230} w={120} h={230} bw={30} bh={14} seed={4} />
            <rect x={-60} y={-230} width={120} height={230} fill="none" stroke={C.ink} strokeWidth={4} />
            <rect x={-36} y={-200} width={72} height={96} fill="#FFD983" stroke={C.ink} strokeWidth={4} />
            <path d="M 0 -200 L 0 -104 M -36 -152 L 36 -152" stroke="#F1EADF" strokeWidth={3.5} />
            <rect x={-44} y={-104} width={88} height={10} fill={MP.stoneLight} stroke={C.ink} strokeWidth={3} />
          </g>
          <KnockerUp x={panR[0] - 40} y={panR[1] + 6} s={kuS(200)} f={f * 1.3} pose="knock" tip={[panR[0] + 60, panR[1] - 150]} face="smile" phase={1} />
          <g transform={`translate(${panR[0] - 150} ${panR[1] - 60}) scale(${0.7 + 0.05 * Math.sin(f / 5)})`}>
            <path d="M 0 0 C -20 -30 -70 -30 -70 0 C -70 30 -20 30 0 0 C 20 -30 70 -30 70 0 C 70 30 20 30 0 0 Z" fill="none" stroke={C.ink} strokeWidth={22} strokeLinejoin="round" />
            <path d="M 0 0 C -20 -30 -70 -30 -70 0 C -70 30 -20 30 0 0 C 20 -30 70 -30 70 0 C 70 30 20 30 0 0 Z" fill="none" stroke={MP.bell} strokeWidth={12} strokeLinejoin="round" />
          </g>
          {f >= 12 && f < 36 && <MzGbOno x={panR[0] + 180} y={panR[1] - 250} text="コン" size={36} rot={10} t={(kk % 1) * 3} />}
        </g>
        {f >= 34 && <MzGbOno x={panR[0] - 60} y={panR[1] - 250} text="ドスン" size={50} rot={-4} t={seg(f, 34, 38)} opacity={1 - seg(f, 60, 80)} color={KRP.yellow} />}
        {/* 札 (同じ高さ) */}
        <TagPlate x={400} y={LABEL_Y} text="大きさ" size={40} t={seg(f, 4, 14)} />
        <TagPlate x={1520} y={LABEL_Y} text="止められない" size={40} t={seg(f, 14, 24)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  mz_145: (f) => <Mz145 f={f} />,
  mz_146: (f) => <Mz146 f={f} />,
  mz_147: (f) => <Mz147 f={f} />,
  mz_148: (f) => <Mz148 f={f} />,
  mz_149: (f) => <Mz149 f={f} />,
  mz_150: (f) => <Mz150 f={f} />,
  mz_151: (f) => <Mz151 f={f} />,
  mz_152: (f) => <Mz152 f={f} />,
  mz_153: (f) => <Mz153 f={f} />,
  mz_154: (f) => <Mz154 f={f} />,
  mz_155: (f) => <Mz155 f={f} />,
  mz_156: (f) => <Mz156 f={f} />,
};

export const MZ_GB_MOTIFS: string[] = [
  "mz_145", // #145
  "mz_146", // #146
  "mz_147", // #147
  "mz_148", // #148
  "mz_149", // #149
  "mz_150", // #150
  "mz_151", // #151
  "mz_152", // #152
  "mz_153", // #153
  "mz_154", // #154
  "mz_155", // #155
  "mz_156", // #156
];

export const mezaGbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
