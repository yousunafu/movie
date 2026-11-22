// 「夜の深掘りチャンネル」(仮) の共通部品。2026-11-16 試作。
// デザインの元: docs/キャラ案/メインキャラ派生案.html の B1 (フードの3頭身・ジト目・縁取りの光)。
//
// ★からくりのメインキャラ (karakuri/KarakuriScenes.tsx の Person) には一切手を加えない。
//   この作風の人物は、ここで新しく作った Narrator / Folk だけを使う。
//
// 作風の約束 (試作段階):
//   - 背景は夜の紺。光は「その場にある光源」(ブラウン管・電気スタンド・行灯・懐中電灯・スポットライト) から来る
//   - 線は karakuri と同じ焦げ茶の太線 + 手描きゆらぎ。暗い背景に溶ける物には縁取りの光 (rim) を付ける
//   - 字幕と札は明朝。静かで、少し皮肉っぽい語り
import React, { createContext, useContext } from "react";

// 作風の切り替え: night = 夜の深掘り / dusk = 夕暮れのからくり (名前回の別案。2026-11-16 試作)
export type YoruMood = "night" | "dusk" | "note" // note = ゆる落書きノート (2026-11-16 試作)
  | "flat" | "day" | "print"; // セーブ回の作画パターン (2026-11-18 試作): flat=灯りを描かない夜 / day=昼のからくり / print=昭和の図鑑
// 光のにじみ (ぼかし・発光・縁取り・ホコリ) を使わない作風か
export const isPlain = (m: YoruMood) => m === "flat" || m === "day" || m === "print";
// 明るい背景の作風か
export const isLightBg = (m: YoruMood) => m === "day" || m === "print";
export const MoodCtx = createContext<YoruMood>("night");
export const useMood = () => useContext(MoodCtx);

export const W = 1920;
export const H = 1080;

export const YRP = {
  night0: "#11151F", // いちばん暗い
  night1: "#1A2030",
  night2: "#252D40",
  night3: "#343D52",
  night4: "#46506A",
  ink: "#2B2420", // 線 (karakuri より少し濃い焦げ茶)
  inkSoft: "#4A3F36",
  rim: "#E9C77A", // 縁取りの光 (あたたかい)
  rimCool: "#9EC3E6", // 縁取りの光 (つめたい・ブラウン管)
  lamp: "#F2CE4C",
  glow: "#FFE9A8",
  white: "#FDFBF7",
  paper: "#EFE6D2",
  paperDim: "#BFB39A",
  red: "#D3402E",
  redDeep: "#9A2A22",
  crt: "#9ED8E6",
  crtDeep: "#4C8FA6",
  skin: "#FDFBF7",
  hoodie: "#454B57",
  hoodieDark: "#363B46",
  string: "#E9D9B4",
} as const;

export const NOTE_HAND = "'Klee', 'Hiragino Maru Gothic ProN', sans-serif";
export const GOTHIC = "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";
export const MINCHO = "'Hiragino Mincho ProN', 'Noto Serif JP', 'Yu Mincho', serif";

// ===== 数学 =====
export const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
export const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const pop = (t: number) => {
  const s = 1.70158;
  const p = t - 1;
  return t >= 1 ? 1 : 1 + (s + 1) * p * p * p + s * p * p;
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 決まった乱数 (同じ i なら同じ値)
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ===== フィルタ =====
export const YoruDefs: React.FC<{ seed?: number; f?: number }> = ({ seed = 7, f = 0 }) => {
  const mood = useMood();
  return (
  <defs>
    <filter id="ywobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed={seed} result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
    {/* 精巧な機械用: ゆらぎを弱くする (線の気配だけ残す) */}
    <filter id="ywobbleFine" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" seed={seed + 2} result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1" />
    </filter>
    {/* 縁取りの光 (暗い背景から人と物を切り離す。作風のルール) */}
    <filter id="yrim" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius={mood === "night" ? 4 : 0} result="d" />
      <feFlood floodColor={YRP.rim} floodOpacity={mood === "night" ? 1 : 0} result="c" />
      <feComposite in="c" in2="d" operator="in" result="o" />
      <feGaussianBlur in="o" stdDeviation="1.2" result="ob" />
      <feMerge><feMergeNode in="ob" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="yrimCool" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius={mood === "night" ? 4 : 0} result="d" />
      <feFlood floodColor={YRP.rimCool} floodOpacity={mood === "night" ? 1 : 0} result="c" />
      <feComposite in="c" in2="d" operator="in" result="o" />
      <feGaussianBlur in="o" stdDeviation="1.2" result="ob" />
      <feMerge><feMergeNode in="ob" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    {/* 発光のぼかし。灯りを描かない作風では、発光させる物ごと消す */}
    <filter id="yglow" x="-50%" y="-50%" width="200%" height="200%">
      {isPlain(mood) ? <feFlood floodOpacity={0} /> : <feGaussianBlur stdDeviation="14" />}
    </filter>
    <filter id="yglowS" x="-50%" y="-50%" width="200%" height="200%">
      {isPlain(mood) ? <feFlood floodOpacity={0} /> : <feGaussianBlur stdDeviation="5" />}
    </filter>
    {/* フィルムの粒 (毎フレーム少し変わる) */}
    <filter id="ygrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={(Math.floor(f / 2) % 9) + 1} result="n" />
      <feColorMatrix in="n" type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.35" />
    </filter>
 <linearGradient id="ytagShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#0B0E15" stopOpacity={0.78} />
      <stop offset="75%" stopColor="#0B0E15" stopOpacity={0.5} />
      <stop offset="100%" stopColor="#0B0E15" stopOpacity={0} />
    </linearGradient>
    <radialGradient id="yvignette" cx="50%" cy="50%" r="72%">
      <stop offset="55%" stopColor={mood === "dusk" ? "#3B2418" : "#000"} stopOpacity="0" />
      <stop offset="100%" stopColor={mood === "dusk" ? "#3B2418" : "#000"} stopOpacity={mood === "dusk" ? 0.38 : 0.62} />
    </radialGradient>
    {/* ボールペンのゆらぎ (note 用) */}
    <filter id="ywobbleNote" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={seed + 5} result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" />
    </filter>
    {/* クラフト紙の繊維 (dusk 用) */}
    <filter id="ypaper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="2" seed={3} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.2  0 0 0 0.7 -0.2" />
    </filter>
  </defs>
  );
};

// 画面いちばん上に重ねる: 周辺減光 + 粒
export const NightFinish: React.FC<{ grain?: number }> = ({ grain = 0.06 }) => {
  const mood = useMood();
  if (mood === "note" || mood === "flat" || mood === "day") return null;
  if (mood === "print") {
    // 紙の繊維と網点 (全体にうっすら)
    return (
      <g pointerEvents="none">
        <defs>
          <pattern id="yhalftone" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
            <circle cx="4.5" cy="4.5" r="2.1" fill="#5A4A3A" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#yhalftone)" opacity={0.2} style={{ mixBlendMode: "multiply" }} />
        <rect x={0} y={0} width={W} height={H} filter="url(#ypaper)" opacity={0.3} style={{ mixBlendMode: "multiply" }} />
      </g>
    );
  }
  if (mood === "dusk") {
    return (
      <g pointerEvents="none">
        <rect x={0} y={0} width={W} height={H} filter="url(#ypaper)" opacity={0.22} style={{ mixBlendMode: "multiply" }} />
        <rect x={0} y={0} width={W} height={H} fill="url(#yvignette)" />
      </g>
    );
  }
  return (
    <g pointerEvents="none">
      <rect x={0} y={0} width={W} height={H} fill="url(#yvignette)" />
      <rect x={0} y={0} width={W} height={H} filter="url(#ygrain)" opacity={grain} />
    </g>
  );
};

// 光の中を漂うホコリ (cx,cy のまわり w×h の範囲)
export const Dust: React.FC<{ f: number; x: number; y: number; w: number; h: number; n?: number; color?: string; seed?: number }> = ({
  f, x, y, w, h, n = 26, color = YRP.glow, seed = 1,
}) => useMood() === "note" || isPlain(useMood()) ? null : (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const r0 = rnd(i + seed * 31);
      const r1 = rnd(i * 3 + seed * 17);
      const sp = 0.15 + rnd(i * 7 + seed) * 0.35;
      const px = x + r0 * w + Math.sin(f / 37 + i) * 10;
      const py = y + ((((r1 * h - f * sp) % h) + h) % h);
      const a = 0.25 + 0.5 * Math.abs(Math.sin(f / 23 + i * 1.3));
      return <circle key={i} cx={px} cy={py} r={1.4 + rnd(i * 11) * 2.2} fill={color} opacity={a} />;
    })}
  </g>
);

// ===== 字幕 (明朝・影つき) =====
export const Caption: React.FC<{ text: string; f: number; y?: number }> = ({ text, f, y = 1000 }) => {
  const a = seg(f, 4, 16);
  const mood = useMood();
  if (mood === "note") {
    const w = text.length * 52 + 40;
    return (
      <g opacity={a}>
        <path d={`M ${W / 2 - w / 2} ${y - 14} L ${W / 2 + w / 2} ${y - 20}`} stroke="#F7E26B" strokeWidth={42} strokeLinecap="round" opacity={0.75} />
        <text x={W / 2} y={y} textAnchor="middle" fontFamily={NOTE_HAND} fontWeight={700} fontSize={52} fill="#22325E"
          style={{ paintOrder: "stroke" }} stroke="#FFFFFF" strokeWidth={6} strokeLinejoin="round">
          {text}
        </text>
      </g>
    );
  }
  if (mood === "print") {
    const w = text.length * 48 + 70;
    return (
      <g opacity={a}>
        <rect x={W / 2 - w / 2} y={y - 54} width={w} height={76} fill="#F4ECD8" stroke="#2B2420" strokeWidth={3} />
        <rect x={W / 2 - w / 2} y={y - 54} width={14} height={76} fill="#C8432E" />
        <text x={W / 2 + 6} y={y} textAnchor="middle" fontFamily={MINCHO} fontWeight={800} fontSize={44} fill="#2B2420" letterSpacing={2}>
          {text}
        </text>
      </g>
    );
  }
  if (mood === "dusk" || mood === "day") {
    const w = text.length * 50 + 90;
    return (
      <g opacity={a}>
        <rect x={W / 2 - w / 2} y={y - 58} width={w} height={84} rx={42} fill="rgba(34, 30, 27, 0.88)" />
        <text x={W / 2} y={y} textAnchor="middle" fontFamily={GOTHIC} fontWeight={800} fontSize={46} fill={YRP.white} letterSpacing={2}>
          {text}
        </text>
      </g>
    );
  }
  return (
    <text x={W / 2} y={y} textAnchor="middle" fontFamily={MINCHO} fontWeight={600} fontSize={50}
      fill={YRP.white} opacity={a} letterSpacing={2}
      style={{ paintOrder: "stroke" }} stroke="#0B0E15" strokeWidth={10} strokeLinejoin="round">
      {text}
    </text>
  );
};

// ===== 左上の「FILE」札 (チャンネルの印) =====
export const FileTag: React.FC<{ no: string; title: string; f: number }> = ({ no, title, f }) => {
  const mood = useMood();
  if (mood === "note") {
    return (
      <g opacity={seg(f, 0, 10) * (1 - seg(f, 62, 80))} transform="translate(70 80)">
        <circle cx={34} cy={-8} r={34} fill="none" stroke="#D3402E" strokeWidth={4} />
        <text x={34} y={4} textAnchor="middle" fontFamily={NOTE_HAND} fontWeight={700} fontSize={30} fill="#D3402E">{no}</text>
        <text x={84} y={6} fontFamily={NOTE_HAND} fontWeight={700} fontSize={34} fill="#22325E">{title}</text>
        <path d={`M 84 22 Q 300 30 ${84 + title.length * 34} 18`} stroke="#22325E" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === "print") {
    return (
      <g opacity={seg(f, 0, 10) * (1 - seg(f, 62, 80))} transform="translate(64 56)">
        <rect x={0} y={0} width={86} height={86} fill="#C8432E" stroke="#2B2420" strokeWidth={3} />
        <text x={43} y={58} textAnchor="middle" fontFamily={GOTHIC} fontWeight={900} fontSize={40} fill="#F4ECD8">{no}</text>
        <text x={106} y={38} fontFamily={GOTHIC} fontWeight={800} fontSize={20} letterSpacing={6} fill="#2B2420">ずかい・ゲームのしくみ</text>
        <text x={106} y={76} fontFamily={MINCHO} fontWeight={800} fontSize={34} fill="#2B2420">{title}</text>
      </g>
    );
  }
  if (mood === "dusk" || mood === "day") {
    const label = mood === "day" ? "セーブのからくり" : "名前のからくり";
    const w = label.length * 37 + 100;
    return (
      <g opacity={seg(f, 0, 10) * (mood === "day" ? 1 - seg(f, 62, 80) : 1)} transform="translate(60 54)">
        <rect x={0} y={0} width={w} height={62} rx={31} fill="rgba(34, 30, 27, 0.88)" />
        <text x={w / 2} y={43} textAnchor="middle" fontFamily={GOTHIC} fontWeight={800} fontSize={34} fill={YRP.white} letterSpacing={2}>
          {label}
        </text>
      </g>
    );
  }
  const a = seg(f, 0, 12) * (1 - seg(f, 62, 80));
  if (a <= 0) return null;
  return (
    <g opacity={a * 0.92} transform="translate(64 70)">
      <rect x={-40} y={-50} width={560} height={130} fill="url(#ytagShade)" />
      <text x={0} y={0} fontFamily={GOTHIC} fontWeight={800} fontSize={24} letterSpacing={6} fill={YRP.rim}>
        FILE {no}
      </text>
      <line x1={0} y1={16} x2={220} y2={16} stroke={YRP.rim} strokeWidth={2} opacity={0.6} />
      <text x={0} y={54} fontFamily={MINCHO} fontWeight={600} fontSize={30} fill={YRP.white} opacity={0.88}>
        {title}
      </text>
    </g>
  );
};

// ===== 札 (明朝の白札。暗い場面で読める) =====
export const NightTag: React.FC<{
  x: number; y: number; text: string; t?: number; size?: number; color?: string; rot?: number; anchor?: "start" | "middle" | "end";
}> = ({ x, y, text, t = 1, size = 34, color = YRP.paper, rot = 0, anchor = "middle" }) => {
  const p = pop(clamp01(t));
  const w = text.length * size * 1.0 + 40;
  const ox = anchor === "middle" ? -w / 2 : anchor === "end" ? -w : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`} opacity={clamp01(t * 3)}>
      <rect x={ox} y={-size * 0.95} width={w} height={size * 1.55} rx={8} fill={color} stroke={YRP.ink} strokeWidth={4} />
      <text x={ox + w / 2} y={size * 0.28} textAnchor="middle" fontFamily={MINCHO} fontWeight={700} fontSize={size} fill={YRP.ink}>
        {text}
      </text>
    </g>
  );
};

// ===== 語り手 (フードの3頭身・ジト目) =====
// 足元 (x,y)。armL / armR は肩まわりの回転角 (0=下, -90=右へ水平, 90=左へ水平)。
// light=true なら右手に懐中電灯。光の出る位置は narratorLight() で求める。
export type NFace = "jito" | "wide" | "smirk" | "worried";
const N_SHOULDER_L: [number, number] = [-65, -196];
const N_SHOULDER_R: [number, number] = [65, -196];
const N_ARM = 92;
export const narratorHand = (x: number, y: number, s: number, side: -1 | 1, ang: number): [number, number] => {
  const [sx, sy] = side === -1 ? N_SHOULDER_L : N_SHOULDER_R;
  const r = (ang * Math.PI) / 180;
  return [x + (sx - N_ARM * Math.sin(r)) * s, y + (sy + N_ARM * Math.cos(r)) * s];
};
// 懐中電灯の先 (光の出口) と向き (度。0=下)
export const narratorLight = (x: number, y: number, s: number, ang: number, side: -1 | 1 = 1): { x: number; y: number; dir: number } => {
  const r = (ang * Math.PI) / 180;
  const L = N_ARM + 44;
  return { x: x + (side * 65 - L * Math.sin(r)) * s, y: y + (-196 + L * Math.cos(r)) * s, dir: ang };
};

export const Narrator: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  face?: NFace; gaze?: [number, number]; armL?: number; armR?: number; light?: boolean; lean?: number;
  lightSide?: -1 | 1; // 懐中電灯を持つ手 (1=画面の右側の手, -1=左側の手)
}> = ({ x, y, s = 1, f = 0, phase = 0, face = "jito", gaze = [0, 0], armL = 0, armR = 0, light = false, lean = 0, lightSide = 1 }) => {
  const bob = Math.sin((f + phase * 17) / 15) * 2.5;
  const blink = ((f + phase * 41) % 113) < 5 && f > 3;
  const [gx, gy] = gaze;
  const C = YRP.hoodie;
  const arm = (side: -1 | 1, ang: number) => {
    const [sx, sy] = side === -1 ? N_SHOULDER_L : N_SHOULDER_R;
    return (
      <g transform={`rotate(${ang} ${sx} ${sy})`}>
        <rect x={sx - 11} y={sy} width={22} height={N_ARM} rx={11} fill={C} stroke={YRP.ink} strokeWidth={4.5} />
        {/* 袖口 */}
        <rect x={sx - 12} y={sy + N_ARM - 16} width={24} height={14} rx={6} fill={YRP.hoodieDark} stroke={YRP.ink} strokeWidth={3.5} />
        <circle cx={sx} cy={sy + N_ARM + 4} r={10} fill={YRP.skin} stroke={YRP.ink} strokeWidth={4} />
        {light && side === lightSide && (
          <g>
            <rect x={sx - 9} y={sy + N_ARM - 4} width={18} height={40} rx={4} fill="#5A5F68" stroke={YRP.ink} strokeWidth={3.5} />
            <rect x={sx - 12} y={sy + N_ARM + 28} width={24} height={10} rx={3} fill="#C9CFD4" stroke={YRP.ink} strokeWidth={3} />
            <circle cx={sx} cy={sy + N_ARM + 40} r={8} fill={YRP.glow} />
          </g>
        )}
      </g>
    );
  };
  // 目 (ジト目は上半分にまぶた)
  const eye = (cx: number) => {
    const cy = -254;
    if (blink) return <line x1={cx - 12} y1={cy + 2} x2={cx + 12} y2={cy + 2} stroke={YRP.ink} strokeWidth={5} strokeLinecap="round" />;
    const lid = face === "wide" ? null : face === "worried" ? -6 : 0;
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={11} ry={15} fill={YRP.white} stroke={YRP.ink} strokeWidth={4} />
        <circle cx={cx + 2 + gx} cy={cy + (lid === null ? 0 : 6) + gy} r={face === "wide" ? 4.5 : 5} fill={YRP.ink} />
        {lid !== null && (
          <g>
            <path d={`M ${cx - 13} ${cy - 1 + lid} A 13 17 0 0 1 ${cx + 13} ${cy - 1 + lid} Z`} fill={YRP.white} />
            <line x1={cx - 13} y1={cy + lid} x2={cx + 13} y2={cy - 2 + lid} stroke={YRP.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* フード (後ろ) */}
      <ellipse cx={0} cy={-256} rx={74} ry={76} fill={C} stroke={YRP.ink} strokeWidth={5} />
      {/* 脚 */}
      <rect x={-30} y={-64} width={24} height={58} fill="#2A2E38" stroke={YRP.ink} strokeWidth={4.5} />
      <rect x={6} y={-64} width={24} height={58} fill="#2A2E38" stroke={YRP.ink} strokeWidth={4.5} />
      <ellipse cx={-18} cy={-4} rx={21} ry={9} fill={YRP.ink} />
      <ellipse cx={18} cy={-4} rx={21} ry={9} fill={YRP.ink} />
      {!(light && lightSide === -1) && arm(-1, armL)}
      {!(light && lightSide === 1) && arm(1, armR)}
      {/* 胴 (パーカー) */}
      <rect x={-56} y={-208} width={112} height={150} rx={20} fill={C} stroke={YRP.ink} strokeWidth={5} />
      <path d="M -36 -112 L 36 -112 L 44 -80 L -44 -80 Z" fill="none" stroke={YRP.ink} strokeWidth={3.5} opacity={0.7} strokeLinejoin="round" />
      <rect x={-56} y={-74} width={112} height={14} rx={6} fill={YRP.hoodieDark} stroke={YRP.ink} strokeWidth={3.5} />
      <g stroke={YRP.string} strokeWidth={4} strokeLinecap="round">
        <line x1={-12} y1={-204} x2={-14 + Math.sin(f / 19) * 1.5} y2={-168} />
        <line x1={12} y1={-204} x2={14 + Math.sin(f / 21) * 1.5} y2={-168} />
      </g>
      <circle cx={-14} cy={-166} r={4} fill={YRP.string} />
      <circle cx={14} cy={-166} r={4} fill={YRP.string} />
      {light && (lightSide === 1 ? arm(1, armR) : arm(-1, armL))}
      {/* 顔 */}
      <circle cx={0} cy={-256} r={54} fill={YRP.skin} stroke={YRP.ink} strokeWidth={5.5} />
      <path d="M -44 -288 Q -30 -298 0 -300 Q 30 -298 44 -288 Q 36 -284 28 -276 Q 20 -288 8 -286 Q 0 -276 -10 -286 Q -22 -288 -28 -276 Q -36 -284 -44 -288 Z" fill={YRP.ink} />
      <path d="M -55 -258 Q -60 -324 0 -326 Q 60 -324 55 -258 Q 32 -300 0 -300 Q -32 -300 -55 -258 Z" fill={YRP.hoodieDark} stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" />
      {eye(-21)}
      {eye(21)}
      {face === "wide" ? (
        <ellipse cx={0} cy={-222} rx={7} ry={8} fill={YRP.ink} />
      ) : face === "smirk" ? (
        <path d="M -9 -223 Q 2 -221 10 -229" fill="none" stroke={YRP.ink} strokeWidth={5} strokeLinecap="round" />
      ) : face === "worried" ? (
        <path d="M -9 -220 Q 0 -227 9 -220" fill="none" stroke={YRP.ink} strokeWidth={5} strokeLinecap="round" />
      ) : (
        <line x1={-8} y1={-222} x2={8} y2={-225} stroke={YRP.ink} strokeWidth={5} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===== 町の人 (この作風の人物。karakuri の大きなたて長の目は受け継ぐ) =====
// 足元 (x,y)。armL/armR は肩まわりの回転角 (0=下)。folkHand() で手の位置を求める。
export type FFace = "normal" | "wide" | "smile" | "worried" | "jito" | "sad";
export type FHair = "bowl" | "chonmage" | "meiji" | "bob" | "short" | "cap";
const F_BODY_TOP = -170;
const F_ARM = 84;
export const folkHand = (x: number, y: number, s: number, side: -1 | 1, ang: number): [number, number] => {
  const sx = side * 59;
  const sy = F_BODY_TOP + 16;
  const r = (ang * Math.PI) / 180;
  return [x + (sx - F_ARM * Math.sin(r)) * s, y + (sy + F_ARM * Math.cos(r)) * s];
};
export const Folk: React.FC<{
  x: number; y: number; s?: number; f?: number; phase?: number;
  cloth?: string; clothDark?: string; kimono?: boolean; obi?: string; apron?: string;
  hair?: FHair; hairColor?: string; face?: FFace; gaze?: [number, number];
  armL?: number; armR?: number; lean?: number; still?: boolean; hideLegs?: boolean;
  cheek?: boolean; capColor?: string;
}> = ({
  x, y, s = 1, f = 0, phase = 0, cloth = "#5B6B7A", clothDark = "#3A4452", kimono = false, obi = "#C9A44A", apron,
  hair = "bowl", hairColor = YRP.ink, face = "normal", gaze = [0, 0], armL = 0, armR = 0, lean = 0, still = false,
  hideLegs = false, cheek = false, capColor = "#3A4F7A",
}) => {
  const bob = still ? 0 : Math.sin((f + phase * 17) / 14) * 2.5;
  const blink = ((f + phase * 41) % 101) < 5 && f > 3 && face !== "smile";
  const [gx, gy] = gaze;
  const hy = -214; // 頭の中心
  const R = 56;
  const arm = (side: -1 | 1, ang: number) => (
    <g transform={`rotate(${ang} ${side * 59} ${F_BODY_TOP + 16})`}>
      <rect x={side * 59 - 11} y={F_BODY_TOP + 16} width={22} height={F_ARM} rx={11} fill={cloth} stroke={YRP.ink} strokeWidth={4.5} />
      {kimono && <rect x={side * 59 - 16} y={F_BODY_TOP + 12} width={32} height={F_ARM - 26} rx={10} fill={cloth} stroke={YRP.ink} strokeWidth={4} />}
      <circle cx={side * 59} cy={F_BODY_TOP + 16 + F_ARM + 3} r={10} fill={YRP.skin} stroke={YRP.ink} strokeWidth={4} />
    </g>
  );
  const eyeY = hy + 6;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${lean})`}>
      {/* 後ろ髪 (ボブ) */}
      {hair === "bob" && (
        <path d={`M -66 ${hy + 34} Q -78 ${hy - 72} 0 ${hy - 74} Q 78 ${hy - 72} 66 ${hy + 34} Q 56 ${hy + 42} 46 ${hy + 34} L -46 ${hy + 34} Q -56 ${hy + 42} -66 ${hy + 34} Z`}
          fill={hairColor} stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" />
      )}
      {/* 脚 / 着物のすそ */}
      {!hideLegs && (kimono ? (
        <g>
          <path d={`M -50 -60 L -56 -8 L 56 -8 L 50 -60 Z`} fill={cloth} stroke={YRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <line x1={-8} y1={-60} x2={-14} y2={-8} stroke={YRP.ink} strokeWidth={3} opacity={0.6} />
          <ellipse cx={-20} cy={-4} rx={18} ry={8} fill={YRP.ink} />
          <ellipse cx={20} cy={-4} rx={18} ry={8} fill={YRP.ink} />
        </g>
      ) : (
        <g>
          <rect x={-30} y={-56} width={24} height={50} fill={clothDark} stroke={YRP.ink} strokeWidth={4.5} />
          <rect x={6} y={-56} width={24} height={50} fill={clothDark} stroke={YRP.ink} strokeWidth={4.5} />
          <ellipse cx={-18} cy={-4} rx={20} ry={9} fill={YRP.ink} />
          <ellipse cx={18} cy={-4} rx={20} ry={9} fill={YRP.ink} />
        </g>
      ))}
      {arm(-1, armL)}
      {arm(1, armR)}
      {/* 胴 */}
      <rect x={-54} y={F_BODY_TOP} width={108} height={116} rx={18} fill={cloth} stroke={YRP.ink} strokeWidth={5} />
      {kimono && (
        <g>
          <polyline points={`-24,${F_BODY_TOP} 2,${F_BODY_TOP + 34}`} fill="none" stroke={YRP.ink} strokeWidth={15} strokeLinecap="round" />
          <polyline points={`-24,${F_BODY_TOP} 2,${F_BODY_TOP + 34}`} fill="none" stroke={YRP.paper} strokeWidth={8} strokeLinecap="round" />
          <polyline points={`24,${F_BODY_TOP} -12,${F_BODY_TOP + 50}`} fill="none" stroke={YRP.ink} strokeWidth={15} strokeLinecap="round" />
          <polyline points={`24,${F_BODY_TOP} -12,${F_BODY_TOP + 50}`} fill="none" stroke={YRP.paper} strokeWidth={8} strokeLinecap="round" />
          <rect x={-55} y={F_BODY_TOP + 66} width={110} height={18} fill={obi} stroke={YRP.ink} strokeWidth={4} />
        </g>
      )}
      {apron && (
        <g>
          <path d={`M -46 ${F_BODY_TOP + 70} L 46 ${F_BODY_TOP + 70} L 50 ${F_BODY_TOP + 150} L -50 ${F_BODY_TOP + 150} Z`} fill={apron} stroke={YRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
          <line x1={-54} y1={F_BODY_TOP + 72} x2={54} y2={F_BODY_TOP + 72} stroke={YRP.ink} strokeWidth={6} />
        </g>
      )}
      {/* 頭 */}
      <circle cx={0} cy={hy} r={R} fill={YRP.skin} stroke={YRP.ink} strokeWidth={5.5} />
      {hair === "bowl" && (
        <g>
          <path d={`M -54 ${hy - 6} Q -56 ${hy - 60} 0 ${hy - 62} Q 56 ${hy - 60} 54 ${hy - 6} Q 47 ${hy - 18} 36 ${hy - 14} Q 30 ${hy - 28} 17 ${hy - 26} Q 10 ${hy - 16} 2 ${hy - 18} Q -6 ${hy - 31} -18 ${hy - 28} Q -25 ${hy - 16} -34 ${hy - 18} Q -43 ${hy - 28} -54 ${hy - 6} Z`} fill={hairColor} stroke={YRP.ink} strokeWidth={2} strokeLinejoin="round" />
          <path d={`M -30 ${hy - 42} Q -12 ${hy - 52} 8 ${hy - 50}`} fill="none" stroke="#6E625A" strokeWidth={5.5} strokeLinecap="round" opacity={0.85} />
        </g>
      )}
      {hair === "chonmage" && (
        <g>
          {/* 月代 (そった頭頂) は顔色より少し青く */}
          <path d={`M -44 ${hy - 34} Q 0 ${hy - 70} 44 ${hy - 34} Q 30 ${hy - 46} 0 ${hy - 48} Q -30 ${hy - 46} -44 ${hy - 34} Z`} fill="#C8D2DA" opacity={0.85} />
          <path d={`M -56 ${hy + 4} Q -60 ${hy - 30} -44 ${hy - 36} Q -36 ${hy - 20} -42 ${hy + 6} Z`} fill={hairColor} stroke={YRP.ink} strokeWidth={3} />
          <path d={`M 56 ${hy + 4} Q 60 ${hy - 30} 44 ${hy - 36} Q 36 ${hy - 20} 42 ${hy + 6} Z`} fill={hairColor} stroke={YRP.ink} strokeWidth={3} />
          <rect x={-9} y={hy - 82} width={18} height={40} rx={8} fill={hairColor} stroke={YRP.ink} strokeWidth={3.5} transform={`rotate(-12 0 ${hy - 56})`} />
          <rect x={-12} y={hy - 60} width={24} height={9} rx={3} fill={YRP.paper} stroke={YRP.ink} strokeWidth={2.5} />
        </g>
      )}
      {hair === "meiji" && (
        <g>
          <path d={`M -55 ${hy - 4} Q -60 ${hy - 62} 0 ${hy - 62} Q 58 ${hy - 62} 55 ${hy - 6} Q 48 ${hy - 30} 22 ${hy - 36} Q 6 ${hy - 26} -12 ${hy - 40} Q -38 ${hy - 34} -55 ${hy - 4} Z`} fill={hairColor} stroke={YRP.ink} strokeWidth={2} strokeLinejoin="round" />
          <path d={`M -14 ${hy - 58} L -10 ${hy - 40}`} stroke={YRP.skin} strokeWidth={3} opacity={0.6} />
        </g>
      )}
      {hair === "bob" && (
        <g>
          <path d={`M -56 ${hy + 4} Q -62 ${hy - 70} 0 ${hy - 70} Q 62 ${hy - 70} 56 ${hy + 4} Q 50 ${hy + 14} 46 ${hy + 14} Q 44 ${hy - 18} 35 ${hy - 28} Q 29 ${hy - 22} 24 ${hy - 22} Q 19 ${hy - 32} 12 ${hy - 35} Q 5 ${hy - 26} 0 ${hy - 22} Q -5 ${hy - 26} -12 ${hy - 35} Q -19 ${hy - 32} -24 ${hy - 22} Q -29 ${hy - 22} -35 ${hy - 28} Q -44 ${hy - 18} -46 ${hy + 14} Q -50 ${hy + 14} -56 ${hy + 4} Z`}
            fill={hairColor} stroke={YRP.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M -30 ${hy - 52} Q -10 ${hy - 61} 12 ${hy - 58}`} fill="none" stroke="#A07A5A" strokeWidth={5.5} strokeLinecap="round" opacity={0.85} />
        </g>
      )}
      {hair === "short" && (
        <path d={`M -54 ${hy - 4} Q -58 ${hy - 62} 0 ${hy - 64} Q 58 ${hy - 62} 54 ${hy - 4} Q 46 ${hy - 26} 36 ${hy - 30} Q 26 ${hy - 20} 18 ${hy - 32} Q 6 ${hy - 22} -4 ${hy - 34} Q -16 ${hy - 22} -26 ${hy - 32} Q -40 ${hy - 26} -54 ${hy - 4} Z`} fill={hairColor} stroke={YRP.ink} strokeWidth={2} strokeLinejoin="round" />
      )}
      {hair === "cap" && (
        <g>
          <path d={`M -54 ${hy - 10} Q -56 ${hy - 66} 0 ${hy - 68} Q 56 ${hy - 66} 54 ${hy - 10} Z`} fill={capColor} stroke={YRP.ink} strokeWidth={5} />
          <path d={`M -58 ${hy - 12} L 74 ${hy - 12} Q 80 ${hy - 2} 70 ${hy} L -58 ${hy - 2} Z`} fill={capColor} stroke={YRP.ink} strokeWidth={4.5} strokeLinejoin="round" />
        </g>
      )}
      {/* 目 */}
      {blink ? (
        <g stroke={YRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={eyeY + 2} x2={-14} y2={eyeY + 2} />
          <line x1={14} y1={eyeY + 2} x2={32} y2={eyeY + 2} />
        </g>
      ) : face === "smile" ? (
        <g fill="none" stroke={YRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <path d={`M -32 ${eyeY + 4} Q -23 ${eyeY - 9} -14 ${eyeY + 4}`} />
          <path d={`M 14 ${eyeY + 4} Q 23 ${eyeY - 9} 32 ${eyeY + 4}`} />
        </g>
      ) : (
        <g>
          {[-23, 23].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={eyeY} rx={12} ry={16} fill={YRP.white} stroke={YRP.ink} strokeWidth={4} />
              <circle cx={cx + gx} cy={eyeY + gy + (face === "sad" ? 4 : 0)} r={face === "wide" ? 4.2 : 5.5} fill={YRP.ink} />
              {face === "jito" && (
                <g>
                  <path d={`M ${cx - 14} ${eyeY - 1} A 14 18 0 0 1 ${cx + 14} ${eyeY - 1} Z`} fill={YRP.white} />
                  <line x1={cx - 14} y1={eyeY} x2={cx + 14} y2={eyeY - 2} stroke={YRP.ink} strokeWidth={4.5} strokeLinecap="round" />
                </g>
              )}
            </g>
          ))}
        </g>
      )}
      {cheek && (
        <g>
          <ellipse cx={-40} cy={hy + 28} rx={9} ry={5} fill="#E8A090" opacity={0.55} />
          <ellipse cx={40} cy={hy + 28} rx={9} ry={5} fill="#E8A090" opacity={0.55} />
        </g>
      )}
      {/* 眉 */}
      <g stroke={YRP.ink} strokeWidth={4.5} strokeLinecap="round">
        {face === "worried" || face === "sad" ? (
          <g><line x1={-32} y1={hy - 14} x2={-14} y2={hy - 20} /><line x1={14} y1={hy - 20} x2={32} y2={hy - 14} /></g>
        ) : face === "wide" ? (
          <g><line x1={-32} y1={hy - 24} x2={-14} y2={hy - 25} /><line x1={14} y1={hy - 25} x2={32} y2={hy - 24} /></g>
        ) : (
          <g><line x1={-32} y1={hy - 19} x2={-14} y2={hy - 21} /><line x1={14} y1={hy - 21} x2={32} y2={hy - 19} /></g>
        )}
      </g>
      {/* 口 */}
      {face === "wide" ? (
        <ellipse cx={0} cy={hy + 36} rx={7} ry={9} fill={YRP.ink} />
      ) : face === "smile" ? (
        <path d={`M -12 ${hy + 32} Q 0 ${hy + 44} 12 ${hy + 32}`} fill="none" stroke={YRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : face === "worried" || face === "sad" ? (
        <path d={`M -10 ${hy + 40} Q 0 ${hy + 33} 10 ${hy + 40}`} fill="none" stroke={YRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <line x1={-9} y1={hy + 36} x2={9} y2={hy + 36} stroke={YRP.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
    </g>
  );
};

// ===== 光の円すい (光源 x,y から角度 dir 方向へ。dir: 0=下, -90=右) =====
export const Beam: React.FC<{
  x: number; y: number; dir: number; len: number; spread: number; color?: string; opacity?: number; id: string;
}> = ({ x, y, dir, len, spread, color = YRP.glow, opacity = 0.32, id }) => {
  const r = (dir * Math.PI) / 180;
  const ex = x - len * Math.sin(r);
  const ey = y + len * Math.cos(r);
  const hw = len * Math.tan((spread * Math.PI) / 360);
  const px = Math.cos(r) * hw;
  const py = Math.sin(r) * hw;
  const mood = useMood();
  if (isPlain(mood)) {
    // 光をぼかさず、ふちのはっきりした面で置く (アニメの背景美術のやり方)
    return (
      <polygon points={`${x},${y} ${ex + px},${ey + py} ${ex - px},${ey - py}`}
        fill={mood === "flat" ? "#FFE9A8" : "#FFF3C4"} opacity={mood === "flat" ? 0.14 : 0.3} />
    );
  }
  if (mood === "note") {
    return (
      <g>
        <polygon points={`${x},${y} ${ex + px},${ey + py} ${ex - px},${ey - py}`} fill="#F7E26B" opacity={0.38} />
        <path d={`M ${x} ${y} L ${ex + px} ${ey + py} M ${x} ${y} L ${ex - px} ${ey - py}`} stroke="#2F4A8A" strokeWidth={3} strokeDasharray="10 10" opacity={0.6} />
      </g>
    );
  }
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={ex} y2={ey}>
          <stop offset="0%" stopColor={color} stopOpacity={opacity * 1.6} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`${x},${y} ${ex + px},${ey + py} ${ex - px},${ey - py}`} fill={`url(#${id})`} />
    </g>
  );
};
