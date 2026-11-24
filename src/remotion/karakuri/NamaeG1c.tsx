// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#152〜#159 (8文)
// 台本: docs/namae-script-v1.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで8枚。motif 名は nm_文番号3桁。seed は 4000+文番号。
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
  skin: "#F2D2B6",
  skinDark: "#D9AE8E",
  // 役所 (1993年)
  wall93: "#DCD6C4",
  wall93Dark: "#C2BAA2",
  wainscot: "#A99A78",
  counterTop: "#CDB98E",
  counterTopDark: "#B39E72",
  counterFront: "#8C7350",
  counterDark: "#6E5A3E",
  crt: "#DAD3BD",
  crtDark: "#ABA48E",
  crtScreen: "#22382C",
  crtGlow: "#86DDA6",
  steel: "#A4ACB0",
  steelDark: "#7F888D",
  formPaper: "#FBF8EF",
  formLine: "#B5735A",
  scribble: "#8C8478",
  pen: "#3E62A8",
  blind: "#E9E3D0",
  sky: "#BFD9EA",
  leaf: "#6E9E5A",
  leafDark: "#4E7A3E",
  pot: "#B8673E",
  // 人
  shirt: "#E8E4DA",
  pants: "#4A4E58",
  vest: "#2F3B5C",
  tie: "#8C3A3A",
  father: "#7A8F5E",
  fatherDark: "#5E7046",
  mother: "#C9847A",
  motherDark: "#A8665C",
  kidSleeve: "#F2CE4C",
  kidSleeveDark: "#CFA92E",
  navy: "#2F3B5C",
  navyDark: "#1F2840",
  judge: "#2B2B33",
  judgeDark: "#1C1C22",
  // 机・木
  desk: "#B98D5C",
  deskDark: "#94693F",
  board: "#7A5534",
  boardDark: "#5A3D24",
  // 裁判所
  court: "#7B5A3A",
  courtDark: "#5A3F26",
  courtPanel: "#8E6A46",
  // 印
  sealRed: "#C8372A",
  sealBlue: "#2E5FA8",
  // 部屋 (#157〜#159)
  homeWall: "#F1E1C8",
  homeDot: "#E3C9A4",
  rug: "#C9A3B8",
  rugDark: "#A7809A",
  tatami: "#CFC08A",
  tatamiDark: "#B3A46E",
  cloth: "#6E4A8C",
  clothDark: "#4F3466",
  night: "#2A2230",
  nightWall: "#3D2F2A",
  nightWood: "#5A4030",
  lantern: "#F2A94A",
  koban: "#E3BE4A",
  kobanDark: "#B08A2A",
  dollar: "#5E9E6A",
  dollarDark: "#3E7A4A",
  ledger: "#3F5E96",
  ledgerDark: "#2C4474",
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
const D2R = Math.PI / 180;

/** 手 (袖つき)。原点が手のひら、+x が指先の向き。袖は -x 側へ伸びる */
const NG1cHand: React.FC<{
  x: number; y: number; rot?: number; s?: number; sleeve: string; sleeveDark: string;
  cuff?: string; buttons?: boolean; open?: number; flip?: boolean;
}> = ({ x, y, rot = 0, s = 1, sleeve, sleeveDark, cuff, buttons = false, open = 0, flip = false }) => {
  const len = lerp(34, 66, clamp01(open));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${flip ? -s : s})`}>
      {/* 袖 */}
      <rect x={-600} y={-52} width={540} height={104} rx={26} fill={sleeve} stroke={C.ink} strokeWidth={6} />
      <path d="M -580 30 L -110 30" stroke={sleeveDark} strokeWidth={12} opacity={0.55} strokeLinecap="round" />
      <path d="M -420 -36 q 30 20 0 46 M -260 -36 q 30 20 0 46" stroke={sleeveDark} strokeWidth={4} fill="none" opacity={0.6} />
      {cuff && <rect x={-104} y={-56} width={46} height={112} rx={12} fill={cuff} stroke={C.ink} strokeWidth={5} />}
      {buttons && [-22, 22].map((by) => (
        <circle key={by} cx={-128} cy={by} r={9} fill={NP.brass} stroke={C.ink} strokeWidth={3.5} />
      ))}
      {/* 手首 */}
      <rect x={-66} y={-32} width={48} height={64} rx={14} fill={C.skin} stroke={C.ink} strokeWidth={5} />
      {/* 手のひら */}
      <ellipse cx={8} cy={4} rx={50} ry={42} fill={C.skin} stroke={C.ink} strokeWidth={5} />
      <path d="M -10 22 q 16 8 34 0" stroke={C.skinDark} strokeWidth={4} fill="none" />
      {/* 指 */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30} y={-32 + i * 19} width={len - i * 3} height={19} rx={9.5}
          fill={C.skin} stroke={C.ink} strokeWidth={4} />
      ))}
      {/* 親指 */}
      <ellipse cx={24} cy={-42} rx={30} ry={14} transform="rotate(-18 24 -42)" fill={C.skin} stroke={C.ink} strokeWidth={4.5} />
    </g>
  );
};

/** 役所の窓口の人 (白いシャツ + 紺のベストを Person の上に重ねる) */
const NG1cClerk: React.FC<{
  x: number; y: number; s: number; f: number; face: "normal" | "worried" | "surprised" | "smile" | "joy" | "sad";
  lean?: number; phase?: number; gaze?: [number, number];
}> = ({ x, y, s, f, face, lean = 0, phase = 0, gaze = [0, 0] }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} face={face} cloth={C.shirt} clothDark={C.pants} hair="cap" lean={lean} phase={phase} gaze={gaze} />
      <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
        <path d="M 0 -150 L -9 -132 L 0 -100 L 9 -132 Z" fill={C.tie} stroke={C.ink} strokeWidth={3} />
        <path d="M -58 -146 Q -58 -160 -44 -160 L -20 -160 L 0 -104 L 0 -52 L -58 -52 Z" fill={C.vest} stroke={C.ink} strokeWidth={4} />
        <path d="M 58 -146 Q 58 -160 44 -160 L 20 -160 L 0 -104 L 0 -52 L 58 -52 Z" fill={C.vest} stroke={C.ink} strokeWidth={4} />
        {[-88, -72].map((by) => <circle key={by} cx={0} cy={by} r={4} fill={NP.brass} stroke={C.ink} strokeWidth={2} />)}
      </g>
    </g>
  );
};

/** 汗のしずく */
const NG1cSweat: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const k = clamp01(t);
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + k * 14}) scale(${s * pop(k)})`}>
      <path d="M 0 -22 Q 14 0 10 10 A 11 11 0 0 1 -10 10 Q -14 0 0 -22 Z" fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} />
      <circle cx={-3} cy={4} r={3} fill={KRP.white} />
    </g>
  );
};

/** ハンコの印影 (SVG)。t で上から押される */
const NG1cSeal: React.FC<{
  x: number; y: number; text: string; color: string; t: number; size?: number; rot?: number; round?: boolean;
}> = ({ x, y, text, color, t, size = 44, rot = -8, round = false }) => {
  const k = clamp01(t);
  if (k <= 0) return null;
  const sc = 1 + (1 - easeOut(k)) * 0.7;
  const w = round ? size * 2.6 : text.length * size + 50;
  const h = round ? size * 2.6 : size * 1.7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={Math.min(1, k * 1.6) * 0.9}>
      {round ? (
        <g>
          <circle r={w / 2} fill="none" stroke={color} strokeWidth={8} />
          <circle r={w / 2 - 11} fill="none" stroke={color} strokeWidth={3} />
        </g>
      ) : (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill="none" stroke={color} strokeWidth={8} />
          <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} rx={6} fill="none" stroke={color} strokeWidth={3} />
        </g>
      )}
      <text y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={3}>{text}</text>
      {/* かすれ */}
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={(rnd(77, i) - 0.5) * w * 0.9} cy={(rnd(78, i) - 0.5) * h * 0.8} r={2 + rnd(79, i) * 4} fill={C.formPaper} opacity={0.8} />
      ))}
    </g>
  );
};

/** 出生届の用紙 (640x440)。名前の欄の中心は (60,-40)。children は用紙の座標で描く */
const NG1cForm: React.FC<{ x: number; y: number; s?: number; rot?: number; children?: React.ReactNode }> = ({
  x, y, s = 1, rot = 0, children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-312} y={-208} width={640} height={440} rx={6} fill={C.ink} opacity={0.16} />
    <rect x={-320} y={-220} width={640} height={440} rx={6} fill={C.formPaper} stroke={C.ink} strokeWidth={6} />
    <rect x={-300} y={-200} width={600} height={400} fill="none" stroke={C.formLine} strokeWidth={3} />
    <text x={-284} y={-140} fontFamily={FONT} fontWeight={900} fontSize={48} fill={C.formLine}>出生届</text>
    {/* 受付の欄 */}
    <rect x={150} y={-200} width={150} height={84} fill="none" stroke={C.formLine} strokeWidth={3} />
    <text x={162} y={-178} fontFamily={FONT} fontWeight={800} fontSize={18} fill={C.formLine}>受付</text>
    {/* 子の氏名 */}
    <rect x={-300} y={-110} width={120} height={140} fill={C.formLine} opacity={0.12} />
    <rect x={-300} y={-110} width={600} height={140} fill="none" stroke={C.formLine} strokeWidth={3} />
    <line x1={-180} y1={-110} x2={-180} y2={30} stroke={C.formLine} strokeWidth={3} />
    <text x={-240} y={-48} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.formLine}>子の</text>
    <text x={-240} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.formLine}>氏名</text>
    {/* よみかた */}
    <rect x={-300} y={30} width={600} height={50} fill="none" stroke={C.formLine} strokeWidth={3} />
    <line x1={-180} y1={30} x2={-180} y2={200} stroke={C.formLine} strokeWidth={3} />
    <text x={-240} y={63} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.formLine}>よみかた</text>
    <line x1={-160} y1={64} x2={280} y2={64} stroke={C.formLine} strokeWidth={2} strokeDasharray="8 8" />
    {/* 生年月日 */}
    <rect x={-300} y={80} width={600} height={60} fill="none" stroke={C.formLine} strokeWidth={3} />
    <text x={-240} y={118} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.formLine}>生年月日</text>
    {[-100, 40, 180].map((bx, i) => (
      <g key={i}>
        <rect x={bx} y={92} width={70} height={36} fill="none" stroke={C.formLine} strokeWidth={2} />
        <text x={bx + 86} y={120} fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.formLine}>{["年", "月", "日"][i]}</text>
      </g>
    ))}
    {/* 父母 */}
    <text x={-240} y={178} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.formLine}>父母</text>
    <path d="M -150 166 q 12 -14 24 0 t 24 0 t 24 0 t 24 0 t 24 0 M 30 166 q 12 -14 24 0 t 24 0 t 24 0 t 24 0"
      stroke={C.scribble} strokeWidth={4} fill="none" strokeLinecap="round" />
    {children}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #152 名前は、いまも、国の許可なしには変えられないのです。
// 格: 並 / seed 4152
// どこ: 現在の役所の奥の資料室。壁の掛け板に名札、右の棚に戸籍の帳簿。名札の下の結び目から藍の糸が帳簿へ伸び、糸の真ん中に第5章の錠前
// 演出: 右下から黒い袖の手 (家庭裁判所) が、赤い「裁」の印がついた鍵をそっと錠前の鍵穴へ。差しこんだところで止まる (まだ回さない)
// 動き: カメラがゆっくり錠前へ寄る。鍵が f6〜38 で近づいて差しこまれ、最後に小さく光る。名札と耳の糸はゆれる
const Nm152: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 40));
  const sc = 1 + 0.14 * cam;
  const NX = 760, NY = 330, NS = 1.3;
  const kb = nafudaKnot("chobo", NX, NY, NS);
  const end: [number, number] = [1560, 470];
  const sag = 70;
  const mx = (kb[0] + end[0]) / 2, my = (kb[1] + end[1]) / 2 + sag;
  const lx = 0.25 * kb[0] + 0.5 * mx + 0.25 * end[0];
  const ly = 0.25 * kb[1] + 0.5 * my + 0.25 * end[1];
  const hole: [number, number] = [lx, ly + 18];
  const slide = easeOut(seg(f, 6, 32));
  const last = easeInOut(seg(f, 32, 38));
  const dist = lerp(280, 26, slide) - 26 * last;
  const ang = 30;
  const ux = Math.cos(ang * D2R), uy = Math.sin(ang * D2R);
  const tremble = f > 38 ? Math.sin(f * 1.1) * 0.5 : 0;
  const glint = seg(f, 38, 42);
  return (
    <Frame f={f} seed={4152}>
      <g transform={`translate(${1060} ${480}) scale(${sc}) translate(${-1060} ${-480})`}>
        {/* 資料室の壁 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.wall93} />
        <rect x={-40} y={760} width={2000} height={400} fill={C.wainscot} />
        <line x1={-40} y1={760} x2={1960} y2={760} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 170} y1={770} x2={i * 170} y2={1100} stroke={C.counterDark} strokeWidth={4} opacity={0.5} />
        ))}
        {/* 左: スチールの書類棚 */}
        <g>
          <rect x={60} y={520} width={300} height={600} rx={6} fill={C.steel} stroke={C.ink} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={82} y={546 + i * 150} width={256} height={128} rx={6} fill={KRP.silver} stroke={C.ink} strokeWidth={4} />
              <rect x={170} y={566 + i * 150} width={80} height={30} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
              <rect x={180} y={614 + i * 150} width={60} height={14} rx={7} fill={C.steelDark} stroke={C.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
        {/* 壁の時計 */}
        <g transform="translate(250 290)">
          <circle r={74} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={Math.cos(i * 30 * D2R) * 58} y1={Math.sin(i * 30 * D2R) * 58} x2={Math.cos(i * 30 * D2R) * 66} y2={Math.sin(i * 30 * D2R) * 66} stroke={C.ink} strokeWidth={4} />
          ))}
          <line x1={0} y1={0} x2={30} y2={-22} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.cos((-90 + f * 6) * D2R) * 54} y2={Math.sin((-90 + f * 6) * D2R) * 54} stroke={KRP.red} strokeWidth={3} />
          <circle r={7} fill={C.ink} />
        </g>
        {/* 名札を掛ける板とフック */}
        <rect x={470} y={90} width={580} height={70} rx={10} fill={C.board} stroke={C.ink} strokeWidth={6} />
        <path d="M 490 112 q 260 -10 540 0 M 490 138 q 260 8 540 0" stroke={C.boardDark} strokeWidth={3} fill="none" />
        <path d={`M ${NX} 150 L ${NX} 120 Q ${NX} 104 ${NX + 14} 104`} stroke={NP.brassDark} strokeWidth={9} fill="none" strokeLinecap="round" />
        {/* 右: 帳簿の棚 */}
        <g>
          <rect x={1360} y={300} width={460} height={24} fill={C.board} stroke={C.ink} strokeWidth={5} />
          <rect x={1360} y={520} width={460} height={26} fill={C.board} stroke={C.ink} strokeWidth={5} />
          <rect x={1372} y={546} width={20} height={240} fill={C.boardDark} stroke={C.ink} strokeWidth={4} />
          <rect x={1788} y={546} width={20} height={240} fill={C.boardDark} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 7 }, (_, i) => {
            const bx = 1380 + i * 62;
            const tall = 170 + (i % 3) * 14;
            const main = i === 3;
            return (
              <g key={i}>
                <rect x={bx} y={520 - tall} width={54} height={tall} rx={4} fill={i % 2 ? C.ledgerDark : C.ledger} stroke={C.ink} strokeWidth={4} />
                <rect x={bx + 8} y={520 - tall + 22} width={38} height={60} rx={3} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />
                {main && <text x={bx + 27} y={520 - tall + 46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={18} fill={C.ink}>戸</text>}
                {main && <text x={bx + 27} y={520 - tall + 70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={18} fill={C.ink}>籍</text>}
                <line x1={bx + 6} y1={500} x2={bx + 48} y2={500} stroke={NP.brass} strokeWidth={4} />
              </g>
            );
          })}
          <circle cx={end[0]} cy={end[1]} r={14} fill={NP.brass} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* 耳の糸 (結び直されている) */}
        <Ito from={nafudaKnot("mimi", NX, NY, NS)} to={[-40, 600]} kind="mimi" sag={60} f={f} />
        {/* 帳簿の糸 + 第5章の錠前 */}
        <Ito from={kb} to={end} kind="chobo" sag={sag} lock={1} f={0} />
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" knots={{ mimi: 1, chobo: 1 }} f={f} />
        {glint > 0 && <circle cx={hole[0]} cy={hole[1]} r={30 + glint * 30} fill={NP.glow} opacity={0.35 * (1 - glint * 0.5)} />}
        {/* 鍵 (先端が鍵穴。+x 方向が持ち手) */}
        <g transform={`translate(${hole[0] + ux * dist} ${hole[1] + uy * dist}) rotate(${ang + tremble})`}>
          <rect x={0} y={-8} width={150} height={16} rx={5} fill={NP.brass} stroke={C.ink} strokeWidth={4} />
          <path d="M 12 8 L 12 26 L 26 26 L 26 16 L 40 16 L 40 30 L 54 30 L 54 8 Z" fill={NP.brass} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <rect x={140} y={-16} width={30} height={32} rx={6} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />
          <circle cx={222} cy={0} r={56} fill={NP.brass} stroke={C.ink} strokeWidth={6} />
          <circle cx={222} cy={0} r={40} fill={C.sealRed} stroke={C.ink} strokeWidth={4} />
          <circle cx={222} cy={0} r={32} fill="none" stroke={KRP.white} strokeWidth={3} opacity={0.8} />
          <text x={222} y={15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.white}
            transform={`rotate(${-ang} 222 0)`}>裁</text>
        </g>
        {/* 鍵を持つ黒い袖の手 */}
        <NG1cHand x={hole[0] + ux * (dist + 292)} y={hole[1] + uy * (dist + 292)} rot={ang + 180 + tremble} s={0.95}
          sleeve={C.judge} sleeveDark={C.judgeDark} cuff={KRP.white} flip />
        {glint > 0 && glint < 1 && (
          <g stroke={NP.glow} strokeWidth={5} strokeLinecap="round" opacity={1 - glint}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <line key={a} x1={hole[0] + Math.cos(a * D2R) * 24} y1={hole[1] + Math.sin(a * D2R) * 24}
                x2={hole[0] + Math.cos(a * D2R) * (40 + glint * 20)} y2={hole[1] + Math.sin(a * D2R) * (40 + glint * 20)} />
            ))}
          </g>
        )}
      </g>
      <TagPlate x={1690} y={110} text="現在" size={40} t={seg(f, 0, 8)} />
      <TagPlate x={1130} y={770} text="家庭裁判所" size={36} t={seg(f, 14, 24)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #153 1993年には、ある親が、子どもに「悪魔」と名づけようとしました。
// 格: 山 / seed 4153
// どこ: 1993年 (平成5年) の市役所の戸籍の窓口。客の側から見下ろしたカウンター。奥にブラウン管の端末・壁の時計・カレンダー・番号札の機械・天井の蛍光灯
// 演出: カウンターの出生届の「子の氏名」の欄に、ペンを持つ手 (親の顔と体は見せない) が「悪」「魔」と大きく書いていく。奥の窓口の人が目を丸くして身を乗り出す
// 動き: カメラがゆっくり用紙へ寄る。f4〜20で「悪」、f22〜38で「魔」が上から書かれる。f34から窓口の人が驚く。端末の画面のカーソルが点滅
const Nm153: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + 0.07 * cam;
  const p0 = seg(f, 4, 20);
  const p1 = seg(f, 22, 38);
  const chars = [{ ch: "悪", cx: 0, p: p0 }, { ch: "魔", cx: 124, p: p1 }];
  let tx = 170, ty = 6;
  if (f < 4) { tx = -40; ty = -110; }
  else if (f < 21) { tx = Math.sin(p0 * Math.PI * 7) * 40; ty = -100 + p0 * 112; }
  else if (f < 22) { tx = 70; ty = -100; }
  else if (f < 39) { tx = 124 + Math.sin(p1 * Math.PI * 8) * 40; ty = -100 + p1 * 112; }
  else { tx = 190 + seg(f, 39, 42) * 20; ty = 0 - seg(f, 39, 42) * 20; }
  const shock = seg(f, 34, 40);
  const blinkCur = Math.floor(f / 6) % 2 === 0;
  return (
    <Frame f={f} seed={4153}>
      <defs>
        {chars.map((c, i) => (
          <clipPath key={i} id={`ng1c153c${i}`}>
            <rect x={c.cx - 64} y={-104} width={128} height={128 * c.p} />
          </clipPath>
        ))}
      </defs>
      <g transform={`translate(${880} ${640}) scale(${sc}) translate(${-880} ${-640})`}>
        {/* 奥の壁 */}
        <rect x={-40} y={-40} width={2000} height={560} fill={C.wall93} />
        <rect x={-40} y={-40} width={2000} height={56} fill={C.wall93Dark} />
        {/* 蛍光灯 */}
        {[420, 1100, 1700].map((lx2, i) => (
          <g key={i}>
            <rect x={lx2 - 160} y={10} width={320} height={26} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            <rect x={lx2 - 170} y={4} width={340} height={10} fill={C.steel} stroke={C.ink} strokeWidth={3} />
            <ellipse cx={lx2} cy={60} rx={200} ry={40} fill={KRP.white} opacity={0.22 + Math.sin(f / 3 + i) * 0.03} />
          </g>
        ))}
        {/* カレンダー (8月) */}
        <g transform="translate(150 190) rotate(-2)">
          <rect x={0} y={0} width={210} height={250} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={0} y={0} width={210} height={62} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
          <text x={105} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white}>8</text>
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={14 + (i % 7) * 27} y={78 + Math.floor(i / 7) * 32} width={18} height={16} fill={i % 7 === 0 ? KRP.red : C.ink} opacity={0.35} />
          ))}
          <circle cx={105} cy={-10} r={8} fill={C.steelDark} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 吊り下げの係の札 */}
        <line x1={900} y1={36} x2={900} y2={70} stroke={C.ink} strokeWidth={4} />
        <line x1={1100} y1={36} x2={1100} y2={70} stroke={C.ink} strokeWidth={4} />
        <rect x={860} y={70} width={280} height={74} rx={8} fill={C.navy} stroke={C.ink} strokeWidth={5} />
        <text x={1000} y={122} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.white}>戸籍係</text>
        {/* 壁の時計 */}
        <g transform="translate(1760 170)">
          <circle r={70} fill={KRP.white} stroke={C.ink} strokeWidth={7} />
          <line x1={0} y1={0} x2={-26} y2={-30} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.cos((-90 + f * 6) * D2R) * 52} y2={Math.sin((-90 + f * 6) * D2R) * 52} stroke={KRP.red} strokeWidth={3} />
          <circle r={7} fill={C.ink} />
        </g>
        {/* 窓口の人 (奥) */}
        <NG1cClerk x={1380} y={640} s={1.15} f={f} face={shock > 0.3 ? "surprised" : "normal"} lean={-shock * 6} gaze={[-6, 6]} />
        {shock > 0.3 && <NG1cSweat x={1470} y={330} s={1.1} t={seg(f, 36, 42)} />}
        {shock > 0 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={shock}>
            <line x1={1270} y1={270} x2={1240} y2={240} /><line x1={1300} y1={250} x2={1290} y2={212} /><line x1={1250} y1={305} x2={1210} y2={295} />
          </g>
        )}
        {/* 奥の机: ブラウン管の端末 */}
        <g>
          <rect x={1560} y={300} width={280} height={230} rx={22} fill={C.crt} stroke={C.ink} strokeWidth={6} />
          <rect x={1600} y={330} width={200} height={150} rx={18} fill={C.crtScreen} stroke={C.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={1618} y={350 + i * 26} width={i === 3 ? 60 : 120 + (i % 2) * 40} height={10} fill={C.crtGlow} opacity={0.75} />
          ))}
          {blinkCur && <rect x={1684} y={428} width={16} height={12} fill={C.crtGlow} />}
          <ellipse cx={1690} cy={400} rx={90} ry={66} fill={C.crtGlow} opacity={0.08} />
          <circle cx={1812} cy={505} r={7} fill={KRP.green} stroke={C.ink} strokeWidth={2} />
          <rect x={1590} y={492} width={150} height={20} rx={4} fill={C.crtDark} />
        </g>
        {/* 書類の山 */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={1080 + i * 3} y={470 - i * 14} width={150} height={16} fill={C.formPaper} stroke={C.ink} strokeWidth={3} />
        ))}
        {/* カウンター (見下ろした天板) */}
        <path d="M -40 520 L 1960 520 L 1960 940 L -40 940 Z" fill={C.counterTop} stroke={C.ink} strokeWidth={6} />
        <rect x={-40} y={510} width={2000} height={20} fill={C.counterTopDark} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M -40 ${580 + i * 74} q 500 ${rnd(15, i) * 20 - 10} 1000 0 q 500 ${rnd(16, i) * 20 - 10} 1000 0`} stroke={C.counterTopDark} strokeWidth={3} fill="none" opacity={0.6} />
        ))}
        <rect x={-40} y={940} width={2000} height={200} fill={C.counterFront} stroke={C.ink} strokeWidth={6} />
        {/* 番号札の機械 */}
        <g>
          <rect x={150} y={540} width={210} height={190} rx={16} fill={KRP.red} stroke={C.ink} strokeWidth={6} />
          <rect x={176} y={566} width={158} height={60} rx={8} fill={C.crtScreen} stroke={C.ink} strokeWidth={4} />
          <text x={255} y={612} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.orange}>023</text>
          <circle cx={210} cy={680} r={22} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={258} y={662} width={80} height={12} rx={4} fill={C.ink} />
          <g transform={`translate(298 ${674 + Math.sin(f / 8) * 3})`}>
            <rect x={-30} y={0} width={60} height={70} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
            <text x={0} y={48} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink}>23</text>
          </g>
        </g>
        {/* 鎖つきのペン立て */}
        <g>
          <ellipse cx={1560} cy={650} rx={60} ry={22} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
          <path d={`M 1560 640 Q ${1500 + Math.sin(f / 10) * 6} 720 1440 690`} stroke={C.steel} strokeWidth={6} strokeDasharray="6 5" fill="none" />
          <rect x={1546} y={560} width={28} height={90} rx={6} fill={C.steel} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 記入例の立て札 */}
        <g transform="translate(1720 600) rotate(4)">
          <rect x={-90} y={-60} width={180} height={150} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <text x={0} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={KRP.red}>記入例</text>
          {[0, 1, 2].map((i) => <rect key={i} x={-66} y={0 + i * 26} width={132 - i * 30} height={10} fill={C.scribble} opacity={0.5} />)}
        </g>
        {/* 出生届 */}
        <NG1cForm x={880} y={690} s={0.95} rot={-3}>
          {chars.map((c, i) => (
            <text key={i} x={c.cx} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={118} fill={C.ink}
              clipPath={`url(#ng1c153c${i})`}>{c.ch}</text>
          ))}
          {/* ペンを持つ手 (先端 = tx,ty) */}
          <g transform={`translate(${tx} ${ty})`}>
            <path d="M 120 -30 L 900 600" stroke={C.ink} strokeWidth={142} strokeLinecap="round" />
            <path d="M 120 -30 L 900 600" stroke={C.father} strokeWidth={128} strokeLinecap="round" />
            <path d="M 160 40 L 560 370" stroke={C.fatherDark} strokeWidth={14} opacity={0.5} />
            <path d="M 96 -54 L 150 -10" stroke={C.fatherDark} strokeWidth={10} opacity={0.8} strokeLinecap="round" />
            <line x1={0} y1={0} x2={150} y2={-200} stroke={C.ink} strokeWidth={24} strokeLinecap="round" />
            <line x1={4} y1={-6} x2={150} y2={-200} stroke={C.pen} strokeWidth={15} strokeLinecap="round" />
            <circle cx={0} cy={0} r={5} fill={C.ink} />
            <ellipse cx={110} cy={-60} rx={62} ry={50} transform="rotate(40 110 -60)" fill={C.skin} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={58} cy={-72} rx={42} ry={14} transform="rotate(-54 58 -72)" fill={C.skin} stroke={C.ink} strokeWidth={4.5} />
            <ellipse cx={84} cy={-108} rx={34} ry={14} transform="rotate(-80 84 -108)" fill={C.skin} stroke={C.ink} strokeWidth={4.5} />
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={78 + i * 18} cy={-28 + i * 14} rx={22} ry={13} fill={C.skin} stroke={C.ink} strokeWidth={4} />
            ))}
          </g>
        </NG1cForm>
      </g>
      <TagPlate x={590} y={100} text="1993年" size={46} t={seg(f, 0, 8)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #154 悪も魔も、使ってよい漢字です。
// 格: 図 / seed 4154
// どこ: 木の机の上に、テープで留めた常用漢字の一覧表 (「あ」の段と「ま」の段)。鉛筆・消しゴム・辞書・湯のみ
// 演出: 「悪」のマスが光って緑の○。真鍮の虫眼鏡が表の上をすべって「魔」へ移り、大きく映して○
// 動き: カメラが虫眼鏡を追ってゆっくり右へパン。f10〜16 悪に○、f18〜34 虫眼鏡が移動、f34〜40 魔に○
const NG1C_A = "亜哀挨愛曖悪握圧扱宛嵐安案暗以衣位囲医依委威為畏";
const NG1C_MA = "麻摩磨魔毎妹枚昧埋幕膜枕又末抹万満慢漫未味魅岬密";
const Nm154: React.FC<{ f: number }> = ({ f }) => {
  const pan = easeInOut(seg(f, 16, 38));
  const camX = lerp(60, -60, pan);
  const cell = 108;
  const LX = 250, RX = 1010, TY = 320;
  const aku: [number, number] = [LX + 5 * cell + cell / 2, TY + cell / 2];
  const ma: [number, number] = [RX + 3 * cell + cell / 2, TY + cell / 2];
  const move = easeInOut(seg(f, 18, 34));
  const lensX = lerp(aku[0], ma[0], move);
  const lensY = lerp(aku[1], ma[1], move) - Math.sin(move * Math.PI) * 80;
  const onAku = seg(f, 10, 16);
  const onMa = seg(f, 34, 40);
  const lensChar = move < 0.15 ? "悪" : move > 0.85 ? "魔" : "";
  const block = (ox: number, chars: string, head: string, hit: number, glowT: number) => (
    <g>
      <rect x={ox - 10} y={TY - 70} width={6 * cell + 20} height={4 * cell + 80} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      <rect x={ox - 10} y={TY - 70} width={6 * cell + 20} height={60} rx={8} fill={C.formLine} opacity={0.2} />
      <text x={ox + 20} y={TY - 26} fontFamily={FONT} fontWeight={900} fontSize={36} fill={C.formLine}>{head}</text>
      {Array.from({ length: 24 }, (_, i) => {
        const cx = ox + (i % 6) * cell, cy = TY + Math.floor(i / 6) * cell;
        const isHit = i === hit;
        return (
          <g key={i}>
            {isHit && glowT > 0 && <rect x={cx + 4} y={cy + 4} width={cell - 8} height={cell - 8} rx={8} fill={NP.glow} opacity={0.35 + 0.4 * glowT + Math.sin(f / 4) * 0.08} />}
            <rect x={cx} y={cy} width={cell} height={cell} fill="none" stroke={C.formLine} strokeWidth={2.5} />
            <text x={cx + cell / 2} y={cy + cell / 2 + 25} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={70}
              fill={C.ink} opacity={isHit ? 1 : 0.72}>{chars[i]}</text>
          </g>
        );
      })}
    </g>
  );
  return (
    <Frame f={f} seed={4154}>
      <g transform={`translate(${camX} 0)`}>
        {/* 机 */}
        <rect x={-120} y={-40} width={2160} height={1160} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.5}>
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M -120 ${60 + i * 160} q 540 ${rnd(8, i) * 36 - 18} 1080 0 q 540 ${rnd(9, i) * 36 - 18} 1080 0`} fill="none" />
          ))}
        </g>
        {/* 一覧表の台紙 */}
        <g transform="rotate(-0.8 960 520)">
          <rect x={186} y={176} width={1560} height={640} rx={8} fill={C.ink} opacity={0.18} />
          <rect x={170} y={160} width={1560} height={640} rx={8} fill={C.formPaper} stroke={C.ink} strokeWidth={7} />
          {([[190, 176, 38], [1710, 176, -36], [192, 786, -40], [1708, 786, 34]] as const).map(([tx, ty, r], i) => (
            <rect key={i} x={tx - 54} y={ty - 20} width={108} height={40} rx={4}
              fill={i % 2 ? "#E8A3A0" : "#9FC8C0"} opacity={0.85} stroke={C.ink} strokeWidth={3}
              transform={`rotate(${r} ${tx} ${ty})`} />
          ))}
          {block(LX, NG1C_A, "あ", 5, onAku)}
          {block(RX, NG1C_MA, "ま", 3, onMa)}
          <path d="M 940 260 L 940 760" stroke={C.formLine} strokeWidth={3} strokeDasharray="10 10" />
          <Maru x={aku[0]} y={aku[1]} s={0.78} t={onAku} />
        </g>
        {/* 机の小物: 鉛筆・消しゴム・辞書・湯のみ */}
        <g transform="rotate(-24 210 930)">
          <rect x={60} y={912} width={300} height={34} rx={6} fill={KRP.yellow} stroke={C.ink} strokeWidth={5} />
          <polygon points="360,912 410,929 360,946" fill={C.skin} stroke={C.ink} strokeWidth={4} />
          <rect x={30} y={912} width={34} height={34} rx={4} fill={KRP.red} stroke={C.ink} strokeWidth={4} />
        </g>
        <rect x={1460} y={860} width={130} height={60} rx={10} fill={KRP.white} stroke={C.ink} strokeWidth={5} transform="rotate(8 1525 890)" />
        <g transform="rotate(12 1900 190)">
          <rect x={1780} y={20} width={260} height={340} rx={10} fill={C.ledger} stroke={C.ink} strokeWidth={6} />
          <rect x={1800} y={40} width={30} height={300} fill={C.ledgerDark} />
        </g>
        <g>
          <ellipse cx={-10} cy={140} rx={110} ry={110} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <ellipse cx={-10} cy={140} rx={78} ry={78} fill={C.leaf} stroke={C.ink} strokeWidth={4} opacity={0.85} />
          <ellipse cx={-30} cy={120} rx={26} ry={14} fill={KRP.white} opacity={0.3} />
        </g>
        {/* 虫眼鏡 */}
        <g transform={`translate(${lensX} ${lensY})`}>
          <ellipse cx={14} cy={18} rx={96} ry={96} fill={C.ink} opacity={0.15} />
          <line x1={64} y1={64} x2={190} y2={190} stroke={C.ink} strokeWidth={40} strokeLinecap="round" />
          <line x1={64} y1={64} x2={190} y2={190} stroke={C.boardDark} strokeWidth={28} strokeLinecap="round" />
          <circle r={92} fill={KRP.white} opacity={0.94} />
          {lensChar && (
            <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill={C.ink}>{lensChar}</text>
          )}
          <circle r={92} fill={KRP.blueSoft} opacity={0.22} />
          <path d="M -60 -40 Q -50 -66 -22 -74" stroke={KRP.white} strokeWidth={10} fill="none" strokeLinecap="round" />
          <circle r={92} fill="none" stroke={NP.brassDark} strokeWidth={18} />
          <circle r={92} fill="none" stroke={C.ink} strokeWidth={4} />
          <circle r={101} fill="none" stroke={C.ink} strokeWidth={4} />
        </g>
        <Maru x={ma[0]} y={ma[1]} s={1.2} t={onMa} />
      </g>
      <TagPlate x={960} y={110} text="常用漢字表" size={44} t={seg(f, 0, 8)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #155 それでも役所は止め、話は裁判にまでなりました。
// 格: 山 / seed 4155
// どこ: 左は1993年の役所の窓口 (#153 の出生届)、柱をはさんで右は家庭裁判所の部屋 (木の壁・裁判官の席・大きな天秤のからくり)
// 演出: 窓口の人が赤い「受理できません」のハンコを押す → 天井の針金をつたう滑車が用紙をつかみ、裁判所の天秤の左の皿へ運ぶ。右の皿は戸籍法の本。天秤がぐらりと揺れ、窓口の人は困った顔、裁判官が目を見ひらく
// 動き: f0〜8 ハンコ、f14〜24 滑車がつかむ、f18〜36 カメラが右へパン、f24〜34 用紙が運ばれ、f34〜38 皿に乗って天秤が揺れる
const Nm155: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 18, 36));
  const camX = -560 * cam;
  // ハンコ
  const down = easeOut(seg(f, 0, 7));
  const up = easeInOut(seg(f, 8, 14));
  const hit = seg(f, 6, 8);
  const toolY = lerp(330, 503, down) - up * 200;
  const toolOp = 1 - seg(f, 12, 16);
  // 天秤
  const PV: [number, number] = [1700, 300];
  const L = 330;
  const thetaDeg = f < 36
    ? -8 + Math.sin(f / 10) * 0.5
    : lerp(-8, 0, easeOut(seg(f, 36, 42))) + 4.5 * Math.sin((f - 36) / 4.5) * Math.exp(-(f - 36) / 40);
  const th = thetaDeg * D2R;
  const leftEnd: [number, number] = [PV[0] - L * Math.cos(th), PV[1] + L * Math.sin(th)];
  const rightEnd: [number, number] = [PV[0] + L * Math.cos(th), PV[1] - L * Math.sin(th)];
  const CH = 250;
  const restY = leftEnd[1] + CH - 4 - 121;
  // 滑車と用紙
  const wireA: [number, number] = [560, 170];
  const wireB: [number, number] = [1370, 150];
  const travel = easeInOut(seg(f, 24, 34));
  const trolley: [number, number] = [lerp(wireA[0], wireB[0], travel), lerp(wireA[1], wireB[1], travel)];
  let form: [number, number] = [560, 470];
  let formRot = 0;
  if (f >= 20 && f < 24) form = [560, lerp(470, wireA[1] + 161, easeOut(seg(f, 20, 24)))];
  else if (f >= 24 && f < 34) { form = [trolley[0], trolley[1] + 161]; formRot = Math.sin(f / 2.5) * 4; }
  else if (f >= 34 && f < 38) form = [lerp(wireB[0], leftEnd[0], seg(f, 34, 38)), lerp(wireB[1] + 161, restY, easeInOut(seg(f, 34, 38)))];
  else if (f >= 38) form = [leftEnd[0], restY];
  const clipDown = seg(f, 14, 20);
  const released = seg(f, 38, 42);
  const stringEndY = f < 20 ? lerp(trolley[1], 349, clipDown) : f < 38 ? form[1] - 121 : lerp(form[1] - 121, trolley[1] + 20, released);
  const worry = f > 10;
  return (
    <Frame f={f} seed={4155}>
      <g transform={`translate(${camX} 0)`}>
        {/* ===== 役所 (world 0〜1100) ===== */}
        <rect x={-40} y={-40} width={1160} height={1160} fill={C.wall93} />
        <rect x={-40} y={-40} width={1160} height={40} fill={C.wall93Dark} />
        <rect x={120} y={200} width={300} height={280} rx={6} fill={C.sky} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={124} y={206 + i * 30} width={292} height={16} fill={C.blind} stroke={C.ink} strokeWidth={2} />
        ))}
        {/* 窓口の人 */}
        <NG1cClerk x={840} y={700} s={1.15} f={f} face={worry ? "worried" : "normal"} lean={worry ? 5 : 0} gaze={[-6, 4]} />
        {worry && <NG1cSweat x={760} y={400} t={seg(f, 12, 20)} />}
        {worry && <NG1cSweat x={930} y={390} s={0.8} t={seg(f, 20, 28)} />}
        {/* 記載台 */}
        <path d="M 400 600 L 440 330 L 700 330 L 720 600 Z" fill={C.counterDark} stroke={C.ink} strokeWidth={5} />
        {/* カウンター */}
        <rect x={-40} y={590} width={1160} height={40} fill={C.counterTop} stroke={C.ink} strokeWidth={6} />
        <rect x={-40} y={630} width={1160} height={500} fill={C.counterFront} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={20 + i * 180} y={670} width={140} height={400} rx={6} fill="none" stroke={C.counterDark} strokeWidth={4} />
        ))}
        {/* 柱 */}
        <rect x={1080} y={-40} width={60} height={1160} fill={C.wall93Dark} stroke={C.ink} strokeWidth={6} />
        {/* ===== 家庭裁判所 (world 1140〜2700) ===== */}
        <rect x={1140} y={-40} width={1600} height={1160} fill={C.court} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={1170 + i * 200} y={40} width={170} height={460} rx={6} fill={C.courtPanel} stroke={C.courtDark} strokeWidth={5} />
        ))}
        <rect x={1140} y={530} width={1600} height={600} fill={C.courtDark} />
        {/* 裁判官の席 */}
        <Person x={2300} y={640} s={1.0} f={f} face={f > 36 ? "surprised" : "normal"} cloth={C.judge} clothDark={C.judgeDark} hair="cap" gaze={[-6, 2]} lean={f > 36 ? -4 : 0} />
        <rect x={2120} y={520} width={600} height={600} fill={C.board} stroke={C.ink} strokeWidth={7} />
        <rect x={2100} y={508} width={640} height={30} fill={C.boardDark} stroke={C.ink} strokeWidth={6} />
        {/* 天秤のからくり */}
        <g>
          <rect x={1520} y={740} width={360} height={60} rx={10} fill={C.boardDark} stroke={C.ink} strokeWidth={6} />
          <rect x={1580} y={700} width={240} height={50} rx={10} fill={C.board} stroke={C.ink} strokeWidth={6} />
          <rect x={1684} y={300} width={32} height={410} fill={NP.brass} stroke={C.ink} strokeWidth={6} />
          <circle cx={1700} cy={262} r={22} fill={NP.brass} stroke={C.ink} strokeWidth={6} />
          <path d="M 1700 240 L 1700 214" stroke={C.ink} strokeWidth={6} />
          <line x1={leftEnd[0]} y1={leftEnd[1]} x2={rightEnd[0]} y2={rightEnd[1]} stroke={C.ink} strokeWidth={24} strokeLinecap="round" />
          <line x1={leftEnd[0]} y1={leftEnd[1]} x2={rightEnd[0]} y2={rightEnd[1]} stroke={NP.brass} strokeWidth={14} strokeLinecap="round" />
          {/* 針 */}
          <line x1={PV[0]} y1={PV[1]} x2={PV[0] - Math.sin(th) * 120} y2={PV[1] + Math.cos(th) * 120} stroke={KRP.red} strokeWidth={6} />
          <circle cx={PV[0]} cy={PV[1]} r={18} fill={NP.brassDark} stroke={C.ink} strokeWidth={5} />
          {[leftEnd, rightEnd].map(([ex, ey], i) => (
            <g key={i}>
              <path d={`M ${ex} ${ey} L ${ex - 150} ${ey + CH} M ${ex} ${ey} L ${ex + 150} ${ey + CH}`} stroke={C.ink} strokeWidth={5} />
              <path d={`M ${ex - 170} ${ey + CH} Q ${ex} ${ey + CH + 70} ${ex + 170} ${ey + CH} Z`} fill={NP.brass} stroke={C.ink} strokeWidth={6} />
              <circle cx={ex} cy={ey} r={10} fill={NP.brassDark} stroke={C.ink} strokeWidth={4} />
            </g>
          ))}
          {/* 右の皿: 戸籍法の本 */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={rightEnd[0] - 120 + i * 8} y={rightEnd[1] + CH - 52 - i * 50} width={240 - i * 16} height={48} rx={6}
                fill={[C.ledger, KRP.red, C.ledgerDark][i]} stroke={C.ink} strokeWidth={5} />
              <rect x={rightEnd[0] - 100 + i * 8} y={rightEnd[1] + CH - 44 - i * 50} width={200 - i * 16} height={6} fill={NP.brass} opacity={0.8} />
            </g>
          ))}
          <text x={rightEnd[0]} y={rightEnd[1] + CH - 112} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.white}>戸籍法</text>
        </g>
        {/* 天井の針金と滑車 */}
        <line x1={wireA[0] - 80} y1={wireA[1] + 2} x2={wireB[0] + 30} y2={wireB[1] - 1} stroke={C.ink} strokeWidth={5} />
        <circle cx={wireA[0] - 80} cy={wireA[1] + 2} r={14} fill={C.steel} stroke={C.ink} strokeWidth={4} />
        <circle cx={wireB[0] + 30} cy={wireB[1] - 1} r={14} fill={C.steel} stroke={C.ink} strokeWidth={4} />
        <g>
          <line x1={trolley[0]} y1={trolley[1]} x2={form[0]} y2={stringEndY} stroke={C.ink} strokeWidth={4} />
          <rect x={trolley[0] - 30} y={trolley[1] - 22} width={60} height={34} rx={8} fill={KRP.orange} stroke={C.ink} strokeWidth={5} />
          <circle cx={trolley[0] - 14} cy={trolley[1] - 22} r={9} fill={C.steel} stroke={C.ink} strokeWidth={3} />
          <circle cx={trolley[0] + 14} cy={trolley[1] - 22} r={9} fill={C.steel} stroke={C.ink} strokeWidth={3} />
          <path d={`M ${form[0] - 22} ${stringEndY + 18} L ${form[0]} ${stringEndY} L ${form[0] + 22} ${stringEndY + 18}`} stroke={C.steelDark} strokeWidth={7} fill="none" strokeLinecap="round" />
        </g>
        {/* 用紙 (#153 の出生届) */}
        <NG1cForm x={form[0]} y={form[1]} s={0.55} rot={formRot}>
          <text x={0} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={118} fill={C.ink}>悪</text>
          <text x={124} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={118} fill={C.ink}>魔</text>
          <NG1cSeal x={30} y={110} text="受理できません" color={C.sealRed} t={hit} size={50} rot={-8} />
        </NG1cForm>
        {/* ハンコの道具と窓口の人の手 */}
        {toolOp > 0 && (
          <g opacity={toolOp}>
            <rect x={522} y={toolY - 26} width={120} height={28} rx={6} fill={C.sealRed} stroke={C.ink} strokeWidth={4} />
            <rect x={540} y={toolY - 70} width={84} height={46} rx={8} fill={C.desk} stroke={C.ink} strokeWidth={5} />
            <rect x={560} y={toolY - 140} width={44} height={74} rx={18} fill={C.deskDark} stroke={C.ink} strokeWidth={5} />
            <NG1cHand x={600} y={toolY - 110} rot={180} s={0.62} sleeve={C.shirt} sleeveDark={C.wall93Dark} flip />
          </g>
        )}
        {hit > 0 && f < 16 && (
          <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={1 - seg(f, 8, 16)}>
            <line x1={420} y1={470} x2={380} y2={460} /><line x1={430} y1={530} x2={385} y2={545} /><line x1={740} y1={470} x2={780} y2={456} />
          </g>
        )}
        {/* 着地の揺れの線 */}
        {f > 36 && (
          <g stroke={KRP.white} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7}>
            <path d={`M ${leftEnd[0] - 230} ${leftEnd[1] + 150} q -20 30 0 60`} />
            <path d={`M ${leftEnd[0] - 260} ${leftEnd[1] + 140} q -20 40 0 80`} />
            <path d={`M ${rightEnd[0] + 230} ${rightEnd[1] + 150} q 20 30 0 60`} />
          </g>
        )}
        <TagPlate x={1700} y={96} text="家庭裁判所" size={42} t={seg(f, 22, 32)} />
      </g>
      <TagPlate x={580} y={100} text="1993年" size={44} t={seg(f, 0, 6)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #156 結局、その子は、別の名前で届けられています。
// 格: 並 / seed 4156
// どこ: 同じ1993年の窓口を、少し低い位置から近くで。奥はブラインドの窓・観葉植物・戸籍係の札
// 演出: 下から親の手 (顔なし) が新しい出生届を差し出す。名前の欄は空白の四角。窓口の人の手が青い「受理」のハンコを押し、窓口の人がほっと笑って息をつく
// 動き: f0〜12 用紙がすべり込む、f16〜24 受理の判、f24から窓口の人が笑顔・ため息の線・汗が引く。カメラはゆっくり引く
const Nm156: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1.08 - 0.08 * cam;
  const slide = easeOut(seg(f, 0, 12));
  const FX = 820, FY = lerp(980, 700, slide);
  const handOut = seg(f, 12, 20);
  const down = easeOut(seg(f, 14, 20));
  const up = easeInOut(seg(f, 22, 28));
  const hit = seg(f, 19, 21);
  const relief = seg(f, 24, 32);
  // 受付欄の中心 (用紙の座標 (225,-158)) の画面位置
  const sx = FX + 225 * 0.85, sy = FY - 158 * 0.85;
  const toolY = lerp(sy - 220, sy, down) - up * 260;
  const breath = seg(f, 28, 40);
  return (
    <Frame f={f} seed={4156}>
      <g transform={`translate(960 600) scale(${sc}) translate(-960 -600)`}>
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.wall93} />
        {/* ブラインドの窓 */}
        <rect x={140} y={110} width={420} height={330} rx={6} fill={C.sky} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={144} y={116 + i * 32} width={412} height={18} fill={C.blind} stroke={C.ink} strokeWidth={2}
            opacity={0.95} transform={`rotate(${Math.sin(f / 18 + i) * 0.6} 350 ${125 + i * 32})`} />
        ))}
        <rect x={130} y={430} width={440} height={20} rx={4} fill={C.wall93Dark} stroke={C.ink} strokeWidth={4} />
        {/* 観葉植物 */}
        <g transform={`rotate(${Math.sin(f / 16) * 1.5} 1780 560)`}>
          {[-50, -20, 10, 40, 70].map((a, i) => (
            <ellipse key={i} cx={1780 + Math.sin(a * D2R) * 90} cy={430 - Math.cos(a * D2R) * 70} rx={34} ry={80}
              transform={`rotate(${a} ${1780 + Math.sin(a * D2R) * 90} ${430 - Math.cos(a * D2R) * 70})`}
              fill={i % 2 ? C.leaf : C.leafDark} stroke={C.ink} strokeWidth={4} />
          ))}
          <path d="M 1720 470 L 1840 470 L 1820 560 L 1740 560 Z" fill={C.pot} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* 係の札 */}
        <line x1={900} y1={-10} x2={900} y2={80} stroke={C.ink} strokeWidth={4} />
        <line x1={1120} y1={-10} x2={1120} y2={80} stroke={C.ink} strokeWidth={4} />
        <rect x={860} y={80} width={300} height={78} rx={8} fill={C.navy} stroke={C.ink} strokeWidth={5} />
        <text x={1010} y={134} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.white}>戸籍係</text>
        {/* 窓口の人 */}
        <NG1cClerk x={1380} y={660} s={1.3} f={f} face={relief > 0.2 ? "smile" : "worried"} lean={relief > 0.2 ? -3 : 3} gaze={[-6, 6]} />
        {relief < 0.6 && <NG1cSweat x={1470} y={330} s={1.1} t={1 - relief * 1.6} />}
        {breath > 0 && breath < 1 && (
          <g opacity={Math.sin(breath * Math.PI)} stroke={KRP.white} strokeWidth={8} strokeLinecap="round" fill="none">
            <path d={`M ${1300 - breath * 60} 420 q -30 -14 -60 0`} />
            <path d={`M ${1290 - breath * 80} 446 q -36 -10 -70 4`} />
          </g>
        )}
        {/* 書類トレー */}
        <rect x={1560} y={520} width={250} height={40} rx={6} fill={C.steel} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => <rect key={i} x={1580 + i * 4} y={500 - i * 12} width={200} height={14} fill={C.formPaper} stroke={C.ink} strokeWidth={3} />)}
        {/* カウンター */}
        <rect x={-40} y={540} width={2000} height={20} fill={C.counterTopDark} stroke={C.ink} strokeWidth={5} />
        <rect x={-40} y={556} width={2000} height={420} fill={C.counterTop} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M -40 ${620 + i * 90} q 500 ${rnd(21, i) * 20 - 10} 1000 0 q 500 ${rnd(22, i) * 20 - 10} 1000 0`} stroke={C.counterTopDark} strokeWidth={3} fill="none" opacity={0.6} />
        ))}
        <rect x={-40} y={970} width={2000} height={200} fill={C.counterFront} stroke={C.ink} strokeWidth={6} />
        {/* 朱肉 */}
        <g>
          <ellipse cx={1290} cy={700} rx={70} ry={30} fill={C.steelDark} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={1290} cy={692} rx={56} ry={20} fill={C.sealBlue} opacity={0.8} />
        </g>
        {/* 新しい出生届 */}
        <NG1cForm x={FX} y={FY} s={0.85} rot={-2}>
          {/* 名前の欄は空白の四角 (中身は描かない) */}
          <rect x={-130} y={-96} width={380} height={112} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={5} strokeDasharray="16 10" />
          <NG1cSeal x={225} y={-158} text="受理" color={C.sealBlue} t={hit} size={40} rot={-6} round />
          {/* 下から差し出す親の手 */}
          <g opacity={1 - handOut}>
            <NG1cHand x={-200} y={250 + handOut * 120} rot={-80} s={0.9} sleeve={C.mother} sleeveDark={C.motherDark} />
          </g>
        </NG1cForm>
        {hit > 0 && relief < 1 && (
          <g opacity={1 - relief}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = i * 60 * D2R;
              return <line key={i} x1={sx + Math.cos(a) * 80} y1={sy + Math.sin(a) * 80} x2={sx + Math.cos(a) * 110} y2={sy + Math.sin(a) * 110}
                stroke={C.ink} strokeWidth={6} strokeLinecap="round" />;
            })}
          </g>
        )}
        {/* ほっとしたきらめき */}
        {relief > 0 && [0, 1, 2].map((i) => {
          const px = FX - 250 + i * 250, py = FY - 240 - (i % 2) * 40 + Math.sin(f / 5 + i) * 6;
          return (
            <path key={i} d={`M ${px} ${py - 22} L ${px + 6} ${py - 6} L ${px + 22} ${py} L ${px + 6} ${py + 6} L ${px} ${py + 22} L ${px - 6} ${py + 6} L ${px - 22} ${py} L ${px - 6} ${py - 6} Z`}
              fill={KRP.yellow} stroke={C.ink} strokeWidth={3} transform={`scale(1)`} opacity={relief} />
          );
        })}
        {/* ハンコと窓口の人の手 */}
        {f < 32 && f > 10 && (
          <g opacity={1 - seg(f, 26, 32)}>
            <rect x={sx - 44} y={toolY - 20} width={88} height={22} rx={8} fill={C.sealBlue} stroke={C.ink} strokeWidth={4} />
            <rect x={sx - 30} y={toolY - 64} width={60} height={46} rx={8} fill={C.desk} stroke={C.ink} strokeWidth={5} />
            <rect x={sx - 18} y={toolY - 130} width={36} height={70} rx={16} fill={C.deskDark} stroke={C.ink} strokeWidth={5} />
            <NG1cHand x={sx + 8} y={toolY - 100} rot={180} s={0.6} sleeve={C.shirt} sleeveDark={C.wall93Dark} flip />
          </g>
        )}
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #157 名前は、親のものでも、子どものものでも、国のものでもある。
// 格: 山 / seed 4157
// どこ: 3つの世界が真ん中で出会う壁。左上=家 (花柄の壁紙と窓)、右上=役所 (書類棚と時計)、下=子ども部屋 (ラグと積み木)
// 演出: 名札「山田 花子」を、親の手 (左・紅の袖)・子どもの小さな手 (下・黄色の袖)・国の手 (右・紺の詰襟の袖と真鍮のボタン) が同時につかむ。3方向から交互にくいっと引かれ、名札がその都度ずれて揺れる
// 動き: カメラが寄りから少し引いて3本の手を見せる。f10 親が引く、f22 国が引く、f32 子が引く (引いた手のそばに動きの線)
const NG1cTug = (f: number) => {
  const pull = (a: number) => Math.sin(Math.PI * seg(f, a, a + 10));
  const p = pull(8), s = pull(20), k = pull(30);
  const idle = Math.sin(f / 7);
  return { p, s, k, nx: -p * 26 + s * 26 + idle * 2, ny: k * 22 + Math.sin(f / 9) * 2, rot: -p * 3 + s * 3 + k * 1.5 };
};
const NG1cThreeHands: React.FC<{
  f: number; NX: number; NY: number; S: number; spread?: number; open?: number; tug: { p: number; s: number; k: number }; kidFade?: number;
}> = ({ f, NX, NY, S, spread = 0, open = 0, tug, kidFade = 0 }) => {
  const halfW = 200 * S, halfH = 95 * S;
  const lines = (x: number, y: number, dir: number, on: number, vertical = false) => on > 0.2 && (
    <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={on}>
      {[-1, 0, 1].map((i) => vertical
        ? <line key={i} x1={x + i * 30} y1={y + dir * 20} x2={x + i * 30} y2={y + dir * 60} />
        : <line key={i} x1={x + dir * 20} y1={y + i * 28} x2={x + dir * 64} y2={y + i * 28} />)}
    </g>
  );
  void f;
  return (
    <g>
      {/* 親の手 (左) */}
      <NG1cHand x={NX - halfW - 44 - spread - tug.p * 6} y={NY + 6} rot={0} s={1} sleeve={C.mother} sleeveDark={C.motherDark} open={open} />
      {lines(NX - halfW - 170 - spread, NY + 6, -1, tug.p)}
      {/* 国の手 (右・紺の詰襟の袖) */}
      <NG1cHand x={NX + halfW + 44 + spread + tug.s * 6} y={NY + 6} rot={180} s={1} sleeve={C.navy} sleeveDark={C.navyDark} cuff={KRP.white} buttons open={open} flip />
      {lines(NX + halfW + 170 + spread, NY + 6, 1, tug.s)}
      {/* 子どもの小さな手 (下) */}
      {kidFade < 1 && (
        <g opacity={1 - kidFade}>
          <NG1cHand x={NX - 110 * S} y={NY + halfH + 28 + spread * 1.6 + tug.k * 4} rot={-90} s={0.78} sleeve={C.kidSleeve} sleeveDark={C.kidSleeveDark} open={open} />
        </g>
      )}
      {lines(NX - 110 * S + 90, NY + halfH + 60, 1, tug.k, true)}
    </g>
  );
};
const Nm157: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 30));
  const sc = 1.12 - 0.12 * cam;
  const tug = NG1cTug(f);
  const NX = 960 + tug.nx, NY = 400 + tug.ny, S = 1.5;
  return (
    <Frame f={f} seed={4157}>
      <g transform={`translate(960 440) scale(${sc}) translate(-960 -440)`}>
        {/* 左上: 家 */}
        <path d="M -60 -60 L 960 -60 L 960 440 L -60 760 Z" fill={C.homeWall} />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={40 + (i % 6) * 160 + (Math.floor(i / 6) % 2) * 80} cy={40 + Math.floor(i / 6) * 150} r={14} fill={C.homeDot} />
        ))}
        <g>
          <rect x={120} y={130} width={260} height={220} rx={6} fill={C.sky} stroke={C.ink} strokeWidth={6} />
          <line x1={250} y1={130} x2={250} y2={350} stroke={C.ink} strokeWidth={5} />
          <line x1={120} y1={240} x2={380} y2={240} stroke={C.ink} strokeWidth={5} />
          <path d={`M 100 120 Q ${140 + Math.sin(f / 12) * 8} 240 120 370 L 100 370 Z`} fill={C.mother} stroke={C.ink} strokeWidth={4} />
          <path d={`M 400 120 Q ${360 + Math.sin(f / 12) * 8} 240 380 370 L 400 370 Z`} fill={C.mother} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 右上: 役所 */}
        <path d="M 960 -60 L 1980 -60 L 1980 760 L 960 440 Z" fill={C.wall93} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={1520 + i * 0} y={120 + i * 130} width={340} height={110} rx={6} fill={C.steel} stroke={C.ink} strokeWidth={5} />
            <rect x={1650} y={150 + i * 130} width={80} height={30} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        <g transform="translate(1340 160)">
          <circle r={60} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-40} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.cos((-90 + f * 6) * D2R) * 46} y2={Math.sin((-90 + f * 6) * D2R) * 46} stroke={KRP.red} strokeWidth={3} />
        </g>
        {/* 下: 子ども部屋 */}
        <path d="M -60 760 L 960 440 L 1980 760 L 1980 1140 L -60 1140 Z" fill={C.rug} />
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M ${-60 + i * 60} ${780 + i * 70} L ${1980 - i * 60} ${780 + i * 70}`} stroke={C.rugDark} strokeWidth={8} opacity={0.5} />
        ))}
        {/* 積み木 */}
        {[[300, 880, KRP.red], [380, 880, KRP.blue], [340, 812, KRP.yellow], [1560, 900, KRP.green], [1640, 900, KRP.orange]].map(([bx, by, col], i) => (
          <g key={i}>
            <rect x={(bx as number) - 36} y={(by as number) - 36} width={72} height={72} rx={6} fill={col as string} stroke={C.ink} strokeWidth={5} />
            <circle cx={bx as number} cy={by as number} r={14} fill={KRP.white} opacity={0.5} />
          </g>
        ))}
        {/* 境目の線 */}
        <path d="M -60 760 L 960 440 L 1980 760 M 960 440 L 960 -60" stroke={C.ink} strokeWidth={6} fill="none" opacity={0.6} />
        {/* 真ん中の光 */}
        <circle cx={960} cy={420} r={420} fill={NP.glow} opacity={0.16} />
        {/* 手と名札 */}
        <Nafuda x={NX} y={NY} s={S} text="山田 花子" hang={false} rot={tug.rot} f={f} />
        <NG1cThreeHands f={f} NX={NX} NY={NY} S={S} tug={tug} />
      </g>
      <TagPlate x={260} y={560} text="親" size={50} t={seg(f, 4, 12)} />
      <TagPlate x={1660} y={560} text="国" size={50} t={seg(f, 14, 22)} />
      <TagPlate x={560} y={760} text="子" size={50} t={seg(f, 24, 32)} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #158 そんな、ふしぎな持ち物なのです。
// 格: 並 / seed 4158
// どこ: やわらかな朝の光が差しこむ畳の部屋。床の間の前の低い台に、紫の布と札立て
// 演出: #157 の3本の手が、名札を札立てにそっと下ろして手を離す。名札の上に「?」と「!」が交互に浮かぶ。障子ごしの光の帯
// 動き: f0〜22 名札が下りる、f24〜36 手がひらいて少し離れる、f26から?と!が交互に (12コマごと)。光の帯がゆっくり揺れる
const Nm158: React.FC<{ f: number }> = ({ f }) => {
  const lower = easeInOut(seg(f, 0, 22));
  const rel = easeOut(seg(f, 24, 36));
  const S = 1.35;
  const NX = 960, NY = lerp(330, 470, lower);
  const marks = seg(f, 26, 32);
  const qOp = 0.5 + 0.5 * Math.cos((f * Math.PI) / 12);
  return (
    <Frame f={f} seed={4158}>
      {/* 壁と障子 */}
      <rect x={-40} y={-40} width={2000} height={760} fill={C.homeWall} />
      <g>
        <rect x={80} y={60} width={560} height={560} fill={KRP.white} stroke={C.boardDark} strokeWidth={10} />
        {Array.from({ length: 3 }, (_, i) => <line key={`v${i}`} x1={220 + i * 140} y1={60} x2={220 + i * 140} y2={620} stroke={C.boardDark} strokeWidth={5} />)}
        {Array.from({ length: 4 }, (_, i) => <line key={`h${i}`} x1={80} y1={172 + i * 112} x2={640} y2={172 + i * 112} stroke={C.boardDark} strokeWidth={5} />)}
        <rect x={80} y={60} width={560} height={560} fill={NP.glow} opacity={0.18 + Math.sin(f / 10) * 0.04} />
      </g>
      {/* 床の間 */}
      <rect x={1300} y={60} width={540} height={620} fill={C.homeDot} stroke={C.ink} strokeWidth={6} />
      <rect x={1290} y={40} width={22} height={680} fill={C.board} stroke={C.ink} strokeWidth={5} />
      <g transform={`rotate(${Math.sin(f / 20) * 1} 1570 120)`}>
        <line x1={1570} y1={70} x2={1570} y2={110} stroke={C.ink} strokeWidth={4} />
        <rect x={1490} y={110} width={160} height={420} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <circle cx={1570} cy={270} r={50} fill="none" stroke={C.ink} strokeWidth={10} opacity={0.75} strokeDasharray="250 60" />
        <rect x={1480} y={520} width={180} height={18} rx={9} fill={C.board} stroke={C.ink} strokeWidth={4} />
      </g>
      {/* 畳 */}
      <rect x={-40} y={700} width={2000} height={440} fill={C.tatami} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-40} y1={712 + i * 13} x2={1960} y2={712 + i * 13} stroke={C.tatamiDark} strokeWidth={2} opacity={0.6} />)}
      <line x1={700} y1={700} x2={600} y2={1100} stroke={C.boardDark} strokeWidth={12} />
      {/* 光の帯 */}
      <path d={`M 640 120 L ${1100 + Math.sin(f / 14) * 20} 120 L ${1500 + Math.sin(f / 14) * 20} 1080 L 900 1080 Z`} fill={NP.glowCore} opacity={0.32} />
      <circle cx={960} cy={420} r={360} fill={NP.glow} opacity={0.18} />
      {/* 低い台と紫の布 */}
      <rect x={600} y={640} width={720} height={60} rx={8} fill={C.board} stroke={C.ink} strokeWidth={6} />
      <rect x={640} y={700} width={40} height={120} fill={C.boardDark} stroke={C.ink} strokeWidth={5} />
      <rect x={1240} y={700} width={40} height={120} fill={C.boardDark} stroke={C.ink} strokeWidth={5} />
      <path d="M 700 600 L 1220 600 L 1260 650 L 660 650 Z" fill={C.cloth} stroke={C.ink} strokeWidth={5} />
      <path d="M 720 620 L 1200 620" stroke={C.clothDark} strokeWidth={4} />
      {/* 札立て */}
      <rect x={820} y={586} width={280} height={30} rx={8} fill={NP.woodDark} stroke={C.ink} strokeWidth={5} />
      <rect x={820} y={566} width={30} height={40} rx={4} fill={NP.woodMid} stroke={C.ink} strokeWidth={4} />
      <rect x={1070} y={566} width={30} height={40} rx={4} fill={NP.woodMid} stroke={C.ink} strokeWidth={4} />
      {/* 着地の小さな光 */}
      {f > 20 && f < 34 && <ellipse cx={960} cy={596} rx={200 + seg(f, 20, 34) * 120} ry={20} fill={NP.glow} opacity={0.5 * (1 - seg(f, 20, 34))} />}
      <Nafuda x={NX} y={NY} s={S} text="山田 花子" hang={false} f={f} />
      <NG1cThreeHands f={f} NX={NX} NY={NY} S={S} spread={rel * 110} open={rel} tug={{ p: 0, s: 0, k: 0 }} kidFade={seg(f, 24, 34)} />
      {/* ? と ! */}
      {marks > 0 && (
        <g>
          <QMark x={860} y={250} s={1.2 * (0.6 + 0.4 * qOp)} f={f} t={marks} color={C.ledger} />
          <g opacity={marks} transform={`translate(1070 ${250 + Math.sin(f / 9) * 5}) scale(${1.2 * (1 - 0.4 * qOp)})`}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={KRP.orange}
              stroke={C.ink} strokeWidth={5} paintOrder="stroke" opacity={0.35 + 0.65 * (1 - qOp)}>！</text>
          </g>
        </g>
      )}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #159 では、名前に値打ちがついたら、それは誰のものになるのでしょうか。
// 格: 並 / seed 4159
// どこ: 夜の商家の帳場。暖簾・行灯・大福帳の棚・そろばん。真鍮のフックに名札
// 演出: 名札が少しずつ金色に光り始め、右の結び目 (信用) の金具がカチリと光る。まわりに小判と$の硬貨がちらりと浮かぶ (次章の予告)
// 動き: f4〜30 金色の光が満ちる、f30〜34 右の結び目がカチリ (光の輪)、f12〜40 小判と$がひとつずつ浮かぶ。カメラは右の結び目へゆっくり寄る
const Nm159: React.FC<{ f: number }> = ({ f }) => {
  const NX = 960, NY = 430, S = 1.6;
  const knot = nafudaKnot("shinyo", NX, NY, S);
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + 0.1 * cam;
  const gold = easeInOut(seg(f, 4, 30));
  const click = seg(f, 30, 34);
  const ring = seg(f, 30, 42);
  const sway = Math.sin(f / 22) * 1.6;
  const coins: { x: number; y: number; a: number; kind: "koban" | "dollar" }[] = [
    { x: 420, y: 300, a: 12, kind: "koban" },
    { x: 1500, y: 250, a: 16, kind: "dollar" },
    { x: 520, y: 640, a: 22, kind: "dollar" },
    { x: 1420, y: 690, a: 26, kind: "koban" },
    { x: 700, y: 170, a: 32, kind: "koban" },
    { x: 1260, y: 160, a: 36, kind: "dollar" },
  ];
  return (
    <Frame f={f} seed={4159} dark bg={C.night}>
      <g transform={`translate(${knot[0]} ${knot[1]}) scale(${sc}) translate(${-knot[0]} ${-knot[1]})`}>
        {/* 帳場の壁 */}
        <rect x={-40} y={-40} width={2000} height={1160} fill={C.nightWall} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={i * 210} y1={-40} x2={i * 210} y2={720} stroke={C.night} strokeWidth={6} opacity={0.6} />
        ))}
        {/* 暖簾 */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 15 + i) * 1.5} ${60 + i * 120} 0)`}>
            <rect x={10 + i * 120} y={-10} width={110} height={300} fill={C.ledgerDark} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {/* 大福帳の棚 */}
        <rect x={1500} y={300} width={400} height={20} fill={C.nightWood} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={1520 + i * 72} y={160 - (i % 2) * 10} width={62} height={140 + (i % 2) * 10} rx={4}
            fill={i % 2 ? C.formPaper : NP.wood} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 行灯 */}
        <g>
          <circle cx={260} cy={560} r={240} fill={C.lantern} opacity={0.12 + Math.sin(f / 6) * 0.02} />
          <rect x={190} y={440} width={140} height={200} rx={10} fill={NP.glowCore} stroke={C.ink} strokeWidth={6} />
          <rect x={190} y={440} width={140} height={200} rx={10} fill={C.lantern} opacity={0.35 + Math.sin(f / 5) * 0.06} />
          <line x1={260} y1={440} x2={260} y2={640} stroke={C.nightWood} strokeWidth={5} />
          <rect x={176} y={640} width={168} height={60} fill={C.nightWood} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* 帳場の机 */}
        <rect x={-40} y={720} width={2000} height={440} fill={C.nightWood} stroke={C.ink} strokeWidth={6} />
        <rect x={-40} y={720} width={2000} height={26} fill={C.boardDark} />
        {/* そろばん */}
        <g transform="translate(1280 790) rotate(-4)">
          <rect x={-200} y={-50} width={400} height={110} rx={8} fill={C.boardDark} stroke={C.ink} strokeWidth={5} />
          <line x1={-196} y1={-16} x2={196} y2={-16} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <line x1={-170 + i * 34} y1={-46} x2={-170 + i * 34} y2={56} stroke={C.ink} strokeWidth={3} />
              <ellipse cx={-170 + i * 34} cy={-32} rx={14} ry={9} fill={C.court} stroke={C.ink} strokeWidth={2.5} />
              <ellipse cx={-170 + i * 34} cy={10 + (i % 3) * 8} rx={14} ry={9} fill={C.court} stroke={C.ink} strokeWidth={2.5} />
            </g>
          ))}
        </g>
        {/* 吊るしのフック */}
        <rect x={700} y={110} width={520} height={50} rx={10} fill={C.nightWood} stroke={C.ink} strokeWidth={6} />
        <path d={`M ${NX} 160 L ${NX} 186`} stroke={NP.brassDark} strokeWidth={9} strokeLinecap="round" />
        {/* 名札の金色の後光 */}
        {[1, 0.75, 0.5].map((k, i) => (
          <ellipse key={i} cx={NX} cy={NY} rx={(420 + gold * 80) * k} ry={(260 + gold * 50) * k} fill={NP.glow} opacity={(0.04 + gold * 0.1)} />
        ))}
        <Nafuda x={NX} y={NY} s={S} text="山田 花子" knots={{ mimi: 1, chobo: 1, shinyo: click }} f={f} />
        {/* 札の上の金色のかぶり + 光の筋 */}
        <defs>
          <clipPath id="ng1c159clip"><rect x={-200} y={-95} width={400} height={190} rx={22} /></clipPath>
        </defs>
        <g transform={`translate(${NX} ${NY}) scale(${S}) rotate(${sway})`}>
          <g clipPath="url(#ng1c159clip)">
            <rect x={-200} y={-95} width={400} height={190} fill={NP.glow} opacity={gold * 0.18} />
            <polygon points={`${-260 + gold * 520},-100 ${-200 + gold * 520},-100 ${-280 + gold * 520},100 ${-340 + gold * 520},100`} fill={NP.glowCore} opacity={0.55 * gold} />
          </g>
          <rect x={-200} y={-95} width={400} height={190} rx={22} fill="none" stroke={NP.brass} strokeWidth={6 * gold} opacity={gold} />
        </g>
        {/* 信用の結び目のカチリ */}
        {click > 0 && (
          <g>
            <circle cx={knot[0]} cy={knot[1]} r={40 + ring * 70} fill="none" stroke={NP.shinyo} strokeWidth={10 * (1 - ring) + 2} opacity={1 - ring * 0.7} />
            <g stroke={NP.glow} strokeWidth={6} strokeLinecap="round" opacity={1 - ring * 0.6}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line key={a} x1={knot[0] + Math.cos(a * D2R) * 48} y1={knot[1] + Math.sin(a * D2R) * 48}
                  x2={knot[0] + Math.cos(a * D2R) * (70 + ring * 30)} y2={knot[1] + Math.sin(a * D2R) * (70 + ring * 30)} />
              ))}
            </g>
          </g>
        )}
        {/* 小判と$ */}
        {coins.map((c, i) => {
          const t = seg(f, c.a - 18, c.a - 10);
          if (t <= 0) return null;
          const flick = 0.75 + 0.25 * Math.sin(f / 3 + i * 2);
          const bob = Math.sin(f / 8 + i) * 8;
          return (
            <g key={i} transform={`translate(${c.x} ${c.y + bob}) scale(${pop(t)}) rotate(${Math.sin(f / 10 + i) * 8})`} opacity={flick}>
              {c.kind === "koban" ? (
                <g>
                  <ellipse rx={56} ry={80} fill={C.koban} stroke={C.ink} strokeWidth={6} />
                  {[-40, -20, 0, 20, 40].map((ky) => <line key={ky} x1={-34} y1={ky} x2={34} y2={ky} stroke={C.kobanDark} strokeWidth={4} />)}
                  <ellipse rx={18} ry={26} fill={C.kobanDark} opacity={0.5} />
                </g>
              ) : (
                <g>
                  <circle r={58} fill={C.dollar} stroke={C.ink} strokeWidth={6} />
                  <circle r={44} fill="none" stroke={C.dollarDark} strokeWidth={4} />
                  <text y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={KRP.white}>$</text>
                </g>
              )}
            </g>
          );
        })}
      </g>
      <ItoLegend x={1640} y={480} s={0.85} lit={{ mimi: 1, chobo: 1, shinyo: click }} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_152: (f) => <Nm152 f={f} />,
  nm_153: (f) => <Nm153 f={f} />,
  nm_154: (f) => <Nm154 f={f} />,
  nm_155: (f) => <Nm155 f={f} />,
  nm_156: (f) => <Nm156 f={f} />,
  nm_157: (f) => <Nm157 f={f} />,
  nm_158: (f) => <Nm158 f={f} />,
  nm_159: (f) => <Nm159 f={f} />,
};

export const NM_G1C_MOTIFS: string[] = [
  "nm_152", // #152
  "nm_153", // #153
  "nm_154", // #154
  "nm_155", // #155
  "nm_156", // #156
  "nm_157", // #157
  "nm_158", // #158
  "nm_159", // #159
];

export const namaeG1cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
