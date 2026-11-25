// 人は、なぜ暇をつぶすのか: 文#150〜#161 (12文)
// 台本: docs/hima-script-v2.txt (文番号 = 行番号 − 1)
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。motif 名は hm_文番号3桁。seed は 5000+文番号。
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
} from "./HimaShared";
import {
  HP, Monosashi, monoSlot, Sousa, Sagyozukue, YoruNoHeya, YoruNoHeyaFront, EkiHome, EkiBenchFront,
  KyukeiBoard, ShockRoom, Sumaho, YasumiCalendar,
} from "./HimaParts";

// ===================================================================
// このファイルだけで使う色 (足すならここに。KRP/HP と重複させない)
// ===================================================================
const C = {
  ink: KRP.ink as string,
  stitch: "#F3B987",
  pocketShadow: "#8E4A20",
  road: "#E8D6AE",
  roadEdge: "#BFA77A",
  box: "#C99A5E",
  boxDark: "#9E7442",
  tape: "#E8CF95",
  wm: "#3D6FB0",
  wmWin: "#D7E4EE",
  gb: "#C8C4BA",
  gbBezel: "#6E6E78",
  gbScreen: "#A9C26A",
  gbBtn: "#A4305C",
  board: "#E9C77B",
  boardEdge: "#B8453A",
  cas: "#4A4A55",
  track: "#C4553E",
  trackLine: "#F4EDE4",
  grass: "#7FB069",
  grassDark: "#5F9150",
  stand: "#8C8E99",
  standDark: "#6C6E79",
  led: "#FFB347",
  ledBg: "#22252B",
  mat: "#8DB59A",
  matLine: "#76A084",
  print: "#2F5E9E",
  printLine: "#DCE8F5",
  sleeveA: "#5D7FA8",
  sleeveB: "#C9B48A",
  caveNear: "#C9A267",
  caveFar: "#24190F",
  lampWarm: "#FFD27A",
  wall156: "#E3DACA",
  wain: "#8A6A48",
  sky156: "#C3CCD6",
  stone: "#CDBF9E",
  stoneDark: "#9C8F72",
  cork: "#C79A62",
  ukBlue: "#2B4C8C",
  desk: "#A87A4C",
  deskDark: "#8A6038",
  wall157: "#D7DCD3",
  alu: "#B9BDC2",
  graph: "#F7FAFC",
  gridLine: "#CFE0EE",
  elev: "#B7BEC6",
  elevDark: "#8E969F",
  asphalt: "#5E6168",
  building: "#A9B4C0",
  shelf: "#D8C3A0",
  tile: "#CFC6B6",
  night: "#2B2F4A",
} as const;
void C; void W; void H; void FONT;
void Person; void PersonMini; void Stamp; void pop; void QMark; void XMark; void Arrow;
void ChapterDoor; void Maru; void MaruBatsu;
void HP; void Monosashi; void monoSlot; void Sousa; void Sagyozukue; void YoruNoHeya; void YoruNoHeyaFront;
void EkiHome; void EkiBenchFront; void KyukeiBoard; void ShockRoom; void Sumaho; void YasumiCalendar;
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
const easeIn = (t: number) => t * t;
const hex2 =(h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const mixColor = (a: string, b: string, t: number) => {
  const A = hex2(a), B = hex2(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t)))).join(",")})`;
};

// 引っ越しの段ボール (背負う)
const HmGbBox: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = 0 }) => {
  const h = w * 0.82;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={4} fill={C.box} stroke={KRP.ink} strokeWidth={5} />
      <path d={`M ${-w / 2} ${-h} L ${-w / 2 - w * 0.12} ${-h - w * 0.16} L ${-w * 0.05} ${-h - w * 0.12} L 0 ${-h} Z`} fill={C.boxDark} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M ${w / 2} ${-h} L ${w / 2 + w * 0.12} ${-h - w * 0.16} L ${w * 0.05} ${-h - w * 0.12} L 0 ${-h} Z`} fill={C.boxDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-w * 0.12} y={-h} width={w * 0.24} height={h} fill={C.tape} opacity={0.85} />
      <line x1={-w * 0.36} y1={-h * 0.3} x2={-w * 0.18} y2={-h * 0.3} stroke={C.boxDark} strokeWidth={4} />
      <line x1={w * 0.2} y1={-h * 0.3} x2={w * 0.36} y2={-h * 0.3} stroke={C.boxDark} strokeWidth={4} />
    </g>
  );
};

type HmGbKind = "walkman" | "gb" | "keitai" | "phone" | "board" | "book" | "cassette";
const HMGB_SIZE: Record<HmGbKind, [number, number, number]> = {
  // 幅, 高さ, 目の高さ
  walkman: [120, 160, -142], gb: [110, 180, -132], keitai: [68, 250, -204], phone: [80, 160, -112],
  board: [200, 130, -84], book: [100, 140, -92], cassette: [110, 70, -36],
};

// 暇つぶしの道具 (小さな足と目のついた「住人」)。x,y は足元
const HmGbDevice: React.FC<{
  kind: HmGbKind; x: number; y: number; s?: number; f: number; walk?: boolean; legs?: boolean;
  phase?: number; box?: boolean; mood?: "smile" | "wow" | "sweat"; arms?: "none" | "banzai" | "side"; rot?: number;
}> = ({ kind, x, y, s = 1, f, walk = false, legs = true, phase = 0, box = false, mood = "smile", arms = "none", rot = 0 }) => {
  const [w, h, ey] = HMGB_SIZE[kind];
  const sw = walk ? Math.sin(f * 0.9 + phase) : 0;
  const bob = walk ? -Math.abs(sw) * 5 : 0;
  const L = legs ? 34 : 0;
  const reel = f * 9;
  const es = kind === "keitai" ? 10 : kind === "board" ? 30 : 17;
  const onScreen = kind === "gb" || kind === "phone" || kind === "keitai";
  const body = (() => {
    switch (kind) {
      case "walkman":
        return (
          <g>
            <path d="M -66 -96 C -70 -236 70 -236 66 -96" stroke={KRP.ink} strokeWidth={10} fill="none" />
            <path d="M -66 -96 C -70 -236 70 -236 66 -96" stroke={KRP.silver} strokeWidth={4} fill="none" />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={-50 + i * 26} y={-172} width={18} height={14} rx={3} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />)}
            <rect x={-60} y={-160} width={120} height={160} rx={14} fill={C.wm} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-44} y={-116} width={88} height={56} rx={8} fill={C.wmWin} stroke={KRP.ink} strokeWidth={4} />
            {[-20, 20].map((rx) => (
              <g key={rx} transform={`translate(${rx} -88) rotate(${reel})`}>
                <circle r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
                {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-9} x2={0} y2={9} stroke={KRP.ink} strokeWidth={3} transform={`rotate(${a})`} />)}
              </g>
            ))}
            <rect x={-44} y={-40} width={88} height={10} rx={4} fill={KRP.blueSoft} opacity={0.6} />
            <ellipse cx={-70} cy={-96} rx={15} ry={24} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={70} cy={-96} rx={15} ry={24} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
          </g>
        );
      case "gb":
        return (
          <g>
            <rect x={-55} y={-180} width={110} height={180} rx={12} fill={C.gb} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-44} y={-166} width={88} height={70} rx={6} fill={C.gbBezel} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-32} y={-158} width={64} height={54} fill={C.gbScreen} />
            <rect x={-34} y={-62} width={28} height={10} rx={2} fill={KRP.ink} />
            <rect x={-25} y={-71} width={10} height={28} rx={2} fill={KRP.ink} />
            <circle cx={20} cy={-56} r={9} fill={C.gbBtn} stroke={KRP.ink} strokeWidth={3} />
            <circle cx={38} cy={-70} r={9} fill={C.gbBtn} stroke={KRP.ink} strokeWidth={3} />
            {[0, 1, 2].map((i) => <line key={i} x1={20 + i * 9} y1={-14} x2={30 + i * 9} y2={-28} stroke={KRP.grayDark} strokeWidth={3} />)}
          </g>
        );
      case "keitai":
        return (
          <g>
            <rect x={18} y={-284} width={11} height={36} rx={5} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-34} y={-252} width={68} height={122} rx={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-26} y={-240} width={52} height={78} rx={4} fill={HP.screen} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-30} y={-134} width={60} height={14} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-34} y={-122} width={68} height={122} rx={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={-22 + (i % 3) * 16} y={-98 + Math.floor(i / 3) * 20} width={12} height={12} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />
            ))}
          </g>
        );
      case "phone":
        return (
          <g>
            <rect x={-40} y={-160} width={80} height={160} rx={14} fill={KRP.ink} />
            <rect x={-33} y={-151} width={66} height={142} rx={8} fill={HP.screen} />
            <rect x={-33} y={-151} width={66} height={60} rx={8} fill={HP.screenCore} opacity={0.6} />
            <rect x={-10} y={-147} width={20} height={5} rx={2} fill={KRP.ink} />
          </g>
        );
      case "board":
        return (
          <g>
            <rect x={-100} y={-130} width={200} height={130} rx={8} fill={C.board} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-90} y={-120} width={180} height={110} rx={4} fill="none" stroke={C.boardEdge} strokeWidth={5} />
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={-80 + i * 20} y={-30} width={16} height={14} fill={[KRP.red, KRP.green, KRP.blueDeep, KRP.yellow][i % 4]} stroke={KRP.ink} strokeWidth={2} />
            ))}
            <line x1={0} y1={-130} x2={0} y2={0} stroke={C.boxDark} strokeWidth={4} />
          </g>
        );
      case "book":
        return (
          <g>
            <rect x={-44} y={-136} width={92} height={136} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-50} y={-140} width={96} height={140} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-50} y={-140} width={16} height={140} rx={4} fill="#A8321F" stroke={KRP.ink} strokeWidth={4} />
            <rect x={-22} y={-56} width={56} height={10} rx={3} fill={KRP.yellow} opacity={0.8} />
          </g>
        );
      case "cassette":
        return (
          <g>
            <rect x={-55} y={-70} width={110} height={70} rx={8} fill={C.cas} stroke={KRP.ink} strokeWidth={5} />
            <rect x={-44} y={-62} width={88} height={40} rx={4} fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
            {[-22, 22].map((rx) => <circle key={rx} cx={rx} cy={-14} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
          </g>
        );
    }
  })();
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
      {legs && [-1, 1].map((k) => {
        const fx = k * w * 0.22 + (walk ? sw * 12 * k : 0);
        return (
          <g key={k}>
            <line x1={k * w * 0.22} y1={-L} x2={fx} y2={-4} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <ellipse cx={fx + 6} cy={-3} rx={11} ry={5} fill={KRP.ink} />
          </g>
        );
      })}
      <g transform={`translate(0 ${-L + bob})`}>
        {box && <HmGbBox x={-w * 0.5} y={-h * 0.28} w={Math.max(w * 0.8, 84)} rot={-8 + Math.sin(f / 3 + phase) * 6} />}
        {arms === "banzai" && [-1, 1].map((k) => (
          <g key={k}>
            <line x1={k * w * 0.5} y1={-h * 0.55} x2={k * (w * 0.5 + 34)} y2={-h * 0.55 - 52} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <circle cx={k * (w * 0.5 + 34)} cy={-h * 0.55 - 52} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {arms === "side" && [-1, 1].map((k) => (
          <g key={k}>
            <line x1={k * w * 0.5} y1={-h * 0.5} x2={k * (w * 0.5 + 26)} y2={-h * 0.5 + 34} stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" />
            <circle cx={k * (w * 0.5 + 26)} cy={-h * 0.5 + 34} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {body}
        {/* 目と口 */}
        {[-1, 1].map((k) => (
          <g key={k}>
            <circle cx={k * es} cy={ey} r={onScreen ? 6 : 8} fill={onScreen ? KRP.ink : KRP.white} stroke={KRP.ink} strokeWidth={onScreen ? 0 : 3} />
            {!onScreen && <circle cx={k * es + 1} cy={ey + 1} r={4} fill={KRP.ink} />}
          </g>
        ))}
        {mood === "wow"
          ? <ellipse cx={0} cy={ey + 18} rx={6} ry={8} fill={KRP.ink} />
          : <path d={`M ${-8} ${ey + 14} q 8 ${mood === "sweat" ? -4 : 8} 16 0`} stroke={KRP.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />}
        {mood === "sweat" && <path d={`M ${w * 0.5 + 6} ${ey - 20} q 8 14 0 20 q -8 -6 0 -20 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2} />}
      </g>
    </g>
  );
};

// ストップウォッチ
const HmGbWatch: React.FC<{ x: number; y: number; r: number; ang: number; sector?: number }> = ({ x, y, r, ang, sector = 0 }) => {
  const a = (sector * 360 * Math.PI) / 180;
  const R = r * 0.86;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-r * 0.16} y={-r - 22} width={r * 0.32} height={18} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-r * 0.3} y={-r - 34} width={r * 0.6} height={14} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={r * 0.62} y={-r * 0.95} width={20} height={14} rx={4} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} transform={`rotate(40 ${r * 0.7} ${-r * 0.9})`} />
      <circle r={r} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6} />
      <circle r={r * 0.88} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
      {sector > 0 && (
        <path d={`M 0 0 L 0 ${-R} A ${R} ${R} 0 ${sector > 0.5 ? 1 : 0} 1 ${Math.sin(a) * R} ${-Math.cos(a) * R} Z`} fill={KRP.red} opacity={0.35} />
      )}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-r * 0.8} x2={0} y2={-r * (i % 3 ? 0.72 : 0.64)} stroke={KRP.ink} strokeWidth={i % 3 ? 2.5 : 4} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={r * 0.12} x2={0} y2={-r * 0.74} stroke={KRP.red} strokeWidth={Math.max(3, r * 0.06)} strokeLinecap="round" transform={`rotate(${ang})`} />
      <circle r={r * 0.08 + 2} fill={KRP.ink} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #150 だいたい10年おきに、新しい暇つぶしが、ポケットに引っ越してきました。
// 格: 山 / seed 5150
// 絵: どこ: パーカーのポケットを家に見立てた「ポケット荘」(引っ越しの舞台)。演出: 年代札「1979」「1989」「1999」「2008」が並ぶ時間の道を、ウォークマン → ゲーム機 → 携帯 → スマホが、それぞれ小さな引っ越しの段ボールを背負って順にポケットに入居していく。動き: 道を歩いて入居 (順番) / 段ボールがゆれる
// どこ: 橙のパーカーの胸もと一面。カンガルーポケットが屋根つきの「ポケット荘」(窓4つ・表札・郵便受け・玄関マット)
// 演出: 左から伸びる「時間の道」に年代札 1979/1989/1999/2008。ウォークマン→ゲーム機→携帯→スマホが段ボールを背負って順に歩き、
//       ポケットの口に入ると、その部屋の窓に灯りがついて住人が顔を出す。f=45 で4部屋とも入居済み・スマホは最後の窓で手をふる
// 動き: 4体が時間差で歩く / 段ボールがゆれる / 窓が順に灯る / カメラがポケットへ少し寄る
const HM150_PLATE_Y = 776;
const Hm150: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const kinds: HmGbKind[] = ["walkman", "gb", "keitai", "phone"];
  const years = ["1979", "1989", "1999", "2008"];
  const px = [170, 390, 610, 810];
  const ts = [0, 6, 14, 22];
  const te = [12, 20, 28, 38];
  const ss = [0.8, 0.78, 0.66, 0.78];
  const DOOR = 960;
  const FEET = 728;
  const wins: [number, number][] = [[1190, 480], [1540, 480], [1190, 670], [1540, 670]];
  return (
    <Frame f={f} seed={5150}>
      <g transform={`translate(${-14 * cam} ${-6 * cam}) translate(960 300) scale(${1 + 0.03 * cam}) translate(-960 -300)`}>
        {/* パーカーの生地 (編み目) */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={HP.you} />
        <g stroke={HP.youDark} strokeWidth={3} opacity={0.35}>
          {Array.from({ length: 26 }, (_, i) => <path key={i} d={`M ${-40 + i * 80} -60 q 10 600 0 1200`} fill="none" />)}
        </g>
        {/* 首もとのひも (アグレット) */}
        {[300, 520].map((sx, i) => (
          <g key={sx}>
            <path d={`M ${sx} -40 Q ${sx + (i ? 18 : -18) + Math.sin(f / 12 + i) * 6} 140 ${sx + (i ? 10 : -10)} 260`} stroke={KRP.white} strokeWidth={16} fill="none" strokeLinecap="round" />
            <path d={`M ${sx} -40 Q ${sx + (i ? 18 : -18) + Math.sin(f / 12 + i) * 6} 140 ${sx + (i ? 10 : -10)} 260`} stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.4} />
            <rect x={sx + (i ? 10 : -10) - 9} y={252} width={18} height={44} rx={5} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* すその編みリブ */}
        <rect x={-60} y={880} width={2040} height={260} fill={HP.youDark} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
          {Array.from({ length: 70 }, (_, i) => <line key={i} x1={i * 30} y1={886} x2={i * 30} y2={1100} />)}
        </g>
        <line x1={-60} y1={880} x2={1980} y2={880} stroke={KRP.ink} strokeWidth={6} />
        {/* 時間の道 */}
        <path d={`M -60 676 L ${DOOR - 40} 676 L ${DOOR - 20} 770 L -60 770 Z`} fill={C.road} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.roadEdge} strokeWidth={5}>
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 80 - 20} y1={723} x2={i * 80 + 20} y2={723} />)}
        </g>
        {/* 年代の道しるべ */}
        {px.map((x, i) => (
          <g key={i}>
            <rect x={x - 6} y={690} width={12} height={60} fill={C.boxDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {/* 足あと */}
        {kinds.map((k, i) => {
          const p = seg(f, ts[i], te[i]);
          const cur = lerp(px[i], DOOR, p);
          return Array.from({ length: 10 }, (_, j) => {
            const fx = px[i] + 30 + j * 70;
            return fx < cur - 30 ? <ellipse key={`${k}${j}`} cx={fx} cy={FEET + (j % 2 ? 8 : -6)} rx={9} ry={4} fill={KRP.ink} opacity={0.18} /> : null;
          });
        })}
        {/* ポケットの口の中の影 */}
        <path d="M 1000 340 L 1070 350 L 960 820 L 880 820 Z" fill={C.pocketShadow} stroke={KRP.ink} strokeWidth={5} />
        {/* 住人たち (歩いて入居) */}
        {kinds.map((k, i) => {
          const p = easeInOut(seg(f, ts[i], te[i]));
          const x = lerp(px[i], DOOR + 60, p);
          if (p >= 1) return null;
          return <HmGbDevice key={k} kind={k} x={x} y={FEET} s={ss[i]} f={f} walk={p > 0} phase={i * 1.7} box />;
        })}
        {/* ポケット荘 (前面) */}
        <path d="M 1000 340 L 1800 340 L 1830 830 L 880 830 Z" fill={HP.you} stroke={KRP.ink} strokeWidth={8} />
        <path d="M 1012 362 L 1780 362 L 1806 808 L 912 808 Z" fill="none" stroke={C.stitch} strokeWidth={5} strokeDasharray="16 12" />
        {/* 屋根 */}
        <path d="M 960 344 L 1050 250 L 1760 250 L 1850 344 Z" fill={HP.youDark} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
          {Array.from({ length: 16 }, (_, i) => <line key={i} x1={1010 + i * 52} y1={258} x2={990 + i * 54} y2={340} />)}
        </g>
        {/* 窓と住人 */}
        {wins.map(([wx, wy], i) => {
          const lit = seg(f, te[i] + 1, te[i] + 4);
          const wave = i === 3 ? Math.sin(f / 4) * 10 : Math.sin(f / 9 + i) * 3;
          return (
            <g key={i}>
              <rect x={wx - 110} y={wy - 72} width={220} height={144} rx={10} fill={lit > 0 ? mixColor("#4A3A55", C.lampWarm, lit) : "#4A3A55"} stroke={KRP.ink} strokeWidth={6} />
              <defs><clipPath id={`hm150w${i}`}><rect x={wx - 104} y={wy - 66} width={208} height={132} rx={8} /></clipPath></defs>
              {lit > 0 && (
                <g clipPath={`url(#hm150w${i})`}>
                  <g transform={`translate(0 ${(1 - easeOut(lit)) * 90})`}>
                    <HmGbDevice kind={kinds[i]} x={wx} y={wy + 66 + (kinds[i] === "keitai" ? 70 : 20)} s={0.62} f={f} legs={false}
                      mood={i === 3 ? "wow" : "smile"} arms={i === 3 ? "banzai" : "none"} rot={wave * 0.4} />
                  </g>
                </g>
              )}
              {/* カーテン */}
              <path d={`M ${wx - 104} ${wy - 66} q 30 60 0 132 l -2 0 Z`} fill={KRP.cream} opacity={0.9} />
              <path d={`M ${wx + 104} ${wy - 66} q -30 60 0 132 l 2 0 Z`} fill={KRP.cream} opacity={0.9} />
              <line x1={wx - 110} y1={wy + 78} x2={wx + 110} y2={wy + 78} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
              {/* 部屋の段ボール (窓の下) */}
              {lit > 0.5 && <HmGbBox x={wx + 76} y={wy + 64} w={44} rot={0} />}
            </g>
          );
        })}
        {/* 郵便受け (4つの口) と玄関マット */}
        <g>
          <rect x={1340} y={760} width={30} height={60} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1290} y={720} width={130} height={56} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={1300 + i * 30} y={736} width={22} height={8} rx={3}
            fill={seg(f, te[i] + 1, te[i] + 4) > 0 ? KRP.white : KRP.ink} stroke={KRP.ink} strokeWidth={2} />)}
        </g>
        <path d="M 820 772 L 960 772 L 990 806 L 800 806 Z" fill={KRP.green} stroke={KRP.ink} strokeWidth={4} />
        {/* 表札 */}
        <TagPlate x={1405} y={196} text="ポケット荘" size={50} t={1} fill={KRP.cream} />
        {/* 年代札 */}
        <TagPlate x={170} y={HM150_PLATE_Y} text="1979" size={32} t={seg(f, 0, 4)} />
        <TagPlate x={390} y={HM150_PLATE_Y} text="1989" size={32} t={seg(f, 4, 8)} />
        <TagPlate x={610} y={HM150_PLATE_Y} text="1999" size={32} t={seg(f, 12, 16)} />
        <TagPlate x={810} y={HM150_PLATE_Y} text="2008" size={32} t={seg(f, 20, 24)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #151 小さくなるほど、遊びはじめるまでも、速くなります。
// 格: 図 / seed 5151
// 絵: どこ: 陸上競技場のトラック (スタートライン)。演出: 盤すごろく・本・スマホがスタートラインに並んで「よーい、どん」。盤は広げるのにもたもた、本はページを開いて少し遅れ、スマホは**一瞬で**ゴールテープを切る。動き: スタートの合図 / 盤がもたつく / スマホがびゅん
// どこ: 陸上競技場の直線 (上に観客席、3レーン、左にスタートライン・右にゴールテープ)
// 演出: スタートの信号が緑になると、1レーンのすごろく盤は折りたたみが開かずにじたばた(コマとサイコロがこぼれる)、
//       2レーンの本はページをめくりながらとことこ、3レーンのスマホは一瞬でゴールテープを切ってばんざい
// 動き: 信号 (f0-6) / スマホがびゅん (f6-11) / テープが切れてひらひら / 盤のもたつき / 本の前進
const Hm151: React.FC<{ f: number }> = ({ f }) => {
  const go = f >= 6;
  const ph = easeIn(seg(f, 6, 11));
  const phoneX = lerp(330, 1770, ph);
  const bookX = lerp(330, 660, easeOut(seg(f, 9, 42)));
  const flap = 0.2 + 0.45 * Math.abs(Math.sin(f / 4));
  const broke = f >= 10;
  const LANE = [335, 525, 715];
  const shake = f >= 6 && f < 12 ? Math.sin(f * 3) * 4 : 0;
  return (
    <Frame f={f} seed={5151}>
      <g transform={`translate(${shake} 0)`}>
        {/* 観客席 */}
        <rect x={-40} y={-40} width={2000} height={280} fill={C.stand} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={-40} y={20 + r * 52} width={2000} height={10} fill={C.standDark} />
            {Array.from({ length: 48 }, (_, i) => {
              const cx = i * 42 + (r % 2) * 21;
              const hop = go ? Math.abs(Math.sin(f / 3 + i)) * 6 : 0;
              return (
                <g key={i}>
                  <circle cx={cx} cy={4 + r * 52 - hop} r={11} fill={[KRP.white, "#F1D9B5", "#E8C29A"][(i + r) % 3]} stroke={KRP.ink} strokeWidth={2} />
                  <rect x={cx - 12} y={14 + r * 52 - hop} width={24} height={14} rx={5} fill={[KRP.red, KRP.blueDeep, KRP.yellow, KRP.green][(i * 3 + r) % 4]} />
                </g>
              );
            })}
          </g>
        ))}
        <rect x={-40} y={226} width={2000} height={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {/* トラック */}
        <rect x={-40} y={240} width={2000} height={580} fill={C.track} />
        {[240, 430, 620, 810].map((ly) => <line key={ly} x1={-40} y1={ly} x2={1960} y2={ly} stroke={C.trackLine} strokeWidth={8} />)}
        <g opacity={0.25}>{Array.from({ length: 300 }, (_, i) => <circle key={i} cx={rnd(5151, i) * 1920} cy={250 + rnd(5152, i) * 560} r={2.5} fill={KRP.ink} />)}</g>
        {LANE.map((ly, i) => <text key={i} x={190} y={ly + 26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={C.trackLine} opacity={0.75}>{i + 1}</text>)}
        <rect x={290} y={240} width={16} height={570} fill={C.trackLine} />
        <rect x={1636} y={240} width={16} height={570} fill={C.trackLine} />
        {/* 芝 */}
        <rect x={-40} y={820} width={2000} height={300} fill={C.grass} />
        <g stroke={C.grassDark} strokeWidth={4}>{Array.from({ length: 40 }, (_, i) => <path key={i} d={`M ${i * 50 + 10} 900 l 6 -16 l 6 16`} fill="none" />)}</g>
        {/* スタートの信号 */}
        <g transform="translate(560 120)">
          <rect x={-8} y={30} width={16} height={110} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-80} y={-34} width={160} height={68} rx={14} fill={KRP.ink} />
          {[-48, 0, 48].map((lx, i) => {
            const on = i < 2 ? (!go && f >= i * 2) : go;
            return <circle key={i} cx={lx} cy={0} r={20} fill={on ? (i < 2 ? KRP.red : KRP.green) : "#4A4A50"} stroke={KRP.white} strokeWidth={3} />;
          })}
        </g>
        {/* ゴールテープ (ポール2本) */}
        {[236, 816].map((py) => <rect key={py} x={1630} y={py - 26} width={28} height={40} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
        {!broke ? (
          <line x1={1644} y1={236} x2={1644} y2={816} stroke={KRP.red} strokeWidth={12} />
        ) : (
          <g>
            <path d={`M 1644 236 Q ${1690 + Math.sin(f / 3) * 14} 450 ${1720 + Math.sin(f / 4) * 24} ${600 + Math.cos(f / 5) * 10}`} stroke={KRP.red} strokeWidth={12} fill="none" strokeLinecap="round" />
            <path d={`M 1644 816 Q ${1700 + Math.sin(f / 3.5) * 10} 790 ${1740 + Math.sin(f / 4) * 20} ${740 + Math.sin(f / 5) * 10}`} stroke={KRP.red} strokeWidth={12} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* 1レーン: すごろく盤がじたばた */}
        <g transform={`translate(380 ${LANE[0]})`}>
          <rect x={-110} y={-80} width={110} height={160} rx={6} fill={C.board} stroke={KRP.ink} strokeWidth={6} />
          <g transform={`scale(${flap} 1)`}>
            <rect x={0} y={-80} width={110} height={160} rx={6} fill={C.board} stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 5 }, (_, i) => <rect key={i} x={14} y={-66 + i * 28} width={22} height={20} fill={[KRP.red, KRP.green, KRP.blueDeep, KRP.yellow, KRP.red][i]} stroke={KRP.ink} strokeWidth={2} />)}
          </g>
          {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-96} y={-66 + i * 28} width={22} height={20} fill={[KRP.yellow, KRP.red, KRP.green, KRP.blueDeep, KRP.yellow][i]} stroke={KRP.ink} strokeWidth={2} />)}
          <line x1={0} y1={-80} x2={0} y2={80} stroke={C.boardEdge} strokeWidth={6} />
          {/* 顔 (あせる) */}
          <circle cx={-70} cy={-20} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={-38} cy={-20} r={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={-68} cy={-18} r={4} fill={KRP.ink} /><circle cx={-36} cy={-18} r={4} fill={KRP.ink} />
          <path d="M -66 8 q 12 -8 24 0" stroke={KRP.ink} strokeWidth={4} fill="none" />
          {go && [0, 1].map((k) => <path key={k} d={`M ${-130 - k * 20} ${-60 + k * 30 + Math.sin(f / 2 + k) * 4} q 10 16 0 24 q -10 -8 0 -24 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2} />)}
          {/* こぼれたコマとサイコロ */}
          {go && (
            <g>
              {[[150, 40, KRP.red], [190, -30, KRP.blueDeep], [130, -70, KRP.green]].map(([cx, cy, c], i) => {
                const t = seg(f, 6 + i * 3, 16 + i * 3);
                return <path key={i} d={`M ${(cx as number) * t - 12} ${(cy as number) * t + 14} L ${(cx as number) * t} ${(cy as number) * t - 18} L ${(cx as number) * t + 12} ${(cy as number) * t + 14} Z`} fill={c as string} stroke={KRP.ink} strokeWidth={3} />;
              })}
              <g transform={`translate(${200 * seg(f, 8, 22)} ${60 * seg(f, 8, 22)}) rotate(${f * 14})`}>
                <rect x={-18} y={-18} width={36} height={36} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                <circle r={5} fill={KRP.red} />
              </g>
            </g>
          )}
          {/* もたもたの線 */}
          {go && [0, 1, 2].map((k) => <path key={k} d={`M ${120 + k * 6} ${-100 - k * 10} q 10 -10 20 0 q 10 10 20 0`} stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.5} transform={`rotate(${Math.sin(f / 3 + k) * 10})`} />)}
        </g>
        {/* 2レーン: 本がページをめくりながらとことこ */}
        <g>
          <HmGbDevice kind="book" x={bookX} y={LANE[1] + 78} s={0.95} f={f} walk={f > 9} mood="sweat" />
          {f > 9 && [0, 1, 2].map((k) => (
            <path key={k} d={`M ${bookX + 50} ${LANE[1] - 40 + k * 10} q ${30 + 10 * Math.sin(f / 2 + k)} -30 ${50} ${-10}`} stroke={KRP.white} strokeWidth={6} fill="none" opacity={0.9} />
          ))}
        </g>
        {/* 3レーン: スマホがびゅん */}
        {f >= 6 && (
          <g>
            {[0, 1, 2, 3, 4].map((k) => (
              <line key={k} x1={340 + k * 60} y1={LANE[2] - 50 + k * 22} x2={phoneX - 70} y2={LANE[2] - 50 + k * 22}
                stroke={KRP.white} strokeWidth={6 - k * 0.6} strokeLinecap="round" opacity={0.75 * (1 - seg(f, 14, 40) * 0.5)} />
            ))}
            <ellipse cx={phoneX - 40} cy={LANE[2] + 60} rx={70} ry={14} fill={KRP.ink} opacity={0.2} />
          </g>
        )}
        <HmGbDevice kind="phone" x={phoneX} y={LANE[2] + 64} s={0.7} f={f} walk={f >= 6 && f < 11}
          arms={f >= 11 ? "banzai" : "none"} mood={f >= 11 ? "smile" : "wow"} rot={f >= 6 && f < 11 ? 12 : Math.sin(f / 5) * 4} />
        {f >= 11 && [0, 1, 2, 3, 4, 5].map((k) => {
          const a = (k * 60 * Math.PI) / 180;
          const t = seg(f, 11, 20);
          return <line key={k} x1={phoneX + Math.cos(a) * 80} y1={LANE[2] - 50 + Math.sin(a) * 80} x2={phoneX + Math.cos(a) * (80 + 40 * t)} y2={LANE[2] - 50 + Math.sin(a) * (80 + 40 * t)}
            stroke={KRP.yellow} strokeWidth={7} strokeLinecap="round" />;
        })}
        <TagPlate x={300} y={196} text="スタート" size={34} />
        <TagPlate x={1644} y={196} text="ゴール" size={34} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #152 盤を広げるなら、数分。本なら、十数秒。スマホなら、数秒です。
// 格: 図 / seed 5152
// 絵: どこ: #151 の競技場のゴール横の電光掲示板。演出: 3つの記録が出る: 盤「数分」・本「十数秒」・スマホ「数秒」。それぞれのアイコンの横にストップウォッチ。掲示板の数字がぱらぱら変わって止まる。札「目安」(小さく)。動き: 数字がめくれて止まる / ストップウォッチの針
// どこ: #151 の競技場のゴール横の大きな電光掲示板 (照明塔・観客席・夕方の空)
// 演出: 3行の記録。盤・本・スマホのアイコンの横にストップウォッチ。数字がぱらぱらめくれて、上から順に「数分」「十数秒」「数秒」で止まる
// 動き: 数字のめくれ (行ごとに f16/26/36 で止まる) / 針が回って止まる / 止まった瞬間に行が光る / カメラが少し寄る
const Hm152: React.FC<{ f: number }> = ({ f }) => {
  const ROWS = [250, 445, 640];
  const stop = [16, 26, 36];
  const finals = ["数分", "十数秒", "数秒"];
  const stopAng = [300, 80, 22];
  const kinds: HmGbKind[] = ["board", "book", "phone"];
  const iconS = [0.62, 0.8, 0.72];
  const cam = easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5152}>
      <g transform={`translate(960 450) scale(${1 + 0.035 * cam}) translate(-960 -450)`}>
        {/* 夕方の空 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={KRP.blueSoft} />
        <rect x={-60} y={500} width={2040} height={400} fill="#F3D9B8" opacity={0.7} />
        {/* 照明塔 */}
        {[90, 1830].map((tx) => (
          <g key={tx}>
            <rect x={tx - 10} y={150} width={20} height={800} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={tx - 60} y={60} width={120} height={100} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={tx - 36 + (i % 3) * 36} cy={90 + Math.floor(i / 3) * 40} r={13}
              fill={KRP.white} opacity={0.75 + 0.25 * Math.sin(f / 6 + i)} stroke={KRP.ink} strokeWidth={2} />)}
          </g>
        ))}
        {/* 掲示板の脚と観客席 */}
        {[520, 1400].map((lx) => <rect key={lx} x={lx - 26} y={760} width={52} height={300} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />)}
        <rect x={-60} y={850} width={2040} height={300} fill={C.stand} />
        {Array.from({ length: 3 }, (_, r) => Array.from({ length: 50 }, (_, i) => (
          <circle key={`${r}-${i}`} cx={i * 40 + (r % 2) * 20} cy={880 + r * 50} r={12} fill={[KRP.red, KRP.blueDeep, KRP.yellow, KRP.green, KRP.white][(i + r * 2) % 5]} stroke={KRP.ink} strokeWidth={2} />
        )))}
        {/* 電光掲示板 */}
        <rect x={210} y={70} width={1500} height={710} rx={22} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={8} />
        <rect x={240} y={100} width={1440} height={650} rx={12} fill={C.ledBg} />
        <g opacity={0.12}>
          {Array.from({ length: 36 }, (_, i) => <line key={i} x1={250 + i * 40} y1={110} x2={250 + i * 40} y2={740} stroke={KRP.white} strokeWidth={1.5} />)}
        </g>
        {[340, 545].map((ly) => <line key={ly} x1={260} y1={ly} x2={1660} y2={ly} stroke="#3A3E46" strokeWidth={4} />)}
        {[0, 1, 2, 3].map((k) => <circle key={k} cx={230 + k * 487} cy={86} r={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />)}
        {ROWS.map((ry, i) => {
          const done = f >= stop[i];
          const flash = done ? 1 - seg(f, stop[i], stop[i] + 6) : 0;
          const ang = done ? stopAng[i] : (f * (36 - i * 6)) % 360;
          const d = Math.floor(f / 2) + i * 31;
          const roll = `${Math.floor(rnd(5152, d) * 10)}:${Math.floor(rnd(5153, d) * 6)}${Math.floor(rnd(5154, d) * 10)}`;
          return (
            <g key={i}>
              {flash > 0 && <rect x={260} y={ry - 92} width={1400} height={184} rx={10} fill={C.led} opacity={0.25 * flash} />}
              {/* アイコン (白い台の上) */}
              <rect x={290} y={ry - 80} width={220} height={160} rx={16} fill="#3A3E46" />
              <HmGbDevice kind={kinds[i]} x={400} y={ry + HMGB_SIZE[kinds[i]][1] * iconS[i] / 2} s={iconS[i]} f={f} legs={false} mood={done ? "smile" : "wow"} />
              <HmGbWatch x={650} y={ry + 12} r={62} ang={ang} />
              <text x={1180} y={ry + 44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={124}
                fill={C.led} opacity={done ? 1 : 0.75} letterSpacing={8}
                transform={done ? `translate(1180 ${ry}) scale(${pop(seg(f, stop[i], stop[i] + 5))}) translate(-1180 ${-ry})` : undefined}>
                {done ? finals[i] : roll}
              </text>
            </g>
          );
        })}
        <TagPlate x={1590} y={128} text="目安" size={30} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #153 もちろん、どの道具も、「この長さの隙間用です」と作られたわけでは、ありません。
// 格: 並 / seed 5153
// 絵: どこ: 道具の工場の設計室 (製図台・設計図)。演出: 設計図に「○分用」と書いたシールを貼ろうとする手を、別の手が「ちがう、ちがう」と止める。設計図にはゲーム機の絵。シールがはがれてひらひら落ちる。動き: シールを貼ろうとする / 手で止める / シールが落ちる
// どこ: 道具の工場の設計室。真上から見た製図台 (緑のカッティングマット・青焼きの設計図・T定規・三角定規・コンパス・鉛筆・消しくず・ランプの光)
// 演出: 設計図に描かれたゲーム機 (正面図と側面図・寸法線)。左から「○分用」のシールをつまんだ手が来て、画面に貼ろうとする。
//       右上から別の手がぬっと出て、手のひらで「ちがう、ちがう」と止める。シールは指からはがれて、ひらひら机へ落ちる
// 動き: 貼ろうとする手 (f0-14) / 止める手 (f12-20) と小さなふり / シールが落ちる (f22-42) / カメラが少し寄る
const Hm153: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const reach = easeOut(seg(f, 0, 14));
  const recoil = easeOut(seg(f, 20, 28));
  const hx = lerp(150, 640, reach) - 90 * recoil;
  const hy = 400 - 20 * reach + 30 * recoil;
  const stopIn = easeOut(seg(f, 12, 20));
  const sx = lerp(1700, 900, stopIn), sy = lerp(-160, 250, stopIn);
  const wag = f > 20 ? Math.sin((f - 20) / 3.5) * 12 : 0;
  const fall = seg(f, 22, 42);
  const held = f < 22;
  const stX = held ? hx + 120 : lerp(720, 470, fall) + Math.sin(fall * 9) * 50 * (1 - fall);
  const stY = held ? hy - 6 : lerp(394, 700, easeIn(fall));
  const stR = held ? -6 : Math.sin(fall * 8) * 28 * (1 - fall) + fall * 14;
  return (
    <Frame f={f} seed={5153}>
      <g transform={`translate(960 480) scale(${1 + 0.04 * cam}) translate(-960 -480)`}>
        {/* カッティングマット */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.mat} />
        <g stroke={C.matLine} strokeWidth={2.5}>
          {Array.from({ length: 34 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={-60} x2={i * 60} y2={1140} />)}
          {Array.from({ length: 20 }, (_, i) => <line key={`h${i}`} x1={-60} y1={i * 60} x2={1980} y2={i * 60} />)}
        </g>
        {/* ランプの光だまり */}
        <ellipse cx={1500} cy={260} rx={620} ry={420} fill={C.lampWarm} opacity={0.16 + 0.03 * Math.sin(f / 6)} />
        {/* 丸めた設計図 */}
        {[0, 1].map((k) => (
          <g key={k} transform={`rotate(${-18 + k * 10} 180 ${150 + k * 80})`}>
            <rect x={40} y={120 + k * 80} width={300} height={56} rx={28} fill={k ? C.printLine : C.print} stroke={KRP.ink} strokeWidth={5} />
            <ellipse cx={340} cy={148 + k * 80} rx={14} ry={28} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 青焼きの設計図 */}
        <g transform="rotate(-2 960 450)">
          <rect x={380} y={110} width={1200} height={680} fill={C.print} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={C.printLine} strokeWidth={1.5} opacity={0.25}>
            {Array.from({ length: 30 }, (_, i) => <line key={`a${i}`} x1={380 + i * 40} y1={110} x2={380 + i * 40} y2={790} />)}
            {Array.from({ length: 17 }, (_, i) => <line key={`b${i}`} x1={380} y1={110 + i * 40} x2={1580} y2={110 + i * 40} />)}
          </g>
          <rect x={400} y={130} width={1160} height={640} fill="none" stroke={C.printLine} strokeWidth={4} />
          {/* ゲーム機の正面図 */}
          <g stroke={C.printLine} strokeWidth={5} fill="none">
            <rect x={740} y={180} width={300} height={500} rx={24} />
            <rect x={780} y={220} width={220} height={190} rx={10} />
            <rect x={808} y={244} width={164} height={140} strokeDasharray="10 8" />
            <path d="M 790 520 h 30 v -30 h 30 v 30 h 30 v 30 h -30 v 30 h -30 v -30 h -30 Z" />
            <circle cx={940} cy={540} r={22} /><circle cx={985} cy={505} r={22} />
            {[0, 1, 2, 3].map((i) => <line key={i} x1={930 + i * 18} y1={650} x2={960 + i * 18} y2={610} />)}
            {/* 側面図 */}
            <rect x={1200} y={180} width={80} height={500} rx={14} />
            <line x1={1200} y1={260} x2={1280} y2={260} />
            {/* 寸法線 */}
            <line x1={740} y1={720} x2={1040} y2={720} strokeWidth={3} />
            <path d="M 740 720 l 18 -10 v 20 Z M 1040 720 l -18 -10 v 20 Z" fill={C.printLine} />
            <line x1={700} y1={180} x2={700} y2={680} strokeWidth={3} />
            <path d="M 700 180 l -10 18 h 20 Z M 700 680 l -10 -18 h 20 Z" fill={C.printLine} />
            <line x1={1320} y1={180} x2={1320} y2={680} strokeWidth={3} strokeDasharray="12 8" />
          </g>
          {/* 表題欄 (字は書かない) */}
          <rect x={1340} y={650} width={220} height={120} fill="none" stroke={C.printLine} strokeWidth={4} />
          {[0, 1, 2].map((i) => <line key={i} x1={1360} y1={680 + i * 30} x2={1540 - i * 40} y2={680 + i * 30} stroke={C.printLine} strokeWidth={4} opacity={0.6} />)}
          {/* 貼るはずだった所 (うすい点線の枠) */}
          <rect x={800} y={250} width={180} height={84} rx={10} fill="none" stroke={KRP.yellow} strokeWidth={4} strokeDasharray="8 8" opacity={0.6 * (1 - recoil)} />
        </g>
        {/* T定規・三角定規・コンパス・鉛筆・消しくず */}
        <rect x={300} y={838} width={1320} height={40} fill="#E9D9A8" stroke={KRP.ink} strokeWidth={5} />
        <rect x={250} y={800} width={60} height={120} fill="#C9A267" stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={320 + i * 43} y1={838} x2={320 + i * 43} y2={i % 5 ? 852 : 862} stroke={KRP.ink} strokeWidth={2.5} />)}
        <path d="M 1640 140 L 1860 560 L 1640 560 Z" fill={KRP.blueSoft} opacity={0.85} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1690 300 L 1790 500 L 1690 500 Z" fill={C.mat} stroke={KRP.ink} strokeWidth={4} />
        <g transform="translate(1740 700) rotate(20)">
          <line x1={0} y1={0} x2={-60} y2={160} stroke={KRP.silver} strokeWidth={10} strokeLinecap="round" />
          <line x1={0} y1={0} x2={60} y2={160} stroke={KRP.silver} strokeWidth={10} strokeLinecap="round" />
          <circle r={16} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {[[200, 520, -30, KRP.yellow], [240, 600, -20, KRP.red]].map(([px, py, r, c], i) => (
          <g key={i} transform={`translate(${px} ${py}) rotate(${r})`}>
            <rect x={-110} y={-10} width={200} height={20} fill={c as string} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 90 -10 L 120 0 L 90 10 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
        {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={1470 + rnd(53, i) * 120} cy={820 + rnd(54, i) * 40 - 60} rx={8} ry={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={2} />)}
        {/* 左の手 (シールを持つ・青いシャツの袖) */}
        <g transform={`translate(${hx} ${hy}) rotate(-6)`}>
          <rect x={-760} y={-52} width={680} height={104} rx={20} fill={C.sleeveA} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-100} y={-56} width={44} height={112} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <ellipse cx={0} cy={4} rx={70} ry={52} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          {[-24, 0, 24].map((dy, i) => <rect key={i} x={30} y={dy - 2} width={70 - i * 6} height={22} rx={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
          <rect x={20} y={-50} width={84} height={24} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(18 20 -38)" />
        </g>
        {/* シール */}
        <g transform={`translate(${stX} ${stY}) rotate(${stR})`}>
          <rect x={-90} y={-38} width={180} height={76} rx={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
          {!held && <path d="M 90 -38 l -22 0 l 22 22 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />}
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>○分用</text>
        </g>
        {/* 止める手 (右上から。カーキの袖) */}
        <g transform={`translate(${sx} ${sy}) rotate(${-28 + wag})`}>
          <rect x={-60} y={60} width={120} height={720} rx={22} fill={C.sleeveB} stroke={KRP.ink} strokeWidth={6} transform="rotate(-40 0 60)" />
          <rect x={-58} y={44} width={116} height={40} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} transform="rotate(-40 0 60)" />
          {[-42, -14, 14, 42].map((fx, i) => <rect key={i} x={fx - 13} y={-118 + Math.abs(i - 1.5) * 10} width={26} height={90} rx={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />)}
          <rect x={-70} y={-50} width={140} height={110} rx={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-104} y={-30} width={70} height={26} rx={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(-30 -50 -20)" />
          <path d="M -30 10 q 30 20 60 0" stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.4} />
        </g>
        {/* ふりの線 */}
        {f > 20 && [-1, 1].map((k) => (
          <path key={k} d={`M ${900 + k * 120} ${130} q ${k * 20} 40 0 80`} stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
        ))}
        <XMark x={890} y={420} s={0.55} t={seg(f, 21, 27)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #154 でも、ものさしに並べてみると、暇つぶしが、どんどん小さな暇へ、もぐりこんでいくように見えます。
// 格: 山 / seed 5154
// 絵: どこ: 前半と同じ作業机。演出: Monosashi (lit=3.5, focus=3)。ものさしの上を、道具たちが左 (日) から右 (秒) へ**列になって歩いていき**、右に行くほど小さくなる (盤・本・カセット・ゲーム機・スマホ)。いちばん右の細かい目盛りの溝に、スマホがすっともぐりこむ。捜索係が虫めがねで追う。動き: 道具の行列 / スマホがもぐりこむ / 虫めがね
// どこ: 前半と同じ作業机 (Sagyozukue) の上の暇のものさし (lit=3.5・秒を刻んでいる途中・focus=秒)
// 演出: ものさしの上の辺を、すごろく盤・本・カセット・ゲーム機・スマホが左 (日) から右 (秒) へ行列で歩き、右へ行くほど小さい。
//       先頭のスマホは「秒」の細かい目盛りの溝へ、すっともぐりこむ。ものさしの上に立つ捜索係が、虫めがねで溝をのぞいて驚く
// 動き: 行列が歩く (f0-30) / スマホがもぐる (f28-42) / 虫めがねが行列を追う / カメラが右へ寄る
const Hm154: React.FC<{ f: number }> = ({ f }) => {
  const TOP = 485;
  const cam = easeInOut(seg(f, 0, 42));
  const walk = easeOut(seg(f, 0, 30));
  const items: { k: HmGbKind; x: number; s: number }[] = [
    { k: "board", x: 450, s: 0.9 }, { k: "book", x: 760, s: 0.78 }, { k: "cassette", x: 990, s: 0.68 },
    { k: "gb", x: 1180, s: 0.5 }, { k: "phone", x: 1400, s: 0.42 },
  ];
  const dive = easeInOut(seg(f, 28, 42));
  const lens: [number, number] = [lerp(1190, 1440, easeInOut(seg(f, 8, 34))), lerp(380, 350, seg(f, 8, 34))];
  return (
    <Frame f={f} seed={5154}>
      <g transform={`translate(1300 480) scale(${1 + 0.12 * cam}) translate(-1300 -480)`}>
        <Sagyozukue f={f} />
        <Monosashi x={960} y={560} s={1} lit={3.5} f={f} focus={3} />
        {/* 溝 (スマホの入り口) */}
        <ellipse cx={1400} cy={TOP + 2} rx={30} ry={8} fill={KRP.ink} />
        {/* 行列 */}
        <defs><clipPath id="hm154top"><rect x={0} y={-100} width={1920} height={TOP + 100} /></clipPath></defs>
        {items.map((it, i) => {
          const x = it.x - 150 * (1 - walk);
          const isPhone = it.k === "phone";
          const moving = walk < 1;
          const el = (
            <HmGbDevice kind={it.k} x={x} y={TOP + (isPhone ? dive * 40 : 0)} s={it.s} f={f}
              walk={moving} phase={i * 1.3} mood={isPhone && dive > 0 ? "wow" : "smile"} arms={isPhone && dive > 0.3 ? "banzai" : "none"} />
          );
          return (
            <g key={it.k}>
              {!isPhone && moving && <ellipse cx={x - HMGB_SIZE[it.k][0] * it.s * 0.6} cy={TOP - 6} rx={14 * it.s + 6} ry={6} fill={KRP.white} opacity={0.5} />}
              {isPhone ? <g clipPath="url(#hm154top)">{el}</g> : el}
            </g>
          );
        })}
        {/* もぐりこむ瞬間のきらめき */}
        {dive > 0.2 && [0, 1, 2, 3, 4].map((j) => {
          const a = ((j * 72 + f * 6) * Math.PI) / 180;
          const r = 34 + 10 * Math.sin(f / 3 + j);
          return <circle key={j} cx={1400 + Math.cos(a) * r} cy={TOP - 20 + Math.sin(a) * r * 0.5} r={5} fill={HP.spark} stroke={KRP.ink} strokeWidth={1.5} />;
        })}
        {/* 行列の向きの矢じるし (足あとの点線) */}
        <path d={`M 300 ${TOP - 150} L 1330 ${TOP - 150}`} stroke={KRP.ink} strokeWidth={5} strokeDasharray="4 18" strokeLinecap="round" opacity={0.35} />
        <path d={`M 1330 ${TOP - 168} l 30 18 l -30 18`} stroke={KRP.ink} strokeWidth={5} fill="none" opacity={0.35} strokeLinecap="round" />
        {/* 捜索係 (ものさしの上に立つ) */}
        <Sousa x={1590} y={TOP + 2} s={0.6} f={f} face={dive > 0.3 ? "surprised" : "normal"} lean={-6} gaze={[-6, 4]} lensAt={lens} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #155 そのいちばん奥にいるのが、スマホです。
// 格: 山 / seed 5155
// 絵: どこ: ものさしの「秒」の区画の**溝の奥**に入っていく比喩の洞窟 (細い溝の中・暗い・光るスマホ)。演出: カメラが溝の奥へ奥へと入っていくと、いちばん奥に Sumaho (screen="feed", glow=1) が宝物のように光って鎮座している。捜索係がランタンで照らして「いた!」。動き: カメラが奥へ / スマホの光 / ランタンのゆれ
// どこ: ものさしの「秒」の目盛りの溝の中 (比喩の洞窟)。木の壁が奥へ奥へと続き、天井の縁は秒の藍色、床には刻んだ目盛りの線
// 演出: カメラが溝の奥へ進むと、いちばん奥の赤いビロードの台座に、スマホ (feed・glow) が宝物のように光って鎮座している。
//       手前で捜索係がランタンを高く掲げて「いた!」
// 動き: カメラが奥へ (f0-40) / スマホの光がまわる / ランタンがゆれる
const Hm155: React.FC<{ f: number }> = ({ f }) => {
  const z = 0.95 * easeInOut(seg(f, 0, 40));
  const VX = 960, VY = 430;
  const N = 10;
  const ds = Array.from({ length: N + 1 }, (_, k) => k * 0.55 + 0.75 - z);
  const box = (d: number) => {
    const hw = 1150 / d, hh = 700 / d;
    return [VX - hw, VY - hh, VX + hw, VY + hh * 0.9];
  };
  const ps = 0.55 + 0.45 * (z / 0.95);
  const swing = Math.sin(f / 7) * 10;
  const hx0 = 400 + 67 * 0.9, hy0 = 900 - 310 * 0.9; const lx = 610, ly = 560;
  return (
    <Frame f={f} seed={5155} dark bg={C.caveFar}>
      <defs>
        <radialGradient id="hm155lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.lampWarm} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.lampWarm} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="hm155glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={HP.screenCore} stopOpacity={0.9} />
          <stop offset="1" stopColor={HP.screen} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-60} y={-60} width={2040} height={1200} fill={C.caveFar} />
      {/* 溝の壁 (遠くから手前へ) */}
      {Array.from({ length: N }, (_, j) => {
        const k = N - 1 - j;
        const dO = ds[k], dI = ds[k + 1];
        if (dO < 0.3) return null;
        const [ox1, oy1, ox2, oy2] = box(dO);
        const [ix1, iy1, ix2, iy2] = box(dI);
        const dark = clamp01((dO - 0.4) / 4.5);
        const col = mixColor(C.caveNear, C.caveFar, dark);
        const lineCol = mixColor("#5A4026", C.caveFar, dark * 0.8);
        return (
          <g key={k}>
            <path d={`M ${ox1} ${oy1} H ${ox2} V ${oy2} H ${ox1} Z M ${ix1} ${iy1} H ${ix2} V ${iy2} H ${ix1} Z`} fillRule="evenodd" fill={col} />
            {/* 天井の藍の帯 */}
            <path d={`M ${ox1} ${oy1} H ${ox2} L ${ix2} ${iy1} H ${ix1} Z`} fill={mixColor(HP.byo, C.caveFar, dark)} />
            {/* 床の目盛り */}
            {Array.from({ length: 5 }, (_, t) => {
              const u = (t + 0.5) / 5;
              const xa = lerp(ox1, ox2, u), xb = lerp(ix1, ix2, u);
              return <line key={t} x1={xa} y1={oy2} x2={lerp(xa, xb, 0.55)} y2={lerp(oy2, iy2, 0.55)} stroke={lineCol} strokeWidth={Math.max(2, 10 / dO)} strokeLinecap="round" />;
            })}
            {/* 角の線 */}
            {[[ox1, oy1, ix1, iy1], [ox2, oy1, ix2, iy1], [ox1, oy2, ix1, iy2], [ox2, oy2, ix2, iy2]].map(([a, b, c, d], q) => (
              <line key={q} x1={a} y1={b} x2={c} y2={d} stroke={KRP.ink} strokeWidth={Math.max(2, 6 / dO)} opacity={0.7} />
            ))}
            <rect x={ix1} y={iy1} width={ix2 - ix1} height={iy2 - iy1} fill="none" stroke={KRP.ink} strokeWidth={Math.max(2, 7 / dI)} opacity={0.8} />
            {/* 木目 */}
            <path d={`M ${ox1 + (ix1 - ox1) * 0.5} ${lerp(oy1, oy2, 0.3)} q 0 ${(oy2 - oy1) * 0.2} 0 ${(oy2 - oy1) * 0.4}`} stroke={lineCol} strokeWidth={Math.max(2, 5 / dO)} fill="none" opacity={0.6} />
          </g>
        );
      })}
      {/* いちばん奥: 光る宝物 */}
      <circle cx={VX} cy={VY} r={300 * ps} fill="url(#hm155glow)" opacity={0.8 + 0.2 * Math.sin(f / 5)} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = ((i * 36 + f * 1.5) * Math.PI) / 180;
        return <path key={i} d={`M ${VX} ${VY} L ${VX + Math.cos(a - 0.06) * 420 * ps} ${VY + Math.sin(a - 0.06) * 420 * ps} L ${VX + Math.cos(a + 0.06) * 420 * ps} ${VY + Math.sin(a + 0.06) * 420 * ps} Z`}
          fill={HP.screenCore} opacity={0.12} />;
      })}
      <g transform={`translate(${VX} ${VY}) scale(${ps}) translate(${-VX} ${-VY})`}>
        <ellipse cx={VX} cy={VY + 190} rx={170} ry={40} fill={KRP.brass} stroke={KRP.ink} strokeWidth={6} />
        <rect x={VX - 150} y={VY + 140} width={300} height={56} rx={24} fill="#A8322A" stroke={KRP.ink} strokeWidth={6} />
        <path d={`M ${VX - 140} ${VY + 150} q 140 -30 280 0`} stroke="#D25A4E" strokeWidth={6} fill="none" />
        {[-1, 1].map((k) => <circle key={k} cx={VX + k * 150} cy={VY + 168} r={14} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />)}
        <Sumaho x={VX} y={VY} s={0.9} f={f} screen="feed" glow={1} />
        {[0, 1, 2, 3].map((j) => {
          const tw = Math.abs(Math.sin(f / 5 + j * 1.6));
          const [sx, sy] = [[-130, -150], [140, -110], [-150, 60], [150, 80]][j];
          return <path key={j} transform={`translate(${VX + sx} ${VY + sy}) scale(${0.5 + tw * 0.7})`} d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill={HP.spark} stroke={KRP.ink} strokeWidth={2} />;
        })}
      </g>
      {/* ランタンの光 */}
      <circle cx={lx} cy={ly + 70} r={360} fill="url(#hm155lamp)" opacity={0.85 + 0.15 * Math.sin(f / 3)} />
      {/* 捜索係 */}
      <Sousa x={400} y={900} s={0.9} f={f} face="joy" pose="raise" lens={false} lean={4} gaze={[6, -2]} />
      {/* ランタンの竿 (掲げた手から斜め前へ) */}
      <line x1={hx0} y1={hy0} x2={lx + 10} y2={ly - 6} stroke="#6E4526" strokeWidth={12} strokeLinecap="round" />
      <line x1={hx0} y1={hy0} x2={lx + 10} y2={ly - 6} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
      <circle cx={hx0} cy={hy0} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {/* ランタン (竿の先から下がる) */}
      <g transform={`translate(${lx} ${ly}) rotate(${swing})`}>
        <path d="M -16 0 Q 0 -22 16 0" stroke={KRP.ink} strokeWidth={5} fill="none" />
        <line x1={0} y1={0} x2={0} y2={26} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-30} y={26} width={60} height={14} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-26} y={40} width={52} height={66} rx={8} fill={C.lampWarm} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={0} cy={76} rx={8} ry={14 + Math.sin(f / 2) * 3} fill={KRP.orange} />
        {[-12, 12].map((bx) => <line key={bx} x1={bx} y1={40} x2={bx} y2={106} stroke={KRP.ink} strokeWidth={3} />)}
        <rect x={-30} y={104} width={60} height={12} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 「いた!」のびっくり */}
      <g transform={`translate(270 560) scale(${pop(seg(f, 30, 38))}) rotate(-12)`}>
        <rect x={-10} y={-60} width={20} height={58} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={0} cy={18} r={11} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
      </g>
      <TagPlate x={1800} y={110} text="秒" size={44} color={KRP.white} fill={HP.byo} />
    </Frame>
  );
};

// -------------------------------------------------------------------
// #156 イギリスで、23人のスマホの使い方を、実際に記録した研究があります。
// 格: 山 / seed 5156
// 絵: どこ: イギリスの大学の研究室 (本棚・窓の外に石造りの建物)。地名札「イギリス」。演出: 壁のボードに23人分の小さな顔写真の枠 (シルエットの丸)。研究者 (白衣・一般人) がノートパソコンで記録を見ている。机に23台のスマホが並び、それぞれから記録の線がパソコンへ。札「23人」。動き: 記録の線が流れる / スマホが順に光る / 研究者がメモ
// どこ: イギリスの大学の研究室。窓の外に石造りの尖塔と建物、腰板の壁、本棚、机の上に英国旗の卓上旗
// 演出: 壁のコルクボードに23人分の顔写真の枠 (シルエットの丸) が順に貼られる。机の上には23台のスマホが2列に並び、
//       それぞれから記録の線がノートパソコンへのびて、光の粒が流れていく。机の奥で白衣の研究者がパソコンを見ながらメモ
// 動き: 写真が順に貼られる (f0-22) / スマホが順に光る / 記録の線に粒が流れる / 研究者のペン / カメラがゆっくり右へ
const HmGbUnionJack: React.FC<{ x: number; y: number; w: number; h: number; id: string }> = ({ x, y, w, h, id }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs><clipPath id={id}><rect x={0} y={0} width={w} height={h} /></clipPath></defs>
    <g clipPath={`url(#${id})`}>
      <rect x={0} y={0} width={w} height={h} fill={C.ukBlue} />
      <line x1={0} y1={0} x2={w} y2={h} stroke={KRP.white} strokeWidth={h * 0.2} />
      <line x1={w} y1={0} x2={0} y2={h} stroke={KRP.white} strokeWidth={h * 0.2} />
      <line x1={0} y1={0} x2={w} y2={h} stroke={KRP.red} strokeWidth={h * 0.07} />
      <line x1={w} y1={0} x2={0} y2={h} stroke={KRP.red} strokeWidth={h * 0.07} />
      <rect x={w / 2 - h * 0.17} y={0} width={h * 0.34} height={h} fill={KRP.white} />
      <rect x={0} y={h / 2 - h * 0.17} width={w} height={h * 0.34} fill={KRP.white} />
      <rect x={w / 2 - h * 0.1} y={0} width={h * 0.2} height={h} fill={KRP.red} />
      <rect x={0} y={h / 2 - h * 0.1} width={w} height={h * 0.2} fill={KRP.red} />
    </g>
    <rect x={0} y={0} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={4} />
  </g>
);
const Hm156: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const LAP: [number, number] = [1150, 640];
  const phones = Array.from({ length: 23 }, (_, i) => {
    const row = i < 12 ? 0 : 1;
    const col = row ? i - 12 : i;
    return { x: 250 + col * 56 + row * 28, y: row ? 790 : 712, i };
  });
  const memo = Math.sin(f / 2.5) * 6;
  return (
    <Frame f={f} seed={5156}>
      <g transform={`translate(${12 - 24 * cam} 0) translate(960 480) scale(1.03) translate(-960 -480)`}>
        {/* 壁と腰板 */}
        <rect x={-60} y={-60} width={2040} height={720} fill={C.wall156} />
        <rect x={-60} y={480} width={2040} height={180} fill={C.wain} />
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-40 + i * 150} y={500} width={120} height={130} rx={6} fill="none" />)}
        </g>
        {/* 窓と、外の石造りの建物 */}
        <rect x={100} y={80} width={460} height={380} fill={C.sky156} stroke={KRP.ink} strokeWidth={8} />
        <g>
          {[[150, 190, 40], [430, 210, 34]].map(([cx, cy, r], i) => <ellipse key={i} cx={cx + Math.sin(f / 40 + i) * 8} cy={cy} rx={r * 1.8} ry={r * 0.7} fill={KRP.white} opacity={0.8} />)}
          <path d="M 300 120 L 330 230 L 270 230 Z" fill={C.stoneDark} stroke={KRP.ink} strokeWidth={4} />
          <rect x={270} y={230} width={60} height={230} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 290 290 q 10 -20 20 0 v 30 h -20 Z" fill={C.stoneDark} />
          <rect x={110} y={300} width={170} height={160} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
          <rect x={330} y={280} width={220} height={180} fill={C.stone} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={110 + i * 22} y={286} width={14} height={16} fill={C.stone} stroke={KRP.ink} strokeWidth={3} />)}
          {Array.from({ length: 10 }, (_, i) => <rect key={`c${i}`} x={330 + i * 22} y={266} width={14} height={16} fill={C.stone} stroke={KRP.ink} strokeWidth={3} />)}
          {[140, 200, 360, 420, 480].map((wx) => <path key={wx} d={`M ${wx} 420 v -60 q 15 -26 30 0 v 60 Z`} fill={C.stoneDark} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        <line x1={330} y1={80} x2={330} y2={460} stroke={KRP.ink} strokeWidth={7} />
        <line x1={100} y1={270} x2={560} y2={270} stroke={KRP.ink} strokeWidth={7} />
        <rect x={80} y={456} width={500} height={22} fill={C.wain} stroke={KRP.ink} strokeWidth={5} />
        {/* コルクボードと23枚の写真 */}
        <rect x={630} y={70} width={640} height={380} rx={10} fill={C.cork} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 23 }, (_, i) => {
          const cx = 690 + (i % 6) * 104, cy = 120 + Math.floor(i / 6) * 88;
          const t = seg(f, i * 0.9, i * 0.9 + 4);
          if (t <= 0) return null;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${pop(t)}) rotate(${(rnd(56, i) - 0.5) * 10})`}>
              <rect x={-36} y={-34} width={72} height={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={0} cy={0} r={30} fill={KRP.blueSoft} />
              <circle cx={0} cy={-6} r={12} fill={KRP.grayDark} />
              <path d="M -22 26 q 22 -30 44 0 Z" fill={KRP.grayDark} />
              <circle cx={0} cy={-36} r={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={2} />
            </g>
          );
        })}
        {/* 本棚 (右) */}
        <rect x={1500} y={40} width={420} height={620} fill="#6B4A36" stroke={KRP.ink} strokeWidth={7} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={1510} y={180 + r * 140} width={400} height={12} fill="#4E3424" />
            {Array.from({ length: 11 }, (_, i) => (
              <rect key={i} x={1516 + i * 35} y={70 + r * 140 + (i % 4) * 5} width={28} height={110 - (i % 4) * 5}
                fill={["#7A3A3A", "#3E5A7A", "#5E7A4A", "#8A6A3A", "#4A4A6A"][(i + r) % 5]} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* 研究者 (机の奥・白衣) */}
        <Person x={1560} y={680} s={1.1} f={f} face="normal" pose="hold" cloth={KRP.white} clothDark={KRP.gray} glasses gaze={[-7, 4]} phase={2} />
        {/* メモ帳とペン */}
        <g transform="translate(1560 552) rotate(-8)">
          <rect x={-50} y={-40} width={100} height={70} rx={4} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2].map((k) => <line key={k} x1={-38} y1={-22 + k * 16} x2={-38 + Math.min(76, Math.max(0, (f - 6 - k * 10) * 4))} y2={-22 + k * 16} stroke={KRP.ink} strokeWidth={3} />)}
          <g transform={`translate(${10 + memo} -4) rotate(205)`}>
            <rect x={-6} y={-70} width={12} height={70} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* 机 (天板) */}
        <rect x={-60} y={620} width={2040} height={520} fill={C.desk} />
        <rect x={-60} y={612} width={2040} height={18} fill={C.deskDark} stroke={KRP.ink} strokeWidth={5} />
        <g stroke={C.deskDark} strokeWidth={4} opacity={0.5}>{[700, 820, 940].map((gy) => <path key={gy} d={`M -60 ${gy} q 1000 14 2040 0`} fill="none" />)}</g>
        {/* 卓上の英国旗 */}
        <rect x={856} y={500} width={8} height={130} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={2} />
        <ellipse cx={860} cy={632} rx={30} ry={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        <HmGbUnionJack x={864} y={500} w={96} h={56} id="hm156uk" />
        {/* ノートパソコン */}
        <g>
          <path d={`M ${LAP[0] - 150} 700 L ${LAP[0] + 170} 700 L ${LAP[0] + 200} 730 L ${LAP[0] - 180} 730 Z`} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <rect x={LAP[0] - 140} y={520} width={300} height={180} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={LAP[0] - 128} y={532} width={276} height={156} fill={HP.screen} />
          {Array.from({ length: 6 }, (_, r) => {
            const n = Math.floor(seg(f, 6 + r * 3, 40) * 14);
            return Array.from({ length: n }, (_, c) => (
              <rect key={`${r}-${c}`} x={LAP[0] - 118 + c * 19} y={544 + r * 23} width={12 + (rnd(156, r * 20 + c) > 0.5 ? 4 : 0)} height={12} fill={[KRP.blueDeep, HP.byo, KRP.green][r % 3]} opacity={0.8} />
            ));
          })}
        </g>
        {/* 23台のスマホと記録の線 */}
        {phones.map(({ x, y, i }) => {
          const on = seg(f, 2 + i * 1.3, 4 + i * 1.3);
          if (on <= 0) return null;
          const x0 = x, y0 = y - 40;
          const cx1 = (x0 + LAP[0]) / 2, cy1 = Math.min(y0, LAP[1]) - 80 - (i % 5) * 16;
          return (
            <g key={`l${i}`}>
              <path d={`M ${x0} ${y0} Q ${cx1} ${cy1} ${LAP[0] - 150} ${LAP[1]}`} stroke={HP.byo} strokeWidth={3} fill="none" opacity={0.55 * on} strokeDasharray="8 6" />
              {[0, 1].map((q) => {
                const u = ((f * 0.04 + i * 0.13 + q * 0.5) % 1);
                const bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx1 + u * u * (LAP[0] - 150);
                const by = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy1 + u * u * LAP[1];
                return <circle key={q} cx={bx} cy={by} r={5} fill={HP.spark} stroke={KRP.ink} strokeWidth={1.5} opacity={on} />;
              })}
            </g>
          );
        })}
        {phones.map(({ x, y, i }) => {
          const on = seg(f, 2 + i * 1.3, 4 + i * 1.3);
          const blink = on > 0 && Math.sin(f / 4 + i * 1.7) > -0.2;
          return (
            <g key={`p${i}`}>
              <ellipse cx={x + 4} cy={y + 2} rx={22} ry={5} fill={KRP.ink} opacity={0.2} />
              <rect x={x - 18} y={y - 64} width={36} height={64} rx={7} fill={KRP.ink} />
              <rect x={x - 14} y={y - 59} width={28} height={54} rx={4} fill={blink ? HP.screen : "#2A2E35"} />
              {blink && <rect x={x - 14} y={y - 59} width={28} height={20} rx={4} fill={HP.screenCore} opacity={0.7} />}
            </g>
          );
        })}
        {/* コーヒーと紙の束 */}
        <rect x={1700} y={660} width={70} height={70} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1735} cy={666} rx={30} ry={7} fill="#6B4527" />
        {[0, 1].map((i) => <path key={i} d={`M ${1722 + i * 24} 640 q 10 -16 0 -30`} stroke={KRP.white} strokeWidth={4} fill="none" opacity={0.6} transform={`translate(0 ${-((f + i * 11) % 20)})`} />)}
        <TagPlate x={330} y={540} text="イギリス" size={38} t={seg(f, 0, 6)} />
        <TagPlate x={1060} y={480} text="23人" size={44} t={seg(f, 20, 26)} fill={KRP.cream} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #157 1日に使った回数は、平均で約85回。
// 格: 図 / seed 5157
// 絵: どこ: 研究室のホワイトボード。演出: 1日 (朝6時〜夜12時) を表す横長の線に、短い縦の線が**85本**ばらばらと打たれていく (f で増える)。カウンターの札「約85回」。動き: 縦線が増える (f0-40) / 数字がぱらぱら
// どこ: 研究室の壁の大きなホワイトボード (アルミ枠・マーカー受け・マグネット・付箋・消し残し)。横に本棚の端と時計
// 演出: 朝6時から夜12時までの横長の線 (左に朝日・右に月)。その上に、使った1回ごとの短い縦線が85本ばらばらと打たれていく。
//       宙に浮いたマーカーが線を打つ先へ飛び回る。右上のカウンター札が数え上がって「約85回」で止まる
// 動き: 縦線が増える (f2-40) / マーカーが飛ぶ / 数字がぱらぱら
type HmGbMark = { x: number; h: number; short: boolean; order: number; shortRank: number };
const HMGB_MARKS: HmGbMark[] = (() => {
  const arr = Array.from({ length: 85 }, (_, i) => {
    const r1 = rnd(57, i), r2 = rnd(58, i);
    const x = r1 < 0.22 ? 0.04 + r2 * 0.14 : r1 < 0.38 ? 0.33 + r2 * 0.09 : r1 < 0.75 ? 0.66 + r2 * 0.31 : r2 * 0.98;
    return { x, h: 0, short: false, order: 0, shortRank: -1, r3: rnd(59, i), r4: rnd(60, i), r5: rnd(61, i) };
  });
  [...arr].sort((a, b) => a.r3 - b.r3).forEach((m, k) => { m.short = k < 47; if (m.short) m.shortRank = k; });
  [...arr].sort((a, b) => a.r4 - b.r4).forEach((m, k) => { m.order = k; });
  arr.forEach((m) => { m.h = m.short ? 34 + m.r5 * 34 : 92 + m.r5 * 96; });
  return arr.map(({ x, h, short, order, shortRank }) => ({ x, h, short, order, shortRank }));
})();
const HmGbSun: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={-34} x2={0} y2={-48} stroke={KRP.orange} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45 + f})`} />)}
    <circle r={26} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
  </g>
);
const HmGbMoon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M 10 -32 A 34 34 0 1 0 22 26 A 26 26 0 1 1 10 -32 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
  </g>
);
const Hm157: React.FC<{ f: number }> = ({ f }) => {
  const X0 = 280, X1 = 1640, BASE = 520;
  const tOf = (m: HmGbMark) => 2 + m.order * (38 / 85);
  const n = HMGB_MARKS.filter((m) => f >= tOf(m)).length;
  const last = HMGB_MARKS.filter((m) => f >= tOf(m)).sort((a, b) => b.order - a.order)[0];
  const mk = last ? [X0 + last.x * (X1 - X0), BASE - last.h] : [X0, BASE - 100];
  const cam = easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5157}>
      <g transform={`translate(960 450) scale(${1 + 0.03 * cam}) translate(-960 -450)`}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.wall157} />
        <rect x={-60} y={830} width={2040} height={300} fill={C.tile} />
        <rect x={-60} y={822} width={2040} height={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        {/* 本棚の端と時計 */}
        <rect x={1810} y={120} width={160} height={720} fill="#6B4A36" stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((r) => <rect key={r} x={1820} y={140 + r * 220} width={150} height={190} fill={["#7A3A3A", "#3E5A7A", "#5E7A4A"][r]} stroke={KRP.ink} strokeWidth={3} />)}
        <g transform="translate(70 120)">
          <circle r={50} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-30} stroke={KRP.ink} strokeWidth={5} transform="rotate(100)" />
          <line x1={0} y1={4} x2={0} y2={-40} stroke={KRP.red} strokeWidth={2.5} transform={`rotate(${f * 6})`} />
        </g>
        {/* ホワイトボード */}
        <rect x={140} y={90} width={1640} height={690} rx={12} fill={C.alu} stroke={KRP.ink} strokeWidth={8} />
        <rect x={166} y={114} width={1588} height={642} fill="#FBFBF8" stroke={KRP.ink} strokeWidth={4} />
        <path d="M 1200 160 q 120 -20 240 10" stroke={KRP.gray} strokeWidth={10} opacity={0.25} fill="none" />
        <path d="M 260 700 q 160 -10 300 6" stroke={KRP.gray} strokeWidth={8} opacity={0.2} fill="none" />
        <rect x={500} y={780} width={920} height={22} rx={6} fill="#9EA3A8" stroke={KRP.ink} strokeWidth={5} />
        {[[560, KRP.red], [650, KRP.blueDeep], [740, KRP.ink]].map(([mx, c], i) => <rect key={i} x={mx as number} y={766} width={64} height={18} rx={8} fill={c as string} stroke={KRP.ink} strokeWidth={3} />)}
        {[[230, 150, KRP.red], [1690, 150, KRP.blueDeep], [1700, 700, KRP.green]].map(([mx, my, c], i) => <circle key={i} cx={mx as number} cy={my as number} r={16} fill={c as string} stroke={KRP.ink} strokeWidth={4} />)}
        <g transform="rotate(5 1640 640)">
          <rect x={1580} y={600} width={100} height={90} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
          <line x1={1594} y1={630} x2={1660} y2={630} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
          <line x1={1594} y1={656} x2={1640} y2={656} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        </g>
        {/* 1日の線 */}
        <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
        {[6, 9, 12, 15, 18, 21, 24].map((hr) => {
          const x = X0 + ((hr - 6) / 18) * (X1 - X0);
          const lab = hr % 6 === 0;
          return (
            <g key={hr}>
              <line x1={x} y1={BASE} x2={x} y2={BASE + (lab ? 28 : 16)} stroke={KRP.ink} strokeWidth={lab ? 6 : 4} />
              {lab && <text x={x} y={BASE + 74} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={KRP.ink}>{`${hr}時`}</text>}
            </g>
          );
        })}
        <HmGbSun x={X0 - 6} y={BASE + 150} f={f} />
        <HmGbMoon x={X1} y={BASE + 150} />
        {/* 85本の縦線 */}
        {HMGB_MARKS.map((m, i) => {
          const g = clamp01((f - tOf(m)) / 1.5);
          if (g <= 0) return null;
          const x = X0 + m.x * (X1 - X0);
          return <line key={i} x1={x} y1={BASE - 4} x2={x} y2={BASE - 4 - m.h * easeOut(g)} stroke={KRP.blueDeep} strokeWidth={m.short ? 5 : 6} strokeLinecap="round" />;
        })}
        {/* 飛ぶマーカー */}
        <g transform={`translate(${mk[0] + 8} ${mk[1] - 6 + (f > 40 ? Math.sin(f / 6) * 4 : 0)}) rotate(28)`}>
          <path d="M -8 0 L 8 0 L 4 -16 L -4 -16 Z" fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-14} y={-140} width={28} height={124} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={-14} y={-60} width={28} height={20} fill={KRP.blueDeep} />
        </g>
        <TagPlate x={330} y={190} text="1日" size={44} fill={KRP.cream} />
        <TagPlate x={1450} y={190} text={n >= 85 ? "約85回" : `${n}回`} size={58} color={n >= 85 ? KRP.red : KRP.ink} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #158 その半分以上が、30秒もたたずに終わっていました。
// 格: 図 / seed 5158
// 絵: どこ: #157 のホワイトボード (続き・寄り)。演出: 85本の縦線のうち、細くて短い線 (30秒未満) が赤く光り、半分以上が赤くなる。横に円グラフ (55%が赤)。札「30秒未満」「半分以上」。ストップウォッチが30秒で止まる。動き: 赤く光る / 円グラフ / ストップウォッチ
// どこ: #157 と同じホワイトボードに寄った絵 (アルミ枠の左上だけが見える)。同じ85本の縦線
// 演出: 85本のうち短い線 (30秒未満) が順に赤く光って、半分以上が赤くなる。右に円グラフが赤く塗られていき (55%)、
//       下にストップウォッチが30秒で止まる。札「30秒未満」「半分以上」
// 動き: 短い線が赤く光る (f4-28) / 円グラフ (f12-34) / ストップウォッチの針が回って30秒で止まる (f6-30)
const Hm158: React.FC<{ f: number }> = ({ f }) => {
  const X0 = 150, X1 = 1180, BASE = 500, HS = 1.25;
  const pie = easeInOut(seg(f, 12, 34)) * 0.55;
  const PR = 190, PX = 1490, PY = 340;
  const pa = (pie * 360 * Math.PI) / 180;
  const watch = seg(f, 6, 30);
  const cam = easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5158}>
      <g transform={`translate(700 400) scale(${1 + 0.04 * cam}) translate(-700 -400)`}>
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.alu} />
        <rect x={20} y={20} width={1980} height={1100} fill="#FBFBF8" stroke={KRP.ink} strokeWidth={6} />
        <path d="M 900 120 q 200 -24 360 10" stroke={KRP.gray} strokeWidth={12} opacity={0.2} fill="none" />
        <circle cx={70} cy={70} r={18} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {/* 1日の線と縦線 */}
        <line x1={X0 - 20} y1={BASE} x2={X1 + 20} y2={BASE} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
        {HMGB_MARKS.map((m, i) => {
          const x = X0 + m.x * (X1 - X0);
          const red = m.short ? seg(f, 4 + m.shortRank * (24 / 47), 6 + m.shortRank * (24 / 47)) : 0;
          const top = BASE - 4 - m.h * HS;
          return (
            <g key={i}>
              {red > 0 && <line x1={x} y1={BASE - 4} x2={x} y2={top} stroke={KRP.red} strokeWidth={18} strokeLinecap="round" opacity={0.22 * red} />}
              <line x1={x} y1={BASE - 4} x2={x} y2={top} stroke={red > 0.5 ? KRP.red : m.short ? KRP.blueDeep : KRP.grayDark}
                strokeWidth={m.short ? 5 : 7} strokeLinecap="round" />
            </g>
          );
        })}
        {/* 30秒未満の凡例とストップウォッチ */}
        <line x1={250} y1={690} x2={250} y2={630} stroke={KRP.red} strokeWidth={7} strokeLinecap="round" />
        <TagPlate x={440} y={664} text="30秒未満" size={42} color={KRP.red} />
        <HmGbWatch x={820} y={680} r={86} ang={180 * watch} sector={0.5 * watch} />
        {watch >= 1 && <circle cx={820} cy={680} r={100 + 16 * (1 - seg(f, 30, 38))} fill="none" stroke={KRP.red} strokeWidth={5} opacity={1 - seg(f, 30, 40) * 0.6} />}
        {/* 円グラフ */}
        <circle cx={PX + 10} cy={PY + 14} r={PR} fill={KRP.ink} opacity={0.15} />
        <circle cx={PX} cy={PY} r={PR} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
        {pie > 0 && (
          <path d={`M ${PX} ${PY} L ${PX} ${PY - PR} A ${PR} ${PR} 0 ${pie > 0.5 ? 1 : 0} 1 ${PX + Math.sin(pa) * PR} ${PY - Math.cos(pa) * PR} Z`}
            fill={KRP.red} stroke={KRP.ink} strokeWidth={6} strokeLinejoin="round" />
        )}
        <line x1={PX} y1={PY} x2={PX} y2={PY - PR} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={PX} cy={PY} r={8} fill={KRP.ink} />
        {/* 半分の線 (点線) */}
        <line x1={PX} y1={PY - PR - 20} x2={PX} y2={PY + PR + 20} stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 10" opacity={0.5} />
        <TagPlate x={1490} y={664} text="半分以上" size={46} color={KRP.red} t={seg(f, 30, 36)} />
        {/* マーカー受け */}
        <rect x={1100} y={790} width={760} height={22} rx={6} fill="#9EA3A8" stroke={KRP.ink} strokeWidth={5} />
        <rect x={1180} y={776} width={64} height={18} rx={8} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #159 しかも、本人たちの予想の、約2倍です。
// 格: 図 / seed 5159
// 絵: どこ: 研究室の机 (アンケート用紙と結果の紙)。演出: 左に「本人の予想」の棒 (短い)、右に「実際」の棒 (2倍の長さ)。右の棒がびよーんと伸びて、左の2倍で止まる。札「約2倍」。用紙の上のペンがころん。動き: 棒が伸びる / ペンが転がる
// どこ: 研究室の机を真上から (木の天板)。左にアンケート用紙、真ん中に方眼紙の結果のグラフ、まわりに電卓・ホチキス・コーヒー・クリップ
// 演出: 左の「本人の予想」の短い棒。右の「実際」の棒がびよーんと伸びて行き過ぎ、ぷるんと戻って、左のちょうど2倍で止まる
//       (左の棒の高さを点線で2つ積んだ目安つき)。伸びた棒の頭にペンがぶつかって、ころんと転がっていく
// 動き: 棒が伸びる (f8-34・ばねの戻り) / ペンが転がる (f24-42) / 札「約2倍」がぽん
const Hm159: React.FC<{ f: number }> = ({ f }) => {
  const BASE = 690, LH = 210;
  const g = seg(f, 8, 34);
  const spring = g <= 0 ? 0 : 1 - Math.cos(g * Math.PI * 3.2) * Math.exp(-g * 4.2);
  const RH = LH * 2 * spring;
  const LX = 760, RX = 1160, BW = 170;
  const LABEL_Y = 752;
  const roll = easeOut(seg(f, 24, 42));
  const penX = lerp(RX + 10, 1500, roll);
  const penY = lerp(BASE - LH * 2 - 30, 330, roll) - Math.sin(roll * Math.PI) * 60;
  const cam = easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={5159}>
      <g transform={`translate(960 470) scale(${1 + 0.03 * cam}) translate(-960 -470)`}>
        {/* 机の天板 */}
        <rect x={-60} y={-60} width={2040} height={1200} fill={C.desk} />
        <g stroke={C.deskDark} strokeWidth={5} opacity={0.5}>
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M -60 ${40 + i * 150} q 500 ${rnd(159, i) * 30 - 15} 1000 0 q 500 ${rnd(160, i) * 30 - 15} 1040 0`} fill="none" />)}
        </g>
        {/* アンケート用紙 */}
        <g transform="rotate(-7 300 420)">
          <rect x={110} y={140} width={370} height={540} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={140} y={170} width={200} height={20} rx={4} fill={KRP.gray} />
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x={140} y={230 + i * 60} width={30} height={30} rx={4} fill="none" stroke={KRP.ink} strokeWidth={4} />
              <line x1={190} y1={246 + i * 60} x2={440 - (i % 3) * 40} y2={246 + i * 60} stroke={KRP.gray} strokeWidth={6} />
              {i % 2 === 0 && <path d={`M 144 ${244 + i * 60} l 10 10 l 18 -22`} stroke={KRP.blueDeep} strokeWidth={5} fill="none" />}
            </g>
          ))}
        </g>
        {/* 方眼紙 */}
        <g transform="rotate(1.2 980 470)">
          <rect x={560} y={100} width={860} height={720} fill={C.graph} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={C.gridLine} strokeWidth={2}>
            {Array.from({ length: 22 }, (_, i) => <line key={`v${i}`} x1={580 + i * 40} y1={110} x2={580 + i * 40} y2={810} />)}
            {Array.from({ length: 18 }, (_, i) => <line key={`h${i}`} x1={570} y1={120 + i * 40} x2={1410} y2={120 + i * 40} />)}
          </g>
          <line x1={620} y1={BASE} x2={1360} y2={BASE} stroke={KRP.ink} strokeWidth={7} strokeLinecap="round" />
          <line x1={640} y1={BASE} x2={640} y2={180} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
          {/* 目安の点線 (左の棒1本ぶん・2本ぶん) */}
          {[1, 2].map((k) => <line key={k} x1={LX - BW / 2} y1={BASE - LH * k} x2={RX + BW / 2 + 70} y2={BASE - LH * k} stroke={KRP.grayDark} strokeWidth={4} strokeDasharray="12 10" opacity={k === 1 ? 0.7 : 0.9 * seg(f, 20, 30)} />)}
          {/* 左の棒 */}
          <rect x={LX - BW / 2} y={BASE - LH} width={BW} height={LH} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={6} />
          {/* 右の棒 (伸びる) */}
          {RH > 2 && <rect x={RX - BW / 2} y={BASE - RH} width={BW} height={RH} fill={KRP.orange} stroke={KRP.ink} strokeWidth={6} />}
          {RH > 2 && <rect x={RX - BW / 2 + 14} y={BASE - RH + 12} width={20} height={Math.max(0, RH - 24)} rx={8} fill={KRP.white} opacity={0.35} />}
          {/* 2段の目盛り (右の棒の横) */}
          <g opacity={seg(f, 20, 30)}>
            <path d={`M ${RX + BW / 2 + 30} ${BASE} v ${-LH} m -12 0 h 24 m -12 0 v ${-LH} m -12 0 h 24`} stroke={KRP.red} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
          {/* びよーんの線 */}
          {g > 0 && g < 1 && [0, 1, 2].map((k) => <path key={k} d={`M ${RX - 60 + k * 60} ${BASE - RH - 20} q 10 -20 0 -40`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5} />)}
        </g>
        {/* ペン (ころん) */}
        <g transform={`translate(${penX} ${penY}) rotate(${-10 + roll * 400})`}>
          <rect x={-90} y={-11} width={160} height={22} rx={6} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 70 -11 L 98 0 L 70 11 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-60} y={-17} width={60} height={8} rx={3} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2} />
        </g>
        {roll > 0 && roll < 1 && <path d={`M ${penX - 60} ${penY + 30} q 30 10 60 0`} stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.4} />}
        {/* 机の小物 */}
        <g transform="rotate(8 1650 640)">
          <rect x={1560} y={540} width={180} height={250} rx={18} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1584} y={564} width={132} height={50} rx={6} fill={C.gbScreen} stroke={KRP.ink} strokeWidth={3} />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={1584 + (i % 4) * 34} y={636 + Math.floor(i / 4) * 46} width={26} height={34} rx={5} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
        </g>
        <circle cx={1700} cy={200} r={74} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1700} cy={200} r={56} fill="#6B4527" />
        <ellipse cx={1684} cy={186} rx={16} ry={8} fill={KRP.white} opacity={0.35 + 0.1 * Math.sin(f / 5)} />
        <circle cx={1530} cy={120} r={60} fill="none" stroke="#7A5A3A" strokeWidth={6} opacity={0.35} />
        <path d="M 160 760 q 0 -24 24 -24 h 70 q 18 0 18 18 q 0 18 -18 18 h -64" stroke={KRP.silver} strokeWidth={6} fill="none" />
        {/* 札 */}
        <TagPlate x={760} y={LABEL_Y} text="本人の予想" size={36} />
        <TagPlate x={1160} y={LABEL_Y} text="実際" size={36} />
        <TagPlate x={1160} y={190} text="約2倍" size={54} color={KRP.red} t={seg(f, 30, 36)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #160 自分では、そんなに見ていないつもりだったのです。耳が痛い。
// 格: 山 / seed 5160
// 絵: どこ: 「あなた」の部屋 (夜・ソファ)。演出: ソファでスマホを見ている「あなた」の耳を、画面から伸びた吹き出し (「約2倍」の札) が**つまんで引っぱる** (ユーモア)。「あなた」は「いたた」の顔 (face="worried")、片目をつぶる。動き: 耳を引っぱる / 顔をしかめる / スマホの光
// どこ: #14 と同じ「あなた」の夜の部屋 (YoruNoHeya)。ソファに座ってひざの上のスマホを見ている
// 演出: スマホの画面からふきだしがぽんと出て (中に札「約2倍」)、ふきだしから白い手袋の腕がにゅっと伸び、
//       「あなた」の耳をつまんでぐいぐい引っぱる。「あなた」は片目をつぶった「いたた」の顔で、引っぱられる側へ体が傾く
// 動き: ふきだし (f6-16) / 腕が伸びる (f14-24) / 耳を引っぱる (f24-42・ゆっくり小さく) / スマホの光
const Hm160: React.FC<{ f: number }> = ({ f }) => {
  const PX = 860, PY = 758, S = 1.05;
  const pull = seg(f, 24, 32);
  const lean = 7 * easeOut(pull);
  const tug = 14 * easeOut(pull) + (f > 32 ? 4 * Math.sin((f - 32) / 4) : 0);
  const bub = pop(seg(f, 6, 16));
  const arm = easeOut(seg(f, 14, 24));
  const rad = (lean * Math.PI) / 180;
  const toW = (lx: number, ly: number): [number, number] =>
    [PX + S * (lx * Math.cos(rad) - ly * Math.sin(rad)), PY + S * (lx * Math.sin(rad) + ly * Math.cos(rad))];
  const [ex, ey] = toW(70 + tug, -228);
  const BX = 1300, BY = 270;
  const start: [number, number] = [BX - 200, BY + 40];
  const gx = lerp(start[0], ex + 18, arm), gy = lerp(start[1], ey, arm);
  return (
    <Frame f={f} seed={5160} dark>
      <YoruNoHeya f={f} />
      {/* スマホの光が部屋にこぼれる */}
      <ellipse cx={980} cy={560} rx={300} ry={220} fill={HP.screen} opacity={0.12 + 0.03 * Math.sin(f / 4)} />
      <Person x={PX} y={PY} s={S} f={f} pose="sit" face="worried" cloth={HP.you} clothDark={HP.youDark} gaze={[5, 6]} lean={lean} still />
      {/* 顔の上の重ね描き (Person と同じ座標系) */}
      <g transform={`translate(${PX} ${PY}) scale(${S}) rotate(${lean})`}>
        {/* 右目をぎゅっとつぶる */}
        <ellipse cx={24} cy={-222} rx={16} ry={21} fill={KRP.white} />
        <path d="M 12 -230 L 34 -222 L 12 -214" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* 引っぱられてのびる耳 */}
        <path d={`M 58 -246 Q ${76 + tug} -250 ${78 + tug} -228 Q ${76 + tug} -206 58 -210 Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 62 -236 Q ${70 + tug * 0.8} -230 62 -220`} stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.6} />
        {/* 顔の青い光 */}
        <circle cx={0} cy={-228} r={62} fill={HP.screen} opacity={0.12} />
        {/* いたたの線と汗 */}
        {pull > 0 && [0, 1, 2].map((k) => (
          <line key={k} x1={-80 - k * 6} y1={-290 + k * 22} x2={-104 - k * 6} y2={-300 + k * 26} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        ))}
        {pull > 0 && <path d={`M -74 -250 q 10 16 0 24 q -10 -8 0 -24 Z`} fill={KRP.blue} stroke={KRP.ink} strokeWidth={2.5} transform={`translate(0 ${Math.sin(f / 3) * 3})`} />}
      </g>
      {/* ひざの上のスマホ */}
      <Sumaho x={985} y={636} s={0.3} rot={-14} f={f} screen="feed" glow={0.8} />
      <circle cx={968} cy={680} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <YoruNoHeyaFront />
      {/* ふきだし (画面から出る) */}
      {bub > 0 && (
        <g>
          <path d={`M ${BX - 130} ${BY + 80} L ${lerp(BX - 100, 1000, bub)} ${lerp(BY + 110, 592, bub)} L ${BX - 40} ${BY + 118} Z`} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} strokeLinejoin="round" />
          <g transform={`translate(${BX} ${BY}) scale(${bub})`}>
            <ellipse cx={0} cy={0} rx={230} ry={130} fill={KRP.white} stroke={KRP.ink} strokeWidth={8} />
            <ellipse cx={-60} cy={-60} rx={70} ry={22} fill={HP.screen} opacity={0.4} />
          </g>
        </g>
      )}
      {/* 手袋の腕 */}
      {arm > 0 && (
        <g>
          <path d={`M ${start[0]} ${start[1]} Q ${(start[0] + gx) / 2 - 20} ${(start[1] + gy) / 2 - 60} ${gx} ${gy}`} stroke={KRP.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d={`M ${start[0]} ${start[1]} Q ${(start[0] + gx) / 2 - 20} ${(start[1] + gy) / 2 - 60} ${gx} ${gy}`} stroke={KRP.white} strokeWidth={24} fill="none" strokeLinecap="round" />
          <g transform={`translate(${gx} ${gy}) rotate(-20)`}>
            <circle cx={12} cy={0} r={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
            <rect x={-30} y={-26} width={44} height={18} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <rect x={-30} y={8} width={44} height={18} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <path d="M 0 -14 l 20 0 M 0 0 l 20 0 M 0 14 l 20 0" stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
          </g>
          {pull > 0 && [0, 1].map((k) => <path key={k} d={`M ${gx + 50 + k * 18} ${gy - 30 + k * 30} l 22 ${k ? 10 : -10}`} stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />)}
        </g>
      )}
      {bub > 0.9 && <TagPlate x={1300} y={262} text="約2倍" size={64} color={KRP.red} t={seg(f, 12, 18)} />}
    </Frame>
  );
};

// -------------------------------------------------------------------
// #161 信号待ち。エレベーター。レジの列。
// 格: 山 / seed 5161
// 絵: どこ: 3コマの漫画割り。①交差点の信号待ち ②エレベーターの中 ③スーパーのレジの列。演出: 3コマとも、待っている人の手にスマホが**同じタイミングで**ぽんと出てくる。各コマの隅に小さなストップウォッチ (数十秒・数秒)。動き: コマが順に出る (f0-12/12-24/24-36) / スマホがぽん
// どこ: 机の上に置いたまんがの原稿用紙。3コマ割り: ①交差点の信号待ち ②エレベーターの中 ③スーパーのレジの列
// 演出: コマが順に描かれていき、最後に3コマとも、待っている人の手にスマホが同時にぽんと出る。
//       各コマの右上に小さなストップウォッチと札 (数十秒・数秒・数十秒)。レジ係だけは働いているのでスマホなし
// 動き: コマが順に出る (f0-12/12-24/24-36) / スマホが同時にぽん (f36-41) / 車が走る・階数ランプ・ベルトコンベア
const PW = 590, PH = 700;
const HmGbPop: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  t > 0 && t < 1 ? (
    <g opacity={1 - t}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return <line key={i} x1={x + Math.cos(a) * (30 + 30 * t)} y1={y + Math.sin(a) * (30 + 30 * t)} x2={x + Math.cos(a) * (50 + 40 * t)} y2={y + Math.sin(a) * (50 + 40 * t)}
          stroke={KRP.yellow} strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  ) : null
);
const Hm161: React.FC<{ f: number }> = ({ f }) => {
  const ph = seg(f, 36, 41);
  const has = ph > 0;
  const ps = pop(ph);
  const popT = seg(f, 36, 42);
  const P0 = [40, 665, 1290];
  const PT = 90;
  const panel = (i: number, inner: React.ReactNode, label: string, watchAng: number) => {
    const t = easeOut(seg(f, i * 12, i * 12 + 10));
    if (t <= 0) return null;
    return (
      <g key={i} transform={`translate(${P0[i]} ${PT - 40 * (1 - t)})`} opacity={t}>
        <defs><clipPath id={`hm161p${i}`}><rect x={0} y={0} width={PW} height={PH} /></clipPath></defs>
        <g clipPath={`url(#hm161p${i})`}>{inner}</g>
        <rect x={0} y={0} width={PW} height={PH} fill="none" stroke={KRP.ink} strokeWidth={9} />
        <circle cx={PW - 60} cy={66} r={46} fill={KRP.white} opacity={0.8} />
        <HmGbWatch x={PW - 60} y={70} r={34} ang={watchAng} />
        <TagPlate x={PW - 190} y={70} text={label} size={28} />
      </g>
    );
  };
  // ① 交差点の信号待ち
  const carX = ((f * 16) % 1000) - 300;
  const p1 = (
    <g>
      <rect x={0} y={0} width={PW} height={420} fill={KRP.blueSoft} />
      {[[0, 300, 160], [170, 360, 150], [330, 250, 120], [460, 330, 140]].map(([bx, bh, bw], i) => (
        <g key={i}>
          <rect x={bx} y={420 - bh} width={bw} height={bh} fill={i % 2 ? C.building : "#C2B8A8"} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: Math.floor(bh / 60) * 3 }, (_, k) => (
            <rect key={k} x={bx + 16 + (k % 3) * (bw / 3.4)} y={440 - bh + Math.floor(k / 3) * 60} width={bw / 5} height={28} fill={KRP.white} opacity={0.7} stroke={KRP.ink} strokeWidth={2} />
          ))}
        </g>
      ))}
      <rect x={0} y={400} width={PW} height={150} fill={C.asphalt} />
      {[414, 448, 482, 516].map((zy) => <rect key={zy} x={0} y={zy} width={PW} height={18} fill={KRP.white} opacity={0.9} />)}
      <g transform={`translate(${carX} 0)`}>
        <rect x={0} y={392} width={200} height={56} rx={16} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 40 392 L 60 356 L 150 356 L 170 392 Z" fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        {[44, 156].map((wx) => <circle key={wx} cx={wx} cy={450} r={18} fill={KRP.ink} />)}
      </g>
      {Array.from({ length: 4 }, (_, k) => <line key={k} x1={carX - 20 - k * 30} y1={410 + k * 10} x2={carX - 70 - k * 30} y2={410 + k * 10} stroke={KRP.white} strokeWidth={4} opacity={0.6} />)}
      <rect x={0} y={550} width={PW} height={150} fill={C.tile} />
      <rect x={0} y={546} width={PW} height={12} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
      {Array.from({ length: 7 }, (_, k) => <line key={k} x1={k * 90} y1={558} x2={k * 90 - 30} y2={700} stroke={KRP.grayDark} strokeWidth={3} opacity={0.5} />)}
      {/* 歩行者信号 (赤) */}
      <rect x={496} y={250} width={14} height={440} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={466} y={170} width={74} height={140} rx={8} fill={KRP.ink} />
      <g transform="translate(503 205)">
        <circle cx={0} cy={-14} r={8} fill={KRP.red} />
        <rect x={-10} y={-4} width={20} height={26} rx={5} fill={KRP.red} />
      </g>
      <g transform="translate(503 270)" opacity={0.3}>
        <circle cx={0} cy={-14} r={8} fill={KRP.green} />
        <rect x={-10} y={-4} width={20} height={26} rx={5} fill={KRP.green} />
      </g>
      <Person x={260} y={676} s={0.86} f={f} pose={has ? "hold" : "stand"} face={has ? "smile" : "normal"} gaze={has ? [0, 6] : [8, -4]}
        cloth={HP.you} clothDark={HP.youDark} phase={1} />
      {has && <Sumaho x={260} y={676 - 118 * 0.86 - 4} s={0.18 * ps} f={f} screen="feed" glow={0.6} />}
      <HmGbPop x={260} y={546} t={popT} />
    </g>
  );
  // ② エレベーターの中
  const p2 = (
    <g>
      <rect x={0} y={0} width={PW} height={PH} fill={C.elev} />
      {[120, 240, 360, 480].map((sx) => <line key={sx} x1={sx} y1={60} x2={sx} y2={600} stroke={C.elevDark} strokeWidth={4} />)}
      <rect x={0} y={0} width={PW} height={60} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {[100, 300, 500].map((lx) => <rect key={lx} x={lx - 50} y={18} width={100} height={22} rx={8} fill={HP.screenCore} />)}
      <rect x={120} y={110} width={240} height={190} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
      <path d="M 150 130 L 220 130 L 150 220 Z" fill={KRP.white} opacity={0.5} />
      {/* 階のランプ (矢印と点) */}
      <rect x={380} y={90} width={170} height={60} rx={8} fill={KRP.ink} />
      <path d="M 410 132 l 16 -24 l 16 24 Z" fill={C.led} opacity={0.6 + 0.4 * Math.sin(f / 3)} />
      {[0, 1, 2, 3].map((k) => <circle key={k} cx={470 + k * 20} cy={120} r={6} fill={Math.floor(f / 8) % 4 === k ? C.led : "#4A4A50"} />)}
      {/* 手すりとボタン */}
      <rect x={0} y={420} width={PW} height={14} rx={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      <rect x={500} y={300} width={70} height={190} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={520 + (k % 2) * 30} cy={330 + Math.floor(k / 2) * 40} r={10} fill={k === 5 ? C.led : KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
      <rect x={0} y={600} width={PW} height={100} fill={C.elevDark} />
      <Person x={170} y={676} s={0.82} f={f} pose={has ? "hold" : "stand"} face={has ? "smile" : "normal"} gaze={has ? [0, 6] : [0, -6]}
        cloth="#4A5A78" clothDark="#36425A" glasses phase={2} />
      <Person x={390} y={676} s={0.82} f={f} pose={has ? "hold" : "armsFolded"} face={has ? "smile" : "normal"} gaze={has ? [0, 6] : [4, -6]}
        cloth="#8E5A9A" clothDark="#6A4274" phase={5} />
      {has && <Sumaho x={170} y={676 - 118 * 0.82 - 4} s={0.17 * ps} f={f} screen="on" glow={0.6} />}
      {has && <Sumaho x={390} y={676 - 118 * 0.82 - 4} s={0.17 * ps} f={f} screen="feed" glow={0.6} />}
      <HmGbPop x={170} y={550} t={popT} />
      <HmGbPop x={390} y={550} t={popT} />
    </g>
  );
  // ③ スーパーのレジの列
  const belt = (f * 3) % 60;
  const p3 = (
    <g>
      <rect x={0} y={0} width={PW} height={PH} fill="#F1E9D8" />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={0} y={150 + r * 100} width={PW} height={12} fill={C.shelf} stroke={KRP.ink} strokeWidth={3} />
          {Array.from({ length: 12 }, (_, k) => (
            <rect key={k} x={8 + k * 49} y={86 + r * 100 + (k % 3) * 6} width={38} height={64 - (k % 3) * 6} rx={4}
              fill={[KRP.red, KRP.yellow, KRP.green, KRP.blue, KRP.orange][(k + r * 2) % 5]} stroke={KRP.ink} strokeWidth={2.5} />
          ))}
        </g>
      ))}
      <rect x={0} y={600} width={PW} height={100} fill={C.tile} />
      {Array.from({ length: 6 }, (_, k) => <line key={k} x1={k * 110} y1={600} x2={k * 110 - 20} y2={700} stroke={KRP.grayDark} strokeWidth={3} opacity={0.5} />)}
      {/* レジ係 (カウンターの奥) */}
      <Person x={420} y={590} s={0.85} f={f} face="smile" cloth={KRP.green} clothDark="#5E9A5A" phase={7} gaze={[-6, 2]} />
      {/* カウンターとレジ */}
      <rect x={300} y={470} width={300} height={240} fill="#D9D2C4" stroke={KRP.ink} strokeWidth={5} />
      <rect x={300} y={462} width={300} height={22} fill="#B9B2A4" stroke={KRP.ink} strokeWidth={4} />
      <rect x={300} y={484} width={170} height={20} fill={KRP.ink} />
      {Array.from({ length: 5 }, (_, k) => <line key={k} x1={300 + ((k * 60 + belt) % 170)} y1={486} x2={300 + ((k * 60 + belt) % 170)} y2={502} stroke={KRP.grayDark} strokeWidth={3} />)}
      {[[340, KRP.orange], [400, KRP.yellow]].map(([bx, c], i) => <rect key={i} x={(bx as number) + (belt % 20) * 0.5} y={440} width={44} height={40} rx={6} fill={c as string} stroke={KRP.ink} strokeWidth={3} />)}
      <rect x={490} y={380} width={90} height={84} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
      <rect x={500} y={390} width={70} height={36} rx={4} fill={C.gbScreen} />
      {/* お客さん (かご) */}
      <Person x={160} y={676} s={0.86} f={f} pose={has ? "hold" : "stand"} face={has ? "smile" : "normal"} gaze={has ? [0, 6] : [8, 0]}
        cloth="#C96A4A" clothDark="#9A4E34" phase={3} />
      <g>
        <path d="M 30 640 L 110 640 L 102 696 L 38 696 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        {[0, 1, 2].map((k) => <line key={k} x1={40 + k * 24} y1={650} x2={46 + k * 22} y2={690} stroke={KRP.white} strokeWidth={3} opacity={0.6} />)}
        <rect x={48} y={616} width={20} height={28} rx={4} fill={KRP.green} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={86} cy={630} r={14} fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
      </g>
      {has && <Sumaho x={160} y={676 - 118 * 0.86 - 4} s={0.18 * ps} f={f} screen="notify" glow={0.6} />}
      <HmGbPop x={160} y={546} t={popT} />
    </g>
  );
  return (
    <Frame f={f} seed={5161}>
      {/* 机と原稿用紙 */}
      <rect x={-60} y={-60} width={2040} height={1200} fill={C.desk} />
      <g stroke={C.deskDark} strokeWidth={5} opacity={0.5}>{[60, 400, 900, 1040].map((gy) => <path key={gy} d={`M -60 ${gy} q 1000 18 2040 0`} fill="none" />)}</g>
      <rect x={14} y={58} width={1892} height={790} fill={KRP.ink} opacity={0.2} />
      <rect x={4} y={46} width={1892} height={790} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      <rect x={20} y={70} width={1860} height={740} fill="none" stroke={KRP.blue} strokeWidth={2} strokeDasharray="6 8" opacity={0.6} />
      {panel(0, p1, "数十秒", (f * 12) % 360)}
      {panel(1, p2, "数秒", (f * 12 + 120) % 360)}
      {panel(2, p3, "数十秒", (f * 12 + 240) % 360)}
      {/* 原稿の上の鉛筆と消しゴム */}
      <g transform="translate(1700 900) rotate(-12)">
        <rect x={-140} y={-12} width={260} height={24} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        <path d="M 120 -12 L 154 0 L 120 12 Z" fill={KRP.cream} stroke={KRP.ink} strokeWidth={3} />
      </g>
      <rect x={180} y={880} width={110} height={56} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} transform="rotate(8 235 908)" />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  hm_150: (f) => <Hm150 f={f} />,
  hm_151: (f) => <Hm151 f={f} />,
  hm_152: (f) => <Hm152 f={f} />,
  hm_153: (f) => <Hm153 f={f} />,
  hm_154: (f) => <Hm154 f={f} />,
  hm_155: (f) => <Hm155 f={f} />,
  hm_156: (f) => <Hm156 f={f} />,
  hm_157: (f) => <Hm157 f={f} />,
  hm_158: (f) => <Hm158 f={f} />,
  hm_159: (f) => <Hm159 f={f} />,
  hm_160: (f) => <Hm160 f={f} />,
  hm_161: (f) => <Hm161 f={f} />,
};

export const HM_GB_MOTIFS: string[] = [
  "hm_150", // #150
  "hm_151", // #151
  "hm_152", // #152
  "hm_153", // #153
  "hm_154", // #154
  "hm_155", // #155
  "hm_156", // #156
  "hm_157", // #157
  "hm_158", // #158
  "hm_159", // #159
  "hm_160", // #160
  "hm_161", // #161
];

export const himaGbScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
