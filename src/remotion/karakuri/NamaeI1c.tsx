// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#212〜#222 (11文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
import { NP, Nafuda, nafudaKnot, Ito, ItoLegend, Ushiro, MeijiLock } from "./NamaeParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/NP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  // 暗い壁 (#212〜#214)
  wallDark: "#2B2C31",
  wallDark2: "#33343A",
  wallLine: "#1F2024",
  // 番号の札 (無機質な灰色の金属)
  plate: "#8C9095",
  plateLight: "#B5B9BD",
  plateDark: "#686C71",
  plateInk: "#2E3034",
  wire: "#9A9EA3",
  nail: "#5A5D62",
  bulb: "#F3E3B0",
  lightWarm: "#F2DFA6",
  inkBlack: "#121214",
  // 漆喰の壁と木箱 (#215)
  plaster: "#B9B7B2",
  plasterDark: "#9E9C97",
  rail: "#8E8A82",
  crate: "#A97C4E",
  crateDark: "#7E5A36",
  crateLight: "#C49A68",
  floorGray: "#7C7A76",
  // 刑務所の廊下 (#216)
  corrWall: "#BFB8A8",
  corrWallDark: "#A39C8C",
  corrDado: "#8E9A8C",
  door: "#5E6B66",
  doorDark: "#45504C",
  lino: "#8E978F",
  linoDark: "#76807A",
  guard: "#2F3B5C",
  guardDark: "#232C46",
  prisoner: "#7A7A6E",
  prisonerDark: "#5E5E54",
  hairDark: "#3A332E",
  // 戸籍の帳面 (#217)
  desk: "#6B4E36",
  deskDark: "#53392A",
  paper: "#EFE6CF",
  paperShade: "#DCCFB1",
  rule: "#B5654E",
  scribble: "#6E6658",
  cover: "#3E4A5E",
  shadowFig: "#2A2A30",
  // 夕方の部屋 (#218)
  roomWall: "#7D8A99",
  roomWallDark: "#65717F",
  dusk: "#C9A98A",
  duskDark: "#A38470",
  floorWood: "#8A6E52",
  floorWoodDark: "#6E5640",
  narr: "#6F8FB0",
  narrDark: "#4F6C8C",
  // 研究の図書館 (#219〜#222)
  coat: "#F3F1E8",
  coatDark: "#D9D6C8",
  libWood: "#7A5636",
  libWoodDark: "#5A3E26",
  libWoodLight: "#94704C",
  libBack: "#4A3828",
  libBackLit: "#6A5038",
  libFloor: "#6E5A44",
  libCeil: "#3A2C20",
  plaque: "#C9A85A",
  fog: "#9BA3AD",
  fogLight: "#D8DCE0",
  fogDark: "#2C3038",
  rope: "#8A3A3A",
  headphone: "#4A3A2E",
} as const;
const BOOKS = ["#8C5A4A", "#5F7A8C", "#7C8A5A", "#A88A5A", "#6B5A7A", "#9A6A50", "#4F6A6A", "#B09A70", "#7A4A3E", "#58708A"];
void W; void H;
void PersonMini; void Stamp; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void MaruBatsu;
void nafudaKnot; void ItoLegend; void Ushiro; void MeijiLock; void NP;

// ===================================================================
// このファイルだけの小道具
// ===================================================================
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const rnd = (seed: number, i: number) => {
  const s = Math.sin(seed * 131.7 + i * 127.1 + 7.3) * 43758.5453;
  return s - Math.floor(s);
};
const cam = (cx: number, cy: number, s: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${s}) translate(${-cx} ${-cy})`;

// 番号の札 (無機質な灰色の金属札)。x,y は札の中心。s=1 で 300×140。吊り金具の釘は (0,-130)
const NI1cNumPlate: React.FC<{
  x: number; y: number; s?: number; text?: string; rot?: number; faint?: boolean; wire?: boolean;
}> = ({ x, y, s = 1, text = "0000", rot = 0, faint = false, wire = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot} 0 -130)`}>
    {wire && (
      <g>
        <path d="M 0 -130 L -88 -52 M 0 -130 L 88 -52" stroke={C.inkBlack} strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M 0 -130 L -88 -52 M 0 -130 L 88 -52" stroke={C.wire} strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={0} cy={-130} r={11} fill={C.nail} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-3} cy={-133} r={3} fill={C.plateLight} />
      </g>
    )}
    <rect x={-142} y={-60} width={300} height={140} rx={14} fill="#000" opacity={0.3} />
    <rect x={-150} y={-70} width={300} height={140} rx={14} fill={C.plate} stroke={KRP.ink} strokeWidth={7} />
    <rect x={-136} y={-56} width={272} height={112} rx={8} fill="none" stroke={C.plateLight} strokeWidth={4} opacity={0.6} />
    <path d="M -146 52 L 146 52" stroke={C.plateDark} strokeWidth={6} opacity={0.6} />
    {/* 吊り穴 */}
    {[-88, 88].map((hx) => <circle key={hx} cx={hx} cy={-52} r={8} fill={C.plateInk} stroke={KRP.ink} strokeWidth={3} />)}
    {/* 四隅の鋲 */}
    {[[-126, 46], [126, 46], [-126, -40], [126, -40]].map(([rx, ry], i) => (
      i < 2 ? <circle key={i} cx={rx} cy={ry} r={6} fill={C.plateDark} stroke={KRP.ink} strokeWidth={2.5} /> : null
    ))}
    {/* 引っかき傷 */}
    <g stroke={C.plateLight} strokeWidth={2} opacity={0.55}>
      <line x1={-110} y1={-30} x2={-80} y2={-36} />
      <line x1={70} y1={40} x2={112} y2={30} />
      <line x1={20} y1={-44} x2={44} y2={-40} />
    </g>
    <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={82} letterSpacing={6}
      fill={C.plateInk} opacity={faint ? 0.42 : 0.9} style={faint ? { filter: "blur(2.5px)" } : undefined}>{text}</text>
  </g>
);

// 釘 1本
const NI1cNail: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 11 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={C.nail} stroke={KRP.ink} strokeWidth={4} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.3} fill={C.plateLight} />
  </g>
);

// 肩をすくめる腕 (Person を pose="hold" still で描いた上にかぶせる。胴体を描き直して hold の腕を隠す)
//   k: 0=腕を下ろす / 1=手のひらを上に肩をすくめる。swing: 歩くときの腕ふり
const NI1cShrugArms: React.FC<{ x: number; y: number; s: number; cloth: string; k: number; swing?: number }> = ({ x, y, s, cloth, k, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
    <rect x={18} y={-138} width={26} height={20} rx={4} fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.55} />
    {([-1, 1] as const).map((side) => {
      const sw = swing * side;
      const ex = side * lerp(72, 112, k) + sw * 0.5;
      const ey = lerp(-104, -112, k);
      const hx = side * lerp(76, 152, k) + sw;
      const hy = lerp(-64, -162, k);
      const d = `M ${side * 60} -146 L ${ex} ${ey} L ${hx} ${hy}`;
      return (
        <g key={side}>
          <path d={d} stroke={KRP.ink} strokeWidth={31} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} stroke={cloth} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {k > 0.4 ? (
            <ellipse cx={hx + side * 4} cy={hy - 4} rx={15} ry={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4}
              transform={`rotate(${side * -20} ${hx} ${hy})`} />
          ) : (
            <circle cx={hx} cy={hy} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          )}
        </g>
      );
    })}
    {/* すくめた肩の線 */}
    {k > 0.5 && [-1, 1].map((side) => (
      <path key={side} d={`M ${side * 92} -196 q ${side * 14} -10 ${side * 26} -4`} stroke={KRP.ink} strokeWidth={5}
        fill="none" strokeLinecap="round" opacity={(k - 0.5) * 2} />
    ))}
  </g>
);

// 本棚の1区画。x,y は左上 / w,h / rows 段数。empty は本を置かない段 (0 始まり)
const NI1cBay: React.FC<{
  x: number; y: number; w: number; h: number; rows: number; seed: number; empty?: number[]; dim?: number;
}> = ({ x, y, w, h, rows, seed, empty = [], dim = 0 }) => {
  const gap = h / rows;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C.libBack} stroke={KRP.ink} strokeWidth={5} />
      {Array.from({ length: rows }, (_, r) => {
        const by = y + (r + 1) * gap - 14; // 板の上面
        const books: React.ReactNode[] = [];
        if (!empty.includes(r)) {
          let bx = x + 14;
          let i = 0;
          while (bx < x + w - 40) {
            const bw = 20 + rnd(seed + r, i) * 22;
            const bh = gap * (0.62 + rnd(seed + r * 7, i) * 0.26);
            const col = BOOKS[Math.floor(rnd(seed * 3 + r, i) * BOOKS.length)];
            const lean = rnd(seed + 91, i + r * 13) > 0.93 ? 8 : 0;
            books.push(
              <g key={i} transform={lean ? `rotate(${lean} ${bx} ${by})` : undefined}>
                <rect x={bx} y={by - bh} width={bw} height={bh} rx={3} fill={col} stroke={KRP.ink} strokeWidth={3} />
                <rect x={bx + 3} y={by - bh + 12} width={bw - 6} height={5} fill={KRP.white} opacity={0.35} />
                <rect x={bx + 3} y={by - 22} width={bw - 6} height={4} fill={KRP.white} opacity={0.25} />
              </g>,
            );
            bx += bw + 2 + (lean ? 8 : 0);
            i++;
          }
        }
        return (
          <g key={r}>
            {books}
            <rect x={x} y={by} width={w} height={16} fill={C.libWoodLight} stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      })}
      {/* 両脇の柱と天板 */}
      <rect x={x - 14} y={y - 20} width={w + 28} height={26} rx={4} fill={C.libWood} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x - 14} y={y} width={18} height={h} fill={C.libWood} stroke={KRP.ink} strokeWidth={4} />
      <rect x={x + w - 4} y={y} width={18} height={h} fill={C.libWood} stroke={KRP.ink} strokeWidth={4} />
      {dim > 0 && <rect x={x - 14} y={y - 20} width={w + 28} height={h + 20} fill={C.fogDark} opacity={dim} />}
    </g>
  );
};

// 真鍮の小さな銘板 (棚の板の前に付ける)
const NI1cPlaque: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 26 }) => {
  const w = text.length * size + 30;
  return (
    <g>
      <rect x={x - w / 2} y={y - size * 0.75} width={w} height={size * 1.5} rx={6} fill={C.plaque} stroke={KRP.ink} strokeWidth={4} />
      <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={KRP.ink}>{text}</text>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #212 では、名前を奪って、番号で呼ぶと、どうなるのでしょうか。
// 格: 並 / seed 4212
// 絵: 名札 `Nafuda` の字が、f でゆっくり**番号の数字の札** (無機質な灰色の札・数字は「0000」程度) に置きかわりかける (半分重なったところで止まる)。暗い背景。真面目なトーン
// どこ: 夜の物置のような暗い板壁。天井から裸電球が1つ。壁の釘に名札が1枚だけ掛かっている
// 演出: 同じ釘から、灰色の番号の札が上から下りてきて、名札の上半分に覆いかぶさって止まる。名札の字が少しかすむ
// 動き: f6〜30 番号の札が下りる → 着いて小さく揺れて止まる。電球がわずかに揺れ、光の円錐も揺れる。カメラはゆっくり寄る
const Nm212: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const down = easeOut(seg(f, 6, 30));
  const settle = seg(f, 30, 42);
  const swing = Math.sin(settle * Math.PI * 3) * 5 * (1 - settle) - 3 * down;
  const plateY = lerp(-300, 470, down);
  const bulbSway = Math.sin(f / 20) * 4;
  const nail: [number, number] = [960, 200];
  const NY = 580, NS = 1.5;
  return (
    <Frame f={f} seed={4212} bg={C.wallDark} dark>
      {/* 板壁 */}
      {Array.from({ length: 13 }, (_, i) => (
        <g key={i}>
          <rect x={-20 + i * 160} y={-20} width={160} height={H + 40} fill={i % 2 ? C.wallDark : C.wallDark2} />
          <line x1={-20 + i * 160} y1={-20} x2={-20 + i * 160} y2={H + 20} stroke={C.wallLine} strokeWidth={6} />
          <ellipse cx={40 + i * 160 + rnd(4212, i) * 60} cy={200 + rnd(4213, i) * 600} rx={10} ry={6} fill={C.wallLine} opacity={0.7} />
        </g>
      ))}
      {/* 床 */}
      <rect x={-20} y={900} width={W + 40} height={200} fill={C.wallLine} />
      <line x1={-20} y1={900} x2={W + 20} y2={900} stroke={KRP.ink} strokeWidth={6} />
      <g transform={cam(960, 470, z)}>
        {/* 電球の光の円錐 */}
        <polygon points={`${960 + bulbSway},70 ${520 + bulbSway * 6},${H} ${1400 + bulbSway * 6},${H}`} fill={C.lightWarm} opacity={0.09} />
        <circle cx={960} cy={500} r={480} fill={C.lightWarm} opacity={0.05} />
        {/* 名札の吊り紐 (釘 → 輪) */}
        <line x1={nail[0]} y1={nail[1]} x2={960} y2={NY - 152 * NS} stroke={KRP.ink} strokeWidth={6} />
        {/* 壁に落ちる名札の影 */}
        <rect x={960 - 290} y={NY - 130} width={600} height={285} rx={30} fill="#000" opacity={0.25} />
        <Nafuda x={960} y={NY} s={NS} text="山田 花子" f={f} blur={0.22 * down} />
        {/* 番号の札 (同じ釘から下りてくる) */}
        <g transform={`rotate(${swing} ${nail[0]} ${nail[1]})`}>
          {(() => {
            const hy = plateY - 52 * 1.5;
            return (
              <g>
                <path d={`M ${nail[0]} ${nail[1]} L ${960 - 132} ${hy} M ${nail[0]} ${nail[1]} L ${960 + 132} ${hy}`} stroke={C.inkBlack} strokeWidth={9} fill="none" />
                <path d={`M ${nail[0]} ${nail[1]} L ${960 - 132} ${hy} M ${nail[0]} ${nail[1]} L ${960 + 132} ${hy}`} stroke={C.wire} strokeWidth={4} fill="none" />
              </g>
            );
          })()}
          <NI1cNumPlate x={960} y={plateY} s={1.5} wire={false} />
        </g>
        <NI1cNail x={nail[0]} y={nail[1]} r={14} />
        {/* 着いた瞬間の小さな揺れの線 */}
        {settle > 0 && settle < 0.4 && (
          <g stroke={C.plateLight} strokeWidth={5} strokeLinecap="round" opacity={1 - settle * 2.5}>
            <line x1={700} y1={390} x2={660} y2={370} /><line x1={1220} y1={390} x2={1260} y2={370} />
          </g>
        )}
      </g>
      {/* 裸電球 */}
      <g transform={`rotate(${bulbSway} 960 -20)`}>
        <line x1={960} y1={-20} x2={960} y2={60} stroke={KRP.ink} strokeWidth={5} />
        <rect x={948} y={56} width={24} height={18} fill={C.nail} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={960} cy={92} r={24} fill={C.bulb} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={960} cy={92} r={46} fill={C.lightWarm} opacity={0.18 + Math.sin(f / 7) * 0.03} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #213 ナチスの強制収容所では、人は番号で管理されました。
// 格: 図 / seed 4213
// 絵: ★**人や建物は描かない**。暗い壁一面に、灰色の番号の札が整然と並んで掛けられている (数字は判読できない程度の「000」の連なり)。札「ナチスの強制収容所」。音のない静けさ。色はほぼモノクロ
// どこ: 暗い灰色の壁 (建物とは分からない、ただの壁面)。左上から冷たい光が細く差す
// 演出: 番号の札が端から順に、音もなく1枚ずつ掛かって、壁を埋めつくす。1枚だけがかすかに揺れつづける
// 動き: f2〜34 札が行ごとに順に現れる。光の筋の中をホコリが漂う。カメラはゆっくり右へパン
const Nm213: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  const cols = 9, rows = 5;
  return (
    <Frame f={f} seed={4213} bg={C.wallDark} dark>
      {/* 壁 (コンクリートの継ぎ目) */}
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallDark2} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={-20} y1={180 * i + 90} x2={W + 20} y2={180 * i + 90} stroke={C.wallLine} strokeWidth={4} opacity={0.6} />
      ))}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={rnd(4213, i) * W} cy={rnd(4214, i) * H} r={2 + rnd(4215, i) * 4} fill={C.wallLine} opacity={0.6} />
      ))}
      <g transform={`translate(${pan} 0) scale(1.03) translate(-28 -10)`}>
        {Array.from({ length: rows * cols }, (_, k) => {
          const r = Math.floor(k / cols), c = k % cols;
          const x = 160 + c * 200, y = 300 + r * 120;
          const t = seg(f, 2 + k * 0.62, 6 + k * 0.62);
          if (t <= 0) return <NI1cNail key={k} x={x} y={y - 65} r={7} />;
          const rot = k === 22 ? Math.sin(f / 11) * 3 : 0;
          return (
            <g key={k} opacity={t}>
              <NI1cNumPlate x={x} y={y - (1 - t) * 18} s={0.5} faint rot={rot} />
            </g>
          );
        })}
      </g>
      {/* 冷たい光の筋とホコリ */}
      <polygon points="180,-20 420,-20 1500,1100 1100,1100" fill={C.plateLight} opacity={0.07} />
      {Array.from({ length: 14 }, (_, i) => {
        const px = 300 + rnd(4216, i) * 900 + Math.sin((f + i * 9) / 17) * 20;
        const py = (rnd(4217, i) * 900 + f * 1.2) % 1000;
        return <circle key={i} cx={px + py * 0.6} cy={py} r={3} fill={C.plateLight} opacity={0.35} />;
      })}
      <TagPlate x={960} y={130} text="ナチスの強制収容所" size={40} t={seg(f, 4, 14)} fill={C.plateLight} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #214 アウシュヴィッツでは、その番号が、体に入れ墨されています。
// 格: 図 / seed 4214
// 絵: ★**体・入れ墨は描かない**。#213 の番号の札の1枚に、黒いインクの一滴が落ちて、札の縁がにじむ (消せないことの象徴)。札「アウシュヴィッツ」。モノクロ
// どこ: #213 と同じ壁の札の列に、ぐっと寄った所。1枚だけに上から冷たい光
// 演出: 上から伸びたつけペンの先に黒いインクの玉がふくらみ、落ちて札に当たる。しみが広がって札の縁まで届き、縁から黒いしずくが垂れる
// 動き: f0〜8 玉がふくらむ → f8〜16 落ちる → f16 はねる → f16〜40 しみが広がる → f28〜42 縁から垂れる。カメラはしみへ寄る
const Nm214: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.08 * easeInOut(seg(f, 0, 42));
  const PX = 960, PY = 540, PS = 2.3;
  const L: [number, number] = [1190, 600]; // 落ちる所
  const grow = clamp01(seg(f, 0, 8));
  const fall = seg(f, 8, 16);
  const dropY = lerp(232, L[1], fall * fall);
  const splash = seg(f, 16, 24);
  const R = 135 * easeOut(seg(f, 16, 40));
  const drip = seg(f, 28, 42);
  const blob = (cx: number, cy: number, r: number, sd: number) =>
    Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2;
      const rr = r * (1 + 0.16 * Math.sin(5 * a + sd) + 0.09 * Math.sin(11 * a + sd * 2) + 0.05 * Math.sin(17 * a));
      return `${i ? "L" : "M"} ${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.9).toFixed(1)}`;
    }).join(" ") + " Z";
  const px0 = PX - 150 * PS, py0 = PY - 70 * PS, pw = 300 * PS, ph = 140 * PS;
  return (
    <Frame f={f} seed={4214} bg={C.wallDark} dark>
      <defs>
        <clipPath id="ni1cClip214"><rect x={px0} y={py0} width={pw} height={ph} rx={14 * PS} /></clipPath>
        <filter id="ni1cFeather214"><feGaussianBlur stdDeviation={5} /></filter>
      </defs>
      <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.wallDark2} />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={rnd(4218, i) * W} cy={rnd(4219, i) * H} r={3 + rnd(4220, i) * 5} fill={C.wallLine} opacity={0.6} />
      ))}
      <g transform={cam(L[0], L[1], z)}>
        {/* 周りの札 (暗く沈む) */}
        {[[-820, 0], [820, 0], [0, -420], [0, 420], [-820, -420], [820, -420], [-820, 420], [820, 420]].map(([dx, dy], i) => (
          <g key={i} opacity={0.32}>
            <NI1cNumPlate x={PX + dx} y={PY + dy} s={PS} faint />
          </g>
        ))}
        {/* 1枚だけに当たる冷たい光 */}
        <ellipse cx={PX} cy={PY} rx={540} ry={330} fill={C.plateLight} opacity={0.12} />
        <NI1cNumPlate x={PX} y={PY} s={PS} />
        {/* しみ (札の形で切り抜く) */}
        {R > 1 && (
          <g clipPath="url(#ni1cClip214)">
            <path d={blob(L[0], L[1], R * 1.12, 2.1)} fill={C.inkBlack} opacity={0.45} filter="url(#ni1cFeather214)" />
            <path d={blob(L[0], L[1], R, 1.3)} fill={C.inkBlack} opacity={0.9} />
            {/* 札の繊維に沿って走る細いにじみ */}
            <g stroke={C.inkBlack} strokeWidth={4} opacity={0.7} strokeLinecap="round">
              {Array.from({ length: 9 }, (_, i) => {
                const a = (i / 9) * Math.PI * 2 + 0.3;
                return <line key={i} x1={L[0] + Math.cos(a) * R * 0.9} y1={L[1] + Math.sin(a) * R * 0.8}
                  x2={L[0] + Math.cos(a) * R * 1.35} y2={L[1] + Math.sin(a) * R * 1.2} />;
              })}
            </g>
            {/* 縁が黒く染まる */}
            <rect x={px0} y={py0} width={pw} height={ph} rx={14 * PS} fill="none" stroke={C.inkBlack} strokeWidth={22 * seg(f, 26, 40)} opacity={0.6} />
          </g>
        )}
        {/* 縁から垂れるしずく */}
        {drip > 0 && [[1150, 60], [1215, 100], [1262, 44]].map(([dx, len], i) => (
          <g key={i}>
            <path d={`M ${dx - 7} ${py0 + ph - 4} L ${dx - 4} ${py0 + ph + len * drip} Q ${dx} ${py0 + ph + len * drip + 14} ${dx + 4} ${py0 + ph + len * drip} L ${dx + 7} ${py0 + ph - 4} Z`}
              fill={C.inkBlack} />
          </g>
        ))}
        {/* はね */}
        {splash > 0 && splash < 1 && (
          <g fill={C.inkBlack} opacity={1 - splash}>
            {Array.from({ length: 7 }, (_, i) => {
              const a = -Math.PI * (0.1 + (i / 6) * 0.8);
              return <circle key={i} cx={L[0] + Math.cos(a) * 90 * splash} cy={L[1] + Math.sin(a) * 70 * splash + splash * splash * 40} r={7} />;
            })}
          </g>
        )}
        {/* 落ちていくインクの玉 */}
        {fall < 1 && grow > 0 && (
          <path d={`M ${L[0]} ${dropY - 26 * grow} Q ${L[0] + 14 * grow} ${dropY} ${L[0]} ${dropY + 10 * grow} Q ${L[0] - 14 * grow} ${dropY} ${L[0]} ${dropY - 26 * grow} Z`}
            fill={C.inkBlack} stroke={C.plateLight} strokeWidth={2} />
        )}
        {/* つけペン (上から差し出される。人は描かない) */}
        <g transform={`translate(${L[0]} 214) rotate(-24)`}>
          <rect x={-18} y={-420} width={36} height={300} rx={14} fill={C.plateDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-20} y={-130} width={40} height={50} rx={6} fill={C.nail} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -16 -80 L 16 -80 L 3 0 L -3 0 Z" fill={C.plateLight} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={-60} x2={0} y2={-4} stroke={KRP.ink} strokeWidth={2} />
          <path d="M -8 -40 L 8 -40 L 2 -2 L -2 -2 Z" fill={C.inkBlack} />
        </g>
      </g>
      <TagPlate x={520} y={130} text="アウシュヴィッツ" size={40} t={seg(f, 4, 14)} fill={C.plateLight} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #215 名前を消して番号にすることは、相手を、ひとりの人として見なくするための仕組みだった、と指摘されています。
// 格: 山 / seed 4215
// 絵: 名札が並んだ壁から、名札が1枚ずつ外されて番号の札に掛けかえられていく (f)。外された名札は箱に落ちる。壁の前に人はいない。札「〜と指摘されている」(小さく)。モノクロから、最後に名札の箱だけ少し色が戻る
// どこ: 色の抜けた漆喰の壁。腰の高さに木の桟、釘が8本。高窓の光が四角く落ちる。右の床に木箱
// 演出: 誰もいないのに、名札が1枚ずつ浮いて外れ、弧を描いて箱へ落ちる。空いた釘に番号の札が下りてくる。最後の1枚 (左下) だけ名札が残って震えている。箱の中の名札だけ色が戻る
// 動き: 7回の掛けかえ (f3〜42、5コマおき)。落ちる名札は回転しながら弧を描く。箱は f34〜42 で色が戻る。カメラは左から右へ少しパン
const NAMES215 = ["山田 花子", "佐藤 一郎", "鈴木 和子", "高橋 誠", "田中 正男", "伊藤 春子", "渡辺 茂", "小林 千代"];
const Nm215: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(20, -20, easeInOut(seg(f, 0, 42)));
  const slots = Array.from({ length: 8 }, (_, k) => ({ x: 300 + (k % 4) * 300, y: 330 + Math.floor(k / 4) * 270 }));
  const order = [0, 1, 2, 3, 7, 6, 5]; // slot 4 (左下) は最後まで残る
  const NS = 0.55, PS = 0.7;
  const box = { x: 1620, y: 640 };
  const sat = lerp(0.1, 1, easeOut(seg(f, 34, 42)));
  type St = { lift: number; fall: number; plate: number };
  const st: Record<number, St> = {};
  order.forEach((slot, k) => {
    const s0 = 3 + k * 5.2;
    st[slot] = { lift: seg(f, s0, s0 + 3), fall: seg(f, s0 + 3, s0 + 9), plate: easeOut(seg(f, s0 + 4, Math.min(42, s0 + 9))) };
  });
  const landed = order.filter((slot) => st[slot].fall >= 1).length;
  const last = slots[4];
  const tremble = f > 34 ? Math.sin(f * 1.3) * 1.6 : 0;
  return (
    <Frame f={f} seed={4215} bg={C.plaster}>
      <defs>
        <filter id="ni1cGray215"><feColorMatrix type="saturate" values="0.1" /></filter>
        <filter id="ni1cBox215"><feColorMatrix type="saturate" values={sat.toFixed(3)} /></filter>
      </defs>
      <g transform={`translate(${pan} 0)`}>
        <g filter="url(#ni1cGray215)">
          {/* 漆喰の壁 */}
          <rect x={-60} y={-20} width={W + 120} height={H + 40} fill={C.plaster} />
          {Array.from({ length: 30 }, (_, i) => (
            <ellipse key={i} cx={rnd(4215, i) * W} cy={rnd(4216, i) * 820} rx={20 + rnd(4217, i) * 60} ry={8 + rnd(4218, i) * 20}
              fill={C.plasterDark} opacity={0.35} />
          ))}
          <path d="M 1380 0 L 1350 120 L 1390 210 L 1360 300" stroke={C.plasterDark} strokeWidth={4} fill="none" />
          {/* 高窓の光 */}
          <polygon points="80,60 420,60 560,520 220,520" fill={KRP.white} opacity={0.18} />
          {/* 腰板と床 */}
          <rect x={-60} y={830} width={W + 120} height={260} fill={C.floorGray} />
          <line x1={-60} y1={830} x2={W + 60} y2={830} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={-60 + i * 240} y1={830} x2={-160 + i * 260} y2={1090} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          ))}
          {/* 釘を打つ木の桟 (2段) */}
          {[0, 1].map((r) => (
            <rect key={r} x={120} y={330 + r * 270 - 104} width={1360} height={30} rx={4} fill={C.rail} stroke={KRP.ink} strokeWidth={5} />
          ))}
          {/* 札たち */}
          {slots.map((p, k) => {
            const nailY = p.y - 152 * NS;
            const s = st[k];
            const nodes: React.ReactNode[] = [];
            // 名札 (まだ掛かっている / 浮いて外れるところ)
            if (!s || s.fall <= 0) {
              const up = s ? easeOut(s.lift) * 34 : 0;
              nodes.push(
                <g key="n" transform={k === 4 ? `rotate(${tremble} ${p.x} ${nailY})` : undefined}>
                  <Nafuda x={p.x} y={p.y - up} s={NS} text={NAMES215[k]} f={f + k * 7} />
                </g>,
              );
              if (s && s.lift > 0) nodes.push(
                <g key="m" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={s.lift}>
                  <line x1={p.x - 70} y1={p.y + 60} x2={p.x - 70} y2={p.y + 90} /><line x1={p.x + 70} y1={p.y + 60} x2={p.x + 70} y2={p.y + 90} />
                </g>,
              );
            }
            // 番号の札 (上から下りてくる)
            if (s && s.plate > 0) {
              const py = nailY + 130 * PS - (1 - s.plate) * 220;
              nodes.push(
                <g key="p" opacity={clamp01(s.plate * 1.6)}>
                  <NI1cNumPlate x={p.x} y={py} s={PS} wire={s.plate >= 1} />
                </g>,
              );
            }
            nodes.push(<NI1cNail key="nail" x={p.x} y={nailY} r={9} />);
            return <g key={k}>{nodes}</g>;
          })}
          {/* 落ちていく名札 */}
          {order.map((slot) => {
            const s = st[slot];
            if (s.fall <= 0 || s.fall >= 1) return null;
            const p = slots[slot];
            const u = s.fall;
            const tx = lerp(p.x, box.x - 60 + (slot % 3) * 50, u);
            const ty = lerp(p.y - 34, box.y - 10, u * u) - Math.sin(u * Math.PI) * 90;
            return (
              <g key={slot} transform={`rotate(${u * 160 * (slot % 2 ? 1 : -1)} ${tx} ${ty})`}>
                <Nafuda x={tx} y={ty} s={NS * 0.8} text={NAMES215[slot]} hang={false} />
              </g>
            );
          })}
          {/* 最後の1枚の震えの線 */}
          {f > 34 && (
            <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={0.6}>
              <path d={`M ${last.x - 140} ${last.y - 30} q -12 20 0 40`} fill="none" />
              <path d={`M ${last.x + 140} ${last.y - 30} q 12 20 0 40`} fill="none" />
            </g>
          )}
        </g>
        {/* 名札の箱 (最後に色が戻る) */}
        <g filter="url(#ni1cBox215)">
          <ellipse cx={box.x} cy={835} rx={220} ry={22} fill={KRP.ink} opacity={0.25} />
          <rect x={box.x - 190} y={box.y - 30} width={380} height={40} fill={C.crateDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: landed }, (_, i) => {
            const slot = order[i];
            return (
              <g key={i} transform={`rotate(${(rnd(4215, i) - 0.5) * 50} ${box.x - 120 + (i % 4) * 80} ${box.y - 10 - Math.floor(i / 4) * 30})`}>
                <Nafuda x={box.x - 120 + (i % 4) * 80} y={box.y - 10 - Math.floor(i / 4) * 30} s={NS * 0.8} text={NAMES215[slot]} hang={false} />
              </g>
            );
          })}
          <rect x={box.x - 200} y={box.y} width={400} height={190} rx={6} fill={C.crate} stroke={KRP.ink} strokeWidth={7} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={box.x - 200} y1={box.y + 62 + i * 62} x2={box.x + 200} y2={box.y + 62 + i * 62} stroke={C.crateDark} strokeWidth={5} />
          ))}
          <rect x={box.x - 200} y={box.y} width={34} height={190} fill={C.crateLight} stroke={KRP.ink} strokeWidth={5} />
          <rect x={box.x + 166} y={box.y} width={34} height={190} fill={C.crateLight} stroke={KRP.ink} strokeWidth={5} />
          {[[box.x - 183, box.y + 20], [box.x + 183, box.y + 20], [box.x - 183, box.y + 170], [box.x + 183, box.y + 170]].map(([nx, ny], i) => (
            <circle key={i} cx={nx} cy={ny} r={5} fill={C.nail} />
          ))}
          {sat > 0.2 && <ellipse cx={box.x} cy={box.y - 30} rx={240} ry={90} fill={NP.glow} opacity={0.18 * sat} />}
        </g>
      </g>
      <TagPlate x={1580} y={140} text="〜と指摘されている" size={28} t={seg(f, 10, 20)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #216 日本の刑務所では、2024年4月から、受刑者を「さん」付けで呼ぶようになりました。
// 格: 山 / seed 4216
// 絵: 刑務所の廊下 (コンクリートの壁・鉄の扉・窓から差す光)。刑務官が名簿を見ながら呼びかけ、吹き出しに「○○さん」(○○は空白の四角)。受刑者の後ろ姿が振り返りかける。札「2024年4月」。色が少し戻る
// どこ: 刑務所の長い廊下。コンクリートブロックの壁、鉄の扉が2枚、天井の蛍光灯と配管、左上の格子の高窓から朝の光が床に斜めに落ちる。壁に4月のカレンダー
// 演出: 刑務官が名簿から目を上げて呼びかける (吹き出しが出る)。扉の前の受刑者が、背中を向けたまま首だけ振り返りかける
// 動き: f4〜12 刑務官が名簿から顔を上げる → f12〜20 吹き出し → f20〜36 受刑者の首が回り、耳と頬がのぞく。光の筋のホコリ。カメラは少し寄りながら右へ
const Nm216: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.05, easeInOut(seg(f, 0, 42)));
  const dx = lerp(10, -20, easeInOut(seg(f, 0, 42)));
  const look = easeOut(seg(f, 4, 12));
  const bub = seg(f, 12, 20);
  const turn = 0.85 * easeOut(seg(f, 20, 36));
  const G = { x: 600, y: 860, s: 1.05 };
  const P = { x: 1330, y: 870, s: 1.0 };
  const hy = P.y - 228 * P.s;
  return (
    <Frame f={f} seed={4216} bg={C.corrWall}>
      <g transform={cam(960, 540, z, dx)}>
        {/* 壁 (コンクリートブロック) */}
        <rect x={-80} y={-20} width={W + 160} height={800} fill={C.corrWall} />
        {Array.from({ length: 9 }, (_, r) => (
          <g key={r}>
            <line x1={-80} y1={100 + r * 75} x2={W + 80} y2={100 + r * 75} stroke={C.corrWallDark} strokeWidth={3} />
            {Array.from({ length: 12 }, (_, c) => (
              <line key={c} x1={-80 + c * 180 + (r % 2) * 90} y1={100 + r * 75} x2={-80 + c * 180 + (r % 2) * 90} y2={175 + r * 75}
                stroke={C.corrWallDark} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 腰の塗り分け */}
        <rect x={-80} y={560} width={W + 160} height={220} fill={C.corrDado} />
        <line x1={-80} y1={560} x2={W + 80} y2={560} stroke={KRP.ink} strokeWidth={5} />
        {/* 天井と配管・蛍光灯 */}
        <rect x={-80} y={-20} width={W + 160} height={100} fill={C.corrWallDark} />
        <line x1={-80} y1={80} x2={W + 80} y2={80} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-80} y={92} width={W + 160} height={18} rx={9} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
        {[300, 1500].map((lx) => (
          <g key={lx}>
            <rect x={lx - 120} y={30} width={240} height={26} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={lx - 130} y={20} width={260} height={12} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 鉄の扉 2枚 */}
        {[{ x: 120 }, { x: 1230 }].map((d, i) => (
          <g key={i}>
            <rect x={d.x - 12} y={398} width={244} height={382} fill={C.doorDark} stroke={KRP.ink} strokeWidth={5} />
            <rect x={d.x} y={410} width={220} height={370} fill={C.door} stroke={KRP.ink} strokeWidth={6} />
            <rect x={d.x + 70} y={450} width={80} height={46} rx={4} fill={C.doorDark} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((b) => <line key={b} x1={d.x + 90 + b * 20} y1={452} x2={d.x + 90 + b * 20} y2={494} stroke={KRP.ink} strokeWidth={3} />)}
            <rect x={d.x + 60} y={620} width={100} height={22} rx={4} fill={C.doorDark} stroke={KRP.ink} strokeWidth={3} />
            <rect x={d.x + 188} y={590} width={18} height={50} rx={5} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
            {Array.from({ length: 8 }, (_, k) => (
              <circle key={k} cx={d.x + 14 + (k % 2) * 192} cy={430 + Math.floor(k / 2) * 110} r={5} fill={C.doorDark} />
            ))}
          </g>
        ))}
        {/* 格子の高窓 */}
        <rect x={560} y={140} width={300} height={150} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((b) => <rect key={b} x={586 + b * 56} y={140} width={10} height={150} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2} />)}
        <rect x={548} y={286} width={324} height={16} fill={C.corrWallDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 4月のカレンダー */}
        <g transform="rotate(2 1605 300)">
          <rect x={1530} y={210} width={150} height={190} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1530} y={210} width={150} height={44} fill={KRP.red} opacity={0.75} stroke={KRP.ink} strokeWidth={4} />
          <text x={1605} y={242} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={KRP.white}>2024</text>
          <text x={1605} y={318} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.ink}>4</text>
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={1544 + (i % 5) * 26} y={340 + Math.floor(i / 5) * 22} width={18} height={12} fill={KRP.gray} />
          ))}
          <circle cx={1605} cy={204} r={6} fill={C.nail} />
        </g>
        {/* 床 (リノリウム) */}
        <rect x={-80} y={780} width={W + 160} height={320} fill={C.lino} />
        <line x1={-80} y1={780} x2={W + 80} y2={780} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => <line key={i} x1={-80} y1={830 + i * 70} x2={W + 80} y2={830 + i * 70} stroke={C.linoDark} strokeWidth={3} />)}
        {/* 窓からの光 (色が少し戻る) */}
        <polygon points="560,290 860,290 1500,1080 1000,1080" fill={KRP.yellow} opacity={0.16} />
        {Array.from({ length: 10 }, (_, i) => {
          const u = (rnd(4216, i) + f / 240) % 1;
          return <circle key={i} cx={lerp(700, 1250, u) + rnd(4217, i) * 120} cy={lerp(320, 1000, u)} r={3} fill={KRP.white} opacity={0.5} />;
        })}
        {/* 影 */}
        <ellipse cx={G.x} cy={G.y + 4} rx={110} ry={16} fill={KRP.ink} opacity={0.2} />
        <ellipse cx={P.x} cy={P.y + 4} rx={100} ry={15} fill={KRP.ink} opacity={0.2} />
        {/* 刑務官 (名簿を持って呼びかける) */}
        <Person x={G.x} y={G.y} s={G.s} f={f} cloth={C.guard} clothDark={C.guardDark} pose="hold" face="normal"
          gaze={[lerp(0, 0.8, look), lerp(0.7, -0.1, look)]} lean={lerp(-2, 3, look)} />
        {/* 名簿 (クリップボード) */}
        <g transform={`translate(${G.x} ${G.y - 118 * G.s}) rotate(${lerp(-24, -8, look)})`}>
          <rect x={-56} y={-70} width={112} height={140} rx={6} fill={C.desk} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-46} y={-56} width={92} height={118} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-36} y1={-36 + i * 20} x2={36} y2={-36 + i * 20} stroke={KRP.grayDark} strokeWidth={4} />)}
          <rect x={-20} y={-78} width={40} height={16} rx={3} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 制帽 */}
        {(() => {
          const sx = G.x, sy = G.y - 228 * G.s, k = G.s;
          return (
            <g transform={`translate(${sx} ${sy + Math.sin(f / 13) * 3}) scale(${k}) rotate(${lerp(-2, 3, look)} 0 228)`}>
              <path d="M -70 -36 Q -80 -96 0 -100 Q 80 -96 70 -36 Z" fill={C.guard} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-70} y={-44} width={140} height={22} fill={C.guardDark} stroke={KRP.ink} strokeWidth={4} />
              <path d="M -66 -24 Q 0 -6 66 -24 L 60 -16 Q 0 4 -60 -16 Z" fill={KRP.ink} />
              <circle cx={0} cy={-62} r={11} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })()}
        {/* 受刑者 (後ろ姿・扉の前) */}
        <Person x={P.x} y={P.y} s={P.s} f={f} phase={2} cloth={C.prisoner} clothDark={C.prisonerDark} hair="none" face="normal" />
        <g transform={`translate(${P.x} ${hy + Math.sin((f + 34) / 13) * 3}) scale(${P.s})`}>
          {/* 頬がのぞく (白い頭の左端) → 後頭部の髪で顔を隠す */}
          <circle cx={0} cy={0} r={66} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
          <circle cx={turn * 16} cy={-2} r={66} fill={C.hairDark} stroke={KRP.ink} strokeWidth={5.5} />
          <path d={`M ${-36 + turn * 16} -40 Q ${turn * 16} -58 ${36 + turn * 16} -40`} stroke={KRP.white} strokeWidth={5} opacity={0.2} fill="none" />
          <ellipse cx={-64 + turn * 4} cy={8} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={66 + turn * 10} cy={8} rx={10 - turn * 5} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {/* 背中の襟 */}
          <path d="M -40 70 Q 0 86 40 70" stroke={C.prisonerDark} strokeWidth={8} fill="none" />
        </g>
        {turn > 0.2 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={clamp01((turn - 0.2) * 3)}>
            <path d={`M ${P.x - 110} ${hy - 40} q -16 20 0 44`} fill="none" />
            <path d={`M ${P.x - 134} ${hy - 50} q -20 28 0 62`} fill="none" />
          </g>
        )}
        {/* 吹き出し「□□さん」 */}
        {bub > 0 && (
          <g transform={`translate(860 400) scale(${pop(bub)})`}>
            <path d="M -170 -80 L 190 -80 Q 220 -80 220 -50 L 220 50 Q 220 80 190 80 L -60 80 L -170 170 L -110 80 L -170 80 Q -200 80 -200 50 L -200 -50 Q -200 -80 -170 -80 Z"
              fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
            {[0, 1].map((i) => <rect key={i} x={-160 + i * 92} y={-36} width={76} height={76} rx={6} fill="none" stroke={KRP.ink} strokeWidth={6} />)}
            <text x={100} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={78} fill={KRP.ink}>さん</text>
          </g>
        )}
      </g>
      <TagPlate x={1560} y={150} text="2024年4月" size={42} t={seg(f, 6, 16)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #217 いまの日本にも、戸籍に名前が載っていない人がいます。国が把握しているだけで、700人です。
// 格: 山 / seed 4217
// 絵: 戸籍の帳面 (第5章と同じ形) の見開きに、**空白の欄**がいくつか並ぶ。欄の外に、名札を持たない人の小さな影が立つ (後ろ姿・顔なし)。帳簿の糸 (藍) が、その人のところでは途切れている。札「700人 (国が把握している数)」
// どこ: 役所の机の上。藍の布表紙の帳面が見開きで置かれ、卓上ランプが照らす。判子・朱肉・筆・虫めがね
// 演出: 縦書きの欄の下を帳簿の糸が左から順に結んでいく。空白の欄では糸が切れて垂れる。帳面の外に立つ小さな影へ伸びた糸も、届く手前で切れる
// 動き: f4〜22 糸が欄から欄へ伸びる (空白の欄で切れる) → f22〜30 影へ伸びる → f30〜38 切れる。空白の欄の点線枠が順に光る。カメラは右の影へ少しパン
const Nm217: React.FC<{ f: number }> = ({ f }) => {
  const dx = lerp(30, -30, easeInOut(seg(f, 0, 42)));
  const pageL = 200, pageR = 790, pageW = 570, top = 190, bot = 640;
  const NCOL = 8;
  const colW = (pageW - 40) / NCOL;
  const cols = Array.from({ length: NCOL * 2 }, (_, i) => {
    const px = i < NCOL ? pageL : pageR;
    return { x: px + 20 + colW * ((i % NCOL) + 0.5), blank: [5, 9, 14].includes(i) };
  });
  const knotY = 612;
  const filled = cols.map((c, i) => ({ ...c, i })).filter((c) => !c.blank);
  const fig = { x: 1640, y: 800, s: 0.75 };
  const lastK = filled[filled.length - 1];
  const reachT = seg(f, 22, 30);
  const reachCut = seg(f, 30, 38);
  return (
    <Frame f={f} seed={4217} bg={C.desk}>
      <defs>
        <filter id="ni1cSil217"><feFlood floodColor={C.shadowFig} result="c" /><feComposite in="c" in2="SourceAlpha" operator="in" /></filter>
      </defs>
      <g transform={`translate(${dx} 0)`}>
        {/* 机 (木目) */}
        <rect x={-80} y={-20} width={W + 160} height={H + 40} fill={C.desk} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -80 ${40 + i * 140} q 500 ${rnd(4217, i) * 30 - 15} 1000 0 q 500 ${rnd(4218, i) * 30 - 15} 1100 0`}
            stroke={C.deskDark} strokeWidth={5} fill="none" opacity={0.6} />
        ))}
        {/* ランプの光 */}
        <ellipse cx={800} cy={430} rx={760} ry={420} fill={C.lightWarm} opacity={0.16 + Math.sin(f / 9) * 0.01} />
        {/* 帳面: 表紙 → 紙の重なり → 見開き */}
        <rect x={pageL - 30} y={top - 26} width={pageW * 2 + 80} height={bot - top + 60} rx={14} fill={C.cover} stroke={KRP.ink} strokeWidth={7} />
        {[10, 5].map((o) => (
          <rect key={o} x={pageL - o} y={top - o + 8} width={pageW * 2 + 20 + o * 2} height={bot - top + 4} rx={6} fill={C.paperShade} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {[pageL, pageR].map((px, pi) => (
          <g key={pi}>
            <rect x={px} y={top} width={pageW} height={bot - top} fill={C.paper} stroke={KRP.ink} strokeWidth={5} />
            {/* 見出しの帯 */}
            <rect x={px + 20} y={top + 18} width={pageW - 40} height={44} fill="none" stroke={C.rule} strokeWidth={3} />
            {Array.from({ length: 5 }, (_, i) => (
              <rect key={i} x={px + 40 + i * 100} y={top + 32} width={60} height={14} fill={C.scribble} opacity={0.4} />
            ))}
            {/* 縦の罫 */}
            <rect x={px + 20} y={top + 72} width={pageW - 40} height={bot - top - 100} fill="none" stroke={C.rule} strokeWidth={3} />
            {Array.from({ length: NCOL - 1 }, (_, i) => (
              <line key={i} x1={px + 20 + colW * (i + 1)} y1={top + 72} x2={px + 20 + colW * (i + 1)} y2={bot - 28} stroke={C.rule} strokeWidth={2.5} />
            ))}
          </g>
        ))}
        {/* のど (真ん中の綴じ) */}
        <rect x={pageL + pageW} y={top} width={pageR - pageL - pageW} height={bot - top} fill={C.paperShade} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={(pageL + pageW + pageR) / 2} cy={top + 60 + i * 120} r={5} fill={C.cover} />)}
        {/* 欄の中身 (読めない縦書き) と空白の欄 */}
        {cols.map((c, i) => {
          if (c.blank) {
            const k = [5, 9, 14].indexOf(i);
            const t = seg(f, 10 + k * 5, 16 + k * 5);
            return (
              <g key={i}>
                <rect x={c.x - colW / 2 + 5} y={top + 78} width={colW - 10} height={bot - top - 112} fill={C.lightWarm} opacity={0.35 * t} />
                <rect x={c.x - colW / 2 + 5} y={top + 78} width={colW - 10} height={bot - top - 112} fill="none"
                  stroke={KRP.red} strokeWidth={4} strokeDasharray="12 9" opacity={t} />
                <circle cx={c.x} cy={knotY} r={9} fill="none" stroke={KRP.grayDark} strokeWidth={3} strokeDasharray="4 4" />
              </g>
            );
          }
          return (
            <g key={i}>
              {Array.from({ length: 6 }, (_, j) => (
                <rect key={j} x={c.x - 6} y={top + 96 + j * 52} width={12} height={20 + rnd(4217 + i, j) * 22} rx={4} fill={C.scribble} opacity={0.75} />
              ))}
              {rnd(4300, i) > 0.4 && <circle cx={c.x} cy={top + 380} r={14} fill="none" stroke={KRP.red} strokeWidth={4} opacity={0.6} />}
            </g>
          );
        })}
        {/* 帳簿の糸: 欄から欄へ。空白をまたぐ所は切れている */}
        {filled.slice(0, -1).map((c, k) => {
          const n = filled[k + 1];
          const s0 = 4 + k * 1.3;
          const t = seg(f, s0, s0 + 3);
          const across = n.i - c.i > 1;
          if (across) {
            if (t < 1) return null;
            return <Ito key={k} from={[c.x, knotY]} to={[n.x, knotY]} kind="chobo" sag={14} cut={0.5 * seg(f, s0 + 3, s0 + 8)} f={f} />;
          }
          return <Ito key={k} from={[c.x, knotY]} to={[n.x, knotY]} kind="chobo" sag={10} t={t} f={f} />;
        })}
        {filled.map((c, k) => (
          <circle key={k} cx={c.x} cy={knotY} r={9} fill={NP.chobo} stroke={KRP.ink} strokeWidth={3}
            opacity={seg(f, 3 + k * 1.3, 5 + k * 1.3)} />
        ))}
        {/* 帳面の外の小さな影へ伸びる糸 → 届く手前で切れる */}
        {reachT > 0 && (reachCut <= 0
          ? <Ito from={[lastK.x, knotY]} to={[fig.x - 50, fig.y - 50]} kind="chobo" sag={60} t={reachT} f={f} />
          : <Ito from={[lastK.x, knotY]} to={[fig.x - 50, fig.y - 50]} kind="chobo" sag={60} cut={0.5 * reachCut} f={f} />)}
        {/* 名札を持たない人の影 (後ろ姿・顔なし) */}
        <ellipse cx={fig.x} cy={fig.y + 4} rx={70} ry={12} fill={KRP.ink} opacity={0.35} />
        <g filter="url(#ni1cSil217)">
          <Person x={fig.x} y={fig.y} s={fig.s} f={f} hair="cap" face="normal" lean={-3} />
        </g>
        {/* 机の小物: 判子と朱肉・筆・虫めがね */}
        <g>
          <ellipse cx={300} cy={850} rx={80} ry={30} fill={KRP.ink} opacity={0.25} />
          <ellipse cx={300} cy={840} rx={76} ry={28} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={300} cy={836} rx={58} ry={18} fill={KRP.red} opacity={0.8} />
          <rect x={420} y={760} width={40} height={90} rx={10} fill={C.crateLight} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={440} cy={760} rx={20} ry={7} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <g transform="rotate(-18 900 800)">
            <rect x={640} y={790} width={360} height={18} rx={9} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 1000 790 L 1060 799 L 1000 808 Z" fill={KRP.ink} />
          </g>
          <g transform="rotate(30 1460 360)">
            <circle cx={1460} cy={360} r={62} fill={KRP.blueSoft} opacity={0.5} stroke={KRP.ink} strokeWidth={8} />
            <rect x={1450} y={422} width={20} height={110} rx={8} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
      </g>
      {/* 卓上ランプの笠 (左上から) */}
      <g>
        <path d="M -20 -20 L 160 -20 L 120 60 L -20 60 Z" fill={C.cover} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={80} cy={64} rx={70} ry={14} fill={C.bulb} opacity={0.8} />
      </g>
      <TagPlate x={1480} y={122} text="700人 (国が把握している数)" size={36} t={seg(f, 30, 40)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #218 では、名前を呼ばれなくなった人は、自分を忘れてしまうのか。
// 格: 並 / seed 4218
// 絵: ナレーター役の Person が名札 `Nafuda` を見つめる。名札の字がゆらゆら (`blur` 0→0.4→0)。`QMark`
// どこ: 夕暮れの自分の部屋。窓の外は暮れかけ、壁のフックに名札が1枚掛かる。小さな棚に置き時計と観葉植物
// 演出: ナレーターが名札に顔を近づけて見つめると、名札の字がゆらゆらかすんでいく。頭の上に「？」
// 動き: f8〜30 字がかすむ (blur 0.4 まで、f70 以降で戻る)。名札がゆっくり揺れる。f24〜32 で ？。時計の振り子。カメラは名札と人の間へ寄る
const Nm218: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.07 * easeInOut(seg(f, 0, 42));
  const blur = 0.4 * easeOut(seg(f, 8, 30)) * (1 - seg(f, 70, 100));
  const lean = lerp(0, 6, easeOut(seg(f, 4, 24)));
  const TX = 1240, TY = 440;
  return (
    <Frame f={f} seed={4218} bg={C.roomWall}>
      <g transform={cam(1000, 480, z)}>
        {/* 壁と腰板 */}
        <rect x={-80} y={-40} width={W + 160} height={H + 80} fill={C.roomWall} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-40 + i * 150} y1={-40} x2={-40 + i * 150} y2={620} stroke={C.roomWallDark} strokeWidth={3} opacity={0.5} />
        ))}
        <rect x={-80} y={620} width={W + 160} height={200} fill={C.roomWallDark} />
        <rect x={-80} y={608} width={W + 160} height={20} fill={C.floorWoodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 床 */}
        <rect x={-80} y={820} width={W + 160} height={300} fill={C.floorWood} />
        <line x1={-80} y1={820} x2={W + 80} y2={820} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 4 }, (_, i) => <line key={i} x1={-80} y1={860 + i * 60} x2={W + 80} y2={860 + i * 60} stroke={C.floorWoodDark} strokeWidth={3} />)}
        {/* 夕暮れの窓 */}
        <rect x={110} y={140} width={340} height={380} fill={C.dusk} stroke={KRP.ink} strokeWidth={8} />
        <rect x={110} y={140} width={340} height={150} fill={C.duskDark} />
        <circle cx={330} cy={420} r={40} fill={KRP.orange} opacity={0.6} />
        <path d="M 110 470 L 180 430 L 230 460 L 300 420 L 380 455 L 450 430 L 450 520 L 110 520 Z" fill={C.roomWallDark} />
        <line x1={280} y1={140} x2={280} y2={520} stroke={KRP.ink} strokeWidth={7} />
        <line x1={110} y1={330} x2={450} y2={330} stroke={KRP.ink} strokeWidth={7} />
        <path d={`M 80 120 Q ${120 + Math.sin(f / 18) * 6} 340 100 560 L 60 560 L 60 120 Z`} fill={C.narrDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={60} y={110} width={440} height={16} rx={8} fill={C.floorWoodDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 窓の光が床へ */}
        <polygon points="110,520 450,520 900,1080 300,1080" fill={KRP.orange} opacity={0.1} />
        {/* 棚 (置き時計・観葉植物) */}
        <rect x={1500} y={560} width={340} height={20} fill={C.floorWoodDark} stroke={KRP.ink} strokeWidth={4} />
        <g>
          <rect x={1540} y={420} width={110} height={140} rx={12} fill={C.libWood} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1595} cy={465} r={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1595} y1={465} x2={1595} y2={440} stroke={KRP.ink} strokeWidth={4} />
          <line x1={1595} y1={465} x2={1615} y2={472} stroke={KRP.ink} strokeWidth={4} />
          <g transform={`rotate(${Math.sin(f / 6) * 14} 1595 505)`}>
            <line x1={1595} y1={505} x2={1595} y2={540} stroke={NP.brassDark} strokeWidth={3} />
            <circle cx={1595} cy={542} r={7} fill={NP.brass} stroke={KRP.ink} strokeWidth={2} />
          </g>
          <path d="M 1720 560 L 1700 480 L 1800 480 L 1780 560 Z" fill={KRP.bronze} stroke={KRP.ink} strokeWidth={5} />
          {[-1, 0, 1].map((i) => (
            <ellipse key={i} cx={1750 + i * 34} cy={440 - Math.abs(i) * -10 + Math.sin((f + i * 9) / 16) * 3} rx={20} ry={44}
              fill={KRP.green} opacity={0.8} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${i * 25} ${1750 + i * 34} 460)`} />
          ))}
        </g>
        {/* 壁のフックと名札 */}
        <rect x={TX - 30} y={TY - 214} width={60} height={20} rx={6} fill={C.floorWoodDark} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${TX} ${TY - 196} q 0 20 -10 26`} stroke={NP.brassDark} strokeWidth={8} fill="none" strokeLinecap="round" />
        <rect x={TX - 200} y={TY - 80} width={420} height={200} rx={24} fill={KRP.ink} opacity={0.15} />
        <Nafuda x={TX} y={TY} s={1.15} text="山田 花子" f={f} blur={blur} rot={Math.sin(f / 9) * 2.5} />
        {/* 見つめる視線の点線 */}
        <path d="M 790 500 Q 900 470 1010 460" stroke={KRP.ink} strokeWidth={4} strokeDasharray="6 12" fill="none" opacity={0.5 * seg(f, 6, 16)} />
        {/* ナレーター */}
        <ellipse cx={660} cy={862} rx={110} ry={16} fill={KRP.ink} opacity={0.2} />
        <Person x={660} y={860} s={1.15} f={f} cloth={C.narr} clothDark={C.narrDark} face="worried" gaze={[1, -0.3]} lean={lean} pose="hold" />
        <QMark x={900} y={250} s={1.1} f={f} t={seg(f, 24, 32)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #219 実はこれを、直接測った研究は、見つかっていません。
// 格: 山 / seed 4219
// 絵: ★研究の図書館の書架。研究者が棚を端から探していき、最後の棚の「名前を呼ばれないと自分を忘れるか」の場所だけが**空っぽの棚** (f でライトが当たる)。研究者が肩をすくめる。正直さを示す
// どこ: 天井の高い研究図書館の書庫。5つの書架が横に続き、天井に吊りランプ。2つ目の書架に移動はしご
// 演出: 白衣の研究者が左から棚を見上げながら歩き、最後の書架の前で止まる。その1段だけが空っぽで、ランプが点いて照らされる。研究者が両手のひらを上に肩をすくめる
// 動き: f0〜30 研究者が歩き、カメラが右へパン → f22〜34 ランプが点く → f30〜40 肩をすくめる
const Nm219: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeInOut(seg(f, 0, 30));
  const tx = -lerp(0, 900, easeInOut(seg(f, 0, 32)));
  const rx = lerp(560, 1990, walk);
  const step = walk < 1 ? Math.abs(Math.sin(f / 3.2)) * -8 : 0;
  const shrug = easeOut(seg(f, 30, 40));
  const lamp = easeOut(seg(f, 22, 34));
  const heads = ["記憶", "脳", "改姓", "呼名", "自己"];
  const BX = (i: number) => 100 + i * 540;
  const BY = 230, BH = 600;
  const gap = BH / 5;
  const ex = BX(4), ey = BY + gap * 1; // 空っぽの段 (2段目) の上端
  return (
    <Frame f={f} seed={4219} bg={C.libBack}>
      <g transform={`translate(${tx} 0)`}>
        {/* 奥の壁と天井 */}
        <rect x={-80} y={-20} width={3200} height={H + 40} fill={C.libCeil} />
        <rect x={-80} y={150} width={3200} height={700} fill={C.libBack} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-60 + i * 270} y={-20} width={40} height={170} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <rect x={-80} y={140} width={3200} height={20} fill={C.libWood} stroke={KRP.ink} strokeWidth={4} />
        {/* 書架 */}
        {heads.map((h, i) => (
          <g key={i}>
            <NI1cBay x={BX(i)} y={BY} w={520} h={BH} rows={5} seed={4219 + i * 17} empty={i === 4 ? [1] : []} />
            <NI1cPlaque x={BX(i) + 260} y={BY - 44} text={h} size={28} />
          </g>
        ))}
        {/* 空っぽの段: ホコリの跡と銘板 */}
        <g>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={ex + 30 + i * 58} y={ey + gap - 18} width={34} height={4} fill={C.libWoodLight} opacity={0.5} />
          ))}
          <rect x={ex + 14} y={ey + 6} width={492} height={gap - 24} fill="none" stroke={KRP.white} strokeWidth={3} strokeDasharray="10 10" opacity={0.25 + 0.5 * lamp} />
          <rect x={ex + 40} y={ey + gap - 2} width={440} height={30} rx={5} fill={C.plaque} stroke={KRP.ink} strokeWidth={3} />
          <text x={ex + 260} y={ey + gap + 21} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.ink}>名前を呼ばれないと自分を忘れるか</text>
        </g>
        {/* 移動はしご */}
        <g transform={`rotate(-12 ${BX(1) + 380} 830)`}>
          <rect x={BX(1) + 330} y={260} width={14} height={570} fill={C.libWoodLight} stroke={KRP.ink} strokeWidth={4} />
          <rect x={BX(1) + 430} y={260} width={14} height={570} fill={C.libWoodLight} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={BX(1) + 340} y={300 + i * 70} width={94} height={10} fill={C.libWood} stroke={KRP.ink} strokeWidth={3} />
          ))}
        </g>
        {/* 吊りランプ (最後の1つが点く) */}
        {heads.map((_, i) => {
          const on = i === 4 ? lamp : 0.25;
          const lx = BX(i) + 260;
          return (
            <g key={i}>
              <line x1={lx} y1={-20} x2={lx} y2={70} stroke={KRP.ink} strokeWidth={4} />
              <path d={`M ${lx - 44} 110 L ${lx - 22} 70 L ${lx + 22} 70 L ${lx + 44} 110 Z`} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
              <ellipse cx={lx} cy={112} rx={30} ry={8} fill={i === 4 ? NP.glowCore : C.bulb} opacity={0.4 + 0.6 * on} />
            </g>
          );
        })}
        {lamp > 0 && (
          <g opacity={lamp}>
            <polygon points={`${ex + 230},116 ${ex + 290},116 ${ex + 530},${ey + gap} ${ex - 10},${ey + gap}`} fill={NP.glow} opacity={0.22} />
            <rect x={ex + 10} y={ey + 2} width={500} height={gap - 16} fill={NP.glowCore} opacity={0.3} />
          </g>
        )}
        {/* 床 */}
        <rect x={-80} y={830} width={3200} height={300} fill={C.libFloor} />
        <line x1={-80} y1={830} x2={3120} y2={830} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-80} y={880} width={3200} height={90} fill={C.rope} opacity={0.35} />
        {/* 研究者 */}
        <ellipse cx={rx} cy={846} rx={100} ry={14} fill={KRP.ink} opacity={0.25} />
        <Person x={rx} y={840 + step} s={1.0} f={f} still pose="hold" cloth={C.coat} clothDark={C.coatDark} glasses
          face={shrug > 0.3 ? "worried" : "normal"} gaze={shrug > 0.3 ? [0, 0] : [0.8, -0.7]} />
        <NI1cShrugArms x={rx} y={840 + step} s={1.0} cloth={C.coat} k={shrug} swing={walk < 1 ? Math.sin(f / 3.2) * 10 : 0} />
      </g>
    </Frame>
  );
};

// 「分かっていること」の棚の模型 (#220〜#222 で同じ物を使う)
// 振り向く人形 (ヘッドホンの木の人形)。x は足元の中心、y は棚板の上面。turn 0→1 で左を向く
const NI1cDollModel: React.FC<{ x: number; y: number; s?: number; turn?: number }> = ({ x, y, s = 1, turn = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-6} rx={130} ry={24} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-8} y={-110} width={16} height={100} fill={C.crateDark} stroke={KRP.ink} strokeWidth={4} />
    {/* 胴と腕 */}
    <rect x={-48} y={-270} width={96} height={150} rx={30} fill={C.crateLight} stroke={KRP.ink} strokeWidth={5} />
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <rect x={sd * 52 - 11} y={-262} width={22} height={70} rx={11} fill={C.crateLight} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${-sd * 8} ${sd * 52} -262)`} />
        <circle cx={sd * 66} cy={-186} r={10} fill={C.crate} stroke={KRP.ink} strokeWidth={3} />
        <rect x={sd * 66 - 10} y={-186} width={20} height={64} rx={10} fill={C.crateLight} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    <circle cx={0} cy={-120} r={14} fill={C.crate} stroke={KRP.ink} strokeWidth={3} />
    <rect x={-10} y={-300} width={20} height={34} fill={C.crate} stroke={KRP.ink} strokeWidth={4} />
    {/* 頭 (turn で左を向く) */}
    <g transform={`rotate(${-turn * 14} 0 -300)`}>
      <circle cx={0} cy={-360} r={62} fill={C.crateLight} stroke={KRP.ink} strokeWidth={5} />
      {[-1, 1].map((sd) => (
        <circle key={sd} cx={sd * 20 - turn * 26} cy={-366} r={6} fill={KRP.ink} opacity={sd === 1 && turn > 0.6 ? 0.3 : 1} />
      ))}
      <path d={`M ${-turn * 40} -350 l ${-8 - turn * 6} 10 l 8 4`} stroke={KRP.ink} strokeWidth={4} fill="none" />
      {/* ヘッドホン */}
      <path d="M -66 -360 Q -70 -440 0 -442 Q 70 -440 66 -360" stroke={C.headphone} strokeWidth={14} fill="none" />
      <path d="M -66 -360 Q -70 -440 0 -442 Q 70 -440 66 -360" stroke={KRP.ink} strokeWidth={3} fill="none" />
      <rect x={-84 + turn * 14} y={-390} width={30} height={58} rx={12} fill={C.headphone} stroke={KRP.ink} strokeWidth={4} />
      <rect x={54 - turn * 6} y={-390} width={30} height={58} rx={12} fill={C.headphone} stroke={KRP.ink} strokeWidth={4} />
    </g>
  </g>
);
// 大きな波の模型 (台の上に立てた紙の板にグラフ)。x は中心、y は棚板の上面。draw 0→1 で線が描かれる
const NI1cWaveModel: React.FC<{ x: number; y: number; s?: number; draw?: number }> = ({ x, y, s = 1, draw = 1 }) => {
  const pts = Array.from({ length: 61 }, (_, i) => {
    const u = i / 60;
    const big = Math.exp(-Math.pow((u - 0.62) / 0.06, 2)) * 150;
    const small = Math.sin(u * 40) * 8 * (1 - big / 150);
    return [-160 + u * 320, -150 - big - small] as const;
  });
  const n = Math.max(2, Math.round(61 * clamp01(draw)));
  const d = pts.slice(0, n).map(([px, py], i) => `${i ? "L" : "M"} ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-210} y={-40} width={420} height={40} rx={6} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-190} y={-340} width={380} height={300} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-180} y1={-320 + i * 50} x2={180} y2={-320 + i * 50} stroke={KRP.blueSoft} strokeWidth={2} />)}
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-180 + i * 50} y1={-330} x2={-180 + i * 50} y2={-50} stroke={KRP.blueSoft} strokeWidth={2} />)}
      <line x1={-170} y1={-150} x2={175} y2={-150} stroke={KRP.grayDark} strokeWidth={3} />
      <path d={d} stroke={KRP.red} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {[-150, 150].map((sx) => <rect key={sx} x={sx - 8} y={-60} width={16} height={24} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />)}
    </g>
  );
};
// 「7人に1人」の模型 (7体の木のこけし人形、1体だけ輪郭が二重にぶれる)。x は中心、y は棚板の上面
const NI1cSevenModel: React.FC<{ x: number; y: number; s?: number; split?: number }> = ({ x, y, s = 1, split = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-340} y={-36} width={680} height={36} rx={6} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={5} />
    {Array.from({ length: 7 }, (_, i) => {
      const px = -270 + i * 90;
      const odd = i === 4;
      const doll = (dx: number, op: number, dash?: string, key?: string) => (
        <g key={key} opacity={op} transform={`translate(${dx} 0)`}>
          <rect x={px - 28} y={-196} width={56} height={160} rx={24} fill={odd ? KRP.orange : C.crateLight} stroke={KRP.ink} strokeWidth={5} strokeDasharray={dash} />
          <rect x={px - 28} y={-130} width={56} height={14} fill={odd ? C.crateDark : C.crate} opacity={0.7} />
          <circle cx={px} cy={-226} r={32} fill={C.crateLight} stroke={KRP.ink} strokeWidth={5} strokeDasharray={dash} />
          <path d={`M ${px - 30} -236 Q ${px} -270 ${px + 30} -236 Q ${px} -248 ${px - 30} -236 Z`} fill={KRP.ink} />
          <circle cx={px - 10} cy={-222} r={4} fill={KRP.ink} /><circle cx={px + 10} cy={-222} r={4} fill={KRP.ink} />
        </g>
      );
      return (
        <g key={i}>
          {odd && split > 0 && doll(26 * split, 0.55, "8 7", "ghost")}
          {doll(odd ? -6 * split : 0, 1, undefined, "main")}
        </g>
      );
    })}
  </g>
);

// 棚の大写し (#220〜#221 共通の舞台)。board: 棚板の上面の y
const NI1cShelfBack: React.FC<{ x0: number; x1: number; board: number; seed: number; lit?: number }> = ({ x0, x1, board, seed, lit = 1 }) => (
  <g>
    <rect x={x0} y={-20} width={x1 - x0} height={H + 40} fill={C.libBack} />
    {Array.from({ length: Math.ceil((x1 - x0) / 120) }, (_, i) => (
      <line key={i} x1={x0 + i * 120} y1={210} x2={x0 + i * 120} y2={board} stroke={C.libWoodDark} strokeWidth={4} opacity={0.6} />
    ))}
    <ellipse cx={(x0 + x1) / 2} cy={420} rx={(x1 - x0) * 0.5} ry={330} fill={C.libBackLit} opacity={0.8 * lit} />
    {/* 上の段 (本の下端が見える) */}
    {Array.from({ length: Math.ceil((x1 - x0) / 42) }, (_, i) => (
      <rect key={i} x={x0 + i * 42} y={-20} width={38} height={60 + rnd(seed, i) * 90} fill={BOOKS[i % BOOKS.length]} stroke={KRP.ink} strokeWidth={3} />
    ))}
    <rect x={x0} y={170} width={x1 - x0} height={40} fill={C.libWood} stroke={KRP.ink} strokeWidth={5} />
    {/* 棚板 */}
    <rect x={x0} y={board} width={x1 - x0} height={44} fill={C.libWoodLight} stroke={KRP.ink} strokeWidth={6} />
    <rect x={x0} y={board + 44} width={x1 - x0} height={H} fill={C.libWoodDark} />
    {/* 下の段の本の頭 */}
    {Array.from({ length: Math.ceil((x1 - x0) / 44) }, (_, i) => (
      <rect key={i} x={x0 + i * 44} y={board + 90 + rnd(seed + 3, i) * 40} width={40} height={300} fill={BOOKS[(i * 3) % BOOKS.length]} stroke={KRP.ink} strokeWidth={3} opacity={0.75} />
    ))}
  </g>
);

// -------------------------------------------------------------------
// #220 脳が自分の名前に振り向くことは、分かっています。
// 格: 図 / seed 4220
// 絵: 「分かっていること」の棚。#207 の振り向く人形と #209 の大きな波の小さな模型が並び、緑の○の札がつく
// どこ: 書庫の「分かっていること」の棚の1段に寄った所。上から暖かい光。左端に小さなスピーカー、端に本立て
// 演出: スピーカーから名前の音が出ると、ヘッドホンの人形が振り向く。隣の板のグラフに大きな波が描かれる。それぞれに緑の○がぽんと付く
// 動き: f4〜14 音の輪 → f8〜18 人形が振り向く → f10〜28 波が描かれる → f22〜30 / f30〜38 ○。カメラはゆっくり寄る
const Nm220: React.FC<{ f: number }> = ({ f }) => {
  const z = 1 + 0.05 * easeInOut(seg(f, 0, 42));
  const BOARD = 700;
  const turn = easeOut(seg(f, 8, 18));
  return (
    <Frame f={f} seed={4220} bg={C.libBack}>
      <g transform={cam(960, 520, z)}>
        <NI1cShelfBack x0={-80} x1={W + 80} board={BOARD} seed={4220} />
        {/* 両脇の仕切り板 */}
        <rect x={60} y={170} width={50} height={600} fill={C.libWood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1810} y={170} width={50} height={600} fill={C.libWood} stroke={KRP.ink} strokeWidth={5} />
        {/* 端の本立てと本 */}
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={1640 + i * 40} y={BOARD - 250 + i * 6} width={36} height={250 - i * 6} rx={3} fill={BOOKS[i + 2]} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <path d={`M 1620 ${BOARD} L 1620 ${BOARD - 150} L 1636 ${BOARD - 150} L 1636 ${BOARD} Z`} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        {/* スピーカー (名前の音) */}
        <g>
          <rect x={190} y={BOARD - 150} width={110} height={150} rx={10} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={245} cy={BOARD - 90} r={34} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={245} cy={BOARD - 90} r={12} fill={KRP.ink} />
          {[0, 1, 2].map((i) => {
            const u = seg(f, 4 + i * 3, 14 + i * 3);
            return u > 0 && u < 1 ? (
              <path key={i} d={`M ${320 + u * 120} ${BOARD - 170} q 30 80 0 160`} stroke={NP.mimi} strokeWidth={7} fill="none" opacity={1 - u} strokeLinecap="round" />
            ) : null;
          })}
          {f > 14 && [0, 1].map((i) => (
            <path key={i} d={`M ${330 + i * 34} ${BOARD - 140 + i * -10} q 18 50 0 100`} stroke={NP.mimi} strokeWidth={6} fill="none" opacity={0.35 + 0.2 * Math.sin(f / 5 + i)} strokeLinecap="round" />
          ))}
        </g>
        {/* 模型 2つ */}
        <NI1cDollModel x={620} y={BOARD} turn={turn} />
        {turn > 0.3 && turn < 1 && (
          <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={(1 - turn) * 1.4}>
            <line x1={520} y1={290} x2={496} y2={270} /><line x1={510} y1={330} x2={480} y2={326} />
          </g>
        )}
        <NI1cWaveModel x={1260} y={BOARD} draw={easeInOut(seg(f, 10, 28))} />
        {/* 銘板 */}
        <NI1cPlaque x={620} y={BOARD + 22} text="振り向く" />
        <NI1cPlaque x={1260} y={BOARD + 22} text="大きな波" />
        {/* 緑の○ */}
        <Maru x={800} y={450} s={0.62} t={seg(f, 22, 30)} />
        <Maru x={1560} y={330} s={0.62} t={seg(f, 30, 38)} />
        {/* 上からの暖かい光 */}
        <ellipse cx={960} cy={300} rx={900} ry={200} fill={C.lightWarm} opacity={0.08} />
      </g>
      <TagPlate x={960} y={262} text="分かっていること" size={40} t={seg(f, 2, 12)} fill={KRP.white} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #221 名前が変わって、違う人になった気がする人がいることも、分かっています。
// 格: 図 / seed 4221
// 絵: 同じ棚に、#204 の「7人に1人」の模型が並び、緑の○。棚の端は #219 の空っぽの棚へ続く
// どこ: #220 と同じ棚の続き (右へ移った所)。左端に波の模型が少し見え、右端の仕切りの先は暗い空っぽの棚
// 演出: 7体の人形のうち1体だけ、輪郭が二重にぶれて「違う人」のように離れる。緑の○が付く。その先の暗い棚は空のまま、ぼんやり照らされる
// 動き: f6〜22 1体の輪郭がぶれる → f22〜30 ○ → f20〜42 カメラが右へパンして空の棚がのぞく
const Nm221: React.FC<{ f: number }> = ({ f }) => {
  const pan = -lerp(0, 120, easeInOut(seg(f, 20, 42)));
  const BOARD = 700;
  const split = easeOut(seg(f, 6, 22));
  return (
    <Frame f={f} seed={4221} bg={C.libBack}>
      <g transform={`translate(${pan + 40} 0)`}>
        <NI1cShelfBack x0={-200} x1={1440} board={BOARD} seed={4221} />
        {/* 左端に前の波の模型 (#220 の続き) */}
        <NI1cWaveModel x={60} y={BOARD} draw={1} />
        <Maru x={360} y={330} s={0.62} />
        {/* 7人に1人 */}
        <NI1cSevenModel x={820} y={BOARD} split={split} />
        {split > 0.2 && split < 1 && (
          <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={(1 - split) * 1.5}>
            <line x1={920} y1={440} x2={950} y2={420} /><line x1={930} y1={480} x2={966} y2={476} />
          </g>
        )}
        <NI1cPlaque x={820} y={BOARD + 22} text="7人に1人" />
        <Maru x={1180} y={330} s={0.62} t={seg(f, 22, 30)} />
        {/* 仕切り板 */}
        <rect x={1410} y={170} width={56} height={620} fill={C.libWood} stroke={KRP.ink} strokeWidth={5} />
        {/* その先: 暗い空っぽの棚 */}
        <rect x={1466} y={-20} width={700} height={H + 40} fill={C.fogDark} />
        <rect x={1466} y={170} width={700} height={40} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1466} y={BOARD} width={700} height={44} fill={C.libWoodDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1466} y={BOARD + 44} width={700} height={H} fill={C.libCeil} />
        <rect x={1500} y={240} width={560} height={BOARD - 260} fill="none" stroke={KRP.white} strokeWidth={4} strokeDasharray="12 12" opacity={0.35} />
        <polygon points={`1700,180 1800,180 2000,${BOARD} 1520,${BOARD}`} fill={NP.glow} opacity={0.08 + 0.04 * Math.sin(f / 6)} />
        <rect x={1520} y={BOARD + 8} width={430} height={30} rx={5} fill={C.plaque} opacity={0.7} stroke={KRP.ink} strokeWidth={3} />
        <text x={1735} y={BOARD + 31} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={KRP.ink}>名前を呼ばれないと自分を忘れるか</text>
        <ellipse cx={600} cy={300} rx={800} ry={200} fill={C.lightWarm} opacity={0.08} />
      </g>
      <TagPlate x={760} y={262} text="分かっていること" size={40} t={1} fill={KRP.white} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #222 でも、その先は、まだ誰にも分かっていないのです。
// 格: 山 / seed 4222
// 絵: ★「分かっている」の棚 (明るい) と、その先の**霧に包まれた棚** (暗い・中身が見えない) の境目に、ナレーター役の Person が立つ。足元に境界線のロープ。霧の中に `QMark` がいくつも浮かぶ
// どこ: 書庫の奥。左は明るい「分かっていること」の棚 (人形・波・7体の模型の小さな姿)、右は奥へ続く棚が霧に沈む。床に真鍮の支柱と赤いロープ
// 演出: ナレーターがロープの手前で立ち止まり、霧の奥をのぞきこむ。霧の中から ？ が次々に浮かび上がる
// 動き: 霧が右から左へゆっくり流れる。f10〜38 ？ が1つずつ出る。カメラはゆっくり引いて全体を見せる
const Nm222: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.1, 1.0, easeInOut(seg(f, 0, 40)));
  const B = 1080; // 境目
  const qs = [[1300, 300, 1.0], [1520, 470, 1.3], [1720, 260, 0.8], [1420, 620, 0.7], [1780, 560, 1.0], [1620, 170, 0.6]] as const;
  return (
    <Frame f={f} seed={4222} bg={C.libBack} dark>
      <defs>
        <filter id="ni1cFog222" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={34} /></filter>
        <linearGradient id="ni1cDark222" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.fogDark} stopOpacity={0} />
          <stop offset="0.25" stopColor={C.fogDark} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.fogDark} stopOpacity={0.92} />
        </linearGradient>
      </defs>
      <g transform={cam(940, 560, z)}>
        <rect x={-80} y={-40} width={W + 160} height={H + 80} fill={C.libCeil} />
        {/* 棚の列 (左:明るい / 右:霧の中) */}
        <NI1cBay x={-40} y={200} w={500} h={560} rows={4} seed={4222} empty={[1]} />
        <NI1cBay x={500} y={200} w={520} h={560} rows={4} seed={4223} empty={[2]} />
        {/* 左の棚の模型 (小さく) */}
        <g transform="translate(0 0)">
          <NI1cDollModel x={120} y={326} s={0.26} turn={1} />
          <NI1cWaveModel x={300} y={326} s={0.3} />
          <NI1cSevenModel x={760} y={606} s={0.36} split={1} />
          <Maru x={200} y={232} s={0.22} />
          <Maru x={380} y={232} s={0.22} />
          <Maru x={900} y={512} s={0.22} />
        </g>
        <NI1cBay x={1060} y={200} w={520} h={560} rows={4} seed={4224} dim={0.4} />
        <NI1cBay x={1620} y={200} w={520} h={560} rows={4} seed={4225} dim={0.6} />
        {/* 床 */}
        <rect x={-80} y={760} width={W + 160} height={400} fill={C.libFloor} />
        <line x1={-80} y1={760} x2={W + 80} y2={760} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i * 220 - 100} y1={760} x2={i * 300 - 500} y2={1100} stroke={C.libWoodDark} strokeWidth={3} opacity={0.6} />
        ))}
        {/* 左の明かり */}
        <ellipse cx={480} cy={420} rx={640} ry={420} fill={C.lightWarm} opacity={0.14} />
        {/* 右の暗がりと霧 */}
        <rect x={B - 200} y={-40} width={W - B + 400} height={H + 80} fill="url(#ni1cDark222)" />
        <g filter="url(#ni1cFog222)">
          {Array.from({ length: 12 }, (_, i) => {
            const fx = B + 40 + ((rnd(4222, i) * 900 - f * (1.2 + rnd(4223, i))) % 900 + 900) % 900;
            const fy = 140 + rnd(4224, i) * 720;
            return <circle key={i} cx={fx} cy={fy} r={110 + rnd(4225, i) * 110} fill={i % 2 ? C.fog : C.fogLight} opacity={0.4} />;
          })}
        </g>
        {/* 霧の中の ？ */}
        {qs.map(([qx, qy, qsz], i) => (
          <g key={i} opacity={0.85}>
            <QMark x={qx} y={qy + Math.sin((f + i * 13) / 14) * 8} s={qsz} f={f + i * 7} t={seg(f, 10 + i * 4.5, 16 + i * 4.5)} color={C.fogLight} />
          </g>
        ))}
        {/* 境界のロープ (支柱3本) */}
        {(() => {
          const posts: [number, number][] = [[B + 10, 790], [B + 60, 900], [B + 120, 1030]];
          return (
            <g>
              {posts.slice(0, -1).map(([px, py], i) => {
                const [qx, qy] = posts[i + 1];
                return (
                  <g key={i}>
                    <path d={`M ${px} ${py - 90} Q ${(px + qx) / 2} ${(py + qy) / 2 - 40 + Math.sin(f / 15) * 4} ${qx} ${qy - 110}`} stroke={KRP.ink} strokeWidth={18} fill="none" />
                    <path d={`M ${px} ${py - 90} Q ${(px + qx) / 2} ${(py + qy) / 2 - 40 + Math.sin(f / 15) * 4} ${qx} ${qy - 110}`} stroke={C.rope} strokeWidth={11} fill="none" />
                  </g>
                );
              })}
              {posts.map(([px, py], i) => {
                const k = 1 + i * 0.12;
                return (
                  <g key={i}>
                    <ellipse cx={px} cy={py} rx={34 * k} ry={10 * k} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
                    <rect x={px - 7 * k} y={py - 100 * k} width={14 * k} height={100 * k} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
                    <circle cx={px} cy={py - 102 * k} r={11 * k} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
                  </g>
                );
              })}
            </g>
          );
        })()}
        {/* ナレーター */}
        <ellipse cx={880} cy={856} rx={110} ry={16} fill={KRP.ink} opacity={0.25} />
        <Person x={880} y={850} s={1.05} f={f} cloth={C.narr} clothDark={C.narrDark} face="normal" gaze={[1, -0.3]}
          lean={lerp(0, 5, easeOut(seg(f, 8, 26)))} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_212: (f) => <Nm212 f={f} />,
  nm_213: (f) => <Nm213 f={f} />,
  nm_214: (f) => <Nm214 f={f} />,
  nm_215: (f) => <Nm215 f={f} />,
  nm_216: (f) => <Nm216 f={f} />,
  nm_217: (f) => <Nm217 f={f} />,
  nm_218: (f) => <Nm218 f={f} />,
  nm_219: (f) => <Nm219 f={f} />,
  nm_220: (f) => <Nm220 f={f} />,
  nm_221: (f) => <Nm221 f={f} />,
  nm_222: (f) => <Nm222 f={f} />,
};

export const NM_I1C_MOTIFS: string[] = [
  "nm_212", // #212
  "nm_213", // #213
  "nm_214", // #214
  "nm_215", // #215
  "nm_216", // #216
  "nm_217", // #217
  "nm_218", // #218
  "nm_219", // #219
  "nm_220", // #220
  "nm_221", // #221
  "nm_222", // #222
];

export const namaeI1cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
