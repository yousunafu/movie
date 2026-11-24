// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#121〜#130 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L3b。
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
  // 竹夫人・宋 (YawaE1 とそろえる)
  bamboo: "#D9BC72", bambooDark: "#A9873F", bambooLight: "#EEDCA4", tubeIn: "#6A5230",
  stalk: "#86AB5E", stalkDark: "#5B7F3E", stalkLeaf: "#6E9A4C",
  night: "#24344E", nightDeep: "#18233A", nightHaze: "#33476A", moon: "#F7EDC4",
  songCloth: "#5E7FA0", songClothDark: "#45627E", hat: "#2B2622", beard: "#4A4038",
  tile: "#5C6573", tileDark: "#434B57", wallSong: "#EFE4C9", sky: "#CFE0E6",
  wind: "#7FC8E8", windDeep: "#3E9CCB", bedWood: "#8A5A36", bedWoodDark: "#653F24",
  mat: "#D6C38E", matLine: "#B7A26A", curtain: "#B9D3C6", lantern: "#D9553A",
  // 札 (木)
  tagWood: "#E8D2A2", tagWoodDark: "#B89560",
  // 江戸の縁側
  board: "#B98A56", boardDark: "#8C6239", shoji: "#F3EEDD", shojiFrame: "#8A6A44",
  tatami: "#C9C27A", kimono: "#8A5A3A", kimonoDark: "#6A4329",
  asagao: "#6C7FD8", asagaoDeep: "#4A5AB8", glass: "#CFE8F2", pig: "#6E8A6A", pigDark: "#4F6A4C",
  smoke: "#E4E1DA", tanzaku: "#F2E6F0", gold: "#E2C25A",
  // 韓国
  hanbok: "#F4F1EA", hanbokDark: "#D9D3C4", gat: "#1E1C1A", hanokWood: "#9A6B42", hanji: "#F5EFE0",
  stone: "#B9B2A3", stoneDark: "#8E877A", earth: "#C7A878", earthDark: "#A88A5C",
  onggi: "#6B4A32", onggiDark: "#4E3423", pine: "#4F7A4A", pineDark: "#3A5C38", hill: "#9DBB8C",
  // 火
  flame: "#F6A93B", flameCore: "#FFE27A", flameRed: "#E8613A", dusk: "#F2C58E", dusk2: "#E7A27A",
  log: "#7A5232",
  // 道具の棚
  mudWall: "#C9AE84", mudWallDark: "#A88C62", iron: "#6B6E73", fujin: "#FBE3E6", straw: "#D8BE7A",
  // 1950年代アメリカ
  brick: "#A9553B", brickDark: "#7F3D2A", mortar: "#D8C3A8", snow: "#F4F7FA", snowShade: "#C9D6E2",
  winter: "#5F6F8C", winterDeep: "#3F4C66", warm: "#FFD98A", bark: "#4E4038", fir: "#3F6150",
  monkey: "#9A6A45", monkeyDark: "#6E4A2E", monkeyFace: "#F2B7A8",
  hallWall: "#6E5A48", hallDark: "#4A3B2F", screen: "#F7F3E6", beam: "#FFF4C8",
  board2: "#2F4A3C", chalk: "#E8EFE6", flagRed: "#B8343B", flagBlue: "#2D3F78",
  wire: "#8C9298", wireDark: "#5E6369", towel: "#EFE3C8", towelDark: "#D6C3A0", bulb: "#FFE07A",
  suit1: "#4A4F5A", suit2: "#5B4E44", suit3: "#3E4B66", hairBrown: "#5A4232", coatWhite: "#D8D8D8",
} as const;
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
type PFace = NonNullable<React.ComponentProps<typeof Person>["face"]>;
const camT = (cx: number, cy: number, sc: number, dx = 0, dy = 0) =>
  `translate(${cx * (1 - sc) + dx} ${cy * (1 - sc) + dy}) scale(${sc})`;

/* 竹夫人 (YawaE1 の L3aTube を写したもの。同じ物を同じ絵で) */
const L3bTube: React.FC<{
  id: string; x: number; y: number; L: number; R: number; rot?: number; spin?: number; sw?: number;
}> = ({ id, x, y, L, R, rot = 0, spin = 0, sw = 1 }) => {
  const N = 12;
  const k = 1.73 / R;
  const half = L / 2;
  const front: string[] = [];
  const back: string[] = [];
  for (let i = 0; i < N; i++) {
    const ph = spin + (i * Math.PI * 2) / N;
    const yy = R * Math.sin(ph);
    (Math.cos(ph) > 0 ? front : back).push(`M ${-half} ${yy.toFixed(1)} L ${half} ${yy.toFixed(1)}`);
  }
  const SAMP = 90;
  for (const sg of [1, -1]) {
    for (let i = 0; i < N; i++) {
      let cur = ""; let curFront: boolean | null = null;
      for (let j = 0; j <= SAMP; j++) {
        const xx = -half + (L * j) / SAMP;
        const ph = spin + (i * Math.PI * 2) / N + Math.PI / N + sg * k * xx;
        const fr = Math.cos(ph) > 0;
        const pt = `${xx.toFixed(1)} ${(R * Math.sin(ph)).toFixed(1)}`;
        if (curFront === null || fr !== curFront) {
          if (cur) (curFront ? front : back).push(cur);
          cur = `M ${pt}`; curFront = fr;
        } else cur += ` L ${pt}`;
      }
      if (cur) (curFront ? front : back).push(cur);
    }
  }
  const rr = R * 0.3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <defs>
        <clipPath id={id}><rect x={-half} y={-R} width={L} height={R * 2} /></clipPath>
      </defs>
      <ellipse cx={0} cy={R + 14} rx={half * 0.95} ry={R * 0.22} fill={KRP.ink} opacity={0.16} />
      <g clipPath={`url(#${id})`}>
        <rect x={-half} y={-R} width={L} height={R * 2} fill={C.tubeIn} />
        <path d={back.join(" ")} fill="none" stroke={C.bambooDark} strokeWidth={5 * sw} opacity={0.75} />
        <path d={front.join(" ")} fill="none" stroke={KRP.ink} strokeWidth={13 * sw} />
        <path d={front.join(" ")} fill="none" stroke={C.bamboo} strokeWidth={8 * sw} />
        <rect x={-half} y={-R * 0.82} width={L} height={R * 0.26} fill={KRP.white} opacity={0.2} />
        <rect x={-half} y={R * 0.5} width={L} height={R * 0.5} fill={KRP.ink} opacity={0.22} />
      </g>
      <rect x={-half} y={-R} width={L} height={R * 2} fill="none" stroke={KRP.ink} strokeWidth={6 * sw} />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd * (half - R * 0.28) - R * 0.12} y={-R - 3} width={R * 0.24} height={R * 2 + 6} rx={4}
            fill={C.bamboo} stroke={KRP.ink} strokeWidth={5 * sw} />
          <line x1={sd * (half - R * 0.28)} y1={-R} x2={sd * (half - R * 0.28)} y2={R} stroke={C.bambooDark} strokeWidth={3 * sw} />
        </g>
      ))}
      <ellipse cx={-half} cy={0} rx={rr} ry={R} fill={C.tubeIn} stroke={KRP.ink} strokeWidth={16 * sw} />
      <ellipse cx={-half} cy={0} rx={rr} ry={R} fill="none" stroke={C.bamboo} strokeWidth={9 * sw} />
      <ellipse cx={-half + rr * 0.35} cy={0} rx={rr * 0.5} ry={R * 0.7} fill={KRP.ink} opacity={0.35} />
      <path d={`M ${half} ${-R} A ${rr} ${R} 0 0 1 ${half} ${R}`} fill={C.bamboo} stroke={KRP.ink} strokeWidth={6 * sw} />
      <path d={`M ${half} ${-R} A ${rr} ${R} 0 0 1 ${half} ${R}`} fill="none" stroke={C.bambooLight} strokeWidth={4 * sw} opacity={0.8} />
    </g>
  );
};

/* Person と同じ座標・同じゆれで、頭や服に物を足す (YawaE1 の L3aOn と同じ) */
const L3bOn: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; lean?: number; still?: boolean; children: React.ReactNode;
}> = ({ x, y, s, f, phase = 0, lean = 0, still = false, children }) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};
/* 幞頭 (宋代の黒い布の帽子。左右に長い翅) */
const L3bFutou: React.FC<{ wing?: number; flap?: number }> = ({ wing = 1, flap = 0 }) => (
  <g>
    {wing > 0 && <rect x={-64 - 110 * wing} y={-268 + flap} width={110 * wing} height={11} rx={5} fill={C.hat} stroke={KRP.ink} strokeWidth={3}
      transform={`rotate(${flap * 0.6} -64 -262)`} />}
    {wing > 0 && <rect x={64} y={-268 - flap} width={110 * wing} height={11} rx={5} fill={C.hat} stroke={KRP.ink} strokeWidth={3}
      transform={`rotate(${-flap * 0.6} 64 -262)`} />}
    <path d="M -62 -244 Q -66 -300 0 -304 Q 66 -300 62 -244 Q 0 -256 -62 -244 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -30 -298 Q -30 -336 0 -338 Q 30 -336 30 -298 Z" fill={C.hat} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -54 -262 Q 0 -272 54 -262" fill="none" stroke={KRP.grayDark} strokeWidth={3} opacity={0.7} />
  </g>
);
/* あごひげと口ひげ */
const L3bBeard: React.FC = () => (
  <g>
    <path d="M -30 -184 Q -26 -150 -10 -128 Q 0 -104 10 -128 Q 26 -150 30 -184 Q 16 -172 0 -174 Q -16 -172 -30 -184 Z"
      fill={C.beard} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M -26 -196 Q -12 -186 0 -192 Q 12 -186 26 -196" fill="none" stroke={C.beard} strokeWidth={6} strokeLinecap="round" />
  </g>
);
void L3bBeard;
/* 長い上着の裾 */
const L3bRobe: React.FC<{ cloth: string; dark: string; collar?: string }> = ({ cloth, dark, collar = KRP.white }) => (
  <g>
    <path d="M -58 -70 L -72 -12 Q 0 -4 72 -12 L 58 -70 Z" fill={cloth} stroke={KRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M 0 -70 L 0 -8" stroke={dark} strokeWidth={4} />
    <path d="M -58 -74 L 58 -74" stroke={dark} strokeWidth={7} />
    <path d="M -24 -160 L 0 -128 L 24 -160" fill="none" stroke={collar} strokeWidth={5} />
  </g>
);
/* 韓国の笠 (カッ)。黒い馬毛の透ける広いつば + 筒の山 + あごひも */
const L3bGat: React.FC = () => (
  <g>
    <path d="M -64 -262 Q -68 -200 -44 -168 M 64 -262 Q 68 -200 44 -168" fill="none" stroke={C.gat} strokeWidth={3} />
    <circle cx={-44} cy={-168} r={5} fill={C.lantern} stroke={KRP.ink} strokeWidth={2} />
    <circle cx={44} cy={-168} r={5} fill={C.lantern} stroke={KRP.ink} strokeWidth={2} />
    <ellipse cx={0} cy={-266} rx={132} ry={20} fill={C.gat} opacity={0.72} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={0} cy={-268} rx={104} ry={12} fill="none" stroke={KRP.grayDark} strokeWidth={2.5} opacity={0.6} />
    <path d="M -40 -270 L -36 -346 Q 0 -354 36 -346 L 40 -270 Q 0 -262 -40 -270 Z" fill={C.gat} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -38 -286 Q 0 -278 38 -286" fill="none" stroke={KRP.grayDark} strokeWidth={6} opacity={0.8} />
    <path d="M -24 -340 L -22 -296" stroke={KRP.white} strokeWidth={4} opacity={0.25} />
  </g>
);
/* 韓服の結びひも (コルム) */
const L3bGoreum: React.FC<{ col?: string }> = ({ col = C.hanbokDark }) => (
  <g>
    <path d="M -24 -160 L 0 -128 L 24 -160" fill="none" stroke={col} strokeWidth={6} />
    <path d="M 12 -132 Q 30 -120 22 -92 M 12 -132 Q 40 -126 40 -100" fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" />
  </g>
);

/* 名前の木札 (ひもでぶら下がる。縦書き)。x,y = ひもの付け根 */
const L3bHangTag: React.FC<{
  x: number; y: number; len: number; text: string; swing: number; t: number; size?: number; fill?: string; color?: string;
}> = ({ x, y, len, text, swing, t, size = 54, fill = C.tagWood, color = KRP.ink }) => {
  if (t <= 0) return null;
  const drop = (1 - easeOut(clamp01(t))) * -140;
  const w = size + 40;
  const h = text.length * size + 44;
  return (
    <g transform={`translate(${x} ${y}) rotate(${swing})`} opacity={clamp01(t * 3)}>
      <line x1={-10} y1={0} x2={0} y2={len + drop} stroke={KRP.ink} strokeWidth={4} />
      <line x1={10} y1={0} x2={0} y2={len + drop} stroke={KRP.ink} strokeWidth={4} />
      <g transform={`translate(0 ${len + drop})`}>
        <rect x={-w / 2 + 6} y={6} width={w} height={h} rx={9} fill={KRP.ink} opacity={0.18} />
        <path d={`M ${-w / 2} 14 L -14 0 L 14 0 L ${w / 2} 14 L ${w / 2} ${h} L ${-w / 2} ${h} Z`}
          fill={fill} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M ${-w / 2 + 10} ${h * 0.4} q ${w * 0.4} 8 ${w - 20} 0 M ${-w / 2 + 10} ${h * 0.75} q ${w * 0.4} -6 ${w - 20} 0`}
          fill="none" stroke={C.tagWoodDark} strokeWidth={2.5} opacity={0.6} />
        <circle cx={0} cy={0} r={6} fill={KRP.ink} />
        {text.split("").map((ch, i) => (
          <text key={i} x={0} y={30 + size * (i + 0.86)} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={size} fill={color}>{ch}</text>
        ))}
      </g>
    </g>
  );
};

/* 瓦屋根 (反りのある軒)。x 左端・y 軒の下端・w 幅・h 高さ */
const L3bRoof: React.FC<{ x: number; y: number; w: number; h: number; col?: string }> = ({ x, y, w, h, col = C.tile }) => (
  <g>
    <path d={`M ${x - 30} ${y - 26} Q ${x + 10} ${y - 4} ${x + 60} ${y} L ${x + w - 60} ${y} Q ${x + w - 10} ${y - 4} ${x + w + 30} ${y - 26}
      L ${x + w - 70} ${y - h} L ${x + 70} ${y - h} Z`} fill={col} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
    {Array.from({ length: Math.floor(w / 34) }, (_, i) => {
      const xx = x + 40 + i * 34;
      return <line key={i} x1={xx} y1={y - 4} x2={lerp(xx, x + w / 2, 0.12)} y2={y - h + 6} stroke={C.tileDark} strokeWidth={4} />;
    })}
    <rect x={x + 56} y={y - h - 14} width={w - 112} height={18} rx={6} fill={C.tileDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

/* 寝そべる人 (Person 全体を -90° 回す。頭が左・足が右)。fx,fy = 足元。
   画面上: 頭の中心 = (fx - 228s, fy)、胸の前の手 = (fx - 118s, fy ∓ 14s) */
const L3bLying: React.FC<{
  fx: number; fy: number; s: number; f: number; face?: PFace; sleep?: boolean; cloth?: string; clothDark?: string;
  children?: React.ReactNode;
}> = ({ fx, fy, s, f, face = "smile", sleep = false, cloth = C.songCloth, clothDark = C.songClothDark, children }) => {
  const br = 1 + Math.sin(f / 16) * 0.012;
  return (
    <g transform={`translate(${fx} ${fy}) scale(${s}) rotate(-90) scale(1 ${br})`}>
      <Person x={0} y={0} s={1} f={sleep ? 0 : f} still face={face} pose="hold" cloth={cloth} clothDark={clothDark} />
      {sleep && (
        <g>
          <ellipse cx={-24} cy={-222} rx={16} ry={21} fill={KRP.white} />
          <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
          <path d="M -36 -222 Q -24 -210 -12 -222 M 12 -222 Q 24 -210 36 -222" fill="none" stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
        </g>
      )}
      {children}
    </g>
  );
};
/* 寝そべる人の手 (竹夫人の上に描き直して「抱えている」に見せる) */
const L3bLyingHands: React.FC<{ fx: number; fy: number; s: number; f: number }> = ({ fx, fy, s, f }) => {
  const br = 1 + Math.sin(f / 16) * 0.012;
  return (
    <g transform={`translate(${fx} ${fy}) scale(${s}) rotate(-90) scale(1 ${br})`}>
      <rect x={-34} y={-150} width={22} height={40} rx={11} fill={C.songCloth} stroke={KRP.ink} strokeWidth={4.5} transform="rotate(-20 -23 -130)" />
      <circle cx={-14} cy={-112} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={14} cy={-112} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

/* 炎 1枚 */
const L3bFlame: React.FC<{ x: number; y: number; h: number; w: number; f: number; ph: number; core?: boolean }> = ({ x, y, h, w, f, ph, core = true }) => {
  const sx = Math.sin(f / 3 + ph) * w * 0.35;
  const hh = h * (0.88 + 0.12 * Math.sin(f / 2.3 + ph * 2));
  return (
    <g>
      <path d={`M ${x - w} ${y} Q ${x - w * 1.15} ${y - hh * 0.45} ${x + sx} ${y - hh} Q ${x + w * 1.15} ${y - hh * 0.45} ${x + w} ${y} Z`}
        fill={C.flameRed} stroke={KRP.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${x - w * 0.7} ${y} Q ${x - w * 0.8} ${y - hh * 0.4} ${x + sx * 0.7} ${y - hh * 0.78} Q ${x + w * 0.8} ${y - hh * 0.4} ${x + w * 0.7} ${y} Z`}
        fill={C.flame} />
      {core && (
        <path d={`M ${x - w * 0.38} ${y} Q ${x - w * 0.45} ${y - hh * 0.3} ${x + sx * 0.4} ${y - hh * 0.5} Q ${x + w * 0.45} ${y - hh * 0.3} ${x + w * 0.38} ${y} Z`}
          fill={C.flameCore} />
      )}
    </g>
  );
};

/* 針金のお母さん (スライド・図用)。足元原点・高さ約320 */
export const L3bWireMom: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-80} y={-24} width={160} height={24} rx={4} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-56} y={-236} width={112} height={212} rx={10} fill={C.wireDark} opacity={0.18} />
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d={`M -56 ${-36 - i * 12.5} Q 0 ${-30 - i * 12.5} 56 ${-36 - i * 12.5}`} fill="none" stroke={C.wireDark} strokeWidth={3.5} />
    ))}
    <path d="M -56 -236 L -56 -24 M 56 -236 L 56 -24 M 0 -236 L 0 -24" stroke={C.wire} strokeWidth={4} />
    <rect x={-56} y={-236} width={112} height={212} rx={10} fill="none" stroke={KRP.ink} strokeWidth={4} />
    <rect x={-6} y={-262} width={12} height={28} fill={C.wireDark} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-46} y={-334} width={92} height={76} rx={6} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={-18} cy={-302} r={7} fill={KRP.ink} />
    <circle cx={18} cy={-302} r={7} fill={KRP.ink} />
    <line x1={-12} y1={-278} x2={12} y2={-278} stroke={KRP.ink} strokeWidth={4} />
    {/* 胸の哺乳びん */}
    <rect x={52} y={-176} width={44} height={22} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M 96 -170 l 14 5 l -14 5 Z" fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
/* 布のお母さん (同じ形をタオル地でくるむ・丸い顔・背中に電球) */
const L3bClothMom: React.FC<{ s?: number; f?: number }> = ({ s = 1, f = 0 }) => (
  <g transform={`scale(${s})`}>
    <circle cx={30} cy={-150} r={70} fill={C.bulb} opacity={0.25 + Math.sin(f / 8) * 0.05} />
    <rect x={-80} y={-24} width={160} height={24} rx={4} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-62} y={-240} width={124} height={220} rx={40} fill={C.towel} stroke={KRP.ink} strokeWidth={4.5} />
    {Array.from({ length: 22 }, (_, i) => (
      <circle key={i} cx={-62 + (i % 2) * 124} cy={-226 + Math.floor(i / 2) * 19} r={6} fill={C.towel} stroke={KRP.ink} strokeWidth={2.5} />
    ))}
    {Array.from({ length: 18 }, (_, i) => (
      <path key={i} d={`M ${-40 + (i % 6) * 16} ${-210 + Math.floor(i / 6) * 60} q 5 -6 10 0`} fill="none" stroke={C.towelDark} strokeWidth={3} />
    ))}
    <circle cx={0} cy={-292} r={50} fill={C.towel} stroke={KRP.ink} strokeWidth={4.5} />
    <circle cx={-17} cy={-298} r={9} fill={KRP.ink} />
    <circle cx={17} cy={-298} r={9} fill={KRP.ink} />
    <path d="M -10 -272 Q 0 -264 10 -272" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M -36 -332 l -8 -18 M 36 -332 l 8 -18" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
  </g>
);

/* 子ザル (小さな窓用)。中心原点。大きな丸目・ピンクの顔 */
const L3bMiniMonkey: React.FC<{ s?: number; f: number }> = ({ s = 1, f }) => (
  <g transform={`scale(${s}) rotate(${Math.sin(f / 12) * 3})`}>
    <ellipse cx={0} cy={30} rx={34} ry={30} fill={C.monkey} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={-34} cy={-10} r={11} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={34} cy={-10} r={11} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3.5} />
    <circle cx={0} cy={-8} r={34} fill={C.monkey} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={0} cy={-2} rx={24} ry={22} fill={C.monkeyFace} />
    <circle cx={-10} cy={-8} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
    <circle cx={10} cy={-8} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
    <circle cx={-9} cy={-7} r={4.5} fill={KRP.ink} />
    <circle cx={11} cy={-7} r={4.5} fill={KRP.ink} />
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#121 【並】 ほかにも、竹奴、青奴といった、人のような呼び名がついています。
// 設計: 竹夫人のまわりに、名前の木札「竹奴」「青奴」がぶら下がって揺れる
// どこ: 宋代の町の竹細工屋の店先。竹すだれの壁・軒の竹竿・竹ひごの束と籠
// 演出: 台に寝かせた大きな竹夫人の上の竿に、名前の木札が「竹夫人」→「竹奴」→「青奴」と順に落ちてきて揺れる。店主が札を指して笑う
// 動き: カメラが少し引く。札が上から落ちて、ひもでぶらんぶらん。落ちるたびに竹夫人がぴょこっと弾む
const Yw121: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.08 - 0.08 * easeOut(seg(f, 0, 40));
  const tags = [
    { x: 960, len: 40, text: "竹夫人", st: 2, ph: 0 },
    { x: 560, len: 120, text: "竹奴", st: 12, ph: 1.3 },
    { x: 1360, len: 120, text: "青奴", st: 22, ph: 2.6 },
  ];
  const bump = tags.reduce((a, tg) => a + Math.sin(clamp01(seg(f, tg.st + 8, tg.st + 16)) * Math.PI) * 10, 0);
  return (
    <Frame f={f} seed={3121} bg={C.bambooLight}>
      <g transform={camT(960, 500, cam)}>
        {/* 竹すだれの壁 */}
        <rect x={-40} y={-40} width={W + 80} height={880} fill={C.bambooLight} />
        {Array.from({ length: 42 }, (_, i) => (
          <line key={i} x1={i * 48} y1={-40} x2={i * 48} y2={840} stroke={C.bambooDark} strokeWidth={3} opacity={0.55} />
        ))}
        {[300, 620].map((yy) => (
          <rect key={yy} x={-40} y={yy} width={W + 80} height={16} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 土間 */}
        <rect x={-40} y={800} width={W + 80} height={320} fill={C.earth} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={i} cx={rnd(3121, i) * W} cy={830 + rnd(3122, i) * 200} rx={10 + rnd(3123, i) * 14} ry={4} fill={C.earthDark} opacity={0.6} />
        ))}
        {/* 左: 竹ひごの束と籠 (竹細工屋のしるし) */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={60 + i * 10} y1={810} x2={110 + i * 14} y2={260} stroke={i % 2 ? C.bambooDark : C.bamboo} strokeWidth={9} strokeLinecap="round" />
        ))}
        <path d="M 70 560 L 240 560" stroke={C.lantern} strokeWidth={8} />
        {[[200, 800, 150, 110], [215, 690, 120, 90]].map(([bx, by, bw, bh], i) => (
          <g key={i}>
            <path d={`M ${bx - bw / 2} ${by - bh} L ${bx + bw / 2} ${by - bh} L ${bx + bw / 2 - 14} ${by} L ${bx - bw / 2 + 14} ${by} Z`}
              fill={C.bamboo} stroke={KRP.ink} strokeWidth={4.5} />
            {Array.from({ length: 4 }, (_, j) => (
              <line key={j} x1={bx - bw / 2 + 6} y1={by - bh + 22 + j * (bh / 4.5)} x2={bx + bw / 2 - 6} y2={by - bh + 22 + j * (bh / 4.5)} stroke={C.bambooDark} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 軒の竹竿 */}
        <line x1={240} y1={-40} x2={260} y2={112} stroke={KRP.ink} strokeWidth={4} />
        <line x1={1680} y1={-40} x2={1660} y2={112} stroke={KRP.ink} strokeWidth={4} />
        <rect x={200} y={98} width={1520} height={28} rx={14} fill={C.stalk} stroke={KRP.ink} strokeWidth={5} />
        {[420, 760, 1120, 1480].map((nx) => <line key={nx} x1={nx} y1={98} x2={nx} y2={126} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={210} y={104} width={1500} height={6} fill={KRP.white} opacity={0.3} />
        {/* 竹夫人の台 (2つの受け台) */}
        {[520, 1240].map((sx) => (
          <g key={sx}>
            <path d={`M ${sx - 70} 810 L ${sx} 680 L ${sx + 70} 810`} fill="none" stroke={C.bedWoodDark} strokeWidth={20} strokeLinecap="round" />
            <path d={`M ${sx - 70} 810 L ${sx} 680 L ${sx + 70} 810`} fill="none" stroke={C.bedWood} strokeWidth={12} strokeLinecap="round" />
            <path d={`M ${sx - 60} 664 Q ${sx} 712 ${sx + 60} 664`} fill="none" stroke={C.bedWoodDark} strokeWidth={14} strokeLinecap="round" />
          </g>
        ))}
        {/* 主役: 竹夫人 */}
        <L3bTube id="yw121tube" x={880} y={570 - bump} L={1100} R={110} spin={0.25} sw={1.25} />
        {/* 札が着くたびのきらり */}
        {tags.map((tg, i) => {
          const k = seg(f, tg.st + 8, tg.st + 18);
          if (k <= 0 || k >= 1) return null;
          return (
            <g key={i} opacity={1 - k} stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
              {[0, 1, 2, 3, 4].map((j) => {
                const a = -Math.PI * (0.15 + j * 0.175);
                return <line key={j} x1={tg.x + Math.cos(a) * (60 + k * 40)} y1={450 + Math.sin(a) * (30 + k * 30)}
                  x2={tg.x + Math.cos(a) * (90 + k * 60)} y2={450 + Math.sin(a) * (50 + k * 40)} />;
              })}
            </g>
          );
        })}
        {/* 名前の木札 (竿からぶら下がる) */}
        {tags.map((tg, i) => {
          const amp = 3 + 11 * (1 - seg(f, tg.st + 6, tg.st + 40));
          return (
            <L3bHangTag key={i} x={tg.x} y={112} len={tg.len} text={tg.text} t={seg(f, tg.st, tg.st + 10)}
              swing={Math.sin(f / 7 + tg.ph) * amp} fill={i === 0 ? KRP.white : C.tagWood} />
          );
        })}
        {/* 店主 (宋の服・幞頭) が札を指して笑う */}
        <Person x={1700} y={860} s={1.3} f={f} phase={1} face={f > 24 ? "joy" : "smile"} pose="point" pointDir={-1}
          cloth={C.songCloth} clothDark={C.songClothDark} gaze={[-3, -4]} />
        <L3bOn x={1700} y={860} s={1.3} f={f} phase={1}>
          <L3bRobe cloth={C.songCloth} dark={C.songClothDark} /><L3bFutou wing={0.8} />
        </L3bOn>
      </g>
    </Frame>
  );
};

// ---- 文#122 【山】 竹夫人は日本にも伝わり、夏の季語になりました。与謝蕪村も、俳句によんでいます。
// 設計: 江戸時代の日本の縁側 (風鈴・すだれ・朝顔・蚊取りの煙)。坊主頭の俳人 (蕪村) が短冊に筆で書く。横に竹夫人。札「夏の季語」「与謝蕪村」
// どこ: 江戸時代の夏の縁側。奥に障子と畳の部屋、軒にすだれと風鈴、左に朝顔の鉢、右に蚊遣り豚
// 演出: 坊主頭の蕪村が文机で短冊に筆を走らせる。手前の縁側に竹夫人が寝かせてある
// 動き: カメラがゆっくり蕪村へ寄る。f14〜 夏の風が吹いて風鈴が鳴り、すだれが揺れる。筆の跡が短冊に1画ずつ増える。蚊遣りの煙がたなびく。朝顔が開く
const Yw122: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.0 + 0.07 * easeInOut(seg(f, 0, 42));
  const gust = seg(f, 12, 26) * (0.85 + 0.15 * Math.sin(f / 7));
  const ring = Math.sin(f / 2.2) * 16 * gust + Math.sin(f / 9) * 3;
  const write = seg(f, 6, 40);
  const strokes = 7;
  const bloom = easeOut(seg(f, 2, 20));
  const sx = 860, sy = 730, ss = 1.35;
  return (
    <Frame f={f} seed={3122} bg={C.shoji}>
      <g transform={camT(880, 520, cam)}>
        {/* 奥の部屋: 畳と障子 */}
        <rect x={-40} y={-40} width={W + 80} height={700} fill={C.shoji} />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <rect x={-20 + i * 220} y={70} width={220} height={520} fill={C.shoji} stroke={C.shojiFrame} strokeWidth={8} />
            {[1, 2, 3].map((c) => <line key={c} x1={-20 + i * 220 + c * 55} y1={70} x2={-20 + i * 220 + c * 55} y2={590} stroke={C.shojiFrame} strokeWidth={3} />)}
            {Array.from({ length: 7 }, (_, r) => <line key={r} x1={-20 + i * 220} y1={70 + (r + 1) * 65} x2={200 + i * 220} y2={70 + (r + 1) * 65} stroke={C.shojiFrame} strokeWidth={3} />)}
          </g>
        ))}
        {/* 障子に落ちる庭の木の影 */}
        <g opacity={0.12} fill={C.stalkDark}>
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse key={i} cx={1300 + rnd(3122, i) * 500 + Math.sin(f / 15 + i) * 8} cy={160 + rnd(3123, i) * 300} rx={60} ry={26} transform={`rotate(${rnd(3124, i) * 60 - 30} ${1300 + rnd(3122, i) * 500} ${160 + rnd(3123, i) * 300})`} />
          ))}
        </g>
        <rect x={-40} y={590} width={W + 80} height={40} fill={C.tatami} stroke={KRP.ink} strokeWidth={4} />
        {/* 軒の梁 */}
        <rect x={-40} y={-40} width={W + 80} height={100} fill={C.boardDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={40} width={W + 80} height={20} fill={C.board} stroke={KRP.ink} strokeWidth={4} />
        {/* すだれ (左右に半分巻き上げ。風で揺れる) */}
        {[[-20, 560], [1340, 600]].map(([sx0, sw0], k) => (
          <g key={k} transform={`translate(${sx0} 60) skewX(${Math.sin(f / 5 + k) * 4 * gust})`}>
            <rect x={0} y={0} width={sw0} height={220} fill={C.bamboo} opacity={0.88} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 22 }, (_, i) => <line key={i} x1={0} y1={8 + i * 10} x2={sw0} y2={8 + i * 10} stroke={C.bambooDark} strokeWidth={2.5} />)}
            {[0.2, 0.8].map((p) => <line key={p} x1={sw0 * p} y1={0} x2={sw0 * p} y2={220} stroke={C.lantern} strokeWidth={4} />)}
            <rect x={-6} y={210} width={sw0 + 12} height={24} rx={12} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 縁側の板 */}
        <path d="M -40 630 L 1960 630 L 1960 1120 L -40 1120 Z" fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-40} y1={660 + i * 34 + i * i * 2} x2={1960} y2={660 + i * 34 + i * i * 2} stroke={C.boardDark} strokeWidth={4} />
        ))}
        {/* 風鈴 */}
        <g transform={`translate(1560 60) rotate(${ring * 0.5})`}>
          <line x1={0} y1={0} x2={0} y2={60} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -40 120 Q -40 60 0 58 Q 40 60 40 120 Z" fill={C.glass} stroke={KRP.ink} strokeWidth={4.5} opacity={0.95} />
          <path d="M -30 104 q 15 -12 30 0 q 15 12 30 0" fill="none" stroke={KRP.red} strokeWidth={4} />
          <circle cx={-14} cy={80} r={6} fill={KRP.white} opacity={0.8} />
          <g transform={`rotate(${ring})`}>
            <line x1={0} y1={64} x2={0} y2={150} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-18} y={150} width={36} height={110} rx={3} fill={C.tanzaku} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
        {gust > 0.2 && [1, 2, 3].map((k) => (
          <path key={k} d={`M ${1620 + k * 22} ${120 - k * 14} q 18 24 0 48`} fill="none" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round"
            opacity={(0.3 + 0.7 * Math.abs(Math.sin(f / 3 + k))) * gust} />
        ))}
        {/* 夏の風の線 */}
        <g fill="none" stroke={C.wind} strokeWidth={6} strokeLinecap="round" strokeDasharray="160 90" opacity={0.75 * gust}>
          {[290, 360, 420].map((yy, i) => (
            <path key={i} d={`M -40 ${yy} q 400 -40 800 0 q 400 40 1200 -20`} strokeDashoffset={-f * 18 - i * 70} />
          ))}
        </g>
        {/* 朝顔の鉢 (左) */}
        <g>
          {[100, 180, 260].map((px) => <line key={px} x1={px} y1={790} x2={px - 10 + (px - 180) * 0.2} y2={260} stroke={C.bambooDark} strokeWidth={8} />)}
          {[380, 540, 680].map((py) => <line key={py} x1={80} y1={py} x2={290} y2={py} stroke={C.bambooDark} strokeWidth={6} />)}
          <path d={`M 180 790 C 60 700 300 620 160 540 C 40 470 290 420 170 330 C 100 280 220 250 200 230`} fill="none" stroke={C.stalkDark} strokeWidth={6} />
          {[[120, 650], [250, 590], [110, 470], [240, 390], [150, 300]].map(([lx, ly], i) => (
            <path key={i} d="M 0 0 Q 26 -30 48 0 Q 26 30 0 0 Z" fill={C.stalkLeaf} stroke={KRP.ink} strokeWidth={3} transform={`translate(${lx} ${ly}) rotate(${i * 50})`} />
          ))}
          {[[210, 640], [90, 540], [260, 450], [130, 380], [215, 285]].map(([fx2, fy2], i) => {
            const b = clamp01(bloom * 1.6 - i * 0.12);
            return (
              <g key={i} transform={`translate(${fx2} ${fy2}) scale(${0.3 + 0.7 * b})`}>
                <circle r={34} fill={i % 2 ? C.asagao : C.asagaoDeep} stroke={KRP.ink} strokeWidth={4} />
                {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={0} y1={0} x2={0} y2={-30} stroke={KRP.white} strokeWidth={3} opacity={0.6} transform={`rotate(${a})`} />)}
                <circle r={9} fill={KRP.white} />
              </g>
            );
          })}
          <path d="M 100 760 L 270 760 L 250 840 L 120 840 Z" fill={C.onggi} stroke={KRP.ink} strokeWidth={5} />
          <rect x={92} y={750} width={186} height={20} rx={6} fill={C.onggiDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 蕪村 (茶の着物・坊主頭) */}
        <Person x={sx} y={sy} s={ss} f={f} phase={2} face="smile" pose="hold" hair="none"
          cloth={C.kimono} clothDark={C.kimonoDark} gaze={[3, 6]} lean={Math.sin(f / 6) * 1.2} />
        <L3bOn x={sx} y={sy} s={ss} f={f} phase={2} lean={Math.sin(f / 6) * 1.2}>
          <path d="M -26 -160 L 0 -122 L 26 -160" fill="none" stroke={KRP.cream} strokeWidth={6} />
        </L3bOn>
        {/* 文机 (下半身を隠す) */}
        <path d="M 600 590 L 1130 590 L 1160 656 L 570 656 Z" fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={570} y={656} width={590} height={112} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={590} y={670} width={550} height={10} fill={C.bedWood} opacity={0.6} />
        {/* 短冊 (机の上。金の砂子) と筆跡 */}
        <path d="M 700 610 L 1020 610 L 1030 636 L 690 636 Z" fill={C.tanzaku} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={720 + i * 55} cy={618 + (i % 2) * 10} r={3} fill={C.gold} />)}
        {Array.from({ length: strokes }, (_, i) => {
          const k = clamp01(write * strokes - i);
          if (k <= 0) return null;
          const bx = 990 - i * 40;
          return <path key={i} d={`M ${bx} 616 q ${-8 * k} ${8 * k} ${-14 * k} ${14 * k}`} fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />;
        })}
        {/* 筆 (右手) */}
        {(() => {
          const hx = sx + 14 * ss + Math.sin(f / 2.5) * 4 * (write < 1 ? 1 : 0);
          const hy = sy - 118 * ss;
          return (
            <g transform={`rotate(${12 + Math.sin(f / 2.5) * 5} ${hx} ${hy})`}>
              <rect x={hx - 5} y={hy - 70} width={10} height={120} rx={4} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={3} />
              <path d={`M ${hx - 6} ${hy + 50} L ${hx} ${hy + 68} L ${hx + 6} ${hy + 50} Z`} fill={KRP.ink} />
            </g>
          );
        })()}
        {/* 硯と墨 */}
        <rect x={1050} y={602} width={70} height={34} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={1072} cy={614} rx={14} ry={6} fill={KRP.ink} />
        <rect x={620} y={614} width={50} height={14} rx={4} fill={KRP.ink} />
        {/* 手前の竹夫人 */}
        <L3bTube id="yw122tube" x={1390} y={760} L={520} R={52} rot={-4} spin={0.2} sw={0.85} />
        {/* 蚊遣り豚と煙 */}
        <g transform="translate(1760 780)">
          <ellipse cx={0} cy={0} rx={78} ry={56} fill={C.pig} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={-70} cy={-4} rx={18} ry={30} fill={C.pigDark} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={-70} cy={-4} rx={9} ry={18} fill={KRP.ink} opacity={0.6} />
          <path d="M -40 -46 l -6 -20 l 20 10 Z M 20 -52 l 4 -20 l 16 16 Z" fill={C.pig} stroke={KRP.ink} strokeWidth={4} />
          {[-40, 40].map((lx) => <rect key={lx} x={lx - 10} y={44} width={20} height={16} fill={C.pigDark} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        <path d={`M 1690 770 C ${1650 + Math.sin(f / 9) * 20} 700 ${1720 + Math.sin(f / 7) * 30} 640 ${1660 + Math.sin(f / 8) * 30 - gust * 60} 560 S ${1700 - gust * 120} 440 ${1640 - gust * 160} 380`}
          fill="none" stroke={C.smoke} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
        {/* 札 */}
        <TagPlate x={1390} y={650} text="夏の季語" size={40} t={seg(f, 14, 24)} />
        <TagPlate x={860} y={262} text="与謝蕪村" size={42} t={seg(f, 6, 16)} />
        <TagPlate x={300} y={205} text="江戸時代の日本" size={34} t={seg(f, 2, 12)} />
      </g>
    </Frame>
  );
};

// ---- 文#123 【並】 韓国には、ちょっと変わった言い伝えがあります。
// 設計: 韓国の伝統家屋 (瓦屋根の韓屋・オンドルの床・障子)。縁側に竹夫人。札「韓国」。国旗は現代のものなので置かない
// どこ: 韓国の伝統家屋 (韓屋)。反りの強い瓦屋根・格子に韓紙の戸・板張りの大庁マル・石の基壇・白いゴムシン・甕置き場・松
// 演出: マルの真ん中に竹夫人がぽつんと置いてある。屋根にカササギが舞い降りる (「何か話が始まる」気配)
// 動き: カメラがゆっくり竹夫人へ寄る。カササギが右上から飛んできて屋根の棟にとまる。松と戸の韓紙がかすかに揺れる
const Yw123: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.0 + 0.13 * easeInOut(seg(f, 0, 42));
  const fl = easeOut(seg(f, 8, 30));
  const bx = lerp(2000, 1240, fl);
  const by = lerp(30, 118, fl) - Math.sin(fl * Math.PI) * 60;
  const flap = fl < 1 ? Math.sin(f / 1.6) * 30 : 0;
  const eave = (t: number) => ({ x: 140 + 1640 * t, y: 290 + 200 * t * (1 - t) });
  return (
    <Frame f={f} seed={3123} bg={C.sky}>
      <g transform={camT(960, 560, cam)}>
        <rect x={-40} y={-40} width={W + 80} height={760} fill={C.sky} />
        {/* 遠くの山 */}
        <path d="M -40 420 Q 200 250 460 360 Q 700 220 980 340 Q 1300 200 1560 330 Q 1760 260 1960 340 L 1960 720 L -40 720 Z" fill={C.hill} stroke={KRP.ink} strokeWidth={4} />
        {/* 夏の雲 */}
        <g fill={KRP.white} stroke={KRP.ink} strokeWidth={4}>
          <path d={`M ${560 + f * 0.6} 120 q 20 -50 70 -30 q 30 -40 80 -10 q 50 0 40 40 Z`} />
        </g>
        {/* 庭の土 */}
        <rect x={-40} y={690} width={W + 80} height={430} fill={C.earth} stroke={KRP.ink} strokeWidth={5} />
        {/* 石の基壇 */}
        <rect x={260} y={612} width={1400} height={92} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={260 + i * 140 + (i % 2) * 40} y1={612} x2={260 + i * 140 + (i % 2) * 40} y2={704} stroke={C.stoneDark} strokeWidth={4} />
        ))}
        <line x1={260} y1={658} x2={1660} y2={658} stroke={C.stoneDark} strokeWidth={4} />
        {/* 壁と戸 */}
        <rect x={320} y={300} width={1280} height={290} fill={C.hanji} stroke={KRP.ink} strokeWidth={5} />
        {[[340, 600], [1320, 1580]].map(([x0, x1], k) => (
          <g key={k}>
            {[0, 1].map((d) => {
              const dx = x0 + d * ((x1 - x0) / 2);
              const dw = (x1 - x0) / 2 - 10;
              return (
                <g key={d}>
                  <rect x={dx} y={330} width={dw} height={250} fill={C.hanji} stroke={C.hanokWood} strokeWidth={8} />
                  {Array.from({ length: 5 }, (_, i) => <line key={i} x1={dx + (i + 1) * dw / 6} y1={330} x2={dx + (i + 1) * dw / 6} y2={580} stroke={C.hanokWood} strokeWidth={3} />)}
                  {Array.from({ length: 7 }, (_, i) => <line key={i} x1={dx} y1={330 + (i + 1) * 31} x2={dx + dw} y2={330 + (i + 1) * 31} stroke={C.hanokWood} strokeWidth={3} />)}
                  <circle cx={d ? dx + 12 : dx + dw - 12} cy={460} r={6} fill={YP.brass} stroke={KRP.ink} strokeWidth={2} />
                </g>
              );
            })}
          </g>
        ))}
        {/* 中央の大庁 (奥が暗い板の間) */}
        <rect x={640} y={300} width={640} height={250} fill={C.boardDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={640} y1={330 + i * 40} x2={1280} y2={330 + i * 40} stroke={KRP.ink} strokeWidth={2} opacity={0.3} />)}
        <rect x={640} y={300} width={640} height={250} fill={KRP.ink} opacity={0.25} />
        {/* 柱 */}
        {[320, 620, 1280, 1580].map((px) => (
          <rect key={px} x={px - 16} y={290} width={32} height={330} fill={C.hanokWood} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {/* マル (板張りの縁) */}
        <path d="M 600 548 L 1320 548 L 1350 606 L 570 606 Z" fill={C.board} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={610 + i * 60} y1={550} x2={590 + i * 63} y2={604} stroke={C.boardDark} strokeWidth={3} />)}
        <rect x={570} y={606} width={780} height={24} fill={C.boardDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 竹夫人 */}
        <L3bTube id="yw123tube" x={960} y={562} L={560} R={46} spin={0.4} sw={0.8} />
        {/* 踏み石と白いゴムシン */}
        <rect x={860} y={690} width={200} height={34} rx={10} fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} />
        {[915, 1005].map((gx) => (
          <path key={gx} d={`M ${gx - 32} 690 Q ${gx - 36} 670 ${gx - 10} 668 L ${gx + 26} 668 Q ${gx + 44} 672 ${gx + 36} 690 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 瓦屋根 (軒の真ん中が下がり、両端が反り上がる) */}
        <path d="M 120 260 Q 960 400 1800 260 L 1810 236 Q 1650 230 1560 150 L 360 150 Q 270 230 110 236 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({ length: 36 }, (_, i) => {
          const t = (i + 0.5) / 36;
          const e = eave(t);
          return <line key={i} x1={e.x} y1={e.y - 18} x2={360 + 1200 * t} y2={156} stroke={C.tileDark} strokeWidth={5} />;
        })}
        {Array.from({ length: 30 }, (_, i) => {
          const t = (i + 0.5) / 30;
          const e = eave(t);
          return <circle key={i} cx={e.x} cy={e.y + 4} r={8} fill={C.hanokWood} stroke={KRP.ink} strokeWidth={3} />;
        })}
        <path d="M 330 154 L 1590 154 L 1560 122 L 360 122 Z" fill={C.tileDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 330 154 q -30 -20 -24 -52 M 1590 154 q 30 -20 24 -52" fill="none" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        {/* カササギ */}
        <g transform={`translate(${bx} ${by})`}>
          <path d="M 30 0 L 110 -18 L 108 -4 Z" fill={KRP.ink} />
          <ellipse cx={0} cy={0} rx={40} ry={22} fill={KRP.ink} />
          <ellipse cx={-6} cy={6} rx={24} ry={12} fill={KRP.white} />
          <circle cx={-36} cy={-14} r={16} fill={KRP.ink} />
          <path d="M -50 -16 l -16 4 l 16 4 Z" fill={KRP.grayDark} />
          <circle cx={-40} cy={-18} r={3} fill={KRP.white} />
          <path d={`M -4 -10 L 30 ${-50 + flap} L 46 ${-8 + flap * 0.3} Z`} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
          <path d="M 4 -6 L 30 -4" stroke={KRP.white} strokeWidth={5} />
          {fl >= 1 && <path d="M -10 20 l -4 14 M 6 20 l 4 14" stroke={KRP.ink} strokeWidth={4} />}
        </g>
        {/* 松 (左) */}
        <g transform={`rotate(${Math.sin(f / 22) * 0.8} 120 860)`}>
          <path d="M 110 860 Q 140 640 90 480 Q 70 360 150 240" fill="none" stroke={C.bark} strokeWidth={34} strokeLinecap="round" />
          {[[160, 250, 120], [70, 380, 110], [190, 470, 100], [80, 600, 90]].map(([px, py, pw], i) => (
            <g key={i}>
              <ellipse cx={px} cy={py} rx={pw} ry={pw * 0.42} fill={C.pineDark} stroke={KRP.ink} strokeWidth={4.5} />
              <ellipse cx={px - 10} cy={py - 10} rx={pw * 0.8} ry={pw * 0.28} fill={C.pine} />
            </g>
          ))}
        </g>
        {/* 甕置き場 (右) */}
        <rect x={1540} y={790} width={360} height={40} rx={8} fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} />
        {[[1600, 0.9], [1700, 1.15], [1810, 0.8]].map(([ox, os], i) => (
          <g key={i} transform={`translate(${ox} 790) scale(${os})`}>
            <path d="M -50 0 Q -78 -70 -40 -120 L 40 -120 Q 78 -70 50 0 Z" fill={C.onggi} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-46} y={-136} width={92} height={18} rx={8} fill={C.onggiDark} stroke={KRP.ink} strokeWidth={4} />
            <path d="M -40 -90 Q -48 -50 -30 -14" fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.3} />
          </g>
        ))}
        <TagPlate x={1700} y={480} text="韓国" size={56} t={seg(f, 2, 12)} />
      </g>
    </Frame>
  );
};

// ---- 文#124 【山】 父親が使っていた竹夫人は、息子にゆずらず、燃やしてしまう、というのです。
// 設計: 庭のたき火で竹夫人が燃やされる (炎は明るく、悲しくしない)。笠をかぶった白い韓服の父と、それを見る息子。息子は「えっ、もらえないの?」の顔 (surprised)。くすっと笑える
// どこ: 夕方の韓屋の庭。瓦をのせた石垣 (トルダム)・屋根の端・青い木。庭の真ん中に石で囲んだたき火
// 演出: 笠をかぶった白い韓服の父が、落ち着いた笑顔で火かき棒を持ち、竹夫人をたき火にくべている。
//       右の息子は「えっ、もらえないの?」。両腕を「もらう形」に出したまま固まり、腕の中には点線の竹夫人 (もらうはずだった物) だけ
// 動き: 炎が f4〜22 で大きくなり、火の粉が上がる。竹夫人に焦げ跡が広がる。f16〜 息子の「！」がぽんと出て汗がたれる。カメラが父から息子へ少しパン
const Yw124: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  const grow = 0.45 + 0.55 * easeOut(seg(f, 4, 22));
  const burn = seg(f, 10, 40);
  const shock = pop(seg(f, 16, 26));
  const fs = 1.55, ss = 1.3;
  return (
    <Frame f={f} seed={3124} bg={C.dusk}>
      <g transform={`translate(${pan} 0) ${camT(960, 540, 1.04)}`}>
        {/* 夕焼けの空 */}
        <rect x={-80} y={-40} width={W + 160} height={500} fill={C.dusk} />
        <rect x={-80} y={240} width={W + 160} height={220} fill={C.dusk2} opacity={0.55} />
        <circle cx={1500} cy={300} r={70} fill={C.flameCore} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        <path d="M -80 400 Q 300 300 600 380 Q 900 290 1240 370 Q 1600 300 2000 380 L 2000 520 L -80 520 Z" fill={C.hill} opacity={0.7} stroke={KRP.ink} strokeWidth={4} />
        {/* 左上: 母屋の屋根の端 */}
        <path d="M -80 250 Q 200 300 470 230 L 480 210 Q 420 210 380 150 L -80 150 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-60 + i * 36} y1={270 - i * 2} x2={-60 + i * 33} y2={156} stroke={C.tileDark} strokeWidth={4} />)}
        <rect x={-80} y={250} width={420} height={200} fill={C.hanji} stroke={KRP.ink} strokeWidth={4} />
        <rect x={60} y={280} width={140} height={150} fill={C.hanji} stroke={C.hanokWood} strokeWidth={6} />
        {/* 右: 木 */}
        <path d="M 1700 640 Q 1690 500 1720 360" fill="none" stroke={C.bark} strokeWidth={30} strokeLinecap="round" />
        {[[1720, 300, 140], [1610, 360, 100], [1830, 380, 110]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx + Math.sin(f / 20 + i) * 4} cy={cy} r={r} fill={i === 0 ? C.stalk : C.stalkDark} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {/* 石垣 (トルダム) と瓦の笠 */}
        <rect x={-80} y={440} width={W + 160} height={210} fill={C.stone} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 40 }, (_, i) => (
          <ellipse key={i} cx={-60 + (i % 20) * 106 + (Math.floor(i / 20) % 2) * 50} cy={490 + Math.floor(i / 20) * 90 + rnd(3124, i) * 20}
            rx={44 + rnd(3125, i) * 10} ry={30} fill={i % 3 ? C.stone : C.stoneDark} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        <path d="M -80 444 L 2000 444 L 1990 412 L -70 412 Z" fill={C.tile} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 50 }, (_, i) => <line key={i} x1={-70 + i * 42} y1={414} x2={-70 + i * 42} y2={442} stroke={C.tileDark} strokeWidth={4} />)}
        {/* 庭の土 */}
        <rect x={-80} y={640} width={W + 160} height={480} fill={C.earth} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={960} cy={790} rx={520} ry={70} fill={C.flameCore} opacity={0.22 * grow} />
        {/* たき火: 石の輪・薪 */}
        <ellipse cx={960} cy={780} rx={220} ry={44} fill={C.earthDark} stroke={KRP.ink} strokeWidth={4} />
        {[-60, 60].map((r) => (
          <rect key={r} x={800} y={752} width={320} height={34} rx={16} fill={C.log} stroke={KRP.ink} strokeWidth={4.5} transform={`rotate(${r * 0.12} 960 769)`} />
        ))}
        {/* 奥の炎 */}
        {[[860, 150, 60, 0], [980, 210, 70, 1.7], [1080, 160, 56, 3.1]].map(([x, h, w, ph], i) => (
          <L3bFlame key={i} x={x} y={770} h={h * grow} w={w} f={f} ph={ph} />
        ))}
        {/* 燃える竹夫人 */}
        <L3bTube id="yw124tube" x={960} y={712} L={400} R={42} rot={-6} spin={0.3} sw={0.8} />
        <g opacity={0.55 * burn} fill={KRP.ink}>
          <ellipse cx={900} cy={724} rx={70 * burn + 10} ry={26} />
          <ellipse cx={1040} cy={708} rx={50 * burn + 8} ry={22} />
        </g>
        {/* 手前の炎 */}
        {[[820, 110, 48, 0.6], [930, 170, 60, 2.2], [1050, 140, 52, 4.0], [1130, 90, 40, 5.1]].map(([x, h, w, ph], i) => (
          <L3bFlame key={i} x={x} y={782} h={h * grow} w={w} f={f} ph={ph} />
        ))}
        {/* 石 (手前) */}
        {Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={770 + i * 64} cy={800 + Math.sin(i) * 6} rx={34} ry={20} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 火の粉と煙 (明るく) */}
        {Array.from({ length: 14 }, (_, i) => {
          const life = ((f * 5 + i * 47) % 320) / 320;
          return <circle key={i} cx={900 + rnd(3126, i) * 160 + Math.sin(f / 6 + i) * 20} cy={700 - life * 320} r={5 * (1 - life) + 2} fill={C.flameCore} opacity={(1 - life) * grow} />;
        })}
        <path d={`M 980 560 C ${940 + Math.sin(f / 9) * 20} 480 ${1020 + Math.sin(f / 7) * 20} 400 ${980 + Math.sin(f / 8) * 30} 300`} fill="none" stroke={C.smoke} strokeWidth={22} strokeLinecap="round" opacity={0.45} />
        {/* 父: 白い韓服・笠。落ち着いた笑顔で火かき棒 */}
        <line x1={540 + 67 * fs} y1={830 - 66 * fs} x2={820} y2={736} stroke={C.log} strokeWidth={12} strokeLinecap="round" />
        <line x1={540 + 67 * fs} y1={830 - 66 * fs} x2={820} y2={736} stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
        <Person x={540} y={830} s={fs} f={f} phase={0} face="smile" cloth={C.hanbok} clothDark={C.hanbokDark} gaze={[5, 4]} />
        <L3bOn x={540} y={830} s={fs} f={f} phase={0}>
          <L3bRobe cloth={C.hanbok} dark={C.hanbokDark} collar={C.hanbokDark} />
          <L3bGoreum />
          <L3bGat />
        </L3bOn>
        {/* 息子: もらう形の腕 (腕の中は点線の竹夫人だけ) */}
        <Person x={1390} y={830} s={ss} f={f} phase={2} face="surprised" pose="hold" cloth={C.hanbok} clothDark={C.hanbokDark}
          gaze={[-5, 3]} lean={-5 * shock} />
        <L3bOn x={1390} y={830} s={ss} f={f} phase={2} lean={-5 * shock}>
          <L3bGoreum col={C.wind} />
          <rect x={-120} y={-150} width={240} height={60} rx={30} fill="none" stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="14 10" opacity={0.8} />
          <path d="M 52 -268 q 8 16 0 26 q -10 -8 0 -26 Z" fill={C.wind} stroke={KRP.ink} strokeWidth={3}
            transform={`translate(0 ${seg(f, 22, 42) * 30})`} opacity={shock} />
        </L3bOn>
        <g transform={`translate(1530 430) scale(${shock}) rotate(10)`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} paintOrder="stroke">！</text>
        </g>
        {/* 札 */}
        <TagPlate x={960} y={420} text="父の竹夫人" size={36} t={seg(f, 8, 18)} />
        <TagPlate x={540} y={250} text="父" size={38} t={seg(f, 3, 12)} />
        <TagPlate x={1390} y={398} text="息子" size={34} t={seg(f, 6, 15)} />
      </g>
    </Frame>
  );
};

// ---- 文#125 【並】 もちろん、竹夫人のいちばんの役目は、涼むことです。
// 設計: 夏の夜。竹夫人を抱えた人のまわりを涼しい風の線が流れ、汗がひく。団扇。札「涼む」 (★主目的をはっきり)
// どこ: 宋の夏の夜の中庭。瓦の塀・満月・芭蕉の大きな葉。竹の涼み台の上
// 演出: 陶枕に頭をのせて寝そべった人が、竹夫人を抱え、団扇を持つ。竹の網目を涼しい青い風が吹き抜ける
// 動き: 風の線が左から流れて竹夫人の網目をすり抜ける。f6〜26 汗の粒と熱のゆらぎが消えていき、顔が「暑い」→「にっこり」。団扇がぱたぱた。カメラがゆっくり寄る
const Yw125: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.0 + 0.06 * easeInOut(seg(f, 0, 42));
  const cool = seg(f, 6, 26);
  const fx = 1300, fy = 545, s = 1.8;
  const hx = fx - 118 * s, hy = fy - 14 * s;
  return (
    <Frame f={f} seed={3125} bg={C.night} dark>
      <g transform={camT(1000, 520, cam)}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.night} />
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={rnd(3125, i) * W} cy={rnd(3126, i) * 300} r={2 + rnd(3127, i) * 2.5} fill={C.moon} opacity={0.4 + 0.4 * Math.abs(Math.sin(f / 9 + i))} />
        ))}
        <circle cx={1650} cy={170} r={140} fill={C.moon} opacity={0.12} />
        <circle cx={1650} cy={170} r={86} fill={C.moon} stroke={KRP.ink} strokeWidth={5} />
        {/* 瓦の塀 */}
        <rect x={-40} y={400} width={W + 80} height={300} fill={C.wallSong} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={400} width={W + 80} height={300} fill={C.nightDeep} opacity={0.45} />
        <L3bRoof x={-60} y={420} w={2040} h={70} />
        <rect x={-40} y={350} width={W + 80} height={80} fill={C.nightDeep} opacity={0.3} />
        {/* 石畳 */}
        <rect x={-40} y={700} width={W + 80} height={420} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180} y1={700} x2={i * 180 - 80} y2={1100} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />)}
        <rect x={-40} y={700} width={W + 80} height={420} fill={C.nightDeep} opacity={0.35} />
        {/* 芭蕉 (左) */}
        {[[-10, -40], [40, -10], [10, 25]].map(([ox, a], i) => (
          <path key={i} d="M 0 0 Q 60 -220 20 -420 Q -60 -230 0 0 Z" fill={i === 1 ? C.stalk : C.stalkDark} stroke={KRP.ink} strokeWidth={4.5}
            transform={`translate(${140 + ox} 720) rotate(${a + Math.sin(f / 12 + i) * 3 * (1 + cool)})`} />
        ))}
        {/* 涼み台 (竹) */}
        <rect x={430} y={640} width={1100} height={34} rx={10} fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={450 + i * 50} y1={642} x2={450 + i * 50} y2={672} stroke={C.bambooDark} strokeWidth={3} />)}
        {[470, 1490].map((lx) => <rect key={lx} x={lx - 14} y={674} width={28} height={130} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={4.5} />)}
        <rect x={470} y={740} width={1020} height={14} rx={7} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 茶器 */}
        <path d="M 500 640 Q 490 590 540 586 Q 590 590 580 640 Z" fill={C.glass} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 578 606 q 26 -6 30 -24" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <rect x={604} y={616} width={36} height={24} rx={6} fill={C.glass} stroke={KRP.ink} strokeWidth={3.5} />
        {/* 陶枕 */}
        <path d="M 770 640 L 770 600 Q 860 580 960 600 L 960 640 Z" fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 800 620 q 30 -14 60 0 q 30 14 60 0" fill="none" stroke={C.windDeep} strokeWidth={4} />
        {/* 寝そべる人 */}
        <L3bLying fx={fx} fy={fy} s={s} f={f} face={f < 22 ? "worried" : "smile"}>
          <L3bRobe cloth={C.songCloth} dark={C.songClothDark} />
          <L3bFutou wing={0} />
        </L3bLying>
        {/* 抱えた竹夫人 */}
        <L3bTube id="yw125tube" x={1210} y={540} L={430} R={50} rot={-3} spin={0.3 + f * 0.003} sw={0.85} />
        <L3bLyingHands fx={fx} fy={fy} s={s} f={f} />
        {/* 団扇 (手元から顔の上へ。ぱたぱた) */}
        <g transform={`rotate(${Math.sin(f / 2.6) * 16} ${hx} ${hy - 20})`}>
          <line x1={hx} y1={hy - 20} x2={hx - 90} y2={hy - 150} stroke={C.bambooDark} strokeWidth={10} strokeLinecap="round" />
          <circle cx={hx - 130} cy={hy - 210} r={70} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2;
            return <line key={i} x1={hx - 100} y1={hy - 165} x2={hx - 130 + Math.cos(a) * 66} y2={hy - 210 + Math.sin(a) * 66} stroke={C.bambooLight} strokeWidth={2.5} />;
          })}
          <circle cx={hx - 140} cy={hy - 220} r={22} fill={C.lantern} opacity={0.75} />
          <circle cx={hx - 130} cy={hy - 210} r={70} fill="none" stroke={KRP.ink} strokeWidth={5} />
        </g>
        {/* 涼しい風 (網目をすり抜ける) */}
        <g fill="none" strokeLinecap="round" strokeDasharray="180 110">
          {[440, 500, 560, 610].map((yy, i) => (
            <path key={i} d={`M -40 ${yy - 80} Q 500 ${yy - 140} 900 ${yy} T 1960 ${yy - 60}`} stroke={i % 2 ? C.wind : C.windDeep}
              strokeWidth={7} strokeDashoffset={-f * 22 - i * 90} opacity={0.3 + 0.35 * cool} />
          ))}
        </g>
        {/* 汗と熱のゆらぎ (消えていく) */}
        <g opacity={1 - cool}>
          {[[840, 400], [920, 380], [770, 450]].map(([dx, dy], i) => (
            <path key={i} d={`M ${dx} ${dy - cool * 40} q 12 20 0 30 q -12 -10 0 -30 Z`} fill={C.wind} stroke={KRP.ink} strokeWidth={3} />
          ))}
          {[1000, 1150, 1300].map((wx, i) => (
            <path key={i} d={`M ${wx} 430 q 14 -20 0 -40 q -14 -20 0 -40`} fill="none" stroke={C.flameRed} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
        <TagPlate x={960} y={200} text="涼む" size={70} t={seg(f, 14, 24)} color={C.windDeep} />
      </g>
    </Frame>
  );
};

// ---- 文#126 【並】 でも、ただの道具に、わざわざ「夫人」という名前をつけるでしょうか。
// 設計: 道具の棚: 鍬・桶・扇に、それぞれ「鍬」「桶」「扇」の札。その中で竹夫人だけ「夫人」の札がついて浮いている。`QMark`
// どこ: 昔の農家の土間。土壁・格子窓・壁の木釘に笠、下に籠と縄
// 演出: 壁に鍬、棚に桶と扇。それぞれ普通の白い札「鍬」「桶」「扇」。竹夫人だけが棚からふわりと浮き、桃色の特別な札「夫人」。横に大きな「？」
// 動き: カメラが左 (道具) から右 (竹夫人) へパン。f8〜24 竹夫人が浮き上がって光る。ほかの道具の札は静かに揺れるだけ。f22〜 ？が出る
const Yw126: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(60, -30, easeInOut(seg(f, 0, 42)));
  const lift = easeOut(seg(f, 8, 24));
  const ty = 578 - lift * 90 + Math.sin(f / 10) * 6 * lift;
  const sw = (ph: number) => Math.sin(f / 13 + ph) * 2.5;
  return (
    <Frame f={f} seed={3126} bg={C.mudWall}>
      <g transform={`translate(${pan} 0) ${camT(960, 540, 1.05)}`}>
        {/* 土壁 (わら入り) */}
        <rect x={-100} y={-40} width={W + 200} height={900} fill={C.mudWall} />
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1={rnd(3126, i) * 2100 - 100} y1={rnd(3127, i) * 820} x2={rnd(3126, i) * 2100 - 100 + 18} y2={rnd(3127, i) * 820 + (rnd(3128, i) - 0.5) * 16}
            stroke={C.straw} strokeWidth={3} opacity={0.8} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={rnd(3129, i) * 2000} cy={rnd(3130, i) * 760} rx={60} ry={24} fill={C.mudWallDark} opacity={0.25} />
        ))}
        {/* 格子窓 (光が差す) */}
        <rect x={540} y={90} width={260} height={200} fill={C.sky} stroke={KRP.ink} strokeWidth={6} />
        {[1, 2, 3, 4].map((i) => <rect key={i} x={540 + i * 52 - 6} y={90} width={12} height={200} fill={C.bedWood} stroke={KRP.ink} strokeWidth={3} />)}
        <path d="M 540 290 L 800 290 L 1100 640 L 700 640 Z" fill={KRP.white} opacity={0.12} />
        {/* 柱 */}
        {[20, 1880].map((px) => <rect key={px} x={px - 22} y={-40} width={44} height={900} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />)}
        {/* 壁の笠 */}
        <circle cx={1730} cy={150} r={8} fill={C.bedWoodDark} />
        <g transform={`rotate(${sw(2)} 1730 150)`}>
          <path d="M 1610 260 Q 1730 120 1850 260 Z" fill={C.straw} stroke={KRP.ink} strokeWidth={5} />
          {[-1, 0, 1].map((k) => <line key={k} x1={1730} y1={175} x2={1730 + k * 90} y2={258} stroke={C.earthDark} strokeWidth={3} />)}
        </g>
        {/* 鍬 (壁の木釘に掛ける) */}
        <circle cx={205} cy={150} r={10} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={3} />
        <g transform={`rotate(${sw(0)} 205 150)`}>
          <rect x={193} y={140} width={24} height={560} rx={10} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 190 690 L 290 700 L 300 770 L 180 760 Z" fill={C.iron} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 186 752 L 298 762" stroke={KRP.white} strokeWidth={4} opacity={0.4} />
          <line x1={210} y1={300} x2={300} y2={420} stroke={KRP.ink} strokeWidth={3} />
          <TagPlate x={305} y={440} text="鍬" size={38} />
        </g>
        {/* 棚 */}
        <rect x={360} y={640} width={1460} height={30} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
        {[440, 1100, 1740].map((bx) => (
          <path key={bx} d={`M ${bx} 670 L ${bx} 760 L ${bx + 50} 670 Z`} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {/* 桶 */}
        <path d="M 440 470 L 600 470 L 588 640 L 452 640 Z" fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={466 + i * 22} y1={472} x2={470 + i * 20} y2={638} stroke={C.bambooDark} strokeWidth={3} />)}
        {[510, 600].map((hy) => <rect key={hy} x={444 + (hy - 470) * 0.07} y={hy} width={152 - (hy - 470) * 0.14} height={12} fill={C.iron} stroke={KRP.ink} strokeWidth={3} />)}
        <ellipse cx={520} cy={470} rx={80} ry={14} fill={C.tubeIn} stroke={KRP.ink} strokeWidth={4} />
        {/* 扇 (台に開いて飾る) */}
        <path d="M 820 640 L 690 520 A 180 180 0 0 1 950 520 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI * (1.25 + i * 0.0625);
          return <line key={i} x1={820} y1={640} x2={820 + Math.cos(a) * 184} y2={640 + Math.sin(a) * 184} stroke={C.bambooDark} strokeWidth={3} />;
        })}
        <path d="M 735 520 Q 820 470 905 520" fill="none" stroke={KRP.red} strokeWidth={10} opacity={0.6} />
        <circle cx={820} cy={636} r={8} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={3} />
        {/* 道具の札 (棚の前に下がる) */}
        {[[520, "桶", 1], [820, "扇", 3]].map(([x, t, ph]) => (
          <g key={t as string} transform={`rotate(${sw(ph as number)} ${x} 672)`}>
            <line x1={x as number} y1={672} x2={x as number} y2={694} stroke={KRP.ink} strokeWidth={3} />
            <TagPlate x={x as number} y={724} text={t as string} size={38} />
          </g>
        ))}
        {/* 主役: 浮く竹夫人 */}
        <ellipse cx={1290} cy={650} rx={280 - lift * 80} ry={16} fill={KRP.ink} opacity={0.22 - lift * 0.1} />
        <ellipse cx={1290} cy={ty} rx={380} ry={120} fill={YP.glow} opacity={0.3 * lift} />
        <L3bTube id="yw126tube" x={1290} y={ty} L={560} R={62} spin={0.3 + f * 0.01 * lift} sw={0.95} />
        {lift > 0 && Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + f / 20;
          return <path key={i} d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5}
            transform={`translate(${1290 + Math.cos(a) * 340} ${ty + Math.sin(a) * 110}) scale(${lift})`} />;
        })}
        <line x1={1290} y1={ty - 62} x2={1290} y2={ty - 98} stroke={KRP.ink} strokeWidth={4} opacity={lift} />
        <TagPlate x={1290} y={ty - 140} text="夫人" size={58} t={seg(f, 14, 24)} fill={C.fujin} color={KRP.red} rot={Math.sin(f / 9) * 3} />
        <QMark x={1660} y={360} s={1.5} f={f} t={seg(f, 22, 32)} />
        {/* 土間の床・籠・縄 */}
        <rect x={-100} y={840} width={W + 200} height={300} fill={C.earth} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 560 860 L 720 860 L 700 780 L 580 780 Z" fill={C.straw} stroke={KRP.ink} strokeWidth={4.5} />
        {[1, 2, 3].map((r) => <ellipse key={r} cx={1500} cy={850} rx={30 + r * 20} ry={10 + r * 6} fill="none" stroke={C.straw} strokeWidth={8} />)}
      </g>
    </Frame>
  );
};

// ---- 文#127 【山】 柔らかくなくても、人は、腕の中に何かを入れたかったのです。
// 設計: ★リキャップ④。`KaradaChizu` (lit={{ back: 1, arms: L }}、L は f6〜26 で 0→1)。腕と胸の座が灯る。背景は宋代の寝室 (竹の寝台・すだれ・月)。腕の光と竹夫人の網目の柔らかい曲線を重ねる
// どこ: 宋代の夜の寝室。竹の寝台 (天蓋つき・蚊帳)・すだれ・丸窓の満月・提灯。凡例の下に竹の板
// 演出: からだの地図。背中は灯ったまま、腕と胸の座が灯る。人の背後に竹夫人が横たわり、腕の光の上に網目の柔らかい曲線が重なる
// 動き: L = f6〜26 で 0→1。網目の光の線が腕の座に沿って流れる。カメラはほんの少し寄る。すだれ・蚊帳がゆれる
const Yw127: React.FC<{ f: number }> = ({ f }) => {
  const Lt = easeOut(seg(f, 6, 26));
  const cam = 1.0 + 0.03 * easeInOut(seg(f, 0, 42));
  const cx = 760, cy = 920 - 118 * 2.3;
  return (
    <Frame f={f} seed={3127} bg={C.nightHaze} dark>
      <g transform={camT(900, 480, cam)}>
        {/* 壁と床 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.nightHaze} />
        <rect x={-40} y={780} width={W + 80} height={340} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-40} y1={810 + i * 40} x2={W + 40} y2={810 + i * 40} stroke={KRP.ink} strokeWidth={3} opacity={0.35} />)}
        {/* 丸窓と月 */}
        <circle cx={230} cy={330} r={160} fill={C.night} stroke={C.bedWood} strokeWidth={22} />
        <circle cx={230} cy={330} r={160} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={250} cy={300} r={64} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
        {[-80, 0, 80].map((dx) => <line key={dx} x1={230 + dx} y1={180} x2={230 + dx} y2={480} stroke={C.bedWood} strokeWidth={8} />)}
        <path d="M 120 520 L 460 940 L 900 940 L 330 470 Z" fill={C.moon} opacity={0.07} />
        {/* 竹の寝台 (天蓋つき) */}
        <rect x={420} y={150} width={720} height={26} fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
        {[440, 1120].map((px) => (
          <g key={px}>
            <rect x={px - 16} y={150} width={32} height={640} fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
            {[300, 450, 600].map((ny) => <line key={ny} x1={px - 16} y1={ny} x2={px + 16} y2={ny} stroke={KRP.ink} strokeWidth={4} />)}
          </g>
        ))}
        <rect x={420} y={700} width={720} height={60} fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={440 + i * 50} y1={702} x2={440 + i * 50} y2={758} stroke={C.bambooDark} strokeWidth={3} />)}
        {/* 蚊帳 */}
        {[0, 1].map((k) => (
          <path key={k} d={`M ${k ? 1120 : 440} 176 Q ${k ? 1060 + Math.sin(f / 14) * 10 : 500 + Math.sin(f / 14) * 10} 440 ${k ? 1100 : 460} 700 L ${k ? 1000 : 560} 700 Q ${k ? 980 : 580} 400 ${k ? 1060 : 500} 176 Z`}
            fill={C.curtain} opacity={0.4} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* すだれ (上) */}
        <g transform={`skewX(${Math.sin(f / 18) * 1.5})`}>
          <rect x={-40} y={-40} width={1200} height={140} fill={C.bamboo} opacity={0.85} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 13 }, (_, i) => <line key={i} x1={-40} y1={-30 + i * 10} x2={1160} y2={-30 + i * 10} stroke={C.bambooDark} strokeWidth={2.5} />)}
          <rect x={-40} y={94} width={1200} height={18} rx={9} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 提灯 */}
        <g transform={`translate(1700 110) rotate(${Math.sin(f / 14) * 3})`}>
          <line x1={0} y1={-80} x2={0} y2={-40} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={10} r={70} fill={KRP.yellow} opacity={0.2} />
          <ellipse cx={0} cy={10} rx={36} ry={44} fill={C.lantern} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 凡例の下の竹の板 */}
        <rect x={1188} y={18} width={420} height={726} rx={14} fill={C.bamboo} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <line x1={1188 + (i + 1) * 52.5} y1={20} x2={1188 + (i + 1) * 52.5} y2={742} stroke={C.bambooDark} strokeWidth={4} />
            <line x1={1188 + i * 52.5 + 10} y1={60 + (i % 3) * 30} x2={1188 + i * 52.5 + 42} y2={60 + (i % 3) * 30} stroke={C.bambooDark} strokeWidth={3} />
          </g>
        ))}
        <rect x={1200} y={30} width={18} height={700} fill={KRP.white} opacity={0.2} />
        {/* 人の背後の竹夫人 (腕の座の高さ) */}
        <ellipse cx={cx} cy={cy} rx={470} ry={150} fill={YP.glow} opacity={0.22 * Lt} />
        <L3bTube id="yw127tube" x={cx} y={cy} L={780} R={92} spin={0.3 + f * 0.004} sw={1.05} />
        {/* からだの地図 */}
        <KaradaChizu x={760} y={920} s={2.3} f={f} lit={{ back: 1, arms: Lt }} />
        {/* 腕の光に重なる網目の曲線 */}
        <g fill="none" stroke={YP.glowCore} strokeLinecap="round" opacity={0.75 * Lt}>
          {[-1, 0, 1].map((k) => (
            <path key={k} d={`M ${cx - 230} ${cy + k * 52} Q ${cx - 110} ${cy + k * 52 - 60 + Math.sin(f / 8 + k) * 8} ${cx} ${cy + k * 52} T ${cx + 230} ${cy + k * 52}`}
              strokeWidth={7} strokeDasharray="40 22" strokeDashoffset={-f * 3} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#128 【並】 では人は、柔らかさではなく、何を抱いていたのでしょうか。
// 設計: 夜の寝室で竹夫人を抱えて眠る人の上に、大きな `QMark`。竹夫人の網目の影が床に落ちる。第7章への引き
// どこ: 夜の寝室 (宋)。格子の丸窓から月の光の帯が床へ。低い竹の寝台・蚊帳・消えたろうそく
// 演出: 竹夫人を抱えてすやすや眠る人。月の光が竹夫人を通って、床に六つ目の網目の影を落とす。その上に大きな「？」
// 動き: カメラがゆっくり上へティルトして？に寄る。f12〜26 ？がぽんと出て揺れる。寝息の「z」が浮かぶ。網目の影がわずかに揺れる
const Yw128: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.0 + 0.05 * easeInOut(seg(f, 0, 42));
  const tilt = lerp(30, -10, easeInOut(seg(f, 0, 42)));
  const fx = 1290, fy = 465, s = 1.8;
  const q = seg(f, 12, 26);
  return (
    <Frame f={f} seed={3128} bg={C.nightDeep} dark>
      <g transform={camT(1000, 400, cam, 0, tilt)}>
        <rect x={-40} y={-80} width={W + 80} height={H + 160} fill={C.night} />
        {/* 壁の腰板 */}
        <rect x={-40} y={520} width={W + 80} height={200} fill={C.nightDeep} opacity={0.5} />
        {/* 床 */}
        <rect x={-40} y={700} width={W + 80} height={460} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-40} y1={730 + i * 38} x2={W + 40} y2={730 + i * 38} stroke={KRP.ink} strokeWidth={3} opacity={0.3} />)}
        {/* 窓と月の光の帯 */}
        <circle cx={300} cy={260} r={150} fill={C.nightHaze} stroke={C.bedWood} strokeWidth={20} />
        <circle cx={330} cy={230} r={56} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
        {[-75, 0, 75].map((d) => (
          <g key={d}>
            <line x1={300 + d} y1={110} x2={300 + d} y2={410} stroke={C.bedWood} strokeWidth={8} />
            <line x1={150} y1={260 + d} x2={450} y2={260 + d} stroke={C.bedWood} strokeWidth={8} />
          </g>
        ))}
        <circle cx={300} cy={260} r={150} fill="none" stroke={KRP.ink} strokeWidth={5} />
        <path d="M 200 380 L 420 160 L 1500 760 L 700 900 Z" fill={C.moon} opacity={0.1} />
        {/* 床に落ちる網目の影 */}
        <defs>
          <clipPath id="yw128sh"><ellipse cx={1060} cy={790} rx={380} ry={56} /></clipPath>
        </defs>
        <ellipse cx={1060} cy={790} rx={380} ry={56} fill={C.moon} opacity={0.22} />
        <g clipPath="url(#yw128sh)" stroke={KRP.ink} strokeWidth={6} opacity={0.5}>
          {Array.from({ length: 22 }, (_, i) => {
            const x0 = 640 + i * 44 + Math.sin(f / 20) * 6;
            return (
              <g key={i}>
                <line x1={x0} y1={730} x2={x0 + 120} y2={850} />
                <line x1={x0 + 120} y1={730} x2={x0} y2={850} />
              </g>
            );
          })}
          <line x1={640} y1={790} x2={1480} y2={790} />
        </g>
        {/* 低い竹の寝台 */}
        <rect x={420} y={560} width={1120} height={40} rx={8} fill={C.mat} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={440 + i * 56} y1={562} x2={440 + i * 56} y2={598} stroke={C.matLine} strokeWidth={3} />)}
        <rect x={420} y={600} width={1120} height={60} fill={C.bamboo} stroke={KRP.ink} strokeWidth={5} />
        {[450, 1510].map((lx) => <rect key={lx} x={lx - 14} y={660} width={28} height={70} fill={C.bambooDark} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={420} y={600} width={1120} height={60} fill={C.nightDeep} opacity={0.3} />
        {/* 蚊帳 (奥) */}
        <path d={`M 380 0 Q ${420 + Math.sin(f / 16) * 10} 300 400 560 L 480 560 Q 470 300 460 0 Z`} fill={C.curtain} opacity={0.3} stroke={KRP.ink} strokeWidth={3} />
        <path d={`M 1600 0 Q ${1570 + Math.sin(f / 16) * 10} 300 1580 560 L 1500 560 Q 1510 300 1520 0 Z`} fill={C.curtain} opacity={0.3} stroke={KRP.ink} strokeWidth={3} />
        {/* 枕 */}
        <path d="M 780 562 L 780 520 Q 870 500 970 520 L 970 562 Z" fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
        {/* 眠る人 */}
        <L3bLying fx={fx} fy={fy} s={s} f={f} sleep>
          <L3bRobe cloth={C.songCloth} dark={C.songClothDark} />
        </L3bLying>
        <L3bTube id="yw128tube" x={1200} y={458} L={430} R={50} rot={-3} spin={0.3} sw={0.85} />
        <L3bLyingHands fx={fx} fy={fy} s={s} f={f} />
        {/* ろうそく台 (消えている) */}
        <rect x={1640} y={560} width={120} height={20} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1690} y={500} width={20} height={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <path d={`M 1700 496 q ${Math.sin(f / 8) * 10} -30 0 -60`} fill="none" stroke={C.smoke} strokeWidth={4} opacity={0.5} />
        {/* 寝息 */}
        {[0, 1, 2].map((i) => {
          const life = ((f + i * 14) % 42) / 42;
          return (
            <text key={i} x={820 - life * 80} y={330 - life * 110} fontFamily={FONT} fontWeight={900} fontSize={34 + i * 8}
              fill={C.moon} opacity={Math.sin(life * Math.PI) * 0.9}>z</text>
          );
        })}
        {/* 大きな？ */}
        <circle cx={1060} cy={200} r={170} fill={C.moon} opacity={0.12 * q} />
        <QMark x={1060} y={300} s={2.4} f={f} t={q} />
      </g>
    </Frame>
  );
};

// ---- 文#129 【山】 第7章、子ザルは、布にしがみついた。
// 設計: 章扉。1950年代のアメリカの研究所の外観 (れんが造り・ウィスコンシンの雪の木々)。窓に温かい明かり。`ChapterDoor` (num=7)
// どこ: 1950年代、冬のウィスコンシン。夕暮れの雪の中に建つれんが造りの研究所 (屋上に星条旗・入口に看板)
// 演出: 窓に温かい明かり。2階の窓の1つで、子ザルがタオルにくるまっている (第7章の予告)。題字は右下のクリーム帯
// 動き: 雪が降る。カメラがゆっくり窓へ寄る。f8〜16 その窓の明かりがぽっと灯る。煙突の煙・旗がなびく・街灯が瞬く
const Yw129: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = 1.0 + 0.08 * easeInOut(seg(f, 0, 42));
  const lamp = easeOut(seg(f, 8, 16));
  const wins = Array.from({ length: 12 }, (_, i) => ({ c: i % 4, r: Math.floor(i / 4) }));
  return (
    <Frame f={f} seed={3129} bg={C.winterDeep} dark
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={7} title="子ザルは、布にしがみついた" t={door} left={1000} top={560} />
      </>}>
      <g transform={camT(430, 430, cam)}>
        {/* 冬の夕空 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.winterDeep} />
        <rect x={-40} y={300} width={W + 80} height={500} fill={C.winter} opacity={0.7} />
        {/* 遠くの雪の林 */}
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M ${i * 130 - 20} 760 L ${i * 130 + 40} ${560 + rnd(3129, i) * 80} L ${i * 130 + 100} 760 Z`} fill={C.fir} opacity={0.6} />
        ))}
        {/* 雪の地面 */}
        <path d="M -40 780 Q 600 750 1960 790 L 1960 1120 L -40 1120 Z" fill={C.snow} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 500 1080 Q 520 900 530 800" fill="none" stroke={C.snowShade} strokeWidth={50} />
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={512 + (i % 2) * 24} cy={1000 - i * 34} rx={9} ry={5} fill={C.snowShade} />
        ))}
        {/* 研究所 (れんが造り) */}
        <rect x={80} y={240} width={860} height={560} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 27 }, (_, r) => (
          <g key={r}>
            <line x1={80} y1={260 + r * 20} x2={940} y2={260 + r * 20} stroke={C.mortar} strokeWidth={2} opacity={0.6} />
            {Array.from({ length: 14 }, (_, c) => (
              <line key={c} x1={80 + c * 64 + (r % 2) * 32} y1={240 + r * 20} x2={80 + c * 64 + (r % 2) * 32} y2={260 + r * 20} stroke={C.mortar} strokeWidth={2} opacity={0.5} />
            ))}
          </g>
        ))}
        <rect x={60} y={222} width={900} height={30} fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 56 226 Q 300 196 500 214 Q 760 192 964 224 L 964 236 L 56 236 Z" fill={C.snow} stroke={KRP.ink} strokeWidth={4} />
        {/* 煙突と煙 */}
        <rect x={780} y={130} width={60} height={100} fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 776 132 q 34 -16 68 0" fill={C.snow} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M 810 120 C ${830 + Math.sin(f / 9) * 20} 80 ${880 + Math.sin(f / 7) * 20} 50 ${940 + Math.sin(f / 8) * 20} 20`} fill="none" stroke={C.snowShade} strokeWidth={20} strokeLinecap="round" opacity={0.6} />
        {/* 屋上の星条旗 */}
        <line x1={620} y1={222} x2={620} y2={70} stroke={KRP.grayDark} strokeWidth={6} />
        <g transform={`translate(623 74) skewY(${Math.sin(f / 6) * 4})`}>
          <rect x={0} y={0} width={120} height={72} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {[0, 2, 4, 6].map((k) => <rect key={k} x={0} y={k * 10.3} width={120} height={10.3} fill={C.flagRed} />)}
          <rect x={0} y={0} width={52} height={38} fill={C.flagBlue} />
          <rect x={0} y={0} width={120} height={72} fill="none" stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 窓 (4列×3段) */}
        {wins.map(({ c, r }, i) => {
          const wx = 140 + c * 200 + (c >= 2 ? 40 : 0);
          const wy = 290 + r * 150;
          if (r === 2 && (c === 1 || c === 2)) return null;
          const special = r === 1 && c === 1;
          const on = special ? lamp : (i % 3 === 0 ? 0.35 : 1);
          return (
            <g key={i}>
              <rect x={wx - 10} y={wy - 10} width={120} height={130} fill={C.warm} opacity={0.25 * on} />
              <rect x={wx} y={wy} width={100} height={110} fill={on > 0.5 ? C.warm : C.winterDeep} stroke={KRP.ink} strokeWidth={5} />
              {special && lamp > 0 && (
                <g opacity={lamp}>
                  <rect x={wx + 6} y={wy + 60} width={88} height={50} fill={C.towel} stroke={KRP.ink} strokeWidth={3} />
                  <g transform={`translate(${wx + 50} ${wy + 58})`}><L3bMiniMonkey s={0.62} f={f} /></g>
                  <rect x={wx + 4} y={wy + 82} width={92} height={28} rx={12} fill={C.towel} stroke={KRP.ink} strokeWidth={3} />
                </g>
              )}
              <line x1={wx + 50} y1={wy} x2={wx + 50} y2={wy + 110} stroke={KRP.ink} strokeWidth={4} />
              <line x1={wx} y1={wy + 55} x2={wx + 100} y2={wy + 55} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${wx - 8} ${wy + 116} q 58 -12 116 0 L ${wx + 108} ${wy + 124} L ${wx - 8} ${wy + 124} Z`} fill={C.snow} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 入口と看板 */}
        <rect x={400} y={600} width={220} height={200} fill={C.brickDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={430} y={640} width={160} height={160} fill={C.warm} stroke={KRP.ink} strokeWidth={5} />
        <line x1={510} y1={640} x2={510} y2={800} stroke={KRP.ink} strokeWidth={4} />
        <rect x={360} y={560} width={300} height={44} rx={4} fill={C.snow} stroke={KRP.ink} strokeWidth={4} />
        <text x={510} y={592} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.brickDark}>PRIMATE LAB</text>
        {[0, 1, 2].map((k) => <rect key={k} x={380 - k * 16} y={800 + k * 12} width={260 + k * 32} height={12} fill={C.snowShade} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 雪をかぶった木 (右) */}
        {[[1150, 1.0], [1420, 0.8], [1700, 1.1]].map(([tx, ts], i) => (
          <g key={i} transform={`translate(${tx} 520) scale(${ts}) rotate(${Math.sin(f / 18 + i) * 1})`}>
            <path d="M 0 260 L 0 -40 M 0 80 L -90 -60 M 0 40 L 80 -110 M 0 140 L 110 20 M -50 0 L -120 -40 M 40 -40 L 30 -160" fill="none" stroke={C.bark} strokeWidth={14} strokeLinecap="round" />
            <path d="M -96 -66 q 12 -8 24 4 M 74 -116 q 12 -8 22 4 M 104 14 q 12 -8 22 4 M -126 -46 q 10 -8 20 2 M 24 -166 q 10 -8 20 2" fill="none" stroke={C.snow} strokeWidth={9} strokeLinecap="round" />
          </g>
        ))}
        {/* 街灯 */}
        <rect x={1010} y={520} width={12} height={270} fill={KRP.ink} />
        <circle cx={1016} cy={510} r={60} fill={C.warm} opacity={0.25 + Math.sin(f / 5) * 0.05} />
        <path d="M 990 520 L 1042 520 L 1032 486 L 1000 486 Z" fill={C.warm} stroke={KRP.ink} strokeWidth={4} />
        {/* 降る雪 */}
        {Array.from({ length: 60 }, (_, i) => {
          const y = ((rnd(3130, i) * 1100 + f * (3 + rnd(3131, i) * 3)) % 1100) - 20;
          const x = rnd(3132, i) * 1960 + Math.sin(f / 12 + i) * 20;
          return <circle key={i} cx={x} cy={y} r={3 + rnd(3133, i) * 4} fill={C.snow} opacity={0.85} />;
        })}
        <TagPlate x={1460} y={150} text="ウィスコンシン州" size={36} t={seg(f, 6, 16)} />
        <TagPlate x={1460} y={250} text="1950年代" size={36} t={seg(f, 10, 20)} />
      </g>
    </Frame>
  );
};

// ---- 文#130 【山】 1958年、アメリカの心理学者、ハリー・ハーロウが、ある実験を発表しました。
// 設計: 学会の講演会場 (1950年代。スライド映写機・黒板・聴衆の背中)。壇上で白衣・眼鏡のハーロウが話す。映写されたスライドに「布の母」と「針金の母」の絵。隅に `AgeDial` (s≈0.5、label「1958年」)。札「ハリー・ハーロウ」。アメリカの国旗
// どこ: 1958年の学会の講演会場。木の腰板の壁・黒板・天井の照明・星条旗。手前に聴衆の背中、後ろからスライド映写機の光
// 演出: 壇上の演台で白衣・眼鏡のハーロウがスクリーンを指す。スクリーンには「布の母」と「針金の母」の絵。左上に年代ダイヤル「1958年」
// 動き: f6〜14 映写機がカチッ → スライドがちらついて映る。f10〜20 ハーロウが指す。聴衆が身を乗り出す。光の帯にほこり。カメラがスクリーンへ少し寄る
const Yw130: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.0 + 0.05 * easeInOut(seg(f, 0, 42));
  const slide = seg(f, 6, 14);
  const flick = slide > 0 && slide < 1 ? 0.5 + 0.5 * Math.sin(f * 3) : 1;
  const lean = easeOut(seg(f, 14, 30));
  const hs = 1.45, hx = 560, hy = 700;
  return (
    <Frame f={f} seed={3130} bg={C.hallWall}>
      <g transform={camT(960, 400, cam)}>
        {/* 壁・腰板・天井 */}
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.hallWall} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 170} y1={-40} x2={i * 170} y2={640} stroke={C.hallDark} strokeWidth={4} opacity={0.5} />)}
        <rect x={-40} y={460} width={W + 80} height={180} fill={C.hallDark} opacity={0.6} />
        <rect x={-40} y={-40} width={W + 80} height={60} fill={C.hallDark} />
        {[420, 1150, 1700].map((lx) => (
          <g key={lx}>
            <line x1={lx} y1={20} x2={lx} y2={56} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 40} 80 Q ${lx} 40 ${lx + 40} 80 Z`} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 黒板 */}
        <rect x={360} y={250} width={420} height={280} fill={C.board2} stroke={C.bedWood} strokeWidth={14} />
        <g stroke={C.chalk} strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round">
          <path d="M 400 300 q 30 -20 60 0 t 60 0 M 400 350 l 120 0 M 400 400 q 40 -30 80 0" />
          <path d="M 560 460 L 560 320 M 560 460 L 740 460 M 570 440 Q 620 330 730 340" />
        </g>
        <rect x={360} y={530} width={420} height={14} fill={C.bedWood} stroke={KRP.ink} strokeWidth={3} />
        {/* スクリーン */}
        <rect x={810} y={92} width={840} height={20} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={830} y={110} width={800} height={460} fill={C.screen} stroke={KRP.ink} strokeWidth={6} />
        <g opacity={slide * flick}>
          <rect x={830} y={110} width={800} height={460} fill={C.beam} opacity={0.5} />
          {/* スライドの絵: 布の母 / 針金の母 */}
          <g transform="translate(1030 500)"><L3bClothMom s={1.0} f={f} /></g>
          <g transform="translate(1430 500)"><L3bWireMom s={1.0} /></g>
          <rect x={940} y={510} width={180} height={46} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          <text x={1030} y={544} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>布の母</text>
          <rect x={1325} y={510} width={210} height={46} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3.5} />
          <text x={1430} y={544} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.ink}>針金の母</text>
          <line x1={1230} y1={150} x2={1230} y2={540} stroke={KRP.gray} strokeWidth={4} strokeDasharray="12 10" />
        </g>
        {/* 星条旗 */}
        <line x1={1760} y1={120} x2={1760} y2={660} stroke={YP.brass} strokeWidth={10} />
        <circle cx={1760} cy={112} r={12} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
        <g transform={`translate(1764 140) skewY(${Math.sin(f / 10) * 2})`}>
          <path d="M 0 0 L 110 0 Q 104 160 110 300 L 0 300 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 7 }, (_, k) => <rect key={k} x={0} y={k * 43} width={110} height={21} fill={C.flagRed} />)}
          <rect x={0} y={0} width={64} height={120} fill={C.flagBlue} />
          {Array.from({ length: 12 }, (_, k) => <circle key={k} cx={12 + (k % 3) * 20} cy={14 + Math.floor(k / 3) * 28} r={4} fill={KRP.white} />)}
          <rect x={0} y={0} width={110} height={300} fill="none" stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 壇 */}
        <rect x={-40} y={640} width={W + 80} height={70} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-40} y={640} width={W + 80} height={14} fill={C.bedWoodDark} />
        {/* ハーロウ (白衣・眼鏡) */}
        <Person x={hx} y={hy} s={hs} f={f} phase={1} face="smile" pose={f > 10 ? "point" : "stand"} pointDir={1}
          cloth={KRP.white} clothDark={C.coatWhite} glasses hair="cap" gaze={[4, -2]} />
        <L3bOn x={hx} y={hy} s={hs} f={f} phase={1}>
          <path d="M -24 -160 L 0 -120 L 24 -160" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -6 -150 L 0 -100 L 6 -150 Z" fill={C.flagBlue} stroke={KRP.ink} strokeWidth={2} />
        </L3bOn>
        {/* 演台とマイク */}
        <path d="M 420 560 L 700 560 L 680 700 L 440 700 Z" fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={406} y={546} width={308} height={22} rx={6} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={500} y={600} width={120} height={60} rx={6} fill={C.bedWoodDark} opacity={0.5} />
        <line x1={470} y1={546} x2={448} y2={480} stroke={KRP.grayDark} strokeWidth={6} />
        <rect x={426} y={440} width={40} height={50} rx={14} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        {[452, 466].map((my) => <line key={my} x1={430} y1={my} x2={462} y2={my} stroke={KRP.ink} strokeWidth={2.5} />)}
        <path d="M 650 546 L 660 520 L 680 520 L 686 546 Z" fill={C.glass} stroke={KRP.ink} strokeWidth={3} />
        {/* 映写機の光の帯とほこり */}
        <path d="M 1290 1100 L 830 110 L 1630 110 L 1350 1100 Z" fill={C.beam} opacity={0.12 * slide} />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={1100 + rnd(3130, i) * 360 + Math.sin(f / 14 + i) * 14} cy={200 + rnd(3131, i) * 600 - f * 0.6} r={3} fill={C.beam} opacity={0.6 * slide} />
        ))}
        {/* 聴衆の背中 */}
        {Array.from({ length: 2 }, (_, r) => (
          <g key={r}>
            {Array.from({ length: 9 }, (_, i) => {
              const ax = 60 + i * 230 + r * 110 + rnd(3134, i + r * 9) * 30;
              const ay = 790 + r * 110;
              if (r === 1 && Math.abs(ax - 1320) < 80) return null;
              const tilt2 = (i % 3 === 1 ? 6 : -3) * lean;
              const col = [C.suit1, C.suit2, C.suit3][(i + r) % 3];
              return (
                <g key={i} transform={`rotate(${tilt2} ${ax} ${ay + 120}) translate(0 ${-lean * 8})`}>
                  <path d={`M ${ax - 100} ${ay + 170} Q ${ax - 96} ${ay + 40} ${ax} ${ay + 36} Q ${ax + 96} ${ay + 40} ${ax + 100} ${ay + 170} Z`} fill={col} stroke={KRP.ink} strokeWidth={5} />
                  <rect x={ax - 22} y={ay + 10} width={44} height={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                  <circle cx={ax} cy={ay - 20} r={50} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
                  <path d={`M ${ax - 50} ${ay - 18} Q ${ax - 52} ${ay - 76} ${ax} ${ay - 72} Q ${ax + 52} ${ay - 76} ${ax + 50} ${ay - 18} Q ${ax} ${ay - 4} ${ax - 50} ${ay - 18} Z`}
                    fill={i % 2 ? C.hairBrown : KRP.ink} />
                </g>
              );
            })}
          </g>
        ))}
        {/* 映写機 (後ろの台) */}
        <g transform="translate(1320 900)">
          <rect x={-70} y={-50} width={140} height={90} rx={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-30} y={-80} width={60} height={34} rx={6} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-6} r={24} fill={C.beam} stroke={KRP.ink} strokeWidth={4} opacity={0.6 + 0.4 * slide} />
        </g>
        <AgeDial x={170} y={330} s={0.45} spin={lerp(-60, 0, easeOut(seg(f, 0, 14)))} label="1958年" handle={f * 4} />
        <TagPlate x={560} y={210} text="ハリー・ハーロウ" size={34} t={seg(f, 8, 18)} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_121: (f) => <Yw121 f={f} />,
  yw_122: (f) => <Yw122 f={f} />,
  yw_123: (f) => <Yw123 f={f} />,
  yw_124: (f) => <Yw124 f={f} />,
  yw_125: (f) => <Yw125 f={f} />,
  yw_126: (f) => <Yw126 f={f} />,
  yw_127: (f) => <Yw127 f={f} />,
  yw_128: (f) => <Yw128 f={f} />,
  yw_129: (f) => <Yw129 f={f} />,
  yw_130: (f) => <Yw130 f={f} />,
};

export const YW_E2_MOTIFS: string[] = [
  "yw_121",
  "yw_122",
  "yw_123",
  "yw_124",
  "yw_125",
  "yw_126",
  "yw_127",
  "yw_128",
  "yw_129",
  "yw_130",
];

export const yawaE2Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
