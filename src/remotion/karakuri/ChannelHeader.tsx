// からくりチャンネルのヘッダー画像 (YouTube バナー 2560×1440)。本編とは無関係。
// 見える範囲: スマホ・どこでも = 中央 1546×423 (x 507〜2053, y 508〜931)
//             パソコン = 横いっぱい 2560×423 (y 508〜931) / テレビ = 全体
// 中央に題字、安全域の両わきに2コマ、パソコンだけで見える外側に4コマ。
// メインキャラ (Person) は形を変えず、表情・ポーズ・場所だけ変える。
// 書き出し: npx remotion still src/remotion/index.ts ChannelHeader <out.png> --frame=0

import React from "react";
import { AbsoluteFill } from "remotion";
import { KRP, KARAKURI_FONT, Person } from "./KarakuriScenes";

export const HEADER_W = 2560;
export const HEADER_H = 1440;
const FONT = KARAKURI_FONT;
const INK = KRP.ink;
const SW = 6;

// 帯 (パソコンで見える高さ) の上下
const BAND_T = 508;
const BAND_B = 931;
const P_T = 536; // コマの上端
const P_H = 368; // コマの高さ
const P_B = P_T + P_H;
const FLOOR = P_B - 34; // コマの中の床

// ===== 小物 =====
export const Gear: React.FC<{ x: number; y: number; r: number; teeth?: number; fill: string; rot?: number }> = ({
  x, y, r, teeth = 10, fill, rot = 0,
}) => {
  const pts: string[] = [];
  const n = teeth * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.8;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon points={pts.join(" ")} fill={fill} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle r={r * 0.32} fill={KRP.white} stroke={INK} strokeWidth={5} />
    </g>
  );
};

export const Sparkle: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = KRP.white }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0,-22 C4,-6 6,-4 22,0 C6,4 4,6 0,22 C-4,6 -6,4 -22,0 C-6,-4 -4,-6 0,-22 Z"
    fill={fill} stroke={INK} strokeWidth={4} strokeLinejoin="round"
  />
);

// コマ (角丸の窓)。中身は clip で切る
const Panel: React.FC<{ id: string; x: number; w: number; bg: string; children: React.ReactNode }> = ({
  id, x, w, bg, children,
}) => (
  <g>
    <defs>
      <clipPath id={id}>
        <rect x={x} y={P_T} width={w} height={P_H} rx={36} />
      </clipPath>
    </defs>
    {/* 影 */}
    <rect x={x + 10} y={P_T + 12} width={w} height={P_H} rx={36} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={x} y={P_T} width={w} height={P_H} fill={bg} />
      {children}
      {/* 床 */}
      <rect x={x} y={FLOOR} width={w} height={P_B - FLOOR} fill={KRP.floor} />
      <line x1={x} y1={FLOOR} x2={x + w} y2={FLOOR} stroke={INK} strokeWidth={5} />
    </g>
    <rect x={x} y={P_T} width={w} height={P_H} rx={36} fill="none" stroke={INK} strokeWidth={SW} />
  </g>
);

// ===== 各コマの中身 =====

// ① 本棚の前で読書 (hold・smile)
const ShelfScene: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const sx = x + 26;
  const colors = [KRP.red, KRP.blueDeep, KRP.yellow, KRP.green, KRP.orange, KRP.blue, KRP.bronze];
  return (
    <g>
      <rect x={sx} y={P_T + 40} width={w - 52} height={FLOOR - P_T - 40} fill={KRP.bronze} stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((row) => {
        const ry = P_T + 52 + row * 92;
        return (
          <g key={row}>
            {Array.from({ length: 9 }).map((_, i) => {
              const bw = 20;
              const bh = 64 + ((i * 7 + row * 5) % 3) * 8;
              return (
                <rect key={i} x={sx + 12 + i * (bw + 2)} y={ry + 80 - bh} width={bw} height={bh}
                  fill={colors[(i + row * 3) % colors.length]} stroke={INK} strokeWidth={3} />
              );
            })}
            <rect x={sx} y={ry + 80} width={w - 52} height={10} fill={KRP.copper} stroke={INK} strokeWidth={4} />
          </g>
        );
      })}
      <Person x={x + w / 2} y={FLOOR + 8} s={0.7} pose="hold" face="smile" still />
      {/* 胸の前の本 */}
      <g transform={`translate(${x + w / 2} ${FLOOR - 70}) scale(0.72)`}>
        <path d="M-46,-26 L0,-16 L46,-26 L46,22 L0,32 L-46,22 Z" fill={KRP.white} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <line x1={0} y1={-16} x2={0} y2={32} stroke={INK} strokeWidth={4} />
        <path d="M-46,-26 L0,-16 L46,-26" fill="none" stroke={KRP.red} strokeWidth={4} />
      </g>
    </g>
  );
};

// ② 旅に出る (run・joy) 山と太陽とスーツケース
const TravelScene: React.FC<{ x: number; w: number }> = ({ x, w }) => (
  <g>
    <circle cx={x + w - 60} cy={P_T + 80} r={42} fill={KRP.yellow} stroke={INK} strokeWidth={5} />
    <polygon points={`${x - 20},${FLOOR} ${x + 90},${P_T + 150} ${x + 200},${FLOOR}`} fill={KRP.green} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <polygon points={`${x + 120},${FLOOR} ${x + 230},${P_T + 110} ${x + 340},${FLOOR}`} fill="#5FA05A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <polygon points={`${x + 205},${P_T + 136} ${x + 230},${P_T + 110} ${x + 255},${P_T + 136} ${x + 240},${P_T + 130} ${x + 230},${P_T + 142} ${x + 218},${P_T + 130}`} fill={KRP.white} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <Person x={x + w / 2 - 26} y={FLOOR + 6} s={0.68} pose="run" face="joy" lean={-6} still />
    {/* スーツケース */}
    <g transform={`translate(${x + w / 2 + 62} ${FLOOR})`}>
      <path d="M-14,-96 L-14,-118 L14,-118 L14,-96" fill="none" stroke={INK} strokeWidth={5} />
      <rect x={-36} y={-98} width={72} height={88} rx={10} fill={KRP.orange} stroke={INK} strokeWidth={5} />
      <line x1={-36} y1={-62} x2={36} y2={-62} stroke={INK} strokeWidth={4} />
      <circle cx={-22} cy={-4} r={7} fill={INK} />
      <circle cx={22} cy={-4} r={7} fill={INK} />
    </g>
  </g>
);

// ③ 自販機の前でバンザイ (banzai・joy) ※安全域
const VendingScene: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const vx = x + 24;
  const vw = 128;
  const vtop = P_T + 70;
  const bottles = [KRP.red, KRP.blueDeep, KRP.green, KRP.orange, KRP.yellow, KRP.blue];
  return (
    <g>
      <rect x={vx} y={vtop} width={vw} height={FLOOR - vtop} rx={8} fill={KRP.red} stroke={INK} strokeWidth={5} />
      <rect x={vx + 12} y={vtop + 14} width={vw - 24} height={128} rx={4} fill={KRP.white} stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <g key={`${r}-${c}`}>
            <rect x={vx + 20 + c * 24} y={vtop + 24 + r * 40} width={14} height={28} rx={5}
              fill={bottles[(r * 4 + c) % bottles.length]} stroke={INK} strokeWidth={2.5} />
            <circle cx={vx + 27 + c * 24} cy={vtop + 59 + r * 40} r={3} fill={KRP.yellow} stroke={INK} strokeWidth={1.5} />
          </g>
        )),
      )}
      <rect x={vx + vw - 34} y={vtop + 156} width={18} height={34} rx={3} fill={KRP.silver} stroke={INK} strokeWidth={3.5} />
      <rect x={vx + 16} y={FLOOR - 50} width={vw - 32} height={30} rx={4} fill={INK} />
      {/* 出てきた缶 */}
      <rect x={vx + 50} y={FLOOR - 46} width={16} height={24} rx={4} fill={KRP.blueDeep} stroke={KRP.white} strokeWidth={2} />
      <Person x={x + w - 82} y={FLOOR + 8} s={0.66} pose="banzai" face="joy" still />
      <Sparkle x={x + w - 34} y={P_T + 70} s={0.9} fill={KRP.yellow} />
      <Sparkle x={x + w - 150} y={P_T + 52} s={0.6} />
    </g>
  );
};

// ④ ビル街を見上げてびっくり (raise・surprised) ※安全域
const CityScene: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const bldg = [
    { dx: 6, bw: 70, h: 240, c: KRP.blue },
    { dx: 70, bw: 86, h: 300, c: KRP.white },
    { dx: 150, bw: 64, h: 200, c: KRP.gray },
    { dx: 206, bw: 70, h: 270, c: KRP.blueSoft },
  ];
  return (
    <g>
      {bldg.map((b, i) => {
        const top = FLOOR - b.h;
        return (
          <g key={i}>
            <rect x={x + b.dx} y={top} width={b.bw} height={b.h} fill={b.c} stroke={INK} strokeWidth={5} />
            {Array.from({ length: Math.floor((b.h - 30) / 34) }).map((_, r) =>
              [0, 1].map((c) => (
                <rect key={`${r}-${c}`} x={x + b.dx + 12 + c * (b.bw / 2 - 4)} y={top + 16 + r * 34}
                  width={b.bw / 2 - 20} height={18} fill={(r + c + i) % 3 === 0 ? KRP.yellow : KRP.blueDeep}
                  stroke={INK} strokeWidth={2.5} />
              )),
            )}
          </g>
        );
      })}
      <Person x={x + w / 2 + 6} y={FLOOR + 8} s={0.66} pose="raise" face="surprised" gaze={[0, -3]} cloth="#E8923A" clothDark="#B8681F" still />
      <text x={x + w / 2 + 70} y={P_T + 120} fontFamily={FONT} fontWeight={900} fontSize={64} fill={KRP.red}
        stroke={INK} strokeWidth={4} paintOrder="stroke">!</text>
    </g>
  );
};

// ⑤ 歯車の前で腕組み (armsFolded・worried)「？」
const GearScene: React.FC<{ x: number; w: number }> = ({ x, w }) => (
  <g>
    <Gear x={x + 60} y={P_T + 90} r={70} teeth={10} fill={KRP.brass} rot={8} />
    <Gear x={x + 172} y={P_T + 160} r={50} teeth={8} fill={KRP.silver} rot={-4} />
    <Gear x={x + w - 30} y={P_T + 70} r={56} teeth={9} fill={KRP.copper} rot={20} />
    <Person x={x + w / 2} y={FLOOR + 8} s={0.68} pose="armsFolded" face="worried" gaze={[2, -2]} cloth="#5FA05A" clothDark="#3F7A3B" still />
    <text x={x + w / 2 + 52} y={P_T + 236} fontFamily={FONT} fontWeight={900} fontSize={72} fill={KRP.white}
      stroke={INK} strokeWidth={6} paintOrder="stroke">?</text>
  </g>
);

// ⑥ 電球をひらめいて指さし (point・smile)
const IdeaScene: React.FC<{ x: number; w: number }> = ({ x, w }) => {
  const bx = x + w - 88;
  const by = P_T + 110;
  return (
    <g>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <line key={i} x1={bx + Math.cos(a) * 62} y1={by + Math.sin(a) * 62} x2={bx + Math.cos(a) * 84} y2={by + Math.sin(a) * 84}
            stroke={INK} strokeWidth={6} strokeLinecap="round" />
        );
      })}
      <circle cx={bx} cy={by} r={48} fill={KRP.yellow} stroke={INK} strokeWidth={5} />
      <rect x={bx - 22} y={by + 42} width={44} height={30} rx={6} fill={KRP.silver} stroke={INK} strokeWidth={5} />
      <path d={`M${bx - 12},${by + 40} L${bx - 12},${by + 10} Q${bx},${by - 8} ${bx + 12},${by + 10} L${bx + 12},${by + 40}`} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Person x={x + 78} y={FLOOR + 8} s={0.68} pose="point" pointDir={1} face="smile" gaze={[3, -1]} cloth="#4A78B8" clothDark="#30568C" still />
    </g>
  );
};


// 枠にぶら下がる小さいメインキャラ (枠の線より手前に描く)。gx, gy = 枠をつかむ位置の中央
const Hanger: React.FC<{ gx: number; gy: number; s?: number; swing?: number; face?: "joy" | "smile" | "surprised" | "normal" }> = ({
  gx, gy, s = 0.42, swing = 9, face = "joy",
}) => (
  <g transform={`translate(${gx} ${gy}) rotate(${swing})`}>
    {/* ゆれの線 */}
    <g transform={`scale(${(s / 0.42) * Math.sign(swing || 1)} ${s / 0.42})`}>
      <path d="M48,70 Q58,100 48,130" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path d="M62,80 Q70,102 62,124" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </g>
    <Person x={0} y={313 * s} s={s} pose="hang" face={face} still />
    {/* 枠をつかむ手 */}
    <circle cx={-67 * s} cy={-2} r={Math.max(5, 19 * s)} fill={KRP.white} stroke={INK} strokeWidth={4} />
    <circle cx={67 * s} cy={-2} r={Math.max(5, 19 * s)} fill={KRP.white} stroke={INK} strokeWidth={4} />
  </g>
);

// ===== 題字のコマ =====
const TitlePanel: React.FC<{ x: number; w: number; title: string; sub: string }> = ({ x, w, title, sub }) => {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x + 12} y={P_T + 14} width={w} height={P_H} rx={44} fill={INK} />
      <rect x={x} y={P_T} width={w} height={P_H} rx={44} fill={KRP.cream} stroke={INK} strokeWidth={SW + 2} />
      {/* 角の歯車 */}
      <Gear x={x + 40} y={P_B - 40} r={28} teeth={8} fill={KRP.orange} rot={10} />
      <Gear x={x + w - 40} y={P_B - 40} r={28} teeth={8} fill={KRP.blueDeep} rot={4} />
      {/* 題字 (「からくり」だけ赤) */}
      <text x={cx} y={P_T + 150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96}
        stroke={INK} strokeWidth={16} strokeLinejoin="round" paintOrder="stroke" letterSpacing={2}>
        {title.split("").map((ch, i) => (
          <tspan key={i} fill={i >= title.indexOf("からくり") && i < title.indexOf("からくり") + 4 && title.includes("からくり") ? KRP.red : KRP.white}>{ch}</tspan>
        ))}
      </text>
      {/* 題字にぶら下がる小さいメインキャラ3人 (表情・ゆれ・高さをバラけさせる)。題字の1文字 ≒ 98px */}
      <Hanger gx={cx - 4 * 98 + 98 * 1} gy={P_T + 153} s={0.34} swing={-10} face="joy" />
      {/* 「ル」の右の縦棒の上に座る小さいメインキャラ。座面 = 縦棒の上端 */}
      <Person x={cx + 416} y={P_T + 78 + 58 * 0.3} s={0.3} pose="sit" face="smile" gaze={[-3, 0]} still />
      {/* 下の帯 */}
      <rect x={cx - 400} y={P_T + 266} width={800} height={64} rx={32} fill={KRP.yellow} stroke={INK} strokeWidth={5} />
      <text x={cx} y={P_T + 310} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INK}>
        {sub}
      </text>
    </g>
  );
};

// ===== 背景 (テレビだけで見える上下も含めて全面) =====
const Backdrop: React.FC = () => {
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 26; r++) {
    for (let c = 0; c < 44; c++) {
      const x = c * 60 + (r % 2 ? 30 : 0);
      const y = r * 58;
      dots.push(<circle key={`${r}-${c}`} cx={x} cy={y} r={7} fill="#FFFFFF" opacity={0.45} />);
    }
  }
  return (
    <g>
      <rect width={HEADER_W} height={HEADER_H} fill={KRP.yellow} />
      {dots}
      {/* パソコン帯の後ろに、少し明るい帯 */}
      <rect x={0} y={BAND_T} width={HEADER_W} height={BAND_B - BAND_T} fill={KRP.paper} opacity={0.55} />
      <line x1={0} y1={BAND_T} x2={HEADER_W} y2={BAND_T} stroke={INK} strokeWidth={5} strokeDasharray="22 14" opacity={0.35} />
      <line x1={0} y1={BAND_B} x2={HEADER_W} y2={BAND_B} stroke={INK} strokeWidth={5} strokeDasharray="22 14" opacity={0.35} />
      {/* テレビ用の飾り (上下) */}
      <Gear x={180} y={240} r={110} teeth={12} fill={KRP.orange} rot={6} />
      <Gear x={360} y={330} r={60} teeth={8} fill={KRP.white} rot={-10} />
      <Gear x={2380} y={1190} r={120} teeth={12} fill={KRP.blueDeep} rot={12} />
      <Gear x={2180} y={1110} r={60} teeth={8} fill={KRP.white} rot={4} />
      <Sparkle x={1280} y={260} s={2} />
      <Sparkle x={820} y={1200} s={1.6} fill={KRP.orange} />
      <Sparkle x={1760} y={1230} s={1.2} />
    </g>
  );
};

// ===== 本体 =====
export const ChannelHeader: React.FC<{ title?: string; sub?: string; showGuide?: boolean }> = ({
  title = "からくりチャンネル",
  sub = "身のまわりの「なぜ？」を、しくみでほどく",
  showGuide = false,
}) => {
  // 横の並び (x と幅)
  const L = [
    { x: 20, w: 236 }, // ① 本棚 (パソコンのみ)
    { x: 272, w: 222 }, // ② 旅 (パソコンのみ)
  ];
  const SAFE_L = { x: 520, w: 268 }; // ③ 自販機 (安全域)
  const TITLE = { x: 808, w: 944 };
  const SAFE_R = { x: 1772, w: 268 }; // ④ ビル (安全域)
  const R = [
    { x: 2066, w: 222 }, // ⑤ 歯車 (パソコンのみ)
    { x: 2304, w: 236 }, // ⑥ 電球 (パソコンのみ)
  ];
  return (
    <AbsoluteFill>
      <svg width={HEADER_W} height={HEADER_H} viewBox={`0 0 ${HEADER_W} ${HEADER_H}`}>
        <Backdrop />
        <Panel id="p1" x={L[0].x} w={L[0].w} bg={KRP.blueSoft}><ShelfScene x={L[0].x} w={L[0].w} /></Panel>
        <Panel id="p2" x={L[1].x} w={L[1].w} bg="#BFE3F2"><TravelScene x={L[1].x} w={L[1].w} /></Panel>
        <Panel id="p3" x={SAFE_L.x} w={SAFE_L.w} bg="#FBE3C4"><VendingScene x={SAFE_L.x} w={SAFE_L.w} /></Panel>
        <TitlePanel x={TITLE.x} w={TITLE.w} title={title} sub={sub} />
        <Panel id="p4" x={SAFE_R.x} w={SAFE_R.w} bg="#D9ECF7"><CityScene x={SAFE_R.x} w={SAFE_R.w} /></Panel>
        <Panel id="p5" x={R[0].x} w={R[0].w} bg="#E7DDF3"><GearScene x={R[0].x} w={R[0].w} /></Panel>
        <Panel id="p6" x={R[1].x} w={R[1].w} bg="#FBD3CC"><IdeaScene x={R[1].x} w={R[1].w} /></Panel>
        {showGuide && (
          <g fill="none" strokeWidth={4}>
            <rect x={507} y={508} width={1546} height={423} stroke="#E0218A" />
            <rect x={0} y={508} width={2560} height={423} stroke="#1E88E5" strokeDasharray="16 10" />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
