// 自販機2000年史 第9章「あったかいと、つめたいの同居」(168〜180) + 第10章「増えていく親戚たち」(181〜198)。
// 1973年ホット自販機・ホット&コールド同居〜自販機の親戚 (券売機・ガチャ・オートレストラン・うどん自販機)。
// WobbleDefs の seed はこのファイルでは 250〜284 を使う (他ファイルと重複させない)。

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  KRP, WobbleDefs, Atmosphere, LabelPill, Stamp, Coin, Jihanki,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import {
  W, H, FONT, abs, J2Badge, JihankiNight, NightSky, FlagCard,
  Globe, globePoint, MapPin, DashArc, HolyPot,
} from "./Jihanki2000Scenes";
import { JapanMapCard, JmapLabel, jmapXY, JMAP } from "./Jihanki2000JapanMap";
import { Heart, GearIcon } from "./Jihanki2000Ch2to4";
import { CanDrink } from "./Jihanki2000Ch7to8";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 4点星 (キラキラ)
const star4 = (cx: number, cy: number, r: number): string =>
  `M ${cx} ${cy - r} Q ${cx + r * 0.22} ${cy - r * 0.22} ${cx + r} ${cy} ` +
  `Q ${cx + r * 0.22} ${cy + r * 0.22} ${cx} ${cy + r} ` +
  `Q ${cx - r * 0.22} ${cy + r * 0.22} ${cx - r} ${cy} ` +
  `Q ${cx - r * 0.22} ${cy - r * 0.22} ${cx} ${cy - r} Z`;

const Sparkle: React.FC<{ x: number; y: number; r: number; f: number; phase?: number; color?: string }> = ({
  x, y, r, f, phase = 0, color = "#FFF2B8",
}) => {
  const tw = 0.5 + 0.5 * Math.sin((f + phase * 13) / 7);
  return <path d={star4(x, y, r * (0.72 + tw * 0.32))} fill={color} stroke={KRP.ink} strokeWidth={2.5} opacity={0.35 + tw * 0.65} />;
};

// 折れ線ループ上の位置 (t=0..1)。循環矢印用
const polyPoint = (pts: Array<[number, number]>, t: number): { x: number; y: number; ang: number } => {
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lens.push(L);
    total += L;
  }
  let d = (((t % 1) + 1) % 1) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const u = lens[i] === 0 ? 0 : d / lens[i];
      return {
        x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u,
        y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u,
        ang: Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]),
      };
    }
    d -= lens[i];
  }
  return { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], ang: 0 };
};

// ===== SVG内の小さな説明札 (文字数で幅を決める) =====
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; color?: string; fill?: string; op?: number;
}> = ({ x, y, text, size = 30, color = KRP.ink, fill = KRP.white, op = 1 }) => {
  const w = text.length * size + size * 0.9;
  const h = size * 1.7;
  return (
    <g opacity={op}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h * 0.24}
        fill={fill} stroke={KRP.ink} strokeWidth={3.5} />
      <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800}
        fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

// ===== 湯気 (ゆらゆら上昇ループ) =====
const Steam: React.FC<{ x: number; y: number; s?: number; f: number; phase?: number; color?: string }> = ({
  x, y, s = 1, f, phase = 0, color = "#D8E0E8",
}) => (
  <g>
    {[0, 1].map((i) => {
      const cyc = ((f + phase * 19 + i * 34) % 68) / 68;
      const op = cyc < 0.15 ? cyc / 0.15 : 1 - seg(cyc, 0.55, 1);
      return (
        <path key={i}
          d={`M ${x + i * 34 * s - 17 * s} ${y} q ${14 * s} ${-26 * s} 0 ${-52 * s} q ${-14 * s} ${-26 * s} 0 ${-52 * s}`}
          fill="none" stroke={color} strokeWidth={9 * s} strokeLinecap="round"
          opacity={0.75 * op} transform={`translate(0 ${-cyc * 46 * s})`} />
      );
    })}
  </g>
);

// ===== 別描きの腕 (体側の腕は hideArm で消して、こちらを1本だけ描く) =====
const Arm: React.FC<{ x1: number; y1: number; x2: number; y2: number; cloth: string; s?: number; hand?: string }> = ({
  x1, y1, x2, y2, cloth, s = 1, hand = KRP.white,
}) => (
  <g strokeLinecap="round">
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KRP.ink} strokeWidth={33 * s} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cloth} strokeWidth={24 * s} />
    <circle cx={x2} cy={y2} r={17 * s} fill={hand} stroke={KRP.ink} strokeWidth={4.5 * s} />
  </g>
);

// ===== 新キャラ: 昭和40〜50年代+現代の人々 (ShowaPersonと同じ骨格) =====
type HitoRole = "pokka" | "trucker" | "papa" | "mama" | "boy" | "girl" | "coat";
type HitoFace = "normal" | "smile" | "worried" | "surprised" | "closed";
const Hito: React.FC<{
  x: number; y: number; s?: number; role: HitoRole; f?: number; phase?: number;
  face?: HitoFace; gaze?: [number, number]; hideArm?: "left" | "right";
  shiver?: number; slurp?: boolean;
}> = ({ x, y, s = 1, role, f = 0, phase = 0, face = "normal", gaze = [0, 0], hideArm, shiver = 0, slurp }) => {
  const bob = slurp ? Math.sin(f / 4) * 6 : Math.sin((f + phase * 17) / 13) * 3;
  const jig = shiver > 0 ? Math.sin(f * 1.9 + phase) * shiver : 0;
  const blink = ((f + phase * 41) % 97) < 5 && f > 2;
  const [gx, gy] = gaze;
  const child = role === "boy" || role === "girl";
  const female = role === "mama" || role === "girl";
  const cloth = role === "pokka" ? "#9AA6B8" : role === "trucker" ? "#8A9A74"
    : role === "papa" ? "#A8BCCB" : role === "mama" ? "#E0B8B0"
    : role === "boy" ? "#E8C06A" : role === "girl" ? "#E89AB0" : "#8C6E54";
  const clothDark = role === "pokka" ? "#5A6578" : role === "trucker" ? "#55604A"
    : role === "papa" ? "#5C6A78" : role === "mama" ? "#C08880"
    : role === "boy" ? "#4C5D78" : role === "girl" ? "#C27878" : "#5C4A3A";
  const hair = "#3A322A";
  const eyeY = child ? -204 : -222;
  const headCY = child ? -206 : -222;
  return (
    <g transform={`translate(${x + jig} ${y + bob}) scale(${s})`}>
      {/* 足もと */}
      {child ? (
        <g>
          <rect x={-28} y={-56} width={22} height={26} rx={6} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={6} y={-56} width={22} height={26} rx={6} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-24} y={-34} width={15} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <rect x={9} y={-34} width={15} height={30} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      ) : female ? (
        <path d="M -42 -62 L 42 -62 L 54 -2 L -54 -2 Z" fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
      ) : (
        <g>
          <rect x={-30} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={6} y={-58} width={24} height={52} fill={clothDark} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      <ellipse cx={-17} cy={-3} rx={18} ry={8} fill={KRP.ink} />
      <ellipse cx={17} cy={-3} rx={18} ry={8} fill={KRP.ink} />
      {/* 腕 */}
      {hideArm !== "left" && (
        <rect x={child ? -66 : -78} y={child ? -128 : -148} width={child ? 20 : 22} height={child ? 66 : 82}
          rx={10} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {hideArm !== "right" && (
        <rect x={child ? 46 : 56} y={child ? -128 : -148} width={child ? 20 : 22} height={child ? 66 : 82}
          rx={10} fill={cloth} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {/* 胴 */}
      {child ? (
        <rect x={-50} y={-140} width={100} height={92} rx={14} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      ) : (
        <rect x={-58} y={-160} width={116} height={108} rx={16} fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      )}
      {/* 役ごとの服の飾り */}
      {(role === "pokka" || role === "papa") && (
        <g>
          <path d="M -22 -160 L 0 -134 L 22 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          {role === "pokka" && (
            <g>
              <line x1={0} y1={-134} x2={0} y2={-70} stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
              <path d="M -8 -136 L 8 -136 L 0 -124 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          )}
          {role === "papa" && <line x1={0} y1={-134} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />}
        </g>
      )}
      {role === "trucker" && (
        <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} fill="none">
          <line x1={-30} y1={-160} x2={-30} y2={-56} />
          <line x1={30} y1={-160} x2={30} y2={-56} />
        </g>
      )}
      {role === "coat" && (
        <g>
          {/* コートの前合わせ+赤マフラー */}
          <line x1={0} y1={-118} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={3.5} opacity={0.5} />
          <rect x={-46} y={-166} width={92} height={30} rx={12} fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={12} y={-146} width={26} height={52} rx={10} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {role === "mama" && (
        <path d="M -18 -160 L 0 -142 L 18 -160 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
      )}
      {role === "girl" && (
        <path d="M -50 -140 L 50 -140 L 64 -50 L -64 -50 Z" fill={cloth} stroke={KRP.ink} strokeWidth={5} />
      )}
      {/* 頭 */}
      <ellipse cx={0} cy={headCY} rx={child ? 56 : 58} ry={child ? 50 : 56} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 髪・帽子 */}
      {(role === "pokka" || role === "papa") && (
        <path d={`M -56 ${headCY - 10} Q -60 ${headCY - 62} 0 ${headCY - 66} Q 60 ${headCY - 62} 56 ${headCY - 10} L 46 ${headCY - 4} Q 50 ${headCY - 32} 0 ${headCY - 36} Q -44 ${headCY - 34} -48 ${headCY + 2} Z`}
          fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
      )}
      {(role === "trucker" || role === "boy") && (
        <g>
          <path d={`M -54 ${headCY - 14} Q 0 ${headCY - 62} 54 ${headCY - 14} L 56 ${headCY - 4} Q 0 ${headCY - 24} -56 ${headCY - 4} Z`}
            fill={role === "trucker" ? "#55604A" : "#3E4B66"} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={0} cy={headCY - 46} r={6} fill={role === "trucker" ? "#44503C" : "#2E3850"} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-18} y={headCY - 12} width={60} height={9} rx={4}
            fill={role === "trucker" ? "#44503C" : "#2E3850"} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {role === "coat" && (
        <g>
          <path d={`M -56 ${headCY - 6} Q -58 ${headCY - 68} 0 ${headCY - 70} Q 58 ${headCY - 68} 56 ${headCY - 6} Z`}
            fill="#D98A4A" stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={-56} y={headCY - 18} width={112} height={14} rx={6} fill="#B8702E" stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={0} cy={headCY - 72} r={13} fill="#F0D8B8" stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {role === "mama" && (
        <g>
          <path d={`M -58 ${headCY - 8} Q -62 ${headCY - 62} 0 ${headCY - 64} Q 62 ${headCY - 62} 58 ${headCY - 8} Q 30 ${headCY - 36} 0 ${headCY - 38} Q -30 ${headCY - 36} -58 ${headCY - 8} Z`}
            fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
          <circle cx={-44} cy={headCY - 46} r={12} fill={hair} />
          <circle cx={44} cy={headCY - 46} r={12} fill={hair} />
        </g>
      )}
      {role === "girl" && (
        <g>
          <path d={`M -56 ${headCY + 18} Q -62 ${headCY - 56} 0 ${headCY - 58} Q 62 ${headCY - 56} 56 ${headCY + 18} L 44 ${headCY + 14} Q 48 ${headCY - 26} 0 ${headCY - 30} Q -48 ${headCY - 26} -44 ${headCY + 14} Z`}
            fill={hair} stroke={KRP.ink} strokeWidth={4.5} />
          <path d={`M 34 ${headCY - 44} l 16 -14 l 2 18 l 16 -4 l -10 16 Z`} fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
        </g>
      )}
      {/* 目 */}
      {face === "closed" ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" fill="none">
          <path d={`M -32 ${eyeY} q 10 10 20 0`} />
          <path d={`M 12 ${eyeY} q 10 10 20 0`} />
        </g>
      ) : blink ? (
        <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round">
          <line x1={-32} y1={eyeY} x2={-12} y2={eyeY} />
          <line x1={12} y1={eyeY} x2={32} y2={eyeY} />
        </g>
      ) : (
        <g>
          <circle cx={-22 + gx} cy={eyeY + gy} r={6} fill={KRP.ink} />
          <circle cx={22 + gx} cy={eyeY + gy} r={6} fill={KRP.ink} />
        </g>
      )}
      {/* 眉・口 */}
      <g stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" fill="none">
        {face === "worried" ? (
          <>
            <line x1={-32} y1={eyeY - 24} x2={-12} y2={eyeY - 18} />
            <line x1={12} y1={eyeY - 18} x2={32} y2={eyeY - 24} />
          </>
        ) : face === "surprised" ? (
          <>
            <line x1={-32} y1={eyeY - 28} x2={-12} y2={eyeY - 28} />
            <line x1={12} y1={eyeY - 28} x2={32} y2={eyeY - 28} />
          </>
        ) : (
          <>
            <line x1={-32} y1={eyeY - 22} x2={-12} y2={eyeY - 24} />
            <line x1={12} y1={eyeY - 24} x2={32} y2={eyeY - 22} />
          </>
        )}
        {face === "surprised" ? (
          <ellipse cx={0} cy={eyeY + 38} rx={9} ry={12} fill={KRP.ink} />
        ) : face === "smile" || face === "closed" ? (
          <path d={`M -13 ${eyeY + 34} Q 0 ${eyeY + 47} 13 ${eyeY + 34}`} />
        ) : face === "worried" ? (
          <path d={`M -11 ${eyeY + 40} Q 0 ${eyeY + 32} 11 ${eyeY + 40}`} />
        ) : (
          <line x1={-9} y1={eyeY + 38} x2={9} y2={eyeY + 38} />
        )}
      </g>
    </g>
  );
};

// ===== 紙コップ (x,y=底の中央) =====
const PaperCupC: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 0 L 30 0 L 40 -84 L -40 -84 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
    <path d="M -37 -62 L 37 -62" stroke={KRP.red} strokeWidth={7} opacity={0.85} />
    <path d="M -40 -84 L 40 -84" stroke={KRP.ink} strokeWidth={4.5} />
  </g>
);

// ============================================================
// 第9章 あったかいと、つめたいの同居 (168〜180)
// ============================================================

// ===== 168. 扉: 日本地図に高速道路が伸びる「1973年」 =====
const SceneCh9Door: React.FC<{ f: number }> = ({ f }) => {
  const hwy: Array<[number, number]> = [
    [139.7, 35.68], [138.9, 35.3], [137.9, 34.85], [136.9, 35.17], [136.2, 35.0], [135.5, 34.69],
  ];
  const d = "M " + hwy.map(([lon, lat]) => jmapXY(lon, lat).join(" ")).join(" L ");
  const draw = easeOut(seg(f, 12, 72));
  const stampOn = f >= 88;
  const titleT = easeOut(seg(f, 100, 118));
  const [tx, ty] = jmapXY(139.7, 35.68);
  const [nx, ny] = jmapXY(136.9, 35.17);
  const [ox, oy] = jmapXY(135.5, 34.69);
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={250} />
        <g filter="url(#wobbleSoft)">
          <JapanMapCard>
            {/* 高速道路 (太い下地+白い中央線が伸びる) */}
            <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}
              fill="none" stroke={KRP.ink} strokeWidth={18} strokeLinecap="round" />
            <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}
              fill="none" stroke={KRP.green} strokeWidth={11} strokeLinecap="round" />
            {/* IC の点 */}
            {hwy.map(([lon, lat], i) => {
              const [cx, cy] = jmapXY(lon, lat);
              return <circle key={i} cx={cx} cy={cy} r={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={4}
                opacity={seg(f, 12 + i * 10, 20 + i * 10)} />;
            })}
            <MapPin x={tx} y={ty} t={seg(f, 6, 18)} />
            <MapPin x={nx} y={ny} t={seg(f, 42, 56)} />
            <MapPin x={ox} y={oy} t={seg(f, 66, 80)} />
            <JmapLabel lon={139.7} lat={35.68} text="東京" />
            <JmapLabel lon={135.5} lat={34.69} text="大阪" dx={-176} dy={44} />
          </JapanMapCard>
        </g>
      </svg>
      {stampOn && <Stamp x={320} y={180} text="1973年" size={48} />}
      <div style={{
        position: "absolute", left: 1100, top: 650, width: 720,
        background: "rgba(253,251,247,0.78)", borderRadius: 16, padding: "20px 28px",
        opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
      }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: KRP.grayDark, letterSpacing: 6 }}>
          第9章
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 50, color: KRP.ink, lineHeight: 1.4,
          borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
        }}>
          あったかいとつめたいの同居
        </div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 169. 日の丸+電球ピカッ =====
const SceneJapanIdea: React.FC<{ f: number }> = ({ f }) => {
  const flagT = pop(seg(f, 6, 24));
  const bulbT = pop(seg(f, 26, 42));
  const on = seg(f, 48, 58);
  const glow = on * (0.55 + 0.45 * Math.abs(Math.sin(f / 6)));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={251} />
        <g filter="url(#wobbleSoft)">
          <circle cx={960} cy={560} r={470} fill={KRP.cream} opacity={0.7} />
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 620) scale(${flagT}) translate(-960 -620)`}>
            <FlagCard kind="japan" x={960} y={620} s={2.4} />
          </g>
          {/* 電球 */}
          {bulbT > 0.02 && (
            <g transform={`translate(960 250) scale(${bulbT}) translate(-960 -250)`}>
              {glow > 0.05 && <circle cx={960} cy={230} r={150} fill={KRP.yellow} opacity={0.3 * glow} />}
              <circle cx={960} cy={230} r={72} fill={glow > 0.3 ? "#FFE98F" : "#FFF3C4"} stroke={KRP.ink} strokeWidth={6.5} />
              <path d="M 944 252 L 952 230 L 968 244 L 976 222" fill="none" stroke={KRP.ink} strokeWidth={4.5} />
              <rect x={932} y={296} width={56} height={34} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
              <line x1={936} y1={308} x2={984} y2={308} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
              <line x1={936} y1={318} x2={984} y2={318} stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
              {/* 放射のピカッ */}
              {glow > 0.1 && (
                <g stroke={KRP.orange} strokeWidth={9} strokeLinecap="round" opacity={glow}>
                  {Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
                    return <line key={i} x1={960 + Math.cos(a) * 96} y1={230 + Math.sin(a) * 96}
                      x2={960 + Math.cos(a) * 134} y2={230 + Math.sin(a) * 134} />;
                  })}
                </g>
              )}
            </g>
          )}
          {f > 56 && (
            <g>
              <Sparkle x={620} y={300} r={26} f={f} phase={1} />
              <Sparkle x={1320} y={380} r={24} f={f} phase={3} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="世界があっと驚く発明を" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 170. 高速のSA、pokkaが冷めたコーヒーを手に (寒色・湯気なし) =====
const SceneSaCoffee: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={252} />
      <g filter="url(#wobbleSoft)">
        {/* 休憩所の建物 */}
        <rect x={140} y={330} width={640} height={310} fill={KRP.cream} stroke={KRP.ink} strokeWidth={7} />
        <rect x={110} y={290} width={700} height={52} rx={10} fill="#8C6E54" stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={190 + i * 190} y={400} width={120} height={120} rx={8}
            fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <rect x={250} y={196} width={420} height={70} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={460} y={246} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={KRP.ink}>
          高速道路の休憩所
        </text>
        {/* 駐車場と道路 */}
        <rect x={0} y={640} width={W} height={260} fill="#B8B2A4" />
        <rect x={0} y={900} width={W} height={180} fill="#7E868E" />
        <g stroke={KRP.white} strokeWidth={8}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={120 + i * 500} y1={988} x2={340 + i * 500} y2={988} />
          ))}
        </g>
        {/* ガードレール */}
        <line x1={0} y1={652} x2={W} y2={652} stroke={KRP.white} strokeWidth={14} />
        {[200, 560, 920, 1280, 1640].map((px) => (
          <rect key={px} x={px} y={652} width={12} height={34} fill={KRP.gray} stroke={KRP.ink} strokeWidth={3} />
        ))}
        {/* 寒色のベール */}
        <rect x={0} y={0} width={W} height={H} fill="#7E96B8" opacity={0.09} />
      </g>
      <g filter="url(#wobble)">
        <Hito x={1180} y={880} s={1.15} role="pokka" f={f} phase={0} face="worried" gaze={[-5, 5]} hideArm="left" />
        <Arm x1={1120} y1={760} x2={1030} y2={706} cloth="#9AA6B8" s={1.15} />
        <PaperCupC x={1026} y={760} s={1.05} />
        {/* 湯気なし… の「シーン」とした空気 (寒色の点) */}
        <circle cx={1000} cy={620} r={5} fill={KRP.blueDeep} opacity={0.4 + 0.3 * Math.sin(f / 11)} />
        <circle cx={1070} cy={580} r={4} fill={KRP.blueDeep} opacity={0.4 + 0.3 * Math.sin(f / 9 + 2)} />
      </g>
    </svg>
    <LabelPill x={960} y={968} centerX text="冷めたコーヒーしか、なかった" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 171. ポッカの創業者が悔しがる (むむむ+肩ぷるぷる) =====
const ScenePokkaKuyashii: React.FC<{ f: number }> = ({ f }) => {
  const bub = pop(seg(f, 26, 42));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={253} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <circle cx={760} cy={480} r={430} fill={KRP.cream} opacity={0.6} />
        </g>
        <g filter="url(#wobble)">
          <Hito x={760} y={892} s={1.5} role="pokka" f={f} phase={0} face="worried" gaze={[0, 2]} shiver={2.4} />
          {/* 怒りのぷるぷるマーク */}
          <g stroke={KRP.red} strokeWidth={7} strokeLinecap="round" opacity={0.7 + 0.3 * Math.sin(f / 5)}>
            <path d="M 560 480 q -16 -12 -8 -30" fill="none" />
            <path d="M 540 540 q -18 -8 -14 -28" fill="none" />
            <path d="M 968 490 q 16 -12 8 -30" fill="none" />
          </g>
          {bub > 0.02 && (
            <g transform={`translate(1310 360) scale(${bub}) translate(-1310 -360)`}>
              <circle cx={1310} cy={340} r={150} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
              <circle cx={1150} cy={470} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={1090} cy={530} r={11} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <text x={1310} y={372} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={KRP.ink}>
                むむむ
              </text>
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="ポッカの創業者、悔しがる" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 172. 吹き出しに「湯気の立つコーヒー」の夢 =====
const SceneHotDream: React.FC<{ f: number }> = ({ f }) => {
  const bub = pop(seg(f, 18, 38));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={254} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <Hito x={620} y={892} s={1.25} role="pokka" f={f} phase={0} face="normal" gaze={[6, -4]} />
          {bub > 0.02 && (
            <g transform={`translate(1270 380) scale(${bub}) translate(-1270 -380)`}>
              {/* 考えごとの泡 */}
              <circle cx={866} cy={600} r={14} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
              <circle cx={950} cy={530} r={26} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
              <circle cx={1270} cy={370} r={225} fill={KRP.white} stroke={KRP.ink} strokeWidth={7.5} />
              {/* 湯気の立つコーヒー */}
              <g transform="translate(1270 470)">
                <path d="M -84 0 L 84 0 L 70 -118 L -70 -118 Z" fill="#8C5A3A" stroke={KRP.ink} strokeWidth={6} />
                <ellipse cx={0} cy={-118} rx={70} ry={15} fill="#5C3A26" stroke={KRP.ink} strokeWidth={5} />
                <path d="M 72 -96 Q 126 -92 112 -46 Q 104 -22 66 -24" fill="none" stroke={KRP.ink} strokeWidth={9} />
              </g>
              <Steam x={1230} y={330} s={1.3} f={f} phase={0} color={KRP.grayDark} />
              <Steam x={1300} y={330} s={1.1} f={f} phase={2} color={KRP.grayDark} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="いつでも熱いコーヒーを" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 173. 1973年、ホット自販機登場 (赤い「あったか〜い」) =====
const SceneHotJihanki: React.FC<{ f: number }> = ({ f }) => {
  const inT = pop(seg(f, 8, 26));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={255} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <circle cx={940} cy={480} r={470} fill="#F6D8C2" opacity={0.5 + 0.1 * Math.sin(f / 11)} />
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 560) scale(${inT}) translate(-960 -560)`}>
            <JihankiNight x={760} y={250} s={1} f={f} />
            <TagPlate x={940} y={600} text="あったか〜い" size={34} color={KRP.red} op={seg(f, 30, 44)} />
          </g>
          {f > 40 && (
            <g>
              <Steam x={850} y={246} s={1.2} f={f} phase={0} />
              <Steam x={1010} y={240} s={1.4} f={f} phase={2} />
              <Steam x={930} y={230} s={1} f={f} phase={4} />
            </g>
          )}
        </g>
      </svg>
      {f >= 64 && <Stamp x={300} y={190} text="1973年" size={44} />}
      <LabelPill x={960} y={968} centerX text="温かい飲み物を売る自販機" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 174. 世界初の缶コーヒー、スポットライトで登場 =====
const SceneCanCoffeeBorn: React.FC<{ f: number }> = ({ f }) => {
  const inT = pop(seg(f, 14, 32));
  // 登場時に2回転して、正面 (ラベル面) でピタッと止まる
  const spin = 1 - easeOut(seg(f, 10, 78));
  const sx = Math.cos(spin * Math.PI * 4);
  return (
    <AbsoluteFill style={{ background: "#2B3047" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={256} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={900} width={W} height={180} fill="#232736" />
          {/* スポットライト */}
          <polygon points="900,-40 1020,-40 1300,920 620,920" fill="#FFF3C4" opacity={0.16 + 0.04 * Math.sin(f / 9)} />
          <ellipse cx={960} cy={906} rx={360} ry={44} fill="#FFF3C4" opacity={0.22} />
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 870) scale(${inT}) translate(-960 -870)`}>
            <CanDrink x={960} y={870} s={3.2} sx={sx} coffee />
          </g>
          {f > 36 && (
            <g>
              <Sparkle x={620} y={340} r={30} f={f} phase={0} />
              <Sparkle x={1320} y={280} r={26} f={f} phase={2} />
              <Sparkle x={1260} y={660} r={22} f={f} phase={4} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={980} centerX text="世界初の缶コーヒー、誕生" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 175. 缶と自販機、見つめ合ってハートぽわん =====
const SceneUnmeiDeai: React.FC<{ f: number }> = ({ f }) => {
  const hb = pop(seg(f, 36, 52)) * (1 + 0.08 * Math.sin(f / 8));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={257} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <circle cx={960} cy={470} r={440} fill="#F6D8C2" opacity={0.5} />
        </g>
        <g filter="url(#wobble)">
          {/* 缶 (少し自販機側へ傾く) */}
          <g transform={`rotate(${6 + Math.sin(f / 15) * 2} 520 880)`}>
            <CanDrink x={520} y={880} s={2.4} coffee />
            {/* 見つめる目 */}
            <circle cx={482} cy={630} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={548} cy={630} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={488} cy={632} r={6} fill={KRP.ink} />
            <circle cx={554} cy={632} r={6} fill={KRP.ink} />
          </g>
          <JihankiNight x={1180} y={260} s={0.85} f={f} />
          {/* 自販機側の目 (窓に) */}
          <circle cx={1262} cy={380} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1328} cy={380} r={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={1256} cy={382} r={6} fill={KRP.ink} />
          <circle cx={1322} cy={382} r={6} fill={KRP.ink} />
          {hb > 0.02 && (
            <g transform={`translate(880 420) scale(${hb}) translate(-880 -420)`}>
              <Heart cx={880} cy={420} s={1.5} />
            </g>
          )}
          {f > 70 && (
            <g>
              <Heart cx={760} cy={300} s={0.6 * (0.8 + 0.2 * Math.sin(f / 7))} />
              <Heart cx={1010} cy={280} s={0.5 * (0.8 + 0.2 * Math.sin(f / 7 + 2))} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="運命の出会い" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 176. 1976年、赤と青の2色に光る自販機 =====
const SceneHotColdBoth: React.FC<{ f: number }> = ({ f }) => {
  const ph = Math.sin(f / 10);
  const hot = Math.max(ph, 0);
  const cold = Math.max(-ph, 0);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={258} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <circle cx={960} cy={500} r={500} fill={KRP.red} opacity={0.14 * hot} />
          <circle cx={960} cy={500} r={500} fill={KRP.blueDeep} opacity={0.14 * cold} />
        </g>
        <g filter="url(#wobble)">
          <JihankiNight x={780} y={240} s={1} f={f} />
          <TagPlate x={960} y={580} text="あったか〜い" size={30} color={KRP.red} op={0.55 + 0.45 * hot} />
          <TagPlate x={960} y={648} text="つめた〜い" size={30} color={KRP.blueDeep} op={0.55 + 0.45 * cold} />
          {hot > 0.5 && <Steam x={900} y={236} s={1.1} f={f} phase={0} />}
          {cold > 0.5 && (
            <g stroke={KRP.blueDeep} strokeWidth={5} opacity={0.8}>
              <path d={star4(900, 200, 20)} fill={KRP.blueSoft} />
              <path d={star4(1010, 180, 15)} fill={KRP.blueSoft} />
            </g>
          )}
        </g>
      </svg>
      {f >= 60 && <Stamp x={300} y={190} text="1976年" size={44} />}
      <LabelPill x={960} y={968} centerX text="「あったかい」と「つめたい」を同時に" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 177. 日の丸ラベル+赤ハンコ「日本生まれ」ドン =====
const SceneJapanUmare: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={259} />
      <g filter="url(#wobbleSoft)">
        <circle cx={960} cy={520} r={470} fill={KRP.cream} opacity={0.7} />
      </g>
      <g filter="url(#wobble)">
        <g transform={`translate(960 520) scale(${pop(seg(f, 8, 26))}) translate(-960 -520)`}>
          <FlagCard kind="japan" x={960} y={500} s={2.6} />
        </g>
        {f > 40 && (
          <g>
            <Sparkle x={560} y={300} r={26} f={f} phase={1} />
            <Sparkle x={1360} y={340} r={24} f={f} phase={3} />
          </g>
        )}
      </g>
    </svg>
    {f >= 78 && <Stamp x={1150} y={660} text="日本生まれ" size={56} />}
    <LabelPill x={960} y={968} centerX text="当たり前に見えて、日本の芸当" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 断面図の共通部品: 仕切り壁のある箱 (左=冷蔵庫・右=保温庫) =====
const SnowIcon: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
    stroke={KRP.blueDeep} strokeWidth={7} strokeLinecap="round" fill="none">
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <line x1={0} y1={-44} x2={0} y2={44} />
        <path d="M -12 -28 L 0 -40 L 12 -28" />
        <path d="M -12 28 L 0 40 L 12 28" />
      </g>
    ))}
  </g>
);
const FlameIcon: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 44 C -36 24 -30 -16 0 -52 C 6 -30 28 -28 30 -4 C 32 22 20 44 0 44 Z"
      fill={KRP.orange} stroke={KRP.ink} strokeWidth={5} />
    <path d="M 0 40 C -16 28 -14 6 0 -14 C 4 -2 14 0 15 12 C 16 26 10 40 0 40 Z"
      fill={KRP.yellow} />
  </g>
);
const HotColdBox: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => (
  <g>
    {/* 断面カード */}
    <rect x={280} y={170} width={1360} height={760} rx={20} fill="#F3EBD7" stroke={KRP.ink} strokeWidth={7} />
    {/* 機械の中身 (左右の部屋) */}
    <rect x={360} y={240} width={576} height={560} rx={12} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
    <rect x={984} y={240} width={576} height={560} rx={12} fill="#F2CFC2" stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
    {/* 仕切り壁 */}
    <rect x={936} y={220} width={48} height={600} fill="#D9CBA9" stroke={KRP.ink} strokeWidth={6} />
    <g stroke={KRP.ink} strokeWidth={3} opacity={0.35}>
      {[300, 420, 540, 660, 780].map((gy) => (
        <line key={gy} x1={944} y1={gy} x2={976} y2={gy} />
      ))}
    </g>
    {/* 左の缶 (青) と右の缶 (赤) */}
    {[0, 1, 2].map((i) => (
      <g key={`c${i}`}>
        <rect x={430 + i * 150} y={620} width={84} height={130} rx={10} fill={KRP.blueDeep} stroke={KRP.ink} strokeWidth={5} />
        <rect x={430 + i * 150} y={656} width={84} height={22} fill={KRP.white} opacity={0.6} />
        <rect x={1060 + i * 150} y={620} width={84} height={130} rx={10} fill="#C9573B" stroke={KRP.ink} strokeWidth={5} />
        <rect x={1060 + i * 150} y={656} width={84} height={22} fill={KRP.white} opacity={0.6} />
      </g>
    ))}
    {/* 雪と炎 (ゆれる) */}
    <SnowIcon x={648} y={400} s={1.15} rot={Math.sin(f / 11) * 10} />
    <FlameIcon x={1272} y={400} s={1.3} rot={Math.sin(f / 9 + 1) * 8} />
    <TagPlate x={648} y={866} text="冷蔵庫" size={34} color={KRP.blueDeep} />
    <TagPlate x={1272} y={866} text="保温庫" size={34} color={KRP.red} />
    {children}
  </g>
);

// ===== 178. 断面: 仕切り壁で左右に (雪と炎がゆれる) =====
const SceneNakaShikiri: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={260} />
      <g filter="url(#wobbleSoft)">
        <rect x={250} y={140} width={1420} height={820} rx={26} fill={KRP.cream} opacity={0.6} />
      </g>
      <g filter="url(#wobble)">
        <HotColdBox f={f} />
      </g>
    </svg>
    <LabelPill x={960} y={1000} centerX text="箱の中を、壁で仕切る" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 179. 断面: 熱の矢印が冷側→温側へぐるり引っ越すループ =====
const SceneNetsuRecycle: React.FC<{ f: number }> = ({ f }) => {
  // 冷側→下→温側→上へ一周する循環ルート
  const loop: Array<[number, number]> = [
    [648, 330], [560, 330], [560, 770], [960, 844], [1360, 770], [1360, 330], [1272, 330],
    [1272, 290], [960, 258], [648, 290], [648, 330],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={261} />
        <g filter="url(#wobbleSoft)">
          <rect x={250} y={140} width={1420} height={820} rx={26} fill={KRP.cream} opacity={0.6} />
        </g>
        <g filter="url(#wobble)">
          <HotColdBox f={f}>
            {/* 熱運びポンプ (下のかよい路) */}
            <rect x={880} y={812} width={160} height={64} rx={12} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
            <circle cx={960} cy={844} r={18 + 3 * Math.sin(f / 5)} fill={KRP.orange} opacity={0.8} />
            {/* 循環する熱の矢印 */}
            {[0, 1, 2, 3].map((i) => {
              const p = polyPoint(loop, f / 150 + i / 4);
              const deg = (p.ang * 180) / Math.PI;
              return (
                <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${deg})`} opacity={0.92}>
                  <line x1={-34} y1={0} x2={10} y2={0} stroke={KRP.orange} strokeWidth={13} strokeLinecap="round" />
                  <polygon points="34,0 8,-16 8,16" fill={KRP.orange} stroke={KRP.ink} strokeWidth={3} />
                </g>
              );
            })}
          </HotColdBox>
        </g>
      </svg>
      <LabelPill x={960} y={1000} centerX text="冷やして出た熱を、温めに回す" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 180. 冬の夜、手袋の手が温かいお茶を取り出す =====
const SceneFuyuNoOcha: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 70;
  const br = seg(cyc, 0, 44);
  return (
    <AbsoluteFill style={{ background: "#2E3A52" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={262} />
        <g filter="url(#wobbleSoft)">
          <NightSky f={f} />
          <rect x={0} y={860} width={W} height={220} fill="#E8E9EC" />
          <rect x={0} y={845} width={W} height={20} fill={KRP.white} opacity={0.8} />
        </g>
        <g filter="url(#wobble)">
          <JihankiNight x={1120} y={240} s={0.92} f={f} />
          {/* 雪 */}
          {Array.from({ length: 14 }, (_, i) => {
            const sx = (i * 149) % W;
            const sy = (f * 1.3 + i * 83) % (H + 60) - 30;
            return <circle key={i} cx={sx + Math.sin((f + i * 20) / 23) * 16} cy={sy} r={i % 3 === 0 ? 7 : 5}
              fill={KRP.white} opacity={0.85} />;
          })}
          {/* 冬支度の人 (マフラー+ニット帽)。右腕は別描きで取り出し口へ */}
          <Hito x={820} y={892} s={1.12} role="coat" f={f} phase={0} face="smile" gaze={[7, -2]} hideArm="right" />
          <Arm x1={890} y1={762} x2={1150} y2={700} cloth="#8C6E54" s={1.12} hand={KRP.red} />
          {/* 温かいお茶の缶 */}
          <g transform="translate(1176 702) rotate(10)">
            <rect x={-26} y={-66} width={52} height={78} rx={8} fill="#D9A23C" stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={-26} y={-44} width={52} height={16} fill={KRP.white} opacity={0.6} />
          </g>
          <Steam x={1168} y={624} s={0.8} f={f} phase={1} color={KRP.white} />
          {/* 白い息 */}
          <ellipse cx={880 + br * 44} cy={636 - br * 12} rx={16 + br * 28} ry={9 + br * 15}
            fill={KRP.white} opacity={(1 - br) * 0.55} />
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="半世紀前の悔しさから" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ============================================================
// 第10章 増えていく親戚たち (181〜198)
// ============================================================

// ===== 親戚のミニ機械アイコン (x,y=中心、t=0..1でポン) =====
type KikaiKind = "jihanki" | "ticket" | "change" | "locker" | "gacha" | "udon";
const MiniKikai: React.FC<{ x: number; y: number; t: number; kind: KikaiKind; s?: number }> = ({
  x, y, t, kind, s = 1,
}) => {
  if (t <= 0) return null;
  const p = pop(clamp01(t));
  return (
    <g transform={`translate(${x} ${y}) scale(${p * s})`}>
      {kind === "jihanki" && (
        <g>
          <rect x={-24} y={-32} width={48} height={64} rx={6} fill="#C9573B" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-24} width={26} height={26} rx={4} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-16} y={12} width={20} height={10} rx={3} fill={KRP.ink} />
        </g>
      )}
      {kind === "ticket" && (
        <g>
          <rect x={-24} y={-32} width={48} height={64} rx={6} fill="#7E96B8" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-16} y={-22} width={32} height={14} rx={3} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-8} y={4} width={16} height={6} rx={2} fill={KRP.ink} />
          <rect x={-6} y={-2} width={12} height={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={2} />
        </g>
      )}
      {kind === "change" && (
        <g>
          <rect x={-24} y={-32} width={48} height={64} rx={6} fill="#8C6E54" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-10} r={11} fill={KRP.gold} stroke={KRP.ink} strokeWidth={3} />
          <rect x={-14} y={10} width={28} height={8} rx={3} fill={KRP.ink} />
        </g>
      )}
      {kind === "locker" && (
        <g>
          <rect x={-26} y={-32} width={52} height={64} rx={5} fill={KRP.gray} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1].map((c) =>
            [0, 1].map((r) => (
              <rect key={`${c}${r}`} x={-20 + c * 22} y={-26 + r * 28} width={18} height={24} rx={3}
                fill={KRP.silver} stroke={KRP.ink} strokeWidth={2.5} />
            )),
          )}
        </g>
      )}
      {kind === "gacha" && (
        <g>
          <circle cx={0} cy={-14} r={21} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={-7} cy={-18} r={6} fill={KRP.red} />
          <circle cx={8} cy={-10} r={6} fill={KRP.yellow} />
          <rect x={-20} y={6} width={40} height={26} rx={5} fill="#C9573B" stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={19} r={7} fill={KRP.silver} stroke={KRP.ink} strokeWidth={2.5} />
        </g>
      )}
      {kind === "udon" && (
        <g>
          <rect x={-24} y={-32} width={48} height={64} rx={6} fill="#EFE3C8" stroke={KRP.ink} strokeWidth={4} />
          <path d="M -14 2 A 14 14 0 0 0 14 2 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
          <path d="M -10 -6 Q 0 -14 10 -6" fill="none" stroke={KRP.ink} strokeWidth={2.5} />
          <rect x={-16} y={-26} width={32} height={10} rx={3} fill={KRP.red} opacity={0.85} />
        </g>
      )}
    </g>
  );
};

// ===== 181. 扉: 地図に親戚の家系図が広がる =====
const SceneCh10Door: React.FC<{ f: number }> = ({ f }) => {
  const [cx, cy] = jmapXY(137.6, 36.4);
  const branches: Array<{ to: [number, number]; kind: KikaiKind; d: number }> = [
    { to: jmapXY(141.35, 43.06), kind: "ticket", d: 0 },
    { to: jmapXY(140.87, 38.27), kind: "locker", d: 1 },
    { to: jmapXY(139.7, 35.0), kind: "gacha", d: 2 },
    { to: jmapXY(135.5, 34.69), kind: "udon", d: 3 },
    { to: jmapXY(132.46, 34.4), kind: "change", d: 4 },
    { to: jmapXY(130.4, 33.59), kind: "jihanki", d: 5 },
  ];
  const titleT = easeOut(seg(f, 100, 118));
  return (
    <AbsoluteFill style={{ background: KRP.paper, fontFamily: FONT }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={263} />
        <g filter="url(#wobbleSoft)">
          <JapanMapCard>
            {branches.map(({ to, d }, i) => {
              const t = easeOut(seg(f, 10 + d * 10, 40 + d * 10));
              if (t <= 0) return null;
              return (
                <path key={i} d={`M ${cx} ${cy} L ${to[0]} ${to[1]}`} pathLength={1}
                  strokeDasharray={1} strokeDashoffset={1 - t}
                  fill="none" stroke={KRP.ink} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
              );
            })}
            <MiniKikai x={cx} y={cy} t={seg(f, 2, 12)} kind="jihanki" s={1.4} />
            {branches.map(({ to, kind, d }, i) => (
              <MiniKikai key={i} x={to[0]} y={to[1]} t={seg(f, 38 + d * 10, 50 + d * 10)} kind={kind} s={1.1} />
            ))}
          </JapanMapCard>
        </g>
      </svg>
      <div style={{
        position: "absolute", left: 1100, top: 650, width: 720,
        background: "rgba(253,251,247,0.78)", borderRadius: 16, padding: "20px 28px",
        opacity: titleT, transform: `translateY(${(1 - titleT) * 30}px)`,
      }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: KRP.grayDark, letterSpacing: 6 }}>
          第10章
        </div>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 54, color: KRP.ink, lineHeight: 1.4,
          borderBottom: `6px solid ${KRP.ink}`, paddingBottom: 10,
        }}>
          増えていく親戚たち
        </div>
      </div>
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 182. 自販機を中心に親戚の家系図 (順にポン) =====
const SceneShinsekiTree: React.FC<{ f: number }> = ({ f }) => {
  const kids: Array<{ x: number; kind: KikaiKind; name: string }> = [
    { x: 360, kind: "ticket", name: "券売機" },
    { x: 660, kind: "change", name: "両替機" },
    { x: 960, kind: "locker", name: "コインロッカー" },
    { x: 1260, kind: "gacha", name: "ガチャ" },
    { x: 1560, kind: "udon", name: "うどん自販機" },
  ];
  const busT = easeOut(seg(f, 14, 40));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={264} />
        <g filter="url(#wobbleSoft)">
          <rect x={200} y={120} width={1520} height={820} rx={24} fill={KRP.cream} opacity={0.65} />
        </g>
        <g filter="url(#wobble)">
          {/* 家系図の線: 中心から下のバスへ、バスから各アイコンへ */}
          <line x1={960} y1={370} x2={960} y2={lerp(370, 500, busT)} stroke={KRP.ink} strokeWidth={6} />
          <line x1={lerp(960, 360, busT)} y1={500} x2={lerp(960, 1560, busT)} y2={500}
            stroke={KRP.ink} strokeWidth={6} />
          {kids.map(({ x }, i) => (
            <line key={i} x1={x} y1={500} x2={x} y2={lerp(500, 600, easeOut(seg(f, 34 + i * 12, 50 + i * 12)))}
              stroke={KRP.ink} strokeWidth={6} />
          ))}
          <MiniKikai x={960} y={290} t={seg(f, 2, 14)} kind="jihanki" s={2.2} />
          <TagPlate x={960} y={420} text="自販機" size={30} op={seg(f, 10, 20)} />
          {kids.map(({ x, kind, name }, i) => (
            <g key={i}>
              <MiniKikai x={x} y={660} t={seg(f, 46 + i * 12, 58 + i * 12)} kind={kind} s={1.9} />
              <TagPlate x={x} y={790} text={name} size={26} op={seg(f, 54 + i * 12, 64 + i * 12)} />
            </g>
          ))}
        </g>
      </svg>
      <LabelPill x={960} y={988} centerX text="親戚が、次々に生まれる" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 183. 券売機・両替機・コインロッカーが並んで小さく動く =====
const SceneEkiMachines: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 80;
  const tk = easeOut(seg(cyc, 10, 24)) - seg(cyc, 56, 70); // 切符ピッ
  const coinY = easeOut(seg(cyc, 20, 44)); // コインぽとん
  const door = easeOut(seg(cyc, 14, 34)) - easeOut(seg(cyc, 50, 70)); // 扉ぱたん
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={265} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={860} width={W} height={220} fill={KRP.floor} />
          <rect x={0} y={200} width={W} height={660} fill={KRP.cream} opacity={0.4} />
        </g>
        <g filter="url(#wobble)">
          {/* 券売機 */}
          <g>
            <rect x={300} y={400} width={260} height={460} rx={14} fill="#7E96B8" stroke={KRP.ink} strokeWidth={7} />
            <rect x={330} y={430} width={200} height={110} rx={8} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={370 + i * 60} cy={590} r={17} fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            ))}
            <rect x={370} y={680} width={120} height={26} rx={6} fill={KRP.ink} />
            {/* 切符ピッ */}
            {tk > 0.02 && (
              <g>
                <rect x={398} y={686 - tk * 44} width={64} height={40} rx={4}
                  fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
                <line x1={414} y1={706 - tk * 44} x2={446} y2={706 - tk * 44} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
                {tk > 0.9 && <Sparkle x={490} y={630} r={18} f={f} phase={0} />}
              </g>
            )}
          </g>
          {/* 両替機 */}
          <g>
            <rect x={830} y={430} width={260} height={430} rx={14} fill="#8C6E54" stroke={KRP.ink} strokeWidth={7} />
            <rect x={900} y={470} width={120} height={20} rx={7} fill={KRP.ink} />
            {/* コインぽとん */}
            <Coin cx={960} cy={lerp(520, 700, coinY)} r={26} fill={KRP.silver} text="100" textSize={17} />
            <path d="M 880 700 L 1040 700 L 1020 748 Q 960 762 900 748 Z"
              fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          </g>
          {/* コインロッカー */}
          <g>
            <rect x={1360} y={360} width={320} height={500} rx={12} fill={KRP.gray} stroke={KRP.ink} strokeWidth={7} />
            {[0, 1].map((c) =>
              [0, 1, 2].map((r) =>
                (c === 1 && r === 1) ? null : (
                  <g key={`${c}${r}`}>
                    <rect x={1384 + c * 152} y={384 + r * 156} width={128} height={132} rx={6}
                      fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
                    <circle cx={1404 + c * 152} cy={450 + r * 156} r={7} fill={KRP.ink} />
                  </g>
                ),
              ),
            )}
            {/* 開く扉 (ヒンジは左) */}
            <rect x={1536} y={540} width={128} height={132} rx={6} fill={KRP.ink} opacity={0.5} />
            <g transform={`translate(1536 540) scale(${Math.max(1 - door * 1.6, -0.6)} 1)`}>
              <rect x={0} y={0} width={128} height={132} rx={6} fill="#DCE2E6" stroke={KRP.ink} strokeWidth={4.5} />
              <circle cx={108} cy={66} r={7} fill={KRP.ink} />
            </g>
          </g>
          <TagPlate x={430} y={330} text="券売機" size={32} />
          <TagPlate x={960} y={360} text="両替機" size={32} />
          <TagPlate x={1520} y={290} text="コインロッカー" size={32} />
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="駅にも街角にも、親戚が" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 184. 地球儀: アメリカから日本へカプセルが飛んでくる =====
const SceneGachaArrival: React.FC<{ f: number }> = ({ f }) => {
  const cx = 820, cy = 520, r = 340, lon0 = -150;
  const usa = globePoint(cx, cy, r, -74, 40.7, lon0);
  const jp = globePoint(cx, cy, r, 137, 36, lon0);
  const t = easeOut(seg(f, 24, 80));
  // 弧の上のカプセル位置 (DashArcと同じ2次ベジェ)
  const mx = (usa.x + jp.x) / 2;
  const my = Math.min(usa.y, jp.y) - 200;
  const u = t;
  const px = (1 - u) * (1 - u) * usa.x + 2 * (1 - u) * u * mx + u * u * jp.x;
  const py = (1 - u) * (1 - u) * usa.y + 2 * (1 - u) * u * my + u * u * jp.y;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={266} />
        <g filter="url(#wobbleSoft)">
          <circle cx={cx} cy={cy} r={r + 130} fill={KRP.cream} opacity={0.55} />
        </g>
        <g filter="url(#wobble)">
          <Globe cx={cx} cy={cy} r={r} lon0={lon0} f={f} />
          <MapPin x={usa.x} y={usa.y} t={seg(f, 6, 18)} s={0.9} />
          <DashArc x1={usa.x} y1={usa.y} x2={jp.x} y2={jp.y} t={t} lift={200} />
          <MapPin x={jp.x} y={jp.y} t={seg(f, 76, 90)} />
          {/* 飛んでくるカプセル */}
          {t > 0.02 && (
            <g transform={`translate(${px} ${py}) rotate(${f * 7})`}>
              <path d="M -24 0 A 24 24 0 0 1 24 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4.5} />
              <path d="M 24 0 A 24 24 0 0 1 -24 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
              <line x1={-24} y1={0} x2={24} y2={0} stroke={KRP.ink} strokeWidth={4} />
            </g>
          )}
          <TagPlate x={usa.x - 40} y={usa.y + 60} text="アメリカ" size={28} />
          <TagPlate x={jp.x + 60} y={jp.y - 70} text="日本" size={28} />
        </g>
      </svg>
      {f >= 84 && <Stamp x={300} y={180} text="1965年" size={44} />}
      <LabelPill x={960} y={980} centerX text="小さな親戚が、海を渡る" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== ガチャマシン (正面)。x,y=接地の中央。handleRot=ハンドル角度 =====
const GachaMachine: React.FC<{
  x: number; y: number; s?: number; handleRot?: number; capT?: number; capRoll?: number;
}> = ({ x, y, s = 1, handleRot = 0, capT = 0, capRoll = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 脚 */}
    <rect x={-110} y={-70} width={220} height={70} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
    {/* 本体 */}
    <rect x={-150} y={-330} width={300} height={264} rx={14} fill="#C9573B" stroke={KRP.ink} strokeWidth={8} />
    {/* ドーム (カプセルが見える) */}
    <path d="M -150 -330 L 150 -330 L 150 -352 A 150 136 0 0 0 -150 -352 Z"
      fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} opacity={0.98} />
    <path d="M -150 -352 A 150 136 0 0 1 150 -352 L 150 -330 L -150 -330 Z"
      fill="#EDF6FA" opacity={0.35} />
    {[[-92, -400, KRP.red], [-30, -428, KRP.yellow], [36, -404, KRP.green], [96, -384, KRP.blueDeep],
      [-56, -368, KRP.orange], [20, -360, "#E89AB0"], [84, -352, KRP.blue], [-110, -356, KRP.yellow]].map(([ccx, ccy, col], i) => (
      <g key={i}>
        <circle cx={ccx as number} cy={ccy as number} r={26} fill={col as string} stroke={KRP.ink} strokeWidth={4} />
        <path d={`M ${(ccx as number) - 26} ${ccy} A 26 26 0 0 0 ${(ccx as number) + 26} ${ccy} Z`}
          fill={KRP.white} opacity={0.75} />
      </g>
    ))}
    {/* ドームのふち+てっぺん */}
    <rect x={-158} y={-342} width={316} height={18} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    <circle cx={0} cy={-486} r={14} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
    {/* コイン投入口 */}
    <rect x={-116} y={-296} width={70} height={46} rx={8} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
    <rect x={-88} y={-288} width={12} height={30} rx={4} fill={KRP.ink} />
    {/* ハンドル */}
    <g transform={`rotate(${handleRot} 30 -240)`}>
      <circle cx={30} cy={-240} r={52} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6.5} />
      <rect x={-34} y={-254} width={128} height={28} rx={10} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
      <circle cx={30} cy={-240} r={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={4} />
    </g>
    {/* 取り出し口 */}
    <path d="M -116 -156 L -24 -156 L -24 -84 L -116 -84 Z" fill={KRP.ink} />
    <path d="M -112 -152 A 44 44 0 0 1 -28 -152 L -28 -88 L -112 -88 Z" fill="#6E573F" />
    <rect x={-120} y={-92} width={100} height={14} rx={6} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4} />
    {/* 出てくるカプセル (capT=0..1 で落下→capRoll で転がる) */}
    {capT > 0.02 && (
      <g transform={`translate(${-70 + capRoll * 150} ${lerp(-180, -96, clamp01(capT)) - Math.abs(Math.sin(capRoll * Math.PI)) * 18}) rotate(${capRoll * 220})`}>
        <path d="M -24 0 A 24 24 0 0 1 24 0 Z" fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
        <path d="M 24 0 A 24 24 0 0 1 -24 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        <line x1={-24} y1={0} x2={24} y2={0} stroke={KRP.ink} strokeWidth={4} />
      </g>
    )}
  </g>
);

// ===== 185. ガチャ正面: ハンドル回転→カプセルごろん =====
const SceneGachaFront: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 120;
  const rot = easeOut(seg(cyc, 10, 55)) * 360;
  const capT = seg(cyc, 55, 68);
  const roll = easeOut(seg(cyc, 68, 96));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={267} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <circle cx={960} cy={440} r={450} fill={KRP.cream} opacity={0.65} />
        </g>
        <g filter="url(#wobble)">
          <GachaMachine x={960} y={880} s={1.45} handleRot={rot} capT={capT} capRoll={roll} />
          {roll > 0.9 && <Sparkle x={1210} y={720} r={22} f={f} phase={0} />}
          {/* 回す向きの矢印 */}
          {cyc < 55 && (
            <g opacity={0.8}>
              <path d="M 1120 500 A 110 110 0 0 1 1060 620" fill="none" stroke={KRP.red} strokeWidth={10}
                strokeLinecap="round" strokeDasharray="4 18" />
              <polygon points="1052,636 1046,600 1082,612" fill={KRP.red} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="回すと、カプセルがごろん" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 186. 駄菓子屋の軒先 (のれんゆらゆら) =====
const SceneDagashiya: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: KRP.paper }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={268} />
      <g filter="url(#wobbleSoft)">
        <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
        {/* 店がまえ */}
        <rect x={160} y={260} width={1120} height={620} fill="#EFE3C8" stroke={KRP.ink} strokeWidth={7} />
        <rect x={120} y={190} width={1200} height={84} rx={10} fill="#8C6E54" stroke={KRP.ink} strokeWidth={6.5} />
        {[220, 460, 700, 940, 1180].map((px) => (
          <rect key={px} x={px} y={274} width={16} height={606} fill="#B98A52" stroke={KRP.ink} strokeWidth={4} />
        ))}
        {/* 店の奥 (開いた戸) */}
        <rect x={480} y={340} width={420} height={540} fill="#5C4A3A" stroke={KRP.ink} strokeWidth={5} />
        {/* 駄菓子の棚 */}
        <rect x={980} y={600} width={260} height={280} fill="#B98A52" stroke={KRP.ink} strokeWidth={5.5} />
        {[0, 1].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={1000 + c * 78} y={620 + r * 120} width={62} height={92} rx={6}
              fill={[KRP.yellow, "#E89AB0", KRP.green, KRP.blue, KRP.orange, KRP.blueSoft][r * 3 + c]}
              stroke={KRP.ink} strokeWidth={3.5} />
          )),
        )}
      </g>
      <g filter="url(#wobble)">
        {/* 看板 */}
        <rect x={520} y={200} width={340} height={64} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <text x={690} y={246} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={KRP.ink}>
          だがしや
        </text>
        {/* のれん (上端を支点にゆれる) */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`rotate(${Math.sin(f / 13 + i * 1.3) * 4} ${540 + i * 110} 340)`}>
            <path d={`M ${540 + i * 110} 340 L ${630 + i * 110} 340 L ${626 + i * 110} 520 Q ${585 + i * 110} 532 ${544 + i * 110} 520 Z`}
              fill="#4A78B8" stroke={KRP.ink} strokeWidth={4.5} />
          </g>
        ))}
        {/* ガチャ */}
        <GachaMachine x={1540} y={880} s={0.95} handleRot={Math.sin(f / 23) * 10} />
        <TagPlate x={1540} y={420} text="1回10円" size={32} color={KRP.red} op={seg(f, 24, 38)} />
      </g>
    </svg>
    <LabelPill x={960} y={968} centerX text="駄菓子屋の店先で、1回10円" />
    <J2Badge />
    <Atmosphere f={f} />
  </AbsoluteFill>
);

// ===== 187. 電源コード→×スタンプ→コードが消える =====
const SceneNoDenki: React.FC<{ f: number }> = ({ f }) => {
  const xT = pop(seg(f, 46, 60));
  const cordOp = 1 - seg(f, 72, 100);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={269} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          {/* 壁のコンセント */}
          <rect x={1580} y={620} width={90} height={130} rx={12} fill={KRP.white} stroke={KRP.ink} strokeWidth={6}
            opacity={Math.max(cordOp, 0.35)} />
          <g opacity={Math.max(cordOp, 0.35)}>
            <rect x={1608} y={652} width={10} height={30} rx={3} fill={KRP.ink} />
            <rect x={1640} y={652} width={10} height={30} rx={3} fill={KRP.ink} />
          </g>
        </g>
        <g filter="url(#wobble)">
          <GachaMachine x={760} y={880} s={1.25} handleRot={Math.sin(f / 21) * 8} />
          {/* 電源コード+プラグ */}
          {cordOp > 0.01 && (
            <g opacity={cordOp}>
              <path d="M 900 800 Q 1120 880 1320 820 Q 1480 772 1540 712" fill="none"
                stroke={KRP.ink} strokeWidth={11} strokeLinecap="round" />
              <rect x={1526} y={686} width={54} height={44} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5}
                transform="rotate(-38 1553 708)" />
            </g>
          )}
          {/* 赤い大きな× */}
          {xT > 0.02 && (
            <g transform={`translate(1240 790) scale(${xT}) rotate(-7)`} opacity={0.92}>
              <line x1={-110} y1={-110} x2={110} y2={110} stroke={KRP.red} strokeWidth={34} strokeLinecap="round" />
              <line x1={110} y1={-110} x2={-110} y2={110} stroke={KRP.red} strokeWidth={34} strokeLinecap="round" />
            </g>
          )}
          {cordOp < 0.3 && (
            <g>
              <Sparkle x={1100} y={600} r={24} f={f} phase={1} />
              <TagPlate x={1240} y={520} text="電気いらず" size={40} color={KRP.red} op={seg(f, 96, 110)} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="いまも、ほとんど電気を使わない" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== ガチャの断面 (歯車が噛み合う)。x,y=接地中央 =====
const GachaCross: React.FC<{ x: number; y: number; s?: number; f: number; capCyc?: number }> = ({
  x, y, s = 1, f, capCyc = 0,
}) => {
  const rot = f * 1.8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 外枠 (断面なので輪郭だけ) */}
      <rect x={-110} y={-70} width={220} height={70} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-150} y={-330} width={300} height={264} rx={14} fill="#F3EBD7" stroke={KRP.ink} strokeWidth={8} />
      <path d="M -150 -330 L 150 -330 L 150 -352 A 150 136 0 0 0 -150 -352 Z"
        fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={7} />
      {[[-80, -396, KRP.red], [-6, -420, KRP.yellow], [66, -394, KRP.green], [-30, -362, KRP.orange], [66, -356, KRP.blue]].map(([ccx, ccy, col], i) => (
        <circle key={i} cx={ccx as number} cy={ccy as number} r={24} fill={col as string} stroke={KRP.ink} strokeWidth={4} />
      ))}
      <rect x={-158} y={-342} width={316} height={18} rx={8} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
      {/* ハンドルの軸 */}
      <g transform={`rotate(${rot * 2} -84 -240)`}>
        <circle cx={-84} cy={-240} r={34} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={-122} y={-250} width={76} height={20} rx={8} fill={KRP.silver} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <line x1={-84} y1={-240} x2={-20} y2={-212} stroke={KRP.ink} strokeWidth={8} opacity={0.75} />
      {/* 噛み合う歯車 (大→中→小) */}
      <GearIcon cx={-10} cy={-200} r={52} rot={rot} />
      <GearIcon cx={66} cy={-168} r={36} rot={-rot * (52 / 36) + 9} fill={KRP.brass} />
      <GearIcon cx={114} cy={-224} r={26} rot={rot * (52 / 26) + 5} fill={KRP.copper} />
      {/* カプセルの通り道 */}
      <path d="M 40 -330 L 40 -252" stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 10" opacity={0.5} />
      <path d="M -60 -150 L -96 -96" stroke={KRP.ink} strokeWidth={4} strokeDasharray="10 10" opacity={0.5} />
      {/* 落ちるカプセル */}
      {capCyc > 0.02 && (
        <g transform={`translate(${lerp(-40, -84, capCyc)} ${lerp(-180, -100, capCyc)}) rotate(${capCyc * 160})`}>
          <path d="M -19 0 A 19 19 0 0 1 19 0 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
          <path d="M 19 0 A 19 19 0 0 1 -19 0 Z" fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
      {/* 取り出し口 */}
      <path d="M -116 -120 L -60 -120 L -60 -84 L -116 -84 Z" fill={KRP.ink} opacity={0.85} />
    </g>
  );
};

// ===== 188. ガチャ断面: 歯車連動ループ =====
const SceneGachaGears: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 90;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={270} />
        <g filter="url(#wobbleSoft)">
          <circle cx={960} cy={470} r={480} fill={KRP.cream} opacity={0.65} />
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
        </g>
        <g filter="url(#wobble)">
          <GachaCross x={960} y={880} s={1.7} f={f} capCyc={easeOut(seg(cyc, 40, 76))} />
          <TagPlate x={1430} y={480} text="歯車だけ" size={34} op={seg(f, 30, 44)} />
          <path d="M 1310 500 Q 1220 520 1150 560" fill="none" stroke={KRP.ink} strokeWidth={5}
            strokeDasharray="12 12" opacity={0.6 * seg(f, 30, 44)} />
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="回す力と、歯車だけで" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 189. 二分割: ヘロンの壺⇔ガチャ断面 (縦糸回収) =====
const SceneShindenGacha: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 120;
  const coinT = seg(cyc, 4, 20);
  const pouring = cyc > 30 && cyc < 92;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={271} />
        <g filter="url(#wobbleSoft)">
          <rect x={60} y={150} width={840} height={790} rx={20} fill={KRP.cream} stroke={KRP.ink} strokeWidth={6} />
          <rect x={1020} y={150} width={840} height={790} rx={20} fill="#EAF0F4" stroke={KRP.ink} strokeWidth={6} />
          <line x1={960} y1={140} x2={960} y2={950} stroke={KRP.ink} strokeWidth={5} strokeDasharray="20 18" opacity={0.6} />
        </g>
        <g filter="url(#wobble)">
          {/* 左: 神殿の壺 (コインぽとん→水が出る) */}
          {coinT > 0.02 && coinT < 1 && (
            <Coin cx={470} cy={lerp(300, 470, easeOut(coinT))} r={24} fill={KRP.bronze} />
          )}
          <HolyPot x={470} y={880} s={1.05} f={f} pouring={pouring} />
          {/* 右: ガチャ断面 (歯車が同時に回る) */}
          <GachaCross x={1440} y={900} s={1.3} f={f} capCyc={easeOut(seg(cyc, 40, 76))} />
        </g>
      </svg>
      <LabelPill x={150} y={210} text="2000年前 神殿の壺" size={30} />
      <LabelPill x={1240} y={210} text="いま ガチャガチャ" size={30} />
      <LabelPill x={960} y={1000} centerX text="同じ「電気いらずの知恵」" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 190. 夜の国道+ネオン「オートレストラン」 =====
const SceneAutoRestoNeon: React.FC<{ f: number }> = ({ f }) => {
  const flick = f % 37 < 3 ? 0.3 : 0.85 + 0.15 * Math.sin(f / 3);
  const carX = -360 + ((f * 11) % 2500);
  return (
    <AbsoluteFill style={{ background: "#2B3047" }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={272} />
        <g filter="url(#wobbleSoft)">
          {[[220, 130], [520, 90], [1500, 120], [1740, 300], [900, 70]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={4} fill={KRP.white} opacity={0.5 + 0.4 * Math.sin(f / 9 + i)} />
          ))}
          {/* 店の建物 */}
          <rect x={200} y={420} width={880} height={420} fill="#20242F" stroke={KRP.ink} strokeWidth={6} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={260 + i * 210} y={560} width={130} height={170} rx={8}
              fill="#F5E6B8" opacity={0.5 + 0.12 * Math.sin(f / 11 + i)} />
          ))}
          {/* 国道 */}
          <rect x={0} y={840} width={W} height={240} fill="#3A3F52" />
          <g stroke={KRP.white} strokeWidth={9} opacity={0.8}>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={60 + i * 420} y1={952} x2={280 + i * 420} y2={952} />
            ))}
          </g>
        </g>
        <g filter="url(#wobble)">
          {/* 屋上のネオン看板 */}
          <rect x={250} y={270} width={780} height={130} rx={16} fill="#161A24" stroke={KRP.ink} strokeWidth={7} />
          <rect x={300} y={400} width={20} height={34} fill="#161A24" stroke={KRP.ink} strokeWidth={4} />
          <rect x={960} y={400} width={20} height={34} fill="#161A24" stroke={KRP.ink} strokeWidth={4} />
          <ellipse cx={640} cy={335} rx={400} ry={110} fill="#FF8FA0" opacity={0.14 * flick} />
          <text x={640} y={362} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72}
            fill="#FF9FB0" opacity={flick} letterSpacing={6}>
            オートレストラン
          </text>
          {/* 走る車 (ヘッドライト+テールランプ) */}
          <g transform={`translate(${carX} 0)`}>
            <polygon points="1282,900 1560,872 1560,928" fill="#FFF3C4" opacity={0.3} />
            <rect x={1340} y={856} width={190} height={58} rx={20} fill="#1A1E2A" stroke={KRP.ink} strokeWidth={5} />
            <rect x={1388} y={838} width={100} height={36} rx={12} fill="#1A1E2A" stroke={KRP.ink} strokeWidth={5} />
            <circle cx={1378} cy={916} r={20} fill={KRP.ink} stroke={KRP.gray} strokeWidth={5} />
            <circle cx={1496} cy={916} r={20} fill={KRP.ink} stroke={KRP.gray} strokeWidth={5} />
            <circle cx={1528} cy={880} r={8} fill="#FFE98F" />
            <circle cx={1346} cy={880} r={7} fill={KRP.red} opacity={0.9} />
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={980} centerX text="国道沿いに、伝説の店" />
      <J2Badge />
      <Atmosphere f={f} dark />
    </AbsoluteFill>
  );
};

// ===== 191. 店内: 自販機がズラリ、照明が順に点く =====
const SceneRestoInside: React.FC<{ f: number }> = ({ f }) => {
  const bodies = ["#C9573B", "#4A78B8", "#D9A23C", "#7FBF7A", "#8C6E54"];
  const lits = bodies.map((_, i) => seg(f, 12 + i * 15, 24 + i * 15));
  const avg = lits.reduce((a, b) => a + b, 0) / lits.length;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={273} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={0} width={W} height={820} fill="#E4D9BE" />
          <rect x={0} y={820} width={W} height={260} fill="#B8AA8C" />
          <line x1={0} y1={822} x2={W} y2={822} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
        </g>
        <g filter="url(#wobble)">
          {bodies.map((col, i) => {
            const mx = 150 + i * 340;
            const lit = lits[i];
            return (
              <g key={i}>
                {/* 天井の照明 */}
                <line x1={mx + 112} y1={0} x2={mx + 112} y2={96} stroke={KRP.ink} strokeWidth={5} />
                <rect x={mx + 52} y={96} width={120} height={26} rx={10}
                  fill={lit > 0.5 ? "#FFE98F" : KRP.gray} stroke={KRP.ink} strokeWidth={5} />
                {lit > 0.5 && (
                  <polygon points={`${mx + 52},122 ${mx + 172},122 ${mx + 232},820 ${mx - 8},820`}
                    fill="#FFF3C4" opacity={0.2 * lit} />
                )}
                <Jihanki x={mx} y={400} s={0.68} f={f} body={col} />
                {lit < 0.5 && <rect x={mx - 6} y={394} width={258} height={440} rx={12} fill="#2B3047" opacity={0.42} />}
              </g>
            );
          })}
        </g>
        {/* 全体の暗がり (点灯につれて明るく) */}
        <rect x={0} y={0} width={W} height={H} fill="#1E2230" opacity={0.4 * (1 - avg)} />
      </svg>
      <LabelPill x={960} y={968} centerX text="その名も、オートレストラン" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 192. うどん/そば/トースト/バーガー、ラベルが順にポン =====
const SceneMenruiLineup: React.FC<{ f: number }> = ({ f }) => {
  const items: Array<[string, string]> = [
    ["うどん", "#C9573B"], ["そば", "#8C6E54"], ["トースト", "#D9A23C"], ["バーガー", "#7FBF7A"],
  ];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={274} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={860} width={W} height={220} fill={KRP.floor} />
          <rect x={0} y={180} width={W} height={680} fill={KRP.cream} opacity={0.4} />
        </g>
        <g filter="url(#wobble)">
          {items.map(([name, col], i) => {
            const mx = 160 + i * 420;
            const t = pop(seg(f, 20 + i * 14, 34 + i * 14));
            return (
              <g key={i}>
                <Jihanki x={mx} y={400} s={0.72} f={f} body={col} />
                {t > 0.02 && (
                  <g transform={`translate(${mx + 130} 320) scale(${t}) translate(${-(mx + 130)} -320)`}>
                    <TagPlate x={mx + 130} y={320} text={name} size={40} />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="ぜんぶ、自販機" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== どんぶり (x,y=底の中央)。tilt=湯切りの傾き、water=お湯の量0..1 =====
const Donburi: React.FC<{ x: number; y: number; s?: number; tilt?: number; water?: number; noodle?: boolean }> = ({
  x, y, s = 1, tilt = 0, water = 0, noodle = true,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M -96 -92 L 96 -92 Q 88 -20 36 0 L -36 0 Q -88 -20 -96 -92 Z"
      fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
    <path d="M -96 -92 L 96 -92" stroke={KRP.red} strokeWidth={9} opacity={0.85} />
    {water > 0.02 && (
      <path d={`M ${-86 * water - 6} -84 Q 0 ${-84 - 10 * water} ${86 * water + 6} -84 Q ${60} ${-30} 0 ${-24} Q ${-60} ${-30} ${-86 * water - 6} -84 Z`}
        fill="#D8E6EE" opacity={0.9} />
    )}
    {noodle && (
      <g stroke="#E8D9A8" strokeWidth={7} strokeLinecap="round" fill="none">
        <path d="M -58 -84 Q -30 -98 0 -86 Q 30 -98 58 -84" />
        <path d="M -44 -76 Q 0 -90 44 -76" />
      </g>
    )}
  </g>
);

// ===== 193. うどん機の断面: どんぶり回転+お湯+湯切りループ (見せ場) =====
const SceneUdonKaiten: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 140;
  const spinA = seg(cyc, 0, 32);            // くるくる (位置決め)
  const pour = seg(cyc, 34, 44) - seg(cyc, 66, 76);   // お湯そそぎ
  const water = clamp01(seg(cyc, 36, 70) - seg(cyc, 78, 108)); // お湯の量
  const tilt = -42 * (easeOut(seg(cyc, 78, 94)) - easeOut(seg(cyc, 108, 124))); // 湯切りの傾き
  const spinFast = cyc >= 78 && cyc < 108;
  const rotArrow = f * (spinFast ? 14 : 5);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={275} />
        <g filter="url(#wobbleSoft)">
          <rect x={300} y={140} width={1320} height={800} rx={22} fill="#F3EBD7" stroke={KRP.ink} strokeWidth={7} />
          {/* お湯タンク */}
          <rect x={1200} y={210} width={300} height={170} rx={14} fill={KRP.silver} stroke={KRP.ink} strokeWidth={6.5} />
          <rect x={1216} y={226} width={268} height={70} rx={8} fill={KRP.blueSoft} opacity={0.8} />
          {/* タンク→注ぎ口のパイプ */}
          <path d="M 1240 380 L 1240 430 L 980 430 L 980 470" fill="none" stroke={KRP.ink} strokeWidth={16} />
          <path d="M 1240 380 L 1240 430 L 980 430 L 980 470" fill="none" stroke={KRP.silver} strokeWidth={9} />
          <rect x={956} y={462} width={48} height={34} rx={6} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          {/* 下の水受け (湯切りのお湯が落ちる) */}
          <path d="M 500 830 L 760 830 L 730 892 Q 630 906 530 892 Z" fill={KRP.silver} stroke={KRP.ink} strokeWidth={5.5} />
        </g>
        <g filter="url(#wobble)">
          {/* 回転する受け台 (クレードル) */}
          <g transform={`rotate(${tilt} 960 760)`}>
            <rect x={830} y={752} width={260} height={26} rx={10} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5.5} />
            <Donburi x={960} y={752} s={1.25} water={water} />
          </g>
          <circle cx={960} cy={765} r={15} fill={KRP.silver} stroke={KRP.ink} strokeWidth={5} />
          <rect x={944} y={780} width={32} height={140} fill={KRP.grayDark} stroke={KRP.ink} strokeWidth={5} />
          {/* くるくるの矢印 (回転を表す円弧) */}
          <g transform={`rotate(${rotArrow} 960 700)`} opacity={spinA > 0 || spinFast ? 0.85 : 0.35}>
            <path d="M 1140 700 A 180 90 0 0 1 960 790" fill="none" stroke={KRP.blueDeep} strokeWidth={10}
              strokeLinecap="round" strokeDasharray="6 20" />
            <polygon points="944,804 984,780 986,816" fill={KRP.blueDeep} />
            <path d="M 780 700 A 180 90 0 0 1 960 610" fill="none" stroke={KRP.blueDeep} strokeWidth={10}
              strokeLinecap="round" strokeDasharray="6 20" />
            <polygon points="976,596 936,620 934,584" fill={KRP.blueDeep} />
          </g>
          {/* お湯そそぎ */}
          {pour > 0.05 && (
            <g opacity={pour}>
              <path d="M 980 496 Q 978 580 966 648" fill="none" stroke="#AFC8DC" strokeWidth={16} strokeLinecap="round" />
              <circle cx={964} cy={500 + ((f * 9) % 140)} r={7} fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={2.5} />
            </g>
          )}
          {/* 湯切りで飛ぶお湯 */}
          {spinFast && (
            <g stroke="#AFC8DC" strokeWidth={8} strokeLinecap="round" opacity={0.85}>
              {[0, 1, 2].map((i) => {
                const dy = (f * 13 + i * 60) % 170;
                return <line key={i} x1={800 - i * 24} y1={700 + dy} x2={780 - i * 24} y2={740 + dy} />;
              })}
            </g>
          )}
          {water > 0.3 && <Steam x={930} y={610} s={0.9} f={f} phase={1} />}
          <TagPlate x={1350} y={430} text="お湯" size={30} />
          <TagPlate x={590} y={760} text="湯切り" size={30} color={KRP.blueDeep} />
        </g>
      </svg>
      <LabelPill x={960} y={1000} centerX text="どんぶりが、くるくる湯切り" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 194. 取出口から湯気の立つうどん+「30秒」カウント =====
const SceneUdon30s: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.max(0, 30 - Math.floor(f / 3));
  const done = n === 0;
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={276} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          {/* うどん自販機の正面 */}
          <rect x={560} y={160} width={620} height={720} rx={18} fill="#EFE3C8" stroke={KRP.ink} strokeWidth={8} />
          <rect x={560} y={160} width={620} height={96} rx={18} fill="#C9573B" stroke={KRP.ink} strokeWidth={8} />
          <text x={870} y={228} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={KRP.white}>
            うどん
          </text>
          <rect x={620} y={300} width={200} height={60} rx={10} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={900} cy={330} r={22} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1000} y={306} width={16} height={48} rx={5} fill={KRP.ink} />
        </g>
        <g filter="url(#wobble)">
          {/* 取出口 */}
          <rect x={660} y={560} width={420} height={250} rx={14} fill={KRP.ink} />
          <rect x={676} y={576} width={388} height={218} rx={10} fill="#6E573F" />
          <Donburi x={870} y={780} s={1.05} water={0.5} />
          <Steam x={820} y={660} s={1.2} f={f} phase={0} color={KRP.white} />
          <Steam x={920} y={650} s={1.4} f={f} phase={2} color={KRP.white} />
          {/* 30秒タイマー */}
          <circle cx={1430} cy={400} r={120} fill={KRP.white} stroke={done ? KRP.green : KRP.ink} strokeWidth={9} />
          {done && <circle cx={1430} cy={400} r={140} fill={KRP.green} opacity={0.2 + 0.1 * Math.sin(f / 4)} />}
          <text x={1430} y={430} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96}
            fill={done ? KRP.green : KRP.red}>{n}</text>
          <text x={1430} y={492} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={KRP.ink}>
            秒
          </text>
          {done && (
            <g>
              <Sparkle x={1310} y={280} r={26} f={f} phase={0} />
              <Sparkle x={1560} y={320} r={22} f={f} phase={2} />
            </g>
          )}
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="30秒足らずで、熱々の1杯" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 195. 深夜、truckerがうどんをすする (肩が上下) =====
const SceneTruckerUdon: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "#2E3A52" }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={277} />
      <g filter="url(#wobbleSoft)">
        <NightSky f={f} />
        <rect x={0} y={860} width={W} height={220} fill="#3A3F52" />
        {/* 奥に停めたトラックの影 */}
        <g opacity={0.85}>
          <rect x={1420} y={620} width={420} height={210} rx={14} fill="#20242F" stroke={KRP.ink} strokeWidth={5} />
          <rect x={1330} y={690} width={120} height={140} rx={10} fill="#272C3A" stroke={KRP.ink} strokeWidth={5} />
          <circle cx={1420} cy={850} r={32} fill={KRP.ink} stroke={KRP.gray} strokeWidth={5} />
          <circle cx={1700} cy={850} r={32} fill={KRP.ink} stroke={KRP.gray} strokeWidth={5} />
        </g>
        {/* うどん自販機 (あかり) */}
        <ellipse cx={330} cy={760} rx={330} ry={60} fill="#F5E6B8" opacity={0.14} />
        <rect x={180} y={280} width={320} height={560} rx={14} fill="#EFE3C8" stroke={KRP.ink} strokeWidth={7} />
        <rect x={180} y={280} width={320} height={70} rx={14} fill="#C9573B" stroke={KRP.ink} strokeWidth={7} />
        <text x={340} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={KRP.white}>
          うどん
        </text>
        <rect x={230} y={560} width={220} height={160} rx={10} fill="#FFF3C4" opacity={0.8} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <g filter="url(#wobble)">
        {/* 立ち食いの台 */}
        <rect x={880} y={742} width={520} height={26} rx={8} fill="#8C6E54" stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={930} y={768} width={24} height={132} fill="#5C4A3A" stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={1320} y={768} width={24} height={132} fill="#5C4A3A" stroke={KRP.ink} strokeWidth={4.5} />
        <Donburi x={1180} y={742} s={1} water={0.4} />
        <Steam x={1140} y={650} s={1} f={f} phase={0} color={KRP.white} />
        <Steam x={1220} y={644} s={0.8} f={f} phase={2} color={KRP.white} />
        {/* トラック運転手 (すすり中。右腕は箸へ別描き) */}
        <Hito x={960} y={900} s={1.2} role="trucker" f={f} phase={0} face="closed" hideArm="right" slurp />
        <Arm x1={1030} y1={760} x2={1092} y2={648} cloth="#8A9A74" s={1.2} />
        {/* 箸 */}
        <line x1={1092} y1={648} x2={1140} y2={700} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1100} y1={640} x2={1152} y2={688} stroke={KRP.ink} strokeWidth={6} />
        {/* すすっている麺 (口→どんぶり、ずぞぞと波打つ) */}
        <g stroke="#E8D9A8" strokeWidth={7} strokeLinecap="round" fill="none">
          {[0, 1].map((i) => (
            <path key={i}
              d={`M ${986 + i * 14} ${672 + Math.sin(f / 2 + i) * 3} Q ${1060 + i * 10} ${700 + Math.sin(f / 2.5) * 6} ${1130 + i * 12} ${690 + Math.sin(f / 2 + i * 2) * 4} T ${1176 + i * 10} 700`} />
          ))}
        </g>
      </g>
    </svg>
    <LabelPill x={960} y={980} centerX text="24時間、無人営業のオアシス" />
    <J2Badge />
    <Atmosphere f={f} dark />
  </AbsoluteFill>
);

// ===== 196. 「12,000台」カウントアップ =====
const Scene12000Count: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.floor(easeOut(seg(f, 8, 70)) * 12000);
  const don = 1 + 0.1 * pop(seg(f, 68, 80)) - 0.1 * seg(f, 80, 92);
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={278} />
        <g filter="url(#wobbleSoft)" opacity={0.3}>
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 7 }, (_, c) => (
              <g key={`${r}${c}`} transform={`translate(${150 + c * 272} ${120 + r * 250})`}>
                <rect x={-24} y={-32} width={48} height={64} rx={6} fill="#EFE3C8" stroke={KRP.ink} strokeWidth={4} />
                <path d="M -14 10 A 14 14 0 0 0 14 10 Z" fill={KRP.red} stroke={KRP.ink} strokeWidth={3} />
                <rect x={-16} y={-26} width={32} height={10} rx={3} fill={KRP.red} opacity={0.85} />
              </g>
            )),
          )}
        </g>
        <g filter="url(#wobble)">
          <g transform={`translate(960 540) scale(${don}) translate(-960 -540)`}>
            <rect x={480} y={330} width={960} height={380} rx={24} fill={KRP.white} stroke={KRP.ink} strokeWidth={9} />
            <text x={960} y={580} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={160} fill={KRP.red}>
              {n.toLocaleString("en-US")}
              <tspan fontSize={76} fill={KRP.ink}>{" 台以上"}</tspan>
            </text>
          </g>
        </g>
      </svg>
      <LabelPill x={960} y={230} centerX text="めん類の自販機、多いときには" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 197. 地図のアイコンが消えていき、残り60台が点滅 =====
const SceneNokori60: React.FC<{ f: number }> = ({ f }) => {
  const spots: Array<[number, number]> = [
    [141.35, 43.06], [140.7, 41.8], [140.87, 38.27], [140.1, 37.4], [139.8, 36.6],
    [139.7, 35.68], [139.0, 36.3], [138.2, 36.65], [137.2, 36.7], [136.6, 35.4],
    [136.9, 35.17], [135.8, 34.9], [135.5, 34.69], [134.7, 35.0], [133.9, 34.6],
    [132.46, 34.4], [131.5, 34.2], [130.4, 33.59], [130.7, 32.8], [131.4, 31.9],
    [133.5, 33.55], [134.2, 34.1], [139.1, 35.3], [140.3, 35.6], [138.9, 37.9],
    [140.0, 39.7], [141.1, 39.7], [136.2, 35.0], [132.8, 35.4], [138.4, 34.95],
  ];
  const survivors = [5, 10, 13, 23, 27];
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={279} />
        <g filter="url(#wobbleSoft)">
          <JapanMapCard>
            {spots.map(([lon, lat], i) => {
              const [x, y] = jmapXY(lon, lat);
              const alive = survivors.includes(i);
              const d0 = 18 + ((i * 7.3) % 58);
              const die = alive ? 0 : seg(f, d0, d0 + 14);
              const op = alive
                ? (f > 84 ? 0.45 + 0.55 * Math.abs(Math.sin((f + i * 7) / 9)) : 1)
                : 1 - die;
              if (op <= 0.01) return null;
              return (
                <g key={i} opacity={op} transform={`translate(${x} ${y}) scale(${1 - die * 0.4})`}>
                  <rect x={-15} y={-20} width={30} height={40} rx={4}
                    fill={alive ? "#C9573B" : KRP.grayDark} stroke={KRP.ink} strokeWidth={3} />
                  <rect x={-9} y={-13} width={18} height={15} rx={2} fill={alive ? "#FFF3C4" : KRP.gray} />
                </g>
              );
            })}
            {/* 台数カード */}
            <rect x={1240} y={740} width={420} height={150} rx={16} fill={KRP.white} stroke={KRP.ink} strokeWidth={6.5} />
            <text x={1450} y={818} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={KRP.red}>
              {`約${Math.round(lerp(12000, 60, easeOut(seg(f, 10, 80)))).toLocaleString("en-US")}台`}
            </text>
            <text x={1450} y={866} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={KRP.ink}>
              いまの現役
            </text>
          </JapanMapCard>
        </g>
      </svg>
      <LabelPill x={960} y={980} centerX text="現役は、わずか60台ほど" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ===== 198. 現代の家族がレトロ自販機に行列 (スマホでパシャ) =====
const SceneRetroSeichi: React.FC<{ f: number }> = ({ f }) => {
  const cyc = f % 90;
  const flash = pop(seg(cyc, 58, 66)) * (1 - seg(cyc, 66, 82));
  return (
    <AbsoluteFill style={{ background: KRP.paper }}>
      <svg width={W} height={H} style={abs}>
        <WobbleDefs seed={280} />
        <g filter="url(#wobbleSoft)">
          <rect x={0} y={880} width={W} height={200} fill={KRP.floor} />
          <rect x={0} y={160} width={W} height={720} fill={KRP.cream} opacity={0.35} />
        </g>
        <g filter="url(#wobble)">
          {/* レトロなうどん自販機 (年季のある風合い) */}
          <rect x={260} y={300} width={400} height={580} rx={16} fill="#EFE3C8" stroke={KRP.ink} strokeWidth={8} />
          <rect x={260} y={300} width={400} height={84} rx={16} fill="#C9573B" stroke={KRP.ink} strokeWidth={8} />
          <text x={460} y={360} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={KRP.white}>
            うどん
          </text>
          <rect x={310} y={440} width={180} height={56} rx={9} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <circle cx={560} cy={468} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
          <rect x={320} y={560} width={280} height={180} rx={12} fill="#6E573F" stroke={KRP.ink} strokeWidth={6} />
          {/* 年季 (さび・つぎあて) */}
          <rect x={282} y={790} width={70} height={40} rx={8} fill={KRP.bronze} opacity={0.4} />
          <rect x={590} y={400} width={46} height={30} rx={6} fill={KRP.bronze} opacity={0.35} />
          {/* 現代の家族の行列 */}
          <Hito x={1000} y={892} s={1.08} role="papa" f={f} phase={0} face="smile" gaze={[-7, -2]} hideArm="left" />
          <Arm x1={950} y1={760} x2={880} y2={620} cloth="#A8BCCB" s={1.08} />
          {/* スマホ */}
          <g transform="translate(862 596) rotate(-14)">
            <rect x={-20} y={-36} width={40} height={72} rx={9} fill={KRP.ink} stroke={KRP.ink} strokeWidth={3} />
            <rect x={-14} y={-28} width={28} height={50} rx={4} fill={KRP.blueSoft} />
          </g>
          {/* フラッシュ */}
          {flash > 0.02 && (
            <g opacity={flash}>
              <circle cx={850} cy={580} r={60 + flash * 40} fill={KRP.white} />
              <path d={star4(850, 580, 110 * flash)} fill="#FFF2B8" stroke={KRP.ink} strokeWidth={3} />
            </g>
          )}
          <Hito x={1240} y={892} s={1.1} role="mama" f={f} phase={2} face="smile" gaze={[-6, -2]} />
          <Hito x={1430} y={892} s={0.98} role="girl" f={f} phase={3} face="smile" gaze={[-7, -2]} />
          <Hito x={1600} y={892} s={0.96} role="boy" f={f} phase={4} face="surprised" gaze={[-7, -2]} />
        </g>
      </svg>
      <LabelPill x={960} y={968} centerX text="週末に行列ができる、レトロの聖地" />
      <J2Badge />
      <Atmosphere f={f} />
    </AbsoluteFill>
  );
};

// ============================================================
// 出口: モチーフ名→シーン
// ============================================================
export const j2Ch9to10Scene = (motif: string, f: number): React.ReactElement | null => {
  switch (motif) {
    // 第9章 (168〜180)
    case "j2_ch9_door": return <SceneCh9Door f={f} />;
    case "j2_japan_idea": return <SceneJapanIdea f={f} />;
    case "j2_sa_coffee": return <SceneSaCoffee f={f} />;
    case "j2_pokka_kuyashii": return <ScenePokkaKuyashii f={f} />;
    case "j2_hot_dream": return <SceneHotDream f={f} />;
    case "j2_hot_jihanki": return <SceneHotJihanki f={f} />;
    case "j2_can_coffee_born": return <SceneCanCoffeeBorn f={f} />;
    case "j2_unmei_deai": return <SceneUnmeiDeai f={f} />;
    case "j2_hot_cold_both": return <SceneHotColdBoth f={f} />;
    case "j2_japan_umare": return <SceneJapanUmare f={f} />;
    case "j2_naka_shikiri": return <SceneNakaShikiri f={f} />;
    case "j2_netsu_recycle": return <SceneNetsuRecycle f={f} />;
    case "j2_fuyu_no_ocha": return <SceneFuyuNoOcha f={f} />;
    // 第10章 (181〜198)
    case "j2_ch10_door": return <SceneCh10Door f={f} />;
    case "j2_shinseki_tree": return <SceneShinsekiTree f={f} />;
    case "j2_eki_machines": return <SceneEkiMachines f={f} />;
    case "j2_gacha_arrival": return <SceneGachaArrival f={f} />;
    case "j2_gacha_front": return <SceneGachaFront f={f} />;
    case "j2_dagashiya": return <SceneDagashiya f={f} />;
    case "j2_no_denki": return <SceneNoDenki f={f} />;
    case "j2_gacha_gears": return <SceneGachaGears f={f} />;
    case "j2_shinden_gacha": return <SceneShindenGacha f={f} />;
    case "j2_auto_resto_neon": return <SceneAutoRestoNeon f={f} />;
    case "j2_resto_inside": return <SceneRestoInside f={f} />;
    case "j2_menrui_lineup": return <SceneMenruiLineup f={f} />;
    case "j2_udon_kaiten": return <SceneUdonKaiten f={f} />;
    case "j2_udon_30s": return <SceneUdon30s f={f} />;
    case "j2_trucker_udon": return <SceneTruckerUdon f={f} />;
    case "j2_12000_count": return <Scene12000Count f={f} />;
    case "j2_nokori_60": return <SceneNokori60 f={f} />;
    case "j2_retro_seichi": return <SceneRetroSeichi f={f} />;
    default: return null;
  }
};

// シーン168〜198 (台本順) のモチーフ一覧
export const J2_CH9TO10_MOTIFS: string[] = [
  "j2_ch9_door", "j2_japan_idea", "j2_sa_coffee", "j2_pokka_kuyashii", "j2_hot_dream",
  "j2_hot_jihanki", "j2_can_coffee_born", "j2_unmei_deai", "j2_hot_cold_both", "j2_japan_umare",
  "j2_naka_shikiri", "j2_netsu_recycle", "j2_fuyu_no_ocha", "j2_ch10_door", "j2_shinseki_tree",
  "j2_eki_machines", "j2_gacha_arrival", "j2_gacha_front", "j2_dagashiya", "j2_no_denki",
  "j2_gacha_gears", "j2_shinden_gacha", "j2_auto_resto_neon", "j2_resto_inside", "j2_menrui_lineup",
  "j2_udon_kaiten", "j2_udon_30s", "j2_trucker_udon", "j2_12000_count", "j2_nokori_60",
  "j2_retro_seichi",
];
