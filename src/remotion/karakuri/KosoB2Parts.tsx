// 「なぜ高層ビルは生まれたのか」第2章「人を、上げる。」の〈説明の装置〉
// ===================================================================
// ここに置くのは **説明の装置** だけ。背景・空・街並み・人の配置は置かない。
// (制作ガイド §7 第3層-6「共有してよいのは装置、共有してはいけないのは舞台」)
//
// ★この装置は「図」の格の品質基準そのもの。(制作ガイド §7 第3層-7)
//   「短いのは、賑やかさを削ったからであって、雑に描いたからではない」
//   だから滑車には 溝・軸・ボルト・スポーク があり、ロープには 撚り があり、
//   おもりには 鋳物板の合わせ目 がある。白地だからこそ粗が見える。
//
// 使い方: 1シーン = 1枚。Frame の children (svg の中) に置く。
//   <Frame f={f} seed={6xx}>
//     <GridPaper />                       ← 図の下地 (使わなくてよい)
//     <Sheave x={960} y={300} r={180} rot={f * 2} />
//     <Rope x1={...} ... />
//     <TagPlate x={960} y={760} text="溝の摩擦" size={36} t={seg(f,10,24)} />
//   </Frame>
//
// 置く大きさの約束: 「小さい物を画面の真ん中にポツンと置く」のが最悪の失敗。
//   主役の装置は、短辺で 画面の 1/2 以上 (= 540px 以上) を使う。
//
// 札の高さの約束: TagPlate の下端 = y + size * 0.85。これを **830 以下** にする
//   (字幕帯の上端が 2行で y≈854 のため)。

import React from "react";
import { KRP, Bolt, clamp01, seg, pop, easeOut } from "./KarakuriScenes";
import { W, H, FONT } from "./KosoShared";

// ===================================================================
// 第2章の色 (1850年代の工房〜現代の機械室までの素材)
// ===================================================================
export const BP = {
  steel: "#8A94A0",      // 鉄 (1章の柱「骨」と同じ色)
  steelDark: "#6B7480",
  steelLight: "#AAB3BD",
  iron: "#5E6469",       // 鋳物 (おもりの板)
  ironDark: "#43484C",
  brass: "#C9A646",      // 真鍮 (かごの内装・把手・計器)
  brassDark: "#9A7C2C",
  brassLight: "#E0C36E",
  hemp: "#C8A979",       // 麻ロープ
  hempDark: "#9C7F52",
  wire: "#9AA3AA",       // 鋼索 (ワイヤロープ)
  wood: "#A77C4E",       // かごの木枠・樽
  woodDark: "#7E5B36",
  woodLight: "#C49B6B",
  shaft: "#D9D2C2",      // 縦穴の壁 (漆喰)
  shaftDark: "#B8AF9C",
  shaftDeep: "#5A5347",  // 縦穴の闇
  slab: "#C7C3B8",       // 床スラブ
  slabDark: "#A49F93",
  lamp: "#F5DD9A",       // 電球
  lampGlow: "#FFF0C0",
  glass: "#AFC9DC",
  grease: "#6E5E3E",     // 油・グリス
  spark: "#E8923A",      // 火花・摩擦
  rust: "#A8623A",
  paper: "#F2EAD6",      // 図面の紙
  chalk: "#E8E4D8",
  board: "#2E3A33",      // 黒板
} as const;

// ===================================================================
// 小さな道具 (背景キットではない。線や粒を引くための筆)
// ===================================================================
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** seed から 0〜1 の擬似乱数 (同じ seed なら毎回同じ = 絵がちらつかない) */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** (cx,cy) に z 倍で寄るカメラ */
export const zoomAt = (z: number, cx: number, cy: number) =>
  `translate(${cx - cx * z} ${cy - cy * z}) scale(${z})`;

/** Person と同じゆれ式 (帽子などを人物に同期させる) */
export const bobOf = (f: number, phase = 0) => Math.sin((f + phase * 17) / 13) * 3;

/** 2点の間に等間隔でリベットを打つ */
export const Rivets: React.FC<{
  x1: number; y1: number; x2: number; y2: number; n?: number; r?: number; fill?: string;
}> = ({ x1, y1, x2, y2, n = 8, r = 6, fill = BP.steelDark }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      return (
        <circle key={i} cx={lerp(x1, x2, t)} cy={lerp(y1, y2, t)} r={r}
          fill={fill} stroke={KRP.ink} strokeWidth={2.5} />
      );
    })}
  </g>
);

/** 六角ボルト (頭の正面)。軸の端を締めている印 */
export const HexBolt: React.FC<{
  x: number; y: number; r?: number; rot?: number; fill?: string;
}> = ({ x, y, r = 14, rot = 0, fill = BP.steelDark }) => {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 + rot) * Math.PI) / 180;
    return `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  return (
    <g>
      <polygon points={pts} fill={fill} stroke={KRP.ink} strokeWidth={3.5} />
      <circle cx={x} cy={y} r={r * 0.38} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={2.5} />
    </g>
  );
};

/** 図の下地。薄い方眼とトンボ。図は「舞台」ではないので、ここは共有してよい */
export const GridPaper: React.FC<{
  pitch?: number; opacity?: number; tombo?: boolean;
}> = ({ pitch = 60, opacity = 0.13, tombo = true }) => (
  <g>
    <g stroke={BP.shaftDark} strokeWidth={2} opacity={opacity}>
      {Array.from({ length: Math.ceil(W / pitch) + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i * pitch} y1={0} x2={i * pitch} y2={H} />
      ))}
      {Array.from({ length: Math.ceil(H / pitch) + 1 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * pitch} x2={W} y2={i * pitch} />
      ))}
    </g>
    <g stroke={BP.shaftDark} strokeWidth={4} opacity={opacity * 2.4}>
      {Array.from({ length: Math.ceil(W / (pitch * 5)) + 1 }, (_, i) => (
        <line key={`V${i}`} x1={i * pitch * 5} y1={0} x2={i * pitch * 5} y2={H} />
      ))}
      {Array.from({ length: Math.ceil(H / (pitch * 5)) + 1 }, (_, i) => (
        <line key={`H${i}`} x1={0} y1={i * pitch * 5} x2={W} y2={i * pitch * 5} />
      ))}
    </g>
    {tombo && (
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.5}>
        {[[56, 56], [W - 56, 56], [56, H - 56], [W - 56, H - 56]].map(([tx, ty], i) => (
          <g key={i}>
            <line x1={tx - 26} y1={ty} x2={tx + 26} y2={ty} />
            <line x1={tx} y1={ty - 26} x2={tx} y2={ty + 26} />
          </g>
        ))}
      </g>
    )}
  </g>
);

// ===================================================================
// ロープ — 撚りまで描く。これが第2章の主役の線
// ===================================================================
/**
 * 撚りのあるロープ。(x1,y1)→(x2,y2) を結ぶ。
 * kind="hemp" 麻縄 (19世紀前半) / "wire" 鋼索 (以降)
 * sag>0 でたるむ (切れたあとの垂れに使う)
 */
export const Rope: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  w?: number; kind?: "hemp" | "wire"; f?: number; opacity?: number; sag?: number;
  twist?: boolean;
}> = ({ x1, y1, x2, y2, w = 16, kind = "hemp", f = 0, opacity = 1, sag = 0, twist = true }) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const body = kind === "hemp" ? BP.hemp : BP.wire;
  const dark = kind === "hemp" ? BP.hempDark : BP.steelDark;
  const step = w * 0.92;
  const n = Math.max(2, Math.floor(len / step));
  // たるみは中央を膨らませた二次曲線で描く
  if (sag > 0.5) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
    return (
      <g opacity={opacity}>
        <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none"
          stroke={KRP.ink} strokeWidth={w + 6} strokeLinecap="round" />
        <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none"
          stroke={body} strokeWidth={w} strokeLinecap="round" />
        <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none"
          stroke={dark} strokeWidth={w * 0.26} strokeDasharray={`${w * 0.5} ${w * 0.5}`} opacity={0.8} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${ang})`} opacity={opacity}>
      <rect x={0} y={-w / 2 - 3} width={len} height={w + 6} fill={KRP.ink} />
      <rect x={0} y={-w / 2} width={len} height={w} fill={body} />
      {/* 撚り: 斜めの筋が等間隔に走る */}
      {twist && (
        <g stroke={dark} strokeWidth={w * 0.2} strokeLinecap="round" opacity={0.9}>
          {Array.from({ length: n }, (_, i) => {
            const px = i * step + ((f * 0.6) % step);
            return <line key={i} x1={px} y1={-w / 2} x2={px + w * 0.62} y2={w / 2} />;
          })}
        </g>
      )}
      {/* 芯のハイライト */}
      <rect x={0} y={-w / 2 + w * 0.14} width={len} height={w * 0.14}
        fill={KRP.white} opacity={0.3} />
    </g>
  );
};

/** 切れたロープの端 (ほつれた繊維が開く) */
export const RopeFray: React.FC<{
  x: number; y: number; dir?: 1 | -1; s?: number; kind?: "hemp" | "wire"; t?: number;
}> = ({ x, y, dir = 1, s = 1, kind = "hemp", t = 1 }) => {
  const spread = easeOut(clamp01(t));
  const body = kind === "hemp" ? BP.hemp : BP.wire;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (-54 + i * 18) * spread;
        const l = 26 + rnd(i + 3) * 22;
        return (
          <line key={i} x1={0} y1={0}
            x2={Math.sin((a * Math.PI) / 180) * l}
            y2={dir * Math.cos((a * Math.PI) / 180) * l}
            stroke={body} strokeWidth={5} strokeLinecap="round" />
        );
      })}
      <circle cx={0} cy={0} r={5} fill={KRP.ink} />
    </g>
  );
};

// ===================================================================
// 滑車 — 溝・軸・ボルト・スポークまで
// ===================================================================
/**
 * 綱車 (シーブ)。rot で回る。groove でロープの乗る溝を見せる。
 * r は半径。主役に使うときは r≥160 で置く。
 */
export const Sheave: React.FC<{
  x: number; y: number; r?: number; rot?: number; spokes?: number;
  groove?: boolean; bracket?: boolean; fill?: string;
}> = ({ x, y, r = 150, rot = 0, spokes = 6, groove = true, bracket = true, fill = BP.steel }) => {
  const hub = r * 0.26;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 支え金物 (梁から吊る) */}
      {bracket && (
        <g>
          <rect x={-r * 0.22} y={-r - 92} width={r * 0.44} height={92}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-r * 0.52} y={-r - 112} width={r * 1.04} height={26} rx={6}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          <HexBolt x={-r * 0.36} y={-r - 99} r={11} />
          <HexBolt x={r * 0.36} y={-r - 99} r={11} />
        </g>
      )}
      {/* 回る本体 */}
      <g transform={`rotate(${rot})`}>
        <circle cx={0} cy={0} r={r} fill={fill} stroke={KRP.ink} strokeWidth={7} />
        {/* 溝 (リムの内側に一段落ちる) */}
        {groove && (
          <>
            <circle cx={0} cy={0} r={r * 0.86} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={0} cy={0} r={r * 0.78} fill={fill} stroke={KRP.ink} strokeWidth={4} />
            <circle cx={0} cy={0} r={r * 0.82} fill="none" stroke={BP.grease}
              strokeWidth={r * 0.05} opacity={0.5} />
          </>
        )}
        {/* スポーク */}
        <g>
          {Array.from({ length: spokes }, (_, i) => (
            <g key={i} transform={`rotate(${(360 / spokes) * i})`}>
              <rect x={-r * 0.075} y={-r * 0.78} width={r * 0.15} height={r * 0.78 - hub + 6}
                rx={r * 0.07} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={4.5} />
            </g>
          ))}
        </g>
        {/* ハブ・軸・ボルト */}
        <circle cx={0} cy={0} r={hub * 1.5} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5.5} />
        {Array.from({ length: 5 }, (_, i) => {
          const a = ((i * 72 - 90) * Math.PI) / 180;
          return <HexBolt key={i} x={Math.cos(a) * hub * 1.08} y={Math.sin(a) * hub * 1.08} r={hub * 0.3} />;
        })}
        <circle cx={0} cy={0} r={hub * 0.52} fill={BP.grease} stroke={KRP.ink} strokeWidth={4} />
      </g>
      {/* 軸受け (回らない) */}
      <circle cx={0} cy={0} r={hub * 0.26} fill={KRP.ink} />
    </g>
  );
};

/** 滑車の溝とロープの断面 (#94 の寄り用)。溝にロープが挟まっている図 */
export const GrooveSection: React.FC<{
  x: number; y: number; s?: number; f?: number; showFriction?: boolean; t?: number;
}> = ({ x, y, s = 1, f = 0, showFriction = true, t = 1 }) => {
  const ap = clamp01(t);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* リムの肉 (断面なのでハッチング) */}
      <path d="M -300 60 L -300 300 L 300 300 L 300 60 L 120 60 L 0 -30 L -120 60 Z"
        fill={BP.steel} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={BP.steelDark} strokeWidth={4} opacity={0.65}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-300 + i * 44} y1={300} x2={-300 + i * 44 + 70} y2={120} />
        ))}
      </g>
      {/* 溝の縁の面取り */}
      <g stroke={BP.steelLight} strokeWidth={6} opacity={0.9}>
        <line x1={-120} y1={60} x2={-300} y2={60} />
        <line x1={120} y1={60} x2={300} y2={60} />
      </g>
      {/* 溝にはまったロープの断面 */}
      <circle cx={0} cy={6} r={104} fill={BP.wire} stroke={KRP.ink} strokeWidth={8} />
      {/* 鋼索の素線 (6×7 撚り) */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = ((i * 60 - 90) * Math.PI) / 180;
        return (
          <g key={i}>
            <circle cx={Math.cos(a) * 58} cy={6 + Math.sin(a) * 58} r={32}
              fill={BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={Math.cos(a) * 58} cy={6 + Math.sin(a) * 58} r={13}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3} />
          </g>
        );
      })}
      <circle cx={0} cy={6} r={32} fill={BP.hemp} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={0} cy={6} r={11} fill={BP.hempDark} stroke={KRP.ink} strokeWidth={3} />
      {/* 摩擦の矢印 (溝の両側からロープを挟む) */}
      {showFriction && (
        <g opacity={ap}>
          {[-1, 1].map((sgn) => (
            <g key={sgn}>
              <path d={`M ${sgn * 196} ${-62 + Math.sin(f / 7) * 5} l ${-sgn * 52} 36 l ${sgn * 18} 6 l ${-sgn * 40} 26`}
                fill="none" stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
              <polygon points={`${sgn * 104},${54} ${sgn * 150},${30} ${sgn * 146},${64}`}
                fill={KRP.red} stroke={KRP.ink} strokeWidth={3.5} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// ===================================================================
// レール — 案内レールと、安全装置が噛む歯付きレール
// ===================================================================
/** 案内レール (T字断面を正面から)。継ぎ目の添え板とボルトまで */
export const GuideRail: React.FC<{
  x: number; y1: number; y2: number; w?: number; splice?: number; opacity?: number;
}> = ({ x, y1, y2, w = 26, splice = 260, opacity = 1 }) => {
  const n = Math.max(0, Math.floor((y2 - y1) / splice));
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y1} width={w} height={y2 - y1}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x - w * 0.16} y={y1} width={w * 0.32} height={y2 - y1}
        fill={BP.steelLight} opacity={0.75} />
      {Array.from({ length: n }, (_, i) => {
        const sy = y1 + splice * (i + 0.5);
        return (
          <g key={i}>
            <rect x={x - w * 0.9} y={sy - 26} width={w * 1.8} height={52} rx={6}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
            <HexBolt x={x - w * 0.42} y={sy - 10} r={7} />
            <HexBolt x={x + w * 0.42} y={sy + 10} r={7} />
          </g>
        );
      })}
    </g>
  );
};

/** 歯のついたレール (非常止めの爪が噛む相手)。dir=1 で右側に歯が出る */
export const ToothRail: React.FC<{
  x: number; y1: number; y2: number; w?: number; pitch?: number; dir?: 1 | -1;
}> = ({ x, y1, y2, w = 34, pitch = 54, dir = 1 }) => {
  const n = Math.max(1, Math.floor((y2 - y1) / pitch));
  const edge = x + (dir * w) / 2;
  return (
    <g>
      <rect x={x - w / 2} y={y1} width={w} height={y2 - y1}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <g fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4}>
        {Array.from({ length: n }, (_, i) => {
          const ty = y1 + i * pitch;
          return (
            <polygon key={i}
              points={`${edge},${ty} ${edge + dir * 26},${ty + pitch * 0.34} ${edge},${ty + pitch * 0.68}`} />
          );
        })}
      </g>
      <rect x={x - w * 0.14} y={y1} width={w * 0.28} height={y2 - y1}
        fill={BP.steelLight} opacity={0.7} />
    </g>
  );
};

// ===================================================================
// バネと爪 — #77〜#79 の機構連番の主役
// ===================================================================
/**
 * つるまきバネ。len で伸び縮みする (縮んでいる = 力がかかっている)。
 * vertical=true で縦向き。
 */
export const Spring: React.FC<{
  x: number; y: number; len: number; w?: number; coils?: number;
  vertical?: boolean; color?: string; stress?: number;
}> = ({ x, y, len, w = 86, coils = 7, vertical = true, color = BP.steelDark, stress = 0 }) => {
  const step = len / coils;
  const pts: string[] = [];
  for (let i = 0; i <= coils; i += 1) {
    const a = i * step;
    const b = (i % 2 === 0 ? -1 : 1) * (w / 2);
    pts.push(vertical ? `${x + b} ${y + a}` : `${x + a} ${y + b}`);
  }
  const thick = 11 + stress * 4;
  return (
    <g>
      <polyline points={pts.join(" ")} fill="none" stroke={KRP.ink}
        strokeWidth={thick + 5} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts.join(" ")} fill="none"
        stroke={stress > 0.5 ? BP.spark : color}
        strokeWidth={thick} strokeLinecap="round" strokeLinejoin="round" />
      {/* 端の座金 */}
      {vertical ? (
        <>
          <rect x={x - w * 0.62} y={y - 14} width={w * 1.24} height={20} rx={5}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={x - w * 0.62} y={y + len - 6} width={w * 1.24} height={20} rx={5}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
        </>
      ) : (
        <>
          <rect x={x - 14} y={y - w * 0.62} width={20} height={w * 1.24} rx={5}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={x + len - 6} y={y - w * 0.62} width={20} height={w * 1.24} rx={5}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={4.5} />
        </>
      )}
    </g>
  );
};

/**
 * 非常止めの爪。rot で開閉する (0 = レールから離れている / 大きいほど噛む)。
 * dir=1 で右のレールへ向かって噛む。
 */
export const Pawl: React.FC<{
  x: number; y: number; rot?: number; s?: number; dir?: 1 | -1; bite?: number;
}> = ({ x, y, rot = 0, s = 1, dir = 1, bite = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
    {/* 軸受け */}
    <circle cx={0} cy={0} r={22} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
    <g transform={`rotate(${rot})`}>
      {/* 爪の本体 (くさび形) */}
      <path d="M -16 -20 L 104 -34 L 150 4 L 104 34 L -16 20 Z"
        fill={bite > 0.5 ? BP.spark : BP.steel} stroke={KRP.ink} strokeWidth={6} />
      {/* 噛む先の歯 */}
      <g fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3.5}>
        <polygon points="118,-26 150,-6 118,2" />
        <polygon points="118,6 150,26 118,32" />
      </g>
      {/* 肉抜きと補強 */}
      <line x1={10} y1={-10} x2={96} y2={-18} stroke={BP.steelDark} strokeWidth={5} />
      <line x1={10} y1={10} x2={96} y2={20} stroke={BP.steelDark} strokeWidth={5} />
      <HexBolt x={54} y={0} r={9} />
    </g>
    <circle cx={0} cy={0} r={7} fill={KRP.ink} />
  </g>
);

/** 噛んだ瞬間の火花 */
export const Sparks: React.FC<{
  x: number; y: number; f: number; n?: number; s?: number; t?: number;
}> = ({ x, y, f, n = 9, s = 1, t = 1 }) => {
  const ap = clamp01(t);
  if (ap <= 0) return null;
  return (
    <g opacity={ap}>
      {Array.from({ length: n }, (_, i) => {
        const a = (-150 + rnd(i + 1) * 300) * (Math.PI / 180);
        const l = (40 + rnd(i + 11) * 90) * s * (0.5 + 0.5 * Math.sin((f + i * 7) / 5));
        return (
          <line key={i} x1={x} y1={y}
            x2={x + Math.cos(a) * l} y2={y + Math.sin(a) * l}
            stroke={i % 3 === 0 ? KRP.yellow : BP.spark}
            strokeWidth={6} strokeLinecap="round" />
        );
      })}
      <circle cx={x} cy={y} r={16 * s} fill={KRP.yellow} opacity={0.85} />
    </g>
  );
};

// ===================================================================
// かご — 人が乗る箱
// ===================================================================
/**
 * かご (正面から)。木枠 + 真鍮の帯 + 扉 + 天井灯 + 上の枠組 (吊り枠)。
 * door: 0 = 閉 / 1 = 全開 (左右に引き分ける)
 * children は かごの中 (床の上) に置かれる。局所座標の原点はかごの床の中央。
 */
export const Car: React.FC<{
  x: number; y: number; w?: number; h?: number; f?: number;
  door?: number; lamp?: boolean; sling?: boolean; indicator?: number;
  cage?: boolean; children?: React.ReactNode;
}> = ({
  x, y, w = 300, h = 380, f = 0, door = 0, lamp = true,
  sling = true, indicator, cage = false, children,
}) => {
  const hw = w / 2;
  const dOpen = clamp01(door) * (hw - 26);
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 吊り枠 (かごを抱える鉄の枠) */}
      {sling && (
        <g>
          <rect x={-hw - 26} y={-h - 54} width={w + 52} height={30} rx={6}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5.5} />
          <rect x={-hw - 26} y={-h - 24} width={22} height={h + 48}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          <rect x={hw + 4} y={-h - 24} width={22} height={h + 48}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          <rect x={-hw - 26} y={y === 0 ? 24 : 24} width={w + 52} height={26} rx={6}
            fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5.5} />
          <Rivets x1={-hw - 15} y1={-h - 39} x2={hw + 15} y2={-h - 39} n={9} r={6} />
          <Rivets x1={-hw - 15} y1={37} x2={hw + 15} y2={37} n={9} r={6} />
        </g>
      )}
      {/* 床 */}
      <rect x={-hw - 6} y={0} width={w + 12} height={26} rx={4}
        fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 箱の中 (奥の壁) */}
      <rect x={-hw} y={-h} width={w} height={h} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
      <rect x={-hw + 14} y={-h + 14} width={w - 28} height={h - 28}
        fill={BP.woodLight} stroke={BP.woodDark} strokeWidth={4} />
      {/* 羽目板 */}
      <g stroke={BP.woodDark} strokeWidth={3.5} opacity={0.8}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={-hw + 14 + ((w - 28) / 5) * (i + 1)} y1={-h + 14}
            x2={-hw + 14 + ((w - 28) / 5) * (i + 1)} y2={-14} />
        ))}
      </g>
      {/* 真鍮の腰帯 */}
      <rect x={-hw + 8} y={-h * 0.4} width={w - 16} height={14}
        fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
      <rect x={-hw + 8} y={-h + 34} width={w - 16} height={10}
        fill={BP.brassLight} stroke={KRP.ink} strokeWidth={3.5} />
      {/* 中に乗る物 (床の上) */}
      <g>{children}</g>
      {/* 鳥籠格子 (初期のかご) */}
      {cage && (
        <g stroke={BP.steelDark} strokeWidth={4} opacity={0.85}>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`a${i}`} x1={-hw + 10 + i * ((w - 20) / 8)} y1={-h + 10}
              x2={-hw + 10 + i * ((w - 20) / 8)} y2={-6} />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <line key={`b${i}`} x1={-hw + 10} y1={-h + 10 + i * (h / 4)}
              x2={hw - 10} y2={-h + 10 + i * (h / 4)} />
          ))}
        </g>
      )}
      {/* 扉 (左右に引き分け) */}
      <g>
        <rect x={-hw + 10 - dOpen} y={-h + 48} width={hw - 20} height={h - 62}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={5.5} opacity={0.96} />
        <rect x={10 + dOpen} y={-h + 48} width={hw - 20} height={h - 62}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={5.5} opacity={0.96} />
        {/* 扉の小窓と把手 */}
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <rect x={sg === -1 ? -hw + 32 - dOpen : 32 + dOpen} y={-h + 72}
              width={hw - 64} height={h * 0.3} rx={8}
              fill={BP.glass} stroke={KRP.ink} strokeWidth={4.5} opacity={0.75} />
            <rect x={(sg === -1 ? -14 - dOpen : 4 + dOpen)} y={-h * 0.46}
              width={10} height={56} rx={5}
              fill={BP.brassLight} stroke={KRP.ink} strokeWidth={3.5} />
          </g>
        ))}
      </g>
      {/* 天井灯 */}
      {lamp && (
        <g>
          <line x1={0} y1={-h + 6} x2={0} y2={-h + 30} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-h + 44} r={18} fill={BP.lamp} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={0} cy={-h + 44} r={32} fill={BP.lampGlow}
            opacity={0.3 + 0.1 * Math.sin(f / 9)} />
        </g>
      )}
      {/* 階数の針 (扉の上) */}
      {indicator !== undefined && (
        <g transform={`translate(0 ${-h - 4})`}>
          <path d="M -72 0 A 72 72 0 0 1 72 0 Z" fill={BP.paper} stroke={KRP.ink} strokeWidth={5} />
          <g stroke={KRP.ink} strokeWidth={3.5}>
            {Array.from({ length: 7 }, (_, i) => {
              const a = Math.PI + (i / 6) * Math.PI;
              return (
                <line key={i} x1={Math.cos(a) * 60} y1={Math.sin(a) * 60}
                  x2={Math.cos(a) * 48} y2={Math.sin(a) * 48} />
              );
            })}
          </g>
          <line x1={0} y1={0}
            x2={Math.cos(Math.PI + clamp01(indicator) * Math.PI) * 52}
            y2={Math.sin(Math.PI + clamp01(indicator) * Math.PI) * 52}
            stroke={KRP.red} strokeWidth={6} strokeLinecap="round" />
          <circle cx={0} cy={0} r={8} fill={KRP.ink} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// つり合いおもり
// ===================================================================
/** つり合いおもり。鋳物板を枠に積んである。plates で枚数 */
export const Counterweight: React.FC<{
  x: number; y: number; w?: number; h?: number; plates?: number; shoe?: boolean;
}> = ({ x, y, w = 140, h = 300, plates = 8, shoe = true }) => {
  const hw = w / 2;
  const ph = (h - 36) / plates;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 枠 */}
      <rect x={-hw - 14} y={-h - 26} width={w + 28} height={26} rx={5}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5.5} />
      <rect x={-hw - 14} y={-h} width={16} height={h} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <rect x={hw - 2} y={-h} width={16} height={h} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <rect x={-hw - 14} y={0} width={w + 28} height={22} rx={5}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 鋳物の板 */}
      {Array.from({ length: plates }, (_, i) => (
        <g key={i}>
          <rect x={-hw + 2} y={-h + 18 + i * ph} width={w - 4} height={ph - 4}
            fill={i % 2 ? BP.iron : BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
          <line x1={-hw + 14} y1={-h + 18 + i * ph + ph * 0.5}
            x2={hw - 14} y2={-h + 18 + i * ph + ph * 0.5}
            stroke={BP.steelDark} strokeWidth={3} opacity={0.6} />
        </g>
      ))}
      {/* 締めボルト (枠を貫く) */}
      <HexBolt x={0} y={-h - 13} r={11} />
      <HexBolt x={0} y={11} r={11} />
      {/* ガイドシュー */}
      {shoe && (
        <g>
          <rect x={-hw - 34} y={-h + 20} width={22} height={54} rx={5}
            fill={BP.grease} stroke={KRP.ink} strokeWidth={4.5} />
          <rect x={hw + 12} y={-h + 20} width={22} height={54} rx={5}
            fill={BP.grease} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 縦穴 (Shaft) — #69/#87/#88/#89/#101/#105/#106/#110 の骨格
// ===================================================================
/**
 * ビルの縦穴。かごとおもりがロープで繋がり、上の綱車に掛かっている。
 * carT: 0 = 最下階 / 1 = 最上階。おもりは自動で反対に動く (cwT 指定で上書き)。
 * 外枠 (x,y) は縦穴の左上。h は縦穴の高さ。
 */
export const Shaft: React.FC<{
  x: number; y: number; w: number; h: number; f?: number;
  carT?: number; cwT?: number; floors?: number;
  showCw?: boolean; showRail?: boolean; showMachine?: boolean;
  carW?: number; carH?: number; cut?: boolean; dim?: number;
  floorLabels?: boolean; carChildren?: React.ReactNode; door?: number;
}> = ({
  x, y, w, h, f = 0, carT = 0.4, cwT, floors = 8,
  showCw = true, showRail = true, showMachine = true,
  carW, carH, cut = false, dim = 1, floorLabels = false, carChildren, door = 0,
}) => {
  const cW = carW ?? Math.min(w * 0.46, 300);
  const cH = carH ?? Math.min(h * 0.17, 300);
  const cwW = cW * 0.42;
  const cwH = cH * 0.78;
  const topInner = y + 36;
  const botInner = y + h - 28;
  // かごの床の y (0=下 1=上)
  const carFloorY = lerp(botInner, topInner + cH, clamp01(carT));
  const cwFloorY = lerp(topInner + cwH, botInner, clamp01(cwT ?? carT));
  const carCx = x + w * 0.34;
  const cwCx = x + w * 0.78;
  const sheaveY = y - 96;
  const sheaveR = Math.min(w * 0.16, 96);
  const sheaveCx = (carCx + cwCx) / 2;
  return (
    <g opacity={dim}>
      {/* 縦穴の壁 */}
      <rect x={x} y={y} width={w} height={h} fill={BP.shaftDeep} stroke={KRP.ink} strokeWidth={7} />
      <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill={BP.shaft} opacity={0.22} />
      {/* 壁の縦目地 */}
      <g stroke={BP.shaftDark} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={x + ((i + 1) * w) / 6} y1={y + 12} x2={x + ((i + 1) * w) / 6} y2={y + h - 12} />
        ))}
      </g>
      {/* 階の床スラブ */}
      <g>
        {Array.from({ length: floors }, (_, i) => {
          const fy = lerp(botInner, topInner, (i + 1) / (floors + 1));
          return (
            <g key={i}>
              <rect x={x - 6} y={fy} width={w + 12} height={16}
                fill={BP.slab} stroke={KRP.ink} strokeWidth={4.5} />
              {floorLabels && (
                <text x={x + 22} y={fy - 10} fontFamily={FONT} fontWeight={800}
                  fontSize={26} fill={KRP.white} opacity={0.9}>{floors - i}F</text>
              )}
            </g>
          );
        })}
      </g>
      {/* 案内レール */}
      {showRail && (
        <>
          <GuideRail x={carCx - cW * 0.72} y1={topInner} y2={botInner} w={20} opacity={0.9} />
          <GuideRail x={carCx + cW * 0.72} y1={topInner} y2={botInner} w={20} opacity={0.9} />
          {showCw && (
            <>
              <GuideRail x={cwCx - cwW * 0.9} y1={topInner} y2={botInner} w={14} opacity={0.8} />
              <GuideRail x={cwCx + cwW * 0.9} y1={topInner} y2={botInner} w={14} opacity={0.8} />
            </>
          )}
        </>
      )}
      {/* 機械室と綱車 */}
      {showMachine && (
        <g>
          <rect x={x - 18} y={sheaveY - sheaveR - 150} width={w + 36} height={sheaveR * 2 + 150}
            fill={BP.shaft} stroke={KRP.ink} strokeWidth={7} />
          <g stroke={BP.shaftDark} strokeWidth={3} opacity={0.5}>
            {Array.from({ length: 4 }, (_, i) => (
              <line key={i} x1={x - 18} y1={sheaveY - sheaveR - 150 + (i + 1) * 36}
                x2={x + w + 18} y2={sheaveY - sheaveR - 150 + (i + 1) * 36} />
            ))}
          </g>
          <rect x={x - 18} y={y - 18} width={w + 36} height={22}
            fill={BP.slabDark} stroke={KRP.ink} strokeWidth={5} />
          <Sheave x={sheaveCx} y={sheaveY} r={sheaveR} rot={f * 2.2} bracket />
        </g>
      )}
      {/* ロープ: かご → 綱車 → おもり */}
      {!cut && (
        <g>
          <Rope x1={carCx} y1={carFloorY - cH - 54} x2={sheaveCx - sheaveR * 0.82} y2={sheaveY}
            w={12} kind="wire" f={f} />
          <Rope x1={sheaveCx - sheaveR * 0.82} y1={sheaveY} x2={sheaveCx + sheaveR * 0.82} y2={sheaveY}
            w={12} kind="wire" f={f} opacity={0.45} />
          {showCw && (
            <Rope x1={sheaveCx + sheaveR * 0.82} y1={sheaveY} x2={cwCx} y2={cwFloorY - cwH - 26}
              w={12} kind="wire" f={f} />
          )}
        </g>
      )}
      {/* かご */}
      <Car x={carCx} y={carFloorY} w={cW} h={cH} f={f} door={door} sling
        lamp>{carChildren}</Car>
      {/* おもり */}
      {showCw && <Counterweight x={cwCx} y={cwFloorY} w={cwW} h={cwH} plates={7} />}
    </g>
  );
};

// ===================================================================
// てんびん (1章 #46 の竿秤を装置として作り直したもの)
// ===================================================================
/**
 * 竿秤。tilt は竿の傾き (度)。左が重ければ負、右が重ければ正。
 * left / right は皿の上に置く物 (局所座標の原点 = 皿の中央・上面)。
 */
export const Balance: React.FC<{
  x: number; y: number; s?: number; f?: number; tilt?: number;
  span?: number; drop?: number; leftNode?: React.ReactNode; rightNode?: React.ReactNode;
  pivotMark?: boolean;
  /** 皿を水平に保つ (本物の天秤と同じ。竿だけ傾き、皿は鎖で吊られて水平のまま下がる) */
  panLevel?: boolean;
}> = ({
  x, y, s = 1, f = 0, tilt = 0, span = 760, drop = 300,
  leftNode, rightNode, pivotMark = false, panLevel = false,
}) => {
  const hs = span / 2;
  const sway = Math.sin(f / 23) * 0.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 柱 */}
      <rect x={-38} y={0} width={76} height={drop + 300} fill={BP.wood} stroke={KRP.ink} strokeWidth={7} />
      <g stroke={BP.woodDark} strokeWidth={6}>
        <line x1={-38} y1={130} x2={38} y2={130} />
        <line x1={-38} y1={290} x2={38} y2={290} />
        <line x1={-38} y1={450} x2={38} y2={450} />
      </g>
      {/* 石の台 */}
      <rect x={-104} y={drop + 262} width={208} height={48} fill={BP.slab} stroke={KRP.ink} strokeWidth={6} />
      {/* 支点 */}
      <polygon points="0,-34 42,22 -42,22" fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
      <circle cx={0} cy={-34} r={13} fill={BP.brass} stroke={KRP.ink} strokeWidth={4.5} />
      {/* 竿 */}
      <g transform={`rotate(${tilt + sway} 0 -34)`}>
        <rect x={-hs} y={-50} width={span} height={30} rx={9}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={7} />
        <Rivets x1={-hs + 40} y1={-35} x2={hs - 40} y2={-35} n={13} r={6} />
        {/* 吊り鎖 + 皿 + 皿に乗る物 (panLevel のときは竿の傾きを打ち消して水平に吊る) */}
        {[-1, 1].map((sg) => (
          <g key={sg}
            transform={`translate(${sg * (hs - 56)} -20) rotate(${panLevel ? -(tilt + sway) : 0})`}>
            <g stroke={KRP.ink} strokeWidth={5}>
              <line x1={0} y1={0} x2={0} y2={drop - 40} />
              <line x1={0} y1={drop - 40} x2={-128} y2={drop + 4} />
              <line x1={0} y1={drop - 40} x2={128} y2={drop + 4} />
            </g>
            <rect x={-144} y={drop + 2} width={288} height={24} rx={7}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
            <g transform={`translate(0 ${drop + 2})`}>{sg < 0 ? leftNode : rightNode}</g>
          </g>
        ))}
      </g>
      {/* つり合いの印 */}
      {pivotMark && (
        <g>
          <line x1={0} y1={-130} x2={0} y2={-56} stroke={KRP.red} strokeWidth={6} />
          <circle cx={0} cy={-142} r={13} fill={KRP.red} stroke={KRP.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

// ===================================================================
// ○ と × の対比札
// ===================================================================
/** 大きな○ (できる) */
export const Maru: React.FC<{
  x: number; y: number; s?: number; t?: number; color?: string; stroke?: number;
}> = ({ x, y, s = 1, t = 1, color = KRP.green, stroke = 18 }) => {
  const sc = pop(clamp01(t)) * s;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <circle cx={0} cy={0} r={72} fill="none" stroke={KRP.ink} strokeWidth={stroke + 6} opacity={0.3} />
      <circle cx={0} cy={0} r={72} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    </g>
  );
};

/**
 * ○×の対比台。左右に1つずつ物を置き、下に札、上に○か×を置く。
 * children は使わず node で渡す (svg なので位置を持たせるため)。
 */
export const MaruBatsu: React.FC<{
  x: number; y: number; s?: number; t?: number;
  leftNode?: React.ReactNode; rightNode?: React.ReactNode;
  leftText?: string; rightText?: string;
  leftMark?: "maru" | "batsu" | "none"; rightMark?: "maru" | "batsu" | "none";
  gap?: number; labelSize?: number;
}> = ({
  x, y, s = 1, t = 1, leftNode, rightNode, leftText, rightText,
  leftMark = "batsu", rightMark = "maru", gap = 620, labelSize = 36,
}) => {
  const ap = clamp01(t);
  const half = gap / 2;
  const Mark: React.FC<{ kind: string; mx: number }> = ({ kind, mx }) =>
    kind === "maru" ? <Maru x={mx} y={-320} s={1} t={ap} /> :
      kind === "batsu" ? (
        <g transform={`translate(${mx} -320) scale(${pop(ap)})`} stroke={KRP.red}
          strokeWidth={20} strokeLinecap="round">
          <line x1={-66} y1={-66} x2={66} y2={66} />
          <line x1={66} y1={-66} x2={-66} y2={66} />
        </g>
      ) : null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 真ん中の仕切り線 */}
      <line x1={0} y1={-420} x2={0} y2={60} stroke={KRP.ink} strokeWidth={6}
        strokeDasharray="18 14" opacity={0.6} />
      {/* 台 */}
      {[-1, 1].map((sg) => (
        <rect key={sg} x={sg * half - 230} y={0} width={460} height={22} rx={6}
          fill={BP.slabDark} stroke={KRP.ink} strokeWidth={6} />
      ))}
      <g transform={`translate(${-half} 0)`}>{leftNode}</g>
      <g transform={`translate(${half} 0)`}>{rightNode}</g>
      <Mark kind={leftMark} mx={-half} />
      <Mark kind={rightMark} mx={half} />
      {/* 札 (下端が 830 を超えないように、呼ぶ側で y を決める) */}
      {leftText && (
        <g transform={`translate(${-half} 86) scale(${pop(ap)})`}>
          <rect x={-(leftText.length * labelSize + 40) / 2} y={-labelSize * 0.85}
            width={leftText.length * labelSize + 40} height={labelSize * 1.7} rx={10}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <text x={0} y={labelSize * 0.38} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={labelSize} fill={KRP.ink}>{leftText}</text>
        </g>
      )}
      {rightText && (
        <g transform={`translate(${half} 86) scale(${pop(ap)})`}>
          <rect x={-(rightText.length * labelSize + 40) / 2} y={-labelSize * 0.85}
            width={rightText.length * labelSize + 40} height={labelSize * 1.7} rx={10}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <text x={0} y={labelSize * 0.38} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={labelSize} fill={KRP.ink}>{rightText}</text>
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 速度のグラフ (#103)
// ===================================================================
/**
 * 速度カーブ。mode="angular" は角ばった台形 (昔)、"smooth" は S字 (いま)。
 * 下地は方眼。走る点が時間を示す。
 */
export const SpeedGraph: React.FC<{
  x: number; y: number; w?: number; h?: number; f?: number;
  mode?: "angular" | "smooth" | "both"; t?: number;
  xLabel?: string; yLabel?: string;
}> = ({
  x, y, w = 1100, h = 520, f = 0, mode = "smooth", t = 1,
  xLabel = "時間", yLabel = "速さ",
}) => {
  const ap = clamp01(t);
  const ang = (u: number) => {
    // 台形: 0→0.2 直線で立ち上がり、0.2→0.8 一定、0.8→1 直線で落ちる
    if (u < 0.2) return u / 0.2;
    if (u < 0.8) return 1;
    return (1 - u) / 0.2;
  };
  const smo = (u: number) => {
    const s = (v: number) => v * v * (3 - 2 * v);
    if (u < 0.3) return s(u / 0.3);
    if (u < 0.7) return 1;
    return s((1 - u) / 0.3);
  };
  const path = (fn: (u: number) => number) =>
    Array.from({ length: 81 }, (_, i) => {
      const u = i / 80;
      return `${i === 0 ? "M" : "L"} ${(x + u * w).toFixed(1)} ${(y - fn(u) * h).toFixed(1)}`;
    }).join(" ");
  const u0 = (f % 90) / 90;
  return (
    <g>
      {/* 方眼 */}
      <g stroke={BP.shaftDark} strokeWidth={2.5} opacity={0.35}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={x + (w / 10) * i} y1={y} x2={x + (w / 10) * i} y2={y - h} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1={x} y1={y - (h / 5) * i} x2={x + w} y2={y - (h / 5) * i} />
        ))}
      </g>
      {/* 軸 */}
      <g stroke={KRP.ink} strokeWidth={7} strokeLinecap="round">
        <line x1={x} y1={y} x2={x + w + 40} y2={y} />
        <line x1={x} y1={y} x2={x} y2={y - h - 40} />
      </g>
      <polygon points={`${x + w + 40},${y} ${x + w + 14},${y - 13} ${x + w + 14},${y + 13}`}
        fill={KRP.ink} />
      <polygon points={`${x},${y - h - 40} ${x - 13},${y - h - 14} ${x + 13},${y - h - 14}`}
        fill={KRP.ink} />
      <text x={x + w + 22} y={y + 54} fontFamily={FONT} fontWeight={800} fontSize={34}
        fill={KRP.ink} textAnchor="middle">{xLabel}</text>
      <text x={x - 24} y={y - h - 54} fontFamily={FONT} fontWeight={800} fontSize={34}
        fill={KRP.ink} textAnchor="middle">{yLabel}</text>
      {/* 曲線 */}
      {(mode === "angular" || mode === "both") && (
        <path d={path(ang)} fill="none" stroke={BP.steelDark} strokeWidth={10}
          strokeLinejoin="miter" opacity={mode === "both" ? 0.45 : 1}
          strokeDasharray={mode === "both" ? "20 14" : undefined} />
      )}
      {(mode === "smooth" || mode === "both") && (
        <path d={path(smo)} fill="none" stroke={KRP.red} strokeWidth={12}
          strokeLinecap="round" strokeLinejoin="round" opacity={ap} />
      )}
      {/* 走る点 */}
      <g opacity={ap}>
        <circle cx={x + u0 * w}
          cy={y - (mode === "angular" ? ang(u0) : smo(u0)) * h}
          r={18} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5} />
      </g>
    </g>
  );
};

// ===================================================================
// 縦の数直線 (#68 など「何階」を測る図)
// ===================================================================
export const FloorScale: React.FC<{
  x: number; yTop: number; yBot: number; max?: number; marks?: number[];
  dashedFrom?: number; t?: number;
}> = ({ x, yTop, yBot, max = 30, marks = [], dashedFrom, t = 1 }) => {
  const ap = clamp01(t);
  const yOf = (n: number) => lerp(yBot, yTop, n / max);
  const dy = dashedFrom === undefined ? yTop : yOf(dashedFrom);
  return (
    <g>
      <line x1={x} y1={yBot} x2={x} y2={dy} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      {dashedFrom !== undefined && (
        <line x1={x} y1={dy} x2={x} y2={yTop} stroke={KRP.ink} strokeWidth={7}
          strokeDasharray="20 18" opacity={0.55} />
      )}
      <g opacity={ap}>
        {marks.map((m) => (
          <g key={m}>
            <line x1={x - 34} y1={yOf(m)} x2={x + 34} y2={yOf(m)}
              stroke={KRP.ink} strokeWidth={6} />
            <text x={x - 52} y={yOf(m) + 13} textAnchor="end" fontFamily={FONT}
              fontWeight={800} fontSize={38} fill={KRP.ink}>{m}階</text>
          </g>
        ))}
      </g>
    </g>
  );
};

// ===================================================================
// 力の矢印 (太い・手描き風)
// ===================================================================
export const ForceArrow: React.FC<{
  x: number; y: number; len?: number; rot?: number; w?: number;
  color?: string; t?: number; label?: string; labelSize?: number;
}> = ({ x, y, len = 220, rot = 0, w = 22, color = KRP.red, t = 1, label, labelSize = 32 }) => {
  const ap = easeOut(clamp01(t));
  if (ap <= 0) return null;
  const L = len * ap;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={0} y={-w / 2} width={Math.max(0, L - w * 1.6)} height={w} rx={w * 0.3}
        fill={color} stroke={KRP.ink} strokeWidth={4.5} />
      <polygon points={`${L},0 ${L - w * 1.9},${-w * 1.35} ${L - w * 1.9},${w * 1.35}`}
        fill={color} stroke={KRP.ink} strokeWidth={4.5} />
      {label && (
        <g transform={`translate(${L * 0.5} ${-w * 1.7}) rotate(${-rot})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={labelSize} fill={color} stroke={KRP.white} strokeWidth={6}
            paintOrder="stroke">{label}</text>
        </g>
      )}
    </g>
  );
};

// ===================================================================
// 押しボタンの盤 (#100/#101)
// ===================================================================
export const ButtonPanel: React.FC<{
  x: number; y: number; s?: number; rows?: number; cols?: number;
  lit?: number; f?: number;
}> = ({ x, y, s = 1, rows = 5, cols = 2, lit = -1, f = 0 }) => {
  const pitch = 96;
  const pw = cols * pitch + 56;
  const ph = rows * pitch + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-pw / 2} y={-ph / 2} width={pw} height={ph} rx={16}
        fill={BP.brass} stroke={KRP.ink} strokeWidth={7} />
      <rect x={-pw / 2 + 12} y={-ph / 2 + 12} width={pw - 24} height={ph - 24} rx={10}
        fill={BP.brassDark} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const bx = -((cols - 1) * pitch) / 2 + c * pitch;
        const by = -((rows - 1) * pitch) / 2 + r * pitch;
        const on = i === lit;
        return (
          <g key={i}>
            <circle cx={bx} cy={by} r={34} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={bx} cy={by} r={27}
              fill={on ? KRP.yellow : BP.brassLight} stroke={KRP.ink} strokeWidth={4} />
            {on && (
              <circle cx={bx} cy={by} r={46} fill={KRP.yellow}
                opacity={0.25 + 0.12 * Math.sin(f / 7)} />
            )}
            <text x={bx} y={by + 11} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={28} fill={KRP.ink}>{rows * cols - i}</text>
          </g>
        );
      })}
      {/* 取り付けねじ */}
      <HexBolt x={-pw / 2 + 22} y={-ph / 2 + 22} r={9} />
      <HexBolt x={pw / 2 - 22} y={-ph / 2 + 22} r={9} />
      <HexBolt x={-pw / 2 + 22} y={ph / 2 - 22} r={9} />
      <HexBolt x={pw / 2 - 22} y={ph / 2 - 22} r={9} />
    </g>
  );
};

// ===================================================================
// 運転レバー (#98)
// ===================================================================
export const Lever: React.FC<{
  x: number; y: number; s?: number; angle?: number; f?: number;
}> = ({ x, y, s = 1, angle = 0, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* 台座 */}
    <path d="M -130 0 Q -140 -74 -96 -86 L 96 -86 Q 140 -74 130 0 Z"
      fill={BP.brass} stroke={KRP.ink} strokeWidth={7} />
    <g stroke={BP.brassDark} strokeWidth={5} opacity={0.75}>
      <line x1={-104} y1={-42} x2={104} y2={-42} />
    </g>
    {/* 目盛り */}
    <g stroke={KRP.ink} strokeWidth={4}>
      {[-40, -20, 0, 20, 40].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line key={a} x1={Math.sin(r) * 112} y1={-86 - Math.cos(r) * 112 + 86}
            x2={Math.sin(r) * 96} y2={-86 - Math.cos(r) * 96 + 86} />
        );
      })}
    </g>
    {/* レバー本体 */}
    <g transform={`rotate(${angle})`}>
      <rect x={-13} y={-240} width={26} height={250} rx={12}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={0} cy={-252} rx={44} ry={38} fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
      <ellipse cx={-12} cy={-262} rx={14} ry={10} fill={KRP.white} opacity={0.35} />
      <rect x={-20} y={-212} width={40} height={16} rx={6}
        fill={BP.brassLight} stroke={KRP.ink} strokeWidth={4} />
    </g>
    {/* 軸 */}
    <circle cx={0} cy={0} r={22} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
    <HexBolt x={0} y={0} r={10} rot={f * 0.4} />
  </g>
);

// ===================================================================
// 札を「→」で繋ぐ図 (#80「壊れたら→止まる」など)
// ===================================================================
export const FlowPlates: React.FC<{
  x: number; y: number; items: string[]; size?: number; gap?: number;
  t?: number; color?: string; f?: number;
}> = ({ x, y, items, size = 52, gap = 120, t = 1, color = KRP.ink, f = 0 }) => {
  const widths = items.map((s) => s.length * size + 56);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let cx = x - total / 2;
  const nodes: React.ReactNode[] = [];
  items.forEach((s, i) => {
    const w = widths[i];
    const ap = clamp01(seg(t * 60, i * 10, i * 10 + 14));
    const sc = pop(ap);
    nodes.push(
      <g key={`p${i}`} transform={`translate(${cx + w / 2} ${y}) scale(${sc})`}>
        <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={12}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
        <text x={0} y={size * 0.4} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={size} fill={color}>{s}</text>
      </g>,
    );
    if (i < items.length - 1) {
      const ax = cx + w + 12;
      const aap = clamp01(seg(t * 60, i * 10 + 8, i * 10 + 20));
      nodes.push(
        <ForceArrow key={`a${i}`} x={ax} y={y} len={gap - 24} w={20}
          color={KRP.red} t={aap} />,
      );
    }
    cx += w + gap;
  });
  return <g>{nodes}{f >= 0 ? null : null}</g>;
};
