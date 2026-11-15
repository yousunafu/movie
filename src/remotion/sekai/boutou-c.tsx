// つながる世界史・冒頭3分 / 担当C = 文#21〜#30
//
// 約束 (ここを外すと全部やり直しになる):
//  1. 1つの関数が1文ぶんの絵。<svg viewBox="0 0 1920 1080"> の中身だけを返す (SekaiArt)。
//     div / AbsoluteFill は使わない。字幕帯と通知カードは外側の枠が足す。
//  2. 背景は必ず敷く。ColdStage で画面を埋める。素のクリーム地＋方眼は0枚 (第16条)。
//  3. 主役は短辺の半分 (540px) 以上。小さい物を画面の真ん中にポツンと置くのが最悪の失敗。
//  4. ★2026-11-09 改定。人は具体的に描く。無貌の黒いシルエットも、逆光で真っ黒に
//     潰すのも禁止 (作者が名指しで却下した一番の原因)。庶民には目・眉・鼻・口・耳を
//     描き、群衆には老若男女と年齢を混ぜ、服は立場ごとに変える。
//     実在の人物は「所作と装い」で見せ、似顔絵にはしない。見せたくない顔は
//     うつむき・横顔・後ろ姿・見切れ、といった構図の都合で隠す。黒く塗らない。
//  5. 必ず f で動く。出しっぱなしの静止画は作らない。
//  6. 色はまず world.tsx の WP (物の色の台帳) から取る。台帳に無い色は
//     このファイルの先頭の C / C21..C30 に足す。world.tsx は4人で共有なので書き換えない。
//  7. uid は関数ごとに別の文字列にする。defs の id がぶつかると他の絵が壊れる。
//  8. 紙目・かすれ・線の揺れは SekaiScenes.tsx の InkLayer が全部の絵に掛けている。
//     各絵に書き足さない。
//
// この担当は現代イラン (#21) → 1701年の江戸 (#22) → 現代日本 (#23〜#30) をまたぐ。
// 混ぜない。物と服と光を時代ごとに切り替える。
//
// ★2026-11-09 色の改修 (docs/briefs/sekai-color.md)
// 作者指摘「ちゃんと写真に撮ったように、適切なものに適切な色を入れろ」。
// 画面全体に色フィルタを掛けるのは却下。物ごとに本当の色を塗る。
//   #21     現代イランの会場 (蛍光灯の青白・深緑の垂れ幕)
//   #22     雪の夜 (紺と白と橙の3色だけ)
//   #23-#28 資料を見る顔 (卓上灯で紙を主役にする)
//   #29-#30 報道の顔 (#29で青白へ渡し、#30で暗い報道の青に入る)

import React from "react";
import { SKP, SEKAI_SERIF, SEKAI_FONT, YearTag, Cam, seg, easeOut, W, H } from "./parts";
import { WP, type SekaiArt } from "./world";

// 絵の部品ではなく「ばらつきの種」。雪粒や読めない粒の長さを毎回同じに決めるためだけに使う。
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// 顔の穴を開けるための楕円パス。fillRule="evenodd" と組んで、布に顔の穴を空ける。
const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx},${cy - ry} C ${cx + rx * 0.92},${cy - ry} ${cx + rx},${cy + ry * 0.55} ${cx},${cy + ry}` +
  ` C ${cx - rx},${cy + ry * 0.55} ${cx - rx * 0.92},${cy - ry} ${cx},${cy - ry} Z`;

// ===================================================================
// 担当Cだけで使う色 (WP の台帳に無いもの)
// ===================================================================
// world.tsx は共有なので足さない。ここに置く。
// 守る約束: ①光源の色は1場面に1つ ②影は黒にせず光の反対側へ寄せる
//          ③一番言いたい物にいちばん強い色を置く
const C = {
  hallBg: "#17222C",
  coldLit: "#BFD4E2", // 青白い一灯

  // ── #23 / #24 / #26 / #27 / #28 明るい机の上 (資料を見る顔)
  deskAir: "#30343A", // 奥の空気。茶ではなく中立の灰
  deskLit: "#FFF4E2", // 卓上灯の光
  deskVig: "#14171C",
  paperHi: "#FDFCF8", // 紙の光が当たる側
  paperLow: "#D7D3C8", // 紙の影側
  paperEdge: "#B7B2A6",
  gyo: "#6B6B66", // 読めない横文字の灰
  ruleLine: "#C2BEB2", // 紙の罫

  // ── #25 紺の地球
  spaceBg: "#070C1C",
  spaceVig: "#03050E",
  earthHi: "#1E3463",
  earthMid: "#112044",
  earthLow: "#070D20",
  airBlue: "#2E6FA8",

  // ── #29 ここで青白へ渡す
  glassLit: "#CFE2F2",
  frameLit: "#66788A",
  frameDark: "#2E3A46",

  // ── #30 報道の青
  newsBg: "#12243A",
  newsLit: "#6FA8D0",
  newsVig: "#06101C",
  newsRule: "#55636E",
} as const;

// ── #21 現代イランの会場 ───────────────────────────────────────────
// テヘランは標高1200mの大都市。室内は蛍光灯の青白い光。
// 女性の装いは2026年時点で4類型が混在する (素頭 / 落ちたルーサリー / きちんと結んだ
// ルーサリー / 黒チャードル)。学校と役所の中だけマグナエが残る。ここは公的な会場なので
// マグナエの若い職員と、黒チャードルの老女が同じ列に並ぶ。
const C21 = {
  wall: "#223240", // 塗り壁
  wallLow: "#1A2730", // 腰壁
  floor: "#2E3A42", // 床のタイル
  floorAlt: "#39454E",
  floorLine: "#4C5C68",
  tube: "#DDEBF5", // 天井の蛍光灯
  tubeCase: "#3C4852",
  banner: "#12402C", // ペルシア語の垂れ幕 (深緑)
  bannerEdge: "#0B2A1C",
  bannerText: "#E8F2E6",
  wood: "#6A4A2C", // 木の演台
  woodLit: "#8C6539",
  woodDark: "#402B17",
  micStem: "#2A3036", // 現代の細いマイク (1988年式の丸い網ではない)
  micMesh: "#525C63",
  lampRed: "#E0331F", // 録音中の赤いランプ
  pipe: "#8A949C", // パイプ椅子の脚
  seat: "#2B3B4A",
  tripod: "#22272C",
  camBody: "#191D21",
  flagGreen: "#239F40", // イラン国旗
  flagWhite: "#F2F2EE",
  flagRed: "#DA0000",
  hada: "#C89B70", // 肌
  hadaKage: "#966B47",
  hadaLit: "#E2BB90",
  chador: "#15161A", // 黒チャードル (半円の一枚布・縫い目もボタンも無い)
  chadorLit: "#2D2F37",
  maghnae: "#232A3A", // マグナエ (かぶるだけの一体型フード)
  maghnaeLit: "#39435B",
  mantou: "#3A4350",
  shirt: "#C7CCD1", // 襟を開けたシャツ (ネクタイは付けない)
  shirtShade: "#98A0A7",
  jacket: "#2C3440", // 濃紺の上着
  tee: "#2A3038",
  phoneGlow: "#9FD8F0",
  kami: "#1C1A18", // 髪
  kamiShiro: "#CFCFC8", // 白髪
} as const;

// ── #22 1701年12月 (元禄十五年師走) 雪の夜 ───────────────────────────
// 史実は「火事装束を真似た黒系の小袖・股引で不統一、袖に白い晒を縫い付けて味方の目印」。
// 芝居の揃いの装束は後世の演出なので描かない。雪は前日までに積もっていた状態で、
// 降らせずに積もらせる。裏門は「かけや」で打ち破った。山鹿流陣太鼓は一次記録に無い。
const C22 = {
  sky0: "#070D1F",
  sky1: "#15224C",
  yuki: "#F2F5F8",
  yukiKage: "#B7C8D8",
  yukiFuka: "#7E96AE", // 踏み跡の底
  kawara: "#232A36", // 瓦
  shitami: "#141821", // 黒い下見板
  namako: "#2A3140", // 海鼠壁の漆喰
  namakoLine: "#4C5666",
  hashira: "#1B2029", // 門の柱
  kabuki: "#121722", // 冠木
  koushiOku: "#0B0F15", // 格子窓の奥
  koushiKi: "#3A3326", // 格子の木
  kuro: "#1A1A1A", // 黒小袖
  kuroLit: "#32333B",
  sarashi: "#E8E6DC", // 袖に縫い付けた白い晒
  nafuda: "#EFEADA", // 右肩の名札
  kusari: "#6E7A84", // 鎖帷子
  take: "#8A7A46", // 竹梯子
  takeLit: "#B6A463",
  tsuchi: "#4A3A28", // かけやの柄
  tetsu: "#5A646E", // かすがい・槍の穂
  hi: "#E8C679", // 提灯の火袋に透ける火
  hiDim: "#8A6B33",
  honoo: "#FFCF72",
  iki: "#DCE8F2", // 息の白さ
  matsu: "#16291F", // 奥の松原
} as const;

// ===================================================================
// ColdStage — WarmStage (world.tsx) の骨そのまま、色だけ差し替えられる版
// ===================================================================
// 背景 → 光源 → 中身 → 光の帯 → 埃 → 周辺減光、という順も数値も WarmStage と同じ。
// 違うのは「周辺減光の色」「埃の色」「defs を外から渡せる」の3つだけ。
// WarmStage は4人で共有していて書き換えられないので、担当Cはこちらを使う。
const shaftC = (sx: number, sy: number, top: number, lean: number, spread: number) =>
  `M ${sx - top},${sy} L ${sx + top},${sy}
   L ${sx + lean + spread},${H} L ${sx + lean - spread},${H} Z`;

const ColdStage: React.FC<{
  f: number;
  uid: string;
  src?: [number, number];
  srcR?: number;
  glow?: string;
  bg?: string;
  /** 周辺減光の色。夜なら紺、机の上なら中立の灰 */
  vigColor?: string;
  /** 埃の色 */
  mote?: string;
  shafts?: boolean;
  motes?: number;
  vig?: number;
  /** bg に url(#...) を渡したいときのグラデ定義 */
  defs?: React.ReactNode;
  children: React.ReactNode;
}> = ({
  f,
  uid,
  src = [960, 180],
  srcR = 760,
  glow = C.coldLit,
  bg = C.hallBg,
  vigColor = "#091019",
  mote = "#DCEAF5",
  shafts = true,
  motes = 30,
  vig = 0.8,
  defs,
  children,
}) => {
  const up = easeOut(seg(f, 0, 26));
  const [sx, sy] = src;
  return (
    <>
      <defs>
        {defs}
        <radialGradient id={`${uid}-src`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity={0.5} />
          <stop offset="46%" stopColor={glow} stopOpacity={0.18} />
          <stop offset="100%" stopColor={glow} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-vig`} cx="50%" cy="42%" r="74%">
          <stop offset="50%" stopColor={vigColor} stopOpacity={0} />
          <stop offset="100%" stopColor={vigColor} stopOpacity={vig} />
        </radialGradient>
      </defs>
      <rect x={-200} y={0} width={W + 400} height={H} fill={bg} />
      <circle cx={sx} cy={sy} r={srcR} fill={`url(#${uid}-src)`} opacity={up} />
      {children}
      {shafts && (
        <g opacity={easeOut(seg(f, 6, 46))}>
          <path d={shaftC(sx - 300, sy, 190, -320, 430)} fill={glow} opacity={0.15} />
          <path d={shaftC(sx + 300, sy, 180, 380, 420)} fill={glow} opacity={0.13} />
          <path d={shaftC(sx, sy, 90, -60, 160)} fill={glow} opacity={0.09} />
        </g>
      )}
      {motes > 0 && (
        <g opacity={easeOut(seg(f, 14, 60)) * 0.42}>
          {Array.from({ length: motes }, (_, i) => {
            const px = 160 + ((i * 251) % 1600);
            const py = 140 + ((i * 437 + f * 0.7) % 860);
            return <circle key={i} cx={px} cy={py} r={i % 3 === 0 ? 3.2 : 2} fill={mote} />;
          })}
        </g>
      )}
      <rect x={-200} y={0} width={W + 400} height={H} fill={`url(#${uid}-vig)`} />
    </>
  );
};

// ===================================================================
// #21 山 今のイランに、毒杯を飲むと言える「声」はあるのか。
// 空の演壇を、客席側から肩越しに見る。手前の客の顔が見える角度まで振ってある。
// 事件: マイクの前に誰も立たないまま、赤いランプだけが点く。
// ===================================================================

// 読めないペルシア語。右から左へ、繋がる基線の上下に点を散らす。
// 文字として読ませない。けれど「アラビア語ではなくペルシア語の紙面」に見せる。
const Pers21: React.FC<{
  x: number;
  y: number;
  w: number;
  size: number;
  seed: number;
  fill: string;
  t?: number;
}> = ({ x, y, w, size, seed, fill, t = 1 }) => {
  const n = Math.max(2, Math.round(w / (size * 1.9)));
  const shown = Math.round(n * Math.min(Math.max(t, 0), 1));
  const words: React.ReactNode[] = [];
  let cx = x + w;
  for (let i = 0; i < shown; i++) {
    const r1 = hash(seed + i * 1.7);
    const r2 = hash(seed + i * 3.3 + 7);
    const wd = size * (1.1 + r1 * 1.0);
    cx -= wd + size * 0.5;
    words.push(
      <g key={i}>
        <path
          d={`M ${cx},${y} q ${wd * 0.26},${-size * 0.6} ${wd * 0.52},${-size * 0.04}
              q ${wd * 0.18},${size * 0.26} ${wd * 0.46},${-size * 0.14}`}
          fill="none"
          stroke={fill}
          strokeWidth={size * 0.17}
          strokeLinecap="round"
        />
        {r2 > 0.54 && <circle cx={cx + wd * 0.5} cy={y - size * 0.86} r={size * 0.1} fill={fill} />}
        {r2 <= 0.54 && r1 > 0.36 && (
          <circle cx={cx + wd * 0.44} cy={y + size * 0.4} r={size * 0.1} fill={fill} />
        )}
        {r2 > 0.82 && (
          <path
            d={`M ${cx + wd * 0.08},${y - size * 1.0} l ${size * 0.52},0`}
            stroke={fill}
            strokeWidth={size * 0.13}
            strokeLinecap="round"
          />
        )}
      </g>
    );
  }
  return (
    <g>
      <path d={`M ${x},${y} L ${x + w},${y}`} stroke={fill} strokeWidth={size * 0.09} opacity={0.42} />
      {words}
    </g>
  );
};

// 空のパイプ椅子。背もたれをこちら側に向けた列 = 誰も座っていないことの形。
const Isu21: React.FC<{ x: number; y: number; s: number; dim?: number }> = ({ x, y, s, dim = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - dim}>
    <ellipse cx={0} cy={6} rx={78} ry={11} fill="#0D141B" opacity={0.5} />
    <path d="M -58,0 L -44,-96 M 58,0 L 44,-96" stroke={C21.pipe} strokeWidth={7} strokeLinecap="round" />
    <path d="M -40,-96 L 40,-96 L 46,-104 L -46,-104 Z" fill={C21.pipe} opacity={0.85} />
    <path d="M -46,-104 L -40,-188 L 40,-188 L 46,-104 Z" fill={C21.seat} />
    <path d="M -40,-188 L 40,-188" stroke={C21.pipe} strokeWidth={6} strokeLinecap="round" />
    <path d="M -44,-108 L -38,-184 M 44,-108 L 38,-184" stroke={C21.pipe} strokeWidth={5} opacity={0.7} />
    <path d="M -58,0 L -20,-100 M 58,0 L 20,-100" stroke={C21.pipe} strokeWidth={5} opacity={0.45} />
  </g>
);

// 現代の細いマイク。首の長いグースネックを2本。1988年式の丸い網のマイクではない。
const Mic21: React.FC<{ x: number; y: number; s: number; lean: number }> = ({ x, y, s, lean }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`}>
    <ellipse cx={0} cy={0} rx={20} ry={7} fill={C21.micStem} />
    <path d="M 0,0 C 0,-54 -6,-86 -22,-116" fill="none" stroke={C21.micStem} strokeWidth={6} strokeLinecap="round" />
    <rect x={-32} y={-136} width={22} height={26} rx={10} fill={C21.micMesh} transform="rotate(-16 -22 -124)" />
    <path d="M -30,-132 l 18,5 M -31,-125 l 18,5 M -32,-118 l 18,5" stroke="#1A1E22" strokeWidth={1.6} opacity={0.8} />
  </g>
);

// 会場の客。老若男女を混ぜる。全員が空の演台を見ている。
// 顔は必ず描く。布にも肌にもちゃんと色を入れる。
const Kaijo21: React.FC<{
  x: number;
  y: number;
  /** 頭の高さ(px)。これで全体の大きさが決まる */
  hh: number;
  kind: "chador" | "maghnae" | "shirt" | "phone";
  /** +で右を向く。手前の客は演台のほうへ振ってある */
  turn: number;
  age: "rou" | "chu" | "waka";
  f: number;
  i: number;
}> = ({ x, y, hh, kind, turn, age, f, i }) => {
  const s = hh / 300;
  const d = turn >= 0 ? 1 : -1;
  const fx = turn * 1.0;
  const sway = Math.sin((f + i * 23) / 68) * 1.8; // 息
  const hada = kind === "phone" ? C21.hadaLit : C21.hada;
  const eNear = fx + 44 * d;
  const eFar = fx - 26 * d;
  const pup = 7 * d;

  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway * 0.2})`}>
      {/* ── 肩から下。布で立場を描き分ける ── */}
      {kind === "chador" && (
        <path
          d="M -176,-232 C -200,-96 -224,110 -252,480 L 268,480 C 240,110 216,-96 192,-232 Z"
          fill={C21.chador}
        />
      )}
      {kind === "maghnae" && (
        <>
          <path d="M -190,-120 C -216,30 -230,220 -244,480 L 254,480 C 240,220 226,30 200,-120 Z" fill={C21.mantou} />
          <path d="M -150,-150 C -170,-60 -176,0 -180,40 L 178,40 C 174,0 168,-60 148,-150 Z" fill={C21.maghnae} />
        </>
      )}
      {kind === "shirt" && (
        <>
          <path d="M -206,-104 C -230,40 -244,230 -256,480 L 266,480 C 254,230 240,40 216,-104 Z" fill={C21.jacket} />
          <path d="M -86,-96 L 0,70 L 86,-96 C 40,-128 -40,-128 -86,-96 Z" fill={C21.shirt} />
          <path d="M -86,-96 L -8,30 L -34,-104 Z" fill={C21.shirtShade} />
          <path d="M 86,-96 L 8,30 L 34,-104 Z" fill={C21.shirtShade} opacity={0.7} />
        </>
      )}
      {kind === "phone" && (
        <>
          <path d="M -188,-96 C -210,40 -222,230 -234,480 L 244,480 C 232,230 220,40 198,-96 Z" fill={C21.tee} />
          <path d="M -70,-104 C -40,-66 40,-66 70,-104" fill="none" stroke="#454C56" strokeWidth={9} />
          {/* 携帯を構える腕 */}
          <path
            d="M 168,-30 C 232,-80 268,-186 250,-268"
            fill="none"
            stroke={C21.tee}
            strokeWidth={62}
            strokeLinecap="round"
          />
          <path d="M 248,-262 C 268,-276 284,-272 288,-256" fill="none" stroke={hada} strokeWidth={40} strokeLinecap="round" />
          <rect x={222} y={-392} width={74} height={134} rx={9} fill="#14181D" transform="rotate(9 258 -324)" />
          <rect x={229} y={-384} width={60} height={118} rx={5} fill={C21.phoneGlow} opacity={0.82} transform="rotate(9 258 -324)" />
          <path d="M 240,-360 l 40,0 M 240,-340 l 32,0 M 240,-320 l 38,0" stroke="#2C4C60" strokeWidth={4} transform="rotate(9 258 -324)" />
        </>
      )}

      {/* ── 首 ── */}
      <path d={`M ${-40 + fx * 0.4},-30 L ${40 + fx * 0.4},-30 L ${44 + fx * 0.4},44 L ${-44 + fx * 0.4},44 Z`} fill={C21.hadaKage} />

      {/* ── 頭の地 (肌) ── */}
      <ellipse cx={fx} cy={-170} rx={112} ry={150} fill={hada} />
      <path d={oval(fx - 56 * d, -170, 58, 146)} fill={C21.hadaKage} opacity={0.5} />

      {/* ── かぶりもの / 髪。顔の穴を evenodd で空ける ── */}
      {kind === "chador" && (
        <>
          <path
            fillRule="evenodd"
            d={
              `M ${-168},-248 C ${-192},-394 ${192},-394 ${168},-248 ` +
              `C ${206},-120 ${214},-60 ${216},-232 L ${192},-232 ` +
              `C ${168},-120 ${150},-54 ${146},-24 L ${-146},-24 ` +
              `C ${-150},-54 ${-168},-120 ${-192},-232 L ${-216},-232 ` +
              `C ${-214},-60 ${-206},-120 ${-168},-248 Z ` +
              oval(fx + 8 * d, -174, 84, 118)
            }
            fill={C21.chador}
          />
          {/* 顎の下を手で押さえる。チャードルは留め具が無いので必ずこの所作になる */}
          <path d={`M ${fx + 30 * d},-30 c ${18 * d},-6 ${34 * d},4 ${36 * d},20 c ${-14 * d},14 ${-40 * d},12 ${-52 * d},0 Z`} fill={hada} />
          <path d={`M ${fx + 40 * d},-18 l ${22 * d},4 M ${fx + 38 * d},-8 l ${22 * d},3`} stroke={C21.hadaKage} strokeWidth={3} />
          <path d={`M ${-150},-300 C ${-120},-346 ${120},-346 ${150},-300`} fill="none" stroke={C21.chadorLit} strokeWidth={6} opacity={0.6} />
        </>
      )}
      {kind === "maghnae" && (
        <>
          <path
            fillRule="evenodd"
            d={
              `M ${-146},-214 C ${-166},-348 ${166},-348 ${146},-214 ` +
              `C ${140},-130 ${160},-56 ${178},40 L ${-178},40 ` +
              `C ${-160},-56 ${-140},-130 ${-146},-214 Z ` +
              oval(fx + 6 * d, -176, 80, 110)
            }
            fill={C21.maghnae}
          />
          <path d={`M ${-128},-274 C ${-100},-318 ${100},-318 ${128},-274`} fill="none" stroke={C21.maghnaeLit} strokeWidth={7} opacity={0.75} />
          <path d={`M ${-130},-20 C ${-60},10 ${60},10 ${130},-20`} fill="none" stroke={C21.maghnaeLit} strokeWidth={5} opacity={0.5} />
        </>
      )}
      {(kind === "shirt" || kind === "phone") && (
        <>
          <path
            d={`M ${-114},-196 C ${-116},-326 ${116},-326 ${114},-196 C ${100},-250 ${60},-276 ${fx},-272 C ${-50},-268 ${-96},-244 ${-114},-196 Z`}
            fill={age === "chu" ? "#33302C" : C21.kami}
          />
          {age === "chu" && (
            <path d={`M ${-112},-200 C ${-110},-242 ${-96},-262 ${-74},-272`} fill="none" stroke={C21.kamiShiro} strokeWidth={9} opacity={0.72} />
          )}
          {/* 耳 (布で隠れていない側) */}
          <ellipse cx={fx - 92 * d} cy={-168} rx={15} ry={26} fill={C21.hadaKage} />
          <ellipse cx={fx - 92 * d} cy={-168} rx={8} ry={16} fill={hada} opacity={0.6} />
        </>
      )}

      {/* ── 顔。目・眉・鼻・口。空の演台を見ている ── */}
      <g>
        <path d={`M ${eNear - 24},-216 q 24,-13 48,1`} fill="none" stroke="#2A2420" strokeWidth={7} strokeLinecap="round" />
        <path d={`M ${eFar - 17},-214 q 17,-11 34,1`} fill="none" stroke="#2A2420" strokeWidth={6} strokeLinecap="round" opacity={0.78} />
        <ellipse cx={eNear} cy={-180} rx={21} ry={13} fill="#F6F1E6" />
        <circle cx={eNear + pup} cy={-180} r={8.4} fill="#241C16" />
        <ellipse cx={eFar} cy={-178} rx={13} ry={11} fill="#F6F1E6" opacity={0.9} />
        <circle cx={eFar + pup * 0.6} cy={-178} r={6.6} fill="#241C16" />
        {age === "rou" && (
          <>
            <path d={`M ${eNear - 22},-162 q 22,10 44,-2`} fill="none" stroke={C21.hadaKage} strokeWidth={4} opacity={0.8} />
            <path d={`M ${fx + 74 * d},-150 q ${10 * d},34 ${-4 * d},62`} fill="none" stroke={C21.hadaKage} strokeWidth={4} opacity={0.6} />
          </>
        )}
        <path
          d={`M ${fx + 58 * d},-172 C ${fx + 72 * d},-150 ${fx + 70 * d},-128 ${fx + 54 * d},-122 l ${-18 * d},4`}
          fill="none"
          stroke={C21.hadaKage}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path
          d={
            kind === "phone"
              ? `M ${fx + 10 * d},-96 q ${22 * d},4 ${40 * d},-2 q ${-18 * d},22 ${-40 * d},16 Z`
              : `M ${fx + 10 * d},-96 q ${22 * d},8 ${42 * d},-4`
          }
          fill={kind === "phone" ? "#5A2D28" : "none"}
          stroke="#6E3A32"
          strokeWidth={5}
          strokeLinecap="round"
        />
        <path d={`M ${fx + 92 * d},-84 C ${fx + 76 * d},-34 ${fx + 36 * d},-12 ${fx},-14`} fill="none" stroke={C21.hadaKage} strokeWidth={5} opacity={0.65} />
      </g>
    </g>
  );
};

const S21: SekaiArt = ({ f }) => {
  const uid = "s21";
  const lamp = easeOut(seg(f, 44, 58)); // 事件: 赤いランプだけが点く
  const beat = 0.72 + Math.sin(f / 6.5) * 0.28;
  const bannerT = easeOut(seg(f, 4, 50));
  const HZ = 592; // 壁と床の境
  return (
    <Cam f={f} from={[0, 0, 1.05]} to={[-30, -14, 1.0]} start={0} end={100}>
      <ColdStage
        f={f}
        uid={uid}
        src={[1148, 250]}
        srcR={880}
        glow="#CFE2EE"
        bg={C21.wall}
        vigColor="#0A121A"
        mote="#D6E6F2"
        motes={14}
        vig={0.74}
        shafts={false}
      >
        {/* ── 壁と腰壁 ── */}
        <rect x={-200} y={0} width={W + 400} height={HZ} fill={C21.wall} />
        <rect x={-200} y={HZ - 92} width={W + 400} height={92} fill={C21.wallLow} />
        <rect x={-200} y={HZ - 96} width={W + 400} height={6} fill="#4A5868" opacity={0.8} />

        {/* ── 床のタイル。消点を演台のほうに置いた遠近 ── */}
        <rect x={-200} y={HZ} width={W + 400} height={H - HZ} fill={C21.floor} />
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const yy = HZ + 6 + (H - HZ) * t * t;
          return (
            <rect
              key={`fy${i}`}
              x={-200}
              y={yy}
              width={W + 400}
              height={3 + t * 5}
              fill={C21.floorLine}
              opacity={0.26}
            />
          );
        })}
        {Array.from({ length: 13 }, (_, i) => {
          const gx = -340 + i * 220;
          return (
            <path
              key={`fx${i}`}
              d={`M ${1148 + (gx - 1148) * 0.26},${HZ} L ${gx},${H}`}
              stroke={C21.floorLine}
              strokeWidth={3}
              opacity={0.2}
            />
          );
        })}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={`ft${i}`} x={-200 + i * 400} y={HZ + 150} width={190} height={60} fill={C21.floorAlt} opacity={0.3} />
        ))}

        {/* ── 天井の蛍光灯。3本、わずかに遠近をつける ── */}
        {[
          { y: 54, w: 1180, h: 20 },
          { y: 128, w: 980, h: 16 },
          { y: 192, w: 800, h: 13 },
        ].map((t, i) => (
          <g key={`tb${i}`} opacity={easeOut(seg(f, 0, 20))}>
            <rect x={1148 - t.w / 2} y={t.y - 9} width={t.w} height={t.h + 16} rx={5} fill={C21.tubeCase} />
            <rect x={1148 - t.w / 2 + 14} y={t.y} width={t.w - 28} height={t.h} rx={t.h / 2} fill={C21.tube} opacity={0.94} />
            <rect x={1148 - t.w / 2 + 14} y={t.y} width={t.w - 28} height={t.h} rx={t.h / 2} fill="#FFFFFF" opacity={0.3} />
          </g>
        ))}

        {/* ── 壁のイラン国旗。緑・白・赤。中央に赤いアッラーの意匠 ── */}
        <g transform="translate(1690 212)" opacity={easeOut(seg(f, 10, 36))}>
          <rect x={-8} y={-8} width={250} height={166} fill="#121A22" opacity={0.6} />
          <rect x={0} y={0} width={234} height={50} fill={C21.flagGreen} />
          <rect x={0} y={50} width={234} height={50} fill={C21.flagWhite} />
          <rect x={0} y={100} width={234} height={50} fill={C21.flagRed} />
          <path d="M 117,58 l 0,34 M 104,66 c -8,8 -2,22 13,22 c 15,0 21,-14 13,-22 M 95,70 l 0,18 M 139,70 l 0,18" stroke={C21.flagRed} strokeWidth={6} fill="none" strokeLinecap="round" />
          <Pers21 x={10} y={44} w={214} size={9} seed={21.5} fill={C21.flagWhite} t={1} />
          <Pers21 x={10} y={108} w={214} size={9} seed={22.5} fill={C21.flagWhite} t={1} />
        </g>

        {/* ── ペルシア語の垂れ幕。深緑の布に白の書 ── */}
        <g transform="translate(1148 258)" opacity={easeOut(seg(f, 2, 26))}>
          <path d="M -500,-6 L 500,-6 L 512,232 L -512,232 Z" fill={C21.banner} />
          <path d="M -500,-6 L 500,-6 L 504,20 L -504,20 Z" fill={C21.bannerEdge} />
          <path d="M -512,232 L 512,232 L 508,254 L -508,254 Z" fill={C21.bannerEdge} />
          <Pers21 x={-430} y={110} w={860} size={44} seed={3.2} fill={C21.bannerText} t={bannerT} />
          <Pers21 x={-300} y={186} w={600} size={26} seed={8.1} fill={C21.bannerText} t={bannerT * 0.9} />
        </g>

        {/* ── 記者の三脚とカメラ。左の中景 ── */}
        <g transform="translate(372 616) scale(1.08)">
          <path d="M 0,0 L -74,250 M 0,0 L 70,252 M 0,0 L 6,246" stroke={C22.tetsu} strokeWidth={11} strokeLinecap="round" />
          <path d="M -74,250 l -16,8 M 70,252 l 18,8 M 6,246 l 4,12" stroke={C21.tripod} strokeWidth={9} strokeLinecap="round" />
          <path d="M -50,150 L 46,152" stroke={C21.tripod} strokeWidth={7} opacity={0.7} />
          <rect x={-18} y={-26} width={36} height={32} rx={5} fill={C21.tripod} />
          <rect x={-76} y={-96} width={162} height={72} rx={8} fill={C21.camBody} />
          <rect x={-76} y={-96} width={162} height={14} rx={7} fill="#2E353C" />
          <circle cx={86} cy={-60} r={30} fill="#10141A" />
          <circle cx={86} cy={-60} r={21} fill={WP.glassBlue} opacity={0.85} />
          <circle cx={78} cy={-68} r={7} fill="#CFE6F4" opacity={0.8} />
          <rect x={-104} y={-84} width={30} height={46} rx={4} fill="#20262C" />
          <circle cx={-36} cy={-104} r={7} fill={C21.lampRed} opacity={0.35 + lamp * 0.65 * beat} />
          <path d="M -60,-30 L -58,10 L -44,10 L -46,-30 Z" fill="#1C2126" />
        </g>

        {/* ── 木の演台。誰も立っていない ── */}
        <g transform="translate(1148 596)">
          <ellipse cx={0} cy={6} rx={248} ry={20} fill="#0C1219" opacity={0.6} />
          <path d="M -196,0 L -168,-250 L 168,-250 L 196,0 Z" fill={C21.wood} />
          <path d="M -196,0 L -168,-250 L -96,-250 L -120,0 Z" fill={C21.woodDark} opacity={0.55} />
          <path d="M 96,-250 L 168,-250 L 196,0 L 124,0 Z" fill={C21.woodLit} opacity={0.4} />
          <path d="M -214,-250 L 214,-250 L 214,-282 L -214,-282 Z" fill={C21.woodLit} />
          <path d="M -214,-250 L 214,-250 L 214,-240 L -214,-240 Z" fill={C21.woodDark} />
          <path d="M -150,-230 L -128,-30 M -60,-234 L -52,-30 M 60,-234 L 52,-30 M 150,-230 L 128,-30" stroke={C21.woodDark} strokeWidth={4} opacity={0.5} />
          {/* 演台正面の紋章板 (無地の木。模様は作らない) */}
          <rect x={-78} y={-200} width={156} height={104} rx={6} fill={C21.woodDark} opacity={0.75} />
          <Pers21 x={-64} y={-150} w={128} size={17} seed={14.3} fill="#C9A86E" t={bannerT} />
          {/* 事件: マイクの前に誰も立たないまま、赤いランプだけが点く */}
          <g opacity={lamp}>
            <circle cx={128} cy={-266} r={28} fill={C21.lampRed} opacity={0.16 * beat} />
            <circle cx={128} cy={-266} r={11} fill={C21.lampRed} opacity={0.5 + 0.5 * beat} />
            <circle cx={124} cy={-270} r={4} fill="#FFD8CE" opacity={beat} />
          </g>
          <rect x={112} y={-282} width={32} height={14} rx={3} fill="#1B2026" />
        </g>
        <Mic21 x={1078} y={-282 + 596} s={1.0} lean={-6} />
        <Mic21 x={1200} y={-282 + 596} s={0.96} lean={9} />

        {/* ── 空のパイプ椅子の列。前から後ろへ3列 ── */}
        {[
          { y: 742, s: 0.5, n: 7, gap: 212, off: 0 },
          { y: 820, s: 0.62, n: 6, gap: 268, off: 110 },
          { y: 922, s: 0.78, n: 5, gap: 348, off: -60 },
        ].map((row, ri) =>
          Array.from({ length: row.n }, (_, i) => (
            <Isu21
              key={`is${ri}-${i}`}
              x={300 + row.off + i * row.gap}
              y={row.y}
              s={row.s}
              dim={0.26 - ri * 0.08}
            />
          ))
        )}

        {/* ── 手前の客。老若男女を混ぜ、全員が空の演台を見ている ── */}
        <Kaijo21 x={1620} y={1082} hh={272} kind="shirt" turn={-16} age="chu" f={f} i={1} />
        <Kaijo21 x={1232} y={1080} hh={214} kind="phone" turn={4} age="waka" f={f} i={2} />
        <Kaijo21 x={762} y={1084} hh={248} kind="maghnae" turn={14} age="waka" f={f} i={3} />
        <Kaijo21 x={332} y={1076} hh={302} kind="chador" turn={19} age="rou" f={f} i={4} />

        <YearTag year="二〇二六" place="イラン" f={f} />
      </ColdStage>
    </Cam>
  );
};

// ===================================================================
// #22 山 それとも始まるのは、主君を討たれた家臣たちの、忠臣蔵なのか。(全景可)
// 雪の夜。吉良邸の門の前を真横から。カメラは低く、積雪の高さ。
// 装束は史実寄り = 黒系で不統一・袖に白い晒の目印。揃いの山形文様は描かない。
// 雪は降らせない。積もらせる。山鹿流陣太鼓は一次記録に無いので出さない。
// 事件: 先頭の一人が提灯の火をふっと消す。
// ===================================================================

// 柄付きの手提げ提灯。和紙に墨の家紋。火袋の骨を描き、中の火を黄色く透かす。
const Chochin22: React.FC<{ x: number; y: number; s: number; lit: number; f: number }> = ({ x, y, s, lit, f }) => {
  const swing = Math.sin(f / 26) * 3.4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 柄 */}
      <path d="M 0,0 L -46,-96" stroke={C22.tsuchi} strokeWidth={9} strokeLinecap="round" />
      <path d="M -46,-96 L -30,-104" stroke={C22.tetsu} strokeWidth={6} strokeLinecap="round" />
      <g transform={`rotate(${swing} -30 -104)`}>
        <path d="M -30,-104 L -6,-126" stroke={C22.tetsu} strokeWidth={5} />
        {/* 火袋 */}
        <ellipse cx={0} cy={-186} rx={56} ry={16} fill={C22.hiDim} opacity={0.5 + lit * 0.5} />
        <path
          d="M -56,-186 C -62,-238 -56,-284 0,-288 C 56,-284 62,-238 56,-186 C 50,-146 -50,-146 -56,-186 Z"
          fill={C22.hi}
          opacity={0.22 + lit * 0.74}
        />
        {/* 火袋の骨 */}
        {[-166, -186, -206, -228, -250, -270].map((yy, i) => (
          <path
            key={i}
            d={`M -58,${yy} C -20,${yy - 7} 20,${yy - 7} 58,${yy}`}
            stroke="#8A6A34"
            strokeWidth={2.6}
            fill="none"
            opacity={0.5 + lit * 0.3}
          />
        ))}
        {/* 和紙に墨の家紋 */}
        <g opacity={0.5 + lit * 0.45}>
          <circle cx={0} cy={-216} r={26} fill="none" stroke="#1A1714" strokeWidth={5} />
          <path d="M 0,-238 L 0,-194 M -22,-216 L 22,-216" stroke="#1A1714" strokeWidth={5} />
        </g>
        {/* 中の火 */}
        <g opacity={lit}>
          <ellipse cx={0} cy={-208} rx={46} ry={62} fill={C22.honoo} opacity={0.3} />
          <path d="M 0,-180 C -9,-196 -5,-214 0,-228 C 6,-212 10,-196 0,-180 Z" fill={C22.honoo} />
        </g>
        <path d="M -6,-290 L 6,-290 L 6,-300 L -6,-300 Z" fill={C22.tetsu} />
      </g>
    </g>
  );
};

// 浪士。右を向いた横顔。頬被りの下から目と口が見える。
// 黒小袖は不統一 (濃淡を一人ずつ変える)。袖に白い晒、右肩に名札。
const Roshi22: React.FC<{
  x: number;
  y: number;
  /** 立ち高さ(px) */
  h: number;
  item: "kakeya" | "hashigo" | "yari" | "yumi" | "kasugai" | "none";
  age: "rou" | "chu" | "waka";
  /** 小袖の濃さのばらつき。不統一であることが史実 */
  tone: string;
  f: number;
  i: number;
  iki?: number;
}> = ({ x, y, h, item, age, tone, f, i, iki = 1 }) => {
  const s = h / 560;
  const br = Math.sin((f + i * 37) / 52); // 息と重心のゆれ
  const ikiT = (f + i * 41) % 110;
  const ikiA = ikiT < 46 ? Math.sin((ikiT / 46) * Math.PI) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* 雪に沈んだ足元の影 */}
      <ellipse cx={4} cy={0} rx={62} ry={13} fill={C22.yukiFuka} opacity={0.6} />

      {/* ── わらじ ── */}
      <path d="M -26,-6 l 40,0 l 4,10 l -48,0 Z" fill="#8A7A52" />
      <path d="M 24,-8 l 40,0 l 4,10 l -48,0 Z" fill="#9A8A5E" />
      {/* ── 黒の脚絆 (きゃはん) ── */}
      <path d="M -24,-10 L -16,-96 L 14,-96 L 16,-10 Z" fill={C22.kuro} />
      <path d="M 26,-12 L 30,-96 L 62,-96 L 62,-12 Z" fill={C22.kuro} />
      <path d="M -22,-40 l 38,2 M -20,-62 l 36,2 M 28,-42 l 34,2 M 28,-64 l 34,2" stroke={C22.kuroLit} strokeWidth={3.4} opacity={0.7} />
      {/* ── 股引 ── */}
      <path d="M -30,-96 L -22,-208 L 68,-208 L 64,-96 L 28,-96 L 22,-158 L 14,-96 Z" fill={tone} />
      {/* ── 黒小袖。前合わせを右へ ── */}
      <path d={`M -42,-200 C -52,-290 -46,-372 -24,-412 L 70,-412 C 92,-368 96,-286 86,-200 Z`} fill={tone} />
      <path d="M -24,-412 L 30,-250 L 70,-412 Z" fill={C22.kuroLit} opacity={0.3} />
      <path d="M 30,-250 L 86,-200 L -42,-200 Z" fill={C22.kuro} opacity={0.5} />
      {/* ── 襷 (たすき) ── */}
      <path d="M -30,-396 C 10,-340 40,-300 82,-274" fill="none" stroke={C22.sarashi} strokeWidth={9} opacity={0.88} />
      <path d="M 72,-398 C 34,-342 8,-304 -32,-282" fill="none" stroke={C22.sarashi} strokeWidth={7} opacity={0.6} />
      {/* ── 刀の鞘と下緒 ── */}
      <path d="M -36,-236 L -170,-176" stroke="#14161B" strokeWidth={13} strokeLinecap="round" />
      <path d="M -36,-236 L -4,-248" stroke="#2E2A26" strokeWidth={11} strokeLinecap="round" />
      <path d="M -52,-230 C -74,-204 -72,-176 -56,-158" fill="none" stroke="#6B5F3E" strokeWidth={3.4} />
      {/* ── 腕と袖。袖に白い晒を縫い付けて味方の目印にする ── */}
      <path d="M 54,-384 C 86,-350 100,-300 96,-250" fill="none" stroke={tone} strokeWidth={46} strokeLinecap="round" />
      <path d="M 86,-318 l 26,10 M 82,-300 l 28,10" stroke={C22.sarashi} strokeWidth={11} strokeLinecap="round" opacity={0.95} />
      <path d="M -24,-382 C -52,-346 -62,-300 -58,-256" fill="none" stroke={tone} strokeWidth={40} strokeLinecap="round" />
      <path d="M -56,-318 l -24,8 M -54,-300 l -24,8" stroke={C22.sarashi} strokeWidth={9} strokeLinecap="round" opacity={0.8} />
      {/* ── 鎖帷子が袖口と襟からのぞく ── */}
      <path d="M 92,-258 l 14,6 M 88,-248 l 16,6" stroke={C22.kusari} strokeWidth={4} opacity={0.85} />
      <path d="M 6,-396 l 44,-6" stroke={C22.kusari} strokeWidth={6} opacity={0.7} />
      {/* ── 右肩の名札 ── */}
      <g transform="translate(62 -392) rotate(8)">
        <rect x={0} y={0} width={24} height={46} rx={2} fill={C22.nafuda} />
        <path d="M 12,8 l 0,8 M 7,22 l 10,0 M 9,32 l 6,0" stroke="#1A1714" strokeWidth={2.6} />
      </g>

      {/* ── 頭。鉄輪入りの火事頭巾＋頬被り。目と口が見える横顔 ── */}
      <g transform={`translate(${br * 1.2} ${br * 0.8})`}>
        {/* 首 */}
        <path d="M 8,-410 L 48,-410 L 50,-440 L 10,-440 Z" fill={C21.hadaKage} />
        {/* 顔の地 */}
        <ellipse cx={30} cy={-470} rx={38} ry={44} fill={C21.hada} />
        <path d={oval(14, -470, 22, 42)} fill={C21.hadaKage} opacity={0.42} />
        {/* 頭巾。顔の穴を空ける */}
        <path
          fillRule="evenodd"
          d={
            `M -16,-470 C -20,-534 40,-544 62,-512 C 78,-488 76,-444 66,-412 ` +
            `C 48,-396 4,-398 -8,-414 C -20,-432 -18,-452 -16,-470 Z ` +
            oval(36, -474, 27, 30)
          }
          fill={C22.kuro}
        />
        {/* 鉄輪の縫い目 */}
        <path d="M -14,-498 C 8,-520 40,-526 58,-512" fill="none" stroke={C22.kusari} strokeWidth={3} opacity={0.8} />
        {[0, 1, 2, 3, 4].map((k) => (
          <circle key={k} cx={-8 + k * 16} cy={-504 - (k === 2 ? 6 : 0)} r={2.6} fill={C22.kusari} opacity={0.8} />
        ))}
        {/* 眉・目・鼻・口 */}
        <path d="M 30,-492 q 16,-6 26,2" fill="none" stroke="#2A2420" strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={42} cy={-478} rx={10} ry={6.6} fill="#F4EEE2" />
        <circle cx={46} cy={-478} r={4.2} fill="#221A14" />
        <path d="M 54,-472 C 62,-462 60,-452 52,-450" fill="none" stroke={C21.hadaKage} strokeWidth={3.4} strokeLinecap="round" />
        <path
          d={age === "waka" ? "M 34,-440 q 14,5 22,-2 q -8,10 -22,6 Z" : "M 34,-440 q 14,4 22,-3"}
          fill={age === "waka" ? "#5A2D28" : "none"}
          stroke="#6E3A32"
          strokeWidth={3.4}
          strokeLinecap="round"
        />
        {age === "rou" && (
          <>
            <path d="M 18,-434 C 28,-414 46,-410 58,-418" fill="none" stroke={C22.sarashi} strokeWidth={7} opacity={0.85} />
            <path d="M 30,-462 q 16,5 24,-1" fill="none" stroke={C21.hadaKage} strokeWidth={2.6} opacity={0.7} />
          </>
        )}
        {/* 息の白さ */}
        <g opacity={ikiA * 0.72 * iki}>
          <ellipse cx={78 + ikiA * 26} cy={-446} rx={26 + ikiA * 22} ry={13 + ikiA * 9} fill={C22.iki} opacity={0.5} />
          <ellipse cx={66 + ikiA * 14} cy={-444} rx={13} ry={8} fill={C22.iki} opacity={0.6} />
        </g>
      </g>

      {/* ── 手に持つ物 ── */}
      {item === "kakeya" && (
        <g transform="translate(96 -268) rotate(-28)">
          <path d="M 0,0 L 0,-212" stroke={C22.tsuchi} strokeWidth={17} strokeLinecap="round" />
          <path d="M -4,-20 l 0,-180" stroke="#6A5436" strokeWidth={4} opacity={0.7} />
          <rect x={-46} y={-282} width={92} height={74} rx={7} fill="#5E4A2E" />
          <rect x={-46} y={-282} width={92} height={20} rx={6} fill="#7A6238" />
          <path d="M -46,-246 l 92,0" stroke="#3A2C18" strokeWidth={4} />
          <path d="M -38,-278 l 0,62 M 38,-278 l 0,62" stroke={C22.tetsu} strokeWidth={6} opacity={0.9} />
        </g>
      )}
      {item === "hashigo" && (
        <g transform="translate(70 -300) rotate(-62)">
          <path d="M 0,0 L 430,0 M 0,56 L 430,56" stroke={C22.take} strokeWidth={13} strokeLinecap="round" />
          <path d="M 0,4 L 430,4" stroke={C22.takeLit} strokeWidth={4} opacity={0.75} />
          {Array.from({ length: 8 }, (_, k) => (
            <path key={k} d={`M ${26 + k * 54},0 L ${26 + k * 54},56`} stroke={C22.take} strokeWidth={9} />
          ))}
        </g>
      )}
      {item === "yari" && (
        <g transform="translate(100 -260) rotate(-9)">
          <path d="M 0,40 L 0,-330" stroke="#2A2218" strokeWidth={12} strokeLinecap="round" />
          <path d="M 0,-330 L -13,-372 L 0,-452 L 13,-372 Z" fill={C22.tetsu} />
          <path d="M 0,-452 L 0,-340" stroke="#9AA6B0" strokeWidth={3} opacity={0.8} />
          <path d="M -14,-326 l 28,0 l 0,14 l -28,0 Z" fill="#8A7A4A" />
        </g>
      )}
      {item === "yumi" && (
        <g transform="translate(-86 -300)">
          <path d="M 0,-170 C -44,-96 -44,-6 0,74" fill="none" stroke="#6B5A32" strokeWidth={9} strokeLinecap="round" />
          <path d="M 0,-170 L 0,74" stroke={C22.sarashi} strokeWidth={3} opacity={0.75} />
          <path d="M -30,-100 l 10,0 M -40,-50 l 12,0 M -38,10 l 12,0" stroke="#4A3E22" strokeWidth={4} />
        </g>
      )}
      {item === "kasugai" && (
        <g transform="translate(92 -238) rotate(18)">
          {/* かすがい = 近隣の門を外から打ち付けて人を出さないための鉄の留め具 */}
          <path d="M 0,0 l 0,-56 l 54,0 l 0,56" fill="none" stroke={C22.tetsu} strokeWidth={11} strokeLinejoin="miter" />
          <path d="M 0,0 l -8,16 M 54,0 l 8,16" stroke={C22.tetsu} strokeWidth={9} strokeLinecap="round" />
          <path d="M 14,-30 l 0,-56 l 54,0 l 0,56" fill="none" stroke="#49535C" strokeWidth={10} opacity={0.85} />
        </g>
      )}
    </g>
  );
};

const S22: SekaiArt = ({ f }) => {
  const uid = "s22";
  // 事件: 先頭の一人が提灯の火をふっと消す
  const lit = 1 - easeOut(seg(f, 62, 82));
  const SNOW = 880; // 積雪の面 = カメラの高さ
  return (
    <Cam f={f} from={[0, 0, 1.0]} to={[-24, 10, 1.06]} start={0} end={110}>
      <ColdStage
        f={f}
        uid={uid}
        src={[520, 760]}
        srcR={560}
        glow={C22.hi}
        bg={C22.sky0}
        vigColor="#030711"
        mote={C22.iki}
        motes={10}
        vig={0.86}
        shafts={false}
        defs={
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C22.sky0} />
            <stop offset="62%" stopColor={C22.sky1} />
            <stop offset="100%" stopColor="#223564" />
          </linearGradient>
        }
      >
        {/* ── 夜空と星 ── */}
        <rect x={-200} y={0} width={W + 400} height={SNOW} fill={`url(#${uid}-sky)`} />
        {Array.from({ length: 46 }, (_, i) => (
          <circle
            key={`st${i}`}
            cx={-120 + hash(i * 2.1) * (W + 240)}
            cy={20 + hash(i * 5.7) * 420}
            r={hash(i * 9.3) > 0.82 ? 2.4 : 1.4}
            fill={WP.star}
            opacity={0.3 + hash(i * 3.1) * 0.55}
          />
        ))}

        {/* ── 奥の松原。雪を乗せている ── */}
        {[
          [-80, 150], [120, 182], [1640, 164], [1840, 196],
        ].map(([mx, mh], i) => (
          <g key={`ma${i}`} transform={`translate(${mx} ${SNOW - 26})`}>
            <path d={`M 0,0 L 0,${-mh}`} stroke="#121A16" strokeWidth={13} />
            <path d={`M -82,${-mh * 0.44} C -34,${-mh * 0.78} 34,${-mh * 0.78} 82,${-mh * 0.44} C 40,${-mh * 0.3} -40,${-mh * 0.3} -82,${-mh * 0.44} Z`} fill={C22.matsu} />
            <path d={`M -66,${-mh * 0.72} C -26,${-mh} 26,${-mh} 66,${-mh * 0.72} C 30,${-mh * 0.6} -30,${-mh * 0.6} -66,${-mh * 0.72} Z`} fill={C22.matsu} />
            <path d={`M -58,${-mh * 0.76} C -22,${-mh * 1.0} 22,${-mh * 1.0} 58,${-mh * 0.76}`} fill="none" stroke={C22.yuki} strokeWidth={9} opacity={0.82} />
            <path d={`M -74,${-mh * 0.48} C -30,${-mh * 0.8} 30,${-mh * 0.8} 74,${-mh * 0.48}`} fill="none" stroke={C22.yuki} strokeWidth={7} opacity={0.6} />
          </g>
        ))}

        {/* ── 吉良邸の長屋門。真横から。瓦屋根・黒い下見板・海鼠壁・両脇に格子窓 ── */}
        <g>
          {/* 塀と門の躯体 */}
          <rect x={-200} y={430} width={W + 400} height={SNOW - 430} fill={C22.shitami} />
          {/* 下見板の横の継ぎ目 */}
          {Array.from({ length: 11 }, (_, i) => (
            <path key={`si${i}`} d={`M -200,${470 + i * 38} L ${W + 200},${470 + i * 38}`} stroke="#222835" strokeWidth={4} opacity={0.9} />
          ))}
          {/* 海鼠壁 (なまこかべ)。漆喰の目地を菱に盛る。左右の袖壁だけ */}
          {[0, 1].map((side) => (
            <g key={`nk${side}`} transform={`translate(${side === 0 ? 120 : 1546} 530)`}>
              <rect x={-170} y={0} width={340} height={300} fill={C22.namako} />
              {Array.from({ length: 5 }, (_, r) =>
                Array.from({ length: 6 }, (_, c) => (
                  <path
                    key={`${r}-${c}`}
                    d={`M ${-150 + c * 60},${28 + r * 60} l 26,26 l -26,26 l -26,-26 Z`}
                    fill="none"
                    stroke={C22.namakoLine}
                    strokeWidth={6}
                    opacity={0.75}
                  />
                ))
              )}
            </g>
          ))}
          {/* 格子窓。門の両脇 */}
          {[480, 1292].map((wx, i) => (
            <g key={`kw${i}`} transform={`translate(${wx} 566)`}>
              <rect x={-8} y={-8} width={176} height={152} fill="#0A0D13" />
              <rect x={0} y={0} width={160} height={136} fill={C22.koushiOku} />
              {Array.from({ length: 7 }, (_, k) => (
                <path key={`v${k}`} d={`M ${12 + k * 23},2 L ${12 + k * 23},134`} stroke={C22.koushiKi} strokeWidth={7} />
              ))}
              <path d="M 0,46 L 160,46 M 0,92 L 160,92" stroke={C22.koushiKi} strokeWidth={6} />
              <rect x={-14} y={-16} width={188} height={14} fill={C22.yuki} opacity={0.92} />
            </g>
          ))}
          {/* 門の柱と冠木 */}
          <rect x={742} y={452} width={56} height={SNOW - 452} fill={C22.hashira} />
          <rect x={1086} y={452} width={56} height={SNOW - 452} fill={C22.hashira} />
          <rect x={742} y={452} width={14} height={SNOW - 452} fill="#2C3341" opacity={0.8} />
          <rect x={1128} y={452} width={14} height={SNOW - 452} fill="#2C3341" opacity={0.8} />
          <rect x={706} y={430} width={472} height={48} fill={C22.kabuki} />
          <rect x={706} y={430} width={472} height={10} fill="#333B4A" opacity={0.8} />
          {/* 門扉。閉じている */}
          <rect x={798} y={478} width={288} height={SNOW - 478} fill="#0E1118" />
          {Array.from({ length: 7 }, (_, k) => (
            <path key={`do${k}`} d={`M ${812 + k * 40},480 L ${812 + k * 40},${SNOW}`} stroke="#1A1F28" strokeWidth={8} />
          ))}
          <circle cx={1052} cy={660} r={18} fill={C22.tetsu} opacity={0.9} />
          <circle cx={1052} cy={660} r={9} fill="#2A3038" />
          {/* 瓦屋根 */}
          <path d="M -200,430 L 1920,430 L 1920,392 L -200,392 Z" fill={C22.kawara} />
          <path d="M -200,392 L 1920,392 L 1920,366 L -200,366 Z" fill="#2D3543" />
          {Array.from({ length: 28 }, (_, k) => (
            <path key={`kw2${k}`} d={`M ${-180 + k * 76},368 L ${-180 + k * 76},430`} stroke="#171D27" strokeWidth={6} opacity={0.8} />
          ))}
          {/* 門の上だけ一段高い屋根 */}
          <path d="M 672,392 L 1212,392 L 1212,340 L 672,340 Z" fill={C22.kawara} />
          <path d="M 660,340 L 1224,340 L 1224,312 L 660,312 Z" fill="#2D3543" />
        </g>

        {/* ── 積もった雪。降らせない。軒の雪庇と垂れを描く ── */}
        <g>
          {/* 屋根の雪 */}
          <path d="M -200,366 L 1920,366 L 1920,318 C 1500,306 1000,312 520,302 C 200,296 0,306 -200,314 Z" fill={C22.yuki} />
          <path d="M 660,312 L 1224,312 L 1224,266 C 1060,254 820,258 660,266 Z" fill={C22.yuki} />
          {/* 軒の雪庇 (せっぴ)。前へ張り出して垂れる */}
          {Array.from({ length: 14 }, (_, k) => {
            const sx = -140 + k * 152;
            const dp = 18 + hash(k * 7.7) * 34;
            return (
              <path
                key={`sep${k}`}
                d={`M ${sx},366 C ${sx + 20},${366 + dp} ${sx + 54},${366 + dp} ${sx + 76},366 Z`}
                fill={C22.yuki}
                opacity={0.96}
              />
            );
          })}
          {/* 屋根からの垂れ (つらら) */}
          {[260, 540, 900, 1180, 1480, 1760].map((tx, k) => (
            <path
              key={`tr${k}`}
              d={`M ${tx},368 l 7,0 l -3,${26 + hash(k * 3.3) * 30} Z`}
              fill={WP.ice}
              opacity={0.8}
            />
          ))}
          {/* 地面の積雪。塀の裾に吹き寄せた山 */}
          <path d={`M -200,${SNOW} L 1920,${SNOW} L 1920,${H} L -200,${H} Z`} fill={C22.yuki} />
          <path
            d={`M -200,${SNOW} C 200,${SNOW - 34} 600,${SNOW - 14} 980,${SNOW - 40} C 1360,${SNOW - 62} 1660,${SNOW - 20} 1920,${SNOW - 44} L 1920,${SNOW + 30} L -200,${SNOW + 30} Z`}
            fill={C22.yuki}
          />
          <path
            d={`M -200,${SNOW + 26} C 300,${SNOW + 8} 700,${SNOW + 40} 1100,${SNOW + 16} C 1500,${SNOW - 6} 1740,${SNOW + 34} 1920,${SNOW + 18}`}
            fill="none"
            stroke={C22.yukiKage}
            strokeWidth={6}
            opacity={0.6}
          />
          {/* 門扉の裾の吹き溜まり */}
          <path d={`M 760,${SNOW - 10} C 860,${SNOW - 62} 1040,${SNOW - 58} 1130,${SNOW - 6} Z`} fill={C22.yuki} />
          {/* 雪の踏み跡。右から門へ向かって深く */}
          {Array.from({ length: 16 }, (_, k) => {
            const px = 180 + k * 108;
            const py = SNOW + 44 + (k % 2) * 36 + hash(k * 4.4) * 14;
            return (
              <g key={`ft${k}`}>
                <ellipse cx={px} cy={py} rx={25} ry={13} fill={C22.yukiFuka} opacity={0.68} />
                <ellipse cx={px - 4} cy={py - 4} rx={19} ry={9} fill={C22.yukiKage} opacity={0.75} />
              </g>
            );
          })}
        </g>

        {/* ── 浪士。黒系で不統一。年齢を散らす。全員の顔を描く ── */}
        <Roshi22 x={1748} y={968} h={330} item="yumi" age="chu" tone="#22242C" f={f} i={5} iki={0.8} />
        <Roshi22 x={1420} y={1004} h={400} item="hashigo" age="waka" tone="#1E1F26" f={f} i={4} />
        <Roshi22 x={1086} y={1038} h={470} item="yari" age="chu" tone={C22.kuro} f={f} i={3} />
        <Roshi22 x={700} y={1066} h={520} item="kasugai" age="rou" tone="#242128" f={f} i={2} />
        <Roshi22 x={330} y={1088} h={572} item="kakeya" age="chu" tone={C22.kuro} f={f} i={1} />

        {/* 先頭の一人が持つ提灯。事件: ここの火がふっと消える */}
        <Chochin22 x={196} y={1052} s={1.08} lit={lit} f={f} />
        {/* 消えた瞬間に残る煙 */}
        <g opacity={(1 - lit) * easeOut(seg(f, 72, 100)) * 0.5}>
          <path d="M 180,836 C 150,790 196,760 170,716" fill="none" stroke={C22.iki} strokeWidth={9} strokeLinecap="round" opacity={0.6} />
        </g>

        <YearTag year="一七〇二" place="江戸" f={f} />
      </ColdStage>
    </Cam>
  );
};

// ===================================================================
// #23 並 さらに、この戦争の裏側で、ひとりの日本人がアメリカから制裁を受けています。
// 顔の寄り。ただし本人を特定しない = 書類を読んでいる手と、うつむいた顔の下半分。
// 上は画面で切る。目を出さないので誰か分からない。黒く潰してはいない。
// 事件: 止まったクレジットカードが真ん中で切られる。
// ===================================================================

const C23 = {
  hada: "#E0B489",
  hadaKage: "#B2825A",
  hadaLit: "#F3D4AE",
  kuchi: "#8A4A40",
  wai: "#E9E5DB", // ワイシャツ
  waiKage: "#BCB7AB",
  tie: "#2C3A4E",
  fuutou: "#E4D9BF", // 日本語の茶の事務封筒
  fuutouLine: "#BFAF8D",
  card: "#27374F", // クレジットカード
  cardIC: "#C9A227",
  cardLine: "#4C6386",
  shuniku: "#B5322A", // 朱肉
  shunikuBako: "#2A2420",
  hanko: "#6B4A2A",
  steel: "#8E969C", // 日本の事務机のスチール
  steelDark: "#4A5257",
  steelTop: "#5E6A70",
  nuri: "#15120F", // 黒塗り
} as const;

// 読めない横文字。語の長さをばらして「英文の箇条書き」に見せる。
const Gyo23: React.FC<{
  x: number;
  y: number;
  w: number;
  size: number;
  seed: number;
  fill: string;
  t?: number;
}> = ({ x, y, w, size, seed, fill, t = 1 }) => {
  const out: React.ReactNode[] = [];
  let cx = x;
  let i = 0;
  const lim = x + w * Math.min(Math.max(t, 0), 1);
  while (cx < lim && i < 60) {
    const wd = size * (1.4 + hash(seed + i * 1.3) * 3.4);
    out.push(
      <rect key={i} x={cx} y={y - size * 0.5} width={Math.min(wd, lim - cx)} height={size * 0.5} rx={size * 0.16} fill={fill} />
    );
    cx += wd + size * 0.7;
    i++;
  }
  return <g>{out}</g>;
};

// 書類の縁をつかむ手。親指を紙の上に、残りの指を裏にまわす。
const Te23: React.FC<{ x: number; y: number; s: number; flip: number; grip: number }> = ({ x, y, s, flip, grip }) => (
  <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
    {/* 手の甲 */}
    <path d="M -74,150 C -92,60 -74,-18 -22,-42 C 36,-66 92,-30 100,42 C 106,104 96,160 86,214 L -62,214 Z" fill={C23.hada} />
    {/* 指 (紙の裏にまわっている3本の見切れ) */}
    <path d="M -24,-40 C -36,-78 -18,-104 10,-102 C 36,-100 48,-78 44,-48" fill={C23.hada} />
    <path d="M 26,-48 C 24,-86 46,-108 70,-100 C 92,-92 96,-64 90,-36" fill={C23.hada} />
    {/* 親指 = 紙の上に乗る */}
    <path
      d={`M -70,86 C -116,${56 - grip * 16} -138,${6 - grip * 22} -112,${-18 - grip * 26} C -88,${-40 - grip * 26} -46,${-8 - grip * 14} -34,32 Z`}
      fill={C23.hadaLit}
    />
    <path d={`M -104,${-6 - grip * 22} C -118,${8 - grip * 18} -120,${30 - grip * 10} -106,${44 - grip * 8}`} fill="none" stroke={C23.hadaKage} strokeWidth={5} opacity={0.7} />
    {/* 指の節と影 */}
    <path d="M -40,10 C -6,-6 40,-8 76,10" fill="none" stroke={C23.hadaKage} strokeWidth={4} opacity={0.55} />
    <path d="M -56,170 C -16,150 44,150 84,172" fill="none" stroke={C23.hadaKage} strokeWidth={5} opacity={0.4} />
    <path d="M 92,60 C 102,118 96,170 88,212" fill="none" stroke={C23.hadaKage} strokeWidth={6} opacity={0.45} />
    {/* 袖口 */}
    <path d="M -66,196 L 90,196 L 104,258 L -82,258 Z" fill={C23.wai} />
    <path d="M -66,196 L 90,196 L 92,210 L -68,210 Z" fill={C23.waiKage} />
  </g>
);

const S23: SekaiArt = ({ f }) => {
  const uid = "s23";
  const cut = easeOut(seg(f, 54, 74)); // 事件: カードが真ん中で切られる
  const paper = easeOut(seg(f, 2, 30));
  return (
    <Cam f={f} from={[0, -10, 1.04]} to={[10, 4, 1.0]} start={0} end={104}>
      <ColdStage
        f={f}
        uid={uid}
        src={[1600, 130]}
        srcR={840}
        glow={C.deskLit}
        bg={C.deskAir}
        vigColor={C.deskVig}
        mote="#E8DCC6"
        motes={12}
        vig={0.72}
        shafts={false}
      >
        {/* ── 奥。日本の事務室のスチール棚と壁 ── */}
        <rect x={-200} y={0} width={W + 400} height={880} fill={C.deskAir} />
        <rect x={-200} y={0} width={820} height={880} fill="#272B31" />
        <g opacity={0.9}>
          <rect x={-60} y={120} width={560} height={760} fill={C23.steelDark} />
          <rect x={-60} y={120} width={560} height={16} fill={C23.steelTop} />
          {[240, 400, 560, 720].map((yy, i) => (
            <g key={`sh${i}`}>
              <rect x={-60} y={yy} width={560} height={14} fill={C23.steelTop} opacity={0.8} />
              <rect x={-20} y={yy - 92} width={120} height={92} fill="#8E8673" opacity={0.5} />
              <rect x={110} y={yy - 84} width={90} height={84} fill="#6E7D86" opacity={0.5} />
              <rect x={210} y={yy - 96} width={150} height={96} fill="#8E8673" opacity={0.36} />
            </g>
          ))}
        </g>
        {/* 卓上灯。右上から紙を照らす一灯 */}
        <g transform="translate(1690 80)" opacity={easeOut(seg(f, 0, 22))}>
          <path d="M 0,0 L 10,300" stroke={C23.steelDark} strokeWidth={16} />
          <path d="M -120,-10 C -60,-70 70,-70 120,-10 Z" fill="#30363C" />
          <path d="M -108,-6 C -54,-56 62,-56 108,-6 Z" fill={C.deskLit} opacity={0.9} />
          <ellipse cx={0} cy={10} rx={150} ry={40} fill={C.deskLit} opacity={0.2} />
        </g>

        {/* ── うつむいた顔の下半分。上は画面で切る (目を出さない = 特定しない) ── */}
        <g>
          {/* 首と肩 */}
          <path d="M 600,330 L 900,330 L 946,560 L 548,560 Z" fill={C23.hadaKage} />
          <path d="M 330,560 C 470,470 1030,470 1180,566 C 1240,700 1250,820 1252,900 L 268,900 C 272,810 284,690 330,560 Z" fill={C23.wai} />
          <path d="M 610,520 L 752,742 L 898,520 C 820,478 684,478 610,520 Z" fill={C23.waiKage} opacity={0.8} />
          <path d="M 724,560 L 790,560 L 824,900 L 700,900 Z" fill={C23.tie} />
          <path d="M 724,560 L 757,620 L 790,560 Z" fill="#1C2733" />
          {/* 顔。輪郭は顎と頬だけ。額から上は frame の外 */}
          <path d="M 470,-140 C 470,230 600,420 752,420 C 904,420 1034,230 1034,-140 Z" fill={C23.hada} />
          <path d="M 470,-140 C 470,190 540,352 648,404 C 560,330 522,160 520,-140 Z" fill={C23.hadaKage} opacity={0.5} />
          {/* 鼻の下端 */}
          <path d="M 716,24 C 706,78 724,104 752,106 C 784,106 802,76 790,24" fill="none" stroke={C23.hadaKage} strokeWidth={9} strokeLinecap="round" />
          <ellipse cx={722} cy={92} rx={13} ry={8} fill={C23.hadaKage} opacity={0.85} />
          <ellipse cx={784} cy={92} rx={13} ry={8} fill={C23.hadaKage} opacity={0.85} />
          {/* 人中と口。わずかに結ばれている */}
          <path d="M 752,112 L 752,166" stroke={C23.hadaKage} strokeWidth={6} opacity={0.6} />
          <path d="M 672,186 C 712,172 792,172 834,186 C 792,216 712,216 672,186 Z" fill={C23.kuchi} opacity={0.5} />
          <path d="M 672,186 C 712,176 792,176 834,186" fill="none" stroke="#6E3A32" strokeWidth={8} strokeLinecap="round" />
          {/* 顎と頬の影 */}
          <path d="M 592,258 C 632,318 672,348 752,352" fill="none" stroke={C23.hadaKage} strokeWidth={8} opacity={0.5} />
          <path d="M 926,250 C 900,318 852,348 790,356" fill="none" stroke={C23.hadaKage} strokeWidth={7} opacity={0.42} />
          <path d="M 700,300 C 730,312 776,312 806,300" fill="none" stroke={C23.hadaKage} strokeWidth={6} opacity={0.4} />
        </g>

        {/* ── 机の天板。日本の事務机のスチール ── */}
        <path d={`M -200,876 L ${W + 200},876 L ${W + 200},${H} L -200,${H} Z`} fill="#6E6256" />
        <path d={`M -200,876 L ${W + 200},876 L ${W + 200},906 L -200,906 Z`} fill="#8A7C6C" />
        <path d={`M -200,1016 L ${W + 200},1016 L ${W + 200},1042 L -200,1042 Z`} fill={C23.steel} />
        <path d={`M -200,1042 L ${W + 200},1042 L ${W + 200},${H} L -200,${H} Z`} fill={C23.steelDark} />
        {[120, 560, 1040, 1520].map((dx, i) => (
          <rect key={`dh${i}`} x={dx} y={1052} width={160} height={12} rx={6} fill={C23.steelTop} opacity={0.85} />
        ))}

        {/* ── 机の上の物。封筒・銀行の通知・判子と朱肉 ── */}
        <g transform="translate(216 960) rotate(-7)" opacity={easeOut(seg(f, 10, 36))}>
          <rect x={-150} y={-86} width={300} height={172} rx={4} fill={C23.fuutou} />
          <path d="M -150,-86 L 0,16 L 150,-86" fill="none" stroke={C23.fuutouLine} strokeWidth={5} />
          <rect x={-120} y={34} width={122} height={40} fill="none" stroke={C23.fuutouLine} strokeWidth={4} />
          <path d="M -110,50 l 0,10 M -92,46 l 0,18 M -74,50 l 0,10 M -56,46 l 0,18" stroke="#2A2420" strokeWidth={4} />
          <rect x={80} y={-66} width={54} height={62} fill="#C8CBB8" />
          <path d="M 92,-50 l 30,0 M 92,-36 l 30,0 M 92,-22 l 20,0" stroke="#6E6E62" strokeWidth={4} />
        </g>
        <g transform="translate(610 1014) rotate(4)" opacity={easeOut(seg(f, 14, 42))}>
          <rect x={-190} y={-60} width={380} height={140} rx={3} fill={C.paperLow} />
          <rect x={-190} y={-60} width={380} height={26} fill="#4A5A6E" />
          <path d="M -170,-50 l 120,0" stroke={C.paperHi} strokeWidth={8} />
          <Gyo23 x={-168} y={-4} w={300} size={15} seed={31} fill={C.gyo} />
          <Gyo23 x={-168} y={30} w={250} size={15} seed={37} fill={C.gyo} />
          <path d="M 60,42 l 110,0" stroke={WP.inkRed} strokeWidth={6} />
        </g>
        <g transform="translate(1660 952)" opacity={easeOut(seg(f, 18, 46))}>
          {/* 朱肉の丸い容器 */}
          <ellipse cx={0} cy={48} rx={78} ry={26} fill="#1C1A17" opacity={0.5} />
          <circle cx={0} cy={28} r={76} fill={C23.shunikuBako} />
          <circle cx={0} cy={22} r={66} fill="#3A322A" />
          <circle cx={0} cy={18} r={52} fill={C23.shuniku} />
          <circle cx={-18} cy={2} r={16} fill="#D8564A" opacity={0.6} />
          {/* 判子 */}
          <g transform="translate(-130 -40) rotate(-14)">
            <rect x={-20} y={-96} width={40} height={128} rx={6} fill={C23.hanko} />
            <rect x={-20} y={-96} width={14} height={128} fill="#8A6236" opacity={0.7} />
            <rect x={-26} y={28} width={52} height={26} rx={4} fill="#3E2A16" />
            <rect x={-22} y={50} width={44} height={10} fill={C23.shuniku} />
          </g>
        </g>

        {/* ── 止まったクレジットカード。事件: 真ん中で切られる ── */}
        <g transform="translate(1210 962)">
          <ellipse cx={0} cy={66} rx={178} ry={22} fill="#1A1714" opacity={0.45} />
          <g transform={`translate(${-cut * 34} ${cut * 6}) rotate(${-cut * 4})`}>
            <path d="M -170,-58 L 0,-58 L 0,58 L -170,58 Z" fill={C23.card} />
            <path d="M -170,-34 L 0,-34 L 0,-16 L -170,-16 Z" fill={C23.cardLine} opacity={0.6} />
            <rect x={-146} y={-6} width={48} height={38} rx={5} fill={C23.cardIC} />
            <path d="M -140,4 l 36,0 M -140,16 l 36,0 M -128,-6 l 0,38" stroke="#8A6E18" strokeWidth={3} />
            <path d="M -152,42 l 70,0" stroke={C.paperHi} strokeWidth={7} opacity={0.75} />
          </g>
          <g transform={`translate(${cut * 34} ${-cut * 4}) rotate(${cut * 5})`}>
            <path d="M 0,-58 L 170,-58 L 170,58 L 0,58 Z" fill={C23.card} />
            <path d="M 0,-34 L 170,-34 L 170,-16 L 0,-16 Z" fill={C23.cardLine} opacity={0.6} />
            <path d="M 18,42 l 90,0 M 120,42 l 36,0" stroke={C.paperHi} strokeWidth={7} opacity={0.75} />
            <circle cx={126} cy={-2} r={22} fill="#C45A3A" opacity={0.75} />
            <circle cx={146} cy={-2} r={22} fill="#D8A03A" opacity={0.7} />
          </g>
          {/* 切断面 */}
          <path d={`M 0,-58 L 0,58`} stroke="#0E1116" strokeWidth={4} opacity={1 - cut} />
          <g opacity={cut}>
            <path d="M -8,-58 L -2,58" stroke="#0E1116" strokeWidth={5} />
            <path d="M 8,-58 L 2,58" stroke="#0E1116" strokeWidth={5} />
          </g>
        </g>

        {/* ── 読んでいる英文の制裁文書。OFAC の様式・箇条書き・黒塗り ── */}
        <g opacity={paper} transform={`translate(0 ${(1 - paper) * 40})`}>
          <path d="M 442,452 L 1452,420 L 1498,882 L 396,906 Z" fill={C.paperLow} />
          <path d="M 452,462 L 1442,430 L 1486,870 L 408,894 Z" fill={C.paperHi} />
          {/* 財務省の丸い印 (星条旗とドル記号では済ませない) */}
          <g transform="translate(528 530)">
            <circle cx={0} cy={0} r={48} fill="none" stroke="#2E3640" strokeWidth={5} />
            <circle cx={0} cy={0} r={38} fill="none" stroke="#2E3640" strokeWidth={2.6} />
            <path d="M -20,14 C -8,-8 8,-8 20,14 Z" fill="#2E3640" />
            <path d="M 0,-20 l 0,14 M -14,-8 l 28,0" stroke="#2E3640" strokeWidth={4} />
            <path d="M -30,26 C -10,36 10,36 30,26" fill="none" stroke="#2E3640" strokeWidth={3} />
          </g>
          <text x={600} y={514} fontFamily={SEKAI_FONT} fontSize={25} fontWeight={700} fill="#2E3640" letterSpacing={1.6}>
            DEPARTMENT OF THE TREASURY
          </text>
          <text x={600} y={550} fontFamily={SEKAI_FONT} fontSize={21} fill="#4A525C" letterSpacing={1.2}>
            OFFICE OF FOREIGN ASSETS CONTROL
          </text>
          <text x={600} y={592} fontFamily={SEKAI_FONT} fontSize={24} fontWeight={700} fill="#2E3640" letterSpacing={1}>
            SPECIALLY DESIGNATED NATIONALS LIST
          </text>
          <path d="M 596,606 L 1392,580" stroke="#2E3640" strokeWidth={4} />
          {/* 箇条書き。黒塗りが混じる */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const yy = 650 + i * 44;
            const dx = 3 + i * 0.4;
            return (
              <g key={`bl${i}`}>
                <circle cx={500 + dx} cy={yy - 7} r={6} fill="#3A424C" />
                <Gyo23 x={524 + dx} y={yy} w={420 + hash(i * 6.1) * 220} size={17} seed={50 + i} fill={C.gyo} t={easeOut(seg(f, 12 + i * 5, 34 + i * 5))} />
                {(i === 1 || i === 4) && (
                  <rect x={524 + dx + (i === 1 ? 470 : 300)} y={yy - 19} width={i === 1 ? 300 : 420} height={24} fill={C23.nuri} opacity={easeOut(seg(f, 20 + i * 5, 40 + i * 5))} />
                )}
              </g>
            );
          })}
          {/* 日本人の名前の行だけ、朱でなぞられている */}
          <g opacity={easeOut(seg(f, 34, 56))}>
            <rect x={500} y={892 - 70} width={520} height={26} fill={C23.nuri} opacity={0.92} />
            <path d="M 494,842 L 1030,830" stroke={WP.inkRed} strokeWidth={6} opacity={0.9} />
          </g>
          {/* 紙の折り目と右下のめくれ */}
          <path d="M 440,666 L 1470,640" stroke={C.paperEdge} strokeWidth={3} opacity={0.5} />
          <path d="M 1498,882 L 1402,866 L 1430,792 Z" fill={C.paperLow} />
        </g>

        {/* ── 書類をつかむ手 ── */}
        <Te23 x={520} y={812} s={1.02} flip={1} grip={0.2 + easeOut(seg(f, 30, 60)) * 0.8} />
        <Te23 x={1402} y={786} s={0.96} flip={-1} grip={0.4} />
      </ColdStage>
    </Cam>
  );
};

// ===================================================================
// #24 図 え、日本人が？ 何をしたの？ (反応・通知カードが出る)
// 記者の手元。#13 と対になる型 = 同じ机・同じノート。#28 とも3枚で1組。
// 事件: 書いた字の横にクエスチョンマークが3つ増える。
// ===================================================================

const C24 = {
  tenban: "#7A6A54", // 記者机の木の天板
  tenbanLit: "#9A8868",
  tenbanDark: "#4E4232",
  note: "#FBF7EC", // ノートの紙
  noteShade: "#DCD6C6",
  rule: "#B9C6D2", // ノートの罫
  ring: "#A8B0B6", // リングの金属
  pen: "#1C2026",
  penClip: "#B9A24A",
  pass: "#E8E3D6", // 取材パス
  passBand: "#2B4660",
  fusen: "#E8C84A", // 付箋
  fusen2: "#9CD08A",
  sumi: "#1A1714",
} as const;

// #24 と #28 で共有する「記者の机」。同じ机・同じノートであることが型になる。
const Tsukue24: React.FC<{ f: number; uid: string; children: React.ReactNode }> = ({ f, uid, children }) => (
  <ColdStage
    f={f}
    uid={uid}
    src={[1540, 90]}
    srcR={900}
    glow={C.deskLit}
    bg={C.deskAir}
    vigColor={C.deskVig}
    mote="#E8DCC6"
    motes={10}
    vig={0.76}
    shafts={false}
  >
    {/* 奥の空気と壁。真上ではなく、斜め上から見下ろした記者机 */}
    <rect x={-200} y={0} width={W + 400} height={210} fill="#23272C" />
    <rect x={-200} y={186} width={W + 400} height={26} fill="#3A4047" />
    {/* 天板 */}
    <path d={`M -200,210 L ${W + 200},210 L ${W + 200},${H} L -200,${H} Z`} fill={C24.tenban} />
    <path d={`M -200,210 L ${W + 200},210 L ${W + 200},264 L -200,264 Z`} fill={C24.tenbanLit} opacity={0.6} />
    {/* 木目 */}
    {Array.from({ length: 9 }, (_, i) => (
      <path
        key={`mk${i}`}
        d={`M -200,${320 + i * 90} C 400,${300 + i * 90 + hash(i) * 26} 1200,${340 + i * 90 - hash(i * 3) * 26} ${W + 200},${316 + i * 90}`}
        fill="none"
        stroke={C24.tenbanDark}
        strokeWidth={3}
        opacity={0.3}
      />
    ))}
    {/* 卓上灯の光のたまり。紙を主役にする */}
    <ellipse cx={1040} cy={700} rx={840} ry={470} fill={C.deskLit} opacity={0.12} />
    {children}
    {/* 机の手前の縁 */}
    <path d={`M -200,1046 L ${W + 200},1046 L ${W + 200},${H} L -200,${H} Z`} fill={C24.tenbanDark} />
  </ColdStage>
);

const S24: SekaiArt = ({ f }) => {
  const uid = "s24";
  const write = easeOut(seg(f, 8, 40));
  const q = (i: number) => easeOut(seg(f, 46 + i * 11, 58 + i * 11)); // 事件: ？が3つ増える
  return (
    <Cam f={f} from={[0, 0, 1.0]} to={[-16, -8, 1.05]} start={0} end={100}>
      <Tsukue24 f={f} uid={uid}>
        {/* ── 取材パス。机の左に置かれている ── */}
        <g transform="translate(250 880) rotate(-11)" opacity={easeOut(seg(f, 6, 30))}>
          <rect x={-134} y={-96} width={268} height={192} rx={8} fill={C24.pass} />
          <rect x={-134} y={-96} width={268} height={46} rx={8} fill={C24.passBand} />
          <text x={-112} y={-62} fontFamily={SEKAI_FONT} fontSize={26} fontWeight={700} fill="#EDF2F6">
            PRESS
          </text>
          <rect x={-112} y={-30} width={82} height={102} fill="#9AA4AC" />
          <circle cx={-71} cy={6} r={22} fill="#C8B49A" />
          <path d="M -94,56 C -86,28 -56,28 -48,56 Z" fill="#43505C" />
          <path d="M -16,-6 l 120,0 M -16,22 l 96,0 M -16,50 l 108,0" stroke="#6E6E66" strokeWidth={6} />
          {/* 首にかける紐 */}
          <path d="M -120,-96 C -150,-180 -40,-230 60,-200" fill="none" stroke={C24.passBand} strokeWidth={13} opacity={0.85} />
        </g>

        {/* ── ノート。新しいページを開いたところ ── */}
        <g transform="translate(1020 660) rotate(-3)">
          <path d="M -610,-390 L 620,-390 L 660,400 L -650,400 Z" fill="#C8C2B2" opacity={0.5} />
          {/* 左ページ (使い終わった側。めくって裏が見えている) */}
          <path d="M -600,-382 L 10,-382 L 10,392 L -634,392 Z" fill={C24.noteShade} />
          {Array.from({ length: 13 }, (_, i) => (
            <path key={`lr${i}`} d={`M -580,${-320 + i * 56} L -10,${-320 + i * 56}`} stroke={C24.rule} strokeWidth={2.6} opacity={0.6} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <path
              key={`lw${i}`}
              d={`M -568,${-306 + i * 56} l ${180 + hash(i * 2.7) * 340},${hash(i * 5.1) * 5 - 2}`}
              stroke={C24.sumi}
              strokeWidth={5}
              opacity={0.26}
              strokeLinecap="round"
            />
          ))}
          {/* 右ページ = 新しいページ。白い */}
          <path d="M 10,-382 L 616,-382 L 650,392 L 10,392 Z" fill={C24.note} />
          {Array.from({ length: 13 }, (_, i) => (
            <path key={`rr${i}`} d={`M 36,${-320 + i * 56} L ${606 + i},${-320 + i * 56}`} stroke={C24.rule} strokeWidth={2.6} opacity={0.75} />
          ))}
          {/* リング */}
          {Array.from({ length: 15 }, (_, i) => (
            <g key={`rg${i}`}>
              <path d={`M 0,${-368 + i * 54} a 17,17 0 1 0 14,0`} fill="none" stroke={C24.ring} strokeWidth={8} />
              <circle cx={7} cy={-368 + i * 54} r={7} fill="#2A2E33" opacity={0.6} />
            </g>
          ))}
          {/* ── 「日本人？」と大きく書かれた走り書き ── */}
          <g opacity={write}>
            <text
              x={62}
              y={-110}
              fontFamily={SEKAI_SERIF}
              fontSize={160}
              fontWeight={700}
              fill={C24.sumi}
              letterSpacing={6}
            >
              日本人
            </text>
            <path d="M 60,-78 L 500,-70" stroke={WP.inkRed} strokeWidth={9} opacity={0.85} />
            <path d="M 58,-56 L 470,-50" stroke={WP.inkRed} strokeWidth={5} opacity={0.6} />
          </g>
          {/* 事件: クエスチョンマークが3つ増える */}
          {[0, 1, 2].map((i) => (
            <g key={`qm${i}`} opacity={q(i)} transform={`translate(${520 + i * 44} ${-150 + i * 26}) scale(${1 - i * 0.18}) rotate(${i * 7 - 4})`}>
              <text x={0} y={0} fontFamily={SEKAI_SERIF} fontSize={150} fontWeight={700} fill={WP.inkRed}>
                ？
              </text>
            </g>
          ))}
          {/* 下の行に小さく書き足した走り書き */}
          <g opacity={easeOut(seg(f, 30, 54))}>
            <path d="M 60,36 l 300,2 M 60,92 l 420,2 M 60,148 l 240,2" stroke={C24.sumi} strokeWidth={6} opacity={0.5} strokeLinecap="round" />
            <path d="M 60,204 l 180,2" stroke={C24.sumi} strokeWidth={6} opacity={0.3} strokeLinecap="round" />
          </g>
        </g>

        {/* ── ペン先。インクが光る ── */}
        <g transform="translate(1452 962) rotate(-38)" opacity={easeOut(seg(f, 2, 24))}>
          <path d="M 0,0 L 0,-330" stroke={C24.pen} strokeWidth={28} strokeLinecap="round" />
          <path d="M -9,-40 L -9,-310" stroke="#3C434C" strokeWidth={6} opacity={0.8} />
          <rect x={-10} y={-300} width={20} height={120} rx={8} fill={C24.penClip} />
          <path d="M -14,0 L 14,0 L 4,56 L -4,56 Z" fill="#9AA4AC" />
          <path d="M -4,56 L 4,56 L 0,80 Z" fill={C24.sumi} />
          <circle cx={0} cy={82} r={5} fill="#2A2E33" />
        </g>

        {/* ── 消しゴムのかす ── */}
        {Array.from({ length: 22 }, (_, i) => (
          <g key={`ks${i}`} opacity={easeOut(seg(f, 18, 44)) * 0.9}>
            <ellipse
              cx={420 + hash(i * 3.1) * 280}
              cy={960 + hash(i * 7.3) * 90}
              rx={5 + hash(i * 1.9) * 9}
              ry={3 + hash(i * 5.3) * 5}
              fill="#D8D2C2"
              transform={`rotate(${hash(i * 9.1) * 180} ${420 + hash(i * 3.1) * 280} ${960 + hash(i * 7.3) * 90})`}
            />
          </g>
        ))}
        <g transform="translate(560 918) rotate(16)" opacity={easeOut(seg(f, 10, 32))}>
          <rect x={-56} y={-26} width={112} height={52} rx={6} fill="#EDE8DA" />
          <rect x={-56} y={-26} width={112} height={18} rx={6} fill="#4A6C96" opacity={0.85} />
          <path d="M 30,-20 C 48,-6 48,12 30,22" fill="none" stroke="#C8C2B2" strokeWidth={4} />
        </g>
      </Tsukue24>
    </Cam>
  );
};

// ===================================================================
// #25 図 その話も、最後にひとつにつながります。
// #3 の夜の地球に戻る型。ただし素の地球にしない。
// 4つの灯 (日本・イラン・米国・イスラエル) と5つ目の小さな灯。
// 灯の下にそれぞれの物を小さく置く。線はまだ引かない。
// 事件: 5つ目の灯が一度またたいてから安定する。
// ===================================================================

const GR25 = 1400;
const GCX25 = 960;
const GCY25 = 1520;
const gpt25 = (deg: number, lift = 0): [number, number] => {
  const r = ((deg - 0) * Math.PI) / 180;
  return [GCX25 + (GR25 + lift) * Math.sin(r), GCY25 - (GR25 + lift) * Math.cos(r)];
};

// 灯の下に置く「その国の物」。小さいが、どの国か分かる形にする。
const Mono25: React.FC<{ kind: "kawara" | "dome" | "sign" | "kabe"; x: number; y: number; s: number; t: number }> = ({
  kind,
  x,
  y,
  s,
  t,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={t}>
    {kind === "kawara" && (
      <>
        {/* 日本 = 瓦屋根 */}
        <path d="M -84,0 L -62,-46 L 62,-46 L 84,0 Z" fill={WP.kawara} />
        <path d="M -62,-46 L 62,-46 L 56,-58 L -56,-58 Z" fill="#6E7378" />
        {[-44, -20, 4, 28, 52].map((cx, i) => (
          <path key={i} d={`M ${cx},-44 L ${cx - 6},-2`} stroke="#3C4045" strokeWidth={4} />
        ))}
        <path d="M -84,0 L 84,0 L 84,8 L -84,8 Z" fill="#2A2E33" />
        <path d="M -66,8 L -66,44 L 66,44 L 66,8 Z" fill="#D9CFB8" />
        <path d="M -30,14 L -30,44 M 30,14 L 30,44" stroke="#5E4A32" strokeWidth={5} />
      </>
    )}
    {kind === "dome" && (
      <>
        {/* イラン = 水色のドーム (モスクの丸屋根) */}
        <path d="M -62,16 C -62,-52 -30,-92 0,-100 C 30,-92 62,-52 62,16 Z" fill="#3FA8C0" />
        <path d="M -62,16 C -62,-52 -30,-92 0,-100 C -14,-72 -26,-34 -26,16 Z" fill="#5FC6DA" opacity={0.6} />
        {[-40, -20, 0, 20, 40].map((cx, i) => (
          <path key={i} d={`M ${cx},14 C ${cx * 0.7},-40 ${cx * 0.4},-72 ${cx * 0.1},-98`} fill="none" stroke="#1E7C92" strokeWidth={3} opacity={0.7} />
        ))}
        <path d="M 0,-100 L 0,-128 M -10,-120 l 20,0" stroke={WP.brass} strokeWidth={5} />
        <path d="M -68,16 L 68,16 L 68,28 L -68,28 Z" fill="#C8B49A" />
        <path d="M -56,28 L -56,56 L 56,56 L 56,28 Z" fill="#D9C8A8" />
        <path d="M -24,56 C -24,24 24,24 24,56 Z" fill="#1E4C62" />
      </>
    )}
    {kind === "sign" && (
      <>
        {/* 米国 = ハイウェイの標識 */}
        <path d="M -6,56 L 6,56 L 6,-30 L -6,-30 Z" fill="#6E7A82" />
        <path d="M -70,-96 L 70,-96 L 70,-28 L -70,-28 Z" fill="#1E6B3A" />
        <path d="M -62,-88 L 62,-88 L 62,-36 L -62,-36 Z" fill="none" stroke="#E8EFE8" strokeWidth={4} />
        <path d="M -48,-56 l 40,0 M -48,-70 l 56,0" stroke="#E8EFE8" strokeWidth={7} />
        <path d="M 22,-74 l 26,0 l 0,28 l -26,0 Z" fill="none" stroke="#E8EFE8" strokeWidth={4} />
        <path d="M 28,-50 l 14,-20" stroke="#E8EFE8" strokeWidth={4} />
        <path d="M -40,56 L 40,56 L 40,62 L -40,62 Z" fill="#3A3832" />
      </>
    )}
    {kind === "kabe" && (
      <>
        {/* イスラエル = 石灰岩の壁 */}
        <rect x={-78} y={-78} width={156} height={134} fill="#D8CBAC" />
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={-74 + c * 50 + (r % 2 ? 12 : 0)}
              y={-74 + r * 33}
              width={46}
              height={29}
              fill={r % 2 ? "#E2D6B8" : "#CCBD9C"}
              stroke="#AE9F80"
              strokeWidth={2}
            />
          ))
        )}
        <path d="M -78,-78 L 78,-78 L 78,-88 L -78,-88 Z" fill="#B8A98A" />
        <path d="M -20,-40 l 4,-20 M 10,-10 l 6,-18" stroke="#8A7A58" strokeWidth={3} opacity={0.6} />
      </>
    )}
  </g>
);

const S25: SekaiArt = ({ f }) => {
  const uid = "s25";
  const LIGHTS = [
    { deg: -33, name: "米国", mono: "sign" as const, on: 10 },
    { deg: -9, name: "イスラエル", mono: "kabe" as const, on: 18 },
    { deg: 8, name: "イラン", mono: "dome" as const, on: 26 },
    { deg: 32, name: "日本", mono: "kawara" as const, on: 34 },
  ];
  // 事件: 5つ目の小さな灯が一度またたいてから安定する
  const fifthUp = easeOut(seg(f, 52, 62));
  const flick = f < 70 ? 1 : f < 78 ? 0.08 : f < 84 ? 0.95 : 1;
  const [f5x, f5y] = gpt25(41, -14);
  const spin = Math.sin(f / 180) * 4;
  return (
    <Cam f={f} from={[0, 26, 1.03]} to={[0, 0, 1.0]} start={0} end={110}>
      <ColdStage
        f={f}
        uid={uid}
        src={[960, 240]}
        srcR={900}
        glow="#3D6CA8"
        bg={C.spaceBg}
        vigColor={C.spaceVig}
        mote="#9FC0E8"
        motes={0}
        vig={0.82}
        shafts={false}
        defs={
          <>
            <radialGradient id={`${uid}-earth`} cx="42%" cy="18%" r="78%">
              <stop offset="0%" stopColor={C.earthHi} />
              <stop offset="52%" stopColor={C.earthMid} />
              <stop offset="100%" stopColor={C.earthLow} />
            </radialGradient>
            <linearGradient id={`${uid}-air`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.airBlue} stopOpacity={0.85} />
              <stop offset="60%" stopColor={C.airBlue} stopOpacity={0.22} />
              <stop offset="100%" stopColor={C.airBlue} stopOpacity={0} />
            </linearGradient>
          </>
        }
      >
        {/* 星 */}
        {Array.from({ length: 70 }, (_, i) => (
          <circle
            key={`st${i}`}
            cx={-100 + hash(i * 1.7) * (W + 200)}
            cy={10 + hash(i * 4.3) * 520}
            r={hash(i * 8.9) > 0.86 ? 2.6 : 1.4}
            fill={WP.star}
            opacity={0.25 + hash(i * 2.9) * 0.6}
          />
        ))}
        {/* 大気の縁の青 */}
        <g opacity={easeOut(seg(f, 0, 30))}>
          <circle cx={GCX25} cy={GCY25} r={GR25 + 72} fill={`url(#${uid}-air)`} />
          <circle cx={GCX25} cy={GCY25} r={GR25 + 10} fill="none" stroke={C.airBlue} strokeWidth={14} opacity={0.5} />
          <circle cx={GCX25} cy={GCY25} r={GR25 + 2} fill="none" stroke="#8FC8EE" strokeWidth={5} opacity={0.7} />
        </g>
        {/* 夜の地球 */}
        <g transform={`rotate(${spin} ${GCX25} ${GCY25})`}>
          <circle cx={GCX25} cy={GCY25} r={GR25} fill={`url(#${uid}-earth)`} />
          {/* 陸の起伏。地図ではなく、夜の大陸の気配 */}
          {[
            "M 220,360 C 420,300 640,320 760,392 C 650,470 420,478 262,436 Z",
            "M 880,286 C 1060,250 1240,290 1300,360 C 1160,420 980,414 874,370 Z",
            "M 1380,400 C 1520,360 1650,392 1700,452 C 1600,500 1450,492 1372,452 Z",
            "M 440,560 C 600,520 780,540 860,596 C 740,650 540,650 428,612 Z",
          ].map((d, i) => (
            <path key={`ln${i}`} d={d} fill="#1A2E52" opacity={0.75} />
          ))}
          {/* 雲の層 */}
          <g opacity={easeOut(seg(f, 6, 40)) * 0.42}>
            {Array.from({ length: 11 }, (_, i) => {
              const cx = 120 + i * 170 + Math.sin((f + i * 60) / 150) * 18;
              const cy = 330 + hash(i * 3.7) * 300;
              const rx = 110 + hash(i * 5.1) * 130;
              return <ellipse key={`cl${i}`} cx={cx} cy={cy} rx={rx} ry={rx * 0.24} fill="#B8CFE8" opacity={0.42} />;
            })}
          </g>
        </g>
        {/* 4つの灯。線はまだ引かない */}
        {LIGHTS.map((L, i) => {
          const [lx, ly] = gpt25(L.deg, -10);
          const up = easeOut(seg(f, L.on, L.on + 16));
          const pulse = 0.85 + Math.sin((f + i * 40) / 22) * 0.15;
          const [mx, my] = [lx, ly + 110];
          return (
            <g key={`lt${i}`}>
              <circle cx={lx} cy={ly} r={66 * up} fill="#FFD68A" opacity={0.14 * pulse} />
              <circle cx={lx} cy={ly} r={30 * up} fill="#FFE2A8" opacity={0.3 * pulse} />
              <circle cx={lx} cy={ly} r={12 * up} fill="#FFF2D4" opacity={0.95} />
              <path d={`M ${lx},${ly} L ${lx},${ly - 150 * up}`} stroke="#FFD68A" strokeWidth={5} opacity={0.3 * up} />
              <Mono25 kind={L.mono} x={mx} y={my} s={0.96} t={up} />
              {/* 名前の札 */}
              <g opacity={up} transform={`translate(${lx} ${my + 96})`}>
                <rect x={-78} y={-6} width={156} height={48} rx={4} fill={SKP.kinari} opacity={0.94} />
                <rect x={-78} y={-6} width={5} height={48} fill={SKP.sabi} />
                <text x={0} y={30} fontFamily={SEKAI_SERIF} fontSize={30} fontWeight={700} fill={SKP.sumi} textAnchor="middle">
                  {L.name}
                </text>
              </g>
            </g>
          );
        })}
        {/* 事件: 5つ目の小さな灯。一度またたいてから安定する */}
        <g opacity={fifthUp}>
          <circle cx={f5x} cy={f5y} r={34} fill="#FFD68A" opacity={0.12 * flick} />
          <circle cx={f5x} cy={f5y} r={15} fill="#FFE2A8" opacity={0.34 * flick} />
          <circle cx={f5x} cy={f5y} r={6.4} fill="#FFF6E2" opacity={flick} />
          <path d={`M ${f5x},${f5y} L ${f5x},${f5y - 72}`} stroke="#FFD68A" strokeWidth={3} opacity={0.3 * flick} />
          <g opacity={flick * 0.95} transform={`translate(${f5x + 108} ${f5y - 40})`}>
            <rect x={-52} y={-24} width={104} height={48} rx={4} fill={SKP.kinari} opacity={0.9} />
            <rect x={-52} y={-24} width={4} height={48} fill={SKP.sabi} />
            <text x={0} y={12} fontFamily={SEKAI_SERIF} fontSize={26} fontWeight={700} fill={SKP.sumi} textAnchor="middle">
              ひとり
            </text>
          </g>
        </g>
      </ColdStage>
    </Cam>
  );
};

// ===================================================================
// #26 図 先にお断りすると、これは国や宗教を同じものとして扱う話ではありません。
// 真上。机の上に別々の物を離して置く。重ねない = 同じにしない、を形で言う。
// 事件: 墨の線が引かれるが、物には触れずに止まる。
// 人は出さない。出すのは物を置く手だけ。
// ===================================================================

const C26 = {
  ban: "#4A3B29", // 作業机の板 (真上から見た木)
  banLit: "#6A5538",
  banDark: "#2E2419",
  kami1: "#2E4C7A", // 注連縄の下の藍の紙
  kami2: "#D8C9A4", // クルアーンの下の生成りの紙
  kami3: "#7A2A2A", // 十字架の下の深い赤の紙
  nawa: "#D8C485", // 注連縄の藁
  nawaKage: "#A8915A",
  shide: "#F4F1E6", // 紙垂 (しで)
  kawa: "#1E5A38", // クルアーンの緑の革
  kawaLit: "#2E7A4C",
  haku: "#D8B44A", // 金の箔押し
  koguchi: "#EFEADC", // 小口 (紙の束の断面)
  juji: "#B8A26A", // 十字架の真鍮
  jujiLit: "#E2CE8E",
  sumi: "#1A1714",
} as const;

const S26: SekaiArt = ({ f }) => {
  const uid = "s26";
  // 事件: 墨の線は引かれるが、物に触れずに止まる
  const line1 = easeOut(seg(f, 36, 62));
  const line2 = easeOut(seg(f, 44, 70));
  const line3 = easeOut(seg(f, 54, 86));
  const hand = 1 - easeOut(seg(f, 20, 48)); // 物を置いた手が引いていく
  return (
    <Cam f={f} from={[0, 0, 1.06]} to={[0, -6, 1.0]} start={0} end={110}>
      <ColdStage
        f={f}
        uid={uid}
        src={[960, 120]}
        srcR={980}
        glow={C.deskLit}
        bg={C26.ban}
        vigColor={C.deskVig}
        mote="#E8DCC6"
        motes={8}
        vig={0.74}
        shafts={false}
      >
        {/* ── 真上から見た作業机の板。木目は縦に走る ── */}
        <rect x={-200} y={0} width={W + 400} height={H} fill={C26.ban} />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={`ita${i}`}>
            <rect x={-200 + i * 220} y={0} width={214} height={H} fill={i % 2 ? C26.banLit : C26.ban} opacity={0.3} />
            <path d={`M ${-200 + i * 220},0 L ${-200 + i * 220},${H}`} stroke={C26.banDark} strokeWidth={5} opacity={0.6} />
            {Array.from({ length: 4 }, (_, k) => (
              <path
                key={k}
                d={`M ${-180 + i * 220 + k * 52},0 C ${-172 + i * 220 + k * 52 + hash(i + k) * 22},360 ${-186 + i * 220 + k * 52},700 ${-178 + i * 220 + k * 52},${H}`}
                fill="none"
                stroke={C26.banDark}
                strokeWidth={2.4}
                opacity={0.3}
              />
            ))}
          </g>
        ))}

        {/* ── ①注連縄の切れ端。藍の紙の上 ── */}
        <g transform="translate(416 560)" opacity={easeOut(seg(f, 2, 24))}>
          <rect x={-182} y={-232} width={364} height={464} fill="#0E1620" opacity={0.4} transform="translate(10 12)" />
          <rect x={-182} y={-232} width={364} height={464} fill={C26.kami1} />
          <rect x={-182} y={-232} width={364} height={464} fill="none" stroke="#1C2E4A" strokeWidth={5} />
          {/* 藁を二本縒った縄 */}
          <path d="M -140,-40 C -60,-96 60,-96 140,-40" fill="none" stroke={C26.nawaKage} strokeWidth={46} strokeLinecap="round" />
          <path d="M -140,-40 C -60,-96 60,-96 140,-40" fill="none" stroke={C26.nawa} strokeWidth={36} strokeLinecap="round" />
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={`yr${i}`}
              d={`M ${-130 + i * 33},${-54 - Math.sin((i / 8) * Math.PI) * 26} l 22,32`}
              stroke={C26.nawaKage}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.85}
            />
          ))}
          {/* 切れ端なので端はほつれている */}
          <path d="M -140,-40 l -26,22 M -144,-30 l -30,10 M -138,-52 l -30,-4" stroke={C26.nawa} strokeWidth={6} strokeLinecap="round" />
          <path d="M 140,-40 l 26,22 M 144,-30 l 30,10 M 138,-52 l 30,-4" stroke={C26.nawa} strokeWidth={6} strokeLinecap="round" />
          {/* 紙垂 (しで) */}
          {[-62, 6, 74].map((sx, i) => (
            <path
              key={`sd${i}`}
              d={`M ${sx},-62 l 40,0 l -8,36 l 12,0 l -14,40 l 12,0 l -20,48 l -34,0 l 8,-124 Z`}
              fill={C26.shide}
              opacity={0.95}
            />
          ))}
        </g>

        {/* ── ②クルアーンの装丁。緑の革・金の箔押し・小口。生成りの紙の上 ── */}
        <g transform="translate(960 560)" opacity={easeOut(seg(f, 8, 32))}>
          <rect x={-182} y={-232} width={364} height={464} fill="#0E1620" opacity={0.4} transform="translate(10 12)" />
          <rect x={-182} y={-232} width={364} height={464} fill={C26.kami2} />
          <rect x={-182} y={-232} width={364} height={464} fill="none" stroke="#B8A880" strokeWidth={5} />
          {/* 小口 (紙の束の断面) が右に見える厚み */}
          <path d="M 108,-166 L 136,-150 L 136,174 L 108,190 Z" fill={C26.koguchi} />
          <path d="M 110,-160 l 24,14 M 110,-140 l 24,14 M 110,-120 l 24,14 M 110,-100 l 24,14 M 110,-80 l 24,14 M 110,-60 l 24,14 M 110,-40 l 24,14 M 110,-20 l 24,14 M 110,0 l 24,14 M 110,20 l 24,14 M 110,40 l 24,14 M 110,60 l 24,14 M 110,80 l 24,14 M 110,100 l 24,14 M 110,120 l 24,14 M 110,140 l 24,14" stroke="#C8C0AC" strokeWidth={2.4} />
          {/* 緑の革の表紙 */}
          <path d="M -118,-178 L 112,-166 L 112,186 L -118,178 Z" fill={C26.kawa} />
          <path d="M -118,-178 L 112,-166 L 112,-120 L -118,-134 Z" fill={C26.kawaLit} opacity={0.4} />
          {/* 金の箔押し。幾何の枠と中央の意匠 */}
          <g stroke={C26.haku} fill="none">
            <rect x={-98} y={-152} width={192} height={320} strokeWidth={4} />
            <rect x={-86} y={-140} width={168} height={296} strokeWidth={2.2} />
            <path d="M -2,-108 l 54,54 l -54,54 l -54,-54 Z" strokeWidth={4} />
            <path d="M -2,-84 l 32,32 l -32,32 l -32,-32 Z" strokeWidth={2.4} />
            <path d="M -70,36 l 136,0 M -70,60 l 136,0" strokeWidth={2.4} />
            <path d="M -2,88 l 40,26 l -40,26 l -40,-26 Z" strokeWidth={3} />
          </g>
          <path d="M -118,-178 L -118,178" stroke="#143E26" strokeWidth={14} />
          <path d="M -124,-170 L -124,170" stroke={C26.haku} strokeWidth={3} opacity={0.6} />
        </g>

        {/* ── ③十字架。深い赤の紙の上 ── */}
        <g transform="translate(1504 560)" opacity={easeOut(seg(f, 14, 40))}>
          <rect x={-182} y={-232} width={364} height={464} fill="#1A0C10" opacity={0.42} transform="translate(10 12)" />
          <rect x={-182} y={-232} width={364} height={464} fill={C26.kami3} />
          <rect x={-182} y={-232} width={364} height={464} fill="none" stroke="#5A1C1C" strokeWidth={5} />
          <g transform="rotate(-4)">
            <path d="M -26,-176 L 26,-176 L 26,-40 L 112,-40 L 112,10 L 26,10 L 26,186 L -26,186 L -26,10 L -112,10 L -112,-40 L -26,-40 Z" fill={C26.juji} />
            <path d="M -26,-176 L 0,-176 L 0,186 L -26,186 Z" fill={C26.jujiLit} opacity={0.55} />
            <path d="M -112,-40 L -112,-20 L 112,-20 L 112,-40 Z" fill={C26.jujiLit} opacity={0.4} />
            <path d="M -26,-176 L 26,-176 L 26,-168 L -26,-168 Z" fill="#8A7748" />
            <circle cx={0} cy={-18} r={11} fill="#8A7748" />
          </g>
        </g>

        {/* ── 墨の線。引かれるが、物には触れずに止まる ── */}
        <g stroke={C26.sumi} strokeLinecap="round" fill="none">
          {/* 物と物の間の縦線。上から引かれて、紙の下端より手前で止まる */}
          <path d={`M 688,236 L 688,${236 + 560 * line1}`} strokeWidth={9} opacity={0.92} />
          <path d={`M 1232,236 L 1232,${236 + 560 * line2}`} strokeWidth={9} opacity={0.92} />
          {/* 左の余白から横へ伸びる線。紙に触れる手前でぴたりと止まる */}
          <path d={`M 56,912 L ${56 + 164 * line3},912`} strokeWidth={11} opacity={0.9} />
        </g>
        {/* 止まった筆先の墨だまり */}
        <g opacity={line3}>
          <circle cx={56 + 164 * line3} cy={912} r={11} fill={C26.sumi} opacity={0.85} />
        </g>
        <g opacity={line1}>
          <circle cx={688} cy={236 + 560 * line1} r={9} fill={C26.sumi} opacity={0.8} />
        </g>

        {/* ── 物を置いた手。真上から見た手の甲。置き終えて引いていく ── */}
        <g opacity={hand} transform={`translate(${1512 + (1 - hand) * 120} ${-40 - (1 - hand) * 150}) rotate(6)`}>
          <path d="M -96,470 C -124,330 -116,180 -78,60 C -40,-56 70,-58 104,56 C 140,178 146,330 120,470 Z" fill={C23.hada} />
          <path d="M -78,60 C -40,-56 70,-58 104,56 C 60,96 -34,98 -78,60 Z" fill={C23.hadaLit} opacity={0.5} />
          {/* 指 */}
          {[-62, -18, 26, 70].map((fx2, i) => (
            <g key={`fg${i}`}>
              <path
                d={`M ${fx2},74 C ${fx2 - 6},${10 - i * 8} ${fx2 + 2},${-54 - (i === 1 || i === 2 ? 28 : 0)} ${fx2 + 18},${-62 - (i === 1 || i === 2 ? 28 : 0)} C ${fx2 + 34},${-54 - (i === 1 || i === 2 ? 28 : 0)} ${fx2 + 36},${10 - i * 8} ${fx2 + 32},74 Z`}
                fill={C23.hada}
              />
              <path
                d={`M ${fx2 + 4},${-46 - (i === 1 || i === 2 ? 28 : 0)} l 24,0`}
                stroke={C23.hadaKage}
                strokeWidth={5}
                opacity={0.55}
              />
            </g>
          ))}
          <path d="M -108,230 C -60,206 60,206 112,232" fill="none" stroke={C23.hadaKage} strokeWidth={5} opacity={0.42} />
          <path d="M 104,56 C 128,150 134,300 120,470" fill="none" stroke={C23.hadaKage} strokeWidth={7} opacity={0.4} />
          {/* 袖口 */}
          <path d="M -104,420 L 126,420 L 140,540 L -120,540 Z" fill="#3A4350" />
        </g>
      </ColdStage>
    </Cam>
  );
};

// ===================================================================
// #27 並 人間が負けを受け入れるときの「型」を比べる話です。
// 4つの「負けの受け入れ方」を型紙 (かたがみ) として並べる。
// 1枚目=マイクの形 (玉音放送) / 2枚目=杯の形 (毒杯) / 3枚目=刀の形 (忠臣蔵) /
// 4枚目=空白 (2026年)。事件: 4枚目の型紙だけ、まだ切られていない。
// ===================================================================

const C27 = {
  dai: "#3A2E22", // 作業台
  daiLit: "#54422E",
  daiKizu: "#241B12", // 作業台の傷
  washi: "#EDE4CE", // 型紙の和紙 (渋を引いた色)
  washiLit: "#F8F2E2",
  washiKage: "#C9BCA0",
  washiEdge: "#A89878",
  ana: "#1A1410", // 切り抜いた穴 = 台が見える
  kiri: "#6B4A2A", // 錐の柄
  kiriHa: "#A8B2BA", // 錐の刃
  ito: "#B5322A", // 糸
  sumi: "#1A1714",
} as const;

// 型紙1枚。切り抜きの形を evenodd で穴にする。穴の中は作業台が見える。
const Kata27: React.FC<{
  x: number;
  y: number;
  hole: string | null;
  label: string;
  t: number;
  tilt: number;
  seed: number;
}> = ({ x, y, hole, label, t, tilt, seed }) => {
  const PW = 356;
  const PH = 520;
  const outer = `M ${-PW / 2},${-PH / 2} L ${PW / 2},${-PH / 2} L ${PW / 2},${PH / 2} L ${-PW / 2},${PH / 2} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`} opacity={t}>
      {/* 台に落ちる影 */}
      <rect x={-PW / 2 + 12} y={-PH / 2 + 16} width={PW} height={PH} fill="#140F0A" opacity={0.42} />
      {/* 和紙の地。穴があれば evenodd で抜く */}
      <path d={hole ? `${outer} ${hole}` : outer} fillRule="evenodd" fill={C27.washi} />
      {/* 和紙の縁の毛羽と渋の濃淡 */}
      <path d={outer} fill="none" stroke={C27.washiEdge} strokeWidth={4} />
      <path
        d={`M ${-PW / 2},${-PH / 2} L ${PW / 2},${-PH / 2} L ${PW / 2},${-PH / 2 + 66} L ${-PW / 2},${-PH / 2 + 50} Z`}
        fill={C27.washiLit}
        opacity={0.5}
      />
      <path
        d={`M ${-PW / 2},${PH / 2 - 70} L ${PW / 2},${PH / 2 - 54} L ${PW / 2},${PH / 2} L ${-PW / 2},${PH / 2} Z`}
        fill={C27.washiKage}
        opacity={0.5}
      />
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={`su${i}`}
          d={`M ${-PW / 2 + 8},${-PH / 2 + 44 + i * 68} L ${PW / 2 - 8},${-PH / 2 + 38 + i * 68}`}
          stroke={C27.washiEdge}
          strokeWidth={2}
          opacity={0.3}
        />
      ))}
      {/* 切り口の内側に落ちる影 (紙の厚みがある証拠) */}
      {hole && <path d={hole} fill="none" stroke={C27.washiEdge} strokeWidth={5} opacity={0.9} />}
      {/* 札。墨で型の名前 */}
      <g>
        <rect x={-74} y={PH / 2 - 62} width={148} height={46} rx={3} fill={C27.washiLit} opacity={0.9} />
        <rect x={-74} y={PH / 2 - 62} width={5} height={46} fill={SKP.sabi} />
        <text
          x={2}
          y={PH / 2 - 28}
          fontFamily={SEKAI_SERIF}
          fontSize={28}
          fontWeight={700}
          fill={C27.sumi}
          textAnchor="middle"
        >
          {label}
        </text>
      </g>
      {/* 錐で留めた穴と糸 */}
      <circle cx={-PW / 2 + 34} cy={-PH / 2 + 30} r={7} fill={C27.ana} />
      <circle cx={PW / 2 - 34} cy={-PH / 2 + 30} r={7} fill={C27.ana} />
      <path
        d={`M ${-PW / 2 + 34},${-PH / 2 + 30} C ${-60},${-PH / 2 + 10 + hash(seed) * 16} ${60},${-PH / 2 + 10} ${PW / 2 - 34},${-PH / 2 + 30}`}
        fill="none"
        stroke={C27.ito}
        strokeWidth={4}
      />
    </g>
  );
};

const S27: SekaiArt = ({ f }) => {
  const uid = "s27";
  // 事件: 4枚目だけ、まだ切られていない (切り口の下書きの線だけがある)
  const draft = easeOut(seg(f, 54, 86));
  const holeMic =
    "M -56,-150 a 56,56 0 1 1 112,0 l 0,56 a 56,56 0 1 1 -112,0 Z" +
    " M -12,-26 l 24,0 l 0,96 l 44,0 l 0,30 l -112,0 l 0,-30 l 44,0 Z";
  const holeCup =
    "M -104,-106 l 208,0 l -22,96 a 82,82 0 0 1 -164,0 Z" +
    " M -16,-6 l 32,0 l 0,98 l 56,0 l 0,30 l -144,0 l 0,-30 l 56,0 Z";
  const holeSword =
    "M -16,-214 l 32,0 l 10,268 l -52,0 Z" +
    " M -96,54 l 192,0 l 0,26 l -192,0 Z" +
    " M -22,80 l 44,0 l -6,142 l -32,0 Z";
  return (
    <Cam f={f} from={[-14, 0, 1.04]} to={[14, -6, 1.0]} start={0} end={112}>
      <ColdStage
        f={f}
        uid={uid}
        src={[960, 70]}
        srcR={1000}
        glow={C.deskLit}
        bg={C27.dai}
        vigColor={C.deskVig}
        mote="#E8DCC6"
        motes={10}
        vig={0.78}
        shafts={false}
      >
        {/* ── 作業台。傷が無数に走っている ── */}
        <rect x={-200} y={0} width={W + 400} height={H} fill={C27.dai} />
        <rect x={-200} y={0} width={W + 400} height={120} fill="#2A2118" />
        {Array.from({ length: 11 }, (_, i) => (
          <path
            key={`dm${i}`}
            d={`M -200,${120 + i * 92} C 420,${110 + i * 92 + hash(i) * 20} 1240,${132 + i * 92 - hash(i * 3) * 20} ${W + 200},${118 + i * 92}`}
            fill="none"
            stroke={C27.daiLit}
            strokeWidth={3}
            opacity={0.22}
          />
        ))}
        {/* 傷 */}
        {Array.from({ length: 34 }, (_, i) => {
          const sx = -60 + hash(i * 2.3) * 2000;
          const sy = 140 + hash(i * 5.9) * 880;
          const ln = 40 + hash(i * 7.1) * 240;
          const an = hash(i * 3.7) * 70 - 35;
          return (
            <path
              key={`kz${i}`}
              d={`M ${sx},${sy} l ${ln * Math.cos((an * Math.PI) / 180)},${ln * Math.sin((an * Math.PI) / 180)}`}
              stroke={C27.daiKizu}
              strokeWidth={2 + hash(i * 1.3) * 3}
              opacity={0.5}
              strokeLinecap="round"
            />
          );
        })}
        {/* 深い切り込みの傷 (型紙を切るときに台まで入った跡) */}
        {[[300, 880], [880, 300], [1400, 920], [640, 180]].map(([kx, ky], i) => (
          <path
            key={`kz2${i}`}
            d={`M ${kx},${ky} l ${120 + i * 40},${18 - i * 10}`}
            stroke="#15100A"
            strokeWidth={7}
            opacity={0.7}
            strokeLinecap="round"
          />
        ))}

        {/* ── 型紙4枚。切り抜きの形がそれぞれ違う ── */}
        <Kata27 x={330} y={520} hole={holeMic} label="玉音" t={easeOut(seg(f, 2, 26))} tilt={-3} seed={1.2} />
        <Kata27 x={740} y={548} hole={holeCup} label="毒杯" t={easeOut(seg(f, 10, 34))} tilt={2} seed={3.4} />
        <Kata27 x={1150} y={520} hole={holeSword} label="忠臣蔵" t={easeOut(seg(f, 18, 42))} tilt={-2} seed={5.6} />
        {/* 4枚目。まだ切られていない = 穴が無い。下書きの線だけが引かれていく */}
        <g>
          <Kata27 x={1562} y={552} hole={null} label="二〇二六" t={easeOut(seg(f, 26, 50))} tilt={3} seed={7.8} />
          <g transform="translate(1562 552) rotate(3)" opacity={draft}>
            <path
              d={`M -92,-150 L ${-92 + 184 * draft},-150`}
              stroke={C27.sumi}
              strokeWidth={4}
              strokeDasharray="14 12"
              opacity={0.6}
            />
            <path
              d={`M -92,-150 L -92,${-150 + 240 * draft}`}
              stroke={C27.sumi}
              strokeWidth={4}
              strokeDasharray="14 12"
              opacity={0.6}
            />
            <text x={0} y={60} fontFamily={SEKAI_SERIF} fontSize={46} fill={C27.washiEdge} textAnchor="middle" opacity={0.75}>
              ？
            </text>
          </g>
        </g>

        {/* ── 型紙を留めた錐 (きり) と糸 ── */}
        <g transform="translate(950 962) rotate(-26)" opacity={easeOut(seg(f, 30, 56))}>
          <path d="M 0,0 L 0,-62" stroke={C27.kiriHa} strokeWidth={9} strokeLinecap="round" />
          <path d="M 0,0 L -5,34 L 5,34 Z" fill="#CFD8DE" />
          <rect x={-28} y={-200} width={56} height={142} rx={16} fill={C27.kiri} />
          <rect x={-28} y={-200} width={20} height={142} rx={10} fill="#8A6236" opacity={0.65} />
          <path d="M -24,-82 l 48,0" stroke="#3E2A16" strokeWidth={5} />
          <ellipse cx={0} cy={-200} rx={28} ry={11} fill="#54381C" />
        </g>
        {/* 台の上に残った糸の束 */}
        <g opacity={easeOut(seg(f, 34, 62))}>
          <path d="M 480,978 C 560,938 660,1006 744,956" fill="none" stroke={C27.ito} strokeWidth={5} />
          <path d="M 486,996 C 574,956 668,1024 752,974" fill="none" stroke={C27.ito} strokeWidth={4} opacity={0.8} />
          <ellipse cx={444} cy={990} rx={44} ry={28} fill={C27.ito} opacity={0.9} />
          <ellipse cx={444} cy={990} rx={44} ry={28} fill="none" stroke="#7E1F19" strokeWidth={4} />
          <path d="M 418,978 C 440,968 462,990 468,1004" fill="none" stroke="#7E1F19" strokeWidth={3} />
        </g>
      </ColdStage>
    </Cam>
  );
};

// ===================================================================
// #28 図 そもそも、今どうなってるんだっけ？ (反応・通知カードが出る)
// #13 #24 と同じ机の型。3枚で1組にする。
// 事件: 付箋が1枚はがれて落ちる。
// ===================================================================

const S28: SekaiArt = ({ f }) => {
  const uid = "s28";
  // 事件: 付箋が1枚はがれて落ちる
  const peel = easeOut(seg(f, 48, 92));
  const fall = peel * peel;
  return (
    <Cam f={f} from={[8, -6, 1.02]} to={[-10, 4, 1.06]} start={0} end={106}>
      <Tsukue24 f={f} uid={uid}>
        {/* ── ノート。時系列を書きかけたページ ── */}
        <g transform="translate(880 650) rotate(-2)">
          <path d="M -620,-390 L 610,-390 L 650,400 L -660,400 Z" fill="#C8C2B2" opacity={0.5} />
          <path d="M -610,-382 L 0,-382 L 0,392 L -644,392 Z" fill={C24.noteShade} />
          <path d="M 0,-382 L 606,-382 L 640,392 L 0,392 Z" fill={C24.note} />
          {/* リング */}
          {Array.from({ length: 15 }, (_, i) => (
            <g key={`rg${i}`}>
              <path d={`M -10,${-368 + i * 54} a 17,17 0 1 0 14,0`} fill="none" stroke={C24.ring} strokeWidth={8} />
              <circle cx={-3} cy={-368 + i * 54} r={7} fill="#2A2E33" opacity={0.6} />
            </g>
          ))}
          {/* 左ページ。縦に引いた時系列の軸 */}
          <path d="M -470,-330 L -470,350" stroke={C24.sumi} strokeWidth={7} opacity={0.6} />
          {Array.from({ length: 8 }, (_, i) => {
            const yy = -300 + i * 86;
            const written = i < 4; // 4行目から先は日付だけ書かれて中身が空
            return (
              <g key={`tl${i}`}>
                <circle cx={-470} cy={yy} r={10} fill={written ? C24.sumi : "none"} stroke={C24.sumi} strokeWidth={5} opacity={0.7} />
                {/* 日付。書かれている */}
                <text x={-446} y={yy + 10} fontFamily={SEKAI_SERIF} fontSize={30} fontWeight={700} fill={C24.sumi} opacity={0.82}>
                  {["一月二日", "一月九日", "一月十七日", "二月一日", "二月十日", "二月十九日", "二月二十四日", "二月二十八日"][i]}
                </text>
                {/* 中身。書かれているのは4行目まで */}
                {written ? (
                  <path
                    d={`M -240,${yy + 4} l ${120 + hash(i * 3.3) * 110},0`}
                    stroke={C24.sumi}
                    strokeWidth={6}
                    opacity={0.45}
                    strokeLinecap="round"
                  />
                ) : (
                  <path d={`M -240,${yy + 14} l 180,0`} stroke={C24.rule} strokeWidth={4} opacity={0.9} strokeDasharray="22 16" />
                )}
              </g>
            );
          })}
          {/* 右ページの罫と、書きかけの走り書き */}
          {Array.from({ length: 13 }, (_, i) => (
            <path key={`rr${i}`} d={`M 36,${-320 + i * 56} L ${596 + i},${-320 + i * 56}`} stroke={C24.rule} strokeWidth={2.6} opacity={0.75} />
          ))}
          <g opacity={easeOut(seg(f, 8, 36))}>
            <text x={52} y={-290} fontFamily={SEKAI_SERIF} fontSize={62} fontWeight={700} fill={C24.sumi}>
              いま
            </text>
            <path d="M 50,-252 L 300,-250" stroke={WP.inkRed} strokeWidth={8} opacity={0.8} />
            <path d="M 52,-200 l 400,2 M 52,-144 l 300,2 M 52,-88 l 440,2" stroke={C24.sumi} strokeWidth={6} opacity={0.42} strokeLinecap="round" />
            <path d="M 52,-32 l 180,2" stroke={C24.sumi} strokeWidth={6} opacity={0.26} strokeLinecap="round" />
          </g>
          {/* 書き終わっていない行に残った鉛筆の点 */}
          <circle cx={244} cy={-30} r={6} fill={C24.sumi} opacity={0.5} />
        </g>

        {/* ── 付箋。ノートの右端に貼ってある ── */}
        <g opacity={easeOut(seg(f, 14, 38))}>
          <g transform="translate(1486 418) rotate(5)">
            <rect x={-82} y={-82} width={164} height={164} fill={C24.fusen} />
            <rect x={-82} y={-82} width={164} height={26} fill="#D8B83A" opacity={0.6} />
            <path d="M -58,-30 l 110,0 M -58,2 l 86,0 M -58,34 l 100,0" stroke="#6E5A18" strokeWidth={6} />
          </g>
          <g transform="translate(1534 606) rotate(-7)">
            <rect x={-82} y={-82} width={164} height={164} fill={C24.fusen2} />
            <rect x={-82} y={-82} width={164} height={26} fill="#7EB46A" opacity={0.6} />
            <path d="M -58,-30 l 96,0 M -58,2 l 110,0" stroke="#355A28" strokeWidth={6} />
          </g>
        </g>
        {/* 事件: 1枚だけはがれて落ちる */}
        <g
          opacity={easeOut(seg(f, 20, 42))}
          transform={`translate(${1498 + fall * 60} ${794 + fall * 300}) rotate(${-6 - peel * 46})`}
        >
          <rect x={-82} y={-82} width={164} height={164} fill="#E8A4C0" />
          <rect x={-82} y={-82} width={164} height={26} fill="#D086A4" opacity={0.6} />
          <path d="M -58,-30 l 104,0 M -58,2 l 80,0 M -58,34 l 96,0" stroke="#7E3A54" strokeWidth={6} />
          {/* はがれた糊の跡 */}
          <path d={`M -82,-82 C ${-40 + peel * 20},${-96 - peel * 20} ${40 - peel * 10},${-96 - peel * 14} 82,-82`} fill="none" stroke="#D086A4" strokeWidth={5} opacity={0.6} />
        </g>
        {/* 貼ってあった跡 */}
        <rect x={1416} y={712} width={164} height={164} fill="#C8B79A" opacity={easeOut(seg(f, 56, 84)) * 0.4} transform="rotate(-6 1498 794)" />

        {/* ── スマホのニュース一覧。見出しは日本語 ── */}
        <g transform="translate(316 700) rotate(-9)" opacity={easeOut(seg(f, 4, 30))}>
          <rect x={-152} y={-312} width={304} height={624} rx={34} fill="#0E1116" />
          <rect x={-152} y={-312} width={304} height={624} rx={34} fill="none" stroke="#3A424C" strokeWidth={5} />
          <rect x={-136} y={-282} width={272} height={566} rx={10} fill="#EDF1F5" />
          {/* 上のバー */}
          <rect x={-136} y={-282} width={272} height={44} fill="#1E4C7A" />
          <text x={-120} y={-250} fontFamily={SEKAI_FONT} fontSize={23} fontWeight={700} fill="#EDF1F5">
            ニュース
          </text>
          <circle cx={108} cy={-260} r={9} fill={WP.alert} />
          {/* 見出しの行 */}
          {["海峡 通航再開のめど立たず", "追加制裁 対象に日本人", "政府 緊急会合を開催", "原油 一時 ９％上昇", "二十八日 期限と通告"].map((t, i) => (
            <g key={`nw${i}`} opacity={easeOut(seg(f, 10 + i * 5, 30 + i * 5))}>
              <rect x={-136} y={-230 + i * 108} width={272} height={104} fill={i % 2 ? "#E2E8EE" : "#EDF1F5"} />
              <rect x={30} y={-218 + i * 108} width={92} height={80} fill="#9AA8B4" />
              <path d={`M 40,${-170 + i * 108} C 58,${-196 + i * 108} 80,${-196 + i * 108} 112,${-156 + i * 108} L 40,${-150 + i * 108} Z`} fill="#6E8294" />
              <text x={-124} y={-194 + i * 108} fontFamily={SEKAI_FONT} fontSize={19} fontWeight={700} fill="#1A222C">
                {t.slice(0, 9)}
              </text>
              <text x={-124} y={-168 + i * 108} fontFamily={SEKAI_FONT} fontSize={19} fontWeight={700} fill="#1A222C">
                {t.slice(9)}
              </text>
              <text x={-124} y={-140 + i * 108} fontFamily={SEKAI_FONT} fontSize={15} fill="#6E7A86">
                {`${2 + i}時間前`}
              </text>
            </g>
          ))}
          <rect x={-40} y={272} width={80} height={8} rx={4} fill="#9AA4AC" />
        </g>
      </Tsukue24>
    </Cam>
  );
};

// ===================================================================
// #29 図 60秒でおさらいします。
// 手元の寄り。時間を物で出す。ストップウォッチ。デジタルの数字では済ませない。
// 事件: 秒針が0から動き出す。
// ===================================================================

const C29 = {
  air: "#1E2A34",
  bodySt: "#B8C2CA", // ストップウォッチのニッケル胴
  bodyLit: "#E4EDF3",
  bodyDark: "#6E7C88",
  ban: "#F4F1E6", // 文字盤
  banKage: "#D4CFC0",
  me: "#2A2A28", // 目盛り
  shin: "#1A1E24", // 針
  byou: "#B5322A", // 秒針 (朱)
  ryuzu: "#9AA6B0", // 竜頭
  tsukue: "#4A4036",
  tsukueEdge: "#2C241C",
} as const;

const S29: SekaiArt = ({ f }) => {
  const uid = "s29";
  const RX = 940;
  const RY = 560;
  const R = 318;
  const start = 46; // 事件: 秒針が0から動き出す
  const sec = Math.max(0, (f - start) / 30);
  const ang = sec * 6; // 1秒 = 6度
  const press = easeOut(seg(f, start - 10, start)) - easeOut(seg(f, start, start + 8));
  return (
    <Cam f={f} from={[0, 6, 1.0]} to={[-8, -4, 1.05]} start={0} end={110}>
      <ColdStage
        f={f}
        uid={uid}
        src={[1380, 110]}
        srcR={900}
        glow={C.glassLit}
        bg={C29.air}
        vigColor="#0C1218"
        mote="#DCEAF5"
        motes={12}
        vig={0.78}
        shafts={false}
      >
        {/* ── 机。手前の縁が画面の下を横切る ── */}
        <rect x={-200} y={0} width={W + 400} height={H} fill={C29.air} />
        <path d={`M -200,470 L ${W + 200},470 L ${W + 200},${H} L -200,${H} Z`} fill={C29.tsukue} />
        <path d={`M -200,470 L ${W + 200},470 L ${W + 200},512 L -200,512 Z`} fill="#605444" opacity={0.7} />
        <path d={`M -200,1006 L ${W + 200},1006 L ${W + 200},${H} L -200,${H} Z`} fill={C29.tsukueEdge} />
        <path d={`M -200,1006 L ${W + 200},1006 L ${W + 200},1018 L -200,1018 Z`} fill="#6A5C4C" opacity={0.6} />
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={`mk${i}`}
            d={`M -200,${540 + i * 62} C 500,${528 + i * 62 + hash(i) * 18} 1300,${552 + i * 62 - hash(i * 3) * 18} ${W + 200},${536 + i * 62}`}
            fill="none"
            stroke={C29.tsukueEdge}
            strokeWidth={3}
            opacity={0.26}
          />
        ))}

        {/* ── めくる前の資料の束。左に積んである ── */}
        <g opacity={easeOut(seg(f, 4, 30))}>
          {Array.from({ length: 13 }, (_, i) => (
            <g key={`sr${i}`} transform={`translate(${280 + i * 2.4} ${900 - i * 17}) rotate(${hash(i * 2.7) * 3 - 1.5})`}>
              <rect x={-260} y={-108} width={520} height={216} rx={3} fill={i === 12 ? C.paperHi : C.paperLow} />
              <rect x={-260} y={-108} width={520} height={216} rx={3} fill="none" stroke={C.paperEdge} strokeWidth={2.4} />
            </g>
          ))}
          {/* 一番上の紙だけ中身が見える */}
          <g transform="translate(310 696) rotate(1.4)">
            <Gyo23 x={-230} y={-60} w={300} size={17} seed={71} fill={C.gyo} />
            <Gyo23 x={-230} y={-20} w={420} size={15} seed={73} fill={C.gyo} />
            <Gyo23 x={-230} y={14} w={380} size={15} seed={77} fill={C.gyo} />
            <Gyo23 x={-230} y={48} w={300} size={15} seed={79} fill={C.gyo} />
            <path d="M 110,-62 l 120,0 l 0,86 l -120,0 Z" fill="none" stroke={C.ruleLine} strokeWidth={4} />
            <path d="M 120,-20 l 100,0 M 120,4 l 80,0" stroke={C.gyo} strokeWidth={5} opacity={0.7} />
          </g>
          {/* 束の影 */}
          <ellipse cx={320} cy={916} rx={300} ry={40} fill="#120E0A" opacity={0.45} />
        </g>

        {/* ── ストップウォッチ。竜頭・秒針・ガラスの反射・60の目盛り ── */}
        <g transform={`translate(${RX} ${RY})`}>
          <ellipse cx={14} cy={R + 150} rx={R + 40} ry={60} fill="#0E1318" opacity={0.5} />
          {/* 竜頭 (押し込まれる) */}
          <g transform={`translate(0 ${-R - 54 + press * 14})`}>
            <rect x={-30} y={-6} width={60} height={70} rx={8} fill={C29.ryuzu} />
            <rect x={-46} y={-62} width={92} height={64} rx={16} fill={C29.bodySt} />
            <rect x={-46} y={-62} width={92} height={20} rx={10} fill={C29.bodyLit} />
            {Array.from({ length: 9 }, (_, i) => (
              <path key={`rz${i}`} d={`M ${-40 + i * 10},-58 l 0,56`} stroke={C29.bodyDark} strokeWidth={3.4} opacity={0.8} />
            ))}
            {/* 吊り環 */}
            <path d="M 0,-62 a 30,30 0 1 0 0.1,0" fill="none" stroke={C29.bodySt} strokeWidth={13} />
          </g>
          {/* 胴 */}
          <circle cx={0} cy={0} r={R + 34} fill={C29.bodyDark} />
          <circle cx={0} cy={0} r={R + 24} fill={C29.bodySt} />
          <circle cx={0} cy={0} r={R + 24} fill="none" stroke={C29.bodyLit} strokeWidth={8} opacity={0.6} />
          <path d={`M ${-R - 18},-40 A ${R + 24},${R + 24} 0 0 1 ${-30},${-R - 18}`} fill="none" stroke={C29.bodyLit} strokeWidth={14} opacity={0.75} />
          {/* 文字盤 */}
          <circle cx={0} cy={0} r={R} fill={C29.ban} />
          <circle cx={0} cy={0} r={R} fill="none" stroke={C29.banKage} strokeWidth={6} />
          <circle cx={0} cy={0} r={R - 26} fill="none" stroke={C29.me} strokeWidth={3} opacity={0.5} />
          {/* 60の目盛り。5ごとに太く長く */}
          {Array.from({ length: 60 }, (_, i) => {
            const a = ((i * 6 - 90) * Math.PI) / 180;
            const big = i % 5 === 0;
            const r0 = R - (big ? 54 : 32);
            const r1 = R - 14;
            return (
              <path
                key={`tk${i}`}
                d={`M ${Math.cos(a) * r0},${Math.sin(a) * r0} L ${Math.cos(a) * r1},${Math.sin(a) * r1}`}
                stroke={big ? C29.me : "#6A6A64"}
                strokeWidth={big ? 9 : 4}
              />
            );
          })}
          {/* 5秒ごとの数字 */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = ((i * 30 - 90) * Math.PI) / 180;
            const rr = R - 96;
            return (
              <text
                key={`nm${i}`}
                x={Math.cos(a) * rr}
                y={Math.sin(a) * rr + 18}
                fontFamily={SEKAI_FONT}
                fontSize={52}
                fontWeight={700}
                fill={C29.me}
                textAnchor="middle"
              >
                {i === 0 ? "60" : i * 5}
              </text>
            );
          })}
          {/* 小さい分の盤 */}
          <g transform="translate(0 150)">
            <circle cx={0} cy={0} r={74} fill={C29.banKage} opacity={0.5} />
            <circle cx={0} cy={0} r={74} fill="none" stroke={C29.me} strokeWidth={4} />
            {Array.from({ length: 15 }, (_, i) => {
              const a = ((i * 24 - 90) * Math.PI) / 180;
              return (
                <path
                  key={`mt${i}`}
                  d={`M ${Math.cos(a) * 56},${Math.sin(a) * 56} L ${Math.cos(a) * 68},${Math.sin(a) * 68}`}
                  stroke={C29.me}
                  strokeWidth={i % 5 === 0 ? 5 : 3}
                />
              );
            })}
            <path d="M 0,0 L 0,-44" stroke={C29.shin} strokeWidth={6} strokeLinecap="round" transform={`rotate(${sec * 0.4})`} />
            <circle cx={0} cy={0} r={8} fill={C29.shin} />
          </g>
          {/* 事件: 秒針が0から動き出す */}
          <g transform={`rotate(${ang})`}>
            <path d={`M 0,46 L 0,${-R + 24}`} stroke={C29.byou} strokeWidth={10} strokeLinecap="round" />
            <path d={`M 0,${-R + 24} l -11,34 l 22,0 Z`} fill={C29.byou} />
            <path d="M 0,46 L 0,78" stroke={C29.byou} strokeWidth={14} strokeLinecap="round" />
          </g>
          <circle cx={0} cy={0} r={18} fill={C29.shin} />
          <circle cx={0} cy={0} r={7} fill={C29.byou} />
          {/* ガラスの反射。斜めの帯 */}
          <path
            d={`M ${-R + 20},${R - 110} C ${-R + 100},${-R + 170} ${-R + 240},${-R + 40} ${-R + 330},${-R + 10} L ${-R + 180},${R - 40} Z`}
            fill="#FFFFFF"
            opacity={0.16}
          />
          <path d={`M ${-R + 60},${-R + 150} C ${-R + 130},${-R + 70} ${-R + 210},${-R + 30} ${-R + 280},${-R + 16}`} fill="none" stroke="#FFFFFF" strokeWidth={10} opacity={0.3} />
          <circle cx={0} cy={0} r={R + 24} fill="none" stroke="#0E1318" strokeWidth={4} opacity={0.5} />
        </g>

        {/* ── ストップウォッチを押す指 (竜頭の上。顔は出さない) ── */}
        <g opacity={easeOut(seg(f, 20, 40))} transform={`translate(${RX + 10} ${RY - R - 190 + press * 16})`}>
          <path d="M -58,-200 C -74,-120 -70,-56 -46,-18 C -16,26 48,26 76,-20 C 98,-58 100,-124 86,-200 Z" fill={C23.hada} />
          <path d="M -46,-18 C -16,26 48,26 76,-20 C 44,-4 -14,-4 -46,-18 Z" fill={C23.hadaKage} opacity={0.45} />
          <path d="M -24,-10 C -10,22 36,24 54,-12" fill="none" stroke={C23.hadaKage} strokeWidth={5} opacity={0.6} />
          <path d="M 20,-4 C 24,-40 24,-90 18,-140" fill="none" stroke={C23.hadaKage} strokeWidth={4} opacity={0.3} />
          <path d="M -62,-200 L 90,-200 L 104,-290 L -78,-290 Z" fill="#3A4350" />
          <path d="M -62,-200 L 90,-200 L 92,-214 L -64,-214 Z" fill="#2A3240" />
        </g>

        {/* ── 机の縁に置かれた一枚。これからめくる ── */}
        <g opacity={easeOut(seg(f, 34, 60))} transform="translate(1596 960) rotate(7)">
          <rect x={-230} y={-96} width={460} height={192} rx={3} fill={C.paperHi} />
          <rect x={-230} y={-96} width={460} height={192} rx={3} fill="none" stroke={C.paperEdge} strokeWidth={3} />
          <Gyo23 x={-204} y={-44} w={380} size={16} seed={83} fill={C.gyo} />
          <Gyo23 x={-204} y={-6} w={320} size={16} seed={89} fill={C.gyo} />
          <path d="M -204,36 l 180,0" stroke={WP.inkRed} strokeWidth={7} />
          <path d="M 230,-96 L 150,-82 L 176,-12 Z" fill={C.paperLow} />
        </g>
      </ColdStage>
    </Cam>
  );
};

// ===================================================================
// #30 図 2月28日。(全景可)
// 日付。#9 #15 と同じ暦の型で続ける。2026年2月のカレンダー。
// ペルシア暦を併記する (1404年バフマン/エスファンド。2月28日 = 9エスファンド)。
// 事件: 朱の丸が引かれた瞬間、紙の外が暗くなる。
// ===================================================================

const C30 = {
  kami: "#F6F2E6", // カレンダーの紙
  kamiKage: "#DCD5C2",
  kamiEdge: "#B9B09A",
  sumi: "#1A1714",
  usu: "#8A8476", // 平日の薄い字
  nichi: "#B5322A", // 日曜の朱
  do: "#2E5A8A", // 土曜の藍
  shu: "#C8362A", // 朱の丸
  pers: "#6E8A7A", // ペルシア暦の併記 (緑寄りの灰)
  stand: "#2A3440", // 机のスタンド
  pen: "#1C2026",
  penKin: "#B9A24A",
} as const;

const S30: SekaiArt = ({ f }) => {
  const uid = "s30";
  // 2026年2月。2月1日は日曜。28日まで = 7列×4行にぴたりと収まる
  const PX = 236;
  const PY = 132;
  const PW = 1448;
  const PH = 834;
  const CL = PX + 58;
  const CW = 190;
  const CT = PY + 262;
  const CH = 136;
  // ペルシア暦。1月21日=バフマン1、2月20日=エスファンド1
  const pday = (d: number) => (d <= 19 ? `${d + 11} Bah` : `${d - 19} Esf`);
  const maru = easeOut(seg(f, 42, 70)); // 事件: 朱の丸が引かれる
  const dark = easeOut(seg(f, 56, 92)); // 引かれた瞬間、紙の外が暗くなる
  const mx = CL + 6 * CW + CW / 2;
  const my = CT + 3 * CH + CH / 2;
  return (
    <Cam f={f} from={[0, 0, 1.03]} to={[0, -8, 1.0]} start={0} end={110}>
      <ColdStage
        f={f}
        uid={uid}
        src={[1560, 60]}
        srcR={880}
        glow={C.newsLit}
        bg={C.newsBg}
        vigColor={C.newsVig}
        mote="#A8C8E0"
        motes={10}
        vig={0.8}
        shafts={false}
      >
        {/* ── 奥。報道の青い部屋 ── */}
        <rect x={-200} y={0} width={W + 400} height={H} fill={C.newsBg} />
        <rect x={-200} y={0} width={W + 400} height={96} fill="#0C1A2C" />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={`nr${i}`} d={`M -200,${150 + i * 150} L ${W + 200},${150 + i * 150}`} stroke={C.newsRule} strokeWidth={3} opacity={0.14} />
        ))}
        {/* 机のスタンドの光。右上から紙を斜めに照らす一灯 */}
        <g opacity={easeOut(seg(f, 0, 24))}>
          <path d="M 1830,30 L 1846,420" stroke={C30.stand} strokeWidth={18} />
          <path d="M 1700,24 C 1760,-44 1900,-44 1952,24 Z" fill="#1E2832" />
          <path d="M 1712,28 C 1768,-32 1894,-32 1940,28 Z" fill={C.deskLit} opacity={0.9} />
          <path d="M 1712,28 L 1360,1080 L 1960,1080 L 1940,28 Z" fill={C.deskLit} opacity={0.07} />
        </g>

        {/* ── カレンダーの紙 ── */}
        <g>
          <rect x={PX + 16} y={PY + 20} width={PW} height={PH} fill="#050C14" opacity={0.55} />
          <rect x={PX} y={PY} width={PW} height={PH} fill={C30.kami} />
          <rect x={PX} y={PY} width={PW} height={PH} fill="none" stroke={C30.kamiEdge} strokeWidth={5} />
          {/* 紙の繊維の濃淡 (紙目は InkLayer が掛けるので、ここは大きな濃淡だけ) */}
          <path d={`M ${PX},${PY} L ${PX + PW},${PY} L ${PX + PW},${PY + 120} L ${PX},${PY + 150} Z`} fill="#FFFDF4" opacity={0.5} />
          <path d={`M ${PX},${PY + PH - 160} L ${PX + PW},${PY + PH - 130} L ${PX + PW},${PY + PH} L ${PX},${PY + PH} Z`} fill={C30.kamiKage} opacity={0.5} />

          {/* 見出し。二〇二六年 二月 */}
          <text x={PX + 58} y={PY + 118} fontFamily={SEKAI_SERIF} fontSize={92} fontWeight={700} fill={C30.sumi}>
            二〇二六年 二月
          </text>
          <text x={PX + 58} y={PY + 176} fontFamily={SEKAI_FONT} fontSize={34} fill={C30.pers}>
            ペルシア暦 一四〇四年 バフマン／エスファンド
          </text>
          <path d={`M ${PX + 58},${PY + 206} L ${PX + PW - 58},${PY + 206}`} stroke={C30.sumi} strokeWidth={5} />

          {/* 曜日の見出し */}
          {["日", "月", "火", "水", "木", "金", "土"].map((wd, c) => (
            <g key={`wd${c}`}>
              <rect x={CL + c * CW} y={CT - 58} width={CW} height={58} fill={c === 0 ? "#F2DFDC" : c === 6 ? "#DCE6F2" : "#EAE6D8"} />
              <text
                x={CL + c * CW + CW / 2}
                y={CT - 16}
                fontFamily={SEKAI_SERIF}
                fontSize={38}
                fontWeight={700}
                fill={c === 0 ? C30.nichi : c === 6 ? C30.do : C30.sumi}
                textAnchor="middle"
              >
                {wd}
              </text>
            </g>
          ))}
          {/* 枡 */}
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 7 }, (_, c) => {
              const d = r * 7 + c + 1;
              const isTarget = d === 28;
              return (
                <g key={`cl${r}-${c}`} opacity={easeOut(seg(f, 6 + (r * 7 + c) * 0.9, 24 + (r * 7 + c) * 0.9))}>
                  <rect x={CL + c * CW} y={CT + r * CH} width={CW} height={CH} fill="none" stroke={C30.kamiEdge} strokeWidth={2.6} />
                  <text
                    x={CL + c * CW + 20}
                    y={CT + r * CH + 62}
                    fontFamily={SEKAI_SERIF}
                    fontSize={54}
                    fontWeight={isTarget ? 700 : 400}
                    fill={c === 0 ? C30.nichi : c === 6 ? C30.do : C30.sumi}
                  >
                    {d}
                  </text>
                  {/* ペルシア暦の併記 */}
                  <text
                    x={CL + c * CW + 20}
                    y={CT + r * CH + 110}
                    fontFamily={SEKAI_FONT}
                    fontSize={24}
                    fill={C30.pers}
                  >
                    {pday(d)}
                  </text>
                  {/* 月が替わる日だけ区切りの印 */}
                  {d === 20 && <path d={`M ${CL + c * CW},${CT + r * CH} L ${CL + c * CW},${CT + (r + 1) * CH}`} stroke={C30.pers} strokeWidth={6} />}
                </g>
              );
            })
          )}
          {/* 28日に引かれた朱の丸。1周ぶんを stroke-dash で描き進める */}
          <g opacity={maru > 0 ? 1 : 0}>
            <circle
              cx={mx}
              cy={my}
              r={78}
              fill="none"
              stroke={C30.shu}
              strokeWidth={13}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 78 * maru} ${2 * Math.PI * 78}`}
              transform={`rotate(-96 ${mx} ${my})`}
              opacity={0.95}
            />
            <circle
              cx={mx + 4}
              cy={my + 3}
              r={86}
              fill="none"
              stroke={C30.shu}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 86 * Math.max(0, maru - 0.25)} ${2 * Math.PI * 86}`}
              transform={`rotate(-80 ${mx} ${my})`}
              opacity={0.6}
            />
          </g>
          {/* 紙に落ちるペンの影 */}
          <path d={`M ${mx + 150},${my - 40} L ${mx + 420},${my - 330} L ${mx + 470},${my - 300} L ${mx + 190},${my - 10} Z`} fill="#8A8070" opacity={0.26 * maru} />
        </g>

        {/* ── ペン。朱を引いたところ ── */}
        <g transform={`translate(${mx + 96} ${my - 24}) rotate(-36)`} opacity={easeOut(seg(f, 30, 48))}>
          <path d="M 0,0 L 0,-400" stroke={C30.pen} strokeWidth={30} strokeLinecap="round" />
          <path d="M -10,-50 L -10,-370" stroke="#3C434C" strokeWidth={7} opacity={0.8} />
          <rect x={-11} y={-356} width={22} height={130} rx={9} fill={C30.penKin} />
          <path d="M -16,0 L 16,0 L 5,62 L -5,62 Z" fill={C30.penKin} />
          <path d="M -5,62 L 5,62 L 0,88 Z" fill={C30.shu} />
          <circle cx={0} cy={90} r={6} fill={C30.shu} />
        </g>

        {/* ── 事件: 朱の丸が引かれた瞬間、紙の外が暗くなる ── */}
        <g opacity={dark}>
          <rect x={-200} y={0} width={W + 400} height={PY} fill="#030810" opacity={0.86} />
          <rect x={-200} y={PY + PH} width={W + 400} height={H - PY - PH} fill="#030810" opacity={0.86} />
          <rect x={-200} y={PY} width={PX + 200} height={PH} fill="#030810" opacity={0.86} />
          <rect x={PX + PW} y={PY} width={W + 200 - PX - PW} height={PH} fill="#030810" opacity={0.86} />
          {/* 紙の縁にだけ光が残る */}
          <rect x={PX} y={PY} width={PW} height={PH} fill="none" stroke={C.newsLit} strokeWidth={3} opacity={0.4} />
        </g>
        {/* 紙の中も、朱の丸の外側がわずかに沈む */}
        <g opacity={dark * 0.5}>
          <defs>
            <radialGradient id={`${uid}-focus`} cx="86%" cy="82%" r="58%">
              <stop offset="0%" stopColor="#030810" stopOpacity={0} />
              <stop offset="100%" stopColor="#030810" stopOpacity={0.7} />
            </radialGradient>
          </defs>
          <rect x={PX} y={PY} width={PW} height={PH} fill={`url(#${uid}-focus)`} />
        </g>
      </ColdStage>
    </Cam>
  );
};

export const GROUP_C: Record<string, SekaiArt> = {
  sekai_21: S21,
  sekai_22: S22,
  sekai_23: S23,
  sekai_24: S24,
  sekai_25: S25,
  sekai_26: S26,
  sekai_27: S27,
  sekai_28: S28,
  sekai_29: S29,
  sekai_30: S30,
};
