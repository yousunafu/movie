// 「名前を奪われる」のは、なぜあんなに怖いのか: 文#186〜#193 (8文)
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
  // 配信部屋
  roomWall: "#4A4560",
  foam: "#5A5275",
  foamDark: "#433C5A",
  deskTop: "#7A5A3E",
  deskFront: "#5E4430",
  bezel: "#2A2A33",
  screenGlow: "#B9D3F0",
  vRoom: "#EDE2F7",
  vDot: "#DCC9F0",
  vFloor: "#CDB8E8",
  ringLight: "#FFF6DC",
  chair: "#2E2B3A",
  chairStripe: "#C2566A",
  hoodie: "#7A6E9E",
  hoodieDark: "#5E5480",
  headset: "#3A3A44",
  micBody: "#55555F",
  keyGlow: "#9FE0D8",
  // アバター (シンプル・特定の人に似せない)
  avSkin: "#FBE6D6",
  avHair: "#B9A3E0",
  avHairDark: "#8E77C2",
  avRibbon: "#E86A8A",
  avEye: "#3A3550",
  avCollar: "#7FC4D8",
  cheek: "#F2A0A8",
  // 会社
  navy: "#2F3B5C",
  navyDark: "#222B44",
  offWall: "#DCE3E8",
  offWallDark: "#C3CDD5",
  paperW: "#FFFDF6",
  paperLine: "#C9C1B0",
  clipBoard: "#B08A5A",
  clipMetal: "#B9C0C6",
  bldg: "#9FB3C8",
  bldgDark: "#7D93AA",
  bldgWin: "#E8F1F8",
  hanko: "#E3C79A",
  // 本人 (舞台衣装の金)
  gold: "#D9A520",
  goldDark: "#B08515",
  // 作業場
  plankA: "#8B6440",
  plankB: "#7E5A39",
  plankC: "#966D47",
  plankSeam: "#5E4128",
  beam: "#5A3E26",
  benchTop: "#C49460",
  benchTopLight: "#D6A974",
  benchFront: "#9A6C42",
  benchFrontLight: "#A87A4E",
  standWood: "#B5834F",
  lampGlow: "#FFE6A8",
  night: "#1E1A2A",
  narr: "#6F8FB0",
  narrDark: "#55728F",
  book1: "#B5503F",
  book2: "#5E8A6A",
  book3: "#D9B96A",
  book4: "#6A6F9E",
  shadow: "#1A1512",
  libCard: "#F3E6C4",
} as const;
void W; void H; void FONT;
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

// カメラ: 注目点 (fx,fy) を画面の中心に置いて s 倍
const camT = (s: number, fx: number, fy: number) => `translate(960 540) scale(${s}) translate(${-fx} ${-fy})`;
// Ito と同じ2次ベジェ上の点 (sagEff = Ito 内部のたるみ量)
const quadPt = (a: [number, number], b: [number, number], sagEff: number, u: number): [number, number] => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 + sagEff;
  return [
    (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0],
    (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1],
  ];
};
const quadD = (a: [number, number], b: [number, number], sagEff: number) =>
  `M ${a[0]} ${a[1]} Q ${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + sagEff} ${b[0]} ${b[1]}`;
// 札を回したときの結び目の位置
const rotPt = (cx: number, cy: number, p: [number, number], deg: number): [number, number] => {
  const r = (deg * Math.PI) / 180;
  const dx = p[0] - cx, dy = p[1] - cy;
  return [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)];
};

// ハート (配信のコメント)
const NH1dHeart: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number }> = ({ x, y, s = 1, color = C.avRibbon, o = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={o}
    d="M 0 14 C -26 -4 -22 -26 -8 -26 C -2 -26 0 -20 0 -16 C 0 -20 2 -26 8 -26 C 22 -26 26 -4 0 14 Z"
    fill={color} stroke={KRP.ink} strokeWidth={3.5} />
);

// 防音の吸音材 (くさび形の凹凸。升ごとに向きが交互)
const NH1dFoam: React.FC<{ x0: number; y0: number; cols: number; rows: number; size?: number }> = ({ x0, y0, cols, rows, size = 118 }) => (
  <g>
    {Array.from({ length: rows * cols }, (_, k) => {
      const i = k % cols, j = Math.floor(k / cols);
      const x = x0 + i * size, y = y0 + j * size;
      const vert = (i + j) % 2 === 0;
      return (
        <g key={k}>
          <rect x={x} y={y} width={size} height={size} fill={C.foam} stroke={C.foamDark} strokeWidth={4} />
          {[0.25, 0.5, 0.75].map((q) => vert
            ? <line key={q} x1={x + size * q} y1={y + 8} x2={x + size * q} y2={y + size - 8} stroke={C.foamDark} strokeWidth={5} opacity={0.8} />
            : <line key={q} x1={x + 8} y1={y + size * q} x2={x + size - 8} y2={y + size * q} stroke={C.foamDark} strokeWidth={5} opacity={0.8} />)}
        </g>
      );
    })}
  </g>
);

// 画面の中のアバター (丸い頭・大きな目・リボン。特定の人に似せない)。x,y は頭の中心
const NH1dAvatar: React.FC<{
  x: number; y: number; s?: number; f: number; wave?: number; gaze?: [number, number]; mouth?: "smile" | "o" | "open"; hands?: "wave" | "clasp";
}> = ({ x, y, s = 1, f, wave = 0, gaze = [0, 0], mouth = "smile", hands = "wave" }) => {
  const blink = f % 61 > 56;
  const bob = Math.sin(f / 10) * 4;
  const [gx, gy] = gaze;
  const armRot = -30 + wave * 24;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* 後ろ髪 */}
      <circle cx={0} cy={6} r={114} fill={C.avHair} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-118} y={0} width={60} height={150} rx={30} fill={C.avHair} stroke={KRP.ink} strokeWidth={6} />
      <rect x={58} y={0} width={60} height={150} rx={30} fill={C.avHair} stroke={KRP.ink} strokeWidth={6} />
      {/* 体 (セーラー風の襟) */}
      <path d="M -120 270 Q -128 120 -40 96 L 40 96 Q 128 120 120 270 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      <path d="M -40 96 L 0 150 L 40 96 L 88 112 L 30 190 L 0 160 L -30 190 L -88 112 Z" fill={C.avCollar} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -14 160 L 0 186 L 14 160 Z" fill={C.avRibbon} stroke={KRP.ink} strokeWidth={4} />
      {/* 手 */}
      {hands === "wave" ? (
        <g transform={`rotate(${armRot} 96 150)`}>
          <rect x={84} y={20} width={26} height={134} rx={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={97} cy={14} r={26} fill={C.avSkin} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 84 -6 L 80 -22 M 97 -10 L 97 -28 M 110 -6 L 115 -22" stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx={-22} cy={212} r={24} fill={C.avSkin} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={22} cy={212} r={24} fill={C.avSkin} stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      {/* 顔 */}
      <circle cx={0} cy={0} r={100} fill={C.avSkin} stroke={KRP.ink} strokeWidth={6} />
      {/* 前髪 */}
      <path d="M -102 -4 Q -108 -112 0 -114 Q 108 -112 102 -4 Q 74 -50 44 -30 Q 22 -62 0 -36 Q -26 -64 -46 -30 Q -72 -52 -102 -4 Z"
        fill={C.avHair} stroke={KRP.ink} strokeWidth={5} />
      <path d="M -60 -88 Q -20 -102 30 -94" stroke={KRP.white} strokeWidth={6} opacity={0.5} fill="none" strokeLinecap="round" />
      {/* 目 */}
      {blink ? (
        <g stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" fill="none">
          <path d="M -56 18 Q -38 28 -20 18" /><path d="M 20 18 Q 38 28 56 18" />
        </g>
      ) : (
        <g>
          {[-38, 38].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex + gx} cy={16 + gy} rx={20} ry={28} fill={C.avEye} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={ex + gx - 6} cy={4 + gy} r={8} fill={KRP.white} />
              <circle cx={ex + gx + 6} cy={30 + gy} r={4} fill={KRP.white} opacity={0.8} />
            </g>
          ))}
        </g>
      )}
      <ellipse cx={-62} cy={50} rx={16} ry={9} fill={C.cheek} opacity={0.7} />
      <ellipse cx={62} cy={50} rx={16} ry={9} fill={C.cheek} opacity={0.7} />
      {mouth === "smile" && <path d="M -16 58 Q 0 72 16 58" fill="none" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />}
      {mouth === "o" && <ellipse cx={0} cy={64} rx={9} ry={11} fill={KRP.ink} />}
      {mouth === "open" && <path d="M -18 56 Q 0 84 18 56 Z" fill={KRP.ink} />}
      {/* リボン */}
      <g transform={`translate(62 -92) rotate(${18 + Math.sin(f / 9) * 4})`}>
        <path d="M 0 0 L -44 -26 L -44 26 Z" fill={C.avRibbon} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 0 0 L 44 -26 L 44 26 Z" fill={C.avRibbon} stroke={KRP.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={0} cy={0} r={12} fill={C.avRibbon} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </g>
  );
};

// 後ろ姿の人 (共通部品 Person の上に後頭部と背中を重ねて顔を隠す)
//   arms: 自分で描く両腕の手の位置 (この部品の中の座標。肩は (±67,-140))。無ければ腕は下ろしたまま
const NH1dBack: React.FC<{
  x: number; y: number; s?: number; cloth: string; clothDark?: string; f: number; phase?: number;
  hair?: string; headset?: boolean; lean?: number; arms?: [[number, number], [number, number]];
}> = ({ x, y, s = 1, cloth, clothDark, f, phase = 0, hair = KRP.ink, headset = false, lean = 0, arms }) => {
  const bob = Math.sin((f + phase * 17) / 13) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      <Person x={0} y={0} s={1} cloth={cloth} clothDark={clothDark ?? cloth} f={f} still pose={arms ? "hold" : "stand"} hair="none" />
      {arms && arms.map(([hx, hy], i) => {
        const sx = i === 0 ? -64 : 64;
        return (
          <g key={i}>
            <line x1={sx} y1={-140} x2={hx} y2={hy} stroke={KRP.ink} strokeWidth={31} strokeLinecap="round" />
            <line x1={sx} y1={-140} x2={hx} y2={hy} stroke={cloth} strokeWidth={22} strokeLinecap="round" />
            <circle cx={hx} cy={hy} r={13} fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        );
      })}
      {/* 背中 (前に回した腕と胸ポケットを隠す) */}
      <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      <line x1={0} y1={-146} x2={0} y2={-62} stroke={clothDark ?? KRP.ink} strokeWidth={4} opacity={0.5} />
      <path d="M -32 -160 Q 0 -144 32 -160" fill="none" stroke={KRP.ink} strokeWidth={4} />
      {/* 耳 */}
      <ellipse cx={-64} cy={-222} rx={11} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      <ellipse cx={64} cy={-222} rx={11} ry={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      {/* 後頭部 (髪で塗る) */}
      <circle cx={0} cy={-228} r={66} fill={hair} stroke={KRP.ink} strokeWidth={5.5} />
      <path d="M -40 -270 Q 0 -290 40 -270" stroke={KRP.white} strokeWidth={5} opacity={0.22} fill="none" strokeLinecap="round" />
      <path d="M -46 -176 Q -20 -168 0 -172 Q 22 -168 46 -176" stroke={KRP.white} strokeWidth={3} opacity={0.18} fill="none" />
      {headset && (
        <g>
          <path d="M -70 -234 Q -76 -314 0 -316 Q 76 -314 70 -234" fill="none" stroke={KRP.ink} strokeWidth={17} strokeLinecap="round" />
          <path d="M -70 -234 Q -76 -314 0 -316 Q 76 -314 70 -234" fill="none" stroke={C.headset} strokeWidth={9} strokeLinecap="round" />
          <rect x={-90} y={-262} width={30} height={66} rx={13} fill={C.headset} stroke={KRP.ink} strokeWidth={5} />
          <rect x={60} y={-262} width={30} height={66} rx={13} fill={C.headset} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={-75} cy={-229} r={6} fill={C.chairStripe} opacity={(f % 40) < 24 ? 1 : 0.4} />
        </g>
      )}
    </g>
  );
};

// ===== 作業場 (#189〜#193 は同じ「からくりの作業台」の続き) =====
const NH1dWall: React.FC<{ benchY: number; seed: number; night?: number }> = ({ benchY, seed, night = 0 }) => (
  <g>
    {Array.from({ length: 21 }, (_, i) => {
      const x = -240 + i * 120;
      const col = [C.plankA, C.plankB, C.plankC][Math.floor(rnd(seed, i) * 3)];
      return (
        <g key={i}>
          <rect x={x} y={-200} width={120} height={benchY + 260} fill={col} />
          <line x1={x} y1={-200} x2={x} y2={benchY} stroke={C.plankSeam} strokeWidth={4} />
          <path d={`M ${x + 30 + rnd(seed, i + 40) * 50} ${120 + rnd(seed, i + 20) * 380} q 10 34 0 70 q -8 30 4 60`} stroke={C.plankSeam} strokeWidth={3} fill="none" opacity={0.55} />
          <ellipse cx={x + 60} cy={160 + rnd(seed, i + 9) * 420} rx={10} ry={6} fill={C.plankSeam} opacity={0.5} />
        </g>
      );
    })}
    <rect x={-240} y={-200} width={2400} height={236} fill={C.beam} />
    <line x1={-240} y1={36} x2={2160} y2={36} stroke={KRP.ink} strokeWidth={6} />
    {night > 0 && <rect x={-240} y={-200} width={2400} height={benchY + 260} fill={C.night} opacity={night} />}
  </g>
);

const NH1dBench: React.FC<{ y: number; seed: number; night?: number }> = ({ y, seed, night = 0 }) => (
  <g>
    <rect x={-240} y={y} width={2400} height={50} fill={C.benchTop} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-240} y={y + 6} width={2400} height={10} fill={C.benchTopLight} opacity={0.7} />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={`M ${-200 + i * 380} ${y + 28 + rnd(seed, i) * 10} q 120 ${rnd(seed, i + 5) * 8 - 4} 260 0`} stroke={C.benchFront} strokeWidth={3} fill="none" opacity={0.6} />
    ))}
    <rect x={-240} y={y + 50} width={2400} height={700} fill={C.benchFront} stroke={KRP.ink} strokeWidth={6} />
    <rect x={-240} y={y + 50} width={2400} height={16} fill={KRP.ink} opacity={0.2} />
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <rect x={-120 + i * 380} y={y + 92} width={320} height={160} rx={10} fill={C.benchFrontLight} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-120 + i * 380 + 120} y={y + 160} width={80} height={20} rx={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
      </g>
    ))}
    {night > 0 && <rect x={-240} y={y} width={2400} height={700} fill={C.night} opacity={night} />}
  </g>
);

// 名札を吊るす木の台 (鳥居形)。hookY は名札の吊り輪の上端
const NH1dStand: React.FC<{ x1: number; x2: number; top: number; base: number; hookX: number; hookY: number }> = ({ x1, x2, top, base, hookX, hookY }) => (
  <g>
    {[x1, x2].map((px) => (
      <g key={px}>
        <rect x={px - 17} y={top} width={34} height={base - top} fill={C.standWood} stroke={KRP.ink} strokeWidth={6} />
        <line x1={px - 4} y1={top + 30} x2={px - 4} y2={base - 20} stroke={NP.woodDark} strokeWidth={3} opacity={0.6} />
        <rect x={px - 48} y={base - 26} width={96} height={30} rx={6} fill={C.standWood} stroke={KRP.ink} strokeWidth={6} />
      </g>
    ))}
    <rect x={x1 - 60} y={top - 16} width={x2 - x1 + 120} height={36} rx={10} fill={C.standWood} stroke={KRP.ink} strokeWidth={6} />
    <rect x={x1 - 60} y={top - 16} width={x2 - x1 + 120} height={10} rx={5} fill={NP.wood} opacity={0.6} />
    <line x1={hookX} y1={top + 20} x2={hookX} y2={hookY} stroke={KRP.ink} strokeWidth={6} />
    <circle cx={hookX} cy={top + 22} r={9} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
  </g>
);

// 木彫りの耳 (耳の糸の行き先)。x,y は耳の中心
const NH1dEar: React.FC<{ x: number; y: number; s?: number; base: number; glow?: number }> = ({ x, y, s = 1, base, glow = 0 }) => (
  <g>
    <rect x={x - 12} y={y + 100 * s} width={24} height={base - y - 100 * s} fill={C.standWood} stroke={KRP.ink} strokeWidth={5} />
    <rect x={x - 50} y={base - 22} width={100} height={26} rx={6} fill={C.standWood} stroke={KRP.ink} strokeWidth={5} />
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow > 0.01 && <circle cx={10} cy={0} r={150} fill={NP.glow} opacity={0.35 * glow} />}
      <path d="M -10 -116 C 66 -130 100 -60 84 2 C 74 46 44 62 32 92 C 22 124 -22 130 -38 104 C -52 80 -32 62 -42 40 C -74 0 -80 -100 -10 -116 Z"
        fill={NP.wood} stroke={KRP.ink} strokeWidth={7} />
      <path d="M -22 -74 C 30 -90 58 -42 48 0 C 40 26 16 32 10 54" fill="none" stroke={NP.woodDark} strokeWidth={7} strokeLinecap="round" />
      <path d="M -4 -30 C 24 -36 28 4 6 18 C -10 28 -22 6 -4 -30 Z" fill={NP.woodMid} stroke={KRP.ink} strokeWidth={4} />
    </g>
  </g>
);

// 藍の表紙の名簿 (帳簿の糸の行き先)。x,y は表紙の中心
const NH1dLedger: React.FC<{ x: number; y: number; w?: number; h?: number; glow?: number }> = ({ x, y, w = 240, h = 60, glow = 0 }) => (
  <g>
    {glow > 0.01 && <ellipse cx={x} cy={y} rx={w * 0.8} ry={h * 1.6} fill={NP.glow} opacity={0.35 * glow} />}
    <rect x={x - w / 2 + 6} y={y - h / 2 + 10} width={w} height={h} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
    {[0.3, 0.55, 0.8].map((q) => <line key={q} x1={x - w / 2 + 14} y1={y - h / 2 + 10 + h * q} x2={x + w / 2} y2={y - h / 2 + 10 + h * q} stroke={C.paperLine} strokeWidth={3} />)}
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} fill={NP.chobo} stroke={KRP.ink} strokeWidth={6} />
    {[0.2, 0.5, 0.8].map((q) => <circle key={q} cx={x - w / 2 + 14} cy={y - h / 2 + h * q} r={4} fill={KRP.white} />)}
    <rect x={x - 46} y={y - h / 2 + 8} width={92} height={h - 16} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
    <text x={x} y={y + 10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(30, h * 0.5)} fill={KRP.ink}>名簿</text>
  </g>
);

// 小さな看板 (店の印だけ。字は書かない)。x,y は板の中心
const NH1dSign: React.FC<{ x: number; y: number; s?: number; base: number; f: number; glow?: number }> = ({ x, y, s = 1, base, f, glow = 0 }) => {
  const sw = Math.sin(f / 16) * 2;
  return (
    <g>
      <rect x={x + 92 * s} y={y - 110 * s} width={22} height={base - y + 110 * s} fill={C.standWood} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x + 58 * s} y={base - 22} width={90} height={26} rx={6} fill={C.standWood} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x - 110 * s} y={y - 118 * s} width={226 * s} height={20} rx={6} fill={C.standWood} stroke={KRP.ink} strokeWidth={5} />
      <g transform={`rotate(${sw} ${x} ${y - 100 * s})`}>
        <line x1={x - 70 * s} y1={y - 100 * s} x2={x - 70 * s} y2={y - 62 * s} stroke={KRP.ink} strokeWidth={4} />
        <line x1={x + 70 * s} y1={y - 100 * s} x2={x + 70 * s} y2={y - 62 * s} stroke={KRP.ink} strokeWidth={4} />
        {glow > 0.01 && <rect x={x - 130 * s} y={y - 90 * s} width={260 * s} height={190 * s} rx={30} fill={NP.glow} opacity={0.35 * glow} />}
        <rect x={x - 100 * s} y={y - 62 * s} width={200 * s} height={124 * s} rx={10} fill={C.beam} stroke={KRP.ink} strokeWidth={6} />
        <rect x={x - 86 * s} y={y - 48 * s} width={172 * s} height={96 * s} rx={6} fill="none" stroke={NP.brass} strokeWidth={4} />
        <circle cx={x} cy={y} r={34 * s} fill={NP.shinyo} stroke={KRP.ink} strokeWidth={5} />
        <path d={`M ${x} ${y - 20 * s} L ${x + 18 * s} ${y} L ${x} ${y + 20 * s} L ${x - 18 * s} ${y} Z`} fill={C.beam} />
      </g>
    </g>
  );
};

// 名札の札の影を濃くしたり、吊り輪の位置を出す小道具
const ringTop = (y: number, s: number) => y - 165 * s;

// ===================================================================
// シーン本体
// ===================================================================

// -------------------------------------------------------------------
// #186 ブイチューバーの名前も、同じです。
// 格: 並 / seed 4186
// 絵: 配信部屋 (モニター2つ・マイク・リングライト・ヘッドセットの人の後ろ姿)。モニターの中にシンプルなアバター (丸い頭・リボン) が手を振る。アバターの上に名札 (字は「○○」)
// どこ: 夜の配信部屋。吸音材の壁・机・大小2台のモニター・リングライト・アームのマイク・低い背もたれの椅子
// 演出: 椅子に座ったヘッドセットの人 (後ろ姿) が右手を振ると、画面の中のアバターも同じに手を振る。アバターの頭上に「○○」の名札がぽんと出る
// 動き: カメラがゆっくりモニターへ寄る / 手振り (人とアバターが同期) / 名札 f8〜20 / LIVE の点滅 / 右の画面でハートが昇る
const Nm186: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + 0.06 * cam;
  const fx = lerp(960, 920, cam), fy = lerp(540, 470, cam);
  const plate = seg(f, 8, 20);
  const wave = Math.sin(f / 4.5);
  const live = f % 30 < 18 ? 1 : 0.35;
  const ring = 0.5 + 0.12 * Math.sin(f / 8);
  return (
    <Frame f={f} seed={4186} bg={C.roomWall}>
      <defs>
        <clipPath id="nh1d186scr"><rect x={492} y={132} width={836} height={456} rx={6} /></clipPath>
        <clipPath id="nh1d186sub"><rect x={1418} y={228} width={384} height={274} rx={4} /></clipPath>
      </defs>
      <g transform={camT(sc, fx, fy)}>
        <rect x={-200} y={-200} width={2320} height={1000} fill={C.roomWall} />
        <NH1dFoam x0={-80} y0={-30} cols={18} rows={6} />
        <ellipse cx={910} cy={360} rx={640} ry={340} fill={C.screenGlow} opacity={0.2} />
        {/* リングライト */}
        <rect x={230} y={440} width={20} height={260} fill={C.headset} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={240} cy={320} r={200} fill={C.ringLight} opacity={0.22 * ring} />
        <circle cx={240} cy={320} r={130} fill="none" stroke={KRP.ink} strokeWidth={46} />
        <circle cx={240} cy={320} r={130} fill="none" stroke={C.ringLight} strokeWidth={32} />
        <rect x={226} y={286} width={28} height={64} rx={6} fill={C.headset} stroke={KRP.ink} strokeWidth={4} />
        {/* 机 */}
        <rect x={-200} y={680} width={2320} height={44} fill={C.deskTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-200} y={724} width={2320} height={400} fill={C.deskFront} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 560 716 L 600 690 L 900 690 L 870 716 Z" fill={C.headset} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={612 + i * 26} y={696} width={18} height={7} rx={2} fill={C.keyGlow} opacity={0.55 + 0.4 * Math.sin(f / 6 + i)} />)}
        <ellipse cx={960} cy={704} rx={22} ry={12} fill={C.headset} stroke={KRP.ink} strokeWidth={4} />
        {/* ぬいぐるみ (机の上の小物) */}
        <circle cx={400} cy={650} r={34} fill={C.avHair} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={378} cy={620} r={12} fill={C.avHair} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={422} cy={620} r={12} fill={C.avHair} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={390} cy={645} r={4} fill={KRP.ink} /><circle cx={410} cy={645} r={4} fill={KRP.ink} />
        {/* マグカップ */}
        <rect x={1500} y={624} width={60} height={64} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1560 640 q 24 0 24 18 q 0 18 -24 18" fill="none" stroke={KRP.ink} strokeWidth={5} />
        <path d={`M 1520 612 q -8 ${-14 + Math.sin(f / 7) * 4} 4 -30 M 1540 612 q 8 -16 -2 -30`} stroke={KRP.white} strokeWidth={4} opacity={0.5} fill="none" />
        {/* 大きいモニター */}
        <rect x={880} y={600} width={60} height={90} fill={C.bezel} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={910} cy={690} rx={110} ry={14} fill={C.bezel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={470} y={110} width={880} height={500} rx={18} fill={C.bezel} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#nh1d186scr)">
          <rect x={480} y={120} width={860} height={480} fill={C.vRoom} />
          {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={520 + (i % 8) * 110 + (Math.floor(i / 8) % 2) * 55} cy={170 + Math.floor(i / 8) * 110} r={14} fill={C.vDot} />)}
          <rect x={480} y={520} width={860} height={80} fill={C.vFloor} />
          {/* 仮想の部屋の窓 (星) */}
          <rect x={560} y={230} width={170} height={200} rx={12} fill={C.avHairDark} stroke={KRP.ink} strokeWidth={5} />
          <line x1={645} y1={230} x2={645} y2={430} stroke={KRP.ink} strokeWidth={4} />
          {[[600, 280], [690, 320], [620, 380]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={5 + (i === (Math.floor(f / 10) % 3) ? 3 : 0)} fill={KRP.yellow} />)}
          <rect x={1120} y={290} width={170} height={14} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={4} />
          <rect x={1140} y={250} width={34} height={40} fill={C.avCollar} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1230} cy={268} r={22} fill={C.cheek} stroke={KRP.ink} strokeWidth={4} />
          <NH1dAvatar x={910} y={390} f={f} wave={wave} mouth={f % 24 < 12 ? "open" : "smile"} />
          {/* 頭上の名札 */}
          <g transform={`translate(910 ${206 + Math.sin(f / 12) * 3}) scale(${pop(plate)})`}>
            <rect x={-130} y={-36} width={260} height={72} rx={36} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <path d="M -100 0 L -122 -14 L -122 14 Z M -100 0 L -78 -14 L -78 14 Z" fill={C.avRibbon} stroke={KRP.ink} strokeWidth={3} />
            <text x={14} y={17} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.ink}>○○</text>
          </g>
          <g transform="translate(560 164)">
            <rect x={-50} y={-20} width={112} height={40} rx={20} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={-28} cy={0} r={8} fill={KRP.white} opacity={live} />
            <text x={16} y={9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.white}>LIVE</text>
          </g>
          <path d="M 1100 132 L 1180 132 L 980 588 L 900 588 Z" fill={KRP.white} opacity={0.07} />
        </g>
        {/* 右の小さいモニター (コメント欄) */}
        <rect x={1595} y={510} width={40} height={180} fill={C.bezel} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={1615} cy={690} rx={80} ry={12} fill={C.bezel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1400} y={210} width={420} height={310} rx={14} fill={C.bezel} stroke={KRP.ink} strokeWidth={6} />
        <g clipPath="url(#nh1d186sub)">
          <rect x={1410} y={220} width={400} height={290} fill={KRP.white} />
          {Array.from({ length: 8 }, (_, i) => {
            const yy = 250 + i * 42 - ((f * 1.2) % 42);
            return (
              <g key={i}>
                <circle cx={1440} cy={yy} r={12} fill={[KRP.orange, KRP.green, KRP.blue, C.avRibbon][i % 4]} stroke={KRP.ink} strokeWidth={3} />
                <rect x={1462} y={yy - 8} width={90 + rnd(4186, i) * 160} height={16} rx={8} fill={KRP.gray} opacity={0.7} />
              </g>
            );
          })}
          {Array.from({ length: 5 }, (_, i) => {
            const p = ((f * 3 + i * 46) % 230) / 230;
            return <NH1dHeart key={i} x={1740 + Math.sin(f / 6 + i) * 18} y={490 - p * 250} s={0.9 + i * 0.08} o={1 - p} color={i % 2 ? C.avRibbon : KRP.orange} />;
          })}
        </g>
        {/* マイク (アーム) */}
        <path d="M 1390 690 L 1360 520 L 1220 470" fill="none" stroke={KRP.ink} strokeWidth={18} strokeLinejoin="round" strokeLinecap="round" />
        <path d="M 1390 690 L 1360 520 L 1220 470" fill="none" stroke={C.micBody} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
        <rect x={1370} y={670} width={44} height={28} rx={4} fill={C.headset} stroke={KRP.ink} strokeWidth={4} />
        <g transform="rotate(-70 1205 470)">
          <rect x={1180} y={420} width={50} height={110} rx={25} fill={C.micBody} stroke={KRP.ink} strokeWidth={5} />
          {[440, 460, 480].map((ly) => <line key={ly} x1={1186} y1={ly} x2={1224} y2={ly} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />)}
        </g>
        <circle cx={1160} cy={452} r={40} fill={C.foamDark} opacity={0.55} stroke={KRP.ink} strokeWidth={4} />
        {/* 配信する人 (後ろ姿・ヘッドセット)。右手を振る */}
        <NH1dBack x={1180} y={960} s={1.45} cloth={C.hoodie} clothDark={C.hoodieDark} f={f} headset
          arms={[[-78, -70], [128 + wave * 14, -262 - Math.abs(wave) * 6]]} />
        {/* 低い背もたれの椅子 */}
        <rect x={1046} y={770} width={268} height={350} rx={44} fill={C.chair} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1070} y={790} width={22} height={300} rx={11} fill={C.chairStripe} />
        <rect x={1268} y={790} width={22} height={300} rx={11} fill={C.chairStripe} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #187 企業に所属する場合、名前や姿は、会社が権利を持つ契約が多いとされます。
// 格: 山 / seed 4187
// 絵: モニターの中のアバターと名札に、細い糸が会社のビル (ミニチュア) へつながっている。契約書の紙が f で開き、「名前」「姿」の欄に会社の印。札「〜とされる」(小さく)
// どこ: 事務所の机の上。左にアバターのモニター、右に会社のビルの模型 (屋上にアンテナ)、真ん中にクリップボードの契約書
// 演出: 名札とアバターから紺の細い糸がビルの屋上へ伸びる。三つ折りの契約書が開き、紺の袖の手が「名前」「姿」の欄に会社の印を押す。アバターは目を丸くして見る
// 動き: カメラが契約書の寄りから引く / 糸 f0〜16 / 契約書が開く f6〜22 / 印 f26・f34 / 札 f36〜42
const Nm187: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 30));
  const sc = lerp(1.12, 1, cam);
  const fx = lerp(1080, 960, cam), fy = lerp(470, 540, cam);
  const thr = easeOut(seg(f, 0, 16));
  const k = 0.34 + 0.66 * easeOut(seg(f, 6, 22));
  const s1 = seg(f, 26, 30), s2 = seg(f, 34, 38);
  // 印を押す手の動き
  const keys: [number, number, number][] = [[0, 1470, 170], [20, 1470, 170], [26, 1240, 430], [29, 1250, 370], [34, 1240, 530], [42, 1340, 330]];
  let hx = keys[0][1], hy = keys[0][2];
  for (let i = 1; i < keys.length; i++) {
    if (f >= keys[i - 1][0]) {
      const t = easeInOut(clamp01((f - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
      hx = lerp(keys[i - 1][1], keys[i][1], t); hy = lerp(keys[i - 1][2], keys[i][2], t);
    }
  }
  const emblem = (x: number, y: number, r: number, col: string) => (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={col} strokeWidth={r * 0.14} />
      <path d={`M ${x} ${y - r * 0.6} L ${x + r * 0.5} ${y} L ${x} ${y + r * 0.6} L ${x - r * 0.5} ${y} Z`} fill={col} />
      <circle cx={x} cy={y} r={r * 0.16} fill={col === KRP.red ? C.paperW : C.bldgWin} />
    </g>
  );
  const seal = (x: number, y: number, t: number) => t > 0 && (
    <g transform={`translate(${x} ${y}) scale(${pop(t)}) rotate(-8)`} opacity={0.9}>
      <circle r={52} fill={KRP.red} opacity={0.12 * (1 - t) + 0.05} />
      {emblem(0, 0, 38, KRP.red)}
    </g>
  );
  return (
    <Frame f={f} seed={4187} bg={C.offWall}>
      <defs><clipPath id="nh1d187scr"><rect x={108} y={138} width={594} height={404} rx={6} /></clipPath></defs>
      <g transform={camT(sc, fx, fy)}>
        {/* 事務所の壁 */}
        <rect x={-200} y={-200} width={2320} height={1000} fill={C.offWall} />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-100 + i * 170} y1={-200} x2={-100 + i * 170} y2={690} stroke={C.offWallDark} strokeWidth={4} />)}
        <rect x={-200} y={600} width={2320} height={90} fill={C.offWallDark} />
        <line x1={-200} y1={600} x2={2120} y2={600} stroke={KRP.ink} strokeWidth={4} opacity={0.4} />
        {/* 壁の時計 */}
        <circle cx={1280} cy={110} r={50} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1280} y1={110} x2={1280} y2={78} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={1280} y1={110} x2={1280 + Math.cos(f / 8) * 34} y2={110 + Math.sin(f / 8) * 34} stroke={KRP.red} strokeWidth={3} strokeLinecap="round" />
        {/* 机 */}
        <rect x={-200} y={690} width={2320} height={44} fill={C.deskTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-200} y={734} width={2320} height={400} fill={C.deskFront} stroke={KRP.ink} strokeWidth={6} />
        {/* モニターとアバター */}
        <rect x={380} y={560} width={50} height={130} fill={C.bezel} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={405} cy={690} rx={100} ry={13} fill={C.bezel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={90} y={120} width={630} height={440} rx={16} fill={C.bezel} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#nh1d187scr)">
          <rect x={100} y={130} width={610} height={420} fill={C.vRoom} />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={140 + (i % 6) * 110} cy={180 + Math.floor(i / 6) * 120} r={12} fill={C.vDot} />)}
          <rect x={100} y={490} width={610} height={60} fill={C.vFloor} />
          <NH1dAvatar x={405} y={380} s={0.8} f={f} hands="clasp" gaze={[8, 2]} mouth={f > 27 ? "o" : "smile"} />
          <g transform="translate(405 220)">
            <rect x={-100} y={-30} width={200} height={60} rx={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <text x={0} y={15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.ink}>○○</text>
          </g>
        </g>
        {/* 会社のビルの模型 */}
        <rect x={1460} y={668} width={340} height={26} rx={6} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1505} y={260} width={250} height={410} fill={C.bldg} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1570} y={190} width={120} height={72} fill={C.bldgDark} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1630} y1={190} x2={1630} y2={124} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={1630} cy={120} r={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} opacity={f % 20 < 12 ? 1 : 0.5} />
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={1525 + (i % 4) * 56} y={290 + Math.floor(i / 4) * 52} width={40} height={34} fill={C.bldgWin} stroke={KRP.ink} strokeWidth={3}
            opacity={rnd(4187, i) > 0.8 ? 0.6 : 1} />
        ))}
        <rect x={1600} y={606} width={60} height={64} fill={C.bldgDark} stroke={KRP.ink} strokeWidth={5} />
        <g transform="translate(1630 228)">
          <circle r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {emblem(0, 0, 20, C.navy)}
        </g>
        {/* ペン立て・スマホ */}
        <rect x={1340} y={620} width={56} height={70} rx={6} fill={C.navy} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1356} y1={620} x2={1346} y2={570} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1378} y1={620} x2={1392} y2={580} stroke={KRP.red} strokeWidth={6} />
        <rect x={150} y={700} width={110} height={20} rx={6} fill={C.headset} stroke={KRP.ink} strokeWidth={4} />
        {/* 契約書 (クリップボード) */}
        <g transform="rotate(-2 1080 470)">
          <rect x={790} y={228} width={580} height={494} rx={16} fill={C.clipBoard} stroke={KRP.ink} strokeWidth={7} />
          <g transform={`translate(0 262) scale(1 ${k}) translate(0 -262)`}>
            <rect x={815} y={262} width={530} height={440} rx={4} fill={C.paperW} stroke={KRP.ink} strokeWidth={5} />
            <text x={1080} y={326} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.ink}>契約書</text>
            <line x1={860} y1={346} x2={1300} y2={346} stroke={KRP.ink} strokeWidth={4} />
            {[["名前", 420], ["姿", 520]].map(([lb, yy]) => (
              <g key={lb as string}>
                <rect x={850} y={(yy as number) - 36} width={130} height={72} rx={6} fill={C.offWall} stroke={KRP.ink} strokeWidth={4} />
                <text x={915} y={(yy as number) + 13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>{lb}</text>
                <rect x={990} y={(yy as number) - 36} width={320} height={72} rx={6} fill="none" stroke={KRP.ink} strokeWidth={4} />
                <line x1={1010} y1={(yy as number) + 4} x2={1170} y2={(yy as number) + 4} stroke={C.paperLine} strokeWidth={5} />
              </g>
            ))}
            {[600, 630, 660].map((yy, i) => <line key={yy} x1={860} y1={yy} x2={1300 - i * 90} y2={yy} stroke={C.paperLine} strokeWidth={5} />)}
            {k < 0.98 && [408, 555].map((yy) => <line key={yy} x1={815} y1={yy} x2={1345} y2={yy} stroke={KRP.grayDark} strokeWidth={3} opacity={1 - k} />)}
            {seal(1240, 420, s1)}
            {seal(1240, 520, s2)}
          </g>
          <rect x={1010} y={212} width={140} height={44} rx={10} fill={C.clipMetal} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={1080} cy={234} r={9} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 名札とアバターからビルへ伸びる細い糸 */}
        {[["M 405 192 Q 1000 -80 1630 124", 0], ["M 470 460 Q 1060 60 1630 124", 1]].map(([d, i]) => (
          <g key={i as number}>
            <path d={d as string} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - thr} fill="none" stroke={KRP.ink} strokeWidth={8} strokeLinecap="round" />
            <path d={d as string} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - thr} fill="none" stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
        <circle cx={405} cy={192} r={8} fill={C.navy} stroke={KRP.ink} strokeWidth={3} />
        <circle cx={470} cy={460} r={8} fill={C.navy} stroke={KRP.ink} strokeWidth={3} opacity={thr > 0.05 ? 1 : 0} />
        {/* 印を押す手 (紺の袖) */}
        <g transform={`translate(${hx} ${hy})`}>
          <line x1={20} y1={-120} x2={420} y2={-760} stroke={KRP.ink} strokeWidth={82} strokeLinecap="round" />
          <line x1={20} y1={-120} x2={420} y2={-760} stroke={C.navy} strokeWidth={70} strokeLinecap="round" />
          <line x1={14} y1={-112} x2={34} y2={-144} stroke={KRP.ink} strokeWidth={76} />
          <line x1={14} y1={-112} x2={34} y2={-144} stroke={KRP.white} strokeWidth={66} />
          <rect x={-18} y={-88} width={36} height={88} rx={6} fill={C.hanko} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-18} y={-12} width={36} height={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <circle cx={0} cy={-104} r={34} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <path d="M -22 -112 Q -8 -100 6 -112 M -18 -96 Q -4 -86 12 -96" fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        </g>
        <TagPlate x={1080} y={790} text="〜とされる" size={28} t={seg(f, 36, 42)} rot={-2} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #188 演じる人は、その名前を借りて、活動しているのです。
// 格: 並 / seed 4188
// 絵: 演じる人の後ろ姿が、アバターの名札を**両手で借りるように**受け取り、モニターの前に掛ける (f)。図書館の貸出カードのような小さな札が名札にぶら下がる (比喩)
// どこ: #186 と同じ配信部屋の別の角度 (吸音材と棚の壁)。立ち上がった演じる人の背中ごしにモニター
// 演出: 名札が右上から紺の細い糸につながったまま降りてきて、両手で受け取る → モニターの下の金具に掛ける → 貸出カードがぶら下がって揺れる。糸は持ち主の方へつながったまま (=借り物)
// 動き: 名札が降りる f0〜18 / 掛ける f18〜30 / 手を離して右へ一歩下がる f30〜42 / 貸出カード f28〜34 で出て揺れる / アバターが見下ろしてにっこり / カメラが名札へ寄る
const Nm188: React.FC<{ f: number }> = ({ f }) => {
  const cam = easeInOut(seg(f, 0, 42));
  const sc = 1 + 0.05 * cam;
  const d1 = easeOut(seg(f, 0, 18));
  const d2 = easeInOut(seg(f, 18, 30));
  const tx = lerp(1420, 850, d1);
  const ty = lerp(-90, 640, d1) - 15 * d2;
  const tr = lerp(-14, 0, d1) + Math.sin(f / 11) * 1.2;
  const hooked = f >= 28;
  const card = seg(f, 28, 34);
  const swing = Math.sin((f - 28) / 5) * 10 * Math.exp(-Math.max(0, f - 34) / 30);
  // 掛け終えたら一歩右へ下がって、掛けた名札を見せる
  const lx = lerp(850, 1260, easeInOut(seg(f, 30, 42))), ly = 1070, ls = 1.45;
  const hand = (gx: number, gy: number): [number, number] => [(gx - lx) / ls, (gy - ly) / ls];
  const reach = d1 > 0.85 ? 1 : 0;
  const hL = reach ? hand(tx - 118, ty + 32) : hand(740, 640);
  const hR = reach ? hand(tx + 118, ty + 32) : hand(960, 640);
  const armsUp = f < 30;
  return (
    <Frame f={f} seed={4188} bg={C.roomWall}>
      <defs><clipPath id="nh1d188scr"><rect x={502} y={112} width={696} height={400} rx={6} /></clipPath></defs>
      <g transform={camT(sc, lerp(960, 880, cam), lerp(540, 560, cam))}>
        <rect x={-200} y={-200} width={2320} height={1000} fill={C.roomWall} />
        <NH1dFoam x0={-120} y0={-20} cols={4} rows={7} />
        {/* 右の壁: 棚と額 */}
        <rect x={1420} y={300} width={440} height={18} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1420} y={520} width={440} height={18} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={5} />
        {[C.book1, C.book2, C.book3, C.book4, C.avCollar, C.book1].map((c, i) => (
          <rect key={i} x={1440 + i * 44} y={210 + (i % 3) * 10} width={36} height={90 - (i % 3) * 10} fill={c} stroke={KRP.ink} strokeWidth={4} />
        ))}
        <rect x={1730} y={240} width={70} height={60} rx={6} fill={C.avHair} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={1500} cy={486} r={32} fill={C.cheek} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1580} y={440} width={120} height={80} rx={8} fill={C.chair} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1460} y={60} width={200} height={130} rx={6} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <path d="M 1560 84 L 1574 116 L 1608 118 L 1582 138 L 1592 170 L 1560 150 L 1528 170 L 1538 138 L 1512 118 L 1546 116 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} />
        {/* 机 */}
        <rect x={-200} y={740} width={2320} height={44} fill={C.deskTop} stroke={KRP.ink} strokeWidth={6} />
        <rect x={-200} y={784} width={2320} height={400} fill={C.deskFront} stroke={KRP.ink} strokeWidth={6} />
        <rect x={1180} y={706} width={60} height={36} rx={6} fill={C.headset} stroke={KRP.ink} strokeWidth={4} />
        {/* モニター */}
        <rect x={820} y={540} width={60} height={200} fill={C.bezel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={480} y={90} width={740} height={446} rx={16} fill={C.bezel} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#nh1d188scr)">
          <rect x={490} y={100} width={720} height={430} fill={C.vRoom} />
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={530 + (i % 7) * 105} cy={150 + Math.floor(i / 7) * 120} r={12} fill={C.vDot} />)}
          <rect x={490} y={460} width={720} height={70} fill={C.vFloor} />
          <NH1dAvatar x={850} y={300} s={0.82} f={f} hands="clasp" gaze={[0, 8]} mouth={hooked ? "open" : "smile"} />
          {hooked && [0, 1, 2].map((i) => <NH1dHeart key={i} x={700 + i * 150} y={200 - seg(f, 30 + i * 3, 42) * 60} s={0.9} o={seg(f, 30 + i * 3, 34 + i * 3)} />)}
        </g>
        {/* 掛ける金具 */}
        <path d="M 838 536 L 838 552 Q 850 566 862 552 L 862 536" fill="none" stroke={NP.brassDark} strokeWidth={8} />
        {/* 持ち主へつながる紺の糸 (借り物のしるし) */}
        <path d={`M ${tx + 130} ${ty - 40} Q ${lerp(tx, 1900, 0.5) + 80} ${ty - 160} 1960 -60`} fill="none" stroke={KRP.ink} strokeWidth={8} />
        <path d={`M ${tx + 130} ${ty - 40} Q ${lerp(tx, 1900, 0.5) + 80} ${ty - 160} 1960 -60`} fill="none" stroke={C.navy} strokeWidth={4} />
        {/* 名札 */}
        <g transform={`translate(${tx} ${ty}) rotate(${tr})`}>
          {hooked && <path d="M -96 -52 L -12 -94 M 96 -52 L 12 -94" stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" />}
          <rect x={-140} y={-52} width={280} height={104} rx={18} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
          <rect x={-140} y={-52} width={280} height={22} rx={11} fill={C.avHair} opacity={0.7} />
          <path d="M -100 6 L -124 -10 L -124 22 Z M -100 6 L -76 -10 L -76 22 Z" fill={C.avRibbon} stroke={KRP.ink} strokeWidth={3} />
          <text x={20} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={KRP.ink}>○○</text>
          <circle cx={130} cy={-40} r={8} fill={NP.brass} stroke={KRP.ink} strokeWidth={3} />
          {/* 貸出カード */}
          {card > 0 && (
            <g transform={`translate(146 -10) rotate(${swing}) scale(${pop(card)})`}>
              <line x1={0} y1={0} x2={0} y2={26} stroke={KRP.ink} strokeWidth={4} />
              <rect x={-2} y={26} width={100} height={128} rx={6} fill={C.libCard} stroke={KRP.ink} strokeWidth={5} />
              <rect x={-2} y={26} width={100} height={30} rx={6} fill={C.book2} stroke={KRP.ink} strokeWidth={4} />
              <text x={48} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={KRP.white}>貸出</text>
              {[78, 104, 130].map((yy, i) => (
                <g key={yy}>
                  <line x1={8} y1={yy} x2={88} y2={yy} stroke={C.paperLine} strokeWidth={3} />
                  {i < 2 && <circle cx={70} cy={yy - 10} r={8} fill="none" stroke={KRP.red} strokeWidth={3} />}
                </g>
              ))}
            </g>
          )}
        </g>
        {/* 演じる人 (後ろ姿・ヘッドセット)。両手を上げて名札を受け取る */}
        <NH1dBack x={lx} y={ly} s={ls} cloth={C.hoodie} clothDark={C.hoodieDark} f={f} headset arms={armsUp ? [hL, hR] : undefined} lean={armsUp ? 0 : -4} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #189 こうして、名前から3本目の糸が伸びました。
// 格: 山 / seed 4189
// 絵: ★**リキャップ④**。からくりの作業台の `Nafuda text="山田 花子"`。耳の糸 (朱・左) と帳簿の糸 (藍・下・錠前) はすでに結ばれている。右の結び目 (shinyo) から**金茶の糸** (`Ito kind="shinyo"`) が f6〜30 で右へ伸びる
// どこ: からくりの作業場。板壁・道具掛け・吊りランプ。作業台の上の鳥居形の台に名札が吊ってある
// 演出: 左の耳の糸 (木彫りの耳へ) と下の帳簿の糸 (名簿へ・錠前) はもう結ばれている。右の結び目がぱっと光り、金茶の糸がするすると右へ伸びる。右端の人が驚いて見る
// 動き: カメラは名札の寄りから引きながら糸の先を追う / 結び目の光 f6〜16 / 糸 f6〜30 / 糸の後ろにきらきら / 凡例の3本目が f28〜32 で塗られる
const Nm189: React.FC<{ f: number }> = ({ f }) => {
  const NX = 860, NY = 430, NS = 1.15, BY = 700;
  const cam = easeInOut(seg(f, 2, 32));
  const sc = lerp(1.2, 1, cam);
  const grow = easeOut(seg(f, 6, 30));
  const kM = nafudaKnot("mimi", NX, NY, NS);
  const kC = nafudaKnot("chobo", NX, NY, NS);
  const kS = nafudaKnot("shinyo", NX, NY, NS);
  const endS: [number, number] = [1640, 560];
  const sagS = 70 + Math.sin(f / 14) * 6;
  const burst = seg(f, 6, 16);
  const [tipX, tipY] = quadPt(kS, endS, sagS, grow);
  return (
    <Frame f={f} seed={4189} bg={C.plankA}>
      <g transform={camT(sc, lerp(900, 960, cam), lerp(450, 540, cam))}>
        <NH1dWall benchY={BY} seed={4189} />
        {/* ランプの光 */}
        <ellipse cx={860} cy={460} rx={560} ry={330} fill={C.lampGlow} opacity={0.22 + 0.03 * Math.sin(f / 7)} />
        {/* 左の棚 (歯車の瓶) */}
        <rect x={60} y={250} width={420} height={20} fill={C.standWood} stroke={KRP.ink} strokeWidth={5} />
        {[110, 220, 330, 420].map((bx, i) => (
          <g key={bx}>
            <rect x={bx - 32} y={170} width={64} height={80} rx={10} fill={KRP.blueSoft} opacity={0.7} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={bx} cy={215} r={16} fill="none" stroke={NP.brassDark} strokeWidth={7} strokeDasharray="6 5" transform={`rotate(${f * (i % 2 ? 2 : -2)} ${bx} 215)`} />
          </g>
        ))}
        {/* 右の道具掛け */}
        <rect x={1480} y={110} width={380} height={330} rx={8} fill={NP.woodMid} stroke={KRP.ink} strokeWidth={6} />
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={1505 + (i % 10) * 37} cy={135 + Math.floor(i / 10) * 80} r={5} fill={C.plankSeam} />)}
        <path d="M 1520 160 L 1520 380 L 1580 380 L 1580 330 L 1545 330 L 1545 160 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1620} y={150} width={24} height={150} rx={6} fill={C.standWood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1596} y={140} width={72} height={36} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1700 150 L 1820 150 L 1820 200 L 1700 260 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1690} y={140} width={40} height={30} rx={6} fill={C.book1} stroke={KRP.ink} strokeWidth={4} />
        {/* 吊りランプ */}
        <line x1={1180} y1={36} x2={1180} y2={90} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1130 130 Q 1180 70 1230 130 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1180} cy={136} r={16} fill={C.lampGlow} stroke={KRP.ink} strokeWidth={4} />
        {/* 右端で見ている人 (作業台の向こう) */}
        <Person x={1790} y={870} s={1.0} cloth={C.narr} clothDark={C.narrDark} f={f}
          face={f > 22 ? "surprised" : "normal"} gaze={[-7, 2]} lean={f > 22 ? -5 : 0} />
        <NH1dBench y={BY} seed={4189} />
        {/* 作業台の上の小物: かんな・のみ・削りくず・歯車 */}
        <rect x={1180} y={672} width={170} height={36} rx={8} fill={C.standWood} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1240} y={662} width={30} height={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={3} />
        <rect x={1400} y={690} width={140} height={14} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1520} y={684} width={70} height={26} rx={8} fill={C.book1} stroke={KRP.ink} strokeWidth={4} />
        {[1080, 1120, 1380].map((sx, i) => <path key={sx} d={`M ${sx} 712 q 14 -26 28 -6 q 10 14 -6 18`} fill="none" stroke={NP.woodMid} strokeWidth={5} opacity={0.9} transform={`rotate(${i * 30} ${sx} 712)`} />)}
        <g transform={`rotate(${f * 1.5} 470 662)`}>
          <circle cx={470} cy={662} r={40} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} strokeDasharray="14 7" />
          <circle cx={470} cy={662} r={12} fill={C.beam} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 名札の台と、耳・名簿 */}
        <NH1dStand x1={560} x2={1160} top={200} base={BY + 6} hookX={NX} hookY={ringTop(NY, NS)} />
        <NH1dEar x={330} y={470} base={BY + 6} />
        <NH1dLedger x={790} y={738} w={250} h={52} />
        <Ito from={kM} to={[392, 460]} kind="mimi" sag={60} f={f} />
        <Ito from={kC} to={[790, 714]} kind="chobo" sag={20} lock={1} f={f} />
        <Ito from={kS} to={endS} kind="shinyo" t={grow} sag={70} f={f} />
        {/* 伸びる糸のきらきら */}
        {grow > 0 && grow < 1 && [0.06, 0.12, 0.18].map((d, i) => {
          const [px, py] = quadPt(kS, endS, sagS, Math.max(0, grow - d));
          return <path key={i} transform={`translate(${px} ${py - 22}) scale(${0.9 - i * 0.2})`} d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill={NP.glow} stroke={KRP.ink} strokeWidth={2} />;
        })}
        {grow > 0 && grow < 1 && <circle cx={tipX} cy={tipY} r={30} fill={NP.glow} opacity={0.4} />}
        {/* 結んだ先のほつれ (まだどこにも結ばれていない) */}
        {grow >= 1 && (
          <g stroke={NP.shinyo} strokeWidth={4} strokeLinecap="round">
            <line x1={endS[0]} y1={endS[1]} x2={endS[0] + 22} y2={endS[1] + 10} />
            <line x1={endS[0]} y1={endS[1]} x2={endS[0] + 20} y2={endS[1] + 24} />
            <line x1={endS[0]} y1={endS[1]} x2={endS[0] + 8} y2={endS[1] + 30} />
          </g>
        )}
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" f={f} knots={{ mimi: 1, chobo: 1, shinyo: seg(f, 6, 12) }} />
        {burst > 0 && burst < 1 && (
          <g stroke={NP.glow} strokeWidth={7} strokeLinecap="round" opacity={1 - burst}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const r1 = 40 + burst * 30, r2 = 70 + burst * 50;
              return <line key={i} x1={kS[0] + Math.cos(a) * r1} y1={kS[1] + Math.sin(a) * r1} x2={kS[0] + Math.cos(a) * r2} y2={kS[1] + Math.sin(a) * r2} />;
            })}
          </g>
        )}
        <ItoLegend x={1230} y={240} s={0.85} lit={{ mimi: 1, chobo: 1, shinyo: seg(f, 28, 32) }} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #190 積み上げた仕事と、お客さんにつながる、信用の糸です。
// 格: 山 / seed 4190
// 絵: #189 の続き。金茶の糸の先が、作業台の右に積み上がった仕事 (本・道具・小さな看板) と、お客の人形たちの手に結ばれる。`ItoLegend lit={{ mimi:1, chobo:1, shinyo:1 }}` (3本とも塗られる)
// どこ: #189 と同じ作業台。カメラが右へ回り込み、名札は左寄りに。右側には積み上げた本・道具箱・小さな看板、その先にお客の人形たち
// 演出: 金茶の糸が真鍮の輪で枝分かれし、本の山・道具箱・看板・人形3体の手へ順に結ばれていく。結ばれた人形はばんざいしてにっこり
// 動き: カメラが右へパン / 枝の糸が f4〜38 で順に伸びる / 結ばれた先がきらっと光る / 人形の腕が上がる / 凡例は3本とも塗り
const Nm190: React.FC<{ f: number }> = ({ f }) => {
  const NX = 460, NY = 380, NS = 0.95, BY = 720;
  const cam = easeInOut(seg(f, 0, 26));
  const kM = nafudaKnot("mimi", NX, NY, NS);
  const kC = nafudaKnot("chobo", NX, NY, NS);
  const kS = nafudaKnot("shinyo", NX, NY, NS);
  const ring: [number, number] = [880, 470];
  const dolls = [
    { x: 1500, c: KRP.orange, ph: 0 },
    { x: 1650, c: KRP.green, ph: 1 },
    { x: 1800, c: KRP.blue, ph: 2 },
  ];
  const DS = 0.95;
  const targets: { to: [number, number]; a: number; b: number; sag: number }[] = [
    { to: [1070, 492], a: 4, b: 16, sag: -30 },
    { to: [1210, 616], a: 8, b: 20, sag: 30 },
    { to: [1196, 378], a: 12, b: 24, sag: -20 },
    ...dolls.map((d, i) => ({ to: [d.x - 66 * DS, BY - 160 * DS] as [number, number], a: 18 + i * 4, b: 30 + i * 4, sag: 50 })),
  ];
  return (
    <Frame f={f} seed={4190} bg={C.plankA}>
      <g transform={camT(lerp(1.06, 1, cam), lerp(760, 960, cam), lerp(480, 540, cam))}>
        <NH1dWall benchY={BY} seed={4190} />
        <ellipse cx={1100} cy={480} rx={760} ry={340} fill={C.lampGlow} opacity={0.2 + 0.03 * Math.sin(f / 7)} />
        {/* 壁の小窓 (外は夕方) */}
        <rect x={1000} y={100} width={240} height={170} rx={8} fill={KRP.orange} opacity={0.75} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1120} y1={100} x2={1120} y2={270} stroke={KRP.ink} strokeWidth={5} />
        <line x1={1000} y1={185} x2={1240} y2={185} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={1060} cy={240} r={22} fill={KRP.yellow} opacity={0.9} />
        <NH1dBench y={BY} seed={4190} />
        {/* 名札の台・名簿 */}
        <NH1dStand x1={200} x2={720} top={175} base={BY + 6} hookX={NX} hookY={ringTop(NY, NS)} />
        <NH1dLedger x={420} y={756} w={240} h={50} />
        {/* 積み上げた本 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={990 + (i % 2) * 10 - i * 4} y={BY - 46 * (i + 1)} width={160 - i * 6} height={46} rx={5}
              fill={[C.book1, C.book2, C.book3, C.book4, C.book1][i]} stroke={KRP.ink} strokeWidth={5} />
            <line x1={1004 + (i % 2) * 10 - i * 4} y1={BY - 46 * (i + 1) + 10} x2={1004 + (i % 2) * 10 - i * 4} y2={BY - 46 * i - 10} stroke={KRP.white} strokeWidth={4} opacity={0.6} />
          </g>
        ))}
        {/* 道具箱 */}
        <rect x={1150} y={638} width={130} height={84} rx={6} fill={KRP.red} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 1180 638 Q 1180 606 1215 606 Q 1250 606 1250 638" fill="none" stroke={KRP.ink} strokeWidth={8} />
        <rect x={1270} y={590} width={18} height={110} rx={4} fill={C.standWood} stroke={KRP.ink} strokeWidth={4} transform="rotate(14 1280 700)" />
        <rect x={1252} y={580} width={56} height={26} rx={4} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} transform="rotate(14 1280 700)" />
        {/* 小さな看板 */}
        <NH1dSign x={1196} y={330} s={0.7} base={BY + 6} f={f} glow={seg(f, 24, 30) * (1 - seg(f, 34, 42))} />
        {/* 糸 (名札→輪→各先) */}
        <Ito from={kM} to={[-80, 470]} kind="mimi" sag={50} f={f} />
        <Ito from={kC} to={[440, 732]} kind="chobo" sag={16} lock={1} f={f} />
        <Ito from={kS} to={ring} kind="shinyo" sag={30} f={f} />
        {targets.map((tg, i) => (
          <Ito key={i} from={ring} to={tg.to} kind="shinyo" t={easeOut(seg(f, tg.a, tg.b))} sag={tg.sag} f={f + i * 5} thick={0.7} />
        ))}
        {targets.map((tg, i) => {
          const k = seg(f, tg.b, tg.b + 6);
          return k > 0 && k < 1 ? <circle key={i} cx={tg.to[0]} cy={tg.to[1]} r={20 + 30 * k} fill="none" stroke={NP.glow} strokeWidth={6} opacity={1 - k} /> : null;
        })}
        <circle cx={ring[0]} cy={ring[1]} r={18} fill="none" stroke={KRP.ink} strokeWidth={13} />
        <circle cx={ring[0]} cy={ring[1]} r={18} fill="none" stroke={NP.brass} strokeWidth={7} />
        {/* お客の人形たち (木の台の上) */}
        {dolls.map((d, i) => {
          const tied = f >= targets[3 + i].b;
          return (
            <g key={i}>
              <ellipse cx={d.x} cy={BY + 4} rx={60} ry={10} fill={C.standWood} stroke={KRP.ink} strokeWidth={4} />
              <PersonMini x={d.x} y={BY} s={DS} color={d.c} f={f} phase={d.ph} face={tied ? "smile" : "dot"} arms={tied ? "up" : "down"} />
            </g>
          );
        })}
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" f={f} knots={{ mimi: 1, chobo: 1, shinyo: 1 }} />
        <ItoLegend x={1610} y={100} s={0.85} lit={{ mimi: 1, chobo: 1, shinyo: 1 }} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #191 信用の糸は、太くなるほど、両側から強く引っぱられます。
// 格: 山 / seed 4191
// 絵: 金茶の糸が f で太くなり (`thick` 1→2)、糸の途中を**事務所の手 (紺の袖)** と**本人の手**が両側からつかんで引っぱる (`tension`)。名札が右へ少し傾く
// どこ: 同じ作業台に寄った構図。名札は左、金茶の糸が右へ。右の画面外から2本の腕が入ってくる
// 演出: 金茶の糸が太くなり、先が2つにほどける。上の枝を事務所の手 (紺の袖・白いカフス)、下の枝を本人の手 (金の舞台衣装の袖) がつかみ、同じ力で引く (どちらも悪者にしない・引き分け)。名札が右へ傾く
// 動き: thick 1→2 (f4〜26) / tension f14〜34 / 手が少しずつ右へ下がる・小さく震える / 力の線がちらつく / カメラがゆっくり寄る
const NH1dGrip: React.FC<{ x: number; y: number; dir: -1 | 1; sleeve: string; sleeveDark: string; cuff: string; sequin?: boolean; f: number }> = ({ x, y, dir, sleeve, sleeveDark, cuff, sequin, f }) => {
  const ex = x + 520, ey = y + dir * 300;
  const ang = Math.atan2(ey - y, ex - x);
  const cx1 = x + Math.cos(ang) * 46, cy1 = y + Math.sin(ang) * 46;
  const cx2 = x + Math.cos(ang) * 78, cy2 = y + Math.sin(ang) * 78;
  return (
    <g>
      <line x1={cx2} y1={cy2} x2={ex} y2={ey} stroke={KRP.ink} strokeWidth={98} strokeLinecap="round" />
      <line x1={cx2} y1={cy2} x2={ex} y2={ey} stroke={sleeve} strokeWidth={86} strokeLinecap="round" />
      <line x1={cx2 + Math.cos(ang) * 40} y1={cy2 + Math.sin(ang) * 40 - 26} x2={ex} y2={ey - 26} stroke={sleeveDark} strokeWidth={10} strokeLinecap="round" opacity={0.6} />
      {sequin && Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={lerp(cx2, ex, 0.15 + i * 0.09) + (i % 2 ? 14 : -14)} cy={lerp(cy2, ey, 0.15 + i * 0.09) + (i % 3) * 10 - 10} r={5}
          fill={KRP.white} opacity={0.5 + 0.5 * Math.sin(f / 3 + i)} />
      ))}
      <line x1={cx1} y1={cy1} x2={cx2} y2={cy2} stroke={KRP.ink} strokeWidth={92} />
      <line x1={cx1} y1={cy1} x2={cx2} y2={cy2} stroke={cuff} strokeWidth={82} />
      {!sequin && <circle cx={lerp(cx1, cx2, 0.5)} cy={lerp(cy1, cy2, 0.5) + 22} r={6} fill={KRP.grayDark} />}
      {sequin && [0, 1, 2, 3].map((i) => <circle key={i} cx={cx1 + (i - 1.5) * 18 * Math.sin(ang)} cy={cy1 - (i - 1.5) * 18 * Math.cos(ang)} r={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />)}
      {/* こぶし */}
      <ellipse cx={x} cy={y} rx={46} ry={40} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {[-18, 0, 18].map((d) => <path key={d} d={`M ${x - 40} ${y + d} Q ${x - 50} ${y + d + 4} ${x - 40} ${y + d + 10}`} fill="none" stroke={KRP.ink} strokeWidth={4} />)}
      <path d={`M ${x - 10} ${y - 30} Q ${x + 14} ${y - 20} ${x + 10} ${y}`} fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
    </g>
  );
};
const Nm191: React.FC<{ f: number }> = ({ f }) => {
  const NX = 560, NY = 390, NS = 1.05, BY = 800;
  const th = 1 + easeInOut(seg(f, 4, 26));
  const tn = seg(f, 14, 34);
  const pull = easeInOut(seg(f, 14, 38));
  const rot = 7 * pull;
  const sway = Math.sin(f / 22) * 1.6 + rot;
  const kS = rotPt(NX, NY, nafudaKnot("shinyo", NX, NY, NS), sway);
  const kM = rotPt(NX, NY, nafudaKnot("mimi", NX, NY, NS), sway);
  const kC = rotPt(NX, NY, nafudaKnot("chobo", NX, NY, NS), sway);
  const ringP = rotPt(NX, NY, [NX, NY - 165 * NS], sway);
  const jit = Math.sin(f * 1.3) * 2.5 * tn;
  const M: [number, number] = [lerp(1160, 1200, pull), 430];
  const H1: [number, number] = [lerp(1540, 1620, pull), 230 - 20 * pull + jit];
  const H2: [number, number] = [lerp(1540, 1620, pull), 640 + 20 * pull - jit];
  const cam = easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4191} bg={C.plankA}>
      <g transform={camT(1 + 0.05 * cam, lerp(960, 1040, cam), lerp(540, 470, cam))}>
        <NH1dWall benchY={BY} seed={4191} />
        <ellipse cx={900} cy={430} rx={700} ry={360} fill={C.lampGlow} opacity={0.2} />
        <NH1dBench y={BY} seed={4191} />
        <NH1dStand x1={300} x2={820} top={150} base={BY + 6} hookX={NX} hookY={172} />
        <line x1={NX} y1={170} x2={ringP[0]} y2={ringP[1]} stroke={KRP.ink} strokeWidth={6} />
        <NH1dLedger x={520} y={826} w={240} h={50} />
        <Ito from={kM} to={[-80, 480]} kind="mimi" sag={50} f={f} />
        <Ito from={kC} to={[540, 804]} kind="chobo" sag={14} lock={1} f={f} />
        {/* 太くなる信用の糸と、2つにほどけた先 */}
        <Ito from={kS} to={M} kind="shinyo" thick={th} tension={tn} sag={50} f={f} />
        <Ito from={M} to={H1} kind="shinyo" thick={0.4 + 0.35 * th} tension={tn} sag={30} f={f + 3} />
        <Ito from={M} to={H2} kind="shinyo" thick={0.4 + 0.35 * th} tension={tn} sag={30} f={f + 7} />
        <circle cx={M[0]} cy={M[1]} r={9 * th} fill={NP.shinyoDark} stroke={KRP.ink} strokeWidth={4} />
        {/* 太さの目盛り (糸の横の小さな輪) */}
        {[0.3, 0.55].map((u, i) => {
          const [px, py] = quadPt(kS, M, 50 * (1 - tn), u);
          return <ellipse key={i} cx={px} cy={py} rx={6 + 6 * th} ry={9 + 8 * th} fill="none" stroke={NP.brass} strokeWidth={5} opacity={0.8} />;
        })}
        <NH1dGrip x={H1[0]} y={H1[1]} dir={-1} sleeve={C.navy} sleeveDark={C.navyDark} cuff={KRP.white} f={f} />
        <NH1dGrip x={H2[0]} y={H2[1]} dir={1} sleeve={C.gold} sleeveDark={C.goldDark} cuff={KRP.white} sequin f={f} />
        {/* 力の線 */}
        {tn > 0.2 && [H1, H2].map((h, i) => (
          <g key={i} stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={f % 8 < 5 ? 0.8 : 0.3}>
            <line x1={h[0] - 70} y1={h[1] - 50} x2={h[0] - 100} y2={h[1] - 70} />
            <line x1={h[0] - 80} y1={h[1]} x2={h[0] - 118} y2={h[1]} />
            <line x1={h[0] - 70} y1={h[1] + 50} x2={h[0] - 100} y2={h[1] + 70} />
          </g>
        ))}
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" f={f} rot={rot} knots={{ mimi: 1, chobo: 1, shinyo: 0.6 + 0.4 * Math.sin(f / 5) * tn }} />
        <TagPlate x={1400} y={176} text="事務所" size={32} t={seg(f, 18, 26)} />
        <TagPlate x={1390} y={700} text="本人" size={32} t={seg(f, 22, 30)} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #192 耳の糸。帳簿の糸。信用の糸。
// 格: 図 / seed 4192
// 絵: ★**3本そろった名札**を正面から大きく。左の朱 (耳へ)・下の藍 (名簿へ・錠前)・右の金茶 (看板とお客へ・太い)。f で1本ずつ順に光る (耳→帳簿→信用)。からくりの作業台の上
// どこ: からくりの作業台を正面から。台の上に名札を大きく吊り、左に木彫りの耳、下に名簿、右に看板とお客の人形
// 演出: 3本の糸が1本ずつ順に光る。耳の糸 → 帳簿の糸 → 信用の糸。光が結び目から糸を伝って先まで走り、行き先の物も光る。最後は3本とも灯ったまま
// 動き: 耳 f4〜14 / 帳簿 f16〜26 / 信用 f28〜38 (光の玉が走る) / 結び目の色がつく / カメラがほんの少し寄る
const Nm192: React.FC<{ f: number }> = ({ f }) => {
  const NX = 960, NY = 400, NS = 1.5, BY = 740;
  const Lm = seg(f, 4, 14), Lc = seg(f, 16, 26), Ls = seg(f, 28, 38);
  const kM = nafudaKnot("mimi", NX, NY, NS);
  const kC = nafudaKnot("chobo", NX, NY, NS);
  const kS = nafudaKnot("shinyo", NX, NY, NS);
  const eM: [number, number] = [318, 430];
  const eC: [number, number] = [960, 744];
  const eS: [number, number] = [1562, 396];
  const signBottom: [number, number] = [1650, 440];
  const dolls = [1560, 1700, 1840];
  const wob = Math.sin(f / 14) * 6;
  const lines: { a: [number, number]; b: [number, number]; sag: number; L: number; w: number }[] = [
    { a: kM, b: eM, sag: 60 + wob, L: Lm, w: 30 },
    { a: kC, b: eC, sag: 10 + wob, L: Lc, w: 30 },
    { a: kS, b: eS, sag: 30 + wob, L: Ls, w: 44 },
  ];
  const cam = easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4192} bg={C.plankA}>
      <g transform={camT(1 + 0.04 * cam, 960, lerp(540, 500, cam))}>
        <NH1dWall benchY={BY} seed={4192} />
        <ellipse cx={960} cy={420} rx={760} ry={360} fill={C.lampGlow} opacity={0.18 + 0.1 * (Lm + Lc + Ls) / 3} />
        <NH1dBench y={BY} seed={4192} />
        <NH1dStand x1={520} x2={1400} top={120} base={BY + 6} hookX={NX} hookY={ringTop(NY, NS)} />
        <NH1dEar x={250} y={440} s={1.05} base={BY + 6} glow={Lm} />
        <NH1dLedger x={960} y={772} w={280} h={56} glow={Lc} />
        <NH1dSign x={1650} y={380} s={0.9} base={BY + 6} f={f} glow={Ls} />
        {dolls.map((dx, i) => (
          <g key={dx}>
            <ellipse cx={dx} cy={BY + 4} rx={46} ry={8} fill={C.standWood} stroke={KRP.ink} strokeWidth={4} />
            <PersonMini x={dx} y={BY} s={0.7} color={[KRP.orange, KRP.green, KRP.blue][i]} f={f} phase={i} face={Ls > 0.9 ? "smile" : "dot"} arms="up" />
          </g>
        ))}
        {/* 光の帯 (糸の下に敷く) */}
        {lines.map((ln, i) => ln.L > 0 && (
          <path key={i} d={quadD(ln.a, ln.b, ln.sag)} fill="none" stroke={NP.glow} strokeWidth={ln.w} strokeLinecap="round"
            opacity={0.55 * ln.L} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ln.L} />
        ))}
        <Ito from={kM} to={eM} kind="mimi" sag={60} f={f} />
        <Ito from={kC} to={eC} kind="chobo" sag={10} lock={1} f={f} />
        <Ito from={kS} to={eS} kind="shinyo" sag={30} thick={2} f={f} />
        {dolls.map((dx, i) => (
          <Ito key={dx} from={signBottom} to={[dx - 48, BY - 117]} kind="shinyo" sag={20} thick={0.6} f={f + i * 4} />
        ))}
        {/* 走る光の玉 */}
        {lines.map((ln, i) => {
          if (ln.L <= 0 || ln.L >= 1) return null;
          const [px, py] = quadPt(ln.a, ln.b, ln.sag, easeOut(ln.L));
          return (
            <g key={i}>
              <circle cx={px} cy={py} r={34} fill={NP.glow} opacity={0.5} />
              <circle cx={px} cy={py} r={14} fill={NP.glowCore} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" f={f} knots={{ mimi: Lm, chobo: Lc, shinyo: Ls }} />
      </g>
    </Frame>
  );
};

// -------------------------------------------------------------------
// #193 では、この糸を失ったとき、人の中では、何が起きるのでしょうか。
// 格: 並 / seed 4193
// 絵: #192 の名札を見つめるナレーター役の Person の後ろ姿。3本の糸がかすかに震え、名札の影が濃くなる。`QMark`
// どこ: 同じ作業場の夜。ランプが1つだけ。作業台の名札 (3本の糸つき) を、手前のナレーター役が後ろから見つめる
// 演出: 3本の糸がかすかに震えだし、壁に落ちた名札の影がだんだん濃く大きくなる。ランプが小さくまたたく。ナレーターの頭の上に「？」
// 動き: 糸の震え (tension) / 影 f6〜40 で濃く / ランプのまたたき / QMark f26〜36 / ナレーターが少し前へ傾く / カメラが横にゆっくり寄る
const Nm193: React.FC<{ f: number }> = ({ f }) => {
  const NX = 800, NY = 360, NS = 1.15, BY = 700;
  const d = easeInOut(seg(f, 6, 40));
  const kM = nafudaKnot("mimi", NX, NY, NS);
  const kC = nafudaKnot("chobo", NX, NY, NS);
  const kS = nafudaKnot("shinyo", NX, NY, NS);
  const q = Math.sin(f * 1.1) * 2;
  const flick = f % 37 < 3 ? 0.5 : 1;
  const cam = easeInOut(seg(f, 0, 42));
  return (
    <Frame f={f} seed={4193} bg={C.night} dark>
      <g transform={camT(1 + 0.03 * cam, lerp(960, 920, cam), 540)}>
        <NH1dWall benchY={BY} seed={4193} night={0.5} />
        {/* ランプの光 (またたく) */}
        <ellipse cx={640} cy={380} rx={620} ry={330} fill={C.lampGlow} opacity={(0.28 - 0.08 * d) * flick} />
        {/* 壁に落ちた名札の影 (だんだん濃く・大きく) */}
        <g transform={`translate(${NX + 60 + 40 * d} ${NY + 40 + 20 * d}) scale(${1 + 0.15 * d}) rotate(${Math.sin(f / 22) * 1.6})`} opacity={0.15 + 0.45 * d}>
          <rect x={-230} y={-110} width={460} height={218} rx={26} fill={C.shadow} />
          <line x1={0} y1={-110} x2={0} y2={-200} stroke={C.shadow} strokeWidth={8} />
        </g>
        {/* 吊りランプ */}
        <line x1={560} y1={36} x2={560} y2={84} stroke={KRP.ink} strokeWidth={5} />
        <path d="M 510 124 Q 560 64 610 124 Z" fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={560} cy={130} r={16} fill={C.lampGlow} opacity={flick} stroke={KRP.ink} strokeWidth={4} />
        <NH1dBench y={BY} seed={4193} night={0.45} />
        <NH1dStand x1={420} x2={1180} top={150} base={BY + 6} hookX={NX} hookY={ringTop(NY, NS)} />
        <NH1dEar x={230} y={400} s={0.9} base={BY + 6} />
        <NH1dLedger x={780} y={738} w={240} h={50} />
        <NH1dSign x={1300} y={330} s={0.7} base={BY + 6} f={f} />
        <Ito from={kM} to={[300 + q, 392]} kind="mimi" sag={50} tension={0.55} f={f} />
        <Ito from={kC} to={[780, 714 + q * 0.5]} kind="chobo" sag={14} lock={1} tension={0.55} f={f + 5} />
        <Ito from={kS} to={[1232, 352 - q]} kind="shinyo" sag={30} thick={2} tension={0.55} f={f + 9} />
        <Nafuda x={NX} y={NY} s={NS} text="山田 花子" f={f} knots={{ mimi: 0.5, chobo: 0.5, shinyo: 0.5 }} />
        <QMark x={1545} y={585} s={1.0} f={f} t={seg(f, 26, 36)} />
        {/* ナレーター役 (後ろ姿) */}
        <NH1dBack x={1500} y={1060} s={1.5} cloth={C.narr} clothDark={C.narrDark} f={f} lean={-4 * d} />
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  nm_186: (f) => <Nm186 f={f} />,
  nm_187: (f) => <Nm187 f={f} />,
  nm_188: (f) => <Nm188 f={f} />,
  nm_189: (f) => <Nm189 f={f} />,
  nm_190: (f) => <Nm190 f={f} />,
  nm_191: (f) => <Nm191 f={f} />,
  nm_192: (f) => <Nm192 f={f} />,
  nm_193: (f) => <Nm193 f={f} />,
};

export const NM_H1D_MOTIFS: string[] = [
  "nm_186", // #186
  "nm_187", // #187
  "nm_188", // #188
  "nm_189", // #189
  "nm_190", // #190
  "nm_191", // #191
  "nm_192", // #192
  "nm_193", // #193
];

export const namaeH1dScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
