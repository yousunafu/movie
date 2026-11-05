// 「なぜ高層ビルは生まれたのか」: 第6章「高いほど、安い部屋だった。」4 (見えなくなった〜断水)
// 担当範囲: 台本 docs/koso-script-v7.txt の 251〜261行目 (文#250〜#260・11文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで11枚。
// motif 名は必ず kb6_ で始める。WobbleDefs の seed はこのファイルでは 883〜893 を使う。
// 設計書: docs/koso-ch6-design.md (1文ごとの「格」と絵の中身が決まっている)
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
  stone: "#E0D6C2",
  stoneDark: "#B6A88E",
  zinc: "#A9B0B4",
  zincDark: "#7B8488",
  amber: "#C9A06A",
  candle: "#F0C971",
  night: "#2B3A4A",
  nightPale: "#4C6076",
  gold: "#D9A93E",
  goldDark: "#9E7820",
  rain: "#8FA3B2",
  mudWater: "#6E7257",
  emerGreen: "#4FA06A",
  dark: "#39414B",
  // ここから下は #250〜#260 で足した色
  rainDeep: "#6E8292",   // 嵐の空
  earth: "#A98A5E",      // 地盤・堤防の土
  leaf: "#6E8A5E",        // 街路樹
  panel: "#4A525A",      // 配電盤の鉄箱 (暗所)
  panelDark: "#333A41",
  wall: "#DEE4E3",       // 部屋の壁
  tile: "#CBD6D4",       // 流しのタイル
  lit: "#F7E3A8",        // 灯りのついた窓
  skyPale: "#DCE7EE",    // 窓の外の明るさ
  nightDeep: "#1F2A36",  // 雨合羽の濃い影
  glass: "#B9CBD6",      // コップのガラス
  // #255 を「雨の灰青・暗く冷たく」に寄せるために足した色 (設計書 docs/koso-ch6-design.md L31)
  earthNight: "#6B5A42",  // 雨に濡れた堤防の土
  floodWater: "#36566E",  // 増水した濁り川
  ghostWater: "#7FA6C4",  // 「もし越えていたら」の想像の水
  // #259 (共用廊下) で足した色
  corridorWall: "#D8D2C4", // 廊下の壁 (塗装)
  corridorFloor: "#BFB9AA", // 廊下の床タイル
  doorFace: "#9C7F5E",     // 住戸の玄関扉 (木目調の鋼製扉)
  doorFaceDark: "#7A6145",
};

// ===================================================================
// このファイルだけのローカル部品 (共用の KosoB2Parts には足さない)
// ===================================================================

/** 斜めに降る雨。n 本を f で流す */
const Kb6dRain: React.FC<{
  f: number; n?: number; slant?: number; len?: number; w?: number;
  color?: string; opacity?: number; seed?: number; speed?: number;
  x0?: number; x1?: number; y0?: number; y1?: number;
}> = ({
  f, n = 90, slant = 0.22, len = 120, w = 3.5, color = KRP.white,
  opacity = 0.5, seed = 1, speed = 34, x0 = -200, x1 = W + 200, y0 = -140, y1 = H,
}) => (
  <g stroke={color} strokeWidth={w} strokeLinecap="round" opacity={opacity}>
    {Array.from({ length: n }, (_, i) => {
      const span = y1 - y0 + 260;
      const bx = x0 + rnd(seed * 7 + i * 3.1) * (x1 - x0);
      const ph = rnd(seed * 13 + i * 5.7) * span;
      const y = y0 - 130 + ((ph + f * speed) % span);
      const L = len * (0.6 + rnd(seed * 19 + i) * 0.7);
      return <line key={i} x1={bx} y1={y} x2={bx + L * slant} y2={y + L} />;
    })}
  </g>
);

/** 傘。handle で柄の長さを伸ばせる (さす人・飛ぶ傘で共用) */
const Kb6dUmbrella: React.FC<{
  x: number; y: number; s?: number; rot?: number; handle?: number; color?: string;
}> = ({ x, y, s = 1, rot = 0, handle = 46, color = C.night }) => {
  const hl = handle;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
      {/* 柄 */}
      <path d={`M 0 -88 L 0 ${hl} Q 0 ${hl + 26} -24 ${hl + 26} Q -42 ${hl + 26} -42 ${hl + 6}`}
        fill="none" stroke={BP.woodDark} strokeWidth={11} strokeLinecap="round" />
      {/* 天蓋 */}
      <path d={`M -110 0 A 112 96 0 0 1 110 0 Q 82 20 55 0 Q 27 20 0 0 Q -27 20 -55 0 Q -82 20 -110 0 Z`}
        fill={color} stroke={KRP.ink} strokeWidth={5.5} />
      {/* 骨 */}
      <g stroke={KRP.ink} strokeWidth={3.5} opacity={0.75}>
        {[-110, -55, 0, 55, 110].map((bx) => (
          <line key={bx} x1={0} y1={-88} x2={bx} y2={0} />
        ))}
      </g>
      {/* 石突き */}
      <line x1={0} y1={-92} x2={0} y2={-118} stroke={BP.steelDark} strokeWidth={7} strokeLinecap="round" />
      <circle cx={0} cy={-88} r={9} fill={BP.brass} stroke={KRP.ink} strokeWidth={3} />
    </g>
  );
};

/**
 * 「高さの代金」の円弧目盛り (#250 と #251 で同じ形を使う)。
 * needle=null なら針がない (取付座だけ残る)
 */
const Kb6dArcGauge: React.FC<{
  cx: number; cy: number; r: number; f: number;
  needle?: number | null; t?: number; face?: string; nameplate?: string;
}> = ({ cx, cy, r, f, needle = null, t = 1, face = KRP.white, nameplate }) => {
  const ap = clamp01(t);
  const P = (u: number, rr: number) => {
    const th = ((180 - u * 180) * Math.PI) / 180;
    return [cx + Math.cos(th) * rr, cy - Math.sin(th) * rr] as const;
  };
  const [nx, ny] = needle === null ? [cx, cy] : P(needle, r * 0.84);
  const [tx, ty] = needle === null ? [cx, cy] : P(needle, -r * 0.16);
  return (
    <g>
      {/* 文字盤 */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
        fill={face} stroke={KRP.ink} strokeWidth={7} />
      <path d={`M ${cx - r * 0.93} ${cy} A ${r * 0.93} ${r * 0.93} 0 0 1 ${cx + r * 0.93} ${cy} `}
        fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      {/* 小目盛り (50本) */}
      <g strokeLinecap="round">
        {Array.from({ length: 51 }, (_, i) => {
          const u = i / 50;
          const major = i % 5 === 0;
          const [ax, ay] = P(u, r * (major ? 0.78 : 0.86));
          const [bx, by] = P(u, r * 0.93);
          const op = ap * seg(f, 2 + (i % 10) * 2.4, 8 + (i % 10) * 2.4);
          return (
            <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={KRP.ink}
              strokeWidth={major ? 9 : 4} opacity={op} />
          );
        })}
      </g>
      {/* 数字 */}
      <g opacity={ap * seg(f, 8, 22)}>
        {[0, 2, 4, 6, 8, 10].map((i) => {
          const [ax, ay] = P(i / 10, r * 0.64);
          return (
            <text key={i} x={ax} y={ay + 13} textAnchor="middle" fontFamily={FONT}
              fontWeight={800} fontSize={r * 0.1} fill={KRP.ink}>{i * 10}</text>
          );
        })}
      </g>
      {/* 針 or 取付座 */}
      {needle === null ? (
        <g>
          <circle cx={cx} cy={cy} r={r * 0.14} fill="none" stroke={KRP.ink}
            strokeWidth={5} strokeDasharray="16 13" opacity={0.75} />
          <circle cx={cx} cy={cy} r={r * 0.075} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
          <circle cx={cx} cy={cy} r={r * 0.028} fill={C.stone} stroke={KRP.ink} strokeWidth={2.5} />
          <HexBolt x={cx - r * 0.2} y={cy - r * 0.05} r={9} fill={BP.steelDark} />
          <HexBolt x={cx + r * 0.2} y={cy - r * 0.05} r={9} fill={BP.steelDark} />
        </g>
      ) : (
        <g>
          <line x1={tx} y1={ty} x2={nx} y2={ny} stroke={KRP.ink} strokeWidth={17} strokeLinecap="round" />
          <line x1={tx} y1={ty} x2={nx} y2={ny} stroke={KRP.red} strokeWidth={10} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={r * 0.085} fill={BP.brass} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      )}
      {/* 基線 */}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={KRP.ink} strokeWidth={7} />
      {nameplate && <TagPlate x={cx} y={cy + r * 0.24} text={nameplate} size={r * 0.14} t={seg(f, 14, 28)} />}
    </g>
  );
};

/** 地盤のハッチ (#255 #256 で共用) */
const Kb6dSoil: React.FC<{
  x0: number; x1: number; y: number; h?: number; n?: number; fill?: string;
}> = ({ x0, x1, y, h = 130, n = 22, fill = C.earth }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={h} fill={fill} opacity={0.55} />
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={KRP.ink} strokeWidth={6} />
    <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
      {Array.from({ length: n }, (_, i) => {
        const bx = x0 + ((x1 - x0) * i) / n;
        return <line key={i} x1={bx} y1={y} x2={bx - 46} y2={y + 46} />;
      })}
    </g>
  </g>
);

// ---- #258 のビル断面 (#259 は同じ絵の二度使いを避けて共用廊下に描き替えたので、ここは #258 専用) ----
const SEC = { x0: 560, x1: 1360, yG: 700, yTop: 110, n: 47 };
const secY = (i: number) => SEC.yG - ((SEC.yG - SEC.yTop) * i) / SEC.n;
const SEC_FH = (SEC.yG - SEC.yTop) / SEC.n;
const SEC_RISER = 1246; // 窓は 1210 で終わるので 1210〜1360 の壁面に蛇口と×を置ける
const SEC_BORDER = secY(24);

const Kb6dBldgSection: React.FC<{ f: number; dansui?: boolean; night?: boolean }> = ({
  f, dansui = false, night = false,
}) => {
  const blackout = easeOut(seg(f, 2, 16));
  return (
    <g>
      {/* 地盤 */}
      <Kb6dSoil x0={0} x1={SEC.x0 - 60} y={SEC.yG} h={120} n={9} />
      <Kb6dSoil x0={SEC.x1 + 60} x1={W} y={SEC.yG} h={120} n={9} />
      {/* 地下階 (電気室と揚水ポンプ) */}
      <rect x={SEC.x0 - 60} y={SEC.yG} width={SEC.x1 - SEC.x0 + 120} height={100}
        fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      <rect x={SEC.x0 - 24} y={SEC.yG + 14} width={340} height={72}
        fill={C.panelDark} stroke={KRP.ink} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={SEC.x0 - 8 + i * 80} y={SEC.yG + 24} width={58} height={52}
          fill={C.panel} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
      {/* 電気室に溜まった濁った水 */}
      <rect x={SEC.x0 - 20} y={SEC.yG + 42} width={332} height={42}
        fill={C.mudWater} opacity={0.88} />
      <line x1={SEC.x0 - 20} y1={SEC.yG + 42} x2={SEC.x0 + 312} y2={SEC.yG + 42}
        stroke={C.emerGreen} strokeWidth={4} opacity={0.8} />
      {/* 受水槽 */}
      <rect x={SEC.x0 + 400} y={SEC.yG + 18} width={200} height={68}
        fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={5} />
      <line x1={SEC.x0 + 404} y1={SEC.yG + 36} x2={SEC.x0 + 596} y2={SEC.yG + 36}
        stroke={KRP.blueDeep} strokeWidth={4} opacity={0.7} />
      {/* 揚水ポンプ */}
      <rect x={SEC.x0 + 636} y={SEC.yG + 36} width={74} height={50}
        fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4.5} />
      <circle cx={SEC.x0 + 673} cy={SEC.yG + 42} r={26} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <circle cx={SEC.x0 + 673} cy={SEC.yG + 42} r={8} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3} />
      <line x1={SEC.x0 + 600} y1={SEC.yG + 52} x2={SEC.x0 + 640} y2={SEC.yG + 52}
        stroke={C.zincDark} strokeWidth={12} />
      {/* ビル本体 */}
      <rect x={SEC.x0} y={SEC.yTop} width={SEC.x1 - SEC.x0} height={SEC.yG - SEC.yTop}
        fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
      {/* 各階 */}
      {Array.from({ length: SEC.n }, (_, i) => {
        const yb = secY(i), yt = secY(i + 1);
        const wh = (yb - yt) * 0.56;
        const lit = i >= 24;
        return (
          <g key={i}>
            <line x1={SEC.x0} y1={yt} x2={SEC.x1} y2={yt} stroke={KRP.ink}
              strokeWidth={2.5} opacity={0.45} />
            {Array.from({ length: 5 }, (_, c) => {
              const wx = SEC.x0 + 42 + c * 128;
              return (
                <g key={c}>
                  <rect x={wx} y={yt + (yb - yt - wh) / 2} width={96} height={wh}
                    fill={lit ? C.lit : C.dark} stroke={KRP.ink} strokeWidth={2} />
                  {!lit && (
                    <rect x={wx} y={yt + (yb - yt - wh) / 2} width={96} height={wh}
                      fill={C.dark} opacity={blackout} />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
      {/* ---- 停電した下24階を、ちゃんと暗くする (#258) ---- */}
      {night && (
        <g>
          {/* 建物の中。下へ行くほど濃く沈める */}
          {[0, 1, 2, 3, 4].map((b) => {
            const bh = (SEC.yG - SEC_BORDER) / 5;
            return (
              <rect key={b} x={SEC.x0 + 3} y={SEC_BORDER + b * bh}
                width={SEC.x1 - SEC.x0 - 6} height={bh + 1}
                fill={C.nightDeep} opacity={(0.16 + b * 0.09) * blackout} />
            );
          })}
          {/* 地下と地面も夜に沈める */}
          <rect x={0} y={SEC.yG + 2} width={W} height={H - SEC.yG}
            fill={C.nightDeep} opacity={0.3 * blackout} />
          <rect x={SEC.x0 - 56} y={SEC.yG + 4} width={SEC.x1 - SEC.x0 + 112} height={94}
            fill={C.nightDeep} opacity={0.34 * blackout} />
          {/* 境目の上は灯りが残っているので、下へこぼれる暖かい光 */}
          <rect x={SEC.x0 + 3} y={SEC_BORDER - 108} width={SEC.x1 - SEC.x0 - 6} height={108}
            fill={C.lit} opacity={0.16} />
          <rect x={SEC.x0 - 54} y={SEC.yTop} width={SEC.x1 - SEC.x0 + 108}
            height={SEC_BORDER - SEC.yTop} fill={BP.lamp} opacity={0.09} />
          {/* 暗い階から外へ漏れる、住人の懐中電灯の光 (左右へ 150px) */}
          {[
            [17, -1], [8, 1], [4, -1], [21, 1],
          ].map(([fl, dir]) => {
            const by = secY(fl) - SEC_FH * 0.5;
            const wallX = dir < 0 ? SEC.x0 + 4 : SEC.x1 - 4;
            const far = wallX + dir * 152;
            const fk = 0.74 + 0.26 * Math.sin(f / 4.2 + fl);
            return (
              <g key={`${fl}-${dir}`} opacity={blackout}>
                <polygon
                  points={`${wallX} ${by - 7} ${far} ${by - 56} ${far} ${by + 56}`}
                  fill={BP.lamp} opacity={0.34 * fk}
                />
                <polygon
                  points={`${wallX} ${by - 5} ${wallX + dir * 96} ${by - 28} ${wallX + dir * 96} ${by + 28}`}
                  fill={BP.lampGlow} opacity={0.44 * fk}
                />
                {/* 光の根もと (窓の内側で灯っている懐中電灯) */}
                <rect x={dir < 0 ? SEC.x0 + 6 : SEC.x1 - 66} y={by - 7} width={60} height={14}
                  fill={BP.lampGlow} stroke={KRP.ink} strokeWidth={1.6} opacity={0.9 * fk} />
              </g>
            );
          })}
        </g>
      )}
      {/* 給水の立管と各階の蛇口 */}
      <line x1={SEC_RISER} y1={SEC.yG + 40} x2={SEC_RISER} y2={SEC.yTop + 26}
        stroke={C.zincDark} strokeWidth={15} strokeLinecap="round" />
      {Array.from({ length: SEC.n }, (_, i) => {
        const y = secY(i) - SEC_FH * 0.5;
        const xt = seg(f, 6 + (i % 24) * 1.2, 13 + (i % 24) * 1.2);
        return (
          <g key={i}>
            <line x1={SEC_RISER} y1={y} x2={SEC_RISER + 34} y2={y} stroke={C.zincDark} strokeWidth={5} />
            <rect x={SEC_RISER + 30} y={y - 4} width={10} height={8} fill={BP.brass}
              stroke={KRP.ink} strokeWidth={1.6} />
            {dansui && (
              <g stroke={KRP.red} strokeWidth={4} strokeLinecap="round" opacity={xt}>
                <line x1={SEC_RISER + 46} y1={y - 5.5} x2={SEC_RISER + 57} y2={y + 5.5} />
                <line x1={SEC_RISER + 57} y1={y - 5.5} x2={SEC_RISER + 46} y2={y + 5.5} />
              </g>
            )}
          </g>
        );
      })}
      {/* 24階の境目 */}
      <line x1={300} y1={SEC_BORDER} x2={lerp(300, 1700, easeOut(seg(f, 10, 30)))} y2={SEC_BORDER}
        stroke={KRP.red} strokeWidth={9} strokeLinecap="round" />
      <TagPlate x={1578} y={SEC_BORDER} text="24階" size={56} t={seg(f, 20, 34)} color={KRP.red} />
      <TagPlate x={1620} y={170} text="47階" size={48} t={seg(f, 24, 38)} />
      {/* 地下の札 */}
      <line x1={424} y1={740} x2={SEC.x0 - 40} y2={744} stroke={KRP.ink} strokeWidth={4} opacity={0.7} />
      <TagPlate x={296} y={740} text="地下 電気室" size={34} t={seg(f, 16, 30)} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// ===== #250 では、高さの代金は、消えたのでしょうか。 =====
// 格: 図
// どこ: 「高さの代金」の計器そのものに寄る。クリーム地・方眼
// 演出: 鉄の計器箱に収まった大きな円弧目盛り。針の取付座だけが残り、針がない
// 動き: 目盛りが端から順に浮き出る → 数字 → 取付座 → 大きな？が浮いて揺れる
const Kb6dDaikinWaKieta: React.FC<{ f: number }> = ({ f }) => {
  const cx = 960, cy = 640, r = 450;
  const grow = pop(clamp01(seg(f, 0, 14)));
  return (
    <Frame f={f} seed={883} bg={KRP.cream}>
      <GridPaper />
      {/* ---- 計器の箱 ---- */}
      <g transform={`translate(${cx} ${cy}) scale(${grow}) translate(${-cx} ${-cy})`}>
        <rect x={cx - 560} y={cy - 520} width={1120} height={660} rx={18}
          fill={C.stone} stroke={KRP.ink} strokeWidth={9} />
        <rect x={cx - 534} y={cy - 494} width={1068} height={608} rx={12}
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.45} />
        <Rivets x1={cx - 520} y1={cy - 478} x2={cx + 520} y2={cy - 478} n={13} r={9} fill={BP.steelDark} />
        <Rivets x1={cx - 520} y1={cy + 100} x2={cx + 520} y2={cy + 100} n={13} r={9} fill={BP.steelDark} />
        <HexBolt x={cx - 536} y={cy - 496} r={18} fill={BP.steelDark} />
        <HexBolt x={cx + 536} y={cy - 496} r={18} fill={BP.steelDark} />
        <HexBolt x={cx - 536} y={cy + 116} r={18} fill={BP.steelDark} />
        <HexBolt x={cx + 536} y={cy + 116} r={18} fill={BP.steelDark} />
        {/* 箱の脚 */}
        <rect x={cx - 470} y={cy + 140} width={120} height={46}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={cx + 350} y={cy + 140} width={120} height={46}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={6} />
        {/* ---- 本体の円弧目盛り (針なし) ---- */}
        <Kb6dArcGauge cx={cx} cy={cy} r={r} f={f} needle={null} />
      </g>
      {/* ---- 針がないところに大きな？ ---- */}
      <QMark x={cx} y={490} s={3.1} f={f} t={seg(f, 20, 36)} />
      {/* ---- 札 ---- */}
      <TagPlate x={cx} y={700} text="高さの代金" size={56} t={seg(f, 14, 28)} />
      <TagPlate x={250} y={222} text="目盛り" size={40} t={seg(f, 10, 24)} />
      <Arrow x={462} y={222} s={0.9} rot={0} t={seg(f, 14, 28)} color={KRP.ink} />
      <TagPlate x={1672} y={238} text="針がない" size={38} t={seg(f, 26, 40)} color={KRP.red} />
      <TagPlate x={1690} y={700} text="単位 不明" size={32} t={seg(f, 32, 42)} />
    </Frame>
  );
};

// ===== #251 消えていません。見えなくなっただけです。 =====
// 格: 図
// どこ: #250 と同じ計器。ただし床の下に落ちている。床を切った断面
// 演出: 床の点検口に亜鉛の蓋が滑って閉まる。上からは見えないが、断面では針が振れ続けている
// 動き: 蓋が左から右へ閉まる / 床下の針が振り続ける / 「床の上」「床下」の札
const Kb6dMienakuNatta: React.FC<{ f: number }> = ({ f }) => {
  const yF = 300, yFB = 352;                       // 床板の上端・下端
  const cx = 960, cy = 744, r = 400;
  const lid = easeOut(seg(f, 6, 30));
  const lidX = lerp(-40, 646, lid);                // 蓋の左端
  const needle = 0.5 + Math.sin(f / 8.5) * 0.3;    // 針は動き続ける
  return (
    <Frame f={f} seed={884} bg={KRP.cream}>
      <GridPaper />
      {/* ---- 床の上 (明るい) ---- */}
      <rect x={0} y={0} width={W} height={yF} fill={KRP.white} opacity={0.5} />
      {/* ---- 床組の断面 ---- */}
      {/* 床板 (点検口の手前と奥で切れる) */}
      <rect x={-20} y={yF} width={660} height={34} fill={BP.woodLight}
        stroke={KRP.ink} strokeWidth={7} />
      <rect x={1300} y={yF} width={W - 1280} height={34} fill={BP.woodLight}
        stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={60} y1={yF + 17} x2={600} y2={yF + 17} n={7} r={6} fill={BP.woodDark} />
      <Rivets x1={1340} y1={yF + 17} x2={1860} y2={yF + 17} n={7} r={6} fill={BP.woodDark} />
      {/* 根太 (断面のハッチ) */}
      {[-20, 300, 1300, 1620].map((x) => (
        <g key={x}>
          <rect x={x} y={yF + 34} width={150} height={yFB - yF - 34 + 26}
            fill={BP.wood} stroke={KRP.ink} strokeWidth={6} />
          <g stroke={KRP.ink} strokeWidth={3} opacity={0.4}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={x + i * 40} y1={yF + 34} x2={x + i * 40 + 34} y2={yFB + 26} />
            ))}
          </g>
        </g>
      ))}
      {/* 点検口の枠 */}
      <rect x={632} y={yF - 6} width={30} height={64} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      <rect x={1278} y={yF - 6} width={30} height={64} fill={BP.steelDark}
        stroke={KRP.ink} strokeWidth={5} />
      {/* ---- 床下 (暗い) ---- */}
      <rect x={0} y={yF + 34} width={W} height={H - yF - 34} fill={C.dark} opacity={0.14} />
      {/* ---- 床下の目盛り (針が振れ続けている) ---- */}
      <Kb6dArcGauge cx={cx} cy={cy} r={r} f={f} needle={needle} face={C.stone} />
      {/* 計器の取付台 */}
      <rect x={cx - r - 40} y={cy} width={(r + 40) * 2} height={38}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={7} />
      <HexBolt x={cx - r} y={cy + 19} r={14} fill={BP.steel} />
      <HexBolt x={cx + r} y={cy + 19} r={14} fill={BP.steel} />
      {/* 針の残像 (動き続けている証) */}
      <g stroke={KRP.red} strokeWidth={8} strokeLinecap="round" opacity={0.22}>
        {[-0.14, 0.14].map((d, i) => {
          const th = ((180 - (needle + d) * 180) * Math.PI) / 180;
          return (
            <line key={i} x1={cx} y1={cy}
              x2={cx + Math.cos(th) * r * 0.84} y2={cy - Math.sin(th) * r * 0.84} />
          );
        })}
      </g>
      {/* ---- 滑って閉まる蓋 ---- */}
      <g>
        <rect x={lidX} y={yF - 16} width={672} height={40} rx={6}
          fill={C.zinc} stroke={KRP.ink} strokeWidth={7} />
        <line x1={lidX + 20} y1={yF + 4} x2={lidX + 652} y2={yF + 4}
          stroke={C.zincDark} strokeWidth={5} />
        <HexBolt x={lidX + 34} y={yF + 4} r={12} fill={C.zincDark} />
        <HexBolt x={lidX + 638} y={yF + 4} r={12} fill={C.zincDark} />
        <rect x={lidX + 300} y={yF - 34} width={76} height={20} rx={8}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
      </g>
      <ForceArrow x={lidX - 190} y={yF + 4} len={170} rot={0} w={26}
        color={KRP.ink} t={seg(f, 4, 18)} />
      {/* ---- 札 ---- */}
      <TagPlate x={250} y={150} text="床の上" size={42} t={seg(f, 4, 18)} />
      <TagPlate x={220} y={470} text="床下" size={42} t={seg(f, 12, 26)} />
      <TagPlate x={1660} y={470} text="針は振れている" size={32} t={seg(f, 24, 38)} color={KRP.red} />
      <TagPlate x={1672} y={196} text="ふたが閉まる" size={30} t={seg(f, 16, 30)} />
    </Frame>
  );
};

// ===== #252 2019年10月、川崎市の武蔵小杉。 =====
// 格: 並
// どこ: 武蔵小杉の交差点。タワーマンションの足元。雨
// 演出: 灰青一色の街。描くのは「雨の歩道」だけ。建物は足元だけ見せて上は画面外へ逃がす
// 動き: 雨が降る / 水たまりに波紋 / 信号が青→点滅 / 傘の人がゆれる
const Kb6dMusashikosugi: React.FC<{ f: number }> = ({ f }) => {
  const yG = 800;
  const sig = (f % 30) < 20 ? 1 : 0.2;
  const z = lerp(1.0, 1.03, easeOut(seg(f, 0, 42)));
  return (
    <Frame f={f} seed={885} bg={C.rain} dark>
      <rect x={0} y={0} width={W} height={H} fill={C.rain} />
      <rect x={0} y={0} width={W} height={420} fill={C.rainDeep} opacity={0.5} />
      <g transform={zoomAt(z, 960, 700)}>
        {/* ---- タワーマンションの足元 (上は画面外) ---- */}
        <rect x={700} y={-20} width={760} height={yG + 20}
          fill={C.stone} stroke={KRP.ink} strokeWidth={8} />
        <rect x={1460} y={-20} width={150} height={yG + 20}
          fill={C.stoneDark} stroke={KRP.ink} strokeWidth={8} />
        {/* 窓 (足元の数層だけ) */}
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            {Array.from({ length: 5 }, (_, c) => {
              const on = rnd(i * 5.3 + c * 2.9) > 0.45;
              return (
                <rect key={c} x={732 + c * 142} y={30 + i * 100} width={104} height={62}
                  fill={on ? C.lit : C.dark} opacity={on ? 0.85 : 1}
                  stroke={KRP.ink} strokeWidth={3.5} />
              );
            })}
            <line x1={700} y1={112 + i * 100} x2={1460} y2={112 + i * 100}
              stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
          </g>
        ))}
        {/* エントランスの庇とガラス */}
        <rect x={760} y={yG - 190} width={560} height={190}
          fill={C.dark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={800} y={yG - 156} width={226} height={156}
          fill={C.lit} opacity={0.8} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1050} y={yG - 156} width={226} height={156}
          fill={C.lit} opacity={0.55} stroke={KRP.ink} strokeWidth={4} />
        <rect x={720} y={yG - 226} width={640} height={36} rx={8}
          fill={C.zinc} stroke={KRP.ink} strokeWidth={7} />
        {/* 植栽の縁石 */}
        <rect x={1360} y={yG - 54} width={240} height={54}
          fill={C.stoneDark} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={1480} cy={yG - 76} rx={96} ry={44} fill={C.leaf}
          stroke={KRP.ink} strokeWidth={6} />
        {/* ---- 濡れた歩道 ---- */}
        <rect x={0} y={yG} width={W} height={H - yG} fill={C.zincDark} />
        <line x1={0} y1={yG} x2={W} y2={yG} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.22}>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={-100 + i * 420} y1={H} x2={260 + i * 300} y2={yG} />
          ))}
          <line x1={0} y1={yG + 110} x2={W} y2={yG + 110} />
        </g>
        {/* 建物の灯りの照り返し */}
        <g stroke={C.lit} strokeWidth={26} opacity={0.17} strokeLinecap="round">
          {[880, 1140].map((rx, i) => (
            <line key={i} x1={rx} y1={yG + 10} x2={rx + 14} y2={yG + 230 + i * 30} />
          ))}
        </g>
        {/* 水たまりと波紋 */}
        {[[320, 880], [1180, 940]].map(([px, py], i) => (
          <g key={i}>
            <ellipse cx={px} cy={py} rx={168 - i * 36} ry={38 - i * 8}
              fill={C.rainDeep} opacity={0.55} stroke={KRP.ink} strokeWidth={4} />
            {[0, 1, 2].map((k) => {
              const ph = ((f * 1.6 + k * 14 + i * 7) % 42) / 42;
              return (
                <ellipse key={k} cx={px} cy={py} rx={(168 - i * 36) * ph} ry={(38 - i * 8) * ph}
                  fill="none" stroke={KRP.white} strokeWidth={3.5} opacity={(1 - ph) * 0.5} />
              );
            })}
          </g>
        ))}
        {/* ---- 信号機 ---- */}
        <line x1={460} y1={yG} x2={460} y2={214} stroke={C.zincDark}
          strokeWidth={20} strokeLinecap="round" />
        <line x1={460} y1={224} x2={386} y2={224} stroke={C.zincDark} strokeWidth={16} />
        <rect x={192} y={186} width={204} height={82} rx={12}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={228 + i * 66} cy={227} r={26}
            fill={i === 2 ? C.emerGreen : i === 1 ? C.panelDark : C.panelDark}
            opacity={i === 2 ? sig : 1}
            stroke={KRP.ink} strokeWidth={4} />
        ))}
        <circle cx={360} cy={227} r={48} fill={C.emerGreen} opacity={0.18 * sig} />
        <rect x={436} y={yG - 24} width={48} height={24} rx={6}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
        {/* ---- 傘をさす人 ---- */}
        <Kb6dUmbrella x={660} y={452} s={1.3} handle={218} color={C.night} />
        <Person x={660} y={800} s={1.0} cloth={C.nightDeep} clothDark={C.dark}
          face="worried" gaze={[-2, 1]} f={f} />
      </g>
      {/* ---- 雨 ---- */}
      <Kb6dRain f={f} n={110} slant={0.26} len={140} w={3.5} seed={3} speed={38} opacity={0.4} />
      {/* ---- 札 ---- */}
      <TagPlate x={1560} y={182} text="2019年10月" size={48} t={seg(f, 6, 20)} />
      <TagPlate x={1588} y={296} text="川崎市 武蔵小杉" size={34} t={seg(f, 16, 30)} />
    </Frame>
  );
};

// ===== #253 47階、643戸のタワーマンションがあります。 =====
// 格: 山
// どこ: 武蔵小杉。タワーマンションの真下の歩道。見上げている
// 演出: 一点透視で上へ消える壁面。47層ぶんの窓が上へ詰まる。雨雲が頂部を掠める
// 動き: カメラがゆっくり寄る / 雲が流れる / 窓が数軒ずつ灯る / 航空障害灯が点滅 / 雨 / 人が見上げる
const Kb6dN47Kai643Ko: React.FC<{ f: number }> = ({ f }) => {
  const yB = 824, yT = 48;            // 壁面の下端 (歩道) と上端 (頂部)
  const cx = 900;
  const hwB = 392, hwT = 214;          // 下端・上端の半幅
  const dxB = 104, dxT = 54;           // 右の側面の奥行き
  const u = (i: number) => Math.pow(i / 47, 0.78);
  const yOf = (i: number) => yB - (yB - yT) * u(i);
  const hwOf = (i: number) => lerp(hwB, hwT, u(i));
  const dxOf = (i: number) => lerp(dxB, dxT, u(i));
  const z = lerp(1.0, 1.055, easeOut(seg(f, 0, 42)));
  const blink = ((f % 26) < 11) ? 1 : 0.18;
  return (
    <Frame f={f} seed={886} bg={C.rainDeep}>
      {/* 雨雲の空 (奥 → 手前の3層) */}
      <rect x={0} y={0} width={W} height={H} fill={C.rainDeep} />
      <rect x={0} y={0} width={W} height={300} fill={C.zincDark} opacity={0.45} />
      <g transform={zoomAt(z, 900, 700)}>
        {/* ---- 建物 ---- */}
        {/* 側面 (奥行き) */}
        <polygon
          points={`${cx + hwB},${yB} ${cx + hwB + dxB},${yB - 74} ${cx + hwT + dxT},${yT - 28} ${cx + hwT},${yT}`}
          fill={C.stoneDark} stroke={KRP.ink} strokeWidth={7} />
        {/* 正面 */}
        <polygon
          points={`${cx - hwB},${yB} ${cx + hwB},${yB} ${cx + hwT},${yT} ${cx - hwT},${yT}`}
          fill={C.stone} stroke={KRP.ink} strokeWidth={7} />
        {/* 階ごとの床スラブ線・窓・手すり (47層) */}
        {Array.from({ length: 47 }, (_, i) => {
          const yb = yOf(i), yt = yOf(i + 1);
          const hw = hwOf(i + 0.5), dx = dxOf(i + 0.5);
          const fh = yb - yt;
          const wh = Math.max(2.2, fh * 0.52);
          const sw = Math.max(1.3, 2.6 - i * 0.03);
          const pitch = (hw * 2) / 7;
          return (
            <g key={i}>
              {/* 床スラブ */}
              <line x1={cx - hw} y1={yt} x2={cx + hw} y2={yt}
                stroke={KRP.ink} strokeWidth={Math.max(1.4, 3 - i * 0.035)} opacity={0.42} />
              <line x1={cx + hw} y1={yt} x2={cx + hw + dx} y2={yt - fh * 0.9}
                stroke={KRP.ink} strokeWidth={Math.max(1.2, 2.4 - i * 0.03)} opacity={0.3} />
              {/* 正面の窓 7列 */}
              {Array.from({ length: 7 }, (_, c) => {
                const wx = cx - hw + pitch * (c + 0.5);
                const ww = pitch * 0.64;
                const on = rnd(i * 7.73 + c * 3.37) > 0.42;
                const t = on ? seg(f, 2 + ((i * 3 + c * 5) % 17) * 1.9, 9 + ((i * 3 + c * 5) % 17) * 1.9) : 0;
                return (
                  <g key={c}>
                    <rect x={wx - ww / 2} y={yt + (fh - wh) * 0.42} width={ww} height={wh}
                      fill={C.dark} stroke={KRP.ink} strokeWidth={sw} />
                    {on && (
                      <rect x={wx - ww / 2} y={yt + (fh - wh) * 0.42} width={ww} height={wh}
                        fill={C.lit} opacity={t * 0.92} />
                    )}
                  </g>
                );
              })}
              {/* 側面の窓 3列 */}
              {Array.from({ length: 3 }, (_, c) => {
                const t0 = (c + 0.5) / 3;
                const sx = cx + hw + dx * t0;
                const sy = yt + (fh - wh) * 0.42 - fh * 0.9 * t0;
                const on = rnd(i * 11.1 + c * 5.9) > 0.55;
                return (
                  <rect key={c} x={sx - dx * 0.11} y={sy} width={dx * 0.22} height={wh}
                    fill={on ? C.lit : C.dark} opacity={on ? 0.7 : 1}
                    stroke={KRP.ink} strokeWidth={Math.max(1.1, sw * 0.8)} />
                );
              })}
              {/* バルコニーの手すり (3階ごと) */}
              {i % 3 === 0 && (
                <line x1={cx - hw} y1={yb - fh * 0.12} x2={cx + hw} y2={yb - fh * 0.12}
                  stroke={C.zinc} strokeWidth={Math.max(1.6, 4 - i * 0.05)} opacity={0.65} />
              )}
            </g>
          );
        })}
        {/* 縦の構造スリット (角から2本ずつ) */}
        <g stroke={KRP.ink} strokeWidth={5} opacity={0.3}>
          <line x1={cx - hwB * 0.62} y1={yB} x2={cx - hwT * 0.62} y2={yT} />
          <line x1={cx + hwB * 0.62} y1={yB} x2={cx + hwT * 0.62} y2={yT} />
        </g>
        {/* 頂部のパラペットと航空障害灯 */}
        <rect x={cx - hwT - 16} y={yT - 30} width={(hwT + 16) * 2} height={32}
          fill={C.zincDark} stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={cx - hwT} y1={yT - 14} x2={cx + hwT} y2={yT - 14} n={7} r={5} fill={BP.steelDark} />
        <line x1={cx - 54} y1={yT - 30} x2={cx - 54} y2={yT - 92}
          stroke={BP.steelDark} strokeWidth={8} strokeLinecap="round" />
        <line x1={cx + 54} y1={yT - 30} x2={cx + 54} y2={yT - 78}
          stroke={BP.steelDark} strokeWidth={8} strokeLinecap="round" />
        <circle cx={cx - 54} cy={yT - 98} r={13} fill={KRP.red} stroke={KRP.ink}
          strokeWidth={4} opacity={blink} />
        <circle cx={cx - 54} cy={yT - 98} r={26} fill={KRP.red} opacity={blink * 0.25} />
        {/* ---- 足元 ---- */}
        {/* 濡れた歩道 */}
        <rect x={0} y={yB} width={W} height={H - yB} fill={C.zincDark} />
        <line x1={0} y1={yB} x2={W} y2={yB} stroke={KRP.ink} strokeWidth={8} />
        <g stroke={C.lit} strokeWidth={9} opacity={0.2} strokeLinecap="round">
          {[420, 640, 1100, 1320, 1520].map((rx, i) => (
            <line key={i} x1={rx} y1={yB + 14} x2={rx + 10} y2={yB + 150 + i * 16} />
          ))}
        </g>
        {/* エントランスの庇とガラス */}
        <rect x={cx - 250} y={yB - 128} width={500} height={128}
          fill={C.dark} stroke={KRP.ink} strokeWidth={6} />
        <rect x={cx - 214} y={yB - 104} width={200} height={104}
          fill={C.lit} opacity={0.82} stroke={KRP.ink} strokeWidth={4} />
        <rect x={cx + 14} y={yB - 104} width={200} height={104}
          fill={C.lit} opacity={0.6} stroke={KRP.ink} strokeWidth={4} />
        <rect x={cx - 290} y={yB - 150} width={580} height={30} rx={8}
          fill={C.zinc} stroke={KRP.ink} strokeWidth={6} />
      </g>
      {/* ---- 雨雲 (建物の手前を流れる) ---- */}
      <g opacity={0.52}>
        {[0, 1, 2, 3].map((i) => {
          const bx = ((rnd(i * 3.1) * 2400 + f * (2.4 + i * 0.7)) % 2600) - 340;
          const by = 110 + i * 74;
          const s = 1 + i * 0.26;
          return (
            <g key={i} transform={`translate(${bx} ${by}) scale(${s})`}>
              <ellipse cx={0} cy={0} rx={210} ry={48} fill={C.zincDark} />
              <ellipse cx={-110} cy={14} rx={120} ry={34} fill={C.zincDark} />
              <ellipse cx={130} cy={10} rx={140} ry={38} fill={C.rain} opacity={0.7} />
            </g>
          );
        })}
      </g>
      {/* ---- 雨 ---- */}
      <Kb6dRain f={f} n={120} slant={0.3} len={150} w={3.5} seed={6} speed={42} opacity={0.42} />
      {/* ---- 見上げる人 ---- */}
      <Kb6dUmbrella x={300} y={430} s={1.18} handle={330} color={C.night} />
      <Person x={300} y={838} s={1.2} cloth={C.night} clothDark={C.nightDeep}
        face="surprised" gaze={[0, -3]} lean={-3} f={f} />
      {/* ---- 札 ---- */}
      <TagPlate x={1720} y={288} text="47階" size={60} t={seg(f, 8, 22)} />
      <TagPlate x={1720} y={414} text="643戸" size={56} t={seg(f, 16, 30)} />
      <TagPlate x={1710} y={534} text="タワーマンション" size={32} t={seg(f, 26, 40)} />
      <Arrow x={1498} y={288} s={1.0} rot={180} t={seg(f, 12, 26)} color={KRP.red} />
    </Frame>
  );
};

// ===== #254 台風19号が来ました。 =====
// 格: 並
// どこ: 同じ街。嵐の最中。カメラは歩道の高さ
// 演出: 描くのは「横殴りの雨」だけ。建物は輪郭まで霞ませ、手前の樹と電線に風を全部背負わせる
// 動き: 雨が横に走る / 街路樹がしなる / 電線がたわんで振動 / 傘が転がり飛ぶ
const Kb6dTaifuu19Gou: React.FC<{ f: number }> = ({ f }) => {
  const yG = 806;
  const gust = Math.sin(f / 7) * 0.5 + 0.5;            // 0→1 の突風
  const bend = 40 + gust * 34;                          // 樹のしなり (風は左向き)
  const sagOsc = Math.sin(f / 5.5) * 18;
  const uT = seg(f, 0, 42);
  const ux = lerp(1780, 760, uT);
  const uy = 430 + Math.sin(f / 6) * 60;
  // 街路樹 (幹がしなる)
  const Tree = (tx: number, s: number, ph: number) => {
    const b = -bend * s * (0.8 + Math.sin(f / 7 + ph) * 0.3); // 負 = 風下 (左) へしなる
    const H0 = 340 * s;
    const px = (t: number) => tx + b * 2.2 * t * t;
    const py = (t: number) => yG - H0 * t;
    const trunk = `M ${tx} ${yG} C ${tx + b * 0.3} ${yG - H0 * 0.42}, ${px(0.72)} ${py(0.72)}, ${px(1)} ${py(1)}`;
    return (
      <g key={tx}>
        {/* 根元の土 */}
        <ellipse cx={tx} cy={yG} rx={58 * s} ry={15 * s} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        {/* 幹 (輪郭→中身の二度描き) */}
        <path d={trunk} fill="none" stroke={KRP.ink} strokeWidth={34 * s} strokeLinecap="round" />
        <path d={trunk} fill="none" stroke={BP.woodDark} strokeWidth={24 * s} strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => {
          const t0 = 0.5 + i * 0.15;
          const bx = px(t0), by = py(t0);
          const dir = i % 2 === 0 ? -1 : 1;
          const ex = bx - 70 * s + b * 0.6;
          const ey = by + 30 * dir;
          const branch = `M ${bx} ${by} Q ${(bx + ex) / 2} ${by - 16 * dir} ${ex} ${ey}`;
          const lx = ex - 30 * s, ly = ey;
          return (
            <g key={i}>
              <path d={branch} fill="none" stroke={KRP.ink} strokeWidth={15 * s} strokeLinecap="round" />
              <path d={branch} fill="none" stroke={BP.woodDark} strokeWidth={9 * s} strokeLinecap="round" />
              <ellipse cx={lx} cy={ly} rx={88 * s} ry={38 * s}
                fill={C.leaf} stroke={KRP.ink} strokeWidth={5}
                transform={`rotate(${12 + gust * 14} ${lx} ${ly})`} />
              <path d={`M ${lx - 70 * s} ${ly + 4} q ${36 * s} ${-15 * s} ${74 * s} 0`}
                fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.45} />
            </g>
          );
        })}
        {/* ちぎれて風下へ飛ぶ葉 */}
        {[0, 1, 2, 3].map((i) => {
          const pr = ((f * 13 + i * 61 + tx) % 560) / 560;
          const lx = tx - 120 - pr * 560;
          const ly = yG - H0 * 0.9 + Math.sin(pr * 9 + i) * 80;
          return (
            <ellipse key={i} cx={lx} cy={ly} rx={16} ry={9} fill={C.leaf}
              stroke={KRP.ink} strokeWidth={3} opacity={0.85 * (1 - pr)}
              transform={`rotate(${pr * 420} ${lx} ${ly})`} />
          );
        })}
      </g>
    );
  };
  return (
    <Frame f={f} seed={887} bg={C.rainDeep} dark>
      <rect x={0} y={0} width={W} height={H} fill={C.rainDeep} />
      <rect x={0} y={0} width={W} height={300} fill={C.zincDark} opacity={0.55} />
      {/* ---- 雨に霞む建物の輪郭 (3層。奥ほど薄い) ---- */}
      <g>
        <rect x={120} y={250} width={300} height={yG - 250} fill={C.zincDark} opacity={0.5} />
        <rect x={1340} y={190} width={420} height={yG - 190} fill={C.zincDark} opacity={0.5} />
        <rect x={560} y={100} width={330} height={yG - 100} fill={C.zincDark} opacity={0.64} />
        <rect x={980} y={310} width={300} height={yG - 310} fill={C.zincDark} opacity={0.56} />
        {/* 霞んだ窓 (にじみ) */}
        <g fill={C.lit} opacity={0.32}>
          {Array.from({ length: 26 }, (_, i) => (
            <rect key={i} x={580 + (i % 4) * 78 + Math.floor(i / 13) * 420}
              y={160 + Math.floor(i / 4) * 92} width={54} height={46} />
          ))}
        </g>
      </g>
      {/* ---- 電柱と、たわむ電線 ---- */}
      <line x1={230} y1={yG} x2={230} y2={236} stroke={C.zincDark}
        strokeWidth={26} strokeLinecap="round" />
      <line x1={1690} y1={yG} x2={1690} y2={286} stroke={C.zincDark}
        strokeWidth={26} strokeLinecap="round" />
      <line x1={160} y1={268} x2={300} y2={268} stroke={BP.woodDark} strokeWidth={14} />
      <line x1={1620} y1={316} x2={1760} y2={316} stroke={BP.woodDark} strokeWidth={14} />
      {[0, 1, 2].map((i) => (
        <path key={i}
          d={`M 180 ${262 + i * 26} Q 960 ${430 + i * 30 + sagOsc} 1740 ${310 + i * 26}`}
          fill="none" stroke={BP.ironDark} strokeWidth={9 - i} strokeLinecap="round" opacity={0.9} />
      ))}
      {/* 碍子 */}
      {[180, 232, 284].map((x) => (
        <circle key={x} cx={x} cy={264} r={9} fill={C.stone} stroke={KRP.ink} strokeWidth={3.5} />
      ))}
      {/* ---- 街路樹 2本 ---- */}
      {Tree(640, 1.55, 0)}
      {Tree(1480, 1.2, 1.7)}
      {/* ---- 地面 ---- */}
      <rect x={0} y={yG} width={W} height={H - yG} fill={C.zinc} />
      <rect x={0} y={yG} width={W} height={46} fill={C.zincDark} opacity={0.7} />
      <line x1={0} y1={yG} x2={W} y2={yG} stroke={KRP.ink} strokeWidth={8} />
      {/* 路面の継ぎ目 */}
      <g stroke={KRP.ink} strokeWidth={4} opacity={0.22}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={-120 + i * 440} y1={H} x2={240 + i * 320} y2={yG} />
        ))}
      </g>
      {/* 風で走る水膜と、はね上がる飛沫 */}
      <g stroke={KRP.white} strokeWidth={9} opacity={0.42} strokeLinecap="round">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const px = ((f * 30 + i * 300) % 2300) - 240;
          return <line key={i} x1={px} y1={yG + 30 + i * 34} x2={px + 300} y2={yG + 38 + i * 34} />;
        })}
      </g>
      <g fill={KRP.white} opacity={0.35}>
        {Array.from({ length: 14 }, (_, i) => {
          const px = ((f * 18 + i * 171) % 2100) - 90;
          const py = yG + 20 + ((i * 53) % 220);
          return <ellipse key={i} cx={px} cy={py} rx={22} ry={5} />;
        })}
      </g>
      {/* ---- 飛ぶ傘 ---- */}
      <g transform={`rotate(${-f * 7} ${ux} ${uy})`}>
        <Kb6dUmbrella x={ux} y={uy} s={0.86} rot={0} handle={90} color={C.night} />
      </g>
      {/* ---- 横殴りの雨 (2層) ---- */}
      <Kb6dRain f={f} n={150} slant={1.5} len={230} w={4} seed={9} speed={62} opacity={0.45} />
      <Kb6dRain f={f} n={60} slant={1.9} len={340} w={7} seed={21} speed={88}
        opacity={0.3} color={C.rain} />
      {/* ---- 札 ---- */}
      <TagPlate x={1560} y={176} text="台風19号" size={54} t={seg(f, 6, 20)} color={KRP.red} />
      <ForceArrow x={1130} y={730} len={340} rot={180} w={30}
        color={KRP.red} t={seg(f, 16, 32)} label="風" labelSize={44} />
    </Frame>
  );
};

// ===== #255 川が堤防を越えたのではありません。 =====
// 格: 図
// どこ: 多摩川の堤防の断面。左が川、右が市街地。雨の灰青 (設計書 L31「暗く、冷たく」)
// 演出: 水位は上がるが天端より下で止まる。
//   ★否定しているもの (= 越水) を破線の「幽霊の水」として描いてから、そこに×を打つ。
//     ×だけ置くと何を否定しているのか読めないので、否定の対象を必ず絵にする。
// 動き: 水位が上がって止まる / 波が流れる / 破線が伸びる / 幽霊の水がにじみ出る → 矢印 → ×
const Kb6dTeibouWoKoenai: React.FC<{ f: number }> = ({ f }) => {
  const yG = 790;                     // 地面
  const yCrest = 248;                 // 天端
  const yGhost = 152;                 // 「もし越えていたら」の水面
  const rise = easeOut(seg(f, 2, 26));
  const wl = lerp(600, 402, rise);    // 水位 (天端より下で止まる)
  const dash = easeOut(seg(f, 10, 30));
  const ghost = easeOut(seg(f, 16, 28));
  const riverEdgeAt = (y: number) => lerp(520, 820, (y - yG) / (yCrest - yG)); // 川側斜面のx
  const wave = (y: number) => {
    let d = `M -40 ${y}`;
    for (let i = 0; i <= 16; i++) {
      const x = -40 + (i * (riverEdgeAt(y) + 40)) / 16;
      d += ` L ${x.toFixed(1)} ${(y + Math.sin(i * 0.8 + f / 3.6) * 6).toFixed(1)}`;
    }
    return d;
  };
  // 起きなかった越水のかたち (天端の上にのった水の板 + 市街地側へ落ちる舌)
  const GHOST =
    `M -20 ${yGhost} L 1124 ${yGhost} L 1124 ${yCrest - 18}` +
    ` Q 1236 ${yCrest + 150} 1318 ${yG - 24} L 1362 ${yG} L 1250 ${yG}` +
    ` Q 1178 ${yCrest + 198} 1052 ${yCrest - 18} L -20 ${yCrest - 18} Z`;
  return (
    <Frame f={f} seed={888} bg={C.rainDeep} dark>
      {/* ---- 雨の灰青の空 (上が重い) ---- */}
      <rect x={0} y={0} width={W} height={H} fill={C.rainDeep} />
      <rect x={0} y={0} width={W} height={330} fill={C.zincDark} opacity={0.5} />
      <rect x={0} y={330} width={W} height={200} fill={C.nightDeep} opacity={0.12} />
      <GridPaper opacity={0.1} />
      {/* ---- 「市街地」の札が指すもの: 雨に沈む街のシルエット ---- */}
      <g>
        {[[1380, 492, 112], [1506, 414, 88], [1612, 530, 104]].map(([bx, by, bw]) => (
          <g key={bx}>
            <rect x={bx} y={by} width={bw} height={yG - by}
              fill={C.zincDark} stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
            <g fill={C.lit} opacity={0.26}>
              {Array.from({ length: 8 }, (_, i) => (
                <rect key={i} x={bx + 16 + (i % 2) * (bw - 60)} y={by + 26 + Math.floor(i / 2) * 58}
                  width={28} height={26} />
              ))}
            </g>
          </g>
        ))}
      </g>
      {/* 川底と市街地の地盤 (濡れた土) */}
      <Kb6dSoil x0={-20} x1={560} y={yG} h={290} n={10} fill={C.earthNight} />
      <Kb6dSoil x0={1300} x1={W + 20} y={yG} h={290} n={12} fill={C.earthNight} />
      {/* 堤防の本体 (台形。土のハッチ入り) */}
      <polygon points={`520,${yG} 820,${yCrest} 1060,${yCrest} 1360,${yG}`}
        fill={C.earthNight} stroke={KRP.ink} strokeWidth={8} />
      <g stroke={KRP.ink} strokeWidth={3} opacity={0.34}>
        {Array.from({ length: 13 }, (_, i) => {
          const y = yCrest + 40 + i * 42;
          return <line key={i} x1={riverEdgeAt(y) + 16} y1={y}
            x2={lerp(1360, 1060, (y - yG) / (yCrest - yG)) - 16} y2={y} />;
        })}
      </g>
      {/* 雨で濡れて光る斜面 (冷たさは照りで出す) */}
      <g stroke={C.rain} strokeWidth={5} opacity={0.28} strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={1090 + i * 62} y1={yCrest + 30 + i * 10}
            x2={1150 + i * 62} y2={yCrest + 170 + i * 10} />
        ))}
      </g>
      {/* 天端の舗装 */}
      <rect x={812} y={yCrest - 20} width={256} height={24}
        fill={C.zincDark} stroke={KRP.ink} strokeWidth={6} />
      <Rivets x1={830} y1={yCrest - 8} x2={1050} y2={yCrest - 8} n={6} r={6} fill={BP.ironDark} />
      {/* 川側の護岸ブロック */}
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const t = i / 9;
          const y = lerp(yG, yCrest + 30, t);
          return (
            <rect key={i} x={riverEdgeAt(y) - 6} y={y - 36} width={52} height={36}
              fill={BP.iron} stroke={KRP.ink} strokeWidth={4}
              transform={`rotate(-45 ${riverEdgeAt(y)} ${y})`} />
          );
        })}
      </g>
      {/* ---- 川の水 (増水して濁っている) ---- */}
      <path d={`M -20 ${wl} L ${riverEdgeAt(wl)} ${wl} L 520 ${yG} L -20 ${yG} Z`}
        fill={C.floodWater} opacity={0.95} />
      <path d={wave(wl)} fill="none" stroke={C.rain} strokeWidth={6} />
      <path d={wave(wl + 48)} fill="none" stroke={C.rain} strokeWidth={4} opacity={0.4} />
      <path d={wave(wl + 118)} fill="none" stroke={C.rain} strokeWidth={3.5} opacity={0.26} />
      {/* 水面に落ちる雨の波紋 */}
      <g stroke={C.rain} strokeWidth={3} fill="none" opacity={0.4}>
        {[0, 1, 2, 3, 4].map((i) => {
          const ph = ((f * 1.6 + i * 9) % 22) / 22;
          return <ellipse key={i} cx={70 + i * 108} cy={wl + 16 + i * 9}
            rx={10 + ph * 46} ry={4 + ph * 12} opacity={0.5 * (1 - ph)} />;
        })}
      </g>
      {/* ---- 起きなかった越水 (破線の幽霊。×が否定するのはこれ) ---- */}
      <g opacity={ghost}>
        <path d={GHOST} fill={C.ghostWater} opacity={0.3} />
        <path d={GHOST} fill="none" stroke={C.ghostWater} strokeWidth={7}
          strokeDasharray="28 20" strokeLinecap="round" opacity={0.95} />
        {/* 幽霊の水面のうねり */}
        <path d={`M 120 ${yGhost + 24} Q 500 ${yGhost + 10 + Math.sin(f / 4) * 8} 880 ${yGhost + 24}`}
          fill="none" stroke={C.ghostWater} strokeWidth={4} opacity={0.6} />
      </g>
      {/* ---- 天端レベルと水位レベルの破線 ---- */}
      <g strokeDasharray="22 18">
        <line x1={1060} y1={yCrest} x2={lerp(1060, 1620, dash)} y2={yCrest}
          stroke={C.stone} strokeWidth={6} />
        <line x1={riverEdgeAt(wl)} y1={wl} x2={lerp(riverEdgeAt(wl), 1620, dash)} y2={wl}
          stroke={C.rain} strokeWidth={6} />
      </g>
      {/* 差 (越えなかった高さ) の寸法線 */}
      <g opacity={easeOut(seg(f, 20, 34))} stroke={C.stone} strokeWidth={5}>
        <line x1={1580} y1={yCrest} x2={1580} y2={wl} />
        <line x1={1560} y1={yCrest} x2={1600} y2={yCrest} />
        <line x1={1560} y1={wl} x2={1600} y2={wl} />
      </g>
      {/* ---- 越える流れの矢印 (川の面から天端を越えて市街地へ) → これに × ---- */}
      <g opacity={easeOut(seg(f, 22, 32)) * 0.62}>
        <path d={`M 300 ${wl} Q 960 60 1330 640`} fill="none" stroke={KRP.red}
          strokeWidth={20} strokeLinecap="round" strokeDasharray="42 26" />
        <polygon points="1330,640 1267,603 1321,567" fill={KRP.red}
          stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      <XMark x={1004} y={196} s={1.7} t={seg(f, 30, 42)} />
      {/* ---- 横殴りの雨 (2層) ---- */}
      <Kb6dRain f={f} n={120} slant={1.05} len={180} w={3.5} seed={55} speed={54} opacity={0.4} />
      <Kb6dRain f={f} n={46} slant={1.35} len={280} w={6} seed={71} speed={78}
        opacity={0.24} color={C.rain} />
      {/* ---- 札 ---- */}
      {/* 否定の対象に名前をつける (札 + × で「越水は起きていない」が読める) */}
      <TagPlate x={700} y={200} text="越水" size={44} t={seg(f, 24, 36)} color={KRP.red} />
      <TagPlate x={1700} y={248} text="天端" size={42} t={seg(f, 14, 28)} />
      <TagPlate x={1700} y={402} text="水位" size={42} t={seg(f, 18, 32)} color={KRP.blueDeep} />
      <TagPlate x={220} y={700} text="多摩川" size={44} t={seg(f, 6, 20)} />
      <TagPlate x={940} y={560} text="堤防" size={48} t={seg(f, 10, 24)} />
      <TagPlate x={1470} y={700} text="市街地" size={40} t={seg(f, 24, 38)} />
    </Frame>
  );
};

// ===== #256 排水管を通って、水が逆流してきたんです。 =====
// 格: 図
// どこ: #255 と対になる断面図。地面の下を通る排水管を切って見せる
// 演出: 下水の本管から立管へ、汚れた水が下から上へ押し上がる。継手とボルトを描き込む
// 動き: 管内の水位が上がる / 太い逆流矢印が伸びる / 地上の雨水桝から水が溢れる
const Kb6dGyakuryuu: React.FC<{ f: number }> = ({ f }) => {
  const yS = 262;                 // 地表
  const PX = 900, PW = 320;       // 立管の中心と外径
  const BORE = 240;               // 内径
  const yMain = 760;              // 本管の芯
  const up = easeOut(seg(f, 3, 30));
  const wl = lerp(yMain, yS + 14, up);
  const bl = PX - BORE / 2, br = PX + BORE / 2;
  // 建物側へ分かれる横引きの排水管 (「排水管」の札と矢印が指すのはこれ)
  const BY = 492;                 // 横引き管の芯
  const BOUT = 78, BBORE = 55;    // 外半径 / 内半径
  const FLG = 470;                // 継手 (フランジ) の位置
  const back = easeOut(seg(f, 14, 36));
  const bx = lerp(740, -20, back); // 逆流が建物側へ押し込まれていく先端
  return (
    <Frame f={f} seed={889} bg={KRP.cream}>
      <GridPaper />
      {/* 地表の上の空気 / 地盤 */}
      <Kb6dSoil x0={-20} x1={W + 20} y={yS} h={H - yS + 20} n={34} />
      {/* 地表の舗装 */}
      <rect x={-20} y={yS - 26} width={W + 40} height={28}
        fill={C.zinc} stroke={KRP.ink} strokeWidth={7} />
      <Rivets x1={60} y1={yS - 12} x2={1860} y2={yS - 12} n={16} r={6} fill={C.zincDark} />
      {/* ---- 管の外壁 (立管 + 本管 + 建物側への横引き管。断面なので手前半分を切り落とす) ---- */}
      <g>
        {/* 立管 */}
        <rect x={PX - PW / 2} y={yS - 4} width={PW} height={yMain - yS + 100}
          fill={C.zincDark} stroke={KRP.ink} strokeWidth={8} />
        {/* 本管 (右へ) */}
        <rect x={PX} y={yMain - PW / 2} width={W + 20 - PX} height={PW}
          fill={C.zincDark} stroke={KRP.ink} strokeWidth={8} />
        {/* 横引き管 (左の建物へ) — 「排水管」の札が指す実体 */}
        <rect x={-20} y={BY - BOUT} width={PX - PW / 2 + 20 + 6} height={BOUT * 2}
          fill={C.zincDark} stroke={KRP.ink} strokeWidth={8} />
        {/* 内側の空洞 */}
        <rect x={bl} y={yS - 4} width={BORE} height={yMain - yS + 100} fill={C.stone} />
        <rect x={bl} y={yMain - BORE / 2} width={W + 20 - bl} height={BORE} fill={C.stone} />
        <rect x={-20} y={BY - BBORE} width={bl + 20} height={BBORE * 2} fill={C.stone} />
        {/* 内壁の線 (横引き管の口があく分だけ、立管の内壁を切る) */}
        <g stroke={KRP.ink} strokeWidth={5} opacity={0.85}>
          <line x1={bl} y1={yS} x2={bl} y2={BY - BBORE} />
          <line x1={bl} y1={BY + BBORE} x2={bl} y2={yMain - BORE / 2} />
          <line x1={br} y1={yS} x2={br} y2={yMain + BORE / 2} />
          <line x1={bl} y1={yMain - BORE / 2} x2={W + 20} y2={yMain - BORE / 2} />
          <line x1={br} y1={yMain + BORE / 2} x2={W + 20} y2={yMain + BORE / 2} />
          <line x1={-20} y1={BY - BBORE} x2={bl} y2={BY - BBORE} />
          <line x1={-20} y1={BY + BBORE} x2={bl} y2={BY + BBORE} />
        </g>
      </g>
      {/* ---- 継手 (フランジ) 2か所 + ボルト ---- */}
      {[300, 596].map((y) => (
        <g key={y}>
          <rect x={PX - PW / 2 - 30} y={y} width={PW + 60} height={42}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
          <line x1={PX - PW / 2 - 30} y1={y + 21} x2={PX + PW / 2 + 30} y2={y + 21}
            stroke={KRP.ink} strokeWidth={3.5} opacity={0.6} />
          <HexBolt x={PX - PW / 2 - 8} y={y + 21} r={15} fill={BP.steelDark} />
          <HexBolt x={PX + PW / 2 + 8} y={y + 21} r={15} fill={BP.steelDark} />
          <HexBolt x={PX - 56} y={y + 21} r={13} fill={BP.steelDark} />
          <HexBolt x={PX + 56} y={y + 21} r={13} fill={BP.steelDark} />
        </g>
      ))}
      {/* ---- 横引き管の継手 (「継手・ボルト」の札が指す実体)。断面なので管の口は塞がない ---- */}
      <g>
        {[
          [BY - BOUT - 28, BOUT - BBORE + 28],  // 上の側
          [BY + BBORE, BOUT - BBORE + 28],      // 下の側
        ].map(([fy0, fh]) => (
          <rect key={fy0} x={FLG} y={fy0} width={44} height={fh}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        ))}
        <HexBolt x={FLG + 22} y={BY - BOUT - 6} r={13} fill={BP.steelDark} />
        <HexBolt x={FLG + 22} y={BY - BBORE - 16} r={11} fill={BP.steelDark} />
        <HexBolt x={FLG + 22} y={BY + BBORE + 16} r={11} fill={BP.steelDark} />
        <HexBolt x={FLG + 22} y={BY + BOUT + 6} r={13} fill={BP.steelDark} />
      </g>
      {/* 横引き管の受け口 (立管との取り合い。ここも上下2枚) */}
      <g>
        {[
          [BY - BBORE - 30, 30],
          [BY + BBORE, 30],
        ].map(([ry0, rh]) => (
          <rect key={ry0} x={bl - 38} y={ry0} width={40} height={rh}
            fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        ))}
        <HexBolt x={bl - 18} y={BY - BBORE - 15} r={10} fill={BP.steelDark} />
        <HexBolt x={bl - 18} y={BY + BBORE + 15} r={10} fill={BP.steelDark} />
      </g>
      {/* 本管の継手 */}
      <g>
        <rect x={1420} y={yMain - PW / 2 - 28} width={44} height={PW + 56}
          fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <HexBolt x={1442} y={yMain - PW / 2 - 6} r={14} fill={BP.steelDark} />
        <HexBolt x={1442} y={yMain + PW / 2 + 6} r={14} fill={BP.steelDark} />
      </g>
      {/* ---- 汚れた水 (下から上へ) ---- */}
      <g>
        <rect x={bl} y={yMain - BORE / 2} width={W + 20 - bl} height={BORE}
          fill={C.mudWater} opacity={0.92} />
        <rect x={bl} y={wl} width={BORE} height={yMain - wl + BORE / 2}
          fill={C.mudWater} opacity={0.92} />
        {/* 管内の水面 */}
        <path d={`M ${bl} ${wl} Q ${PX} ${wl - 16 + Math.sin(f / 3.4) * 7} ${br} ${wl}`}
          fill="none" stroke={KRP.white} strokeWidth={6} opacity={0.6} />
        {/* 泡 */}
        {[0, 1, 2, 3, 4].map((i) => {
          const ph = (f * 9 + i * 97) % 420;
          const by = yMain - ph;
          if (by < wl + 20) return null;
          return (
            <circle key={i} cx={bl + 44 + (i * 41) % (BORE - 80)} cy={by}
              r={10 + (i % 3) * 5} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.5} />
          );
        })}
      </g>
      {/* ---- 横引き管の中を、建物の側へ押し込まれていく水 ---- */}
      <g opacity={back > 0.01 ? 1 : 0}>
        <rect x={bx} y={BY - BBORE} width={Math.max(0, bl - bx)} height={BBORE * 2}
          fill={C.mudWater} opacity={0.92} />
        {/* 水の先端 (丸くふくらんで進む) */}
        <path
          d={`M ${bx} ${BY - BBORE} Q ${bx - 34} ${BY} ${bx} ${BY + BBORE}`}
          fill={C.mudWater} stroke={KRP.ink} strokeWidth={5} opacity={0.92}
        />
        {/* 管の天井をなめる白い筋 */}
        <path
          d={`M ${bx + 20} ${BY - BBORE + 16} Q ${(bx + bl) / 2} ${BY - BBORE + 8 + Math.sin(f / 3.1) * 6} ${bl - 10} ${BY - BBORE + 16}`}
          fill="none" stroke={KRP.white} strokeWidth={5} opacity={0.5}
        />
        {/* 押し出された泡 */}
        {[0, 1, 2, 3].map((i) => {
          const px2 = bl - 40 - ((f * 7 + i * 113) % 640);
          if (px2 < bx + 30) return null;
          return (
            <circle key={i} cx={px2} cy={BY - 18 + (i % 3) * 20}
              r={8 + (i % 2) * 5} fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.5} />
          );
        })}
      </g>
      {/* 横引き管の中の、建物へ向かう逆流 */}
      <ForceArrow x={332} y={BY} len={286} rot={180} w={36}
        color={KRP.red} t={seg(f, 20, 38)} />
      {/* ---- 太い逆流矢印 (管の中を下から上へ) ---- */}
      <ForceArrow x={PX} y={yMain - 60} len={430} rot={-90} w={62}
        color={KRP.red} t={seg(f, 12, 32)} label="逆流" labelSize={46} />
      <ForceArrow x={1560} y={yMain} len={300} rot={180} w={48}
        color={KRP.red} t={seg(f, 4, 22)} />
      {/* ---- 地上の雨水桝から溢れる ---- */}
      <g opacity={easeOut(seg(f, 26, 40))}>
        <rect x={bl - 10} y={yS - 36} width={BORE + 20} height={36}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={6} />
        <g stroke={C.stone} strokeWidth={6} opacity={0.6}>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={bl + 20 + i * 48} y1={yS - 32} x2={bl + 20 + i * 48} y2={yS - 4} />
          ))}
        </g>
        <path d={`M ${bl - 30} ${yS - 36} Q ${PX} ${yS - 74} ${br + 30} ${yS - 36}`}
          fill={C.mudWater} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        <path d={`M ${bl - 120} ${yS - 30} Q ${PX} ${yS - 56} ${br + 120} ${yS - 30}`}
          fill="none" stroke={C.mudWater} strokeWidth={14} opacity={0.75} />
      </g>
      {/* ---- 札 (指し線は必ず、描いてある実体まで引く) ---- */}
      <g opacity={easeOut(seg(f, 8, 22))} stroke={KRP.ink} strokeWidth={5}>
        <line x1={262} y1={382} x2={262} y2={BY - BOUT - 6} />
        <circle cx={262} cy={BY - BOUT - 6} r={9} fill={KRP.ink} stroke="none" />
      </g>
      <TagPlate x={262} y={334} text="排水管" size={46} t={seg(f, 8, 22)} />
      <g opacity={easeOut(seg(f, 16, 30))} stroke={KRP.ink} strokeWidth={5}>
        <line x1={492} y1={670} x2={492} y2={BY + BOUT + 30} />
        <circle cx={492} cy={BY + BOUT + 30} r={9} fill={KRP.ink} stroke="none" />
      </g>
      <TagPlate x={430} y={702} text="継手・ボルト" size={30} t={seg(f, 16, 30)} />
      <TagPlate x={1660} y={564} text="下水の本管" size={34} t={seg(f, 20, 34)} />
      <TagPlate x={340} y={190} text="地表" size={36} t={seg(f, 4, 18)} />
    </Frame>
  );
};

// ===== #257 ★地下の電気室が、水に浸かりました。 =====
// 格: 山
// どこ: 地下1階の電気室。配電盤の列の正面、床の高さに寄ったカメラ
// 演出: 真っ暗な室内。非常灯の緑だけが光り、濁った水面がその緑を映す
// 動き: 水位がじわじわ上がる / 水面が波立つ / 非常灯が脈打つ / ケーブルが揺れる / カメラが寄る
const Kb6dDenkishitsuGaTsukaru: React.FC<{ f: number }> = ({ f }) => {
  const yFloor = 884;
  const wl = lerp(yFloor + 10, 648, easeOut(seg(f, 3, 38)));   // 水面
  const pulse = 0.72 + 0.28 * Math.sin(f / 5.5);
  const z = lerp(1.0, 1.04, easeOut(seg(f, 0, 42)));
  const CAB = [240, 510, 780, 1050, 1320];                      // 配電盤5面
  const CW = 240;
  const yCT = 214;                                              // 盤の上端
  const wave = (y: number, amp: number) => {
    let d = `M -40 ${y}`;
    for (let i = 0; i <= 20; i++) {
      const x = -40 + (i * (W + 80)) / 20;
      d += ` L ${x.toFixed(1)} ${(y + Math.sin(i * 0.9 + f / 4) * amp).toFixed(1)}`;
    }
    return d;
  };
  return (
    <Frame f={f} seed={890} bg={C.dark} dark>
      <g transform={zoomAt(z, 900, 620)}>
        {/* 奥の壁と天井スラブ */}
        <rect x={0} y={0} width={W} height={H} fill={C.dark} />
        <rect x={0} y={0} width={W} height={96} fill={C.panelDark} stroke={KRP.ink} strokeWidth={7} />
        <g stroke={KRP.ink} strokeWidth={5} opacity={0.5}>
          {[300, 660, 1020, 1380, 1740].map((bx) => (
            <rect key={bx} x={bx - 46} y={58} width={92} height={42} fill={C.panelDark} />
          ))}
        </g>
        {/* 壁の目地 */}
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.26}>
          {[190, 330, 470, 610, 750].map((y) => <line key={y} x1={0} y1={y} x2={W} y2={y} />)}
        </g>
        {/* 奥の鉄扉 (左端) */}
        <rect x={-10} y={250} width={196} height={yFloor - 250}
          fill={C.panelDark} stroke={KRP.ink} strokeWidth={7} />
        <rect x={16} y={280} width={150} height={120} fill={C.panel}
          stroke={KRP.ink} strokeWidth={4.5} />
        <circle cx={160} cy={560} r={16} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
        <Rivets x1={6} y1={262} x2={176} y2={262} n={6} r={6} fill={BP.ironDark} />
        {/* ---- ケーブルラック ---- */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={260 + i * 280} y1={96} x2={260 + i * 280} y2={142}
            stroke={BP.steelDark} strokeWidth={10} />
        ))}
        <rect x={210} y={138} width={1510} height={20} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={5} />
        <g stroke={BP.steelDark} strokeWidth={6} opacity={0.9}>
          {Array.from({ length: 25 }, (_, i) => (
            <line key={i} x1={226 + i * 60} y1={138} x2={226 + i * 60} y2={178} />
          ))}
        </g>
        <rect x={210} y={174} width={1510} height={16} fill={BP.steelDark}
          stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={226} y1={148} x2={1704} y2={148} n={14} r={5} fill={BP.ironDark} />
        {/* ラックの上を走るケーブル3条 */}
        {[0, 1, 2].map((i) => {
          const sw = Math.sin(f / 13 + i) * 4;
          return (
            <path key={i}
              d={`M 210 ${126 - i * 11} Q 960 ${110 - i * 11 + sw} 1720 ${126 - i * 11}`}
              fill="none" stroke={i === 1 ? BP.grease : BP.ironDark}
              strokeWidth={17 - i * 2} strokeLinecap="round" />
          );
        })}
        {/* 盤へ降りるケーブル */}
        {CAB.map((x, i) => {
          const sw = Math.sin(f / 11 + i * 1.3) * 5;
          return (
            <path key={x}
              d={`M ${x + CW * 0.5} 190 C ${x + CW * 0.5 + sw} 206, ${x + CW * 0.2} 198, ${x + CW * 0.28} ${yCT}`}
              fill="none" stroke={BP.ironDark} strokeWidth={15} strokeLinecap="round" />
          );
        })}
        {/* ---- 配電盤の列 ---- */}
        {CAB.map((x, i) => (
          <g key={x}>
            {/* 箱 */}
            <rect x={x} y={yCT} width={CW} height={yFloor - yCT}
              fill={C.panel} stroke={KRP.ink} strokeWidth={6} />
            {/* 天板の縁 */}
            <rect x={x - 8} y={yCT - 14} width={CW + 16} height={18}
              fill={C.panelDark} stroke={KRP.ink} strokeWidth={4.5} />
            {/* 扉の合わせ目 */}
            <line x1={x + CW / 2} y1={yCT + 10} x2={x + CW / 2} y2={yFloor - 10}
              stroke={KRP.ink} strokeWidth={3.5} opacity={0.7} />
            {/* ルーバー (放熱スリット) */}
            <g stroke={C.panelDark} strokeWidth={6}>
              {Array.from({ length: 7 }, (_, k) => (
                <line key={k} x1={x + 22} y1={yCT + 128 + k * 17} x2={x + CW - 22} y2={yCT + 128 + k * 17} />
              ))}
            </g>
            {/* 計器2つ — 針はどれも左いっぱいの 0 に落ちて、わずかに震えているだけ */}
            {[0, 1].map((k) => {
              const gx = x + 58 + k * 120, gy = yCT + 58, R = 33;
              const A0 = 210;                                 // 目盛の左端 = 0
              const A1 = -30;                                 // 目盛の右端
              const rad = (a: number) => (a * Math.PI) / 180;
              const px = (a: number, r: number) => gx + Math.cos(rad(a)) * r;
              const py = (a: number, r: number) => gy - Math.sin(rad(a)) * r;
              // 死んだ針は 0 の止めピンに当たって、そこで小さく震える
              const A = A0 - Math.sin(f / 2.6 + i * 1.7 + k * 0.9) * 2.4;
              return (
                <g key={k}>
                  <circle cx={gx} cy={gy} r={R}
                    fill={C.stone} stroke={KRP.ink} strokeWidth={4.5} opacity={0.62} />
                  {/* 目盛の弧 */}
                  <path
                    d={`M ${px(A0, R - 7).toFixed(1)} ${py(A0, R - 7).toFixed(1)} A ${R - 7} ${R - 7} 0 0 1 ${px(A1, R - 7).toFixed(1)} ${py(A1, R - 7).toFixed(1)}`}
                    fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.65}
                  />
                  {/* 目盛 */}
                  <g stroke={KRP.ink} strokeWidth={3} opacity={0.75}>
                    {[0, 1, 2, 3, 4, 5, 6].map((t) => {
                      const a = A0 - t * 40;
                      return (
                        <line key={t}
                          x1={px(a, R - 11).toFixed(1)} y1={py(a, R - 11).toFixed(1)}
                          x2={px(a, R - 3).toFixed(1)} y2={py(a, R - 3).toFixed(1)}
                          strokeWidth={t % 3 === 0 ? 4.5 : 2.5} />
                      );
                    })}
                  </g>
                  {/* 0 の止めピン (赤)。針がここに当たって止まっている */}
                  <line
                    x1={px(A0, R - 14).toFixed(1)} y1={py(A0, R - 14).toFixed(1)}
                    x2={px(A0, R + 5).toFixed(1)} y2={py(A0, R + 5).toFixed(1)}
                    stroke={KRP.red} strokeWidth={7} strokeLinecap="round"
                  />
                  {/* 針 */}
                  <line x1={px(A + 180, 7).toFixed(1)} y1={py(A + 180, 7).toFixed(1)}
                    x2={px(A, R - 7).toFixed(1)} y2={py(A, R - 7).toFixed(1)}
                    stroke={KRP.red} strokeWidth={5.5} strokeLinecap="round" />
                  <circle cx={gx} cy={gy} r={6} fill={KRP.ink} />
                </g>
              );
            })}
            {/* 表示灯 (消えている) */}
            <g>
              {[0, 1, 2].map((k) => (
                <circle key={k} cx={x + 42 + k * 34} cy={yCT + 100} r={10}
                  fill={C.panelDark} stroke={KRP.ink} strokeWidth={3} />
              ))}
            </g>
            {/* 把手 */}
            <rect x={x + CW / 2 - 34} y={yCT + 250} width={24} height={62} rx={10}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
            <rect x={x + CW / 2 + 10} y={yCT + 250} width={24} height={62} rx={10}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
            {/* 銘板 (真鍮) */}
            <rect x={x + 56} y={yCT + 196} width={128} height={38} rx={4}
              fill={BP.brassDark} stroke={KRP.ink} strokeWidth={3.5} />
            <text x={x + 120} y={yCT + 224} textAnchor="middle" fontFamily={FONT}
              fontWeight={900} fontSize={25} fill={C.stone} opacity={0.8}>
              {`No.${i + 1}`}
            </text>
            <HexBolt x={x + 62} y={yCT + 215} r={6} fill={BP.brass} />
            <HexBolt x={x + 178} y={yCT + 215} r={6} fill={BP.brass} />
            {/* 下段の扉 (ここが水に浸かる) */}
            <line x1={x + 10} y1={yCT + 346} x2={x + CW - 10} y2={yCT + 346}
              stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
            <g stroke={C.panelDark} strokeWidth={6}>
              {Array.from({ length: 6 }, (_, k) => (
                <line key={k} x1={x + 26} y1={yCT + 400 + k * 17} x2={x + CW - 26} y2={yCT + 400 + k * 17} />
              ))}
            </g>
            <rect x={x + 70} y={yCT + 520} width={100} height={30} rx={4}
              fill={BP.brassDark} stroke={KRP.ink} strokeWidth={3} />
            <rect x={x + CW / 2 - 12} y={yCT + 572} width={24} height={54} rx={9}
              fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
            {/* 基礎チャンネル */}
            <rect x={x - 4} y={yFloor - 22} width={CW + 8} height={24}
              fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 床 */}
        <line x1={0} y1={yFloor} x2={W} y2={yFloor} stroke={KRP.ink} strokeWidth={8} />
        {/* ---- 非常灯 (緑。これだけが光る) ---- */}
        <g>
          <polygon points={`1700,286 1920,186 1920,884 1620,884`}
            fill={C.emerGreen} opacity={0.17 * pulse} />
          <polygon points={`1700,286 1420,400 1500,884 1680,884`}
            fill={C.emerGreen} opacity={0.11 * pulse} />
          <rect x={1636} y={242} width={128} height={56} rx={6}
            fill={C.panelDark} stroke={KRP.ink} strokeWidth={5} />
          <rect x={1648} y={252} width={104} height={36} rx={4}
            fill={C.emerGreen} stroke={KRP.ink} strokeWidth={3.5} opacity={pulse} />
          <circle cx={1700} cy={270} r={58} fill={C.emerGreen} opacity={0.3 * pulse} />
          <circle cx={1700} cy={270} r={108} fill={C.emerGreen} opacity={0.14 * pulse} />
          <line x1={1700} y1={242} x2={1700} y2={190} stroke={BP.steelDark} strokeWidth={8} />
        </g>
        {/* 盤の縁に当たる緑の照り返し */}
        <g stroke={C.emerGreen} strokeWidth={5} opacity={0.5 * pulse} strokeLinecap="round">
          {CAB.map((x) => <line key={x} x1={x + CW} y1={yCT + 6} x2={x + CW} y2={yFloor - 20} />)}
        </g>
        {/* ---- 濁った水 ---- */}
        <g>
          <rect x={-40} y={wl} width={W + 80} height={H - wl + 40}
            fill={C.mudWater} opacity={0.72} />
          {/* 水面の波 */}
          <path d={wave(wl, 7)} fill="none" stroke={C.emerGreen} strokeWidth={6}
            opacity={0.85 * pulse} />
          <path d={wave(wl + 18, 5)} fill="none" stroke={C.stone} strokeWidth={4} opacity={0.4} />
          <path d={wave(wl + 96, 6)} fill="none" stroke={C.stone} strokeWidth={3.5} opacity={0.22} />
          <path d={wave(wl + 210, 7)} fill="none" stroke={C.stone} strokeWidth={3.5} opacity={0.16} />
          {/* 緑の映り込み */}
          <g stroke={C.emerGreen} strokeWidth={16} opacity={0.34 * pulse} strokeLinecap="round">
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={1700 - i * 14} y1={wl + 12 + i * 8}
                x2={1700 - i * 20 + Math.sin(f / 6 + i) * 12} y2={wl + 86 + i * 62} />
            ))}
          </g>
          {/* 浮いているごみ */}
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={300 + i * 350 + Math.sin(f / 9 + i * 2) * 16}
              cy={wl + 30 + ((i * 47) % 150)} rx={46 - (i % 3) * 9} ry={10}
              fill={BP.woodDark} stroke={KRP.ink} strokeWidth={3} opacity={0.75} />
          ))}
        </g>
        {/* 水に浸かった部分を暗く沈める */}
        <rect x={-40} y={wl} width={W + 80} height={H - wl + 40} fill={C.dark} opacity={0.14} />
      </g>
      {/* ---- 札 (左上のタイトル帯と同じ段に置かない。上端を y=160 より下げる) ---- */}
      <TagPlate x={760} y={206} text="地下1階 電気室" size={40} t={seg(f, 6, 20)} />
      {/* 計器の針が0に落ちていることを言う札。指し線は右端の盤の計器まで */}
      <g opacity={easeOut(seg(f, 24, 38))} stroke={KRP.red} strokeWidth={5}>
        <line x1={1466} y1={220} x2={1522} y2={256} />
        <circle cx={1522} cy={256} r={8} fill={KRP.red} stroke="none" />
      </g>
      <TagPlate x={1450} y={186} text="針はぜんぶ0" size={30} t={seg(f, 24, 38)} color={KRP.red} />
      <TagPlate x={1746} y={370} text="非常灯" size={34} t={seg(f, 16, 30)} color={C.emerGreen} />
      <TagPlate x={160} y={330} text="配電盤" size={36} t={seg(f, 22, 34)} />
      <TagPlate x={160} y={500} text="濁った水" size={36} t={seg(f, 28, 40)} color={KRP.red} />
      <Arrow x={160} y={648} s={0.85} rot={90} t={seg(f, 32, 42)} color={KRP.red} />
    </Frame>
  );
};

// ===== #258 停電したのは、24階まででした。 =====
// 格: 図
// どこ: 47階建ての断面図。クリーム地・方眼
// 演出: 24階までが夜の色に沈み、その上は灯ったまま。暗い階からは懐中電灯の光が漏れる
// 動き: 下24階が暗転 / 懐中電灯の光が揺れる / 境目の赤線が左から伸びる / 札が出る
const Kb6dN24KaiMade: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} seed={891} bg={KRP.cream}>
    <GridPaper />
    <Kb6dBldgSection f={f} night />
    {/* 下24階 = 停電 / 上 = 点灯 の区分 */}
    <g opacity={easeOut(seg(f, 14, 30))}>
      <line x1={470} y1={SEC_BORDER} x2={470} y2={SEC.yG} stroke={KRP.ink}
        strokeWidth={6} strokeLinecap="round" />
      <line x1={450} y1={SEC_BORDER} x2={490} y2={SEC_BORDER} stroke={KRP.ink} strokeWidth={6} />
      <line x1={450} y1={SEC.yG} x2={490} y2={SEC.yG} stroke={KRP.ink} strokeWidth={6} />
      <line x1={470} y1={SEC.yTop} x2={470} y2={SEC_BORDER} stroke={KRP.ink}
        strokeWidth={6} strokeDasharray="18 16" opacity={0.6} />
      <line x1={450} y1={SEC.yTop} x2={490} y2={SEC.yTop} stroke={KRP.ink} strokeWidth={6} />
    </g>
    <TagPlate x={282} y={556} text="停電" size={50} t={seg(f, 18, 32)} color={KRP.red} />
    <TagPlate x={282} y={262} text="点灯" size={50} t={seg(f, 26, 40)} color={KRP.green} />
    <TagPlate x={282} y={660} text="1〜24階" size={32} t={seg(f, 24, 38)} />
    <TagPlate x={282} y={352} text="25〜47階" size={32} t={seg(f, 30, 42)} />
    {/* 暗い階から漏れている光の正体 */}
    <g opacity={easeOut(seg(f, 30, 42))} stroke={KRP.ink} strokeWidth={4}>
      <line x1={378} y1={456} x2={424} y2={478} />
      <circle cx={424} cy={478} r={7} fill={KRP.ink} stroke="none" />
    </g>
    <TagPlate x={288} y={452} text="懐中電灯" size={26} t={seg(f, 30, 42)} />
  </Frame>
);

// ---- #259 の共用廊下 (一点透視)。消点と近景の寸法 ----
const CVX = 960, CVY = 496;        // 消点
const C_HW = 980;                  // 近景での廊下の半幅
const C_FL = 1062;                 // 近景の床
const C_CE = -46;                  // 近景の天井
const C_DT = 272;                  // 近景での扉の上端
/** 奥行き段。k が小さいほど奥 */
const CK = [1, 0.667, 0.5, 0.4, 0.333, 0.286, 0.25];
const cpx = (lx: number, k: number) => CVX + lx * k;
const cpy = (ly: number, k: number) => CVY + (ly - CVY) * k;

/** 各戸の前に出された、空のバケツ */
const Kb6dBucket: React.FC<{ x: number; y: number; s?: number; tilt?: number }> = ({
  x, y, s = 1, tilt = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
    {/* 胴 (下へすぼまる) */}
    <path d="M -46 -98 L 46 -98 L 34 0 L -34 0 Z"
      fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
    {/* 胴のつや */}
    <path d="M -24 -94 L -16 -4" stroke={KRP.white} strokeWidth={6} opacity={0.3} fill="none" />
    {/* 縁 */}
    <rect x={-53} y={-112} width={106} height={17} rx={8}
      fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
    {/* 中は空っぽ (底が見えている) */}
    <ellipse cx={0} cy={-100} rx={44} ry={13} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} />
    <ellipse cx={0} cy={-96} rx={26} ry={7} fill={BP.steelDark} opacity={0.8} />
    {/* 提げ手 */}
    <path d="M -47 -108 Q 0 -180 47 -108" fill="none" stroke={KRP.ink} strokeWidth={7} />
    <circle cx={-47} cy={-106} r={7} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3} />
    <circle cx={47} cy={-106} r={7} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={3} />
  </g>
);

// ===== #259 ところが、断水したのは全戸です。 =====
// 格: 山
// どこ: 47階の共用廊下。床の高さに構えた一点透視。#258 の断面とはカメラがまったく違う
// 演出: 灯りはついている (電気はある)。両側の玄関扉の前に、空のバケツが1戸ずつ並ぶ
// 動き: カメラが奥へ寄る / 天井灯が明滅 / 人がバケツを提げて歩く / 奥の窓の外は雨
const Kb6dDansuiWaZenko: React.FC<{ f: number }> = ({ f }) => {
  const z = lerp(1.0, 1.055, easeOut(seg(f, 0, 42)));
  const kEnd = CK[CK.length - 1];
  // 近景・奥の床の端
  const flNearL = [cpx(-C_HW, 1), cpy(C_FL, 1)] as const;
  const flNearR = [cpx(C_HW, 1), cpy(C_FL, 1)] as const;
  const flFarL = [cpx(-C_HW, kEnd), cpy(C_FL, kEnd)] as const;
  const flFarR = [cpx(C_HW, kEnd), cpy(C_FL, kEnd)] as const;
  const ceNearL = [cpx(-C_HW, 1), cpy(C_CE, 1)] as const;
  const ceNearR = [cpx(C_HW, 1), cpy(C_CE, 1)] as const;
  const ceFarL = [cpx(-C_HW, kEnd), cpy(C_CE, kEnd)] as const;
  const ceFarR = [cpx(C_HW, kEnd), cpy(C_CE, kEnd)] as const;
  // 歩いている人の進み (奥から手前へ)
  const walk = easeOut(seg(f, 4, 40));
  const bob = Math.abs(Math.sin(f / 5.5)) * 7;
  return (
    <Frame f={f} seed={892} bg={C.corridorWall}>
      <defs>
        <clipPath id="kb6dCorrWin">
          <rect x={826} y={398} width={268} height={116} />
        </clipPath>
      </defs>
      <g transform={zoomAt(z, CVX, CVY)}>
        {/* ---- 箱 (天井・床・両側の壁) ---- */}
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={C.corridorWall} />
        <polygon
          points={`${ceNearL} ${ceNearR} ${ceFarR} ${ceFarL}`}
          fill={C.corridorWall} stroke={KRP.ink} strokeWidth={6}
        />
        <polygon
          points={`${ceNearL} ${ceNearR} ${ceFarR} ${ceFarL}`}
          fill={KRP.white} opacity={0.3}
        />
        <polygon
          points={`${flNearL} ${flNearR} ${flFarR} ${flFarL}`}
          fill={C.corridorFloor} stroke={KRP.ink} strokeWidth={6}
        />
        <polygon
          points={`${ceNearL} ${flNearL} ${flFarL} ${ceFarL}`}
          fill={C.corridorWall} stroke={KRP.ink} strokeWidth={6}
        />
        <polygon
          points={`${ceNearR} ${flNearR} ${flFarR} ${ceFarR}`}
          fill={C.corridorWall} stroke={KRP.ink} strokeWidth={6}
        />
        {/* 壁の影 (両側を少し落として、まんなかの通路を明るく見せる) */}
        <polygon points={`${ceNearL} ${flNearL} ${flFarL} ${ceFarL}`}
          fill={C.nightDeep} opacity={0.1} />
        <polygon points={`${ceNearR} ${flNearR} ${flFarR} ${ceFarR}`}
          fill={C.nightDeep} opacity={0.16} />
        {/* ---- 床のタイル目地 ---- */}
        <g stroke={KRP.ink} strokeWidth={3} opacity={0.3}>
          {/* 奥へ走る目地 */}
          {[-700, -420, -140, 140, 420, 700].map((lx) => (
            <line key={lx} x1={cpx(lx, 1)} y1={cpy(C_FL, 1)}
              x2={cpx(lx, kEnd)} y2={cpy(C_FL, kEnd)} />
          ))}
          {/* 横の目地 */}
          {[1, 0.82, 0.667, 0.56, 0.5, 0.44, 0.4, 0.365, 0.333, 0.306, 0.286, 0.266, 0.25].map((k) => (
            <line key={k} x1={cpx(-C_HW, k)} y1={cpy(C_FL, k)}
              x2={cpx(C_HW, k)} y2={cpy(C_FL, k)} />
          ))}
        </g>
        {/* ---- 腰の高さの手すり兼モール (両側の壁) ---- */}
        {[-1, 1].map((d) => (
          <g key={d}>
            <line x1={cpx(d * C_HW, 1)} y1={cpy(C_FL - 118, 1)}
              x2={cpx(d * C_HW, kEnd)} y2={cpy(C_FL - 118, kEnd)}
              stroke={C.doorFaceDark} strokeWidth={10} />
            <line x1={cpx(d * C_HW, 1)} y1={cpy(C_FL - 20, 1)}
              x2={cpx(d * C_HW, kEnd)} y2={cpy(C_FL - 20, kEnd)}
              stroke={KRP.ink} strokeWidth={5} opacity={0.5} />
          </g>
        ))}
        {/* ---- 玄関扉 (左右の壁に5戸ずつ) ---- */}
        {[-1, 1].flatMap((d) =>
          [0, 1, 2, 3, 4].map((j) => {
            const ka = lerp(CK[j], CK[j + 1], 0.1);
            const kb = lerp(CK[j], CK[j + 1], 0.9);
            const xa = cpx(d * C_HW, ka), xb = cpx(d * C_HW, kb);
            const ya0 = cpy(C_FL, ka), ya1 = cpy(C_DT, ka);
            const yb0 = cpy(C_FL, kb), yb1 = cpy(C_DT, kb);
            const near = j <= 2;
            // 扉の面。奥側の縁 (xb) が蝶番、手前側 (xa) が把手の側
            return (
              <g key={`${d}-${j}`}>
                {/* 枠 */}
                <polygon
                  points={`${xa} ${ya0} ${xa} ${ya1 - 14 * ka} ${xb} ${yb1 - 14 * kb} ${xb} ${yb0}`}
                  fill={C.doorFaceDark} stroke={KRP.ink} strokeWidth={5}
                />
                {/* 扉 */}
                <polygon
                  points={`${xa} ${ya0 - 6 * ka} ${xa} ${ya1} ${xb} ${yb1} ${xb} ${yb0 - 6 * kb}`}
                  fill={C.doorFace} stroke={KRP.ink} strokeWidth={5}
                />
                {/* 木目 */}
                <g stroke={C.doorFaceDark} strokeWidth={4} opacity={0.6}>
                  {[0.3, 0.55, 0.78].map((u) => {
                    const kk = lerp(ka, kb, u);
                    const xx = cpx(d * C_HW, kk);
                    return (
                      <line key={u} x1={xx} y1={cpy(C_DT + 30, kk)}
                        x2={xx} y2={cpy(C_FL - 30, kk)} />
                    );
                  })}
                </g>
                {near && (
                  <g>
                    {/* 把手 (手前側の縁のそば) */}
                    {(() => {
                      const kk = lerp(ka, kb, 0.16);
                      const xx = cpx(d * C_HW, kk);
                      return (
                        <rect x={xx - 7 * kk} y={cpy(C_FL - 420, kk)}
                          width={14 * kk + 7} height={118 * kk} rx={7 * kk}
                          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4} />
                      );
                    })()}
                    {/* 表札 */}
                    {(() => {
                      const kk = lerp(ka, kb, 0.62);
                      const xx = cpx(d * C_HW, kk);
                      return (
                        <g>
                          <rect x={xx - 46 * kk} y={cpy(C_DT + 54, kk)}
                            width={92 * kk} height={54 * kk} rx={5}
                            fill={KRP.white} stroke={KRP.ink} strokeWidth={4} />
                          <line x1={xx - 30 * kk} y1={cpy(C_DT + 90, kk)}
                            x2={xx + 30 * kk} y2={cpy(C_DT + 90, kk)}
                            stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
                        </g>
                      );
                    })()}
                    {/* 玄関灯 (灯っている = 電気はある) */}
                    {(() => {
                      const kk = lerp(ka, kb, 0.86);
                      const xx = cpx(d * C_HW, kk);
                      const yy = cpy(C_DT - 56, kk);
                      const fk = 0.86 + 0.14 * Math.sin(f / 7 + j);
                      return (
                        <g>
                          <circle cx={xx} cy={yy} r={78 * kk} fill={BP.lamp} opacity={0.2 * fk} />
                          <rect x={xx - 26 * kk} y={yy - 20 * kk}
                            width={52 * kk} height={40 * kk} rx={6}
                            fill={BP.lampGlow} stroke={KRP.ink} strokeWidth={4} opacity={fk} />
                        </g>
                      );
                    })()}
                    {/* メーターボックスの扉 (ここが止まっている) */}
                    {(() => {
                      const kk = lerp(ka, kb, 0.38);
                      const xx = cpx(d * C_HW, kk);
                      const yy = cpy(C_FL - 300, kk);
                      return (
                        <g>
                          <rect x={xx - 34 * kk} y={yy - 44 * kk}
                            width={68 * kk} height={88 * kk} rx={4}
                            fill={C.zinc} stroke={KRP.ink} strokeWidth={4} />
                          <g stroke={KRP.red} strokeWidth={6 * kk + 2} strokeLinecap="round"
                            opacity={clamp01(seg(f, 14 + j * 3, 26 + j * 3))}>
                            <line x1={xx - 22 * kk} y1={yy - 30 * kk}
                              x2={xx + 22 * kk} y2={yy + 30 * kk} />
                            <line x1={xx + 22 * kk} y1={yy - 30 * kk}
                              x2={xx - 22 * kk} y2={yy + 30 * kk} />
                          </g>
                        </g>
                      );
                    })()}
                  </g>
                )}
              </g>
            );
          }),
        )}
        {/* ---- 天井の灯り (奥へ連なる。電気は通っている) ---- */}
        {[1, 0.667, 0.5, 0.4, 0.333, 0.286].map((k, i) => {
          const fk = 0.84 + 0.16 * Math.sin(f / 6.5 + i * 1.4);
          const y = cpy(C_CE + 56, k);
          return (
            <g key={k}>
              <ellipse cx={CVX} cy={y} rx={230 * k} ry={76 * k}
                fill={BP.lamp} opacity={0.17 * fk} />
              <rect x={CVX - 112 * k} y={y - 15 * k} width={224 * k} height={30 * k} rx={8}
                fill={BP.lampGlow} stroke={KRP.ink} strokeWidth={5} opacity={fk} />
              <rect x={CVX - 112 * k} y={y - 15 * k} width={224 * k} height={30 * k} rx={8}
                fill="none" stroke={KRP.white} strokeWidth={4} opacity={0.5 * fk} />
            </g>
          );
        })}
        {/* 床に落ちた灯りの帯 */}
        <g opacity={0.3}>
          {[1, 0.667, 0.5, 0.4].map((k) => (
            <ellipse key={k} cx={CVX} cy={cpy(C_FL - 6, k)} rx={300 * k} ry={48 * k}
              fill={BP.lamp} />
          ))}
        </g>
        {/* ---- 廊下のつきあたり。窓の外は雨 ---- */}
        <rect x={cpx(-C_HW, kEnd)} y={cpy(C_CE, kEnd)}
          width={cpx(C_HW, kEnd) - cpx(-C_HW, kEnd)}
          height={cpy(C_FL, kEnd) - cpy(C_CE, kEnd)}
          fill={C.corridorWall} stroke={KRP.ink} strokeWidth={6} />
        <rect x={cpx(-C_HW, kEnd)} y={cpy(C_CE, kEnd)}
          width={cpx(C_HW, kEnd) - cpx(-C_HW, kEnd)}
          height={cpy(C_FL, kEnd) - cpy(C_CE, kEnd)}
          fill={C.nightDeep} opacity={0.08} />
        <rect x={812} y={384} width={296} height={144} rx={4}
          fill={C.rain} stroke={KRP.ink} strokeWidth={7} />
        <g clipPath="url(#kb6dCorrWin)">
          <rect x={826} y={398} width={268} height={116} fill={C.rain} />
          <rect x={826} y={398} width={268} height={48} fill={C.nightDeep} opacity={0.3} />
          <Kb6dRain f={f} n={22} slant={0.5} len={52} w={3} seed={47} speed={26}
            opacity={0.55} color={KRP.white} x0={818} x1={1104} y0={392} y1={520} />
        </g>
        <line x1={960} y1={384} x2={960} y2={528} stroke={KRP.ink} strokeWidth={6} />
        <line x1={812} y1={456} x2={1108} y2={456} stroke={KRP.ink} strokeWidth={6} />
        {/* 非常口の表示 (緑。奥のつきあたり) */}
        <rect x={1118} y={392} width={62} height={34} rx={4}
          fill={C.emerGreen} stroke={KRP.ink} strokeWidth={4} />
        <rect x={1128} y={400} width={16} height={18} rx={3} fill={KRP.white} opacity={0.85} />
        {/* ---- 各戸の前に出された空のバケツ (奥へ並ぶ = 全戸) ---- */}
        {[-1, 1].flatMap((d) =>
          [0, 1, 2, 3, 4].map((j) => {
            const kk = lerp(CK[j], CK[j + 1], 0.52);
            const bxp = cpx(d * (C_HW - 150), kk);
            const byp = cpy(C_FL, kk);
            return (
              <Kb6dBucket key={`b${d}-${j}`} x={bxp} y={byp} s={kk * 0.92}
                tilt={d > 0 ? -4 + j : 4 - j} />
            );
          }),
        )}
        {/* ---- 人 3人 ---- */}
        {/* 奥から歩いてくる人 (遠景) */}
        <Person x={lerp(1060, 1128, walk)} y={lerp(690, 742, walk)}
          s={lerp(0.42, 0.56, walk)} cloth={C.rainDeep} clothDark={C.nightDeep}
          f={f} phase={2} face="worried" gaze={[0, 1]} />
        {/* 中景、左の扉の前でバケツを置いた人 */}
        <Person x={520} y={880} s={0.95} cloth={C.night} clothDark={C.nightDeep}
          f={f} phase={1} face="worried" gaze={[0.6, 0.4]} />
        <Kb6dBucket x={672} y={892} s={0.62} tilt={-5} />
        {/* 手前、バケツを提げて立っている人 */}
        <g>
          <Person x={1545} y={1010} s={1.3} cloth={C.rainDeep} clothDark={C.nightDeep}
            f={f} phase={0} face="worried" gaze={[-0.5, 0.2]} />
          {/* 提げている腕 + 手 + バケツ。肩を軸にゆっくり揺れる */}
          <g transform={`rotate(${(bob - 3.5) * 0.4} 1460 812)`}>
            <path d="M 1460 812 Q 1424 872 1428 948" fill="none"
              stroke={KRP.ink} strokeWidth={42} strokeLinecap="round" />
            <path d="M 1460 812 Q 1424 872 1428 948" fill="none"
              stroke={C.rainDeep} strokeWidth={31} strokeLinecap="round" />
            <circle cx={1428} cy={952} r={20} fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
            <Kb6dBucket x={1428} y={1064} s={0.62} tilt={2} />
          </g>
        </g>
      </g>
      {/* ---- 札 ---- */}
      <TagPlate x={300} y={206} text="47階 共用廊下" size={40} t={seg(f, 4, 18)} />
      <g opacity={easeOut(seg(f, 8, 22))} stroke={KRP.ink} strokeWidth={4}>
        <line x1={834} y1={250} x2={902} y2={190} />
        <circle cx={902} cy={190} r={7} fill={KRP.ink} stroke="none" />
      </g>
      <TagPlate x={694} y={258} text="灯りはついている" size={26} t={seg(f, 8, 22)} />
      <TagPlate x={1660} y={232} text="断水" size={56} t={seg(f, 14, 28)} color={KRP.red} />
      <TagPlate x={1640} y={334} text="全 643戸" size={36} t={seg(f, 20, 34)} color={KRP.red} />
      <TagPlate x={1650} y={420} text="どの階も" size={30} t={seg(f, 26, 38)} />
      <g opacity={easeOut(seg(f, 30, 42))} stroke={KRP.ink} strokeWidth={4}>
        <line x1={318} y1={456} x2={388} y2={534} />
        <circle cx={388} cy={534} r={7} fill={KRP.ink} stroke="none" />
      </g>
      <TagPlate x={248} y={422} text="空のバケツ" size={30} t={seg(f, 30, 42)} />
    </Frame>
  );
};

// ===== #260 電気が通っている階でも、水は出ませんでした。 =====
// 格: 並
// どこ: 25階より上の一室。台所の流しの前。灯りはついている
// 演出: 明るい室内。描くのは「乾いた水栓」だけ。灯りが点いていることが唯一の情報
// 動き: ハンドルがひねられる / 最後の一滴が落ちて止まる / ×が出る / 人が見つめる / 窓の外は雨
const Kb6dDenkiAtteMo: React.FC<{ f: number }> = ({ f }) => {
  const yC = 616;                                   // 天板
  const turn = easeOut(seg(f, 6, 22));              // ハンドルをひねる
  const dropT = seg(f, 14, 26);                     // 最後の一滴
  const dropY = lerp(474, 592, dropT);
  const lamp = 0.9 + 0.1 * Math.sin(f / 9);
  return (
    <Frame f={f} seed={893} bg={C.wall}>
      <rect x={0} y={0} width={W} height={H} fill={C.wall} />
      {/* ---- 壁と腰壁のタイル ---- */}
      <rect x={0} y={300} width={W} height={yC - 300} fill={C.tile} />
      <g stroke={KRP.ink} strokeWidth={2.5} opacity={0.26}>
        {Array.from({ length: 5 }, (_, r0) => (
          <line key={`h${r0}`} x1={0} y1={300 + r0 * 64} x2={W} y2={300 + r0 * 64} />
        ))}
        {Array.from({ length: 31 }, (_, c) => (
          <line key={`v${c}`} x1={c * 64} y1={300} x2={c * 64} y2={yC} />
        ))}
      </g>
      <line x1={0} y1={300} x2={W} y2={300} stroke={KRP.ink} strokeWidth={6} opacity={0.6} />
      {/* ---- 窓 (外は雨。明るい) ---- */}
      <defs>
        <clipPath id="kb6dWin">
          <rect x={1492} y={116} width={352} height={172} />
        </clipPath>
      </defs>
      <rect x={1476} y={100} width={384} height={204} rx={6}
        fill={C.skyPale} stroke={KRP.ink} strokeWidth={8} />
      <g clipPath="url(#kb6dWin)">
        <rect x={1492} y={116} width={352} height={172} fill={C.skyPale} />
        <rect x={1492} y={116} width={352} height={70} fill={C.rain} opacity={0.4} />
        <Kb6dRain f={f} n={26} slant={0.45} len={70} w={3} seed={31} speed={30}
          opacity={0.55} color={C.rain} x0={1480} x1={1860} y0={110} y1={290} />
      </g>
      <line x1={1668} y1={100} x2={1668} y2={304} stroke={KRP.ink} strokeWidth={7} />
      <line x1={1476} y1={202} x2={1860} y2={202} stroke={KRP.ink} strokeWidth={7} />
      {/* ---- 天井の灯り (電気は通っている) ---- */}
      <line x1={700} y1={0} x2={700} y2={96} stroke={BP.ironDark} strokeWidth={9} />
      <path d="M 596 184 L 700 96 L 804 184 Z" fill={C.zinc}
        stroke={KRP.ink} strokeWidth={7} />
      <ellipse cx={700} cy={186} rx={106} ry={22} fill={BP.lampGlow}
        stroke={KRP.ink} strokeWidth={6} opacity={lamp} />
      <circle cx={700} cy={190} r={150} fill={BP.lamp} opacity={0.2 * lamp} />
      <circle cx={700} cy={190} r={260} fill={BP.lamp} opacity={0.1 * lamp} />
      <g stroke={BP.lamp} strokeWidth={8} opacity={0.6 * lamp} strokeLinecap="round">
        {[-62, -30, 0, 30, 62].map((d) => (
          <line key={d} x1={700 + d * 1.6} y1={214} x2={700 + d * 2.2} y2={258} />
        ))}
      </g>
      {/* ---- 床 ---- */}
      <rect x={0} y={846} width={W} height={H - 846} fill={KRP.floor} />
      <line x1={0} y1={846} x2={W} y2={846} stroke={KRP.ink} strokeWidth={7} opacity={0.6} />
      {/* ---- 天板 (上面が見える角度) とキャビネット ---- */}
      {/* 天板は 280〜1100。右の余白は、人を蛇口のそばに大きく立たせるために空けている */}
      <rect x={280} y={yC} width={820} height={120} fill={C.stone}
        stroke={KRP.ink} strokeWidth={8} />
      <rect x={280} y={yC + 120} width={820} height={28} fill={C.stoneDark}
        stroke={KRP.ink} strokeWidth={8} />
      <rect x={280} y={yC + 148} width={820} height={H - yC - 148}
        fill={BP.woodLight} stroke={KRP.ink} strokeWidth={8} />
      {/* 戸の割りと取手 */}
      <g>
        <line x1={690} y1={yC + 148} x2={690} y2={H} stroke={KRP.ink} strokeWidth={5} opacity={0.7} />
        <rect x={634} y={yC + 196} width={28} height={78} rx={10}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4.5} />
        <rect x={718} y={yC + 196} width={28} height={78} rx={10}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={4.5} />
      </g>
      {/* ---- シンク (乾いている) ---- */}
      <rect x={452} y={yC + 12} width={476} height={98} rx={20}
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={7} />
      {/* 槽の内側 (奥の立ち上がり → 底、の2面に分けて深さを出す) */}
      <rect x={478} y={yC + 28} width={424} height={70} rx={14}
        fill={BP.steelLight} stroke={KRP.ink} strokeWidth={5} />
      <path d={`M 478 ${yC + 50} L 902 ${yC + 50} L 880 ${yC + 94} L 500 ${yC + 94} Z`}
        fill={BP.steel} stroke={KRP.ink} strokeWidth={4} />
      <g stroke={KRP.white} strokeWidth={4} opacity={0.5}>
        <line x1={492} y1={yC + 34} x2={888} y2={yC + 34} />
      </g>
      <ellipse cx={690} cy={yC + 66} rx={30} ry={15}
        fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4.5} />
      <g stroke={BP.ironDark} strokeWidth={3} opacity={0.8}>
        {[-14, 0, 14].map((d) => (
          <line key={d} x1={690 + d} y1={yC + 56} x2={690 + d} y2={yC + 76} />
        ))}
      </g>
      {/* 乾いた輪染み */}
      <g stroke={C.tile} strokeWidth={3.5} opacity={0.55} fill="none">
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={690} cy={yC + 66} rx={56 + i * 36} ry={22 + i * 11} />
        ))}
      </g>
      {/* ---- 水栓 (乾いている) ---- */}
      <g>
        {/* 台座 */}
        <ellipse cx={690} cy={yC + 4} rx={52} ry={16} fill={BP.steelLight}
          stroke={KRP.ink} strokeWidth={5} />
        {/* 立ち上がり + 首 (グースネック) */}
        <path d="M 690 592 L 690 352 Q 690 302 636 302 L 600 302 L 600 396"
          fill="none" stroke={KRP.ink} strokeWidth={40} strokeLinecap="round" />
        <path d="M 690 592 L 690 352 Q 690 302 636 302 L 600 302 L 600 396"
          fill="none" stroke={BP.steelLight} strokeWidth={26} strokeLinecap="round" />
        <path d="M 681 580 L 681 356" fill="none" stroke={KRP.white}
          strokeWidth={7} opacity={0.75} />
        {/* 吐水口 */}
        <rect x={578} y={390} width={44} height={26} rx={6}
          fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
        <ellipse cx={600} cy={416} rx={18} ry={6} fill={BP.ironDark}
          stroke={KRP.ink} strokeWidth={3.5} />
        {/* レバーハンドル (ひねられている) */}
        <g transform={`rotate(${-52 * turn} 690 412)`}>
          <rect x={690} y={394} width={132} height={36} rx={18}
            fill={BP.steelLight} stroke={KRP.ink} strokeWidth={6} />
          <circle cx={806} cy={412} r={21} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={5} />
          <line x1={706} y1={412} x2={786} y2={412} stroke={KRP.white}
            strokeWidth={5} opacity={0.6} />
        </g>
        <circle cx={690} cy={412} r={32} fill={BP.steel} stroke={KRP.ink} strokeWidth={6} />
        <HexBolt x={690} y={412} r={11} fill={BP.steelDark} />
      </g>
      {/* 最後の一滴 → 止まる */}
      {dropT > 0 && dropT < 1 && (
        <path d={`M 600 ${dropY} q -11 -17 0 -30 q 11 13 0 30`}
          fill={KRP.blueSoft} stroke={KRP.ink} strokeWidth={4} />
      )}
      <XMark x={600} y={508} s={1.2} t={seg(f, 28, 40)} />
      {/* ---- 空のコップ ---- */}
      <g>
        <path d={`M 310 ${yC - 92} L 324 ${yC + 34} L 416 ${yC + 34} L 430 ${yC - 92} Z`}
          fill={C.glass} opacity={0.6} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={370} cy={yC - 92} rx={60} ry={15} fill={C.skyPale}
          opacity={0.8} stroke={KRP.ink} strokeWidth={6} />
        <ellipse cx={370} cy={yC + 34} rx={46} ry={11} fill={C.glass}
          opacity={0.5} stroke={KRP.ink} strokeWidth={4} />
        <line x1={334} y1={yC - 74} x2={346} y2={yC + 18}
          stroke={KRP.white} strokeWidth={9} opacity={0.85} />
      </g>
      {/* ---- 見つめる人。蛇口のそばまで寄せて大きく。腕は胴から離して描く ---- */}
      <Person x={1215} y={898} s={1.34} cloth={KRP.blueDeep} clothDark={C.night}
        face="worried" gaze={[-3, 0]} lean={2} f={f} />
      {/* 空の手を蛇口のほうへ差し出している腕 */}
      <g transform={`rotate(${-3 + Math.sin(f / 11) * 1.6} 1124 702)`}>
        <path d="M 1124 702 Q 1070 674 1030 644" fill="none"
          stroke={KRP.ink} strokeWidth={42} strokeLinecap="round" />
        <path d="M 1124 702 Q 1070 674 1030 644" fill="none"
          stroke={KRP.blueDeep} strokeWidth={30} strokeLinecap="round" />
        {/* 手のひら (上を向けた「何も出ない」の手) */}
        <path d="M 1052 656 Q 1012 614 968 630 Q 988 668 1026 672 Z"
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
        <g stroke={KRP.ink} strokeWidth={4} opacity={0.6} fill="none">
          <path d="M 1012 638 Q 998 646 992 656" />
          <path d="M 1030 650 Q 1018 658 1012 666" />
        </g>
      </g>
      {/* もう一方の腕 (体の横に下げている) */}
      <g>
        <path d="M 1306 700 Q 1340 752 1332 806" fill="none"
          stroke={KRP.ink} strokeWidth={42} strokeLinecap="round" />
        <path d="M 1306 700 Q 1340 752 1332 806" fill="none"
          stroke={KRP.blueDeep} strokeWidth={30} strokeLinecap="round" />
        <circle cx={1332} cy={814} r={23} fill={KRP.white} stroke={KRP.ink} strokeWidth={5.5} />
      </g>
      {/* ---- 札 ---- */}
      <TagPlate x={1210} y={200} text="灯りはついている" size={32} t={seg(f, 8, 22)} color={KRP.green} />
      <Arrow x={880} y={200} s={0.9} rot={180} t={seg(f, 12, 26)} color={KRP.green} />
      <TagPlate x={320} y={430} text="水が出ない" size={44} t={seg(f, 30, 42)} color={KRP.red} />
      <TagPlate x={300} y={212} text="25階より上" size={30} t={seg(f, 20, 34)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb6_daikin_wa_kieta: (f) => <Kb6dDaikinWaKieta f={f} />,
  kb6_mienaku_natta: (f) => <Kb6dMienakuNatta f={f} />,
  kb6_musashikosugi: (f) => <Kb6dMusashikosugi f={f} />,
  kb6_47kai_643ko: (f) => <Kb6dN47Kai643Ko f={f} />,
  kb6_taifuu_19gou: (f) => <Kb6dTaifuu19Gou f={f} />,
  kb6_teibou_wo_koenai: (f) => <Kb6dTeibouWoKoenai f={f} />,
  kb6_gyakuryuu: (f) => <Kb6dGyakuryuu f={f} />,
  kb6_denkishitsu_ga_tsukaru: (f) => <Kb6dDenkishitsuGaTsukaru f={f} />,
  kb6_24kai_made: (f) => <Kb6dN24KaiMade f={f} />,
  kb6_dansui_wa_zenko: (f) => <Kb6dDansuiWaZenko f={f} />,
  kb6_denki_atte_mo: (f) => <Kb6dDenkiAtteMo f={f} />,
};

export const K_B6D_MOTIFS: string[] = [
  "kb6_daikin_wa_kieta",         // #250 では、高さの代金は、消えたのでしょうか。
  "kb6_mienaku_natta",           // #251 消えていません。見えなくなっただけです。
  "kb6_musashikosugi",           // #252 2019年10月、川崎市の武蔵小杉。
  "kb6_47kai_643ko",             // #253 47階、643戸のタワーマンションがあります。
  "kb6_taifuu_19gou",            // #254 台風19号が来ました。
  "kb6_teibou_wo_koenai",        // #255 川が堤防を越えたのではありません。
  "kb6_gyakuryuu",               // #256 排水管を通って、水が逆流してきたんです。
  "kb6_denkishitsu_ga_tsukaru",  // #257 ★地下の電気室が、水に浸かりました。
  "kb6_24kai_made",              // #258 停電したのは、24階まででした。
  "kb6_dansui_wa_zenko",         // #259 ところが、断水したのは全戸です。
  "kb6_denki_atte_mo",           // #260 電気が通っている階でも、水は出ませんでした。
];

export const kosoB6dScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
