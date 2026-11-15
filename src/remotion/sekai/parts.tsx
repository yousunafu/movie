// 作風 sekai (つながる世界史) の共通部品。
// 核は5つ: ①墨の背景に生成りの線画 ②強い色は錆朱だけ ③右上に縦書きの年号札
// ④描けない人物は灰色の無貌シルエット+名札 ⑤語りは姿のない天の声、反応だけ通知カードで出る

import React from "react";
import { useCurrentFrame } from "remotion";
import { wrapJa } from "../wrapJa";

export const SKP = {
  sumi: "#221D19", // 墨 (背景)
  sumiDeep: "#15110E", // さらに奥 (周辺減光・帯)
  kinari: "#EFE7D6", // 生成り (線・文字)
  kinariDim: "#C9BEA8", // 一段落とした生成り (奥の線)
  sabi: "#B23A2E", // 錆朱 (唯一の強い色)
  sabiDeep: "#7E2820",
  kohaku: "#C98A3C", // 琥珀 (補助)
  hai: "#8A8078", // 灰 (描けない人物)
  haiDark: "#5C554F",
  paper: "#EFE7D6",
} as const;

export const SEKAI_FONT =
  "'Noto Sans JP', 'Noto Sans CJK JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif";
export const SEKAI_SERIF =
  "'Noto Serif JP', 'Noto Serif CJK JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif";

export const W = 1920;
export const H = 1080;

export const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
export const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);
export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);

// ===== ①墨の背景 =====
// 紙地に図を浮かせない (6点法②)。縦の罫と周辺減光で奥行きを作る。
export const SekaiGround: React.FC<{ f?: number; rule?: boolean }> = ({
  f = 0,
  rule = true,
}) => {
  const drift = Math.sin(f / 90) * 6;
  return (
    <>
      <rect x={0} y={0} width={W} height={H} fill={SKP.sumi} />
      {rule && (
        <g opacity={0.055}>
          {Array.from({ length: 25 }, (_, i) => (
            <line
              key={i}
              x1={i * 80 + drift}
              y1={0}
              x2={i * 80 + drift}
              y2={H}
              stroke={SKP.kinari}
              strokeWidth={1.4}
            />
          ))}
        </g>
      )}
      <radialGradient id="sekai-vig" cx="50%" cy="44%" r="72%">
        <stop offset="55%" stopColor={SKP.sumiDeep} stopOpacity={0} />
        <stop offset="100%" stopColor={SKP.sumiDeep} stopOpacity={0.88} />
      </radialGradient>
      <rect x={0} y={0} width={W} height={H} fill="url(#sekai-vig)" />
    </>
  );
};

// ===== カメラ =====
// 1枚の中で引き→寄りができるようにする (6点法④)。
export const Cam: React.FC<{
  f: number;
  from: [number, number, number]; // [x, y, scale]
  to: [number, number, number];
  start?: number;
  end?: number;
  children: React.ReactNode;
}> = ({ f, from, to, start = 0, end = 120, children }) => {
  const t = easeInOut(seg(f, start, end));
  const x = from[0] + (to[0] - from[0]) * t;
  const y = from[1] + (to[1] - from[1]) * t;
  const s = from[2] + (to[2] - from[2]) * t;
  return (
    <g transform={`translate(${W / 2} ${H / 2}) scale(${s}) translate(${-W / 2 + x} ${-H / 2 + y})`}>
      {children}
    </g>
  );
};

// ===== ③縦書きの年号札 =====
// 「いまどの時代の話か」を画面から消さない。右上に貼る。
export const YearTag: React.FC<{
  year: string;
  place?: string;
  f?: number;
  x?: number;
  y?: number;
}> = ({ year, place, f = 0, x = W - 150, y = 70 }) => {
  const t = easeOut(seg(f, 4, 22));
  const chars = year.split("");
  const hgt = chars.length * 46 + (place ? 58 : 0) + 38;
  return (
    <g transform={`translate(${x} ${y})`} opacity={t}>
      <rect
        x={-44}
        y={-8 + (1 - t) * 14}
        width={88}
        height={hgt}
        rx={4}
        fill={SKP.kinari}
        opacity={0.94}
      />
      <rect x={-44} y={-8 + (1 - t) * 14} width={6} height={hgt} fill={SKP.sabi} />
      {chars.map((c, i) => (
        <text
          key={i}
          x={4}
          y={38 + i * 46 + (1 - t) * 14}
          fontFamily={SEKAI_SERIF}
          fontSize={40}
          fontWeight={700}
          fill={SKP.sumi}
          textAnchor="middle"
        >
          {c}
        </text>
      ))}
      {place && (
        <text
          x={4}
          y={38 + chars.length * 46 + 26 + (1 - t) * 14}
          fontFamily={SEKAI_SERIF}
          fontSize={26}
          fill={SKP.sabiDeep}
          textAnchor="middle"
        >
          {place}
        </text>
      )}
    </g>
  );
};

// ===== ④描けない人物 =====
// 預言者の孫・昭和天皇・現役の最高指導者など、顔を描くべきでない人物は
// 灰色の無貌シルエットに名札だけ添える。あいまいにごまかすのではなく、
// 「描かないと決めた」ことが見て分かる形にする。
export const GhostFigure: React.FC<{
  x: number;
  y: number;
  s?: number;
  name?: string;
  f?: number;
}> = ({ x, y, s = 1, name, f = 0 }) => {
  const t = easeOut(seg(f, 0, 26));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.3 + t * 0.7}>
      <path
        d="M 0,-150 C 36,-150 52,-120 52,-92 C 52,-66 34,-44 0,-44
           C -34,-44 -52,-66 -52,-92 C -52,-120 -36,-150 0,-150 Z"
        fill={SKP.hai}
      />
      <path
        d="M -96,150 C -96,62 -46,-34 0,-34 C 46,-34 96,62 96,150 Z"
        fill={SKP.haiDark}
      />
      <path
        d="M -96,150 C -96,62 -46,-34 0,-34 C 46,-34 96,62 96,150 Z"
        fill="none"
        stroke={SKP.hai}
        strokeWidth={2.4}
      />
      {name && (
        <>
          <rect x={-104} y={164} width={208} height={48} rx={3} fill={SKP.kinari} />
          <rect x={-104} y={164} width={208} height={4} fill={SKP.sabi} />
          <text
            x={0}
            y={198}
            fontFamily={SEKAI_SERIF}
            fontSize={28}
            fontWeight={700}
            fill={SKP.sumi}
            textAnchor="middle"
          >
            {name}
          </text>
        </>
      )}
    </g>
  );
};

// ===== ②錆朱の見出し札 =====
export const SekaiLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  f?: number;
  accent?: boolean;
}> = ({ x, y, text, size = 34, f = 0, accent }) => {
  const t = easeOut(seg(f, 2, 20));
  const w = text.length * size * 0.96 + 36;
  return (
    <g transform={`translate(${x} ${y})`} opacity={t}>
      <rect
        x={-w / 2}
        y={-size * 0.86}
        width={w}
        height={size * 1.72}
        rx={3}
        fill={accent ? SKP.sabi : SKP.kinari}
      />
      <text
        x={0}
        y={size * 0.36}
        fontFamily={SEKAI_FONT}
        fontSize={size}
        fontWeight={700}
        fill={accent ? SKP.kinari : SKP.sumi}
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
};

// ===================================================================
// 反応役「新人記者」の顔
// ===================================================================
// キャラシート (tmp/char-sheet.html) で作者が確認した造形をそのまま持ち込む。
// パスの数値は作者が画面で見て選んだ結果なので、文字列のまま移して形を変えない。
// (JSXに描き直すと必ずどこかの制御点がずれるため、ここだけ生成した markup を流し込む)

const INK = "#2B221C";
const CR = 50,
  EY = 110,
  BY = 96,
  HL = 84;

// 中間の硬さ。キャラシートの H.mid と同じ値
const HM = {
  w: 43,
  chin: 156,
  eyeRx: 11.5,
  eyeRy: 9.2,
  iris: 7.2,
  lid: 3.6,
  browTh: 4.2,
  browLen: 13,
  browArch: 3.4,
  lw: 2.9,
  vol: 12,
};

// 墨の背景では髪が溶けるので、キャラシートの #5E4A3E より一段明るくする
const KISHA = {
  hair2: "#7A6250",
  skin: "#EACFB0",
  shad: "#D3B393",
  iris: "#4A3526",
};

export type Expr = "normal" | "think" | "surprise" | "sad";

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(v * k))),
  );
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
};

const facePath = (h: typeof HM) => {
  const w = h.w,
    ch = h.chin,
    m = EY + (ch - EY) * 0.6;
  return `M 100,${CR}
    C ${100 + w * 0.66},${CR} ${100 + w},${CR + 22} ${100 + w},${EY}
    C ${100 + w},${m} ${100 + w * 0.74},${ch} 100,${ch}
    C ${100 - w * 0.74},${ch} ${100 - w},${m} ${100 - w},${EY}
    C ${100 - w},${CR + 22} ${100 - w * 0.66},${CR} 100,${CR} Z`;
};

// 外周(頭のシルエット)→内周(生え際)の閉じたリング。これで頭頂が必ず髪で埋まる
const shell = (
  h: typeof HM,
  col: string,
  opt: { vol?: number; bot?: number; hl?: number; temple?: number; dip?: number } = {},
) => {
  const w = h.w,
    top = CR - (opt.vol ?? h.vol),
    bot = opt.bot ?? 118,
    hl = opt.hl ?? HL;
  const L = 100 - w - 3,
    R = 100 + w + 3,
    iL = 100 - w + 2,
    iR = 100 + w - 2;
  const tp = opt.temple ?? 6,
    dip = opt.dip ?? 2;
  return `<path d="M ${L},${bot}
     C ${L - 2},${top + 20} ${100 - w * 0.62},${top} 100,${top}
     C ${100 + w * 0.62},${top} ${R + 2},${top + 20} ${R},${bot}
     L ${iR},${bot}
     C ${iR - 2},${hl + 12} ${100 + w - 10},${hl - tp + 2} ${100 + w - 19},${hl - tp}
     C ${100 + 15},${hl + dip - 3} ${100 + 7},${hl + dip} 100,${hl + dip}
     C ${100 - 7},${hl + dip} ${100 - 15},${hl + dip - 3} ${100 - w + 19},${hl - tp}
     C ${100 - w + 10},${hl - tp + 2} ${iL + 2},${hl + 12} ${iL},${bot} Z" fill="${col}"/>`;
};

// 前髪。上はつながった一枚の塊で、下の輪郭だけを束に割る。
// 細い毛流れ線を引くと毛ではなくキズに見えるため、髪は必ず面で作る。
const fringe = (
  col: string,
  h: typeof HM,
  tips: [number, number][],
  opt: { valley?: number; side?: number; gap?: number } = {},
) => {
  const w = h.w,
    L = 100 - w + 1,
    R = 100 + w - 1;
  const val = opt.valley ?? 79;
  const side = opt.side ?? 74;
  const crown = CR - h.vol + 5;
  const gap = opt.gap ?? 5;
  let d = `M ${L},${side}`;
  let px = L;
  tips.forEach(([x, y]) => {
    const mid = (px + x) / 2;
    d += ` C ${mid},${side + 4} ${x - 5},${y - 16} ${x},${y}`;
    const nx = Math.min(x + gap, R);
    d += ` C ${x + 3},${y - 15} ${nx - 1},${val + 6} ${nx},${val}`;
    px = nx;
  });
  d += ` C ${(px + R) / 2},${val - 6} ${R},${side + 8} ${R},${side}`;
  d += ` C ${100 + w * 0.56},${crown} ${100 - w * 0.56},${crown} ${L},${side} Z`;
  return `<path d="${d}" fill="${col}"/>`;
};

// 切りっぱなしボブ + シースルーバング
const bobHair = (col: string, h: typeof HM) => {
  const w = h.w,
    lit = shade(col, 1.42);
  const ow = w + 9,
    by = h.chin + 3;
  return (
    `<path d="M ${100 - w - 2},62 C ${100 - ow - 2},${BY} ${100 - ow},${by - 20} ${100 - ow + 1},${by}
        L ${100 - w + 2},${by} L ${100 - w + 2},80 Z" fill="${col}"/>
     <path d="M ${100 + w + 2},62 C ${100 + ow + 2},${BY} ${100 + ow},${by - 20} ${100 + ow - 1},${by}
        L ${100 + w - 2},${by} L ${100 + w - 2},80 Z" fill="${col}"/>` +
    shell(h, col, { bot: 104, hl: 82, temple: 1, dip: 1 }) +
    // 毛先は必ず左から右へ並べる。右から左に並べるとパスが自己交差して、
    // 面であるはずの前髪が細い線の束 (＝キズ) に見える
    fringe(
      col,
      h,
      [
        [100 - w + 12, 93],
        [100 - 16, 96],
        [100 - 1, 97],
        [100 + 14, 96],
        [100 + w - 12, 93],
      ],
      { valley: 81, gap: 7, side: 72 },
    ) +
    `<path d="M ${100 - 23},70 C ${100 - 7},62 ${100 + 13},63 ${100 + 26},72"
        stroke="${lit}" stroke-width="3" fill="none" opacity="0.4" stroke-linecap="round"/>`
  );
};

const eyesM = (h: typeof HM, expr: Expr, uid: string) => {
  const k = { normal: 1, think: 0.92, surprise: 1.25, sad: 0.8 }[expr];
  const ry = h.eyeRy * k,
    rx = h.eyeRx;
  return [-22, 22]
    .map((dx, i) => {
      const x = 100 + dx,
        id = `${uid}-e${i}`;
      const cy = EY + (expr === "sad" ? 2 : 0);
      return `<clipPath id="${id}"><ellipse cx="${x}" cy="${EY}" rx="${rx}" ry="${ry}"/></clipPath>
      <ellipse cx="${x}" cy="${EY}" rx="${rx}" ry="${ry}" fill="#FAF6EE"/>
      <g clip-path="url(#${id})">
        <circle cx="${x}" cy="${cy}" r="${h.iris}" fill="${KISHA.iris}"/>
        <circle cx="${x}" cy="${cy}" r="${h.iris * 0.44}" fill="#19130F"/>
        <circle cx="${x + h.iris * 0.38}" cy="${cy - h.iris * 0.42}" r="${h.iris * 0.26}" fill="#fff"/>
        <path d="M ${x - rx - 2},${EY - ry} h ${rx * 2 + 4} v ${ry * 0.42} h -${rx * 2 + 4} Z"
              fill="${INK}" opacity="${expr === "sad" ? 0.3 : 0.14}"/>
      </g>
      <ellipse cx="${x}" cy="${EY}" rx="${rx}" ry="${ry}" fill="none" stroke="${INK}" stroke-width="${h.lw * 0.8}"/>
      <path d="M ${x - rx - 1},${EY - ry * 0.3} Q ${x},${EY - ry - h.lid * 0.5} ${x + rx + 1},${EY - ry * 0.3}"
            stroke="${INK}" stroke-width="${h.lid}" fill="none" stroke-linecap="round"/>`;
    })
    .join("");
};

const browsM = (h: typeof HM, expr: Expr) => {
  const col = shade(KISHA.hair2, 0.78);
  const dy = { normal: 0, think: -1, surprise: -6, sad: 2 }[expr];
  const inn = { normal: 0, think: 3, surprise: -2, sad: -5 }[expr];
  return [
    [-22, -1],
    [22, 1],
  ]
    .map(([dx, dir]) => {
      const x = 100 + dx,
        y = BY + dy,
        L = h.browLen;
      return `<path d="M ${x + L * dir},${y + 3} Q ${x},${y - h.browArch} ${x - L * dir},${y + inn}"
        stroke="${col}" stroke-width="${h.browTh}" fill="none" stroke-linecap="round"/>`;
    })
    .join("");
};

const noseM = (h: typeof HM) => {
  const y = h.chin - 28;
  return `<path d="M 102.5,${y - 11} L 99.5,${y} L 106,${y + 0.8}" fill="none" stroke="${KISHA.shad}"
     stroke-width="${h.lw * 0.92}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const mouthM = (h: typeof HM, expr: Expr) => {
  const y = h.chin - 14,
    lw = h.lw * 0.92;
  if (expr === "surprise")
    return `<ellipse cx="100" cy="${y + 1}" rx="5.6" ry="7.4" fill="#6B3A33"/>
      <ellipse cx="100" cy="${y + 1}" rx="5.6" ry="7.4" fill="none" stroke="${INK}" stroke-width="${lw * 0.8}"/>`;
  const d = {
    normal: `M 92,${y} Q 100,${y + 3.2} 108,${y}`,
    think: `M 92,${y + 1.6} Q 101,${y - 2.6} 110,${y + 0.8}`,
    sad: `M 92,${y + 2.6} Q 100,${y - 3} 108,${y + 2.6}`,
  }[expr];
  return `<path d="${d}" stroke="${INK}" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
};

// ジャケット
const clothM = (h: typeof HM) => {
  const y = h.chin + 16;
  return `<path d="M 0,240 C 6,206 36,186 74,${y} L 126,${y} C 164,206 194,240 200,240 Z" fill="#4A4952"/>
    <path d="M 76,${y} L 100,${y + 30} L 124,${y}" fill="${SKP.kinari}"/>
    <path d="M 79,${y + 2} L 100,${y + 30} L 94,240 L 65,240 Z" fill="#3D3C45"/>
    <path d="M 121,${y + 2} L 100,${y + 30} L 106,240 L 135,240 Z" fill="#3D3C45"/>`;
};

const bustMarkup = (expr: Expr, uid: string, rim: boolean) => {
  const h = HM,
    ch = h.chin,
    fw = h.w,
    fp = facePath(h);
  return `<defs><filter id="${uid}-rim" x="-12%" y="-12%" width="124%" height="124%">
      <feMorphology operator="dilate" radius="1.7" in="SourceAlpha" result="d"/>
      <feFlood flood-color="#A08E74" result="c"/>
      <feComposite in="c" in2="d" operator="in" result="o"/>
      <feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="${uid}-f"><path d="${fp}"/></clipPath></defs>
    <g ${rim ? `filter="url(#${uid}-rim)"` : ""}>
    ${clothM(h)}
    <path d="M ${100 - 15},${ch - 18} h 30 v 36 h -30 Z" fill="${KISHA.shad}"/>
    <path d="M ${100 - 15},${ch - 18} h 30 v 9 h -30 Z" fill="${INK}" opacity="0.2"/>
    <ellipse cx="${100 - fw}" cy="${EY + 8}" rx="6" ry="10" fill="${KISHA.skin}"
       stroke="${INK}" stroke-width="${h.lw * 0.75}"/>
    <ellipse cx="${100 + fw}" cy="${EY + 8}" rx="6" ry="10" fill="${KISHA.skin}"
       stroke="${INK}" stroke-width="${h.lw * 0.75}"/>
    <path d="${fp}" fill="${KISHA.skin}"/>
    <g clip-path="url(#${uid}-f)">
      <path d="M ${100 + fw - 15},${CR - 4} C ${100 + fw + 6},${CR + 40} ${100 + fw + 2},${EY + 20} ${100 + fw - 19},${ch + 4}
         L ${100 + fw + 12},${ch + 4} L ${100 + fw + 12},${CR - 4} Z" fill="${KISHA.shad}" opacity="0.45"/>
    </g>
    <path d="${fp}" fill="none" stroke="${INK}" stroke-width="${h.lw}" stroke-linejoin="round"/>
    ${eyesM(h, expr, uid)}
    ${browsM(h, expr)}
    ${noseM(h)}
    ${mouthM(h, expr)}
    ${bobHair(KISHA.hair2, h)}
    </g>`;
};

// 通知カードのアイコンに入る顔。
// 髪を含めた頭は x 46..154 / y 38..159 に収まるので、
// それを余白ごと包む枠を取る (下を 140 で切ると顎と毛先が落ちる)。
// 服 (y=172〜) は枠の外なので入らない。
export const KishaFace: React.FC<{ size?: number; expr?: Expr }> = ({
  size = 92,
  expr = "normal",
}) => {
  const uid = React.useId().replace(/:/g, "");
  // 通知カードは生成りの紙の上なので、暗い背景用の縁取りは切る
  return (
    <svg width={size} height={size} viewBox="32 30 136 136">
      <g dangerouslySetInnerHTML={{ __html: bustMarkup(expr, uid, false) }} />
    </svg>
  );
};

export const KishaBust: React.FC<{ w?: number; expr?: Expr }> = ({
  w = 300,
  expr = "normal",
}) => {
  const uid = React.useId().replace(/:/g, "");
  return (
    <svg width={w} height={w * 1.2} viewBox="0 0 200 240">
      <g dangerouslySetInnerHTML={{ __html: bustMarkup(expr, uid, true) }} />
    </svg>
  );
};

// ===================================================================
// ⑤反応は通知カードで出す
// ===================================================================
// 台本357行のうち反応のセリフは16行しかない。バストアップを常時出すと
// 「出しっぱなし」か「点滅」になるので、反応の瞬間だけ通知が出る形にする。
// SNSのロゴ・いいね・時刻は入れない。玉音放送やガザの節で軽く見えるため。

export const NotifyCard: React.FC<{
  text: string;
  f: number;
  expr?: Expr;
  name?: string;
}> = ({ text, f, expr = "normal", name = "新人記者" }) => {
  const t = easeOut(seg(f, 0, 12));
  const body = text.replace(/^[「『]|[」』]$/g, "");
  return (
    <div
      style={{
        position: "absolute",
        right: 96,
        bottom: 104,
        width: 1180,
        display: "flex",
        gap: 26,
        alignItems: "flex-start",
        padding: "26px 34px 28px 30px",
        borderRadius: 14,
        backgroundColor: SKP.paper,
        borderLeft: `7px solid ${SKP.sabi}`,
        boxShadow: "0 14px 34px rgba(0,0,0,0.5)",
        opacity: t,
        transform: `translateX(${(1 - t) * 70}px)`,
      }}
    >
      {/* 丸く抜くと円の縁が顎と毛先を削るので、角丸の四角にする。
          記者証の証明写真に見えて、SNSのアイコンらしさも薄まる */}
      <div
        style={{
          width: 96,
          height: 96,
          flexShrink: 0,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#D8CDB8",
          border: `2px solid ${SKP.kinariDim}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <KishaFace size={96} expr={expr} />
      </div>
      <div style={{ flex: 1, paddingTop: 2 }}>
        <div
          style={{
            fontFamily: SEKAI_SERIF,
            fontSize: 26,
            color: SKP.sumi,
            opacity: 0.6,
            marginBottom: 8,
            letterSpacing: 2,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: SEKAI_FONT,
            fontSize: 44,
            fontWeight: 700,
            color: SKP.sumi,
            lineHeight: 1.44,
          }}
        >
          {wrapJa(body)}
        </div>
      </div>
    </div>
  );
};

// 反応のセリフかどうか。行まるごとが「」でくるまれているものだけ。
// 地の文にも引用の「」は出てくる (「堪え難きを堪え」という一節 など) ので、
// 行頭だけで判定すると地の文を通知カードにしてしまう。
export const isReaction = (text: string) => {
  const s = text.trim();
  return /^[「『]/.test(s) && /[」』]$/.test(s);
};

export const SekaiFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
      <SekaiGround f={f} />
      {children}
    </svg>
  );
};
