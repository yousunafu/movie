// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#158〜#167 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-5.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L4b。
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
  // ---- YawaF1 (#152〜#155) とそろえる色 (写し) ----
  morning: "#FBE7B5",
  sky: "#CFE3EE",
  woodLight: "#D2AE84",
  wood: "#B88A5E",
  woodDark: "#8A6444",
  blanket: "#BFD6E8",
  blanketDark: "#8FB0CC",
  blanketEdge: "#F3E6C4",
  bear: "#B98A5E",
  bearDark: "#8C6440",
  bearMuzzle: "#E6CBA6",
  bearPatch: "#9FC8C0",
  mom: "#D98C8C",
  momDark: "#B86E70",
  momSkirt: "#7C6A8E",
  onesie: "#F4E3A1",
  onesieDark: "#D9C477",
  babyCheek: "#F4B9B2",
  wallWarm: "#F2DFC2",
  sofaSage: "#9DB59A",
  sofaSageDark: "#7C977A",
  curtain: "#EBC79A",
  curtainDark: "#D3A877",
  rug: "#D49A72",
  rugDark: "#A86F4E",
  // ---- このファイルの色 ----
  night: "#2F3B58",
  nightDeep: "#232C44",
  star: "#FFF3C4",
  warmGlow: "#FFD99A",
  roomWall: "#D7E3EC",
  roomDot: "#B9CCDB",
  roomFloor: "#A9C3D6",
  skin: "#F7E4D3",
  skinShade: "#E9C9B2",
  skinLine: "#C99A82",
  dermis: "#F1C6B6",
  fat: "#F5E3B8",
  fatDark: "#E0C68E",
  follicle: "#E2A99A",
  nerveDim: "#DCC27A",
  vessel: "#D9786A",
  vein: "#8A9CC8",
  hair: "#7E604A",
  knit: "#7A8FA6",
  knitDark: "#5C6F86",
  deskWood: "#C9A57C",
  deskWoodDark: "#A88459",
  gridPaper: "#F6F3E8",
  gridLine: "#C4D7E0",
  gridMajor: "#9FBCCB",
  throwRed: "#D08A6A",
  throwDark: "#A9644A",
  stoveBody: "#B9C1C6",
  flame: "#F6A33A",
  windowNight: "#34466A",
  snow: "#F7F9FB",
  shadow: "#5A4A3E",
  factory: "#7D6E62",
  factoryDark: "#5E5249",
  brickLine: "#9A8A7C",
  concrete: "#A39C92",
  concreteDark: "#857E75",
  machine: "#7F9A8C",
  machineDark: "#5F7A6C",
  steel: "#A3AEB3",
  steelDark: "#76838A",
  rubber: "#4A4440",
  glass: "#C9DCE4",
  work: "#5C7A99",
  workDark: "#405A75",
  foam: "#F6F2E6",
  foamShade: "#E2DBC6",
  meadow: "#A9CF8C",
  meadowDark: "#7FB06E",
  hill: "#8FBF84",
  path: "#E6D3AE",
  pathDark: "#CDB78C",
} as const;
void W; void H; void FONT;
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

// カメラ: (cx,cy) を中心に scale し、(dx,dy) ずらす
const cam = (cx: number, cy: number, sc: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${sc}) translate(${-cx} ${-cy})`;
// カメラ: 絵の点 (px,py) を画面の (sx,sy) に置いて sc 倍
const camAt = (px: number, py: number, sc: number, sx = 960, sy = 540) =>
  `translate(${sx} ${sy}) scale(${sc}) translate(${-px} ${-py})`;
// Person と同じ上下ゆれ (髪や小物を Person に重ねるとき用)
const pBob = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;
const gauss = (d: number, w: number) => Math.exp(-(d / w) * (d / w));

// ---- 毛布の切れはし (YawaF1 の L4aBlanket の写し。見た目をそろえる)。原点は「つまむ所」。下へ垂れる
const L4bBlanket: React.FC<{
  x: number; y: number; s?: number; rot?: number; wave?: number; len?: number;
}> = ({ x, y, s = 1, rot = 0, wave = 0, len = 1 }) => {
  const L = 220 * len;
  const w1 = wave * 18;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path
        d={`M -70 0 Q -20 -14 70 -4 Q 84 ${L * 0.4} ${78 + w1} ${L * 0.75} L ${70 + w1} ${L}
          L ${52 + w1} ${L - 14} L ${38 + w1} ${L + 6} L ${22 + w1} ${L - 10} L ${6 + w1} ${L + 8}
          L ${-10 + w1} ${L - 8} L ${-26 + w1} ${L + 4} L ${-42 + w1} ${L - 12} L ${-58 + w1} ${L + 2}
          Q ${-80 + w1 * 0.6} ${L * 0.6} -70 0 Z`}
        fill={C.blanket} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <g stroke={C.blanketDark} strokeWidth={3} opacity={0.7} fill="none">
        {[0.25, 0.5, 0.75].map((k, i) => (
          <path key={i} d={`M ${-72 + w1 * k * 0.6} ${L * k} Q 0 ${L * k + 8} ${76 + w1 * k} ${L * k - 4}`} />
        ))}
        {[-36, 0, 36].map((xx, i) => (
          <path key={i} d={`M ${xx} 2 Q ${xx + 6} ${L * 0.5} ${xx + w1 * 0.9} ${L - 6}`} />
        ))}
      </g>
      <path d="M -70 0 Q -20 -14 70 -4 L 68 12 Q -20 2 -68 16 Z" fill={C.blanketEdge} stroke={C.ink} strokeWidth={4} />
      <g stroke={C.blanketDark} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d={`M ${30 + w1} ${L + 4} q 4 14 -2 24`} />
        <path d={`M ${-34 + w1} ${L} q -6 12 2 20`} />
      </g>
      {[[-30, L * 0.36], [24, L * 0.6], [48, L * 0.2]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={4} fill={C.blanketDark} opacity={0.8} />
      ))}
    </g>
  );
};

// ---- くたくたのくま (YawaF1 の L4aBear の写し)。原点は足元中央
// fresh = 工場でできたばかりの新品 (つぎあて・取れた目・はみ出た綿なし)
const L4bBear: React.FC<{ x: number; y: number; s?: number; rot?: number; fresh?: boolean }> = ({ x, y, s = 1, rot = 0, fresh = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={C.ink} strokeWidth={4.5}>
    <ellipse cx={-26} cy={-14} rx={22} ry={16} fill={C.bear} />
    <ellipse cx={26} cy={-14} rx={22} ry={16} fill={C.bear} />
    <ellipse cx={-26} cy={-12} rx={11} ry={8} fill={C.bearMuzzle} strokeWidth={3} />
    <ellipse cx={0} cy={-58} rx={44} ry={46} fill={C.bear} />
    <ellipse cx={0} cy={-52} rx={26} ry={28} fill={C.bearMuzzle} strokeWidth={3.5} />
    {!fresh && <rect x={8} y={-80} width={26} height={22} rx={3} fill={C.bearPatch} strokeWidth={3.5} transform="rotate(12 21 -69)" />}
    {!fresh && <g strokeWidth={2.5}>
      {[0, 1, 2].map((i) => <line key={i} x1={10 + i * 9} y1={-84 + i * 2} x2={12 + i * 9} y2={-77 + i * 2} />)}
    </g>}
    {fresh && <path d="M -14 -96 L 0 -86 L 14 -96 L 14 -80 L 0 -86 L -14 -80 Z" fill={KRP.red} strokeWidth={3} />}
    <ellipse cx={-46} cy={-70} rx={16} ry={26} fill={C.bear} transform="rotate(30 -46 -70)" />
    <ellipse cx={46} cy={-70} rx={16} ry={26} fill={C.bear} transform="rotate(-30 46 -70)" />
    <circle cx={-34} cy={-158} r={17} fill={C.bear} />
    <circle cx={-34} cy={-158} r={8} fill={C.bearMuzzle} strokeWidth={3} />
    <circle cx={34} cy={-158} r={17} fill={C.bear} />
    <circle cx={0} cy={-128} r={44} fill={C.bear} />
    <ellipse cx={0} cy={-114} rx={20} ry={15} fill={C.bearMuzzle} strokeWidth={3.5} />
    <ellipse cx={0} cy={-120} rx={7} ry={5} fill={C.ink} stroke="none" />
    <path d="M 0 -115 L 0 -108 M -7 -104 Q 0 -100 7 -104" fill="none" strokeWidth={3} strokeLinecap="round" />
    <circle cx={-16} cy={-136} r={6} fill={C.ink} stroke="none" />
    <circle cx={-18} cy={-138} r={1.8} fill={KRP.white} stroke="none" />
    {fresh ? (
      <>
        <circle cx={16} cy={-136} r={6} fill={C.ink} stroke="none" />
        <circle cx={14} cy={-138} r={1.8} fill={KRP.white} stroke="none" />
      </>
    ) : (
      <g strokeWidth={3} strokeLinecap="round">
        <line x1={10} y1={-142} x2={22} y2={-130} />
        <line x1={22} y1={-142} x2={10} y2={-130} />
      </g>
    )}
    {!fresh && <path d="M -44 -40 q -12 -4 -10 8 q -8 6 2 12 q 6 6 12 -2" fill={KRP.white} strokeWidth={3} />}
  </g>
);

// ---- お母さん (YawaF1 の L4aMom の写し。カーディガン + 後ろでまとめた髪)
const L4bMom: React.FC<{
  x: number; y: number; s?: number; f: number; face?: "normal" | "smile" | "joy" | "worried" | "surprised";
  pose?: "stand" | "hold" | "point" | "raise"; lean?: number; gaze?: [number, number]; phase?: number; pointDir?: 1 | -1;
}> = ({ x, y, s = 1, f, face = "smile", pose = "stand", lean = 0, gaze = [0, 0], phase = 2, pointDir = 1 }) => {
  const b = pBob(f, phase);
  return (
    <g>
      <g transform={`translate(${x} ${y + b}) scale(${s}) rotate(${lean})`}>
        <circle cx={-48} cy={-262} r={26} fill={C.ink} />
        <path d="M -60 -200 Q -78 -160 -62 -150 L -52 -190 Z" fill={C.ink} />
      </g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} pose={pose} lean={lean}
        gaze={gaze} cloth={C.mom} clothDark={C.momSkirt} hair="cap" pointDir={pointDir} />
      <g transform={`translate(${x} ${y + b}) scale(${s}) rotate(${lean})`}>
        <line x1={0} y1={-158} x2={0} y2={-54} stroke={C.momDark} strokeWidth={4} />
        {[-134, -110, -86].map((yy) => <circle key={yy} cx={-8} cy={yy} r={4} fill={KRP.white} stroke={C.ink} strokeWidth={2} />)}
      </g>
    </g>
  );
};

// ---- 撫でる手 (横から見た、手のひらを下にした大人の手)。原点 = 指の腹が肌にふれる所。指は左へ、手首は右上へ
const L4bStrokeHand: React.FC<{ x: number; y: number; s?: number; rot?: number; sleeve?: string; sleeveDark?: string }> = ({
  x, y, s = 1, rot = 0, sleeve = C.mom, sleeveDark = C.momDark,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={C.ink} strokeLinejoin="round">
    {/* 袖 (右上へ) */}
    <path d="M 120 -96 L 380 -470 L 540 -400 L 236 -40 Z" fill={sleeve} strokeWidth={6} />
    <path d="M 120 -96 L 236 -40 L 262 -76 L 150 -134 Z" fill={sleeveDark} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={170 + i * 60} y1={-150 - i * 80} x2={290 + i * 60} y2={-90 - i * 80} stroke={sleeveDark} strokeWidth={4} />
    ))}
    {/* 奥の指 (小指・薬指・中指) */}
    {[[-150, -40, 150], [-196, -30, 196], [-214, -20, 214]].map(([x0, yy, len], i) => (
      <rect key={i} x={x0} y={yy - 16} width={(len as number) + 30} height={32} rx={16}
        fill={C.skinShade} strokeWidth={4.5} />
    ))}
    {/* 手の甲 */}
    <path d="M -40 -8 Q -30 -78 60 -98 Q 170 -118 222 -56 Q 236 -10 170 4 L -30 4 Z" fill={C.skin} strokeWidth={5.5} />
    <path d="M 40 -70 q 30 -10 60 -6 M 30 -50 q 30 -8 56 -4" fill="none" stroke={C.skinLine} strokeWidth={3} strokeLinecap="round" />
    {/* 手前の指 (人さし指) */}
    <rect x={-226} y={-14} width={250} height={30} rx={15} fill={C.skin} strokeWidth={5} />
    <path d="M -214 -10 q 18 -4 30 2" fill="none" stroke={C.skinLine} strokeWidth={3} />
    <rect x={-222} y={-12} width={30} height={16} rx={7} fill={KRP.white} strokeWidth={3} />
    {[-130, -60].map((kx) => (
      <path key={kx} d={`M ${kx} -12 q 4 10 0 22`} fill="none" stroke={C.skinLine} strokeWidth={3} />
    ))}
    {/* 親指 */}
    <ellipse cx={30} cy={2} rx={58} ry={18} fill={C.skin} strokeWidth={5} transform="rotate(6 30 2)" />
  </g>
);

// ---- ハート (頬ずりの気持ち)
const L4bHeart: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={op}
    d="M 0 12 C -26 -6 -20 -28 -6 -26 C 0 -25 0 -20 0 -16 C 0 -20 0 -25 6 -26 C 20 -28 26 -6 0 12 Z"
    fill={C.babyCheek} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
);

// ---- 歯車。shadow のときは輪郭なしの影
const L4bGear: React.FC<{
  x: number; y: number; r: number; teeth?: number; rot?: number; fill: string; shadow?: boolean; sw?: number;
}> = ({ x, y, r, teeth = 10, rot = 0, fill, shadow = false, sw = 5 }) => {
  const n = teeth * 4;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.8;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={shadow ? "none" : C.ink} strokeWidth={sw} strokeLinejoin="round" />
      {shadow ? (
        <circle r={r * 0.22} fill={KRP.white} opacity={0.35} />
      ) : (
        <>
          <circle r={r * 0.55} fill="none" stroke={C.ink} strokeWidth={sw * 0.8} />
          {[0, 60, 120].map((a) => (
            <line key={a} x1={0} y1={-r * 0.55} x2={0} y2={r * 0.55} stroke={C.ink} strokeWidth={sw * 0.8} transform={`rotate(${a})`} />
          ))}
          <circle r={r * 0.17} fill={C.ink} />
        </>
      )}
    </g>
  );
};

// ---- ウレタンの泡のかたまり (円を重ねて、外側だけに輪郭が出る)
const L4bFoam: React.FC<{ blobs: number[][]; fill?: string }> = ({ blobs, fill = C.foam }) => (
  <g>
    {blobs.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 5} fill={C.ink} />)}
    {blobs.map(([x, y, r], i) => <circle key={`i${i}`} cx={x} cy={y} r={r} fill={fill} />)}
    {blobs.map(([x, y, r], i) => (r > 24 ? (
      <circle key={`h${i}`} cx={x - r * 0.32} cy={y - r * 0.32} r={r * 0.2} fill={KRP.white} opacity={0.95} />
    ) : null))}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#158 【山】 お母さんの腕と、ひとりの世界のあいだを、つないでくれるもの、です。
// 設計: ★この章の山場。画面の左にお母さんの腕 (温かい光)、右にひとりで遊ぶ子どもの部屋。その間に、毛布の切れはしが橋のように架かる (f で毛布がふわっと伸びてつながる)。子は毛布をつかんで右へ渡っていく
// どこ: 夜の藍色の空に浮かぶ2つの島。左の島 = お母さんの腕の中 (ランプと温かい光のかたまり)、右の島 = 星の壁紙の子ども部屋 (窓の月・おもちゃの棚・汽車・積み木)。間は星のまたたく深い谷。
// 演出: お母さんが両腕に持った毛布の切れはしが、谷の上へふわっと伸びて右の島にとどく (橋)。橋の上を、子どもが毛布の端をにぎりしめて右へ渡っていく。橋の上を温かい光の粒がお母さんから子ども部屋へ流れる。
// 動き: f3〜22 毛布が左から右へ伸びる (先端にきらきら)。f20〜42 子が渡る (歩くたびに橋がたわむ)。カメラはゆっくり右へパンしながら寄る。
const Yw158: React.FC<{ f: number }> = ({ f }) => {
  const grow = easeInOut(seg(f, 3, 22));
  const walk = easeInOut(seg(f, 20, 42));
  const zoom = lerp(1.0, 1.05, easeInOut(seg(f, 0, 42)));
  const pan = lerp(30, -40, easeInOut(seg(f, 0, 42)));
  const bx0 = 590, bx1 = 1330, by = 700, sag = 54;
  const childX = lerp(650, 1010, walk);
  const dip = 16 * seg(f, 20, 24);
  const topY = (x: number) =>
    by + sag * Math.sin(Math.PI * clamp01((x - bx0) / (bx1 - bx0)))
    + dip * gauss(x - childX, 130) + Math.sin(x / 70 + f / 5) * 3 * grow;
  const N = 32;
  const xs = Array.from({ length: N + 1 }, (_, i) => bx0 + ((bx1 - bx0) * i) / N);
  const ptsTop = xs.map((x) => `${x.toFixed(1)},${topY(x).toFixed(1)}`);
  const ptsBot = xs.slice().reverse().map((x) => `${x.toFixed(1)},${(topY(x) + 42).toFixed(1)}`);
  const reach = bx0 - 30 + (bx1 - bx0 + 60) * grow;
  const walking = walk > 0.01 && walk < 0.99;
  const step = walking ? Math.abs(Math.sin(f / 2.4)) * -7 : 0;
  const cs = 0.72;
  const cy = topY(childX) + 4 + step;
  const handY = cy - 118 * cs;
  return (
    <Frame f={f} seed={3158} bg={C.night} dark>
      <defs>
        <radialGradient id="l4b158warm">
          <stop offset="0" stopColor={C.warmGlow} stopOpacity={0.95} />
          <stop offset="0.55" stopColor={C.warmGlow} stopOpacity={0.45} />
          <stop offset="1" stopColor={C.warmGlow} stopOpacity={0} />
        </radialGradient>
        <clipPath id="l4b158clip">
          <rect x={bx0 - 30} y={0} width={Math.max(1, reach - (bx0 - 30))} height={H} />
        </clipPath>
      </defs>
      <g transform={cam(960, 540, zoom, pan, 0)}>
        {/* 夜の空と谷 */}
        <rect x={-120} y={-120} width={W + 240} height={H + 240} fill={C.night} />
        <rect x={-120} y={760} width={W + 240} height={460} fill={C.nightDeep} />
        {Array.from({ length: 46 }, (_, i) => {
          const sx = rnd(158, i) * 2100 - 90;
          const sy = rnd(1580, i) * 1100;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i));
          return <circle key={i} cx={sx} cy={sy} r={2 + rnd(15, i) * 3.5} fill={C.star} opacity={tw} />;
        })}
        {/* 左: お母さんの温かい光 */}
        <ellipse cx={320} cy={470} rx={680} ry={560} fill="url(#l4b158warm)" />
        {/* 左の島 (床の断面) */}
        <path d="M -120 700 L 612 700 L 598 752 L 560 800 L 470 836 L 300 852 L 110 846 L -120 862 Z"
          fill={C.wood} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -120 740 L 590 740 M -120 790 L 540 790" stroke={C.woodDark} strokeWidth={4} opacity={0.6} />
        <path d="M -120 670 L 640 670 L 612 700 L -120 700 Z" fill={C.rug} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={-60 + i * 62} y1={700} x2={-60 + i * 62} y2={714} stroke={C.rugDark} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* 左の島の小物: ランプ・クッション・マグ */}
        <rect x={84} y={380} width={12} height={290} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        <ellipse cx={90} cy={668} rx={46} ry={10} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        <path d="M 30 390 L 150 390 L 128 310 L 52 310 Z" fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        <circle cx={90} cy={400} r={60 + Math.sin(f / 7) * 4} fill={C.warmGlow} opacity={0.4} />
        <rect x={430} y={600} width={140} height={74} rx={30} fill={C.curtainDark} stroke={C.ink} strokeWidth={5} transform="rotate(-6 500 637)" />
        <path d="M 470 620 l 60 -6" stroke={C.ink} strokeWidth={3} opacity={0.5} />
        {/* 右の島 (子ども部屋) */}
        <path d="M 1290 700 L 2040 700 L 2040 860 L 1820 850 L 1600 836 L 1420 812 L 1320 770 Z"
          fill={C.wood} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 1320 740 L 2040 740 M 1400 790 L 2040 790" stroke={C.woodDark} strokeWidth={4} opacity={0.6} />
        <rect x={1300} y={110} width={700} height={562} fill={C.roomWall} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} transform={`translate(${1330 + (i % 6) * 112 + (Math.floor(i / 6) % 2) * 56} ${150 + Math.floor(i / 6) * 100})`}
            d="M 0 -9 L 3 -3 L 9 -2 L 4 2 L 6 9 L 0 5 L -6 9 L -4 2 L -9 -2 L -3 -3 Z" fill={C.roomDot} />
        ))}
        {/* 窓 (月) */}
        <rect x={1370} y={180} width={230} height={230} rx={8} fill={C.windowNight} stroke={C.ink} strokeWidth={6} />
        <circle cx={1530} cy={250} r={34} fill={C.star} stroke={C.ink} strokeWidth={4} />
        <circle cx={1546} cy={240} r={30} fill={C.windowNight} />
        <line x1={1485} y1={180} x2={1485} y2={410} stroke={C.ink} strokeWidth={6} />
        <line x1={1370} y1={295} x2={1600} y2={295} stroke={C.ink} strokeWidth={6} />
        {/* おもちゃの棚 */}
        <rect x={1660} y={330} width={290} height={16} fill={C.wood} stroke={C.ink} strokeWidth={4} />
        <rect x={1680} y={270} width={56} height={60} rx={6} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        <rect x={1746} y={286} width={44} height={44} rx={6} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
        <rect x={1806} y={250} width={22} height={80} fill={KRP.blue} stroke={C.ink} strokeWidth={3.5} />
        <rect x={1830} y={258} width={22} height={72} fill={KRP.green} stroke={C.ink} strokeWidth={3.5} />
        <circle cx={1906} cy={300} r={22} fill={C.star} stroke={C.ink} strokeWidth={4} />
        <circle cx={1906} cy={300} r={44 + Math.sin(f / 6) * 4} fill={C.star} opacity={0.3} />
        {/* 部屋の床 */}
        <path d="M 1290 672 L 2040 672 L 2040 700 L 1290 700 Z" fill={C.roomFloor} stroke={C.ink} strokeWidth={5} />
        {/* 積み木の塔 */}
        {[[1700, 0, KRP.blue], [1704, 1, KRP.yellow], [1698, 2, KRP.red]].map(([bx, k, col], i) => (
          <rect key={i} x={bx as number} y={622 - (k as number) * 50} width={56} height={50} rx={5}
            fill={col as string} stroke={C.ink} strokeWidth={4} transform={`rotate(${(k as number) * 3 - 3} ${(bx as number) + 28} ${647 - (k as number) * 50})`} />
        ))}
        {/* 汽車のおもちゃ */}
        <g transform="translate(1460 672)">
          <rect x={-60} y={-60} width={90} height={44} rx={6} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
          <rect x={10} y={-92} width={36} height={76} rx={5} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={4} />
          <rect x={-46} y={-84} width={16} height={26} fill={C.ink} />
          {[-40, 0, 30].map((wx) => (
            <g key={wx} transform={`translate(${wx} -12) rotate(${f * 6})`}>
              <circle r={13} fill={C.ink} />
              <line x1={-9} y1={0} x2={9} y2={0} stroke={KRP.white} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 木馬 */}
        <g transform={`rotate(${Math.sin(f / 8) * 5} 1860 672)`}>
          <path d="M 1790 672 Q 1860 640 1930 672" fill="none" stroke={C.woodDark} strokeWidth={10} strokeLinecap="round" />
          <rect x={1820} y={560} width={90} height={56} rx={24} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
          <path d="M 1900 570 L 1930 520 L 1950 540 L 1924 586 Z" fill={C.curtain} stroke={C.ink} strokeWidth={5} />
          <line x1={1832} y1={612} x2={1812} y2={662} stroke={C.ink} strokeWidth={7} />
          <line x1={1898} y1={612} x2={1918} y2={662} stroke={C.ink} strokeWidth={7} />
        </g>
        {/* 毛布の垂れ (お母さんの手から橋のはじまりへ) */}
        <path d={`M 286 500 Q 470 520 ${bx0} ${by} L ${bx0} ${by + 42} Q 440 600 300 536 Z`}
          fill={C.blanket} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M 286 500 Q 470 520 ${bx0} ${by}`} fill="none" stroke={C.blanketEdge} strokeWidth={8} />
        <path d={`M 330 540 Q 460 580 ${bx0} ${by + 20}`} fill="none" stroke={C.blanketDark} strokeWidth={3} opacity={0.7} />
        {/* お母さん (毛布を両手で差し出す) */}
        <L4bMom x={300} y={690} s={1.55} f={f} pose="hold" face="smile" gaze={[6, 3]} />
        <circle cx={300 - 14 * 1.55} cy={690 - 118 * 1.55 + pBob(f, 2)} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={300 + 14 * 1.55} cy={690 - 118 * 1.55 + pBob(f, 2)} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        {/* 毛布の橋 (左から伸びる) */}
        <g clipPath="url(#l4b158clip)">
          <polygon points={[...ptsTop, ...ptsBot].join(" ")} fill={C.blanket} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <polyline points={xs.map((x) => `${x.toFixed(1)},${(topY(x) + 21).toFixed(1)}`).join(" ")} fill="none" stroke={C.blanketDark} strokeWidth={3.5} opacity={0.75} />
          {xs.filter((_, i) => i % 3 === 1).map((x, i) => (
            <line key={i} x1={x} y1={topY(x) + 4} x2={x + 4} y2={topY(x) + 40} stroke={C.blanketDark} strokeWidth={3} opacity={0.7} />
          ))}
          <polyline points={ptsTop.join(" ")} fill="none" stroke={C.blanketEdge} strokeWidth={8} />
          <polyline points={xs.map((x) => `${x.toFixed(1)},${(topY(x) - 4).toFixed(1)}`).join(" ")} fill="none" stroke={C.ink} strokeWidth={3} />
          {/* ほつれ (橋の下に垂れる糸) */}
          {[700, 880, 1080, 1220].map((x, i) => (
            <path key={i} d={`M ${x} ${topY(x) + 42} q ${Math.sin(f / 6 + i) * 6} 18 0 34`} fill="none" stroke={C.blanketDark} strokeWidth={3} strokeLinecap="round" />
          ))}
          {/* 温かい光の粒が子ども部屋へ流れる */}
          {Array.from({ length: 6 }, (_, i) => {
            const px = bx0 + (((f * 9 + i * 130) % (bx1 - bx0)));
            return <circle key={i} cx={px} cy={topY(px) - 14} r={8} fill={C.warmGlow} opacity={0.85 * grow} />;
          })}
        </g>
        {/* 伸びる先端のきらきら */}
        {grow > 0.02 && grow < 0.98 && (
          <g transform={`translate(${reach - 30} ${topY(reach - 30) + 10})`}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={0} y1={0} x2={0} y2={-34} stroke={C.star} strokeWidth={5} strokeLinecap="round"
                transform={`rotate(${i * 90 + f * 8}) translate(0 -14)`} />
            ))}
          </g>
        )}
        {/* 子ども (毛布の端をにぎって渡る) */}
        {walk > 0 && (
          <g>
            <ellipse cx={childX} cy={topY(childX) + 4} rx={40} ry={8} fill={C.ink} opacity={0.22} />
            <path d={`M ${childX - 46} ${topY(childX - 46)} Q ${childX - 40} ${handY + 40} ${childX} ${handY}`}
              fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
            <path d={`M ${childX - 46} ${topY(childX - 46)} Q ${childX - 40} ${handY + 40} ${childX} ${handY}`}
              fill="none" stroke={C.blanket} strokeWidth={14} strokeLinecap="round" />
            <Person x={childX} y={cy} s={cs} f={f} phase={9} hair="cap" cloth={C.onesie} clothDark={KRP.blueDeep}
              pose="hold" face={walk > 0.5 ? "joy" : "normal"} gaze={[6, -1]} still />
            <ellipse cx={childX} cy={handY + 2} rx={26} ry={16} fill={C.blanket} stroke={C.ink} strokeWidth={4} />
          </g>
        )}
        <TagPlate x={300} y={770} text="お母さんの腕" size={38} t={seg(f, 6, 14)} rot={-2} />
        <TagPlate x={1650} y={70} text="ひとりの世界" size={38} t={seg(f, 12, 20)} rot={2} />
      </g>
    </Frame>
  );
};

// ---- 文#159 【山】 ちなみに、私たちの肌には、ゆっくり撫でられたときに、よく反応する神経があります。
// 設計: 腕の肌を、別の人の手がゆっくり撫でる超アップ。肌の断面を半透明にして、皮膚の下の細い神経 (黄色の線) が、撫でる手の動きに合わせて f で光る。札「撫でられると反応する神経」
// どこ: ソファでくつろぐ人の前腕の超アップ (奥はぼけたリビング: ランプの光・セージ色のソファ)。腕の手前を断面にして、表皮・真皮・脂肪の層、毛穴と毛、血管が見える。左端はニットの袖。
// 演出: お母さんのカーディガンの袖の手が、肌の上を左から右へゆっくり撫でる。手の下の神経の枝だけが黄色く灯り、通り過ぎたあとも余韻で光る。光の粒が神経の幹を通って「脳へ」左へ走る。
// 動き: f3〜40 手が x380→1420 へ。神経は手の位置に合わせて点灯 (ガウス) + 通り過ぎた所は残光。光の粒は毎フレーム左へ流れる。カメラは手にあわせて少しパン。
const Yw159: React.FC<{ f: number }> = ({ f }) => {
  const surf = (x: number) => {
    const t = (x + 60) / 2040;
    return 350 - 120 * t * (1 - t);
  };
  const hx = lerp(380, 1420, easeInOut(seg(f, 3, 40)));
  const hc = hx - 110;
  const act = (x: number) => {
    const g = gauss(x - hc, 170);
    const trail = x < hc && x > 300 ? 0.6 * Math.exp(-(hc - x) / 420) : 0;
    return clamp01(Math.max(g, trail) * seg(f, 2, 8));
  };
  const band = (o0: number, o1: number) => {
    const xs = Array.from({ length: 53 }, (_, i) => -60 + i * 40);
    const a = xs.map((x) => `${x},${(surf(x) + o0).toFixed(1)}`);
    const b = xs.slice().reverse().map((x) => `${x},${(surf(x) + o1).toFixed(1)}`);
    return [...a, ...b].join(" ");
  };
  const hairs = [260, 350, 450, 545, 650, 745, 850, 950, 1050, 1150, 1250, 1350, 1455, 1560, 1665, 1770, 1870];
  const fiberY = (x: number) => surf(x) + 205 + Math.sin(x / 90) * 10;
  const fiberPts = Array.from({ length: 50 }, (_, i) => 160 + i * 38);
  const pan = lerp(30, -30, easeInOut(seg(f, 3, 40)));
  return (
    <Frame f={f} seed={3159} bg={C.wallWarm}>
      <g transform={cam(960, 540, 1.03, pan, 0)}>
        {/* 奥のぼけたリビング */}
        <rect x={-120} y={-120} width={W + 240} height={H + 240} fill={C.wallWarm} />
        <ellipse cx={1500} cy={120} rx={260} ry={180} fill={C.warmGlow} opacity={0.55} />
        <ellipse cx={1500} cy={120} rx={120} ry={90} fill={C.morning} opacity={0.8} />
        <rect x={200} y={60} width={780} height={300} rx={90} fill={C.sofaSage} opacity={0.55} />
        <rect x={260} y={110} width={220} height={170} rx={60} fill={C.curtain} opacity={0.5} />
        <rect x={1100} y={-40} width={160} height={300} rx={20} fill={C.sky} opacity={0.5} />
        {/* 腕の下 (ひざのクッション) */}
        <rect x={-120} y={820} width={W + 240} height={400} fill={C.sofaSageDark} />
        {/* 腕の断面: 表皮・真皮・脂肪 */}
        <polygon points={band(0, 540)} fill={C.fat} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 24 }, (_, i) => {
          const lx = 120 + i * 80 + (i % 2) * 30;
          return <ellipse key={i} cx={lx} cy={surf(lx) + 300 + (i % 3) * 50} rx={40} ry={26} fill="none" stroke={C.fatDark} strokeWidth={3.5} />;
        })}
        <polygon points={band(30, 236)} fill={C.dermis} />
        <polyline points={Array.from({ length: 53 }, (_, i) => -60 + i * 40).map((x) => `${x},${(surf(x) + 236).toFixed(1)}`).join(" ")}
          fill="none" stroke={C.skinLine} strokeWidth={3.5} strokeDasharray="14 10" />
        <polygon points={band(0, 30)} fill={C.skin} />
        <polyline points={Array.from({ length: 53 }, (_, i) => -60 + i * 40).map((x) => `${x},${(surf(x) + 30).toFixed(1)}`).join(" ")}
          fill="none" stroke={C.skinLine} strokeWidth={3} />
        {/* 血管 (赤い動脈と青い静脈) */}
        <polyline points={fiberPts.map((x) => `${x},${(surf(x) + 330 + Math.sin(x / 140) * 14).toFixed(1)}`).join(" ")}
          fill="none" stroke={C.vessel} strokeWidth={16} strokeLinecap="round" opacity={0.6} />
        <polyline points={fiberPts.map((x) => `${x},${(surf(x) + 380 + Math.cos(x / 160) * 12).toFixed(1)}`).join(" ")}
          fill="none" stroke={C.vein} strokeWidth={14} strokeLinecap="round" opacity={0.55} />
        {/* 毛穴と毛 */}
        {hairs.map((x, i) => (
          <g key={i}>
            <path d={`M ${x} ${surf(x) + 4} L ${x - 26} ${surf(x) + 118}`} stroke={C.follicle} strokeWidth={18} strokeLinecap="round" />
            <ellipse cx={x - 28} cy={surf(x) + 124} rx={12} ry={14} fill={C.follicle} stroke={C.skinLine} strokeWidth={2.5} />
            <path d={`M ${x - 24} ${surf(x) + 114} L ${x} ${surf(x)} Q ${x + 12} ${surf(x) - 34} ${x + 34} ${surf(x) - 64}`}
              fill="none" stroke={C.hair} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
        {/* 神経 (いつもは薄い黄色) */}
        <polyline points={fiberPts.map((x) => `${x},${fiberY(x).toFixed(1)}`).join(" ")} fill="none" stroke={C.nerveDim} strokeWidth={7} strokeLinecap="round" />
        {hairs.map((x, i) => {
          const a = act(x - 20);
          const d = `M ${x - 70} ${fiberY(x - 70)} Q ${x - 70} ${surf(x) + 150} ${x - 36} ${surf(x) + 126} M ${x - 30} ${fiberY(x - 30)} Q ${x + 10} ${surf(x) + 110} ${x + 22} ${surf(x) + 40}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={C.nerveDim} strokeWidth={5} strokeLinecap="round" />
              {a > 0.02 && (
                <>
                  <path d={d} fill="none" stroke={YP.glow} strokeWidth={18} strokeLinecap="round" opacity={0.55 * a} />
                  <path d={d} fill="none" stroke={YP.glowCore} strokeWidth={5} strokeLinecap="round" opacity={a} />
                  <circle cx={x + 22} cy={surf(x) + 40} r={9 + 6 * a} fill={YP.glowCore} stroke={C.ink} strokeWidth={2.5} opacity={a} />
                </>
              )}
            </g>
          );
        })}
        {/* 幹の光 (手の下ほど明るい) */}
        {fiberPts.slice(0, -1).map((x, i) => {
          const a = act(x);
          if (a < 0.03) return null;
          const x2 = fiberPts[i + 1];
          return <line key={i} x1={x} y1={fiberY(x)} x2={x2} y2={fiberY(x2)} stroke={YP.glow} strokeWidth={16} strokeLinecap="round" opacity={0.5 * a} />;
        })}
        {/* 信号の粒が「脳へ」走る */}
        {[0, 1, 2, 3].map((k) => {
          const px = hc - ((f * 16 + k * 190) % 760);
          if (px < 190 || f < 6) return null;
          return (
            <g key={k}>
              <circle cx={px} cy={fiberY(px)} r={20} fill={YP.glow} opacity={0.5} />
              <circle cx={px} cy={fiberY(px)} r={9} fill={YP.glowCore} stroke={C.ink} strokeWidth={2.5} />
            </g>
          );
        })}
        {/* 肌の表面の線 */}
        <polyline points={Array.from({ length: 53 }, (_, i) => -60 + i * 40).map((x) => `${x},${surf(x).toFixed(1)}`).join(" ")}
          fill="none" stroke={C.ink} strokeWidth={7} />
        {/* 左端: ニットの袖 */}
        <rect x={-140} y={250} width={290} height={640} rx={50} fill={C.knit} stroke={C.ink} strokeWidth={7} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={30 + i * 20} y1={280} x2={30 + i * 20} y2={860} stroke={C.knitDark} strokeWidth={5} />
        ))}
        <Arrow x={140} y={fiberY(240)} s={0.62} rot={180} t={seg(f, 10, 18)} color={YP.glow} />
        <TagPlate x={300} y={640} text="脳へ" size={32} t={seg(f, 12, 20)} rot={-3} />
        {/* 撫でる手 (お母さんのカーディガンの袖) と、ゆっくりの軌跡 */}
        <path d={`M ${Math.max(300, hx - 600)} ${surf(hx) - 80} Q ${hx - 360} ${surf(hx) - 110} ${hx - 250} ${surf(hx) - 70}`}
          fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="4 16" strokeLinecap="round" opacity={0.5 * seg(f, 8, 14)} />
        <ellipse cx={hc} cy={surf(hc) + 6} rx={140} ry={10} fill={C.skinShade} opacity={0.8} />
        <L4bStrokeHand x={hx} y={surf(hc) + 2 + Math.sin(f / 5) * 2} s={1.05} rot={-1} />
        <TagPlate x={1700} y={790} text="皮ふの中" size={30} t={seg(f, 14, 22)} rot={2} />
      </g>
      <g>
        <TagPlate x={960} y={110} text="撫でられると反応する神経" size={44} t={seg(f, 10, 20)} />
      </g>
    </Frame>
  );
};

// ---- 文#160 【図】 いちばんよく反応するのは、秒速数センチ。ちょうど、人の手で撫でる速さです。
// 設計: 速さのグラフ (世界=研究所のグラフ用紙)。横軸に撫でる速さ、山なりの線。山の頂点に、撫でる手の小さな絵。札「秒速数センチ」「人の手の速さ」。数字は「数センチ」以外書かない
// どこ: 研究所の木の机の上 (真上から)。方眼紙をテープで留め、まわりにコーヒー・ストップウォッチ・鉛筆・定規。
// 演出: 測った点 (誤差棒つき) が打たれていき、赤ペンが山なりの線を引く。頂点に「撫でる手」の丸い小窓が出て、手がゆっくり往復。左端に「おそい」のカタツムリ、右端に「はやい」の風。
// 動き: f2〜20 点が打たれる。f4〜24 赤ペンが線を引く。f24〜32 頂点の小窓と札。ストップウォッチの針は回り続ける。カメラは頂点へ寄る。
const Yw160: React.FC<{ f: number }> = ({ f }) => {
  const ox = 330, oy = 700;
  const peakX = 900;
  const yC = (x: number) => 670 - 410 * gauss(x - peakX, 250);
  const xs = Array.from({ length: 64 }, (_, i) => 340 + i * 20);
  const pts = xs.map((x) => [x, yC(x)] as const);
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const draw = easeInOut(seg(f, 4, 24));
  const penI = Math.min(pts.length - 1, Math.floor(draw * (pts.length - 1)));
  const [penX, penY] = pts[penI];
  const peakT = seg(f, 24, 32);
  const zoom = lerp(1.0, 1.06, easeInOut(seg(f, 6, 42)));
  const handSw = Math.sin(f / 9) * 46;
  return (
    <Frame f={f} seed={3160} bg={C.deskWood}>
      <g transform={cam(900, 420, zoom)}>
        {/* 机 (木目) */}
        <rect x={-120} y={-120} width={W + 240} height={H + 240} fill={C.deskWood} />
        <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.5} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -120 ${40 + i * 150} q 520 ${rnd(160, i) * 40 - 20} 1080 0 q 520 ${rnd(161, i) * 40 - 20} 1080 0`} />
          ))}
        </g>
        {/* 方眼紙 */}
        <g transform="rotate(-1 960 450)">
          <rect x={200} y={70} width={1520} height={740} rx={6} fill={C.gridPaper} stroke={C.ink} strokeWidth={7} />
          <g stroke={C.gridLine} strokeWidth={2}>
            {Array.from({ length: 37 }, (_, i) => <line key={`v${i}`} x1={220 + i * 40} y1={80} x2={220 + i * 40} y2={800} />)}
            {Array.from({ length: 18 }, (_, i) => <line key={`h${i}`} x1={210} y1={100 + i * 40} x2={1710} y2={100 + i * 40} />)}
          </g>
          <g stroke={C.gridMajor} strokeWidth={3}>
            {Array.from({ length: 8 }, (_, i) => <line key={`V${i}`} x1={220 + i * 200} y1={80} x2={220 + i * 200} y2={800} />)}
            {Array.from({ length: 4 }, (_, i) => <line key={`H${i}`} x1={210} y1={100 + i * 200} x2={1710} y2={100 + i * 200} />)}
          </g>
          {/* テープ */}
          {([[230, 84, -30], [1690, 84, 28], [232, 798, 32], [1688, 798, -26]] as const).map(([tx, ty, r], i) => (
            <rect key={i} x={tx - 52} y={ty - 18} width={104} height={36} rx={4}
              fill={i % 2 ? "#E8A3A0" : "#9FC8C0"} opacity={0.85} stroke={C.ink} strokeWidth={3}
              transform={`rotate(${r} ${tx} ${ty})`} />
          ))}
          {/* 軸 */}
          <line x1={ox} y1={oy} x2={1640} y2={oy} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <polygon points={`1660,${oy} 1630,${oy - 16} 1630,${oy + 16}`} fill={C.ink} />
          <line x1={ox} y1={oy} x2={ox} y2={150} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <polygon points={`${ox},130 ${ox - 16},160 ${ox + 16},160`} fill={C.ink} />
          <text x={980} y={772} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink}>撫でる速さ</text>
          <text x={0} y={0} transform={`translate(${ox - 40} 420) rotate(-90)`} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.ink}>神経の反応</text>
          <text x={430} y={750} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.grayDark}>おそい</text>
          <text x={1560} y={750} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.grayDark}>はやい</text>
          {/* カタツムリ (おそい) */}
          <g transform={`translate(${400 + f * 0.6} 660)`}>
            <path d="M -40 26 Q 0 30 44 26 L 54 10 Q 40 14 30 20 Z" fill={C.bearMuzzle} stroke={C.ink} strokeWidth={3.5} />
            <circle cx={0} cy={2} r={24} fill={C.curtainDark} stroke={C.ink} strokeWidth={3.5} />
            <path d="M 0 2 m -12 0 a 12 12 0 1 1 12 12" fill="none" stroke={C.ink} strokeWidth={3} />
            <line x1={46} y1={14} x2={56} y2={-6} stroke={C.ink} strokeWidth={3} />
            <circle cx={56} cy={-8} r={4} fill={C.ink} />
          </g>
          {/* 風 (はやい) */}
          <g stroke={KRP.blueDeep} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.8}>
            {[0, 1, 2].map((i) => {
              const off = ((f * 14 + i * 40) % 120);
              return <path key={i} d={`M ${1470 + off} ${630 + i * 22} q 30 -10 60 0`} />;
            })}
          </g>
          {/* 測った点 (誤差棒つき) */}
          {Array.from({ length: 14 }, (_, i) => {
            const x = 380 + i * 88;
            const y = yC(x) + (rnd(1600, i) - 0.5) * 44;
            const t = pop(seg(f, 2 + i * 1.2, 5 + i * 1.2));
            if (t <= 0) return null;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${t})`}>
                <line x1={0} y1={-22} x2={0} y2={22} stroke={KRP.blueDeep} strokeWidth={3} />
                <line x1={-8} y1={-22} x2={8} y2={-22} stroke={KRP.blueDeep} strokeWidth={3} />
                <line x1={-8} y1={22} x2={8} y2={22} stroke={KRP.blueDeep} strokeWidth={3} />
                <circle r={9} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
              </g>
            );
          })}
          {/* 山なりの線 (赤ペンで引かれる) */}
          <polyline points={pts.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" ")} fill="none" stroke={KRP.red}
            strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len * draw} ${len + 10}`} />
          {/* 頂点からの点線と、頂点の光 */}
          {peakT > 0 && (
            <g opacity={peakT}>
              <line x1={peakX} y1={yC(peakX) + 16} x2={peakX} y2={oy} stroke={KRP.red} strokeWidth={4} strokeDasharray="12 10" />
              <circle cx={peakX} cy={yC(peakX)} r={26 + Math.sin(f / 4) * 5} fill={YP.glow} opacity={0.55} />
              <circle cx={peakX} cy={yC(peakX)} r={12} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
            </g>
          )}
          {/* 頂点の小窓: ゆっくり撫でる手 */}
          {peakT > 0 && (
            <g transform={`translate(600 236) scale(${pop(peakT)})`}>
              <circle r={108} fill={YP.glow} opacity={0.35} />
              <circle r={92} fill={C.wallWarm} stroke={C.ink} strokeWidth={6} />
              <clipPath id="l4b160win"><circle r={88} /></clipPath>
              <g clipPath="url(#l4b160win)">
                <rect x={-120} y={20} width={240} height={90} fill={C.skin} stroke={C.ink} strokeWidth={4} />
                {[-60, -20, 20, 60].map((hx2) => (
                  <path key={hx2} d={`M ${hx2} 20 q 4 -8 12 -14`} stroke={C.hair} strokeWidth={3} fill="none" />
                ))}
                <L4bStrokeHand x={40 + handSw * 0.8} y={22} s={0.4} />
              </g>
              <path d="M -60 -40 q 60 -26 120 0" fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="4 10" />
              <path d={`M 100 30 Q 220 60 ${peakX - 600 - 20} ${-236 + 260 - 10}`} fill="none" stroke={KRP.red} strokeWidth={4} strokeDasharray="8 8" />
            </g>
          )}
          {/* 赤ペン */}
          <g transform={`translate(${penX} ${penY}) rotate(-35)`}>
            <rect x={-8} y={-150} width={18} height={130} rx={6} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
            <rect x={-8} y={-150} width={18} height={34} rx={6} fill={C.ink} />
            <path d="M -8 -20 L 10 -20 L 1 0 Z" fill={C.bearMuzzle} stroke={C.ink} strokeWidth={3} />
          </g>
        </g>
        {/* 机の上の道具 */}
        <g transform="translate(110 150)">
          <circle r={86} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <circle r={64} fill={C.woodDark} />
          <ellipse cx={-18} cy={-20} rx={22} ry={10} fill={C.woodLight} opacity={0.6} />
          <rect x={80} y={-18} width={50} height={36} rx={14} fill="none" stroke={C.ink} strokeWidth={8} />
        </g>
        <g transform="translate(1830 340)">
          <rect x={-16} y={-118} width={32} height={30} rx={6} fill={KRP.silver} stroke={C.ink} strokeWidth={4} />
          <circle r={92} fill={KRP.silver} stroke={C.ink} strokeWidth={6} />
          <circle r={74} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={-62} x2={0} y2={-72} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-60} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * 8})`} />
          <circle r={7} fill={C.ink} />
        </g>
        <g transform="rotate(-62 1800 700)">
          <rect x={1700} y={688} width={220} height={22} rx={4} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          <path d="M 1920 688 L 1956 699 L 1920 710 Z" fill={C.bearMuzzle} stroke={C.ink} strokeWidth={3.5} />
        </g>
        <rect x={260} y={850} width={1300} height={56} fill={C.blanketEdge} stroke={C.ink} strokeWidth={5} transform="rotate(-1 900 878)" />
        {Array.from({ length: 33 }, (_, i) => (
          <line key={i} x1={280 + i * 40} y1={852 - i * 0.7} x2={280 + i * 40} y2={(i % 5 === 0 ? 886 : 872) - i * 0.7} stroke={C.ink} strokeWidth={3} />
        ))}
      </g>
      <g>
        <g transform={cam(900, 420, zoom)}>
          <TagPlate x={900} y={450} text="秒速数センチ" size={42} t={seg(f, 26, 34)} />
          <TagPlate x={600} y={392} text="人の手の速さ" size={34} t={seg(f, 30, 38)} rot={-2} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#161 【並】 この神経は、毛の生えている肌に多く、手のひらには、ほとんどありません。
// 設計: 腕 (毛の生えた肌。産毛を描く) と手のひらを並べた図。腕には神経の光の点がたくさん、手のひらにはほとんどない (1〜2点)。札「腕: 多い」「手のひら: ほとんどない」
// どこ: 研究所の木の机の上 (真上から)。麻のマットの上に、左は袖をまくった腕 (手の甲を上・産毛)、右は手のひらを上に向けた手 (袖は手首まで)。机の隅に羽根とお茶。
// 演出: 虫めがねが腕の上をすべると、光の点がぽつぽつと次々に灯る (たくさん)。虫めがねが右の手のひらへ移ると、灯るのは2つだけ。虫めがねの下では点が大きく見える。
// 動き: f4〜26 腕の点が順に灯る。f2〜22 虫めがねが腕を下から上へ。f24〜36 手のひらへ移動。f28,f34 手のひらの2点。カメラは虫めがねを追って少しパン。
const Yw161: React.FC<{ f: number }> = ({ f }) => {
  const toPalm = easeInOut(seg(f, 24, 36));
  const armT = easeInOut(seg(f, 2, 22));
  const lx = lerp(560, 1360, toPalm);
  const ly = lerp(lerp(740, 520, armT), 500, toPalm);
  const lr = 128;
  const pan = lerp(40, -40, toPalm);
  const armDots = Array.from({ length: 24 }, (_, i) => ({
    x: 500 + (i % 4) * 40 + rnd(1611, i) * 22, y: 480 + Math.floor(i / 4) * 50 + rnd(1612, i) * 24, t: seg(f, 4 + i * 0.9, 7 + i * 0.9),
  }));
  const backDots = [[520, 330], [600, 300], [560, 400]].map(([x, y], i) => ({ x, y, t: seg(f, 22 + i, 25 + i) }));
  const palmDots = [{ x: 1320, y: 540, t: seg(f, 28, 31) }, { x: 1410, y: 456, t: seg(f, 34, 37) }];
  const dot = (d: { x: number; y: number; t: number }, k: string, dim = 1) => {
    if (d.t <= 0) return null;
    const inLens = Math.hypot(d.x - lx, d.y - ly) < lr - 10;
    const sc = pop(d.t) * (inLens ? 1.55 : 1) * (0.92 + Math.sin(f / 5 + d.x) * 0.08);
    return (
      <g key={k} transform={`translate(${d.x} ${d.y}) scale(${sc})`} opacity={dim}>
        <circle r={22} fill={YP.glow} opacity={0.45} />
        <circle r={9} fill={YP.glowCore} stroke={C.ink} strokeWidth={2.5} />
      </g>
    );
  };
  return (
    <Frame f={f} seed={3161} bg={C.deskWood}>
      <g transform={cam(960, 540, 1.03, pan, 0)}>
        <rect x={-120} y={-120} width={W + 240} height={H + 240} fill={C.deskWood} />
        <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.5} fill="none">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -120 ${60 + i * 150} q 520 ${rnd(170, i) * 40 - 20} 1080 0 q 520 ${rnd(171, i) * 40 - 20} 1080 0`} />
          ))}
        </g>
        {/* 麻のマット */}
        <rect x={250} y={40} width={1420} height={1000} rx={14} fill={C.blanketEdge} stroke={C.ink} strokeWidth={6} />
        <g stroke={C.curtainDark} strokeWidth={2.5} opacity={0.5}>
          {Array.from({ length: 34 }, (_, i) => <line key={i} x1={270} y1={70 + i * 28} x2={1650} y2={70 + i * 28} />)}
        </g>
        <line x1={960} y1={70} x2={960} y2={1010} stroke={C.curtainDark} strokeWidth={4} strokeDasharray="16 12" />
        {/* 羽根とお茶 (机の隅) */}
        <g transform={`rotate(${-30 + Math.sin(f / 10) * 3} 1790 220)`}>
          <path d="M 1790 70 Q 1850 160 1800 360 Q 1740 170 1790 70 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          <line x1={1790} y1={80} x2={1800} y2={400} stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M 1795 ${140 + i * 50} l 30 -24 M 1793 ${150 + i * 50} l -26 -22`} stroke={C.ink} strokeWidth={2.5} />)}
        </g>
        <g transform="translate(130 880)">
          <circle r={80} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <circle r={60} fill={C.curtainDark} />
          <path d={`M -10 -70 q ${Math.sin(f / 6) * 10} -30 0 -60`} fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
        </g>
        {/* ===== 左: 腕 (手の甲が上・袖をまくる) ===== */}
        <path d="M 456 960 L 472 452 Q 560 424 650 452 L 676 960 Z" fill={C.skin} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 500 600 q 20 90 0 200" fill="none" stroke={C.skinShade} strokeWidth={10} opacity={0.7} />
        {/* 産毛 */}
        {Array.from({ length: 64 }, (_, i) => {
          const hx = 488 + rnd(1613, i) * 150;
          const hy = 470 + rnd(1614, i) * 330;
          return <path key={i} d={`M ${hx} ${hy} q 4 -10 14 -16`} fill="none" stroke={C.hair} strokeWidth={3} strokeLinecap="round" />;
        })}
        {/* 手の甲と指 */}
        {[[488, 125], [534, 165], [580, 178], [626, 158]].map(([fx, fl], i) => (
          <g key={i}>
            <rect x={fx - 22} y={262 - fl} width={44} height={fl + 30} rx={22} fill={C.skin} stroke={C.ink} strokeWidth={5} />
            <rect x={fx - 14} y={268 - fl} width={28} height={30} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
            <path d={`M ${fx - 12} ${262 - fl * 0.45} q 12 6 24 0`} fill="none" stroke={C.skinLine} strokeWidth={3} />
          </g>
        ))}
        <path d="M 640 420 Q 700 380 740 300 Q 756 270 734 262 Q 712 262 700 290 Q 680 340 640 360 Z" fill={C.skin} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 472 456 Q 452 340 470 262 L 650 262 Q 668 340 650 456 Z" fill={C.skin} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
        {[488, 534, 580, 626].map((kx) => <path key={kx} d={`M ${kx - 10} 282 q 10 -8 20 0`} fill="none" stroke={C.skinLine} strokeWidth={3} />)}
        {Array.from({ length: 10 }, (_, i) => {
          const hx = 490 + rnd(1615, i) * 140;
          const hy = 300 + rnd(1616, i) * 130;
          return <path key={i} d={`M ${hx} ${hy} q 3 -8 11 -12`} fill="none" stroke={C.hair} strokeWidth={2.5} strokeLinecap="round" />;
        })}
        {/* まくった袖 */}
        <path d="M 426 790 Q 560 770 706 790 L 712 880 Q 560 860 420 880 Z" fill={C.knit} stroke={C.ink} strokeWidth={6} />
        <path d="M 420 870 L 400 1100 L 730 1100 L 712 870 Z" fill={C.knitDark} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={440 + i * 36} y1={796} x2={438 + i * 36} y2={872} stroke={C.knitDark} strokeWidth={4} />)}
        {/* ===== 右: 手のひら (上向き・袖は手首まで) ===== */}
        {[[1268, 122], [1318, 160], [1370, 176], [1422, 158]].map(([fx, fl], i) => (
          <g key={i}>
            <rect x={fx - 23} y={392 - fl} width={46} height={fl + 30} rx={23} fill={C.skin} stroke={C.ink} strokeWidth={5} />
            {[0.34, 0.66].map((k) => (
              <path key={k} d={`M ${fx - 14} ${392 - fl * k} q 14 6 28 0`} fill="none" stroke={C.skinLine} strokeWidth={3} />
            ))}
            <ellipse cx={fx} cy={392 - fl + 26} rx={12} ry={14} fill={C.skinShade} opacity={0.6} />
          </g>
        ))}
        <path d="M 1466 560 Q 1530 520 1560 440 Q 1574 404 1548 398 Q 1524 396 1512 430 Q 1490 486 1460 500 Z" fill={C.skin} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 1256 640 Q 1232 520 1246 392 L 1446 392 Q 1478 470 1470 560 Q 1462 640 1440 660 Z" fill={C.skin} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
        <ellipse cx={1430} cy={580} rx={44} ry={60} fill={C.skinShade} opacity={0.55} />
        <g fill="none" stroke={C.skinLine} strokeWidth={4} strokeLinecap="round">
          <path d="M 1252 452 Q 1340 470 1446 430" />
          <path d="M 1256 500 Q 1340 500 1420 480" />
          <path d="M 1430 470 Q 1370 540 1400 640" />
        </g>
        <path d="M 1250 646 q 100 14 196 0" fill="none" stroke={C.skinLine} strokeWidth={3.5} />
        <path d="M 1236 650 Q 1350 668 1460 650 L 1480 1100 L 1220 1100 Z" fill={C.knit} stroke={C.ink} strokeWidth={6} />
        <rect x={1236} y={650} width={226} height={50} rx={10} fill={C.knitDark} stroke={C.ink} strokeWidth={5} />
        <circle cx={1430} cy={676} r={9} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        {/* 神経の光の点 */}
        {armDots.map((d, i) => dot(d, `a${i}`))}
        {backDots.map((d, i) => dot(d, `b${i}`, 0.85))}
        {palmDots.map((d, i) => dot(d, `p${i}`))}
        {/* 虫めがね */}
        <g transform={`translate(${lx} ${ly})`}>
          <line x1={lr * 0.72} y1={lr * 0.72} x2={lr * 1.7} y2={lr * 1.7} stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
          <line x1={lr * 0.72} y1={lr * 0.72} x2={lr * 1.7} y2={lr * 1.7} stroke={C.woodDark} strokeWidth={24} strokeLinecap="round" />
          <circle r={lr} fill={C.sky} opacity={0.22} />
          <circle r={lr} fill="none" stroke={YP.brassDark} strokeWidth={18} />
          <circle r={lr} fill="none" stroke={C.ink} strokeWidth={5} />
          <circle r={lr + 9} fill="none" stroke={C.ink} strokeWidth={4} />
          <path d={`M ${-lr * 0.6} ${-lr * 0.3} Q ${-lr * 0.5} ${-lr * 0.62} ${-lr * 0.18} ${-lr * 0.7}`} fill="none" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
        </g>
        <TagPlate x={560} y={780} text="腕: 多い" size={44} t={seg(f, 16, 24)} rot={-2} />
        <TagPlate x={1360} y={780} text="手のひら: ほとんどない" size={40} t={seg(f, 32, 40)} rot={2} />
      </g>
    </Frame>
  );
};

// ---- 冬の夜のリビング (#162 と #163 は同じ部屋・同じ時間の続き。この2枚だけで使う)
//   大人 = (820,770) s1.3 / 子ども = (1150,840) s0.82。children は大人の毛布の上・子どもの下に描かれる
const L4bLivingNight: React.FC<{ f: number; id: string; children?: React.ReactNode }> = ({ f, id, children }) => {
  const rub = Math.sin(f / 3.2) * 5 * seg(f, 4, 10);
  const flick = 0.82 + Math.sin(f / 2.3) * 0.09 + Math.sin(f / 5.1) * 0.07;
  const ax = 820, ay = 770, as = 1.3;
  const kx = 1150, ky = 840, ks = 0.82;
  const ab = pBob(f, 3);
  const throwD = "M 690 556 Q 820 526 950 556 Q 1008 640 1012 720 Q 1016 780 996 812 L 646 812 Q 624 780 628 720 Q 634 640 690 556 Z";
  return (
    <g>
      <defs>
        <radialGradient id={`${id}stove`}>
          <stop offset="0" stopColor={C.flame} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={C.warmGlow} stopOpacity={0.25} />
          <stop offset="1" stopColor={C.warmGlow} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}win`}><rect x={1410} y={110} width={380} height={360} /></clipPath>
        <clipPath id={`${id}throw`}><path d={throwD} /></clipPath>
      </defs>
      {/* 壁 (縦じまの壁紙)・幅木・床 */}
      <rect x={-200} y={-200} width={W + 400} height={1000} fill={C.wallWarm} />
      {Array.from({ length: 26 }, (_, i) => (
        <rect key={i} x={-200 + i * 90} y={-200} width={30} height={1000} fill={C.curtainDark} opacity={0.16} />
      ))}
      <rect x={-200} y={780} width={W + 400} height={24} fill={C.wood} stroke={C.ink} strokeWidth={4} />
      <rect x={-200} y={804} width={W + 400} height={500} fill={C.woodLight} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={-200} y1={840 + i * 40} x2={W + 200} y2={840 + i * 40} stroke={C.wood} strokeWidth={3} opacity={0.6} />
      ))}
      <ellipse cx={920} cy={930} rx={780} ry={120} fill={C.rug} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={920} cy={930} rx={700} ry={92} fill="none" stroke={C.rugDark} strokeWidth={5} strokeDasharray="20 14" />
      {/* 窓: 雪の夜 */}
      <rect x={1410} y={110} width={380} height={360} fill={C.windowNight} />
      <g clipPath={`url(#${id}win)`}>
        <path d="M 1400 470 Q 1500 400 1600 430 Q 1700 400 1800 440 L 1800 480 L 1400 480 Z" fill={C.snow} />
        <rect x={1640} y={360} width={70} height={70} fill={C.nightDeep} />
        <path d="M 1630 362 L 1675 330 L 1720 362 Z" fill={C.snow} />
        <rect x={1662} y={384} width={22} height={22} fill={C.warmGlow} />
        {Array.from({ length: 42 }, (_, i) => {
          const sx = 1410 + rnd(1621, i) * 380 + Math.sin(f / 10 + i) * 8;
          const sy = 110 + ((rnd(1622, i) * 360 + f * (1.6 + rnd(1623, i) * 1.6)) % 360);
          return <circle key={i} cx={sx} cy={sy} r={3 + rnd(1624, i) * 3.5} fill={C.snow} />;
        })}
      </g>
      <rect x={1410} y={110} width={380} height={360} fill="none" stroke={C.ink} strokeWidth={7} />
      <line x1={1600} y1={110} x2={1600} y2={470} stroke={C.ink} strokeWidth={7} />
      <line x1={1410} y1={290} x2={1790} y2={290} stroke={C.ink} strokeWidth={7} />
      <rect x={1390} y={466} width={420} height={22} fill={C.wood} stroke={C.ink} strokeWidth={5} />
      <path d="M 1416 466 q 30 -16 70 -6 q 30 -12 60 2 L 1546 466 Z" fill={C.snow} stroke={C.ink} strokeWidth={3} />
      <path d={`M 1350 80 L 1440 80 Q ${1426 + Math.sin(f / 15) * 6} 300 1430 540 L 1356 540 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
      <path d={`M 1760 80 L 1850 80 L 1846 540 L 1772 540 Q ${1776 + Math.sin(f / 15) * 6} 300 1760 80 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
      <rect x={1330} y={66} width={540} height={16} rx={8} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
      {/* 壁の家族写真と時計 */}
      <rect x={600} y={140} width={150} height={120} rx={4} fill={C.woodDark} stroke={C.ink} strokeWidth={5} transform="rotate(-3 675 200)" />
      <rect x={614} y={154} width={122} height={92} fill={C.sky} transform="rotate(-3 675 200)" />
      <circle cx={652} cy={196} r={16} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
      <circle cx={700} cy={202} r={12} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
      <g transform="translate(1050 200)">
        <circle r={52} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-40} x2={0} y2={-46} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
        <line x1={0} y1={0} x2={0} y2={-26} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform="rotate(270)" />
        <line x1={0} y1={0} x2={0} y2={-38} stroke={C.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${f * 2})`} />
      </g>
      {/* フロアランプ */}
      <rect x={1330} y={230} width={12} height={556} fill={C.woodDark} stroke={C.ink} strokeWidth={3.5} />
      <ellipse cx={1336} cy={786} rx={44} ry={10} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
      <circle cx={1336} cy={250} r={120} fill={C.warmGlow} opacity={0.35 + Math.sin(f / 9) * 0.03} />
      <path d="M 1276 270 L 1396 270 L 1370 180 L 1302 180 Z" fill={C.morning} stroke={C.ink} strokeWidth={5} />
      {/* ストーブの光 */}
      <ellipse cx={210} cy={640} rx={420} ry={360} fill={`url(#${id}stove)`} opacity={flick} />
      {/* 石油ストーブ */}
      <rect x={120} y={520} width={180} height={300} rx={26} fill={C.stoveBody} stroke={C.ink} strokeWidth={6} />
      <ellipse cx={210} cy={522} rx={96} ry={18} fill={KRP.silver} stroke={C.ink} strokeWidth={5} />
      <rect x={146} y={588} width={128} height={180} rx={14} fill={C.flame} opacity={flick} stroke={C.ink} strokeWidth={5} />
      <rect x={192} y={600} width={36} height={156} rx={10} fill={KRP.yellow} opacity={flick} />
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={152 + i * 19} y1={590} x2={152 + i * 19} y2={766} stroke={C.ink} strokeWidth={3} />)}
      <circle cx={210} cy={796} r={10} fill={C.ink} />
      {/* やかん */}
      <ellipse cx={210} cy={482} rx={66} ry={40} fill={YP.brass} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={210} cy={448} rx={24} ry={8} fill={YP.brassDark} stroke={C.ink} strokeWidth={4} />
      <path d="M 158 456 Q 210 384 262 456" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <path d="M 268 474 L 320 436 L 328 448 L 276 494 Z" fill={YP.brass} stroke={C.ink} strokeWidth={4.5} />
      {[0, 1, 2].map((k) => {
        const tt = ((f + k * 9) % 27) / 27;
        return <circle key={k} cx={330 + tt * 40 + Math.sin(f / 4 + k) * 6} cy={430 - tt * 120} r={10 + tt * 20} fill={KRP.white} opacity={0.75 * (1 - tt)} />;
      })}
      {/* サイドテーブルと湯気のマグ */}
      <rect x={340} y={640} width={140} height={16} rx={4} fill={C.wood} stroke={C.ink} strokeWidth={4.5} />
      <line x1={356} y1={656} x2={356} y2={800} stroke={C.ink} strokeWidth={8} />
      <line x1={464} y1={656} x2={464} y2={800} stroke={C.ink} strokeWidth={8} />
      <rect x={384} y={586} width={52} height={54} rx={8} fill={KRP.red} stroke={C.ink} strokeWidth={4.5} />
      <path d="M 436 598 q 22 0 22 16 q 0 16 -22 16" fill="none" stroke={C.ink} strokeWidth={5} />
      {[0, 1].map((k) => (
        <path key={k} d={`M ${398 + k * 22} 576 q ${Math.sin(f / 5 + k) * 12} -24 0 -44 q ${-Math.sin(f / 5 + k) * 12} -20 0 -40`}
          fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
      ))}
      {/* ソファ (背もたれ・ひじ掛け・座面) */}
      <rect x={510} y={360} width={790} height={300} rx={60} fill={C.sofaSage} stroke={C.ink} strokeWidth={6} />
      <path d="M 905 380 L 905 600" stroke={C.sofaSageDark} strokeWidth={5} strokeDasharray="14 10" />
      <rect x={1040} y={430} width={170} height={150} rx={36} fill={C.curtain} stroke={C.ink} strokeWidth={5} transform="rotate(8 1125 505)" />
      <rect x={540} y={596} width={730} height={100} rx={28} fill={C.sofaSage} stroke={C.ink} strokeWidth={5} />
      {/* 大人 (毛布にくるまって座る) */}
      <Person x={ax} y={ay} s={as} f={f} phase={3} face="smile" pose="hold" gaze={[6, 2]}
        cloth={C.knit} clothDark={C.knitDark} hair="cap" lean={-2} />
      <rect x={520} y={690} width={770} height={110} rx={20} fill={C.sofaSageDark} stroke={C.ink} strokeWidth={6} />
      <rect x={470} y={500} width={110} height={300} rx={40} fill={C.sofaSage} stroke={C.ink} strokeWidth={6} />
      <rect x={1240} y={500} width={110} height={300} rx={40} fill={C.sofaSage} stroke={C.ink} strokeWidth={6} />
      {[540, 1270].map((lx) => <rect key={lx} x={lx} y={800} width={24} height={20} fill={C.woodDark} stroke={C.ink} strokeWidth={3} />)}
      {/* 大きな毛布 (チェック柄・ふさ) */}
      <g transform={`translate(0 ${ab * 0.6})`}>
        <path d={throwD} fill={C.throwRed} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <g clipPath={`url(#${id}throw)`}>
          {[612, 672, 732, 792].map((yy) => <rect key={yy} x={600} y={yy} width={440} height={16} fill={C.throwDark} opacity={0.55} />)}
          {[700, 780, 860, 940].map((xx) => <rect key={xx} x={xx} y={520} width={16} height={320} fill={C.throwDark} opacity={0.55} />)}
          {[640, 760].map((yy) => <line key={yy} x1={600} y1={yy} x2={1040} y2={yy} stroke={KRP.cream} strokeWidth={3} opacity={0.7} />)}
        </g>
        <path d="M 690 556 Q 770 600 812 600 Q 836 690 806 812" fill="none" stroke={C.ink} strokeWidth={5} />
        <path d="M 950 556 Q 900 604 846 604" fill="none" stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1={656 + i * 16} y1={812} x2={654 + i * 16 + Math.sin(f / 6 + i) * 3} y2={832} stroke={C.throwDark} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* 毛布のふちをつかむ手 */}
        <circle cx={808} cy={640} r={13} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
        <circle cx={842} cy={648} r={13} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
      </g>
      {children}
      {/* 子ども (くまのぬいぐるみに頬ずり) */}
      <ellipse cx={kx} cy={ky + 4} rx={70} ry={12} fill={C.rugDark} opacity={0.5} />
      <Person x={kx} y={ky} s={ks} f={f} phase={9} hair="cap" cloth={C.onesie} clothDark={KRP.blueDeep}
        pose="hold" face="joy" lean={rub} />
      <g transform={`rotate(${rub} ${kx} ${ky})`}>
        <L4bBear x={kx + 40} y={ky - 92} s={0.56} rot={-10} />
        <circle cx={kx + 22} cy={ky - 186} r={9} fill={C.babyCheek} opacity={0.8} />
        {[-1, 1].map((k) => (
          <path key={k} d={`M ${kx + 70} ${ky - 200 + k * 18} q 14 ${k * 4} 24 ${k * 12}`} fill="none" stroke={KRP.red} strokeWidth={4} strokeLinecap="round" opacity={seg(f, 6, 10)} />
        ))}
      </g>
      {[0, 1, 2].map((k) => {
        const tt = ((f + k * 12) % 36) / 36;
        return <L4bHeart key={k} x={kx + 100 + Math.sin(f / 5 + k * 2) * 12} y={ky - 230 - tt * 130} s={0.9 + tt * 0.4} op={Math.sin(Math.PI * tt) * seg(f, 6, 12)} />;
      })}
    </g>
  );
};

// ---- 文#162 【山】 毛布にくるまったり、ぬいぐるみに頬ずりしたり。
// 設計: 冬の夜のリビング。大人の Person が毛布にくるまってソファで温まり、隣で子どもがくまのぬいぐるみに頬ずり。ストーブ、湯気のマグ、窓の雪
// どこ: 冬の夜のリビング。縦じまの壁紙・家族写真・時計。左に石油ストーブ (やかんの湯気)・湯気のマグ、右に雪の降る窓とフロアランプ。中央にセージ色のソファ (#152〜#153 と同じ色)。
// 演出: 大人はチェックの大きな毛布にくるまり、ふちを両手でつかんで、隣の子どもを見てにっこり。子どもは #155 と同じくたくたのくまに頬ずり (体ごと左右にすりすり・ハートが浮かぶ)。
// 動き: 頬ずりは f4〜 から左右にゆれる。雪が降り、やかんとマグの湯気が上がり、ストーブの火がゆらぐ。カメラはゆっくり寄る。
const Yw162: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={3162} bg={C.wallWarm}>
      <g transform={cam(900, 560, zoom)}>
        <L4bLivingNight f={f} id="l4b162" />
      </g>
    </Frame>
  );
};

// ---- 文#163 【並】 柔らかいものに包まれると落ち着くのは、体のしくみから見ても、筋が通っているのです。
// 設計: #162 と同じ部屋に寄る (続き)。毛布の中の人の肌の下で、神経の光が f でやさしく灯る (#159 と同じ黄色の線)。安心の顔
// どこ: #162 と同じリビング・同じ夜 (続き)。カメラが毛布にくるまった大人の胸元まで寄る。右端に頬ずりを続ける子ども。
// 演出: 毛布ごしに、肩から腕へ走る神経 (#159 と同じ黄色の線) が透けて見え、首もとから順にやさしく灯る。体のまわりに温かい光がふくらみ、ほっぺが赤らみ、ふうっと息がもれる。
// 動き: f6〜26 神経が上から下へ灯り、光の粒が流れる。f10〜 体のまわりの光が呼吸のようにふくらむ。カメラは 1.9→2.0 倍へ寄る。
const Yw163: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1.9, 2.0, easeInOut(seg(f, 0, 42)));
  const L = easeInOut(seg(f, 6, 26));
  const aura = seg(f, 10, 24) * (0.8 + Math.sin(f / 7) * 0.2);
  const ab = pBob(f, 3) * 0.6;
  const nerves = [
    "M 800 566 Q 742 570 714 600 Q 694 630 690 712",
    "M 840 566 Q 898 570 926 600 Q 946 630 950 712",
    "M 820 572 Q 812 620 820 700",
    "M 714 600 Q 670 620 660 680", "M 926 600 Q 970 620 980 680",
    "M 700 650 q -24 10 -30 30", "M 946 650 q 24 10 30 30",
    "M 760 586 q -8 30 -30 44", "M 880 586 q 8 30 30 44",
  ];
  return (
    <Frame f={f} seed={3163} bg={C.wallWarm}>
      <g transform={camAt(820, 610, zoom)}>
        <L4bLivingNight f={f} id="l4b163">
          {/* 体のまわりの温かい光 */}
          <ellipse cx={820} cy={640} rx={250} ry={220} fill={YP.glow} opacity={0.2 * aura} />
          <ellipse cx={820} cy={650} rx={190} ry={170} fill={YP.glowCore} opacity={0.18 * aura} />
          <g transform={`translate(0 ${ab})`}>
            {/* 毛布ごしに透ける肌の線 */}
            <path d="M 700 600 Q 690 650 690 712 M 940 600 Q 950 650 950 712" fill="none" stroke={C.skin} strokeWidth={22} strokeLinecap="round" opacity={0.35 * L} />
            {nerves.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke={C.nerveDim} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
                <path d={d} fill="none" stroke={YP.glow} strokeWidth={9} strokeLinecap="round" opacity={0.6 * clamp01(L * 1.6 - i * 0.08)} />
                <path d={d} fill="none" stroke={YP.glowCore} strokeWidth={3} strokeLinecap="round" opacity={clamp01(L * 1.6 - i * 0.08)} />
                {i < 3 && L > 0.1 && (
                  <path d={d} fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round"
                    strokeDasharray="14 140" strokeDashoffset={-f * 5 - i * 40} opacity={0.9 * L} />
                )}
              </g>
            ))}
            {[[714, 600], [926, 600], [690, 712], [950, 712], [660, 680], [980, 680], [820, 700]].map(([nx, ny], i) => (
              <circle key={i} cx={nx} cy={ny} r={5 + Math.sin(f / 4 + i) * 1.5} fill={YP.glowCore} stroke={C.ink} strokeWidth={1.5} opacity={L} />
            ))}
          </g>
          {/* 安心の顔: ほっぺと、ふうっと息 */}
          <circle cx={766} cy={510 + pBob(f, 3)} r={10} fill={C.babyCheek} opacity={0.8 * seg(f, 12, 20)} />
          <circle cx={874} cy={510 + pBob(f, 3)} r={10} fill={C.babyCheek} opacity={0.8 * seg(f, 12, 20)} />
          {[0, 1].map((k) => {
            const tt = ((f + k * 15) % 30) / 30;
            return <circle key={k} cx={850 + tt * 40} cy={532 - tt * 24} r={4 + tt * 7} fill={KRP.white} stroke={C.ink} strokeWidth={1.5} opacity={(1 - tt) * seg(f, 14, 20)} />;
          })}
        </L4bLivingNight>
      </g>
      <TagPlate x={1260} y={110} text="撫でられると反応する神経" size={34} t={seg(f, 18, 26)} rot={-2} />
    </Frame>
  );
};

// ---- 文#164 【並】 では、この「抱っこの代わり」が、大量に作られるようになったのは、いつからでしょうか。
// 設計: 毛布とぬいぐるみの横に、工場の歯車の影がのびてくる。`QMark`。第9章への引き
// どこ: ソファの上 (セージ色のクッション) に、くたくたのくまと毛布の切れはしだけが置いてある。左はランプの温かい光、右の白い壁に、外からの冷たい光。
// 演出: 右の壁に、大きな歯車と煙突の影が回りながら伸びてきて、毛布のすそが風にあおられ、くまが首をかしげて影のほうを向く。壁に大きな「？」。
// 動き: f4〜30 影が右から左へ伸び、歯車の影は回り続ける。f14〜 毛布がばたつく。f20〜32 くまが傾く。f26〜34 ？が出る。カメラはゆっくり右へ。
const Yw164: React.FC<{ f: number }> = ({ f }) => {
  const sh = easeOut(seg(f, 4, 30));
  const gx1 = lerp(2350, 1660, sh);
  const gx2 = lerp(2250, 1390, sh);
  const sx = lerp(2200, 1560, sh);
  const tilt = lerp(0, 9, easeInOut(seg(f, 20, 32)));
  const wind = seg(f, 14, 30);
  const pan = lerp(20, -30, easeInOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={3164} bg={C.wallWarm}>
      <defs>
        <radialGradient id="l4b164lamp">
          <stop offset="0" stopColor={C.warmGlow} stopOpacity={0.9} />
          <stop offset="1" stopColor={C.warmGlow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cam(960, 540, 1.03, pan, 0)}>
        <rect x={-150} y={-150} width={W + 300} height={H + 300} fill={C.wallWarm} />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={-150 + i * 90} y={-150} width={30} height={900} fill={C.curtainDark} opacity={0.14} />
        ))}
        {/* 右から差す冷たい光 */}
        <polygon points="2100,-150 2100,760 1120,760 1360,-150" fill={C.sky} opacity={0.45 * sh} />
        {/* 工場の影 (煙突・歯車) */}
        <g opacity={0.34 * sh}>
          <rect x={sx} y={-150} width={110} height={420} fill={C.shadow} />
          <rect x={sx - 14} y={250} width={138} height={30} fill={C.shadow} />
          {[0, 1, 2].map((k) => {
            const tt = ((f + k * 14) % 42) / 42;
            return <circle key={k} cx={sx + 40 - tt * 160} cy={-60 - tt * 60} r={40 + tt * 50} fill={C.shadow} opacity={1 - tt} />;
          })}
          <L4bGear x={gx1} y={330} r={250} teeth={12} rot={f * 1.4} fill={C.shadow} shadow />
          <L4bGear x={gx2} y={590} r={150} teeth={9} rot={-f * 2.3 + 10} fill={C.shadow} shadow />
          <rect x={gx2 - 10} y={590} width={20} height={300} fill={C.shadow} />
        </g>
        {/* 左のランプの光 */}
        <circle cx={200} cy={380} r={480} fill="url(#l4b164lamp)" opacity={0.9 + Math.sin(f / 6) * 0.05} />
        <path d="M 120 300 L 280 300 L 250 200 L 150 200 Z" fill={C.morning} stroke={C.ink} strokeWidth={5} />
        <rect x={194} y={300} width={12} height={160} fill={C.woodDark} stroke={C.ink} strokeWidth={3.5} />
        {/* ソファの背もたれと座面 */}
        <rect x={-150} y={200} width={1330} height={520} rx={90} fill={C.sofaSageDark} stroke={C.ink} strokeWidth={7} />
        <path d="M 520 230 L 520 650" stroke={C.sofaSage} strokeWidth={6} strokeDasharray="16 12" />
        <path d="M -150 660 Q 900 600 2070 670 L 2070 1250 L -150 1250 Z" fill={C.sofaSage} stroke={C.ink} strokeWidth={7} />
        <path d="M -150 700 Q 900 644 2070 712" fill="none" stroke={C.sofaSageDark} strokeWidth={5} strokeDasharray="16 12" />
        {/* 毛布の切れはし (風にあおられる) */}
        <L4bBlanket x={930} y={700} s={1.5} rot={-80} wave={0.15 + Math.sin(f / 3) * 0.6 * wind} len={1.05} />
        {/* くま (首をかしげて影を見る) */}
        <ellipse cx={600} cy={826} rx={130} ry={20} fill={C.ink} opacity={0.18} />
        <L4bBear x={600} y={822} s={2.2} rot={tilt} />
        <TagPlate x={620} y={180} text="抱っこの代わり" size={40} t={seg(f, 8, 16)} rot={-3} />
        <QMark x={1330} y={360} s={1.9} f={f} t={seg(f, 26, 34)} />
      </g>
    </Frame>
  );
};

// ---- 作業帽 (Person の頭にかぶせる)。x,y,s は Person と同じ
const L4bWorkCap: React.FC<{ x: number; y: number; s: number; f: number; phase: number; lean?: number }> = ({ x, y, s, f, phase, lean = 0 }) => (
  <g transform={`translate(${x} ${y + pBob(f, phase)}) scale(${s}) rotate(${lean})`}>
    <path d="M -68 -244 Q -64 -304 0 -306 Q 64 -304 68 -244 Z" fill={C.workDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 22 -248 Q 84 -254 102 -238 Q 70 -228 22 -236 Z" fill={C.workDark} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <line x1={-60} y1={-262} x2={60} y2={-262} stroke={C.ink} strokeWidth={3} opacity={0.5} />
  </g>
);

// ---- 流れてくる柔らかい品物。原点は底の中央
const L4bGoods: React.FC<{ kind: number; x: number; y: number; f: number }> = ({ kind, x, y, f }) => {
  const jig = Math.sin(f / 3 + x / 50) * 2;
  if (kind === 0 || kind === 4) {
    const col = kind === 0 ? C.throwRed : C.blanket;
    return (
      <g transform={`translate(${x} ${y + jig * 0.3})`}>
        <path d="M -78 -6 Q -86 -60 -74 -112 Q 0 -100 74 -112 Q 86 -60 78 -6 Q 0 4 -78 -6 Z" fill={col} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={0} cy={-56} r={8} fill={C.ink} />
        <path d="M -40 -80 Q 0 -56 40 -80 M -40 -30 Q 0 -56 40 -30" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.4} />
        {[[-80, -6], [80, -6], [-76, -112], [76, -112]].map(([tx, ty], i) => (
          <circle key={i} cx={tx} cy={ty} r={7} fill={KRP.yellow} stroke={C.ink} strokeWidth={3} />
        ))}
      </g>
    );
  }
  if (kind === 1) return <L4bBear x={x} y={y} s={0.66} rot={jig} fresh />;
  if (kind === 2) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M -100 -4 Q -112 -44 -96 -78 Q 0 -68 96 -78 Q 112 -44 100 -4 Q 0 6 -100 -4 Z" fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -84 -40 Q 0 -30 84 -40" fill="none" stroke={KRP.gray} strokeWidth={3} strokeDasharray="8 8" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2].map((k) => (
        <rect key={k} x={-84 + k * 3} y={-34 - k * 32} width={168} height={32} rx={12}
          fill={k === 1 ? C.blanketEdge : C.blanket} stroke={C.ink} strokeWidth={4.5} />
      ))}
      <path d="M -60 -50 L 60 -50" stroke={C.blanketDark} strokeWidth={3} />
    </g>
  );
};

// ---- 文#165 【山】 第9章、柔らかさは、大量生産される。
// 設計: 章扉。20世紀の工場の中。ベルトコンベアの上を、クッション・ぬいぐるみ・枕が次々と流れていく。煙突、歯車、ライト。`ChapterDoor` (num=9)
// どこ: 20世紀の工場の中。れんがの壁、のこぎり屋根の高窓 (外に煙突と煙)、吊りランプの光の円錐。左に大きな詰め物の機械 (ホッパーに綿・歯車・メーター)。床はコンクリート。
// 演出: 機械の口から、クッション・くま・枕・たたんだ毛布が次々に出てきて、長いベルトコンベアで右へ流れる。作業帽の工員が機械の前で、流れを指さして得意げ。壁に年代札「20世紀」。題字は右下のクリームの帯。
// 動き: ベルトと品物は毎フレーム右へ (8px/f)。歯車・ローラーが回り、メーターの針がふれ、ホッパーの綿が弾む。煙が流れる。f4〜20 題字。カメラはゆっくり寄る。
const Yw165: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const zoom = lerp(1.0, 1.04, easeInOut(seg(f, 0, 42)));
  const beltY = 500;
  return (
    <Frame f={f} seed={3165} bg={C.factory}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={9} title="柔らかさは、大量生産される" t={door} left={1000} top={560} />
      </>}>
      <g transform={cam(500, 450, zoom)}>
        {/* れんがの壁 */}
        <rect x={-150} y={-150} width={W + 300} height={1000} fill={C.factory} />
        {Array.from({ length: 22 }, (_, r) => (
          <g key={r}>
            <line x1={-150} y1={170 + r * 32} x2={W + 150} y2={170 + r * 32} stroke={C.brickLine} strokeWidth={2.5} opacity={0.6} />
            {Array.from({ length: 22 }, (_, c) => (
              <line key={c} x1={-150 + c * 100 + (r % 2) * 50} y1={170 + r * 32} x2={-150 + c * 100 + (r % 2) * 50} y2={202 + r * 32} stroke={C.brickLine} strokeWidth={2.5} opacity={0.6} />
            ))}
          </g>
        ))}
        {/* のこぎり屋根の高窓と、外の煙突 */}
        {Array.from({ length: 7 }, (_, i) => {
          const wx = -120 + i * 330;
          return (
            <g key={i}>
              <polygon points={`${wx},170 ${wx + 300},170 ${wx + 300},20 ${wx},100`} fill={C.glass} stroke={C.ink} strokeWidth={6} />
              {i % 2 === 0 && (
                <g>
                  <rect x={wx + 170} y={60} width={50} height={110} fill={C.brickLine} stroke={C.ink} strokeWidth={3.5} />
                  {[0, 1].map((k) => {
                    const tt = ((f + k * 18 + i * 5) % 36) / 36;
                    return <circle key={k} cx={wx + 195 - tt * 90} cy={52 - tt * 30} r={16 + tt * 18} fill={KRP.gray} opacity={0.8 * (1 - tt)} />;
                  })}
                </g>
              )}
              <line x1={wx + 150} y1={170} x2={wx + 150} y2={58} stroke={C.ink} strokeWidth={4} />
            </g>
          );
        })}
        <rect x={-150} y={164} width={W + 300} height={18} fill={C.factoryDark} stroke={C.ink} strokeWidth={4} />
        {/* 吊りランプと光の円錐 */}
        {[760, 1240, 1720].map((lx, i) => (
          <g key={lx}>
            <polygon points={`${lx - 40},250 ${lx + 40},250 ${lx + 260},800 ${lx - 260},800`} fill={KRP.yellow} opacity={0.12 + Math.sin(f / 5 + i) * 0.02} />
            <line x1={lx} y1={182} x2={lx} y2={220} stroke={C.ink} strokeWidth={4} />
            <path d={`M ${lx - 56} 254 L ${lx - 20} 216 L ${lx + 20} 216 L ${lx + 56} 254 Z`} fill={C.machineDark} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={lx} cy={256} rx={22} ry={10} fill={KRP.yellow} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 年代札 */}
        <TagPlate x={900} y={330} text="20世紀" size={36} t={seg(f, 8, 16)} rot={-3} />
        {/* 床 */}
        <rect x={-150} y={800} width={W + 300} height={400} fill={C.concrete} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={-150 + i * 240} y1={800} x2={-300 + i * 240} y2={1100} stroke={C.concreteDark} strokeWidth={4} />
        ))}
        {/* ベルトコンベア: 脚・ローラー・ベルト */}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={620 + i * 270} y={560} width={22} height={240} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />
        ))}
        <rect x={500} y={beltY + 34} width={1520} height={44} fill={C.steel} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 17 }, (_, i) => (
          <g key={i} transform={`translate(${540 + i * 90} ${beltY + 56}) rotate(${f * 8})`}>
            <circle r={18} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />
            <line x1={-12} y1={0} x2={12} y2={0} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        <rect x={500} y={beltY} width={1520} height={34} rx={8} fill={C.rubber} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 26 }, (_, k) => {
          const mx = 500 + ((k * 60 + f * 8) % 1560);
          return <line key={k} x1={mx} y1={beltY + 6} x2={mx} y2={beltY + 28} stroke={C.concreteDark} strokeWidth={4} />;
        })}
        {/* 流れる品物 */}
        {Array.from({ length: 7 }, (_, i) => {
          const gx = 540 + ((i * 232 + f * 8) % 1624);
          if (gx > 2000) return null;
          return <L4bGoods key={i} kind={i % 5} x={gx} y={beltY} f={f} />;
        })}
        {/* 左の詰め物の機械 */}
        <path d="M 120 100 L 460 100 L 400 204 L 180 204 Z" fill={C.machineDark} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <L4bFoam blobs={[[200, 96 + Math.sin(f / 3) * 4, 30], [250, 84 + Math.sin(f / 3 + 1) * 5, 36], [310, 90 + Math.sin(f / 3 + 2) * 4, 32], [370, 86 + Math.sin(f / 3 + 3) * 5, 34], [420, 98, 24]]} fill={KRP.white} />
        <rect x={60} y={200} width={460} height={600} rx={16} fill={C.machine} stroke={C.ink} strokeWidth={7} />
        <rect x={84} y={560} width={412} height={200} rx={10} fill={C.machineDark} stroke={C.ink} strokeWidth={5} />
        {[[84, 224], [496, 224], [84, 780], [496, 780]].map(([rx2, ry2], i) => <circle key={i} cx={rx2} cy={ry2} r={7} fill={C.steel} stroke={C.ink} strokeWidth={3} />)}
        <g transform="translate(170 300)">
          <circle r={48} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          {[-60, -30, 0, 30, 60].map((a) => <line key={a} x1={0} y1={-34} x2={0} y2={-42} stroke={C.ink} strokeWidth={4} transform={`rotate(${a})`} />)}
          <line x1={0} y1={0} x2={0} y2={-36} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" transform={`rotate(${Math.sin(f / 4) * 40})`} />
          <circle r={7} fill={C.ink} />
        </g>
        <L4bGear x={410} y={320} r={72} teeth={10} rot={f * 3} fill={YP.brass} />
        <L4bGear x={318} y={420} r={48} teeth={7} rot={-f * 4.6 + 12} fill={YP.brassDark} />
        <rect x={470} y={398} width={110} height={104} rx={10} fill={C.machineDark} stroke={C.ink} strokeWidth={6} />
        <rect x={520} y={414} width={60} height={86} fill={C.ink} />
        {/* 工員 (作業帽・流れを指さす) */}
        <Person x={280} y={840} s={1.1} f={f} phase={4} face="joy" pose="point" pointDir={1}
          cloth={C.work} clothDark={C.workDark} hair="cap" />
        <L4bWorkCap x={280} y={840} s={1.1} f={f} phase={4} />
      </g>
    </Frame>
  );
};

// ---- 文#166 【山】 20世紀に入ると、柔らかさは、工場で作られるようになります。
// 設計: 工場の機械に寄る。大きな釜から白い泡 (ウレタンフォーム) がもこもこあふれ、切断機で四角いクッションに切られていく (f で)。作業服の工員
// どこ: 工場の機械の前 (寄り)。鉄板の壁とリベット、天井の配管とバルブ (湯気)、「安全第一」の標識。中央左にステンレスの大きな釜 (上にかくはんモーター)、右へコンベアと切断機。
// 演出: 釜からウレタンの白い泡がもこもこ盛り上がってあふれ、コンベアへ流れ出して長い板になる。切断機の刃がストンと落ちて、四角いクッションに切り分けられ、右へ流れていく。左の工員はあふれる泡にびっくりしてバンザイ。
// 動き: f2〜24 泡がふくらむ。f10〜22 泡がふちからあふれ出る。刃は f26〜30 で落ち、f30〜36 で上がり、f40〜42 でまた落ちる (f45 は切った瞬間)。切れたクッションは右へ。カメラは釜へ寄る。
const Yw166: React.FC<{ f: number }> = ({ f }) => {
  const rise = easeOut(seg(f, 2, 24));
  const pour = seg(f, 10, 22);
  const bladeT = f < 26 ? 0 : f < 30 ? seg(f, 26, 30) : f < 36 ? 1 - seg(f, 30, 36) : f < 40 ? 0 : seg(f, 40, 42);
  const bb = lerp(470, 642, easeInOut(bladeT));
  const zoom = lerp(1.02, 1.08, easeInOut(seg(f, 0, 42)));
  const surprised = f >= 12;
  const beltY = 640;
  const heap: number[][] = [];
  for (let k = 0; k < 14; k++) heap.push([300 + k * 34, 372 - rnd(1661, k) * 16 + Math.sin(f / 4 + k) * 3, (28 + rnd(1662, k) * 14) * (0.5 + 0.5 * rise)]);
  for (let k = 0; k < 10; k++) heap.push([336 + k * 40, 360 - 46 * rise - rnd(1663, k) * 26 + Math.sin(f / 5 + k) * 3, (24 + rnd(1664, k) * 14) * rise]);
  for (let k = 0; k < 6; k++) heap.push([400 + k * 42, 352 - 100 * rise - rnd(1665, k) * 20 + Math.sin(f / 4.5 + k) * 3, (22 + rnd(1666, k) * 12) * rise]);
  const poured: number[][] = [];
  for (let k = 0; k < 9; k++) {
    const t = k / 8;
    if (t > pour) continue;
    const px = (1 - t) * (1 - t) * 740 + 2 * t * (1 - t) * 850 + t * t * 830;
    const py = (1 - t) * (1 - t) * 370 + 2 * t * (1 - t) * 380 + t * t * 590;
    poured.push([px, py, 30 - k * 0.6 + Math.sin(f / 3 + k) * 2]);
  }
  const slabTop: number[][] = [];
  for (let k = 0; k < 15; k++) slabTop.push([800 + ((k * 32 + f * 3) % 440), 540 + Math.sin(k * 1.7) * 4, 20 + rnd(1667, k) * 8]);
  return (
    <Frame f={f} seed={3166} bg={C.steel}>
      <g transform={cam(700, 500, zoom)}>
        {/* 鉄板の壁 */}
        <rect x={-150} y={-150} width={W + 300} height={1000} fill={C.steel} />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <rect x={-150 + i * 260} y={140} width={260} height={700} fill="none" stroke={C.steelDark} strokeWidth={5} />
            {[160, 420, 680].map((ry) => (
              <g key={ry}>
                <circle cx={-130 + i * 260} cy={ry} r={6} fill={C.steelDark} />
                <circle cx={90 + i * 260} cy={ry} r={6} fill={C.steelDark} />
              </g>
            ))}
          </g>
        ))}
        {/* 天井の配管・バルブ・湯気 */}
        <rect x={-150} y={70} width={W + 300} height={44} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
        {[300, 900, 1500].map((jx) => <rect key={jx} x={jx} y={62} width={30} height={60} rx={6} fill={C.steel} stroke={C.ink} strokeWidth={4} />)}
        <g transform={`translate(1560 92) rotate(${f * 4})`}>
          <circle r={34} fill="none" stroke={KRP.red} strokeWidth={9} />
          <line x1={-34} y1={0} x2={34} y2={0} stroke={KRP.red} strokeWidth={7} />
          <line x1={0} y1={-34} x2={0} y2={34} stroke={KRP.red} strokeWidth={7} />
        </g>
        {[0, 1, 2].map((k) => {
          const tt = ((f + k * 10) % 30) / 30;
          return <circle key={k} cx={1640 + tt * 60} cy={130 + tt * 40} r={14 + tt * 26} fill={KRP.white} opacity={0.7 * (1 - tt)} />;
        })}
        {/* 安全第一の標識 */}
        <g transform="translate(1660 300)">
          <rect x={-110} y={-70} width={220} height={140} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <rect x={-22} y={-54} width={44} height={70} fill={KRP.green} />
          <rect x={-46} y={-30} width={92} height={22} fill={KRP.green} />
          <text x={0} y={54} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>安全第一</text>
        </g>
        <TagPlate x={1100} y={210} text="20世紀" size={34} t={seg(f, 6, 14)} rot={2} />
        {/* 床 */}
        <rect x={-150} y={830} width={W + 300} height={400} fill={C.concrete} stroke={C.ink} strokeWidth={5} />
        {/* かくはんモーターと軸 */}
        <rect x={454} y={130} width={132} height={96} rx={12} fill={C.machine} stroke={C.ink} strokeWidth={6} />
        <rect x={470} y={150} width={100} height={20} fill={C.machineDark} />
        <rect x={510} y={226} width={20} height={150} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((k) => {
          const sy = 230 + ((k * 36 + f * 6) % 144);
          return <line key={k} x1={510} y1={sy} x2={530} y2={sy + 10} stroke={C.ink} strokeWidth={3} />;
        })}
        {/* ステンレスの釜 */}
        <line x1={330} y1={740} x2={320} y2={836} stroke={C.ink} strokeWidth={14} />
        <line x1={710} y1={740} x2={720} y2={836} stroke={C.ink} strokeWidth={14} />
        <path d="M 280 380 L 280 720 Q 520 800 760 720 L 760 380 Z" fill={C.steel} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 280 470 Q 520 506 760 470 M 280 650 Q 520 700 760 650" fill="none" stroke={C.steelDark} strokeWidth={12} />
        <path d="M 310 420 L 310 690" stroke={KRP.white} strokeWidth={10} strokeLinecap="round" opacity={0.6} />
        <g transform="translate(350 560)">
          <circle r={34} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <line x1={0} y1={0} x2={0} y2={-26} stroke={KRP.red} strokeWidth={4.5} strokeLinecap="round" transform={`rotate(${-70 + 140 * rise + Math.sin(f / 2) * 4})`} />
          <circle r={5} fill={C.ink} />
        </g>
        <ellipse cx={520} cy={380} rx={240} ry={46} fill={C.steelDark} stroke={C.ink} strokeWidth={7} />
        {/* あふれる泡 */}
        <L4bFoam blobs={[...heap, ...poured]} />
        <TagPlate x={560} y={600} text="ウレタンフォーム" size={32} t={seg(f, 10, 18)} rot={-2} />
        {/* コンベア */}
        {[900, 1200, 1500, 1800].map((lx) => <rect key={lx} x={lx} y={beltY + 30} width={22} height={170} fill={C.steelDark} stroke={C.ink} strokeWidth={4} />)}
        <rect x={760} y={beltY} width={1300} height={36} rx={8} fill={C.rubber} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i} transform={`translate(${800 + i * 90} ${beltY + 18}) rotate(${f * 6})`}>
            <circle r={12} fill={C.steelDark} stroke={C.ink} strokeWidth={3} />
            <line x1={-8} y1={0} x2={8} y2={0} stroke={C.ink} strokeWidth={2.5} />
          </g>
        ))}
        {/* 泡の板 (切断機まで) */}
        <rect x={790} y={540} width={455} height={100} fill={C.foam} stroke={C.ink} strokeWidth={5} />
        <L4bFoam blobs={slabTop.filter(([x]) => x < 1232)} />
        <rect x={792} y={552} width={450} height={86} fill={C.foam} />
        {Array.from({ length: 18 }, (_, k) => {
          const hx = 800 + ((k * 27 + f * 3) % 430);
          return <circle key={k} cx={hx} cy={566 + (k % 4) * 18} r={3 + (k % 3)} fill={C.foamShade} />;
        })}
        {/* 切れたクッション */}
        {[0, 1, 2].map((k) => {
          const px = 1350 + ((((k * 180 + (f - 45) * 3) % 540) + 540) % 540);
          return (
            <g key={k} transform={`translate(${px} ${beltY})`}>
              <rect x={0} y={-118} width={150} height={118} rx={18} fill={C.foam} stroke={C.ink} strokeWidth={5} />
              <rect x={10} y={-108} width={130} height={20} rx={10} fill={KRP.white} opacity={0.8} />
              {[[30, -60], [80, -40], [110, -76], [52, -26], [120, -30]].map(([hx, hy], i) => (
                <circle key={i} cx={hx} cy={hy} r={4} fill={C.foamShade} />
              ))}
            </g>
          );
        })}
        {/* 切断機 */}
        <rect x={1170} y={300} width={26} height={380} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1300} y={300} width={26} height={380} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1236} y={bb - 300} width={26} height={300} fill={KRP.silver} stroke={C.ink} strokeWidth={4.5} />
        <path d={`M 1236 ${bb - 30} L 1262 ${bb - 30} L 1249 ${bb} Z`} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
        <line x1={1244} y1={bb - 280} x2={1244} y2={bb - 60} stroke={KRP.white} strokeWidth={4} opacity={0.8} />
        <rect x={1150} y={250} width={196} height={70} rx={10} fill={C.machineDark} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${1160 + i * 32} 300 l 18 -40 l 14 0 l -18 40 Z`} fill={KRP.yellow} />
        ))}
        {bladeT > 0.85 && (
          <g stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round">
            {[-50, -20, 20, 50, 160, 200].map((a) => (
              <line key={a} x1={1249 + Math.cos((a * Math.PI) / 180) * 40} y1={590 + Math.sin((a * Math.PI) / 180) * 40}
                x2={1249 + Math.cos((a * Math.PI) / 180) * 80} y2={590 + Math.sin((a * Math.PI) / 180) * 80} />
            ))}
          </g>
        )}
        {/* 工員 (あふれる泡にびっくり) */}
        <Person x={178} y={870} s={1.25} f={f} phase={6} face={surprised ? "surprised" : "normal"}
          pose={surprised ? "banzai" : "stand"} gaze={[6, -4]} cloth={C.work} clothDark={C.workDark} hair="cap" />
        <L4bWorkCap x={178} y={870} s={1.25} f={f} phase={6} />
        {surprised && (
          <g stroke={KRP.red} strokeWidth={6} strokeLinecap="round" opacity={seg(f, 12, 16)}>
            <line x1={240} y1={430} x2={266} y2={400} />
            <line x1={256} y1={456} x2={292} y2={446} />
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- 文#167 【並】 まずは、体を守る柔らかさから、見ていきましょう。
// 設計: 木の看板 (分かれ道の道しるべ) の2本の矢印: 「体を守る」と「心を落ち着かせる」。「体を守る」の矢印が f で光る。★第1章の「体を守る」の札と同じ見た目の札にする
// どこ: 春の野原の分かれ道。手前から来た道が二手に分かれ、左の先には救急の病院、右の先には煙突から煙の出る家。真ん中に木の道しるべ。
// 演出: 道しるべの上の矢印 (左向き) に第1章と同じ白い木札「体を守る」(size64)、下の矢印 (右向き) に「心を落ち着かせる」。上の矢印がふわっと光り、旅の人が見上げて左を指さす。
// 動き: f14〜28 上の矢印が光り、光の粒が矢印の先へ走る。f16〜 人が左を指して笑う。雲・鳥・草がゆれる。カメラは上の矢印へ寄る。
const Yw167: React.FC<{ f: number }> = ({ f }) => {
  const L = easeInOut(seg(f, 14, 28));
  const pulse = 0.85 + Math.sin(f / 4) * 0.15;
  const zoom = lerp(1.0, 1.07, easeInOut(seg(f, 14, 42)));
  const point = f >= 16;
  return (
    <Frame f={f} seed={3167} bg={C.sky}>
      <g transform={cam(760, 300, zoom)}>
        {/* 空・雲・鳥 */}
        <rect x={-150} y={-150} width={W + 300} height={800} fill={C.sky} />
        {[[300, 120, 1], [1100, 90, 1.3], [1650, 170, 0.9]].map(([cx2, cy2, s2], i) => (
          <g key={i} transform={`translate(${cx2 + f * (0.6 + i * 0.3)} ${cy2}) scale(${s2})`}>
            <L4bFoam blobs={[[-56, 0, 32], [-14, -18, 42], [36, -12, 40], [70, 6, 28], [-20, 12, 30], [24, 14, 30]]} fill={KRP.white} />
          </g>
        ))}
        <path transform={`translate(${1300 - f * 6} ${250 + Math.sin(f / 4) * 8})`}
          d={`M -24 0 Q -12 ${-12 + Math.sin(f / 2) * 6} 0 0 Q 12 ${-12 + Math.sin(f / 2) * 6} 24 0`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        {/* 遠くの丘と行き先 */}
        <path d="M -150 560 Q 300 440 700 530 Q 1100 450 1500 520 Q 1800 470 2070 540 L 2070 700 L -150 700 Z" fill={C.hill} stroke={C.ink} strokeWidth={5} />
        <g transform="translate(250 520)">
          <rect x={-90} y={-110} width={180} height={110} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={-14} y={-96} width={28} height={70} fill={KRP.red} />
          <rect x={-35} y={-75} width={70} height={28} fill={KRP.red} />
          <rect x={-24} y={-36} width={48} height={36} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
        </g>
        <g transform="translate(1720 520)">
          <rect x={40} y={-150} width={28} height={60} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
          {[0, 1].map((k) => {
            const tt = ((f + k * 16) % 32) / 32;
            return <circle key={k} cx={54 + tt * 30} cy={-160 - tt * 60} r={10 + tt * 14} fill={KRP.white} opacity={0.85 * (1 - tt)} />;
          })}
          <path d="M -100 -80 L 0 -160 L 100 -80 Z" fill={KRP.red} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-80} y={-80} width={160} height={80} fill={C.wallWarm} stroke={C.ink} strokeWidth={5} />
          <rect x={-50} y={-62} width={40} height={34} fill={C.warmGlow} stroke={C.ink} strokeWidth={3} />
          <rect x={20} y={-50} width={32} height={50} fill={C.woodDark} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 野原と分かれ道 */}
        <rect x={-150} y={600} width={W + 300} height={600} fill={C.meadow} />
        <path d="M -150 600 Q 900 570 2070 610" fill="none" stroke={C.meadowDark} strokeWidth={5} />
        <polygon points="820,1200 1100,1200 1000,700 930,700" fill={C.path} stroke={C.ink} strokeWidth={5} />
        <polygon points="962,688 962,738 330,600 330,574" fill={C.path} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <polygon points="962,688 962,738 1620,600 1620,574" fill={C.path} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <polygon points="930,700 994,700 1010,760 916,760" fill={C.path} />
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={960 + (i - 2.5) * 30} cy={800 + i * 50} rx={14} ry={6} fill={C.pathDark} />
        ))}
        {Array.from({ length: 22 }, (_, i) => {
          const gx = rnd(1671, i) * 2000 - 40;
          const gy = 640 + rnd(1672, i) * 300;
          if (gx > 800 && gx < 1120 && gy > 700) return null;
          const sw = Math.sin(f / 7 + i) * 4;
          return (
            <path key={i} d={`M ${gx - 14} ${gy} q ${sw} -26 ${-6 + sw} -40 M ${gx} ${gy} q ${sw} -30 ${4 + sw} -50 M ${gx + 14} ${gy} q ${sw} -24 ${12 + sw} -36`}
              fill="none" stroke={C.meadowDark} strokeWidth={5} strokeLinecap="round" />
          );
        })}
        {/* 道しるべの柱 */}
        <rect x={938} y={190} width={52} height={660} rx={6} fill={YP.wood} stroke={C.ink} strokeWidth={7} />
        <path d="M 930 190 L 964 160 L 998 190 Z" fill={YP.woodDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <line x1={956} y1={240} x2={952} y2={820} stroke={YP.woodDark} strokeWidth={4} opacity={0.7} />
        {/* 上の矢印 (左向き)「体を守る」= 光る */}
        <ellipse cx={760} cy={290} rx={360} ry={130} fill={YP.glow} opacity={0.5 * L * pulse} />
        {L > 0.05 && (
          <g stroke={YP.glow} strokeWidth={8} strokeLinecap="round" opacity={L}>
            {[-160, -130, -100, -70, 70, 100, 130, 160].map((a, i) => {
              const r1 = 230, r2 = 270 + Math.sin(f / 3 + i) * 14;
              const ra = (a * Math.PI) / 180;
              return <line key={a} x1={760 + Math.cos(ra) * r1 * 1.4} y1={290 + Math.sin(ra) * r1 * 0.55} x2={760 + Math.cos(ra) * r2 * 1.4} y2={290 + Math.sin(ra) * r2 * 0.55} />;
            })}
          </g>
        )}
                <polygon points="1010,220 560,220 486,290 560,360 1010,360" fill={YP.wood} stroke={L > 0.05 ? YP.brassDark : C.ink} strokeWidth={7} strokeLinejoin="round" />
        <polygon points="1010,220 560,220 486,290 560,360 1010,360" fill={YP.glowCore} opacity={0.45 * L} />
        <path d="M 580 246 L 990 244 M 590 336 L 990 338" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
        {[[580, 290], [990, 290]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={7} fill={C.ink} />)}
        <TagPlate x={770} y={290} text="体を守る" size={64} t={seg(f, 2, 10)} />
        {L > 0.1 && (() => {
          const tt = ((f - 14) % 16) / 16;
          return <circle cx={lerp(960, 510, tt)} cy={290} r={12} fill={YP.glowCore} stroke={C.ink} strokeWidth={2.5} opacity={L * (1 - tt * 0.4)} />;
        })()}
        {/* 下の矢印 (右向き)「心を落ち着かせる」 */}
        <polygon points="920,400 1450,400 1516,456 1450,512 920,512" fill={YP.wood} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 940 424 L 1430 422 M 940 490 L 1430 492" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
        <TagPlate x={1190} y={456} text="心を落ち着かせる" size={48} t={seg(f, 4, 12)} />
        <polygon points="920,400 1450,400 1516,456 1450,512 920,512" fill={C.ink} opacity={0.12 * L} />
        {/* 旅の人 (見上げて左を指さす) */}
        <Person x={1580} y={880} s={1.2} f={f} phase={5} face={point ? "joy" : "normal"} gaze={[-6, -6]}
          pose={point ? "point" : "stand"} pointDir={-1} cloth={C.knit} clothDark={C.knitDark} hair="cap" />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_158: (f) => <Yw158 f={f} />,
  yw_159: (f) => <Yw159 f={f} />,
  yw_160: (f) => <Yw160 f={f} />,
  yw_161: (f) => <Yw161 f={f} />,
  yw_162: (f) => <Yw162 f={f} />,
  yw_163: (f) => <Yw163 f={f} />,
  yw_164: (f) => <Yw164 f={f} />,
  yw_165: (f) => <Yw165 f={f} />,
  yw_166: (f) => <Yw166 f={f} />,
  yw_167: (f) => <Yw167 f={f} />,
};

export const YW_F2_MOTIFS: string[] = [
  "yw_158",
  "yw_159",
  "yw_160",
  "yw_161",
  "yw_162",
  "yw_163",
  "yw_164",
  "yw_165",
  "yw_166",
  "yw_167",
];

export const yawaF2Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
