// 「なぜ高層ビルは生まれたのか」: 第5章「島には、土地がない。」後半2 (違法になる〜欲が膨らむ)
// 担当範囲: 台本 docs/koso-script-v7.txt の 209〜217行目 (文#208〜#216・9文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。
// motif 名は必ず kb5_ で始める。WobbleDefs の seed はこのファイルでは 829〜837 を使う。
// 設計書: docs/koso-ch5-design.md (1文ごとの「格」と絵の中身が決まっている)
//
// ★絵の「格」(制作ガイド §7 第3層-7)
//   山 = 舞台・人・事件・カメラ全部入り (150〜250行)
//   並 = 舞台はあるが描くのは1つだけ。人は1人、背景3〜4要素 (60〜120行)
//   図 = クリーム地に図と札だけ。人も背景も置かない (25〜50行)
//   ★「図」「並」も品質は落とさない。短いのは賑やかさを削ったからで、雑に描いたからではない。
//     線・色・札・フォントは山と完全に同じ。必ず f で動く。図そのものを作り込む。
//     大きく置いて画面を使い切る (「小さい物を真ん中にポツンと」が最悪の失敗)。
//
// ★絵の中の文字は、ラベル・数値・標識だけ (台本の文章は字幕が別レイヤーで出る)。
//   TagPlate の下端 = y + size*0.85。これを 830 以下にする (字幕帯に隠れるため)。

import React from "react";
import {
  KRP, Person, Bolt, Stamp, seg, pop, easeOut, clamp01,
} from "./KarakuriScenes";
import { W, H, FONT, Frame, ChapterDoor, TagPlate, QMark, XMark, Arrow } from "./KosoShared";
import { KPP, TowerOnPillars } from "./KosoPillars";
import {
  BP, lerp, rnd, zoomAt, bobOf, Rivets, HexBolt, GridPaper,
  Rope, Balance, Maru, MaruBatsu, ForceArrow, FlowPlates, FloorScale,
} from "./KosoB2Parts";

// ===================================================================
// このファイルだけで使う色 (場面ごとの素材の色。金物の色は BP を使う)
// ===================================================================
const C = {
  sea: "#8FB3C4",
  seaDark: "#5E8597",
  island: "#D8CDB6",
  rock: "#9A8E78",
  paper: "#EFE7D4",
  mapLine: "#A08A62",
  gold: "#D9A93E",
  goldDark: "#9E7820",
  graphRed: "#C0483A",
  graphBlue: "#4A6E8A",
  cityPale: "#C8CFD4",
  cityDark: "#7E8A93",
  dust: "#B5A68D",
  darkSky: "#56606B",
};

// ===================================================================
// このファイルだけのローカル部品
// ===================================================================

/** 矩形の中だけに引く45°のハッチ。clipPath を使わず自分で端を切る。
 *  wipe: 1=全部ある / 0=全部消えた (左から順に消える) */
const Kb5dHatch: React.FC<{
  x: number; y: number; w: number; h: number; t?: number;
  pitch?: number; color?: string; sw?: number; opacity?: number; wipe?: number;
}> = ({ x, y, w, h, t = 1, pitch = 24, color = KRP.ink, sw = 3.5, opacity = 0.5, wipe = 1 }) => {
  const ks: number[] = [];
  for (let k = -h; k <= w; k += pitch) ks.push(k);
  const keep = clamp01(wipe);
  return (
    <g stroke={color} strokeWidth={sw} opacity={clamp01(t) * opacity} strokeLinecap="round">
      {ks.map((k, i) => {
        const frac = ks.length < 2 ? 1 : i / (ks.length - 1);
        if (frac < 1 - keep) return null;
        const xa = Math.min(Math.max(x + k, x), x + w);
        const ya = y + h - (xa - (x + k));
        const xb = Math.min(Math.max(x + k + h, x), x + w);
        const yb = y + (x + k + h - xb);
        if (xb - xa < 2) return null;
        return <line key={i} x1={xa} y1={ya} x2={xb} y2={yb} />;
      })}
    </g>
  );
};

/** 縦の寸法線 (矢羽・補助線・数値つき)。製図の作法どおりに描く */
const Kb5dDimV: React.FC<{
  x: number; y0: number; y1: number; label: string; t?: number;
  size?: number; color?: string; tick?: number;
}> = ({ x, y0, y1, label, t = 1, size = 36, color = KRP.ink, tick = 26 }) => {
  const ap = easeOut(clamp01(t));
  if (ap <= 0) return null;
  const yb = lerp(y0, y1, ap);
  return (
    <g stroke={color} strokeWidth={5} strokeLinecap="round">
      <line x1={x} y1={y0} x2={x} y2={yb} />
      {[y0, y1].map((yy, i) => (
        <g key={i} opacity={ap}>
          <line x1={x - tick} y1={yy} x2={x + tick} y2={yy} strokeWidth={5.5} />
          <line x1={x - 10} y1={yy + (i === 0 ? -16 : 16)} x2={x + 10} y2={yy + (i === 0 ? 16 : -16)} strokeWidth={4} />
        </g>
      ))}
      <text x={x - 18} y={(y0 + y1) / 2} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color} stroke="none" opacity={ap}
        transform={`rotate(-90 ${x - 18} ${(y0 + y1) / 2})`}>{label}</text>
    </g>
  );
};

/** 横の寸法線 */
const Kb5dDimH: React.FC<{
  y: number; x0: number; x1: number; label: string; t?: number;
  size?: number; color?: string; tick?: number;
}> = ({ y, x0, x1, label, t = 1, size = 34, color = KRP.ink, tick = 24 }) => {
  const ap = easeOut(clamp01(t));
  if (ap <= 0) return null;
  const xb = lerp(x0, x1, ap);
  return (
    <g stroke={color} strokeWidth={5} strokeLinecap="round">
      <line x1={x0} y1={y} x2={xb} y2={y} />
      {[x0, x1].map((xx, i) => (
        <g key={i} opacity={ap}>
          <line x1={xx} y1={y - tick} x2={xx} y2={y + tick} strokeWidth={5.5} />
          <line x1={xx + (i === 0 ? -16 : 16)} y1={y - 10} x2={xx + (i === 0 ? 16 : -16)} y2={y + 10} strokeWidth={4} />
        </g>
      ))}
      <text x={(x0 + x1) / 2} y={y - 16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={size} fill={color} stroke="none" opacity={ap}>{label}</text>
    </g>
  );
};

/** 高さ制限の赤い線 (左から引かれる)。制限そのものの絵 */
const Kb5dLimitLine: React.FC<{
  y: number; t?: number; color?: string; x0?: number; x1?: number;
  opacity?: number; wipe?: number;
}> = ({ y, t = 1, color = KRP.red, x0 = 120, x1 = 1860, opacity = 1, wipe = 1 }) => {
  const ap = easeOut(clamp01(t));
  if (ap <= 0) return null;
  const n = 26;
  const dw = (x1 - x0) / n;
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const frac = i / (n - 1);
        if (frac > ap) return null;
        const o = clamp01((clamp01(wipe) - frac) * 6 + (wipe >= 1 ? 1 : 0));
        if (o <= 0.02) return null;
        return (
          <rect key={i} x={x0 + i * dw} y={y - 6} width={dw * 0.66} height={12} rx={5}
            fill={color} stroke={KRP.ink} strokeWidth={2.5} opacity={o} />
        );
      })}
    </g>
  );
};

// ===== #208/#209 で共通に使う「百尺の建物」。同じ座標・同じ形で2回出る =====
const B5 = { x0: 560, x1: 1380, gy: 790, roof: 362, px0: 884, px1: 1140, ptop: 268 };

const Kb5dHyakushakuBldg: React.FC<{ f: number; shake?: number }> = ({ f, shake = 0 }) => {
  const dx = Math.sin(f / 3.1) * 2.6 * clamp01(shake);
  const cols = 7, rows = 6;
  const wx0 = 614, wx1 = 1326, wy0 = 420, wy1 = 700;
  const cw = (wx1 - wx0) / cols, rh = (wy1 - wy0) / rows;
  return (
    <g>
      {/* 地面と地面のハッチ */}
      <line x1={110} y1={B5.gy} x2={1810} y2={B5.gy} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.38}>
        {Array.from({ length: 23 }, (_, i) => (
          <line key={i} x1={150 + i * 74} y1={B5.gy} x2={118 + i * 74} y2={B5.gy + 36} />
        ))}
      </g>
      {/* 胴 (躯体) */}
      <rect x={B5.x0} y={B5.roof} width={B5.x1 - B5.x0} height={B5.gy - B5.roof}
        fill={C.paper} stroke={KRP.ink} strokeWidth={7} />
      {/* 隅のピラスター (柱型) */}
      {[[B5.x0, 46], [B5.x1 - 46, 46], [964, 36]].map(([px, pw], i) => (
        <rect key={i} x={px} y={B5.roof} width={pw} height={B5.gy - B5.roof}
          fill={C.dust} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
      ))}
      {/* 窓 (6段7列。枠と中桟まで) */}
      <g>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const x = wx0 + c * cw + 12, y = wy0 + r * rh + 6;
            const ww = cw - 32, hh = rh - 16;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={ww} height={hh} rx={3}
                  fill={BP.glass} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
                <line x1={x + ww / 2} y1={y} x2={x + ww / 2} y2={y + hh} stroke={KRP.ink} strokeWidth={2.6} />
                <line x1={x} y1={y + hh * 0.42} x2={x + ww} y2={y + hh * 0.42} stroke={KRP.ink} strokeWidth={2.6} />
                <rect x={x - 5} y={y + hh} width={ww + 10} height={7} fill={C.dust} stroke={KRP.ink} strokeWidth={2.4} />
              </g>
            );
          }),
        )}
      </g>
      {/* 階の帯 (胴差) */}
      <g>
        {Array.from({ length: rows - 1 }, (_, i) => (
          <line key={i} x1={B5.x0 + 46} y1={wy0 + (i + 1) * rh - 4} x2={B5.x1 - 46} y2={wy0 + (i + 1) * rh - 4}
            stroke={KRP.ink} strokeWidth={2.8} opacity={0.4} />
        ))}
      </g>
      {/* 軒 (コーニス) + 歯飾り */}
      <rect x={B5.x0 - 22} y={B5.roof + 8} width={B5.x1 - B5.x0 + 44} height={30}
        fill={C.dust} stroke={KRP.ink} strokeWidth={6} />
      <g>
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={B5.x0 - 6 + i * 32} y={B5.roof + 38} width={18} height={16}
            fill={C.dust} stroke={KRP.ink} strokeWidth={2.8} />
        ))}
      </g>
      {/* パラペット (屋上の手すり壁) */}
      <rect x={B5.x0 - 10} y={B5.roof - 18} width={B5.x1 - B5.x0 + 20} height={28}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
      {/* 基壇 (石積み) と入口 */}
      <rect x={B5.x0 - 14} y={708} width={B5.x1 - B5.x0 + 28} height={B5.gy - 708}
        fill={C.rock} stroke={KRP.ink} strokeWidth={6} opacity={0.92} />
      <g stroke={KRP.ink} strokeWidth={2.8} opacity={0.45}>
        <line x1={B5.x0 - 14} y1={736} x2={B5.x1 + 14} y2={736} />
        <line x1={B5.x0 - 14} y1={763} x2={B5.x1 + 14} y2={763} />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={B5.x0 + 40 + i * 78} y1={736} x2={B5.x0 + 40 + i * 78} y2={763} />
        ))}
      </g>
      <rect x={918} y={700} width={112} height={90} rx={6} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={6} />
      <line x1={974} y1={700} x2={974} y2={790} stroke={KRP.ink} strokeWidth={4} />
      <rect x={884} y={684} width={180} height={22} rx={6} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <Rivets x1={900} y1={695} x2={1048} y2={695} n={7} r={5} fill={BP.brassDark} />
      {/* ★頭 = 塔屋 (屋上の機械室と水槽)。線から出るのはここ */}
      <g transform={`translate(${dx} 0)`}>
        <rect x={B5.px0} y={B5.ptop} width={B5.px1 - B5.px0} height={B5.roof - B5.ptop}
          fill={C.paper} stroke={KRP.ink} strokeWidth={7} />
        <rect x={B5.px0 - 12} y={B5.ptop - 16} width={B5.px1 - B5.px0 + 24} height={22}
          fill={C.dust} stroke={KRP.ink} strokeWidth={5.5} />
        {[0, 1].map((i) => (
          <rect key={i} x={B5.px0 + 26 + i * 100} y={B5.ptop + 34} width={62} height={64} rx={3}
            fill={BP.glass} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
        ))}
        {/* 屋上水槽 (脚つき) */}
        <g>
          {[0, 1, 2].map((i) => (
            <line key={i} x1={B5.px0 + 42 + i * 70} y1={B5.ptop - 16} x2={B5.px0 + 42 + i * 70} y2={B5.ptop - 54}
              stroke={KRP.ink} strokeWidth={6} />
          ))}
          <rect x={B5.px0 + 20} y={B5.ptop - 86} width={140} height={34} rx={5}
            fill={C.sea} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={B5.px0 + 20} y1={B5.ptop - 72} x2={B5.px0 + 160} y2={B5.ptop - 72}
            stroke={C.seaDark} strokeWidth={5} opacity={0.8} />
        </g>
      </g>
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// ===== #208 すでに建っている百尺の建物が、違法になります。 =====
// 格: 図
// どこ: クリームの方眼紙。百尺 (30.3m) の既存ビルの立面図ひとつ
// 演出: 画面を横切る赤い制限線 30.0m。屋上の塔屋だけが線から出て、そこに赤ハッチと×
// 動き: 線が左から引かれる → 出た頭が赤く塗られ震える → × → 札「違法」
// 絵: 線から出た頭に赤い×。札「違法」。建物の輪郭は作り込む
const Kb5dIhouNiNaru: React.FC<{ f: number }> = ({ f }) => {
  const line = seg(f, 2, 16);
  const bad = seg(f, 16, 28);
  return (
    <Frame f={f} seed={829} bg={KRP.cream}>
      <GridPaper />
      <Kb5dHyakushakuBldg f={f} shake={seg(f, 20, 30)} />
      {/* 線から出た頭を赤く染める */}
      <g opacity={easeOut(bad)}>
        <rect x={B5.px0 - 12} y={B5.ptop - 88} width={B5.px1 - B5.px0 + 24} height={B5.roof - B5.ptop + 88}
          fill={KRP.red} opacity={0.2} />
        <Kb5dHatch x={B5.px0 - 12} y={B5.ptop - 88} w={B5.px1 - B5.px0 + 24} h={B5.roof - B5.ptop + 88}
          color={KRP.red} pitch={26} sw={4.5} opacity={0.6} />
      </g>
      {/* 高さ制限 30.0m = 屋上スラブの高さ。頭が出ている */}
      <Kb5dLimitLine y={B5.roof} t={line} />
      <Kb5dDimV x={430} y0={B5.gy} y1={B5.roof} label="30.3m" t={seg(f, 8, 22)} />
      <Kb5dDimV x={1500} y0={B5.roof} y1={B5.ptop - 86} label="出た頭" t={seg(f, 22, 36)} color={KRP.red} size={32} />
      <XMark x={1012} y={312} s={1.25} t={seg(f, 24, 36)} />
      <TagPlate x={1660} y={230} text="制限 30.0m" size={40} t={seg(f, 12, 26)} color={KRP.red} />
      <TagPlate x={300} y={620} text="百尺" size={48} t={seg(f, 10, 24)} />
      <TagPlate x={1660} y={560} text="違法" size={62} t={seg(f, 30, 42)} color={KRP.red} />
      <Arrow x={1426} y={312} s={1.0} rot={180} t={seg(f, 28, 40)} />
    </Frame>
  );
};

// ===================================================================
// #209 の「見上げ」用パース (この章で唯一、カメラを路上に下ろしたコマ)
// 手前の角 (cx) がいちばん近く、左右の面が奥へ逃げる。軒は上へ跳ね上がり、
// 基壇は下へ落ちる = 下から仰いでいる。縦の線は垂直のまま (2点透視)。
// ===================================================================
const LK = {
  cx: 1010, cTop: 372, cBot: 800,   // 手前の角 (稜線)
  lx: 140, lTop: 506, lBot: 752,    // 左の遠い端
  rx: 1812, rTop: 520, rBot: 756,   // 右の遠い端
};
/** パースの詰まり。k が大きいほど「遠く」「高く」が詰まる */
const lkSq = (v: number, k: number) => (v * (1 + k)) / (1 + k * v);
/** side -1=左の面 / +1=右の面。d=角からの横 (0〜1)、u=高さ (0=地面 1=軒) */
const lkP = (side: number, d: number, u: number): [number, number] => {
  const h = lkSq(d, 1.3);
  const t = lkSq(u, 0.5);
  const ex = side < 0 ? LK.lx : LK.rx;
  const eT = side < 0 ? LK.lTop : LK.rTop;
  const eB = side < 0 ? LK.lBot : LK.rBot;
  return [lerp(LK.cx, ex, h), lerp(lerp(LK.cBot, eB, h), lerp(LK.cTop, eT, h), t)];
};
const lkPts = (ps: [number, number][]) =>
  ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const lkQuad = (side: number, d0: number, d1: number, u0: number, u1: number) =>
  lkPts([lkP(side, d0, u0), lkP(side, d1, u0), lkP(side, d1, u1), lkP(side, d0, u1)]);
/** 高さ u の水平な面が画面を横切る線。角で折れ、両端は画面の外まで伸ばす */
const lkTrace = (u: number, x0 = 24, x1 = 1896): [number, number][] => {
  const c = lkP(-1, 0, u);
  const ext = (q: [number, number], tx: number): [number, number] =>
    [tx, c[1] + (q[1] - c[1]) * ((tx - c[0]) / (q[0] - c[0]))];
  return [ext(lkP(-1, 1, u), x0), c, ext(lkP(1, 1, u), x1)];
};
/** 折れ線を赤い破線の「制限」として引く */
const LkLimit: React.FC<{ pts: [number, number][]; color?: string; dash?: boolean }> = ({
  pts, color = KRP.red, dash = false,
}) => (
  <g>
    <polyline points={lkPts(pts)} fill="none" stroke={KRP.ink}
      strokeWidth={dash ? 7 : 15} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={dash ? "24 20" : undefined} opacity={dash ? 0.55 : 1} />
    {!dash && (
      <polyline points={lkPts(pts)} fill="none" stroke={color}
        strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="34 22" />
    )}
  </g>
);

/** 見上げた1面 (窓・胴差・ピラスター・軒・歯飾り・パラペット) */
const LkFace: React.FC<{ side: number; cols: number }> = ({ side, cols }) => {
  const R = 6;            // 階数
  const U0 = 0.17;        // 基壇の上端
  const rh = (1 - U0) / R;
  const ln = (d0: number, d1: number, u0: number, u1: number, sw: number, op = 1, col = KRP.ink) => {
    const a = lkP(side, d0, u0), b = lkP(side, d1, u1);
    return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={col} strokeWidth={sw} opacity={op} />;
  };
  const pil = [0, Math.round(cols / 2) / cols, 1];
  return (
    <g>
      {/* 胴 */}
      <polygon points={lkQuad(side, 0, 1, 0, 1)} fill={C.paper} stroke={KRP.ink} strokeWidth={7} />
      {/* 基壇の石積み */}
      <polygon points={lkQuad(side, 0, 1, 0, U0)} fill={C.rock} stroke={KRP.ink} strokeWidth={6} opacity={0.94} />
      <g>
        {[0.055, 0.112].map((v) => <g key={v}>{ln(0, 1, v, v, 2.6, 0.42)}</g>)}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={`s${i}`}>{ln((i + 0.5) / 9, (i + 0.5) / 9, 0.055, 0.112, 2.6, 0.42)}</g>
        ))}
      </g>
      {/* 窓 (枠・中桟・窓台まで) */}
      {Array.from({ length: R }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const a = U0 + rh * (r + 0.2), b = U0 + rh * (r + 0.82);
          const d0 = (c + 0.2) / cols, d1 = (c + 0.8) / cols;
          const md = (d0 + d1) / 2, mu = (a + b) / 2;
          return (
            <g key={`${r}-${c}`}>
              <polygon points={lkQuad(side, d0 - 0.014, d1 + 0.014, a - 0.022, a)}
                fill={C.dust} stroke={KRP.ink} strokeWidth={2.6} />
              <polygon points={lkQuad(side, d0, d1, a, b)}
                fill={BP.glass} stroke={KRP.ink} strokeWidth={3.8} opacity={0.9} />
              {ln(md, md, a, b, 2.4, 0.9)}
              {ln(d0, d1, mu, mu, 2.4, 0.9)}
            </g>
          );
        }),
      )}
      {/* 胴差 (階の帯) */}
      {Array.from({ length: R - 1 }, (_, i) => (
        <g key={`b${i}`}>{ln(0, 1, U0 + rh * (i + 1), U0 + rh * (i + 1), 3, 0.4)}</g>
      ))}
      {/* ピラスター (柱型) */}
      {pil.map((d) => (
        <polygon key={d} points={lkQuad(side, Math.max(0, d - 0.03), Math.min(1, d + 0.03), U0, 1)}
          fill={C.dust} stroke={KRP.ink} strokeWidth={4} opacity={0.72} />
      ))}
      {/* 歯飾り → 軒 → パラペット */}
      {Array.from({ length: 12 }, (_, i) => (
        <polygon key={`d${i}`} points={lkQuad(side, (i + 0.22) / 12, (i + 0.78) / 12, 0.952, 0.985)}
          fill={C.dust} stroke={KRP.ink} strokeWidth={2.6} />
      ))}
      <polygon points={lkQuad(side, 0, 1.035, 0.985, 1.045)} fill={C.dust} stroke={KRP.ink} strokeWidth={6} />
      <polygon points={lkQuad(side, 0, 1.012, 1.045, 1.088)} fill={KRP.white} stroke={KRP.ink} strokeWidth={6} />
    </g>
  );
};

/** 屋上の塔屋と水槽 (線から出ていた「頭」)。見上げているので軒の向こうに立つ */
const LkPent: React.FC<{ side: number }> = ({ side }) => (
  <g>
    <polygon points={lkQuad(side, 0.03, 0.19, 1.088, 1.42)} fill={C.paper} stroke={KRP.ink} strokeWidth={6} />
    {[0, 1].map((i) => (
      <polygon key={i} points={lkQuad(side, 0.055 + i * 0.07, 0.1 + i * 0.07, 1.17, 1.33)}
        fill={BP.glass} stroke={KRP.ink} strokeWidth={3.4} opacity={0.9} />
    ))}
    <polygon points={lkQuad(side, 0.018, 0.202, 1.42, 1.46)} fill={C.dust} stroke={KRP.ink} strokeWidth={5} />
    {[0.062, 0.112, 0.162].map((d) => (
      <polygon key={d} points={lkQuad(side, d - 0.009, d + 0.009, 1.46, 1.53)}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
    ))}
    <polygon points={lkQuad(side, 0.048, 0.176, 1.53, 1.66)} fill={C.sea} stroke={KRP.ink} strokeWidth={5.5} />
    <polygon points={lkQuad(side, 0.048, 0.176, 1.58, 1.6)} fill={C.seaDark} stroke="none" opacity={0.75} />
  </g>
);

/** 街の電柱 (見上げを支える添景)。h が小さいほど遠い */
const LkPole: React.FC<{ x: number; base: number; top: number; arms: number }> = ({ x, base, top, arms }) => {
  const w = Math.max(7, (base - top) * 0.034);
  return (
    <g>
      <rect x={x - w} y={top} width={w * 2} height={base - top}
        fill={BP.woodDark} stroke={KRP.ink} strokeWidth={4.5} />
      {Array.from({ length: arms }, (_, i) => {
        const ay = top + 24 + i * ((base - top) * 0.1);
        const aw = (base - top) * 0.1;
        return (
          <g key={i}>
            <rect x={x - aw} y={ay} width={aw * 2} height={w * 0.9}
              fill={BP.wood} stroke={KRP.ink} strokeWidth={3.6} />
            {[-1, 1].map((sg) => (
              <circle key={sg} cx={x + sg * aw * 0.7} cy={ay - w * 0.8} r={w * 0.52}
                fill={KPP.glass} stroke={KRP.ink} strokeWidth={3} />
            ))}
          </g>
        );
      })}
      <rect x={x - w * 1.5} y={base - 14} width={w * 3} height={14}
        fill={C.rock} stroke={KRP.ink} strokeWidth={3.5} />
    </g>
  );
};

// ===== #209 だから31メートルに切り上げた。それだけです。 =====
// 格: 図 → ★路上からの「見上げ」に振り直した (検品: #208 と同じ建物・同じ角度の使い回し)
// どこ: 百尺のビルを、向かいの歩道から仰いだ2点透視。電柱と電線、仰ぐ3人
// 演出: 軒の高さにあった赤い制限線が、塔屋と水槽を越える高さまで持ち上がる
// 動き: 旧30.0mが灰の破線で残る → 赤い折れ線が上がる → +0.7m の寸法 → ○ → 札
// 絵: 見上げたビル。線が30.0から31.0へ持ち上がり、頭がすっぽり収まる。○
const Kb5dKiriageta: React.FC<{ f: number }> = ({ f }) => {
  const up = easeOut(seg(f, 8, 30));
  const U_OLD = 1.0;                       // 30.0m = 軒 (屋上スラブ)
  const U_NEW = 1.95;                      // 31.0m = 切り上げた線 (水槽の上)
  const red = lkTrace(lerp(U_OLD, U_NEW, up));
  const ground = lkTrace(0, -40, 1960);
  const curb = lkTrace(-0.085, -40, 1960);
  const sway = Math.sin(f / 23) * 3;
  return (
    <Frame f={f} seed={830} bg={KRP.cream}>
      {/* 空 (見上げているので画面の上半分は空) */}
      <rect x={0} y={0} width={W} height={620} fill={KPP.sky} opacity={0.5} />
      <rect x={0} y={420} width={W} height={200} fill={C.dust} opacity={0.18} />
      {/* 車道 → 歩道 (足元の面も角で折れる) */}
      <polygon points={`${lkPts(curb)} 1960,1120 -40,1120`} fill={C.dust} stroke="none" opacity={0.62} />
      <polygon points={`${lkPts(ground)} ${lkPts([...curb].reverse())}`}
        fill={C.rock} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
        {Array.from({ length: 16 }, (_, i) => {
          const d = (i + 1) / 8;
          const sd = d <= 1 ? -1 : 1;
          const dd = d <= 1 ? d : d - 1;
          const a = lkP(sd, dd, 0), b = lkP(sd, dd, -0.085);
          return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
        })}
      </g>
      <polyline points={lkPts(curb)} fill="none" stroke={KRP.ink} strokeWidth={6} opacity={0.75} />
      {/* ★見上げたビル (2面) */}
      <LkFace side={-1} cols={6} />
      <LkFace side={1} cols={5} />
      <LkPent side={-1} />
      <LkPent side={1} />
      {/* 手前の角の稜線 (ここがいちばん近い) */}
      <line x1={LK.cx} y1={LK.cBot} x2={LK.cx} y2={lkP(-1, 0, 1.088)[1]}
        stroke={KRP.ink} strokeWidth={8} />
      {/* 玄関 (角の足元) */}
      <polygon points={lkQuad(-1, 0, 0.1, 0, 0.125)} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
      <polygon points={lkQuad(1, 0, 0.085, 0, 0.125)} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5.5} />
      <polygon points={lkQuad(-1, 0, 0.115, 0.125, 0.152)} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      <polygon points={lkQuad(1, 0, 0.1, 0.125, 0.152)} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
      {/* 電柱と電線 (街の中にいることを置く) */}
      <LkPole x={96} base={790} top={150} arms={3} />
      <LkPole x={1636} base={768} top={430} arms={2} />
      <g fill="none" stroke={BP.wire} strokeWidth={4.5} opacity={0.85}>
        {[0, 1, 2].map((i) => (
          <path key={i}
            d={`M ${96} ${186 + i * 64} Q 880 ${300 + i * 56 + sway} ${1636} ${452 + i * 32}`} />
        ))}
      </g>
      {/* もとの 30.0m (軒の高さ) は灰の破線で残す */}
      <LkLimit pts={lkTrace(U_OLD)} dash />
      {/* 収まった印: 2本の線の間を薄い緑で */}
      <g opacity={easeOut(seg(f, 24, 38)) * 0.45}>
        <polygon points={`${lkPts(red)} ${lkPts([...lkTrace(U_OLD)].reverse())}`} fill={KRP.green} />
      </g>
      {/* ★切り上げた 31.0m */}
      <LkLimit pts={red} />
      <Kb5dDimV x={96} y0={513} y1={412} label="+0.7m" t={seg(f, 20, 34)} color={KRP.red} size={30} tick={22} />
      <Maru x={1010} y={286} s={1.45} t={seg(f, 30, 42)} />
      {/* 仰いでいる人 (目の高さ = 地平。だから頭はみな同じ高さに並ぶ) */}
      <Person x={238} y={796} s={0.36} f={f} cloth="#3E4B66" clothDark="#2E3850"
        gaze={[0.3, -0.9]} phase={1} />
      <Person x={430} y={800} s={0.37} f={f} cloth="#6B5B45" clothDark="#4D4130"
        gaze={[0.35, -0.9]} phase={4} />
      <Person x={1548} y={793} s={0.35} f={f} cloth="#6A4A4A" clothDark="#4C3333"
        gaze={[-0.4, -0.9]} phase={7} />
      <TagPlate x={360} y={262} text="制限 31.0m" size={40} t={seg(f, 24, 38)} color={KRP.red} />
      <TagPlate x={1232} y={556} text="百尺" size={44} t={seg(f, 4, 16)} />
      <TagPlate x={1560} y={648} text="適法" size={46} t={seg(f, 30, 42)} color={KRP.green} />
      <TagPlate x={424} y={664} text="切り上げ" size={42} t={seg(f, 26, 40)} />
    </Frame>
  );
};

// ===== #210 これが、1970年の改正でなくなりました。 =====
// 格: 並
// どこ: 街の通り。頭を同じ高さで揃えられた既存のビルが並ぶ (灰色の街)
// 演出: 頭を押さえていた赤い線が左から消えていき、1棟だけが線を越えて鉄骨を伸ばす
// 動き: 線が消える / 棟が伸びる / クレーンの吊り荷が上がる / 手前の人が見上げる
// 絵: 赤い線が消えていく街。1棟だけが線を越えて伸びはじめる。足場とクレーン、見上げる人
const Kb5dN1970Kaisei: React.FC<{ f: number }> = ({ f }) => {
  const CAP = 356;                                  // 昔の頭の高さ (31m の線)
  const GY = 788;                                   // 道の高さ
  const grow = easeOut(seg(f, 10, 40));
  const top = lerp(CAP, 118, grow);                 // 伸びていく棟の頭
  // 右から消えていく。左にだけ名残を残す (消えきると「線があった」ことが伝わらない)
  const erase = 1 - 0.72 * easeOut(seg(f, 4, 34));
  const hook = 318 + Math.sin((f - 6) / 9) * 52;
  // 既存のビル (頭はぜんぶ CAP で揃っている)
  const rows: [number, number, number, number][] = [
    // x0, 幅, 頭のy, 窓の列数
    [40, 232, CAP + 6, 4],
    [292, 214, CAP + 26, 3],
    [524, 220, CAP + 2, 4],
    [1206, 232, CAP + 18, 4],
    [1456, 228, CAP + 4, 4],
    [1704, 216, CAP + 24, 3],
  ];
  return (
    <Frame f={f} seed={831} bg={KRP.cream}>
      {/* 空 (街の灰) */}
      <rect x={0} y={0} width={W} height={GY} fill={C.cityPale} opacity={0.6} />
      <rect x={0} y={GY - 230} width={W} height={230} fill={C.dust} opacity={0.26} />
      {/* 鳥 (空が無地にならないように) */}
      <g stroke={KRP.ink} strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round">
        {[[238, 112, 1], [312, 150, 0.86], [180, 168, 0.74], [1682, 182, 0.9], [1766, 224, 0.76]].map(
          ([bx, by, bs], i) => {
            const flap = 8 + Math.sin((f + i * 9) / 6) * 7;
            return (
              <path key={i}
                d={`M ${bx - 26 * bs} ${by} Q ${bx - 13 * bs} ${by - flap * bs} ${bx} ${by} Q ${bx + 13 * bs} ${by - flap * bs} ${bx + 26 * bs} ${by}`} />
            );
          },
        )}
      </g>
      {/* 既存のビル */}
      {rows.map(([x0, bw, ty, nc], i) => {
        const nr = Math.max(3, Math.round((GY - ty) / 62));
        return (
          <g key={i}>
            <rect x={x0} y={ty} width={bw} height={GY - ty}
              fill={i % 2 ? C.cityPale : C.paper} stroke={KRP.ink} strokeWidth={6} />
            {/* 右の陰 (厚みを出す) */}
            <rect x={x0 + bw - 20} y={ty} width={20} height={GY - ty} fill={C.cityDark} opacity={0.22} />
            <rect x={x0 - 8} y={ty - 16} width={bw + 16} height={22}
              fill={C.cityDark} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
            {/* 屋上の小屋と水槽 */}
            <rect x={x0 + bw * 0.5 - 34} y={ty - 50} width={68} height={36}
              fill={C.paper} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={x0 + bw * 0.5 - 16} y={ty - 72} width={32} height={24} rx={4}
              fill={BP.glass} stroke={KRP.ink} strokeWidth={3.5} />
            {/* 屋上の手すりとアンテナ */}
            <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.75}>
              {Array.from({ length: 5 }, (_, k) => (
                <line key={k} x1={x0 + 16 + k * ((bw - 32) / 4)} y1={ty - 16}
                  x2={x0 + 16 + k * ((bw - 32) / 4)} y2={ty - 38} />
              ))}
              <line x1={x0 + 16} y1={ty - 38} x2={x0 + bw - 16} y2={ty - 38} />
              <line x1={x0 + bw - 42} y1={ty - 16} x2={x0 + bw - 42} y2={ty - 102} strokeWidth={5} />
              <line x1={x0 + bw - 58} y1={ty - 78} x2={x0 + bw - 26} y2={ty - 78} />
              <line x1={x0 + bw - 52} y1={ty - 96} x2={x0 + bw - 32} y2={ty - 96} />
            </g>
            {Array.from({ length: nr }, (_, r) =>
              Array.from({ length: nc }, (_, c) => (
                <rect key={`${r}-${c}`}
                  x={x0 + 18 + c * ((bw - 36) / nc)} y={ty + 24 + r * ((GY - ty - 40) / nr)}
                  width={(bw - 36) / nc - 16} height={(GY - ty - 40) / nr - 18} rx={2}
                  fill={rnd(i * 9 + r * 5 + c) > 0.45 ? BP.glass : C.cityDark}
                  opacity={0.8} stroke={KRP.ink} strokeWidth={2.6} />
              )),
            )}
            {/* 1階の店先 (庇と入口) */}
            <rect x={x0} y={GY - 86} width={bw} height={86} fill={C.paper} stroke={KRP.ink} strokeWidth={5} />
            <rect x={x0 - 6} y={GY - 92} width={bw + 12} height={16} rx={5}
              fill={i % 2 ? C.graphBlue : C.rock} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
            <rect x={x0 + bw * 0.5 - 30} y={GY - 68} width={60} height={68}
              fill={BP.glass} stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
            <rect x={x0} y={GY - 34} width={bw} height={34} fill={C.rock} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
          </g>
        );
      })}
      {/* ★伸びはじめた1棟 (既成部分 + その上の鉄骨) */}
      <g>
        <rect x={792} y={CAP} width={282} height={GY - CAP}
          fill={C.paper} stroke={KRP.ink} strokeWidth={7} />
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => (
            <rect key={`${r}-${c}`} x={812 + c * 62} y={CAP + 26 + r * 52} width={44} height={36} rx={2}
              fill={BP.glass} opacity={0.85} stroke={KRP.ink} strokeWidth={2.8} />
          )),
        )}
        {/* 伸びる鉄骨 (柱3本 + 梁 + 筋交い) */}
        <g stroke={KRP.ink} strokeWidth={5}>
          {[822, 933, 1044].map((cx) => (
            <rect key={cx} x={cx - 11} y={top} width={22} height={CAP - top}
              fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
          ))}
          {Array.from({ length: Math.max(1, Math.round((CAP - top) / 64)) }, (_, i) => {
            const yy = CAP - (i + 1) * 64;
            if (yy < top - 6) return null;
            return (
              <g key={i}>
                <rect x={812} y={yy - 9} width={242} height={18} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4.5} />
                <line x1={822} y1={yy + 55} x2={933} y2={yy} stroke={BP.steelDark} strokeWidth={8} />
                <line x1={1044} y1={yy + 55} x2={933} y2={yy} stroke={BP.steelDark} strokeWidth={8} />
              </g>
            );
          })}
        </g>
        {/* 足場 (外側の枠と踏板) */}
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.95}>
          {[776, 1090].map((cx) => (
            <line key={cx} x1={cx} y1={GY} x2={cx} y2={top - 26} stroke={BP.wood} strokeWidth={10} />
          ))}
          {Array.from({ length: 12 }, (_, i) => {
            const yy = GY - 20 - i * 66;
            if (yy < top - 26) return null;
            return <rect key={i} x={770} y={yy} width={326} height={9} fill={BP.woodLight} stroke={KRP.ink} strokeWidth={3} />;
          })}
        </g>
        {/* 養生シート */}
        <rect x={778} y={top + 20} width={310} height={Math.max(0, 150)} fill={KRP.white} opacity={0.3} />
      </g>
      {/* クレーン (マスト・ジブ・カウンタ・吊り荷) */}
      <g>
        <g stroke={KRP.ink} strokeWidth={5}>
          <rect x={1118} y={118} width={40} height={GY - 118} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={1118} y1={GY - 20 - i * 60} x2={1158} y2={GY - 56 - i * 60} stroke={BP.brassDark} strokeWidth={5} />
          ))}
        </g>
        <rect x={1138} y={96} width={70} height={34} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
        <rect x={920} y={106} width={620} height={16} fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <rect x={1180} y={82} width={120} height={26} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4.5} opacity={0.9} />
        <line x1={1000} y1={122} x2={1000} y2={hook} stroke={BP.wire} strokeWidth={5} />
        <rect x={960} y={hook} width={80} height={26} rx={4} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={974} y1={hook + 13} x2={1026} y2={hook + 13} n={3} r={5} fill={BP.ironDark} />
      </g>
      {/* 道 */}
      <rect x={0} y={GY} width={W} height={H - GY} fill={C.dust} opacity={0.55} />
      <line x1={0} y1={GY} x2={W} y2={GY} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={KRP.white} strokeWidth={9} opacity={0.8}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={40 + i * 180} y1={822} x2={140 + i * 180} y2={822} />
        ))}
      </g>
      {/* ★消えていく赤い線 */}
      <Kb5dLimitLine y={CAP - 22} t={1} wipe={erase} />
      {/* 消えたあとの名残 (ここに線があった) */}
      <line x1={120} y1={CAP - 22} x2={1860} y2={CAP - 22} stroke={KRP.red} strokeWidth={4}
        strokeDasharray="10 26" opacity={0.3 * easeOut(seg(f, 12, 34))} />
      {/* 鉄骨を積んだ平台トラック (ビルの大きさを測る物差し) */}
      <g>
        <rect x={1222} y={762} width={208} height={44} rx={5} fill={C.graphBlue} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={1392} y={726} width={76} height={80} rx={7} fill={C.graphBlue} stroke={KRP.ink} strokeWidth={5.5} />
        <rect x={1404} y={740} width={48} height={32} rx={4} fill={BP.glass} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        {/* 荷台の鉄骨 */}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={1232} y={742 - k * 12} width={150} height={11} rx={3}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={3.5} />
        ))}
        {[1266, 1352, 1430].map((wx) => (
          <g key={wx}>
            <circle cx={wx} cy={810} r={22} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
            <circle cx={wx} cy={810} r={8} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={3} />
          </g>
        ))}
      </g>
      {/* 工事のコーンと看板 */}
      <g>
        {[612, 690].map((cx) => (
          <g key={cx}>
            <polygon points={`${cx},772 ${cx - 17},818 ${cx + 17},818`} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4.5} />
            <rect x={cx - 23} y={814} width={46} height={10} rx={3} fill={KRP.orange} stroke={KRP.ink} strokeWidth={4} />
            <line x1={cx - 12} y1={798} x2={cx + 12} y2={798} stroke={KRP.white} strokeWidth={6} />
          </g>
        ))}
        <g>
          <rect x={1510} y={736} width={150} height={66} rx={6} fill={KRP.yellow} stroke={KRP.ink} strokeWidth={5.5} />
          <line x1={1524} y1={756} x2={1646} y2={756} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          <line x1={1524} y1={778} x2={1600} y2={778} stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
          <line x1={1530} y1={802} x2={1530} y2={824} stroke={KRP.ink} strokeWidth={6} />
          <line x1={1640} y1={802} x2={1640} y2={824} stroke={KRP.ink} strokeWidth={6} />
        </g>
      </g>
      {/* 見上げる人 (ビルの大きさが伝わる寸法。脚は y=830 より上に収める) */}
      <Person x={250} y={818} s={0.6} f={f} cloth="#3E4B66" clothDark="#2E3850"
        gaze={[0.25, -0.9]} helmet={false} phase={1} />
      <Person x={386} y={824} s={0.54} f={f} cloth="#6B5B45" clothDark="#4D4130"
        gaze={[0.3, -0.9]} phase={3} />
      <Person x={1120} y={820} s={0.56} f={f} cloth="#7A6A4A" clothDark="#5A4E34"
        gaze={[-0.2, -0.9]} helmet phase={6} />
      <Arrow x={800} y={262} s={1.1} rot={0} t={seg(f, 26, 38)} />
      <TagPlate x={1560} y={452} text="1970 改正" size={44} t={seg(f, 6, 20)} />
      <TagPlate x={1560} y={576} text="高さ制限なし" size={40} t={seg(f, 22, 36)} color={KRP.red} />
      <TagPlate x={388} y={218} text="上へ" size={44} t={seg(f, 30, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #211/#212 で共通に使う基準階の平面図。座標は完全に同じ (連番) =====
const PL = {
  sx0: 300, sx1: 1640, sy0: 182, sy1: 730,   // 敷地 (同じ土地)
  bx0: 360, bx1: 1580, by0: 212, by1: 700,   // 外壁の外側
  ix0: 374, ix1: 1566, iy0: 226, iy1: 686,   // 内側
  cx1: 506,                                   // コア (EV・階段) の右端
  cy0: 424, cy1: 508,                         // 共用廊下の帯
};
const PL_P4 = [771, 1036, 1301];                                // 4部屋のときの間仕切り
const PL_P6 = [682.7, 859.3, 1036, 1212.7, 1389.3];             // 6部屋のときの間仕切り
const PL_C4 = [638.5, 903.5, 1168.5, 1433.5];                   // 4部屋の中心
const PL_C6 = [590.3, 771, 947.7, 1124.3, 1301, 1477.7];        // 6部屋の中心

const Kb5dPlan: React.FC<{ f: number; six?: number; hatchWipe?: number }> = ({ f, six = 0, hatchWipe = 1 }) => {
  const sx = clamp01(six);
  // もとの3枚は左へ滑り、新しい2枚が右に現れる
  const moved = PL_P4.map((x, i) => lerp(x, PL_P6[i], sx));
  const added = [PL_P6[3], PL_P6[4]];
  const wall = (x: number, o = 1) => (
    <g key={`w${x}`} opacity={o}>
      <rect x={x - 7} y={PL.iy0} width={14} height={PL.cy0 - PL.iy0} fill={C.rock} stroke={KRP.ink} strokeWidth={4.5} />
      <rect x={x - 7} y={PL.cy1} width={14} height={PL.iy1 - PL.cy1} fill={C.rock} stroke={KRP.ink} strokeWidth={4.5} />
    </g>
  );
  return (
    <g>
      {/* 敷地の境界 (一点鎖線) */}
      <rect x={PL.sx0} y={PL.sy0} width={PL.sx1 - PL.sx0} height={PL.sy1 - PL.sy0}
        fill="none" stroke={C.mapLine} strokeWidth={6} strokeDasharray="40 14 8 14" />
      {/* 床 */}
      <rect x={PL.bx0} y={PL.by0} width={PL.bx1 - PL.bx0} height={PL.by1 - PL.by0}
        fill={C.paper} stroke={KRP.ink} strokeWidth={9} />
      {/* 外壁の内側線 (二重線で壁厚を出す) */}
      <rect x={PL.ix0} y={PL.iy0} width={PL.ix1 - PL.ix0} height={PL.iy1 - PL.iy0}
        fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
      {/* コア: エレベーター2基と階段 */}
      <rect x={PL.ix0} y={PL.iy0} width={PL.cx1 - PL.ix0} height={PL.iy1 - PL.iy0}
        fill={C.cityPale} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={PL.ix0 + 18} y={PL.iy0 + 24 + i * 96} width={96} height={82}
            fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
          <line x1={PL.ix0 + 18} y1={PL.iy0 + 24 + i * 96} x2={PL.ix0 + 114} y2={PL.iy0 + 106 + i * 96} stroke={KRP.ink} strokeWidth={3} />
          <line x1={PL.ix0 + 114} y1={PL.iy0 + 24 + i * 96} x2={PL.ix0 + 18} y2={PL.iy0 + 106 + i * 96} stroke={KRP.ink} strokeWidth={3} />
        </g>
      ))}
      <g>
        <rect x={PL.ix0 + 18} y={PL.iy1 - 190} width={96} height={166}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={4.5} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={PL.ix0 + 18} y1={PL.iy1 - 184 + i * 20} x2={PL.ix0 + 114} y2={PL.iy1 - 184 + i * 20}
            stroke={KRP.ink} strokeWidth={2.8} />
        ))}
      </g>
      {/* ★共用廊下の帯 */}
      <rect x={PL.cx1} y={PL.cy0} width={PL.ix1 - PL.cx1} height={PL.cy1 - PL.cy0}
        fill={C.cityPale} stroke={KRP.ink} strokeWidth={5} opacity={0.75} />
      <Kb5dHatch x={PL.cx1 + 3} y={PL.cy0 + 3} w={PL.ix1 - PL.cx1 - 6} h={PL.cy1 - PL.cy0 - 6}
        color={C.graphRed} pitch={22} sw={4} opacity={0.75} wipe={hatchWipe} />
      {/* 廊下の両側の壁 */}
      <line x1={PL.cx1} y1={PL.cy0} x2={PL.ix1} y2={PL.cy0} stroke={KRP.ink} strokeWidth={6} />
      <line x1={PL.cx1} y1={PL.cy1} x2={PL.ix1} y2={PL.cy1} stroke={KRP.ink} strokeWidth={6} />
      {/* 間仕切り */}
      {moved.map((x) => wall(x))}
      {added.map((x) => wall(x, easeOut(sx)))}
      {/* 住戸の中身 (玄関の開口・水回りの箱) */}
      {PL_C6.map((cxr, i) => {
        const show = i < 4 ? 1 : easeOut(sx);
        const cxx = i < 4 ? lerp(PL_C4[i], cxr, sx) : cxr;
        return (
          <g key={i} opacity={show}>
            {[1, -1].map((sg) => {
              const yc = sg > 0 ? PL.cy0 : PL.cy1;
              return (
                <g key={sg}>
                  {/* 玄関の開口 (廊下から入る) */}
                  <rect x={cxx - 26} y={yc - 4} width={52} height={8} fill={KRP.white} stroke="none" />
                  <path d={`M ${cxx - 26} ${yc} L ${cxx - 26} ${yc - sg * 50} A 50 50 0 0 1 ${cxx + 24} ${yc}`}
                    fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.65} />
                  {/* 水回りの箱 */}
                  <rect x={cxx - 54} y={sg > 0 ? PL.iy0 + 14 : PL.iy1 - 70} width={56} height={56}
                    fill={C.sea} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
                </g>
              );
            })}
          </g>
        );
      })}
      {/* 寸法線 (矢羽の下端が y=830 の安全圏に収まる高さに引く) */}
      <Kb5dDimH y={752} x0={PL.bx0} x1={PL.bx1} label="敷地の幅" t={seg(f, 2, 16)} />
      <Kb5dDimV x={252} y0={PL.by1} y1={PL.by0} label="奥行" t={seg(f, 2, 16)} size={32} />
    </g>
  );
};

// ===== #211 そして1997年、共用廊下が容積率から外れます。 =====
// 格: 図
// どこ: クリームの方眼紙。タワマンの基準階の平面図ひとつを画面いっぱいに
// 演出: 真ん中を走る共用廊下だけが赤いハッチで塗られ、それが左から消える = 勘定から外れる
// 動き: 寸法線が引かれる → 廊下のハッチが左から消える → 札が出る
// 絵: 平面図。廊下の部分のハッチが消えて、面積の勘定から外れる。寸法線と札
const Kb5dN1997Rouka: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={832} bg={KRP.cream}>
    <GridPaper />
    {/* 全部消すと「ハッチがあった」ことが伝わらないので、左に名残を残す */}
    <Kb5dPlan f={f} six={0} hatchWipe={1 - 0.74 * easeOut(seg(f, 10, 32))} />
    <Arrow x={1636} y={466} s={1.0} rot={180} t={seg(f, 8, 20)} />
    <TagPlate x={1770} y={300} text="共用廊下" size={42} t={seg(f, 6, 20)} />
    <TagPlate x={1770} y={440} text="容積率の外" size={38} t={seg(f, 20, 34)} color={KRP.red} />
    <TagPlate x={1770} y={570} text="8部屋" size={40} t={seg(f, 28, 42)} />
    <TagPlate x={150} y={742} text="基準階" size={36} t={seg(f, 2, 14)} />
    <TagPlate x={170} y={300} text="1997" size={44} t={seg(f, 2, 14)} />
  </Frame>
);

// ===== #212 で使う斜め(アイソメ)の投影 =====
// #211 が「真上からの平面図」なので、#212 は同じ基準階を斜め上から見た紙の模型にする。
// カメラを変えて別の絵にするのが目的 (同じ図を2枚続けない)。
const IZ = { a: 0.78, b: 0.3, cx: 636, cy: 278 };
const ipx = (x: number, y: number) => IZ.cx + (x - y) * IZ.a;
const ipy = (x: number, y: number, z = 0) => IZ.cy + (x + y) * IZ.b - z;

/** 斜めの箱ひとつ。上面と手前2面だけ描く = 紙で作った模型の見え方 */
const Kb5dIsoBox: React.FC<{
  x0: number; y0: number; x1: number; y1: number; z0: number; z1: number;
  top: string; sideL?: string; sideR?: string; sw?: number; o?: number;
}> = ({ x0, y0, x1, y1, z0, z1, top, sideL = C.rock, sideR, sw = 4.5, o = 1 }) => {
  if (z1 - z0 < 0.6 || x1 - x0 < 0.6 || y1 - y0 < 0.6) return null;
  const P = (x: number, y: number, z: number) => `${ipx(x, y).toFixed(1)},${ipy(x, y, z).toFixed(1)}`;
  return (
    <g opacity={o} stroke={KRP.ink} strokeWidth={sw} strokeLinejoin="round">
      <polygon points={[P(x0, y1, z1), P(x1, y1, z1), P(x1, y1, z0), P(x0, y1, z0)].join(" ")} fill={sideL} />
      <polygon points={[P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0), P(x1, y0, z0)].join(" ")} fill={sideR ?? sideL} />
      <polygon points={[P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)].join(" ")} fill={top} />
    </g>
  );
};

/** 斜めの平らな面 (床・敷地)。z 一定 */
const Kb5dIsoFace: React.FC<{
  x0: number; y0: number; x1: number; y1: number; z: number;
  fill: string; stroke?: string; sw?: number; dash?: string; o?: number;
}> = ({ x0, y0, x1, y1, z, fill, stroke = KRP.ink, sw = 5, dash, o = 1 }) => (
  <polygon
    points={[[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
      .map(([x, y]) => `${ipx(x, y).toFixed(1)},${ipy(x, y, z).toFixed(1)}`)
      .join(" ")}
    fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} opacity={o} strokeLinejoin="round" />
);

// ===== #212 同じ土地に、売れる部屋をもっと作れる。 =====
// 格: 並
// どこ: #211 と同じ基準階。ただしカメラを変えて、斜め上から見た紙の模型にする
// 演出: 動かない敷地の一点鎖線の上で、間仕切りが滑って部屋が 8→12 になる。増えた4部屋は赤い旗
// 動き: 間仕切りが滑る → 新しい2枚が立ち上がる → 旗が立つ → 手前の2人が見上げる
// 絵: 斜めから見た基準階の模型。12部屋ぜんぶに「売」の旗、水回りの箱、玄関。手前に見る2人
const Kb5dHeyaWoMotto: React.FC<{ f: number }> = ({ f }) => {
  const six = easeOut(seg(f, 4, 26));             // 間仕切りが滑る
  const rise = easeOut(seg(f, 16, 32));           // 新しい間仕切りが立つ
  const zoom = 1 + 0.025 * easeOut(seg(f, 0, 42));
  // 平面の寸法 (y が大きいほど手前)
  const PX1 = 1260, CORE = 180, WT = 14;
  const RY0 = 14, RY1 = 170;                      // 奥の部屋
  const HW0 = 170, HW1 = 230;                     // 共用廊下 (壁の内側)
  const FY0 = 244, FY1 = 400;                     // 手前の部屋
  const BY1 = 430;                                // バルコニーの先端
  const ZF = 22, ZW = 78;                         // 床の上端 / 部屋の壁の頭
  const SX0 = -44, SX1 = 1304, SY0 = -44, SY1 = 474;   // 敷地 (動かさない)
  // 4部屋 → 6部屋。#211 と同じ考え方で、3枚が滑って2枚が増える
  const p4 = [450, 720, 990], p6 = [360, 540, 720];
  const moved = p4.map((x, i) => lerp(x, p6[i], six));
  const addedX = [900, 1080];
  const c4 = [315, 585, 855, 1125];
  const c6 = [270, 450, 630, 810, 990, 1170];
  const centerOf = (i: number) => (i < 4 ? lerp(c4[i], c6[i], six) : c6[i]);
  // 1部屋ぶんの作り込み (水回りの箱・玄関の戸・「売」の旗)
  const Room: React.FC<{ i: number; back: boolean }> = ({ i, back }) => {
    const cx = centerOf(i);
    const show = i < 4 ? 1 : rise;
    if (show <= 0.02) return null;
    const y0 = back ? RY0 : FY0;
    const y1 = back ? RY1 : FY1;
    const wetY0 = back ? y0 + 6 : y1 - 62;        // 水回りは外壁側に寄せる
    const doorY = back ? HW0 : HW1;
    const newRoom = i >= 4;
    const poleTop = ZW + 66;
    return (
      <g opacity={show}>
        {/* 水回りの箱 */}
        <Kb5dIsoBox x0={cx - 30} y0={wetY0} x1={cx + 34} y1={wetY0 + 56} z0={ZF} z1={ZF + 26}
          top={C.sea} sideL={C.seaDark} sideR={C.seaDark} sw={3.6} o={0.92} />
        {/* 玄関の戸 (廊下の壁にはめた板) */}
        <Kb5dIsoBox x0={cx - 28} y0={doorY} x1={cx + 28} y1={doorY + WT} z0={ZF} z1={ZF + 50}
          top={BP.woodLight} sideL={BP.wood} sideR={BP.woodDark} sw={3.4} />
        {/* 「売」の旗 (増えた部屋は赤) */}
        <g>
          <line x1={ipx(cx, (y0 + y1) / 2)} y1={ipy(cx, (y0 + y1) / 2, ZF)}
            x2={ipx(cx, (y0 + y1) / 2)} y2={ipy(cx, (y0 + y1) / 2, poleTop)}
            stroke={KRP.ink} strokeWidth={4.5} strokeLinecap="round" />
          <rect x={ipx(cx, (y0 + y1) / 2)} y={ipy(cx, (y0 + y1) / 2, poleTop)} width={42} height={32} rx={3}
            fill={newRoom ? C.graphRed : C.graphBlue} stroke={KRP.ink} strokeWidth={4} />
          <text x={ipx(cx, (y0 + y1) / 2) + 21} y={ipy(cx, (y0 + y1) / 2, poleTop) + 25}
            textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={KRP.white}>売</text>
        </g>
      </g>
    );
  };
  return (
    <Frame f={f} seed={833} bg={KRP.cream}>
      <GridPaper />
      <g transform={zoomAt(zoom, 960, 500)}>
        {/* ★動かない敷地 (#211 と同じ「同じ土地」) */}
        <Kb5dIsoFace x0={SX0} y0={SY0} x1={SX1} y1={SY1} z={0}
          fill={C.paper} stroke={C.mapLine} sw={6} dash="40 14 8 14" o={0.72} />
        {/* 床スラブ (厚みを見せる) */}
        <Kb5dIsoBox x0={0} y0={0} x1={PX1} y1={BY1} z0={0} z1={ZF}
          top={C.paper} sideL={BP.slab} sideR={BP.slabDark} sw={8} />
        {/* 奥の外壁 */}
        <Kb5dIsoBox x0={0} y0={0} x1={PX1} y1={RY0} z0={ZF} z1={ZW}
          top={C.rock} sideL={C.cityPale} sideR={C.cityDark} sw={5} />
        {/* コア (EV2基と階段) */}
        <Kb5dIsoBox x0={0} y0={RY0} x1={CORE} y1={FY1} z0={ZF} z1={ZF + 112}
          top={C.cityPale} sideL={C.cityPale} sideR={C.cityDark} sw={5.5} />
        <g>
          {[0, 1].map((k) => (
            <g key={k}>
              <Kb5dIsoFace x0={26} y0={RY0 + 24 + k * 68} x1={150} y1={RY0 + 76 + k * 68} z={ZF + 112}
                fill={KRP.white} sw={4} />
              <line x1={ipx(26, RY0 + 24 + k * 68)} y1={ipy(26, RY0 + 24 + k * 68, ZF + 112)}
                x2={ipx(150, RY0 + 76 + k * 68)} y2={ipy(150, RY0 + 76 + k * 68, ZF + 112)}
                stroke={KRP.ink} strokeWidth={3} />
              <line x1={ipx(150, RY0 + 24 + k * 68)} y1={ipy(150, RY0 + 24 + k * 68, ZF + 112)}
                x2={ipx(26, RY0 + 76 + k * 68)} y2={ipy(26, RY0 + 76 + k * 68, ZF + 112)}
                stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
          {/* 階段 (段板) */}
          <Kb5dIsoFace x0={26} y0={FY1 - 128} x1={150} y1={FY1 - 14} z={ZF + 112} fill={KRP.white} sw={4} />
          {Array.from({ length: 7 }, (_, k) => (
            <line key={k}
              x1={ipx(26, FY1 - 120 + k * 15)} y1={ipy(26, FY1 - 120 + k * 15, ZF + 112)}
              x2={ipx(150, FY1 - 120 + k * 15)} y2={ipy(150, FY1 - 120 + k * 15, ZF + 112)}
              stroke={KRP.ink} strokeWidth={2.8} />
          ))}
        </g>
        {/* 奥の部屋の間仕切り (x の小さい順に描く = 奥から手前へ) */}
        {[CORE, ...moved, ...addedX, PX1].map((x, i) => {
          const isNew = addedX.includes(x);
          return (
            <Kb5dIsoBox key={`rb${i}`} x0={x - WT / 2} y0={RY0} x1={x + WT / 2} y1={RY1}
              z0={ZF} z1={ZF + (ZW - ZF) * (isNew ? rise : 1)}
              top={C.rock} sideL={C.cityPale} sideR={C.cityDark} sw={4.2} />
          );
        })}
        {/* 奥の部屋の中身 */}
        {[0, 1, 2, 3, 4, 5].map((i) => <Room key={`rr${i}`} i={i} back />)}
        {/* 廊下の奥側の壁 */}
        <Kb5dIsoBox x0={CORE} y0={HW0} x1={PX1} y1={HW0 + WT} z0={ZF} z1={ZW}
          top={C.rock} sideL={C.cityPale} sideR={C.cityDark} sw={4.5} />
        {/* ★共用廊下の床 (容積率から外れた帯。#211 でハッチが消えたところ) */}
        <Kb5dIsoFace x0={CORE} y0={HW0 + WT} x1={PX1} y1={HW1} z={ZF} fill={C.cityPale} sw={4} o={0.95} />
        <g stroke={C.graphRed} strokeWidth={5} strokeDasharray="20 16" opacity={0.75}>
          <line x1={ipx(CORE, HW0 + WT + 4)} y1={ipy(CORE, HW0 + WT + 4, ZF)}
            x2={ipx(PX1, HW0 + WT + 4)} y2={ipy(PX1, HW0 + WT + 4, ZF)} />
          <line x1={ipx(CORE, HW1 - 4)} y1={ipy(CORE, HW1 - 4, ZF)}
            x2={ipx(PX1, HW1 - 4)} y2={ipy(PX1, HW1 - 4, ZF)} />
        </g>
        <text x={ipx(1176, (HW0 + HW1) / 2)} y={ipy(1176, (HW0 + HW1) / 2, ZF) + 10}
          textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30}
          fill={KRP.ink} opacity={0.75}>廊下</text>
        {/* 廊下の手前側の壁 */}
        <Kb5dIsoBox x0={CORE} y0={HW1} x1={PX1} y1={FY0} z0={ZF} z1={ZW}
          top={C.rock} sideL={C.cityPale} sideR={C.cityDark} sw={4.5} />
        {/* 手前の部屋の間仕切り */}
        {[CORE, ...moved, ...addedX, PX1].map((x, i) => {
          const isNew = addedX.includes(x);
          return (
            <Kb5dIsoBox key={`fb${i}`} x0={x - WT / 2} y0={FY0} x1={x + WT / 2} y1={FY1}
              z0={ZF} z1={ZF + (ZW - ZF) * (isNew ? rise : 1)}
              top={C.rock} sideL={C.cityPale} sideR={C.cityDark} sw={4.2} />
          );
        })}
        {[0, 1, 2, 3, 4, 5].map((i) => <Room key={`fr${i}`} i={i} back={false} />)}
        {/* 手前の外壁とバルコニーの手すり */}
        <Kb5dIsoBox x0={0} y0={FY1} x1={PX1} y1={FY1 + WT} z0={ZF} z1={ZW}
          top={C.rock} sideL={C.cityPale} sideR={C.cityDark} sw={5} />
        <Kb5dIsoBox x0={0} y0={BY1 - 12} x1={PX1} y1={BY1} z0={ZF} z1={ZF + 40}
          top={C.rock} sideL={BP.slab} sideR={BP.slabDark} sw={4.5} o={0.95} />
        <g stroke={KRP.ink} strokeWidth={3.6} opacity={0.7}>
          {Array.from({ length: 22 }, (_, k) => {
            const x = 28 + k * 56;
            return (
              <line key={k} x1={ipx(x, BY1 - 6)} y1={ipy(x, BY1 - 6, ZF)}
                x2={ipx(x, BY1 - 6)} y2={ipy(x, BY1 - 6, ZF + 40)} />
            );
          })}
        </g>
        {/* 増えた4部屋に○ */}
        {[[c6[4], 92], [c6[5], 92], [c6[4], 322], [c6[5], 322]].map(([mx, my], i) => (
          <Maru key={i} x={ipx(mx, my)} y={ipy(mx, my, ZF + 4)} s={0.34}
            t={seg(f, 24 + i * 3, 34 + i * 3)} stroke={22} />
        ))}
      </g>
      {/* 敷地を指すひきだし線 */}
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.8} strokeLinecap="round">
        <line x1={306} y1={448} x2={414} y2={472} />
        <circle cx={414} cy={472} r={7} fill={KRP.ink} stroke="none" />
      </g>
      {/* 見ている2人 (脚は y=830 より上) */}
      <Person x={168} y={818} s={0.6} f={f} cloth="#3E4B66" clothDark="#2E3850"
        gaze={[0.55, -0.7]} phase={1} />
      <Person x={330} y={824} s={0.54} f={f} cloth="#6B5B45" clothDark="#4D4130"
        gaze={[0.6, -0.65]} phase={5} />
      <g stroke={KRP.ink} strokeWidth={3} strokeDasharray="12 14" opacity={0.4}>
        <line x1={196} y1={648} x2={620} y2={430} />
        <line x1={352} y1={672} x2={700} y2={500} />
      </g>
      <TagPlate x={1736} y={300} text="売れる部屋" size={38} t={seg(f, 18, 32)} />
      <TagPlate x={1736} y={452} text="12部屋" size={42} t={seg(f, 30, 42)} color={KRP.green} />
      <TagPlate x={210} y={430} text="同じ土地" size={40} t={seg(f, 2, 16)} />
      <TagPlate x={146} y={236} text="1997" size={44} t={seg(f, 2, 14)} />
    </Frame>
  );
};

// ===== #213 の棒グラフ。棒そのものが主役なので、画面の高さを使い切る大きさで作る =====
const GR = {
  ox: 210, oy: 712, tx: 1100, ty: 128,   // 原点・軸の端
  unit: 50,                               // 1棟あたりの高さ (10棟で軸をほぼ埋める)
  slot: 280, bw: 230,                     // 年の幅・棒の幅
};
const GR_YEARS = ["1996", "1997", "1998"];
const grX = (i: number) => 230 + i * GR.slot + GR.slot / 2;
const grY = (v: number) => GR.oy - v * GR.unit;

/** 棒は「1棟 = 1ブロック」を積んだ形。ブロックは窓まで描いた1棟として描く */
const Kb5dBar: React.FC<{ i: number; v: number; t?: number; hi?: boolean }> = ({ i, v, t = 1, hi = false }) => {
  const ap = easeOut(clamp01(t));
  const n = Math.round(v * ap);
  const cx = grX(i);
  const x0 = cx - GR.bw / 2;
  if (v <= 0) {
    return (
      <g>
        <rect x={x0} y={GR.oy - GR.unit} width={GR.bw} height={GR.unit}
          fill="none" stroke={C.mapLine} strokeWidth={4} strokeDasharray="12 10" opacity={0.5} />
        <text x={cx} y={GR.oy - 14} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={34} fill={C.mapLine} opacity={0.8}>0</text>
      </g>
    );
  }
  const body = hi ? C.graphRed : C.graphBlue;
  return (
    <g>
      {Array.from({ length: n }, (_, k) => {
        const by = GR.oy - (k + 1) * GR.unit;
        return (
          <g key={k}>
            <rect x={x0} y={by} width={GR.bw} height={GR.unit}
              fill={k % 2 ? body : KRP.white} stroke={KRP.ink} strokeWidth={2.6} />
            {/* 1ブロック = 1棟。窓を入れて「棟」だと分かるようにする */}
            {Array.from({ length: 4 }, (_, c) => (
              <rect key={c} x={x0 + 56 + c * 42} y={by + 12} width={28} height={26} rx={2}
                fill={BP.glass} opacity={k % 2 ? 0.95 : 0.78} stroke={KRP.ink} strokeWidth={2.4} />
            ))}
            {/* 何棟目か (数えられる棒にする) */}
            <text x={x0 + 30} y={by + GR.unit / 2 + 10} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={26} fill={KRP.ink} opacity={0.6}>{k + 1}</text>
          </g>
        );
      })}
      {/* 棒の縁と頭のキャップ */}
      <rect x={x0} y={GR.oy - n * GR.unit} width={GR.bw} height={n * GR.unit}
        fill="none" stroke={KRP.ink} strokeWidth={6} />
      <rect x={x0 - 9} y={GR.oy - n * GR.unit - 15} width={GR.bw + 18} height={16} rx={4}
        fill={body} stroke={KRP.ink} strokeWidth={5} />
      <text x={cx} y={GR.oy - n * GR.unit - 30} textAnchor="middle" fontFamily={FONT}
        fontWeight={900} fontSize={40} fill={KRP.ink}>{n}</text>
    </g>
  );
};

const Kb5dGraphAxes: React.FC<{ f: number; t?: number }> = ({ f, t = 1 }) => {
  const ap = easeOut(clamp01(t));
  return (
    <g>
      {/* 目盛りの横線 */}
      <g>
        {[5, 10].map((v) => (
          <g key={v}>
            <line x1={GR.ox} y1={grY(v)} x2={lerp(GR.ox, GR.tx, ap)} y2={grY(v)}
              stroke={KRP.grayDark} strokeWidth={3.5} strokeDasharray="16 12" opacity={0.6} />
            <line x1={GR.ox - 26} y1={grY(v)} x2={GR.ox} y2={grY(v)} stroke={KRP.ink} strokeWidth={6} />
            <text x={GR.ox - 38} y={grY(v) + 15} textAnchor="end" fontFamily={FONT}
              fontWeight={900} fontSize={42} fill={KRP.ink}>{v}</text>
          </g>
        ))}
        {/* 1棟ごとの細かい刻み (0〜11棟) */}
        {Array.from({ length: 12 }, (_, k) => (
          <line key={k} x1={GR.ox - 13} y1={grY(k)} x2={GR.ox} y2={grY(k)}
            stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
        ))}
      </g>
      {/* 軸 */}
      <line x1={GR.ox} y1={GR.oy} x2={GR.tx} y2={GR.oy} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <line x1={GR.ox} y1={GR.oy} x2={GR.ox} y2={GR.ty} stroke={KRP.ink} strokeWidth={9} strokeLinecap="round" />
      <polygon points={`${GR.ox},${GR.ty - 16} ${GR.ox - 15},${GR.ty + 14} ${GR.ox + 15},${GR.ty + 14}`}
        fill={KRP.ink} />
      <text x={GR.ox - 44} y={GR.oy + 16} textAnchor="end" fontFamily={FONT} fontWeight={900}
        fontSize={42} fill={KRP.ink}>0</text>
      <text x={GR.ox + 10} y={GR.ty - 32} textAnchor="start" fontFamily={FONT} fontWeight={900}
        fontSize={40} fill={KRP.ink}>棟</text>
      {/* 年の目盛り */}
      <g>
        {GR_YEARS.map((y, i) => (
          <g key={y}>
            <line x1={grX(i)} y1={GR.oy} x2={grX(i)} y2={GR.oy + 20} stroke={KRP.ink} strokeWidth={6} />
            <text x={grX(i)} y={GR.oy + 66} textAnchor="middle" fontFamily={FONT} fontWeight={800}
              fontSize={36} fill={KRP.ink} opacity={0.92}>{y}</text>
          </g>
        ))}
        <line x1={GR.ox} y1={GR.oy + 20} x2={GR.tx} y2={GR.oy + 20} stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
      </g>
      {/* 紙のとめ金 (図面の体裁) */}
      <HexBolt x={GR.ox - 150} y={GR.ty + 10} r={13} fill={BP.brass} />
      <HexBolt x={GR.ox - 150} y={GR.oy + 44} r={13} fill={BP.brass} />
      <HexBolt x={GR.tx + 40} y={GR.ty + 10} r={13} fill={BP.brass} />
      <g opacity={0.0}>{f}</g>
    </g>
  );
};

// ===== #213 首都圏で完成したタワーマンションは、1997年に10棟。 =====
// 格: 図
// どこ: 左2/3が方眼紙の棒グラフ (軸いっぱいに立つ1本)、右1/3が首都圏の地図の紙
// 演出: 棒は「1棟=1ブロック」を10段積む。右の地図では同じ10棟が1本ずつ湾の縁に刺さる
//       = 同じ数を「数える絵」と「置かれる絵」の2通りで見せる
// 動き: 軸と目盛りが右へ伸びる → 棒が1段ずつ積み上がる → 地図の塔が1本ずつ立つ
// 絵: 棒グラフ (1997年に10本) + 首都圏の地図 (湾・川・鉄道・10本の塔)
const Kb5dN1997_10Tou: React.FC<{ f: number }> = ({ f }) => {
  const vals = [0, 10, 0];
  // 地図の紙
  const MP = { x0: 1186, y0: 178, x1: 1872, y1: 712 };
  // 湾の輪郭 (右下を海にする)
  const BAY = "1872,436 1716,474 1596,536 1522,610 1496,712 1872,712";
  // 湾の縁と鉄道ぞいに刺さる10本の塔
  const PINS: [number, number, number][] = [
    [1300, 566, 1], [1366, 528, 0.92], [1444, 486, 1], [1512, 450, 0.88],
    [1584, 414, 1], [1656, 382, 0.9], [1730, 352, 0.96],
    [1372, 428, 0.84], [1478, 372, 0.9], [1596, 322, 0.86],
  ];
  return (
    <Frame f={f} seed={834} bg={KRP.cream}>
      <GridPaper />
      <Kb5dGraphAxes f={f} t={seg(f, 2, 14)} />
      {vals.map((v, i) => (
        <Kb5dBar key={i} i={i} v={v} t={seg(f, 8, 30)} />
      ))}
      {/* 1997 の年だけ赤でなぞる */}
      <line x1={grX(1) - 76} y1={792} x2={lerp(grX(1) - 76, grX(1) + 76, easeOut(seg(f, 20, 34)))} y2={792}
        stroke={C.graphRed} strokeWidth={8} strokeLinecap="round" />
      <Arrow x={grX(1) - GR.bw / 2 - 14} y={596} s={1.0} rot={0} t={seg(f, 26, 38)} />

      {/* ===== 右: 首都圏の地図の紙 ===== */}
      <g opacity={easeOut(seg(f, 6, 20))}>
        <rect x={MP.x0 + 10} y={MP.y0 + 12} width={MP.x1 - MP.x0} height={MP.y1 - MP.y0}
          rx={10} fill={KRP.ink} opacity={0.14} />
        <rect x={MP.x0} y={MP.y0} width={MP.x1 - MP.x0} height={MP.y1 - MP.y0} rx={10}
          fill={C.paper} stroke={KRP.ink} strokeWidth={7} />
        {/* 陸 */}
        <rect x={MP.x0 + 6} y={MP.y0 + 6} width={MP.x1 - MP.x0 - 12} height={MP.y1 - MP.y0 - 12}
          rx={6} fill={C.island} opacity={0.42} />
        {/* 方位の薄い罫 */}
        <g stroke={C.mapLine} strokeWidth={2} opacity={0.3}>
          {Array.from({ length: 6 }, (_, k) => (
            <line key={`h${k}`} x1={MP.x0 + 6} y1={MP.y0 + 76 + k * 76} x2={MP.x1 - 6} y2={MP.y0 + 76 + k * 76} />
          ))}
          {Array.from({ length: 7 }, (_, k) => (
            <line key={`v${k}`} x1={MP.x0 + 84 + k * 84} y1={MP.y0 + 6} x2={MP.x0 + 84 + k * 84} y2={MP.y1 - 6} />
          ))}
        </g>
        {/* 海 */}
        <polygon points={BAY} fill={C.sea} opacity={0.9} />
        <polyline points="1872,436 1716,474 1596,536 1522,610 1496,712" fill="none"
          stroke={C.seaDark} strokeWidth={6} />
        {/* 波 */}
        <g stroke={KRP.white} strokeWidth={4} opacity={0.6} fill="none">
          {Array.from({ length: 4 }, (_, k) => (
            <path key={k} d={`M ${1620 + k * 54} ${640 + (k % 2) * 30} q 22 -14 44 0`} />
          ))}
        </g>
        {/* 川 */}
        <path d="M 1248 186 C 1316 292, 1382 376, 1466 450 S 1556 522 1598 534" fill="none"
          stroke={C.sea} strokeWidth={13} opacity={0.85} strokeLinecap="round" />
        {/* 鉄道 (破線) */}
        <polyline points="1206,652 1360,592 1500,500 1620,418 1794,350" fill="none"
          stroke={KRP.ink} strokeWidth={5} strokeDasharray="20 14" opacity={0.65} />
        {/* 市街の薄いブロック */}
        <g fill={C.cityPale} stroke={C.mapLine} strokeWidth={2.4} opacity={0.72}>
          {[[1226, 236], [1292, 268], [1230, 330], [1316, 356], [1252, 430], [1222, 520]].map((p, k) => (
            <rect key={k} x={p[0]} y={p[1]} width={44 + (k % 3) * 14} height={30 + (k % 2) * 12} rx={3} />
          ))}
        </g>
        {/* 10本の塔が1本ずつ立つ */}
        {PINS.map((p, i) => {
          const t = easeOut(seg(f, 12 + i * 2, 24 + i * 2));
          if (t <= 0) return null;
          const h = 56 * p[2] * t;
          const w = 22;
          return (
            <g key={i}>
              <ellipse cx={p[0]} cy={p[1]} rx={15} ry={6} fill={KRP.ink} opacity={0.22} />
              <rect x={p[0] - w / 2} y={p[1] - h} width={w} height={h}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
              {h > 24 && (
                <g fill={BP.glass} opacity={0.9}>
                  {Array.from({ length: Math.min(3, Math.floor(h / 16)) }, (_, k) => (
                    <rect key={k} x={p[0] - 6} y={p[1] - h + 8 + k * 16} width={12} height={9} />
                  ))}
                </g>
              )}
              <rect x={p[0] - w / 2 - 4} y={p[1] - h - 8} width={w + 8} height={9} rx={2}
                fill={C.graphBlue} stroke={KRP.ink} strokeWidth={3} />
            </g>
          );
        })}
        {/* 凡例 */}
        <g opacity={easeOut(seg(f, 24, 38))}>
          <rect x={MP.x0 + 18} y={624} width={224} height={70} rx={8}
            fill={KRP.white} opacity={0.88} stroke={KRP.ink} strokeWidth={3} />
          <rect x={MP.x0 + 44} y={638} width={20} height={42} fill={KRP.white} stroke={KRP.ink} strokeWidth={3} />
          <rect x={MP.x0 + 40} y={632} width={28} height={8} rx={2} fill={C.graphBlue} stroke={KRP.ink} strokeWidth={3} />
          <text x={MP.x0 + 86} y={672} fontFamily={FONT} fontWeight={900} fontSize={32} fill={KRP.ink}>= 1棟</text>
        </g>
      </g>
      {/* グラフと地図をつなぐ引き出し線 */}
      <g opacity={easeOut(seg(f, 20, 32))}>
        <line x1={grX(1) + GR.bw / 2 + 10} y1={252} x2={MP.x0 - 12} y2={300}
          stroke={KRP.ink} strokeWidth={4} strokeDasharray="14 12" opacity={0.5} />
        <circle cx={MP.x0 - 12} cy={300} r={7} fill={KRP.ink} opacity={0.5} />
      </g>

      <TagPlate x={700} y={86} text="首都圏のタワマン竣工" size={42} t={seg(f, 2, 16)} />
      <TagPlate x={380} y={330} text="10棟" size={48} t={seg(f, 28, 42)} color={KRP.red} />
      <TagPlate x={1529} y={224} text="首都圏" size={36} t={seg(f, 10, 22)} />
    </Frame>
  );
};

// ===== #214 2000年には、1年で31棟。 =====
// 格: 図
// どこ: 2000年の「竣工台帳」1枚。12か月のマスに、その月できた塔を1本ずつ描いて並べる
// 演出: 棒グラフはこの章で #198〜#201 と #213 に5本出している。ここで6本目を出すと
//       「また棒か」になるので、数え方そのものを変える。31 を月ごとの台帳で見せる。
//       1本ずつ窓まで描いて番号を振るので、画面の上で31まで数えられる
// 動き: 台帳が開く → 1月から12月へ塔が1本ずつ順に立つ → 月が埋まるたび赤線が引かれる
//       → 右上の合計が31まで回る
// 絵: 2000年の竣工台帳。12か月のマスに計31本の塔。見出しに検印と合計
const LEDGER = { x0: 96, y0: 150, x1: 1824, y1: 790, gy: 240 };
const LG_COUNTS = [1, 2, 3, 2, 4, 3, 2, 3, 4, 3, 2, 2]; // 合計31棟
const LG_OFFS = LG_COUNTS.map((_, i) => LG_COUNTS.slice(0, i).reduce((a, b) => a + b, 0));

const Kb5dN2000_31Tou: React.FC<{ f: number }> = ({ f }) => {
  const open = easeOut(seg(f, 0, 10));
  const colW = (LEDGER.x1 - LEDGER.x0) / 6;
  const rowH = (LEDGER.y1 - LEDGER.gy) / 2;
  const shown = Math.round(31 * easeOut(seg(f, 2, 40)));
  return (
    <Frame f={f} seed={835} bg={KRP.cream}>
      <GridPaper />
      {/* ===== 台帳の紙 ===== */}
      <g opacity={open}>
        <rect x={LEDGER.x0 + 12} y={LEDGER.y0 + 14} width={LEDGER.x1 - LEDGER.x0}
          height={LEDGER.y1 - LEDGER.y0} rx={10} fill={KRP.ink} opacity={0.13} />
        <rect x={LEDGER.x0} y={LEDGER.y0} width={LEDGER.x1 - LEDGER.x0}
          height={LEDGER.y1 - LEDGER.y0} rx={10} fill={C.paper} stroke={KRP.ink} strokeWidth={7} />
        {/* 見出しの帯 */}
        <rect x={LEDGER.x0} y={LEDGER.y0} width={LEDGER.x1 - LEDGER.x0} height={LEDGER.gy - LEDGER.y0}
          fill={C.island} opacity={0.42} />
        <line x1={LEDGER.x0} y1={LEDGER.gy} x2={LEDGER.x1} y2={LEDGER.gy}
          stroke={KRP.ink} strokeWidth={5} />
      </g>

      {/* ===== 12か月のマスと、その月に建った塔 ===== */}
      {LG_COUNTS.map((n, m) => {
        const c = m % 6, r = Math.floor(m / 6);
        const cx0 = LEDGER.x0 + c * colW, cy0 = LEDGER.gy + r * rowH;
        const base = cy0 + rowH - 30;
        const done = easeOut(seg(f, 8 + LG_OFFS[m] + n, 16 + LG_OFFS[m] + n));
        return (
          <g key={m} opacity={open}>
            {/* マスの地と罫 */}
            <rect x={cx0} y={cy0} width={colW} height={rowH}
              fill={m % 2 ? KRP.white : C.paper} opacity={0.45} />
            <rect x={cx0} y={cy0} width={colW} height={rowH} fill="none"
              stroke={C.mapLine} strokeWidth={3} />
            <line x1={cx0 + 10} y1={base} x2={cx0 + colW - 10} y2={base}
              stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
            <text x={cx0 + 16} y={cy0 + 46} fontFamily={FONT} fontWeight={900}
              fontSize={34} fill={KRP.ink} opacity={0.88}>{m + 1}月</text>
            <text x={cx0 + colW - 16} y={cy0 + 46} textAnchor="end" fontFamily={FONT}
              fontWeight={900} fontSize={32} fill={C.graphRed} opacity={0.9}>{n}</text>
            {/* その月ぶんが建ち終わると赤で引かれる */}
            <line x1={cx0 + colW - 48} y1={cy0 + 58}
              x2={lerp(cx0 + colW - 48, cx0 + colW - 12, done)} y2={cy0 + 58}
              stroke={C.graphRed} strokeWidth={5} strokeLinecap="round" />
            {/* 塔 */}
            {Array.from({ length: n }, (_, k) => {
              const idx = LG_OFFS[m] + k;
              const t = easeOut(seg(f, 2 + idx, 10 + idx));
              if (t <= 0) return null;
              const w = n >= 4 ? 34 : n === 3 ? 42 : 52;
              const sp = colW / (n + 1);
              const x = cx0 + sp * (k + 1);
              const h = (100 + ((idx * 37) % 5) * 19) * t;
              const rows = Math.max(1, Math.floor((h - 22) / 22));
              return (
                <g key={k}>
                  <ellipse cx={x} cy={base} rx={w * 0.58} ry={7} fill={KRP.ink} opacity={0.2} />
                  <rect x={x - w / 2} y={base - h} width={w} height={h}
                    fill={KRP.white} stroke={KRP.ink} strokeWidth={3.4} />
                  <rect x={x + w / 2 - 8} y={base - h} width={8} height={h} fill={KRP.ink} opacity={0.12} />
                  <g fill={BP.glass} stroke={KRP.ink} strokeWidth={2} opacity={0.92}>
                    {Array.from({ length: rows }, (_, q) => (
                      <rect key={q} x={x - w / 2 + 7} y={base - h + 14 + q * 22}
                        width={w - 22} height={13} />
                    ))}
                  </g>
                  <rect x={x - w / 2 - 5} y={base - h - 11} width={w + 10} height={12} rx={2}
                    fill={idx === 30 ? C.graphRed : C.graphBlue} stroke={KRP.ink} strokeWidth={3} />
                  <text x={x} y={base + 26} textAnchor="middle" fontFamily={FONT}
                    fontWeight={900} fontSize={22} fill={KRP.ink} opacity={0.62}>{idx + 1}</text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ===== 見出しの中身 ===== */}
      <g opacity={open}>
        {/* 検印 */}
        <g transform={`translate(1150 196) rotate(-8) scale(${pop(clamp01(seg(f, 30, 42)))})`}>
          <circle cx={0} cy={0} r={42} fill="none" stroke={C.graphRed} strokeWidth={7} opacity={0.85} />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={44} fill={C.graphRed} opacity={0.85}>済</text>
        </g>
        {/* 合計の窓 */}
        <rect x={1266} y={156} width={540} height={78} rx={8}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        <text x={1296} y={212} fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>合計</text>
        <text x={1560} y={218} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={58} fill={C.graphRed}>{shown}</text>
        <text x={1700} y={212} fontFamily={FONT} fontWeight={900} fontSize={36} fill={KRP.ink}>棟</text>
        <HexBolt x={54} y={196} r={13} fill={BP.brass} />
        <HexBolt x={1866} y={196} r={13} fill={BP.brass} />
      </g>

      <TagPlate x={430} y={192} text="2000年の竣工" size={42} t={seg(f, 2, 14)} />
      <TagPlate x={880} y={192} text="1997は10棟" size={34} t={seg(f, 16, 28)} />
    </Frame>
  );
};

// ===== #215 いまは、1000棟を超えています。 =====
// 格: 並
// どこ: 首都圏の俯瞰。遠くに山、真ん中に川、その手前に鉄道。全体がタワマンで埋まっている
// 演出: 手前のビルの屋上に立って見ている1人。そこから地平まで塔が並ぶ = 数えきれない
// 動き: 塔が奥から手前へ波のように立ち上がる / 電車が走る / 川が光る / 人が見る
// 絵: 首都圏のタワマン群の俯瞰。川・鉄道・遠くの山。1000の札
const Kb5dN1000TouKoe: React.FC<{ f: number }> = ({ f }) => {
  const trainX = -420 + ((f * 21) % 2600);
  // 奥の塔 (小さく淡い) と中景の塔 (大きい)
  const far = Array.from({ length: 26 }, (_, i) => ({
    x: 60 + i * 72 + rnd(i * 3 + 1) * 26,
    w: 26 + rnd(i * 5 + 2) * 16,
    h: 66 + rnd(i * 7 + 3) * 92,
    k: i,
  }));
  const mid = Array.from({ length: 13 }, (_, i) => ({
    x: 90 + i * 118 + rnd(i * 11 + 4) * 32,
    w: 50 + rnd(i * 13 + 5) * 24,
    h: 140 + rnd(i * 17 + 6) * 120,
    k: i,
  }));
  // 手前の列 (いちばん大きく濃い)。ここまで塔が建っている、を言う列
  const near = Array.from({ length: 8 }, (_, i) => ({
    x: 20 + i * 196 + rnd(i * 23 + 8) * 44,
    w: 92 + rnd(i * 29 + 9) * 44,
    h: 238 + rnd(i * 31 + 10) * 132,
    k: i,
  }));
  const FARB = 470, MIDB = 660, NEARB = 800;
  return (
    <Frame f={f} seed={836} bg={KRP.cream}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={400} fill={C.cityPale} opacity={0.55} />
      <rect x={0} y={300} width={W} height={100} fill={C.dust} opacity={0.28} />
      {/* 遠くの山 (富士と尾根) */}
      <polygon points="1240,392 1500,206 1760,392" fill={C.darkSky} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      <polygon points="1430,262 1500,206 1572,262 1536,276 1500,250 1466,276"
        fill={KRP.white} stroke="none" opacity={0.75} />
      <path d="M -20 392 L 180 318 L 350 372 L 520 300 L 700 368 L 880 326 L 1060 384 L 1240 392 Z"
        fill={C.darkSky} stroke={KRP.ink} strokeWidth={4} opacity={0.35} />
      <line x1={0} y1={392} x2={W} y2={392} stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
      {/* 奥の塔の帯 */}
      <rect x={0} y={392} width={W} height={FARB - 392} fill={C.dust} opacity={0.22} />
      {far.map((t) => {
        const ap = easeOut(seg(f, 2 + (t.k % 13) * 1.4, 16 + (t.k % 13) * 1.4));
        const hh = t.h * ap;
        return (
          <g key={`f${t.k}`} opacity={0.72}>
            <rect x={t.x} y={FARB - hh} width={t.w} height={hh}
              fill={KPP.towerSide} stroke={KRP.ink} strokeWidth={3.5} />
            <rect x={t.x + 2} y={FARB - hh - 7} width={t.w - 4} height={7}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={2.6} />
          </g>
        );
      })}
      <rect x={0} y={FARB - 4} width={W} height={10} fill={C.cityDark} opacity={0.4} />
      {/* 川 (うねる帯・橋2本・光) */}
      <path d="M -20 606 C 360 540 700 598 1020 548 C 1320 502 1640 556 1940 520 L 1940 596 C 1640 632 1320 578 1020 624 C 700 674 360 616 -20 682 Z"
        fill={C.sea} stroke={KRP.ink} strokeWidth={5} />
      <g opacity={0.55}>
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={40 + i * 122} y1={596 - i * 4 + Math.sin((f + i * 9) / 7) * 3}
            x2={140 + i * 122} y2={592 - i * 4 + Math.sin((f + i * 9) / 7) * 3}
            stroke={KRP.white} strokeWidth={6} strokeLinecap="round" />
        ))}
      </g>
      {[430, 1290].map((bx, i) => (
        <g key={i}>
          <rect x={bx} y={i ? 528 : 572} width={150} height={20} fill={C.rock} stroke={KRP.ink} strokeWidth={5} />
          <line x1={bx + 40} y1={i ? 548 : 592} x2={bx + 40} y2={i ? 586 : 630} stroke={KRP.ink} strokeWidth={5} />
          <line x1={bx + 110} y1={i ? 548 : 592} x2={bx + 110} y2={i ? 586 : 630} stroke={KRP.ink} strokeWidth={5} />
        </g>
      ))}
      {/* 中景の塔 */}
      {mid.map((t) => {
        const ap = easeOut(seg(f, 6 + (t.k % 9) * 1.8, 22 + (t.k % 9) * 1.8));
        const hh = t.h * ap;
        return (
          <g key={`m${t.k}`}>
            <rect x={t.x} y={MIDB - hh} width={t.w} height={hh}
              fill={KPP.towerFace} stroke={KRP.ink} strokeWidth={5} />
            <rect x={t.x + t.w - 11} y={MIDB - hh} width={11} height={hh} fill={KPP.towerSide} opacity={0.85} />
            <rect x={t.x + 5} y={MIDB - hh - 13} width={t.w - 10} height={13}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: Math.max(2, Math.round(hh / 34)) }, (_, r) => (
              <line key={r} x1={t.x + 4} y1={MIDB - hh + 16 + r * 34} x2={t.x + t.w - 4} y2={MIDB - hh + 16 + r * 34}
                stroke={BP.glass} strokeWidth={9} opacity={0.65} />
            ))}
          </g>
        );
      })}
      {/* 鉄道 (枕木・レール・電車) */}
      <g>
        <rect x={0} y={672} width={W} height={34} fill={C.rock} stroke="none" opacity={0.75} />
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={i * 49} y={672} width={30} height={34} fill={BP.woodDark} stroke={KRP.ink} strokeWidth={2.4} opacity={0.8} />
        ))}
        <line x1={0} y1={680} x2={W} y2={680} stroke={BP.steelDark} strokeWidth={6} />
        <line x1={0} y1={700} x2={W} y2={700} stroke={BP.steelDark} strokeWidth={6} />
        <g transform={`translate(${trainX} 0)`}>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={i * 206} y={620} width={196} height={62} rx={10}
                fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
              <rect x={i * 206} y={644} width={196} height={14} fill={C.graphBlue} opacity={0.85} />
              {[0, 1, 2, 3].map((w) => (
                <rect key={w} x={i * 206 + 18 + w * 44} y={628} width={32} height={22} rx={3}
                  fill={BP.glass} stroke={KRP.ink} strokeWidth={3} />
              ))}
              <circle cx={i * 206 + 46} cy={688} r={10} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3} />
              <circle cx={i * 206 + 150} cy={688} r={10} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3} />
            </g>
          ))}
        </g>
      </g>
      {/* 手前の列: ここまで塔が建っている */}
      {near.map((t) => {
        const ap = easeOut(seg(f, 10 + (t.k % 7) * 2, 28 + (t.k % 7) * 2));
        const hh = t.h * ap;
        return (
          <g key={`n${t.k}`}>
            <rect x={t.x} y={NEARB - hh} width={t.w} height={hh}
              fill={KPP.towerFace} stroke={KRP.ink} strokeWidth={6.5} />
            <rect x={t.x + t.w - 20} y={NEARB - hh} width={20} height={hh} fill={KPP.towerSide} opacity={0.9} />
            <rect x={t.x + 7} y={NEARB - hh - 18} width={t.w - 14} height={18}
              fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <rect x={t.x + t.w / 2 - 15} y={NEARB - hh - 38} width={30} height={22} rx={4}
              fill={C.sea} stroke={KRP.ink} strokeWidth={4} />
            {Array.from({ length: Math.max(2, Math.round(hh / 40)) }, (_, r) =>
              Array.from({ length: 3 }, (_, c) => (
                <rect key={`${r}-${c}`} x={t.x + 10 + c * ((t.w - 24) / 3)} y={NEARB - hh + 18 + r * 40}
                  width={(t.w - 24) / 3 - 10} height={24} rx={2}
                  fill={BP.glass} opacity={0.75} stroke={KRP.ink} strokeWidth={2.6} />
              )),
            )}
          </g>
        );
      })}
      {/* 手前: 見ている人の立つ屋上 (パラペットの笠木と防水の床) */}
      <rect x={-10} y={790} width={W + 20} height={38} fill={C.cityPale} stroke={KRP.ink} strokeWidth={8} />
      <rect x={-10} y={824} width={W + 20} height={H - 824} fill={C.rock} opacity={0.55} />
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.45}>
        {Array.from({ length: 19 }, (_, i) => (
          <line key={i} x1={40 + i * 104} y1={790} x2={40 + i * 104} y2={828} />
        ))}
      </g>
      <Person x={1716} y={848} s={1.06} f={f} cloth="#4A5C44" clothDark="#35422F"
        gaze={[-0.5, -0.6]} phase={2} />
      <TagPlate x={420} y={212} text="1000棟 超" size={56} t={seg(f, 14, 30)} color={KRP.red} />
      <TagPlate x={1180} y={212} text="いま" size={44} t={seg(f, 28, 42)} />
    </Frame>
  );
};

// ===== #216 人の欲は、道具が許したぶんだけ膨らむんです。 =====
// 格: 山
// どこ: 5本柱の装置 (骨・箱・水・灯り・空気) を少し引いて置き、その下に金色の「欲」の地層を敷く
// 演出: ★章の決着。地層が膨らみ、装置ごと街を押し上げる。塔はさらに上へ継がれて画面の天へ消える
// 動き: 地層が膨らむ → 装置が持ち上がる → 塔の継ぎ足しが伸びる → 金の矢印 → 見上げる3人
// 絵: ★章の決着。5本柱の装置の下に「欲」と書かれた地面が敷かれ、その上で建物がさらに上へ伸びる。見上げる人
const Kb5dYokuGaFukuramu: React.FC<{ f: number }> = ({ f }) => {
  const SC = 0.7, OX = 288;
  const swell = easeOut(seg(f, 6, 34));           // 欲が膨らむ
  const rise = swell * 22;                         // 膨らんだぶん装置が持ち上がる
  const OY = 70 - rise;
  const grow = easeOut(seg(f, 12, 42));           // 塔が継がれて伸びる
  const sy = (y: number) => y * SC + OY;
  const sx = (x: number) => x * SC + OX;
  const bedY = sy(824) + 4;                        // 地層の上端 (柱の下端)
  // 地層の上端は中央がふくらむ
  const bedTop = (x: number) =>
    bedY - 16 * swell * Math.sin(Math.PI * clamp01((x - 60) / 1800));
  const bedPts = Array.from({ length: 25 }, (_, i) => {
    const x = -20 + i * 82;
    return `${x.toFixed(0)},${bedTop(x).toFixed(1)}`;
  }).join(" ");
  // 装置の5棟 (KosoPillars の TowerCluster と同じ座標) の頭に継ぎ足す
  const towers: [number, number, number, number][] = [
    // x, 高さ, 幅, 継ぎ足す量
    [520, 296, 150, 120], [1420, 268, 140, 110], [760, 386, 186, 96],
    [1180, 340, 170, 104], [972, 430, 200, 88],
  ];
  const names: [string, number][] = [["骨", 380], ["箱", 670], ["水", 960], ["灯り", 1250], ["空気", 1540]];
  return (
    <Frame f={f} seed={837} bg={KRP.cream}>
      {/* 空 */}
      <rect x={0} y={0} width={W} height={sy(560)} fill={KPP.sky} opacity={0.5} />
      <rect x={0} y={sy(380)} width={W} height={180 * SC} fill={C.dust} opacity={0.2} />
      {/* ★5本柱の装置 (骨・箱・水・灯り・空気) */}
      <g transform={`translate(${OX} ${OY}) scale(${SC})`}>
        <TowerOnPillars f={f} labels={false} subs={false} ground={false} sky={false}
          standing={["hone", "hako", "mizu", "akari", "kuuki"]} lit={0.85} />
      </g>
      {/* ★金を建物そのものに乗せる (地面の金が建物へ染み上がってくる) =====
          ここが章の決着なので、金が「地面の色」で終わってはいけない。
          5棟の胴そのものが下から金に染まり、窓が金で灯る。 */}
      <g>
        {towers.map(([tx, th, tw], i) => {
          const up = easeOut(seg(f, 8 + i * 2, 32 + i * 2));
          if (up <= 0) return null;
          const bx = sx(tx - tw / 2), bw = tw * SC;
          const byTop = sy(520 - th - 46), byBot = sy(520);
          const gy0 = byBot - (byBot - byTop) * up;
          const rows = Math.max(1, Math.round((byBot - gy0) / 26));
          return (
            <g key={`g${i}`}>
              <rect x={bx} y={gy0} width={bw} height={byBot - gy0} fill={C.gold} opacity={0.44} />
              {/* 金で灯った窓 */}
              <g fill={C.gold} stroke={C.goldDark} strokeWidth={2.4} opacity={0.92}>
                {Array.from({ length: rows }, (_, r) =>
                  Array.from({ length: 3 }, (_, c) => (
                    <rect key={`${r}-${c}`} x={bx + 8 + c * ((bw - 16) / 3)}
                      y={gy0 + 8 + r * 26} width={(bw - 16) / 3 - 7} height={15} />
                  )),
                )}
              </g>
              {/* 染み上がりの境目 */}
              <path d={`M ${bx} ${gy0} q ${bw * 0.25} ${-10} ${bw * 0.5} 0 t ${bw * 0.5} 0`}
                fill="none" stroke={C.goldDark} strokeWidth={5} />
              <rect x={bx} y={gy0} width={bw} height={byBot - gy0} fill="none"
                stroke={C.goldDark} strokeWidth={4} opacity={0.55} />
            </g>
          );
        })}
      </g>
      {/* 塔の継ぎ足し (これから建つぶん。金の破線で上へ) */}
      {towers.map(([tx, th, tw, ext], i) => {
        const e = ext * grow;
        const topY = sy(520 - th - 46);
        const hh = e * SC;
        if (hh < 2) return null;
        return (
          <g key={i}>
            <rect x={sx(tx - tw / 2 + 8)} y={topY - hh} width={(tw - 16) * SC} height={hh}
              fill={C.gold} opacity={0.26} />
            <rect x={sx(tx - tw / 2 + 8)} y={topY - hh} width={(tw - 16) * SC} height={hh}
              fill="none" stroke={C.goldDark} strokeWidth={6} strokeDasharray="18 14" />
            {Array.from({ length: Math.max(1, Math.round(hh / 30)) }, (_, r) => (
              <line key={r} x1={sx(tx - tw / 2 + 16)} y1={topY - hh + 16 + r * 30}
                x2={sx(tx + tw / 2 - 16)} y2={topY - hh + 16 + r * 30}
                stroke={C.gold} strokeWidth={7} opacity={0.5} />
            ))}
          </g>
        );
      })}
      {/* ★「欲」の地層 */}
      <g>
        <polygon points={`-20,900 ${bedPts} 1940,900`} fill={KPP.ground} stroke={KRP.ink} strokeWidth={8} />
        <polygon points={`-20,900 ${bedPts} 1940,900`} fill={C.gold} opacity={0.3} stroke="none" />
        {/* 地層の縞 */}
        <g stroke={KPP.groundDark} strokeWidth={5} opacity={0.6}>
          {[44, 92, 142].map((d) => (
            <polyline key={d} points={Array.from({ length: 25 }, (_, i) => {
              const x = -20 + i * 82;
              return `${x.toFixed(0)},${(bedTop(x) + d).toFixed(1)}`;
            }).join(" ")} fill="none" />
          ))}
        </g>
        {/* 金の鉱脈 (膨らみで割れて光る) */}
        <g stroke={C.gold} strokeWidth={9} opacity={0.55 * swell} strokeLinecap="round">
          {Array.from({ length: 9 }, (_, i) => {
            const x = 150 + i * 200;
            return <line key={i} x1={x} y1={bedTop(x) + 22} x2={x + 46} y2={bedTop(x) + 96} />;
          })}
        </g>
        {/* 地層の中身。ひと色の「欲」タイルで終わらせない。
            どんな欲が積み上がって地面になったのかを、層ごとに書き分ける */}
        {([["もっと高く", 38, 0.1], ["もっと広く", 96, 0.18], ["もっと売る", 154, 0.26]] as [string, number, number][])
          .map(([word, d, op], s) => (
            <g key={word}>
              {/* 層の帯 (上辺と下辺で地層のうねりに沿わせる) */}
              <polygon
                points={
                  Array.from({ length: 25 }, (_, i) => {
                    const x = -20 + i * 82;
                    return `${x.toFixed(0)},${(bedTop(x) + d - 26).toFixed(1)}`;
                  }).join(" ") + " " +
                  Array.from({ length: 25 }, (_, i) => {
                    const x = 1940 - i * 82;
                    return `${x.toFixed(0)},${(bedTop(x) + d + 26).toFixed(1)}`;
                  }).join(" ")
                }
                fill={C.gold} opacity={op} stroke="none" />
              {/* その層に埋まっている言葉 */}
              <g fill={KPP.groundDark} opacity={0.52}>
                {Array.from({ length: 5 }, (_, i) => {
                  const x = 180 + i * 390 + s * 120;
                  const ty = bedTop(x) + d + 11;
                  return (
                    <text key={i} x={x} y={ty} textAnchor="middle" fontFamily={FONT}
                      fontWeight={900} fontSize={34}
                      transform={`rotate(${(rnd(i * 7 + s * 3 + 2) - 0.5) * 10} ${x} ${ty})`}>{word}</text>
                  );
                })}
              </g>
            </g>
          ))}
        {/* 金の粒 (膨らんだぶんだけ湧いてくる) */}
        <g opacity={0.85 * swell}>
          {Array.from({ length: 14 }, (_, i) => {
            const x = 90 + i * 130;
            const y = bedTop(x) + 62 + ((i * 37) % 5) * 22;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={11} fill={C.gold} stroke={C.goldDark} strokeWidth={3.5} />
                <circle cx={x - 4} cy={y - 4} r={3} fill={KRP.white} opacity={0.85} />
              </g>
            );
          })}
        </g>
        <polyline points={bedPts} fill="none" stroke={KRP.ink} strokeWidth={8} />
        {/* 装置を支える杭。この地層が5本柱を支えている = 欲が道具を立たせている。
            x は柱の名札 (下の names) と重ならない位置を選んである */}
        <g>
          {[465, 655, 858, 1045, 1265].map((px, i) => {
            const y0 = bedTop(px) - 2, y1 = y0 + 150;
            return (
              <g key={`pile${i}`}>
                <rect x={px - 15} y={y0} width={30} height={150}
                  fill={BP.woodDark} stroke={KRP.ink} strokeWidth={4.5} opacity={0.92} />
                {Array.from({ length: 4 }, (_, r) => (
                  <line key={r} x1={px - 15} y1={y0 + 28 + r * 32} x2={px + 15} y2={y0 + 28 + r * 32}
                    stroke={KRP.ink} strokeWidth={3} opacity={0.5} />
                ))}
                <polygon points={`${px - 15},${y1} ${px + 15},${y1} ${px},${y1 + 26}`}
                  fill={BP.woodDark} stroke={KRP.ink} strokeWidth={4.5} opacity={0.92} />
              </g>
            );
          })}
        </g>
      </g>
      {/* 柱の名札 (既定の札は字幕帯の下に出るので自分で置く) */}
      {names.map(([nm, px]) => (
        <TagPlate key={nm} x={sx(px)} y={bedY + 44} text={nm} size={32} t={seg(f, 2, 16)} />
      ))}
      {/* 下から押し上げる力。右は空へ、左は地層の中から地面を突き上げる
          (左の矢印は「地面のふくらみ」という行き先を持たせ、札で名前をつける) */}
      <ForceArrow x={1612} y={sy(560)} len={240} rot={-90} w={26} color={C.goldDark}
        t={seg(f, 20, 36)} label="上へ" labelSize={38} />
      <ForceArrow x={360} y={bedTop(360) + 160} len={156} rot={-90} w={22} color={C.goldDark}
        t={seg(f, 24, 38)} />
      {/* 矢印の先が地面を突き上げている印 */}
      <g stroke={C.goldDark} strokeWidth={6} strokeLinecap="round"
        opacity={0.9 * easeOut(seg(f, 32, 42))}>
        {[-54, -22, 22, 54].map((a) => (
          <line key={a} x1={360 + a * 0.5} y1={bedTop(360) - 4}
            x2={360 + a} y2={bedTop(360) - 30} />
        ))}
      </g>
      {/* 見上げる人 */}
      <Person x={214} y={bedTop(214)} s={0.5} f={f} cloth="#3E4B66" clothDark="#2E3850"
        gaze={[0.4, -0.9]} phase={1} />
      <Person x={430} y={bedTop(430)} s={0.44} f={f} cloth="#6B5B45" clothDark="#4D4130"
        gaze={[0.35, -0.9]} phase={4} />
      <Person x={1748} y={bedTop(1748)} s={0.48} f={f} cloth="#6A4A4A" clothDark="#4C3333"
        gaze={[-0.45, -0.9]} phase={7} />
      {/* 「上限なし」を金の継ぎ足しの山から離し、引き出し線でその頭を指す */}
      <g opacity={easeOut(seg(f, 32, 42))}>
        <line x1={1486} y1={100} x2={1336} y2={142} stroke={C.goldDark} strokeWidth={4}
          strokeDasharray="14 11" opacity={0.75} />
        <circle cx={1336} cy={142} r={8} fill={C.goldDark} opacity={0.75} />
      </g>
      {/* 札 (下端はすべて y=830 の安全圏の内側) */}
      <TagPlate x={190} y={700} text="欲" size={58} t={seg(f, 8, 22)} color={C.goldDark} fill={C.paper} />
      <TagPlate x={560} y={786} text="膨らむ" size={34} t={seg(f, 30, 42)} color={C.goldDark} />
      <TagPlate x={1742} y={706} text="道具" size={50} t={seg(f, 8, 22)} />
      <TagPlate x={1600} y={92} text="上限なし" size={46} t={seg(f, 30, 42)} color={C.goldDark} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb5_ihou_ni_naru: (f) => <Kb5dIhouNiNaru f={f} />,
  kb5_kiriageta: (f) => <Kb5dKiriageta f={f} />,
  kb5_1970_kaisei: (f) => <Kb5dN1970Kaisei f={f} />,
  kb5_1997_rouka: (f) => <Kb5dN1997Rouka f={f} />,
  kb5_heya_wo_motto: (f) => <Kb5dHeyaWoMotto f={f} />,
  kb5_1997_10tou: (f) => <Kb5dN1997_10Tou f={f} />,
  kb5_2000_31tou: (f) => <Kb5dN2000_31Tou f={f} />,
  kb5_1000tou_koe: (f) => <Kb5dN1000TouKoe f={f} />,
  kb5_yoku_ga_fukuramu: (f) => <Kb5dYokuGaFukuramu f={f} />,
};

export const K_B5D_MOTIFS: string[] = [
  "kb5_ihou_ni_naru",      // #208 すでに建っている百尺の建物が、違法になります。
  "kb5_kiriageta",         // #209 だから31メートルに切り上げた。それだけです。
  "kb5_1970_kaisei",       // #210 これが、1970年の改正でなくなりました。
  "kb5_1997_rouka",        // #211 そして1997年、共用廊下が容積率から外れます。
  "kb5_heya_wo_motto",     // #212 同じ土地に、売れる部屋をもっと作れる。
  "kb5_1997_10tou",        // #213 首都圏の完成は、1997年に10棟。
  "kb5_2000_31tou",        // #214 2000年には、1年で31棟。
  "kb5_1000tou_koe",       // #215 いまは、1000棟を超えています。
  "kb5_yoku_ga_fukuramu",  // #216 人の欲は、道具が許したぶんだけ膨らむんです。
];

export const kosoB5dScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
