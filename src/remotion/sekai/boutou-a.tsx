// つながる世界史・冒頭3分 / 担当A = 文#1〜#10
//
// 約束 (ここを外すと全部やり直しになる):
//  1. 1つの関数が1文ぶんの絵。<svg viewBox="0 0 1920 1080"> の中身だけを返す (SekaiArt)。
//     div / AbsoluteFill は使わない。字幕帯と通知カードは外側の枠が足す。
//  2. 背景は必ず敷く。WarmStage か SekaiMap か SekaiGlobe のどれかで画面を埋める。
//     素のクリーム地＋方眼は0枚 (制作ガイド第16条)。
//  3. 主役は短辺の半分 (540px) 以上。小さい物を画面の真ん中にポツンと置くのが最悪の失敗。
//  4. ★2026-11-09 改定 (作者が作り込み版の絵を全面却下したため)。
//     旧:「実在の人物の顔は描かない。逆光の黒い影＋金のリムライトで処理する。」
//     作者の言葉 ──「人のシルエットもいやだから具体的に描いて。
//     時代検証しながらちゃんとわかりやすい格好をさせよう」。
//     よって無貌の黒い影は禁止。ShadeFigure / GhostFigure は廃止した。
//     ・庶民には目・眉・鼻・口・耳を描き、汗や涙や口の開きで反応させる
//     ・実在の著名人は「所作と装い」で見せる。似顔絵にしない。ただし黒く潰すのも禁止。
//       布と肌に色を入れたうえで、うつむき・横顔・後ろ姿・見切れで顔を見せない
//     ・群衆には必ず老若男女を混ぜ、服を性別と立場で変える
//     ・同じ Hito を全部の枚で使い回さない (同じ顔が並ぶと作者の嫌う「AIっぽさ」になる)。
//       構造だけ真似て、その枚の人をその枚で描く
//  5. 必ず f で動く。出しっぱなしの静止画は作らない。
//  6. 色は world.tsx の WP から取る。無い物の色は WP の末尾に
//     「物の名前」のキーで足してよい (他の枚が使い回せるようにするため)。
//     画面全体に色フィルタを掛けるのは禁止。物ごとに本当の色を置く。
//  7. uid は関数ごとに別の文字列にする。defs の id がぶつかると他の絵が壊れる。
//  8. 紙目・かすれ・線の揺れは SekaiScenes.tsx の InkLayer が全部の絵に掛けている。
//     各絵に書き足さない。
//  9. 全景 (人が小さい遠景) は3枚に1枚まで。この担当では #8 と #10 だけ。

import React from "react";
import { SKP, SEKAI_SERIF, YearTag, Cam, seg, easeOut, easeInOut, W, H } from "./parts";
import {
  WP,
  WarmStage,
  SekaiChrono,
  mp,
  MAP_LAND,
  type MapLand,
  type SekaiArt,
} from "./world";
import { SekaiBoutouArt } from "./SekaiBoutou";

// ===================================================================
// この担当の枚だけで使う色 (WP の台帳に無いもの)
// ===================================================================
// world.tsx は4人で共有していて書き換え禁止なので、足りない色はここに置く。
// 夜の地球・宇宙・白い紙・地図の陸は、琥珀の室内灯とは別の色でないと物に見えない。
const SPACE = "#05070F"; // 宇宙の黒
const EARTH_LOW = "#050A1C"; // 夜の地球の下側 (灯のない海)
const ATMOS = "#2E6FA8"; // 大気の薄い層 (指示書どおり)
const ATMOS_LIT = "#5FA3D8"; // 大気のふち。球を宇宙から起こす一本
const CLOUD_NIGHT = "#8FB4D8"; // 夜の地球にかかる雲
const MOONLIGHT = "#BFD6EE"; // 宇宙側の光源 (障子の琥珀の代わり)
const PAPER_SHADE = "#C9C3B4"; // 白い紙の影側 (指示書どおり)
const LAND_GREEN = "#2F3A30"; // 地図の陸・暗い緑灰 (指示書どおり)
const LAND_EDGE = "#55634F"; // 海岸線。金ではなく草の色の側へ
const SEA_GRID = "#8FB4D8"; // 緯度経度の罫 (青灰)
const SEA_VIG = "#04131F"; // 地図の四隅を沈める紺
const DESK_SHADE = "#060C16"; // 青い地図に照らされた机の影。WP.shadowDeep (#120C09) は茶黒なので使わない
const NIGHT_DEEP = "#03060F"; // 夜の枚の周辺減光。WP.deep (#120D08) は茶黒なので使わない
const DUST_COOL = "#C8DCF2"; // 宇宙・夜の埃 (琥珀の埃は室内の色)

// ペルシア語の書体。#9 のペルシア暦と #10 の看板で使う。
// 別紙A「書体は角張らせない」= ナスフ体寄り。角張ったクーフィー体に落ちないよう
// ナスフ体を先に並べ、最後に serif を置いて Chromium の字体の取り替えに任せる。
const PERSIAN = "'Geeza Pro', 'Noto Naskh Arabic', 'Noto Sans Arabic', 'Scheherazade New', serif";

// ===================================================================
// 夜の舞台 NightStage   #1 / #3
// (#2 は朝の卓の寄り、#9 は真上から見た机になったので WarmStage に移した)
// ===================================================================
// world.tsx の WarmStage と同じ形・同じ f のタイミングの写しで、
// 周辺減光と埃だけを茶から紺に入れ替えたもの。
// WarmStage は四隅を茶黒 (#120D08) で沈め、埃を琥珀 (#FFE9BC) で撒くので、
// 夜空や宇宙の枚だと画面の縁がうっすら茶に転ぶ。glow/bg の prop では直せない。
// (WarmStage は4人で共有していて書き換え禁止。指示書の「その枚のなかで背景を直接描いてよい」)
const shaft = (sx: number, sy: number, top: number, lean: number, spread: number) =>
  `M ${sx - top},${sy} L ${sx + top},${sy}
   L ${sx + lean + spread},${H} L ${sx + lean - spread},${H} Z`;

const NightStage: React.FC<{
  f: number;
  uid: string;
  src?: [number, number];
  srcR?: number;
  glow?: string;
  bg?: string;
  shafts?: boolean;
  motes?: number;
  vig?: number;
  children: React.ReactNode;
}> = ({
  f,
  uid,
  src = [960, 180],
  srcR = 760,
  glow = MOONLIGHT,
  bg = SPACE,
  shafts = true,
  motes = 30,
  vig = 0.8,
  children,
}) => {
  const up = easeOut(seg(f, 0, 26));
  const [sx, sy] = src;
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-src`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity={0.5} />
          <stop offset="46%" stopColor={glow} stopOpacity={0.18} />
          <stop offset="100%" stopColor={glow} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-vig`} cx="50%" cy="42%" r="74%">
          <stop offset="50%" stopColor={NIGHT_DEEP} stopOpacity={0} />
          <stop offset="100%" stopColor={NIGHT_DEEP} stopOpacity={vig} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={bg} />
      <circle cx={sx} cy={sy} r={srcR} fill={`url(#${uid}-src)`} opacity={up} />
      {children}
      {shafts && (
        <g opacity={easeOut(seg(f, 6, 46))}>
          <path d={shaft(sx - 300, sy, 190, -320, 430)} fill={glow} opacity={0.15} />
          <path d={shaft(sx + 300, sy, 180, 380, 420)} fill={glow} opacity={0.13} />
          <path d={shaft(sx, sy, 90, -60, 160)} fill={glow} opacity={0.09} />
        </g>
      )}
      {motes > 0 && (
        <g opacity={easeOut(seg(f, 14, 60)) * 0.42}>
          {Array.from({ length: motes }, (_, i) => {
            const px = 160 + ((i * 251) % 1600);
            const py = 140 + ((i * 437 + f * 0.7) % 860);
            return (
              <circle key={i} cx={px} cy={py} r={i % 3 === 0 ? 3.2 : 2} fill={DUST_COOL} />
            );
          })}
        </g>
      )}
      <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-vig)`} />
    </>
  );
};

// 地球の弧の中心と半径。world.tsx の SekaiGlobe と同じ値の写し (読み取り専用)
const GR = 1400,
  GCX = 960,
  GCY = 1520;
const gpt = (deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [GCX + GR * Math.sin(a), GCY - GR * Math.cos(a)];
};

// 生成りの名札。world.tsx の LandPlate の写し (字形を揃えるため)
const Plate: React.FC<{ x: number; y: number; text: string; t: number }> = ({
  x,
  y,
  text,
  t,
}) => {
  const w = text.length * 27 + 30;
  return (
    <g opacity={t}>
      <rect x={x - w / 2} y={y - 26} width={w} height={50} rx={3} fill={WP.kinari} />
      <rect x={x - w / 2} y={y - 26} width={5} height={50} fill={WP.sabi} />
      <text
        x={x + 3}
        y={y + 11}
        fontFamily={SEKAI_SERIF}
        fontSize={28}
        fontWeight={700}
        fill={SKP.sumi}
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
};

// ===================================================================
// 紺の地球 GlobeNavy   #1 / #2 / #3
// ===================================================================
// world.tsx の SekaiGlobe と同じ形・同じ座標・同じ f のタイミングで、
// 色だけを「夜の地球」にしたもの。SekaiGlobe は球を茶のグラデ (#3A2A1C→#241A12)
// で塗る作りで色の prop が無く、共有ファイルなので書き換えられない。
// 灯る4点だけは琥珀のまま (指示書)。座標は1つも変えていない。
const GLOBE_LIGHTS: { deg: number; name: string; off: [number, number] }[] = [
  { deg: 27, name: "江戸", off: [54, 74] },
  { deg: 17, name: "日本", off: [10, -92] },
  { deg: -2, name: "イラン", off: [-6, -96] },
  { deg: -27, name: "アメリカ", off: [-30, 78] },
];

const GlobeNavy: React.FC<{
  f: number;
  uid: string;
  lightAt?: number[];
  linkAt?: number;
  labels?: boolean;
}> = ({ f, uid, lightAt = [0, 16, 32, 48], linkAt, labels = true }) => {
  const rise = easeOut(seg(f, 0, 40));
  const n = lightAt.length;
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-globe`} cx="50%" cy="22%" r="62%">
          <stop offset="0%" stopColor={WP.nightSkyHi} />
          <stop offset="62%" stopColor={WP.nightSky} />
          <stop offset="100%" stopColor={EARTH_LOW} />
        </radialGradient>
        <radialGradient id={`${uid}-lamp`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={WP.amberLit} stopOpacity={0.9} />
          <stop offset="100%" stopColor={WP.amberLit} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* 大気。青い層が2枚 */}
      <circle cx={GCX} cy={GCY} r={GR + 54} fill="none" stroke={ATMOS} strokeWidth={60} opacity={0.14 * rise} />
      <circle cx={GCX} cy={GCY} r={GR + 16} fill="none" stroke={ATMOS} strokeWidth={14} opacity={0.4 * rise} />
      {/* 球 */}
      <circle cx={GCX} cy={GCY} r={GR} fill={`url(#${uid}-globe)`} stroke={ATMOS_LIT} strokeWidth={3.4} opacity={rise} />
      {/* 経線。球に見せるための手がかり */}
      <g opacity={0.14 * rise} clipPath={`url(#${uid}-gclip)`}>
        {[-60, -40, -20, 0, 20, 40, 60].map((d) => {
          const [x] = gpt(d);
          return <ellipse key={d} cx={GCX} cy={GCY} rx={Math.abs(x - GCX)} ry={GR} fill="none" stroke={ATMOS_LIT} strokeWidth={2} />;
        })}
        {[1180, 1320].map((ry) => (
          <ellipse key={ry} cx={GCX} cy={GCY} rx={GR} ry={ry} fill="none" stroke={ATMOS_LIT} strokeWidth={2} />
        ))}
      </g>
      <clipPath id={`${uid}-gclip`}>
        <circle cx={GCX} cy={GCY} r={GR} />
      </clipPath>
      {/* 灯と灯を結ぶ。錆朱のまま */}
      {linkAt !== undefined &&
        GLOBE_LIGHTS.slice(0, Math.max(n, 1)).map((L, i, arr) => {
          if (i === arr.length - 1) return null;
          const t = easeInOut(seg(f, linkAt + i * 12, linkAt + i * 12 + 40));
          if (t <= 0) return null;
          const [x1, y1] = gpt(L.deg);
          const [x2, y2] = gpt(arr[i + 1].deg);
          const pulse = 0.68 + Math.sin(f / 16 + i) * 0.26;
          return (
            <path
              key={i}
              d={`M ${x1},${y1} Q ${(x1 + x2) / 2},${(y1 + y2) / 2 - 120} ${x2},${y2}`}
              fill="none"
              stroke={WP.sabi}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={pulse}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - t}
            />
          );
        })}
      {/* 灯。この枚で唯一の暖色 */}
      {GLOBE_LIGHTS.slice(0, n).map((L, i) => {
        const at = lightAt[i];
        const t = easeOut(seg(f, at, at + 22));
        if (t <= 0) return null;
        const [x, y] = gpt(L.deg);
        const pulse = 0.84 + Math.sin((f - at) / 13) * 0.16;
        return (
          <g key={L.name}>
            <circle cx={x} cy={y} r={150 * t * pulse} fill={`url(#${uid}-lamp)`} opacity={0.5} />
            <circle cx={x} cy={y} r={16 * t} fill={WP.amberLit} />
            <circle cx={x} cy={y} r={34 * t} fill="none" stroke={WP.amberLit} strokeWidth={3} opacity={0.6 * t} />
            {labels && (
              <>
                <line x1={x} y1={y} x2={x + L.off[0]} y2={y + L.off[1]} stroke={WP.amberLit} strokeWidth={2} opacity={t * 0.6} />
                <Plate x={x + L.off[0]} y={y + L.off[1]} text={L.name} t={easeOut(seg(f, at + 8, at + 30))} />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
};

// ===================================================================
// 色のある世界地図 ColorMap   ★2026-11-09 現在この担当では使っていない
// ===================================================================
// もとは #10 がこれで世界地図を出していたが、別紙A #10 で
// 「1988年のテヘランの街角」を描くことになったので使わなくなった。
// 投影と海岸線は他の地図の枚と揃っているので、消さずに残しておく
// (この先 #1〜#10 のどれかで地図が必要になったときの正本)。
// world.tsx の SekaiMap と同じ投影 (mp)・同じ海岸線・同じ f のタイミングで、
// 海を青・陸を暗い緑灰にしたもの。SekaiMap は海を茶 (WP.sea) で全面塗りつぶす作りで
// 色の prop が無いため、下に青を敷いても隠れてしまう。よってこの枚は自前で描く。
// 海岸線の座標は world.tsx の写し。1点も変えていない (他の地図の枚と形を揃えるため)
const CL_NA: [number, number][] = [
  [-125, 49], [-124, 40], [-120, 34], [-114, 30], [-110, 24], [-106, 23],
  [-97, 26], [-94, 29], [-89, 29], [-84, 30], [-80, 25], [-81, 31],
  [-76, 35], [-74, 40], [-70, 42], [-66, 45], [-60, 47], [-56, 51],
  [-64, 58], [-78, 62], [-85, 67], [-95, 69], [-110, 69], [-125, 70],
];
const CL_GREENLAND: [number, number][] = [
  [-45, 60], [-22, 70], [-20, 80], [-45, 83], [-58, 76], [-55, 65],
];
const CL_SA: [number, number][] = [
  [-92, 15], [-84, 10], [-78, 8], [-72, 11], [-62, 10], [-52, 5],
  [-48, -1], [-44, -3], [-38, -6], [-39, -14], [-48, -25], [-58, -34],
  [-62, -41], [-68, -50], [-74, -45], [-72, -35], [-71, -20], [-76, -10],
  [-80, -3], [-78, 2], [-82, 8], [-86, 12],
];
const CL_AFRICA: [number, number][] = [
  [-17, 15], [-16, 20], [-10, 27], [-2, 32], [10, 34], [20, 32],
  [32, 31], [34, 28], [38, 22], [43, 12], [51, 12], [48, 5],
  [42, -2], [40, -10], [35, -20], [32, -26], [28, -33], [20, -35],
  [15, -28], [13, -18], [12, -6], [9, 4], [5, 5], [-4, 5], [-8, 4], [-13, 9],
];
const CL_EURASIA: [number, number][] = [
  [-9, 38], [-9, 43], [-2, 43], [-1, 46], [-4, 48], [0, 49], [4, 51],
  [8, 54], [9, 57], [5, 59], [11, 58], [11, 64], [16, 69], [25, 71],
  [40, 70], [55, 71], [70, 73], [90, 75], [110, 74], [130, 72], [142, 69],
  [140, 62], [135, 57], [130, 48], [122, 40], [121, 32], [112, 22],
  [107, 11], [100, 13], [98, 8], [94, 16], [90, 22], [86, 21], [80, 16],
  [77, 8], [73, 20], [70, 24], [66, 25], [62, 25], [57, 25], [50, 29],
  [48, 30], [44, 29], [39, 22], [35, 28], [36, 36], [30, 40], [26, 38],
  [23, 40], [19, 40], [14, 38], [12, 45], [8, 44], [3, 43], [-3, 36],
];
const polyPts = (pts: [number, number][]) =>
  pts.map(([lo, la]) => mp(lo, la).join(",")).join(" ");

const ColorMap: React.FC<{
  f: number;
  uid: string;
  lit?: Partial<Record<MapLand, number>>;
  arcs?: { from: MapLand; to: MapLand; at?: number; lift?: number; hit?: boolean }[];
  labels?: boolean;
}> = ({ f, uid, lit = {}, arcs = [], labels = true }) => {
  const draw = easeOut(seg(f, 0, 34));
  const outline = (pts: [number, number][], key: string) => (
    <polygon
      key={key}
      points={polyPts(pts)}
      fill={LAND_GREEN}
      stroke={LAND_EDGE}
      strokeWidth={2.2}
      opacity={0.95}
    />
  );
  const japan = MAP_LAND.japan.shapes ?? [];
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={WP.amberLit} stopOpacity={0.85} />
          <stop offset="100%" stopColor={WP.amberLit} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-sea`} cx="50%" cy="44%" r="72%">
          <stop offset="0%" stopColor={WP.seaBlue} />
          <stop offset="100%" stopColor={WP.seaBlueDeep} />
        </radialGradient>
      </defs>
      {/* 海。茶ではなく青 */}
      <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-sea)`} />
      <g>
        {/* 緯度経度の罫。青灰 */}
        <g opacity={0.09}>
          {Array.from({ length: 19 }, (_, i) => {
            const lon = -180 + i * 20;
            const [x] = mp(lon, 0);
            return (
              <line key={`v${i}`} x1={x} y1={-400} x2={x} y2={H + 400} stroke={SEA_GRID} strokeWidth={1.4} />
            );
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const lat = -80 + i * 20;
            const [, y] = mp(0, lat);
            return (
              <line key={`h${i}`} x1={-600} y1={y} x2={W + 600} y2={y} stroke={SEA_GRID} strokeWidth={1.4} />
            );
          })}
        </g>
        {/* 陸 */}
        <g opacity={draw}>
          {outline(CL_NA, "na")}
          {outline(CL_GREENLAND, "gl")}
          {outline(CL_SA, "sa")}
          {outline(CL_AFRICA, "af")}
          {outline(CL_EURASIA, "eu")}
          {japan.map((p, i) => outline(p, `jp${i}`))}
        </g>
        {/* 灯る土地。ここだけ琥珀 */}
        {(Object.keys(lit) as MapLand[]).map((key) => {
          const L = MAP_LAND[key];
          const at = lit[key] ?? 0;
          const t = easeOut(seg(f, at, at + 26));
          if (t <= 0) return null;
          const [lx, ly] = mp(L.lon, L.lat);
          const pulse = 0.82 + Math.sin((f - at) / 11) * 0.18;
          return (
            <g key={key}>
              <circle cx={lx} cy={ly} r={(L.shapes ? 150 : 86) * t} fill={`url(#${uid}-glow)`} opacity={0.5 * pulse} />
              {L.shapes ? (
                L.shapes.map((p, i) => (
                  <polygon
                    key={i}
                    points={polyPts(p)}
                    fill={WP.amber}
                    stroke={WP.amberLit}
                    strokeWidth={3}
                    opacity={t}
                  />
                ))
              ) : (
                <>
                  <circle cx={lx} cy={ly} r={13 * t} fill={WP.amberLit} />
                  <circle cx={lx} cy={ly} r={26} fill="none" stroke={WP.amberLit} strokeWidth={2.6} opacity={t * 0.7} />
                </>
              )}
            </g>
          );
        })}
        {/* 関係は錆朱の弧 */}
        {arcs.map((a, i) => {
          const at = a.at ?? 20;
          const t = easeInOut(seg(f, at, at + 42));
          if (t <= 0) return null;
          const [x1, y1] = mp(MAP_LAND[a.from].lon, MAP_LAND[a.from].lat);
          const [x2, y2] = mp(MAP_LAND[a.to].lon, MAP_LAND[a.to].lat);
          const mx = (x1 + x2) / 2,
            my = (y1 + y2) / 2 - (a.lift ?? 190);
          return (
            <g key={i}>
              <path
                d={`M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`}
                fill="none"
                stroke={WP.sabi}
                strokeWidth={6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - t}
              />
              {a.hit && t >= 1 && (
                <circle
                  cx={x2}
                  cy={y2}
                  r={18 + ((f - at - 42) % 34) * 3.4}
                  fill="none"
                  stroke={WP.sabi}
                  strokeWidth={4}
                  opacity={1 - ((f - at - 42) % 34) / 34}
                />
              )}
            </g>
          );
        })}
      </g>
      {/* 名札 */}
      {labels &&
        (Object.keys(lit) as MapLand[]).map((key) => {
          const L = MAP_LAND[key];
          const at = lit[key] ?? 0;
          const t = easeOut(seg(f, at + 10, at + 34));
          if (t <= 0) return null;
          const [lx, ly] = mp(L.lon, L.lat);
          const px = lx + L.off[0],
            py = ly + L.off[1];
          return (
            <g key={key}>
              <line x1={lx} y1={ly} x2={px} y2={py} stroke={WP.amberLit} strokeWidth={2} opacity={t * 0.6} />
              <Plate x={px} y={py} text={L.name} t={t} />
            </g>
          );
        })}
    </g>
  );
};

// ★2026-11-09 ShadeFigure (無貌の黒い人影) と MiniRadio はここにあったが廃止した。
// 作者が「人のシルエットもいやだ」と名指しで却下したため。
// 人はその枚ごとに、顔と服を描いて新しく置く。

// ===================================================================
// #1 山 時代が違っても、国が違っても、人の心は変わらない。
//
// ★2026-11-09 全面描き直し (別紙A #1)。
//   前は「夜の地球に4つの灯がともる」絵だった。どの国のどの時代でも成立するので却下。
//   別紙どおり、夜の路地に窓を2つ横に並べる。
//     左 = 1945年8月の日本の茶の間 / 右 = 2026年のテヘランの台所
//   同じ姿勢の女が2人、同じ角度で前かがみになっている。これが「人の心は変わらない」。
//   カメラは窓の高さ、少し煽り。地球儀・世界地図・黒い人影は出さない (別紙の禁止)。
//
// 寄りの縛り (共通指示書 方針②)
//   全景にしてよいのは #8 と #10 だけなので、ここは寄る。
//   「顔が画面の高さの1/4以上」の2枚のうちの1枚。頭を 292px で描く (H/4 = 270)。
//   顔をこの大きさにすると正座の膝まで画面に入らないので、カメラを低く近くに置き、
//   腿を短縮して膝を手前に大きく落とす。だから「膝に手」が成立する。
//
// 時代考証 (色は world.tsx の WP に足した)
//   左 ・灯火管制なので裸電球に黒い布の笠をかぶせ、光を下へ落とす (WP.denkyuuKasa)
//      ・真空管ラジオ = 布張りのスピーカー・丸ダイヤル2つ・つまみ。目盛りは 550〜1500kc
//      ・八月なのでガラス戸は左へ引き開けてある。だから桟が顔を横切らない
//      ・★自分で足した1つ = 卓袱台の上の団扇 (真夏日の茶の間の持ち物)
//   右 ・ルーサリーは柄入りの長方形の布。前髪が少し出る巻き方。下は長いマントー
//      ・エステカンは細腰のガラス。受皿に角砂糖を添えて噛みながら飲む
//      ・台所の明かりは蛍光灯。左の裸電球 (暖色) と光の色を分ける
// ===================================================================

// 1945年8月の茶の間の女 (30代)。紺のもんぺ＋白い割烹着。正座して膝に手。
// 右の台所の女とは別人なので、顎を細く・目を切れ長に・眉を細く描く。
const OnnaChanoma: React.FC<{ lean: number; tear: number }> = ({ lean, tear }) => {
  const SK = WP.skin;
  const SD = WP.skinShade;
  const HAIR = "#241D18";
  const NAVY = WP.monpe;
  const NAVYD = "#232C40";
  return (
    // 原点は膝のあいだの畳。頭の中心は (0,-610)
    <g transform="translate(640 1010)">
      {/* ── 正座。腿は短縮して見せず、膝の丸みだけで座りを出す ── */}
      <path d="M -206,-110 C -226,-238 -118,-306 0,-306 C 118,-306 226,-238 206,-110 Z" fill={NAVYD} />
      <path d="M 0,-302 L 0,-150" stroke={NAVY} strokeWidth={5} opacity={0.45} />
      {/* 膝。左右で高さをずらす (きれいに並べると人形になる) */}
      <ellipse cx={-122} cy={-98} rx={128} ry={74} fill={NAVY} />
      <ellipse cx={118} cy={-86} rx={122} ry={70} fill={NAVY} />
      <path d="M -248,-96 C -240,-30 -196,-14 -122,-18" fill="none" stroke={NAVYD} strokeWidth={6} opacity={0.6} />
      <path d="M 240,-84 C 232,-22 190,-6 118,-10" fill="none" stroke={NAVYD} strokeWidth={6} opacity={0.6} />
      {/* 紺絣の飛白。面で散らす */}
      {[[-186, -126], [-96, -150], [-44, -94], [64, -142], [150, -118], [96, -62]].map(([kx, ky], i) => (
        <rect key={i} x={kx} y={ky} width={13} height={13} fill={WP.monpeLit} opacity={0.4} />
      ))}

      {/* ── 腰から上。前かがみはここを回す ── */}
      <g transform={`rotate(${lean} 0 -150)`}>
        {/* 胴。紺の筒袖の上衣 */}
        <path d="M -196,-410 L 196,-410 L 214,-180 L -214,-180 Z" fill={NAVY} />
        <path d="M -196,-410 L -92,-410 L -104,-180 L -214,-180 Z" fill={NAVYD} opacity={0.5} />
        {/* 白い割烹着。胸当てが四角く、腰紐が回る */}
        <path d="M -126,-424 L 126,-424 L 152,-300 L 166,-182 L -166,-182 L -152,-300 Z" fill={WP.kappogi} />
        <path d="M -126,-424 L -48,-424 L -62,-182 L -166,-182 L -152,-300 Z" fill={WP.kappogiShade} opacity={0.6} />
        <path d="M -126,-424 L 126,-424 L 124,-404 L -124,-404 Z" fill={WP.paperLit} opacity={0.5} />
        <rect x={-162} y={-246} width={324} height={16} fill={WP.kappogiShade} />
        <path d="M -62,-424 L -66,-250 M 62,-424 L 66,-250" stroke={WP.kappogiShade} strokeWidth={4} />
        {/* 肩から吊る紐 */}
        <path d="M -112,-424 L -142,-396" stroke={WP.kappogiShade} strokeWidth={7} />
        {/* 腕。肩から膝の手へ下ろす */}
        <path d="M -196,-406 C -248,-368 -268,-282 -238,-196 L -176,-206 C -200,-282 -188,-346 -150,-382 Z" fill={NAVY} />
        <path d="M 196,-406 C 246,-368 266,-286 238,-200 L 178,-210 C 200,-286 188,-346 150,-382 Z" fill={NAVY} />
        <path d="M -196,-406 C -248,-368 -268,-282 -238,-196 L -212,-199 C -238,-284 -224,-348 -186,-390 Z" fill={NAVYD} opacity={0.45} />
        {/* 筒袖の口 */}
        <path d="M -242,-212 L -172,-222 L -170,-198 L -240,-188 Z" fill={NAVYD} />
        <path d="M 242,-216 L 174,-226 L 172,-202 L 240,-192 Z" fill={NAVYD} />

        {/* ── 首と頭。頭は 292px ── */}
        <rect x={-42} y={-492} width={84} height={96} fill={SD} />
        <path d="M -42,-460 C -14,-430 14,-430 42,-460 L 42,-396 L -42,-396 Z" fill={SD} opacity={0.8} />
        <ellipse cx={0} cy={-610} rx={112} ry={146} fill={SK} />
        {/* 顎を細く。輪郭の下側を削る */}
        <path d="M -112,-606 C -108,-528 -62,-464 0,-464 C 62,-464 108,-528 112,-606 Z" fill={SK} />
        <path d="M 54,-700 C 104,-660 108,-556 62,-492" fill="none" stroke={SD} strokeWidth={9} opacity={0.3} />
        {/* 耳 */}
        <ellipse cx={-110} cy={-606} rx={20} ry={34} fill={SK} />
        <ellipse cx={110} cy={-606} rx={20} ry={34} fill={SK} />
        <path d="M 104,-618 C 114,-610 112,-596 104,-592" fill="none" stroke={SD} strokeWidth={5} />
        {/* 髪。中央で分けて後ろへ束ねる (被り物なしで顔を全部見せる) */}
        <path
          d="M -114,-636 C -118,-746 -58,-782 0,-782 C 58,-782 118,-746 114,-636
             C 106,-690 80,-716 44,-724 C 22,-700 -22,-700 -44,-724 C -80,-716 -106,-690 -114,-636 Z"
          fill={HAIR}
        />
        <path d="M -96,-742 C -56,-770 -16,-766 6,-746" fill="none" stroke="#4A3C30" strokeWidth={7} opacity={0.5} />
        {/* 後ろに束ねた髷が肩の上に少し出る */}
        <ellipse cx={-120} cy={-672} rx={28} ry={54} fill={HAIR} />
        <ellipse cx={120} cy={-672} rx={28} ry={54} fill={HAIR} />
        {/* 眉。細く、ゆるい弧 */}
        <path d="M -80,-686 C -58,-700 -34,-700 -20,-690" fill="none" stroke={HAIR} strokeWidth={8} strokeLinecap="round" />
        <path d="M 20,-690 C 34,-700 58,-700 80,-686" fill="none" stroke={HAIR} strokeWidth={8} strokeLinecap="round" />
        {/* 目。伏せ目。切れ長で、上まぶたが重く瞳を半分隠す */}
        <defs>
          <clipPath id="a01-eyeL">
            <path d="M -78,-632 C -66,-654 -28,-654 -16,-632 C -28,-612 -66,-612 -78,-632 Z" />
          </clipPath>
          <clipPath id="a01-eyeR">
            <path d="M 16,-632 C 28,-654 66,-654 78,-632 C 66,-612 28,-612 16,-632 Z" />
          </clipPath>
        </defs>
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <path
              d={
                sg < 0
                  ? "M -78,-632 C -66,-654 -28,-654 -16,-632 C -28,-612 -66,-612 -78,-632 Z"
                  : "M 16,-632 C 28,-654 66,-654 78,-632 C 66,-612 28,-612 16,-632 Z"
              }
              fill="#F4EEE2"
            />
            <g clipPath={`url(#a01-eye${sg < 0 ? "L" : "R"})`}>
              {/* 伏せているので瞳は下に寄る */}
              <circle cx={sg * 47} cy={-620} r={18} fill="#3A2A1E" />
              <circle cx={sg * 47} cy={-620} r={8} fill={WP.ink} />
              <circle cx={sg * 47 - 6} cy={-626} r={4} fill="#FFFFFF" opacity={0.9} />
              {/* 上まぶたの落ち込み */}
              <path
                d={sg < 0 ? "M -82,-656 L -12,-656 L -12,-630 L -82,-630 Z" : "M 12,-656 L 82,-656 L 82,-630 L 12,-630 Z"}
                fill={SK}
              />
            </g>
            {/* まつ毛の際。上を太く */}
            <path
              d={sg < 0 ? "M -78,-632 C -66,-650 -28,-650 -16,-632" : "M 16,-632 C 28,-650 66,-650 78,-632"}
              fill="none"
              stroke={WP.ink}
              strokeWidth={7}
              strokeLinecap="round"
            />
            <path
              d={sg < 0 ? "M -74,-626 C -62,-614 -30,-614 -20,-626" : "M 20,-626 C 30,-614 62,-614 74,-626"}
              fill="none"
              stroke={SD}
              strokeWidth={3.4}
              opacity={0.7}
            />
            {/* 二重の線 */}
            <path
              d={sg < 0 ? "M -80,-646 C -64,-664 -26,-664 -14,-644" : "M 14,-644 C 26,-664 64,-664 80,-646"}
              fill="none"
              stroke={SD}
              strokeWidth={3}
              opacity={0.45}
            />
            {/* 下まぶたに光る涙の膜 (泣いてはいない) */}
            <path
              d={sg < 0 ? "M -72,-620 C -60,-610 -32,-610 -22,-620" : "M 22,-620 C 32,-610 60,-610 72,-620"}
              fill="none"
              stroke="#CFE6F2"
              strokeWidth={4}
              opacity={0.75 * tear}
            />
          </g>
        ))}
        {/* 鼻。細い鼻梁と小鼻 */}
        <path d="M -4,-636 C -12,-592 -16,-566 -2,-556" fill="none" stroke={SD} strokeWidth={6} opacity={0.6} />
        <path d="M -24,-552 C -14,-544 14,-544 24,-552" fill="none" stroke={SD} strokeWidth={5} opacity={0.75} />
        <ellipse cx={-14} cy={-550} rx={5} ry={3.4} fill={SD} />
        <ellipse cx={14} cy={-550} rx={5} ry={3.4} fill={SD} />
        {/* 口。わずかに開いて聞き入っている */}
        <path d="M -8,-544 L -6,-524" stroke={SD} strokeWidth={4} opacity={0.4} />
        <path d="M -36,-512 C -18,-520 18,-520 36,-512" fill="none" stroke={WP.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M -30,-508 C -16,-494 16,-494 30,-508 C 16,-500 -16,-500 -30,-508 Z" fill="#6E3A32" />
        <path d="M -34,-516 C -18,-528 18,-528 34,-516" fill="none" stroke={SD} strokeWidth={4} opacity={0.4} />
        {/* 頬の赤み。真夏の茶の間 */}
        <ellipse cx={-72} cy={-566} rx={30} ry={17} fill="#C98272" opacity={0.26} />
        <ellipse cx={72} cy={-566} rx={30} ry={17} fill="#C98272" opacity={0.26} />
        {/* 顎の下の影。首から顔を離す */}
        <path d="M -56,-476 C -28,-452 28,-452 56,-476" fill="none" stroke={SD} strokeWidth={10} opacity={0.4} />
      </g>

      {/* ── 膝に置いた手。前かがみの回転の外に置く (膝は動かないので) ── */}
      {[{ hx: -132, hy: -148, r: -14 }, { hx: 128, hy: -136, r: 11 }].map((h, i) => (
        <g key={i} transform={`translate(${h.hx} ${h.hy}) rotate(${h.r})`}>
          <path d="M -46,-14 C -52,22 -34,44 -4,44 C 28,44 48,24 44,-12 Z" fill={SK} />
          <path d="M -46,-14 C -52,22 -34,44 -4,44 L -6,-12 Z" fill={SD} opacity={0.22} />
          {/* 指の割れ。4本ぶん引くと手に見える */}
          {[-26, -8, 10, 28].map((fx) => (
            <path key={fx} d={`M ${fx},-6 L ${fx + 2},38`} stroke={SD} strokeWidth={4} opacity={0.6} />
          ))}
          {/* 爪 */}
          {[-26, -8, 10, 28].map((fx) => (
            <ellipse key={`n${fx}`} cx={fx + 9} cy={36} rx={6} ry={8} fill="#E8C0A4" opacity={0.8} />
          ))}
          {/* 関節の皺 */}
          <path d="M -34,10 C -14,18 16,18 38,8" fill="none" stroke={SD} strokeWidth={3} opacity={0.45} />
        </g>
      ))}
    </g>
  );
};

// 2026年のテヘランの台所の女 (30代)。柄入りのルーサリー＋長いマントー。椅子に浅く座る。
// 左の女と別人に見せるため、顎を丸く・目を大きく・眉を太く・鼻梁をまっすぐに描く。
const OnnaDaidokoro: React.FC<{ lean: number }> = ({ lean }) => {
  const SK = "#D2A079";
  const SD = "#8E6246";
  const HAIR = "#1E1814";
  const MANTO = WP.manto;
  const MANTOD = "#332F3A";
  return (
    // 原点は椅子の前の床。頭の中心は (0,-600)
    <g transform="translate(1640 1000)">
      {/* 椅子。背もたれが右肩の後ろに出る。浅く座っているので尻は座面の前寄り */}
      <g>
        <rect x={76} y={-520} width={26} height={340} rx={6} fill="#7A5E3E" />
        <rect x={76} y={-520} width={9} height={340} fill="#A58256" opacity={0.7} />
        <rect x={-96} y={-540} width={198} height={30} rx={8} fill="#7A5E3E" />
        <rect x={-96} y={-540} width={198} height={10} rx={4} fill="#A58256" opacity={0.6} />
        <rect x={-150} y={-188} width={272} height={22} rx={6} fill="#6E543A" />
      </g>
      {/* 腿。椅子に浅く座っているので前へ出る。短縮して膝だけ見せる */}
      <path d="M -186,-120 C -200,-226 -96,-280 10,-278 C 112,-276 196,-220 182,-118 Z" fill={MANTOD} />
      <ellipse cx={-110} cy={-104} rx={118} ry={70} fill={MANTO} />
      <ellipse cx={112} cy={-92} rx={114} ry={66} fill={MANTO} />
      {/* 膝から下はジーンズ。マントーの裾から出る */}
      <path d="M -210,-98 C -212,-44 -176,-16 -112,-20 L -108,-58 Z" fill="#3E5068" />
      <path d="M 214,-88 C 216,-36 180,-8 114,-12 L 110,-50 Z" fill="#3E5068" />

      <g transform={`rotate(${lean} 0 -160)`}>
        {/* 長いマントー。前開きでボタンが一列 */}
        <path d="M -188,-418 L 188,-418 L 208,-190 L -208,-190 Z" fill={MANTO} />
        <path d="M -188,-418 L -88,-418 L -100,-190 L -208,-190 Z" fill={MANTOD} opacity={0.6} />
        <path d="M 6,-418 L 22,-190" stroke={MANTOD} strokeWidth={7} />
        {[-380, -324, -268, -212].map((by) => (
          <circle key={by} cx={14} cy={by} r={9} fill="#8E8698" />
        ))}
        {/* 襟。開いて下に無地のシャツが見える */}
        <path d="M -62,-430 L 6,-352 L 74,-430 L 50,-424 L 6,-376 L -38,-424 Z" fill="#C6BFAE" />
        <path d="M -62,-430 L -96,-392 L -58,-370 L -14,-404 Z" fill={MANTOD} />
        <path d="M 74,-430 L 108,-392 L 70,-370 L 26,-404 Z" fill={MANTOD} />
        {/* 腕。肩から膝の上の手へ */}
        <path d="M -188,-412 C -240,-374 -258,-288 -228,-204 L -168,-214 C -192,-288 -180,-352 -142,-388 Z" fill={MANTO} />
        <path d="M 188,-412 C 238,-374 256,-292 228,-208 L 170,-218 C 192,-292 180,-352 142,-388 Z" fill={MANTO} />
        <path d="M -188,-412 C -240,-374 -258,-288 -228,-204 L -204,-207 C -230,-290 -216,-354 -178,-396 Z" fill={MANTOD} opacity={0.5} />
        <path d="M -232,-220 L -164,-230 L -162,-206 L -230,-196 Z" fill={MANTOD} />
        <path d="M 232,-224 L 166,-234 L 164,-210 L 232,-200 Z" fill={MANTOD} />

        {/* 首と頭 */}
        <rect x={-40} y={-486} width={80} height={92} fill={SD} />
        <ellipse cx={0} cy={-600} rx={110} ry={144} fill={SK} />
        {/* 顎は丸い */}
        <path d="M -110,-598 C -106,-508 -58,-456 0,-456 C 58,-456 106,-508 110,-598 Z" fill={SK} />
        <path d="M 52,-690 C 102,-650 106,-544 58,-484" fill="none" stroke={SD} strokeWidth={9} opacity={0.28} />
        {/* ルーサリー。柄入りの長方形の布を頭に掛け、顎の下で合わせる。前髪が少し出る */}
        <path
          d="M -122,-596 C -126,-740 -62,-776 0,-776 C 62,-776 126,-740 122,-596
             L 150,-430 L 104,-404 L 56,-470 L -56,-470 L -104,-404 L -150,-430 Z"
          fill={WP.rusari}
        />
        {/* 布の柄。小さな菱と点 */}
        <g opacity={0.5}>
          {[[-86, -690], [-32, -736], [30, -730], [86, -676], [-104, -600], [100, -596], [-120, -500], [118, -496], [-58, -446], [58, -446]].map(
            ([px, py], i) => (
              <g key={i} transform={`translate(${px} ${py}) rotate(45)`}>
                <rect x={-9} y={-9} width={18} height={18} fill="#E4CBD4" />
                <rect x={-3} y={-3} width={6} height={6} fill={WP.rusari} />
              </g>
            ),
          )}
        </g>
        {/* 布の縁の折り返し。顔の周りを一周 */}
        <path
          d="M -122,-596 C -126,-740 -62,-776 0,-776 C 62,-776 126,-740 122,-596"
          fill="none"
          stroke="#6E4252"
          strokeWidth={10}
          opacity={0.6}
        />
        {/* 顎の下で合わせた結び目 */}
        <path d="M -56,-470 C -22,-440 22,-440 56,-470 L 46,-434 C 18,-412 -18,-412 -46,-434 Z" fill="#7E4A5C" />
        {/* 前髪。布の下から少し出る */}
        <path d="M -94,-680 C -66,-712 -18,-716 10,-700 C -22,-690 -62,-676 -94,-654 Z" fill={HAIR} />
        <path d="M 96,-676 C 72,-706 36,-712 14,-700 C 44,-690 74,-672 96,-650 Z" fill={HAIR} />
        {/* 眉。太くてまっすぐ寄り */}
        <path d="M -82,-678 C -58,-692 -30,-690 -18,-680" fill="none" stroke={HAIR} strokeWidth={13} strokeLinecap="round" />
        <path d="M 18,-680 C 30,-690 58,-692 82,-678" fill="none" stroke={HAIR} strokeWidth={13} strokeLinecap="round" />
        {/* 目。大きく、やや伏せて手元を見ている */}
        <defs>
          <clipPath id="a01-ireL">
            <path d="M -82,-624 C -68,-652 -24,-652 -12,-624 C -26,-598 -68,-598 -82,-624 Z" />
          </clipPath>
          <clipPath id="a01-ireR">
            <path d="M 12,-624 C 24,-652 68,-652 82,-624 C 68,-598 26,-598 12,-624 Z" />
          </clipPath>
        </defs>
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <path
              d={
                sg < 0
                  ? "M -82,-624 C -68,-652 -24,-652 -12,-624 C -26,-598 -68,-598 -82,-624 Z"
                  : "M 12,-624 C 24,-652 68,-652 82,-624 C 68,-598 26,-598 12,-624 Z"
              }
              fill="#F2EBDE"
            />
            <g clipPath={`url(#a01-ire${sg < 0 ? "L" : "R"})`}>
              <circle cx={sg * 46} cy={-614} r={22} fill="#3A2416" />
              <circle cx={sg * 46} cy={-614} r={10} fill={WP.ink} />
              <circle cx={sg * 46 - 7} cy={-622} r={5} fill="#FFFFFF" opacity={0.9} />
              <path
                d={sg < 0 ? "M -86,-656 L -8,-656 L -8,-636 L -86,-636 Z" : "M 8,-656 L 86,-656 L 86,-636 L 8,-636 Z"}
                fill={SK}
              />
            </g>
            <path
              d={sg < 0 ? "M -82,-624 C -68,-648 -24,-648 -12,-626" : "M 12,-626 C 24,-648 68,-648 82,-624"}
              fill="none"
              stroke={WP.ink}
              strokeWidth={8}
              strokeLinecap="round"
            />
            {/* まつ毛を3本だけ外へ跳ねさせる */}
            {[0, 1, 2].map((k) => (
              <path
                key={k}
                d={`M ${sg * (78 - k * 16)},${-628 - k * 2} l ${sg * 10},-11`}
                stroke={WP.ink}
                strokeWidth={4}
                strokeLinecap="round"
              />
            ))}
            <path
              d={sg < 0 ? "M -78,-614 C -62,-600 -28,-600 -16,-614" : "M 16,-614 C 28,-600 62,-600 78,-614"}
              fill="none"
              stroke={SD}
              strokeWidth={4}
              opacity={0.7}
            />
          </g>
        ))}
        {/* 鼻。鼻梁がまっすぐで、小鼻が少し張る */}
        <path d="M -2,-628 L -6,-556" stroke={SD} strokeWidth={7} opacity={0.55} />
        <path d="M -28,-548 C -16,-538 16,-538 28,-548" fill="none" stroke={SD} strokeWidth={6} opacity={0.8} />
        <ellipse cx={-17} cy={-546} rx={6} ry={4} fill={SD} />
        <ellipse cx={17} cy={-546} rx={6} ry={4} fill={SD} />
        {/* 口。口角を少しだけ上げる (ここが左の女との情の差) */}
        <path d="M -40,-504 C -18,-514 18,-514 40,-506" fill="none" stroke={WP.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M -34,-500 C -16,-484 16,-484 34,-502 C 16,-492 -16,-492 -34,-500 Z" fill="#6E3630" />
        <path d="M -38,-510 C -18,-524 18,-524 38,-512" fill="none" stroke={SD} strokeWidth={4} opacity={0.4} />
        <path d="M -6,-538 L -4,-518" stroke={SD} strokeWidth={4} opacity={0.4} />
        <ellipse cx={-70} cy={-556} rx={28} ry={16} fill="#B9705E" opacity={0.22} />
        <ellipse cx={70} cy={-556} rx={28} ry={16} fill="#B9705E" opacity={0.22} />
        <path d="M -54,-468 C -26,-444 26,-444 54,-468" fill="none" stroke={SD} strokeWidth={10} opacity={0.35} />
      </g>

      {/* 膝の上の手。左手は膝、右手はエステカンの方へ伸ばしかけている */}
      <g transform="translate(-116 -156) rotate(-12)">
        <path d="M -44,-12 C -50,22 -32,42 -4,42 C 26,42 44,22 42,-10 Z" fill={SK} />
        {[-24, -7, 10, 26].map((fx) => (
          <path key={fx} d={`M ${fx},-4 L ${fx + 2},36`} stroke={SD} strokeWidth={4} opacity={0.6} />
        ))}
        <path d="M -32,10 C -12,18 14,18 36,8" fill="none" stroke={SD} strokeWidth={3} opacity={0.45} />
      </g>
      <g transform="translate(122 -150) rotate(18)">
        <path d="M -42,-12 C -48,20 -30,40 -2,40 C 26,40 42,20 40,-10 Z" fill={SK} />
        {[-22, -6, 10, 24].map((fx) => (
          <path key={fx} d={`M ${fx},-4 L ${fx + 2},34`} stroke={SD} strokeWidth={4} opacity={0.6} />
        ))}
      </g>
    </g>
  );
};

const S01: SekaiArt = ({ f }) => {
  const up = easeOut(seg(f, 0, 30));
  // ★事件: 2つの窓の明かりが同じ瞬間にまたたく。同じ bl を両方に掛ける
  const bl = (() => {
    const u = seg(f, 46, 60);
    if (u <= 0 || u >= 1) return 1;
    return 1 - 0.66 * Math.abs(Math.sin(u * Math.PI * 2.5));
  })();
  // 前かがみ。またたいた瞬間にもう一段のぞき込む (2人そろって同じ角度)
  const lean = 9 + easeInOut(seg(f, 50, 72)) * 4 + Math.sin(f / 23) * 0.7;
  const pend = Math.sin(f / 7.5) * 16; // 柱時計の振り子
  // 窓の内側
  const LX = 100,
    RX = 1060,
    WW = 760,
    WT = 150,
    WB = 1000;
  // 窓枠。木 (左・日本) とアルミ (右・イラン) で材を変える
  const Frame: React.FC<{ x: number; wood: boolean }> = ({ x, wood }) => (
    <g>
      <rect x={x - 34} y={WT - 36} width={WW + 68} height={36} fill={wood ? WP.woodDark : "#6E757A"} />
      <rect x={x - 34} y={WT - 36} width={WW + 68} height={9} fill={wood ? WP.wood : "#9BA3A8"} opacity={0.8} />
      {/* ★煽りの手がかり: まぐさの下面が見える */}
      <rect x={x - 34} y={WT} width={WW + 68} height={26} fill={wood ? "#1B120B" : "#3A4044"} />
      <rect x={x - 34} y={WT - 2} width={WW + 68} height={7} fill={WP.glow} opacity={0.22} />
      {/* 方立 */}
      <rect x={x - 34} y={WT} width={34} height={WB - WT + 46} fill={wood ? WP.woodDark : "#6E757A"} />
      <rect x={x + WW} y={WT} width={34} height={WB - WT + 46} fill={wood ? WP.woodDark : "#6E757A"} />
      <rect x={x - 34} y={WT} width={11} height={WB - WT + 46} fill={wood ? WP.wood : "#9BA3A8"} opacity={0.7} />
      {/* 窓台。厚みの下面も見せる (煽り) */}
      <rect x={x - 48} y={WB} width={WW + 96} height={26} fill={wood ? WP.wood : "#A8AEB2"} />
      <rect x={x - 48} y={WB} width={WW + 96} height={8} fill={WP.glow} opacity={0.3} />
      <rect x={x - 48} y={WB + 26} width={WW + 96} height={20} fill={wood ? "#1B120B" : "#464C50"} />
    </g>
  );
  return (
    // 夜の路地。地は紺、光源は2つの窓そのもの
    <NightStage f={f} uid="a01" src={[960, 560]} srcR={980} shafts={false} motes={22} vig={0.9} bg="#070A12" glow={WP.amberLit}>
      {/* 煽りをわずかに動かす。背景の矩形は端が出ないよう広く取ってある */}
      <Cam f={f} from={[0, 10, 1.03]} to={[0, -8, 1.0]} start={0} end={78}>
        <defs>
          <linearGradient id="a01-kabeJP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A1D12" />
            <stop offset="100%" stopColor="#16100A" />
          </linearGradient>
          <linearGradient id="a01-kabeIR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4E3A24" />
            <stop offset="100%" stopColor="#241A11" />
          </linearGradient>
          <linearGradient id="a01-suna" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor={WP.sunakabe} />
            <stop offset="100%" stopColor="#6E6049" />
          </linearGradient>
          <clipPath id="a01-inL">
            <rect x={LX} y={WT} width={WW} height={WB - WT} />
          </clipPath>
          <clipPath id="a01-inR">
            <rect x={RX} y={WT} width={WW} height={WB - WT} />
          </clipPath>
        </defs>

        {/* ── 路地の夜空と、向かいの家の影 ── */}
        <rect x={-200} y={-120} width={W + 400} height={300} fill="#070A12" />
        {Array.from({ length: 22 }, (_, i) => (
          <circle
            key={i}
            cx={40 + ((i * 383) % 1860)}
            cy={10 + ((i * 97) % 120)}
            r={i % 4 === 0 ? 2.4 : 1.6}
            fill={WP.star}
            opacity={0.5 * up}
          />
        ))}
        {/* 左の壁 = 下見板張りの日本家屋。右の壁 = 日干し煉瓦のテヘラン */}
        <rect x={-200} y={60} width={1150} height={H + 200} fill="url(#a01-kabeJP)" />
        <g opacity={0.5}>
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={-200} y={70 + i * 48} width={1150} height={6} fill="#3E2C1C" />
          ))}
        </g>
        <rect x={950} y={30} width={W - 950 + 200} height={H + 200} fill="url(#a01-kabeIR)" />
        <g opacity={0.35}>
          {Array.from({ length: 28 }, (_, r) =>
            Array.from({ length: 12 }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={956 + c * 86 + (r % 2) * 43}
                y={40 + r * 42}
                width={78}
                height={34}
                fill={WP.hiboshiRengaKage}
              />
            )),
          )}
        </g>
        {/* 右の壁の腰に貼られた水色のタイル */}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={1000 + i * 78} y={1052} width={70} height={60} fill={WP.tileMizuiro} opacity={0.6} />
        ))}
        {/* 左の軒。煽りなので下面が見える */}
        <path d="M -200,36 L 980,70 L 980,112 L -200,78 Z" fill="#241A12" />
        <path d="M -200,36 L 980,70 L 980,84 L -200,50 Z" fill={WP.kawara} opacity={0.6} />
        {/* 電線と、右の屋上の衛星アンテナ (テヘランの屋根の名物) */}
        <path d="M -200,22 C 500,64 1300,54 2120,96" fill="none" stroke="#0E1016" strokeWidth={6} />
        <g opacity={0.8}>
          <path d="M 1766,36 C 1810,10 1860,28 1866,62 C 1826,42 1792,42 1766,36 Z" fill="#2A2A2E" />
          <path d="M 1830,56 L 1838,110" stroke="#2A2A2E" strokeWidth={8} />
        </g>

        {/* ===== 左の窓 = 1945年8月の茶の間 ===== */}
        <g clipPath="url(#a01-inL)">
          {/* 砂壁 */}
          <rect x={LX} y={WT} width={WW} height={WB - WT} fill="url(#a01-suna)" opacity={0.9 * bl} />
          <rect x={LX} y={WT} width={WW} height={WB - WT} fill={WP.denkyuu} opacity={0.12 * bl} />
          {/* 裸電球の光の円錐 */}
          <path d={`M 400,268 L ${LX},${WB} L 860,${WB} Z`} fill={WP.denkyuu} opacity={0.17 * bl} />
          {/* 柱時計。振り子が振れる */}
          <g>
            <rect x={128} y={236} width={118} height={236} rx={8} fill={WP.hashiradokei} />
            <rect x={128} y={236} width={118} height={14} fill={WP.wood} opacity={0.8} />
            <path d="M 128,236 L 246,236 L 230,208 L 144,208 Z" fill={WP.hashiradokei} />
            <circle cx={187} cy={300} r={46} fill={WP.kinari} stroke={WP.line} strokeWidth={4} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <circle key={i} cx={187 + Math.sin(a) * 36} cy={300 - Math.cos(a) * 36} r={2.6} fill={WP.ink} />
              );
            })}
            {/* 正午を指す針 (玉音放送の時刻と呼応させる) */}
            <path d="M 187,300 L 187,268" stroke={WP.ink} strokeWidth={5} strokeLinecap="round" />
            <path d="M 187,300 L 189,274" stroke={WP.ink} strokeWidth={3.4} strokeLinecap="round" />
            <rect x={148} y={356} width={78} height={104} fill="#120E0A" stroke={WP.line} strokeWidth={3} />
            <g transform={`rotate(${pend} 187 350)`}>
              <line x1={187} y1={352} x2={187} y2={430} stroke={WP.brass} strokeWidth={4} />
              <circle cx={187} cy={438} r={15} fill={WP.brass} stroke={WP.line} strokeWidth={2.4} />
            </g>
            <rect x={148} y={356} width={30} height={104} fill={WP.denkyuu} opacity={0.1} />
          </g>
          {/* 裸電球と灯火管制の黒い布の笠 */}
          <line x1={400} y1={WT} x2={400} y2={196} stroke="#2A2218" strokeWidth={6} />
          <path d="M 318,250 C 322,196 478,196 482,250 Z" fill={WP.denkyuuKasa} />
          <path d="M 318,250 C 360,264 440,264 482,250 L 482,258 C 440,272 360,272 318,258 Z" fill="#0E0C09" />
          <ellipse cx={400} cy={286} rx={30} ry={38} fill={WP.denkyuu} opacity={0.4 + 0.6 * bl} />
          <path d="M 388,252 L 412,252 L 410,268 L 390,268 Z" fill="#8E8270" />
          <circle cx={400} cy={286} r={86} fill={WP.denkyuu} opacity={0.14 * bl} />
          {/* 女 (正座・膝に手) */}
          <OnnaChanoma lean={lean} tear={easeOut(seg(f, 34, 62))} />
          {/* 畳。縁の黒い布がこちらの端を走る */}
          <rect x={LX} y={892} width={WW} height={WB - 892} fill={WP.tatami} opacity={0.9} />
          <g opacity={0.3}>
            {Array.from({ length: 11 }, (_, i) => (
              <rect key={i} x={LX} y={900 + i * 10} width={WW} height={3} fill={WP.tatamiDim} />
            ))}
          </g>
          <rect x={LX} y={876} width={WW} height={20} fill="#1C2234" />
          <rect x={LX} y={876} width={WW} height={5} fill="#3E4A68" opacity={0.7} />
          {/* 卓袱台。漆の天板。カメラが天板より上なので楕円に見える */}
          <g>
            <ellipse cx={272} cy={762} rx={176} ry={40} fill={WP.chabudai} />
            <ellipse cx={272} cy={762} rx={176} ry={40} fill="none" stroke={WP.chabudaiDark} strokeWidth={5} />
            <path d="M 96,762 C 96,790 448,790 448,762 L 448,776 C 448,804 96,804 96,776 Z" fill={WP.chabudaiDark} />
            <path d="M 120,790 L 136,886 M 414,788 L 400,884" stroke={WP.chabudaiDark} strokeWidth={14} />
            <ellipse cx={272} cy={780} rx={160} ry={30} fill={WP.denkyuu} opacity={0.1} />
          </g>
          {/* 真空管ラジオ。布張りのスピーカー・丸ダイヤル2つ・つまみ */}
          <g>
            <rect x={150} y={596} width={226} height={158} rx={8} fill={WP.wood} stroke={WP.line} strokeWidth={5} />
            <rect x={150} y={596} width={226} height={13} fill={WP.glow} opacity={0.45} />
            <rect x={166} y={620} width={110} height={118} rx={6} fill={WP.nunoSpeaker} stroke={WP.line} strokeWidth={3} />
            <g opacity={0.45}>
              {Array.from({ length: 9 }, (_, i) => (
                <rect key={`v${i}`} x={170 + i * 12} y={624} width={5} height={110} fill="#3A2C1C" />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={`h${i}`} x={170} y={628 + i * 11} width={102} height={4} fill="#3A2C1C" />
              ))}
            </g>
            {/* 丸ダイヤル2つ。目盛りと周波数 */}
            {[{ cy: 652 }, { cy: 714 }].map((d, i) => (
              <g key={i}>
                <circle cx={326} cy={d.cy} r={27} fill="#2E2418" stroke={WP.brass} strokeWidth={3} />
                <circle cx={326} cy={d.cy} r={21} fill={WP.amberLit} opacity={(0.3 + 0.5 * bl) * (i === 0 ? 1 : 0.5)} />
                {Array.from({ length: 7 }, (_, k) => (
                  <line
                    key={k}
                    x1={326 + Math.sin((k / 7) * Math.PI * 1.6 - 0.8) * 14}
                    y1={d.cy - Math.cos((k / 7) * Math.PI * 1.6 - 0.8) * 14}
                    x2={326 + Math.sin((k / 7) * Math.PI * 1.6 - 0.8) * 19}
                    y2={d.cy - Math.cos((k / 7) * Math.PI * 1.6 - 0.8) * 19}
                    stroke={WP.ink}
                    strokeWidth={2}
                  />
                ))}
                <line x1={326} y1={d.cy} x2={326 + (i === 0 ? 11 : -9)} y2={d.cy - 14} stroke={WP.sabi} strokeWidth={3.4} />
              </g>
            ))}
            {/* つまみ。縁にローレットを刻む */}
            <circle cx={326} cy={748} r={15} fill={WP.woodDark} stroke={WP.brass} strokeWidth={2.4} />
            {Array.from({ length: 10 }, (_, k) => (
              <line
                key={k}
                x1={326 + Math.sin((k / 10) * Math.PI * 2) * 11}
                y1={748 - Math.cos((k / 10) * Math.PI * 2) * 11}
                x2={326 + Math.sin((k / 10) * Math.PI * 2) * 15}
                y2={748 - Math.cos((k / 10) * Math.PI * 2) * 15}
                stroke={WP.line}
                strokeWidth={2}
              />
            ))}
          </g>
          {/* 湯呑み (青磁) と、★自分で足した団扇 */}
          <g>
            <path d="M 400,700 L 448,700 L 442,748 L 406,748 Z" fill={WP.yunomi} stroke={WP.line} strokeWidth={3} />
            <ellipse cx={424} cy={700} rx={24} ry={8} fill="#8E9C8A" stroke={WP.line} strokeWidth={2.4} />
            <ellipse cx={424} cy={701} rx={17} ry={5} fill="#2E3A30" />
            <path d="M 406,714 L 442,714" stroke="#44503E" strokeWidth={3} opacity={0.6} />
          </g>
          <g transform="translate(470 672) rotate(16)">
            <ellipse cx={0} cy={-26} rx={46} ry={54} fill={WP.kinari} stroke={WP.line} strokeWidth={3.4} />
            {[-30, -15, 0, 15, 30].map((a) => (
              <line
                key={a}
                x1={0}
                y1={24}
                x2={Math.sin((a * Math.PI) / 180) * 50}
                y2={-26 - Math.cos((a * Math.PI) / 180) * 48}
                stroke="#B9A77E"
                strokeWidth={2.4}
              />
            ))}
            <circle cx={0} cy={-34} r={16} fill={WP.sabi} opacity={0.75} />
            <rect x={-5} y={22} width={10} height={54} rx={4} fill="#8E7A52" />
          </g>
        </g>
        <Frame x={LX} wood />
        {/* 引き開けたガラス戸。桟が左端に寄っているので顔を横切らない */}
        <g>
          <rect x={LX} y={WT} width={56} height={WB - WT} fill={WP.woodDark} />
          <rect x={LX + 56} y={WT} width={14} height={WB - WT} fill={WP.wood} opacity={0.7} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={LX} y={WT + 40 + i * 166} width={56} height={13} fill={WP.wood} opacity={0.6} />
          ))}
        </g>

        {/* ===== 右の窓 = 2026年のテヘランの台所 ===== */}
        <g clipPath="url(#a01-inR)">
          {/* 壁の模様タイル。八芒星と花の連続文様 */}
          <rect x={RX} y={WT} width={WW} height={WB - WT} fill="#E4DCC8" opacity={0.9 * bl} />
          {Array.from({ length: 7 }, (_, r) =>
            Array.from({ length: 7 }, (_, c) => {
              const tx = RX + c * 110,
                ty = WT + r * 110;
              return (
                <g key={`${r}-${c}`} opacity={0.85 * bl}>
                  <rect x={tx + 3} y={ty + 3} width={104} height={104} fill="#EFE8D6" stroke="#C9BEA2" strokeWidth={2} />
                  <g transform={`translate(${tx + 55} ${ty + 55})`}>
                    <rect x={-30} y={-30} width={60} height={60} fill={WP.tileMizuiro} opacity={0.55} />
                    <rect x={-30} y={-30} width={60} height={60} fill={WP.tileMizuiro} opacity={0.55} transform="rotate(45)" />
                    <circle cx={0} cy={0} r={13} fill={WP.tileMizuiroLit} opacity={0.8} />
                    {[0, 1, 2, 3].map((k) => (
                      <path
                        key={k}
                        d="M 0,-13 C 7,-26 -7,-26 0,-13 Z"
                        fill="#2E5E6E"
                        transform={`rotate(${k * 90})`}
                      />
                    ))}
                  </g>
                </g>
              );
            }),
          )}
          {/* 蛍光灯。左の裸電球と色を分ける (白) */}
          <g>
            <rect x={RX + 150} y={WT + 26} width={460} height={34} rx={10} fill="#D8DEE2" />
            <rect x={RX + 160} y={WT + 32} width={440} height={20} rx={8} fill="#F4FAFF" opacity={0.5 + 0.5 * bl} />
            <rect x={RX + 150} y={WT + 60} width={460} height={12} fill="#9AA2A8" />
            <rect x={RX + 150} y={WT + 72} width={460} height={240} fill="#F4FAFF" opacity={0.08 * bl} />
          </g>
          {/* 女 (椅子に浅く座る) */}
          <OnnaDaidokoro lean={lean} />
          {/* 調理台。カメラが低いので天板は薄い帯になる */}
          <g>
            <rect x={RX} y={682} width={470} height={22} fill={WP.stainless} />
            <rect x={RX} y={682} width={470} height={7} fill={WP.steelLit} opacity={0.8} />
            <rect x={RX} y={704} width={470} height={WB - 704} fill="#8E8878" />
            <g opacity={0.4}>
              {Array.from({ length: 5 }, (_, i) => (
                <rect key={i} x={RX + 10 + i * 94} y={712} width={74} height={280} fill="#766F60" />
              ))}
            </g>
          </g>
          {/* ステンレスのガスコンロ。奥の口に青い炎 */}
          <g>
            <rect x={1076} y={650} width={172} height={34} rx={5} fill={WP.stainlessDark} />
            <rect x={1076} y={650} width={172} height={9} fill={WP.steelLit} opacity={0.7} />
            {[{ cx: 1122, lit: true }, { cx: 1206, lit: false }].map((b, i) => (
              <g key={i}>
                <ellipse cx={b.cx} cy={652} rx={34} ry={11} fill="#2A2C2E" />
                <ellipse cx={b.cx} cy={650} rx={22} ry={7} fill="#44484C" />
                {b.lit &&
                  Array.from({ length: 11 }, (_, k) => {
                    const a = (k / 11) * Math.PI * 2;
                    const hgt = 15 + Math.abs(Math.sin(f / 3.2 + k)) * 11;
                    return (
                      <path
                        key={k}
                        d={`M ${b.cx + Math.sin(a) * 25},${650 - Math.cos(a) * 8}
                            l ${Math.sin(a) * 4},${-hgt} l ${-Math.sin(a) * 8},0 Z`}
                        fill={WP.gasFlame}
                        opacity={0.85 * bl}
                      />
                    );
                  })}
                {b.lit && <ellipse cx={b.cx} cy={636} rx={30} ry={14} fill={WP.gasFlame} opacity={0.25 * bl} />}
              </g>
            ))}
            {/* 前面のつまみ */}
            {[1100, 1160, 1220].map((kx) => (
              <g key={kx}>
                <circle cx={kx} cy={700} r={13} fill={WP.stainlessDark} stroke={WP.steelLit} strokeWidth={2.4} />
                <line x1={kx} y1={700} x2={kx - 8} y2={691} stroke={WP.steelLit} strokeWidth={3} />
              </g>
            ))}
          </g>
          {/* 電気ポット */}
          <g>
            <path d="M 1272,684 L 1272,596 C 1272,576 1358,576 1358,596 L 1358,684 Z" fill="#E8E4DA" stroke={WP.line} strokeWidth={4} />
            <path d="M 1272,684 L 1272,596 C 1272,586 1292,580 1300,579 L 1300,684 Z" fill="#FFFFFF" opacity={0.4} />
            <ellipse cx={1315} cy={588} rx={44} ry={13} fill="#C6C0B4" stroke={WP.line} strokeWidth={3} />
            <rect x={1298} y={566} width={34} height={16} rx={6} fill="#9A948A" />
            <path d="M 1358,616 C 1388,620 1388,660 1358,664" fill="none" stroke="#9A948A" strokeWidth={11} />
            <circle cx={1290} cy={660} r={7} fill={WP.iranRed} opacity={0.4 + 0.6 * bl} />
            <rect x={1272} y={676} width={86} height={10} fill="#9A948A" />
          </g>
          {/* エステカン (細腰のチャイグラス) とソーサー・角砂糖の皿 */}
          <g>
            <ellipse cx={1412} cy={684} rx={44} ry={12} fill="#EFEAE0" stroke={WP.line} strokeWidth={2.6} />
            <ellipse cx={1412} cy={682} rx={30} ry={8} fill="#D4CEC2" />
            <path
              d="M 1392,676 L 1388,644 C 1386,632 1400,628 1400,618 L 1398,606 L 1426,606 L 1424,618
                 C 1424,628 1438,632 1436,644 L 1432,676 Z"
              fill="#D8E4E8"
              opacity={0.55}
              stroke="#A8BCC2"
              strokeWidth={2.4}
            />
            {/* 中の紅茶。細腰の下側だけ満たす */}
            <path d="M 1390,672 L 1387,648 C 1386,640 1396,634 1398,626 L 1426,626 C 1428,634 1438,640 1437,648 L 1434,672 Z" fill={WP.chai} opacity={0.8} />
            <path d="M 1400,606 L 1398,672" stroke="#FFFFFF" strokeWidth={3.4} opacity={0.5} />
            <line x1={1430} y1={602} x2={1444} y2={652} stroke={WP.steelLit} strokeWidth={4} />
          </g>
          <g>
            <ellipse cx={1484} cy={686} rx={38} ry={11} fill="#EFEAE0" stroke={WP.line} strokeWidth={2.6} />
            {[{ x: 1466, y: 672 }, { x: 1490, y: 674 }, { x: 1478, y: 660 }].map((s, i) => (
              <g key={i}>
                <rect x={s.x} y={s.y} width={22} height={15} fill="#FFFFFF" stroke="#C4BEB2" strokeWidth={2} />
                <rect x={s.x} y={s.y} width={22} height={5} fill="#FFFFFF" />
              </g>
            ))}
          </g>
          {/* 伏せて置いたスマートフォン。低いカメラなので薄い板に見える */}
          <g transform="translate(1178 696) rotate(-6)">
            <rect x={-62} y={-9} width={124} height={18} rx={6} fill={WP.phoneBlack} />
            <rect x={-62} y={-9} width={124} height={5} rx={2.4} fill="#4A4E56" />
            <rect x={22} y={-8} width={26} height={13} rx={4} fill="#2E3238" />
            <circle cx={30} cy={-2} r={4} fill="#5A6068" />
            <circle cx={41} cy={-2} r={4} fill="#5A6068" />
          </g>
        </g>
        <Frame x={RX} wood={false} />
        {/* 右へ引き開けたアルミサッシ */}
        <g>
          <rect x={RX + WW - 52} y={WT} width={52} height={WB - WT} fill="#8E969C" />
          <rect x={RX + WW - 52} y={WT} width={14} height={WB - WT} fill={WP.steelLit} opacity={0.7} />
          <rect x={RX + WW - 62} y={520} width={12} height={90} rx={5} fill="#6E757A" />
        </g>
        {/* 窓の外の鉄の手すり (テヘランの窓の作法)。顔は横切らせない */}
        <g opacity={0.9}>
          <rect x={RX - 40} y={1026} width={WW + 80} height={10} rx={4} fill="#2E3136" />
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={RX - 20 + i * 78} y={1030} width={9} height={50} fill="#2E3136" />
          ))}
        </g>

        {/* ── 路地の地面と、2つの窓が落とす光。ここも同じ瞬間にまたたく ── */}
        <rect x={-200} y={1046} width={W + 400} height={200} fill="#0C0E14" />
        <path d={`M ${LX - 40},1046 L ${LX + WW + 40},1046 L ${LX + WW + 150},${H + 60} L ${LX - 150},${H + 60} Z`} fill={WP.denkyuu} opacity={0.15 * bl} />
        <path d={`M ${RX - 40},1046 L ${RX + WW + 40},1046 L ${RX + WW + 150},${H + 60} L ${RX - 150},${H + 60} Z`} fill="#CFE4F2" opacity={0.13 * bl} />
      </Cam>
    </NightStage>
  );
};

// ===================================================================
// #2 並 だから歴史は、今日のニュースを読む手がかりになる。
// ★2026-11-09 描き直し (別紙A #2)
//   構図 = 手元だけの極端な寄り。顔は出さない。そのかわり手は爪・関節・皺まで描く。
//   出す物 今日の日本語の朝刊 (縦組みの見出し・段組み・写真の網点) /
//          その下に重なった1945年の黄ばんだ新聞 (旧字・旧かな・紙が茶色い) /
//          湯気の立つマグ / 画面の隅で光るスマホの速報通知 / 指が押さえた折り目
//   足した物 (自分の1つ) 古い紙に貼った付箋「1945.8.15」
//   事件 指が下の古い紙を少しずらし、二つの見出しが縦に並ぶ
// ===================================================================

// 指1本。爪・第1関節・第2関節の皺まで描く。
// 回したあと +x 方向に伸びる。len が長さ、w が太さ。
const Yubi: React.FC<{
  x: number;
  y: number;
  ang: number;
  len: number;
  w: number;
  nail?: boolean;
}> = ({ x, y, ang, len, w, nail = true }) => {
  const d = `M 0,${-w / 2} L ${len * 0.5},${-w * 0.47}
             Q ${len + w * 0.42},${-w * 0.33} ${len + w * 0.44},0
             Q ${len + w * 0.42},${w * 0.33} ${len * 0.5},${w * 0.47}
             L 0,${w / 2} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`}>
      <path d={d} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
      {/* 下側の陰。光は左上から来ている */}
      <path
        d={`M ${len * 0.06},${w * 0.16} L ${len * 0.5},${w * 0.2} Q ${len + w * 0.3},${w * 0.26} ${len + w * 0.4},${w * 0.06}
            Q ${len + w * 0.4},${w * 0.33} ${len * 0.5},${w * 0.47} L ${len * 0.06},${w * 0.46} Z`}
        fill={WP.skinShade}
        opacity={0.6}
      />
      {/* 関節の皺。第2関節 (根元寄り) は3本、第1関節 (爪寄り) は2本 */}
      {[0.3, 0.345, 0.39].map((k, i) => (
        <path
          key={`k2-${i}`}
          d={`M ${len * k},${-w * 0.4} Q ${len * k + 6},0 ${len * k},${w * 0.4}`}
          stroke={WP.skinShade}
          strokeWidth={2.2}
          fill="none"
          opacity={0.75}
        />
      ))}
      {[0.63, 0.675].map((k, i) => (
        <path
          key={`k1-${i}`}
          d={`M ${len * k},${-w * 0.37} Q ${len * k + 5},0 ${len * k},${w * 0.37}`}
          stroke={WP.skinShade}
          strokeWidth={2}
          fill="none"
          opacity={0.7}
        />
      ))}
      {/* 爪。甘皮の弧と、爪の先の白い縁 */}
      {nail && (
        <g transform={`translate(${len * 0.86} ${-w * 0.08})`}>
          <ellipse rx={w * 0.3} ry={w * 0.33} fill={WP.paperLit} opacity={0.5} />
          <ellipse rx={w * 0.3} ry={w * 0.33} fill="none" stroke={WP.line} strokeWidth={2} />
          <path d={`M ${-w * 0.22},${-w * 0.2} Q 0,${-w * 0.36} ${w * 0.22},${-w * 0.2}`} stroke={WP.skinShade} strokeWidth={2.2} fill="none" />
          <path d={`M ${w * 0.1},${-w * 0.2} Q ${w * 0.33},0 ${w * 0.1},${w * 0.2}`} stroke={WP.paperWhite} strokeWidth={3} fill="none" opacity={0.8} />
        </g>
      )}
    </g>
  );
};

const S02: SekaiArt = ({ f }) => {
  // 事件: 左手の指が下の古い紙を右へ押し、二つの見出しの縦列が揃う
  const slide = easeInOut(seg(f, 34, 72));
  const DX = -258 + slide * 258; // 古い紙の横ずれ。0 で新聞の見出しと同じ x に来る
  const HX = 1208; // 見出しの縦列の x (今日の朝刊)
  const press = easeOut(seg(f, 10, 28)); // 右手の指が折り目を押さえ込む量
  // 段組みの本文 = 読めない粒。縦組みなので「縦に走る短い線の列」
  const tate = (gx: number, gy: number, cols: number, rows: number, col: string, op: number) => (
    <g opacity={op}>
      {Array.from({ length: cols }, (_, c) =>
        Array.from({ length: rows }, (_, r) => {
          const len = 52 - ((c * 5 + r * 7) % 4) * 11;
          return <rect key={`${c}-${r}`} x={gx + c * 19} y={gy + r * 62} width={5} height={len} fill={col} />;
        }),
      )}
    </g>
  );
  return (
    <WarmStage f={f} uid="a02" src={[260, -80]} srcR={1120} shafts={false} motes={14} vig={0.86} glow={WP.natsuHikari}>
      <Cam f={f} from={[0, 0, 1.06]} to={[14, -10, 1.0]} start={0} end={96}>
        <defs>
          {/* 机の板目。新聞の白と古紙の茶の両方を乗せるので、机は暗い木 */}
          <linearGradient id="a02-tsukue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={WP.wood} />
            <stop offset="100%" stopColor={WP.woodDark} />
          </linearGradient>
          <radialGradient id="a02-sokuhou" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={WP.screenLit} stopOpacity={0.5} />
            <stop offset="100%" stopColor={WP.screenLit} stopOpacity={0} />
          </radialGradient>
          <clipPath id="a02-ko">
            <path d="M -220,-80 L 2180,-120 L 2180,520 L -220,560 Z" />
          </clipPath>
        </defs>

        {/* ── 机 ── */}
        <rect x={-200} y={-120} width={W + 400} height={H + 240} fill="url(#a02-tsukue)" />
        {/* 板の継ぎ目を2本。手元の寄りなので板幅は画面より広い */}
        <line x1={-200} y1={126} x2={W + 200} y2={96} stroke={WP.woodDark} strokeWidth={5} opacity={0.5} />
        <line x1={-200} y1={1014} x2={W + 200} y2={1050} stroke={WP.woodDark} strokeWidth={5} opacity={0.5} />

        {/* ===== 1945年の黄ばんだ新聞 (下の紙)。事件でこれが右へずれる ===== */}
        <g transform={`translate(${DX} 0) rotate(-1.4 900 240)`}>
          <g clipPath="url(#a02-ko)">
            <rect x={-260} y={-90} width={2320} height={700} fill={WP.shinbunKiiro} />
            {/* 古紙のしみ。茶の濃い斑を物として置く (画面フィルタではない) */}
            {[[-40, 60, 150, 54], [420, -30, 210, 70], [1480, 330, 260, 64], [1860, 40, 180, 90]].map(
              ([sx, sy, sr, sv], i) => (
                <ellipse key={i} cx={sx} cy={sy} rx={sr} ry={sv} fill={WP.shinbunKiiroKage} opacity={0.4} />
              ),
            )}
            {/* 折り畳まれていた跡。縦2本・横1本 */}
            <line x1={620} y1={-90} x2={610} y2={610} stroke={WP.shinbunKiiroKage} strokeWidth={6} opacity={0.75} />
            <line x1={1560} y1={-90} x2={1552} y2={610} stroke={WP.shinbunKiiroKage} strokeWidth={5} opacity={0.6} />
            {/* 旧字・旧かなの見出し (縦組み)。右から2列 */}
            {"戰爭終結ノ詔書".split("").map((c, i) => (
              <text key={i} x={HX} y={112 + i * 54} fontFamily={SEKAI_SERIF} fontSize={52} fontWeight={700} fill={WP.ink} textAnchor="middle">
                {c}
              </text>
            ))}
            {"畏クモ大詔ヲ拜ス".split("").map((c, i) => (
              <text key={`s${i}`} x={HX - 62} y={124 + i * 36} fontFamily={SEKAI_SERIF} fontSize={30} fill={WP.ink} textAnchor="middle" opacity={0.85}>
                {c}
              </text>
            ))}
            {/* 見出しを囲う罫。新聞の罫は細い墨 */}
            <line x1={HX + 36} y1={66} x2={HX + 36} y2={500} stroke={WP.ink} strokeWidth={3} opacity={0.7} />
            <line x1={HX - 92} y1={66} x2={HX - 92} y2={500} stroke={WP.ink} strokeWidth={2} opacity={0.5} />
            {/* 題字。旧字の社名 */}
            <text x={160} y={70} fontFamily={SEKAI_SERIF} fontSize={46} fontWeight={700} fill={WP.ink} opacity={0.9}>
              大東亞新聞
            </text>
            <text x={160} y={104} fontFamily={SEKAI_SERIF} fontSize={22} fill={WP.ink} opacity={0.7}>
              昭和二十年八月十五日
            </text>
            {/* 段組みの本文 */}
            {tate(150, 150, 22, 7, WP.ink, 0.42)}
            {tate(1320, 90, 14, 7, WP.ink, 0.38)}
            {tate(1700, 90, 16, 7, WP.ink, 0.34)}
          </g>
          {/* 古い紙の小口。厚みと、めくれ上がった下端 */}
          <path d="M -260,556 L 2060,516 L 2060,540 L -260,580 Z" fill={WP.shinbunKiiroKage} />
          <path d="M -260,556 L 2060,516" stroke={WP.line} strokeWidth={3} opacity={0.6} fill="none" />
          {/* ★自分で足した1つ: 古い紙に貼った付箋。調べた日付の覚え書き */}
          <g transform="translate(1700 300) rotate(4)">
            <rect width={168} height={120} fill={WP.natsuHikari} />
            <rect width={168} height={120} fill="none" stroke={WP.line} strokeWidth={2.4} />
            <path d="M 0,0 L 168,0 L 168,14 L 0,10 Z" fill={WP.amber} opacity={0.5} />
            <text x={84} y={54} fontFamily={SEKAI_SERIF} fontSize={34} fill={WP.inkRed} textAnchor="middle">
              1945
            </text>
            <text x={84} y={94} fontFamily={SEKAI_SERIF} fontSize={30} fill={WP.inkRed} textAnchor="middle">
              8.15
            </text>
          </g>
        </g>

        {/* ===== 今日の日本語の朝刊 (上の紙) ===== */}
        <g transform="rotate(0.9 900 800)">
          {/* 紙の影が古紙に落ちる */}
          <path d="M -260,486 L 2060,446 L 2060,510 L -260,550 Z" fill={WP.shadow} opacity={0.42} />
          <rect x={-260} y={504} width={2320} height={760} fill={WP.paperWhite} />
          {/* 紙の起き上がり。上端に薄い影の帯 */}
          <rect x={-260} y={504} width={2320} height={26} fill={PAPER_SHADE} opacity={0.6} />
          {/* 題字 (横組み) と日付 */}
          <text x={150} y={606} fontFamily={SEKAI_SERIF} fontSize={62} fontWeight={700} fill={WP.ink}>
            世界日報
          </text>
          <rect x={150} y={622} width={330} height={4} fill={WP.ink} opacity={0.8} />
          <text x={150} y={656} fontFamily={SEKAI_SERIF} fontSize={24} fill={WP.ink} opacity={0.75}>
            2026年11月9日（月）朝刊
          </text>
          {/* 縦組みの見出し。古紙の見出しと同じ x に来ると縦1列に読める */}
          {"中東情勢緊迫".split("").map((c, i) => (
            <text key={i} x={HX} y={610 + i * 56} fontFamily={SEKAI_SERIF} fontSize={54} fontWeight={700} fill={WP.ink} textAnchor="middle">
              {c}
            </text>
          ))}
          {"海峡の封鎖を警告".split("").map((c, i) => (
            <text key={`s${i}`} x={HX - 66} y={622 + i * 38} fontFamily={SEKAI_SERIF} fontSize={32} fill={WP.ink} textAnchor="middle" opacity={0.88}>
              {c}
            </text>
          ))}
          <line x1={HX + 38} y1={560} x2={HX + 38} y2={1000} stroke={WP.ink} strokeWidth={3} opacity={0.7} />
          <line x1={HX - 98} y1={560} x2={HX - 98} y2={1000} stroke={WP.ink} strokeWidth={2} opacity={0.5} />
          {/* 写真と網点。粗い印刷の点を本当に並べる */}
          <g>
            <rect x={300} y={690} width={420} height={272} fill={WP.kinariDim} stroke={WP.line} strokeWidth={3} />
            {Array.from({ length: 28 }, (_, cx) =>
              Array.from({ length: 18 }, (_, cy) => {
                const px = 308 + cx * 15;
                const py = 698 + cy * 15;
                // 網点の濃さ。上に空、下に群れ、という濃淡を作る
                const v = 0.2 + 0.8 * Math.max(0, Math.sin(cy / 5.5) * 0.6 + (cy / 18) * 0.8 - Math.abs(cx - 14) / 40);
                return <circle key={`${cx}-${cy}`} cx={px} cy={py} r={1.2 + v * 5.4} fill={WP.ink} opacity={0.72} />;
              }),
            )}
            <text x={300} y={990} fontFamily={SEKAI_SERIF} fontSize={22} fill={WP.ink} opacity={0.8}>
              ホルムズ海峡を通過するタンカー（８日、ロイター）
            </text>
          </g>
          {/* 段組みの本文と、段を仕切る細い罫 */}
          {tate(790, 700, 18, 5, WP.ink, 0.44)}
          {tate(1330, 700, 12, 5, WP.ink, 0.4)}
          {tate(1660, 700, 18, 5, WP.ink, 0.36)}
          {[770, 1310, 1640].map((lx) => (
            <line key={lx} x1={lx} y1={680} x2={lx} y2={1010} stroke={WP.ink} strokeWidth={2} opacity={0.35} />
          ))}
          {/* 指が押さえた折り目。押さえるほど谷が深くなる */}
          <path d={`M -260,${1016} Q 700,${1002 - press * 10} 2060,${986}`} stroke={PAPER_SHADE} strokeWidth={14 + press * 10} fill="none" opacity={0.9} />
          <path d={`M -260,${1008} Q 700,${994 - press * 10} 2060,${978}`} stroke={WP.paperLit} strokeWidth={6} fill="none" opacity={0.8} />
          <path d={`M -260,${1026} Q 700,${1012 - press * 10} 2060,${996}`} stroke={WP.shadow} strokeWidth={5} fill="none" opacity={0.45} />
        </g>

        {/* ===== 湯気の立つマグ (右上・画面から見切れる) ===== */}
        <g transform="translate(1612 200)">
          <ellipse cx={0} cy={246} rx={190} ry={44} fill={WP.shadow} opacity={0.45} />
          <path d="M -150,-150 L -132,232 Q 0,264 132,232 L 150,-150 Z" fill={WP.kinari} stroke={WP.line} strokeWidth={3.4} />
          {/* 影側 */}
          <path d="M 60,-150 L 150,-150 L 132,232 Q 96,246 60,252 Z" fill={WP.kinariDim} opacity={0.75} />
          {/* 取っ手 */}
          <path d="M 148,-66 Q 268,-44 262,52 Q 256,136 142,142" fill="none" stroke={WP.line} strokeWidth={26} strokeLinecap="round" />
          <path d="M 148,-66 Q 268,-44 262,52 Q 256,136 142,142" fill="none" stroke={WP.kinari} strokeWidth={17} strokeLinecap="round" />
          {/* 口の縁と、中のコーヒー */}
          <ellipse cx={0} cy={-150} rx={150} ry={40} fill={WP.kinariDim} stroke={WP.line} strokeWidth={3.4} />
          <ellipse cx={0} cy={-146} rx={128} ry={31} fill={WP.chai} />
          <ellipse cx={-40} cy={-152} rx={44} ry={10} fill={WP.amberLit} opacity={0.4} />
          {/* 湯気。3本、f でゆらぐ */}
          {[0, 1, 2].map((i) => {
            const ph = f / 16 + i * 1.9;
            const bx = -70 + i * 70;
            const op = 0.26 + 0.2 * Math.abs(Math.sin(ph));
            return (
              <path
                key={i}
                d={`M ${bx},-180
                    C ${bx + Math.sin(ph) * 40},-280 ${bx - Math.sin(ph) * 46},-346 ${bx + Math.cos(ph) * 32},-440
                    C ${bx + Math.sin(ph + 1) * 40},-520 ${bx - 20},-560 ${bx + Math.sin(ph) * 24},-620`}
                stroke={WP.paperWhite}
                strokeWidth={16 - i * 2}
                strokeLinecap="round"
                fill="none"
                opacity={op}
              />
            );
          })}
        </g>

        {/* ===== 画面の隅で光るスマホの速報通知 (左下) ===== */}
        <g transform="translate(130 862) rotate(-7)">
          <ellipse cx={170} cy={210} rx={230} ry={40} fill={WP.shadow} opacity={0.4} />
          <rect x={0} y={0} width={344} height={250} rx={26} fill={WP.phoneBlack} stroke={WP.line} strokeWidth={3.4} />
          <rect x={14} y={14} width={316} height={236} rx={18} fill="#0E1726" />
          {/* 速報の帯。脈打つ */}
          {(() => {
            const p = 0.55 + 0.45 * Math.abs(Math.sin(f / 9));
            return (
              <>
                <ellipse cx={172} cy={120} rx={300} ry={230} fill="url(#a02-sokuhou)" opacity={p * 0.9} />
                <rect x={30} y={34} width={120} height={42} rx={6} fill={WP.alert} opacity={0.92} />
                <text x={90} y={66} fontFamily={SEKAI_SERIF} fontSize={30} fontWeight={700} fill={WP.paperWhite} textAnchor="middle">
                  速報
                </text>
                <rect x={30} y={96} width={282} height={11} fill={WP.screenLit} opacity={0.85 * p} />
                <rect x={30} y={120} width={242} height={11} fill={WP.screenLit} opacity={0.7 * p} />
                <rect x={30} y={144} width={196} height={11} fill={WP.screenLit} opacity={0.55 * p} />
                <rect x={30} y={190} width={96} height={9} fill={WP.screenBlue} opacity={0.6} />
              </>
            );
          })()}
        </g>

        {/* ===== 左手。下の古い紙を右へ押している。親指と4指 ===== */}
        <g transform={`translate(${-150 + slide * 36} 150)`}>
          {/* 手の甲。小口から見切れて入る */}
          <path
            d="M -260,-40 L 230,-10 Q 300,40 300,120 Q 300,210 220,250 L -260,290 Z"
            fill={WP.skin}
            stroke={WP.line}
            strokeWidth={3}
          />
          <path d="M -260,170 L 240,196 Q 300,180 300,120 Q 300,212 220,250 L -260,290 Z" fill={WP.skinShade} opacity={0.55} />
          {/* 甲の皺。手首の横皺と、指の付け根のふくらみ */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-170 + i * 26},-20 Q ${-160 + i * 26},120 ${-172 + i * 26},272`} stroke={WP.skinShade} strokeWidth={2.4} fill="none" opacity={0.5} />
          ))}
          {[30, 110, 186].map((ky, i) => (
            <path key={`n${i}`} d={`M 236,${ky - 26} Q 274,${ky} 236,${ky + 26}`} stroke={WP.skinShade} strokeWidth={2.6} fill="none" opacity={0.65} />
          ))}
          {/* 人差し指と中指が紙を押す。薬指と小指は一段奥 */}
          <Yubi x={250} y={34} ang={6} len={230} w={74} />
          <Yubi x={252} y={118} ang={-1} len={246} w={78} />
          <Yubi x={244} y={198} ang={-9} len={212} w={70} />
          {/* 親指は紙の端に掛ける */}
          <Yubi x={150} y={268} ang={-48} len={172} w={86} />
        </g>

        {/* ===== 右手。折り目を押さえている指 ===== */}
        <g transform={`translate(840 ${1114 - press * 18})`}>
          {/* 掌は画面の下に見切れる */}
          <path d="M -210,250 L -250,-10 Q -130,-74 60,-70 Q 250,-66 330,10 L 350,250 Z" fill={WP.skin} stroke={WP.line} strokeWidth={3} />
          <path d="M 170,-40 Q 290,-20 330,10 L 350,250 L 150,250 Z" fill={WP.skinShade} opacity={0.5} />
          {/* 指の付け根のふくらみ3つ */}
          {[-170, -40, 92].map((kx, i) => (
            <path key={i} d={`M ${kx - 30},-18 Q ${kx},-54 ${kx + 30},-18`} stroke={WP.skinShade} strokeWidth={2.6} fill="none" opacity={0.6} />
          ))}
          {/* 人差し指だけが前に出て折り目を押さえる。爪が正面を向く */}
          <Yubi x={-104} y={-26} ang={-96} len={214} w={80} />
          <Yubi x={54} y={-34} ang={-84} len={176} w={76} />
          {/* 押さえた指の下にできる皮膚の白み */}
          <ellipse cx={-96} cy={-224} rx={34} ry={18} fill={WP.paperLit} opacity={0.3 * press} />
        </g>

        {/* 紙の上に落ちる手の影。手が物として乗っていることを見せる */}
        <ellipse cx={210} cy={360} rx={300} ry={150} fill={WP.shadow} opacity={0.28} />
        <ellipse cx={880} cy={1010} rx={300} ry={110} fill={WP.shadow} opacity={0.26} />
      </Cam>
    </WarmStage>
  );
};

// ===================================================================
// #3 山 つながる世界史。
// 4点が結ばれた地球の上に題字。縦書き明朝、錆朱の罫。線がゆっくり脈打つ。
// ===================================================================
const S03: SekaiArt = ({ f }) => {
  const chars = "つながる世界史".split("");
  const TX = 1430,
    TY0 = 176,
    STEP = 104;
  const rule = easeOut(seg(f, 2, 32));
  const bot = TY0 + (chars.length - 1) * STEP;
  return (
    // 題字の枚。地は茶に転ばせず紺側へ。光源は月のような青白一灯
    <NightStage f={f} uid="a03" src={[1430, 120]} srcR={880} motes={30} vig={0.9} bg={SPACE} glow={MOONLIGHT}>
      {/* 奥: 結ばれた紺の地球。線はゆっくり脈打つ */}
      <GlobeNavy f={f} uid="a03g" lightAt={[0, 2, 4, 6]} linkAt={0} labels={false} />
      {/* 題字の下に敷く暗がり。字が球に埋もれないように。縁は溶かす */}
      <defs>
        <radialGradient id="a03-back" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={EARTH_LOW} stopOpacity={0.68} />
          <stop offset="58%" stopColor={EARTH_LOW} stopOpacity={0.54} />
          <stop offset="100%" stopColor={EARTH_LOW} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={TX} cy={(TY0 + bot) / 2} rx={360} ry={580} fill="url(#a03-back)" opacity={rule} />
      {/* 錆朱の罫。上から下へ引かれる */}
      <line x1={TX + 104} y1={TY0 - 96} x2={TX + 104} y2={TY0 - 96 + (bot + 130 - (TY0 - 96)) * rule} stroke={WP.sabi} strokeWidth={9} strokeLinecap="round" />
      <line x1={TX - 104} y1={TY0 - 96} x2={TX - 104} y2={TY0 - 96 + (bot + 130 - (TY0 - 96)) * rule} stroke={WP.sabi} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      {/* 題字。1字ずつ落ちる */}
      {chars.map((c, i) => {
        const t = easeOut(seg(f, 8 + i * 4, 8 + i * 4 + 16));
        return (
          <text
            key={i}
            x={TX}
            y={TY0 + i * STEP + (1 - t) * 26}
            fontFamily={SEKAI_SERIF}
            fontSize={96}
            fontWeight={700}
            fill={WP.kinari}
            textAnchor="middle"
            opacity={t}
          >
            {c}
          </text>
        );
      })}
      {/* 字の縁。紺の空に青白く起こす (金にすると茶に転ぶ) */}
      {chars.map((c, i) => {
        const t = easeOut(seg(f, 8 + i * 4, 8 + i * 4 + 16));
        return (
          <text
            key={`r${i}`}
            x={TX}
            y={TY0 + i * STEP + (1 - t) * 26}
            fontFamily={SEKAI_SERIF}
            fontSize={96}
            fontWeight={700}
            fill="none"
            stroke={WP.star}
            strokeWidth={2}
            textAnchor="middle"
            opacity={t * 0.5}
          >
            {c}
          </text>
        );
      })}
      {/* 錆朱の印。題字の足元 */}
      <g opacity={easeOut(seg(f, 38, 54))}>
        <rect x={TX - 34} y={bot + 42} width={68} height={68} rx={4} fill={WP.sabi} />
        <rect x={TX - 34} y={bot + 42} width={68} height={68} rx={4} fill="none" stroke={WP.sabiDeep} strokeWidth={4} />
        {/* 落款の彫り。四分割した抽象の字面 */}
        {[0, 1].map((cx) =>
          [0, 1].map((cy) => (
            <g key={`${cx}-${cy}`}>
              <rect x={TX - 20 + cx * 22} y={bot + 56 + cy * 22} width={16} height={5} fill={WP.kinari} opacity={0.85} />
              <rect x={TX - 20 + cx * 22} y={bot + 56 + cy * 22} width={5} height={16} fill={WP.kinari} opacity={0.85} />
              <rect x={TX - 9 + cx * 22} y={bot + 67 + cy * 22} width={5} height={5} fill={WP.kinari} opacity={0.6} />
            </g>
          )),
        )}
      </g>
      {/* ===================================================================
          ★2026-11-09 描き直し (別紙A #3)
          もとはここに ShadeFigure が2つ置いてあった。無貌の黒い影は廃止。
          構図 煽り。見上げる2人を後ろ姿＋横顔で。顔の造作は横顔で見せる。
          人 学ランの男子高校生 (詰襟・ホック・今の髪) / ジャケットの女性記者
             (切りっぱなしボブ＝この動画の反応役b)。年齢と性別を変える。
          足す物 歩道の点字ブロック / 自販機の灯り / ベンチ / 記者の取材パス
          =================================================================== */}
      {(() => {
        const rise = easeOut(seg(f, 14, 46));
        const look = easeInOut(seg(f, 30, 62)); // 2人が顎を上げていく量
        const swing = Math.sin(f / 19) * 4; // 取材パスの揺れ
        const vend = 0.8 + 0.2 * Math.abs(Math.sin(f / 31)); // 自販機の蛍光灯のゆらぎ
        return (
          <g opacity={rise}>
            {/* ── 左端の自販機。夜の路上でいちばん明るい物 ── */}
            <g transform="translate(-70 362)">
              <rect x={0} y={0} width={300} height={648} fill={WP.steelDark} stroke={WP.line} strokeWidth={3.4} />
              <rect x={0} y={0} width={300} height={648} fill={WP.jihanki} opacity={0.55} />
              {/* 見本の並ぶ光る窓。枠は鉄、中は冷たい白 */}
              <rect x={22} y={34} width={256} height={300} fill="#0D1520" stroke={WP.steel} strokeWidth={3} />
              <rect x={28} y={40} width={244} height={288} fill={WP.screenLit} opacity={0.22 * vend} />
              {[0, 1, 2].map((r) =>
                [0, 1, 2, 3].map((c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={38 + c * 58}
                    y={52 + r * 94}
                    width={44}
                    height={78}
                    rx={6}
                    fill={[WP.signRed, WP.signGreen, WP.amber, WP.screenBlue][(r + c) % 4]}
                    opacity={0.9}
                  />
                )),
              )}
              {/* 取り出し口と、硬貨の投入口・返却レバー */}
              <rect x={22} y={356} width={256} height={56} fill="#0A0D12" stroke={WP.steel} strokeWidth={3} />
              <rect x={210} y={436} width={56} height={10} fill={WP.steelLit} opacity={0.8} />
              <circle cx={238} cy={480} r={13} fill={WP.steelLit} opacity={0.7} />
              <rect x={22} y={430} width={150} height={190} fill={WP.steelDark} opacity={0.7} />
              {/* 自販機が歩道にこぼす光 */}
              <path d="M 300,40 L 760,260 L 820,1000 L 300,1000 Z" fill={WP.screenLit} opacity={0.11 * vend} />
              <path d="M 300,340 L 640,420 L 660,700 L 300,660 Z" fill={WP.screenLit} opacity={0.07 * vend} />
            </g>

            {/* ── 右下のベンチ。煽りなので座面の裏の桟が見える ── */}
            <g transform="translate(1150 942)">
              <path d="M 0,26 L 770,0 L 770,44 L 0,74 Z" fill={WP.woodDark} />
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M 0,${74 + i * 30} L 770,${44 + i * 28} L 770,${64 + i * 28} L 0,${96 + i * 30} Z`} fill={WP.wood} opacity={0.85 - i * 0.14} />
              ))}
              <rect x={96} y={86} width={30} height={160} fill={WP.steelDark} />
              <rect x={620} y={62} width={30} height={160} fill={WP.steelDark} />
              <path d="M 0,26 L 770,0" stroke={WP.rim} strokeWidth={2.6} opacity={0.5} fill="none" />
            </g>

            {/* ── 歩道の点字ブロック。線型 (誘導) ブロックが手前を横切る ── */}
            <g>
              <path d="M -200,998 L 2120,948 L 2120,1120 L -200,1120 Z" fill={WP.concreteDark} />
              <path d="M -200,1012 L 2120,962 L 2120,1070 L -200,1086 Z" fill={WP.tenjiYellow} opacity={0.9} />
              {Array.from({ length: 26 }, (_, i) => {
                const bx = -180 + i * 90;
                const ty = 1016 - (bx / 2320) * 50;
                return (
                  <g key={i}>
                    {[0, 1, 2, 3].map((b) => (
                      <rect key={b} x={bx + 6} y={ty + 8 + b * 22} width={64} height={11} rx={4} fill={WP.ink} opacity={0.3} />
                    ))}
                    <line x1={bx} y1={ty} x2={bx - 4} y2={ty + 104} stroke={WP.concreteDark} strokeWidth={3} opacity={0.6} />
                  </g>
                );
              })}
            </g>

            {/* ── 男子高校生。学ランの後ろ姿。顔は見せない (後ろ向きだから) ── */}
            <g transform={`translate(430 1004)`}>
              {/* 脚。煽りなので腿が短く見える */}
              <path d="M -66,0 L -74,-300 L -14,-300 L -18,0 Z" fill={WP.gakuran} stroke={WP.line} strokeWidth={3} />
              <path d="M 16,0 L 12,-300 L 72,-300 L 68,0 Z" fill={WP.gakuran} stroke={WP.line} strokeWidth={3} />
              <path d="M -74,-300 L -14,-300 L -18,-250 L -70,-250 Z" fill={WP.line} opacity={0.3} />
              {/* 靴 */}
              <path d="M -78,0 L -14,0 L -8,30 L -92,30 Z" fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
              <path d="M 14,0 L 78,0 L 86,30 L 6,30 Z" fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
              {/* 学ランの上着。裾が腰で切れ、背中の中心に縫い目 */}
              <path
                d="M -104,-286 L -118,-540 Q -112,-596 -58,-612 L 58,-612 Q 112,-596 118,-540 L 104,-286 Z"
                fill={WP.gakuran}
                stroke={WP.line}
                strokeWidth={3.4}
              />
              <line x1={0} y1={-608} x2={0} y2={-286} stroke={WP.line} strokeWidth={2.6} opacity={0.55} />
              {/* 肩の山と、背中に当たる自販機の冷たい光 */}
              <path d="M -118,-540 Q -112,-596 -58,-612 L -40,-612 L -84,-300 L -104,-300 Z" fill={WP.screenLit} opacity={0.17} />
              <path d="M 58,-612 Q 112,-596 118,-540 L 104,-300 L 70,-300 Z" fill={WP.steelDark} opacity={0.4} />
              {/* 詰襟。後ろから見ると首をぐるりと囲む帯。ホックは後ろ中心で留まる */}
              <path d="M -62,-612 Q 0,-632 62,-612 L 58,-654 Q 0,-676 -58,-654 Z" fill={WP.gakuran} stroke={WP.line} strokeWidth={3} />
              <path d="M -58,-654 Q 0,-676 58,-654" stroke={WP.paperWhite} strokeWidth={5} fill="none" opacity={0.55} />
              <circle cx={0} cy={-640} r={6} fill={WP.steelLit} opacity={0.7} />
              {/* 腕。見上げているので肩が後ろに引かれ、両手は体側 */}
              <path d="M -112,-556 Q -150,-520 -152,-430 L -140,-316 L -102,-320 L -104,-440 Z" fill={WP.gakuran} stroke={WP.line} strokeWidth={3} />
              <path d="M 112,-556 Q 150,-520 152,-430 L 140,-316 L 102,-320 L 104,-440 Z" fill={WP.gakuran} stroke={WP.line} strokeWidth={3} />
              <ellipse cx={-122} cy={-296} rx={26} ry={32} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
              <ellipse cx={122} cy={-296} rx={26} ry={32} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
              {/* 首。顎を上げるぶん後ろから見える面が増える */}
              <path d={`M -34,-640 L 34,-640 L ${30 - look * 2},${-700 - look * 10} L ${-30 + look * 2},${-700 - look * 10} Z`} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
              <path d={`M -34,-640 L 34,-640 L 30,-668 L -30,-668 Z`} fill={WP.skinShade} opacity={0.55} />
              {/* 後ろ頭。丸刈りではない今の髪。つむじと襟足を描く */}
              <g transform={`translate(0 ${-704 - look * 10}) rotate(${-look * 5})`}>
                <ellipse cx={0} cy={-104} rx={96} ry={116} fill="#23222A" stroke={WP.line} strokeWidth={3.4} />
                {/* つむじ。毛流れの細線は描かない (作者の嫌うところ) ので面で分ける */}
                <ellipse cx={-22} cy={-150} rx={40} ry={26} fill="#2E2D38" />
                <path d="M -96,-104 Q -70,-206 20,-214 Q 92,-206 96,-112 Q 60,-180 -20,-176 Q -74,-168 -96,-104 Z" fill="#35343F" opacity={0.8} />
                {/* 襟足 */}
                <path d="M -64,4 Q 0,34 64,4 L 58,24 Q 0,52 -58,24 Z" fill="#1A1921" />
                {/* 耳。横に見切れる */}
                <ellipse cx={-94} cy={-86} rx={17} ry={30} fill={WP.skin} stroke={WP.line} strokeWidth={2.4} />
                <ellipse cx={94} cy={-86} rx={17} ry={30} fill={WP.skin} stroke={WP.line} strokeWidth={2.4} />
                {/* 青白い縁。夜の地球と自販機の光で頭を背景から起こす */}
                <path d="M -96,-110 Q -70,-216 24,-216" stroke={WP.star} strokeWidth={4} fill="none" opacity={0.6} />
              </g>
            </g>

            {/* ── 女性記者。顔の造作は横顔で見せる。顔の高さ約280px ── */}
            <g transform={`translate(760 1016)`}>
              {/* 脚。ジャケットの下はスラックス */}
              <path d="M -58,0 L -66,-290 L -6,-290 L -12,0 Z" fill={WP.steelDark} stroke={WP.line} strokeWidth={3} />
              <path d="M 20,0 L 16,-290 L 76,-290 L 70,0 Z" fill={WP.steelDark} stroke={WP.line} strokeWidth={3} />
              <path d="M -62,0 L -8,0 L -2,28 L -76,28 Z" fill={WP.ink} stroke={WP.line} strokeWidth={2.6} />
              <path d="M 18,0 L 74,0 L 82,28 L 10,28 Z" fill={WP.ink} stroke={WP.line} strokeWidth={2.6} />
              {/* ジャケット。前を開けて、下にシャツ */}
              <path d="M -96,-282 L -108,-520 Q -102,-574 -52,-590 L 52,-590 Q 102,-574 108,-520 L 96,-282 Z" fill={WP.steelDark} stroke={WP.line} strokeWidth={3.4} />
              <path d="M -30,-586 L -16,-282 L 20,-282 L 34,-586 Z" fill={WP.paperWhite} opacity={0.9} />
              <path d="M -30,-586 L -62,-520 L -40,-300 L -16,-282 Z" fill={WP.steelDark} stroke={WP.line} strokeWidth={2.6} />
              <path d="M 34,-586 L 66,-520 L 44,-300 L 20,-282 Z" fill={WP.steelDark} stroke={WP.line} strokeWidth={2.6} />
              {/* 自販機の光が左肩に、地球の光が頭の右に乗る */}
              <path d="M -108,-520 Q -102,-574 -52,-590 L -36,-590 L -74,-300 L -96,-300 Z" fill={WP.screenLit} opacity={0.2} />
              {/* 腕。片手はノートを握り、もう片手は下げている */}
              <path d="M -104,-534 Q -142,-498 -144,-410 L -132,-300 L -96,-304 L -98,-420 Z" fill={WP.steelDark} stroke={WP.line} strokeWidth={3} />
              <path d="M 104,-534 Q 146,-496 142,-420 L 112,-346 L 78,-366 L 100,-430 Z" fill={WP.steelDark} stroke={WP.line} strokeWidth={3} />
              {/* 手。関節と爪 */}
              <ellipse cx={-116} cy={-282} rx={27} ry={33} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
              <g transform="translate(96 -344) rotate(24)">
                <rect x={-14} y={-26} width={88} height={116} rx={6} fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.6} />
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect key={i} x={-2} y={-10 + i * 20} width={62} height={5} fill={WP.line} opacity={0.4} />
                ))}
                <rect x={-16} y={-30} width={92} height={12} rx={5} fill={WP.sabi} />
                <ellipse cx={-6} cy={34} rx={30} ry={38} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
                {[0, 1, 2].map((i) => (
                  <path key={`fg${i}`} d={`M -30,${16 + i * 18} Q 4,${8 + i * 18} 24,${20 + i * 18}`} stroke={WP.skinShade} strokeWidth={2.6} fill="none" />
                ))}
              </g>
              {/* 首から下げた取材パス。紐はベージュ、札は横長。ゆれる */}
              <g transform={`translate(0 -560) rotate(${swing})`}>
                <path d="M -46,0 L -14,158" stroke={WP.kinariDim} strokeWidth={7} fill="none" />
                <path d="M 46,0 L 18,158" stroke={WP.kinariDim} strokeWidth={7} fill="none" />
                <g transform="translate(2 158)">
                  <rect x={-58} y={0} width={116} height={78} rx={5} fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.6} />
                  <rect x={-58} y={0} width={116} height={20} fill={WP.sabi} />
                  <text x={0} y={16} fontFamily={SEKAI_SERIF} fontSize={14} fill={WP.paperWhite} textAnchor="middle">
                    取材
                  </text>
                  <rect x={-50} y={28} width={34} height={42} fill={WP.kinariDim} stroke={WP.line} strokeWidth={1.8} />
                  <rect x={-8} y={32} width={58} height={6} fill={WP.line} opacity={0.5} />
                  <rect x={-8} y={46} width={44} height={5} fill={WP.line} opacity={0.4} />
                  <rect x={-8} y={58} width={50} height={5} fill={WP.line} opacity={0.35} />
                </g>
              </g>
              {/* 首。顎を上げているので喉が見える */}
              <path d={`M -28,-586 L 28,-586 L 24,${-648 - look * 12} L -24,${-648 - look * 12} Z`} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
              <path d="M -28,-586 L 28,-586 L 26,-614 L -26,-614 Z" fill={WP.skinShade} opacity={0.5} />
              {/* 頭。右 (題字の方) を向いた横顔。顎を上げる */}
              <g transform={`translate(0 ${-652 - look * 12}) rotate(${12 + look * 9})`}>
                {/* 顔の輪郭。額→鼻→上唇→下唇→顎→喉。高さ約280px */}
                <path
                  d="M 6,-266 Q 74,-258 86,-176 Q 94,-124 92,-86
                     L 104,-62 L 86,-52 L 90,-28 L 72,-20
                     Q 76,4 46,14 Q 10,22 -20,8
                     Q -60,-16 -64,-96 Q -70,-200 6,-266 Z"
                  fill={WP.skin}
                  stroke={WP.line}
                  strokeWidth={3.4}
                />
                {/* 影側。顔の下半分と首の付け根 */}
                <path d="M -20,8 Q 10,22 46,14 Q 76,4 72,-20 L 40,-6 Q 6,4 -20,-6 Z" fill={WP.skinShade} opacity={0.45} />
                {/* 目。横顔なので片目。見開いて上を見る。白目＋瞳 */}
                <ellipse cx={52} cy={-146} rx={22} ry={15} fill={WP.paperWhite} />
                <ellipse cx={52} cy={-146} rx={22} ry={15} fill="none" stroke={WP.line} strokeWidth={2.6} />
                <circle cx={60} cy={-150} r={10} fill={WP.ink} />
                <circle cx={64} cy={-154} r={3.4} fill={WP.paperWhite} opacity={0.9} />
                {/* 上まつげ。3本だけ、はじく向きに */}
                {[0, 1, 2].map((i) => (
                  <path key={i} d={`M ${64 + i * 8},${-160 - i * 2} l ${7 + i},${-7}`} stroke={WP.ink} strokeWidth={2.6} />
                ))}
                {/* 眉。細い弧 (男子と描き分ける) */}
                <path d="M 24,-184 Q 52,-198 78,-182" stroke="#2A2630" strokeWidth={7} fill="none" strokeLinecap="round" />
                {/* 鼻の穴の陰と、人中 */}
                <path d="M 86,-58 Q 96,-54 92,-46" stroke={WP.skinShade} strokeWidth={3} fill="none" />
                <path d="M 70,-24 Q 62,-14 64,-6" stroke={WP.skinShade} strokeWidth={2.4} fill="none" opacity={0.7} />
                {/* 口。わずかに開いている (見上げて息を止めた顔) */}
                <path d="M 42,-10 Q 62,-14 72,-8" stroke={WP.line} strokeWidth={3} fill="none" />
                <path d="M 46,-6 Q 60,2 70,-4" fill={WP.inkRed} opacity={0.5} />
                {/* 耳 */}
                <ellipse cx={-26} cy={-116} rx={19} ry={30} fill={WP.skin} stroke={WP.line} strokeWidth={2.4} />
                <path d="M -30,-128 Q -18,-116 -28,-102" stroke={WP.skinShade} strokeWidth={2.4} fill="none" />
                {/* 切りっぱなしボブ。毛先は水平に切り揃える */}
                <path
                  d="M 10,-278 Q 92,-268 100,-168 L 104,-104 L 48,-104 L 54,-150
                     Q 40,-188 0,-196 Q -46,-196 -66,-150 L -72,-40 L -126,-40
                     Q -124,-180 -72,-240 Q -44,-274 10,-278 Z"
                  fill="#26222B"
                  stroke={WP.line}
                  strokeWidth={3.4}
                />
                {/* 毛先の切り口。水平の一本 */}
                <path d="M -126,-40 L -72,-40" stroke={WP.line} strokeWidth={4} />
                {/* 前髪のかたまりを面で分ける */}
                <path d="M 10,-278 Q 86,-266 100,-176 Q 70,-234 8,-240 Q -36,-240 -62,-204 Q -44,-268 10,-278 Z" fill="#332E3A" opacity={0.85} />
                {/* 青白い縁。夜空から頭を分離する (第4条のリムライト) */}
                <path d="M 10,-278 Q 92,-268 100,-168" stroke={WP.star} strokeWidth={4.4} fill="none" opacity={0.65} />
                <path d="M 6,-266 Q 74,-258 86,-176" stroke={WP.star} strokeWidth={2.6} fill="none" opacity={0.3} />
              </g>
            </g>

            {/* 2人の足元の影。点字ブロックの上に落ちる */}
            <ellipse cx={430} cy={1024} rx={170} ry={30} fill={NIGHT_DEEP} opacity={0.55} />
            <ellipse cx={760} cy={1036} rx={158} ry={28} fill={NIGHT_DEEP} opacity={0.5} />
          </g>
        );
      })()}
    </NightStage>
  );
};

// ===================================================================
// #4 山 1945年8月15日、正午。  ★実装済み。触らない
// ===================================================================
const S04: SekaiArt = ({ f }) => <SekaiBoutouArt f={f} color />;

// ===================================================================
// #5 並 ラジオから、雑音まじりの声が流れました。
// ★2026-11-09 描き直し (別紙A #5)「寄りは今のままでよい。物の密度を上げる」
//   足した物 真空管のオレンジの灯を2本 / スピーカー布の織り目 /
//            ダイヤルの目盛りと周波数の数字 (kc) / 木目とニスの照り /
//            つまみのローレット / 埃 / ラジオの上の神棚の榊と米 / 背板の通気の穴
//   事件 雑音のとき、真空管の灯が音にあわせて沈む
// ===================================================================
const S05: SekaiArt = ({ f }) => {
  const CX5 = 700,
    CY5 = 662,
    R5 = 336; // 格子は 672px。短辺の半分 (540) を超える
  // ★事件: 30〜76フレームが雑音の山。灯はその波にあわせて沈む
  const zatsu = Math.max(0, Math.sin(Math.max(0, Math.min(1, (f - 30) / 46)) * Math.PI));
  const hum = 0.66 + Math.sin(f / 2.3) * 0.05; // ふだんのヒーターの灯
  const dip = zatsu * (0.3 + 0.24 * Math.abs(Math.sin(f / 1.7)));
  const glowT = Math.max(0.14, hum - dip);
  const needle = Math.sin(f / 5.3) * 3.4 + Math.sin(f / 1.9) * 1.2 + zatsu * Math.sin(f / 1.3) * 3;
  // 目盛りの数字。1945年の受信機なので単位は kc (キロサイクル)
  const kc = [550, 700, 900, 1100, 1300, 1500];
  return (
    <WarmStage f={f} uid="a05" src={[250, 110]} srcR={820} motes={24} vig={0.92}>
      <Cam f={f} from={[0, 0, 1.0]} to={[-40, -12, 1.1]} start={0} end={58}>
        <defs>
          <linearGradient id="a05-wood" x1="0" y1="0" x2="0.65" y2="1">
            <stop offset="0%" stopColor={WP.wood} />
            <stop offset="46%" stopColor={WP.woodDark} />
            <stop offset="100%" stopColor={WP.shadowDeep} />
          </linearGradient>
          <linearGradient id="a05-slat" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={WP.wood} />
            <stop offset="100%" stopColor={WP.shadowDeep} />
          </linearGradient>
          <linearGradient id="a05-nisu" x1="0" y1="0" x2="1" y2="1">
            {/* ニスの照り。木の面を斜めに走る一筋 */}
            <stop offset="0%" stopColor={WP.rim} stopOpacity={0} />
            <stop offset="42%" stopColor={WP.rim} stopOpacity={0.3} />
            <stop offset="56%" stopColor={WP.glow} stopOpacity={0.14} />
            <stop offset="100%" stopColor={WP.rim} stopOpacity={0} />
          </linearGradient>
          <radialGradient id="a05-tube" cx="50%" cy="40%" r="56%">
            <stop offset="0%" stopColor={WP.amberLit} stopOpacity={0.95} />
            <stop offset="62%" stopColor={WP.amber} stopOpacity={0.4} />
            <stop offset="100%" stopColor={WP.amber} stopOpacity={0} />
          </radialGradient>
          <clipPath id="a05-grille">
            <circle cx={CX5} cy={CY5} r={R5} />
          </clipPath>
        </defs>

        {/* ── 壁と、ラジオの上の神棚 ── */}
        <rect x={-200} y={-200} width={W + 400} height={460} fill={WP.shikkui} />
        <rect x={-200} y={-200} width={W + 400} height={460} fill={WP.natsuKage} opacity={0.18} />
        {/* 壁の汚れ。面で置く */}
        <ellipse cx={1500} cy={120} rx={420} ry={150} fill={WP.sunakabe} opacity={0.22} />
        <g>
          {/* 棚板と腕木 */}
          <rect x={300} y={178} width={840} height={30} fill={WP.wood} />
          <rect x={300} y={178} width={840} height={7} fill={WP.rim} opacity={0.6} />
          <rect x={300} y={208} width={840} height={14} fill={WP.woodDark} />
          <path d="M 352,222 L 392,222 L 352,262 Z" fill={WP.woodDark} />
          <path d="M 1048,222 L 1088,222 L 1048,262 Z" fill={WP.woodDark} />
          {/* 宮形。切妻の屋根・2本の柱・閉じた扉 */}
          <g transform="translate(720 178)">
            <path d="M -126,0 L -96,-54 L 96,-54 L 126,0 Z" fill={WP.kinari} stroke={WP.line} strokeWidth={3} />
            <path d="M -96,-54 L 96,-54 L 92,-62 L -92,-62 Z" fill={WP.wood} />
            <path d="M -126,0 L 126,0 L 126,8 L -126,8 Z" fill={WP.woodDark} />
            <rect x={-74} y={-54} width={148} height={54} fill={WP.woodDark} opacity={0.6} />
            <rect x={-40} y={-50} width={80} height={50} fill={WP.wood} stroke={WP.line} strokeWidth={2.4} />
            <line x1={0} y1={-50} x2={0} y2={0} stroke={WP.line} strokeWidth={2.4} />
            {/* 千木 */}
            <path d="M -14,-62 L 0,-96 L 14,-62" stroke={WP.line} strokeWidth={4} fill="none" />
          </g>
          {/* 榊。常緑の濃い緑。葉は小判形で、2本の榊立てに */}
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${720 + sd * 236} 178)`}>
              {/* 榊立て。白磁 */}
              <path d="M -26,0 L -20,-56 L 20,-56 L 26,0 Z" fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.6} />
              <ellipse cx={0} cy={-56} rx={20} ry={6} fill={WP.kinariDim} stroke={WP.line} strokeWidth={2} />
              {/* 枝と葉 */}
              <path d={`M 0,-56 L ${sd * 6},-128`} stroke={WP.matsuMiki} strokeWidth={6} />
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const ly = -70 - i * 12;
                const side = i % 2 === 0 ? 1 : -1;
                return (
                  <g key={i} transform={`translate(${side * (16 + i * 2)} ${ly}) rotate(${side * (34 - i * 4)})`}>
                    <ellipse rx={23} ry={11} fill={WP.sakaki} stroke={WP.line} strokeWidth={2} />
                    <ellipse cx={-5} cy={-3} rx={12} ry={4} fill={WP.leaf} opacity={0.5} />
                  </g>
                );
              })}
              <ellipse cx={sd * 4} cy={-136} rx={20} ry={12} fill={WP.sakaki} stroke={WP.line} strokeWidth={2} />
            </g>
          ))}
          {/* 米。白い小皿に盛った山 */}
          <g transform="translate(720 178)">
            <ellipse cx={0} cy={-2} rx={62} ry={14} fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.6} />
            <path d="M -46,-4 Q 0,-46 46,-4 Z" fill={WP.kome} stroke={WP.line} strokeWidth={2.4} />
            {/* 粒。一粒ずつ置く */}
            {Array.from({ length: 26 }, (_, i) => (
              <ellipse
                key={i}
                cx={-40 + ((i * 7) % 80)}
                cy={-8 - ((i * 11) % 26)}
                rx={4}
                ry={2.4}
                transform={`rotate(${(i * 37) % 180} ${-40 + ((i * 7) % 80)} ${-8 - ((i * 11) % 26)})`}
                fill={WP.paperWhite}
                opacity={0.8}
              />
            ))}
          </g>
          {/* 注連縄。棚板の前に張る */}
          <path d="M 318,172 Q 720,196 1122,172" stroke={WP.kinariDim} strokeWidth={13} fill="none" />
          <path d="M 318,172 Q 720,196 1122,172" stroke={WP.line} strokeWidth={3} fill="none" opacity={0.35} />
          {[430, 580, 730, 880, 1030].map((sx, i) => (
            <path key={sx} d={`M ${sx},${182 + (i === 2 ? 10 : 6)} l -9,42 l 18,0 Z`} fill={WP.paperWhite} opacity={0.9} />
          ))}
        </g>

        {/* ── キャビネット ── */}
        <rect x={-200} y={260} width={W + 400} height={H + 240} fill="url(#a05-wood)" />
        {/* 木目。細い線を引かず、幅の違う縦の面の濃淡で作る */}
        <g opacity={0.24}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={-120 + i * 290} y={260} width={64 + (i % 3) * 46} height={H + 240} fill={i % 2 === 0 ? WP.shadowDeep : WP.wall} />
          ))}
        </g>
        {/* 木口の節。2つだけ。これが「木の板」の証拠になる */}
        <ellipse cx={310} cy={1000} rx={46} ry={22} fill={WP.shadowDeep} opacity={0.4} />
        <ellipse cx={310} cy={1000} rx={26} ry={11} fill={WP.woodDark} opacity={0.7} />
        <ellipse cx={1210} cy={334} rx={38} ry={17} fill={WP.shadowDeep} opacity={0.35} />
        {/* ニスの照り。斜めに一筋 */}
        <rect x={-200} y={260} width={W + 400} height={H + 240} fill="url(#a05-nisu)" />
        {/* 上の繰り形。3段の段差 */}
        <rect x={-200} y={236} width={W + 400} height={34} fill={WP.wall} />
        <rect x={-200} y={236} width={W + 400} height={9} fill={WP.rim} opacity={0.55} />
        <rect x={-200} y={270} width={W + 400} height={14} fill={WP.shadowDeep} opacity={0.7} />
        <rect x={-200} y={284} width={W + 400} height={22} fill={WP.wood} />
        <rect x={-200} y={306} width={W + 400} height={10} fill={WP.shadowDeep} opacity={0.5} />
        {/* ★埃。繰り形の水平面にだけ乗る */}
        <g>
          <rect x={-200} y={236} width={W + 400} height={6} fill={WP.sunakabe} opacity={0.4} />
          {Array.from({ length: 54 }, (_, i) => (
            <circle key={i} cx={-160 + i * 38 + ((i * 13) % 17)} cy={238 + ((i * 7) % 5)} r={1.4 + ((i * 5) % 3) * 0.8} fill={WP.sunakabe} opacity={0.55} />
          ))}
        </g>

        {/* ── スピーカーの格子。布 → 桟 → 真鍮の環 ── */}
        <circle cx={CX5} cy={CY5} r={R5 + 26} fill={WP.shadowDeep} opacity={0.8} />
        <circle cx={CX5} cy={CY5} r={R5} fill={WP.nunoSpeaker} />
        <g clipPath="url(#a05-grille)">
          {/* ★スピーカー布の織り目。縦糸と横糸を1本ずつ。14px の目 */}
          <g>
            {Array.from({ length: 50 }, (_, i) => (
              <rect key={`v${i}`} x={CX5 - R5 + i * 14} y={CY5 - R5} width={6} height={R5 * 2} fill={WP.kinariDim} opacity={0.16} />
            ))}
            {Array.from({ length: 50 }, (_, i) => (
              <rect key={`h${i}`} x={CX5 - R5} y={CY5 - R5 + i * 14} width={R5 * 2} height={6} fill={WP.shadowDeep} opacity={0.22} />
            ))}
            {/* 糸の交点が光る。織物に見せる最後の一手 */}
            {Array.from({ length: 25 }, (_, r) =>
              Array.from({ length: 25 }, (_, c) => (
                <rect key={`x${r}-${c}`} x={CX5 - R5 + c * 28} y={CY5 - R5 + r * 28} width={5} height={5} fill={WP.rim} opacity={0.14} />
              )),
            )}
          </g>
          {/* 布がすり切れた箇所。糸が飛んで奥の暗がりが見える */}
          <ellipse cx={CX5 + 190} cy={CY5 + 196} rx={44} ry={20} fill={WP.shadowDeep} opacity={0.6} />
          {/* 奥で灯る目盛りの光が布を透かす。灯が沈むとここも沈む */}
          <ellipse cx={CX5 - 80} cy={CY5 - 110} rx={270} ry={170} fill={WP.glow} opacity={0.07 + 0.06 * glowT} />
          {/* 桟 */}
          {Array.from({ length: 7 }, (_, i) => {
            const bx = CX5 - 300 + i * 100;
            return (
              <g key={i}>
                <rect x={bx} y={CY5 - R5 - 10} width={34} height={R5 * 2 + 20} rx={6} fill="url(#a05-slat)" />
                <rect x={bx} y={CY5 - R5 - 10} width={6} height={R5 * 2 + 20} fill={WP.rim} opacity={0.6} />
                <rect x={bx + 28} y={CY5 - R5 - 10} width={6} height={R5 * 2 + 20} fill={WP.line} opacity={0.7} />
              </g>
            );
          })}
          <rect x={CX5 - R5 - 10} y={CY5 - 24} width={R5 * 2 + 20} height={46} rx={6} fill="url(#a05-slat)" />
          <rect x={CX5 - R5 - 10} y={CY5 - 24} width={R5 * 2 + 20} height={7} fill={WP.rim} opacity={0.55} />
        </g>
        {/* 真鍮の環 */}
        <circle cx={CX5} cy={CY5} r={R5 + 13} fill="none" stroke={WP.amber} strokeWidth={24} />
        <circle cx={CX5} cy={CY5} r={R5 + 23} fill="none" stroke={WP.rim} strokeWidth={5} opacity={0.75} />
        <circle cx={CX5} cy={CY5} r={R5 + 2} fill="none" stroke={WP.line} strokeWidth={6} />
        <path
          d={`M ${CX5 - 349},${CY5 - 40} A ${R5 + 13} ${R5 + 13} 0 0 1 ${CX5 - 20},${CY5 - 349}`}
          fill="none"
          stroke={WP.glow}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.5}
        />
        {/* 環の下側に溜まった埃 */}
        {Array.from({ length: 22 }, (_, i) => {
          const a = (Math.PI * (0.18 + (i / 21) * 0.64)) + Math.PI * 0.09;
          return (
            <circle
              key={i}
              cx={CX5 + Math.cos(a) * (R5 + 24)}
              cy={CY5 + Math.sin(a) * (R5 + 24)}
              r={1.6 + ((i * 7) % 3) * 0.9}
              fill={WP.sunakabe}
              opacity={0.5}
            />
          );
        })}
        {/* 音。錆朱の波紋。雑音の山でいちばん大きく出る */}
        <g>
          {[0, 1, 2, 3].map((i) => {
            const t = seg(f, i * 13, i * 13 + 34);
            if (t <= 0 || t >= 1) return null;
            return (
              <ellipse
                key={i}
                cx={CX5}
                cy={CY5}
                rx={R5 + 36 + t * 300}
                ry={R5 * 0.5 + t * 190}
                fill="none"
                stroke={WP.sabi}
                strokeWidth={18 * (1 - t)}
                opacity={(1 - t) * (0.2 + 0.24 * zatsu)}
              />
            );
          })}
        </g>

        {/* ── ★真空管の覗き窓。灯は2本 ── */}
        <g>
          <rect x={1378} y={330} width={474} height={336} rx={10} fill="#140F09" stroke={WP.line} strokeWidth={6} />
          {[0, 1].map((i) => {
            const tx = 1486 + i * 232;
            // 2本は同じ灯ではない。整流管のほうが一段明るく、沈み方も遅い
            const g2 = i === 0 ? glowT : Math.max(0.16, glowT * 0.82 + 0.1);
            return (
              <g key={i}>
                <ellipse cx={tx} cy={470} rx={158} ry={168} fill="url(#a05-tube)" opacity={g2} />
                {/* ガラスの球。ST管の形 */}
                <path
                  d={`M ${tx - 52},562 L ${tx + 52},562 L ${tx + 58},452
                      C ${tx + 58},392 ${tx + 30},372 ${tx + 24},348
                      L ${tx - 24},348 C ${tx - 30},372 ${tx - 58},392 ${tx - 58},452 Z`}
                  fill={WP.shinkuukan}
                  opacity={0.26 + 0.42 * g2}
                />
                <path
                  d={`M ${tx - 52},562 L ${tx + 52},562 L ${tx + 58},452
                      C ${tx + 58},392 ${tx + 30},372 ${tx + 24},348
                      L ${tx - 24},348 C ${tx - 30},372 ${tx - 58},392 ${tx - 58},452 Z`}
                  fill="none"
                  stroke={WP.rim}
                  strokeWidth={3}
                  opacity={0.85}
                />
                {/* ガラスのなかのプレートと、オレンジに灯るヒーター */}
                <rect x={tx - 26} y={432} width={52} height={104} fill={WP.ink} opacity={0.75} />
                <rect x={tx - 4} y={430} width={8} height={108} fill={WP.shinkuukan} opacity={0.5 + 0.5 * g2} />
                <path d={`M ${tx - 14},540 L ${tx - 14},436 M ${tx + 14},540 L ${tx + 14},436`} stroke={WP.amberLit} strokeWidth={5} opacity={g2} />
                {/* ゲッターの鏡。管の肩に銀の膜 */}
                <ellipse cx={tx + 24} cy={380} rx={26} ry={16} fill={WP.steelLit} opacity={0.4} />
                {/* ベークライトのベースと足 */}
                <rect x={tx - 56} y={556} width={112} height={38} rx={5} fill="#2A211A" stroke={WP.line} strokeWidth={3} />
                {[0, 1, 2, 3].map((p) => (
                  <rect key={p} x={tx - 42 + p * 26} y={592} width={7} height={22} fill={WP.steel} />
                ))}
                {/* 管の表示 (型番は書かず、墨の印だけ) */}
                <rect x={tx - 30} y={492} width={60} height={5} fill={WP.ink} opacity={0.5} />
              </g>
            );
          })}
          {/* 鎧戸。灯の手前を横切る */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={1378} y={342 + i * 54} width={474} height={15} fill={WP.woodDark} opacity={0.85} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={`r${i}`} x={1378} y={342 + i * 54} width={474} height={4} fill={WP.rim} opacity={0.3} />
          ))}
        </g>

        {/* ── ★背板の通気の穴。右端で側板が回り込む ── */}
        <g>
          <path d="M 1852,300 L 1920,318 L 1920,1080 L 1852,1062 Z" fill={WP.shadowDeep} />
          <path d="M 1852,300 L 1920,318 L 1920,330 L 1852,312 Z" fill={WP.rim} opacity={0.4} />
          {Array.from({ length: 11 }, (_, r) =>
            [0, 1].map((c) => {
              const hx = 1870 + c * 30;
              const hy = 380 + r * 54;
              return (
                <g key={`${r}-${c}`}>
                  <circle cx={hx} cy={hy} r={11} fill="#0D0A07" />
                  {/* 穴から灯が漏れる */}
                  <circle cx={hx} cy={hy} r={9} fill={WP.amberLit} opacity={0.26 * glowT} />
                  <circle cx={hx} cy={hy} r={11} fill="none" stroke={WP.line} strokeWidth={2} opacity={0.6} />
                </g>
              );
            }),
          )}
        </g>

        {/* ── ★目盛り板。周波数の数字 (kc) と、ふるえる針 ── */}
        <g>
          <rect x={1372} y={700} width={480} height={214} rx={8} fill="#140F09" stroke={WP.line} strokeWidth={6} />
          <rect x={1388} y={716} width={448} height={182} rx={5} fill={WP.amber} opacity={0.2 + 0.16 * glowT} />
          {/* 目盛り。長短を交互に */}
          {Array.from({ length: 21 }, (_, i) => (
            <line
              key={i}
              x1={1404 + i * 21}
              y1={740}
              x2={1404 + i * 21}
              y2={i % 4 === 0 ? 782 : i % 2 === 0 ? 768 : 758}
              stroke={WP.kinariDim}
              strokeWidth={i % 4 === 0 ? 4 : 2.6}
              opacity={0.8}
            />
          ))}
          {/* 周波数の数字 */}
          {kc.map((n, i) => (
            <text key={n} x={1404 + i * 84} y={812} fontFamily={SEKAI_SERIF} fontSize={28} fill={WP.kinariDim} textAnchor="middle" opacity={0.9}>
              {n}
            </text>
          ))}
          <text x={1800} y={812} fontFamily={SEKAI_SERIF} fontSize={22} fill={WP.kinariDim} textAnchor="middle" opacity={0.8}>
            kc
          </text>
          {/* 放送局の印。第一放送のところに錆朱の点 */}
          <circle cx={1478} cy={730} r={6} fill={WP.sabi} />
          {/* 針 */}
          <line x1={1570 + needle * 6} y1={726} x2={1570 + needle * 6} y2={872} stroke={WP.sabi} strokeWidth={7} strokeLinecap="round" />
          <circle cx={1570 + needle * 6} cy={726} r={10} fill={WP.sabi} />
          <rect x={1372} y={700} width={480} height={14} fill={WP.rim} opacity={0.4} />
          {/* ガラスの反射。斜めの一筋 */}
          <path d="M 1400,898 L 1560,716 L 1620,716 L 1460,898 Z" fill={WP.paperLit} opacity={0.1} />
        </g>

        {/* ── ★つまみ。縁にローレット (細かい刻み) を入れる ── */}
        {[
          { x: 1452, r: 76, a: 18 },
          { x: 1716, r: 66, a: -34 },
        ].map((k, ki) => (
          <g key={ki} transform={`translate(${k.x} 992)`}>
            <circle cx={5} cy={7} r={k.r} fill={WP.shadowDeep} opacity={0.6} />
            {/* ローレット = 放射の歯。36枚 */}
            {Array.from({ length: 36 }, (_, i) => {
              const a = (i / 36) * Math.PI * 2 + (k.a * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * (k.r - 12)}
                  y1={Math.sin(a) * (k.r - 12)}
                  x2={Math.cos(a) * k.r}
                  y2={Math.sin(a) * k.r}
                  stroke={i % 2 === 0 ? WP.rim : WP.line}
                  strokeWidth={3.4}
                />
              );
            })}
            <circle r={k.r - 11} fill="#2A211A" stroke={WP.line} strokeWidth={3} />
            <circle r={k.r - 26} fill={WP.woodDark} />
            <circle r={k.r - 26} fill="none" stroke={WP.rim} strokeWidth={2.6} opacity={0.6} />
            {/* 指標の白い線 */}
            <line
              x1={Math.cos((k.a * Math.PI) / 180) * (k.r - 30)}
              y1={Math.sin((k.a * Math.PI) / 180) * (k.r - 30)}
              x2={Math.cos((k.a * Math.PI) / 180) * (k.r - 6)}
              y2={Math.sin((k.a * Math.PI) / 180) * (k.r - 6)}
              stroke={WP.kinari}
              strokeWidth={5}
              strokeLinecap="round"
            />
            {/* 左上の照り */}
            <path d={`M ${-k.r * 0.6},${-k.r * 0.4} A ${k.r - 14} ${k.r - 14} 0 0 1 ${-k.r * 0.2},${-k.r * 0.72}`} stroke={WP.rim} strokeWidth={6} fill="none" opacity={0.55} />
          </g>
        ))}
      </Cam>
    </WarmStage>
  );
};

// ===================================================================
// #6 山 多くの日本人にとって、初めて聞く天皇の声でした。
//
// ★2026-11-09 全面描き直し (2回目)。
//   1回目は町角に5人がばらばらに立つ絵にしたが、作者から2つ注文が来た。
//     「男女はうまく入れてよせっかくなら」
//     「玉音放送は多分整列して聞かないといけないからそろってかしこまってる様子も必要だ」
//   → 場所を**軍需工場の前庭**に変え、**2列に整列**させた。
//
// 時代考証 (色の台帳は world.tsx の WP)
//   ・1945年8月15日 正午。東京は晴れ・最高32.3℃。**太陽はほぼ真上**なので
//     影は足元に短く濃く落ちる。夕方の長い逆光にしてはいけない
//   ・玉音放送は職場・学校・役場の前庭に**整列して**聞くのが普通だった。
//     気をつけの姿勢で、放送が始まると頭を下げる。男は帽子を脱いで胸に当てる
//   ・男は国民服 (国民服令 1940年11月1日施行・国防色=カーキ・立襟) と巻脚絆
//   ・女は女性標準服の防空着＝もんぺ。工場には**女子挺身隊**がいたので
//     もんぺ＋白シャツ＋白鉢巻＋たすき。これで画面に男女が自然に混ざる
//   ・受信機は放送局型123号。戦時末期の代用品でスピーカー枠は紙製
//   ・工場の煙突から煙は出ていない (この時期は資材も燃料も尽きて操業は止まりがち)
//
// 絵の狙い
//   ・整列の列を**手前から奥へ斜めに**引く。手前は大きく、奥は小さく重なる。
//     横一列の書き割りにしない (6点法① 寄る / ④ 奥行き)
//   ・全員が同じ角度で頭を下げ、同じ形で手を腿に付ける＝かしこまり
//   ・★事件: 最前列のいちばん手前、少年工だけが顔を上げてラジオを見ている
// ===================================================================

// 1945年の人。服で時代・性別・立場が分かるように描く (のっぺらぼうは使わない)。
// 気をつけの姿勢が既定。bow で頭の下がりを作る。
const Hito: React.FC<{
  x: number;
  y: number; // 足元
  h: number;
  kind: "kokumin" | "teishin" | "monpe" | "jinbei" | "boy";
  bow: number; // 0..1 頭の下がり
  look?: "down" | "up";
  sweat?: number;
  hatOnChest?: boolean;
  dim?: number; // 奥の列を少し沈める
}> = ({ x, y, h, kind, bow, look = "down", sweat = 0, hatOnChest = false, dim = 0 }) => {
  const s = h / 600;
  const tilt = bow * (look === "up" ? -13 : 17);
  const skin = WP.skin;
  const dark = WP.skinShade;
  const hairC = "#2A2420";

  const C = {
    kokumin: { base: WP.kokuminFuku, lit: WP.kokuminFukuLit, dk: WP.kokuminFukuDark },
    teishin: { base: WP.monpe, lit: WP.monpeLit, dk: "#232C40" },
    monpe: { base: WP.monpe, lit: WP.monpeLit, dk: "#232C40" },
    jinbei: { base: "#6E6A5C", lit: "#8C8778", dk: "#403D33" },
    boy: { base: "#7C7360", lit: "#9A9078", dk: "#4E483C" },
  }[kind];
  const female = kind === "teishin" || kind === "monpe";

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - dim}>
      {/* 真上の日なので影は足元に短く濃い */}
      <ellipse cx={0} cy={4} rx={70} ry={15} fill={WP.natsuKage} opacity={0.55} />

      {/* ── 脚。気をつけなので両足を閉じる ── */}
      {female ? (
        <>
          {/* もんぺ。腰から膨らんで足首で絞る */}
          <path d="M -54,-330 L 54,-330 L 66,-128 L 34,-46 L -34,-46 L -66,-128 Z" fill={C.base} />
          <path d="M -54,-330 L -12,-330 L -14,-46 L -34,-46 L -66,-128 Z" fill={C.dk} opacity={0.5} />
          <path d="M 20,-330 L 54,-330 L 66,-128 L 40,-60 Z" fill={C.lit} opacity={0.28} />
          {/* 股の縫い目 */}
          <path d="M 0,-330 L 0,-120" stroke={C.dk} strokeWidth={3} opacity={0.5} />
          {/* 足首の絞り */}
          <rect x={-36} y={-56} width={30} height={13} rx={5} fill={C.dk} />
          <rect x={8} y={-56} width={30} height={13} rx={5} fill={C.dk} />
          {/* 紺絣の飛白 */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={-46 + (i % 3) * 34}
              y={-294 + Math.floor(i / 3) * 84}
              width={8}
              height={8}
              fill={C.lit}
              opacity={0.45}
            />
          ))}
          {/* 白足袋 */}
          <path d="M -32,-46 L -6,-46 L -2,-14 L -38,-14 Z" fill="#E6E0D0" />
          <path d="M 8,-46 L 34,-46 L 38,-14 L 2,-14 Z" fill="#E6E0D0" />
        </>
      ) : (
        <>
          <rect x={-42} y={-334} width={38} height={300} fill={C.base} />
          <rect x={6} y={-334} width={38} height={300} fill={C.base} />
          <rect x={-42} y={-334} width={12} height={300} fill={C.dk} opacity={0.45} />
          <rect x={32} y={-334} width={12} height={300} fill={C.lit} opacity={0.3} />
          {kind === "kokumin" && (
            // 巻脚絆 (ゲートル)。ふくらはぎに斜めに巻く
            <>
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <path
                    d={`M -43,${-148 + i * 25} L -5,${-158 + i * 25}`}
                    stroke={WP.gaiter}
                    strokeWidth={14}
                    strokeLinecap="round"
                  />
                  <path
                    d={`M 7,${-148 + i * 25} L 45,${-158 + i * 25}`}
                    stroke={WP.gaiter}
                    strokeWidth={14}
                    strokeLinecap="round"
                  />
                </g>
              ))}
            </>
          )}
          {/* 地下足袋 */}
          <path d="M -46,-34 L -4,-34 L 0,-10 L -50,-10 Z" fill="#3A332B" />
          <path d="M 4,-34 L 46,-34 L 50,-10 L 0,-10 Z" fill="#3A332B" />
        </>
      )}

      {/* ── 胴 ── */}
      <path d="M -58,-492 L 58,-492 L 52,-322 L -52,-322 Z" fill={C.base} />
      <path d="M -58,-492 L -18,-492 L -16,-322 L -52,-322 Z" fill={C.dk} opacity={0.42} />
      <path d="M 34,-492 L 58,-492 L 52,-322 L 32,-322 Z" fill={C.lit} opacity={0.26} />
      {/* 肩の上面だけ、真上の日で白く光る */}
      <path d="M -58,-492 L 58,-492 L 54,-472 L -54,-472 Z" fill={WP.natsuHikari} opacity={0.5} />

      {kind === "kokumin" && (
        <>
          <path d="M -28,-498 L 28,-498 L 28,-472 L -28,-472 Z" fill={C.lit} stroke={WP.line} strokeWidth={2.4} />
          <rect x={-3} y={-472} width={6} height={150} fill={C.dk} opacity={0.6} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={0} cy={-452 + i * 36} r={5} fill="#D9C48A" stroke={WP.line} strokeWidth={1.5} />
          ))}
          <rect x={-46} y={-446} width={34} height={28} fill="none" stroke={C.dk} strokeWidth={3} />
          <rect x={12} y={-446} width={34} height={28} fill="none" stroke={C.dk} strokeWidth={3} />
        </>
      )}
      {kind === "teishin" && (
        <>
          {/* 女子挺身隊。白シャツ + たすき */}
          <path d="M -58,-492 L 58,-492 L 52,-356 L -52,-356 Z" fill="#E4DFD0" />
          <path d="M -58,-492 L -20,-492 L -22,-356 L -52,-356 Z" fill="#BEB8A8" opacity={0.8} />
          <path d="M -26,-498 L 0,-468 L 26,-498 L 20,-492 L 0,-456 L -20,-492 Z" fill="#AEA796" />
          {/* たすき (斜め掛け) */}
          <path d="M -54,-484 L 50,-366" stroke="#C6412F" strokeWidth={17} />
          <path d="M -54,-484 L 50,-366" stroke="#E07460" strokeWidth={5} opacity={0.55} />
          {/* 腰の帯ともんぺの縁 */}
          <rect x={-54} y={-360} width={108} height={14} fill={C.dk} />
        </>
      )}
      {kind === "monpe" && (
        <>
          {/* 白い割烹着。胸当てが四角く、腰紐が回る */}
          <path d="M -66,-486 L 66,-486 L 74,-396 L 58,-316 L -58,-316 L -74,-396 Z" fill={WP.kappogi} />
          <path d="M -66,-486 L -22,-486 L -28,-316 L -58,-316 L -74,-396 Z" fill={WP.kappogiShade} opacity={0.75} />
          <path d="M -66,-486 L 66,-486 L 62,-468 L -62,-468 Z" fill={WP.natsuHikari} opacity={0.6} />
          <path d="M -32,-486 L -32,-330 M 32,-486 L 32,-330" stroke={WP.kappogiShade} strokeWidth={3} />
          <rect x={-60} y={-352} width={120} height={11} fill={WP.kappogiShade} />
        </>
      )}
      {kind === "jinbei" && (
        <>
          <path d="M -58,-492 L 0,-470 L 58,-492 L 54,-470 L 0,-444 L -54,-470 Z" fill={C.lit} />
          <path d="M 0,-444 L 0,-322" stroke={C.dk} strokeWidth={4} opacity={0.6} />
          <rect x={-54} y={-368} width={108} height={19} fill="#4A4436" />
        </>
      )}
      {kind === "boy" && (
        <>
          {/* 学徒動員の少年工。開襟シャツと国民服の上着 */}
          <path d="M -58,-492 L 58,-492 L 52,-364 L -52,-364 Z" fill="#DCD6C6" />
          <path d="M -24,-494 L 0,-462 L 24,-494 L 18,-488 L 0,-450 L -18,-488 Z" fill="#AFA897" />
          <rect x={-52} y={-368} width={104} height={14} fill="#4E483C" />
        </>
      )}

      {/* ── 腕。気をつけなので体側にまっすぐ下ろし、手を腿に付ける ── */}
      <g transform={`rotate(${bow * 3} 0 -480)`}>
        <path d="M -58,-488 L -74,-384 L -66,-342 L -46,-344 L -52,-388 L -40,-468 Z" fill={C.base} />
        <path d="M 58,-488 L 74,-384 L 66,-342 L 46,-344 L 52,-388 L 40,-468 Z" fill={C.base} />
        <path d="M -58,-488 L -74,-384 L -66,-342 L -58,-343 L -64,-386 L -48,-470 Z" fill={C.dk} opacity={0.4} />
        {/* 手。指の割れを1本だけ入れると手に見える */}
        {!hatOnChest && (
          <>
            <path d="M -70,-348 C -78,-330 -74,-312 -62,-310 C -52,-308 -48,-324 -50,-346 Z" fill={skin} />
            <path d="M -64,-336 L -62,-314" stroke={dark} strokeWidth={2.4} opacity={0.6} />
          </>
        )}
        <path d="M 70,-348 C 78,-330 74,-312 62,-310 C 52,-308 48,-324 50,-346 Z" fill={skin} />
        <path d="M 64,-336 L 62,-314" stroke={dark} strokeWidth={2.4} opacity={0.6} />
      </g>

      {/* 脱いだ戦闘帽を胸に当てている左手 */}
      {hatOnChest && (
        <g>
          <path d="M -74,-384 L -62,-404 L -24,-412 L -18,-392 L -56,-372 Z" fill={C.base} />
          <path d="M -46,-430 C -46,-456 14,-456 14,-430 Z" fill={C.dk} />
          <path d="M -50,-430 L 18,-430 L 22,-418 L -54,-418 Z" fill={C.base} />
          <path d="M -44,-434 C -30,-450 2,-450 12,-434" fill="none" stroke={WP.natsuHikari} strokeWidth={3} opacity={0.5} />
          <path d="M -32,-416 C -40,-400 -34,-388 -22,-388 C -12,-388 -10,-402 -14,-418 Z" fill={skin} />
        </g>
      )}

      {/* ── 首と頭 ── */}
      <g transform={`rotate(${tilt} 0 -492)`}>
        <rect x={-14} y={-534} width={28} height={46} fill={dark} />
        <ellipse cx={0} cy={-566} rx={41} ry={47} fill={skin} />
        <path d="M -41,-566 C -41,-536 -21,-518 0,-518 C 21,-518 41,-536 41,-566 Z" fill={dark} opacity={0.18} />

        {/* 髪 */}
        {kind === "boy" ? (
          // 坊主頭
          <path d="M -41,-572 C -41,-612 -23,-620 0,-620 C 23,-620 41,-612 41,-572 C 23,-588 -23,-588 -41,-572 Z" fill={hairC} opacity={0.8} />
        ) : kind === "teishin" ? (
          <>
            <path d="M -43,-566 C -45,-614 -22,-624 0,-624 C 22,-624 45,-614 43,-566 L 33,-566 C 29,-596 -29,-596 -33,-566 Z" fill={hairC} />
            {/* 白鉢巻 */}
            <path d="M -45,-592 L 45,-592 L 45,-572 L -45,-572 Z" fill="#F0EBDC" stroke={WP.line} strokeWidth={2} />
            <path d="M 45,-588 L 68,-578 L 66,-566 L 45,-574 Z" fill="#F0EBDC" />
          </>
        ) : kind === "monpe" ? (
          <>
            <path d="M -43,-566 C -45,-616 -22,-626 0,-626 C 22,-626 45,-616 43,-566 L 33,-566 C 29,-598 -29,-598 -33,-566 Z" fill={hairC} />
            {/* 手ぬぐいを姉さんかぶりに */}
            <path d="M -45,-592 C -20,-620 20,-620 45,-592 L 39,-568 C 18,-592 -18,-592 -39,-568 Z" fill={WP.tenugui} stroke={WP.line} strokeWidth={2} />
          </>
        ) : kind === "jinbei" ? (
          <path d="M -41,-572 C -39,-608 -20,-616 0,-616 C 20,-616 39,-608 41,-572 L 31,-574 C 25,-596 -25,-596 -31,-574 Z" fill="#C9C4BA" />
        ) : (
          <path d="M -42,-574 C -41,-612 -22,-620 0,-620 C 22,-620 41,-612 42,-574 L 32,-578 C 26,-598 -26,-598 -32,-578 Z" fill={hairC} />
        )}

        <ellipse cx={-41} cy={-562} rx={7} ry={11} fill={skin} />
        <ellipse cx={41} cy={-562} rx={7} ry={11} fill={skin} />
        {/* 眉 */}
        <path d="M -26,-582 L -9,-585" stroke={hairC} strokeWidth={4} strokeLinecap="round" />
        <path d="M 9,-585 L 26,-582" stroke={hairC} strokeWidth={4} strokeLinecap="round" />
        {/* 目。大人は伏せる / 少年は見開いて上を見る */}
        {look === "up" ? (
          <>
            <ellipse cx={-16} cy={-570} rx={7.2} ry={8.2} fill="#FFFFFF" />
            <ellipse cx={16} cy={-570} rx={7.2} ry={8.2} fill="#FFFFFF" />
            <circle cx={-15} cy={-572} r={4.5} fill={WP.ink} />
            <circle cx={15} cy={-572} r={4.5} fill={WP.ink} />
          </>
        ) : (
          <>
            <path d="M -25,-569 C -20,-562 -12,-562 -8,-569" fill="none" stroke={WP.ink} strokeWidth={3.4} strokeLinecap="round" />
            <path d="M 8,-569 C 12,-562 20,-562 25,-569" fill="none" stroke={WP.ink} strokeWidth={3.4} strokeLinecap="round" />
          </>
        )}
        <path d="M 0,-566 L 3,-550" fill="none" stroke={dark} strokeWidth={3} strokeLinecap="round" />
        <path
          d={look === "up" ? "M -9,-536 C -3,-530 3,-530 9,-536" : "M -11,-536 L 11,-536"}
          fill="none"
          stroke={WP.ink}
          strokeWidth={3.2}
          strokeLinecap="round"
        />
        {sweat > 0 && <path d="M 39,-592 q 7,13 0,19 q -7,-6 0,-19 Z" fill="#BFE0EE" opacity={sweat} />}
      </g>
    </g>
  );
};

// 放送局型123号。戦時末期の代用品で、スピーカーの枠は紙製
const Radio123: React.FC<{ x: number; y: number; s?: number; lit: number }> = ({ x, y, s = 1, lit }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-190} width={300} height={190} rx={10} fill={WP.wood} stroke={WP.line} strokeWidth={5} />
    <rect x={-150} y={-190} width={300} height={13} fill={WP.natsuHikari} opacity={0.55} />
    <rect x={-128} y={-166} width={150} height={142} rx={6} fill="#6A5236" stroke={WP.line} strokeWidth={3.4} />
    <rect x={-116} y={-154} width={126} height={118} fill="#4A3A26" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line key={i} x1={-112} y1={-146 + i * 17} x2={-10} y2={-146 + i * 17} stroke="#2E2418" strokeWidth={5} />
    ))}
    <circle cx={74} cy={-134} r={36} fill="#3A2C1C" stroke={WP.rim} strokeWidth={3.4} />
    <line x1={74} y1={-134} x2={98} y2={-150} stroke={WP.amberLit} strokeWidth={5} />
    <circle cx={74} cy={-56} r={24} fill="#3A2C1C" stroke={WP.rim} strokeWidth={3} />
    {/* 同調の豆ランプ。雑音に合わせてちらつく */}
    <circle cx={122} cy={-134} r={8} fill={WP.amberLit} opacity={0.3 + lit * 0.7} />
  </g>
);

const S06: SekaiArt = ({ f }) => {
  const t = easeOut(seg(f, 0, 26));
  // 事件の前半: 前列が手前から順に、もう一段頭を下げる (そろって動くとかしこまって見える)
  const bow = (i: number) => easeInOut(seg(f, 26 + i * 5, 26 + i * 5 + 22));
  const lit = Math.abs(Math.sin(f / 5.5)) * Math.abs(Math.sin(f / 13));
  const HOR = 690; // 地平 (前庭の土と塀の境)
  return (
    <Cam f={f} from={[0, 0, 1.0]} to={[-30, -14, 1.07]} start={0} end={120}>
      <defs>
        <linearGradient id="a06-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={WP.daySky} />
          <stop offset="100%" stopColor={WP.daySkyHi} />
        </linearGradient>
        <linearGradient id="a06-doro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={WP.natsuKage} />
          <stop offset="22%" stopColor={WP.natsuDoro} />
          <stop offset="100%" stopColor="#C0A074" />
        </linearGradient>
        <linearGradient id="a06-kabe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BFB49C" />
          <stop offset="100%" stopColor="#8E8370" />
        </linearGradient>
      </defs>

      {/* 真昼の空 */}
      <rect x={-200} y={-120} width={W + 400} height={HOR + 120} fill="url(#a06-sky)" />
      <g opacity={0.92}>
        <ellipse cx={1500} cy={150} rx={230} ry={128} fill="#F4F6F8" />
        <ellipse cx={1690} cy={212} rx={168} ry={94} fill="#E4EAF0" />
        <ellipse cx={1330} cy={212} rx={146} ry={80} fill="#E8EDF2" />
      </g>

      {/* 奥: 軍需工場の鋸屋根と煙突。煙は出ていない (操業が止まっている) */}
      <g>
        <rect x={-100} y={214} width={240} height={476} fill="#6E6454" />
        <rect x={-100} y={214} width={60} height={476} fill="#857A66" />
        {/* 煙突の帯 */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-100} y={250 + i * 120} width={240} height={16} fill="#574E41" />
        ))}
        {/* 鋸屋根 */}
        <rect x={140} y={448} width={1000} height={242} fill="url(#a06-kabe)" />
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <path
              d={`M ${150 + i * 166},448 L ${150 + i * 166},392 L ${150 + i * 166 + 166},448 Z`}
              fill="#9E937E"
            />
            {/* 北向きの窓 (鋸屋根の立ち上がり) */}
            <rect x={154 + i * 166} y={398} width={22} height={48} fill="#4E5A66" />
            <rect x={154 + i * 166} y={398} width={22} height={14} fill="#7C8C9A" />
          </g>
        ))}
        {/* 工場の窓。ガラスは飛散防止の紙テープで×が貼ってある */}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <rect x={178 + i * 106} y={496} width={70} height={92} fill="#43505C" stroke={WP.line} strokeWidth={3} />
            <path
              d={`M ${180 + i * 106},498 L ${246 + i * 106},586 M ${246 + i * 106},498 L ${180 + i * 106},586`}
              stroke="#D9D2BE"
              strokeWidth={4}
              opacity={0.75}
            />
          </g>
        ))}
        {/* 板塀 */}
        <rect x={1140} y={430} width={860} height={260} fill="#8A7C6A" />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={1146 + i * 33} y={430} width={8} height={260} fill="#6E6254" />
        ))}
        <rect x={1140} y={424} width={860} height={16} fill="#5C5244" />
      </g>

      {/* 電柱と碍子。工場の敷地の端 */}
      <rect x={1052} y={120} width={24} height={574} fill="#6B5A44" />
      <rect x={1052} y={120} width={8} height={574} fill={WP.natsuHikari} opacity={0.35} />
      <rect x={1012} y={190} width={106} height={12} fill="#4A3E2E" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={1018 + i * 44} y={170} width={11} height={22} fill="#D7DEE2" />
          <ellipse cx={1023 + i * 44} cy={168} rx={10} ry={6} fill="#E8EEF2" />
        </g>
      ))}
      <path d="M -40,206 L 1052,190 M 1076,190 L 1960,212" stroke="#3A332B" strokeWidth={3.2} />

      {/* 前庭の地面。正午なので影は真下に短い */}
      <rect x={-200} y={HOR} width={W + 400} height={H - HOR + 200} fill="url(#a06-doro)" />
      {/* 整列の目印に引かれた白線 (奥へ収束させて遠近を作る) */}
      <path d="M 300,1080 L 1180,742" stroke="#D8CFB6" strokeWidth={7} opacity={0.4} />
      <path d="M 520,1080 L 1286,742" stroke="#D8CFB6" strokeWidth={6} opacity={0.3} />

      {/* ラジオを置いた机。列の正面 (奥) に置く */}
      <g opacity={t}>
        <rect x={1296} y={690} width={318} height={22} fill={WP.wood} stroke={WP.line} strokeWidth={4} />
        <rect x={1318} y={712} width={18} height={124} fill={WP.woodDark} />
        <rect x={1574} y={712} width={18} height={124} fill={WP.woodDark} />
        {/* 机掛けの白布 */}
        <path d="M 1300,692 L 1610,692 L 1598,760 L 1312,760 Z" fill="#E6E0CE" />
        <Radio123 x={1455} y={692} s={0.78} lit={lit} />
        {/* 机の影。真上の日なので脚元に短く */}
        <ellipse cx={1455} cy={842} rx={166} ry={18} fill={WP.natsuKage} opacity={0.4} />
      </g>

      {/* 日の丸の旗竿。半旗ではなく竿の中ほど */}
      <g opacity={t}>
        <rect x={1700} y={300} width={11} height={400} fill="#8A7A5E" />
        <circle cx={1705} cy={296} r={11} fill="#C8B178" />
        <rect x={1711} y={330} width={150} height={102} fill="#EFE9D8" stroke={WP.line} strokeWidth={2.4} />
        <circle cx={1786} cy={381} r={32} fill="#B8352B" />
        <path d="M 1711,330 L 1861,330 L 1861,344 L 1711,344 Z" fill={WP.natsuHikari} opacity={0.4} />
      </g>

      {/* ── 整列。手前から奥へ斜めに列を引く ── */}
      {/* 後列 (小さく・少し沈める)。男女を混ぜる */}
      <Hito x={742} y={852} h={360} kind="teishin" bow={0.55 + bow(0) * 0.45} sweat={0.3} dim={0.16} />
      <Hito x={900} y={836} h={338} kind="kokumin" bow={0.5 + bow(1) * 0.5} sweat={0.3} dim={0.2} />
      <Hito x={1046} y={822} h={318} kind="monpe" bow={0.55 + bow(1) * 0.45} sweat={0.3} dim={0.24} />
      <Hito x={1178} y={810} h={300} kind="teishin" bow={0.5 + bow(2) * 0.5} sweat={0.3} dim={0.28} />

      {/* 前列。手前が大きい。全員そろって頭を下げている */}
      <Hito x={1026} y={968} h={470} kind="kokumin" bow={0.5 + bow(3) * 0.5} sweat={0.5} hatOnChest dim={0.06} />
      <Hito x={846} y={1010} h={530} kind="teishin" bow={0.52 + bow(2) * 0.48} sweat={0.6} />
      <Hito x={622} y={1062} h={610} kind="monpe" bow={0.5 + bow(1) * 0.5} sweat={0.7} />
      <Hito x={336} y={1124} h={706} kind="kokumin" bow={0.48 + bow(0) * 0.52} sweat={0.8} hatOnChest />

      {/* ★事件: 列の端の少年工だけが顔を上げてラジオを見ている */}
      <Hito x={1232} y={1056} h={480} kind="boy" bow={easeOut(seg(f, 34, 70))} look="up" sweat={0.45} />

      {/* 手前に置かれた工具箱と水筒。工員の持ち物 */}
      <g opacity={t}>
        <rect x={1426} y={986} width={176} height={84} rx={6} fill={WP.steelDark} stroke={WP.line} strokeWidth={4} />
        <rect x={1426} y={986} width={176} height={14} fill={WP.rim} opacity={0.5} />
        <rect x={1492} y={968} width={44} height={20} rx={8} fill="none" stroke={WP.line} strokeWidth={5} />
        <ellipse cx={1660} cy={1044} rx={38} ry={14} fill={WP.natsuKage} opacity={0.4} />
        <rect x={1630} y={960} width={60} height={86} rx={10} fill="#7C8A6E" stroke={WP.line} strokeWidth={4} />
        <rect x={1644} y={944} width={32} height={20} rx={5} fill="#5E6B52" />
      </g>

      {/* 真昼の白い日差し。上から薄く被せて暑さを出す (色相は変えず明度だけ) */}
      <rect x={-200} y={-120} width={W + 400} height={520} fill={WP.natsuHikari} opacity={0.1} />

      <YearTag year="一九四五" place="日本" f={f} />
    </Cam>
  );
};

// ===================================================================
// #7 図 その中に、「堪え難きを堪え、忍び難きを忍び」という一節がありました。
// ★2026-11-09 描き直し (別紙A #7)「巻紙は今のままでよい。紙と墨を本物にする」
//   足した物 紙の簀の目 (横に走る薄い線) / 墨の濃淡とかすれ / 巻いた軸の黒漆 /
//            紙を押さえる文鎮 (真鍮) / 折り皺 / 朱の傍線は筆の入りと抜きをつける
//   事件 傍線が引かれ終わった瞬間、紙がわずかに反る
// ===================================================================
const S07: SekaiArt = ({ f }) => {
  const PT = 104,
    PB = 968; // 巻紙は画面の高さを使い切る
  const unroll = easeOut(seg(f, 0, 34));
  const xL = 196;
  const xR = xL + 1540 * unroll;
  const quote = [
    { x: 1452, s: "堪え難きを堪え", at: 26 },
    { x: 1326, s: "忍び難きを忍び", at: 36 },
  ];
  // ★事件: 2本めの傍線が引き終わる (36+22=58) 直後に紙が反る
  const sori = easeOut(seg(f, 58, 80));
  const tremble = sori > 0 && sori < 1 ? Math.sin((f - 58) / 2.2) * 2.4 * (1 - sori) : 0;
  // ★朱の傍線。筆の入り (細) → 腹 (太) → 抜き (細く掃ける)。線ではなく面で描く
  const fudeSen = (cx: number, y0: number, y1: number, t: number) => {
    if (t <= 0) return null;
    const n = 24;
    const left: string[] = [];
    const right: string[] = [];
    for (let i = 0; i <= n; i++) {
      const u = (i / n) * t;
      const y = y0 + (y1 - y0) * u;
      const wv = 2.6 + 8.4 * Math.sin(Math.pow(u / Math.max(t, 0.001), 0.72) * Math.PI);
      // 筆は一直線には走らない。わずかに左右へ振れる
      const wob = Math.sin(u * 7.2) * 2.6;
      left.push(`${cx - wv + wob},${y}`);
      right.unshift(`${cx + wv + wob},${y}`);
    }
    return (
      <g>
        <path d={`M ${left.join(" L ")} L ${right.join(" L ")} Z`} fill={WP.sabi} />
        {/* 朱のかすれ。筆の腹が紙から離れたところ */}
        {[0.34, 0.58, 0.79].map((k) =>
          k < t ? (
            <rect key={k} x={cx - 9} y={y0 + (y1 - y0) * k} width={18} height={3 + (k * 10) % 4} fill={WP.kinari} opacity={0.6} />
          ) : null,
        )}
      </g>
    );
  };
  return (
    <WarmStage f={f} uid="a07" src={[960, 60]} srcR={900} shafts={false} motes={20} vig={0.92}>
      <defs>
        <linearGradient id="a07-paper" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor={WP.paperLit} />
          <stop offset="54%" stopColor={WP.kinari} />
          <stop offset="100%" stopColor={WP.kinariDim} />
        </linearGradient>
        {/* ★巻いた軸の黒漆。漆は面が深く、照りが1本だけ鋭く走る */}
        <linearGradient id="a07-urushi" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0A0806" />
          <stop offset="22%" stopColor={WP.kuroUrushi} />
          <stop offset="34%" stopColor="#4A3C30" />
          <stop offset="44%" stopColor={WP.kuroUrushi} />
          <stop offset="100%" stopColor="#050403" />
        </linearGradient>
        <linearGradient id="a07-shinchu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={WP.rim} />
          <stop offset="30%" stopColor={WP.brass} />
          <stop offset="100%" stopColor={WP.sabiDeep} />
        </linearGradient>
        <clipPath id="a07-clip">
          <rect x={xL} y={PT} width={Math.max(xR - xL, 1)} height={PB - PT} />
        </clipPath>
      </defs>
      {/* 机。巻紙を素地に浮かせない */}
      <rect x={0} y={760} width={W} height={H - 760} fill={WP.wood} />
      <rect x={0} y={760} width={W} height={16} fill={WP.rim} opacity={0.3} />
      <rect x={0} y={776} width={W} height={26} fill={WP.shadowDeep} opacity={0.5} />
      <g opacity={0.3}>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={i * 420} y={800} width={160} height={H - 800} fill={WP.woodDark} />
        ))}
      </g>
      {/* 紙の落とす影。反ると紙が机から浮くので影が離れて濃くなる */}
      <path
        d={`M ${xL - 10},${PB + sori * 6} L ${xR + 30},${PB + sori * 6} L ${xR + 90 + sori * 16},${PB + 54 + sori * 14} L ${xL + 40},${PB + 54 + sori * 14} Z`}
        fill={WP.shadowDeep}
        opacity={0.6 + sori * 0.14}
      />
      <g transform={`translate(0 ${tremble})`}>
        {/* 紙 */}
        <rect x={xL} y={PT} width={Math.max(xR - xL, 1)} height={PB - PT} fill="url(#a07-paper)" />
        <g clipPath="url(#a07-clip)">
          {/* ★簀の目。簀で漉いた紙に横へ走る薄い線。9px おき */}
          <g opacity={0.5}>
            {Array.from({ length: 97 }, (_, i) => (
              <rect key={i} x={xL} y={PT + i * 9} width={1600} height={1.6} fill={WP.wood} opacity={i % 2 === 0 ? 0.1 : 0.05} />
            ))}
          </g>
          {/* 糸目。簀を綴じた糸の跡。50mm おきに太い縦の筋 */}
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={`ito${i}`} x={xL + 90 + i * 180} y={PT} width={3} height={PB - PT} fill={WP.wood} opacity={0.1} />
          ))}
          {/* 楮の繊維。広い面の濃淡で。細い線は引かない */}
          <g opacity={0.12}>
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={xL + i * 118} y={PT} width={34 + (i % 3) * 26} height={PB - PT} fill={WP.wood} />
            ))}
          </g>
          {/* ★折り皺。縦3本 (畳んだ跡) ＋ 横1本 (天地に折った跡) */}
          {[430, 820, 1210].map((cx, i) => (
            <g key={cx}>
              <rect x={cx} y={PT} width={5} height={PB - PT} fill={WP.paperLit} opacity={0.9} />
              <rect x={cx + 5} y={PT} width={40} height={PB - PT} fill={WP.woodDark} opacity={0.12 + i * 0.02} />
              <rect x={cx - 34} y={PT} width={34} height={PB - PT} fill={WP.woodDark} opacity={0.07} />
            </g>
          ))}
          <rect x={xL} y={PT + 426} width={1600} height={4} fill={WP.paperLit} opacity={0.75} />
          <rect x={xL} y={PT + 430} width={1600} height={26} fill={WP.woodDark} opacity={0.1} />
          {/* 天地の罫 */}
          <rect x={xL} y={PT + 44} width={1600} height={4} fill={WP.sabiDeep} opacity={0.5} />
          <rect x={xL} y={PB - 48} width={1600} height={4} fill={WP.sabiDeep} opacity={0.5} />
          {/* 読めない粒。縦の列。★墨の濃淡を列ごとに変える */}
          {Array.from({ length: 11 }, (_, c) =>
            Array.from({ length: 9 }, (_, r) => {
              const gx = 1200 - c * 92;
              const wdt = 40 - ((c * 5 + r * 7) % 4) * 8;
              // 墨継ぎ。列の頭は濃く、進むと薄れる
              const nou = 0.52 - ((r + c) % 5) * 0.06;
              return (
                <g key={`${c}-${r}`} opacity={nou}>
                  <rect x={gx - wdt / 2} y={PT + 128 + r * 82} width={wdt} height={7} fill={WP.ink} />
                  <rect x={gx - wdt / 2 + 4} y={PT + 150 + r * 82} width={wdt - 12} height={7} fill={WP.ink} />
                  <rect x={gx - wdt / 2} y={PT + 172 + r * 82} width={wdt - 4} height={7} fill={WP.ink} />
                </g>
              );
            }),
          )}
          {/* 一節。縦書き明朝。★字ごとに墨の濃さを変え、かすれを入れる */}
          {quote.map((q, qi) => (
            <g key={q.x}>
              {q.s.split("").map((c, i) => {
                // 墨継ぎ = 書き出しが濃く、筆が乾くにつれ薄くなり、継いだところで戻る
                const dry = (i + qi * 3) % 4;
                const nou = 1 - dry * 0.13;
                return (
                  <g key={i}>
                    <text
                      x={q.x}
                      y={PT + 182 + i * 92}
                      fontFamily={SEKAI_SERIF}
                      fontSize={70}
                      fontWeight={700}
                      fill={WP.ink}
                      textAnchor="middle"
                      opacity={nou}
                    >
                      {c}
                    </text>
                    {/* かすれ。乾いた字の上に紙の色を細く通す */}
                    {dry >= 2 && (
                      <g opacity={0.5}>
                        <rect x={q.x - 32} y={PT + 150 + i * 92} width={64} height={2.6} fill={WP.kinari} />
                        <rect x={q.x - 18} y={PT + 164 + i * 92} width={40} height={2.2} fill={WP.kinari} />
                      </g>
                    )}
                    {/* 筆の留め。字の右下に墨が溜まる */}
                    <circle cx={q.x + 24} cy={PT + 176 + i * 92} r={4.4} fill={WP.ink} opacity={nou * 0.7} />
                  </g>
                );
              })}
              {/* ★事件の前段: 朱の傍線が筆の入りと抜きをつけて引かれる */}
              {fudeSen(q.x + 50, PT + 128, PT + 182 + (q.s.length - 1) * 92 + 24, easeInOut(seg(f, q.at, q.at + 22)))}
            </g>
          ))}
          {/* ★事件: 紙が反る。中央に起き上がりの照りと、その下の影 */}
          {sori > 0 && (
            <g>
              <path
                d={`M ${xL},${PT + 300} Q ${(xL + xR) / 2},${PT + 300 - 46 * sori} ${xR},${PT + 300}
                    L ${xR},${PT + 356} Q ${(xL + xR) / 2},${PT + 356 - 46 * sori} ${xL},${PT + 356} Z`}
                fill={WP.paperLit}
                opacity={0.4 * sori}
              />
              <path
                d={`M ${xL},${PT + 356} Q ${(xL + xR) / 2},${PT + 356 - 46 * sori} ${xR},${PT + 356}
                    L ${xR},${PT + 440} Q ${(xL + xR) / 2},${PT + 440 - 46 * sori} ${xL},${PT + 440} Z`}
                fill={WP.woodDark}
                opacity={0.16 * sori}
              />
            </g>
          )}
        </g>
        {/* 紙の縁 */}
        <rect x={xL} y={PT} width={Math.max(xR - xL, 1)} height={PB - PT} fill="none" stroke={WP.kinariDim} strokeWidth={3} />
        {/* 天の小口。反ると弓なりに持ち上がる */}
        <path
          d={`M ${xL},${PT + 9} Q ${(xL + xR) / 2},${PT + 9 - 20 * sori} ${xR},${PT + 9}
              L ${xR},${PT} Q ${(xL + xR) / 2},${PT - 20 * sori} ${xL},${PT} Z`}
          fill={WP.paperLit}
          opacity={0.85}
        />
        {/* 地の小口。反ると紙の裏が少し見える */}
        <path
          d={`M ${xL},${PB} Q ${(xL + xR) / 2},${PB + 14 * sori} ${xR},${PB}
              L ${xR},${PB - 10} Q ${(xL + xR) / 2},${PB - 10 + 14 * sori} ${xL},${PB - 10} Z`}
          fill={WP.kinariDim}
          opacity={0.9}
        />
      </g>
      {/* ★左の軸。黒漆。巻き取ったまま */}
      <g>
        <rect x={xL - 74} y={PT - 18} width={78} height={PB - PT + 36} rx={38} fill="url(#a07-urushi)" stroke={WP.line} strokeWidth={4} />
        {/* 漆の照りは1本だけ鋭く。木のニスのように広げない */}
        <rect x={xL - 50} y={PT - 10} width={7} height={PB - PT + 20} rx={4} fill={WP.rim} opacity={0.6} />
        <rect x={xL - 40} y={PT - 10} width={3} height={PB - PT + 20} rx={2} fill={WP.paperLit} opacity={0.35} />
        {/* 軸端。漆の上に真鍮の口金 */}
        <ellipse cx={xL - 35} cy={PT - 24} rx={46} ry={17} fill="url(#a07-shinchu)" stroke={WP.line} strokeWidth={3.4} />
        <ellipse cx={xL - 35} cy={PT - 26} rx={26} ry={9} fill={WP.kuroUrushi} />
        <ellipse cx={xL - 35} cy={PB + 24} rx={46} ry={17} fill={WP.sabiDeep} stroke={WP.line} strokeWidth={3.4} />
      </g>
      {/* ★右の軸。黒漆。ほどけながら右へ走る */}
      <g>
        <rect x={xR - 6} y={PT - 18} width={78} height={PB - PT + 36} rx={38} fill="url(#a07-urushi)" stroke={WP.line} strokeWidth={4} />
        <rect x={xR + 18} y={PT - 10} width={7} height={PB - PT + 20} rx={4} fill={WP.rim} opacity={0.6} />
        <rect x={xR + 28} y={PT - 10} width={3} height={PB - PT + 20} rx={2} fill={WP.paperLit} opacity={0.35} />
        <ellipse cx={xR + 33} cy={PT - 24} rx={46} ry={17} fill="url(#a07-shinchu)" stroke={WP.line} strokeWidth={3.4} />
        <ellipse cx={xR + 33} cy={PT - 26} rx={26} ry={9} fill={WP.kuroUrushi} />
        <ellipse cx={xR + 33} cy={PB + 24} rx={46} ry={17} fill={WP.sabiDeep} stroke={WP.line} strokeWidth={3.4} />
      </g>
      {/* ★文鎮。真鍮。紙を押さえている。反った紙はこの下では浮かない */}
      <g opacity={unroll}>
        <ellipse cx={376} cy={848} rx={104} ry={19} fill={WP.shadowDeep} opacity={0.55} />
        {/* 棒状の文鎮。上面・前面・木口の3面を分ける */}
        <path d="M 296,842 L 456,842 L 446,800 L 306,800 Z" fill="url(#a07-shinchu)" stroke={WP.line} strokeWidth={3} />
        <path d="M 306,800 L 446,800 L 442,786 L 310,786 Z" fill={WP.rim} opacity={0.55} />
        <path d="M 446,800 L 456,842 L 464,838 L 452,798 Z" fill={WP.sabiDeep} />
        {/* 真鍮の彫り。2本の溝 */}
        <path d="M 312,814 L 442,814" stroke={WP.sabiDeep} strokeWidth={3} opacity={0.7} />
        <path d="M 310,828 L 444,828" stroke={WP.sabiDeep} strokeWidth={2.4} opacity={0.5} />
        {/* 使い込まれた角の擦れ */}
        <ellipse cx={330} cy={794} rx={22} ry={5} fill={WP.paperLit} opacity={0.4} />
      </g>
    </WarmStage>
  );
};

// ===================================================================
// #8 山 一億玉砕を叫んでいた国が、この日、戦争をやめました。
//
// ★2026-11-09 全面描き直し (別紙A #8)。もとは「一億玉砕」の幟が並ぶ街路で、
//   道のなかに ShadeFigure が2つ立っているだけだった。無貌の黒い影は廃止。
//
// 場所の考証 (宮城前広場・二重橋前)
//   ・地面は明るい灰白色の玉砂利 (#CFC9BC)。芝ではない
//   ・濠の水、松原、正門石橋 (二重橋) とその奥の伏見櫓、楠木正成の騎馬銅像
//   ・立看板は白地に墨の太字。「撃ちてし止まむ」
//   ・1945年8月15日正午。太陽はほぼ真上なので影は足元に短く濃く落ちる
//
// ★姿勢の考証 (ここを間違えないこと)
//   人々はまず立ったまま聞き、放送が終わってから玉砂利に膝をついた。
//   有名な「一斉に土下座する群衆」の写真は8月16日撮影のものが多く、
//   カメラマンが跪くよう指示したという証言もある。だから全員が一斉に
//   土下座している絵にはしない。放送が終わった直後の、姿勢がばらけ始めた
//   瞬間を描く ── まだ立っている人、今まさに膝をつこうとしている人、
//   もう地面に手をついている人が同じ画面にいる。
//
// ★事件: 一人だけが防空頭巾を脱いで玉砂利の上に置く。もう空襲は来ない、の意味
// ===================================================================

// この枚の顔。老若男女で骨格と目の描き方を変える。
// (#6 の Hito は import せず、構造だけ真似てこの枚のために描いた)
const Kao8: React.FC<{
  r: number; // 頭の横半径
  dir?: number; // 向き (-1 左 .. 1 右)
  up?: number; // -1 伏せ目 .. 1 見上げる
  age: "ko" | "waka" | "chu" | "rou";
  sex: "m" | "f";
  tear?: number;
  mouth?: number;
  uid: string;
}> = ({ r, dir = 0, up = 0, age, sex, tear = 0, mouth = 0, uid }) => {
  const ry = r * 1.26;
  const kami = age === "rou" ? "#8E8A82" : age === "ko" ? "#2A2630" : "#241F26";
  const ex = r * 0.44; // 目の間隔
  const ey = -ry * 0.1 + up * r * 0.08;
  const eo = r * 0.2; // 目の大きさ
  return (
    <g>
      {/* 頭蓋と顎。老人は顎が細く、子どもは丸い */}
      <path
        d={`M ${-r},${-ry * 0.2}
            C ${-r},${-ry * 1.05} ${r},${-ry * 1.05} ${r},${-ry * 0.2}
            C ${r},${ry * (age === "ko" ? 0.78 : 0.6)} ${r * (age === "rou" ? 0.3 : 0.42)},${ry} 0,${ry}
            C ${-r * (age === "rou" ? 0.3 : 0.42)},${ry} ${-r},${ry * (age === "ko" ? 0.78 : 0.6)} ${-r},${-ry * 0.2} Z`}
        fill={WP.skin}
        stroke={WP.line}
        strokeWidth={Math.max(r * 0.07, 2)}
      />
      {/* 顎の下の影 */}
      <path d={`M ${-r * 0.5},${ry * 0.6} Q 0,${ry * 1.05} ${r * 0.5},${ry * 0.6} Q 0,${ry * 0.82} ${-r * 0.5},${ry * 0.6} Z`} fill={WP.skinShade} opacity={0.6} />
      {/* 耳 */}
      <ellipse cx={-r * 0.98} cy={ey + r * 0.16} rx={r * 0.17} ry={r * 0.28} fill={WP.skin} stroke={WP.line} strokeWidth={Math.max(r * 0.05, 1.6)} />
      <ellipse cx={r * 0.98} cy={ey + r * 0.16} rx={r * 0.17} ry={r * 0.28} fill={WP.skin} stroke={WP.line} strokeWidth={Math.max(r * 0.05, 1.6)} />
      {/* 目。伏せ目は上に凸の C 曲線、見開いた目は白目＋瞳 */}
      {[-1, 1].map((sd) => {
        const cx = sd * ex + dir * r * 0.2;
        if (up < 0) {
          return (
            <path
              key={sd}
              d={`M ${cx - eo},${ey + eo * 0.3} Q ${cx},${ey - eo * 0.55} ${cx + eo},${ey + eo * 0.3}`}
              stroke={WP.ink}
              strokeWidth={Math.max(r * 0.09, 2.4)}
              fill="none"
              strokeLinecap="round"
            />
          );
        }
        return (
          <g key={sd}>
            <ellipse cx={cx} cy={ey} rx={eo} ry={eo * 0.78} fill={WP.paperWhite} stroke={WP.line} strokeWidth={Math.max(r * 0.05, 1.6)} />
            <circle cx={cx + dir * eo * 0.35} cy={ey - up * eo * 0.2} r={eo * 0.5} fill={WP.ink} />
            <circle cx={cx + dir * eo * 0.35 + eo * 0.16} cy={ey - up * eo * 0.2 - eo * 0.16} r={eo * 0.16} fill={WP.paperWhite} opacity={0.9} />
          </g>
        );
      })}
      {/* 眉。男は太く直線、女は細く弧、老人は下がる */}
      {[-1, 1].map((sd) => (
        <path
          key={sd}
          d={
            sex === "f"
              ? `M ${sd * ex - eo} ,${ey - r * 0.4} Q ${sd * ex},${ey - r * 0.52} ${sd * ex + eo},${ey - r * 0.38}`
              : `M ${sd * ex - eo * 1.1},${ey - r * (age === "rou" ? 0.34 : 0.42)} L ${sd * ex + eo * 1.1},${ey - r * (age === "rou" ? 0.44 : 0.38)}`
          }
          stroke={age === "rou" ? "#8E8A82" : "#2A2630"}
          strokeWidth={Math.max(r * (sex === "f" ? 0.09 : 0.14), 2.4)}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {/* 鼻 */}
      <path d={`M ${dir * r * 0.1},${ey + r * 0.16} L ${dir * r * 0.16},${ey + r * 0.46} Q ${dir * r * 0.3},${ey + r * 0.52} ${dir * r * 0.06},${ey + r * 0.54}`} stroke={WP.skinShade} strokeWidth={Math.max(r * 0.07, 2)} fill="none" />
      {/* 口。mouth で開く */}
      {mouth > 0.1 ? (
        <g>
          <ellipse cx={dir * r * 0.08} cy={ey + r * 0.84} rx={r * 0.22} ry={r * 0.12 * (0.4 + mouth)} fill="#5A2A24" />
          <path d={`M ${dir * r * 0.08 - r * 0.22},${ey + r * 0.84} Q ${dir * r * 0.08},${ey + r * 0.72} ${dir * r * 0.08 + r * 0.22},${ey + r * 0.84}`} stroke={WP.line} strokeWidth={Math.max(r * 0.06, 2)} fill="none" />
        </g>
      ) : (
        <path d={`M ${dir * r * 0.08 - r * 0.2},${ey + r * 0.84} Q ${dir * r * 0.08},${ey + r * 0.9} ${dir * r * 0.08 + r * 0.2},${ey + r * 0.82}`} stroke={WP.line} strokeWidth={Math.max(r * 0.07, 2.2)} fill="none" strokeLinecap="round" />
      )}
      {/* 涙。下まつげに溜まり、頬を流れる */}
      {tear > 0 &&
        [-1, 1].map((sd) => (
          <g key={sd} opacity={tear}>
            <ellipse cx={sd * ex} cy={ey + eo * 0.8} rx={eo * 0.8} ry={eo * 0.26} fill={WP.screenLit} opacity={0.6} />
            <path d={`M ${sd * ex},${ey + eo} L ${sd * ex + sd * r * 0.06},${ey + r * (0.5 + tear * 0.4)}`} stroke={WP.screenLit} strokeWidth={Math.max(r * 0.08, 2.4)} strokeLinecap="round" opacity={0.75} />
          </g>
        ))}
      {/* 老人の皺と、中年の法令線 */}
      {age === "rou" && (
        <g opacity={0.6}>
          <path d={`M ${-r * 0.7},${ey + r * 0.5} Q ${-r * 0.5},${ey + r * 0.7} ${-r * 0.42},${ey + r * 0.94}`} stroke={WP.skinShade} strokeWidth={Math.max(r * 0.06, 2)} fill="none" />
          <path d={`M ${r * 0.7},${ey + r * 0.5} Q ${r * 0.5},${ey + r * 0.7} ${r * 0.42},${ey + r * 0.94}`} stroke={WP.skinShade} strokeWidth={Math.max(r * 0.06, 2)} fill="none" />
          <path d={`M ${-r * 0.5},${ey - r * 0.74} Q 0,${ey - r * 0.86} ${r * 0.5},${ey - r * 0.74}`} stroke={WP.skinShade} strokeWidth={Math.max(r * 0.05, 1.8)} fill="none" />
        </g>
      )}
      {/* 髪。面で分ける。毛流れの細線は描かない */}
      {sex === "f" ? (
        <g>
          {/* 後ろで束ねた髪。もんぺの女性は手拭いか髷 */}
          <path d={`M ${-r * 1.02},${-ry * 0.18} C ${-r * 1.02},${-ry * 1.16} ${r * 1.02},${-ry * 1.16} ${r * 1.02},${-ry * 0.18} C ${r * 0.7},${-ry * 0.62} ${-r * 0.7},${-ry * 0.62} ${-r * 1.02},${-ry * 0.18} Z`} fill={kami} stroke={WP.line} strokeWidth={Math.max(r * 0.06, 2)} />
          <ellipse cx={0} cy={-ry * 1.02} rx={r * 0.46} ry={r * 0.3} fill={kami} />
        </g>
      ) : (
        <path
          d={`M ${-r * 1.02},${-ry * 0.1} C ${-r * 1.02},${-ry * 1.14} ${r * 1.02},${-ry * 1.14} ${r * 1.02},${-ry * 0.1}
              C ${r * 0.74},${-ry * (age === "rou" ? 0.74 : 0.5)} ${-r * 0.5},${-ry * (age === "rou" ? 0.8 : 0.56)} ${-r * 1.02},${-ry * 0.1} Z`}
          fill={kami}
          stroke={WP.line}
          strokeWidth={Math.max(r * 0.06, 2)}
        />
      )}
      <title>{uid}</title>
    </g>
  );
};

// 巻脚絆。脛にぐるぐる巻いた布。男たちの足元に必ず入れる
const Kyahan: React.FC<{ x: number; y: number; h: number; w: number }> = ({ x, y, h, w }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} fill={WP.gaiter} stroke={WP.line} strokeWidth={2.4} />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={`M ${x - w / 2},${y - h + 6 + i * (h / 6)} L ${x + w / 2},${y - h + i * (h / 6)}`} stroke={WP.line} strokeWidth={2} opacity={0.45} fill="none" />
    ))}
    {/* 地下足袋 */}
    <path d={`M ${x - w / 2 - 4},${y} L ${x + w / 2 + 14},${y} L ${x + w / 2 + 18},${y + 16} L ${x - w / 2 - 8},${y + 16} Z`} fill={WP.ink} stroke={WP.line} strokeWidth={2.4} />
  </g>
);

const S08: SekaiArt = ({ f }) => {
  // ★事件: 40代女性が防空頭巾を脱ぎ、玉砂利の上に置く
  const oku = easeInOut(seg(f, 44, 86));
  // 姿勢がばらけ始める。勤め人が膝を折る / 工員がもう手をついている
  const hiza = easeInOut(seg(f, 20, 52));
  const kaze = Math.sin(f / 21) * 3; // 松と幟の裾を揺らす弱い風
  const namida = easeOut(seg(f, 26, 60));
  // 玉砂利の粒。奥は小さく密、手前は大きく疎
  const jari = Array.from({ length: 420 }, (_, i) => {
    const u = ((i * 37) % 100) / 100;
    const y = 352 + Math.pow(((i * 53) % 100) / 100, 1.7) * 740;
    const k = (y - 352) / 740;
    return { x: -60 + ((i * 97) % 2040), y, r: 1.4 + k * 4.4, o: 0.2 + u * 0.3 };
  });
  return (
    <WarmStage f={f} uid="a08" src={[960, 40]} srcR={1100} shafts={false} motes={20} vig={0.86} glow={WP.natsuHikari}>
      <Cam f={f} from={[0, 0, 1.0]} to={[8, -14, 1.05]} start={0} end={110}>
        {/* ── 真昼の空。8月15日の東京は晴れ・32.3℃。白く飛ばす ── */}
        <rect x={-200} y={-120} width={W + 400} height={300} fill={WP.daySkyHi} />
        <rect x={-200} y={120} width={W + 400} height={120} fill={WP.daySky} opacity={0.5} />
        {/* 入道雲の下側だけ */}
        <path d="M -200,168 Q 180,96 420,160 Q 700,86 1020,156 Q 1340,92 1620,160 Q 1840,120 2120,164 L 2120,200 L -200,200 Z" fill={WP.paperWhite} opacity={0.5} />

        {/* ── 奥の松原。濃い緑の塊で ── */}
        {Array.from({ length: 16 }, (_, i) => {
          const mx = -80 + i * 136;
          const my = 196 + ((i * 29) % 3) * 10;
          const ms = 0.84 + ((i * 17) % 5) * 0.08;
          return (
            <g key={i} transform={`translate(${mx} ${my}) scale(${ms})`}>
              <rect x={-7} y={-40} width={14} height={60} fill={WP.matsuMiki} />
              <path d={`M ${-74 + kaze},-40 Q -40,-96 0,-82 Q 44,-100 ${76 + kaze},-38 Q 30,-54 0,-48 Q -34,-54 ${-74 + kaze},-40 Z`} fill={WP.matsu} />
              <path d={`M ${-58 + kaze * 1.3},-72 Q -20,-120 6,-106 Q 44,-122 ${62 + kaze * 1.3},-70 Q 20,-86 4,-80 Q -24,-84 ${-58 + kaze * 1.3},-72 Z`} fill={WP.matsu} />
              <path d={`M ${-40},-98 Q -8,-136 8,-126 Q 34,-138 ${44},-96 Q 12,-110 2,-106 Q -16,-110 ${-40},-98 Z`} fill={WP.leaf} opacity={0.45} />
            </g>
          );
        })}

        {/* ── 石垣と、その上の伏見櫓 ── */}
        <path d="M -200,250 L -200,214 L 2120,210 L 2120,250 Z" fill={WP.ishigaki} />
        <path d="M 620,214 L 700,160 L 1400,156 L 1480,210 Z" fill={WP.ishigaki} />
        {/* 石の目地。斜めに積む (打込接) */}
        <g opacity={0.5}>
          {Array.from({ length: 30 }, (_, i) => (
            <line key={i} x1={-180 + i * 78} y1={214} x2={-160 + i * 78} y2={250} stroke={WP.concreteDark} strokeWidth={2.4} />
          ))}
          <line x1={-200} y1={232} x2={2120} y2={228} stroke={WP.concreteDark} strokeWidth={2.4} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`k${i}`} x1={660 + i * 90} y1={210} x2={672 + i * 90} y2={166} stroke={WP.concreteDark} strokeWidth={2.4} />
          ))}
        </g>
        {/* 伏見櫓。白漆喰の2層・黒い瓦屋根・狭間 */}
        <g transform="translate(1046 0)">
          <rect x={-150} y={76} width={300} height={84} fill={WP.shikkui} stroke={WP.line} strokeWidth={3} />
          <rect x={-120} y={34} width={240} height={46} fill={WP.shikkui} stroke={WP.line} strokeWidth={3} />
          {/* 下層の屋根 */}
          <path d="M -178,80 L 178,80 L 150,62 L -150,62 Z" fill={WP.kawara} />
          <path d="M -178,80 L 178,80 L 178,90 L -178,90 Z" fill={WP.ink} opacity={0.5} />
          {/* 上層の屋根。反りをつける */}
          <path d="M -146,38 Q -120,8 0,4 Q 120,8 146,38 L 112,38 Q 0,22 -112,38 Z" fill={WP.kawara} />
          <path d="M -146,38 Q -120,8 0,4 Q 120,8 146,38" fill="none" stroke={WP.line} strokeWidth={3} />
          {/* 狭間 (さま)。四角と三角 */}
          {[-96, -40, 40, 96].map((sx) => (
            <rect key={sx} x={sx - 11} y={104} width={22} height={28} fill={WP.ink} opacity={0.8} />
          ))}
          {[-68, 68].map((sx) => (
            <path key={sx} d={`M ${sx},100 l 14,24 l -28,0 Z`} fill={WP.ink} opacity={0.8} />
          ))}
          <rect x={-150} y={150} width={300} height={10} fill={WP.wood} />
        </g>

        {/* ── 濠の水 ── */}
        <rect x={-200} y={248} width={W + 400} height={106} fill={WP.horiMizu} />
        <rect x={-200} y={248} width={W + 400} height={14} fill={WP.ishigaki} opacity={0.4} />
        {/* 水面の皺。横の筋だけ */}
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={-160 + ((i * 211) % 1800)} y={272 + ((i * 17) % 70)} width={120 + ((i * 29) % 180)} height={3} fill={WP.paperWhite} opacity={0.14} />
        ))}
        {/* 櫓と松が水に映る (上下を逆に、薄く) */}
        <path d="M 896,252 L 1196,252 L 1196,300 L 896,300 Z" fill={WP.shikkui} opacity={0.1} />

        {/* ── 二重橋 (正門石橋)。2つのアーチと高欄 ── */}
        <g>
          <path d="M 620,300 L 1120,296 L 1120,254 L 620,258 Z" fill={WP.ishigaki} stroke={WP.line} strokeWidth={3} />
          {/* 2連のアーチ。水面に映る半円まで見せる */}
          {[744, 996].map((ax) => (
            <g key={ax}>
              <path d={`M ${ax - 86},300 A 86 70 0 0 1 ${ax + 86},300 Z`} fill={WP.horiMizu} />
              <path d={`M ${ax - 86},300 A 86 70 0 0 1 ${ax + 86},300`} fill="none" stroke={WP.line} strokeWidth={3.4} />
              <path d={`M ${ax - 86},300 A 86 70 0 0 1 ${ax + 86},300 Z`} fill={WP.shadowDeep} opacity={0.45} />
              {/* アーチの迫石 */}
              {Array.from({ length: 9 }, (_, i) => {
                const a = Math.PI * (0.06 + (i / 8) * 0.88);
                return (
                  <line
                    key={i}
                    x1={ax - Math.cos(a) * 86}
                    y1={300 - Math.sin(a) * 70}
                    x2={ax - Math.cos(a) * 100}
                    y2={300 - Math.sin(a) * 82}
                    stroke={WP.concreteDark}
                    strokeWidth={3}
                    opacity={0.6}
                  />
                );
              })}
            </g>
          ))}
          {/* 高欄と、橋の上の灯 */}
          <rect x={620} y={246} width={500} height={12} fill={WP.ishigaki} stroke={WP.line} strokeWidth={2.6} />
          {[640, 780, 940, 1100].map((px) => (
            <g key={px}>
              <rect x={px - 7} y={222} width={14} height={28} fill={WP.ishigaki} stroke={WP.line} strokeWidth={2.4} />
              <circle cx={px} cy={214} r={10} fill={WP.rokushou} stroke={WP.line} strokeWidth={2.4} />
            </g>
          ))}
        </g>

        {/* ── 玉砂利の広場。芝ではない ── */}
        <rect x={-200} y={344} width={W + 400} height={H + 200} fill={WP.tamajari} />
        <rect x={-200} y={344} width={W + 400} height={40} fill={WP.tamajariKage} opacity={0.3} />
        {/* 粒。奥は小さく、手前は大きく */}
        {jari.map((j, i) => (
          <circle key={i} cx={j.x} cy={j.y} r={j.r} fill={WP.tamajariKage} opacity={j.o} />
        ))}
        {/* 踏み均された轍。奥へすぼまる2本 */}
        <path d="M 240,1120 L 760,356 L 820,356 L 420,1120 Z" fill={WP.tamajariKage} opacity={0.14} />
        <path d="M 1500,1120 L 1060,356 L 1120,356 L 1740,1120 Z" fill={WP.tamajariKage} opacity={0.1} />

        {/* ── 楠木正成の騎馬銅像。緑青の青銅＋花崗岩の台座 ── */}
        <g transform="translate(248 0)">
          {/* 台座 */}
          <path d="M -130,620 L 130,620 L 112,420 L -112,420 Z" fill={WP.ishigaki} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 40,620 L 130,620 L 112,420 L 44,420 Z" fill={WP.concreteDark} opacity={0.45} />
          <path d="M -140,424 L 140,424 L 130,404 L -130,404 Z" fill={WP.ishigaki} stroke={WP.line} strokeWidth={3} />
          <path d="M -140,634 L 140,634 L 150,654 L -150,654 Z" fill={WP.ishigaki} stroke={WP.line} strokeWidth={3} />
          {/* 台座の銘。読めない墨の帯 */}
          <rect x={-70} y={470} width={140} height={10} fill={WP.ink} opacity={0.4} />
          <rect x={-54} y={494} width={108} height={8} fill={WP.ink} opacity={0.32} />
          {/* 馬。首を下げ、前脚を上げている (楠公像の形) */}
          <path
            d="M -96,404 L -86,300 Q -70,256 -16,250 L 54,252 Q 96,262 104,300 L 112,404
               L 84,404 L 78,330 L 24,336 L 20,404 L -6,404 L -12,336 L -66,330 L -70,404 Z"
            fill={WP.rokushou}
            stroke={WP.line}
            strokeWidth={3.4}
          />
          {/* 馬の首と頭。下を向く */}
          <path d="M 96,268 Q 150,246 166,206 Q 176,180 160,170 L 136,192 Q 120,222 92,240 Z" fill={WP.rokushou} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 160,170 Q 182,166 186,184 L 166,206 Z" fill={WP.rokushou} stroke={WP.line} strokeWidth={3} />
          {/* 尾 */}
          <path d="M -86,290 Q -126,320 -120,382 Q -108,340 -78,320 Z" fill={WP.rokushou} stroke={WP.line} strokeWidth={3} />
          {/* 上げた前脚 */}
          <path d="M 104,300 Q 146,296 160,262 L 142,250 Q 126,276 98,278 Z" fill={WP.rokushou} stroke={WP.line} strokeWidth={3} />
          {/* 乗っている武将。兜の鍬形と大鎧。顔は横を向いて造作は見せない */}
          <path d="M -6,252 L -14,196 Q -4,174 22,172 L 44,176 Q 62,192 56,218 L 50,254 Z" fill={WP.rokushou} stroke={WP.line} strokeWidth={3.4} />
          <ellipse cx={26} cy={156} rx={26} ry={24} fill={WP.rokushou} stroke={WP.line} strokeWidth={3} />
          <path d="M 4,142 Q 26,124 50,142 L 56,154 L -2,154 Z" fill={WP.rokushou} stroke={WP.line} strokeWidth={3} />
          <path d="M 18,132 L 10,100 L 22,106 Z M 34,132 L 44,100 L 30,106 Z" fill={WP.rokushou} stroke={WP.line} strokeWidth={2.6} />
          {/* 緑青の照り。雨の当たる面だけ明るい */}
          <path d="M -86,300 Q -70,256 -16,250 L -10,262 Q -58,268 -74,304 Z" fill={WP.leaf} opacity={0.35} />
          <path d="M 96,268 Q 150,246 166,206 L 172,214 Q 148,254 100,278 Z" fill={WP.leaf} opacity={0.3} />
          {/* 真上からの光なので影は足元に短く */}
          <ellipse cx={0} cy={656} rx={160} ry={24} fill={WP.natsuKage} opacity={0.5} />
        </g>

        {/* ── 「撃ちてし止まむ」の立看板。白地に墨の太字 ── */}
        <g transform="translate(1612 0)">
          <rect x={-104} y={316} width={208} height={300} fill={WP.paperWhite} stroke={WP.line} strokeWidth={4} />
          <rect x={-104} y={316} width={208} height={14} fill={WP.wood} />
          {"撃ちてし止まむ".split("").map((c, i) => (
            <text key={i} x={0} y={366 + i * 36} fontFamily={SEKAI_SERIF} fontSize={34} fontWeight={700} fill={WP.ink} textAnchor="middle">
              {c}
            </text>
          ))}
          {/* 支えの足。斜めに2本 */}
          <path d="M -74,616 L -54,616 L -96,700 L -118,700 Z" fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
          <path d="M 54,616 L 74,616 L 116,700 L 94,700 Z" fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
          <ellipse cx={0} cy={706} rx={120} ry={16} fill={WP.natsuKage} opacity={0.45} />
          {/* 立てかけられた竹槍。節を描く */}
          {[0, 1, 2, 3].map((i) => {
            const bx = -150 - i * 26;
            return (
              <g key={i}>
                <path d={`M ${bx},704 L ${bx + 54 + i * 8},330 L ${bx + 66 + i * 8},332 L ${bx + 14},704 Z`} fill={WP.takeyari} stroke={WP.line} strokeWidth={2.6} />
                {[0, 1, 2, 3, 4].map((k) => (
                  <line
                    key={k}
                    x1={bx + 10 + (54 + i * 8 - 10) * (k / 5)}
                    y1={704 - 374 * (k / 5)}
                    x2={bx + 22 + (54 + i * 8 - 10) * (k / 5)}
                    y2={704 - 374 * (k / 5)}
                    stroke={WP.woodDark}
                    strokeWidth={3}
                    opacity={0.6}
                  />
                ))}
                {/* 斜めに削いだ穂先 */}
                <path d={`M ${bx + 54 + i * 8},330 L ${bx + 66 + i * 8},332 L ${bx + 74 + i * 8},306 Z`} fill={WP.kinari} stroke={WP.line} strokeWidth={2.4} />
              </g>
            );
          })}
        </g>

        {/* ── 中景の人々。姿勢はすでにばらけている ── */}
        {[
          { x: 560, y: 700, h: 150, kind: 0 },
          { x: 700, y: 686, h: 136, kind: 1 },
          { x: 1180, y: 716, h: 160, kind: 2 },
          { x: 1290, y: 700, h: 146, kind: 0 },
          { x: 960, y: 672, h: 128, kind: 1 },
          { x: 1058, y: 664, h: 124, kind: 2 },
        ].map((p, i) => {
          const s = p.h / 150;
          const col = p.kind === 0 ? WP.kokuminFuku : p.kind === 1 ? WP.monpe : WP.paperWhite;
          const low = p.kind === 2 ? 0 : i % 2; // 膝をついている人が混じる
          return (
            <g key={i} transform={`translate(${p.x} ${p.y}) scale(${s})`}>
              <ellipse cx={0} cy={4} rx={32} ry={7} fill={WP.natsuKage} opacity={0.45} />
              {low ? (
                <>
                  <path d="M -30,0 L 30,0 L 22,-56 L -22,-56 Z" fill={col} stroke={WP.line} strokeWidth={2.4} />
                  <path d="M -20,-56 L 20,-56 L 14,-104 L -14,-104 Z" fill={col} stroke={WP.line} strokeWidth={2.4} />
                  <circle cx={0} cy={-120} r={17} fill={WP.skin} stroke={WP.line} strokeWidth={2.4} />
                  <path d="M -17,-126 Q 0,-142 17,-126 Q 0,-132 -17,-126 Z" fill="#241F26" />
                </>
              ) : (
                <>
                  <rect x={-11} y={-56} width={9} height={56} fill={p.kind === 1 ? WP.monpe : WP.kokuminFukuDark} />
                  <rect x={3} y={-56} width={9} height={56} fill={p.kind === 1 ? WP.monpe : WP.kokuminFukuDark} />
                  <path d="M -22,-56 L 22,-56 L 18,-124 L -18,-124 Z" fill={col} stroke={WP.line} strokeWidth={2.4} />
                  <circle cx={0} cy={-142} r={18} fill={WP.skin} stroke={WP.line} strokeWidth={2.4} />
                  <path d="M -18,-148 Q 0,-166 18,-148 Q 0,-154 -18,-148 Z" fill="#241F26" />
                </>
              )}
            </g>
          );
        })}

        {/* ===== 手前の人々。老若男女を混ぜ、姿勢をばらす ===== */}

        {/* (1) まだ直立不動のまま動けない中年男性。国民服・戦闘帽を手に・巻脚絆 */}
        <g transform="translate(452 1052)">
          <ellipse cx={0} cy={6} rx={92} ry={18} fill={WP.natsuKage} opacity={0.5} />
          <Kyahan x={-38} y={0} h={128} w={46} />
          <Kyahan x={40} y={0} h={128} w={46} />
          {/* 国民服。立襟・4ポケット */}
          <path d="M -78,-124 L -86,-350 Q -80,-398 -34,-410 L 34,-410 Q 80,-398 86,-350 L 78,-124 Z" fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 30,-410 Q 80,-398 86,-350 L 78,-124 L 44,-124 Z" fill={WP.kokuminFukuDark} opacity={0.6} />
          <path d="M -86,-350 Q -80,-398 -34,-410 L -22,-410 L -56,-130 L -78,-130 Z" fill={WP.kokuminFukuLit} opacity={0.4} />
          {/* ズボンの腰 */}
          <path d="M -70,-130 L 70,-130 L 64,-96 L -64,-96 Z" fill={WP.kokuminFukuDark} />
          {/* 4つのポケットと蓋 */}
          {[[-46, -340], [24, -340], [-50, -248], [26, -248]].map(([px, py], i) => (
            <g key={i}>
              <rect x={px} y={py} width={44} height={50} fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={2.6} />
              <rect x={px - 3} y={py - 7} width={50} height={14} rx={3} fill={WP.kokuminFukuDark} stroke={WP.line} strokeWidth={2.4} />
            </g>
          ))}
          <line x1={0} y1={-404} x2={0} y2={-130} stroke={WP.line} strokeWidth={3} opacity={0.6} />
          {/* 立襟。首をぐるりと囲む */}
          <path d="M -36,-410 Q 0,-424 36,-410 L 34,-440 Q 0,-454 -34,-440 Z" fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={3} />
          {/* 腕。気をつけ。手のひらを腿に */}
          <path d="M -84,-358 Q -112,-336 -114,-266 L -106,-166 L -74,-170 L -78,-270 Z" fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={3} />
          <path d="M 84,-358 Q 112,-336 114,-266 L 106,-180 L 74,-184 L 78,-270 Z" fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={3} />
          <ellipse cx={-90} cy={-150} rx={21} ry={26} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {/* ★戦闘帽は脱いで胸に当てている */}
          <g transform="translate(96 -196) rotate(-14)">
            <path d="M -44,0 Q -44,-38 0,-40 Q 44,-38 44,0 Z" fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={3} />
            <path d="M -50,0 L 50,0 L 46,10 L -46,10 Z" fill={WP.kokuminFukuDark} stroke={WP.line} strokeWidth={2.6} />
            {/* 星章 */}
            <path d="M 0,-26 l 6,12 l 13,0 l -10,8 l 4,13 l -13,-8 l -13,8 l 4,-13 l -10,-8 l 13,0 Z" fill={WP.amber} />
          </g>
          <ellipse cx={96} cy={-168} rx={22} ry={26} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {/* 首と顔。伏せ目。汗が頬を伝う */}
          <path d="M -24,-440 L 24,-440 L 22,-476 L -22,-476 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <g transform="translate(0 -524)">
            <Kao8 r={44} up={-1} age="chu" sex="m" mouth={0} uid="a08-chunen" />
            {/* 汗。こめかみから */}
            <path d={`M 38,-10 L ${42 + namida * 4},${20 + namida * 26}`} stroke={WP.screenLit} strokeWidth={4} strokeLinecap="round" opacity={0.7 * namida} />
            <circle cx={42 + namida * 4} cy={22 + namida * 28} r={5} fill={WP.screenLit} opacity={0.8 * namida} />
          </g>
        </g>

        {/* (2) 膝をつきかけている勤め人。白い開襟シャツ */}
        <g transform={`translate(812 1058)`}>
          <ellipse cx={10} cy={6} rx={104} ry={18} fill={WP.natsuKage} opacity={0.5} />
          {/* 右膝はもう玉砂利に着き、左膝は折れかけ */}
          <path d={`M -86,0 L -10,0 L ${-16 - hiza * 10},${-120 + hiza * 36} L ${-92 - hiza * 6},${-112 + hiza * 30} Z`} fill={WP.steelDark} stroke={WP.line} strokeWidth={3} />
          <path d={`M 10,0 L 92,${-6 + hiza * 6} L ${86 - hiza * 14},${-118 + hiza * 54} L ${6 - hiza * 4},${-124 + hiza * 48} Z`} fill={WP.steelDark} stroke={WP.line} strokeWidth={3} />
          {/* 革靴 */}
          <path d="M -94,0 L -8,0 L 0,20 L -104,20 Z" fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
          {/* 胴。前へ落ちていく */}
          <g transform={`translate(${-hiza * 16} ${hiza * 54}) rotate(${hiza * 9})`}>
            <path d="M -70,-120 L -78,-324 Q -72,-366 -30,-376 L 30,-376 Q 72,-366 78,-324 L 70,-120 Z" fill={WP.paperWhite} stroke={WP.line} strokeWidth={3.4} />
            <path d="M 26,-376 Q 72,-366 78,-324 L 70,-120 L 40,-120 Z" fill={PAPER_SHADE} opacity={0.7} />
            {/* 開襟の襟。第1ボタンを外した形 */}
            <path d="M -30,-376 L -4,-306 L 22,-376 L 2,-384 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
            <path d="M -30,-376 L -42,-330 L -8,-310 Z" fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.6} />
            <path d="M 22,-376 L 36,-330 L 2,-310 Z" fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.6} />
            {/* ボタンと縫い目 */}
            {[-280, -238, -196, -154].map((by) => (
              <circle key={by} cx={-2} cy={by} r={5} fill={WP.kinariDim} stroke={WP.line} strokeWidth={2} />
            ))}
            {/* ズボンの腰とベルト */}
            <path d="M -66,-126 L 66,-126 L 62,-96 L -62,-96 Z" fill={WP.steelDark} />
            <rect x={-66} y={-134} width={132} height={16} fill={WP.woodDark} stroke={WP.line} strokeWidth={2.4} />
            <rect x={-12} y={-136} width={24} height={20} fill={WP.brass} stroke={WP.line} strokeWidth={2.4} />
            {/* 腕。片手は膝を、片手は地面を探している */}
            <path d="M -76,-330 Q -106,-300 -104,-230 L -84,-152 L -52,-166 L -66,-238 Z" fill={WP.paperWhite} stroke={WP.line} strokeWidth={3} />
            <path d="M 76,-330 Q 108,-298 106,-224 L 92,-150 L 60,-164 L 70,-232 Z" fill={WP.paperWhite} stroke={WP.line} strokeWidth={3} />
            <ellipse cx={-70} cy={-140} rx={23} ry={27} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
            <ellipse cx={80} cy={-136} rx={23} ry={27} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
            {/* 首と顔。うつむいて口が開いている */}
            <path d="M -22,-376 L 22,-376 L 20,-410 L -20,-410 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
            <g transform={`translate(0 -456) rotate(${8 + hiza * 10})`}>
              <Kao8 r={42} up={-1} age="waka" sex="m" mouth={0.5} uid="a08-tsutome" />
            </g>
          </g>
        </g>

        {/* (3) 立ったまま声を上げずに泣く40代女性。★事件: 防空頭巾を玉砂利に置く */}
        <g transform="translate(1136 1066)">
          <ellipse cx={0} cy={6} rx={96} ry={18} fill={WP.natsuKage} opacity={0.5} />
          {/* もんぺ。股付きのズボン。裾を絞る */}
          <path d="M -74,-110 L 74,-110 L 62,-10 L 14,-10 L 4,-96 L -8,-10 L -58,-10 Z" fill={WP.monpe} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 8,-110 L 74,-110 L 62,-10 L 14,-10 Z" fill={WP.monpeLit} opacity={0.3} />
          {/* 絞った裾の紐 */}
          <rect x={-60} y={-26} width={54} height={10} fill={WP.tenugui} />
          <rect x={14} y={-26} width={52} height={10} fill={WP.tenugui} />
          {/* 下駄 */}
          <path d="M -64,-6 L -4,-6 L -4,10 L -64,10 Z" fill={WP.wood} stroke={WP.line} strokeWidth={2.6} />
          <path d="M 12,-6 L 70,-6 L 70,10 L 12,10 Z" fill={WP.wood} stroke={WP.line} strokeWidth={2.6} />
          {/* 筒袖の上衣 */}
          <path d="M -72,-112 L -80,-310 Q -74,-352 -32,-362 L 32,-362 Q 74,-352 80,-310 L 72,-112 Z" fill={WP.kinari} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 28,-362 Q 74,-352 80,-310 L 72,-112 L 42,-112 Z" fill={WP.kinariDim} opacity={0.7} />
          {/* 白い割烹着。胸当てと腰紐 */}
          <path d="M -48,-336 L 48,-336 L 42,-130 L -42,-130 Z" fill={WP.kappogi} stroke={WP.line} strokeWidth={3} />
          <path d="M -48,-336 L -30,-356 L 30,-356 L 48,-336 Z" fill={WP.kappogi} stroke={WP.line} strokeWidth={2.6} />
          <rect x={-52} y={-224} width={104} height={14} fill={WP.kappogiShade} />
          <path d="M 18,-336 L 42,-130 L 20,-130 Z" fill={WP.kappogiShade} opacity={0.6} />
          {/* 腕。片手は胸の前、もう片手が頭巾を下ろしていく */}
          <path d="M -78,-318 Q -108,-292 -106,-226 L -94,-176 L -62,-190 L -70,-236 Z" fill={WP.kinari} stroke={WP.line} strokeWidth={3} />
          <ellipse cx={-80} cy={-166} rx={21} ry={26} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <path
            d={`M 78,-318 Q 110,-292 ${110 - oku * 10},${-226 + oku * 70} L ${96 - oku * 10},${-170 + oku * 120} L ${64 - oku * 8},${-186 + oku * 118} L ${72},${-238 + oku * 60} Z`}
            fill={WP.kinari}
            stroke={WP.line}
            strokeWidth={3}
          />
          <ellipse cx={82 - oku * 10} cy={-158 + oku * 130} rx={21} ry={26} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {/* ★防空頭巾。手から離れて玉砂利の上に置かれる */}
          <g transform={`translate(${94 - oku * 14} ${-128 + oku * 128}) rotate(${oku * 68})`}>
            <path d="M -36,0 Q -42,-46 0,-54 Q 42,-46 36,0 Q 20,10 0,10 Q -20,10 -36,0 Z" fill={WP.boukuuZukin} stroke={WP.line} strokeWidth={3} />
            {/* 綿入れの刺し縫い。3本の筋 */}
            {[-14, 0, 14].map((sx) => (
              <path key={sx} d={`M ${sx},6 Q ${sx * 1.3},-28 ${sx * 0.7},-50`} stroke={WP.line} strokeWidth={2.2} fill="none" opacity={0.5} />
            ))}
            {/* 顎の下で結ぶ紐 */}
            <path d="M -32,2 Q -44,22 -30,34" stroke={WP.tenugui} strokeWidth={5} fill="none" />
            <path d="M 32,2 Q 44,22 30,34" stroke={WP.tenugui} strokeWidth={5} fill="none" />
            {/* 置かれると玉砂利に影が付く */}
            <ellipse cx={0} cy={14} rx={44} ry={9} fill={WP.natsuKage} opacity={0.5 * oku} />
          </g>
          {/* 首と顔。涙。頭巾を取ったので髪が見える */}
          <path d="M -22,-362 L 22,-362 L 20,-396 L -20,-396 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <g transform="translate(0 -446)">
            <Kao8 r={43} up={0} age="chu" sex="f" tear={namida} mouth={0.18} uid="a08-onna" />
          </g>
        </g>

        {/* (4) 空を見上げたまま動かない老人。着流し・杖 */}
        <g transform="translate(1448 1010)">
          <ellipse cx={0} cy={6} rx={74} ry={15} fill={WP.natsuKage} opacity={0.45} />
          {/* 着流し。裾が足を包む */}
          <path d="M -62,0 L 62,0 L 54,-300 Q 48,-336 10,-344 L -14,-344 Q -50,-336 -56,-300 Z" fill={WP.sabiDeep} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 18,-344 Q 48,-336 54,-300 L 62,0 L 32,0 Z" fill={WP.shadowDeep} opacity={0.45} />
          {/* 合わせの衿。左を上に */}
          <path d="M -14,-344 L -2,-200 L 26,-336 L 8,-346 Z" fill={WP.kinariDim} stroke={WP.line} strokeWidth={2.6} />
          {/* 角帯 */}
          <rect x={-58} y={-200} width={114} height={26} fill={WP.ink} />
          <rect x={-58} y={-196} width={114} height={6} fill={WP.rim} opacity={0.3} />
          {/* 下駄 */}
          <path d="M -54,-4 L -8,-4 L -8,12 L -54,12 Z" fill={WP.wood} stroke={WP.line} strokeWidth={2.4} />
          <path d="M 10,-4 L 56,-4 L 56,12 L 10,12 Z" fill={WP.wood} stroke={WP.line} strokeWidth={2.4} />
          {/* 杖。体の右に突き、やや前へ傾く */}
          <path d="M 76,20 L 92,-300 L 104,-300 L 90,20 Z" fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
          <ellipse cx={98} cy={-306} rx={14} ry={10} fill={WP.wood} stroke={WP.line} strokeWidth={2.4} />
          {/* 杖を握る手。節の浮いた指 */}
          <ellipse cx={92} cy={-278} rx={22} ry={27} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M 74,${-292 + i * 14} Q 94,${-298 + i * 14} 110,${-288 + i * 14}`} stroke={WP.skinShade} strokeWidth={2.6} fill="none" />
          ))}
          {/* 袖。もう片手は袖のなか */}
          <path d="M -56,-318 Q -82,-296 -80,-238 L -62,-204 L -34,-220 L -44,-250 Z" fill={WP.sabiDeep} stroke={WP.line} strokeWidth={3} />
          {/* 首と顔。見上げている。口がわずかに開く */}
          <path d="M -18,-344 L 18,-344 L 18,-374 L -18,-374 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <g transform="translate(0 -420) rotate(-12)">
            <Kao8 r={38} up={1} age="rou" sex="m" mouth={0.3} uid="a08-roujin" />
            {/* 白い顎髭 */}
            <path d="M -20,34 Q 0,62 20,34 Q 0,48 -20,34 Z" fill="#CFC9BC" opacity={0.9} />
          </g>
        </g>

        {/* (5) 母の背の赤ん坊 (ねんねこ半纏) と、母を見上げる女の子 */}
        <g transform="translate(1746 1034)">
          <ellipse cx={0} cy={6} rx={86} ry={17} fill={WP.natsuKage} opacity={0.48} />
          {/* 母のもんぺ */}
          <path d="M -66,-100 L 66,-100 L 56,-8 L 12,-8 L 2,-88 L -8,-8 L -52,-8 Z" fill={WP.monpe} stroke={WP.line} strokeWidth={3.4} />
          <path d="M -56,-4 L -6,-4 L -6,12 L -56,12 Z" fill={WP.wood} stroke={WP.line} strokeWidth={2.4} />
          <path d="M 10,-4 L 60,-4 L 60,12 L 10,12 Z" fill={WP.wood} stroke={WP.line} strokeWidth={2.4} />
          {/* ねんねこ半纏。赤ん坊ごと包む大きな上着 */}
          <path d="M -84,-102 L -92,-300 Q -86,-344 -40,-356 L 40,-356 Q 86,-344 92,-300 L 84,-102 Z" fill={WP.cloth} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 36,-356 Q 86,-344 92,-300 L 84,-102 L 52,-102 Z" fill={WP.shadow} opacity={0.4} />
          {/* 背中のふくらみ = 赤ん坊。半纏の下で盛り上がる */}
          <path d="M 44,-300 Q 104,-290 108,-216 Q 104,-160 50,-154 Z" fill={WP.cloth} stroke={WP.line} strokeWidth={3} />
          {/* 襟から出た赤ん坊の頭。眠っている (伏せ目) */}
          <g transform="translate(88 -288)">
            <Kao8 r={26} up={-1} age="ko" sex="m" uid="a08-akanbo" />
            {/* 頭を覆う布 */}
            <path d="M -28,-20 Q 0,-52 28,-18 Q 0,-34 -28,-20 Z" fill={WP.tenugui} stroke={WP.line} strokeWidth={2.4} />
          </g>
          {/* 半纏の紐を胸で結ぶ */}
          <path d="M -60,-250 Q 0,-232 60,-252" stroke={WP.tenugui} strokeWidth={8} fill="none" />
          <circle cx={0} cy={-240} r={11} fill={WP.tenugui} stroke={WP.line} strokeWidth={2.4} />
          {/* 母の腕。女の子の肩に手を置く */}
          <path d="M -90,-306 Q -120,-282 -118,-220 L -104,-182 L -74,-196 L -82,-232 Z" fill={WP.cloth} stroke={WP.line} strokeWidth={3} />
          <ellipse cx={-98} cy={-172} rx={20} ry={25} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {/* 母の首と顔。うつむく */}
          <path d="M -20,-356 L 20,-356 L 18,-388 L -18,-388 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <g transform="translate(0 -436) rotate(6)">
            <Kao8 r={40} up={-1} age="waka" sex="f" tear={namida * 0.6} uid="a08-haha" />
          </g>
          {/* 女の子。母を見上げる。筒袖の着物とおかっぱ */}
          <g transform="translate(-144 24)">
            <ellipse cx={0} cy={0} rx={48} ry={11} fill={WP.natsuKage} opacity={0.45} />
            <path d="M -40,-4 L 40,-4 L 34,-180 Q 28,-206 4,-212 L -8,-212 Q -32,-206 -36,-180 Z" fill={WP.clothRed} stroke={WP.line} strokeWidth={3} />
            <path d="M -8,-212 L 0,-120 L 18,-208 Z" fill={WP.kinari} stroke={WP.line} strokeWidth={2.4} />
            <rect x={-38} y={-124} width={76} height={18} fill={WP.sabi} />
            <path d="M -34,-6 L -4,-6 L -4,8 L -34,8 Z" fill={WP.wood} stroke={WP.line} strokeWidth={2.2} />
            <path d="M 6,-6 L 36,-6 L 36,8 L 6,8 Z" fill={WP.wood} stroke={WP.line} strokeWidth={2.2} />
            {/* 母を見上げる腕 */}
            <path d="M 34,-192 Q 58,-174 60,-136 L 52,-116 L 30,-126 L 32,-150 Z" fill={WP.clothRed} stroke={WP.line} strokeWidth={2.6} />
            <ellipse cx={48} cy={-108} rx={15} ry={19} fill={WP.skin} stroke={WP.line} strokeWidth={2.4} />
            <path d="M -14,-212 L 14,-212 L 13,-234 L -13,-234 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.4} />
            <g transform="translate(6 -272) rotate(22)">
              <Kao8 r={32} dir={0.6} up={1} age="ko" sex="f" mouth={0.3} uid="a08-ko" />
            </g>
          </g>
        </g>

        {/* (6) もう玉砂利に手をついている若い工員。手前でいちばん大きい */}
        <g transform="translate(240 1074)">
          <ellipse cx={30} cy={8} rx={150} ry={22} fill={WP.natsuKage} opacity={0.5} />
          {/* 膝と脛。玉砂利に乗る */}
          <path d="M -120,0 L -10,0 L -22,-96 L -128,-88 Z" fill={WP.kokuminFukuDark} stroke={WP.line} strokeWidth={3.4} />
          <Kyahan x={-70} y={0} h={56} w={52} />
          {/* 背中。前へ深く倒れている */}
          <path d="M -128,-80 Q -142,-176 -96,-214 L 36,-262 Q 86,-254 92,-204 L 72,-110 L -30,-86 Z" fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={3.4} />
          <path d="M -96,-214 L 36,-262 Q 86,-254 92,-204 L 70,-200 Q 58,-230 28,-234 Z" fill={WP.kokuminFukuLit} opacity={0.4} />
          {/* 背中の縫い目 */}
          <path d="M -112,-150 Q -20,-184 84,-212" stroke={WP.line} strokeWidth={2.6} fill="none" opacity={0.5} />
          {/* 玉砂利についた両手。指が砂利に食い込む */}
          <path d="M 96,-212 Q 136,-196 148,-120 L 150,-24 L 104,-20 L 100,-116 Z" fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={3} />
          <ellipse cx={128} cy={-12} rx={34} ry={20} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${106 + i * 15},-6 Q ${110 + i * 15},8 ${104 + i * 15},12`} stroke={WP.skinShade} strokeWidth={3} fill="none" />
          ))}
          <path d="M 40,-252 Q 78,-230 86,-150 L 84,-40 L 44,-38 L 46,-146 Z" fill={WP.kokuminFuku} stroke={WP.line} strokeWidth={3} opacity={0.9} />
          <ellipse cx={64} cy={-26} rx={32} ry={19} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {/* 首と顔。地面を見ている。横から見た伏せ顔 */}
          <path d="M 44,-266 L 76,-276 L 84,-250 L 52,-240 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <g transform="translate(74 -312) rotate(26)">
            <Kao8 r={46} dir={0.4} up={-1} age="waka" sex="m" mouth={0.3} uid="a08-kouin" />
            {/* 額から落ちる汗の粒 */}
            <circle cx={-10} cy={58} r={6} fill={WP.screenLit} opacity={0.75} />
            <circle cx={6} cy={76 + ((f % 30) / 30) * 26} r={5} fill={WP.screenLit} opacity={0.6} />
          </g>
        </g>
      </Cam>
      <YearTag year="一九四五" place="日本" f={f} />
    </WarmStage>
  );
};

// ===================================================================
// #9 図 43年後の1988年。
//
// ★2026-11-09 描き直し (別紙A #9)。
//   前は「年表の帯＋影絵の人」だった。影絵は廃止。年表の帯も外した
//   (真上から見下ろす構図に、横から見た帯は同居できない)。
//   構図 = **真上から**。机の上に2つの暦を並べて置く。人は暦を指す手だけ。
//
// 考証
//   ・1945年8月15日は**水曜日**。六曜は先負。旧暦では七月八日。
//     日めくりは旧字・旧かなの時代なので「昭和二十年」「八月」「十五」と組む
//   ・ペルシア暦 1367年 = 西暦1988/89年。1988年7月はティール (تیر) 月にあたる。
//     ティール1日 = 1988年6月22日 = **水曜 (چهارشنبه)** なので、暦の1日は
//     右から5列目に入る。ティールは31日まで
//   ・ティール27日 = 1988年7月18日。イランが国連決議598の受諾を表明した日。
//     ここに朱の丸を打つ
//   ・曜日は右から左へ進む (شنبه 土曜はじまり)。数字もペルシア数字 ۱۲۳
//   ・足した物 (自分の1つ) 方眼のメモに「1988－1945＝43」の筆算
// ===================================================================

// ペルシア数字に直す。暦の日付はこれで打つ
const faNum = (n: number) =>
  String(n)
    .split("")
    .map((d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])
    .join("");

const S09: SekaiArt = ({ f }) => {
  const count = Math.round(43 * easeOut(seg(f, 20, 56)));
  const numOn = easeOut(seg(f, 16, 32));
  const ito = easeInOut(seg(f, 6, 46)); // 朱の糸が渡っていく
  const maru = easeOut(seg(f, 54, 68)); // 決議受諾の日に朱の丸
  const mekure = easeOut(seg(f, 70, 92)); // ★事件: 日めくりの角がめくれ上がる
  const sasu = easeOut(seg(f, 30, 58)); // 指が暦に寄る

  // 1367年ティール月。1日は右から5列目 (چهارشنبه) に入る
  const tirCells = Array.from({ length: 31 }, (_, i) => {
    const p = 4 + i;
    return { d: i + 1, col: p % 7, row: Math.floor(p / 7) };
  });
  const wd = ["شنبه", "يكشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

  return (
    <WarmStage f={f} uid="a09" src={[300, -140]} srcR={1320} shafts={false} motes={12} vig={0.88} glow={WP.natsuHikari}>
      <defs>
        <linearGradient id="a09-tsukue" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={WP.mokumeTsukue} />
          <stop offset="58%" stopColor="#7E5632" />
          <stop offset="100%" stopColor={WP.mokumeSuji} />
        </linearGradient>
        <linearGradient id="a09-shinchu" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0CE72" />
          <stop offset="46%" stopColor={WP.brass} />
          <stop offset="100%" stopColor={WP.shinchuuKage} />
        </linearGradient>
      </defs>

      <Cam f={f} from={[0, 0, 1.04]} to={[-16, 10, 1.0]} start={0} end={104}>
        {/* ── 机。真上から見ているので、面がそのまま画面になる ── */}
        <rect x={-200} y={-120} width={W + 400} height={H + 240} fill="url(#a09-tsukue)" />
        {/* 木目。板の継ぎ目を斜めに3本 */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${-200 + i * 560},-120 L ${-80 + i * 560},${H + 120}`} stroke={WP.mokumeSuji} strokeWidth={i === 1 ? 9 : 5} opacity={0.5} fill="none" />
        ))}
        {Array.from({ length: 34 }, (_, i) => (
          <path
            key={`g${i}`}
            d={`M ${-200 + i * 64},-120 Q ${-170 + i * 64},${H * 0.5} ${-80 + i * 64},${H + 120}`}
            stroke={WP.mokumeSuji}
            strokeWidth={1.4 + ((i * 7) % 3) * 0.7}
            opacity={0.17}
            fill="none"
          />
        ))}

        {/* ===== 左 = 1945年8月の日めくり ===== */}
        <g transform="translate(470 548) rotate(-5)">
          {/* めくった紙を綴じた束の厚み。真上から見ると側面がわずかに見える */}
          <rect x={-196} y={-268} width={392} height={540} rx={5} fill={WP.shinbunKiiroKage} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-192 + i * 3} y={-264 - i * 3} width={386} height={534} rx={5} fill={WP.shinbunKiiro} opacity={0.5 + i * 0.1} />
          ))}
          <rect x={-184} y={-276} width={380} height={530} rx={5} fill={WP.shinbunKiiro} stroke={WP.line} strokeWidth={3} />
          {/* 紙のしみと、黄ばみの濃い帯 */}
          <ellipse cx={120} cy={190} rx={58} ry={34} fill={WP.shinbunKiiroKage} opacity={0.45} />
          <ellipse cx={-130} cy={-186} rx={40} ry={24} fill={WP.shinbunKiiroKage} opacity={0.35} />
          <rect x={-184} y={200} width={380} height={54} fill={WP.shinbunKiiroKage} opacity={0.25} />
          {/* 綴じ穴と針金 */}
          {[-62, 62].map((hx) => (
            <g key={hx}>
              <circle cx={hx} cy={-250} r={11} fill={WP.mokumeSuji} />
              <circle cx={hx} cy={-250} r={11} fill="none" stroke={WP.line} strokeWidth={2.6} />
              <path d={`M ${hx - 13},-262 Q ${hx},-284 ${hx + 13},-262`} stroke={WP.steel} strokeWidth={5} fill="none" />
            </g>
          ))}
          {/* 年号と月。旧字で組む */}
          <text x={-150} y={-196} fontFamily={SEKAI_SERIF} fontSize={34} fill={WP.ink} opacity={0.82}>
            昭和二十年
          </text>
          <text x={164} y={-196} fontFamily={SEKAI_SERIF} fontSize={46} fill={WP.inkRed} textAnchor="end" opacity={0.9}>
            八月
          </text>
          <line x1={-158} y1={-170} x2={170} y2={-170} stroke={WP.ink} strokeWidth={3} opacity={0.5} />
          {/* 日。大きく墨で */}
          <text x={2} y={66} fontFamily={SEKAI_SERIF} fontSize={212} fontWeight={700} fill={WP.ink} textAnchor="middle">
            十五
          </text>
          <text x={2} y={150} fontFamily={SEKAI_SERIF} fontSize={66} fill={WP.ink} textAnchor="middle" opacity={0.86}>
            日
          </text>
          {/* 曜日と六曜・旧暦 */}
          <text x={-150} y={214} fontFamily={SEKAI_SERIF} fontSize={38} fill={WP.ink} opacity={0.8}>
            水曜日
          </text>
          <text x={168} y={214} fontFamily={SEKAI_SERIF} fontSize={30} fill={WP.ink} textAnchor="end" opacity={0.6}>
            先負
          </text>
          <text x={168} y={246} fontFamily={SEKAI_SERIF} fontSize={24} fill={WP.ink} textAnchor="end" opacity={0.5}>
            舊曆七月八日
          </text>
          {/* ★事件: 右下の角がめくれ上がる。裏の白い面が見える */}
          <g opacity={mekure}>
            <path
              d={`M ${196 - mekure * 4},${254 - mekure * 2} L ${196 - mekure * 96},254 Q ${170 - mekure * 70},${236 - mekure * 72} ${196},${254 - mekure * 104} Z`}
              fill={WP.paperAged}
              stroke={WP.line}
              strokeWidth={2.6}
            />
            <path d={`M ${196 - mekure * 90},252 Q ${172 - mekure * 66},${234 - mekure * 66} 194,${252 - mekure * 96}`} stroke={WP.shinbunKiiroKage} strokeWidth={5} fill="none" opacity={0.6} />
          </g>
          {/* 紙が机に落とす影 */}
          <rect x={-176} y={-268} width={380} height={530} rx={5} fill="none" stroke={WP.mokumeSuji} strokeWidth={2} opacity={0.3} />
        </g>
        <ellipse cx={500} cy={830} rx={214} ry={30} fill={WP.mokumeSuji} opacity={0.35} />

        {/* ===== 右 = 1988年7月のペルシア暦 (1367年ティール月) ===== */}
        <g transform="translate(1356 560) rotate(4)">
          <rect x={-282} y={-272} width={568} height={548} rx={6} fill={WP.mokumeSuji} opacity={0.4} />
          <rect x={-290} y={-280} width={568} height={548} rx={6} fill={WP.paperWhite} stroke={WP.line} strokeWidth={3} />
          {/* 上の帯。月の名と年 */}
          <rect x={-290} y={-280} width={568} height={92} fill={WP.iranGreen} opacity={0.82} />
          <rect x={-290} y={-196} width={568} height={8} fill={WP.iranRed} opacity={0.8} />
          <text x={254} y={-216} fontFamily={PERSIAN} fontSize={66} fill={WP.paperWhite} textAnchor="end">
            تير
          </text>
          <text x={-266} y={-216} fontFamily={PERSIAN} fontSize={60} fill={WP.paperWhite}>
            ۱۳۶۷
          </text>
          {/* 曜日の見出し。右から左へ進む */}
          {wd.map((w, c) => (
            <text key={w} x={240 - c * 76} y={-148} fontFamily={PERSIAN} fontSize={21} fill={WP.ink} textAnchor="middle" opacity={0.78}>
              {w}
            </text>
          ))}
          <line x1={-266} y1={-128} x2={254} y2={-128} stroke={WP.ink} strokeWidth={2.6} opacity={0.4} />
          {/* 罫。7列5行 */}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={-278 + i * 76} y1={-128} x2={-278 + i * 76} y2={252} stroke={WP.ink} strokeWidth={1.6} opacity={0.2} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1={-278} y1={-128 + i * 76} x2={254} y2={-128 + i * 76} stroke={WP.ink} strokeWidth={1.6} opacity={0.2} />
          ))}
          {/* 日付。ペルシア数字。金曜 (いちばん左の列) は朱で刷る */}
          {tirCells.map((c) => (
            <text
              key={c.d}
              x={240 - c.col * 76}
              y={-72 + c.row * 76}
              fontFamily={PERSIAN}
              fontSize={c.col === 6 ? 40 : 38}
              fill={c.col === 6 ? WP.inkRed : WP.ink}
              textAnchor="middle"
              opacity={0.9}
            >
              {faNum(c.d)}
            </text>
          ))}
          {/* ★ティール27日 = 1988年7月18日。朱の丸を打つ */}
          <circle cx={240 - 2 * 76} cy={-86 + 4 * 76} r={34} fill="none" stroke={WP.inkRed} strokeWidth={6} opacity={maru} strokeDasharray={214} strokeDashoffset={214 * (1 - maru)} />
          {/* 紙の綴じ跡と、折った癖 */}
          <line x1={-290} y1={-16} x2={278} y2={-16} stroke={WP.mokumeSuji} strokeWidth={2.4} opacity={0.22} />
          <circle cx={-6} cy={-238} r={9} fill={WP.mokumeSuji} opacity={0.7} />
        </g>
        <ellipse cx={1390} cy={838} rx={286} ry={26} fill={WP.mokumeSuji} opacity={0.32} />

        {/* ===== 2つの暦の間に渡した朱の糸 ===== */}
        <g>
          {/* 両端の留め。虫ピン */}
          <circle cx={676} cy={318} r={9} fill="url(#a09-shinchu)" stroke={WP.line} strokeWidth={2.4} />
          <circle cx={1096} cy={352} r={9} fill="url(#a09-shinchu)" stroke={WP.line} strokeWidth={2.4} />
          <path
            d="M 676,318 Q 886,396 1096,352"
            fill="none"
            stroke={WP.shuIto}
            strokeWidth={6}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ito}
          />
          {/* 糸が机に落とす細い影 */}
          <path
            d="M 680,324 Q 890,402 1100,358"
            fill="none"
            stroke={WP.mokumeSuji}
            strokeWidth={4}
            opacity={0.4 * ito}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ito}
          />
          {/* 糸のよれ。繊維が1本はみ出している */}
          <path d="M 892,392 q 14,-16 30,-8" stroke={WP.shuIto} strokeWidth={2} fill="none" opacity={0.7 * ito} />
        </g>

        {/* ===== 「43」。糸が渡りきってから数え上がる ===== */}
        <g opacity={numOn}>
          <text x={886} y={250} fontFamily={SEKAI_SERIF} fontSize={158} fontWeight={700} fill={WP.sabi} textAnchor="middle">
            {count}
          </text>
          <text x={990} y={250} fontFamily={SEKAI_SERIF} fontSize={72} fontWeight={700} fill={WP.sabi} textAnchor="start" opacity={0.9}>
            年
          </text>
          {/* 鉛筆で引いた下線。にじんだ黒鉛 */}
          <rect x={790} y={272} width={236 * numOn} height={7} fill={WP.ink} opacity={0.6} />
        </g>

        {/* ===== 方眼のメモ。1988－1945＝43 の筆算 (自分で足した1つ) ===== */}
        <g transform="translate(246 912) rotate(-11)">
          <rect x={-168} y={-116} width={336} height={232} fill={WP.jishoKami} stroke={WP.line} strokeWidth={2.6} />
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`mv${i}`} x1={-160 + i * 26} y1={-116} x2={-160 + i * 26} y2={116} stroke={WP.noteKeisen} strokeWidth={1.2} opacity={0.5} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`mh${i}`} x1={-168} y1={-110 + i * 26} x2={168} y2={-110 + i * 26} stroke={WP.noteKeisen} strokeWidth={1.2} opacity={0.5} />
          ))}
          <text x={120} y={-58} fontFamily={SEKAI_SERIF} fontSize={44} fill={WP.ink} textAnchor="end">
            1988
          </text>
          <text x={120} y={-6} fontFamily={SEKAI_SERIF} fontSize={44} fill={WP.ink} textAnchor="end">
            1945
          </text>
          <text x={-128} y={-6} fontFamily={SEKAI_SERIF} fontSize={42} fill={WP.ink}>
            －
          </text>
          <line x1={-136} y1={14} x2={132} y2={14} stroke={WP.ink} strokeWidth={4} />
          <text x={120} y={72} fontFamily={SEKAI_SERIF} fontSize={52} fontWeight={700} fill={WP.sabi} textAnchor="end">
            43
          </text>
          {/* 消しゴムをかけた跡と、消しかす */}
          <rect x={-150} y={34} width={90} height={38} fill={WP.jishoKami} opacity={0.9} />
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={178 + i * 17} cy={96 + ((i * 11) % 19)} rx={6} ry={3.4} fill={WP.jishoKami} stroke={WP.line} strokeWidth={1.2} transform={`rotate(${i * 37} ${178 + i * 17} ${96})`} />
          ))}
        </g>

        {/* ===== 定規。竹のものさし。目盛りと数字を入れる ===== */}
        <g transform="translate(900 982) rotate(-7)">
          <rect x={-520} y={-30} width={1040} height={60} rx={4} fill={WP.mokumeSuji} opacity={0.4} transform="translate(6 8)" />
          <rect x={-520} y={-30} width={1040} height={60} rx={4} fill={WP.jogi} stroke={WP.line} strokeWidth={2.6} />
          {/* 竹の節 */}
          {[-300, 40, 390].map((nx) => (
            <rect key={nx} x={nx} y={-30} width={10} height={60} fill={WP.mokumeSuji} opacity={0.4} />
          ))}
          {/* 目盛り。5mmと10mmで長さを変える */}
          {Array.from({ length: 101 }, (_, i) => (
            <line
              key={i}
              x1={-500 + i * 10}
              y1={-30}
              x2={-500 + i * 10}
              y2={i % 10 === 0 ? 2 : i % 5 === 0 ? -8 : -16}
              stroke={WP.ink}
              strokeWidth={i % 10 === 0 ? 2.6 : 1.5}
              opacity={0.7}
            />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <text key={`n${i}`} x={-500 + i * 100} y={24} fontFamily={SEKAI_SERIF} fontSize={19} fill={WP.ink} textAnchor="middle" opacity={0.7}>
              {i * 10}
            </text>
          ))}
          {/* 上の縁の照り */}
          <rect x={-520} y={-30} width={1040} height={6} fill={WP.kinari} opacity={0.4} />
        </g>

        {/* ===== 鉛筆。六角軸・削った先・黒鉛 ===== */}
        <g transform="translate(1706 870) rotate(64)">
          <rect x={-18} y={-290} width={44} height={560} fill={WP.mokumeSuji} opacity={0.38} transform="translate(10 8)" />
          {/* 六角の面を3枚見せる */}
          <rect x={-21} y={-280} width={14} height={520} fill="#B07F1E" />
          <rect x={-7} y={-280} width={17} height={520} fill={WP.enpitsu} />
          <rect x={10} y={-280} width={13} height={520} fill="#F0C65A" />
          <rect x={-21} y={-280} width={44} height={520} fill="none" stroke={WP.line} strokeWidth={2.4} />
          {/* 削った先。木肌と黒鉛 */}
          <path d="M -21,-280 L 1,-356 L 23,-280 Z" fill={WP.jogi} stroke={WP.line} strokeWidth={2.4} />
          <path d="M -8,-324 L 1,-356 L 10,-324 Z" fill={WP.ink} />
          <path d="M -21,-280 L -6,-280 L -2,-336 Z" fill={WP.mokumeSuji} opacity={0.4} />
          {/* 軸の印字 (型番は書かず、墨の帯だけ) */}
          <rect x={-7} y={-150} width={17} height={56} fill={WP.ink} opacity={0.55} />
          {/* 消しゴム付きの金具 */}
          <rect x={-22} y={240} width={46} height={34} fill="url(#a09-shinchu)" stroke={WP.line} strokeWidth={2.4} />
          {[246, 256, 266].map((gy) => (
            <line key={gy} x1={-22} y1={gy} x2={24} y2={gy} stroke={WP.shinchuuKage} strokeWidth={2} opacity={0.6} />
          ))}
        </g>

        {/* ===== 暦を指す手だけ。下から入り、ティール27日を指す ===== */}
        <g transform={`translate(${1250 + sasu * 26} ${1112 - sasu * 40}) rotate(${-26 + sasu * 6})`}>
          <ellipse cx={30} cy={120} rx={168} ry={120} fill={WP.mokumeSuji} opacity={0.3} />
          {/* 手の甲 */}
          <path d="M -108,250 Q -124,110 -86,22 Q -40,-28 26,-20 Q 96,-10 108,70 L 120,250 Z" fill={WP.skin} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 64,-14 Q 104,-6 112,70 L 122,250 L 86,250 L 78,66 Z" fill={WP.skinShade} opacity={0.42} />
          {/* 伸ばした人差し指 */}
          <g transform="translate(-52 6) rotate(-86)">
            <Yubi x={0} y={0} ang={0} len={212} w={54} />
          </g>
          {/* 折り畳んだ中指・薬指・小指。関節の山が並ぶ */}
          {[
            { x: 16, y: 10, ang: -58, len: 96, w: 50 },
            { x: 58, y: 36, ang: -44, len: 86, w: 46 },
            { x: 92, y: 68, ang: -32, len: 70, w: 40 },
          ].map((g2, i) => (
            <Yubi key={i} x={g2.x} y={g2.y} ang={g2.ang} len={g2.len} w={g2.w} />
          ))}
          {/* 親指。手前に回り込む */}
          <Yubi x={-96} y={128} ang={-142} len={128} w={58} />
          {/* 甲の筋と皺 */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-72 + i * 52},226 Q ${-62 + i * 52},140 ${-48 + i * 52},62`} stroke={WP.skinShade} strokeWidth={3} fill="none" opacity={0.42} />
          ))}
          {/* 手首の袖口。白いシャツ */}
          <path d="M -112,250 L 122,250 L 130,320 L -120,320 Z" fill={WP.paperWhite} stroke={WP.line} strokeWidth={3.4} />
          <rect x={-114} y={252} width={238} height={12} fill={WP.kappogiShade} opacity={0.7} />
        </g>
      </Cam>
      <YearTag year="一九八八" place="イラン" f={f} x={128} y={126} />
    </WarmStage>
  );
};

// ===================================================================
// #10 山 イランでも、同じことが起きます。(全景可)
//
// ★2026-11-09 描き直し (別紙A #10)。
//   前は世界地図＋黒い影絵2つ。影絵は廃止、地図もやめて
//   **1988年7月のテヘランの街角**そのものを描く。
//
// 考証 (色の台帳は world.tsx の WP)
//   ・テヘランは標高1200mの大都市。砂漠とラクダではない。奥にアルボルズの山稜。
//     7月なので雪は無く、乾いた褐色＋白い霞
//   ・壁は日干し煉瓦。腰の高さに水色のタイルの腰壁を張るのがこの街の作法
//   ・看板はペルシア語。右から左。ナスフ系で、角張らせない
//   ・殉教者ポスター = 若い男の顔写真＋赤いチューリップ＋緑の書体の枠、
//     下に名前と戦死日。壁いっぱいに貼り重ねる
//   ・ホメイニ師は**黒いターバン** (サイイド=預言者の子孫の印) ＋黒いアバ＋
//     茶のカフタン＋白い髭。似顔絵にはしない。目のあたりは
//     **後から貼られた新しい帯状のビラ**が横切って隠れている (構図の都合)
//   ・白いペイカン (Paykan) のセダン。角の立った三箱型・クロームのバンパー
//   ・街路の水路 (ジュー) が縁石に沿って流れている
//   ・窓にはテープの×印 (都市間ミサイル戦の名残)
//   ・携帯電話・液晶・ペットボトルは出さない
//   ・足した物 (自分の1つ) チャイハーネの戸口に出した真鍮のサモワール
//
// ★事件 殉教者の壁に、貼られたばかりの新しい一枚が風でめくれる
// ===================================================================

// この枚の人。#6 の Hito も #8 の Kao8 も使い回さない。
// 1988年のテヘランの顔。無精髭・白髭・日焼けを服とは別に持たせる。
const Kao10: React.FC<{
  r: number;
  dir?: number; // -1..1 顔の向き
  up?: number; // -1 伏せ目 / 1 見上げる
  age: "ko" | "waka" | "chu" | "rou";
  sex: "m" | "f";
  hige?: "none" | "buji" | "shiro"; // 無精髭 / 白い髭
  tear?: number;
  mouth?: number;
  hair?: boolean; // 髪を出すか (チャードル・ルーサリーのときは false)
}> = ({ r, dir = 0, up = 0, age, sex, hige = "none", tear = 0, mouth = 0, hair = true }) => {
  const sk = age === "rou" ? "#C49A74" : age === "ko" ? "#E0AE84" : WP.skin;
  const sh = WP.skinShade;
  const dx = dir * r * 0.2;
  const jaw = age === "ko" ? 0.9 : age === "rou" ? 1.04 : 1;
  return (
    <g>
      {/* 頭。年齢で顎の幅と長さを変える */}
      <path
        d={`M ${-r},${-r * 0.16} C ${-r},${-r * 0.98} ${-r * 0.5},${-r * 1.2} 0,${-r * 1.2}
            C ${r * 0.5},${-r * 1.2} ${r},${-r * 0.98} ${r},${-r * 0.16}
            C ${r},${r * 0.6 * jaw} ${r * 0.5},${r * 1.1 * jaw} 0,${r * 1.1 * jaw}
            C ${-r * 0.5},${r * 1.1 * jaw} ${-r},${r * 0.6 * jaw} ${-r},${-r * 0.16} Z`}
        fill={sk}
        stroke={WP.line}
        strokeWidth={r * 0.07}
      />
      {/* 顎の下の陰 */}
      <path d={`M ${-r * 0.7},${r * 0.5} C ${-r * 0.3},${r * 1.08 * jaw} ${r * 0.3},${r * 1.08 * jaw} ${r * 0.7},${r * 0.5}`} fill={sh} opacity={0.26} />
      {/* 耳。向いた側は隠れる */}
      {dir <= 0.3 && <path d={`M ${-r * 0.98},${-r * 0.1} q ${-r * 0.22},${r * 0.06} ${-r * 0.1},${r * 0.3} q ${r * 0.1},${r * 0.1} ${r * 0.14},${-r * 0.04}`} fill={sk} stroke={WP.line} strokeWidth={r * 0.06} />}
      {dir >= -0.3 && <path d={`M ${r * 0.98},${-r * 0.1} q ${r * 0.22},${r * 0.06} ${r * 0.1},${r * 0.3} q ${-r * 0.1},${r * 0.1} ${-r * 0.14},${-r * 0.04}`} fill={sk} stroke={WP.line} strokeWidth={r * 0.06} />}
      {/* 目。伏せ目は上に凸の C、見上げるときは白目を広く取る */}
      {[-1, 1].map((s) => {
        const ex = dx + s * r * 0.4;
        const ey = -r * 0.16 + up * -r * 0.05;
        if (up < 0) {
          return <path key={s} d={`M ${ex - r * 0.21},${ey + r * 0.05} Q ${ex},${ey - r * 0.11} ${ex + r * 0.21},${ey + r * 0.05}`} stroke={WP.line} strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />;
        }
        return (
          <g key={s}>
            <ellipse cx={ex} cy={ey} rx={r * 0.21} ry={r * 0.15 + up * r * 0.03} fill="#F2EADC" stroke={WP.line} strokeWidth={r * 0.055} />
            <circle cx={ex + dir * r * 0.05} cy={ey + (up > 0 ? -r * 0.03 : 0)} r={r * 0.1} fill="#2A201A" />
            <circle cx={ex + dir * r * 0.05 - r * 0.035} cy={ey - r * 0.04} r={r * 0.032} fill="#F6F1E4" />
            {/* 上の睫 */}
            <path d={`M ${ex - r * 0.21},${ey - r * 0.04} Q ${ex},${ey - r * 0.2} ${ex + r * 0.21},${ey - r * 0.04}`} stroke={WP.line} strokeWidth={r * 0.06} fill="none" />
          </g>
        );
      })}
      {/* 眉。女は細く弧、男は太く直線的。老人は灰で下がる */}
      {[-1, 1].map((s) => {
        const ex = dx + s * r * 0.4;
        const by = -r * 0.42;
        const col = age === "rou" ? "#A79B8C" : "#3A2A1E";
        return sex === "f" ? (
          <path key={s} d={`M ${ex - r * 0.25},${by + r * 0.06} Q ${ex},${by - r * 0.1} ${ex + r * 0.25},${by + r * 0.04}`} stroke={col} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
        ) : (
          <path key={s} d={`M ${ex - r * 0.28},${by + (age === "rou" ? r * 0.02 : r * 0.08)} L ${ex + r * 0.28},${by - r * 0.02}`} stroke={col} strokeWidth={r * 0.13} fill="none" strokeLinecap="round" />
        );
      })}
      {/* 鼻。筋と小鼻 */}
      <path d={`M ${dx + dir * r * 0.06},${-r * 0.1} L ${dx + dir * r * 0.14},${r * 0.26}`} stroke={sh} strokeWidth={r * 0.07} fill="none" opacity={0.7} />
      <path d={`M ${dx - r * 0.12 + dir * r * 0.1},${r * 0.3} Q ${dx + dir * r * 0.12},${r * 0.4} ${dx + r * 0.12 + dir * r * 0.1},${r * 0.3}`} stroke={WP.line} strokeWidth={r * 0.06} fill="none" />
      {/* 口 */}
      {mouth > 0.1 ? (
        <>
          <ellipse cx={dx + dir * r * 0.1} cy={r * 0.6} rx={r * 0.17} ry={r * 0.11 + mouth * r * 0.07} fill="#5E2A24" stroke={WP.line} strokeWidth={r * 0.05} />
          <path d={`M ${dx + dir * r * 0.1 - r * 0.12},${r * 0.56} Q ${dx + dir * r * 0.1},${r * 0.52} ${dx + dir * r * 0.1 + r * 0.12},${r * 0.56}`} stroke="#F2EADC" strokeWidth={r * 0.05} fill="none" opacity={0.6} />
        </>
      ) : (
        <path d={`M ${dx + dir * r * 0.1 - r * 0.17},${r * 0.6} Q ${dx + dir * r * 0.1},${r * 0.68} ${dx + dir * r * 0.1 + r * 0.17},${r * 0.58}`} stroke={WP.line} strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />
      )}
      {/* 髭 */}
      {hige === "buji" && (
        <>
          <path d={`M ${dx - r * 0.3},${r * 0.46} Q ${dx},${r * 0.58} ${dx + r * 0.3},${r * 0.44}`} stroke="#3A2A1E" strokeWidth={r * 0.1} fill="none" opacity={0.45} />
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={dx - r * 0.5 + (i % 11) * r * 0.1} cy={r * (i < 11 ? 0.78 : 0.92)} r={r * 0.026} fill="#3A2A1E" opacity={0.5} />
          ))}
        </>
      )}
      {hige === "shiro" && (
        <>
          <path d={`M ${dx - r * 0.34},${r * 0.44} Q ${dx},${r * 0.56} ${dx + r * 0.34},${r * 0.42}`} fill="none" stroke={WP.agohige} strokeWidth={r * 0.13} opacity={0.9} />
          <path d={`M ${-r * 0.56},${r * 0.5} Q 0,${r * 1.5} ${r * 0.56},${r * 0.5} Q 0,${r * 0.84} ${-r * 0.56},${r * 0.5} Z`} fill={WP.agohige} stroke={WP.line} strokeWidth={r * 0.05} />
        </>
      )}
      {/* 涙 */}
      {tear > 0.05 &&
        [-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${dx + s * r * 0.4},${-r * 0.02} L ${dx + s * r * 0.44},${r * (0.3 + tear * 0.7)}`} stroke={WP.screenLit} strokeWidth={r * 0.07} opacity={0.72 * tear} strokeLinecap="round" />
            <circle cx={dx + s * r * 0.44} cy={r * (0.32 + tear * 0.72)} r={r * 0.08} fill={WP.screenLit} opacity={0.8 * tear} />
          </g>
        ))}
      {/* 老いの皺 */}
      {age === "rou" && (
        <>
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M ${dx + s * r * 0.62},${-r * 0.24} q ${s * r * 0.16},${r * 0.12} 0,${r * 0.24}`} stroke={sh} strokeWidth={r * 0.05} fill="none" opacity={0.6} />
              <path d={`M ${dx + s * r * 0.3},${r * 0.36} q ${s * r * 0.1},${r * 0.16} ${s * r * 0.04},${r * 0.3}`} stroke={sh} strokeWidth={r * 0.05} fill="none" opacity={0.5} />
            </g>
          ))}
          <path d={`M ${-r * 0.44},${-r * 0.66} Q 0,${-r * 0.76} ${r * 0.44},${-r * 0.66}`} stroke={sh} strokeWidth={r * 0.05} fill="none" opacity={0.5} />
          <path d={`M ${-r * 0.4},${-r * 0.82} Q 0,${-r * 0.9} ${r * 0.4},${-r * 0.82}`} stroke={sh} strokeWidth={r * 0.045} fill="none" opacity={0.4} />
        </>
      )}
      {/* 髪 */}
      {hair &&
        (sex === "f" ? (
          <path d={`M ${-r * 1.04},${-r * 0.1} C ${-r * 1.1},${-r * 1.1} ${r * 1.1},${-r * 1.1} ${r * 1.04},${-r * 0.1} C ${r * 0.9},${-r * 0.62} ${-r * 0.9},${-r * 0.62} ${-r * 1.04},${-r * 0.1} Z`} fill={age === "rou" ? "#9A9186" : "#241C18"} stroke={WP.line} strokeWidth={r * 0.06} />
        ) : (
          <path d={`M ${-r},${-r * 0.3} C ${-r * 1.04},${-r * 1.14} ${r * 1.04},${-r * 1.14} ${r},${-r * 0.3} C ${r * 0.84},${-r * 0.74} ${-r * 0.8},${-r * 0.72} ${-r},${-r * 0.3} Z`} fill={age === "rou" ? "#A29A8E" : "#201A16"} stroke={WP.line} strokeWidth={r * 0.06} />
        ))}
    </g>
  );
};

const S10: SekaiArt = ({ f }) => {
  const kaze = Math.sin(f / 13) * 1 + Math.sin(f / 5.1) * 0.4; // 乾いた風
  const mekure = easeOut(seg(f, 44, 82)); // ★事件: 新しい一枚がめくれる
  const hata = Math.sin(f / 9) * 6; // 国旗のはらみ
  const te = easeOut(seg(f, 30, 64)); // 老女が手を伸ばす
  const tobu = easeInOut(seg(f, 18, 44)); // 少年が水路を飛び越す
  const yuge = (f % 48) / 48; // サモワールの湯気

  // 殉教者の遺影。顔と戦死日をひとつずつ違えて並べる
  const shahid = [
    { n: "محمد رضايى", d: "۱۳۶۱/۸/۴", a: 0 },
    { n: "على احمدى", d: "۱۳۶۲/۳/۱۱", a: 1 },
    { n: "حسين كريمى", d: "۱۳۶۳/۵/۲", a: 2 },
    { n: "رضا موسوى", d: "۱۳۶۴/۱/۹", a: 0 },
    { n: "مهدى صادقى", d: "۱۳۶۵/۴/۲۳", a: 1 },
    { n: "جعفر نورى", d: "۱۳۶۶/۲/۶", a: 2 },
  ];

  return (
    <WarmStage f={f} uid="a10" src={[1480, 60]} srcR={1240} shafts={false} motes={26} vig={0.82} bg="url(#a10-sora)" glow={WP.natsuHikari}>
      <defs>
        <linearGradient id="a10-sora" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9EB8C8" />
          <stop offset="62%" stopColor="#CFD2C6" />
          <stop offset="100%" stopColor={WP.sunaBokori} />
        </linearGradient>
        <linearGradient id="a10-renga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CCA878" />
          <stop offset="70%" stopColor={WP.hiboshiRenga} />
          <stop offset="100%" stopColor={WP.hiboshiRengaKage} />
        </linearGradient>
        <linearGradient id="a10-kuruma" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#FAF8F0" />
          <stop offset="54%" stopColor={WP.paykan} />
          <stop offset="100%" stopColor="#B6B4AA" />
        </linearGradient>
      </defs>

      <Cam f={f} from={[0, 0, 1.0]} to={[-22, 12, 1.07]} start={0} end={116}>
        {/* ── 奥 アルボルズの山稜。7月なので雪は無く、霞んで褐色 ── */}
        <path d="M -200,330 L 120,206 L 330,268 L 560,174 L 820,254 L 1060,196 L 1340,272 L 1600,214 L 2120,300 L 2120,392 L -200,392 Z" fill="#A89880" opacity={0.5} />
        <path d="M -200,352 L 260,268 L 620,320 L 980,262 L 1420,334 L 2120,282 L 2120,412 L -200,412 Z" fill="#9A8A72" opacity={0.42} />
        {/* 霞。山の裾を白く飛ばす。画面全体には掛けない */}
        <rect x={-200} y={330} width={W + 400} height={86} fill={WP.sunaBokori} opacity={0.4} />

        {/* ── 通りの奥。低い家並みと、テープの×印の窓 ── */}
        <rect x={-200} y={392} width={W + 400} height={210} fill={WP.hiboshiRengaKage} opacity={0.85} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i}>
            <rect x={-160 + i * 300} y={406 + (i % 3) * 22} width={240} height={200} fill={WP.hiboshiRenga} opacity={0.72} stroke={WP.line} strokeWidth={2.4} />
            {/* 窓。全部にテープの×印が貼られている */}
            <rect x={-96 + i * 300} y={446 + (i % 3) * 22} width={96} height={82} fill="#4E5A5E" stroke={WP.line} strokeWidth={2.6} />
            <path d={`M ${-96 + i * 300},${446 + (i % 3) * 22} L ${0 + i * 300},${528 + (i % 3) * 22} M ${0 + i * 300},${446 + (i % 3) * 22} L ${-96 + i * 300},${528 + (i % 3) * 22}`} stroke={WP.tenugui} strokeWidth={7} opacity={0.85} />
            {/* 屋上の貯水タンクとテレビの魚骨アンテナ */}
            <rect x={-60 + i * 300} y={382 + (i % 3) * 22} width={54} height={26} fill={WP.steelDark} stroke={WP.line} strokeWidth={2.2} />
            <path d={`M ${60 + i * 300},${406 + (i % 3) * 22} L ${60 + i * 300},${356 + (i % 3) * 22}`} stroke={WP.steelDark} strokeWidth={3} />
            {[0, 1, 2].map((k) => (
              <line key={k} x1={44 + i * 300} y1={364 + k * 12 + (i % 3) * 22} x2={76 + i * 300} y2={364 + k * 12 + (i % 3) * 22} stroke={WP.steelDark} strokeWidth={2.4} />
            ))}
          </g>
        ))}

        {/* ── 手前の壁。日干し煉瓦＋水色のタイルの腰壁 ── */}
        <rect x={-200} y={236} width={W + 400} height={660} fill="url(#a10-renga)" />
        {/* 煉瓦の目地。横は通し、縦は半枚ずらす */}
        {Array.from({ length: 22 }, (_, r) => (
          <g key={r}>
            <line x1={-200} y1={252 + r * 30} x2={2120} y2={252 + r * 30} stroke={WP.hiboshiRengaKage} strokeWidth={2.4} opacity={0.5} />
            {Array.from({ length: 24 }, (_, c) => (
              <line key={c} x1={-200 + c * 98 + (r % 2) * 49} y1={252 + r * 30} x2={-200 + c * 98 + (r % 2) * 49} y2={282 + r * 30} stroke={WP.hiboshiRengaKage} strokeWidth={2.2} opacity={0.4} />
            ))}
          </g>
        ))}
        {/* 漆喰が剥がれて下地が出た所 */}
        <path d="M 240,470 q 70,-34 128,8 q 24,66 -40,86 q -96,10 -88,-94 Z" fill={WP.shikkuiHagare} opacity={0.5} />
        <path d="M 1660,560 q 60,-20 92,22 q -10,56 -80,44 Z" fill={WP.shikkuiHagare} opacity={0.42} />
        {/* 水色のタイルの腰壁。この街の壁の作法 */}
        <rect x={-200} y={740} width={W + 400} height={152} fill={WP.tileMizuiro} />
        {Array.from({ length: 48 }, (_, i) => (
          <g key={i}>
            <rect x={-200 + i * 50} y={740} width={46} height={72} fill={i % 3 === 0 ? WP.tileMizuiroLit : WP.tileMizuiro} stroke="#2E6E80" strokeWidth={2.2} />
            <rect x={-200 + i * 50} y={816} width={46} height={72} fill={i % 4 === 1 ? WP.tileMizuiroLit : WP.tileMizuiro} stroke="#2E6E80" strokeWidth={2.2} />
            {/* 釉の照り。左上に一筋 */}
            <path d={`M ${-194 + i * 50},786 L ${-176 + i * 50},748`} stroke={WP.paperWhite} strokeWidth={3} opacity={0.26} />
          </g>
        ))}
        <rect x={-200} y={732} width={W + 400} height={12} fill={WP.hiboshiRengaKage} />
        <rect x={-200} y={886} width={W + 400} height={10} fill="#28606E" />

        {/* ── 左 チャイハーネの戸口。真鍮のサモワール (自分で足した1つ) ── */}
        <g>
          <rect x={56} y={398} width={246} height={494} fill="#3A2A1E" stroke={WP.line} strokeWidth={4} />
          <rect x={76} y={418} width={206} height={454} fill="#1E1812" />
          <rect x={44} y={382} width={270} height={26} fill={WP.hiboshiRengaKage} stroke={WP.line} strokeWidth={2.6} />
          {/* 看板。ペルシア語・右から左 */}
          <rect x={30} y={296} width={300} height={82} rx={5} fill={WP.iranGreen} stroke={WP.line} strokeWidth={3.4} />
          <text x={310} y={358} fontFamily={PERSIAN} fontSize={56} fill={WP.paperWhite} textAnchor="end">
            چايخانه
          </text>
          {/* 戸口の脇に出した台と、真鍮のサモワール */}
          <rect x={300} y={790} width={150} height={16} fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
          <rect x={312} y={806} width={14} height={86} fill={WP.woodDark} />
          <rect x={424} y={806} width={14} height={86} fill={WP.woodDark} />
          <g transform="translate(376 790)">
            <path d="M -46,0 L -40,-44 Q -58,-78 -40,-112 L -34,-150 L 34,-150 L 40,-112 Q 58,-78 40,-44 L 46,0 Z" fill={WP.brass} stroke={WP.line} strokeWidth={3} />
            <path d="M 10,-150 L 34,-150 L 40,-112 Q 58,-78 40,-44 L 46,0 L 20,0 Z" fill={WP.shinchuuKage} opacity={0.6} />
            <path d="M -40,-100 Q -22,-108 -4,-100" stroke={WP.kinari} strokeWidth={5} fill="none" opacity={0.6} />
            {/* 蛇口と取手 */}
            <path d="M -44,-54 L -66,-54 L -66,-34 L -58,-34" stroke={WP.brass} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d="M 44,-92 q 26,10 0,34" stroke={WP.brass} strokeWidth={8} fill="none" />
            {/* 上に載せた小さな茶壺 */}
            <path d="M -22,-150 L -18,-180 L 18,-180 L 22,-150 Z" fill={WP.sabi} stroke={WP.line} strokeWidth={2.6} />
            <path d="M 18,-176 q 18,6 10,18" stroke={WP.sabi} strokeWidth={6} fill="none" />
            {/* 湯気。ゆらりと一筋 */}
            <path d={`M 2,-186 q ${12 - yuge * 20},-30 ${-4 + yuge * 10},-58`} stroke={WP.paperWhite} strokeWidth={6} fill="none" opacity={0.3 * (1 - yuge)} strokeLinecap="round" />
          </g>
          {/* エステカン。細腰のチャイグラスとソーサー */}
          <g transform="translate(330 788)">
            <ellipse cx={0} cy={0} rx={22} ry={6} fill={WP.steelLit} stroke={WP.line} strokeWidth={2.2} />
            <path d="M -12,-2 L -9,-20 L -13,-40 L 13,-40 L 9,-20 L 12,-2 Z" fill={WP.chai} stroke={WP.line} strokeWidth={2.2} opacity={0.9} />
          </g>
        </g>

        {/* ── ホメイニ師の肖像ポスター。目のあたりは後から貼られた帯が横切る ── */}
        <g transform="translate(700 282)">
          <rect x={-8} y={-8} width={312} height={372} fill={WP.hiboshiRengaKage} opacity={0.5} />
          <rect x={0} y={0} width={300} height={360} fill={WP.kinariDim} stroke={WP.line} strokeWidth={4} />
          {/* ポスターの地。緑の枠 */}
          <rect x={14} y={14} width={272} height={332} fill="#DCD2B4" stroke={WP.iranGreen} strokeWidth={8} />
          {/* 黒いアバ (外衣)。肩から下 */}
          <path d="M 44,346 L 56,250 Q 96,214 150,212 Q 204,214 244,250 L 256,346 Z" fill={WP.turbanKuro} stroke={WP.line} strokeWidth={3} />
          <path d="M 150,212 L 150,346" stroke={WP.turbanOrime} strokeWidth={4} opacity={0.8} />
          {/* 下に着た茶のカフタン。衿が覗く */}
          <path d="M 122,220 L 150,282 L 178,220 L 150,210 Z" fill={WP.kaftanCha} stroke={WP.line} strokeWidth={2.6} />
          {/* 首と顔。似顔絵にしない。布と肌には色を入れる */}
          <path d="M 128,214 L 172,214 L 170,186 L 130,186 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <path d="M 102,122 Q 102,196 150,196 Q 198,196 198,122 Z" fill={WP.skin} stroke={WP.line} strokeWidth={3} />
          {/* 白い顎髭。長く胸まで */}
          <path d="M 110,150 Q 150,250 190,150 Q 150,186 110,150 Z" fill={WP.agohige} stroke={WP.line} strokeWidth={2.6} />
          <path d="M 112,142 Q 150,158 188,142" stroke={WP.agohige} strokeWidth={9} fill="none" />
          {/* ★黒いターバン。サイイドの印。巻きの折り目を3本 */}
          <path d="M 94,118 Q 96,56 150,52 Q 204,56 206,118 Q 150,136 94,118 Z" fill={WP.turbanKuro} stroke={WP.line} strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${98 + i * 4},${110 - i * 18} Q 150,${124 - i * 20} ${202 - i * 4},${110 - i * 18}`} stroke={WP.turbanOrime} strokeWidth={4} fill="none" />
          ))}
          <path d="M 94,118 L 88,142 Q 150,160 212,142 L 206,118" fill={WP.turbanKuro} stroke={WP.line} strokeWidth={3} />
          {/* ★後から貼られた帯状のビラが目のあたりを横切っている (構図の都合) */}
          <g transform="rotate(-3 150 142)">
            <rect x={6} y={122} width={288} height={54} fill={WP.iranGreen} stroke={WP.line} strokeWidth={2.6} opacity={0.96} />
            <text x={282} y={162} fontFamily={PERSIAN} fontSize={34} fill={WP.paperWhite} textAnchor="end">
              قطعنامه
            </text>
            {/* 貼ったばかりの糊のしわ */}
            <path d="M 40,126 q 40,22 84,-2 q 46,24 92,0" stroke={WP.iranGreen} strokeWidth={5} fill="none" opacity={0.6} />
          </g>
          {/* 紙の波打ちと、画鋲 */}
          {[
            [22, 22],
            [278, 22],
            [22, 338],
            [278, 338],
          ].map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={7} fill={WP.steelLit} stroke={WP.line} strokeWidth={2.2} />
          ))}
        </g>

        {/* ── 緑白赤のイラン国旗。壁から斜めに差した竿に ── */}
        <g transform="translate(1028 262) rotate(28)">
          <rect x={-8} y={-10} width={300} height={16} rx={6} fill={WP.steelDark} stroke={WP.line} strokeWidth={2.4} />
          <circle cx={296} cy={-2} r={13} fill={WP.brass} stroke={WP.line} strokeWidth={2.4} />
          <g transform="translate(30 6)">
            <path d={`M 0,0 L 230,${hata * 0.4} L 230,${48 + hata * 0.5} L 0,48 Z`} fill={WP.iranGreen} stroke={WP.line} strokeWidth={2.4} />
            <path d={`M 0,48 L 230,${48 + hata * 0.5} L 230,${96 + hata * 0.6} L 0,96 Z`} fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.4} />
            <path d={`M 0,96 L 230,${96 + hata * 0.6} L 230,${144 + hata * 0.7} L 0,144 Z`} fill={WP.iranRed} stroke={WP.line} strokeWidth={2.4} />
            {/* 中央の赤い意匠。4つの三日月＋縦の剣 */}
            <g transform="translate(112 72)" fill={WP.iranRed}>
              <rect x={-4} y={-30} width={8} height={54} />
              <path d="M -34,-6 q 12,-22 22,0 q -11,-10 -22,0 Z" />
              <path d="M 34,-6 q -12,-22 -22,0 q 11,-10 22,0 Z" />
              <path d="M -17,14 q 9,-18 17,-2 q -9,-8 -17,2 Z" />
              <path d="M 17,14 q -9,-18 -17,-2 q 9,-8 17,2 Z" />
            </g>
          </g>
        </g>

        {/* ── 殉教者の壁。若い戦死者の遺影を貼り重ねる ── */}
        <g transform="translate(1086 352)">
          {/* 見出しの帯 */}
          <rect x={-10} y={-62} width={620} height={54} fill={WP.sabiDeep} stroke={WP.line} strokeWidth={3} />
          <text x={598} y={-22} fontFamily={PERSIAN} fontSize={38} fill={WP.kinari} textAnchor="end">
            شهداى محله
          </text>
          {shahid.map((s, i) => {
            const px = (i % 3) * 206;
            const py = Math.floor(i / 3) * 214;
            const tilt = ((i * 37) % 7) - 3;
            return (
              <g key={s.n} transform={`translate(${px} ${py}) rotate(${tilt} 90 100)`}>
                <rect x={6} y={6} width={186} height={200} fill={WP.hiboshiRengaKage} opacity={0.45} />
                <rect x={0} y={0} width={186} height={200} fill={WP.kinariDim} stroke={WP.iranGreen} strokeWidth={6} />
                {/* 顔写真。セピアの若い男。3通りに描き分ける */}
                <rect x={16} y={16} width={154} height={116} fill="#8E7A58" />
                <g transform="translate(93 92)">
                  <Kao10
                    r={34}
                    dir={s.a === 1 ? 0.3 : s.a === 2 ? -0.25 : 0}
                    age="waka"
                    sex="m"
                    hige={s.a === 0 ? "buji" : "none"}
                    hair
                  />
                  {/* 襟なしシャツか、動員兵の緑の鉢巻 */}
                  {s.a === 2 ? (
                    <rect x={-36} y={-44} width={72} height={13} fill={WP.hachimakiMidori} stroke={WP.line} strokeWidth={2} />
                  ) : (
                    <path d="M -40,46 L -14,30 L 14,30 L 40,46 L 40,54 L -40,54 Z" fill={s.a === 0 ? WP.paperWhite : WP.fieldJacket} stroke={WP.line} strokeWidth={2.2} />
                  )}
                </g>
                {/* 写真のセピアのむら */}
                <rect x={16} y={16} width={154} height={116} fill={WP.sunaBokori} opacity={0.16} />
                {/* 赤いチューリップ。殉教の印 */}
                <g transform="translate(30 174)">
                  <path d="M 0,0 L 0,-30" stroke={WP.iranGreen} strokeWidth={4} />
                  <path d="M 0,-14 q -16,-8 -20,4" stroke={WP.iranGreen} strokeWidth={4} fill="none" />
                  <path d="M -13,-30 Q -13,-50 0,-54 Q 13,-50 13,-30 Q 0,-24 -13,-30 Z" fill={WP.iranRed} stroke={WP.line} strokeWidth={2} />
                </g>
                {/* 名前と戦死日 */}
                <text x={176} y={162} fontFamily={PERSIAN} fontSize={22} fill={WP.ink} textAnchor="end">
                  {s.n}
                </text>
                <text x={176} y={188} fontFamily={PERSIAN} fontSize={19} fill={WP.sabi} textAnchor="end">
                  {s.d}
                </text>
                {/* 糊で貼った跡。四隅が浮いている */}
                <path d="M 0,0 L 18,10 L 0,14 Z" fill={WP.hiboshiRenga} opacity={0.6} />
              </g>
            );
          })}
          {/* ★事件: 貼られたばかりの新しい一枚。糊が乾く前に風でめくれる */}
          <g transform={`translate(412 214)`}>
            <rect x={6} y={6} width={186} height={200} fill={WP.hiboshiRengaKage} opacity={0.4 + 0.3 * mekure} />
            <g transform={`translate(${mekure * 10} 0) rotate(${mekure * (5 + kaze * 1.4)} 0 0)`}>
              {/* めくれていない左側 */}
              <path d={`M 0,0 L ${186 - mekure * 74},${mekure * -10} L ${186 - mekure * 86},${200 + mekure * 8} L 0,200 Z`} fill={WP.paperWhite} stroke={WP.iranGreen} strokeWidth={6} />
              {/* めくれ上がった右側。裏の白い面 */}
              <path
                d={`M ${186 - mekure * 74},${mekure * -10}
                    Q ${186 + mekure * 30},${-mekure * 62} ${186 - mekure * 24},${-mekure * 96 + 4}
                    L ${186 - mekure * 40},${200 - mekure * 70}
                    Q ${186 + mekure * 24},${200 - mekure * 24} ${186 - mekure * 86},${200 + mekure * 8} Z`}
                fill={WP.kinariDim}
                stroke={WP.line}
                strokeWidth={3}
                opacity={mekure}
              />
              {/* まだ読める部分。顔の上半分と、乾いていない糊の光 */}
              <g opacity={1 - mekure * 0.55}>
                <rect x={16} y={16} width={154} height={116} fill="#8E7A58" />
                <g transform="translate(93 92)">
                  <Kao10 r={34} dir={0.15} age="waka" sex="m" hige="buji" hair />
                  <path d="M -40,46 L -14,30 L 14,30 L 40,46 L 40,54 L -40,54 Z" fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.2} />
                </g>
                <text x={176} y={162} fontFamily={PERSIAN} fontSize={22} fill={WP.ink} textAnchor="end">
                  اكبر شريفى
                </text>
                <text x={176} y={188} fontFamily={PERSIAN} fontSize={19} fill={WP.sabi} textAnchor="end">
                  ۱۳۶۷/۴/۵
                </text>
              </g>
              {/* 濡れた糊の照り */}
              <path d="M 24,40 Q 90,66 160,34" stroke={WP.paperWhite} strokeWidth={6} fill="none" opacity={0.3} />
            </g>
          </g>
        </g>

        {/* ── 白いペイカンのセダン。角の立った三箱型 ── */}
        <g transform="translate(1546 742)">
          <ellipse cx={30} cy={160} rx={400} ry={30} fill={WP.natsuKage} opacity={0.45} />
          {/* 車体 */}
          <path d="M -380,150 L -384,54 Q -372,18 -300,10 L -244,-70 Q -224,-92 -150,-96 L 160,-96 Q 230,-92 252,-70 L 310,10 Q 388,20 396,56 L 392,150 Z" fill="url(#a10-kuruma)" stroke={WP.line} strokeWidth={4.4} />
          {/* 窓。角の立った四角。テヘランの日射で上辺に影 */}
          <path d="M -226,-6 L -180,-74 L -8,-74 L -8,-6 Z" fill="#6E8A96" stroke={WP.line} strokeWidth={3.4} />
          <path d="M 16,-74 L 148,-74 L 196,-6 L 16,-6 Z" fill="#6E8A96" stroke={WP.line} strokeWidth={3.4} />
          <path d="M -226,-6 L -180,-74 L -150,-74 L -196,-6 Z" fill={WP.paperWhite} opacity={0.3} />
          {/* ピラーとドアの合わせ目・取手 */}
          <path d="M 2,-78 L 2,60" stroke={WP.line} strokeWidth={4} />
          <path d="M -236,10 L -232,140" stroke={WP.line} strokeWidth={3} opacity={0.6} />
          <path d="M 208,8 L 212,140" stroke={WP.line} strokeWidth={3} opacity={0.6} />
          <rect x={-60} y={22} width={46} height={11} rx={4} fill={WP.steelLit} stroke={WP.line} strokeWidth={2.4} />
          <rect x={112} y={22} width={46} height={11} rx={4} fill={WP.steelLit} stroke={WP.line} strokeWidth={2.4} />
          {/* クロームの帯とバンパー */}
          <rect x={-384} y={92} width={776} height={9} fill={WP.steelLit} opacity={0.8} />
          <rect x={-398} y={116} width={116} height={22} rx={5} fill={WP.steelLit} stroke={WP.line} strokeWidth={2.6} />
          {/* 角張ったテールランプと給油口 */}
          <rect x={-380} y={44} width={34} height={40} fill={WP.iranRed} stroke={WP.line} strokeWidth={2.6} />
          <rect x={-380} y={44} width={34} height={13} fill={WP.neonYellow} stroke={WP.line} strokeWidth={2.2} />
          <circle cx={-300} cy={66} r={13} fill={WP.steelDark} stroke={WP.line} strokeWidth={2.4} />
          {/* 車輪。ホイールキャップ */}
          {[-246, 222].map((wx) => (
            <g key={wx}>
              <circle cx={wx} cy={150} r={66} fill="#1C1A18" stroke={WP.line} strokeWidth={4} />
              <circle cx={wx} cy={150} r={34} fill={WP.steel} stroke={WP.line} strokeWidth={3} />
              <circle cx={wx} cy={150} r={12} fill={WP.steelDark} />
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1={wx} y1={150} x2={wx + Math.cos((i / 8) * Math.PI * 2) * 32} y2={150 + Math.sin((i / 8) * Math.PI * 2) * 32} stroke={WP.steelDark} strokeWidth={2.4} />
              ))}
            </g>
          ))}
          {/* 砂埃をかぶった下半分 */}
          <path d="M -384,104 L 392,104 L 392,150 L -380,150 Z" fill={WP.sunaBokori} opacity={0.32} />
          {/* 後ろ窓に貼ったチューリップの小さなステッカー */}
          <path d="M 60,-58 q -9,-14 0,-20 q 9,6 0,20 Z" fill={WP.iranRed} opacity={0.9} />
        </g>

        {/* ── 歩道と、街路の水路 (ジュー) ── */}
        <rect x={-200} y={892} width={W + 400} height={90} fill={WP.concrete} />
        {Array.from({ length: 26 }, (_, i) => (
          <line key={i} x1={-200 + i * 92} y1={892} x2={-210 + i * 92} y2={982} stroke={WP.concreteDark} strokeWidth={3} opacity={0.5} />
        ))}
        {/* 縁石 */}
        <rect x={-200} y={974} width={W + 400} height={24} fill={WP.ishigaki} stroke={WP.line} strokeWidth={3} />
        {/* ジュー。石で畳んだ溝を水が流れる */}
        <rect x={-200} y={998} width={W + 400} height={56} fill="#4E4A42" />
        <rect x={-200} y={1008} width={W + 400} height={40} fill={WP.juiMizu} />
        {/* 水面の光。流れているので筋が横に走る */}
        {Array.from({ length: 30 }, (_, i) => (
          <rect
            key={i}
            x={-200 + ((i * 97 + f * 7) % (W + 400))}
            y={1014 + ((i * 11) % 26)}
            width={38 + ((i * 7) % 40)}
            height={3.4}
            fill={WP.paperWhite}
            opacity={0.3}
          />
        ))}
        <rect x={-200} y={1048} width={W + 400} height={32} fill={WP.asphalt} />
        {/* 水路に落ちた葉と、沈んだ小石 */}
        <ellipse cx={420} cy={1032} rx={20} ry={8} fill={WP.leaf} opacity={0.7} transform="rotate(-18 420 1032)" />
        {[260, 640, 980, 1320, 1700].map((sx, i) => (
          <ellipse key={sx} cx={sx} cy={1040 + (i % 3) * 5} rx={10 + (i % 3) * 4} ry={5} fill={WP.ishigaki} opacity={0.6} />
        ))}

        {/* ===== 人 ===== */}

        {/* (1) 襟なしシャツ (ボタンを上まで留める) と無精髭の男性。チャイハーネの戸口 */}
        <g transform="translate(386 962)">
          <ellipse cx={0} cy={6} rx={72} ry={14} fill={WP.natsuKage} opacity={0.42} />
          {/* 濃いグレーのスラックスとサンダル */}
          <path d="M -46,0 L -6,0 L -8,-150 L -44,-150 Z" fill="#4A4A4E" stroke={WP.line} strokeWidth={3} />
          <path d="M 8,0 L 48,0 L 46,-150 L 10,-150 Z" fill="#4A4A4E" stroke={WP.line} strokeWidth={3} />
          <path d="M -52,0 L -2,0 L 0,14 L -54,14 Z" fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
          <path d="M 6,0 L 54,0 L 56,14 L 4,14 Z" fill={WP.woodDark} stroke={WP.line} strokeWidth={2.6} />
          {/* 襟なしシャツ。裾を出して着る */}
          <path d="M -58,-140 L -64,-316 Q -58,-356 -24,-364 L 24,-364 Q 58,-356 64,-316 L 58,-140 Z" fill="#C6C2B2" stroke={WP.line} strokeWidth={3.4} />
          <path d="M 20,-364 Q 58,-356 64,-316 L 58,-140 L 32,-140 Z" fill={WP.kappogiShade} opacity={0.6} />
          {/* 立ち上がりの衿。ボタンを上まで留めている (革命後の作法でネクタイはしない) */}
          <path d="M -24,-364 Q 0,-376 24,-364 L 22,-384 Q 0,-394 -22,-384 Z" fill="#C6C2B2" stroke={WP.line} strokeWidth={3} />
          {[-336, -300, -264, -228, -192].map((by) => (
            <circle key={by} cx={0} cy={by} r={4.6} fill={WP.kinariDim} stroke={WP.line} strokeWidth={2} />
          ))}
          <line x1={0} y1={-360} x2={0} y2={-150} stroke={WP.line} strokeWidth={2.6} opacity={0.5} />
          {/* 腕。片手にエステカンを持ち、もう片手は腰 */}
          <path d="M -62,-322 Q -92,-296 -90,-234 L -72,-196 L -44,-210 L -52,-246 Z" fill="#C6C2B2" stroke={WP.line} strokeWidth={3} />
          <ellipse cx={-62} cy={-184} rx={19} ry={23} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <path d="M 62,-322 Q 92,-300 86,-250 L 48,-214 L 32,-240 L 60,-266 Z" fill="#C6C2B2" stroke={WP.line} strokeWidth={3} />
          <ellipse cx={40} cy={-204} rx={19} ry={23} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <path d="M 32,-212 L 36,-236 L 52,-236 L 48,-212 Z" fill={WP.chai} stroke={WP.line} strokeWidth={2.2} />
          {/* 首と顔。壁のほうを見ている */}
          <path d="M -19,-364 L 19,-364 L 18,-396 L -18,-396 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <g transform="translate(0 -442) rotate(8)">
            <Kao10 r={38} dir={0.5} age="chu" sex="m" hige="buji" mouth={0} hair />
          </g>
        </g>

        {/* (2) 黒いチャードルの中年女性。半円の一枚布。顎の下を手で押さえる */}
        <g transform="translate(788 988)">
          <ellipse cx={0} cy={6} rx={78} ry={15} fill={WP.natsuKage} opacity={0.42} />
          {/* 布の裾から覗く靴 */}
          <path d="M -40,-6 L 2,-6 L 4,10 L -42,10 Z" fill="#2A2622" stroke={WP.line} strokeWidth={2.4} />
          {/* チャードル。縫い目もボタンも無い一枚布。頭から足まで一続き */}
          <path
            d={`M -84,0 Q -98,-220 -62,-352 Q -34,-416 0,-418 Q 34,-416 62,-352 Q 98,-220 84,0 Z`}
            fill={WP.chador}
            stroke={WP.line}
            strokeWidth={3.6}
          />
          {/* 折り目。黒を潰さないために明るい面を入れる */}
          <path d="M -40,-6 Q -56,-200 -40,-352" stroke={WP.chadorLit} strokeWidth={7} fill="none" opacity={0.75} />
          <path d="M 30,-6 Q 50,-210 36,-350" stroke={WP.chadorLit} strokeWidth={6} fill="none" opacity={0.6} />
          <path d="M 58,-346 Q 86,-210 80,-10 L 56,-10 Q 64,-200 44,-342 Z" fill={WP.chadorLit} opacity={0.4} />
          {/* 布の裾のうねり。風で少し動く */}
          <path d={`M -84,0 Q -40,${-10 + kaze * 2} 0,-2 Q 44,${-12 - kaze * 2} 84,0 L 84,8 L -84,8 Z`} fill={WP.chador} stroke={WP.line} strokeWidth={3} />
          {/* 顎の下を押さえる手。チャードルを着るときの要の所作 */}
          <ellipse cx={-10} cy={-308} rx={24} ry={20} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-28 + i * 13},-318 q 6,16 -2,24`} stroke={WP.skinShade} strokeWidth={2.6} fill="none" opacity={0.5} />
          ))}
          {/* 顔。布の縁で囲われた楕円の中だけが出る */}
          <g transform="translate(2 -368)">
            <Kao10 r={36} dir={0.2} up={-0.2} age="chu" sex="f" hair={false} mouth={0.14} />
          </g>
          {/* 布の縁。顔のまわりを楕円に囲む */}
          <path
            d="M 2,-414 Q -44,-408 -40,-362 Q -38,-320 2,-318 L 2,-330 Q -26,-334 -28,-364 Q -30,-396 2,-402 Z"
            fill={WP.chador}
            stroke={WP.line}
            strokeWidth={3}
          />
          <path
            d="M 2,-414 Q 48,-408 44,-362 Q 42,-320 2,-318 L 2,-330 Q 30,-334 32,-364 Q 34,-396 2,-402 Z"
            fill={WP.chador}
            stroke={WP.line}
            strokeWidth={3}
          />
          <path d="M -34,-392 Q 2,-408 38,-392" stroke={WP.chadorLit} strokeWidth={5} fill="none" opacity={0.6} />
          {/* 布の中から下げた買い物の袋 */}
          <path d="M 70,-240 L 112,-240 L 122,-140 L 60,-140 Z" fill={WP.cloth} stroke={WP.line} strokeWidth={2.8} />
          <path d="M 76,-240 q 14,-30 30,0" stroke={WP.cloth} strokeWidth={6} fill="none" />
          <path d="M 80,-152 q 20,-14 36,-2" stroke={WP.leaf} strokeWidth={9} fill="none" opacity={0.8} />
        </g>

        {/* (3) 戦死者の母らしい老女。新しい一枚に手を伸ばす */}
        <g transform="translate(1208 944)">
          <ellipse cx={0} cy={6} rx={68} ry={13} fill={WP.natsuKage} opacity={0.4} />
          {/* 暗色のマントーと、肩に落ちたルーサリー */}
          <path d="M -40,-6 L 0,-6 L 2,10 L -42,10 Z" fill="#2A2622" stroke={WP.line} strokeWidth={2.4} />
          <path d="M 10,-6 L 48,-6 L 50,10 L 8,10 Z" fill="#2A2622" stroke={WP.line} strokeWidth={2.4} />
          <path d="M -54,-10 L -60,-166 L 56,-166 L 50,-10 Z" fill="#3A3640" stroke={WP.line} strokeWidth={3} />
          <path d="M -64,-160 L -70,-316 Q -62,-352 -24,-360 L 24,-360 Q 62,-352 70,-316 L 64,-160 Z" fill={WP.manto} stroke={WP.line} strokeWidth={3.4} />
          <path d="M 20,-360 Q 62,-352 70,-316 L 64,-160 L 36,-160 Z" fill="#332E3A" opacity={0.7} />
          {/* 前の合わせとボタン */}
          <line x1={-2} y1={-356} x2={-2} y2={-164} stroke={WP.line} strokeWidth={3} opacity={0.6} />
          {[-320, -272, -224].map((by) => (
            <circle key={by} cx={-2} cy={by} r={5} fill="#262230" stroke={WP.line} strokeWidth={2} />
          ))}
          {/* ★伸ばした腕。めくれた一枚に向かう */}
          <path
            d={`M 64,-330 Q ${100 + te * 26},${-352 - te * 36} ${118 + te * 46},${-402 - te * 76} L ${142 + te * 50},${-382 - te * 76} L ${86},${-306} Z`}
            fill={WP.manto}
            stroke={WP.line}
            strokeWidth={3}
          />
          <g transform={`translate(${132 + te * 50} ${-398 - te * 80}) rotate(${-34 - te * 16})`}>
            <ellipse cx={0} cy={0} rx={18} ry={23} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M ${-14 + i * 9},-20 q 4,-18 -2,-28`} stroke={WP.skin} strokeWidth={8} fill="none" strokeLinecap="round" />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <path key={`s${i}`} d={`M ${-14 + i * 9},-22 q 4,-16 -2,-24`} stroke={WP.skinShade} strokeWidth={2} fill="none" opacity={0.45} />
            ))}
          </g>
          {/* もう片手は胸に当てている */}
          <path d="M -66,-328 Q -96,-304 -90,-252 L -50,-226 L -36,-252 L -62,-276 Z" fill={WP.manto} stroke={WP.line} strokeWidth={3} />
          <ellipse cx={-42} cy={-220} rx={18} ry={22} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {/* 首と顔。見上げて涙 */}
          <path d="M -17,-360 L 17,-360 L 16,-388 L -16,-388 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <g transform="translate(2 -432) rotate(-10)">
            <Kao10 r={38} dir={0.35} up={1} age="rou" sex="f" tear={te} mouth={0.26} hair={false} />
          </g>
          {/* 頭にきちんと結んだ黒いルーサリー。顔の輪郭を残して覆う */}
          <path
            d={`M -44,-434 Q -52,-486 2,-492 Q 56,-486 48,-434 Q 56,-396 36,-376 L 24,-392 Q 40,-412 34,-440 Q 30,-472 0,-474 Q -30,-472 -36,-440 Q -42,-412 -26,-392 L -38,-374 Q -54,-396 -44,-434 Z`}
            fill="#24222A"
            stroke={WP.line}
            strokeWidth={3}
          />
          <path d="M -34,-470 Q 2,-484 38,-468" stroke="#3E3A46" strokeWidth={6} fill="none" opacity={0.8} />
          <path d="M -40,-388 Q -56,-330 -46,-268 L -18,-278 Q -28,-336 -20,-384 Z" fill="#24222A" stroke={WP.line} strokeWidth={3} />
        </g>

        {/* (4) サンダルの少年。水路を飛び越す */}
        <g transform={`translate(${556 + tobu * 92} ${1052 - Math.sin(tobu * Math.PI) * 70})`}>
          <ellipse cx={0} cy={18 + Math.sin(tobu * Math.PI) * 70} rx={56} ry={11} fill={WP.natsuKage} opacity={0.38} />
          {/* 短い半ズボンと、踵の出たサンダル */}
          <path d={`M -42,${-4 + tobu * 10} L -6,0 L -10,-104 L -44,-104 Z`} fill="#4E5A6E" stroke={WP.line} strokeWidth={3} />
          <path d={`M 10,${-28 - tobu * 26} L 48,${-44 - tobu * 30} L 42,-120 L 8,-112 Z`} fill="#4E5A6E" stroke={WP.line} strokeWidth={3} />
          <path d={`M -50,${-2 + tobu * 10} L -4,${2 + tobu * 10} L -2,${16 + tobu * 10} L -52,${12 + tobu * 10} Z`} fill={WP.rust} stroke={WP.line} strokeWidth={2.6} />
          <path d={`M -46,${-6 + tobu * 10} L -10,${-2 + tobu * 10}`} stroke={WP.rust} strokeWidth={6} />
          <path d={`M 14,${-26 - tobu * 26} L 54,${-42 - tobu * 30} L 58,${-28 - tobu * 30} L 18,${-12 - tobu * 26} Z`} fill={WP.rust} stroke={WP.line} strokeWidth={2.6} />
          {/* Tシャツ。胸に色褪せた印 */}
          <path d="M -48,-98 L -52,-232 Q -46,-266 -20,-272 L 20,-272 Q 46,-266 52,-232 L 48,-98 Z" fill="#C8D2C4" stroke={WP.line} strokeWidth={3.4} />
          <path d="M 16,-272 Q 46,-266 52,-232 L 48,-98 L 26,-98 Z" fill={WP.kappogiShade} opacity={0.55} />
          <rect x={-20} y={-212} width={40} height={30} rx={4} fill={WP.iranGreen} opacity={0.5} />
          {/* 腕。片手を振り上げる */}
          <path d={`M -50,-238 Q -78,-252 -88,-296 L -70,-312 L -46,-274 Z`} fill="#C8D2C4" stroke={WP.line} strokeWidth={3} />
          <ellipse cx={-84} cy={-310} rx={16} ry={19} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <path d="M 50,-238 Q 80,-222 86,-186 L 66,-172 L 44,-208 Z" fill="#C8D2C4" stroke={WP.line} strokeWidth={3} />
          <ellipse cx={80} cy={-168} rx={16} ry={19} fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          {/* 手に持った薄い新聞紙 */}
          <path d={`M 88,-182 L 146,${-196 + kaze * 3} L 152,-156 L 94,-150 Z`} fill={WP.paperWhite} stroke={WP.line} strokeWidth={2.6} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={98} y1={-182 + i * 11} x2={144} y2={-186 + i * 11} stroke={WP.ink} strokeWidth={2} opacity={0.4} />
          ))}
          {/* 首と顔。口を開けて笑っている */}
          <path d="M -15,-272 L 15,-272 L 14,-296 L -14,-296 Z" fill={WP.skin} stroke={WP.line} strokeWidth={2.6} />
          <g transform="translate(0 -336) rotate(-12)">
            <Kao10 r={34} dir={-0.3} up={0.5} age="ko" sex="m" mouth={0.7} hair />
          </g>
        </g>

        {/* ── 砂埃。画面全体に膜を張らず、粒と低い帯で置く ── */}
        {Array.from({ length: 42 }, (_, i) => {
          const px = (i * 211 + f * (2 + (i % 4))) % (W + 400) - 200;
          const py = 560 + ((i * 97) % 480);
          return <circle key={i} cx={px} cy={py + Math.sin((f + i * 9) / 17) * 7} r={1.8 + ((i * 5) % 4) * 1.1} fill={WP.sunaBokori} opacity={0.3 + ((i * 7) % 3) * 0.1} />;
        })}
        {/* 足元で舞う砂。少年が飛んだ跡 */}
        <g opacity={0.5 * tobu}>
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={520 - i * 26} cy={1046 - i * 6} rx={22 + i * 9} ry={7 + i * 2} fill={WP.sunaBokori} opacity={0.5 - i * 0.08} />
          ))}
        </g>
        {/* 通りの奥に溜まった砂埃。低い帯だけ */}
        <rect x={-200} y={820} width={W + 400} height={74} fill={WP.sunaBokori} opacity={0.2} />
      </Cam>
      <YearTag year="一九八八" place="イラン" f={f} x={128} y={126} />
    </WarmStage>
  );
};

export const GROUP_A: Record<string, SekaiArt> = {
  sekai_01: S01,
  sekai_02: S02,
  sekai_03: S03,
  sekai_04: S04,
  sekai_05: S05,
  sekai_06: S06,
  sekai_07: S07,
  sekai_08: S08,
  sekai_09: S09,
  sekai_10: S10,
};
