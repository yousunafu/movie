// 「なぜ高層ビルは生まれたのか」: 第5章「島には、土地がない。」後半1 (1733棟〜百尺)
// 担当範囲: 台本 docs/koso-script-v7.txt の 200〜208行目 (文#199〜#207・9文)。
// 1文 = 1シーン = 1枚の絵。ぜんぶで9枚。
// motif 名は必ず kb5_ で始める。WobbleDefs の seed はこのファイルでは 820〜828 を使う。
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
  street: "#6E7076",
  streetDark: "#55575C",
};

// ===================================================================
// このファイルのローカル部品 (共用の KosoB2Parts には足さない)
// ===================================================================

/** 紙の縁。グラフの台紙 (#199〜#201 で共通の下地) */
const PaperSheet: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x + 10} y={y + 12} width={w} height={h} fill={C.mapLine} opacity={0.22} />
    <rect x={x} y={y} width={w} height={h} fill={C.paper} stroke={KRP.ink} strokeWidth={5} />
    <line x1={x} y1={y + 26} x2={x + w} y2={y + 26} stroke={C.mapLine} strokeWidth={2.5} opacity={0.5} />
  </g>
);

/**
 * 1890〜2020 の棟数グラフ。#199/#200/#201 で同じ座標系を使う (連番の形をそろえる)。
 * x0,y0 = 原点 (左下)。gw,gh = 軸の幅と高さ。
 * 1940〜1950 が平ら (11棟のまま) になる形を数式で持っている。
 */
const GRAPH = { x0: 250, y0: 760, gw: 1470, gh: 580 };
/** 年 → 棟数 (1733棟に向かう。1940〜1950 は 11 のまま) */
const towersAt = (year: number): number => {
  if (year <= 1890) return 1;
  if (year <= 1930) return 1 + ((year - 1890) / 40) * 9;     // 1930 → 10
  if (year <= 1940) return 10 + ((year - 1930) / 10) * 1;    // 1940 → 11
  if (year <= 1950) return 11;                                // ★止まる
  if (year <= 1970) return 11 + ((year - 1950) / 20) * 69;   // 1970 → 80
  if (year <= 1995) return 80 + ((year - 1970) / 25) * 420;  // 1995 → 500
  return 500 + ((year - 1995) / 25) * 1233;                  // 2020 → 1733
};
const yrX = (year: number) => GRAPH.x0 + ((year - 1890) / 130) * GRAPH.gw;
const numY = (n: number) => GRAPH.y0 - Math.pow(n / 1733, 0.42) * GRAPH.gh;

/** グラフの軸・目盛り・年の数字。グラフ3枚で共通 */
const GraphAxes: React.FC<{ t: number }> = ({ t }) => {
  const { x0, y0, gw, gh } = GRAPH;
  const ax = gw * easeOut(clamp01(t));
  return (
    <g>
      {/* 縦軸 */}
      <line x1={x0} y1={y0} x2={x0} y2={y0 - gh - 36} stroke={KRP.ink} strokeWidth={7} />
      {/* 横軸 */}
      <line x1={x0 - 30} y1={y0} x2={x0 + ax + 40} y2={y0} stroke={KRP.ink} strokeWidth={7} />
      {/* 縦軸の目盛りと数字 */}
      {[1, 10, 100, 500, 1733].map((n) => (
        <g key={n}>
          <line x1={x0 - 18} y1={numY(n)} x2={x0 + ax} y2={numY(n)}
            stroke={C.mapLine} strokeWidth={2.5} opacity={0.55} strokeDasharray="12 10" />
          <line x1={x0 - 22} y1={numY(n)} x2={x0} y2={numY(n)} stroke={KRP.ink} strokeWidth={5} />
          <text x={x0 - 34} y={numY(n) + 12} textAnchor="end" fontFamily={FONT} fontWeight={900}
            fontSize={34} fill={KRP.ink}>{n}</text>
        </g>
      ))}
      {/* 横軸の目盛りと年 */}
      {[1890, 1910, 1930, 1950, 1970, 1990, 2010].map((yr) => (
        yrX(yr) <= x0 + ax + 2 ? (
          <g key={yr}>
            <line x1={yrX(yr)} y1={y0} x2={yrX(yr)} y2={y0 + 20} stroke={KRP.ink} strokeWidth={5} />
            <text x={yrX(yr)} y={y0 + 60} textAnchor="middle" fontFamily={FONT} fontWeight={800}
              fontSize={30} fill={KRP.ink}>{yr}</text>
          </g>
        ) : null
      ))}
      {/* 小さい刻み (5年ごと) */}
      {Array.from({ length: 27 }, (_, i) => 1890 + i * 5).map((yr) => (
        yrX(yr) <= x0 + ax + 2 ? (
          <line key={`m${yr}`} x1={yrX(yr)} y1={y0} x2={yrX(yr)} y2={y0 + 10}
            stroke={KRP.ink} strokeWidth={3} opacity={0.8} />
        ) : null
      ))}
      <text x={x0 - 36} y={y0 - gh - 46} textAnchor="end" fontFamily={FONT} fontWeight={900}
        fontSize={28} fill={KRP.ink}>棟</text>
    </g>
  );
};

/** 棟数の棒。1890〜endYear までびっしり並べる */
const GraphBars: React.FC<{ endYear: number; t: number; flatColor?: string }> = ({
  endYear, t, flatColor,
}) => {
  const { y0 } = GRAPH;
  const yrs = Array.from({ length: 131 }, (_, i) => 1890 + i).filter((y) => y <= endYear);
  const bw = (GRAPH.gw / 130) * 0.82;
  const grow = easeOut(clamp01(t));
  return (
    <g>
      {yrs.map((yr) => {
        const appear = clamp01(grow * 131 - (yr - 1890) * 0.55);
        if (appear <= 0) return null;
        const top = numY(towersAt(yr));
        const hh = (y0 - top) * appear;
        const flat = flatColor && yr >= 1940 && yr <= 1950;
        return (
          <rect key={yr} x={yrX(yr) - bw / 2} y={y0 - hh} width={bw} height={hh}
            fill={flat ? flatColor : C.graphBlue} stroke={KRP.ink} strokeWidth={2.2}
            opacity={0.95} />
        );
      })}
    </g>
  );
};

/** 棟数の折れ線 (棒の頭をなぞる) */
const GraphLine: React.FC<{ endYear: number; t: number; color?: string; w?: number }> = ({
  endYear, t, color = C.graphRed, w = 8,
}) => {
  const yrs = Array.from({ length: 131 }, (_, i) => 1890 + i).filter((y) => y <= endYear);
  const n = Math.max(2, Math.ceil(yrs.length * easeOut(clamp01(t))));
  const d = yrs.slice(0, n).map((yr, i) =>
    `${i === 0 ? "M" : "L"} ${yrX(yr).toFixed(1)} ${numY(towersAt(yr)).toFixed(1)}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />;
};

/**
 * 斜め俯瞰の「年の道」(#200 専用)。1890 が奥の左上、2020 が手前の右下。
 * 道の上に、その年までの棟数ぶんの高さの塊が1つずつ立つ。
 */
const ROAD = { x0: 300, x1: 1530, y0: 250, y1: 762 };
const roadX = (u: number) => ROAD.x0 + (ROAD.x1 - ROAD.x0) * u;
const roadY = (u: number) => ROAD.y0 + (ROAD.y1 - ROAD.y0) * Math.pow(u, 1.4);
const roadHW = (u: number) => 50 + 150 * Math.pow(u, 1.25);
/** 道に立つ塊の大きさ (手前ほど大きい) */
const roadScale = (u: number) => 0.34 + 0.9 * u;

/** 斜めから見た箱。正面・右の側面・天面の3つで作る (奥は右上) */
const IsoBox: React.FC<{
  x: number; baseY: number; w: number; h: number; d: number;
  face?: string; side?: string; top?: string; sw?: number;
}> = ({ x, baseY, w, h, d, face = C.cityPale, side = C.cityDark, top = "#E2E6E8", sw = 4 }) => {
  const ty = baseY - h;
  const dy = d * 0.52;
  return (
    <g stroke={KRP.ink} strokeWidth={sw} strokeLinejoin="round">
      {/* 右の側面 (奥へ) */}
      <polygon points={`${x + w},${ty} ${x + w + d},${ty - dy} ${x + w + d},${baseY - dy} ${x + w},${baseY}`}
        fill={side} />
      {/* 天面 */}
      <polygon points={`${x},${ty} ${x + w},${ty} ${x + w + d},${ty - dy} ${x + d},${ty - dy}`} fill={top} />
      {/* 正面 */}
      <rect x={x} y={ty} width={w} height={h} fill={face} />
    </g>
  );
};

/**
 * 尺の物差し (#206 で使う)。縦に立てる。
 * 下端 y0、上端が 110尺。100尺の位置に太い刻み。
 */
const RULER = { x: 430, y0: 820, top: 150 };
const shakuY = (shaku: number) => RULER.y0 - (shaku / 110) * (RULER.y0 - RULER.top);

/** 木の物差し。目盛り・数字・木口まで描く */
const ShakuRuler: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const rev = easeOut(clamp01(t));
  const yTop = lerp(RULER.y0, shakuY(110), rev);
  const wW = 200;
  return (
    <g>
      {/* 影 */}
      <rect x={RULER.x - wW / 2 + 14} y={yTop + 10} width={wW} height={RULER.y0 - yTop}
        fill={C.mapLine} opacity={0.25} />
      {/* 本体 (木) */}
      <rect x={RULER.x - wW / 2} y={yTop} width={wW} height={RULER.y0 - yTop}
        fill={BP.woodLight} stroke={KRP.ink} strokeWidth={6} />
      {/* 木目 */}
      {[0.28, 0.52, 0.74].map((p, i) => (
        <line key={i} x1={RULER.x - wW / 2 + wW * p} y1={yTop + 8}
          x2={RULER.x - wW / 2 + wW * p + 6} y2={RULER.y0 - 8}
          stroke={BP.woodDark} strokeWidth={3} opacity={0.42} />
      ))}
      {/* 木口 (上端の断面) */}
      <rect x={RULER.x - wW / 2} y={yTop} width={wW} height={16}
        fill={BP.wood} stroke={KRP.ink} strokeWidth={5} />
      {/* 目盛り: 1尺ごと。10尺ごとに長く + 数字 */}
      <g>
        {Array.from({ length: 111 }, (_, i) => i).map((s) => {
          const yy = shakuY(s);
          if (yy < yTop + 4) return null;
          const big = s % 10 === 0;
          const len = big ? 74 : s % 5 === 0 ? 48 : 28;
          return (
            <g key={s}>
              <line x1={RULER.x - wW / 2} y1={yy} x2={RULER.x - wW / 2 + len} y2={yy}
                stroke={KRP.ink} strokeWidth={big ? 5 : 3} opacity={big ? 1 : 0.75} />
              {big && s > 0 && (
                <text x={RULER.x - wW / 2 + 84} y={yy + 11} fontFamily={FONT} fontWeight={800}
                  fontSize={28} fill={KRP.ink}>{s}</text>
              )}
            </g>
          );
        })}
      </g>
      {/* 「尺」の刻印 */}
      <text x={RULER.x} y={RULER.y0 - 24} textAnchor="middle" fontFamily={FONT} fontWeight={900}
        fontSize={44} fill={BP.woodDark}>尺</text>
      {/* 端金 (真鍮の口金)。わずかに揺れる */}
      <g transform={`translate(0 ${Math.sin(f / 13) * 2})`}>
        <rect x={RULER.x - wW / 2 - 8} y={RULER.y0 - 14} width={wW + 16} height={26}
          fill={BP.brass} stroke={KRP.ink} strokeWidth={5} />
        <Rivets x1={RULER.x - wW / 2 + 16} y1={RULER.y0 - 1} x2={RULER.x + wW / 2 - 16} y2={RULER.y0 - 1}
          n={4} r={5} fill={BP.brassDark} />
      </g>
    </g>
  );
};

/** 百尺の建物 (#206/#207 で同じ)。頭が 100尺のところに来る */
const HyakushakuBldg: React.FC<{ x: number; w: number; t: number; floors?: number }> = ({
  x, w, t, floors = 8,
}) => {
  const top = shakuY(100);
  const g = easeOut(clamp01(t));
  const yy = lerp(RULER.y0, top, g);
  return (
    <g>
      <rect x={x} y={yy} width={w} height={RULER.y0 - yy}
        fill={C.cityPale} stroke={KRP.ink} strokeWidth={6} />
      {/* 窓 */}
      {Array.from({ length: floors }, (_, r) => {
        const fy = top + 34 + r * ((RULER.y0 - top - 46) / floors);
        if (fy < yy + 14) return null;
        return (
          <g key={r}>
            {[0, 1, 2, 3].map((c) => (
              <rect key={c} x={x + 22 + c * ((w - 44) / 4)} y={fy}
                width={(w - 44) / 4 - 14} height={34}
                fill={C.cityDark} stroke={KRP.ink} strokeWidth={3} opacity={0.85} />
            ))}
          </g>
        );
      })}
      {/* 屋上のパラペットと塔屋 */}
      <rect x={x - 10} y={yy} width={w + 20} height={20}
        fill={C.cityDark} stroke={KRP.ink} strokeWidth={5} />
      <rect x={x + w * 0.34} y={yy - 36} width={w * 0.32} height={36}
        fill={C.cityPale} stroke={KRP.ink} strokeWidth={5} />
    </g>
  );
};

// ===================================================================
// シーン本体
// ===================================================================

// ===== #199 2020年には、1733棟になりました。 =====
// 格: 山
// どこ: 統計の大判紙を広げた机の上。紙が画面を埋める
// 演出: #198と同じグラフが端まで伸び切る。棒がびっしり1731本。1733の札を右上に大きく。
//       左下に1930年までの6本分だけが「昔はこれだけ」として小さく残る。紙をのぞく2人を置く
// 動き: 棒が左から右へ立ち上がる → 折れ線が追う → 1733の札が跳ねる → カメラがわずかに寄る
const Kb5cN2020_1733Tou: React.FC<{ f: number }> = ({ f }) => {
  const grow = seg(f, 2, 30);
  const z = lerp(1, 1.045, easeOut(seg(f, 0, 40)));
  const head = numY(1733);
  return (
    <Frame f={f} seed={820} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.1} />
      <g transform={zoomAt(z, 960, 560)}>
        <PaperSheet x={120} y={96} w={1700} h={790} />
        <GraphAxes t={seg(f, 0, 12)} />
        <GraphBars endYear={2020} t={grow} />
        <GraphLine endYear={2020} t={seg(f, 6, 34)} />
        {/* 1733 の頭。到達の印 */}
        <g opacity={clamp01(seg(f, 26, 34))}>
          <line x1={GRAPH.x0} y1={head} x2={yrX(2020) + 40} y2={head}
            stroke={C.graphRed} strokeWidth={6} strokeDasharray="18 12" />
          <circle cx={yrX(2020)} cy={head} r={16} fill={C.graphRed} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
        {/* 左下に残る「1930年までの6本」 */}
        <g opacity={clamp01(seg(f, 14, 28))}>
          <rect x={286} y={382} width={300} height={168} fill={KRP.white}
            stroke={KRP.ink} strokeWidth={4.5} />
          {[1880, 1890, 1900, 1910, 1920, 1930].map((yr, i) => (
            <rect key={yr} x={306 + i * 46} y={540 - (14 + i * 18)} width={30} height={14 + i * 18}
              fill={C.graphBlue} stroke={KRP.ink} strokeWidth={2.5} />
          ))}
          <text x={436} y={418} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={28} fill={KRP.ink}>1930年まで</text>
        </g>
        <TagPlate x={436} y={344} text="6棟" size={34} t={seg(f, 20, 30)} />
      </g>
      {/* 紙をのぞく2人 (この章は図が多いので人を置く) */}
      <Person x={1786} y={1040} s={0.62} f={f} cloth="#3E4B66" clothDark="#2E3850" lean={-7} gaze={[-3, -3]} />
      <Person x={150} y={1052} s={0.58} f={f} phase={2} cloth="#6A5B45" clothDark="#4E4332" lean={6} gaze={[4, -3]} />
      <TagPlate x={1510} y={248} text="1733棟" size={72} t={seg(f, 28, 40)} color={C.graphRed} />
      <TagPlate x={1510} y={358} text="2020年" size={40} t={seg(f, 32, 42)} />
      <TagPlate x={300} y={206} text="超高層の数" size={40} t={seg(f, 8, 20)} />
    </Frame>
  );
};

// ===== #200 ただし、途中で止まった時期があります。 =====
// 格: 図
// どこ: 方眼紙の上。★カメラを真横のグラフから「斜め俯瞰」に振る (#199/#201 と同じ絵にしない)
// 演出: 1890が奥・2020が手前の「年の道」。道の上に、その年の棟数ぶんの高さの塊が立つ。
//       1940〜1950 の区間だけ更地で、道に通行止めのバリケードと土嚢が置かれている
// 動き: 塊が奥から順に立つ → バリケードが降りてくる → 止まった区間が赤く染まる → 旗がはためく
const Kb5cTomattaJiki: React.FC<{ f: number }> = ({ f }) => {
  const U1 = (1940 - 1890) / 130;     // 止まった区間のはじまり
  const U2 = (1950 - 1890) / 130;     // おわり
  const grow = easeOut(seg(f, 0, 30));
  const drop = easeOut(seg(f, 8, 22));
  const zone = easeOut(seg(f, 12, 26));
  const samples = Array.from({ length: 29 }, (_, i) => i / 28);
  const edge = (sgn: number) => samples.map((u) => `${(roadX(u) + sgn * roadHW(u)).toFixed(1)},${roadY(u).toFixed(1)}`);
  const roadPts = [...edge(-1), ...edge(1).reverse()].join(" ");
  const zonePts = (() => {
    const us = [U1, (U1 + U2) / 2, U2];
    return [...us.map((u) => `${(roadX(u) - roadHW(u)).toFixed(1)},${roadY(u).toFixed(1)}`),
    ...us.slice().reverse().map((u) => `${(roadX(u) + roadHW(u)).toFixed(1)},${roadY(u).toFixed(1)}`)].join(" ");
  })();
  const decades = Array.from({ length: 14 }, (_, i) => 1890 + i * 10);
  const bx = roadX(U1), by = roadY(U1), bhw = roadHW(U1) + 22, bsc = roadScale(U1);
  return (
    <Frame f={f} seed={821} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.1} />
      {/* 年の道 (斜め俯瞰)。影 → 路面 → 縁石 */}
      <g transform="translate(14 16)" opacity={0.2}>
        <polygon points={roadPts} fill={C.mapLine} />
      </g>
      <polygon points={roadPts} fill={C.paper} stroke={KRP.ink} strokeWidth={6} />
      {/* 路面の刻み (5年ごとの横線) */}
      {Array.from({ length: 27 }, (_, i) => i / 26).map((u, i) => (
        <line key={i} x1={roadX(u) - roadHW(u) * 0.9} y1={roadY(u)}
          x2={roadX(u) + roadHW(u) * 0.9} y2={roadY(u)}
          stroke={C.mapLine} strokeWidth={i % 2 ? 2 : 3.5} opacity={i % 2 ? 0.35 : 0.6} />
      ))}
      {/* 止まった区間の赤い網掛け */}
      <g opacity={clamp01(seg(f, 10, 20))}>
        <polygon points={zonePts} fill={C.graphRed} opacity={0.1 + 0.16 * zone} />
        <polygon points={zonePts} fill="none" stroke={C.graphRed} strokeWidth={7} />
        {Array.from({ length: 7 }, (_, i) => {
          const u = U1 + (U2 - U1) * ((i + 0.5) / 7);
          return (
            <line key={i} x1={roadX(u) - roadHW(u)} y1={roadY(u) + 26}
              x2={roadX(u) + roadHW(u)} y2={roadY(u) - 26}
              stroke={C.graphRed} strokeWidth={5} opacity={0.5 * zone} />
          );
        })}
      </g>
      {/* 道の上に立つ塊 (奥から順に。手前ほど大きい) */}
      {decades.map((yr, i) => {
        const u = (yr - 1890) / 130;
        if (yr >= 1940 && yr <= 1950) return null;      // 止まった区間は更地
        const ap = clamp01(grow * 14 - i * 0.6);
        if (ap <= 0) return null;
        const sc = roadScale(u);
        const hh = (44 + 236 * Math.pow(towersAt(yr) / 1733, 0.42)) * sc * ap;
        const bw = 74 * sc;
        return (
          <IsoBox key={yr} x={roadX(u) - bw / 2} baseY={roadY(u)} w={bw} h={hh}
            d={30 * sc} sw={3.4 + 2 * sc} />
        );
      })}
      {/* 年の標柱 (道の左の外に立てる)。1950 はバリケードに隠れるので赤い引き出しに任せる */}
      {[1890, 1910, 1930, 1970, 1990, 2010].map((yr) => {
        const u = (yr - 1890) / 130;
        const sc = roadScale(u);
        const px = roadX(u) - roadHW(u) - 18;
        return (
          <g key={yr}>
            <line x1={px} y1={roadY(u)} x2={px} y2={roadY(u) - 54 * sc}
              stroke={KRP.ink} strokeWidth={4} />
            <text x={px - 10} y={roadY(u) - 60 * sc} textAnchor="end" fontFamily={FONT}
              fontWeight={900} fontSize={24 + 22 * u} fill={KRP.ink}>{yr}</text>
          </g>
        );
      })}
      {/* 通行止めのバリケード (上から降りてくる) + 土嚢 + 旗 */}
      <g transform={`translate(0 ${lerp(-420, 0, drop)})`} opacity={clamp01(seg(f, 8, 16))}>
        {/* 土嚢 */}
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <ellipse cx={bx + sg * bhw} cy={by + 8} rx={34 * bsc + 16} ry={14 * bsc + 7}
              fill={C.dust} stroke={KRP.ink} strokeWidth={4} />
            <ellipse cx={bx + sg * bhw} cy={by - 10} rx={30 * bsc + 14} ry={13 * bsc + 6}
              fill={C.rock} stroke={KRP.ink} strokeWidth={4} />
          </g>
        ))}
        {/* 脚 */}
        {[-1, 1].map((sg) => (
          <rect key={sg} x={bx + sg * (bhw - 18) - 7} y={by - 92} width={14} height={92}
            fill={BP.wood} stroke={KRP.ink} strokeWidth={4.5} />
        ))}
        {/* 紅白の横板 */}
        <rect x={bx - bhw} y={by - 128} width={bhw * 2} height={40}
          fill={KRP.white} stroke={KRP.ink} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => (
          <polygon key={i}
            points={`${bx - bhw + i * (bhw / 3)},${by - 128} ${bx - bhw + i * (bhw / 3) + 28},${by - 128} ${bx - bhw + i * (bhw / 3) + 6},${by - 88} ${bx - bhw + i * (bhw / 3) - 22},${by - 88}`}
            fill={C.graphRed} opacity={0.9} />
        ))}
        <rect x={bx - bhw} y={by - 128} width={bhw * 2} height={40}
          fill="none" stroke={KRP.ink} strokeWidth={5} />
        {/* 旗。風ではためく */}
        <g transform={`translate(${bx + bhw - 6} ${by - 128})`}>
          <line x1={0} y1={0} x2={0} y2={-74} stroke={KRP.ink} strokeWidth={5} />
          <path d={`M 0 -74 q 32 ${8 + Math.sin(f / 6) * 7} 62 0 l 0 36 q -30 ${8 - Math.sin(f / 6) * 7} -62 0 z`}
            fill={C.graphRed} stroke={KRP.ink} strokeWidth={4.5} />
        </g>
      </g>
      {/* 区間の両端の年。道の下の空いている側へ引き出す (塊や標柱と重ねない) */}
      {[[U1, "1940"], [U2, "1950"]].map(([u, lab], i) => {
        const ex = roadX(u as number) + roadHW(u as number);
        const ey = roadY(u as number);
        return (
          <g key={i} opacity={clamp01(seg(f, 16, 28))}>
            <line x1={ex} y1={ey} x2={ex + 54 + i * 70} y2={ey + 104 + i * 46}
              stroke={C.graphRed} strokeWidth={3.5} opacity={0.7} />
            <text x={ex + 60 + i * 70} y={ey + 120 + i * 46}
              fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.graphRed}
              stroke={KRP.cream} strokeWidth={7} paintOrder="stroke">{lab as string}</text>
          </g>
        );
      })}
      {/* 引き出し線 */}
      <line x1={1010} y1={274} x2={bx + 40} y2={by - 150} stroke={KRP.ink} strokeWidth={3.5}
        opacity={0.55 * clamp01(seg(f, 22, 32))} />
      {/* 凡例: 塊1つ = 1棟ぶんの高さ */}
      <g opacity={clamp01(seg(f, 30, 40))}>
        <IsoBox x={196} baseY={716} w={54} h={74} d={22} sw={4} />
      </g>
      <TagPlate x={226} y={768} text="1棟ずつ" size={34} t={seg(f, 32, 42)} />
      <TagPlate x={1180} y={230} text="1棟も増えない" size={44} t={seg(f, 24, 36)} color={C.graphRed} />
      <TagPlate x={330} y={166} text="止まった区間" size={44} t={seg(f, 2, 14)} color={C.graphRed} />
    </Frame>
  );
};

// ===== #201 1940年から1950年の10年間は、11棟のまま。 =====
// 格: 図
// どこ: #200の赤い枠の中に寄った図。10年ぶんの目盛りだけを画面いっぱいに
// 演出: 横軸は1940〜1950の1年刻み。11棟の高さで横ばいの線が端から端まで。棒も全部同じ高さ
// 動き: 線が左から右へ11のまま伸びる → 11の札 → 10年の寸法線が両端から閉じる
const Kb5cN1940_11Tou: React.FC<{ f: number }> = ({ f }) => {
  const x0 = 260, x1 = 1700, base = 790, lv = 330;   // lv = 11棟の高さ
  const px = (yr: number) => x0 + ((yr - 1940) / 10) * (x1 - x0);
  const draw = easeOut(seg(f, 4, 28));
  const dim = easeOut(seg(f, 20, 38));
  return (
    <Frame f={f} seed={822} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.1} />
      <PaperSheet x={120} y={96} w={1700} h={790} />
      {/* 軸 */}
      <line x1={x0 - 40} y1={base} x2={x1 + 60} y2={base} stroke={KRP.ink} strokeWidth={7} />
      <line x1={x0 - 40} y1={base} x2={x0 - 40} y2={200} stroke={KRP.ink} strokeWidth={7} />
      {/* 縦の目盛り (棟数 0/5/11) */}
      {[[0, base], [5, base - (lv / 11) * 5], [11, base - lv]].map(([n, yy]) => (
        <g key={n}>
          <line x1={x0 - 62} y1={yy} x2={x0 - 40} y2={yy} stroke={KRP.ink} strokeWidth={5} />
          <text x={x0 - 76} y={yy + 12} textAnchor="end" fontFamily={FONT} fontWeight={900}
            fontSize={36} fill={KRP.ink}>{n}</text>
        </g>
      ))}
      {/* 10年ぶんの目盛り + 年の数字。1年ごとの刻みを全部出す */}
      {Array.from({ length: 11 }, (_, i) => 1940 + i).map((yr) => (
        <g key={yr}>
          <line x1={px(yr)} y1={base} x2={px(yr)} y2={base + (yr % 5 === 0 ? 30 : 16)}
            stroke={KRP.ink} strokeWidth={yr % 5 === 0 ? 6 : 3.5} />
          <text x={px(yr)} y={base + 74} textAnchor="middle" fontFamily={FONT}
            fontWeight={yr % 5 === 0 ? 900 : 700} fontSize={yr % 5 === 0 ? 36 : 27}
            fill={KRP.ink}>{yr % 5 === 0 ? yr : `'${String(yr).slice(2)}`}</text>
        </g>
      ))}
      {/* 11棟のままの棒。全部同じ高さ */}
      {Array.from({ length: 11 }, (_, i) => 1940 + i).map((yr, i) => {
        const ap = clamp01(draw * 11 - i * 0.7);
        return ap <= 0 ? null : (
          <rect key={yr} x={px(yr) - 44} y={base - lv * ap} width={88} height={lv * ap}
            fill={C.graphBlue} stroke={KRP.ink} strokeWidth={3} opacity={0.9} />
        );
      })}
      {/* 11のまま横ばいの線 */}
      <line x1={px(1940)} y1={base - lv} x2={lerp(px(1940), px(1950), draw)} y2={base - lv}
        stroke={C.graphRed} strokeWidth={14} strokeLinecap="round" />
      {Array.from({ length: 11 }, (_, i) => 1940 + i).map((yr, i) =>
        clamp01(draw * 11 - i * 0.7) > 0.6 ? (
          <circle key={yr} cx={px(yr)} cy={base - lv} r={11}
            fill={KRP.white} stroke={C.graphRed} strokeWidth={6} />
        ) : null)}
      {/* 10年の寸法線 */}
      <g opacity={clamp01(seg(f, 18, 28))}>
        <line x1={px(1940)} y1={252} x2={px(1940) + (px(1950) - px(1940)) * dim} y2={252}
          stroke={KRP.ink} strokeWidth={6} />
        <line x1={px(1940)} y1={228} x2={px(1940)} y2={276} stroke={KRP.ink} strokeWidth={6} />
        <line x1={px(1950)} y1={228} x2={px(1950)} y2={276} stroke={KRP.ink} strokeWidth={6}
          opacity={dim > 0.9 ? 1 : 0} />
      </g>
      <TagPlate x={960} y={252} text="10年" size={48} t={seg(f, 28, 40)} />
      <TagPlate x={1560} y={base - lv - 96} text="11棟のまま" size={48} t={seg(f, 24, 38)} color={C.graphRed} />
      <TagPlate x={330} y={166} text="1940〜1950" size={44} t={seg(f, 0, 12)} />
    </Frame>
  );
};

// ===== #202 大恐慌と、戦争です。 =====
// 格: 山
// どこ: 1930年代の工場町。閉じた門の前、歩道に並ぶ職を失った人の列。遠くに軍需の煙突
// 演出: 色をいちばん暗く沈める (この章でここだけ)。門は鎖と板で閉じ、貼り紙が1枚。
//       手前の歩道に風で舞う新聞。列は画面の奥へ続く
// 動き: 列の人がわずかに揺れる → 煙が昇る → 新聞が転がる → 鎖が垂れて揺れる
const Kb5cKyoukouToSensou: React.FC<{ f: number }> = ({ f }) => {
  const smoke = seg(f, 0, 42);
  const paperX = lerp(640, 880, easeOut(seg(f, 4, 40)));
  return (
    <Frame f={f} seed={823} bg={C.darkSky} dark>
      {/* 沈んだ空 */}
      <rect x={0} y={0} width={W} height={660} fill={C.darkSky} />
      <rect x={0} y={0} width={W} height={300} fill={BP.ironDark} opacity={0.3} />
      {/* 遠くの軍需の煙突 (3本)。煙が斜めに昇る */}
      {[[1280, 92], [1470, 78], [1650, 104]].map(([cx, hh], i) => (
        <g key={i}>
          <rect x={cx} y={430 - hh} width={54} height={hh + 140}
            fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
          <rect x={cx - 8} y={430 - hh} width={70} height={18}
            fill={BP.iron} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 5 }, (_, k) => {
            const p = ((smoke * 1.4 + k * 0.2 + i * 0.11) % 1);
            return (
              <circle key={k} cx={cx + 27 + p * 92 + i * 6} cy={430 - hh - p * 240}
                r={26 + p * 54} fill={C.dust} opacity={0.3 * (1 - p)} />
            );
          })}
        </g>
      ))}
      {/* 遠景の工場棟 (のこぎり屋根) */}
      <g>
        <rect x={1180} y={470} width={740} height={160} fill={BP.shaftDark}
          stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        {Array.from({ length: 7 }, (_, i) => (
          <polygon key={i} points={`${1190 + i * 104},470 ${1230 + i * 104},428 ${1270 + i * 104},470`}
            fill={BP.shaftDark} stroke={KRP.ink} strokeWidth={4} opacity={0.85} />
        ))}
      </g>
      {/* 閉じた工場の門 (左。少し奥へ引いて、手前に人の列を大きく置く場所をあける) */}
      <g transform="translate(-30 66) scale(0.86)">
        {/* 門柱 */}
        <rect x={120} y={250} width={74} height={400} fill={C.rock} stroke={KRP.ink} strokeWidth={6} />
        <rect x={700} y={250} width={74} height={400} fill={C.rock} stroke={KRP.ink} strokeWidth={6} />
        <rect x={104} y={222} width={690} height={42} fill={C.rock} stroke={KRP.ink} strokeWidth={6} />
        <Rivets x1={150} y1={243} x2={750} y2={243} n={10} r={7} fill={BP.ironDark} />
        {/* 鉄柵の扉 (2枚) */}
        {[0, 1].map((d) => (
          <g key={d}>
            <rect x={194 + d * 253} y={300} width={253} height={350}
              fill="none" stroke={KRP.ink} strokeWidth={6} />
            {Array.from({ length: 8 }, (_, i) => (
              <line key={i} x1={210 + d * 253 + i * 31} y1={304}
                x2={210 + d * 253 + i * 31} y2={646} stroke={BP.iron} strokeWidth={8} />
            ))}
            <line x1={194 + d * 253} y1={400} x2={447 + d * 253} y2={400} stroke={BP.iron} strokeWidth={10} />
            <line x1={194 + d * 253} y1={560} x2={447 + d * 253} y2={560} stroke={BP.iron} strokeWidth={10} />
          </g>
        ))}
        {/* 打ち付けた板 2枚 (閉鎖の印) */}
        <rect x={210} y={436} width={520} height={46} fill={BP.wood}
          stroke={KRP.ink} strokeWidth={5} transform="rotate(-5 470 459)" />
        <rect x={210} y={520} width={520} height={46} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={5} transform="rotate(4 470 543)" />
        {/* 鎖と錠。少し揺れる */}
        <g transform={`rotate(${Math.sin(f / 15) * 2.2} 447 596)`}>
          <Rope x1={344} y1={596} x2={556} y2={596} w={18} kind="wire" f={f} sag={34} />
          <rect x={424} y={628} width={52} height={64} rx={8}
            fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
          <path d="M 436 628 a 16 18 0 0 1 28 0" fill="none" stroke={KRP.ink} strokeWidth={8} />
          <circle cx={450} cy={660} r={9} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={3} />
        </g>
        {/* 貼り紙 1枚 (文字はラベルのみ) */}
        <g transform="rotate(-3 300 350)">
          <rect x={232} y={318} width={154} height={100} fill={C.paper}
            stroke={KRP.ink} strokeWidth={4.5} />
          <text x={309} y={382} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={56} fill={C.graphRed}>閉</text>
        </g>
      </g>
      {/* 地面 (濡れた歩道) */}
      <rect x={0} y={650} width={W} height={430} fill={C.street} />
      <rect x={0} y={650} width={W} height={26} fill={C.streetDark} stroke={KRP.ink} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={i * 230} y1={700 + (i % 3) * 90} x2={i * 230 + 190} y2={700 + (i % 3) * 90}
          stroke={BP.ironDark} strokeWidth={4} opacity={0.4} />
      ))}
      {/* 手前の街灯 (奥行きを作る柱) */}
      <g>
        <rect x={214} y={430} width={26} height={650} fill={BP.ironDark}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={190} y={404} width={74} height={30} rx={8} fill={BP.iron}
          stroke={KRP.ink} strokeWidth={5} />
        <polygon points="186,404 268,404 254,352 200,352" fill={BP.iron}
          stroke={KRP.ink} strokeWidth={5} />
        <rect x={204} y={356} width={46} height={44} fill={KRP.yellow}
          stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
      </g>
      {/* 職を失った人の列。★手前(右)を大きく、奥(左)の門へ向かって小さくなる。
          頭が字幕の黒帯 (上端854) より上に出るよう、いちばん手前でも足元を y=824 に置く */}
      {[
        [1484, 824, 1.00], [1302, 796, 0.88], [1150, 772, 0.76],
        [1026, 752, 0.66], [926, 736, 0.57], [846, 722, 0.49],
        [782, 710, 0.42], [730, 700, 0.36],
      ].map(([px, py, ps], i) => (
        <g key={i} opacity={clamp01(seg(f, 2 + i * 2, 14 + i * 2))}>
          <Person x={px} y={py} s={ps} f={f} phase={i * 1.7}
            cloth={i % 2 ? "#4A4438" : "#3A3F49"} clothDark={i % 2 ? "#332F27" : "#272B33"}
            face="worried" lean={i % 2 ? 2 : -2} gaze={[-2, 1]} />
        </g>
      ))}
      {/* ★オチの2語は字幕帯に沈むので、空へ舞い上げる。
          風で飛ぶ号外2枚 (「恐慌」と「戦争」)。どちらも y=800 よりはるか上 */}
      <g transform={`translate(${paperX} ${222 + Math.sin(f / 7) * 14}) rotate(${-10 + Math.sin(f / 9) * 6})`}>
        <rect x={-116} y={-78} width={232} height={156} fill={C.paper}
          stroke={KRP.ink} strokeWidth={5} />
        <line x1={-96} y1={-44} x2={96} y2={-44} stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={76} fill={C.graphRed}>恐慌</text>
        {[44, 62].map((yy) => (
          <line key={yy} x1={-92} y1={yy} x2={92} y2={yy} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        ))}
      </g>
      <g transform={`translate(${lerp(1300, 1148, easeOut(seg(f, 8, 40)))} ${382 + Math.sin(f / 8 + 2) * 16}) rotate(${12 + Math.sin(f / 11) * 5})`}>
        <rect x={-110} y={-74} width={220} height={148} fill={C.paper}
          stroke={KRP.ink} strokeWidth={5} opacity={0.96} />
        <line x1={-90} y1={-42} x2={90} y2={-42} stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={72} fill={KRP.ink}>戦争</text>
        {[42, 60].map((yy) => (
          <line key={yy} x1={-86} y1={yy} x2={86} y2={yy} stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
        ))}
      </g>
      <TagPlate x={1660} y={170} text="軍需へ" size={40} t={seg(f, 20, 34)} fill={C.paper} />
      {/* 隅のバッジ (上端〜y=120) とぶつからない高さに置く */}
      <TagPlate x={300} y={210} text="1930年代" size={44} t={seg(f, 4, 16)} fill={C.paper} />
      <TagPlate x={1486} y={466} text="職を失った列" size={40} t={seg(f, 24, 38)} color={C.graphRed} fill={C.paper} />
    </Frame>
  );
};

// ===== #203 技術が止めたのではなく、社会が止めたんです。 =====
// 格: 図
// どこ: 方眼紙の上。歯車1枚だけに寄る。背景も人も置かない
// 演出: 歯車は画面の短辺の6割を使う大きさ。歯・歯元の丸み・軸・キー溝・ボルトまで描く。
//       歯車には○ (動く力はある)。★止めるのは腕ではなく「社会の決まり = 法令の束」。
//       題簽「法令」・官庁の紋・朱の判を描き込んだ分厚い束を、歯と歯の間に噛ませる
// 動き: 歯車が回っている → 右から法令の束が差し込まれて歯の間に食い込む →
//       ガツンと止まって震えが収まる → 押さえる矢印・×・札
const Kb5cShakaiGaTometa: React.FC<{ f: number }> = ({ f }) => {
  const CX = 880, CY = 560, R = 330, N = 22;
  // 歯と歯の「間」をちょうど3時の向きに置く角度 (束はここに食い込む)
  const GAPROT = -360 / (N * 2);
  const jam = easeOut(seg(f, 0, 12));       // 束が右から入って噛みこむまで
  const slideIn = (1 - jam) * 620;
  // 噛むまでは回っている → ガツンと止まり、わずかに震えて収まる
  const shake = f > 12
    ? Math.sin((f - 12) / 2.3) * 2.2 * Math.max(0, 1 - (f - 12) / 26)
    : 0;
  const rot = lerp(GAPROT - 28, GAPROT, jam) + shake;
  const tooth = (i: number) => {
    const a0 = (i / N) * 360 + rot;
    const pts: string[] = [];
    [[-7.4, R], [-4.4, R + 62], [4.4, R + 62], [7.4, R]].forEach(([da, rr]) => {
      const a = ((a0 + da) * Math.PI) / 180;
      pts.push(`${(CX + Math.cos(a) * rr).toFixed(1)},${(CY + Math.sin(a) * rr).toFixed(1)}`);
    });
    return pts.join(" ");
  };
  // 法令の束。原点 = 歯の間に食い込む先端。+x が歯車の外向き
  const TIPX = 1228, XK = 118, XE = 600, HY = 175, BAND = 66;
  const face = `0,-14 ${XK},${-HY} ${XE},${-HY} ${XE},${HY} ${XK},${HY} 0,14`;
  const EB = 50, EBY = 14 + (EB / XK) * (HY - 14);      // 小口 (束の厚み) の始まり
  const hitT = seg(f, 11, 14) * (1 - seg(f, 17, 28));   // 噛んだ瞬間の衝撃
  return (
    <Frame f={f} seed={824} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.12} />
      {/* 歯車 */}
      <g>
        {Array.from({ length: N }, (_, i) => (
          <polygon key={i} points={tooth(i)} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
        ))}
        <circle cx={CX} cy={CY} r={R} fill={BP.steelLight} stroke={KRP.ink} strokeWidth={8} />
        <circle cx={CX} cy={CY} r={R - 46} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} opacity={0.9} />
        {/* 肉抜きの穴 (5つ)。回転が見える */}
        {Array.from({ length: 5 }, (_, i) => {
          const a = ((i / 5) * 360 + rot * 1 - 90) * Math.PI / 180;
          return (
            <circle key={i} cx={CX + Math.cos(a) * (R - 150)} cy={CY + Math.sin(a) * (R - 150)}
              r={62} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          );
        })}
        {/* ハブ・キー溝・軸 */}
        <circle cx={CX} cy={CY} r={108} fill={BP.steelDark} stroke={KRP.ink} strokeWidth={6} />
        <circle cx={CX} cy={CY} r={54} fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
        <rect x={CX - 14} y={CY - 76} width={28} height={26}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4}
          transform={`rotate(${rot} ${CX} ${CY})`} />
        {Array.from({ length: 4 }, (_, i) => {
          const a = ((i / 4) * 360 + rot + 45) * Math.PI / 180;
          return <HexBolt key={i} x={CX + Math.cos(a) * 82} y={CY + Math.sin(a) * 82} r={16} rot={rot} />;
        })}
      </g>
      {/* 動く力はある印: ○ */}
      <Maru x={248} y={262} s={1.2} t={seg(f, 8, 20)} />
      <TagPlate x={248} y={414} text="動く力はある" size={38} t={seg(f, 12, 24)} color={KRP.green} />
      {/* ★社会が止めている物: 法令の束。歯と歯の間に食い込ませる */}
      <g transform={`translate(${TIPX + slideIn} ${CY})`}>
        {/* 影 */}
        <polygon points={face} fill={KRP.ink} opacity={0.15} transform="translate(18 24)" />
        {/* 束の小口 (紙が何枚も重なっている) */}
        <polygon
          points={`${EB},${EBY} ${XK},${HY} ${XE},${HY} ${XE},${HY + BAND} ${XK},${HY + BAND} ${EB},${EBY + BAND * 0.5}`}
          fill={BP.paper} stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1={XK + 24} y1={HY + 14 + k * 13} x2={XE - 18} y2={HY + 14 + k * 13}
            stroke={KRP.ink} strokeWidth={3} opacity={0.4} />
        ))}
        {/* いちばん上の紙 */}
        <polygon points={face} fill={KRP.white} stroke={KRP.ink} strokeWidth={7} />
        <polygon
          points={`${XK + 34},${-HY + 24} ${XE - 20},${-HY + 24} ${XE - 20},${HY - 24} ${XK + 34},${HY - 24}`}
          fill="none" stroke={KRP.ink} strokeWidth={3} opacity={0.28} />
        {/* 題簽 */}
        <rect x={176} y={-150} width={262} height={74} rx={6}
          fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
        <text x={307} y={-94} textAnchor="middle" fontFamily={FONT} fontWeight={900}
          fontSize={54} fill={KRP.ink}>法令</text>
        {/* 本文の罫 */}
        <line x1={178} y1={-42} x2={580} y2={-42}
          stroke={KRP.ink} strokeWidth={7} opacity={0.32} strokeLinecap="round" />
        <line x1={178} y1={-8} x2={474} y2={-8}
          stroke={KRP.ink} strokeWidth={7} opacity={0.32} strokeLinecap="round" />
        {/* 官庁の紋 (柱の並ぶ建物) */}
        <g>
          <circle cx={268} cy={80} r={64} fill={KRP.cream} stroke={KRP.ink} strokeWidth={5} />
          <polygon points="216,58 268,20 320,58" fill={BP.slab} stroke={KRP.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={228 + k * 22} y={58} width={14} height={48}
              fill={BP.slab} stroke={KRP.ink} strokeWidth={3.5} />
          ))}
          <rect x={214} y={106} width={108} height={14}
            fill={BP.slabDark} stroke={KRP.ink} strokeWidth={4} />
        </g>
        {/* 朱の判 */}
        <g transform="rotate(-9 486 80)">
          <circle cx={486} cy={80} r={74} fill="none" stroke={C.graphRed} strokeWidth={10} opacity={0.9} />
          <circle cx={486} cy={80} r={57} fill="none" stroke={C.graphRed} strokeWidth={5} opacity={0.7} />
          <text x={486} y={103} textAnchor="middle" fontFamily={FONT} fontWeight={900}
            fontSize={64} fill={C.graphRed} opacity={0.92}>印</text>
        </g>
        {/* 表紙の背 (外側の端) */}
        <rect x={XE - 26} y={-HY} width={26} height={HY * 2}
          fill="#4A5570" stroke={KRP.ink} strokeWidth={6} />
        {/* 歯に食い込んで潰れた皺 */}
        {[-1, 0, 1].map((k) => (
          <path key={k} d={`M 44 ${k * 46} q 34 ${k * 14} 72 ${k * 8}`}
            fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.42} />
        ))}
      </g>
      {/* 束をはさんでいる2枚の歯を描き直す = 歯と歯の「間」に噛んで見える */}
      <polygon points={tooth(0)} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      <polygon points={tooth(1)} fill={BP.steel} stroke={KRP.ink} strokeWidth={5} />
      {/* 噛んだ瞬間の衝撃 */}
      {hitT > 0 && (
        <g opacity={hitT}>
          {[-1.6, -1, 1, 1.6].map((d, i) => (
            <line key={i} x1={1272} y1={CY + d * 34} x2={1272 + 60 + i * 8} y2={CY + d * 84}
              stroke={C.graphRed} strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
      )}
      {/* 押さえる力の矢印 (束を歯の間へ押し込む) */}
      {/* label を使うと矢の軸に文字が重なって読めなくなるので、札を矢の左に置く */}
      <ForceArrow x={1460} y={190} len={190} rot={90} w={26}
        color={C.graphRed} t={seg(f, 20, 34)} />
      <TagPlate x={1270} y={230} text="押さえる" size={36} t={seg(f, 22, 36)}
        color={C.graphRed} />
      {/* 止まっている印 */}
      <XMark x={248} y={606} s={1.3} t={seg(f, 26, 38)} />
      {/* 札は帯 (上端854) から余裕をとって上げる */}
      <TagPlate x={248} y={714} text="回らない" size={40} t={seg(f, 30, 42)} color={C.graphRed} />
      <TagPlate x={1700} y={270} text="社会" size={72} t={seg(f, 24, 38)} color={C.graphRed} />
    </Frame>
  );
};

// ===== #204 日本にも、止めていたものがありました。 =====
// 格: 並
// どこ: 昭和初めの日本の街。★真正面からの立面 (遠近をやめる)。
//       足元の線も頭の線も完全な水平。どの棟も頭がぴたりとそろう = 百尺の天井が一目で分かる
// 演出: 幅も間合いもばらばらのビル5棟。遠近をやめたぶん立面を作り込む
//       (蛇腹・付け柱・窓の格子と窓台・看板帯・縞のテント・軒・ショーウィンドウ)。
//       隙間には瓦屋根の低い家。縦看板「百貨店」を1本
// 動き: 看板が風で揺れる → 頭のそろいをなぞる水平線が左から右へ引かれ、各棟へ垂を下ろす
//       → 見上げる人2人
const Kb5cNihonNiMo: React.FC<{ f: number }> = ({ f }) => {
  const TOPY = 380;            // ★すべての棟の頭。完全に水平にそろう
  const PARA = TOPY - 30;      // 屋上パラペットの上端
  const BASE = 838;            // 足元の線 (水平)
  const LINEY = 300;           // 頭のそろいをなぞる水平線
  const sweep = easeOut(seg(f, 10, 34));
  const reach = W * sweep;
  const sway = Math.sin(f / 16) * 1.8;
  // [左端x, 幅]。等間隔にしない。両端の棟は画面の外へ続く
  const BLD: [number, number][] = [[-40, 390], [460, 236], [800, 344], [1250, 250], [1600, 360]];
  const GAP: [number, number][] = [[350, 110], [696, 104], [1144, 106], [1500, 100]];
  const BANDC = ["#3E4B66", C.graphRed, "#3E4B66", BP.woodDark, C.graphRed];
  return (
    <Frame f={f} seed={825} bg={KRP.cream}>
      {/* 空 (遠近をやめたので、空も水平の帯で置く) */}
      <rect x={0} y={0} width={W} height={H} fill={C.paper} />
      <rect x={0} y={0} width={W} height={PARA + 26} fill={C.cityPale} opacity={0.45} />
      {[[520, 148, 1], [1470, 176, 0.78]].map(([cx, cy, s], i) => (
        <g key={i} opacity={0.42}>
          <ellipse cx={cx} cy={cy} rx={148 * s} ry={32 * s} fill={KRP.white} />
          <ellipse cx={cx - 68 * s} cy={cy + 12 * s} rx={92 * s} ry={24 * s} fill={KRP.white} />
        </g>
      ))}
      {/* 隙間に挟まる瓦屋根の低い家 (棟の列より奥。背が低いので天井に届いていない) */}
      {GAP.map(([hx, hw], i) => (
        <g key={i}>
          {/* 壁 (漆喰。空と同じ色にならないよう一段濃くする) */}
          <rect x={hx - 8} y={648} width={hw + 16} height={BASE - 648}
            fill={BP.shaft} stroke={KRP.ink} strokeWidth={5} />
          {/* 軒桁 (壁の上端を締める) */}
          <rect x={hx - 16} y={648} width={hw + 32} height={18}
            fill={BP.woodDark} stroke={KRP.ink} strokeWidth={4} />
          {/* 瓦屋根 */}
          <polygon points={`${hx - 32},648 ${hx + hw / 2},558 ${hx + hw + 32},648`}
            fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
          {Array.from({ length: 5 }, (_, k) => (
            <line key={k} x1={hx - 24 + k * ((hw + 48) / 4)} y1={648}
              x2={hx + hw / 2} y2={566} stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
          ))}
          {/* 暖簾 (白い割れ目を入れる) */}
          <rect x={hx + 2} y={700} width={hw + 2} height={34}
            fill={i % 2 ? "#3E4B66" : C.graphRed} stroke={KRP.ink} strokeWidth={4} />
          {[1, 2].map((k) => (
            <line key={k} x1={hx + 2 + ((hw + 2) / 3) * k} y1={706}
              x2={hx + 2 + ((hw + 2) / 3) * k} y2={732}
              stroke={KRP.white} strokeWidth={4} opacity={0.85} />
          ))}
          {/* 格子戸 */}
          <rect x={hx + 12} y={738} width={hw - 8} height={BASE - 738}
            fill={BP.woodLight} stroke={KRP.ink} strokeWidth={4} />
          {Array.from({ length: 4 }, (_, k) => (
            <line key={k} x1={hx + 12 + ((hw - 8) / 4) * (k + 0.5)} y1={740}
              x2={hx + 12 + ((hw - 8) / 4) * (k + 0.5)} y2={BASE - 2}
              stroke={KRP.ink} strokeWidth={2.5} opacity={0.5} />
          ))}
        </g>
      ))}
      {/* 鉄筋のビル5棟。★正面の立面。頭も足元も完全に水平 */}
      {BLD.map(([bx, bw], i) => {
        const cols = Math.max(2, Math.round(bw / 118));
        const colw = (bw - 52) / cols;
        const ww = colw - 24;
        const stripes = Math.max(4, Math.round(bw / 62));
        return (
          <g key={i}>
            {/* 本体 */}
            <rect x={bx} y={TOPY} width={bw} height={BASE - TOPY}
              fill={i % 2 ? C.cityPale : "#D4D9DC"} stroke={KRP.ink} strokeWidth={7} />
            {/* 付け柱 (1棟おき。立面の作り込み) */}
            {i % 2 === 0 && Array.from({ length: cols + 1 }, (_, c) => (
              <rect key={c} x={bx + 14 + c * colw - 7} y={TOPY + 30}
                width={14} height={BASE - TOPY - 180} fill={KRP.ink} opacity={0.1} />
            ))}
            {/* 窓 5段。格子と窓台つき */}
            {Array.from({ length: 5 }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const wx = bx + 26 + c * colw;
                const wy = TOPY + 54 + r * 60;
                return (
                  <g key={`${r}-${c}`}>
                    <rect x={wx} y={wy} width={ww} height={44}
                      fill={C.cityDark} stroke={KRP.ink} strokeWidth={3} opacity={0.85} />
                    <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + 44}
                      stroke={KRP.ink} strokeWidth={2.5} opacity={0.55} />
                    <line x1={wx} y1={wy + 18} x2={wx + ww} y2={wy + 18}
                      stroke={KRP.ink} strokeWidth={2} opacity={0.4} />
                    <rect x={wx - 6} y={wy + 44} width={ww + 12} height={7}
                      fill={KRP.white} stroke={KRP.ink} strokeWidth={2.5} />
                  </g>
                );
              }))}
            {/* 看板帯 */}
            <rect x={bx + 10} y={692} width={bw - 20} height={40}
              fill={BANDC[i]} stroke={KRP.ink} strokeWidth={5} />
            {Array.from({ length: Math.max(2, Math.round(bw / 92)) }, (_, k) => (
              <rect key={k} x={bx + 30 + k * 62} y={704} width={26} height={18}
                fill={KRP.white} opacity={0.85} />
            ))}
            {/* ショーウィンドウと入口 */}
            <rect x={bx + 14} y={772} width={bw - 28} height={BASE - 772}
              fill={BP.ironDark} stroke={KRP.ink} strokeWidth={4} opacity={0.88} />
            {Array.from({ length: Math.max(1, Math.round(bw / 110)) }, (_, k) => (
              <line key={k} x1={bx + 14 + (bw - 28) / Math.max(1, Math.round(bw / 110)) * (k + 1)}
                y1={774} x2={bx + 14 + (bw - 28) / Math.max(1, Math.round(bw / 110)) * (k + 1)}
                y2={BASE - 2} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
            ))}
            <rect x={bx + bw / 2 - 44} y={760} width={88} height={BASE - 760}
              fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
            {/* 軒 (テントを吊る梁) */}
            <rect x={bx - 10} y={734} width={bw + 20} height={14}
              fill={BP.woodDark} stroke={KRP.ink} strokeWidth={4} />
            {/* 縞のテント */}
            {Array.from({ length: stripes }, (_, k) => {
              const t0 = bx + 8 + (k * (bw - 16)) / stripes;
              const t1 = bx + 8 + ((k + 1) * (bw - 16)) / stripes;
              const b0 = bx - 6 + (k * (bw + 12)) / stripes;
              const b1 = bx - 6 + ((k + 1) * (bw + 12)) / stripes;
              return (
                <polygon key={k} points={`${t0},746 ${t1},746 ${b1},780 ${b0},780`}
                  fill={k % 2 ? (i === 2 ? "#3E4B66" : C.graphRed) : KRP.white}
                  stroke={KRP.ink} strokeWidth={3} />
              );
            })}
            {/* 屋上のパラペット (★ここが全棟そろう) */}
            <rect x={bx - 14} y={PARA} width={bw + 28} height={32}
              fill={C.cityDark} stroke={KRP.ink} strokeWidth={5} />
            {/* 蛇腹 */}
            <rect x={bx - 6} y={TOPY + 10} width={bw + 12} height={14}
              fill={C.cityDark} opacity={0.6} stroke={KRP.ink} strokeWidth={3} />
          </g>
        );
      })}
      {/* 縦看板を1本。風で揺れる */}
      <g transform={`rotate(${sway} 1088 392)`}>
        <rect x={1080} y={392} width={16} height={316} fill={BP.iron}
          stroke={KRP.ink} strokeWidth={4} />
        <rect x={1040} y={396} width={96} height={300} rx={8}
          fill={C.graphRed} stroke={KRP.ink} strokeWidth={6} />
        {["百", "貨", "店"].map((ch, i) => (
          <text key={i} x={1088} y={476 + i * 88} textAnchor="middle" fontFamily={FONT}
            fontWeight={900} fontSize={66} fill={KRP.white}>{ch}</text>
        ))}
      </g>
      {/* 通り。立面なので水平の帯 */}
      <rect x={0} y={BASE} width={W} height={H - BASE} fill={BP.shaftDark} />
      <rect x={0} y={BASE} width={W} height={18} fill={C.cityDark}
        stroke={KRP.ink} strokeWidth={4} />
      {/* 市電の軌道。水平に通る */}
      {[0, 1].map((k) => (
        <rect key={k} x={0} y={944 + k * 58} width={W} height={12}
          fill={BP.iron} stroke={KRP.ink} strokeWidth={3} opacity={0.6} />
      ))}
      {/* ★頭のそろいをなぞる水平線。各棟へ垂を下ろす */}
      <line x1={0} y1={LINEY} x2={reach} y2={LINEY}
        stroke={KRP.ink} strokeWidth={6} strokeDasharray="22 14" opacity={0.85} />
      {BLD.map(([bx, bw], i) => {
        const cx = bx + bw / 2;
        return reach > cx ? (
          <line key={i} x1={cx} y1={LINEY} x2={cx} y2={PARA}
            stroke={KRP.ink} strokeWidth={4} opacity={0.55} />
        ) : null;
      })}
      {/* ★見上げる人2人。字幕の黒帯 (上端854) より上に体が収まる位置・大きさにする */}
      <Person x={430} y={846} s={0.86} f={f} cloth="#5A4A36" clothDark="#42341F"
        hair="cap" gaze={[1, -4]} lean={-3} face="surprised" />
      <Person x={1292} y={842} s={0.74} f={f} phase={3} cloth="#3E4B66" clothDark="#2E3850"
        gaze={[-2, -4]} lean={4} />
      <TagPlate x={1060} y={240} text="頭がそろっている" size={48} t={seg(f, 24, 38)} />
      <TagPlate x={248} y={240} text="昭和の初め" size={40} t={seg(f, 2, 14)} />
    </Frame>
  );
};

// ===== #205 31メートルという、高さの上限です。 =====
// 格: 山
// どこ: ★路上から真上へ見上げたカメラ (この章で唯一の見上げ)。壁が上へすぼまっていく
// 演出: 31mのところに赤い線が端から端まで走り、ビルの頭がそこでぴたりと切り揃う。
//       線を越えていた塔屋だけが切り落とされて落ちていく。左に高さの物差しを遠近つきで立てる。
//       右手前に街灯が斜めに伸び、電線が空を横切る。歩道に見上げる人を2人
// 動き: 赤い線が左から右へ走る → 塔屋が切られて落ちる → 雲が流れる → 31mの札
const Kb5cN31mNoJougen: React.FC<{ f: number }> = ({ f }) => {
  const VPX = 960, VPY = -760;         // 見上げたときに縦線が集まる点 (画面の上の外)
  const GY = 790, LIM = 158;           // 足元の線 / 31m の線
  const kAt = (y: number) => (y - VPY) / (GY - VPY);
  const xAt = (xb: number, y: number) => VPX + (xb - VPX) * kAt(y);
  /** 高さ(m) → 画面の y。見上げているので上へ行くほど詰まる */
  const yOf = (m: number) => {
    const t = m / 31;
    return GY - (GY - LIM) * (t * (1.26 - 0.26 * t));
  };
  const sweep = easeOut(seg(f, 4, 26));
  const lineX = -40 + (W + 120) * sweep;
  const EDGES = [0, 430, 900, 1430, 1920];     // 足元での棟の境目 (等間隔にしない)
  const cutTop = lineX > 1110;                 // 塔屋が切られたか
  const fall = easeOut(clamp01((lineX - 1110) / 300));
  return (
    <Frame f={f} seed={826} bg={KRP.cream}>
      {/* 空 (見上げているので画面のほとんどが空と壁) */}
      <rect x={0} y={0} width={W} height={H} fill={C.paper} />
      <rect x={0} y={0} width={W} height={420} fill={C.cityPale} opacity={0.5} />
      {/* 流れる雲 */}
      {[[0.0, 70, 120], [0.45, 250, 90], [0.78, 40, 70]].map(([p, cy, r], i) => {
        const cx = ((p as number) * W + f * 2.2) % (W + 520) - 260;
        return (
          <g key={i} opacity={0.5}>
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={cx + k * (r as number) * 0.9} cy={(cy as number) + (k % 2) * 16}
                r={(r as number) * (k === 1 ? 1.15 : 0.85)} fill={KRP.white}
                stroke={KRP.ink} strokeWidth={4} opacity={0.75} />
            ))}
          </g>
        );
      })}
      {/* ビルの壁。足元は端から端まで、上へ行くほどすぼまる */}
      {EDGES.slice(0, -1).map((a, i) => {
        const b = EDGES[i + 1];
        const cols = 4;
        return (
          <g key={i}>
            <polygon points={`${a},${GY} ${b},${GY} ${xAt(b, LIM)},${LIM} ${xAt(a, LIM)},${LIM}`}
              fill={i % 2 ? C.cityPale : "#D2D8DC"} stroke={KRP.ink} strokeWidth={7} />
            {/* 窓。上の段ほど詰まって小さくなる */}
            {[3, 7, 11, 15, 19, 23, 27].map((m, r) => {
              const yb = yOf(m), yt = yOf(m + 2.4);
              return (
                <g key={r}>
                  {Array.from({ length: cols }, (_, c) => {
                    const wa = a + 40 + c * ((b - a - 80) / cols);
                    const wb = wa + (b - a - 80) / cols - 34;
                    return (
                      <polygon key={c}
                        points={`${xAt(wa, yb)},${yb} ${xAt(wb, yb)},${yb} ${xAt(wb, yt)},${yt} ${xAt(wa, yt)},${yt}`}
                        fill={C.cityDark} stroke={KRP.ink} strokeWidth={3} opacity={0.78} />
                    );
                  })}
                </g>
              );
            })}
            {/* 1階の看板 (横一本につなげない。人を横切る帯になるので、棟ごとに短く切る) */}
            <g>
              <rect x={a + (b - a) * 0.3} y={yOf(5.6)} width={(b - a) * 0.4} height={26}
                fill={BP.woodDark} stroke={KRP.ink} strokeWidth={5} />
              <rect x={a + (b - a) * 0.36} y={yOf(5.6) - 34} width={(b - a) * 0.28} height={34}
                fill={C.paper} stroke={KRP.ink} strokeWidth={4} opacity={0.9} />
            </g>
            {/* 屋上のパラペット */}
            <polygon points={`${xAt(a - 6, LIM + 26)},${LIM + 26} ${xAt(b + 6, LIM + 26)},${LIM + 26} ${xAt(b + 6, LIM)},${LIM} ${xAt(a - 6, LIM)},${LIM}`}
              fill={C.cityDark} stroke={KRP.ink} strokeWidth={5} />
          </g>
        );
      })}
      {/* 31mを越えていた塔屋。線が通ると切り落とされて落ちていく */}
      <g opacity={cutTop ? 1 - fall * 0.9 : 1}
        transform={cutTop ? `translate(${fall * 70} ${fall * 520}) rotate(${fall * 24} 1108 100)` : undefined}>
        <polygon points={`${xAt(1120, LIM)},${LIM} ${xAt(1300, LIM)},${LIM} ${xAt(1300, 40)},40 ${xAt(1120, 40)},40`}
          fill={C.cityPale} stroke={KRP.ink} strokeWidth={6} />
        <rect x={xAt(1150, 90)} y={78} width={xAt(1270, 90) - xAt(1150, 90)} height={36}
          fill={C.cityDark} stroke={KRP.ink} strokeWidth={4} opacity={0.8} />
      </g>
      {/* ★31mの赤い線。端から端まで走る */}
      <g>
        <line x1={-40} y1={LIM} x2={lineX} y2={LIM}
          stroke={C.graphRed} strokeWidth={14} strokeLinecap="round" />
        {sweep < 1 && (
          <circle cx={lineX} cy={LIM} r={20} fill={KRP.yellow}
            stroke={KRP.ink} strokeWidth={5} />
        )}
      </g>
      {/* 左の高さの物差し。見上げているので斜めに倒れて見える */}
      <g opacity={clamp01(seg(f, 0, 12))}>
        <line x1={xAt(70, GY)} y1={GY} x2={xAt(70, LIM)} y2={LIM} stroke={KRP.ink} strokeWidth={8} />
        {Array.from({ length: 32 }, (_, m) => (
          <line key={m} x1={xAt(56, yOf(m))} y1={yOf(m)} x2={xAt(92, yOf(m))} y2={yOf(m)}
            stroke={KRP.ink} strokeWidth={2.5} opacity={0.55} />
        ))}
        {[0, 10, 20, 30].map((m) => (
          <g key={m}>
            <line x1={xAt(34, yOf(m))} y1={yOf(m)} x2={xAt(128, yOf(m))} y2={yOf(m)}
              stroke={KRP.ink} strokeWidth={5} />
            <text x={xAt(150, yOf(m))} y={yOf(m) - 12} fontFamily={FONT} fontWeight={900}
              fontSize={34 - m * 0.3} fill={KRP.ink} stroke={C.paper} strokeWidth={6}
              paintOrder="stroke">{m}m</text>
          </g>
        ))}
      </g>
      {/* 空を横切る電線 (見上げの印) */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M -20 ${300 + i * 58} Q 960 ${212 + i * 50} 1940 ${86 + i * 44}`}
          fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />
      ))}
      {/* 右手前の街灯。斜めに立ち上がって奥行きを作る */}
      <g>
        <polygon points={`${xAt(1684, H)},${H} ${xAt(1716, H)},${H} ${xAt(1716, 300)},300 ${xAt(1684, 300)},300`}
          fill={BP.ironDark} stroke={KRP.ink} strokeWidth={5} />
        <polygon points={`${xAt(1640, 300)},300 ${xAt(1760, 300)},300 ${xAt(1744, 252)},252 ${xAt(1656, 252)},252`}
          fill={BP.iron} stroke={KRP.ink} strokeWidth={5} />
        <rect x={xAt(1668, 240)} y={210} width={xAt(1732, 240) - xAt(1668, 240)} height={44}
          fill={KRP.yellow} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      </g>
      {/* 通り (手前へ末広がり) */}
      <rect x={0} y={GY} width={W} height={H - GY} fill={BP.shaftDark} />
      <rect x={0} y={GY} width={W} height={18} fill={C.cityDark} stroke={KRP.ink} strokeWidth={4} />
      {[260, 620, 1300, 1660].map((bx, i) => (
        <line key={i} x1={bx} y1={GY + 18} x2={960 + (bx - 960) * 2.6} y2={H}
          stroke={BP.ironDark} strokeWidth={5} opacity={0.3} />
      ))}
      {/* ★見上げる2人。足元を y=822 までに留めて、体ぜんぶが黒帯の上に出るようにする */}
      <Person x={430} y={822} s={0.98} f={f} cloth="#3E4B66" clothDark="#2E3850"
        gaze={[1, -5]} lean={-4} face="surprised" />
      <Person x={1520} y={800} s={0.74} f={f} phase={3} cloth="#6A5B45" clothDark="#4E4332"
        gaze={[-2, -5]} lean={3} face="worried" />
      {/* 隅のバッジ (上端〜y=120) に隠れない高さに置く */}
      <TagPlate x={700} y={248} text="31m" size={80} t={seg(f, 26, 40)} color={C.graphRed} />
      <TagPlate x={1490} y={78} text="高さの上限" size={40} t={seg(f, 30, 42)} />
      <TagPlate x={1762} y={252} text="東京" size={44} t={seg(f, 2, 14)} />
    </Frame>
  );
};

// ===== #206 もとは百尺。1919年に決まりました。 =====
// 格: 図
// どこ: 方眼紙の上。尺の物差しを縦に大きく立てる (画面の高さの6割以上)。人も背景も置かない
// 演出: 1尺ごとの刻み・10尺ごとの数字・木口・真鍮の口金まで描く。
//       100尺のところに太い印と「百尺＝30.3m」。右に百尺の建物を1棟だけ添える。1919年の札
// 動き: 物差しが下から立ち上がる → 100尺の印が走る → 建物が伸びて頭が100尺にそろう
const Kb5cHyakushaku1919: React.FC<{ f: number }> = ({ f }) => {
  const y100 = shakuY(100);
  const GY = RULER.y0;                       // 床の線 (物差しの下端とそろえる)
  const dim = easeOut(seg(f, 30, 42));       // 右の寸法線が伸びる
  return (
    <Frame f={f} seed={827} bg={KRP.cream}>
      <GridPaper pitch={60} opacity={0.12} />
      {/* ★床。物差しも建物もここに立つ (前は下端が空中で切れて浮いていた) */}
      <rect x={0} y={GY} width={W} height={H - GY} fill="#D8CDBC" />
      <line x1={0} y1={GY} x2={W} y2={GY} stroke={KRP.ink} strokeWidth={7} />
      {/* 床の板目 (奥へ少し広がる線) */}
      {[0.16, 0.34, 0.54, 0.76].map((p, i) => (
        <line key={i} x1={W * p} y1={GY} x2={W * p - 60 + 150 * p} y2={H}
          stroke={BP.woodDark} strokeWidth={3} opacity={0.22} />
      ))}
      {/* 影 (物差し・建物) */}
      <ellipse cx={RULER.x + 30} cy={GY + 16} rx={160} ry={20} fill={C.mapLine} opacity={0.26} />
      <ellipse cx={1390} cy={GY + 18} rx={300} ry={24} fill={C.mapLine} opacity={0.26} />
      <ShakuRuler f={f} t={seg(f, 0, 16)} />
      {/* ★建物を大きくして、すかすかだった右半分を埋める */}
      <HyakushakuBldg x={1150} w={480} t={seg(f, 12, 30)} floors={10} />
      {/* 100尺の印。物差しから建物の頭まで一本に通す */}
      <line x1={356} y1={y100} x2={356 + (1700 - 356) * easeOut(seg(f, 16, 34))} y2={y100}
        stroke={C.graphRed} strokeWidth={10} strokeLinecap="round" />
      <circle cx={430} cy={y100} r={15} fill={C.graphRed} stroke={KRP.ink} strokeWidth={5}
        opacity={clamp01(seg(f, 16, 24))} />
      <text x={620} y={y100 - 26} fontFamily={FONT} fontWeight={900} fontSize={54}
        fill={C.graphRed} opacity={clamp01(seg(f, 22, 34))}>100</text>
      {/* ★右端の縦の寸法線 (床 → 100尺)。空いていた右端を使う */}
      <g opacity={clamp01(seg(f, 30, 40))}>
        <line x1={1770} y1={GY} x2={1770} y2={lerp(GY, y100, dim)}
          stroke={KRP.ink} strokeWidth={6} />
        <line x1={1738} y1={GY} x2={1802} y2={GY} stroke={KRP.ink} strokeWidth={6} />
        <line x1={1738} y1={y100} x2={1802} y2={y100} stroke={KRP.ink} strokeWidth={6}
          opacity={clamp01(seg(f, 38, 42))} />
        <text x={1826} y={(GY + y100) / 2} fontFamily={FONT} fontWeight={900} fontSize={44}
          fill={KRP.ink} transform={`rotate(-90 1826 ${(GY + y100) / 2})`} textAnchor="middle"
          stroke={KRP.cream} strokeWidth={7} paintOrder="stroke">30.3m</text>
      </g>
      <TagPlate x={860} y={y100 + 70} text="百尺 ＝ 30.3m" size={52} t={seg(f, 26, 40)} color={C.graphRed} />
      <TagPlate x={846} y={98} text="1919年" size={56} t={seg(f, 30, 42)} />
      <TagPlate x={1176} y={98} text="決まった" size={38} t={seg(f, 34, 42)} />
    </Frame>
  );
};

// ===== #207 きっちり30メートルでは、どうなるか。 =====
// 格: 並
// どこ: ★百尺ビルの屋上に乗った寄りのカメラ (#206 の真横の図から、場所そのものを変える)
// 演出: 1m = 180px の寄り。笠木の天端が 30.3m (y=430)、屋上の床が 29.3m。
//       きっちり30.0m の青い線を引くと、笠木の上 0.3m ぶん (54px) だけが線から出る。
//       そこを赤く塗り、0.3m の寸法を立てる。屋上に立つ人の頭ひとつぶんが 0.3m。
// 動き: 青い線が左から右へ引かれる → はみ出た 0.3m が赤くなる → 人が笠木を見る → 寸法が出る
const Kb5cKikkari30m: React.FC<{ f: number }> = ({ f }) => {
  const PX = 260;                        // 1m = 260px (この寄りの縮尺)
  const TOP = 400;                       // 笠木の天端 = 30.3m (百尺)
  const Y30 = TOP + 0.3 * PX;            // きっちり 30.0m = 478
  const DECK = 660;                       // 屋上の床 (= 29.3m。笠木の高さ1m = 260px)
  const draw = easeOut(seg(f, 2, 22));
  const red = clamp01(seg(f, 22, 32));
  const lineX = -40 + (W + 80) * draw;
  return (
    <Frame f={f} seed={828} bg="#D6E3EB">
      {/* ===== 空 ===== */}
      <rect x={0} y={0} width={W} height={TOP + 40} fill="#D6E3EB" />
      <rect x={0} y={0} width={W} height={220} fill="#C3D6E2" opacity={0.7} />
      {/* 雲 (横へ流れる) */}
      {[[0.05, 110, 1.0], [0.46, 62, 0.74], [0.78, 176, 0.88]].map(([p, cy, sc], i) => {
        const cx = (((p as number) * W + f * 2.0) % (W + 520)) - 260;
        return (
          <g key={i} opacity={0.9} transform={`translate(${cx} ${cy}) scale(${sc})`}>
            <ellipse cx={0} cy={0} rx={132} ry={44} fill={KRP.white} />
            <ellipse cx={-92} cy={16} rx={84} ry={32} fill={KRP.white} />
            <ellipse cx={96} cy={14} rx={74} ry={28} fill={KRP.white} />
          </g>
        );
      })}
      {/* 遠くの同じ高さの屋根が、笠木の向こうに少しだけ顔を出す */}
      {[[1486, 86], [1662, 54], [1810, 100]].map(([bx, bh], i) => (
        <g key={i}>
          <rect x={bx} y={TOP - (bh as number)} width={120} height={bh as number}
            fill={C.cityPale} stroke={KRP.ink} strokeWidth={5} opacity={0.92} />
          <rect x={(bx as number) + 24} y={TOP - (bh as number) + 22} width={30} height={26}
            fill={C.cityDark} stroke={KRP.ink} strokeWidth={3} opacity={0.7} />
        </g>
      ))}
      {/* 電線が1本、空を横切る */}
      <path d={`M -20 232 Q 700 ${300 + Math.sin(f / 15) * 8} 1920 196`}
        fill="none" stroke={KRP.ink} strokeWidth={4} opacity={0.5} />

      {/* ===== 屋上の床 ===== */}
      <rect x={0} y={DECK} width={W} height={H - DECK} fill="#A9A49B" />
      <rect x={0} y={DECK} width={W} height={22} fill="#BDB8AE" />
      {/* 防水の継ぎ目 (手前へ広がる) */}
      {[0.14, 0.33, 0.54, 0.74, 0.92].map((p, i) => (
        <line key={i} x1={W * p} y1={DECK} x2={W * p + (p - 0.5) * 320} y2={H}
          stroke={KRP.ink} strokeWidth={3} opacity={0.2} />
      ))}
      <line x1={0} y1={DECK + 120} x2={W} y2={DECK + 132} stroke={KRP.ink} strokeWidth={3} opacity={0.18} />

      {/* ===== パラペット (笠木) ===== */}
      {/* 内側の面 (こちらを向いている壁) */}
      <rect x={-20} y={TOP + 44} width={1460} height={DECK - TOP - 44}
        fill={C.cityPale} stroke={KRP.ink} strokeWidth={6} />
      {/* 壁の継ぎ目 */}
      {[260, 620, 980, 1320].map((x, i) => (
        <line key={i} x1={x} y1={TOP + 46} x2={x} y2={DECK - 2}
          stroke={KRP.ink} strokeWidth={3} opacity={0.3} />
      ))}
      {/* 水はけの穴 */}
      {[420, 1140].map((x, i) => (
        <rect key={i} x={x} y={DECK - 52} width={54} height={40} rx={6}
          fill={C.streetDark} stroke={KRP.ink} strokeWidth={4} />
      ))}
      {/* 笠木 (天端 = 30.3m)。厚み 44px */}
      <rect x={-20} y={TOP} width={1460} height={44}
        fill={C.cityDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 奥へ折れるパラペット (右の角) */}
      <polygon points={`1440,${TOP + 44} 1712,${TOP + 106} 1712,${DECK + 6} 1440,${DECK}`}
        fill={C.cityPale} stroke={KRP.ink} strokeWidth={6} />
      <polygon points={`1440,${TOP} 1712,${TOP + 62} 1712,${TOP + 106} 1440,${TOP + 44}`}
        fill={C.cityDark} stroke={KRP.ink} strokeWidth={6} />
      {/* 床と壁のすき間の影 */}
      <rect x={0} y={DECK - 14} width={1440} height={16} fill={KRP.ink} opacity={0.16} />

      {/* ===== はみ出た 0.3m を赤く塗る ===== */}
      <g opacity={red}>
        <rect x={-20} y={TOP} width={1460} height={Y30 - TOP}
          fill={C.graphRed} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
        <polygon points={`1440,${TOP} 1712,${TOP + 62} 1712,${TOP + 62 + (Y30 - TOP)} 1440,${Y30}`}
          fill={C.graphRed} stroke={KRP.ink} strokeWidth={6} opacity={0.9} />
      </g>

      {/* ===== きっちり30.0m の線 (左から引かれる) ===== */}
      {/* 赤い帯の下端に重なるので、白い縁を敷いて青を必ず見せる */}
      <line x1={-40} y1={Y30} x2={lineX} y2={Y30}
        stroke={KRP.white} strokeWidth={26} strokeLinecap="round" />
      <line x1={-40} y1={Y30} x2={lineX} y2={Y30}
        stroke={C.graphBlue} strokeWidth={14} strokeLinecap="round" />
      <circle cx={lineX} cy={Y30} r={16} fill={C.gold} stroke={KRP.ink} strokeWidth={5}
        opacity={draw < 1 ? 1 : 0} />
      {/* 30.3m / 30.0m の目印 (右端) */}
      <g opacity={clamp01(seg(f, 26, 38))}>
        <line x1={1712} y1={TOP + 62} x2={1900} y2={TOP + 62}
          stroke={C.graphRed} strokeWidth={7} strokeDasharray="16 12" />
        <text x={1744} y={TOP + 38} fontFamily={FONT} fontWeight={900} fontSize={40}
          fill={C.graphRed} stroke="#D6E3EB" strokeWidth={7} paintOrder="stroke">30.3m</text>
        <text x={1744} y={TOP + 62 + (Y30 - TOP) + 50} fontFamily={FONT} fontWeight={900} fontSize={40}
          fill={C.graphBlue} stroke="#A9A49B" strokeWidth={7} paintOrder="stroke">30.0m</text>
      </g>

      {/* ===== 0.3m の寸法 ===== */}
      <g opacity={clamp01(seg(f, 30, 40))}>
        <line x1={560} y1={TOP} x2={560} y2={Y30} stroke={KRP.ink} strokeWidth={7} />
        <polygon points={`560,${TOP} 548,${TOP + 26} 572,${TOP + 26}`} fill={KRP.ink} />
        <polygon points={`560,${Y30} 548,${Y30 - 26} 572,${Y30 - 26}`} fill={KRP.ink} />
        <line x1={512} y1={TOP} x2={608} y2={TOP} stroke={KRP.ink} strokeWidth={5} />
        <line x1={512} y1={Y30} x2={608} y2={Y30} stroke={KRP.ink} strokeWidth={5} />
        <line x1={560} y1={TOP} x2={548} y2={322} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
      </g>

      {/* ===== 屋上に立つ人 (0.3m が頭ひとつぶんだと分かる) ===== */}
      {/* 1m = 260px。身長1.7m ≒ 440px。頭が笠木 (30.3m) の上に出る。
          足元は床の手前 (y=806)。字幕の黒帯 (上端854) より上に全身が入る */}
      <Person x={1240} y={806} s={1.44} f={f} cloth="#3E4B66" clothDark="#2E3850"
        gaze={[-3, -2]} lean={-3} face="surprised" />
      {/* 左の塔屋 (階段室)。床に立っているので壁より手前に描く */}
      <g>
        <rect x={-40} y={344} width={372} height={468} fill={C.cityPale}
          stroke={KRP.ink} strokeWidth={7} />
        <rect x={-60} y={320} width={412} height={34} fill={C.cityDark}
          stroke={KRP.ink} strokeWidth={6} />
        {/* 扉 */}
        <rect x={110} y={540} width={150} height={272} fill={BP.woodDark}
          stroke={KRP.ink} strokeWidth={6} />
        <circle cx={232} cy={682} r={11} fill={BP.brass} stroke={KRP.ink} strokeWidth={4} />
        {/* 小窓 */}
        <rect x={34} y={408} width={92} height={70} fill={C.cityDark}
          stroke={KRP.ink} strokeWidth={5} opacity={0.85} />
        <line x1={80} y1={408} x2={80} y2={478} stroke={KRP.ink} strokeWidth={4} opacity={0.6} />
        {/* 壁の目地 */}
        {[0, 1].map((i) => (
          <line key={i} x1={-40} y1={620 + i * 86} x2={332} y2={620 + i * 86}
            stroke={KRP.ink} strokeWidth={3} opacity={0.22} />
        ))}
      </g>
      {/* 手前の換気塔 (奥行きを出す) */}
      <g>
        <rect x={1536} y={656} width={330} height={172} fill={C.cityPale}
          stroke={KRP.ink} strokeWidth={6} />
        <rect x={1512} y={628} width={378} height={32} fill={C.cityDark}
          stroke={KRP.ink} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={1560} y1={700 + i * 36} x2={1842} y2={700 + i * 36}
            stroke={KRP.ink} strokeWidth={5} opacity={0.6} />
        ))}
        <Rivets x1={1552} y1={644} x2={1850} y2={644} n={6} r={5} fill={BP.brassDark} />
      </g>
      {/* はみ出た帯への指差し */}
      <Arrow x={1032} y={Y30 + 16} s={0.8} rot={-90} t={seg(f, 34, 42)} />
      {/* 赤い帯の上 (空) に置く。帯の中だと赤同士で消える */}
      <XMark x={880} y={322} s={0.5} t={seg(f, 36, 42)} />

      <TagPlate x={520} y={262} text="0.3m はみ出る" size={46} t={seg(f, 32, 42)} color={C.graphRed} />
      <TagPlate x={1670} y={126} text="きっちり30m" size={40} t={seg(f, 6, 18)} color={C.graphBlue} />
      <TagPlate x={700} y={772} text="屋上" size={38} t={seg(f, 2, 14)} />
    </Frame>
  );
};

// ===== SCENES-ANCHOR =====

const SCENES: Record<string, (f: number) => React.ReactElement> = {
  kb5_2020_1733tou: (f) => <Kb5cN2020_1733Tou f={f} />,
  kb5_tomatta_jiki: (f) => <Kb5cTomattaJiki f={f} />,
  kb5_1940_11tou: (f) => <Kb5cN1940_11Tou f={f} />,
  kb5_kyoukou_to_sensou: (f) => <Kb5cKyoukouToSensou f={f} />,
  kb5_shakai_ga_tometa: (f) => <Kb5cShakaiGaTometa f={f} />,
  kb5_nihon_ni_mo: (f) => <Kb5cNihonNiMo f={f} />,
  kb5_31m_no_jougen: (f) => <Kb5cN31mNoJougen f={f} />,
  kb5_hyakushaku_1919: (f) => <Kb5cHyakushaku1919 f={f} />,
  kb5_kikkari_30m: (f) => <Kb5cKikkari30m f={f} />,
};

export const K_B5C_MOTIFS: string[] = [
  "kb5_2020_1733tou",       // #199 2020年には、1733棟になりました。
  "kb5_tomatta_jiki",       // #200 ただし、途中で止まった時期があります。
  "kb5_1940_11tou",         // #201 1940年から1950年の10年間は、11棟のまま。
  "kb5_kyoukou_to_sensou",  // #202 大恐慌と、戦争です。
  "kb5_shakai_ga_tometa",   // #203 技術が止めたのではなく、社会が止めたんです。
  "kb5_nihon_ni_mo",        // #204 日本にも、止めていたものがありました。
  "kb5_31m_no_jougen",      // #205 31メートルという、高さの上限です。
  "kb5_hyakushaku_1919",    // #206 もとは百尺。1919年に決まりました。
  "kb5_kikkari_30m",        // #207 きっちり30メートルでは、どうなるか。
];

export const kosoB5cScene = (motif: string, f: number): React.ReactElement | null =>
  SCENES[motif]?.(f) ?? null;
