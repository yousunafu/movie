// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#72〜#81 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-3.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L2a。
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
  wallWarm: "#E6D7B8",
  wallWarmDark: "#CDB98F",
  shelf: "#8A5A34",
  shelfDark: "#5E3C22",
  scroll: "#EFE2BE",
  scrollEnd: "#C9AE74",
  marble: "#EEE9E1",
  marbleShade: "#D3CCC0",
  marbleVein: "#B4ACA0",
  groove: "#6E665C",
  toga: "#EDE6D6",
  togaShade: "#CFC4AC",
  purple: "#7B3F73",
  purpleDark: "#552A50",
  purpleLight: "#A0679A",
  gloom: "#857B90",
  stone: "#D2C8B6",
  stoneDark: "#A89D8A",
  tunic: "#B07A52",
  tunicDark: "#86583A",
  sky: "#BFDCEA",
  hedge: "#7E9F5C",
  hedgeDark: "#5C7C42",
  terracotta: "#C2673F",
  grape: "#6B3F7A",
  grapeLight: "#9467A6",
  leaf: "#6E9A4A",
  water: "#8EC3D6",
  mosaic: "#C9A67A",
  parchment: "#EBDBB0",
  parchmentDark: "#C9AF78",
  leather: "#7A3B2A",
  leatherDark: "#55261A",
  gold: "#D9B23C",
  goldDark: "#A8862A",
  flame: "#FFC24A",
  flameCore: "#FFF1B8",
  palaceWall: "#EAD9B4",
  velvet: "#A8303E",
  velvetDark: "#7A1F2B",
  royal: "#6A3E8E",
  royalDark: "#4A2A66",
  ermine: "#FBF8F0",
  silkPink: "#E9A7B8",
  silkPinkDark: "#C97F94",
  silkBlue: "#8DB6DE",
  silkBlueDark: "#5F8DBE",
  peasant: "#9B7A55",
  peasantDark: "#735A3E",
  field: "#C9B85E",
  fieldDark: "#A6963F",
  habitWhite: "#F2EFE6",
  mantle: "#2F2A28",
  mantleSoft: "#4A4340",
  student: "#5A6478",
  studentDark: "#434B5C",
  glass1: "#D35A4A",
  glass2: "#4F7FC0",
  glass3: "#E8C24E",
  glass4: "#6FA86A",
  woodDeep: "#5B3B24",
  woodMid: "#7E5532",
  redInk: "#C8321F",
  brownInk: "#4A2E1C",
} as const;
const SERIF = "'Times New Roman', 'Noto Serif', Georgia, serif";
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

type PP = React.ComponentProps<typeof Person>;

// 人 (Person) を包む。bob を外側でかけ、children に同じ座標系 (足元原点) の衣装を重ねる
const L2aFig: React.FC<{
  x: number; y: number; s?: number; f: number; phase?: number; lean?: number;
  p?: Partial<PP>; back?: React.ReactNode; children?: React.ReactNode;
}> = ({ x, y, s = 1, f, phase = 0, lean = 0, p = {}, back, children }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {back}
      <Person x={0} y={0} s={1} f={f} phase={phase} still {...p} />
      {children}
    </g>
  );
};

// トーガ (足元原点の座標)。slip で肩からずり落ちる
const L2aToga: React.FC<{ slip?: number; long?: boolean; stripe?: boolean }> = ({ slip = 0, long = true, stripe = false }) => (
  <g>
    {long && (
      <g>
        <path d="M -62 -64 L 62 -64 L 56 -12 Q 0 -4 -56 -12 Z" fill={C.toga} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
        <g stroke={C.togaShade} strokeWidth={4} strokeLinecap="round">
          <path d="M -32 -58 L -36 -18" /><path d="M 2 -60 L 0 -14" /><path d="M 34 -58 L 38 -18" />
        </g>
      </g>
    )}
    <path d="M -60 -160 L -76 -150 L -72 -62 L -56 -64 Z" fill={C.toga} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <g transform={`rotate(${-slip * 30} 60 -56)`}>
      <path d="M -60 -164 Q -34 -172 -14 -162 L 62 -94 L 62 -52 L 32 -54 L -60 -128 Z"
        fill={C.toga} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
      <g stroke={C.togaShade} strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M -46 -148 L 44 -76" /><path d="M -30 -158 L 54 -96" />
      </g>
      {stripe && <path d="M -14 -162 L 62 -94" stroke={C.purple} strokeWidth={7} strokeLinecap="round" />}
    </g>
  </g>
);

// 剃った頭頂 (トンスラ)。髪の輪 + 頭頂の肌の円
const L2aTonsure: React.FC<{ hair?: string }> = ({ hair = C.ink }) => (
  <g>
    <path d="M -63 -236 Q -66 -290 0 -293 Q 66 -290 63 -236 Q 32 -258 0 -258 Q -32 -258 -63 -236 Z" fill={hair} />
    <ellipse cx={0} cy={-279} rx={36} ry={14} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
  </g>
);

// 太鼓腹 (足元原点)
const L2aBelly: React.FC<{ rx?: number; ry?: number; fill?: string }> = ({ rx = 76, ry = 58, fill = KRP.white }) => (
  <g>
    <ellipse cx={0} cy={-104} rx={rx} ry={ry} fill={fill} stroke={C.ink} strokeWidth={5} />
    <path d="M -4 -98 q 4 6 8 0" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
    <path d={`M ${-rx * 0.6} ${-70} Q 0 ${-104 + ry + 6} ${rx * 0.6} -70`} fill="none" stroke={C.togaShade} strokeWidth={4} />
  </g>
);

// ふかふかのクッション。x,y は底の中央
const L2aCushion: React.FC<{
  x: number; y: number; w: number; h: number; color: string; dark: string;
  puff?: number; rot?: number; tassel?: string; button?: boolean;
}> = ({ x, y, w, h, color, dark, puff = 0, rot = 0, tassel = C.gold, button = true }) => {
  const a = w / 2;
  const top = -h - 14 * puff;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={4} rx={a * 0.95} ry={12} fill={C.ink} opacity={0.15} />
      <path d={`M ${-a} -4 Q 0 12 ${a} -4 Q ${a + 22} ${-h / 2} ${a - 6} ${top} Q 0 ${top - 22 - 10 * puff} ${-a + 6} ${top} Q ${-a - 22} ${-h / 2} ${-a} -4 Z`}
        fill={color} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${-a * 0.8} ${top * 0.25} Q 0 ${top * 0.1} ${a * 0.8} ${top * 0.25}`} fill="none" stroke={dark} strokeWidth={5} opacity={0.6} />
      <path d={`M ${-a * 0.6} ${top * 0.8} Q ${-a * 0.2} ${top * 0.95} ${a * 0.1} ${top * 0.85}`} fill="none" stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.45} />
      {button && (
        <g>
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <path key={r} d={`M 0 ${top / 2} l ${Math.cos((r * Math.PI) / 180) * a * 0.28} ${Math.sin((r * Math.PI) / 180) * h * 0.22}`}
              stroke={dark} strokeWidth={4} strokeLinecap="round" />
          ))}
          <circle cx={0} cy={top / 2} r={9} fill={tassel} stroke={C.ink} strokeWidth={3.5} />
        </g>
      )}
      {[[-a - 4, -6], [a + 4, -6], [-a + 8, top + 4], [a - 8, top + 4]].map(([tx, ty], i) => (
        <g key={i} transform={`translate(${tx} ${ty}) rotate(${tx < 0 ? 25 : -25})`}>
          <path d="M 0 0 L -9 22 L 9 22 Z" fill={tassel} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
          <circle cx={0} cy={0} r={6} fill={tassel} stroke={C.ink} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

// ローマの柱 (イオニア式)。y0 = 柱頭の上, y1 = 礎盤の下
const L2aColumn: React.FC<{ x: number; y0: number; y1: number; w?: number; fill?: string; shade?: string }> = ({
  x, y0, y1, w = 90, fill = C.marble, shade = C.marbleShade,
}) => (
  <g>
    <rect x={x - w / 2} y={y0 + 40} width={w} height={y1 - y0 - 76} fill={fill} stroke={C.ink} strokeWidth={6} />
    {[-0.3, -0.1, 0.1, 0.3].map((k) => (
      <line key={k} x1={x + k * w} y1={y0 + 52} x2={x + k * w} y2={y1 - 46} stroke={shade} strokeWidth={5} />
    ))}
    <rect x={x - w / 2} y={y0 + 40} width={w * 0.18} height={y1 - y0 - 76} fill={shade} opacity={0.6} />
    <rect x={x - w * 0.75} y={y0} width={w * 1.5} height={22} rx={4} fill={fill} stroke={C.ink} strokeWidth={5} />
    <path d={`M ${x - w * 0.6} ${y0 + 22} Q ${x} ${y0 + 46} ${x + w * 0.6} ${y0 + 22}`} fill={fill} stroke={C.ink} strokeWidth={5} />
    <circle cx={x - w * 0.58} cy={y0 + 30} r={13} fill={fill} stroke={C.ink} strokeWidth={4.5} />
    <circle cx={x + w * 0.58} cy={y0 + 30} r={13} fill={fill} stroke={C.ink} strokeWidth={4.5} />
    <circle cx={x - w * 0.58} cy={y0 + 30} r={4} fill={C.ink} />
    <circle cx={x + w * 0.58} cy={y0 + 30} r={4} fill={C.ink} />
    <rect x={x - w * 0.62} y={y1 - 38} width={w * 1.24} height={18} rx={6} fill={fill} stroke={C.ink} strokeWidth={5} />
    <rect x={x - w * 0.72} y={y1 - 22} width={w * 1.44} height={22} rx={4} fill={shade} stroke={C.ink} strokeWidth={5} />
  </g>
);

// ブドウの房。x,y は房のつけ根 (下に垂れる)
const L2aGrapes: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => {
  const rows = [3, 4, 3, 3, 2, 1];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M 0 -6 Q -6 -26 8 -34" fill="none" stroke={C.shelfDark} strokeWidth={5} strokeLinecap="round" />
      <path d="M 4 -24 Q 30 -40 42 -20 Q 24 -12 4 -24 Z" fill={C.leaf} stroke={C.ink} strokeWidth={3.5} />
      {rows.map((n, r) => Array.from({ length: n }, (_, i) => (
        <g key={`${r}-${i}`}>
          <circle cx={(i - (n - 1) / 2) * 19} cy={r * 16 + 4} r={11} fill={C.grape} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={(i - (n - 1) / 2) * 19 - 4} cy={r * 16} r={3} fill={C.grapeLight} />
        </g>
      )))}
    </g>
  );
};

// 手 (握りこぶし)。袖は local の +y 方向にのびる。point で人さし指を -y 方向に立てる
const L2aHand: React.FC<{
  x: number; y: number; s?: number; rot?: number; sleeve: string; sleeveDark?: string; len?: number; point?: boolean; cuff?: string;
}> = ({ x, y, s = 1, rot = 0, sleeve, sleeveDark, len = 420, point = false, cuff }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-38} y={24} width={76} height={len} rx={18} fill={sleeve} stroke={C.ink} strokeWidth={6} />
    <rect x={-38} y={24} width={18} height={len} rx={8} fill={sleeveDark ?? sleeve} opacity={0.5} />
    <rect x={-42} y={30} width={84} height={26} rx={10} fill={cuff ?? sleeveDark ?? sleeve} stroke={C.ink} strokeWidth={5} />
    {point && <rect x={-36} y={-96} width={24} height={84} rx={12} fill={KRP.white} stroke={C.ink} strokeWidth={5} transform="rotate(-8 -24 -12)" />}
    <rect x={-34} y={-28} width={68} height={60} rx={22} fill={KRP.white} stroke={C.ink} strokeWidth={5.5} />
    {[-14, 4, 20].map((kx) => <line key={kx} x1={kx} y1={-26} x2={kx} y2={-8} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />)}
    <path d="M -34 0 Q -50 -10 -40 -26 Q -22 -26 -18 -10" fill={KRP.white} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
  </g>
);

// 判読できない文字の行 (単語ごとに切れた線)
const L2aTextLines: React.FC<{
  x: number; y: number; w: number; rows: number; gap?: number; seed: number; color?: string; sw?: number; skip?: number[];
}> = ({ x, y, w, rows, gap = 36, seed, color = C.brownInk, sw = 6, skip = [] }) => (
  <g stroke={color} strokeWidth={sw} strokeLinecap="round" opacity={0.75}>
    {Array.from({ length: rows }, (_, r) => {
      if (skip.includes(r)) return null;
      const segs: React.ReactElement[] = [];
      let cx = x;
      const end = x + w * (r === rows - 1 ? 0.55 : 1);
      let k = 0;
      while (cx < end - 20) {
        const len = 22 + rnd(seed + r, k) * 70;
        const e = Math.min(cx + len, end);
        segs.push(<path key={k} d={`M ${cx} ${y + r * gap} q ${(e - cx) / 2} ${rnd(seed, r * 9 + k) * 6 - 3} ${e - cx} 0`} fill="none" />);
        cx = e + 16;
        k++;
      }
      return <g key={r}>{segs}</g>;
    })}
  </g>
);

// ろうそく (燭台つき)。x,y は台の底
const L2aCandle: React.FC<{ x: number; y: number; s?: number; f: number; h?: number }> = ({ x, y, s = 1, f, h = 120 }) => {
  const fl = 1 + Math.sin(f / 2.3) * 0.12 + Math.sin(f / 5.1) * 0.08;
  const sway = Math.sin(f / 3.7) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-h - 120} r={150} fill={C.flame} opacity={0.12 * fl} />
      <circle cx={0} cy={-h - 110} r={80} fill={C.flame} opacity={0.18 * fl} />
      <ellipse cx={0} cy={-6} rx={70} ry={16} fill={C.goldDark} stroke={C.ink} strokeWidth={5} />
      <path d="M -50 -8 Q -54 -30 -16 -36 L -12 -80 L 12 -80 L 16 -36 Q 54 -30 50 -8 Z" fill={C.gold} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={0} cy={-82} rx={34} ry={10} fill={C.gold} stroke={C.ink} strokeWidth={4.5} />
      <rect x={-20} y={-82 - h} width={40} height={h} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      <path d={`M 20 ${-82 - h + 14} q 8 22 0 40`} fill="none" stroke={C.toga} strokeWidth={8} strokeLinecap="round" />
      <line x1={0} y1={-82 - h} x2={0} y2={-82 - h - 14} stroke={C.ink} strokeWidth={4} />
      <g transform={`translate(0 ${-82 - h - 10}) scale(${1} ${fl})`}>
        <path d={`M 0 0 Q -20 -24 ${sway * 0.6} -64 Q 20 -24 0 0 Z`} fill={C.flame} stroke={C.ink} strokeWidth={3.5} />
        <path d={`M 0 -4 Q -8 -18 ${sway * 0.4} -36 Q 8 -18 0 -4 Z`} fill={C.flameCore} />
      </g>
    </g>
  );
};

// 渦巻きの線 (中心原点)
const spiralD = (r0: number, r1: number, turns: number, squash = 0.6, steps = 48) => {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const r = lerp(r0, r1, t);
    d += `${i ? "L" : "M"} ${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r * squash).toFixed(1)} `;
  }
  return d;
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#72 【山】 第4章、柔らかいと、人はダメになる。
// 設計: 章扉。古いローマの図書館 (巻物の棚が壁一面)。机の上に柔らかいクッションが1つ置かれ、そのまわりの空気がどんよりと渦を巻く。`ChapterDoor` (num=4)。題字の後ろに薄いクリームの帯
// どこ: 古代ローマの図書館。壁一面が巻物の棚 (アルマリア)、大理石の床、木の書見机
// 演出: 机の上に紫のクッションが1つ。そのまわりの空気がどんより渦を巻き、机の巻物がだらりと垂れ、学者が身を引く
// 動き: カメラがクッションへゆっくり寄る / 渦が回りながら育つ / 巻物が机の端からずり落ちて垂れる / 題字 f4〜20
const Yw072: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + 0.07 * cam;
  const gl = easeOut(seg(f, 2, 26));
  const unroll = easeOut(seg(f, 10, 38));
  const sag = Math.sin(f / 9) * 0.04;
  const cols = 8, rows = 4, cw = 245, ch = 172, sx0 = -20, sy0 = 70;
  return (
    <Frame f={f} seed={3072} bg={C.wallWarm}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={4} title="柔らかいと、人はダメになる" t={door} left={1000} top={560} />
      </>}>
      <g transform={`translate(560 620) scale(${sc}) translate(-560 -620)`}>
        <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.wallWarm} />
        {/* 天井の蛇腹 */}
        <rect x={-40} y={-10} width={W + 80} height={60} fill={C.stone} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={i * 50 - 10} y={50} width={26} height={18} fill={C.stoneDark} stroke={C.ink} strokeWidth={3.5} />
        ))}
        {/* 巻物の棚 */}
        <rect x={sx0} y={sy0} width={cols * cw + 40} height={rows * ch + 30} fill={C.shelf} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: cols * rows }, (_, k) => {
          const c = k % cols, r = Math.floor(k / cols);
          const bx = sx0 + 16 + c * cw, by = sy0 + 16 + r * ch;
          return (
            <g key={k}>
              <rect x={bx} y={by} width={cw - 20} height={ch - 20} fill={C.shelfDark} stroke={C.ink} strokeWidth={4.5} />
              {Array.from({ length: 7 }, (_, i) => {
                const row2 = i < 4 ? 0 : 1;
                const col = i < 4 ? i : i - 4 + 0.5;
                const cx = bx + 36 + col * 52;
                const cy = by + ch - 54 - row2 * 50;
                const tag = rnd(k, i) > 0.62;
                return (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r={25} fill={C.scroll} stroke={C.ink} strokeWidth={4} />
                    <circle cx={cx} cy={cy} r={10} fill="none" stroke={C.scrollEnd} strokeWidth={4} />
                    <circle cx={cx} cy={cy} r={4} fill={C.shelfDark} />
                    {tag && (
                      <g transform={`rotate(${Math.sin(f / 14 + k + i) * 5} ${cx} ${cy + 20})`}>
                        <line x1={cx} y1={cy + 20} x2={cx} y2={cy + 34} stroke={C.ink} strokeWidth={3} />
                        <rect x={cx - 9} y={cy + 32} width={18} height={24} rx={3}
                          fill={[KRP.red, C.leaf, KRP.yellow][Math.floor(rnd(i, k) * 3)]} stroke={C.ink} strokeWidth={3} />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {/* 大理石の床 */}
        <rect x={-40} y={770} width={W + 80} height={360} fill={C.marble} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={i * 160 - 200} y1={770} x2={i * 190 - 420} y2={1100} stroke={C.marbleVein} strokeWidth={5} />
        ))}
        <line x1={-40} y1={880} x2={W + 40} y2={880} stroke={C.marbleVein} strokeWidth={5} />
        <line x1={-40} y1={1010} x2={W + 40} y2={1010} stroke={C.marbleVein} strokeWidth={5} />
        {/* 書見机 */}
        <ellipse cx={570} cy={862} rx={320} ry={22} fill={C.ink} opacity={0.15} />
        {[340, 790].map((lx) => (
          <g key={lx}>
            <rect x={lx - 16} y={690} width={32} height={150} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
            <path d={`M ${lx - 28} 860 Q ${lx - 30} 834 ${lx} 836 Q ${lx + 30} 834 ${lx + 28} 860 Z`} fill={C.gold} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        <rect x={296} y={672} width={548} height={30} fill={C.shelfDark} stroke={C.ink} strokeWidth={6} />
        <rect x={282} y={640} width={576} height={34} rx={5} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        <path d="M 300 656 L 840 656" stroke={C.shelfDark} strokeWidth={4} opacity={0.6} />
        {/* 油ランプ */}
        <g transform="translate(360 642)">
          <path d="M -46 -4 Q -50 -34 0 -36 Q 40 -36 58 -20 L 74 -24 Q 76 -8 58 -6 Q 30 0 -46 -4 Z" fill={C.goldDark} stroke={C.ink} strokeWidth={5} />
          <g transform={`translate(70 -26) scale(1 ${1 + Math.sin(f / 2.5) * 0.12})`}>
            <path d="M 0 0 Q -12 -16 2 -44 Q 14 -16 0 0 Z" fill={C.flame} stroke={C.ink} strokeWidth={3.5} />
          </g>
        </g>
        {/* インク壺と葦ペン */}
        <rect x={438} y={612} width={34} height={30} rx={6} fill={C.ink} />
        <line x1={455} y1={612} x2={486} y2={560} stroke={C.scrollEnd} strokeWidth={6} strokeLinecap="round" />
        {/* だらりと垂れる巻物 (事件) */}
        <g>
          <rect x={680} y={612} width={150} height={30} rx={10} fill={C.scroll} stroke={C.ink} strokeWidth={4.5} />
          <path d={`M 830 640 Q ${862 + 10 * unroll} ${650 + 40 * unroll} ${852 + 6 * unroll} ${660 + 190 * unroll}
            L ${812 + 6 * unroll} ${660 + 190 * unroll} Q ${826 + 6 * unroll} ${650 + 40 * unroll} 800 640 Z`}
            fill={C.scroll} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
          {unroll > 0.2 && [0.35, 0.55, 0.75].map((k) => (
            <line key={k} x1={818 + 8 * unroll} y1={660 + 190 * unroll * k} x2={846 + 8 * unroll} y2={660 + 190 * unroll * k}
              stroke={C.brownInk} strokeWidth={4} opacity={0.6} />
          ))}
          <rect x={804 + 6 * unroll} y={650 + 190 * unroll} width={58} height={26} rx={12} fill={C.scrollEnd} stroke={C.ink} strokeWidth={4.5} />
        </g>
        {/* 主役: 紫のクッション */}
        <L2aCushion x={575} y={644} w={330} h={140 * (1 - sag)} color={C.purple} dark={C.purpleDark} puff={0.6 + sag * 4} />
        {/* どんよりの渦 */}
        <g opacity={0.65 * gl}>
          {[0, 120, 240].map((a, i) => (
            <g key={a} transform={`translate(575 560) rotate(${a + f * 2.4})`}>
              <path d={spiralD(70 + i * 10, 220 + 60 * gl, 1.1)} fill="none" stroke={C.gloom} strokeWidth={11}
                strokeLinecap="round" strokeDasharray="60 28" strokeDashoffset={-f * 3} />
            </g>
          ))}
          {/* 学者へのびる「だるさ」の手 */}
          <path d={`M 470 520 Q 400 ${470 + Math.sin(f / 6) * 20} 350 ${520 + Math.sin(f / 5) * 14}`} fill="none"
            stroke={C.gloom} strokeWidth={14} strokeLinecap="round" strokeDasharray="34 20" strokeDashoffset={-f * 4} />
          {Array.from({ length: 6 }, (_, i) => {
            const t = ((f / 40 + i / 6) % 1);
            return <circle key={i} cx={575 + Math.sin(i * 2 + f / 10) * 160} cy={540 - t * 220} r={14 + t * 18}
              fill={C.gloom} opacity={0.5 * (1 - t)} />;
          })}
        </g>
        {/* 身を引くローマの学者 */}
        <L2aFig x={235} y={872} s={1.05} f={f} lean={-4 - 5 * gl}
          p={{ face: gl > 0.5 ? "worried" : "normal", cloth: C.toga, clothDark: C.togaShade, hair: "none", pose: "hold", gaze: [6, 2] }}>
          <L2aToga stripe />
          <g transform="translate(0 -116)">
            <rect x={-56} y={-14} width={112} height={28} rx={12} fill={C.scroll} stroke={C.ink} strokeWidth={4.5} />
            <circle cx={-56} cy={0} r={14} fill={C.scrollEnd} stroke={C.ink} strokeWidth={4} />
            <circle cx={56} cy={0} r={14} fill={C.scrollEnd} stroke={C.ink} strokeWidth={4} />
          </g>
        </L2aFig>
        {/* 汗 */}
        {gl > 0.5 && <path d="M 322 600 q -10 18 0 24 q 10 -6 0 -24 Z" fill={KRP.blue} stroke={C.ink} strokeWidth={3} />}
      </g>
    </Frame>
  );
};

// ---- 文#73 【並】 ラテン語で「柔らかさ」は、モッリティアといいます。
// 設計: 大理石の石板にラテン語が彫られていく (文字は「MOLLITIA」だけ。ラベル扱い)。ノミと木槌を持つ石工の手。石の粉が飛ぶ。札「柔らかさ」
// どこ: ローマの石工の仕事場。石積みの壁に道具、木の作業台の上に大理石の石板 (寄り)
// 演出: 石工の両手 (ノミと木槌) が「MOLLITIA」を1文字ずつ彫っていく。石の粉が飛ぶ。札「柔らかさ」
// 動き: f6〜38 で8文字が順に彫り上がる / 木槌が打ちつける / 粉が散る / カメラがノミを追ってパン
const Yw073: React.FC<{ f: number }> = ({ f }) => {
  const word = "MOLLITIA";
  const prog = clamp01((f - 6) / 32) * 8;
  const cur = Math.min(7, Math.floor(prog));
  const lx = (i: number) => 335 + i * 150;
  const tx = lx(cur) + 30 + 30 * (prog - cur), ty = 440;
  const hit = Math.abs(Math.sin(f * 0.75));
  const panX = -(tx - 860) * 0.1;
  return (
    <Frame f={f} seed={3073} bg={C.stone}>
      <g transform={`translate(${panX} 0)`}>
        {/* 石積みの壁 */}
        <rect x={-200} y={-40} width={W + 400} height={H + 80} fill={C.stone} />
        {Array.from({ length: 7 }, (_, r) => Array.from({ length: 9 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-200 + c * 270 + (r % 2) * 135} y={-20 + r * 120} width={262} height={112} rx={8}
            fill={rnd(r, c) > 0.5 ? C.stone : C.wallWarmDark} stroke={C.stoneDark} strokeWidth={5} />
        )))}
        {/* 壁の道具 (定規・コンパス・下げ振り・のこぎり) */}
        <line x1={-100} y1={92} x2={W + 100} y2={92} stroke={C.shelfDark} strokeWidth={10} />
        <g transform="translate(150 92)">
          <path d="M 0 0 L 0 170 L 120 170 L 120 146 L 24 146 L 24 0 Z" fill={C.shelf} stroke={C.ink} strokeWidth={5} />
        </g>
        <g transform="translate(560 92)">
          <line x1={0} y1={0} x2={-50} y2={170} stroke={C.goldDark} strokeWidth={9} strokeLinecap="round" />
          <line x1={0} y1={0} x2={50} y2={170} stroke={C.goldDark} strokeWidth={9} strokeLinecap="round" />
          <circle cx={0} cy={6} r={14} fill={C.gold} stroke={C.ink} strokeWidth={4} />
        </g>
        <g transform={`translate(1240 92) rotate(${Math.sin(f / 11) * 6})`}>
          <line x1={0} y1={0} x2={0} y2={150} stroke={C.ink} strokeWidth={4} />
          <path d="M -20 150 L 20 150 L 0 196 Z" fill={C.goldDark} stroke={C.ink} strokeWidth={4.5} />
        </g>
        <g transform="translate(1560 100) rotate(8)">
          <path d="M 0 0 L 260 0 L 260 60 Q 130 90 0 60 Z" fill={KRP.silver} stroke={C.ink} strokeWidth={5} />
          <path d="M 12 60 L 24 74 L 36 60 L 48 74 L 60 60 L 72 74 L 84 60 L 96 74 L 108 60 L 120 74 L 132 60" fill="none" stroke={C.ink} strokeWidth={3.5} />
          <rect x={260} y={-6} width={70} height={60} rx={16} fill={C.shelf} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* 作業台 */}
        <rect x={120} y={756} width={1480} height={50} fill={C.shelf} stroke={C.ink} strokeWidth={7} />
        <rect x={190} y={806} width={50} height={300} fill={C.shelfDark} stroke={C.ink} strokeWidth={6} />
        <rect x={1480} y={806} width={50} height={300} fill={C.shelfDark} stroke={C.ink} strokeWidth={6} />
        {/* 主役: 大理石の石板 */}
        <g transform="rotate(-1 860 520)">
          <rect x={196} y={302} width={1328} height={420} rx={8} fill={C.marble} stroke={C.ink} strokeWidth={8} />
          <rect x={196} y={722} width={1328} height={34} fill={C.marbleShade} stroke={C.ink} strokeWidth={6} />
          <path d="M 260 360 Q 480 420 620 380 T 980 430" fill="none" stroke={C.marbleVein} strokeWidth={5} />
          <path d="M 900 660 Q 1100 600 1300 650 T 1500 610" fill="none" stroke={C.marbleVein} strokeWidth={4} />
          <path d="M 1300 330 Q 1340 420 1440 440" fill="none" stroke={C.marbleVein} strokeWidth={4} />
          <rect x={236} y={340} width={1248} height={344} rx={4} fill="none" stroke={C.groove} strokeWidth={5} />
          <rect x={244} y={348} width={1232} height={328} rx={3} fill="none" stroke={KRP.white} strokeWidth={3} />
          {/* 彫られていく文字 */}
          {word.split("").map((ch, i) => {
            const a = clamp01(prog - i);
            if (a <= 0) return null;
            return (
              <g key={i} opacity={0.35 + 0.65 * a}>
                <text x={lx(i) + 4} y={584} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={190} fill={KRP.white}>{ch}</text>
                <text x={lx(i)} y={580} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={190} fill={C.groove}>{ch}</text>
              </g>
            );
          })}
        </g>
        {/* 台の上に積もった石くず */}
        {Array.from({ length: 22 }, (_, i) => {
          if (rnd(73, i) * 8 > prog + 1) return null;
          return <circle key={i} cx={300 + rnd(i, 3) * 1100} cy={752 - rnd(i, 4) * 6} r={5 + rnd(i, 5) * 6}
            fill={C.marble} stroke={C.ink} strokeWidth={3} />;
        })}
        {/* 飛ぶ石の粉 */}
        {prog < 8.3 && Array.from({ length: 12 }, (_, i) => {
          const life = ((f + i * 2.3) % 10) / 10;
          const ang = -Math.PI * (0.15 + rnd(i, 7) * 0.7);
          return <circle key={i} cx={tx + Math.cos(ang) * life * 120} cy={ty + Math.sin(ang) * life * 90 + life * life * 120}
            r={4 + rnd(i, 8) * 6} fill={KRP.white} stroke={C.marbleVein} strokeWidth={3} opacity={1 - life} />;
        })}
        {/* ノミ (左手) */}
        <g>
          <line x1={tx} y1={ty} x2={tx + 100} y2={ty + 146} stroke={KRP.silver} strokeWidth={13} strokeLinecap="round" />
          <line x1={tx + 96} y1={ty + 140} x2={tx + 156} y2={ty + 228} stroke={C.scrollEnd} strokeWidth={22} strokeLinecap="round" />
          <path d={`M ${tx - 8} ${ty - 6} L ${tx + 10} ${ty - 10} L ${tx + 8} ${ty + 10} Z`} fill={KRP.silver} stroke={C.ink} strokeWidth={3} />
          {/* 左手は左下から伸びて柄の中ほどを握る (柄の端が見えるように) */}
          <L2aHand x={tx + 118} y={ty + 168} rot={34} sleeve={C.silkBlueDark} sleeveDark={KRP.blueDeep} len={520} />
        </g>
        {/* 木槌 (右手)。★2026-11-22 作者「動きすぎて邪魔・変な位置」→ ゆっくり (12コマに1回) 小さく振り、ノミの柄の端を打つ */}
        {(() => {
          const ph = (f % 12) / 12;
          const lift = ph < 0.75 ? Math.sin((ph / 0.75) * Math.PI / 2) : 1 - (ph - 0.75) / 0.25; // ゆっくり上げて、すばやく下ろす
          const bx = tx + 162, by = ty + 236; // ノミの柄の端
          return (
            <g transform={`rotate(${-16 * lift} ${bx + 230} ${by + 120})`}>
              <line x1={bx + 230} y1={by + 120} x2={bx + 66} y2={by + 30} stroke={C.scrollEnd} strokeWidth={18} strokeLinecap="round" />
              <g transform={`translate(${bx + 40} ${by + 16}) rotate(-62)`}>
                <rect x={-36} y={-58} width={72} height={116} rx={20} fill={KRP.floor} stroke={C.ink} strokeWidth={6} />
                <line x1={-30} y1={-26} x2={30} y2={-26} stroke={C.scrollEnd} strokeWidth={5} />
                <line x1={-30} y1={26} x2={30} y2={26} stroke={C.scrollEnd} strokeWidth={5} />
              </g>
              <L2aHand x={bx + 230} y={by + 120} rot={-60} sleeve={C.silkBlueDark} sleeveDark={KRP.blueDeep} len={520} />
            </g>
          );
        })()}
        {/* 打撃の火花線 (打った瞬間だけ) */}
        {(f % 12) / 12 > 0.92 && prog < 8.3 && [0, 1, 2].map((i) => (
          <line key={i} x1={tx + 150 + i * 18} y1={ty + 196 - i * 22} x2={tx + 178 + i * 24} y2={ty + 170 - i * 32}
            stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" />
        ))}
      </g>
      <TagPlate x={560} y={248} text="ラテン語" size={36} t={seg(f, 2, 12)} rot={-3} />
      <TagPlate x={860} y={774} text="柔らかさ" size={46} t={seg(f, 30, 40)} />
    </Frame>
  );
};

// ---- 文#74 【並】 この言葉には、もうひとつの意味がありました。
// 設計: 同じ石板が f でくるりと裏返る動きの途中。裏にもう1つの意味が隠れていることを示す `QMark`。石工が驚く
// どこ: 同じ石工の仕事場を引きで。アーチの戸口から日が差し、石材が積まれている。石板は木の回転枠に立ててある
// 演出: 彫り終えた石板が、縦の軸でくるりと裏返る途中。裏には空き札の跡と大きな「？」。石工はびっくりして万歳し、木槌を落とす
// 動き: f8〜40 で石板が 0→125度回る (f=45 で裏が半分見える) / 回転の弧線 / ？ f28〜40 / 木槌が床に落ちる
const Yw074: React.FC<{ f: number }> = ({ f }) => {
  const turn = easeInOut(seg(f, 8, 40));
  const th = (125 * turn + (f > 40 ? Math.sin((f - 40) / 3) * 3 * Math.exp(-(f - 40) / 10) : 0)) * Math.PI / 180;
  const sx = Math.cos(th);
  const cx = 880, cy = 480, hw = 380, hh = 210;
  const cam = 1.08 - 0.08 * easeOut(seg(f, 0, 30));
  const shock = seg(f, 24, 32);
  const fall = easeOut(seg(f, 26, 36));
  const thick = 36 * Math.abs(Math.sin(th));
  return (
    <Frame f={f} seed={3074} bg={C.stone}>
      <g transform={`translate(900 500) scale(${cam}) translate(-900 -500)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.wallWarm} />
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 10 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-80 + c * 220 + (r % 2) * 110} y={-30 + r * 140} width={214} height={134} rx={8}
            fill="none" stroke={C.wallWarmDark} strokeWidth={5} />
        )))}
        {/* アーチの戸口と日差し */}
        <path d="M 1580 800 L 1580 300 Q 1580 150 1730 150 Q 1880 150 1880 300 L 1880 800 Z" fill={C.sky} stroke={C.ink} strokeWidth={7} />
        <rect x={1580} y={620} width={300} height={180} fill={C.hedge} />
        <path d="M 1580 800 L 1580 300 Q 1580 150 1730 150 Q 1880 150 1880 300 L 1880 800" fill="none" stroke={C.ink} strokeWidth={7} />
        <polygon points="1580,320 1880,320 1500,840 1100,840" fill={KRP.yellow} opacity={0.14} />
        {/* 積まれた石材と壺 */}
        <rect x={60} y={620} width={230} height={180} rx={6} fill={C.marble} stroke={C.ink} strokeWidth={6} />
        <rect x={90} y={500} width={180} height={120} rx={6} fill={C.marbleShade} stroke={C.ink} strokeWidth={6} />
        <path d="M 120 540 Q 180 520 240 560" fill="none" stroke={C.marbleVein} strokeWidth={4} />
        <path d="M 330 800 Q 300 700 340 640 L 360 600 L 400 600 L 420 640 Q 460 700 430 800 Z" fill={C.terracotta} stroke={C.ink} strokeWidth={6} />
        <path d="M 340 640 Q 300 620 320 590" fill="none" stroke={C.ink} strokeWidth={6} />
        {/* 床 */}
        <rect x={-60} y={800} width={W + 120} height={340} fill={KRP.floor} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={100 + rnd(74, i) * 1700} cy={830 + rnd(i, 74) * 200} r={5 + rnd(i, 2) * 6} fill={C.marble} stroke={C.ink} strokeWidth={3} />
        ))}
        {/* 回転枠 */}
        <rect x={420} y={196} width={920} height={30} rx={6} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        <rect x={420} y={226} width={34} height={576} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        <rect x={1306} y={226} width={34} height={576} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        <rect x={560} y={760} width={640} height={40} rx={6} fill={C.shelfDark} stroke={C.ink} strokeWidth={6} />
        <rect x={cx - 10} y={226} width={20} height={46} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        <rect x={cx - 10} y={690} width={20} height={72} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
        {/* 石板 (縦軸でまわる) */}
        <rect x={cx + hw * Math.abs(sx) - 2} y={cy - hh} width={thick} height={hh * 2} fill={C.marbleShade} stroke={C.ink} strokeWidth={6} />
        <g transform={`translate(${cx} ${cy}) scale(${Math.max(Math.abs(sx), 0.02)} 1)`}>
          {sx >= 0 ? (
            <g>
              <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={8} fill={C.marble} stroke={C.ink} strokeWidth={8} />
              <rect x={-hw + 30} y={-hh + 30} width={hw * 2 - 60} height={hh * 2 - 60} fill="none" stroke={C.groove} strokeWidth={5} />
              <path d={`M ${-hw + 40} -120 Q -100 -60 120 -110`} fill="none" stroke={C.marbleVein} strokeWidth={5} />
              <text x={4} y={44} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={116} fill={KRP.white}>MOLLITIA</text>
              <text x={0} y={40} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={116} fill={C.groove}>MOLLITIA</text>
            </g>
          ) : (
            <g>
              <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={8} fill={C.marbleShade} stroke={C.ink} strokeWidth={8} />
              {Array.from({ length: 24 }, (_, i) => (
                <line key={i} x1={-hw + 30 + rnd(i, 1) * (hw * 2 - 60)} y1={-hh + 20 + rnd(i, 2) * (hh * 2 - 40)}
                  x2={-hw + 50 + rnd(i, 1) * (hw * 2 - 60)} y2={-hh + 28 + rnd(i, 2) * (hh * 2 - 40)}
                  stroke={C.marbleVein} strokeWidth={4} strokeLinecap="round" />
              ))}
              {[-190, 190].map((px) => (
                <rect key={px} x={px - 140} y={-60} width={280} height={120} rx={12} fill={C.marble} opacity={0.7}
                  stroke={C.groove} strokeWidth={5} strokeDasharray="16 12" />
              ))}
            </g>
          )}
        </g>
        {/* 回転の弧線 */}
        <g opacity={turn > 0.05 && turn < 1 ? 0.9 : 0.4} fill="none" stroke={KRP.red} strokeWidth={8} strokeLinecap="round">
          <path d={`M ${cx - 300} 180 Q ${cx} 120 ${cx + 300} 180`} strokeDasharray="30 18" strokeDashoffset={-f * 4} />
          <polygon points={`${cx + 300},180 ${cx + 262},150 ${cx + 268},192`} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <path d={`M ${cx + 300} 780 Q ${cx} 830 ${cx - 300} 780`} strokeDasharray="30 18" strokeDashoffset={-f * 4} />
        </g>
        {/* 落ちた木槌とノミ */}
        <g transform={`translate(${1420 - 40 * fall} ${560 + 230 * fall}) rotate(${-60 + 150 * fall})`}>
          <line x1={0} y1={0} x2={0} y2={110} stroke={C.shelf} strokeWidth={16} strokeLinecap="round" />
          <rect x={-56} y={-36} width={112} height={60} rx={20} fill={C.woodMid} stroke={C.ink} strokeWidth={6} />
        </g>
        <line x1={1240} y1={812} x2={1350} y2={826} stroke={KRP.grayDark} strokeWidth={14} strokeLinecap="round" />
        {/* びっくりする石工 */}
        <L2aFig x={1560} y={838} s={1.1} f={f} lean={-8 * shock}
          p={{ face: shock > 0.3 ? "surprised" : "normal", pose: shock > 0.3 ? "banzai" : "stand", cloth: C.tunic, clothDark: C.tunicDark, hair: "cap", gaze: [-6, 0] }} />
        {shock > 0.3 && [0, 1, 2].map((i) => (
          <line key={i} x1={1490 + i * 70} y1={470 - (i === 1 ? 20 : 0)} x2={1470 + i * 80} y2={420 - (i === 1 ? 30 : 0)}
            stroke={KRP.red} strokeWidth={8} strokeLinecap="round" />
        ))}
      </g>
      {sx < 0 && <QMark x={cx} y={560} s={1.7} f={f} t={seg(f, 28, 40)} />}
    </Frame>
  );
};

// ---- 文#75 【山】 「軟弱」、そして「だらしなさ」です。
// 設計: 石板の裏に「軟弱」「だらしなさ」の札。その前で、クッションに寝そべってブドウを食べるだらしないローマ人 (Person、トーガがはだけている) が描かれる。周りの人が眉をひそめる
// どこ: ローマの邸宅の中庭 (列柱・瓦屋根・ブドウ棚・生け垣)。奥の台座に、裏返った石板
// 演出: 石板の裏に札「軟弱」「だらしなさ」。その前の寝椅子で、トーガのはだけた男がクッションに寝そべりブドウを口へ。左右の2人が眉をひそめる
// 動き: カメラが石板の札から引いて男を見せる (f0〜26) / トーガがずり落ちる / ブドウの粒が口へ落ちる (f22〜40) / 右の人が指さし怒る
const Yw075: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.18 - 0.18 * easeInOut(seg(f, 0, 26));
  const slip = easeOut(seg(f, 6, 36));
  const drop = easeInOut(seg(f, 22, 40));
  const frown = seg(f, 20, 30);
  const ox = 1110, oy = 700, ls = 1.15;
  const gx0 = 992, gy0 = 566, gx1 = 905, gy1 = 640;
  return (
    <Frame f={f} seed={3075} bg={C.sky}>
      <g transform={`translate(960 300) scale(${cam}) translate(-960 -300)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.sky} />
        <ellipse cx={300} cy={180} rx={160} ry={40} fill={KRP.white} opacity={0.7} />
        <ellipse cx={1650} cy={220} rx={190} ry={44} fill={KRP.white} opacity={0.6} />
        {/* 奥の壁と生け垣 */}
        <rect x={-60} y={380} width={W + 120} height={420} fill={C.wallWarm} stroke={C.ink} strokeWidth={6} />
        <rect x={-60} y={380} width={W + 120} height={40} fill={C.terracotta} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx={i * 180 - 40} cy={640} rx={120} ry={90} fill={i % 2 ? C.hedge : C.hedgeDark} stroke={C.ink} strokeWidth={5} />
        ))}
        {/* 瓦屋根とブドウ棚 */}
        <rect x={-60} y={-20} width={W + 120} height={80} fill={C.terracotta} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M ${i * 70 - 40} 60 q 35 24 70 0`} fill="none" stroke={C.ink} strokeWidth={4} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 15 + i) * 4} ${i * 150} 70)`}>
            <path d={`M ${i * 150} 66 q 10 40 -6 ${60 + rnd(i, 1) * 40}`} fill="none" stroke={C.hedgeDark} strokeWidth={5} />
            <path d={`M ${i * 150 - 6} ${110 + rnd(i, 1) * 30} q -30 -6 -34 24 q 28 6 34 -24 Z`} fill={C.leaf} stroke={C.ink} strokeWidth={3.5} />
            {i % 3 === 1 && <L2aGrapes x={i * 150 + 10} y={120 + rnd(i, 1) * 30} s={0.7} />}
          </g>
        ))}
        {/* 列柱 */}
        {[110, 1810].map((x) => <L2aColumn key={x} x={x} y0={60} y1={820} w={100} />)}
        {/* 石板の台座と、裏返った石板 */}
        <rect x={600} y={428} width={720} height={48} fill={C.stone} stroke={C.ink} strokeWidth={6} />
        <rect x={560} y={110} width={800} height={320} rx={8} fill={C.marbleShade} stroke={C.ink} strokeWidth={8} />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={590 + rnd(i, 5) * 740} y1={130 + rnd(i, 6) * 280} x2={610 + rnd(i, 5) * 740} y2={138 + rnd(i, 6) * 280}
            stroke={C.marbleVein} strokeWidth={4} strokeLinecap="round" />
        ))}
        <TagPlate x={765} y={272} text="軟弱" size={72} t={seg(f, 3, 13)} rot={-2} />
        <TagPlate x={1130} y={272} text="だらしなさ" size={56} t={seg(f, 9, 19)} rot={2} />
        {/* 床のモザイク */}
        <rect x={-60} y={800} width={W + 120} height={340} fill={C.mosaic} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 26 }, (_, i) => (
          <path key={i} d={`M ${i * 80 - 40} 840 q 20 -22 40 0 q 20 22 40 0`} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
        ))}
        {/* 果物の台 */}
        <rect x={1290} y={640} width={160} height={20} rx={6} fill={C.shelf} stroke={C.ink} strokeWidth={5} />
        <rect x={1360} y={660} width={20} height={150} fill={C.shelfDark} stroke={C.ink} strokeWidth={5} />
        <path d="M 1300 640 Q 1370 690 1440 640 Z" fill={C.gold} stroke={C.ink} strokeWidth={5} />
        <circle cx={1340} cy={626} r={22} fill={C.grape} stroke={C.ink} strokeWidth={4} />
        <circle cx={1384} cy={622} r={24} fill={KRP.orange} stroke={C.ink} strokeWidth={4} />
        <circle cx={1414} cy={630} r={18} fill={C.leaf} stroke={C.ink} strokeWidth={4} />
        {/* 寝椅子 */}
        <ellipse cx={1000} cy={826} rx={290} ry={20} fill={C.ink} opacity={0.15} />
        {[780, 1220].map((lx) => (
          <path key={lx} d={`M ${lx - 14} 760 L ${lx + 14} 760 L ${lx + 8} 820 L ${lx - 8} 820 Z`} fill={C.gold} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={740} y={724} width={520} height={44} rx={14} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        <path d="M 740 730 Q 700 640 760 620 Q 800 640 780 726 Z" fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        <rect x={750} y={706} width={500} height={30} rx={14} fill={C.purpleLight} stroke={C.ink} strokeWidth={5} />
        <L2aCushion x={830} y={714} w={190} h={90} color={C.purple} dark={C.purpleDark} puff={0.3} rot={-8} />
        {/* 寝そべる男 */}
        <g transform={`translate(${ox} ${oy}) rotate(-75) scale(${ls})`}>
          <L2aFig x={0} y={0} f={f} p={{ face: "joy", cloth: KRP.white, clothDark: C.togaShade, hair: "cap", pose: "point" }}>
            <L2aBelly />
            <L2aToga slip={slip} stripe />
          </L2aFig>
        </g>
        <L2aGrapes x={992} y={482} s={1.05} rot={Math.sin(f / 8) * 6} />
        {/* 口へ落ちる1粒 */}
        <circle cx={lerp(gx0, gx1, drop)} cy={lerp(gy0, gy1, drop) - Math.sin(drop * Math.PI) * 40} r={13}
          fill={C.grape} stroke={C.ink} strokeWidth={4} />
        {/* 眉をひそめる2人 */}
        <L2aFig x={300} y={842} s={1.0} f={f} phase={2} lean={-3}
          p={{ face: frown > 0.4 ? "angry" : "worried", cloth: C.toga, clothDark: C.togaShade, hair: "none", pose: "armsFolded", gaze: [7, 2] }}>
          <L2aToga />
        </L2aFig>
        <L2aFig x={1630} y={842} s={1.0} f={f} phase={5} lean={4 * frown}
          p={{ face: "angry", cloth: C.toga, clothDark: C.togaShade, hair: "cap", pose: frown > 0.3 ? "point" : "stand", pointDir: -1, gaze: [-7, 2] }}>
          <L2aToga stripe />
        </L2aFig>
        {/* むっとした印 */}
        {frown > 0.3 && [[360, 548], [1690, 548]].map(([vx, vy], i) => (
          <g key={i} transform={`translate(${vx} ${vy}) scale(${pop(frown)})`} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" fill="none">
            <path d="M -18 -6 Q -6 -6 -6 -18" /><path d="M 6 -18 Q 6 -6 18 -6" />
            <path d="M 18 6 Q 6 6 6 18" /><path d="M -6 18 Q -6 6 -18 6" />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#76 【山】 ローマの文人たちは、この言葉を、たるんだ人をけなすときに使いました。
// 設計: ローマの公衆浴場の脇の柱廊。トーガの文人2人が、寝椅子でごろごろする太った男を指さして (pose="point") ひそひそ。文人の吹き出しには「mollis!」とだけ (ラベル扱い)
// どこ: ローマの公衆浴場 (THERMAE) の脇の柱廊。奥にアーチ窓から湯気、湯船の青、床はモザイク
// 演出: 左のトーガの文人2人がひそひそ。1人が指さして「mollis!」。右の寝椅子では太った男がクッションの上でごろごろ、気づかずご満悦
// 動き: カメラが右から左へパン (f0〜30) / 男が左右に転がる / 湯気が立つ / 吹き出し f14〜24 / ひそひそ線
const Yw076: React.FC<{ f: number }> = ({ f }) => {
  const pan = 70 * (1 - easeInOut(seg(f, 0, 30)));
  const bub = seg(f, 14, 24);
  const rock = Math.sin(f / 7) * 4;
  const ox = 1590, oy = 704, ls = 1.2;
  return (
    <Frame f={f} seed={3076} bg={C.wallWarm}>
      <g transform={`translate(${-pan} 0)`}>
        <rect x={-100} y={-60} width={W + 200} height={H + 120} fill={C.wallWarm} />
        {/* 浴場の建物 (奥) */}
        {[300, 760, 1220, 1680].map((ax, i) => (
          <g key={ax}>
            <path d={`M ${ax - 130} 640 L ${ax - 130} 360 Q ${ax - 130} 230 ${ax} 230 Q ${ax + 130} 230 ${ax + 130} 360 L ${ax + 130} 640 Z`}
              fill={C.water} stroke={C.ink} strokeWidth={6} />
            <path d={`M ${ax - 130} 560 Q ${ax} 540 ${ax + 130} 560 L ${ax + 130} 640 L ${ax - 130} 640 Z`} fill={KRP.blueDeep} opacity={0.5} />
            {Array.from({ length: 3 }, (_, k) => {
              const t = ((f / 50 + k / 3 + i * 0.2) % 1);
              return <path key={k} d={`M ${ax - 40 + k * 40} ${520 - t * 260} q -20 -30 0 -60 q 20 -30 0 -60`}
                fill="none" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.8 * Math.sin(t * Math.PI)} />;
            })}
          </g>
        ))}
        {/* 軒と碑文 */}
        <rect x={-100} y={-10} width={W + 200} height={150} fill={C.marble} stroke={C.ink} strokeWidth={7} />
        <rect x={-100} y={140} width={W + 200} height={26} fill={C.marbleShade} stroke={C.ink} strokeWidth={5} />
        <rect x={660} y={30} width={600} height={90} rx={6} fill={C.marbleShade} stroke={C.ink} strokeWidth={5} />
        <text x={960} y={98} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={74} fill={C.groove} letterSpacing={10}>THERMAE</text>
        {/* 柱廊の柱 */}
        {[60, 530, 990, 1450, 1910].map((x) => <L2aColumn key={x} x={x} y0={166} y1={800} w={86} />)}
        {/* 床のモザイク */}
        <rect x={-100} y={800} width={W + 200} height={340} fill={C.mosaic} stroke={C.ink} strokeWidth={6} />
        <rect x={-100} y={826} width={W + 200} height={30} fill={KRP.blueDeep} opacity={0.6} />
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={i * 72 - 80} y={880} width={28} height={28} fill={i % 2 ? C.terracotta : KRP.white} stroke={C.ink} strokeWidth={3} transform={`rotate(45 ${i * 72 - 66} 894)`} />
        ))}
        {/* 寝椅子 */}
        <ellipse cx={1440} cy={828} rx={300} ry={20} fill={C.ink} opacity={0.15} />
        {[1190, 1690].map((lx) => (
          <path key={lx} d={`M ${lx - 14} 770 L ${lx + 14} 770 L ${lx + 8} 822 L ${lx - 8} 822 Z`} fill={C.gold} stroke={C.ink} strokeWidth={5} />
        ))}
        <rect x={1150} y={730} width={580} height={46} rx={14} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        <path d="M 1150 740 Q 1110 640 1170 622 Q 1210 640 1190 734 Z" fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        <rect x={1160} y={712} width={560} height={30} rx={14} fill={C.velvet} stroke={C.ink} strokeWidth={5} />
        <L2aCushion x={1250} y={722} w={210} h={96} color={C.velvet} dark={C.velvetDark} puff={0.4 + Math.sin(f / 7) * 0.2} rot={-6} />
        {/* ごろごろする太った男 */}
        <g transform={`translate(${ox} ${oy}) rotate(${-78 + rock}) scale(${ls})`}>
          <L2aFig x={0} y={0} f={f} phase={3} p={{ face: "joy", cloth: C.toga, clothDark: C.togaShade, hair: "cap", pose: "hold" }}>
            <L2aBelly rx={88} ry={64} fill={C.toga} />
            <L2aToga slip={0.5} long />
          </L2aFig>
        </g>
        {/* 転がる動きの線 */}
        {[0, 1].map((i) => (
          <path key={i} d={`M ${1260 + i * 380} ${560 - i * 20} q ${rock * 6} -24 ${30 + rock * 4} -40`} fill="none"
            stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        ))}
        {/* 小卓の酒杯 */}
        <rect x={1760} y={660} width={120} height={18} rx={6} fill={C.shelf} stroke={C.ink} strokeWidth={5} />
        <rect x={1810} y={678} width={18} height={140} fill={C.shelfDark} stroke={C.ink} strokeWidth={5} />
        <path d="M 1790 610 L 1850 610 Q 1846 650 1820 652 Q 1794 650 1790 610 Z" fill={C.gold} stroke={C.ink} strokeWidth={5} />
        <line x1={1820} y1={652} x2={1820} y2={660} stroke={C.ink} strokeWidth={6} />
        {/* ひそひそ話す文人2人 */}
        <L2aFig x={360} y={850} s={1.0} f={f} phase={1} lean={9}
          p={{ face: "smile", cloth: C.toga, clothDark: C.togaShade, hair: "none", pose: "stand", gaze: [8, 0] }}>
          <L2aToga />
        </L2aFig>
        <L2aFig x={610} y={850} s={1.0} f={f} phase={4} lean={-2}
          p={{ face: "angry", cloth: C.toga, clothDark: C.togaShade, hair: "cap", pose: "point", pointDir: 1, gaze: [8, 2] }}>
          <L2aToga stripe />
        </L2aFig>
        {/* ひそひそ線 */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${494 + i * 8} ${604 + i * 16} q 12 ${-6 + Math.sin(f / 3 + i) * 4} 24 0`} fill="none"
            stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        ))}
        {/* 吹き出し */}
        <g transform={`translate(700 330) scale(${pop(bub)})`}>
          <path d="M -150 -64 Q -150 -90 -124 -90 L 124 -90 Q 150 -90 150 -64 L 150 50 Q 150 76 124 76 L -40 76 L -80 130 L -76 76 L -124 76 Q -150 76 -150 50 Z"
            fill={KRP.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <text x={0} y={18} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize={72} fill={KRP.red}>mollis!</text>
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#77 【並】 聖書にも、こんな一節があります。
// 設計: 修道院の写字室。机の上に大きく開いた手書きの聖書 (飾り文字・金の装飾)。ろうそくの火が揺れ、ページがf でめくれる
// どこ: 中世の修道院の写字室。石の壁、アーチ窓からの斜めの光、棚に写本とインク壺。斜めの書見台に大きな手書きの聖書
// 演出: ページが1枚めくれ、金の飾り文字のページが現れる。その一節が金色に光り、修道士の手が指でさす
// 動き: ろうそくの火が揺れる / ページが f8〜34 でめくれる / 一節の光 f30〜40 / 指さす手が下から入る f32〜42 / カメラが少し寄る
const Yw077: React.FC<{ f: number }> = ({ f }) => {
  const p = easeInOut(seg(f, 8, 34));
  const th = Math.PI * p;
  const ex = 960 + 600 * Math.cos(th);
  const lift = 80 * Math.sin(th);
  const top = 236, bot = 740;
  const glow = seg(f, 30, 40);
  const hand = easeOut(seg(f, 32, 42));
  const cam = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const pageFace = (side: "old" | "back") => (
    <g>
      <rect x={30} y={top + 40} width={540} height={bot - top - 80} fill="none" stroke={C.gold} strokeWidth={5} />
      <L2aTextLines x={70} y={top + 90} w={460} rows={11} gap={34} seed={side === "old" ? 771 : 772} />
    </g>
  );
  return (
    <Frame f={f} seed={3077} bg={C.stone}>
      <g transform={`translate(960 520) scale(${cam}) translate(-960 -520)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.stone} />
        {Array.from({ length: 7 }, (_, r) => Array.from({ length: 9 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-120 + c * 250 + (r % 2) * 125} y={-30 + r * 130} width={244} height={124} rx={8}
            fill="none" stroke={C.stoneDark} strokeWidth={5} />
        )))}
        {/* アーチ窓と光 */}
        <path d="M 1620 440 L 1620 170 Q 1620 50 1720 50 Q 1820 50 1820 170 L 1820 440 Z" fill={C.sky} stroke={C.ink} strokeWidth={7} />
        <line x1={1720} y1={50} x2={1720} y2={440} stroke={C.ink} strokeWidth={6} />
        <line x1={1620} y1={250} x2={1820} y2={250} stroke={C.ink} strokeWidth={6} />
        <polygon points="1620,180 1820,440 1300,900 900,900" fill={KRP.yellow} opacity={0.12} />
        {/* 棚の写本とインク壺 */}
        <rect x={40} y={190} width={420} height={20} fill={C.shelf} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={60 + i * 62} y={190 - 110 - (i % 2) * 14} width={52} height={110 + (i % 2) * 14} rx={4}
            fill={[C.leather, C.velvetDark, C.woodMid, C.leatherDark, C.royalDark][i]} stroke={C.ink} strokeWidth={4.5} />
        ))}
        <rect x={390} y={140} width={46} height={50} rx={8} fill={C.ink} />
        <line x1={412} y1={140} x2={450} y2={70} stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
        <path d="M 450 70 q -30 10 -26 40 q 30 -10 26 -40 Z" fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        {/* 書見台 */}
        <polygon points="230,220 1690,220 1760,820 160,820" fill={C.woodMid} stroke={C.ink} strokeWidth={8} />
        <polygon points="160,820 1760,820 1760,860 160,860" fill={C.woodDeep} stroke={C.ink} strokeWidth={6} />
        <rect x={180} y={790} width={1560} height={24} fill={C.shelf} stroke={C.ink} strokeWidth={5} />
        {/* 革の表紙と本体 */}
        <rect x={330} y={212} width={1260} height={556} rx={16} fill={C.leather} stroke={C.ink} strokeWidth={7} />
        {[360, 1560].map((x) => [240, 740].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={14} fill={C.gold} stroke={C.ink} strokeWidth={4} />
        )))}
        {/* 左ページ (下) */}
        <path d={`M 360 ${top} Q 660 ${top - 20} 960 ${top + 14} L 960 ${bot + 6} Q 660 ${bot - 14} 360 ${bot} Z`} fill={C.parchment} stroke={C.ink} strokeWidth={6} />
        <g transform="translate(360 0)">{pageFace("old")}</g>
        {/* 右ページ (下 = 新しく現れるページ) */}
        <path d={`M 960 ${top + 14} Q 1260 ${top - 20} 1560 ${top} L 1560 ${bot} Q 1260 ${bot - 14} 960 ${bot + 6} Z`} fill={C.parchment} stroke={C.ink} strokeWidth={6} />
        <rect x={990} y={top + 40} width={540} height={bot - top - 80} fill="none" stroke={C.gold} strokeWidth={5} />
        {/* 金の唐草のふち飾り */}
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={1000} cy={top + 60 + i * 56} r={8} fill={C.gold} stroke={C.ink} strokeWidth={3} />
        ))}
        {/* 飾り文字 */}
        <rect x={1030} y={top + 64} width={150} height={150} rx={8} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={5} />
        <rect x={1042} y={top + 76} width={126} height={126} rx={6} fill="none" stroke={C.gold} strokeWidth={6} />
        <text x={1105} y={top + 188} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={130} fill={KRP.red} stroke={C.gold} strokeWidth={4} paintOrder="stroke">E</text>
        <path d="M 1050 380 q 30 -30 60 0 t 60 0" fill="none" stroke={C.leaf} strokeWidth={5} />
        <L2aTextLines x={1200} y={top + 90} w={320} rows={4} gap={34} seed={773} />
        <L2aTextLines x={1030} y={top + 260} w={490} rows={7} gap={34} seed={774} skip={[2, 3]} />
        {/* 光る一節 */}
        <rect x={1022} y={top + 314} width={510} height={70} rx={14} fill={C.flame} opacity={0.15 + 0.4 * glow * (0.85 + Math.sin(f / 4) * 0.15)} />
        <g stroke={C.leatherDark} strokeWidth={8} strokeLinecap="round">
          <path d={`M 1040 ${top + 334} L 1250 ${top + 334} M 1270 ${top + 334} L 1500 ${top + 334}`} />
          <path d={`M 1040 ${top + 368} L 1180 ${top + 368} M 1200 ${top + 368} L 1420 ${top + 368}`} />
        </g>
        {glow > 0 && [0, 1, 2, 3].map((i) => (
          <line key={i} x1={1020 + i * 170} y1={top + 302} x2={1010 + i * 176} y2={top + 280 - 10 * glow}
            stroke={C.gold} strokeWidth={6} strokeLinecap="round" opacity={glow} />
        ))}
        {/* 背の陰 */}
        <rect x={944} y={top + 10} width={32} height={bot - top} fill={C.ink} opacity={0.12} />
        {/* めくれるページ */}
        {p < 0.999 && (
          <g>
            <path d={`M 960 ${top + 14} Q ${(960 + ex) / 2} ${top - lift * 1.2} ${ex} ${top - lift} L ${ex} ${bot - lift * 0.4} Q ${(960 + ex) / 2} ${bot - lift * 0.6} 960 ${bot + 6} Z`}
              fill={Math.cos(th) >= 0 ? C.parchment : C.parchmentDark} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            {Math.abs(Math.cos(th)) > 0.2 && (
              <g transform={`translate(960 ${-lift * 0.5}) scale(${(ex - 960) / 600} 1)`} opacity={0.8}>
                {pageFace(Math.cos(th) >= 0 ? "old" : "back")}
              </g>
            )}
          </g>
        )}
        {p >= 0.999 && (
          <g>
            <path d={`M 360 ${top} Q 660 ${top - 20} 960 ${top + 14} L 960 ${bot + 6} Q 660 ${bot - 14} 360 ${bot} Z`} fill={C.parchment} stroke={C.ink} strokeWidth={6} />
            <g transform="translate(360 0)">{pageFace("back")}</g>
            <rect x={440} y={top + 470 - 200} width={200} height={150} rx={8} fill={C.sky} stroke={C.gold} strokeWidth={6} />
            <path d={`M 450 ${top + 410} L 520 ${top + 330} L 570 ${top + 380} L 630 ${top + 320} L 630 ${top + 410} Z`} fill={C.hedge} stroke={C.ink} strokeWidth={4} />
          </g>
        )}
        {/* しおりのリボン */}
        <path d={`M 1300 ${bot - 6} q 10 60 -6 ${110 + Math.sin(f / 9) * 8}`} fill="none" stroke={KRP.red} strokeWidth={12} strokeLinecap="round" />
        {/* ろうそく */}
        <L2aCandle x={150} y={780} s={1.15} f={f} h={150} />
        {/* 指さす手 */}
        <L2aHand x={1300} y={top + 470 + 320 * (1 - hand)} rot={-8} sleeve={C.habitWhite} sleeveDark={C.togaShade} point len={500} />
      </g>
    </Frame>
  );
};

// ---- 文#78 【山】 「柔らかい衣を着た人なら、王の宮殿にいる」。
// 設計: 宮殿の大広間。絹とビロードのふわふわの衣を着た王と廷臣たち、豪華なクッションの玉座。窓の外には粗い服の人々が働く。対比
// どこ: 宮殿の大広間。ビロードのカーテン、金の柱、段の上にクッションだらけの玉座。左右のアーチ窓の外は畑
// 演出: ビロードとアーミンの王が玉座に深く沈む。絹の廷臣がクッションをふくらませて差し出し、もう1人が羽根の扇であおぐ。窓の外では粗い服の人々が鍬をふるい、荷を運ぶ (対比)
// 動き: カメラが引く (f0〜30) / クッションがぽんとふくらみ羽根が舞う (f14〜) / 扇がゆれる / 窓の外の鍬が上下
const Yw078: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1.1 - 0.1 * easeInOut(seg(f, 0, 30));
  const plump = pop(seg(f, 14, 24));
  const fan = Math.sin(f / 5) * 14;
  const hoe = Math.sin(f / 4) * 22;
  const win = (wx: number, id: string, kids: React.ReactNode) => (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={`M ${wx - 140} 600 L ${wx - 140} 290 Q ${wx - 140} 150 ${wx} 150 Q ${wx + 140} 150 ${wx + 140} 290 L ${wx + 140} 600 Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={wx - 150} y={140} width={300} height={470} fill={C.sky} />
        <path d={`M ${wx - 150} 440 Q ${wx} 400 ${wx + 150} 430 L ${wx + 150} 610 L ${wx - 150} 610 Z`} fill={C.field} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={wx - 150} y1={460 + i * 26} x2={wx + 150} y2={450 + i * 26} stroke={C.fieldDark} strokeWidth={4} />
        ))}
        {kids}
      </g>
      <path d={`M ${wx - 140} 600 L ${wx - 140} 290 Q ${wx - 140} 150 ${wx} 150 Q ${wx + 140} 150 ${wx + 140} 290 L ${wx + 140} 600 Z`}
        fill="none" stroke={C.gold} strokeWidth={14} />
      <path d={`M ${wx - 140} 600 L ${wx - 140} 290 Q ${wx - 140} 150 ${wx} 150 Q ${wx + 140} 150 ${wx + 140} 290 L ${wx + 140} 600 Z`}
        fill="none" stroke={C.ink} strokeWidth={5} />
      <line x1={wx} y1={150} x2={wx} y2={600} stroke={C.ink} strokeWidth={5} />
      <rect x={wx - 160} y={596} width={320} height={22} rx={4} fill={C.stone} stroke={C.ink} strokeWidth={5} />
    </g>
  );
  return (
    <Frame f={f} seed={3078} bg={C.palaceWall}>
      <g transform={`translate(960 480) scale(${cam}) translate(-960 -480)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.palaceWall} />
        <rect x={-60} y={-10} width={W + 120} height={70} fill={C.gold} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={i * 84} cy={25} r={12} fill={C.goldDark} stroke={C.ink} strokeWidth={3.5} />)}
        {/* 壁の金の付け柱 */}
        {[560, 1360].map((x) => (
          <g key={x}>
            <rect x={x - 26} y={60} width={52} height={680} fill={C.gold} stroke={C.ink} strokeWidth={5} />
            <line x1={x} y1={70} x2={x} y2={730} stroke={C.goldDark} strokeWidth={5} />
          </g>
        ))}
        {/* 窓の外: 粗い服で働く人々 */}
        {win(330, "l2a78wl", <>
          <g transform={`translate(270 520)`}>
            <L2aFig x={0} y={0} s={0.42} f={f} phase={1} lean={10 + hoe * 0.3}
              p={{ face: "worried", cloth: C.peasant, clothDark: C.peasantDark, hair: "cap", pose: "hold" }}>
              <g transform={`rotate(${hoe} 0 -118)`}>
                <line x1={0} y1={-118} x2={140} y2={40} stroke={C.shelf} strokeWidth={12} strokeLinecap="round" />
                <path d="M 130 30 L 170 36 L 150 66 Z" fill={KRP.grayDark} stroke={C.ink} strokeWidth={6} />
              </g>
            </L2aFig>
          </g>
          <L2aFig x={400} y={530} s={0.4} f={f} phase={3} lean={24}
            p={{ face: "sad", cloth: C.peasant, clothDark: C.peasantDark, hair: "none", pose: "stand" }} />
          <ellipse cx={440} cy={520} rx={34} ry={22} fill={C.scrollEnd} stroke={C.ink} strokeWidth={3.5} />
        </>)}
        {win(1590, "l2a78wr", <>
          <L2aFig x={1540 + (f % 120) * 0.3} y={530} s={0.42} f={f} phase={5} lean={14}
            p={{ face: "worried", cloth: C.peasant, clothDark: C.peasantDark, hair: "cap", pose: "stand" }}>
            <rect x={-80} y={-210} width={120} height={110} rx={20} fill={C.scrollEnd} stroke={C.ink} strokeWidth={9} />
            <line x1={-40} y1={-210} x2={-20} y2={-100} stroke={C.ink} strokeWidth={6} />
          </L2aFig>
          <L2aFig x={1660} y={528} s={0.4} f={f} phase={6}
            p={{ face: "normal", cloth: C.peasantDark, clothDark: C.peasant, hair: "none", pose: "hold" }}>
            <path d="M -50 -130 L 50 -130 L 40 -70 L -40 -70 Z" fill={C.shelf} stroke={C.ink} strokeWidth={9} />
          </L2aFig>
        </>)}
        {/* ビロードのカーテン */}
        {[[-20, 1], [1940, -1]].map(([cxx, dir]) => (
          <g key={cxx}>
            <path d={`M ${cxx} -20 L ${cxx + dir * 170} -20 Q ${cxx + dir * 110} 400 ${cxx + dir * 150} 620 Q ${cxx + dir * 140} 820 ${cxx + dir * 200} 1100 L ${cxx} 1100 Z`}
              fill={C.velvet} stroke={C.ink} strokeWidth={7} />
            {[40, 90, 130].map((k) => (
              <path key={k} d={`M ${cxx + dir * k} 0 Q ${cxx + dir * (k - 20)} 400 ${cxx + dir * k} 620 Q ${cxx + dir * (k + 10)} 820 ${cxx + dir * (k + 30)} 1100`}
                fill="none" stroke={C.velvetDark} strokeWidth={6} />
            ))}
            <rect x={cxx + dir * 150 - 40} y={600} width={80} height={30} rx={14} fill={C.gold} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 段と赤いじゅうたん */}
        <rect x={500} y={720} width={920} height={40} fill={C.marble} stroke={C.ink} strokeWidth={6} />
        <rect x={440} y={760} width={1040} height={40} fill={C.marbleShade} stroke={C.ink} strokeWidth={6} />
        <rect x={-60} y={800} width={W + 120} height={340} fill={C.marble} stroke={C.ink} strokeWidth={6} />
        <polygon points="820,720 1100,720 1240,1100 680,1100" fill={C.velvet} stroke={C.ink} strokeWidth={6} />
        <polygon points="845,720 1075,720 1205,1100 715,1100" fill="none" stroke={C.gold} strokeWidth={5} />
        {/* 玉座 */}
        <path d="M 740 720 L 740 290 Q 740 200 960 170 Q 1180 200 1180 290 L 1180 720 Z" fill={C.gold} stroke={C.ink} strokeWidth={8} />
        <path d="M 790 700 L 790 310 Q 790 240 960 220 Q 1130 240 1130 310 L 1130 700 Z" fill={C.velvet} stroke={C.ink} strokeWidth={6} />
        {[[880, 300], [1040, 300], [880, 420], [1040, 420], [960, 360]].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r={8} fill={C.gold} stroke={C.ink} strokeWidth={3} />
        ))}
        <path d="M 920 172 L 940 130 L 960 160 L 980 130 L 1000 172 Z" fill={C.gold} stroke={C.ink} strokeWidth={5} />
        <L2aCushion x={960} y={600} w={330} h={220} color={C.velvetDark} dark={C.velvet} puff={0.5 + Math.sin(f / 12) * 0.1} />
        {/* 王 (アーミンの外套・王冠) */}
        <L2aFig x={960} y={690} s={1.12} f={f} phase={2}
          back={<path d="M -70 -164 Q -120 -100 -128 -20 L 128 -20 Q 120 -100 70 -164 Z" fill={C.ermine} stroke={C.ink} strokeWidth={5} />}
          p={{ face: "smile", cloth: C.royal, clothDark: C.royalDark, hair: "cap", pose: "stand", gaze: [-4, 0] }}>
          <path d="M -74 -166 Q 0 -126 74 -166 L 70 -140 Q 0 -104 -70 -140 Z" fill={C.ermine} stroke={C.ink} strokeWidth={4.5} />
          {[-50, -24, 0, 24, 50].map((sx2) => <path key={sx2} d={`M ${sx2} -140 l -4 10 l 8 0 Z`} fill={C.ink} />)}
          <path d="M -50 -276 L -54 -330 L -26 -300 L 0 -344 L 26 -300 L 54 -330 L 50 -276 Z" fill={C.gold} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-52} y={-286} width={104} height={18} rx={4} fill={C.goldDark} stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={-277} r={6} fill={KRP.red} stroke={C.ink} strokeWidth={2.5} />
          <circle cx={-30} cy={-277} r={5} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={2.5} />
          <circle cx={30} cy={-277} r={5} fill={C.leaf} stroke={C.ink} strokeWidth={2.5} />
        </L2aFig>
        {/* 座面とひじかけ (王の下半身を隠す) */}
        <L2aCushion x={960} y={712} w={400} h={120} color={C.velvet} dark={C.velvetDark} puff={0.8} />
        {[770, 1150].map((ax) => (
          <g key={ax}>
            <rect x={ax - 30} y={520} width={60} height={190} rx={10} fill={C.gold} stroke={C.ink} strokeWidth={6} />
            <circle cx={ax} cy={520} r={30} fill={C.gold} stroke={C.ink} strokeWidth={6} />
            <circle cx={ax} cy={520} r={12} fill={C.goldDark} />
          </g>
        ))}
        {/* 足のせ台 */}
        <rect x={880} y={760} width={160} height={40} rx={8} fill={C.gold} stroke={C.ink} strokeWidth={5} />
        <L2aCushion x={960} y={764} w={150} h={46} color={C.velvet} dark={C.velvetDark} button={false} />
        {/* 廷臣: クッションをふくらませて差し出す */}
        <L2aFig x={560} y={826} s={1.0} f={f} phase={4} lean={5}
          p={{ face: "smile", cloth: C.silkPink, clothDark: C.silkPinkDark, hair: "cap", pose: "hold", gaze: [7, -2] }}>
          {[-52, -30, -8, 14, 36, 58].map((rx2, i) => <circle key={i} cx={rx2 * 0.9} cy={-160 + Math.abs(rx2) * 0.12} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />)}
          <path d="M -62 -64 L 62 -64 L 70 -12 Q 0 -2 -70 -12 Z" fill={C.silkPink} stroke={C.ink} strokeWidth={4.5} />
          <g transform={`translate(0 -96) scale(${0.7 + 0.3 * plump})`}>
            <L2aCushion x={0} y={30} w={150} h={84} color={C.velvet} dark={C.velvetDark} puff={plump} />
          </g>
        </L2aFig>
        {/* 舞う羽根 */}
        {seg(f, 14, 20) > 0 && Array.from({ length: 7 }, (_, i) => {
          const t = clamp01((f - 14 - i * 1.5) / 40);
          if (t <= 0) return null;
          const fx = 570 + (rnd(i, 1) - 0.4) * 260 + Math.sin(f / 6 + i) * 20;
          const fy = 700 - t * 340;
          return (
            <g key={i} transform={`translate(${fx} ${fy}) rotate(${Math.sin(f / 5 + i) * 40})`} opacity={1 - t * 0.6}>
              <path d="M 0 -22 Q 14 0 0 22 Q -14 0 0 -22 Z" fill={KRP.white} stroke={C.ink} strokeWidth={3} />
              <line x1={0} y1={-20} x2={0} y2={26} stroke={C.ink} strokeWidth={2.5} />
            </g>
          );
        })}
        {/* 廷臣: 羽根の扇であおぐ */}
        <L2aFig x={1370} y={826} s={1.0} f={f} phase={6} lean={-4}
          p={{ face: "smile", cloth: C.silkBlue, clothDark: C.silkBlueDark, hair: "cap", pose: "point", pointDir: -1, gaze: [-7, -2] }}>
          {[-52, -30, -8, 14, 36, 58].map((rx2, i) => <circle key={i} cx={rx2 * 0.9} cy={-160 + Math.abs(rx2) * 0.12} r={14} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />)}
          <path d="M -62 -64 L 62 -64 L 70 -12 Q 0 -2 -70 -12 Z" fill={C.silkBlue} stroke={C.ink} strokeWidth={4.5} />
          <g transform={`translate(-153 -148) rotate(${fan - 20})`}>
            <line x1={0} y1={0} x2={0} y2={-110} stroke={C.goldDark} strokeWidth={8} />
            {[-50, -25, 0, 25, 50].map((a) => (
              <path key={a} d="M 0 -100 Q -26 -170 0 -230 Q 26 -170 0 -100 Z" fill={a === 0 ? C.ermine : C.silkPink}
                stroke={C.ink} strokeWidth={4} transform={`rotate(${a} 0 -100)`} />
            ))}
          </g>
        </L2aFig>
      </g>
    </Frame>
  );
};

// ---- 文#79 【図】 柔らかさは、ぜいたくな暮らしの、しるしだったのです。
// 設計: 天秤の図 (世界=羊皮紙)。左の皿に柔らかいクッションと絹、右の皿に王冠と金貨。釣り合う。札「柔らかさ」「ぜいたく」
// どこ: 机の上に広げた羊皮紙 (角に羽根ペンとインク壺、封蝋)。羊皮紙に描かれた真鍮の天秤
// 演出: 左の皿にクッションと絹が落ちて傾き、右の皿に王冠と金貨が落ちて揺れ返し、ぴたりと釣り合う。札「柔らかさ」「ぜいたく」
// 動き: 左の品 f2〜10 / 右の王冠 f12〜20・金貨 f14〜26 / 竿が傾き→揺れ戻り→f40 で水平 / 釣り合いの針がまっすぐ上
const Yw079: React.FC<{ f: number }> = ({ f }) => {
  const a = f < 12 ? -9 * easeOut(seg(f, 4, 12))
    : f < 24 ? -9 + 15 * easeOut(seg(f, 12, 24))
    : 6 * Math.exp(-(f - 24) / 6) * Math.cos((f - 24) / 2.5);
  const ar = (a * Math.PI) / 180;
  const px = 960, py = 250, L = 430, chain = 290;
  const ends = [-1, 1].map((d) => ({ x: px + d * L * Math.cos(ar), y: py + d * L * Math.sin(ar) }));
  const dropL = 1 - easeOut(seg(f, 2, 10));
  const dropCrown = 1 - easeOut(seg(f, 12, 20));
  const level = seg(f, 36, 42);
  const pan = (x: number, y: number, kids: React.ReactNode) => (
    <g>
      {[-130, 0, 130].map((dx) => <line key={dx} x1={x} y1={y - chain} x2={x + dx} y2={y} stroke={C.goldDark} strokeWidth={5} strokeDasharray="12 6" />)}
      <circle cx={x} cy={y - chain} r={10} fill={C.gold} stroke={C.ink} strokeWidth={4} />
      {kids}
      <path d={`M ${x - 160} ${y} Q ${x} ${y + 70} ${x + 160} ${y} Z`} fill={C.gold} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${x - 120} ${y + 14} Q ${x} ${y + 44} ${x + 120} ${y + 14}`} fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.5} />
    </g>
  );
  const [l, r] = ends;
  const ly = l.y + chain, ry = r.y + chain;
  return (
    <Frame f={f} seed={3079} bg={C.woodMid}>
      {/* 机 */}
      <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={C.woodMid} />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M -20 ${40 + i * 140} q 480 ${rnd(79, i) * 30 - 15} 980 0 q 480 ${rnd(80, i) * 30 - 15} 980 0`} fill="none" stroke={C.woodDeep} strokeWidth={5} opacity={0.5} />
      ))}
      {/* 羊皮紙 */}
      <g transform="rotate(-1 960 540)">
        <path d="M 120 60 Q 500 40 960 56 Q 1420 40 1800 64 Q 1820 540 1796 900 Q 1400 920 960 906 Q 500 922 124 900 Q 100 540 120 60 Z"
          fill={C.parchment} stroke={C.ink} strokeWidth={8} />
        <path d="M 160 100 Q 960 84 1760 104 Q 1774 540 1756 860 Q 960 874 164 860 Q 146 540 160 100 Z" fill="none" stroke={C.parchmentDark} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={200 + rnd(79, i * 3) * 1500} cy={130 + rnd(i, 79) * 720} r={10 + rnd(i, 4) * 20} fill={C.parchmentDark} opacity={0.25} />
        ))}
        {/* 目盛りの弧 */}
        <path d="M 880 168 Q 960 130 1040 168" fill="none" stroke={C.brownInk} strokeWidth={5} />
        {[-2, -1, 0, 1, 2].map((k) => (
          <line key={k} x1={960 + k * 38} y1={150 + Math.abs(k) * 7} x2={960 + k * 42} y2={134 + Math.abs(k) * 7} stroke={C.brownInk} strokeWidth={k === 0 ? 6 : 4} />
        ))}
        {/* 支柱と台 */}
        <rect x={940} y={py} width={40} height={520} fill={C.gold} stroke={C.ink} strokeWidth={6} />
        <line x1={952} y1={py + 20} x2={952} y2={py + 500} stroke={KRP.white} strokeWidth={4} opacity={0.5} />
        <path d="M 820 820 Q 830 770 900 762 L 1020 762 Q 1090 770 1100 820 Z" fill={C.goldDark} stroke={C.ink} strokeWidth={6} />
        <rect x={780} y={816} width={360} height={24} rx={8} fill={C.gold} stroke={C.ink} strokeWidth={6} />
        {/* 竿 */}
        <g transform={`rotate(${a} ${px} ${py})`}>
          <rect x={px - L - 10} y={py - 12} width={2 * L + 20} height={24} rx={12} fill={C.gold} stroke={C.ink} strokeWidth={6} />
          <path d={`M ${px} ${py - 10} L ${px - 12} ${py - 100} L ${px} ${py - 118} L ${px + 12} ${py - 100} Z`} fill={level > 0.5 ? KRP.red : C.goldDark} stroke={C.ink} strokeWidth={4.5} />
        </g>
        <circle cx={px} cy={py} r={20} fill={C.goldDark} stroke={C.ink} strokeWidth={6} />
        {/* 左の皿: クッションと絹 */}
        {pan(l.x, ly, <g transform={`translate(0 ${-260 * dropL})`}>
          <L2aCushion x={l.x - 40} y={ly + 4} w={190} h={110} color={C.purple} dark={C.purpleDark} puff={0.5 + 0.3 * Math.sin(f / 6)} />
          <g transform={`translate(${l.x + 90} ${ly + 2})`}>
            <rect x={-56} y={-26} width={112} height={26} rx={10} fill={C.silkBlue} stroke={C.ink} strokeWidth={4.5} />
            <rect x={-50} y={-50} width={100} height={26} rx={10} fill={C.silkPink} stroke={C.ink} strokeWidth={4.5} />
            <rect x={-44} y={-74} width={88} height={26} rx={10} fill={C.ermine} stroke={C.ink} strokeWidth={4.5} />
            <path d="M -40 -64 Q 0 -70 40 -60" fill="none" stroke={KRP.white} strokeWidth={4} />
            <path d="M -46 -16 Q 0 -22 46 -12" fill="none" stroke={KRP.white} strokeWidth={4} />
          </g>
        </g>)}
        {/* 右の皿: 王冠と金貨 */}
        {pan(r.x, ry, <>
          <g transform={`translate(${r.x - 50} ${ry - 4 - 280 * dropCrown})`}>
            <path d="M -66 0 L -72 -80 L -36 -44 L 0 -100 L 36 -44 L 72 -80 L 66 0 Z" fill={C.gold} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <rect x={-68} y={-18} width={136} height={18} rx={4} fill={C.goldDark} stroke={C.ink} strokeWidth={4.5} />
            <circle cx={0} cy={-36} r={10} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
            <circle cx={-40} cy={-30} r={7} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={3} />
            <circle cx={40} cy={-30} r={7} fill={C.leaf} stroke={C.ink} strokeWidth={3} />
          </g>
          {Array.from({ length: 6 }, (_, i) => {
            const d = 1 - easeOut(seg(f, 14 + i * 2, 20 + i * 2));
            return (
              <g key={i} transform={`translate(${r.x + 80 + (i % 2) * 6} ${ry - 10 - i * 16 - 300 * d})`}>
                <ellipse cx={0} cy={0} rx={44} ry={13} fill={C.gold} stroke={C.ink} strokeWidth={4.5} />
                <ellipse cx={0} cy={-2} rx={26} ry={6} fill="none" stroke={C.goldDark} strokeWidth={3} />
              </g>
            );
          })}
        </>)}
        {/* 釣り合いの光 */}
        {level > 0 && [0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={960 + Math.cos(-Math.PI / 2 + (i - 2) * 0.35) * 140} y1={120 + Math.sin(-Math.PI / 2 + (i - 2) * 0.35) * 30 + 10}
            x2={960 + Math.cos(-Math.PI / 2 + (i - 2) * 0.35) * (140 + 30 * level)} y2={100 + Math.sin(-Math.PI / 2 + (i - 2) * 0.35) * 40}
            stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" opacity={level} />
        ))}
      </g>
      {/* 羽根ペンとインク壺・封蝋 */}
      <rect x={1760} y={30} width={80} height={70} rx={12} fill={C.ink} />
      <path d={`M 1800 40 Q 1760 -40 1700 -60 Q 1740 0 1800 40 Z`} fill={KRP.white} stroke={C.ink} strokeWidth={4} transform={`rotate(${Math.sin(f / 13) * 3} 1800 40)`} />
      <circle cx={170} cy={950} r={60} fill={KRP.red} stroke={C.ink} strokeWidth={6} />
      <circle cx={170} cy={950} r={34} fill="none" stroke={C.velvetDark} strokeWidth={5} />
      <TagPlate x={l.x} y={730} text="柔らかさ" size={48} t={seg(f, 26, 36)} />
      <TagPlate x={r.x} y={730} text="ぜいたく" size={48} t={seg(f, 30, 40)} />
    </Frame>
  );
};

// ---- 文#80 【山】 13世紀の神学者、トマス・アクィナスは、さらに踏みこみました。
// 設計: 中世の大学の講堂 (ゴシックの窓・木の長椅子・学生たち)。教壇のトマス・アクィナス (白い修道服に黒マント・大柄) が本を開いて講義。隅に `AgeDial` (s≈0.5、label「13世紀」)。札「トマス・アクィナス」
// どこ: 13世紀の大学の講堂。石の壁にゴシックの尖頭窓3つ (ステンドグラス)、色の光が床へ。木の長椅子に学生たち
// 演出: 中央の木の教壇で、大柄なトマス・アクィナス (白い修道服・黒マント・剃髪) が分厚い本を開き、ぐっと身を乗り出す。教壇がドンと鳴り、学生たちが驚いてふり向く
// 動き: 年代ダイヤルが回って止まる (f0〜20) / カメラがアクィナスへ寄る / f20〜26 で本を持ち上げ身を乗り出す・集中線 / 学生の顔が驚きに変わる
const Yw080: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.07 * easeInOut(seg(f, 0, 40));
  const step = easeOut(seg(f, 20, 26));
  const thump = seg(f, 24, 34);
  const react = seg(f, 24, 30) > 0.5;
  const windows = [400, 960, 1520];
  const lancet = (x: number, w: number, ya: number, yb: number) =>
    `M ${x - w} ${yb} L ${x - w} ${ya} Q ${x - w} ${ya - 160} ${x} ${ya - 230} Q ${x + w} ${ya - 160} ${x + w} ${ya} L ${x + w} ${yb} Z`;
  const student = (x: number, y: number, s: number, ph: number, dir: 1 | -1, cloth: string) => (
    <L2aFig key={`${x}-${y}`} x={x} y={y} s={s} f={f} phase={ph} lean={dir * (react ? 6 : 2)}
      p={{ face: react ? (ph % 2 ? "surprised" : "worried") : "normal", cloth, clothDark: C.studentDark, hair: "cap", gaze: [dir * 8, -3] }} />
  );
  return (
    <Frame f={f} seed={3080} bg={C.stone}>
      <g transform={`translate(960 460) scale(${cam}) translate(-960 -460)`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.stone} />
        {Array.from({ length: 8 }, (_, r) => Array.from({ length: 10 }, (_, c) => (
          <rect key={`${r}-${c}`} x={-100 + c * 220 + (r % 2) * 110} y={-20 + r * 110} width={214} height={104} rx={6}
            fill="none" stroke={C.stoneDark} strokeWidth={5} />
        )))}
        {/* 天井のリブ */}
        {[-200, 400, 960, 1520, 2120].map((x, i, arr) => i < arr.length - 1 && (
          <path key={x} d={`M ${x} 0 Q ${(x + arr[i + 1]) / 2} 120 ${arr[i + 1]} 0`} fill="none" stroke={C.stoneDark} strokeWidth={10} />
        ))}
        {/* 色の光 */}
        {windows.map((x, i) => (
          <polygon key={x} points={`${x - 90},540 ${x + 90},540 ${x + 260 - i * 60},900 ${x - 60 - i * 60},900`}
            fill={[C.glass1, C.glass3, C.glass2][i]} opacity={0.12} />
        ))}
        {/* 尖頭窓 */}
        {windows.map((x, i) => (
          <g key={x}>
            <defs><clipPath id={`l2a80w${i}`}><path d={lancet(x, 100, 300, 540)} /></clipPath></defs>
            <path d={lancet(x, 116, 300, 556)} fill={C.stoneDark} stroke={C.ink} strokeWidth={7} />
            <g clipPath={`url(#l2a80w${i})`}>
              {Array.from({ length: 6 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
                <rect key={`${r}-${c}`} x={x - 100 + c * 50} y={70 + r * 80} width={50} height={80}
                  fill={[C.glass1, C.glass2, C.glass3, C.glass4][(r + c + i) % 4]} stroke={C.ink} strokeWidth={4}
                  opacity={0.85 + Math.sin(f / 10 + r + c) * 0.1} />
              )))}
            </g>
            <path d={lancet(x, 100, 300, 540)} fill="none" stroke={C.ink} strokeWidth={6} />
            <line x1={x} y1={140} x2={x} y2={540} stroke={C.ink} strokeWidth={8} />
            <circle cx={x} cy={200} r={44} fill={C.glass3} stroke={C.ink} strokeWidth={6} />
            {[0, 60, 120, 180, 240, 300].map((r) => (
              <line key={r} x1={x} y1={200} x2={x + Math.cos((r * Math.PI) / 180) * 44} y2={200 + Math.sin((r * Math.PI) / 180) * 44} stroke={C.ink} strokeWidth={4} />
            ))}
          </g>
        ))}
        {/* 床 */}
        <rect x={-60} y={760} width={W + 120} height={380} fill={C.stoneDark} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 180 - 100} y1={760} x2={i * 220 - 300} y2={1100} stroke={C.stone} strokeWidth={5} />
        ))}
        {/* 後ろの列の学生と長椅子 */}
        {[180, 340, 1580, 1740].map((x, i) => student(x, 770, 0.52, i + 1, x < 960 ? 1 : -1, i % 2 ? C.student : C.woodMid))}
        {[[60, 460], [1460, 1860]].map(([a, b]) => (
          <g key={a}>
            <rect x={a} y={700} width={b - a} height={60} rx={8} fill={C.woodMid} stroke={C.ink} strokeWidth={6} />
            <line x1={a + 10} y1={718} x2={b - 10} y2={718} stroke={C.woodDeep} strokeWidth={4} />
          </g>
        ))}
        {/* 教壇とアクィナス */}
        <rect x={760} y={790} width={400} height={30} fill={C.woodDeep} stroke={C.ink} strokeWidth={6} />
        <g transform={`translate(0 ${-6 * step})`}>
          <L2aFig x={960} y={724} s={1.5} f={f} phase={2} lean={0}
            back={<path d="M -70 -164 Q -96 -90 -96 -10 L 96 -10 Q 96 -90 70 -164 Z" fill={C.mantle} stroke={C.ink} strokeWidth={5} />}
            p={{ face: "smile", cloth: C.habitWhite, clothDark: C.togaShade, hair: "none", pose: "hold", gaze: [0, 4] }}>
            <L2aTonsure hair={C.ink} />
            <path d="M -60 -110 L -34 -110 L -40 -10 L -70 -10 Z" fill={C.mantle} stroke={C.ink} strokeWidth={4.5} />
            <path d="M 60 -110 L 34 -110 L 40 -10 L 70 -10 Z" fill={C.mantle} stroke={C.ink} strokeWidth={4.5} />
            <path d="M -72 -168 Q 0 -130 72 -168 L 66 -142 Q 0 -110 -66 -142 Z" fill={C.mantle} stroke={C.ink} strokeWidth={4.5} />
            {/* 分厚い本 */}
            <g transform={`translate(0 ${-118 - 18 * step}) rotate(${-4 * step})`}>
              <rect x={-96} y={-10} width={192} height={30} rx={6} fill={C.leather} stroke={C.ink} strokeWidth={5} />
              <path d="M 0 -6 Q -50 -26 -92 -14 L -92 14 Q -50 2 0 18 Q 50 2 92 14 L 92 -14 Q 50 -26 0 -6 Z" fill={C.parchment} stroke={C.ink} strokeWidth={5} />
              <line x1={0} y1={-6} x2={0} y2={18} stroke={C.ink} strokeWidth={4} />
              {[-70, -45, 30, 55].map((lx2) => <line key={lx2} x1={lx2} y1={-8} x2={lx2 + 20} y2={-8} stroke={C.brownInk} strokeWidth={3} />)}
            </g>
          </L2aFig>
        </g>
        {/* 教壇 (手前) */}
        <rect x={790} y={590} width={340} height={210} fill={C.woodMid} stroke={C.ink} strokeWidth={7} />
        <rect x={770} y={574} width={380} height={30} rx={6} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
        {[850, 960, 1070].map((ax) => (
          <path key={ax} d={`M ${ax - 36} 740 L ${ax - 36} 660 Q ${ax} 616 ${ax + 36} 660 L ${ax + 36} 740 Z`} fill={C.woodDeep} stroke={C.ink} strokeWidth={4.5} />
        ))}
        {/* ドンという集中線と床のホコリ */}
        {thump > 0 && Array.from({ length: 12 }, (_, i) => {
          const an = (i / 12) * Math.PI * 2;
          return <line key={i} x1={960 + Math.cos(an) * 300} y1={440 + Math.sin(an) * 230} x2={960 + Math.cos(an) * (360 + 60 * thump)} y2={440 + Math.sin(an) * (280 + 40 * thump)}
            stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - thump * 0.5} />;
        })}
        {thump > 0 && [0, 1, 2, 3].map((i) => (
          <circle key={i} cx={780 + i * 120} cy={590 - thump * 30} r={10 + thump * 16} fill="none" stroke={C.stoneDark} strokeWidth={4} opacity={1 - thump} />
        ))}
        {/* 前の列の学生と長椅子 */}
        {[150, 360, 560, 1360, 1560, 1770].map((x, i) => student(x, 888, 0.64, i + 7, x < 960 ? 1 : -1, i % 3 === 1 ? C.woodMid : C.student))}
        {[[20, 690], [1230, 1900]].map(([a, b]) => (
          <g key={a}>
            <rect x={a} y={800} width={b - a} height={70} rx={8} fill={C.shelf} stroke={C.ink} strokeWidth={6} />
            <line x1={a + 10} y1={822} x2={b - 10} y2={822} stroke={C.woodDeep} strokeWidth={4} />
          </g>
        ))}
      </g>
      <AgeDial x={1745} y={225} s={0.5} spin={420 * (1 - easeOut(seg(f, 0, 20)))} handle={f * 8} label="13世紀" />
      <TagPlate x={960} y={770} text="トマス・アクィナス" size={40} t={seg(f, 10, 20)} />
    </Frame>
  );
};

// ---- 文#81 【並】 彼は「柔弱」を、悪い性質のひとつに数えています。
// 設計: アクィナスの分厚い本のページ (世界=羊皮紙の本)。悪い性質のリストの1つに「柔弱」の文字 (ラベル)、そこに赤いしるしがつく。他の項目は判読できない線
// どこ: アクィナスの分厚い本の見開き (寄り)。暗い木の書見台、ろうそくの明かり
// 演出: 悪い性質の一覧 (番号と判読できない行)。その1つ「柔弱」に、アクィナスの手が赤インクの羽根ペンでぐるりと丸をつけ、余白に赤いしるし
// 動き: カメラが「柔弱」へ寄る / 手が入る f4〜14 / 赤丸が f16〜34 で描かれる (ペン先が線を追う) / 余白のしるし f34〜42 / ろうそくの揺れ
const Yw081: React.FC<{ f: number }> = ({ f }) => {
  const cam = 1 + 0.1 * easeInOut(seg(f, 0, 40));
  const inHand = easeOut(seg(f, 4, 14));
  const ring = easeInOut(seg(f, 16, 34));
  const mark = seg(f, 34, 42);
  const kx = 1250, ky = 492, rx = 150, ry = 66;
  const ang = -Math.PI * 0.6 + ring * Math.PI * 2.08;
  const tipX = kx + Math.cos(ang) * rx, tipY = ky + Math.sin(ang) * ry;
  const lift = seg(f, 34, 42);
  const hx = (ring > 0 ? tipX : kx + 200) + 50 + 230 * lift, hy = (ring > 0 ? tipY : ky + 80) + 120 + 60 * lift + 400 * (1 - inHand);
  const numerals = ["I", "II", "III", "IV", "V", "VI"];
  const numerals2 = ["VII", "VIII", "IX", "X", "XI", "XII"];
  return (
    <Frame f={f} seed={3081} bg={C.woodDeep} dark>
      <g transform={`translate(${kx} ${ky}) scale(${cam}) translate(${-kx} ${-ky})`}>
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.woodDeep} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -40 ${30 + i * 150} q 500 ${rnd(81, i) * 30 - 15} 1000 0 q 500 ${rnd(82, i) * 30 - 15} 1000 0`} fill="none" stroke={C.woodMid} strokeWidth={5} opacity={0.6} />
        ))}
        {/* ろうそくの光 */}
        <circle cx={120} cy={160} r={520} fill={C.flame} opacity={0.08 + Math.sin(f / 3) * 0.015} />
        {/* 本の厚み */}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${110 - i * 3} ${790 + i * 8} Q 520 ${770 + i * 8} 960 ${800 + i * 8} Q 1400 ${770 + i * 8} ${1810 + i * 3} ${790 + i * 8}`}
            fill="none" stroke={i % 2 ? C.parchmentDark : C.parchment} strokeWidth={9} />
        ))}
        <rect x={90} y={80} width={1740} height={780} rx={20} fill={C.leather} stroke={C.ink} strokeWidth={7} />
        {/* 見開き */}
        <path d="M 120 110 Q 540 80 960 120 L 960 800 Q 540 770 120 790 Z" fill={C.parchment} stroke={C.ink} strokeWidth={7} />
        <path d="M 960 120 Q 1380 80 1800 110 L 1800 790 Q 1380 770 960 800 Z" fill={C.parchment} stroke={C.ink} strokeWidth={7} />
        <rect x={930} y={120} width={60} height={680} fill={C.ink} opacity={0.1} />
        {/* 左ページ: 見出しの飾り文字 + 一覧 */}
        <rect x={190} y={150} width={120} height={120} rx={8} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
        <rect x={200} y={160} width={100} height={100} rx={6} fill="none" stroke={C.gold} strokeWidth={5} />
        <text x={250} y={244} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={100} fill={C.gold} stroke={C.ink} strokeWidth={2.5}>V</text>
        <L2aTextLines x={340} y={180} w={540} rows={3} gap={34} seed={811} />
        {numerals.map((n, i) => (
          <g key={n}>
            <text x={250} y={340 + i * 74} textAnchor="end" fontFamily={SERIF} fontWeight={700} fontSize={36} fill={KRP.red}>{n}.</text>
            <L2aTextLines x={280} y={328 + i * 74} w={580} rows={2} gap={28} seed={820 + i} sw={5} />
          </g>
        ))}
        {/* 右ページ: 一覧のつづき */}
        {numerals2.map((n, i) => (
          <g key={n}>
            <text x={1100} y={190 + i * 100} textAnchor="end" fontFamily={SERIF} fontWeight={700} fontSize={36} fill={KRP.red}>{n}.</text>
            {i === 3 ? (
              <L2aTextLines x={1420} y={478 + 0} w={300} rows={2} gap={30} seed={840} sw={5} />
            ) : (
              <L2aTextLines x={1130} y={178 + i * 100} w={590} rows={2} gap={30} seed={830 + i} sw={5} />
            )}
          </g>
        ))}
        {/* 主役: 「柔弱」 */}
        <text x={kx} y={ky + 26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={C.brownInk}>柔弱</text>
        {/* 赤い丸 */}
        {ring > 0 && (
          <path fill="none" stroke={C.redInk} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
            d={Array.from({ length: 61 }, (_, i) => {
              const t = (i / 60) * ring;
              const an = -Math.PI * 0.6 + t * Math.PI * 2.08;
              const wob = 1 + Math.sin(t * 11) * 0.03;
              return `${i ? "L" : "M"} ${(kx + Math.cos(an) * rx * wob).toFixed(1)} ${(ky + Math.sin(an) * ry * wob).toFixed(1)}`;
            }).join(" ")} />
        )}
        {/* 余白の赤いしるし */}
        {mark > 0 && (
          <g transform={`translate(1000 ${ky - 6}) scale(${0.8 * pop(mark)})`} stroke={C.redInk} strokeWidth={9} strokeLinecap="round">
            <line x1={-22} y1={0} x2={22} y2={0} /><line x1={-11} y1={-19} x2={11} y2={19} /><line x1={11} y1={-19} x2={-11} y2={19} />
          </g>
        )}
        {/* 赤インクの羽根ペンを持つ手 (白い袖・黒マントのふち) */}
        <g>
          <line x1={hx - 50} y1={hy - 120} x2={hx + 40} y2={hy - 60} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          <path d={`M ${hx + 10} ${hy - 80} Q ${hx + 60} ${hy - 230} ${hx + 200} ${hy - 300} Q ${hx + 150} ${hy - 160} ${hx + 60} ${hy - 50} Z`}
            fill={KRP.white} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <path d={`M ${hx + 20} ${hy - 70} Q ${hx + 100} ${hy - 170} ${hx + 196} ${hy - 296}`} fill="none" stroke={C.ink} strokeWidth={3.5} />
          {[0.3, 0.5, 0.7].map((k) => (
            <path key={k} d={`M ${hx + 20 + 176 * k} ${hy - 70 - 226 * k} l ${-30} ${-6}`} stroke={C.ink} strokeWidth={3} />
          ))}
          <path d={`M ${hx - 50} ${hy - 120} l 14 -2 l -6 12 Z`} fill={C.redInk} stroke={C.ink} strokeWidth={2.5} />
          <L2aHand x={hx + 30} y={hy} rot={-40} sleeve={C.habitWhite} sleeveDark={C.togaShade} cuff={C.mantle} len={600} />
        </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_072: (f) => <Yw072 f={f} />,
  yw_073: (f) => <Yw073 f={f} />,
  yw_074: (f) => <Yw074 f={f} />,
  yw_075: (f) => <Yw075 f={f} />,
  yw_076: (f) => <Yw076 f={f} />,
  yw_077: (f) => <Yw077 f={f} />,
  yw_078: (f) => <Yw078 f={f} />,
  yw_079: (f) => <Yw079 f={f} />,
  yw_080: (f) => <Yw080 f={f} />,
  yw_081: (f) => <Yw081 f={f} />,
};

export const YW_D1_MOTIFS: string[] = [
  "yw_072",
  "yw_073",
  "yw_074",
  "yw_075",
  "yw_076",
  "yw_077",
  "yw_078",
  "yw_079",
  "yw_080",
  "yw_081",
];

export const yawaD1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
