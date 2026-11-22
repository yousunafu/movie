// 夜の深掘り 試作: セーブ回 3枚目 (山)「電子を、箱に閉じこめる」(フラッシュメモリの浮遊ゲート)
// 6点法: 寄る (メモリーカード → チップの中の断面へ潜る) / 世界 (夜の机 → シリコンの地層)
//        部品 (断面の層: 土台・2つの井戸・うすい壁・浮いた部屋・ぶあつい壁・上のふた・柱)
//        カメラ (カードへ突っこんで断面へ) / 事件 (電子が壁をすり抜けて部屋に入り、電源OFF でも出られない)
//        人の反応 (小さくなった語り手が断面の上に立って照らす・電子が眠る)
// ★メモリーカードは特定製品の形にしない (一般的なカードの形・文字なし)
import React from "react";
import { NoteDeskC, NoteCellsC, NoteFolk, NotePaper, PEN } from "./YoruNote";
import {
  W, H, YRP, GOTHIC, seg, easeInOut, pop, clamp01, rnd, lerp,
  YoruDefs, NightFinish, Caption, FileTag, Narrator, narratorLight, Beam, Dust, NightTag, useMood, isPlain, isLightBg,
} from "./YoruShared";

// 机と断面の背景の色 (作風ごと)。cell = 奥に並ぶ同じ部屋の色 [壁, 帯, 灯った部屋, 消えた部屋, 電子]
const CAVE = {
  night: { desk: "#2E241C", grain: "#3A2E24", bg: "#151B28", cell: ["#2E3648", "#3A4660", "#5A4A36", "#33302E", "#8FD8FF"], zzz: "#BFEAFF" },
  flat: { desk: "#46372A", grain: "#54432F", bg: "#222A3C", cell: ["#36405A", "#43506C", "#66553E", "#3C3936", "#8FD8FF"], zzz: "#BFEAFF" },
  day: { desk: "#C9A074", grain: "#B48A5E", bg: "#EAE0CA", cell: ["#CDBFA4", "#BCAD90", "#D9B88A", "#D3C6AC", "#5AA8D8"], zzz: "#3E7FB0" },
};
type CellColors = string[];

// 電子 (目のある小さな玉)
const Electron: React.FC<{ x: number; y: number; r?: number; sleep?: boolean; glow?: number; tail?: [number, number] }> = ({
  x, y, r = 14, sleep = false, glow = 1, tail,
}) => (
  <g>
    {tail && <line x1={tail[0]} y1={tail[1]} x2={x} y2={y} stroke="#BFEAFF" strokeWidth={r * 0.9} strokeLinecap="round" opacity={0.35} />}
    <circle cx={x} cy={y} r={r * 2.1} fill="#8FD8FF" opacity={0.28 * glow} filter="url(#yglowS)" />
    <circle cx={x} cy={y} r={r} fill="#8FD8FF" stroke={YRP.ink} strokeWidth={3} />
    <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.3} fill="#FFFFFF" opacity={0.7} />
    {sleep ? (
      <g stroke={YRP.ink} strokeWidth={2.4} strokeLinecap="round">
        <line x1={x - r * 0.55} y1={y + r * 0.05} x2={x - r * 0.15} y2={y + r * 0.05} />
        <line x1={x + r * 0.15} y1={y + r * 0.05} x2={x + r * 0.55} y2={y + r * 0.05} />
      </g>
    ) : (
      <g fill={YRP.ink}>
        <circle cx={x - r * 0.33} cy={y + r * 0.05} r={r * 0.17} />
        <circle cx={x + r * 0.33} cy={y + r * 0.05} r={r * 0.17} />
      </g>
    )}
  </g>
);

// 部屋に入る電子の最終位置 (5列×2段)
const SEATS: [number, number][] = Array.from({ length: 10 }).map((_, i) => [728 + (i % 5) * 116 + Math.floor(i / 5) * 54, 556 + Math.floor(i / 5) * 54]);

// 奥に並ぶ「同じ部屋」(何十億個のうちのいくつか)。シルエットだけ
const MiniCell: React.FC<{ x: number; y: number; s: number; lit: boolean; f: number; i: number; c: CellColors }> = ({ x, y, s, lit, f, i, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-60} width={30} height={60} fill={c[0]} />
    <rect x={90} y={-60} width={30} height={60} fill={c[0]} />
    <rect x={-80} y={-150} width={160} height={36} fill={c[0]} />
    <rect x={-84} y={-114} width={168} height={14} fill={c[1]} />
    <rect x={-74} y={-100} width={148} height={40} fill={lit ? c[2] : c[3]} />
    <rect x={-84} y={-60} width={168} height={12} fill={c[1]} />
    {lit && [0, 1, 2].map((j) => (
      <circle key={j} cx={-40 + j * 40} cy={-80} r={8} fill={c[4]} opacity={0.55 + 0.3 * Math.sin(f / 9 + i + j)} />
    ))}
  </g>
);

const CrossSection: React.FC<{ f: number; zzz: string; lightBg?: boolean }> = ({ f, zzz, lightBg = false }) => {
  // f はこの場面の通しフレーム。断面は 56 から
  const writeOn = seg(f, 64, 72) * (1 - seg(f, 100, 108)); // 上のふたに強い電気
  const off = f >= 104;
  const chanFlow = seg(f, 60, 70) * (1 - seg(f, 100, 110));
  const cgGlow = writeOn;
  return (
    <g>
      {/* 土台 (シリコン) */}
      <rect x={-200} y={690} width={2320} height={600} fill={lightBg ? "#8E88AE" : "#4E4B6A"} />
      {Array.from({ length: 90 }).map((_, i) => (
        <circle key={i} cx={-150 + (i % 18) * 124 + (Math.floor(i / 18) % 2) * 62} cy={740 + Math.floor(i / 18) * 70} r={4} fill={lightBg ? "#A9A3C6" : "#6B6890"} opacity={0.7} />
      ))}
      <line x1={-200} y1={690} x2={2120} y2={690} stroke={YRP.ink} strokeWidth={6} />
      {/* 2つの井戸 (左右) */}
      <path d="M 260 690 Q 260 840 480 840 Q 700 840 700 690 Z" fill="#3F78A8" stroke={YRP.ink} strokeWidth={5} />
      <path d="M 1220 690 Q 1220 840 1440 840 Q 1660 840 1660 690 Z" fill="#3F78A8" stroke={YRP.ink} strokeWidth={5} />
      {/* 金属の柱 (左右) */}
      {[480, 1440].map((x) => (
        <g key={x}>
          <rect x={x - 26} y={250} width={52} height={442} fill="#B9BEC4" stroke={YRP.ink} strokeWidth={5} />
          <rect x={x - 26} y={250} width={14} height={442} fill="#FFFFFF" opacity={0.18} />
          <rect x={x - 70} y={220} width={140} height={34} rx={6} fill="#C9A44A" stroke={YRP.ink} strokeWidth={4} />
        </g>
      ))}
      {/* うすい絶縁の壁 (下) */}
      <rect x={640} y={644} width={640} height={46} fill="#CFE6EE" opacity={0.8} stroke={YRP.ink} strokeWidth={4} />
      {/* ぶあつい絶縁の壁 (上と横) */}
      <path d="M 616 644 L 616 452 L 1304 452 L 1304 644 L 1260 644 L 1260 506 L 660 506 L 660 644 Z" fill="#BFDCE6" opacity={0.78} stroke={YRP.ink} strokeWidth={4} />
      {/* 浮いた部屋 (浮遊ゲート) */}
      <rect x={660} y={506} width={600} height={138} fill="#B88A4C" stroke={YRP.ink} strokeWidth={5} />
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i} cx={690 + rnd(i * 3) * 540} cy={520 + rnd(i * 5) * 110} r={3} fill="#8E6634" opacity={0.6} />
      ))}
      {/* 上のふた (制御ゲート) */}
      <rect x={616} y={330} width={688} height={122} fill="#7E868F" stroke={YRP.ink} strokeWidth={5} />
      {cgGlow > 0 && <rect x={600} y={316} width={720} height={150} fill={YRP.lamp} opacity={0.5 * cgGlow} filter="url(#yglow)" />}
      <rect x={616} y={330} width={688} height={122} fill={YRP.lamp} opacity={0.35 * cgGlow} />
      <rect x={930} y={170} width={60} height={162} fill="#B9BEC4" stroke={YRP.ink} strokeWidth={5} />
      <rect x={890} y={140} width={140} height={34} rx={6} fill="#C9A44A" stroke={YRP.ink} strokeWidth={4} />
      {cgGlow > 0.05 && (
        <text x={960} y={118} textAnchor="middle" fontFamily={GOTHIC} fontWeight={900} fontSize={52} fill={YRP.lamp} opacity={cgGlow}>＋</text>
      )}
      {/* 通り道の電子 (左→右へ流れる) */}
      {chanFlow > 0 && Array.from({ length: 9 }).map((_, i) => {
        const t = ((f / 46 + i / 9) % 1);
        return <Electron key={i} x={lerp(560, 1360, t)} y={718 + Math.sin(i * 2.1) * 8} r={11} glow={chanFlow} />;
      })}
      {/* 壁をすり抜けて部屋へ入る電子 */}
      {SEATS.map(([sx, sy], i) => {
        const t0 = 70 + i * 2.3;
        const t = seg(f, t0, t0 + 12);
        if (t <= 0) return null;
        const startX = sx - 40;
        const k = easeInOut(t);
        const x = lerp(startX, sx, k);
        const y = lerp(720, sy, k);
        const moving = t < 1;
        return <Electron key={i} x={x} y={y} r={18} sleep={off && f > 116} glow={off ? 0.8 + 0.2 * Math.sin(f / 7 + i) : 1}
          tail={moving ? [lerp(startX, sx, Math.max(0, k - 0.25)), lerp(720, sy, Math.max(0, k - 0.25))] : undefined} />;
      })}
      {/* 眠る電子の zzz */}
      {off && f > 120 && (
        <g fontFamily={GOTHIC} fontWeight={900} fill={zzz} opacity={seg(f, 120, 130)}>
          <text x={1206} y={548 - (f % 40) * 0.4} fontSize={30}>z</text>
          <text x={1230} y={526 - (f % 40) * 0.5} fontSize={24}>z</text>
        </g>
      )}
    </g>
  );
};

export const SaveC: React.FC<{ f: number }> = ({ f }) => {
  const mood = useMood();
  const note = mood === "note";
  const plain = isPlain(mood);
  const C = isLightBg(mood) ? CAVE.day : mood === "flat" ? CAVE.flat : CAVE.night;
  const leader = note ? PEN : YRP.paper;
  // 場面1 (0〜60): 机の上のメモリーカード → 寄って潜る
  const dive = easeInOut(seg(f, 26, 60));
  const scA = 1 + dive * 7;
  const fadeB = seg(f, 50, 62);
  // 場面2 のカメラ (ゆっくり引く)
  const scB = 1.12 - easeInOut(seg(f, 56, 150)) * 0.1;
  const lo = narratorLight(1700, 692, 0.62, 98, -1);
  const off = f >= 104;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={37} f={f} />
      <defs>
        <radialGradient id="cardSpot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFF4D0" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#FFF4D0" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="caveLight" cx="960" cy="520" r="900" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2CC" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#FFF2CC" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={C.bg} />
      {/* ===== 場面1: 机の上のメモリーカード ===== */}
      {fadeB < 1 && (
        <g opacity={1 - fadeB} transform={`translate(960 540) scale(${scA}) translate(-960 -520)`}>
          <g filter="url(#ywobble)">
            {note ? <NoteDeskC /> : (<>
            <rect x={-100} y={-100} width={2200} height={1300} fill={C.desk} />
            {Array.from({ length: 14 }).map((_, i) => (
              <path key={i} d={`M -100 ${40 + i * 80} Q 900 ${20 + i * 80 + (i % 3) * 20} 2100 ${50 + i * 80}`} stroke={C.grain} strokeWidth={4} fill="none" />
            ))}
            {!plain && <ellipse cx={960} cy={540} rx={520} ry={360} fill="url(#cardSpot)" />}
            </>)}
            {/* カード */}
            <g transform="translate(960 520) rotate(-8)">
              <rect x={-250} y={-150} width={500} height={310} rx={26} fill="#000" opacity={0.45} transform="translate(14 18)" />
              <path d="M -250 -124 Q -250 -150 -224 -150 L 190 -150 L 250 -96 L 250 134 Q 250 160 224 160 L -224 160 Q -250 160 -250 134 Z" fill="#8E949C" stroke={YRP.ink} strokeWidth={6} strokeLinejoin="round" />
              <path d="M -232 -132 L 180 -132" stroke="#B9BEC4" strokeWidth={6} strokeLinecap="round" />
              {/* 端子のくぼみ */}
              <rect x={-196} y={-150} width={300} height={44} rx={6} fill="#5E646C" stroke={YRP.ink} strokeWidth={4} />
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i} x={-184 + i * 36} y={-146} width={24} height={34} rx={3} fill="#D9B23C" stroke={YRP.ink} strokeWidth={2.5} />
              ))}
              {/* 無地のラベル */}
              <rect x={-200} y={-70} width={400} height={200} rx={12} fill="#E3DCCB" stroke={YRP.ink} strokeWidth={4} />
              <rect x={-200} y={-70} width={400} height={30} rx={12} fill="#C9C0AE" />
              {/* 寄る先: チップの気配 */}
              <rect x={-26} y={14} width={52} height={40} rx={4} fill="#2A2A2E" opacity={0.2 + dive * 0.8} />
            </g>
          </g>
          <Dust f={f} x={600} y={260} w={700} h={500} n={18} seed={9} />
        </g>
      )}
      {/* ===== 場面2: チップの中の断面 ===== */}
      {fadeB > 0 && (
        <g opacity={fadeB}>
          <g transform={`translate(960 540) scale(${scB}) translate(-960 -520)`}>
            <g filter="url(#ywobbleFine)">
              {note ? (<><NotePaper /><NoteCellsC /></>) : (<>
              <rect x={-200} y={-200} width={2320} height={900} fill={C.bg} />
              {/* 奥に並ぶ同じ部屋 (2列) */}
              <g opacity={0.5}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <MiniCell key={`r2${i}`} x={-160 + i * 150} y={196} s={0.42} lit={rnd(i * 13) > 0.45} f={f} i={i} c={C.cell} />
                ))}
              </g>
              <g opacity={0.75}>
                {Array.from({ length: 11 }).map((_, i) => (
                  <MiniCell key={`r1${i}`} x={-120 + i * 220} y={300} s={0.62} lit={rnd(i * 7 + 3) > 0.4} f={f} i={i + 20} c={C.cell} />
                ))}
              </g>
              <rect x={-200} y={300} width={2320} height={400} fill={C.bg} opacity={0.55} />
              </>)}
              {/* 上の銅の配線 */}
              <g>
                <rect x={-200} y={60} width={2320} height={26} fill="#9A6A3C" stroke={YRP.ink} strokeWidth={4} />
                <rect x={-200} y={60} width={2320} height={7} fill="#D9A06A" opacity={0.5} />
                <rect x={466} y={86} width={28} height={136} fill="#9A6A3C" stroke={YRP.ink} strokeWidth={4} />
                <rect x={1426} y={86} width={28} height={136} fill="#9A6A3C" stroke={YRP.ink} strokeWidth={4} />
                <rect x={-200} y={-20} width={2320} height={22} fill="#7E5530" stroke={YRP.ink} strokeWidth={4} />
                <rect x={946} y={2} width={28} height={140} fill="#7E5530" stroke={YRP.ink} strokeWidth={4} />
              </g>
              <CrossSection f={f} zzz={C.zzz} lightBg={isLightBg(mood)} />
            </g>
            {!note && !plain && <rect x={-200} y={-200} width={2320} height={1500} fill="url(#caveLight)" style={{ mixBlendMode: "screen" }} />}
            {/* 語り手 (断面の上に立って照らす) */}
            <Beam id="cb" x={lo.x} y={lo.y} dir={lo.dir} len={640} spread={26} opacity={0.24} />
            {note ? (
              <g filter="url(#ywobbleNote)">
                <NoteFolk x={1700} y={692} s={0.62} f={f} hair="hood" light={-1} armL={98} armR={-8}
                  face={f < 76 ? "jito" : f < 112 ? "wide" : "normal"} gaze={[-5, 1]} />
              </g>
            ) : (
            <g filter="url(#yrim)">
              <Narrator x={1700} y={692} s={0.62} f={f} light lightSide={-1} armL={98} armR={-8}
                face={f < 76 ? "jito" : f < 112 ? "wide" : "smirk"} gaze={[-5, 1]} />
            </g>
            )}
            {/* 札 */}
            <NightTag x={300} y={575} text="浮いた部屋" t={seg(f, 70, 82)} size={34} />
            <line x1={410} y1={575} x2={655} y2={575} stroke={leader} strokeWidth={3} opacity={seg(f, 74, 82)} />
            <NightTag x={300} y={666} text="うすい壁" t={seg(f, 80, 90)} size={30} color="#DCEFF5" />
            <line x1={390} y1={666} x2={636} y2={666} stroke={leader} strokeWidth={3} opacity={seg(f, 84, 90)} />
            <NightTag x={300} y={470} text="ぶあつい壁" t={seg(f, 88, 98)} size={30} color="#DCEFF5" />
            <NightTag x={300} y={390} text="上のふた" t={seg(f, 62, 72)} size={30} />
            <line x1={384} y1={390} x2={612} y2={390} stroke={leader} strokeWidth={3} opacity={seg(f, 66, 72)} />
            <line x1={410} y1={470} x2={612} y2={470} stroke={leader} strokeWidth={3} opacity={seg(f, 92, 98)} />
            {/* 電源OFF */}
            {off && (
              <g transform={`translate(1540 200) rotate(-6) scale(${pop(seg(f, 104, 114))})`}>
                <rect x={-130} y={-44} width={260} height={78} rx={10} fill="none" stroke={YRP.red} strokeWidth={7} />
                <text x={0} y={14} textAnchor="middle" fontFamily={GOTHIC} fontWeight={900} fontSize={46} fill={YRP.red} letterSpacing={4}>電源 OFF</text>
              </g>
            )}
          </g>
        </g>
      )}
      {/* 潜る瞬間の白い光 */}
      <rect width={W} height={H} fill="#DDF3FF" opacity={clamp01(1 - Math.abs(f - 56) / 6) * 0.55} />
      <NightFinish grain={0.06} />
      <FileTag no="01" title="冒険の書は、なぜ消えたのか" f={f} />
      <Caption f={f} text={f < 56 ? "電池のいらない記憶は、何を閉じこめているのか" : !off ? "電子を、壁で囲んだ「浮いた部屋」に押しこむ" : "電気を切っても、電子は部屋から出られない"} />
    </svg>
  );
};
