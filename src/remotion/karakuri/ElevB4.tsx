// 「エレベーターの歴史」第4ブロック (台本 #61〜#92 / 全32文)
// 天秤のしくみ → 1857年NY → 電気 → 摩天楼 → ペントハウス反転 → 空が不動産に。
//
// 描き方の憲法 (序章B0で合格した型をそのまま踏襲する):
//  ① 寄る        … 主役は画面の高さ1080の半分より大きく。引きの絵は章に1〜2枚だけ。
//  ② 世界を置く  … 図だけを紙に浮かせない。必ず空・地面・壁・街を描いて「どこの話か」を出す。
//  ③ 共通部品    … 3回以上出る物は1つだけ本気で作って使い回す (OldNYStreet / Lobby / ElevShaft …)。
//  ④ カメラを動かす … 1枚の中で寄る・上下にスクロールする・横に流す。
//  ⑤ 1枚に1つ事件 … ラベルを貼るのではなく、動く・ひっくり返る・増える・落ちる・開くで見せる。
//  ⑥ 人が反応する … 機構図にも人を入れて、驚く・踏ん張る・青ざめる・喜ぶ。
//
// 画面の禁止帯:
//  - バッジ  x<520 / y<110
//  - 字幕板  y=160〜230 かつ x=500〜1420
//  - y≧860 は本番の字幕黒帯で隠れる (大事なラベル・図はここに入れない)
//
// ElevShaft / elevShaftGeom は第10章の伏線回収で再登場するので export 固定。
// WobbleDefs の seed は 1200〜1299 を使う。

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  KRP, LabelPill, Stamp, WobbleDefs, Atmosphere, Person,
  seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, abs, EBadge } from "./ElevShared";

// ===== この章だけの色 (3色まで) =====
const SOOT = "#C8BBA4";   // 煤けた19世紀NYの空
const STONE = "#DCD0BC";  // 石灰岩のファサード
const DUSK = "#E9B48E";   // 1920年代の夕景

// ===== 補助関数 =====
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => { const u = clamp01(t); return u * u * (3 - 2 * u); };
const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};
// カメラ: (cx,cy) を中心に z 倍に寄る
const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;
// Person の体ゆれと同じ揺れ (持ち物を手に合わせるとき用)
const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

// ===== 画面の土台 =====
const Frame: React.FC<{
  f: number; seed: number; caption?: string; dark?: boolean; bg?: string;
  over?: React.ReactNode; children?: React.ReactNode;
}> = ({ f, seed, caption, dark, bg, over, children }) => (
  <AbsoluteFill style={{ background: bg ?? KRP.cream }}>
    <svg width={W} height={H} style={abs}>
      <WobbleDefs seed={seed} />
      <g filter="url(#wobble)">{children}</g>
    </svg>
    {over}
    {caption && <LabelPill x={960} y={170} centerX text={caption} />}
    <EBadge />
    <Atmosphere f={f} dark={dark} />
  </AbsoluteFill>
);

// ===== 小物キット =====

// 文字札 (SVGの中に置ける吹き出しプレート)
const TagPlate: React.FC<{
  x: number; y: number; text: string; size?: number; t?: number;
  fill?: string; color?: string; rot?: number;
}> = ({ x, y, text, size = 36, t = 1, fill = KRP.white, color = KRP.ink, rot = 0 }) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  const w = text.length * size + 40;
  const h = size + 26;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(tt)})`} opacity={tt}>
      <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h} rx={9} fill="rgba(59,51,44,0.22)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={9} fill={fill} stroke={KRP.ink} strokeWidth={3.5} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT}
        fontSize={size} fontWeight={900} fill={color}>{text}</text>
    </g>
  );
};

// 引き出し線つきの注記
const SLabel: React.FC<{
  x: number; y: number; tx: number; ty: number; text: string;
  t?: number; size?: number; color?: string;
}> = ({ x, y, tx, ty, text, t = 1, size = 30, color = KRP.ink }) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  const mx = lerp(x, tx, tt), my = lerp(y, ty, tt);
  return (
    <g opacity={tt}>
      <line x1={x} y1={y} x2={mx} y2={my} stroke={color} strokeWidth={3.5} strokeDasharray="8 6" />
      <circle cx={x} cy={y} r={7} fill={color} />
      {tt > 0.7 && (
        <TagPlate x={tx} y={ty} text={text} size={size} t={(tt - 0.7) / 0.3} color={color} />
      )}
    </g>
  );
};

// 伸びる矢印
const GrowArrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number; t?: number; color?: string; wdt?: number;
}> = ({ x1, y1, x2, y2, t = 1, color = KRP.orange, wdt = 8 }) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  const ex = lerp(x1, x2, tt), ey = lerp(y1, y2, tt);
  const a = Math.atan2(ey - y1, ex - x1);
  const hl = wdt * 2.6;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={wdt} strokeLinecap="round" />
      <polygon
        points={`${ex},${ey} ${ex - hl * Math.cos(a - 0.42)},${ey - hl * Math.sin(a - 0.42)} ${ex - hl * Math.cos(a + 0.42)},${ey - hl * Math.sin(a + 0.42)}`}
        fill={color}
      />
    </g>
  );
};

// 上下の動きを示す矢印 (dir: -1=上 / +1=下)
const VArrow: React.FC<{ x: number; y: number; dir: number; t?: number; len?: number; color?: string }> =
  ({ x, y, dir, t = 1, len = 120, color = KRP.orange }) => (
    <GrowArrow x1={x} y1={y} x2={x} y2={y + dir * len} t={t} color={color} wdt={9} />
  );

// 放射線 (驚き・強調)
const Rays: React.FC<{ x: number; y: number; r: number; t?: number; n?: number; color?: string }> =
  ({ x, y, r, t = 1, n = 12, color = KRP.orange }) => {
    const tt = clamp01(t);
    if (tt <= 0.001) return null;
    return (
      <g opacity={tt * 0.9}>
        {Array.from({ length: n }).map((_, i) => {
          const a = (i / n) * Math.PI * 2 + 0.2;
          const r0 = r * (0.55 + 0.1 * (i % 2)) * (0.7 + 0.3 * tt);
          const r1 = r * (1 + 0.12 * (i % 3)) * (0.7 + 0.5 * tt);
          return (
            <line key={i}
              x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0}
              x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1}
              stroke={color} strokeWidth={6} strokeLinecap="round" />
          );
        })}
      </g>
    );
  };

const Sparkle: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string }> =
  ({ x, y, s = 1, t = 1, color = KRP.yellow }) => {
    const tt = clamp01(t);
    if (tt <= 0.001) return null;
    const r = 26 * s * pop(tt);
    return (
      <g opacity={tt}>
        <path d={`M${x} ${y - r} L${x + r * 0.26} ${y - r * 0.26} L${x + r} ${y} L${x + r * 0.26} ${y + r * 0.26} L${x} ${y + r} L${x - r * 0.26} ${y + r * 0.26} L${x - r} ${y} L${x - r * 0.26} ${y - r * 0.26} Z`}
          fill={color} stroke={KRP.ink} strokeWidth={2.5} />
      </g>
    );
  };

const CrossMark: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 70, t = 1 }) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  const k = pop(tt) * r;
  return (
    <g opacity={tt} strokeLinecap="round">
      <line x1={x - k} y1={y - k} x2={x + k} y2={y + k} stroke={KRP.red} strokeWidth={16} />
      <line x1={x + k} y1={y - k} x2={x - k} y2={y + k} stroke={KRP.red} strokeWidth={16} />
    </g>
  );
};

const CheckMark: React.FC<{ x: number; y: number; r?: number; t?: number; color?: string }> =
  ({ x, y, r = 60, t = 1, color = KRP.green }) => {
    const tt = clamp01(t);
    if (tt <= 0.001) return null;
    const p1 = easeOut(clamp01(tt / 0.45)), p2 = easeOut(clamp01((tt - 0.4) / 0.6));
    return (
      <g strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={color} strokeWidth={16}>
        <line x1={x - r} y1={y} x2={x - r + r * 0.62 * p1} y2={y + r * 0.62 * p1} />
        {p2 > 0 && (
          <line x1={x - r * 0.38} y1={y + r * 0.62}
            x2={x - r * 0.38 + r * 1.3 * p2} y2={y + r * 0.62 - r * 1.5 * p2} />
        )}
      </g>
    );
  };

const QMark: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string }> =
  ({ x, y, s = 1, t = 1, color = KRP.orange }) => {
    const tt = clamp01(t);
    if (tt <= 0.001) return null;
    return (
      <g opacity={tt} transform={`translate(${x} ${y}) scale(${pop(tt) * s})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={110} fontWeight={900}
          fill={color} stroke={KRP.ink} strokeWidth={3}>?</text>
      </g>
    );
  };

// 蒸気のもくもく
const SteamPuffs: React.FC<{
  x: number; y: number; f: number; n?: number; s?: number; t?: number; rise?: number; color?: string;
}> = ({ x, y, f, n = 6, s = 1, t = 1, rise = 260, color = "#E8E2D4" }) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  return (
    <g opacity={tt}>
      {Array.from({ length: n }).map((_, i) => {
        const p = ((f / 46) + i / n) % 1;
        const yy = y - p * rise;
        const rr = (22 + p * 52) * s;
        const op = (1 - p) * 0.85;
        const dx = Math.sin(p * 5 + i) * 26 * s;
        return (
          <g key={i} opacity={op}>
            <circle cx={x + dx} cy={yy} r={rr} fill={color} stroke={KRP.ink} strokeWidth={2.5} />
            <circle cx={x + dx + rr * 0.6} cy={yy + rr * 0.2} r={rr * 0.66} fill={color} stroke={KRP.ink} strokeWidth={2.5} />
          </g>
        );
      })}
    </g>
  );
};

// 砂ぼこり (物が落ちた・外れた時)
const DustPuff: React.FC<{ x: number; y: number; t?: number; s?: number }> = ({ x, y, t = 1, s = 1 }) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  const sp = easeOut(tt);
  return (
    <g opacity={(1 - tt) * 0.9}>
      {[-1, -0.45, 0.4, 1].map((d, i) => (
        <circle key={i}
          cx={x + d * 110 * sp * s} cy={y - (16 + i * 10) * sp * s}
          r={(26 + i * 7) * (0.5 + sp) * s}
          fill="#D8CDB8" stroke={KRP.ink} strokeWidth={2.5} />
      ))}
    </g>
  );
};

// リベット・ボルト
const Bolt2: React.FC<{ x: number; y: number; r?: number; color?: string }> =
  ({ x, y, r = 6, color = KRP.silver }) => (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} stroke={KRP.ink} strokeWidth={2} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.3} fill={KRP.white} opacity={0.6} />
    </g>
  );

// スポットライト
const Spotlight: React.FC<{ x: number; y: number; rx: number; ry: number; t?: number }> =
  ({ x, y, rx, ry, t = 1 }) => {
    const tt = clamp01(t);
    if (tt <= 0.001) return null;
    return (
      <g opacity={tt * 0.5}>
        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={KRP.yellow} opacity={0.3} />
        <ellipse cx={x} cy={y} rx={rx * 0.66} ry={ry * 0.66} fill={KRP.yellow} opacity={0.3} />
      </g>
    );
  };

// レンガ壁 (昇降路・ビル内部の下地。目地まで引く)
const BrickWall: React.FC<{
  x: number; y: number; w: number; h: number; bw?: number; bh?: number; fill?: string; line?: string;
}> = ({ x, y, w, h, bw = 56, bh = 26, fill = "#B9937A", line = "#9A7861" }) => {
  const rows = Math.ceil(h / bh);
  const cols = Math.ceil(w / bw) + 1;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      <g stroke={line} strokeWidth={2} opacity={0.75}>
        {Array.from({ length: rows }).map((_, r) => {
          const yy = y + r * bh;
          const off = (r % 2) * (bw / 2);
          return (
            <g key={r}>
              <line x1={x} y1={yy} x2={x + w} y2={yy} />
              {Array.from({ length: cols }).map((_, c) => {
                const xx = x + off + c * bw;
                if (xx <= x || xx >= x + w) return null;
                return <line key={c} x1={xx} y1={yy} x2={xx} y2={Math.min(yy + bh, y + h)} />;
              })}
            </g>
          );
        })}
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

// ===== 共通の世界: 19世紀末〜20世紀初頭のニューヨーク =====

const SkyNY: React.FC<{ dusk?: boolean; night?: boolean }> = ({ dusk, night }) => {
  const top = night ? "#33405C" : dusk ? DUSK : SOOT;
  const bot = night ? "#4B5B7C" : dusk ? "#F2D4B4" : "#DCD3C0";
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={bot} />
      <rect x={0} y={0} width={W} height={700} fill={top} />
      <rect x={0} y={560} width={W} height={200} fill={bot} opacity={0.5} />
      {!night && (
        <g opacity={0.28} fill="#FFFFFF">
          <ellipse cx={420} cy={300} rx={210} ry={54} />
          <ellipse cx={1430} cy={250} rx={250} ry={46} />
        </g>
      )}
      {night && (
        <g fill="#FFF6D8">
          {[[180, 120], [340, 220], [700, 90], [1180, 160], [1500, 100], [1740, 260], [980, 230]].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={i % 2 ? 3 : 4} opacity={0.85} />
          ))}
        </g>
      )}
    </g>
  );
};

// 遠景のビル影
const FarSkyline: React.FC<{ y: number; color?: string; seedShift?: number }> =
  ({ y, color = "#A99A85", seedShift = 0 }) => {
    const bars: number[][] = [];
    for (let i = 0; i < 26; i++) {
      const bx = -40 + i * 78;
      const hh = 70 + ((i * 37 + seedShift * 13) % 11) * 26;
      const bw = 56 + ((i * 17 + seedShift * 7) % 5) * 11;
      bars.push([bx, hh, bw]);
    }
    return (
      <g opacity={0.75}>
        {bars.map(([bx, hh, bw], i) => (
          <g key={i}>
            <rect x={bx} y={y - hh} width={bw} height={hh} fill={color} stroke={KRP.ink} strokeWidth={2} />
            {Array.from({ length: Math.floor(hh / 28) }).map((_, r) => (
              <rect key={r} x={bx + 8} y={y - hh + 12 + r * 28} width={bw - 16} height={12}
                fill="#F3E6C8" opacity={(i * 7 + r * 3) % 4 === 0 ? 0.75 : 0.25} />
            ))}
          </g>
        ))}
      </g>
    );
  };

// 非常階段 (NYの石造ビルの顔)
const FireEscape: React.FC<{ x: number; y: number; w: number; floors: number; fh: number }> =
  ({ x, y, w, floors, fh }) => (
    <g stroke={KRP.ink} strokeWidth={3} fill="none">
      {Array.from({ length: floors }).map((_, i) => {
        const yy = y + i * fh;
        return (
          <g key={i}>
            <rect x={x} y={yy} width={w} height={9} fill="#6E6A5E" />
            {Array.from({ length: Math.floor(w / 16) }).map((_, c) => (
              <line key={c} x1={x + 8 + c * 16} y1={yy - 34} x2={x + 8 + c * 16} y2={yy} strokeWidth={2} opacity={0.8} />
            ))}
            <line x1={x} y1={yy - 34} x2={x + w} y2={yy - 34} strokeWidth={3} />
            <line x1={x + w * 0.1} y1={yy} x2={x + w * 0.78} y2={yy + fh - 36} strokeWidth={3} />
          </g>
        );
      })}
      <line x1={x} y1={y - 34} x2={x} y2={y + floors * fh} strokeWidth={4} />
      <line x1={x + w} y1={y - 34} x2={x + w} y2={y + floors * fh} strokeWidth={4} />
    </g>
  );

// 石造ビル (街の背景用)
const StoneBuilding: React.FC<{
  x: number; y: number; w: number; floors: number; fh?: number;
  fill?: string; lit?: number; escape?: boolean; f?: number;
}> = ({ x, y, w, floors, fh = 96, fill = STONE, lit = 0, escape = false, f = 0 }) => {
  const top = y - floors * fh;
  const cols = Math.max(2, Math.round(w / 92));
  const gap = w / cols;
  return (
    <g>
      <rect x={x} y={top} width={w} height={floors * fh} fill={fill} stroke={KRP.ink} strokeWidth={4} />
      <rect x={x - 12} y={top - 24} width={w + 24} height={26} fill="#C4B69C" stroke={KRP.ink} strokeWidth={4} />
      <rect x={x - 4} y={top - 40} width={w + 8} height={18} fill="#CFC1A6" stroke={KRP.ink} strokeWidth={3} />
      {Array.from({ length: floors }).map((_, i) => {
        const fy = top + i * fh;
        return (
          <g key={i}>
            <line x1={x} y1={fy} x2={x + w} y2={fy} stroke="#B3A68D" strokeWidth={3} />
            {Array.from({ length: cols }).map((_, c) => {
              const wx = x + gap * c + gap * 0.5 - 26;
              const isLit = lit > 0 && ((i * 5 + c * 3 + Math.floor(f / 70)) % 7) < lit * 7;
              return (
                <g key={c}>
                  <rect x={wx} y={fy + 22} width={52} height={54} rx={4}
                    fill={isLit ? "#FFE9A8" : "#6E7A86"} stroke={KRP.ink} strokeWidth={3} />
                  <line x1={wx + 26} y1={fy + 22} x2={wx + 26} y2={fy + 76} stroke={KRP.ink} strokeWidth={2} />
                  <rect x={wx - 7} y={fy + 12} width={66} height={11} fill="#B3A68D" stroke={KRP.ink} strokeWidth={2.5} />
                </g>
              );
            })}
          </g>
        );
      })}
      {escape && <FireEscape x={x + w * 0.56} y={top + fh + 52} w={88} floors={Math.max(1, floors - 1)} fh={fh} />}
      <rect x={x + 10} y={y - 86} width={w - 20} height={86} fill="#7E6B55" stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={x + 26} y={y - 72} width={w * 0.42} height={58} fill="#F0E2BE" stroke={KRP.ink} strokeWidth={3} />
      <rect x={x + w - 86} y={y - 76} width={56} height={76} fill="#5E4E3E" stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

// ガス灯
const GasLamp: React.FC<{ x: number; y: number; s?: number; on?: boolean }> = ({ x, y, s = 1, on = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-9} y={-250} width={18} height={250} fill="#4C4A44" stroke={KRP.ink} strokeWidth={3} />
    <ellipse cx={0} cy={0} rx={28} ry={10} fill="#4C4A44" stroke={KRP.ink} strokeWidth={3} />
    {on && <circle cx={0} cy={-274} r={56} fill={KRP.yellow} opacity={0.22} />}
    <path d="M-28 -250 L28 -250 L20 -300 L-20 -300 Z" fill={on ? "#FFE9A8" : "#9AA3A8"} stroke={KRP.ink} strokeWidth={3.5} />
    <path d="M-24 -300 L24 -300 L0 -330 Z" fill="#4C4A44" stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// 馬車
const HorseCarriage: React.FC<{ x: number; y: number; s?: number; f?: number }> =
  ({ x, y, s = 1, f = 0 }) => {
    const wob = Math.sin(f / 7) * 2;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <g transform={`translate(0 ${wob})`}>
          <path d="M-210 0 L-210 -74 L-186 -74 L-186 -20 L-150 -20 L-150 -78 Q-150 -112 -186 -112 L-268 -112 Q-292 -112 -292 -86 L-292 0 L-270 0 L-270 -42 L-240 -42 L-240 0 Z"
            fill="#8A6A4E" stroke={KRP.ink} strokeWidth={3.5} />
          <path d="M-292 -98 L-322 -150 L-300 -164 L-274 -124 Z" fill="#8A6A4E" stroke={KRP.ink} strokeWidth={3.5} />
          <circle cx={-310} cy={-150} r={5} fill={KRP.ink} />
          <rect x={-150} y={-150} width={190} height={96} rx={10} fill="#53586B" stroke={KRP.ink} strokeWidth={4} />
          <rect x={-134} y={-138} width={68} height={54} fill="#D8E0E4" stroke={KRP.ink} strokeWidth={3} />
          <rect x={-50} y={-138} width={68} height={54} fill="#D8E0E4" stroke={KRP.ink} strokeWidth={3} />
          <rect x={-160} y={-162} width={210} height={16} rx={6} fill="#3F4455" stroke={KRP.ink} strokeWidth={3} />
          <line x1={-186} y1={-96} x2={-150} y2={-110} stroke={KRP.ink} strokeWidth={4} />
        </g>
        <g stroke={KRP.ink} strokeWidth={4} fill="#6E6A5E">
          <circle cx={-110} cy={-24} r={32} />
          <circle cx={10} cy={-30} r={40} />
          <circle cx={-110} cy={-24} r={7} fill={KRP.ink} />
          <circle cx={10} cy={-30} r={8} fill={KRP.ink} />
        </g>
      </g>
    );
  };

// 初期の自動車
const OldCar: React.FC<{ x: number; y: number; s?: number; f?: number; color?: string }> =
  ({ x, y, s = 1, f = 0, color = "#3F4A5E" }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${Math.sin(f / 6) * 1.6})`}>
        <path d="M-150 -34 L-150 -84 Q-150 -98 -132 -98 L-56 -98 L-28 -140 L62 -140 Q82 -140 82 -118 L82 -98 L116 -98 Q134 -98 134 -80 L134 -34 Z"
          fill={color} stroke={KRP.ink} strokeWidth={4} />
        <rect x={-20} y={-132} width={44} height={34} fill="#CFE0E6" stroke={KRP.ink} strokeWidth={3} />
        <rect x={30} y={-132} width={42} height={34} fill="#CFE0E6" stroke={KRP.ink} strokeWidth={3} />
        <circle cx={-144} cy={-76} r={13} fill="#FFE9A8" stroke={KRP.ink} strokeWidth={3} />
      </g>
      <g stroke={KRP.ink} strokeWidth={4} fill="#4A463E">
        <circle cx={-92} cy={-30} r={34} />
        <circle cx={78} cy={-30} r={34} />
        <circle cx={-92} cy={-30} r={11} fill="#B9AE98" />
        <circle cx={78} cy={-30} r={11} fill="#B9AE98" />
      </g>
    </g>
  );

// シルクハット
const SilkHat: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> =
  ({ x, y, s = 1, rot = 0, color = "#2E2A26" }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={56} ry={13} fill={color} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-33} y={-72} width={66} height={72} rx={4} fill={color} stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={-33} y={-18} width={66} height={14} fill="#6A6056" stroke={KRP.ink} strokeWidth={2.5} />
    </g>
  );

// 電柱と電線
const PowerPole: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-10} y={-430} width={20} height={430} fill="#6B5A45" stroke={KRP.ink} strokeWidth={3} />
    {[-400, -348, -296].map((cy, i) => (
      <g key={i}>
        <rect x={-74} y={cy} width={148} height={11} fill="#6B5A45" stroke={KRP.ink} strokeWidth={3} />
        {[-60, -30, 30, 60].map((cx, j) => (
          <circle key={j} cx={cx} cy={cy - 8} r={7} fill="#9FB4A8" stroke={KRP.ink} strokeWidth={2.5} />
        ))}
      </g>
    ))}
  </g>
);

// ===== この章の共通世界: 古いニューヨークの通り =====
const OldNYStreet: React.FC<{
  f: number; groundY?: number; dusk?: boolean; night?: boolean;
  traffic?: boolean; lit?: number; wires?: boolean;
}> = ({ f, groundY = 880, dusk, night, traffic = true, lit = 0.3, wires = true }) => (
  <g>
    <SkyNY dusk={dusk} night={night} />
    <FarSkyline y={groundY - 150} color={night ? "#5A678A" : "#A99A85"} />
    <StoneBuilding x={-60} y={groundY - 120} w={300} floors={5} fh={88} fill="#CFC0A6" lit={lit} f={f} escape />
    <StoneBuilding x={250} y={groundY - 120} w={240} floors={6} fh={84} fill={STONE} lit={lit} f={f} />
    <StoneBuilding x={1480} y={groundY - 120} w={280} floors={5} fh={92} fill="#D3C4AB" lit={lit} f={f} escape />
    <StoneBuilding x={1730} y={groundY - 120} w={260} floors={6} fh={86} fill={STONE} lit={lit} f={f} />
    <rect x={0} y={groundY - 120} width={W} height={H - groundY + 160} fill="#9C9686" />
    <rect x={0} y={groundY - 120} width={W} height={34} fill="#B2AA97" stroke={KRP.ink} strokeWidth={3} />
    <g stroke="#857F70" strokeWidth={2.5} opacity={0.8}>
      {Array.from({ length: 10 }).map((_, r) => {
        const yy = groundY - 80 + r * 26;
        return (
          <g key={r}>
            <line x1={0} y1={yy} x2={W} y2={yy} />
            {Array.from({ length: 22 }).map((_, c) => {
              const xx = ((r % 2) * 44 + c * 88) - 40;
              return <line key={c} x1={xx} y1={yy} x2={xx + 6} y2={yy + 26} />;
            })}
          </g>
        );
      })}
    </g>
    {wires && (
      <g>
        <PowerPole x={150} y={groundY - 108} s={0.9} />
        <PowerPole x={1770} y={groundY - 108} s={0.9} />
        <g stroke={KRP.ink} strokeWidth={3} fill="none" opacity={0.85}>
          <path d={`M150 ${groundY - 470} Q960 ${groundY - 408} 1770 ${groundY - 470}`} />
          <path d={`M150 ${groundY - 424} Q960 ${groundY - 356} 1770 ${groundY - 424}`} />
        </g>
      </g>
    )}
    {traffic && (
      <g>
        <HorseCarriage x={60 + ((f * 1.6) % 2400)} y={groundY - 6} s={0.52} f={f} />
        <OldCar x={1680 - ((f * 1.1) % 2200)} y={groundY + 36} s={0.46} f={f} />
      </g>
    )}
    <GasLamp x={118} y={groundY - 86} s={0.78} on={!!(dusk || night)} />
    <GasLamp x={1812} y={groundY - 86} s={0.78} on={!!(dusk || night)} />
  </g>
);

// ===== 昇降路の断面図 (第10章で再登場する伏線部品。名前と prop の意味は変えない) =====
// ローカル座標: 原点 = 昇降路の上端中央。幅440 (x -220..220) / 高さ700 (y 0..700)。
export const elevShaftGeom = (carT: number) => {
  const t = clamp01(carT);
  return {
    cageX: -95, cageCY: lerp(590, 350, t), cageW: 164, cageH: 200,
    cwX: 95, cwCY: lerp(320, 610, t), cwW: 58, cwH: 140,
    pulleyX: 0, pulleyY: 150, pulleyR: 95,
  };
};

export const ElevShaft: React.FC<{
  x: number; y: number; s?: number;
  carT?: number; f?: number; labels?: boolean;
  labelT?: (i: number) => number; passengers?: number; motor?: boolean;
}> = ({ x, y, s = 1, carT = 0.5, f = 0, labels = false, labelT, passengers = 0, motor = false }) => {
  const g = elevShaftGeom(carT);
  const sway = Math.sin(f / 15) * 1.5;
  const rot = -carT * 420 + Math.sin(f / 30) * 1.2;
  const paxX = [-42, 38, -2, -80];
  const lt = (i: number) => (labels ? clamp01(labelT ? labelT(i) : 1) : 0);
  const cageTop = g.cageCY - g.cageH / 2;
  const cwTop = g.cwCY - g.cwH / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 昇降路の壁 (レンガ) */}
      <BrickWall x={-228} y={0} w={44} h={700} bw={44} bh={24} />
      <BrickWall x={184} y={0} w={44} h={700} bw={44} bh={24} />
      <rect x={-184} y={0} width={368} height={700} fill="#4A4438" />
      <rect x={-184} y={0} width={368} height={700} fill="#2E2A22" opacity={0.25} />
      {/* 各階の床と乗り場 (左=かご側) */}
      {[250, 420, 590].map((fy, i) => (
        <g key={i}>
          <rect x={-228} y={fy} width={78} height={16} fill="#B5A88E" stroke={KRP.ink} strokeWidth={3} />
          <rect x={150} y={fy} width={78} height={16} fill="#B5A88E" stroke={KRP.ink} strokeWidth={3} />
          <g stroke={KRP.brass} strokeWidth={2.5} opacity={0.9}>
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={-176 + k * 12} y1={fy} x2={-176 + k * 12} y2={fy - 74} />
            ))}
          </g>
        </g>
      ))}
      {/* ガイドレール */}
      <g stroke="#8E9298" strokeWidth={7}>
        <line x1={-180} y1={60} x2={-180} y2={690} />
        <line x1={-8} y1={60} x2={-8} y2={690} />
      </g>
      {/* 上部の鉄骨梁 */}
      <rect x={-200} y={18} width={400} height={26} fill="#7A8086" stroke={KRP.ink} strokeWidth={4} />
      <rect x={-200} y={44} width={400} height={12} fill="#666C72" stroke={KRP.ink} strokeWidth={3} />
      {[-170, -110, -50, 10, 70, 130, 180].map((bx, i) => <Bolt2 key={i} x={bx} y={31} r={6} />)}
      {/* 滑車 (溝とスポーク入り) */}
      <g transform={`translate(${g.pulleyX} ${g.pulleyY})`}>
        <circle cx={0} cy={0} r={g.pulleyR} fill="#9BA2A8" stroke={KRP.ink} strokeWidth={5} />
        <circle cx={0} cy={0} r={g.pulleyR - 13} fill="#B6BCC2" stroke={KRP.ink} strokeWidth={3} />
        <g transform={`rotate(${rot})`}>
          {[0, 60, 120].map((a, i) => (
            <line key={i} x1={-(g.pulleyR - 20) * Math.cos((a * Math.PI) / 180)}
              y1={-(g.pulleyR - 20) * Math.sin((a * Math.PI) / 180)}
              x2={(g.pulleyR - 20) * Math.cos((a * Math.PI) / 180)}
              y2={(g.pulleyR - 20) * Math.sin((a * Math.PI) / 180)}
              stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
          ))}
          <circle cx={0} cy={0} r={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-13} r={5} fill={KRP.ink} />
        </g>
        <rect x={-14} y={-g.pulleyR - 18} width={28} height={22} fill="#7A8086" stroke={KRP.ink} strokeWidth={3} />
      </g>
      {motor && (
        <g>
          <rect x={96} y={62} width={104} height={74} rx={10} fill="#4E5A66" stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={106 + i * 20} y1={68} x2={106 + i * 20} y2={130} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
          ))}
          <circle cx={148} cy={99} r={17} fill={KRP.brass} stroke={KRP.ink} strokeWidth={3} />
          <g transform={`rotate(${f * 6} 148 99)`}>
            <line x1={148} y1={85} x2={148} y2={113} stroke={KRP.ink} strokeWidth={4} />
          </g>
        </g>
      )}
      {/* ロープ (2本) */}
      <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round">
        <line x1={-95 - 6} y1={cageTop} x2={-g.pulleyR + 4} y2={g.pulleyY - 8} />
        <line x1={-95 + 6} y1={cageTop} x2={-g.pulleyR + 14} y2={g.pulleyY - 4} />
        <path d={`M${-g.pulleyR + 4} ${g.pulleyY - 8} A ${g.pulleyR} ${g.pulleyR} 0 0 1 ${g.pulleyR - 4} ${g.pulleyY - 8}`} fill="none" />
        <line x1={95 - 6} y1={cwTop} x2={g.pulleyR - 14} y2={g.pulleyY - 4} />
        <line x1={95 + 6} y1={cwTop} x2={g.pulleyR - 4} y2={g.pulleyY - 8} />
      </g>
      {/* かご (ヴィクトリア様式: 蛇腹扉・天井灯・操作レバー) */}
      <g transform={`translate(${g.cageX} ${g.cageCY + sway})`}>
        <rect x={-g.cageW / 2 - 8} y={-g.cageH / 2 - 14} width={g.cageW + 16} height={16} rx={5}
          fill="#6E7278" stroke={KRP.ink} strokeWidth={3.5} />
        <rect x={-g.cageW / 2} y={-g.cageH / 2} width={g.cageW} height={g.cageH} rx={7}
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <rect x={-g.cageW / 2 + 9} y={-g.cageH / 2 + 9} width={g.cageW - 18} height={g.cageH - 18} rx={5}
          fill="#F3E7CC" stroke={KRP.brass} strokeWidth={3} />
        <circle cx={0} cy={-g.cageH / 2 + 26} r={13} fill="#FFE9A8" stroke={KRP.ink} strokeWidth={3} />
        <g stroke={KRP.brass} strokeWidth={3} opacity={0.85}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={-g.cageW / 2 + 16 + i * 26} y1={-g.cageH / 2 + 46}
              x2={-g.cageW / 2 + 16 + i * 26} y2={g.cageH / 2 - 14} />
          ))}
        </g>
        <rect x={g.cageW / 2 - 26} y={-18} width={9} height={52} rx={4} fill={KRP.brass} stroke={KRP.ink} strokeWidth={2.5} />
        {Array.from({ length: Math.min(passengers, 4) }).map((_, i) => (
          <Person key={i} x={paxX[i]} y={g.cageH / 2 - 16} s={0.32}
            cloth={i % 2 ? "#5A4A63" : "#3E4B66"} f={f} phase={i * 3} face="normal" />
        ))}
        <rect x={-g.cageW / 2 - 4} y={g.cageH / 2} width={g.cageW + 8} height={12} rx={4}
          fill="#6E7278" stroke={KRP.ink} strokeWidth={3.5} />
      </g>
      {/* おもり (鋳鉄板を積んだ枠) */}
      <g transform={`translate(${g.cwX} ${g.cwCY - sway})`}>
        <rect x={-g.cwW / 2 - 7} y={-g.cwH / 2 - 16} width={g.cwW + 14} height={16} rx={5}
          fill="#5E6468" stroke={KRP.ink} strokeWidth={3.5} />
        <circle cx={0} cy={-g.cwH / 2 - 24} r={11} fill="none" stroke={KRP.ink} strokeWidth={4} />
        <rect x={-g.cwW / 2} y={-g.cwH / 2} width={g.cwW} height={g.cwH} rx={5}
          fill="#6B7176" stroke={KRP.ink} strokeWidth={4.5} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={-g.cwW / 2 + 6} y={-g.cwH / 2 + 8 + i * 21} width={g.cwW - 12} height={16}
            fill="#565C60" stroke={KRP.ink} strokeWidth={2.5} />
        ))}
      </g>
      {/* ピットと緩衝器 */}
      <rect x={-184} y={660} width={368} height={40} fill="#3A352C" stroke={KRP.ink} strokeWidth={3} />
      {[-95, 95].map((bx, i) => (
        <g key={i}>
          <rect x={bx - 16} y={692} width={32} height={10} fill="#7A8086" stroke={KRP.ink} strokeWidth={2.5} />
          <path d={`M${bx - 13} 692 L${bx + 13} 684 L${bx - 13} 676 L${bx + 13} 668 L${bx - 13} 660`}
            fill="none" stroke="#9BA2A8" strokeWidth={4} />
        </g>
      ))}
      <rect x={-228} y={0} width={456} height={700} fill="none" stroke={KRP.ink} strokeWidth={4} />
      {/* ラベル */}
      {labels && (
        <g>
          <SLabel x={g.cageX} y={g.cageCY} tx={-440} ty={g.cageCY} text="かご" t={lt(0)} size={34} />
          <SLabel x={-60} y={(cageTop + g.pulleyY) / 2} tx={-420} ty={cageTop - 90} text="ロープ" t={lt(1)} size={34} />
          <SLabel x={0} y={g.pulleyY} tx={330} ty={60} text="滑車" t={lt(2)} size={34} />
          <SLabel x={g.cwX} y={g.cwCY} tx={430} ty={g.cwCY} text="おもり" t={lt(3)} size={34} color={KRP.red} />
        </g>
      )}
    </g>
  );
};

// ===== エレベーターホール (大理石のロビー。#1 #15 #16 で使い回す) =====
const BrassElevDoor: React.FC<{
  x: number; y: number; w: number; h: number; open?: number; glow?: boolean; f?: number;
}> = ({ x, y, w, h, open = 0, glow = false, f = 0 }) => {
  const o = clamp01(open);
  const half = w / 2;
  const slide = half * o;
  return (
    <g>
      {/* 枠の奥 = かごの中 */}
      <rect x={x} y={y} width={w} height={h} fill="#2E2A22" />
      {o > 0.02 && (
        <g>
          <rect x={x} y={y} width={w} height={h} fill="#F3E7CC" opacity={0.95} />
          <circle cx={x + w / 2} cy={y + 52} r={20} fill="#FFE9A8" stroke={KRP.ink} strokeWidth={3} />
          <g stroke={KRP.brass} strokeWidth={3} opacity={0.6}>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={x + 20 + i * (w / 5)} y1={y + 90} x2={x + 20 + i * (w / 5)} y2={y + h - 20} />
            ))}
          </g>
        </g>
      )}
      {/* 扉2枚 */}
      {[0, 1].map((i) => {
        const dx = i === 0 ? x - slide : x + half + slide;
        return (
          <g key={i}>
            <rect x={dx} y={y} width={half} height={h} fill={KRP.brass} stroke={KRP.ink} strokeWidth={5} />
            <rect x={dx + 12} y={y + 14} width={half - 24} height={h - 28} rx={5}
              fill="none" stroke="#8C6E2E" strokeWidth={4} />
            <g stroke="#8C6E2E" strokeWidth={2.5} opacity={0.7}>
              {[0, 1, 2].map((k) => (
                <line key={k} x1={dx + 26} y1={y + 60 + k * (h / 3.4)} x2={dx + half - 26} y2={y + 60 + k * (h / 3.4)} />
              ))}
            </g>
          </g>
        );
      })}
      {/* 枠と階表示 */}
      <rect x={x - 26} y={y - 30} width={w + 52} height={34} fill="#C4B69C" stroke={KRP.ink} strokeWidth={4} />
      <rect x={x - 18} y={y - 24} width={w + 36} height={22} rx={10} fill="#3A3A42" stroke={KRP.ink} strokeWidth={3} />
      <g fill={glow ? KRP.orange : "#6E6A5E"}>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={x + 18 + i * ((w) / 4.5)} cy={y - 13} r={7}
            opacity={glow && (Math.floor(f / 18) % 5) === i ? 1 : 0.35} />
        ))}
      </g>
      <rect x={x - 32} y={y} width={12} height={h} fill="#C4B69C" stroke={KRP.ink} strokeWidth={3.5} />
      <rect x={x + w + 20} y={y} width={12} height={h} fill="#C4B69C" stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

const Lobby: React.FC<{ f: number; floorY?: number; wide?: boolean }> = ({ f, floorY = 880, wide = false }) => (
  <g>
    {/* 壁 (大理石パネル) */}
    <rect x={0} y={0} width={W} height={H} fill="#E3D8C4" />
    <rect x={0} y={0} width={W} height={120} fill="#CFC0A6" />
    {Array.from({ length: 8 }).map((_, i) => (
      <g key={i}>
        <rect x={-20 + i * 250} y={120} width={236} height={floorY - 120} fill={i % 2 ? "#DED2BC" : "#E7DCC8"}
          stroke="#C2B49A" strokeWidth={3} />
      </g>
    ))}
    {/* 天井の照明 */}
    {[380, 960, 1540].map((lx, i) => (
      <g key={i}>
        <rect x={lx - 5} y={0} width={10} height={70} fill="#6E6A5E" stroke={KRP.ink} strokeWidth={2.5} />
        <path d={`M${lx - 54} 118 L${lx + 54} 118 L${lx + 34} 68 L${lx - 34} 68 Z`}
          fill="#FFE9A8" stroke={KRP.ink} strokeWidth={3.5} />
        <ellipse cx={lx} cy={150} rx={88} ry={26} fill={KRP.yellow} opacity={0.18} />
      </g>
    ))}
    {/* 幅木と床 (市松の大理石・遠近つき) */}
    <rect x={0} y={floorY - 40} width={W} height={46} fill="#B3A68D" stroke={KRP.ink} strokeWidth={3.5} />
    <rect x={0} y={floorY} width={W} height={H - floorY} fill="#CFC5B0" />
    <g>
      {Array.from({ length: 6 }).map((_, r) => {
        const yy = floorY + r * ((H - floorY) / 6);
        const hh = (H - floorY) / 6 + 2;
        const cw = 120 + r * 26;
        return (
          <g key={r}>
            {Array.from({ length: 20 }).map((_, c) => (
              <rect key={c} x={-100 + c * cw} y={yy} width={cw} height={hh}
                fill={(r + c) % 2 ? "#C2B6A0" : "#DAD0BA"} stroke="#AFA48C" strokeWidth={2} />
            ))}
          </g>
        );
      })}
    </g>
    {wide && (
      <g>
        {/* 奥の回転扉と柱 */}
        <rect x={120} y={300} width={180} height={floorY - 340} fill="#D8CDB8" stroke={KRP.ink} strokeWidth={4} />
        <circle cx={210} cy={520} r={74} fill="#C9DCE2" stroke={KRP.ink} strokeWidth={4} />
        <line x1={136} y1={520} x2={284} y2={520} stroke={KRP.ink} strokeWidth={4} />
        <line x1={210} y1={446} x2={210} y2={594} stroke={KRP.ink} strokeWidth={4} />
      </g>
    )}
    <Atmos4 f={f} />
  </g>
);

// 室内の埃っぽい空気 (ロビー用のうっすらした粒)
const Atmos4: React.FC<{ f: number }> = ({ f }) => (
  <g opacity={0.12} fill={KRP.ink}>
    {[[300, 420], [760, 340], [1260, 480], [1640, 380], [520, 640], [1420, 700]].map(([dx, dy], i) => (
      <circle key={i} cx={dx + Math.sin((f + i * 30) / 40) * 12} cy={dy + Math.cos((f + i * 20) / 50) * 10} r={4} />
    ))}
  </g>
);

// ===== 階段の一折り (#20 #23 #27 で使い回す) =====
const StairFlight: React.FC<{
  x: number; y: number; w: number; h: number; dir?: number; steps?: number;
}> = ({ x, y, w, h, dir = 1, steps = 7 }) => {
  const sw = w / steps, sh = h / steps;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const px = dir > 0 ? x + i * sw : x + w - i * sw;
    const py = y - i * sh;
    pts.push(`${px},${py}`, `${px},${py - sh}`);
  }
  return (
    <g>
      <polyline points={pts.join(" ")} fill="none" stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: steps }).map((_, i) => {
        const px = dir > 0 ? x + i * sw : x + w - (i + 1) * sw;
        const py = y - (i + 1) * sh;
        return (
          <g key={i}>
            <rect x={px} y={py} width={sw} height={Math.max(8, sh * 0.42)} fill="#A58F6E" stroke={KRP.ink} strokeWidth={2.5} />
            <rect x={px} y={py + Math.max(8, sh * 0.42)} width={sw} height={sh - Math.max(8, sh * 0.42)}
              fill="#8C7757" stroke={KRP.ink} strokeWidth={2} />
          </g>
        );
      })}
      {/* 手すり */}
      <line x1={dir > 0 ? x : x + w} y1={y - 76} x2={dir > 0 ? x + w : x} y2={y - h - 76}
        stroke={KRP.brass} strokeWidth={7} strokeLinecap="round" />
      {Array.from({ length: steps }).map((_, i) => {
        const px = dir > 0 ? x + i * sw + sw / 2 : x + w - i * sw - sw / 2;
        const py = y - i * sh - sh / 2;
        return <line key={i} x1={px} y1={py} x2={px} y2={py - 72} stroke="#8C6E2E" strokeWidth={3} />;
      })}
    </g>
  );
};

// ===== ビルの断面 (N階ぶんの部屋 + 中央の縦穴。mode で中身を替える) =====
const TallCutaway: React.FC<{
  x: number; y: number; w: number; floors: number; fh: number;
  mode?: "elev" | "stairs" | "empty"; carFloor?: number; f?: number; litTop?: number;
}> = ({ x, y, w, floors, fh, mode = "elev", carFloor = 0, f = 0, litTop = -1 }) => {
  const top = y - floors * fh;
  const sw = Math.min(150, w * 0.26);        // 縦穴の幅
  const sx = x + w / 2 - sw / 2;
  return (
    <g>
      {/* 外壁 */}
      <BrickWall x={x - 26} y={top} w={26} h={floors * fh} bw={40} bh={22} />
      <BrickWall x={x + w} y={top} w={26} h={floors * fh} bw={40} bh={22} />
      <rect x={x} y={top} width={w} height={floors * fh} fill="#E7DCC8" stroke={KRP.ink} strokeWidth={3} />
      {/* 屋上 */}
      <rect x={x - 38} y={top - 22} width={w + 76} height={24} fill="#C4B69C" stroke={KRP.ink} strokeWidth={4} />
      {/* 各階 */}
      {Array.from({ length: floors }).map((_, i) => {
        const fy = y - (i + 1) * fh;   // この階の床の上面
        const isLit = litTop >= 0 ? i >= floors - 1 - litTop : false;
        return (
          <g key={i}>
            <rect x={x} y={fy + fh - 14} width={w} height={14} fill="#B5A88E" stroke={KRP.ink} strokeWidth={3} />
            {/* 左右の部屋 */}
            {[0, 1].map((k) => {
              const rx = k === 0 ? x + 10 : sx + sw + 10;
              const rw = k === 0 ? sx - x - 20 : x + w - sx - sw - 20;
              return (
                <g key={k}>
                  <rect x={rx} y={fy + 10} width={rw} height={fh - 26}
                    fill={isLit ? "#FFEFC2" : "#F1E6D0"} stroke="#C2B49A" strokeWidth={2.5} />
                  <rect x={rx + 8} y={fy + fh - 46} width={Math.max(18, rw * 0.3)} height={20}
                    fill="#9E8A6E" stroke={KRP.ink} strokeWidth={2} />
                  <circle cx={rx + rw - 22} cy={fy + 30} r={9}
                    fill={isLit ? "#FFE07A" : "#CFC5B0"} stroke={KRP.ink} strokeWidth={2} />
                </g>
              );
            })}
            {/* 縦穴の中身 */}
            {mode === "stairs" && (
              <g>
                <rect x={sx} y={fy} width={sw} height={fh} fill="#D8CDB8" stroke="#B3A68D" strokeWidth={2} />
                <StairFlight x={sx + 6} y={fy + fh - 14} w={sw - 12} h={fh - 16} dir={i % 2 === 0 ? 1 : -1} steps={5} />
              </g>
            )}
            {mode === "empty" && <rect x={sx} y={fy} width={sw} height={fh} fill="#D8CDB8" stroke="#B3A68D" strokeWidth={2} />}
            {mode === "elev" && (
              <g>
                <rect x={sx} y={fy} width={sw} height={fh} fill="#3F3A30" />
                <g stroke={KRP.brass} strokeWidth={2} opacity={0.8}>
                  {[0, 1, 2].map((k) => (
                    <line key={k} x1={sx + 12 + k * ((sw - 24) / 3)} y1={fy + fh - 14} x2={sx + 12 + k * ((sw - 24) / 3)} y2={fy + 12} />
                  ))}
                </g>
              </g>
            )}
          </g>
        );
      })}
      {/* かご */}
      {mode === "elev" && (() => {
        const cy = y - carFloor * fh - fh / 2;
        const cw = sw - 24, ch = fh - 26;
        return (
          <g>
            <line x1={x + w / 2} y1={top + 10} x2={x + w / 2} y2={cy - ch / 2} stroke={KRP.ink} strokeWidth={4} />
            <rect x={x + w / 2 - cw / 2} y={cy - ch / 2} width={cw} height={ch} rx={5}
              fill={KRP.cream} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={x + w / 2} cy={cy - ch / 2 + 16} r={8} fill="#FFE9A8" stroke={KRP.ink} strokeWidth={2.5} />
            <Person x={x + w / 2} y={cy + ch / 2 - 8} s={Math.max(0.16, ch / 420)} cloth="#3E4B66" f={f} face="smile" />
          </g>
        );
      })()}
      {/* 屋上の機械室 */}
      <rect x={x + w / 2 - 54} y={top - 76} width={108} height={56} fill="#C4B69C" stroke={KRP.ink} strokeWidth={4} />
      {/* 1階の入口 */}
      <rect x={x + w / 2 - 40} y={y - 96} width={80} height={96} fill="#5E4E3E" stroke={KRP.ink} strokeWidth={3.5} />
      <path d={`M${x + w / 2 - 46} ${y - 96} Q${x + w / 2} ${y - 142} ${x + w / 2 + 46} ${y - 96}`}
        fill="#C4B69C" stroke={KRP.ink} strokeWidth={4} />
    </g>
  );
};

// ===== 天秤 (しくみ図の主役。皿は常に水平) =====
const Tenbin: React.FC<{
  x: number; y: number; s?: number; tilt?: number; t?: number; opacity?: number;
  armHalf?: number; hang?: number;
  left?: React.ReactNode; right?: React.ReactNode;
  leftLabel?: string; rightLabel?: string; f?: number;
}> = ({
  x, y, s = 1, tilt = 0, t = 1, opacity = 1, armHalf = 220, hang = 110,
  left, right, leftLabel, rightLabel, f = 0,
}) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  const ang = tilt * 13;
  const rad = (ang * Math.PI) / 180;
  const lx = -armHalf * Math.cos(rad), ly = -armHalf * Math.sin(rad);
  const rx = armHalf * Math.cos(rad), ry = armHalf * Math.sin(rad);
  const pan = (px: number, py: number, label?: string, node?: React.ReactNode) => (
    <g>
      <line x1={px} y1={py} x2={px - 54} y2={py + hang} stroke={KRP.ink} strokeWidth={3.5} />
      <line x1={px} y1={py} x2={px + 54} y2={py + hang} stroke={KRP.ink} strokeWidth={3.5} />
      <ellipse cx={px} cy={py + hang} rx={78} ry={15} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <path d={`M${px - 78} ${py + hang} Q${px} ${py + hang + 36} ${px + 78} ${py + hang}`}
        fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      {node && <g transform={`translate(${px} ${py + hang - 8})`}>{node}</g>}
      {label && <TagPlate x={px} y={py + hang + 66} text={label} size={30} />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity * tt}>
      {/* 台座と柱 */}
      <path d="M-120 214 L120 214 L84 184 L-84 184 Z" fill="#8C7757" stroke={KRP.ink} strokeWidth={4} />
      <rect x={-130} y={214} width={260} height={18} rx={6} fill="#6E5C44" stroke={KRP.ink} strokeWidth={4} />
      <rect x={-16} y={0} width={32} height={188} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      <circle cx={0} cy={0} r={22} fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
      {/* 竿 */}
      <g transform={`rotate(${ang})`}>
        <rect x={-armHalf - 14} y={-9} width={armHalf * 2 + 28} height={18} rx={9}
          fill={KRP.brass} stroke={KRP.ink} strokeWidth={4} />
        <circle cx={-armHalf} cy={0} r={11} fill="#8C6E2E" stroke={KRP.ink} strokeWidth={3} />
        <circle cx={armHalf} cy={0} r={11} fill="#8C6E2E" stroke={KRP.ink} strokeWidth={3} />
      </g>
      {/* 指針 */}
      <g transform={`rotate(${ang})`}>
        <line x1={0} y1={-9} x2={0} y2={-56} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <line x1={0} y1={-62} x2={0} y2={-84} stroke={KRP.red} strokeWidth={5} />
      {pan(lx, ly, leftLabel, left)}
      {pan(rx, ry, rightLabel, right)}
    </g>
  );
};

// 「階段のつらさ」の重し
const StairWeight: React.FC<{ x: number; y: number; s?: number; t?: number; label?: boolean }> =
  ({ x, y, s = 1, t = 1, label = true }) => {
    const tt = clamp01(t);
    if (tt <= 0.001) return null;
    return (
      <g transform={`translate(${x} ${y}) scale(${s * pop(tt)})`} opacity={tt}>
        <path d="M-66 0 L66 0 L50 -92 L-50 -92 Z" fill="#6B7176" stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={-22} y={-110} width={44} height={20} rx={7} fill="#565C60" stroke={KRP.ink} strokeWidth={4} />
        <g stroke="#E8E2D4" strokeWidth={4} fill="none" opacity={0.9}>
          <polyline points="-30,-22 -10,-22 -10,-40 10,-40 10,-58 30,-58" />
        </g>
        {label && <text x={0} y={-4} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill="#E8E2D4">つらさ</text>}
      </g>
    );
  };

// 「眺め」のコイン
const ViewToken: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 1 }) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * pop(tt)})`} opacity={tt}>
      <circle cx={0} cy={-46} r={48} fill={KRP.gold ?? KRP.yellow} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={0} cy={-46} r={38} fill="none" stroke={KRP.ink} strokeWidth={2.5} />
      <text x={0} y={-34} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={KRP.ink}>眺め</text>
    </g>
  );
};

// 回転数字 (家賃・階数のカウンタ)
const Odometer: React.FC<{
  x: number; y: number; value: number; digits?: number; size?: number;
  unit?: string; color?: string; t?: number;
}> = ({ x, y, value, digits = 3, size = 70, unit = "", color = KRP.ink, t = 1 }) => {
  const tt = clamp01(t);
  if (tt <= 0.001) return null;
  const v = Math.max(0, Math.round(value));
  const str = String(v).padStart(digits, "0");
  const dw = size * 0.72;
  const totalW = dw * digits + (unit ? size * 0.9 : 0);
  return (
    <g opacity={tt} transform={`translate(${x - totalW / 2} ${y})`}>
      {str.split("").map((ch, i) => (
        <g key={i}>
          <rect x={i * dw} y={-size * 0.78} width={dw - 6} height={size * 1.04} rx={6}
            fill="#F3E7CC" stroke={KRP.ink} strokeWidth={3.5} />
          <text x={i * dw + (dw - 6) / 2} y={0} textAnchor="middle" fontFamily={FONT}
            fontSize={size} fontWeight={900} fill={color}>{ch}</text>
        </g>
      ))}
      {unit && (
        <text x={dw * digits + 8} y={0} fontFamily={FONT} fontSize={size * 0.72} fontWeight={900} fill={color}>{unit}</text>
      )}
    </g>
  );
};

// 必要な力のゲージ
const EffortGauge: React.FC<{
  x: number; y: number; w: number; h: number; v: number; ghost?: number; label?: string; color?: string;
}> = ({ x, y, w, h, v, ghost, label, color = KRP.orange }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={8} fill="#E3D8C4" stroke={KRP.ink} strokeWidth={4} />
    {ghost !== undefined && (
      <rect x={x + 5} y={y + h - 5 - (h - 10) * clamp01(ghost)} width={w - 10} height={(h - 10) * clamp01(ghost)}
        rx={5} fill={KRP.gray} opacity={0.5} />
    )}
    <rect x={x + 5} y={y + h - 5 - (h - 10) * clamp01(v)} width={w - 10} height={(h - 10) * clamp01(v)}
      rx={5} fill={color} stroke={KRP.ink} strokeWidth={2.5} />
    <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.5}>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={x} y1={y + h * (1 - p)} x2={x + w} y2={y + h * (1 - p)} />
      ))}
    </g>
    {label && <TagPlate x={x + w / 2} y={y - 36} text={label} size={28} />}
  </g>
);

// @@PART2@@


