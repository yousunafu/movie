// 夜の深掘り 試作: セーブ回 2枚目 (山)「カセットの中で、小さな電池が記録を守っている」
// 6点法: 寄る (基板が画面の半分以上) / 世界 (夜の作業台・有孔ボード・電気スタンド)
//        部品 (基板を精巧に: 端子30本・DIPの足・電池のタブ・ダイオード・抵抗のカラー帯)
//        カメラ (全体 → 電池と記録チップへ寄る) / 事件 (電源OFF → 電池から記録チップへだけ電気が流れ続ける)
//        人の反応 (語り手が懐中電灯で照らし、OFF の瞬間に目を見開く)
// ★チップの表面に会社名・型番は描かない。基板にも文字なし (札で説明する)
import React from "react";
import { NoteBenchB, NoteFolk, PEN } from "./YoruNote";
import {
  W, H, YRP, GOTHIC, seg, easeInOut, pop, rnd,
  YoruDefs, NightFinish, Caption, FileTag, Narrator, narratorLight, Beam, Dust, NightTag, useMood, isPlain, isLightBg,
} from "./YoruShared";

// 作業部屋の色 (作風ごと)
const BENCH = {
  night: { bg: "#11151F", peg: "#262C38", hole: "#141822", tools: 0.55, bench: "#4A3828", top: "#5E4836", grain: "#3E2E20" },
  flat: { bg: "#232A3B", peg: "#323A4C", hole: "#1E2433", tools: 0.6, bench: "#5E4632", top: "#6E5640", grain: "#523E2C" },
  day: { bg: "#EFE3C8", peg: "#D6BC94", hole: "#8A6A48", tools: 0.95, bench: "#B98E62", top: "#C9A074", grain: "#A87E54" },
};

type P = [number, number];
// 折れ線の上を t (0〜1) 進んだ位置
const along = (pts: P[], t: number): P => {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = (((t % 1) + 1) % 1) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const k = d / lens[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
};
const poly = (pts: P[]) => pts.map((p) => p.join(",")).join(" ");

// DIP のチップ (足は上下)
const Chip: React.FC<{ x: number; y: number; w: number; h: number; pins: number; glow?: number; glowColor?: string }> = ({
  x, y, w, h, pins, glow = 0, glowColor = YRP.glow,
}) => {
  const gap = (w - 20) / (pins - 1);
  return (
    <g>
      {glow > 0 && <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} rx={20} fill={glowColor} opacity={0.42 * glow} filter="url(#yglow)" />}
      {Array.from({ length: pins }).map((_, i) => (
        <g key={i}>
          <rect x={x + 10 + i * gap - 5} y={y - 16} width={10} height={18} rx={2} fill="#C9CFD4" stroke={YRP.ink} strokeWidth={2} />
          <rect x={x + 10 + i * gap - 5} y={y + h - 2} width={10} height={18} rx={2} fill="#C9CFD4" stroke={YRP.ink} strokeWidth={2} />
          {/* はんだの玉 */}
          <circle cx={x + 10 + i * gap} cy={y - 20} r={5} fill="#D7DADF" stroke={YRP.ink} strokeWidth={1.5} />
          <circle cx={x + 10 + i * gap} cy={y + h + 20} r={5} fill="#D7DADF" stroke={YRP.ink} strokeWidth={1.5} />
        </g>
      ))}
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#232327" stroke={YRP.ink} strokeWidth={4} />
      <rect x={x + 6} y={y + 5} width={w - 12} height={10} rx={4} fill="#3A3A40" opacity={0.8} />
      <path d={`M ${x} ${y + h / 2 - 14} A 14 14 0 0 1 ${x} ${y + h / 2 + 14}`} fill="#141416" stroke={YRP.ink} strokeWidth={2.5} />
      <circle cx={x + 30} cy={y + h - 22} r={6} fill="#6E6E74" />
    </g>
  );
};

// 抵抗 (カラー帯つき)
const Resistor: React.FC<{ x: number; y: number; bands: string[] }> = ({ x, y, bands }) => (
  <g>
    <line x1={x - 50} y1={y} x2={x + 50} y2={y} stroke="#C9CFD4" strokeWidth={4} />
    <circle cx={x - 50} cy={y} r={6} fill="#D7DADF" stroke={YRP.ink} strokeWidth={1.5} />
    <circle cx={x + 50} cy={y} r={6} fill="#D7DADF" stroke={YRP.ink} strokeWidth={1.5} />
    <rect x={x - 30} y={y - 11} width={60} height={22} rx={11} fill="#D9C8A0" stroke={YRP.ink} strokeWidth={3} />
    {bands.map((c, i) => <rect key={i} x={x - 20 + i * 11} y={y - 11} width={6} height={22} fill={c} />)}
  </g>
);

export const SaveB: React.FC<{ f: number }> = ({ f }) => {
  const mood = useMood();
  const note = mood === "note";
  const plain = isPlain(mood);
  const light = isLightBg(mood);
  const C = light ? BENCH.day : mood === "flat" ? BENCH.flat : BENCH.night;
  const leader = note ? PEN : YRP.paper;
  const OFF = 58;
  const on = f < OFF;
  const offT = seg(f, OFF, OFF + 10); // 0→1 で電気が消えていく
  const mainLvl = on ? seg(f, 4, 18) : 1 - offT;
  const batLvl = seg(f, OFF + 10, OFF + 26);
  const heart = 0.75 + 0.25 * Math.sin(f / 5);
  // カメラ
  const k = easeInOut(seg(f, 40, 140));
  const sc = 1 + k * 0.2;
  const cx = 960 + (1150 - 960) * k;
  const cy = 540 + (548 - 540) * k;

  // 電気の道 (端子 → 上へ → ROM2つ と 記録チップ)
  const mainPath: P[] = [[700, 790], [700, 700], [600, 700], [600, 470], [790, 470], [790, 452]];
  const mainPath2: P[] = [[700, 700], [1000, 700], [1000, 480], [1190, 480], [1190, 452]];
  const mainPath3: P[] = [[600, 470], [600, 660], [790, 660], [790, 642]];
  // 電池 → ダイオード → 記録チップ
  const batPath: P[] = [[1452, 474], [1452, 300], [1360, 300], [1360, 266], [1200, 266], [1200, 314]];

  const lightOrigin = narratorLight(1730, 1012, 0.92, 118, -1);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <YoruDefs seed={23} f={f} />
      <defs>
        <linearGradient id="pcbG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2F7350" />
          <stop offset="100%" stopColor="#24583E" />
        </linearGradient>
        <radialGradient id="lampPool" cx="900" cy="420" r="820" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={YRP.glow} stopOpacity={0.30} />
          <stop offset="60%" stopColor={YRP.glow} stopOpacity={0.08} />
          <stop offset="100%" stopColor={YRP.glow} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="spotB" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFF4D0" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFF4D0" stopOpacity={0} />
        </radialGradient>
        <pattern id="pegHoles" width="44" height="44" patternUnits="userSpaceOnUse">
          <circle cx="22" cy="22" r="5" fill={C.hole} />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={C.bg} />
      <g transform={`translate(960 540) scale(${sc}) translate(${-cx} ${-cy})`}>
        <g filter="url(#ywobble)">
          {note ? <NoteBenchB /> : (<>
          {/* ===== 有孔ボードの壁 ===== */}
          <rect x={-300} y={-300} width={2600} height={1200} fill={C.peg} />
          <rect x={-300} y={-300} width={2600} height={1200} fill="url(#pegHoles)" opacity={0.9} />
          {/* 壁にかかった道具 (シルエット気味) */}
          <g opacity={C.tools}>
            {/* ラジオペンチ */}
            <g transform="translate(250 150) rotate(8)">
              <path d="M -10 0 L -4 120 L 4 120 L 10 0 Z" fill="#7E868E" stroke={YRP.ink} strokeWidth={3} />
              <path d="M -6 120 Q -30 200 -24 260" stroke="#B2463A" strokeWidth={14} fill="none" strokeLinecap="round" />
              <path d="M 6 120 Q 30 200 24 260" stroke="#B2463A" strokeWidth={14} fill="none" strokeLinecap="round" />
            </g>
            {/* はんだの巻き */}
            <g transform="translate(1720 170)">
              <circle r={58} fill="#5E646C" stroke={YRP.ink} strokeWidth={4} />
              <circle r={44} fill="#B9BEC4" stroke={YRP.ink} strokeWidth={3} />
              {Array.from({ length: 6 }).map((_, i) => <circle key={i} r={38 - i * 4} fill="none" stroke="#9AA0A6" strokeWidth={1.5} />)}
              <circle r={14} fill="#2A2F38" stroke={YRP.ink} strokeWidth={3} />
            </g>
            {/* ドライバー立て */}
            <rect x={1620} y={300} width={180} height={18} fill="#4A3A2C" stroke={YRP.ink} strokeWidth={3} />
          </g>
          {/* ===== 電気スタンド (左上から) ===== */}
          <g>
            <path d="M -40 140 L 210 40 L 330 170" fill="none" stroke="#2F3A40" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={210} cy={40} r={14} fill="#3A464C" stroke={YRP.ink} strokeWidth={4} />
            <path d="M 290 140 L 420 140 L 470 250 L 240 250 Z" fill="#2F4A44" stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" transform="rotate(-18 355 195)" />
            <ellipse cx={378} cy={262} rx={104} ry={20} fill={YRP.glow} opacity={0.9} transform="rotate(-18 378 262)" />
          </g>
          {!light && <polygon points="286,270 466,214 1500,560 700,1000" fill={YRP.glow} opacity={0.07} />}
          {/* ===== 作業台 ===== */}
          <rect x={-300} y={900} width={2600} height={400} fill={C.bench} />
          <rect x={-300} y={900} width={2600} height={16} fill={C.top} stroke={YRP.ink} strokeWidth={4} />
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={i} d={`M -300 ${940 + i * 22} Q 800 ${930 + i * 22 + (i % 2) * 12} 2300 ${944 + i * 22}`} stroke={C.grain} strokeWidth={3} fill="none" />
          ))}
          </>)}
          {/* ===== 基板ホルダーの台 ===== */}
          <rect x={520} y={870} width={1140} height={40} rx={8} fill="#3C4148" stroke={YRP.ink} strokeWidth={5} />
          <rect x={540} y={176} width={34} height={710} rx={6} fill="#555B63" stroke={YRP.ink} strokeWidth={4} />
          <rect x={1606} y={176} width={34} height={710} rx={6} fill="#555B63" stroke={YRP.ink} strokeWidth={4} />
          {/* ===== 基板 ===== */}
          <g filter="url(#ywobbleFine)">
            <rect x={560} y={200} width={1060} height={668} rx={14} fill="url(#pcbG)" stroke={YRP.ink} strokeWidth={6} />
            {/* 取りつけ穴 */}
            {[[600, 240], [1580, 240]].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={18} fill="#D9B23C" stroke={YRP.ink} strokeWidth={3} />
                <circle cx={x} cy={y} r={9} fill="#1A1F18" />
              </g>
            ))}
            {/* 細い配線 (飾りの配線は薄く) */}
            {/* ROM の下の足から端子へ、並んで降りる配線 (バス) */}
            {Array.from({ length: 12 }).map((_, i) => {
              const px = 650 + (i + 1) * 21.5;
              const fx = 666 + (i + 3) * 30;
              const yA = 646 + i * 3;
              return (
                <polyline key={`b${i}`} points={`${px},644 ${px},${yA + 6} ${fx},${yA + 48 + i * 2} ${fx},796`} fill="none" stroke="#4FA073" strokeWidth={4} opacity={0.62} strokeLinejoin="round" />
              );
            })}
            {Array.from({ length: 10 }).map((_, i) => {
              const px = 1050 + (i + 1) * 21.5;
              const fx = 1086 + (i + 1) * 30 + 150;
              return (
                <polyline key={`c${i}`} points={`${px},454 ${px},${480 + i * 4} ${px + 8},${488 + i * 4}`} fill="none" stroke="#4FA073" strokeWidth={4} opacity={0.5} strokeLinejoin="round" />
              );
            })}
            {Array.from({ length: 8 }).map((_, i) => (
              <polyline key={`d${i}`} points={`${1306 + i * 30},796 ${1306 + i * 30},${760 - i * 6} ${1360 + i * 12},${700 - i * 8}`} fill="none" stroke="#4FA073" strokeWidth={4} opacity={0.45} strokeLinejoin="round" />
            ))}
            {/* シルク印刷の枠 (白。文字は入れない) */}
            <g fill="none" stroke="#E9EFE9" strokeWidth={3} opacity={0.55}>
              <rect x={628} y={300} width={324} height={164} rx={4} />
              <rect x={628} y={490} width={324} height={164} rx={4} />
              <rect x={1028} y={300} width={324} height={164} rx={4} />
              <rect x={1048} y={526} width={174} height={118} rx={4} />
              <circle cx={1452} cy={560} r={96} />
              <rect x={1430} y={290} width={44} height={84} rx={4} />
            </g>
            {/* ビア (表と裏をつなぐ穴) */}
            {Array.from({ length: 18 }).map((_, i) => (
              <g key={`v${i}`}>
                <circle cx={600 + (i % 6) * 170 + rnd(i) * 30} cy={250 + Math.floor(i / 6) * 270 + rnd(i * 5) * 20} r={7} fill="#D9B23C" stroke={YRP.ink} strokeWidth={1.5} />
                <circle cx={600 + (i % 6) * 170 + rnd(i) * 30} cy={250 + Math.floor(i / 6) * 270 + rnd(i * 5) * 20} r={3} fill="#14251B" />
              </g>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <circle key={i} cx={650 + rnd(i) * 900} cy={260 + rnd(i * 7) * 380} r={5} fill="#D9B23C" stroke={YRP.ink} strokeWidth={1.5} opacity={0.8} />
            ))}
            {/* 主要な電気の道 (太め) */}
            {[mainPath, mainPath2, mainPath3].map((p, i) => (
              <polyline key={i} points={poly(p)} fill="none" stroke="#5DB585" strokeWidth={8} strokeLinejoin="round" opacity={0.85} />
            ))}
            <polyline points={poly(batPath)} fill="none" stroke="#5DB585" strokeWidth={8} strokeLinejoin="round" opacity={0.85} />
            {/* 端子 30本 (金) */}
            <rect x={560} y={790} width={1060} height={78} fill="#24583E" />
            {Array.from({ length: 30 }).map((_, i) => (
              <rect key={i} x={636 + i * 30} y={796} width={20} height={66} rx={3} fill="#D9B23C" stroke={YRP.ink} strokeWidth={2.5} />
            ))}
            {/* 端子の光 (電源ON の間) */}
            {mainLvl > 0 && Array.from({ length: 30 }).map((_, i) => (
              <rect key={i} x={636 + i * 30} y={796} width={20} height={66} rx={3} fill={YRP.glow} opacity={0.35 * mainLvl} />
            ))}
            {/* チップ */}
            <Chip x={640} y={330} w={300} h={104} pins={14} glow={mainLvl} />
            <Chip x={640} y={520} w={300} h={104} pins={14} glow={mainLvl} />
            <Chip x={1040} y={330} w={300} h={104} pins={14} glow={on ? mainLvl : batLvl * heart} glowColor={on ? YRP.glow : "#9EF0C8"} />
            <Chip x={1060} y={556} w={150} h={58} pins={7} glow={mainLvl * 0.7} />
            {/* 抵抗とコンデンサ */}
            <Resistor x={1150} y={700} bands={["#8B4A2B", "#1A1A1A", "#D3402E", "#D9B23C"]} />
            <Resistor x={1150} y={752} bands={["#D9B23C", "#5A3A8A", "#8B4A2B", "#D9B23C"]} />
            <g>
              <line x1={1290} y1={640} x2={1290} y2={700} stroke="#C9CFD4" strokeWidth={4} />
              <line x1={1320} y1={640} x2={1320} y2={700} stroke="#C9CFD4" strokeWidth={4} />
              <ellipse cx={1305} cy={630} rx={34} ry={26} fill="#3E6FB0" stroke={YRP.ink} strokeWidth={3.5} />
              <ellipse cx={1298} cy={622} rx={12} ry={6} fill="#FFFFFF" opacity={0.25} />
            </g>
            {/* ダイオード (逆流どめ) */}
            <g transform="translate(1452 330)">
              <line x1={0} y1={-40} x2={0} y2={40} stroke="#C9CFD4" strokeWidth={4} />
              <rect x={-11} y={-24} width={22} height={48} rx={8} fill="#E07A3A" opacity={0.85} stroke={YRP.ink} strokeWidth={3} />
              <rect x={-11} y={-24} width={22} height={9} fill="#2A2420" />
            </g>
            {/* ボタン電池 + 溶接されたタブ */}
            <g transform="translate(1452 560)">
              <rect x={-16} y={-120} width={32} height={62} fill="#B9BEC4" stroke={YRP.ink} strokeWidth={3} />
              <rect x={-16} y={58} width={32} height={62} fill="#B9BEC4" stroke={YRP.ink} strokeWidth={3} />
              {batLvl > 0 && <circle r={110} fill="#9EF0C8" opacity={0.35 * batLvl * heart} filter="url(#yglow)" />}
              <circle r={86} fill="#C9CFD4" stroke={YRP.ink} strokeWidth={5} />
              <circle r={72} fill="#D7DADF" stroke="#9AA0A6" strokeWidth={3} />
              <path d="M -16 0 h 32 M 0 -16 v 32" stroke="#8A9096" strokeWidth={7} strokeLinecap="round" />
              {[-1, 1].map((s) => (
                <g key={s}>
                  <circle cx={s * 10} cy={-74} r={5} fill="#8A9096" />
                  <circle cx={s * 10} cy={74} r={5} fill="#8A9096" />
                </g>
              ))}
              <path d="M -56 -40 Q -40 -62 -14 -66" stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
            </g>
          </g>
          {/* ===== 電気の粒 ===== */}
          {mainLvl > 0.02 && [mainPath, mainPath2, mainPath3].map((p, pi) =>
            Array.from({ length: 6 }).map((_, i) => {
              const [x, y] = along(p, f / 40 + i / 6 + pi * 0.13);
              return <circle key={`${pi}-${i}`} cx={x} cy={y} r={7} fill={YRP.glow} opacity={mainLvl} />;
            }),
          )}
          {batLvl > 0 && Array.from({ length: 7 }).map((_, i) => {
            const [x, y] = along(batPath, f / 55 + i / 7);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={14} fill="#9EF0C8" opacity={0.35 * batLvl} filter="url(#yglowS)" />
                <circle cx={x} cy={y} r={6.5} fill="#E2FFF0" opacity={batLvl} />
              </g>
            );
          })}
          {/* ===== 開けたカセットの殻 (手前の台の上) ===== */}
          <g transform="translate(250 960) rotate(-8)">
            <ellipse cx={0} cy={64} rx={190} ry={20} fill="#000" opacity={0.4} />
            <path d="M -170 -40 L 170 -40 L 180 60 L -180 60 Z" fill="#4B4E56" stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -150 -26 L 150 -26 L 158 48 L -158 48 Z" fill="#3A3D44" stroke={YRP.ink} strokeWidth={3} />
            {[-90, 90].map((x) => (
              <g key={x}>
                <circle cx={x} cy={10} r={16} fill="#55585F" stroke={YRP.ink} strokeWidth={3} />
                <circle cx={x} cy={10} r={7} fill="#26282D" />
              </g>
            ))}
            {[-40, 0, 40].map((x) => <line key={x} x1={x} y1={-26} x2={x} y2={48} stroke="#2E3036" strokeWidth={4} />)}
          </g>
          {/* 特殊なねじ2本 と ドライバー */}
          {[[470, 980], [512, 996]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={11} fill="#C9CFD4" stroke={YRP.ink} strokeWidth={3} />
              <circle cx={x} cy={y} r={5} fill="#7E868E" />
              <circle cx={x} cy={y} r={2} fill="#C9CFD4" />
            </g>
          ))}
          <g transform="translate(140 1040) rotate(-6)">
            <rect x={0} y={-14} width={130} height={28} rx={12} fill="#B2463A" stroke={YRP.ink} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => <line key={i} x1={20 + i * 26} y1={-12} x2={20 + i * 26} y2={12} stroke="#8A2E26" strokeWidth={4} />)}
            <rect x={130} y={-5} width={170} height={10} fill="#C9CFD4" stroke={YRP.ink} strokeWidth={3} />
          </g>
        </g>
        {/* スタンドの光 */}
        {!note && !plain && <rect x={-300} y={-300} width={2600} height={1500} fill="url(#lampPool)" style={{ mixBlendMode: "screen" }} />}
        <Dust f={f} x={400} y={180} w={1100} h={640} n={26} seed={5} />
        {/* ===== 語り手 (懐中電灯で電池を照らす) ===== */}
        <Beam id="nb" x={lightOrigin.x} y={lightOrigin.y} dir={lightOrigin.dir} len={520} spread={22} opacity={0.28} />
        {!note && !plain && <ellipse cx={1452} cy={520} rx={150} ry={120} fill="url(#spotB)" style={{ mixBlendMode: "screen" }} />}
        {note ? (
          <g filter="url(#ywobbleNote)">
            <NoteFolk x={1730} y={1012} s={0.92} f={f} hair="hood" light={-1} armL={118} armR={-6}
              face={f < OFF + 6 ? "jito" : "wide"} gaze={f < OFF + 6 ? [-4, 2] : [-5, 0]} />
          </g>
        ) : (
          <g filter="url(#yrim)">
          <Narrator x={1730} y={1012} s={0.92} f={f} light lightSide={-1} armL={118} armR={-6}
            face={f < OFF + 6 ? "jito" : "wide"} gaze={f < OFF + 6 ? [-4, 2] : [-5, 0]} />
        </g>
        )}
        {/* ===== 札 ===== */}
        <g>
          <line x1={790} y1={316} x2={790} y2={250} stroke={leader} strokeWidth={3} opacity={seg(f, 16, 24)} />
          <NightTag x={790} y={236} text="ゲームの中身（読むだけ）" t={seg(f, 16, 28)} size={30} />
          <line x1={1190} y1={316} x2={1190} y2={196} stroke={leader} strokeWidth={3} opacity={seg(f, 70, 80)} />
          <NightTag x={1190} y={182} text="冒険の記録（電気が切れると消える）" t={seg(f, 72, 86)} size={30} color="#DFF7EA" />
          <NightTag x={1452} y={700} text="ボタン電池" t={seg(f, 84, 96)} size={32} color="#DFF7EA" />
        </g>
        {/* 電源OFF の印 */}
        {f >= OFF && (
          <g transform={`translate(790 740) rotate(-6) scale(${pop(seg(f, OFF, OFF + 10))})`} opacity={1 - seg(f, 110, 130) * 0.4}>
            <rect x={-130} y={-44} width={260} height={78} rx={10} fill="#1A1414" opacity={0.75} />
            <rect x={-130} y={-44} width={260} height={78} rx={10} fill="none" stroke={YRP.red} strokeWidth={7} />
            <text x={0} y={14} textAnchor="middle" fontFamily={GOTHIC} fontWeight={900} fontSize={46} fill={YRP.red} letterSpacing={4}>電源 OFF</text>
          </g>
        )}
      </g>
      {/* OFF の瞬間、画面全体が一段暗くなる */}
      <rect width={W} height={H} fill="#000" opacity={note || light ? 0 : 0.18 * offT * (1 - seg(f, OFF + 30, OFF + 60) * 0.5)} />
      <NightFinish grain={0.06} />
      <FileTag no="01" title="冒険の書は、なぜ消えたのか" f={f} />
      <Caption f={f} text={f < OFF ? "カセットの中には、記憶が2種類ある" : "電源を切っても、小さな電池が記録を守り続ける"} />
    </svg>
  );
};

