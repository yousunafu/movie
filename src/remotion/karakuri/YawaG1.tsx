// 「なぜ人は、柔らかいものを握りたくなるのか」: 文#185〜#196 (12文)
// 台本: docs/yawarakai-script-v1.txt (文番号 = 行番号 − 1) / 設計書: docs/yawarakai-design-6.md
// 1文 = 1シーン = 1枚の絵。ぜんぶで12枚。
// motif 名は yw_文番号3桁。WobbleDefs の seed は 3000+文番号。ローカル部品名の接頭辞は L5a。
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
  // 夜の研究所 (#185)
  nightWall: "#36405A", nightDeep: "#252D42", nightLine: "#4A5674", deskTop: "#8A6A48", deskEdge: "#6A4E34",
  lampBody: "#4F6A5E", lampDark: "#36493F", lampGlow: "#FFE7A6", moon: "#FFF2C2", starry: "#1E2538",
  cushion: "#D98C7A", cushionDark: "#B66E5E", memFoam: "#EDE3C8", memFoamDark: "#CBBE9C",
  bear: "#C89A6A", bearDark: "#9E7448", bearSnout: "#EAD3B0",
  pen: "#4F7FC0", penDark: "#355E99", penGrip: "#DDE6EA", penRib: "#B7C4CB",
  notebook: "#F7F3E6", noteLine: "#B9CBE0", mug: "#E07A5F", mugDark: "#B85C45", coffee: "#5B3A26",
  scopeBody: "#E9ECEE", scopeDark: "#9AA3AC", scopeBlack: "#3A3F46", flask: "#A9CFE0",
  // 道しるべの野原 (#186 #195 = #167/#172 と同じ景色)
  sky: "#BFDDEB", hill: "#A9C98A", meadow: "#B8D68E", meadowDark: "#7FA35A",
  path: "#E6D3A6", pathDark: "#C9AF7E", knit: "#C98B5A", knitDark: "#9E6A40",
  wallWarm: "#F0DDB8", warmGlow: "#FFE39A",
  // 病室 (#187 #189)
  hospWall: "#E4ECEA", hospWallDark: "#C6D4D1", hospFloor: "#D5D9CF", hospFloorLine: "#BCC2B6",
  curtain: "#BFD9CF", curtainDark: "#95B8AB", winSky: "#CFE6F2", tree: "#8DBB7A", treeDark: "#6A9A5A",
  bedFrame: "#B8C2C8", bedFrameDark: "#8D99A1", sheet: "#F6F7F3", blanket: "#E9D9B8", blanketDark: "#CDBB94",
  gown: "#B9D3E0", gownDark: "#93B3C4", scrubDark: "#D5DDE0", ivBag: "#E3F1F6",
  flower1: "#E88A9A", flower2: "#F2CE4C", vase: "#8FB8D8", leaf: "#7FA35A", grayHair: "#C9CCCF",
  foam: "#EED890", foamDark: "#C9B064", foamCut: "#B39A52",
  // 説明パネル (#188 #190)
  corridor: "#DDE8E2", corridorDark: "#BFCFC6", rail: "#C9A46A", railDark: "#A07E4A",
  panelBg: "#FBFAF4", panelFrame: "#8D99A1", hard: "#C3C7C9", hardLine: "#9AA1A6", softPress: "#F0A890",
  // 報告書 (#191)
  deskWood: "#B48A5E", deskWoodDark: "#8E6A44", reportCover: "#3F6E8C", reportCoverDark: "#2E5470",
  paper: "#FBF8EF", barGray: "#A9B1B8", sticky: "#F7D84A",
  // 寝室 (#192)
  bedroom: "#F1E3C8", bedroomDark: "#D9C7A4", dawn: "#FBD9A0", marsh: "#F4EEF4", marshDark: "#D9CCE0",
  pajama: "#E2A3B0", pajamaDark: "#C07F8E", rugBed: "#9DB7CF",
  // 試験室 (#193)
  labWall: "#E8ECEA", labTile: "#D3DAD7", labFloor: "#CFD5D0", hardMat: "#B5B9BC", hardMatDark: "#8F959A",
  midMat: "#9FC3D9", midMatDark: "#76A2BF", softMat: "#F3E6C4", softMatDark: "#D6C49A", divider: "#D7E3E8",
  coatDark: "#D8DEE0", trialA: "#7E9C6A", trialADark: "#5E7C4C", trialB: "#C98B5A", trialBDark: "#9E6A40",
  trialC: "#9A7EB0", trialCDark: "#7A5E90", clip: "#B48A5E",
  // 製図台 (#194)
  draftWood: "#C9A878", draftWoodDark: "#A07E52", grid: "#CFDCD3", gridBold: "#AFC4B6", fitLine: "#3E9A5A",
  // 1990年代の研究室 (#196)
  room90: "#E9E0C9", room90Dark: "#CDBF9F", lino: "#C9C1A8", linoDark: "#B0A78C", desk90: "#C9B48A",
  desk90Dark: "#A08A60", crt: "#D8D2C0", crtDark: "#B3AB94", crtScreen: "#4C6B5C", board90: "#F4F1E6",
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

// カメラ: (cx,cy) を中心に z 倍し、dx,dy ずらす
const cam = (cx: number, cy: number, z: number, dx = 0, dy = 0) =>
  `translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`;

type L5aFace = "normal" | "worried" | "surprised" | "smile" | "joy" | "angry" | "sad";
type L5aPose = "stand" | "banzai" | "raise" | "point" | "armsFolded" | "run" | "hold";

// 太い線の手足 (墨のふち付き)
const L5aLimb: React.FC<{ pts: number[][]; w: number; fill: string; hand?: boolean }> = ({ pts, w, fill, hand = true }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const e = pts[pts.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={C.ink} strokeWidth={w + 9} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      {hand && <circle cx={e[0]} cy={e[1]} r={w * 0.5} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />}
    </g>
  );
};

// 雲 (#172 の L4cCloud と同じ形)
const L5aCloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const b = [[-60, 0, 34], [-16, -20, 44], [36, -12, 40], [74, 6, 28], [-22, 12, 32], [26, 14, 32]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {b.map(([cx, cy, r], i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill={KRP.white} stroke={C.ink} strokeWidth={5} />)}
      {b.map(([cx, cy, r], i) => <circle key={`i${i}`} cx={cx} cy={cy} r={r - 3} fill={KRP.white} />)}
    </g>
  );
};

// 寝かせた人。ox,oy = 足元 (右)。頭は左。tilt>0 で上体が起きる。
// 体の下面: 胴 58*s / 頭 64*s / 脚 30*s (足元原点から下へ)
const L5aLying: React.FC<{
  ox: number; oy: number; s: number; f: number; face?: L5aFace; tilt?: number;
  cloth?: string; clothDark?: string; elder?: boolean; pose?: L5aPose; phase?: number; hair?: "cap" | "none";
}> = ({ ox, oy, s, f, face = "normal", tilt = 0, cloth = C.gown, clothDark = C.gownDark, elder = false, pose = "hold", phase = 0, hair }) => (
  <g transform={`translate(${ox} ${oy}) rotate(${-90 + tilt}) scale(${s})`}>
    <Person x={0} y={0} s={1} f={f} face={face} cloth={cloth} clothDark={clothDark}
      hair={hair ?? (elder ? "none" : "cap")} still pose={pose} phase={phase} />
    {elder && (
      <g>
        {/* 白髪 (耳の上に残る) と額のしわ */}
        <path d="M -64 -226 Q -74 -266 -46 -284 Q -58 -258 -52 -230 Z" fill={C.grayHair} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M 64 -226 Q 74 -266 46 -284 Q 58 -258 52 -230 Z" fill={C.grayHair} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M -20 -262 Q 0 -268 20 -262 M -14 -250 Q 0 -255 14 -250" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
      </g>
    )}
  </g>
);

// 寝かせた人 (pose hold) の下面の深さ。py = 足元から頭への距離 (0〜-292)
const L5aUnderRaw = (py: number) => {
  if (py > -8) return 36;
  if (py > -52) return 30;
  if (py > -160) return 58;
  if (py > -178) return 40;
  const d = py + 228;
  const r2 = 64 * 64 - d * d;
  return r2 > 0 ? Math.max(Math.sqrt(r2), 0) : 0;
};
// 体の下面にそう線の点列 (なめらかに)
const L5aFitPts = (ox: number, oy: number, s: number, off: number) => {
  const raw: number[][] = [];
  for (let py = -2; py >= -286; py -= 4) raw.push([py, L5aUnderRaw(py)]);
  return raw.map((p, i) => {
    let sum = 0, n = 0;
    for (let k = -3; k <= 3; k++) { const q = raw[i + k]; if (q) { sum += q[1]; n++; } }
    return [ox + p[0] * s, oy + (sum / n + off) * s];
  });
};
const L5aPathD = (pts: number[][]) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const L5aPathLen = (pts: number[][]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
const L5aPointAt = (pts: number[][], t: number) => {
  const total = L5aPathLen(pts) * clamp01(t);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + l >= total) { const u = (total - acc) / (l || 1); return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]; }
    acc += l;
  }
  return pts[pts.length - 1];
};

// 道しるべの野原 (#172 YawaF3 の L4cSignpost を写したもの。3本の矢印つき)
// top/bot/handGlow: 「体を守る」「心を落ち着かせる」「手を守る」の光 / hand: 3本目の矢印の出 (0→1)
const L5aSignpost: React.FC<{ f: number; top?: number; bot?: number; hand?: number; handGlow?: number; children?: React.ReactNode }> = ({
  f, top = 0, bot = 0, hand = 1, handGlow = 0, children,
}) => {
  const pulse = 0.85 + Math.sin(f / 4) * 0.15;
  const hp = pop(clamp01(hand));
  return (
    <g>
      <rect x={-400} y={-150} width={W + 800} height={800} fill={C.sky} />
      {[[300, 120, 1], [1100, 90, 1.3], [1650, 170, 0.9], [2150, 110, 1]].map(([cx2, cy2, s2], i) => (
        <L5aCloud key={i} x={cx2 + f * (0.6 + i * 0.3)} y={cy2} s={s2} />
      ))}
      <path transform={`translate(${1300 - f * 6} ${250 + Math.sin(f / 4) * 8})`}
        d={`M -24 0 Q -12 ${-12 + Math.sin(f / 2) * 6} 0 0 Q 12 ${-12 + Math.sin(f / 2) * 6} 24 0`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <path d="M -400 560 Q 300 440 700 530 Q 1100 450 1500 520 Q 1800 470 2070 540 Q 2250 500 2400 540 L 2400 700 L -400 700 Z" fill={C.hill} stroke={C.ink} strokeWidth={5} />
      <g transform="translate(250 520)">
        <rect x={-90} y={-110} width={180} height={110} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        <rect x={-14} y={-96} width={28} height={70} fill={KRP.red} />
        <rect x={-35} y={-75} width={70} height={28} fill={KRP.red} />
        <rect x={-24} y={-36} width={48} height={36} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
      </g>
      <g transform="translate(1720 520)">
        <rect x={40} y={-150} width={28} height={60} fill={YP.woodDark} stroke={C.ink} strokeWidth={4} />
        {[0, 1].map((k) => {
          const tt = ((f + k * 16) % 32) / 32;
          return <circle key={k} cx={54 + tt * 30} cy={-160 - tt * 60} r={10 + tt * 14} fill={KRP.white} opacity={0.85 * (1 - tt)} />;
        })}
        <path d="M -100 -80 L 0 -160 L 100 -80 Z" fill={KRP.red} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-80} y={-80} width={160} height={80} fill={C.wallWarm} stroke={C.ink} strokeWidth={5} />
        <rect x={-50} y={-62} width={40} height={34} fill={C.warmGlow} stroke={C.ink} strokeWidth={3} />
        <rect x={20} y={-50} width={32} height={50} fill={YP.woodDark} stroke={C.ink} strokeWidth={3} />
      </g>
      <rect x={-400} y={600} width={W + 800} height={600} fill={C.meadow} />
      <path d="M -400 600 Q 900 570 2400 610" fill="none" stroke={C.meadowDark} strokeWidth={5} />
      <polygon points="820,1200 1100,1200 1000,700 930,700" fill={C.path} stroke={C.ink} strokeWidth={5} />
      <polygon points="962,688 962,738 330,600 330,574" fill={C.path} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <polygon points="962,688 962,738 1620,600 1620,574" fill={C.path} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <polygon points="930,700 994,700 1010,760 916,760" fill={C.path} />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={960 + (i - 2.5) * 30} cy={800 + i * 50} rx={14} ry={6} fill={C.pathDark} />
      ))}
      {Array.from({ length: 28 }, (_, i) => {
        const gx = rnd(1671, i) * 2500 - 260;
        const gy = 640 + rnd(1672, i) * 300;
        if (gx > 800 && gx < 1120 && gy > 700) return null;
        const sw = Math.sin(f / 7 + i) * 4;
        return (
          <path key={i} d={`M ${gx - 14} ${gy} q ${sw} -26 ${-6 + sw} -40 M ${gx} ${gy} q ${sw} -30 ${4 + sw} -50 M ${gx + 14} ${gy} q ${sw} -24 ${12 + sw} -36`}
            fill="none" stroke={C.meadowDark} strokeWidth={5} strokeLinecap="round" />
        );
      })}
      {/* 柱 */}
      <rect x={938} y={190} width={52} height={660} rx={6} fill={YP.wood} stroke={C.ink} strokeWidth={7} />
      <path d="M 930 190 L 964 160 L 998 190 Z" fill={YP.woodDark} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <line x1={956} y1={240} x2={952} y2={820} stroke={YP.woodDark} strokeWidth={4} opacity={0.7} />
      {/* 上の矢印「体を守る」 */}
      <ellipse cx={760} cy={290} rx={360} ry={130} fill={YP.glow} opacity={0.5 * top * pulse} />
      {top > 0.05 && (
        <g stroke={YP.glow} strokeWidth={8} strokeLinecap="round" opacity={top}>
          {[-160, -125, -55, -20, 20, 55, 125, 160].map((a, i) => {
            const ra = (a * Math.PI) / 180;
            const r1 = 250, r2 = 290 + Math.sin(f / 3 + i) * 14;
            return <line key={a} x1={760 + Math.cos(ra) * r1 * 1.3} y1={290 + Math.sin(ra) * r1 * 0.5} x2={760 + Math.cos(ra) * r2 * 1.3} y2={290 + Math.sin(ra) * r2 * 0.5} />;
          })}
        </g>
      )}
      <polygon points="1010,220 560,220 486,290 560,360 1010,360" fill={YP.wood} stroke={top > 0.05 ? YP.brassDark : C.ink} strokeWidth={7} strokeLinejoin="round" />
      <polygon points="1010,220 560,220 486,290 560,360 1010,360" fill={YP.glowCore} opacity={0.45 * top} />
      <path d="M 580 246 L 990 244 M 590 336 L 990 338" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
      {[[580, 290], [990, 290]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={7} fill={C.ink} />)}
      <TagPlate x={770} y={290} text="体を守る" size={64} t={1} />
      {/* 下の矢印「心を落ち着かせる」 */}
      <ellipse cx={1218} cy={456} rx={380} ry={120} fill={YP.glow} opacity={0.55 * bot * pulse} />
      <polygon points="920,400 1450,400 1516,456 1450,512 920,512" fill={YP.wood} stroke={bot > 0.05 ? YP.brassDark : C.ink} strokeWidth={7} strokeLinejoin="round" />
      <polygon points="920,400 1450,400 1516,456 1450,512 920,512" fill={YP.glowCore} opacity={0.45 * bot} />
      <path d="M 940 424 L 1430 422 M 940 490 L 1430 492" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
      <TagPlate x={1190} y={456} text="心を落ち着かせる" size={48} t={1} />
      {/* 3本目の小さな矢印「手を守る」 */}
      {hp > 0 && (
        <g transform={`translate(990 615) scale(${hp}) translate(-990 -615)`}>
          <ellipse cx={830} cy={615} rx={260} ry={96} fill={YP.glow} opacity={0.55 * handGlow * pulse} />
          {handGlow > 0.05 && (
            <g stroke={YP.glow} strokeWidth={8} strokeLinecap="round" opacity={handGlow}>
              {[-160, -125, -55, -20, 20, 55, 125, 160].map((a, i) => {
                const ra = (a * Math.PI) / 180;
                const r1 = 190, r2 = 226 + Math.sin(f / 3 + i) * 12;
                return <line key={a} x1={830 + Math.cos(ra) * r1 * 1.25} y1={615 + Math.sin(ra) * r1 * 0.5} x2={830 + Math.cos(ra) * r2 * 1.25} y2={615 + Math.sin(ra) * r2 * 0.5} />;
              })}
            </g>
          )}
          <polygon points="996,572 712,572 662,615 712,658 996,658" fill={YP.wood} stroke={handGlow > 0.05 ? YP.brassDark : C.ink} strokeWidth={7} strokeLinejoin="round" />
          <polygon points="996,572 712,572 662,615 712,658 996,658" fill={YP.glowCore} opacity={0.45 * handGlow} />
          <path d="M 724 590 L 980 589 M 728 642 L 980 643" stroke={YP.woodDark} strokeWidth={4} opacity={0.6} />
          <circle cx={976} cy={615} r={7} fill={C.ink} />
          <TagPlate x={830} y={615} text="手を守る" size={42} t={1} />
        </g>
      )}
      {children}
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================
// ---- 文#185 【山】 第10章、柔らかさは、何に効くのか。
// 設計: 章扉。夜の研究所の机の上に、クッション・低反発枕・太軸ペン・ぬいぐるみ・スクイーズが並べられ、上からスタンドの光。顕微鏡・ノート・コーヒー。`ChapterDoor` (num=10)。題字の後ろに薄いクリームの帯
// どこ: 夜の研究所。窓の外は月夜、棚にフラスコとファイル。木の実験机の上、左半分に5つの「柔らかいもの」が試料札つきで並ぶ。右の奥に顕微鏡、手前にノートとコーヒー。
// 演出: 真っ暗な机にスタンドがカチッと点き (チカチカ)、光の輪の中で5つの試料が1つずつきらりと光る (これから調べる物の紹介)。低反発枕には指の跡がゆっくり戻り、最後にスクイーズがぷるんと揺れる。題字は右。
// 動き: f2〜10 スタンドが点滅して点く・f10〜34 試料が順に光る・低反発のくぼみが f で戻る・コーヒーの湯気・カメラはゆっくり寄る。
const L5aBear: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => {
  const tilt = Math.sin(f / 14) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
      {/* 足 */}
      <ellipse cx={-50} cy={-22} rx={36} ry={26} fill={C.bear} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={50} cy={-22} rx={36} ry={26} fill={C.bear} stroke={C.ink} strokeWidth={5} />
      <ellipse cx={-56} cy={-20} rx={16} ry={13} fill={C.bearSnout} />
      <ellipse cx={56} cy={-20} rx={16} ry={13} fill={C.bearSnout} />
      {/* 胴 */}
      <ellipse cx={0} cy={-80} rx={72} ry={70} fill={C.bear} stroke={C.ink} strokeWidth={5.5} />
      <ellipse cx={0} cy={-72} rx={40} ry={42} fill={C.bearSnout} opacity={0.8} />
      {/* 腕 */}
      <ellipse cx={-70} cy={-92} rx={22} ry={36} fill={C.bear} stroke={C.ink} strokeWidth={5} transform="rotate(24 -70 -92)" />
      <ellipse cx={70} cy={-92} rx={22} ry={36} fill={C.bear} stroke={C.ink} strokeWidth={5} transform="rotate(-24 70 -92)" />
      {/* 耳と頭 */}
      <circle cx={-52} cy={-208} r={24} fill={C.bear} stroke={C.ink} strokeWidth={5} />
      <circle cx={52} cy={-208} r={24} fill={C.bear} stroke={C.ink} strokeWidth={5} />
      <circle cx={-52} cy={-208} r={11} fill={C.bearDark} />
      <circle cx={52} cy={-208} r={11} fill={C.bearDark} />
      <circle cx={0} cy={-170} r={62} fill={C.bear} stroke={C.ink} strokeWidth={5.5} />
      <ellipse cx={0} cy={-150} rx={28} ry={21} fill={C.bearSnout} stroke={C.ink} strokeWidth={3.5} />
      <ellipse cx={0} cy={-158} rx={9} ry={6} fill={C.ink} />
      <path d="M 0 -152 L 0 -142 M -8 -138 Q 0 -134 8 -138" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <circle cx={-24} cy={-182} r={7} fill={C.ink} />
      <circle cx={24} cy={-182} r={7} fill={C.ink} />
      {/* 縫い目 */}
      <path d="M 0 -232 L 0 -214 M 0 -146 L 0 -110" stroke={C.bearDark} strokeWidth={3} strokeDasharray="5 5" />
    </g>
  );
};
// 試料札 (糸でぶら下がる小さな番号札)
const L5aSpecimen: React.FC<{ x: number; y: number; n: number; glint: number }> = ({ x, y, n, glint }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={0} y1={-26} x2={0} y2={-46} stroke={C.ink} strokeWidth={2.5} />
    <rect x={-26} y={-26} width={52} height={34} rx={5} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
    <circle cx={-16} cy={-17} r={3} fill={C.ink} />
    <text x={4} y={1} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={C.ink}>{n}</text>
    {glint > 0 && glint < 1 && (
      <path transform={`translate(30 -36) scale(${Math.sin(glint * Math.PI) * 1.4})`} d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z"
        fill={YP.glowCore} stroke={YP.brassDark} strokeWidth={2.5} />
    )}
  </g>
);
const Yw185: React.FC<{ f: number }> = ({ f }) => {
  const on = f < 2 ? 0 : f < 4 ? 0.7 : f < 6 ? 0.15 : f < 7 ? 0.8 : f < 8 ? 0.3 : seg(f, 8, 11);
  const door = seg(f, 12, 26);
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  const gl = (i: number) => seg(f, 10 + i * 5, 18 + i * 5);
  const sqT = seg(f, 30, 42);
  const sqBounce = Math.sin(sqT * Math.PI * 3) * (1 - sqT) * 0.35;
  const dentBack = 1 - seg(f, 4, 40);
  return (
    <Frame f={f} seed={3185} bg={C.nightWall} dark
      over={<>
        <div style={{ position: "absolute", left: 970, top: 536, width: 900, height: 196, borderRadius: 18,
          background: "rgba(247, 242, 226, 0.86)", opacity: door, boxShadow: "0 6px 0 rgba(40,28,16,0.18)" }} />
        <ChapterDoor num={10} title="柔らかさは、何に効くのか" t={door} left={1000} top={560} />
      </>}>
      <defs>
        <radialGradient id="l5a185dark" cx="0.27" cy="0.62" r="0.75">
          <stop offset="0" stopColor={C.nightDeep} stopOpacity={0} />
          <stop offset="0.45" stopColor={C.nightDeep} stopOpacity={0.15} />
          <stop offset="1" stopColor={C.nightDeep} stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <g transform={cam(520, 640, z)}>
        {/* 壁 (板張り) */}
        <rect x={-60} y={-60} width={W + 120} height={640} fill={C.nightWall} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 170} y1={-60} x2={i * 170} y2={560} stroke={C.nightLine} strokeWidth={4} />
        ))}
        {/* 窓: 月夜 */}
        <rect x={1460} y={60} width={360} height={290} rx={8} fill={C.starry} stroke={C.ink} strokeWidth={7} />
        <circle cx={1730} cy={130} r={38} fill={C.moon} />
        <circle cx={1748} cy={120} r={34} fill={C.starry} />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={1480 + rnd(1851, i) * 320} cy={80 + rnd(1852, i) * 250} r={2.5 + rnd(1853, i) * 2}
            fill={C.moon} opacity={0.5 + Math.sin(f / 5 + i * 2) * 0.4} />
        ))}
        <line x1={1640} y1={60} x2={1640} y2={350} stroke={C.ink} strokeWidth={7} />
        <line x1={1460} y1={205} x2={1820} y2={205} stroke={C.ink} strokeWidth={7} />
        {/* 棚: フラスコとファイル */}
        <rect x={1000} y={110} width={380} height={16} fill={C.deskEdge} stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={1012 + i * 40} y={20} width={34} height={90} rx={3} fill={[KRP.blue, KRP.red, KRP.yellow, KRP.green, KRP.blueDeep][i]}
            stroke={C.ink} strokeWidth={3.5} opacity={0.75} />
        ))}
        <path d="M 1250 110 L 1250 70 L 1238 48 L 1270 48 L 1258 70 L 1258 110 Z" fill={C.flask} stroke={C.ink} strokeWidth={3.5} />
        <path d="M 1300 110 Q 1290 80 1312 62 L 1312 36 L 1326 36 L 1326 62 Q 1348 80 1338 110 Z" fill={C.flask} stroke={C.ink} strokeWidth={3.5} />
        {/* 机 */}
        <polygon points="-60,520 1980,520 1980,1140 -60,1140" fill={C.deskTop} stroke={C.ink} strokeWidth={6} />
        <rect x={-60} y={520} width={W + 120} height={16} fill={C.deskEdge} />
        {Array.from({ length: 5 }, (_, i) => (
          <path key={i} d={`M -60 ${600 + i * 110} q 500 ${rnd(1854, i) * 30 - 15} 1000 0 q 500 ${rnd(1855, i) * 30 - 15} 1040 0`}
            fill="none" stroke={C.deskEdge} strokeWidth={4} opacity={0.5} />
        ))}
        {/* 顕微鏡 (奥・右) */}
        <g transform="translate(1290 528)">
          <rect x={-90} y={-26} width={180} height={26} rx={8} fill={C.scopeBlack} stroke={C.ink} strokeWidth={5} />
          <path d="M 30 -26 Q 70 -120 30 -220 L 0 -220 Q 36 -120 0 -26 Z" fill={C.scopeBody} stroke={C.ink} strokeWidth={5} />
          <rect x={-70} y={-112} width={120} height={16} rx={4} fill={C.scopeBlack} stroke={C.ink} strokeWidth={4} />
          <g transform="rotate(-24 -10 -200)">
            <rect x={-30} y={-280} width={40} height={130} rx={8} fill={C.scopeBody} stroke={C.ink} strokeWidth={5} />
            <rect x={-36} y={-300} width={52} height={28} rx={6} fill={C.scopeBlack} stroke={C.ink} strokeWidth={4} />
            <rect x={-22} y={-150} width={24} height={34} rx={4} fill={C.scopeDark} stroke={C.ink} strokeWidth={4} />
          </g>
          <circle cx={44} cy={-150} r={14} fill={C.scopeDark} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* スタンド (左奥から腕を伸ばす) */}
        <ellipse cx={110} cy={600} rx={80} ry={22} fill={C.lampDark} stroke={C.ink} strokeWidth={5} />
        <path d="M 110 590 L 170 300 L 430 190" fill="none" stroke={C.ink} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 110 590 L 170 300 L 430 190" fill="none" stroke={C.lampBody} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={170} cy={300} r={13} fill={YP.brass} stroke={C.ink} strokeWidth={4} />
        {/* 光の円錐 */}
        <polygon points="440,240 540,240 940,760 60,760" fill={C.lampGlow} opacity={0.22 * on} />
        <ellipse cx={500} cy={740} rx={470} ry={120} fill={C.lampGlow} opacity={0.3 * on} />
        <path d="M 410 170 L 570 170 L 540 246 L 440 246 Z" fill={C.lampBody} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={490} cy={246} rx={52} ry={10} fill={on > 0.5 ? C.lampGlow : C.lampDark} stroke={C.ink} strokeWidth={4} />
        {/* 試料1: 低反発枕 (波形・細かい気泡)。指の跡がゆっくり戻る */}
        <g>
          <path d="M 150 680 Q 140 600 200 590 Q 250 560 320 590 Q 390 570 440 586 Q 500 590 500 680 Z"
            fill={C.memFoam} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={175 + rnd(1856, i) * 300} cy={612 + rnd(1857, i) * 60} r={2.5} fill={C.memFoamDark} />
          ))}
          {dentBack > 0.02 && [270, 300, 330, 360].map((dx, i) => (
            <ellipse key={i} cx={dx} cy={604 + Math.abs(i - 1.5) * 5} rx={11} ry={18 * dentBack} fill={C.memFoamDark} opacity={0.8} />
          ))}
          <L5aSpecimen x={470} y={608} n={1} glint={gl(0)} />
        </g>
        {/* 試料2: ぬいぐるみ */}
        <L5aBear x={780} y={700} s={0.95} f={f} />
        <L5aSpecimen x={880} y={600} n={2} glint={gl(1)} />
        {/* 試料3: クッション (房つき) */}
        <g transform="translate(250 760) rotate(-4)">
          <path d="M -130 -80 Q -150 -100 -126 -110 Q 0 -96 126 -110 Q 150 -100 130 -80 Q 120 0 130 80 Q 150 100 126 108 Q 0 94 -126 108 Q -150 100 -130 80 Q -120 0 -130 -80 Z"
            fill={C.cushion} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={0} cy={0} r={12} fill={C.cushionDark} stroke={C.ink} strokeWidth={4} />
          <path d="M -60 -40 Q -20 -8 -12 -6 M 60 -40 Q 20 -8 12 -6 M -60 44 Q -20 10 -12 6 M 60 44 Q 20 10 12 6"
            fill="none" stroke={C.cushionDark} strokeWidth={4} strokeLinecap="round" />
          <L5aSpecimen x={110} y={-70} n={3} glint={gl(2)} />
        </g>
        {/* 試料4: スクイーズ */}
        <Squishy x={590} y={836} s={0.58} f={f} squeeze={Math.max(0, sqBounce)} />
        <L5aSpecimen x={690} y={712} n={4} glint={gl(3)} />
        {/* 試料5: 太軸のペン (ゴムのグリップ) */}
        <g transform="translate(860 800) rotate(-14)">
          <rect x={-150} y={-24} width={300} height={48} rx={22} fill={C.pen} stroke={C.ink} strokeWidth={5.5} />
          <rect x={-140} y={-24} width={120} height={48} rx={18} fill={C.penGrip} stroke={C.ink} strokeWidth={4.5} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={-126 + i * 18} y1={-20} x2={-126 + i * 18} y2={20} stroke={C.penRib} strokeWidth={4} />
          ))}
          <path d="M -150 -16 L -188 0 L -150 16 Z" fill={C.penGrip} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <rect x={60} y={-34} width={70} height={14} rx={5} fill={C.penDark} stroke={C.ink} strokeWidth={4} />
          <L5aSpecimen x={-60} y={-34} n={5} glint={gl(4)} />
        </g>
        {/* 手前右: ノートとコーヒー */}
        <g transform="translate(1180 800) rotate(4)">
          <rect x={-170} y={-60} width={340} height={150} rx={6} fill={C.notebook} stroke={C.ink} strokeWidth={5} />
          <line x1={0} y1={-60} x2={0} y2={90} stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line x1={-150} y1={-30 + i * 28} x2={-20} y2={-30 + i * 28} stroke={C.noteLine} strokeWidth={4} />
              <line x1={20} y1={-30 + i * 28} x2={150} y2={-30 + i * 28} stroke={C.noteLine} strokeWidth={4} />
            </g>
          ))}
        </g>
        <g transform="translate(1660 790)">
          {[0, 1].map((k) => {
            const tt = ((f + k * 20) % 40) / 40;
            return <path key={k} d={`M ${-14 + k * 22} ${-70 - tt * 70} q 14 -20 0 -40 q -14 -20 0 -40`} fill="none" stroke={KRP.white}
              strokeWidth={5} strokeLinecap="round" opacity={0.6 * (1 - tt)} />;
          })}
          <path d="M 54 -46 Q 92 -40 88 -10 Q 84 14 50 12" fill="none" stroke={C.ink} strokeWidth={14} />
          <path d="M 54 -46 Q 92 -40 88 -10 Q 84 14 50 12" fill="none" stroke={C.mug} strokeWidth={6} />
          <path d="M -56 -64 L 56 -64 L 48 36 Q 0 50 -48 36 Z" fill={C.mug} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
          <ellipse cx={0} cy={-64} rx={56} ry={13} fill={C.coffee} stroke={C.ink} strokeWidth={4.5} />
        </g>
        {/* 暗がり (スタンドの外は沈む) */}
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill="url(#l5a185dark)" />
        <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={C.nightDeep} opacity={0.55 * (1 - on)} />
        {/* 灯の周りを飛ぶ羽虫 */}
        <circle cx={490 + Math.cos(f / 5) * 90} cy={300 + Math.sin(f / 4) * 40} r={4} fill={C.ink} opacity={on} />
      </g>
    </Frame>
  );
};

// ---- 文#186 【並】 まずは、体のほうから見ていきましょう。
// 設計: 第9章と同じ「道しるべ」の看板 (矢印「体を守る」「手を守る」「心を落ち着かせる」)。「体を守る」が光る
// どこ: #167/#172 と同じ春の野原の分かれ道。左の先に病院、右の先に家。真ん中に3本矢印の道しるべ。
// 演出: 上の矢印「体を守る」だけが金色に灯る。旅の人がそれを指さしてうなずき、左の病院へ向かう道に光の点々が伸びる (=これから体の話)。
// 動き: f8〜20 矢印が灯る・f14〜 旅の人が驚き→笑顔で指さす・f18〜38 病院への道に光の点が順に灯る・雲と草がゆれる・カメラは上の矢印へ寄る。
const Yw186: React.FC<{ f: number }> = ({ f }) => {
  const top = seg(f, 8, 20);
  const z = lerp(1.0, 1.1, easeInOut(seg(f, 2, 42)));
  const trail = seg(f, 18, 38);
  const point = f >= 14;
  return (
    <Frame f={f} seed={3186} bg={C.sky}>
      <g transform={cam(760, 420, z)}>
        <L5aSignpost f={f} top={top} hand={1}>
          {/* 病院への道に灯る光の点々 */}
          {Array.from({ length: 9 }, (_, i) => {
            const u = i / 8;
            const v = clamp01(trail * 9 - i);
            return (
              <g key={i} opacity={v}>
                <circle cx={lerp(900, 380, u)} cy={lerp(700, 596, u)} r={16 - u * 6} fill={YP.glow} opacity={0.6} />
                <circle cx={lerp(900, 380, u)} cy={lerp(700, 596, u)} r={7 - u * 2} fill={YP.glowCore} />
              </g>
            );
          })}
          {/* 灯った瞬間のきらめき */}
          {top > 0.6 && [[520, 200], [1040, 210], [500, 380], [1030, 372]].map(([sx, sy], i) => {
            const k = 0.7 + Math.sin(f / 3 + i * 1.7) * 0.3;
            return (
              <path key={i} transform={`translate(${sx} ${sy}) scale(${k})`} d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z"
                fill={YP.glowCore} stroke={YP.brassDark} strokeWidth={3} />
            );
          })}
          <ellipse cx={1500} cy={884} rx={90} ry={14} fill={C.ink} opacity={0.18} />
          {/* 旅の人の杖 */}
          <line x1={1572} y1={700} x2={1600} y2={884} stroke={YP.woodDark} strokeWidth={10} strokeLinecap="round" />
          <Person x={1500} y={880} s={1.15} f={f} phase={5} face={point ? "joy" : "surprised"} gaze={[-6, -6]}
            pose={point ? "point" : "stand"} pointDir={-1} cloth={C.knit} clothDark={C.knitDark} hair="cap" />
        </L5aSignpost>
      </g>
    </Frame>
  );
};

// ---- 文#187 【山】 病院で長く寝ている人にとって、こわいのが、床ずれです。
// 設計: 病院の病室 (窓・カーテン・点滴スタンド・ベッドの柵・見舞いの花)。ベッドで寝ている年配の人。看護師が体の向きを変えるために手を添える。札「床ずれ」
// どこ: 昼の病院の個室。左に窓 (青空と木)・ベッドの頭の壁に医療ガスの差し込み口・点滴スタンド・右にサイドテーブルと見舞いの花・右端に仕切りのカーテン。
// 演出: 長く寝ている年配の人のお尻のあたりに、薄い赤の「危ない場所」の輪がじわっと浮かぶ。手前の看護師がそっと体に両手を添えて向きを変える (回転の矢印)。札「床ずれ」。
// 動き: f6〜24 赤い輪がじわっと濃くなる・f12〜34 看護師が手を添え体がわずかに起きる・回転の矢印が描かれる・カーテンと点滴のしずくが動く・カメラは寄る。
const L5aRoom: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {/* 壁と幅木 */}
    <rect x={-80} y={-80} width={W + 160} height={860} fill={C.hospWall} />
    <rect x={-80} y={360} width={W + 160} height={14} fill={C.hospWallDark} />
    <rect x={-80} y={750} width={W + 160} height={30} fill={C.hospWallDark} stroke={C.ink} strokeWidth={4} />
    {/* 天井のカーテンレール */}
    <rect x={-80} y={34} width={W + 160} height={12} fill={C.bedFrameDark} stroke={C.ink} strokeWidth={3} />
    {/* 窓 */}
    <rect x={90} y={110} width={360} height={400} rx={6} fill={C.winSky} stroke={C.ink} strokeWidth={7} />
    <path d="M 96 420 Q 160 330 250 380 Q 330 300 444 360 L 444 504 L 96 504 Z" fill={C.tree} />
    <circle cx={180} cy={360} r={56} fill={C.tree} stroke={C.treeDark} strokeWidth={4} />
    <circle cx={330} cy={330} r={66} fill={C.tree} stroke={C.treeDark} strokeWidth={4} />
    <L5aCloud x={230 + f * 0.6} y={190} s={0.6} />
    <line x1={270} y1={110} x2={270} y2={510} stroke={C.ink} strokeWidth={6} />
    <rect x={80} y={506} width={380} height={18} fill={KRP.white} stroke={C.ink} strokeWidth={4} />
    {/* 窓のカーテン (たばねて右に) */}
    <path d={`M 450 46 Q 480 200 ${468 + Math.sin(f / 9) * 6} 330 Q 500 460 ${480 + Math.sin(f / 9) * 8} 560 L 560 560 Q 540 400 556 46 Z`}
      fill={C.curtain} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 490 60 Q 510 300 510 550 M 528 60 Q 530 300 536 550" fill="none" stroke={C.curtainDark} strokeWidth={4} />
    {/* 医療ガスの差し込み口とナースコール */}
    <rect x={640} y={250} width={260} height={70} rx={8} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
    {[680, 740, 800].map((cx, i) => (
      <g key={cx}>
        <circle cx={cx} cy={285} r={16} fill={[KRP.green, KRP.blue, KRP.yellow][i]} stroke={C.ink} strokeWidth={3.5} />
        <circle cx={cx} cy={285} r={5} fill={C.ink} />
      </g>
    ))}
    <rect x={840} y={268} width={36} height={34} rx={6} fill={KRP.red} stroke={C.ink} strokeWidth={3.5} />
    <path d="M 858 302 Q 870 420 830 520" fill="none" stroke={C.bedFrameDark} strokeWidth={5} />
    {/* 点滴スタンド */}
    <line x1={560} y1={150} x2={560} y2={860} stroke={C.bedFrameDark} strokeWidth={9} />
    <line x1={520} y1={150} x2={600} y2={150} stroke={C.bedFrameDark} strokeWidth={7} strokeLinecap="round" />
    <path d="M 512 168 L 548 168 L 552 270 Q 530 290 508 270 Z" fill={C.ivBag} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
    <rect x={518} y={218} width={26} height={30} fill={KRP.white} stroke={C.ink} strokeWidth={2.5} />
    <rect x={524} y={290} width={12} height={26} rx={3} fill={C.ivBag} stroke={C.ink} strokeWidth={3} />
    <circle cx={530} cy={300 + ((f * 1.2) % 14)} r={3.5} fill={KRP.blue} />
    <path d="M 530 316 Q 520 420 600 470 Q 660 500 700 520" fill="none" stroke={C.bedFrameDark} strokeWidth={3.5} />
    {[-1, 1].map((d) => <line key={d} x1={560} y1={860} x2={560 + d * 60} y2={880} stroke={C.bedFrameDark} strokeWidth={7} strokeLinecap="round" />)}
    {/* 床 */}
    <rect x={-80} y={780} width={W + 160} height={400} fill={C.hospFloor} />
    {Array.from({ length: 7 }, (_, i) => (
      <line key={i} x1={-80} y1={800 + i * 46} x2={W + 80} y2={800 + i * 46} stroke={C.hospFloorLine} strokeWidth={3} />
    ))}
    {/* サイドテーブルと見舞いの花 */}
    <rect x={1600} y={600} width={180} height={240} rx={6} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
    <rect x={1618} y={660} width={144} height={60} rx={4} fill="none" stroke={C.ink} strokeWidth={3.5} />
    <circle cx={1690} cy={690} r={6} fill={C.ink} />
    <path d="M 1660 600 L 1654 520 Q 1690 500 1726 520 L 1720 600 Z" fill={C.vase} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" />
    {[[-40, -110, C.flower1], [0, -140, C.flower2], [40, -108, C.flower1], [-14, -90, C.flower2], [22, -84, KRP.white]].map(([dx, dy, col], i) => {
      const sw = Math.sin(f / 11 + i) * 3;
      return (
        <g key={i}>
          <line x1={1690} y1={520} x2={1690 + (dx as number) + sw} y2={500 + (dy as number) + 30} stroke={C.leaf} strokeWidth={4} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={1690 + (dx as number) + sw} cy={500 + (dy as number) + 20} rx={9} ry={17} fill={col as string} stroke={C.ink} strokeWidth={2.5}
              transform={`rotate(${a} ${1690 + (dx as number) + sw} ${500 + (dy as number) + 30})`} />
          ))}
          <circle cx={1690 + (dx as number) + sw} cy={500 + (dy as number) + 30} r={6} fill={KRP.yellow} stroke={C.ink} strokeWidth={2} />
        </g>
      );
    })}
    <ellipse cx={1640} cy={590} rx={18} ry={8} fill={KRP.red} stroke={C.ink} strokeWidth={3} />
    {/* 右端の仕切りカーテン */}
    <path d={`M 1800 46 L 1990 46 L 1990 900 L ${1806 + Math.sin(f / 10) * 5} 900 Q 1780 500 1800 46 Z`} fill={C.curtain} stroke={C.ink} strokeWidth={5} />
    {[1840, 1880, 1920].map((x) => <line key={x} x1={x} y1={50} x2={x + Math.sin(f / 10) * 3} y2={896} stroke={C.curtainDark} strokeWidth={4} />)}
  </g>
);
// ベッドの枠 (頭板・足板・車輪)。mattressTop より下は front で描く
const L5aBedFrame: React.FC<{ x0: number; x1: number; top: number }> = ({ x0, x1, top }) => (
  <g>
    <rect x={x0 - 40} y={top - 190} width={44} height={320} rx={10} fill={C.bedFrame} stroke={C.ink} strokeWidth={6} />
    <rect x={x1 - 4} y={top - 100} width={44} height={230} rx={10} fill={C.bedFrame} stroke={C.ink} strokeWidth={6} />
  </g>
);
const L5aBedBase: React.FC<{ x0: number; x1: number; y: number }> = ({ x0, x1, y }) => (
  <g>
    <rect x={x0 - 20} y={y} width={x1 - x0 + 40} height={46} rx={6} fill={C.bedFrame} stroke={C.ink} strokeWidth={6} />
    <rect x={x0 + 40} y={y + 46} width={x1 - x0 - 80} height={40} fill={C.bedFrameDark} stroke={C.ink} strokeWidth={4} opacity={0.8} />
    {[x0 + 30, x1 - 30].map((wx) => (
      <g key={wx}>
        <line x1={wx} y1={y + 46} x2={wx} y2={y + 116} stroke={C.ink} strokeWidth={8} />
        <circle cx={wx} cy={y + 126} r={18} fill={C.bedFrameDark} stroke={C.ink} strokeWidth={5} />
      </g>
    ))}
  </g>
);
const Yw187: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.07, easeInOut(seg(f, 0, 42)));
  const risk = seg(f, 6, 24);
  const reach = easeOut(seg(f, 8, 20));
  const turn = easeInOut(seg(f, 14, 34));
  const arc = seg(f, 18, 36);
  const ox = 1090, top = 640, s = 1.5;
  const oy = top - 58 * s + 8 - turn * 10;
  const hipX = ox - 60 * s, hipY = top - 6;
  // 回転の矢印 (体のまわりの楕円の弧)
  const arcPts: number[][] = Array.from({ length: 24 }, (_, i) => {
    const a = Math.PI * (0.15 + 1.1 * (i / 23) * arc);
    return [ox - 150 * s + Math.cos(a) * 190, oy - 10 - Math.sin(a) * 120];
  });
  return (
    <Frame f={f} seed={3187} bg={C.hospWall}>
      <g transform={cam(900, 560, z)}>
        <L5aRoom f={f} />
        <L5aBedFrame x0={620} x1={1360} top={top} />
        {/* マットレスとシーツ */}
        <rect x={620} y={top} width={740} height={62} rx={14} fill={C.sheet} stroke={C.ink} strokeWidth={6} />
        {/* 枕 */}
        <path d={`M 640 ${top + 4} Q 630 ${top - 60} 700 ${top - 66} Q 790 ${top - 72} 840 ${top - 56} Q 870 ${top - 30} 856 ${top + 4} Z`}
          fill={KRP.white} stroke={C.ink} strokeWidth={5} />
        {/* 危ない場所 (お尻の下) */}
        <ellipse cx={hipX} cy={hipY} rx={70 + Math.sin(f / 4) * 4} ry={26} fill={KRP.red} opacity={0.32 * risk} />
        <ellipse cx={hipX} cy={hipY} rx={70} ry={26} fill="none" stroke={KRP.red} strokeWidth={5} strokeDasharray="12 9" opacity={risk} />
        <L5aLying ox={ox} oy={oy} s={s} f={f} face={turn > 0.5 ? "smile" : "normal"} tilt={turn * 4} elder />
        {/* 掛け布団 (脚の上) */}
        <path d={`M 1000 ${top + 10} Q 1004 ${top - 120} 1080 ${top - 128} Q 1250 ${top - 120} 1330 ${top - 80} Q 1372 ${top - 20} 1366 ${top + 60} L 1000 ${top + 60} Z`}
          fill={C.blanket} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M 1060 ${top - 80} Q 1160 ${top - 70} 1300 ${top - 50} M 1040 ${top + 10} Q 1200 ${top} 1340 ${top + 14}`} fill="none" stroke={C.blanketDark} strokeWidth={4} />
        <L5aBedBase x0={620} x1={1360} y={top + 62} />
        {/* 下ろした柵 (頭の側) */}
        <rect x={660} y={top + 74} width={280} height={18} rx={9} fill={C.bedFrameDark} stroke={C.ink} strokeWidth={4} />
        {[700, 780, 860].map((x) => <line key={x} x1={x} y1={top + 92} x2={x} y2={top + 120} stroke={C.ink} strokeWidth={5} />)}
        {/* 回転の矢印 */}
        {arc > 0.02 && (
          <g>
            <path d={L5aPathD(arcPts)} fill="none" stroke={KRP.blueDeep} strokeWidth={9} strokeLinecap="round" />
            {arc > 0.9 && (() => {
              const a = arcPts[arcPts.length - 1], b = arcPts[arcPts.length - 3];
              const ang = (Math.atan2(a[1] - b[1], a[0] - b[0]) * 180) / Math.PI;
              return <polygon points="0,0 -26,-16 -26,16" fill={KRP.blueDeep} transform={`translate(${a[0]} ${a[1]}) rotate(${ang})`} />;
            })()}
          </g>
        )}
        {/* 看護師 (手前。両手を腰と背中に添える) */}
        <ellipse cx={1170} cy={872} rx={80} ry={12} fill={C.ink} opacity={0.15} />
        <Person x={1170} y={870} s={1.25} f={f} phase={3} face="smile" gaze={[-7, -4]} lean={-6}
          cloth={KRP.white} clothDark={C.scrubDark} hair="cap" pose="hold" />
        {/* 胸の前の手から、そっと前へ伸ばす前腕 */}
        <L5aLimb pts={[[1152, 722], [lerp(1152, hipX + 40, reach), lerp(722, top - 30, reach)]]} w={24} fill={KRP.white} />
        <L5aLimb pts={[[1186, 722], [lerp(1186, ox - 140 * s + 80, reach), lerp(722, top - 60, reach)]]} w={24} fill={KRP.white} />
        {/* 名札 */}
        <rect x={1196} y={712} width={30} height={20} rx={3} fill={KRP.blue} stroke={C.ink} strokeWidth={3} />
        <TagPlate x={960} y={200} text="床ずれ" size={64} t={seg(f, 4, 14)} />
        <line x1={960} y1={256} x2={hipX} y2={hipY - 40} stroke={KRP.red} strokeWidth={4} strokeDasharray="10 8" opacity={risk} />
      </g>
    </Frame>
  );
};

// ---- 文#188 【図】 体の同じところに、ずっと圧がかかりつづけると、皮膚が傷ついてしまいます。
// 設計: 寝ている人の横からの断面図 (世界=病院の説明パネル)。かかと・お尻・肩甲骨の3か所に、下からの赤い圧の矢印が集中して f で強くなる。札「圧が集まる」。皮膚の傷は描かない (赤い円で場所を示すだけ)
// どこ: 病院の廊下の壁 (手すり・掲示の画びょう) に掛かった、大きな説明パネル。パネルの中に、寝ている人の横からの図と、硬く平らな寝台の断面 (斜線)。
// 演出: 体が平らな面に触れているのは3か所だけ。肩甲骨・お尻・かかとに、下から赤い圧の矢印が突き上げ、f でどんどん太く長くなる。当たっている場所に赤い輪が脈打つ。寝ている人の顔は困り顔に。札「圧が集まる」。
// 動き: f6〜36 矢印が太く伸びる・赤い輪が脈打つ・f20〜 困り顔・カメラはゆっくり寄る。
const L5aPanel: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    {/* 廊下の壁 */}
    <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.corridor} />
    <rect x={-80} y={880} width={W + 160} height={300} fill={C.corridorDark} />
    {Array.from({ length: 10 }, (_, i) => (
      <line key={i} x1={i * 220 - 40} y1={-80} x2={i * 220 - 40} y2={880} stroke={C.corridorDark} strokeWidth={3} opacity={0.6} />
    ))}
    {/* 手すり */}
    <rect x={-80} y={846} width={W + 160} height={22} rx={11} fill={C.rail} stroke={C.ink} strokeWidth={5} />
    {[200, 900, 1600].map((x) => <rect key={x} x={x} y={866} width={20} height={30} fill={C.railDark} stroke={C.ink} strokeWidth={3} />)}
    {/* パネル */}
    <rect x={150} y={96} width={1620} height={720} rx={14} fill={C.panelFrame} stroke={C.ink} strokeWidth={7} />
    <rect x={176} y={122} width={1568} height={668} rx={8} fill={C.panelBg} stroke={C.ink} strokeWidth={4} />
    {/* 病院の印 */}
    <g transform="translate(240 186)">
      <circle r={42} fill={KRP.green} stroke={C.ink} strokeWidth={4} />
      <rect x={-10} y={-28} width={20} height={56} fill={KRP.white} />
      <rect x={-28} y={-10} width={56} height={20} fill={KRP.white} />
    </g>
    <rect x={1560} y={150} width={150} height={16} rx={8} fill={C.hardLine} opacity={0.5} />
    <rect x={1600} y={180} width={110} height={16} rx={8} fill={C.hardLine} opacity={0.5} />
    {/* 画びょう */}
    {[[170, 116], [1750, 116], [170, 796], [1750, 796]].map(([px, py], i) => (
      <circle key={i} cx={px} cy={py} r={11} fill={[KRP.red, KRP.blue, KRP.yellow, KRP.green][i]} stroke={C.ink} strokeWidth={3.5} />
    ))}
    {/* ほかの掲示 (パネルの外) */}
    <rect x={1800} y={300} width={140} height={200} rx={4} fill={KRP.white} stroke={C.ink} strokeWidth={4} transform={`rotate(${3 + Math.sin(f / 20)} 1870 300)`} />
    {children}
  </g>
);
// パネル図の寝ている人の配置
const P_OX = 1290, P_OY = 452, P_S = 2.3;
const P_TOP = P_OY + 58 * P_S; // 平らな寝台の上面 (=胴の下面)
const Yw188: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.05, easeInOut(seg(f, 0, 42)));
  const grow = easeOut(seg(f, 6, 36));
  const pts = [
    { x: P_OX - 140 * P_S, name: "肩甲骨", cy: P_TOP },
    { x: P_OX - 62 * P_S, name: "お尻", cy: P_TOP },
    { x: P_OX - 12 * P_S, name: "かかと", cy: P_OY - 6 + 38 * P_S },
  ];
  return (
    <Frame f={f} seed={3188} bg={C.corridor}>
      <g transform={cam(960, 460, z)}>
        <L5aPanel f={f}>
          {/* 平らな硬い寝台 (断面の斜線) */}
          <rect x={360} y={P_TOP} width={1200} height={90} fill={C.hard} stroke={C.ink} strokeWidth={6} />
          <g stroke={C.hardLine} strokeWidth={4}>
            {Array.from({ length: 30 }, (_, i) => <line key={i} x1={370 + i * 40} y1={P_TOP + 86} x2={410 + i * 40} y2={P_TOP + 4} />)}
          </g>
          {/* 枕 (頭の下) */}
          <path d={`M 560 ${P_TOP} Q 556 ${P_TOP - 30} 610 ${P_TOP - 34} L 800 ${P_TOP - 34} Q 840 ${P_TOP - 30} 836 ${P_TOP} Z`} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
          <L5aLying ox={P_OX} oy={P_OY - 6} s={P_S} f={f} face={f > 20 ? "worried" : "normal"} />
          {/* 圧の矢印と赤い輪 */}
          {pts.map((p, i) => {
            const len = 40 + grow * 110;
            const w = 18 + grow * 26;
            const y0 = p.cy + 4;
            const pulse = 1 + Math.sin(f / 3 + i) * 0.12 * grow;
            return (
              <g key={i}>
                <ellipse cx={p.x} cy={p.cy - 6} rx={(34 + grow * 20) * pulse} ry={16 * pulse} fill={KRP.red} opacity={0.25 + 0.3 * grow} />
                <ellipse cx={p.x} cy={p.cy - 6} rx={(34 + grow * 20) * pulse} ry={16 * pulse} fill="none" stroke={KRP.red} strokeWidth={5} />
                <polygon points={`${p.x},${y0} ${p.x - w},${y0 + w * 0.9} ${p.x - w * 0.45},${y0 + w * 0.9} ${p.x - w * 0.45},${y0 + len} ${p.x + w * 0.45},${y0 + len} ${p.x + w * 0.45},${y0 + w * 0.9} ${p.x + w},${y0 + w * 0.9}`}
                  fill={KRP.red} stroke={C.ink} strokeWidth={4.5} strokeLinejoin="round" opacity={0.95} />
                <text x={p.x} y={P_TOP + 196} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>{p.name}</text>
              </g>
            );
          })}
          <TagPlate x={960} y={200} text="圧が集まる" size={58} t={seg(f, 4, 14)} color={KRP.red} />
        </L5aPanel>
      </g>
    </Frame>
  );
};

// ---- 文#189 【山】 そこで使われるのが、体の形にそって沈む、高機能のマットレスです。
// 設計: 同じ病室。高機能のマットレス (厚みのある・格子状の切れ込みが入ったウレタン) に人が寝ると、体の形に沿ってゆっくり沈む (f で)。看護師がうなずく
// どこ: #187 と同じ病室 (同じ場所の続き)。ベッドの上が、厚みがあって格子の切れ込みが入った黄色いウレタンの高機能マットレスに替わっている。
// 演出: 年配の人の体が、体の形にそってゆっくりマットレスに沈んでいく。体の下の格子のマス目だけがぎゅっと縮み、まわりは平らなまま。人の顔がほっとゆるむ (ほわほわの線)。足元側の看護師がクリップボードを持ってうなずく。
// 動き: f4〜32 ゆっくり沈む・体の下のマス目が縮む・f20〜 ほっとした顔とほわほわ線・看護師は f でうなずく (前かがみの揺れ)・カメラはマットレスに寄る。
const Yw189: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.08, easeInOut(seg(f, 0, 42)));
  const sink = easeInOut(seg(f, 4, 32));
  const relax = seg(f, 20, 34);
  const top = 610, bot = 744, x0 = 620, x1 = 1360, s = 1.5, ox = 1090;
  const oy = top - 58 * s + 4 + sink * 46;
  const fit = L5aFitPts(ox, oy, s, 0);
  const depthAt = (x: number) => {
    if (x > fit[0][0] + 6 || x < fit[fit.length - 1][0] - 6) return 0;
    let best = fit[0];
    for (const p of fit) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
    return clamp01((best[1] - top) / 60) * 60;
  };
  const cols = 14;
  const cw = (x1 - x0) / cols;
  const nod = Math.max(0, Math.sin(f / 5)) * 7;
  return (
    <Frame f={f} seed={3189} bg={C.hospWall}>
      <g transform={cam(960, 600, z)}>
        <L5aRoom f={f} />
        <L5aBedFrame x0={x0} x1={x1} top={top} />
        {/* マットレスの上面 (奥の面)。体の下はくぼむ */}
        <path d={`M ${x0} ${top} L ${x1} ${top} L ${x1} ${top + 30} L ${x0} ${top + 30} Z`} fill={C.foamDark} stroke={C.ink} strokeWidth={5} />
        {/* 点滴の管は人の手元へ */}
        <L5aLying ox={ox} oy={oy} s={s} f={f} face={relax > 0.3 ? "smile" : "normal"} elder />
        {/* 手前の面: 格子の切れ込みのブロック。体の下ほど縮む */}
        {Array.from({ length: cols }, (_, i) => {
          const cx = x0 + cw * (i + 0.5);
          const d = depthAt(cx);
          const yt = top + d * 0.45;
          return (
            <g key={i}>
              <rect x={x0 + cw * i} y={yt} width={cw} height={bot - yt} fill={C.foam} stroke={C.ink} strokeWidth={4.5} />
              {[1, 2].map((r) => {
                const yy = yt + ((bot - yt) * r) / 3;
                return <line key={r} x1={x0 + cw * i + 6} y1={yy} x2={x0 + cw * (i + 1) - 6} y2={yy} stroke={C.foamCut} strokeWidth={3.5} />;
              })}
              <circle cx={cx - 10} cy={yt + (bot - yt) * 0.18} r={2.5} fill={C.foamDark} />
              <circle cx={cx + 12} cy={yt + (bot - yt) * 0.55} r={2.5} fill={C.foamDark} />
            </g>
          );
        })}
        {/* マットレスの外枠 (厚み) */}
        <rect x={x0} y={top - 4} width={x1 - x0} height={bot - top + 4} rx={12} fill="none" stroke={C.ink} strokeWidth={6} />
        <L5aBedBase x0={x0} x1={x1} y={bot} />
        {/* ほわほわの線 (ほっとした) */}
        {relax > 0 && [0, 1, 2].map((k) => {
          const hx = ox - 228 * s, hy = oy - 140;
          const tt = ((f + k * 9) % 27) / 27;
          return <path key={k} d={`M ${hx - 40 + k * 40} ${hy - tt * 50} q 10 -12 0 -24 q -10 -12 0 -24`} fill="none" stroke={KRP.blue}
            strokeWidth={5} strokeLinecap="round" opacity={relax * (1 - tt)} />;
        })}
        {/* 沈みの矢印 (体の上から下へ、小さく) */}
        <g opacity={1 - seg(f, 30, 40)}>
          {[ox - 150 * s, ox - 60 * s].map((ax) => (
            <Arrow key={ax} x={ax} y={oy - 70 * s + 10} s={0.45} rot={90} t={seg(f, 4, 10)} color={KRP.orange} />
          ))}
        </g>
        {/* 看護師 (足元側) */}
        <ellipse cx={1500} cy={912} rx={80} ry={12} fill={C.ink} opacity={0.15} />
        <Person x={1500} y={910} s={1.2} f={f} phase={2} face="smile" gaze={[-8, 4]} lean={-nod}
          cloth={KRP.white} clothDark={C.scrubDark} hair="cap" pose="hold" />
        <g transform={`rotate(${-nod} 1500 910)`}>
          <rect x={1460} y={910 - 160} width={80} height={104} rx={6} fill={C.clip} stroke={C.ink} strokeWidth={4.5} />
          <rect x={1470} y={910 - 146} width={60} height={84} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          <rect x={1484} y={910 - 168} width={32} height={16} rx={4} fill={C.bedFrameDark} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2].map((r) => <line key={r} x1={1478} y1={910 - 130 + r * 20} x2={1522} y2={910 - 130 + r * 20} stroke={C.noteLine} strokeWidth={4} />)}
        </g>
        {/* うなずきの線 */}
        {nod > 3 && (
          <g stroke={C.ink} strokeWidth={4} strokeLinecap="round">
            <line x1={1400} y1={910 - 330} x2={1384} y2={910 - 350} />
            <line x1={1392} y1={910 - 300} x2={1370} y2={910 - 306} />
          </g>
        )}
        <TagPlate x={960} y={210} text="高機能マットレス" size={54} t={seg(f, 2, 12)} />
      </g>
    </Frame>
  );
};

// ---- 文#190 【図】 体と触れる面積が広がると、圧が一か所に集まりません。
// 設計: #188 と同じ断面図の続き。今度は体の下に沿ったマットレス。赤い矢印が細かく分かれて体の下全体に散らばる (f で分裂)。札「圧が散らばる」
// どこ: #188 と同じ廊下の説明パネル (同じ場所の続き)。今度は寝台が、体の形にそって沈む厚いマットレス (格子の切れ込み入り) に変わっている。
// 演出: 最初は #188 の太い赤い矢印が3本。それが f でパッと13本の細い矢印に分かれ、体の下全体に散らばる。色も赤から薄い桃色へ。困り顔の人がほっとした顔に。札「圧が散らばる」。
// 動き: f4〜10 太い矢印3本・f10〜30 分裂して散らばる・f24〜 体の下に沿って薄い帯が灯る・f26〜 笑顔・カメラは寄る。
const Yw190: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.05, easeInOut(seg(f, 0, 42)));
  const split = easeInOut(seg(f, 10, 30));
  const band = seg(f, 24, 38);
  const oy = P_OY + 22;
  const fit = L5aFitPts(P_OX, oy, P_S, 0);
  const flatY = oy + 58 * P_S - 34;
  const surf = (x: number) => {
    if (x > fit[0][0] || x < fit[fit.length - 1][0]) return flatY;
    let best = fit[0];
    for (const p of fit) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
    return Math.max(best[1], flatY - 70);
  };
  const xs: number[] = [];
  for (let x = 360; x <= 1560; x += 12) xs.push(x);
  const topPts = xs.map((x) => [x, surf(x)]);
  const bottom = flatY + 150;
  const parents = [P_OX - 140 * P_S, P_OX - 62 * P_S, P_OX - 12 * P_S];
  const smalls = Array.from({ length: 13 }, (_, i) => lerp(700, 1300, i / 12));
  return (
    <Frame f={f} seed={3190} bg={C.corridor}>
      <g transform={cam(960, 460, z)}>
        <L5aPanel f={f}>
          {/* 体にそうマットレス (断面) */}
          <path d={`${L5aPathD(topPts)} L 1560 ${bottom} L 360 ${bottom} Z`} fill={C.foam} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* 格子の切れ込み (上の面にそって縦の切れ込み) */}
          <g stroke={C.foamCut} strokeWidth={4}>
            {xs.filter((_, i) => i % 5 === 2).map((x) => <line key={x} x1={x} y1={surf(x) + 10} x2={x} y2={bottom - 50} />)}
            <line x1={364} y1={bottom - 50} x2={1556} y2={bottom - 50} />
          </g>
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={380 + rnd(1901, i) * 1160} cy={bottom - 30 + rnd(1902, i) * 20} r={3} fill={C.foamDark} />
          ))}
          <L5aLying ox={P_OX} oy={oy} s={P_S} f={f} face={f > 26 ? "smile" : "worried"} />
          {/* 体の下に沿って灯る薄い帯 (圧がならされた) */}
          {band > 0 && <path d={L5aPathD(L5aFitPts(P_OX, oy, P_S, 4).filter((_, i) => i % 1 === 0))} fill="none" stroke={C.softPress} strokeWidth={14} strokeLinecap="round" opacity={0.7 * band} />}
          {/* 矢印: 3本 → 13本に分かれる */}
          {smalls.map((sx, i) => {
            const par = parents.reduce((a, b) => (Math.abs(b - sx) < Math.abs(a - sx) ? b : a), parents[0]);
            const x = lerp(par, sx, split);
            const w = lerp(40, 13, split);
            const len = lerp(140, 70, split);
            const y0 = surf(x) + 6;
            const col = split > 0.5 ? C.softPress : KRP.red;
            const show = split > 0.02 || Math.abs(sx - par) === Math.min(...smalls.map((q) => Math.abs(q - par)));
            if (!show) return null;
            return (
              <polygon key={i} points={`${x},${y0} ${x - w},${y0 + w * 0.9} ${x - w * 0.45},${y0 + w * 0.9} ${x - w * 0.45},${y0 + len} ${x + w * 0.45},${y0 + len} ${x + w * 0.45},${y0 + w * 0.9} ${x + w},${y0 + w * 0.9}`}
                fill={col} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
            );
          })}
          {/* 分かれた瞬間のはじけ線 */}
          {split > 0.05 && split < 0.7 && parents.map((px, i) => (
            <g key={i} stroke={KRP.red} strokeWidth={4} strokeLinecap="round" opacity={1 - split}>
              {[-50, -20, 20, 50].map((dx) => <line key={dx} x1={px + dx * 0.6} y1={flatY + 90} x2={px + dx * 1.4} y2={flatY + 120} />)}
            </g>
          ))}
          <TagPlate x={960} y={200} text="圧が散らばる" size={58} t={seg(f, 20, 30)} color={KRP.green} />
        </L5aPanel>
      </g>
    </Frame>
  );
};

// ---- 文#191 【並】 世界中の研究をまとめた報告では、ふつうのマットレスより、床ずれがおよそ6割少なくなりました。
// 設計: 研究まとめの報告書の表紙 (世界=机の上の報告書と眼鏡)。報告書の中の棒グラフ: 「ふつう」の棒と「高機能」の棒、高機能の方が f で縮んで短くなる。札「約6割 少ない」
// どこ: 明るい机の上 (真上から)。紺の表紙を開いた分厚い報告書 (世界中の研究のまとめ)。左ページに地球の印と研究の束、右ページに棒グラフ。そばに読書眼鏡・付せん・鉛筆・コーヒーの輪じみ。
// 演出: 右ページのグラフ。「ふつう」の灰色の棒と「高機能」の緑の棒が同じ高さで立っていて、高機能の棒だけが f でぐっと縮む (元の高さは点線で残る)。縮んだ分に下向きの矢印。研究者の指がグラフを指す。札「約6割 少ない」。
// 動き: f8〜30 緑の棒が縮む・f22〜 下向き矢印と点線・f30〜 札・眼鏡のつるがわずかに揺れる・カメラはグラフへ寄る。
const Yw191: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.1, easeInOut(seg(f, 0, 42)));
  const shrink = easeInOut(seg(f, 8, 30));
  const base = 700, full = 380;
  const hHigh = lerp(full, full * 0.4, shrink);
  const arrowT = seg(f, 22, 30);
  return (
    <Frame f={f} seed={3191} bg={C.deskWood}>
      <g transform={cam(1180, 500, z)}>
        {/* 机の木目 */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.deskWood} />
        <g stroke={C.deskWoodDark} strokeWidth={5} opacity={0.5}>
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M -80 ${40 + i * 150} q 500 ${rnd(1911, i) * 36 - 18} 1000 0 q 500 ${rnd(1912, i) * 36 - 18} 1080 0`} fill="none" />
          ))}
        </g>
        {/* コーヒーの輪じみ */}
        <circle cx={1760} cy={160} r={70} fill="none" stroke={C.deskWoodDark} strokeWidth={8} opacity={0.5} />
        {/* 報告書 (見開き) */}
        <g transform="rotate(-1.5 960 520)">
          <rect x={210} y={110} width={1520} height={800} rx={16} fill={C.reportCoverDark} stroke={C.ink} strokeWidth={7} />
          <rect x={236} y={126} width={730} height={770} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={5} />
          <rect x={974} y={126} width={730} height={770} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={5} />
          <line x1={970} y1={126} x2={970} y2={896} stroke={C.ink} strokeWidth={6} />
          {/* 左ページ: 地球の印と、まとめた研究の束 */}
          <text x={600} y={210} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.reportCover}>研究のまとめ</text>
          <g transform="translate(600 400)">
            <circle r={110} fill={KRP.blueSoft} stroke={C.ink} strokeWidth={5} />
            <path d="M -70 -50 Q -30 -80 10 -60 Q 30 -30 0 0 Q -40 10 -60 -20 Z M 20 20 Q 60 0 80 30 Q 70 70 30 80 Q 10 50 20 20 Z" fill={KRP.green} stroke={C.ink} strokeWidth={3.5} />
            <ellipse rx={110} ry={40} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
            <line x1={0} y1={-110} x2={0} y2={110} stroke={C.ink} strokeWidth={3} opacity={0.5} />
          </g>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={`translate(${330 + i * 74} ${640 + (i % 2) * 8}) rotate(${(i - 3) * 3})`}>
              <rect x={-30} y={-40} width={60} height={80} rx={3} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
              {[0, 1, 2].map((r) => <line key={r} x1={-20} y1={-22 + r * 18} x2={20} y2={-22 + r * 18} stroke={C.noteLine} strokeWidth={3} />)}
            </g>
          ))}
          <path d="M 330 720 Q 600 760 870 720" fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="10 8" />
          <Arrow x={600} y={800} s={0.5} rot={90} color={C.reportCover} />
          {/* 右ページ: 棒グラフ */}
          <line x1={1060} y1={base} x2={1640} y2={base} stroke={C.ink} strokeWidth={6} />
          <line x1={1060} y1={base} x2={1060} y2={base - full - 60} stroke={C.ink} strokeWidth={6} />
          {[1, 2, 3].map((k) => <line key={k} x1={1060} y1={base - (full / 3) * k} x2={1640} y2={base - (full / 3) * k} stroke={C.noteLine} strokeWidth={3} strokeDasharray="8 8" />)}
          <rect x={1140} y={base - full} width={160} height={full} fill={C.barGray} stroke={C.ink} strokeWidth={5} />
          {/* 高機能: 元の高さの点線と縮んだ棒 */}
          <rect x={1400} y={base - full} width={160} height={full} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="12 10" opacity={shrink} />
          <rect x={1400} y={base - hHigh} width={160} height={hHigh} fill={KRP.green} stroke={C.ink} strokeWidth={5} />
          <text x={1220} y={base + 56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink}>ふつう</text>
          <text x={1480} y={base + 56} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink}>高機能</text>
          <text x={1090} y={base - full - 74} fontFamily={FONT} fontWeight={800} fontSize={28} fill={KRP.grayDark}>床ずれ</text>
          {arrowT > 0 && (
            <g opacity={arrowT}>
              <line x1={1600} y1={base - full + 10} x2={1600} y2={base - hHigh - 30} stroke={KRP.red} strokeWidth={8} />
              <polygon points={`1600,${base - hHigh - 6} 1582,${base - hHigh - 36} 1618,${base - hHigh - 36}`} fill={KRP.red} />
            </g>
          )}
        </g>
        {/* 研究者の指 (右下から) */}
        <L5aLimb pts={[[1980, 1000], [1780, 880], [lerp(1720, 1640, seg(f, 24, 34)), lerp(820, 780, seg(f, 24, 34))]]} w={40} fill={KRP.white} />
        {/* 読書眼鏡 */}
        <g transform={`translate(560 960) rotate(${-8 + Math.sin(f / 10) * 1.5})`}>
          <circle cx={-70} cy={0} r={52} fill={KRP.blueSoft} fillOpacity={0.35} stroke={C.ink} strokeWidth={7} />
          <circle cx={70} cy={0} r={52} fill={KRP.blueSoft} fillOpacity={0.35} stroke={C.ink} strokeWidth={7} />
          <path d="M -18 -6 Q 0 -20 18 -6" fill="none" stroke={C.ink} strokeWidth={7} />
          <path d="M -122 -6 L -210 -40 M 122 -6 L 210 -40" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* 付せんと鉛筆 */}
        <rect x={1630} y={60} width={90} height={90} fill={C.sticky} stroke={C.ink} strokeWidth={4} transform="rotate(6 1675 105)" />
        <g transform="translate(140 300) rotate(70)">
          <rect x={-150} y={-14} width={300} height={28} fill={KRP.yellow} stroke={C.ink} strokeWidth={4.5} />
          <path d="M 150 -14 L 190 0 L 150 14 Z" fill={C.memFoam} stroke={C.ink} strokeWidth={4} />
        </g>
        <TagPlate x={1400} y={260} text="約6割 少ない" size={52} t={seg(f, 28, 38)} color={KRP.red} />
      </g>
    </Frame>
  );
};

// ---- 文#192 【並】 ただし、柔らかければ柔らかいほど、良いわけではありません。
// 設計: 柔らかすぎるマットレスに人がずぶずぶ沈み込み、起き上がれずにじたばた (笑い。顔は困り顔)。赤い `XMark`
// どこ: 朝の寝室。窓から朝焼けの光、カーテン、壁に額。ベッドの上は、マシュマロのようにふくらんだ柔らかすぎるマットレス。サイドテーブルで目覚まし時計が鳴っている。
// 演出: 起きようとした人が、ずぶずぶ沈んで起き上がれない。上体を起こしかけては沈み、両腕をばたばた、足はマットレスから突き出てばたばた。困り顔に汗。右上に赤い×。札「柔らかすぎ」。
// 動き: f0〜30 体がずぶずぶ沈む・上体が起きかけては戻る・腕と足が f でばたばた・目覚ましが震える・f22〜30 ×が出る・カメラは少し引きながら揺れる。
const Yw192: React.FC<{ f: number }> = ({ f }) => {
  const sink = easeOut(seg(f, 0, 30));
  const z = lerp(1.08, 1.0, easeInOut(seg(f, 0, 30)));
  const shake = Math.sin(f * 1.3) * 3 * seg(f, 6, 12);
  const top = 560, s = 1.45, ox = 1240;
  const oy = top - 58 * s + 20 + sink * 96;
  const tilt = 10 + Math.sin(f / 3.2) * 7;
  const flail = Math.sin(f / 2.2);
  const kick = Math.sin(f / 1.8);
  // 手前のふちの上面 (体のまわりが盛り上がる)
  const lip = Array.from({ length: 41 }, (_, i) => {
    const x = 360 + i * 30;
    const bulge = Math.exp(-(((x - 1100) / 300) ** 2)) * (24 + sink * 40);
    return [x, top + 70 - bulge + Math.sin(i * 1.3) * 5];
  });
  return (
    <Frame f={f} seed={3192} bg={C.bedroom}>
      <g transform={cam(960, 540, z, shake * 0.3, 0)}>
        {/* 壁と窓 */}
        <rect x={-80} y={-80} width={W + 160} height={900} fill={C.bedroom} />
        <rect x={-80} y={760} width={W + 160} height={400} fill={C.bedroomDark} />
        <rect x={130} y={110} width={330} height={360} rx={8} fill={C.dawn} stroke={C.ink} strokeWidth={7} />
        <circle cx={300} cy={420} r={70} fill={KRP.orange} opacity={0.8} />
        <line x1={295} y1={110} x2={295} y2={470} stroke={C.ink} strokeWidth={6} />
        <line x1={130} y1={290} x2={460} y2={290} stroke={C.ink} strokeWidth={6} />
        <path d="M 100 80 Q 130 300 110 520 L 60 520 L 60 80 Z M 490 80 Q 460 300 480 520 L 530 520 L 530 80 Z" fill={C.pajama} stroke={C.ink} strokeWidth={5} />
        <polygon points="300,470 640,860 900,860 460,470" fill={C.dawn} opacity={0.35} />
        {/* 額 */}
        <rect x={880} y={150} width={200} height={150} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
        <path d="M 900 280 L 960 210 L 1000 250 L 1030 220 L 1060 280 Z" fill={KRP.green} stroke={C.ink} strokeWidth={3.5} />
        {/* ベッドの頭板 */}
        <rect x={300} y={360} width={70} height={420} rx={20} fill={YP.wood} stroke={C.ink} strokeWidth={6} />
        {/* 奥のマットレスの面 */}
        <path d={`M 360 ${top} Q 900 ${top - 40} 1560 ${top} L 1560 ${top + 80} L 360 ${top + 80} Z`} fill={C.marshDark} stroke={C.ink} strokeWidth={5} />
        {/* くぼみの陰 */}
        <ellipse cx={1000} cy={top + 50} rx={360} ry={40 + sink * 30} fill={C.pajamaDark} opacity={0.25} />
        {/* 突き出た足 (ばたばた) */}
        {[0, 1].map((k) => {
          const a = (k ? 1 : -1) * 14 + kick * (k ? -16 : 16);
          return (
            <g key={k} transform={`rotate(${a - 30} ${ox - 10} ${oy + 10})`}>
              <rect x={ox - 26} y={oy - 110 + k * 16} width={30} height={120} rx={12} fill={C.pajamaDark} stroke={C.ink} strokeWidth={4.5} />
              <ellipse cx={ox - 11} cy={oy - 116 + k * 16} rx={22} ry={13} fill={KRP.white} stroke={C.ink} strokeWidth={4.5} />
            </g>
          );
        })}
        <L5aLying ox={ox} oy={oy} s={s} f={f} face="worried" tilt={tilt} cloth={C.pajama} clothDark={C.pajamaDark} pose="stand" />
        {/* ばたばたの腕 (上へ) */}
        {[-1, 1].map((d) => {
          const sx = d < 0 ? 1090 : 1170, sy = 600;
          const sw = flail * d * 18;
          return <L5aLimb key={d} pts={[[sx, sy], [sx + d * 15 + sw, sy - 100], [sx + d * 40 + sw * 1.6, sy - 180]]} w={24} fill={C.pajama} />;
        })}
        {/* 手前のふち (体の下半分を飲みこむ) */}
        <path d={`${L5aPathD(lip)} L 1560 ${top + 230} Q 960 ${top + 250} 360 ${top + 230} Z`} fill={C.marsh} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M 420 ${top + 150} Q 700 ${top + 170} 980 ${top + 150} M 1060 ${top + 160} Q 1300 ${top + 176} 1520 ${top + 150}`} fill="none" stroke={C.marshDark} strokeWidth={5} strokeLinecap="round" />
        <rect x={340} y={top + 230} width={1240} height={50} rx={10} fill={YP.wood} stroke={C.ink} strokeWidth={6} />
        {/* 汗としぶき */}
        {[0, 1, 2].map((k) => {
          const tt = ((f + k * 7) % 21) / 21;
          const hx = ox - 228 * s - 40 + k * 50;
          return <path key={k} d={`M ${hx} ${oy - 160 - tt * 40} q -8 14 0 20 q 8 -6 0 -20 Z`} fill={KRP.blue} stroke={C.ink} strokeWidth={2.5} opacity={1 - tt} />;
        })}
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${ox - 40 + k * 26} ${oy - 170} l ${10 + k * 4} -24`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={0.5 + Math.sin(f + k) * 0.5} />
        ))}
        {/* サイドテーブルと鳴る目覚まし */}
        <rect x={1640} y={560} width={200} height={260} rx={6} fill={YP.wood} stroke={C.ink} strokeWidth={5} />
        <g transform={`translate(1740 ${510}) rotate(${Math.sin(f * 2.1) * 6})`}>
          <circle cx={-34} cy={-66} r={18} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
          <circle cx={34} cy={-66} r={18} fill={KRP.brass} stroke={C.ink} strokeWidth={4} />
          <circle cx={0} cy={-10} r={58} fill={KRP.red} stroke={C.ink} strokeWidth={5} />
          <circle cx={0} cy={-10} r={44} fill={KRP.white} stroke={C.ink} strokeWidth={3.5} />
          <line x1={0} y1={-10} x2={0} y2={-42} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={0} y1={-10} x2={22} y2={-10} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <line x1={-30} y1={42} x2={-40} y2={52} stroke={C.ink} strokeWidth={6} />
          <line x1={30} y1={42} x2={40} y2={52} stroke={C.ink} strokeWidth={6} />
        </g>
        <g stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" opacity={0.5 + Math.sin(f * 1.7) * 0.5}>
          <path d="M 1650 420 l -24 -14 M 1640 470 l -28 0 M 1830 420 l 24 -14 M 1840 470 l 28 0" />
        </g>
        <XMark x={1560} y={250} s={1.3} t={seg(f, 22, 30)} />
        <TagPlate x={1560} y={400} text="柔らかすぎ" size={48} t={seg(f, 26, 34)} />
      </g>
    </Frame>
  );
};

// ---- 文#193 【山】 腰痛の人を調べた研究では、硬めのマットレスより、中くらいの硬さのほうが、痛みがよくなりました。
// 設計: 3つのマットレスが並ぶ試験室: 「硬め」「中くらい」「柔らかめ」の札。それぞれに腰をさする人。真ん中の「中くらい」の人だけが腰の痛みの線が f で消えて笑顔。研究者がクリップボードに記録
// どこ: 清潔な睡眠の試験室。淡い壁にタイルの腰壁・ブラインドの窓・壁の時計。天井のレールから仕切りカーテンが下がり、3つのブースに分かれる。各ブースに低いベッドと、硬め (薄く平らな灰色)・中くらい (ほどよい厚みの青)・柔らかめ (ぶ厚くふくらんだクリーム) のマットレス。
// 演出: 3人とも腰に手を当てて困り顔、腰のまわりに赤いギザギザの痛みの線。真ん中の「中くらい」の人だけ、痛みの線が f で消えて笑顔になり、きらきら。真ん中のベッドの奥で研究者 (白衣・眼鏡) がクリップボードに書き込み、チェックが付く。
// 動き: f12〜30 真ん中の痛みの線が消える・f26〜 笑顔ときらきら・研究者のペンが動きチェックが付く・両端の人は痛みの線がぴくぴく・カメラは真ん中へ寄る。
const L5aPain: React.FC<{ x: number; y: number; s: number; f: number; t: number }> = ({ x, y, s, f, t }) => {
  if (t <= 0.01) return null;
  const j = Math.sin(f / 2) * 3;
  return (
    <g opacity={t} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${x + d * 84 * s} ${y}) scale(${d * s} ${s})`}>
          <path d={`M 0 -30 l ${14 + j} 10 l -10 10 l ${16 + j} 10 l -10 10`} />
          <path d={`M 12 -52 l ${18 + j} -10`} />
          <path d={`M 12 34 l ${18 + j} 10`} />
        </g>
      ))}
    </g>
  );
};
const Yw193: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.1, easeInOut(seg(f, 0, 42)));
  const heal = seg(f, 12, 30);
  const happy = f >= 26;
  const write = seg(f, 10, 36);
  const stations = [
    { x: 340, label: "硬め", top: 676, thick: 34, fill: C.hardMat, dark: C.hardMatDark, cloth: C.trialA, clothDark: C.trialADark },
    { x: 960, label: "中くらい", top: 640, thick: 70, fill: C.midMat, dark: C.midMatDark, cloth: C.trialB, clothDark: C.trialBDark },
    { x: 1580, label: "柔らかめ", top: 606, thick: 104, fill: C.softMat, dark: C.softMatDark, cloth: C.trialC, clothDark: C.trialCDark },
  ];
  const base = 710;
  return (
    <Frame f={f} seed={3193} bg={C.labWall}>
      <g transform={cam(960, 560, z)}>
        {/* 壁・腰壁のタイル・床 */}
        <rect x={-80} y={-80} width={W + 160} height={900} fill={C.labWall} />
        <rect x={-80} y={520} width={W + 160} height={300} fill={C.labTile} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={i * 70 - 60} y1={520} x2={i * 70 - 60} y2={820} stroke={C.labWall} strokeWidth={3} />)}
        {[590, 660, 730].map((y) => <line key={y} x1={-80} y1={y} x2={W + 80} y2={y} stroke={C.labWall} strokeWidth={3} />)}
        <rect x={-80} y={820} width={W + 160} height={360} fill={C.labFloor} />
        <line x1={-80} y1={820} x2={W + 80} y2={820} stroke={C.ink} strokeWidth={5} />
        {/* ブラインドの窓と時計 */}
        <rect x={700} y={70} width={240} height={180} rx={6} fill={C.winSky} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={704} y1={88 + i * 24} x2={936} y2={88 + i * 24} stroke={C.hospWallDark} strokeWidth={6} />)}
        <g transform="translate(1180 140)">
          <circle r={56} fill={KRP.white} stroke={C.ink} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-46} x2={0} y2={-38} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
          <line x1={0} y1={0} x2={0} y2={-34} stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${f * 6})`} />
          <line x1={0} y1={0} x2={22} y2={0} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        </g>
        {/* 天井のレールと仕切りカーテン */}
        <rect x={-80} y={30} width={W + 160} height={12} fill={C.bedFrameDark} stroke={C.ink} strokeWidth={3} />
        {[650, 1270].map((cx, k) => (
          <g key={cx}>
            <path d={`M ${cx - 40} 42 L ${cx + 40} 42 L ${cx + 44 + Math.sin(f / 10 + k) * 4} 800 L ${cx - 44 + Math.sin(f / 10 + k) * 4} 800 Z`} fill={C.divider} stroke={C.ink} strokeWidth={5} />
            {[-20, 0, 20].map((dx) => <line key={dx} x1={cx + dx} y1={46} x2={cx + dx * 1.1 + Math.sin(f / 10 + k) * 3} y2={796} stroke={C.hospWallDark} strokeWidth={3.5} />)}
          </g>
        ))}
        {stations.map((st, i) => {
          const pain = i === 1 ? 1 - heal : 1;
          const face: L5aFace = i === 1 && happy ? "joy" : "worried";
          return (
            <g key={i}>
              {/* ベッドの台 */}
              <rect x={st.x - 250} y={base} width={500} height={34} rx={6} fill={C.bedFrame} stroke={C.ink} strokeWidth={5} />
              {[-220, 220].map((dx) => <rect key={dx} x={st.x + dx - 8} y={base + 34} width={16} height={70} fill={C.bedFrameDark} stroke={C.ink} strokeWidth={4} />)}
              {/* マットレス */}
              {i === 0 && (
                <g>
                  <rect x={st.x - 236} y={st.top} width={472} height={st.thick} rx={3} fill={st.fill} stroke={C.ink} strokeWidth={5.5} />
                  {Array.from({ length: 11 }, (_, k) => <line key={k} x1={st.x - 220 + k * 42} y1={st.top + st.thick - 4} x2={st.x - 200 + k * 42} y2={st.top + 4} stroke={st.dark} strokeWidth={3.5} />)}
                </g>
              )}
              {i === 1 && (
                <g>
                  <rect x={st.x - 236} y={st.top} width={472} height={st.thick} rx={16} fill={st.fill} stroke={C.ink} strokeWidth={5.5} />
                  {[-150, -50, 50, 150].map((dx) => <circle key={dx} cx={st.x + dx} cy={st.top + st.thick / 2} r={6} fill={st.dark} />)}
                  <path d={`M ${st.x - 230} ${st.top + 16} Q ${st.x} ${st.top + 22} ${st.x + 230} ${st.top + 16}`} fill="none" stroke={st.dark} strokeWidth={4} />
                </g>
              )}
              {i === 2 && (
                <g>
                  <path d={`M ${st.x - 240} ${st.top + st.thick} L ${st.x - 240} ${st.top + 20} Q ${st.x - 236} ${st.top - 20} ${st.x - 150} ${st.top - 10} Q ${st.x} ${st.top + 26 + Math.sin(f / 8) * 4} ${st.x + 150} ${st.top - 10} Q ${st.x + 236} ${st.top - 20} ${st.x + 240} ${st.top + 20} L ${st.x + 240} ${st.top + st.thick} Z`}
                    fill={st.fill} stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
                  <path d={`M ${st.x - 200} ${st.top + 50} Q ${st.x - 100} ${st.top + 64} ${st.x} ${st.top + 54} Q ${st.x + 100} ${st.top + 64} ${st.x + 200} ${st.top + 50}`} fill="none" stroke={st.dark} strokeWidth={4} />
                </g>
              )}
              {/* ブースの札 (カーテンレールから下がる) */}
              <line x1={st.x} y1={42} x2={st.x} y2={300} stroke={C.ink} strokeWidth={3} />
              <TagPlate x={st.x} y={340} text={st.label} size={50} t={seg(f, 2 + i * 3, 10 + i * 3)} />
              {/* 腰をさする人 */}
              <ellipse cx={st.x} cy={914} rx={70} ry={12} fill={C.ink} opacity={0.15} />
              <Person x={st.x} y={910} s={1.0} f={f} phase={i * 3} face={face} gaze={[0, 2]} lean={i === 1 && happy ? 0 : (i === 0 ? 4 : -4)}
                cloth={st.cloth} clothDark={st.clothDark} hair="cap" pose={i === 1 && happy ? "banzai" : "stand"} />
              {!(i === 1 && happy) && [-1, 1].map((d) => {
                const rub = Math.sin(f / 3 + i + d) * 6;
                return <circle key={d} cx={st.x + d * 62} cy={910 - 74 + rub} r={11} fill={KRP.white} stroke={C.ink} strokeWidth={4} />;
              })}
              <L5aPain x={st.x} y={910 - 80} s={1} f={f + i * 5} t={pain} />
              {i === 1 && happy && [[-120, -300], [120, -320], [-150, -200], [150, -210]].map(([dx, dy], k) => (
                <path key={k} transform={`translate(${st.x + dx} ${910 + dy}) scale(${0.8 + Math.sin(f / 3 + k) * 0.3})`}
                  d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill={YP.glowCore} stroke={YP.brassDark} strokeWidth={3} />
              ))}
            </g>
          );
        })}
        {/* 研究者 (真ん中と右のブースの間) */}
        <Person x={1270} y={900} s={0.95} f={f} phase={6} face="normal" gaze={[-8, 6]} glasses cloth={KRP.white} clothDark={C.coatDark} hair="cap" pose="hold" />
        <g transform="translate(1270 762) scale(0.85)">
          <rect x={-44} y={-36} width={88} height={110} rx={6} fill={C.clip} stroke={C.ink} strokeWidth={4.5} />
          <rect x={-34} y={-24} width={68} height={90} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2].map((r) => {
            const on = clamp01(write * 3 - r);
            return (
              <g key={r}>
                <rect x={-26} y={-12 + r * 28} width={14} height={14} fill="none" stroke={C.ink} strokeWidth={2.5} />
                {on > 0.5 && <path d={`M -24 ${-6 + r * 28} l 5 6 l 9 -12`} fill="none" stroke={r === 1 ? KRP.green : C.ink} strokeWidth={3.5} strokeLinecap="round" />}
                <line x1={-6} y1={-5 + r * 28} x2={-6 + 34 * on} y2={-5 + r * 28} stroke={C.ink} strokeWidth={3} />
              </g>
            );
          })}
          <g transform={`translate(${-6 + 34 * ((write * 3) % 1)} ${-10 + Math.floor(Math.min(write * 3, 2.99)) * 28})`}>
            <rect x={0} y={-60} width={10} height={60} rx={3} fill={C.pen} stroke={C.ink} strokeWidth={3} transform="rotate(20)" />
          </g>
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#194 【図】 効いているのは、柔らかさそのものより、体にそう形なのです。
// 設計: 体の横向きのシルエットではなく、Person を寝かせた輪郭の下に、体のカーブにぴったり沿う線 (緑) が f で描かれる。札「体にそう形」
// どこ: 研究室の製図台。木の台に方眼の製図用紙がテープで留めてあり、定規・消しゴム・鉛筆・コンパスが散らばる。紙の上に寝かせた人の図。
// 演出: 最初、人の下に灰色の点線のまっすぐな線 (平らな面) があり、首・腰・脚の下にすき間 (？) ができている。そこへ緑の鉛筆が、頭から足まで体のカーブにぴったり沿う緑の線を f で引いていく。線が引けたところから、すき間の印が消える。札「体にそう形」。
// 動き: f6〜36 緑の線が頭から足へ伸び、鉛筆の先がそれを追う・すき間の？が順に消える・紙がわずかに揺れる・カメラは寄る。
const Yw194: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.06, easeInOut(seg(f, 0, 42)));
  const draw = easeInOut(seg(f, 6, 36));
  const ox = 1300, oy = 450, s = 2.3;
  const fitRaw = L5aFitPts(ox, oy, s, 5);
  const fit = [...fitRaw].reverse(); // 頭から足へ
  const len = L5aPathLen(fit);
  const tip = L5aPointAt(fit, draw);
  const flatY = oy + 66 * s;
  const gaps = [
    { x: ox - 168 * s, at: 0.38 },
    { x: ox - 30 * s, at: 0.86 },
  ];
  return (
    <Frame f={f} seed={3194} bg={C.draftWood}>
      <g transform={cam(960, 500, z)}>
        {/* 製図台 */}
        <rect x={-80} y={-80} width={W + 160} height={H + 160} fill={C.draftWood} />
        <g stroke={C.draftWoodDark} strokeWidth={5} opacity={0.45}>
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M -80 ${60 + i * 170} q 500 ${rnd(1941, i) * 30 - 15} 1000 0 q 500 ${rnd(1942, i) * 30 - 15} 1080 0`} fill="none" />
          ))}
        </g>
        {/* 方眼の製図用紙 */}
        <g transform={`rotate(${-0.8 + Math.sin(f / 30) * 0.2} 960 470)`}>
          <rect x={150} y={90} width={1620} height={760} fill={C.paper} stroke={C.ink} strokeWidth={6} />
          <g stroke={C.grid} strokeWidth={2}>
            {Array.from({ length: 41 }, (_, i) => <line key={`v${i}`} x1={150 + i * 40} y1={90} x2={150 + i * 40} y2={850} />)}
            {Array.from({ length: 19 }, (_, i) => <line key={`h${i}`} x1={150} y1={90 + i * 40} x2={1770} y2={90 + i * 40} />)}
          </g>
          <g stroke={C.gridBold} strokeWidth={3}>
            {Array.from({ length: 9 }, (_, i) => <line key={`V${i}`} x1={150 + i * 200} y1={90} x2={150 + i * 200} y2={850} />)}
            {Array.from({ length: 4 }, (_, i) => <line key={`H${i}`} x1={150} y1={90 + i * 200} x2={1770} y2={90 + i * 200} />)}
          </g>
          {[[170, 108, 30], [1750, 108, -30], [170, 832, -30], [1750, 832, 30]].map(([tx, ty, r], i) => (
            <rect key={i} x={tx - 50} y={ty - 18} width={100} height={36} rx={4} fill={i % 2 ? C.flower1 : KRP.blueSoft} opacity={0.85}
              stroke={C.ink} strokeWidth={3} transform={`rotate(${r} ${tx} ${ty})`} />
          ))}
          {/* 平らな面 (点線) と、すき間の印 */}
          <line x1={500} y1={flatY} x2={1420} y2={flatY} stroke={KRP.grayDark} strokeWidth={5} strokeDasharray="16 12" />
          {gaps.map((g, i) => {
            const v = 1 - seg(draw, g.at - 0.08, g.at);
            return (
              <g key={i} opacity={v}>
                <line x1={g.x} y1={flatY - 6} x2={g.x} y2={flatY - 56} stroke={KRP.grayDark} strokeWidth={4} />
                <QMark x={g.x} y={flatY + 100} s={0.55} f={f} t={1} color={KRP.grayDark} />
              </g>
            );
          })}
          <L5aLying ox={ox} oy={oy} s={s} f={f} face={draw > 0.95 ? "smile" : "normal"} cloth={C.gown} clothDark={C.gownDark} />
          {/* 緑の線: 体のカーブにぴったり沿う */}
          <path d={L5aPathD(fit)} fill="none" stroke={C.fitLine} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={`${len * draw} ${len + 10}`} />
          {/* 緑の鉛筆 */}
          {draw > 0 && (
            <g transform={`translate(${tip[0]} ${tip[1]}) rotate(-35)`}>
              <path d="M 0 0 L 18 -30 L -18 -30 Z" fill={C.memFoam} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d="M 0 0 L 6 -10 L -6 -10 Z" fill={C.fitLine} />
              <rect x={-18} y={-230} width={36} height={200} fill={C.fitLine} stroke={C.ink} strokeWidth={4.5} />
              <rect x={-18} y={-246} width={36} height={18} fill={KRP.silver} stroke={C.ink} strokeWidth={4} />
            </g>
          )}
          <TagPlate x={960} y={190} text="体にそう形" size={60} t={seg(f, 24, 34)} color={C.fitLine} />
        </g>
        {/* 台の上の道具 */}
        <g transform="translate(960 930) rotate(-1)">
          <rect x={-560} y={-34} width={1120} height={68} rx={6} fill={C.flask} fillOpacity={0.6} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 28 }, (_, i) => <line key={i} x1={-540 + i * 40} y1={-34} x2={-540 + i * 40} y2={i % 5 === 0 ? 4 : -10} stroke={C.ink} strokeWidth={3} />)}
        </g>
        <rect x={1820} y={420} width={70} height={44} rx={8} fill={C.flower1} stroke={C.ink} strokeWidth={4} transform="rotate(20 1855 442)" />
        <g transform="translate(70 500) rotate(14)">
          <line x1={0} y1={-120} x2={-30} y2={100} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={-120} x2={30} y2={100} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={-124} r={14} fill={KRP.silver} stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
    </Frame>
  );
};

// ---- 文#195 【並】 では、手のほうはどうでしょうか。
// 設計: 道しるべの看板の「手を守る」の矢印が光る (#186 と同じ看板)
// どこ: #186 と同じ野原の道しるべ (同じ場所の続き)。
// 演出: 「体を守る」は見終わった印に緑のチェックが付いて光が消え、こんどは柱の下の小さな矢印「手を守る」が灯る。旅の人が自分の手のひらを見て、次に矢印を指さす。
// 動き: f2〜10 上の矢印にチェック・f10〜22 「手を守る」が灯る・f6〜18 旅の人は手を見る→f18〜 指さす・カメラは「手を守る」へ寄る。
const Yw195: React.FC<{ f: number }> = ({ f }) => {
  const check = seg(f, 2, 10);
  const hg = seg(f, 10, 22);
  const z = lerp(1.02, 1.16, easeInOut(seg(f, 4, 42)));
  const point = f >= 18;
  return (
    <Frame f={f} seed={3195} bg={C.sky}>
      <g transform={cam(860, 560, z)}>
        <L5aSignpost f={f} hand={1} handGlow={hg}>
          {/* 上の矢印: 見終わったチェック */}
          {check > 0 && (
            <g transform={`translate(1060 236) scale(${pop(check)})`}>
              <circle r={40} fill={KRP.white} stroke={C.ink} strokeWidth={5} />
              <path d="M -20 0 L -6 16 L 22 -16" fill="none" stroke={KRP.green} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {/* 「手を守る」の矢印の先に、ペンと工具の持ち手の幻 (これから見るもの) */}
          <g opacity={hg * 0.75} transform={`translate(560 ${640 + Math.sin(f / 6) * 6})`}>
            <rect x={-60} y={-14} width={120} height={28} rx={14} fill={C.pen} stroke={C.ink} strokeWidth={4} transform="rotate(-30)" />
            <rect x={-30} y={-14} width={50} height={28} rx={10} fill={C.penGrip} stroke={C.ink} strokeWidth={3} transform="rotate(-30)" />
          </g>
          <ellipse cx={1420} cy={884} rx={90} ry={14} fill={C.ink} opacity={0.18} />
          <line x1={1492} y1={700} x2={1520} y2={884} stroke={YP.woodDark} strokeWidth={10} strokeLinecap="round" />
          <Person x={1420} y={880} s={1.15} f={f} phase={5} face={point ? "joy" : "normal"} gaze={point ? [-7, 2] : [3, 8]}
            pose={point ? "point" : "hold"} pointDir={-1} cloth={C.knit} clothDark={C.knitDark} hair="cap" />
          {/* 手のひらを見る (指さす前): 手元に小さな「？」 */}
          {!point && <QMark x={1420} y={700} s={0.5} f={f} t={seg(f, 6, 12)} />}
        </L5aSignpost>
      </g>
    </Frame>
  );
};

// ---- 文#196 【山】 12人に1時間、文字を書いてもらう実験があります。
// 設計: 1990年代の研究室の実験風景。机が並び、12人の参加者 (Person を小さめに、6人×2列。全員違う服の色) がペンで書き続ける。壁の時計が f で1周 (1時間)。研究者が見回る。札「12人」「1時間」
// どこ: 1990年代の大学の研究室。クリーム色の壁、ブラインドの窓、ホワイトボード、壁の大きな丸時計、ベージュのブラウン管パソコン、リノリウムの床。年代札「1990年代」。
// 演出: 長机が2列。12人 (6人×2列・全員ちがう服の色) が、ひたすらペンで書き続ける。紙の上の行が f で増えていく。壁の時計の長い針が f でちょうど1周 (=1時間)。白衣の研究者がクリップボードを持って列の横を歩いて見回る。札「12人」「1時間」。
// 動き: f2〜40 時計の長針が1周・短針が少し進む・12人のペン先が細かく動き行が増える・研究者は右から左へ歩く・カメラはゆっくり引く。
const Yw196: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.07, 1.0, easeInOut(seg(f, 0, 42)));
  const hour = seg(f, 2, 40);
  const walk = seg(f, 0, 42);
  const colors: [string, string][] = [
    ["#C98B5A", "#9E6A40"], ["#7E9C6A", "#5E7C4C"], ["#9A7EB0", "#7A5E90"], ["#D3A33C", "#A8822A"], ["#6F8FB0", "#4F6C8C"], ["#C06A6A", "#984C4C"],
    ["#5FA8A0", "#3F807A"], ["#E0A0B4", "#B87A90"], ["#8A8F98", "#686D76"], ["#B88A5A", "#8E6A40"], ["#7AA8D8", "#5888B8"], ["#A6B85A", "#7E9040"],
  ];
  const rows = [
    { feet: 600, s: 0.56, desk: 560, xs: [380, 590, 800, 1010, 1220, 1430] },
    { feet: 830, s: 0.7, desk: 770, xs: [300, 530, 760, 990, 1220, 1450] },
  ];
  const rx = lerp(1720, 1580, walk);
  return (
    <Frame f={f} seed={3196} bg={C.room90}>
      <g transform={cam(960, 520, z)}>
        {/* 壁・床 */}
        <rect x={-80} y={-80} width={W + 160} height={640} fill={C.room90} />
        <rect x={-80} y={480} width={W + 160} height={30} fill={C.room90Dark} />
        <rect x={-80} y={510} width={W + 160} height={700} fill={C.lino} />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 140 - 80} y1={510} x2={i * 140 - 300} y2={1100} stroke={C.linoDark} strokeWidth={3} />)}
        {/* ブラインドの窓 */}
        <rect x={60} y={80} width={260} height={300} rx={6} fill={C.winSky} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={64} y1={100 + i * 28} x2={316} y2={100 + i * 28} stroke={C.room90Dark} strokeWidth={8} />)}
        {/* ホワイトボード */}
        <rect x={1040} y={70} width={520} height={290} rx={6} fill={C.board90} stroke={C.ink} strokeWidth={6} />
        <rect x={1040} y={360} width={520} height={18} fill={C.room90Dark} stroke={C.ink} strokeWidth={4} />
        <text x={1300} y={150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={KRP.blueDeep}>書く実験</text>
        <path d="M 1080 200 L 1180 200 M 1420 200 L 1520 200" stroke={KRP.grayDark} strokeWidth={6} strokeLinecap="round" />
        {/* 壁の時計 (長針が1周) */}
        <g transform="translate(700 210)">
          <circle r={124} fill={KRP.white} stroke={C.ink} strokeWidth={8} />
          {Array.from({ length: 60 }, (_, i) => (
            <line key={i} x1={0} y1={-112} x2={0} y2={i % 5 === 0 ? -94 : -104} stroke={C.ink} strokeWidth={i % 5 === 0 ? 5 : 2.5} transform={`rotate(${i * 6})`} />
          ))}
          {/* 進んだ1時間ぶんの扇 */}
          <path d={(() => {
            const a = hour * Math.PI * 2 - Math.PI / 2;
            const large = hour > 0.5 ? 1 : 0;
            if (hour > 0.995) return "M 0 -90 A 90 90 0 1 1 0 90 A 90 90 0 1 1 0 -90 Z";
            return `M 0 0 L 0 -90 A 90 90 0 ${large} 1 ${(Math.cos(a) * 90).toFixed(1)} ${(Math.sin(a) * 90).toFixed(1)} Z`;
          })()} fill={KRP.yellow} opacity={0.35} />
          <line x1={0} y1={0} x2={0} y2={-58} stroke={C.ink} strokeWidth={9} strokeLinecap="round" transform={`rotate(${60 + hour * 30})`} />
          <line x1={0} y1={0} x2={0} y2={-96} stroke={KRP.red} strokeWidth={6} strokeLinecap="round" transform={`rotate(${hour * 360})`} />
          <circle r={9} fill={C.ink} />
        </g>
        <TagPlate x={700} y={400} text="1時間" size={50} t={seg(f, 4, 12)} />
        <TagPlate x={1300} y={265} text="12人" size={64} t={seg(f, 8, 16)} />
        {/* 年代札「1990年代」は外した: 筆記の実験 (Udo ほか) は2000年発表で、実施年を確かめていないため (検品で修正) */}
        {/* 隅の机のブラウン管パソコン */}
        <g transform="translate(1720 300)">
          <rect x={-90} y={-20} width={180} height={150} rx={14} fill={C.crt} stroke={C.ink} strokeWidth={5} />
          <rect x={-70} y={0} width={140} height={100} rx={10} fill={C.crtScreen} stroke={C.ink} strokeWidth={4} />
          <rect x={-60} y={130} width={120} height={30} fill={C.crtDark} stroke={C.ink} strokeWidth={4} />
          <line x1={-50} y1={30} x2={-50 + ((f * 4) % 100)} y2={30} stroke={KRP.green} strokeWidth={4} />
          <rect x={-130} y={160} width={260} height={20} fill={C.desk90Dark} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* 2列の長机と12人 */}
        {rows.map((row, ri) => (
          <g key={ri}>
            {row.xs.map((x, k) => {
              const idx = ri * 6 + k;
              const [cl, cd] = colors[idx];
              return (
                <Person key={k} x={x} y={row.feet} s={row.s} f={f} phase={idx * 2} face="normal" gaze={[0, 9]}
                  cloth={cl} clothDark={cd} hair={idx % 4 === 3 ? "none" : "cap"} glasses={idx % 5 === 2} pose="hold" lean={Math.sin(f / 8 + idx) * 2} />
              );
            })}
            <rect x={row.xs[0] - 150} y={row.desk} width={row.xs[5] - row.xs[0] + 300} height={22} rx={4} fill={C.desk90} stroke={C.ink} strokeWidth={5} />
            <rect x={row.xs[0] - 140} y={row.desk + 22} width={row.xs[5] - row.xs[0] + 280} height={ri ? 140 : 90} fill={C.desk90Dark} stroke={C.ink} strokeWidth={5} />
            {row.xs.map((x, k) => {
              const idx = ri * 6 + k;
              const lines = Math.min(4, Math.floor((f + idx * 3) / 10) + 1);
              const wig = Math.sin(f * 1.4 + idx) * 6 * row.s;
              const pw = 120 * row.s;
              return (
                <g key={`p${k}`}>
                  <rect x={x - pw / 2} y={row.desk - 8 * row.s} width={pw} height={30 * row.s} fill={KRP.white} stroke={C.ink} strokeWidth={3}
                    transform={`skewX(-20)`} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
                  {Array.from({ length: lines }, (_, l) => (
                    <line key={l} x1={x - pw / 2 + 12} y1={row.desk - 2 * row.s + l * 6 * row.s} x2={x - pw / 2 + 12 + (l === lines - 1 ? 40 + ((f * 3 + idx * 7) % 50) : 90) * row.s}
                      y2={row.desk - 2 * row.s + l * 6 * row.s} stroke={C.noteLine} strokeWidth={3} />
                  ))}
                  {/* ペン (手元から紙へ) */}
                  <line x1={x + 12 * row.s} y1={row.feet - 118 * row.s} x2={x + 26 * row.s + wig} y2={row.desk - 2} stroke={C.ink} strokeWidth={7 * row.s + 2} strokeLinecap="round" />
                </g>
              );
            })}
          </g>
        ))}
        {/* 見回る研究者 */}
        <ellipse cx={rx} cy={944} rx={70} ry={11} fill={C.ink} opacity={0.15} />
        <Person x={rx} y={940} s={0.95} f={f} phase={9} face="normal" gaze={[-8, 4]} glasses cloth={KRP.white} clothDark={C.coatDark} hair="none" pose="hold"
          lean={Math.sin(f / 3) * 2} />
        <g transform={`translate(${rx} ${940 - 116})`}>
          <rect x={-36} y={-30} width={72} height={92} rx={6} fill={C.clip} stroke={C.ink} strokeWidth={4.5} />
          <rect x={-28} y={-20} width={56} height={74} fill={KRP.white} stroke={C.ink} strokeWidth={3} />
          {[0, 1, 2, 3].map((r) => <line key={r} x1={-20} y1={-6 + r * 16} x2={20} y2={-6 + r * 16} stroke={C.noteLine} strokeWidth={3} />)}
        </g>
      </g>
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====
const SCENES: Record<string, (f: number) => React.ReactElement> = {
  yw_185: (f) => <Yw185 f={f} />,
  yw_186: (f) => <Yw186 f={f} />,
  yw_187: (f) => <Yw187 f={f} />,
  yw_188: (f) => <Yw188 f={f} />,
  yw_189: (f) => <Yw189 f={f} />,
  yw_190: (f) => <Yw190 f={f} />,
  yw_191: (f) => <Yw191 f={f} />,
  yw_192: (f) => <Yw192 f={f} />,
  yw_193: (f) => <Yw193 f={f} />,
  yw_194: (f) => <Yw194 f={f} />,
  yw_195: (f) => <Yw195 f={f} />,
  yw_196: (f) => <Yw196 f={f} />,
};

export const YW_G1_MOTIFS: string[] = [
  "yw_185",
  "yw_186",
  "yw_187",
  "yw_188",
  "yw_189",
  "yw_190",
  "yw_191",
  "yw_192",
  "yw_193",
  "yw_194",
  "yw_195",
  "yw_196",
];

export const yawaG1Scene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
