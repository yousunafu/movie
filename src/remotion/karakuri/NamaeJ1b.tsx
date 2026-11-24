// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#234〜#244 (11文)
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
  // 映写機の部屋 (第8章: 落ち着いた色)
  wall: "#3A3440", wallDark: "#2A2530", wallLine: "#4A4352",
  wains: "#5A4434", wainsDark: "#45342A",
  screen: "#EDE6D2", screenDim: "#C9C0AA", beam: "#FFF1C8",
  seat: "#231F27", seatTop: "#3A2E2E",
  frameWood: "#7A5A3C", frameDark: "#5A4029",
  board: "#E3CDA0", boardDark: "#C6A974", boardGrain: "#B8975F",
  inkRed: "#C8402F", inkPad: "#8E2A20",
  dollCloth: "#C9B79A", dollDark: "#A8967A",
  fog: "#E8E6E0", fogDark: "#BDB9B0",
  tape: "#E9C540", tapeDark: "#B89A22",
  shelf: "#8A6A48", shelfDark: "#6A4E34",
  jar: "#B9C9C4", box: "#C9A27A",
  // 科学の棚と物語の本
  sciWall: "#E6EEF2", sciShelf: "#B9C6CE", sciShelfDark: "#8E9EA8", glass: "#CFE6EE",
  story: "#F3C98A", storyDeep: "#E39A55", page: "#FBF3E0", pageShade: "#E8D9B8",
  cover: "#8A3B2E", coverDark: "#66291F",
  forest: "#5E9A5A", forestDark: "#3F7340", roof: "#C0573F", roofB: "#4E6E9A", houseW: "#F2E3C6",
  // お妃の部屋
  fire: "#F29A3A", fireCore: "#FFD66B", brick: "#9A5A40", brickDark: "#7A4430",
  queen: "#7A4E9A", queenDark: "#5A3676", crown: "#E3B53A", blanket: "#F4E6C8", straw: "#E7C36A",
  smoke: "#B9B2A8",
  // 夕暮れの道
  skyTop: "#5E5A8E", skyMid: "#C7708A", skyLow: "#F2A55E", sun: "#FFD27A",
  field: "#7C8A4E", fieldDark: "#5E6B3A", road: "#B9A27E", roadDark: "#97805E",
  hill: "#6A5A7A", townLit: "#FFE08A", pole: "#3E3440",
  // 朝の玄関
  genkanWall: "#F4ECDC", genkanTile: "#BFB5A6", genkanTileDark: "#A39888", kamachi: "#C99A62",
  door: "#8A6A4E", doorDark: "#6A4E36", doorGlass: "#E4EEF0", morning: "#FFF4D6",
  shoeBox: "#D9B98A", shoeBoxDark: "#B8976A", strap: "#3F6FB0", card: "#FFFFFF", plant: "#6FA35E",
  // 町の空撮
  ground: "#CFD8B4", groundDark: "#B5C095", roadTop: "#E6E0D0", river: "#9CC4DC", tree: "#6FA35E", treeDark: "#4F8344",
  bldg: "#AFC0D0", bldgDark: "#8496AA", gold: "#E8B23A", goldCore: "#FFE9A6",
  // 夜の部屋
  night: "#2B2A3A", nightWall: "#3A3A52", nightFloor: "#4A4458", tvGlow: "#9FD0F0", kitchen: "#FFD9A0",
  sofa: "#6A5A8A", sofaDark: "#51446E", hoodie: "#E59A6B", hoodieDark: "#C27A50",
  room: "#F6E9D2", roomFloor: "#DCC39A", lamp: "#FFE3A0",
  skin: "#F2D2B6",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void QuizQ; void Maru; void MaruBatsu;
void NP; void Nafuda; void nafudaKnot; void Ito; void ItoLegend; void Ushiro; void MeijiLock;
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

// カメラ: e=0 で (k, px, py) を見て、e=1 で素の画面 (恒等変換) に着く
const NJ1bCam = (e: number, k: number, px: number, py: number) => {
  const kk = lerp(k, 1, e);
  const x = lerp(px, 960, e);
  const y = lerp(py, 540, e);
  return `translate(960 540) scale(${kk}) translate(${-x} ${-y})`;
};

// 2次ベジェ上の点
const NJ1bQ = (a: [number, number], c: [number, number], b: [number, number], u: number): [number, number] => [
  (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
  (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
];

// 光の点線 (金色の見えない糸・光る道)。t で始点から伸びる
const NJ1bDots: React.FC<{
  a: [number, number]; c: [number, number]; b: [number, number]; t: number; n?: number; r?: number;
  color?: string; core?: string; f?: number; phase?: number; shrink?: number;
}> = ({ a, c, b, t, n = 24, r = 7, color = C.gold, core = C.goldCore, f = 0, phase = 0, shrink = 0 }) => {
  const T = clamp01(t);
  if (T <= 0) return null;
  const m = Math.max(1, Math.floor(n * T));
  return (
    <g>
      {Array.from({ length: m }, (_, i) => {
        const u = (i + 1) / n;
        const [px, py] = NJ1bQ(a, c, b, u);
        const rr = r * (1 - shrink * u) * (0.85 + 0.15 * Math.sin((f + i * 3 + phase * 7) / 5));
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={rr * 2.2} fill={core} opacity={0.28} />
            <circle cx={px} cy={py} r={rr} fill={color} stroke={KRP.ink} strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
};

// Person の頭に重ねる「後頭部」。turn 0=真後ろ / 1=顔が出る (dir=1 で右へ振り向く)
// x,y,s,f,phase は Person に渡したのと同じ値 (体ゆれをそろえる)
const NJ1bBackHead: React.FC<{
  id: string; x: number; y: number; s: number; f: number; phase?: number; turn?: number; dir?: 1 | -1;
  hair?: string; lean?: number;
}> = ({ id, x, y, s, f, phase = 0, turn = 0, dir = 1, hair = KRP.ink, lean = 0 }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  const T = clamp01(turn);
  if (T >= 0.999) return null;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <defs>
        <clipPath id={id}><circle cx={0} cy={-228} r={67} /></clipPath>
      </defs>
      {/* 耳 (振り向くと片方へ寄る) */}
      {[-1, 1].map((sd) => (
        <ellipse key={sd} cx={sd * 64 - dir * T * 40} cy={-218} rx={10} ry={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4}
          opacity={sd === dir ? 1 - T : 1} />
      ))}
      <g clipPath={`url(#${id})`}>
        <ellipse cx={-dir * 90 * T} cy={-232} rx={70 * (1 - 0.55 * T)} ry={72} fill={hair} />
        <path d={`M ${-40 - dir * 80 * T} -272 Q ${-dir * 80 * T} -292 ${40 - dir * 80 * T} -272`} stroke="#FFFFFF" strokeWidth={5} opacity={0.2} fill="none" />
      </g>
      <circle cx={0} cy={-228} r={64} fill="none" stroke={KRP.ink} strokeWidth={5.5} />
    </g>
  );
};

// 「2つの怖さ」の木の札 (吊り紐つき)
const NJ1bFearBoard: React.FC<{
  x: number; y: number; w: number; h: number; text: string; size: number; f: number; tx?: number; shake?: number;
}> = ({ x, y, w, h, text, size, f, tx = 0, shake = 0 }) => {
  const sway = Math.sin(f / 26) * 0.6 + Math.sin(f * 2.3) * shake * 1.6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sway})`}>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <line x1={sd * (w / 2 - 70)} y1={-h / 2} x2={sd * (w / 2 - 110)} y2={-h / 2 - 160} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={sd * (w / 2 - 70)} cy={-h / 2 + 18} r={9} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ))}
      <rect x={-w / 2 + 10} y={-h / 2 + 12} width={w} height={h} rx={18} fill={KRP.ink} opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={C.board} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.16} rx={12} fill={C.boardDark} opacity={0.45} />
      <g stroke={C.boardGrain} strokeWidth={3} fill="none" opacity={0.7}>
        <path d={`M ${-w / 2 + 20} ${-h * 0.2} q ${w * 0.25} -12 ${w * 0.5} 0 q ${w * 0.25} 12 ${w * 0.46} -4`} />
        <path d={`M ${-w / 2 + 30} ${h * 0.28} q ${w * 0.3} 10 ${w * 0.55} 0 q ${w * 0.2} -10 ${w * 0.4} 4`} />
      </g>
      <text x={tx} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={NP.sumi}>{text}</text>
    </g>
  );
};

// 半分だけの○ (左半分=朱の実線 / 右半分=点線)。t で朱がにじみ出る
const NJ1bHalfMaru: React.FC<{ x: number; y: number; r: number; t: number; sw?: number; full?: boolean }> = ({ x, y, r, t, sw = 22, full = false }) => {
  const T = clamp01(t);
  if (T <= 0) return null;
  const left = `M ${x} ${y - r} A ${r} ${r} 0 0 0 ${x} ${y + r}`;
  const right = `M ${x} ${y - r} A ${r} ${r} 0 0 1 ${x} ${y + r}`;
  return (
    <g opacity={0.35 + 0.6 * T}>
      <path d={`${left} Z`} fill={C.inkRed} opacity={0.08 * T} />
      <path d={left} fill="none" stroke={C.inkRed} strokeWidth={sw} strokeLinecap="round" />
      {/* 朱のかすれ (判子の質感) */}
      <path d={left} fill="none" stroke={C.board} strokeWidth={sw * 0.22} strokeDasharray={`${sw * 0.6} ${sw * 2.4}`} opacity={0.55} />
      {full ? (
        <path d={right} fill="none" stroke={C.inkRed} strokeWidth={sw} strokeLinecap="round" />
      ) : (
        <path d={right} fill="none" stroke={C.inkRed} strokeWidth={sw * 0.45} strokeDasharray={`${sw * 0.9} ${sw * 1.1}`} strokeLinecap="round" opacity={0.85} />
      )}
    </g>
  );
};

// 映写機 (木の三脚台にのった、リール2つの古い映写機)。x,y はレンズの位置
const NJ1bProjector: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const spin = f * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 三脚 */}
      <g stroke={KRP.ink} strokeWidth={6}>
        <line x1={150} y1={60} x2={60} y2={330} /><line x1={170} y1={60} x2={180} y2={340} /><line x1={190} y1={60} x2={300} y2={330} />
      </g>
      <rect x={110} y={40} width={120} height={30} rx={6} fill={C.frameDark} stroke={KRP.ink} strokeWidth={5} />
      {/* 本体 */}
      <rect x={20} y={-60} width={260} height={110} rx={18} fill="#4A4A52" stroke={KRP.ink} strokeWidth={6} />
      <rect x={40} y={-44} width={120} height={20} rx={6} fill="#6A6A74" />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={190 + i * 16} y1={-40} x2={190 + i * 16} y2={30} stroke="#33333A" strokeWidth={5} />)}
      {/* レンズ */}
      <rect x={-40} y={-30} width={70} height={50} rx={8} fill="#5A5A64" stroke={KRP.ink} strokeWidth={5} />
      <ellipse cx={-40} cy={-5} rx={12} ry={24} fill={C.beam} stroke={KRP.ink} strokeWidth={4} />
      {/* リール2つ (f で回る) */}
      {[[80, -150, 70], [220, -130, 58]].map(([rx, ry, rr], i) => (
        <g key={i} transform={`translate(${rx} ${ry}) rotate(${spin * (i ? 1.2 : 1)})`}>
          <circle r={rr} fill="#55555E" stroke={KRP.ink} strokeWidth={6} />
          <circle r={rr * 0.72} fill="none" stroke="#3A3A42" strokeWidth={10} />
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={Math.cos((k / 3) * Math.PI * 2) * rr * 0.45} cy={Math.sin((k / 3) * Math.PI * 2) * rr * 0.45} r={rr * 0.18} fill="#2E2E35" />
          ))}
          <circle r={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      <path d="M 40 -100 L 30 -60 M 250 -80 L 260 -60" stroke={KRP.ink} strokeWidth={5} />
      <path d={`M 80 -80 Q 20 -40 -10 -30`} stroke="#2A2A30" strokeWidth={4} fill="none" />
    </g>
  );
};

// 振り向く人形の小さな絵 (#236/#237 で同じ物)。x,y は人形の足元
const NJ1bTurnPic: React.FC<{ id: string; x: number; y: number; s: number; f: number; turn: number; call: number; lit: number }> = ({ id, x, y, s, f, turn, call, lit }) => (
  <g>
    {/* 灯り */}
    <ellipse cx={x} cy={y - 150 * s} rx={300 * s} ry={260 * s} fill={NP.glow} opacity={0.32 * lit} />
    <ellipse cx={x} cy={y - 120 * s} rx={170 * s} ry={160 * s} fill={NP.glowCore} opacity={0.45 * lit} />
    {/* 小さな舞台の床 */}
    <ellipse cx={x} cy={y + 4 * s} rx={150 * s} ry={22 * s} fill={C.boardDark} stroke={KRP.ink} strokeWidth={4} />
    {/* 呼ぶ声 (左から) */}
    {call > 0 && (
      <g opacity={clamp01(call * 1.4)}>
        <g transform={`translate(${x - 170 * s} ${y - 370 * s}) scale(${s * pop(clamp01(call))})`}>
          <rect x={-80} y={-46} width={160} height={92} rx={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <path d="M 30 40 L 64 74 L 4 46 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={20} y={38} width={20} height={10} fill={KRP.white} />
          <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={KRP.ink}>○○</text>
        </g>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${x - 150 * s + i * 26 * s} ${y - 250 * s} q ${18 * s} ${30 * s} 0 ${60 * s}`} stroke={C.inkRed} strokeWidth={6}
            fill="none" strokeLinecap="round" opacity={clamp01(call * 2 - i * 0.4) * (0.6 + 0.4 * Math.sin(f / 3 - i))} />
        ))}
      </g>
    )}
    <Person x={x} y={y} s={s} f={f} cloth={C.dollCloth} clothDark={C.dollDark} hair="cap"
      face={turn > 0.5 ? "surprised" : "normal"} gaze={[-8, -2]} lean={-turn * 5} phase={2} />
    <NJ1bBackHead id={id} x={x} y={y} s={s} f={f} phase={2} turn={turn} dir={-1} lean={-turn * 5} />
    {/* 頭の中でひらめく (脳が振り向く) */}
    {turn > 0.4 && (
      <g stroke={NP.brass} strokeWidth={7} strokeLinecap="round" opacity={clamp01((turn - 0.4) * 2.5)}>
        {[-60, -30, 0, 30, 60].map((a) => {
          const r0 = 90 * s, r1 = 130 * s;
          const rad = ((a - 90) * Math.PI) / 180;
          const cx = x, cy = y - 228 * s;
          return <line key={a} x1={cx + Math.cos(rad) * r0} y1={cy + Math.sin(rad) * r0} x2={cx + Math.cos(rad) * r1} y2={cy + Math.sin(rad) * r1} />;
        })}
      </g>
    )}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #234 2つ目の怖さ。名前を奪われると、元の自分を忘れてしまう。
// 格: 並 / seed 4234
// 絵: 映写機の部屋に戻り、右の窓に寄る。窓の中に序 #14 のかすれる名札。下の札「元の自分を忘れる」
// どこ: 序章と同じ映写機の部屋 (暗い壁に2つの映写の窓、下に「2つの怖さ」の木の札)
// 演出: 左の窓 (帰り道・○済み) から右の窓へパンしながら寄る。右の窓の名札の字がじわじわかすれ、残像が抜けていく
// 動き: f4-34 カメラが左の全景から右の窓へ寄る / f12-40 名札の blur 0→0.8 / リールが回り、光が明滅
const Nm234: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 4, 34));
  const blur = 0.8 * easeOut(seg(f, 12, 40));
  const flick = 0.2 + 0.05 * Math.sin(f * 1.9) + 0.03 * Math.sin(f * 4.7);
  const LX = -280; // 左の窓の中心 (素の画面では画面の外)
  return (
    <Frame f={f} seed={4234} dark bg={C.wallDark}>
      <g transform={NJ1bCam(cam, 0.5, 340, 470)}>
        {/* 壁 (広く) */}
        <rect x={-1500} y={-800} width={4000} height={2400} fill={C.wall} />
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1={-1500 + i * 190} y1={-800} x2={-1500 + i * 190} y2={820} stroke={C.wallLine} strokeWidth={6} opacity={0.6} />
        ))}
        {/* 腰板 */}
        <rect x={-1500} y={820} width={4000} height={800} fill={C.wains} />
        <rect x={-1500} y={812} width={4000} height={22} fill={C.wainsDark} stroke={KRP.ink} strokeWidth={4} />
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={-1480 + i * 140} y={860} width={110} height={170} rx={8} fill="none" stroke={C.wainsDark} strokeWidth={5} />
        ))}
        {/* 映写機の光 (右下の映写機から2つの窓へ) */}
        <polygon points={`1640,700 ${LX - 480},120 ${LX - 480},640`} fill={C.beam} opacity={flick * 0.5} />
        <polygon points="1640,700 480,110 480,640" fill={C.beam} opacity={flick} />
        {/* 2つの窓 */}
        {[LX, 960].map((cx, i) => (
          <g key={i}>
            <rect x={cx - 500} y={90} width={1000} height={570} rx={14} fill={C.frameWood} stroke={KRP.ink} strokeWidth={9} />
            <rect x={cx - 470} y={118} width={940} height={514} rx={6} fill={C.screen} stroke={KRP.ink} strokeWidth={5} />
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], k) => (
              <circle key={k} cx={cx + sx * 484} cy={375 + sy * 270} r={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 左の窓の中: 夕暮れの一本道 (済んだほう・少し暗く) */}
        <g opacity={0.8}>
          <rect x={LX - 470} y={118} width={940} height={300} fill={C.skyLow} opacity={0.55} />
          <rect x={LX - 470} y={418} width={940} height={214} fill={C.field} opacity={0.6} />
          <polygon points={`${LX - 30},418 ${LX + 30},418 ${LX + 200},632 ${LX - 200},632`} fill={C.road} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={LX - 240 + i * 150} y={400} width={40} height={18} fill={C.townLit} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        {/* 右の窓の中: かすれていく名札 */}
        <rect x={490} y={118} width={940} height={514} fill={C.screenDim} opacity={0.35 + 0.1 * Math.sin(f / 5)} />
        {/* 抜けていく残像 (自分の輪郭がずれていく) */}
        <g opacity={0.25 * blur}>
          <rect x={960 - 270 + 40 * blur} y={375 - 128 - 20 * blur} width={540} height={256} rx={30} fill="none" stroke={NP.woodDark} strokeWidth={8} strokeDasharray="20 14" />
          <rect x={960 - 270 - 60 * blur} y={375 - 128 + 14 * blur} width={540} height={256} rx={30} fill="none" stroke={NP.woodDark} strokeWidth={6} strokeDasharray="14 18" />
        </g>
        <Nafuda x={960} y={395} s={1.35} text="山田 花子" blur={blur} f={f} />
        {/* フィルムのキズ (縦線がちらつく) */}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={560 + ((f * 37 + i * 311) % 860)} y1={120} x2={560 + ((f * 37 + i * 311) % 860) + 6} y2={630}
            stroke={KRP.ink} strokeWidth={2} opacity={0.12} />
        ))}
        {/* 2つの怖さの札 */}
        <NJ1bFearBoard x={LX} y={740} w={760} h={110} text="帰り道がわからなくなる" size={52} f={f} />
        <g transform={`translate(${LX + 300} 735)`}>
          <circle r={70} fill="none" stroke={C.inkRed} strokeWidth={14} opacity={0.9} />
        </g>
        <NJ1bFearBoard x={960} y={738} w={640} h={110} text="元の自分を忘れる" size={56} f={f} />
        {/* 右下の映写機 */}
        <NJ1bProjector x={1660} y={700} s={0.9} f={f} />
        {/* 客席の背もたれ (手前の床まわり) */}
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i}>
            <rect x={-560 + i * 190} y={900} width={170} height={240} rx={40} fill={C.seat} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-548 + i * 190} y={912} width={146} height={30} rx={14} fill={C.seatTop} />
          </g>
        ))}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #235 こちらは、半分だけ確かめられました。
// 格: 山 / seed 4235
// 絵: 右の札に、**半分だけの○** (左半分が朱の○・右半分は点線) のスタンプ (f)。「半分」の小札
// どこ: 同じ映写機の部屋。右の窓の真下、「元の自分を忘れる」の札に寄ったところ
// 演出: 上から朱肉つきの判子が下りてきて、札の右端にドンと押す。持ち上がると、左半分だけ朱の○・右半分は点線。札が揺れ、ナレーターが腕を組んで見つめる
// 動き: f4-15 判子が下りる / f15-20 押す (つぶれ+揺れ+粉) / f20-32 判子が右上へ去る / f26-34「半分」の小札 / カメラは押した瞬間に小さく揺れ、ゆっくり寄る
const Nm235: React.FC<{ f: number }> = ({ f }) => {
  const SX = 1390, SY = 400;
  const down = easeInOut(seg(f, 4, 15));
  const press = seg(f, 15, 20);
  const up = easeInOut(seg(f, 20, 32));
  const squash = press > 0 && up < 0.05 ? Math.sin(press * Math.PI) * 0.12 : 0;
  const hy = lerp(-420, SY - 60, down) - up * 560 + squash * 40;
  const hx = SX + up * 300;
  const ink = seg(f, 17, 22);
  const hit = seg(f, 17, 30);
  const shake = hit > 0 && hit < 1 ? (1 - hit) : 0;
  const push = easeOut(seg(f, 0, 40));
  const camShake = Math.sin(f * 3.1) * 6 * shake;
  return (
    <Frame f={f} seed={4235} dark bg={C.wallDark}>
      <g transform={`${NJ1bCam(push, 0.94, 900, 520)} translate(${camShake} ${camShake * 0.5})`}>
        {/* 壁と腰板 */}
        <rect x={-200} y={-200} width={2400} height={1500} fill={C.wall} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={-100 + i * 190} y1={-200} x2={-100 + i * 190} y2={860} stroke={C.wallLine} strokeWidth={6} opacity={0.6} />
        ))}
        <rect x={-200} y={860} width={2400} height={500} fill={C.wains} />
        <rect x={-200} y={852} width={2400} height={22} fill={C.wainsDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 上: 右の窓の下枠 (まだ光っている) */}
        <rect x={60} y={-60} width={1600} height={150} rx={14} fill={C.frameWood} stroke={KRP.ink} strokeWidth={9} />
        <rect x={90} y={-60} width={1540} height={120} fill={C.screen} stroke={KRP.ink} strokeWidth={5} />
        <rect x={90} y={-60} width={1540} height={120} fill={C.beam} opacity={0.25 + 0.06 * Math.sin(f * 1.7)} />
        {/* 札にかかる光だまり */}
        <ellipse cx={820} cy={420} rx={900} ry={260} fill={C.beam} opacity={0.12} />
        {/* 札 */}
        <g transform={`translate(0 ${shake * 6})`}>
          <NJ1bFearBoard x={820} y={400} w={1500} h={240} text="元の自分を忘れる" size={120} f={f} tx={-120} shake={shake} />
          {/* 半分だけの○ (押した跡) */}
          <NJ1bHalfMaru x={SX} y={SY} r={160} t={ink} sw={26} />
          {/* 朱の飛び散り */}
          {ink > 0 && shake > 0 && [0, 1, 2, 3, 4, 5].map((i) => {
            const a = -Math.PI / 2 - 1.2 + i * 0.5;
            const d = 190 + 60 * hit;
            return <circle key={i} cx={SX + Math.cos(a) * d} cy={SY + Math.sin(a) * d * 0.9} r={7 - i * 0.6} fill={C.inkRed} opacity={shake} />;
          })}
        </g>
        {/* 押した瞬間の衝撃線 */}
        {shake > 0 && (
          <g stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={shake}>
            {[-1, 1].map((sd) => (
              <g key={sd}>
                <line x1={SX + sd * 210} y1={SY - 160} x2={SX + sd * 260} y2={SY - 210} />
                <line x1={SX + sd * 230} y1={SY - 60} x2={SX + sd * 300} y2={SY - 70} />
              </g>
            ))}
          </g>
        )}
        {/* 判子 (上から腕が持つ) */}
        {up < 1 && (
          <g transform={`translate(${hx} ${hy}) rotate(${up * 18}) scale(${1 + squash} ${1 - squash})`}>
            <rect x={-30} y={-470} width={60} height={300} rx={20} fill="#6F8FB0" stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={-170} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-26} y={-190} width={52} height={90} rx={22} fill={C.frameWood} stroke={KRP.ink} strokeWidth={6} />
            <ellipse cx={0} cy={-100} rx={72} ry={18} fill={C.frameDark} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-150} y={-100} width={300} height={44} rx={10} fill={C.frameWood} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-160} y={-58} width={320} height={22} rx={6} fill={C.inkPad} stroke={KRP.ink} strokeWidth={5} />
          </g>
        )}
        {/* 「半分」の小札 */}
        <TagPlate x={SX} y={650} text="半分" size={52} t={seg(f, 26, 34)} color={C.inkRed} />
        {/* 朱肉の台 (左下) */}
        <g transform="translate(250 700)">
          <rect x={-120} y={20} width={240} height={150} rx={10} fill={C.frameDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-100} y={-20} width={200} height={50} rx={12} fill="#4A4A52" stroke={KRP.ink} strokeWidth={6} />
          <ellipse cx={0} cy={-10} rx={80} ry={14} fill={C.inkPad} />
        </g>
        {/* ナレーター: 腕を組んで判を見つめる */}
        <Person x={1760} y={930} s={1.05} f={f} cloth="#6F8FB0" clothDark="#4F6C8C" pose="armsFolded"
          face={ink > 0.5 ? "worried" : "normal"} gaze={[-10, -6]} lean={-4} phase={1} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #236 脳は、自分の名前に、強く振り向きます。
// 格: 並 / seed 4236
// 絵: スタンプの○の半分の中に、#207 の振り向く人形の小さな絵が灯る
// どこ: 札の上の「半分の○」にぐっと寄ったところ (木目と朱のかすれが見える距離)
// 演出: ○の実線の半分の中に、小さな舞台の灯りがともる。左から「○○」と呼ばれた人形が、くるっと振り向き、頭の上でひらめきが光る
// 動き: f0-40 カメラが○全体から左半分へ少し寄る / f4-18 灯りがともる / f14-24 呼ぶ声 / f24-32 人形が振り向く
const Nm236: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const lit = easeOut(seg(f, 4, 18));
  const call = seg(f, 14, 24);
  const turn = easeInOut(seg(f, 24, 32));
  const CX = 1000, CY = 440, R = 390;
  return (
    <Frame f={f} seed={4236} bg={C.board}>
      <g transform={NJ1bCam(cam, 0.86, 1000, 470)}>
        {/* 札の板 (画面いっぱいの木目) */}
        <rect x={-300} y={-300} width={2600} height={1700} fill={C.board} />
        <g stroke={C.boardGrain} strokeWidth={5} fill="none" opacity={0.6}>
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M -300 ${-40 + i * 130} q 600 ${rnd(4236, i) * 40 - 20} 1300 0 q 700 ${rnd(4237, i) * 40 - 20} 1300 -6`} />
          ))}
          <ellipse cx={360} cy={760} rx={60} ry={22} />
          <ellipse cx={1620} cy={180} rx={46} ry={18} />
        </g>
        {/* 左半分の小さな絵 */}
        <defs>
          <clipPath id="nj1b236L"><path d={`M ${CX} ${CY - R + 14} A ${R - 14} ${R - 14} 0 0 0 ${CX} ${CY + R - 14} Z`} /></clipPath>
        </defs>
        <g clipPath="url(#nj1b236L)">
          <rect x={CX - R} y={CY - R} width={R} height={R * 2} fill={C.wallDark} opacity={0.15 + 0.7 * lit} />
          {/* 舞台の奥の幕 */}
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M ${CX - R + i * 70} ${CY - R} q 20 ${R} 0 ${R * 2}`} stroke={C.inkPad} strokeWidth={22} opacity={0.35 * lit} fill="none" />
          ))}
          <NJ1bTurnPic id="nj1b236h" x={CX - 140} y={CY + 300} s={0.95} f={f} turn={turn} call={call} lit={lit} />
        </g>
        {/* 右半分は木目のまま (まだ何もない) */}
        <path d={`M ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${CX} ${CY + R} Z`} fill={C.boardDark} opacity={0.18} />
        {/* 半分の○ */}
        <NJ1bHalfMaru x={CX} y={CY} r={R} t={1} sw={46} />
        {/* 真ん中の境目 */}
        <line x1={CX} y1={CY - R + 30} x2={CX} y2={CY + R - 30} stroke={C.inkRed} strokeWidth={5} strokeDasharray="10 14" opacity={0.6} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #237 でも、名前を失うと自分を忘れるのかは、まだ誰も測れていません。
// 格: 並 / seed 4237
// 絵: スタンプの点線の半分の中に、#222 の霧の棚の小さな絵。`QMark`
// どこ: 同じ「半分の○」。今度は点線の右半分に寄る
// 演出: 点線の半分の中は霧の棚。左の灯った半分から巻き尺がのびて測りに行くが、先が霧に溶けて届かない。大きな？が浮かぶ
// 動き: f0-40 カメラが左から右半分へパン / 霧がゆっくり流れる / f6-28 巻き尺がのびて先が薄れる / f22-32 ？がぽんと出る
const Nm237: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const tape = easeOut(seg(f, 6, 28));
  const CX = 920, CY = 440, R = 390;
  const tipX = lerp(CX - 50, CX + 300, tape);
  return (
    <Frame f={f} seed={4237} bg={C.board}>
      <g transform={NJ1bCam(cam, 1.0, 760, 540)}>
        <rect x={-300} y={-300} width={2600} height={1700} fill={C.board} />
        <g stroke={C.boardGrain} strokeWidth={5} fill="none" opacity={0.6}>
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M -300 ${-40 + i * 130} q 600 ${rnd(4237, i) * 40 - 20} 1300 0 q 700 ${rnd(4238, i) * 40 - 20} 1300 -6`} />
          ))}
          <ellipse cx={1660} cy={820} rx={60} ry={22} />
        </g>
        {/* 左半分: さっきの灯り (小さく残っている) */}
        <defs>
          <clipPath id="nj1b237L"><path d={`M ${CX} ${CY - R + 14} A ${R - 14} ${R - 14} 0 0 0 ${CX} ${CY + R - 14} Z`} /></clipPath>
          <clipPath id="nj1b237R"><path d={`M ${CX} ${CY - R + 14} A ${R - 14} ${R - 14} 0 0 1 ${CX} ${CY + R - 14} Z`} /></clipPath>
        </defs>
        <g clipPath="url(#nj1b237L)">
          <rect x={CX - R} y={CY - R} width={R} height={R * 2} fill={C.wallDark} opacity={0.8} />
          <NJ1bTurnPic id="nj1b237h" x={CX - 250} y={CY + 200} s={0.6} f={f} turn={1} call={0} lit={0.8} />
        </g>
        {/* 右半分: 霧の棚 */}
        <g clipPath="url(#nj1b237R)">
          <rect x={CX} y={CY - R} width={R} height={R * 2} fill={C.fogDark} />
          {/* 棚 */}
          <g transform={`translate(${CX + 60} ${CY - 260})`}>
            <rect x={0} y={0} width={300} height={560} fill={C.shelfDark} stroke={KRP.ink} strokeWidth={6} />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={-10} y={40 + k * 150} width={320} height={18} fill={C.shelf} stroke={KRP.ink} strokeWidth={5} />
            ))}
            {[0, 1, 2].map((k) => (
              <g key={k}>
                {[0, 1, 2].map((j) => {
                  const bx = 20 + j * 95, by = 58 + k * 150;
                  return j === 1 ? (
                    <g key={j}>
                      <rect x={bx + 6} y={by - 96} width={60} height={96} rx={14} fill={C.jar} stroke={KRP.ink} strokeWidth={4} />
                      <rect x={bx + 2} y={by - 108} width={68} height={16} rx={5} fill={C.shelf} stroke={KRP.ink} strokeWidth={4} />
                    </g>
                  ) : (
                    <g key={j}>
                      <rect x={bx} y={by - 82} width={78} height={82} fill={C.box} stroke={KRP.ink} strokeWidth={4} />
                      <rect x={bx + 14} y={by - 60} width={50} height={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                      <line x1={bx + 22} y1={by - 47} x2={bx + 56} y2={by - 47} stroke={KRP.grayDark} strokeWidth={4} opacity={0.6} />
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
          {/* 流れる霧 */}
          {Array.from({ length: 7 }, (_, i) => {
            const dx = ((f * (0.8 + i * 0.15) + i * 90) % 500) - 120;
            return <ellipse key={i} cx={CX + dx + i * 20} cy={CY - 280 + i * 95} rx={220} ry={50} fill={C.fog} opacity={0.62} />;
          })}
          <rect x={CX} y={CY - R} width={R} height={R * 2} fill={C.fog} opacity={0.3 + 0.05 * Math.sin(f / 7)} />
        </g>
        {/* 巻き尺: 左の半分から右の霧へ。先は霧で消える */}
        <defs>
          <linearGradient id="nj1b237fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="nj1b237mask" maskUnits="userSpaceOnUse" x={CX - 200} y={0} width={600} height={1080}>
            <rect x={CX - 200} y={0} width={Math.max(1, tipX - CX + 200)} height={1080} fill="url(#nj1b237fade)" />
          </mask>
        </defs>
        <g mask="url(#nj1b237mask)">
          <rect x={CX - 60} y={CY + 108} width={Math.max(0, tipX - CX + 60)} height={34} fill={C.tape} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 30 }, (_, i) => {
            const tx = CX - 50 + i * 18;
            return tx < tipX ? <line key={i} x1={tx} y1={CY + 108} x2={tx} y2={CY + 108 + (i % 5 ? 12 : 22)} stroke={KRP.ink} strokeWidth={3} /> : null;
          })}
        </g>
        {/* 巻き尺の本体 */}
        <g transform={`translate(${CX - 110} ${CY + 125})`}>
          <rect x={-70} y={-62} width={130} height={124} rx={30} fill={C.tapeDark} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={-6} cy={0} r={34} fill={C.tape} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-6} cy={0} r={10} fill={KRP.ink} transform={`rotate(${f * 8} -6 0)`} />
        </g>
        {/* 半分の○ */}
        <NJ1bHalfMaru x={CX} y={CY} r={R} t={1} sw={46} />
        <QMark x={CX + 210} y={CY - 40} s={1.6} f={f} t={seg(f, 22, 32)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #238 ここから先は、科学ではなく、物語の領域です。
// 格: 山 / seed 4238
// 絵: 映写機の部屋の壁が f で開いて、その先に**物語の本の世界** (大きく開いた絵本・ページから森と町が立ち上がる)。科学の棚 (左・明るい) と物語の本 (右・あたたかい色) の境目
// どこ: 映写機の部屋の壁が開いた先。左=明るい科学の棚 / 右=あたたかい物語の世界 (大きく開いた絵本)
// 演出: 暗い壁が左右に割れて、右の扉の向こうに絵本。ページから森と町が立ち上がる。境目の柱の前でナレーターが驚いて右を見る
// 動き: f0-40 カメラが少し引く / f6-24 壁が割れる (左は滑って、右は扉のように開く) / f18-38 ページの森と町が立ち上がる / 火の粉のような光が舞う
const Nm238: React.FC<{ f: number }> = ({ f }) => {
  const open = easeInOut(seg(f, 6, 24));
  const rise = easeOut(seg(f, 18, 38));
  const cam = easeInOut(seg(f, 0, 40));
  const BX = 1370, BY = 640; // 絵本の背 (のど) の位置
  const popItem = (k: number) => clamp01(rise * 1.4 - k * 0.08);
  return (
    <Frame f={f} seed={4238} bg={C.sciWall}>
      <g transform={NJ1bCam(cam, 1.08, 820, 540)}>
        {/* ===== 左: 科学の棚 ===== */}
        <rect x={-100} y={-100} width={920} height={1300} fill={C.sciWall} />
        <rect x={-100} y={840} width={920} height={400} fill={C.sciShelf} />
        {/* 方眼のグラフ紙 (壁) */}
        <g transform="translate(560 150) rotate(2)">
          <rect x={0} y={0} width={170} height={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} y1={i * 25} x2={170} y2={i * 25} stroke={KRP.blueSoft} strokeWidth={2} />)}
          <path d="M 12 130 L 50 100 L 82 110 L 120 60 L 158 30" stroke={KRP.blueDeep} strokeWidth={5} fill="none" />
          <circle cx={85} cy={4} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 棚3段 */}
        {[0, 1, 2].map((k) => {
          const sy = 300 + k * 200;
          return (
            <g key={k}>
              <rect x={20} y={sy} width={520} height={20} fill={C.sciShelfDark} stroke={KRP.ink} strokeWidth={5} />
              {k === 0 && Array.from({ length: 9 }, (_, i) => (
                <rect key={i} x={36 + i * 52} y={sy - 130 + (i % 3) * 10} width={44} height={130 - (i % 3) * 10} rx={4}
                  fill={[KRP.blueDeep, KRP.gray, KRP.blueSoft, KRP.grayDark][i % 4]} stroke={KRP.ink} strokeWidth={4} />
              ))}
              {k === 1 && (
                <g>
                  {/* ビーカーとフラスコ */}
                  <path d={`M 60 ${sy - 110} L 60 ${sy - 4} L 130 ${sy - 4} L 130 ${sy - 110}`} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
                  <rect x={62} y={sy - 50} width={66} height={46} fill={KRP.blue} opacity={0.7} />
                  <path d={`M 190 ${sy - 130} L 190 ${sy - 80} L 150 ${sy - 4} L 270 ${sy - 4} L 230 ${sy - 80} L 230 ${sy - 130} Z`} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
                  <path d={`M 165 ${sy - 30} L 255 ${sy - 30} L 270 ${sy - 4} L 150 ${sy - 4} Z`} fill={KRP.green} opacity={0.8} />
                  {[0, 1].map((b) => <circle key={b} cx={205 + b * 12} cy={sy - 50 - ((f * 2 + b * 20) % 40)} r={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />)}
                  {/* 脳の模型 */}
                  <g transform={`translate(420 ${sy - 70})`}>
                    <rect x={-50} y={50} width={100} height={20} rx={4} fill={C.sciShelfDark} stroke={KRP.ink} strokeWidth={4} />
                    <ellipse cx={0} cy={0} rx={80} ry={56} fill="#E8A7A0" stroke={KRP.ink} strokeWidth={5} />
                    <path d="M -50 -20 q 20 -20 40 0 q 20 20 40 0 M -60 16 q 30 -14 50 4 q 24 16 56 -6 M 0 -54 L 0 50" stroke="#B86E66" strokeWidth={4} fill="none" />
                  </g>
                </g>
              )}
              {k === 2 && (
                <g>
                  {/* 顕微鏡 */}
                  <g transform={`translate(120 ${sy})`}>
                    <rect x={-60} y={-24} width={120} height={24} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
                    <path d="M 20 -24 Q 50 -80 20 -130" stroke={KRP.grayDark} strokeWidth={18} fill="none" />
                    <rect x={-30} y={-170} width={34} height={100} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} transform="rotate(-18 -13 -120)" />
                    <rect x={-50} y={-70} width={80} height={12} fill={KRP.ink} />
                  </g>
                  {/* ファイルの束 */}
                  {[0, 1, 2, 3].map((i) => <rect key={i} x={260 + i * 60} y={sy - 110} width={50} height={110} rx={4} fill={i % 2 ? KRP.white : KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />)}
                </g>
              )}
            </g>
          );
        })}
        {/* 蛍光灯の明るさ */}
        <rect x={60} y={20} width={420} height={26} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <polygon points="70,46 470,46 600,300 -60,300" fill={KRP.white} opacity={0.35} />
        {/* ===== 右: 物語の世界 ===== */}
        <rect x={820} y={-100} width={1300} height={1300} fill={C.story} />
        <ellipse cx={BX} cy={480} rx={620} ry={420} fill={NP.glowCore} opacity={0.55} />
        <path d="M 820 560 Q 1100 470 1400 540 Q 1700 470 2100 540 L 2100 1200 L 820 1200 Z" fill={C.storyDeep} opacity={0.55} />
        {/* 絵本 (開いた見開き) */}
        <g>
          <path d={`M ${BX - 520} ${BY + 130} L ${BX - 470} ${BY - 40} L ${BX} ${BY - 10} L ${BX + 470} ${BY - 40} L ${BX + 520} ${BY + 130} L ${BX} ${BY + 150} Z`}
            fill={C.cover} stroke={KRP.ink} strokeWidth={8} />
          <path d={`M ${BX - 495} ${BY + 112} L ${BX - 452} ${BY - 50} Q ${BX - 220} ${BY - 70} ${BX} ${BY - 26} L ${BX} ${BY + 128} Q ${BX - 230} ${BY + 90} ${BX - 495} ${BY + 112} Z`}
            fill={C.page} stroke={KRP.ink} strokeWidth={6} />
          <path d={`M ${BX + 495} ${BY + 112} L ${BX + 452} ${BY - 50} Q ${BX + 220} ${BY - 70} ${BX} ${BY - 26} L ${BX} ${BY + 128} Q ${BX + 230} ${BY + 90} ${BX + 495} ${BY + 112} Z`}
            fill={C.page} stroke={KRP.ink} strokeWidth={6} />
          <line x1={BX} y1={BY - 26} x2={BX} y2={BY + 128} stroke={C.pageShade} strokeWidth={10} />
          {/* 左ページから立ち上がる森 */}
          {[0, 1, 2, 3, 4].map((i) => {
            const tx = BX - 400 + i * 78, ty = BY + 40 - (i % 2) * 30;
            const p = popItem(i);
            return (
              <g key={i} transform={`translate(${tx} ${ty}) scale(1 ${p})`}>
                <rect x={-8} y={-50} width={16} height={50} fill={C.brickDark} stroke={KRP.ink} strokeWidth={4} />
                <polygon points={`0,${-230 + (i % 2) * 40} -62,-40 62,-40`} fill={i % 2 ? C.forestDark : C.forest} stroke={KRP.ink} strokeWidth={5} />
                <polygon points={`0,${-280 + (i % 2) * 40} -42,-140 42,-140`} fill={i % 2 ? C.forest : C.forestDark} stroke={KRP.ink} strokeWidth={5} />
              </g>
            );
          })}
          {/* 右ページから立ち上がる町 */}
          {[0, 1, 2, 3].map((i) => {
            const tx = BX + 100 + i * 95, ty = BY + 40 - (i % 2) * 34;
            const p = popItem(i + 2);
            const hh = 110 + (i % 3) * 40;
            return (
              <g key={i} transform={`translate(${tx} ${ty}) scale(1 ${p})`}>
                <rect x={-40} y={-hh} width={80} height={hh} fill={C.houseW} stroke={KRP.ink} strokeWidth={5} />
                <polygon points={`-52,${-hh} 0,${-hh - 60} 52,${-hh}`} fill={i % 2 ? C.roofB : C.roof} stroke={KRP.ink} strokeWidth={5} />
                <rect x={-16} y={-hh + 28} width={32} height={30} fill={C.townLit} stroke={KRP.ink} strokeWidth={3} />
                <rect x={-12} y={-40} width={24} height={40} fill={C.door} stroke={KRP.ink} strokeWidth={3} />
              </g>
            );
          })}
          {/* 小道 (森から町へ) */}
          <path d={`M ${BX - 360} ${BY + 90} Q ${BX} ${BY + 40} ${BX + 330} ${BY + 70}`} stroke={C.road} strokeWidth={14 * rise} fill="none" strokeLinecap="round" />
        </g>
        {/* 舞う光の粒 */}
        {Array.from({ length: 12 }, (_, i) => {
          const px = BX - 480 + rnd(4238, i) * 960;
          const py = BY - 60 - ((f * (1.4 + rnd(4239, i)) + i * 60) % 420);
          return <circle key={i} cx={px} cy={py} r={5 + (i % 3) * 2} fill={NP.glowCore} stroke={NP.brass} strokeWidth={2} opacity={0.9 * rise} />;
        })}
        {/* ===== 境目の柱 ===== */}
        <rect x={790} y={-100} width={50} height={1300} fill={C.frameWood} stroke={KRP.ink} strokeWidth={7} />
        <rect x={-100} y={-100} width={2200} height={70} fill={C.wall} stroke={KRP.ink} strokeWidth={6} />
        {/* ===== 割れる暗い壁 ===== */}
        {open < 1 && (
          <g>
            <g transform={`translate(${-830 * open} 0)`}>
              <rect x={-100} y={-30} width={915} height={1200} fill={C.wall} stroke={KRP.ink} strokeWidth={7} />
              {[0, 1, 2, 3].map((i) => <line key={i} x1={40 + i * 190} y1={-30} x2={40 + i * 190} y2={1200} stroke={C.wallLine} strokeWidth={6} />)}
            </g>
            <g transform={`translate(1920 0) scale(${1 - open} 1) translate(-1920 0)`}>
              <rect x={815} y={-30} width={1105} height={1200} fill={open > 0.3 ? C.wallDark : C.wall} stroke={KRP.ink} strokeWidth={7} />
              {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={900 + i * 200} y1={-30} x2={900 + i * 200} y2={1200} stroke={C.wallLine} strokeWidth={6} />)}
              <rect x={850} y={520} width={24} height={110} rx={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
            </g>
            {/* 割れ目から漏れる光 */}
            <rect x={812 - 10 * open} y={-30} width={20 + 30 * open} height={1200} fill={NP.glowCore} opacity={0.8 * (1 - open)} />
          </g>
        )}
        {/* ナレーター (境目の前で右を見て驚く) */}
        <Person x={700} y={930} s={1.0} f={f} cloth="#6F8FB0" clothDark="#4F6C8C"
          face={open > 0.5 ? "surprised" : "normal"} gaze={[10, -2]} lean={open * 5} phase={3} />
        {/* 札 */}
        <TagPlate x={330} y={770} text="科学" size={52} t={seg(f, 24, 32)} color={KRP.blueDeep} />
        <TagPlate x={BX} y={772} text="物語" size={52} t={seg(f, 28, 36)} color={C.cover} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #239 そして昔話の中では、名前を知った人が、助かりました。
// 格: 山 / seed 4239
// 絵: 開いた絵本のページに、第1章のお妃が赤ちゃんを抱いて笑う絵 (小男はいない・煙の輪だけ)。お妃の手に名札。暖炉の光
// どこ: 開いた絵本の見開き (机の上)。挿絵の中は第1章の昔話のお城の部屋
// 演出: 左ページには糸車と金の糸巻き、小男がいた場所に煙の輪だけが残って消えていく。右ページでは暖炉の前のお妃が赤ちゃんを抱いて笑い、手の中の名札が光る
// 動き: f0-40 カメラがページへ寄る / f6-34 煙の輪が3つ順に立ちのぼって薄れる / 暖炉の火がゆれる / f16-30 名札の光がふくらむ / ページの角がふわっとめくれかける
const Nm239: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const glow = easeOut(seg(f, 16, 30));
  const laugh = Math.abs(Math.sin(f / 4)) * 4 * seg(f, 10, 20);
  const QX = 1330, QY = 840;
  const flame = (i: number) => Math.sin(f / 3 + i * 1.7) * 10;
  return (
    <Frame f={f} seed={4239} bg={C.frameDark}>
      <g transform={NJ1bCam(cam, 0.86, 960, 520)}>
        {/* 机 */}
        <rect x={-300} y={-300} width={2600} height={1700} fill={C.frameDark} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M -300 ${-100 + i * 180} q 1100 ${rnd(4239, i) * 30 - 15} 2500 0`} stroke={C.frameWood} strokeWidth={8} opacity={0.5} fill="none" />
        ))}
        {/* 本の表紙 (ページの下からのぞく) */}
        <rect x={30} y={50} width={1860} height={900} rx={20} fill={C.cover} stroke={KRP.ink} strokeWidth={8} />
        {/* 左右のページ */}
        <path d="M 60 80 Q 520 60 955 96 L 955 930 Q 520 900 60 920 Z" fill={C.page} stroke={KRP.ink} strokeWidth={6} />
        <path d={`M 1860 80 Q 1400 60 965 96 L 965 930 Q 1400 900 ${1860 - 6 * Math.sin(f / 9)} 920 Z`} fill={C.page} stroke={KRP.ink} strokeWidth={6} />
        <rect x={900} y={96} width={120} height={834} fill={C.pageShade} opacity={0.6} />
        {/* 挿絵の枠 */}
        <rect x={110} y={130} width={800} height={740} rx={10} fill="none" stroke={C.storyDeep} strokeWidth={6} />
        <rect x={1010} y={130} width={800} height={740} rx={10} fill="none" stroke={C.storyDeep} strokeWidth={6} />
        {/* ===== 左ページ: 糸車・金の糸巻き・煙の輪 ===== */}
        <rect x={120} y={140} width={780} height={720} fill={C.blanket} opacity={0.6} />
        <rect x={120} y={700} width={780} height={160} fill={C.boardDark} opacity={0.6} />
        {/* 石の壁と窓 */}
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
          <rect key={`${r}-${c}`} x={130 + c * 130 + (r % 2) * 60} y={150 + r * 110} width={120} height={100} rx={8} fill="none" stroke={C.boardGrain} strokeWidth={3} opacity={0.6} />
        )))}
        <rect x={180} y={200} width={160} height={200} rx={70} fill={C.skyTop} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={290} cy={250} r={20} fill={C.townLit} />
        {/* 糸車 */}
        <g transform="translate(470 620)">
          <rect x={-150} y={60} width={300} height={22} rx={8} fill={C.shelf} stroke={KRP.ink} strokeWidth={5} />
          <line x1={-110} y1={70} x2={-140} y2={170} stroke={KRP.ink} strokeWidth={8} />
          <line x1={110} y1={70} x2={140} y2={170} stroke={KRP.ink} strokeWidth={8} />
          <g transform={`rotate(${f * 2})`}>
            <circle r={130} fill="none" stroke={C.shelfDark} strokeWidth={14} />
            <circle r={130} fill="none" stroke={KRP.ink} strokeWidth={3} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 124} y2={Math.sin(a) * 124} stroke={C.shelfDark} strokeWidth={6} />;
            })}
          </g>
          <circle r={18} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
          <line x1={0} y1={0} x2={0} y2={70} stroke={KRP.ink} strokeWidth={8} />
        </g>
        {/* 金の糸巻きと麦わら */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${680 + i * 70} ${760 - (i % 2) * 14})`}>
            <rect x={-26} y={-60} width={52} height={60} rx={8} fill={C.crown} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-32} y={-66} width={64} height={12} rx={4} fill={C.shelf} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-32} y={-6} width={64} height={12} rx={4} fill={C.shelf} stroke={KRP.ink} strokeWidth={3} />
            <line x1={-20} y1={-40} x2={20} y2={-36} stroke={C.fireCore} strokeWidth={3} />
          </g>
        ))}
        <g stroke={C.straw} strokeWidth={6} strokeLinecap="round">
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={170 + i * 14} y1={830} x2={210 + i * 10} y2={790 - (i % 3) * 10} />)}
        </g>
        {/* 煙の輪 (小男が消えたあと) */}
        {[0, 1, 2].map((i) => {
          const p = seg(f, 4 + i * 10, 70 + i * 10);
          if (p <= 0) return null;
          return (
            <ellipse key={i} cx={240 + i * 24 + Math.sin(f / 6 + i) * 10} cy={760 - p * 420} rx={60 + p * 80} ry={20 + p * 26}
              fill="none" stroke={C.smoke} strokeWidth={18 - p * 10} opacity={(1 - p) * 0.9 + 0.1} />
          );
        })}
        <ellipse cx={270} cy={790} rx={70} ry={14} fill={C.smoke} opacity={0.4} />
        {/* ===== 右ページ: 暖炉とお妃 ===== */}
        <rect x={1020} y={140} width={780} height={720} fill={C.blanket} opacity={0.5} />
        <rect x={1020} y={720} width={780} height={140} fill={C.boardDark} opacity={0.55} />
        {/* 暖炉 */}
        <g transform="translate(1620 720)">
          <rect x={-150} y={-380} width={300} height={380} fill={C.brick} stroke={KRP.ink} strokeWidth={6} />
          {Array.from({ length: 6 }, (_, r) => <line key={r} x1={-150} y1={-60 * r - 40} x2={150} y2={-60 * r - 40} stroke={C.brickDark} strokeWidth={4} />)}
          <rect x={-180} y={-410} width={360} height={40} rx={6} fill={C.shelf} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -100 0 L -100 -170 Q 0 -250 100 -170 L 100 0 Z" fill={KRP.ink} />
          <ellipse cx={0} cy={-60} rx={170} ry={120} fill={C.fire} opacity={0.25 + 0.05 * Math.sin(f / 2)} />
          <path d={`M -70 0 Q -80 ${-80 + flame(0)} -30 ${-130 + flame(1)} Q -20 -70 0 ${-160 + flame(2)} Q 20 -80 40 ${-120 + flame(3)} Q 80 -60 70 0 Z`} fill={C.fire} stroke={KRP.ink} strokeWidth={4} />
          <path d={`M -36 0 Q -40 -50 -10 ${-90 + flame(4)} Q 10 -50 30 ${-80 + flame(5)} Q 44 -40 36 0 Z`} fill={C.fireCore} />
          <rect x={-80} y={-14} width={160} height={18} rx={8} fill={C.brickDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 暖炉の光が部屋を照らす */}
        <ellipse cx={1500} cy={600} rx={420} ry={300} fill={C.fireCore} opacity={0.18 + 0.04 * Math.sin(f / 3)} />
        {/* お妃 */}
        <g transform={`translate(0 ${-laugh})`}>
          <Person x={QX} y={QY - 20} s={1.15} f={f} cloth={C.queen} clothDark={C.queenDark} pose="hold" face="joy" hair="cap" phase={4} />
          {/* ドレスのすそ (脚をかくす) */}
          <path d={`M ${QX - 66} ${QY - 92} L ${QX - 140} ${QY} L ${QX + 140} ${QY} L ${QX + 66} ${QY - 92} Z`} fill={C.queen} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M ${QX - 110} ${QY - 30} Q ${QX} ${QY - 10} ${QX + 110} ${QY - 30}`} stroke={C.queenDark} strokeWidth={6} fill="none" />
          {/* 王冠 */}
          <g transform={`translate(${QX} ${QY - 20 - 300 * 1.15 + Math.sin(((f + 4 * 17) / 13)) * 3})`}>
            <path d="M -50 20 L -56 -30 L -26 0 L 0 -42 L 26 0 L 56 -30 L 50 20 Z" fill={C.crown} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={-42} r={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          </g>
          {/* 赤ちゃん (おくるみ) */}
          <g transform={`translate(${QX} ${QY - 20 - 118 * 1.15 - 10})`}>
            <ellipse cx={0} cy={6} rx={92} ry={46} fill={C.blanket} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -60 -10 Q 0 30 70 -6" stroke={C.pageShade} strokeWidth={5} fill="none" />
            <circle cx={-46} cy={-10} r={32} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={-56} cy={-14} r={4} fill={KRP.ink} /><circle cx={-36} cy={-14} r={4} fill={KRP.ink} />
            <path d="M -54 0 Q -46 8 -38 0" stroke={KRP.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            <circle cx={-62} cy={-2} r={5} fill="#F2A0A0" opacity={0.7} /><circle cx={-30} cy={-2} r={5} fill="#F2A0A0" opacity={0.7} />
          </g>
          {/* 手の中の名札 (光る) */}
          <circle cx={QX + 86} cy={QY - 140} r={70 * (0.6 + 0.4 * glow)} fill={NP.glow} opacity={0.5 * glow} />
          <Nafuda x={QX + 86} y={QY - 140} s={0.3} text="○○○○" hang={false} f={f} rot={12} knots={{ mimi: glow, chobo: glow, shinyo: glow }} />
          {/* 笑い声のしるし */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${QX - 120 - i * 16} ${QY - 330 - i * 22} l -26 -14`} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={seg(f, 10, 18)} />
          ))}
        </g>
        <TagPlate x={510} y={200} text="グリム童話" size={40} t={seg(f, 4, 12)} color={C.cover} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #240 名前を覚えていることは、帰り道を覚えていることなのかもしれません。
// 格: 山 / seed 4240
// 絵: ★**映画への回答**。夕暮れの道 (#223 と同じ一本道)。小さな千尋の後ろ姿 (`Ushiro kind="chihiro"`) が、手に名札の形の白いカード (字は描かない) を握って、町の灯りへ歩いていく。足元の道が f で光の点線になって伸びる。霧は晴れている
// どこ: 夕暮れの一本道 (田んぼの中をまっすぐ町へ)。霧はもう晴れていく
// 演出: 小さな千尋の後ろ姿が、名札の形の白いカード (字なし) を握って町の灯りへ歩く。足元から道が光の点線になって町までのびる
// 動き: f0-40 カメラがゆっくり道の先へ寄る / 少女が歩いて少しずつ遠ざかる / f0-30 残りの霧が左右へ流れて消える / f8-40 光の点線が足元から町へのびる / 町の窓がひとつずつ灯る
const Nm240: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const fogOut = easeOut(seg(f, 0, 30));
  const path = easeOut(seg(f, 8, 40));
  const ff = Math.min(f, 160);
  const GY = 430; // 地平線
  const cy = 870 - ff * 0.9;
  const cs = 0.95 - ff * 0.0016;
  const handX = 960 + 57 * cs, handY = cy - 70 * cs + Math.abs(Math.sin(f / 4)) * -4 * cs;
  return (
    <Frame f={f} seed={4240} bg={C.skyMid}>
      <defs>
        <linearGradient id="nj1b240sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={C.skyTop} />
          <stop offset="0.55" stopColor={C.skyMid} />
          <stop offset="1" stopColor={C.skyLow} />
        </linearGradient>
      </defs>
      <g transform={NJ1bCam(cam, 0.92, 960, 600)}>
        <rect x={-200} y={-200} width={2400} height={GY + 200} fill="url(#nj1b240sky)" />
        {/* 一番星 */}
        {[[300, 90], [620, 150], [1500, 110], [1780, 200]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={4 + (i % 2) * 2} fill={NP.glowCore} opacity={0.6 + 0.4 * Math.sin(f / 6 + i)} />
        ))}
        {/* 沈む夕日 */}
        <circle cx={1330} cy={GY} r={110} fill={C.sun} opacity={0.95} />
        <circle cx={1330} cy={GY} r={190} fill={C.sun} opacity={0.25} />
        {/* 遠くの山並み */}
        <path d={`M -200 ${GY} L 100 ${GY - 70} L 320 ${GY - 30} L 560 ${GY - 110} L 820 ${GY - 40} L 1100 ${GY - 90} L 1500 ${GY - 30} L 1760 ${GY - 100} L 2100 ${GY - 40} L 2100 ${GY} Z`}
          fill={C.hill} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        {/* 町 (地平線の上、道の先) */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const hx = 800 + i * 50, hh = 34 + ((i * 37) % 30);
          const on = seg(f, 4 + i * 4, 10 + i * 4);
          return (
            <g key={i}>
              <rect x={hx} y={GY - hh} width={44} height={hh} fill={C.pole} stroke={KRP.ink} strokeWidth={3} />
              <polygon points={`${hx - 4},${GY - hh} ${hx + 22},${GY - hh - 18} ${hx + 48},${GY - hh}`} fill={C.pole} stroke={KRP.ink} strokeWidth={3} />
              <rect x={hx + 14} y={GY - hh + 10} width={14} height={12} fill={C.townLit} opacity={0.3 + 0.7 * on} />
              <circle cx={hx + 21} cy={GY - hh + 16} r={18} fill={C.townLit} opacity={0.25 * on} />
            </g>
          );
        })}
        {/* 田んぼ */}
        <rect x={-200} y={GY} width={2400} height={900} fill={C.field} />
        {Array.from({ length: 8 }, (_, i) => {
          const yy = GY + 20 + i * i * 12;
          return <line key={i} x1={-200} y1={yy} x2={2200} y2={yy} stroke={C.fieldDark} strokeWidth={3 + i} opacity={0.6} />;
        })}
        {/* 道 */}
        <polygon points={`930,${GY} 990,${GY} 1420,1200 500,1200`} fill={C.road} stroke={KRP.ink} strokeWidth={5} />
        <polygon points={`930,${GY} 945,${GY} 640,1200 500,1200`} fill={C.roadDark} opacity={0.5} />
        {/* 電柱と電線 (左) */}
        {[0, 1, 2, 3].map((i) => {
          const k = [1, 0.55, 0.3, 0.16][i];
          const px = 960 - (520 * k + 40), base = GY + 640 * k;
          return (
            <g key={i}>
              <rect x={px - 8 * k} y={base - 520 * k} width={16 * k + 2} height={520 * k} fill={C.pole} stroke={KRP.ink} strokeWidth={3} />
              <rect x={px - 60 * k} y={base - 480 * k} width={120 * k} height={10 * k + 2} fill={C.pole} />
            </g>
          );
        })}
        <path d={`M 400 ${GY + 160} Q 560 ${GY + 120} 670 ${GY + 34} Q 760 ${GY + 10} 840 ${GY - 10}`} stroke={C.pole} strokeWidth={3} fill="none" />
        {/* 道ばたの草 */}
        {Array.from({ length: 14 }, (_, i) => {
          const gx = i < 7 ? 380 + i * 30 : 1340 + (i - 7) * 40;
          const gy = 900 - (i % 7) * 50;
          return <path key={i} d={`M ${gx} ${gy} l -10 -40 M ${gx} ${gy} l 4 -48 M ${gx} ${gy} l 16 -36`} stroke={C.fieldDark} strokeWidth={5} strokeLinecap="round" />;
        })}
        {/* 光の点線の道 (足元から町へ) */}
        <ellipse cx={960} cy={GY + 4} rx={160} ry={24} fill={NP.glowCore} opacity={0.5 * path} />
        <NJ1bDots a={[960, 880]} c={[960, 620]} b={[960, GY + 6]} t={path} n={26} r={11} shrink={0.75} f={f} />
        {/* 晴れていく霧 */}
        {[0, 1, 2, 3].map((i) => {
          const sd = i % 2 ? 1 : -1;
          return (
            <ellipse key={i} cx={960 + sd * (240 + fogOut * 900) + i * 20} cy={GY + 30 + i * 90} rx={460} ry={70}
              fill={C.fog} opacity={0.65 * (1 - fogOut)} />
          );
        })}
        {/* 千尋の後ろ姿 (歩く) */}
        <ellipse cx={960} cy={cy + 2} rx={70 * cs} ry={14 * cs} fill={KRP.ink} opacity={0.25} />
        <Ushiro kind="chihiro" x={960} y={cy} s={cs} walk f={f} />
        {/* 手に握った白いカード (名札の形・字なし) */}
        <circle cx={handX + 8} cy={handY + 18} r={46 * cs} fill={NP.glowCore} opacity={0.45 + 0.15 * Math.sin(f / 5)} />
        <g transform={`translate(${handX + 8} ${handY + 22}) rotate(${8 + Math.sin(f / 4) * 6})`}>
          <rect x={-24} y={-14} width={48} height={30} rx={6} fill={C.card} stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={0} cy={-6} r={3} fill={NP.brassDark} />
        </g>
        <circle cx={handX} cy={handY} r={10 * cs} fill={C.skin} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #241 ふだん意識することもない、自分の名前。
// 格: 並 / seed 4241
// 絵: 現代の朝の玄関。靴をはく人の後ろ姿。下駄箱の上に置かれた名札 (社員証・名札入れ) を何気なく首にかける。日常
// どこ: 現代の朝の玄関 (家の中から玄関ドアを見る)。すりガラスから朝日、たたきに靴、下駄箱の上に鍵と鉢植えと社員証
// 演出: 靴をはき終えた人の後ろ姿が、下駄箱の上の社員証 (青いストラップの名札入れ) を何気なく取って首にかけようと持ち上げる。名札がぶらりと揺れる
// 動き: f0-40 カメラが少し寄る / f4-14 手を下駄箱へのばす / f14-24 社員証が持ち上がる / その後ぶらぶら揺れる / 時計の秒針が進む
const Nm241: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const lift = easeInOut(seg(f, 14, 24));
  const PX = 1040, PY = 800, PS = 1.15;
  const raised = f >= 16;
  const bob = Math.sin((f + 5 * 17) / 13) * 3;
  // 社員証: 下駄箱の上 → 上げた手
  const hand: [number, number] = [PX - 67 * PS, PY + bob - 226 * PS];
  const rest: [number, number] = [740, 596];
  const hx = lerp(rest[0], hand[0], lift);
  const hy = lerp(rest[1], hand[1], lift) - Math.sin(lift * Math.PI) * 60;
  const swing = lift > 0.9 ? Math.sin(f / 7) * 12 : 0;
  const drop = lerp(10, 150, lift);
  return (
    <Frame f={f} seed={4241} bg={C.genkanWall}>
      <g transform={NJ1bCam(cam, 0.94, 960, 500)}>
        {/* 壁 */}
        <rect x={-200} y={-200} width={2400} height={1500} fill={C.genkanWall} />
        <rect x={-200} y={570} width={2400} height={30} fill={C.shoeBoxDark} opacity={0.4} />
        {/* 玄関ドア */}
        <rect x={760} y={90} width={420} height={560} fill={C.doorDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={780} y={110} width={380} height={540} fill={C.door} stroke={KRP.ink} strokeWidth={5} />
        <rect x={830} y={150} width={280} height={240} rx={8} fill={C.doorGlass} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={830} y1={190 + i * 36} x2={1110} y2={190 + i * 36} stroke={KRP.white} strokeWidth={4} opacity={0.6} />)}
        <rect x={830} y={150} width={280} height={240} fill={C.morning} opacity={0.5 + 0.08 * Math.sin(f / 8)} />
        <rect x={1110} y={420} width={30} height={70} rx={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 朝日の筋 */}
        <polygon points="830,390 1110,390 1380,860 640,860" fill={C.morning} opacity={0.35} />
        {/* 壁の時計 (7時40分) */}
        <g transform="translate(1420 230)">
          <circle r={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={Math.sin(a) * 58} y1={-Math.cos(a) * 58} x2={Math.sin(a) * 66} y2={-Math.cos(a) * 66} stroke={KRP.ink} strokeWidth={4} />;
          })}
          <line x1={0} y1={0} x2={0} y2={-40} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" transform="rotate(230)" />
          <line x1={0} y1={0} x2={0} y2={-58} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" transform="rotate(240)" />
          <line x1={0} y1={0} x2={0} y2={-60} stroke={KRP.red} strokeWidth={3} transform={`rotate(${f * 6})`} />
          <circle r={7} fill={KRP.ink} />
        </g>
        {/* コート掛け */}
        <rect x={1300} y={360} width={260} height={18} rx={8} fill={C.shoeBoxDark} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1350 378 q 0 20 14 20 M 1500 378 q 0 20 14 20" stroke={KRP.ink} strokeWidth={5} fill="none" />
        <path d="M 1478 396 L 1440 400 L 1420 560 L 1560 560 L 1540 400 Z" fill="#8A9A7A" stroke={KRP.ink} strokeWidth={5} />
        {/* たたき (タイル) */}
        <polygon points="600,650 1340,650 1600,860 340,860" fill={C.genkanTile} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={600 - i * 52} y1={650 + i * 42} x2={1340 + i * 52} y2={650 + i * 42} stroke={C.genkanTileDark} strokeWidth={3} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={600 + i * 123} y1={650} x2={340 + i * 210} y2={860} stroke={C.genkanTileDark} strokeWidth={3} />
        ))}
        {/* たたきの靴 (家族の) */}
        <ellipse cx={1330} cy={800} rx={46} ry={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={1390} cy={790} rx={46} ry={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={720} cy={760} rx={34} ry={16} fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />
        <ellipse cx={770} cy={752} rx={34} ry={16} fill={KRP.blue} stroke={KRP.ink} strokeWidth={4} />
        {/* 傘立て */}
        <rect x={1560} y={560} width={110} height={220} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1590} y1={560} x2={1570} y2={400} stroke={KRP.blueDeep} strokeWidth={12} strokeLinecap="round" />
        <line x1={1640} y1={560} x2={1665} y2={420} stroke={KRP.orange} strokeWidth={12} strokeLinecap="round" />
        {/* 下駄箱 */}
        <rect x={300} y={600} width={500} height={240} fill={C.shoeBox} stroke={KRP.ink} strokeWidth={7} />
        <line x1={550} y1={600} x2={550} y2={840} stroke={KRP.ink} strokeWidth={5} />
        <rect x={520} y={680} width={12} height={50} rx={5} fill={NP.brassDark} /><rect x={568} y={680} width={12} height={50} rx={5} fill={NP.brassDark} />
        <rect x={286} y={586} width={528} height={22} rx={6} fill={C.shoeBoxDark} stroke={KRP.ink} strokeWidth={6} />
        {/* 下駄箱の上: 鉢植え・鍵の小皿 */}
        <g transform="translate(380 586)">
          <path d="M -40 0 L -32 -70 L 32 -70 L 40 0 Z" fill={C.brick} stroke={KRP.ink} strokeWidth={5} />
          {[-1, 0, 1].map((k) => <ellipse key={k} cx={k * 30} cy={-110 + Math.abs(k) * 20} rx={22} ry={40} fill={C.plant} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${k * 30 + Math.sin(f / 15) * 2} ${k * 30} -70)`} />)}
        </g>
        <ellipse cx={560} cy={580} rx={60} ry={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        <g stroke={KRP.ink} strokeWidth={3}>
          <rect x={540} y={566} width={14} height={8} fill={KRP.silver} /><circle cx={566} cy={570} r={8} fill={NP.brass} />
        </g>
        {/* 上がり框と廊下の板 (手前) */}
        <rect x={-200} y={860} width={2400} height={30} fill={C.kamachi} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-200} y={890} width={2400} height={400} fill={C.kamachi} opacity={0.85} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-200 + i * 260} y1={890} x2={-200 + i * 260} y2={1200} stroke={C.shoeBoxDark} strokeWidth={4} />)}
        {/* 人 (後ろ姿) */}
        <ellipse cx={PX} cy={PY + 4} rx={80} ry={16} fill={KRP.ink} opacity={0.2} />
        <g transform={raised ? `translate(${PX * 2} 0) scale(-1 1)` : undefined}>
          <Person x={PX} y={PY} s={PS} f={f} cloth="#6F8FB0" clothDark="#4F6C8C" hair="cap"
            pose={raised ? "raise" : f >= 4 ? "point" : "stand"} pointDir={-1} phase={5} />
          <NJ1bBackHead id="nj1b241h" x={PX} y={PY} s={PS} f={f} phase={5} />
        </g>
        {/* 社員証 (ストラップ+名札入れ) */}
        <g transform={`translate(${hx} ${hy}) rotate(${swing})`}>
          <path d={`M -6 0 Q -40 ${drop * 0.6} -6 ${drop} M 6 0 Q 40 ${drop * 0.6} 6 ${drop}`} stroke={C.strap} strokeWidth={9} fill="none" strokeLinecap="round" />
          <rect x={-10} y={drop - 4} width={20} height={18} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
          <g transform={`translate(0 ${drop + 14}) rotate(${lift < 0.5 ? 90 * (1 - lift * 2) : 0})`}>
            <rect x={-46} y={0} width={92} height={124} rx={8} fill={C.glass} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-38} y={8} width={76} height={108} rx={4} fill={C.card} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-38} y={8} width={76} height={20} fill={C.strap} />
            <rect x={-26} y={36} width={32} height={40} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={-10} cy={50} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
            <line x1={-28} y1={90} x2={28} y2={90} stroke={KRP.ink} strokeWidth={5} />
            <line x1={-28} y1={104} x2={10} y2={104} stroke={KRP.grayDark} strokeWidth={4} />
          </g>
        </g>
        {raised && <circle cx={hand[0]} cy={hand[1]} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #242 そこには、見えない糸が、何本もつながっています。
// 格: 山 / seed 4242
// 絵: ★その人が玄関を出ると、名札の結び目から**見えない糸** (金色の点線) が何本も伸びて、家族の手・郵便受け・職場のビル・友だちの家へ、町じゅうに広がっていく (f)。空から見下ろす構図へカメラが引く
// どこ: 玄関を出たところから、空へ引いた町の見下ろし (家・道・川・木・郵便ポスト・職場のビル・友だちの家)
// 演出: 家の前の人の胸の名札から、金色の点線 (見えない糸) が何本ものびて、家族の手・郵便ポスト・職場のビル・友だちの家・よその家々へ。町じゅうが細い光でつながる
// 動き: f0-38 カメラが人のアップから町全体へ引く / f8-40 糸が1本ずつ時間差でのびる / 糸の先が届くとぽっと光る / 結び目が明滅する
const Nm242: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 38));
  const NX = 960, NY = 572, NS = 0.36;
  const knots = { mimi: nafudaKnot("mimi", NX, NY, NS), chobo: nafudaKnot("chobo", NX, NY, NS), shinyo: nafudaKnot("shinyo", NX, NY, NS) };
  const dests: { to: [number, number]; from: [number, number]; c: [number, number] }[] = [
    { to: [794, 478], from: knots.mimi, c: [820, 600] }, // 家族の手
    { to: [380, 640], from: knots.mimi, c: [600, 720] }, // 郵便ポスト
    { to: [1560, 300], from: knots.shinyo, c: [1350, 640] }, // 職場
    { to: [271, 348], from: knots.mimi, c: [560, 500] }, // 友だちの家
    { to: [1760, 640], from: knots.shinyo, c: [1450, 760] },
    { to: [140, 480], from: knots.mimi, c: [400, 520] },
    { to: [1280, 140], from: knots.shinyo, c: [1180, 420] },
    { to: [640, 120], from: knots.chobo, c: [700, 400] },
    { to: [1300, 780], from: knots.chobo, c: [1150, 800] },
  ];
  const tOf = (i: number) => easeOut(seg(f, 8 + i * 2.5, 26 + i * 1.6));
  const house = (x: number, y: number, w: number, roof: string, key: string, lit = false) => (
    <g key={key}>
      <rect x={x - w / 2 + 8} y={y - w * 0.3 + 10} width={w} height={w * 0.7} fill={KRP.ink} opacity={0.18} />
      <rect x={x - w / 2} y={y - w * 0.3} width={w} height={w * 0.7} fill={C.houseW} stroke={KRP.ink} strokeWidth={5} />
      <polygon points={`${x - w / 2 - 10},${y - w * 0.3} ${x},${y - w * 0.75} ${x + w / 2 + 10},${y - w * 0.3}`} fill={roof} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x - w * 0.3} y={y - w * 0.15} width={w * 0.22} height={w * 0.2} fill={lit ? C.townLit : KRP.blueSoft} stroke={KRP.ink} strokeWidth={3} />
      <rect x={x + w * 0.1} y={y + w * 0.05} width={w * 0.18} height={w * 0.35} fill={C.door} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
  return (
    <Frame f={f} seed={4242} bg={C.ground}>
      <g transform={NJ1bCam(cam, 2.6, NX, 560)}>
        {/* 地面 */}
        <rect x={-300} y={-300} width={2600} height={1700} fill={C.ground} />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={rnd(4242, i) * 1920} cy={rnd(4243, i) * 1080} r={14} fill={C.groundDark} opacity={0.5} />
        ))}
        {/* 川 */}
        <path d="M 1500 -100 Q 1680 300 1880 420 Q 2000 500 2100 520" stroke={C.river} strokeWidth={90} fill="none" />
        <path d="M 1500 -100 Q 1680 300 1880 420 Q 2000 500 2100 520" stroke={KRP.white} strokeWidth={6} fill="none" strokeDasharray="30 50" strokeDashoffset={-f * 3} opacity={0.6} />
        {/* 道 */}
        <path d="M -300 590 L 2200 590" stroke={C.roadTop} strokeWidth={70} />
        <path d="M 1100 -100 L 1100 1200" stroke={C.roadTop} strokeWidth={60} />
        <path d="M 540 -100 L 540 1200" stroke={C.roadTop} strokeWidth={50} />
        <path d="M -300 590 L 2200 590" stroke={KRP.white} strokeWidth={5} strokeDasharray="34 30" />
        {/* 木 */}
        {[[220, 760], [700, 300], [1240, 470], [1720, 840], [880, 860], [160, 140], [1440, 120], [1840, 300], [420, 860]].map(([tx, ty], i) => (
          <g key={i}>
            <circle cx={tx + 6} cy={ty + 8} r={44} fill={KRP.ink} opacity={0.15} />
            <circle cx={tx} cy={ty} r={44} fill={i % 2 ? C.tree : C.treeDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={tx - 12} cy={ty - 12} r={16} fill={C.tree} opacity={0.8} />
          </g>
        ))}
        {/* 町の家々 */}
        {house(340, 300, 170, C.roof, "fr", true)}
        {house(140, 480, 120, C.roofB, "h1")}
        {house(1760, 640, 130, C.roof, "h2")}
        {house(1280, 140, 110, C.roofB, "h3")}
        {house(640, 120, 120, C.roof, "h4")}
        {house(1300, 780, 120, C.roofB, "h5")}
        {/* 職場のビル */}
        <g>
          <rect x={1488} y={130} width={160} height={400} fill={KRP.ink} opacity={0.18} />
          <rect x={1480} y={110} width={160} height={400} fill={C.bldg} stroke={KRP.ink} strokeWidth={6} />
          <polygon points="1480,110 1520,70 1680,70 1640,110" fill={C.bldgDark} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="1640,110 1680,70 1680,470 1640,510" fill={C.bldgDark} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 7 }, (_, r) => [0, 1, 2].map((c) => (
            <rect key={`${r}-${c}`} x={1498 + c * 46} y={134 + r * 52} width={30} height={30} fill={(r + c) % 3 ? KRP.blueSoft : C.townLit} stroke={KRP.ink} strokeWidth={2.5} />
          )))}
        </g>
        {/* 郵便ポスト */}
        <g transform="translate(380 660)">
          <rect x={-30} y={-10} width={60} height={60} fill={KRP.ink} opacity={0.2} />
          <rect x={-32} y={-90} width={64} height={110} rx={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-90} rx={36} ry={14} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-20} y={-60} width={40} height={8} rx={3} fill={KRP.ink} />
        </g>
        {/* 主人公の家 */}
        {house(NX, 400, 220, C.roof, "me", true)}
        {/* 家族 (窓のそばで手をふる) */}
        <Person x={770} y={560} s={0.36} f={f} cloth={KRP.orange} clothDark="#B86E2A" pose="raise" face="smile" phase={6} />
        {/* 友だち */}
        <Person x={250} y={420} s={0.32} f={f} cloth={KRP.green} clothDark="#5A9456" pose="raise" face="smile" phase={7} />
        {/* 見えない糸 (金色の点線) */}
        {dests.map((d, i) => (
          <g key={i}>
            <NJ1bDots a={d.from} c={d.c} b={d.to} t={tOf(i)} n={20} r={6} f={f} phase={i} />
            {tOf(i) >= 1 && <circle cx={d.to[0]} cy={d.to[1]} r={26 + 4 * Math.sin(f / 4 + i)} fill={NP.glow} opacity={0.55} />}
          </g>
        ))}
        {/* 玄関を出た人 */}
        <ellipse cx={NX} cy={622} rx={50} ry={10} fill={KRP.ink} opacity={0.25} />
        <Person x={NX} y={620} s={0.55} f={f} cloth="#6F8FB0" clothDark="#4F6C8C" face="smile" gaze={[0, 4]} phase={5} />
        {/* 首から下がる名札 (ストラップ) */}
        <path d={`M ${NX - 16} ${620 - 158 * 0.55} L ${NX - 44} ${NY - 30} M ${NX + 16} ${620 - 158 * 0.55} L ${NX + 44} ${NY - 30}`} stroke={C.strap} strokeWidth={6} strokeLinecap="round" />
        <circle cx={NX} cy={NY} r={90} fill={NP.glow} opacity={0.25 + 0.1 * Math.sin(f / 5)} />
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" hang={false} f={f}
          knots={{ mimi: 0.6 + 0.4 * Math.sin(f / 5), chobo: 0.6 + 0.4 * Math.sin(f / 5 + 2), shinyo: 0.6 + 0.4 * Math.sin(f / 5 + 4) }} />
        {/* 札 */}
        <TagPlate x={770} y={612} text="家族" size={32} t={seg(f, 28, 34)} />
        <TagPlate x={380} y={720} text="郵便" size={32} t={seg(f, 30, 36)} />
        <TagPlate x={1560} y={560} text="職場" size={32} t={seg(f, 32, 38)} />
        <TagPlate x={410} y={448} text="友だち" size={32} t={seg(f, 34, 40)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #243 なお、この動画のあいだに、どこかで名前を呼ばれて振り向いたあなた。
// 格: 並 / seed 4243
// 絵: 夜の部屋でこの動画を観ている人の後ろ姿 (画面は光るだけ)。台所の方から名前を呼ぶ声の吹き出し (中身は「○○」)。その人が f で振り返る
// どこ: 夜の居間。テレビの青い光だけが灯る部屋。右に台所の入口 (あたたかい明かり)
// 演出: ソファでこの動画を観ている人の後ろ姿。台所から「○○」と呼ぶ声の吹き出しが飛んで、その人がくるっと振り返る
// 動き: f0-40 カメラが少し寄る / テレビの光がちらつく / f10-20 呼ぶ声が出る (音の波) / f22-32 振り返る / 湯気がのぼる
const Nm243: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const call = seg(f, 10, 20);
  const turn = easeInOut(seg(f, 22, 32));
  const tv = 0.7 + 0.12 * Math.sin(f * 1.3) + 0.06 * Math.sin(f * 3.7);
  const PX = 860, PY = 900, PS = 1.25;
  return (
    <Frame f={f} seed={4243} dark bg={C.night}>
      <g transform={NJ1bCam(cam, 0.94, 1000, 520)}>
        {/* 壁と床 */}
        <rect x={-200} y={-200} width={2400} height={1500} fill={C.nightWall} />
        <rect x={-200} y={640} width={2400} height={700} fill={C.nightFloor} />
        <rect x={-200} y={630} width={2400} height={16} fill={C.night} />
        {/* 左の窓 (夜空と月) */}
        <rect x={80} y={120} width={300} height={360} fill={C.night} stroke={KRP.ink} strokeWidth={8} />
        <line x1={230} y1={120} x2={230} y2={480} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={300} cy={200} r={34} fill={NP.glowCore} opacity={0.9} />
        {[[140, 180], [180, 300], [330, 380]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={3} fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 7 + i)} />)}
        <path d="M 60 110 L 60 520 Q 110 500 120 110 Z" fill={C.sofaDark} stroke={KRP.ink} strokeWidth={5} />
        {/* テレビ台とテレビ */}
        <rect x={620} y={520} width={680} height={120} fill={C.shelfDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={650} y={550} width={180} height={60} fill={C.shelf} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1090} y={550} width={180} height={60} fill={C.shelf} stroke={KRP.ink} strokeWidth={4} />
        <rect x={680} y={200} width={560} height={320} rx={10} fill={KRP.ink} stroke={KRP.ink} strokeWidth={6} />
        <rect x={700} y={218} width={520} height={284} fill={C.tvGlow} opacity={tv} />
        <rect x={700} y={218} width={520} height={284} fill={KRP.white} opacity={0.2 * tv} />
        {/* テレビの光が部屋を照らす */}
        <polygon points="700,500 1220,500 1700,1100 200,1100" fill={C.tvGlow} opacity={0.12 * tv} />
        <ellipse cx={960} cy={360} rx={520} ry={300} fill={C.tvGlow} opacity={0.14 * tv} />
        {/* 観葉植物 */}
        <g transform="translate(1380 640)">
          <path d="M -40 0 L -30 -80 L 30 -80 L 40 0 Z" fill={C.brick} stroke={KRP.ink} strokeWidth={5} />
          {[-2, -1, 0, 1, 2].map((k) => <ellipse key={k} cx={k * 26} cy={-150 + Math.abs(k) * 20} rx={18} ry={56} fill={C.forestDark} stroke={KRP.ink} strokeWidth={4} transform={`rotate(${k * 22} ${k * 26} -80)`} />)}
        </g>
        {/* 台所の入口 (右・あたたかい明かり) */}
        <rect x={1520} y={160} width={330} height={480} fill={C.kitchen} stroke={KRP.ink} strokeWidth={8} />
        <polygon points="1520,640 1850,640 2000,1100 1400,1100" fill={C.kitchen} opacity={0.25} />
        <rect x={1560} y={300} width={250} height={30} fill={C.shoeBoxDark} opacity={0.6} />
        <g transform="translate(1700 300)">
          <path d="M -50 0 L -40 -50 L 40 -50 L 50 0 Z" fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${-20 + i * 20} -60 q 10 -20 0 -40 q -10 -20 0 -40`} stroke={KRP.white} strokeWidth={5} fill="none"
            opacity={0.5} transform={`translate(0 ${-((f * 1.2 + i * 14) % 30)})`} />)}
        </g>
        {/* 呼ぶ声 */}
        {call > 0 && (
          <g>
            <g transform={`translate(1480 250) scale(${pop(call)})`}>
              <rect x={-120} y={-60} width={240} height={120} rx={56} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
              <path d="M 70 50 L 120 100 L 30 58 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
              <rect x={40} y={46} width={40} height={14} fill={KRP.white} />
              <text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={KRP.ink}>○○</text>
            </g>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${1340 - i * 50} ${360 + i * 20} q -30 50 0 100`} stroke={C.kitchen} strokeWidth={8} fill="none" strokeLinecap="round"
                opacity={clamp01(call * 2 - i * 0.4) * (0.5 + 0.5 * Math.sin(f / 3 - i))} />
            ))}
          </g>
        )}
        {/* 人 (ソファに座って観ている → 振り返る) */}
        <Person x={PX} y={PY} s={PS} f={f} cloth={C.hoodie} clothDark={C.hoodieDark} hair="cap"
          face={turn > 0.36 ? "surprised" : "normal"} gaze={[12, -4]} lean={turn * 9} phase={8} />
        <NJ1bBackHead id="nj1b243h" x={PX} y={PY} s={PS} f={f} phase={8} turn={turn} dir={1} lean={turn * 9} />
        {/* テレビの光の縁取り */}
        <circle cx={PX} cy={PY - 228 * PS} r={64 * PS + 4} fill="none" stroke={C.tvGlow} strokeWidth={4} opacity={0.5 * (1 - turn)} />
        {/* ソファの背もたれ (手前) */}
        <rect x={420} y={780} width={940} height={360} rx={60} fill={C.sofa} stroke={KRP.ink} strokeWidth={8} />
        <rect x={360} y={740} width={120} height={400} rx={50} fill={C.sofaDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1300} y={740} width={120} height={400} rx={50} fill={C.sofaDark} stroke={KRP.ink} strokeWidth={7} />
        <line x1={890} y1={800} x2={890} y2={1080} stroke={C.sofaDark} strokeWidth={6} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #244 それはたぶん、3人に1人の側です。
// 格: 山 / seed 4244
// 絵: ★最後の一笑い。振り返った人の頭の上に、#207 の「3人に1人」の図 (人形3つのうち1つが振り向く) がぽんと出て、振り向いた人形に本人の顔が重なる。明るい色。名札が小さく揺れて光る。※この最後の文は、書き出しのときに結論カードに置きかわらないよう親が設定する
// どこ: さっきの居間。明かりがついて明るくなった (同じ部屋の続き)
// 演出: 振り返った人の頭の上に「3人に1人」の図がぽんと出る。3つの人形のうち右の1つだけが振り向き、その顔はこの人と同じ服・同じ笑顔。壁の名札が小さく揺れて光る。台所からおたまが手をふる
// 動き: f0-10 明かりがつく / f6-16 図がぽんと出る / f18-26 右の人形が振り向く / f24-32 金の輪で囲む / 名札の光が明滅 / 本人がくすっと笑ってゆれる
const Nm244: React.FC<{ f: number }> = ({ f }) => {
  const light = easeOut(seg(f, 0, 10));
  const panel = seg(f, 6, 16);
  const turn = easeInOut(seg(f, 18, 26));
  const ring = seg(f, 24, 32);
  const cam = easeInOut(seg(f, 0, 40));
  const PX = 960, PY = 980, PS = 1.25;
  const giggle = Math.abs(Math.sin(f / 5)) * 4 * seg(f, 26, 32);
  const dolls = [700, 960, 1220];
  return (
    <Frame f={f} seed={4244} bg={C.room}>
      <g transform={NJ1bCam(cam, 1.06, 960, 560)}>
        {/* 明るくなった部屋 */}
        <rect x={-200} y={-200} width={2400} height={1500} fill={C.room} />
        <rect x={-200} y={-200} width={2400} height={1500} fill={C.nightWall} opacity={0.6 * (1 - light)} />
        <rect x={-200} y={700} width={2400} height={600} fill={C.roomFloor} />
        {/* 天井の明かり */}
        <line x1={960} y1={-200} x2={960} y2={-10} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 880 -10 L 1040 -10 L 1000 40 L 920 40 Z" fill={C.lamp} stroke={KRP.ink} strokeWidth={5} />
        <polygon points="900,40 1020,40 1500,700 420,700" fill={C.lamp} opacity={0.18 * light} />
        {/* 窓 (左・夜) */}
        <rect x={60} y={140} width={220} height={300} fill={C.night} stroke={KRP.ink} strokeWidth={8} />
        <line x1={170} y1={140} x2={170} y2={440} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={230} cy={210} r={26} fill={NP.glowCore} />
        {/* 壁の名札 (フックに吊るして、揺れて光る) */}
        <circle cx={420} cy={190} r={10} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={420} cy={300} r={80 + 8 * Math.sin(f / 4)} fill={NP.glow} opacity={0.3 + 0.15 * Math.sin(f / 4)} />
        <Nafuda x={420} y={300} s={0.42} text="山田 花子" f={f * 2.2} knots={{ mimi: 0.7 + 0.3 * Math.sin(f / 4), chobo: 0.7 + 0.3 * Math.sin(f / 4 + 2), shinyo: 0.7 + 0.3 * Math.sin(f / 4 + 4) }} />
        {/* 台所の入口 (右): おたまが手をふる */}
        <rect x={1560} y={160} width={300} height={540} fill={C.kitchen} stroke={KRP.ink} strokeWidth={8} />
        <g transform={`translate(1580 420) rotate(${Math.sin(f / 4) * 14})`}>
          <rect x={-10} y={-14} width={90} height={28} rx={14} fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-12} cy={0} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-20} y1={0} x2={-60} y2={-90} stroke={KRP.silver} strokeWidth={9} strokeLinecap="round" />
          <line x1={-20} y1={0} x2={-60} y2={-90} stroke={KRP.ink} strokeWidth={2} />
          <path d="M -90 -110 a 30 22 0 0 0 60 0 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} transform="rotate(30 -60 -110)" />
        </g>
        {/* 「3人に1人」の図 (頭の上にぽんと出る) */}
        {panel > 0 && (
          <g transform={`translate(960 330) scale(${pop(panel)}) translate(-960 -330)`}>
            {/* 頭とつなぐ小さな丸 */}
            {[0, 1, 2].map((i) => <circle key={i} cx={960 + i * 14} cy={560 - i * 40} r={10 + i * 5} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
            <rect x={530} y={60} width={860} height={440} rx={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
            <rect x={560} y={90} width={800} height={300} rx={20} fill={C.board} stroke={KRP.ink} strokeWidth={4} />
            <rect x={560} y={330} width={800} height={60} fill={C.boardDark} opacity={0.6} />
            {/* 呼ぶ声 (左から) */}
            <g stroke={C.inkRed} strokeWidth={6} fill="none" strokeLinecap="round">
              {[0, 1, 2].map((i) => <path key={i} d={`M ${590 + i * 18} ${170 + i * 4} q 14 30 0 60`} opacity={0.5 + 0.5 * Math.sin(f / 3 - i)} />)}
            </g>
            {/* 金の輪 */}
            {ring > 0 && <circle cx={dolls[2]} cy={250} r={110 * pop(ring)} fill={NP.glow} opacity={0.35} stroke={NP.brass} strokeWidth={8} />}
            {dolls.map((dx, i) => {
              const me = i === 2;
              const tt = me ? turn : 0;
              return (
                <g key={i}>
                  <Person x={dx} y={360} s={0.5} f={f} cloth={me ? C.hoodie : C.dollCloth} clothDark={me ? C.hoodieDark : C.dollDark}
                    hair="cap" face={me ? "joy" : "normal"} lean={me ? -tt * 5 : 0} phase={9 + i} />
                  <NJ1bBackHead id={`nj1b244d${i}`} x={dx} y={360} s={0.5} f={f} phase={9 + i} turn={tt} dir={-1} lean={me ? -tt * 5 : 0} />
                </g>
              );
            })}
            <TagPlate x={960} y={448} text="3人に1人" size={44} t={seg(f, 14, 22)} color={C.inkRed} />
            {/* きらきら */}
            {ring > 0.5 && [0, 1, 2, 3].map((i) => {
              const a = (i / 4) * Math.PI * 2 + f / 10;
              return <path key={i} d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z" fill={NP.glow} stroke={KRP.ink} strokeWidth={2.5}
                transform={`translate(${dolls[2] + Math.cos(a) * 130} ${250 + Math.sin(a) * 110})`} />;
            })}
          </g>
        )}
        {/* 本人 (振り返ったまま、くすっと笑う) */}
        <g transform={`translate(0 ${-giggle})`}>
          <Person x={PX} y={PY} s={PS} f={f} cloth={C.hoodie} clothDark={C.hoodieDark} hair="cap"
            face={f >= 26 ? "joy" : "smile"} gaze={[0, -6]} lean={3} phase={8} />
        </g>
        {/* ソファの背もたれ (手前) */}
        <rect x={500} y={840} width={920} height={300} rx={60} fill={C.sofa} stroke={KRP.ink} strokeWidth={8} />
        <rect x={440} y={800} width={120} height={340} rx={50} fill={C.sofaDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={1360} y={800} width={120} height={340} rx={50} fill={C.sofaDark} stroke={KRP.ink} strokeWidth={7} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_234: (f) => <Nm234 f={f} />,
  nm_235: (f) => <Nm235 f={f} />,
  nm_236: (f) => <Nm236 f={f} />,
  nm_237: (f) => <Nm237 f={f} />,
  nm_238: (f) => <Nm238 f={f} />,
  nm_239: (f) => <Nm239 f={f} />,
  nm_240: (f) => <Nm240 f={f} />,
  nm_241: (f) => <Nm241 f={f} />,
  nm_242: (f) => <Nm242 f={f} />,
  nm_243: (f) => <Nm243 f={f} />,
  nm_244: (f) => <Nm244 f={f} />,
};

export const NM_J1B_MOTIFS: string[] = [
  "nm_234", // #234
  "nm_235", // #235
  "nm_236", // #236
  "nm_237", // #237
  "nm_238", // #238
  "nm_239", // #239
  "nm_240", // #240
  "nm_241", // #241
  "nm_242", // #242
  "nm_243", // #243
  "nm_244", // #244
];

export const namaeJ1bScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
