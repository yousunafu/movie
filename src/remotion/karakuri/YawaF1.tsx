// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#148〜#157 (10文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-5.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで10枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L4a。
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
  // 朝の光・子ども部屋
  morning: "#FBE7B5",
  sky: "#CFE3EE",
  wallNursery: "#EFE4CC",
  wallDot: "#E2D3B4",
  woodLight: "#D2AE84",
  wood: "#B88A5E",
  woodDark: "#8A6444",
  // 毛布の切れはし (全シーン同じ色)
  blanket: "#BFD6E8",
  blanketDark: "#8FB0CC",
  blanketEdge: "#F3E6C4",
  // くまのぬいぐるみ
  bear: "#B98A5E",
  bearDark: "#8C6440",
  bearMuzzle: "#E6CBA6",
  bearPatch: "#9FC8C0",
  // サル
  monkey: "#8A6446",
  monkeyDark: "#634631",
  monkeyFace: "#E6C4A2",
  // 森
  leaf: "#7FB06E",
  leafDark: "#4F8550",
  leafLight: "#A9CF8C",
  trunk: "#7A5A3E",
  trunkDark: "#5A402B",
  forestSky: "#DDEBD0",
  // 病院
  hospWall: "#E3EEF0",
  hospTile: "#CADBDF",
  hospGlass: "#D8ECF2",
  // 黒板
  board: "#2F4A3F",
  boardDark: "#243A31",
  chalk: "#F2EFE4",
  chalkYellow: "#F3DF8A",
  chalkPink: "#F2B5B0",
  chalkBlue: "#A9D2EA",
  // 人の服
  mom: "#D98C8C",
  momDark: "#B86E70",
  momSkirt: "#7C6A8E",
  suit: "#4A4A55",
  suitDark: "#35353D",
  whiteHair: "#E9E6DF",
  onesie: "#F4E3A1",
  onesieDark: "#D9C477",
  babyCheek: "#F4B9B2",
  // リビング
  wallWarm: "#F2DFC2",
  sofaSage: "#9DB59A",
  sofaSageDark: "#7C977A",
  curtain: "#EBC79A",
  curtainDark: "#D3A877",
  rug: "#D49A72",
  rugDark: "#A86F4E",
  // ロンドン
  fog: "#D7DCDA",
  postRed: "#C8352A",
  ukBlue: "#2E4A8C",
  fire: "#F2A23C",
  brick: "#B5684C",
  brickDark: "#8E4C36",
  // 古い紙
  paperOld: "#ECE0C2",
  paperOldDark: "#D4C39C",
  sepia: "#7A5C3C",
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

// Person と同じ上下ゆれ (髪や小物を Person に重ねるとき用)
const pBob = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ---- 毛布の切れはし (くたくた・ほつれ・縁のサテン)。原点は「つまむ所」。下へ垂れる。len は垂れの長さ
const L4aBlanket: React.FC<{
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
      {/* 格子の織り柄 */}
      <g stroke={C.blanketDark} strokeWidth={3} opacity={0.7} fill="none">
        {[0.25, 0.5, 0.75].map((k, i) => (
          <path key={i} d={`M ${-72 + w1 * k * 0.6} ${L * k} Q 0 ${L * k + 8} ${76 + w1 * k} ${L * k - 4}`} />
        ))}
        {[-36, 0, 36].map((xx, i) => (
          <path key={i} d={`M ${xx} 2 Q ${xx + 6} ${L * 0.5} ${xx + w1 * 0.9} ${L - 6}`} />
        ))}
      </g>
      {/* 縁のサテン (すり切れて一部はがれている) */}
      <path d="M -70 0 Q -20 -14 70 -4 L 68 12 Q -20 2 -68 16 Z" fill={C.blanketEdge} stroke={C.ink} strokeWidth={4} />
      {/* ほつれ糸 */}
      <g stroke={C.blanketDark} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d={`M ${30 + w1} ${L + 4} q 4 14 -2 24`} />
        <path d={`M ${-34 + w1} ${L} q -6 12 2 20`} />
      </g>
      {/* 毛玉 */}
      {[[-30, L * 0.36], [24, L * 0.6], [48, L * 0.2]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={4} fill={C.blanketDark} opacity={0.8} />
      ))}
    </g>
  );
};

// ---- くたくたのくま (片目のボタンが取れて×の縫い跡・つぎあて・綿がはみ出す)。原点は足元中央
const L4aBear: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={C.ink} strokeWidth={4.5}>
    {/* 足 */}
    <ellipse cx={-26} cy={-14} rx={22} ry={16} fill={C.bear} />
    <ellipse cx={26} cy={-14} rx={22} ry={16} fill={C.bear} />
    <ellipse cx={-26} cy={-12} rx={11} ry={8} fill={C.bearMuzzle} strokeWidth={3} />
    {/* 胴 */}
    <ellipse cx={0} cy={-58} rx={44} ry={46} fill={C.bear} />
    <ellipse cx={0} cy={-52} rx={26} ry={28} fill={C.bearMuzzle} strokeWidth={3.5} />
    {/* つぎあて + 縫い目 */}
    <rect x={8} y={-80} width={26} height={22} rx={3} fill={C.bearPatch} strokeWidth={3.5} transform="rotate(12 21 -69)" />
    <g strokeWidth={2.5}>
      {[0, 1, 2].map((i) => <line key={i} x1={10 + i * 9} y1={-84 + i * 2} x2={12 + i * 9} y2={-77 + i * 2} />)}
    </g>
    {/* 腕 */}
    <ellipse cx={-46} cy={-70} rx={16} ry={26} fill={C.bear} transform="rotate(30 -46 -70)" />
    <ellipse cx={46} cy={-70} rx={16} ry={26} fill={C.bear} transform="rotate(-30 46 -70)" />
    {/* 頭 */}
    <circle cx={-34} cy={-158} r={17} fill={C.bear} />
    <circle cx={-34} cy={-158} r={8} fill={C.bearMuzzle} strokeWidth={3} />
    <circle cx={34} cy={-158} r={17} fill={C.bear} />
    <circle cx={0} cy={-128} r={44} fill={C.bear} />
    <ellipse cx={0} cy={-114} rx={20} ry={15} fill={C.bearMuzzle} strokeWidth={3.5} />
    <ellipse cx={0} cy={-120} rx={7} ry={5} fill={C.ink} stroke="none" />
    <path d="M 0 -115 L 0 -108 M -7 -104 Q 0 -100 7 -104" fill="none" strokeWidth={3} strokeLinecap="round" />
    {/* 目: 左は黒ボタン、右は取れて×の糸 */}
    <circle cx={-16} cy={-136} r={6} fill={C.ink} stroke="none" />
    <circle cx={-18} cy={-138} r={1.8} fill={KRP.white} stroke="none" />
    <g strokeWidth={3} strokeLinecap="round">
      <line x1={10} y1={-142} x2={22} y2={-130} />
      <line x1={22} y1={-142} x2={10} y2={-130} />
    </g>
    {/* はみ出た綿 */}
    <path d="M -44 -40 q -12 -4 -10 8 q -8 6 2 12 q 6 6 12 -2" fill={KRP.white} strokeWidth={3} />
  </g>
);

// ---- お母さん (カーディガン + 後ろでまとめた髪)。Person の上に髪の団子を足す
const L4aMom: React.FC<{
  x: number; y: number; s?: number; f: number; face?: "normal" | "smile" | "joy" | "worried" | "surprised";
  pose?: "stand" | "hold" | "point" | "raise"; lean?: number; gaze?: [number, number]; phase?: number; pointDir?: 1 | -1;
}> = ({ x, y, s = 1, f, face = "smile", pose = "stand", lean = 0, gaze = [0, 0], phase = 2, pointDir = 1 }) => {
  const b = pBob(f, phase);
  return (
    <g>
      {/* 団子 (頭の後ろの層) */}
      <g transform={`translate(${x} ${y + b}) scale(${s}) rotate(${lean})`}>
        <circle cx={-48} cy={-262} r={26} fill={C.ink} />
        <path d="M -60 -200 Q -78 -160 -62 -150 L -52 -190 Z" fill={C.ink} />
      </g>
      <Person x={x} y={y} s={s} f={f} phase={phase} face={face} pose={pose} lean={lean}
        gaze={gaze} cloth={C.mom} clothDark={C.momSkirt} hair="cap" pointDir={pointDir} />
      {/* カーディガンの前立てとボタン */}
      <g transform={`translate(${x} ${y + b}) scale(${s}) rotate(${lean})`}>
        <line x1={0} y1={-158} x2={0} y2={-54} stroke={C.momDark} strokeWidth={4} />
        {[-134, -110, -86].map((yy) => <circle key={yy} cx={-8} cy={yy} r={4} fill={KRP.white} stroke={C.ink} strokeWidth={2} />)}
      </g>
    </g>
  );
};

// ---- ウィニコット (背広・白髪・穏やかな笑顔)。hair="none" に白い髪を描き足す
const L4aWinnicott: React.FC<{
  x: number; y: number; s?: number; f: number; pose?: "stand" | "hold" | "point"; lean?: number;
  gaze?: [number, number]; face?: "smile" | "normal" | "joy"; pointDir?: 1 | -1;
}> = ({ x, y, s = 1, f, pose = "stand", lean = 0, gaze = [0, 0], face = "smile", pointDir = 1 }) => {
  const b = pBob(f, 3);
  return (
    <g>
      <Person x={x} y={y} s={s} f={f} phase={3} face={face} pose={pose} lean={lean} gaze={gaze}
        cloth={C.suit} clothDark={C.suitDark} hair="none" pointDir={pointDir} />
      <g transform={`translate(${x} ${y + b}) scale(${s}) rotate(${lean})`}>
        {/* 白髪: 横と後ろに残り、てっぺんは薄い */}
        <path d="M -64 -222 Q -70 -268 -40 -284 Q -46 -262 -50 -232 Z" fill={C.whiteHair} stroke={C.ink} strokeWidth={4} />
        <path d="M 64 -222 Q 70 -268 40 -284 Q 46 -262 50 -232 Z" fill={C.whiteHair} stroke={C.ink} strokeWidth={4} />
        <path d="M -36 -286 Q 0 -300 36 -286 Q 10 -280 -4 -284 Q -20 -280 -36 -286 Z" fill={C.whiteHair} stroke={C.ink} strokeWidth={3.5} />
        {/* 白い眉の上書き */}
        <g stroke={C.whiteHair} strokeWidth={3} strokeLinecap="round" opacity={0.9}>
          <line x1={-32} y1={-252} x2={-16} y2={-253} />
          <line x1={16} y1={-253} x2={32} y2={-252} />
        </g>
        {/* 白いシャツの襟とネクタイ */}
        <polygon points="-26,-160 0,-128 26,-160" fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <polygon points="-7,-150 7,-150 10,-96 0,-84 -10,-96" fill="#7A3B3B" stroke={C.ink} strokeWidth={3.5} />
        {/* 背広の襟 */}
        <path d="M -28 -160 L -10 -112 L -40 -132 Z M 28 -160 L 10 -112 L 40 -132 Z" fill={C.suitDark} stroke={C.ink} strokeWidth={3.5} />
      </g>
    </g>
  );
};

// ---- おくるみの赤ちゃん。原点は足元。rot で寝かせる。cry で泣き顔 (口を開けて涙)
const L4aBaby: React.FC<{
  x: number; y: number; s?: number; f: number; rot?: number;
  face?: "smile" | "sad" | "normal" | "joy"; cry?: number; phase?: number; fists?: boolean; sleepy?: boolean;
}> = ({ x, y, s = 0.45, f, rot = 0, face = "smile", cry = 0, phase = 5, fists = false, sleepy = false }) => {
  const b = pBob(f, phase);
  const flail = Math.sin(f / 2.6) * 10 * cry;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* フードの後ろ側 */}
      <g transform={`translate(0 ${b}) scale(${s})`}>
        <ellipse cx={0} cy={-226} rx={86} ry={84} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
      </g>
      <Person x={0} y={0} s={s} f={f} phase={phase} face={face} pose="stand" hair="none"
        cloth={KRP.white} clothDark={KRP.white} still />
      <g transform={`scale(${s})`}>
        {/* 頬 */}
        <circle cx={-40} cy={-196} r={11} fill={C.babyCheek} opacity={0.8} />
        <circle cx={40} cy={-196} r={11} fill={C.babyCheek} opacity={0.8} />
        {/* 安心してとろんと閉じた目 */}
        {sleepy && (
          <g>
            <ellipse cx={-24} cy={-222} rx={19} ry={24} fill={KRP.white} />
            <ellipse cx={24} cy={-222} rx={19} ry={24} fill={KRP.white} />
            <path d="M -36 -222 Q -24 -210 -12 -222 M 12 -222 Q 24 -210 36 -222" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {/* ちょこんと前髪 */}
        <path d="M -6 -290 q 10 -18 22 -6 q -12 -4 -14 10" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        {/* 泣き口と涙 */}
        {cry > 0 && (
          <g opacity={cry}>
            <path d="M -22 -194 Q 0 -206 22 -194 Q 18 -164 0 -162 Q -18 -164 -22 -194 Z" fill={C.ink} />
            <ellipse cx={0} cy={-170} rx={10} ry={5} fill="#E06A5A" />
            <path d={`M -32 -206 Q -42 ${-180 + (f % 12)} -34 ${-160 + (f % 12)}`} fill="none" stroke="#7FA8C9" strokeWidth={7} strokeLinecap="round" />
            <path d={`M 32 -206 Q 42 ${-182 + ((f + 6) % 12)} 34 ${-162 + ((f + 6) % 12)}`} fill="none" stroke="#7FA8C9" strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {/* おくるみ本体 (体をすっぽり包む) */}
        <path d="M -82 -162 Q -96 -60 -46 6 Q 0 22 46 6 Q 96 -60 82 -162 Q 40 -150 0 -150 Q -40 -150 -82 -162 Z"
          fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <path d="M -82 -162 Q -10 -120 60 -20" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
        <path d="M 82 -162 Q 40 -130 20 -100" fill="none" stroke={C.ink} strokeWidth={3.5} opacity={0.5} />
        <g stroke={C.blanketDark} strokeWidth={3} opacity={0.55}>
          <path d="M -60 -60 q 20 6 40 0" fill="none" />
          <path d="M -40 -20 q 20 6 40 0" fill="none" />
        </g>
        {/* 小さなこぶし (泣くと振る) */}
        {fists && (
          <g>
            <circle cx={-74} cy={-122 - flail} r={16} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
            <circle cx={74} cy={-122 + flail} r={16} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          </g>
        )}
      </g>
    </g>
  );
};

// ---- サル (横向き・右向き、四つ足)。原点はお腹の真下の地面。baby で背中に子ザル
const L4aMonkey: React.FC<{
  x: number; y: number; s?: number; f: number; rot?: number; baby?: boolean; step?: number; speed?: number;
}> = ({ x, y, s = 1, f, rot = 0, baby = true, step = 1, speed = 4 }) => {
  const sw = Math.sin(f / speed) * 16 * step;
  const leg = (bx: number, by: number, a: number, dark?: boolean) => (
    <g transform={`rotate(${a} ${bx} ${by})`}>
      <rect x={bx - 12} y={by} width={24} height={70} rx={12} fill={dark ? C.monkeyDark : C.monkey} stroke={C.ink} strokeWidth={4.5} />
      <ellipse cx={bx + 6} cy={by + 70} rx={18} ry={10} fill={C.monkeyFace} stroke={C.ink} strokeWidth={4} />
    </g>
  );
  const tailWag = Math.sin(f / 9) * 8;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* しっぽ */}
      <path d={`M -120 -92 Q -200 ${-100 + tailWag} -196 -170 Q -190 -214 -150 ${-206 + tailWag}`}
        fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
      <path d={`M -120 -92 Q -200 ${-100 + tailWag} -196 -170 Q -190 -214 -150 ${-206 + tailWag}`}
        fill="none" stroke={C.monkey} strokeWidth={13} strokeLinecap="round" />
      {/* 奥の足 */}
      {leg(-80, -66, -sw, true)}
      {leg(90, -66, sw, true)}
      {/* 胴 */}
      <ellipse cx={0} cy={-92} rx={132} ry={58} fill={C.monkey} stroke={C.ink} strokeWidth={5.5} />
      <path d="M -90 -70 Q 0 -46 90 -70" fill="none" stroke={C.monkeyFace} strokeWidth={10} opacity={0.6} />
      {/* 毛並み */}
      <g stroke={C.monkeyDark} strokeWidth={3.5} strokeLinecap="round">
        {[-80, -40, 0, 40].map((xx) => <path key={xx} d={`M ${xx} -132 q 8 -6 16 0`} fill="none" />)}
      </g>
      {/* 手前の足 */}
      {leg(-60, -66, sw)}
      {leg(110, -66, -sw)}
      {/* 頭 */}
      <circle cx={150} cy={-140} r={18} fill={C.monkey} stroke={C.ink} strokeWidth={4.5} />
      <circle cx={130} cy={-176} r={16} fill={C.monkeyFace} stroke={C.ink} strokeWidth={4} />
      <circle cx={160} cy={-140} r={56} fill={C.monkey} stroke={C.ink} strokeWidth={5.5} />
      <path d="M 166 -180 Q 222 -178 212 -120 Q 206 -96 176 -100 Q 150 -110 156 -140 Q 150 -176 166 -180 Z"
        fill={C.monkeyFace} stroke={C.ink} strokeWidth={4.5} />
      <circle cx={186} cy={-150} r={7} fill={C.ink} />
      <circle cx={184} cy={-152} r={2} fill={KRP.white} />
      <path d="M 174 -166 q 14 -8 26 0" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <circle cx={206} cy={-130} r={2.5} fill={C.ink} />
      <path d="M 192 -112 q 8 4 16 -2" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
      {/* 背中の子ザル (しがみつく) */}
      {baby && (
        <g transform={`translate(0 ${Math.sin(f / 5) * 2})`}>
          <path d="M -70 -150 Q -120 -150 -130 -190" fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
          <path d="M -70 -150 Q -120 -150 -130 -190" fill="none" stroke={C.monkey} strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={-10} cy={-154} rx={64} ry={30} fill={C.monkey} stroke={C.ink} strokeWidth={4.5} transform="rotate(-6 -10 -154)" />
          {/* 背中を抱える腕 (胴の脇へ回り込む) */}
          <path d="M 20 -150 Q 52 -130 40 -96" fill="none" stroke={C.ink} strokeWidth={17} strokeLinecap="round" />
          <path d="M 20 -150 Q 52 -130 40 -96" fill="none" stroke={C.monkeyDark} strokeWidth={9} strokeLinecap="round" />
          <circle cx={40} cy={-96} r={9} fill={C.monkeyFace} stroke={C.ink} strokeWidth={3.5} />
          <path d="M -40 -146 Q -56 -120 -46 -98" fill="none" stroke={C.ink} strokeWidth={17} strokeLinecap="round" />
          <path d="M -40 -146 Q -56 -120 -46 -98" fill="none" stroke={C.monkeyDark} strokeWidth={9} strokeLinecap="round" />
          <circle cx={-46} cy={-98} r={9} fill={C.monkeyFace} stroke={C.ink} strokeWidth={3.5} />
          {/* 頭 */}
          <circle cx={44} cy={-190} r={11} fill={C.monkeyFace} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={64} cy={-180} r={32} fill={C.monkey} stroke={C.ink} strokeWidth={4.5} />
          <ellipse cx={78} cy={-176} rx={20} ry={22} fill={C.monkeyFace} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={84} cy={-184} r={6} fill={C.ink} />
          <circle cx={82} cy={-186} r={2} fill={KRP.white} />
          <path d="M 82 -166 q 6 3 12 -1" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// ---- 葉っぱのかたまり (木の葉。f でそよぐ)
const L4aLeaves: React.FC<{ x: number; y: number; s?: number; f: number; seed: number; n?: number }> = ({ x, y, s = 1, f, seed, n = 9 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rnd(seed, i);
      const r = 40 + rnd(seed + 1, i) * 70;
      const lx = Math.cos(a) * r * 1.3;
      const ly = Math.sin(a) * r * 0.8;
      const sway = Math.sin((f + i * 7) / 11) * 6;
      return (
        <ellipse key={i} cx={lx + sway} cy={ly} rx={46} ry={26} fill={i % 3 === 0 ? C.leafLight : i % 3 === 1 ? C.leaf : C.leafDark}
          stroke={C.ink} strokeWidth={4} transform={`rotate(${rnd(seed + 2, i) * 80 - 40} ${lx + sway} ${ly})`} />
      );
    })}
  </g>
);

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#148 【山】 第8章、自分ではない、はじめての持ち物。
// どこ: 朝の子ども部屋。右上に窓 (外に木の葉)、左にベビーベッド。床は板張り、ラグ・積み木・おもちゃ。
// 演出: 窓から斜めの朝の光がベッドに落ち、柵に掛かった毛布の切れはしが光の中で揺れる。上にモビール。題字は右下の帯。
// 動き: カメラがベッドへゆっくり寄る。f10〜30 に風がふっと入り、カーテンと毛布が大きく揺れる。光の中のホコリが漂う。モビールが回る。
const Yw148: React.FC<{ f: number }> = ({ f }) => {
  const door = seg(f, 4, 20);
  const gust = Math.sin(seg(f, 8, 34) * Math.PI);
  const zoom = 1 + 0.06 * easeInOut(seg(f, 0, 42));
  const swing = Math.sin(f / 10) * 4 + gust * 12;
  const mob = f / 18;
  return (
    <Frame f={f} seed={3148} bg={C.wallNursery}
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={8} title="自分ではない、はじめての持ち物" t={door} left={1000} top={560} />
      </>}>
      <g transform={cam(560, 560, zoom)}>
        {/* 壁紙 (小さな星の水玉) */}
        <rect x={-60} y={-60} width={W + 120} height={900} fill={C.wallNursery} />
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} cx={(i % 12) * 170 + ((i / 12) | 0) % 2 * 85} cy={40 + ((i / 12) | 0) * 160} r={7} fill={C.wallDot} />
        ))}
        {/* 腰板 */}
        <rect x={-60} y={640} width={W + 120} height={180} fill={C.woodLight} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={i * 130} y1={646} x2={i * 130} y2={818} stroke={C.wood} strokeWidth={4} />
        ))}
        {/* 窓 (右上) */}
        <rect x={1150} y={70} width={520} height={400} rx={8} fill={C.sky} stroke={C.ink} strokeWidth={7} />
        <circle cx={1580} cy={150} r={46} fill={C.morning} opacity={0.9} />
        <L4aLeaves x={1260} y={170} s={1.1} f={f + gust * 20} seed={11} n={10} />
        <L4aLeaves x={1520} y={400} s={0.9} f={f} seed={23} n={8} />
        <path d="M 1150 440 Q 1300 380 1400 470" fill="none" stroke={C.trunk} strokeWidth={14} />
        <line x1={1410} y1={70} x2={1410} y2={470} stroke={C.ink} strokeWidth={8} />
        <line x1={1150} y1={270} x2={1670} y2={270} stroke={C.ink} strokeWidth={8} />
        <rect x={1130} y={466} width={560} height={26} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        {/* カーテン (風でふくらむ) */}
        <path d={`M 1110 40 L 1180 40 Q ${1190 + gust * 60} 260 ${1150 + gust * 90} 500 L 1100 500 Q 1080 260 1110 40 Z`}
          fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        <path d={`M 1720 40 L 1650 40 Q ${1640 - gust * 40} 260 ${1680 - gust * 50} 500 L 1730 500 Q 1750 260 1720 40 Z`}
          fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        <rect x={1080} y={28} width={680} height={18} rx={9} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        {/* 床 */}
        <rect x={-60} y={818} width={W + 120} height={330} fill={KRP.floor} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={-60} y1={850 + i * 50} x2={W + 60} y2={850 + i * 50} stroke={C.wood} strokeWidth={3} opacity={0.6} />
        ))}
        <ellipse cx={560} cy={930} rx={520} ry={90} fill={C.blanketEdge} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={560} cy={930} rx={440} ry={66} fill="none" stroke={C.curtainDark} strokeWidth={5} strokeDasharray="18 12" />
        {/* 朝の光の帯 (窓からベッドへ) */}
        <g opacity={0.42 + Math.sin(f / 15) * 0.05}>
          <polygon points="1160,110 1420,110 820,900 260,900" fill={C.morning} />
          <polygon points="1420,290 1660,290 1260,900 900,900" fill={C.morning} opacity={0.6} />
        </g>
        {/* ベビーベッド */}
        <g>
          {/* 奥の柵 */}
          <rect x={150} y={420} width={760} height={24} rx={8} fill={C.wood} stroke={C.ink} strokeWidth={5} />
          {/* マットレス・枕 */}
          <rect x={168} y={630} width={724} height={70} rx={14} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={196} y={580} width={170} height={64} rx={26} fill={C.blanketEdge} stroke={C.ink} strokeWidth={4.5} />
          <path d="M 470 640 Q 600 590 860 630 L 860 650 L 470 650 Z" fill={C.morning} stroke={C.ink} strokeWidth={4} />
          {/* 手前の柵 */}
          <rect x={150} y={470} width={760} height={30} rx={10} fill={C.woodLight} stroke={C.ink} strokeWidth={5.5} />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={196 + i * 50} y={500} width={16} height={250} fill={C.woodLight} stroke={C.ink} strokeWidth={4} />
          ))}
          <rect x={150} y={740} width={760} height={30} rx={10} fill={C.woodLight} stroke={C.ink} strokeWidth={5.5} />
          {/* 角の柱とキャスター */}
          {[150, 880].map((px) => (
            <g key={px}>
              <rect x={px - 8} y={400} width={46} height={450} rx={10} fill={C.wood} stroke={C.ink} strokeWidth={5.5} />
              <circle cx={px + 15} cy={398} r={22} fill={C.wood} stroke={C.ink} strokeWidth={5} />
              <circle cx={px + 15} cy={862} r={18} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4.5} />
            </g>
          ))}
          {/* 柵に掛かった毛布の切れはし (主役)。手前に垂れる部分 */}
          <path d="M 470 476 Q 540 440 610 472" fill={C.blanket} stroke={C.ink} strokeWidth={5} />
          <L4aBlanket x={540} y={478} s={1.25} rot={swing} wave={Math.sin(f / 7) * 0.5 + gust} len={0.95} />
        </g>
        {/* モビール (天井から) */}
        <g>
          <line x1={540} y1={-40} x2={540} y2={200} stroke={C.ink} strokeWidth={4} />
          <line x1={540 - 150 * Math.cos(mob)} y1={200} x2={540 + 150 * Math.cos(mob)} y2={200} stroke={C.woodDark} strokeWidth={7} strokeLinecap="round" />
          {[
            { k: 1, sh: "star", col: KRP.yellow },
            { k: -1, sh: "moon", col: C.blanketEdge },
          ].map(({ k, sh, col }) => {
            const mx = 540 + k * 150 * Math.cos(mob);
            const my = 280 + Math.sin(f / 8 + k) * 6;
            return (
              <g key={sh}>
                <line x1={mx} y1={200} x2={mx} y2={my - 34} stroke={C.ink} strokeWidth={3} />
                {sh === "star" ? (
                  <polygon transform={`translate(${mx} ${my}) scale(${0.6 + 0.4 * Math.abs(Math.sin(mob))})`}
                    points="0,-38 11,-12 38,-12 16,6 24,34 0,18 -24,34 -16,6 -38,-12 -11,-12"
                    fill={col} stroke={C.ink} strokeWidth={4.5} />
                ) : (
                  <path transform={`translate(${mx} ${my})`} d="M 10 -36 A 36 36 0 1 0 10 36 A 28 28 0 1 1 10 -36 Z" fill={col} stroke={C.ink} strokeWidth={4.5} />
                )}
              </g>
            );
          })}
          <g transform={`translate(540 ${300 + Math.sin(f / 9) * 5})`}>
            <line x1={0} y1={-100} x2={0} y2={-26} stroke={C.ink} strokeWidth={3} />
            <path d="M -40 10 Q -46 -24 -14 -24 Q -4 -44 20 -30 Q 46 -30 42 0 Q 46 18 20 16 L -24 16 Q -44 20 -40 10 Z" fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          </g>
        </g>
        {/* 光の中のホコリ */}
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={500 + rnd(48, i) * 600 + Math.sin((f + i * 9) / 17) * 20}
            cy={200 + rnd(49, i) * 520 - (f * 0.6 + i * 30) % 60}
            r={3 + rnd(50, i) * 3} fill={KRP.white} opacity={0.75} />
        ))}
        {/* 床のおもちゃ (積み木・ガラガラ) */}
        {[[960, 880, KRP.red, "A"], [1030, 880, KRP.blue, "B"], [995, 818, KRP.yellow, "C"]].map(([bx, by, col, l]) => (
          <g key={l as string}>
            <rect x={(bx as number) - 32} y={(by as number) - 62} width={64} height={62} rx={6} fill={col as string} stroke={C.ink} strokeWidth={4.5} />
            <text x={bx as number} y={(by as number) - 18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={KRP.white}>{l as string}</text>
          </g>
        ))}
        <g transform={`rotate(${Math.sin(f / 6) * 6} 140 900)`}>
          <line x1={90} y1={920} x2={150} y2={880} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
          <circle cx={170} cy={866} r={28} fill={KRP.orange} stroke={C.ink} strokeWidth={4.5} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#149 【山】 人間の赤ちゃんは、ほかのサルのなかまと比べても、とても未熟な状態で生まれてきます。
// どこ: 博物館の展示室の壁に、2つののぞき窓。左は森 (枝の上の母ザルと背中の子ザル)、右は病院の新生児室 (保育器のベッドで泣くおくるみの赤ちゃん)。
// 演出: 左は自分でしがみつけるたくましさ、右は泣くことしかできない頼りなさ。窓の下に札「サルの赤ちゃん」「ヒトの赤ちゃん」。
// 動き: カメラが左の窓から右の窓へゆっくりパン。母ザルは枝を歩き、子ザルは揺れてもしがみついたまま。人の赤ちゃんは f14〜 で泣き出し、こぶしを振る。
const Yw149: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(36, -36, easeInOut(seg(f, 0, 42)));
  const cry = seg(f, 12, 22);
  const walk = lerp(-40, 40, seg(f, 0, 42));
  return (
    <Frame f={f} seed={3149} bg={KRP.paper}>
      <defs>
        <clipPath id="l4a149L"><rect x={100} y={140} width={790} height={600} rx={20} /></clipPath>
        <clipPath id="l4a149R"><rect x={1030} y={140} width={790} height={600} rx={20} /></clipPath>
      </defs>
      <g transform={cam(960, 500, 1.04, pan)}>
        {/* 展示室の壁 (板張り + 腰壁) */}
        <rect x={-80} y={-60} width={W + 160} height={1200} fill={C.wallWarm} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-80 + i * 150} y1={-60} x2={-80 + i * 150} y2={820} stroke={C.curtainDark} strokeWidth={3} opacity={0.35} />
        ))}
        <rect x={-80} y={820} width={W + 160} height={300} fill={C.woodDark} stroke={C.ink} strokeWidth={5} />
        {/* ===== 左の窓: 森 ===== */}
        <g clipPath="url(#l4a149L)">
          <rect x={100} y={140} width={790} height={600} fill={C.forestSky} />
          {/* 遠くの木々 */}
          {[160, 300, 460, 640, 800].map((tx, i) => (
            <g key={i} opacity={0.55}>
              <rect x={tx - 12} y={300} width={24} height={440} fill={C.trunk} />
              <ellipse cx={tx} cy={300} rx={90} ry={110} fill={C.leafDark} />
            </g>
          ))}
          {/* 木漏れ日 */}
          <polygon points="420,140 520,140 380,740 260,740" fill={C.morning} opacity={0.35} />
          {/* 太い幹と横枝 */}
          <rect x={780} y={140} width={90} height={600} fill={C.trunk} stroke={C.ink} strokeWidth={6} />
          <path d="M 800 220 q 20 40 0 80 M 840 420 q -16 40 4 90" fill="none" stroke={C.trunkDark} strokeWidth={5} />
          <path d="M 90 590 Q 400 560 800 578 L 800 616 Q 400 604 90 632 Z" fill={C.trunk} stroke={C.ink} strokeWidth={6} />
          <path d="M 200 598 q 40 -6 80 2 M 520 588 q 50 -4 90 4" fill="none" stroke={C.trunkDark} strokeWidth={4} />
          {/* 母ザル + 背中の子ザル */}
          <L4aMonkey x={460 + walk} y={584} s={1.05} f={f} speed={5} step={0.8} />
          {/* 手前の葉 (そよぐ) */}
          <L4aLeaves x={170} y={190} s={1} f={f} seed={7} n={8} />
          <L4aLeaves x={700} y={170} s={0.8} f={f} seed={9} n={7} />
          <path d={`M 300 140 Q ${310 + Math.sin(f / 10) * 8} 260 ${296 + Math.sin(f / 10) * 12} 360`} fill="none" stroke={C.leafDark} strokeWidth={6} />
          <ellipse cx={296 + Math.sin(f / 10) * 12} cy={370} rx={18} ry={28} fill={C.leaf} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* ===== 右の窓: 病院の新生児室 ===== */}
        <g clipPath="url(#l4a149R)">
          <rect x={1030} y={140} width={790} height={600} fill={C.hospWall} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={1030} y1={480 + i * 40} x2={1820} y2={480 + i * 40} stroke={C.hospTile} strokeWidth={4} />
          ))}
          <rect x={1030} y={470} width={790} height={10} fill={C.hospTile} />
          {/* 壁の時計と表示札 */}
          <circle cx={1700} cy={240} r={50} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <line x1={1700} y1={240} x2={1700} y2={206} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={1700} y1={240} x2={1700 + 26 * Math.cos(f / 20)} y2={240 + 26 * Math.sin(f / 20)} stroke={KRP.red} strokeWidth={3} />
          <rect x={1080} y={190} width={240} height={70} rx={8} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={4} />
          <text x={1200} y={238} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>新生児室</text>
          {/* 奥の空のベッド */}
          <rect x={1080} y={360} width={170} height={90} rx={14} fill={C.hospGlass} stroke={C.ink} strokeWidth={4} opacity={0.7} />
          {/* 保育ベッド (透明なかご + 台車) */}
          <rect x={1270} y={690} width={380} height={30} rx={8} fill={KRP.gray} stroke={C.ink} strokeWidth={5} />
          <rect x={1300} y={640} width={20} height={60} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
          <rect x={1600} y={640} width={20} height={60} fill={KRP.grayDark} stroke={C.ink} strokeWidth={4} />
          <rect x={1250} y={590} width={420} height={60} rx={10} fill={KRP.gray} stroke={C.ink} strokeWidth={5} />
          <rect x={1270} y={420} width={380} height={176} rx={22} fill={C.hospGlass} stroke={C.ink} strokeWidth={5} opacity={0.9} />
          <rect x={1290} y={540} width={340} height={44} rx={14} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          {/* 泣く赤ちゃん */}
          <L4aBaby x={1610} y={566} s={0.85} f={f} rot={-74} face={cry > 0.3 ? "sad" : "normal"} cry={cry} fists />
          {/* 泣き声のギザギザ */}
          {cry > 0 && [0, 1, 2].map((i) => {
            const k = ((f / 6 + i / 3) % 1);
            return (
              <path key={i} opacity={cry * (1 - k)}
                d={`M ${1300 - k * 40} ${380 - i * 30 - k * 20} l 20 -16 l 10 20 l 20 -18`}
                fill="none" stroke={KRP.red} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            );
          })}
          {/* ガラスの映り込み */}
          <path d="M 1300 440 L 1340 440 L 1300 500 Z" fill={KRP.white} opacity={0.6} />
          {/* 名札 */}
          <rect x={1390} y={602} width={140} height={40} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          <text x={1460} y={632} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>3.0kg</text>
        </g>
        {/* 窓枠 (2つ) */}
        {[100, 1030].map((wx) => (
          <g key={wx}>
            <rect x={wx - 10} y={130} width={810} height={620} rx={26} fill="none" stroke={C.woodDark} strokeWidth={26} />
            <rect x={wx - 24} y={116} width={838} height={648} rx={32} fill="none" stroke={C.ink} strokeWidth={6} />
            <rect x={wx + 4} y={144} width={782} height={592} rx={18} fill="none" stroke={C.ink} strokeWidth={5} />
            {/* 窓の上のランプ */}
            <rect x={wx + 365} y={70} width={60} height={30} rx={6} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 窓の下の札 */}
        <TagPlate x={495} y={776} text="サルの赤ちゃん" size={38} t={seg(f, 2, 12)} />
        <TagPlate x={1425} y={776} text="ヒトの赤ちゃん" size={38} t={seg(f, 10, 20)} />
      </g>
    </Frame>
  );
};

// ---- 文#150 【並】 サルの赤ちゃんのように、母親にしがみついて運ばれることも、できません。
// どこ: 森の大きな木の根もと。左に太い幹、根もとの草地に小さな敷き布。
// 演出: 母ザルが子ザルを背中にしがみつかせたまま幹をすいすい登る。下の敷き布の上で、人の赤ちゃんは仰向けで手足をばたばた。札「しがみつく」に×。
// 動き: 母ザルが f0〜42 で幹を一気に登る (カメラも少し上を追う)。赤ちゃんは体ごとくねくね・手足のばたばた線。×は f24〜32 でぽん。
const Yw150: React.FC<{ f: number }> = ({ f }) => {
  const climb = easeInOut(seg(f, 0, 40));
  const my = lerp(720, 440, climb);
  const wig = Math.sin(f / 2.2) * 7;
  const camY = lerp(-20, 30, climb);
  return (
    <Frame f={f} seed={3150} bg={C.forestSky}>
      <g transform={cam(960, 540, 1.02, 0, camY)}>
        <rect x={-60} y={-120} width={W + 120} height={1300} fill={C.forestSky} />
        {/* 遠景の木々 */}
        {[120, 380, 1080, 1500, 1800].map((tx, i) => (
          <g key={i} opacity={0.5}>
            <rect x={tx - 16} y={200} width={32} height={600} fill={C.trunk} />
            <ellipse cx={tx} cy={200} rx={130} ry={150} fill={C.leafDark} />
          </g>
        ))}
        {/* 木漏れ日 */}
        <polygon points="1100,-120 1240,-120 1500,760 1300,760" fill={C.morning} opacity={0.35} />
        {/* 草地 */}
        <path d="M -60 690 Q 600 650 1100 680 Q 1500 700 1980 660 L 1980 1200 L -60 1200 Z" fill={C.leaf} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M ${i * 66} ${700 + rnd(3, i) * 40} q 4 -24 ${8 + Math.sin((f + i * 5) / 9) * 4} -30`}
            fill="none" stroke={C.leafDark} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* 大きな幹 (根っこが張る) */}
        <path d="M 800 -140 L 1000 -140 L 1010 640 Q 1060 700 1120 720 L 700 720 Q 760 700 790 640 Z"
          fill={C.trunk} stroke={C.ink} strokeWidth={6} />
        {[[840, 80, 60], [930, 260, 90], [860, 460, 70]].map(([bx, by, bl], i) => (
          <path key={i} d={`M ${bx} ${by} q 10 ${bl / 2} -4 ${bl}`} fill="none" stroke={C.trunkDark} strokeWidth={5} strokeLinecap="round" />
        ))}
        <ellipse cx={930} cy={380} rx={18} ry={26} fill={C.trunkDark} stroke={C.ink} strokeWidth={4} />
        {/* 上の茂み */}
        <L4aLeaves x={900} y={-60} s={1.6} f={f} seed={31} n={12} />
        <L4aLeaves x={300} y={40} s={1.1} f={f} seed={37} n={9} />
        {/* すいすいの線 (登ったあと) */}
        <g stroke={KRP.white} strokeWidth={7} strokeLinecap="round" opacity={0.8 * seg(f, 6, 14)}>
          {[0, 1, 2].map((i) => (
            <line key={i} x1={700 + i * 34} y1={my + 60 + i * 20} x2={700 + i * 34} y2={my + 170 + i * 20} />
          ))}
        </g>
        {/* 母ザル (幹の左側を頭を上にして登る) */}
        <L4aMonkey x={800} y={my} s={1} f={f} rot={-80} speed={2.4} step={1} />
        {/* 敷き布と、仰向けの赤ちゃん (真上から) */}
        <ellipse cx={1320} cy={736} rx={310} ry={112} fill={C.blanketEdge} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={1320} cy={736} rx={250} ry={82} fill="none" stroke={C.curtainDark} strokeWidth={4} strokeDasharray="14 10" />
        <g transform={`rotate(${wig} 1290 730)`}>
          <Person x={1450} y={730} s={0.85} f={f} phase={6} face="surprised" pose="banzai" hair="none"
            cloth={C.onesie} clothDark={C.onesieDark} lean={-90} still />
          <circle cx={1283} cy={696} r={7} fill={C.babyCheek} />
          <circle cx={1283} cy={764} r={7} fill={C.babyCheek} />
        </g>
        {/* ばたばたの線 */}
        {[[1150, 650, -30], [1150, 820, 30], [1440, 690, 20], [1440, 780, -20]].map(([bx, by, a], i) => (
          <g key={i} transform={`rotate(${a + Math.sin(f / 2 + i) * 10} ${bx} ${by})`} opacity={0.85}>
            <path d={`M ${bx - 24} ${by} q 24 -14 48 0`} fill="none" stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
            <path d={`M ${bx - 16} ${by + 14} q 16 -10 32 0`} fill="none" stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
        {/* 札「しがみつく」に × */}
        <TagPlate x={1330} y={560} text="しがみつく" size={42} t={seg(f, 12, 22)} rot={-3} />
        <XMark x={1330} y={556} s={1.3} t={seg(f, 24, 32)} />
      </g>
    </Frame>
  );
};

// ---- 文#151 【並】 なぜそこまで未熟なのかは、研究者のあいだでも、意見が分かれています。
// どこ: 学会の討論会の壇上。大きな黒板 (左半分に骨盤と産道の図、右半分に母体のエネルギーのグラフ)。上に「討論会」の垂れ幕、手前に客席の頭。
// 演出: 左の研究者は指し棒で産道を、右の研究者 (眼鏡) はグラフの「限界」を指して言い合う。吹き出しに互いの言い分の絵。まんなかに大きな「？」。
// 動き: カメラが f0〜42 で少し引く。吹き出しが交互に出る (左 f4〜、右 f14〜)。「？」は f24〜34 でぽん。客席の頭がゆれる。
const Yw151: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1.08, 1.0, easeOut(seg(f, 0, 42)));
  const bl = seg(f, 4, 12);
  const br = seg(f, 14, 22);
  const draw = seg(f, 0, 18);
  return (
    <Frame f={f} seed={3151} bg={C.wallWarm}>
      <g transform={cam(960, 440, zoom)}>
        {/* 会場の壁 (緞帳) */}
        <rect x={-80} y={-80} width={W + 160} height={980} fill={C.momSkirt} />
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M ${-80 + i * 96} -80 Q ${-60 + i * 96} 400 ${-80 + i * 96} 900`} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.3} />
        ))}
        {/* 壇の床 */}
        <rect x={-80} y={820} width={W + 160} height={300} fill={C.wood} stroke={C.ink} strokeWidth={5} />
        <line x1={-80} y1={850} x2={W + 80} y2={850} stroke={C.woodDark} strokeWidth={4} />
        {/* 黒板 */}
        <rect x={384} y={104} width={1152} height={652} rx={10} fill={C.woodDark} stroke={C.ink} strokeWidth={6} />
        <rect x={404} y={124} width={1112} height={612} fill={C.board} stroke={C.ink} strokeWidth={4} />
        <rect x={420} y={740} width={1080} height={16} fill={C.wood} stroke={C.ink} strokeWidth={3} />
        <rect x={1300} y={728} width={60} height={16} rx={4} fill={C.chalk} />
        <rect x={1380} y={724} width={70} height={22} rx={4} fill={C.blanketEdge} stroke={C.ink} strokeWidth={3} />
        {/* 垂れ幕 */}
        <rect x={760} y={20} width={400} height={70} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <text x={960} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>討論会</text>
        {/* まんなかの仕切り線 */}
        <line x1={960} y1={150} x2={960} y2={710} stroke={C.chalk} strokeWidth={4} strokeDasharray="16 14" opacity={0.6} />
        {/* ===== 左半分: 骨盤と産道 ===== */}
        <g fill="none" stroke={C.chalk} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={1400} strokeDashoffset={1400 * (1 - draw)}>
          <path d="M 500 380 Q 470 250 580 230 Q 650 260 640 330 M 860 380 Q 890 250 780 230 Q 710 260 720 330" />
          <path d="M 500 380 Q 520 520 610 560 L 750 560 Q 840 520 860 380" />
          <ellipse cx={680} cy={440} rx={92} ry={78} />
          <path d="M 640 560 L 650 620 M 720 560 L 710 620" />
        </g>
        {/* 通り抜けようとする赤ちゃんの頭 */}
        <g transform={`translate(680 ${lerp(270, 300, (Math.sin(f / 8) + 1) / 2)})`}>
          <circle r={66} fill="none" stroke={C.chalkPink} strokeWidth={7} />
          <circle cx={-20} cy={0} r={6} fill={C.chalkPink} />
          <circle cx={20} cy={0} r={6} fill={C.chalkPink} />
        </g>
        <path d="M 820 260 l 0 120 m -18 -22 l 18 22 l 18 -22" fill="none" stroke={C.chalkYellow} strokeWidth={6} strokeLinecap="round" />
        <text x={680} y={690} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.chalkYellow}>産道の広さ</text>
        {/* ===== 右半分: 母体のエネルギーのグラフ ===== */}
        <g fill="none" stroke={C.chalk} strokeWidth={6} strokeLinecap="round">
          <path d="M 1060 200 L 1060 620 L 1470 620" />
          <path d="M 1050 214 l 10 -14 l 10 14 M 1456 610 l 14 10 l -14 10" />
        </g>
        <line x1={1060} y1={300} x2={1460} y2={300} stroke={KRP.red} strokeWidth={6} strokeDasharray="18 12" />
        <text x={1420} y={284} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.chalkPink}>限界</text>
        <path d={`M 1070 600 Q 1260 ${600 - 120 * draw} 1400 ${600 - 300 * draw}`} fill="none" stroke={C.chalkBlue} strokeWidth={8} strokeLinecap="round" />
        <circle cx={1400} cy={600 - 300 * draw} r={14} fill={C.chalkYellow} />
        <text x={1260} y={690} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.chalkYellow}>母体のエネルギー</text>
        <text x={1260} y={652} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.chalk}>妊娠期間 →</text>
        {/* 「？」 */}
        <QMark x={960} y={470} s={1.7} f={f} t={seg(f, 24, 34)} color={KRP.yellow} />
        {/* 左の研究者 (指し棒で産道) */}
        <Person x={240} y={900} s={1.3} f={f} phase={1} face={f < 14 ? "angry" : "worried"} pose="point" pointDir={1}
          cloth={C.wood} clothDark={C.woodDark} lean={4} gaze={[4, 0]} />
        <line x1={445} y1={700} x2={600} y2={540} stroke={C.woodDark} strokeWidth={8} strokeLinecap="round" />
        {/* 右の研究者 (眼鏡・グラフを指す) */}
        <Person x={1690} y={900} s={1.3} f={f} phase={4} face={f < 14 ? "worried" : "angry"} pose="point" pointDir={-1}
          cloth={C.sofaSageDark} clothDark={C.suitDark} glasses lean={-4} gaze={[-4, 0]} />
        <line x1={1485} y1={700} x2={1400} y2={318} stroke={C.woodDark} strokeWidth={8} strokeLinecap="round" />
        {/* 吹き出し (言い分の絵) */}
        <g transform={`translate(250 300) scale(${pop(bl)})`} opacity={bl}>
          <ellipse rx={120} ry={84} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d="M -20 80 L -10 130 L 20 80" fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <ellipse cx={0} cy={6} rx={44} ry={36} fill="none" stroke={C.ink} strokeWidth={6} />
          <circle cx={0} cy={-26} r={30} fill={C.babyCheek} stroke={C.ink} strokeWidth={4} />
          <path d="M 52 -40 l 14 -14 M 60 -20 l 18 -4" stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
        </g>
        <g transform={`translate(1690 300) scale(${pop(br)})`} opacity={br}>
          <ellipse rx={120} ry={84} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <path d="M 20 80 L 10 130 L -20 80" fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <rect x={-56} y={-28} width={100} height={56} rx={8} fill="none" stroke={C.ink} strokeWidth={6} />
          <rect x={46} y={-12} width={12} height={24} fill={C.ink} />
          <rect x={-48} y={-20} width={24} height={40} fill={KRP.red} />
        </g>
        {/* 手前の客席の頭 */}
        {Array.from({ length: 9 }, (_, i) => (
          <PersonMini key={i} x={100 + i * 215} y={1210 + (i % 2) * 30} s={1.3} f={f} phase={i} face="none" color={C.suitDark} />
        ))}
      </g>
    </Frame>
  );
};

// ---- 文#152 【山】 ただ、ひとつ確かなのは、人間は長いあいだ、抱かれて育つということです。
// どこ: 午後のリビング。左に窓とカーテン (光が斜めに入る)、中央にセージ色のソファ、右の壁に家族写真3枚・フロアランプ・湯気の立つマグ。
// 演出: ★温かい画面。ソファのお母さんがおくるみの赤ちゃんを腕に抱いてあやす。赤ちゃんは安心した顔。2人のまわりに柔らかい光のまる。
// 動き: 母と子がゆらゆら揺れる (f で ±3°)。もう片方の手がトントンと背中をたたく。カメラがゆっくり寄る。f18〜 で光のまるが広がる。マグの湯気がのぼる。
const Yw152: React.FC<{ f: number }> = ({ f }) => {
  const zoom = lerp(1.0, 1.08, easeInOut(seg(f, 0, 42)));
  const rock = Math.sin(f / 12) * 3;
  const pat = Math.abs(Math.sin(f / 5)) * 10;
  const glow = seg(f, 18, 36);
  const seat = 620;
  const ms = 1.55;
  const py = seat + 58 * ms;
  return (
    <Frame f={f} seed={3152} bg={C.wallWarm}>
      <defs>
        <radialGradient id="l4a152glow">
          <stop offset="0%" stopColor={C.morning} stopOpacity={0.95} />
          <stop offset="100%" stopColor={C.morning} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cam(960, 480, zoom)}>
        {/* 壁 (腰の高さに細い見切り) */}
        <rect x={-80} y={-80} width={W + 160} height={940} fill={C.wallWarm} />
        <line x1={-80} y1={560} x2={W + 80} y2={560} stroke={C.curtainDark} strokeWidth={6} />
        {/* 床とラグ */}
        <rect x={-80} y={840} width={W + 160} height={300} fill={C.woodLight} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 180 - 60} y1={840} x2={i * 180 - 160} y2={1100} stroke={C.wood} strokeWidth={3} />
        ))}
        <ellipse cx={960} cy={930} rx={640} ry={80} fill={C.rug} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={960} cy={930} rx={560} ry={58} fill="none" stroke={C.rugDark} strokeWidth={5} strokeDasharray="20 12" />
        {/* 窓 + カーテン (左) */}
        <rect x={90} y={130} width={360} height={420} rx={8} fill={C.sky} stroke={C.ink} strokeWidth={6} />
        <L4aLeaves x={200} y={300} s={0.8} f={f} seed={52} n={8} />
        <line x1={270} y1={130} x2={270} y2={550} stroke={C.ink} strokeWidth={7} />
        <line x1={90} y1={340} x2={450} y2={340} stroke={C.ink} strokeWidth={7} />
        <path d={`M 60 100 L 150 100 Q ${140 + Math.sin(f / 14) * 8} 340 120 600 L 50 600 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        <path d={`M 490 100 L 400 100 Q ${410 - Math.sin(f / 14) * 8} 340 430 600 L 500 600 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        <rect x={30} y={88} width={500} height={16} rx={8} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        {/* 窓からの光 */}
        <polygon points="120,140 440,140 1220,860 640,860" fill={C.morning} opacity={0.32 + Math.sin(f / 16) * 0.04} />
        {/* 壁の家族写真 */}
        {[[1500, 170, -3, 150, 120], [1680, 200, 4, 120, 150], [1560, 340, 2, 190, 110]].map(([px, py2, r, w, h], i) => (
          <g key={i} transform={`rotate(${r} ${px} ${py2})`}>
            <rect x={px - w / 2} y={py2 - h / 2} width={w} height={h} rx={4} fill={C.woodDark} stroke={C.ink} strokeWidth={5} />
            <rect x={px - w / 2 + 12} y={py2 - h / 2 + 12} width={w - 24} height={h - 24} fill={C.sky} />
            <rect x={px - w / 2 + 12} y={py2 + h / 2 - 34} width={w - 24} height={22} fill={C.leaf} />
            {Array.from({ length: i + 2 }, (_, k) => {
              const hx = px - (i + 1) * 16 + k * 32;
              return (
                <g key={k}>
                  <rect x={hx - 9} y={py2 - 2} width={18} height={24} rx={6} fill={[C.mom, C.ukBlue, C.onesie, KRP.orange][k % 4]} />
                  <circle cx={hx} cy={py2 - 12} r={10} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />
                </g>
              );
            })}
          </g>
        ))}
        {/* フロアランプ + サイドテーブルのマグ */}
        <line x1={1760} y1={460} x2={1760} y2={850} stroke={C.ink} strokeWidth={8} />
        <path d="M 1690 460 L 1830 460 L 1800 360 L 1720 360 Z" fill={C.blanketEdge} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={1760} cy={470} rx={70} ry={14} fill={C.morning} opacity={0.6} />
        <rect x={1450} y={640} width={200} height={20} rx={6} fill={C.wood} stroke={C.ink} strokeWidth={5} />
        <rect x={1470} y={660} width={14} height={190} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        <rect x={1616} y={660} width={14} height={190} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        <rect x={1520} y={580} width={56} height={60} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <path d="M 1576 596 q 22 0 22 18 q 0 16 -22 16" fill="none" stroke={C.ink} strokeWidth={5} />
        {[0, 1].map((i) => {
          const k = ((f / 30 + i / 2) % 1);
          return (
            <path key={i} opacity={1 - k} d={`M ${1540 + i * 16} ${570 - k * 70} q 12 -16 0 -30 q -12 -14 0 -28`}
              fill="none" stroke={KRP.grayDark} strokeWidth={4} strokeLinecap="round" />
          );
        })}
        {/* 観葉植物 (左下) */}
        <path d="M 250 860 L 230 740 L 370 740 L 350 860 Z" fill={C.brick} stroke={C.ink} strokeWidth={5} />
        <L4aLeaves x={300} y={680} s={0.7} f={f} seed={57} n={8} />
        {/* ソファ (背もたれ・座面の上面) */}
        <rect x={540} y={380} width={840} height={260} rx={50} fill={C.sofaSage} stroke={C.ink} strokeWidth={6} />
        <line x1={960} y1={400} x2={960} y2={600} stroke={C.sofaSageDark} strokeWidth={5} />
        <rect x={560} y={580} width={800} height={60} rx={20} fill={C.sofaSageDark} stroke={C.ink} strokeWidth={5} />
        {/* クッション */}
        <rect x={600} y={460} width={150} height={130} rx={30} fill={C.curtain} stroke={C.ink} strokeWidth={5} transform="rotate(-10 675 525)" />
        <rect x={1180} y={460} width={150} height={130} rx={30} fill={C.blanketEdge} stroke={C.ink} strokeWidth={5} transform="rotate(8 1255 525)" />
        {/* 光のまる */}
        <circle cx={960} cy={470} r={160 + 120 * glow} fill="url(#l4a152glow)" opacity={0.3 + 0.5 * glow} />
        {/* お母さん + 赤ちゃん (ゆらゆら) */}
        <g transform={`rotate(${rock} 960 ${seat})`}>
          <L4aMom x={960} y={py} s={ms} f={f} pose="hold" face="smile" gaze={[-4, 6]} />
          <L4aBaby x={1066} y={640} s={0.64} f={f} rot={-36} face="smile" sleepy />
          {/* 下から支える腕 */}
          <rect x={870} y={574} width={230} height={36} rx={18} fill={C.mom} stroke={C.ink} strokeWidth={5} transform="rotate(-8 985 592)" />
          <circle cx={1100} cy={574} r={16} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          {/* トントンする手 */}
          <path d={`M 1062 486 Q 1080 ${520 - pat / 2} 1030 ${530 - pat}`} fill="none" stroke={C.ink} strokeWidth={26} strokeLinecap="round" />
          <path d={`M 1062 486 Q 1080 ${520 - pat / 2} 1030 ${530 - pat}`} fill="none" stroke={C.mom} strokeWidth={17} strokeLinecap="round" />
          <circle cx={1026} cy={532 - pat} r={15} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
          <path d={`M 1040 ${506 - pat} q 14 -8 22 -20`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={pat / 10} />
        </g>
        {/* 座面の手前 (脚の付け根をかくす) と、すね・靴 */}
        <rect x={540} y={620} width={840} height={110} rx={28} fill={C.sofaSage} stroke={C.ink} strokeWidth={6} />
        <line x1={960} y1={630} x2={960} y2={720} stroke={C.sofaSageDark} strokeWidth={5} />
        <rect x={500} y={430} width={90} height={320} rx={40} fill={C.sofaSage} stroke={C.ink} strokeWidth={6} />
        <rect x={1330} y={430} width={90} height={320} rx={40} fill={C.sofaSage} stroke={C.ink} strokeWidth={6} />
        {[-1, 1].map((k) => (
          <g key={k}>
            <rect x={960 + k * 28 - 19} y={720} width={38} height={120} fill={C.momSkirt} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={960 + k * 36} cy={846} rx={34} ry={13} fill={C.ink} />
          </g>
        ))}
        <rect x={580} y={740} width={30} height={100} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        <rect x={1310} y={740} width={30} height={100} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// ---- 文#153 【山】 そして、いつかは、腕の中から下ろされる日が来ます。
// どこ: #152 と同じリビング (続き)。カメラは床の高さ。奥にセージ色のソファと窓、手前に房つきのラグ・積み木。
// 演出: 床にひざをついたお母さんが、ハイハイの頃の赤ちゃんをラグにそっと下ろす。赤ちゃんの手が、お母さんの袖を名残惜しそうにきゅっとつかむ。ソファの上には、のちの毛布の切れはし。
// 動き: f2〜22 で赤ちゃんが下りてきて、ラグにおすわり。f22〜 で手が袖をつかみ、袖にしわ・きゅっの線。カメラはゆっくり赤ちゃんへ寄る。
const Yw153: React.FC<{ f: number }> = ({ f }) => {
  const down = easeInOut(seg(f, 2, 22));
  const grab = seg(f, 22, 30);
  const lean = lerp(0, 8, down);
  const bOff = lerp(-130, 0, down);
  const zoom = lerp(1.02, 1.1, easeInOut(seg(f, 0, 42)));
  const ms = 1.5;
  const mx = 760;
  const my = 917;
  return (
    <Frame f={f} seed={3153} bg={C.wallWarm}>
      <g transform={cam(1000, 640, zoom)}>
        <rect x={-80} y={-80} width={W + 160} height={800} fill={C.wallWarm} />
        <line x1={-80} y1={500} x2={W + 80} y2={500} stroke={C.curtainDark} strokeWidth={6} />
        {/* 窓 (左奥)・光 */}
        <rect x={60} y={80} width={330} height={380} rx={8} fill={C.sky} stroke={C.ink} strokeWidth={6} />
        <line x1={225} y1={80} x2={225} y2={460} stroke={C.ink} strokeWidth={7} />
        <L4aLeaves x={160} y={250} s={0.7} f={f} seed={53} n={7} />
        <path d={`M 30 50 L 110 50 Q ${100 + Math.sin(f / 14) * 8} 280 90 520 L 20 520 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
        <polygon points="90,100 380,100 1000,720 520,720" fill={C.morning} opacity={0.3} />
        {/* 奥のソファ (同じセージ色) */}
        <rect x={1180} y={300} width={760} height={300} rx={50} fill={C.sofaSage} stroke={C.ink} strokeWidth={6} />
        <rect x={1200} y={520} width={740} height={160} rx={28} fill={C.sofaSageDark} stroke={C.ink} strokeWidth={5} />
        <rect x={1240} y={380} width={150} height={130} rx={30} fill={C.curtain} stroke={C.ink} strokeWidth={5} transform="rotate(-8 1315 445)" />
        {/* ソファの上の毛布の切れはし (のちの主役) */}
        <L4aBlanket x={1560} y={520} s={0.8} rot={-70} wave={Math.sin(f / 12) * 0.2} len={0.8} />
        {/* 壁の家族写真 (#152 と同じ) */}
        <rect x={1460} y={110} width={150} height={120} rx={4} fill={C.woodDark} stroke={C.ink} strokeWidth={5} transform="rotate(-3 1535 170)" />
        <rect x={1474} y={124} width={122} height={92} fill={C.sky} transform="rotate(-3 1535 170)" />
        {/* 床 + ラグ (房つき) */}
        <rect x={-80} y={700} width={W + 160} height={460} fill={C.woodLight} stroke={C.ink} strokeWidth={5} />
        <path d="M 200 760 L 1760 760 L 1900 1100 L 60 1100 Z" fill={C.rug} stroke={C.ink} strokeWidth={6} />
        <path d="M 270 800 L 1690 800 L 1800 1080 L 160 1080 Z" fill="none" stroke={C.rugDark} strokeWidth={6} strokeDasharray="22 14" />
        {Array.from({ length: 26 }, (_, i) => (
          <line key={i} x1={210 + i * 60} y1={760} x2={206 + i * 60} y2={740} stroke={C.rugDark} strokeWidth={5} strokeLinecap="round" />
        ))}
        {/* ラグの上のおもちゃ */}
        <rect x={1340} y={790} width={60} height={60} rx={6} fill={KRP.blue} stroke={C.ink} strokeWidth={4.5} transform="rotate(12 1370 820)" />
        <rect x={1410} y={800} width={56} height={56} rx={6} fill={KRP.yellow} stroke={C.ink} strokeWidth={4.5} />
        <g transform={`rotate(${Math.sin(f / 7) * 5} 1540 840)`}>
          <line x1={1500} y1={860} x2={1550} y2={826} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
          <circle cx={1566} cy={814} r={24} fill={KRP.orange} stroke={C.ink} strokeWidth={4.5} />
        </g>
        {/* お母さん (ひざをついて、赤ちゃんを下ろす) */}
        <L4aMom x={mx} y={my} s={ms} f={f} pose="point" pointDir={1} lean={lean} face="smile" gaze={[5, 4]} />
        <ellipse cx={mx + 10} cy={884} rx={150} ry={52} fill={C.momSkirt} stroke={C.ink} strokeWidth={5} />
        <path d={`M ${mx - 90} 870 q 40 -14 80 0 M ${mx + 20} 874 q 40 -14 80 0`} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
        {/* 赤ちゃん (おすわり) */}
        <g transform={`translate(0 ${bOff})`}>
          <ellipse cx={1105} cy={838} rx={80} ry={12} fill={C.rugDark} opacity={0.5 * down} />
          <Person x={1105} y={830} s={0.75} f={f} phase={7} hair="none" cloth={C.onesie} clothDark={C.onesieDark}
            face={grab > 0 ? "sad" : "surprised"} gaze={[-5, -4]} pose={grab > 0 ? "point" : "stand"} pointDir={-1} still />
          <ellipse cx={1105} cy={810} rx={56} ry={30} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={1070} cy={834} rx={22} ry={12} fill={C.onesie} stroke={C.ink} strokeWidth={4} />
          <ellipse cx={1140} cy={834} rx={22} ry={12} fill={C.onesie} stroke={C.ink} strokeWidth={4} />
          <circle cx={1075} cy={683} r={8} fill={C.babyCheek} />
          <circle cx={1135} cy={683} r={8} fill={C.babyCheek} />
          <path d="M 1100 612 q 8 -14 18 -4" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
        </g>
        {/* 袖をきゅっとつかむ (しわと線) */}
        {grab > 0 && (
          <g opacity={grab}>
            <path d="M 972 712 q 8 12 0 24 M 958 714 q 6 10 0 20" fill="none" stroke={C.momDark} strokeWidth={4} strokeLinecap="round" />
            {[0, 1, 2].map((i) => (
              <line key={i} x1={990 + Math.cos(-2.6 + i * 0.7) * 34} y1={720 + Math.sin(-2.6 + i * 0.7) * 34}
                x2={990 + Math.cos(-2.6 + i * 0.7) * (50 + grab * 6)} y2={720 + Math.sin(-2.6 + i * 0.7) * (50 + grab * 6)}
                stroke={KRP.red} strokeWidth={5} strokeLinecap="round" />
            ))}
          </g>
        )}
      </g>
    </Frame>
  );
};

// ---- イギリスの国旗 (小旗)。原点は旗ざおの根もと
const L4aUnionJack: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const wv = Math.sin(f / 8) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1={0} y1={0} x2={0} y2={-150} stroke={C.ink} strokeWidth={6} />
      <circle cx={0} cy={-152} r={6} fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
      <g transform={`translate(2 -146) skewY(${wv})`}>
        <rect x={0} y={0} width={120} height={72} fill={C.ukBlue} />
        <g stroke={KRP.white} strokeWidth={14}><line x1={0} y1={0} x2={120} y2={72} /><line x1={120} y1={0} x2={0} y2={72} /></g>
        <g stroke={KRP.red} strokeWidth={5}><line x1={0} y1={0} x2={120} y2={72} /><line x1={120} y1={0} x2={0} y2={72} /></g>
        <rect x={48} y={0} width={24} height={72} fill={KRP.white} />
        <rect x={0} y={24} width={120} height={24} fill={KRP.white} />
        <rect x={53} y={0} width={14} height={72} fill={KRP.red} />
        <rect x={0} y={29} width={120} height={14} fill={KRP.red} />
        <rect x={0} y={0} width={120} height={72} fill="none" stroke={C.ink} strokeWidth={4} />
      </g>
    </g>
  );
};

// ---- 文#154 【山】 イギリスの小児科医で精神分析家の、ドナルド・ウィニコットは、ここに注目しました。
// どこ: 1950年代ロンドンの診察室。左に本棚、中央に暖炉 (炉棚に置き時計とイギリスの小旗)、右に窓 (霧の街・赤い郵便ポスト・ガス灯)、床に絨毯とおもちゃ箱。
// 演出: 右の肘掛け椅子に背広・白髪のウィニコット。床で積み木を積む子どもを優しく見守り、ノートに書きつける。札「ドナルド・ウィニコット」「ロンドン 1950年代」。
// 動き: カメラが子どもからウィニコットへパン。f12〜24 で子どもが積み木をひとつ載せて、ばんざい。ペンが動いてノートの線がのびる。暖炉の火がゆらぐ。窓の霧が流れる。
const Yw154: React.FC<{ f: number }> = ({ f }) => {
  const pan = lerp(40, -40, easeInOut(seg(f, 0, 42)));
  const place = easeInOut(seg(f, 12, 24));
  const done = f >= 25;
  const write = seg(f, 6, 40);
  const seat = 640;
  const ws = 1.35;
  const wy = seat + 58 * ws;
  const fl = (k: number) => Math.sin(f / 3 + k) * 8;
  return (
    <Frame f={f} seed={3154} bg={C.paperOld}>
      <defs>
        <clipPath id="l4a154win"><rect x={1500} y={120} width={360} height={400} /></clipPath>
      </defs>
      <g transform={cam(960, 540, 1.05, pan)}>
        {/* 縦じまの壁紙 */}
        <rect x={-100} y={-80} width={W + 200} height={920} fill={C.paperOld} />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={-100 + i * 84} y={-80} width={30} height={920} fill={C.paperOldDark} opacity={0.5} />
        ))}
        {/* 床 + 絨毯 */}
        <rect x={-100} y={820} width={W + 200} height={320} fill={C.woodDark} stroke={C.ink} strokeWidth={5} />
        <rect x={300} y={850} width={1300} height={260} rx={10} fill={C.brickDark} stroke={C.ink} strokeWidth={5} />
        <rect x={340} y={872} width={1220} height={220} fill="none" stroke={KRP.brass} strokeWidth={6} />
        {/* 本棚 (左) */}
        <rect x={20} y={120} width={360} height={720} fill={C.woodDark} stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={36} y={140 + r * 170} width={328} height={150} fill={C.trunkDark} />
            {Array.from({ length: 9 }, (_, i) => {
              const bh = 100 + rnd(154 + r, i) * 44;
              const col = [C.brick, C.ukBlue, C.sofaSageDark, C.sepia, C.paperOldDark][(i + r) % 5];
              return <rect key={i} x={44 + i * 35} y={290 + r * 170 - bh} width={30} height={bh} fill={col} stroke={C.ink} strokeWidth={3} />;
            })}
            <rect x={30} y={288 + r * 170} width={340} height={16} fill={C.wood} stroke={C.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 暖炉 */}
        <rect x={620} y={400} width={460} height={430} fill={C.brick} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 8 }, (_, r) => (
          <line key={r} x1={620} y1={440 + r * 50} x2={1080} y2={440 + r * 50} stroke={C.brickDark} strokeWidth={3} />
        ))}
        <rect x={590} y={370} width={520} height={40} rx={6} fill={C.wood} stroke={C.ink} strokeWidth={6} />
        <path d="M 720 830 L 720 600 Q 850 520 980 600 L 980 830 Z" fill={C.ink} />
        {/* 火 */}
        <g>
          <rect x={760} y={790} width={180} height={24} rx={10} fill={C.trunkDark} stroke={C.ink} strokeWidth={4} />
          <path d={`M 770 800 Q ${790 + fl(0)} 700 820 720 Q ${840 + fl(1)} 640 860 710 Q ${890 + fl(2)} 670 900 730 Q ${920 + fl(3)} 720 930 800 Z`}
            fill={C.fire} stroke={C.ink} strokeWidth={4} />
          <path d={`M 800 800 Q ${820 + fl(1)} 740 850 760 Q ${870 + fl(2)} 720 890 800 Z`} fill={KRP.yellow} />
        </g>
        {/* 炉棚の置き時計・小旗・燭台 */}
        <rect x={810} y={300} width={90} height={70} rx={20} fill={C.woodDark} stroke={C.ink} strokeWidth={5} />
        <circle cx={855} cy={330} r={24} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <line x1={855} y1={330} x2={855 + 16 * Math.sin(f / 10)} y2={330 - 16 * Math.cos(f / 10)} stroke={C.ink} strokeWidth={3.5} />
        <L4aUnionJack x={680} y={370} s={0.9} f={f} />
        <rect x={1010} y={300} width={14} height={70} fill={C.blanketEdge} stroke={C.ink} strokeWidth={3} />
        <path d={`M 1017 ${292 + fl(0) * 0.2} q 8 -10 0 -22 q -8 12 0 22`} fill={C.fire} />
        {/* 窓 (霧のロンドン) */}
        <g clipPath="url(#l4a154win)">
          <rect x={1500} y={120} width={360} height={400} fill={C.fog} />
          <rect x={1520} y={240} width={110} height={280} fill={KRP.gray} opacity={0.6} />
          <rect x={1700} y={200} width={140} height={320} fill={KRP.gray} opacity={0.5} />
          {/* ガス灯 */}
          <line x1={1820} y1={260} x2={1820} y2={520} stroke={C.ink} strokeWidth={7} />
          <rect x={1804} y={232} width={32} height={34} fill={KRP.yellow} stroke={C.ink} strokeWidth={4} />
          {/* 赤い郵便ポスト */}
          <path d="M 1620 520 L 1620 380 Q 1620 350 1660 350 Q 1700 350 1700 380 L 1700 520 Z" fill={C.postRed} stroke={C.ink} strokeWidth={5} />
          <rect x={1612} y={366} width={96} height={14} rx={6} fill={C.postRed} stroke={C.ink} strokeWidth={4} />
          <rect x={1640} y={400} width={40} height={8} fill={C.ink} />
          {/* 流れる霧 */}
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={1500 + ((f * 2 + i * 160) % 520)} cy={300 + i * 80} rx={160} ry={34} fill={KRP.white} opacity={0.45} />
          ))}
        </g>
        <rect x={1490} y={110} width={380} height={420} fill="none" stroke={KRP.white} strokeWidth={14} />
        <rect x={1484} y={104} width={392} height={432} fill="none" stroke={C.ink} strokeWidth={5} />
        <line x1={1680} y1={110} x2={1680} y2={530} stroke={KRP.white} strokeWidth={10} />
        <TagPlate x={1680} y={480} text="ロンドン 1950年代" size={28} t={seg(f, 2, 12)} />
        {/* おもちゃ箱 */}
        <rect x={300} y={720} width={190} height={130} rx={8} fill={C.woodLight} stroke={C.ink} strokeWidth={5} />
        <rect x={300} y={690} width={190} height={34} rx={6} fill={C.wood} stroke={C.ink} strokeWidth={5} transform="rotate(-24 300 724)" />
        <circle cx={350} cy={716} r={26} fill={KRP.red} stroke={C.ink} strokeWidth={4.5} />
        <rect x={390} y={690} width={70} height={36} rx={6} fill={C.ukBlue} stroke={C.ink} strokeWidth={4} />
        <circle cx={404} cy={728} r={10} fill={C.ink} /><circle cx={446} cy={728} r={10} fill={C.ink} />
        {/* 床で遊ぶ子ども + 積み木 */}
        <Person x={580} y={846} s={0.6} f={f} phase={8} hair="cap" cloth={KRP.blue} clothDark={KRP.blueDeep}
          face={done ? "joy" : "normal"} gaze={[4, 3]} pose={done ? "banzai" : "point"} pointDir={1} />
        <ellipse cx={580} cy={834} rx={50} ry={22} fill={KRP.blueDeep} stroke={C.ink} strokeWidth={4} />
        {[[730, 796, KRP.red], [730, 746, KRP.yellow]].map(([bx, by, col], i) => (
          <rect key={i} x={(bx as number) - 26} y={by as number} width={52} height={50} rx={4} fill={col as string} stroke={C.ink} strokeWidth={4.5} />
        ))}
        <rect x={lerp(650, 704, place)} y={lerp(734, 696, place) - Math.sin(place * Math.PI) * 30} width={52} height={50} rx={4}
          fill={KRP.green} stroke={C.ink} strokeWidth={4.5} />
        {/* ウィニコットの肘掛け椅子 (背) */}
        <rect x={1120} y={330} width={360} height={360} rx={70} fill={C.brickDark} stroke={C.ink} strokeWidth={6} />
        {[[1200, 420], [1300, 400], [1400, 420], [1250, 510], [1350, 510]].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r={6} fill={C.ink} />
        ))}
        <rect x={1140} y={610} width={320} height={50} rx={18} fill={C.brick} stroke={C.ink} strokeWidth={5} />
        {/* ウィニコット (ノートに書く) */}
        <L4aWinnicott x={1300} y={wy} s={ws} f={f} pose="hold" gaze={[-6, 4]} face="smile" lean={-3} />
        <g transform="rotate(-14 1300 540)">
          <rect x={1236} y={500} width={130} height={92} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <line x1={1300} y1={500} x2={1300} y2={592} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => {
            const len = clamp01(write * 4 - i) * 50;
            return <path key={i} d={`M 1308 ${518 + i * 18} l ${len} 0`} stroke={C.sepia} strokeWidth={3.5} strokeLinecap="round" />;
          })}
          <line x1={1310 + clamp01(write * 4 - Math.floor(write * 4)) * 50} y1={518 + Math.min(3, Math.floor(write * 4)) * 18}
            x2={1350 + clamp01(write * 4 - Math.floor(write * 4)) * 50} y2={470 + Math.min(3, Math.floor(write * 4)) * 18}
            stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* 肘掛け (手前)・座面の前・すね */}
        <rect x={1100} y={540} width={80} height={200} rx={36} fill={C.brickDark} stroke={C.ink} strokeWidth={6} />
        <rect x={1420} y={540} width={80} height={200} rx={36} fill={C.brickDark} stroke={C.ink} strokeWidth={6} />
        <rect x={1160} y={650} width={280} height={90} rx={20} fill={C.brick} stroke={C.ink} strokeWidth={5} />
        {[-1, 1].map((k) => (
          <g key={k}>
            <rect x={1300 + k * 26 - 17} y={730} width={34} height={100} fill={C.suitDark} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={1300 + k * 34} cy={834} rx={30} ry={12} fill={C.ink} />
          </g>
        ))}
        <TagPlate x={1260} y={190} text="ドナルド・ウィニコット" size={36} t={seg(f, 8, 18)} />
      </g>
    </Frame>
  );
};

// ---- 文#155 【山】 赤ちゃんが手放さない、毛布の切れはしや、ぬいぐるみ。
// どこ: 家の洗濯コーナー。左に洗濯機 (丸い窓の中で服が回る)・洗剤の棚・洗濯かご、上に物干しロープの靴下。床はタイル。
// 演出: 幼い子が、くたくたの毛布の切れはしを引きずり、ぼろぼろのくまを逆さにぶら下げて歩いてくる。お母さんが「洗おうね」と手を伸ばすと、子は両方をぎゅっと抱きしめ、いやいや。
// 動き: f0〜16 子が右から歩いてくる (毛布がずるずる)。f14〜24 お母さんがかがんで手を伸ばす。f24〜 子が抱きしめて体を左右にふる。カメラは少しずつ寄る。
const Yw155: React.FC<{ f: number }> = ({ f }) => {
  const walk = easeOut(seg(f, 0, 16));
  const reach = easeInOut(seg(f, 14, 24));
  const hug = f >= 24;
  const cx = lerp(1340, 1060, walk);
  const step = hug ? 0 : Math.abs(Math.sin(f / 2.5)) * -8;
  const shake = hug ? Math.sin(f / 1.7) * 6 * seg(f, 24, 28) : 0;
  const zoom = lerp(1.06, 1.12, easeInOut(seg(f, 0, 42)));
  const spin = f * 9;
  return (
    <Frame f={f} seed={3155} bg={C.blanketEdge}>
      <g transform={cam(900, 640, zoom)}>
        {/* 壁 (上は漆喰、下はタイル) */}
        <rect x={-100} y={-80} width={W + 200} height={940} fill={C.paperOld} />
        <rect x={-100} y={500} width={W + 200} height={340} fill={C.hospWall} />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={-100 + i * 70} y1={500} x2={-100 + i * 70} y2={840} stroke={C.hospTile} strokeWidth={3} />
        ))}
        {[570, 640, 710, 780].map((yy) => <line key={yy} x1={-100} y1={yy} x2={W + 100} y2={yy} stroke={C.hospTile} strokeWidth={3} />)}
        {/* 物干しロープと靴下 */}
        <path d="M 200 200 Q 900 250 1700 200" fill="none" stroke={C.ink} strokeWidth={4} />
        {[[420, KRP.red], [640, C.onesie], [1240, KRP.blue], [1460, C.babyCheek]].map(([sx, col], i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 9 + i) * 5} ${sx} ${224})`}>
            <path d={`M ${(sx as number) - 18} 222 L ${(sx as number) + 10} 222 L ${(sx as number) + 10} 290 Q ${(sx as number) + 40} 296 ${(sx as number) + 34} 316 L ${(sx as number) - 10} 316 Q ${(sx as number) - 22} 310 ${(sx as number) - 18} 280 Z`}
              fill={col as string} stroke={C.ink} strokeWidth={4} />
            <rect x={(sx as number) - 12} y={210} width={10} height={22} fill={C.wood} stroke={C.ink} strokeWidth={2.5} />
          </g>
        ))}
        {/* 洗剤の棚 */}
        <rect x={60} y={330} width={380} height={18} fill={C.wood} stroke={C.ink} strokeWidth={4} />
        {[[100, 70, KRP.blue], [170, 90, KRP.white], [250, 60, KRP.green], [330, 80, KRP.orange]].map(([bx, bh, col], i) => (
          <rect key={i} x={bx as number} y={330 - (bh as number)} width={54} height={bh as number} rx={10} fill={col as string} stroke={C.ink} strokeWidth={4} />
        ))}
        {/* 洗濯機 */}
        <rect x={60} y={420} width={360} height={420} rx={20} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <rect x={60} y={420} width={360} height={70} rx={20} fill={KRP.silver} stroke={C.ink} strokeWidth={5} />
        <circle cx={340} cy={455} r={16} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
        <circle cx={240} cy={660} r={120} fill={KRP.silver} stroke={C.ink} strokeWidth={6} />
        <circle cx={240} cy={660} r={92} fill={C.hospGlass} stroke={C.ink} strokeWidth={5} />
        <g transform={`rotate(${spin} 240 660)`}>
          <path d="M 180 640 q 30 -30 60 -10 q 20 20 50 0 l 0 30 q -50 30 -110 0 Z" fill={C.mom} stroke={C.ink} strokeWidth={3.5} />
          <circle cx={240} cy={720} r={20} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
        </g>
        <path d="M 180 610 q 20 -20 40 -24" fill="none" stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
        {/* 床 (タイル) */}
        <rect x={-100} y={840} width={W + 200} height={300} fill={C.paperOldDark} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-100 + i * 160} y1={840} x2={-160 + i * 160} y2={1100} stroke={C.sepia} strokeWidth={3} opacity={0.5} />
        ))}
        {/* 洗濯かご */}
        <path d="M 440 860 L 420 750 L 580 750 L 560 860 Z" fill={C.woodLight} stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((i) => <line key={i} x1={428 + i * 4} y1={780 + i * 26} x2={572 - i * 4} y2={780 + i * 26} stroke={C.wood} strokeWidth={4} />)}
        <path d="M 430 752 q 40 -40 80 -10 q 30 -30 70 6" fill={C.blanketEdge} stroke={C.ink} strokeWidth={4} />
        {/* お母さん (かがんで手を伸ばす) */}
        <L4aMom x={640} y={862} s={1.5} f={f} pose={reach > 0 ? "point" : "stand"} pointDir={1} lean={lerp(0, 12, reach)}
          face={hug ? "surprised" : "smile"} gaze={[5, 4]} />
        {/* 子ども */}
        <g transform={`translate(0 ${step})`}>
          {!hug && (
            <>
              {/* ずるずる引きずる毛布 (右手から床へ) */}
              <L4aBlanket x={cx + 50} y={800} s={0.8} rot={-76} wave={Math.sin(f / 4) * 0.6} len={1.5} />
              {/* 逆さにぶら下げたくま (左手) */}
              <L4aBear x={cx - 50} y={804} s={0.46} rot={168 + Math.sin(f / 3) * 10} />
            </>
          )}
          <Person x={cx} y={850} s={0.75} f={f} phase={9} hair="cap" cloth={C.onesie} clothDark={KRP.blueDeep}
            face={hug ? "angry" : "normal"} gaze={hug ? [4, 0] : [-4, 0]} pose={hug ? "hold" : "stand"} lean={shake} still={!hug} />
          {hug && (
            <g transform={`rotate(${shake} ${cx} 850)`}>
              {/* 抱きしめた毛布 (しっぽはお母さんの方へ垂れる) */}
              <L4aBlanket x={cx - 22} y={768} s={0.85} rot={52} wave={Math.sin(f / 5) * 0.3} len={1.15} />
              <L4aBear x={cx + 8} y={826} s={0.5} rot={-6} />
              <circle cx={cx - 34} cy={768} r={9} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
              <circle cx={cx + 38} cy={768} r={9} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
              {/* いやいやの線 */}
              {[-1, 1].map((k) => (
                <g key={k} stroke={KRP.red} strokeWidth={5} strokeLinecap="round" fill="none">
                  <path d={`M ${cx + k * 70} 650 q ${k * 14} 14 0 28`} />
                  <path d={`M ${cx + k * 88} 644 q ${k * 18} 20 0 40`} />
                </g>
              ))}
            </g>
          )}
        </g>
        <TagPlate x={980} y={540} text="毛布の切れはし" size={34} t={seg(f, 28, 36)} rot={-3} />
        <TagPlate x={1300} y={770} text="ぬいぐるみ" size={34} t={seg(f, 30, 38)} rot={3} />
      </g>
    </Frame>
  );
};

// ---- 文#156 【並】 ウィニコットは、これを「移行対象」と呼びました。
// どこ: 書斎の机の上に開いた、古い学術誌のページ (黄ばんだ紙・2段組・図版の枠)。机には万年筆と紅茶のカップ。
// 演出: 図版の枠に、毛布の切れはしとくまのペン画。その横から「移行対象」の札が紙から浮き上がる。下に英語のラベル。
// 動き: f0〜16 でペン画の線が描かれていく。f16〜30 で札が影を残して浮き上がり、光る。カメラは図版へゆっくり寄る。紅茶の湯気。
const Yw156: React.FC<{ f: number }> = ({ f }) => {
  const draw = easeOut(seg(f, 0, 16));
  const lift = easeOut(seg(f, 16, 30));
  const zoom = lerp(1.0, 1.1, easeInOut(seg(f, 0, 42)));
  const dash = (n: number) => ({ strokeDasharray: n, strokeDashoffset: n * (1 - draw) });
  return (
    <Frame f={f} seed={3156} bg={C.woodDark}>
      <g transform={cam(860, 470, zoom)}>
        {/* 机 (木目) */}
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.wood} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M -100 ${20 + i * 130} q 500 ${rnd(156, i) * 30 - 15} 1000 0 q 500 ${rnd(157, i) * 30 - 15} 1100 0`}
            fill="none" stroke={C.woodDark} strokeWidth={5} opacity={0.5} />
        ))}
        {/* 学術誌 (見開きの右ページ) */}
        <g transform="rotate(-2 960 480)">
          <rect x={250} y={50} width={1300} height={860} rx={6} fill={C.sepia} opacity={0.35} transform="translate(14 14)" />
          <rect x={250} y={50} width={1300} height={860} rx={6} fill={C.paperOld} stroke={C.ink} strokeWidth={6} />
          <path d="M 250 50 L 250 910" stroke={C.paperOldDark} strokeWidth={22} />
          {/* しみ */}
          <circle cx={1440} cy={140} r={44} fill={C.paperOldDark} opacity={0.5} />
          <circle cx={360} cy={820} r={30} fill={C.paperOldDark} opacity={0.4} />
          {/* 柱 (誌名と年のラベル) */}
          <text x={680} y={112} fontFamily="Georgia, serif" fontSize={30} fontStyle="italic" fill={C.sepia}>Int. J. Psycho-Anal.</text>
          <text x={1480} y={112} textAnchor="end" fontFamily="Georgia, serif" fontSize={30} fill={C.sepia}>1953</text>
          <line x1={320} y1={130} x2={1480} y2={130} stroke={C.sepia} strokeWidth={3} />
          {/* 本文 (読めない灰色の行) */}
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={320} y={170 + i * 32} width={300 - rnd(1560, i) * (i % 6 === 5 ? 140 : 20)} height={12} rx={6} fill={C.sepia} opacity={0.35} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={680} y={700 + i * 32} width={780 - rnd(1561, i) * 60} height={12} rx={6} fill={C.sepia} opacity={0.35} />
          ))}
          {/* 図版の枠 */}
          <rect x={680} y={170} width={800} height={480} fill={C.blanketEdge} stroke={C.sepia} strokeWidth={4} />
          <text x={700} y={636} fontFamily="Georgia, serif" fontSize={26} fontStyle="italic" fill={C.sepia}>Fig. 1</text>
          {/* ペン画: 毛布の切れはし */}
          <g fill="none" stroke={C.sepia} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
            <path {...dash(900)} d="M 740 250 Q 820 226 920 246 Q 940 360 922 470 L 900 456 L 884 478 L 864 460 L 846 482 L 826 462 L 806 480 L 786 460 L 766 476 Q 742 360 740 250 Z" />
            <path {...dash(500)} d="M 752 320 Q 830 334 930 316 M 756 400 Q 830 414 928 396 M 800 252 Q 806 360 812 464 M 864 248 Q 870 360 870 462" opacity={0.7} />
            <path {...dash(200)} d="M 850 478 q 6 18 -2 30 M 790 478 q -6 16 2 26" />
          </g>
          {/* ペン画: くま */}
          <g fill="none" stroke={C.sepia} strokeWidth={5} strokeLinecap="round">
            <circle {...dash(260)} cx={1100} cy={300} r={42} />
            <circle {...dash(120)} cx={1066} cy={262} r={16} />
            <circle {...dash(120)} cx={1134} cy={262} r={16} />
            <ellipse {...dash(360)} cx={1100} cy={410} rx={58} ry={68} />
            <ellipse {...dash(160)} cx={1046} cy={400} rx={14} ry={30} transform="rotate(30 1046 400)" />
            <ellipse {...dash(160)} cx={1154} cy={400} rx={14} ry={30} transform="rotate(-30 1154 400)" />
            <ellipse {...dash(140)} cx={1068} cy={480} rx={22} ry={14} />
            <ellipse {...dash(140)} cx={1132} cy={480} rx={22} ry={14} />
            <path {...dash(80)} d="M 1084 296 l 0 0 M 1110 290 l 10 10 M 1120 290 l -10 10 M 1092 316 q 8 6 16 0" />
            <rect {...dash(120)} x={1106} y={380} width={26} height={22} transform="rotate(12 1119 391)" />
          </g>
          <circle cx={1084} cy={294} r={5} fill={C.sepia} opacity={draw} />
          {/* 札が浮き上がったあとの紙の影 */}
          <rect x={1190} y={440} width={260} height={64} rx={10} fill={C.sepia} opacity={0.3 * lift} />
        </g>
        {/* 浮き上がる「移行対象」の札 */}
        <g opacity={seg(f, 16, 20)}>
          <ellipse cx={1320} cy={476} rx={220 * (1 + lift * 0.4)} ry={90 * (1 + lift * 0.4)} fill={C.morning} opacity={0.5 * lift} />
          <TagPlate x={1370} y={476 - 66 * lift} text="移行対象" size={56} t={seg(f, 16, 26)} color={KRP.red} rot={-3 + Math.sin(f / 10) * 1.5} />
          <TagPlate x={1370} y={576 - 50 * lift} text="Transitional Object" size={24} t={seg(f, 22, 32)} rot={-2} />
        </g>
        {/* 万年筆 */}
        <g transform="rotate(32 1660 760)">
          <rect x={1560} y={744} width={220} height={30} rx={14} fill={C.ink} />
          <rect x={1700} y={744} width={14} height={30} fill={KRP.brass} />
          <path d="M 1560 744 L 1520 759 L 1560 774 Z" fill={KRP.brass} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* 紅茶のカップ */}
        <ellipse cx={150} cy={300} rx={120} ry={46} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={150} cy={286} rx={74} ry={30} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <ellipse cx={150} cy={286} rx={58} ry={22} fill={C.brick} />
        {[0, 1].map((i) => {
          const k = ((f / 28 + i / 2) % 1);
          return <path key={i} opacity={1 - k} d={`M ${136 + i * 24} ${258 - k * 80} q 12 -16 0 -30 q -12 -14 0 -28`} fill="none" stroke={KRP.white} strokeWidth={5} strokeLinecap="round" />;
        })}
      </g>
    </Frame>
  );
};

// ---- 文#157 【図】 自分ではない、はじめての持ち物、という意味です。
// どこ: 教室の黒板 (木の枠・チョーク受けに白と黄のチョーク・黒板消し)。
// 演出: 左のまる「自分」に子どもの顔、右のまる「外の世界」に家・お母さん・木と太陽。2つのまるのすきまに、毛布の切れはしが掛かる。札「自分ではない」「はじめての持ち物」。
// 動き: f0〜12 でチョークのまるが描かれる。f8〜20 で毛布が上からすとんと降りてきて揺れる。f20〜30 でチョークの矢印、札が順にぽん。カメラは少し寄る。
const Yw157: React.FC<{ f: number }> = ({ f }) => {
  const draw = easeOut(seg(f, 0, 12));
  const drop = easeOut(seg(f, 8, 20));
  const arr = seg(f, 20, 28);
  const zoom = lerp(1.0, 1.04, easeInOut(seg(f, 0, 42)));
  const circ = 2 * Math.PI * 250;
  return (
    <Frame f={f} seed={3157} bg={C.wallWarm}>
      <defs>
        <clipPath id="l4a157L"><circle cx={540} cy={430} r={246} /></clipPath>
        <clipPath id="l4a157R"><circle cx={1380} cy={430} r={246} /></clipPath>
      </defs>
      <g transform={cam(960, 450, zoom)}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={C.wallWarm} />
        {/* 黒板 */}
        <rect x={40} y={70} width={1840} height={820} rx={12} fill={C.wood} stroke={C.ink} strokeWidth={6} />
        <rect x={66} y={96} width={1788} height={768} fill={C.board} stroke={C.ink} strokeWidth={4} />
        {/* 消し残しのチョーク跡 */}
        {[[300, 780, 260], [1500, 140, 300], [1100, 820, 200]].map(([ex, ey, ew], i) => (
          <ellipse key={i} cx={ex} cy={ey} rx={ew} ry={34} fill={C.chalk} opacity={0.07} />
        ))}
        {/* 左のまる: 自分 */}
        <circle cx={540} cy={430} r={250} fill={C.boardDark} />
        <g clipPath="url(#l4a157L)">
          <circle cx={540} cy={430} r={250} fill={C.chalkYellow} opacity={0.25 * draw} />
          <Person x={540} y={430 + 228 * 1.5 + 30} s={1.5} f={f} phase={9} hair="cap" cloth={C.onesie} clothDark={KRP.blueDeep}
            face="smile" gaze={[5, 0]} />
        </g>
        <circle cx={540} cy={430} r={250} fill="none" stroke={C.chalk} strokeWidth={9}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} strokeLinecap="round" />
        <text x={540} y={160} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={C.chalkYellow} opacity={draw}>自分</text>
        {/* 右のまる: 外の世界 */}
        <circle cx={1380} cy={430} r={250} fill={C.boardDark} />
        <g clipPath="url(#l4a157R)">
          <circle cx={1380} cy={430} r={250} fill={C.chalkBlue} opacity={0.22 * draw} />
          <rect x={1140} y={560} width={500} height={140} fill={C.leaf} opacity={0.6} />
          <circle cx={1480} cy={300} r={42} fill={C.chalkYellow} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={1480 + Math.cos(i + f / 20) * 56} y1={300 + Math.sin(i + f / 20) * 56}
              x2={1480 + Math.cos(i + f / 20) * 76} y2={300 + Math.sin(i + f / 20) * 76} stroke={C.chalkYellow} strokeWidth={6} strokeLinecap="round" />
          ))}
          {/* 家 */}
          <polygon points="1200,420 1290,340 1380,420" fill={C.chalkPink} stroke={C.chalk} strokeWidth={6} strokeLinejoin="round" />
          <rect x={1212} y={420} width={156} height={150} fill={C.chalk} stroke={C.chalk} strokeWidth={6} opacity={0.92} />
          <rect x={1272} y={500} width={40} height={70} fill={C.woodDark} />
          <rect x={1228} y={446} width={34} height={34} fill={C.chalkBlue} />
          <rect x={1320} y={446} width={34} height={34} fill={C.chalkBlue} />
          {/* 木 */}
          <rect x={1580} y={460} width={20} height={110} fill={C.trunk} />
          <circle cx={1590} cy={440} r={50} fill={C.leaf} />
          {/* お母さんと、もう1人 */}
          <PersonMini x={1450} y={640} s={0.85} f={f} phase={2} color={C.mom} face="smile" />
          <PersonMini x={1530} y={650} s={0.7} f={f} phase={5} color={C.ukBlue} face="smile" />
        </g>
        <circle cx={1380} cy={430} r={250} fill="none" stroke={C.chalk} strokeWidth={9}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} strokeLinecap="round" />
        <text x={1380} y={160} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={C.chalkBlue} opacity={draw}>外の世界</text>
        {/* まんなか: 毛布の切れはし (チョークで描いた釘に掛かる) */}
        <line x1={960} y1={130} x2={960} y2={lerp(-200, 250, drop)} stroke={C.chalk} strokeWidth={4} strokeDasharray="10 8" />
        <circle cx={960} cy={lerp(-200, 250, drop)} r={10} fill={C.chalk} />
        <L4aBlanket x={960} y={lerp(-200, 262, drop)} s={1.1} rot={Math.sin(f / 9) * 5 + (1 - drop) * 20} wave={Math.sin(f / 7) * 0.4} len={1.05} />
        {/* チョークの矢印 (両方のまるから) */}
        <g stroke={C.chalk} strokeWidth={7} strokeLinecap="round" fill="none" opacity={arr}>
          <path d={`M 800 420 Q ${820 + 40 * arr} 380 ${830 + 50 * arr} 400`} />
          <path d={`M ${830 + 50 * arr} 400 l -22 -6 M ${830 + 50 * arr} 400 l -8 -20`} />
          <path d={`M 1120 420 Q ${1100 - 40 * arr} 380 ${1090 - 50 * arr} 400`} />
          <path d={`M ${1090 - 50 * arr} 400 l 22 -6 M ${1090 - 50 * arr} 400 l 8 -20`} />
        </g>
        {/* 札 */}
        <TagPlate x={960} y={640} text="自分ではない" size={44} t={seg(f, 22, 30)} rot={-2} />
        <TagPlate x={960} y={752} text="はじめての持ち物" size={44} t={seg(f, 28, 36)} color={KRP.red} rot={2} />
        {/* チョーク受け */}
        <rect x={60} y={866} width={1800} height={22} fill={C.woodDark} stroke={C.ink} strokeWidth={4} />
        <rect x={300} y={852} width={70} height={16} rx={6} fill={C.chalk} />
        <rect x={400} y={854} width={56} height={14} rx={6} fill={C.chalkYellow} />
        <rect x={1500} y={842} width={120} height={28} rx={5} fill={C.blanketEdge} stroke={C.ink} strokeWidth={4} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_148: (f) => <Yw148 f={f} />,
  yw_149: (f) => <Yw149 f={f} />,
  yw_150: (f) => <Yw150 f={f} />,
  yw_151: (f) => <Yw151 f={f} />,
  yw_152: (f) => <Yw152 f={f} />,
  yw_153: (f) => <Yw153 f={f} />,
  yw_154: (f) => <Yw154 f={f} />,
  yw_155: (f) => <Yw155 f={f} />,
  yw_156: (f) => <Yw156 f={f} />,
  yw_157: (f) => <Yw157 f={f} />,
};

export const YW_F1_MOTIFS: string[] = [
  "yw_148",
  "yw_149",
  "yw_150",
  "yw_151",
  "yw_152",
  "yw_153",
  "yw_154",
  "yw_155",
  "yw_156",
  "yw_157",
];

export const yawaF1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
