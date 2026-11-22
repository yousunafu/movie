// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#131〜#140 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-4.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L3c。
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
  // YawaE2 とそろえる (お母さん・子ザル・1950年代)
  wire: "#8C9298", wireDark: "#5E6369", towel: "#EFE3C8", towelDark: "#D6C3A0", bulb: "#FFE07A",
  monkey: "#9A6A45", monkeyDark: "#6E4A2E", monkeyFace: "#F2B7A8", coatWhite: "#D8D8D8",
  bedWood: "#8A5A36", bedWoodDark: "#653F24", board2: "#2F4A3C", chalk: "#E8EFE6",
  glass: "#CFE8F2", flagBlue: "#2D3F78",
  // 研究所
  tile: "#E4EEEB", tileLine: "#BFD2CD", tileTrim: "#5E9A8C", tileShade: "#D2E1DC",
  tileCold: "#D9E3EA", tileColdLine: "#AFBFCC", tileWarm: "#F1E6D2", tileWarmLine: "#D9C6A6",
  lino: "#A9B9B4", lino2: "#97A9A3", linoLine: "#7F928C",
  steel: "#B7BEC4", steelDark: "#7D858C", shaving: "#E3C98F", shavingDark: "#BE9F5E",
  milk: "#FBF8EF", nipple: "#E39A8C", monkeyBelly: "#C79B74", blush: "#F28F8F",
  sky: "#BFE0F0", skyNight: "#2C3A5C", sun: "#FFD15A", moon: "#F7EDC4",
  wallEve: "#C9B89A", wallEveDark: "#A8967A", deskTop: "#9A6A40", typer: "#3E4D47", typerDark: "#28332F",
  paper: "#FBF8F0", coffee: "#5A3A24", mug: "#C94F3D", lampGreen: "#2F5D50", cork: "#C89C64",
  chalkWarm: "#F2D9A0", chalkPink: "#F4B8B0", chalkBlue: "#B8D8F0", frameWood: "#8A5A36",
  fanGreen: "#7FA89A", cold: "#E9F3FA",
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
type PPose = NonNullable<React.ComponentProps<typeof Person>["pose"]>;
const camT = (cx: number, cy: number, sc: number, dx = 0, dy = 0) =>
  `translate(${cx * (1 - sc) + dx} ${cy * (1 - sc) + dy}) scale(${sc})`;

/* タイルの壁 (質感用の道具。舞台は各シーンで別々に組む) */
const L3cTiles: React.FC<{ x: number; y: number; w: number; h: number; sz: number; fill: string; line: string }> = ({ x, y, w, h, sz, fill, line }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={fill} />
    <g stroke={line} strokeWidth={3}>
      {Array.from({ length: Math.ceil(w / sz) + 1 }, (_, i) => <line key={`v${i}`} x1={x + i * sz} y1={y} x2={x + i * sz} y2={y + h} />)}
      {Array.from({ length: Math.ceil(h / sz) + 1 }, (_, i) => <line key={`h${i}`} x1={x} y1={y + i * sz} x2={x + w} y2={y + i * sz} />)}
    </g>
  </g>
);
/* リノリウムの床 (遠近の目地) */
const L3cLino: React.FC<{ y: number; vx: number; col?: string; line?: string }> = ({ y, vx, col = C.lino, line = C.linoLine }) => {
  const bot = H + 40;
  const t = 500 / (bot - y + 500);
  return (
    <g>
      <rect x={-40} y={y} width={W + 80} height={bot - y} fill={col} />
      <g stroke={line} strokeWidth={3}>
        {Array.from({ length: 21 }, (_, k) => {
          const i = k - 10;
          return <line key={k} x1={vx + i * 290 * t} y1={y} x2={vx + i * 290} y2={bot} />;
        })}
        {Array.from({ length: 5 }, (_, j) => {
          const yy = y + (bot - y) * Math.pow((j + 1) / 5, 1.7);
          return <line key={`h${j}`} x1={-40} y1={yy} x2={W + 40} y2={yy} />;
        })}
      </g>
      <rect x={-40} y={y} width={W + 80} height={10} fill={line} opacity={0.6} />
    </g>
  );
};

/* ハーロウ (白衣・眼鏡・黒髪。YawaE2 の #130 と同じネクタイ) */
const L3cOn: React.FC<{
  x: number; y: number; s: number; f: number; phase?: number; lean?: number; children: React.ReactNode;
}> = ({ x, y, s, f, phase = 0, lean = 0, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>{children}</g>;
};
const L3cHarlow: React.FC<{
  x: number; y: number; s: number; f: number; face?: PFace; pose?: PPose; pointDir?: 1 | -1;
  gaze?: [number, number]; lean?: number; phase?: number;
}> = ({ x, y, s, f, face = "normal", pose = "stand", pointDir = 1, gaze = [0, 0], lean = 0, phase = 1 }) => (
  <g>
    <Person x={x} y={y} s={s} f={f} phase={phase} face={face} pose={pose} pointDir={pointDir}
      cloth={KRP.white} clothDark={C.coatWhite} glasses hair="cap" gaze={gaze} lean={lean} />
    <L3cOn x={x} y={y} s={s} f={f} phase={phase} lean={lean}>
      <path d="M -24 -160 L 0 -120 L 24 -160" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <path d="M -6 -150 L 0 -100 L 6 -150 Z" fill={C.flagBlue} stroke={KRP.ink} strokeWidth={2} />
      <path d="M -14 -122 L -4 -64 M 14 -122 L 4 -64" stroke={C.coatWhite} strokeWidth={3} />
      <rect x={24} y={-150} width={6} height={22} rx={2} fill={C.flagBlue} stroke={KRP.ink} strokeWidth={2} />
    </L3cOn>
  </g>
);

/* 哺乳びん (横向き・乳首が +x)。原点は胴の中心 */
const L3cBottle: React.FC<{ milk?: number; glow?: number; f?: number }> = ({ milk = 0.8, glow = 0, f = 0 }) => (
  <g>
    {glow > 0 && (
      <g opacity={glow}>
        <circle r={78 + Math.sin(f / 4) * 6} fill={C.bulb} opacity={0.35} />
        <circle r={54} fill={C.bulb} opacity={0.4} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + f / 30;
          return <line key={i} x1={Math.cos(a) * 66} y1={Math.sin(a) * 66} x2={Math.cos(a) * (96 + Math.sin(f / 3 + i) * 8)} y2={Math.sin(a) * (96 + Math.sin(f / 3 + i) * 8)}
            stroke={KRP.orange} strokeWidth={5} strokeLinecap="round" />;
        })}
      </g>
    )}
    <rect x={-36} y={-17} width={64} height={34} rx={9} fill={C.glass} stroke={KRP.ink} strokeWidth={3.5} />
    <rect x={-33} y={14 - 28 * milk} width={58} height={28 * milk + 1} rx={5} fill={C.milk} />
    <path d={`M -33 ${14 - 28 * milk} Q -18 ${12 - 28 * milk} -4 ${14 - 28 * milk} T 25 ${14 - 28 * milk}`} fill="none" stroke={C.towelDark} strokeWidth={2} />
    {[-22, -10, 2, 14].map((tx) => <line key={tx} x1={tx} y1={-17} x2={tx} y2={-9} stroke={KRP.ink} strokeWidth={2.5} />)}
    <line x1={-28} y1={-10} x2={14} y2={-10} stroke={KRP.white} strokeWidth={3} opacity={0.8} strokeLinecap="round" />
    <rect x={-36} y={-17} width={64} height={34} rx={9} fill="none" stroke={KRP.ink} strokeWidth={3.5} />
    <rect x={27} y={-13} width={11} height={26} rx={3} fill={YP.brass} stroke={KRP.ink} strokeWidth={3} />
    <path d="M 38 -9 Q 56 -10 60 0 Q 56 10 38 9 Z" fill={C.nipple} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

/* 針金のお母さん (YawaE2 の L3bWireMom と同じ形。holder=胸の留め輪 / bottle=びん付き / shine=つやの位置 0..1) */
const L3cWireMom: React.FC<{ s?: number; holder?: boolean; bottle?: boolean; milk?: number; glow?: number; shine?: number; f?: number }> = ({
  s = 1, holder = false, bottle = false, milk = 0.8, glow = 0, shine = -1, f = 0,
}) => (
  <g transform={`scale(${s})`}>
    <rect x={-80} y={-24} width={160} height={24} rx={4} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
    <line x1={-70} y1={-12} x2={70} y2={-12} stroke={C.bedWoodDark} strokeWidth={2.5} opacity={0.6} />
    <rect x={-56} y={-236} width={112} height={212} rx={10} fill={C.wireDark} opacity={0.18} />
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d={`M -56 ${-36 - i * 12.5} Q 0 ${-30 - i * 12.5} 56 ${-36 - i * 12.5}`} fill="none" stroke={C.wireDark} strokeWidth={3.5} />
    ))}
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d={`M -40 ${-34.5 - i * 12.5} Q -20 ${-32 - i * 12.5} -8 ${-31.5 - i * 12.5}`} fill="none" stroke={C.wire} strokeWidth={1.6} opacity={0.9} />
    ))}
    <path d="M -56 -236 L -56 -24 M 56 -236 L 56 -24 M 0 -236 L 0 -24" stroke={C.wire} strokeWidth={4} />
    {shine >= 0 && Array.from({ length: 16 }, (_, i) => {
      const sx = -42 + 84 * shine + Math.sin(i * 0.7) * 3;
      return <line key={i} x1={sx - 7} y1={-33 - i * 12.5} x2={sx + 7} y2={-33 - i * 12.5} stroke={KRP.white} strokeWidth={3.5} strokeLinecap="round" opacity={0.95} />;
    })}
    <rect x={-56} y={-236} width={112} height={212} rx={10} fill="none" stroke={KRP.ink} strokeWidth={4} />
    <rect x={-6} y={-262} width={12} height={28} fill={C.wireDark} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-46} y={-334} width={92} height={76} rx={6} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
    <path d="M -38 -320 q 30 4 76 -2 M -40 -300 q 36 6 80 0 M -38 -272 q 30 -4 76 2" fill="none" stroke={C.bedWoodDark} strokeWidth={2} opacity={0.6} />
    {[[-38, -326], [38, -326], [-38, -266], [38, -266]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={2.6} fill={KRP.grayDark} />)}
    <circle cx={-18} cy={-302} r={7} fill={KRP.ink} />
    <circle cx={18} cy={-302} r={7} fill={KRP.ink} />
    <line x1={-12} y1={-278} x2={12} y2={-278} stroke={KRP.ink} strokeWidth={4} />
    {holder && <ellipse cx={72} cy={-170} rx={22} ry={20} fill="none" stroke={C.wireDark} strokeWidth={4} />}
    {bottle && <g transform="translate(84 -170) scale(0.8)"><L3cBottle milk={milk} glow={glow} f={f} /></g>}
    {holder && <path d="M 56 -184 Q 72 -194 84 -184 M 56 -156 Q 72 -146 84 -156" fill="none" stroke={C.wire} strokeWidth={4} strokeLinecap="round" />}
  </g>
);

/* 布のお母さん (YawaE2 の L3bClothMom と同じ形。fluff=毛羽のゆれ幅) */
const L3cClothMom: React.FC<{ s?: number; f?: number; fluff?: number; bulb?: boolean }> = ({ s = 1, f = 0, fluff = 1, bulb = true }) => (
  <g transform={`scale(${s})`}>
    <circle cx={30} cy={-150} r={70} fill={C.bulb} opacity={0.25 + Math.sin(f / 8) * 0.05} />
    {bulb && (
      <g>
        <rect x={52} y={-176} width={22} height={18} rx={3} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={82} cy={-167} r={14} fill={C.bulb} stroke={KRP.ink} strokeWidth={3} />
      </g>
    )}
    <rect x={-80} y={-24} width={160} height={24} rx={4} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
    <rect x={-62} y={-240} width={124} height={220} rx={40} fill={C.towel} stroke={KRP.ink} strokeWidth={4.5} />
    {Array.from({ length: 22 }, (_, i) => (
      <circle key={i} cx={-62 + (i % 2) * 124 + Math.sin(f / 6 + i) * 2.2 * fluff} cy={-226 + Math.floor(i / 2) * 19 + Math.cos(f / 7 + i) * 1.2 * fluff} r={6 + Math.sin(f / 5 + i * 2) * 0.8 * fluff}
        fill={C.towel} stroke={KRP.ink} strokeWidth={2.5} />
    ))}
    {Array.from({ length: 18 }, (_, i) => (
      <path key={i} d={`M ${-40 + (i % 6) * 16} ${-210 + Math.floor(i / 6) * 60} q ${5 + Math.sin(f / 6 + i) * 2 * fluff} -6 10 0`} fill="none" stroke={C.towelDark} strokeWidth={3} />
    ))}
    {Array.from({ length: 12 }, (_, i) => (
      <path key={`l${i}`} d={`M ${-48 + (i % 4) * 30} ${-186 + Math.floor(i / 4) * 60} l ${3 + Math.sin(f / 5 + i) * 2 * fluff} -7`} stroke={C.towelDark} strokeWidth={2.5} strokeLinecap="round" />
    ))}
    <circle cx={0} cy={-292} r={50} fill={C.towel} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -30 -310 q 3 -5 6 0 M 22 -318 q 3 -5 6 0 M -6 -330 q 3 -5 6 0 M 26 -270 q 3 -5 6 0" fill="none" stroke={C.towelDark} strokeWidth={2.5} />
    <circle cx={-17} cy={-298} r={9} fill={KRP.ink} />
    <circle cx={17} cy={-298} r={9} fill={KRP.ink} />
    <path d="M -10 -272 Q 0 -264 10 -272" fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M -36 -332 l -8 -18 M 36 -332 l 8 -18" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
  </g>
);

/* 子ザル: 手足 (太い線を縁取り) */
const L3cLimb: React.FC<{ d: string; w?: number; col?: string }> = ({ d, w = 20, col = C.monkey }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={KRP.ink} strokeWidth={w + 9} />
    <path d={d} stroke={col} strokeWidth={w} />
  </g>
);
const L3cPaw: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 11, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {[-0.9, 0, 0.9].map((a, i) => <circle key={i} cx={Math.sin(a) * r * 0.95} cy={-Math.cos(a) * r * 0.95} r={r * 0.42} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={2.5} />)}
    <circle r={r} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3} />
  </g>
);
/* 子ザルの頭。中心原点・半径52。★大きな丸い目 (変えない)。look=-1..1 で顔の向き */
const L3cMonkeyHead: React.FC<{ look?: number; closed?: boolean; mouth?: "smile" | "o" | "suck" }> = ({ look = 0, closed = false, mouth = "smile" }) => (
  <g>
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <circle cx={sd * 50 - look * 6} cy={-2} r={17} fill={C.monkey} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={sd * 50 - look * 6} cy={-2} r={9} fill={C.monkeyFace} />
      </g>
    ))}
    <circle r={52} fill={C.monkey} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -14 -50 q 4 -18 12 -4 q 6 -16 14 2" fill={C.monkey} stroke={KRP.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -36 -30 q 4 -6 8 0 M 28 -30 q 4 -6 8 0" fill="none" stroke={C.monkeyDark} strokeWidth={2.5} />
    <g transform={`translate(${look * 9} 0)`}>
      <path d="M -40 -6 Q -40 -34 -16 -30 Q 0 -26 16 -30 Q 40 -34 40 -6 Q 40 18 24 30 Q 0 44 -24 30 Q -40 18 -40 -6 Z" fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3} />
      <ellipse cx={-27} cy={14} rx={8} ry={5} fill={C.blush} opacity={0.55} />
      <ellipse cx={27} cy={14} rx={8} ry={5} fill={C.blush} opacity={0.55} />
      {closed ? (
        <g fill="none" stroke={KRP.ink} strokeWidth={3.5} strokeLinecap="round">
          <path d="M -26 -8 Q -15 2 -4 -8" />
          <path d="M 4 -8 Q 15 2 26 -8" />
        </g>
      ) : (
        <g>
          {[-15, 15].map((ex) => (
            <g key={ex}>
              <circle cx={ex} cy={-8} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={ex + look * 4} cy={-7} r={9.5} fill={KRP.ink} />
              <circle cx={ex + look * 4 - 3.5} cy={-11} r={3.5} fill={KRP.white} />
            </g>
          ))}
        </g>
      )}
      <circle cx={-4} cy={12} r={2.6} fill={KRP.ink} />
      <circle cx={4} cy={12} r={2.6} fill={KRP.ink} />
      {mouth === "smile" && <path d="M -8 23 Q 0 30 8 23" fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" />}
      {mouth === "o" && <ellipse cx={0} cy={25} rx={4.5} ry={5.5} fill={KRP.ink} />}
      {mouth === "suck" && <ellipse cx={-6 + look * 14} cy={23} rx={7} ry={6} fill={KRP.ink} />}
    </g>
  </g>
);
/* 座った子ザル。原点は床 (お尻の下)。高さ約210 */
const L3cMonkeySit: React.FC<{ s?: number; f: number; look?: number; mouth?: "smile" | "o" | "suck" }> = ({ s = 1, f, look = 0, mouth = "smile" }) => {
  const br = 1 + Math.sin(f / 7) * 0.015;
  return (
    <g transform={`scale(${s})`}>
      <L3cLimb d="M 30 -24 C 90 -20 124 -44 112 -92 C 106 -118 84 -116 88 -100" w={13} />
      <g transform={`translate(0 -78) scale(1 ${br}) translate(0 78)`}>
        <ellipse cx={0} cy={-78} rx={50} ry={58} fill={C.monkey} stroke={KRP.ink} strokeWidth={4.5} />
        <ellipse cx={0} cy={-68} rx={31} ry={40} fill={C.monkeyBelly} />
        <path d="M -44 -96 q 6 -4 10 2 M 36 -104 q 6 -4 10 2 M -46 -60 q 6 -4 10 2 M 38 -64 q 6 -4 10 2" fill="none" stroke={C.monkeyDark} strokeWidth={2.5} />
      </g>
      <ellipse cx={-34} cy={-28} rx={28} ry={21} fill={C.monkey} stroke={KRP.ink} strokeWidth={4} transform="rotate(-18 -34 -28)" />
      <ellipse cx={34} cy={-28} rx={28} ry={21} fill={C.monkey} stroke={KRP.ink} strokeWidth={4} transform="rotate(18 34 -28)" />
      <ellipse cx={-46} cy={-8} rx={25} ry={11} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3.5} />
      <ellipse cx={46} cy={-8} rx={25} ry={11} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3.5} />
      <L3cLimb d="M -40 -112 Q -60 -74 -26 -48" w={17} />
      <L3cLimb d="M 40 -112 Q 60 -74 26 -48" w={17} />
      <L3cPaw x={-24} y={-46} r={10} rot={150} />
      <L3cPaw x={24} y={-46} r={10} rot={-150} />
      <g transform={`translate(${look * 5} -160) rotate(${look * 9})`}>
        <L3cMonkeyHead look={look} mouth={mouth} />
      </g>
    </g>
  );
};
/* しがみつく子ザル (背中側から。腕と脚で胴をぎゅっと抱え、頭は横向きで頬をつけ、目を閉じる)。原点は胴の中心 */
const L3cMonkeyHug: React.FC<{ s?: number; f: number }> = ({ s = 1, f }) => {
  const br = 1 + Math.sin(f / 9) * 0.02;
  return (
    <g transform={`scale(${s})`}>
      <L3cLimb d="M 6 56 C 22 96 4 118 20 142" w={12} />
      <L3cLimb d="M -30 40 Q -82 40 -88 82" w={19} />
      <L3cLimb d="M 30 40 Q 82 40 88 82" w={19} />
      <L3cPaw x={-88} y={88} r={12} rot={170} />
      <L3cPaw x={88} y={88} r={12} rot={-170} />
      <g transform={`scale(${br})`}>
        <ellipse cx={0} cy={4} rx={54} ry={62} fill={C.monkey} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 0 -40 Q -4 0 0 44" fill="none" stroke={C.monkeyDark} strokeWidth={3} />
        <path d="M -34 -20 q 6 -4 10 2 M 24 -6 q 6 -4 10 2 M -30 26 q 6 -4 10 2 M 22 34 q 6 -4 10 2" fill="none" stroke={C.monkeyDark} strokeWidth={2.5} />
      </g>
      <L3cLimb d="M -36 -34 Q -80 -40 -92 -10" w={18} />
      <L3cLimb d="M 36 -34 Q 80 -40 92 -10" w={18} />
      <L3cPaw x={-94} y={-6} r={12} rot={200} />
      <L3cPaw x={94} y={-6} r={12} rot={160} />
      <g transform="translate(-6 -76) rotate(-12)">
        <L3cMonkeyHead look={-0.4} closed mouth="smile" />
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#131 【山】 用意したのは、2つの「お母さん」の人形です。
// 設計: 研究所の飼育室 (明るく清潔・タイルの壁)。2体の「お母さん」が並ぶ: 左に針金のお母さん、右に布のお母さん (見た目は上の統一どおり)。ハーロウが間に立って手で示す
// どこ: 1958年の霊長類研究所の飼育室。白いタオル壁・緑の目地帯・リノリウムの床・天井の吊り灯・ブラインドの窓・薬品棚・「PRIMATE LAB」の標識
// 演出: 木の台の上に、白い布をかぶせた2体が並ぶ。布がするりと落ちて、左に針金のお母さん・右に布のお母さんが現れる。間のハーロウが「じゃん」と両手を上げる
// 動き: カメラがゆっくり寄る。f6〜18で布が落ちて床に溜まる。f17からハーロウがばんざい、きらきらが散る
const L3cSheet: React.FC<{ x: number; base: number; top0: number; w: number; drop: number }> = ({ x, base, top0, w, drop }) => {
  if (drop >= 1) return null;
  const top = lerp(top0, base - 70, drop);
  const mid = (top + base) / 2;
  const hw = w / 2;
  return (
    <g>
      <path d={`M ${x - hw} ${base} Q ${x - hw - 14} ${mid} ${x - hw * 0.5} ${top + 40} Q ${x} ${top - 40} ${x + hw * 0.5} ${top + 40} Q ${x + hw + 14} ${mid} ${x + hw} ${base} Q ${x + hw * 0.5} ${base - 16} ${x} ${base} Q ${x - hw * 0.5} ${base + 12} ${x - hw} ${base} Z`}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <path d={`M ${x - hw * 0.4} ${top + 60} Q ${x - hw * 0.5} ${mid} ${x - hw * 0.3} ${base - 10} M ${x + hw * 0.2} ${top + 50} Q ${x + hw * 0.32} ${mid} ${x + hw * 0.18} ${base - 12}`}
        fill="none" stroke={C.coatWhite} strokeWidth={5} />
    </g>
  );
};
const Yw131: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const drop = easeInOut(seg(f, 6, 18));
  const pile = seg(f, 14, 20);
  const ta = f >= 17;
  const base = 820, ms = 1.6;
  const moms = [520, 1400];
  return (
    <Frame f={f} seed={3131} bg={C.tile}>
      <g transform={camT(960, 520, cam)}>
        {/* タイルの壁・目地帯 */}
        <L3cTiles x={-40} y={-40} w={W + 80} h={700} sz={64} fill={C.tile} line={C.tileLine} />
        <rect x={-40} y={600} width={W + 80} height={34} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={3} />
        <L3cTiles x={-40} y={634} w={W + 80} h={66} sz={33} fill={C.tileShade} line={C.tileLine} />
        <L3cLino y={700} vx={960} />
        {/* ブラインドの窓と、床に落ちる光 */}
        <rect x={60} y={170} width={250} height={300} fill={C.sky} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={66} y={178 + i * 26} width={238} height={13} fill={KRP.white} stroke={C.tileLine} strokeWidth={2} opacity={0.92} />
        ))}
        <line x1={185} y1={170} x2={185} y2={470} stroke={KRP.grayDark} strokeWidth={2} />
        <rect x={48} y={470} width={274} height={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 60 720 L 310 720 L 520 1000 L 160 1000 Z" fill={KRP.white} opacity={0.18} />
        {/* 標識と、壁のカレンダー */}
        <rect x={730} y={86} width={460} height={78} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <rect x={742} y={98} width={436} height={54} rx={6} fill="none" stroke={C.tileTrim} strokeWidth={3} />
        <text x={960} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.tileTrim}>PRIMATE LAB</text>
        <circle cx={746} cy={125} r={4} fill={KRP.grayDark} />
        <circle cx={1174} cy={125} r={4} fill={KRP.grayDark} />
        <g transform="rotate(3 1240 260)">
          <rect x={1180} y={200} width={120} height={140} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1180} y={200} width={120} height={34} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <text x={1240} y={226} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.white}>1958</text>
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={1192 + (i % 4) * 26} y={246 + Math.floor(i / 4) * 28} width={18} height={16} fill={C.tileShade} />)}
        </g>
        {/* 薬品棚 (ガラス戸・びん) */}
        <rect x={1640} y={150} width={240} height={420} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <line x1={1650} y1={290 + r * 130} x2={1870} y2={290 + r * 130} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2, 3].map((k) => (
              <g key={k}>
                <rect x={1660 + k * 52} y={230 + r * 130 - (k % 2) * 14} width={36} height={60 + (k % 2) * 14} rx={6} fill={k === 2 ? C.chalkBlue : C.glass} stroke={KRP.ink} strokeWidth={3} />
                <rect x={1664 + k * 52} y={222 + r * 130 - (k % 2) * 14} width={28} height={10} fill={KRP.grayDark} />
              </g>
            ))}
          </g>
        ))}
        <rect x={1640} y={150} width={240} height={420} fill={KRP.white} opacity={0.12} />
        <line x1={1760} y1={150} x2={1760} y2={570} stroke={KRP.ink} strokeWidth={4} />
        {/* 吊り灯と光の円錐 */}
        {moms.map((lx) => (
          <g key={lx}>
            <line x1={lx} y1={-40} x2={lx} y2={60} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 60} 110 Q ${lx} 30 ${lx + 60} 110 Z`} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={lx} cy={110} rx={24} ry={9} fill={C.bulb} stroke={KRP.ink} strokeWidth={3} />
            <path d={`M ${lx - 50} 112 L ${lx - 260} 820 L ${lx + 260} 820 L ${lx + 50} 112 Z`} fill={C.bulb} opacity={0.1 + 0.08 * drop} />
          </g>
        ))}
        {/* 低い木の台 */}
        <rect x={250} y={base - 6} width={1420} height={34} rx={6} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={250} y={base + 18} width={1420} height={10} fill={C.bedWoodDark} />
        <ellipse cx={moms[0]} cy={base + 4} rx={150} ry={14} fill={KRP.ink} opacity={0.15} />
        <ellipse cx={moms[1]} cy={base + 4} rx={150} ry={14} fill={KRP.ink} opacity={0.15} />
        {/* 2体のお母さん */}
        <g transform={`translate(${moms[0]} ${base})`}><L3cWireMom s={ms} shine={drop > 0.9 ? seg(f, 20, 40) : -1} /></g>
        <g transform={`translate(${moms[1]} ${base})`}><L3cClothMom s={ms} f={f} /></g>
        {/* かぶせた布が落ちる → 床に溜まる */}
        {moms.map((mx) => (
          <g key={mx}>
            <L3cSheet x={mx} base={base} top0={base - 590} w={250} drop={drop} />
            {pile > 0 && (
              <path d={`M ${mx - 150} ${base + 8} Q ${mx - 140} ${base - 40 * pile} ${mx - 80} ${base - 30 * pile} Q ${mx - 40} ${base - 54 * pile} ${mx} ${base - 26 * pile} Q ${mx + 50} ${base - 50 * pile} ${mx + 90} ${base - 24 * pile} Q ${mx + 140} ${base - 36 * pile} ${mx + 150} ${base + 8} Z`}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
            )}
          </g>
        ))}
        {/* 現れたきらきら */}
        {ta && moms.map((mx, j) => Array.from({ length: 5 }, (_, i) => {
          const tt = seg(f, 18 + i * 2, 34 + i * 2);
          if (tt <= 0 || tt >= 1) return null;
          const a = (i / 5) * Math.PI * 2 + j;
          const sx = mx + Math.cos(a) * (150 + tt * 60), sy = base - 330 + Math.sin(a) * (200 + tt * 50);
          const r = 18 * (1 - Math.abs(tt - 0.5) * 2);
          return <path key={`${j}-${i}`} d={`M ${sx} ${sy - r} L ${sx + r * 0.3} ${sy - r * 0.3} L ${sx + r} ${sy} L ${sx + r * 0.3} ${sy + r * 0.3} L ${sx} ${sy + r} L ${sx - r * 0.3} ${sy + r * 0.3} L ${sx - r} ${sy} L ${sx - r * 0.3} ${sy - r * 0.3} Z`}
            fill={KRP.yellow} stroke={KRP.ink} strokeWidth={2.5} />;
        }))}
        {/* ハーロウ (間に立って「こちらです」) */}
        <ellipse cx={960} cy={846} rx={110} ry={14} fill={KRP.ink} opacity={0.15} />
        <L3cHarlow x={960} y={844} s={1.45} f={f} face={ta ? "smile" : "normal"} pose={ta ? "banzai" : "stand"} gaze={ta ? [0, -2] : [-5, 0]} />
        <TagPlate x={520} y={180} text="1" size={44} t={seg(f, 20, 28)} />
        <TagPlate x={1400} y={180} text="2" size={44} t={seg(f, 23, 31)} />
      </g>
    </Frame>
  );
};

// ---- 文#132 【並】 ひとつは、針金でできたお母さん。
// 設計: 針金のお母さんに寄る。針金の巻き・冷たい灰色・木の四角い顔。f で金属のつやの光がすべる。札「針金」
// どこ: 飼育室の工作台の隅 (青白いタイル・道具の有孔ボード・針金の巻き枠とペンチの載った鋼の作業台)。冷たい蛍光灯の光
// 演出: 針金のお母さんに寄る。巻いた針金・木の四角い顔・釘。白いつやが胴を左から右へすべり、上の角できらっと光る。札「針金」がひもで下りてきて揺れる
// 動き: カメラが胴から顔へゆっくりパン (下→上)。つやが f4〜40 ですべる。巻き枠から垂れた針金の端がゆらゆら
const Yw132: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const shine = f < 4 ? 0 : ((f - 4) % 30) / 30;
  const tag = seg(f, 10, 20);
  const swing = Math.sin(f / 7) * 4 * (1 - seg(f, 20, 42) * 0.6);
  const mx = 860, mb = 948, ms = 2.25;
  return (
    <Frame f={f} seed={3132} bg={C.tileCold}>
      <g transform={camT(860, 500, 1.05, 0, lerp(40, -30, pan))}>
        <L3cTiles x={-60} y={-80} w={W + 120} h={1000} sz={90} fill={C.tileCold} line={C.tileColdLine} />
        {/* 壁の入隅 */}
        <rect x={1480} y={-80} width={520} height={1000} fill={C.tileColdLine} opacity={0.35} />
        <line x1={1480} y1={-80} x2={1480} y2={920} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        {/* 蛍光灯と冷たい光 */}
        <rect x={500} y={-60} width={720} height={34} rx={14} fill={C.cold} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 520 -26 L 260 960 L 1460 960 L 1200 -26 Z" fill={C.cold} opacity={0.35} />
        {/* 道具の有孔ボード (左) */}
        <rect x={60} y={170} width={420} height={460} fill={C.cork} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 48 }, (_, i) => <circle key={i} cx={95 + (i % 8) * 50} cy={200 + Math.floor(i / 8) * 75} r={5} fill={C.bedWoodDark} opacity={0.6} />)}
        {/* ペンチ */}
        <g transform="translate(160 310) rotate(8)">
          <path d="M -14 0 L -26 150 M 14 0 L 26 150" stroke={KRP.red} strokeWidth={16} strokeLinecap="round" />
          <path d="M -10 0 L -4 -70 M 10 0 L 4 -70" stroke={C.steelDark} strokeWidth={14} strokeLinecap="round" />
          <circle cx={0} cy={0} r={9} fill={C.steel} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 金づち */}
        <g transform="translate(300 280) rotate(-6)">
          <rect x={-8} y={0} width={16} height={190} rx={6} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-50} y={-30} width={100} height={36} rx={6} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 巻いた針金の輪 (掛けてある) */}
        <g transform="translate(410 450)">
          {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={k * 3} cy={k * 2} rx={46} ry={56} fill="none" stroke={C.wireDark} strokeWidth={4} />)}
          <line x1={0} y1={-90} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 鋼の作業台 (右) と針金の巻き枠 */}
        <rect x={1240} y={650} width={760} height={40} fill={C.steel} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1270} y={690} width={30} height={260} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <g transform="translate(1520 560)">
          <circle r={96} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
          <circle r={70} fill={C.wireDark} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 7 }, (_, k) => <circle key={k} r={22 + k * 7} fill="none" stroke={C.wire} strokeWidth={2.5} />)}
          <circle r={18} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <path d={`M 1450 600 C 1380 640 ${1370 + Math.sin(f / 8) * 14} 700 ${1350 + Math.sin(f / 8) * 20} 780`} fill="none" stroke={C.wireDark} strokeWidth={5} strokeLinecap="round" />
        {/* 切れはしの針金と釘 */}
        <path d="M 1680 640 q 30 -40 60 -10 q 30 30 70 -10" fill="none" stroke={C.wireDark} strokeWidth={5} />
        {[1800, 1830, 1858].map((nx, i) => <g key={i} transform={`rotate(${70 + i * 30} ${nx} 640)`}><line x1={nx - 24} y1={640} x2={nx + 24} y2={640} stroke={C.steelDark} strokeWidth={5} /><rect x={nx - 30} y={634} width={8} height={12} fill={C.steelDark} /></g>)}
        {/* 床 */}
        <rect x={-60} y={900} width={W + 120} height={240} fill={C.lino2} />
        <line x1={-60} y1={900} x2={W + 60} y2={900} stroke={C.linoLine} strokeWidth={6} />
        <ellipse cx={mx} cy={mb + 4} rx={220} ry={20} fill={KRP.ink} opacity={0.2} />
        {/* 主役: 針金のお母さん */}
        <g transform={`translate(${mx} ${mb})`}><L3cWireMom s={ms} shine={shine} /></g>
        {/* つやが上の角に着いたらきらっ */}
        {[0, 1].map((k) => {
          const tt = seg(f, 14 + k * 14, 30 + k * 12);
          if (tt <= 0 || tt >= 1) return null;
          const sx = mx + (k ? 110 : -110), sy = mb - 236 * ms + 30 + k * 160;
          const r = 30 * (1 - Math.abs(tt - 0.5) * 2);
          return <path key={k} d={`M ${sx} ${sy - r} L ${sx + r * 0.25} ${sy - r * 0.25} L ${sx + r} ${sy} L ${sx + r * 0.25} ${sy + r * 0.25} L ${sx} ${sy + r} L ${sx - r * 0.25} ${sy + r * 0.25} L ${sx - r} ${sy} L ${sx - r * 0.25} ${sy - r * 0.25} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />;
        })}
        {/* 札「針金」をひもで吊る */}
        <g transform={`rotate(${swing} 1180 60)`}>
          <line x1={1180} y1={60} x2={1180} y2={lerp(60, 260, easeOut(tag))} stroke={KRP.ink} strokeWidth={3} />
          <TagPlate x={1180} y={lerp(60, 300, easeOut(tag))} text="針金" size={56} t={tag} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#133 【並】 もうひとつは、針金を、柔らかい布でくるんだお母さん。
// 設計: 布のお母さんに寄る。タオル地の毛羽立ち、丸い顔、ふっくらした胴。f でタオル地がふわっと揺れる。札「布」
// どこ: 飼育室の裁縫台の前 (温かいクリームのタイル・たたんだタオルの山・糸巻き・はさみ・針山・巻き尺)。背中の電球の温かい光
// 演出: 布のお母さんに寄る。タオル地の毛羽・丸い顔・ふっくらした胴。右の古い扇風機の風で、毛羽がふわっとそよぎ、抜けた綿毛が舞う。札「布」
// 動き: カメラがゆっくり寄る。扇風機の羽が回り、風の線が左へ流れる。毛羽のゆれは f とともに大きくなる
const Yw133: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const wind = seg(f, 6, 20);
  const mx = 900, mb = 948, ms = 2.25;
  return (
    <Frame f={f} seed={3133} bg={C.tileWarm}>
      <g transform={camT(900, 520, cam)}>
        <L3cTiles x={-60} y={-60} w={W + 120} h={980} sz={80} fill={C.tileWarm} line={C.tileWarmLine} />
        {/* 電球の温かいにじみ */}
        {[420, 320, 220].map((r, i) => <circle key={i} cx={mx + 120} cy={mb - 380} r={r} fill={C.bulb} opacity={0.1 + i * 0.05 + Math.sin(f / 8) * 0.02} />)}
        {/* 裁縫台 (左) */}
        <rect x={-60} y={660} width={560} height={36} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
        <rect x={20} y={696} width={30} height={260} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={420} y={696} width={30} height={260} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* たたんだタオルの山 */}
        {[0, 1, 2, 3].map((k) => (
          <g key={k}>
            <rect x={60 + (k % 2) * 8} y={600 - k * 52} width={240} height={52} rx={22} fill={k % 2 ? C.towel : C.chalkPink} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${80 + i * 28 + (k % 2) * 8} ${620 - k * 52} q 4 -6 8 0`} fill="none" stroke={C.towelDark} strokeWidth={2.5} />)}
          </g>
        ))}
        {/* 糸巻き・針山・はさみ・巻き尺 */}
        <g transform="translate(360 610)">
          <rect x={-26} y={-6} width={52} height={14} fill={C.bedWood} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-18} y={-52} width={36} height={46} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={-18} y1={-44 + k * 11} x2={18} y2={-40 + k * 11} stroke={C.mug} strokeWidth={2} />)}
          <rect x={-26} y={-62} width={52} height={12} fill={C.bedWood} stroke={KRP.ink} strokeWidth={3} />
        </g>
        <g transform="translate(450 640)">
          <ellipse cx={0} cy={0} rx={34} ry={22} fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
          {[-16, -4, 10, 20].map((px, i) => <g key={i}><line x1={px} y1={-6} x2={px + 6} y2={-34} stroke={C.steelDark} strokeWidth={3} /><circle cx={px + 6} cy={-36} r={5} fill={[KRP.red, KRP.yellow, KRP.blue, KRP.white][i]} stroke={KRP.ink} strokeWidth={2} /></g>)}
        </g>
        <g transform="translate(200 680) rotate(-12)">
          <circle cx={-40} cy={-12} r={14} fill="none" stroke={KRP.red} strokeWidth={7} />
          <circle cx={-40} cy={12} r={14} fill="none" stroke={KRP.red} strokeWidth={7} />
          <path d="M -26 -8 L 70 4 M -26 8 L 70 -4" stroke={C.steelDark} strokeWidth={8} strokeLinecap="round" />
        </g>
        <path d="M 470 690 q 40 30 10 80 q -30 40 20 80" fill="none" stroke={KRP.yellow} strokeWidth={14} />
        <path d="M 470 690 q 40 30 10 80 q -30 40 20 80" fill="none" stroke={KRP.ink} strokeWidth={2} strokeDasharray="2 12" />
        {/* 床 */}
        <rect x={-60} y={900} width={W + 120} height={240} fill={C.shaving} />
        <line x1={-60} y1={900} x2={W + 60} y2={900} stroke={C.shavingDark} strokeWidth={6} />
        {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${rnd(3133, i) * 1960} ${920 + rnd(3134, i) * 140} q 10 -10 22 0`} fill="none" stroke={C.shavingDark} strokeWidth={3} />)}
        <ellipse cx={mx} cy={mb + 4} rx={220} ry={20} fill={KRP.ink} opacity={0.18} />
        {/* 主役: 布のお母さん (風でそよぐ) */}
        <g transform={`translate(${mx} ${mb})`}><L3cClothMom s={ms} f={f} fluff={1 + wind * 1.8} /></g>
        {/* 扇風機 (右) */}
        <g transform="translate(1560 560)">
          <rect x={-70} y={300} width={140} height={26} rx={10} fill={C.fanGreen} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-12} y={100} width={24} height={210} fill={C.fanGreen} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={30} cy={40} rx={40} ry={50} fill={C.fanGreen} stroke={KRP.ink} strokeWidth={5} />
          <g transform={`rotate(${f * 34})`}>
            {[0, 120, 240].map((a) => <ellipse key={a} cx={0} cy={-56} rx={30} ry={56} fill={KRP.white} opacity={0.85} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${a})`} />)}
          </g>
          <circle r={18} fill={C.fanGreen} stroke={KRP.ink} strokeWidth={4} />
          <circle r={124} fill="none" stroke={KRP.grayDark} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 20} y1={Math.sin(a) * 20} x2={Math.cos(a) * 124} y2={Math.sin(a) * 124} stroke={KRP.grayDark} strokeWidth={2.5} />;
          })}
        </g>
        {/* 風の線 (左へ流れる) */}
        <g opacity={wind} stroke={C.tileTrim} strokeWidth={5} fill="none" strokeLinecap="round">
          {[0, 1, 2, 3].map((k) => {
            const p = ((f * 9 + k * 70) % 280);
            return <path key={k} d={`M ${1400 - p} ${440 + k * 70} q -40 -16 -90 0 t -90 0`} opacity={1 - p / 280} />;
          })}
        </g>
        {/* 抜けて舞う綿毛 */}
        {Array.from({ length: 7 }, (_, i) => {
          const p = ((f * 4 + i * 37) % 220) * wind;
          const fx = mx - 120 - p * 1.6 + Math.sin(f / 6 + i) * 10, fy = 420 + i * 40 - p * 0.4;
          return <g key={i} opacity={wind * (1 - p / 260)}><circle cx={fx} cy={fy} r={7} fill={KRP.white} stroke={KRP.grayDark} strokeWidth={2.5} />
            <path d={`M ${fx - 9} ${fy} l -6 -4 M ${fx + 9} ${fy} l 6 -4 M ${fx} ${fy - 9} l 0 -6`} stroke={C.towelDark} strokeWidth={2} /></g>;
        })}
        <TagPlate x={1240} y={250} text="布" size={60} t={seg(f, 10, 20)} rot={-4} />
      </g>
    </Frame>
  );
};

// ---- 文#134 【並】 そして、片方にだけ、ミルクの出る哺乳びんを取りつけました。
// 設計: 針金のお母さんの胸に哺乳びんが f でカチッと取りつけられる (ハーロウの手)。ミルクのしずく。布のお母さんには何もない
// どこ: 飼育室の調乳台の前 (タイルの壁・煮沸消毒の鍋から湯気・びん立て・ミルク缶・計量カップ)
// 演出: ハーロウが哺乳びんを持って近づき、針金のお母さんの胸の留め輪に「カチッ」とはめる。衝撃線。手を放すと乳首からミルクのしずく。右奥の布のお母さんには何もついていない
// 動き: f4〜18 でハーロウ+びんが寄る → f18 でカチッ (光の線) → f24〜36 でハーロウが一歩下がる → しずくが f26 から落ち続ける。カメラは少し寄る
const Yw134: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const near = easeOut(seg(f, 6, 26));
  const snap = seg(f, 26, 36);
  const back = 0;
  const mx = 760, mb = 900, ms = 1.9;
  const bx = 919.6 + (1 - near) * 90, by = 577 + (1 - near) * -24;
  const hx = 1200 + (1 - near) * 90 + back * 70, hy = 799;
  const tip = 919.6 + 60 * 1.52;
  return (
    <Frame f={f} seed={3134} bg={C.tile}>
      <g transform={camT(900, 560, cam)}>
        <L3cTiles x={-60} y={-60} w={W + 120} h={720} sz={72} fill={C.tile} line={C.tileLine} />
        <rect x={-60} y={620} width={W + 120} height={30} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={3} />
        <L3cLino y={650} vx={900} />
        {/* 調乳台 (左奥) */}
        <rect x={-60} y={470} width={540} height={34} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-60} y={504} width={540} height={150} fill={C.steelDark} stroke={KRP.ink} strokeWidth={5} />
        {[60, 240, 400].map((dx) => <rect key={dx} x={dx} y={540} width={60} height={10} rx={4} fill={C.steel} stroke={KRP.ink} strokeWidth={2.5} />)}
        {/* 消毒鍋と湯気 */}
        <rect x={40} y={370} width={170} height={100} rx={12} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={28} y={356} width={194} height={22} rx={8} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((k) => {
          const p = ((f * 2 + k * 22) % 66) / 66;
          return <path key={k} d={`M ${90 + k * 36} ${350 - p * 160} q 16 -20 0 -40 q -16 -20 0 -40`} fill="none" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.85 * (1 - p)} />;
        })}
        {/* びん立て */}
        <rect x={260} y={440} width={190} height={30} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${296 + k * 60} 400) rotate(-90)`}><L3cBottle milk={0.3 + k * 0.25} /></g>
        ))}
        {/* ミルク缶 */}
        <g transform="translate(560 420)">
          <rect x={-56} y={0} width={112} height={230} rx={14} fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -40 0 L -30 -50 L 30 -50 L 40 0 Z" fill={C.steel} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-36} y={-70} width={72} height={24} rx={8} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-40} y={70} width={80} height={44} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <text x={0} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.blue}>MILK</text>
        </g>
        {/* 壁の棚 */}
        <rect x={1300} y={170} width={560} height={20} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
        {[1330, 1400, 1480, 1580, 1690, 1780].map((sx, i) => <rect key={i} x={sx} y={190 - 50 - (i % 3) * 16} width={50} height={50 + (i % 3) * 16} rx={6} fill={i % 2 ? C.glass : C.chalkBlue} stroke={KRP.ink} strokeWidth={3} />)}
        {/* 右奥: 布のお母さん (なにもついていない) */}
        <ellipse cx={1680} cy={866} rx={130} ry={14} fill={KRP.ink} opacity={0.15} />
        <g transform="translate(1680 860)"><L3cClothMom s={1.45} f={f} /></g>
        {/* 主役: 針金のお母さん + 胸の留め輪 */}
        <ellipse cx={mx} cy={mb + 4} rx={190} ry={18} fill={KRP.ink} opacity={0.18} />
        <g transform={`translate(${mx} ${mb})`}><L3cWireMom s={ms} holder /></g>
        {/* 哺乳びん (手に持たれて近づき、はまる) */}
        <g transform={`translate(${bx} ${by}) scale(1.52)`}><L3cBottle milk={0.85} /></g>
        {/* カチッの光の線 */}
        {snap > 0 && snap < 1 && (
          <g stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" opacity={1 - snap}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const r1 = 60 + snap * 30, r2 = 100 + snap * 50;
              return <line key={i} x1={880 + Math.cos(a) * r1} y1={577 + Math.sin(a) * r1} x2={880 + Math.cos(a) * r2} y2={577 + Math.sin(a) * r2} />;
            })}
          </g>
        )}
        {/* ミルクのしずく */}
        {f >= 30 && [0, 1].map((k) => {
          const p = (((f - 30) + k * 9) % 18) / 18;
          return <path key={k} d={`M ${tip} ${590 + p * 150} q -9 14 0 20 q 9 -6 0 -20 Z`} fill={C.milk} stroke={KRP.ink} strokeWidth={2.5} opacity={1 - p * 0.6} />;
        })}
        {/* ハーロウ */}
        <ellipse cx={hx} cy={hy + 6} rx={100} ry={12} fill={KRP.ink} opacity={0.15} />
        <L3cHarlow x={hx} y={hy} s={1.5} f={f} pose="point" pointDir={-1}
          face={snap > 0 ? "smile" : "normal"} gaze={[-6, 3]} lean={0} />
        <TagPlate x={1010} y={790} text="ミルク" size={44} t={seg(f, 30, 40)} />
      </g>
    </Frame>
  );
};

// ---- 文#135 【山】 生まれたばかりのアカゲザルの子どもは、どちらのお母さんを選んだでしょうか。
// 設計: 2体のお母さんの間に、かわいい子ザル (大きな丸い目) がちょこんと座り、左右を見比べる (首を振る動き)。`QMark`
// どこ: 子ザルの飼育ケージの中 (床に木くずの敷きわら・奥のタイル壁・壁の観察窓)。床の高さから見上げるカメラ
// 演出: 左に針金のお母さん (びん付き)、右に布のお母さん。間に生まれたての子ザルがちょこんと座り、大きな丸い目で左右を見比べる。見ている側のお母さんがふわっと明るくなる。観察窓の向こうでハーロウが記録板を手に見守る。頭の上に「？」
// 動き: 子ザルの首が左右にゆっくり振れる。カメラは子ザルへゆっくり寄る。「？」が f14 でぽんと出て揺れる
const Yw135: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const look = Math.sin((f - 2) * 0.17);
  const lw = clamp01(-look), lc = clamp01(look);
  const ms = 1.7, mb = 840;
  return (
    <Frame f={f} seed={3135} bg={C.tile}>
      <g transform={camT(960, 620, cam)}>
        <L3cTiles x={-60} y={-60} w={W + 120} h={760} sz={70} fill={C.tile} line={C.tileLine} />
        {/* 観察窓とハーロウ */}
        <rect x={760} y={70} width={400} height={240} fill={C.skyNight} opacity={0.3} />
        <L3cHarlow x={960} y={420} s={0.95} f={f} pose="hold" face="normal" gaze={[look * 5, 6]} phase={3} />
        <g transform={`rotate(-8 960 290)`}>
          <rect x={918} y={262} width={84} height={70} rx={4} fill={C.bedWood} stroke={KRP.ink} strokeWidth={3} />
          <rect x={926} y={272} width={68} height={56} fill={KRP.white} />
          {[0, 1, 2].map((k) => <line key={k} x1={932} y1={284 + k * 12} x2={980} y2={284 + k * 12} stroke={KRP.gray} strokeWidth={2.5} />)}
          <rect x={948} y={256} width={24} height={10} fill={C.steelDark} />
        </g>
        <L3cTiles x={720} y={310} w={480} h={390} sz={70} fill={C.tile} line={C.tileLine} />
        <rect x={760} y={70} width={400} height={240} fill={C.glass} opacity={0.25} />
        <path d="M 790 90 L 850 90 L 790 160 Z" fill={KRP.white} opacity={0.5} />
        <rect x={760} y={70} width={400} height={240} fill="none" stroke={C.steelDark} strokeWidth={14} />
        <rect x={748} y={306} width={424} height={16} fill={C.steel} stroke={KRP.ink} strokeWidth={4} />
        {/* ケージの金網の柱 (奥) */}
        {[60, 1860].map((px) => <rect key={px} x={px - 12} y={-60} width={24} height={780} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />)}
        <rect x={-60} y={640} width={W + 120} height={60} fill={C.tileShade} />
        {/* 床の木くず */}
        <rect x={-60} y={700} width={W + 120} height={440} fill={C.shaving} />
        <line x1={-60} y1={700} x2={W + 60} y2={700} stroke={C.shavingDark} strokeWidth={6} />
        {Array.from({ length: 70 }, (_, i) => {
          const sx = rnd(3135, i) * 1960 - 20, sy = 715 + rnd(3136, i) * 380;
          return <path key={i} d={`M ${sx} ${sy} q ${8 + rnd(3137, i) * 10} -12 ${20 + rnd(3138, i) * 12} 0`} fill="none" stroke={i % 3 ? C.shavingDark : C.bedWood} strokeWidth={3} />;
        })}
        {/* 見られている側がふわっと明るくなる */}
        <ellipse cx={500} cy={mb - 300} rx={230} ry={330} fill={C.cold} opacity={0.15 + lw * 0.45} />
        <ellipse cx={1420} cy={mb - 300} rx={230} ry={330} fill={C.bulb} opacity={0.12 + lc * 0.4} />
        {/* 2体のお母さん */}
        <ellipse cx={500} cy={mb + 4} rx={160} ry={16} fill={KRP.ink} opacity={0.18} />
        <ellipse cx={1420} cy={mb + 4} rx={160} ry={16} fill={KRP.ink} opacity={0.18} />
        <g transform={`translate(500 ${mb})`}><L3cWireMom s={ms} holder bottle milk={0.85} /></g>
        <g transform={`translate(1420 ${mb})`}><L3cClothMom s={ms} f={f} /></g>
        {/* 子ザル */}
        <ellipse cx={960} cy={816} rx={110} ry={14} fill={KRP.ink} opacity={0.2} />
        <g transform="translate(960 812)"><L3cMonkeySit s={1.35} f={f} look={look} mouth="o" /></g>
        {/* 視線の点線 */}
        <g stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" fill="none">
          <path d="M 880 600 Q 760 560 660 540" opacity={lw} />
          <path d="M 1040 600 Q 1160 560 1260 540" opacity={lc} />
        </g>
        <QMark x={960} y={470} s={1.05} f={f} t={seg(f, 14, 24)} />
        <TagPlate x={500} y={220} text="針金" size={38} t={seg(f, 4, 12)} />
        <TagPlate x={1420} y={220} text="布" size={38} t={seg(f, 6, 14)} />
      </g>
    </Frame>
  );
};

// ---- 文#136 【並】 ミルクをくれるのが、針金のお母さんのときでも。
// 設計: 針金のお母さんの哺乳びんが光って強調される (矢印)。子ザルはまだ迷っている
// どこ: 同じケージの中、針金のお母さんの胸元に寄った構図 (奥のタイル壁・金網・木くずの床)。部屋の明かりを落として、哺乳びんにだけ光が当たる
// 演出: 針金のお母さんの哺乳びんがぱっと光り、赤い矢印が上から刺さる。札「ミルク」。右では子ザルがびんを見つめつつ、体は右端の布のお母さんのほうへ傾いていて、まだ迷っている (小さな「？」)
// 動き: f6〜16 で部屋が暗くなりびんが光る (光の輪が脈打つ)。矢印が f12 でぽんと出て、びんを突くように前後する。子ザルの首が小さく行ったり来たり
const Yw136: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const dim = seg(f, 6, 16);
  const glow = seg(f, 8, 18);
  const look = -0.6 + 0.4 * Math.sin(f / 6);
  const poke = Math.sin(f / 4) * 10;
  const mx = 720, mb = 920, ms = 2.05;
  return (
    <Frame f={f} seed={3136} bg={C.tile}>
      <g transform={camT(900, 560, cam)}>
        <L3cTiles x={-60} y={-60} w={W + 120} h={760} sz={84} fill={C.tile} line={C.tileLine} />
        {[240, 1240].map((px) => <rect key={px} x={px - 12} y={-60} width={24} height={760} fill={C.steelDark} stroke={KRP.ink} strokeWidth={4} />)}
        <g stroke={C.steelDark} strokeWidth={2.5} opacity={0.5}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-60 + i * 150} y1={-60} x2={-60 + i * 150 + 300} y2={700} />)}
          {Array.from({ length: 14 }, (_, i) => <line key={`b${i}`} x1={240 + i * 150} y1={-60} x2={-60 + i * 150} y2={700} />)}
        </g>
        <rect x={-60} y={700} width={W + 120} height={440} fill={C.shaving} />
        <line x1={-60} y1={700} x2={W + 60} y2={700} stroke={C.shavingDark} strokeWidth={6} />
        {Array.from({ length: 50 }, (_, i) => <path key={i} d={`M ${rnd(3139, i) * 1960} ${715 + rnd(3140, i) * 380} q 10 -12 24 0`} fill="none" stroke={C.shavingDark} strokeWidth={3} />)}
        {/* 右端: 布のお母さん (半分見切れ) */}
        <g transform={`translate(1850 ${mb})`}><L3cClothMom s={ms} f={f} /></g>
        {/* 部屋が暗くなる (びんのまわりだけ明るい) */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={KRP.ink} opacity={0.38 * dim} />
        <circle cx={892} cy={571} r={260} fill={C.bulb} opacity={0.16 * glow} />
        {/* 主役: 針金のお母さん (びんが光る) */}
        <ellipse cx={mx} cy={mb + 4} rx={200} ry={18} fill={KRP.ink} opacity={0.2} />
        <g transform={`translate(${mx} ${mb})`}><L3cWireMom s={ms} holder bottle milk={0.85} glow={glow} f={f} /></g>
        {/* 子ザル (びんを見つめる・体は布のほうへ) */}
        <ellipse cx={1390} cy={866} rx={100} ry={12} fill={KRP.ink} opacity={0.22} />
        <g transform="translate(1390 862) rotate(5)"><L3cMonkeySit s={1.25} f={f} look={look} mouth="o" /></g>
        <QMark x={1400} y={560} s={0.75} f={f} t={seg(f, 18, 28)} />
        {/* 矢印と札 */}
        <g transform={`translate(${poke * -0.7} ${poke * 0.7})`}>
          <Arrow x={950} y={490} s={1.35} rot={135} t={seg(f, 12, 22)} />
        </g>
        <TagPlate x={1180} y={280} text="ミルク" size={52} t={seg(f, 16, 26)} />
      </g>
    </Frame>
  );
};

// ---- 文#137 【山】 子ザルは、ほとんどの時間を、布のお母さんにしがみついて過ごしました。
// 設計: ★この章の山場。子ザルが布のお母さんに全身でしがみついて (腕と脚でぎゅっと)、安心しきった顔で目を閉じる。壁の時計の針が f でぐるぐる回る (時間がたつ)。針金のお母さんはぽつんと
// どこ: 同じ飼育室を少し引いて (タイル壁・壁の丸時計・外の見える窓・木くずの床)。布のお母さんのまわりだけ電球の温かい光
// 演出: 子ザルが布のお母さんの胴に腕と脚でぎゅっとしがみつき、頬をつけて目を閉じ、安心しきって眠る。小さな「Z」がのぼる。左の奥では針金のお母さんが冷たい光の中にぽつんと立ち、床にほこりの玉がころがる
// 動き: 時計の針がぐるぐる回り、窓の外が昼→夜→昼と移り、太陽と月が弧を描く (時間がたつ)。子ザルの背中が寝息でふくらむ。カメラは抱っこへゆっくり寄る
const Yw137: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const hug = easeOut(seg(f, 2, 14));
  const day = 0.5 + 0.5 * Math.cos(f * 0.28);
  const cx = 1100, cb = 860, cs = 1.95;
  const skyCol = day > 0.5 ? C.sky : C.skyNight;
  return (
    <Frame f={f} seed={3137} bg={C.tile}>
      <g transform={camT(1040, 560, cam)}>
        <L3cTiles x={-60} y={-60} w={W + 120} h={760} sz={72} fill={C.tile} line={C.tileLine} />
        <rect x={-60} y={620} width={W + 120} height={30} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={3} />
        <rect x={-60} y={-60} width={W + 120} height={760} fill={C.skyNight} opacity={(1 - day) * 0.25} />
        {/* 窓 (昼と夜が入れかわる) */}
        <rect x={1500} y={110} width={320} height={300} fill={skyCol} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1500} y={110} width={320} height={300} fill={C.sky} opacity={day} />
        {(() => {
          const a = f * 0.28;
          const sx = 1660 + Math.sin(a) * 120, sy = 330 - Math.cos(a) * 160;
          const mxp = 1660 - Math.sin(a) * 120, myp = 330 + Math.cos(a) * 160;
          return (
            <g>
              {sy < 400 && <circle cx={sx} cy={sy} r={30} fill={C.sun} stroke={KRP.ink} strokeWidth={4} />}
              {myp < 400 && <g><circle cx={mxp} cy={myp} r={26} fill={C.moon} stroke={KRP.ink} strokeWidth={4} /><circle cx={mxp + 12} cy={myp - 8} r={22} fill={skyCol} /></g>}
            </g>
          );
        })()}
        <rect x={1500} y={340} width={320} height={70} fill={C.board2} opacity={0.7} />
        <path d="M 1500 360 q 40 -30 80 -6 q 40 -34 90 -4 q 50 -30 90 0 q 30 -14 60 4 L 1820 410 L 1500 410 Z" fill={C.tileTrim} />
        <rect x={1500} y={110} width={320} height={300} fill="none" stroke={KRP.ink} strokeWidth={6} />
        <line x1={1660} y1={110} x2={1660} y2={410} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1500} y1={260} x2={1820} y2={260} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1486} y={410} width={348} height={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 壁の丸時計 (針がぐるぐる) */}
        <g transform="translate(660 200)">
          <circle r={104} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
          <circle r={92} fill="none" stroke={C.tileTrim} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={Math.sin(a) * 74} y1={-Math.cos(a) * 74} x2={Math.sin(a) * 86} y2={-Math.cos(a) * 86} stroke={KRP.ink} strokeWidth={i % 3 ? 4 : 8} />;
          })}
          <path d="M 0 0 m -70 -40 A 80 80 0 0 1 40 -70" fill="none" stroke={C.tileLine} strokeWidth={10} opacity={0.6} transform={`rotate(${f * 40})`} />
          <line x1={0} y1={0} x2={0} y2={-46} stroke={KRP.ink} strokeWidth={10} strokeLinecap="round" transform={`rotate(${f * 3.3})`} />
          <line x1={0} y1={0} x2={0} y2={-74} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 40})`} />
          <circle r={9} fill={KRP.ink} />
        </g>
        {/* 床 */}
        <rect x={-60} y={650} width={W + 120} height={490} fill={C.shaving} />
        <line x1={-60} y1={650} x2={W + 60} y2={650} stroke={C.shavingDark} strokeWidth={6} />
        {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M ${rnd(3141, i) * 1960} ${665 + rnd(3142, i) * 420} q 10 -12 24 0`} fill="none" stroke={C.shavingDark} strokeWidth={3} />)}
        {/* 左奥: ぽつんと針金のお母さん (冷たい光) */}
        <path d="M 270 -60 L 130 860 L 530 860 L 390 -60 Z" fill={C.cold} opacity={0.4} />
        <ellipse cx={330} cy={844} rx={130} ry={14} fill={KRP.ink} opacity={0.16} />
        <g transform="translate(330 840)"><L3cWireMom s={1.45} holder bottle milk={0.85} /></g>
        {/* ころがるほこりの玉 */}
        <g transform={`translate(${560 + f * 1.6} 828) rotate(${f * 8})`}>
          <circle r={16} fill={C.tileLine} stroke={KRP.grayDark} strokeWidth={2.5} />
          <path d="M -12 -6 l -8 -4 M 10 -10 l 6 -8 M 4 12 l 4 8" stroke={KRP.grayDark} strokeWidth={2} />
        </g>
        {/* 右: 布のお母さんと温かい光 */}
        {[380, 280, 190].map((r, i) => <circle key={i} cx={cx} cy={cb - 300} r={r} fill={C.bulb} opacity={0.08 + i * 0.05} />)}
        <ellipse cx={cx} cy={cb + 4} rx={200} ry={18} fill={KRP.ink} opacity={0.18} />
        <g transform={`translate(${cx} ${cb})`}><L3cClothMom s={cs} f={f} /></g>
        {/* 主役: しがみついて眠る子ザル */}
        <g transform={`translate(${cx} ${lerp(560, 615, hug)}) scale(${lerp(0.9, 1, hug)})`}>
          <L3cMonkeyHug s={1.3} f={f} />
        </g>
        {/* 寝息の Z */}
        {[0, 1, 2].map((k) => {
          const p = ((f + k * 14) % 42) / 42;
          return <text key={k} x={cx - 210 - p * 50} y={470 - p * 140} fontFamily={FONT} fontWeight={900} fontSize={30 + k * 8}
            fill={C.flagBlue} opacity={(1 - p) * seg(f, 8, 16)}>Z</text>;
        })}
      </g>
    </Frame>
  );
};

// ---- 文#138 【山】 針金のお母さんのところへは、ミルクを飲むときだけ、行ったのです。
// 設計: 子ザルが布のお母さんに後ろ足でしがみついたまま、体を伸ばして針金のお母さんの哺乳びんからミルクを飲む (★これが有名な姿勢。描けるなら描く。難しければ、ミルクを飲んだらすぐ布のお母さんへ戻る往復を矢印で)
// どこ: 同じケージを横から見た構図 (タイル壁・吊り灯・木くずの床)。右の奥にハーロウ
// 演出: ★有名な姿勢。子ザルが後ろ足で布のお母さんにしっかりしがみついたまま、体をぐーんと伸ばして、左の針金のお母さんの哺乳びんに口をつけてミルクを飲む。両手でびんを抱える。びんのミルクがどんどん減り、泡がのぼる。ハーロウは記録板を手に驚いてから微笑む
// 動き: f2〜14 で体が布のお母さんから伸びていく。そのあとごくごく (のどの線・体のゆれ)。ミルクの水位が下がる。カメラは右から左へゆっくりパン
const Yw138: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 0, 42));
  const reach = easeOut(seg(f, 2, 14));
  const gulp = Math.sin(f / 3) * reach;
  const milk = 0.85 - 0.45 * seg(f, 12, 42);
  const wx = 640, cx = 1300, mb = 840, ms = 1.65;
  // 伸びた体: reach=0 で布のお母さん寄り、1 でびんに届く
  const dx = (1 - reach) * 150;
  return (
    <Frame f={f} seed={3138} bg={C.tile}>
      <g transform={camT(1000, 560, 1.05, lerp(40, -40, pan), 0)}>
        <L3cTiles x={-100} y={-60} w={W + 200} h={740} sz={76} fill={C.tile} line={C.tileLine} />
        <rect x={-100} y={600} width={W + 200} height={30} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={3} />
        <L3cTiles x={-100} y={630} w={W + 200} h={50} sz={38} fill={C.tileShade} line={C.tileLine} />
        {[640, 1300].map((lx) => (
          <g key={lx}>
            <line x1={lx} y1={-60} x2={lx} y2={40} stroke={KRP.ink} strokeWidth={4} />
            <path d={`M ${lx - 54} 90 Q ${lx} 16 ${lx + 54} 90 Z`} fill={C.tileTrim} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={lx} cy={90} rx={22} ry={8} fill={C.bulb} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        <path d="M 600 92 L 420 820 L 1520 820 L 1340 92 Z" fill={C.bulb} opacity={0.1} />
        {/* 床 */}
        <rect x={-100} y={680} width={W + 200} height={460} fill={C.shaving} />
        <line x1={-100} y1={680} x2={W + 100} y2={680} stroke={C.shavingDark} strokeWidth={6} />
        {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M ${rnd(3143, i) * 2000 - 40} ${695 + rnd(3144, i) * 400} q 10 -12 24 0`} fill="none" stroke={C.shavingDark} strokeWidth={3} />)}
        {/* 2体のお母さん */}
        <ellipse cx={wx} cy={mb + 4} rx={150} ry={16} fill={KRP.ink} opacity={0.18} />
        <ellipse cx={cx} cy={mb + 4} rx={150} ry={16} fill={KRP.ink} opacity={0.18} />
        <g transform={`translate(${wx} ${mb})`}><L3cWireMom s={ms} holder bottle milk={milk} /></g>
        <g transform={`translate(${cx} ${mb})`}><L3cClothMom s={ms} f={f} /></g>
        {/* 泡 */}
        {reach > 0.8 && [0, 1, 2].map((k) => {
          const p = ((f + k * 6) % 18) / 18;
          return <circle key={k} cx={790 - p * 40} cy={570 - p * 10} r={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={1.5} opacity={1 - p} />;
        })}
        {/* ★子ザル: 後ろ足は布のお母さん、体を伸ばしてびんへ */}
        <g>
          {/* 尾 */}
          <L3cLimb d="M 1090 606 C 1124 650 1110 702 1140 724" w={14} />
          {/* 奥の腕 (びんの上) */}
          <L3cLimb d={`M ${968 + dx * 0.5} 572 Q ${886 + dx} 522 ${792 + dx} 544`} w={19} />
          <L3cPaw x={790 + dx} y={542} r={12} rot={-100} />
          {/* 脚 (布のお母さんをつかむ) */}
          <L3cLimb d={`M ${1072 + dx * 0.2} 606 Q 1140 568 1206 598`} w={21} />
          <L3cLimb d={`M ${1080 + dx * 0.2} 624 Q 1150 664 1212 682`} w={21} />
          <ellipse cx={1218} cy={598} rx={22} ry={14} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-70 1218 598)" />
          <ellipse cx={1222} cy={684} rx={22} ry={14} fill={C.monkeyFace} stroke={KRP.ink} strokeWidth={3.5} transform="rotate(-70 1222 684)" />
          {/* 胴 (ぐーんと伸びる) */}
          <g transform={`translate(${1010 + dx * 0.6} ${590 + gulp * 2}) rotate(14)`}>
            <ellipse cx={0} cy={0} rx={lerp(64, 84, reach)} ry={46} fill={C.monkey} stroke={KRP.ink} strokeWidth={4.5} />
            <ellipse cx={-4} cy={18} rx={lerp(42, 58, reach)} ry={22} fill={C.monkeyBelly} />
            <path d="M -40 -30 q 6 -6 12 0 M 10 -40 q 6 -6 12 0 M 44 -26 q 6 -6 12 0" fill="none" stroke={C.monkeyDark} strokeWidth={2.5} />
          </g>
          {/* 手前の腕 (びんの下を抱える) */}
          <L3cLimb d={`M ${952 + dx * 0.6} 596 Q ${880 + dx} 620 ${806 + dx} 588`} w={19} />
          <L3cPaw x={804 + dx} y={588} r={12} rot={-70} />
          {/* 頭 (乳首をくわえる) */}
          <g transform={`translate(${897 + dx} ${540 + gulp * 1.5}) rotate(-6) scale(1.15)`}>
            <L3cMonkeyHead look={-1} mouth="suck" />
          </g>
          {/* ごくごくの線 */}
          {reach > 0.8 && [0, 1].map((k) => (
            <path key={k} d={`M ${935 + k * 14} ${612 + k * 6} q 6 ${8 + gulp * 3} 0 16`} fill="none" stroke={KRP.ink} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
          ))}
        </g>
        {/* 右奥: ハーロウ (記録板) */}
        <ellipse cx={1700} cy={854} rx={90} ry={12} fill={KRP.ink} opacity={0.15} />
        <L3cHarlow x={1700} y={850} s={1.3} f={f} pose="hold" face={f < 22 ? "surprised" : "smile"} gaze={[-8, 2]} />
        <g transform="rotate(-10 1700 690)">
          <rect x={1652} y={640} width={96} height={112} rx={5} fill={C.bedWood} stroke={KRP.ink} strokeWidth={3.5} />
          <rect x={1661} y={652} width={78} height={92} fill={KRP.white} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={1668 + k * 12} y1={668} x2={1668 + k * 12} y2={700} stroke={KRP.ink} strokeWidth={3} opacity={seg(f, 10 + k * 7, 14 + k * 7)} />)}
          <line x1={1664} y1={696} x2={1716} y2={672} stroke={KRP.ink} strokeWidth={3} opacity={seg(f, 38, 42)} />
          <rect x={1686} y={634} width={28} height={12} fill={C.steelDark} />
        </g>
        <circle cx={1688} cy={692} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1716} cy={686} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// ---- 文#139 【並】 ハーロウは、こう結論づけました。
// 設計: 研究所の机。ハーロウがタイプライターで論文を打つ。論文の題「The Nature of Love」(ラベル扱い)。コーヒーの湯気
// どこ: 夜の研究室 (窓の外は星空・コルク板に2体のお母さんの写真とグラフ・本棚)。木の机に緑の電気スタンド、コーヒー、紙の山、卓上カレンダー「1958」
// 演出: ハーロウがタイプライターで論文を打つ。紙の上に題「The Nature of Love」が1字ずつ打ち出されていく。キーを打つ手がぱたぱた、活字の腕が跳ねる。コーヒーから湯気
// 動き: f4〜36 で1字ずつ打たれ、紙がせり上がり、キャリッジが横へ進む。カメラは紙へゆっくり寄る
const Yw139: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.12 + 0.07 * easeInOut(seg(f, 0, 42));
  const title1 = "The Nature", title2 = "of Love";
  const total = title1.length + title2.length;
  const typed = Math.floor(seg(f, 4, 36) * total);
  const l1 = title1.slice(0, Math.min(typed, title1.length));
  const l2 = title2.slice(0, Math.max(0, typed - title1.length));
  const curLen = typed <= title1.length ? l1.length : l2.length;
  const car = -curLen * 9;
  const rise = typed > title1.length ? 30 : 0;
  const striking = typed < total && f >= 4 && f % 3 === 0;
  const hx = 640, hy = 840, hs = 1.65;
  const deskY = 690;
  return (
    <Frame f={f} seed={3139} bg={C.wallEve}>
      <g transform={camT(880, 420, cam)}>
        <rect x={-60} y={-60} width={W + 120} height={800} fill={C.wallEve} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 150} y1={-60} x2={i * 150} y2={deskY} stroke={C.wallEveDark} strokeWidth={4} opacity={0.4} />)}
        {/* 夜の窓 */}
        <rect x={60} y={90} width={300} height={340} fill={C.skyNight} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={80 + rnd(3145, i) * 260} cy={110 + rnd(3146, i) * 300} r={3 + (i % 2)} fill={C.moon} opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 6 + i))} />)}
        <circle cx={290} cy={160} r={34} fill={C.moon} stroke={KRP.ink} strokeWidth={4} />
        <line x1={210} y1={90} x2={210} y2={430} stroke={KRP.ink} strokeWidth={5} />
        <rect x={46} y={430} width={328} height={18} fill={C.bedWood} stroke={KRP.ink} strokeWidth={4} />
        {/* コルク板 (写真とグラフ) */}
        <rect x={1180} y={100} width={420} height={300} fill={C.cork} stroke={C.bedWoodDark} strokeWidth={10} />
        <g transform="rotate(-4 1270 230)">
          <rect x={1210} y={140} width={130} height={170} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <g transform="translate(1275 300) scale(0.42)"><L3cWireMom /></g>
          <circle cx={1275} cy={140} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
        </g>
        <g transform="rotate(5 1420 230)">
          <rect x={1360} y={146} width={130} height={170} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <g transform="translate(1425 306) scale(0.42)"><L3cClothMom f={f} /></g>
          <circle cx={1425} cy={146} r={8} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2} />
        </g>
        <rect x={1510} y={180} width={74} height={110} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1522} y={210} width={18} height={70} fill={C.chalkWarm} stroke={KRP.ink} strokeWidth={2} />
        <rect x={1552} y={262} width={18} height={18} fill={C.steel} stroke={KRP.ink} strokeWidth={2} />
        {/* 本棚 */}
        <rect x={1660} y={60} width={260} height={630} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            {Array.from({ length: 7 }, (_, k) => <rect key={k} x={1676 + k * 32} y={90 + r * 200 + (k % 3) * 10} width={28} height={170 - (k % 3) * 10} fill={[KRP.red, C.flagBlue, C.tileTrim, C.chalkWarm][(k + r) % 4]} stroke={KRP.ink} strokeWidth={3} />)}
            <rect x={1660} y={260 + r * 200} width={260} height={14} fill={C.bedWood} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* ハーロウ (机の向こう) */}
        <L3cHarlow x={hx} y={hy} s={hs} f={f} pose="hold" face="normal" gaze={[9, 6]} />
        {/* 机 */}
        <rect x={-60} y={deskY} width={W + 120} height={40} fill={C.deskTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-60} y={deskY + 40} width={W + 120} height={400} fill={C.bedWood} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((k) => <path key={k} d={`M -60 ${deskY + 90 + k * 70} q 500 ${k * 8 - 8} 1000 0 t 1000 0`} fill="none" stroke={C.bedWoodDark} strokeWidth={4} opacity={0.5} />)}
        {/* 電気スタンドの光 */}
        <path d="M 240 420 L 60 690 L 560 690 L 360 420 Z" fill={C.bulb} opacity={0.22} />
        <rect x={1120} y={770} width={420} height={110} rx={8} fill={C.bedWood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1280} y={812} width={100} height={20} rx={8} fill={YP.brass} stroke={KRP.ink} strokeWidth={4} />
        <g transform="translate(-120 0)">
          <rect x={300} y={672} width={120} height={20} rx={8} fill={C.lampGreen} stroke={KRP.ink} strokeWidth={4} />
          <line x1={360} y1={672} x2={360} y2={420} stroke={YP.brass} strokeWidth={8} />
          <path d="M 300 420 L 330 340 L 460 340 L 490 420 Z" fill={C.lampGreen} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={395} cy={420} rx={95} ry={10} fill={C.bulb} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 紙の山 */}
        {[0, 1, 2, 3].map((k) => <rect key={k} x={150 + k * 4} y={652 - k * 10} width={140} height={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${k % 2 ? 2 : -2} 220 660)`} />)}
        {/* タイプライター */}
        <g>
          <path d="M 590 700 L 610 610 L 950 610 L 970 700 Z" fill={C.typer} stroke={KRP.ink} strokeWidth={6} />
          <rect x={600} y={680} width={360} height={24} rx={6} fill={C.typerDark} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((r) => Array.from({ length: 9 - r }, (_, k) => (
            <circle key={`${r}-${k}`} cx={640 + r * 16 + k * 34} cy={672 - r * 20} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
          )))}
          {/* キャリッジ (横へ進む) */}
          <g transform={`translate(${car} 0)`}>
            <rect x={660} y={578} width={420} height={36} rx={16} fill={KRP.ink} />
            <circle cx={660} cy={596} r={20} fill={C.typerDark} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={1080} cy={596} r={20} fill={C.typerDark} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 1090 580 l 40 -30" stroke={YP.brass} strokeWidth={8} strokeLinecap="round" />
            {/* 紙 */}
            <g transform={`translate(0 ${-rise})`}>
              <rect x={860} y={340} width={210} height={250 + rise} fill={C.paper} stroke={KRP.ink} strokeWidth={4} />
              <text x={876} y={410} fontFamily="Courier New, monospace" fontWeight={700} fontSize={30} fill={KRP.ink}>{l1}</text>
              <text x={876} y={450} fontFamily="Courier New, monospace" fontWeight={700} fontSize={30} fill={KRP.ink}>{l2}</text>
              {[0, 1, 2].map((k) => <line key={k} x1={876} y1={490 + k * 22} x2={1050} y2={490 + k * 22} stroke={C.coatWhite} strokeWidth={3} />)}
            </g>
          </g>
          {/* 活字の腕が跳ねる */}
          <line x1={780} y1={620} x2={780 + (striking ? 40 : 10)} y2={striking ? 586 : 612} stroke={C.steelDark} strokeWidth={6} strokeLinecap="round" />
          {/* 打つ手 */}
          <circle cx={700} cy={640 + (f % 6 < 3 ? -8 : 0)} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={780} cy={640 + (f % 6 >= 3 ? -8 : 0)} r={15} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* コーヒーと湯気 */}
        <g transform="translate(1290 690)">
          <ellipse cx={0} cy={0} rx={70} ry={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <path d="M -44 -100 L -38 -6 Q 0 6 38 -6 L 44 -100 Z" fill={C.mug} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-100} rx={44} ry={10} fill={C.coffee} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 44 -80 q 34 4 30 30 q -4 22 -36 18" fill="none" stroke={KRP.ink} strokeWidth={14} />
          <path d="M 44 -80 q 34 4 30 30 q -4 22 -36 18" fill="none" stroke={C.mug} strokeWidth={7} />
          {[0, 1, 2].map((k) => {
            const p = ((f * 1.5 + k * 16) % 48) / 48;
            return <path key={k} d={`M ${-18 + k * 18} ${-116 - p * 130} q 14 -18 0 -36 q -14 -18 0 -36`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.8 * (1 - p)} />;
          })}
        </g>
        {/* 卓上カレンダー */}
        <g transform="translate(1500 690)">
          <path d="M -70 0 L -50 -110 L 50 -110 L 70 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-50} y={-110} width={100} height={30} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.ink}>1958</text>
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#140 【図】 触れて心地よいことは、圧倒的に大切だ。授乳は、ほとんど関係ない。
// 設計: 天秤の図 (世界=研究所の黒板にチョークで)。左の皿に「触れる心地よさ」(タオル地の絵)、右に「授乳」(哺乳びん)。左にどすんと傾く
// どこ: 研究所の大きな黒板 (木の枠・消し跡・下にチョーク受けとチョークと黒板消し・隅に「1958」)
// 演出: チョークで描いた天秤。右の皿にははじめから哺乳びん。左の皿の上からタオル地 (触れる心地よさ) が落ちてきて、どすん。天秤が左へ大きく傾き、右の哺乳びんは高く持ち上がる。チョークの粉が舞う
// 動き: f0〜12 は天秤がゆらゆら → f12〜20 でタオルが落ちる → f20 で着地・衝撃線・カメラが小さく揺れる → f20〜32 で傾き、少し弾んで止まる
const Yw140: React.FC<{ f: number }> = ({ f }) => {
  const fall = seg(f, 12, 20);
  const land = seg(f, 20, 32);
  const tilt = f < 20 ? Math.sin(f / 4) * 2 : -(16 * easeOut(land) + Math.sin(land * Math.PI * 3) * 3 * (1 - land));
  const shake = f >= 20 && f < 26 ? Math.sin(f * 5) * 6 : 0;
  const px = 960, py = 300, half = 520, hang = 230;
  const rad = (tilt * Math.PI) / 180;
  const lx = px - half * Math.cos(rad), ly = py - half * Math.sin(rad);
  const rx2 = px + half * Math.cos(rad), ry2 = py + half * Math.sin(rad);
  const lpy = ly + hang, rpy = ry2 + hang;
  const towelY = f < 20 ? lerp(-140, lpy - 40, easeInOut(fall)) : lpy - 40;
  const chalk = { fill: "none", stroke: C.chalk, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const Pan: React.FC<{ x: number; y: number; ex: number; ey: number }> = ({ x, y, ex, ey }) => (
    <g {...chalk}>
      <path d={`M ${ex} ${ey} L ${x - 130} ${y} M ${ex} ${ey} L ${x + 130} ${y}`} strokeWidth={4} />
      <path d={`M ${x - 150} ${y} Q ${x} ${y + 70} ${x + 150} ${y}`} />
      <path d={`M ${x - 150} ${y} L ${x + 150} ${y}`} strokeWidth={5} />
    </g>
  );
  return (
    <Frame f={f} seed={3140} bg={C.board2}>
      <g transform={`translate(${shake} ${shake * 0.5})`}>
        {/* 黒板と枠 */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.frameWood} />
        <rect x={40} y={50} width={W - 80} height={820} fill={C.board2} stroke={KRP.ink} strokeWidth={6} />
        {/* 消し跡 */}
        {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${200 + k * 420} ${180 + (k % 2) * 400} q 120 -60 240 0 q -120 50 -240 0`} fill={C.chalk} opacity={0.06} />)}
        <text x={1820} y={110} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={34} fill={C.chalk} opacity={0.7}>1958</text>
        {/* 隅の「抱っこ」の落書きは外した: 答えの「抱っこ」は #143 で初めて出すため (検品で修正) */}
        {/* 天秤の柱と台 */}
        <g {...chalk}>
          <path d={`M ${px} ${py} L ${px} 760 M ${px - 140} 780 L ${px + 140} 780 M ${px - 60} 760 L ${px + 60} 760 L ${px + 80} 780 M ${px - 60} 760 L ${px - 80} 780`} />
          <path d={`M ${px - 36} ${py + 40} L ${px} ${py - 6} L ${px + 36} ${py + 40} Z`} />
          <line x1={lx} y1={ly} x2={rx2} y2={ry2} strokeWidth={10} />
          <circle cx={px} cy={py} r={12} />
          <circle cx={lx} cy={ly} r={8} />
          <circle cx={rx2} cy={ry2} r={8} />
          {/* 針 */}
          <line x1={px} y1={py} x2={px + Math.sin(rad) * 110} y2={py - Math.cos(rad) * 110} strokeWidth={5} />
        </g>
        <Pan x={lx} y={lpy} ex={lx} ey={ly} />
        <Pan x={rx2} y={rpy} ex={rx2} ey={ry2} />
        {/* 右の皿: 哺乳びん (チョーク) */}
        <g transform={`translate(${rx2} ${rpy - 8})`} {...chalk}>
          <rect x={-34} y={-120} width={68} height={120} rx={16} fill={C.board2} />
          <path d="M -30 -60 L 30 -60" stroke={C.chalkBlue} />
          <path d="M -28 -40 Q 0 -30 28 -40 L 28 -12 Q 0 -4 -28 -12 Z" fill={C.chalk} opacity={0.35} stroke="none" />
          <rect x={-24} y={-142} width={48} height={22} rx={4} stroke={C.chalkWarm} />
          <path d="M -14 -142 Q -16 -184 0 -188 Q 16 -184 14 -142" stroke={C.chalkPink} />
        </g>
        {/* 左の皿: タオル地 (触れる心地よさ) が落ちてくる */}
        <g transform={`translate(${lx} ${towelY}) rotate(${f < 20 ? (1 - fall) * -14 : 0})`} {...chalk} stroke={C.chalkWarm}>
          <path d="M -120 30 Q -128 -40 -96 -70 Q 0 -96 96 -70 Q 128 -40 120 30 Q 0 46 -120 30 Z" fill={C.board2} />
          {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M ${-110 + i * 22} -78 q 6 -14 12 0`} strokeWidth={5} />)}
          {Array.from({ length: 8 }, (_, i) => <path key={`c${i}`} d={`M ${-84 + (i % 4) * 50} ${-34 + Math.floor(i / 4) * 34} q 8 -10 16 0`} strokeWidth={5} />)}
          {Array.from({ length: 6 }, (_, i) => <line key={`l${i}`} x1={-100 + i * 40} y1={34} x2={-100 + i * 40} y2={52} strokeWidth={5} />)}
        </g>
        {/* 着地の衝撃線と粉 */}
        {f >= 20 && land < 1 && (
          <g opacity={1 - land}>
            {[-1, 1].map((sd) => [0, 1, 2].map((k) => (
              <line key={`${sd}-${k}`} x1={lx + sd * (170 + k * 6)} y1={lpy - 60 + k * 30} x2={lx + sd * (230 + land * 40 + k * 10)} y2={lpy - 80 + k * 34}
                stroke={C.chalk} strokeWidth={7} strokeLinecap="round" />
            )))}
            {Array.from({ length: 8 }, (_, i) => (
              <circle key={i} cx={lx + (i - 3.5) * 40 * (0.6 + land)} cy={lpy + 20 - land * 40 - (i % 3) * 14} r={10 + land * 14} fill={C.chalk} opacity={0.35} />
            ))}
          </g>
        )}
        {/* ラベル (チョークの字) */}
        <text x={lx} y={lpy + 96} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.chalkWarm}>触れる心地よさ</text>
        <text x={rx2} y={rpy + 100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.chalk}>授乳</text>
        {/* チョーク受け */}
        <rect x={20} y={866} width={W - 40} height={34} fill={C.bedWoodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={560} y={846} width={70} height={18} rx={8} fill={C.chalk} stroke={KRP.ink} strokeWidth={3} />
        <rect x={660} y={850} width={50} height={16} rx={7} fill={C.chalkPink} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1240} y={826} width={150} height={40} rx={6} fill={C.flagBlue} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1240} y={854} width={150} height={12} fill={C.chalk} opacity={0.6} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_131: (f) => <Yw131 f={f} />,
  yw_132: (f) => <Yw132 f={f} />,
  yw_133: (f) => <Yw133 f={f} />,
  yw_134: (f) => <Yw134 f={f} />,
  yw_135: (f) => <Yw135 f={f} />,
  yw_136: (f) => <Yw136 f={f} />,
  yw_137: (f) => <Yw137 f={f} />,
  yw_138: (f) => <Yw138 f={f} />,
  yw_139: (f) => <Yw139 f={f} />,
  yw_140: (f) => <Yw140 f={f} />,
};

export const YW_E3_MOTIFS: string[] = [
  "yw_131",
  "yw_132",
  "yw_133",
  "yw_134",
  "yw_135",
  "yw_136",
  "yw_137",
  "yw_138",
  "yw_139",
  "yw_140",
];

export const yawaE3Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
