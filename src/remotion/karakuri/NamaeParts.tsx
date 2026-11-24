// 「名前を奪われる」のは、なぜあんなに怖いのか: 全巻で共有する「説明の装置」。
// 構成案: docs/namae-kousei.md「抽象軸: 名札と3本の糸」が正本。
//
// ★この装置は何度も出る同じ物。毎回この同じ図を使い、描き直さない (絵のブレ禁止)。
// ★背景・部屋・人の配置はここに置かない (制作ガイド §7 第3層)。
// ★props の形 (シグネチャ) を勝手に変えない。並走中の全員がこの形で呼ぶ。
//
// 糸は3本。色で見分ける (全編で固定):
//   耳の糸 (mimi)    = 朱色   … 呼ぶ人・呼ばれる人を結ぶ (第2章末で結ばれる)
//   帳簿の糸 (chobo) = 藍色   … 国や村の名簿を結ぶ (第5章末)
//   信用の糸 (shinyo)= 金茶色 … 積み上げた仕事・お客を結ぶ (第7章末)
// 名札の結び目も3つ。左端=耳 / 下端=帳簿 / 右端=信用。

import React from "react";
import { useCurrentFrame } from "remotion";
import { KRP, KARAKURI_FONT, Person, seg, easeOut, clamp01, pop } from "./KarakuriScenes";
import { Frame } from "./NamaeShared";

const FONT = KARAKURI_FONT;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 装置専用の色 (シーン側でも使ってよい)
export const NP = {
  // 名札 (白木の札)
  wood: "#E9D3A6",
  woodMid: "#D8BC88",
  woodDark: "#B08A55",
  grain: "#C9A874",
  brass: "#D9B23C",
  brassDark: "#A8862A",
  sumi: "#2B2622", // 名前の墨の字
  // 3本の糸
  mimi: "#D9503F", // 耳の糸 (朱)
  mimiDark: "#A93A2C",
  chobo: "#3F5E96", // 帳簿の糸 (藍)
  choboDark: "#2C4474",
  shinyo: "#C9952E", // 信用の糸 (金茶)
  shinyoDark: "#9A7020",
  // 光
  glow: "#FFD36B",
  glowCore: "#FFF3C4",
} as const;

export type ItoKey = "mimi" | "chobo" | "shinyo";
export const ITO_NAMES: Record<ItoKey, string> = { mimi: "耳の糸", chobo: "帳簿の糸", shinyo: "信用の糸" };
export const ITO_COLOR: Record<ItoKey, [string, string]> = {
  mimi: [NP.mimi, NP.mimiDark],
  chobo: [NP.chobo, NP.choboDark],
  shinyo: [NP.shinyo, NP.shinyoDark],
};

/* ===================================================================
 * nafudaKnot — 名札の結び目の位置 (糸をつなぐ点)。シーン側で Ito の始点に使う
 *   which: "mimi"=左端の結び目 / "chobo"=下端 / "shinyo"=右端
 *   x,y,s: Nafuda に渡したのと同じ値
 * =================================================================== */
export const nafudaKnot = (which: ItoKey, x: number, y: number, s = 1): [number, number] => {
  if (which === "mimi") return [x - 210 * s, y + 10 * s];
  if (which === "shinyo") return [x + 210 * s, y + 10 * s];
  return [x, y + 108 * s];
};

/* ===================================================================
 * Nafuda — 名札 (白木の札・上に吊り紐の真鍮の輪・3つの結び目)
 *   x,y: 札の中心 / s: 大きさ (s=1 で幅 400px・高さ 190px)
 *   text: 札に書く名前 (墨の字)。★作品のキャラの名前は書かない (一般の名前か「○○○○」)
 *   vanish: 0〜1 … 1文字目を残して、ほかの字が上へ浮いて薄れて消える (名前を奪われる演出)
 *   blur: 0〜1 … 字がかすれて読めなくなる (元の自分を忘れる演出)
 *   knots: 結び目の光 0〜1 (糸が結ばれた結び目を光らせる)
 *   hang: true なら上に吊り紐を描く (既定 true)
 *   f: ゆらゆら揺れ用
 * =================================================================== */
export const Nafuda: React.FC<{
  x: number; y: number; s?: number; text?: string; vanish?: number; blur?: number;
  knots?: Partial<Record<ItoKey, number>>; hang?: boolean; f?: number; rot?: number;
}> = ({ x, y, s = 1, text = "○○ ○○", vanish = 0, blur = 0, knots = {}, hang = true, f = 0, rot = 0 }) => {
  const sway = Math.sin(f / 22) * 1.6 + rot;
  const chars = Array.from(text);
  const fs = Math.min(110, Math.floor(330 / Math.max(chars.length, 1)));
  const v = clamp01(vanish);
  const b = clamp01(blur);
  const total = chars.length * fs * 0.98;
  const knot = (k: ItoKey) => {
    const [kx, ky] = nafudaKnot(k, 0, 0, 1);
    const L = clamp01(knots[k] ?? 0);
    return (
      <g key={k}>
        {L > 0.01 && <circle cx={kx} cy={ky} r={34} fill={NP.glow} opacity={0.45 * L} />}
        <circle cx={kx} cy={ky} r={17} fill={L > 0.01 ? ITO_COLOR[k][0] : NP.brass} stroke={KRP.ink} strokeWidth={5} />
        <circle cx={kx} cy={ky} r={6} fill={KRP.ink} opacity={0.55} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway})`}>
      {hang && (
        <g>
          <path d="M 0 -150 L -60 -98 M 0 -150 L 60 -98" stroke={KRP.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={-152} r={13} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
        </g>
      )}
      {/* 札の影 */}
      <rect x={-196} y={-86} width={400} height={190} rx={22} fill={KRP.ink} opacity={0.16} />
      {/* 札の板 */}
      <rect x={-200} y={-95} width={400} height={190} rx={22} fill={NP.wood} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-200} y={-95} width={400} height={30} rx={14} fill={NP.woodMid} opacity={0.55} />
      {/* 木目 */}
      <g stroke={NP.grain} strokeWidth={3} fill="none" opacity={0.7}>
        <path d="M -180 -40 q 90 -14 180 0 q 90 14 170 -4" />
        <path d="M -182 40 q 100 12 190 0 q 80 -12 170 6" />
        <path d="M -150 70 q 60 -8 120 0" />
      </g>
      {/* 吊り紐を通す穴の金具 */}
      {hang && [-60, 60].map((hx) => (
        <circle key={hx} cx={hx} cy={-74} r={10} fill={NP.brassDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 名前の墨の字 (1文字ずつ。vanish で2文字目以降が浮いて消える) */}
      <g>
        {chars.map((ch, i) => {
          const cx = -total / 2 + fs * 0.98 * (i + 0.5);
          const away = i === 0 ? 0 : clamp01(v * 1.25 - (i - 1) * 0.12);
          const dy = -away * 260 - Math.sin(away * Math.PI) * 30;
          const dx = away * (i % 2 ? 40 : -30);
          return (
            <text key={i} x={cx + dx} y={fs * 0.36 + dy} textAnchor="middle" fontFamily={FONT} fontWeight={900}
              fontSize={fs} fill={NP.sumi} opacity={(1 - away) * (1 - b * 0.85)}
              transform={away > 0 ? `rotate(${away * (i % 2 ? 18 : -14)} ${cx + dx} ${dy})` : undefined}
              style={b > 0 ? { filter: `blur(${b * 7}px)` } : undefined}>
              {ch}
            </text>
          );
        })}
      </g>
      {/* 3つの結び目 */}
      {(["mimi", "chobo", "shinyo"] as ItoKey[]).map(knot)}
    </g>
  );
};

/* ===================================================================
 * Ito — 名札から伸びる糸 (1本)
 *   from: 始点 (ふつうは nafudaKnot の位置) / to: 終点 (耳・名簿・看板など、シーン側の物)
 *   kind: どの糸か (色が決まる)
 *   t: 0〜1 … 始点から終点へ伸びる (1 で結ばれる)
 *   sag: たるみ (下向きのふくらみ px。既定 80)
 *   cut: 0〜1 … 真ん中で切れる。切れ端がほつれて垂れ下がる
 *   lock: 0〜1 … 真ん中に真鍮の錠前がかかる (帳簿の糸の第5章用)
 *   thick: 太さの倍率 (信用の糸が太くなる演出。既定 1)
 *   tension: 0〜1 … ぴんと張る (たるみが消えて、少し震える)
 *   f: ゆれ用
 * =================================================================== */
export const Ito: React.FC<{
  from: [number, number]; to: [number, number]; kind: ItoKey; t?: number; sag?: number;
  cut?: number; lock?: number; thick?: number; tension?: number; f?: number;
}> = ({ from, to, kind, t = 1, sag = 80, cut = 0, lock = 0, thick = 1, tension = 0, f = 0 }) => {
  const [c, cd] = ITO_COLOR[kind];
  const T = clamp01(t);
  if (T <= 0.001) return null;
  const tn = clamp01(tension);
  const quiver = tn > 0 ? Math.sin(f * 1.7) * 3 * tn : 0;
  const sg = sag * (1 - tn) + Math.sin(f / 14) * 6 * (1 - tn) + quiver;
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sg;
  // 2次ベジェ上の点
  const P = (u: number): [number, number] => [
    (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2,
    (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2,
  ];
  const path = (u0: number, u1: number, n = 24) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const [px, py] = P(u0 + ((u1 - u0) * i) / n);
      return `${i ? "L" : "M"} ${px.toFixed(1)} ${py.toFixed(1)}`;
    }).join(" ");
  const w = 9 * thick;
  const K = clamp01(cut);
  const strand = (d: string, key: string) => (
    <g key={key}>
      <path d={d} stroke={KRP.ink} strokeWidth={w + 6} fill="none" strokeLinecap="round" />
      <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke={cd} strokeWidth={Math.max(2, w * 0.3)} fill="none" strokeDasharray={`${6 * thick} ${10 * thick}`} strokeLinecap="round" />
    </g>
  );
  if (K <= 0.001) {
    const [lx, ly] = P(0.5);
    const L = clamp01(lock);
    return (
      <g>
        {strand(path(0, T), "a")}
        {/* 先端の小さな玉 (伸びている途中) */}
        {T < 1 && (() => { const [ex, ey] = P(T); return <circle cx={ex} cy={ey} r={w * 0.9} fill={c} stroke={KRP.ink} strokeWidth={4} />; })()}
        {L > 0.01 && T >= 0.5 && (
          <g transform={`translate(${lx} ${ly + 6}) scale(${pop(L)})`}>
            <path d="M -26 -10 L -26 -40 Q -26 -70 0 -70 Q 26 -70 26 -40 L 26 -10" fill="none" stroke={NP.brassDark} strokeWidth={10} />
            <path d="M -26 -10 L -26 -40 Q -26 -70 0 -70 Q 26 -70 26 -40 L 26 -10" fill="none" stroke={KRP.ink} strokeWidth={3} />
            <rect x={-40} y={-14} width={80} height={66} rx={10} fill={NP.brass} stroke={KRP.ink} strokeWidth={6} />
            <circle cx={0} cy={12} r={8} fill={KRP.ink} />
            <rect x={-3} y={14} width={6} height={18} fill={KRP.ink} />
          </g>
        )}
      </g>
    );
  }
  // 切れた: 真ん中で2本に分かれ、それぞれの切れ端が垂れ下がる
  const gap = 0.04 + 0.08 * K;
  const [ax, ay] = P(0.5 - gap);
  const [bx, by] = P(0.5 + gap);
  const droop = 120 * K;
  const fray = (px: number, py: number, dir: number, key: string) => (
    <g key={key} stroke={c} strokeWidth={3} strokeLinecap="round">
      {[-1, 0, 1].map((k) => (
        <line key={k} x1={px} y1={py + droop} x2={px + dir * (10 + k * 4)} y2={py + droop + 16 + k * 6} />
      ))}
    </g>
  );
  const half1 = `${path(0, 0.5 - gap)} Q ${ax} ${ay + droop * 0.5} ${ax} ${ay + droop}`;
  const half2 = `M ${bx} ${by + droop} Q ${bx} ${by + droop * 0.5} ${bx} ${by} ${path(0.5 + gap, 1).replace(/^M/, "L")}`;
  return (
    <g>
      {strand(half1, "h1")}
      {strand(half2, "h2")}
      {fray(ax, ay, -1, "f1")}
      {fray(bx, by, 1, "f2")}
      {/* 切れた瞬間の小さなはじけ */}
      {K < 0.5 && (
        <g stroke={KRP.ink} strokeWidth={4} strokeLinecap="round" opacity={1 - K * 2}>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            const [cx, cy] = P(0.5);
            return <line key={i} x1={cx + Math.cos(a) * 24} y1={cy + Math.sin(a) * 24} x2={cx + Math.cos(a) * 48} y2={cy + Math.sin(a) * 48} />;
          })}
        </g>
      )}
    </g>
  );
};

/* ===================================================================
 * ItoLegend — 3本の糸の凡例 (結ばれた糸だけ塗りつぶし、まだの糸は点線の空き札)
 *   x,y: 左上 / lit: 結ばれた度合い 0〜1 / s: 大きさ
 * =================================================================== */
export const ItoLegend: React.FC<{ x: number; y: number; s?: number; lit?: Partial<Record<ItoKey, number>> }> = ({ x, y, s = 1, lit = {} }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {(["mimi", "chobo", "shinyo"] as ItoKey[]).map((k, i) => {
      const L = clamp01(lit[k] ?? 0);
      const on = L > 0.01;
      return (
        <g key={k} transform={`translate(0 ${i * 70})`}>
          <rect x={0} y={-26} width={230} height={52} rx={26} fill={on ? KRP.white : "none"}
            stroke={on ? KRP.ink : "#B9AE98"} strokeWidth={on ? 4 : 3} strokeDasharray={on ? undefined : "8 7"} />
          <line x1={22} y1={0} x2={70} y2={0} stroke={on ? ITO_COLOR[k][0] : "#B9AE98"} strokeWidth={10} strokeLinecap="round" />
          <text x={84} y={11} fontFamily={FONT} fontWeight={900} fontSize={30} fill={on ? KRP.ink : "#B9AE98"}>{ITO_NAMES[k]}</text>
        </g>
      );
    })}
  </g>
);

/* ===================================================================
 * Ushiro — 映画の人物の「後ろ姿」(顔は描かない・全担当でこの同じ姿を使う)
 *   kind: "chihiro" 千尋 (私服) / "sen" 千 (湯屋の作業着) / "haku" ハク / "yubaba" 湯婆婆
 *         "father" 父 / "mother" 母
 *   x,y: 足元の中心 / s: 大きさ (s=1 で Person と同じ身長。千尋は 0.8 くらいで使う)
 *   silhouette: true なら逆光の黒いシルエット (縁だけ光る)
 *   walk: true なら足が交互に動く / f: ゆれ用 / turn: -1〜1 体を少し斜めに (肩越し)
 *   ★作品のキャラの顔・看板の字は描かない。髪型と服の色で「ほんのり」寄せるだけ
 * =================================================================== */
export type UshiroKind = "chihiro" | "sen" | "haku" | "yubaba" | "father" | "mother";
const US = {
  skin: "#F2D2B6", chihiroHair: "#6B4A30", stripe: "#7DB65A", shirt: "#FBFAF3", shorts: "#E9A3B0", shoe: "#F2C230",
  senTop: "#D9735F", senHakama: "#C65E4C", hakuHair: "#26342C", hakuTop: "#F3F1E8", hakuHakama: "#5B4E86",
  yuHair: "#BDB8AE", yuHairDark: "#9C978C", yuDress: "#2D4A8C", yuDressDark: "#1F3566",
  dadShirt: "#8EC3DE", dadPants: "#4B4F5A", dadHair: "#2A2724", momTop: "#E7A3B4", momPants: "#5B5361", momHair: "#7A5236",
} as const;
export const Ushiro: React.FC<{
  kind: UshiroKind; x: number; y: number; s?: number; silhouette?: boolean; walk?: boolean; f?: number; turn?: number;
}> = ({ kind, x, y, s = 1, silhouette = false, walk = false, f = 0, turn = 0 }) => {
  const sil = silhouette;
  const ink = KRP.ink;
  const col = (c: string) => (sil ? "#1E1A22" : c);
  const step = walk ? Math.sin(f / 4) : 0;
  const bob = walk ? Math.abs(Math.sin(f / 4)) * -4 : Math.sin(f / 14) * 1.5;
  const wide = kind === "father" ? 1.3 : kind === "mother" ? 0.92 : kind === "yubaba" ? 1.25 : kind === "chihiro" || kind === "sen" ? 0.86 : 1;
  const headR = kind === "yubaba" ? 112 : 64;
  const headY = kind === "yubaba" ? -250 : -228;
  const body = kind === "yubaba" ? { top: -170, h: 150 } : { top: -160, h: 108 };
  const leg = (side: -1 | 1) => {
    const lx = side * 18 * wide;
    const sw = step * 10 * side;
    if (kind === "sen" || kind === "haku") {
      // 袴 (幅広の台形)
      const c = kind === "sen" ? US.senHakama : US.hakuHakama;
      return (
        <g key={side} transform={`rotate(${sw * 0.4} ${lx} -58)`}>
          <path d={`M ${lx - 16} -62 L ${lx + 16} -62 L ${lx + 24} -8 L ${lx - 24} -8 Z`} fill={col(c)} stroke={ink} strokeWidth={4.5} />
          <ellipse cx={lx} cy={-4} rx={kind === "sen" ? 13 : 16} ry={7} fill={col(kind === "sen" ? US.skin : "#D9C9A8")} stroke={ink} strokeWidth={3} />
        </g>
      );
    }
    if (kind === "yubaba") return null; // ドレスで隠れる
    const pants = kind === "father" ? US.dadPants : kind === "mother" ? US.momPants : US.skin;
    return (
      <g key={side} transform={`rotate(${sw} ${lx} -58)`}>
        <rect x={lx - 12} y={-58} width={24} height={52} fill={col(pants)} stroke={ink} strokeWidth={4.5} />
        {kind === "chihiro" && <rect x={lx - 12} y={-22} width={24} height={14} fill={col("#FFFFFF")} stroke={ink} strokeWidth={3} />}
        <ellipse cx={lx} cy={-4} rx={18} ry={9} fill={col(kind === "chihiro" ? US.shoe : ink)} stroke={ink} strokeWidth={3} />
      </g>
    );
  };
  const topC = kind === "chihiro" ? US.shirt : kind === "sen" ? US.senTop : kind === "haku" ? US.hakuTop : kind === "father" ? US.dadShirt : kind === "mother" ? US.momTop : US.yuDress;
  const hairC = kind === "chihiro" || kind === "sen" ? US.chihiroHair : kind === "haku" ? US.hakuHair : kind === "father" ? US.dadHair : kind === "mother" ? US.momHair : US.yuHair;
  const bw = 116 * wide;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) skewX(${turn * 6})`}>
      {/* 逆光の縁の光 */}
      {sil && <ellipse cx={0} cy={-150} rx={bw * 0.9} ry={200} fill={NP.glow} opacity={0.18} />}
      {leg(-1)}{leg(1)}
      {/* 腕 (後ろから見て体の横) */}
      {[-1, 1].map((side) => (
        <rect key={side} x={side === -1 ? -bw / 2 - 18 : bw / 2 - 4} y={body.top + 12} width={22} height={kind === "yubaba" ? 96 : 82} rx={11}
          fill={col(kind === "chihiro" ? US.skin : topC)} stroke={ink} strokeWidth={4.5}
          transform={`rotate(${walk ? -step * 8 * side : side * 4} ${side * bw / 2} ${body.top + 12})`} />
      ))}
      {/* 胴体 */}
      {kind === "yubaba" ? (
        <path d={`M ${-bw / 2} ${body.top + 10} Q 0 ${body.top - 14} ${bw / 2} ${body.top + 10} L ${bw / 2 + 26} -6 L ${-bw / 2 - 26} -6 Z`}
          fill={col(US.yuDress)} stroke={ink} strokeWidth={5} />
      ) : (
        <rect x={-bw / 2} y={body.top} width={bw} height={body.h} rx={16} fill={col(topC)} stroke={ink} strokeWidth={5} />
      )}
      {kind === "chihiro" && !sil && [0, 1, 2].map((i) => (
        <rect key={i} x={-bw / 2 + 3} y={body.top + 22 + i * 26} width={bw - 6} height={9} fill={US.stripe} />
      ))}
      {kind === "chihiro" && <rect x={-bw / 2} y={-62} width={bw} height={22} rx={6} fill={col(US.shorts)} stroke={ink} strokeWidth={4} />}
      {kind === "sen" && !sil && <path d={`M ${-bw / 2 + 6} ${body.top + 70} L ${bw / 2 - 6} ${body.top + 70}`} stroke="#8E3B2E" strokeWidth={8} />}
      {kind === "haku" && !sil && <rect x={-bw / 2} y={-74} width={bw} height={14} fill={US.hakuHakama} stroke={ink} strokeWidth={3} />}
      {kind === "yubaba" && !sil && [0, 1].map((i) => (
        <path key={i} d={`M ${-bw / 2 + 10 - i * 12} ${-60 + i * 30} Q 0 ${-50 + i * 30} ${bw / 2 - 10 + i * 12} ${-60 + i * 30}`} stroke={US.yuDressDark} strokeWidth={6} fill="none" />
      ))}
      {/* 首 */}
      <rect x={-12} y={headY + headR - 10} width={24} height={body.top - (headY + headR - 10) + 4} fill={col(US.skin)} stroke={ink} strokeWidth={4} />
      {/* 頭 (後頭部 = 髪の色で塗る) */}
      <circle cx={0} cy={headY} r={headR} fill={col(hairC)} stroke={ink} strokeWidth={5} />
      {!sil && <path d={`M ${-headR * 0.6} ${headY - headR * 0.5} Q 0 ${headY - headR * 0.9} ${headR * 0.6} ${headY - headR * 0.5}`} stroke="#FFFFFF" strokeWidth={5} opacity={0.25} fill="none" />}
      {/* 耳 */}
      {kind !== "yubaba" && [-1, 1].map((side) => (
        <ellipse key={side} cx={side * (headR - 2)} cy={headY + 6} rx={9} ry={14} fill={col(US.skin)} stroke={ink} strokeWidth={4} />
      ))}
      {/* 髪型 */}
      {(kind === "chihiro" || kind === "sen") && (
        <g>
          <circle cx={0} cy={headY + 26} r={9} fill={col("#E25B8A")} stroke={ink} strokeWidth={3} />
          <path d={`M -9 ${headY + 30} Q ${-14 + Math.sin(f / 9) * 4} ${headY + 80} ${-4 + Math.sin(f / 9) * 6} ${headY + 120} L 6 ${headY + 118} Q ${4 + Math.sin(f / 9) * 4} ${headY + 76} 9 ${headY + 30} Z`}
            fill={col(US.chihiroHair)} stroke={ink} strokeWidth={4} />
        </g>
      )}
      {kind === "haku" && (
        <path d={`M ${-headR - 4} ${headY - 10} Q ${-headR - 6} ${headY + 52} ${-headR + 6} ${headY + 56} L ${headR - 6} ${headY + 56} Q ${headR + 6} ${headY + 52} ${headR + 4} ${headY - 10} Z`}
          fill={col(US.hakuHair)} stroke={ink} strokeWidth={5} />
      )}
      {kind === "mother" && [-1, 0, 1].map((i) => (
        <circle key={i} cx={i * 40} cy={headY + 48} r={22} fill={col(US.momHair)} stroke={ink} strokeWidth={4} />
      ))}
      {kind === "yubaba" && (
        <g>
          <ellipse cx={0} cy={headY - headR - 30} rx={78} ry={56} fill={col(US.yuHair)} stroke={ink} strokeWidth={5} />
          {!sil && <path d={`M -50 ${headY - headR - 30} Q 0 ${headY - headR - 70} 50 ${headY - headR - 30}`} stroke={US.yuHairDark} strokeWidth={5} fill="none" />}
          {/* 大きな耳飾り */}
          {[-1, 1].map((side) => (
            <circle key={side} cx={side * (headR - 6)} cy={headY + headR * 0.55} r={16} fill={sil ? NP.brass : "#E0B13A"} stroke={ink} strokeWidth={4} />
          ))}
        </g>
      )}
      {/* 逆光の縁取り (シルエットのとき) */}
      {sil && <circle cx={0} cy={headY} r={headR + 4} fill="none" stroke={NP.glowCore} strokeWidth={3} opacity={0.7} />}
    </g>
  );
};

/* ===================================================================
 * MeijiLock — 明治の名前の錠前 (第5章の装置。#114〜#125 で同じ物を使う)
 *   木の板の上に名札。名札の下から鎖が5本のびて、5つの「布告の段」につながる。
 *   段: 1 明治3年 許可 (判だけ・錠前なし) / 2 明治4年 戸籍 / 3 明治5年5月 ひとり1つ / 4 明治5年8月 改名禁止 / 5 明治8年 義務
 *   x,y: 板の中心 / s: 大きさ (s=1 で幅1300px・高さ640px)
 *   stage: 0〜5 … 何段目まで来たか (その段の札が光り、錠前がかかる)
 *   t: 0〜1 … いまの段 (stage 段目) の動きの進み (錠前が閉まる・判が押される)。前の段は閉まったまま
 *   flip: 0〜1 … 1段目の「許可」の札が裏返って「義務」に変わる (#122 用)
 *   text: 名札の名前 (既定「山田 花子」) / f: ゆれ用
 * =================================================================== */
const MEIJI_STEPS: [string, string][] = [
  ["明治3年", "許可"], ["明治4年", "戸籍"], ["明治5年5月", "ひとり1つ"], ["明治5年8月", "改名禁止"], ["明治8年", "義務"],
];
export const MeijiLock: React.FC<{
  x: number; y: number; s?: number; stage?: number; t?: number; flip?: number; text?: string; f?: number;
}> = ({ x, y, s = 1, stage = 0, t = 1, flip = 0, text = "山田 花子", f = 0 }) => {
  const W0 = 1300, H0 = 640;
  const colX = (i: number) => -W0 / 2 + 170 + i * 240;
  const tagY = -H0 / 2 + 120;
  const lockY = 120; const yearY = -40; // 年の札の中心 (錠前のつるの上)
  const fl = clamp01(flip);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 板 */}
      <rect x={-W0 / 2 + 10} y={-H0 / 2 + 14} width={W0} height={H0} rx={26} fill={KRP.ink} opacity={0.18} />
      <rect x={-W0 / 2} y={-H0 / 2} width={W0} height={H0} rx={26} fill="#8E6238" stroke={KRP.ink} strokeWidth={9} />
      <rect x={-W0 / 2 + 24} y={-H0 / 2 + 24} width={W0 - 48} height={H0 - 48} rx={16} fill="#A8743F" stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M ${-W0 / 2 + 40} ${-H0 / 2 + 70 + i * 95} q ${W0 / 3} ${i % 2 ? 10 : -10} ${W0 / 1.5} 0 q ${W0 / 6} ${i % 2 ? -8 : 8} ${W0 / 3 - 80} 0`}
          stroke="#8E6238" strokeWidth={3} fill="none" opacity={0.6} />
      ))}
      {/* 四隅の真鍮の鋲 */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <circle key={i} cx={sx * (W0 / 2 - 40)} cy={sy * (H0 / 2 - 40)} r={14} fill={NP.brass} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 鎖: 名札の下 → 真鍮の横棒 → 各段へまっすぐ下りる */}
      {(() => {
        const railY = yearY - 80;
        const link = (x1: number, y1: number, y2: number, on: boolean, key: string) => {
          const n = Math.max(2, Math.round((y2 - y1) / 22));
          return (
            <g key={key}>
              {Array.from({ length: n }, (_, k) => {
                const cy = y1 + ((k + 0.5) * (y2 - y1)) / n;
                return k % 2 ? (
                  <rect key={k} x={x1 - 3} y={cy - 10} width={6} height={20} rx={3} fill={on ? NP.brassDark : "#6B5A44"} stroke={KRP.ink} strokeWidth={2} />
                ) : (
                  <ellipse key={k} cx={x1} cy={cy} rx={9} ry={12} fill="none" stroke={on ? NP.brassDark : "#6B5A44"} strokeWidth={6} />
                );
              })}
            </g>
          );
        };
        return (
          <g>
            {link(0, tagY + 100, railY, stage >= 1, "top")}
            <rect x={colX(0) - 20} y={railY - 9} width={colX(4) - colX(0) + 40} height={18} rx={9} fill={NP.brass} stroke={KRP.ink} strokeWidth={5} />
            {MEIJI_STEPS.map((_, i) => link(colX(i), railY + 8, yearY - 26, stage >= i + 1, `c${i}`))}
          </g>
        );
      })()}
      {/* 名札 (装置の頭) */}
      <Nafuda x={0} y={tagY} s={0.9} text={text} hang={false} f={f} />
      {/* 5つの段 */}
      {MEIJI_STEPS.map(([year, what], i) => {
        const idx = i + 1;
        const on = stage >= idx;
        const cur = stage === idx;
        const k = on ? (cur ? clamp01(t) : 1) : 0;
        const cx = colX(i);
        const isFirst = i === 0;
        const label = isFirst && fl > 0.5 ? "義務" : what;
        const plateFill = isFirst && fl > 0.5 ? KRP.red : on ? KRP.white : "#E6DCC6";
        const flipSx = isFirst ? Math.abs(Math.cos(fl * Math.PI)) : 1;
        return (
          <g key={i}>
            {/* 光 */}
            {cur && k > 0 && <circle cx={cx} cy={lockY} r={110} fill={NP.glow} opacity={0.35 * Math.sin(k * Math.PI) + 0.15} />}
            {/* 年の札 */}
            <rect x={cx - 100} y={yearY - 25} width={200} height={50} rx={10} fill={on ? NP.wood : "#D9C9A8"} stroke={KRP.ink} strokeWidth={5} />
            <text x={cx} y={yearY + 11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={year.length > 4 ? 28 : 32} fill={KRP.ink}>{year}</text>
            {/* 錠前 or 判 */}
            {isFirst ? (
              <g transform={`translate(${cx} ${lockY + 10}) scale(${on ? 0.6 + 0.4 * pop(k) : 0.6})`}>
                <circle r={48} fill={on ? KRP.red : "#C9B9A0"} stroke={KRP.ink} strokeWidth={6} opacity={on ? 1 : 0.6} />
                <circle r={34} fill="none" stroke={KRP.white} strokeWidth={4} opacity={on ? 0.8 : 0.3} />
                <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={KRP.white} opacity={on ? 1 : 0.4}>可</text>
              </g>
            ) : (
              <g transform={`translate(${cx} ${lockY + 10})`}>
                {/* つる (開いている=上に浮く → k で下りて閉まる) */}
                <path d={`M -34 ${-4 - (1 - k) * 34} L -34 ${-44 - (1 - k) * 34} Q -34 ${-92 - (1 - k) * 34} 0 ${-92 - (1 - k) * 34} Q 34 ${-92 - (1 - k) * 34} 34 ${-44 - (1 - k) * 34} L 34 ${-24}`}
                  fill="none" stroke={on ? NP.brassDark : "#8A7A60"} strokeWidth={14} strokeLinecap="round" />
                <rect x={-58} y={-20} width={116} height={96} rx={16} fill={on ? NP.brass : "#B8A888"} stroke={KRP.ink} strokeWidth={7} />
                <circle cx={0} cy={20} r={11} fill={KRP.ink} />
                <rect x={-4} y={22} width={8} height={26} fill={KRP.ink} />
                {cur && k > 0.85 && (
                  <g stroke={KRP.ink} strokeWidth={5} strokeLinecap="round" opacity={(1 - k) * 6}>
                    <line x1={-80} y1={-40} x2={-104} y2={-60} /><line x1={80} y1={-40} x2={104} y2={-60} />
                  </g>
                )}
              </g>
            )}
            {/* 中身の札 */}
            <g transform={`translate(${cx} ${lockY + 150}) scale(${flipSx} 1)`}>
              <rect x={-105} y={-34} width={210} height={68} rx={12} fill={plateFill} stroke={KRP.ink} strokeWidth={5} />
              <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={label.length > 3 ? 32 : 40}
                fill={isFirst && fl > 0.5 ? KRP.white : on ? KRP.ink : "#9C8E74"}>{label}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

/* ===================================================================
 * 部品の見本帳 (NamaeParts 合成)
 *   コマ0: 名札だけ (結び目3つ) / コマ1: 名札の字が抜ける (vanish) / コマ2: 字がかすれる (blur)
 *   コマ3: 耳の糸が結ばれる / コマ4: 3本そろう (錠前・太い信用) / コマ5: 3本が切れる
 * =================================================================== */
export const NAMAE_PARTS_PREVIEW_FRAMES = 10;
export const NamaePartsPreview: React.FC = () => {
  const i = Math.min(useCurrentFrame(), NAMAE_PARTS_PREVIEW_FRAMES - 1);
  const f = 45;
  const X = 960, Y = 420;
  const ends: Record<ItoKey, [number, number]> = { mimi: [300, 640], chobo: [960, 760], shinyo: [1620, 640] };
  return (
    <Frame f={f} seed={4990 + i}>
      {i === 0 && <Nafuda x={X} y={Y} s={1.4} text="山田 花子" f={f} />}
      {i === 1 && <Nafuda x={X} y={Y} s={1.4} text="山田 花子" vanish={0.7} f={f} />}
      {i === 2 && <Nafuda x={X} y={Y} s={1.4} text="山田 花子" blur={0.7} f={f} />}
      {i === 3 && (
        <g>
          <Ito from={nafudaKnot("mimi", X, Y, 1.2)} to={ends.mimi} kind="mimi" t={1} f={f} />
          <Nafuda x={X} y={Y} s={1.2} text="山田 花子" knots={{ mimi: 1 }} f={f} />
          <ItoLegend x={1500} y={120} s={0.9} lit={{ mimi: 1 }} />
        </g>
      )}
      {i === 4 && (
        <g>
          <Ito from={nafudaKnot("mimi", X, Y, 1.2)} to={ends.mimi} kind="mimi" f={f} />
          <Ito from={nafudaKnot("chobo", X, Y, 1.2)} to={ends.chobo} kind="chobo" lock={1} sag={20} f={f} />
          <Ito from={nafudaKnot("shinyo", X, Y, 1.2)} to={ends.shinyo} kind="shinyo" thick={1.8} tension={0.8} f={f} />
          <Nafuda x={X} y={Y} s={1.2} text="山田 花子" knots={{ mimi: 1, chobo: 1, shinyo: 1 }} f={f} />
          <ItoLegend x={1500} y={120} s={0.9} lit={{ mimi: 1, chobo: 1, shinyo: 1 }} />
        </g>
      )}
      {i === 6 && (["father", "mother", "chihiro", "sen", "haku", "yubaba"] as UshiroKind[]).map((k, j) => (
        <Ushiro key={k} kind={k} x={230 + j * 290} y={820} s={k === "chihiro" || k === "sen" ? 1.0 : 1.2} f={f} />
      ))}
      {i === 7 && (["chihiro", "haku", "yubaba"] as UshiroKind[]).map((k, j) => (
        <Ushiro key={k} kind={k} x={480 + j * 480} y={820} s={1.3} silhouette f={f} />
      ))}
      {i === 8 && <MeijiLock x={960} y={540} s={1.2} stage={3} t={0.6} f={f} />}
      {i === 9 && <MeijiLock x={960} y={540} s={1.2} stage={5} t={1} flip={1} f={f} />}
      {i === 5 && (
        <g>
          {(["mimi", "chobo", "shinyo"] as ItoKey[]).map((k) => (
            <Ito key={k} from={nafudaKnot(k, X, Y, 1.2)} to={ends[k]} kind={k} cut={0.7} f={f} />
          ))}
          <Nafuda x={X} y={Y} s={1.2} text="山田 花子" f={f} />
        </g>
      )}
    </Frame>
  );
};
void easeOut; void seg; void lerp; void Person;
